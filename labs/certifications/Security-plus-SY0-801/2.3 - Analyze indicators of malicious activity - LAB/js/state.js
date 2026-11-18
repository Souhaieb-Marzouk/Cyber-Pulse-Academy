/* ============================================================================
 * Indicator Bay 02 - state store (js/state.js)
 * ----------------------------------------------------------------------------
 * Recreates the original React store (src/lib/lab/engine.ts, useLabState) as a
 * plain-JS object with a tiny subscribe/notify mechanism. The persistence
 * contract is identical to the original:
 *   - same localStorage key  (mfh-indicator-bay-v1)
 *   - same state version     (1, mismatch -> pristine)
 *   - save on every state change after load
 *   - RESET removes the key and returns the lab to a pristine shift
 * ========================================================================== */

'use strict';

window.LAB_STATE = (function () {
  var STORAGE_KEY = 'mfh-indicator-bay-v1';
  var STATE_VERSION = 1;

  /** Pristine shift state - same shape and defaults as the original. */
  function pristineState() {
    return {
      version: STATE_VERSION,
      mode: null, // 'medium' | 'hard' | null
      acceptedBriefing: false,
      stamps: {}, // evidenceId -> { family?, type?, disposition? }
      benignRationale: {}, // evidenceId -> rationale string
      beacon: {}, // scenarioId -> IoC category
      match: {}, // 'panelId:leftId' -> chosen option
      iocPick: {}, // evidenceId -> IoC name
      sequence: [], // ordered RESPONSE_STEPS ids
      results: {}, // objectiveId -> { attempts, passed, firstTry }
      hints: {}, // objectiveId -> tier count 0..3
      nudgeUsed: {}, // objectiveId -> true (also set by medium hints)
      quiz: {}, // questionId -> chosen option index
      quizDone: false,
      activeObjective: null,
      completedAt: null,
    };
  }

  var state = pristineState();
  var listeners = [];

  function loadState() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return pristineState();
      var parsed = JSON.parse(raw);
      if (parsed.version !== STATE_VERSION) return pristineState();
      // merge over pristine so future fields keep sane defaults (same as original)
      return Object.assign(pristineState(), parsed);
    } catch (e) {
      return pristineState();
    }
  }

  /** Immutable-style update: fn(prevState) -> nextState, then notify + persist. */
  function update(fn) {
    var prev = state;
    var next = fn(prev);
    if (!next || next === prev) return;
    state = next;
    persist();
    for (var i = 0; i < listeners.length; i++) listeners[i](state, prev);
  }

  function persist() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* storage full or unavailable - degrade gracefully (same as original) */
    }
  }

  /** Confirmed reset (the caller shows the confirmation dialog first). */
  function reset() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      /* ignore */
    }
    state = pristineState();
    for (var i = 0; i < listeners.length; i++) listeners[i](state, null);
  }

  function subscribe(fn) {
    listeners.push(fn);
    return function unsubscribe() {
      var i = listeners.indexOf(fn);
      if (i >= 0) listeners.splice(i, 1);
    };
  }

  function getState() {
    return state;
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    STATE_VERSION: STATE_VERSION,
    pristineState: pristineState,
    loadState: loadState,
    update: update,
    reset: reset,
    subscribe: subscribe,
    getState: getState,
  };
})();
