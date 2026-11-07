// ─────────────────────────────────────────────────────────────────────────────
// js/state.js — lab state, persistence and engine helpers.
// 1:1 port of the original `src/lib/lab/engine.ts`: same storage key, same
// state shape, same merge/repair semantics, same scoring and validators.
// Adds only a minimal subscribe/notify store so panels re-render on change.
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "cvt-lab-cv0004-2.3-v1";
const STATE_VERSION = 1;

function initialState() {
  const workloads = {};
  for (const id of Object.keys(WORKLOAD_MAP)) {
    workloads[id] = { status: "hold", dispositions: {} };
  }
  return {
    version: STATE_VERSION,
    mode: null,
    briefingSeen: false,
    workloads,
    waveOrder: ["W3", "W5", "W1", "W4", "W2"], // scrambled wave board
    cutover: {
      seq: ["S2", "S4", "S1", "S6", "S3", "S8", "S5", "S7"], // scrambled runbook to be ordered
      ttl: null,
      freeze: null,
      cutoverDay: null,
      rollbackTriggers: [],
      rollbackFirst: null,
      executed: false,
      runbookLocked: false,
      incidentDecision: null,
      incidentActions: ["I2", "I4", "I1", "I3"], // scrambled response order
      rto: null,
      rpo: null,
    },
    triage: { docs: [], changes: { "H6-ACTIONS": "H6A2,H6A4,H6A1,H6A3" } }, // scrambled corrective order
    transferPlan: { plan: null, totalHours: "", first: null },
    audit: { deps: [], fixes: {}, violations: [], proposal: null, exitCosts: [] },
    objectives: {},
    quiz: { started: false, index: 0, answers: [], submitted: false, revealed: false },
    completed: false,
    log: ["Tower online. awaiting flight plans."],
  };
}

// ── Persistence (localStorage; degrade gracefully when unavailable) ─────────

function loadState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version !== STATE_VERSION || !parsed.mode) return null;
    const base = initialState();
    const merged = {
      ...base,
      ...parsed,
      workloads: { ...base.workloads, ...parsed.workloads },
      cutover: { ...base.cutover, ...parsed.cutover },
      triage: { ...base.triage, ...parsed.triage },
      transferPlan: { ...base.transferPlan, ...parsed.transferPlan },
      audit: { ...base.audit, ...parsed.audit },
      quiz: { ...base.quiz, ...parsed.quiz },
    };
    // migration: empty runbook from an older save gets the seeded scrambled sequence
    if (!merged.cutover.seq || merged.cutover.seq.length === 0) {
      merged.cutover = { ...merged.cutover, seq: base.cutover.seq };
    }
    return merged;
  } catch {
    return null;
  }
}

function saveState(s) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* private mode / quota — degrade gracefully (same as original) */
  }
}

function clearState() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}

// ── Objective bookkeeping ───────────────────────────────────────────────────

function recordAttempt(s, id, pass) {
  const prev = s.objectives[id] ?? { solved: false, attempts: 0, hintsUsed: 0, firstTry: false };
  if (prev.solved) return s;
  const attempts = prev.attempts + 1;
  return {
    ...s,
    objectives: {
      ...s.objectives,
      [id]: { ...prev, attempts, solved: pass, firstTry: pass && attempts === 1 },
    },
  };
}

function recordHint(s, id) {
  const prev = s.objectives[id] ?? { solved: false, attempts: 0, hintsUsed: 0, firstTry: false };
  return {
    ...s,
    objectives: { ...s.objectives, [id]: { ...prev, hintsUsed: prev.hintsUsed + 1 } },
  };
}

function isSolved(s, id) {
  return (s.objectives[id] && s.objectives[id].solved) || false;
}

// ── Generic validators ──────────────────────────────────────────────────────

function eqSet(selected, expected) {
  if (selected.length !== expected.length) return false;
  const a = new Set(selected);
  return expected.every((x) => a.has(x));
}

function numericClose(value, target, tol) {
  const n = Number(String(value).replace(",", ".").trim());
  if (!Number.isFinite(n)) return false;
  return Math.abs(n - target) <= tol;
}

// ── Workload clearing ───────────────────────────────────────────────────────

