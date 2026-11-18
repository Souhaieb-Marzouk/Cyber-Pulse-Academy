/* ============================================================
   The Assurance Bureau — js/state.js
   Store: single plain-JS state object + tiny subscribe/notify +
   localStorage persistence. SAME persistence key, SAME save /
   restore / reset semantics as the original framework lab.
   ============================================================ */

var STORE = (function () {
  "use strict";

  var STORAGE_KEY = "assurance-bureau-sy0801-55-v1";

  function emptyState() {
    return {
      mode: null,
      phase: "briefing",
      answers: {},
      checks: {},
      flags: {},
      quiz: { idx: 0, picked: {}, finished: false },
      signoff: false,
      completed: false,
      completedAt: null,
      completionDismissed: false,
    };
  }

  // ---------- pub/sub ----------
  var listeners = [];

  function subscribe(fn) {
    listeners.push(fn);
    return function unsubscribe() {
      listeners = listeners.filter(function (l) {
        return l !== fn;
      });
    };
  }

  function notify(topic) {
    listeners.forEach(function (fn) {
      fn(state, topic);
    });
    // persist on every state change (same semantics as the original store)
    if (restored) saveState(state);
  }

  // ---------- state ----------
  var state = emptyState();
  var restored = false;

  function loadState() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (parsed.version !== 1) return null;
      var base = emptyState();
      var merged = Object.assign({}, base, parsed, {
        quiz: Object.assign({}, base.quiz, parsed.quiz || {}),
      });
      // normalize older saves: signed engagements must carry the state flag too
      if (merged.signoff && !merged.flags.signoff) {
        merged.flags = Object.assign({}, merged.flags, { signoff: merged.completedAt || 1 });
      }
      // normalize older saves for the R2 submission field
      Object.keys(merged.checks).forEach(function (k) {
        if (merged.checks[k].submitted === undefined) {
          merged.checks[k].submitted = merged.checks[k].done;
        }
      });
      return merged;
    } catch (e) {
      return null;
    }
  }

  function saveState(s) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.assign({}, s, { version: 1 })));
    } catch (e) {
      // localStorage unavailable — degrade gracefully (session-only)
    }
  }

  function restore() {
    var loaded = loadState();
    if (loaded) state = loaded;
    restored = true;
  }

  // ---------- actions (identical semantics to the original store) ----------

  function setMode(m) {
    state = Object.assign(emptyState(), { mode: m, phase: "briefing" });
    notify("mode");
  }

  function setPhase(p) {
    state = Object.assign({}, state, { phase: p });
    notify("phase");
  }

  function setAnswer(key, value) {
    var next = typeof value === "function" ? value(state.answers[key]) : value;
    state = Object.assign({}, state, {
      answers: Object.assign({}, state.answers, (function () {
        var patch = {};
        patch[key] = next;
        return patch;
      })()),
    });
    notify("answer");
  }

  function getAnswer(key) {
    return state.answers[key];
  }

  function checkObjective(objId, result, submitted) {
    var prev = state.checks[objId] || { attempts: 0, done: false, firstTry: false, hintsUsed: 0, last: null, submitted: false };
    var done = prev.done || result.ok;
    var rec = {
      attempts: prev.attempts + (submitted ? 1 : 0),
      done: done,
      firstTry: prev.firstTry || (result.ok && submitted && prev.attempts === 0),
      hintsUsed: prev.hintsUsed,
      last: result,
      submitted: submitted,
    };
    var checks = Object.assign({}, state.checks);
    checks[objId] = rec;
    state = Object.assign({}, state, { checks: checks });
    notify("check");
    return done;
  }

  // R2: clears a locked worksheet for a FRESH attempt (never edits the checked submission)
  function retryObjective(objId) {
    var prev = state.checks[objId];
    if (!prev || prev.done) return; // verified worksheets stay locked
    var answers = {};
    Object.keys(state.answers).forEach(function (k) {
      if (k.indexOf(objId + ".") !== 0) answers[k] = state.answers[k];
    });
    var checks = Object.assign({}, state.checks);
    checks[objId] = Object.assign({}, prev, { last: null, submitted: false });
    state = Object.assign({}, state, { answers: answers, checks: checks });
    notify("retry");
  }

  function addHint(objId) {
    var prev = state.checks[objId] || { attempts: 0, done: false, firstTry: false, hintsUsed: 0, last: null, submitted: false };
    var checks = Object.assign({}, state.checks);
    checks[objId] = Object.assign({}, prev, { hintsUsed: prev.hintsUsed + 1 });
    state = Object.assign({}, state, { checks: checks });
    notify("hint");
  }

  function runRig(flag) {
    state = Object.assign({}, state, {
      flags: Object.assign({}, state.flags, (function () {
        var patch = {};
        patch[flag] = 1;
        return patch;
      })()),
    });
    notify("flag");
  }

  function signEngagement() {
    if (state.signoff) return;
    var flags = Object.assign({}, state.flags, { signoff: Date.now() });
    state = Object.assign({}, state, { signoff: true, flags: flags });
    notify("sign");
  }

  function answerQuiz(idx, option) {
    if (state.quiz.picked[idx] !== undefined) return; // locked after the answer press (R2)
    var picked = Object.assign({}, state.quiz.picked);
    picked[idx] = option;
    state = Object.assign({}, state, { quiz: Object.assign({}, state.quiz, { picked: picked }) });
    notify("quiz");
  }

  function quizNext() {
    var defs = state.mode === "hard" ? LAB_DATA.QUIZ_HARD : LAB_DATA.QUIZ_MEDIUM;
    var next = Math.min(state.quiz.idx + 1, defs.length - 1);
    state = Object.assign({}, state, { quiz: Object.assign({}, state.quiz, { idx: next }) });
    notify("quiz");
  }

  function finishQuiz() {
    state = Object.assign({}, state, { quiz: Object.assign({}, state.quiz, { finished: true }) });
    notify("quiz");
  }

  function completeEngagement() {
    if (state.completed) return;
    state = Object.assign({}, state, { completed: true, completedAt: Date.now(), completionDismissed: false });
    notify("completed");
  }

  function dismissCompletion() {
    if (state.completionDismissed) return;
    state = Object.assign({}, state, { completionDismissed: true });
    notify("dismissed");
  }

  // R7/R8: re-open the field report after it was dismissed
  function openCompletion() {
    if (!state.completionDismissed) return;
    state = Object.assign({}, state, { completionDismissed: false });
    notify("open-completion");
  }

  function reset() {
    state = emptyState();
    notify("reset");
  }

  function save() {
    if (restored) saveState(state);
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    subscribe: subscribe,
    restore: restore,
    save: save,
    getState: function () {
      return state;
    },
    isRestored: function () {
      return restored;
    },
    setMode: setMode,
    setPhase: setPhase,
    setAnswer: setAnswer,
    getAnswer: getAnswer,
    checkObjective: checkObjective,
    retryObjective: retryObjective,
    addHint: addHint,
    runRig: runRig,
    signEngagement: signEngagement,
    answerQuiz: answerQuiz,
    quizNext: quizNext,
    finishQuiz: finishQuiz,
    completeEngagement: completeEngagement,
    dismissCompletion: dismissCompletion,
    openCompletion: openCompletion,
    reset: reset,
  };
})();
