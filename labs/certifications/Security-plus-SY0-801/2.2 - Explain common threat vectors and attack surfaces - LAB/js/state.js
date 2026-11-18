/* =========================================================================
   Night Dispatch — js/state.js
   The state store: pristine state, the reducer (same action semantics as
   lib/lab/engine.ts), localStorage persistence under the SAME key, unlock
   rules and the scoring formulas. A tiny subscribe/notify mechanism drives
   targeted re-renders.
   ========================================================================= */

"use strict";

const STORAGE_KEY = "mvtf-night-dispatch-v1";
const STATE_VERSION = 1;

/* ---------- pristine state ---------- */

function initialState() {
  const stamps = {};
  for (const c of boardFor("medium").concat(boardFor("hard"))) {
    stamps[c.id] = { vectorId: null, districtId: null, stamped: false, wrongAttempts: 0 };
  }
  return {
    v: STATE_VERSION,
    hydrated: false,
    mode: null,
    duty: "briefing",
    dutiesUnlocked: ["briefing"],
    stamps,
    exposure: {},
    signals: {},
    sequences: {},
    matchers: {},
    results: {},
    quiz: { answers: {}, checked: {}, score: 0, done: false },
    objectives: {},
    completionSeen: false,
  };
}

/* ---------- unlock rules (medium gates its duties; hard is free-roam) ---------- */

function withUnlocks(s) {
  if (s.mode !== "medium") return s;
  const duties = [...s.dutiesUnlocked];
  if (duties.includes("binder") && !duties.includes("floor")) duties.push("floor");
  const solved = OBJECTIVES.medium.filter((o) => s.objectives[o.id]?.solved).length;
  if (duties.includes("floor") && solved >= 8 && !duties.includes("review")) duties.push("review");
  if (duties.includes("review") && s.quiz.done && !duties.includes("handover")) duties.push("handover");
  return { ...s, dutiesUnlocked: duties };
}

/* ---------- reducer (identical action semantics to the original) ---------- */

function reducer(state, action) {
  switch (action.type) {
    case "REPLACE":
      return { ...action.state, hydrated: true };
    case "HYDRATED":
      return { ...state, hydrated: true };
    case "RESET":
      return { ...initialState(), hydrated: true };
    case "SET_MODE": {
      const fresh = initialState();
      fresh.hydrated = true;
      fresh.mode = action.mode;
      fresh.dutiesUnlocked =
        action.mode === "hard"
          ? ["briefing", "binder", "floor", "review", "handover"]
          : ["briefing", "binder"];
      return fresh;
    }
    case "VISIT_DUTY": {
      const duties = state.dutiesUnlocked.includes(action.duty)
        ? state.dutiesUnlocked
        : [...state.dutiesUnlocked, action.duty];
      return withUnlocks({ ...state, dutiesUnlocked: duties, duty: action.duty });
    }
    case "SET_DUTY":
      return { ...state, duty: action.duty };
    case "SET_STAMP_FIELDS": {
      const prev = state.stamps[action.id] ?? { vectorId: null, districtId: null, stamped: false, wrongAttempts: 0 };
      return {
        ...state,
        stamps: {
          ...state.stamps,
          [action.id]: {
            ...prev,
            vectorId: action.vectorId ?? prev.vectorId,
            districtId: action.districtId ?? prev.districtId,
          },
        },
      };
    }
    case "STAMP": {
      const prev = state.stamps[action.id] ?? { vectorId: null, districtId: null, stamped: false, wrongAttempts: 0 };
      return {
        ...state,
        stamps: {
          ...state.stamps,
          [action.id]: {
            ...prev,
            stamped: true,
            wrongAttempts: action.correct ? prev.wrongAttempts : prev.wrongAttempts + 1,
          },
        },
      };
    }
    case "SET_EXPOSURE": {
      const prev = state.exposure[action.district] ?? { level: "", tag: "" };
      return {
        ...state,
        exposure: {
          ...state.exposure,
          [action.district]: {
            level: action.level ?? prev.level,
            tag: action.tag ?? prev.tag,
          },
        },
      };
    }
    case "TOGGLE_SIGNAL":
      return { ...state, signals: { ...state.signals, [action.id]: !state.signals[action.id] } };
    case "SEQ_PUSH": {
      const q = state.sequences[action.key] ?? [];
      if (q.includes(action.stepId)) return state;
      return { ...state, sequences: { ...state.sequences, [action.key]: [...q, action.stepId] } };
    }
    case "SEQ_REMOVE": {
      const q = (state.sequences[action.key] ?? []).filter((_, i) => i !== action.index);
      return { ...state, sequences: { ...state.sequences, [action.key]: q } };
    }
    case "SEQ_CLEAR":
      return { ...state, sequences: { ...state.sequences, [action.key]: [] } };
    case "SET_MATCH":
      return {
        ...state,
        matchers: {
          ...state.matchers,
          [action.key]: { ...(state.matchers[action.key] ?? {}), [action.row]: action.option },
        },
      };
    case "CHECK_OBJECTIVE": {
      const prev = state.objectives[action.id] ?? { solved: false, attempts: 0, hintsUsed: 0, firstTry: false };
      const next = {
        attempts: prev.attempts + 1,
        solved: prev.solved || action.result.pass,
        hintsUsed: prev.hintsUsed,
        firstTry: prev.solved ? prev.firstTry : !prev.attempts && action.result.pass,
      };
      return withUnlocks({
        ...state,
        objectives: { ...state.objectives, [action.id]: next },
        results: { ...state.results, [action.id]: action.result },
      });
    }
    case "USE_HINT": {
      const prev = state.objectives[action.id] ?? { solved: false, attempts: 0, hintsUsed: 0, firstTry: false };
      return {
        ...state,
        objectives: { ...state.objectives, [action.id]: { ...prev, hintsUsed: prev.hintsUsed + 1 } },
      };
    }
    case "QUIZ_ANSWER":
      return { ...state, quiz: { ...state.quiz, answers: { ...state.quiz.answers, [action.id]: action.idx } } };
    case "QUIZ_CHECK":
      return { ...state, quiz: { ...state.quiz, checked: { ...state.quiz.checked, [action.id]: true } } };
    case "QUIZ_FINISH":
      return withUnlocks({ ...state, quiz: { ...state.quiz, score: action.score, done: true } });
    case "COMPLETION_SEEN":
      return { ...state, completionSeen: true };
    default:
      return state;
  }
}

