// ============================================================================
// Meridian Atelier — State + persistence + pub/sub
// Recreates the original React store as a single plain-JS state object
// with a tiny subscribe/notify mechanism. Same localStorage key, same
// save/restore/RESET semantics as the original React lab.
// ============================================================================

(function (global) {
  'use strict';

  const STORAGE_KEY = 'meridian-atelier-state-v1';

  const initialState = {
    mode: null,                   // 'medium' | 'hard' | null
    objectives: {},               // { [id]: { status, attempts, hintsUsed, lastCheckedAt, payload } }
    quiz: { answered: {} },       // { [qid]: { index, correct } }
    startedAt: new Date().toISOString(),
    completedAt: null,
  };

  // --- internal state ---
  let state = loadState();
  const subscribers = new Set();

  function loadState() {
    if (typeof window === 'undefined' || !window.localStorage) return clone(initialState);
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return clone(initialState);
      const parsed = JSON.parse(raw);
      // shallow-merge to be resilient to schema additions
      return Object.assign(clone(initialState), parsed, {
        objectives: Object.assign({}, parsed.objectives || {}),
        quiz: { answered: Object.assign({}, (parsed.quiz || {}).answered || {}) },
      });
    } catch (e) {
      return clone(initialState);
    }
  }

  function saveState() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // graceful: ignore quota / privacy-mode failures
    }
  }

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function notify() {
    saveState();
    for (const fn of subscribers) {
      try { fn(state); } catch (e) { console.error('subscriber threw', e); }
    }
  }

  // --- public API (mirrors the original useLabState hook) ---
  const api = {
    getState() { return state; },

    subscribe(fn) {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    },

    setMode(mode) {
      state = Object.assign({}, state, { mode });
      notify();
    },

    clearMode() {
      // Switch back to the mode-picker without wiping saved progress
      state = Object.assign({}, state, { mode: null });
      notify();
    },

    setObjectiveStatus(id, status, payload) {
      const prev = state.objectives[id] || { status: 'pending', attempts: 0, hintsUsed: 0 };
      const next = Object.assign({}, prev, {
        status: status,
        attempts: prev.attempts + 1,
        lastCheckedAt: new Date().toISOString(),
      });
      if (payload) next.payload = Object.assign({}, prev.payload || {}, payload);
      state = Object.assign({}, state, {
        objectives: Object.assign({}, state.objectives, { [id]: next }),
      });
      notify();
    },

    setObjectivePayload(id, payload) {
      const prev = state.objectives[id] || { status: 'pending', attempts: 0, hintsUsed: 0 };
      state = Object.assign({}, state, {
        objectives: Object.assign({}, state.objectives, {
          [id]: Object.assign({}, prev, { payload: Object.assign({}, prev.payload || {}, payload) }),
        }),
      });
      // payload updates don't notify (no UI re-render needed for transient input state)
      saveState();
    },

    useHint(id) {
      const prev = state.objectives[id] || { status: 'pending', attempts: 0, hintsUsed: 0 };
      if (prev.hintsUsed >= 3) return;
      state = Object.assign({}, state, {
        objectives: Object.assign({}, state.objectives, {
          [id]: Object.assign({}, prev, { hintsUsed: prev.hintsUsed + 1 }),
        }),
      });
      notify();
    },

    answerQuiz(id, index, correct) {
      state = Object.assign({}, state, {
        quiz: { answered: Object.assign({}, state.quiz.answered, { [id]: { index, correct } }) },
      });
      notify();
    },

    markComplete() {
      state = Object.assign({}, state, { completedAt: new Date().toISOString() });
      notify();
    },

    reset() {
      if (typeof window !== 'undefined' && window.localStorage) {
        try { window.localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
      }
      state = Object.assign(clone(initialState), { startedAt: new Date().toISOString() });
      notify();
    },

    // Derived helpers
    objectivesForMode(mode) {
      return global.AtelierObjectives.OBJECTIVES.filter((o) => o.mode === mode);
    },

    getProgress(mode) {
      const objs = global.AtelierObjectives.OBJECTIVES.filter((o) => o.mode === mode);
      const total = objs.length;
      const correct = objs.filter((o) => state.objectives[o.id]?.status === 'correct').length;
      return { total, correct, pct: total ? Math.round((correct / total) * 100) : 0 };
    },
  };

  global.AtelierState = api;
})(window);
