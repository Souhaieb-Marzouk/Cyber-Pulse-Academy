/* ======================================================================
   GATEHOUSE lab — state store + localStorage persistence + pub/sub
   Ported 1:1 from src/lib/lab/store.ts (zustand → plain JS).
   - SAME storage key and JSON shape ({state, version}) as the original,
     so progress survives a switch between the framework lab and this port.
   - SAME action semantics: patch/checkObjective/useHint/answerQuiz/
     submitQuiz/openCompletion/closeCompletion/log/resetAll.
   - pushLedger derives ids from max(existing)+1 (fix #17 in the original's
     ledger: no duplicate keys after a reload).
   Subscribers receive (next, prev) and re-render only what they own.
   ====================================================================== */

const STORAGE_KEY = "gatehouse-n10009-41-v1";
const STORAGE_VERSION = 1;

const STATION_PHASE = {
  vault: "ACCT",
  badge: "AUTHN",
  federation: "AUTHN",
  directory: "AUTHN",
  radio: "AUTHN",
  gate: "AUTHN",
  roles: "AUTHZ",
  clock: "AUTHZ",
  audit: "ACCT",
  harden: "AUTHZ",
};

let ledgerSeq = 1;

function nowStamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function pushLedger(ledger, phase, msg) {
  /* id derived from the ledger itself (max + 1) so ids never collide after a
     reload, when the module-level counter resets but persisted ids remain. */
  const nextId = ledger.length ? Math.max(...ledger.map((e) => e.id)) + 1 : ledgerSeq++;
  const entry = { id: nextId, t: nowStamp(), phase, msg };
  const next = [...ledger, entry];
  return next.slice(-200);
}

/* ---------- persisted slice: same keys as the original's zustand persist ---------- */
const PERSISTED = [
  "mode", "active", "env", "obj", "quizAnswers",
  "quizSubmitted", "completionSeen", "gradeDismissed", "ledger",
];

function save(state) {
  try {
    const payload = { state: {}, version: STORAGE_VERSION };
    for (const k of PERSISTED) payload.state[k] = state[k];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    /* quota/private-mode: degrade gracefully, never crash the lab */
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed.state ?? null : null;
  } catch (e) {
    return null;
  }
}

/* ---------- store ---------- */
const state = {
  mode: "select",
  active: "vault",
  env: initialEnv(),
  obj: {},
  quizAnswers: {},
  quizSubmitted: false,
  completionSeen: false,
  gradeDismissed: false,
  ledger: [],
};

/* rehydrate (same merge semantics as zustand persist: persisted state wins) */
(function rehydrate() {
  const saved = load();
  if (!saved) return;
  for (const k of PERSISTED) {
    if (saved[k] !== undefined) state[k] = saved[k];
  }
  /* shape guard: if a persisted env predates the current schema, fall back
     to a pristine env instead of throwing on missing sub-objects. */
  try {
    const probe = state.env.vault.cls;
    if (!probe || typeof probe !== "object") throw new Error("bad env");
  } catch (e) {
    state.env = initialEnv();
  }
})();

const listeners = new Set();
function notify(prev) {
  save(state);
  listeners.forEach((fn) => {
    try { fn(state, prev); } catch (err) { console.error("listener error", err); }
  });
}
function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/* ---------- actions (semantics identical to the original store) ---------- */
function setActive(s) {
  const prev = { ...state };
  state.active = s;
  notify(prev);
}

function setMode(m) {
  const prev = { ...state };
  state.mode = m;
  state.ledger = pushLedger(
    state.ledger, "ACCT",
    `shift started — ${m === "hard" ? "NIGHT SHIFT (hard)" : "DAY SHIFT (medium)"}`
  );
  notify(prev);
}

function patch(st, p, phase, msg) {
  const prev = { ...state };
  state.env = { ...state.env, [st]: { ...state.env[st], ...p } };
  state.ledger = pushLedger(
    state.ledger,
    phase ?? STATION_PHASE[st] ?? "ACCT",
    msg ?? `state updated in ${String(st)}`
  );
  notify(prev);
}

function checkObjective(id) {
  const prev = { ...state };
  const v = validateObjective(id, state.env);
  const p = state.obj[id] ?? {
    done: false,
    attempts: 0,
    firstAttempt: false,
    hintsUsed: 0,
    lastPass: null,
    feedback: "",
  };
  const next = {
    ...p,
    attempts: p.attempts + 1,
    done: v.pass,
    firstAttempt: v.pass && p.attempts === 0,
    lastPass: v.pass,
    feedback: v.fb,
  };
  state.obj = { ...state.obj, [id]: next };
  state.ledger = pushLedger(
    state.ledger, "ACCT",
    `CHECK ${id.replace("OBJ-", "")} → ${v.pass ? "PASS ✓" : "RETRY"}`
  );
  notify(prev);
  return v;
}

function useHint(id, tier) {
  const prev = { ...state };
  const p = state.obj[id] ?? {
    done: false,
    attempts: 0,
    firstAttempt: false,
    hintsUsed: 0,
    lastPass: null,
    feedback: "",
  };
  state.obj = {
    ...state.obj,
    [id]: { ...p, hintsUsed: p.hintsUsed + 1 },
  };
  state.ledger = pushLedger(state.ledger, "ACCT", `hint opened for ${id.replace("OBJ-", "")} (tier: ${tier})`);
  notify(prev);
}

function answerQuiz(qid, sel) {
  const prev = { ...state };
  state.quizAnswers = { ...state.quizAnswers, [qid]: sel };
  notify(prev);
}

function submitQuiz() {
  const prev = { ...state };
  state.quizSubmitted = true;
  state.ledger = pushLedger(state.ledger, "ACCT", "final quiz submitted — shift grade computed");
  notify(prev);
}

function openCompletion() {
  const prev = { ...state };
  state.completionSeen = true;
  notify(prev);
}

function closeCompletion() {
  const prev = { ...state };
  state.completionSeen = false;
  state.gradeDismissed = state.gradeDismissed || true;
  notify(prev);
}

function log(phase, msg) {
  const prev = { ...state };
  state.ledger = pushLedger(state.ledger, phase, msg);
  notify(prev);
}

function resetAll() {
  const prev = { ...state };
  state.mode = "select";
  state.active = "vault";
  state.env = initialEnv();
  state.obj = {};
  state.quizAnswers = {};
  state.quizSubmitted = false;
  state.completionSeen = false;
  state.gradeDismissed = false;
  state.ledger = [];
  notify(prev);
}
