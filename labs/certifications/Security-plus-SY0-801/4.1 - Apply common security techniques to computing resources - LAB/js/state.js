// Northwind Hardening Yard - state store + persistence (static port).
// Mirrors src/lib/lab/engine.ts persistence semantics EXACTLY:
// same localStorage key, same pristine shape, same save/load/reset behavior.
'use strict';

(function () {
  var STORAGE_KEY = 'northwind-hardening-yard-v1';

  // ---- pristine state (matches pristineState() in engine.ts) ----
  function initialEnv() {
    var env = {};
    window.LAB_DATA.ASSETS.forEach(function (a) {
      env[a.id] = Object.assign({}, a.initial);
    });
    return env;
  }

  function pristineState() {
    return {
      mode: null,
      env: initialEnv(),
      answers: {},
      checks: {},
      hints: {},
      quizAnswers: {},
      quizSubmitted: false,
      view: 'briefing',
      openObjective: null,
      completionSeen: false,
      savedAt: null,
    };
  }

  // ---- tiny pub/sub store ----
  var listeners = [];
  var state = pristineState();

  window.LabStore = {
    get: function () {
      return state;
    },
    set: function (next) {
      state = next;
      listeners.forEach(function (fn) {
        fn(state);
      });
    },
    update: function (fn) {
      this.set(fn(state));
    },
    subscribe: function (fn) {
      listeners.push(fn);
    },
  };

  // ---- persistence (saveState / loadState / clearState) ----
  window.saveState = function (s) {
    try {
      var copy = Object.assign({}, s, { savedAt: Date.now() });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(copy));
    } catch (e) {
      /* storage unavailable - degrade gracefully */
    }
  };

  window.loadState = function () {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      var base = pristineState();
      var st = Object.assign({}, base, parsed, {
        env: parsed.env || base.env,
        answers: parsed.answers || {},
        checks: parsed.checks || {},
        hints: parsed.hints || {},
        quizAnswers: parsed.quizAnswers || {},
        // dialogs are ephemeral UI state in the original - never restored
        completionOpen: false,
        resetOpen: false,
      });
      // integrity: env must contain every asset/control
      var fresh = initialEnv();
      Object.keys(fresh).forEach(function (assetId) {
        st.env[assetId] = Object.assign({}, fresh[assetId], st.env[assetId] || {});
      });
      return st;
    } catch (e) {
      return null;
    }
  };

  window.clearState = function () {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      /* ignore */
    }
  };

  window.pristineState = pristineState;
})();
