// ─────────────────────────────────────────────────────────────────────────────
// js/state.js — state store, persistence, scoring
// Single plain-JS state object with a tiny subscribe/notify store. Same
// localStorage key, save/restore/RESET semantics and rating formula as the
// original framework lab. Graceful degradation when storage is unavailable.
// ─────────────────────────────────────────────────────────────────────────────

const emptyEnv = {
    openItem: null,
    clips: [],
    itemTags: {},
    intake: {},
    lifecycle: [],
    discipline: {},
    altitudes: {},
    hardening: [],
    response: [],
    typing: {},
    confidence: {},
    fpFlag: [],
    known: {},
    watch: {},
    techMap: {},
    telemetry: {},
    chain: [],
    timeline: [],
    evolve: {},
    dispatch: {},
    tlp: {},
    rule: [
        { field: '', op: '', value: '' },
        { field: '', op: '', value: '' },
    ],
    logCalls: [],
    h1Select: [],
    h1Tags: {},
    h9Brief: '',
    h9Risks: [],
};
function freshState() {
    return {
        v: 1,
        mode: null,
        objectives: {},
        env: { ...emptyEnv, rule: emptyEnv.rule.map((r) => ({ ...r })) },
        quizAnswers: {},
        quizSubmitted: {},
        completedModes: {},
        visitedIntro: false,
    };
}

const STORAGE_KEY = 'cyberlab.cysa.2-1.v1';
// ── Persistence (graceful degradation) ───────────────────────────────────────
function loadState() {
    if (typeof window === 'undefined')
        return null;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return null;
        const parsed = JSON.parse(raw);
        if (parsed && parsed.v === 1 && parsed.env && parsed.objectives) {
            // merge missing keys so older saves stay loadable
            const base = freshState();
            const merged = { ...base, ...parsed, env: { ...base.env, ...parsed.env } };
            // normalize legacy saves: v1.0 stored a single global quizSubmitted boolean
            const legacy = parsed;
            if (typeof legacy.quizSubmitted === 'boolean') {
                merged.quizSubmitted = legacy.quizSubmitted ? { medium: true, hard: true } : {};
            }
            return merged;
        }
        return null;
    }
    catch {
        return null;
    }
}
function saveState(s) {
    if (typeof window === 'undefined')
        return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    }
    catch {
        // storage unavailable / full — run without persistence
    }
}
function clearState() {
    if (typeof window === 'undefined')
        return;
    try {
        window.localStorage.removeItem(STORAGE_KEY);
    }
    catch {
        /* noop */
    }
}
// ── Objective state helpers ──────────────────────────────────────────────────
function objState(s, id) {
    return s.objectives[id] ?? { done: false, attempts: 0, hints: 0, firstTry: false, lastResult: null };
}
function runCheck(s, objective) {
    const prev = objState(s, objective.id);
    const result = objective.check(s.env);
    const attempts = prev.attempts + 1;
    const firstTry = result.pass && prev.attempts === 0;
    const next = {
        ...s,
        objectives: {
            ...s.objectives,
            [objective.id]: {
                ...prev,
                done: prev.done || result.pass,
                attempts,
                firstTry: firstTry || prev.firstTry,
                lastResult: result.pass ? 'pass' : 'fail',
            },
        },
    };
    return { state: next, outcome: { ...result, feedback: objective.feedback, objective } };
}
function applyHint(s, objective) {
    const prev = objState(s, objective.id);
    const max = objective.hints.length;
    return {
        ...s,
        objectives: {
            ...s.objectives,
            [objective.id]: { ...prev, hints: Math.min(prev.hints + 1, max) },
        },
    };
}
// ── Progress & scoring ───────────────────────────────────────────────────────
function objectivesOf(mode) {
    return objectivesForMode(mode);
}
function progressOf(mode, s) {
    const list = objectivesOf(mode);
    const done = list.filter((o) => objState(s, o.id).done).length;
    return { done, total: list.length, pct: list.length ? done / list.length : 0 };
}
function quizOf(mode) {
    return mode === 'hard' ? QUIZ_HARD : QUIZ_MEDIUM;
}
function quizScore(mode, s) {
    const items = quizOf(mode);
    const correct = items.filter((q) => s.quizAnswers[q.id] === q.correct).length;
    return { correct, total: items.length, pct: items.length ? correct / items.length : 0 };
}
function ratingOf(mode, s) {
    const list = objectivesOf(mode);
    let sum = 0;
    let max = 0;
    let firstTry = 0;
    let hints = 0;
    for (const o of list) {
        const st = objState(s, o.id);
        max += 1.25;
        if (st.done) {
            let pts = 1;
            if (st.firstTry) {
                pts += 0.25;
                firstTry += 1;
            }
            pts -= st.hints * (o.mode === 'hard' ? 0.15 : 0.06);
            sum += Math.max(pts, 0.6);
        }
        hints += st.hints;
    }
    const objPct = max > 0 ? sum / max : 0;
    const quiz = quizScore(mode, s);
    const pct = 0.65 * objPct + 0.35 * quiz.pct;
    const stars = pct >= 0.9 ? 5 : pct >= 0.75 ? 4 : pct >= 0.6 ? 3 : pct >= 0.4 ? 2 : 1;
    return {
        stars,
        pct,
        objPct,
        quizPct: quiz.pct,
        firstTryPct: list.length ? firstTry / list.length : 0,
        hintPenalty: hints,
    };
}
// ── Global validation sanity (dev aid — also guards data drift) ──────────────
function sanityCounts() {
    const m = OBJECTIVES.filter((o) => o.mode === 'medium').length;
    const h = OBJECTIVES.filter((o) => o.mode === 'hard').length;
    return { medium: m, hard: h };
}
const listeners = new Set();
// Module-scope init on the client only — SSR keeps snapshot null (server splash).
let snapshot = typeof window !== 'undefined' ? loadState() ?? freshState() : null;
const labStore = {
    subscribe(l) {
        listeners.add(l);
        return () => {
            listeners.delete(l);
        };
    },
    get() {
        return snapshot;
    },
    set(fn) {
        if (!snapshot)
            snapshot = freshState();
        snapshot = fn(snapshot);
        saveState(snapshot);
        for (const l of listeners)
            l();
    },
};
