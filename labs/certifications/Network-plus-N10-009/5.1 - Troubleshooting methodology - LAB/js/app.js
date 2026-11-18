// ── Fault Isolation Line — app bootstrap & wiring (js/app.js) ──
// Orchestrator ported 1:1 from src/app/page.tsx: phase model, rail gating,
// drawers, reset dialog, completion modal, delegated events, focus handling,
// localStorage resume. Vanilla JS, classic scripts, zero dependencies.

// ── local UI state (module-scoped, as in the original component state) ──
let clipboardOpen = false;
let glossaryOpen = false;
let resetOpen = false;
let showCompletion = false;
let completionOpener = null; // element to refocus on ESC-close of the modal
let pendingFocusKey = null;  // intentional focus move (drawer open)
let lastViewKey = null;      // phase transition detection for the 220ms fade
// Uncontrolled <details> open-state mirror (parity with React uncontrolled
// details: survives re-renders within a session, resets on reload).
const chatOpenUI = new Set();
function chatIsOpen(id) { return chatOpenUI.has(id); }

// ── derived model (mirrors page.tsx) ──
function stationObjs(s, stationId) {
  if (!s.mode) return [];
  return (STATION_OBJECTIVES[stationId] && STATION_OBJECTIVES[stationId][s.mode]) || [];
}
function stopDone(s, stationId) {
  return stationObjs(s, stationId).every(function (id) { return s.objectives[id] && s.objectives[id].done; });
}
function railStops(s) {
  return STATIONS.map(function (st, i) {
    const isDispatch = i === 0;
    const active = isDispatch
      ? s.phase === 'dispatch'
      : s.phase === 'line' && s.stationIdx === i - 1;
    const unlocked = i === 0 || STATIONS.slice(0, i).every(function (_, k) { return stopDone(s, STATIONS[k].id); });
    return {
      idx: i, num: st.num, name: st.name,
      done: stopDone(s, st.id) && !(isDispatch && s.mode === 'hard'),
      active: active, locked: !unlocked,
    };
  });
}
function eligibleForCompletion(s) {
  const objIds = s.mode ? OBJECTIVE_ORDER[s.mode] : [];
  const doneCount = objIds.filter(function (id) { return s.objectives[id] && s.objectives[id].done; }).length;
  return objIds.length > 0 && doneCount === objIds.length && s.quiz.submitted;
}

// ── renderers ──
function renderHeader(s) {
  const wrap = document.getElementById('obj-counter-wrap');
  if (s.mode) {
    const objIds = OBJECTIVE_ORDER[s.mode];
    const doneCount = objIds.filter(function (id) { return s.objectives[id] && s.objectives[id].done; }).length;
    wrap.classList.remove('hidden');
    wrap.textContent = 'obj ' + doneCount + '/' + objIds.length;
    document.getElementById('case-chip').classList.remove('hidden');
    const badge = document.getElementById('mode-badge');
    badge.classList.remove('hidden');
    badge.textContent = s.mode === 'hard' ? 'hard shift' : 'medium shift';
    badge.className = 'tag mode-badge ' + (s.mode === 'hard' ? 'mode-badge-hard' : 'mode-badge-medium');
  } else {
    wrap.classList.add('hidden');
    document.getElementById('case-chip').classList.add('hidden');
    document.getElementById('mode-badge').classList.add('hidden');
  }
  const actions = document.getElementById('header-actions');
  let html = '';
  if (s.mode) {
    html += '<button type="button" data-clipboard-open="1" aria-haspopup="dialog" data-fk="clipboard-btn" class="btn btn-white btn-tag">\ud83d\udccb Clipboard</button>';
  }
  html += '<button type="button" data-glossary-open="1" aria-haspopup="dialog" data-fk="glossary-btn" class="btn btn-white btn-tag">\ud83d\udcd6 Glossary</button>';
  if (eligibleForCompletion(s)) {
    html += '<button type="button" data-completion-open="1" data-fk="completion-btn" class="btn btn-green btn-tag">\u2605 Completion report</button>';
  }
  if (s.mode) {
    html += '<button type="button" data-reset-open="1" data-fk="reset-btn" class="btn btn-red-outline btn-tag">\u27f2 Reset</button>';
  }
  actions.innerHTML = html;
}

function renderRail(s) {
  const railRoot = document.getElementById('rail-root');
  if (!s.mode) { railRoot.innerHTML = ''; railRoot.classList.add('hidden'); return; }
  railRoot.classList.remove('hidden');
  railRoot.innerHTML = StationRail(railStops(s));
}

