/* ── state.js ────────────────────────────────────────────────────────
   Plain-JS port of the original zustand store (src/lib/lab/store.ts).

   • Same persistence key: "n1009-42-watchroom-v1"
   • Same persisted shape: {"state":{mode,objectives,env,quiz},"version":0}
     (zustand/persist JSON format — sessions stay interchangeable)
   • Same partialized fields, same save-on-every-mutation semantics,
     same confirmed RESET to pristine, same derived selectors.
   A tiny subscribe/notify mechanism drives targeted DOM updates.
   ──────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  var STORAGE_KEY = "n1009-42-watchroom-v1";

  var listeners = new Set();
  var state = null; // set by initialState()

  function emptyObjectives() {
    var o = {};
    [window.LabObjectives.OBJECTIVES.medium, window.LabObjectives.OBJECTIVES.hard].forEach(function (list) {
      list.forEach(function (def) {
        o[def.id] = { done: false, attempts: 0, hints: 0, firstTry: false };
      });
    });
    return o;
  }

  function initialState() {
    return {
      mode: null,
      objectives: emptyObjectives(),
      env: window.LabObjectives.initialEnv(),
      quiz: { answers: {}, checked: {}, completed: false },
      drawer: null,
      focus: null,
      announce: "",
      booted: false,
    };
  }

  /* ── persistence ─────────────────────────────────────────────────── */

  function save() {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          state: {
            mode: state.mode,
            objectives: state.objectives,
            env: state.env,
            quiz: state.quiz,
          },
          version: 0,
        })
      );
    } catch (e) {
      /* storage unavailable (file:// privacy mode) — lab still runs, just no resume */
    }
  }

  function mergeEnv(base, incoming) {
    var out = {};
    Object.keys(base).forEach(function (k) {
      var v = base[k];
      if (v !== null && typeof v === "object" && !Array.isArray(v)) {
        out[k] = Object.assign({}, v, incoming && typeof incoming[k] === "object" ? incoming[k] : {});
      } else {
        out[k] = incoming && incoming[k] !== undefined ? incoming[k] : v;
      }
    });
    return out;
  }

  function rehydrate() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var parsed = JSON.parse(raw);
      var s = parsed && parsed.state;
      if (!s) return;
      if (s.mode === "medium" || s.mode === "hard") state.mode = s.mode;
      if (s.objectives && typeof s.objectives === "object") {
        var fresh = emptyObjectives();
        Object.keys(fresh).forEach(function (id) {
          var o = s.objectives[id];
          if (o) fresh[id] = {
            done: !!o.done,
            attempts: Number(o.attempts) || 0,
            hints: Number(o.hints) || 0,
            firstTry: !!o.firstTry,
            lastFeedback: typeof o.lastFeedback === "string" ? o.lastFeedback : undefined,
            lastOk: typeof o.lastOk === "boolean" ? o.lastOk : undefined,
          };
        });
        state.objectives = fresh;
      }
      if (s.env) state.env = mergeEnv(window.LabObjectives.initialEnv(), s.env);
      if (s.quiz && typeof s.quiz === "object") {
        state.quiz = {
          answers: s.quiz.answers && typeof s.quiz.answers === "object" ? s.quiz.answers : {},
          checked: s.quiz.checked && typeof s.quiz.checked === "object" ? s.quiz.checked : {},
          completed: !!s.quiz.completed,
        };
      }
    } catch (e) {
      /* corrupt storage → pristine boot */
    }
  }

  /* ── notify ──────────────────────────────────────────────────────── */

  function notify() {
    save();
    listeners.forEach(function (l) {
      try {
        l();
      } catch (e) {
        /* one bad subscriber must not break the rest */
      }
    });
  }

  function subscribe(fn) {
    listeners.add(fn);
    return function () {
      listeners.delete(fn);
    };
  }

  /* ── actions (1:1 with the original store) ───────────────────────── */

  function setState(patch) {
    Object.assign(state, patch);
    notify();
  }

  function setMode(m) {
    setState({ mode: m, focus: null });
  }

  function patchEnv(patch) {
    setState({ env: Object.assign({}, state.env, patch) });
  }

  function checkObjective(id) {
    if (!state.mode) return;
    var def = window.LabObjectives.OBJECTIVES[state.mode].filter(function (d) { return d.id === id; })[0];
    if (!def) return;
    var res = def.validate(state.env);
    var prev = state.objectives[id] || { done: false, attempts: 0, hints: 0, firstTry: false };
    var next = {
      done: prev.done || res.ok,
      attempts: prev.attempts + 1,
      hints: prev.hints,
      firstTry: (prev.done || res.ok) && prev.attempts === 0,
      lastFeedback: res.feedback,
      lastOk: res.ok,
    };
    var objectives = Object.assign({}, state.objectives);
    objectives[id] = next;
    setState({
      objectives: objectives,
      announce: res.ok
        ? "Objective complete: " + def.title + ". " + res.feedback
        : "Check failed: " + res.feedback,
    });
  }

  function useHint(id) {
    var def = window.LabObjectives.OBJECTIVES[state.mode || "medium"].filter(function (d) { return d.id === id; })[0];
    if (!def) return;
    var prev = state.objectives[id] || { done: false, attempts: 0, hints: 0, firstTry: false };
    if (prev.hints >= def.hints.length) return;
    var objectives = Object.assign({}, state.objectives);
    objectives[id] = Object.assign({}, prev, { hints: prev.hints + 1 });
    setState({
      objectives: objectives,
      announce: "Hint revealed for " + def.title,
    });
  }

  function goTo(objId) {
    var def = window.LabObjectives.OBJECTIVES[state.mode || "medium"].filter(function (d) { return d.id === objId; })[0];
    if (!def) return;
    setState({ focus: { panel: def.panels[0], seq: (state.focus ? state.focus.seq : 0) + 1 } });
  }

  function setDrawer(d) {
    setState({ drawer: d });
  }

  function setQuizAnswer(qid, idx) {
    var answers = Object.assign({}, state.quiz.answers);
    answers[qid] = idx;
    setState({ quiz: Object.assign({}, state.quiz, { answers: answers }) });
  }

  function checkQuizItem(qid) {
    var checked = Object.assign({}, state.quiz.checked);
    checked[qid] = true;
    var bank = state.mode === "hard" ? window.LabData.QUIZ_HARD : window.LabData.QUIZ_MEDIUM;
    var completed = bank.every(function (q) { return checked[q.id]; });
    setState({
      quiz: { answers: state.quiz.answers, checked: checked, completed: completed },
      announce: "Quiz answer checked: " + qid,
    });
  }

  function runAudit() {
    if (!state.mode) return;
    var result = window.LabObjectives.runAudit(state.mode, state.env);
    var env = Object.assign({}, state.env, {
      auditRun: state.env.auditRun + 1,
      auditResult: result,
    });
    setState({
      env: env,
      announce: result
        ? "Site audit PASSED — all hardening checks green."
        : "Site audit FAILED — see report lines.",
    });
  }

  function resetAll() {
    var pristine = initialState();
    pristine.booted = true;
    pristine.announce = "Lab reset to pristine state.";
    setState(pristine);
  }

  function setBooted() {
    setState({ booted: true });
  }

  /* ── derived selectors (1:1) ─────────────────────────────────────── */

  function currentObjectiveId(mode, objectives) {
    var list = window.LabObjectives.OBJECTIVES[mode];
    for (var i = 0; i < list.length; i++) {
      if (!(objectives[list[i].id] && objectives[list[i].id].done)) return list[i].id;
    }
    return null;
  }

  function progressOf(mode, objectives) {
    var list = window.LabObjectives.OBJECTIVES[mode];
    var done = list.filter(function (d) { return objectives[d.id] && objectives[d.id].done; }).length;
    return { done: done, total: list.length };
  }

  function starsFor(mode, objectives) {
    var list = window.LabObjectives.OBJECTIVES[mode];
    var total = list.length;
    var firstTry = list.filter(function (d) {
      return objectives[d.id] && objectives[d.id].done && objectives[d.id].firstTry;
    }).length;
    var hints = list.reduce(function (a, d) {
      return a + ((objectives[d.id] && objectives[d.id].hints) || 0);
    }, 0);
    var stars = 5;
    stars -= Math.floor((total - firstTry) / 3);
    stars -= Math.floor(Math.max(0, hints - 2) / 2);
    return { stars: Math.max(1, Math.min(5, stars)), firstTry: firstTry, hints: hints };
  }

  function quizScore(mode, quiz) {
    var items = mode === "hard" ? window.LabData.QUIZ_HARD : window.LabData.QUIZ_MEDIUM;
    var answered = items.filter(function (q) { return quiz.checked[q.id]; });
    var correct = answered.filter(function (q) { return quiz.answers[q.id] === q.answer; }).length;
    return { correct: correct, answered: answered.length, total: items.length };
  }

  /* ── public API ──────────────────────────────────────────────────── */

  state = initialState();

  window.LabState = {
    KEY: STORAGE_KEY,
    get: function () {
      return state;
    },
    subscribe: subscribe,
    rehydrate: rehydrate,
    actions: {
      setMode: setMode,
      patchEnv: patchEnv,
      checkObjective: checkObjective,
      useHint: useHint,
      goTo: goTo,
      setDrawer: setDrawer,
      setQuizAnswer: setQuizAnswer,
      checkQuizItem: checkQuizItem,
      runAudit: runAudit,
      resetAll: resetAll,
      setBooted: setBooted,
    },
    select: {
      currentObjectiveId: currentObjectiveId,
      progressOf: progressOf,
      starsFor: starsFor,
      quizScore: quizScore,
    },
  };
})();
