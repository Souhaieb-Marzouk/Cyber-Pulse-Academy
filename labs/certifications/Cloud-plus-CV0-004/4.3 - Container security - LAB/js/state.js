// HARBOR-7 — lab state store: actions, localStorage persistence, pub/sub, scoring.
// Static port note: faithful port of src/lib/lab/store.tsx (React reducer → plain
// JS store with subscribe/notify). Same action semantics, same persistence key,
// same debounce, same migration, same scoring math.

const STORAGE_KEY = "harbor7.lab.v1";

/* ------------------------------ Actions (mirror the original reducer) ------------------------------
 * STAGE {stage} · ZONE {zone, tab?} · MODE {mode} · BRIEF_SEEN · ENV {patch} · ENV_UPD {fn}
 * CHECK {objectiveId} · HINT {objectiveId} · QUIZ_ANSWER {qid, idx} · QUIZ_CHECK {qid}
 * RETAKE_QUIZ · COMPLETION_SHOWN · RESET
 */

function emptyQuiz() {
  return { answers: {}, checked: {}, submitted: false, missed: [] };
}

function quizBank(mode) {
  return mode === "hard" ? QUIZ_HARD : QUIZ_MEDIUM;
}

function reduce(state, action) {
  switch (action.type) {
    case "STAGE":
      return { ...state, stage: action.stage };
    case "ZONE":
      return { ...state, zone: action.zone, berthTab: action.tab ?? state.berthTab, stage: "map" };
    case "MODE":
      // Evidence (env) is shared between shifts by design — only objectives/quiz are per mode.
      return { ...state, mode: action.mode, stage: "map" };
    case "BRIEF_SEEN":
      return { ...state, briefingSeen: true };
    case "ENV":
      return { ...state, env: { ...state.env, ...action.patch } };
    case "ENV_UPD":
      return { ...state, env: { ...state.env, ...action.fn(state.env) } };
    case "CHECK": {
      const o = action.objective;
      const result = o.check(state.env, state.mode ?? "medium");
      const prev = state.objectives[o.id] ?? { done: false, attempts: 0, hintsUsed: 0, firstTry: false };
      if (prev.done) return state;
      const attempts = prev.attempts + 1;
      const done = result.pass;
      const firstTry = done && attempts === 1 && prev.hintsUsed === 0;
      return { ...state, objectives: { ...state.objectives, [o.id]: { done, attempts, hintsUsed: prev.hintsUsed, firstTry } } };
    }
    case "HINT": {
      const prev = state.objectives[action.objectiveId] ?? { done: false, attempts: 0, hintsUsed: 0, firstTry: false };
      if (prev.done) return state;
      return { ...state, objectives: { ...state.objectives, [action.objectiveId]: { ...prev, hintsUsed: prev.hintsUsed + 1 } } };
    }
    case "QUIZ_ANSWER": {
      const mode = state.mode ?? "medium";
      const q = state.quiz[mode];
      // R2: a checked (validated) answer can never be re-selected or edited.
      if (q.checked[action.qid] || q.submitted) return state;
      return { ...state, quiz: { ...state.quiz, [mode]: { ...q, answers: { ...q.answers, [action.qid]: action.idx } } } };
    }
    case "QUIZ_CHECK": {
      const mode = state.mode ?? "medium";
      const q = state.quiz[mode];
      const picked = q.answers[action.qid];
      if (picked === undefined || q.checked[action.qid]) return state;
      const bank = quizBank(mode);
      const question = bank.find((b) => b.id === action.qid);
      if (!question) return state;
      const correct = picked === question.answer;
      const checked = { ...q.checked, [action.qid]: true };
      const missed = correct || q.missed.includes(action.qid) ? q.missed : [...q.missed, action.qid];
      // Quiz counts as submitted once every question in this mode is validated.
      const submitted = bank.every((b) => checked[b.id]);
      return { ...state, quiz: { ...state.quiz, [mode]: { ...q, checked, missed, submitted } } };
    }
    case "RETAKE_QUIZ": {
      const mode = state.mode ?? "medium";
      // Full reset of this mode's attempt — never a per-question edit (R2-safe retry).
      // `missed` is intentionally kept: it is the performance evidence for focus areas.
      return { ...state, quiz: { ...state.quiz, [mode]: { ...emptyQuiz(), missed: state.quiz[mode].missed } } };
    }
    case "COMPLETION_SHOWN": {
      const mode = state.mode ?? "medium";
      return { ...state, completedShown: { ...state.completedShown, [mode]: true }, completedAt: new Date().toISOString() };
    }
    case "RESET":
      return initialState();
    default:
      return state;
  }
}

/* ------------------------------ Persistence ------------------------------ */

