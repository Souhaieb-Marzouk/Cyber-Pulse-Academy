// ─── Bootstrap, screen orchestration, tower header, dialogs, pulse ───────────
// Ported from LabRoot.tsx / Workspace.tsx. Hydration is deferred one tick so the
// first paint stays consistent (same behavior as the original useEffect).
'use strict';

/* ── ui-local state (component state that unmounts with screens in the original) ── */
let ui = defaultUi();

function defaultUi() {
  return {
    // briefing
    coreOpen: new Set(['k0']),
    glossOpen: false,
    // tower (Workspace useState — reset on remount)
    tab: 'inspector',
    selectedNode: null,
    mobileRailOpen: false,
    finishOpen: false,
    launchSrc: 'photo-uploader',
    rewriteChoice: '',
    rewriteReject: '',
    openObj: null,
    // quiz (Quiz useState)
    pendingIdx: null,
    pendingFor: null,
  };
}

function resetUiFor(screen) {
  const fresh = defaultUi();
  if (screen === 'brief') { ui.coreOpen = fresh.coreOpen; ui.glossOpen = fresh.glossOpen; }
  else if (screen === 'tower') {
    ui.tab = fresh.tab; ui.selectedNode = fresh.selectedNode; ui.mobileRailOpen = fresh.mobileRailOpen;
    ui.finishOpen = fresh.finishOpen; ui.launchSrc = fresh.launchSrc;
    ui.rewriteChoice = fresh.rewriteChoice; ui.rewriteReject = fresh.rewriteReject; ui.openObj = fresh.openObj;
  } else if (screen === 'quiz') { ui.pendingIdx = fresh.pendingIdx; ui.pendingFor = fresh.pendingFor; }
}

let currentScreen = null;
let pulseTimer = null;
let hydrated = false;

function dispatch(action) { store.dispatch(action); }
function uiChanged() { render(false); }

function selectNode(id) {
  ui.selectedNode = id;
  if (id) ui.tab = 'inspector';
  uiChanged();
}

function onJump(tab, node) {
  ui.selectedNode = node;
  ui.tab = tab;
  ui.mobileRailOpen = false;
  uiChanged();
}

/* ── store subscription → render ── */
store.subscribe((state, action) => {
  // close dialogs when leaving the tower (original: Workspace unmount)
  if (state.screen !== 'tower' && ui.finishOpen) { ui.finishOpen = false; closeDialog(false); }
  render(true, action);
  completionEffect(state);
});

/** completion modal auto-open/close (original useEffect in Workspace) */
function completionEffect(state) {
  if (state.screen === 'tower' && hydrated) {
    if (allDone(state)) {
      if (!state.completionSeen && !ui.finishOpen) {
        ui.finishOpen = true;
        openDialog({ content: buildCompletion(state, dispatch), onClose: finishDialogClose, labelId: 'completion-title', descId: 'completion-desc' });
      }
    } else if (ui.finishOpen) {
      // programmatic close (Radix controlled close) — no onOpenChange callback
      ui.finishOpen = false;
      closeDialog(false);
    }
  }
}

function finishDialogClose() {
  ui.finishOpen = false;
  dispatch({ type: 'SEE_COMPLETION' });
}

function openFinishDialog() {
  ui.finishOpen = true;
  openDialog({ content: buildCompletion(store.state, dispatch), onClose: finishDialogClose, labelId: 'completion-title', descId: 'completion-desc' });
}

/* ── render orchestration ── */
function render(fromDispatch, action) {
  const state = store.state;
  if (state.screen !== currentScreen) {
    const prev = currentScreen;
    currentScreen = state.screen;
    resetUiFor(state.screen);
    LOGS_SCROLL = 0; // fresh screen mount — the original remounts ScrollArea too
    buildScreen(state);
    if (state.screen === 'tower' && state.pulse) playPulse(state.pulse); // remount replay
    return;
  }
  if (state.screen === 'tower') updateTower(state, action);
  else if (state.screen === 'quiz') rebuildScreen(state);
  else if (state.screen === 'brief') rebuildScreen(state);
  else if (state.screen === 'debrief') rebuildScreen(state);
  else if (state.screen === 'mode') rebuildScreen(state);
}

function rebuildScreen(state) {
  const app = document.getElementById('app');
  withFocusRestore(() => { app.replaceChildren(); buildScreenInner(app, state); });
}

