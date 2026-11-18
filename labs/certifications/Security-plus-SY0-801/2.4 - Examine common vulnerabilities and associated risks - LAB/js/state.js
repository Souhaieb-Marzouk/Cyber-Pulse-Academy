/**
 * Vulnerability Council — state store + persistence + pub/sub (static port).
 *
 * Source: src/lib/storage.ts (122 lines) + src/components/lab/LabContext.tsx
 * (250 lines, including the R2 quiz answer-lock fix).
 *
 * localStorage keys (same as the original React app):
 *   lab-2-4-mode     -> LabMode | null
 *   lab-2-4-progress -> per-objective status map
 *   lab-2-4-state    -> active evidence, CVSS metrics, classifications, answers
 *   lab-2-4-quiz     -> quiz answers + score
 *
 * Exposed on the global Lab namespace as Lab.Store.
 */
(function (global) {
  "use strict";

  var Lab = global.Lab || (global.Lab = {});
  var Data = Lab.Data;
  var CVSS = Lab.CVSS;

  var KEYS = {
    mode: "lab-2-4-mode",
    progress: "lab-2-4-progress",
    state: "lab-2-4-state",
    quiz: "lab-2-4-quiz",
  };

  // --- localStorage helpers (mirror storage.ts semantics) -------------------

  function lsAvailable() {
    try {
      if (typeof window === "undefined") return false;
      if (!window.localStorage) return false;
      var t = "__lab_test__";
      window.localStorage.setItem(t, t);
      window.localStorage.removeItem(t);
      return true;
    } catch (e) {
      return false;
    }
  }

  function readJSON(key, fallback) {
    if (!lsAvailable()) return fallback;
    try {
      var raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    if (!lsAvailable()) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* quota / private mode — ignore */
    }
  }

  function resetAll() {
    if (!lsAvailable()) return;
    var keys = Object.keys(KEYS);
    for (var i = 0; i < keys.length; i++) {
      try {
        window.localStorage.removeItem(KEYS[keys[i]]);
      } catch (e) {
        /* ignore */
      }
    }
  }

  // --- Default state --------------------------------------------------------

  function defaultState() {
    return {
      activeEvidenceId: null,
      cvss: CVSS.cloneEmpty(),
      cvssEnv: CVSS.cloneEmpty(),
      showEnv: false,
      classifications: {},
      redHerringFlags: {},
      councilSelection: [],
      queueOrder: [],
      answers: {},
    };
  }

  function defaultQuiz() {
    return { answers: {}, completed: false };
  }

  function defaultProgress() {
    return {};
  }

  // --- The store ------------------------------------------------------------
  //
  // Single mutable state object with subscribe/notify. Each mutation persists
  // the affected slice and emits a notify so subscribers can re-render.

  var Store = {
    mode: null,
    progress: defaultProgress(),
    state: defaultState(),
    quiz: defaultQuiz(),
    hydrated: false,
    _subs: [],
  };

  Store.subscribe = function (fn) {
    Store._subs.push(fn);
    return function () {
      var i = Store._subs.indexOf(fn);
      if (i >= 0) Store._subs.splice(i, 1);
    };
  };

  function notify() {
    for (var i = 0; i < Store._subs.length; i++) {
      try {
        Store._subs[i]();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("[Lab.Store] subscriber error:", e);
      }
    }
  }

  // --- Hydration -------------------------------------------------------------

  Store.hydrate = function () {
    Store.mode = readJSON(KEYS.mode, null);
    Store.progress = readJSON(KEYS.progress, {});
    var s = readJSON(KEYS.state, {});
    var merged = defaultState();
    for (var k in s) {
      if (Object.prototype.hasOwnProperty.call(s, k)) merged[k] = s[k];
    }
    // Ensure cvss/cvssEnv carry the full set of metric keys (older saved
    // states may predate environmental metrics).
    if (!merged.cvss || typeof merged.cvss !== "object") merged.cvss = CVSS.cloneEmpty();
    if (!merged.cvssEnv || typeof merged.cvssEnv !== "object") merged.cvssEnv = CVSS.cloneEmpty();
    Store.state = merged;
    var q = readJSON(KEYS.quiz, { answers: {}, completed: false });
    Store.quiz = { answers: {}, completed: false };
    if (q && typeof q === "object") {
      if (q.answers && typeof q.answers === "object") Store.quiz.answers = q.answers;
      if (typeof q.completed === "boolean") Store.quiz.completed = q.completed;
    }
    Store.hydrated = true;
    notify();
  };

  // --- Mutators --------------------------------------------------------------

  Store.setMode = function (m) {
    Store.mode = m;
    writeJSON(KEYS.mode, m);
    notify();
  };

  Store.setActiveEvidence = function (id) {
    Store.state.activeEvidenceId = id;
    writeJSON(KEYS.state, Store.state);
    notify();
  };

  function setCvssBase(m) {
    Store.state.cvss = m;
    writeJSON(KEYS.state, Store.state);
    notify();
  }
  function setCvssEnv(m) {
    Store.state.cvssEnv = m;
    writeJSON(KEYS.state, Store.state);
    notify();
  }
  function toggleEnv(show) {
    Store.state.showEnv = !!show;
    writeJSON(KEYS.state, Store.state);
    notify();
  }

  function setClassification(id, partial) {
    var cur = Store.state.classifications[id] || { category: "none", surface: "none" };
    Store.state.classifications[id] = {
      category: partial.category != null ? partial.category : (cur.category || "none"),
      surface: partial.surface != null ? partial.surface : (cur.surface || "none"),
    };
    writeJSON(KEYS.state, Store.state);
    notify();
  }

  function toggleRedHerring(id) {
    Store.state.redHerringFlags[id] = !Store.state.redHerringFlags[id];
    writeJSON(KEYS.state, Store.state);
    notify();
  }

  function setCouncilSelection(ids) {
    Store.state.councilSelection = ids.slice();
    writeJSON(KEYS.state, Store.state);
    notify();
  }

  function setQueueOrder(ids) {
    Store.state.queueOrder = ids.slice();
    writeJSON(KEYS.state, Store.state);
    notify();
  }

  function setAnswer(objId, value) {
    Store.state.answers[objId] = value;
    writeJSON(KEYS.state, Store.state);
    notify();
  }

  function patchAnswer(objId, patch) {
    var cur = Store.state.answers[objId] || {};
    if (typeof cur !== "object" || cur === null) cur = {};
    var next = Object.assign({}, cur, patch);
    Store.state.answers[objId] = next;
    writeJSON(KEYS.state, Store.state);
    notify();
  }

  /**
   * Silent variants — update state and persist but DO NOT notify subscribers.
   * Used for text inputs / textareas where re-rendering on every keystroke
   * would lose focus and selection. The component re-renders later when an
   * explicit action (Check, Reset, Hint) triggers notify().
   */
  function setAnswerSilent(objId, value) {
    Store.state.answers[objId] = value;
    writeJSON(KEYS.state, Store.state);
  }

  function patchAnswerSilent(objId, patch) {
    var cur = Store.state.answers[objId] || {};
    if (typeof cur !== "object" || cur === null) cur = {};
    var next = Object.assign({}, cur, patch);
    Store.state.answers[objId] = next;
    writeJSON(KEYS.state, Store.state);
  }

  function markObjective(id, correct, feedback) {
    var cur = Store.progress[id] || { status: "idle", attempts: 0, hintsUsed: 0 };
    Store.progress[id] = {
      status: correct ? "correct" : "incorrect",
      attempts: (cur.attempts || 0) + 1,
      hintsUsed: cur.hintsUsed || 0,
      lastFeedback: feedback,
    };
    writeJSON(KEYS.progress, Store.progress);
    notify();
  }

  function requestHint(id) {
    var cur = Store.progress[id] || { status: "idle", attempts: 0, hintsUsed: 0 };
    Store.progress[id] = {
      status: cur.status || "idle",
      attempts: cur.attempts || 0,
      hintsUsed: (cur.hintsUsed || 0) + 1,
      lastFeedback: cur.lastFeedback,
    };
    writeJSON(KEYS.progress, Store.progress);
    notify();
  }

  function resetObjective(id) {
    delete Store.progress[id];
    delete Store.state.answers[id];
    writeJSON(KEYS.progress, Store.progress);
    writeJSON(KEYS.state, Store.state);
    notify();
  }

  // R2: lock after first pick — once an answer is recorded, it cannot be
  // changed except via resetQuizAnswer (the per-question Retry button).
  function setQuizAnswer(qid, idx) {
    if (Store.quiz.answers[qid] !== undefined) return; // locked
    Store.quiz.answers[qid] = idx;
    writeJSON(KEYS.quiz, Store.quiz);
    notify();
  }

  // Only allowed before the quiz is finalized (completed === false).
  function resetQuizAnswer(qid) {
    if (Store.quiz.completed) return;
    delete Store.quiz.answers[qid];
    writeJSON(KEYS.quiz, Store.quiz);
    notify();
  }

  function completeQuiz() {
    Store.quiz.completed = true;
    writeJSON(KEYS.quiz, Store.quiz);
    notify();
  }

  function resetEverything() {
    resetAll();
    Store.mode = null;
    Store.progress = defaultProgress();
    Store.state = defaultState();
    Store.quiz = defaultQuiz();
    notify();
  }

  // Expose mutators on the Store object (mirrors LabContext's API surface).
  Store.setCvssBase = setCvssBase;
  Store.setCvssEnv = setCvssEnv;
  Store.toggleEnv = toggleEnv;
  Store.setClassification = setClassification;
  Store.toggleRedHerring = toggleRedHerring;
  Store.setCouncilSelection = setCouncilSelection;
  Store.setQueueOrder = setQueueOrder;
  Store.setAnswer = setAnswer;
  Store.patchAnswer = patchAnswer;
  Store.setAnswerSilent = setAnswerSilent;
  Store.patchAnswerSilent = patchAnswerSilent;
  Store.markObjective = markObjective;
  Store.requestHint = requestHint;
  Store.resetObjective = resetObjective;
  Store.setQuizAnswer = setQuizAnswer;
  Store.resetQuizAnswer = resetQuizAnswer;
  Store.completeQuiz = completeQuiz;
  Store.resetEverything = resetEverything;

  Store.STORAGE_KEYS = KEYS;
  Store._resetAllInternal = resetAll; // exposed for tests / debugging

  // Expose
  Lab.Store = Store;
})(typeof window !== "undefined" ? window : globalThis);
