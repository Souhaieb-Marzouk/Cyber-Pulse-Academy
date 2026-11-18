/* ============================================================================
 * CyberLab — The Documentation Drafting Room (STATIC PORT)
 * js/state.js — state store + persistence + selectors.
 *   1:1 port of src/lib/lab/store.ts (zustand + persist) in plain JS.
 *
 * Parity contract with the original:
 *   • SAME localStorage key: "n10009-31-drafting-room-v1"
 *   • SAME on-disk shape as zustand/persist: {"state": {...}, "version": 0}
 *     (a save written by the original loads here and vice versa)
 *   • SAME save-on-every-change, resume-exactly and confirmed-reset semantics
 *   • tiny subscribe/notify replaces React's re-render loop
 * ========================================================================= */
(function () {
  "use strict";

  var STORAGE_KEY = "n10009-31-drafting-room-v1";
  var QUIZ_PASS = 0.7;

  var CLONE_KEYS = [
    "diagrams", "rack", "cable", "netdiagram", "inventory",
    "ipam", "sla", "wireless", "index", "objectives", "quiz",
  ];

  function initialStationState() {
    return {
      diagrams: { sort: {}, read: { room: null, idfs: null, uplink: null } },
      rack: { slots: {}, audit: { upsSlot: null, swModel: null, ppSlot: null, missing: null } },
      cable: { wall: null, panel: null, port: null, audit: { run: null, fixedPort: null } },
      netdiagram: {
        flagged: null,
        rebuild: { portVlan: null, gwVlan: null },
        blast: { closets: [], doc: null, systems: null },
      },
      inventory: { flags: {}, newSwitchSerial: null, prnStatus: null, ltLocation: null },
      ipam: { dupIp: null, prnIp: null, issues: [], fixes: { dup: null, prn: null, gw: null } },
      sla: { downtimeMin: null, tiers: {}, verify: { total: null, availability: null, breach: null } },
      wireless: {
        deadCell: null, cause: null, ch303: null,
        redesign: { channels: null, apCount: null, wall: null },
      },
      index: { match: {}, terms: {} },
    };
  }

  function freshState() {
    return Object.assign(
      {
        mode: null,
        phase: "mode", // "mode" | "brief" | "work"
        view: "diagrams",
      },
      initialStationState(),
      {
        objectives: {}, // id -> {attempts, passed, firstAttemptPass, lastFeedback, hintLevel}
        hintsUsed: 0,
        quiz: { answers: {}, correct: 0, total: 0, submitted: false, attempt: 1 },
        visitedSheets: [],
        briefingRead: false,
        completedShown: false,
        startedAt: Date.now(),
        updatedAt: Date.now(),
      }
    );
  }

  function deepClone(v) {
    return JSON.parse(JSON.stringify(v));
  }

  /* ------------------------------------------------------------ store --- */

  var listeners = [];
  var state = freshState();

  function notify() {
    listeners.forEach(function (fn) {
      fn();
    });
  }

  function commit(next) {
    state = next;
    save();
    notify();
  }

  function save() {
    try {
      var persisted = Object.assign({}, state);
      delete persisted.hydrated; // parity with the original's partialize()
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: persisted, version: 0 }));
    } catch (e) {
      /* storage unavailable (private mode) — lab still runs for the session */
    }
  }

  function load() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return; // pristine first visit
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || !parsed.state) return;
      if (parsed.version !== 0) return; // unknown format — start pristine (zustand bails the same way)
      // zustand-style SHALLOW merge of persisted state over a fresh state
      state = Object.assign(freshState(), parsed.state);
    } catch (e) {
      state = freshState();
    }
  }

  /* ------------------------------------------------------------ actions - */

  var actions = {
    setMode: function (m) {
      commit(
        Object.assign({}, state, { mode: m, phase: "brief", startedAt: Date.now(), view: "diagrams" })
      );
    },
    goBrief: function () {
      commit(Object.assign({}, state, { phase: "brief" }));
    },
    startWork: function () {
      commit(Object.assign({}, state, { phase: "work", briefingRead: true }));
    },
    setView: function (v) {
      var visited = state.visitedSheets.indexOf(v) >= 0 ? state.visitedSheets : state.visitedSheets.concat([v]);
      commit(Object.assign({}, state, { view: v, visitedSheets: visited }));
    },
    /** Draft-style mutation: deep-clones every object slice, applies fn, saves. */
    mutate: function (fn) {
      var next = Object.assign({}, state);
      CLONE_KEYS.forEach(function (k) {
        next[k] = deepClone(state[k]);
      });
      fn(next);
      next.updatedAt = Date.now();
      commit(next);
    },
    checkObjective: function (id) {
      if (!state.mode) return;
      var def = LabObjectives.objectivesFor(state.mode).filter(function (o) { return o.id === id; })[0];
      if (!def) return;
      var prev = state.objectives[id];
      var outcome = def.check(state);
      var attemptNo = (prev && prev.attempts ? prev.attempts : 0) + 1;
      var result = {
        attempts: attemptNo,
        passed: outcome.pass,
        firstAttemptPass:
          outcome.pass && attemptNo === 1
            ? true
            : prev && typeof prev.firstAttemptPass === "boolean"
              ? prev.firstAttemptPass
              : false,
        lastFeedback: outcome.feedback,
        hintLevel: prev ? prev.hintLevel : 0,
      };
      var objectives = Object.assign({}, state.objectives);
      objectives[id] = result;
      commit(Object.assign({}, state, { objectives: objectives, updatedAt: Date.now() }));
    },
    useHint: function (id) {
      var prev = state.objectives[id];
      var max = state.mode === "hard" ? 1 : 3;
      var level = Math.min(((prev && prev.hintLevel) || 0) + 1, max);
      if ((prev ? prev.hintLevel || 0 : 0) >= max) return; // exhausted — no-op (no save)
      var objectives = Object.assign({}, state.objectives);
      objectives[id] = {
        attempts: prev ? prev.attempts : 0,
        passed: prev ? prev.passed : false,
        firstAttemptPass: prev ? prev.firstAttemptPass : false,
        lastFeedback: prev ? prev.lastFeedback : "",
        hintLevel: level,
      };
      commit(
        Object.assign({}, state, { objectives: objectives, hintsUsed: state.hintsUsed + 1, updatedAt: Date.now() })
      );
    },
    answerQuiz: function (itemId, idx) {
      var answers = Object.assign({}, state.quiz.answers);
      answers[itemId] = idx;
      var quiz = Object.assign({}, state.quiz, { answers: answers });
      commit(Object.assign({}, state, { quiz: quiz })); // updatedAt untouched (parity)
    },
    submitQuiz: function () {
      if (!state.mode) return;
      var g = LabQuiz.grade(state, state.mode);
      var quiz = Object.assign({}, state.quiz, { correct: g.correct, total: g.total, submitted: true });
      commit(Object.assign({}, state, { quiz: quiz, updatedAt: Date.now() }));
    },
    // A failed quiz may be retaken WITHOUT wiping the banked objective work.
    // Pass mark and items are unchanged — this does not weaken difficulty.
    retakeQuiz: function () {
      var quiz = { answers: {}, correct: 0, total: 0, submitted: false, attempt: (state.quiz.attempt || 0) + 1 };
      commit(Object.assign({}, state, { quiz: quiz, updatedAt: Date.now() }));
    },
    markCompletedShown: function () {
      commit(Object.assign({}, state, { completedShown: true }));
    },
    /** Confirmed reset: wipes everything, writes the pristine state back to storage. */
    reset: function () {
      commit(freshState());
    },
  };

  /* ---------------------------------------------------------- selectors - */

  function currentObjectives(s) {
    return s.mode ? LabObjectives.objectivesFor(s.mode) : [];
  }

  function objectiveProgress(s) {
    var objs = currentObjectives(s);
    var done = objs.filter(function (o) {
      return s.objectives[o.id] && s.objectives[o.id].passed;
    }).length;
    return { done: done, total: objs.length, ratio: objs.length ? done / objs.length : 0 };
  }

  function quizPassed(s) {
    return s.quiz.submitted && s.quiz.total > 0 && s.quiz.correct / s.quiz.total >= QUIZ_PASS;
  }

  function allDone(s) {
    var p = objectiveProgress(s);
    return p.total > 0 && p.done === p.total && quizPassed(s);
  }

  /** Star rating: first-attempt accuracy + hint usage (documented formula). */
  function starRating(s) {
    var objs = currentObjectives(s);
    if (!objs.length) return 0;
    var results = objs
      .map(function (o) { return s.objectives[o.id]; })
      .filter(Boolean);
    var firstRatio = results.filter(function (r) { return r.firstAttemptPass; }).length / objs.length;
    var base = 1 + 4 * firstRatio; // 1..5
    var penalty = s.mode === "hard" ? 0.5 * s.hintsUsed : 0.25 * s.hintsUsed;
    return Math.max(1, Math.min(5, Math.round(base - penalty)));
  }

  function nextRecommendedSheet(s) {
    var objs = currentObjectives(s);
    for (var i = 0; i < objs.length; i++) {
      if (!s.objectives[objs[i].id] || !s.objectives[objs[i].id].passed) return objs[i].sheet;
    }
    return null;
  }

  /* --------------------------------------------------------------- boot - */

  load();

  window.LabStore = {
    STORAGE_KEY: STORAGE_KEY,
    get state() { return state; },
    subscribe: function (fn) {
      listeners.push(fn);
      return function () {
        listeners = listeners.filter(function (f) { return f !== fn; });
      };
    },
    actions: actions,
    currentObjectives: currentObjectives,
    objectiveProgress: objectiveProgress,
    quizPassed: quizPassed,
    allDone: allDone,
    starRating: starRating,
    nextRecommendedSheet: nextRecommendedSheet,
  };
})();
