// ─── Blueprint Studio · persistent lab store (vanilla JS port of zustand) ───
// Recreates the original store 1:1:
//   · same localStorage key and JSON envelope {"state":{...},"version":0}
//   · same persisted field set (partialize)
//   · same action semantics (incl. hard-mode hint cap, latch-on-pass,
//     quiz stamp-and-lock, Fisher-Yates reshuffle on lab entry)
// Tiny subscribe/notify mechanism; the UI re-renders subscribed regions.

(function () {
  'use strict';

  var STORAGE_KEY = 'cv0004-l22-blueprint-studio-v2';

  var PILLAR_LABEL = {
    P1: 'UNDERSTAND',
    P2: 'RECOGNIZE',
    P3: 'DETECT',
    P4: 'MITIGATE',
  };

  // ── Pristine state ─────────────────────────────────────────────────────────

  function freshObjectives() {
    var o = {};
    var defs = MEDIUM_OBJECTIVES.concat(HARD_OBJECTIVES);
    for (var i = 0; i < defs.length; i++) {
      o[defs[i].id] = { done: false, attempts: 0, firstTry: false, hintsUsed: 0, lastResult: null };
    }
    return o;
  }

  function pristineState() {
    return {
      hydrated: true,           // static port hydrates synchronously
      screen: 'mode-select',
      mode: null,
      sheet: 0,                 // 0..5
      drawer: 0,                // 0..4
      legendOpen: false,
      env: deepCopy(initialEnv),
      objectives: freshObjectives(),
      quiz: { answers: {}, checked: {}, submitted: false },
      pipelineRun: 'run412',
      completedAt: null,
      lastCheck: null,
      showCompletion: false,
    };
  }

  function deepCopy(v) {
    return JSON.parse(JSON.stringify(v));
  }

  // ── Persistence (same envelope + field set as zustand/persist) ─────────────

  function partialize(s) {
    return {
      screen: s.screen,
      mode: s.mode,
      sheet: s.sheet,
      drawer: s.drawer,
      env: s.env,
      objectives: s.objectives,
      quiz: s.quiz,
      pipelineRun: s.pipelineRun,
      completedAt: s.completedAt,
    };
  }

  function storageAvailable() {
    try {
      var k = '__bp_probe__';
      window.localStorage.setItem(k, k);
      window.localStorage.removeItem(k);
      return true;
    } catch (e) {
      return false;
    }
  }

  function loadPersisted() {
    if (!storageAvailable()) return null;
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || !parsed.state) return null;
      return parsed.state;
    } catch (e) {
      return null;
    }
  }

  function persist(state) {
    if (!storageAvailable()) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ state: partialize(state), version: 0 })
      );
    } catch (e) {
      /* storage full/blocked — lab keeps working in-memory, as the original does */
    }
  }

  // ── Fisher–Yates (client-side only, same as the original's enterLab) ───────

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // ── Store ──────────────────────────────────────────────────────────────────

  var state = pristineState();
  var listeners = [];

  // Rehydrate: shallow top-level merge (same as zustand's default merge),
  // then the defensive `quiz.checked` normalization from the original.
  var saved = loadPersisted();
  if (saved) {
    var base = pristineState();
    var keys = Object.keys(partialize(base));
    for (var k = 0; k < keys.length; k++) {
      var key = keys[k];
      if (saved[key] !== undefined && saved[key] !== null) state[key] = saved[key];
    }
    if (state.mode && (state.screen === 'lab')) {
      // normalize legacy quiz shape (defensive, mirrors onRehydrateStorage)
      if (!state.quiz) state.quiz = { answers: {}, checked: {}, submitted: false };
      if (!state.quiz.checked) state.quiz = Object.assign({}, state.quiz, { checked: {} });
      if (!state.env) state.env = deepCopy(initialEnv);
    }
    if (state.screen !== 'lab' || !state.mode) {
      state.screen = 'mode-select';
      state.mode = null;
    }
  }
  persist(state); // keep the envelope fresh from the first moment, like the original

  function set(patch) {
    for (var key in patch) {
      if (Object.prototype.hasOwnProperty.call(patch, key)) state[key] = patch[key];
    }
    persist(state);
    notify();
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

  function patchEnv(p) {
    var env = Object.assign({}, state.env, p);
    set({ env: env });
  }

  function toggleInArray(arrName, id) {
    var cur = state.env[arrName];
    var next = cur.indexOf(id) >= 0 ? cur.filter(function (x) { return x !== id; }) : cur.concat([id]);
    patchEnv(arr2patch(arrName, next));
  }
  function arr2patch(name, value) {
    var p = {}; p[name] = value; return p;
  }

  // orderToggle: click an ordering card. Decoys are removed from the order;
  // non-decoys toggle off if present; else append while under the cap.
  function orderToggle(key, id, decoy, max) {
    var cur = state.env[key].slice();
    var next;
    if (decoy) {
      next = cur.filter(function (x) { return x !== id; });
    } else if (cur.indexOf(id) >= 0) {
      next = cur.filter(function (x) { return x !== id; });
    } else if (cur.length < max) {
      next = cur.concat([id]);
    } else {
      next = cur;
    }
    patchEnv(arr2patch(key, next));
  }

  var store = {
    getState: function () { return state; },
    subscribe: subscribe,
    PILLAR_LABEL: PILLAR_LABEL,

    setHydrated: function () { set({ hydrated: true }); },

    // R6: reshuffle all pairing/ordering displays on every lab entry.
    enterLab: function (m) {
      set({
        screen: 'lab',
        mode: m,
        sheet: 0,
        env: Object.assign({}, state.env, {
          benefitOrder: shuffle(Object.keys(BENEFIT_DEFS)),
          toolCatOrder: shuffle(TOOL_CATEGORIES.map(function (c) { return c.id; })),
          h9CardOrder: shuffle(H9_CARDS.map(function (c) { return c.id; })),
          h4StepOrder: shuffle(H4_STEPS.map(function (o) { return o.id; })),
          h6StepOrder: shuffle(H6_STEPS.map(function (o) { return o.id; })),
        }),
      });
    },

    backToModeSelect: function () { set({ screen: 'mode-select' }); },
    setSheet: function (n) { set({ sheet: n }); },
    setDrawer: function (n) { set({ drawer: n }); },
    setLegendOpen: function (v) { set({ legendOpen: v }); },
    setShowCompletion: function (v) { set({ showCompletion: v }); },
    setPipelineRun: function (id) { set({ pipelineRun: id }); },

    patchEnv: patchEnv,
    toggleLineClick: function (n) { toggleInArray('clickedLines', n); },
    toggleFlag: function (n) { toggleInArray('flaggedLines', n); },
    orderToggle: orderToggle,
    arrayToggleNum: toggleInArray,
    arrayToggleStr: function (key, id) { toggleInArray(key, id); },

    setBenefitPair: function (term, desc) {
      var pairs = Object.assign({}, state.env.benefitsPairs);
      pairs[term] = desc;
      patchEnv({ benefitsPairs: pairs });
    },
    setDi: function (id, v) {
      var d = Object.assign({}, state.env.diClassify);
      d[id] = v;
      patchEnv({ diClassify: d });
    },
    setTool: function (tool, cat) {
      var t = Object.assign({}, state.env.toolAssign);
      t[tool] = cat;
      patchEnv({ toolAssign: t });
    },
    setPlanAnswer: function (k, v) {
      var p = Object.assign({}, state.env.planAnswers);
      p[k] = v;
      patchEnv({ planAnswers: p });
    },
    setPlanText: function (k, v) {
      var p = Object.assign({}, state.env.planAnswers);
      p[k] = v;
      patchEnv({ planAnswers: p });
    },
    toggleDriftMark: function (row) { toggleInArray('driftMarks', row); },
    setDriftClass: function (row, v) {
      var d = Object.assign({}, state.env.driftClass);
      d[row] = v;
      patchEnv({ driftClass: d });
    },
    toggleF1Action: function (a) { toggleInArray('f1Actions', a); },
    setScanClass: function (id, v) {
      var d = Object.assign({}, state.env.scanClass);
      d[id] = v;
      patchEnv({ scanClass: d });
    },
    setRule: function (which, patch) {
      var rule = Object.assign({}, state.env[which], patch);
      var p = {}; p[which] = rule;
      patchEnv(p);
    },

    useHint: function (id) {
      var cur = state.objectives[id];
      var hints = cur ? cur.hintsUsed : 0;
      // Hard mode contract: a single paid nudge; Medium: three tiers.
      var cap = state.mode === 'hard' ? 1 : 3;
      var next = Object.assign({}, state.objectives);
      next[id] = Object.assign({}, cur, { hintsUsed: Math.min(cap, hints + 1) });
      set({ objectives: next });
    },

    checkObjective: function (id, validate, success, fail) {
      var pass = validate(state.env);
      var prev = state.objectives[id] ||
        { done: false, attempts: 0, firstTry: false, hintsUsed: 0, lastResult: null };
      var attempts = prev.attempts + 1;
      var firstTry = prev.done ? prev.firstTry : (pass && attempts === 1);
      var outcome = { pass: pass, firstTry: firstTry, message: pass ? success : fail };
      var next = Object.assign({}, state.objectives);
      next[id] = {
        done: prev.done || pass,
        attempts: attempts,
        firstTry: firstTry,
        hintsUsed: prev.hintsUsed,
        lastResult: pass ? 'pass' : 'fail',
      };
      set({ objectives: next, lastCheck: { id: id, outcome: outcome } });
      return outcome;
    },

    setQuizAnswer: function (q, a) {
      var answers = Object.assign({}, state.quiz.answers);
      answers[q] = a;
      set({ quiz: Object.assign({}, state.quiz, { answers: answers }) });
    },
    // R2: locks the question after its validating press
    checkQuizAnswer: function (q) {
      var checked = Object.assign({}, state.quiz.checked);
      checked[q] = true;
      set({ quiz: Object.assign({}, state.quiz, { checked: checked }) });
    },
    submitQuiz: function () {
      set({ quiz: Object.assign({}, state.quiz, { submitted: true }) });
    },

    resetAll: function () {
      state = pristineState();
      set({}); // persist + notify (state already replaced)
      persist(state);
    },
  };

  // ── Derived helpers (same formulas as the original store) ──────────────────

  function objectivesForMode(mode) {
    if (mode === 'hard') return HARD_OBJECTIVES;
    return MEDIUM_OBJECTIVES;
  }

  function progressFor(mode, objectives) {
    var list = objectivesForMode(mode);
    var done = 0;
    for (var i = 0; i < list.length; i++) {
      var st = objectives[list[i].id];
      if (st && st.done) done++;
    }
    return { done: done, total: list.length, pct: list.length ? Math.round((done / list.length) * 100) : 0 };
  }

  function starScore(mode, objectives) {
    var list = objectivesForMode(mode);
    if (!list.length) return { score: 0, stars: 0, firstTryPct: 0, hints: 0 };
    var firstTry = 0, hints = 0, done = 0;
    for (var i = 0; i < list.length; i++) {
      var st = objectives[list[i].id];
      if (!st) continue;
      if (st.done) done++;
      if (st.done && st.firstTry) firstTry++;
      hints += st.hintsUsed;
    }
    var firstTryPct = Math.round((firstTry / list.length) * 100);
    var penalty = mode === 'hard' ? hints * 5 : hints * 2;
    var score = Math.max(0, Math.round(firstTryPct - penalty));
    var stars = score >= 90 ? 5 : score >= 75 ? 4 : score >= 60 ? 3 : score >= 40 ? 2 : (done === list.length ? 1 : 0);
    return { score: score, stars: stars, firstTryPct: firstTryPct, hints: hints };
  }

  function quizScore(mode, quiz) {
    var bank = mode === 'hard' ? QUIZ_HARD : QUIZ_MEDIUM;
    var correct = 0;
    bank.forEach(function (item, i) {
      if (quiz.answers[i] === item.correct) correct++;
    });
    return { correct: correct, total: bank.length };
  }

  store.objectivesForMode = objectivesForMode;
  store.progressFor = progressFor;
  store.starScore = starScore;
  store.quizScore = quizScore;

  window.LabStore = store;
})();
