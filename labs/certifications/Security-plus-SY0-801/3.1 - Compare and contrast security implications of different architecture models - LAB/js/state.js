// ─── The Cascadia Clearance — state store + persistence ───────────────────
// Ported from the original framework lab's page.tsx state logic.
// Same persistence key, same save/restore/RESET semantics as the original:
//   - key: 'cascadia-clearance-v1'
//   - save the whole LabState object on every change
//   - restore on load (only when the saved mode is medium/hard)
//   - RESET clears the key and returns to mode selection
'use strict';

const STORAGE_KEY = 'cascadia-clearance-v1';

// Persisted lab state — same shape as the original LabState interface.
const initialState = {
  mode: null,
  chapter: 1, // 1 briefing · 2 primer · 3 evidence · 4 quiz · 5 debrief
  obj: {},        // id -> { done, firstAttempt, hints, attempts }
  primerMatch: {},// defId -> facet id
  cls: {},        // artifact -> { facet, term }
  multi: {},      // key -> [option ids]
  maps: {},       // key -> option id
  seq: {},        // chain id -> 1..5
  toggles: {},    // toggle id -> bool
  drill: {},      // drill id -> label id
  textIn: {},     // key -> free text
  decision: {},   // key -> radio id
  stamps: {},     // artifact -> 'risky' | 'clear'
  quiz: {},       // quiz id -> picked index (plus `${id}:c` -> 1 once checked)
  read: [],       // artifact ids the student opened
  hiddenRevealed: false,
  completedAt: null,
};

// Non-persisted UI state — mirrors the original's useState hooks that sat
// OUTSIDE the persisted LabState (feedback, selection, tabs, modal).
const uiState = {
  feedback: {},   // objective id -> { ok, msg }
  selected: null, // selected artifact id in the evidence locker
  view: 'evidence', // 'evidence' | 'worksheet' (workbench tab)
  mobilePane: 'stage', // 'objectives' | 'stage' (mobile switch, chapter 3)
  modalOpen: false,
  quizIdx: 0,
  lastChapter: 0,
};

function resetUiState() {
  uiState.feedback = {};
  uiState.selected = null;
  uiState.view = 'evidence';
  uiState.mobilePane = 'stage';
  uiState.modalOpen = false;
  uiState.quizIdx = 0;
}

// ── tiny store ──────────────────────────────────────────────────────────────
const store = {
  state: JSON.parse(JSON.stringify(initialState)),
  hydrated: false,
  listeners: [],
};

function subscribe(fn) {
  store.listeners.push(fn);
}

// scope: 'all' | 'header' | 'tracker' | 'evidence' | 'worksheet' | 'quiz' | 'primer' | 'modal'
function notify(scope) {
  store.listeners.forEach(function (fn) { fn(scope); });
}

function deepClone(o) {
  return JSON.parse(JSON.stringify(o));
}

// update(fn, scope): apply a state reducer, persist, then notify listeners.
// The scope tells the renderer which region to re-render (see app.js).
function update(fn, scope) {
  store.state = fn(store.state);
  persist();
  notify(scope || 'stage');
}

function persist() {
  if (!store.hydrated) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store.state));
  } catch (e) {
    /* quota/unavailable — degrade gracefully, exactly like the original */
  }
}

function loadPersisted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p && (p.mode === 'medium' || p.mode === 'hard')) {
        store.state = Object.assign(deepClone(initialState), p);
      }
    }
  } catch (e) {
    /* localStorage unavailable — degrade gracefully */
  }
  store.hydrated = true;
}

// RESET: wipe the key and return to mode selection (confirmed via dialog).
function resetLab() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) { /* ignore */ }
  store.state = deepClone(initialState);
  resetUiState();
  persist(); // original re-writes the pristine object after reset
  notify('all');
}

// Mode selection starts a fresh run with the chosen mode.
function pickMode(mode) {
  store.state = Object.assign(deepClone(initialState), { mode: mode, chapter: 1 });
  resetUiState();
  persist();
  notify('all');
}
