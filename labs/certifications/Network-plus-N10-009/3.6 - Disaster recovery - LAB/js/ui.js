// Operation THAWLINE — static port: shared UI components + page chrome.
// Translation of src/components/lab/bits.tsx, exercise-strip.tsx,
// objectives-clipboard.tsx, board-wall.tsx and page.tsx chrome into template
// functions. All rendering is plain string templates + delegated events.
//
// Depends on globals: LabIcons, LabData, LabObjectives, LabStore.

var LabUI = (function () {
  "use strict";

  /* ---------------- tiny helpers ---------------- */

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function icon(name, cls) {
    return LabIcons.icon(name, cls);
  }

  function boardTitle(id) {
    const b = LabData.BOARD_META.find((x) => x.id === id);
    return b ? b.title : id;
  }

  /* ---------------- shared bits (bits.tsx) ---------------- */

  const PILLAR_META = {
    P1: { label: "Understand", cls: "pillar-p1" },
    P2: { label: "Recognize", cls: "pillar-p2" },
    P3: { label: "Detect", cls: "pillar-p3" },
    P4: { label: "Mitigate", cls: "pillar-p4" },
  };

  function pillarBadge(pillar) {
    const m = PILLAR_META[pillar];
    return '<span class="badge pillar-badge ' + m.cls + '" aria-label="Pillar: ' + m.label + '">' + m.label + "</span>";
  }

  function stamp(text, tone, cls) {
    return '<span class="stamp ' + (tone || "amber") + (cls ? " " + cls : "") + '">' + icon("Stamp") + esc(text) + "</span>";
  }

  function sectionTitle(children, kicker) {
    return (
      '<div class="section-title-block">' +
      (kicker ? '<div class="section-title-kicker">' + esc(kicker) + "</div>" : "") +
      '<h2 class="section-title">' + children + "</h2>" +
      "</div>"
    );
  }

  function progressRing(value, label) {
    const size = 44;
    const r = (size - 8) / 2;
    const c = 2 * Math.PI * r;
    const v = Math.max(0, Math.min(1, value));
    const off = c * (1 - v);
    return (
      '<svg width="' + size + '" height="' + size + '" role="img" aria-label="' + esc(label) + '" style="flex-shrink:0">' +
      '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="#DDD3BE" stroke-width="6"/>' +
      '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="#B45309" stroke-width="6" ' +
      'stroke-dasharray="' + c + '" stroke-dashoffset="' + off + '" stroke-linecap="round" ' +
      'transform="rotate(-90 ' + size / 2 + " " + size / 2 + ')"/>' +
      '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="2.5" fill="#B45309"/>' +
      "</svg>"
    );
  }

  function starRow(stars, halfCls) {
    let out = "";
    for (let i = 1; i <= 5; i++) {
      let cls;
      if (stars >= i) cls = "star-full";
      else if (stars >= i - 0.5) cls = "star-half";
      else cls = "star-empty";
      out += icon("Star", cls);
    }
    return out;
  }

  function feedbackBox(ok, text) {
    return (
      '<div class="feedback ' + (ok ? "ok" : "fail") + '" role="status" aria-live="polite">' +
      '<span class="feedback-inner">' +
      icon(ok ? "CheckCircle2" : "XCircle") +
      "<span>" + esc(text) + "</span>" +
      "</span></div>"
    );
  }

  /* match select: select-only combobox (listbox popup), Radix-Select parity */
  function matchSelect(akey, value, options, placeholder, aria) {
    const current = options.find((o) => o.value === value);
    const label = current ? current.label : placeholder;
    let opts = "";
    for (const o of options) {
      opts +=
        '<li class="match-option" role="option" tabindex="-1" data-value="' + esc(o.value) + '" ' +
        'aria-selected="' + (o.value === value ? "true" : "false") + '">' +
        esc(o.label) +
        "</li>";
    }
    return (
      '<div class="match" data-match="' + esc(akey) + '">' +
      '<button type="button" class="match-trigger" aria-haspopup="listbox" aria-expanded="false" ' +
      'aria-label="' + esc(aria) + '" data-empty="' + (current ? "0" : "1") + '" data-focus-id="match-' + esc(akey) + '">' +
      '<span class="match-value">' + esc(label) + "</span>" +
      "</button>" +
      '<ul class="match-pop thin-scroll" role="listbox" aria-label="' + esc(aria) + '" tabindex="-1">' +
      opts +
      "</ul>" +
      "</div>"
    );
  }

  function answerInput(akey, value, placeholder, aria) {
    return (
      '<input class="answer-input" type="text" data-answer-key="' + esc(akey) + '" ' +
      'value="' + esc(value ?? "") + '" placeholder="' + esc(placeholder) + '" aria-label="' + esc(aria) + '"/>'
    );
  }

  /* task panel (objective card with check + hints + feedback) */
  function taskPanel(obj, mode, bodyHtml, compactHint) {
    if (!obj) return "";
    const st = LabStore.state.objectiveState[obj.id];
    const hints = obj.hints;
    const maxHints = mode === "medium" ? Math.min(2, hints.length) : 1;
    const used = st ? st.hintsUsed : 0;
    const solved = st ? st.solved : false;
    const checkLabel =
      mode === "medium"
        ? used === 0
          ? "Hint 1 of " + maxHints
          : used < maxHints
            ? "Hint 2 of " + maxHints
            : "No hints left"
        : "Nudge (costs stars)";

    let hintsHtml = "";
    if (mode === "medium" && used > 0) {
      hintsHtml = '<div class="task-hints" aria-live="polite">';
      for (let i = 0; i < Math.min(used, hints.length); i++) {
        hintsHtml += '<div class="task-hint"><strong>Hint ' + (i + 1) + ": </strong>" + esc(hints[i]) + "</div>";
      }
      hintsHtml += "</div>";
    } else if (mode === "hard" && used > 0) {
      hintsHtml =
        '<div aria-live="polite"><div class="task-hint"><strong>Nudge (−stars): </strong>' + esc(hints[0]) + "</div></div>";
    }

    return (
      '<section class="task-panel' + (solved ? " solved" : "") + '" aria-label="Objective ' + obj.id + '" data-task="' + obj.id + '">' +
      '<div class="task-panel-head">' +
      '<span class="task-id">' + obj.id + "</span>" +
      pillarBadge(obj.pillar) +
      (solved ? '<span class="badge badge-solved">SOLVED</span>' : "") +
      "</div>" +
      '<p class="task-title">' + esc(obj.title) + "</p>" +
      (compactHint ? '<p class="task-compact">' + esc(compactHint) + "</p>" : "") +
      '<div class="task-body">' + bodyHtml + "</div>" +
      '<div class="task-actions">' +
      (!solved
        ? '<button type="button" class="btn btn-amber btn-h10" data-action="check" data-obj="' + obj.id + '" ' +
          'data-focus-id="check-' + obj.id + '" aria-label="Check objective ' + obj.id + '">' +
          icon("ListChecks") + "CHECK RESULT</button>"
        : '<span class="task-done-label">' + icon("CheckCircle2") + "Objective complete</span>") +
      (!solved && hints.length > 0
        ? '<button type="button" class="btn btn-outline-dune btn-h10" data-action="hint" data-obj="' + obj.id + '" ' +
          'data-focus-id="hint-' + obj.id + '"' + (used >= maxHints ? " disabled" : "") +
          ' aria-label="Reveal hint for ' + obj.id + (mode === "hard" ? " (costs stars)" : "") + '">' +
          icon("Lightbulb", "hint-bulb") + esc(checkLabel) + "</button>"
        : "") +
      "</div>" +
      hintsHtml +
      (st && st.feedback ? feedbackBox(st.feedback.ok, st.feedback.text) : "") +
      "</section>"
    );
  }

  function slaCard() {
    let lis = "";
    for (const id of LabData.SERVICE_ORDER) {
      const s = LabData.SERVICES[id];
      lis +=
        '<li class="sla-li"><span class="sla-name">' + esc(s.name) + "</span>" +
        '<span class="sla-sla"> · RPO ≤ ' + esc(s.sla.rpoLabel) + " · RTO ≤ " + esc(s.sla.rtoLabel) + "</span>" +
        '<div class="sla-crit">' + esc(s.sla.criticality) + "</div></li>";
    }
    return (
      '<div class="qr-card"><div class="qr-label">SLA quick card</div><ul>' + lis + "</ul></div>"
    );
  }

  function hostedObjectives(ids, solvedFn) {
    if (!ids.length) return "";
    let chips = "";
    for (const id of ids) {
      chips += '<span class="obj-chip ' + (solvedFn(id) ? "done" : "todo") + '">' + id + "</span>";
    }
    return (
      '<div class="wall-hosted"><span class="wall-hosted-label">' + icon("CircleDot") + "Clipboard here:</span>" + chips + "</div>"
    );
  }

  /* ---------------- exercise strip ---------------- */

  function renderStrip() {
    const p = LabStore.progress();
    const mode = LabStore.state.mode;
    const mount = document.getElementById("strip");
    if (!mount) return;
    mount.innerHTML =
      '<header class="strip">' +
      '<div class="strip-inner">' +
      '<div class="strip-brand">' +
      progressRing(p.total ? p.done / p.total : 0, "Objectives completed: " + p.done + " of " + p.total) +
      "<div>" +
      '<div class="strip-title">' + esc(LabData.EXERCISE) + "</div>" +
      '<div class="strip-sub">Borealis Cold Chain · Continuity desk · ' +
      '<span class="badge badge-mode ' + (mode === "hard" ? "pillar-p3" : "pillar-p1") + '">' +
      (mode === "hard" ? "HARD / live audit" : "MEDIUM / guided") + "</span></div>" +
      "</div></div>" +
      '<div class="strip-stats">' +
      '<div class="strip-stat" aria-label="Objectives ' + p.done + " of " + p.total + '">' +
      '<div class="strip-stat-num">' + p.done + "/" + p.total + "</div>" +
      '<div class="strip-stat-label">objectives</div></div>' +
      '<div class="strip-stat" aria-label="Quiz score ' + p.quizCorrect + " of " + p.quizTotal + '">' +
      '<div class="strip-stat-num">' + p.quizCorrect + "/" + p.quizTotal + "</div>" +
      '<div class="strip-stat-label">quiz</div></div>' +
      '<div class="strip-stars" aria-label="Star rating ' + p.stars + ' of 5">' + starRow(p.stars) + "</div>" +
      '<button type="button" class="btn btn-outline-spruce" data-action="finish" aria-label="Finish exercise and see completion summary">' +
      icon("Trophy") + "Finish</button>" +
      '<button type="button" class="btn btn-outline-red" data-action="open-reset" aria-label="Reset the exercise to pristine state">' +
      icon("RotateCcw") + "Reset</button>" +
      "</div></div>" +
      '<div class="strip-note"><div class="strip-note-inner">' +
      stamp("Exercise in progress", "red") +
      '<span class="strip-note-text">All documents, vendors and numbers on this desk are fictional training data. CompTIA Network+ (N10-009) — Disaster recovery (exam objective 3.6).</span>' +
      "</div></div></header>";
  }

  /* ---------------- objectives clipboard ---------------- */

  function objectiveRow(obj, mode) {
    const st = LabStore.state.objectiveState[obj.id];
    const maxHints = mode === "medium" ? Math.min(2, obj.hints.length) : 1;
    const used = st ? st.hintsUsed : 0;
    const solved = st ? st.solved : false;
    const isNext = LabStore.nextObjective() === obj.id;

    let hintsHtml = "";
    if (used > 0 && !solved) {
      hintsHtml = '<div class="clip-hints">';
      for (let i = 0; i < Math.min(used, obj.hints.length); i++) {
        hintsHtml += '<div class="clip-hint">' + esc(obj.hints[i]) + "</div>";
      }
      hintsHtml += "</div>";
    }

    return (
      '<li class="clip-row' + (solved ? " solved" : isNext ? " next" : "") + '">' +
      '<div class="clip-row-head">' +
      '<span class="clip-row-id ' + (solved ? "done" : "todo") + '">' + obj.id + "</span>" +
      pillarBadge(obj.pillar) +
      (isNext && !solved ? '<span class="badge badge-next badge-pulse">NEXT UP</span>' : "") +
      (solved ? '<span class="clip-check" role="img" aria-label="Solved">' + icon("CheckCircle2") + "</span>" : "") +
      "</div>" +
      '<p class="clip-row-title' + (solved ? " done" : "") + '">' + esc(obj.title) + "</p>" +
      '<button type="button" class="clip-link" data-action="set-board" data-board="' + obj.board + '" ' +
      'data-focus-id="clip-link-' + obj.id + '" aria-label="Open the ' + esc(boardTitle(obj.board)) + ' board to work on objective ' + obj.id + '">' +
      esc(boardTitle(obj.board)) + icon("ChevronRight") + "</button>" +
      '<div class="clip-actions">' +
      (!solved
        ? '<button type="button" class="btn btn-sm btn-amber-2" data-action="check" data-obj="' + obj.id + '" ' +
          'data-focus-id="clip-check-' + obj.id + '" aria-label="Check objective ' + obj.id + '">' +
          icon("ListChecks") + "CHECK</button>" +
          (obj.hints.length > 0
            ? '<button type="button" class="btn btn-sm btn-outline-dune" data-action="hint" data-obj="' + obj.id + '" ' +
              'data-focus-id="clip-hint-' + obj.id + '"' + (used >= maxHints ? " disabled" : "") +
              ' aria-label="' +
              (mode === "medium"
                ? "Reveal hint " + (used + 1) + " for objective " + obj.id
                : "Reveal the single nudge for objective " + obj.id + " (costs stars)") +
              '">' + icon("Lightbulb", "hint-bulb") +
              (mode === "medium" ? "Hint " + (used + 1) + "/" + maxHints : "Nudge") + "</button>"
            : "")
        : "") +
      "</div>" +
      hintsHtml +
      (st && st.feedback ? '<div class="mt-2">' + feedbackBox(st.feedback.ok, st.feedback.text) + "</div>" : "") +
      "</li>"
    );
  }

  function clipboardInnerHtml() {
    const mode = LabStore.state.mode;
    if (!mode) return "";
    const p = LabStore.progress();
    const objs = LabObjectives.objectivesForMode(mode);

    // group by pillar preserving order
    const groups = [];
    for (const o of objs) {
      const g = groups.find((x) => x.pillar === o.pillar);
      if (g) g.items.push(o);
      else groups.push({ pillar: o.pillar, items: [o] });
    }

    let groupsHtml = "";
    for (const g of groups) {
      let rows = "";
      for (const o of g.items) rows += objectiveRow(o, mode);
      groupsHtml +=
        "<div>" +
        '<div class="clip-group-label"><span class="clip-dot ' + PILLAR_META[g.pillar].cls + '" aria-hidden="true"></span>' +
        PILLAR_META[g.pillar].label + "</div>" +
        '<ul class="clip-ul">' + rows + "</ul>" +
        "</div>";
    }

    return (
      '<div style="display:flex;flex-direction:column;height:100%">' +
      '<div class="clip-head"><div class="clip-title-row">' + icon("ClipboardList") +
      '<span class="clip-title">Objectives clipboard</span></div>' +
      '<p class="clip-sub">' + p.done + " of " + p.total + " complete · " +
      (mode === "medium" ? "hints cost stars, never block" : "one paid nudge per objective") + "</p></div>" +
      '<div class="clip-list thin-scroll">' + groupsHtml + "</div>" +
      "</div>"
    );
  }

  function renderClipboard() {
    const rail = document.getElementById("clipboard-rail");
    if (rail) {
      const focusId = (() => {
        const el = document.activeElement;
        return el && el.dataset && el.dataset.focusId ? el.dataset.focusId : null;
      })();
      rail.innerHTML = '<div class="clip-sticky">' + clipboardInnerHtml() + "</div>";
      if (focusId) {
        const el = document.querySelector('[data-focus-id="' + focusId + '"]');
        if (el) el.focus();
      }
    }
  }

  function renderFab() {
    const fab = document.getElementById("clip-fab");
    if (!fab) return;
    const p = LabStore.progress();
    fab.innerHTML =
      '<button type="button" class="clip-fab" data-action="open-clipboard" aria-label="Open objectives clipboard, ' +
      p.done + " of " + p.total + ' complete"><span class="clip-fab-num">' + p.done + "/" + p.total + "</span></button>";
  }

  /* ---------------- evidence wall ---------------- */

  const BOARD_ICONS = {
    briefing: "ClipboardList",
    manual: "BookOpen",
    records: "FileStack",
    drill: "CloudRainWind",
    ledger: "Calculator",
    planner: "Building2",
    review: "ListChecks",
    afteraction: "ScrollText",
  };

  function renderWall(mode) {
    const objectiveState = LabStore.state.objectiveState;
    const solved = (id) => !!(objectiveState[id] && objectiveState[id].solved);

    let cards = "";
    LabData.BOARD_META.forEach((b, i) => {
      const hosted = LabObjectives.objectivesForBoard(b.id, mode);
      const unsolved = hosted.filter((o) => !solved(o.id));
      const allSolved = hosted.length > 0 && unsolved.length === 0;
      cards +=
        '<button type="button" class="wall-card' + (unsolved.length > 0 ? " unsolved" : "") + '" ' +
        'style="animation-delay:' + i * 0.03 + 's" data-action="set-board" data-board="' + b.id + '" ' +
        'data-focus-id="wall-' + b.id + '" aria-label="Open board ' + b.no + ": " + esc(b.title) +
        (hosted.length ? " (" + unsolved.length + " of " + hosted.length + " objectives unsolved)" : "") + '">' +
        '<div class="wall-card-top">' +
        '<span class="wall-icon">' + icon(BOARD_ICONS[b.id]) + "</span>" +
        '<div class="wall-main">' +
        '<div class="wall-no-row"><span class="wall-no">BOARD ' + b.no + "</span>" +
        (allSolved ? '<span class="wall-cleared">Cleared</span>' : "") +
        "</div>" +
        '<div class="wall-card-title">' + esc(b.title) + "</div>" +
        '<p class="wall-card-desc">' + esc(b.desc) + "</p>" +
        "</div>" +
        '<span class="wall-chev">' + icon("ChevronRight") + "</span>" +
        "</div>" +
        (hosted.length ? hostedObjectives(hosted.map((o) => o.id), solved) : "") +
        "</button>";
    });

    return (
      "<div>" +
      '<div class="wall-head"><h1 class="wall-title">Evidence wall</h1>' +
      stamp("Case 2043-A · open board", "spruce") +
      "</div>" +
      '<p class="wall-lede">Eight boards, one case. Free-roam in any order — the clipboard keeps score. Boards marked with amber chips hold clipboard objectives still to solve.</p>' +
      '<div class="wall-grid">' + cards + "</div>" +
      "</div>"
    );
  }

  /* ---------------- quick rail ---------------- */

  function renderQuickRail() {
    const mount = document.getElementById("quick-rail");
    if (!mount) return;
    let gloss = "";
    LabData.GLOSSARY.forEach((g, i) => {
      gloss +=
        '<details class="gloss-item"><summary>' + esc(g.term) + "</summary>" +
        '<div class="gloss-body">' + esc(g.def) + "</div></details>";
    });
    mount.innerHTML =
      '<aside class="quick-sticky" aria-label="Quick reference">' +
      slaCard() +
      '<div class="qr-glossary"><div class="qr-label">Glossary tabs</div>' + gloss + "</div>" +
      '<p class="qr-note">All documents, vendors, SLAs and figures are synthetic training data created for this exercise.</p>' +
      "</aside>";
  }

  /* ---------------- completion modal ---------------- */

  const BOARD_LABEL = {
    briefing: "Scenario Briefing",
    manual: "Field Manual",
    records: "Records Room",
    drill: "Storm Drill",
    ledger: "Recovery Ledger",
    planner: "Continuity Planner",
    review: "Board Review",
    afteraction: "After-Action Notes",
  };

  function renderModalContent(focusAreas) {
    const mode = LabStore.state.mode;
    const p = LabStore.progress();
    const objectiveState = LabStore.state.objectiveState;
    const objs = LabObjectives.objectivesForMode(mode);
    const pillars = ["P1", "P2", "P3", "P4"];

    let focusHtml;
    if (focusAreas.length === 0) {
      focusHtml =
        '<div class="focus-clear">No gaps detected: every objective solved first-try without hints, and the quiz is clean. Push further by replaying the <strong>other difficulty</strong> — Hard removes the guidance and adds red herrings — or drill the After-Action study list.</div>';
    } else {
      focusHtml = '<ul class="focus-list">';
      for (const f of focusAreas) {
        focusHtml +=
          '<li class="focus-item">' +
          '<div class="focus-title">' + esc(f.title) + "</div>" +
          '<div class="focus-detail">' + esc(f.detail) + "</div>" +
          '<div class="focus-action"><span style="font-weight:600">Do this: </span>' + esc(f.action) +
          (f.board
            ? ' <button type="button" class="focus-link" data-action="modal-board" data-board="' + f.board + '">Open ' +
              BOARD_LABEL[f.board] + "</button>."
            : "") +
          "</div></li>";
      }
      focusHtml += "</ul>";
    }

    let recap = "";
    for (const pl of pillars) {
      const group = objs.filter((o) => o.pillar === pl);
      if (group.length === 0) continue;
      const done = group.filter((o) => objectiveState[o.id] && objectiveState[o.id].solved).length;
      recap +=
        '<div class="pillar-row"><div class="pillar-row-head">' +
        '<span class="pillar-chip ' + PILLAR_META[pl].cls + '">' + PILLAR_META[pl].label + "</span>" +
        '<span class="pillar-count">' + done + "/" + group.length + "</span>" +
        '<span class="pillar-ids">' + group.map((o) => o.id).join(" · ") + "</span>" +
        "</div></div>";
    }

    return (
      '<div class="modal-card modal-card-in thin-scroll">' +
      '<div class="modal-wrap">' +
      '<button type="button" class="modal-close" data-action="close-modal" aria-label="Close">' + icon("X") + "</button>" +
      '<div class="modal-title-row">' + icon("Award") + '<h2 class="modal-title" id="modal-title">Exercise debrief</h2></div>' +
      '<p class="modal-desc" id="modal-desc">' +
      (p.allSolved
        ? "Every clipboard objective is stamped. Here is what the committee sees."
        : "Partial debrief — unsolved objectives still count against the score.") +
      "</p>" +
      '<div class="modal-stats">' +
      '<div class="stat-amber"><div class="stat-label">Score</div><div class="stat-value">' + p.score + "%</div>" +
      '<div class="stat-sub">70% objectives · 30% quiz</div></div>' +
      '<div class="stat-spruce"><div class="stat-label">Star rating</div>' +
      '<div class="stat-stars" aria-label="' + p.stars + ' of 5 stars">' + starRow(p.stars) + "</div>" +
      '<div class="stat-sub">' + p.stars + "/5 — first-attempt accuracy &amp; frugal hint use</div></div>" +
      "</div>" +
      '<div class="mt-4"><div class="modal-section-label">' + icon("Crosshair") +
      "Focus areas — where to push next</div>" +
      '<div class="mt-2">' + focusHtml + "</div></div>" +
      '<div class="mt-4 pillar-recap"><div class="modal-section-label">' + icon("Target") +
      "Objective recap by pillar</div>" + recap + "</div>" +
      '<div class="modal-nextsteps"><span style="font-weight:700;color:var(--ink)">Next steps: </span>revisit the ' +
      '<button type="button" class="modal-link" data-action="modal-board" data-board="afteraction">After-Action Notes</button> for ' +
      "what to study next (backup strategies, the availability tech behind these redundancy models, cloud DR patterns), or replay in the other mode for the rest of the story.</div>" +
      '<div class="modal-footer">' +
      '<button type="button" class="btn btn-outline-dune" data-action="modal-wall" aria-label="Back to the evidence wall">' +
      icon("BookOpen") + "Back to the wall</button>" +
      '<button type="button" class="btn btn-outline-red" data-action="modal-restart" aria-label="Restart the exercise from scratch">' +
      icon("RotateCcw") + "Restart exercise</button>" +
      '<button type="button" class="btn btn-spruce" data-action="close-modal" aria-label="Close the debrief">Keep exploring ' +
      icon("ChevronRight") + "</button>" +
      "</div></div></div>"
    );
  }

  return {
    esc: esc,
    icon: icon,
    boardTitle: boardTitle,
    PILLAR_META: PILLAR_META,
    pillarBadge: pillarBadge,
    stamp: stamp,
    sectionTitle: sectionTitle,
    progressRing: progressRing,
    starRow: starRow,
    feedbackBox: feedbackBox,
    matchSelect: matchSelect,
    answerInput: answerInput,
    taskPanel: taskPanel,
    slaCard: slaCard,
    hostedObjectives: hostedObjectives,
    renderStrip: renderStrip,
    renderClipboard: renderClipboard,
    renderFab: renderFab,
    clipboardInnerHtml: clipboardInnerHtml,
    renderWall: renderWall,
    renderQuickRail: renderQuickRail,
    renderModalContent: renderModalContent,
    BOARD_LABEL: BOARD_LABEL,
  };
})();
