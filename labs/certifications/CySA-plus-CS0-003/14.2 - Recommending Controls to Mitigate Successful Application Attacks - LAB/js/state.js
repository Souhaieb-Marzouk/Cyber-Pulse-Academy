/* ==========================================================================
   GATEHOUSE lab — js/state.js
   Single plain-JS state store with localStorage persistence and a tiny
   subscribe/notify mechanism. Ported 1:1 from the original framework lab's
   zustand store (src/components/cyberlab/store.ts): same state shape, same
   persistence key, same save/restore/RESET semantics.
   ========================================================================== */
(function () {
  "use strict";
  var GH = (window.GH = window.GH || {});

  var KEY = "gatehouse-cs0-003-lesson-14-2-v1";

  /** Fresh lab state — mirrors initialLabState() in the original. */
  function initialLabState() {
    return {
      booted: false,
      mode: null,
      controls: Object.assign({}, GH.INITIAL_CONTROLS),
      sim: {},
      matchPairs: {},
      buckets: {},
      encChoices: {},
      dataSources: [],
      triage: {},
      rules: [
        { id: "r1", field: "filename", op: "ends_with", value: "" },
        { id: "r2", field: "content", op: "contains", value: "" },
      ],
      ruleTest: null,
      seq: [],
      h1: { endpoint: "", file: "", account: "" },
      h2: { sqli: "", scan: "" },
      h3: [],
      h8: { controls: [], residual: "" },
      h10: {},
      objState: {},
      quizAnswers: {},
      quizScored: false,
      completed: false,
      lastCompletion: null,
      /* transient — never persisted (matches the original's partialize list) */
      activeStage: "brief",
      checkResults: {},
      glossaryOpen: false,
      completionOpen: false,
      objectivesOpen: false,
    };
  }

  /** Keys that ARE persisted (identical to the original's partialize). */
  var PERSIST_KEYS = [
    "booted",
    "mode",
    "controls",
    "sim",
    "matchPairs",
    "buckets",
    "encChoices",
    "dataSources",
    "triage",
    "rules",
    "ruleTest",
    "seq",
    "h1",
    "h2",
    "h3",
    "h8",
    "h10",
    "objState",
    "quizAnswers",
    "quizScored",
    "completed",
    "lastCompletion",
    "activeStage",
    "checkResults",
  ];

  var state = initialLabState();
  GH.state = state;

  /* Restore persisted state (synchronous localStorage — same semantics as the
     original's zustand persist, minus the SSR hydration dance which does not
     apply to a static page). */
  (function loadPersisted() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (!raw) return;
      var data = JSON.parse(raw);
      if (!data || typeof data !== "object") return;
      PERSIST_KEYS.forEach(function (k) {
        if (data[k] !== undefined) state[k] = data[k];
      });
    } catch (e) {
      /* degrade gracefully — lab still works without persistence */
    }
  })();

  /* ------------------------------ pub / sub -------------------------------- */

  var listeners = [];

  /**
   * Register a listener. `keys` is an array of state keys; the listener fires
   * on commit only when one of those keys changed. `null` fires always.
   * `scope` tags the listener so stage-scoped widgets can be unregistered.
   */
  GH.on = function (keys, fn, scope) {
    var entry = {
      keys: keys ? keys.slice() : null,
      fn: fn,
      scope: scope || null,
    };
    listeners.push(entry);
    return entry;
  };

  GH.off = function (entry) {
    var i = listeners.indexOf(entry);
    if (i !== -1) listeners.splice(i, 1);
  };

  /** Remove every listener registered under a scope (used on stage switch). */
  GH.offScope = function (scope) {
    listeners = listeners.filter(function (l) {
      return l.scope !== scope;
    });
  };

  /* ------------------------------- persistence ----------------------------- */

  function persist() {
    try {
      var out = {};
      PERSIST_KEYS.forEach(function (k) {
        out[k] = state[k];
      });
      window.localStorage.setItem(KEY, JSON.stringify(out));
    } catch (e) {
      /* degrade gracefully */
    }
  }

  /**
   * Shallow-merge a patch into state, persist it, and notify listeners whose
   * watched keys changed (reference equality, like zustand's selector model).
   */
  function commit(patch) {
    var changed = [];
    for (var k in patch) {
      if (!Object.prototype.hasOwnProperty.call(patch, k)) continue;
      if (state[k] !== patch[k]) changed.push(k);
      state[k] = patch[k];
    }
    if (!changed.length) return;
    persist();
    listeners.slice().forEach(function (l) {
      if (!l.keys) {
        l.fn();
        return;
      }
      for (var i = 0; i < l.keys.length; i++) {
        if (changed.includes(l.keys[i])) {
          l.fn();
          return;
        }
      }
    });
  }

  GH.commit = commit;

  /* -------------------------------- actions -------------------------------- */
  /* Every action mirrors the original zustand store one-for-one. */

  var actions = {
    setGlossaryOpen: function (b) {
      commit({ glossaryOpen: b });
    },
    setCompletionOpen: function (b) {
      commit({ completionOpen: b });
    },
    setObjectivesOpen: function (b) {
      commit({ objectivesOpen: b });
    },
    setBooted: function (b) {
      commit({ booted: b });
    },
    chooseMode: function (m) {
      commit({ mode: m, booted: true, activeStage: "brief" });
    },

    setControl: function (k, v) {
      var controls = Object.assign({}, state.controls);
      controls[k] = v;
      commit({ controls: controls });
    },

    runRequest: function (id) {
      var req = null;
      for (var i = 0; i < GH.REQUESTS.length; i++) {
        if (GH.REQUESTS[i].id === id) {
          req = GH.REQUESTS[i];
          break;
        }
      }
      if (!req) return;
      var outcome = GH.simulate(req, state.controls);
      var sim = Object.assign({}, state.sim);
      sim[id] = outcome;
      commit({ sim: sim });
    },

    setPair: function (attack, mech) {
      var matchPairs = Object.assign({}, state.matchPairs);
      matchPairs[attack] = mech;
      commit({ matchPairs: matchPairs });
    },

    setBucket: function (chip, bucket) {
      var buckets = Object.assign({}, state.buckets);
      buckets[chip] = bucket;
      commit({ buckets: buckets });
    },

    setEnc: function (ctx, opt) {
      var encChoices = Object.assign({}, state.encChoices);
      encChoices[ctx] = opt;
      commit({ encChoices: encChoices });
    },

    toggleDataSource: function (id) {
      var has = state.dataSources.includes(id);
      var dataSources = has
        ? state.dataSources.filter(function (d) {
            return d !== id;
          })
        : state.dataSources.concat([id]);
      commit({ dataSources: dataSources });
    },

    setTriage: function (id, v) {
      var triage = Object.assign({}, state.triage);
      triage[id] = v;
      commit({ triage: triage });
    },

    setRule: function (idx, patch) {
      var rules = state.rules.map(function (r, i) {
        return i === idx ? Object.assign({}, r, patch) : r;
      });
      commit({ rules: rules, ruleTest: null });
    },

    testRules: function () {
      var res = GH.runRules(state.rules, GH.UPLOAD_SAMPLES);
      commit({ ruleTest: { mal: res.mal, ben: res.ben, ran: true } });
    },

    moveSeq: function (id, dir) {
      var seq = state.seq.slice();
      var i = seq.indexOf(id);
      var j = i + dir;
      if (i === -1 || j < 0 || j >= seq.length) return;
      var tmp = seq[i];
      seq[i] = seq[j];
      seq[j] = tmp;
      commit({ seq: seq });
    },

    /** Remove a step from the sequence (OrderList X button). */
    removeSeq: function (id) {
      commit({ seq: state.seq.filter(function (x) { return x !== id; }) });
    },

    /** Append a step (dedupe guard: a rapid double-click must never append twice). */
    addSeq: function (id) {
      if (state.seq.includes(id)) return;
      commit({ seq: state.seq.concat([id]) });
    },

    setH1: function (k, v) {
      var h1 = Object.assign({}, state.h1);
      h1[k] = v;
      commit({ h1: h1 });
    },
    setH2: function (k, v) {
      var h2 = Object.assign({}, state.h2);
      h2[k] = v;
      commit({ h2: h2 });
    },

    toggleH3: function (id) {
      var h3 = state.h3.includes(id)
        ? state.h3.filter(function (x) { return x !== id; })
        : state.h3.concat([id]);
      commit({ h3: h3 });
    },

    toggleH8: function (id) {
      var controls = state.h8.controls.includes(id)
        ? state.h8.controls.filter(function (x) { return x !== id; })
        : state.h8.controls.concat([id]);
      commit({ h8: Object.assign({}, state.h8, { controls: controls }) });
    },
    setH8Residual: function (v) {
      commit({ h8: Object.assign({}, state.h8, { residual: v }) });
    },
    setH10: function (stage, defense) {
      var h10 = Object.assign({}, state.h10);
      h10[stage] = defense;
      commit({ h10: h10 });
    },

    /* R2 answer lock: once the check has been scored, answers are frozen. */
    setQuizAnswer: function (id, idx) {
      if (state.quizScored) return;
      var quizAnswers = Object.assign({}, state.quizAnswers);
      quizAnswers[id] = idx;
      commit({ quizAnswers: quizAnswers });
    },

    scoreQuiz: function () {
      commit({ quizScored: true });
    },

    check: function (objId) {
      if (!state.mode) return;
      var result = GH.checkObjective(objId, state, state.mode);
      var prev =
        state.objState[objId] ||
        { done: false, attempts: 0, hints: 0, firstTry: false };
      var next = {
        done: prev.done || result.pass,
        attempts: prev.attempts + 1,
        hints: prev.hints,
        firstTry: prev.firstTry || (result.pass && prev.attempts === 0),
      };
      var objState = Object.assign({}, state.objState);
      objState[objId] = next;
      var checkResults = Object.assign({}, state.checkResults);
      checkResults[objId] = result;
      commit({ objState: objState, checkResults: checkResults });
    },

    revealHint: function (objId) {
      if (!state.mode) return;
      var max = state.mode === "medium" ? 3 : 1;
      var prev =
        state.objState[objId] ||
        { done: false, attempts: 0, hints: 0, firstTry: false };
      var objState = Object.assign({}, state.objState);
      objState[objId] = Object.assign({}, prev, {
        hints: Math.min(prev.hints + 1, max),
      });
      commit({ objState: objState });
    },

    setActiveStage: function (s) {
      commit({ activeStage: s });
    },

    completeLab: function () {
      if (!state.mode) return;
      var defs = GH.OBJECTIVES[state.mode];
      var stars = GH.starRating(state.objState, defs.length);
      var doneCount = Object.keys(state.objState).filter(function (k) {
        return state.objState[k] && state.objState[k].done;
      }).length;
      commit({
        completed: true,
        lastCompletion: {
          stars: stars.stars,
          objPct: Math.round((doneCount / defs.length) * 100),
          quizPct: GH.quizPct(state, state.mode),
        },
      });
    },

    resetAll: function () {
      try {
        window.localStorage.removeItem(KEY);
      } catch (e) {
        /* ignore */
      }
      window.location.reload();
    },
  };

  GH.actions = actions;

  /** Reset all transient UI flags to a pristine lab (used after RESET before reload). */
  GH.initialLabState = initialLabState;
})();