/** Migrate older persisted shapes (v1 single-quiz / boolean completedShown) safely. */
function migrate(parsed) {
  const base = initialState();
  const legacyQuiz = parsed.quiz;
  let quiz = base.quiz;
  if (legacyQuiz && typeof legacyQuiz === "object") {
    if ("medium" in legacyQuiz || "hard" in legacyQuiz) {
      const byMode = legacyQuiz;
      quiz = {
        medium: { ...emptyQuiz(), ...(byMode.medium ?? {}) },
        hard: { ...emptyQuiz(), ...(byMode.hard ?? {}) },
      };
    } else {
      // old flat shape belonged to whichever mode was active
      const legacy = legacyQuiz;
      quiz = { ...base.quiz };
      const m = parsed.mode ?? "medium";
      quiz[m] = { ...emptyQuiz(), answers: legacy.answers ?? {}, checked: legacy.checked ?? {}, submitted: !!legacy.submitted, missed: [] };
    }
  }
  let completedShown = base.completedShown;
  const legacyShown = parsed.completedShown;
  if (typeof legacyShown === "boolean") {
    // old boolean: honor it for the saved mode, keep the other mode's auto-open intact
    completedShown = { medium: !!legacyShown, hard: !!legacyShown };
  } else if (legacyShown && typeof legacyShown === "object") {
    completedShown = { ...base.completedShown, ...legacyShown };
  }
  return {
    ...base,
    ...parsed,
    env: { ...initialEnv(), ...(parsed.env ?? {}) },
    quiz,
    completedShown,
  };
}

function loadSaved() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.version === 1 && parsed.env) {
      return migrate(parsed);
    }
    return null;
  } catch {
    return null;
  }
}

function save(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable — degrade gracefully */
  }
}

// Flush the save immediately when the page is hidden/unloaded, so a reload that
// lands inside the 150 ms debounce window can never lose progress. (Same key,
// same state — only the write moment moves earlier than the debounce tick.)
if (typeof window !== "undefined") {
  window.addEventListener("pagehide", () => save(Lab.state));
}

/* ------------------------------ Store ------------------------------ */

const Lab = {
  state: initialState(),
  hydrated: false,
  listeners: [],
  _saveTimer: null,
  // QA B1: double-click guard on CHECK RESULTS — a rapid second press within the
  // cooldown re-uses the first result instead of inflating the attempt counter.
  _lastCheck: null, // { id, at, result }

  init() {
    const loaded = loadSaved();
    if (loaded) this.state = loaded;
    this.hydrated = true;
    this.notify();
  },

  dispatch(action) {
    const next = reduce(this.state, action);
    if (next !== this.state) {
      this.state = next;
      this.scheduleSave();
      this.notify();
    }
  },

  /** Check an objective; enforces the 400 ms per-objective cooldown. Returns the CheckResult. */
  checkObjective(o) {
    const now = Date.now();
    const last = this._lastCheck;
    if (last && last.id === o.id && now - last.at < 400) return last.result;
    const result = o.check(this.state.env, this.mode());
    this._lastCheck = { id: o.id, at: now, result };
    this.dispatch({ type: "CHECK", objective: o });
    return result;
  },

  mode() {
    return this.state.mode ?? "medium";
  },

  objectives() {
    return objectivesFor(this.mode());
  },

  progress() {
    const objectives = this.objectives();
    const total = objectives.length;
    const done = objectives.filter((o) => this.state.objectives[o.id]?.done).length;
    const hints = objectives.reduce((s, o) => s + (this.state.objectives[o.id]?.hintsUsed ?? 0), 0);
    const quizPct = this.state.quiz[this.mode()]?.submitted ? quizScore() : null;
    return {
      done,
      total,
      score: total === 0 ? 0 : Math.round((done / total) * 100),
      stars: computeStars(this.state, objectives),
      hints,
      quizPct,
    };
  },

  allObjectivesDone() {
    const p = this.progress();
    return p.done === p.total && p.total > 0;
  },

  completionReady() {
    return this.allObjectivesDone() && !!this.state.quiz[this.mode()]?.submitted;
  },

  scheduleSave() {
    if (this._saveTimer) clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => save(this.state), 150);
  },

  subscribe(fn) {
    this.listeners.push(fn);
  },

  notify() {
    for (const fn of this.listeners) fn();
  },
};

/* ------------------------------ Scoring ------------------------------ */

function computeStars(state, objectives) {
  const total = objectives.length;
  if (total === 0) return 0;
  const done = objectives.filter((o) => state.objectives[o.id]?.done);
  if (done.length < total) return 0;
  const hints = done.reduce((s, o) => s + (state.objectives[o.id]?.hintsUsed ?? 0), 0);
  const firstTry = done.filter((o) => state.objectives[o.id]?.firstTry).length / total;
  if (hints === 0 && firstTry === 1) return 5;
  if (hints <= 3 && firstTry >= 0.8) return 4;
  if (firstTry >= 0.6) return 3;
  return 2;
}

function quizScore() {
  const mode = Lab.mode();
  const q = Lab.state.quiz[mode] ?? emptyQuiz();
  const questions = quizBank(mode);
  const correct = questions.filter((b) => q.answers[b.id] === b.answer).length;
  return Math.round((correct / questions.length) * 100);
}
