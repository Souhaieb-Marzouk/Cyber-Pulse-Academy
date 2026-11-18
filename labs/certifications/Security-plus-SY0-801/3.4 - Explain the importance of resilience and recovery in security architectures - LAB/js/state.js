/* =========================================================================
 * Continuity Bay — State Management & Persistence
 * Single plain-JS state object with subscribe/notify.
 * Same persistence keys and save/restore/RESET semantics as the original.
 * ========================================================================= */

(function () {
  'use strict';

  const D = window.LAB_DATA;

  /* --- Pristine environment state --- */
  function pristineEnv() {
    return {
      // Backup Vault
      backupFullFreq: 'weekly',
      backupIncrFreq: 'daily',
      backupDiffFreq: 'daily',
      backupSnapshotFreq: 'none',
      immutability: false,
      replication: false,
      offsite: false,
      // Redundancy Rack
      dualPsu: false, ups: false, generator: false, redundantCircuits: false,
      nicTeaming: false, portAggregation: false, loadBalancer: false,
      clustering: false, redundantIsp: false,
      platformDiversity: false, multiCloud: false,
      // Picks
      recoverySitePicks: {},
      continuityPicks: {},
      testPicks: {},
      capacityPicks: {},
      // Orderings & matches
      backupOrder: [],
      metricMatches: {},
      scopeOrder: [],
      incidentCascade: [],
      hardBackupRestoreSeq: [],
      hardSiteJustifications: {},
      hardTestPicks: {},
      hardArtifactPicks: {},
      hardCapacityPicks: {},
      domainMatches: {},
      // Simulation
      simulationRun: false,
      simulationOutcome: 'pending',
    };
  }

  /* --- Pristine full state --- */
  function pristineState() {
    return {
      mode: null,
      objectives: {},
      quizAnswered: {},
      quizSubmitted: {},
      env: pristineEnv(),
      hintsRevealed: {},
      startedAt: 0,
    };
  }

  /* --- Load from localStorage --- */
  function loadState() {
    try {
      const raw = localStorage.getItem(D.STORAGE_KEY);
      if (!raw) return pristineState();
      const parsed = JSON.parse(raw);
      return {
        ...pristineState(),
        ...parsed,
        env: { ...pristineEnv(), ...(parsed.env || {}) },
        objectives: parsed.objectives || {},
        quizAnswered: parsed.quizAnswered || {},
        quizSubmitted: parsed.quizSubmitted || {},
        hintsRevealed: parsed.hintsRevealed || {},
      };
    } catch (e) {
      return pristineState();
    }
  }

  /* --- Save to localStorage --- */
  function saveState(state) {
    try {
      localStorage.setItem(D.STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // graceful: ignore quota errors
    }
  }

  /* --- State store with pub/sub --- */
  const Store = {
    _state: pristineState(),
    _listeners: [],

    init() {
      this._state = loadState();
    },

    get() {
      return this._state;
    },

    set(updater) {
      if (typeof updater === 'function') {
        this._state = updater(this._state);
      } else {
        this._state = { ...this._state, ...updater };
      }
      saveState(this._state);
      this._notify();
    },

    /* Update a slice of env state */
    updateEnv(patch) {
      this.set(s => ({ ...s, env: { ...s.env, ...patch } }));
    },

    /* Subscribe to state changes */
    subscribe(fn) {
      this._listeners.push(fn);
      return () => {
        this._listeners = this._listeners.filter(f => f !== fn);
      };
    },

    _notify() {
      this._listeners.forEach(fn => fn(this._state));
    },

    /* Reset to pristine */
    reset() {
      this._state = pristineState();
      try { localStorage.removeItem(D.STORAGE_KEY); } catch (e) {}
      this._notify();
    },
  };

  window.LAB_STORE = Store;
})();
