// ─── RELEASE TRACK · state + persistence (static port of page.tsx store) ──────
// Same persistence key, same shape, same save/restore/RESET semantics as the
// framework lab: localStorage['cyberlab.release-track.v2'], version-gated
// restore, per-mode progress kept side by side, graceful no-storage fallback.
(function () {
  'use strict';

  const LAB = (window.LAB = window.LAB || {});

  LAB.STORAGE_KEY = 'cyberlab.release-track.v2';

  LAB.modeEmptyProgress = function () {
    return { objectives: {}, quiz: {}, quizDone: false };
  };

  LAB.objectiveInitState = function () {
    return { answer: null, result: null, attempts: 0, hintsUsed: 0, firstTry: false };
  };

  LAB.freshState = function () {
    return {
      version: 2,
      mode: null,
      medium: LAB.modeEmptyProgress(),
      hard: LAB.modeEmptyProgress(),
      stationId: null,
      tab: 'room',
      completionSeen: false,
    };
  };

  LAB.state = LAB.freshState();

  // ── tiny pub/sub: listeners refresh the HUD / board chrome ──────────────────
  LAB.listeners = new Set();
  LAB.subscribe = function (fn) {
    LAB.listeners.add(fn);
    return function () {
      LAB.listeners.delete(fn);
    };
  };
  LAB.notify = function () {
    LAB.listeners.forEach(function (fn) {
      fn();
    });
  };

  /** Mutate the state, persist it, and refresh chrome. Content regions manage
   *  their own DOM; they never re-render from this path (focus safety). */
  LAB.update = function (mutator) {
    mutator(LAB.state);
    LAB.persist();
    LAB.notify();
  };

  LAB.persist = function () {
    try {
      window.localStorage.setItem(
        LAB.STORAGE_KEY,
        JSON.stringify(Object.assign({}, LAB.state, { savedAt: Date.now() }))
      );
    } catch (e) {
      // storage full/blocked — the in-memory session keeps working
    }
  };

  /** Restore a saved session. Returns true when state was restored. */
  LAB.restore = function () {
    try {
      const raw = window.localStorage.getItem(LAB.STORAGE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === 2) {
        LAB.state = parsed;
        return true;
      }
    } catch (e) {
      // localStorage unavailable — degrade gracefully to in-memory only
    }
    return false;
  };

  /** RESET — wipe storage and return to the pristine state (mode selection). */
  LAB.resetAll = function () {
    try {
      window.localStorage.removeItem(LAB.STORAGE_KEY);
    } catch (e) {
      // ignore
    }
    LAB.state = LAB.freshState();
    LAB.notify();
  };
})();
