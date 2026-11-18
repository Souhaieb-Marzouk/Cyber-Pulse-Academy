// ─── The Registry — js/state.js ───────────────────────────────────────────
// Single plain-JS state object with a tiny subscribe/notify mechanism.
// Same persistence key, same save/restore/RESET semantics as the original
// framework lab (localStorage key "govlab-sy0801-51-v1").

window.LabStore = (function () {
  'use strict';

  var LS_KEY = 'govlab-sy0801-51-v1';
  var state = null;
  var listeners = [];

  function createInitialState(mode) {
    return {
      mode: mode,
      startedAt: new Date().toISOString(),
      tab: 'briefing',
      openDoc: undefined,
      objectives: {},
      matchings: {},
      orders: {
        m12: ['r', 'p', 'g', 's'],                                        // pre-scrambled delegation chain
        h6: ['recover', 'notify', 'recert', 'disable', 'revoke'],         // pre-scrambled offboarding order
        h8: [],
      },
      dockets: {},
      auditChecks: {},
      misfileAnswer: undefined,
      h3: { step: 1 },
      quiz: {},
      quizDone: false,
      completed: false,
    };
  }

  function loadState() {
    try {
      var raw = window.localStorage.getItem(LS_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (
        parsed &&
        (parsed.mode === 'medium' || parsed.mode === 'hard') &&
        parsed.objectives &&
        parsed.dockets
      ) {
        return parsed;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  function persist() {
    if (!state) return;
    try {
      window.localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch (e) {
      /* storage unavailable — degrade gracefully (in-memory session only) */
    }
  }

  function notify() {
    persist();
    for (var i = 0; i < listeners.length; i++) listeners[i](state);
  }

  /**
   * patch(fn) — clone the state shallowly per branch (exactly the shape the
   * original patch() clones), hand the clone to fn for mutation, then
   * publish. Every mutation goes through here.
   */
  function patch(fn) {
    if (!state) return;
    var prev = state;
    var next = {
      mode: prev.mode,
      startedAt: prev.startedAt,
      tab: prev.tab,
      openDoc: prev.openDoc,
      objectives: Object.assign({}, prev.objectives),
      matchings: Object.fromEntries(
        Object.entries(prev.matchings).map(function (kv) { return [kv[0], Object.assign({}, kv[1])]; })
      ),
      orders: Object.fromEntries(
        Object.entries(prev.orders).map(function (kv) { return [kv[0], kv[1].slice()]; })
      ),
      dockets: Object.fromEntries(
        Object.entries(prev.dockets).map(function (kv) { return [kv[0], Object.assign({}, kv[1])]; })
      ),
      auditChecks: Object.assign({}, prev.auditChecks),
      misfileAnswer: prev.misfileAnswer,
      h3: Object.assign({}, prev.h3),
      quiz: Object.assign({}, prev.quiz),
      quizDone: prev.quizDone,
      completed: prev.completed,
    };
    fn(next);
    state = next;
    notify();
  }

  return {
    /** Load persisted progress (if any) and subscribe the first listener. */
    init: function () {
      state = loadState();
      return state;
    },
    getState: function () {
      return state;
    },
    patch: patch,
    /** Start a fresh run in the given mode (same as clicking a mode card). */
    startMode: function (mode) {
      state = createInitialState(mode);
      notify();
    },
    /** Confirmed reset: purge the storage key and return to mode selection. */
    reset: function () {
      try {
        window.localStorage.removeItem(LS_KEY);
      } catch (e) { /* ignore */ }
      state = null;
      notify();
    },
    subscribe: function (fn) {
      listeners.push(fn);
    },
  };
})();
