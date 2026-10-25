// ─── Threat Hunt Expedition — bootstrap, views & event wiring ────────────────
// Static port of HuntLab.tsx (+ Basecamp, Briefing, FieldManual, Expedition,
// ObjectivesRail, the six stations, Debrief and Completion dialogs).
// Behavior contract: same phases, same validation, same persistence semantics,
// same reset/mode-switch confirms as the original lab.
/* eslint-disable */

window.App = (function () {
  "use strict";

  var UI = window.HuntUI;
  var St = window.HuntState;
  var Obj = window.HuntObjectives;
  var D = window.HuntData;
  var Q = window.HuntQuiz;
  var esc = UI.esc;
  var icon = UI.icon;

  var S = null; // LabState
  var pendingMode = "medium";
  var ui = {
    station: "satchel",
    mobileLedgerOpen: false,
    selectedContact: null, // scanner event id
    openBulletin: null, // satchel accordion (one at a time, starts closed)
    openObjectives: {}, // rail card id -> true
  };
  var root = null;

  var BENCHES = {
    cycleOrder: { label: "Intelligence cycle — in order", pool: D.intelCyclePhases },
    killChain: { label: "Cyber Kill Chain — in order", pool: D.killChainPhases },
  };

  // ── state ops (mirror HuntLab.tsx) ─────────────────────────────────────────

  function commit() {
    St.saveState(S);
  }

  function setPhase(phase, extra) {
    var visited = S.visitedPhases.slice();
    if (visited.indexOf(phase) === -1) visited.push(phase);
    if (extra) {
      Object.keys(extra).forEach(function (k) { S[k] = extra[k]; });
    }
    S.phase = phase;
    S.visitedPhases = visited;
    commit();
    render();
  }

  function resetOpsUi() {
    ui.station = "satchel";
    ui.mobileLedgerOpen = false;
    ui.selectedContact = null;
    ui.openBulletin = null;
    ui.openObjectives = {};
  }

  // merge a patch into the environment state. Object-valued (Record) fields
  // are KEY-MERGED so two updates can never silently drop each other's keys;
  // arrays and scalars replace. (Same rule as the original updateEnv.)
  function updateEnv(patch) {
    var env = Object.assign({}, S.env);
    Object.keys(patch).forEach(function (k) {
      var v = patch[k];
      var cur = env[k];
      if (
        v && typeof v === "object" && !Array.isArray(v) &&
        cur && typeof cur === "object" && !Array.isArray(cur)
      ) {
        env[k] = Object.assign({}, cur, v);
      } else {
        env[k] = v;
      }
    });
    S.env = env;
    commit();
  }

  function startMode(mode) {
    var envTouched = JSON.stringify(S.env) !== JSON.stringify(St.emptyEnv());
    var hasProgress =
      Object.keys(S.objectives).some(function (k) { return S.objectives[k] && S.objectives[k].done; }) ||
      Object.keys(S.quiz).length > 0 ||
      envTouched;
    pendingMode = mode;
    if (hasProgress) {
      openConfirm("start");
    } else {
      S = St.freshState(mode);
      resetOpsUi();
      commit();
      render();
    }
  }

  function checkObjective(id) {
    var def = Obj.objectivesForMode(S.mode || "medium").filter(function (o) { return o.id === id; })[0];
    if (!def) return;
    var result = def.check(S.env);
    var prev = S.objectives[id] || St.emptyProgress();
    var wasDone = prev.done;
    S.objectives[id] = {
      done: prev.done || result.pass,
      attempts: prev.attempts + 1,
      failedChecks: result.pass ? prev.failedChecks : prev.failedChecks + 1,
      hintsUsed: prev.hintsUsed,
      nudgeUsed: prev.nudgeUsed,
      lastPass: result.pass,
      lastFeedback: result.feedback,
    };
    commit();
    refreshOpsChrome();
  }

  function useHint(id) {
    var prev = S.objectives[id] || St.emptyProgress();
    var isHard = S.mode === "hard";
    S.objectives[id] = Object.assign({}, prev, {
      hintsUsed: isHard ? 1 : Math.min(prev.hintsUsed + 1, 3),
      nudgeUsed: isHard ? true : prev.nudgeUsed,
    });
    commit();
    fillRail();
    fillSpotlight();
    fillAdvance();
  }

  function resetAll() {
    St.clearState();
    S = St.freshState();
    resetOpsUi();
    UI.closeModal();
    render();
  }

  function revealedFor() {
    if (!S.mode) return false;
    if (S.mode === "medium") return !!(S.objectives["OBJ-M6"] && S.objectives["OBJ-M6"].done);
    return !!(S.objectives["OBJ-H1"] && S.objectives["OBJ-H1"].done);
  }

  function stats() {
    return St.computeStats(S);
  }

  // ── shared fragments ───────────────────────────────────────────────────────

  function modeName(mode) { return mode === "hard" ? "Deep Range" : "Guided Patrol"; }

  function mastheadHtml() {
    var st = stats();
    var steps = UI.PHASE_STEPS.map(function (step) {
      var visited = S.visitedPhases.indexOf(step.id) !== -1;
      var active = S.phase === step.id;
      var cls = "step-btn" + (active ? " is-active" : visited ? " is-visited" : " is-locked");
      return (
        '<li><button type="button" class="' + cls + '" data-action="set-phase" data-phase="' + step.id + '" data-stepper="1"' +
        (visited ? "" : " disabled") + (active ? ' aria-current="page"' : "") + ">" + step.label + "</button></li>"
      );
    }).join("");
    return (
      '<header class="masthead">' +
      '<div class="masthead-inner">' +
      '<div class="masthead-brand">' + icon("compass", "h-5 w-5 amber-txt") +
      '<div class="brand-lines"><p class="brand-title">Threat Hunt Expedition</p>' +
      '<p class="brand-sub">CySA+ 2.2 · ' + modeName(S.mode) + "</p></div></div>" +
      '<nav aria-label="Expedition phases" class="stepper"><ul class="stepper-list hunt-scroll">' + steps + "</ul></nav>" +
      '<div class="masthead-actions">' +
      (S.completedAt
        ? '<button type="button" class="btn btn-ghost btn-summary" data-action="open-summary">Summary</button>'
        : "") +
      UI.progressRing(st.done, st.total, 38) +
      '<button type="button" class="btn btn-outline btn-reset" data-action="request-reset">' +
      icon("rotate-ccw", "h-3 w-3 icon-mr") + " Reset</button>" +
      "</div></div></header>"
    );
  }

  // ── basecamp ───────────────────────────────────────────────────────────────

  function modeCard(o) {
    var accent = o.accent === "amber" ? "amber" : "rust";
    var points = o.points.map(function (p) {
      return '<li><span class="mode-dot" aria-hidden="true"></span>' + esc(p) + "</li>";
    }).join("");
    return (
      '<section class="mode-card mode-' + accent + '" aria-label="' + esc(o.title) + " mode: " + esc(o.blurb) + '">' +
      '<div class="mode-card-head">' + icon(o.icon, "h-6 w-6 mode-icon") +
      '<span class="mode-badge">' + esc(o.badge) + "</span></div>" +
      '<h3 class="mode-title">' + esc(o.title) + "</h3>" +
      '<p class="mode-blurb">' + esc(o.blurb) + "</p>" +
      '<ul class="mode-points">' + points + "</ul>" +
      '<p class="mode-time">' + esc(o.time) + "</p>" +
      '<button type="button" class="btn btn-lg ' + (accent === "amber" ? "btn-primary" : "btn-rust") + ' btn-block" data-action="start-mode" data-mode="' + o.mode + '">' +
      "Set out — " + esc(o.title) + "</button></section>"
    );
  }

  function basecampHtml() {
    var hasSave = !!S.mode;
    var saveHtml = "";
    if (hasSave) {
      saveHtml =
        '<div class="save-card" role="status">' +
        '<div class="save-card-left">' + icon("scroll-text", "h-5 w-5 amber-txt") +
        "<div><p class=\"save-title\">Expedition in progress</p>" +
        '<p class="save-sub">Saved ' + modeName(S.mode) + " run · at " + (UI.PHASE_LABEL[S.visitedPhases.indexOf("ops") !== -1 ? "ops" : "briefing"]) +
        ". Resume where you left off.</p></div></div>" +
        '<div class="save-actions">' +
        '<button type="button" class="btn btn-sm btn-primary" data-action="resume">Resume</button>' +
        '<button type="button" class="btn btn-sm btn-outline btn-outline-stone" data-action="discard">' +
        icon("rotate-ccw", "h-3.5 w-3.5 icon-mr") + " Discard</button></div></div>";
    }
    return (
      '<div class="container-basecamp">' +
      '<header class="bc-head">' +
      '<p class="bc-eyebrow">CompTIA CySA+ CS0-003 · Lesson 2.2 · Interactive Practice Lab</p>' +
      '<h1 class="bc-title">The Threat Hunt Expedition</h1>' +
      '<p class="bc-blurb">Exploring threat-hunting concepts — a hands-on field exercise. You are the hunter on a fictional utility&#39;s SOC team: sweep telemetry, classify what you find, navigate by ATT&amp;CK · Kill Chain · Diamond, and share what you learn.</p>' +
      '<div class="bc-tag-row">' + UI.syntheticTag() + "</div>" +
      "</header>" +
      saveHtml +
      '<h2 class="routes-title">Choose your route</h2>' +
      '<div class="route-grid">' +
      modeCard({
        mode: "medium", icon: "binoculars", title: "Guided Patrol", badge: "Medium",
        blurb: "Learn the craft step by step.", accent: "amber",
        points: [
          "12 granular objectives, introduced in order with context",
          "Where-to-look jumps between stations — never lost",
          "3-tier hints on every objective; wrong answers explain themselves — nothing is a dead end",
          "Field exam of 7 concept questions with explanations after each",
          "Tolerant checks: every wrong answer comes back with a reason and a way forward",
        ],
        time: "≈ 45–60 min · Bloom: Understand → Apply",
      }) +
      modeCard({
        mode: "hard", icon: "mountain", title: "Deep Range", badge: "Hard",
        blurb: "Prove it under noise and pressure.", accent: "rust",
        points: [
          "9 broad multi-step challenges across the whole estate",
          "Noisy evidence with red herrings — three of them are lying to you",
          "No where-to-look; at most one optional Field Nudge per objective, at a score cost",
          "Strict validation: exact IDs, exact sequences, near-misses rejected with rationale",
          "Field exam of 8 scenario items requiring analysis, not recall",
        ],
        time: "≈ 60–90 min · Bloom: Analyze → Evaluate → Create",
      }) +
      "</div>" +
      '<div class="bc-disclaimers">' +
      '<p class="bc-fine">' + icon("compass", "h-3.5 w-3.5") + " Every organization, actor, IP and domain in this lab is fictional.</p>" +
      '<p class="bc-fine">' + icon("footprints", "h-3.5 w-3.5") + " Progress auto-saves in your browser; a labeled RESET restores pristine state at any time.</p>" +
      "</div></div>"
    );
  }

  // ── briefing ───────────────────────────────────────────────────────────────

  function briefingHtml() {
    var sc = D.scenario;
    var sitrep = sc.sitrep.map(function (p) {
      return '<p class="sitrep-p">' + icon("radio", "h-4 w-4 parch-icon") + "<span>" + esc(p) + "</span></p>";
    }).join("");
    var mission = sc.mission.map(function (m, i) {
      return '<li class="mission-li"><span class="mission-num">0' + (i + 1) + "</span>" + esc(m) + "</li>";
    }).join("");
    return (
      '<div class="container-briefing"><div class="parchment parchment-doc">' +
      '<div class="parch-head-row"><p class="parch-label">' + icon("file-text", "h-4 w-4") +
      " Aldervale Water &amp; Power — SOC · SITREP 001</p>" +
      '<p class="parch-label">' + (S.mode === "hard" ? "Route: Deep Range" : "Route: Guided Patrol") + "</p></div>" +
      '<h1 class="parch-title">Situation report: the quiet before</h1>' +
      '<div class="sitrep-body">' +
      '<p class="org-box">' + icon("landmark", "h-4 w-4 parch-icon") + "<span><strong>" + esc(sc.orgBlurb) + "</strong></span></p>" +
      sitrep + "</div>" +
      '<div class="mission-box"><h2 class="mission-title">' + icon("shield-alert", "h-4 w-4") + " Mission orders</h2>" +
      '<ul class="mission-list">' + mission + "</ul></div>" +
      '<p class="parch-note">' + esc(sc.certNote) + " All names, hosts, addresses and domains in this exercise are fictional training data.</p>" +
      '<div class="briefing-actions">' +
      '<button type="button" class="btn btn-ghost parch-ghost" data-action="set-phase" data-phase="basecamp">Back to basecamp</button>' +
      '<button type="button" class="btn btn-dark btn-lg" data-action="set-phase" data-phase="manual">Read the field manual ' +
      icon("arrow-right", "h-4 w-4 icon-ml") + "</button>" +
      "</div></div></div>"
    );
  }

  // ── field manual ───────────────────────────────────────────────────────────

  var KEY_TERMS = {
    "m-approaches": ["g-struct", "g-unstruct", "g-entity"],
    "m-intel": ["g-cycle", "g-products", "g-sources", "g-ioc", "g-ioa", "g-ttp", "g-stix"],
    "m-frameworks": ["g-attack", "g-killchain", "g-diamond"],
  };

  function manualHtml() {
    var cover =
      '<header class="parchment manual-cover">' +
      '<div class="parch-head-row"><p class="parch-label">' + icon("book-open", "h-4 w-4") +
      " Aldervale kit · Book C2 · Knowledge core</p>" +
      '<p class="parch-label">' + (S.mode === "hard" ? "Route: Deep Range" : "Route: Guided Patrol") + "</p></div>" +
      '<h1 class="manual-title">The threat hunter&#39;s field manual</h1>' +
      '<p class="manual-intro">Six short chapters, carried like a folded map: what hunting is, how observations are classified, the approaches and the hypothesis loop, the intelligence cycle, the navigation instruments, and the actors you are tracking. Read it once here — then let the trail test you on it.</p>' +
      '<p class="manual-meta">6 chapters · 1 glossary appendix · CompTIA CySA+ CS0-003 · Lesson 2.2</p></header>';

    var chapters = D.manualSections.map(function (s, i) {
      var keyTerms = KEY_TERMS[s.id];
      var paras = s.paragraphs.map(function (p) { return '<p class="chapter-p">' + esc(p) + "</p>"; }).join("");
      var bullets = s.bullets
        ? '<ul class="chapter-bullets">' + s.bullets.map(function (b) {
            return '<li><span class="bullet-dot" aria-hidden="true"></span>' + esc(b) + "</li>";
          }).join("") + "</ul>"
        : "";
      var termsCard = keyTerms
        ? '<div class="keyterms-card"><p class="keyterms-label">Key terms in this chapter — tap a term for its field definition</p>' +
          '<div class="keyterms-row">' + keyTerms.map(function (id) {
            return '<span class="keyterm-chip">' + UI.term(id) + "</span>";
          }).join("") + "</div></div>"
        : "";
      return (
        '<li><article class="parchment chapter" aria-labelledby="manual-' + s.id + '" style="animation-delay:' +
        Math.min(i * 50, 300) + 'ms">' +
        '<div class="chapter-head"><span class="parch-label">' + esc(s.kicker) + '</span><span class="chapter-num" aria-hidden="true">' +
        String(i + 1).padStart(2, "0") + "</span></div>" +
        '<h2 class="chapter-title" id="manual-' + s.id + '">' + esc(s.title) + "</h2>" +
        '<div class="chapter-body">' + paras + "</div>" + bullets + "</article>" + termsCard + "</li>"
      );
    }).join("");

    var glossary = D.glossary.map(function (g) {
      return '<div class="glossary-item"><dt class="glossary-term">' + esc(g.term) + '</dt><dd class="glossary-def">' + esc(g.def) + "</dd></div>";
    }).join("");

    return (
      '<div class="container-manual" aria-label="Field manual — threat-hunting knowledge core">' +
      cover +
      '<ol class="chapter-list">' + chapters + "</ol>" +
      '<section class="parchment glossary-section" aria-labelledby="manual-glossary">' +
      '<div class="chapter-head"><span class="parch-label">Appendix A · Reference</span>' +
      '<span class="parch-label">' + D.glossary.length + " entries</span></div>" +
      '<h2 class="chapter-title" id="manual-glossary">Field glossary</h2>' +
      '<p class="glossary-sub">Every term the exam and the trail may use — one line each, carried for the whole expedition.</p>' +
      '<dl class="glossary-grid">' + glossary + "</dl></section>" +
      '<div class="panel manual-cta"><div><p class="manual-cta-kicker">End of manual · kit check complete</p>' +
      '<p class="manual-cta-line">Satchel, slate, scanner, instruments, ledger, radio — all packed.</p></div>' +
      '<button type="button" class="btn btn-primary btn-lg btn-cta" data-action="set-phase" data-phase="ops">Kitted up — hit the trail ' +
      icon("arrow-right", "h-4 w-4 icon-ml") + "</button></div>" +
      '<p class="manual-fineprint">All content is fictional training data.</p></div>'
    );
  }

  // ── expedition: rail ───────────────────────────────────────────────────────

  function railHtml() {
    var defs = Obj.objectivesForMode(S.mode);
    var doneCount = defs.filter(function (d) { return S.objectives[d.id] && S.objectives[d.id].done; }).length;
    var pillars = [];
    defs.forEach(function (d) { if (pillars.indexOf(d.pillar) === -1) pillars.push(d.pillar); });
    var sections = pillars.map(function (pillar) {
      var cards = defs.filter(function (d) { return d.pillar === pillar; }).map(railCard).join("");
      return (
        '<section aria-label="' + esc(UI.PILLAR_META[pillar].label) + ' objectives" class="rail-pillar">' +
        '<p class="rail-pillar-label">' + UI.PILLAR_META[pillar].short + " · " + UI.PILLAR_META[pillar].label + "</p>" +
        cards + "</section>"
      );
    }).join("");
    return (
      '<div class="rail">' +
      '<div class="rail-head"><h2>Field ledger — objectives</h2><span class="rail-count">' + doneCount + "/" + defs.length + "</span></div>" +
      sections + "</div>"
    );
  }

  function railCard(def) {
    var prog = S.objectives[def.id];
    var open = !!ui.openObjectives[def.id];
    var done = !!(prog && prog.done);
    var attempted = (prog ? prog.attempts : 0) > 0;
    var hintTier = prog ? prog.hintsUsed : 0;
    var nudgeUsed = !!(prog && prog.nudgeUsed);
    var isHard = S.mode === "hard";

    var stateCls = done ? " done" : attempted ? " attempted" : " tint-" + def.pillar;
    var stateIcon = done
      ? icon("circle-check-big", "h-[18px] w-[18px] rail-ico rail-ico-done")
      : attempted
        ? icon("alert-triangle", "h-[18px] w-[18px] rail-ico rail-ico-attempted")
        : icon("circle", "h-[18px] w-[18px] rail-ico rail-ico-todo");

    // actions
    var checkBtn =
      '<button type="button" class="btn btn-sm btn-check' + (done ? " is-done" : "") + '" data-action="check-obj" data-obj="' + def.id + '"' +
      (done ? " disabled" : "") + ">" + icon("crosshair", "h-3.5 w-3.5 icon-mr") + (done ? "Verified" : "Check results") + "</button>";
    var hintBtn = "";
    if (!isHard) {
      hintBtn =
        '<button type="button" class="btn btn-sm btn-outline btn-hint" data-action="hint-obj" data-obj="' + def.id + '"' +
        (done || hintTier >= def.hints.length ? " disabled" : "") + ">" +
        icon("lightbulb", "h-3.5 w-3.5 amber-txt icon-mr") + "Hint " + Math.min(hintTier + 1, def.hints.length) + "/3</button>";
    }
    var nudgeBtn = "";
    if (isHard && !nudgeUsed && !done) {
      nudgeBtn =
        '<button type="button" class="btn btn-sm btn-outline btn-nudge" data-action="hint-obj" data-obj="' + def.id + '">' +
        icon("alert-triangle", "h-3.5 w-3.5 icon-mr") + "Field nudge (costs stars)</button>";
    }
    var jumpBtn = "";
    if (!isHard && def.station !== ui.station) {
      jumpBtn =
        '<button type="button" class="btn btn-sm btn-ghost btn-jump" data-action="jump-station" data-station="' + def.station + '">' +
        'Take me there ' + icon("arrow-right", "h-3.5 w-3.5 icon-ml") + "</button>";
    }

    // hint texts
    var hintsHtml = "";
    if (hintTier > 0) {
      var shown = def.hints.slice(0, isHard ? 1 : hintTier);
      hintsHtml =
        '<div class="hint-stack">' + shown.map(function (hh, i) {
          return (
            '<p class="hint-box"><span class="hint-tag">' + (isHard ? "nudge" : "hint " + (i + 1)) + " ·</span>" + esc(hh) + "</p>"
          );
        }).join("") + "</div>";
    }

    // check feedback
    var fbHtml = "";
    if (prog && prog.lastFeedback) {
      fbHtml =
        '<div class="fb-box ' + (prog.lastPass ? "fb-pass" : "fb-fail") + '" role="status" aria-live="polite">' +
        '<span class="fb-tag">' + (prog.lastPass ? "✓ verified" : "✗ not yet") + " ·</span>" + esc(prog.lastFeedback) + "</div>";
    }

    var meta =
      '<p class="rail-meta">attempts: ' + (prog ? prog.attempts : 0) + " · hints: " + hintTier +
      (isHard && nudgeUsed ? " · nudge spent" : "") + "</p>";

    return (
      '<article class="rail-card' + stateCls + '">' +
      '<button type="button" class="rail-card-btn" data-action="toggle-obj" data-obj="' + def.id + '" aria-expanded="' + open + '">' +
      stateIcon +
      '<span class="rail-card-lines"><span class="rail-card-top"><span class="rail-id">' + def.id + "</span>" +
      '<span class="rail-wp">' + UI.STATION_META[def.station].waypoint + "</span></span>" +
      '<span class="rail-title' + (done ? " is-done" : "") + '">' + esc(def.title) + "</span></span>" +
      '<span class="rail-chevron' + (open ? " is-open" : "") + '" aria-hidden="true">' + icon("chevron-down", "h-3.5 w-3.5") + "</span>" +
      "</button>" +
      (open
        ? '<div class="rail-card-body"><p class="rail-detail">' + esc(def.detail) + "</p>" +
          '<div class="rail-actions">' + checkBtn + hintBtn + nudgeBtn + jumpBtn + "</div>" +
          hintsHtml + fbHtml + meta + "</div>"
        : "") +
      "</article>"
    );
  }

  function fillRail() {
    var html = railHtml();
    var d = document.getElementById("rail-desktop-content");
    var m = document.getElementById("rail-mobile-content");
    if (d) d.innerHTML = html;
    if (m) m.innerHTML = html;
    // mobile ledger toggle label count + chevron
    var defs = Obj.objectivesForMode(S.mode);
    var doneCount = defs.filter(function (x) { return S.objectives[x.id] && S.objectives[x.id].done; }).length;
    var lbl = document.getElementById("ledger-count-label");
    if (lbl) lbl.textContent = doneCount + "/" + defs.length;
    var ch = document.getElementById("ledger-chevron");
    if (ch) ch.classList.toggle("is-open", ui.mobileLedgerOpen);
    var body = document.getElementById("ledger-collapsible");
    if (body) {
      if (ui.mobileLedgerOpen) body.classList.add("open");
      else body.classList.remove("open");
      body.setAttribute("aria-hidden", ui.mobileLedgerOpen ? "false" : "true");
    }
  }

  function fillSpotlight() {
    var el = document.getElementById("spotlight-zone");
    if (!el) return;
    var defs = Obj.objectivesForMode(S.mode);
    var doneCount = defs.filter(function (d) { return S.objectives[d.id] && S.objectives[d.id].done; }).length;
    var spotlight = null;
    for (var i = 0; i < defs.length; i++) {
      if (!(S.objectives[defs[i].id] && S.objectives[defs[i].id].done)) { spotlight = defs[i]; break; }
    }
    var inner = "";
    if (S.mode === "medium" && spotlight) {
      inner =
        '<div class="spotlight" aria-label="Current objective spotlight">' +
        '<div class="spotlight-left">' + icon("target", "h-4 w-4 amber-txt spotlight-ico") +
        '<div><p class="spotlight-kicker">Next waypoint · ' + spotlight.id + " · " + UI.STATION_META[spotlight.station].label + "</p>" +
        '<p class="spotlight-title">' + esc(spotlight.title) + "</p></div></div>" +
        '<button type="button" class="btn btn-primary btn-sm btn-take" data-action="jump-station" data-station="' + spotlight.station + '">Take me there</button></div>';
    } else if (S.mode === "hard") {
      inner =
        '<div class="situation" aria-label="Situation board">' +
        '<p class="situation-kicker">Situation board · day 7 · quiet week</p>' +
        '<p class="situation-line">No alerts. No fires. The estate is yours to sweep — the intel (WP-01), the chain and the noise are all out there. ' +
        doneCount + "/" + defs.length + " challenges verified.</p></div>";
    }
    el.innerHTML = inner;
  }

  function fillAdvance() {
    var el = document.getElementById("advance-zone");
    if (!el) return;
    var defs = Obj.objectivesForMode(S.mode);
    var doneCount = defs.filter(function (d) { return S.objectives[d.id] && S.objectives[d.id].done; }).length;
    var all = doneCount === defs.length;
    el.innerHTML =
      '<p class="advance-note">' +
      (all
        ? '<span class="lime-strong">Every waypoint verified.</span> The trail is swept clean — time to test what it taught you.'
        : '<span class="amber-strong">' + doneCount + "/" + defs.length + " waypoints verified.</span> You can carry on sweeping — or take the Field Exam now and return afterwards.") +
      "</p>" +
      '<button type="button" class="btn btn-primary btn-lg btn-advance" data-action="set-phase" data-phase="quiz">' +
      (all ? "To the Field Exam" : "Field Exam (progress saved)") +
      '<span class="advance-ico" aria-hidden="true">' + icon("radio-tower", "h-4 w-4") + "</span></button>";
  }

  function refreshOpsChrome() {
    var wasRevealed = revealedFor();
    // compute before/after around the actual state change is handled by caller;
    // here we simply re-render chrome + rail + ring
    fillRail();
    fillSpotlight();
    fillAdvance();
    var st = stats();
    UI.refreshRings(st.done, st.total);
    return wasRevealed;
  }

  // ── stations ───────────────────────────────────────────────────────────────

  function stationHeadHtml() {
    var meta = UI.STATION_META[ui.station];
    return (
      '<header class="station-head">' +
      '<div><p class="station-kicker">' + meta.waypoint + " · " + meta.sub + "</p>" +
      '<h2 class="station-title">' + meta.label + "</h2></div></header>"
    );
  }

  function fillStation() {
    var body = document.getElementById("station-body");
    if (!body) return;
    var fn = STATION_RENDER[ui.station];
    body.innerHTML = stationHeadHtml() + fn();
    body.classList.remove("enter");
    void body.offsetWidth; // restart the enter animation
    body.classList.add("enter");
  }

  function fillTrail() {
    var chips = document.querySelectorAll(".trail-chip");
    for (var i = 0; i < chips.length; i++) {
      var c = chips[i];
      var active = c.getAttribute("data-station") === ui.station;
      c.classList.toggle("is-active", active);
      if (active) c.setAttribute("aria-current", "page");
      else c.removeAttribute("aria-current");
    }
  }

  function expeditionHtml() {
    var defs = Obj.objectivesForMode(S.mode);
    var trail = Object.keys(UI.STATION_META).map(function (id) {
      var meta = UI.STATION_META[id];
      var active = ui.station === id;
      return (
        '<li class="trail-item">' +
        '<span class="trail-connector" aria-hidden="true"></span>' +
        '<button type="button" class="trail-chip' + (active ? " is-active" : "") + '" data-action="set-station" data-station="' + id + '"' +
        (active ? ' aria-current="page"' : "") + ">" +
        '<span class="trail-waypoint">' + meta.waypoint + "</span>" +
        icon(UI.STATION_ICONS[id], "h-4 w-4") +
        '<span class="trail-label">' + meta.label + "</span></button></li>"
      );
    }).join("");

    return (
      '<div class="expedition-wrap">' +
      '<nav aria-label="Expedition trail — six stations" class="trail-nav"><ul class="trail-list hunt-scroll">' + trail + "</ul></nav>" +
      '<div class="spotlight-zone" id="spotlight-zone"></div>' +
      '<div class="expedition-grid">' +
      '<aside class="ledger-aside" aria-label="Field ledger"><div class="ledger-scroll hunt-scroll" id="rail-desktop-content"></div></aside>' +
      '<div class="mobile-ledger">' +
      '<button type="button" class="btn btn-outline ledger-toggle" data-action="toggle-ledger" aria-expanded="' + ui.mobileLedgerOpen + '" aria-controls="ledger-collapsible">' +
      "<span>Field ledger — objectives<span class=\"ledger-count\" id=\"ledger-count-label\"></span></span>" +
      '<span class="ledger-chevron" id="ledger-chevron" aria-hidden="true">' + icon("chevron-down", "h-4 w-4") + "</span></button>" +
      '<div class="ledger-collapsible" id="ledger-collapsible" aria-hidden="' + (!ui.mobileLedgerOpen) + '">' +
      '<div class="ledger-collapsible-inner" id="rail-mobile-content"></div></div></div>' +
      '<main id="station-panel" class="station-panel" aria-label="Active station">' +
      '<div class="station-body enter" id="station-body"></div>' +
      '<div class="advance-bar" id="advance-zone"></div>' +
      "</main></div></div>"
    );
  }

  // ── WP-01 Satchel ──────────────────────────────────────────────────────────

  var TAG_TONE = { ISAC: "tag-isac", VENDOR: "tag-vendor", OSINT: "tag-osint", ADMIN: "tag-admin" };

  function satchelHtml() {
    var bulletins = D.bulletins.map(function (b) {
      var open = ui.openBulletin === b.id;
      var read = S.env.readBulletins.indexOf(b.id) !== -1;
      var bodyParas = b.body.map(function (p) { return '<p class="bulletin-p">' + esc(p) + "</p>"; }).join("");
      return (
        '<article class="bulletin' + (read ? " is-read" : " is-unread") + '">' +
        '<button type="button" class="bulletin-btn" data-action="toggle-bulletin" data-bulletin="' + b.id + '" aria-expanded="' + open + '">' +
        (b.tag === "OSINT" ? icon("newspaper", "h-4 w-4 ico-osint") : icon("mail", "h-4 w-4 ico-mail")) +
        '<span class="bulletin-lines"><span class="bulletin-top">' +
        '<span class="bulletin-tag ' + TAG_TONE[b.tag] + '">' + b.tag + "</span>" +
        '<span class="bulletin-title">' + esc(b.title) + "</span></span>" +
        '<span class="bulletin-meta">' + esc(b.from) + " · " + esc(b.date) + "</span></span>" +
        '<span class="bulletin-chevron' + (open ? " is-open" : "") + '" aria-hidden="true">' + icon("chevron-down", "h-4 w-4") + "</span>" +
        "</button>" +
        '<div class="acc' + (open ? " open" : "") + '"><div class="acc-inner"><div class="bulletin-body">' + bodyParas + "</div></div></div>" +
        "</article>"
      );
    }).join("");

    var widgets = "";
    if (S.mode === "medium") {
      widgets +=
        UI.widgetCard(
          "Assemble the intelligence cycle",
          "Six phases traveled your intel before it hit the satchel. Slot them in order.",
          "OBJ-M4",
          UI.orderBench("Intelligence cycle — in order", "cycleOrder", BENCHES.cycleOrder.pool, S.env.cycleOrder)
        );
      var routedCount = Object.keys(D.intelProductAnswers).filter(function (k) { return S.env.intelProducts[k]; }).length;
      var allRouted = routedCount === Object.keys(D.intelProductAnswers).length;
      var m5Counter = allRouted ? "" : '<p class="routed-counter" data-counter="m5">' + routedCount + "/3 routed</p>";
      var products = D.intelProductItems.map(function (it) {
        return UI.choiceRow(it.label, "intelProducts", it.id, S.env.intelProducts[it.id] || "", D.intelProductOptions, { compact: true });
      }).join("");
      widgets +=
        UI.widgetCard(
          "Route intel products to their consumers",
          "Strategic feeds boards, operational feeds hunt planning, tactical feeds controls. Altitude decides the audience.",
          "OBJ-M5",
          '<div class="stack-3">' + products + "</div>" + m5Counter
        );
    } else {
      var routes = D.routeItems.map(function (it) {
        return UI.choiceRow(it.label, "routeItems", it.id, S.env.routeItems[it.id] || "", D.intelCyclePhases.map(function (p) { return { id: p.id, label: p.label }; }), { compact: true });
      }).join("");
      var routedH6 = D.routeItems.filter(function (r) { return S.env.routeItems[r.id]; }).length;
      widgets +=
        UI.widgetCard(
          "Route the intel through the cycle",
          "Six statements from team operations. Assign each to the phase it belongs to.",
          "OBJ-H6",
          '<div class="stack-3">' + routes + "</div>" +
          '<div class="mt-3">' + UI.infoNote("Getting these right means the team never confuses “we collected it” with “we analyzed it” — the two most common places intel programs stall.") + "</div>" +
          '<p class="routed-counter" data-counter="h6">' + routedH6 + "/6 routed</p>"
        );
    }

    return (
      '<div class="station-stack">' +
      "<div>" + UI.benchTitle("inbox", "Intel Satchel", "Overnight drop — read everything, weigh what it means. The cycle below is how it got to you.") +
      '<div class="tag-row">' + UI.syntheticTag() + UI.dataLabel('<span data-counter="reads">' + S.env.readBulletins.length + "</span>/" + D.bulletins.length + " read") + "</div></div>" +
      '<div class="bulletin-list">' + bulletins + "</div>" +
      widgets +
      '<p class="station-footnote">' + icon("scroll-text", "h-3.5 w-3.5") + " Reading the satchel daily is Collection + Analysis in one habit — intel only pays when a human turns it into a query.</p>" +
      "</div>"
    );
  }

  function fillSatchelCounters() {
    var reads = document.querySelector('[data-counter="reads"]');
    if (reads) reads.textContent = String(S.env.readBulletins.length);
    if (S.mode === "medium") {
      var routedCount = Object.keys(D.intelProductAnswers).filter(function (k) { return S.env.intelProducts[k]; }).length;
      var all = routedCount === Object.keys(D.intelProductAnswers).length;
      var m5 = document.querySelector('[data-counter="m5"]');
      if (m5) {
        if (all) m5.remove();
        else m5.textContent = routedCount + "/3 routed";
      }
    } else {
      var routedH6 = D.routeItems.filter(function (r) { return S.env.routeItems[r.id]; }).length;
      var h6 = document.querySelector('[data-counter="h6"]');
      if (h6) h6.textContent = routedH6 + "/6 routed";
    }
  }

  // ── WP-02 Slate ────────────────────────────────────────────────────────────

  function slateHtml() {
    var widgets = "";
    if (S.mode === "medium") {
      var segs = D.huntOrNotStatements.map(function (s, i) {
        return UI.segButtons(
          (i + 1) + ". " + s.label, "huntOrNot", s.id, S.env.huntOrNot[s.id] || "",
          [{ id: "hunt", label: "Hunting" }, { id: "monitor", label: "Monitoring" }],
          { tone: false }
        );
      }).join("");
      var answered = D.huntOrNotStatements.filter(function (s) { return S.env.huntOrNot[s.id]; }).length;
      widgets +=
        UI.widgetCard(
          "Warm-up: call it — hunting or monitoring?",
          "Five SOC activities. Tag each: does it go looking, or does it wait?",
          "OBJ-M1",
          '<div class="stack-3">' + segs + "</div>" +
          '<p class="routed-counter" data-counter="m1">' + answered + "/5 tagged</p>"
        );
      var scen = D.huntTypeScenarios.map(function (sc, i) {
        return UI.choiceRow((i + 1) + ". " + sc.label, "huntScenarios", sc.id, S.env.huntScenarios[sc.id] || "", D.huntTypeOptions, { compact: true });
      }).join("");
      widgets +=
        UI.widgetCard(
          "Match hunts to their approaches",
          "Read each scenario's starting point: the intel report, the hunch, or the crown jewel.",
          "OBJ-M3",
          '<div class="stack-3">' + scen + "</div>"
        );
    }
    var hypBadge = S.mode === "hard" ? "OBJ-H2" : "OBJ-M8";
    var hypTitle = S.mode === "hard" ? "Forge the full hunt hypothesis" : "Build the hunt hypothesis";
    var hypSub = S.mode === "hard"
      ? "Advisory B1 is your trigger. Choose type, trigger, EVERY dataset the chain touches, and the testable hypothesis."
      : "Advisory B1 is your trigger. Choose the hunt type, the trigger, the two datasets that surface the chain FIRST, and the hypothesis worth testing.";
    var sourcesSub = S.mode === "hard"
      ? "select every dataset the full chain touches"
      : "select the TWO datasets that would surface the chain first";
    widgets +=
      UI.widgetCard(hypTitle, hypSub, hypBadge,
        '<div class="stack-4">' +
        UI.radioCards("Hunt approach", "huntType", S.env.huntType, D.huntTypeOptions, "hunt-type") +
        UI.choiceRow("Trigger — what started this hunt?", "trigger", "", S.env.trigger, D.triggerOptions) +
        '<div><p class="sources-label">Data sources — ' + sourcesSub + "</p>" +
        UI.checkList(D.sourceOptions, S.env.huntSources, "huntSources", "Hunt data sources") + "</div>" +
        UI.radioCards("The hypothesis — one testable sentence", "hypothesis", S.env.hypothesis, D.hypothesisStatements, "hypothesis") +
        "</div>" +
        '<div class="mt-4">' + UI.infoNote(icon("pencil-ruler", "h-3.5 w-3.5 inline") + " A good hypothesis names the actor (or TTP), the evidence it would leave, and where that evidence lives — specific enough to be proven wrong by an empty result set.") + "</div>"
      );
    return (
      '<div class="station-stack">' +
      "<div>" + UI.benchTitle("notebook-pen", "Tracker&#39;s Slate", "Where hunts are drafted: sharpen the distinction, pick the approach, forge a testable hypothesis.") + "</div>" +
      widgets + "</div>"
    );
  }

  function fillSlateCounters() {
    var answered = D.huntOrNotStatements.filter(function (s) { return S.env.huntOrNot[s.id]; }).length;
    var m1 = document.querySelector('[data-counter="m1"]');
    if (m1) m1.textContent = answered + "/5 tagged";
  }

  // ── WP-03 Scanner ──────────────────────────────────────────────────────────

  var CLASSIFY_OPTIONS = [
    { id: "good", label: "Known-good", tone: "good" },
    { id: "bad", label: "Known-bad", tone: "bad" },
    { id: "unknown", label: "Unknown", tone: "unknown" },
  ];

  function scannerHtml() {
    var revealed = revealedFor();
    var runQueries = D.telemetryQueries.filter(function (q) { return S.env.queriesRun.indexOf(q.id) !== -1; });
    var flaggedCount = S.env.contactFlags.length;

    var sweeps = D.telemetryQueries.map(function (q) {
      var run = S.env.queriesRun.indexOf(q.id) !== -1;
      return (
        '<button type="button" class="sweep-btn' + (run ? " is-run" : "") + '" data-action="run-sweep" data-query="' + q.id + '"' +
        ' title="' + esc(q.source + " — " + q.blurb) + '" aria-label="Run ' + esc(q.label) + " sweep over " + esc(q.source) + '">' +
        icon("scan-search", "h-3.5 w-3.5 inline ico-mr") + q.label + "</button>"
      );
    }).join("");

    var logLines = "";
    if (S.env.queriesRun.length === 0) {
      logLines = '<p class="log-idle">// console idle — no sweeps yet</p>';
    } else {
      logLines = S.env.queriesRun.map(function (qid) {
        var q = D.telemetryQueries.filter(function (t) { return t.id === qid; })[0];
        if (!q) return "";
        var n = D.telemetryEvents.filter(function (e) { return e.q === q.id; }).length;
        return (
          '<p><span class="log-arrow">»</span> RUN ' + esc(q.label) + " (" + esc(q.source) + ") — " + n + " record" + (n === 1 ? "" : "s") + " returned</p>"
        );
      }).join("");
    }

    var resultsHtml = "";
    if (runQueries.length > 0) {
      resultsHtml =
        '<section aria-label="Sweep results" class="results-list">' +
        runQueries.map(function (q) {
          var events = D.telemetryEvents.filter(function (e) { return e.q === q.id; });
          var rows = events.map(function (e) {
            var cls = S.env.triage[e.id];
            var isSel = ui.selectedContact === e.id;
            var flagged = S.env.contactFlags.indexOf(e.id) !== -1;
            var badge = "";
            if (cls) {
              var bCls = cls === "good" ? "ev-badge-good" : cls === "bad" ? "ev-badge-bad" : "ev-badge-unknown";
              var bTxt = cls === "good" ? "GOOD" : cls === "bad" ? "BAD" : "UNK";
              badge = '<span class="ev-badge ' + bCls + '">' + bTxt + "</span>";
            }
            return (
              '<button type="button" class="event-row' + (isSel ? " is-sel" : "") + (flagged ? " is-flagged" : "") + '"' +
              ' data-action="select-contact" data-event="' + e.id + '" aria-expanded="' + isSel + '">' +
              '<span class="ev-time">' + e.time + '</span><span class="ev-host">' + esc(e.host) + "</span>" +
              '<span class="ev-summary">' + esc(e.summary) + "</span>" + badge +
              (flagged ? '<span class="ev-flag" aria-hidden="true">' + icon("flag", "h-3.5 w-3.5") + "</span>" : "") +
              "</button>"
            );
          }).join("");
          return (
            '<div class="result-block"><div class="result-head">' +
            UI.dataLabel(esc(q.label) + " · " + esc(q.source)) +
            '<span class="result-count">' + events.length + " rec</span></div>" +
            '<div class="result-rows">' + rows + "</div></div>"
          );
        }).join("") + "</section>";
    }

    // selected contact detail
    var detailHtml = "";
    var selEvent = ui.selectedContact
      ? D.telemetryEvents.filter(function (e) { return e.id === ui.selectedContact; })[0]
      : null;
    if (selEvent) {
      var isFlagged = S.env.contactFlags.indexOf(selEvent.id) !== -1;
      detailHtml =
        '<section class="detail-panel" aria-label="Contact detail: ' + selEvent.id + '">' +
        '<div class="detail-chips"><span class="detail-id">' + selEvent.id + "</span>" +
        '<span class="detail-meta">' + selEvent.time + " · " + esc(selEvent.host) + "</span></div>" +
        '<p class="detail-summary">' + esc(selEvent.summary) + "</p>" +
        '<p class="detail-text">' + esc(selEvent.detail) + "</p>" +
        (revealed
          ? '<p class="ground-truth"><strong>Ground truth · </strong>' + esc(selEvent.truth) + "</p>"
          : "") +
        '<div class="detail-controls">' +
        UI.segButtons("Classify this contact", "triage", selEvent.id, S.env.triage[selEvent.id] || "", CLASSIFY_OPTIONS, { tone: true }) +
        (S.mode === "hard"
          ? '<button type="button" class="btn btn-flag' + (isFlagged ? " is-flagged" : "") + '" data-action="toggle-flag" data-event="' + selEvent.id + '" aria-pressed="' + isFlagged + '">' +
            icon("flag", "h-4 w-4 icon-mr") +
            (isFlagged ? "Flagged as intrusion contact — unflag" : "Flag as contact of the active intrusion") + "</button>"
          : "") +
        "</div></section>";
    }

    // medium: M9 technique tag
    var m9 = "";
    if (S.mode === "medium" && S.env.queriesRun.indexOf("q-sched") !== -1) {
      m9 = UI.widgetCard(
        "Tag the persistence event",
        "You swept TASK-LATHE — now tag the browser-lookalike task creation with its exact ATT&amp;CK sub-technique.",
        "OBJ-M9",
        UI.choiceRow("ATT&amp;CK sub-technique for the ChromeUpdateTask creation", "techTag", "", S.env.techTag, D.techniqueOptions)
      );
    }

    // hard: H3 chain ident
    var h3 = "";
    if (S.mode === "hard" && S.env.queriesRun.length >= 2) {
      h3 = UI.widgetCard(
        "Chain ident panel",
        "Name the infrastructure and patient zero. Exact values — a hunt report doesn&#39;t round corners.",
        "OBJ-H3",
        '<div class="ident-grid">' +
        '<div><label for="chain-ip" class="ident-label">C2 infrastructure (IP)</label>' +
        '<input id="chain-ip" class="ident-input" data-input="chainIp" value="' + esc(S.env.chainIp) + '" placeholder="e.g. 203.0.113.1" autocomplete="off" spellcheck="false"></div>' +
        '<div><label for="chain-host" class="ident-label">Patient-zero host (hostname)</label>' +
        '<input id="chain-host" class="ident-input ident-uppercase" data-input="chainHost" value="' + esc(S.env.chainHost) + '" placeholder="e.g. ALD-XXX-0000" autocomplete="off" spellcheck="false"></div>' +
        "</div>"
      );
    }

    // medium: M6 triage bench
    var m6 = "";
    if (S.mode === "medium") {
      var bench = D.telemetryEvents.filter(function (e) { return e.mediumSet; }).map(function (e) {
        return (
          '<div class="triage-row">' +
          '<div class="triage-row-head"><span class="ev-time">' + e.time + '</span><span class="triage-host">' + esc(e.host) + "</span>" +
          '<span class="triage-summary">' + esc(e.summary) + "</span></div>" +
          '<button type="button" class="open-detail-btn" data-action="select-contact" data-event="' + e.id + '" aria-label="Open detail for ' + e.id + '">open detail ↓</button>' +
          '<div class="triage-seg">' + UI.segButtons("", "triage", e.id, S.env.triage[e.id] || "", CLASSIFY_OPTIONS, { tone: true, groupLabel: "Classify contact " + e.id }) + "</div>" +
          (revealed ? '<p class="triage-truth"><strong>Truth · </strong>' + esc(e.truth) + "</p>" : "") +
          "</div>"
        );
      }).join("");
      m6 = UI.widgetCard(
        "Triage bench — the day's contacts",
        "Six contacts from a quiet watch. Classify each; open a contact for its full detail first.",
        "OBJ-M6",
        '<div class="stack-2">' + bench + "</div>" +
        '<div class="mt-3">' + UI.infoNote("Classification discipline: known-good carries paperwork (a change record, an authorization); known-bad is proven hostile; unknown is a work queue — never a verdict.") + "</div>"
      );
    }

    return (
      '<div class="station-stack">' +
      "<div>" + UI.benchTitle("radar", "Track Scanner", "Five datasets, one estate. Run a query, open a contact, classify it. Order matters on a real hunt.") +
      '<div class="tag-row">' + UI.syntheticTag() + UI.dataLabel(S.env.queriesRun.length + "/" + D.telemetryQueries.length + " sweeps run" + (S.mode === "hard" ? " · " + flaggedCount + " flagged" : "")) + "</div></div>" +
      '<section class="scanner-console" aria-label="Query console">' +
      '<div class="console-head">' + icon("square-terminal", "h-4 w-4 lime-txt") +
      UI.dataLabel("hunt@aldervale-soc:~$ select a sweep", "console-label") + "</div>" +
      '<div class="sweep-row" role="group" aria-label="Available telemetry sweeps">' + sweeps + "</div>" +
      '<div role="log" aria-live="polite" aria-label="Scanner console log" class="console-log hunt-scroll">' + logLines + "</div>" +
      "</section>" +
      resultsHtml + detailHtml + m9 + h3 + m6 +
      "</div>"
    );
  }

  // ── WP-04 Instruments ──────────────────────────────────────────────────────

  function instrumentsHtml() {
    var widgets = "";
    if (S.mode === "medium") {
      widgets +=
        UI.widgetCard("Order the Kill Chain", "Seven phases, seven chances to break an intrusion. Slot them in order.", "OBJ-M11",
          UI.orderBench("Cyber Kill Chain — in order", "killChain", BENCHES.killChain.pool, S.env.killChain));
      var diamond = D.diamondItems.map(function (it) {
        return UI.choiceRow(it.label, "diamond", it.id, S.env.diamond[it.id] || "", D.diamondVertices, { compact: true });
      }).join("");
      widgets +=
        UI.widgetCard("Pin the intrusion to the Diamond", "Four evidence items from the hunt. Assign each to its vertex — every vertex is a pivot point.", "OBJ-M10",
          '<div class="stack-3">' + diamond + "</div>" +
          '<div class="mt-3">' + UI.infoNote(icon("locate-fixed", "h-3.5 w-3.5 inline") + " Classic test: WHO attacks (adversary) · attacking WITH what (capability) · OVER what (infrastructure) · AGAINST what (victim).") + "</div>");
    } else {
      var MAPPED = ["EV-EMAIL-01", "EV-PROC-01", "EV-SCHED-01", "EV-NET-01"];
      var artifactLabel = function (id) {
        var ev = D.telemetryEvents.filter(function (e) { return e.id === id; })[0];
        return ev ? ev.summary : id;
      };
      var rows = MAPPED.map(function (id) {
        return UI.choiceRow(id + " — " + artifactLabel(id), "attck", id, S.env.attck[id] || "", D.techniqueOptions);
      }).join("");
      widgets +=
        UI.widgetCard("Map the campaign with precision", "Tag all four chain artifacts with exact ATT&amp;CK sub-technique IDs, then name the tactic covering the first observed stage.", "OBJ-H4",
          '<div class="stack-3">' + rows +
          UI.choiceRow("Tactic of the FIRST observed stage (the email delivery)", "tactic", "", S.env.tactic, D.tacticOptions) +
          "</div>" +
          '<div class="mt-3">' + UI.infoNote(icon("crosshair", "h-3.5 w-3.5 inline") + " Sub-technique, not parent: “T1566 Phishing” is the family; “T1566.001 Spearphishing Attachment” is the fingerprint your detections and intel reports link on.") + "</div>");
    }
    return (
      '<div class="station-stack">' +
      "<div>" + UI.benchTitle("compass", "Instruments", "Navigation instruments for adversary behavior: order the Kill Chain, pin the Diamond, tag ATT&amp;CK — precision is the shared language.") + "</div>" +
      widgets + "</div>"
    );
  }

  // ── WP-05 Ledger ───────────────────────────────────────────────────────────

  function ledgerHtml() {
    var widgets = "";
    if (S.mode === "medium") {
      var actorRows = D.actors.map(function (a) {
        return (
          '<div class="actor-row">' +
          '<div class="actor-head"><span class="actor-name">' + esc(a.name) + '</span><span class="actor-type">' + esc(a.type) + "</span></div>" +
          '<p class="actor-blurb">' + esc(a.blurb) + "</p>" +
          '<div class="actor-controls">' +
          UI.segButtons("Origin", "originTags", a.id, S.env.originTags[a.id] || "", [{ id: "internal", label: "Internal" }, { id: "external", label: "External" }]) +
          UI.choiceRow("Motivation", "motivations", a.id, S.env.motivations[a.id] || "", D.motivationOptions, { compact: true, ariaLabel: "Motivation — " + a.name }) +
          "</div></div>"
        );
      }).join("");
      widgets +=
        UI.widgetCard("Sort the actors: internal vs external", "Origin = where initial access comes from. Then match each dossier to its driving motivation.", "OBJ-M2",
          '<div class="stack-3">' + actorRows + "</div>");
    }

    var dossiers = D.actors.map(function (a) {
      return (
        '<details class="dossier"><summary class="dossier-summary">' + icon("fingerprint", "h-3.5 w-3.5 inline ico-mr") +
        "dossier: " + esc(a.name) + "</summary>" +
        '<dl class="dossier-facts">' +
        '<dt>Type</dt><dd>' + esc(a.type) + "</dd>" +
        '<dt>Sophistication</dt><dd>' + esc(a.sophistication) + "</dd>" +
        '<dt>Resources</dt><dd>' + esc(a.funding) + "</dd>" +
        '<dt>Intent</dt><dd>' + esc(a.intent) + "</dd>" +
        "</dl></details>"
      );
    }).join("");

    if (S.mode === "medium") {
      var clues = D.profilerCase.clues.map(function (c, i) {
        return '<li class="clue-li"><span class="clue-num">' + String(i + 1).padStart(2, "0") + "</span>" + esc(c) + "</li>";
      }).join("");
      widgets +=
        UI.widgetCard(esc(D.profilerCase.title), esc(D.profilerCase.ask), "OBJ-M7",
          '<div class="inset clues-box"><ul class="clue-list">' + clues + "</ul></div>" +
          '<div class="stack-3">' +
          UI.choiceRow("Actor type that fits the evidence", "profilerType", "", S.env.profilerType, D.profilerTypeOptions) +
          UI.choiceRow("Matching dossier in the ledger", "profilerDossier", "", S.env.profilerDossier, D.actors.map(function (a) { return { id: a.id, label: a.name }; })) +
          "</div>");
    } else {
      var traits = D.attributionTraits.map(function (t) {
        var on = S.env.attributionTraits.indexOf(t.id) !== -1;
        return (
          '<button type="button" class="trait-chip' + (on ? " on" : "") + '" data-action="toggle-trait" data-trait="' + t.id + '" aria-pressed="' + on + '">' +
          (on ? icon("check", "h-3 w-3 inline ico-mr") : "") + t.label + "</button>"
        );
      }).join("");
      widgets +=
        UI.widgetCard("Attribute the intrusion", "Cross-reference the dossiers, bulletins B1/B2 and your sweep. Name the actor — then select ONLY the attributes the evidence supports.", "OBJ-H5",
          '<div class="stack-4">' +
          UI.choiceRow("Actor behind the chain", "attribution", "", S.env.attribution, D.actors.map(function (a) { return { id: a.id, label: a.name }; })) +
          '<div role="group" aria-label="Supported attributes"><p class="sources-label">Attributes the evidence supports</p>' +
          '<div class="trait-row">' + traits + "</div></div></div>" +
          '<div class="mt-3">' + UI.infoNote(icon("scan-face", "h-3.5 w-3.5 inline") + " Defensible attribution stacks citations: sector targeting, custom capability, observed behavior, infrastructure overlap. Overstated dossiers burn credibility — under pressure, subtract before you add.") + "</div>");
    }

    return (
      '<div class="station-stack">' +
      "<div>" + UI.benchTitle("book-user", "Specimen Ledger", "Who hunts Aldervale? Four dossiers. Profile by origin, motivation, sophistication, resources and intent.") + "</div>" +
      widgets +
      '<div class="dossier-grid">' + dossiers + "</div></div>"
    );
  }

  // ── WP-06 Dispatch ─────────────────────────────────────────────────────────

  function dispatchHtml() {
    var widgets = "";
    widgets +=
      UI.widgetCard("Transmission format &amp; transport", "Format is the language of the intel; transport is the vehicle that moves it. The machine-readable pairing is the sector standard.", S.mode === "hard" ? "OBJ-H8" : "OBJ-M12",
        '<div class="stack-3">' +
        UI.choiceRow("Sharing format", "intelFormat", "", S.env.intelFormat, D.formatOptions) +
        UI.choiceRow("Transport", "intelTransport", "", S.env.intelTransport, D.transportOptions) +
        "</div>");

    if (S.mode === "medium") {
      widgets +=
        UI.widgetCard("Build the external package", "What helps peers detect — and what must never leave the building?", "OBJ-M12",
          UI.checkList(D.packageItems, S.env.packageItems, "packageItems", "External package contents") +
          '<div class="mt-3">' + UI.infoNote("Indicators and technique references are community ammunition. Internal hostnames, mailboxes and user data add legal exposure, not detection value.") + "</div>");
      widgets +=
        UI.widgetCard("Feedback: make it permanent", "The hunt found things no rule watched for. Which actions convert this hunt into standing defense?", "OBJ-M12",
          UI.checkList(D.feedbackActionItems, S.env.feedbackActions, "feedbackActions", "Feedback actions"));
    } else {
      widgets +=
        UI.widgetCard("Assemble the STIX package", "Select exactly the objects that help peers detect — and nothing that identifies Aldervale.", "OBJ-H8",
          UI.checkList(D.shareObjectItems, S.env.shareObjects, "shareObjects", "STIX objects to share") +
          '<div class="mt-3">' + UI.infoNote("Indicators say WHAT was seen; an Attack Pattern says WHAT IT MEANS in ATT&amp;CK terms; a Relationship binds them so a peer&#39;s machine can reason over the package.") + "</div>");
      widgets +=
        UI.widgetCard("Close the loop", "C2 blocked, endpoint rebuilding — exactly when complacency wins. Pick the actions that outlive the ticket, and the follow-up hypothesis that tests containment.", "OBJ-H7",
          '<div class="stack-4">' +
          UI.checkList(D.feedbackActionItems, S.env.feedbackActions, "feedbackActions", "Feedback actions") +
          UI.radioCards("Follow-up hypothesis — what proves containment held?", "nextHypothesis", S.env.nextHypothesis, D.nextHypothesisOptions, "next-hypothesis") +
          "</div>");
      widgets +=
        UI.widgetCard("Steer the hunt program", "Leadership wants a priority and a metric. Choose both by residual risk and darkness removed — not by busyness.", "OBJ-H9",
          '<div class="stack-4">' +
          UI.radioCards("Next hunt priority", "priorityHunt", S.env.priorityHunt, D.priorityHuntOptions, "priority-hunt") +
          UI.radioCards("The one metric that reflects hunting maturity", "programMetric", S.env.programMetric, D.programMetricOptions, "program-metric") +
          "</div>");
    }

    return (
      '<div class="station-stack">' +
      "<div>" + UI.benchTitle("radio-tower", "Dispatch Radio", "Where the hunt pays forward: share what peers can use, keep what they can&#39;t, and turn findings into permanent defense.") + "</div>" +
      widgets + "</div>"
    );
  }

  var STATION_RENDER = {
    satchel: satchelHtml,
    slate: slateHtml,
    scanner: scannerHtml,
    instruments: instrumentsHtml,
    ledger: ledgerHtml,
    dispatch: dispatchHtml,
  };

  // ── debrief ────────────────────────────────────────────────────────────────

  function debriefHtml() {
    var dd = D.debriefData;
    var detections = dd.detections.map(function (d) {
      return (
        '<article class="panel detect-card">' +
        '<span class="source-badge">' + esc(d.source) + "</span>" +
        '<span class="detect-label">What to look for</span>' +
        '<p class="detect-look">' + esc(d.look) + "</p>" +
        '<div class="inset detect-logic"><span class="detect-label">Example detection logic</span>' +
        '<p class="detect-logic-code">' + esc(d.logic) + "</p></div></article>"
      );
    }).join("");
    var mitigations = dd.mitigations.map(function (m) {
      return (
        '<li class="panel mitig-row">' +
        (m.id
          ? '<span class="mitig-id">' + m.id + "</span>"
          : '<span class="mitig-ctrl">Control recommendation</span>') +
        '<p class="mitig-label">' + esc(m.label) + "</p></li>"
      );
    }).join("");
    var blue = dd.blueTeam.map(function (t) {
      return '<li class="team-li">' + icon("shield", "h-3.5 w-3.5 blue-ico") + esc(t) + "</li>";
    }).join("");
    var red = dd.redTeam.map(function (t) {
      return '<li class="team-li">' + icon("crosshair", "h-3.5 w-3.5 red-ico") + esc(t) + "</li>";
    }).join("");
    var links = dd.links.map(function (l) {
      return (
        '<li><a href="' + esc(l.url) + '" target="_blank" rel="noopener noreferrer" class="ref-link">' +
        '<span class="ref-label">' + esc(l.label) + "</span>" +
        icon("external-link", "h-3.5 w-3.5 ref-ico") + "</a></li>"
      );
    }).join("");

    return (
      '<div class="container-debrief" aria-label="Expedition debrief">' +
      '<header class="debrief-head"><div class="quiz-header-top"><p class="kicker-block">Block C6 · Debrief</p>' +
      '<p class="route-label">' + (S.mode === "hard" ? "Route: Deep Range" : "Route: Guided Patrol") + "</p></div>" +
      '<h1 class="page-title">Expedition debrief</h1>' +
      '<p class="debrief-sub">The hunt ends here; the loop doesn&#39;t. What the trail taught turns into detections, mitigations and habits — that is how a hunting program compounds.</p></header>' +
      '<section aria-label="Detection opportunities" class="debrief-section">' +
      UI.benchTitle("scan-search", "Detection opportunities", "What this campaign should have taught the sensors") +
      '<div class="debrief-grid-2">' + detections + "</div></section>" +
      '<section aria-label="Mitigation recommendations" class="debrief-section">' +
      UI.benchTitle("wrench", "Mitigation recommendations", "ATT&amp;CK mitigation IDs where one exists, control recommendation where none does") +
      '<ul class="mitig-list">' + mitigations + "</ul></section>" +
      '<section aria-label="Blue-team takeaways and red-team mindset" class="debrief-section">' +
      '<div class="debrief-grid-2-gap">' +
      '<div class="panel team-card"><h3 class="team-title">' + icon("shield", "h-4 w-4 blue-ico") + " Blue-team takeaways</h3>" +
      '<ul class="team-list">' + blue + "</ul></div>" +
      '<div class="panel team-card"><h3 class="team-title">' + icon("crosshair", "h-4 w-4 red-ico-strong") + " Red-team mindset</h3>" +
      '<p class="team-note">For the blue team&#39;s red thinking — tradecraft awareness, never instructions</p>' +
      '<ul class="team-list">' + red + "</ul></div>" +
      "</div></section>" +
      '<section aria-label="Field references" class="debrief-section">' +
      UI.benchTitle("book-open", "Field references", "Open in a new tab") +
      '<ul class="panel ref-list">' + links + "</ul></section>" +
      '<div class="debrief-cta">' +
      '<button type="button" class="btn btn-primary btn-lg" data-action="end-expedition">' + icon("flag", "h-4 w-4 icon-mr") + " Close the expedition</button>" +
      UI.syntheticTag() + "</div></div>"
    );
  }

  // ── completion modal ───────────────────────────────────────────────────────

  function completionHtml(st) {
    var PILLARS = ["P1", "P2", "P3", "P4"];
    var BAR_COLOR = { P1: "bar-amber", P2: "bar-lime", P3: "bar-orange", P4: "bar-rose" };
    var stars = [1, 2, 3, 4, 5].map(function (i) {
      var filled = i <= st.stars;
      return (
        '<span class="star' + (filled ? " filled" : "") + '" style="animation-delay:' + (150 + i * 90) + 'ms" aria-hidden="true">' +
        icon("star", "h-7 w-7") + "</span>"
      );
    }).join("");
    var pillarRows = PILLARS.map(function (p) {
      var agg = st.byPillar[p] || { done: 0, total: 0 };
      var pct = agg.total > 0 ? Math.round((agg.done / agg.total) * 100) : 0;
      var objs = st.perObjective.filter(function (o) { return o.pillar === p; }).map(function (o) {
        return (
          '<li class="pillar-obj">' +
          (o.done ? icon("check", "h-3.5 w-3.5 obj-done-ico") : icon("circle", "h-3.5 w-3.5 obj-todo-ico")) +
          '<span class="' + (o.done ? "obj-done" : "obj-todo") + '">' + esc(o.title) + "</span></li>"
        );
      }).join("");
      return (
        "<div>" +
        '<div class="pillar-row">' + UI.pillarBadge(p) + '<span class="pillar-count">' + agg.done + "/" + agg.total + "</span></div>" +
        '<div class="pillar-bar"><div class="pillar-fill ' + BAR_COLOR[p] + '" style="width:' + pct + '%"></div></div>' +
        '<ul class="pillar-objs">' + objs + "</ul></div>"
      );
    }).join("");
    var nextSteps = D.debriefData.nextSteps.map(function (s, i) {
      return '<li class="next-li"><span class="next-num">' + String(i + 1).padStart(2, "0") + "</span>" + esc(s) + "</li>";
    }).join("");

    return (
      '<p class="comp-kicker">Expedition log · final entry</p>' +
      '<h2 class="comp-title" id="comp-title">Expedition complete</h2>' +
      '<p class="comp-desc">' + (S.mode === "hard"
        ? "Deep Range run — you hunted in the noise and came back with the story."
        : "Guided Patrol run — every station walked, every lesson banked.") + "</p>" +
      '<div class="stars" role="img" aria-label="' + st.stars + ' of 5 expedition stars earned">' + stars + "</div>" +
      '<ul class="comp-stats">' +
      '<li><span class="stat-strong">' + st.done + "/" + st.total + "</span> objectives</li>" +
      '<li><span class="stat-strong">' + st.firstTry + "</span> first-attempt</li>" +
      '<li>exam <span class="stat-strong">' + st.quizCorrect + "/" + st.quizTotal + "</span></li>" +
      '<li>hints used <span class="stat-strong">' + st.hintsUsed + "</span></li>" +
      "</ul>" +
      '<section aria-label="Mastery recap by pillar" class="comp-section">' +
      '<h3 class="comp-section-title">Mastery recap by pillar</h3>' +
      '<div class="pillar-stack">' + pillarRows + "</div></section>" +
      '<section aria-label="What to learn next" class="comp-section mt-4">' +
      '<h3 class="comp-section-title">What to learn next</h3>' +
      '<ol class="next-list">' + nextSteps + "</ol></section>" +
      '<div class="comp-actions">' +
      '<button type="button" class="btn btn-primary btn-lg btn-block" data-action="completion-restart">' + icon("rotate-ccw", "h-4 w-4 icon-mr") + " Run it again</button>" +
      '<button type="button" class="btn btn-outline btn-outline-stone btn-lg btn-block" data-action="completion-review">' + icon("route", "h-4 w-4 icon-mr") + " Review the trail</button>" +
      "</div>"
    );
  }

  function openCompletion() {
    var st = stats();
    UI.openModal(completionHtml(st), { role: "dialog", labelledBy: "comp-title", escCloses: true, backdropCloses: true });
  }

  // ── confirm modals ─────────────────────────────────────────────────────────

  function openConfirm(kind) {
    var title = kind === "reset" ? "Reset the expedition?" : "Start a new route?";
    var desc = kind === "reset"
      ? "This wipes all saved progress — objectives, environment state, exam answers and stars — and returns you to basecamp. The lab returns to pristine state."
      : "Starting “" + modeName(pendingMode) + "” resets all current progress. Your saved run will be replaced.";
    var actionLabel = kind === "reset" ? "Reset everything" : "Start fresh";
    UI.openModal(
      '<h2 class="confirm-title" id="confirm-title">' + title + "</h2>" +
      '<p class="confirm-desc">' + desc + "</p>" +
      '<div class="confirm-actions">' +
      '<button type="button" class="btn btn-outline btn-outline-stone" data-action="dismiss-confirm">Keep progress</button>' +
      '<button type="button" class="btn btn-rose" data-action="confirm-' + kind + '">' + actionLabel + "</button></div>",
      { role: "alertdialog", labelledBy: "confirm-title", escCloses: true, backdropCloses: false }
    );
  }

  // ── render root ────────────────────────────────────────────────────────────

  function render() {
    if (!root) return;
    if (S.phase === "basecamp") {
      root.innerHTML = '<div class="app-shell">' + basecampHtml() + "</div>";
      return;
    }
    var body = "";
    if (S.phase === "briefing") body = briefingHtml();
    else if (S.phase === "manual") body = manualHtml();
    else if (S.phase === "ops") body = expeditionHtml();
    else if (S.phase === "quiz") body = Q.view(S.mode, S.quiz);
    else if (S.phase === "debrief") body = debriefHtml();
    // phase "complete": empty body behind the open completion modal (as original)

    root.innerHTML = '<div class="app-shell">' + mastheadHtml() + '<div class="phase-body">' + body + "</div></div>";

    if (S.phase === "ops") {
      fillRail();
      fillSpotlight();
      fillAdvance();
      fillStation();
      fillTrail();
    }
    if (S.phase === "complete") {
      openCompletion();
    }
  }

  function jump(station) {
    ui.station = station;
    ui.mobileLedgerOpen = false;
    fillTrail();
    fillStation();
    fillRail();
    var panel = document.getElementById("station-panel");
    if (panel) panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ── event dispatch ─────────────────────────────────────────────────────────

  function onModalClose() {
    // completion dialog closes (Esc / backdrop / buttons) → back to the debrief
    if (S && S.phase === "complete") {
      // avoid double-render when a button already changed the phase
      setPhase("debrief");
    }
  }

  function handleClick(e) {
    var el = e.target.closest("[data-action]");
    if (!el || el.disabled) return;
    var action = el.getAttribute("data-action");

    switch (action) {
      case "start-mode": startMode(el.getAttribute("data-mode")); break;
      case "resume":
        resetOpsUi(); // the expedition view remounts fresh, as in the original
        setPhase(S.visitedPhases.indexOf("ops") !== -1 ? "ops" : "briefing");
        break;
      case "discard": resetAll(); break;
      case "set-phase": {
        var phase = el.getAttribute("data-phase");
        // stepper chips are rendered disabled until visited; keep a guard anyway
        if (el.hasAttribute("data-stepper") && S.visitedPhases.indexOf(phase) === -1) return;
        if (phase === "ops") resetOpsUi(); // expedition remounts fresh, as in the original
        setPhase(phase);
        break;
      }
      case "open-summary": setPhase("complete"); break;
      case "request-reset": openConfirm("reset"); break;
      case "dismiss-confirm": UI.closeModal(); break;
      case "confirm-reset": UI.closeModal(); resetAll(); break;
      case "confirm-start":
        UI.closeModal();
        S = St.freshState(pendingMode);
        resetOpsUi();
        commit();
        render();
        break;
      case "set-station":
        ui.station = el.getAttribute("data-station");
        fillTrail();
        fillStation();
        fillRail();
        break;
      case "jump-station": jump(el.getAttribute("data-station")); break;
      case "toggle-ledger":
        ui.mobileLedgerOpen = !ui.mobileLedgerOpen;
        el.setAttribute("aria-expanded", String(ui.mobileLedgerOpen));
        fillRail();
        break;
      case "toggle-obj": {
        var oid = el.getAttribute("data-obj");
        ui.openObjectives[oid] = !ui.openObjectives[oid];
        fillRail();
        break;
      }
      case "check-obj": {
        var wasRevealed = revealedFor();
        checkObjective(el.getAttribute("data-obj"));
        if (revealedFor() !== wasRevealed) fillStation(); // ground truth appeared
        break;
      }
      case "hint-obj": useHint(el.getAttribute("data-obj")); break;
      case "toggle-bulletin": {
        var bid = el.getAttribute("data-bulletin");
        var next = !ui.openBulletin || ui.openBulletin !== bid ? bid : null;
        ui.openBulletin = next;
        if (next && S.env.readBulletins.indexOf(next) === -1) {
          updateEnv({ readBulletins: S.env.readBulletins.concat([next]) });
        }
        fillStation();
        break;
      }
      case "run-sweep": {
        var qid = el.getAttribute("data-query");
        var run = S.env.queriesRun.indexOf(qid) !== -1;
        var list = run
          ? S.env.queriesRun.filter(function (x) { return x !== qid; }).concat([qid])
          : S.env.queriesRun.concat([qid]);
        updateEnv({ queriesRun: list });
        ui.selectedContact = null;
        fillStation();
        break;
      }
      case "select-contact": {
        var eid = el.getAttribute("data-event");
        ui.selectedContact = ui.selectedContact === eid ? null : eid;
        fillStation();
        break;
      }
      case "toggle-flag": {
        var fid = el.getAttribute("data-event");
        var flags = S.env.contactFlags.indexOf(fid) !== -1
          ? S.env.contactFlags.filter(function (x) { return x !== fid; })
          : S.env.contactFlags.concat([fid]);
        updateEnv({ contactFlags: flags });
        fillStation();
        break;
      }
      case "toggle-trait": {
        var tid = el.getAttribute("data-trait");
        var traits = S.env.attributionTraits.indexOf(tid) !== -1
          ? S.env.attributionTraits.filter(function (x) { return x !== tid; })
          : S.env.attributionTraits.concat([tid]);
        updateEnv({ attributionTraits: traits });
        // sync the chip in place
        var on2 = S.env.attributionTraits.indexOf(tid) !== -1;
        el.classList.toggle("on", on2);
        el.setAttribute("aria-pressed", String(on2));
        var mk = el.querySelector("svg");
        if (on2 && !mk) el.insertAdjacentHTML("afterbegin", icon("check", "h-3 w-3 inline ico-mr"));
        if (!on2 && mk) mk.remove();
        break;
      }
      case "seg": {
        var field = el.getAttribute("data-env");
        var key = el.getAttribute("data-key");
        var val = el.getAttribute("data-val");
        var patch = {};
        if (key) { var o2 = {}; o2[key] = val; patch[field] = o2; }
        else patch[field] = val;
        updateEnv(patch);
        if (field === "triage") {
          // the results row badge + ground-truth reveal also reflect triage →
          // re-render the scanner (equivalent to the original station re-render)
          fillStation();
        } else {
          UI.syncSegGroup(el.closest(".seg-group"), val);
        }
        break;
      }
      case "radio": {
        var rfield = el.getAttribute("data-env");
        var rval = el.getAttribute("data-val");
        var rpatch = {};
        rpatch[rfield] = rval;
        updateEnv(rpatch);
        UI.syncRadioGroup(el.closest(".radio-cards"), rval);
        break;
      }
      case "toggle-check": {
        var cfield = el.getAttribute("data-env");
        var ckey = el.getAttribute("data-key");
        var arr = S.env[cfield];
        var narr = arr.indexOf(ckey) !== -1 ? arr.filter(function (x) { return x !== ckey; }) : arr.concat([ckey]);
        var cpatch = {};
        cpatch[cfield] = narr;
        updateEnv(cpatch);
        var on3 = narr.indexOf(ckey) !== -1;
        el.classList.toggle("on", on3);
        el.setAttribute("aria-pressed", String(on3));
        var box = el.querySelector(".check-box");
        if (box) box.innerHTML = on3 ? icon("check", "check-mark") : "";
        break;
      }
      case "bench-add": {
        var b1 = el.getAttribute("data-bench");
        var id1 = el.getAttribute("data-id");
        var arr1 = S.env[b1].concat([id1]);
        var p1 = {}; p1[b1] = arr1;
        updateEnv(p1);
        rerenderBench(b1);
        break;
      }
      case "bench-remove": {
        var b2 = el.getAttribute("data-bench");
        var i2 = Number(el.getAttribute("data-index"));
        var arr2 = S.env[b2].filter(function (_, x) { return x !== i2; });
        var p2 = {}; p2[b2] = arr2;
        updateEnv(p2);
        rerenderBench(b2);
        break;
      }
      case "bench-clear": {
        var b3 = el.getAttribute("data-bench");
        var p3 = {}; p3[b3] = [];
        updateEnv(p3);
        rerenderBench(b3);
        break;
      }
      case "quiz-answer": {
        var qid2 = el.getAttribute("data-q");
        var choice = Number(el.getAttribute("data-index"));
        S.quiz[qid2] = choice;
        commit();
        Q.syncAfterAnswer(qid2, S.quiz, S.mode);
        break;
      }
      case "quiz-continue": setPhase("debrief"); break;
      case "end-expedition": setPhase("complete", { completedAt: new Date().toISOString() }); break;
      case "completion-restart":
        UI.closeModalSilent();
        resetAll();
        break;
      case "completion-review":
        UI.closeModalSilent();
        resetOpsUi();
        setPhase("ops");
        break;
    }
  }

  function rerenderBench(benchId) {
    var cfg = BENCHES[benchId];
    var el = document.querySelector('[data-bench="' + benchId + '"]');
    if (el && cfg) {
      var fresh = UI.h(UI.orderBench(cfg.label, benchId, cfg.pool, S.env[benchId]));
      el.replaceWith(fresh);
    }
  }

  function handleChange(e) {
    var sel = e.target.closest("select[data-select]");
    if (!sel) return;
    var field = sel.getAttribute("data-select");
    var key = sel.getAttribute("data-key");
    var patch = {};
    if (key) { var o = {}; o[key] = sel.value; patch[field] = o; }
    else patch[field] = sel.value;
    updateEnv(patch);
    // counters that react to select choices
    if (ui.station === "satchel") fillSatchelCounters();
    if (ui.station === "slate") fillSlateCounters();
  }

  function handleInput(e) {
    var inp = e.target.closest("input[data-input]");
    if (!inp) return;
    var field = inp.getAttribute("data-input");
    var patch = {};
    patch[field] = inp.value;
    updateEnv(patch); // no re-render: typing keeps focus
  }

  function init() {
    root = document.getElementById("app");
    S = St.loadState() || St.freshState();
    render();

    // Delegated events live on document.body (not #app) because modals are
    // appended to <body> — their buttons must reach the same dispatch table.
    document.body.addEventListener("click", function (e) { handleClick(e); });
    document.body.addEventListener("change", function (e) { handleChange(e); });
    document.body.addEventListener("input", function (e) { handleInput(e); });

    // glossary term tooltips (hover + keyboard focus), delegated
    document.body.addEventListener("mouseover", function (e) {
      var t = e.target.closest("[data-term]");
      if (t) UI.showTip(t);
    });
    document.body.addEventListener("mouseout", function (e) {
      var t = e.target.closest("[data-term]");
      if (t) UI.hideTip();
    });
    document.body.addEventListener("focusin", function (e) {
      var t = e.target.closest("[data-term]");
      if (t) UI.showTip(t);
    });
    document.body.addEventListener("focusout", function (e) {
      var t = e.target.closest("[data-term]");
      if (t) UI.hideTip();
    });
  }

  // extend the modal helper with a silent close (no focus restore churn)
  if (!UI.closeModalSilent) {
    UI.closeModalSilent = function () { UI.closeModal(); };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  return {
    onModalClose: onModalClose,
  };
})();
