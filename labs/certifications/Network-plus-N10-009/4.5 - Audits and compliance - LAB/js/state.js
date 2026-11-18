/* ═══════════════════════════════════════════════════════════════════════════
   state.js — state store, persistence, scoring.
   Ported 1:1 from src/lib/lab/engine.ts. SAME localStorage key, SAME state
   shape, SAME save/restore/RESET semantics as the original framework lab.
   A tiny subscribe/notify mechanism replaces React re-renders.
   ═══════════════════════════════════════════════════════════════════════════ */

window.LAB_STORE = (function () {
  "use strict";

  const OBJ = window.LAB_OBJECTIVES;
  const D = window.LAB_DATA;

  const STORAGE_KEY = "mrg-audit-lab-n10094-v1";

  function defaultState() {
    return {
      version: 1,
      mode: null,            // "medium" | "hard" | null
      seenIntro: false,
      zone: "briefing",
      visited: [],
      env: {},               // widget answers keyed by objective envKey
      obj: {},               // per-objective {solved, wrong, hints, solvedFirstTry, last}
      quiz: { answers: {}, done: false },
      liveMsg: "",           // never persisted
      completed: false,
      startedAt: null,
    };
  }

  let state = defaultState();
  const listeners = []; // fn(reason, detail) — subscribers re-render slices

  // ── persistence (graceful degrade when storage is unavailable) ──
  function loadState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === 1) return Object.assign(defaultState(), parsed, { liveMsg: "" });
      return null;
    } catch (e) {
      return null;
    }
  }

  function saveState() {
    try {
      const s = Object.assign({}, state);
      delete s.liveMsg;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch (e) {
      /* storage unavailable — degrade silently */
    }
  }

  function clearState() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      /* noop */
    }
  }

  // ── pub/sub ──
  function subscribe(fn) {
    listeners.push(fn);
    return function unsubscribe() {
      const i = listeners.indexOf(fn);
      if (i >= 0) listeners.splice(i, 1);
    };
  }

  function notify(reason, detail) {
    saveState();
    for (const fn of listeners) fn(reason, detail || null);
  }

  // ── mutations (mirror the original LabActions) ──
  function live(msg) {
    state.liveMsg = msg;
  }

  const actions = {
    setMode(mode) {
      state.mode = mode;
      if (!state.startedAt) state.startedAt = new Date().toISOString();
      state.zone = "briefing";
      if (!state.visited.includes("briefing")) state.visited.push("briefing");
      live("Mode selected: " + mode + ".");
      notify("mode");
    },

    setEnv(key, value) {
      const resolved = typeof value === "function" ? value(state.env[key]) : value;
      state.env = Object.assign({}, state.env);
      state.env[key] = resolved;
      notify("env", key); // widgets update themselves; no re-render
    },

    checkObjective(id) {
      const obj = OBJ.OBJ_BY_ID[id];
      if (!obj) return;
      const prev = state.obj[id] || { solved: false, wrong: 0, hints: 0, solvedFirstTry: false };
      if (prev.solved) {
        live(obj.id + " is already verified.");
        notify("live");
        return;
      }
      const pass = !!obj.check(state.env);
      const next = Object.assign({}, prev, { last: pass ? "pass" : "fail" });
      if (pass) {
        next.solved = true;
        next.solvedFirstTry = prev.wrong === 0;
        live(obj.id + " verified — " + obj.title);
      } else {
        next.wrong = prev.wrong + 1;
        live(obj.id + " did not pass — read the finding feedback and try again.");
      }
      state.obj = Object.assign({}, state.obj);
      state.obj[id] = next;
      notify(pass ? "obj-solved" : "obj-failed", id);
    },

    useHint(id) {
      const obj = OBJ.OBJ_BY_ID[id];
      const prev = state.obj[id] || { solved: false, wrong: 0, hints: 0, solvedFirstTry: false };
      if (!obj || prev.hints >= obj.hints.length) return;
      state.obj = Object.assign({}, state.obj);
      state.obj[id] = Object.assign({}, prev, { hints: prev.hints + 1 });
      live("Hint " + (prev.hints + 1) + " revealed for " + obj.id + ".");
      notify("hint", id);
    },

    goZone(zone) {
      state.zone = zone; // same-tab click is allowed: the app closes the mobile sheet on every "zone" event
      if (!state.visited.includes(zone)) state.visited.push(zone);
      notify("zone");
    },

    setQuizAnswer(qid, oid) {
      if (state.quiz.answers[qid]) return; // one attempt — silently ignored, like the original
      const answers = Object.assign({}, state.quiz.answers);
      answers[qid] = oid;
      state.quiz = { answers: answers, done: state.quiz.done };
      notify("quiz", qid);
    },

    finishQuiz() {
      state.quiz = { answers: state.quiz.answers, done: true };
      live("Exit interview closed.");
      notify("quiz-done");
    },

    resetAll() {
      clearState();
      state = defaultState();
      live("");
      notify("reset");
    },

    requestAttestation() {
      state.completed = true;
      live("Attestation issued.");
      notify("completed-open");
    },

    closeCompletion() {
      state.completed = false;
      notify("completed-close");
    },

    setLive(msg) {
      state.liveMsg = msg;
      notify("live");
    },
  };

  // ── selectors / helpers (identical to the original) ──
  function objState(s, id) {
    return s.obj[id] || { solved: false, wrong: 0, hints: 0, solvedFirstTry: false };
  }

  const listOf = (v) => (Array.isArray(v) ? v : []);
  const mapOf = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v : {});

  function computeScore(mode, s) {
    const objs = OBJ.objectivesFor(mode);
    const total = objs.length;
    let solved = 0, pts = 0, firstTry = 0, hintsUsed = 0;
    for (const o of objs) {
      const st = objState(s, o.id);
      if (st.solved) {
        solved += 1;
        const hintCost = o.mode === "hard" ? 15 : 10;
        const wrongCost = o.mode === "hard" ? 10 : 5;
        const p = Math.max(50, 100 - Math.min(30, st.hints * hintCost) - Math.min(20, Math.max(0, st.wrong - (st.solvedFirstTry ? 0 : 1)) * wrongCost));
        pts += p;
        if (st.solvedFirstTry) firstTry += 1;
      }
      hintsUsed += st.hints;
    }
    const objPct = total ? Math.round(pts / total) : 0;
    const quiz = mode === "hard" ? D.QUIZ_HARD : D.QUIZ_MEDIUM;
    const quizCorrect = quiz.filter((q) => s.quiz.answers[q.id] === q.correct).length;
    const quizPct = quiz.length ? Math.round((quizCorrect / quiz.length) * 100) : 0;
    const quizDone = s.quiz.done;
    const score = Math.round(objPct * 0.7 + (quizDone ? quizPct : 0) * 0.3);
    const allSolved = solved === total && total > 0;
    const firstTryRate = total ? firstTry / total : 0;
    let stars = 0;
    if (allSolved && quizDone) {
      stars = firstTryRate >= 0.9 && hintsUsed <= 2 ? 5 : firstTryRate >= 0.7 && hintsUsed <= 4 ? 4 : firstTryRate >= 0.5 ? 3 : 2;
    } else if (allSolved) {
      stars = firstTryRate >= 0.9 && hintsUsed <= 2 ? 4 : firstTryRate >= 0.7 && hintsUsed <= 4 ? 3 : 2;
    }
    return { total, solved, objPct, quizPct, score, stars, firstTryRate, hintsUsed, allSolved, quizDone };
  }

  // Deterministic shuffle used by the Sequencer (same LCG + same seed formula
  // as the original: envKey.length * 31 + envKey.charCodeAt(0)).
  function shuffleStable(items, seed) {
    const a = items.slice();
    let x = seed;
    const rnd = () => {
      x = (x * 1103515245 + 12345) % 2147483648;
      return x / 2147483648;
    };
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  // boot: load persisted state (hydration-safe equivalent — runs before first render)
  const persisted = loadState();
  if (persisted) state = persisted;

  return {
    STORAGE_KEY,
    get state() { return state; },
    actions,
    subscribe,
    objState,
    listOf,
    mapOf,
    computeScore,
    shuffleStable,
    defaultState,
  };
})();
