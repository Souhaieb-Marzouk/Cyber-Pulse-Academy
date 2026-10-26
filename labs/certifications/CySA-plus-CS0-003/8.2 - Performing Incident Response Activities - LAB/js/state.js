// ─── CyberLab · js/state.js ───────────────────────────────────────────────
// Lab state factory, localStorage persistence, and a tiny subscribe/notify
// store — a faithful port of the original React store (src/lib/lab/engine.ts
// + the useState/useEffect wiring in src/components/lab/ir/ir-lab.tsx).
//
// Parity contract with the original:
//   · SAME storage key          → 'cyberlab-cysa-82-ir-v1'
//   · SAME state version        → 1 (incompatible saves are discarded)
//   · SAME restore semantics    → saved JSON shallow-merged over defaults
//   · SAME save semantics       → persisted on every change once a mode is
//                                 chosen (the mode-select screen stores nothing)
//   · SAME reset semantics      → clear key + pristine default state
//   · graceful degradation      → storage errors never break the lab

window.LAB = window.LAB || {};
(function (LAB) {
  'use strict';

  var STORAGE_KEY = LAB.STORAGE_KEY;
  var STATE_VERSION = LAB.STATE_VERSION;

  // ── state factory (identical shape to LabState in types.ts) ──────────────
  function defaultState() {
    return {
      v: STATE_VERSION,
      mode: null,
      station: 'identify',
      maxStation: 'identify',
      // warm-up
      phaseOrder: [],
      // identify
      evidenceFlagged: [],
      triage: {},
      declared: false,
      severity: null,
      // analyze
      chainOrder: [],
      earliest: null,
      earliestSource: null,
      // contain
      firstAction: null,
      controls: {},
      dcDecision: null,
      // eradicate
      eradicationSelected: [],
      eradicationOrder: [],
      // recover
      recoveryStrategy: null,
      recoveryChecks: [],
      monitorEnhanced: false,
      backupReconcile: null,
      // learn
      rootCause: null,
      findingsClass: {},
      corrective: [],
      mttd: '',
      mttc: '',
      mttr: '',
      maturityMetric: null,
      exercise: null,
      planUpdates: [],
      notifMap: {},
      // quiz + tracking
      quizAnswers: {},
      quizSubmitted: false,
      quizScore: null,
      objectives: {},
      completed: false,
      completedAt: null,
    };
  }

  // ── tiny store with subscribe/notify ─────────────────────────────────────
  var current = defaultState();
  var listeners = [];

  function getState() {
    return current;
  }

  function subscribe(fn) {
    listeners.push(fn);
  }

  /** Patch or functional updater — functional form kept for parity with the
   *  original StatePatch contract. Returns the merged next state. */
  function setState(patch) {
    var part = typeof patch === 'function' ? patch(current) : patch;
    if (!part) return current;
    var prev = current;
    current = Object.assign({}, prev, part);
    if (current.mode) saveState(current); // same rule as the original effect
    for (var i = 0; i < listeners.length; i++) listeners[i](current, prev);
    return current;
  }

  // ── persistence (identical behavior, incl. graceful degradation) ─────────
  function loadState() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (parsed && parsed.v === STATE_VERSION && parsed.mode) {
        return Object.assign(defaultState(), parsed);
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  function saveState(s) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch (e) {
      /* storage unavailable — the lab keeps working in memory */
    }
  }

  function clearState() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      /* ignore */
    }
  }

  LAB.defaultState = defaultState;
  LAB.getState = getState;
  LAB.setState = setState;
  LAB.subscribe = subscribe;
  LAB.loadState = loadState;
  LAB.saveState = saveState;
  LAB.clearState = clearState;
})(window.LAB);
