// ═══════════════════════════════════════════════════════════════════════════
// Gateway Operations Center — Lab 001 · js/app.js
// Bootstrap, phase router (gate → briefing → ops floor) and all region
// renderers: status strip, atlas, bench rail, the six benches, task ledger,
// reference locker + glossary drawers, comms-check / debrief modals and the
// reset confirm dialog. Event handling is delegated from #app.
// ═══════════════════════════════════════════════════════════════════════════

(function (root) {
  "use strict";
  var D = root.GocData;
  var E = root.GocEngine;
  var UI = root.GocUI;
  var U = UI.esc;
  var ic = UI.icon;
  var Store = root.GocStore;
  var A = Store.actions;

  var app = null;

  // ── component-local UI state (mirrors the original's useState hooks) ──────
  var local;
  function resetLocal() {
    local = {
      dst: "",
      simMsg: null,
      fwdTab: "scope",
      protoTab: "ospf",
      staticPlan: { router: "R2", prefix: "", nextHop: "", ad: "1", msg: null },
      trunk: { newTag: "10", newIp: "", benchMsg: null },
    };
  }

  function st() { return Store.state; }
  function res(id) { return st().results[id]; }
  function ans(obj, key) {
    var a = st().answers[obj];
    return a ? a[key] : undefined;
  }
  function ansSelect(obj, key, options, ariaLabel, tall) {
    return UI.selectHTML(
      { id: "sel-" + obj + "__" + key, cls: tall ? "select-tall" : "" },
      ans(obj, key) === undefined ? "" : String(ans(obj, key)),
      options,
      ariaLabel
    ).replace('data-select="' + "sel-" + obj + "__" + key + '"', 'data-select="ans|' + obj + "|" + key + '"');
  }

  // ═══════════════════════════════ PHASE: MODE GATE ═════════════════════════
  var MODES = [
    {
      id: "medium",
      icon: "graduation-cap",
      name: "MEDIUM",
      sub: "Educational · understand & learn",
      body: "12 guided orders on the shift sheet, introduced one at a time. Every order points you where to look, hints go three levels deep, and every check explains WHY — wrong answers teach, they never punish.",
      rows: [
        { icon: "list-ordered", text: "12 granular orders, guided in sequence" },
        { icon: "compass", text: "Spotlights + 3-tier hints on every order" },
        { icon: "timer-reset", text: "Tolerant checks: synonyms accepted, teaching on every miss" },
      ],
      accent: "#3FBF9F",
    },
    {
      id: "hard",
      icon: "flame",
      name: "HARD",
      sub: "Challenge · test & stretch",
      body: "A case file of 9 broad incidents on a noisy estate — red herrings included. No spotlights, one costly nudge, strict exact-value validation. You triage, diagnose and defend every call.",
      rows: [
        { icon: "map", text: "9 multi-step incidents, free order, interlocking" },
        { icon: "flame", text: "Distractors & 2+ red herrings in the evidence" },
        { icon: "timer-reset", text: "Strict checks: exact IDs, exact values, rejected near-misses" },
      ],
      accent: "#F2A93B",
    },
  ];

  function renderGate() {
    var h = '<main class="goc-root gate">';
    h += '<div class="gate-inner">';
    h += '<div style="text-align:center;margin-bottom:8px">';
    h += '<div class="gate-badge"><span class="pulse-dot goc-pulse"></span><span class="goc-board">ATLAS FREIGHT &amp; CARTAGE CO-OP · GATEWAY OPERATIONS CENTER · NIGHT WATCH</span></div>';
    h += '<h1 class="goc-board gate-h1">ROUTING OPERATIONS LAB</h1>';
    h += '<p class="gate-sub">CompTIA Network+ <span class="hl">N10-009 · Objective 2.1</span> — Routing technologies: static &amp; dynamic (BGP · EIGRP · OSPF), route selection, NAT, PAT, FHRP, VIP, subinterfaces. All telemetry is a <span class="hl2">labeled training simulation</span> — fictional freight co-op, documentation addresses only.</p>';
    h += "</div>";
    h += '<div class="mode-grid">';
    MODES.forEach(function (m, i) {
      h +=
        '<button type="button" class="mode-card" data-act="mode:' + m.id + '" style="animation-delay:' + (0.1 + i * 0.12) +
        's" aria-label="Start ' + m.name + " mode: " + m.sub + '">';
      h += '<span class="mc-top"><span class="goc-board mc-name" style="color:' + m.accent + '">' + m.name + '</span><span style="color:' + m.accent + ';display:inline-flex">' + ic(m.icon, "mc-icon") + "</span></span>";
      h += '<span class="mc-sub">' + m.sub + "</span>";
      h += '<span class="mc-body">' + m.body + "</span>";
      h += "<ul>";
      m.rows.forEach(function (r) {
        h += '<li><span style="color:' + m.accent + ';display:inline-flex">' + ic(r.icon) + "</span><span>" + r.text + "</span></li>";
      });
      h += "</ul>";
      h += '<span class="mc-cta">→ Take the shift</span>';
      h += "</button>";
    });
    h += "</div>";
    h += '<p class="gate-foot">Both modes share the same network, the same atlas, the same consoles — only the briefing changes. Progress auto-saves in your browser.</p>';
    h += "</div></main>";
    app.innerHTML = h;
  }

  // ═══════════════════════════════ PHASE: BRIEFING ══════════════════════════
  function renderBriefing() {
    var hard = st().mode === "hard";
    var h = '<main class="goc-root briefing">';
    h += '<section class="briefing-card" aria-label="Shift briefing">';
    h += '<div class="goc-board briefing-kicker">' + ic("radio") + " SHIFT HANDOVER · " + (hard ? "CASE FILE ATTACHED" : "SHIFT SHEET ATTACHED") + "</div>";
    h += '<h1 class="goc-board briefing-h1">ATLAS FREIGHT &amp; CARTAGE CO-OP</h1>';
    h += '<div class="briefing-body">';
    h += "<p>Welcome to the night watch, operator. Atlas Freight runs a three-site estate: <strong>HQ campus</strong> (VLAN 10 staff, VLAN 20 servers, gateway pair R1/R1B sharing the FHRP VIP), a <strong>branch depot</strong> behind R2, and a <strong>border router R3</strong> with NAT/PAT and eBGP handoffs to two ISPs. Interior routing mixes OSPF (to the depot) and EIGRP (to the border) — exactly the mixed estate the N10-009 2.1 objectives prepare you for.</p>";
    if (hard) {
      h += "<p>The previous operator left in a hurry. Some of the estate is misconfigured on purpose for your training watch; <strong style=\"color:#E8834A\">your case file contains nine incidents — but also red herrings.</strong> Nothing tells you where to look: read tables, trace packets, name exact values, and be ready to justify every call. One optional nudge exists and it costs score.</p>";
    } else {
      h += "<p>The previous operator left in a hurry. Some of the estate is misconfigured on purpose for your training watch; <strong style=\"color:#3FBF9F\">your shift sheet walks you through all twelve orders in sequence,</strong> each with context, a spotlight on where to look, three hint levels and a check that explains the &ldquo;why&rdquo; behind every verdict.</p>";
    }
    h += '<div class="briefing-cards">';
    h += '<div class="bcard"><span style="color:#3FBF9F;display:inline-flex">' + ic("building-2") + '</span><div class="bc-label">The estate</div><div class="bc-body">3 sites · 4 routers · 2 VLANs · 2 ISPs · RFC 1918 + documentation space only</div></div>';
    h += '<div class="bcard"><span style="color:#F2A93B;display:inline-flex">' + ic("shield-check") + '</span><div class="bc-label">The rules</div><div class="bc-body">Simulated training data throughout · read evidence before touching configs · prove every fix</div></div>';
    h += '<div class="bcard"><span style="color:#A78BFA;display:inline-flex">' + ic("radio") + '</span><div class="bc-label">The win</div><div class="bc-body">All orders closed + comms check passed → shift debrief with your signal rating</div></div>';
    h += "</div>";
    h += '<p class="briefing-cert">Certification tie-in: CompTIA Network+ N10-009 · Domain 2 (Network Implementation) · Objective 2.1 — routing technologies. Complete the lab and you will have explained, recognized, diagnosed and engineered every technology in the objective.</p>';
    h += "</div>";
    h += '<div class="briefing-foot">';
    h += '<button type="button" class="btn btn-ghost" data-act="briefing-back">← Back</button>';
    h += '<button type="button" class="btn btn-primary" data-act="briefing-enter" aria-label="Enter operations floor">Enter the ops floor ' + ic("arrow-right") + "</button>";
    h += "</div>";
    h += "</section></main>";
    app.innerHTML = h;
  }

  // ═══════════════════════════════ PHASE: OPS FLOOR ═════════════════════════
  var BENCHES = [
    { id: "forwarding", code: "B01", name: "FORWARDING", sub: "trace · census · tribunal" },
    { id: "static", code: "B02", name: "STATIC", sub: "route planner" },
    { id: "protocols", code: "B03", name: "PROTOCOLS", sub: "ospf · eigrp · bgp" },
    { id: "nat", code: "B04", name: "NAT / PAT", sub: "translation bench" },
    { id: "fhrp", code: "B05", name: "FHRP RIG", sub: "gateway pair" },
    { id: "trunk", code: "B06", name: "TRUNK", sub: "subinterfaces" },
  ];

  function renderOps() {
    resetLocal();
    var h = '<div class="goc-root">';
    h += '<a href="#bench-panel" class="skip-link">Skip to work bench</a>';
    h += '<header class="strip" id="strip" aria-label="Console status strip"></header>';
    h += '<div class="console-grid">';
    h += '<section class="atlas-section" aria-label="Network atlas" id="atlas-section"></section>';
    h += '<section class="bench-section" aria-label="Work benches">';
    h += '<div class="bench-rail" id="bench-rail" role="tablist" aria-label="bench selector"></div>';
    h += '<div id="bench-panel" class="bench-panel"></div>';
    h += "</section>";
    h += "</div>";
    h += '<section id="ledger"></section>';
    h += '<section id="handover" aria-label="Handover notes"></section>';
    h += '<div id="overlay-root"></div>';
    h += "</div>";
    app.innerHTML = h;
    renderStrip();
    renderAtlas();
    renderRail();
    renderBench();
    renderLedger();
    renderHandover();
    renderOverlay();
  }

  function renderStrip() {
    var el = document.getElementById("strip");
    if (!el) return;
    var s = st();
    var mode = s.mode;
    var objectives = Store.objectivesFor(mode);
    var done = objectives.filter(function (o) { return res(o.id) && res(o.id).done; }).length;
    var qDone = Store.quizDone(mode);
    var hard = mode === "hard";
    var h =
      '<div class="strip-inner">' +
      '<div class="strip-brand">' + ic("radio") +
      '<span class="goc-board strip-title">GOC · ROUTING OPS</span></div>' +
      '<span class="mode-chip" style="color:' + (hard ? "#F2A93B" : "#3FBF9F") +
      ";border-color:" + (hard ? "#F2A93B66" : "#3FBF9F66") +
      ";background:" + (hard ? "#F2A93B14" : "#3FBF9F14") + '">' +
      (hard ? "HARD · CASE FILE" : "MEDIUM · SHIFT SHEET") + "</span>" +
      '<span class="strip-progress" aria-live="polite" aria-label="mastery ' + done + " of " + objectives.length + ' objectives">' +
      ic("gauge", "i-14") + "<span>" + done + "/" + objectives.length + " orders</span>" +
      '<span class="progress-track"><span class="progress-fill" style="width:' +
      (objectives.length ? (done / objectives.length) * 100 : 0) + '%"></span></span>' +
      (qDone ? '<span class="icon" style="display:inline-flex;width:14px;height:14px;color:#F2A93B" aria-label="comms check complete">' +
        '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="#F2A93B" stroke="#F2A93B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        (root.LucidePaths.star || "") + "</svg></span>" : "") +
      "</span>" +
      '<div class="strip-actions">' +
      '<button type="button" class="btn btn-ghost btn-sm" data-act="drawer:locker" aria-label="Open reference locker">' + ic("book-open") + " Locker</button>" +
      '<button type="button" class="btn btn-ghost btn-sm" data-act="drawer:glossary" aria-label="Open glossary">' + ic("keyboard") + " Glossary</button>" +
      '<button type="button" class="btn btn-ghost btn-sm" data-act="modal:comms" aria-label="Open comms check quiz">' + ic("radio") + " Comms check</button>" +
      '<button type="button" class="btn btn-ghost btn-sm" data-act="modal:handover" aria-label="Open handover notes">' + ic("clipboard-list") + " Handover</button>" +
      '<button type="button" class="btn ' + (Store.isComplete(mode) ? "btn-primary" : "btn-ghost") + ' btn-sm" data-act="modal:debrief" aria-label="Open shift debrief">' + ic("star") + " Debrief</button>" +
      '<button type="button" class="btn btn-danger btn-icon" data-act="reset:open" aria-label="Reset the lab" title="Reset the lab">' + ic("rotate-ccw") + "</button>" +
      "</div></div>";
    el.innerHTML = h;
  }

  function renderAtlas() {
    var el = document.getElementById("atlas-section");
    if (!el) return;
    var s = st();
    var h =
      '<div class="atlas-card"><div class="atlas-head">' +
      '<span class="goc-board atlas-title">THE ATLAS · ATLAS FREIGHT ESTATE (SIMULATED)</span>' +
      '<span class="atlas-note">RFC1918 + RFC5737 training addresses</span></div>' +
      '<div class="atlas-frame">' + UI.atlasHTML(s.env, s.mode) + "</div>" +
      '<div class="edge-log-head"><div class="goc-board kicker">EDGE LOG · SYNTHETIC WATCH FEED</div>' +
      '<div class="edge-log" role="log" aria-label="edge watch log" aria-live="polite">' + UI.edgeLogHTML(s.env) + "</div></div></div>";
    el.innerHTML = h;
  }

  function renderRail() {
    var el = document.getElementById("bench-rail");
    if (!el) return;
    var active = st().activeBench;
    var h = "";
    BENCHES.forEach(function (b) {
      var on = active === b.id;
      h +=
        '<button type="button" class="bench-key" role="tab" aria-selected="' + on + '" tabindex="0"' +
        ' data-act="bench:' + b.id + '">' +
        '<div class="code">' + b.code + " · " + b.name + "</div>" +
        '<div class="sub">' + b.sub + "</div></button>";
    });
    el.innerHTML = h;
  }

  // ── bench dispatch with focus + scroll preservation ───────────────────────
  function renderBench() {
    var panel = document.getElementById("bench-panel");
    if (!panel) return;
    var active = document.activeElement;
    var focusId = null, selStart = null, selEnd = null;
    if (active && panel.contains(active) && active.id) {
      focusId = active.id;
      if (typeof active.selectionStart === "number") {
        selStart = active.selectionStart;
        selEnd = active.selectionEnd;
      }
    }
    var bench = st().activeBench;
    var html = "";
    switch (bench) {
      case "forwarding": html = benchForwarding(); break;
      case "static": html = benchStatic(); break;
      case "protocols": html = benchProtocols(); break;
      case "nat": html = benchNat(); break;
      case "fhrp": html = benchFhrp(); break;
      case "trunk": html = benchTrunk(); break;
    }
    panel.innerHTML = html;
    if (focusId) {
      var el = document.getElementById(focusId);
      if (el) {
        el.focus({ preventScroll: true });
        if (selStart !== null && el.setSelectionRange) {
          try { el.setSelectionRange(selStart, selEnd); } catch (e) { /* non-input */ }
        }
      }
    }
  }

  // ═══════════════ B01 · FORWARDING ═══════════════
  var PRESETS = [
    { ip: "10.10.10.55", why: "VLAN 10 host" },
    { ip: "10.10.20.55", why: "VLAN 20 host" },
    { ip: "10.30.0.77", why: "depot host" },
    { ip: "10.40.0.10", why: "DC mgmt" },
    { ip: "198.51.100.23", why: "Internet" },
  ];
  var CENSUS_ROWS = [
    { id: "r1-c1", label: "10.10.10.0/24" },
    { id: "r1-d1", label: "10.40.0.0/24" },
    { id: "r1-d2", label: "0.0.0.0/0 (via 10.0.13.2)" },
    { id: "r1-o1", label: "10.30.0.0/24" },
  ];
  var PROTO_OPTS = [
    { v: "connected", l: "Connected" },
    { v: "static", l: "Static" },
    { v: "ospf", l: "OSPF" },
    { v: "eigrp", l: "EIGRP" },
    { v: "bgp", l: "BGP" },
  ];

  function fwdTabs() {
    var hard = st().mode === "hard";
    var tabs = [
      ["scope", "SCOPE · TRACE"],
      ["hierarchy", "AD HIERARCHY"],
      ["tribunal", "TRIBUNAL"],
    ];
    if (hard) tabs.push(["duel", "DUEL"], ["transit", "TRANSIT"]);
    var h = '<div class="tabs-list" role="tablist" aria-label="forwarding bench tabs" data-tablist="fwd">';
    tabs.forEach(function (t) {
      h += '<button type="button" class="tab" role="tab" aria-selected="' + (local.fwdTab === t[0]) +
        '" data-fwd-tab="' + t[0] + '">' + t[1] + "</button>";
    });
    return h + "</div>";
  }

  function benchForwarding() {
    var s = st();
    var hard = s.mode === "hard";
    var r1Routes = E.effectiveR1Routes(s.env, s.mode);
    var lastRun = s.env.packetRuns[0] || null;

    var h = '<h3 class="goc-board bench-title">B01 · FORWARDING SCOPE</h3>';
    h += fwdTabs();

    // ── SCOPE ──
    h += '<div class="tab-panel" data-fwd-panel="scope"' + (local.fwdTab !== "scope" ? " hidden" : "") + '><div class="stack-lg">';
    h += '<div class="inset-card"><div class="kicker" style="color:#9FB0A5">Packet trace · R1 lookup</div>';
    h += '<div class="flex-row">';
    h += '<input id="in-dst" data-bind="dst" class="input grow" style="min-width:176px" value="' + U(local.dst) + '" placeholder="destination IPv4…" aria-label="destination IPv4 address">';
    h += '<button type="button" class="btn btn-primary" data-act="trace" aria-label="Run trace">' + ic("play") + " Trace</button></div>";
    h += '<div class="flex-row mt-2">';
    PRESETS.forEach(function (p) {
      h += '<button type="button" class="op-btn" data-act="preset:' + p.ip + '" aria-label="trace ' + p.ip + " (" + p.why + ')">' + p.ip + ' <span style="color:#5a6a5f">· ' + p.why + "</span></button>";
    });
    h += "</div>";
    if (local.simMsg) h += '<div class="err-text mt-2" role="alert">' + U(local.simMsg) + "</div>";

    if (lastRun) {
      h += '<div class="mt-3" style="border:1px solid #26332B;background:#121A15;border-radius:6px;padding:10px">';
      h += '<div class="mono-note" style="margin-bottom:6px">Lookup tribunal — candidates that match ' + U(lastRun.dst) + "</div>";
      lastRun.candidates.forEach(function (c, i) {
        h += '<div class="mono-line" style="display:flex;flex-wrap:wrap;align-items:center;gap:8px;border:1px solid ' +
          (c.winner ? "rgba(123,196,127,0.6)" : "#26332B") + ";background:" + (c.winner ? "rgba(123,196,127,0.1)" : "transparent") +
          ';border-radius:4px;padding:6px 8px;margin-bottom:4px;' + (c.winner ? "color:#E7EFE9" : "color:#9FB0A5") + '">';
        h += "<b>" + (i + 1) + ".</b>" + UI.protoChip(c.protocol) +
          '<span style="font-weight:600">' + U(c.prefix) + "</span><span>[" + c.ad + "/" + c.metric + "]</span>" +
          '<span style="color:#5a6a5f">/' + c.bits + "</span>";
        if (c.winner) h += '<span class="wins-badge">wins — longest prefix</span>';
        h += "</div>";
      });
      h += '<p class="mono-note mt-2">rule 1 · prefix length → rule 2 · administrative distance → rule 3 · metric</p></div>';
    }
    h += "</div>";

    h += UI.routeTable(r1Routes, {
      title: "R1 · HQ CORE — RUNNING ROUTE TABLE",
      subtitle: hard ? "2 legacy statics flagged for audit" : "live",
      highlightIds: ["r1-c1", "r1-d1", "r1-d2", "r1-o1"],
      onWithdraw: true,
    });
    if (s.env.removedRouteIds.length > 0) {
      h += '<div class="err-text" aria-live="polite">withdrawn: ' + U(s.env.removedRouteIds.join(", ")) + "</div>";
    }

    // M1 census (medium)
    if (!hard) {
      h += '<div class="inset-card"><div class="kicker" style="color:#F2A93B">ORDER M1 · route table census — classify the highlighted rows</div><div class="stack">';
      CENSUS_ROWS.forEach(function (row) {
        h += '<div><span class="mono-line" style="display:block;margin-bottom:4px;color:#c9d6cc">' + row.label + "</span>";
        h += ansSelect("M1", row.id, PROTO_OPTS, "classify " + row.label) + "</div>";
      });
      h += "</div>";
      h += '<div class="mt-3"><button type="button" class="btn btn-check" data-act="check:M1" aria-label="Check order M1">Check M1</button>';
      var rM1 = res("M1");
      if (rM1 && rM1.lastMsg && !rM1.done) h += UI.feedbackPanel(false, rM1.lastMsg);
      if (rM1 && rM1.done) h += UI.feedbackPanel(true, rM1.lastMsg || "");
      h += "</div></div>";
    }

    // M2 winners (medium)
    if (!hard) {
      var m2opts = [
        { v: "r1-c1", l: "connected 10.10.10.0/24" },
        { v: "r1-o1", l: "OSPF 10.30.0.0/24" },
        { v: "r1-d1", l: "EIGRP 10.40.0.0/24" },
        { v: "r1-d2", l: "EIGRP default 0.0.0.0/0" },
        { v: "r1-s-null", l: "static 10.30.0.0/25 → Null0" },
      ];
      h += '<div class="inset-card"><div class="kicker" style="color:#F2A93B">ORDER M2 · name the winning route for each trace</div>';
      h += '<div class="grid-3">';
      [
        { k: "d1", ip: "10.10.10.55" },
        { k: "d2", ip: "10.30.0.77" },
        { k: "d3", ip: "198.51.100.23" },
      ].forEach(function (x) {
        h += '<div><div class="mono-note" style="margin-bottom:4px">→ ' + x.ip + "</div>" + ansSelect("M2", x.k, m2opts, "winning route for " + x.ip) + "</div>";
      });
      h += "</div>";
      h += '<div class="mt-3"><button type="button" class="btn btn-check" data-act="check:M2" aria-label="Check order M2">Check M2</button>';
      var rM2 = res("M2");
      if (rM2 && rM2.lastMsg) h += UI.feedbackPanel(!!rM2.done && !!rM2.lastOk, rM2.lastMsg);
      h += "</div></div>";
    }

    // H1 diagnosis (hard)
    if (hard) {
      var h1opts1 = [
        { v: "r1-s-null", l: "10.30.0.0/25 → Null0 (static)" },
        { v: "r1-s-legacy", l: "172.16.99.0/24 (legacy audit)" },
        { v: "r1-o1", l: "10.30.0.0/24 via OSPF" },
        { v: "r1-d2", l: "0.0.0.0/0 via EIGRP" },
      ];
      var h1opts2 = [
        { v: "ad", l: "lowest administrative distance" },
        { v: "prefix", l: "longest prefix match" },
        { v: "metric", l: "lowest metric" },
      ];
      h += '<div class="case-card"><div class="kicker" style="color:#E05252">CASE 01 · the half-subnet blackhole — diagnosis record</div>';
      h += '<p style="margin:0 0 12px;font-size:12px;line-height:1.6;color:#c9d6cc">Depot lower half (10.30.0.0–127) unreachable, upper half fine. Name the winning bad route and the rule that empowers it, withdraw it (× on the table row), then re-trace 10.30.0.77 to prove delivery.</p>';
      h += '<div class="grid-2">';
      h += '<div><div class="mono-note" style="margin-bottom:4px">Culprit route</div>' + ansSelect("H1", "culprit", h1opts1, "culprit route") + "</div>";
      h += '<div><div class="mono-note" style="margin-bottom:4px">Rule that lets it win</div>' + ansSelect("H1", "rule", h1opts2, "selection rule") + "</div>";
      h += "</div>";
      h += '<div class="flex-row mt-3">';
      h += '<button type="button" class="btn btn-primary" data-act="trace:10.30.0.77" aria-label="Trace 10.30.0.77 to prove delivery">' + ic("search") + " Prove: trace 10.30.0.77</button>";
      h += '<button type="button" class="btn btn-check" data-act="check:H1" aria-label="Close case 01">Close case 01</button></div>';
      var rH1 = res("H1");
      if (rH1 && rH1.lastMsg) h += UI.feedbackPanel(!!rH1.lastOk, rH1.lastMsg);
      h += "</div>";
    }
    h += "</div></div>";

    // ── AD HIERARCHY ──
    h += '<div class="tab-panel" data-fwd-panel="hierarchy"' + (local.fwdTab !== "hierarchy" ? " hidden" : "") + "><div class=\"stack\">";
    if (!hard) {
      var adItems = UI.shuffledFor("m3-ad", D.AD_ITEMS.map(function (i) { return i.id; })).map(function (id) {
        var it = D.AD_ITEMS.filter(function (x) { return x.id === id; })[0];
        return { id: it.id, label: it.label + " (" + it.ad + ")" };
      });
      h += '<div class="inset-card"><div class="kicker" style="color:#F2A93B">ORDER M3 · rank the sources by default administrative distance</div>';
      h += '<p class="mono-line" style="margin:0 0 12px">Most trusted first. Values are industry-standard (Cisco convention), simplified for exam depth.</p>';
      h += UI.orderPicker({ id: "m3", items: adItems, picked: ans("M3", "order") || [], pickLabel: "rank" });
      h += '<div class="mt-4"><div class="mono-note" style="margin-bottom:4px">R3 tiebreak: BGP default via 203.0.113.9 (AD 20) vs floating static via 203.0.113.13 (AD 240) — which forwards today?</div>';
      h += ansSelect("M3", "tiebreak", [
        { v: "r3-b1", l: "BGP default (AD 20) — it wins" },
        { v: "r3-s1", l: "floating static (AD 240) — it wins" },
        { v: "both", l: "both — the router load-shares" },
      ], "tiebreak winner") + "</div>";
      h += '<div class="mt-3"><button type="button" class="btn btn-check" data-act="check:M3" aria-label="Check order M3">Check M3</button>';
      var rM3 = res("M3");
      if (rM3 && rM3.lastMsg) h += UI.feedbackPanel(!!rM3.lastOk, rM3.lastMsg);
      h += "</div></div>";
    } else {
      h += '<div class="inset-card"><div class="mono-line">Reference — trust order: <span style="color:#E7EFE9">Connected 0 · Static 1 · eBGP 20 · EIGRP 90 · OSPF 110 · iBGP 200</span>. Use it in the Duel tab.</div></div>';
    }
    h += "</div></div>";

    // ── TRIBUNAL ──
    h += '<div class="tab-panel" data-fwd-panel="tribunal"' + (local.fwdTab !== "tribunal" ? " hidden" : "") + "><div class=\"stack\">";
    h += '<div class="inset-card"><div class="kicker" style="color:#F2A93B">' + (!hard ? "ORDER M12 · " : "") + "the route selection tribunal — sandbox scenario (not the live table)</div>";
    h += '<p class="mono-line" style="margin:0 0 12px">Destination: ' + D.TRIBUNAL_DST + " — four candidates all match. Pick the winner, then order the three rules.</p>";
    D.TRIBUNAL_ROUTES.forEach(function (t) {
      var on = ans("M12", "winner") === t.id;
      h += '<label class="radio-row' + (on ? " on" : "") + '">';
      h += '<input type="radio" name="tribunal" data-radio="ans|M12|winner:' + t.id + '"' + (on ? " checked" : "") + ' aria-label="candidate ' + U(t.prefix) + '">';
      h += UI.protoChip(t.protocol) + '<span class="strong">' + t.prefix + "</span><span>[" + t.ad + "/" + t.metric + ']</span><span style="color:#5a6a5f">' + U(t.via) + "</span></label>";
    });
    h += '<div class="mt-4"><div class="mono-note" style="margin-bottom:8px">Order the selection rules (first = decided first)</div>';
    var ruleLabels = { prefix: "Longest prefix match", ad: "Administrative distance", metric: "Metric (within protocol)" };
    var ruleItems = UI.shuffledFor("m12-rules", ["prefix", "ad", "metric"]).map(function (id) {
      return { id: id, label: ruleLabels[id] };
    });
    h += UI.orderPicker({ id: "m12", items: ruleItems, picked: ans("M12", "rules") || [], pickLabel: "rule" }) + "</div>";
    h += '<div class="mt-3"><button type="button" class="btn btn-check" data-act="check:M12" aria-label="Check the tribunal">Verdict</button>';
    var rM12 = res("M12");
    if (rM12 && rM12.lastMsg) h += UI.feedbackPanel(!!rM12.lastOk, rM12.lastMsg);
    h += "</div></div></div></div>";

    // ── DUEL (hard) ──
    if (hard) {
      var duelOpts = [
        { v: "static", l: "Static (AD 1)" },
        { v: "eigrp", l: "EIGRP internal (AD 90)" },
        { v: "ospf", l: "OSPF (AD 110)" },
      ];
      h += '<div class="tab-panel" data-fwd-panel="duel"' + (local.fwdTab !== "duel" ? " hidden" : "") + "><div class=\"stack\">";
      h += '<div class="inset-card"><div class="kicker" style="color:#E05252">CASE 03 · three-way path duel — 172.16.8.0/22</div>';
      h += '<p class="mono-line" style="margin:0 0 12px">Round 1 — table shows: static [1/0], EIGRP internal [90/28416], OSPF [110/30].<br>Round 2 — the static is removed. Round 3 — EIGRP turns external (AD 170).</p>';
      [
        { k: "r1", label: "Round 1 winner (as given)" },
        { k: "r2", label: "Round 2 winner (static removed)" },
        { k: "r3", label: "Round 3 winner (EIGRP external 170)" },
      ].forEach(function (r) {
        h += '<div class="mb-3"><div class="mono-note" style="margin-bottom:4px">' + r.label + "</div>" + ansSelect("H3", r.k, duelOpts, r.label) + "</div>";
      });
      h += '<div class="mono-note" style="margin-bottom:4px">What role does METRIC play in these duels?</div>';
      h += ansSelect("H3", "role", [
        { v: "within-protocol", l: "Ranks paths only WITHIN one protocol — never across protocols" },
        { v: "across-protocols", l: "Compared across protocols after AD ties" },
        { v: "hop-count", l: "It counts router hops to the destination" },
      ], "metric role");
      h += '<div class="mt-3"><button type="button" class="btn btn-check" data-act="check:H3" aria-label="Close case 03">Close case 03</button>';
      var rH3 = res("H3");
      if (rH3 && rH3.lastMsg) h += UI.feedbackPanel(!!rH3.lastOk, rH3.lastMsg);
      h += "</div></div></div></div>";

      // ── TRANSIT (hard) ──
      var opItems = UI.shuffledFor("h8-ops", D.H8_OPS.map(function (o) { return o.id; })).map(function (id) {
        var o = D.H8_OPS.filter(function (x) { return x.id === id; })[0];
        return { id: o.id, label: o.text };
      });
      h += '<div class="tab-panel" data-fwd-panel="transit"' + (local.fwdTab !== "transit" ? " hidden" : "") + "><div class=\"stack\">";
      h += '<div class="inset-card"><div class="kicker" style="color:#E05252">CASE 08 · full transit autopsy — PC-A (VLAN 10) → 198.51.100.23</div>';
      h += '<p class="mono-line" style="margin:0 0 12px">Place all six operations in the order they occur. Every lesson technology appears exactly once.</p>';
      h += UI.orderPicker({ id: "h8", items: opItems, picked: s.env.h8order, pickLabel: "operation" });
      h += '<div class="mt-3"><button type="button" class="btn btn-check" data-act="check:H8" aria-label="Close case 08">Close case 08</button>';
      var rH8 = res("H8");
      if (rH8 && rH8.lastMsg) h += UI.feedbackPanel(!!rH8.lastOk, rH8.lastMsg);
      h += "</div>";
      h += '<div class="mono-note mt-2" style="font-size:9.5px;color:#5a6a5f">six operations · each used exactly once · order is not the display order</div>';
      h += "</div></div></div>";
    }

    return h;
  }

  // ═══════════════ B02 · STATIC ═══════════════
  function benchStatic() {
    var s = st();
    var r2 = E.effectiveR2Routes(s.env);
    var mine = s.env.staticRoutes;
    var sp = local.staticPlan;
    var rM4 = res("M4");

    var h = '<h3 class="goc-board bench-title">B02 · STATIC ROUTE PLANNER</h3>';
    h += '<div class="inset-card"><div class="kicker" style="color:#9FB0A5">Planner — install a static route by hand</div>';
    h += '<div class="grid-2">';
    h += '<label style="display:block"><span class="field-label">Router</span>' +
      UI.selectHTML({ id: "sel-static-router", cls: "select-tall" }, sp.router, [
        { v: "R1", l: "R1 · HQ core" }, { v: "R2", l: "R2 · branch" }, { v: "R3", l: "R3 · border" },
      ], "router").replace('data-select="sel-static-router"', 'data-select="static-router"') + "</label>";
    h += '<label style="display:block"><span class="field-label">Prefix (with /mask)</span>' +
      '<input id="in-static-prefix" data-bind="static-prefix" class="input" value="' + U(sp.prefix) + '" placeholder="0.0.0.0/0" aria-label="destination prefix"></label>';
    h += '<label style="display:block"><span class="field-label">Next hop</span>' +
      '<input id="in-static-nexthop" data-bind="static-nexthop" class="input" value="' + U(sp.nextHop) + '" placeholder="10.0.12.1" aria-label="next hop address"></label>';
    h += '<label style="display:block"><span class="field-label">Administrative distance (1 = normal static · raise it to float)</span>' +
      '<input id="in-static-ad" data-bind="static-ad" class="input" inputmode="numeric" value="' + U(sp.ad) + '" aria-label="administrative distance"></label>';
    h += "</div>";
    h += '<div class="flex-row mt-3"><button type="button" class="btn btn-primary" data-act="static-add" aria-label="Install static route">' + ic("plus") + " ip route</button>";
    if (sp.msg) h += '<span class="' + (sp.msg.ok ? "ok-text" : "err-text") + '" role="status">' + U(sp.msg.text) + "</span>";
    h += "</div></div>";

    if (mine.length > 0) {
      h += '<div class="inset-card"><div class="kicker" style="color:#9FB0A5">Your installed statics (' + mine.length + ')</div><ul style="margin:0;padding:0;list-style:none;display:grid;gap:6px">';
      mine.forEach(function (sr) {
        h += '<li class="mono-line" style="display:flex;align-items:center;gap:8px;border:1px solid #26332B;background:#121A15;border-radius:4px;padding:6px 10px">';
        h += '<b style="color:#D7E0D9">' + sr.router + "</b><span style=\"color:#E7EFE9\">ip route " + U(sr.prefix) + " " + U(sr.nextHop) + " " + sr.ad + "</span>";
        h += '<button type="button" class="btn btn-danger btn-icon-sm" style="margin-left:auto" data-act="static-remove:' + sr.id + '" aria-label="remove route ' + U(sr.prefix) + '">' + ic("trash-2") + "</button></li>";
      });
      h += "</ul></div>";
    }

    h += UI.routeTable(r2, { title: "R2 · BRANCH — RUNNING ROUTE TABLE", subtitle: "OSPF routes appear when the adjacency is Full" });

    h += '<div class="inset-card"><div class="kicker" style="color:#F2A93B">ORDER M4 · floating static default for the branch</div>';
    h += '<p class="mono-line" style="margin:0 0 8px">Install on <span style="color:#E7EFE9">R2</span>: prefix <span style="color:#E7EFE9">0.0.0.0/0</span>, next hop <span style="color:#E7EFE9">10.0.12.1</span>, AD <span style="color:#E7EFE9">200</span> — then answer who owns the default today.</p>';
    h += ansSelect("M4", "winner", [
      { v: "ospf", l: "OSPF default [110/2] — it wins today" },
      { v: "static", l: "my floating static [200/0] — it wins today" },
      { v: "none", l: "no default exists yet" },
    ], "current default winner on R2");
    h += '<div class="mt-3"><button type="button" class="btn btn-check" data-act="check:M4" aria-label="Check order M4">Check M4</button>';
    if (rM4 && rM4.lastMsg) h += UI.feedbackPanel(!!rM4.lastOk, rM4.lastMsg);
    h += "</div></div>";
    return h;
  }

  // ═══════════════ B03 · PROTOCOLS ═══════════════
  function factGroup(objId, key, label, options, selected) {
    var h = '<fieldset class="fact-group"><legend>' + label + "</legend>" + '<div class="fact-opts">';
    options.forEach(function (o) {
      var on = selected.indexOf(o.id) !== -1;
      h += '<label class="fact-opt' + (on ? " on" : "") + '">';
      h += '<input type="checkbox" data-fact="' + objId + "|" + key + "|" + o.id + '"' + (on ? " checked" : "") + ">";
      h += "<span>" + o.label + "</span></label>";
    });
    h += "</div></fieldset>";
    return h;
  }

  function benchProtocols() {
    var s = st();
    var hard = s.mode === "hard";
    var nbr = E.ospfNeighborView(s.env);
    var facts5 = ans("M5", "facts") || [];
    var facts6 = ans("M6", "facts") || [];
    var sessObj = hard ? "H4" : "M7";

    var tabs = [["ospf", "OSPF", "tab-teal"], ["eigrp", "EIGRP", "tab-violet"], ["bgp", "BGP", ""]];
    if (hard) tabs.push(["selector", "SELECTOR", "tab-orange"]);

    var h = '<h3 class="goc-board bench-title">B03 · PROTOCOL TELEMETRY</h3>';
    h += '<div class="tabs-list" role="tablist" aria-label="protocol bench tabs" data-tablist="proto">';
    tabs.forEach(function (t) {
      h += '<button type="button" class="tab ' + t[2] + '" role="tab" aria-selected="' + (local.protoTab === t[0]) +
        '" data-proto-tab="' + t[0] + '">' + t[1] + "</button>";
    });
    h += "</div>";

    // ── OSPF ──
    h += '<div class="tab-panel" data-proto-panel="ospf"' + (local.protoTab !== "ospf" ? " hidden" : "") + "><div class=\"stack\">";
    h += '<div class="inset-card"><div class="kicker" style="color:#3FBF9F">R1 — OSPF neighbor table</div>';
    h += '<table class="goc-table" style="min-width:0"><thead><tr><th>Neighbor</th><th>State</th><th>Detail</th></tr></thead><tbody>';
    h += '<tr><td style="color:#E7EFE9">10.0.12.2 (R2, G0/1)</td><td><span class="mono-line" style="border-radius:3px;padding:2px 6px;font-size:10px;font-weight:700;background:' +
      (nbr.state === "FULL" ? "rgba(123,196,127,0.2);color:#7BC47F" : "rgba(224,82,82,0.2);color:#E05252") + '">' + nbr.state + "</span></td>" +
      '<td class="mono-line" aria-live="polite">' + U(nbr.detail) + "</td></tr></tbody></table>";
    var r2side = hard
      ? (s.env.ospfStage === "timers" ? "area 0 · hello 10 / dead 20 · MTU 1400" : "area 0 · hello 10 / dead 40 · MTU 1400")
      : "area 1 · hello 10 / dead 40 · MTU 1500";
    h += '<div class="mono-line mt-3" style="border:1px solid #26332B;background:#121A15;border-radius:4px;padding:10px">' +
      '<span style="color:#E7EFE9">R1 side (G0/1):</span> area 0 · hello 10 / dead 40 · MTU 1500<br>' +
      '<span style="color:#E7EFE9">R2 side (G0/1):</span> ' + r2side + "</div>";
    h += '<p class="mono-note mt-2">Route 10.30.0.0/24 appears on R1 only when this neighbor reaches FULL.</p></div>';

    if (!hard) {
      var m5opts = [
        { id: "linkstate", label: "Link-state — every router builds the full map from LSAs" },
        { id: "spf", label: "Runs Dijkstra SPF against the LSDB" },
        { id: "cost", label: "Metric is cost, derived from bandwidth" },
        { id: "ad110", label: "Default administrative distance 110" },
        { id: "area0", label: "Hierarchical areas — the backbone is area 0" },
        { id: "hopcount", label: "Metric is a hop count" },
        { id: "dual", label: "Uses the DUAL algorithm" },
        { id: "tcp179", label: "Peers over TCP port 179" },
        { id: "pathvector", label: "Path-vector protocol between autonomous systems" },
      ];
      h += '<div class="inset-card"><div class="kicker" style="color:#F2A93B">ORDER M5 · OSPF facts — mark every TRUE statement</div>';
      h += factGroup("M5", "facts", "OSPF is…", m5opts, facts5);
      h += '<div class="grid-2 mt-3"><div><div class="mono-note" style="margin-bottom:4px">The repair for this stuck adjacency</div>';
      h += ansSelect("M5", "fix", [
        { v: "area0", l: "Match areas: put R2's interface back in area 0" },
        { v: "timers", l: "Match hello/dead timers on both ends" },
        { v: "mtu", l: "Raise R2's interface MTU to 1500" },
        { v: "shutdown", l: "Shut and re-open R1's G0/1" },
      ], "adjacency fix");
      h += '</div><div style="display:flex;align-items:flex-end"><button type="button" class="btn btn-primary" data-act="ospf-fix:area0" aria-label="Apply the selected repair">' + ic("wrench") + " Apply repair (set R2 → area 0)</button></div></div>";
      h += '<div class="mt-3"><button type="button" class="btn btn-check" data-act="check:M5" aria-label="Check order M5">Check M5</button>' + resultBlock(res("M5")) + "</div></div>";
    } else {
      h += '<div class="case-card"><div class="kicker" style="color:#E05252">CASE 02 · adjacency forensics — two drifts, one link</div>';
      h += '<div class="grid-2">';
      h += '<div><div class="mono-note" style="margin-bottom:4px">Stage 1 · INIT is caused by…</div>';
      h += ansSelect("H2", "init", [
        { v: "timers", l: "hello/dead timer mismatch" },
        { v: "area", l: "area number mismatch" },
        { v: "mtu", l: "MTU mismatch" },
      ], "init cause");
      h += '<div class="mt-2"><button type="button" class="btn btn-ghost" data-act="ospf-fix:timers"' +
        (s.env.ospfStage !== "timers" ? " disabled" : "") + ' aria-label="Apply timer fix">' + ic("wrench") + " Match timers (10/40 both ends)</button></div></div>";
      h += '<div><div class="mono-note" style="margin-bottom:4px">Stage 2 · EXSTART/EXCHANGE is caused by…</div>';
      h += ansSelect("H2", "exstart", [
        { v: "timers", l: "hello/dead timer mismatch" },
        { v: "area", l: "area number mismatch" },
        { v: "mtu", l: "MTU mismatch" },
      ], "exstart cause");
      h += '<div class="mt-2"><button type="button" class="btn btn-ghost" data-act="ospf-fix:mtu"' +
        (s.env.ospfStage !== "mtu" ? " disabled" : "") + ' aria-label="Apply MTU fix">' + ic("wrench") + " Match MTU (1500 both ends)</button></div></div>";
      h += "</div>";
      h += '<div class="mt-3"><button type="button" class="btn btn-check" data-act="check:H2" aria-label="Close case 02">Close case 02</button>' + resultBlock(res("H2")) + "</div></div>";
    }
    h += "</div></div>";

    // ── EIGRP ──
    h += '<div class="tab-panel" data-proto-panel="eigrp"' + (local.protoTab !== "eigrp" ? " hidden" : "") + "><div class=\"stack\">";
    h += '<div class="inset-card"><div class="kicker" style="color:#A78BFA">R1 — EIGRP topology table · 10.40.0.0/24 (metric simplified)</div>';
    h += '<table class="goc-table" style="min-width:0"><thead><tr><th>Path</th><th>Via</th><th>Bandwidth</th><th>Delay</th><th>Composite</th></tr></thead><tbody>';
    D.EIGRP_TOPOLOGY.forEach(function (p) {
      h += "<tr><td style=\"font-weight:700;color:#E7EFE9\">" + p.id + '</td><td class="mono-line">' + U(p.via) + '</td><td class="mono-line">' + p.bandwidthMbps +
        ' Mbps</td><td class="mono-line">' + p.delayUs + ' µs</td><td style="font-weight:600;color:#A78BFA">' + p.composite + "</td></tr>";
    });
    h += "</tbody></table>";
    h += '<p class="mono-note mt-2">DUAL keeps the best path as successor and a pre-validated loop-free standby as feasible successor.</p></div>';

    if (!hard) {
      var m6opts = [
        { id: "cisco", label: "Cisco-originated — informational RFC 7868 since 2016, still Cisco-dominant" },
        { id: "hybrid", label: "Advanced distance-vector, often called a hybrid" },
        { id: "dual", label: "Runs DUAL and keeps a loop-free feasible successor standby" },
        { id: "composite", label: "Default composite metric: bandwidth + delay" },
        { id: "ad90", label: "AD 90 internal · 170 external" },
        { id: "linkstate", label: "Link-state with flooded LSAs" },
        { id: "hopcount", label: "Metric is a hop count" },
        { id: "aspath", label: "Best path = shortest AS-path" },
        { id: "core", label: "The protocol that routes the Internet between organizations" },
      ];
      h += '<div class="inset-card"><div class="kicker" style="color:#F2A93B">ORDER M6 · EIGRP facts — mark every TRUE statement</div>';
      h += factGroup("M6", "facts", "EIGRP is…", m6opts, facts6);
      h += '<div class="mt-3"><div class="mono-note" style="margin-bottom:4px">Successor path to 10.40.0.0/24</div><div class="flex-row">';
      ["a", "b"].forEach(function (p) {
        var on = ans("M6", "successor") === p;
        h += '<label class="radio-row' + (on ? " on-violet" : "") + '" style="min-height:44px">';
        h += '<input type="radio" name="eigrp-succ" class="violet" data-radio="ans|M6|successor:' + p + '"' + (on ? " checked" : "") + ' aria-label="path ' + p.toUpperCase() + '">';
        h += "Path " + p.toUpperCase() + " (composite " + (p === "a" ? "3072" : "28416") + ")</label>";
      });
      h += "</div></div>";
      h += '<div class="mt-3"><button type="button" class="btn btn-check" data-act="check:M6" aria-label="Check order M6">Check M6</button>' + resultBlock(res("M6")) + "</div></div>";
    }
    h += "</div></div>";

    // ── BGP ──
    h += '<div class="tab-panel" data-proto-panel="bgp"' + (local.protoTab !== "bgp" ? " hidden" : "") + "><div class=\"stack\">";
    h += '<div class="inset-card"><div class="kicker" style="color:#F2A93B">R3 (AS 65001) — BGP sessions</div><div class="grid-3">';
    [
      { k: "s1", label: "R3 ↔ ISP-1", sub: "65001 ↔ 100" },
      { k: "s2", label: "R3 ↔ ISP-2", sub: "65001 ↔ 200" },
      { k: "s3", label: "R3 ↔ R1", sub: "65001 ↔ 65001" },
    ].forEach(function (x) {
      h += '<div><div class="mono-note" style="margin-bottom:4px">' + x.label + ' <span style="color:#5a6a5f">· ' + x.sub + "</span></div>";
      h += ansSelect(sessObj, x.k, [{ v: "ebgp", l: "eBGP" }, { v: "ibgp", l: "iBGP" }], "session type " + x.label) + "</div>";
    });
    h += "</div></div>";

    h += '<div class="table-card"><div class="table-head"><span class="table-title">R3 — BGP TABLE</span><span class="table-sub">best path marked per prefix · exam rule: shortest AS-path</span></div>';
    h += '<div class="table-scroll" style="max-height:none"><table class="goc-table" style="min-width:520px"><thead><tr><th>Network</th><th>Next hop</th><th>AS-path</th><th>Best</th></tr></thead><tbody>';
    D.BGP_TABLE.forEach(function (r) {
      h += '<tr class="' + (r.best ? "best-row" : "") + '">';
      h += '<td style="color:#E7EFE9">' + r.network + '</td><td class="nexthop-cell">' + r.nextHop + '</td><td style="font-weight:600;color:#F2A93B">' + r.asPath + "</td>";
      h += "<td>" + (r.best ? '<span style="color:#7BC47F">&gt;i</span>' : '<span style="color:#5a6a5f">—</span>') + "</td></tr>";
    });
    h += "</tbody></table></div></div>";

    if (!hard) {
      h += '<div class="inset-card"><div class="kicker" style="color:#F2A93B">ORDER M7 · best path &amp; port</div><div class="grid-2">';
      h += '<div><div class="mono-note" style="margin-bottom:4px">Best path to 198.51.100.0/24</div>';
      h += ansSelect("M7", "best", [
        { v: "via 203.0.113.9", l: "via 203.0.113.9 (ISP-1)" },
        { v: "via 203.0.113.13", l: "via 203.0.113.13 (ISP-2)" },
      ], "best path") + "</div>";
      h += '<div><div class="mono-note" style="margin-bottom:4px">BGP transport: TCP port</div>';
      h += '<input id="in-m7-port" data-answer="M7|port" class="input input-sm" inputmode="numeric" value="' + U(ans("M7", "port") === undefined ? "" : ans("M7", "port")) + '" placeholder="179" aria-label="BGP TCP port" style="height:36px"></div>';
      h += "</div>";
      h += '<div class="mt-3"><button type="button" class="btn btn-check" data-act="check:M7" aria-label="Check order M7">Check M7</button>' + resultBlock(res("M7")) + "</div></div>";
    } else {
      h += '<div class="case-card"><div class="kicker" style="color:#E05252">CASE 04 · BGP session engineering — egress design</div><div class="grid-3">';
      h += '<div><div class="mono-note" style="margin-bottom:4px">Best path to 198.51.100.0/24</div>';
      h += ansSelect("H4", "best", [
        { v: "via 203.0.113.9", l: "via 203.0.113.9 (ISP-1)" },
        { v: "via 203.0.113.13", l: "via 203.0.113.13 (ISP-2)" },
      ], "best path") + "</div>";
      h += '<div><div class="mono-note" style="margin-bottom:4px">ISP carrying that prefix</div>';
      h += ansSelect("H4", "isp", [{ v: "ISP1", l: "ISP-1 (AS 100)" }, { v: "ISP2", l: "ISP-2 (AS 200)" }], "transit ISP") + "</div>";
      h += '<div><div class="mono-note" style="margin-bottom:4px">Deciding attribute</div>';
      h += ansSelect("H4", "attr", [
        { v: "ad", l: "administrative distance" },
        { v: "aspath", l: "shortest AS-path" },
        { v: "metric", l: "lowest metric" },
        { v: "weight", l: "highest weight (default tiebreak)" },
      ], "deciding attribute") + "</div>";
      h += "</div>";
      h += '<div class="mt-3"><button type="button" class="btn btn-check" data-act="check:H4" aria-label="Close case 04">Close case 04</button>' + resultBlock(res("H4")) + "</div></div>";
    }
    h += "</div></div>";

    // ── SELECTOR (hard) ──
    if (hard) {
      h += '<div class="tab-panel" data-proto-panel="selector"' + (local.protoTab !== "selector" ? " hidden" : "") + "><div class=\"stack\">";
      h += '<div class="inset-card"><div class="kicker" style="color:#E8834A">CASE 09 · protocol selection matrix</div>';
      [
        { k: "isp", label: "Exchange routes with two Internet providers (policy between organizations)" },
        { k: "multivendor", label: "Multi-vendor hierarchical campus — open standard, areas, fastest IGP scaling" },
        { k: "cisco", label: "All-Cisco campus where fastest convergence via feasible successors wins" },
        { k: "stub", label: "A single-homed stub site with one way out and no dynamic neighbors wanted" },
      ].forEach(function (r) {
        h += '<div style="margin-bottom:12px"><div class="mono-line" style="color:#c9d6cc;margin-bottom:4px">' + r.label + "</div>";
        h += ansSelect("H9", r.k, [
          { v: "static", l: "static routing" }, { v: "rip", l: "RIPv2" }, { v: "ospf", l: "OSPF" },
          { v: "eigrp", l: "EIGRP" }, { v: "bgp", l: "BGP" },
        ], "protocol for " + r.k) + "</div>";
      });
      h += '<div class="mono-line" style="color:#c9d6cc;margin-bottom:4px">Which of the chosen protocols is the only EGP (runs between organizations)?</div>';
      h += ansSelect("H9", "egp", [
        { v: "ospf", l: "OSPF" }, { v: "eigrp", l: "EIGRP" }, { v: "bgp", l: "BGP" }, { v: "static", l: "static routing" },
      ], "the only EGP");
      h += '<div class="mt-3"><button type="button" class="btn btn-check" data-act="check:H9" aria-label="Close case 09">Close case 09</button>' + resultBlock(res("H9")) + "</div></div></div></div>";
    }

    return h;
  }

  // ═══════════════ B04 · NAT / PAT ═══════════════
  function benchNat() {
    var s = st();
    var hard = s.mode === "hard";
    var built = {};
    s.env.natBuilt.forEach(function (e) { built[e.id] = e; });

    var h = '<h3 class="goc-board bench-title">B04 · NAT / PAT BENCH — R3 edge</h3>';
    h += '<div class="table-card"><div class="table-head"><span class="table-title">R3 — TRANSLATION TABLE</span><span class="table-sub">inside local → inside global · training data</span></div>';
    h += '<div class="table-scroll" style="max-height:none"><table class="goc-table" style="min-width:560px"><thead><tr><th>Inside local</th><th>Inside global</th><th>Outside (dst)</th><th>Proto</th></tr></thead><tbody>';
    D.NAT_SEED_ROWS.forEach(function (r) {
      h += "<tr><td style=\"color:#E7EFE9\">" + U(r.insideLocal) + '</td><td class="nexthop-cell">' + U(r.insideGlobal) + '</td><td class="mono-line">' + U(r.outside) + '</td><td style="color:#5a6a5f">' + r.proto + "</td></tr>";
    });
    s.env.natBuilt.forEach(function (e) {
      h += '<tr style="background:rgba(63,191,159,0.05)"><td style="color:#E7EFE9">' + U(e.insideLocal) + '</td><td class="nexthop-cell">' + U(e.insideGlobalIp) +
        (e.insideGlobalPort !== null ? ":" + e.insideGlobalPort : "") + '</td><td class="mono-line">' + U(e.outside) + '</td><td style="color:#3FBF9F">built by you</td></tr>';
    });
    h += "</tbody></table></div></div>";

    if (!hard) {
      // M8 classifier
      h += '<div class="inset-card"><div class="kicker" style="color:#F2A93B">ORDER M8 · classify the four seeded rows</div><div class="stack">';
      D.NAT_SEED_ROWS.forEach(function (r) {
        h += '<div><span class="mono-line" style="display:block;margin-bottom:4px;color:#c9d6cc">' + U(r.insideLocal) + " ↔ " + U(r.insideGlobal) + "</span>";
        h += ansSelect("M8", r.id, [{ v: "static", l: "static NAT (1:1)" }, { v: "pat", l: "PAT (overload, ports)" }], "classify " + r.insideLocal) + "</div>";
      });
      h += "</div>";
      h += '<div class="mono-note mt-4" style="margin-bottom:4px">Map the four terms — flow: 10.10.20.5:80 → 198.51.100.23:80 via 203.0.113.70:80 (static row)</div>';
      h += '<div class="grid-2">';
      [
        { k: "il", label: "Inside local", opts: [["10.10.20.5", "10.10.20.5"], ["203.0.113.70", "203.0.113.70"], ["198.51.100.23", "198.51.100.23"]] },
        { k: "ig", label: "Inside global", opts: [["10.10.20.5", "10.10.20.5"], ["203.0.113.70", "203.0.113.70"], ["198.51.100.23", "198.51.100.23"]] },
        { k: "og", label: "Outside global (simplified case)", opts: [["10.10.20.5", "10.10.20.5"], ["203.0.113.70", "203.0.113.70"], ["198.51.100.23", "198.51.100.23"]] },
        { k: "ol", label: "Outside local (simplified case)", opts: [["same", "same as outside global"], ["10.10.20.5", "10.10.20.5"], ["203.0.113.70", "203.0.113.70"]] },
      ].forEach(function (t) {
        h += '<div><div class="mono-note" style="margin-bottom:4px">' + t.label + "</div>" +
          ansSelect("M8", t.k, t.opts.map(function (p) { return { v: p[0], l: p[1] }; }), t.label) + "</div>";
      });
      h += "</div>";
      h += '<div class="mt-3"><button type="button" class="btn btn-check" data-act="check:M8" aria-label="Check order M8">Check M8</button>' + resultBlock(res("M8")) + "</div></div>";

      // M9 PAT builder
      h += '<div class="inset-card"><div class="kicker" style="color:#F2A93B">ORDER M9 · build the overload translations</div>';
      h += '<p class="mono-line" style="margin:0 0 12px">The edge PATs everything onto <span style="color:#E7EFE9">203.0.113.66</span> and assigns outside ports sequentially from <span style="color:#E7EFE9">40125</span>, in flow order.</p>';
      h += '<div class="stack">';
      D.PAT_FLOWS.forEach(function (f) {
        var cur = built[f.id];
        h += '<div class="flex-row" style="border:1px solid #26332B;background:#121A15;border-radius:4px;padding:8px 10px">';
        h += '<span class="mono-line" style="width:224px;flex-shrink:0;color:#c9d6cc">' + U(f.insideLocal) + " → " + U(f.outside) + "</span>";
        h += '<span class="mono-line" style="color:#7BC47F">203.0.113.66:</span>';
        h += '<input id="in-nat-' + f.id + '" data-nat-port="' + f.id + '" class="input input-sm" style="width:96px;height:36px" inputmode="numeric" value="' +
          (cur && cur.insideGlobalPort !== null && cur.insideGlobalPort !== undefined ? cur.insideGlobalPort : "") +
          '" placeholder="port" aria-label="outside port for ' + U(f.insideLocal) + '">';
        h += "</div>";
      });
      h += "</div>";
      h += '<div class="mt-3"><button type="button" class="btn btn-check" data-act="check:M9" aria-label="Check order M9">Check M9</button>' + resultBlock(res("M9")) + "</div></div>";
    } else {
      // H5 design
      h += '<div class="case-card"><div class="kicker" style="color:#E05252">CASE 05 · NAT policy design</div>';
      h += '<p class="mono-line" style="margin:0 0 12px">Requirements: (1) web server 10.10.20.5 must be reachable from the Internet · (2) 300 staff hosts need outbound only · (3) 12 cameras may share a small pool of spare public IPs.</p>';
      h += '<div class="grid-3">';
      [
        { k: "t1", label: "1 · Web server" },
        { k: "t2", label: "2 · 300 staff hosts" },
        { k: "t3", label: "3 · 12 cameras" },
      ].forEach(function (t) {
        h += '<div><div class="mono-note" style="margin-bottom:4px">' + t.label + "</div>";
        h += ansSelect("H5", t.k, [
          { v: "static", l: "static NAT (1:1)" }, { v: "pat", l: "PAT (overload)" }, { v: "dyn", l: "dynamic NAT (pool)" },
        ], "NAT type " + t.label) + "</div>";
      });
      h += "</div>";
      h += '<div class="mono-note mt-4" style="margin-bottom:4px">Build the web-server static entry</div><div class="flex-row">';
      h += '<span class="mono-line" style="color:#c9d6cc">10.10.20.5 ↔</span>';
      h += '<input id="in-h5-static" data-h5="static" class="input input-sm" style="width:160px;height:36px" value="' +
        U(built["h5-static"] ? built["h5-static"].insideGlobalIp : "") + '" placeholder="203.0.113.70" aria-label="inside global for web server">';
      h += '<span class="mono-note">(no port — static is 1:1)</span></div>';
      h += '<div class="mono-note mt-4" style="margin-bottom:4px">Build the PAT entry from the edge capture log</div>';
      h += '<div class="mono-line" style="border:1px solid #26332B;background:#0B100D;border-radius:4px;padding:8px 10px;color:#7BC47F">capture · ' +
        D.H5_FLOW.insideLocal + " → " + D.H5_FLOW.outside + " — edge assigned outside " + D.H5_FLOW.assignedIp + ":?</div>";
      h += '<div class="flex-row mt-2">';
      h += '<input id="in-h5-pat-ip" data-h5="pat-ip" class="input input-sm" style="width:144px;height:36px" value="' +
        U(built["h5-pat"] ? built["h5-pat"].insideGlobalIp : "") + '" placeholder="outside IP" aria-label="outside IP for PAT flow">';
      h += '<span class="mono-line" style="color:#7BC47F">:</span>';
      h += '<input id="in-h5-pat-port" data-h5="pat-port" class="input input-sm" style="width:112px;height:36px" inputmode="numeric" value="' +
        (built["h5-pat"] && built["h5-pat"].insideGlobalPort !== null && built["h5-pat"].insideGlobalPort !== undefined ? built["h5-pat"].insideGlobalPort : "") +
        '" placeholder="outside port" aria-label="outside port for PAT flow">';
      h += "</div>";
      h += '<div class="mt-3"><button type="button" class="btn btn-check" data-act="check:H5" aria-label="Close case 05">Close case 05</button>' + resultBlock(res("H5")) + "</div></div>";
    }
    return h;
  }

  // ═══════════════ B05 · FHRP ═══════════════
  function benchFhrp() {
    var s = st();
    var hard = s.mode === "hard";
    var view = E.fhrpCompute(s.env.fhrp);
    var f = s.env.fhrp;

    var h = '<h3 class="goc-board bench-title">B05 · FHRP RIG — gateway pair, VLAN 10</h3>';
    h += '<div class="inset-card">';
    h += '<div class="row-btw" style="margin-bottom:12px">';
    h += '<span class="mono-line" style="font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#E8834A">Group 10 · hosts&#39; gateway = ' + D.FHRP_VIP + " (the VIP — not a physical address)</span>";
    h += '<span class="mono-line" style="display:flex;align-items:center;gap:8px">protocol:' +
      UI.selectHTML({ id: "sel-fhrp-proto", cls: "" }, f.protocol, [
        { v: "HSRP", l: "HSRP" }, { v: "VRRP", l: "VRRP" }, { v: "GLBP", l: "GLBP" },
      ], "FHRP protocol").replace('data-select="sel-fhrp-proto"', 'data-select="fhrp-proto"') + "</span></div>";

    h += '<div class="grid-2">';
    ["r1", "r1b"].forEach(function (k) {
      var isA = k === "r1";
      var router = f[k];
      var isActive = view.active === (isA ? "R1" : "R1B");
      h += '<div style="border:1px solid ' + (isActive ? "rgba(242,169,59,0.7)" : "#26332B") + ";background:" + (isActive ? "rgba(242,169,59,0.07)" : "#121A15") + ';border-radius:8px;padding:12px">';
      h += '<div class="row-btw"><span class="mono-line" style="font-weight:700;color:#E7EFE9">' + (isA ? "R1 · GW-A" : "R1B · GW-B") + "</span>" +
        UI.lamp(router.up, router.up ? "#7BC47F" : "#E05252", router.up ? "power" : "down") + "</div>";
      h += '<div class="stack mt-2">';
      h += '<div class="row-btw"><span class="mono-note">role</span><span class="mono-line" style="border-radius:3px;padding:2px 6px;font-size:10px;font-weight:700;background:' +
        (isActive ? "#F2A93B22" : "#1c2620") + ";color:" + (isActive ? "#F2A93B" : "#9FB0A5") + '">' +
        (router.up ? (isActive ? view.roleActive : view.roleStandby) : "DOWN") + "</span></div>";
      h += '<div class="row-btw"><span class="mono-note">physical IP</span><span class="mono-line" style="color:#c9d6cc">' + (isA ? "10.10.10.2" : "10.10.10.3") + "</span></div>";
      h += '<div class="row-btw"><span class="mono-note">priority' + (hard ? " (0–255)" : "") + "</span>";
      if (hard) {
        h += '<input id="in-fhrp-prio-' + k + '" data-fhrp-prio="' + k + '" class="input input-sm" style="width:80px;height:36px;text-align:center" inputmode="numeric" value="' +
          router.priority + '" aria-label="priority for ' + (isA ? "R1" : "R1B") + '">';
      } else {
        h += '<span class="mono-line" style="color:#c9d6cc">' + router.priority + "</span>";
      }
      h += "</div>";
      h += '<div class="row-btw"><span class="mono-note">power</span>' + UI.switchHTML("sw-" + k, router.up, "power switch " + (isA ? "R1" : "R1B")) + "</div>";
      h += "</div></div>";
    });
    h += "</div>";

    h += '<div class="flex-row mt-3" style="border:1px solid #26332B;background:#121A15;border-radius:6px;padding:10px 12px;gap:16px">';
    h += '<span class="mono-line" style="display:flex;align-items:center;gap:8px;color:#9FB0A5"><span style="color:#F2A93B;display:inline-flex">' + ic("zap", "i-14") + "</span> preempt ";
    if (hard) {
      h += UI.switchHTML("sw-preempt", f.preempt, "preempt toggle");
    } else {
      h += '<span class="mono-line" style="color:#c9d6cc">' + (f.preempt ? "ON" : "OFF") + "</span>";
    }
    h += "</span>";
    h += '<span class="mono-line" style="color:#9FB0A5">virtual MAC: <span style="color:#E7EFE9">' + view.vmac + "</span></span>";
    h += '<span class="mono-note" style="font-size:9.5px">' + U(view.vmacNote) + "</span>";
    h += '<span style="margin-left:auto" aria-live="polite">' + UI.lamp(!!view.active, "#F2A93B", "VIP owned by " + (view.active || "NOBODY"), true) + "</span>";
    h += "</div>";
    h += '<p class="mono-note mt-2">The atlas halo follows whoever owns ' + D.FHRP_VIP + ". Kill a router and watch the lamps + halo move — hosts never re-ARP.</p>";
    h += "</div>";

    if (!hard) {
      h += '<div class="inset-card"><div class="kicker" style="color:#F2A93B">ORDER M10 · failover drill record</div><div class="grid-2">';
      h += '<label style="display:block"><span class="field-label">The gateway address hosts use (the VIP)</span>' +
        '<input id="in-m10-vip" data-answer="M10|vip" class="input input-sm" value="' + U(ans("M10", "vip") === undefined ? "" : ans("M10", "vip")) + '" placeholder="x.x.x.x" aria-label="VIP address"></label>';
      h += "<div><span class=\"field-label\">Who owns the VIP while R1 is down</span>" + ansSelect("M10", "owner", [
        { v: "r1", l: "R1" }, { v: "r1b", l: "R1B" }, { v: "none", l: "nobody — traffic fails" },
      ], "VIP owner") + "</div>";
      h += "<div><span class=\"field-label\">Host default-gateway setting during failover</span>" + ansSelect("M10", "unchanged", [
        { v: "vip", l: "unchanged — hosts still point at the VIP" },
        { v: "rearp", l: "hosts must re-ARP to the new router's physical MAC" },
        { v: "dhcp", l: "hosts pull a new gateway over DHCP" },
      ], "host gateway behavior") + "</div>";
      h += "<div><span class=\"field-label\">Election is decided by…</span>" + ansSelect("M10", "factor", [
        { v: "priority", l: "highest priority (preempt governs takeback)" },
        { v: "mac", l: "lowest virtual MAC" },
        { v: "ip", l: "highest physical IP" },
      ], "election factor") + "</div>";
      h += "</div>";
      h += '<div class="mono-note mt-4" style="margin-bottom:4px">Protocol map</div><div class="grid-3">';
      [
        { k: "hsrp", label: "HSRP" }, { k: "vrrp", label: "VRRP" }, { k: "glbp", label: "GLBP" },
      ].forEach(function (p) {
        h += "<div><div class=\"mono-note\" style=\"margin-bottom:4px\">" + p.label + "</div>" + ansSelect("M10", p.k, [
          { v: "cisco-active", l: "Cisco · active/standby" },
          { v: "open-master", l: "Open standard · master/backup" },
          { v: "cisco-lb", l: "Cisco · AVG load-balances across AVFs" },
        ], "trait of " + p.label) + "</div>";
      });
      h += "</div>";
      h += '<div class="mt-3"><button type="button" class="btn btn-check" data-act="check:M10" aria-label="Check order M10">Check M10</button>' + resultBlock(res("M10")) + "</div></div>";
    } else {
      h += '<div class="case-card"><div class="kicker" style="color:#E05252">CASE 06 · FHRP engineering — make R1B the permanent leader</div>';
      h += '<ol class="mono-line" style="margin:0 0 12px;padding-left:16px">';
      h += "<li>Set R1B&#39;s priority to <span style=\"color:#E7EFE9\">150</span> (exact).</li>";
      h += "<li>Switch <span style=\"color:#E7EFE9\">preempt ON</span>.</li>";
      h += "<li>Fail R1 (power off) → verify R1B owns the VIP.</li>";
      h += "<li>Restore R1 (power on) → R1B must KEEP leadership.</li>";
      h += "<li>Answer the design questions, then close the case.</li></ol>";
      h += '<div class="grid-2">';
      h += "<div><span class=\"field-label\">After R1 returns, who forwards?</span>" + ansSelect("H6", "who", [
        { v: "r1", l: "R1" }, { v: "r1b", l: "R1B" },
      ], "forwarder after recovery") + "</div>";
      h += "<div><span class=\"field-label\">Why does leadership not return to R1?</span>" + ansSelect("H6", "why", [
        { v: "preempt", l: "preempt is ON — R1B (150) re-elects itself" },
        { v: "sticky", l: "the active role is sticky until failure" },
        { v: "mac", l: "R1B owns the virtual MAC permanently" },
      ], "reason") + "</div>";
      h += "<div><span class=\"field-label\">Multi-vendor estate (Cisco + Juniper)?</span>" + ansSelect("H6", "multi", [
        { v: "hsrp", l: "HSRP" }, { v: "vrrp", l: "VRRP" }, { v: "glbp", l: "GLBP" },
      ], "multi-vendor protocol") + "</div>";
      h += "<div><span class=\"field-label\">Requirement: load-share the gateway role?</span>" + ansSelect("H6", "lb", [
        { v: "hsrp", l: "HSRP" }, { v: "vrrp", l: "VRRP" }, { v: "glbp", l: "GLBP" },
      ], "load-sharing protocol") + "</div>";
      h += '<label style="display:block;grid-column:1/-1"><span class="field-label">Virtual MAC the hosts resolve (group 10, HSRP format)</span>' +
        '<input id="in-h6-vmac" data-answer="H6|vmac" class="input input-sm" style="max-width:240px" value="' +
        U(ans("H6", "vmac") === undefined ? "" : ans("H6", "vmac")) + '" placeholder="0000.xxxx.xxxx" aria-label="virtual MAC"></label>';
      h += "</div>";
      h += '<div class="mt-3"><button type="button" class="btn btn-check" data-act="check:H6" aria-label="Close case 06">Close case 06</button>' + resultBlock(res("H6")) + "</div></div>";
    }

    h += '<div class="flex-row" style="border:1px solid #26332B;background:#0E1611;border-radius:8px;padding:12px">';
    h += '<span style="color:#9FB0A5;display:inline-flex">' + ic("power") + "</span>";
    h += '<p class="mono-note">Safety rail: this rig only simulates router state. Nothing here touches real networks — the whole estate is a labeled training model.</p></div>';
    return h;
  }

  // ═══════════════ B06 · TRUNK ═══════════════
  function benchTrunk() {
    var s = st();
    var hard = s.mode === "hard";
    var ok10 = E.vlanGatewayReady(s.env.subifs, 10);
    var ok20 = E.vlanGatewayReady(s.env.subifs, 20);
    var t = local.trunk;

    var h = '<h3 class="goc-board bench-title">B06 · TRUNK BENCH — R1 G0/0 router-on-a-stick</h3>';
    h += '<div class="inset-card">';
    h += '<div class="kicker" style="color:#3FBF9F;display:flex;align-items:center;gap:8px"><span style="display:inline-block;width:64px;height:8px;border-radius:4px;background:rgba(63,191,159,0.4)"></span> SW-HQ trunk port → R1 G0/0 · 802.1Q · VLANs 10 (staff) &amp; 20 (servers)</div>';

    if (s.env.subifs.length === 0) {
      h += '<p class="mono-line" style="text-align:center;padding:12px 0;color:#5a6a5f">no subinterfaces configured — VLAN 10 and VLAN 20 have no gateway yet</p>';
    }

    h += '<div class="stack">';
    s.env.subifs.forEach(function (sf) {
      var healthy =
        (sf.name === "G0/0.10" && sf.tag === 10 && sf.ip.indexOf("10.10.10.2/") === 0) ||
        (sf.name === "G0/0.20" && sf.tag === 20 && sf.ip.indexOf("10.10.20.1/") === 0);
      h += '<div class="flex-row" style="border:1px solid #26332B;background:#121A15;border-radius:6px;padding:8px 10px">';
      h += '<span class="mono-line" style="width:80px;font-weight:700;color:' + (healthy ? "#7BC47F" : "#E05252") + '">' + sf.name + "</span>";
      h += '<span class="mono-note" style="text-transform:uppercase;letter-spacing:0.1em">dot1q</span>';
      h += UI.selectHTML({ id: "sel-tag-" + sf.id }, String(sf.tag), [{ v: "10", l: "10" }, { v: "20", l: "20" }], "tag for " + sf.name)
        .replace('data-select="sel-tag-' + sf.id + '"', 'data-select="subif-tag|' + sf.id + '"');
      h += '<span class="mono-note" style="text-transform:uppercase;letter-spacing:0.1em">ip</span>';
      h += '<input id="in-subif-' + sf.id + '" data-subif-ip="' + sf.id + '" class="input input-sm" style="width:160px;height:36px" value="' + U(sf.ip) + '" aria-label="IP for ' + sf.name + '">';
      h += '<span class="mono-line" style="border-radius:3px;padding:2px 6px;font-size:9px;font-weight:700;text-transform:uppercase;background:' +
        (healthy ? "rgba(123,196,127,0.15);color:#7BC47F" : "rgba(224,82,82,0.15);color:#E05252") + '">' + (healthy ? "gateway ok" : "defect") + "</span>";
      h += '<button type="button" class="btn btn-danger btn-icon-sm" style="margin-left:auto" data-act="subif-remove:' + sf.id + '" aria-label="remove ' + sf.name + '">' + ic("trash-2") + "</button>";
      h += "</div>";
    });
    h += "</div>";

    h += '<div class="flex-row mt-3" style="border:1px dashed #3a463e;border-radius:6px;padding:10px;align-items:flex-end">';
    h += '<div><div class="mono-note" style="margin-bottom:4px;font-size:9.5px">new subinterface — VLAN</div>';
    h += UI.selectHTML({ id: "sel-trunk-newtag" }, t.newTag, [{ v: "10", l: "10" }, { v: "20", l: "20" }], "VLAN for new subinterface")
      .replace('data-select="sel-trunk-newtag"', 'data-select="trunk-newtag"') + "</div>";
    h += '<div class="grow" style="min-width:160px"><div class="mono-note" style="margin-bottom:4px;font-size:9.5px">gateway IP (must match the VLAN subnet · mask /24)</div>';
    h += '<input id="in-trunk-newip" data-bind="trunk-newip" class="input" style="height:44px" value="' + U(t.newIp) + '" placeholder="' +
      (t.newTag === "10" ? "10.10.10.2/24" : "10.10.20.1/24") + '" aria-label="gateway IP for new subinterface"></div>';
    h += '<button type="button" class="btn btn-primary" data-act="subif-add" aria-label="Create subinterface">' + ic("plus") + " Create</button>";
    h += "</div>";
    if (t.benchMsg) {
      h += '<div class="' + (t.benchMsg.ok ? "ok-text" : "err-text") + ' mt-2" role="status" aria-live="polite">' + U(t.benchMsg.text) + "</div>";
    }
    h += "</div>";

    h += '<div class="inset-card"><div class="kicker" style="color:#9FB0A5">Inter-VLAN verifier — PC-A (VLAN 10) ⇄ PC-B (VLAN 20)</div>';
    h += '<button type="button" class="btn btn-primary" data-act="trunk-verify" aria-label="Run inter-VLAN ping verification">VERIFY inter-VLAN ping</button></div>';

    if (!hard) {
      h += '<div class="inset-card"><div class="kicker" style="color:#F2A93B">ORDER M11 · build the stick</div>';
      h += '<p class="mono-line" style="margin:0 0 8px">Required: <span style="color:#E7EFE9">G0/0.10</span> tag 10, ip 10.10.10.2/24 (physical .2 — the FHRP VIP .1 floats above it) and <span style="color:#E7EFE9">G0/0.20</span> tag 20, ip 10.10.20.1/24. Then VERIFY.</p>';
      h += '<button type="button" class="btn btn-check" data-act="check:M11" aria-label="Check order M11">Check M11</button>' + resultBlock(res("M11")) + "</div>";
    } else {
      h += '<div class="case-card"><div class="kicker" style="color:#E05252">CASE 07 · the broken stick — root-cause record</div>';
      h += '<p class="mono-line" style="margin:0 0 8px">The bench refused a duplicate tag with an 802.1Q conflict — that refusal is evidence. Repair both defects, VERIFY, then record both root causes.</p>';
      h += '<div class="grid-2">';
      h += "<div><div class=\"mono-note\" style=\"margin-bottom:4px\">Defect 1 · G0/0.10 was…</div>" + ansSelect("H7", "c1", [
        { v: "tag", l: "tagged into the wrong VLAN — the dot1q tag pointed at VLAN 20" },
        { v: "ip", l: "given an IP outside the VLAN's subnet" },
        { v: "shutdown", l: "administratively shut down" },
      ], "defect 1") + "</div>";
      h += "<div><div class=\"mono-note\" style=\"margin-bottom:4px\">Defect 2 · G0/0.20 was…</div>" + ansSelect("H7", "c2", [
        { v: "tag", l: "tagged into the wrong VLAN — the dot1q tag pointed at VLAN 20" },
        { v: "ip", l: "given an IP outside VLAN 20's subnet — hosts' gateway didn't exist" },
        { v: "shutdown", l: "administratively shut down" },
      ], "defect 2") + "</div>";
      h += "</div>";
      h += '<div class="mt-3"><button type="button" class="btn btn-check" data-act="check:H7" aria-label="Close case 07">Close case 07</button>' + resultBlock(res("H7")) + "</div></div>";
    }

    h += UI.callout(
      "Why the tag matters",
      "The subinterface NUMBER (G0/0.10) is a label for humans. The <strong style=\"color:#E7EFE9\">dot1q tag</strong> is what selects the VLAN on the wire; the <strong style=\"color:#E7EFE9\">IP</strong> is what hosts call their gateway. All three must agree with the plan.",
      "train"
    );
    return h;
  }

  function resultBlock(r) {
    if (!r || !r.lastMsg) return "";
    return UI.feedbackPanel(!!r.lastOk, r.lastMsg);
  }

  // ═══════════════ TASK LEDGER (C4) ═══════════════
  function renderLedger() {
    var el = document.getElementById("ledger");
    if (!el) return;
    var s = st();
    var mode = s.mode;
    var hard = mode === "hard";
    var objectives = Store.objectivesFor(mode);
    var done = objectives.filter(function (o) { return res(o.id) && res(o.id).done; }).length;

    var h = '<section class="ledger" aria-label="' + (hard ? "Case file" : "Shift sheet") + '">';
    h += '<button type="button" class="ledger-toggle" data-act="ledger-toggle" aria-expanded="' + s.ledgerOpen + '" aria-controls="ledger-body">';
    h += ic(s.ledgerOpen ? "chevron-down" : "chevron-up");
    h += '<span class="goc-board ledger-name">' + (hard ? "CASE FILE" : "SHIFT SHEET") + "</span>";
    h += '<span class="ledger-count">' + done + "/" + objectives.length + " " + (hard ? "cases closed" : "orders complete") + "</span>";
    h += '<span class="pillar-bars" aria-hidden="true">';
    ["P1", "P2", "P3", "P4"].forEach(function (p) {
      var objs = objectives.filter(function (o) { return o.pillar === p; });
      var d = objs.filter(function (o) { return res(o.id) && res(o.id).done; }).length;
      h += '<span class="pbar" title="' + D.PILLAR_META[p].label + ": " + d + "/" + objs.length + '"><span style="width:' +
        (objs.length ? (d / objs.length) * 100 : 0) + "%;background:" + D.PILLAR_META[p].color + '"></span></span>';
    });
    h += "</span></button>";

    if (s.ledgerOpen) {
      h += '<div id="ledger-body" class="ledger-body">';
      h += hard
        ? '<p class="ledger-intro">Free order. Evidence includes red herrings — CASE 01 and CASE 02 interlock (delivery needs the adjacency). One nudge per case, and it costs score.</p>'
        : '<p class="ledger-intro">Orders are sequenced for learning — work top to bottom. Checks are always available; hints never block progress.</p>';
      h += '<ul class="ledger-grid">';
      objectives.forEach(function (o, i) {
        h += objectiveCard(o, i, hard);
      });
      h += "</ul></div>";
    }
    h += "</section>";
    el.innerHTML = h;
  }

  function objectiveCard(o, index, hard) {
    var s = st();
    var r = res(o.id);
    var hintsUsed = r ? r.hintsUsed : 0;
    var isCurrent = !hard && s.spot === o.id;
    var done = !!(r && r.done);

    var h = '<li class="obj-card' + (done ? " done" : isCurrent ? " current" : "") +
      '" aria-label="objective ' + o.id + ": " + U(o.title) + ", " + (done ? "complete" : "open") + '">';
    h += '<div class="obj-head">';
    h += '<span class="obj-num">' + (done ? "✓" : index + 1) + "</span>";
    h += '<span class="obj-name">' + o.id + " · " + U(o.title) + "</span>";
    h += UI.pillarBadge(o.pillar, true);
    if (hard) h += '<span class="obj-pts">' + o.points + " pts</span>";
    h += "</div>";
    h += '<p class="obj-stmt">' + U(o.statement) + "</p>";
    if (!hard) h += '<p class="obj-ctx">' + U(o.context) + "</p>";
    h += '<div class="obj-actions">';
    h += '<button type="button" class="btn btn-ghost btn-sm" data-act="goto-bench:' + o.id + '" aria-label="go to the bench for ' + o.id + '">' + ic("eye") + " Bench</button>";
    var hintDisabled = done || hintsUsed >= o.hints.length;
    h += '<button type="button" class="btn btn-ghost btn-sm" data-act="hint:' + o.id + '"' + (hintDisabled ? " disabled" : "") +
      ' aria-label="reveal hint ' + (hintsUsed + 1) + " for " + o.id + '">' + ic("lightbulb") + " " +
      (hard ? "Nudge (−cost)" + (hintsUsed ? " · used" : "") : "Hint " + hintsUsed + "/3") + "</button>";
    h += '<button type="button" class="btn btn-check btn-sm" data-act="check:' + o.id + '"' + (done ? " disabled" : "") +
      ' aria-label="check ' + o.id + '">Check</button>';
    h += "</div>";

    var revealed = o.hints.slice(0, Math.min(hintsUsed, o.hints.length));
    revealed.forEach(function (hm, hi) {
      h += '<div class="hint-line">hint ' + (hi + 1) + " · " + U(hm) + "</div>";
    });

    if (r && r.lastMsg) {
      var ok = done && r.lastOk !== false;
      h += '<div class="verdict-block ' + (ok ? "ok" : "notyet") + '" role="status" aria-live="polite">' +
        (ok ? "✓ " : "· ") + U(r.lastMsg) + "</div>";
    }
    h += "</li>";
    return h;
  }

  // ═══════════════ HANDOVER NOTES (C6) ═══════════════
  function renderHandover() {
    var el = document.getElementById("handover");
    if (!el) return;
    var DB = D.DEBRIEF;
    var h = '<section class="handover">';
    h += '<div><div class="board-label amber">HANDOVER NOTES — WHAT THE NIGHT WATCH LEAVES BEHIND</div>';
    h += '<p class="mono-line" style="margin-top:4px;max-width:48rem;color:#9FB0A5">Synthesis of the whole shift: where to look when this breaks for real, what to build so it doesn&#39;t, and how each side of the house thinks about it.</p></div>';
    h += '<div class="handover-grid">';
    h += '<div class="hv-card-green"><div class="board-label teal" style="margin-bottom:12px">DETECTION &amp; TROUBLESHOOTING PLAYBOOK</div><ul class="hv-list">';
    DB.detection.forEach(function (d) {
      h += '<li><div class="hv-title">' + U(d.title) + '</div><p class="hv-body">' + U(d.body) + "</p></li>";
    });
    h += "</ul></div>";
    h += '<div class="hv-card-orange"><div class="board-label orange" style="margin-bottom:12px">RESILIENCE &amp; CONTROL RECOMMENDATIONS</div><ul class="hv-list">';
    DB.mitigation.forEach(function (d) {
      h += '<li><div class="hv-title">' + U(d.title) + '</div><p class="hv-body">' + U(d.body) + "</p></li>";
    });
    h += "</ul></div>";
    h += '<div class="hv-card-plain"><div class="board-label green" style="margin-bottom:12px">BLUE-TEAM TAKEAWAYS</div><ul class="hv-bullets">';
    DB.blueTeam.forEach(function (t) { h += "<li>" + U(t) + "</li>"; });
    h += "</ul></div>";
    h += '<div class="hv-card-plain"><div class="board-label violet" style="margin-bottom:12px">RED-TEAM MINDSET</div><ul class="hv-bullets">';
    DB.redTeam.forEach(function (t) { h += "<li>" + U(t) + "</li>"; });
    h += "</ul></div>";
    h += "</div>";
    h += '<div class="handover-grid">';
    h += '<div class="hv-card-inset"><div class="board-label" style="margin-bottom:12px">CONTINUE THE N10-009 TRACK</div><ul class="hv-bullets">';
    DB.nextSteps.forEach(function (t) { h += "<li>" + U(t) + "</li>"; });
    h += "</ul></div>";
    h += '<div class="hv-card-inset"><div class="board-label" style="margin-bottom:12px">OFFICIAL REFERENCES (OPEN IN NEW TAB)</div><ul style="margin:0;padding:0;list-style:none;display:grid;gap:8px">';
    DB.sources.forEach(function (src) {
      h += '<li><a class="src-link" href="' + U(src.url) + '" target="_blank" rel="noopener noreferrer">' + ic("arrow-up-right") + " " + U(src.label) + "</a></li>";
    });
    h += "</ul></div>";
    h += "</div></section>";
    el.innerHTML = h;
  }

  // ═══════════════ OVERLAYS: drawers, modals, reset dialog ═══════════════
  function renderOverlay() {
    var root1 = document.getElementById("overlay-root");
    if (!root1) return;
    var s = st();
    var h = "";

    if (s.drawer === "locker") {
      h += lockerDrawer();
    } else if (s.drawer === "glossary") {
      h += glossaryDrawer();
    } else if (s.modal === "comms") {
      root.GocQuiz.onOpen();
      h += root.GocQuiz.render();
    } else if (s.modal === "debrief") {
      h += debriefModal();
    } else if (s.modal === "reset") {
      h += resetDialog();
    }
    root1.innerHTML = h;
  }

  function lockerDrawer() {
    var h = '<div class="overlay right" id="overlay" data-overlay="locker" role="dialog" aria-modal="true" aria-label="Reference locker">';
    h += '<aside class="drawer"><div class="overlay-head">' +
      '<span class="overlay-title goc-board">' + ic("book-open") + " REFERENCE LOCKER — KNOWLEDGE CORE</span>" +
      '<button type="button" class="close-btn" autofocus data-act="drawer-close" aria-label="Close reference locker">' + ic("x") + "</button></div>";
    h += '<div class="overlay-body stack">';
    h += '<p class="mono-line">Everything the shift touches, in one locker. Each profile: what it is, how it works, why it exists, exam facts, a real-world anchor and the classic trap.</p>';
    D.PROTOCOL_PROFILES.forEach(function (p) {
      h += '<article class="profile"><header class="profile-head">' +
        '<span class="profile-tag" style="background:' + p.accent + "1c;color:" + p.accent + ";border-color:" + p.accent + '55">' + U(p.tag) + "</span>" +
        '<h3 class="profile-name">' + U(p.name) + "</h3></header>";
      h += '<p class="what">' + U(p.what) + "</p>";
      h += '<p class="howwhy"><span class="k" style="color:' + p.accent + '">HOW · </span>' + U(p.how) + "</p>";
      h += '<p class="howwhy"><span class="k" style="color:' + p.accent + '">WHY · </span>' + U(p.why) + "</p>";
      h += '<dl class="facts-grid">';
      p.facts.forEach(function (fv) {
        h += '<div class="fact-cell"><dt>' + U(fv[0]) + "</dt><dd>" + U(fv[1]) + "</dd></div>";
      });
      h += "</dl>";
      h += '<p class="real"><span class="k">REAL WORLD · </span>' + U(p.realWorld) + "</p>";
      h += '<p class="watch"><span class="k">WATCH OUT · </span>' + U(p.watchOut) + "</p>";
      h += "</article>";
    });
    h += "</div></aside></div>";
    return h;
  }

  function glossaryDrawer() {
    var h = '<div class="overlay right" id="overlay" data-overlay="glossary" role="dialog" aria-modal="true" aria-label="Glossary">';
    h += '<aside class="drawer narrow"><div class="overlay-head">' +
      '<span class="overlay-title goc-board">GLOSSARY · 20 FIELD TERMS</span>' +
      '<button type="button" class="close-btn" autofocus data-act="drawer-close" aria-label="Close glossary">' + ic("x") + "</button></div>";
    h += '<dl class="overlay-body stack">';
    D.GLOSSARY.forEach(function (g) {
      h += '<div class="gloss-item"><dt>' + U(g.term) + "</dt><dd>" + U(g.def) + "</dd></div>";
    });
    h += "</dl></aside></div>";
    return h;
  }

  function debriefModal() {
    var s = st();
    var mode = s.mode;
    var objectives = Store.objectivesFor(mode);
    var quiz = Store.quizFor(mode);
    var quizCorrect = Store.quizCorrectCount(mode);
    var stars = E.computeStars(objectives, s.results, quizCorrect, quiz.length, mode);
    var allDone = Store.allDone(mode);
    var qDone = Store.quizDone(mode);
    var complete = allDone && qDone;
    var focusAreas = E.computeFocusAreas(objectives, s.results, quiz, s.quizAnswers, s.quizChecked);

    var h = '<div class="overlay center-full" id="overlay" data-overlay="debrief" role="dialog" aria-modal="true" aria-label="Shift debrief">';
    h += '<div class="modal debrief">';
    h += '<div class="debrief-head"><div class="board-label amber">SHIFT DEBRIEF · ' + (mode === "medium" ? "MEDIUM WATCH" : "HARD WATCH") + "</div>";
    h += '<h2 class="goc-board debrief-title">' + (complete ? "WATCH COMPLETE — HANDOVER SIGNED" : "PROGRESS REVIEW") + "</h2>";
    h += '<div class="stars" aria-label="signal rating ' + stars.stars + ' of 5">';
    for (var i = 1; i <= 5; i++) {
      h += '<svg class="icon' + (i <= stars.stars ? " lit" : "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (root.LucidePaths.star || "") + "</svg>";
    }
    h += "</div>";
    h += '<p class="debrief-score">orders ' + Math.round(stars.objRatio * 100) + "% quality · comms check " + quizCorrect + "/" + quiz.length +
      " (" + Math.round(stars.quizRatio * 100) + "%)" +
      (complete ? "" : " · close all orders + finish the comms check to sign the handover") + "</p></div>";

    h += '<div class="debrief-body">';
    if (complete) {
      h += '<p class="debrief-p">You can now explain every technology in this lesson, read it out of raw device evidence, diagnose it when it breaks, and design the redundancy that survives its failure. That is the full arc of <span class="hl">N10-009 2.1</span> — from reading about routing to running a routing estate.</p>';
    }
    h += '<div><div class="board-label" style="margin-bottom:8px">OBJECTIVE RECAP BY PILLAR</div><div class="stack">';
    ["P1", "P2", "P3", "P4"].forEach(function (p) {
      var objs = objectives.filter(function (o) { return o.pillar === p; });
      var d = objs.filter(function (o) { return res(o.id) && res(o.id).done; }).length;
      h += '<div class="pillar-recap"><div class="pr-head"><span class="pr-name" style="color:' + D.PILLAR_META[p].color + '">' +
        p + " · " + D.PILLAR_META[p].label + '</span><span class="pr-count">' + d + "/" + objs.length + "</span></div><ul>";
      objs.forEach(function (o) {
        var dn = res(o.id) && res(o.id).done;
        h += '<li><span class="tick' + (dn ? " done" : "") + '">' + (dn ? "✓" : "○") + '</span><span class="ot">' + o.id + " " + U(o.title) + "</span></li>";
      });
      h += "</ul></div>";
    });
    h += "</div></div>";

    if (complete) {
      h += '<div class="next-card"><div class="board-label teal" style="margin-bottom:6px">WHERE TO GO NEXT</div><ul class="hv-bullets">';
      D.DEBRIEF.nextSteps.slice(0, 2).forEach(function (t) { h += "<li>" + U(t) + "</li>"; });
      h += "</ul></div>";
    }

    if (focusAreas.length > 0) {
      h += '<div class="focus-card"><div class="board-label amber" style="display:flex;align-items:center;gap:6px;margin-bottom:6px">' + ic("crosshair", "i-14") + " FOCUS AREAS — FROM YOUR OWN WATCH</div>";
      h += '<p class="mono-note" style="margin-bottom:8px;font-size:9.5px">derived from your open orders, repeat attempts, hints and missed comms questions</p><ul>';
      focusAreas.forEach(function (fa) {
        h += '<li><div class="f-title">' + U(fa.title) + '</div><p class="f-detail">' + U(fa.detail) + "</p></li>";
      });
      h += "</ul></div>";
    }
    h += "</div>";

    h += '<div class="debrief-foot">';
    h += '<button type="button" class="btn btn-danger" data-act="reset:open" aria-label="Reset the whole lab">' + ic("rotate-ccw") + " Reset lab</button>";
    h += '<div class="right">';
    h += '<button type="button" class="btn btn-ghost" data-act="debrief-handover" aria-label="Open handover notes">' + ic("clipboard-list") + " Handover notes</button>";
    h += '<button type="button" class="btn btn-primary" data-act="debrief-dismiss" aria-label="Return to the ops floor">Back to the floor</button>';
    h += "</div></div></div></div>";
    return h;
  }

  function resetDialog() {
    var h = '<div class="overlay center-full" id="overlay" data-overlay="reset" role="dialog" aria-modal="true" aria-label="Reset the lab">';
    h += '<div class="confirm-box">';
    h += '<h2 class="goc-mono confirm-title">Reset the lab?</h2>';
    h += '<p class="confirm-desc">Wipes saved progress, environment state, quiz results and returns you to the mode gate. This cannot be undone.</p>';
    h += '<div class="confirm-foot">';
    h += '<button type="button" class="btn btn-ghost" data-act="reset:cancel">Keep working</button>';
    h += '<button type="button" class="btn btn-danger" data-act="reset:confirm">Reset everything</button>';
    h += "</div></div></div>";
    return h;
  }

  // ═══════════════ debrief auto-open (original OpsFloor effect) ═══════════════
  function autoDebrief() {
    var s = st();
    if (
      s.phase === "ops" &&
      Store.isComplete(s.mode) &&
      !s.completedShown &&
      s.modal === "none"
    ) {
      A.setModal("debrief");
      renderOverlay();
    }
  }

  // ═══════════════ router ═══════════════
  function render() {
    var s = st();
    if (s.phase === "gate") renderGate();
    else if (s.phase === "briefing") renderBriefing();
    else renderOps();
  }

  // ═══════════════ events ═══════════════
  function act(action) {
    var s = st();
    var parts = action.split(":");
    var cmd = parts[0];
    var arg = parts.slice(1).join(":");

    switch (cmd) {
      case "mode": A.chooseMode(arg); break;
      case "briefing-back": A.backToGate(); break;
      case "briefing-enter": A.enterOps(); break;
      // benches remount on switch — component-local inputs reset, like React
      case "bench": resetLocal(); A.openBench(arg); break;
      case "drawer": A.setDrawer(arg); break;
      case "drawer-close": A.setDrawer("none"); break;
      case "modal": A.setModal(arg); if (arg === "comms") root.GocQuiz.onOpen(); break;
      case "ledger-toggle": A.setLedger(!s.ledgerOpen); break;
      case "goto-bench": {
        var o = Store.objectivesFor(s.mode).filter(function (x) { return x.id === arg; })[0];
        A.setSpot(arg);
        A.openBench(o.bench);
        break;
      }
      case "hint": A.useHint(arg); break;
      case "check": {
        A.checkObjective(arg);
        break;
      }
      case "trace": {
        // "trace" = read the input; "trace:<ip>" = the H1 prove button
        var d = (arg || local.dst || "").trim();
        if (!d) { local.simMsg = "Enter a destination IPv4 address first."; renderBench(); break; }
        var out = A.runPacket(d);
        if (out.error) { local.simMsg = out.error; renderBench(); break; }
        local.simMsg = null;
        renderBench(); renderAtlas();
        break;
      }
      case "preset": {
        local.dst = arg;
        var out2 = A.runPacket(arg);
        if (out2.error) local.simMsg = out2.error;
        else local.simMsg = null;
        renderBench(); renderAtlas();
        break;
      }
      case "static-add": {
        var sp = local.staticPlan;
        var p = D.parsePrefix(sp.prefix.trim());
        if (!p) { sp.msg = { ok: false, text: "Prefix must look like 10.0.0.0/8 or 0.0.0.0/0." }; renderBench(); break; }
        var nh = sp.nextHop.trim();
        if (!/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(nh)) {
          sp.msg = { ok: false, text: "Next hop must be an IPv4 address (this estate uses 10.x links)." };
          renderBench(); break;
        }
        var adN = parseInt(sp.ad, 10);
        if (isNaN(adN) || adN < 0 || adN > 255) {
          sp.msg = { ok: false, text: "AD must be 0–255." };
          renderBench(); break;
        }
        A.addStatic({ router: sp.router, prefix: sp.prefix.trim(), nextHop: nh, ad: adN });
        sp.msg = { ok: true, text: "Installed: ip route " + sp.prefix.trim() + " " + nh + " " + adN + " on " + sp.router };
        sp.prefix = "";
        sp.nextHop = "";
        renderBench(); renderAtlas();
        break;
      }
      case "static-remove": A.removeStatic(arg); renderBench(); renderAtlas(); break;
      case "subif-add": {
        var tk = local.trunk;
        var tag = parseInt(tk.newTag, 10);
        var ip = tk.newIp.trim();
        var octet = tag === 10 ? "10.10.10." : tag === 20 ? "10.10.20." : null;
        if (!octet) {
          tk.benchMsg = { ok: false, text: "This trunk carries VLANs 10 and 20 only (training scope)." };
          renderBench(); break;
        }
        if (ip.indexOf(octet) !== 0 || !/^(\d{1,3}\.){3}\d{1,3}\/24$/.test(ip)) {
          tk.benchMsg = {
            ok: false,
            text: "IP must live in the VLAN's subnet: VLAN " + tag + " hosts sit in " + (tag === 10 ? "10.10.10.x/24" : "10.10.20.x/24") + " — e.g. " + octet + "2/24.",
          };
          renderBench(); break;
        }
        var outS = A.addSubif({ name: "G0/0." + tag, tag: tag, ip: ip });
        tk.benchMsg = { ok: outS.ok, text: outS.msg };
        if (outS.ok) tk.newIp = "";
        renderBench(); renderAtlas();
        break;
      }
      case "subif-remove": A.removeSubif(arg); renderBench(); renderAtlas(); break;
      case "trunk-verify": {
        local.trunk.benchMsg = ok10now() && ok20now()
          ? { ok: true, text: "ping 10.10.20.55 from 10.10.10.44 → REPLY (ttl 127) — routed via R1 subinterfaces. Inter-VLAN routing live." }
          : {
              ok: false,
              text: !ok10now()
                ? "ping 10.10.20.55 from 10.10.10.44 → DESTINATION HOST UNREACHABLE — VLAN 10 has no serving gateway subinterface (check tag + IP of G0/0.10)."
                : "ping 10.10.20.55 from 10.10.10.44 → DESTINATION HOST UNREACHABLE — VLAN 20's gateway subinterface is defective (check tag + IP of G0/0.20).",
            };
        renderBench();
        break;
      }
      case "ospf-fix": A.fixOspf(arg); renderBench(); renderAtlas(); break;
      case "debrief-handover": A.markDebriefShown(); A.setModal("handover"); break;
      case "debrief-dismiss": A.markDebriefShown(); A.setModal("none"); break;
      case "reset":
        if (arg === "open") A.setModal("reset");
        else if (arg === "cancel") A.setModal("none");
        else if (arg === "confirm") { A.resetAll(); render(); return true; }
        break;
      default: return false;
    }
    // after any action that could complete the lab
    if (["check", "modal", "debrief-dismiss", "debrief-handover"].indexOf(cmd) !== -1) autoDebrief();
    // re-render affected regions
    switch (cmd) {
      case "mode": case "briefing-back": case "briefing-enter": case "bench":
        render();
        break;
      case "drawer": case "drawer-close": case "modal": case "reset": case "debrief-handover": case "debrief-dismiss":
        renderOverlay();
        break;
      case "ledger-toggle": case "hint": case "goto-bench":
        renderLedger();
        if (cmd === "goto-bench") { renderRail(); renderBench(); }
        break;
      case "check":
        renderBench(); renderLedger(); renderStrip();
        break;
      case "trunk-verify":
        renderBench();
        break;
    }
    return true;
  }

  function ok10now() { return E.vlanGatewayReady(st().env.subifs, 10); }
  function ok20now() { return E.vlanGatewayReady(st().env.subifs, 20); }

  function onClick(e) {
    // backdrop click-to-close (comms / drawers / debrief; the reset dialog
    // intentionally ignores outside clicks, like Radix AlertDialog)
    if (e.target.id === "overlay") {
      var kind = e.target.getAttribute("data-overlay");
      if (kind === "comms") {
        root.GocQuiz.clearTimer();
        A.setModal("none");
        renderOverlay();
        renderStrip();
        autoDebrief();
      } else if (kind === "locker" || kind === "glossary") {
        A.setDrawer("none");
        renderOverlay();
      } else if (kind === "debrief") {
        A.markDebriefShown();
        A.setModal("none");
        renderOverlay();
      }
      return;
    }
    var t = e.target.closest("[data-act],[data-withdraw],[data-op-pick],[data-op-undo],[data-op-clear],[data-quiz],[data-switch]");
    if (!t) return;
    if (t.disabled) return;
    if (t.hasAttribute("data-act")) { act(t.getAttribute("data-act")); return; }
    if (t.hasAttribute("data-withdraw")) {
      A.withdrawSeedRoute(t.getAttribute("data-withdraw"));
      renderBench(); renderAtlas(); renderLedger();
      autoDebrief();
      return;
    }
    if (t.hasAttribute("data-op-pick")) {
      var v = t.getAttribute("data-op-pick").split(":");
      pickOp(v[0], v[1]);
      return;
    }
    if (t.hasAttribute("data-op-undo")) { undoOp(t.getAttribute("data-op-undo")); return; }
    if (t.hasAttribute("data-op-clear")) { clearOp(t.getAttribute("data-op-clear")); return; }
    if (t.hasAttribute("data-quiz")) {
      root.GocQuiz.onClick(t.getAttribute("data-quiz"), t);
      if (st().modal === "none") {
        renderOverlay();
        renderStrip();
        autoDebrief(); // finishing the quiz can complete the lab
      }
      return;
    }
    if (t.hasAttribute("data-switch")) { onSwitch(t); return; }
  }

  function pickOp(picker, id) {
    if (picker === "m3") {
      var cur = ans("M3", "order") || [];
      if (cur.indexOf(id) === -1) A.setAnswer("M3", "order", cur.concat([id]));
    } else if (picker === "m12") {
      var cur2 = ans("M12", "rules") || [];
      if (cur2.indexOf(id) === -1) A.setAnswer("M12", "rules", cur2.concat([id]));
    } else if (picker === "h8") {
      A.pushH8(id);
    }
    renderBench();
  }
  function undoOp(picker) {
    if (picker === "m3") A.setAnswer("M3", "order", (ans("M3", "order") || []).slice(0, -1));
    else if (picker === "m12") A.setAnswer("M12", "rules", (ans("M12", "rules") || []).slice(0, -1));
    else if (picker === "h8") A.undoH8();
    renderBench();
  }
  function clearOp(picker) {
    if (picker === "m3") A.setAnswer("M3", "order", []);
    else if (picker === "m12") A.setAnswer("M12", "rules", []);
    else if (picker === "h8") A.clearH8();
    renderBench();
  }

  function onSwitch(t) {
    var key = t.getAttribute("data-switch");
    var f = st().env.fhrp;
    if (key === "sw-r1") A.patchFhrp({ r1: { up: !f.r1.up, priority: f.r1.priority } });
    else if (key === "sw-r1b") A.patchFhrp({ r1b: { up: !f.r1b.up, priority: f.r1b.priority } });
    else if (key === "sw-preempt") A.patchFhrp({ preempt: !f.preempt });
    renderBench(); renderAtlas();
  }

  function onInput(e) {
    var t = e.target;
    if (t.hasAttribute("data-bind")) {
      var b = t.getAttribute("data-bind");
      if (b === "dst") local.dst = t.value;
      else if (b === "static-prefix") local.staticPlan.prefix = t.value;
      else if (b === "static-nexthop") local.staticPlan.nextHop = t.value;
      else if (b === "static-ad") local.staticPlan.ad = t.value;
      else if (b === "trunk-newip") local.trunk.newIp = t.value;
      return; // local state only — nothing else on screen depends on it
    }
    if (t.hasAttribute("data-answer")) {
      var p = t.getAttribute("data-answer").split("|");
      A.setAnswer(p[0], p[1], t.value);
      return; // value already visible in the input; no re-render (keeps caret)
    }
    if (t.hasAttribute("data-nat-port")) {
      var fid = t.getAttribute("data-nat-port");
      var flow = null;
      D.PAT_FLOWS.forEach(function (x) { if (x.id === fid) flow = x; });
      var port = parseInt(t.value, 10);
      A.buildNat({
        id: fid,
        insideLocal: flow.insideLocal,
        insideGlobalIp: "203.0.113.66",
        insideGlobalPort: isNaN(port) ? null : port,
        outside: flow.outside,
      });
      return;
    }
    if (t.hasAttribute("data-h5")) {
      var kind = t.getAttribute("data-h5");
      var cur = null;
      st().env.natBuilt.forEach(function (x) { if (x.id === "h5-pat") cur = x; });
      if (kind === "static") {
        A.buildNat({ id: "h5-static", insideLocal: "10.10.20.5", insideGlobalIp: t.value, insideGlobalPort: null, outside: "any" });
      } else if (kind === "pat-ip") {
        A.buildNat({ id: "h5-pat", insideLocal: D.H5_FLOW.insideLocal, insideGlobalIp: t.value, insideGlobalPort: cur ? cur.insideGlobalPort : null, outside: D.H5_FLOW.outside });
      } else if (kind === "pat-port") {
        var pnum = parseInt(t.value, 10);
        var curIp = "";
        st().env.natBuilt.forEach(function (x) { if (x.id === "h5-pat") curIp = x.insideGlobalIp; });
        A.buildNat({ id: "h5-pat", insideLocal: D.H5_FLOW.insideLocal, insideGlobalIp: curIp, insideGlobalPort: isNaN(pnum) ? null : pnum, outside: D.H5_FLOW.outside });
      }
      return;
    }
    if (t.hasAttribute("data-fhrp-prio")) {
      var k = t.getAttribute("data-fhrp-prio");
      var f = st().env.fhrp;
      var pnum2 = Math.max(0, Math.min(255, parseInt(t.value, 10) || 0));
      if (k === "r1") A.patchFhrp({ r1: { up: f.r1.up, priority: pnum2 } });
      else A.patchFhrp({ r1b: { up: f.r1b.up, priority: pnum2 } });
      return;
    }
    if (t.hasAttribute("data-subif-ip")) {
      A.updateSubif(t.getAttribute("data-subif-ip"), { ip: t.value });
      return;
    }
  }

  function onChange(e) {
    var t = e.target;
    if (t.hasAttribute("data-select")) {
      var v = t.getAttribute("data-select");
      var parts = v.split("|");
      if (parts[0] === "ans") {
        A.setAnswer(parts[1], parts[2], t.value);
        renderBench(); // radio-style rows / highlight states may derive from it
      } else if (v === "static-router") {
        local.staticPlan.router = t.value;
      } else if (v === "fhrp-proto") {
        A.patchFhrp({ protocol: t.value });
        renderBench(); renderAtlas();
      } else if (parts[0] === "subif-tag") {
        var out = A.updateSubif(parts[1], { tag: parseInt(t.value, 10) });
        local.trunk.benchMsg = { ok: out.ok, text: out.msg };
        renderBench(); renderAtlas();
      } else if (v === "trunk-newtag") {
        local.trunk.newTag = t.value;
        renderBench();
      }
      return;
    }
    if (t.hasAttribute("data-radio")) {
      // format: ans|OBJ|KEY:VALUE
      var rv = t.getAttribute("data-radio").split("|");
      var val = rv[2].split(":");
      A.setAnswer(rv[1], val[0], val[1]);
      renderBench();
      return;
    }
    if (t.hasAttribute("data-fact")) {
      var fv = t.getAttribute("data-fact").split("|");
      var objId = fv[0], key = fv[1], optId = fv[2];
      var cur = ans(objId, key) || [];
      var next = cur.indexOf(optId) !== -1 ? cur.filter(function (x) { return x !== optId; }) : cur.concat([optId]);
      A.setAnswer(objId, key, next);
      renderBench();
      return;
    }
    if (t.hasAttribute("data-quiz-pick")) {
      root.GocQuiz.onChange(t.getAttribute("data-quiz-pick"), t);
      return;
    }
  }

  function onKeyDown(e) {
    if (e.key === "Escape") {
      var s = st();
      if (s.modal === "reset") { A.setModal("none"); renderOverlay(); return; }
      if (s.modal === "debrief") { A.markDebriefShown(); A.setModal("none"); renderOverlay(); return; }
      if (s.modal === "comms") {
        root.GocQuiz.clearTimer();
        A.setModal("none");
        renderOverlay();
        renderStrip();
        autoDebrief(); // closing the quiz can complete the lab
        return;
      }
      if (s.drawer !== "none") { A.setDrawer("none"); renderOverlay(); return; }
      return;
    }
    // light focus trap while an overlay is open
    var overlay = document.getElementById("overlay");
    if (overlay && e.key === "Tab") {
      var focusables = overlay.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    // roving-tabindex-ish tab lists (Radix parity): arrows switch tabs
    var tablist = e.target.closest("[data-tablist]");
    if (tablist && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
      var tabs = Array.prototype.slice.call(tablist.querySelectorAll("[role=tab]"));
      var idx = tabs.indexOf(document.activeElement);
      if (idx === -1) return;
      e.preventDefault();
      var dir = e.key === "ArrowRight" ? 1 : -1;
      var next = tabs[(idx + dir + tabs.length) % tabs.length];
      next.focus();
      next.click();
    }
    var rail = e.target.closest("#bench-rail");
    if (rail && (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "Home" || e.key === "End")) {
      var keys = Array.prototype.slice.call(rail.querySelectorAll(".bench-key"));
      var i2 = keys.indexOf(document.activeElement);
      if (i2 === -1) return;
      e.preventDefault();
      var ni;
      if (e.key === "Home") ni = 0;
      else if (e.key === "End") ni = keys.length - 1;
      else ni = (i2 + (e.key === "ArrowRight" ? 1 : -1) + keys.length) % keys.length;
      keys[ni].focus();
      keys[ni].click();
    }
  }

  // ═══════════════ boot ═══════════════
  function boot() {
    app = document.getElementById("app");
    resetLocal();
    // restore persisted state (synchronous localStorage load, like the original)
    var loaded = Store.load();
    var keys = Object.keys(loaded);
    for (var i = 0; i < keys.length; i++) st()[keys[i]] = loaded[keys[i]];
    render();

    app.addEventListener("click", onClick);
    app.addEventListener("input", onInput);
    app.addEventListener("change", onChange);
    document.addEventListener("keydown", onKeyDown);

    // quiz state migration note: load() already drops stale quiz answers (v2)
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  root.GocApp = { autoDebrief: autoDebrief, render: render };
})(typeof window !== "undefined" ? window : globalThis);
