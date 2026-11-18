// ─── The Cascadia Clearance — bootstrap, shell & event wiring ─────────────
// Ported from the original page.tsx. Classic script, no framework: a tiny
// scoped renderer re-renders only what changes (like React's per-component
// updates in the original) so form focus and scroll positions survive.
'use strict';

const CHAPTERS = [
  { id: 1, label: 'Case' },
  { id: 2, label: 'Primer' },
  { id: 3, label: 'Evidence' },
  { id: 4, label: 'Quiz' },
  { id: 5, label: 'Debrief' },
];

// ── header (in-lab chrome, not site navigation) ──
function renderHeaderHTML() {
  const s = store.state;
  const objectives = currentObjectives();
  const quiz = currentQuiz();
  const doneCount = objectives.filter(function (o) { return s.obj[o.id] && s.obj[o.id].done; }).length;

  const navButtons = CHAPTERS.map(function (c) {
    const active = s.chapter === c.id;
    const complete =
      (c.id === 2 && (s.mode === 'hard' || (s.obj['OBJ-M1'] && s.obj['OBJ-M1'].done))) ||
      (c.id === 3 && doneCount === objectives.length) ||
      (c.id === 4 && quiz.every(function (q) { return s.quiz[q.id] !== undefined; })) ||
      (c.id === 5 && s.completedAt !== null);
    return (
      '<button type="button" data-action="goto-chapter" data-chapter="' + c.id + '"' +
      ' aria-current="' + (active ? 'page' : 'false') + '"' +
      ' class="chapter-btn' + (active ? ' chapter-active' : '') + '">' +
      (complete ? icon('circle-check', 'i-12 chapter-tick') : '') +
      c.label +
      '</button>'
    );
  }).join('');

  return (
    '<div class="header-inner">' +
      '<div class="header-title">' +
        '<h1 class="display-title">THE CASCADIA <span class="accent">CLEARANCE</span></h1>' +
        '<p class="header-sub">Security+ 2.5 · AI security risks · ' + s.mode + ' mode</p>' +
      '</div>' +
      '<nav aria-label="Lab chapters" class="chapter-nav">' + navButtons + '</nav>' +
      '<div class="header-right">' +
        progressRing(doneCount, objectives.length) +
        '<button type="button" class="btn btn-outline btn-reset" data-action="open-reset" aria-label="Reset lab">' +
          icon('rotate-ccw', 'i-16') + '<span class="reset-label">Reset</span>' +
        '</button>' +
      '</div>' +
    '</div>'
  );
}

function rerenderHeader() {
  const el = document.querySelector('.lab-header');
  if (el) el.innerHTML = renderHeaderHTML();
}

