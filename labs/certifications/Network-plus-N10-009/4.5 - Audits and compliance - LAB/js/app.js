/* ═══════════════════════════════════════════════════════════════════════════
   app.js — bootstrap, application shell and overlays.
   Ported from LabRoot.tsx, ModeGate.tsx, CaseHeader.tsx, ZoneTabs.tsx,
   Clipboard.tsx, GlossaryDrawer.tsx, Completion.tsx, Debrief.tsx.
   Overlays (sheets/dialogs/tooltip) are hand-built: focus is moved in on
   open, restored on close, Escape works, and the reset dialog deliberately
   ignores outside clicks (Radix AlertDialog semantics).
   ═══════════════════════════════════════════════════════════════════════════ */

window.LAB_APP = (function () {
  "use strict";

  const U = window.LAB_UI;
  const S = window.LAB_STORE;
  const OBJ = window.LAB_OBJECTIVES;
  const D = window.LAB_DATA;
  const Z = window.LAB_ZONES;
  const Q = window.LAB_QUIZ;

  const app = () => document.getElementById("app");

  /* ─── focus bookkeeping (React reconciliation keeps focus; we restore it) ─── */
  let focusKey = null;
  function captureFocus() {
    const a = document.activeElement;
    focusKey = a && a.getAttribute ? a.getAttribute("data-fk") : null;
  }
  function restoreFocus(container) {
    if (!focusKey) return;
    const t = (container || app()).querySelector('[data-fk="' + focusKey + '"]');
    if (t) t.focus();
    focusKey = null;
  }

  /* ─── small overlay helpers ─── */
  let lastOpener = null;
  function openOverlay(overlay, opener) {
    lastOpener = opener || document.activeElement;
    document.body.classList.add("overlay-open");
    overlay.hidden = false;
    const target = overlay.querySelector("[data-autofocus]") || overlay.querySelector("button, [href], input, select, [tabindex]:not([tabindex='-1'])");
    if (target) target.focus();
  }
  function closeOverlay(overlay) {
    overlay.hidden = true;
    document.body.classList.remove("overlay-open");
    if (lastOpener && lastOpener.focus) lastOpener.focus();
    lastOpener = null;
  }
  function trapFocus(e, overlay) {
    if (e.key !== "Tab" || overlay.hidden) return;
    const focusables = overlay.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])');
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
  }
  // Escape closes the top-most open overlay
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const open = document.querySelectorAll(".overlay:not([hidden])");
    if (!open.length) return;
    const top = open[open.length - 1];
    if (top.dataset.escClose === "off") return; // AlertDialog: Escape still cancels → handled via cancel
    const closeFn = top._close;
    if (closeFn) closeFn();
  });

  function makeOverlay(cls, escClose, backdropClose) {
    const ov = U.el('<div class="overlay ' + cls + '" hidden><div class="overlay-backdrop" data-backdrop></div></div>');
    ov.dataset.escClose = escClose ? "on" : "off";
    if (backdropClose) {
      ov.querySelector("[data-backdrop]").addEventListener("click", () => ov._close && ov._close());
    }
    ov.addEventListener("keydown", (e) => trapFocus(e, ov));
    return ov;
  }

  /* ═══════════════════ MODE GATE (ModeGate.tsx) ═══════════════════ */
  function renderModeGate(root) {
    const gate = U.el('<div class="mode-gate anim-rise"></div>');

    gate.appendChild(U.el('<div class="mg-head"><span class="mg-crest">' + U.icon("scale", 20) + '</span><div>' +
      '<p class="mg-case">Case ' + D.CASE_ID + ' · Meridian Retail Group</p>' +
      '<h1 class="mg-title">The Compliance Field Audit</h1></div></div>'));

    gate.appendChild(U.el('<p class="mg-lead">You are Meridian&#39;s new network compliance analyst. A QSA visit is two weeks out, the DPO has data-locality questions, and a customer is exercising its audit right. Before any of that: one interactive lab covering <strong>' + U.esc(D.LESSON_LABEL) + "</strong> — audits and attestation, PCI DSS, GDPR, and data locality.</p>"));
    gate.appendChild(U.el('<p class="mg-anchor">' + U.esc(D.OFFICIAL_ANCHOR) + "</p>"));

    const CARDS = [
      {
        mode: "medium",
        icon: "graduation-cap",
        tone: "medium",
        title: "Guided Internal Review",
        from: "FROM: Ingrid Hoffmann, IT Director",
        body: "A guided walk-through of all five areas. Twelve granular objectives, three-tier hints whenever you want them, tolerant numeric inputs (the 72-hour clock accepts a small margin), and a full explanation after every check. Finish feeling ready for the QSA.",
        meta: "12 objectives · hints free · explanations everywhere",
        chip: "Medium · learn",
      },
      {
        mode: "hard",
        icon: "shield-check",
        tone: "hard",
        title: "Independent Assessment",
        from: "FROM: Halloway & Brand — engagement letter",
        body: "QSA-style conditions: noisy evidence with red herrings, no guided order, exact answers only — near-misses are rejected with a rationale. One optional nudge per objective, and it costs score. The attestation is earned, not given.",
        meta: "9 deep objectives · hints locked · strict validation",
        chip: "Hard · stretch",
      },
    ];

    const grid = U.el('<div class="mg-grid"></div>');
    CARDS.forEach((c, i) => {
      const b = U.el('<button type="button" class="mg-card mg-card-' + c.tone + ' anim-rise" style="animation-delay:' + (0.12 + i * 0.1) + 's" aria-label="Select ' + c.title + ' mode">' +
        '<span class="mg-chip mg-chip-' + c.tone + '">' + U.icon(c.icon, 14) + c.chip + "</span>" +
        '<h2 class="mg-card-title">' + c.title + "</h2>" +
        '<p class="mg-card-from">' + U.esc(c.from) + "</p>" +
        '<p class="mg-card-body">' + U.esc(c.body) + "</p>" +
        '<p class="mg-card-meta">' + U.icon("compass", 14) + " " + U.esc(c.meta) + "</p></button>");
      b.addEventListener("click", () => S.actions.setMode(c.mode));
      grid.appendChild(b);
    });
    gate.appendChild(grid);

    gate.appendChild(U.el('<p class="mg-note">' + U.icon("clipboard-check", 16, "mg-note-ic") + " Everything here is synthetic, clearly-labeled training evidence — fictional company, fictional people, test card numbers. Progress saves to this browser automatically.</p>"));

    root.appendChild(gate);
  }

  /* ═══════════════════ CASE HEADER (CaseHeader.tsx) ═══════════════════ */
  function renderHeader(root) {
    const st = S.state;
    const objs = OBJ.objectivesFor(st.mode);
    const done = objs.filter((o) => S.objState(st, o.id).solved).length;
    const total = objs.length;
    const pct = total ? done / total : 0;
    const R = 15, C = 2 * Math.PI * R;

    const header = U.el('<header class="case-header"><div class="case-header-in">' +
      '<span class="crest" aria-hidden="true">' + U.icon("landmark", 18) + "</span>" +
      '<div class="case-title-wrap"><p class="case-title">Meridian Retail Group — Compliance Field Audit</p>' +
      '<p class="case-sub">Case ' + D.CASE_ID + " · " + U.esc(D.LESSON_LABEL) + " · " + (st.mode === "hard" ? "Hard mode" : "Medium mode") + "</p></div>" +
      '<div class="progress-ring" role="img" aria-label="Objectives verified: ' + done + " of " + total + '">' +
        '<svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="' + R + '" fill="none" stroke="#D8CFBA" stroke-width="4"/>' +
        '<circle cx="18" cy="18" r="' + R + '" fill="none" stroke="#2F5D46" stroke-width="4" stroke-linecap="round" stroke-dasharray="' + (C * pct) + " " + C + '" transform="rotate(-90 18 18)"/></svg>' +
        '<span class="progress-num">' + done + "/" + total + "</span></div>" +
      '<button type="button" class="btn btn-outline btn-sm" data-open-glossary aria-label="Open glossary">' + U.icon("book-open", 16) + '<span class="hide-sm">Glossary</span></button>' +
      '<button type="button" class="btn btn-outline btn-sm btn-reset" data-open-reset aria-label="Reset lab progress">' + U.icon("rotate-ccw", 16) + '<span class="hide-sm">Reset</span></button>' +
      "</div></header>");
    root.appendChild(header);
  }

  /* ═══════════════════ ZONE TABS (ZoneTabs.tsx) ═══════════════════ */
  const TAB_ICONS = { briefing: "landmark", library: "folder-closed", datacenter: "server", cloudops: "cloud", findings: "folder-search", interview: "pen-line", report: "file-text" };

  function renderTabs(root) {
    const st = S.state;
    const nav = U.el('<nav class="zone-tabs" aria-label="Audit areas"><div class="zone-tablist thin-scroll" role="tablist" aria-label="Audit areas"></div></nav>');
    const list = nav.querySelector(".zone-tablist");
    D.ZONES.forEach((z, i) => {
      const active = st.zone === z.id;
      const visited = st.visited.includes(z.id);
      const b = U.el('<button type="button" role="tab" aria-selected="' + active + '" aria-controls="zone-panel-' + z.id + '" id="zone-tab-' + z.id + '" class="zone-tab' + (active ? " active" : "") + '">' +
        U.icon(TAB_ICONS[z.id] || "folder-open", 14, "ic-s") +
        '<span class="zone-tab-label">' + U.esc(z.tab) + "</span>" +
        (visited && !active ? U.icon("check", 12, "zone-tab-check") : "") +
        '<span class="sr-only">(' + (i + 1) + " of " + D.ZONES.length + ")</span></button>");
      b.addEventListener("click", () => S.actions.goZone(z.id));
      list.appendChild(b);
    });
    root.appendChild(nav);
  }

  /* ═══════════════════ CLIPBOARD (Clipboard.tsx) ═══════════════════ */
  const PILLAR_DOT = { P1: "dot-P1", P2: "dot-P2", P3: "dot-P3", P4: "dot-P4" };

  function clipboardContent() {
    const st = S.state;
    const objs = OBJ.objectivesFor(st.mode);
    const quiz = st.mode === "hard" ? D.QUIZ_HARD : D.QUIZ_MEDIUM;
    const answered = quiz.filter((q) => st.quiz.answers[q.id]).length;
    const solved = objs.filter((o) => S.objState(st, o.id).solved).length;
    const allSolved = solved === objs.length;
    const quizDone = st.quiz.done;

    const wrap = U.el('<div class="clipboard"></div>');
    wrap.appendChild(U.el('<div class="clip-head">' + U.icon("clipboard-list", 16, "clip-ic") +
      '<h3 class="clip-title">Inspector&#39;s clipboard</h3><span class="clip-count">' + solved + "/" + objs.length + "</span></div>"));

    const list = U.el('<div class="clip-list thin-scroll"><ol class="clip-ol"></ol></div>');
    const ol = list.querySelector("ol");
    objs.forEach((o) => {
      const stO = S.objState(st, o.id);
      const li = U.el("<li><button type=\"button\" class=\"clip-row" + (stO.solved ? " solved" : "") + '" aria-label="' + o.id + ": " + U.esc(o.title) + " — " + (stO.solved ? "verified" : "open") + '" data-goto="' + o.zone + '">' +
        '<span class="clip-dot ' + PILLAR_DOT[o.pillar] + '" aria-hidden="true"></span>' +
        '<span class="clip-main"><span class="clip-id-row"><span class="clip-id">' + o.id + "</span>" +
        (stO.solved ? U.stamp("Verified", "green", -5, "mini") : "") +
        (!stO.solved && stO.hints > 0 ? '<span class="clip-hints">' + stO.hints + " hint" + (stO.hints > 1 ? "s" : "") + "</span>" : "") +
        (!stO.solved && stO.wrong > 0 ? '<span class="clip-miss">' + stO.wrong + " miss" + (stO.wrong > 1 ? "es" : "") + "</span>" : "") +
        '</span><span class="clip-title-row' + (stO.solved ? " done" : "") + '">' + U.esc(o.title) + "</span></span></button></li>");
      ol.appendChild(li);
    });
    wrap.appendChild(list);

    const foot = U.el('<div class="clip-foot"></div>');
    const interview = U.el('<button type="button" class="clip-interview" aria-label="Exit interview: ' + answered + " of " + quiz.length + ' answered" data-goto="interview">' +
      U.icon("pen-line", 16, "ic-s") + '<span class="clip-interview-label">Exit interview</span>' +
      '<span class="clip-interview-count">' + answered + "/" + quiz.length + "</span>" +
      (quizDone ? U.icon("file-check-2", 16, "ic-s done-ic") : "") + "</button>");
    foot.appendChild(interview);

    const attest = U.el('<button type="button" class="btn btn-ink btn-block" data-request-attestation' + (!allSolved || !quizDone || st.completed ? " disabled" : "") + ">Issue the attestation</button>");
    attest.addEventListener("click", () => { if (!attest.disabled) S.actions.requestAttestation(); });
    foot.appendChild(attest);
    if (!allSolved) foot.appendChild(U.el('<p class="clip-hint-line">Verify all ' + objs.length + " objectives first</p>"));
    if (allSolved && !quizDone) foot.appendChild(U.el('<p class="clip-hint-line">Finish the exit interview to close the case</p>'));
    if (st.mode === "hard") foot.appendChild(U.el('<p class="clip-hard-line">Hard rules: one nudge per objective — it costs score.</p>'));
    wrap.appendChild(foot);
    return wrap;
  }

  /* ═══════════════════ MOBILE CHECKLIST ═══════════════════ */
  let checklistSheet = null;
  function ensureChecklistSheet() {
    if (checklistSheet) return checklistSheet;
    checklistSheet = makeOverlay("sheet-bottom", true, true);
    checklistSheet._close = function () { closeOverlay(checklistSheet); };
    checklistSheet._open = function (opener) {
      const panel = U.el('<div class="sheet-panel-bottom" role="dialog" aria-modal="true" aria-label="Inspector&#39;s clipboard" data-autofocus tabindex="-1"><div class="sheet-grip" aria-hidden="true"></div></div>');
      panel.appendChild(clipboardContent());
      const old = checklistSheet.querySelector(".sheet-panel-bottom");
      if (old) old.remove();
      checklistSheet.appendChild(panel);
      openOverlay(checklistSheet, opener);
    };
    app().appendChild(checklistSheet);
    return checklistSheet;
  }

  function renderMobileBar(root) {
    const st = S.state;
    const objs = OBJ.objectivesFor(st.mode);
    const solved = objs.filter((o) => S.objState(st, o.id).solved).length;
    const bar = U.el('<div class="mobile-bar"><button type="button" class="btn btn-ink btn-block" aria-label="Open inspection checklist">' +
      U.icon("clipboard-list", 16) + " Inspection checklist — " + solved + " / " + objs.length + "</button></div>");
    bar.querySelector("button").addEventListener("click", (e) => ensureChecklistSheet()._open(e.currentTarget));
    root.appendChild(bar);
  }

  /* ═══════════════════ GLOSSARY DRAWER (GlossaryDrawer.tsx) ═══════════════════ */
  let glossarySheet = null;
  function ensureGlossary() {
    if (glossarySheet) return glossarySheet;
    glossarySheet = makeOverlay("sheet-right", true, true);
    glossarySheet._close = function () { closeOverlay(glossarySheet); };
    glossarySheet._open = function (opener) {
      const old = glossarySheet.querySelector(".sheet-panel-right");
      if (old) old.remove();
      const panel = U.el('<div class="sheet-panel-right" role="dialog" aria-modal="true" aria-labelledby="glossary-title">' +
        '<button type="button" class="sheet-x" data-autofocus aria-label="Close glossary">' + U.icon("x", 16) + "</button>" +
        '<div class="sheet-head"><h2 class="sheet-title" id="glossary-title">Glossary — 15 core terms</h2><p class="sheet-sub">Every jargon term used in the case file, one line each.</p></div>' +
        '<div class="sheet-body"><dl class="gloss-list">' +
        D.GLOSSARY.map((t) => '<div class="gloss-item"><dt class="gloss-term">' + U.esc(t.term) + '</dt><dd class="gloss-def">' + U.esc(t.def) + "</dd></div>").join("") +
        '</dl><p class="gloss-also">Also in the file</p><dl class="gloss-list-2">' +
        Object.entries(D.TOOLTIP_TERMS).map((kv) => '<div class="gloss-item-2"><dt>' + U.esc(kv[0]) + "</dt><dd>" + U.esc(kv[1]) + "</dd></div>").join("") +
        "</dl></div></div>");
      panel.querySelector(".sheet-x").addEventListener("click", () => glossarySheet._close());
      glossarySheet.appendChild(panel);
      openOverlay(glossarySheet, opener);
    };
    app().appendChild(glossarySheet);
    return glossarySheet;
  }

  /* ═══════════════════ RESET DIALOG (AlertDialog) ═══════════════════ */
  let resetDialog = null;
  function ensureResetDialog() {
    if (resetDialog) return resetDialog;
    resetDialog = makeOverlay("dialog-center", false, false); // AlertDialog: no backdrop dismissal
    resetDialog._close = function () { closeOverlay(resetDialog); };
    resetDialog._open = function (opener) {
      const old = resetDialog.querySelector(".dialog-box");
      if (old) old.remove();
      const box = U.el('<div class="dialog-box" role="alertdialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-desc">' +
        '<h2 class="dialog-title" id="reset-title">Reset the field audit?</h2>' +
        '<p class="dialog-desc" id="reset-desc">This clears your mode, every verified objective, quiz answers and saved configuration — back to a pristine case file. This cannot be undone.</p>' +
        '<div class="dialog-foot">' +
        '<button type="button" class="btn btn-outline" data-autofocus data-reset-cancel>Keep my progress</button>' +
        '<button type="button" class="btn btn-destructive" data-reset-confirm>Reset everything</button></div></div>');
      box.querySelector("[data-reset-cancel]").addEventListener("click", () => resetDialog._close());
      box.querySelector("[data-reset-confirm]").addEventListener("click", () => {
        resetDialog._close();
        S.actions.resetAll(); // render() rebuilds every overlay from scratch
      });
      resetDialog.appendChild(box);
      openOverlay(resetDialog, opener);
    };
    app().appendChild(resetDialog);
    return resetDialog;
  }

  /* ═══════════════════ COMPLETION MODAL (Completion.tsx) ═══════════════════ */
  const PILLAR_LABEL = { P1: "Understand", P2: "Recognize", P3: "Detect", P4: "Mitigate" };

  function focusAreas(mode, st) {
    const areas = [];
    const quiz = mode === "hard" ? D.QUIZ_HARD : D.QUIZ_MEDIUM;
    quiz.forEach((q, i) => {
      if (st.quiz.answers[q.id] && st.quiz.answers[q.id] !== q.correct) {
        areas.push({
          title: "Exit interview Q" + (i + 1) + " · " + q.topic,
          detail: "Missed under interview conditions — re-open the question, re-read the explanation, and restate the rule in your own words.",
        });
      }
    });
    for (const o of OBJ.objectivesFor(mode)) {
      const s = S.objState(st, o.id);
      if (s.solved && s.wrong > 0) {
        areas.push({ title: o.id + " · " + o.anchor, detail: s.wrong + " missed " + (s.wrong === 1 ? "check" : "checks") + " before verification — redraw the evidence path for this anchor from memory." });
      } else if (s.solved && s.hints > 0) {
        areas.push({ title: o.id + " · " + o.anchor, detail: "Verified with " + s.hints + " hint" + (s.hints === 1 ? "" : "s") + " — revisit the anchor until the steps come without prompts." });
      }
    }
    return areas.slice(0, 6);
  }

  let completionDialog = null;
  function ensureCompletion() {
    if (completionDialog) return completionDialog;
    completionDialog = makeOverlay("dialog-center", true, true);
    completionDialog._close = function () {
      closeOverlay(completionDialog);
      S.actions.closeCompletion();
    };
    completionDialog._open = function () {
      const st = S.state;
      const score = S.computeScore(st.mode, st);
      const focus = focusAreas(st.mode, st);
      const objs = OBJ.objectivesFor(st.mode);
      const year = new Date().getFullYear();
      const byPillar = ["P1", "P2", "P3", "P4"].map((p) => ({
        pillar: p,
        done: objs.filter((o) => o.pillar === p && S.objState(st, o.id).solved).length,
        total: objs.filter((o) => o.pillar === p).length,
      }));

      const old = completionDialog.querySelector(".dialog-box");
      if (old) old.remove();
      const box = U.el('<div class="dialog-box dialog-completion" role="dialog" aria-modal="true" aria-label="Attestation issued" tabindex="-1">' +
        '<button type="button" class="sheet-x" data-autofocus aria-label="Close">' + U.icon("x", 16) + "</button>" +
        '<div class="attest-center"><div class="seal" aria-hidden="true"><div class="seal-in">' + U.icon("award", 24) +
        '<p class="seal-word">Attested</p><p class="seal-org">MRG · ' + year + "</p></div></div>" +
        '<p class="attest-stamp">' + U.stamp("Case " + D.CASE_ID + " — closed", "green", -4) + "</p>" +
        '<p class="attest-desc">You walked every area, verified every control, and closed the case file. You can now explain audits and attestations, spot PCI DSS and GDPR exposure in raw evidence, verify logging and segmentation controls, and place data-locality guardrails around a cloud launch.</p></div>' +
        '<div class="attest-score"><div class="stars" aria-label="Star rating: ' + score.stars + " of 5\">" +
        [1, 2, 3, 4, 5].map((s) => U.icon("star", 28, s <= score.stars ? "star-full" : "star-empty")).join("") +
        '</div><p class="attest-score-line">Score ' + score.score + "/100 — objectives " + score.objPct + "% (70 %) + interview " + (score.quizDone ? score.quizPct + "%" : "—") + " (30 %)</p>" +
        '<p class="attest-stars-note">Stars: first-attempt accuracy ' + (score.firstTryRate * 100).toFixed(0) + " % · hints used " + score.hintsUsed + " · misses forgiven, stars earned</p></div>" +
        '<div class="attest-recap"><p class="mini-kicker">Recap by pillar</p><ul class="pillar-recap">' +
        byPillar.map((p) => '<li><span>' + PILLAR_LABEL[p.pillar] + '</span><span class="pillar-nums">' + p.done + "/" + p.total + "</span></li>").join("") +
        "</ul></div>" +
        '<div class="attest-focus"><p class="mini-kicker">' + U.icon("focus", 14) + " Focus areas for your next study block</p>" +
        '<p class="focus-note">Derived from your missed checks, hints and interview answers — not generic advice.</p>' +
        (focus.length === 0
          ? '<p class="focus-clean">Clean sweep — every objective first-try and every interview call correct. Keep the attestation warm: run the other mode or move to the next lesson below.</p>'
          : '<ul class="focus-list">' + focus.map((f) => '<li class="focus-item"><p class="focus-title">' + U.esc(f.title) + '</p><p class="focus-detail">' + U.esc(f.detail) + "</p></li>").join("") + "</ul>") +
        "</div>" +
        '<div class="attest-next"><p class="mini-kicker">' + U.icon("book-open-check", 14) + " Keep walking</p>" +
        '<ul class="next-list">' + D.DEBRIEF.next.map((n) => "<li>" + U.esc(n) + "</li>").join("") + "</ul></div>" +
        '<div class="attest-actions"><button type="button" class="btn btn-plain" data-attest-close>Back to the audit report</button></div>' +
        "</div>");
      box.querySelector(".sheet-x").addEventListener("click", () => completionDialog._close());
      box.querySelector("[data-attest-close]").addEventListener("click", () => completionDialog._close());
      completionDialog.appendChild(box);
      openOverlay(completionDialog, null);
    };
    app().appendChild(completionDialog);
    return completionDialog;
  }

  /* ═══════════════════ REPORT / DEBRIEF ZONE (Debrief.tsx) ═══════════════════ */
  function debriefZone(st) {
    const objs = OBJ.objectivesFor(st.mode);
    const solved = objs.filter((o) => S.objState(st, o.id).solved).length;
    const allSolved = solved === objs.length && objs.length > 0;
    const score = S.computeScore(st.mode, st);
    const wrap = U.el('<div class="zone-stack"></div>');

    wrap.appendChild(U.el('<div class="desk-strip"><div class="desk-strip-top"><span class="zone-area">DESK 7</span>' +
      '<h2 class="zone-title">Audit Report &amp; Debrief</h2>' + (allSolved ? U.stamp("Findings closed", "green", -4) : "") + "</div>" +
      '<p class="desk-blurb">The synthesis every auditor leaves behind: what to watch, what to fix, and what both sides of the house learned. ' + U.esc(D.OFFICIAL_ANCHOR) + "</p></div>"));

    wrap.appendChild(U.el(U.evidenceCard({ title: "Objective status", kicker: "from your clipboard" },
      '<p class="debrief-status"><strong>' + solved + "/" + objs.length + "</strong> objectives verified · objective score <strong>" + score.objPct + "%</strong> · interview <strong>" + (score.quizDone ? score.quizPct + "%" : "open") + "</strong>. The attestation button unlocks when both are complete.</p>" +
      '<button type="button" class="btn btn-ink attestation-cta"' + (!allSolved || !score.quizDone ? " disabled" : "") + ">Issue the attestation</button>")));

    const det = U.el("<div></div>");
    det.appendChild(U.el(U.sectionTitle("Detection opportunities", "Data sources + example logic you could hand to a SIEM engineer tomorrow.")));
    let table = '<div class="det-table-wrap"><table class="det-table"><thead><tr class="det-head"><th>Evidence source</th><th>What to look for</th><th class="hide-md">Example detection logic</th></tr></thead><tbody>';
    D.DEBRIEF.detection.forEach((d, i) => {
      table += '<tr class="' + (i % 2 ? "odd" : "even") + '"><td class="det-src">' + U.esc(d.source) + '</td><td class="det-look">' + U.esc(d.look) + '</td><td class="det-logic hide-md">' + U.esc(d.logic) + "</td></tr>";
    });
    table += "</tbody></table></div>";
    det.appendChild(U.el(table));
    wrap.appendChild(det);

    const mit = U.el("<div></div>");
    mit.appendChild(U.el(U.sectionTitle("Mitigation recommendations", "Every line maps to an official requirement or article.")));
    const mitGrid = U.el('<div class="mit-grid"></div>');
    D.DEBRIEF.mitigations.forEach((m) => {
      mitGrid.appendChild(U.el('<div class="mit-item">' + U.icon("shield-check", 16, "ic-s") + '<p><span class="mit-id">' + U.esc(m.id) + "</span> — " + U.esc(m.text) + "</p></div>"));
    });
    mit.appendChild(mitGrid);
    wrap.appendChild(mit);

    const two = U.el('<div class="two-col"></div>');
    two.appendChild(U.el(U.evidenceCard({ title: "Blue-team takeaways", kicker: "defend", tone: "teal" },
      '<ul class="take-list">' + D.DEBRIEF.blue.map((b) => "<li>" + U.esc(b) + "</li>").join("") + "</ul>")));
    two.appendChild(U.el(U.evidenceCard({ title: "Red-team mindset", kicker: "attack — on paper only", tone: "red" },
      '<ul class="take-list">' + D.DEBRIEF.red.map((b) => "<li>" + U.esc(b) + "</li>").join("") + "</ul>" +
      '<p class="red-note">' + U.icon("swords", 14) + " Think like the adversary to close the paths — never to open them.</p>")));
    wrap.appendChild(two);

    const two2 = U.el('<div class="two-col"></div>');
    two2.appendChild(U.el(U.evidenceCard({ title: "Official references", kicker: "open in a new tab", tone: "plain" },
      '<ul class="link-list">' + D.DEBRIEF.links.map((l) => '<li><a href="' + U.esc(l.url) + '" target="_blank" rel="noopener noreferrer" class="ext-link">' + U.icon("external-link", 14, "ic-s") + U.esc(l.label) + "</a></li>").join("") + "</ul>")));
    two2.appendChild(U.el(U.evidenceCard({ title: "What to learn next", kicker: "your route", tone: "amber" },
      '<ul class="take-list">' + D.DEBRIEF.next.map((n) => "<li>" + U.esc(n) + "</li>").join("") + "</ul>")));
    wrap.appendChild(two2);

    wrap.appendChild(U.el('<p class="closing-line">' + U.icon("search", 16) + " The whole report reduces to one sentence: <strong>scope it, log it, prove it — then keep proving it.</strong></p>"));
    return wrap;
  }

  /* ═══════════════════ ZONE DISPATCH + MAIN RENDER ═══════════════════ */
  function zonePanelEl() {
    const st = S.state;
    switch (st.zone) {
      case "briefing": return Z.briefingZone(st);
      case "library": return Z.libraryZone(st);
      case "datacenter": return Z.dataCenterZone(st);
      case "cloudops": return Z.cloudOpsZone(st);
      case "findings": return Z.findingsZone(st);
      case "interview": Q.resetIdx(); return Q.panel();
      case "report": return debriefZone(st);
      default: return Z.briefingZone(st);
    }
  }

  function renderMain(root) {
    // skip link
    root.appendChild(U.el('<a href="#zone-main" class="skip-link">Skip to the audit areas</a>'));
    renderHeader(root);
    renderTabs(root);

    const main = U.el('<main id="zone-main" class="lab-main"><div class="lab-main-zone"></div></main>');
    const zoneHolder = main.querySelector(".lab-main-zone");
    const panel = U.el('<div class="zone-panel" role="tabpanel" id="zone-panel-' + S.state.zone + '" aria-labelledby="zone-tab-' + S.state.zone + '" tabindex="-1"></div>');
    panel.classList.add("anim-zone");
    panel.appendChild(zonePanelEl());
    zoneHolder.appendChild(panel);
    root.appendChild(main);

    // desktop clipboard aside
    const aside = U.el('<aside class="clip-aside" aria-label="Inspector&#39;s clipboard"><div class="clip-card" id="clip-card"></div></aside>');
    aside.querySelector(".clip-card").appendChild(clipboardContent());
    main.appendChild(aside);

    renderMobileBar(root);
  }

  function render() {
    const root = app();
    root.innerHTML = "";
    document.body.classList.remove("overlay-open");
    // overlay nodes lived inside #app and were just wiped — rebuild them fresh
    checklistSheet = null; glossarySheet = null; resetDialog = null; completionDialog = null;
    const st = S.state;

    if (!st.mode) {
      renderModeGate(root);
    } else {
      renderMain(root);
    }

    // live region (always present)
    const live = U.el('<div role="status" aria-live="polite" class="sr-only" id="lab-live"></div>');
    live.textContent = st.liveMsg || "";
    root.appendChild(live);

    // overlays live outside the re-rendered tree
    ensureGlossary();
    ensureChecklistSheet();
    ensureResetDialog();
    ensureCompletion();
  }

  function refreshChrome() {
    const st = S.state;
    const root = app();
    const header = root.querySelector(".case-header");
    const aside = root.querySelector(".clip-aside .clip-card");
    const bar = root.querySelector(".mobile-bar");
    if (header) {
      const fresh = U.el("<div></div>");
      renderHeader(fresh);
      header.replaceWith(fresh.firstElementChild);
    }
    if (aside) {
      aside.innerHTML = "";
      aside.appendChild(clipboardContent());
    }
    if (bar) {
      const objs = OBJ.objectivesFor(st.mode);
      const solved = objs.filter((o) => S.objState(st, o.id).solved).length;
      bar.querySelector("button").innerHTML = U.icon("clipboard-list", 16) + " Inspection checklist — " + solved + " / " + objs.length;
    }
    if (checklistSheet && !checklistSheet.hidden) {
      const panel = checklistSheet.querySelector(".sheet-panel-bottom");
      if (panel) {
        const content = panel.querySelector(".clipboard");
        if (content) { content.replaceWith(clipboardContent()); }
      }
    }
  }

  function reRenderZone() {
    captureFocus();
    const holder = app().querySelector(".lab-main-zone");
    if (!holder) return;
    holder.innerHTML = "";
    const panel = U.el('<div class="zone-panel anim-zone" role="tabpanel" id="zone-panel-' + S.state.zone + '" aria-labelledby="zone-tab-' + S.state.zone + '" tabindex="-1"></div>');
    panel.appendChild(zonePanelEl());
    holder.appendChild(panel);
    restoreFocus(holder);
  }

  function reRenderTabs() {
    const nav = app().querySelector(".zone-tabs");
    if (!nav) return;
    const fresh = U.el("<div></div>");
    renderTabs(fresh);
    nav.replaceWith(fresh.firstElementChild);
  }

  /* ═══════════════════ EVENT DELEGATION ═══════════════════ */
  function wireEvents() {
    document.body.addEventListener("click", (e) => {
      const checkBtn = e.target.closest("[data-check]");
      if (checkBtn) { S.actions.checkObjective(checkBtn.getAttribute("data-check")); return; }

      const hintBtn = e.target.closest("[data-hint]");
      if (hintBtn) { S.actions.useHint(hintBtn.getAttribute("data-hint")); return; }

      const gotoBtn = e.target.closest("[data-goto]");
      if (gotoBtn) { S.actions.goZone(gotoBtn.getAttribute("data-goto")); return; }

      const glossBtn = e.target.closest("[data-open-glossary]");
      if (glossBtn) { ensureGlossary()._open(glossBtn); return; }

      const resetBtn = e.target.closest("[data-open-reset]");
      if (resetBtn) { ensureResetDialog()._open(resetBtn); return; }

      // attestation goes through the store (state.completed gates the button,
      // exactly like the original's requestAttestation action)
      const attestBtn = e.target.closest("[data-request-attestation]");
      if (attestBtn && !attestBtn.disabled) { S.actions.requestAttestation(); return; }

      const attestationCta = e.target.closest(".attestation-cta");
      if (attestationCta && !attestationCta.disabled) { S.actions.requestAttestation(); return; }
    });

    // term tooltips (hover + focus)
    let tipTimer = null;
    const tip = U.el('<div class="term-tip" role="tooltip" hidden></div>');
    document.body.appendChild(tip);
    function showTip(btn) {
      const def = U.lookupDef(btn.getAttribute("data-term")) || "See the glossary.";
      tip.textContent = def;
      tip.hidden = false;
      const r = btn.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;
      tip.style.left = Math.max(8, Math.min(window.innerWidth - 272, r.left + r.width / 2 - 128)) + "px";
      tip.style.top = (r.bottom + scrollY + 8) + "px";
    }
    function hideTip() { tip.hidden = true; }
    document.body.addEventListener("mouseover", (e) => {
      const t = e.target.closest(".term");
      clearTimeout(tipTimer);
      if (t) tipTimer = setTimeout(() => showTip(t), 150);
      else hideTip();
    });
    document.body.addEventListener("mouseout", (e) => {
      if (e.target.closest && e.target.closest(".term")) { clearTimeout(tipTimer); hideTip(); }
    });
    document.body.addEventListener("focusin", (e) => {
      const t = e.target.closest && e.target.closest(".term");
      clearTimeout(tipTimer);
      if (t) tipTimer = setTimeout(() => showTip(t), 150);
    });
    document.body.addEventListener("focusout", (e) => {
      if (e.target.closest && e.target.closest(".term")) { clearTimeout(tipTimer); hideTip(); }
    });
    document.body.addEventListener("keydown", (e) => { if (e.key === "Escape") hideTip(); });
  }

  /* ═══════════════════ STORE SUBSCRIPTION ═══════════════════ */
  function subscribe() {
    S.subscribe((reason) => {
      const liveEl = document.getElementById("lab-live");
      if (liveEl) liveEl.textContent = S.state.liveMsg || "";

      switch (reason) {
        case "mode":
        case "reset":
          render();
          break;
        case "zone":
          if (checklistSheet && !checklistSheet.hidden) checklistSheet._close();
          reRenderTabs();
          reRenderZone();
          refreshChrome();
          break;
        case "obj-solved":
        case "obj-failed":
        case "hint":
          reRenderZone();
          refreshChrome();
          break;
        case "quiz":
        case "quiz-done":
          refreshChrome();
          break;
        case "completed-open":
          ensureCompletion()._open();
          break;
        case "completed-close":
          if (completionDialog && !completionDialog.hidden) closeOverlay(completionDialog);
          break;
        case "env":
        case "live":
        default:
          break; // widgets already updated themselves
      }
    });
  }

  function boot() {
    wireEvents();
    subscribe();
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  return { render };
})();