function buildScreen(state) {
  const app = document.getElementById('app');
  app.replaceChildren();
  buildScreenInner(app, state);
}

function buildScreenInner(app, state) {
  switch (state.screen) {
    case 'mode': renderModeSelect(app, dispatch); break;
    case 'brief': renderBriefing(app, dispatch); break;
    case 'tower': renderTowerSkeleton(app, state); break;
    case 'quiz': renderQuiz(app, state, dispatch); break;
    case 'debrief': renderDebrief(app, state, dispatch); break;
  }
}

/* ══════════ Tower skeleton + dynamic regions ══════════ */
function renderTowerSkeleton(root, state) {
  root.append(
    h('header', { class: 'tower-header' },
      h('div', { class: 'tower-header-inner' },
        h('h1', { class: 'tower-title' }, icon('RadioTower', 'ic-18 teal'), 'EVENTOPS CONTROL TOWER'),
        h('span', { class: 'badge badge-outline tower-mode-badge' },
          state.mode === 'medium' ? 'MEDIUM · GUIDED TOWER DUTY' : 'HARD · INCIDENT COMMANDER'),
        h('div', { class: 'tower-header-actions', id: 'tower-actions' })),
      h('div', { class: 'mobile-rail-bar' },
        h('button', {
          class: 'btn btn-ghost-sm', id: 'rail-toggle', 'data-fk': 'rail-toggle',
          'aria-expanded': String(ui.mobileRailOpen),
          onclick: () => { ui.mobileRailOpen = !ui.mobileRailOpen; uiChanged(); },
        }, ui.mobileRailOpen ? 'Hide objectives ▲' : `Show objectives (0/0) ▼`),
        h('span', { class: 'mobile-quiz-count' }, 'quiz —'))),
    h('main', { class: 'tower-main' },
      h('div', { class: 'tower-grid' },
        h('div', { id: 'rail-slot', class: 'rail-col' + (ui.mobileRailOpen ? ' open' : '') }),
        h('div', { class: 'center-col flex-col-gap-3', id: 'center-slot' }),
        h('div', { id: 'console-slot', class: 'console-col' }))));

  updateTowerHeader(state);
  updateLaunchPad(state);
  const center = document.getElementById('center-slot');
  const boardWrap = h('div', { id: 'board-wrap' });
  center.append(boardWrap);
  renderBoardCenter(boardWrap, state);
  updateTicker(state);
  renderRail(document.getElementById('rail-slot'), state, dispatch);
  renderConsole(document.getElementById('console-slot'), state, dispatch);
}

function updateTower(state, action) {
  if (action && action.type === 'INJECT') {
    // rebuild everything, then play the pulse on the persistent overlay
    withFocusRestore(() => rebuildTowerRegions(state));
    playPulse(state.pulse);
    return;
  }
  withFocusRestore(() => rebuildTowerRegions(state));
}

function rebuildTowerRegions(state) {
  // preserve an in-flight pulse animation: keep its dot elements (their WAAPI
  // animations survive the move, matching React's reconciliation behavior)
  captureLogsScroll(); // Radix ScrollArea keeps scrollTop across rerenders
  const oldPulse = document.getElementById('pulse-svg');
  const dots = oldPulse ? Array.from(oldPulse.children) : [];
  const app = document.getElementById('app');
  app.replaceChildren();
  renderTowerSkeleton(app, state);
  const newSvg = document.getElementById('pulse-svg');
  if (dots.length && newSvg) dots.forEach((d) => newSvg.append(d));
}

