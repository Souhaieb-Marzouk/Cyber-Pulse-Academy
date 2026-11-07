// THE ISOLATION FOUNDRY — js/state.js
// State engine: pristine state factories, capacity math, the action reducer,
// star scoring, localStorage persistence, and a tiny subscribe/notify store
// that replaces React useReducer + context from the framework build.
// Transpiled 1:1 from the framework's engine.ts (reducer/scoring/persistence);
// the store section at the bottom is the only newly written code.
(function (F) {
  "use strict";
  var OBJECTIVES = F.OBJECTIVES;
  var QUIZ = F.QUIZ;
  var HOSTS = F.HOSTS;
  var INTAKE = F.INTAKE;
  var RUNTIMES = F.RUNTIMES;
  var STACK_ITEMS = F.STACK_ITEMS;
  var HYPERVISOR_ITEMS = F.HYPERVISOR_ITEMS;
  var ACCEL_ITEMS = F.ACCEL_ITEMS;
  var MANIFEST_FIELDS = F.MANIFEST_FIELDS;
  var TELEMETRY_QS = F.TELEMETRY_QS;
  var REPLICA_QS = F.REPLICA_QS;
  var SEQ_MED_CORRECT = F.SEQ_MED_CORRECT;
  var ROLE_TRAITS = F.ROLE_TRAITS;
  var SURVEY_ANSWERS = F.SURVEY_ANSWERS;
  var SEQ_HARD_CORRECT = F.SEQ_HARD_CORRECT;
  var RUNBOOK_CORRECT = F.RUNBOOK_CORRECT;
  var RUNBOOK_STEPS = F.RUNBOOK_STEPS;
  var AUDIT_ROWS = F.AUDIT_ROWS;
  var SCALE_ANSWERS = F.SCALE_ANSWERS;
  var FAAS_CORRECT = F.FAAS_CORRECT;
  var TENANCY_ROWS = F.TENANCY_ROWS;
  var TENANCY_RISK_CHOICES = F.TENANCY_RISK_CHOICES;

  // ==================== engine core (was engine.ts) ====================
  // (script order: data.js → objectives.js → state.js; validators live in objectives.js)

  var objectivesFor = F.objectivesFor; // cross-file dep of computeStars
  var validate = F.validate;           // cross-file dep of the reducer's check action

const STORAGE_KEY = "isolation-foundry-v1";
function pristineEnv() {
    return {
        seq: 0,
        placements: [],
        stackSort: {}, hypSort: {}, accelMatch: {}, manifest: {}, tf: {},
        telemetryQ: {}, snapVm: "", snapRisk: "", replicaQ: {}, seqMed: [], roleMap: {},
        survey: {},
        triage: { host: "", cause: "", lines: [] },
        seqHard: [],
        runbook: [], runbookTrap: false,
        auditIso: {},
        scaleChoice: "", scaleWhy: "",
        faasSel: [], faasExile: "",
        tenancy: {}, riskPick: "",
    };
}
function initialState() {
    return {
        v: 1, mode: null, stage: "gate",
        env: pristineEnv(),
        objs: {}, feedback: {}, quizAnswers: {}, quizChecked: {}, quizDone: false,
        completedShown: false, log: [],
    };
}
// ---------------- capacity helpers ----------------
function hostUsage(env, host) {
    let cpu = 0, ram = 0, slots = 0;
    for (const p of env.placements) {
        if (p.host !== host)
            continue;
        const spec = RUNTIMES[p.runtime];
        cpu += spec.cpu;
        ram += spec.ram;
        slots += spec.slots;
    }
    const cap = HOSTS.find((h) => h.id === host);
    return { cpu, ram, slots, cap };
}
function canFit(runtime, host, env) {
    const spec = RUNTIMES[runtime];
    const u = hostUsage(env, host);
    return u.cpu + spec.cpu <= u.cap.cpuCap && u.ram + spec.ram <= u.cap.ramCap && u.slots + spec.slots <= u.cap.slots;
}

function pushLog(s, text, kind = "info") {
    const n = s.log.length + 1;
    return [...s.log, { n, text, kind }].slice(-80);
}
function objP(s, id) {
    return s.objs[id] ?? { done: false, attempts: 0, hints: 0, firstTry: null };
}

function reducer(s, a) {
    switch (a.t) {
        case "mode":
            return { ...s, mode: a.mode, stage: "brief" };
        case "stage":
            return { ...s, stage: a.stage };
        case "reset":
            return initialState();
        case "restore":
            return a.state;
        case "place": {
            if (!canFit(a.runtime, a.host, s.env)) {
                return { ...s, log: pushLog(s, `FORGE REFUSED the pour: ${a.cardName} as ${RUNTIMES[a.runtime].label} does not fit ${a.host === "fl01" ? "FORGELINE-01" : "FORGELINE-02"} — overcommitment is a decision, not an accident. Free space or spread the floor.`, "bad") };
            }
            const p = { uid: `${a.cardId}-${s.env.seq + 1}`, cardId: a.cardId, runtime: a.runtime, host: a.host, ops: {} };
            return {
                ...s,
                env: { ...s.env, placements: [...s.env.placements, p], seq: s.env.seq + 1 },
                log: pushLog(s, `Cast ${a.cardName} as ${RUNTIMES[a.runtime].label} onto ${a.host === "fl01" ? "FORGELINE-01" : "FORGELINE-02"} · ${RUNTIMES[a.runtime].mold} mold`, "good"),
            };
        }
        case "remove":
            return {
                ...s,
                env: { ...s.env, placements: s.env.placements.filter((p) => p.uid !== a.uid) },
                log: pushLog(s, `Scrapped ${a.name} — capacity returned to the pool`),
            };
        case "toggleOp": {
            const placements = s.env.placements.map((p) => p.uid === a.uid ? { ...p, ops: { ...p.ops, [a.key]: !p.ops[a.key] } } : p);
            const label = {
                snapshot: "Snapshot", cpuReserve: "CPU reservation", memReserve: "Memory reservation",
                limit: "Resource limit", antiAffinity: "Anti-affinity",
            };
            const p = placements.find((q) => q.uid === a.uid);
            return {
                ...s,
                env: { ...s.env, placements },
                log: pushLog(s, `${label[a.key]} ${p.ops[a.key] ? "SET" : "CLEARED"} · ${p.cardId}`, p.ops[a.key] ? "good" : "info"),
            };
        }
        case "migrate": {
            const p = s.env.placements.find((q) => q.uid === a.uid);
            if (!p || p.host === a.to)
                return s;
            if (!canFit(p.runtime, a.to, s.env)) {
                return { ...s, log: pushLog(s, `MIGRATION REFUSED: no room on ${a.to === "fl01" ? "FORGELINE-01" : "FORGELINE-02"} for ${a.name}.`, "bad") };
            }
            return {
                ...s,
                env: { ...s.env, placements: s.env.placements.map((q) => (q.uid === a.uid ? { ...q, host: a.to } : q)) },
                log: pushLog(s, `Live migration: ${a.name} → ${a.to === "fl01" ? "FORGELINE-01" : "FORGELINE-02"} · zero downtime`, "good"),
            };
        }
        case "setSort":
            return { ...s, env: { ...s.env, [a.group === "stack" ? "stackSort" : "hypSort"]: { ...(a.group === "stack" ? s.env.stackSort : s.env.hypSort), [a.itemId]: a.bin } } };
        case "setAccel":
            return { ...s, env: { ...s.env, accelMatch: { ...s.env.accelMatch, [a.itemId]: a.opt } } };
        case "setManifest":
            return { ...s, env: { ...s.env, manifest: { ...s.env.manifest, [a.key]: a.val } } };
        case "setTf":
            return { ...s, env: { ...s.env, tf: { ...s.env.tf, [a.key]: a.val } } };
        case "setTelemetry":
            return { ...s, env: { ...s.env, telemetryQ: { ...s.env.telemetryQ, [a.key]: a.val } } };
        case "setSnap":
            return { ...s, env: { ...s.env, [a.part === "vm" ? "snapVm" : "snapRisk"]: a.val } };
        case "setReplica":
            return { ...s, env: { ...s.env, replicaQ: { ...s.env.replicaQ, [a.key]: a.val } } };
        case "seqMed": {
            if (s.env.seqMed.includes(a.stepId))
                return s;
            return { ...s, env: { ...s.env, seqMed: [...s.env.seqMed, a.stepId] } };
        }
        case "seqMedClear":
            return { ...s, env: { ...s.env, seqMed: [] } };
        case "setRole":
            return { ...s, env: { ...s.env, roleMap: { ...s.env.roleMap, [a.itemId]: a.opt } } };
        case "setSurvey": {
            const prev = s.env.survey[a.caseId] ?? { tech: "", why: "" };
            return { ...s, env: { ...s.env, survey: { ...s.env.survey, [a.caseId]: { ...prev, [a.part]: a.val } } } };
        }
        case "setTriage":
            return { ...s, env: { ...s.env, triage: { ...s.env.triage, [a.part]: a.val } } };
        case "toggleLine": {
            const has = s.env.triage.lines.includes(a.lineId);
            const lines = has ? s.env.triage.lines.filter((l) => l !== a.lineId) : [...s.env.triage.lines, a.lineId];
            return { ...s, env: { ...s.env, triage: { ...s.env.triage, lines } } };
        }
        case "seqHard": {
            if (s.env.seqHard.includes(a.stepId))
                return s;
            return { ...s, env: { ...s.env, seqHard: [...s.env.seqHard, a.stepId] } };
        }
        case "seqHardClear":
            return { ...s, env: { ...s.env, seqHard: [] } };
        case "runbook": {
            const step = RUNBOOK_STEPS.find((x) => x.id === a.stepId);
            if (s.env.runbook.includes(a.stepId))
                return s;
            if (step?.trap) {
                return { ...s, env: { ...s.env, runbookTrap: true, runbook: [...s.env.runbook, a.stepId] }, log: pushLog(s, `TRAP TRIPPED: "${step.label}" — sequence voided. Reset the runbook.`, "bad") };
            }
            return { ...s, env: { ...s.env, runbook: [...s.env.runbook, a.stepId] } };
        }
        case "runbookClear":
            return { ...s, env: { ...s.env, runbook: [], runbookTrap: false } };
        case "setIso":
            return { ...s, env: { ...s.env, auditIso: { ...s.env.auditIso, [a.rowId]: a.val } } };
        case "setScale":
            return { ...s, env: { ...s.env, [a.part === "choice" ? "scaleChoice" : "scaleWhy"]: a.val } };
        case "toggleFaas": {
            const has = s.env.faasSel.includes(a.jobId);
            const faasSel = has ? s.env.faasSel.filter((j) => j !== a.jobId) : [...s.env.faasSel, a.jobId];
            return { ...s, env: { ...s.env, faasSel } };
        }
        case "setExile":
            return { ...s, env: { ...s.env, faasExile: a.val } };
        case "setTenancy":
            return { ...s, env: { ...s.env, tenancy: { ...s.env.tenancy, [a.rowId]: a.val } } };
        case "setRisk":
            return { ...s, env: { ...s.env, riskPick: a.val } };
        case "check": {
            const res = validate(a.objId, s.env);
            const prev = objP(s, a.objId);
            const firstTry = prev.firstTry === null ? res.pass : prev.firstTry;
            const prog = {
                done: prev.done || res.pass,
                attempts: prev.attempts + 1,
                hints: prev.hints,
                firstTry,
                lastResult: res.pass ? "pass" : "fail",
            };
            return {
                ...s,
                objs: { ...s.objs, [a.objId]: prog },
                feedback: { ...s.feedback, [a.objId]: res },
                log: pushLog(s, `CHECK ${a.objId}: ${res.pass ? "ACCEPTED" : "REJECTED"}`, res.pass ? "good" : "bad"),
            };
        }
        case "hint": {
            const prev = objP(s, a.objId);
            return { ...s, objs: { ...s.objs, [a.objId]: { ...prev, hints: prev.hints + 1 } }, log: pushLog(s, `Hint opened on ${a.objId}${a.costNote ? " (star cost)" : ""}`) };
        }
        case "quizAnswer":
            return { ...s, quizAnswers: { ...s.quizAnswers, [a.qid]: a.opt } };
        case "quizCheck":
            if (s.quizChecked[a.qid] || s.quizAnswers[a.qid] == null)
                return s;
            return { ...s, quizChecked: { ...s.quizChecked, [a.qid]: true } };
        case "quizDone":
            return { ...s, quizDone: true };
        case "completedShown":
            return { ...s, completedShown: true };
        default:
            return s;
    }
}

function computeStars(objs, mode) {
    const list = objectivesFor(mode);
    const done = list.filter((o) => objs[o.id]?.done).length;
    const complete = done === list.length && list.length > 0;
    const firstTry = list.filter((o) => objs[o.id]?.firstTry === true).length;
    const hints = list.reduce((n, o) => n + (objs[o.id]?.hints ?? 0), 0);
    const penalty = mode === "medium" ? 0.2 : 0.35;
    const raw = complete ? 5 * (firstTry / list.length) - penalty * hints : 0;
    const stars = complete ? Math.max(1, Math.min(5, Math.round(raw * 2) / 2)) : 0;
    return { stars, complete };
}

  // ==================== persistence (was engine.ts) ====================

function loadState() {
    try {
        const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
        if (!raw)
            return null;
        const parsed = JSON.parse(raw);
        if (parsed?.v !== 1)
            return null;
        const base = initialState();
        return { ...base, ...parsed, env: { ...base.env, ...parsed.env }, objs: parsed.objs ?? {}, feedback: parsed.feedback ?? {}, quizChecked: parsed.quizChecked ?? {} };
    }
    catch {
        return null;
    }
}
function saveState(s) {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    }
    catch {
        // degrade gracefully: private mode / quota — lab stays usable in memory
    }
}
function clearState() {
    try {
        window.localStorage.removeItem(STORAGE_KEY);
    }
    catch {
        /* noop */
    }
}

  // ==================== store (static replacement for useReducer) ====================
  // Same semantics as the framework: one LabState, pure reducer, save on every
  // change, subscribe/notify for targeted region re-renders.

  var state = initialState();
  var listeners = [];

  function getState() { return state; }

  function subscribe(fn) {
    listeners.push(fn);
    return function unsubscribe() {
      listeners = listeners.filter(function (l) { return l !== fn; });
    };
  }

  function notify(action) {
    for (var i = 0; i < listeners.length; i++) listeners[i](state, action);
  }

  // Dispatch an action through the pure reducer, then persist + notify.
  function dispatch(action) {
    state = reducer(state, action);
    saveState(state);
    notify(action);
  }

  // Load a saved shift synchronously (before first render) — the static
  // equivalent of the framework's hydration effect. Returns true if restored.
  function restore() {
    var saved = loadState();
    if (saved) { state = saved; return true; }
    return false;
  }

  F.getState = getState;
  F.subscribe = subscribe;
  F.dispatch = dispatch;
  F.restore = restore;
  F.STORAGE_KEY = STORAGE_KEY;
  // engine internals used by the UI layer and tests
  F.initialState = initialState;
  F.pristineEnv = pristineEnv;
  F.hostUsage = hostUsage;
  F.canFit = canFit;
  F.reducer = reducer;
  F.computeStars = computeStars;
  F.loadState = loadState;
  F.saveState = saveState;
  F.clearState = clearState;
})(window.Foundry = window.Foundry || {});
