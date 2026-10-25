/* ======================================================================
   js/state.js — lab store: state + persistence + pub/sub
   1:1 port of the original src/lib/lab/store.tsx reducer:
     * same localStorage key and saved shape (v1)
     * same action semantics (SET_MODE / SET_ENV / CHECK / HINT / QUIZ /
       SEEN_COMPLETION / HYDRATE / RESET)
     * CHECK validates against the CURRENT state (no stale snapshots — the
       original fixed this inside its React reducer; vanilla dispatches are
       synchronous by construction, which preserves that guarantee)
     * same derived values (score, stars, doneCount, allDone)
   ====================================================================== */
(function () {
  'use strict';

  var LS_KEY = 'cyberlab-cysa-cs0-003-4-1-v1';

  function initialLabState() {
    return { v: 1, mode: null, env: {}, obj: {}, quiz: {}, completedSeen: false };
  }

  var state = initialLabState();
  var hydrated = false;
  var listeners = [];

  /* ---------------- derived (same formulas as the original useMemo) --------------- */
  var derived = {};
  function computeDerived() {
    var mode = state.mode;
    var D = window.LAB_DATA;
    var objectives = mode ? D.objectivesFor(mode) : [];
    var quiz = mode ? D.quizFor(mode) : [];
    var doneCount = objectives.filter(function (o) { return state.obj[o.id] && state.obj[o.id].done; }).length;
    var totalCount = objectives.length;
    var allDone = mode !== null && totalCount > 0 && doneCount === totalCount;

    var objPoints = objectives.reduce(function (acc, o) { return acc + (state.obj[o.id] && state.obj[o.id].done ? 10 : 0); }, 0);
    var quizPoints = quiz.reduce(function (acc, q) { return acc + (state.quiz[q.id] && state.quiz[q.id].correct ? 5 : 0); }, 0);
    var maxPoints = totalCount * 10 + quiz.length * 5;
    var score = maxPoints === 0 ? 0 : Math.round(((objPoints + quizPoints) / maxPoints) * 100);

    /* stars: first-attempt accuracy + hint discipline */
    var stars = 0;
    if (totalCount > 0) {
      var firstTry = objectives.filter(function (o) {
        var s = state.obj[o.id];
        return s && s.done && s.attempts === 1 && s.hints === 0;
      }).length;
      var totalHints = objectives.reduce(function (acc, o) { return acc + (state.obj[o.id] ? state.obj[o.id].hints : 0); }, 0);
      var ratio = firstTry / totalCount;
      stars = ratio >= 0.9 ? 5 : ratio >= 0.75 ? 4 : ratio >= 0.6 ? 3 : ratio >= 0.4 ? 2 : 1;
      if (totalHints > 2) stars = Math.min(stars, 3);
      if (mode === 'hard' && totalHints > 0) stars = Math.min(stars, 4);
    }

    derived = {
      objectives: objectives,
      quiz: quiz,
      doneCount: doneCount,
      totalCount: totalCount,
      allDone: allDone,
      score: score,
      stars: stars,
    };
  }

  function notify() {
    computeDerived();
    for (var i = 0; i < listeners.length; i++) listeners[i]();
  }

  /* ---------------- persistence (same key + shape; save only after hydrate) --------------- */
  function persist() {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch (e) {
      /* quota / availability errors are ignored, as in the original */
    }
  }

  function hydrate() {
    var restored = null;
    try {
      var raw = window.localStorage.getItem(LS_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.v === 1 && (parsed.mode === 'medium' || parsed.mode === 'hard')) {
          restored = Object.assign(initialLabState(), parsed, {
            env: parsed.env || {},
            obj: parsed.obj || {},
            quiz: parsed.quiz || {},
          });
        }
      }
    } catch (e) {
      /* localStorage unavailable — degrade gracefully to in-memory */
    }
    if (restored) state = restored;
    hydrated = true;
    notify();
  }

  /* ---------------- reducer (same cases as the original) --------------- */
  function validate(id, env, mode) {
    return window.LAB_CHECKS.validateObjective(id, env, mode || 'medium');
  }

  function objState(id) {
    return state.obj[id] || { done: false, attempts: 0, hints: 0 };
  }

  function reducer(st, action) {
    switch (action.type) {
      case 'SET_MODE':
        return Object.assign(initialLabState(), { mode: action.mode });
      case 'SET_ENV': {
        var p = typeof action.patch === 'function' ? action.patch(st.env) : action.patch;
        return Object.assign({}, st, { env: Object.assign({}, st.env, p) });
      }
      case 'CHECK': {
        var res = validate(action.id, st.env, st.mode);
        var prev = st.obj[action.id] || { done: false, attempts: 0, hints: 0 };
        var next = Object.assign({}, prev, {
          done: prev.done || res.pass,
          pass: prev.done ? prev.pass : res.pass,
          attempts: prev.attempts + 1,
          note: res.note !== undefined ? res.note : prev.note,
        });
        var obj = Object.assign({}, st.obj);
        obj[action.id] = next;
        return Object.assign({}, st, { obj: obj });
      }
      case 'HINT': {
        var p2 = st.obj[action.id] || { done: false, attempts: 0, hints: 0 };
        var n2 = Object.assign({}, p2, { hints: Math.min(p2.hints + 1, action.max) });
        var obj2 = Object.assign({}, st.obj);
        obj2[action.id] = n2;
        return Object.assign({}, st, { obj: obj2 });
      }
      case 'QUIZ': {
        var quiz = Object.assign({}, st.quiz);
        quiz[action.qid] = { pick: action.pick, correct: action.correct };
        return Object.assign({}, st, { quiz: quiz });
      }
      case 'SEEN_COMPLETION':
        return Object.assign({}, st, { completedSeen: true });
      case 'HYDRATE':
        return action.state;
      case 'RESET':
        return initialLabState();
      default:
        return st;
    }
  }

  function dispatch(action) {
    var next = reducer(state, action);
    if (next !== state) {
      state = next;
      persist();
      notify();
    }
  }

  /* ---------------- public store API --------------- */
  window.LAB_STORE = {
    getState: function () { return state; },
    isHydrated: function () { return hydrated; },
    get: function () { return derived; },
    subscribe: function (fn) { listeners.push(fn); },
    hydrate: hydrate,

    setMode: function (m) { dispatch({ type: 'SET_MODE', mode: m }); },

    /* patch: object or fn(env) -> object (functional form mirrors the original) */
    setEnv: function (patch) { dispatch({ type: 'SET_ENV', patch: patch }); },

    check: function (id) { dispatch({ type: 'CHECK', id: id }); },
    hint: function (id, max) { dispatch({ type: 'HINT', id: id, max: max }); },
    answerQuiz: function (qid, pick, correct) { dispatch({ type: 'QUIZ', qid: qid, pick: pick, correct: correct }); },
    seeCompletion: function () { dispatch({ type: 'SEEN_COMPLETION' }); },

    reset: function () {
      try { window.localStorage.removeItem(LS_KEY); } catch (e) { /* ignore */ }
      state = initialLabState();
      persist();
      notify();
    },
  };
})();
