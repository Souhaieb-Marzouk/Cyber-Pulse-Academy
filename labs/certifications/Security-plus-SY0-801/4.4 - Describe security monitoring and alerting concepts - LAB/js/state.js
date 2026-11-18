// ============================================================================
// CyberLab Architect — Static Port — Lab Store
// ----------------------------------------------------------------------------
// Plain-JS port of src/lib/lab-store.ts (Zustand + persist middleware).
// Provides:
//   - a single state object holding all lab progress
//   - a subscribe/notify mechanism (subscribers fire after every change)
//   - localStorage persistence under the SAME key as the React app:
//         'sec-plus-44-lab-v1'
//   - all the action methods from the original store
//   - selector helpers objectiveComplete() and getProgressCount()
//
// Exposed globally as `window.LabStore`.
// ============================================================================

(function () {
  'use strict';

  // -------------------------------------------------------------------------
  // Constants
  // -------------------------------------------------------------------------
  var STORAGE_KEY = 'sec-plus-44-lab-v1';

  // -------------------------------------------------------------------------
  // Build a fresh, empty state object. Mirrors `fresh()` in lab-store.ts.
  // -------------------------------------------------------------------------
  function freshState() {
    return {
      mode: null,
      objectiveResults: {},
      objectiveAttempts: {},
      hintUsage: {},
      alertStatus: {},
      alertVerdicts: {},
      logFilters: { sources: [], query: '' },
      selectedAlertId: null,
      selectedToolId: null,
      tunedRules: {},
      quizAnswers: {},
      quizSubmitted: false,
      completionDismissed: false,
      startedAt: new Date().toISOString(),
    };
  }

  // -------------------------------------------------------------------------
  // Deep-clone via JSON (state is plain data, no functions inside).
  // -------------------------------------------------------------------------
  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // -------------------------------------------------------------------------
  // The store singleton.
  // -------------------------------------------------------------------------
  var state = freshState();
  var subscribers = [];

  // Persist to localStorage (defensive against quota / disabled storage).
  function persist() {
    try {
      // Zustand persists under `{ state: {...}, version: 1 }` — we mirror that
      // shape so a React-based lab and this static port can share the same
      // localStorage key (best-effort; field-by-field compatibility).
      var payload = { state: clone(state), version: 1 };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      // Storage might be disabled (file:// + privacy mode, or quota). No-op.
    }
  }

  // Re-hydrate from localStorage on load.
  function rehydrate() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var parsed = JSON.parse(raw);
      var saved = parsed && parsed.state ? parsed.state : parsed;
      if (!saved || typeof saved !== 'object') return;
      // Merge saved over a fresh state so any missing keys default cleanly.
      var fresh = freshState();
      Object.keys(fresh).forEach(function (k) {
        if (saved[k] !== undefined && saved[k] !== null) {
          state[k] = saved[k];
        }
      });
    } catch (e) {
      // Corrupt JSON — silently start fresh.
    }
  }

  // Notify all subscribers with a (shallow) snapshot of the new state.
  function notify() {
    var snap = getState();
    subscribers.forEach(function (fn) {
      try { fn(snap); } catch (e) { /* swallow subscriber errors */ }
    });
  }

  // Apply a mutation: patch the state object, persist, and notify.
  function set(patch) {
    if (typeof patch === 'function') patch = patch(state);
    Object.keys(patch).forEach(function (k) { state[k] = patch[k]; });
    persist();
    notify();
  }

  function getState() {
    // Return a shallow snapshot — subscribers/readers cannot mutate the
    // internal state via this object's top-level keys.
    var snap = {};
    Object.keys(state).forEach(function (k) { snap[k] = state[k]; });
    return snap;
  }

  // -------------------------------------------------------------------------
  // Subscribe API. Returns an unsubscribe function.
  // -------------------------------------------------------------------------
  function subscribe(fn) {
    subscribers.push(fn);
    return function () {
      var i = subscribers.indexOf(fn);
      if (i >= 0) subscribers.splice(i, 1);
    };
  }

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------
  function setMode(m) { set({ mode: m }); }

  function setObjectiveResult(id, result) {
    var next = clone(state.objectiveResults);
    next[id] = result;
    set({ objectiveResults: next });
  }

  function recordAttempt(id) {
    var next = clone(state.objectiveAttempts);
    next[id] = (next[id] || 0) + 1;
    set({ objectiveAttempts: next });
  }

  // useHint returns the new usage count (mirrors the original action signature).
  function useHint(id) {
    var next = (state.hintUsage[id] || 0) + 1;
    var nextMap = clone(state.hintUsage);
    nextMap[id] = next;
    set({ hintUsage: nextMap });
    return next;
  }

  function setAlertStatus(id, status) {
    var next = clone(state.alertStatus);
    next[id] = status;
    set({ alertStatus: next });
  }

  function setAlertVerdict(id, v) {
    var next = clone(state.alertVerdicts);
    next[id] = v;
    set({ alertVerdicts: next });
  }

  function toggleLogSource(src) {
    var sources = state.logFilters.sources.slice();
    var i = sources.indexOf(src);
    if (i >= 0) sources.splice(i, 1);
    else sources.push(src);
    set({ logFilters: { sources: sources, query: state.logFilters.query } });
  }

  function setLogQuery(q) {
    set({ logFilters: { sources: state.logFilters.sources.slice(), query: q } });
  }

  function clearLogFilters() {
    set({ logFilters: { sources: [], query: '' } });
  }

  function setSelectedAlert(id) { set({ selectedAlertId: id }); }
  function setSelectedTool(id) { set({ selectedToolId: id }); }

  // setTunedRule: defaults mirror the original store — threshold=1024, window=60, enabled=true.
  function setTunedRule(ruleId, patch) {
    var next = clone(state.tunedRules);
    next[ruleId] = Object.assign(
      { threshold: 1024, window: 60, enabled: true },
      next[ruleId] || {},
      patch || {}
    );
    set({ tunedRules: next });
  }

  function setQuizAnswer(id, idx) {
    var next = clone(state.quizAnswers);
    next[id] = idx;
    set({ quizAnswers: next });
  }

  function submitQuiz() { set({ quizSubmitted: true }); }
  function dismissCompletion() { set({ completionDismissed: true }); }

  function reset() { set(freshState()); }

  // -------------------------------------------------------------------------
  // Selector helpers (mirrors lab-store.ts exports)
  // -------------------------------------------------------------------------
  function objectiveComplete(id) {
    var r = state.objectiveResults[id];
    return r === 'correct' || r === 'completed';
  }

  function getProgressCount(objectives) {
    var n = 0;
    objectives.forEach(function (o) {
      if (objectiveComplete(o.id)) n += 1;
    });
    return n;
  }

  // -------------------------------------------------------------------------
  // Boot: re-hydrate, then expose the API.
  // -------------------------------------------------------------------------
  rehydrate();

  window.LabStore = {
    // State accessors
    getState: getState,
    get state() { return state; }, // direct ref (read-only convention)
    subscribe: subscribe,
    notify: notify,

    // Actions
    setMode: setMode,
    setObjectiveResult: setObjectiveResult,
    recordAttempt: recordAttempt,
    useHint: useHint,
    setAlertStatus: setAlertStatus,
    setAlertVerdict: setAlertVerdict,
    toggleLogSource: toggleLogSource,
    setLogQuery: setLogQuery,
    clearLogFilters: clearLogFilters,
    setSelectedAlert: setSelectedAlert,
    setSelectedTool: setSelectedTool,
    setTunedRule: setTunedRule,
    setQuizAnswer: setQuizAnswer,
    submitQuiz: submitQuiz,
    dismissCompletion: dismissCompletion,
    reset: reset,

    // Selectors
    objectiveComplete: objectiveComplete,
    getProgressCount: getProgressCount,

    // Constants (exposed for any consumer/tests)
    STORAGE_KEY: STORAGE_KEY,
  };
})();
