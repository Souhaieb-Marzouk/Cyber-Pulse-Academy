/* ═══════════════════════════════════════════════════════════════════════════
   THE CONTROL GRID — js/app.js
   Bootstrap, screens (mode select / briefing / knowledge core / work /
   debrief), HUD, Case Rail, Intel Rail, dialogs, completion modal, event
   delegation and the render loop. Behavior mirrors the original lab 1:1.
   ═══════════════════════════════════════════════════════════════════════════ */

"use strict";

(function () {
  var esc = CG.ui.esc;
  var icon = CG.ui.icon;
  var consoleLabel = CG.ui.consoleLabel;

  var storageOk = true;
  var completionOpen = false;
  var lastPhase = null;
  var glossaryQuery = "";

  /* ═══ Screens ══════════════════════════════════════════════════════════ */

  function modeSelectHtml(state) {
    var done = 0;
    var total = 0;
    if (state.mode) {
      var list = CG.state.objectivesForMode(state.mode);
      total = list.length;
      done = list.filter(function (o) { return state.progress[o.id] && state.progress[o.id].done; }).length;
    }
    var resumeHtml =
      state.mode && done > 0
        ? '<div class="resume-card">' +
          '<div class="resume-info">' +
          consoleLabel("assessment in progress", "text-primary") +
          '<p class="resume-text">Resume the ' +
          (state.mode === "medium" ? "Field Orientation" : "Red Cell Audit") +
          " — " +
          done +
          "/" +
          total +
          " objectives passed.</p>" +
          "</div>" +
          '<button type="button" data-action="resume" class="btn btn-primary">Resume →</button>' +
          "</div>"
        : "";

    var modeCards = [CG.MODE_CARDS.medium, CG.MODE_CARDS.hard]
      .map(function (m) {
        var isMedium = m.id === "medium";
        return (
          '<button type="button" data-action="mode-select" data-arg="' +
          m.id +
          '" data-fk="mode:' +
          m.id +
          '" class="mode-card ' +
          (isMedium ? "is-medium" : "is-hard") +
          '">' +
          consoleLabel(m.tag, isMedium ? "text-primary" : "text-destructive") +
          '<span class="mode-name">' +
          esc(m.name) +
          "</span>" +
          '<span class="mode-desc">' +
          esc(m.desc) +
          "</span>" +
          '<ul class="mode-bullets">' +
          m.bullets
            .map(function (b) {
              return (
                '<li><span class="bullet-dot ' +
                (isMedium ? "bg-primary" : "bg-destructive") +
                '" aria-hidden="true"></span>' +
                esc(b) +
                "</li>"
              );
            })
            .join("") +
          "</ul>" +
          '<span class="mode-enter">Enter ' +
          esc(m.name.toLowerCase()) +
          ' <span aria-hidden="true">→</span></span>' +
          "</button>"
        );
      })
      .join("");

    return (
      '<div class="mode-wrap">' +
      '<div class="mode-hero">' +
      '<div class="hero-sigil">' +
      CG.ui.gridSigil("icon-lg") +
      "</div>" +
      '<h1 class="mode-title">THE CONTROL GRID</h1>' +
      '<p class="mode-subtitle">Security Control Types &amp; Method — an interactive field assessment</p>' +
      '<div class="hero-badges">' +
      '<span class="hero-badge">CompTIA CySA+ CS0-003 · Lesson 1.2</span>' +
      CG.ui.safetyStrip() +
      "</div></div>" +
      resumeHtml +
      '<div class="mode-grid">' +
      modeCards +
      "</div>" +
      '<p class="mode-footnote">Both modes share the same evidence core. Progress auto-saves in your browser — you can leave and resume any time. A reset switch is always available in the console header.</p>' +
      (!storageOk
        ? '<div class="alert storage-alert">' +
          CG.ui.icon("database", "icon-sm") +
          '<div><p class="alert-title">SAVING UNAVAILABLE</p>' +
          '<p class="alert-text">Browser storage is blocked, so progress won&#39;t survive a reload. The lab itself still works.</p></div></div>'
        : "") +
      "</div>"
    );
  }

  function briefingHtml(state) {
    var hard = state.mode === "hard";
    var modeCard = hard
      ? '<div class="brief-box is-hard"><div>' +
        consoleLabel("11:47 update — the audit just went live", "text-destructive") +
        '<p class="brief-box-text">Mid-audit, Northgate&#39;s file server began encrypting itself. Ransomware is on the wire, the binder is full of red herrings, and validation is strict: exact cells, exact values, exact sequences. One nudge is available — and it costs score.</p></div></div>'
      : '<div class="brief-box is-medium"><div>' +
        consoleLabel("your orientation", "text-primary") +
        '<p class="brief-box-text">Twelve guided objectives, ordered from definition to defense-in-depth. Every check explains itself, tiered hints are one click away, and wrong answers cost nothing but stars. Follow the Case Rail from top to bottom.</p></div></div>';

    var miniCards = [
      { icon: "scroll-text", k: "4 pillars", v: "Understand · Recognize · Detect · Mitigate" },
      { icon: "target", k: "the grid", v: "3 categories × 6 types — every finding gets a cell" },
      { icon: "crosshair", k: "the stakes", v: "Paper controls don't stop ransomware. Verified ones do." },
    ]
      .map(function (c) {
        return (
          '<div class="mini-card">' +
          CG.ui.icon(c.icon, "icon-sm text-primary") +
          consoleLabel(c.k) +
          '<p class="mini-card-text">' +
          esc(c.v) +
          "</p></div>"
        );
      })
      .join("");

    return (
      '<div class="page-wrap page-narrow">' +
      consoleLabel("scenario briefing · case file NG-" + (hard ? "7741" : "7704"), "text-primary") +
      '<h2 class="page-title">THE NORTHGATE ASSESSMENT</h2>' +
      '<div class="brief-body">' +
      "<p>You are the newest security analyst at " +
      CG.ui.tip("Northgate Logistics Group", CG.TOOLTIPS.northgate, "northgate") +
      " — a fictional mid-sized freight and warehousing company. One HQ tower, a regional warehouse campus, a 220-truck fleet, and a data center that keeps 40,000 shipment records moving every day.</p>" +
      "<p>Last month, an external assessor walked the halls, read the policies, and interviewed the staff. Their raw findings landed on the CISO&#39;s desk this morning — and so did you. Your mandate: turn that pile of observations into a working " +
      CG.ui.tip("Control Grid", CG.TOOLTIPS.grid, "grid") +
      " — classifying every safeguard by category (who implements it) and type (how it acts) — then close the gaps before a real attacker finds them first.</p>" +
      modeCard +
      "<p>Why this matters: on the " +
      CG.ui.tip("CompTIA CySA+ CS0-003 exam", CG.TOOLTIPS.exam, "exam") +
      ", you will be handed exactly this kind of scenario and asked to classify and recommend controls. Northgate is fictional — the skill is not.</p>" +
      "</div>" +
      '<div class="mini-grid">' +
      miniCards +
      "</div>" +
      '<div class="page-footer">' +
      CG.ui.safetyStrip() +
      '<button type="button" data-action="brief-next" class="btn btn-primary">Enter the war room →</button>' +
      "</div></div>"
    );
  }

  function knowledgeCoreHtml() {
    var categoryCards = CG.CATEGORY_META.map(function (c) {
      return (
        '<div class="kc-card">' +
        consoleLabel("category", "text-primary") +
        '<p class="kc-name">' +
        esc(c.name) +
        "</p>" +
        '<p class="kc-essence">' +
        esc(c.essence) +
        "</p>" +
        '<p class="kc-examples">' +
        esc(c.examples) +
        "</p>" +
        '<p class="kc-watchout">' +
        esc(c.watchout) +
        "</p></div>"
      );
    }).join("");

    var typeCards = CG.TYPE_META.map(function (t) {
      return (
        '<div class="kc-card">' +
        '<div class="kc-card-head"><p class="kc-name">' +
        esc(t.name) +
        "</p>" +
        CG.ui.icon("book-open", "icon-xs text-primary-dim") +
        "</div>" +
        '<p class="kc-essence">' +
        esc(t.method) +
        "</p>" +
        '<p class="kc-example-mono">' +
        esc(t.example) +
        "</p>" +
        '<p class="kc-watchout">' +
        esc(t.watchout) +
        "</p></div>"
      );
    }).join("");

    var mitreCards = CG.MITRE_ANCHORS.map(function (m) {
      return (
        '<a class="mitre-card" href="' +
        esc(m.url) +
        '" target="_blank" rel="noopener noreferrer">' +
        '<div class="mitre-head"><span class="mitre-id">' +
        esc(m.id) +
        '</span><span class="mitre-cell">' +
        esc(m.cell) +
        "</span></div>" +
        '<p class="mitre-name">' +
        esc(m.name) +
        "</p>" +
        '<p class="mitre-text">' +
        esc(m.text) +
        "</p>" +
        '<span class="mitre-link">official page ↗</span>' +
        "</a>"
      );
    }).join("");

    var realityCards = CG.FIELD_REALITY.map(function (f) {
      return (
        '<div class="kc-card">' +
        consoleLabel(f.tag, "text-[8px] text-warn") +
        '<p class="kc-name">' +
        esc(f.title) +
        "</p>" +
        '<p class="kc-reality-text">' +
        esc(f.text) +
        "</p></div>"
      );
    }).join("");

    return (
      '<div class="page-wrap page-wide">' +
      consoleLabel("knowledge core · read before field work", "text-primary") +
      '<h2 class="page-title">WHAT A CONTROL IS — AND HOW IT ACTS</h2>' +
      '<div class="kc-definition"><p><span class="kc-strong">Security controls</span> are safeguards — ' +
      CG.ui.tip("technical", CG.TOOLTIPS.technical, "technical") +
      " measures like firewalls and encryption, " +
      CG.ui.tip("nontechnical", CG.TOOLTIPS.nontechnical, "nontechnical") +
      " measures like employee training and awareness — that reduce risk by " +
      CG.ui.tip("minimizing the attack surface", CG.TOOLTIPS.surface, "surface") +
      " and addressing vulnerabilities. Implemented correctly, they protect valuable assets and data from unauthorized access, theft, and destruction.</p></div>" +
      '<div class="kc-axes">' +
      consoleLabel("the two axes", "text-primary") +
      '<div class="kc-axes-grid"><div class="stack-sm">' +
      '<p class="kc-axes-lead">Every control answers two questions. <span class="kc-strong">WHO/WHAT implements it?</span> — its <span class="kc-strong">category</span>. <span class="kc-strong">HOW does it act?</span> — its <span class="kc-strong">type (method)</span>. Two axes, one cell each — that cell is where measurement, budgeting and the exam live.</p>' +
      '<div class="kc-cat-grid">' +
      categoryCards +
      "</div>" +
      '<div class="kc-type-grid">' +
      typeCards +
      "</div>" +
      "</div>" +
      '<div class="kc-side">' +
      '<div class="kc-side-box">' +
      consoleLabel("the control grid") +
      CG.ui.matrixBoard() +
      '<p class="kc-side-note">The lab&#39;s centerpiece. Six desks of objectives teach you to place any safeguard on this board — then exploit the empty cells the way an attacker would.</p>' +
      "</div></div></div></div>" +
      '<div class="kc-section">' +
      consoleLabel("mitre anchors — where these controls live in att&amp;ck", "text-primary") +
      '<div class="mitre-grid">' +
      mitreCards +
      "</div></div>" +
      '<div class="kc-section">' +
      consoleLabel("field reality — simplified", "text-primary") +
      '<div class="kc-reality-grid">' +
      realityCards +
      "</div></div>" +
      '<div class="attacker-box">' +
      consoleLabel("the attacker's view", "text-primary") +
      '<p class="attacker-text">Attackers map your controls from the outside: job postings reveal your stack, banners reveal your monitoring, breach data reveals your gaps. What they value most is the seam between layers — a control that exists on paper but was never verified. Northgate&#39;s grid has empty cells. Your job is to find them before someone else does — for pay.</p>' +
      '<div class="attacker-note">' +
      CG.ui.icon("graduation-cap", "icon-sm text-primary") +
      '<span>Every term with a dotted underline has a definition — and the full glossary lives in the console header.</span></div></div>' +
      '<div class="page-footer justify-end">' +
      '<button type="button" data-action="core-next" class="btn btn-primary">Start field work →</button>' +
      "</div></div>"
    );
  }

  /* ═══ HUD ══════════════════════════════════════════════════════════════ */

  var STEPS = [
    { id: "brief", label: "BRIEF" },
    { id: "core", label: "DOCTRINE" },
    { id: "work", label: "FIELD" },
    { id: "quiz", label: "CHECK" },
    { id: "debrief", label: "NOTES" },
  ];

  function hudHtml(state) {
    var mode = state.mode;
    var objectives = CG.state.objectivesForMode(mode);
    var done = objectives.filter(function (o) { return state.progress[o.id] && state.progress[o.id].done; }).length;
    var enabled = {
      mode: true,
      brief: true,
      core: state.briefSeen,
      work: state.briefSeen && state.coreSeen,
      quiz: objectives.length > 0 && objectives.every(function (o) { return state.progress[o.id] && state.progress[o.id].done; }),
      debrief: state.quiz.done,
    };
    var steps = STEPS.map(function (s) {
      var active = state.phase === s.id;
      var on = enabled[s.id];
      return (
        "<li>" +
        '<button type="button" data-action="goto-phase" data-arg="' +
        s.id +
        '" data-fk="step:' +
        s.id +
        '"' +
        (on ? "" : " disabled") +
        (active ? ' aria-current="step"' : "") +
        ' class="step-btn' +
        (active ? " active" : on ? "" : " off") +
        '">' +
        s.label +
        "</button></li>"
      );
    }).join("");

    return (
      '<header class="hud">' +
      '<div class="hud-inner">' +
      '<div class="hud-brand">' +
      '<span class="hud-sigil">' +
      CG.ui.gridSigil("icon-sm2") +
      "</span>" +
      '<div class="hud-titles">' +
      '<p class="hud-title">THE CONTROL GRID</p>' +
      '<p class="hud-subtitle">CySA+ CS0-003 · L1.2 · ' +
      (mode === "medium" ? "Field Orientation" : "Red Cell Audit") +
      "</p></div></div>" +
      '<nav aria-label="Lab phases" class="hud-steps"><ol class="steps-list">' +
      steps +
      "</ol></nav>" +
      '<div class="hud-actions">' +
      CG.ui.progressRing(done, objectives.length, "Objectives: " + done + " of " + objectives.length + " passed") +
      '<button type="button" data-action="open-glossary" data-fk="glossary" class="btn btn-outline btn-hud">Glossary</button>' +
      '<button type="button" data-action="open-reset" data-fk="reset" aria-label="Reset" class="btn btn-outline btn-hud btn-reset">' +
      icon("rotate-ccw", "icon-xs") +
      '<span class="reset-label">Reset</span></button>' +
      "</div></div></header>"
    );
  }

  /* ═══ Case Rail (C4) ═══════════════════════════════════════════════════ */

  function caseRailHtml(state) {
    var mode = state.mode;
    var objectives = CG.state.objectivesForMode(mode);
    var allDone = objectives.every(function (o) { return state.progress[o.id] && state.progress[o.id].done; });
    var pillarStats = CG.PILLAR_ORDER.map(function (p) {
      var list = objectives.filter(function (o) { return o.pillar === p; });
      var d = list.filter(function (o) { return state.progress[o.id] && state.progress[o.id].done; }).length;
      return { pillar: p, done: d, total: list.length };
    });

    var isLocked = function (o) {
      if (mode !== "medium") return false;
      var idx = -1;
      for (var i = 0; i < objectives.length; i++) if (objectives[i].id === o.id) idx = i;
      if (idx <= 0) return false;
      for (var j = 0; j < idx; j++) {
        if (!(state.progress[objectives[j].id] && state.progress[objectives[j].id].done)) return true;
      }
      return false;
    };

    var statRows = pillarStats
      .map(function (s) {
        return (
          '<div class="pillar-stat">' +
          '<span class="pillar-dot ' +
          CG.ui.pillarBarClass(s.pillar) +
          '" aria-hidden="true"></span>' +
          '<span class="pillar-stat-name">' +
          esc(s.pillar.slice(0, 10)) +
          "</span>" +
          '<span class="pillar-bar"><span class="pillar-bar-fill ' +
          CG.ui.pillarBarClass(s.pillar) +
          '" style="width:' +
          (s.total === 0 ? 0 : (s.done / s.total) * 100) +
          '%"></span></span>' +
          '<span class="pillar-count">' +
          s.done +
          "/" +
          s.total +
          "</span></div>"
        );
      })
      .join("");

    var objButtons = objectives
      .map(function (o) {
        var prog = state.progress[o.id];
        var locked = isLocked(o);
        var isCurrent = state.currentObj === o.id;
        var num = o.id.replace(/[MH]/, "");
        return (
          '<button type="button" data-action="rail-select" data-arg="' +
          esc(o.id) +
          '" data-fk="rail:' +
          esc(o.id) +
          '"' +
          (locked && !isCurrent ? " disabled" : "") +
          (isCurrent ? ' aria-current="true"' : "") +
          ' class="rail-obj' +
          (isCurrent ? " current" : locked ? " locked" : "") +
          '">' +
          '<span class="rail-num ' +
          (prog && prog.done ? "done" : "") +
          '">' +
          (prog && prog.done
            ? icon("check", "icon-xs")
            : locked && !isCurrent
              ? icon("lock", "icon-2xs")
              : num) +
          "</span>" +
          '<span class="rail-obj-body"><span class="rail-obj-title">' +
          esc(o.title) +
          "</span>" +
          '<span class="rail-obj-meta">' +
          CG.ui.pillarBadge(o.pillar, "scaled") +
          (prog && prog.done && prog.attempts > 1
            ? '<span class="rail-attempts">' + prog.attempts + " checks</span>"
            : "") +
          "</span></span>" +
          (isCurrent ? icon("chevron-right", "icon-xs text-primary") : "") +
          "</button>"
        );
      })
      .join("");

    var quizCard = allDone
      ? '<div class="quiz-gate is-open">' +
        consoleLabel("knowledge check", "text-primary") +
        '<p class="quiz-gate-text">All objectives passed — the check is open.</p>' +
        '<button type="button" data-action="quiz-gate" class="btn btn-primary btn-gate">' +
        (state.quiz.done ? "Review check →" : "Take the check →") +
        "</button></div>"
      : '<div class="quiz-gate">' +
        consoleLabel("knowledge check", "text-primary") +
        '<p class="quiz-gate-text">Unlocks when every objective on the rail passes. ' +
        (mode === "hard" ? "" : "Keep moving down the list.") +
        "</p></div>";

    return (
      '<aside aria-label="Case rail — objectives tracker" class="case-rail">' +
      '<div class="rail-box">' +
      '<div class="rail-head">' +
      consoleLabel("case rail · objectives", "text-primary") +
      consoleLabel(
        objectives.filter(function (o) { return state.progress[o.id] && state.progress[o.id].done; }).length +
          "/" +
          objectives.length
      ) +
      "</div>" +
      '<div class="pillar-stats">' +
      statRows +
      "</div></div>" +
      '<nav aria-label="Objective list" class="rail-list">' +
      objButtons +
      "</nav>" +
      quizCard +
      "</aside>"
    );
  }

  /* ═══ Intel Rail ═══════════════════════════════════════════════════════ */

  function intelRailHtml(state, obj) {
    var mode = state.mode;
    var station = null;
    if (obj) CG.STATIONS.forEach(function (s) { if (s.id === obj.station) station = s; });
    var hintsUsed = obj && state.progress[obj.id] ? state.progress[obj.id].hints || 0 : 0;
    var passed = obj ? !!(state.progress[obj.id] && state.progress[obj.id].done) : false;

    var whereToLook = "";
    if (obj) {
      if (mode === "medium" && station) {
        whereToLook =
          '<div class="rail-box"><div>' +
          consoleLabel("where to look", "text-primary") +
          '<p class="station-line">' +
          CG.ui.stationIcon(station.icon, "icon-xs text-primary") +
          esc(station.name) +
          "</p>" +
          '<p class="station-blurb">' +
          esc(station.blurb) +
          "</p>" +
          '<p class="covers-line"><span class="covers-label">covers: </span>' +
          esc(obj.anchor) +
          "</p></div></div>";
      } else {
        whereToLook =
          '<div class="rail-box"><div>' +
          consoleLabel("red cell rules", "text-primary") +
          '<p class="redcell-text">No pointers in the field. Read everything, trust nothing, and classify precisely — near-misses are rejected with a rationale. One nudge below, and it costs.</p></div></div>';
      }
    }

    var hintsHtml = "";
    if (obj) {
      if (mode === "medium") {
        var items = obj.hints
          .map(function (h, i) {
            if (hintsUsed > i) {
              return (
                "<li>" +
                '<p class="hint-revealed"><span class="hint-tier">tier ' +
                (i + 1) +
                " · </span>" +
                esc(h) +
                "</p></li>"
              );
            }
            if (hintsUsed === i && !passed) {
              return (
                "<li>" +
                '<button type="button" data-action="hint-reveal" data-arg="' +
                (i + 1) +
                '" data-fk="hint:' +
                esc(obj.id) +
                ":" +
                i +
                '" class="hint-btn">' +
                icon("lightbulb", "icon-xs text-primary") +
                "Reveal " +
                ["nudge", "direction", "demonstration"][i] +
                " · costs stars</button></li>"
              );
            }
            return "<li></li>";
          })
          .join("");
        hintsHtml =
          '<div class="rail-box"><div>' +
          consoleLabel("hints", "text-primary") +
          '<ul class="hint-list" aria-live="polite">' +
          items +
          "</ul>" +
          (hintsUsed === 0 && !passed
            ? '<p class="rail-note">Hints never block progress — they only trim your star rating.</p>'
            : "") +
          (passed ? '<p class="rail-note">Objective already passed — hint ledger is closed.</p>' : "") +
          "</div></div>";
      } else {
        var nudgeInner;
        if (hintsUsed > 0) {
          nudgeInner =
            '<p class="hint-revealed"><span class="hint-tier">the one nudge · </span>' +
            esc(obj.hints[0]) +
            "</p>";
        } else if (passed) {
          nudgeInner = '<p class="rail-note">Objective already passed — the nudge is retired untouched.</p>';
        } else {
          nudgeInner =
            '<button type="button" data-action="nudge-open" data-arg="' +
            esc(obj.id) +
            '" data-fk="nudge:' +
            esc(obj.id) +
            '" class="hint-btn is-nudge">' +
            icon("lightbulb", "icon-xs text-destructive") +
            "Reveal the single nudge · visibly costs score</button>";
        }
        hintsHtml =
          '<div class="rail-box"><div>' +
          consoleLabel("hints", "text-primary") +
          nudgeInner +
          "</div></div>";
      }
    }

    var legend =
      '<div class="rail-box"><div>' +
      consoleLabel("grid legend", "text-primary") +
      '<p class="legend-text"><span class="legend-strong">Managerial · Operational · Technical</span> — who implements. <span class="legend-strong">Preventive · Detective · Corrective · Compensating · Deterrent · Physical</span> — how it acts.</p>' +
      '<p class="legend-note">Every objective pins a finding to exactly one cell on this board.</p></div></div>';

    return (
      '<aside aria-label="Intel rail — hints and legend" class="intel-rail">' +
      whereToLook +
      hintsHtml +
      legend +
      "</aside>"
    );
  }

  /* ═══ Debrief (C6) ═════════════════════════════════════════════════════ */

  function debriefHtml() {
    var verify = CG.DEBRIEF.verification
      .map(function (v) {
        return (
          '<li class="verify-item"><p class="verify-source">' +
          esc(v.source) +
          '</p><p class="verify-shows">' +
          esc(v.shows) +
          "</p></li>"
        );
      })
      .join("");

    var recs = CG.DEBRIEF.mitigationRecs
      .map(function (m) {
        return (
          "<li><a href=\"https://attack.mitre.org/mitigations/" +
          esc(m.id) +
          '/" target="_blank" rel="noopener noreferrer" class="rec-link">' +
          '<span class="rec-top"><span class="rec-id">' +
          esc(m.id) +
          " · " +
          esc(m.name) +
          '</span>' +
          icon("external-link", "icon-xs text-muted") +
          "</span>" +
          '<span class="rec-cell">' +
          esc(m.cell) +
          "</span>" +
          '<span class="rec-note">' +
          esc(m.note) +
          "</span></a></li>"
        );
      })
      .join("");

    var blue = CG.DEBRIEF.blue
      .map(function (b) {
        return (
          '<li class="takeaway">' +
          icon("circle-check-big", "icon-xs ok-icon") +
          esc(b) +
          "</li>"
        );
      })
      .join("");
    var red = CG.DEBRIEF.red
      .map(function (b) {
        return '<li class="takeaway">' + icon("circle-x", "icon-xs red-icon") + esc(b) + "</li>";
      })
      .join("");

    var links = CG.DEBRIEF.links
      .map(function (l) {
        return (
          '<a href="' +
          esc(l.url) +
          '" target="_blank" rel="noopener noreferrer" class="ext-link">' +
          esc(l.label) +
          icon("external-link", "icon-xs") +
          "</a>"
        );
      })
      .join("");

    return (
      '<div class="page-wrap page-wide">' +
      consoleLabel("debrief · field notes", "text-primary") +
      '<h2 class="page-title">WHAT THE GRID TAUGHT YOU</h2>' +
      '<div class="debrief-grid">' +
      '<section aria-labelledby="h-verify" class="debrief-card"><h3 id="h-verify" class="debrief-h3">verification data sources</h3>' +
      '<p class="debrief-sub">How an analyst proves each control type is alive — the detective work of control auditing.</p>' +
      '<ul class="stack-sm">' +
      verify +
      "</ul></section>" +
      '<section aria-labelledby="h-mit" class="debrief-card"><h3 id="h-mit" class="debrief-h3">mitigation recommendations · official ids</h3>' +
      '<ul class="stack-sm mt3">' +
      recs +
      "</ul></section>" +
      '<section aria-labelledby="h-blue" class="debrief-card"><h3 id="h-blue" class="debrief-h3 text-ok">blue-team takeaways</h3>' +
      '<ul class="stack-sm mt3">' +
      blue +
      "</ul></section>" +
      '<section aria-labelledby="h-red" class="debrief-card"><h3 id="h-red" class="debrief-h3 text-bad">red-team mindset</h3>' +
      '<ul class="stack-sm mt3">' +
      red +
      "</ul></section>" +
      "</div>" +
      '<section aria-labelledby="h-links" class="debrief-card mt4"><h3 id="h-links" class="debrief-h3">go deeper — official sources</h3>' +
      '<div class="ext-links">' +
      links +
      "</div></section>" +
      '<div class="page-footer mt8">' +
      CG.ui.safetyStrip() +
      '<button type="button" data-action="open-completion" class="btn btn-primary">Finish assessment — see your rating →</button>' +
      "</div></div>"
    );
  }

  /* ═══ Dialogs ══════════════════════════════════════════════════════════ */

  function openResetDialog() {
    CG.ui.showDialog({
      name: "reset",
      html:
        '<div class="dlg-head"><h2 class="dlg-title">RESET THE LAB?</h2>' +
        '<p class="dlg-desc">This wipes mode, every objective, quiz answers and saved progress from this browser. The pristine lab returns to the mode-select screen. There is no undo.</p></div>' +
        '<div class="dlg-actions">' +
        '<button type="button" data-action="reset-cancel" data-autofocus class="btn btn-outline">Keep my progress</button>' +
        '<button type="button" data-action="reset-confirm" class="btn btn-destructive">Wipe &amp; reset</button></div>',
    });
  }

  function openNudgeDialog(objId) {
    CG.ui.showDialog({
      name: "nudge",
      html:
        '<div class="dlg-head"><h2 class="dlg-title">SPEND THE NUDGE?</h2>' +
        '<p class="dlg-desc">Red Cell rules allow exactly one nudge per audit. Using it is recorded on your rating — three stars require an untouched run. No further hints exist.</p></div>' +
        '<div class="dlg-actions">' +
        '<button type="button" data-action="nudge-cancel" data-autofocus class="btn btn-outline">Keep it in reserve</button>' +
        '<button type="button" data-action="nudge-confirm" data-arg="' +
        esc(objId) +
        '" class="btn btn-destructive">Reveal the nudge</button></div>',
    });
  }

  function glossaryDialogHtml() {
    var needle = glossaryQuery.trim().toLowerCase();
    var filtered = needle
      ? CG.GLOSSARY.filter(function (g) {
          return g.term.toLowerCase().includes(needle) || g.def.toLowerCase().includes(needle);
        })
      : CG.GLOSSARY;
    var list = filtered.length
      ? filtered
          .map(function (g) {
            return (
              '<li class="gloss-item"><p class="gloss-term">' +
              esc(g.term) +
              '</p><p class="gloss-def">' +
              esc(g.def) +
              "</p></li>"
            );
          })
          .join("")
      : '<li class="gloss-empty">No matching term.</li>';
    return (
      '<div class="dlg-head dlg-head-split"><div><h2 class="dlg-title" id="gloss-title">FIELD GLOSSARY</h2>' +
      '<p class="dlg-desc" id="gloss-desc">15 terms from Lesson 1.2 — one-line definitions.</p></div>' +
      '<button type="button" data-action="glossary-close" aria-label="Close glossary" class="dlg-x">' +
      icon("x", "icon-sm") +
      "</button></div>" +
      '<div class="gloss-search"><span class="gloss-search-icon">' +
      icon("search", "icon-xs") +
      '</span><input type="text" value="' +
      esc(glossaryQuery) +
      '" data-action-input="glossary-search" data-autofocus aria-label="Search glossary" placeholder="Search terms…" class="gloss-input"></div>' +
      '<ul class="gloss-list" aria-label="Glossary terms">' +
      list +
      "</ul>"
    );
  }

  function openGlossaryDialog() {
    glossaryQuery = "";
    CG.ui.showDialog({
      name: "glossary",
      role: "dialog",
      dismissable: true,
      labelledBy: "gloss-title",
      describedBy: "gloss-desc",
      cls: "gloss-dlg",
      html: glossaryDialogHtml(),
    });
  }

  function refreshGlossaryDialog() {
    var dlg = document.querySelector('[data-dialog="glossary"] .dialog-content');
    if (dlg) {
      var input = dlg.querySelector(".gloss-input");
      var caret = input ? input.selectionStart : null;
      dlg.innerHTML = glossaryDialogHtml();
      var nextInput = dlg.querySelector(".gloss-input");
      if (nextInput) {
        nextInput.focus();
        if (caret !== null) {
          try { nextInput.setSelectionRange(caret, caret); } catch (e) { /* noop */ }
        }
      }
    }
  }

  function completionDialogHtml(state) {
    var mode = state.mode;
    var objectives = CG.state.objectivesForMode(mode);
    var quizQuestions = CG.quiz.questionsFor(mode);
    var starMeta = CG.state.computeStars(mode, state);
    var quizScore = CG.quiz.score(quizQuestions, state.quiz);
    var objectivesDone = objectives.filter(function (o) { return state.progress[o.id] && state.progress[o.id].done; }).length;

    // R8: evidence-derived focus areas (same contract as the framework lab).
    var focusAreas = CG.state.computeFocusAreas(mode, state, quizQuestions);
    var focusAreasHtml = focusAreas
      .map(function (f) {
        return (
          '<li class="focus-item">' +
          icon("target", "icon-xs focus-icon") +
          "<span><span class='focus-area'>" +
          esc(f.area) +
          "</span><span class='focus-detail'>" +
          esc(f.detail) +
          "</span></span></li>"
        );
      })
      .join("");

    var stars = [1, 2, 3]
      .map(function (i) {
        return '<span class="star ' + (i <= starMeta.stars ? "lit" : "") + '">' + icon("star", "icon-lg", true) + "</span>";
      })
      .join("");
    var starMsg =
      starMeta.stars === 3
        ? "Flawless audit: near-perfect first-attempt accuracy with minimal hints."
        : starMeta.stars === 2
          ? "Strong audit: solid accuracy — a few checks needed a second pass."
          : "Certified complete: every objective passed. Re-run for a cleaner board.";

    var stats = [
      { k: "objectives", v: objectivesDone + "/" + objectives.length },
      { k: "quiz", v: quizScore + "/" + quizQuestions.length },
      { k: "first-attempt", v: Math.round(starMeta.firstTryRate * 100) + "%" },
      { k: "hints used", v: String(starMeta.hints) },
    ]
      .map(function (s) {
        return (
          '<div class="stat-box"><p class="stat-value">' +
          esc(s.v) +
          '</p><span class="stat-label">' +
          esc(s.k) +
          "</span></div>"
        );
      })
      .join("");

    var recap = CG.PILLAR_ORDER.map(function (p) {
      var list = objectives.filter(function (o) { return o.pillar === p; });
      if (list.length === 0) return "";
      return (
        "<div>" +
        CG.ui.pillarBadge(p) +
        '<ul class="recap-list">' +
        list
          .map(function (o) {
            return (
              "<li>" +
              icon("circle-check-big", "icon-xs ok-icon") +
              "<span><span class='recap-id'>" +
              esc(o.id) +
              "</span> " +
              esc(o.title) +
              "</span></li>"
            );
          })
          .join("") +
        "</ul></div>"
      );
    }).join("");

    var nextSteps = CG.DEBRIEF.nextSteps
      .map(function (n) {
        return '<li class="takeaway"><span class="bullet-dot bg-primary" aria-hidden="true"></span>' + esc(n) + "</li>";
      })
      .join("");
    var links = CG.DEBRIEF.links
      .map(function (l) {
        return (
          '<a href="' +
          esc(l.url) +
          '" target="_blank" rel="noopener noreferrer" class="mini-link">' +
          esc(l.label) +
          icon("external-link", "icon-2xs") +
          "</a>"
        );
      })
      .join("");

    return (
      '<div class="dlg-head"><h2 class="dlg-title text-primary" id="comp-title">ASSESSMENT DEBRIEF</h2>' +
      '<p class="dlg-desc" id="comp-desc">' +
      (mode === "medium" ? "Field Orientation" : "Red Cell Audit") +
      " · Northgate Logistics Group (fictional) · CySA+ CS0-003 L1.2</p></div>" +
      '<div class="stars-box"><div class="stars-row" role="img" aria-label="' +
      starMeta.stars +
      ' of 3 stars">' +
      stars +
      "</div>" +
      '<p class="stars-msg">' +
      starMsg +
      "</p>" +
      '<p class="stars-note">stars reward first-attempt accuracy &amp; lean hint use — not speed</p></div>' +
      '<div class="stats-grid">' +
      stats +
      "</div>" +
      '<div class="recap-box focus-box"><span class="console-label text-primary">focus areas · from your own evidence</span>' +
      '<p class="focus-desc">Derived from your checks, hints and missed quiz concepts — study these first.</p>' +
      '<ul class="focus-list">' +
      focusAreasHtml +
      "</ul></div>" +
      '<div class="recap-box"><span class="console-label text-primary">objective recap · by pillar</span><div class="recap-groups">' +
      recap +
      "</div></div>" +
      '<div class="recap-box"><span class="console-label text-primary">what to learn next</span><ul class="stack-sm mt2">' +
      nextSteps +
      '</ul><div class="mini-links">' +
      links +
      "</div></div>" +
      '<div class="dlg-actions spread">' +
      '<button type="button" data-action="completion-reset" class="btn btn-ghost">Reset the lab</button>' +
      '<button type="button" data-action="completion-back" data-autofocus class="btn btn-primary">Back to field notes</button></div>'
    );
  }

  function openCompletionDialog(state) {
    completionOpen = true;
    CG.ui.showDialog({
      name: "completion",
      role: "dialog",
      dismissable: true,
      labelledBy: "comp-title",
      describedBy: "comp-desc",
      cls: "completion-dlg",
      html: completionDialogHtml(state),
    });
  }

  /** Called by ui.js when a dialog was closed via Escape/overlay. */
  function onDialogClosed(name) {
    if (name === "completion") completionOpen = false;
  }

  /* ═══ Render loop ══════════════════════════════════════════════════════ */

  function render() {
    var state = CG.state.getState();
    var app = document.getElementById("app");
    var html = "";

    if (state.phase === "mode" || !state.mode) {
      html =
        '<div class="phase-enter" id="lab-main" tabindex="-1" data-fk="phase:mode">' +
        modeSelectHtml(state) +
        "</div>";
    } else {
      var objectives = CG.state.objectivesForMode(state.mode);
      var currentObj = null;
      for (var i = 0; i < objectives.length; i++) {
        if (objectives[i].id === state.currentObj) { currentObj = objectives[i]; break; }
      }
      if (!currentObj) currentObj = objectives[0] || null;

      var bodyHtml = "";
      if (state.phase === "brief") {
        bodyHtml = briefingHtml(state);
      } else if (state.phase === "core") {
        bodyHtml = knowledgeCoreHtml();
      } else if (state.phase === "work" && currentObj) {
        bodyHtml =
          '<div class="work-grid">' +
          caseRailHtml(state) +
          '<section aria-label="Work surface" class="work-surface">' +
          CG.engines.workSurface(
            currentObj,
            state.mode,
            state,
            state.answers[currentObj.id],
            null,
            state.results[currentObj.id] || null,
            null,
            null
          ) +
          "</section>" +
          '<div class="intel-sticky">' +
          intelRailHtml(state, currentObj) +
          "</div></div>";
      } else if (state.phase === "quiz") {
        bodyHtml = CG.quiz.render(state.mode, CG.quiz.questionsFor(state.mode), state.quiz);
      } else if (state.phase === "debrief") {
        bodyHtml = debriefHtml();
      }

      html =
        '<div class="phase-enter" data-fk="phase:' +
        state.phase +
        '"><div class="lab-column">' +
        hudHtml(state) +
        '<main id="lab-main" tabindex="-1" class="lab-main">' +
        bodyHtml +
        "</main></div></div>";
    }

    CG.ui.renderWithFocus(app, html);

    if (lastPhase !== null && lastPhase !== state.phase) {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    lastPhase = state.phase;

    // Completion dialog lives outside the phase render; refresh if open
    if (completionOpen && !CG.ui.dialogIsOpen("completion")) {
      openCompletionDialog(state);
    }
  }

  /* ═══ State actions ════════════════════════════════════════════════════ */

  function selectMode(m) {
    CG.state.update(function (s) {
      var base = Object.assign({}, s, { mode: m, phase: "brief", briefSeen: false, coreSeen: false });
      var withAnswers = CG.state.ensureAnswers(base, m);
      return Object.assign(withAnswers, { currentObj: CG.state.firstIncompleteUnlocked(m, withAnswers) });
    });
  }

  function resume() {
    CG.state.update(function (s) {
      return s.mode
        ? Object.assign(CG.state.ensureAnswers(s, s.mode), { phase: CG.state.resumePhase(s) })
        : s;
    });
  }

  function goToPhase(p) {
    CG.state.update(function (s) {
      if (!s.mode) return s;
      var objectives = CG.state.objectivesForMode(s.mode);
      if (p === "quiz" && !objectives.every(function (o) { return s.progress[o.id] && s.progress[o.id].done; })) return s;
      if (p === "debrief" && !s.quiz.done) return s;
      if ((p === "work" || p === "core") && !s.briefSeen) return s;
      return Object.assign({}, s, { phase: p });
    });
  }

  function selectObjective(id) {
    CG.state.update(function (s) { return Object.assign({}, s, { currentObj: id }); });
  }

  function setAnswer(objId, a) {
    CG.state.update(function (s) {
      // R2 one-shot: frozen objectives (passed, or checked during this visit)
      // refuse answer edits. isFrozen is the single choke point shared with the
      // dispatcher guard in handleAction.
      if (CG.engines.isFrozen(objId)) return s;
      var answers = Object.assign({}, s.answers);
      answers[objId] = a;
      return Object.assign({}, s, { answers: answers });
    });
  }

  function onHint(objId, tier) {
    CG.state.update(function (s) {
      var prev = s.progress[objId] || { done: false, attempts: 0, firstTry: false, hints: 0 };
      var progress = Object.assign({}, s.progress);
      progress[objId] = Object.assign({}, prev, { hints: Math.max(prev.hints || 0, tier) });
      return Object.assign({}, s, { progress: progress });
    });
  }

  function onCheck(objId) {
    var state = CG.state.getState();
    var objectives = CG.state.objectivesForMode(state.mode);
    var obj = null;
    for (var i = 0; i < objectives.length; i++) if (objectives[i].id === objId) obj = objectives[i];
    if (!obj) return;
    var outcome = CG.checkObjective(obj, state.answers[objId]);
    CG.state.update(function (s) {
      var prev = s.progress[objId];
      var already = prev ? !!prev.done : false;
      var progress = Object.assign({}, s.progress);
      progress[objId] = {
        done: already || outcome.pass,
        attempts: ((prev && prev.attempts) || 0) + 1,
        firstTry: already ? !!(prev && prev.firstTry) : outcome.pass && !(prev && prev.attempts),
        hints: (prev && prev.hints) || 0,
      };
      var results = Object.assign({}, s.results);
      results[objId] = outcome;
      return Object.assign({}, s, { progress: progress, results: results });
    });
  }

  function goNext() {
    var state = CG.state.getState();
    if (!state.mode) return;
    var nextId = CG.state.firstIncompleteUnlocked(state.mode, state);
    if (nextId) selectObjective(nextId);
  }

  /** R2 one-shot: after a failed check the answer is locked, so "Next
      objective" advances to the objective directly AFTER the current one in
      Case Rail order (unconditionally — the failed objective stays available
      from the rail for a retry visit). */
  function advancePast() {
    var state = CG.state.getState();
    if (!state.mode) return;
    var list = CG.state.objectivesForMode(state.mode);
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === state.currentObj) {
        if (i + 1 < list.length) selectObjective(list[i + 1].id);
        return;
      }
    }
  }

  function handleReset() {
    CG.state.clearState();
    CG.state.setState(CG.state.initialState());
    completionOpen = false;
    lastPhase = null;
  }

  /* ═══ Event delegation ═════════════════════════════════════════════════ */

  /** Engine actions that mutate or steer an answer — all refused while the
      objective is frozen (R2 one-shot). Navigation/hints/dialogs stay live. */
  var ENGINE_EDIT_ACTIONS = {
    "choose-toggle": 1,
    "sort-tile": 1,
    "sort-place": 1,
    "sort-remove": 1,
    "match-left": 1,
    "match-right": 1,
    "match-unlink": 1,
    "cls-cat": 1,
    "cls-type": 1,
    "cls-not": 1,
    "ev-pick": 1,
    "reg-pick": 1,
    "depth-toggle": 1,
    "order-move": 1,
  };

  function currentObjOf(state) {
    var objectives = CG.state.objectivesForMode(state.mode);
    for (var i = 0; i < objectives.length; i++) if (objectives[i].id === state.currentObj) return objectives[i];
    return objectives[0] || null;
  }

  function handleAction(action, arg, target) {
    var state = CG.state.getState();

    // R2 one-shot choke point: while the current objective is frozen (passed,
    // or checked during this visit) every engine-edit action is inert.
    if (ENGINE_EDIT_ACTIONS[action] && CG.engines.isFrozen(state.currentObj)) return;

    switch (action) {
      /* mode + navigation */
      case "mode-select": return selectMode(arg);
      case "resume": return resume();
      case "goto-phase": return goToPhase(arg);
      case "brief-next":
        CG.state.update(function (s) { return Object.assign({}, s, { phase: "core", briefSeen: true }); });
        return;
      case "core-next":
        CG.state.update(function (s) { return Object.assign({}, s, { phase: "work", coreSeen: true }); });
        return;
      case "quiz-gate": return goToPhase("quiz");
      case "quiz-finish":
        CG.state.update(function (s) { return Object.assign({}, s, { phase: "debrief" }); });
        return;

      /* work phase */
      case "rail-select": return selectObjective(arg);
      case "next-objective": return goNext();
      case "advance-objective": return advancePast();
      case "run-check":
        // R2 one-shot: mark the visit frozen BEFORE the state update so the
        // synchronous re-render inside onCheck already renders the lock.
        CG.engines.markChecked(state.currentObj);
        return onCheck(state.currentObj);

      /* engines */
      case "choose-toggle": {
        var obj = currentObjOf(state);
        var p = obj.payload;
        var sel = (state.answers[obj.id] || []).slice();
        if (p.multi) {
          setAnswer(obj.id, sel.includes(arg) ? sel.filter(function (x) { return x !== arg; }) : sel.concat([arg]));
        } else {
          setAnswer(obj.id, [arg]);
        }
        return;
      }
      case "sort-tile": {
        CG.engines.ensureEngineUi(state.currentObj);
        var su = CG.engines.ensureEngineUi(state.currentObj);
        su.selTile = su.selTile === arg ? null : arg;
        return render();
      }
      case "sort-place": {
        var so = CG.engines.ensureEngineUi(state.currentObj);
        if (!so.selTile) return;
        var sObj = currentObjOf(state);
        var assign = Object.assign({}, state.answers[sObj.id]);
        assign[so.selTile] = arg;
        so.selTile = null;
        setAnswer(sObj.id, assign);
        return;
      }
      case "sort-remove": {
        var srObj = currentObjOf(state);
        var sa = Object.assign({}, state.answers[srObj.id]);
        sa[arg] = null;
        setAnswer(srObj.id, sa);
        return;
      }
      case "match-left": {
        var mo = CG.engines.ensureEngineUi(state.currentObj);
        mo.selLeft = mo.selLeft === arg ? null : arg;
        return render();
      }
      case "match-right": {
        var mr = CG.engines.ensureEngineUi(state.currentObj);
        if (!mr.selLeft) return;
        var mmObj = currentObjOf(state);
        var pairs = Object.assign({}, state.answers[mmObj.id]);
        pairs[mr.selLeft] = arg;
        mr.selLeft = null;
        setAnswer(mmObj.id, pairs);
        return;
      }
      case "match-unlink": {
        var muObj = currentObjOf(state);
        var mp = Object.assign({}, state.answers[muObj.id]);
        mp[arg] = null;
        setAnswer(muObj.id, mp);
        return;
      }
      case "cls-cat":
      case "cls-type": {
        var parts = arg.split(":");
        var cObj = currentObjOf(state);
        var cls = Object.assign({}, state.answers[cObj.id]);
        cls[parts[0]] = Object.assign({}, cls[parts[0]]);
        if (action === "cls-cat") cls[parts[0]].cat = parts[1];
        else cls[parts[0]].type = parts[1];
        setAnswer(cObj.id, cls);
        return;
      }
      case "cls-not": {
        var nObj = currentObjOf(state);
        var nc = Object.assign({}, state.answers[nObj.id]);
        var cur = nc[arg] || { cat: "", type: "" };
        if (cur.cat === "X") nc[arg] = { cat: "", type: "" };
        else nc[arg] = { cat: "X", type: "X" };
        setAnswer(nObj.id, nc);
        return;
      }
      case "ev-pick":
      case "reg-pick": {
        var pr = arg.split(":");
        var prObj = currentObjOf(state);
        var prSel = Object.assign({}, state.answers[prObj.id]);
        prSel[pr[0]] = pr[1];
        setAnswer(prObj.id, prSel);
        return;
      }
      case "depth-toggle": {
        var dObj = currentObjOf(state);
        var picks = (state.answers[dObj.id] || []).slice();
        setAnswer(dObj.id, picks.includes(arg) ? picks.filter(function (x) { return x !== arg; }) : picks.concat([arg]));
        return;
      }
      case "order-move": {
        var om = arg.split(":");
        var i2 = parseInt(om[0], 10);
        var dir = parseInt(om[1], 10);
        var oObj = currentObjOf(state);
        var seq = (state.answers[oObj.id] || []).slice();
        var j = i2 + dir;
        if (j < 0 || j >= seq.length) return;
        var tmp = seq[i2];
        seq[i2] = seq[j];
        seq[j] = tmp;
        setAnswer(oObj.id, seq);
        return;
      }

      /* hints */
      case "hint-reveal": return onHint(state.currentObj, parseInt(arg, 10));
      case "nudge-open": return openNudgeDialog(arg);
      case "nudge-cancel": return CG.ui.closeDialog(true);
      case "nudge-confirm":
        CG.ui.closeDialog(false);
        return onHint(arg, 1);

      /* dialogs */
      case "open-glossary": return openGlossaryDialog();
      case "glossary-close": return CG.ui.closeDialog(true);
      case "open-reset": return openResetDialog();
      case "reset-cancel": return CG.ui.closeDialog(true);
      case "reset-confirm":
        CG.ui.closeDialog(false);
        return handleReset();
      case "open-completion": return openCompletionDialog(state);
      case "completion-back":
        completionOpen = false;
        return CG.ui.closeDialog(false);
      case "completion-reset":
        completionOpen = false;
        CG.ui.closeDialog(false);
        return handleReset();

      /* quiz */
      case "quiz-pick": return CG.quiz.pick(state, arg);
      case "quiz-check": return CG.quiz.check(state);
      case "quiz-next": return CG.quiz.next(state);
    }
  }

  document.addEventListener("click", function (e) {
    var el = e.target.closest ? e.target.closest("[data-action]") : null;
    if (!el) return;
    var action = el.getAttribute("data-action");
    if (!action) return;
    var arg = el.getAttribute("data-arg") || "";
    handleAction(action, arg, el);
  });

  document.addEventListener("input", function (e) {
    var el = e.target;
    if (el.getAttribute && el.getAttribute("data-action-input") === "glossary-search") {
      glossaryQuery = el.value;
      refreshGlossaryDialog();
    }
  });

  /* ═══ Bootstrap ════════════════════════════════════════════════════════ */

  CG.app = { dialogClosed: onDialogClosed };

  function boot() {
    storageOk = CG.state.storageAvailable();
    CG.state.setState(CG.state.readInitialState(), true);
    CG.state.subscribe(function () {
      CG.state.saveState(CG.state.getState());
      render();
    });
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