function renderView(s) {
  const view = document.getElementById('view');
  let html = '';
  if (!s.mode) {
    html = ModeSelect();
  } else if (s.phase === 'dispatch') {
    html = '<div>' + DispatchBoard(s, s.mode) +
      '<div class="enter-row"><button type="button" data-enter-line="1" data-fk="enter-line" class="btn-big-orange">' +
      (s.mode === 'hard' ? 'Enter the line — Stop 01 \u2192' : stopDone(s, 'dispatch') ? 'Case accepted — enter the line \u2192' : 'Complete the two drills to enter the line \u2192') +
      '</button></div></div>';
  } else if (s.phase === 'line') {
    const station = STATIONS[s.stationIdx + 1];
    if (station.id === 'intake') html = IntakeStop(s, s.mode);
    else if (station.id === 'theory') html = TheoryStop(s, s.mode);
    else if (station.id === 'test') html = TestStop(s, s.mode);
    else if (station.id === 'plan') html = PlanStop(s, s.mode);
    else if (station.id === 'implement') html = ImplementStop(s, s.mode);
    else if (station.id === 'verify') html = VerifyStop(s, s.mode);
    else if (station.id === 'document') html = DocumentStop(s, s.mode);
  } else if (s.phase === 'quiz') {
    html = QuizRunner(s);
  } else if (s.phase === 'debrief') {
    html = DebriefBoard(s);
  }
  view.innerHTML = html;

  // framer-motion parity: incoming view fades/rises (220ms ease-out)
  const viewKey = s.phase + '-' + s.stationIdx + '-' + (s.mode || '');
  if (viewKey !== lastViewKey) {
    lastViewKey = viewKey;
    view.classList.remove('view-anim');
    void view.offsetWidth; // restart the animation
    view.classList.add('view-anim');
  }
}

function renderActionBar(s) {
  const bar = document.getElementById('action-bar');
  if (s.mode && s.phase === 'line') {
    const station = STATIONS[s.stationIdx + 1];
    const curDone = stopDone(s, station.id);
    const isLastStop = s.stationIdx === 6;
    const nextNum = STATIONS[s.stationIdx + 2] ? STATIONS[s.stationIdx + 2].num : '';
    bar.innerHTML = '<p class="bar-status" aria-live="polite">' +
      (curDone
        ? '\u2713 All tasks at <strong>Stop ' + station.num + '</strong> verified.'
        : 'Pass every task card at this stop to send the case on.') +
      '</p>' +
      '<button type="button" data-next-stop="1" data-fk="next-stop"' + (curDone ? '' : ' disabled') +
      ' class="btn btn-orange btn-bar">' +
      (isLastStop ? 'Quality audit \u2192' : 'Send case to Stop ' + nextNum + ' \u2192') +
      '</button>';
    bar.classList.remove('hidden');
  } else {
    bar.innerHTML = '';
    bar.classList.add('hidden');
  }
}

function clipboardBody(s) {
  const mode = s.mode;
  const objIds = mode ? OBJECTIVE_ORDER[mode] : [];
  let html = '<ul class="clip-list">';
  objIds.forEach(function (id) {
    const o = OBJECTIVES[id];
    const a = s.objectives[id];
    const res = s.results[id];
    let station = null;
    STATIONS.forEach(function (st) { if (stationObjs(s, st.id).indexOf(id) !== -1) station = st; });
    html += '<li class="clip-item ' + (a && a.done ? 'clip-done' : '') + '">' +
      '<div class="clip-head"><span class="clip-id">' + esc(id) + '</span>' +
      '<span class="badge ' + (a && a.done ? 'badge-pass' : 'badge-open') + '">' + (a && a.done ? '\u2713 passed' : 'open') + '</span>' +
      (station ? '<button type="button" data-clip-jump="' + STATIONS.indexOf(station) + '" class="clip-jump">stop ' + station.num + ' \u2197</button>' : '') +
      '</div>' +
      '<p class="clip-title">' + esc(o.title) + '</p>' +
      (res && !(a && a.done) ? '<p class="clip-last">Last check: ' + esc(res.feedback.slice(0, 110)) + '\u2026</p>' : '') +
      '</li>';
  });
  html += '</ul>';
  return html;
}

function glossaryBody() {
  let html = '<ul class="gloss-list">';
  GLOSSARY.forEach(function (g) {
    html += '<li class="gloss-item"><p class="gloss-term">' + esc(g.term) + '</p><p class="gloss-def">' + esc(g.def) + '</p></li>';
  });
  html += '</ul>';
  return html;
}