function updateTowerHeader(state) {
  const actions = document.getElementById('tower-actions');
  if (!actions) return;
  actions.replaceChildren();
  const score = computeScore(state);
  const done = allDone(state);
  const navBtn = (screen, label, ic) => h('button', {
    class: 'btn nav-pill' + (state.screen === screen ? ' active' : ''),
    'data-fk': 'nav:' + screen,
    ...(state.screen === screen ? { 'aria-current': 'page' } : {}),
    onclick: () => dispatch({ type: 'SET_SCREEN', screen }),
  }, icon(ic, 'ic-14'), ' ' + label);
  actions.append(
    navBtn('tower', 'TOWER', 'TerminalSquare'),
    navBtn('quiz', 'QUIZ', 'ClipboardCheck'),
    navBtn('debrief', 'DEBRIEF', 'ScrollText'),
    h('button', {
      class: 'btn nav-pill' + (done ? ' finish-done' : ' finish-idle'),
      'data-fk': 'nav:finish',
      'aria-label': done ? 'Finish the lab and see your score' : 'Complete all objectives and the quiz to finish',
      onclick: () => { if (done) openFinishDialog(); },
    }, icon('Trophy', 'ic-14'), ' FINISH'),
    h('button', {
      class: 'btn nav-pill btn-reset-pill', 'data-fk': 'nav:reset',
      onclick: () => openDialog({ content: buildResetDialog(), onClose: () => {}, alertMode: true, labelId: 'reset-title', descId: 'reset-desc' }),
    }, icon('RotateCcw', 'ic-14'), ' RESET'));

  // mobile rail bar bits
  const toggle = document.getElementById('rail-toggle');
  const stats = objectivesStats(state);
  if (toggle) {
    toggle.textContent = '';
    toggle.textContent = ui.mobileRailOpen ? 'Hide objectives ▲' : `Show objectives (${stats.passed}/${stats.total}) ▼`;
    toggle.setAttribute('aria-expanded', String(ui.mobileRailOpen));
  }
  const qline = document.querySelector('.mobile-quiz-count');
  if (qline) qline.textContent = `quiz ${score.quizCorrect}/${score.quizTotalN || '—'}`;
}

function updateLaunchPad(state) {
  const center = document.getElementById('center-slot');
  if (!center) return;
  renderLaunchPad(center, state, dispatch);
}

function updateTicker(state) {
  const center = document.getElementById('center-slot');
  if (!center) return;
  const lastLog = state.logs[state.logs.length - 1];
  center.append(h('div', { class: 'ticker', 'aria-hidden': 'true' },
    h('span', { class: 'ticker-label' }, 'TICKER ▸'),
    h('p', { class: 'ticker-text' }, lastLog ? `${lastLog.ts} [${lastLog.src}] ${lastLog.msg}` : '—')));
}

/* ══════════ Routing pulse (Board.tsx framer-motion → Web Animations API) ══════════ */
function playPulse(pulse) {
  if (pulseTimer) { clearTimeout(pulseTimer); pulseTimer = null; }
  const svg = document.getElementById('pulse-svg');
  if (!svg || !pulse) return;
  const geo = boardGeometry(store.state);
  const segs = Math.max(1, pulse.path.length - 1);
  const dots = [];
  for (let i = 0; i < pulse.path.length - 1; i++) {
    const a = geo.pos.get(pulse.path[i]);
    const b = geo.pos.get(pulse.path[i + 1]);
    if (!a || !b) continue;
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('r', '5');
    dot.setAttribute('fill', '#5eead4');
    dot.setAttribute('opacity', '0');
    dot.setAttribute('cx', String(a.x + CARD_W));
    dot.setAttribute('cy', String(a.y + CARD_H / 2));
    const dx = b.x - (a.x + CARD_W);
    const dy = (b.y + CARD_H / 2) - (a.y + CARD_H / 2);
    svg.append(dot);
    dot.animate([
      { transform: 'translate(0px, 0px)', opacity: 0.9 },
      { transform: `translate(${dx}px, ${dy}px)`, opacity: 0.9, offset: 0.99 },
      { transform: `translate(${dx}px, ${dy}px)`, opacity: 0 },
    ], { duration: 750, delay: i * 750, easing: 'ease-in-out', fill: 'forwards' });
    dots.push(dot);
  }
  pulseTimer = setTimeout(() => { dots.forEach((d) => d.remove()); pulseTimer = null; }, segs * 750 + 1100);
}

/* ── hydrate + boot (original: deferred useEffect, dispatch(HYDRATE)) ── */
function boot() {
  const splash = document.getElementById('splash');
  setTimeout(() => {
    const restored = loadSavedState();
    if (restored) {
      dispatch({ type: 'HYDRATE', state: restored }); // resyncs LOG_ID (same as original)
    }
    hydrated = true;
    if (splash) splash.remove();
    currentScreen = null;
    render(false);
    completionEffect(store.state); // the original effect also fires on remount after resume
  }, 0);
}

document.addEventListener('DOMContentLoaded', boot);
