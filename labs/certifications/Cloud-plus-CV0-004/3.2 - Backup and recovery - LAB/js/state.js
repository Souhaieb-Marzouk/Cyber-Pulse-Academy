// ── state.js — plain-JS store: state + pub/sub + localStorage persistence ─────
// Ported 1:1 from the original zustand store (src/lib/lab/store.ts):
//   • same storage key and same partialized fields,
//   • same action semantics (including announcement strings),
//   • shallow rehydration merge over a pristine state,
//   • RESET removes the storage key and returns to the pristine mode screen.

// Original persistence key — kept identical on purpose.
const STORAGE_KEY = "cloudplus-cv0004-l32-continuity-desk-v1";

function initialEnv() {
  return {
    // Planner
    jobTypes: {},
    assetTiers: {},
    drSites: {},
    planHard: {},
    // Vault
    copyTargets: { "copy-1": "nas", "copy-2": "cloud-std", "copy-3": "cloud-xreg" },
    copyLocks: { "copy-1": false, "copy-2": false, "copy-3": false },
    verificationRan: false,
    quarantined: [],
    pager: [],
    tapeLabels: {},
    hardening: {},
    bundleHard: [],
    alertTriage: {},
    // Drill Floor
    attackReasons: [],
    immutableReason: null,
    restoreSet: [],
    drillSteps: [],
    breachHours: "",
    breachMethod: "",
    // Evidence
    failedJobId: "",
    failedCause: "",
    eventTags: {},
    h1Vector: "",
    h1Account: "",
    h1Destroyed: [],
    h1Survivor: "",
    h1SurvivorWhy: "",
    h2Cause: "",
    h2Lines: [],
    h8: [],
  };
}

function initialQuiz() {
  return { answers: {}, checked: {}, correct: 0, done: false, quizIdx: 0 };
}

function pristine() {
  return {
    version: 1,
    mode: null,
    phase: "mode",
    activeStation: "planner",
    env: initialEnv(),
    objectives: {},
    results: {},
    quiz: initialQuiz(),
    completed: false,
    completionSeen: false,
    announcement: "",
  };
}

// ── Persistence (same partialize list AND the same {state, version} wrapper
//    format as the original's zustand persist) ─────────────────────────────────
function persistState() {
  try {
    const snapshot = {
      version: state.version, mode: state.mode, phase: state.phase,
      activeStation: state.activeStation,
      env: state.env, objectives: state.objectives, results: state.results,
      quiz: { ...state.quiz, quizIdx: state.quiz.quizIdx == null ? 0 : state.quiz.quizIdx },
      completed: state.completed, completionSeen: state.completionSeen,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: snapshot, version: 0 }));
  } catch (e) {
    // storage unavailable (private mode / file:// restrictions) — the lab still
    // works in memory, exactly like the original's try/catch.
  }
}

function restoreState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return pristine();
    const parsed = JSON.parse(raw);
    // Accept both the zustand-persist wrapper and a bare partialized object.
    const saved = parsed && typeof parsed === "object" && parsed.state ? parsed.state : parsed;
    // Shallow merge over pristine — same as zustand persist's default merge.
    return { ...pristine(), ...saved };
  } catch (e) {
    return pristine();
  }
}

// ── Reactive core ──────────────────────────────────────────────────────────────
let state = restoreState();
const listeners = new Set();

/** Subscribe to any state change. Returns an unsubscribe function. */
function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  listeners.forEach((fn) => {
    try { fn(); } catch (e) { /* a broken listener must not break the rest */ }
  });
}

/** Commit a partial state patch: persist + notify (zustand `set` equivalent). */
function commit(patch) {
  state = { ...state, ...patch };
  persistState();
  notify();
}

// ── Actions (same semantics as the original store) ────────────────────────────
function setMode(m) {
  commit({
    mode: m, phase: "briefing", env: initialEnv(), objectives: {}, results: {},
    quiz: initialQuiz(), completed: false, completionSeen: false, activeStation: "planner",
  });
}

