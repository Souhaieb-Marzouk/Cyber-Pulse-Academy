// ── Red-Line Room · traffic simulation + ACL engine ────────────────────
// Ported 1:1 from the original framework lab (src/lib/lab/engine.ts
// simulation section). Same decision logic, same step wording, same verdicts.
"use strict";

(function () {
  var D = window.RL_DATA;

  var ACL_DST_CLASS = { records: "trusted", staffpc: "trusted", adminws: "trusted" };

  function aclDecide(env, src, dst, port, proto) {
    var dstClass = ACL_DST_CLASS[dst] || dst;
    for (var i = 0; i < env.acl.length; i++) {
      var r = env.acl[i];
      var srcOk = r.src === "any" || r.src === src;
      var dstOk = r.dst === "any" || r.dst === dstClass;
      var portOk = r.port === "any" || r.port === port;
      var protoOk = r.proto === "ip" || r.proto === proto;
      if (srcOk && dstOk && portOk && protoOk) {
        return { permitted: r.action === "permit", rule: r, implicit: false };
      }
    }
    return { permitted: false, rule: null, implicit: true };
  }

  function ruleLabel(r) {
    return r.action + " " + r.proto + " " + r.src + " → " + r.dst + (r.port !== "any" ? ":" + r.port : "");
  }

  // ── Traffic simulation ────────────────────────────────────────────────
  function simulate(env, s) {
    var steps = [];
    var final = "ALLOWED";

    function push(label, status, detail) {
      steps.push({ label: label, status: status, detail: detail });
    }

    // special: NAC kiosk
    if (s.special === "kiosk") {
      push("NAC · 802.1X on student/public networks", env.nac.guestDot1x ? "ok" : "bad",
        env.nac.guestDot1x ? "Port authenticator challenges the kiosk (EAPOL)…" : "Wall port is wide open — no 802.1X on this network.");
      if (!env.nac.guestDot1x) {
        push("Port decision", "bad", "Unauthenticated kiosk receives a full staff-side DHCP lease. It is now an unmonitored workstation on the trusted network.");
        return { sampleId: s.id, steps: steps, final: "ALLOWED" };
      }
      push("Supplicant check", "info", "No EAPOL response within 30 s — the kiosk has no 802.1X supplicant.");
      if (env.nac.quarantine) {
        push("Placement", "ok", "Port authenticated into the QUARANTINE VLAN: remediation portal only. The unknown device is contained, not connected.");
        return { sampleId: s.id, steps: steps, final: "QUARANTINED" };
      }
      push("Placement", "blocked", "Authentication fails and no quarantine VLAN exists — the device gets no network access at all. (Safer, but unmanaged devices can't even self-remediate.)");
      return { sampleId: s.id, steps: steps, final: "BLOCKED" };
    }

    // special: VPN key
    if (s.special === "vpn") {
      push("Key management · VPN authentication", env.keys["vpnpsk"] === "fixed" ? "ok" : "bad",
        env.keys["vpnpsk"] === "fixed" ? "Gateway demands a per-user certificate now." : "Gateway still accepts the 2023 pre-shared key — one secret, 40 contractors, forever.");
      if (env.keys["vpnpsk"] === "fixed") {
        push("Authentication", "blocked", "Old shared key REJECTED: it was rotated, so everyone who ever copied it is invalid. The contractor must enroll a personal certificate.");
        return { sampleId: s.id, steps: steps, final: "REJECTED" };
      }
      push("Authentication", "bad", "Authentication ACCEPTED with the shared key. Offboarding never revokes it; rotation never happened. This is a standing back door.");
      return { sampleId: s.id, steps: steps, final: "ALLOWED" };
    }

    // special: TLS certificate check
    if (s.special === "cert") {
      push("Key management · TLS certificate", env.keys["webcert"] === "fixed" ? "ok" : "bad",
        env.keys["webcert"] === "fixed" ? "Certificate chain valid — renewed and installed, expiry monitored." : "Certificate chain EXPIRED 23 days ago.");
      if (env.keys["webcert"] === "fixed") {
        push("Trust decision", "ok", "Visitor's browser shows a padlock. Trust preserved.");
        return { sampleId: s.id, steps: steps, final: "ALLOWED" };
      }
      push("Trust decision", "warn", "Every visitor sees 'Your connection is not private'. Some leave; support tickets pile up; the site's credibility burns. This is what skipped key maintenance looks like.");
      return { sampleId: s.id, steps: steps, final: "DEGRADED" };
    }

    // egress filtering first (guest/staff going OUT)
    if (s.dst === "internet") {
      var net = s.src === "guest" ? "guest" : "staff";
      var domainInfo =
        s.id === "S-MALWARE" ? { domain: "update-cdn-metrics.example", category: "malware" } :
        s.id === "S-BIO" ? { domain: "fieldstation.archive.example.edu", category: "streaming" } :
        { domain: "training-video.example", category: "streaming" };
      if (net === "guest" && !env.filters.dnsGuest) {
        push("URL/DNS filtering · guest", "bad", "No DNS filtering on the guest network — every domain resolves, including the ones you'd never allow.");
      } else {
        var blocked = net === "guest" ? env.filters.blockedGuest : env.filters.blockedStaff;
        var allowHit = s.id === "S-BIO" && env.filters.allowlist.includes("bioarchive");
        if (allowHit) {
          push("URL/DNS filtering · allowlist", "ok", "Allowlist exception hit: fieldstation.archive.example.edu is course material — the streaming category is overridden.");
        } else if (blocked.includes(domainInfo.category)) {
          push("URL/DNS filtering · " + net, "blocked", "Domain " + domainInfo.domain + " (category: " + domainInfo.category + ") is blocked at the resolver" + (s.attack ? " — the fetch never happens" : "") + ".");
          if (!s.attack) push("Policy check", "warn", "But this is legitimate " + net + " traffic — the category policy is over-blocking. Users will demand exceptions until one is done right (allowlist) or the control gets disabled.");
          return { sampleId: s.id, steps: steps, final: "BLOCKED" };
        } else if (s.attack) {
          push("URL/DNS filtering · " + net, "bad", domainInfo.domain + " (category: " + domainInfo.category + ") is NOT in the blocked set — the policy still carries its legacy tuning.");
        } else {
          push("URL/DNS filtering · " + net, "ok", domainInfo.category + " category is not blocked for " + net + " — policy matches business need.");
        }
      }
      if (s.id === "S-BIO" && env.filters.dnsGuest && !env.filters.exeBlockGuest) {
        push("Content filtering", "info", "Executable downloads from guest Wi-Fi are not blocked (content filtering off) — acceptable per policy, but worth knowing.");
      }
    }

    // ACL at the border
    var decided = aclDecide(env, s.src, s.dst, s.port, s.proto);
    if (decided.rule) {
      push("Border ACL · first match", decided.permitted ? "ok" : "blocked",
        'Rule "' + ruleLabel(decided.rule) + '" matches' + (decided.rule.log ? " (logged)" : "") + " → " + (decided.permitted ? "PERMIT" : "DENY") + ".");
      if (decided.rule.action === "permit" && decided.rule.src === "any" && decided.rule.dst === "any" && decided.rule.port === "any") {
        push("Policy check", "warn", "It matched only because of the 2016 blanket 'permit ip any any' — that is luck, not a policy. The implicit deny is never reached.");
      }
    } else {
      push("Border ACL · first match", "blocked", "No rule matched → the IMPLICIT DENY drops the packet. The default of every ACL is silence.");
    }
    if (!decided.permitted) {
      return { sampleId: s.id, steps: steps, final: "BLOCKED" };
    }

    // inbound zone checks
    if (s.src === "internet" && (s.dst === "web" || s.dst === "mail")) {
      var dev = s.dst === "web" ? "webserver" : "mailrelay";
      if (env.zones[dev] === "dmz") {
        push("Zone placement", "ok", (s.dst === "web" ? "www" : "Mail gateway") + " sits in the SCREENED SUBNET — the visitor lands in the buffer zone, not the staff LAN.");
      } else {
        push("Zone placement", "bad", (s.dst === "web" ? "www" : "Mail gateway") + " lives INSIDE the trusted staff network. This connection is legitimate, but its destination is misplaced: one web exploit puts an attacker beside the records server.");
        final = "DEGRADED";
      }
    }

    // management-plane host checks
    if (s.dst === "mgmt" && s.src === "adminws") {
      if (!env.hardening["cs1-telnet"]) push("Device hardening · CS1", "warn", "SSH works — but Telnet is still listening on the same switch. Cleartext management remains one sniff away.");
      if (!env.hardening["cs1-creds"]) push("Device hardening · CS1", "warn", "Factory credentials are still set: SSH that reaches a login that 'admin/admin' opens protects nothing.");
      if (env.hardening["cs1-telnet"] && env.hardening["cs1-creds"]) {
        push("Device hardening · CS1", "ok", "SSH-only management, unique credentials — the session is exactly what the policy names.");
      } else {
        final = "DEGRADED";
      }
    }

    // attack samples that got permitted all the way = owned
    // (a denied ACL already early-returned BLOCKED above, so `final` here is ALLOWED or DEGRADED)
    if (s.attack) {
      if (s.id === "S-TELNET-EXT" || s.id === "S-TELNET-INT") {
        var telnetOn = s.id === "S-TELNET-EXT" ? !env.hardening["gw1-telnet"] : !env.hardening["cs1-telnet"];
        if (telnetOn) {
          push("Device hardening", "bad", "Port 23 ANSWERS — a Telnet banner is presented.");
          var creds = s.id === "S-TELNET-EXT" ? env.hardening["gw1-creds"] : env.hardening["cs1-creds"];
          if (!creds) push("Device hardening", "bad", "Factory credentials still set: the attacker logs in with admin/admin. Full device compromise in under a minute.");
          final = "ALLOWED";
        } else {
          push("Device hardening", "blocked", "Port 23 refused: Telnet is disabled on this device. The ACL missed, the host didn't — defense in depth.");
          final = "BLOCKED";
        }
      }
    }

    return { sampleId: s.id, steps: steps, final: final };
  }

  function verdictMatchesPrediction(final, prediction) {
    if (prediction === "blocked") return final === "BLOCKED" || final === "QUARANTINED" || final === "REJECTED";
    if (prediction === "allowed") return final === "ALLOWED";
    if (prediction === "degraded") return final === "DEGRADED";
    return false;
  }

  function isTargetZones(env) {
    return Object.keys(D.TARGET_ZONES).every(function (id) { return env.zones[id] === D.TARGET_ZONES[id]; });
  }

  window.RL_SIM = {
    aclDecide: aclDecide,
    simulate: simulate,
    verdictMatchesPrediction: verdictMatchesPrediction,
    isTargetZones: isTargetZones,
  };
})();
