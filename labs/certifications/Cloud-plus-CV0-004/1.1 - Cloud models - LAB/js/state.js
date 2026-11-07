/* =========================================================================
   The Engagement Desk — static port (js/state.js)
   -------------------------------------------------------------------------
   State store, actions and persistence — a faithful plain-JS recreation of
   src/lib/lab/state.tsx (React context + useReducer-style updates):
   - SAME storage key (cv0004-l11-engagement-desk-v1) and STATE_VERSION 2
   - SAME pristine shape, merge-on-load, and clean discard of foreign versions
   - SAME debounced save (250 ms) with a synchronous flush on page unload
   - SAME action semantics (setMode, goStage, patchEnv, updateEnv, …)
   A tiny subscribe/notify mechanism replaces React's re-render loop; the
   view re-renders from scratch on every notify (see js/app.js).
   ========================================================================= */

(function () {
  "use strict";

  var STORAGE_KEY = "cv0004-l11-engagement-desk-v1";
  // v2: quiz answers were re-keyed during the R4/R5 audit fixes; old saves are
  // discarded cleanly instead of being scored against a moved answer key.
  var STATE_VERSION = 2;

  var listeners = [];
  var saveTimer = null;
  var state = null; // set by init()

  function pristineEnv() {
    return {
      match: {},
      matchH: {},
      tenancy: {},
      ladder: {},
      shared: {},
      kestrelModel: null,
      kestrelLines: [],
      classify: {},
      placementM: {},
      redFlags: [],
      costQ: {},
      miniCases: {},
      riskPairs: {},
      memo: { model: null, mappings: [], tradeoff: null },
      triage: [],
      elim: {},
      pattern: null,
      placementH: {},
      serviceH: {},
      plan: null,
      riskTop: [],
      riskMapH: {},
      memoH: { model: null, mappings: [], tradeoff: null, exit: null },
      drill: [],
      nudgeUsed: false,
      docsRead: [],
    };
  }

  function pristineState() {
    return {
      version: STATE_VERSION,
      mode: null,
      stage: "briefing",
      briefingSeen: false,
      compendiumSeen: false,
      env: pristineEnv(),
      objectives: {},
      quiz: { answers: {}, checked: {}, completed: false },
      completedAt: null,
      selectedObjective: null,
    };
  }

  function loadState() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (parsed.version !== STATE_VERSION) return null;
      // merge for forward-compat
      var base = pristineState();
      var merged = Object.assign({}, base, parsed);
      merged.env = Object.assign({}, base.env, parsed.env || {});
      merged.quiz = Object.assign({}, base.quiz, parsed.quiz || {});
      merged.objectives = Object.assign({}, parsed.objectives || {});
      return merged;
    } catch (e) {
      return null;
    }
  }

  function saveState(s) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch (e) {
      // storage unavailable — degrade gracefully
    }
  }

  function notify() {
    for (var i = 0; i < listeners.length; i++) listeners[i]();
  }

  function subscribe(fn) {
    listeners.push(fn);
    return function unsubscribe() {
      var idx = listeners.indexOf(fn);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  }

  /** Every mutation goes through commit(): swap state, schedule save, notify. */
  function commit(next) {
    state = next;
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      saveState(state);
    }, 250);
    notify();
  }

  // ---------- actions (same semantics as the original context) ----------

  function setMode(m) {
    commit(Object.assign({}, state, { mode: m, selectedObjective: null }));
  }

  function goStage(stage) {
    commit(Object.assign({}, state, { stage: stage }));
  }

  function markVisited(stage) {
    if (stage === "briefing") {
      if (state.briefingSeen) return;
      commit(Object.assign({}, state, { briefingSeen: true }));
    } else {
      if (state.compendiumSeen) return;
      commit(Object.assign({}, state, { compendiumSeen: true }));
    }
  }

  function patchEnv(patch) {
    var env = Object.assign({}, state.env, patch);
    commit(Object.assign({}, state, { env: env }));
  }

  function updateEnv(fn) {
    var env = fn(state.env);
    commit(Object.assign({}, state, { env: env }));
  }

  function selectObjective(id) {
    if (state.selectedObjective === id) return;
    commit(Object.assign({}, state, { selectedObjective: id }));
  }

  function allObjectivesDone(s, justChecked, next) {
    if (!s.mode) return false;
    var objs = LabData.OBJECTIVES[s.mode];
    for (var i = 0; i < objs.length; i++) {
      var o = objs[i];
      var done = o.id === justChecked ? next.done : (s.objectives[o.id] || { done: false }).done;
      if (!done) return false;
    }
    return true;
  }

  function checkObjective(id) {
    var check = LabEngine.validateObjective(id, state.env);
    var prev = objState(state, id);
    var nowDone = prev.done || check.pass;
    var nextObj = {
      done: nowDone,
      attempts: prev.attempts + 1,
      firstTry: prev.done ? prev.firstTry : prev.attempts === 0 && check.pass,
      hintsUsed: prev.hintsUsed,
      lastResult: check.pass ? "pass" : "fail",
    };
    var completedAt =
      nowDone && !state.completedAt && allObjectivesDone(state, id, nextObj) && state.quiz.completed
        ? Date.now()
        : state.completedAt;
    var objectives = Object.assign({}, state.objectives);
    objectives[id] = nextObj;
    commit(Object.assign({}, state, { objectives: objectives, completedAt: completedAt }));
    return check;
  }

  function spendHint(id) {
    var prev = objState(state, id);
    var max = state.mode === "hard" ? 1 : 3;
    if (prev.hintsUsed >= max) return;
    if (state.mode === "hard" && state.env.nudgeUsed) return;
    var objectives = Object.assign({}, state.objectives);
    objectives[id] = Object.assign({}, prev, { hintsUsed: prev.hintsUsed + 1 });
    var env = state.mode === "hard" ? Object.assign({}, state.env, { nudgeUsed: true }) : state.env;
    commit(Object.assign({}, state, { objectives: objectives, env: env }));
  }

  function answerQuiz(qid, option) {
    var answers = Object.assign({}, state.quiz.answers);
    answers[qid] = option;
    var checked = Object.assign({}, state.quiz.checked);
    checked[qid] = false;
    commit(Object.assign({}, state, { quiz: Object.assign({}, state.quiz, { answers: answers, checked: checked }) }));
  }

  function checkQuizQuestion(qid) {
    var checked = Object.assign({}, state.quiz.checked);
    checked[qid] = true;
    commit(Object.assign({}, state, { quiz: Object.assign({}, state.quiz, { checked: checked }) }));
  }

  function completeQuiz() {
    var quiz = Object.assign({}, state.quiz, { completed: true });
    var allDone = false;
    if (state.mode != null) {
      allDone = LabData.OBJECTIVES[state.mode].every(function (o) {
        return (state.objectives[o.id] || { done: false }).done || LabEngine.validateObjective(o.id, state.env).pass;
      });
    }
    commit(
      Object.assign({}, state, {
        quiz: quiz,
        completedAt: allDone && !state.completedAt ? Date.now() : state.completedAt,
      })
    );
  }

  function reset() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
    state = pristineState();
    notify(); // no save scheduled — the desk returns to pristine on disk too
  }

  // ---------- selectors / derived (same math as state.tsx) ----------

  function objState(s, id) {
    return s.objectives[id] || { done: false, attempts: 0, firstTry: true, hintsUsed: 0, lastResult: null };
  }

  function computeStars(s, mode, done, quizCorrect) {
    var objs = LabData.OBJECTIVES[mode];
    var quiz = LabData.QUIZ[mode];
    // An unfinished engagement is not rated yet ("In progress").
    if (done < objs.length) return 0;
    var firstTry = 0;
    for (var i = 0; i < objs.length; i++) {
      var st = s.objectives[objs[i].id];
      if (st && st.done && st.firstTry) firstTry++;
    }
    var ftRate = firstTry / objs.length;
    var hints = 0;
    for (var j = 0; j < objs.length; j++) {
      var st2 = s.objectives[objs[j].id];
      hints += st2 ? st2.hintsUsed : 0;
    }
    hints += s.env.nudgeUsed ? 1 : 0;
    var quizPerfect = quizCorrect === quiz.length;
    if (s.env.nudgeUsed) {
      // The paid nudge visibly costs score: hard-capped at two stars.
      return ftRate >= 0.6 ? 2 : 1;
    }
    if (ftRate >= 0.9 && hints <= 3 && quizPerfect) return 3;
    if (ftRate >= 0.6) return 2;
    return 1;
  }

  function computeProgress(s) {
    var mode = s.mode;
    if (!mode) return { done: 0, total: 0, pct: 0, quizCorrect: 0, quizTotal: 0, quizPct: 0, overallPct: 0, stars: 0 };
    var objs = LabData.OBJECTIVES[mode];
    var done = 0;
    for (var i = 0; i < objs.length; i++) if (objState(s, objs[i].id).done) done++;
    var quiz = LabData.QUIZ[mode];
    var quizCorrect = 0;
    for (var k = 0; k < quiz.length; k++) {
      if (s.quiz.checked[quiz[k].id] && s.quiz.answers[quiz[k].id] === quiz[k].answer) quizCorrect++;
    }
    var quizTotal = quiz.length;
    var totalUnits = objs.length + quizTotal;
    var overallPct = Math.round(((done + quizCorrect) / totalUnits) * 100);
    var stars = computeStars(s, mode, done, quizCorrect);
    return {
      done: done,
      total: objs.length,
      pct: Math.round((done / objs.length) * 100),
      quizCorrect: quizCorrect,
      quizTotal: quizTotal,
      quizPct: Math.round((quizCorrect / quizTotal) * 100),
      overallPct: overallPct,
      stars: stars,
    };
  }

  // ---------- theme (next-themes parity: attribute="class", default light) ----

  var THEME_KEY = "theme";
  function getTheme() {
    try {
      var t = window.localStorage.getItem(THEME_KEY);
      return t === "dark" ? "dark" : "light";
    } catch (e) {
      return "light";
    }
  }
  function setTheme(t) {
    try {
      window.localStorage.setItem(THEME_KEY, t);
    } catch (e) {
      // ignore
    }
    document.documentElement.classList.toggle("dark", t === "dark");
  }

  // ---------- bootstrap ----------

  function init() {
    state = loadState() || pristineState();
  }

  // Audit QA-13: a reload arriving inside the 250 ms debounce window used to
  // drop the very last action. Flush synchronously when the page is unloaded.
  function installFlush() {
    window.addEventListener("beforeunload", function () {
      saveState(state);
    });
    window.addEventListener("pagehide", function () {
      saveState(state);
    });
  }

  window.LabState = {
    STORAGE_KEY: STORAGE_KEY,
    STATE_VERSION: STATE_VERSION,
    init: init,
    installFlush: installFlush,
    subscribe: subscribe,
    get: function () {
      return state;
    },
    hydrated: true,
    setMode: setMode,
    goStage: goStage,
    markVisited: markVisited,
    patchEnv: patchEnv,
    updateEnv: updateEnv,
    selectObjective: selectObjective,
    checkObjective: checkObjective,
    spendHint: spendHint,
    answerQuiz: answerQuiz,
    checkQuizQuestion: checkQuizQuestion,
    completeQuiz: completeQuiz,
    reset: reset,
    objState: objState,
    computeProgress: computeProgress,
    computeStars: computeStars,
    getTheme: getTheme,
    setTheme: setTheme,
    pristineEnv: pristineEnv,
    pristineState: pristineState,
  };
})();
