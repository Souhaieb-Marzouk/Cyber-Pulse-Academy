// ── Red-Line Room · UI helpers + shell screens ─────────────────────────
// Vanilla-JS re-creation of the original React components (semantic HTML
// strings + delegated events). Behavioral parity with the original.
"use strict";

window.RL = window.RL || {};

(function () {
  var D = window.RL_DATA;
  var C = window.RL_CONTENT;

  var RL = window.RL;

  // ── helpers ────────────────────────────────────────────────────────────
  function esc(v) {
    return String(v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function icon(name, size, cls) {
    size = size || 16;
    var c = cls ? " " + cls : "";
    return '<svg class="ic' + c + '" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (window.RL_ICONS[name] || "") + "</svg>";
  }

  function btn(attrs, labelHtml, cls) {
    return '<button type="button" class="btn ' + (cls || "") + '" ' + attrs + ">" + labelHtml + "</button>";
  }

  function zoneName(z) {
    for (var i = 0; i < D.ZONES.length; i++) if (D.ZONES[i].id === z) return D.ZONES[i].name;
    return z;
  }

  function zoneTick(z) {
    return "tick-" + z;
  }

  var PILLAR_META = {
    P1: { label: "Understand", cls: "pb-p1" },
    P2: { label: "Recognize", cls: "pb-p2" },
    P3: { label: "Detect", cls: "pb-p3" },
    P4: { label: "Mitigate", cls: "pb-p4" },
  };

  function pillarBadge(pillar) {
    var m = PILLAR_META[pillar];
    return '<span class="badge stencil pillar-badge ' + m.cls + '" aria-label="Pillar ' + pillar + ": " + m.label + '">' + pillar + " · " + m.label + "</span>";
  }

  var VERDICT_META = {
    ALLOWED: { cls: "verdict-allowed" },
    BLOCKED: { cls: "verdict-blocked", label: "BLOCKED" },
    QUARANTINED: { cls: "verdict-quarantined" },
    REJECTED: { cls: "verdict-rejected", label: "REJECTED" },
    DEGRADED: { cls: "verdict-degraded" },
  };

  function verdictChip(verdict, attack) {
    var meta = VERDICT_META[verdict] || VERDICT_META.ALLOWED;
    var bad = verdict === "DEGRADED" || (verdict === "ALLOWED" && attack);
    var cls = bad
      ? "verdict-allowbad"
      : verdict === "BLOCKED" || verdict === "REJECTED"
        ? meta.cls
        : meta.cls;
    var label = verdict === "BLOCKED" || verdict === "REJECTED" ? meta.label : bad ? "ALLOWED ✗" : verdict;
    return '<span class="verdict-chip draft-mono ' + cls + '" role="status">' + label + "</span>";
  }

  function stepDot(status) {
    return '<span aria-hidden="true" class="step-dot dot-' + esc(status) + '"></span>';
  }

  function sectionTitle(title, sub, iconHtml) {
    return (
      '<div class="section-title">' +
      "<h3" + (iconHtml ? ' style="display:flex;align-items:center;gap:8px"' : "") + ">" + (iconHtml || "") + '<span class="stencil">' + esc(title) + "</span></h3>" +
      (sub ? "<p>" + esc(sub) + "</p>" : "") +
      "</div>"
    );
  }

  function tech(v) {
    return '<code class="draft-mono" style="font-size:12px;background:#16242f;border:1px solid #24384c;border-radius:2px;padding:1px 4px">' + esc(v) + "</code>";
  }

  // device icons (same mapping as BlueprintMap.tsx)
  var DEVICE_ICON = {
    internet: "globe",
    guestwifi: "wifi",
    webserver: "server",
    mailrelay: "mail",
    staffpc: "monitor",
    records: "database",
    adminws: "laptop",
    gw1: "router",
    cs1: "network",
    wlc1: "radiotower",
  };

  // ── mode gate ─────────────────────────────────────────────────────────
  function renderModeGate() {
    return (
      '<main class="mode-gate blueprint-grid" aria-label="Mode selection">' +
      '<div class="mode-gate-inner">' +
      '<div class="mode-gate-head paper-edge">' +
      '<div class="mode-gate-head-row">' +
      "<div>" +
      '<div style="display:flex;align-items:center;gap:12px">' +
      icon("draftingcompass", 24, "text-amber") +
      '<h1 class="mode-gate-title">' + esc(D.LAB_TITLE) + "</h1>" +
      "</div>" +
      '<p class="mode-gate-sub">' + esc(D.LAB_SUB) + "</p>" +
      "</div>" +
      '<p class="mode-gate-sheet draft-mono">SHEET 01 · DEFENSE DRAFT<br />N10-009 · LESSON 4.8<br />TRAINING SIMULATION — SYNTHETIC DATA</p>' +
      "</div>" +
      "</div>" +
      '<h2 class="stencil mode-gate-h">Choose your sitting — same drawing, different mission</h2>' +
      '<div class="mode-grid">' +
      modeCard("medium", "draftingcompass", "GUIDED DRAFT", "Learn &amp; build", "#f0a832", [
        "12 step-by-step specs, each a single learning bite",
        "3-level hint stamps available on every spec",
        "Guided 'next spec' spotlight — never lost",
        "Concept quiz with an explanation on every answer",
      ]) +
      modeCard("hard", "flaskconical", "AUDIT TRIAL", "Test &amp; stretch", "#ef6b5e", [
        "9 broad missions driven by a noisy 10-item findings memo",
        "2 red herrings, 11 mixed log lines, no spotlight",
        "Predict verdicts before the rig reveals them",
        "Scenario quiz — justify every call; hints cost score",
      ]) +
      "</div>" +
      '<div class="mode-gate-legend">' +
      "<span>" + icon("map", 14) + " draft the network</span>" +
      "<span>" + icon("shieldcheck", 14) + " stamp the controls</span>" +
      "<span>" + icon("timer", 14) + " stress-test with live traffic</span>" +
      "<span>" + icon("lightbulb", 14) + " sign off with proof</span>" +
      "</div>" +
      "</div>" +
      "</main>"
    );
  }

  function modeCard(mode, ic, title, tag, accent, lines) {
    var lis = lines
      .map(function (l) {
        return '<li class="mode-card-line"><span aria-hidden="true" style="color:' + accent + '">&#8250;</span><span>' + l + "</span></li>";
      })
      .join("");
    return (
      '<div class="card mode-card ' + mode + '" role="button" tabindex="0" aria-label="' + title + " — " + tag + '. Activate to select." data-act="set-mode" data-mode="' + mode + '">' +
      '<div class="mode-card-body">' +
      '<div class="mode-card-title-row">' +
      '<span style="color:' + accent + ';display:inline-flex">' + icon(ic, 20) + "</span>" +
      '<span class="mode-card-title">' + title + "</span>" +
      '<span class="mode-card-tag draft-mono" style="color:' + accent + '">' + tag + "</span>" +
      "</div>" +
      '<ul>' + lis + "</ul>" +
      "</div>" +
      "</div>"
    );
  }

  // ── briefing ──────────────────────────────────────────────────────────
  function renderBriefing(mode) {
    var sitting;
    if (mode === "medium") {
      sitting =
        '<p class="briefing-mode-p"><span style="color:var(--amber);flex-shrink:0;margin-top:2px;display:inline-flex">' + icon("graduationcap", 16) + "</span>" +
        "<span><strong>Your sitting: Guided Draft.</strong> Twelve specs walk the seven defense families in order — harden the devices, gate the door with NAC, clean the vault, write real rules, place the zones — then prove the design in the Traffic Bay. Hints and explanations are free; use them.</span></p>";
    } else {
      sitting =
        '<p class="briefing-mode-p"><span style="color:var(--red);flex-shrink:0;margin-top:2px;display:inline-flex">' + icon("shieldalert", 16) + "</span>" +
        "<span><strong>Your sitting: Audit Trial.</strong> The memo is in the Evidence Pack, the evidence log is noisy, and two findings are red herrings. No spotlight, no hints by default. Triage, remediate everything, sequence the rollout — and predict what the Traffic Bay will show before it shows you.</span></p>";
    }
    return (
      '<main class="briefing blueprint-grid" aria-label="Scenario briefing">' +
      '<div class="card briefing-card paper-edge">' +
      '<div class="briefing-body">' +
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">' +
      '<span style="color:var(--amber);display:inline-flex">' + icon("penline", 16) + "</span>" +
      '<p class="stencil" style="font-size:12px;color:var(--muted-foreground)">SCENARIO BRIEFING · JOB CARD 0447</p>' +
      "</div>" +
      '<h1 class="briefing-h1">The reviewer left the memo on your desk at 07:58.</h1>' +
      '<div class="briefing-text">' +
      "<p><strong>Northlake Community College</strong> — 9,000 students, three campuses, one border router. Last month a contractor's laptop walked straight onto the staff network with a VPN key that has been &quot;temporary&quot; since 2023. This morning, an accreditation reviewer handed the IT director a findings memo, and the director handed it to <strong>you</strong> — the network engineer on the hook for it.</p>" +
      "<p>The drawing set on this bench is Northlake's network as it exists today: <em>flat, permissive and full of defaults</em>. The public website shares a VLAN with the student records server. The border ACL is a single &quot;permit ip any any&quot; written in 2016. Telnet is still listening. Nobody has looked at the key vault in years.</p>" +
      sitting +
      '<p class="briefing-note" style="margin-top:1rem">Everything in this lab is simulated training data for the CompTIA Network+ N10-009 security-features lesson: fictional college, synthetic IPs (203.0.113.x / 10.9.x.x), invented hostnames and logs. Nothing here touches a real network — everything here maps to one you\'ll defend.</p>' +
      "</div>" +
      '<div class="briefing-actions">' +
      btn('data-act="start" class="btn-primary minh-11"', "Open the drawing set") +
      '<span class="badge stencil" style="font-size:10px;color:var(--muted-foreground)">Progress auto-saves</span>' +
      '<span class="badge stencil" style="font-size:10px;color:var(--muted-foreground)">Defensive · educational use only</span>' +
      "</div>" +
      "</div>" +
      "</div>" +
      "</main>"
    );
  }

  // ── header masthead ───────────────────────────────────────────────────
  function renderHeader(state, objectives, quizQuestions) {
    var doneCount = objectives.filter(function (o) { return state.objectives[o.id] && state.objectives[o.id].done; }).length;
    var quizAnswered = quizQuestions.filter(function (q) { return state.quiz[q.id] !== undefined; }).length;
    var mode = state.mode;
    return (
      '<header class="masthead">' +
      '<div class="masthead-inner">' +
      '<div style="display:flex;align-items:center;gap:8px;min-width:0">' +
      '<span style="color:var(--amber);flex-shrink:0;display:inline-flex">' + icon("draftingcompass", 20) + "</span>" +
      '<div style="min-width:0">' +
      '<h1 class="masthead-title">' + esc(D.LAB_TITLE) + "</h1>" +
      '<p class="masthead-sub draft-mono">' + esc(D.LAB_SUB) + " · SHEET 01 · TRAINING SIMULATION</p>" +
      "</div>" +
      "</div>" +
      '<span class="badge stencil" style="font-size:9px;flex-shrink:0;' + (mode === "medium" ? "border-color:rgba(240,168,50,0.6);color:#f0c77e" : "border-color:rgba(239,107,94,0.6);color:#ff9c92") + '">' +
      (mode === "medium" ? "GUIDED DRAFT" : "AUDIT TRIAL") + "</span>" +
      '<p class="masthead-counts draft-mono" aria-live="polite">specs ' + doneCount + "/" + objectives.length + " · quiz " + quizAnswered + "/" + quizQuestions.length + "</p>" +
      btn('data-act="reset-open"', icon("rotateccw", 14) + " Reset", "btn-outline btn-sm h-9") +
      "</div>" +
      "</header>"
    );
  }

  // ── drawing board ─────────────────────────────────────────────────────
  function deviceChip(state, d, ui) {
    var zone = state.env.zones[d.id];
    var open = ui.popoverDev === d.id;
    var aria =
      esc(d.name) + " — currently in " + esc(zoneName(zone)) + ". " +
      (d.movable ? "Activate to change zone." : "Placement fixed by design.");
    var chip =
      '<button type="button" class="device-chip draft-mono' + (d.movable ? " movable" : "") + '" aria-label="' + aria + '"' +
      ' aria-expanded="' + (open ? "true" : "false") + '" data-act="zone-menu" data-device="' + d.id + '">' +
      '<span aria-hidden="true" class="zone-dot ' + zoneTick(zone) + '"></span>' +
      icon(DEVICE_ICON[d.id], 14) +
      esc(d.short) +
      "</button>";
    var pop = "";
    if (open) {
      if (d.movable) {
        var zoneBtns = D.ZONE_ORDER
          .map(function (z) {
            return (
              '<button type="button" class="btn btn-outline' + (zone === z ? " current" : "") + '" data-act="set-zone" data-device="' + d.id + '" data-zone="' + z + '">' +
              '<span aria-hidden="true" class="zone-dot ' + zoneTick(z) + '"></span>' +
              esc(zoneName(z)) +
              "</button>"
            );
          })
          .join("");
        pop =
          '<div class="popover" role="dialog" aria-label="Stamp zone for ' + esc(d.name) + '">' +
          '<p class="pop-name">' + esc(d.name) + "</p>" +
          '<p class="pop-blurb">' + esc(d.blurb) + "</p>" +
          '<p class="stencil" style="font-size:10px;color:var(--muted-foreground);margin-bottom:6px">STAMP ZONE:</p>' +
          '<div class="pop-grid">' + zoneBtns + "</div>" +
          "</div>";
      } else {
        pop =
          '<div class="popover" role="dialog" aria-label="' + esc(d.name) + '">' +
          '<p class="pop-name">' + esc(d.name) + "</p>" +
          '<p class="pop-blurb">' + esc(d.blurb) + "</p>" +
          '<p class="pop-fixed draft-mono">FIXED BY DESIGN — placement is not the decision here.</p>' +
          "</div>";
      }
    }
    return '<span class="pop-wrap">' + chip + pop + "</span>";
  }

  function renderBlueprint(state, ui) {
    var devices = D.DEVICES;
    function inZone(z) {
      return devices.filter(function (d) { return state.env.zones[d.id] === z; });
    }
    var dmzDevices = inZone("dmz");
    var zoneChips = function (z) {
      return inZone(z)
        .map(function (d) { return deviceChip(state, d, ui); })
        .join("");
    };
    var legend = D.ZONES
      .map(function (z) {
        return (
          '<span class="lg-item"><span aria-hidden="true" class="swatch tick-' + z.id + '" style="border-radius:2px"></span>' +
          '<span class="draft-mono">' + esc(z.name) + '</span><span title="' + esc(z.desc) + '" style="display:inline-flex;cursor:help">' + icon("info", 12) + '</span><span class="sr-only">' + esc(z.desc) + "</span></span>"
        );
      })
      .join("");
    return (
      '<div class="spacer-4">' +
      '<div class="draw-scroll thin-scroll"><div class="draw-canvas">' +
      '<div class="draw-board blueprint-grid">' +
      '<div class="zone-box zone-untrusted" aria-hidden="true" style="inset:0"></div>' +
      '<div class="draw-label stencil">UNTRUSTED ZONE · THE OUTSIDE</div>' +
      '<svg class="draw-connectors" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' +
      '<line x1="18" y1="17" x2="47" y2="27" stroke="#3d5a75" stroke-width="0.35" stroke-dasharray="1.6 1.2" />' +
      '<line x1="83" y1="17" x2="53" y2="27" stroke="#3d5a75" stroke-width="0.35" stroke-dasharray="1.6 1.2" />' +
      '<line x1="50" y1="30" x2="50" y2="40" stroke="#3d5a75" stroke-width="0.35" stroke-dasharray="1.6 1.2" />' +
      '<line x1="50" y1="40" x2="72" y2="48" stroke="#3d5a75" stroke-width="0.35" stroke-dasharray="1.6 1.2" />' +
      "</svg>" +
      '<div class="draw-gate" aria-hidden="true">' +
      '<span class="draw-gate-chip draft-mono">' + icon("lock", 10) + " NORTH-GW1</span>" +
      '<span class="draw-gate-sub draft-mono">border gate · mgmt plane in MGMT zone</span>' +
      "</div>" +
      '<div class="draw-untrusted">' + zoneChips("untrusted") + "</div>" +
      '<div class="draw-trusted zone-box zone-trusted">' +
      '<span class="zone-label stencil" style="font-size:10px;color:var(--mint-text)">TRUSTED ZONE · THE INSIDE</span>' +
      '<div class="draw-trusted-chips">' + zoneChips("trusted") + "</div>" +
      '<div class="draw-mgmt zone-box zone-mgmt">' +
      '<span class="zone-label stencil" style="font-size:10px;color:#c3d2e0">MANAGEMENT ZONE · VLAN 99</span>' +
      '<div class="draw-mgmt-chips">' + zoneChips("mgmt") + "</div>" +
      "</div>" +
      "</div>" +
      '<div class="draw-dmz zone-box zone-dmz">' +
      '<span class="zone-label stencil" style="font-size:10px;color:var(--amber-text)">SCREENED SUBNET · DMZ</span>' +
      '<div class="draw-dmz-chips">' +
      (dmzDevices.length === 0
        ? '<span class="draw-dmz-empty draft-mono">empty buffer — stamp a public service here</span>'
        : dmzDevices.map(function (d) { return deviceChip(state, d, ui); }).join("")) +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div></div>" +
      '<div class="draw-legend">' + legend + '<span class="draft-mono" style="color:var(--amber)">dashed border = movable stamp</span></div>' +
      "</div>"
    );
  }

  RL.ui = {
    esc: esc,
    icon: icon,
    btn: btn,
    zoneName: zoneName,
    zoneTick: zoneTick,
    pillarBadge: pillarBadge,
    PILLAR_META: PILLAR_META,
    verdictChip: verdictChip,
    stepDot: stepDot,
    sectionTitle: sectionTitle,
    tech: tech,
    DEVICE_ICON: DEVICE_ICON,
    renderModeGate: renderModeGate,
    renderBriefing: renderBriefing,
    renderHeader: renderHeader,
    renderBlueprint: renderBlueprint,
  };
})();
