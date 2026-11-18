// ── Red-Line Room · objectives (machine-checked, Phase B blueprint) ────
// Ported 1:1 from the original framework lab (src/lib/lab/objectives.ts).
// Every check, near-miss diagnostic, hint tier and feedback message is identical.
"use strict";

(function () {
  var D = window.RL_DATA;

  function allHardening(s) {
    return D.HARDENING.every(function (h) { return s.env.hardening[h.id]; });
  }

  function nacFull(s) {
    return s.env.nac.guestDot1x && s.env.nac.posture === "agentless" && s.env.nac.quarantine && s.env.nac.mabPrinters;
  }

  function keysAll(s) {
    return D.KEY_ITEMS.every(function (k) { return s.env.keys[k.id] === "fixed"; });
  }

  function filtersFull(s) {
    var f = s.env.filters;
    var guestOk = ["malware", "phishing", "gambling", "streaming"].every(function (c) { return f.blockedGuest.includes(c); });
    var staffOk = ["malware", "phishing"].every(function (c) { return f.blockedStaff.includes(c); });
    var staffNotOver = !f.blockedStaff.some(function (c) { return ["gambling", "streaming", "social"].includes(c); });
    return f.dnsGuest && guestOk && staffOk && staffNotOver && f.allowlist.includes("bioarchive") && f.blocklist.includes("gradesportal") && f.exeBlockGuest;
  }

  function aclMatchesTarget(s) {
    var got = s.env.acl.map(function (r) { return { action: r.action, proto: r.proto, src: r.src, dst: r.dst, port: r.port }; });
    if (got.length !== D.ACL_TARGET.length) return false;
    return got.every(function (r, i) {
      var t = D.ACL_TARGET[i];
      return r.action === t.action && r.proto === t.proto && r.src === t.src && r.dst === t.dst && r.port === t.port;
    });
  }

  function aclDiagnostics(s) {
    var got = s.env.acl.map(function (r) { return { action: r.action, proto: r.proto, src: r.src, dst: r.dst, port: r.port }; });
    if (got.length === 1 && got[0].src === "any" && got[0].dst === "any" && got[0].port === "any" && got[0].action === "permit")
      return "The 2016 blanket 'permit ip any any' is still the only rule — every packet matches it and nothing below it is ever read.";
    if (got.length !== D.ACL_TARGET.length)
      return "The policy requires " + D.ACL_TARGET.length + " rules in order; the drawing currently has " + got.length + ". Re-read the policy brief line by line.";
    var firstDiff = -1;
    for (var i = 0; i < got.length; i++) {
      var r = got[i], t = D.ACL_TARGET[i];
      if (!(r.action === t.action && r.proto === t.proto && r.src === t.src && r.dst === t.dst && r.port === t.port)) { firstDiff = i; break; }
    }
    if (firstDiff >= 0) {
      var t = D.ACL_TARGET[firstDiff];
      return "First divergence at line " + (firstDiff + 1) + ': the policy brief requires "' + t.action + " " + t.proto + " " + t.src + " → " + t.dst + (t.port !== "any" ? ":" + t.port : "") + '" there. Remember: specific rules above general ones — the admin-workstation permit must precede the management deny, and the staff permit must be last.';
    }
    return null;
  }

  function auditAllExpected(s) {
    if (!s.audit) return false;
    return D.TRAFFIC_SAMPLES.every(function (t) { return s.audit.results[t.id] === t.expected; });
  }

  function predictSetOk(s, ids) {
    return ids.every(function (id) {
      var sample = D.TRAFFIC_SAMPLES.find(function (t) { return t.id === id; });
      var p = s.predictions[id];
      var run = s.runs[id];
      return !!sample && !!p && !!run && window.RL_SIM.verdictMatchesPrediction(run.final, p);
    });
  }

  var PREDICT_HARD = D.TRAFFIC_SAMPLES.filter(function (t) { return t.predict; }).map(function (t) { return t.id; });

  // ── MEDIUM (12 objectives) ─────────────────────────────────────────────
  var OBJECTIVES_MEDIUM = [
    {
      id: "OBJ-M1",
      pillar: "P1",
      topic: "dmz",
      focus: "Re-read the Field Manual's 'Screened subnet (DMZ)' section, then re-stamp WWW and MAIL on the Drawing Board.",
      title: "Move the public services into the screened subnet on the drawing.",
      anchor: "Lesson topic: screened subnet — placement of www + mail gateway (N10-009 4.5)",
      how: "On the Drawing Board, stamp each device with its zone. Public-facing services get their own buffer zone between the Internet and the staff LAN.",
      hints: [
        "Click the WWW chip on the drawing — a zone menu opens.",
        "WWW and MAIL both belong in the SCREENED SUBNET (DMZ) — the buffer between untrusted and trusted.",
        "Click WWW → choose 'Screened subnet'. Click MAIL → choose 'Screened subnet'.",
      ],
      check: function (s) { return s.env.zones["webserver"] === "dmz" && s.env.zones["mailrelay"] === "dmz"; },
      feedback: "The screened subnet assumes the public server WILL be attacked (T1190). Breach it there and the attacker is in a one-room buffer apartment — not beside the student records server on the staff VLAN.",
    },
    {
      id: "OBJ-M2",
      pillar: "P1",
      topic: "verify",
      focus: "Re-draft the defense-chain match in the Field Manual — the seven purposes map one-to-one onto the seven families.",
      title: "Draft the defense chain: pair all seven control families with their purpose in the Field Manual.",
      anchor: "Lesson topic: all seven security features — conceptual map (defense in depth)",
      how: "Open the Field Manual tab and find 'Draft the defense chain'. Click a control chip, then the purpose line it belongs to.",
      hints: [
        "Each control has exactly one purpose line; a wrong pair just snaps back.",
        "Start with 'Screened subnet' — its purpose mentions a buffer zone.",
        "Work top-down: hardening→defaults, NAC→joining, keys→secrets, ACL→traffic, filtering→web, zones→trust labels, DMZ→buffer.",
      ],
      check: function (s) { return D.MATCH_PAIRS.every(function (p) { return s.records.matchGame[p.id] === p.id; }); },
      feedback: "That map is the chapter: hardening, NAC, keys, ACLs, filtering, zones, screened subnet — each guards a different step of the same path. Attackers must beat ALL of them; you must only maintain them.",
    },
    {
      id: "OBJ-M3",
      pillar: "P4",
      topic: "hard",
      focus: "Sweep the Hardening bay in the Control Catalog — the three factory-credential rows.",
      title: "Scrub the defaults: replace factory credentials on all three network devices.",
      anchor: "Device hardening — change default credentials (M1027; T1078.001)",
      how: "Open the Control Catalog → Hardening bay. All three devices (GW1, CS1, WLC1) still carry factory passwords.",
      hints: [
        "The Hardening bay lists controls per device — filter by device with the tabs.",
        "You're looking for the three 'factory credentials' rows.",
        "Toggle 'Replace factory admin credentials' on GW1, CS1 and WLC1.",
      ],
      check: function (s) { return !!s.env.hardening["gw1-creds"] && !!s.env.hardening["cs1-creds"] && !!s.env.hardening["wlc1-creds"]; },
      feedback: "Default credentials (T1078.001) are published by vendors and indexed by search engines — attacking them costs nothing. Unique credentials are the cheapest control in this entire lab.",
    },
    {
      id: "OBJ-M4",
      pillar: "P4",
      topic: "hard",
      focus: "Sweep the Hardening bay — Telnet on GW1+CS1 and the web admin GUI are cleartext doors.",
      title: "Kill cleartext management: SSH-only on the router and switch, web GUI closed.",
      anchor: "Device hardening — disable Telnet/HTTP mgmt (M1054; T1021 Remote Services exposure)",
      how: "Still in the Hardening bay: Telnet and the web admin GUI are cleartext doors onto the management plane.",
      hints: [
        "Telnet sends every keystroke — passwords included — in plaintext.",
        "Three rows: Telnet on GW1, Telnet on CS1, web admin GUI on GW1.",
        "Toggle 'Disable Telnet — management over SSH only' on both devices and 'Close the web admin GUI' on GW1.",
      ],
      check: function (s) { return !!s.env.hardening["gw1-telnet"] && !!s.env.hardening["cs1-telnet"] && !!s.env.hardening["gw1-webadmin"]; },
      feedback: "SSH encrypts management sessions; Telnet hands them to anyone on the path. Closing unused management services (GUI, Telnet) is pure risk removal — nothing legitimate loses anything.",
    },
    {
      id: "OBJ-M5",
      pillar: "P4",
      topic: "hard",
      focus: "Same bay: SNMPv1, unused ports, config backups and firmware — hardening is subtraction.",
      title: "Close what you don't use: SNMPv1 off, unused ports shut, backups + firmware on the switch.",
      anchor: "Device hardening — services/ports/firmware/backups (M1051, M1028)",
      how: "Same bay: legacy SNMPv1 on the border, open wall ports on the switch, and the switch is 2 years behind on firmware with no config backups.",
      hints: [
        "SNMPv1's 'public' community is effectively a world-readable password.",
        "An open wall port in the lobby is an unauthenticated network jack.",
        "Four toggles: 'Disable legacy SNMPv1' (GW1), 'Shut unused switch ports', 'Schedule automatic config backups', 'Apply pending firmware updates' (CS1).",
      ],
      check: function (s) { return !!s.env.hardening["gw1-snmp"] && !!s.env.hardening["cs1-ports"] && !!s.env.hardening["cs1-backup"] && !!s.env.hardening["cs1-firmware"]; },
      feedback: "Hardening is subtraction: every listening service and open port is attack surface someone else maintains. Firmware (M1051) patches known holes; backups make your next change reversible.",
    },
    {
      id: "OBJ-M6",
      pillar: "P4",
      topic: "nac",
      focus: "Work the NAC Desk: 802.1X, agentless posture, quarantine VLAN, MAB — in that order.",
      title: "Gate the network: 802.1X on student/public networks, agentless posture, quarantine VLAN, MAB for printers.",
      anchor: "NAC — 802.1X, posture assessment, quarantine, MAB (N10-009 4.4)",
      how: "Control Catalog → NAC bay. Choose the posture approach that fits 9,000 unmanaged BYOD devices, then enable admission control and the safety net.",
      hints: [
        "You cannot install agents on student phones — pick the posture mode that needs no software install.",
        "802.1X alone leaves unauthenticated devices with nowhere to go; NAC places devices, it should have somewhere to PUT the unhealthy ones.",
        "Set posture to 'Agentless (web portal)', then toggle 802.1X on, Quarantine VLAN on, and MAB for printers on.",
      ],
      check: nacFull,
      feedback: "Admission control in one paragraph: 802.1X asks 'who are you?' (supplicant→authenticator→RADIUS), agentless posture asks 'are you healthy?' without demanding software, quarantine holds the unknowns, and MAB is the weaker fallback door for gear that can't speak 802.1X — like printers.",
    },
    {
      id: "OBJ-M7",
      pillar: "P4",
      topic: "keys",
      focus: "Clear the Key Vault: renew, rotate, revoke, vault, migrate — every card must turn mint.",
      title: "Clean the vault: renew the web cert, rotate the VPN key, revoke the ex-admin device, vault the private key, migrate Wi-Fi to Enterprise.",
      anchor: "Key management — lifecycle: renew / rotate / revoke / store (M1041, M1032, M1047; T1552.004)",
      how: "Control Catalog → Key Vault. Five secrets are broken in five classic ways. Fix each with its lifecycle action.",
      hints: [
        "One item is expired, one is shared by 40 people, one belongs to someone who left, one sits in a repo, one is a campus-wide Wi-Fi passphrase.",
        "The actions ARE the vocabulary: renew, rotate, revoke, vault, migrate.",
        "Press the action button on each of the five vault cards — the card turns mint when its lifecycle step is done.",
      ],
      check: keysAll,
      feedback: "Every key has a lifecycle, not a status. Renewal bounds expiry, rotation bounds 'whoever ever had it', revocation is how offboarding works, and secure storage stops the next leak (T1552.004 — attackers hunt keys directly).",
    },
    {
      id: "OBJ-M8",
      pillar: "P4",
      topic: "acl",
      focus: "Re-read the policy brief above the ACL Table and rebuild the seven rules in order.",
      title: "Write the border ACL: replace 'permit ip any any' with the 7-rule policy, in order.",
      anchor: "ACL — first-match order, implicit deny, least privilege (M1037; N10-009 4.3)",
      how: "Control Catalog → ACL Table. The policy brief: world gets 443→www and 25→mail; admin workstation gets SSH(22)→mgmt; everything→mgmt denied after that; guest→trusted denied (logged); guest→internet permitted; staff→any permitted last.",
      hints: [
        "First match wins: the packet reads rules top-down and stops at the first line that matches.",
        "Specific before general: the admin-workstation SSH permit MUST sit above the 'deny any→mgmt'; the staff 'permit any' MUST sit last, above only the implicit deny.",
        "Delete the blanket rule, then add in order: 1 permit tcp any→web:443 · 2 permit tcp any→mail:25 · 3 permit tcp adminws→mgmt:22 · 4 deny ip any→mgmt · 5 deny ip guest→trusted (log on) · 6 permit ip guest→internet · 7 permit ip staff→any.",
      ],
      check: aclMatchesTarget,
      nearMiss: aclDiagnostics,
      feedback: "Read any packet against this list top-down: the world touches exactly two ports in the DMZ, management accepts SSH from exactly one workstation, untrusted sources die at the explicit guest deny (with a log line as evidence), staff and guests reach the Internet, and everything unmatched falls into the implicit deny — the default silence that makes the whole list mean something.",
    },
    {
      id: "OBJ-M9",
      pillar: "P3",
      topic: "filter",
      focus: "Tune the Filter Station, then re-run the 12-sample audit until every verdict matches.",
      title: "Tune the Filter Station, then prove the design: fix every audit mismatch until the 12-sample audit is fully green.",
      anchor: "URL/content filtering — categories, allowlist/blocklist, content filtering (M1021/M1037) + verification of all controls",
      how: "Run the full audit in the Traffic Bay. S-MALWARE exposes the missing guest DNS filtering; S-BIO exposes the over-blocked streaming category. Fix the Filter Station accordingly, then re-run until 12/12.",
      hints: [
        "Open S-MALWARE's trace: the red step names the Filter Station — guest DNS filtering is off and the malware category isn't blocked.",
        "Filter Station: enable guest DNS filtering; block malware/phishing/gambling/streaming for GUESTS; block ONLY malware/phishing for STAFF (over-blocking staff streaming fails S-STAFF-STREAM).",
        "S-BIO needs the allowlist exception for fieldstation.archive.example.edu; also blocklist the grades-portal typo-squat, switch on guest executable blocking, then re-run the audit.",
      ],
      check: auditAllExpected,
      nearMiss: function (s) {
        if (!s.audit) return "Run the full audit first — the audit sheet is the evidence this spec is judged on.";
        var bad = D.TRAFFIC_SAMPLES.filter(function (t) { return s.audit.results[t.id] !== t.expected; });
        if (bad.length) return bad.length + " verdict" + (bad.length > 1 ? "s" : "") + " still off (" + bad.map(function (b) { return b.id; }).join(", ") + "). Open each trace — the red step names the control that didn't hold.";
        return null;
      },
      feedback: "Filtering is a two-sided craft: block the malicious categories (malware/phishing everywhere, gambling/streaming for guests), leave business needs alone (staff streaming), and repair false positives with the allowlist scalpel — not by gutting the policy. And the audit rig is the defender's detection story: you don't assume controls work, you watch them decide.",
    },
    {
      id: "OBJ-M10",
      pillar: "P2",
      topic: "verify",
      focus: "Re-tag the seven evidence snippets in the Field Manual — look for the key noun in each artifact.",
      title: "Recognize it in the wild: tag all 7 evidence snippets in the Field Manual with their control family.",
      anchor: "P2 Recognize — realistic artifacts mapped to the seven families",
      how: "Field Manual → 'Recognize it in the wild'. Each snippet is a real-looking log line or finding; name the family it belongs to.",
      hints: [
        "Look for the KEY NOUN: Telnet→hardening, malware domain→filtering, certificate→keys, quarantine→NAC, rule→ACL, VLAN placement→screened subnet, trust label→zones.",
        "Snippet T6 is about WHERE the web server sits, not what it runs.",
        "T7 is about a label ('trusted') that was applied wrongly — that's the zones family.",
      ],
      check: function (s) { return D.TAG_SNIPPETS.every(function (t) { return s.records.tagGame[t.id] === t.family; }); },
      feedback: "Real triage is exactly this: read the artifact, name the failing control. The seven families are your filing system for everything a scanner, log or user complaint will ever hand you.",
    },
    {
      id: "OBJ-M11",
      pillar: "P2",
      topic: "verify",
      focus: "In the Traffic Bay, commit predictions before running the flagged samples — model, then prove.",
      title: "Predict-then-prove: predict the verdicts for the kiosk plug-in and the external Telnet probe BEFORE running them, then run to confirm.",
      anchor: "P2/P3 — reasoning about control behavior before evidence",
      how: "Traffic Bay: two samples have a 'predict' step. Commit a verdict for the remediated network first (no peeking — predict before you run), then press Run.",
      hints: [
        "Predict what WILL happen once your remediation is complete.",
        "The kiosk meets 802.1X; the Telnet probe meets an ACL line AND a disabled service.",
        "Kiosk → 'stopped' (quarantine). Telnet probe → 'stopped'.",
      ],
      check: function (s) { return predictSetOk(s, ["S-KIOSK", "S-TELNET-EXT"]); },
      nearMiss: function (s) {
        var p1 = s.predictions["S-KIOSK"];
        var p2 = s.predictions["S-TELNET-EXT"];
        if (!p1 || !p2) return "Record both predictions before running the samples — the point is reasoning ahead of evidence.";
        if (p1 === "allowed") return "The kiosk is unauthenticated: with NAC on, it lands in quarantine, never on the staff LAN.";
        if (p2 === "allowed") return "Telnet toward the border dies twice: the ACL denies the path, and the service itself is disabled.";
        return null;
      },
      feedback: "Predicting before running is how exam scenarios (and real incidents) are won: you modeled the controls' behavior in your head, then let the rig confirm it. That's applied mastery, not recall.",
    },
    {
      id: "OBJ-M12",
      pillar: "P3",
      topic: "nac",
      focus: "Re-read the nac.log field notes in the Traffic Bay — what did the port wait for?",
      title: "Diagnose from the NAC log: answer the quarantine question in the Traffic Bay field notes.",
      anchor: "NAC detection — reading 802.1X/NAC event evidence",
      how: "After OBJ-M6, the Traffic Bay gains a field-notes card with a simulated nac.log about the lobby kiosk. Read the four lines and answer why the kiosk was quarantined.",
      hints: [
        "Read the timestamps: what did the switch wait for, and what never arrived?",
        "'no EAPOL response' — EAPOL is the 802.1X handshake the supplicant would send.",
        "The kiosk has no supplicant at all — the answer about posture scans, blocklists and DHCP are distractors.",
      ],
      check: function (s) { return s.records.nacQuiz === "1"; },
      nearMiss: function (s) { return s.records.nacQuiz === "0" ? "Posture scans happen AFTER authentication succeeds. This kiosk never even authenticated — reread the second log line." : null; },
      feedback: "Detection work is reading evidence precisely: the port waited 30 s for an 802.1X supplicant that never spoke, then placed the port in quarantine. Supplicant-less devices are exactly why MAB exists — for the printers of the world, not the kiosks of the world.",
    },
  ];

  // ── HARD (9 objectives) ────────────────────────────────────────────────
  var OBJECTIVES_HARD = [
    {
      id: "OBJ-H1",
      pillar: "P2",
      topic: "verify",
      focus: "Re-triage the findings memo in the Evidence Pack — every real gap must name one of the seven families.",
      title: "Triage the 10-item findings memo in the Evidence Pack: mark every item GAP or NO-GAP — two items are red herrings.",
      anchor: "Full lesson area — findings triage across all seven families",
      how: "Evidence Pack → Findings memo. An auditor hands you 10 findings; not all are real. Classify each.",
      hints: [
        "A 'finding' must be an actual weakness in one of the seven families. Good hygiene is not a gap.",
        "The two red herrings describe things that are FINE as stated.",
        "WPA3 on guest Wi-Fi and fully patched catalog terminals are the NO-GAP items.",
      ],
      check: function (s) { return D.MEMO_ITEMS.every(function (m) { return s.records.memo[m.id] === m.truth; }); },
      nearMiss: function (s) {
        var bad = D.MEMO_ITEMS.filter(function (m) { return s.records.memo[m.id] && s.records.memo[m.id] !== m.truth; });
        if (bad.length === 1 && (bad[0].id === "M8" || bad[0].id === "M9")) return bad[0].id + " is a red herring: reread it — it describes good hygiene or a non-weakness, not a gap in the seven families.";
        if (bad.length === 1 && (bad[0].id === "M4" || bad[0].id === "M6")) return bad[0].id + " looks boring but is the core of the finding: a blanket ACL and a misplaced public server are two worst-case gaps.";
        if (bad.length) return bad.length + " classification" + (bad.length > 1 ? "s" : "") + " off. Each item must map to one of the seven families — if it names none, it's a NO-GAP.";
        return null;
      },
      feedback: "Triage is the first skill of an audit response: separate signal from padding. The real gaps here cover all seven families — which is exactly how a flat, defaulted network looks from the outside: every layer missing at once.",
    },
    {
      id: "OBJ-H2",
      pillar: "P4",
      topic: "verify",
      focus: "Use the audit rig as your oracle — every red or DEGRADED verdict names the family that isn't done yet.",
      title: "Execute the full remediation: bring ALL seven families to their target state in one pass.",
      anchor: "Every lesson topic — zones, hardening, NAC, keys, ACL, filtering at target state",
      how: "No checklist this time. Use the memo (OBJ-H1) as your spec and the drawing, catalog bays and vault to fix everything: zones, all 11 hardening controls, the NAC stance, all five keys, the filter policy (with allowlist + blocklist + content filtering) and the 7-rule ACL.",
      hints: [
        "The audit rig is your oracle — every red or DEGRADED verdict names the family that isn't done.",
        "Filter policy needs BOTH directions: block malware/phishing (+gambling/streaming) for guests, malware/phishing ONLY for staff, allowlist the biology archive, blocklist the typo-squat, and block executable downloads on guest.",
        "NAC posture must be agentless; ACL must be the exact 7 rules in order; all 5 vault cards mint-green; all zones per policy.",
      ],
      check: function (s) { return window.RL_SIM.isTargetZones(s.env) && allHardening(s) && nacFull(s) && keysAll(s) && filtersFull(s) && aclMatchesTarget(s); },
      nearMiss: function (s) {
        if (!window.RL_SIM.isTargetZones(s.env)) return "Zones aren't done: www and mail belong in the screened subnet; guest Wi-Fi is untrusted.";
        if (!allHardening(s)) return "At least one hardening control is still off — sweep the Hardening bay top to bottom (11 controls).";
        if (!nacFull(s)) return "NAC is incomplete: 802.1X on + agentless posture + quarantine VLAN + MAB.";
        if (!keysAll(s)) return "The vault still has a red card — every key needs its lifecycle action.";
        if (!filtersFull(s)) return "Filter policy: guests block malware/phishing/gambling/streaming; staff blocks ONLY malware/phishing (no over-block); allowlist the biology archive; blocklist the typo-squat; block guest executables.";
        if (!aclMatchesTarget(s)) return "The ACL isn't the 7-rule policy in order yet — check the ACL Table against the brief.";
        return null;
      },
      feedback: "This is the whole chapter executed as one design: placement, defaults, admission, secrets, rules and filtering — each family covering the others' blind spots. That's defense in depth as a verb.",
    },
    {
      id: "OBJ-H3",
      pillar: "P3",
      topic: "acl",
      focus: "Translate the policy brief line by line — specific permits sit above general denies.",
      title: "Translate the written policy brief into the ordered border ACL — near-misses are rejected.",
      anchor: "ACL — first-match ordering, implicit deny, explicit deny for logging (M1037)",
      how: "Evidence Pack → Policy brief (in the memo card), then the ACL Table. The brief is written in prose; the table must be its exact, ordered translation.",
      hints: [
        "'Management is reachable only by SSH from the admin workstation' produces TWO rules — the permit for that one host, then a deny for everyone else.",
        "'Untrusted sources never reach trusted resources — make that denial visible in the logs' = an explicit, logged deny.",
        "Order: 443→www, 25→mail, adminws→mgmt:22, deny any→mgmt, deny guest→trusted (log), guest→internet, staff→any last.",
      ],
      check: aclMatchesTarget,
      nearMiss: aclDiagnostics,
      feedback: "An ACL is executable policy prose. The order you chose IS the policy: swap two lines and the blanket-permit shadowing bug eats the denies below it — first-match is unforgiving.",
    },
    {
      id: "OBJ-H4",
      pillar: "P3",
      topic: "verify",
      focus: "Predict all five flagged samples before running — one is 'allowed'; the malicious ones die somewhere.",
      title: "Predict-then-prove ×5: commit verdict predictions for all five flagged samples BEFORE running, then match the rig.",
      anchor: "Detection reasoning — model control behavior from config, then verify",
      how: "Traffic Bay: five samples carry a predict step. No hints, no 'where to look' — reason from the target state you built in OBJ-H2, predict, then run each and let the traces judge you.",
      hints: [
        "One prediction is 'allowed' — the biology archive must load.",
        "Everything malicious dies at some layer; the question is WHICH verdict the rig reports: blocked, quarantined or rejected all count as 'stopped'.",
        "Only one sample lands 'degraded' if something's misconfigured — in the target state none do.",
      ],
      check: function (s) { return predictSetOk(s, PREDICT_HARD); },
      nearMiss: function (s) {
        var missing = PREDICT_HARD.filter(function (id) { return !s.predictions[id]; });
        if (missing.length) return missing.length + " prediction(s) missing — predictions must be committed before running each sample.";
        var wrong = PREDICT_HARD.filter(function (id) { return s.runs[id] && !window.RL_SIM.verdictMatchesPrediction(s.runs[id].final, s.predictions[id]); });
        if (wrong.length) return wrong.length + " prediction(s) didn't match the rig. Open those traces: the step names tell you which control surprised you.";
        return null;
      },
      feedback: "Five for five means you hold a working mental model of the whole defense stack — you can predict what a packet will meet before it meets it. That is the exam's hardest question type, live.",
    },
    {
      id: "OBJ-H5",
      pillar: "P2",
      topic: "verify",
      focus: "Re-read the evidence log: failures are services that answered, secrets that expired, policies that never loaded.",
      title: "Log hunt: in the 11-entry evidence log, find the 4 failing-control events and tag each with its failing family — normal events must stay untagged.",
      anchor: "P2 Recognize — true vs. normal events across auth/cert/fw/dns logs",
      how: "Evidence Pack → Evidence log. Seven entries are a healthy network being a network; four are control failures. Tag only the failures, with the family that failed.",
      hints: [
        "'Failed control' means a defense that should have acted didn't: a service that answered, a secret that expired, a policy that never loaded.",
        "DHCP leases, MAB printer grants and admin SSH sessions are Tuesday.",
        "The failures: an accepted Telnet session (hardening), an expired cert chain (keys), 41k blanket-permit matches (ACL), an unfiltered malware domain (filtering).",
      ],
      check: function (s) {
        var failing = D.LOG_ENTRIES.filter(function (e) { return e.failing; });
        var ok = failing.every(function (e) { return s.records.loghunt[e.id] === e.failing; });
        var noise = D.LOG_ENTRIES.filter(function (e) { return !e.failing && s.records.loghunt[e.id]; });
        return ok && noise.length === 0;
      },
      nearMiss: function (s) {
        var noise = D.LOG_ENTRIES.filter(function (e) { return !e.failing && s.records.loghunt[e.id]; });
        if (noise.length) return noise.length + " normal event(s) tagged — a DHCP lease or a printer MAB grant is not a control failure. False positives erode trust in detection.";
        var missing = D.LOG_ENTRIES.filter(function (e) { return e.failing && !s.records.loghunt[e.id]; });
        if (missing.length) return missing.length + " failing event(s) still untagged — reread certmgr.log and dnsfilter.log.";
        var wrong = D.LOG_ENTRIES.filter(function (e) { return e.failing && s.records.loghunt[e.id] && s.records.loghunt[e.id] !== e.failing; });
        if (wrong.length) return "Right events, wrong families — match the failure to the CONTROL that should have acted.";
        return null;
      },
      feedback: "You just did SOC triage: four true positives out of eleven, zero false positives charged. The failing families — hardening, keys, ACL, filtering — are the same four the memo flagged. Evidence converges on truth.",
    },
    {
      id: "OBJ-H6",
      pillar: "P4",
      topic: "verify",
      focus: "Re-sequence the rollout: backup first, user-facing outage before housekeeping, pilot before enforcement.",
      title: "Sequence the rollout: order the 6 change-control steps to satisfy the board's constraints.",
      anchor: "Mitigation planning — change control: backup → outage fix → secrets → pilot → enforce → verify",
      how: "Evidence Pack → Rollout plan. Six steps, one correct order, three constraints stated by the board. Reorder with the arrows.",
      hints: [
        "Constraint 1: nothing before backup. Constraint 2: the user-facing outage (expired cert) is fixed before housekeeping. Constraint 3: enforcement never precedes the monitor-mode pilot; the audit closes the window.",
        "Renew the cert first (after backup) — it's the outage users feel today.",
        "Order: backup → cert → secrets → pilot → enforce → hardening+ACL+audit.",
      ],
      check: function (s) { return s.records.rollout.join(",") === D.ROLLOUT_STEPS.map(function (r) { return r.id; }).join(","); },
      nearMiss: function (s) {
        var order = s.records.rollout;
        if (order.length !== D.ROLLOUT_STEPS.length) return "Place all " + D.ROLLOUT_STEPS.length + " steps — " + (D.ROLLOUT_STEPS.length - order.length) + " still unplaced.";
        if (order[0] !== "R1") return "Step 1 must be the config backup — a change without a known-good rollback is how outages become days.";
        var pIdx = order.indexOf("R4");
        var eIdx = order.indexOf("R5");
        if (pIdx > eIdx) return "Enforcement before the monitor-mode pilot is how you lock 9,000 students out of the Wi-Fi at once.";
        if (order[order.length - 1] !== "R6") return "The audit re-run always closes the maintenance window — verification is part of the change.";
        return "Close — check the board's constraint about user-facing outages vs. housekeeping.";
      },
      feedback: "Sequencing is mitigation too: backup→rollback safety, cert→visible outage first, pilot→enforce→verify protects 9,000 users from your own fix. A technically perfect control rolled out in the wrong order is an outage with a footnote.",
    },
    {
      id: "OBJ-H7",
      pillar: "P1",
      topic: "zones",
      focus: "Re-stamp the drawing: guest Wi-Fi is untrusted by definition; public services belong in the buffer.",
      title: "Zone audit: place every device in its policy-correct zone on the drawing.",
      anchor: "Trusted vs. untrusted zones + screened subnet — full placement set (N10-009 4.5)",
      how: "Drawing Board. Ten devices, four zones. Two devices are actively misplaced and one zone label is a lie — fix the set so the trust labels match policy.",
      hints: [
        "Guest/student Wi-Fi is the definition of untrusted — no matter how modern its encryption.",
        "Public services (www, mail) live in the screened subnet; everything internal stays trusted; network devices live in management.",
        "Movable chips: WWW, MAIL, GUEST WIFI. WWW/MAIL → screened subnet; GUEST WIFI → untrusted.",
      ],
      check: function (s) { return window.RL_SIM.isTargetZones(s.env); },
      nearMiss: function (s) {
        if (s.env.zones["guestwifi"] !== "untrusted") return "The guest network is labeled trusted — every rule you write inherits that lie. It is untrusted by definition.";
        if (s.env.zones["webserver"] !== "dmz" || s.env.zones["mailrelay"] !== "dmz") return "Public-facing services belong in the screened subnet, not the staff VLAN.";
        return null;
      },
      feedback: "Trust labels are load-bearing: 'untrusted' for everything you don't manage, 'screened subnet' for what the world touches, management for the devices that run the network. Every ACL line and NAC decision inherits these labels — mislabel one zone and the policy lies quietly.",
    },
    {
      id: "OBJ-H8",
      pillar: "P3",
      topic: "filter",
      focus: "Re-read the detection candidates — enable the rule that flags attacker behavior, not Tuesday traffic.",
      title: "Tune the watchtower: enable the one guest-network detection that catches real threats; mute the two false-positive generators.",
      anchor: "Detection tuning — true vs. false positives on filtered networks",
      how: "Evidence Pack → Detection candidates. Three candidate alert rules for the guest network. Enable exactly the one that detects adversary behavior without crying wolf.",
      hints: [
        "A rule that fires on normal behavior gets muted within a week — then it detects nothing.",
        "New domains and streaming blocks happen all day on a student network.",
        "Enable R-B only: repeated hits against blocked malware/phishing categories is beaconing, not browsing.",
      ],
      check: function (s) { return s.records.detection.length === 1 && s.records.detection[0] === "R-B"; },
      nearMiss: function (s) {
        if (s.records.detection.includes("R-A")) return "R-A fires on every first-visit domain — on a student network that's constant noise. False positives bury real alerts.";
        if (s.records.detection.includes("R-C")) return "R-C alerts on your own policy working correctly — streaming blocks are expected on guests.";
        if (s.records.detection.length > 1) return "Exactly one candidate is a true-positive generator; the others erode the alert queue.";
        return null;
      },
      feedback: "Detection quality = signal ÷ noise. 'Retries against a blocked malicious category' is behavior with attacker intent behind it; 'new domain' and 'blocked stream' are Tuesday. The same logic scores true/false-positive questions on the exam.",
    },
    {
      id: "OBJ-H9",
      pillar: "P4",
      topic: "filter",
      focus: "Name what the filter still cannot see inside TLS — then pick the family that would close it.",
      title: "Name the residual risk: pick the TRUE post-remediation risk statement and the control family that would close it.",
      anchor: "Mitigation limits — honest residual risk after filtering (TLS blind spot)",
      how: "Evidence Pack → Residual risk. The audit is green; say what's STILL true, and name what would close it.",
      hints: [
        "One statement contradicts the work you just did; one claims perfection; one is uncomfortably true.",
        "What does the filter actually SEE — the domain lookup, or the bytes inside the tunnel?",
        "Statement S1 is true; TLS/HTTPS inspection & DNS-layer security is the closing family.",
      ],
      check: function (s) { return s.records.residualStatement === "S1" && s.records.residualFamily === "F1"; },
      nearMiss: function (s) {
        if (s.records.residualStatement === "S2") return "No control set reaches zero risk — claiming perfection is the finding auditors write you up for.";
        if (s.records.residualStatement === "S3") return "Default credentials were remediated in OBJ-H2 — they are no longer the biggest risk.";
        if (s.records.residualStatement === "S1" && s.records.residualFamily !== "F1") return "What closes an encryption blind spot? Something that inspects TLS or judges domains at the resolver — not longer passwords or looser ACLs.";
        return null;
      },
      feedback: "Signing off with a named residual risk is what separates an engineer from a checkbox. Category filtering sees destinations; TLS hides payloads. Name the gap, name the closing control, own what remains.",
    },
  ];

  window.RL_OBJECTIVES = {
    MEDIUM: OBJECTIVES_MEDIUM,
    HARD: OBJECTIVES_HARD,
    helpers: {
      allHardening: allHardening,
      nacFull: nacFull,
      keysAll: keysAll,
      filtersFull: filtersFull,
      aclMatchesTarget: aclMatchesTarget,
      aclDiagnostics: aclDiagnostics,
      auditAllExpected: auditAllExpected,
      predictSetOk: predictSetOk,
      PREDICT_HARD: PREDICT_HARD,
    },
  };
})();