// ── stage content per chapter ──
function renderStageInnerHTML() {
  const s = store.state;
  const doneCount = currentObjectives().filter(function (o) { return s.obj[o.id] && s.obj[o.id].done; }).length;
  const objectives = currentObjectives();

  // R2 parity: the quiz restarts at question 1 whenever the chapter is
  // re-entered (the original remounted the Quiz component).
  if (s.chapter === 4 && uiState.lastChapter !== 4) uiState.quizIdx = 0;
  uiState.lastChapter = s.chapter;

  switch (s.chapter) {
    case 1:
      return renderBriefing(s.mode);

    case 2:
      return (
        renderPrimer() +
        '<div class="continue-row">' +
          '<button type="button" class="btn btn-primary btn-44 btn-wide" data-action="goto-chapter" data-chapter="3">Open the evidence locker <span aria-hidden>→</span></button>' +
        '</div>'
      );

    case 3: {
      const trackerSlot = '<div class="tracker-slot">' + renderTrackerHTML() + '</div>';
      const paneSwitch =
        '<div class="pane-switch" role="tablist" aria-label="Evidence view switch">' +
          '<button type="button" role="tab" aria-selected="' + (uiState.mobilePane === 'objectives') + '" data-action="mobile-pane" data-pane="objectives" class="pane-btn' + (uiState.mobilePane === 'objectives' ? ' pane-active' : '') + '">Objectives (' + doneCount + '/' + objectives.length + ')</button>' +
          '<button type="button" role="tab" aria-selected="' + (uiState.mobilePane === 'stage') + '" data-action="mobile-pane" data-pane="stage" class="pane-btn' + (uiState.mobilePane === 'stage' ? ' pane-active' : '') + '">Evidence &amp; worksheet</button>' +
        '</div>';
      const workbenchTabs =
        '<div class="workbench-tabs" role="tablist" aria-label="Workbench tabs">' +
          '<button type="button" role="tab" aria-selected="' + (uiState.view === 'evidence') + '" data-action="workbench-tab" data-view="evidence" class="wb-tab' + (uiState.view === 'evidence' ? ' wb-active' : '') + '">Evidence locker</button>' +
          '<button type="button" role="tab" aria-selected="' + (uiState.view === 'worksheet') + '" data-action="workbench-tab" data-view="worksheet" class="wb-tab' + (uiState.view === 'worksheet' ? ' wb-active' : '') + '">Analyst worksheet</button>' +
          '<span class="mono wb-hint">' +
            (s.mode === 'medium'
              ? 'Work the objectives top-down — Open buttons jump you to the artifact'
              : 'Triage everything yourself — two artifacts are noise') +
          '</span>' +
        '</div>';
      return (
        paneSwitch +
        '<div id="pane-objectives" class="mobile-tracker-pane' + (uiState.mobilePane === 'objectives' ? '' : ' pane-hidden') + '">' +
          '<div class="card tracker-card">' + trackerSlot + '</div>' +
        '</div>' +
        '<div id="pane-stage" class="stage-pane' + (uiState.mobilePane === 'stage' ? '' : ' pane-hidden') + '">' +
          workbenchTabs +
          '<div id="evidence-area" class="' + (uiState.view === 'evidence' ? '' : 'pane-hidden') + '">' + renderEvidenceInner() + '</div>' +
          '<div id="worksheet-area" class="worksheet-stack ' + (uiState.view === 'worksheet' ? '' : 'pane-hidden') + '">' + renderWorksheetHTML() + '</div>' +
          '<div class="continue-row">' +
            '<button type="button" class="btn btn-primary btn-44 btn-wide" data-action="goto-chapter" data-chapter="4">Continue to the knowledge check <span aria-hidden>→</span></button>' +
          '</div>' +
        '</div>'
      );
    }

    case 4:
      return (
        '<div id="quiz-area">' + renderQuizInner() + '</div>' +
        '<div class="continue-row">' +
          '<button type="button" class="btn btn-primary btn-44 btn-wide" data-action="goto-chapter" data-chapter="5">Continue to the debrief <span aria-hidden>→</span></button>' +
        '</div>'
      );

    case 5:
      return renderDebrief();
  }
  return '';
}

function renderShellHTML() {
  const s = store.state;
  const sidebar =
    s.chapter === 3
      ? '<aside class="tracker-sidebar" aria-label="Objectives sidebar"><div class="tracker-slot">' + renderTrackerHTML() + '</div></aside>'
      : '';
  return (
    '<div class="lab-shell">' +
      '<header class="lab-header">' + renderHeaderHTML() + '</header>' +
      '<div class="lab-layout">' +
        sidebar +
        '<main class="stage-main" id="stage">' + renderStageInnerHTML() + '</main>' +
      '</div>' +
    '</div>' +
    '<div id="modal-root"></div>'
  );
}

