// ============================================================================
// The Grand Exchange — js/state.js
// State store, persistence, progress and star rating.
// Faithful port of src/lib/lab/state.ts + the useReducer/useEffect wiring in
// shell.tsx: same LabState shape, same reducer semantics, SAME localStorage
// key, same save/restore/RESET behavior.
// ============================================================================
"use strict";

/** localStorage key — identical to the original lab (F-32). */
const STORAGE_KEY = "harborline-grand-exchange-v1";

/**
 * Pristine lab state. `hydrated` mirrors the original: it is false until the
 * store has been hydrated from storage on boot, and it gates saving — exactly
 * like the original's `if (state.hydrated) saveState(state)` effect. After a
 * RESET the pristine state (hydrated:false) is therefore NOT re-saved, so a
 * page reload lands on the mode-select screen.
 */
function pristineState() {
  const fw = {};
  for (const port of [21, 22, 23, 25, 80, 443, 3389]) fw[port] = "allow"; // legacy 'open everything' start
  const services = {};
  for (const k of SERVICE_KEYS) services[k] = "legacy";
  return {
    version: 1,
    hydrated: false,
    mode: null,
    objectives: {},
    answers: {},
    quizDone: false,
    quizScore: null,
    quizAnswers: {},
    inspected: [],
    fw,
    services,
    startedAt: Date.now(),
    completedAt: null,
  };
}

/**
 * Reducer — action semantics identical to the original:
 * - SET_MODE starts a fresh spot-check (quiz fields + completion stamp cleared,
 *   startedAt re-stamped); everything else is carried over, as in the original.
 * - CHECK counts attempts until done, latches `done`, sets firstTry on a
 *   first-attempt pass.
 * - HINT increments the objective's hint counter, capped at 3.
 * - RESET returns to pristine.
 */
function reducer(state, action) {
  switch (action.type) {
    case "HYDRATE":
      return Object.assign({}, action.state, { hydrated: true });
    case "SET_MODE":
      return Object.assign({}, state, {
        hydrated: true,
        mode: action.mode,
        startedAt: Date.now(),
        quizDone: false,
        quizScore: null,
        quizAnswers: {},
        completedAt: null,
      });
    case "ANSWER":
      return Object.assign({}, state, {
        answers: Object.assign({}, state.answers, { [action.id]: action.answer }),
      });
    case "CHECK": {
      const prev = state.objectives[action.obj.id] ||
        { done: false, attempts: 0, firstTry: false, hints: 0 };
      const next = Object.assign({}, prev, {
        attempts: prev.done ? prev.attempts : prev.attempts + 1,
        done: prev.done || action.ok,
        firstTry: prev.done ? prev.firstTry : action.ok && prev.attempts === 0,
      });
      return Object.assign({}, state, {
        objectives: Object.assign({}, state.objectives, { [action.obj.id]: next }),
      });
    }
    case "HINT": {
      const prev = state.objectives[action.id] ||
        { done: false, attempts: 0, firstTry: false, hints: 0 };
      const rec = Object.assign({}, prev, { hints: Math.min(prev.hints + 1, 3) });
      return Object.assign({}, state, {
        objectives: Object.assign({}, state.objectives, { [action.id]: rec }),
      });
    }
    case "INSPECT":
      if (state.inspected.includes(action.id)) return state;
      return Object.assign({}, state, { inspected: [...state.inspected, action.id] });
    case "FW":
      return Object.assign({}, state, {
        fw: Object.assign({}, state.fw, { [action.port]: action.state }),
      });
    case "SERVICE":
      return Object.assign({}, state, {
        services: Object.assign({}, state.services, { [action.key]: action.state }),
      });
    case "QUIZ_ANSWER":
      return Object.assign({}, state, {
        quizAnswers: Object.assign({}, state.quizAnswers, { [action.id]: action.choice }),
      });
    case "QUIZ_SUBMIT":
      return Object.assign({}, state, { quizDone: true, quizScore: action.score });
    case "COMPLETE":
      return Object.assign({}, state, { completedAt: Date.now() });
    case "RESET":
      return pristineState();
    default:
      return state;
  }
}

// ---------- storage (try/catch degrade, same as original G5) ----------
function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version !== 1 || !parsed.mode) return null;
    // merge over pristine so new fields always exist
    return Object.assign(pristineState(), parsed);
  } catch {
    return null;
  }
}

function saveState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable — degrade gracefully (G5) */
  }
}

function clearState() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

// ---------- tiny store: getState / dispatch / subscribe ----------
// Mirrors useReducer + the "save on every change" effect in shell.tsx.
function createStore(initialState) {
  let state = initialState;
  const listeners = new Set();
  return {
    getState: () => state,
    dispatch(action) {
      state = reducer(state, action);
      for (const fn of listeners) fn(state, action);
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}

// ---------- progress helpers ----------
function objectivesFor(mode) {
  return OBJECTIVES.filter((o) => o.mode === mode);
}

function progressFor(state, mode) {
  const objs = objectivesFor(mode);
  const done = objs.filter((o) => state.objectives[o.id] && state.objectives[o.id].done).length;
  return {
    done,
    total: objs.length,
    ratio: objs.length ? done / objs.length : 0,
    allDone: done === objs.length && objs.length > 0,
  };
}

// ---------- star rating (C7) — formula identical to the original ----------
function starRating(state, mode) {
  const objs = objectivesFor(mode);
  const recs = objs.map((o) => state.objectives[o.id]).filter(Boolean);
  const firstTryRatio = recs.length ? recs.filter((r) => r.firstTry).length / recs.length : 0;
  const attemptScore = recs.length
    ? recs.reduce((s, r) => s + (r.firstTry ? 1 : r.attempts <= 2 ? 0.6 : 0.4), 0) / recs.length
    : 0;
  const hints = recs.reduce((s, r) => s + r.hints, 0);
  const hintPenalty = Math.min(0.15, hints * 0.03);
  const quiz = state.quizScore ?? 0;
  const objectiveScore = Math.max(0, attemptScore * 0.65 + firstTryRatio * 0.35 - hintPenalty);
  const blended = objectiveScore * 0.6 + quiz * 0.4;
  const stars = blended >= 0.9 ? 5 : blended >= 0.78 ? 4 : blended >= 0.62 ? 3 : blended >= 0.45 ? 2 : 1;
  return { stars, objectiveScore, quizScore: quiz, hintPenalty, firstTryRatio };
}