function gotoPhase(p) { commit({ phase: p }); }

function setStation(s) { commit({ activeStation: s }); }

function patchEnv(patch) {
  const resolved = typeof patch === "function" ? patch(state.env) : patch;
  commit({ env: { ...state.env, ...resolved } });
}

function checkObjective(id) {
  const def = OBJECTIVES.find((o) => o.id === id);
  if (!def) return { ok: false, title: "Unknown objective", message: "" };
  const result = def.check(state.env);
  const prev = state.objectives[id] || { passed: false, attempts: 0, firstTry: null, hintsUsed: 0 };
  const next = {
    passed: result.ok || prev.passed,
    attempts: prev.attempts + 1,
    firstTry: prev.firstTry != null ? prev.firstTry : (result.ok ? true : false),
    hintsUsed: prev.hintsUsed,
  };
  commit({
    objectives: { ...state.objectives, [id]: next },
    results: { ...state.results, [id]: result },
    announcement: `${result.ok ? "Passed" : "Not yet"}: ${def.title}. ${result.title}`,
  });
  return result;
}

function revealHint(id) {
  const def = OBJECTIVES.find((o) => o.id === id);
  if (!def) return;
  const max = def.mode === "hard" ? 1 : 3;
  const prev = state.objectives[id] || { passed: false, attempts: 0, firstTry: null, hintsUsed: 0 };
  if (prev.hintsUsed >= max) return;
  commit({
    objectives: { ...state.objectives, [id]: { ...prev, hintsUsed: prev.hintsUsed + 1 } },
    announcement: `Hint revealed for ${def.title}.`,
  });
}

function answerQuiz(qid, idx) {
  commit({ quiz: { ...state.quiz, answers: { ...state.quiz.answers, [qid]: idx } } });
}

function setQuizIdx(i) { commit({ quiz: { ...state.quiz, quizIdx: i } }); }

function revealQuizAnswer(qid) {
  const { mode, quiz } = state;
  const bank = mode === "hard" ? QUIZ_HARD : QUIZ_MEDIUM;
  const q = bank.find((x) => x.id === qid);
  if (!q || quiz.checked[qid]) return;
  const checked = { ...quiz.checked, [qid]: true };
  const correct = bank.filter((x) => checked[x.id] && quiz.answers[x.id] === x.answer).length;
  const allChecked = bank.every((x) => checked[x.id]);
  commit({
    quiz: { ...quiz, checked, correct, done: allChecked },
    announcement: `Answer locked for question ${qid}. ${quiz.answers[qid] === q.answer ? "Correct" : "Incorrect"}.`,
  });
}

function submitQuiz() {
  const { mode, quiz } = state;
  const bank = mode === "hard" ? QUIZ_HARD : QUIZ_MEDIUM;
  const checked = { ...quiz.checked };
  for (const q of bank) checked[q.id] = true;
  const correct = bank.filter((q) => quiz.answers[q.id] === q.answer).length;
  commit({
    quiz: { ...quiz, checked, correct, done: true, quizIdx: bank.length - 1 },
    announcement: `Knowledge check submitted: ${correct} of ${bank.length} correct.`,
  });
}

function finish() { commit({ completed: true, completionSeen: true }); }

function closeCompletion() { commit({ completionSeen: false }); }

function announce(msg) { commit({ announcement: msg }); }

function resetAll() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // storage unavailable — state reset still applies (same as original)
  }
  state = pristine();
  notify();
}

// ── Derived values ─────────────────────────────────────────────────────────────
function progress() {
  const { mode, objectives } = state;
  const total = OBJECTIVES.filter((o) => o.mode === mode).length;
  const passed = OBJECTIVES.filter((o) => o.mode === mode && objectives[o.id] && objectives[o.id].passed).length;
  return { passed, total };
}

function stars() {
  const { mode, objectives } = state;
  if (!mode) return { stars: 0, breakdown: "" };
  const ids = OBJECTIVES.filter((o) => o.mode === mode).map((o) => o.id);
  return computeStars(objectives, ids, mode);
}