// ── master render: scope-targeted, mirroring React's partial re-renders ──
function render(scope) {
  const root = document.getElementById('root');

  switch (scope) {
    case 'header':
      rerenderHeader();
      return;
    case 'tracker':
      rerenderTracker();
      rerenderHeader();
      return;
    case 'primer':
      rerenderPrimer();
      rerenderTracker();
      rerenderHeader();
      return;
    case 'quiz':
      rerenderQuiz();
      return;
    case 'modal':
      document.getElementById('modal-root').innerHTML =
        uiState.modalOpen ? renderCompletionModal() : (uiState.resetOpen ? renderResetDialog() : '');
      if (uiState.modalOpen) {
        const dlg = document.querySelector('.modal-dialog');
        if (dlg) dlg.focus();
      } else if (uiState.resetOpen) {
        const dlg = document.querySelector('.reset-dialog');
        if (dlg) dlg.focus();
      }
      return;
    case 'stage':
    case 'all':
    default:
      break;
  }

  if (!store.hydrated) {
    root.innerHTML = '<main class="mode-select"><p class="mono opening-note">Opening the dossier…</p></main>';
    return;
  }
  if (!store.state.mode) {
    root.innerHTML = renderModeSelect();
    return;
  }
  root.innerHTML = renderShellHTML();
}

// ── action handlers (mirror the original's callbacks) ──
function checkObjective(id) {
  const obj = currentObjectives().find(function (o) { return o.id === id; });
  if (!obj) return;
  const passed = obj.check(store.state);
  const p = store.state.obj[id] || { done: false, firstAttempt: true, hints: 0, attempts: 0 };
  const nextObj = passed
    ? { done: true, firstAttempt: p.done ? p.firstAttempt : p.attempts === 0, hints: p.hints, attempts: p.attempts + 1 }
    : { done: p.done, firstAttempt: p.firstAttempt, hints: p.hints, attempts: p.attempts + 1 };
  uiState.feedback[id] = { ok: passed, msg: passed ? obj.ok : obj.bad };
  update(function (s) {
    return Object.assign({}, s, { obj: Object.assign({}, s.obj, (function () { const o = {}; o[id] = nextObj; return o; })()) });
  }, 'tracker');
  if (id === 'OBJ-M1') notify('primer');
}

function hintObjective(id) {
  const obj = currentObjectives().find(function (o) { return o.id === id; });
  if (!obj) return;
  const p = store.state.obj[id] || { done: false, firstAttempt: true, hints: 0, attempts: 0 };
  if (p.hints >= obj.hints.length) return;
  update(function (s) {
    const next = Object.assign({}, s.obj[id], { hints: p.hints + 1 });
    return Object.assign({}, s, { obj: Object.assign({}, s.obj, (function () { const o = {}; o[id] = next; return o; })()) });
  }, 'tracker');
}

// Jump from the tracker to an artifact: same evidence credit as clicking the
// card, otherwise the objective check dead-ends (root-cause fix QA-7).
function locateArtifact(art) {
  uiState.selected = art;
  uiState.view = 'evidence';
  uiState.mobilePane = 'stage';
  update(function (s) {
    return Object.assign({}, s, {
      chapter: 3,
      read: s.read.includes(art) ? s.read : s.read.concat([art]),
    });
  }, 'all');
}

function signClearance() {
  update(function (s) { return Object.assign({}, s, { completedAt: Date.now() }); }, 'header');
  uiState.modalOpen = true;
  notify('modal');
}

