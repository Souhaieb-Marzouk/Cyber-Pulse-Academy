// ── Red-Line Room · bench panels ───────────────────────────────────────
// Vanilla-JS re-creation of ControlCatalog, TrafficBay, FieldManual,
// EvidencePack (behavioral parity with the original React components).
"use strict";

(function () {
  var D = window.RL_DATA;
  var C = window.RL_CONTENT;
  var U = window.RL.ui;
  var esc = U.esc, icon = U.icon, btn = U.btn;

  // ── Control Catalog · Hardening Bay ───────────────────────────────────
  var DEVICE_TABS = [
    { id: "gw1", label: "NORTH-GW1 · border" },
    { id: "cs1", label: "NORTH-CS1 · core" },
    { id: "wlc1", label: "NORTH-WLC1 · wi-fi" },
  ];

  function renderHardeningBay(state, ui) {
    var dev = ui.hardDev;
    var controls = D.HARDENING.filter(function (h) { return h.device === dev; });
    var tabs = DEVICE_TABS
      .map(function (t) {
        return (
          '<button type="button" class="btn ' + (dev === t.id ? "btn-secondary" : "btn-ghost") + ' minh-11 draft-mono" style="font-size:11px;padding:0.25rem 0.75rem"' +
          ' role="tab" aria-selected="' + (dev === t.id) + '" data-act="hard-dev" data-dev="' + t.id + '">' + esc(t.label) + "</button>"
        );
      })
      .join("");
    var rows = controls
      .map(function (h) {
        var on = !!state.env.hardening[h.id];
        return (
          '<li class="' + (on ? "panel ok" : "panel") + '" style="padding:10px">' +
          '<div class="bay-row-top">' +
          "<div style=\"min-width:0\">" +
          '<p class="bay-row-label">' + esc(h.label) + "</p>" +
          '<p class="bay-row-why">' + esc(h.why) + "</p>" +
          (on
            ? '<p class="bay-row-note ok draft-mono">✓ applied — residual risk closed</p>'
            : '<p class="bay-row-note risk draft-mono">if left: ' + esc(h.risk) + "</p>") +
          "</div>" +
          renderSwitch(on, 'data-act="toggle-hard" data-id="' + h.id + '"', esc(h.label)) +
          "</div>" +
          "</li>"
        );
      })
      .join("");
    return (
      "<div>" +
      U.sectionTitle("HARDENING BAY", "Remove the defaults. Every open service is attack surface someone else maintains.") +
      '<div class="bay-tabs" role="tablist" aria-label="Device filter">' + tabs + "</div>" +
      '<ul aria-label="Hardening controls for ' + dev + '" class="bay-list">' + rows + "</ul>" +
      "</div>"
    );
  }

  function renderSwitch(checked, dataAttrs, label) {
    return (
      '<button type="button" role="switch" class="switch"' + (checked ? ' aria-checked="true"' : ' aria-checked="false"') + " " + dataAttrs +
      (label ? ' aria-label="' + label + '"' : "") + '><span class="knob"></span></button>'
    );
  }

  // ── Control Catalog · NAC Bay ─────────────────────────────────────────
  function renderNacBay(state) {
    var nac = state.env.nac;
    var postureText =
      nac.posture === "none" ? "Auth-only: a clean-looking but unpatched device walks straight in."
      : nac.posture === "agent" ? "Agents need IT-installed software and management rights — 9,000 student phones don't have either."
      : "Web-portal checks at join time: no install needed, fits unmanaged BYOD. Failures land in quarantine.";
    var postureOptions = [
      { v: "none", label: "none — admit after auth only" },
      { v: "agent", label: "persistent agent (managed laptops)" },
      { v: "agentless", label: "agentless web portal (BYOD fleets)" },
    ]
      .map(function (o) {
        return '<option value="' + o.v + '"' + (nac.posture === o.v ? " selected" : "") + ">" + esc(o.label) + "</option>";
      })
      .join("");
    return (
      "<div>" +
      U.sectionTitle("NAC DESK", "802.1X: supplicant → authenticator (switch/AP) → RADIUS decides. Posture asks 'are you healthy?'.") +
      '<div class="stack-3">' +
      '<div class="' + (nac.guestDot1x ? "panel ok" : "panel") + '" style="padding:10px">' +
      '<div class="bay-row-top"><div><p class="bay-row-label">Enable 802.1X — student &amp; public networks</p>' +
      '<p class="bay-row-why">Applies to guest Wi-Fi and public wired ports (lobby, library). Unauthenticated ports pass nothing but the handshake.</p></div>' +
      renderSwitch(nac.guestDot1x, 'data-act="set-nac" data-field="guestDot1x"', "Enable 802.1X on student and public networks") +
      "</div></div>" +
      '<div class="panel" style="padding:10px">' +
      '<p class="bay-row-label" style="margin-bottom:4px">Posture assessment</p>' +
      '<select class="sel h-9 draft-mono" aria-label="Posture assessment mode" data-act="set-nac-select" data-field="posture">' + postureOptions + "</select>" +
      '<p class="bay-row-why" style="margin-top:6px">' + postureText + "</p>" +
      "</div>" +
      '<div class="' + (nac.quarantine ? "panel ok" : "panel") + '" style="padding:10px">' +
      '<div class="bay-row-top"><div><p class="bay-row-label">Quarantine VLAN (666) for failures</p>' +
      '<p class="bay-row-why">Failed or unknown devices get the remediation portal only — contained, not connected.</p></div>' +
      renderSwitch(nac.quarantine, 'data-act="set-nac" data-field="quarantine"', "Enable quarantine VLAN") +
      "</div></div>" +
      '<div class="' + (nac.mabPrinters ? "panel ok" : "panel") + '" style="padding:10px">' +
      '<div class="bay-row-top"><div><p class="bay-row-label">MAB for printers (MAC Authentication Bypass)</p>' +
      '<p class="bay-row-why">Legacy gear that can\'t speak 802.1X admits by MAC address — deliberately weaker, limited to printers.</p></div>' +
      renderSwitch(nac.mabPrinters, 'data-act="set-nac" data-field="mabPrinters"', "Enable MAB for printers") +
      "</div></div>" +
      '<div class="panel" style="padding:10px;opacity:0.8">' +
      '<div class="bay-row-top"><div><p class="bay-row-label">802.1X — staff wired VLAN 10 <span class="badge stencil" style="margin-left:4px;font-size:9px">pre-existing</span></p>' +
      '<p class="bay-row-why">Already live (see evidence: EAP-Success for staff laptops). The finding was the student/public side.</p></div>' +
      '<button type="button" role="switch" class="switch" aria-checked="true" disabled aria-label="Staff 802.1X (already enabled)"><span class="knob"></span></button>' +
      "</div></div>" +
      "</div></div>"
    );
  }

  // ── Control Catalog · Key Vault ───────────────────────────────────────
  function renderKeyVault(state) {
    var cards = D.KEY_ITEMS
      .map(function (k) {
        var fixed = state.env.keys[k.id] === "fixed";
        return (
          '<li class="key-card' + (fixed ? " fixed" : "") + '">' +
          '<div style="display:flex;align-items:flex-start;gap:8px">' +
          '<span style="display:inline-flex;margin-top:2px;color:' + (fixed ? "var(--mint)" : "var(--red)") + '">' + icon("keyround", 16) + "</span>" +
          '<div style="min-width:0;flex:1">' +
          '<p class="key-name">' + esc(k.name) + "</p>" +
          '<p class="key-detail">' + esc(k.detail) + "</p>" +
          '<p class="key-state draft-mono ' + (fixed ? "fixed" : "bad") + '">' + esc(fixed ? k.fixedLabel : k.badLabel) + "</p>" +
          '<div class="key-actions">' +
          (!fixed ? btn('data-act="fix-key" data-id="' + k.id + '" class="btn-primary minh-11" style="font-size:11px;padding:0.25rem 0.75rem"', esc(k.fixLabel)) : "") +
          '<span class="badge draft-mono" style="font-size:9px;border-color:#3d5a75;color:var(--muted-foreground)">' + esc(k.mitre) + "</span>" +
          "</div>" +
          "</div></div></li>"
        );
      })
      .join("");
    return (
      "<div>" +
      U.sectionTitle("KEY VAULT", "Secrets have a lifecycle — issue, store, rotate, revoke. A key that never dies is a key you gave away forever.") +
      '<ul class="stack-3">' + cards + "</ul>" +
      "</div>"
    );
  }

  // ── Control Catalog · ACL Bay ─────────────────────────────────────────
  function aclCell(label, value, options, ruleId, field) {
    var opts = options
      .map(function (o) {
        return '<option value="' + o + '"' + (value === o ? " selected" : "") + ">" + esc(o) + "</option>";
      })
      .join("");
    return (
      '<label style="display:block">' +
      '<span class="acl-cell-label stencil">' + label + "</span>" +
      '<select class="sel draft-mono" style="height:32px" aria-label="Value: ' + esc(value) + '" data-act="acl-set" data-id="' + ruleId + '" data-field="' + field + '">' + opts + "</select>" +
      "</label>"
    );
  }

  function renderAclBay(state, ui) {
    var V = D.ACL_VOCAB;
    var briefOpen = ui.aclBrief;
    var rules = state.env.acl
      .map(function (r, i) {
        return (
          '<li class="acl-rule">' +
          '<div class="acl-rule-head">' +
          '<span class="acl-rule-num draft-mono">#' + (i + 1) + "</span>" +
          '<div class="acl-rule-btns">' +
          btn('class="btn btn-ghost btn-icon hit-44" aria-label="Move rule up"' + (i === 0 ? " disabled" : "") + ' data-act="acl-move" data-id="' + r.id + '" data-dir="-1"', icon("chevronup", 14)) +
          btn('class="btn btn-ghost btn-icon hit-44" aria-label="Move rule down"' + (i === state.env.acl.length - 1 ? " disabled" : "") + ' data-act="acl-move" data-id="' + r.id + '" data-dir="1"', icon("chevrondown", 14)) +
          btn('class="btn btn-ghost btn-icon hit-44 text-red" aria-label="Delete rule" data-act="acl-del" data-id="' + r.id + '"', icon("trash2", 14)) +
          "</div></div>" +
          '<div class="acl-grid">' +
          aclCell("action", r.action, V.action, r.id, "action") +
          aclCell("proto", r.proto, V.proto, r.id, "proto") +
          aclCell("source", r.src, V.src, r.id, "src") +
          aclCell("destination", r.dst, V.dst, r.id, "dst") +
          aclCell("port", r.port, V.port, r.id, "port") +
          "</div>" +
          '<label class="acl-log-label">' +
          '<button type="button" role="switch" class="switch" style="transform:scale(0.9)"' + (r.log ? ' aria-checked="true"' : ' aria-checked="false"') + ' aria-label="Log matches of rule ' + (i + 1) + '" data-act="acl-log" data-id="' + r.id + '"><span class="knob"></span></button>' +
          " log matches</label>" +
          "</li>"
        );
      })
      .join("");
    var legend = Object.keys(D.ACL_LEGEND)
      .map(function (k) {
        return '<span class="lk"><span class="text-amber" style="color:var(--amber-text)">' + esc(k) + "</span> = " + esc(D.ACL_LEGEND[k]) + "</span>";
      })
      .join("");
    return (
      "<div>" +
      U.sectionTitle("ACL TABLE · NORTH-GW1", "First match wins, top to bottom. Traffic matching nothing dies in the implicit deny.") +
      '<button type="button" class="acl-brief-toggle draft-mono" aria-expanded="' + briefOpen + '" data-act="acl-brief">' +
      icon("scrolltext", 14) + " POLICY BRIEF (reviewer's memo, appendix C)" +
      '<span class="chev' + (briefOpen ? " open" : "") + '">' + icon("chevrondown", 16) + "</span>" +
      "</button>" +
      (briefOpen
        ? '<ol class="acl-brief-list draft-mono">' +
          "<li>The world may reach ONLY https (443) on the www server.</li>" +
          "<li>The world may reach ONLY smtp (25) on the mail gateway.</li>" +
          "<li>Management VLAN accepts ONLY SSH (22), ONLY from the IT admin workstation.</li>" +
          "<li>Everything else toward management is denied — after the admin permit.</li>" +
          "<li>Guest/student sources never reach trusted resources; make that denial visible in the logs.</li>" +
          "<li>Guest/student sources may reach the Internet.</li>" +
          "<li>Staff may reach anything else. This is the LAST explicit rule.</li>" +
          "</ol>"
        : "") +
      '<ol aria-label="Ordered ACL rules">' + rules + "</ol>" +
      '<div class="acl-implicit draft-mono" aria-label="Implicit deny">#' + (state.env.acl.length + 1) + ' · <span class="text-red">implicit deny ip any any</span> — always last, never written</div>' +
      '<div class="mt-3">' + btn('class="btn-outline minh-11" data-act="acl-add"', icon("plus", 16) + " Add rule") + "</div>" +
      '<div class="acl-legend draft-mono">' + legend + '<span class="note">Engine is simplified (src/dst/port tuples); real devices add protocol details.</span></div>' +
      "</div>"
    );
  }

  // ── Control Catalog · Filter Bay ──────────────────────────────────────
  function renderFilterBay(state) {
    var f = state.env.filters;
    var netBlocks = ["guest", "staff"]
      .map(function (net) {
        var blocked = net === "guest" ? f.blockedGuest : f.blockedStaff;
        var cats = D.FILTER_CATEGORIES
          .map(function (c) {
            var on = blocked.includes(c.id);
            return (
              '<label class="filter-cat' + (on ? " on" : "") + '"><span style="min-width:0">' +
              '<span class="filter-cat-label' + (on ? " on" : "") + '">' + esc(c.label) + "</span>" +
              '<span class="filter-cat-desc">' + esc(c.desc) + "</span></span>" +
              renderSwitch(on, 'data-act="toggle-cat" data-net="' + net + '" data-cat="' + c.id + '"', "Block " + esc(c.label) + " on " + net) +
              "</label>"
            );
          })
          .join("");
        return (
          '<div class="panel" style="padding:10px">' +
          '<p class="filter-net-head">' + icon("filter", 14, "text-blue") + " Blocked categories — " + (net === "guest" ? "GUEST" : "STAFF") + "</p>" +
          cats +
          "</div>"
        );
      })
      .join("");
    var sites = D.FILTER_SITES
      .map(function (s) {
        var allowed = f.allowlist.includes(s.id);
        var blockd = f.blocklist.includes(s.id);
        return (
          '<li class="site-card">' +
          '<p class="site-domain draft-mono">' + esc(s.domain) + "</p>" +
          '<p class="site-desc">' + esc(s.desc) + "</p>" +
          '<div class="site-toggles">' +
          '<label class="allow"><button type="button" role="switch" class="switch" style="transform:scale(0.9)"' + (allowed ? ' aria-checked="true"' : ' aria-checked="false"') + ' aria-label="Allowlist ' + esc(s.domain) + '" data-act="toggle-site" data-list="allowlist" data-site="' + s.id + '"><span class="knob"></span></button> allowlist</label>' +
          '<label class="block"><button type="button" role="switch" class="switch" style="transform:scale(0.9)"' + (blockd ? ' aria-checked="true"' : ' aria-checked="false"') + ' aria-label="Blocklist ' + esc(s.domain) + '" data-act="toggle-site" data-list="blocklist" data-site="' + s.id + '"><span class="knob"></span></button> blocklist</label>' +
          "</div></li>"
        );
      })
      .join("");
    return (
      "<div>" +
      U.sectionTitle("FILTER STATION", "Destinations (URL/DNS categories, allow/block lists) and payloads (content filtering).") +
      '<div class="stack-3">' +
      '<div class="' + (f.dnsGuest ? "panel ok" : "panel") + '" style="padding:10px">' +
      '<div class="bay-row-top"><div><p class="bay-row-label">DNS filtering — guest/student networks</p>' +
      '<p class="bay-row-why">Categories resolve (or don\'t) at the resolver, before any payload moves.</p></div>' +
      renderSwitch(f.dnsGuest, 'data-act="set-filter" data-field="dnsGuest"', "Enable DNS filtering on guest networks") +
      "</div></div>" +
      '<div class="' + (f.exeBlockGuest ? "panel ok" : "panel") + '" style="padding:10px">' +
      '<div class="bay-row-top"><div><p class="bay-row-label">Content filtering — block executable downloads on guest</p>' +
      '<p class="bay-row-why">Payload-level control: file types, regardless of source site.</p></div>' +
      renderSwitch(f.exeBlockGuest, 'data-act="set-filter" data-field="exeBlockGuest"', "Block executable downloads on guest Wi-Fi") +
      "</div></div>" +
      netBlocks +
      '<div class="panel" style="padding:10px">' +
      '<p class="filter-net-head">' + icon("dooropen", 14, "text-amber") + " Surgical lists (guest network)</p>" +
      "<ul>" + sites + "</ul>" +
      '<p class="bay-row-why" style="margin-top:8px">Allowlist = scalpel for false positives. Blocklist = scalpel for single bad domains. Categories = the broad policy.</p>' +
      "</div>" +
      "</div></div>"
    );
  }

  var CATALOG_TABS = [
    { id: "hard", label: "Hardening", ic: "wrench" },
    { id: "nac", label: "NAC", ic: "dooropen" },
    { id: "keys", label: "Key Vault", ic: "keyround" },
    { id: "acl", label: "ACL", ic: "network" },
    { id: "filters", label: "Filters", ic: "filter" },
  ];

  function renderCatalog(state, ui, catTab) {
    var tabs = CATALOG_TABS
      .map(function (t) {
        return (
          '<button type="button" class="cat-tab draft-mono" role="tab" aria-selected="' + (catTab === t.id) + '" data-act="cat-tab" data-tab="' + t.id + '">' +
          icon(t.ic, 14) + " " + t.label + "</button>"
        );
      })
      .join("");
    var body;
    if (catTab === "hard") body = renderHardeningBay(state, ui);
    else if (catTab === "nac") body = renderNacBay(state);
    else if (catTab === "keys") body = renderKeyVault(state);
    else if (catTab === "acl") body = renderAclBay(state, ui);
    else body = renderFilterBay(state);
    return (
      '<div class="spacer-4"><div>' +
      '<div class="tabs-list wrap cat-tabs-list" role="tablist" aria-label="Control catalog bays">' + tabs + "</div>" +
      '<div class="tab-content" role="tabpanel">' + body + "</div>" +
      "</div></div>"
    );
  }

  // ── Traffic Bay ───────────────────────────────────────────────────────
  var PREDICT_OPTIONS = [
    { id: "allowed", label: "Will pass through" },
    { id: "blocked", label: "Will be stopped" },
    { id: "degraded", label: "Will pass but degraded/warned" },
  ];

  function verdictOk(final, prediction) {
    if (prediction === "blocked") return final === "BLOCKED" || final === "QUARANTINED" || final === "REJECTED";
    if (prediction === "allowed") return final === "ALLOWED";
    if (prediction === "degraded") return final === "DEGRADED";
    return false;
  }

  function renderTrafficBay(state, ui) {
    var audit = state.audit;
    var auditBad = audit ? D.TRAFFIC_SAMPLES.filter(function (t) { return audit.results[t.id] !== t.expected; }) : [];
    var sheet = "";
    if (audit) {
      var rows = D.TRAFFIC_SAMPLES
        .map(function (t) {
          var got = audit.results[t.id];
          var ok = got === t.expected;
          return (
            '<div class="audit-row draft-mono">' +
            '<span aria-hidden="true" style="width:6px;height:6px;border-radius:9999px;flex-shrink:0;background:' + (ok ? "var(--mint)" : "var(--red)") + '"></span>' +
            '<span class="t" title="' + esc(t.title) + '">' + esc(t.title) + "</span>" +
            '<span class="v ' + (ok ? "ok" : "bad") + '">' + esc(got) + " " + (ok ? "✓" : "✗ (want " + t.expected + ")") + "</span>" +
            "</div>"
          );
        })
        .join("");
      sheet =
        '<div class="card audit-sheet" style="border-color:' + (auditBad.length === 0 ? "rgba(87,201,155,0.6)" : "rgba(240,168,50,0.6)") + ';padding:12px">' +
        '<p class="stencil" style="font-size:10px;color:var(--muted-foreground);margin-bottom:8px">AUDIT SHEET — EXPECTED vs OBSERVED</p>' +
        '<div class="audit-grid">' + rows + "</div>" +
        (auditBad.length === 0
          ? '<p class="audit-summary-ok draft-mono">12/12 expected verdicts — the drawing holds under load.</p>'
          : '<p class="audit-summary-bad draft-mono">' + auditBad.length + " mismatch" + (auditBad.length > 1 ? "es" : "") + " — open the traces below; each red step names the control that didn't hold.</p>") +
        "</div>";
    }
    var samples = D.TRAFFIC_SAMPLES
      .map(function (t) {
        var run = state.runs[t.id];
        var open = ui.openTrace === t.id;
        var predicted = state.predictions[t.id];
        var predictBlock = "";
        if (t.predict) {
          var opts = PREDICT_OPTIONS
            .map(function (o) {
              var chosen = predicted === o.id;
              var locked = !!run;
              var correct = locked && run && o.id === predicted && verdictOk(run.final, o.id);
              var cls = "btn minh-11 draft-mono";
              if (chosen) cls += " chosen";
              if (correct) cls += " correct";
              if (locked && chosen && !correct) cls += " wrong";
              return (
                '<button type="button" class="' + cls + '"' + (locked ? " disabled" : "") + ' aria-pressed="' + chosen + '" data-act="predict" data-sample="' + t.id + '" data-value="' + o.id + '">' +
                o.label + "</button>"
              );
            })
            .join("");
          var resultLine = "";
          if (run && predicted) {
            resultLine = verdictOk(run.final, predicted)
              ? '<p class="predict-result ok draft-mono">✓ rig agrees with your model.</p>'
              : '<p class="predict-result bad draft-mono">✗ rig says ' + run.final + " — reread the trace: which control surprised you?</p>";
          }
          predictBlock =
            '<fieldset class="predict-box"><legend class="stencil">YOUR PREDICTION (locked once run)</legend>' +
            '<div class="predict-opts">' + opts + "</div>" + resultLine + "</fieldset>";
        }
        var trace = "";
        if (open) {
          var stepsHtml;
          if (run) {
            stepsHtml =
              '<ol class="stack">' +
              run.steps
                .map(function (st) {
                  var cls = st.status === "bad" ? "bad" : st.status === "warn" ? "warn" : st.status === "ok" ? "ok" : st.status === "blocked" ? "blocked" : "";
                  return (
                    '<li class="trace-step">' + U.stepDot(st.status) +
                    "<span><span class=\"trace-label stencil draft-mono\">" + esc(st.label) + "</span>" +
                    '<span class="trace-detail ' + cls + '">' + esc(st.detail) + "</span></span></li>"
                  );
                })
                .join("") +
              "</ol>";
          } else {
            stepsHtml = '<p class="draft-mono" style="font-size:11px;color:var(--muted-foreground)">Not run yet — press Run, or include it in the full audit.</p>';
          }
          trace =
            '<div class="sample-trace" aria-live="polite">' + stepsHtml +
            '<p class="trace-teach"><span class="k stencil">TEACH</span> ' + esc(t.teach) + "</p>" +
            "</div>";
        }
        return (
          '<li class="sample ' + (run ? (run.final === t.expected ? "pass" : "fail") : "") + '">' +
          '<div class="sample-head">' +
          '<div style="display:flex;align-items:flex-start;gap:8px;flex-wrap:wrap">' +
          '<button type="button" class="sample-title-btn" aria-expanded="' + open + '" data-act="trace" data-sample="' + t.id + '">' +
          '<span class="sample-title">' + esc(t.title) + "</span>" +
          '<span class="sample-desc">' + esc(t.desc) + "</span>" +
          "</button>" +
          (t.predict ? '<span class="badge stencil" style="font-size:9px;border-color:rgba(127,184,216,0.5);color:var(--blue-text)">PREDICT FIRST</span>' : "") +
          '<span class="chev-trace" style="display:inline-flex;color:var(--dim);transition:transform 0.2s;transform:rotate(' + (open ? "180deg" : "0deg") + ')">' + icon("chevrondown", 16) + "</span>" +
          "</div>" +
          '<div class="sample-meta-row">' +
          '<span class="sample-meta draft-mono">' + t.src + " → " + t.dst + (t.port !== "any" ? ":" + t.port : "") + " / " + t.proto + "</span>" +
          (run ? U.verdictChip(run.final, t.attack) : "") +
          btn('class="btn-outline minh-11" style="margin-left:auto;font-size:11px" aria-label="Run sample: ' + esc(t.title) + '" data-act="run-sample" data-sample="' + t.id + '"', icon("play", 12) + " Run") +
          "</div>" +
          predictBlock +
          "</div>" +
          trace +
          "</li>"
        );
      })
      .join("");
    var nacCard = state.env.nac.guestDot1x ? renderNacLogCard(state, ui) : "";
    return (
      '<div class="spacer-4">' +
      '<div class="flex-between">' +
      U.sectionTitle("TRAFFIC BAY · TEST RIG", "Synthetic traffic, step-by-step traces of which control decided each verdict. Predict first where marked — then run.") +
      btn('data-act="run-audit" class="btn-primary minh-11"', icon("flaskconical", 16) + " Run full audit (12 samples)") +
      "</div>" +
      sheet +
      '<ul aria-label="Traffic samples">' + samples + "</ul>" +
      nacCard +
      "</div>"
    );
  }

  function renderNacLogCard(state, ui) {
    var Q = D.NAC_LOG_QUESTION;
    var answered = state.records.nacQuiz !== null;
    var chosen = answered ? Number(state.records.nacQuiz) : null;
    var picked = ui.nacPicked;
    var nudge = ui.nacNudge;
    var correct = chosen === Q.correct;
    var logLines = Q.log
      .map(function (l) {
        return '<p><span class="t">' + esc(l.t) + '</span> <span class="m">' + esc(l.m) + "</span></p>";
      })
      .join("");
    var options = Q.options
      .map(function (o, i) {
        var isChosen = answered ? chosen === i : picked === i;
        var isCorrect = i === Q.correct;
        var cls = "opt-btn";
        if (answered && isChosen && correct) cls += " judged-correct";
        else if (answered && isChosen && !correct) cls += " judged-wrong";
        else if (answered && !isChosen) cls += " dimmed";
        else if (!answered && isChosen) cls += " picked";
        else cls += " hoverable";
        var mark = "";
        if (answered && isChosen && correct) mark = icon("checkcircle2", 14, "") + "";
        if (answered && isChosen && !correct) mark = icon("xcircle", 14, "");
        var markSpan = mark ? '<span style="flex-shrink:0;margin-top:2px;color:' + (correct ? "var(--mint)" : "var(--red)") + ';display:inline-flex">' + mark + "</span>" : "";
        return (
          '<button type="button" role="radio" aria-checked="' + isChosen + '"' + (answered ? " disabled" : "") + ' class="' + cls + '" data-act="nac-pick" data-i="' + i + '">' +
          markSpan + "<span>" + esc(o) + "</span></button>"
        );
      })
      .join("");
    var checkBtn = answered
      ? ""
      : btn('data-act="nac-check" class="btn-primary minh-11" style="margin-top:12px;font-size:12px" aria-label="Check the NAC log diagnosis"', icon("listchecks", 16) + " Check answer");
    var explain = "";
    if (answered) {
      explain =
        '<div class="mt-3"><p class="explain-block ' + (correct ? "ok" : "warn") + '" aria-live="polite">' +
        (correct ? "Correct. " : "Not quite — the defensible answer is option 2. ") +
        esc(Q.explain) + "</p>" +
        '<p class="lock-note draft-mono">answer locked — it cannot be changed</p></div>';
    }
    return (
      '<div class="card" style="border-color:rgba(127,184,216,0.4);background:var(--panel);padding:14px">' +
      '<p class="stencil" style="font-size:10px;color:var(--muted-foreground);margin-bottom:8px;display:flex;align-items:center;gap:6px">' + icon("scrolltext", 14) + " FIELD NOTES · nac.log (simulated)</p>" +
      '<div class="naclog draft-mono" aria-label="Simulated NAC log">' + logLines + "</div>" +
      '<p class="bay-row-label" style="margin-bottom:8px">' + esc(Q.q) + "</p>" +
      '<div role="radiogroup" aria-label="NAC log diagnosis options">' + options + "</div>" +
      (nudge && !answered ? '<p class="nudge" aria-live="polite">Select an answer first — nothing is highlighted until you check one.</p>' : "") +
      checkBtn +
      explain +
      "</div>"
    );
  }

  // ── Field Manual ──────────────────────────────────────────────────────
  function renderFieldManual(state, ui) {
    var acc = C.CORE_SECTIONS
      .map(function (sec) {
        var open = ui.accOpen === sec.id;
        var body = "";
        if (open) {
          body =
            '<div class="accordion-body">' +
            sec.body
              .map(function (p) {
                return "<p>" + esc(p) + "</p>";
              })
              .join("") +
            '<p class="drill">' + esc(sec.drill) + "</p>" +
            '<div class="mitre-row"><span class="k stencil">MITRE:</span>' +
            sec.mitre
              .map(function (m) {
                return '<a class="mitre-chip draft-mono" href="https://attack.mitre.org/mitigations/' + m.id + '/" target="_blank" rel="noopener noreferrer">' + m.id + " " + esc(m.label) + " ↗</a>";
              })
              .join("") +
            "</div></div>";
        }
        return (
          '<div class="accordion-item">' +
          '<button type="button" class="accordion-trigger" aria-expanded="' + open + '" data-act="acc" data-id="' + sec.id + '">' +
          '<span style="display:inline-flex;align-items:center;gap:8px;color:var(--amber)">' + icon("bookopen", 14) + "</span> " + esc(sec.title) +
          '<span class="chev' + (open ? " open" : "") + '" style="display:inline-flex;color:var(--dim)">' + icon("chevrondown", 16) + "</span>" +
          "</button>" + body + "</div>"
        );
      })
      .join("");
    return (
      '<div class="spacer-6">' +
      "<div>" +
      U.sectionTitle("FIELD MANUAL · THE SEVEN FAMILIES", "What each family is, how it works mechanically, where it sits in the defense chain, and the MITRE controls it maps to.") +
      '<div class="stack-2" role="presentation">' + acc + "</div>" +
      "</div>" +
      renderMatchGame(state, ui) +
      renderTagGame(state) +
      renderGlossary() +
      "</div>"
    );
  }

  function fisherYates(arr) {
    var ids = arr.slice();
    for (var i = ids.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = ids[i]; ids[i] = ids[j]; ids[j] = tmp;
    }
    return ids;
  }

  function renderMatchGame(state, ui) {
    var assigned = state.records.matchGame;
    var correctCount = D.MATCH_PAIRS.filter(function (p) { return assigned[p.id] === p.id; }).length;
    var complete = correctCount === D.MATCH_PAIRS.length;
    var byId = {};
    D.MATCH_PAIRS.forEach(function (p) { byId[p.id] = p; });
    var order = ui.matchShuffle || (ui.matchShuffle = fisherYates(D.MATCH_PAIRS.map(function (p) { return p.id; })));
    var controls = D.MATCH_PAIRS
      .map(function (p) {
        var done = assigned[p.id] === p.id;
        var active = ui.matchPicked === p.id;
        var cls = "match-chip draft-mono";
        if (done) cls += " done";
        else if (active) cls += " active";
        return (
          '<button type="button" class="' + cls + '"' + (done ? " disabled" : "") + ' aria-pressed="' + active + '" data-act="match-pick" data-id="' + p.id + '">' +
          (done ? "✓ " : "◻ ") + esc(p.control) + "</button>"
        );
      })
      .join("");
    var purposes = order
      .map(function (id) {
        var p = byId[id];
        var locked = assigned[p.id] === p.id;
        var flash = ui.matchFlash === p.id;
        var cls = "match-chip";
        if (locked) cls += " done";
        else if (flash) cls += " flash";
        else if (!ui.matchPicked && !locked && !flash) cls += " faded";
        return (
          '<button type="button" class="' + cls + '"' + (locked ? " disabled" : "") + ' data-act="match-purpose" data-id="' + p.id + '">' +
          esc(p.purpose) + "</button>"
        );
      })
      .join("");
    var status;
    if (complete) status = '<p class="game-status ok draft-mono" aria-live="polite">' + correctCount + "/" + D.MATCH_PAIRS.length + " paired — the chain is drafted.</p>";
    else if (ui.matchFlash) status = '<p class="game-status warn draft-mono" aria-live="polite">Not that pair — it snapped back. Read the purpose line again.</p>';
    else status = '<p class="game-status dim draft-mono" aria-live="polite">' + correctCount + "/" + D.MATCH_PAIRS.length + " paired — keep going.</p>";
    return (
      "<div>" +
      U.sectionTitle("DRAFT THE DEFENSE CHAIN", "Click a control chip, then click the purpose line it belongs to. Wrong pairs snap back.", icon("puzzle", 16, "text-amber")) +
      '<div class="game-grid">' +
      '<div role="group" aria-label="Control families">' + controls + "</div>" +
      '<div role="group" aria-label="Purpose lines">' + purposes + "</div>" +
      "</div>" +
      status +
      "</div>"
    );
  }

  function renderTagGame(state) {
    var assigned = state.records.tagGame;
    var correctCount = D.TAG_SNIPPETS.filter(function (t) { return assigned[t.id] === t.family; }).length;
    var items = D.TAG_SNIPPETS
      .map(function (t) {
        var got = assigned[t.id];
        var ok = got === t.family;
        var tags = D.FAMILY_IDS
          .map(function (f) {
            var cls = "snippet-tag draft-mono";
            if (got === f) cls += ok ? " chosen-ok" : " chosen-wrong";
            return (
              '<button type="button" class="' + cls + '" aria-pressed="' + (got === f) + '" aria-label="Tag as ' + esc(D.FAMILY_LABELS[f]) + '" data-act="tag" data-snippet="' + t.id + '" data-family="' + f + '">' +
              esc(D.FAMILY_LABELS[f]) + "</button>"
            );
          })
          .join("");
        return (
          '<li class="snippet ' + (got ? (ok ? "ok" : "wrong") : "") + '">' +
          '<p class="snippet-text draft-mono">&ldquo;' + esc(t.text) + "&rdquo;</p>" +
          '<div class="snippet-tags">' + tags + "</div>" +
          "</li>"
        );
      })
      .join("");
    var status = correctCount === D.TAG_SNIPPETS.length
      ? '<p class="game-status ok draft-mono" aria-live="polite">' + correctCount + "/" + D.TAG_SNIPPETS.length + " correctly filed</p>"
      : '<p class="game-status dim draft-mono" aria-live="polite">' + correctCount + "/" + D.TAG_SNIPPETS.length + " correctly filed</p>";
    return (
      "<div>" +
      U.sectionTitle("RECOGNIZE IT IN THE WILD", "Real triage: read the artifact, name the failing (or implicated) control family.", icon("tags", 16, "text-amber")) +
      '<ul class="stack">' + items + "</ul>" +
      status +
      "</div>"
    );
  }

  function renderGlossary() {
    var items = D.GLOSSARY
      .map(function (g) {
        return (
          '<div class="glossary-item">' +
          '<dt class="glossary-term draft-mono">' + esc(g.term) + "</dt>" +
          '<dd class="glossary-def">' + esc(g.def) + "</dd>" +
          "</div>"
        );
      })
      .join("");
    return (
      "<div>" +
      U.sectionTitle("GLOSSARY · RED-LINE NOTES", "Every term used on this bench, in one line each.") +
      '<dl class="glossary">' + items + "</dl>" +
      '<div class="mt-3"><span class="badge stencil" style="font-size:9px;color:var(--dim)">Tap MITRE chips to open the official page in a new tab</span></div>' +
      "</div>"
    );
  }

  // ── Evidence Pack ─────────────────────────────────────────────────────
  function renderEvidencePack(state, ui) {
    return (
      '<div class="spacer-6">' +
      renderMemoCard(state) +
      renderLogHuntCard(state, ui) +
      renderRolloutCard(state) +
      renderDetectionCard(state) +
      renderResidualCard(state) +
      "</div>"
    );
  }

  function renderMemoCard(state) {
    var calls = state.records.memo;
    var correct = D.MEMO_ITEMS.filter(function (m) { return calls[m.id] === m.truth; }).length;
    var all = correct === D.MEMO_ITEMS.length;
    var items = D.MEMO_ITEMS
      .map(function (m, i) {
        var call = calls[m.id];
        var judged = !!call;
        var ok = call === m.truth;
        var btns = ["GAP", "NOGAP"]
          .map(function (v) {
            var cls = "memo-btn draft-mono";
            if (call === v) cls += ok ? " chosen-ok" : " chosen-wrong";
            return (
              '<button type="button" class="' + cls + '" aria-pressed="' + (call === v) + '" data-act="memo" data-item="' + m.id + '" data-call="' + v + '">' +
              (v === "GAP" ? "GAP" : "NO GAP") + "</button>"
            );
          })
          .join("");
        var why = judged
          ? '<p class="memo-why ' + (ok ? "text-mint" : "text-amber") + '" aria-live="polite">' + (ok ? "✓ " : "✗ ") + '<span class="fam stencil draft-mono">' + m.family.toUpperCase() + "</span>" + esc(m.why) + "</p>"
          : "";
        return (
          '<li class="memo-item ' + (judged ? (ok ? "ok" : "wrong") : "") + '">' +
          '<div class="memo-row">' +
          '<p class="memo-text"><span class="memo-num draft-mono">' + String(i + 1).padStart(2, "0") + "</span>" + esc(m.text) + "</p>" +
          '<div class="memo-btns" role="group" aria-label="Classify item ' + (i + 1) + '">' + btns + "</div>" +
          "</div>" + why + "</li>"
        );
      })
      .join("");
    return (
      "<div>" +
      U.sectionTitle("FINDINGS MEMO · 10 ITEMS", "The accreditation reviewer's list. Two items are red herrings — good hygiene is not a gap.", icon("filewarning", 16, "text-red")) +
      "<ol>" + items + "</ol>" +
      '<p class="game-status ' + (all ? "ok" : "dim") + ' draft-mono" aria-live="polite">' + correct + "/" + D.MEMO_ITEMS.length + " classified correctly" + (all ? " — triage accepted." : "") + "</p>" +
      "</div>"
    );
  }

  function renderLogHuntCard(state, ui) {
    var tagged = state.records.loghunt;
    var failingIds = D.LOG_ENTRIES.filter(function (e) { return e.failing; }).map(function (e) { return e.id; });
    var correct = failingIds.filter(function (id) {
      var e = D.LOG_ENTRIES.find(function (x) { return x.id === id; });
      return tagged[id] === e.failing;
    }).length;
    var entries = D.LOG_ENTRIES
      .map(function (e) {
        var tag = tagged[e.id];
        var isFailure = !!e.failing;
        var judged = !!tag;
        var ok = judged && tag === e.failing;
        var open = ui.openLog === e.id;
        var tagMark = "";
        if (tag) {
          var cls = ok ? "ok" : isFailure ? "bad" : "fp";
          var suffix = isFailure ? (ok ? " ✓" : " ✗") : " (false positive)";
          tagMark = '<span class="log-tag draft-mono ' + cls + '">→ ' + esc(D.FAMILY_LABELS[tag]) + suffix + "</span>";
        }
        var panel = "";
        if (open) {
          panel =
            '<div class="log-tag-panel" role="group" aria-label="Tag ' + esc(e.src) + ' entry">' +
            D.FAMILY_IDS
              .map(function (f) {
                return (
                  '<button type="button" class="log-tag-btn draft-mono' + (tag === f ? " chosen" : "") + '" aria-pressed="' + (tag === f) + '" data-act="log-tag" data-entry="' + e.id + '" data-family="' + f + '">' +
                  esc(D.FAMILY_LABELS[f]) + "</button>"
                );
              })
              .join("") +
            '<span style="font-size:9px;color:var(--muted-foreground);align-self:center;margin-left:4px">click a family again to clear</span>' +
            "</div>";
        }
        return (
          '<li class="log-entry ' + (judged ? (ok ? "ok" : "wrong") : "") + '">' +
          '<button type="button" class="log-entry-btn" aria-expanded="' + open + '" data-act="log-toggle" data-entry="' + e.id + '">' +
          '<span class="log-src draft-mono">' + esc(e.src) + '</span><span class="log-line draft-mono">' + esc(e.line) + "</span>" + tagMark +
          "</button>" + panel + "</li>"
        );
      })
      .join("");
    return (
      "<div>" +
      U.sectionTitle("EVIDENCE LOG · MORNING COLLECTION", "11 entries, 4 control failures, 7 normal operations. Tag ONLY the failures with the family that failed.", icon("scrolltext", 16, "text-red")) +
      '<ul class="stack-2" style="margin-bottom:8px">' + entries + "</ul>" +
      '<p class="game-status ' + (correct === 4 ? "ok" : "dim") + ' draft-mono" aria-live="polite">' + correct + "/4 failures correctly tagged — normal events must stay untagged.</p>" +
      "</div>"
    );
  }

  function renderRolloutCard(state) {
    var order = state.records.rollout;
    var placed = {};
    order.forEach(function (id) { placed[id] = true; });
    var remaining = D.ROLLOUT_STEPS.filter(function (s) { return !placed[s.id]; });
    var correct = order.join(",") === D.ROLLOUT_STEPS.map(function (r) { return r.id; }).join(",");
    var items = order
      .map(function (id, idx) {
        var step = D.ROLLOUT_STEPS.find(function (s) { return s.id === id; });
        var okPos = correct || (D.ROLLOUT_STEPS[idx] && D.ROLLOUT_STEPS[idx].id === id);
        return (
          '<li class="rollout-item ' + (okPos ? "" : "off") + '">' +
          '<span class="rollout-num draft-mono">' + (idx + 1) + '.</span>' +
          '<p class="rollout-text">' + esc(step.text) + "</p>" +
          '<div class="rollout-btns">' +
          btn('class="btn btn-ghost btn-icon hit-44" aria-label="Move step ' + (idx + 1) + ' up"' + (idx === 0 ? " disabled" : "") + ' data-act="rollout-move" data-idx="' + idx + '" data-dir="-1"', icon("chevronup", 14)) +
          btn('class="btn btn-ghost btn-icon hit-44" aria-label="Move step ' + (idx + 1) + ' down"' + (idx === order.length - 1 ? " disabled" : "") + ' data-act="rollout-move" data-idx="' + idx + '" data-dir="1"', icon("chevrondown", 14)) +
          "</div></li>"
        );
      })
      .join("");
    var unplaced = "";
    if (remaining.length) {
      unplaced =
        '<div class="mt-3"><p class="stencil" style="font-size:10px;color:var(--muted-foreground);margin-bottom:6px">UNPLACED STEPS — click to append:</p>' +
        remaining
          .map(function (s) {
            return '<button type="button" class="unplaced-btn" data-act="rollout-append" data-id="' + s.id + '">+ ' + esc(s.text) + "</button>";
          })
          .join("") +
        "</div>";
    }
    var clearBtn = order.length
      ? '<div class="mt-2">' + btn('class="btn-ghost minh-11" style="font-size:11px;padding:0.25rem 0.75rem" data-act="rollout-clear"', "Clear order") + "</div>"
      : "";
    var verdict = "";
    if (order.length === D.ROLLOUT_STEPS.length) {
      verdict = correct
        ? '<p class="game-status ok draft-mono" aria-live="polite">✓ Sequence satisfies all three board constraints.</p>'
        : '<p class="game-status warn draft-mono" aria-live="polite">Sequence placed — but the board\'s constraints aren\'t all satisfied yet. Check the arrows.</p>';
    }
    return (
      "<div>" +
      U.sectionTitle("ROLLOUT PLAN · CHANGE-CONTROL", "Six steps, one safe order. Place them, then fine-tune with the arrows.", icon("listordered", 16, "text-red")) +
      '<p class="draft-mono" style="font-size:11px;color:var(--amber-text);border:1px solid rgba(240,168,50,0.4);background:rgba(240,168,50,0.05);border-radius:2px;padding:8px 10px;margin-bottom:12px">' + esc(D.ROLLOUT_RULES) + "</p>" +
      '<ol aria-label="Your rollout order">' + items + "</ol>" +
      unplaced + clearBtn + verdict +
      "</div>"
    );
  }

  function renderDetectionCard(state) {
    var enabled = state.records.detection;
    var rules = D.DETECTION_RULES
      .map(function (r) {
        var on = enabled.includes(r.id);
        return (
          '<li class="det-rule ' + (on ? "on" : "") + '">' +
          "<div><p class=\"det-id draft-mono\">" + esc(r.id) + '</p><p class="det-text">' + esc(r.text) + "</p></div>" +
          btn('class="' + (on ? "btn-secondary" : "btn-outline") + ' minh-11" style="font-size:11px;padding:0.25rem 0.75rem;flex-shrink:0" aria-pressed="' + on + '" data-act="det-toggle" data-id="' + r.id + '"', on ? "MUTE" : "ENABLE") +
          "</li>"
        );
      })
      .join("");
    return (
      "<div>" +
      U.sectionTitle("DETECTION CANDIDATES · GUEST NETWORK", "Enable exactly the rule that detects adversary behavior without drowning the queue.", icon("radar", 16, "text-red")) +
      '<ul class="stack-2">' + rules + "</ul>" +
      '<p class="draft-mono" style="font-size:10px;color:var(--muted-foreground);margin-top:8px">Detection quality = signal ÷ noise. A rule that fires on Tuesday gets muted by Friday — and then detects nothing.</p>' +
      "</div>"
    );
  }

  function renderResidualCard(state) {
    var Q = D.RESIDUAL_QUESTION;
    var st = state.records.residualStatement;
    var fam = state.records.residualFamily;
    var done = st && fam;
    var ok = st === Q.correctStatement && fam === Q.correctFamily;
    var stmts = Q.statements
      .map(function (s) {
        var chosen = st === s.id;
        var reveal = done && chosen;
        var cls = "residual-btn";
        if (reveal) cls += s.ok ? " reveal-ok" : " reveal-bad";
        else if (chosen) cls += " chosen";
        return (
          '<button type="button" class="' + cls + '" aria-pressed="' + chosen + '" data-act="residual-stmt" data-id="' + s.id + '">' +
          '<span class="residual-id draft-mono">' + s.id + "</span>" + esc(s.text) + "</button>"
        );
      })
      .join("");
    var fams = Q.families
      .map(function (f) {
        var chosen = fam === f.id;
        var reveal = done && chosen;
        var cls = "residual-btn";
        if (reveal) cls += f.id === Q.correctFamily ? " reveal-ok" : " reveal-bad";
        else if (chosen) cls += " chosen";
        return (
          '<button type="button" class="' + cls + '" aria-pressed="' + chosen + '" data-act="residual-fam" data-id="' + f.id + '">' +
          '<span class="residual-id draft-mono">' + f.id + "</span>" + esc(f.text) + "</button>"
        );
      })
      .join("");
    var explain = done
      ? '<p class="explain-block ' + (ok ? "ok" : "warn") + '" aria-live="polite">' + esc(Q.explain) + "</p>"
      : "";
    return (
      "<div>" +
      U.sectionTitle("RESIDUAL RISK STATEMENT", "Sign-off honesty: what is STILL true after the green audit?", icon("shieldquestion", 16, "text-red")) +
      '<p style="font-size:12.5px;margin-bottom:8px;line-height:1.375">' + esc(Q.prompt) + "</p>" +
      '<fieldset class="residual-field"><legend class="stencil">STATEMENT</legend>' + stmts + "</fieldset>" +
      '<fieldset class="residual-field"><legend class="stencil">CLOSING CONTROL FAMILY</legend>' + fams + "</fieldset>" +
      explain +
      "</div>"
    );
  }

  window.RL_PANELS = {
    renderCatalog: renderCatalog,
    renderTrafficBay: renderTrafficBay,
    renderFieldManual: renderFieldManual,
    renderEvidencePack: renderEvidencePack,
    renderSwitch: renderSwitch,
    verdictOk: verdictOk,
    PREDICT_OPTIONS: PREDICT_OPTIONS,
  };
})();
