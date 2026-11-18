// ── LZ-MERIDIAN static · state.js ──
// Ported 1:1 from src/lib/lab/state.ts (types erased; logic and strings untouched).
'use strict';
// ── LZ-MERIDIAN · Lab state, persistence & scoring ─────────────────────────

const STORAGE_KEY = 'lz-meridian-lab-v1';
const STATE_VERSION = 1;

function initialEnv(mode) {
  return {
    workloadAssign: {},
    manifestAssign: mode === 'hard'
      ? Object.fromEntries(H1_MANIFEST.map((w) => [w.id, w.seeded]))
      : {},
    respBoard: {},
    depMatch: {},
    conceptSort: {},
    nfvBoard: {},
    nfvReasons: {},
    vpc: mode === 'hard'
      ? {
          cidr: '10.20.0.0/16', // Flaw 1: collides with HQ
          subnets: H2_SEED_SUBNETS.map((s) => ({ ...s })), // db seeded public (Flaw 2)
          routeTarget: 'igw', // Flaw 3: wrong target
        }
      : { cidr: null, subnets: [], routeTarget: null },
    gatewayPlan: {},
    seqOrder: [],
    nsgRules: SEED_NSG_RULES.map((r) => ({ ...r })),
    packetRuns: [],
    m9: { outboundVerdict: null, probeVerdict: null, reasonKey: null, nslKey: null },
    flowTriage: { cause: null, fixPort: null, fixPriority: null },
    h7Answer: null,
    connChoice: {},
    notEncrypted: null,
  };
}

function objectivesFor(mode) {
  return OBJECTIVES.filter((o) => o.mode === mode).sort((a, b) => a.order - b.order);
}

function initialLabState(mode = null) {
  return {
    version: STATE_VERSION,
    mode,
    phase: 'mode',
    visited: {},
    env: initialEnv(mode ?? 'medium'),
    objectives: {},
    quiz: { answers: {}, submitted: false, correct: 0 },
    completion: null,
  };
}

// ── Persistence (graceful on failure) ──────────────────────────────────────
function loadLabState() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version !== STATE_VERSION) return null;
    if (parsed.mode !== 'medium' && parsed.mode !== 'hard') return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveLabState(state) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable/quota — degrade gracefully, lab stays in-memory
  }
}

function clearLabState() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

// ── Scoring ────────────────────────────────────────────────────────────────

function computeScore(state) {
  const objs = objectivesFor(state.mode ?? 'medium');
  const doneObjs = objs.filter((o) => state.objectives[o.id]?.done);
  const objRate = objs.length === 0 ? 0 : doneObjs.filter((o) => state.objectives[o.id]?.firstAttempt).length / objs.length;
  const quizTotal = QUIZ.filter((q) => q.mode === state.mode).length;
  const quizAcc = quizTotal === 0 ? 0 : state.quiz.correct / quizTotal;
  let hintUnits = 0;
  for (const o of doneObjs) {
    const used = state.objectives[o.id]?.hintsUsed ?? 0;
    hintUnits += state.mode === 'hard' ? used * 2 : used;
  }
  const hintPenalty = Math.min(15, hintUnits * 3);
  const scorePct = Math.max(0, Math.min(100, Math.round(100 * (0.65 * objRate + 0.35 * quizAcc) - hintPenalty)));
  const stars = scorePct >= 95 ? 5 : scorePct >= 85 ? 4 : scorePct >= 70 ? 3 : scorePct >= 55 ? 2 : 1;
  return { scorePct, stars, at: Date.now() };
}

function allObjectivesDone(state) {
  if (!state.mode) return false;
  return objectivesFor(state.mode).every((o) => state.objectives[o.id]?.done);
}