function resetDialogHtml() {
  return '<div class="modal-root" role="dialog" aria-modal="true" aria-label="Confirm reset">' +
    '<div class="modal-overlay" data-reset-cancel aria-hidden="true"></div>' +
    '<div class="modal-card reset-card completion-in">' +
    '<h2 class="modal-title-sm">Reset the lab?</h2>' +
    '<p class="reset-copy">This wipes saved progress, objective results, quiz answers, and stars — a pristine fresh shift.</p>' +
    '<div class="reset-btns">' +
    '<button type="button" data-reset-cancel data-fk="reset-cancel" class="btn btn-white">Keep working</button>' +
    '<button type="button" data-reset-confirm data-fk="reset-confirm" class="btn btn-red">Reset lab</button>' +
    '</div></div></div>';
}

function renderOverlays(s) {
  const root = document.getElementById('overlay-root');
  let html = '';
  if (clipboardOpen) html += DrawerShell(true, 'Objectives — ' + (s.mode === 'hard' ? 'hard' : 'medium') + ' shift', 'right', clipboardBody(s));
  if (glossaryOpen) html += DrawerShell(true, 'Glossary — 5.1 vocabulary', 'left', glossaryBody());
  if (resetOpen) html += resetDialogHtml();
  if (showCompletion && eligibleForCompletion(s)) {
    const objIds = OBJECTIVE_ORDER[s.mode];
    const doneCount = objIds.filter(function (id) { return s.objectives[id] && s.objectives[id].done; }).length;
    const quizQuestions = quizQuestionsFor(s.mode);
    const stars = computeStars(s.objectives);
    const pillarMap = { P1: { done: 0, total: 0 }, P2: { done: 0, total: 0 }, P3: { done: 0, total: 0 }, P4: { done: 0, total: 0 } };
    objIds.forEach(function (id) {
      const o = OBJECTIVES[id];
      if (!o) return;
      pillarMap[o.pillar].total += 1;
      if (s.objectives[id] && s.objectives[id].done) pillarMap[o.pillar].done += 1;
    });
    html += CompletionModal({
      stars: stars.stars, deductions: stars.deductions,
      passed: doneCount, total: objIds.length,
      quizCorrect: quizScore(s.quiz, quizQuestions), quizTotal: quizQuestions.length,
      mode: s.mode, pillarsDone: pillarMap, focusAreas: computeFocusAreas(s, quizQuestions),
    });
  }
  root.innerHTML = html;
}

// ── focus preservation across re-render ──
function captureFocusKey() {
  const el = document.activeElement;
  return el && el.getAttribute ? el.getAttribute('data-fk') : null;
}
function restoreFocus(key) {
  if (!key) return;
  const el = document.querySelector('[data-fk="' + key + '"]');
  if (el && !el.disabled) el.focus({ preventScroll: true });
}

// ── master render ──
function renderAll() {
  const s = store.getState();
  const fk = captureFocusKey();
  renderHeader(s);
  renderRail(s);
  renderView(s);
  renderActionBar(s);
  renderOverlays(s);
  // terminals autoscroll (parity with the Terminal useEffect)
  document.querySelectorAll('.terminal-log').forEach(function (el) {
    el.scrollTop = el.scrollHeight;
  });
  if (pendingFocusKey) {
    // intentional focus move (e.g. drawer opens → close button focused)
    const el = document.querySelector('[data-fk="' + pendingFocusKey + '"]');
    pendingFocusKey = null;
    if (el) el.focus();
  } else {
    restoreFocus(fk);
  }
}

