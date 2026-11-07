// ─── Launch Control lab — bootstrap + event wiring (js/app.js) ───────────────
// Owns: hydration boot, targeted re-rendering (only what changes), sheet open/
// close with ARIA + focus management, the F-24 focus/scroll system, the quiz
// stepper hold (R2), the completion auto-open (once), and the RESET flow.

(function () {
  "use strict";

  const S = window.LabStore;
  const store = S.store;
  const A = S.actions;
  const U = window.LabUI;
  const W = window.LabWidgets;
  const engine = window.LAB_OBJECTIVES;

  // ── root elements ──────────────────────────────────────────────────────────
  const root = document.getElementById("lab-root");
  const headerSlot = document.getElementById("header-slot");
  const phaseRoot = document.getElementById("phase-root");

  // quiz stepper transient (component state in the original)
  let quizHold = null;
  let prevQuizViewId = null;

  // ── rendering ──────────────────────────────────────────────────────────────
  function renderHeader() {
    headerSlot.innerHTML = U.renderHeader();
  }

  function renderPhase() {
    const mode = store.mode;
    const phase = store.phase;
    if (!mode) {
      phaseRoot.innerHTML = U.renderModeSelect() + footerNote();
      return;
    }
    if (phase === "briefing") {
      phaseRoot.innerHTML = U.renderBriefing();
      return;
    }
    if (phase === "room") {
      phaseRoot.innerHTML = `
        <div class="floor">
          <div class="floor-rail">${U.renderRail()}</div>
          <div class="floor-main">
            <div id="chips-slot">${U.renderChips()}</div>
            <div id="workbench-slot">${U.renderWorkbench()}</div>
            <div class="floor-triage-mobile" id="triage-mobile-slot">${U.renderTriage()}</div>
          </div>
          <div class="floor-triage" id="triage-slot">${U.renderTriage()}</div>
        </div>`;
      return;
    }
    if (phase === "quiz") {
      phaseRoot.innerHTML = U.renderQuiz(quizHold);
      return;
    }
    if (phase === "debrief") {
      phaseRoot.innerHTML = U.renderDebrief();
      return;
    }
    phaseRoot.innerHTML = "";
  }

  function footerNote() {
    return `<p class="privacy-note">${U.icon("unplug", "ic-12")} progress is stored locally in this browser — nothing leaves your machine</p>`;
  }

  function renderApp() {
    renderHeader();
    renderPhase();
  }

  // Room-zone refreshers (no focus-bearing text inputs inside → safe to swap)
  function refreshRailAndChips() {
    if (store.phase !== "room") return;
    const railSlot = document.querySelector(".floor-rail");
    if (railSlot) railSlot.innerHTML = U.renderRail();
    const chipsSlot = document.getElementById("chips-slot");
    if (chipsSlot) chipsSlot.innerHTML = U.renderChips();
  }

  function refreshWorkbench() {
    const slot = document.getElementById("workbench-slot");
    if (slot) slot.innerHTML = U.renderWorkbench();
    // triage header shows the active case id/service
    refreshTriage();
  }

  function refreshTriage() {
    const deskHtml = U.renderTriage();
    const desk = document.getElementById("triage-slot");
    if (desk) desk.innerHTML = deskHtml;
    const deskMobile = document.getElementById("triage-mobile-slot");
    if (deskMobile) deskMobile.innerHTML = deskHtml;
  }

  function refreshHeaderBits() {
    renderHeader();
  }

  // Manual widget refresh while the manual sheet is open
  function refreshManualWidgets() {
    if (!store.manualOpen) return;
    const body = document.getElementById("manual-body");
    if (!body) return;
    const slots = {
      "manual-pipeline": W.pipelineWidget,
      "manual-match": W.matchWidget,
      "manual-detect": W.detectWidget,
      "manual-prevent": W.preventWidget,
      "manual-blueprint": W.blueprintWidget,
    };
    for (const [id, fn] of Object.entries(slots)) {
      const el = document.getElementById(id);
      if (el) el.outerHTML = fn();
    }
  }

  function refreshTracker() {
    if (!store.trackerOpen) return;
    const body = document.getElementById("tracker-body");
    if (body) body.innerHTML = W.renderTrackerBody();
  }

  function refreshCompletion() {
    if (!store.completionOpen) return;
    const body = document.getElementById("completion-body");
    if (body) body.innerHTML = W.renderCompletionBody();
  }

  // ── sheets ─────────────────────────────────────────────────────────────────
  let lastFocused = null;

  function openSheet(id) {
    const sheet = document.getElementById(id);
    if (!sheet) return;
    lastFocused = document.activeElement;
    sheet.hidden = false;
    const closeBtn = sheet.querySelector("[data-action='close-sheet']");
    if (closeBtn) closeBtn.focus();
    document.body.classList.add("no-scroll");
  }

  function closeSheet(id) {
    const sheet = document.getElementById(id);
    if (!sheet) return;
    sheet.hidden = true;
    if (!anySheetOpen()) document.body.classList.remove("no-scroll");
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function anySheetOpen() {
    return ["sheet-manual", "sheet-tracker", "sheet-completion", "sheet-confirm"].some(
      (id) => { const el = document.getElementById(id); return el && !el.hidden; },
    );
  }

  // Reconcile sheet visibility with the store flags (focusOn can flip
  // manualOpen inside a "focus" update, so every sheet syncs here).
  function syncSheets() {
    const map = [
      ["sheet-manual", store.manualOpen, () => document.getElementById("manual-body"), W.renderManualBody, () => A.setManualOpen(true)],
      ["sheet-tracker", store.trackerOpen, () => document.getElementById("tracker-body"), W.renderTrackerBody, () => A.setTrackerOpen(true)],
      ["sheet-completion", store.completionOpen, () => document.getElementById("completion-body"), W.renderCompletionBody, () => A.setCompletionOpen(true)],
    ];
    for (const [id, wantOpen, getBody, renderBody] of map) {
      const el = document.getElementById(id);
      if (!el) continue;
      if (wantOpen && el.hidden) {
        const body = getBody();
        if (body && renderBody) body.innerHTML = renderBody();
        openSheet(id);
      } else if (!wantOpen && !el.hidden) {
        closeSheet(id);
      }
    }
  }

  function openConfirm(variant) {
    const sheet = document.getElementById("sheet-confirm");
    const body = document.getElementById("confirm-body");
    body.innerHTML = W.confirmDialog(variant);
    sheet.hidden = false;
    const btn = body.querySelector("[data-action='confirm-reset-cancel']");
    if (btn) btn.focus();
    document.body.classList.add("no-scroll");
  }

  function closeConfirm() {
    const sheet = document.getElementById("sheet-confirm");
    sheet.hidden = true;
    if (!anySheetOpen()) document.body.classList.remove("no-scroll");
    // restore focus to whatever preceded the dialog (tracked by openSheet calls)
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  // ── F-24 focus/scroll system (380 ms, same targets as the original) ────────
  function handleFocusEffect() {
    if (store.focusNonce === 0) return;
    setTimeout(() => {
      if (store.focusWidget) {
        const el = document.getElementById(store.focusWidget);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (store.activeCase) {
        const el = document.getElementById("workbench-anchor");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 380);
  }

  // ── local messages in the triage desk ──────────────────────────────────────
  function showLocalMsg(caseId, text) {
    document.querySelectorAll("[data-role='local-msg']").forEach((el) => {
      el.hidden = false;
      el.textContent = text;
      el.dataset.forCase = caseId;
    });
  }
  function clearLocalMsg() {
    document.querySelectorAll("[data-role='local-msg']").forEach((el) => {
      el.hidden = true;
      el.textContent = "";
    });
  }

  // ── quiz stepper helpers (R2 semantics from the original QuizPanel) ────────
  function onQuizLock(itemId, index) {
    // set the hold FIRST: the store notify re-renders synchronously (React
    // batches these two updates in the original; here order matters).
    quizHold = Number(index); // R2 hold — keep the just-checked question on screen
    A.checkQuizItem(itemId);
  }
  function onQuizNext() {
    const items = store.mode === "medium" ? window.LAB.QUIZ_MEDIUM : window.LAB.QUIZ_HARD;
    const allChecked = S.quizDone(store.mode, store.quiz);
    // viewIdx at the time the button is rendered was the held index
    const holdValid = quizHold !== null && quizHold >= 0 && quizHold < items.length && store.quiz.checked[items[quizHold].id];
    const viewIdx = holdValid ? quizHold : items.findIndex((i) => !store.quiz.checked[i.id]);
    if (allChecked && viewIdx === items.length - 1) {
      quizHold = null;
      prevQuizViewId = null;
      A.setPhase("debrief");
      return;
    }
    quizHold = null;
    phaseRoot.innerHTML = U.renderQuiz(quizHold);
    syncQuizScroll();
  }
  function syncQuizScroll() {
    const mode = store.mode;
    if (!mode) return;
    const items = mode === "medium" ? window.LAB.QUIZ_MEDIUM : window.LAB.QUIZ_HARD;
    const firstUnchecked = items.findIndex((i) => !store.quiz.checked[i.id]);
    const allChecked = S.quizDone(mode, store.quiz);
    const holdValid = quizHold !== null && quizHold >= 0 && quizHold < items.length && store.quiz.checked[items[quizHold].id];
    const current = holdValid
      ? items[quizHold]
      : allChecked
        ? null
        : firstUnchecked >= 0 && firstUnchecked < items.length
          ? items[firstUnchecked]
          : null;
    if (current && prevQuizViewId && prevQuizViewId !== current.id) {
      const el = document.getElementById("quiz-card-" + current.id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    prevQuizViewId = current ? current.id : null;
  }

  // ── completion auto-open (C7, once per completion) ─────────────────────────
  function maybeAutoOpenCompletion() {
    if (!store.mode) return;
    if (S.isComplete(store.mode, store) && !store.completedSeen) {
      S.set({ completedSeen: true, completedAt: Date.now() }, { type: "silent" });
      A.setCompletionOpen(true);
    }
  }

  // ── focus-area jump (completion modal → evidence) ──────────────────────────
  function jumpFocusArea(index) {
    const mode = store.mode;
    const areas = window.LabWidgets && window.__lastFocusAreas;
    const fa = areas && areas[Number(index)];
    if (!fa) return;
    if (fa.objectiveId) {
      const def = engine.OBJECTIVES.find((o) => o.id === fa.objectiveId);
      if (def) {
        A.setCompletionOpen(false);
        A.focusOn(def.focus);
        A.setPhase("room");
        return;
      }
    }
    if (fa.quizItemId) {
      const quizItems = mode === "medium" ? window.LAB.QUIZ_MEDIUM : window.LAB.QUIZ_HARD;
      const q = quizItems.find((x) => x.id === fa.quizItemId);
      if (q) {
        A.setCompletionOpen(false);
        A.focusOn(q.focus);
        A.setPhase("room");
      }
    }
  }

  // Expose the current focus-area list so jump buttons can resolve by index
  function snapshotFocusAreas() {
    if (!store.mode) return [];
    const mode = store.mode;
    const areas = [];
    const objectives = engine.OBJECTIVES.filter((o) => o.mode === mode);
    for (const def of objectives) {
      const st = store.objectives[def.id];
      if (!st || !st.done) {
        areas.push({ objectiveId: def.id });
      } else if (st.attempts > 1 || (st.lastResult || "pass") === "fail") {
        areas.push({ objectiveId: def.id });
      }
    }
    const quizItems = mode === "medium" ? window.LAB.QUIZ_MEDIUM : window.LAB.QUIZ_HARD;
    for (const q of quizItems) {
      if (store.quiz.checked[q.id] && store.quiz.answers[q.id] !== q.answer) {
        areas.push({ quizItemId: q.id });
      }
    }
    window.__lastFocusAreas = areas;
    return areas;
  }

  // ── event delegation ───────────────────────────────────────────────────────
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-action]");
    // overlay click-to-close
    if (!t && e.target.classList && e.target.classList.contains("overlay")) {
      const id = e.target.id;
      if (id === "sheet-manual" || id === "sheet-tracker" || id === "sheet-completion") {
        A.setManualOpen(false); A.setTrackerOpen(false); A.setCompletionOpen(false);
      } else if (id === "sheet-confirm") {
        closeConfirm();
      }
      return;
    }
    if (!t) return;
    const act = t.dataset.action;

    switch (act) {
      case "set-mode": A.setMode(t.dataset.mode); break;
      case "finish-briefing": A.finishBriefing(); break;
      case "goto-phase": if (!t.disabled) A.setPhase(t.dataset.phase); break;
      case "open-tracker": A.setTrackerOpen(true); break;
      case "open-manual": A.setManualOpen(true); break;
      case "open-completion": A.setCompletionOpen(true); break;
      case "close-sheet": {
        const sheet = t.closest(".overlay");
        if (sheet) {
          if (sheet.id === "sheet-manual") A.setManualOpen(false);
          else if (sheet.id === "sheet-tracker") A.setTrackerOpen(false);
          else if (sheet.id === "sheet-completion") A.setCompletionOpen(false);
        }
        break;
      }
      case "confirm-reset": openConfirm(t.dataset.variant || "header"); break;
      case "confirm-reset-cancel": closeConfirm(); break;
      case "confirm-reset-accept": closeConfirm(); A.resetAll(); break;

      case "select-case": A.setActiveCase(t.dataset.case, "log"); clearLocalMsg(); break;
      case "select-tab": A.setActiveTab(t.dataset.tab); break;
      case "triage-tab": A.setTriageTab(t.dataset.tab); break;
      case "toggle-line": A.toggleLine(t.dataset.case, t.dataset.line); break;

      case "order-move": {
        const caseId = t.dataset.case, field = t.dataset.field;
        const cs = store.cases[caseId] || {};
        const orders = [...((cs.orders && cs.orders[field]) || [])];
        const idx = Number(t.dataset.idx);
        const j = idx + Number(t.dataset.dir);
        if (j < 0 || j >= orders.length) return;
        [orders[idx], orders[j]] = [orders[j], orders[idx]];
        A.setOrder(caseId, field, orders);
        break;
      }
      case "toggle-check": A.toggleCheck(t.dataset.case, t.dataset.field, t.dataset.value); break;
      case "toggle-action": A.toggleAction(t.dataset.case, t.dataset.actionId); break;

      case "file-diagnosis": {
        const caseId = t.dataset.case;
        const c = window.LAB.CASE_MAP[caseId];
        const objectiveId = U.caseObjective(c);
        const category = (store.cases[caseId] && store.cases[caseId].category) || null;
        if (!category) {
          showLocalMsg(caseId, "Select a root-cause category first — classification is the exam skill.");
          return;
        }
        clearLocalMsg();
        if (objectiveId) A.checkObjective(objectiveId);
        break;
      }
      case "record-classification": {
        const caseId = t.dataset.case;
        const c = window.LAB.CASE_MAP[caseId];
        const category = (store.cases[caseId] && store.cases[caseId].category) || null;
        const hard = store.mode === "hard";
        if (!category) {
          showLocalMsg(caseId, "Select a root-cause category first — classification is the exam skill.");
          return;
        }
        clearLocalMsg();
        if (hard) {
          showLocalMsg(caseId, "Recorded. The Sweep board (OBJ-H1) scores all 13 rows at once — classify every row, then run the sweep check.");
        } else {
          showLocalMsg(caseId, category === c.truthCategory
            ? "Correct — classification recorded for this row."
            : "Recorded. Not correct yet — re-check the evidence.");
        }
        break;
      }
      case "open-sweep": A.setTriageTab("sweep"); break;
      case "run-sweep": {
        const anyEmpty = window.LAB.SWEEP_ORDER.some((id) => !(store.cases[id] && store.cases[id].category));
        // scope to the desk instance that owns the clicked button (the original
        // keeps per-instance React state; the desk is rendered twice — desktop
        // + mobile wrappers — so a global query would update the wrong copy)
        const desk = t.closest(".triage");
        const errEl = desk ? desk.querySelector("[data-role='sweep-err']") : null;
        if (anyEmpty) {
          if (errEl) { errEl.hidden = false; errEl.textContent = "Every row needs a classification — use 'No fault' where nothing is wrong."; }
          return;
        }
        if (errEl) { errEl.hidden = true; errEl.textContent = ""; }
        A.checkObjective("OBJ-H1");
        break;
      }

      case "pipe-add": A.setPipelineOrder([...store.pipelineOrder, t.dataset.stage]); break;
      case "pipe-remove": A.setPipelineOrder(store.pipelineOrder.filter((x) => x !== t.dataset.stage)); break;
      case "toggle-prevention": A.togglePrevention(t.dataset.value); break;
      case "inline-check": A.checkObjective(t.dataset.objective); break;

      case "check-objective": A.checkObjective(t.dataset.objective); break;
      case "use-hint": A.useHint(t.dataset.objective); break;
      case "focus": {
        const def = engine.OBJECTIVES.find((o) => o.id === t.dataset.objective);
        if (def) A.focusOn(def.focus);
        break;
      }
      case "focus-area": jumpFocusArea(t.dataset.index); break;

      case "quiz-lock": onQuizLock(t.dataset.item, t.dataset.index); break;
      case "quiz-next": onQuizNext(); break;

      case "completion-floor": A.setCompletionOpen(false); A.setPhase("room"); break;
      case "completion-debrief": A.setCompletionOpen(false); A.setPhase("debrief"); break;
    }
  });

  document.addEventListener("change", (e) => {
    const el = e.target;
    const role = el.getAttribute("data-field-role");
    if (el.matches("[data-quiz-item]")) {
      A.answerQuiz(el.dataset.quizItem, el.value);
      // enable the lock button directly (keeps radio focus — no re-render)
      const card = el.closest(".quiz-card");
      if (card) {
        const lockBtn = card.querySelector("[data-action='quiz-lock']");
        if (lockBtn) lockBtn.disabled = false;
      }
      return;
    }
    if (!role) return;
    const caseId = el.dataset.case;
    switch (role) {
      case "category": A.setCategory(caseId, el.value); break;
      case "detail": A.setDetail(caseId, el.dataset.field, el.value); break;
      case "order-add": {
        const cs = store.cases[caseId] || {};
        const orders = [...((cs.orders && cs.orders[el.dataset.field]) || []), el.value];
        A.setOrder(caseId, el.dataset.field, orders);
        break;
      }
      case "action-pos": A.setActionPos(caseId, el.dataset.actionId, Number(el.value)); break;
      case "sweep-cat": A.setCategory(caseId, el.value); break;
      case "match": A.setMatchPair(el.dataset.sig, el.value); break;
      case "detect": A.setDataSource(el.dataset.drill, el.value); break;
      case "blueprint": A.setBlueprint(el.dataset.control, el.value); break;
    }
  });

  // text inputs: silent state updates (caret stays; persistence still runs)
  document.addEventListener("input", (e) => {
    const el = e.target;
    if (el.getAttribute && el.getAttribute("data-field-role") === "detail-text") {
      A.setDetail(el.dataset.case, el.dataset.field, el.value, true);
    }
  });

  // ESC closes the topmost open sheet; TAB is kept inside the topmost sheet
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const confirm = document.getElementById("sheet-confirm");
      if (confirm && !confirm.hidden) { closeConfirm(); return; }
      if (store.completionOpen) { A.setCompletionOpen(false); return; }
      if (store.trackerOpen) { A.setTrackerOpen(false); return; }
      if (store.manualOpen) { A.setManualOpen(false); }
      return;
    }
    if (e.key !== "Tab") return;
    const open = ["sheet-confirm", "sheet-completion", "sheet-tracker", "sheet-manual"]
      .map((id) => document.getElementById(id))
      .find((el) => el && !el.hidden);
    if (!open) return;
    const focusables = open.querySelectorAll(
      "button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href], [tabindex]:not([tabindex='-1'])",
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && (document.activeElement === first || !open.contains(document.activeElement))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && (document.activeElement === last || !open.contains(document.activeElement))) {
      e.preventDefault();
      first.focus();
    }
  });

  // ── store subscription: targeted updates per change type ──────────────────
  S.subscribe((s, meta) => {
    switch (meta.type) {
      case "hydrated":
      case "mode":
      case "phase":
      case "reset": {
        if (meta.type !== "hydrated") { quizHold = null; prevQuizViewId = null; }
        // close all sheets on structural change
        ["sheet-manual", "sheet-tracker", "sheet-completion", "sheet-confirm"].forEach((id) => {
          const el = document.getElementById(id);
          if (el) el.hidden = true;
        });
        document.body.classList.remove("no-scroll");
        renderApp();
        snapshotFocusAreas();
        break;
      }
      case "case-open":
        refreshRailAndChips();
        refreshWorkbench();
        clearLocalMsg();
        break;
      case "tab":
        refreshWorkbench();
        break;
      case "triage-tab":
        refreshTriage();
        break;
      case "case-field":
        if (meta.field === "lines") break; // direct DOM toggle already applied
        refreshRailAndChips();
        refreshTriage();
        snapshotFocusAreas();
        break;
      case "objectives":
        refreshHeaderBits();
        refreshRailAndChips();
        refreshTriage();
        refreshManualWidgets();
        refreshTracker();
        snapshotFocusAreas();
        maybeAutoOpenCompletion();
        break;
      case "widget":
        refreshManualWidgets();
        snapshotFocusAreas();
        break;
      case "quiz-answer":
        break; // direct DOM update already applied
      case "quiz-check":
        phaseRoot.innerHTML = U.renderQuiz(quizHold);
        syncQuizScroll();
        refreshHeaderBits();
        snapshotFocusAreas();
        maybeAutoOpenCompletion();
        break;
      case "manual-open":
      case "tracker-open":
      case "completion-open":
        if (meta.type === "completion-open" && store.completionOpen) snapshotFocusAreas();
        syncSheets();
        break;
      case "focus": {
        refreshRailAndChips();
        refreshWorkbench();
        refreshTriage();
        syncSheets();
        handleFocusEffect();
        break;
      }
      default:
        break;
    }
  });

  // direct-DOM update for log tagging (keeps scroll + focus, mirrors React patch)
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action='toggle-line']");
    if (!btn) return;
    const caseId = btn.dataset.case, lineId = btn.dataset.line;
    const cs = store.cases[caseId];
    const isSel = cs && cs.lines.includes(lineId);
    btn.classList.toggle("is-tagged", !isSel);
    btn.setAttribute("aria-pressed", String(!isSel));
    const tag = btn.querySelector(".log-tagged");
    if (!isSel && !tag) btn.insertAdjacentHTML("beforeend", '<span class="log-tagged">TAGGED</span>');
    if (isSel && tag) tag.remove();
  }, true);

  // ── boot ───────────────────────────────────────────────────────────────────
  function boot() {
    S.hydrate(); // notifies "hydrated" → full render (splash removed below)
    const splash = document.getElementById("boot-splash");
    if (splash) splash.remove();
    maybeAutoOpenCompletion();
    syncSheets();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
