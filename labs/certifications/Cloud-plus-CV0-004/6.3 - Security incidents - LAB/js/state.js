// ── Exercise CLOUDBURST · engine: state, reducer, persistence, scoring (verbatim) + tiny store ─
// Ported 1:1 from the framework lab (src/lib/lab). Content, wording, answers,
// hints and validation logic are unchanged. Plain classic script (no modules)
// so the lab also runs from file:// after extraction.

// ── Exercise CLOUDBURST · engine: state, reducer, persistence, scoring ───────
const STORAGE_KEY = "cloudburst-cv0004-63-v1";
// v2: quiz answer-lock contract (QA fix) — old v1 saves are discarded cleanly.
const STATE_VERSION = 2;
function initialEnv() {
    const keys = {
        [INCIDENT.leakedKey]: { active: true, deleted: false },
        [INCIDENT.backupKey]: { active: true, deleted: false },
        SFDNW5C2K8RQ1M7XT3VB: { active: true, deleted: false },
        SFMOS1Z7Q4NV6K2X8PLD: { active: true, deleted: false },
        [INCIDENT.attackerUserKey]: { active: true, deleted: false },
    };
    const users = {
        "svc-billing-ci": { exists: true, quarantined: false },
        "dana.whitfield": { exists: true, quarantined: false },
        "marcus.osei": { exists: true, quarantined: false },
        "ci-runner-ops": { exists: true, quarantined: false },
        [INCIDENT.attackerUser]: { exists: true, quarantined: false },
    };
    return {
        clock: 0,
        keys,
        users,
        policyAttached: true,
        hardening: {
            "h-scan": false,
            "h-leastpriv": false,
            "h-temptokens": false,
            "h-storage-logs": true,
            "h-mfa": true,
            "h-public": false,
            "h-quiet": false,
        },
        contained: false,
        liveRevealed: 0,
        actionLog: [],
    };
}
function initialState() {
    return {
        version: STATE_VERSION,
        hydrated: false,
        reportSeen: false,
        mode: null,
        stage: "select",
        env: initialEnv(),
        answers: {},
        objectives: {},
        quizIndex: 0,
        quizAnswers: [],
        quizChecked: [],
        quizSubmitted: false,
        completed: false,
        nudgeUsed: false,
    };
}
/**
 * Containment = the attacker can no longer authenticate.
 * True when the leaked key is deactivated AND the malicious principal is
 * quarantined — or has been fully removed (removal implies containment;
 * the phase rail and clock must never regress to "live" after eradication).
 */
