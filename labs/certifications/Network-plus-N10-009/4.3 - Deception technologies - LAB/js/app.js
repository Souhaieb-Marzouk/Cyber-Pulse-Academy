/* ── App bootstrap, event wiring, render loop ─────────────────────────────────
 * Recreates the original page-level behavior: bay switching, dialogs, delegated
 * form events, transient UI state (collapsible cards, RAW expanders, term
 * popovers) and focus/scroll preservation across re-renders.
 */
(function () {
  'use strict';

  const appEl = document.getElementById('app');
  const S = window.LabState;
  const Obj = window.LabObjectives;
  const A = S.actions;
  const UI = window.LabUI;

  /* transient UI state — mirrors React useState in the original components */
  const uiState = {
    bay: 'manual',
    glossaryOpen: false,
    resetOpen: false,
    dockOpen: false,
    reportOpenRaw: false,
    cardOpen: {}, // objective-card collapse state (reset per bay mount, like component state)
    rawOpen: {},  // feed-item RAW expander state
    openTerm: null,
  };

  function resetBayTransient() {
    uiState.cardOpen = {};
    uiState.rawOpen = {};
    uiState.openTerm = null;
  }

  function sessionOf(state) { return state.sessions[state.activeMode]; }

  function modalOpenFor(state) {
    const session = sessionOf(state);
    return uiState.reportOpenRaw || (Obj.labComplete(session, state.activeMode) && !session.completedShown);
  }

  /* ── render ───────────────────────────────────────────────────────────────── */
  function render() {
    const state = S.state;
    // preserve focus + scroll positions across the innerHTML swap
    const active = document.activeElement;
    const fid = active ? (active.id || active.getAttribute('data-fid') || '') : '';
    const scrollY = window.scrollY;
    const sheetNav = document.querySelector('.sheet-list');
    const sheetScroll = sheetNav ? sheetNav.scrollTop : 0;

    appEl.innerHTML = state.entered ? UI.renderShell(state, uiState) : UI.renderModeSelect();

    if (fid) {
      const el = document.getElementById(fid) || appEl.querySelector('[data-fid="' + fid + '"]');
      if (el) { try { el.focus({ preventScroll: true }); } catch (e) { /* not focusable */ } }
    }
    if (window.scrollY !== scrollY) window.scrollTo(0, scrollY);
    const nav2 = document.querySelector('.sheet-list');
    if (nav2 && sheetScroll) nav2.scrollTop = sheetScroll;
  }

  /* ── action dispatch ──────────────────────────────────────────────────────── */
  function objOpen(session, id) {
    const done = !!(session.objProgress[id] && session.objProgress[id].done);
    return uiState.cardOpen[id] !== undefined ? uiState.cardOpen[id] : !done;
  }

  function moveOrder(key) {
    return (ds, dir) => {
      const session = sessionOf(S.state);
      const isChain = key === 'chainOrder';
      const items = isChain ? window.LAB.chainItems : window.LAB.irItems;
      const def = isChain ? window.LAB.chainDisplayOrder : ['scope', 'report', 'rotate', 'contain'];
      const cur = session.drills[key].length === items.length ? session.drills[key].slice() : def.slice();
      const j = ds + dir;
      if (j < 0 || j >= cur.length) return;
      const tmp = cur[ds]; cur[ds] = cur[j]; cur[j] = tmp;
      A.setDrill(key, cur);
    };
  }

  function handleAction(el, ds) {
    const session = sessionOf(S.state);
    switch (ds.action) {
      case 'enter-mode':
        uiState.bay = 'manual';
        resetBayTransient();
        uiState.reportOpenRaw = false;
        uiState.glossaryOpen = false; uiState.resetOpen = false; uiState.dockOpen = false;
        A.switchMode(ds.mode);
        break;
      case 'switch-mode':
        A.switchMode(ds.mode);
        break;
      case 'jump-bay':
        uiState.bay = ds.bay;
        uiState.dockOpen = false;
        resetBayTransient();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        render();
        break;
      case 'open-dock': uiState.dockOpen = true; render(); break;
      case 'close-dock': uiState.dockOpen = false; render(); break;
      case 'open-glossary': uiState.glossaryOpen = true; render(); break;
      case 'close-glossary': uiState.glossaryOpen = false; render(); break;
      case 'open-reset': uiState.resetOpen = true; render(); break;
      case 'cancel-reset': uiState.resetOpen = false; render(); break;
      case 'confirm-reset':
        uiState.resetOpen = false; uiState.bay = 'manual';
        resetBayTransient();
        uiState.glossaryOpen = false; uiState.dockOpen = false; uiState.reportOpenRaw = false;
        A.resetAll();
        break;
      case 'open-report': uiState.reportOpenRaw = true; render(); break;
      case 'close-report':
        uiState.reportOpenRaw = false;
        A.markCompletionShown();
        break;
      case 'modal-switch':
        uiState.reportOpenRaw = false;
        A.markCompletionShown();
        A.switchMode(ds.mode);
        break;
      case 'modal-reset':
        uiState.reportOpenRaw = false;
        A.markCompletionShown();
        uiState.bay = 'manual';
        resetBayTransient();
        uiState.glossaryOpen = false; uiState.resetOpen = false; uiState.dockOpen = false;
        A.resetAll();
        break;
      case 'toggle-card':
        uiState.cardOpen[ds.obj] = !objOpen(session, ds.obj);
        render();
        break;
      case 'toggle-raw':
        uiState.rawOpen[ds.eid] = !uiState.rawOpen[ds.eid];
        render();
        break;
      case 'toggle-term':
        uiState.openTerm = uiState.openTerm === ds.term ? null : ds.term;
        render();
        break;
      case 'hint': A.useHint(ds.obj); break;
      case 'check-obj': A.checkObjective(ds.obj); break;
      case 'run-wave': A.runWave(); break;
      case 'check-quiz': {
        const qi = parseInt(ds.qi, 10);
        A.checkQuiz(ds.qid);
        window.LabQuiz.scrollAfterLock(isNaN(qi) ? 0 : qi);
        break;
      }
      case 'order-move': moveOrder(ds.key)(parseInt(ds.idx, 10), parseInt(ds.dir, 10)); break;
      case 'trap-switch': {
        const trap = ds.trap;
        const cur = session.traps[trap];
        if (ds.field === 'services') {
          A.patchTraps(trap, { services: { ...cur.services, [ds.sub]: !cur.services[ds.sub] } });
        } else {
          A.patchTraps(trap, { [ds.field]: !cur[ds.field] });
        }
        break;
      }
      default: break;
    }
  }

  /* ── delegated events ─────────────────────────────────────────────────────── */
  document.addEventListener('click', (e) => {
    // Radix-style outside-click dismissal for overlays
    const ov = e.target.closest ? e.target.closest('[data-overlay]') : null;
    if (ov && e.target === ov) {
      const kind = ov.getAttribute('data-overlay');
      if (kind === 'glossary') { uiState.glossaryOpen = false; render(); return; }
      if (kind === 'reset') { uiState.resetOpen = false; render(); return; }
      if (kind === 'dock') { uiState.dockOpen = false; render(); return; }
      if (kind === 'report') { uiState.reportOpenRaw = false; A.markCompletionShown(); return; }
    }
    const actionEl = e.target.closest ? e.target.closest('[data-action]') : null;
    if (actionEl) {
      if (actionEl.disabled) return;
      handleAction(actionEl, actionEl.dataset);
      return;
    }
    // outside-click closes an open term popover
    if (uiState.openTerm && !(e.target.closest && e.target.closest('.term-wrap'))) {
      uiState.openTerm = null;
      render();
    }
  });

  document.addEventListener('change', (e) => {
    const el = e.target;
    const kind = el.getAttribute && el.getAttribute('data-change');
    if (!kind) return;
    const session = sessionOf(S.state);
    if (kind === 'trap') {
      const trap = el.getAttribute('data-trap');
      const field = el.getAttribute('data-field');
      if (el.disabled) return;
      A.patchTraps(trap, { [field]: el.value });
    } else if (kind === 'drill') {
      const key = el.getAttribute('data-key');
      const slot = el.getAttribute('data-slot');
      if (slot) A.setDrill(key, { ...session.drills[key], [slot]: el.value });
      else A.setDrill(key, el.value);
    } else if (kind === 'drill-multi') {
      const key = el.getAttribute('data-key');
      const id = el.getAttribute('data-id');
      const cur = session.drills[key];
      A.setDrill(key, cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
    } else if (kind === 'triage') {
      const eid = el.getAttribute('data-eid');
      A.setDrill('triage', { ...session.drills.triage, [eid]: el.value });
    } else if (kind === 'quiz') {
      A.answerQuiz(el.getAttribute('data-qid'), el.value);
    }
  });

  // text benches persist silently — no re-render, so the caret never jumps
  document.addEventListener('input', (e) => {
    const key = e.target.getAttribute && e.target.getAttribute('data-input');
    if (key) A.setDrillSilent(key, e.target.value);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (uiState.openTerm) { uiState.openTerm = null; render(); return; }
      if (uiState.resetOpen) { uiState.resetOpen = false; render(); return; }
      if (uiState.glossaryOpen) { uiState.glossaryOpen = false; render(); return; }
      if (uiState.dockOpen) { uiState.dockOpen = false; render(); return; }
      if (modalOpenFor(S.state)) { uiState.reportOpenRaw = false; A.markCompletionShown(); render(); }
      return;
    }
    // light focus trap while a dialog overlay is open (Radix parity)
    if (e.key === 'Tab') {
      const ov = document.querySelector('[data-overlay]');
      if (!ov) return;
      const focusables = ov.querySelectorAll('button, a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])');
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!ov.contains(document.activeElement)) {
        e.preventDefault(); first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
  });

  /* ── boot ─────────────────────────────────────────────────────────────────── */
  function boot() {
    S.subscribe(render);
    S.init(); // loads persisted state, then notifies → first real render
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
