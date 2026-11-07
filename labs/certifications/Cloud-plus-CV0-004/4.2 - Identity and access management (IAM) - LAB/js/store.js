// ============================================================================
// State store: single plain-JS object + tiny subscribe/notify + persistence.
// Port of src/lib/lab/store.ts (zustand persist) with IDENTICAL semantics:
//   - same localStorage key ("sf-iam-lab-v1") and JSON shape
//     ({ state: { mode, stage, objectiveState, quizAnswers, quizSubmitted,
//        env, lastCheck }, version: 0 }) — a save made by the original lab
//     resumes here and vice-versa.
//   - same initialEnv(), same actions, same reset-to-pristine behavior.
// ============================================================================
'use strict';

window.LabStore = (function () {
  const D = window.LAB_DATA;

  const STORAGE_KEY = 'sf-iam-lab-v1';
  const STORAGE_VERSION = 0;

  function initialEnv() {
    const policies = {};
    const attachments = {};
    for (const p of D.POLICIES) {
      policies[p.id] = p.json;
      attachments[p.id] = p.attachedTo.slice();
    }
    const identities = {};
    for (const i of ['alex.kim', 'priya.nair', 'dana.wells', 'carlos.mendes', 'minnie.alvarez', 'svc-reporting', 'svc-nightly-ci', 'svc-test']) identities[i] = 'active';
    const keys = {};
    for (const k of D.KEY_SEEDS) keys[k.id] = k.initial;
    return {
      policies,
      attachments,
      identities,
      keys,
      ca: { mfaAdmins: false, mfaFinance: false, mfaAll: false, blockLegacy: false, restrictCidr: false },
      flagged: [],
      review: {},
      aaaOrder: [],
      aaaRecordQ: '',
      factorAssign: {},
      authzMatch: {},
      samlOrder: [],
      protocolMatch: {},
      h1Identity: '',
      h1Event: '',
      h1Vector: '',
      h2Order: [],
      h2Mitre: { theft: '', use: '', escalation: '' },
      h4: { q1: '', q2: '', q3: '' },
      h5Justify: '',
      h8: { q1: '', q2: '', q3: '' },
      h9: '',
      simRuns: [],
      loginRuns: [],
      actionLog: [],
    };
  }

  function initialState() {
    return {
      mode: null,
      stage: 'mode',
      objectiveState: {},
      quizAnswers: {},
      quizSubmitted: false,
      env: initialEnv(),
      lastCheck: {},
    };
  }

  const PERSISTED_KEYS = ['mode', 'stage', 'objectiveState', 'quizAnswers', 'quizSubmitted', 'env', 'lastCheck'];

  let state = initialState();
  const listeners = new Set();

  function shallowMergeEnv(prev, patch) {
    // Same merge semantics as patchEnv in the original (shallow spread per key).
    return Object.assign({}, prev, patch);
  }

  function save() {
    try {
      const partial = {};
      for (const k of PERSISTED_KEYS) partial[k] = state[k];
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: partial, version: STORAGE_VERSION }));
    } catch (e) {
      /* storage unavailable (private mode / file://) — lab still runs in-memory */
    }
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      const s = parsed && (parsed.state || parsed); // zustand-persist shape or plain
      if (!s) return false;
      const next = initialState();
      for (const k of PERSISTED_KEYS) {
        if (s[k] !== undefined) next[k] = s[k];
      }
      // Guard against partial env saves: fill any missing env key from defaults.
      const def = initialEnv();
      for (const k of Object.keys(def)) {
        if (next.env[k] === undefined) next.env[k] = def[k];
      }
      state = next;
      return true;
    } catch (e) {
      return false;
    }
  }

  function notify() {
    save();
    listeners.forEach((l) => {
      try { l(); } catch (e) { console.error('listener error', e); }
    });
  }

  // --- actions (same names & semantics as the original store) -----------------
  const actions = {
    setMode(m) {
      state.mode = m;
      state.stage = 'brief';
      notify();
    },
    setStage(s) {
      state.stage = s;
      notify();
    },
    patchEnv(p) {
      state.env = shallowMergeEnv(state.env, p);
      notify();
    },
    patchEnvSilent(p) {
      // Used by the policy JSON editor: persists every keystroke without a
      // full re-render so the textarea never loses caret/focus mid-typing.
      // Derived UI (the "valid JSON" badge) is updated by the caller.
      state.env = shallowMergeEnv(state.env, p);
      save();
    },
    checkObjective(id) {
      const res = window.LAB_ENGINE.validateObjective(id, state.env);
      const prev = state.objectiveState[id] || { done: false, attempts: 0, hintsUsed: 0, firstTry: false };
      const attempts = prev.attempts + 1;
      const updated = {
        done: prev.done || res.pass,
        attempts,
        hintsUsed: prev.hintsUsed,
        firstTry: prev.done ? prev.firstTry : (attempts === 1 && res.pass),
      };
      state.objectiveState = Object.assign({}, state.objectiveState, { [id]: updated });
      state.lastCheck = Object.assign({}, state.lastCheck, { [id]: res });
      notify();
    },
    revealHint(id) {
      const prev = state.objectiveState[id] || { done: false, attempts: 0, hintsUsed: 0, firstTry: false };
      state.objectiveState = Object.assign({}, state.objectiveState, {
        [id]: Object.assign({}, prev, { hintsUsed: Math.min(prev.hintsUsed + 1, 3) }),
      });
      notify();
    },
    setQuizAnswer(id, idx) {
      state.quizAnswers = Object.assign({}, state.quizAnswers, { [id]: idx });
      notify();
    },
    submitQuiz() {
      state.quizSubmitted = true;
      notify();
    },
    resetAll() {
      state = initialState();
      notify();
    },
  };

  return {
    getState: () => state,
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    actions,
    hydrate() {
      const restored = load();
      save();
      return restored;
    },
    STORAGE_KEY,
  };
})();