// ── event delegation ──
document.addEventListener('click', function (e) {
  const t = e.target.closest('[data-action]');
  if (!t) return;
  const action = t.getAttribute('data-action');

  switch (action) {
    case 'pick-mode':
      pickMode(t.getAttribute('data-mode'));
      break;
    case 'goto-chapter':
      update(function (s) { return Object.assign({}, s, { chapter: Number(t.getAttribute('data-chapter')) }); }, 'all');
      window.scrollTo(0, 0);
      break;
    case 'open-reset':
      uiState.resetOpen = true;
      notify('modal');
      break;
    case 'cancel-reset':
      uiState.resetOpen = false;
      notify('modal');
      break;
    case 'confirm-reset':
      uiState.resetOpen = false;
      resetLab();
      break;
    case 'check':
      checkObjective(t.getAttribute('data-obj'));
      break;
    case 'hint':
      hintObjective(t.getAttribute('data-obj'));
      break;
    case 'locate':
      locateArtifact(t.getAttribute('data-art'));
      break;
    case 'select-artifact': {
      const art = t.getAttribute('data-art');
      uiState.selected = art;
      update(function (s) {
        return s.read.includes(art) ? s : Object.assign({}, s, { read: s.read.concat([art]) });
      }, 'evidence');
      break;
    }
    case 'stamp': {
      const art = t.getAttribute('data-art');
      const value = t.getAttribute('data-value');
      update(function (s) {
        const stamps = Object.assign({}, s.stamps);
        stamps[art] = value;
        return Object.assign({}, s, { stamps: stamps });
      }, 'evidence');
      break;
    }
    case 'workbench-tab': {
      const view = t.getAttribute('data-view');
      if (uiState.view === view) break;
      uiState.view = view;
      // pure class toggle — no re-render, keeps scroll position
      const ev = document.getElementById('evidence-area');
      const ws = document.getElementById('worksheet-area');
      if (ev) ev.classList.toggle('pane-hidden', view !== 'evidence');
      if (ws) ws.classList.toggle('pane-hidden', view !== 'worksheet');
      document.querySelectorAll('.wb-tab').forEach(function (b) {
        const active = b.getAttribute('data-view') === view;
        b.classList.toggle('wb-active', active);
        b.setAttribute('aria-selected', String(active));
      });
      break;
    }
    case 'mobile-pane': {
      const pane = t.getAttribute('data-pane');
      if (uiState.mobilePane === pane) break;
      uiState.mobilePane = pane;
      const po = document.getElementById('pane-objectives');
      const ps = document.getElementById('pane-stage');
      if (po) po.classList.toggle('pane-hidden', pane !== 'objectives');
      if (ps) ps.classList.toggle('pane-hidden', pane !== 'stage');
      document.querySelectorAll('.pane-btn').forEach(function (b) {
        const active = b.getAttribute('data-pane') === pane;
        b.classList.toggle('pane-active', active);
        b.setAttribute('aria-selected', String(active));
      });
      break;
    }
    case 'quiz-pick': {
      const { q } = quizCurrent();
      const checkedNow = store.state.quiz[q.id] !== undefined && store.state.quiz[q.id + ':c'] === 1;
      if (checkedNow) break;
      const i = Number(t.getAttribute('data-idx'));
      update(function (s) {
        const quizState = Object.assign({}, s.quiz);
        quizState[q.id] = i;
        quizState[q.id + ':c'] = 1;
        return Object.assign({}, s, { quiz: quizState });
      }, 'quiz');
      break;
    }
    case 'quiz-prev':
      uiState.quizIdx = Math.max(0, uiState.quizIdx - 1);
      rerenderQuiz();
      break;
    case 'quiz-next':
      uiState.quizIdx = Math.min(currentQuiz().length - 1, uiState.quizIdx + 1);
      rerenderQuiz();
      break;
    case 'quiz-review':
      uiState.quizIdx = 0;
      rerenderQuiz();
      break;
    case 'sign':
      signClearance();
      break;
    case 'close-modal':
      uiState.modalOpen = false;
      notify('modal');
      // R7: return focus to a sensible element after the modal closes.
      requestAnimationFrame(function () {
        const signBtn = document.getElementById('sign-clearance');
        if (signBtn) signBtn.focus();
      });
      break;
    case 'modal-reset':
      uiState.modalOpen = false;
      resetLab();
      break;
  }
});