/* ---------- persistence (same key, same merge semantics) ---------- */

function loadPersisted() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.v !== STATE_VERSION) return null;
    const base = initialState();
    return {
      ...base,
      ...parsed,
      stamps: { ...base.stamps, ...parsed.stamps },
      quiz: { ...base.quiz, ...parsed.quiz },
    };
  } catch {
    return null;
  }
}

function persist(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable — degrade gracefully (lab stays fully usable) */
  }
}

function clearPersisted() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/* ---------- scoring (identical formulas) ---------- */

function objectiveScore(s, mode) {
  const list = OBJECTIVES[mode];
  let earned = 0;
  let hints = 0;
  let solved = 0;
  for (const o of list) {
    const os = s.objectives[o.id];
    hints += os?.hintsUsed ?? 0;
    if (os?.solved) {
      solved += 1;
      const base = os.firstTry ? 1 : 0.6;
      earned += Math.max(0.25, base - 0.15 * Math.min(os.hintsUsed, 3));
    }
  }
  return { pct: list.length ? earned / list.length : 0, solved, total: list.length, hints };
}

function quizScore(s) {
  return s.quiz.done ? s.quiz.score : null;
}

function completionReady(s, mode) {
  const { solved, total } = objectiveScore(s, mode);
  return solved === total && s.quiz.done;
}

function starRating(objPct, hints, quiz) {
  if (objPct >= 0.92 && hints <= 2 && (quiz ?? 0) >= 0.9) return 5;
  if (objPct >= 0.8 && (quiz ?? 0) >= 0.7) return 4;
  if (objPct >= 0.6) return 3;
  if (objPct >= 0.35) return 2;
  return 1;
}

/* ---------- store: subscribe/notify around the reducer ---------- */

const Store = {
  state: initialState(),
  _listeners: [],
  dispatch(action) {
    const next = reducer(this.state, action);
    if (next !== this.state) {
      this.state = next;
      if (this.state.hydrated) persist(this.state);
      for (const fn of this._listeners) fn(action);
    }
  },
  subscribe(fn) {
    this._listeners.push(fn);
  },
};
