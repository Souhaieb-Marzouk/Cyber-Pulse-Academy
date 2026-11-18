/* =====================================================================
 * state.js — single state object + persistence + pub/sub
 * Same persistence key and same save/restore/RESET semantics as the
 * original framework lab (v2 quiz model: per-question lock/step/finished).
 * ===================================================================== */

(function () {
  const D = window.LAB_DATA;
  const STORAGE_KEY = "secplus-4-6-automation-lab";

  const initial = {
    mode: null,
    env: D.defaultEnv(),
    objectiveStates: {},
    quizAnswers: {},
    quizLocked: {},
    quizStep: 0,
    quizFinished: false,
    completionSeen: false,
    glossaryOpen: false,
    activeTab: "playbook",
    selectedTerm: null, // local UI state for M1 matching board
    briefingOpen: true,
    knowledgeOpen: true,
    resetDialogOpen: false,
  };

  function defaultObjectiveState() {
    return { completed:false, attempts:0, hintsUsed:0, hintsRevealed:0, lastMessage:"", lastNearMiss:false, firstAttemptPassed:false };
  }

  let state = load() || clone(initial);
  const listeners = new Set();

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== 2) return null; // discard incompatible blobs
      const s = parsed.state;
      // merge with defaults so new fields always exist
      return Object.assign(clone(initial), s, {
        env: Object.assign(D.defaultEnv(), s.env || {}),
        env2: undefined,
      });
    } catch (e) {
      console.warn("state load failed, starting fresh:", e);
      return null;
    }
  }

  function persist() {
    try {
      const blob = { state: stripTransient(state), version: 2 };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(blob));
    } catch (e) {
      // localStorage unavailable/full — degrade gracefully, keep working in-memory
      console.warn("state persist failed (continuing in-memory):", e);
    }
  }

  // transient UI flags (dialogs/drawers) are NOT persisted except where the
  // original persisted them (mode, env, objectives, quiz, completionSeen,
  // glossaryOpen). Match original behavior exactly.
  function stripTransient(s) {
    const out = {
      mode: s.mode,
      env: s.env,
      objectiveStates: s.objectiveStates,
      quizAnswers: s.quizAnswers,
      quizLocked: s.quizLocked,
      quizStep: s.quizStep,
      quizFinished: s.quizFinished,
      completionSeen: s.completionSeen,
      glossaryOpen: s.glossaryOpen,
    };
    return out;
  }

  function getState() { return state; }

  function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

  function notify() {
    persist();
    for (const fn of listeners) {
      try { fn(state); } catch (e) { console.error("listener error:", e); }
    }
  }

  function setState(patch) {
    state = Object.assign({}, state, patch);
    notify();
  }

  function setEnv(updater) {
    state = Object.assign({}, state, { env: updater(state.env) });
    notify();
  }

  function patchEnv(patch) {
    state = Object.assign({}, state, { env: Object.assign({}, state.env, patch) });
    notify();
  }

  // Silent threshold update (persists, NO notify/full re-render) so the slider
  // drags smoothly; the UI readout is refreshed directly by ui.updateDetectionReadout.
  function setThreshold(t) {
    state.env.threshold = t;
    try {
      const blob = { state: stripTransient(state), version: 2 };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(blob));
    } catch (e) { /* degrade gracefully */ }
  }

  /* ---- objective engine ---- */
  function setObjectiveResult(id, passed, message, nearMiss) {
    const prev = state.objectiveStates[id] || defaultObjectiveState();
    const attempts = prev.attempts + 1;
    const firstAttemptPassed = prev.attempts === 0 ? passed : prev.firstAttemptPassed;
    state.objectiveStates = Object.assign({}, state.objectiveStates, {
      [id]: Object.assign({}, prev, { completed:passed, attempts, firstAttemptPassed, lastMessage:message, lastNearMiss:!!nearMiss }),
    });
    notify();
  }

  function revealHint(id) {
    const prev = state.objectiveStates[id] || defaultObjectiveState();
    const objs = D.objectivesFor(state.mode);
    const obj = objs.find(o => o.id === id);
    const maxHints = obj ? obj.hints.length : 0;
    const next = Math.min(prev.hintsRevealed + 1, maxHints);
    state.objectiveStates = Object.assign({}, state.objectiveStates, {
      [id]: Object.assign({}, prev, { hintsRevealed:next, hintsUsed:next }),
    });
    notify();
  }

  function runObjectiveCheck(id) {
    const objs = D.objectivesFor(state.mode);
    const obj = objs.find(o => o.id === id);
    if (!obj) return;
    const res = obj.check(state.env);
    setObjectiveResult(id, res.passed, res.message, !!res.nearMiss);
  }

  /* ---- quiz (R2 per-question lock/next) ---- */
  function setQuizAnswer(qid, oid) {
    if (state.quizLocked[qid]) return; // R2 lock
    state.quizAnswers = Object.assign({}, state.quizAnswers, { [qid]: oid });
    notify();
  }
  function lockQuestion(qid) { state.quizLocked = Object.assign({}, state.quizLocked, { [qid]:true }); notify(); }
  function setQuizStep(n) { state.quizStep = n; notify(); }
  function setQuizFinished(v) { state.quizFinished = v; notify(); }
  function resetQuiz() { state.quizAnswers={}; state.quizLocked={}; state.quizStep=0; state.quizFinished=false; notify(); }

  /* ---- mode / reset ---- */
  function setMode(m) {
    state = Object.assign({}, clone(initial), { mode:m, env:D.defaultEnv() });
    notify();
  }
  function resetAll() {
    state = clone(initial);
    notify();
  }

  const store = {
    getState, subscribe, setState, setEnv, patchEnv, setThreshold,
    setObjectiveResult, revealHint, runObjectiveCheck,
    setQuizAnswer, lockQuestion, setQuizStep, setQuizFinished, resetQuiz,
    setMode, resetAll, defaultObjectiveState,
  };
  window.LAB_STORE = store;
})();