// ── navigation helpers (parity: smooth scroll to the workbench top) ──
function scrollToWorkbench() {
  const main = document.getElementById('workbench');
  if (main) main.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function onRailSelect(idx) {
  if (idx === 0) store.dispatch({ type: 'GOTO', phase: 'dispatch' });
  else store.dispatch({ type: 'GOTO', phase: 'line', stationIdx: idx - 1 });
  scrollToWorkbench();
}
function goToNextStop() {
  const s = store.getState();
  if (s.stationIdx < 6) store.dispatch({ type: 'GOTO', phase: 'line', stationIdx: s.stationIdx + 1 });
  else store.dispatch({ type: 'GOTO', phase: 'quiz' });
  scrollToWorkbench();
}

// ── event delegation ──
function handleAct(action) {
  store.dispatch(action);
}

document.addEventListener('click', function (e) {
  const s = store.getState();
  const actEl = e.target.closest ? e.target.closest('[data-act]') : null;
  if (actEl && !actEl.disabled) {
    handleAct(JSON.parse(actEl.getAttribute('data-act')));
    return;
  }
  const navEl = e.target.closest ? e.target.closest('[data-nav]') : null;
  if (navEl && !navEl.disabled) { onRailSelect(Number(navEl.getAttribute('data-nav'))); return; }
  const modeEl = e.target.closest ? e.target.closest('[data-mode]') : null;
  if (modeEl) { store.dispatch({ type: 'SET_MODE', mode: modeEl.getAttribute('data-mode') }); return; }
  const jumpEl = e.target.closest ? e.target.closest('[data-jump]') : null;
  if (jumpEl) {
    const phase = jumpEl.getAttribute('data-jump');
    store.dispatch({ type: 'GOTO', phase: phase, stationIdx: phase === 'line' ? s.stationIdx : undefined });
    return;
  }
  const clipJump = e.target.closest ? e.target.closest('[data-clip-jump]') : null;
  if (clipJump) { clipboardOpen = false; onRailSelect(Number(clipJump.getAttribute('data-clip-jump'))); return; }

  if (e.target.closest('[data-clipboard-open]')) { clipboardOpen = true; pendingFocusKey = 'drawer-close'; renderAll(); return; }
  if (e.target.closest('[data-glossary-open]')) { glossaryOpen = true; pendingFocusKey = 'drawer-close'; renderAll(); return; }
  if (e.target.closest('[data-close-drawer]')) { clipboardOpen = false; glossaryOpen = false; renderAll(); return; }
  if (e.target.closest('[data-reset-open]')) { resetOpen = true; renderAll(); return; }
  if (e.target.closest('[data-reset-cancel]')) { resetOpen = false; renderAll(); return; }
  if (e.target.closest('[data-reset-confirm]')) {
    try { window.localStorage.removeItem(LS_KEY); } catch (err) { /* noop */ }
    store.dispatch({ type: 'RESET' });
    resetOpen = false;
    showCompletion = false;
    return;
  }
  if (e.target.closest('[data-completion-open]')) {
    completionOpener = document.activeElement;
    showCompletion = true;
    renderAll();
    return;
  }
  if (e.target.closest('[data-finish]')) {
    completionOpener = document.activeElement;
    showCompletion = true;
    renderAll();
    return;
  }
  if (e.target.closest('[data-review]')) { showCompletion = false; store.dispatch({ type: 'SEEN_COMPLETION' }); renderAll(); return; }
  if (e.target.closest('[data-modal-reset]')) { showCompletion = false; resetOpen = true; renderAll(); return; }
  if (e.target.closest('[data-enter-line]')) {
    store.dispatch({ type: 'GOTO', phase: 'line', stationIdx: 0 });
    scrollToWorkbench();
    return;
  }
  if (e.target.closest('[data-next-stop]')) {
    const btn = e.target.closest('[data-next-stop]');
    if (!btn.disabled) goToNextStop();
    return;
  }
});

// selects + text input
document.addEventListener('change', function (e) {
  const el = e.target.closest ? e.target.closest('[data-act-change]') : null;
  if (el && !el.disabled) {
    const tpl = el.getAttribute('data-act-change');
    const action = JSON.parse(tpl.split(':value').join(String(el.value)));
    store.dispatch(action);
  }
});
document.addEventListener('input', function (e) {
  if (e.target.closest && e.target.closest('[data-doc-input]')) {
    // Silent update: keep the caret/focus untouched while typing the change ID.
    store.dispatch({ type: 'SET_DOC', field: 'changeId', value: e.target.value }, { silent: true });
  }
});

// <details> interviews — record OPEN_CHAT on first open (parity with onToggle)
document.addEventListener('toggle', function (e) {
  const d = e.target;
  if (d.tagName === 'DETAILS' && d.hasAttribute('data-chat-id')) {
    if (d.open) {
      chatOpenUI.add(d.getAttribute('data-chat-id'));
      handleAct({ type: 'OPEN_CHAT', id: d.getAttribute('data-chat-id') });
    } else {
      chatOpenUI.delete(d.getAttribute('data-chat-id'));
    }
  }
}, true);

// ESC paths (parity: each drawer had its own ESC listener — one ESC closes
// all open drawers; reset dialog + completion modal share the page effect,
// which only dispatches SEEN_COMPLETION / refocuses when the modal was open)
document.addEventListener('keydown', function (e) {
  if (e.key !== 'Escape') return;
  if (clipboardOpen || glossaryOpen) {
    clipboardOpen = false;
    glossaryOpen = false;
    renderAll();
  }
  const completionWasOpen = showCompletion;
  if (resetOpen || showCompletion) {
    showCompletion = false;
    resetOpen = false;
    if (!completionWasOpen) { renderAll(); return; }
    store.dispatch({ type: 'SEEN_COMPLETION' });
    if (completionOpener && completionOpener.focus) completionOpener.focus();
    completionOpener = null;
    renderAll();
  }
});

// ── bootstrap ──
store.init();
store.subscribe(renderAll);
renderAll();
