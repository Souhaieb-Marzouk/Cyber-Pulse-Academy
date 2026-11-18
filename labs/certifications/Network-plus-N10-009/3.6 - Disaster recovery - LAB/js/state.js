// Operation THAWLINE — static port: state store + persistence + derived stats.
// Recreates the original zustand store (src/lib/lab/store.ts) as a tiny
// pub/sub store with the SAME persistence contract:
//   - localStorage key: "thawline-dr-lab-v1" (LabData.LAB_ID)
//   - envelope: {"state": {mode, activeBoard, answers, objectiveState,
//               remediation, completionSeen}, "version": 0}
//   - autosave on every change; resume exactly; confirmed RESET to pristine.
// Storage access is guarded: when localStorage is unavailable (private mode,
// file:// restrictions) the lab degrades to in-memory with a banner notice.

var LabStore = (function () {
  "use strict";

  const initialState = {
    mode: null, // "medium" | "hard" | null (mode gate until picked)
    activeBoard: "wall",
    answers: {}, // every select/input answer, keyed by answer key
    objectiveState: {}, // id -> {solved, attempts, hintsUsed, feedback}
    remediation: [], // H9 click order
    completionSeen: false,
  };

  let state = JSON.parse(JSON.stringify(initialState));
  const subscribers = new Set();
  let storageOk = true;
  let lastSaved = "";

  /* ---------------- persistence (zustand-compatible) ---------------- */

  function storageKey() {
    return LabData.LAB_ID;
  }

  function persistWrite() {
    if (!storageOk) return;
    try {
      const partial = {
        mode: state.mode,
        activeBoard: state.activeBoard,
        answers: state.answers,
        objectiveState: state.objectiveState,
        remediation: state.remediation,
        completionSeen: state.completionSeen,
      };
      const payload = JSON.stringify({ state: partial, version: 0 });
      window.localStorage.setItem(storageKey(), payload);
      lastSaved = payload;
    } catch (e) {
      storageOk = false;
    }
  }

  function persistLoad() {
    let raw = null;
    try {
      raw = window.localStorage.getItem(storageKey());
      storageOk = !!window.localStorage;
    } catch (e) {
      storageOk = false;
      return false;
    }
    if (!raw) return false;
    try {
      const parsed = JSON.parse(raw);
      const s = parsed && parsed.state ? parsed.state : null;
      if (!s) return false;
      // resume exactly, field by field (same partialize list as the original)
      if (s.mode === "medium" || s.mode === "hard") state.mode = s.mode;
      if (typeof s.activeBoard === "string") state.activeBoard = s.activeBoard;
      if (s.answers && typeof s.answers === "object") state.answers = s.answers;
      if (s.objectiveState && typeof s.objectiveState === "object") state.objectiveState = s.objectiveState;
      if (Array.isArray(s.remediation)) state.remediation = s.remediation;
      if (typeof s.completionSeen === "boolean") state.completionSeen = s.completionSeen;
      lastSaved = raw;
      return state.mode !== null;
    } catch (e) {
      return false; // corrupted save behaves like a fresh desk
    }
  }

  function persistClear() {
    try {
      window.localStorage.removeItem(storageKey());
    } catch (e) {
      /* storage may be unavailable — state reset still applies */
    }
  }

  /* ---------------- pub/sub ---------------- */

  function notify(changed) {
    persistWrite();
    subscribers.forEach((fn) => {
      try {
        fn(state, changed);
      } catch (e) {
        /* a broken subscriber must not break the store */
      }
    });
  }

  function subscribe(fn) {
    subscribers.add(fn);
    return function unsubscribe() {
      subscribers.delete(fn);
    };
  }

  /* ---------------- actions (same semantics as the original) ---------------- */

  function setMode(m) {
    state.mode = m;
    notify(["mode"]);
  }

  function setAnswer(k, v) {
    state.answers = { ...state.answers, [k]: v };
    notify(["answers"]);
  }

  function setActiveBoard(b) {
    state.activeBoard = b;
    notify(["activeBoard"]);
  }

  function checkObjective(id) {
    if (!state.mode) return;
    const def = LabObjectives.objectivesForMode(state.mode).find((o) => o.id === id);
    if (!def) return;
    const prev = state.objectiveState[id];
    if (prev && prev.solved) return; // lock once solved
    const res = def.check(state.answers, state.remediation);
    state.objectiveState = {
      ...state.objectiveState,
      [id]: {
        solved: res.ok,
        attempts: (prev && prev.attempts ? prev.attempts : 0) + 1,
        hintsUsed: prev ? prev.hintsUsed : 0,
        feedback: res,
      },
    };
    notify(["objectiveState"]);
  }

  function revealHint(id, max) {
    const prev = state.objectiveState[id];
    const used = prev ? prev.hintsUsed : 0;
    if (used >= max) return;
    state.objectiveState = {
      ...state.objectiveState,
      [id]: {
        solved: prev ? prev.solved : false,
        attempts: prev ? prev.attempts : 0,
        hintsUsed: used + 1,
        feedback: prev ? prev.feedback : undefined,
      },
    };
    notify(["objectiveState"]);
  }

  function pushRemediation(id) {
    if (state.remediation.includes(id) || state.remediation.length >= 3) return;
    state.remediation = [...state.remediation, id];
    notify(["remediation"]);
  }

  function clearRemediation() {
    state.remediation = [];
    notify(["remediation"]);
  }

  function markCompletionSeen() {
    state.completionSeen = true;
    notify(["completionSeen"]);
  }

  function reset() {
    persistClear();
    state = JSON.parse(JSON.stringify(initialState));
    notify(["mode", "activeBoard", "answers", "objectiveState", "remediation", "completionSeen"]);
  }

  /* ---------------- derived selectors (same formulas as useProgress) ------- */

  function progress() {
    if (!state.mode) {
      return { done: 0, total: 0, quizTotal: 0, quizCorrect: 0, score: 0, stars: 5, allSolved: false };
    }
    const objs = LabObjectives.objectivesForMode(state.mode);
    const total = objs.length;
    const done = objs.filter((o) => state.objectiveState[o.id] && state.objectiveState[o.id].solved).length;
    const quiz = state.mode === "medium" ? LabData.QUIZ_MEDIUM.length : LabData.QUIZ_HARD.length;
    const bank = state.mode === "medium" ? LabData.QUIZ_MEDIUM : LabData.QUIZ_HARD;
    let correct = 0;
    for (let i = 1; i <= quiz; i++) {
      const a = state.answers["quiz.q" + i];
      if (!a) continue;
      if (bank[i - 1].correct === a) correct++;
    }
    const quizTotal = quiz;
    const score = Math.round(70 * (total ? done / total : 0) + 30 * (quiz ? correct / quiz : 0));
    // stars: 5 base; -0.2 per retried objective; -0.15 per hint (medium); -0.3 per nudge (hard); floor 1
    let penalty = 0;
    for (const o of objs) {
      const st = state.objectiveState[o.id];
      if (!st) continue;
      if (st.attempts > 1) penalty += 0.2;
      penalty += st.hintsUsed * (state.mode === "medium" ? 0.15 : 0.3);
    }
    const stars = Math.max(1, Math.round((5 - penalty) * 2) / 2);
    return { done: done, total: total, quizTotal: quizTotal, quizCorrect: correct, score: score, stars: stars, allSolved: total > 0 && done === total };
  }

  function nextObjective() {
    if (!state.mode) return null;
    const objs = LabObjectives.objectivesForMode(state.mode);
    const unsolved = objs.find((o) => !(state.objectiveState[o.id] && state.objectiveState[o.id].solved));
    return unsolved ? unsolved.id : null;
  }

  return {
    get state() { return state; },
    subscribe: subscribe,
    setMode: setMode,
    setAnswer: setAnswer,
    setActiveBoard: setActiveBoard,
    checkObjective: checkObjective,
    revealHint: revealHint,
    pushRemediation: pushRemediation,
    clearRemediation: clearRemediation,
    markCompletionSeen: markCompletionSeen,
    reset: reset,
    progress: progress,
    nextObjective: nextObjective,
    persistLoad: persistLoad,
    storageOk: function () { return storageOk; },
  };
})();