function isContained(env) {
    const k = env.keys[INCIDENT.leakedKey];
    const u = env.users[INCIDENT.attackerUser];
    const principalNeutralized = !!u && (u.quarantined || !u.exists);
    return !!k && !k.active && principalNeutralized;
}
function reducer(state, action) {
    switch (action.type) {
        case "HYDRATE":
            return { ...action.state, hydrated: true };
        case "SET_MODE":
            return { ...initialState(), hydrated: state.hydrated, mode: action.mode, stage: "briefing" };
        case "GOTO":
            return { ...state, stage: action.stage };
        case "KEY_DEACTIVATE": {
            const key = state.env.keys[action.id];
            if (!key || key.deleted || !key.active)
                return state;
            const env = { ...state.env, keys: { ...state.env.keys, [action.id]: { ...key, active: false } } };
            env.actionLog = [...state.env.actionLog, `deact:${action.id}`];
            // latch: once contained, the mission clock and banners never regress
            env.contained = state.env.contained || isContained(env);
            return { ...state, env };
        }
        case "KEY_DELETE": {
            const key = state.env.keys[action.id];
            if (!key || key.deleted)
                return state;
            const env = { ...state.env, keys: { ...state.env.keys, [action.id]: { ...key, deleted: true, active: false } } };
            env.actionLog = [...state.env.actionLog, `del:${action.id}`];
            env.contained = state.env.contained || isContained(env);
            return { ...state, env };
        }
        case "USER_QUARANTINE": {
            const u = state.env.users[action.id];
            if (!u || !u.exists || u.quarantined)
                return state;
            const env = { ...state.env, users: { ...state.env.users, [action.id]: { ...u, quarantined: true } } };
            env.actionLog = [...state.env.actionLog, `quarantine:${action.id}`];
            env.contained = state.env.contained || isContained(env);
            return { ...state, env };
        }
        case "USER_DELETE": {
            const u = state.env.users[action.id];
            if (!u || !u.exists)
                return state;
            const nextKeys = { ...state.env.keys };
            for (const kid of action.keys) {
                if (nextKeys[kid])
                    nextKeys[kid] = { ...nextKeys[kid], deleted: true, active: false };
            }
            const env = {
                ...state.env,
                keys: nextKeys,
                users: { ...state.env.users, [action.id]: { ...u, exists: false, quarantined: false } },
            };
            // Deleting a principal removes its policy attachments (real IAM semantics).
            // Root-cause fix for the dead-end where deleting deploy-helper-2 first
            // orphaned BillingFullAccess with its only detach affordance gone.
            if (env.policyAttached && action.id === INCIDENT.attackerUser) {
                env.policyAttached = false;
            }
            env.actionLog = [...state.env.actionLog, `deluser:${action.id}`];
            env.contained = state.env.contained || isContained(env);
            return { ...state, env };
        }
        case "POLICY_DETACH": {
            if (!state.env.policyAttached)
                return state;
            const env = { ...state.env, policyAttached: false };
            env.actionLog = [...state.env.actionLog, "detach:BillingFullAccess"];
            return { ...state, env };
        }
        case "TOGGLE_HARDENING":
            return {
                ...state,
                env: {
                    ...state.env,
                    hardening: { ...state.env.hardening, [action.id]: !state.env.hardening[action.id] },
                },
            };
        case "ADVANCE_CLOCK": {
            if (state.mode !== "hard" || state.env.clock >= 6)
                return state;
            const clock = state.env.clock + 1;
            let env = { ...state.env, clock };
            if (!env.contained) {
                const reveals = [];
                if (clock >= 2 && env.liveRevealed < 1) {
                    env = { ...env, liveRevealed: 1 };
                    reveals.push("ev-L1");
                }
                if (clock >= 3 && env.liveRevealed < 2) {
                    env = {
                        ...env,
                        liveRevealed: 2,
                        users: { ...env.users, [INCIDENT.supportBot]: { exists: true, quarantined: false } },
                        keys: { ...env.keys, [KEY_BOT_ID]: { active: true, deleted: false } },
                    };
                    reveals.push("ev-L2");
                }
                if (reveals.length > 0)
                    env.actionLog = [...env.actionLog];
            }
            return { ...state, env };
        }
        case "SET_ANSWER":
            return { ...state, answers: { ...state.answers, [action.key]: action.value } };
        case "CHECK": {
            const prev = state.objectives[action.id];
            const firstTry = (prev?.attempts ?? 0) === 0 && action.result.pass;
            return {
                ...state,
                objectives: {
                    ...state.objectives,
                    [action.id]: {
                        attempts: (prev?.attempts ?? 0) + 1,
                        passed: action.result.pass || !!prev?.passed,
                        firstTry: firstTry || !!prev?.firstTry,
                        hints: prev?.hints ?? 0,
                    },
                },
            };
        }
        case "HINT": {
            const prev = state.objectives[action.id];
            return {
                ...state,
                objectives: {
                    ...state.objectives,
                    [action.id]: { attempts: 0, passed: false, firstTry: false, hints: (prev?.hints ?? 0) + 1, ...(prev?.passed ? { passed: true, firstTry: prev.firstTry, attempts: prev.attempts } : {}) },
                },
            };
        }
        case "NUDGE": {
            const prev = state.objectives[action.id];
            return {
                ...state,
                nudgeUsed: true,
                objectives: {
                    ...state.objectives,
                    [action.id]: { attempts: prev?.attempts ?? 0, passed: prev?.passed ?? false, firstTry: prev?.firstTry ?? false, hints: (prev?.hints ?? 0) + 2 },
                },
            };
        }
        case "QUIZ_ANSWER": {
            // R2: an already-checked (locked) question can never be re-answered.
            if (state.quizChecked[state.quizIndex])
                return state;
            const answers = [...state.quizAnswers];
            answers[state.quizIndex] = action.value;
            return { ...state, quizAnswers: answers };
        }
        case "QUIZ_CHECK": {
            // R2/R3: checking locks the just-validated answer for this question.
            const current = state.quizAnswers[state.quizIndex];
            if (current === null || current === undefined)
                return state;
            if (state.quizChecked[state.quizIndex])
                return state;
            const checked = [...state.quizChecked];
            checked[state.quizIndex] = true;
            return { ...state, quizChecked: checked };
        }
        case "QUIZ_NAV":
            return { ...state, quizIndex: Math.max(0, state.quizIndex + action.delta) };
        case "QUIZ_SUBMIT":
            return { ...state, quizSubmitted: true };
        case "REPORT_SEEN":
            return { ...state, reportSeen: true };
        case "COMPLETE":
            return { ...state, completed: true };
        case "RESET":
            return { ...initialState(), hydrated: state.hydrated };
        default:
            return state;
    }
}
const KEY_BOT_ID = "SFBOT7N2QX8V4K1M9PZR";
function progressOf(state, quizTotal, quizCorrect) {
    const objs = (0, objectivesFor)(state.mode ?? "medium");
    const total = objs.length;
    let passed = 0;
    let firstTry = 0;
    let hints = 0;
    const byPillar = {};
    let currentPhase = "LEARN";
    for (const o of objs) {
        const st = state.objectives[o.id];
        const isPassed = !!st?.passed;
        if (isPassed)
            passed += 1;
        if (isPassed && st?.firstTry)
            firstTry += 1;
        hints += st?.hints ?? 0;
        byPillar[o.pillar] = byPillar[o.pillar] ?? { passed: 0, total: 0 };
        byPillar[o.pillar].total += 1;
        if (isPassed)
            byPillar[o.pillar].passed += 1;
    }
    const firstUn = objs.find((o) => !state.objectives[o.id]?.passed);
    currentPhase = firstUn ? firstUn.phase : "LEARN";
    const allPassed = passed === total && total > 0;
    const firstTryRate = total ? firstTry / total : 0;
    const quizUnlocked = passed >= Math.ceil(total * 0.8);
    const hintsUsed = hints + (state.nudgeUsed ? 1 : 0);
    let stars = 1;
    if (state.mode === "hard") {
        if (firstTryRate >= 0.7 && !state.nudgeUsed && hints === 0)
            stars = 3;
        else if (firstTryRate >= 0.4)
            stars = 2;
    }
    else {
        if (firstTryRate >= 0.75 && hints <= 2)
            stars = 3;
        else if (firstTryRate >= 0.45)
            stars = 2;
    }
    const objScore = total ? passed / total : 0;
    const quizScore = quizTotal ? quizCorrect / quizTotal : 0;
    const score = Math.round(100 * (0.7 * objScore + 0.3 * quizScore));
    return { total, passed, byPillar, currentPhase, quizUnlocked, allPassed, firstTryRate, hintsUsed, stars, score };
}
// ── persistence (F3) ─────────────────────────────────────────────────────────
function loadState() {
    if (typeof window === "undefined")
        return null;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return null;
        const parsed = JSON.parse(raw);
        if (parsed?.version !== STATE_VERSION)
            return null;
        // merge defensively over a fresh skeleton so new fields never break old saves
        const base = initialState();
        return {
            ...base,
            ...parsed,
            hydrated: true,
            env: { ...initialEnv(), ...parsed.env },
            answers: parsed.answers ?? {},
            objectives: parsed.objectives ?? {},
            quizAnswers: parsed.quizAnswers ?? [],
            quizChecked: parsed.quizChecked ?? [],
        };
    }
    catch {
        return null;
    }
}
function saveState(state) {
    if (typeof window === "undefined")
        return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
    catch {
        // localStorage unavailable (private mode / quota): degrade gracefully — lab still works in-memory
    }
}
function clearState() {
    if (typeof window === "undefined")
        return;
    try {
        window.localStorage.removeItem(STORAGE_KEY);
    }
    catch {
        // ignore
    }
}


// ── tiny store: the useReducer/useEffect pair of the original, in plain JS ──
const LabStore = {
  state: null,
  _listeners: [],
  init() { this.state = initialState(); },
  dispatch(action) {
    const next = reducer(this.state, action);
    if (next !== this.state) {           // same bail-out contract as React
      this.state = next;
      for (const fn of this._listeners) fn(this.state);
    }
    return next;
  },
  subscribe(fn) { this._listeners.push(fn); },
  persist() { if (this.state.hydrated) saveState(this.state); }, // save every change (F3)
};
