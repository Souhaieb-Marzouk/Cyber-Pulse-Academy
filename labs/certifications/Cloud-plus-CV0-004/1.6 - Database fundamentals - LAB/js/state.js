// ---------------------------------------------------------------------------
// state.js — lab state, persistence and derived scoring.
// Plain-JS re-creation of the framework lab's zustand store
// (src/lib/lab/store.ts): the SAME persistence key, the SAME partialized
// state shape ({ state, version: 1 } wrapper), the SAME save/restore/RESET
// semantics and the SAME scoring formula.
//
// A tiny subscribe/notify mechanism replaces zustand; views re-render only
// what changed (see ui.js / app.js).
// ---------------------------------------------------------------------------

// eslint-disable-next-line no-undef
var LabStore = (function () {
  'use strict';

  var STORAGE_KEY = LAB_STORAGE_KEY; // 'meridian-drafting-room-cv0-004-1-6-v1' — identical to the original
  var VERSION = 1; // persisted schema version — identical to the original

  // ---------- Pristine environment (mirrors emptyEnv()) ----------
  function emptyEnv() {
    return {
      core: {
        propertySort: {},
        acid: { atomicity: false, consistency: false, isolation: false, durability: false },
        acidCrashTestRun: false,
        acidAnswer: '',
      },
      matcher: {},
      sandbox: {
        replicationFactor: 2,
        writeMode: 'async',
        partition: false,
        servicePolicy: { checkout: '', recs: '' },
        consistencyMode: { billing: '', watchlist: '' },
        baseAnswer: '',
        hardAnswers: { conflicts: '', currentReads: '', lost: '' },
      },
      scale: {
        replicas: 0,
        instanceClass: 'small',
        pooling: false,
        sharded: false,
        shardKey: '',
        shardJustify: {},
        toolMatch: {},
        loadLevel: 1,
      },
      ops: { diagnosis: {}, applied: [], noise: {} },
      resilience: {
        autoBackups: true,
        pitr: false,
        retentionDays: 7,
        snapshotSchedule: false,
        crossRegion: false,
        crossAccount: false,
        offlineVault: false,
        multiAz: false,
        failoverTestRun: false,
        actionLog: [],
      },
      security: {
        encryptRest: false,
        tls: false,
        iamAuth: false,
        publicAccess: true,
        audit: false,
        secretsManager: false,
        mitre1: '',
        mitre2: '',
      },
      studio: {
        serviceModel: { caseA: '', caseB: '' },
        tradeoffMatch: {},
        olapMatch: {},
        cacheDurability: '',
        normalForm: '',
        decomposition: '',
        migrationTypes: { oracle: '', pg: '' },
        migrationSteps: [],
      },
      signoffMemo: {},
    };
  }

  function quizCount(mode) {
    return mode === 'medium' ? QUIZ_MEDIUM.length : QUIZ_HARD.length;
  }

  // Pristine state = what resetAll() restores (announcement/stamp are
  // transient and NOT persisted, exactly like the original's partialize).
  function pristineState() {
    return {
      screen: 'mode-select',
      mode: 'medium',
      activeSheet: 'briefing',
      visited: [],
      env: emptyEnv(),
      results: {},
      quiz: { answers: [], submitted: [], finished: false },
      completedAt: null,
      stamp: null,
      announcement: '',
    };
  }

  var state = pristineState();
  state.hydrateDone = false;

  var listeners = new Set();

  function getState() {
    return state;
  }

  function subscribe(fn) {
    listeners.add(fn);
    return function unsubscribe() {
      listeners.delete(fn);
    };
  }

  // ---------- Persistence (same wrapper shape as zustand persist) ----------
  function persist() {
    try {
      var partial = {
        screen: state.screen,
        mode: state.mode,
        activeSheet: state.activeSheet,
        visited: state.visited,
        env: state.env,
        results: state.results,
        quiz: state.quiz,
        completedAt: state.completedAt,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: partial, version: VERSION }));
    } catch (e) {
      /* storage unavailable — degrade gracefully, as the original does */
    }
  }

  function restore() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== VERSION || !parsed.state) return;
      var s = parsed.state;
      // Merge over pristine defaults so a shorter/older payload still hydrates.
      state.screen = s.screen === 'mode-select' || s.screen === 'lab' ? s.screen : 'mode-select';
      state.mode = s.mode === 'hard' ? 'hard' : 'medium';
      state.activeSheet = s.activeSheet || 'briefing';
      state.visited = Array.isArray(s.visited) ? s.visited : [];
      state.env = s.env && typeof s.env === 'object' ? s.env : emptyEnv();
      state.results = s.results && typeof s.results === 'object' ? s.results : {};
      state.quiz =
        s.quiz && typeof s.quiz === 'object'
          ? { answers: s.quiz.answers || [], submitted: s.quiz.submitted || [], finished: !!s.quiz.finished }
          : { answers: [], submitted: [], finished: false };
      // Guard: keep quiz arrays sized to the persisted mode's bank length.
      var n = quizCount(state.mode);
      while (state.quiz.answers.length < n) state.quiz.answers.push(null);
      while (state.quiz.submitted.length < n) state.quiz.submitted.push(false);
      state.completedAt = typeof s.completedAt === 'number' ? s.completedAt : null;
    } catch (e) {
      /* corrupted or unavailable storage — start pristine */
    }
  }

  // ---------- Core setter ----------
  function set(patch) {
    for (var k in patch) {
      if (Object.prototype.hasOwnProperty.call(patch, k)) state[k] = patch[k];
    }
    persist();
    listeners.forEach(function (fn) {
      fn(state);
    });
  }

  // ---------- Actions (semantics mirror store.ts exactly) ----------
  var actions = {
    setHydrated: function () {
      set({ hydrateDone: true });
    },

    startMode: function (m) {
      var fresh = pristineState();
      fresh.hydrateDone = true;
      fresh.mode = m;
      fresh.screen = 'lab';
      fresh.activeSheet = 'briefing';
      fresh.visited = ['briefing'];
      fresh.quiz = {
        answers: Array.apply(null, Array(quizCount(m))).map(function () {
          return null;
        }),
        submitted: Array.apply(null, Array(quizCount(m))).map(function () {
          return false;
        }),
        finished: false,
      };
      set(fresh);
    },

    resetAll: function () {
      var fresh = pristineState();
      fresh.hydrateDone = true;
      set(fresh);
    },

    setActiveSheet: function (sId) {
      set({
        activeSheet: sId,
        visited: state.visited.indexOf(sId) !== -1 ? state.visited : state.visited.concat([sId]),
      });
    },

    updateEnv: function (fn) {
      set({ env: fn(state.env) });
    },

    checkObjective: function (id) {
      var def = getObjective(id);
      if (!def) throw new Error('Unknown objective ' + id);
      var result = def.validate(state.env);
      var prev = state.results[id];
      var next = {
        passed: result.pass || (prev && prev.passed) || false,
        attempts: ((prev && prev.attempts) || 0) + 1,
        passedFirstTry:
          (prev && prev.passedFirstTry) || (((prev && prev.attempts) || 0) === 0 && result.pass),
        hintsUsed: prev ? prev.hintsUsed : 0,
        lastResult: result.pass ? 'pass' : 'fail',
      };
      var outcome = {
        objectiveId: id,
        result: result.pass ? 'pass' : 'fail',
        title: result.title,
        teaching: result.teaching,
        nearMiss: result.nearMiss,
        at: Date.now(),
      };
      var results = {};
      Object.keys(state.results).forEach(function (k) {
        results[k] = state.results[k];
      });
      results[id] = next;
      set({
        results: results,
        stamp: outcome,
        announcement: def.title + ': ' + (result.pass ? 'approved' : 'revise') + '. ' + result.title,
      });
      return outcome;
    },

    revealHint: function (id) {
      var prev =
        state.results[id] || { passed: false, attempts: 0, passedFirstTry: false, hintsUsed: 0, lastResult: null };
      var cap = state.mode === 'medium' ? 3 : 1;
      var results = {};
      Object.keys(state.results).forEach(function (k) {
        results[k] = state.results[k];
      });
      results[id] = Object.assign({}, prev, { hintsUsed: Math.min(cap, prev.hintsUsed + 1) });
      var def = getObjective(id);
      set({
        results: results,
        announcement: 'Hint revealed for ' + (def ? def.title : id),
      });
    },

    answerQuiz: function (index, choice) {
      var answers = state.quiz.answers.slice();
      answers[index] = choice;
      set({ quiz: Object.assign({}, state.quiz, { answers: answers }) });
    },

    submitQuizItem: function (index) {
      var submitted = state.quiz.submitted.slice();
      submitted[index] = true;
      var a = state.quiz.answers[index];
      var bank = state.mode === 'medium' ? QUIZ_MEDIUM : QUIZ_HARD;
      var ok = a === bank[index].correct;
      set({
        quiz: Object.assign({}, state.quiz, { submitted: submitted }),
        announcement: 'Quiz item ' + (index + 1) + ': ' + (ok ? 'correct' : 'incorrect') + '. Explanation revealed.',
      });
    },

    finishQuiz: function () {
      set({ quiz: Object.assign({}, state.quiz, { finished: true }) });
    },

    completeLab: function () {
      set({ completedAt: Date.now() });
    },

    clearStamp: function () {
      set({ stamp: null });
    },
  };

  // ---------- Derived selectors / scoring (mirror store.ts exactly) ----------
  function pillarStats(results, mode) {
    var defs = objectivesForMode(mode);
    var byPillar = {
      P1: { done: 0, total: 0 },
      P2: { done: 0, total: 0 },
      P3: { done: 0, total: 0 },
      P4: { done: 0, total: 0 },
    };
    defs.forEach(function (d) {
      byPillar[d.pillar].total += 1;
      if (results[d.id] && results[d.id].passed) byPillar[d.pillar].done += 1;
    });
    return byPillar;
  }

  function approvalsCount(results, mode) {
    var defs = objectivesForMode(mode);
    return defs.filter(function (d) {
      return results[d.id] && results[d.id].passed;
    }).length;
  }

  function computeScore(results, quiz, mode) {
    var defs = objectivesForMode(mode);
    var points = 0;
    defs.forEach(function (d) {
      var r = results[d.id];
      if (!r || !r.passed) return;
      var p = r.passedFirstTry ? 1 : 0.55;
      p = Math.max(0.2, p - r.hintsUsed * 0.1);
      points += p;
    });
    var objScore = defs.length ? points / defs.length : 0;
    var bank = mode === 'medium' ? QUIZ_MEDIUM : QUIZ_HARD;
    var correct = bank.reduce(function (acc, q, i) {
      return acc + (quiz.submitted[i] && quiz.answers[i] === q.correct ? 1 : 0);
    }, 0);
    var quizScore = bank.length ? correct / bank.length : 0;
    var overall = Math.round((0.7 * objScore + 0.3 * quizScore) * 100);
    var stars = overall >= 90 ? 3 : overall >= 70 ? 2 : 1;
    return {
      overall: overall,
      stars: stars,
      objScore: Math.round(objScore * 100),
      quizScore: Math.round(quizScore * 100),
      correct: correct,
      total: bank.length,
    };
  }

  return {
    getState: getState,
    subscribe: subscribe,
    restore: restore,
    persist: persist,
    actions: actions,
    pillarStats: pillarStats,
    approvalsCount: approvalsCount,
    computeScore: computeScore,
    emptyEnv: emptyEnv,
  };
})();
