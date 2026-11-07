/* =========================================================================
   The Engagement Desk — static port (js/app.js)
   -------------------------------------------------------------------------
   Bootstrap, stage routing, all views and instruments, event delegation,
   dialogs/sheets, focus management. Faithful behavior port of:
     src/app/page.tsx, Masthead, StageRail, ModeSelect, Briefing,
     Compendium, Desk, EvidenceDrawer, Workbench, ObjectiveRail,
     InstrumentsA, InstrumentsB, Quiz, Debrief, CompletionModal.
   ========================================================================= */

(function () {
  "use strict";

  var D = window.LabData;
  var S = window.LabState;
  var U = window.LabUI;
  var E = window.LabEngine;
  var DC = D.DESK_COPY;

  // Transient view state — the original kept these in component useState and
  // they reset whenever the owning component unmounted (i.e. on stage change).
  var ui = {
    noteFor: { id: "", note: null }, // Workbench near-miss note for the just-checked objective
    quizView: null, // Quiz viewOverride
    openDoc: null, // EvidenceDrawer open document
    sheet: null, // "evidence" | "objectives" | null (mobile bottom sheets)
    modalOpen: false, // completion dialog
    resetOpen: false, // masthead reset confirm
    restartOpen: false, // completion-modal restart confirm
    seenCompletedAt: "init", // completion auto-open bookkeeping
  };

  // ======================================================================
  // Views
  // ======================================================================

  function viewModeSelect() {
    var I = D.MODE_SELECT_INTRO;
    var cards = "";
    for (var i = 0; i < D.MODE_CARDS.length; i++) {
      var m = D.MODE_CARDS[i];
      var pts = "";
      for (var p = 0; p < m.points.length; p++) {
        pts += '<li class="mode-point">' + U.icon("ic-compass", "mode-point-ic") + "<span>" + U.esc(m.points[p]) + "</span></li>";
      }
      cards +=
        '<button type="button" data-act="set-mode" data-mode="' + m.id + '" class="mode-card mode-enter mode-enter-' + i + '">' +
        '<span class="mode-ic-box">' + U.icon(m.icon, "mode-ic") + "</span>" +
        '<span class="mode-title">' + U.esc(m.title) + "</span>" +
        '<span class="mode-line">' + U.esc(m.line) + "</span>" +
        '<ul class="mode-points">' + pts + "</ul>" +
        '<span class="mode-cta">' + U.icon("ic-clipboard-list", "mode-cta-ic") + U.esc(m.cta) + "</span>" +
        "</button>";
    }
    return (
      '<main class="desk-grid mode-screen">' +
      '<div class="mode-wrap">' +
      '<header class="mode-head">' +
      '<p class="kicker kicker-center">' + U.esc(I.kicker) + "</p>" +
      '<h1 class="mode-h1">' + U.esc(I.title) + "</h1>" +
      '<p class="mode-sub">' + U.esc(I.sub) + "</p>" +
      '<div class="mode-tag">' + U.syntheticTag() + "</div>" +
      "</header>" +
      '<div class="mode-grid">' + cards + "</div>" +
      '<p class="mode-foot">' + U.esc(I.foot) + "</p>" +
      "</div></main>"
    );
  }

  function viewMasthead(s) {
    var prog = S.computeProgress(s);
    var M = D.MASTHEAD;
    return (
      '<header class="masthead">' +
      '<div class="masthead-in">' +
      '<div class="masthead-l">' +
      '<span class="file-badge">' + (s.mode === "hard" ? M.fileHard : M.fileMedium) + "</span>" +
      '<div class="min-w-0"><h1 class="masthead-title">' + M.title + "</h1>" +
      '<p class="masthead-sub">' + U.esc(M.sub) + "</p></div>" +
      "</div>" +
      '<div class="masthead-r">' +
      '<span class="mode-badge">' + (s.mode === "hard" ? M.modeHard : M.modeMedium) + "</span>" +
      (prog.stars > 0 ? '<span class="masthead-stars" aria-label="' + prog.stars + ' stars">' + U.stars(prog.stars, "star-sm") + "</span>" : "") +
      U.progressDial(prog.overallPct) +
      '<button type="button" data-act="theme" class="btn-icon" aria-label="' + U.esc(M.themeLabel) + '" title="' + U.esc(M.themeTitle) + '">' +
      U.icon("ic-sun", "ic-theme-dark") + U.icon("ic-moon", "ic-theme-light") +
      "</button>" +
      '<button type="button" data-act="reset-open" class="btn btn-outline btn-sm btn-reset">' + U.esc(M.reset) + "</button>" +
      "</div></div></header>"
    );
  }

  function stageLocked(s, stage) {
    var prog = S.computeProgress(s);
    switch (stage) {
      case "briefing":
      case "compendium":
        return null;
      case "desk":
        return s.mode === "medium" && !s.compendiumSeen ? D.GATE_COPY.compendiumFirst : null;
      case "review":
        return !prog.total || prog.done !== prog.total
          ? D.GATE_COPY.objectivesFirst(prog.done, prog.total)
          : null;
      case "debrief":
        return !s.quiz.completed ? D.GATE_COPY.quizFirst : null;
    }
    return null;
  }

  function viewStageRail(s) {
    var prog = S.computeProgress(s);
    var allDone = prog.total > 0 && prog.done === prog.total;
    var tabs = "";
    for (var i = 0; i < D.STAGE_ORDER.length; i++) {
      var id = D.STAGE_ORDER[i];
      var lock = stageLocked(s, id);
      var active = s.stage === id;
      var done =
        (id === "briefing" && s.briefingSeen) ||
        (id === "compendium" && s.compendiumSeen) ||
        (id === "desk" && allDone) ||
        (id === "review" && s.quiz.completed) ||
        (id === "debrief" && !!s.completedAt);
      var ic = lock ? U.icon("ic-lock") : done ? U.icon("ic-check", "ic-green") : '<span class="tab-num">' + String(i + 1).padStart(2, "0") + "</span>";
      tabs +=
        '<button type="button" role="tab" aria-selected="' + active + '" data-act="go-stage" data-stage="' + id + '"' +
        (lock ? " disabled" : "") +
        ' class="tab-folder' + (active ? " tab-active" : "") + (lock ? " tab-locked" : "") + '"' +
        ' data-tip="' + U.esc(lock || D.STAGE_META[id].blurb) + '">' +
        '<span class="tab-in">' + ic + '<span class="tab-label">' + U.esc(D.STAGE_META[id].label) + "</span></span></button>";
    }
    return '<nav aria-label="Engagement stages" class="stage-rail"><div role="tablist" class="stage-tabs">' + tabs + "</div></nav>";
  }

  // ---------------- Stage 01 · Briefing ----------------

  function viewBriefing(s) {
    var B = D.BRIEFING;
    return (
      '<main class="stage-narrow stage-enter">' +
      U.sectionTitle(B.kicker, B.title, B.sub) +
      '<article class="doc-paper brief-letter" aria-label="Engagement letter">' +
      '<div class="letter-head">' +
      '<div class="letter-head-row"><p class="letter-firm">' + B.letterHead + "</p>" + U.syntheticTag() + "</div>" +
      '<p class="letter-sub">' + U.esc(B.letterSub) + "</p>" +
      "</div>" +
      '<dl class="letter-meta">' +
      "<dt>" + B.toLabel + "</dt><dd>" + U.esc(B.toValue) + "</dd>" +
      "<dt>" + B.fromLabel + "</dt><dd>" + U.esc(B.fromValue) + "</dd>" +
      "<dt>" + B.reLabel + "</dt><dd>Engagement " + D.CLIENT.file + " — " + U.esc(D.CLIENT.name) + ": cloud model recommendation</dd>" +
      "</dl>" +
      '<div class="letter-body">' +
      "<p>" + B.body1 + "<strong>" + U.esc(D.CLIENT.name) + "</strong>" + B.body2 + U.esc(D.CLIENT.profile) + "</p>" +
      "<p>" + B.body3 + "<em>" + B.body3em + "</em>" + U.esc(D.CLIENT.ask) + "</p>" +
      "<p>" + B.body4 + "<strong>" + B.body4strong + "</strong>" + U.esc(B.body4tail) + "</p>" +
      "</div>" +
      '<div class="mission-box">' +
      '<h3 class="mission-h">' + U.icon("ic-target", "ic-primary") + " " + U.esc(B.missionH) + "</h3>" +
      '<ol class="mission-list">' +
      "<li>Learn the five deployment models and the service-model ladder in the <strong>Model Compendium</strong>.</li>" +
      "<li>Work the engagement at the <strong>Desk</strong>: triage evidence, tag binding constraints, place workloads, stamp decisions, and write the recommendation memo.</li>" +
      "<li>Pass the <strong>Competency Review</strong>, then collect your <strong>Debrief &amp; Field Notes</strong>.</li>" +
      "</ol></div>" +
      '<div class="casefile-box"><p>' + U.icon("ic-building-2", "ic-primary ic-tight") +
      "<span><strong>" + B.casefileH + "</strong> " + D.DOCS.length + U.esc(B.casefileT) + "<em>" + U.esc(B.casefileEm) + "</em></span></p></div>" +
      '<div class="letter-foot">' +
      '<p class="synth-note">' + U.icon("ic-file-text", "ic-tight") + "<span>" + B.synthNote +
      '<span class="mono">' + B.synthCode + "</span>" + U.esc(B.synthTail) + "</span></p>" +
      '<button type="button" data-act="go-stage" data-stage="compendium" class="btn btn-primary btn-cta">' +
      U.esc(B.cta) + " " + U.icon("ic-arrow-right") + "</button>" +
      "</div>" +
      "</article>" +
      '<p class="term-note">New terms arrive ' +
      U.term("dotted and underlined", "multi-tenancy") +
      " — hover or focus them for one-line definitions, anytime.</p>" +
      "</main>"
    );
  }

  // ---------------- Stage 02 · Compendium ----------------

  function viewCompendium() {
    var C = D.COMPENDIUM;
    var modelCards = "";
    for (var i = 0; i < D.MODELS.length; i++) {
      var m = D.MODELS[i];
      var strengths = "";
      for (var a = 0; a < m.strengths.length; a++) strengths += '<li><span class="plus" aria-hidden="true">+</span>' + U.esc(m.strengths[a]) + "</li>";
      var limits = "";
      for (var b = 0; b < m.limits.length; b++) limits += '<li><span class="minus" aria-hidden="true">−</span>' + U.esc(m.limits[b]) + "</li>";
      modelCards +=
        '<details class="model-acc"' + (m.id === "public" ? " open" : "") + ">" +
        '<summary class="model-sum"><span class="model-sum-in">' + U.modelDot(m.id) +
        "<span><span class=\"model-name\">" + U.esc(m.name) + '</span><span class="model-tagline"> ' + U.esc(m.tagline) + "</span></span>" +
        U.icon("ic-chevron-down", "acc-chevron") + "</span></summary>" +
        '<div class="model-body">' +
        '<p class="model-def">' + U.esc(m.definition) + "</p>" +
        '<dl class="model-facts">' +
        "<div><dt>" + C.ownership + "</dt><dd>" + U.esc(m.ownership) + "</dd></div>" +
        "<div><dt>" + C.tenancy + "</dt><dd>" + U.esc(m.tenancy) + "</dd></div>" +
        "<div><dt>" + C.costShape + "</dt><dd>" + U.esc(m.cost) + "</dd></div>" +
        "</dl>" +
        '<div class="model-cols">' +
        "<div><h4 class=\"mini-h green\">" + U.icon("ic-check", "ic-tight") + " " + C.strengths + '</h4><ul class="tick-list">' + strengths + "</ul></div>" +
        "<div><h4 class=\"mini-h red\">" + U.icon("ic-ban", "ic-tight") + " " + C.limits + '</h4><ul class="tick-list">' + limits + "</ul></div>" +
        "</div>" +
        '<div class="model-cols model-cols-2">' +
        '<div class="boxed"><h4 class="mini-h">' + C.fits + "</h4><p>" + m.fits.map(U.esc).join(" · ") + "</p></div>" +
        '<div class="boxed"><h4 class="mini-h">' + C.poorFit + "</h4><p>" + U.esc(m.avoid) + "</p></div>" +
        "</div>" +
        '<div class="tip-box">' +
        '<p>' + U.icon("ic-lightbulb", "ic-primary ic-tight") + "<span><strong>" + C.examTip + "</strong> " + U.esc(m.examTip) + "</span></p>" +
        '<p class="tip-pattern">' + U.icon("ic-trending-up", "ic-tight") + " " + U.esc(m.pattern) + "</p>" +
        "</div>" +
        "</div></details>";
    }
    var ladderRows = "";
    for (var r = 0; r < D.LADDER.length; r++) {
      var rung = D.LADDER[r];
      ladderRows +=
        '<div class="rung">' +
        '<div class="rung-head"><span class="rung-name">' + U.esc(rung.name) + '</span><span class="rung-example">' + U.esc(rung.example) + "</span></div>" +
        '<div class="rung-cols">' +
        '<div class="rung-cell rung-cell-b"><span class="fact-label">' + C.providerManages + '</span><p>' + U.esc(rung.provider) + "</p></div>" +
        '<div class="rung-cell"><span class="fact-label fact-label-primary">' + C.customerManages + '</span><p class="fact-strong">' + U.esc(rung.customer) + "</p></div>" +
        "</div></div>";
    }
    var gloss = "";
    for (var g = 0; g < D.GLOSSARY.length; g++) {
      gloss += '<div class="gloss-row"><dt class="gloss-term">' + U.esc(D.GLOSSARY[g].term) + " —</dt><dd class=\"gloss-def\">" + U.esc(D.GLOSSARY[g].def) + "</dd></div>";
    }
    return (
      '<main class="stage-wide stage-enter">' +
      U.sectionTitle(C.kicker, C.title, C.sub) +
      '<h3 class="block-h">' + C.modelsH + "</h3>" +
      '<div class="acc-group">' + modelCards + "</div>" +
      '<h3 class="block-h block-h-2">' + C.ladderH + "</h3>" +
      '<p class="block-sub">' +
      "The deployment model says <em>where</em> workloads live; the service model says <em>who manages the stack</em>. Climb down and the provider absorbs more. The " +
      U.term("shared responsibility model", "Shared responsibility model") +
      " shifts with every rung — but data, identity and access are <strong>always yours</strong>.</p>" +
      '<div class="stack-2">' + ladderRows + '<div class="tip-box"><p><strong>' + C.ladderNote + "</strong></p></div></div>" +
      '<h3 class="block-h block-h-2">' + C.glossaryH + "</h3>" +
      '<dl class="gloss-grid">' + gloss + "</dl>" +
      '<div class="center">' +
      '<button type="button" data-act="go-stage" data-stage="desk" class="btn btn-primary btn-lg btn-cta">' +
      C.cta + " " + U.icon("ic-arrow-right") + "</button>" +
      "</div></main>"
    );
  }

  // ---------------- Evidence drawer ----------------

  function viewEvidenceDrawer(s, insideSheet) {
    var docs = D.DOCS.filter(function (d) {
      return s.mode === "hard" ? true : !d.hardOnly;
    });
    var readCount = 0;
    for (var i = 0; i < docs.length; i++) if (s.env.docsRead.indexOf(docs[i].id) >= 0) readCount++;
    var rows = "";
    for (var j = 0; j < docs.length; j++) {
      var d = docs[j];
      var isOpen = ui.openDoc === d.id;
      rows +=
        '<div class="drawer-doc">' +
        '<button type="button" aria-expanded="' + isOpen + '" data-act="open-doc" data-id="' + d.id + '" class="drawer-doc-btn' + (isOpen ? " drawer-open" : "") + '">' +
        U.icon("ic-file-text", "ic-primary") +
        '<span class="drawer-doc-txt"><span class="drawer-doc-name"><span class="doc-code-sm">' + U.esc(d.code) + "</span>" + U.esc(d.title) + "</span>" +
        '<span class="drawer-doc-kind">' + U.esc(d.kind) + (d.hardOnly ? DC.hardFile : "") + "</span></span>" +
        U.icon("ic-chevron-down", "acc-chevron" + (isOpen ? " chev-up" : "")) +
        "</button>" +
        (isOpen ? '<div class="drawer-doc-body">' + U.docViewer(d, false, [], null) + "</div>" : "") +
        "</div>";
    }
    return (
      '<section aria-label="Evidence drawer"' + (insideSheet ? ' class="px-1"' : "") + ">" +
      '<header class="rail-head"><h3 class="rail-h">' + DC.drawerH + '</h3><span class="rail-count">' + DC.readLabel + " " + readCount + "/" + docs.length + "</span></header>" +
      '<p class="rail-sub">' + U.esc(s.mode === "hard" ? DC.drawerSubHard : DC.drawerSubMedium) + "</p>" +
      '<div class="stack-15">' + rows + "</div>" +
      '<div class="rail-tag">' + U.syntheticTag() + "</div>" +
      "</section>"
    );
  }

  // ---------------- Objective rail ----------------

  function viewObjectiveRail(s, insideSheet) {
    var objectives = D.OBJECTIVES[s.mode];
    var doneCount = 0;
    var upNext = null;
    for (var i = 0; i < objectives.length; i++) {
      if (S.objState(s, objectives[i].id).done) doneCount++;
      else if (!upNext) upNext = objectives[i];
    }
    var selected =
      objectives.some(function (o) {
        return o.id === s.selectedObjective;
      })
        ? s.selectedObjective
        : upNext ? upNext.id : objectives[0] ? objectives[0].id : null;

    var rows = "";
    for (var k = 0; k < objectives.length; k++) {
      var o = objectives[k];
      var st = S.objState(s, o.id);
      var isNext = upNext && upNext.id === o.id;
      var isSel = selected === o.id;
      var ic = st.done ? U.icon("ic-check-circle-2", "ic-green ic-45") : st.lastResult === "fail" ? U.icon("ic-circle-x", "ic-red ic-45") : U.icon("ic-circle", "ic-dim ic-45");
      rows +=
        '<li><button type="button" data-act="select-obj" data-obj="' + o.id + '" aria-current="' + (isSel ? "true" : "false") +
        '" class="obj-row' + (isSel ? " obj-sel" : "") + (st.done && !isSel ? " obj-done" : "") + '">' +
        '<span class="obj-ic">' + ic + "</span>" +
        '<span class="obj-main"><span class="obj-line1"><span class="obj-id">' + o.id + "</span>" +
        '<span class="obj-title' + (st.done ? " obj-title-done" : "") + '">' + U.esc(o.title) + "</span>" +
        (isNext && !st.done
          ? '<span class="obj-next">' + U.icon("ic-arrow-down", "ic-25") + " " + DC.upNext + "</span>"
          : "") +
        "</span>" +
        '<span class="obj-line2">' + U.pillarBadge(o.pillar) +
        (st.hintsUsed > 0
          ? '<span class="obj-hints">' + (s.mode === "hard" ? DC.nudgeSpent : DC.hintSpent(st.hintsUsed)) + "</span>"
          : "") +
        "</span></span></button></li>";
    }
    return (
      '<section aria-label="Objectives tracker"' + (insideSheet ? ' class="px-1"' : "") + ">" +
      '<header class="rail-head"><h3 class="rail-h">' + DC.objectivesH + '</h3><span class="rail-count" aria-live="polite">' + doneCount + "/" + objectives.length + " " + DC.complete + "</span></header>" +
      '<ol class="obj-list">' + rows + "</ol></section>"
    );
  }

  // ---------------- Instruments (InstrumentsA / InstrumentsB) ----------------

  function instrMatch(s) {
    var v = s.env.match;
    var html = '<div class="stack-3">' + U.miniModelStrip();
    for (var i = 0; i < D.MATCH_DEFS.length; i++) {
      var d = D.MATCH_DEFS[i];
      html +=
        '<div class="panel-card"><p class="mono-q">' + U.esc(d.text) + "</p>" +
        '<div role="radiogroup" aria-label="' + U.esc(DC.modelFor(d.id)) + '">' +
        U.optionChips({ options: D.MATCH_OPTS, value: v[d.id], label: DC.modelFor(d.id), envField: "match", envKey: d.id, shuffleKey: "m1-" + d.id }) +
        "</div></div>";
    }
    return html + "</div>";
  }

  function instrMatchH(s) {
    var v = s.env.matchH;
    var html = '<div class="stack-3">' + U.miniModelStrip();
    for (var i = 0; i < D.MATCH_H_DEFS.length; i++) {
      var d = D.MATCH_H_DEFS[i];
      html +=
        '<div class="panel-card"><p class="mono-q">' + U.esc(d.text) + "</p>" +
        '<div role="radiogroup" aria-label="' + U.esc(DC.quoteFor(d.id)) + '">' +
        U.optionChips({ options: D.MATCH_OPTS, value: v[d.id], label: DC.quoteFor(d.id), envField: "matchH", envKey: d.id, shuffleKey: "h10-" + d.id }) +
        "</div></div>";
    }
    return html + "</div>";
  }

  function instrKestrel(s) {
    var toggleBtn = U.docViewer(D.KESTREL_DOC, true, s.env.kestrelLines, "env-toggle-kestrel");
    return (
      '<div class="stack-4">' +
      "<div><p class=\"instr-step\">1 — Stamp the model that fits <span class=\"text-primary\">Kestrel Analytics</span>:</p>" +
      U.modelStampRow(s.env.kestrelModel, "env-chip", 'data-env="kestrelModel" data-key=""') +
      "</div>" +
      '<div><p class="instr-step">2 — Tag every brief line that justifies the choice:</p>' + toggleBtn + "</div>" +
      "</div>"
    );
  }

  function instrClassify(s) {
    var v = s.env.classify;
    var html = '<div class="stack-3">' + U.miniModelStrip();
    for (var i = 0; i < D.CLASSIFY_CASES.length; i++) {
      var c = D.CLASSIFY_CASES[i];
      html +=
        '<div class="panel-card"><p class="case-name">' + U.esc(c.client) + '</p><p class="case-text">' + U.esc(c.text) + "</p>" +
        '<div role="radiogroup" aria-label="' + U.esc(DC.classifyFor(c.client)) + '">' +
        U.optionChips({ options: D.CLASSIFY_OPTS, value: v[c.id], label: DC.classifyFor(c.client), envField: "classify", envKey: c.id, shuffleKey: "m6-" + c.id }) +
        "</div></div>";
    }
    return html + "</div>";
  }

  function instrFlags(s) {
    var doc = null;
    for (var i = 0; i < D.DOCS.length; i++) if (D.DOCS[i].id === "d2") doc = D.DOCS[i];
    return (
      '<div class="stack-3">' +
      '<p class="note-box">' + DC.flagsNote.replace("binding constraint", "<strong>binding constraint</strong>") + "</p>" +
      U.docViewer(doc, true, s.env.redFlags, "env-toggle-flags") +
      "</div>"
    );
  }

  function instrCost(s) {
    var rows = "";
    for (var i = 0; i < D.COST_ROWS.length; i++) {
      var r = D.COST_ROWS[i];
      rows +=
        "<tr><td class=\"cost-model\">" + U.esc(r.model) + "</td><td>" + U.esc(r.upfront) + "</td><td>" + U.esc(r.run) +
        "</td><td>" + U.esc(r.capacity) + "</td><td>" + U.esc(r.ops) + "</td></tr>";
    }
    var v = s.env.costQ;
    return (
      '<div class="stack-4">' +
      '<div class="table-wrap"><table class="cost-table">' +
      '<caption class="cost-caption">' + DC.costTableCaption + "</caption>" +
      "<thead><tr><th>Option</th><th>Up-front</th><th>Run cost</th><th>Capacity</th><th>Operations</th></tr></thead>" +
      "<tbody>" + rows + "</tbody></table></div>" +
      '<div class="panel-card"><p class="panel-q">' + DC.costQ1 + "</p>" +
      U.optionChips({ options: D.COST_Q1_OPTIONS, value: v["q-cost1"], label: DC.q1Label, envField: "costQ", envKey: "q-cost1", shuffleKey: "m9-q1" }) +
      "</div>" +
      '<div class="panel-card"><p class="panel-q">' + DC.costQ2 + "</p>" +
      U.optionChips({ options: D.COST_Q2_OPTIONS, value: v["q-cost2"], label: DC.q2Label, envField: "costQ", envKey: "q-cost2", shuffleKey: "m9-q2" }) +
      "</div>" +
      "</div>"
    );
  }

  function instrCases(s) {
    var v = s.env.miniCases;
    var html = '<div class="stack-3">' + U.miniModelStrip();
    for (var i = 0; i < D.MINI_CASES.length; i++) {
      var c = D.MINI_CASES[i];
      html +=
        '<div class="panel-card"><p class="case-name">' + U.esc(c.client) + '</p><p class="case-text">' + U.esc(c.text) + "</p>" +
        '<p class="fact-label fact-label-gap">' + DC.modelLabel + "</p>" +
        U.modelStampRow(v[c.id] ? v[c.id].model : null, "env-chip", 'data-env="miniCases" data-key="' + c.id + '.model"') +
        '<p class="fact-label fact-label-gap">' + DC.driverLabel + "</p>" +
        U.optionChips({ options: c.drivers, value: v[c.id] ? v[c.id].driver : null, label: DC.driverFor(c.client), envField: "miniCases", envKey: c.id + ".driver", shuffleKey: "m10-" + c.id }) +
        "</div>";
    }
    return html + "</div>";
  }

  function instrRisks(s) {
    var v = s.env.riskPairs;
    var html = '<div class="stack-3">';
    for (var i = 0; i < D.RISKS_M.length; i++) {
      var r = D.RISKS_M[i];
      var opts = [];
      for (var j = 0; j < D.MITIGATIONS_M.length; j++) {
        opts.push({ id: D.MITIGATIONS_M[j].id, text: D.MITIGATIONS_M[j].label + " — " + D.MITIGATIONS_M[j].detail });
      }
      html +=
        '<div class="panel-card"><p class="panel-q"><span class="workload-id">' + r.id.toUpperCase() + "</span>" + U.esc(r.risk) + "</p>" +
        U.optionChips({ options: opts, value: v[r.id], label: DC.mitigationFor(r.risk), envField: "riskPairs", envKey: r.id, columns: true, shuffleKey: "m11-" + r.id }) +
        "</div>";
    }
    return html + "</div>";
  }

  function instrMemo(s, hard) {
    if (hard) {
      var m = s.env.memoH;
      return (
        '<div class="stack-4">' +
        '<div><p class="instr-step">' + DC.memoStampH + "</p>" +
        U.modelStampRow(m.model, "env-chip", 'data-env="memoH" data-key="model"') + "</div>" +
        '<div><p class="instr-step">' + DC.memoMapH + "</p>" +
        U.multiChips({ options: D.MEMO_MAPPINGS_H, values: m.mappings, act: "env-memoH-toggle", label: DC.mapLabel }) + "</div>" +
        '<div><p class="instr-step">' + DC.memoTrade + "</p>" +
        U.optionChips({ options: D.MEMO_TRADEOFFS, value: m.tradeoff, label: DC.tradeLabel, envField: "memoH", envKey: "tradeoff", columns: true, shuffleKey: "h8-tradeoff" }) + "</div>" +
        '<div><p class="instr-step">' + DC.memoExit + "</p>" +
        U.optionChips({ options: D.MEMO_EXITS, value: m.exit, label: DC.exitLabel, envField: "memoH", envKey: "exit", columns: true, shuffleKey: "h8-exit" }) + "</div>" +
        "</div>"
      );
    }
    var mm = s.env.memo;
    return (
      '<div class="stack-4">' +
      '<div><p class="instr-step">' + DC.memoStampM + "</p>" +
      U.modelStampRow(mm.model, "env-chip", 'data-env="memo" data-key="model"') + "</div>" +
      '<div><p class="instr-step">' + DC.memoMapM + "</p>" +
      U.multiChips({ options: D.MEMO_MAPPINGS_M, values: mm.mappings, act: "env-memo-toggle", label: DC.mapLabel }) + "</div>" +
      '<div><p class="instr-step">' + DC.memoTrade + "</p>" +
      U.optionChips({ options: D.MEMO_TRADEOFFS, value: mm.tradeoff, label: DC.tradeLabel, envField: "memo", envKey: "tradeoff", columns: true, shuffleKey: "m12-tradeoff" }) + "</div>" +
      "</div>"
    );
  }

  function instrTriage(s) {
    var html =
      '<div class="stack-4">' +
      '<p class="note-box">Tag binding constraints across <strong>all</strong> documents. Memo lines, articles and preferences can be tagged too — if you can defend them as binding. Tagged so far: <strong class="text-primary">' +
      s.env.triage.length + "</strong></p>";
    for (var i = 0; i < D.DOCS.length; i++) {
      html += U.docViewer(D.DOCS[i], true, s.env.triage, "env-toggle-triage");
    }
    return html + "</div>";
  }

  function instrElim(s) {
    var v = s.env.elim;
    var html = '<div class="stack-3">';
    for (var i = 0; i < D.ELIMINATE_MODELS.length; i++) {
      var em = D.ELIMINATE_MODELS[i];
      var st = v[em.id] || { on: false, reason: null };
      html +=
        '<div class="panel-card"><div class="elim-head"><div>' +
        '<p class="case-name">' + U.esc(em.name) + '</p><p class="workload-note">' + U.esc(em.claim) + "</p></div>" +
        '<button type="button" aria-pressed="' + st.on + '" data-act="env-elim" data-arg="' + em.id + '" class="' +
        (st.on ? "stamp-elim stamp-elim-on" : "stamp-elim") + '"' + (st.on ? ' style="transform:rotate(-8deg)"' : "") + ">" +
        (st.on ? DC.eliminated : DC.eliminate) +
        "</button></div>";
      if (st.on) {
        html +=
          '<div class="elim-reasons"><p class="fact-label fact-label-gap">' + DC.elimKiller + "</p>" +
          U.optionChips({ options: D.ELIM_REASONS, value: st.reason, label: DC.killingFor(em.name), envField: "elim", envKey: em.id + ".reason", columns: true, shuffleKey: "h2-" + em.id }) +
          "</div>";
      }
      html += "</div>";
    }
    return html + "</div>";
  }

  function instrPattern(s) {
    var html = '<div class="stack-3">' + U.miniModelStrip() + '<div role="radiogroup" aria-label="Architecture pattern" class="stack-2">';
    for (var i = 0; i < D.PATTERNS.length; i++) {
      var p = D.PATTERNS[i];
      var active = s.env.pattern === p.id;
      html +=
        '<button type="button" role="radio" aria-checked="' + active + '" data-act="env-chip" data-env="pattern" data-key="" data-val="' + p.id +
        '" class="pattern-row' + (active ? " chip-on" : "") + '"><span class="pattern-id">' + p.id.toUpperCase() + "</span><span>" + U.esc(p.text) + "</span></button>";
    }
    return html + "</div></div>";
  }

  function instrPlaceH(s) {
    return U.placementBoard(D.WORKLOADS_H, D.TARGETS_H, s.env.placementH, "placementH");
  }

  function instrService(s) {
    return (
      '<div class="stack-3">' +
      '<p class="note-box">' + DC.serviceNote + "</p>" +
      U.panelQs(D.SERVICE_QS, s.env.serviceH, "serviceH", "h5") +
      "</div>"
    );
  }

  function instrPlan(s) {
    var html =
      '<div role="radiogroup" aria-label="Provider plan" class="stack-3">' +
      '<p class="note-box">' + DC.planNote + "</p>";
    for (var i = 0; i < D.PLANS.length; i++) {
      var p = D.PLANS[i];
      var active = s.env.plan === p.id;
      html +=
        '<button type="button" role="radio" aria-checked="' + active + '" data-act="env-chip" data-env="plan" data-key="" data-val="' + p.id +
        '" class="plan-card' + (active ? " chip-on" : "") + '">' +
        '<span class="plan-head"><span class="case-name">' + U.esc(p.name) + '</span><span class="mono-xs">' + U.esc(p.price) + "</span></span>" +
        '<dl class="plan-facts">' +
        "<div><dt>" + DC.slaLabel + '</dt><dd class="fact-strong">' + U.esc(p.sla) + "</dd></div>" +
        "<div><dt>" + DC.regionsLabel + '</dt><dd class="fact-strong">' + U.esc(p.regions) + "</dd></div>" +
        "<div><dt>" + DC.commitmentLabel + '</dt><dd class="fact-strong">' + U.esc(p.commitment) + "</dd></div>" +
        "</dl></button>";
    }
    return html + "</div>";
  }

  function instrRiskH(s) {
    var top = s.env.riskTop;
    var html =
      '<div class="stack-4">' +
      '<p class="note-box">' + DC.step1 + "</p>" +
      '<div role="group" aria-label="Risk selection" class="stack-2">';
    for (var i = 0; i < D.RISKS_H.length; i++) {
      var r = D.RISKS_H[i];
      var active = top.indexOf(r.id) >= 0;
      html +=
        '<button type="button" aria-pressed="' + active + '" data-act="env-risk-toggle" data-arg="' + r.id +
        '" class="risk-row' + (active ? " chip-on" : "") + '"><span><p class="panel-q">' + U.esc(r.risk) +
        '</p><p class="risk-signal">' + DC.signalLabel + " " + U.esc(r.signal) + "</p></span></button>";
    }
    html += "</div>";
    if (top.length > 0) {
      html += '<div class="panel-card"><p class="fact-label">' + DC.step2(top.length) + "</p>";
      for (var k = 0; k < top.length; k++) {
        var rid = top[k];
        var risk = null;
        for (var q = 0; q < D.RISKS_H.length; q++) if (D.RISKS_H[q].id === rid) risk = D.RISKS_H[q];
        var opts = [];
        for (var j = 0; j < D.MITIGATIONS_H.length; j++) {
          opts.push({ id: D.MITIGATIONS_H[j].id, text: D.MITIGATIONS_H[j].label + " — " + D.MITIGATIONS_H[j].detail });
        }
        html +=
          '<div class="risk-pair"><p class="risk-pair-q">' + U.esc(risk ? risk.risk : rid) + "</p>" +
          U.optionChips({ options: opts, value: s.env.riskMapH[rid], label: DC.mitigationFor(rid), envField: "riskMapH", envKey: rid, columns: true, shuffleKey: "h7-" + rid }) +
          "</div>";
      }
      html += "</div>";
    }
    return html + "</div>";
  }

  function instrDrill(s) {
    var seq = s.env.drill;
    var remaining = 0;
    var actions = "";
    for (var i = 0; i < D.DRILL_ACTIONS.length; i++) {
      var a = D.DRILL_ACTIONS[i];
      var pos = seq.indexOf(a.id);
      var used = pos >= 0;
      if (!used) remaining++;
      actions +=
        '<button type="button" data-act="env-drill-add" data-arg="' + a.id + '"' + (used ? " disabled" : "") +
        ' class="drill-row' + (used ? " chip-on" : "") + '">' +
        '<span class="drill-num">' + (used ? pos + 1 : "·") + "</span><span>" + U.esc(a.text) + "</span></button>";
    }
    var queueText = seq.length === 0 ? DC.queueEmpty : seq.map(function (id) {
      for (var i = 0; i < D.DRILL_ACTIONS.length; i++) {
        if (D.DRILL_ACTIONS[i].id === id) return D.DRILL_ACTIONS[i].text.slice(0, 34) + "…";
      }
      return id;
    }).join(" → ");
    return (
      '<div class="stack-4">' +
      '<div class="doc-paper drill-brief">' +
      '<p class="incident-tag">' + DC.incident + "</p>" +
      '<p class="case-name">' + DC.incidentH + "</p>" +
      '<p class="workload-note">' + DC.incidentSub + "</p>" +
      "</div>" +
      '<div class="drill-queue-row"><p class="instr-step">' + DC.executionQueue +
      ' <span class="mono text-primary">' + U.esc(queueText) + "</span></p>" +
      '<button type="button" data-act="env-drill-clear" class="btn btn-outline btn-sm">' + U.icon("ic-rotate-ccw") + " " + DC.clear + "</button></div>" +
      '<div class="stack-2" role="group" aria-label="Actions to execute in order">' + actions + "</div>" +
      (remaining === 0 ? '<p class="workload-note">' + DC.queuedNote + "</p>" : "") +
      "</div>"
    );
  }

  function renderInstrument(objective, s) {
    switch (objective.instrument) {
      case "match": return instrMatch(s);
      case "matchH": return instrMatchH(s);
      case "tenancy": return U.panelQs(D.TENANCY_QS, s.env.tenancy, "tenancy", "m2");
      case "ladder": return U.panelQs(D.LADDER_QS, s.env.ladder, "ladder", "m3");
      case "shared": return U.panelQs(D.SHARED_QS, s.env.shared, "shared", "m4");
      case "kestrel": return instrKestrel(s);
      case "classify": return instrClassify(s);
      case "placeM": return U.placementBoard(D.WORKLOADS_M, D.TARGETS_M, s.env.placementM, "placementM");
      case "flags": return instrFlags(s);
      case "cost": return instrCost(s);
      case "cases": return instrCases(s);
      case "risks": return instrRisks(s);
      case "memo": return instrMemo(s, false);
      case "triage": return instrTriage(s);
      case "elim": return instrElim(s);
      case "pattern": return instrPattern(s);
      case "placeH": return instrPlaceH(s);
      case "service": return instrService(s);
      case "plan": return instrPlan(s);
      case "riskH": return instrRiskH(s);
      case "memoH": return instrMemo(s, true);
      case "drill": return instrDrill(s);
      default: return "";
    }
  }

  // ---------------- Workbench ----------------

  function viewWorkbench(s) {
    var objectives = D.OBJECTIVES[s.mode];
    var objective = null;
    for (var i = 0; i < objectives.length; i++) if (objectives[i].id === s.selectedObjective) objective = objectives[i];
    if (!objective) {
      for (var j = 0; j < objectives.length; j++) {
        if (!S.objState(s, objectives[j].id).done) { objective = objectives[j]; break; }
      }
    }
    if (!objective) objective = objectives[0];

    var oState = S.objState(s, objective.id);
    var hard = s.mode === "hard";
    var checkedNow = oState.lastResult !== null;
    var lastNote = ui.noteFor.id === objective.id ? ui.noteFor.note : null;
    var nextIncomplete = null;
    for (var k = 0; k < objectives.length; k++) {
      if (!S.objState(s, objectives[k].id).done) { nextIncomplete = objectives[k]; break; }
    }
    var canCheckNow = E.validateObjective(objective.id, s.env).pass;

    // Hints
    var hintsHtml = "";
    if (hard) {
      hintsHtml =
        '<button type="button" data-act="hint" class="btn btn-outline btn-sm btn-h44"' + (s.env.nudgeUsed ? " disabled" : "") + ">" +
        (s.env.nudgeUsed ? DC.nudgeSpentBtn : DC.nudgeTake) + "</button>";
    } else {
      for (var lvl = 1; lvl <= 3; lvl++) {
        var unlocked = oState.hintsUsed >= lvl;
        hintsHtml +=
          '<button type="button" data-act="hint" data-lvl="' + lvl + '" class="btn btn-outline btn-sm btn-h44"' + (unlocked ? " disabled" : "") + ">" +
          (unlocked ? DC.hintShown(lvl) : DC.hintBtn(lvl)) + "</button>";
      }
    }
    var shownHints = "";
    if (oState.hintsUsed > 0) {
      var count = hard ? 1 : oState.hintsUsed;
      for (var h = 0; h < objective.hints.length && h < count; h++) {
        shownHints += '<li class="hint-item">' + U.esc(objective.hints[h]) + "</li>";
      }
    }
    var nudgeElse = hard && s.env.nudgeUsed && oState.hintsUsed === 0
      ? '<p class="hint-else">' + DC.nudgeElsewhere + "</p>" : "";

    // Feedback
    var feedback = "";
    if (checkedNow) {
      feedback =
        '<div class="verdict-row">' + U.stampVerdict(oState.lastResult === "pass") +
        '<p class="verdict-text">' + U.esc(oState.lastResult === "pass" ? objective.feedbackPass : objective.feedbackFail) + "</p></div>";
      if (oState.lastResult === "fail" && lastNote) {
        feedback += '<p class="near-miss"><strong>' + DC.nearMiss + "</strong>" + U.esc(lastNote) + "</p>";
      }
      if (oState.lastResult === "fail" && oState.attempts > 1) {
        feedback += '<p class="retry-note">' + U.icon("ic-circle-x", "ic-red") + " " + DC.again + "</p>";
      }
    }

    var nextBtn = "";
    if (oState.lastResult === "pass" && nextIncomplete && nextIncomplete.id !== objective.id) {
      nextBtn =
        '<button type="button" data-act="select-obj" data-obj="' + nextIncomplete.id + '" class="btn btn-outline btn-h44">' +
        (hard ? DC.nextChallenge : DC.nextObjective) + " " + U.icon("ic-arrow-right") + "</button>";
    }

    return (
      '<section aria-label="Workbench — ' + U.esc(objective.title) + '" class="min-w-0">' +
      '<header class="wb-head">' +
      '<div class="wb-head-top"><p class="kicker-sm">' + objective.id + " · " + DC.workbench + "</p>" +
      (oState.done
        ? '<span class="wb-done">' + U.icon("ic-check-circle-2") + " " + DC.objComplete +
          (oState.attempts > 1 ? ' · <span class="wb-attempts">' + oState.attempts + " " + DC.checksSuffix + "</span>" : "") + "</span>"
        : "") +
      "</div>" +
      '<h3 class="wb-title">' + U.esc(objective.title) + "</h3>" +
      '<p class="wb-context">' + U.esc(objective.context) + "</p>" +
      '<p class="wb-task">' + U.esc(objective.task) + "</p>" +
      "</header>" +
      '<div class="inst-swap" key="' + objective.id + '">' + renderInstrument(objective, s) + "</div>" +
      '<div class="hints-box">' +
      '<p class="hints-label">' + U.icon("ic-lightbulb") + " " + (hard ? DC.hintsHardLabel : DC.hintsMediumLabel) + "</p>" +
      '<div class="hints-row">' + hintsHtml + "</div>" +
      (shownHints ? '<ul class="hint-list">' + shownHints + "</ul>" : "") +
      nudgeElse +
      "</div>" +
      '<div class="check-box">' +
      '<div class="check-row">' +
      '<button type="button" data-act="check-obj" class="btn btn-primary btn-lg btn-check">' + DC.checkResults + "</button>" +
      nextBtn +
      (canCheckNow && !oState.done ? '<span class="looks-complete">' + DC.looksComplete + "</span>" : "") +
      "</div>" +
      '<div aria-live="polite" class="verdict-live">' + feedback + "</div>" +
      "</div></section>"
    );
  }

  // ---------------- Stage 03 · Desk ----------------

  function viewDesk(s) {
    var mode = s.mode;
    var objectives = D.OBJECTIVES[mode];
    var doneCount = 0;
    for (var i = 0; i < objectives.length; i++) if (S.objState(s, objectives[i].id).done) doneCount++;
    var docCount = D.DOCS.filter(function (d) { return mode === "hard" ? true : !d.hardOnly; }).length;
    return (
      '<main class="stage-desk stage-enter">' +
      '<header class="desk-head">' +
      '<p class="kicker">' + DC.kicker + "</p>" +
      '<h2 class="desk-h">' + U.esc(D.CLIENT.name) + "</h2>" +
      '<p class="desk-sub">' + U.esc(D.CLIENT.profile) + " " +
      U.esc(mode === "hard" ? DC.subHard : DC.subMedium) + "</p>" +
      "</header>" +
      // Mobile instrument switchboard
      '<div class="desk-mobile">' +
      '<button type="button" data-act="open-sheet" data-sheet="evidence" class="btn btn-outline btn-h44">' +
      U.icon("ic-file-text", "ic-primary") + " " + DC.evidenceBtn + " (" + docCount + ")</button>" +
      '<button type="button" data-act="open-sheet" data-sheet="objectives" class="btn btn-outline btn-h44">' +
      U.icon("ic-clipboard-list", "ic-primary") + " " + DC.objectivesBtn + " (" + doneCount + "/" + objectives.length + ")</button>" +
      "</div>" +
      '<div class="desk-grid-3">' +
      '<aside class="desk-aside desk-aside-l"><div class="aside-card">' + viewEvidenceDrawer(s) + "</div></aside>" +
      '<div class="desk-main">' + viewWorkbench(s) + "</div>" +
      '<aside class="desk-aside desk-aside-r"><div class="aside-card">' + viewObjectiveRail(s) +
      '<p class="rail-tag rail-tag-desk">' + U.syntheticTag() + "</p></div></aside>" +
      "</div></main>"
    );
  }

  // ---------------- Stage 05 · Debrief ----------------

  function viewDebrief(s) {
    var B = D.DEBRIEF;
    var signalRows = "";
    for (var i = 0; i < B.signals.length; i++) {
      signalRows += "<tr><td class=\"mono-q\">" + U.esc(B.signals[i].signal) + "</td><td>" + U.esc(B.signals[i].says) + "</td></tr>";
    }
    var mitigations = s.mode === "hard" ? D.MITIGATIONS_H : D.MITIGATIONS_M;
    var controls = "";
    for (var j = 0; j < mitigations.length; j++) {
      controls +=
        '<div class="panel-card"><p class="case-name">' + U.esc(mitigations[j].label) + '</p><p class="workload-note">' + U.esc(mitigations[j].detail) + "</p></div>";
    }
    function bullets(items) {
      var out = "";
      for (var k = 0; k < items.length; k++) {
        out += '<li class="debrief-li"><span class="tri" aria-hidden="true">▸</span><span><strong>' + U.esc(items[k].lead) + "</strong>" + U.esc(items[k].body) + "</span></li>";
      }
      return out;
    }
    return (
      '<main class="stage-narrow stage-enter">' +
      U.sectionTitle(B.kicker, B.title, B.sub) +
      '<section class="debrief-sec" aria-labelledby="signals-h">' +
      '<h3 id="signals-h" class="debrief-h">' + U.icon("ic-eye", "ic-primary") + " " + B.signalsH + "</h3>" +
      '<div class="table-wrap rounded-md"><table class="cost-table debrief-table">' +
      "<thead><tr><th>If the evidence says…</th><th>The analysis points to…</th></tr></thead>" +
      "<tbody>" + signalRows + "</tbody></table></div></section>" +
      '<section class="debrief-sec" aria-labelledby="controls-h">' +
      '<h3 id="controls-h" class="debrief-h">' + U.icon("ic-shield-check", "ic-primary") + " " + B.controlsH + "</h3>" +
      '<div class="grid-2">' + controls + "</div></section>" +
      '<section class="debrief-sec" aria-labelledby="defender-h">' +
      '<h3 id="defender-h" class="debrief-h">' + U.icon("ic-trending-up", "ic-primary") + " " + B.defenderH + "</h3>" +
      '<ul class="debrief-list">' + bullets(B.defender) + "</ul></section>" +
      '<section class="debrief-sec" aria-labelledby="notes-h">' +
      '<h3 id="notes-h" class="debrief-h">' + U.icon("ic-gavel", "ic-primary") + " " + B.notesH + "</h3>" +
      '<ul class="debrief-list">' + bullets(B.notes) + "</ul></section>" +
      '<section class="debrief-sec" aria-labelledby="ref-h">' +
      '<h3 id="ref-h" class="debrief-h">' + B.refH + "</h3>" +
      '<a href="' + B.refUrl + '" target="_blank" rel="noopener noreferrer" class="ref-link">' +
      U.icon("ic-external-link", "ic-primary") + " " + U.esc(B.refLabel) + "</a></section>" +
      '<div class="center">' +
      '<button type="button" data-act="open-completion" class="btn btn-primary btn-lg btn-cta">' +
      U.esc(B.resultsCta) + " " + U.icon("ic-arrow-right") + "</button>" +
      "</div></main>"
    );
  }

  // ---------------- Completion modal ----------------

  function viewCompletion(s) {
    if (!ui.modalOpen || !s.mode) return "";
    var M = D.MODAL_COPY;
    var prog = S.computeProgress(s);
    var mode = s.mode;
    var objectives = D.OBJECTIVES[mode];
    var firstTry = 0;
    var hints = s.env.nudgeUsed ? 1 : 0;
    for (var i = 0; i < objectives.length; i++) {
      var st = S.objState(s, objectives[i].id);
      if (st.done && st.firstTry) firstTry++;
      hints += st.hintsUsed;
    }
    // R8 — focus areas derived from THIS student's actual evidence
    var focus = [];
    for (var f = 0; f < objectives.length; f++) {
      var o = objectives[f];
      var st2 = S.objState(s, o.id);
      if (!st2.done || st2.attempts > 1 || st2.hintsUsed > 0) {
        var fo = D.OBJ_FOCUS[o.id] || { topic: o.title, action: o.task };
        focus.push({ key: o.id, topic: fo.topic, action: fo.action });
      }
    }
    var quizItems = D.QUIZ[mode];
    for (var q = 0; q < quizItems.length; q++) {
      var qz = quizItems[q];
      if (s.quiz.checked[qz.id] && s.quiz.answers[qz.id] !== qz.answer) {
        var qf = D.QUIZ_FOCUS[qz.id] || { topic: qz.prompt, action: qz.explanation };
        focus.push({ key: qz.id, topic: qf.topic, action: qf.action });
      }
    }

    var pillarBlocks = "";
    for (var p = 0; p < D.PILLARS.length; p++) {
      var pil = D.PILLARS[p];
      var group = [];
      for (var g = 0; g < objectives.length; g++) if (objectives[g].pillar === pil.id) group.push(objectives[g]);
      var items = "";
      var doneIn = 0;
      for (var y = 0; y < group.length; y++) {
        var st3 = S.objState(s, group[y].id);
        if (st3.done) doneIn++;
        items +=
          '<li class="recap-li"><svg class="icon ic-35' + (st3.done ? " star-green" : " ic-dim") +
          '" aria-hidden="true"><use href="#ic-star"></use></svg><span class="' + (st3.done ? "" : "text-dim") + '">' +
          U.esc(group[y].title) + "</span></li>";
      }
      pillarBlocks +=
        '<div class="panel-card recap-card"><div class="recap-head">' + U.pillarBadge(pil.id) +
        '<span class="rail-count">' + doneIn + "/" + group.length + "</span></div>" +
        '<ul class="recap-list">' + items + "</ul></div>";
    }

    var focusHtml;
    if (focus.length === 0) {
      focusHtml = '<p class="focus-text">' + M.focusClean + "</p>";
    } else {
      var focusItems = "";
      for (var z = 0; z < focus.length; z++) {
        focusItems +=
          '<li class="focus-li"><span class="focus-topic">' + U.esc(focus[z].topic) + "</span>" +
          '<span class="focus-action">' + U.esc(focus[z].action) + "</span></li>";
      }
      focusHtml =
        '<p class="focus-derived">' + M.focusDerived + "</p>" +
        '<ul class="focus-list">' + focusItems + "</ul>";
    }

    var nextItems = "";
    for (var n = 0; n < D.NEXT_STEPS.length; n++) nextItems += "<li>" + U.esc(D.NEXT_STEPS[n]) + "</li>";

    return (
      '<div class="overlay" data-overlay="modal"><div class="overlay-backdrop" data-act="overlay-close"></div>' +
      '<div class="dialog modal-dialog" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-desc">' +
      '<button type="button" class="dialog-x" data-act="overlay-close" aria-label="Close">' + U.icon("ic-x") + "</button>" +
      '<div class="dialog-head">' +
      '<h2 id="modal-title" class="modal-title">' + M.title + "</h2>" +
      U.stampVerdict(true, M.stamp) +
      "</div>" +
      '<p id="modal-desc" class="modal-desc">' + (mode === "hard" ? M.descHard : M.descMedium) + "</p>" +
      '<div class="score-grid">' +
      "<div><p class=\"fact-label\">" + M.overall + '</p><p class="score-big">' + prog.overallPct + "%</p>" +
      '<p class="workload-note">' + prog.done + "/" + prog.total + " objectives · " + prog.quizCorrect + "/" + prog.quizTotal + " quiz</p></div>" +
      '<div><p class="fact-label">' + M.starRating + '</p><div class="star-row" aria-label="' + prog.stars + ' of 3 stars">' +
      U.stars(prog.stars, "star-lg") + "</div>" +
      '<p class="workload-note">' + (prog.stars === 3 ? M.star3 : prog.stars === 2 ? M.star2 : prog.stars === 1 ? M.star1 : M.star0) + "</p></div>" +
      '<div><p class="fact-label">' + M.craft + '</p><p class="craft-line">' + M.firstAttempt + " <strong>" + firstTry + "/" + objectives.length + "</strong></p>" +
      '<p class="craft-line">' + (mode === "hard" ? M.nudgesUsed : M.hintsUsed) + "<strong>" + (mode === "hard" ? (s.env.nudgeUsed ? "1 (of 1)" : "0") : hints) + "</strong></p></div>" +
      "</div>" +
      '<div class="stack-3"><p class="fact-label">' + M.pillarRecap + "</p>" + pillarBlocks + "</div>" +
      '<div class="focus-box">' +
      '<p class="focus-h">' + M.focusH + "</p>" + focusHtml +
      "</div>" +
      '<div class="next-box"><p class="focus-h">' + M.nextH + '</p><ul class="next-list">' + nextItems + "</ul></div>" +
      '<div class="modal-foot">' +
      '<button type="button" data-act="overlay-close" class="btn btn-outline btn-h44">' + M.back + "</button>" +
      '<button type="button" data-act="restart-open" class="btn btn-outline btn-h44">' + U.icon("ic-rotate-ccw") + " " + M.restart + "</button>" +
      "</div></div></div>"
    );
  }

  // ---------------- Reset confirm (masthead) ----------------

  function viewResetConfirm() {
    if (!ui.resetOpen) return "";
    var M = D.MASTHEAD;
    return (
      '<div class="overlay" data-overlay="confirm"><div class="overlay-backdrop" data-act="reset-cancel"></div>' +
      '<div class="dialog confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-desc">' +
      '<h2 id="reset-title" class="modal-title">' + M.resetTitle + "</h2>" +
      '<p id="reset-desc" class="modal-desc">' + M.resetDesc + "</p>" +
      '<div class="confirm-foot">' +
      '<button type="button" data-act="reset-cancel" class="btn btn-outline btn-h44">' + M.resetCancel + "</button>" +
      '<button type="button" data-act="reset-confirm" class="btn btn-danger btn-h44">' + M.resetAction + "</button>" +
      "</div></div></div>"
    );
  }

  // ---------------- Restart confirm (completion modal) ----------------

  function viewRestartConfirm() {
    if (!ui.restartOpen) return "";
    var M = D.MODAL_COPY;
    return (
      '<div class="overlay" data-overlay="confirm"><div class="overlay-backdrop" data-act="restart-cancel"></div>' +
      '<div class="dialog confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="restart-title" aria-describedby="restart-desc">' +
      '<h2 id="restart-title" class="modal-title">' + M.restartTitle + "</h2>" +
      '<p id="restart-desc" class="modal-desc">' + M.restartDesc + "</p>" +
      '<div class="confirm-foot">' +
      '<button type="button" data-act="restart-cancel" class="btn btn-outline btn-h44">' + M.restartCancel + "</button>" +
      '<button type="button" data-act="restart-confirm" class="btn btn-danger btn-h44">' + M.restartAction + "</button>" +
      "</div></div></div>"
    );
  }

  // ---------------- Mobile bottom sheets ----------------

  function viewSheet(s) {
    if (!ui.sheet) return "";
    var content =
      ui.sheet === "evidence"
        ? "<div class='sheet-body'>" + viewEvidenceDrawer(s, true) + "</div>"
        : "<div class='sheet-body'>" + viewObjectiveRail(s, true) + "</div>";
    // Original SheetTitle copy: "Casefile — evidence drawer" / "Objectives tracker"
    var title = ui.sheet === "evidence" ? "Casefile — evidence drawer" : DC.trackerH;
    return (
      '<div class="overlay overlay-sheet" data-overlay="sheet"><div class="overlay-backdrop" data-act="sheet-close"></div>' +
      '<div class="sheet" role="dialog" aria-modal="true" aria-label="' + U.esc(title) + '">' +
      '<div class="sheet-head"><h2 class="sheet-title">' + U.esc(title) + "</h2>" +
      '<button type="button" class="dialog-x" data-act="sheet-close" aria-label="Close">' + U.icon("ic-x") + "</button></div>" +
      content +
      "</div></div>"
    );
  }

  // ======================================================================
  // Render
  // ======================================================================

  /**
   * Deterministic focus keys: every [data-act] control gets a stable data-fk
   * derived from its action + arguments, so keyboard focus can be restored
   * across full re-renders (the original kept focus via React reconciliation).
   */
  function annotateFocusKeys(root) {
    var els = root.querySelectorAll("[data-act]");
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var ds = el.dataset;
      var key =
        ds.act + "|" + (ds.mode || "") + "|" + (ds.stage || "") + "|" + (ds.env || "") + "|" +
        (ds.key || "") + "|" + (ds.val || "") + "|" + (ds.arg || "") + "|" + (ds.obj || "") + "|" +
        (ds.qid || "") + "|" + (ds.oid || "") + "|" + (ds.id || "") + "|" + (ds.lvl || "") + "|" +
        (ds.sheet || "");
      el.setAttribute("data-fk", key);
    }
  }

  function currentFocusKey() {
    var el = document.activeElement;
    if (!el || el === document.body) return null;
    var holder = el.closest("[data-fk]");
    return holder ? holder.getAttribute("data-fk") : null;
  }

  function render() {
    var s = S.get();

    // markVisited side effects (original: useEffect on mount)
    if (s.mode && s.stage === "briefing" && !s.briefingSeen) {
      S.markVisited("briefing");
      return;
    }
    if (s.mode && s.stage === "compendium" && !s.compendiumSeen) {
      S.markVisited("compendium");
      return;
    }

    // Completion modal auto-open logic (render-phase adjustment in the original):
    // auto-open exactly once, when completion happens during this session; a
    // resumed saved session with completedAt set stays closed.
    if (ui.seenCompletedAt === "init") {
      ui.seenCompletedAt = s.completedAt;
    } else if (s.completedAt && ui.seenCompletedAt === null) {
      ui.seenCompletedAt = s.completedAt;
      ui.modalOpen = true;
    }

    var fk = currentFocusKey();
    var root = document.getElementById("app");

    if (!s.mode) {
      root.innerHTML = viewModeSelect();
      annotateFocusKeys(root);
    } else {
      var stageHtml = "";
      switch (s.stage) {
        case "briefing": stageHtml = viewBriefing(s); break;
        case "compendium": stageHtml = viewCompendium(); break;
        case "desk": stageHtml = viewDesk(s); break;
        case "review": stageHtml = LabQuiz.view(s); break;
        case "debrief": stageHtml = viewDebrief(s); break;
        default: stageHtml = viewBriefing(s);
      }
      root.innerHTML =
        viewMasthead(s) +
        viewStageRail(s) +
        stageHtml +
        viewCompletion(s) +
        viewResetConfirm() +
        viewRestartConfirm() +
        viewSheet(s);
      annotateFocusKeys(root);
    }

    // restore keyboard focus to the control that had it
    if (fk) {
      var target = root.querySelector('[data-fk="' + fk.replace(/"/g, '\\"') + '"]');
      if (target && typeof target.focus === "function") {
        try { target.focus({ preventScroll: true }); } catch (e) { target.focus(); }
      }
    }
  }

  // ======================================================================
  // Actions (event delegation)
  // ======================================================================

  function setEnvChip(field, key, val) {
    S.updateEnv(function (env) {
      if (field === "miniCases" && key.indexOf(".") >= 0) {
        var parts = key.split(".");
        var cur = env.miniCases[parts[0]] || { model: null, driver: null };
        var next = Object.assign({}, env.miniCases);
        next[parts[0]] = Object.assign({}, cur);
        next[parts[0]][parts[1]] = val;
        return Object.assign({}, env, { miniCases: next });
      }
      if (field === "elim" && key.indexOf(".") >= 0) {
        var parts2 = key.split(".");
        var curE = env.elim[parts2[0]] || { on: false, reason: null };
        var nextE = Object.assign({}, env.elim);
        nextE[parts2[0]] = { on: curE.on, reason: parts2[1] === "reason" ? val : curE.reason };
        return Object.assign({}, env, { elim: nextE });
      }
      if (key === "") {
        var n = {};
        n[field] = val;
        return Object.assign({}, env, n);
      }
      var slot = {};
      slot[field] = Object.assign({}, env[field] || {});
      slot[field][key] = val;
      return Object.assign({}, env, slot);
    });
  }

  function toggleInArray(field, id) {
    S.updateEnv(function (env) {
      var arr = env[field] || [];
      var next = arr.indexOf(id) >= 0 ? arr.filter(function (x) { return x !== id; }) : arr.concat([id]);
      var patch = {};
      patch[field] = next;
      return Object.assign({}, env, patch);
    });
  }

  /** Memo mappings live inside the memo objects (env.memo.mappings / memoH). */
  function toggleMemoMapping(hard, id) {
    S.updateEnv(function (env) {
      var field = hard ? "memoH" : "memo";
      var cur = env[field];
      var next = cur.mappings.indexOf(id) >= 0
        ? cur.mappings.filter(function (x) { return x !== id; })
        : cur.mappings.concat([id]);
      var patch = {};
      patch[field] = Object.assign({}, cur, { mappings: next });
      return Object.assign({}, env, patch);
    });
  }

  /** Resolve the objective displayed in the workbench (same fallback chain). */
  function resolveWorkbenchObjective(s) {
    var objectives = D.OBJECTIVES[s.mode];
    var objective = null;
    for (var i = 0; i < objectives.length; i++) {
      if (objectives[i].id === s.selectedObjective) objective = objectives[i];
    }
    if (!objective) {
      for (var j = 0; j < objectives.length; j++) {
        if (!S.objState(s, objectives[j].id).done) { objective = objectives[j]; break; }
      }
    }
    if (!objective) objective = objectives[0];
    return objective;
  }

  function onAction(act, el) {
    var s = S.get();
    switch (act) {
      case "set-mode": {
        // fresh engagement view state (original remounted everything)
        ui.noteFor = { id: "", note: null };
        LabQuiz.resetView();
        ui.openDoc = null;
        ui.sheet = null;
        ui.modalOpen = false;
        ui.resetOpen = false;
        ui.restartOpen = false;
        ui.seenCompletedAt = "init";
        S.setMode(el.getAttribute("data-mode"));
        break;
      }
      case "go-stage": {
        ui.noteFor = { id: "", note: null };
        LabQuiz.resetView();
        ui.openDoc = null;
        ui.sheet = null;
        S.goStage(el.getAttribute("data-stage"));
        break;
      }
      case "theme": {
        S.setTheme(S.getTheme() === "dark" ? "light" : "dark");
        render(); // theme is outside lab state — re-render explicitly
        break;
      }
      case "reset-open": ui.resetOpen = true; render(); break;
      case "reset-cancel": ui.resetOpen = false; render(); break;
      case "reset-confirm": {
        ui.resetOpen = false;
        ui.modalOpen = false;
        ui.restartOpen = false;
        ui.seenCompletedAt = "init";
        ui.noteFor = { id: "", note: null };
        LabQuiz.resetView();
        ui.openDoc = null;
        ui.sheet = null;
        S.reset();
        break;
      }
      case "select-obj": S.selectObjective(el.getAttribute("data-obj")); break;
      case "check-obj": {
        // Resolve the displayed objective exactly like viewWorkbench does.
        var objective = resolveWorkbenchObjective(s);
        var res = S.checkObjective(objective.id);
        ui.noteFor = { id: objective.id, note: res.note || null };
        // Audit QA-9: stick the view on the objective that was just checked.
        if (S.get().selectedObjective !== objective.id) S.selectObjective(objective.id);
        else render();
        break;
      }
      case "hint": S.spendHint(currentObjectiveId(s)); break;
      case "env-chip": setEnvChip(el.getAttribute("data-env"), el.getAttribute("data-key"), el.getAttribute("data-val")); break;
      case "env-toggle-kestrel": toggleInArray("kestrelLines", el.getAttribute("data-arg")); break;
      case "env-toggle-flags": toggleInArray("redFlags", el.getAttribute("data-arg")); break;
      case "env-toggle-triage": toggleInArray("triage", el.getAttribute("data-arg")); break;
      case "env-memo-toggle": toggleMemoMapping(false, el.getAttribute("data-arg")); break;
      case "env-memoH-toggle": toggleMemoMapping(true, el.getAttribute("data-arg")); break;
      case "env-elim": {
        var mid = el.getAttribute("data-arg");
        S.updateEnv(function (env) {
          var cur = env.elim[mid] || { on: false, reason: null };
          var next = Object.assign({}, env.elim);
          next[mid] = { on: !cur.on, reason: cur.reason };
          return Object.assign({}, env, { elim: next });
        });
        break;
      }
      case "env-risk-toggle": {
        var rid = el.getAttribute("data-arg");
        S.updateEnv(function (env) {
          var next = env.riskTop.indexOf(rid) >= 0
            ? env.riskTop.filter(function (x) { return x !== rid; })
            : env.riskTop.concat([rid]);
          return Object.assign({}, env, { riskTop: next.slice(0, 3) });
        });
        break;
      }
      case "env-drill-add": {
        var aid = el.getAttribute("data-arg");
        S.updateEnv(function (env) {
          if (env.drill.indexOf(aid) >= 0) return env;
          return Object.assign({}, env, { drill: env.drill.concat([aid]) });
        });
        break;
      }
      case "env-drill-clear": S.patchEnv({ drill: [] }); break;
      case "open-doc": {
        var id = el.getAttribute("data-id");
        var wasOpen = ui.openDoc === id;
        ui.openDoc = wasOpen ? null : id;
        if (!wasOpen && s.env.docsRead.indexOf(id) < 0) {
          S.updateEnv(function (env) {
            return Object.assign({}, env, { docsRead: env.docsRead.concat([id]) });
          });
        } else {
          render();
        }
        break;
      }
      case "open-sheet": ui.sheet = el.getAttribute("data-sheet"); render(); break;
      case "sheet-close": ui.sheet = null; render(); break;
      case "quiz-pick": S.answerQuiz(el.getAttribute("data-qid"), el.getAttribute("data-oid")); break;
      case "quiz-check": {
        // Stick the view on the question just checked (original: setViewOverride(view)).
        var v = LabQuiz.currentView(S.get());
        LabQuiz.setView(v);
        S.checkQuizQuestion(LabQuiz.currentQuestion(S.get()).id);
        break;
      }
      case "quiz-next": LabQuiz.setView(LabQuiz.currentView(S.get()) + 1); render(); break;
      case "quiz-seal": S.completeQuiz(); S.goStage("debrief"); break;
      case "open-completion": ui.modalOpen = true; render(); break;
      case "overlay-close": ui.modalOpen = false; render(); break;
      case "restart-open": ui.restartOpen = true; render(); break;
      case "restart-cancel": ui.restartOpen = false; render(); break;
      case "restart-confirm": {
        ui.restartOpen = false;
        ui.modalOpen = false;
        ui.seenCompletedAt = "init";
        ui.noteFor = { id: "", note: null };
        LabQuiz.resetView();
        ui.openDoc = null;
        ui.sheet = null;
        S.reset();
        break;
      }
    }
  }

  function currentObjectiveId(s) {
    return resolveWorkbenchObjective(s).id;
  }

  // ======================================================================
  // Global wiring
  // ======================================================================

  document.addEventListener("click", function (ev) {
    var el = ev.target.closest("[data-act]");
    if (!el || el.disabled) return;
    ev.preventDefault();
    onAction(el.getAttribute("data-act"), el);
  });

  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape") {
      var s = S.get();
      if (ui.sheet) { ui.sheet = null; render(); return; }
      if (ui.resetOpen) { ui.resetOpen = false; render(); return; }
      if (ui.restartOpen) { ui.restartOpen = false; render(); return; }
      if (ui.modalOpen) { ui.modalOpen = false; render(); return; }
      void s;
    }
    if (ev.key === "Tab") trapTabFocus(ev);
  });

  function overlayEl() {
    if (ui.sheet) return document.querySelector('[data-overlay="sheet"] .sheet');
    if (ui.resetOpen) return document.querySelector('[data-overlay="confirm"] .dialog');
    if (ui.restartOpen) return document.querySelector('[data-overlay="confirm"] .dialog');
    if (ui.modalOpen) return document.querySelector('[data-overlay="modal"] .dialog');
    return null;
  }

  function trapTabFocus(ev) {
    var box = overlayEl();
    if (!box) return;
    var focusables = box.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (ev.shiftKey && document.activeElement === first) {
      ev.preventDefault();
      last.focus();
    } else if (!ev.shiftKey && document.activeElement === last) {
      ev.preventDefault();
      first.focus();
    }
  }

  window.addEventListener("open-completion", function () {
    ui.modalOpen = true;
    render();
  });

  // ======================================================================
  // Bootstrap (mirrors LabProvider hydration: skeleton → loaded state)
  // ======================================================================

  function skeletonHtml() {
    return (
      '<div class="desk-grid boot-screen" role="status" aria-label="Loading the engagement desk">' +
      '<div class="boot-wrap">' +
      '<div class="boot-line boot-lg"></div>' +
      '<div class="boot-line"></div>' +
      '<div class="boot-block"></div>' +
      '<p class="boot-label">Opening the casefile…</p>' +
      "</div></div>"
    );
  }

  function start() {
    // theme before first paint of content
    document.documentElement.classList.toggle("dark", S.getTheme() === "dark");
    document.getElementById("app").innerHTML = skeletonHtml();
    S.init();
    S.installFlush();
    S.subscribe(render);
    // small async hop like the original's setTimeout(0) hydration
    setTimeout(function () {
      render();
    }, 0);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
