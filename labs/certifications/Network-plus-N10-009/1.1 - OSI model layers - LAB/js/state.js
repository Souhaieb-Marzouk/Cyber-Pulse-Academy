// ─── Lab state: plain-JS store + localStorage persistence (ported from store.ts) ───
// Same persistence key and the same save/restore/RESET semantics as the original
// zustand store: JSON envelope { state: {...partialized fields...}, version: 0 } under
// the key "osi-protocol-tower-v1". A tiny subscribe/notify mechanism stands in for
// zustand — UI regions re-render only what changed.

(function () {
  "use strict";

  const STORAGE_KEY = "osi-protocol-tower-v1";

  // ── state shape (identical to the original LabStore) ─────────────────────
  const state = {
    mode: null, // "medium" | "hard" | null (gate)
    answers: {}, // objectiveId -> answer (string | Record | array)
    results: {}, // objectiveId -> { pass, feedback } | undefined
    objState: {}, // objectiveId -> { attempts, done, firstTry, hintsUsed } | undefined
    quizAnswers: {}, // quizId -> optionId
    quizLocked: {}, // quizId -> true once answered (one-shot)
    completedShown: false,
  };

  const listeners = []; // (event) => void

  function subscribe(fn) {
    listeners.push(fn);
    return () => {
      const i = listeners.indexOf(fn);
      if (i >= 0) listeners.splice(i, 1);
    };
  }

  function emit(type, detail) {
    for (const fn of listeners.slice()) {
      try {
        fn({ type, detail });
      } catch (err) {
        console.error(err);
      }
    }
  }

  // ── persistence (zustand persist compatible envelope) ────────────────────
  function persist() {
    try {
      const payload = {
        state: {
          mode: state.mode,
          answers: state.answers,
          results: state.results,
          objState: state.objState,
          quizAnswers: state.quizAnswers,
          quizLocked: state.quizLocked,
          completedShown: state.completedShown,
        },
        version: 0,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* storage unavailable — StorageWarning banner covers this (graceful) */
    }
  }

  function hydrate() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const s = parsed && parsed.state ? parsed.state : parsed;
      if (s && typeof s === "object") {
        state.mode = s.mode === "medium" || s.mode === "hard" ? s.mode : null;
        state.answers = s.answers && typeof s.answers === "object" ? s.answers : {};
        state.results = s.results && typeof s.results === "object" ? s.results : {};
        state.objState = s.objState && typeof s.objState === "object" ? s.objState : {};
        state.quizAnswers = s.quizAnswers && typeof s.quizAnswers === "object" ? s.quizAnswers : {};
        state.quizLocked = s.quizLocked && typeof s.quizLocked === "object" ? s.quizLocked : {};
        state.completedShown = s.completedShown === true;
      }
    } catch {
      /* corrupt or unavailable storage — treat as pristine (documented in Conversion Notes) */
    }
  }

  // ── actions (mirroring the original store actions) ───────────────────────
  function setMode(m) {
    state.mode = m;
    persist();
    emit("mode", m);
  }

  function setAnswer(id, value) {
    // value may be a plain answer or an updater function — updaters always derive
    // from the LATEST stored answer so batched clicks never clash (original contract).
    const prev = state.answers[id];
    const next = typeof value === "function" ? value(prev) : value;
    state.answers = { ...state.answers, [id]: next };
    persist();
    emit("answer", id);
  }

  function runCheck(obj) {
    const answer = state.answers[obj.id];
    const result = window.LabEngine.runObjectiveCheck(obj, answer);
    const prev = state.objState[obj.id];
    const attempts = (prev ? prev.attempts : 0) + 1;
    const firstTry = prev && prev.firstTry !== undefined && prev.firstTry !== null ? prev.firstTry : result.pass;
    state.results = { ...state.results, [obj.id]: { pass: result.pass, feedback: result.feedback } };
    state.objState = {
      ...state.objState,
      [obj.id]: {
        attempts,
        done: ((prev && prev.done) || false) || result.pass,
        firstTry,
        hintsUsed: prev ? prev.hintsUsed : 0,
      },
    };
    persist();
    emit("check", obj.id);
    return result;
  }

  function useHint(id) {
    const prev = state.objState[id];
    const used = prev ? prev.hintsUsed || 0 : 0;
    state.objState = {
      ...state.objState,
      [id]: {
        attempts: prev ? prev.attempts || 0 : 0,
        done: prev ? prev.done || false : false,
        firstTry: prev ? prev.firstTry : null,
        hintsUsed: used + 1,
      },
    };
    persist();
    emit("hint", id);
  }

  function answerQuiz(qid, optionId) {
    if (state.quizLocked[qid]) return; // one-shot lock (R2 semantics)
    state.quizAnswers = { ...state.quizAnswers, [qid]: optionId };
    state.quizLocked = { ...state.quizLocked, [qid]: true };
    persist();
    emit("quiz", qid);
  }

  function markCompletedShown() {
    state.completedShown = true;
    persist();
    emit("completed", true);
  }

  function resetAll() {
    state.mode = null;
    state.answers = {};
    state.results = {};
    state.objState = {};
    state.quizAnswers = {};
    state.quizLocked = {};
    state.completedShown = false;
    persist();
    emit("reset", true);
  }

  // ── selectors ────────────────────────────────────────────────────────────
  function progress(mode) {
    const objs = window.LabEngine.objectivesFor(mode);
    const done = objs.filter((o) => state.objState[o.id] && state.objState[o.id].done).length;
    return { done, total: objs.length, ratio: objs.length ? done / objs.length : 0 };
  }

  function quizProgress(mode) {
    const qs = window.LAB.QUIZ[mode];
    const answered = qs.filter((q) => state.quizAnswers[q.id] !== undefined).length;
    return { answered, total: qs.length };
  }

  function isComplete(mode) {
    const p = progress(mode);
    const q = quizProgress(mode);
    return p.done === p.total && q.answered === q.total;
  }

  function storageAvailable() {
    try {
      const k = "__tower_probe__";
      window.localStorage.setItem(k, "1");
      window.localStorage.removeItem(k);
      return true;
    } catch {
      return false;
    }
  }

  window.LabStore = {
    STORAGE_KEY,
    state,
    subscribe,
    hydrate,
    persist,
    setMode,
    setAnswer,
    runCheck,
    useHint,
    answerQuiz,
    markCompletedShown,
    resetAll,
    progress,
    quizProgress,
    isComplete,
    storageAvailable,
  };
})();
