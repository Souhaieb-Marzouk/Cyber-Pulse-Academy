/* ============================================================================
   The Blueprint Room — js/ui.js
   Rendering layer: pure functions that turn (state, uiState) into HTML strings.
   Components are transcribed from the original React components — same markup
   structure, same copy, same ARIA attributes, same conditional styling.
   Event wiring happens in js/app.js via data-act delegation.
   ============================================================================ */

"use strict";

window.LAB_UI = (function () {

  const D = window.LAB_DATA;
  const O = window.LAB_OBJECTIVES;
  const Q = window.LAB_QUIZ;
  const S = window.LAB_STORE;
  const E = window.LAB_ENGINE;
  const icon = window.LAB_ICONS.icon;

  function esc(v) {
    return String(v === null || v === undefined ? "" : v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  const PILLAR_STYLE = {
    P1: { cls: "pillar-p1", label: "P1 · Understand" },
    P2: { cls: "pillar-p2", label: "P2 · Recognize" },
    P3: { cls: "pillar-p3", label: "P3 · Diagnose" },
    P4: { cls: "pillar-p4", label: "P4 · Design" },
  };

  const PILLARS = [
    { id: "P1", label: "Understand" },
    { id: "P2", label: "Recognize" },
    { id: "P3", label: "Diagnose" },
    { id: "P4", label: "Design" },
  ];

  const TOOL_TABS = [
    { id: "inspector", label: "Inspector", ic: "info" },
    { id: "failure", label: "Failure Rig", ic: "zap" },
    { id: "path", label: "Path Tester", ic: "route" },
    { id: "build", label: "Build", ic: "hammer" },
    { id: "evidence", label: "Evidence", ic: "file-search" },
  ];

  const KIND_COLOR = { host: "#8FA3BF", switch: "#22D3EE", router: "#F59E0B", spine: "#34D399", leaf: "#2DD4BF", cloud: "#A78BFA", site: "#A78BFA" };
  const LAYER_COLOR = { core: "#F59E0B", collapsed: "#FB923C", distribution: "#38BDF8", access: "#22D3EE", spine: "#34D399", leaf: "#2DD4BF" };

  function nodeColor(n) {
    if (n.layer && LAYER_COLOR[n.layer]) return LAYER_COLOR[n.layer];
    return KIND_COLOR[n.kind] || "#8FA3BF";
  }

  function labelOf(graph, id) {
    const n = graph.nodes.find(function (x) { return x.id === id; });
    return n ? n.label : id;
  }

  /* ============================== MODE SELECT =============================== */

  function renderModeSelect(state) {
    return (
      '<div class="screen screen-center" data-testid="mode-select">' +
        '<main class="mode-main">' +
          '<header class="mode-head">' +
            '<div class="badge-row">' +
              '<span class="badge badge-cyan">INTERACTIVE PRACTICE LAB</span>' +
              '<span class="badge badge-amber">SYNTHETIC TRAINING DATA</span>' +
            '</div>' +
            '<h1 class="mode-title">' + icon("drafting-compass", "ic ic-lg t-cyanb") + "The Blueprint Room</h1>" +
            '<p class="mode-sub">CompTIA Network+ N10-009 · Lesson 1.8: Network topologies (Domain 1.0 — 23% of the exam)</p>' +
          '</header>' +
          '<section class="panel briefing" aria-label="Scenario briefing">' +
            '<p class="micro-label">Scenario briefing — C1</p>' +
            '<p class="brief-text"><b class="ink">Trellis Foods</b> — fictional client, real topologies — has hired your consulting team for the <b class="t-cyan">Topology Modernization Project</b>: a retail branch with a fragile wiring closet, a three-tier HQ with a suspicious single-homing habit, a new data-center pod, six metro warehouses (one stranded), a partner circuit to secure, a small annex building to design, and a hybrid campus to document.</p>' +
            '<p class="brief-text">Seven as-built drawings. Your desk has an <b class="t-cyan">Inspector</b>, a <b class="t-cyan">Failure Rig</b>, a <b class="t-cyan">Path Tester</b> and a <b class="t-cyan">Build Board</b>. By sign-off you will identify every topology in the portfolio, break and fix them, and defend each design choice — the exact skills the N10-009 exam and the field both demand.</p>' +
          '</section>' +
          '<section class="mode-grid" aria-label="Difficulty selection">' +
            '<div class="mode-card mode-card-medium">' +
              '<div class="mode-card-head">' + icon("graduation-cap", "ic t-mint") + '<h2 class="mode-card-title t-mint">Medium — learn the craft</h2></div>' +
              '<ul class="mode-list">' +
                '<li>· 12 guided objectives, introduced in order, each mapped to a drawing</li>' +
                '<li>· 3-tier hints per objective (nudge → direction → demonstration)</li>' +
                '<li>· Tolerant checks + teaching feedback on every wrong turn</li>' +
                '<li>· Quiz after practice: 7 concept questions, checked one by one with explanations</li>' +
              '</ul>' +
              '<button type="button" class="btn btn-mint btn-block" data-act="start" data-mode="medium">Enter as apprentice</button>' +
            '</div>' +
            '<div class="mode-card mode-card-hard">' +
              '<div class="mode-card-head">' + icon("mountain", "ic t-coral") + '<h2 class="mode-card-title t-coral">Hard — prove it under noise</h2></div>' +
              '<ul class="mode-list">' +
                '<li>· 10 deep challenges: triage tickets, infer fabrics, build cut-proof designs</li>' +
                '<li>· Realistic noisy evidence with red herrings planted</li>' +
                '<li>· Strict validation — near-misses are rejected with the reasoning why</li>' +
                '<li>· One optional nudge per objective, and it visibly costs score</li>' +
                '<li>· Plan Review: 8 scenario items, one at a time — answers lock on check</li>' +
              '</ul>' +
              '<button type="button" class="btn btn-coral btn-block" data-act="start" data-mode="hard">Enter as consultant</button>' +
            '</div>' +
          '</section>' +
          '<p class="disclaimer">' + icon("flask-conical", "ic ic-xs") + "<span>DEFENSIVE / EDUCATIONAL USE · ALL ORGS, DEVICES, TICKETS &amp; PRICES FICTIONAL · PROGRESS SAVES IN YOUR BROWSER</span></p>" +
        '</main>' +
      '</div>'
    );
  }

  /* ============================== TOPOLOGY CANVAS ============================ */

  function renderCanvas(graph, state, ui, offlineIds, hideRoles, buildMode) {
    const offline = new Set(offlineIds);
    const deadNodes = new Set(state.failedNodes);
    const deadEdges = new Set(state.failedEdges);
    let out = '<svg viewBox="' + esc(graph.viewBox) + '" class="canvas" role="group" aria-label="Topology drawing ' + esc(graph.sheet) + ": " + esc(graph.name) + ". " + graph.nodes.length + ' devices, ' + graph.edges.length + ' links.">';

    for (const e of graph.edges) {
      const a = graph.nodes.find(function (n) { return n.id === e.a; });
      const b = graph.nodes.find(function (n) { return n.id === e.b; });
      if (!a || !b) continue;
      const dead = deadEdges.has(e.id);
      const proposed = e.id.indexOf("add-") === 0 || e.id.indexOf("bx-") === 0;
      const selected = state.selEdge === e.id;
      const color = dead ? "#FB7185" : selected ? "#F59E0B" : proposed ? "#22D3EE" : "#33507A";
      const aria = labelOf(graph, e.a) + " ↔ " + labelOf(graph, e.b) + " link" + (dead ? " (failed)" : "") + (proposed ? " (proposed)" : "");
      out += '<g role="button" tabindex="0" aria-label="' + esc(aria) + '" data-act="edge" data-id="' + esc(e.id) + '" class="hit">' +
        "<title>" + esc(labelOf(graph, e.a) + " ↔ " + labelOf(graph, e.b) + " — " + (e.media || "link") + " " + (e.bw || "") + (dead ? " (FAILED)" : "") + (proposed ? " (proposed)" : "")) + "</title>" +
        '<line x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '" stroke="' + color + '" stroke-width="' + (selected || dead ? 3 : 2) + '"' + (dead ? ' stroke-dasharray="6 4"' : proposed ? ' stroke-dasharray="5 5"' : "") + " />" +
        '<line x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '" stroke="transparent" stroke-width="14" class="edge-hitline" />' +
        ((dead || proposed) ? '<circle cx="' + (a.x + b.x) / 2 + '" cy="' + (a.y + b.y) / 2 + '" r="3.4" fill="' + color + '" />' : "") +
        "</g>";
    }

    for (const n of graph.nodes) {
      const dead = deadNodes.has(n.id);
      const isOff = offline.has(n.id);
      const selected = state.selNode === n.id;
      const isLinkFrom = ui.linkFrom === n.id;
      const r = n.kind === "host" ? 11 : n.kind === "cloud" ? 18 : 15;
      const maskRole = hideRoles && (n.layer === "spine" || n.layer === "leaf");
      const color = dead ? "#FB7185" : maskRole ? "#22D3EE" : nodeColor(n);
      const aria = n.label + (n.isHost ? " (endpoint)" : "") + (dead ? " (failed)" : "") + (isOff ? " (offline)" : "");
      let title = n.label;
      if (!maskRole && n.model) title += " — " + n.model;
      title += maskRole ? " — Fabric switch (role not documented; see the Evidence tab)" : (n.note ? " — " + n.note : "");
      if (dead) title += " (FAILED)";
      if (isOff) title += " (OFFLINE)";
      out += '<g role="button" tabindex="0" aria-label="' + esc(aria) + '" data-act="node" data-id="' + esc(n.id) + '" class="hit"' + (dead ? "" : isOff ? ' opacity="0.38"' : "") + ">" +
        "<title>" + esc(title) + "</title>" +
        ((selected || isLinkFrom) ? '<circle cx="' + n.x + '" cy="' + n.y + '" r="' + (r + 6) + '" fill="none" stroke="' + (isLinkFrom ? "#22D3EE" : "#F59E0B") + '" stroke-width="2.5"' + (isLinkFrom ? ' stroke-dasharray="4 3"' : "") + " />" : "") +
        '<circle cx="' + n.x + '" cy="' + n.y + '" r="' + r + '" fill="' + (dead ? "#3B0F1D" : "#0E1B2E") + '" stroke="' + color + '" stroke-width="' + (dead ? 3 : selected || isLinkFrom ? 3 : 2) + '"' +
          (dead ? ' stroke-dasharray="5 3"' : isOff ? ' stroke-dasharray="4 4"' : "") + ' class="node-hit" />' +
        (dead ? '<text x="' + n.x + '" y="' + (n.y + 4) + '" text-anchor="middle" font-size="' + r + '" fill="#FB7185" font-weight="700">✕</text>' : "") +
        '<text x="' + n.x + '" y="' + (n.y + r + 13) + '" text-anchor="middle" font-size="' + (n.kind === "host" ? 10.5 : 11.5) + '" fill="' + (dead ? "#FB7185" : isOff ? "#64748B" : "#D7E3F4") + '" class="node-label">' + esc(n.label) + "</text>" +
        (buildMode ? '<circle cx="' + n.x + '" cy="' + n.y + '" r="' + (r - 5) + '" fill="none" stroke="#22D3EE" stroke-width="1" opacity="0.5" />' : "") +
        "</g>";
    }
    out += "</svg>";
    return out;
  }

  /* ================================ TOPBAR ================================== */

  function renderTopbar(state, ui) {
    const mode = state.mode || "medium";
    const objs = O.objectivesFor(mode);
    const doneCount = objs.filter(function (o) { return state.obj[o.id] && state.obj[o.id].done; }).length;
    const quiz = Q.quizFor(mode);
    const quizDone = quiz.filter(function (q) { return (state.quizAnswers[q.id] || []).length > 0; }).length;
    const badgeCls = mode === "medium" ? "modebadge-medium" : "modebadge-hard";

    function drawerBtn(id, ic, label) {
      const active = ui.drawer === id;
      return '<button type="button" class="btn btn-sm ' + (active ? "btn-cyan" : "btn-outline") + '" data-act="drawer" data-drawer="' + id + '" aria-pressed="' + active + '" aria-label="' + esc(label) + '">' +
        icon(ic, "ic ic-sm") + '<span class="lbl lbl-md">' + label + "</span></button>";
    }

    const specLabel = "Spec Sheet (" + (objs.length - doneCount) + " left)";
    return (
      '<header class="topbar">' +
        '<div class="topbar-inner">' +
          '<div class="brand">' + icon("drafting-compass", "ic t-cyanb") + '<span class="brand-name">THE BLUEPRINT ROOM</span>' +
            '<span class="badge ' + badgeCls + '">' + mode.toUpperCase() + "</span></div>" +
          '<div class="progress-wrap" aria-live="polite" aria-label="Progress: ' + doneCount + " of " + objs.length + " objectives, " + quizDone + " of " + quizTotal(quiz) + ' quiz questions answered">' +
            '<div class="progress"><div class="progress-bar" style="width:' + (doneCount / objs.length) * 100 + '%"></div></div>' +
            '<span class="topcount">' + doneCount + "/" + objs.length + " obj · " + quizDone + "/" + quiz.length + " quiz</span>" +
          '</div>' +
          '<div class="topbtns">' +
            drawerBtn("spec", "list-checks", specLabel) +
            drawerBtn("guide", "book-open", "Field Guide") +
            drawerBtn("quiz", "clipboard-check", "Plan Review") +
            drawerBtn("handover", "hand", "Handover") +
            '<button type="button" class="btn btn-sm btn-outline btn-reset" data-act="dialog" data-dialog="reset" aria-label="Reset lab progress">' +
              icon("rotate-ccw", "ic ic-sm") + '<span class="lbl lbl-sm">Reset</span></button>' +
            '<button type="button" class="btn btn-sm btn-outline" data-act="dialog" data-dialog="mode" aria-label="Switch difficulty mode">' +
              icon("arrow-left-right", "ic ic-sm") + '<span class="lbl lbl-sm">Mode</span></button>' +
          '</div>' +
        '</div>' +
      '</header>'
    );
  }

  function quizTotal(quiz) { return quiz.length; }

  /* ============================ RACK + TABLE ================================ */

  function renderRack(state) {
    let out = '<nav class="rack" aria-label="Drawing rack"><p class="micro-label rack-label">Drawing rack</p><div class="rack-list">';
    for (const s of D.SITES) {
      const active = state.site === s.id;
      out += '<button type="button" class="rack-item ' + (active ? "rack-item-active" : "") + '" data-act="site" data-site="' + esc(s.id) + '"' + (active ? ' aria-current="true"' : "") + ' aria-label="Open drawing ' + esc(s.sheet) + ": " + esc(s.name) + '">' +
        '<span class="rack-sheet ' + (active ? "t-cyan" : "t-faint") + '">' + esc(s.sheet) + "</span>" +
        '<span class="rack-name ' + (active ? "ink" : "t-mut") + '">' + esc(s.name) + "</span></button>";
    }
    out += "</div></nav>";
    return out;
  }

  function renderTable(state, ui) {
    const mode = state.mode || "medium";
    const isAnnexBuild = state.site === "annex" && state.tool === "build";
    const g = isAnnexBuild ? S.annexGraph(state) : S.graph(state, state.site);
    const offline = isAnnexBuild ? [] : S.downHostsFor(state, state.site);
    const hideRoles = mode === "hard" && state.site === "dc";

    let blurb = g.blurb;
    if (mode === "hard" && state.site === "dc") {
      blurb = "Analytics pod — 8 servers, one border gateway, and a switch fabric the integrator never documented. Reconstruct it from evidence (H2).";
    }

    let toolHint = null;
    if (state.tool === "failure") toolHint = { ic: "zap", text: "FAILURE RIG ARMED — click devices/links on the drawing to break or restore them." };
    else if (state.tool === "build") toolHint = { ic: "hammer", text: "BUILD BOARD — click node A, then node B, to place a proposed link (dashed cyan)." };

    const legend = renderLegend(hideRoles);

    return (
      '<section class="table" aria-label="Drafting table">' +
        '<div class="table-head">' +
          "<div>" +
            '<p class="sheetcode">' + esc(g.sheet) + " · AS-BUILT / PLANNED DRAWING</p>" +
            '<h2 class="sheetname">' + esc(g.name) + "</h2>" +
            '<p class="sheetblurb">' + esc(blurb) + "</p>" +
          "</div>" +
          '<span class="badge badge-amber shrink0">SYNTHETIC DATA</span>' +
        "</div>" +
        (toolHint ? '<p class="toolhint" role="status">' + icon(toolHint.ic, "ic ic-sm") + " " + esc(toolHint.text) + "</p>" : "") +
        '<div class="canvas-frame">' + renderCanvas(g, state, ui, offline, hideRoles, state.tool === "build") + "</div>" +
        '<div class="legend" aria-label="Legend">' + legend + "</div>" +
      "</section>"
    );
  }

  function renderLegend(hideRoles) {
    let out = '<span><span class="dot" style="background:#22D3EE"></span>switch/access' + (hideRoles ? "/fabric" : "") + "</span>";
    out += '<span><span class="dot" style="background:#F59E0B"></span>router/core</span>';
    if (hideRoles) {
      out += '<span><span class="dot" style="background:#22D3EE"></span>fabric switch — role undocumented (see Evidence)</span>';
    } else {
      out += '<span><span class="dot" style="background:#34D399"></span>spine</span>';
      out += '<span><span class="dot" style="background:#2DD4BF"></span>leaf</span>';
    }
    out += '<span><span class="dot" style="background:#A78BFA"></span>cloud/site</span>';
    out += '<span><span class="dot" style="background:#FB7185"></span>failed</span>';
    out += '<span><span class="dashline"></span>proposed link</span>';
    return out;
  }

  /* ============================== TOOL DRAWER =============================== */

  function renderToolDrawer(state, ui) {
    const mode = state.mode || "medium";
    const isAnnexBuild = state.site === "annex" && state.tool === "build";
    const g = isAnnexBuild ? S.annexGraph(state) : S.graph(state, state.site);
    const hideRoles = mode === "hard" && state.site === "dc";
    const isBuildSite = state.site === "metro" || state.site === "annex";
    const tabs = g.evidenceGroups && g.evidenceGroups.length ? "tooltabs tooltabs-5" : "tooltabs";

    let out = '<div class="toolroot" data-testid="tool-drawer"><div class="' + tabs + '">';
    for (const t of TOOL_TABS) {
      const disabled = (t.id === "build" && !isBuildSite) || (t.id === "evidence" && !(g.evidenceGroups && g.evidenceGroups.length));
      const active = state.tool === t.id;
      out += '<button type="button" data-act="tool" data-tool="' + t.id + '"' + (disabled ? " disabled" : "") + ' aria-pressed="' + active + '"' +
        ' aria-label="' + t.label + ' tool' + (disabled ? " (not available on this sheet)" : "") + '"' +
        ' class="tooltab ' + (active ? "tooltab-active" : disabled ? "tooltab-off" : "") + '">' +
        icon(t.ic, "ic") + "<span>" + t.label + "</span></button>";
    }
    out += '</div><div class="toolbody" data-skey="tools">';

    if (state.tool === "inspector") out += renderInspector(state, g, hideRoles);
    else if (state.tool === "failure") out += renderFailure(state, g);
    else if (state.tool === "path") out += renderPath(state, ui, g);
    else if (state.tool === "build" && isBuildSite) out += renderBuild(state, ui, g);
    else if (state.tool === "evidence") out += renderEvidence(state, g);

    out += "</div></div>";
    return out;
  }

  function renderInspector(state, g, hideRoles) {
    const node = g.nodes.find(function (n) { return n.id === state.selNode; });
    const edge = g.edges.find(function (e) { return e.id === state.selEdge; });
    if (node) {
      const masked = hideRoles && (node.layer === "spine" || node.layer === "leaf");
      const note = masked
        ? "Fabric switch — role not documented in the as-built; see the H2 evidence in the Spec Sheet."
        : (node.note || (node.isHost ? "Endpoint device." : "Network device."));
      const degree = g.edges.filter(function (e) { return e.a === node.id || e.b === node.id; }).length;
      return '<div class="stack">' +
        '<div class="badge-row"><span class="badge badge-solid-cyan">' + esc(node.kind) + "</span>" +
        (node.layer ? '<span class="badge badge-solid-slate">' + esc(node.layer) + "</span>" : "") + "</div>" +
        '<p class="insp-label">' + esc(node.label) + "</p>" +
        (node.model ? '<p class="t-mut">' + esc(node.model) + "</p>" : "") +
        '<p class="t-sub">' + esc(note) + "</p>" +
        '<p class="t-dim mono">Degree: ' + degree + " link(s)</p>" +
        "</div>";
    }
    if (edge) {
      const a = g.nodes.find(function (n) { return n.id === edge.a; });
      const b = g.nodes.find(function (n) { return n.id === edge.b; });
      return '<div class="stack">' +
        '<div><span class="badge badge-solid-cyan">link · ' + esc(edge.media || "copper") + "</span></div>" +
        '<p class="insp-label">' + esc((a ? a.label : edge.a) + " ↔ " + (b ? b.label : edge.b)) + "</p>" +
        '<p class="t-dim mono">Bandwidth: ' + esc(edge.bw || "—") + "</p>" +
        '<p class="t-sub">' + esc(edge.note || "Standard interconnect.") + "</p>" +
        "</div>";
    }
    let grid = '<div class="pickgrid">';
    for (const n of g.nodes) {
      grid += '<button type="button" class="btn btn-outline btn-sm pickcell" data-act="node" data-id="' + esc(n.id) + '" aria-label="Inspect ' + esc(n.label) + '">' + esc(n.label) + "</button>";
    }
    grid += "</div>";
    return '<div class="stack"><p class="t-mut">Click any device or link on the drawing to inspect it. Or pick one here (keyboard-friendly):</p>' + grid + "</div>";
  }

  function renderFailure(state, g) {
    const down = S.downHostsFor(state, g.isBuild ? g.id : state.site);
    const failedList = state.failedNodes.map(function (n) { return labelOf(g, n); })
      .concat(state.failedEdges.map(function () { return "link"; }));
    const devices = g.nodes.filter(function (n) { return n.kind !== "cloud"; });
    let out = '<div class="stack">' +
      '<p class="t-mut">Rig armed. Click a device or link on the drawing — or use the buttons below — to fail/restore it. Impact = endpoints that can no longer reach the site anchor.</p>' +
      '<div class="readout" aria-live="polite">' +
      '<p class="t-mut">Failed: ' + (failedList.length === 0 ? "none" : esc(failedList.join(", "))) + "</p>" +
      '<p class="impact ' + (down.length ? "t-coral" : "t-mint") + '">' +
      (down.length === 0 ? "0 endpoints offline" : down.length + " endpoint" + (down.length === 1 ? "" : "s") + " offline: " + esc(down.map(function (h) { return labelOf(g, h); }).join(", "))) +
      "</p></div>";
    out += '<div class="stack-xs"><p class="micro-label">Devices (keyboard path)</p>';
    for (const n of devices) {
      const failed = state.failedNodes.indexOf(n.id) !== -1;
      out += '<button type="button" class="btn btn-sm btn-block rig-btn ' + (failed ? "btn-destructive" : "btn-outline") + '" data-act="rig-device" data-id="' + esc(n.id) + '" aria-pressed="' + failed + '">' +
        icon("zap", "ic ic-xs") + (failed ? "Restore " + esc(n.label) : "Fail " + esc(n.label)) + "</button>";
    }
    out += '</div><button type="button" class="btn btn-sm btn-outline btn-block" data-act="clear-failures">' + icon("trash-2", "ic ic-xs") + " Clear failures</button></div>";
    return out;
  }

  function renderPath(state, ui, g) {
    if (g.hosts.length < 2) {
      return '<div class="stack"><p class="t-mut">Trace the route between two endpoints. Runs are recorded for the spec sheet.</p>' +
        '<p class="t-amber">No endpoints on this sheet — the tester needs host devices.</p></div>';
    }
    function dd(id, ph, value) {
      return renderDropdown(id, ph, value, g.hosts.map(function (h) { return { value: h, label: labelOf(g, h) }; }), false);
    }
    const canRun = ui.pathFrom && ui.pathTo && ui.pathFrom !== ui.pathTo;
    let out = '<div class="stack">' +
      '<p class="t-mut">Trace the route between two endpoints. Runs are recorded for the spec sheet.</p>' +
      '<div class="stack-xs">' + dd("path-from", "From endpoint…", ui.pathFrom) + dd("path-to", "To endpoint…", ui.pathTo) +
      '<button type="button" class="btn btn-sm btn-cyan btn-block" data-act="path-run"' + (canRun ? "" : " disabled") + ">" + icon("route", "ic ic-xs") + " Trace path</button></div>" +
      '<div class="readout" aria-live="polite" style="min-height:48px">';
    if (ui.lastRun) {
      out += '<p class="t-mut">' + (ui.lastRun.length - 1) + " links · " + (ui.lastRun.length - 2) + ' intermediate devices</p><div class="chiprow">';
      ui.lastRun.forEach(function (id) {
        out += '<span class="chip">' + esc(labelOf(g, id)) + "</span>";
      });
      out += "</div>";
    } else {
      out += '<p class="t-dim">No trace yet.</p>';
    }
    out += "</div>";
    if (state.pathRuns.length > 0) {
      out += '<p class="t-dim mono microtext">Recorded runs: ' + state.pathRuns.length + " (spec sheet reads these)</p>";
    }
    out += "</div>";
    return out;
  }

  function renderBuild(state, ui, g) {
    if (state.site === "metro") {
      const total = g.edges.length;
      let list = "";
      if (state.metroAdded.length === 0) list = '<p class="t-dim">None yet.</p>';
      state.metroAdded.forEach(function (k) {
        const parts = k.split("|");
        list += '<div class="proposed-row"><span>' + esc(labelOf(g, parts[0]) + " ↔ " + labelOf(g, parts[1])) + "</span>" +
          '<button type="button" class="btn btn-ghost btn-remove" data-act="metro-remove" data-key="' + esc(k) + '">remove</button></div>';
      });
      return '<div class="stack">' +
        '<p class="t-sub">Construction desk: <b>click site A, then site B</b> on the drawing to propose a leased link (dashed cyan). Select a proposed link on the drawing to remove it.</p>' +
        '<div class="readout mono"><p class="ink">Links: <span class="' + (total > 9 ? "t-coral" : "t-mint") + '">' + total + "/9 budget</span></p>" +
        '<p class="t-mut">Link in hand: ' + (ui.linkFrom ? esc(labelOf(g, ui.linkFrom)) : "none — click a site") + "</p></div>" +
        '<div class="stack-xs"><p class="micro-label">Proposed links</p>' + list + "</div>" +
        '<button type="button" class="btn btn-sm btn-outline btn-block" data-act="metro-clear">' + icon("trash-2", "ic ic-xs") + " Clear proposed links</button></div>";
    }
    // annex build board
    const cores = state.annexNodes.filter(function (n) { return n.layer === "collapsed"; }).length;
    const accs = state.annexNodes.filter(function (n) { return n.layer === "access"; }).length;
    const hosts = state.annexNodes.filter(function (n) { return n.isHost; }).length;
    return '<div class="stack">' +
      '<p class="t-sub">Construction desk: place parts from the palette, then <b>click node A, then node B</b> on the drawing to link them. The v1 drawing is hidden while you build.</p>' +
      '<div class="stack-xs"><p class="micro-label">Parts palette</p>' +
      '<button type="button" class="btn btn-sm btn-outline btn-block btn-left" data-act="annex-place" data-kind="collapsed"' + (cores >= 2 ? " disabled" : "") + ">+ Collapsed-core switch (" + cores + "/2)</button>" +
      '<button type="button" class="btn btn-sm btn-outline btn-block btn-left" data-act="annex-place" data-kind="access"' + (accs >= 2 ? " disabled" : "") + ">+ Access switch (" + accs + "/2)</button>" +
      '<button type="button" class="btn btn-sm btn-outline btn-block btn-left" data-act="annex-place" data-kind="host"' + (hosts >= 4 ? " disabled" : "") + ">+ Host (" + hosts + "/4)</button>" +
      "</div>" +
      '<div class="readout mono microtext" aria-live="polite">' +
      '<p class="t-mut">Link in hand: ' + (ui.linkFrom ? esc(labelOf(g, ui.linkFrom)) : "none — click a node") + "</p>" +
      '<p class="t-mut">Links placed: ' + state.annexEdges.length + "</p></div>" +
      '<div class="grid2">' +
      '<button type="button" class="btn btn-sm btn-outline" data-act="annex-remove-node"' + (state.selNode ? "" : " disabled") + ">Remove selected node</button>" +
      '<button type="button" class="btn btn-sm btn-outline" data-act="annex-remove-edge"' + (state.selEdge ? "" : " disabled") + ">Remove selected link</button>" +
      "</div>" +
      '<button type="button" class="btn btn-sm btn-outline btn-block" data-act="annex-clear">' + icon("trash-2", "ic ic-xs") + " Clear build</button></div>";
  }

  function renderEvidence(state, g) {
    const groups = S.evidenceGroups(state, state.site);
    if (!groups.length) return '<p class="t-dim">No evidence file attached to this sheet.</p>';
    let out = '<div class="stack" aria-label="Evidence file">' +
      '<p class="micro-label mono">Evidence file · ' + esc(g.sheet) + " · synthetic</p>";
    groups.forEach(function (ev, gi) {
      if (groups.length > 1 && ev.label) out += '<p class="ev-group">' + esc(ev.label) + "</p>";
      if (ev.tickets) {
        out += '<div class="stack-xs"><p class="ev-sec">Helpdesk tickets</p>';
        for (const t of ev.tickets) {
          out += '<div class="ticket"><p class="mono microtext t-dim">' + esc(t.id) + " · " + esc(t.from) + " · " + esc(t.time) + "</p>" +
            '<p class="t-sub">' + esc(t.text) + "</p></div>";
        }
        out += "</div>";
      }
      if (ev.monitoring) {
        out += '<div class="stack-xs"><p class="ev-sec">Monitoring</p>';
        for (const m of ev.monitoring) {
          const fc = m.flag === "down" ? "t-coral" : m.flag === "warn" ? "t-amber" : "t-mint";
          out += '<div class="monrow"><span class="t-mut">' + esc(m.label) + '</span><span class="mono microtext ' + fc + '">' + esc(m.value) + "</span></div>";
        }
        out += "</div>";
      }
      if (ev.traces) {
        out += '<div class="stack-xs"><p class="ev-sec">Traceroutes</p>';
        ev.traces.forEach(function (t) {
          out += '<p class="trace mono microtext t-sub">' + esc(t) + "</p>";
        });
        out += "</div>";
      }
      if (ev.stats) {
        out += '<div class="stack-xs"><p class="ev-sec">Stats</p>';
        for (const st of ev.stats) {
          out += '<p class="t-sub"><b class="t-mut">' + esc(st.label) + ':</b> <span class="mono microtext">' + esc(st.value) + "</span></p>";
        }
        out += "</div>";
      }
    });
    out += "</div>";
    return out;
  }

  /* ============================ SELECT DROPDOWN ============================= */

  function renderDropdown(id, placeholder, value, options, disabled) {
    const open = !disabled && window.__ui.dd === id;
    const sel = options.find(function (o) { return o.value === value; });
    const widthCls = id.indexOf("path") === 0 ? "dd-trigger dd-trigger-sm" : "dd-trigger";
    let out = '<div class="dd" data-dd="' + esc(id) + '">' +
      '<button type="button" id="ddbtn-' + esc(id) + '" role="combobox" aria-expanded="' + open + '" aria-haspopup="listbox" aria-controls="ddlist-' + esc(id) + '"' +
      ' class="' + widthCls + '"' + (disabled ? " disabled" : "") + ' data-act="dd-toggle" data-dd="' + esc(id) + '" data-fkey="dd:' + esc(id) + '">' +
      '<span class="' + (sel ? "" : "dd-ph") + '">' + esc(sel ? sel.label : placeholder) + "</span>" + icon("chevron-down", "ic ic-xs dd-chev") + "</button>";
    if (open) {
      out += '<div class="dd-pop" role="listbox" id="ddlist-' + esc(id) + '" data-ddpop="' + esc(id) + '">';
      options.forEach(function (o, i) {
        const selected = o.value === value;
        const active = i === (window.__ui.ddActive || 0);
        out += '<div role="option" aria-selected="' + selected + '"' + (active ? ' class="dd-opt dd-opt-active"' : ' class="dd-opt"') +
          ' data-act="dd-pick" data-dd="' + esc(id) + '" data-val="' + esc(o.value) + '">' +
          "<span>" + esc(o.label) + "</span>" + (selected ? icon("check", "ic ic-xs dd-check") : "") + "</div>";
      });
      out += "</div>";
    }
    out += "</div>";
    return out;
  }

  /* =============================== SPEC SHEET =============================== */

  function renderSpecSheet(state, ui) {
    const mode = state.mode || "medium";
    const objectives = O.objectivesFor(mode);
    const doneCount = objectives.filter(function (o) { return state.obj[o.id] && state.obj[o.id].done; }).length;

    let out = '<div class="spec" data-testid="spec-sheet">';
    out += '<div class="spec-head"><div class="spec-head-row">' +
      '<p class="spec-title">' + icon("target", "ic t-cyanb") + " Spec Sheet — " + doneCount + "/" + objectives.length + " objectives</p>" +
      '<span class="badge badge-outline-dim mono microtext">' + (mode === "medium" ? "MEDIUM · guided" : "HARD · strict") + "</span></div>" +
      '<div class="progress" aria-label="Objectives completed: ' + doneCount + " of " + objectives.length + '"><div class="progress-bar" style="width:' + (doneCount / objectives.length) * 100 + '%"></div></div></div>';

    objectives.forEach(function (obj, i) {
      const prog = state.obj[obj.id] || {};
      const done = !!prog.done;
      const outcome = ui.outcomes[obj.id];
      const hintsUsed = prog.hints || 0;
      const hints = obj.hints || [];
      const maxHints = mode === "medium" ? 3 : 1;
      const p = PILLAR_STYLE[obj.pillar];

      out += '<article class="obj-card ' + (done ? "obj-done" : "") + '" aria-label="Objective ' + esc(obj.id) + ": " + esc(obj.title) + '">';
      out += '<header class="obj-head"><div class="obj-tags">' +
        '<span class="objnum mono">' + String(i + 1).padStart(2, "0") + "</span>" +
        '<span class="badge ' + p.cls + '">' + p.label + "</span>" +
        '<span class="objid mono">' + esc(obj.id) + " · " + esc(obj.anchor) + "</span></div>" +
        (done ? icon("check-circle-2", "ic ic-lg t-mint") : icon("circle", "ic ic-lg t-faint")) + "</header>";

      out += '<h3 class="obj-title ' + (done ? "t-mint" : "ink") + '">' + esc(obj.title) + "</h3>";
      out += '<p class="obj-detail">' + esc(obj.detail) + "</p>";

      if (obj.site) {
        const isBuild = obj.site.indexOf("build-") === 0;
        out += '<button type="button" class="btn btn-ghost btn-goto" data-act="goto" data-obj="' + esc(obj.id) + '">' + icon("map-pin", "ic ic-xs") + " Go to " + (isBuild ? "the build board" : "this drawing") + "</button>";
      }

      if (obj.fields.length > 0) {
        out += '<div class="stack obj-fields">';
        for (const f of obj.fields) out += renderField(state, ui, obj, f, done);
        if (done) out += '<p class="locked-note mono">Answers locked — objective validated.</p>';
        out += "</div>";
      }

      out += '<div class="obj-actions">';
      if (!done) {
        out += '<button type="button" class="btn btn-sm btn-amber btn-strong" data-act="check" data-obj="' + esc(obj.id) + '" aria-label="Check results for objective ' + esc(obj.id) + '">Check results</button>';
      } else {
        out += '<span class="badge badge-done">✓ Completed — results locked</span>';
      }
      if (hints.length > 0 && hintsUsed < maxHints && !done) {
        out += '<button type="button" class="btn btn-sm btn-outline" data-act="hint" data-obj="' + esc(obj.id) + '" aria-label="Reveal hint ' + (hintsUsed + 1) + " for objective " + esc(obj.id) + '">' +
          icon("lightbulb", "ic ic-xs t-amberb") + (mode === "medium" ? "Hint " + (hintsUsed + 1) + "/3" : "Use the nudge (−score)") + "</button>";
      }
      if (prog && prog.attempts > 0) {
        out += '<span class="t-dim mono microtext">' + prog.attempts + " check" + (prog.attempts === 1 ? "" : "s") +
          (done && prog.firstTry ? " · first try ✓" : "") +
          (hintsUsed > 0 ? " · " + hintsUsed + " hint" + (hintsUsed === 1 ? "" : "s") : "") + "</span>";
      }
      out += "</div>";

      if (hintsUsed > 0 && hints.length > 0) {
        out += '<div class="hintbox"><p class="micro-label t-amber">Hint ' + Math.min(hintsUsed, maxHints) + "/" + maxHints + "</p>" +
          '<p class="t-amber">' + esc(hints[Math.min(hintsUsed, maxHints) - 1]) + "</p></div>";
      }

      if (outcome) {
        out += '<div class="outcome ' + (outcome.pass ? "outcome-pass" : "outcome-fail") + '" role="status" aria-live="polite">' +
          '<p class="micro-label ' + (outcome.pass ? "t-mint" : "t-coral") + '">' + (outcome.pass ? "✓ Objective complete" : "✗ Not yet — keep going") + "</p>" +
          '<p class="t-sub">' + esc(outcome.text) + "</p></div>";
      }
      out += "</article>";
    });
    out += "</div>";
    return out;
  }

  function renderField(state, ui, obj, f, done) {
    const value = (state.answers[obj.id] || {})[f.key] || "";
    if (f.type === "select") {
      return '<div class="field"><label class="field-label" for="ddbtn-f:' + esc(obj.id) + ":" + esc(f.key) + '">' + esc(f.label) + "</label>" +
        renderDropdown("f:" + obj.id + ":" + f.key, "Choose…", value, f.options || [], done) + "</div>";
    }
    if (f.type === "number") {
      return '<div class="field"><label class="field-label" for="in:' + esc(obj.id) + ":" + esc(f.key) + '">' + esc(f.label) + "</label>" +
        '<input id="in:' + esc(obj.id) + ":" + esc(f.key) + '" type="number" inputmode="numeric" class="num-input mono" value="' + esc(value) + '" placeholder="0" aria-label="' + esc(f.label) + '"' + (done ? " disabled" : "") +
        ' data-act="ans-input" data-obj="' + esc(obj.id) + '" data-key="' + esc(f.key) + '" data-fkey="in:' + esc(obj.id) + ":" + esc(f.key) + '" /></div>';
    }
    // multi
    let out = '<div class="field"><p class="field-label">' + esc(f.label) + "</p><div class=\"stack-xs\">";
    const selectedVals = value.split(",").filter(Boolean);
    for (const o of f.options || []) {
      const selected = selectedVals.indexOf(o.value) !== -1;
      out += '<button type="button" role="checkbox" aria-checked="' + selected + '" class="opt-row' + (done ? " opt-disabled" : "") + '" aria-label="' + esc(o.label) + '"' + (done ? " disabled" : "") +
        ' data-act="multi" data-obj="' + esc(obj.id) + '" data-key="' + esc(f.key) + '" data-val="' + esc(o.value) + '">' +
        '<span class="cbx' + (selected ? " cbx-on" : "") + '">' + (selected ? icon("check", "ic ic-xs cbx-ic") : "") + "</span>" +
        '<span class="opt-text">' + esc(o.label) + "</span></button>";
    }
    out += "</div></div>";
    return out;
  }

  /* =============================== FIELD GUIDE ============================== */

  function renderFieldGuide(state, ui) {
    let out = '<div class="stack" data-testid="field-guide">' +
      '<p class="t-mut guide-intro">' + icon("book-open", "ic t-cyanb") + "<span><b class=\"ink\">Knowledge Core.</b> The seven N10-009 topologies — what they are, how they work, where they win and lose. Deployments listed are generalized industry practice.</span></p>" +
      '<div class="compass-box">' +
      '<p class="micro-label t-cyanb">' + icon("compass", "ic ic-xs") + " Traffic compass</p>" +
      '<p class="t-sub"><b>East-west:</b> ' + esc(D.TRAFFIC_NOTE.eastWest.replace("EAST-WEST = ", "")) + "</p>" +
      '<p class="t-sub"><b>North-south:</b> ' + esc(D.TRAFFIC_NOTE.northSouth.replace("NORTH-SOUTH = ", "")) + "</p>" +
      "</div>";

    for (const card of D.GUIDE) {
      const isOpen = ui.guideOpen === card.id;
      out += '<article class="guide-card">' +
        '<button type="button" class="guide-head" data-act="guide" data-guide="' + esc(card.id) + '" aria-expanded="' + isOpen + '" aria-controls="guide-' + esc(card.id) + '">' +
        '<span class="guide-head-l"><span class="dot" style="background:' + card.accent + '"></span><span class="guide-name">' + esc(card.name) + "</span></span>" +
        icon("chevron-down", "ic chev" + (isOpen ? " chev-open" : "")) + "</button>";
      if (isOpen) {
        out += '<div class="guide-body" id="guide-' + esc(card.id) + '">' +
          '<p class="t-cyan">' + esc(card.tagline) + "</p>" +
          '<p class="t-sub">' + esc(card.how) + "</p>" +
          '<div class="pc-grid">' +
          '<div class="pc-box pc-pros"><p class="micro-label t-mint">Strengths</p><ul class="pc-list">' +
          card.pros.map(function (p2) { return "<li>+ " + esc(p2) + "</li>"; }).join("") + "</ul></div>" +
          '<div class="pc-box pc-cons"><p class="micro-label t-coral">Costs / risks</p><ul class="pc-list">' +
          card.cons.map(function (c) { return "<li>− " + esc(c) + "</li>"; }).join("") + "</ul></div>" +
          "</div>" +
          '<p class="t-mut"><b class="t-sub">Deployed for:</b> ' + esc(card.where) + "</p>" +
          '<div class="tipbox"><p class="micro-label t-amber">Exam tip</p><p class="t-amber">' + esc(card.tip) + "</p></div>" +
          "</div>";
      }
      out += "</article>";
    }

    out += '<div class="glossbox"><p class="ink" style="font-weight:600;margin-bottom:8px">Glossary — 15 terms</p><dl class="glosslist">';
    for (const g of D.GLOSSARY) {
      out += "<div><dt class=\"glossterm\">" + esc(g.term) + ": </dt><dd class=\"glossdef\">" + esc(g.def) + "</dd></div>";
    }
    out += "</dl></div>";

    out += '<div class="anchorbox"><p class="ink" style="font-weight:600">Exam anchor</p>' +
      '<p class="t-sub">CompTIA Network+ <b>N10-009</b> (exam V9) · <b>Domain 1.0 Networking Concepts — 23%</b> of the exam. The objective bullet: “Network topologies: mesh, hybrid, star/hub and spoke, spine and leaf, point-to-point, three-tier, and collapsed core.” Everything in this lab maps to that bullet.</p>' +
      '<div class="chiprow">' +
      ["mesh 23%·D1", "hybrid", "star", "spine-leaf", "p2p", "three-tier", "collapsed core"].map(function (t) {
        return '<span class="badge badge-outline-dim mono microtext">' + esc(t) + "</span>";
      }).join("") +
      "</div></div>";

    out += "</div>";
    return out;
  }

  /* =============================== PLAN REVIEW ============================== */

  function optionStyle(locked, selected, isRight) {
    if (!locked) {
      return selected ? "qopt qopt-sel" : "qopt";
    }
    if (selected && isRight) return "qopt qopt-right";
    if (selected && !isRight) return "qopt qopt-wrong";
    return "qopt qopt-neutral";
  }

  function renderPlanReview(state, ui) {
    const mode = state.mode || "medium";
    const quiz = Q.quizFor(mode);
    const score = S.scoreQuiz(state, quiz);
    const filed = state.quizSubmitted;
    const checkedCount = quiz.filter(function (q) { return state.quizChecked[q.id]; }).length;
    const currentIdx = Math.min(state.quizIndex, quiz.length - 1);

    let out = '<div class="stack" data-testid="plan-review">' +
      '<div class="quiz-head"><p class="spec-title">' + icon("clipboard-check", "ic t-cyanb") + " Plan Review — " + (mode === "medium" ? "7 concept questions" : "8 scenario items") + "</p>" +
      (filed ? '<span class="badge ' + (score.correct === score.total ? "badge-mint-solid" : "badge-amber-solid") + ' mono">' + score.correct + "/" + score.total + "</span>" : "") +
      "</div>";

    out += '<p class="t-mut">' + (mode === "medium"
      ? "One question at a time: pick an answer, CHECK it, read the explanation — checked answers lock and teach."
      : "Scenario items, one at a time: apply, don't recall. CHECK locks your answer; the justification is the lesson.") + "</p>";

    quiz.forEach(function (q, i) {
      const checked = !!state.quizChecked[q.id];
      const isActive = i === state.quizIndex && !filed;
      const locked = checked || filed;
      const isFuture = i > state.quizIndex && !filed;
      const got = state.quizAnswers[q.id] || [];
      const ok = Q.isCorrect(q, got);

      if (isFuture) {
        out += '<div class="qfuture" aria-label="Question ' + (i + 1) + ' locked"><p class="t-dim">' + icon("lock", "ic ic-sm") + " Question " + (i + 1) + " — finish the current question to unlock.</p></div>";
        return;
      }

      out += '<div data-qidx="' + i + '"><article class="qcard ' +
        (locked ? (ok ? "qcard-ok" : checked ? "qcard-wrong" : "qcard") : "qcard") + '">' +
        '<header class="qhead"><span class="objnum mono">' + "Q" + (i + 1) + "</span>" +
        '<div class="qprompt-wrap"><p class="qprompt">' + esc(q.prompt) + "</p>" +
        (q.scenario ? '<p class="qscenario">' + esc(q.scenario) + "</p>" : "") + "</div>" +
        (locked ? icon("lock", "ic ic-sm t-dim qlock") : "") +
        "</header>";

      out += '<div class="stack-xs" role="radiogroup" aria-label="' + esc(q.prompt) + '">';
      for (const o of q.options) {
        const selected = got.indexOf(o.value) !== -1;
        const isRight = q.correct.indexOf(o.value) !== -1;
        out += '<button type="button" role="checkbox" aria-checked="' + selected + '" aria-label="' + esc(o.label) + '"' +
          (isActive && !locked ? "" : " disabled") +
          ' class="' + optionStyle(locked, selected, isRight) + (isActive && !locked ? " qopt-live" : "") + '"' +
          ' data-act="quiz-toggle" data-qid="' + esc(q.id) + '" data-val="' + esc(o.value) + '" data-multi="' + (q.type === "multi") + '">' +
          '<span class="cbx' + (selected ? " cbx-on" : "") + '">' + (selected ? icon("check", "ic ic-xs cbx-ic") : "") + "</span>" +
          '<span class="opt-text">' + esc(o.label) + "</span>";
        if (locked && selected && isRight) out += '<span class="qmark t-mint">' + icon("check-circle-2", "ic ic-xs") + " Your answer — correct</span>";
        if (locked && selected && !isRight) out += '<span class="qmark t-coral">' + icon("x-circle", "ic ic-xs") + " Your answer — incorrect</span>";
        out += "</button>";
      }
      out += "</div>";

      if (locked) {
        out += '<div class="whybox ' + (ok ? "whybox-ok" : "whybox-teach") + '" role="status" aria-live="polite">' +
          '<p class="micro-label why-head">' + icon("lightbulb", "ic ic-xs") + " " + (ok ? "Correct — why it's right" : "Why this one teaches") + "</p>" +
          '<p class="t-sub">' + esc(q.why) + "</p></div>";
      }

      if (isActive && !locked) {
        out += '<div class="qactions"><button type="button" class="btn btn-sm btn-amber btn-strong"' + (got.length === 0 ? " disabled" : "") +
          ' data-act="quiz-check" data-qid="' + esc(q.id) + '" aria-label="Check answer for question ' + (i + 1) + '">Check answer</button>' +
          (got.length === 0 ? '<span class="t-dim microtext">Select an answer to enable the check.</span>' : "") + "</div>";
      }

      if (isActive && checked) {
        out += '<div><button type="button" class="btn btn-sm btn-cyan btn-block btn-strong" data-act="quiz-next" aria-label="' +
          (i + 1 < quiz.length ? "Move to question " + (i + 2) : "File the Plan Review") + '">' +
          (i + 1 < quiz.length ? "Next question" : "File Plan Review") + " " + icon("arrow-right", "ic ic-xs") + "</button></div>";
      }
      out += "</article></div>";
    });

    if (!filed) {
      out += '<div class="stack-xs"><div class="progress" aria-label="Questions checked: ' + checkedCount + " of " + quiz.length + '"><div class="progress-bar" style="width:' + (checkedCount / quiz.length) * 100 + '%"></div></div>' +
        '<p class="t-dim mono microtext" aria-live="polite">' + checkedCount + "/" + quiz.length + " checked · answers lock when checked</p></div>";
    }

    if (filed) {
      out += '<div class="filedbox" aria-live="polite"><p class="t-mint" style="font-weight:600">Plan Review filed: ' + score.correct + "/" + score.total + " correct.</p>" +
        '<p class="t-sub">' + (score.correct === score.total
          ? "Perfect score — the exam-style reasoning is in place."
          : "Read the explanations above once more; the reasoning matters more than the score. Complete the spec sheet and sign off at the Handover.") + "</p></div>";
    }
    out += "</div>";
    return out;
  }

  /* ================================ HANDOVER ================================ */

  function renderHandover(state) {
    const mode = state.mode || "medium";
    const objs = O.objectivesFor(mode);
    const doneCount = objs.filter(function (o) { return state.obj[o.id] && state.obj[o.id].done; }).length;
    const eligible = S.allDone(state, objs) && state.quizSubmitted;

    let out = '<div class="stack" data-testid="handover">' +
      '<div class="hand-head"><p class="spec-title">' + icon("clipboard-list", "ic t-cyanb") + " Site Handover — field notes &amp; synthesis</p>" +
      '<span class="badge badge-outline-dim mono microtext">progress ' + doneCount + "/" + objs.length + " objectives</span></div>";

    out += '<section class="panel-box"><h3 class="sec-title t-cyan">' + icon("route", "ic") + " Detection &amp; diagnosis opportunities</h3>" +
      '<div class="tablewrap"><table class="dtable"><thead><tr>' +
      '<th>Observation</th><th>What it reads as</th><th>Sheet</th></tr></thead><tbody>';
    for (const d of D.HANDOVER.diagnose) {
      out += "<tr><td>" + esc(d.what) + '</td><td class="t-sub">' + esc(d.reads) + '</td><td class="mono microtext t-dim">' + esc(d.source) + "</td></tr>";
    }
    out += "</tbody></table></div></section>";

    out += '<section class="panel-box"><h3 class="sec-title t-amber">' + icon("shield-check", "ic") + " Mitigation / design recommendations</h3><ul class=\"plainlist\">";
    for (const a of D.HANDOVER.actions) {
      out += '<li><span class="mono microtext t-amberb rid">' + esc(a.id) + "</span><span>" + esc(a.text) + "</span></li>";
    }
    out += "</ul></section>";

    out += '<section class="panel-box"><h3 class="sec-title t-sky">' + icon("graduation-cap", "ic") + " Exam-day takeaways (N10-009)</h3><ul class=\"disclist\">";
    D.HANDOVER.exam.forEach(function (e) { out += "<li>" + esc(e) + "</li>"; });
    out += "</ul></section>";

    out += '<section class="panel-box"><h3 class="sec-title t-purple">' + icon("swords", "ic") + " Think like an attacker (defensive insight)</h3><ul class=\"disclist\">";
    D.HANDOVER.attacker.forEach(function (e) { out += "<li>" + esc(e) + "</li>"; });
    out += "</ul></section>";

    out += '<section class="panel-box"><h3 class="sec-title ink">Official references</h3><ul class="linklist">';
    for (const l of D.LINKS) {
      out += '<li><a href="' + esc(l.url) + '" target="_blank" rel="noopener noreferrer" class="extlink">' + esc(l.label) + " " + icon("external-link", "ic ic-xs") + "</a></li>";
    }
    out += '</ul><p class="t-dim microtext">Opens in a new tab. All lab data is synthetic training material.</p></section>';

    out += '<section class="signoff ' + (eligible ? "signoff-ready" : "") + '">' +
      '<p class="t-sub">' + (eligible
        ? "Every objective checked and the Plan Review is filed. Time to sign off the engagement."
        : "Sign-off unlocks when all " + objs.length + " objectives are checked AND the Plan Review is submitted. Remaining objectives: " + (objs.length - doneCount) + (state.quizSubmitted ? "" : " + Plan Review") + ".") + "</p>" +
      '<button type="button" class="btn btn-mint btn-block btn-strong"' + (eligible ? "" : " disabled") + ' data-act="signoff">Sign off &amp; view score</button>' +
      "</section>";

    out += "</div>";
    return out;
  }

  /* ============================ COMPLETION MODAL ============================ */

  function focusAreas(state, objs, quiz) {
    const areas = [];
    for (const q of quiz) {
      const got = state.quizAnswers[q.id] || [];
      if ((state.quizChecked[q.id] || state.quizSubmitted) && got.length > 0 && !Q.isCorrect(q, got)) {
        areas.push({ title: q.topic, action: "Re-read the " + q.topic + " card in the Field Guide, then re-answer Plan Review from memory." });
      }
    }
    for (const o of objs) {
      const p = state.obj[o.id];
      if (p && p.attempts > 1) {
        areas.push({ title: o.title, action: "Took " + p.attempts + " checks — redo this objective without hints until the first check passes." });
      } else if (p && p.hints > 0) {
        areas.push({ title: o.title, action: "Needed a hint — rebuild it from scratch with no hints to prove the reasoning sticks." });
      }
    }
    const weakest = PILLARS.map(function (p) {
      const mine = objs.filter(function (o) { return o.pillar === p.id; });
      return { p: p, ratio: mine.length ? mine.filter(function (o) { return state.obj[o.id] && state.obj[o.id].firstTry; }).length / mine.length : 1 };
    }).sort(function (a, b) { return a.ratio - b.ratio; })[0];
    if (weakest && weakest.ratio < 1 && areas.length < 4) {
      areas.push({
        title: weakest.p.label + " skills",
        action: "Weakest pillar this run (" + Math.round(weakest.ratio * 100) + "% first-try) — review its objectives in the Spec Sheet and the matching Handover notes.",
      });
    }
    return areas.slice(0, 6);
  }

  function renderCompletionModal(state, ui) {
    const mode = state.mode || "medium";
    const objs = O.objectivesFor(mode);
    const quiz = Q.quizFor(mode);
    const r = S.computeStars(state, objs, quiz);

    let stars = "";
    for (let i = 1; i <= 5; i++) {
      stars += '<span class="star' + (i <= r.stars ? " star-on" : "") + '">' + icon("star", "ic ic-xl") + "</span>";
    }

    const areas = focusAreas(state, objs, quiz);
    let focusHtml = '<div class="focusbox" data-testid="focus-areas">' +
      '<p class="micro-label t-amber">' + icon("crosshair", "ic ic-sm") + " Focus areas — push harder here</p>";
    if (areas.length === 0) {
      focusHtml += '<p class="t-sub">None flagged — every objective passed first-try with no hints and the Plan Review is clean. Extend the streak: re-run the other difficulty.</p>';
    } else {
      focusHtml += '<ul class="disclist">';
      areas.forEach(function (a) {
        focusHtml += '<li><b class="t-amber">' + esc(a.title) + ":</b> " + esc(a.action) + "</li>";
      });
      focusHtml += "</ul>";
    }
    focusHtml += "</div>";

    let pillars = '<div class="pillar-grid">';
    for (const p of PILLARS) {
      const mine = objs.filter(function (o) { return o.pillar === p.id; });
      const d = mine.filter(function (o) { return state.obj[o.id] && state.obj[o.id].done; }).length;
      pillars += '<div class="pillarbox"><p class="micro-label t-dim">' + p.label + "</p>" +
        '<p class="mono pillarcount ' + (d === mine.length ? "t-mint" : "t-amber") + '">' + d + "/" + mine.length + "</p></div>";
    }
    pillars += "</div>";

    return (
      '<div class="overlay" data-act="overlay-close" data-overlay="completion">' +
        '<div class="dialog dialog-completion" role="dialog" aria-modal="true" aria-labelledby="cm-title" data-testid="completion-modal">' +
          '<button type="button" class="dlg-x" data-slot="dialog-close" data-act="completion-close" aria-label="Close">' + icon("x", "ic") + "</button>" +
          '<div class="dlg-head"><h2 class="dlg-title" id="cm-title">' + icon("clipboard-check", "ic t-mint") + " Engagement signed off</h2>" +
          '<p class="dlg-desc">Trellis Topology Modernization Project — ' + (mode === "medium" ? "MEDIUM (guided)" : "HARD (strict)") + " run. All data synthetic.</p></div>" +
          '<div class="stack">' +
            '<div class="star-row" aria-label="Rating: ' + r.stars + " of 5 stars" + '">' + stars + "</div>" +
            '<p class="center ink" style="font-weight:600">' + r.stars + "/5 ★ · field readiness score</p>" +
            '<div class="readout mono microtext">' +
              "<p>Objectives: " + r.done + "/" + r.total + " completed · " + r.firstTry + " first-try clean (" + Math.round(r.objRatio * 100) + "%)</p>" +
              "<p>Plan Review: " + r.quiz.correct + "/" + r.quiz.total + " (" + Math.round(r.quizRatio * 100) + "%)</p>" +
              "<p>Hints used: " + r.hints + " (−" + Math.round(r.penalty * 100) + " pts)</p>" +
              '<p class="t-cyan">Formula: 55% first-try + 15% completion + 30% quiz − hint penalty</p>' +
            "</div>" +
            pillars +
            focusHtml +
            '<div class="nextbox"><p class="micro-label t-cyan">What next</p><ul class="disclist">' +
              (r.stars < 5 ? "<li>Re-run the other difficulty for a deeper stretch (" + (mode === "medium" ? "Hard" : "Medium") + " mode, fresh run).</li>" : "") +
              "<li>Rebuild any objective without hints until the reasoning is automatic.</li>" +
              "<li>Continue N10-009 Domain 1.0 (network types → cloud → addressing), then Domain 2.0 implementation topics that live inside these shapes.</li>" +
            "</ul></div>" +
            '<div class="grid2">' +
              '<button type="button" class="btn btn-outline" data-act="completion-review">Review handover</button>' +
              '<button type="button" class="btn btn-amber btn-strong" data-act="completion-fresh">' + icon("rotate-ccw", "ic ic-sm") + " Start fresh</button>" +
            "</div>" +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }

  /* ================================ DIALOGS ================================= */

  function renderResetDialog(mode) {
    return (
      '<div class="overlay" data-act="overlay-close" data-overlay="reset">' +
        '<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dlg-reset-title">' +
          '<button type="button" class="dlg-x" data-slot="dialog-close" data-act="close-dialog" aria-label="Close">' + icon("x", "ic") + "</button>" +
          '<div class="dlg-head"><h2 class="dlg-title" id="dlg-reset-title">Reset the lab?</h2>' +
          '<p class="dlg-desc">This wipes saved progress (objectives, quiz, builds, failures) and returns to mode selection. This cannot be undone.</p></div>' +
          '<div class="dlg-actions">' +
            '<button type="button" class="btn btn-outline" data-act="close-dialog">Keep working</button>' +
            '<button type="button" class="btn btn-coral btn-strong" data-act="reset-confirm">Reset everything</button>' +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }

  function renderModeDialog(mode) {
    const other = mode === "medium" ? "hard" : "medium";
    return (
      '<div class="overlay" data-act="overlay-close" data-overlay="mode">' +
        '<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dlg-mode-title">' +
          '<button type="button" class="dlg-x" data-slot="dialog-close" data-act="close-dialog" aria-label="Close">' + icon("x", "ic") + "</button>" +
          '<div class="dlg-head"><h2 class="dlg-title" id="dlg-mode-title">Switch difficulty?</h2>' +
          '<p class="dlg-desc">Switching starts a FRESH run in the other mode — current progress in this run is cleared. Same environment, different bar.</p></div>' +
          '<div class="dlg-actions">' +
            '<button type="button" class="btn btn-outline" data-act="close-dialog">Stay in ' + esc(mode) + "</button>" +
            '<button type="button" class="btn btn-cyan btn-strong" data-act="mode-switch" data-mode="' + other + '">Start ' + (mode === "medium" ? "Hard" : "Medium") + " run</button>" +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }

  /* ================================= SHEETS ================================= */

  function renderSheet(id, title, desc, body, skey, extraCls) {
    return (
      '<div class="sheet ' + (extraCls || "") + '" role="dialog" aria-modal="false" aria-label="' + esc(title) + '">' +
        '<button type="button" class="dlg-x sheet-x" data-slot="sheet-close" data-act="drawer" data-drawer="' + esc(id) + '" aria-label="Close">' + icon("x", "ic") + "</button>" +
        '<div class="sr-only"><p>' + esc(title) + "</p><p>" + esc(desc) + "</p></div>" +
        '<div class="sheet-body" data-skey="' + esc(skey) + '">' + body + "</div>" +
      "</div>"
    );
  }

  /* ================================== ROOT ================================== */

  function render(state, ui) {
    if (!state.mode) return renderModeSelect(state);

    const mode = state.mode;
    const isAnnexBuild = state.site === "annex" && state.tool === "build";
    const g = isAnnexBuild ? S.annexGraph(state) : S.graph(state, state.site);

    let out = '<div class="screen" data-testid="blueprint-room">';
    out += renderTopbar(state, ui);
    out += '<main class="room-grid' + (ui.drawer === "spec" ? " room-grid-spec" : "") + '">';
    out += renderRack(state);
    out += renderTable(state, ui);
    out += '<aside class="tools" aria-label="Tool drawer">' + renderToolDrawer(state, ui) + "</aside>";
    if (ui.drawer === "spec") {
      out += '<aside class="spec-inline" aria-label="Spec sheet panel" data-skey="spec-inline">' +
        '<div class="spec-inline-head"><span class="micro-label mono">SPEC SHEET</span>' +
        '<button type="button" class="btn btn-ghost btn-sm btn-close-inline" data-act="drawer" data-drawer="spec" aria-label="Close spec sheet panel">close</button></div>' +
        renderSpecSheet(state, ui) + "</aside>";
    }
    out += "</main>";

    if (ui.drawer === "spec") out += renderSheet("spec", "Spec Sheet", "Objectives tracker with checks, hints and feedback", renderSpecSheet(state, ui), "spec-sheet", "sheet-spec");
    if (ui.drawer === "guide") out += renderSheet("guide", "Field Guide", "Knowledge core: topology cards, traffic compass, glossary", renderFieldGuide(state, ui), "sheet-guide", "sheet-guide");
    if (ui.drawer === "quiz") out += renderSheet("quiz", "Plan Review", "Knowledge check quiz with explanations", renderPlanReview(state, ui), "sheet-quiz", "sheet-quiz");
    if (ui.drawer === "handover") out += renderSheet("handover", "Site Handover", "Debrief and field notes synthesis", renderHandover(state), "sheet-handover", "sheet-handover");

    if (ui.dialog === "reset") out += renderResetDialog(mode);
    if (ui.dialog === "mode") out += renderModeDialog(mode);
    if (ui.completionOpen) out += renderCompletionModal(state, ui);

    out += "</div>";
    return out;
  }

  return { render: render, esc: esc, labelOf: labelOf };
})();