// ── form bindings (change events; no re-render → native focus preserved) ──
document.addEventListener('change', function (e) {
  const t = e.target;
  const bind = t.getAttribute('data-bind');
  if (!bind) return;
  const key = t.getAttribute('data-key');

  switch (bind) {
    case 'primerMatch':
      update(function (s) {
        const pm = Object.assign({}, s.primerMatch);
        pm[key] = t.value;
        return Object.assign({}, s, { primerMatch: pm });
      }, null); // persist only — no visual region depends on it
      break;
    case 'cls-facet':
    case 'cls-term': {
      const field = bind === 'cls-facet' ? 'facet' : 'term';
      update(function (s) {
        const cur = s.cls[key] || { facet: '', term: '' };
        const next = Object.assign({}, cur);
        next[field] = t.value;
        const cls = Object.assign({}, s.cls);
        cls[key] = next;
        return Object.assign({}, s, { cls: cls });
      }, null);
      break;
    }
    case 'multi': {
      const id = t.getAttribute('data-id');
      const max = t.getAttribute('data-max') ? Number(t.getAttribute('data-max')) : 0;
      update(function (s) {
        const cur = s.multi[key] || [];
        let next;
        if (cur.includes(id)) {
          next = cur.filter(function (x) { return x !== id; });
        } else if (max && cur.length >= max) {
          // silently ignored, exactly like the original's MultiForm
          next = cur;
        } else {
          next = cur.concat([id]);
        }
        const multi = Object.assign({}, s.multi);
        multi[key] = next;
        return Object.assign({}, s, { multi: multi });
      }, null);
      // keep the checkbox in sync when the add was blocked (max reached)
      const selNow = store.state.multi[key] || [];
      t.checked = selNow.includes(id);
      // live counter for the hard-mode control plan
      if (key === 'h8') {
        const counter = document.getElementById('h8-count');
        if (counter) counter.textContent = String(selNow.length);
      }
      break;
    }
    case 'map':
      update(function (s) {
        const maps = Object.assign({}, s.maps);
        maps[key] = t.value;
        return Object.assign({}, s, { maps: maps });
      }, null);
      break;
    case 'seq':
      update(function (s) {
        const seq = Object.assign({}, s.seq);
        seq[key] = t.value === '' ? 0 : Number(t.value);
        return Object.assign({}, s, { seq: seq });
      }, null);
      break;
    case 'drill':
      update(function (s) {
        const drill = Object.assign({}, s.drill);
        drill[key] = t.value;
        return Object.assign({}, s, { drill: drill });
      }, null);
      break;
    case 'decision':
      update(function (s) {
        const decision = Object.assign({}, s.decision);
        decision[key] = t.value;
        return Object.assign({}, s, { decision: decision });
      }, null);
      break;
    case 'text':
      update(function (s) {
        const textIn = Object.assign({}, s.textIn);
        textIn[key] = t.value;
        return Object.assign({}, s, { textIn: textIn });
      }, null);
      break;
    case 'toggle': {
      const on = t.checked;
      update(function (s) {
        const toggles = Object.assign({}, s.toggles);
        toggles[key] = on;
        return Object.assign({}, s, { toggles: toggles });
      }, null);
      // update the on/off label in place (no re-render → no focus loss)
      const label = document.querySelector('[data-state-for="' + key + '"]');
      if (label) label.textContent = on ? 'on' : 'off';
      break;
    }
    case 'reveal':
      update(function (s) {
        return Object.assign({}, s, { hiddenRevealed: t.checked });
      }, 'evidence');
      break;
  }
});

// Escape closes the topmost dialog (parity with the Radix dialog behavior).
document.addEventListener('keydown', function (e) {
  if (e.key !== 'Escape') return;
  if (uiState.modalOpen) {
    uiState.modalOpen = false;
    notify('modal');
    requestAnimationFrame(function () {
      const signBtn = document.getElementById('sign-clearance');
      if (signBtn) signBtn.focus();
    });
  } else if (uiState.resetOpen) {
    uiState.resetOpen = false;
    notify('modal');
  }
});

// ── bootstrap ──
loadPersisted();
subscribe(render);
render('all');
