// ─── SKYSCAN state: store, persistence, environment derivation ───────────────
// 1:1 port of the original framework lab's src/lib/lab/engine.ts (state,
// persistence and deriveEnv parts). Same storage key, same save/restore/reset
// semantics, same derived values as the original.

(function (SKY) {
  'use strict';

  // ── initial state ──

  SKY.initialState = function () {
    var objectives = {};
    SKY.MEDIUM_OBJECTIVES.concat(SKY.HARD_OBJECTIVES).forEach(function (o) {
      objectives[o.id] = { done: false, wrong: 0, hints: 0 };
    });
    return {
      v: 1,
      mode: null,
      scanInitial: false,
      scanRescan: false,
      applied: {},
      flags: [],
      drills: {},
      objectives: objectives,
      quizAnswers: {},
      quizChecked: {},
      completed: false,
      startedAt: Date.now(),
    };
  };

  // ── persistence (graceful on failure — identical semantics to the original) ──

  SKY.loadState = function () {
    try {
      var raw = localStorage.getItem(SKY.STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (parsed && parsed.v === 1 && (parsed.mode === 'medium' || parsed.mode === 'hard')) {
        var fresh = SKY.initialState();
        var merged = Object.assign({}, fresh, parsed);
        merged.objectives = Object.assign({}, fresh.objectives, parsed.objectives);
        return merged;
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  SKY.saveState = function (state) {
    try {
      localStorage.setItem(SKY.STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // storage unavailable — degrade gracefully, lab still works in-session
    }
  };

  SKY.clearState = function () {
    try {
      localStorage.removeItem(SKY.STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  };

  // ── external store (plain pub/sub — mirrors labStore in engine.ts) ──

  var listeners = new Set();
  var storeState = SKY.initialState();

  function emit() {
    listeners.forEach(function (l) { l(); });
  }

  SKY.store = {
    getState: function () { return storeState; },
    subscribe: function (l) {
      listeners.add(l);
      return function () { listeners.delete(l); };
    },
    update: function (fn) {
      storeState = fn(storeState);
      SKY.saveState(storeState);
      emit();
    },
    hydrate: function () {
      var saved = SKY.loadState();
      if (saved) {
        storeState = saved;
        emit();
      }
    },
    reset: function () {
      SKY.clearState();
      storeState = SKY.initialState();
      emit();
    },
  };

  // ── environment derivation ──

  SKY.findingCleared = function (f, applied, mode) {
    var seq = applied[f.id] || [];
    if (seq.length === 0) return false;
    if (mode === 'medium') return seq.indexOf(f.mediumCorrect) !== -1;
    if (f.hardMode === 'sequence') {
      var req = f.hardRequired;
      return req.every(function (a, i) { return seq[i] === a; });
    }
    if (f.hardMode === 'all') return f.hardRequired.every(function (a) { return seq.indexOf(a) !== -1; });
    return f.hardRequired.some(function (a) { return seq.indexOf(a) !== -1; });
  };

  SKY.deriveEnv = function (state) {
    var mode = state.mode || 'medium';
    var statusOf = function (f) {
      var seq = state.applied[f.id] || [];
      if (seq.length === 0) return 'open';
      if (!SKY.findingCleared(f, state.applied, mode)) return 'open';
      if (f.responsibility === 'provider') return 'tracked';
      if (f.falsePositive) return 'invalid';
      if (f.severity === 'low' || f.severity === 'informational') return 'reviewed';
      return state.scanRescan ? 'verified' : 'applied';
    };
    var cleared = SKY.FINDINGS.filter(function (f) { return statusOf(f) !== 'open'; });
    var clearedCount = cleared.length;
    var openCount = SKY.FINDINGS.length - clearedCount;
    var openPenalty = SKY.FINDINGS
      .filter(function (f) { return statusOf(f) === 'open'; })
      .reduce(function (s, f) { return s + SKY.SEVERITY_WEIGHT[f.severity]; }, 0);
    var posture = Math.max(0, Math.min(100, Math.round(100 - 0.6 * openPenalty)));
    var modeObjs = state.mode === 'hard' ? SKY.HARD_OBJECTIVES : SKY.MEDIUM_OBJECTIVES;
    var doneCount = modeObjs.filter(function (o) { return state.objectives[o.id] && state.objectives[o.id].done; }).length;
    return { statusOf: statusOf, posture: posture, clearedCount: clearedCount, openCount: openCount, doneCount: doneCount, totalObjectives: modeObjs.length };
  };

  SKY.initialPosture = function () {
    var penalty = SKY.FINDINGS.reduce(function (s, f) { return s + SKY.SEVERITY_WEIGHT[f.severity]; }, 0);
    return Math.max(0, Math.min(100, Math.round(100 - 0.6 * penalty)));
  };

  // ── drill answer helpers ──

  SKY.norm = function (s) {
    return String(s == null ? '' : s)
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, ' ')
      .trim();
  };

  SKY.normId = function (s) {
    return String(s == null ? '' : s)
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '');
  };

  SKY.getDrill = function (state, objId) {
    return state.drills[objId] || {};
  };
})(window.SKY);