function workloadCleared(s, id) {
  const ws = s.workloads[id];
  const def = WORKLOAD_MAP[id];
  if (!ws || !def) return false;
  return (
    ws.migrationType === def.expected.migrationType &&
    ws.strategy === def.expected.strategy &&
    ws.transfer === def.expected.transfer &&
    (!def.sizing || ws.sizing === def.sizing.correct)
  );
}

function clearanceIssues(s, id) {
  const ws = s.workloads[id];
  const def = WORKLOAD_MAP[id];
  if (!ws || !def) return ["Unknown workload."];
  const issues = [];
  if (ws.migrationType !== def.expected.migrationType) issues.push("migration route");
  if (ws.strategy !== def.expected.strategy) issues.push("strategy");
  if (ws.transfer !== def.expected.transfer) issues.push("transfer method");
  if (def.sizing && ws.sizing !== def.sizing.correct) issues.push("resource allocation");
  return issues;
}

// ── Scoring & stars ─────────────────────────────────────────────────────────

function modePrefix(mode) {
  return mode === "medium" ? "OBJ-M" : "OBJ-H";
}

function solvedCount(s) {
  return Object.values(s.objectives).filter((o) => o.solved).length;
}

function totalObjectives(mode) {
  return mode === "medium" ? 12 : 9;
}

function computeScore(s, quizCorrect, quizTotal) {
  const mode = s.mode ?? "medium";
  const prefix = modePrefix(mode);
  const objectiveMax = totalObjectives(mode) * 10;
  const objectivePoints =
    Object.entries(s.objectives).filter(([id, o]) => o.solved && id.startsWith(prefix)).length * 10;
  const quizMax = 20;
  const quizPoints = quizTotal > 0 ? Math.round((quizCorrect / quizTotal) * quizMax) : 0;
  const total = objectivePoints + quizPoints;
  const max = objectiveMax + quizMax;
  const entries = Object.entries(s.objectives).filter(([id]) => id.startsWith(prefix));
  const solvedEntries = entries.filter(([, o]) => o.solved);
  const firstTryRate =
    solvedEntries.length > 0
      ? solvedEntries.filter(([, o]) => o.firstTry).length / solvedEntries.length
      : 0;
  const hintsUsed = entries.reduce((acc, [, o]) => acc + (o.solved ? o.hintsUsed : 0), 0);
  const allSolved = solvedEntries.length === totalObjectives(mode);
  let stars = 0;
  if (allSolved) {
    if (firstTryRate >= 0.9 && hintsUsed <= 3) stars = 5;
    else if (firstTryRate >= 0.75) stars = 4;
    else if (firstTryRate >= 0.5 || hintsUsed <= 8) stars = 3;
    else stars = 2;
  }
  return { objectivePoints, objectiveMax, quizPoints, quizMax, total, max, stars, firstTryRate, hintsUsed };
}

// ── Findings / sequencing helpers ───────────────────────────────────────────

function findingsFor(workloadId) {
  return FINDINGS.filter((f) => f.workload === workloadId);
}

function cutoverSeqCorrect(seq) {
  return (
    seq.length === CUTOVER_STEPS.length &&
    seq.every((id, i) => id === CUTOVER_STEPS[i].id)
  );
}

function waveOrderCorrect(order) {
  const expected = WAVE_GROUPS.map((g) => g.id);
  return order.length === expected.length && order.every((id, i) => id === expected[i]);
}

function makeResult(pass, title, detail) {
  return { pass, title, detail };
}

function withLog(s, line) {
  return { ...s, log: [...s.log.slice(-59), line] };
}

// ── Tiny store: immutable updates + subscribe/notify ────────────────────────
// tag "action" → full re-render; tag "tick" → partial re-render (transfer sim)
const store = {
  state: null,
  listeners: [],
  get() {
    return this.state;
  },
  set(state) {
    this.state = state;
  },
  update(fn, tag = "action") {
    const next = fn(this.state);
    if (next === this.state) return;
    this.state = next;
    saveState(next); // same auto-save-on-every-change semantics as the original
    this.listeners.forEach((l) => l(tag));
  },
  subscribe(l) {
    this.listeners.push(l);
  },
};
