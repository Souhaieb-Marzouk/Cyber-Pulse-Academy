// ─────────────────────────────────────────────────────────────────────────────
// js/app.js — bootstrap, event routing (delegation) and region updates.
//
// The original lab is React with fine-grained reconciliation. This port keeps
// the SAME observable behavior with a tiny render model:
//   • a single store subscription maps each action to the regions it affects —
//     big rebuilds only on mode change / reset / station switch, everything
//     else updates in place (cards, quiz items, counters, lamps, ring),
//     preserving focus and input carets;
//   • interactions are routed through delegated listeners keyed on the same
//     data-* hooks the original ships (and its verification suite drives).
// ─────────────────────────────────────────────────────────────────────────────

window.Lab = window.Lab || {};
(function (Lab) {
  'use strict';

  const S = () => Lab.store;
  const E = () => Lab.engine;
  const SEC = () => Lab.sections;

  // Runtime (non-persisted) UI state — mirrors the original's component state:
  // hint ladders and per-card feedback reset when a station is left, quiz
  // "no pick" notes reset when the section re-renders (React remount semantics).
  Lab.cardRuntime = {};
  Lab.quizRuntime = {};

  // Widget key → spec lookup (for order-widget re-render etc.)
  Lab.findWidget = function (key) {
    for (const o of window.LAB_DATA.objectives) {
      for (const w of o.widgets) if (w.key === key) return w;
    }
    return null;
  };

  function clearCardRuntime() {
    Lab.cardRuntime = {};
  }

  // ── rendering ──────────────────────────────────────────────────────────────
  function mountModeSelect() {
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.appendChild(SEC().renderModeSelect());
  }

  function mountMain() {
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.appendChild(SEC().renderMainLayout());
    document.getElementById('dispatch').replaceWith(SEC().renderDispatch());
    document.getElementById('workbench').replaceWith(SEC().renderWorkbench());
    document.getElementById('signal-check').appendChild(Lab.quiz.renderSignalCheck());
    SEC().updateLineBoard();
    SEC().updateStationLive();
    SEC().updateProgressUI();
    SEC().renderFileViewer();
  }

  function rerenderAll() {
    const state = S().getState();
    clearCardRuntime();
    Lab.quizRuntime = {};
    if (!state.mode) mountModeSelect();
    else mountMain();
  }

  // ── action handlers (interaction → runtime state + dispatch) ───────────────
  function handleCheck(objId) {
    const state = S().getState();
    const obj = window.LAB_DATA.objectives.find((o) => o.id === objId);
    if (!obj) return;
    const pass = E().checkObjective(obj, state.env);
    Lab.cardRuntime[objId] = Lab.cardRuntime[objId] || { hintsShown: 0, check: null };
    Lab.cardRuntime[objId].check = {
      pass,
      note: pass ? null : E().firstUnsatisfiedLabel(obj, state.env),
      at: Date.now(),
    };
    S().dispatch({ type: 'RECORD_CHECK', id: objId, pass });
  }

  function handleHint(objId) {
    const obj = window.LAB_DATA.objectives.find((o) => o.id === objId);
    if (!obj) return;
    const rt = Lab.cardRuntime[objId] || { hintsShown: 0, check: null };
    const maxHints = obj.mode === 'hard' ? 1 : 3;
    if (rt.hintsShown >= maxHints) return;
    rt.hintsShown += 1;
    Lab.cardRuntime[objId] = rt;
    S().dispatch({ type: 'USE_HINT', id: objId });
  }

  function handleQuizCheck(qid) {
    const state = S().getState();
    const mode = state.mode || 'medium';
    const q = (window.LAB_DATA.quiz[mode] || []).find((x) => x.id === qid);
    if (!q) return;
    const rec = state.quiz[qid];
    const chosen = rec ? rec.chosen : null;
    if (chosen === null || chosen === undefined) {
      // R3: nothing selected → ask for a choice, highlight nothing.
      Lab.quizRuntime[qid] = { noPick: true };
      Lab.quiz.updateQuizItem(qid);
      return;
    }
    S().dispatch({ type: 'ANSWER_QUIZ', qid, chosen, correct: chosen === q.correct });
  }

  function maybeAutoOpenDeparture() {
    const state = S().getState();
    if (!state.mode) return;
    const prog = E().computeProgress(state);
    if (prog.allObjectivesDone && prog.allQuizDone && !state.ui.completedSeen) {
      S().dispatch({ type: 'SEEN_COMPLETION', seen: true });
      SEC().openDeparture();
    }
  }

  // ── store subscription: action → affected regions ──────────────────────────
  // Mirrors the original's React effects (incl. the C7 auto-open behavior).
  S().subscribe(function (state, prev, action) {
    switch (action.type) {
      case 'SET_MODE':
      case 'RESET':
        rerenderAll();
        break;
      case 'SET_STATION':
        clearCardRuntime();
        SEC().rerenderDispatch();
        SEC().rerenderWorkbench();
        SEC().updateLineBoard();
        SEC().updateStationLive();
        break;
      case 'SET_FILE':
        SEC().renderFileViewer();
        break;
      case 'RECORD_CHECK':
        SEC().updateObjectiveCard(action.id);
        SEC().updateProgressUI();
        maybeAutoOpenDeparture();
        break;
      case 'USE_HINT':
        SEC().updateObjectiveCard(action.id);
        break;
      case 'CHOOSE_QUIZ':
        Lab.quiz.updateQuizItem(action.qid);
        break;
      case 'ANSWER_QUIZ':
        Lab.quiz.updateQuizItem(action.qid);
        SEC().updateProgressUI();
        maybeAutoOpenDeparture();
        break;
      default:
        // ENV_* mutations: widget DOM already updated in place by the
        // interaction handlers below (multi/switch) or refreshed explicitly
        // (order chips). Nothing to do here.
        break;
    }
  });

  // ── event delegation ───────────────────────────────────────────────────────
  document.addEventListener('click', (e) => {
    const t = e.target;

    // Overlay-internal buttons
    if (t.closest('[data-close-overlay]')) {
      Lab.ui.closeTopOverlay();
      return;
    }
    if (t.closest('[data-reset-confirm]')) {
      Lab.ui.closeTopOverlay();
      S().dispatch({ type: 'RESET' });
      return;
    }
    if (t.closest('[data-reset-cancel]')) {
      Lab.ui.closeTopOverlay();
      return;
    }
    if (t.closest('[data-departure-stay]')) {
      Lab.ui.closeTopOverlay();
      return;
    }
    if (t.closest('[data-departure-reset]')) {
      Lab.ui.closeTopOverlay();
      SEC().openResetDialog();
      return;
    }
    if (t.closest('[data-open-departure]')) {
      SEC().openDeparture();
      return;
    }
    if (t.closest('[data-open-manual]')) {
      SEC().openFieldManual();
      return;
    }
    if (t.closest('[data-open-reset]')) {
      SEC().openResetDialog();
      return;
    }

    // Field manual tabs
    const tab = t.closest('[data-manual-tab]');
    if (tab) {
      const panel = tab.closest('.sheet').querySelector('[data-manual-panel]');
      tab.closest('.manual-tabs').querySelectorAll('.manual-tab').forEach((b) => {
        const on = b === tab;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-selected', String(on));
      });
      const name = tab.getAttribute('data-manual-tab');
      panel.innerHTML =
        name === 'tools' ? SEC().manualToolsTab()
        : name === 'concepts' ? SEC().manualConceptsTab()
        : name === 'threats' ? SEC().manualThreatsTab()
        : SEC().manualGlossaryTab();
      return;
    }

    // Briefing collapse
    const brief = t.closest('[data-briefing-toggle]');
    if (brief) {
      const body = brief.parentElement.querySelector('[data-briefing-body]');
      const open = brief.getAttribute('aria-expanded') !== 'true';
      brief.setAttribute('aria-expanded', String(open));
      body.hidden = !open;
      brief.querySelector('.briefing-chevron').classList.toggle('is-open', open);
      return;
    }

    // Mode select
    const modeBtn = t.closest('[data-mode-btn]');
    if (modeBtn) {
      S().dispatch({ type: 'SET_MODE', mode: modeBtn.getAttribute('data-mode-btn') });
      return;
    }

    // Line board stations
    const stationBtn = t.closest('[data-station-btn]');
    if (stationBtn) {
      S().dispatch({ type: 'SET_STATION', station: stationBtn.getAttribute('data-station-btn') });
      return;
    }

    // Evidence file tabs
    const fileTab = t.closest('[data-file-tab]');
    if (fileTab) {
      S().dispatch({ type: 'SET_FILE', file: fileTab.getAttribute('data-file-tab') });
      return;
    }

    // Quiz option pre-selection (R2 — free until validated)
    const quizOpt = t.closest('[data-quiz-opt]');
    if (quizOpt && !quizOpt.disabled) {
      const qCard = quizOpt.closest('[data-quiz-q]');
      const qid = qCard.getAttribute('data-quiz-q');
      Lab.quizRuntime[qid] = { noPick: false };
      S().dispatch({ type: 'CHOOSE_QUIZ', qid, chosen: Number(quizOpt.getAttribute('data-quiz-opt')) });
      return;
    }
    const quizCheck = t.closest('[data-quiz-check]');
    if (quizCheck) {
      handleQuizCheck(quizCheck.getAttribute('data-quiz-check'));
      return;
    }

    // Objective controls
    const checkBtn = t.closest('[data-check-btn]');
    if (checkBtn) {
      handleCheck(checkBtn.getAttribute('data-check-btn'));
      return;
    }
    const hintBtn = t.closest('[data-hint-btn]');
    if (hintBtn && !hintBtn.disabled) {
      handleHint(hintBtn.getAttribute('data-hint-btn'));
      return;
    }

    // Interactive widgets: order chips, multi-select, toggle board
    const optBtn = t.closest('button[data-opt]');
    if (optBtn) {
      const widget = optBtn.closest('[data-widget]');
      if (!widget) return;
      const key = widget.getAttribute('data-widget');
      const role = optBtn.getAttribute('data-role');
      const id = optBtn.getAttribute('data-opt');

      if (optBtn.getAttribute('role') === 'switch') {
        // toggle board row — the ENTIRE row is the switch control (B5/R2)
        S().dispatch({ type: 'ENV_TOGGLE_FLAG', key, id });
        Lab.ui.updateSwitchRow(key, id);
        return;
      }
      if (optBtn.getAttribute('aria-pressed') !== null) {
        // multi-select button
        S().dispatch({ type: 'ENV_TOGGLE_ITEM', key, id });
        Lab.ui.updateMultiButton(key, id);
        return;
      }
      if (role === 'pool') {
        S().dispatch({ type: 'ENV_ORDER_PUSH', key, id });
        Lab.ui.refreshOrderWidget(key);
        return;
      }
      if (role === 'ordered') {
        S().dispatch({ type: 'ENV_ORDER_REMOVE', key, id });
        Lab.ui.refreshOrderWidget(key);
        return;
      }
      return;
    }
    const clearBtn = t.closest('[data-clear]');
    if (clearBtn) {
      const key = clearBtn.getAttribute('data-clear');
      S().dispatch({ type: 'ENV_ORDER_CLEAR', key });
      Lab.ui.refreshOrderWidget(key);
      return;
    }
  });

  // Selects (pair / sort / single-select) — change events
  document.addEventListener('change', (e) => {
    const sel = e.target;
    if (sel.tagName !== 'SELECT') return;
    const widget = sel.closest('[data-widget]');
    if (!widget) return;
    const key = widget.getAttribute('data-widget');
    const pairId = sel.getAttribute('data-pair');
    if (pairId) {
      S().dispatch({ type: 'ENV_MERGE', key, partial: { [pairId]: sel.value } });
      return;
    }
    const sortId = sel.getAttribute('data-sort');
    if (sortId) {
      S().dispatch({ type: 'ENV_MERGE', key, partial: { [sortId]: sel.value } });
      return;
    }
    if (sel.hasAttribute('data-select')) {
      S().dispatch({ type: 'SET_ENV', key, value: sel.value });
    }
  });

  // Text inputs — merge on every keystroke (the value already lives in the DOM,
  // so no re-render is needed and caret/focus stay untouched).
  document.addEventListener('input', (e) => {
    const input = e.target;
    if (input.tagName !== 'INPUT') return;
    const key = input.getAttribute('data-textkey');
    const field = input.getAttribute('data-text');
    if (!key || !field) return;
    S().dispatch({ type: 'ENV_MERGE', key, partial: { [field]: input.value } });
  });

  // ── boot ───────────────────────────────────────────────────────────────────
  function boot() {
    Lab.ui.initTooltips();
    rerenderAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window.Lab);
