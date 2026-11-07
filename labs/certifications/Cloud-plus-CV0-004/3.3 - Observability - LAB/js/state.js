// ── Cloud Ward · state store: persistence + pub/sub (logic only, no content) ──
// Faithful port of src/lib/lab/store.ts (zustand → plain JS).
// Same persistence key, same persisted fields, same envelope shape
// (`{"state":{…},"version":0}`), same save/restore/RESET semantics.
(function (global) {
  'use strict';

  const STORAGE_KEY = 'cloudward-cv0004-l33-observability-v1';

  // Persisted-field whitelist — identical to zustand `partialize` in store.ts.
  const PERSIST_FIELDS = [
    'mode', 'started', 'finished', 'answers', 'checks', 'hints', 'env',
    'quizAnswers', 'quizSubmitted', 'seenCore', 'seenDebrief',
  ];

  const pristineEnv = {
    poolFix: false,
    batchFix: false,
    scaleFix: false,
    verified: false,
    logLevelPayment: 'DEBUG',
    logLevelTracker: 'DEBUG',
    agentPayment: false,
    aggregation: 'local',
    retentionHot: 7,
    retentionArchive: 0,
    alertRule: { metric: 'checkout_p95', cmp: '>', threshold: 800, dur: 0, sev: 'P1' },
    triage: {},
    hardTriage: {},
    h5: { collect: 'agentless', level: 'DEBUG', sampling: 100, retention: 'long', widgets: [] },
    h6: [],
    h9: { debug: 'keep', info: 'hot', error: '30', sampling: false },
  };

  const initial = {
    hydrated: false,
    mode: null,
    started: false,
    finished: false,
    answers: {},
    checks: {},
    hints: {},
    env: clone(pristineEnv),
    quizAnswers: {},
    quizSubmitted: {},
    seenCore: false,
    seenDebrief: false,
    lastCheck: null, // never persisted (matches original partialize)
  };

  function clone(v) {
    return JSON.parse(JSON.stringify(v));
  }

  function deepMerge(base, saved) {
    // Persisted blobs are plain JSON produced by the same app — assign field-wise
    // with a deep clone so later mutations never alias storage.
    Object.keys(saved).forEach(function (k) {
      base[k] = clone(saved[k]);
    });
    return base;
  }

  // ── tiny pub/sub store ───────────────────────────────────────────────────────
  const listeners = new Set();
  const store = {
    state: clone(initial),
    get: function () { return store.state; },
    set: function (patch) {
      const p = typeof patch === 'function' ? patch(store.state) : patch;
      if (!p) return; // zustand `return s` no-op path
      store.state = Object.assign({}, store.state, p);
      persist();
      listeners.forEach(function (fn) {
        try { fn(store.state); } catch (e) { /* one bad listener must not kill the rest */ }
      });
    },
    subscribe: function (fn) {
      listeners.add(fn);
      return function () { listeners.delete(fn); };
    },
  };

  function persist() {
    const s = store.state;
    const slim = {};
    PERSIST_FIELDS.forEach(function (k) { slim[k] = s[k]; });
    try {
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: slim, version: 0 }));
    } catch (e) {
      // localStorage unavailable/full → degrade gracefully, lab keeps working in memory
      // (identical fallback contract to the original's createJSONStorage wrapper).
    }
  }

  function hydrate() {
    try {
      const raw = global.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const saved = parsed && parsed.state ? parsed.state : parsed;
        if (saved && typeof saved === 'object') {
          deepMerge(store.state, saved);
          // guard: env must be complete even if the blob predates a field
          store.state.env = Object.assign(clone(pristineEnv), store.state.env || {});
        }
      }
    } catch (e) {
      // corrupt/unreadable blob → pristine start
    }
    store.state.hydrated = true;
  }

  // ── actions (1:1 with store.ts; `return s` no-ops preserved) ─────────────────
  const actions = {
    markHydrated: function () { store.set({ hydrated: true }); },

    // setMode wipes all progress (matches store.ts setMode)
    setMode: function (m) {
      store.set({
        mode: m,
        started: true,
        finished: false,
        answers: {},
        checks: {},
        hints: {},
        env: clone(pristineEnv),
        quizAnswers: {},
        quizSubmitted: {},
        seenCore: false,
        seenDebrief: false,
        lastCheck: null,
      });
    },

    switchMode: function (m) { actions.setMode(m); },

    setAnswerField: function (key, field, value) {
      store.set(function (s) {
        const cur = (s.answers[key] && typeof s.answers[key] === 'object' && !Array.isArray(s.answers[key]))
          ? s.answers[key] : {};
        const next = Object.assign({}, cur);
        next[field] = value;
        return { answers: Object.assign({}, s.answers, (function () { const o = {}; o[key] = next; return o; })()) };
      });
    },

    setAnswerRaw: function (key, value) {
      store.set(function (s) {
        return { answers: Object.assign({}, s.answers, (function () { const o = {}; o[key] = value; return o; })()) };
      });
    },

    setEnv: function (p) {
      store.set(function (s) { return { env: Object.assign({}, s.env, p) }; });
    },

    setAlertRule: function (p) {
      store.set(function (s) { return { env: Object.assign({}, s.env, { alertRule: Object.assign({}, s.env.alertRule, p) }) }; });
    },

    setTriage: function (id, d) {
      store.set(function (s) { return { env: Object.assign({}, s.env, { triage: Object.assign({}, s.env.triage, (function () { const o = {}; o[id] = d; return o; })()) }) }; });
    },

    setHardTriage: function (id, d) {
      store.set(function (s) { return { env: Object.assign({}, s.env, { hardTriage: Object.assign({}, s.env.hardTriage, (function () { const o = {}; o[id] = d; return o; })()) }) }; });
    },

    setH5: function (p) {
      store.set(function (s) { return { env: Object.assign({}, s.env, { h5: Object.assign({}, s.env.h5, p) }) }; });
    },

    toggleWidget: function (id) {
      store.set(function (s) {
        const w = s.env.h5.widgets;
        const next = w.indexOf(id) !== -1 ? w.filter(function (x) { return x !== id; }) : w.concat([id]);
        return { env: Object.assign({}, s.env, { h5: Object.assign({}, s.env.h5, { widgets: next }) }) };
      });
    },

    // H6 sequencer: atomic add/remove from latest state (fixes-ledger QA-13)
    addToH6: function (id) {
      store.set(function (s) {
        const cur = s.env.h6;
        if (cur.indexOf(id) !== -1) return s; // no-op
        return { env: Object.assign({}, s.env, { h6: cur.concat([id]) }) };
      });
    },

    removeFromH6: function (id) {
      store.set(function (s) {
        return { env: Object.assign({}, s.env, { h6: s.env.h6.filter(function (x) { return x !== id; }) }) };
      });
    },

    setH9: function (p) {
      store.set(function (s) { return { env: Object.assign({}, s.env, { h9: Object.assign({}, s.env.h9, p) }) }; });
    },

    // H1 evidence gate: append atomically from latest state (fixes-ledger QA-12)
    addEvidence: function (doc) {
      store.set(function (s) {
        const h1 = (s.answers.h1 && typeof s.answers.h1 === 'object') ? s.answers.h1 : {};
        const ev = Array.isArray(h1.evidence) ? h1.evidence : [];
        if (ev.indexOf(doc) !== -1) return s; // no-op
        const next = Object.assign({}, h1, { evidence: ev.concat([doc]) });
        return { answers: Object.assign({}, s.answers, { h1: next }) };
      });
    },

    revealHint: function (id) {
      store.set(function (s) {
        const cur = s.hints[id] || 0;
        const objs = global.CW_DATA.ALL_OBJECTIVES[s.mode || 'medium'];
        let max = 3;
        for (let i = 0; i < objs.length; i++) if (objs[i].id === id) { max = objs[i].hints.length; break; }
        if (cur >= max) return s; // no-op
        const h = Object.assign({}, s.hints);
        h[id] = cur + 1;
        return { hints: h };
      });
    },

    checkObjective: function (id) {
      const s = store.get();
      const r = global.CW_ENGINE.validate(s.mode || 'medium', id, s);
      const prev = s.checks[id];
      const attempts = (prev ? prev.attempts : 0) + 1;
      const firstTry = prev ? prev.firstTry : r.pass;
      const prevEver = prev ? prev.everPassed : false;
      const checks = Object.assign({}, s.checks);
      checks[id] = { status: r.pass ? 'passed' : 'failed', attempts: attempts, firstTry: firstTry, everPassed: r.pass || prevEver };
      store.set({ checks: checks, lastCheck: { id: id, pass: r.pass, msg: r.msg, ts: Date.now() } });
      return r;
    },

    answerQuiz: function (qid, idx) {
      store.set(function (s) {
        if (s.quizSubmitted[qid]) return s; // locked after submission
        const qa = Object.assign({}, s.quizAnswers);
        qa[qid] = idx;
        return { quizAnswers: qa };
      });
    },

    submitQuiz: function (qid) {
      store.set(function (s) {
        const qs = Object.assign({}, s.quizSubmitted);
        qs[qid] = true;
        return { quizSubmitted: qs };
      });
    },

    markSeen: function (k) {
      const p = {};
      p[k] = true;
      store.set(p);
    },

    finish: function () {
      const s = store.get();
      const mode = s.mode || 'medium';
      const objs = global.CW_DATA.ALL_OBJECTIVES[mode];
      let allPassed = objs.every(function (o) { return s.checks[o.id] && s.checks[o.id].everPassed; });
      const quiz = mode === 'medium' ? global.CW_DATA.QUIZ_MEDIUM : global.CW_DATA.QUIZ_HARD;
      const quizDone = quiz.every(function (q) { return s.quizSubmitted[q.id]; });
      if (allPassed && quizDone) store.set({ finished: true });
    },

    closeFinish: function () { store.set({ finished: false }); },

    reset: function () {
      store.set({
        mode: null,
        started: false,
        finished: false,
        answers: {},
        checks: {},
        hints: {},
        env: clone(pristineEnv),
        quizAnswers: {},
        quizSubmitted: {},
        seenCore: false,
        seenDebrief: false,
        lastCheck: null,
      });
    },
  };

  // ── derived helpers (1:1 with store.ts bottom section) ───────────────────────
  const derived = {
    progressOf: function (s) {
      const mode = s.mode || 'medium';
      const objs = global.CW_DATA.ALL_OBJECTIVES[mode];
      const passed = objs.filter(function (o) { return s.checks[o.id] && s.checks[o.id].everPassed; }).length;
      return { total: objs.length, passed: passed };
    },

    starsOf: function (s) {
      const mode = s.mode || 'medium';
      const objs = global.CW_DATA.ALL_OBJECTIVES[mode];
      const n = objs.length || 1;
      const firstTry = objs.filter(function (o) { return s.checks[o.id] && s.checks[o.id].firstTry; }).length / n;
      const hintMax = mode === 'medium' ? 3 : 1;
      const hintUsed = objs.reduce(function (acc, o) {
        return acc + Math.min(s.hints[o.id] || 0, hintMax);
      }, 0);
      const hintPenalty = Math.min(1, hintUsed / (n * hintMax));
      const quiz = mode === 'medium' ? global.CW_DATA.QUIZ_MEDIUM : global.CW_DATA.QUIZ_HARD;
      const submitted = quiz.filter(function (q) { return s.quizSubmitted[q.id]; });
      const quizAcc = submitted.length
        ? submitted.filter(function (q) { return s.quizAnswers[q.id] === q.answer; }).length / submitted.length
        : 0;
      const score = 0.55 * firstTry + 0.3 * quizAcc + 0.15 * (1 - hintPenalty);
      return Math.max(1, Math.min(5, Math.round(1 + score * 4)));
    },

    scoreOf: function (s) {
      const prog = derived.progressOf(s);
      const quiz = (s.mode || 'medium') === 'medium' ? global.CW_DATA.QUIZ_MEDIUM : global.CW_DATA.QUIZ_HARD;
      const quizCorrect = quiz.filter(function (q) {
        return s.quizSubmitted[q.id] && s.quizAnswers[q.id] === q.answer;
      }).length;
      const objScore = prog.total ? prog.passed / prog.total : 0;
      const quizScore = quiz.length ? quizCorrect / quiz.length : 0;
      return Math.round((0.6 * objScore + 0.4 * quizScore) * 100);
    },

    canFinish: function (s) {
      const mode = s.mode || 'medium';
      const objs = global.CW_DATA.ALL_OBJECTIVES[mode];
      const quiz = mode === 'medium' ? global.CW_DATA.QUIZ_MEDIUM : global.CW_DATA.QUIZ_HARD;
      return (
        objs.every(function (o) { return s.checks[o.id] && s.checks[o.id].everPassed; }) &&
        quiz.every(function (q) { return s.quizSubmitted[q.id]; })
      );
    },

    // R8: performance-derived focus areas for the completion report
    focusAreasOf: function (s) {
      const mode = s.mode || 'medium';
      const objs = global.CW_DATA.ALL_OBJECTIVES[mode];
      const quiz = mode === 'medium' ? global.CW_DATA.QUIZ_MEDIUM : global.CW_DATA.QUIZ_HARD;
      const areas = [];

      // 1. Quiz items answered wrong → topic + the exact reference section to reread.
      quiz.forEach(function (q, i) {
        if (s.quizSubmitted[q.id] && s.quizAnswers[q.id] !== q.answer) {
          areas.push({
            title: q.topic,
            action: 'Board quiz item ' + (i + 1) + ' was missed — reopen Reference → “' + q.ref + '” and reread that section.',
          });
        }
      });

      // 2. Objectives that cost retries → re-run in their bay.
      objs.forEach(function (o) {
        const c = s.checks[o.id];
        if (c && c.everPassed && !c.firstTry) {
          areas.push({
            title: o.title,
            action: 'Objective ' + o.id + ' took ' + c.attempts + ' checks — revisit the ' + global.CW_DATA.BAY_LABELS[o.bay] + ' and re-run it first-try.',
          });
        }
      });

      // 3. Heavy hint reliance (any hint in Hard, 2+ in Medium).
      const hintCap = mode === 'medium' ? 2 : 1;
      objs.forEach(function (o) {
        const h = s.hints[o.id] || 0;
        const c = s.checks[o.id];
        if (h >= hintCap && c && c.everPassed && !areas.some(function (x) { return x.title === o.title; })) {
          areas.push({
            title: o.title,
            action: 'Solved with hints — try ' + o.id + ' again in the ' + global.CW_DATA.BAY_LABELS[o.bay] + ' without nudges.',
          });
        }
      });

      return areas.slice(0, 5);
    },
  };

  global.CW_STORE_KEY = STORAGE_KEY;
  global.CW_store = store;
  global.CW_actions = actions;
  global.CW_derived = derived;
  global.CW_hydrate = hydrate;
})(this);
