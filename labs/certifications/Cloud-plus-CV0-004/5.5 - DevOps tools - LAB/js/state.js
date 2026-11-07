// ─────────────────────────────────────────────────────────────────────────────
// js/state.js — state store + persistence for the DevOps Tools lab (static port).
//
// Recreates the original React reducer (src/lib/lab/store.tsx) as a plain-JS
// store with subscribe/notify. SAME localStorage key, SAME state shape, SAME
// action semantics (incl. SET_MODE wiping the run, quiz R2 lock, hint cap 3,
// station switch clearing the active file, RESET returning to pristine).
// ─────────────────────────────────────────────────────────────────────────────

window.Lab = window.Lab || {};
(function (Lab) {
  'use strict';

  // Same persistence key as the original framework lab (SC-D4).
  const LS_KEY = 'cv0-004-l5-5-devops-tools-lab-v1';

  function initialState() {
    return {
      version: 1,
      mode: null, // 'medium' | 'hard' | null → null shows the mode-select screen
      env: {}, // interactive workbench state, keyed by widget key
      objectives: {}, // id → { completed, attempts, firstTry, hintsUsed }
      quiz: {}, // qid → { chosen, correct, revealed }
      ui: { station: 'plan', file: null, completedSeen: false },
    };
  }

  let state = initialState();
  const listeners = new Set();

  // Storage availability probe — same approach as the original (probe + cleanup).
  const storageOk = (function probeStorage() {
    try {
      const k = '__lab_probe__';
      window.localStorage.setItem(k, '1');
      window.localStorage.removeItem(k);
      return true;
    } catch {
      return false;
    }
  })();

  function loadState() {
    try {
      const raw = window.localStorage.getItem(LS_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === 1) {
        const base = initialState();
        return Object.assign({}, base, parsed, { ui: Object.assign({}, base.ui, parsed.ui) });
      }
      return null;
    } catch {
      return null;
    }
  }

  function saveState(s) {
    try {
      window.localStorage.setItem(LS_KEY, JSON.stringify(s));
      return true;
    } catch {
      return false;
    }
  }

  // ── reducer: 1:1 port of the original switch statement ────────────────────
  function reducer(prev, action) {
    switch (action.type) {
      case 'HYDRATE':
        return action.state;

      case 'SET_MODE':
        // Starting a shift always begins from a pristine run (same as original).
        return Object.assign({}, initialState(), { version: prev.version, mode: action.mode });

      case 'SET_ENV':
        return Object.assign({}, prev, { env: Object.assign({}, prev.env, { [action.key]: action.value }) });

      case 'ENV_MERGE': {
        const cur = prev.env[action.key];
        const base = cur && typeof cur === 'object' && !Array.isArray(cur) ? cur : {};
        return Object.assign({}, prev, { env: Object.assign({}, prev.env, { [action.key]: Object.assign({}, base, action.partial) }) });
      }

      case 'ENV_TOGGLE_ITEM': {
        const cur = Array.isArray(prev.env[action.key]) ? prev.env[action.key] : [];
        const next = cur.includes(action.id) ? cur.filter((x) => x !== action.id) : cur.concat(action.id);
        return Object.assign({}, prev, { env: Object.assign({}, prev.env, { [action.key]: next }) });
      }

      case 'ENV_ORDER_PUSH': {
        const cur = Array.isArray(prev.env[action.key]) ? prev.env[action.key] : [];
        if (cur.includes(action.id)) return prev;
        return Object.assign({}, prev, { env: Object.assign({}, prev.env, { [action.key]: cur.concat(action.id) }) });
      }

      case 'ENV_ORDER_REMOVE': {
        const cur = Array.isArray(prev.env[action.key]) ? prev.env[action.key] : [];
        return Object.assign({}, prev, { env: Object.assign({}, prev.env, { [action.key]: cur.filter((x) => x !== action.id) }) });
      }

      case 'ENV_ORDER_CLEAR':
        return Object.assign({}, prev, { env: Object.assign({}, prev.env, { [action.key]: [] }) });

      case 'ENV_TOGGLE_FLAG': {
        const cur = prev.env[action.key] && typeof prev.env[action.key] === 'object' ? prev.env[action.key] : {};
        return Object.assign({}, prev, {
          env: Object.assign({}, prev.env, { [action.key]: Object.assign({}, cur, { [action.id]: !cur[action.id] }) }),
        });
      }

      case 'RECORD_CHECK': {
        const p = prev.objectives[action.id] || { completed: false, attempts: 0, firstTry: false, hintsUsed: 0 };
        const next = {
          completed: p.completed || action.pass,
          attempts: p.attempts + 1,
          firstTry: p.completed ? p.firstTry : Boolean(action.pass && p.attempts === 0),
          hintsUsed: p.hintsUsed,
        };
        return Object.assign({}, prev, { objectives: Object.assign({}, prev.objectives, { [action.id]: next }) });
      }

      case 'USE_HINT': {
        const p = prev.objectives[action.id] || { completed: false, attempts: 0, firstTry: false, hintsUsed: 0 };
        if (p.hintsUsed >= 3) return prev;
        return Object.assign({}, prev, {
          objectives: Object.assign({}, prev.objectives, { [action.id]: Object.assign({}, p, { hintsUsed: p.hintsUsed + 1 }) }),
        });
      }

      case 'CHOOSE_QUIZ': {
        // Pre-selection: stored WITHOUT revealing/locking; validation happens
        // only when the student presses "Check answer" (R2 two-phase flow).
        const cur = prev.quiz[action.qid];
        if (cur && cur.revealed) return prev; // locked — cannot change (R2)
        const rec = { chosen: action.chosen, correct: false, revealed: false };
        return Object.assign({}, prev, { quiz: Object.assign({}, prev.quiz, { [action.qid]: rec }) });
      }

      case 'ANSWER_QUIZ': {
        // R2 lock: once validated, the record is final — no further changes.
        const rec = { chosen: action.chosen, correct: action.correct, revealed: true };
        return Object.assign({}, prev, { quiz: Object.assign({}, prev.quiz, { [action.qid]: rec }) });
      }

      case 'SET_STATION':
        return Object.assign({}, prev, { ui: Object.assign({}, prev.ui, { station: action.station, file: null }) });

      case 'SET_FILE':
        return Object.assign({}, prev, { ui: Object.assign({}, prev.ui, { file: action.file }) });

      case 'SEEN_COMPLETION':
        return Object.assign({}, prev, { ui: Object.assign({}, prev.ui, { completedSeen: action.seen }) });

      case 'RESET':
        return initialState();

      default:
        return prev;
    }
  }

  function dispatch(action) {
    const prev = state;
    state = reducer(prev, action);
    saveState(state); // original saves on every state change, incl. RESET
    listeners.forEach((fn) => fn(state, prev, action));
  }

  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  function getEnv(key, fallback) {
    const v = state.env[key];
    return v === undefined ? fallback : v;
  }

  // Boot: hydrate from localStorage if present (same merge rules), then save —
  // the original writes state to storage on mount, even on a first visit.
  const saved = storageOk ? loadState() : null;
  if (saved) state = saved;
  if (storageOk) saveState(state);

  Lab.store = { LS_KEY, dispatch, subscribe, getState: () => state, getEnv, storageOk, initialState };
})(window.Lab);
