// ── State store + persistence ────────────────────────────────────────────────
// Recreates the zustand store of src/lib/lab52/store.ts as a plain-JS object
// with a tiny subscribe/notify mechanism. SAME persistence key, SAME stored
// shape ({state, version:0}, partialized fields), SAME save/restore/RESET
// semantics as the original — a copy saved by either app is readable by both.
'use strict';

const STORAGE_KEY = 'n10-009-52-lab-v1';

// localStorage may be unavailable (private mode) — degrade to in-memory, as the original does.
const memoryStore = (function () {
  try {
    const probe = '__lab52_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return null;
  } catch (e) {
    const mem = new Map();
    return {
      getItem: function (k) { return mem.has(k) ? mem.get(k) : null; },
      setItem: function (k, v) { mem.set(k, v); },
      removeItem: function (k) { mem.delete(k); },
    };
  }
})();
const storage = memoryStore || window.localStorage;

function emptyObjState() {
  return { attempts: 0, hintsUsed: 0, done: false, firstTry: false, lastPass: null };
}

function freshState() {
  return {
    mode: null,
    phase: 'brief',
    env: initialEnv(),
    obj: {},
    quizAnswers: {},
    quizLocked: {},
    briefSeen: false,
    completedSeen: false,
    completionOpen: false,
  };
}

// Root state (everything the original persists + completionOpen, which the
// original keeps in memory only via partialize).
let state = freshState();
let hydrated = false;

// ── Persistence (zustand-compatible shape) ──
function partialize(s) {
  return {
    mode: s.mode,
    phase: s.phase,
    env: s.env,
    obj: s.obj,
    quizAnswers: s.quizAnswers,
    quizLocked: s.quizLocked,
    briefSeen: s.briefSeen,
    completedSeen: s.completedSeen,
  };
}

function persist() {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ state: partialize(state), version: 0 }));
  } catch (e) { /* storage full/blocked — keep working in memory */ }
}

function loadPersisted() {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const s = parsed && parsed.state ? parsed.state : null;
    if (!s) return;
    // Merge defensively so a future env field never breaks an old save.
    state = Object.assign(freshState(), s);
    state.env = Object.assign(initialEnv(), s.env || {});
    state.obj = s.obj || {};
  } catch (e) { /* corrupt save — start pristine */ }
}

// ── Subscribe / notify ───────────────────────────────────────────────
const listeners = [];
function subscribe(fn) { listeners.push(fn); }
let scheduled = false;
function notify() {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(function () {
    scheduled = false;
    persist();
    listeners.forEach(function (fn) { fn(); });
  });
}

// ── Actions (mirror the store's exact semantics) ─────────────────────
const actions = {
  setMode: function (m) {
    state.mode = m;
    state.phase = 'brief';
    state.briefSeen = false;
    // Hard mode opens with the P16 standard clamped to 802.3af — the seeded second fault.
    state.env = Object.assign(initialEnv(), { poeP16Standard: m === 'hard' ? 'af-limit' : 'auto' });
    onModeChanged();
    notify();
  },
  setPhase: function (p) {
    state.phase = p;
    onPhaseChanged(p);
    notify();
  },
  // Accept a partial object OR an updater computed from the LATEST env —
  // the updater form prevents stale-closure clobbering when several env
  // writes land inside one React batch (QA-8 fix, carried over).
  patchEnv: function (patch) {
    const resolved = typeof patch === 'function' ? patch(state.env) : patch;
    Object.assign(state.env, resolved);
    notify();
  },
  // Silent env write (no re-render) — used for keystrokes in numeric inputs so
  // focus is never lost; CHECK RESULTS reads the value from state at click time.
  patchEnvSilent: function (patch) {
    const resolved = typeof patch === 'function' ? patch(state.env) : patch;
    Object.assign(state.env, resolved);
    persist();
  },
  checkObjective: function (id, pass) {
    const cur = state.obj[id] || emptyObjState();
    const attempts = cur.attempts + 1;
    state.obj[id] = {
      attempts: attempts,
      hintsUsed: cur.hintsUsed,
      done: cur.done || pass,
      firstTry: cur.done ? cur.firstTry : (attempts === 1 && pass),
      lastPass: pass,
    };
  },
  useHint: function (id) {
    const cur = state.obj[id] || emptyObjState();
    state.obj[id] = Object.assign({}, cur, { hintsUsed: Math.min(cur.hintsUsed + 1, 3) });
  },
  answerQuiz: function (id, idx) {
    state.quizAnswers[id] = idx;
    state.quizLocked[id] = true;
    notify();
  },
  markCompletedSeen: function () { state.completedSeen = true; },
  setCompletionOpen: function (v) { state.completionOpen = v; notify(); },
  reset: function () {
    state = freshState();
    uiState.openCards = {};
    uiState.quizDrafts = {};
    notify();
  },
};

// ── Derived selectors (from store.ts) ────────────────────────────────
function objectiveStats(obj, ids) {
  const done = ids.filter(function (i) { return obj[i] && obj[i].done; }).length;
  const firstTry = ids.filter(function (i) { return obj[i] && obj[i].firstTry; }).length;
  const hints = ids.reduce(function (a, i) { return a + ((obj[i] && obj[i].hintsUsed) || 0); }, 0);
  return { done: done, total: ids.length, firstTry: firstTry, hints: hints, pct: Math.round((done / Math.max(1, ids.length)) * 100) };
}

function starsFor(stats) {
  if (stats.total === 0) return 0;
  const rate = stats.firstTry / stats.total;
  const raw = 5 * rate - 0.35 * stats.hints;
  return Math.max(1, Math.round(Math.min(5, Math.max(1, raw)) * 2) / 2);
}

// ── UI-only state (the original keeps these in React useState — not persisted) ──
const uiState = {
  objectivesOpen: false,   // ObjectivesDock Sheet
  manualOpen: false,       // Field manual Dialog
  confirmResetOpen: false, // Reset AlertDialog
  openCards: {},           // objective id → expanded? (default: open in medium)
  quizDrafts: {},          // quiz id → drafted option index
  quizIdx: 0,              // current sequential question
  testRun: 'ws12',         // tester run selection
  meterRun: 'cr2',         // meter run selection
  selPort: 'p5',           // selected switch port
  lacpDisplay: null,       // shuffled LACP step display order (per mount)
};

// Mount lifecycle: the original remounts bays when phase/mode changes, which
// resets useState locals and re-shuffles the LACP sequencer (R6). Replicate that.
function onModeChanged() {
  uiState.openCards = {};
  uiState.quizDrafts = {};
  uiState.quizIdx = 0;
  uiState.testRun = 'ws12';
  uiState.meterRun = 'cr2';
  uiState.selPort = 'p5';
  uiState.objectivesOpen = false;
  uiState.manualOpen = false;
  uiState.lacpDisplay = null;
}

function onPhaseChanged(p) {
  if (p === 'quiz') {
    // Re-entry resumes at the first unanswered question (locked items stay locked).
    const firstOpen = quizFor(state.mode).findIndex(function (x) { return !state.quizLocked[x.id]; });
    uiState.quizIdx = firstOpen === -1 ? 0 : firstOpen;
    uiState.quizDrafts = {};
  }
  if (p === 'bench') {
    uiState.lacpDisplay = null; // re-shuffle per mount (Fisher–Yates below)
  }
}

function shuffleLacpDisplay() {
  if (!uiState.lacpDisplay) {
    const ids = ['add', 'document', 'confirm', 'verify'];
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = ids[i]; ids[i] = ids[j]; ids[j] = t;
    }
    uiState.lacpDisplay = ids;
  }
  return uiState.lacpDisplay;
}
