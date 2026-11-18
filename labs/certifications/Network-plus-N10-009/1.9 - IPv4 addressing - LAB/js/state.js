// ── Lab store — plain-JS state + localStorage persistence ──────────────────
// Faithful port of src/lib/lab/store.ts (zustand + persist):
//  • same state fields, same action semantics (incl. quiz pick/check/next guards)
//  • same storage key "octet-works-lab-v2" and same JSON envelope
//    {"state":{…},"version":0} so saves are interchangeable in shape/behavior
//  • same accounting rules in checkObjective / useHint / starsOf
"use strict";

var LabStore = (function () {
  const STORAGE_KEY = "octet-works-lab-v2";

  const freshEnv = () => ({
    dock: {
      read: [],
      m3cause: null,
      m3fix: null,
      h1: [],
      m6fault: null,
      m6mask: "",
      h8ip: "",
      h8hosts: [],
      h8action: null,
    },
    press: {
      m1: {},
      m2: [],
      m4: {},
      m11: [],
      h5: {},
    },
    bench: {
      ran: [],
      log: [],
      m5interp: null,
      h6: [],
    },
    solver: {
      m7a: {},
      m7b: {},
      m8: { network: "", broadcast: "", first: "", last: "" },
      m9: {},
      h4a: { network: "", broadcast: "", usable: "" },
      h4b: "",
    },
    loadout: {
      m12: {},
      m12sum: "",
      h2: {},
      h3sum: "",
    },
    plan: {
      m10: {},
      h7plan: null,
      h7just: "",
      h9plan: null,
      h9fig: "",
    },
  });

  const freshState = () => ({
    mode: "none",
    env: freshEnv(),
    objectives: {},
    quizPicked: {},
    quizChecked: {},
    quizCurrent: 0,
    quizAnswers: {},
    quizSubmitted: false,
    completionSeen: false,
  });

  let state = freshState();
  const listeners = new Set();

  function setPath(obj, path, value) {
    const keys = path.split(".");
    let cur = obj;
    for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
    cur[keys[keys.length - 1]] = value;
  }

  function getPath(obj, path) {
    const keys = path.split(".");
    let cur = obj;
    for (const k of keys) cur = cur[k];
    return cur;
  }

  // ── persistence (zustand persist-compatible envelope) ─────────────────────
  function save() {
    try {
      const partial = {
        mode: state.mode,
        env: state.env,
        objectives: state.objectives,
        quizPicked: state.quizPicked,
        quizChecked: state.quizChecked,
        quizCurrent: state.quizCurrent,
        quizAnswers: state.quizAnswers,
        quizSubmitted: state.quizSubmitted,
        completionSeen: state.completionSeen,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: partial, version: 0 }));
    } catch (e) {
      // storage unavailable (private mode / quota) — the lab keeps working in-memory
    }
  }

  function load() {
    let restored = false;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const s = parsed && parsed.state ? parsed.state : null;
        if (s && typeof s === "object") {
          const base = freshState();
          state = {
            ...base,
            ...s,
            env: {
              ...freshEnv(),
              ...(s.env || {}),
              dock: { ...freshEnv().dock, ...(s.env || {}).dock },
              press: { ...freshEnv().press, ...(s.env || {}).press },
              bench: { ...freshEnv().bench, ...(s.env || {}).bench },
              solver: { ...freshEnv().solver, ...(s.env || {}).solver },
              loadout: { ...freshEnv().loadout, ...(s.env || {}).loadout },
              plan: { ...freshEnv().plan, ...(s.env || {}).plan },
            },
          };
          restored = true;
        }
      }
    } catch (e) {
      state = freshState(); // corrupted save → pristine
    }
    return restored;
  }

  function notify(action) {
    listeners.forEach((fn) => fn(action));
  }

  // internal mutation helper: apply, persist, notify
  function commit(partial, action) {
    state = { ...state, ...partial };
    save();
    notify(action);
  }

  // ── actions (semantics identical to the original store) ───────────────────
  const actions = {
    setMode(m) {
      if (state.mode === m) return; // starting (or switching) a mode resets the fresh environment
      commit(
        {
          mode: m,
          env: freshEnv(),
          objectives: {},
          quizPicked: {},
          quizChecked: {},
          quizCurrent: 0,
          quizAnswers: {},
          quizSubmitted: false,
          completionSeen: false,
        },
        "setMode"
      );
    },

    checkObjective(id) {
      const def = OBJECTIVES.find((o) => o.id === id);
      if (!def) return { pass: false, feedback: "Unknown objective." };
      const result = def.validate(state.env);
      const prev = state.objectives[id] || { done: false, attempts: 0, fails: 0, hintsUsed: 0, lastFeedback: null };
      // accounting (net behavior of the original): attempts +1 always;
      // a failed check adds one fail; any passing check adds none.
      const next = {
        done: prev.done || result.pass,
        attempts: prev.attempts + 1,
        fails: result.pass ? prev.fails : prev.fails + 1,
        hintsUsed: prev.hintsUsed,
        lastFeedback: { ok: result.pass, text: result.feedback },
      };
      commit({ objectives: { ...state.objectives, [id]: next } }, "checkObjective");
      return result;
    },

    useHint(id) {
      const prev = state.objectives[id] || { done: false, attempts: 0, fails: 0, hintsUsed: 0, lastFeedback: null };
      const max = state.mode === "hard" ? 1 : 3;
      if (prev.hintsUsed >= max) return;
      commit(
        {
          objectives: {
            ...state.objectives,
            [id]: { ...prev, hintsUsed: prev.hintsUsed + 1, lastFeedback: prev.lastFeedback },
          },
        },
        "useHint"
      );
    },

    setEnvPath(path, value) {
      const env = structuredClone(state.env);
      setPath(env, path, value);
      commit({ env }, "setEnvPath:" + path);
    },

    // set a key inside a Record<string, …> field (keys may contain dots, e.g. IPs)
    setEnvRecord(ns, field, key, value) {
      const env = structuredClone(state.env);
      env[ns][field][key] = value;
      commit({ env }, `setEnvRecord:${ns}.${field}`);
    },

    toggleEnvArr(path, item) {
      const env = structuredClone(state.env);
      const arr = getPath(env, path);
      const i = arr.indexOf(item);
      if (i >= 0) arr.splice(i, 1);
      else arr.push(item);
      setPath(env, path, arr);
      commit({ env }, "toggleEnvArr:" + path);
    },

    pushBench(cmd, out, ok) {
      const env = structuredClone(state.env);
      const norm = cmd.trim().toLowerCase().replace(/\s+/g, " ");
      env.bench.log = [...env.bench.log, { cmd, out, ok }].slice(-60);
      if (!env.bench.ran.includes(norm)) env.bench.ran = [...env.bench.ran, norm];
      commit({ env }, "pushBench");
    },

    // quiz mechanics: pick is editable until CHECK locks it; answers store checked picks only
    pickQuiz(qid, idx) {
      if (state.quizChecked[qid]) return;
      commit({ quizPicked: { ...state.quizPicked, [qid]: idx } }, "pickQuiz");
    },

    checkQuiz(qid) {
      const picked = state.quizPicked[qid];
      if (picked === undefined || state.quizChecked[qid]) return; // must pick; one check only
      commit(
        { quizChecked: { ...state.quizChecked, [qid]: true }, quizAnswers: { ...state.quizAnswers, [qid]: picked }, quizSubmitted: false },
        "checkQuiz"
      );
    },

    nextQuiz(total) {
      // enforced forward-only progression: next question only after current is checked
      const quiz = state.mode === "medium" ? QUIZ_MEDIUM : QUIZ_HARD;
      const currentId = (quiz[state.quizCurrent] || {}).id;
      if (!currentId || !state.quizChecked[currentId]) return;
      const next = state.quizCurrent + 1;
      if (next >= total) {
        commit({ quizCurrent: total - 1, quizSubmitted: true }, "nextQuiz");
        return;
      }
      commit({ quizCurrent: next }, "nextQuiz");
    },

    setCompletionSeen() {
      commit({ completionSeen: true }, "setCompletionSeen");
    },

    resetAll() {
      commit(
        {
          mode: "none",
          env: freshEnv(),
          objectives: {},
          quizPicked: {},
          quizChecked: {},
          quizCurrent: 0,
          quizAnswers: {},
          quizSubmitted: false,
          completionSeen: false,
        },
        "resetAll"
      );
    },
  };

  // ── derived helpers (identical formulas) ───────────────────────────────────
  const objectivesForMode = (mode) =>
    mode === "medium"
      ? OBJECTIVES.filter((o) => o.id.startsWith("OBJ-M"))
      : mode === "hard"
        ? OBJECTIVES.filter((o) => o.id.startsWith("OBJ-H"))
        : [];

  const starsOf = (objectives, mode) => {
    let hints = 0;
    let fails = 0;
    for (const id of Object.keys(objectives)) {
      if (mode === "medium" ? !id.startsWith("OBJ-M") : !id.startsWith("OBJ-H")) continue;
      hints += objectives[id].hintsUsed;
      fails += objectives[id].fails;
    }
    const hintCost = mode === "hard" ? 1.0 : 0.5;
    const raw = 5 - hintCost * hints - 0.25 * fails;
    return Math.max(1, Math.round(raw * 100) / 100);
  };

  return {
    get state() { return state; },
    actions,
    objectivesForMode,
    starsOf,
    subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
    load,
    freshEnv,
  };
})();
