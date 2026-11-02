// CyberLab 12.1 — central lab store (plain JS + localStorage persistence)
// Static port of src/lib/cyberlab/store.ts. Same state shape, same actions,
// same guards (R2 locked quiz flow, R3 no-selection-no-validation, guarded
// submit), same derived selectors, same persistence key and JSON envelope.
window.CyberLab = window.CyberLab || {};
(function (CL) {
  'use strict';

  const STORAGE_KEY = 'cyberlab-121-appsec-v1';
  const initial = {
    hydrated: false,
    mode: null,
    phase: 'mode',
    // environment state
    crawlDone: false,
    scanDone: false,
    fuzzRuns: 0,
    debugState: 'idle',
    configTabsSeen: [],
    visitedInstruments: [],
    // objectives
    answers: {},
    attempts: {},
    hintsUsed: {},
    completed: {},
    lastResult: {},
    // quiz
    quizAnswers: {},
    quizLocked: {}, // R2: answer locked once the validate button is pressed
    quizIndex: 0,   // current item in the mandatory next-question flow
    quizSubmitted: false,
    quizScore: 0,
    // flow
    manualSeen: false,
    briefingSeen: false,
    showCompletion: false,
    completedAt: null,
    ticker: 'BENCH-01 ready — select a training mode to power on.',
  };

  // ---------------- tiny pub/sub store ----------------
  const listeners = new Set();

  function plain(value) {
    return JSON.parse(JSON.stringify(value));
  }

  const store = {
    state: plain(initial),

    /** Subscribe to state changes. Returns an unsubscribe function. */
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },

    /** Commit a partial state: merge, persist (synchronous, like zustand persist), notify. */
    set(partial, opts) {
      Object.assign(store.state, plain(partial));
      save();
      if (!(opts && opts.silent)) {
        listeners.forEach((fn) => {
          try { fn(store.state); } catch (e) { console.error('listener error', e); }
        });
      }
    },

    /** Silent write: state + persistence only (used while typing text inputs). */
    setSilent(partial) {
      store.set(partial, { silent: true });
    },

    reset() {
      store.state = plain(initial);
      store.state.hydrated = true;
      // wipe and re-write the pristine envelope immediately
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* private mode */ }
      save();
      listeners.forEach((fn) => {
        try { fn(store.state); } catch (e) { console.error('listener error', e); }
      });
    },
  };

  function save() {
    try {
      const envelope = { state: store.state, version: 0 };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
    } catch (e) { /* storage unavailable — lab still works, just no resume */ }
  }

  /** Rehydrate from localStorage (zustand-persist envelope: {state, version}). */
  function hydrate() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const s = parsed && parsed.state ? parsed.state : parsed;
        if (s && typeof s === 'object') {
          const restored = plain(initial);
          for (const k of Object.keys(restored)) {
            if (s[k] !== undefined) restored[k] = s[k];
          }
          restored.hydrated = false;
          store.state = restored;
        }
      }
    } catch (e) { console.warn('rehydrate failed, starting fresh', e); }
    store.state.hydrated = true;
  }

  // ---------------- actions (ported 1:1 from the zustand store) ----------------
  const actions = {
    start(mode) {
      store.set({
        ...plain(initial),
        hydrated: true,
        mode,
        phase: 'briefing',
        ticker:
          mode === 'medium'
            ? 'MEDIUM mode loaded — Training Shift: guided objectives, hints on tap.'
            : 'HARD mode loaded — Redline Audit: noisy evidence, strict validation.',
      });
    },
    goto(phase) {
      store.set({ phase });
    },
    setCrawlDone() {
      store.set({ crawlDone: true, ticker: 'Crawler finished — 9 URLs discovered.' });
    },
    setScanDone() {
      store.set({ scanDone: true, ticker: 'Active scan finished — alerts posted to the triage board.' });
    },
    recordFuzzRun() {
      const s = store.state;
      store.set({ fuzzRuns: s.fuzzRuns + 1, ticker: 'Fuzz run complete — compare every row to the baseline.' });
    },
    setDebugState(st) {
      store.set({
        debugState: st,
        ticker:
          st === 'revealed'
            ? 'DEBUGGER: runtime secrets revealed — strings panel updated.'
            : 'DEBUGGER: ' + st + '.',
      });
    },
    markTab(t) {
      const s = store.state;
      if (s.configTabsSeen.includes(t)) return;
      store.set({ configTabsSeen: [...s.configTabsSeen, t] });
    },
    visit(inst) {
      const s = store.state;
      if (s.visitedInstruments.includes(inst)) return;
      store.set({ visitedInstruments: [...s.visitedInstruments, inst] });
    },
    setAnswer(id, ans) {
      const s = store.state;
      store.set({ answers: { ...s.answers, [id]: ans } });
    },
    /** Silent variant used on every keystroke of text inputs (no re-render). */
    setAnswerSilent(id, ans) {
      const s = store.state;
      store.setSilent({ answers: { ...s.answers, [id]: ans } });
    },
    checkObjective(id) {
      const s = store.state;
      const mode = s.mode;
      if (!mode) return;
      const obj = CL.objectivesFor(mode).find((o) => o.id === id);
      if (!obj) return;
      const env = CL.envSnapshotOf(s);
      const pass = obj.check(s.answers[id], env);
      const attemptNo = (s.attempts[id] ?? 0) + 1;
      store.set({
        attempts: { ...s.attempts, [id]: attemptNo },
        completed: pass ? { ...s.completed, [id]: true } : s.completed,
        lastResult: {
          ...s.lastResult,
          [id]: { pass, feedback: pass ? obj.success : obj.fail },
        },
        ticker: pass
          ? 'CHECK ' + id + ' — PASS. Objective complete.'
          : 'CHECK ' + id + ' — not yet. Read the feedback and adjust.',
      });
    },
    useHint(id) {
      const s = store.state;
      const mode = s.mode;
      if (!mode) return;
      const obj = CL.objectivesFor(mode).find((o) => o.id === id);
      if (!obj) return;
      const used = s.hintsUsed[id] ?? 0;
      if (used >= obj.hints.length) return;
      store.set({
        hintsUsed: { ...s.hintsUsed, [id]: used + 1 },
        ticker: 'HINT ' + id + ' — level ' + (used + 1) + ' revealed.',
      });
    },
    setQuizAnswer(qid, idx) {
      const s = store.state;
      // R2 lock: a checked item can never be re-answered
      if (s.quizLocked[qid]) return;
      store.set({ quizAnswers: { ...s.quizAnswers, [qid]: idx } });
    },
    checkQuizItem(qid) {
      const s = store.state;
      if (s.quizAnswers[qid] === undefined || s.quizLocked[qid]) return; // R3
      store.set({
        quizLocked: { ...s.quizLocked, [qid]: true },
        ticker: 'Item locked — review the explanation, then continue.',
      });
    },
    nextQuizItem() {
      const s = store.state;
      const mode = s.mode;
      if (!mode) return;
      const items = CL.QUIZ[mode];
      const cur = items[Math.min(s.quizIndex, items.length - 1)];
      // mandatory progression: can only advance past a locked (validated) item
      if (!cur || !s.quizLocked[cur.id]) return;
      if (s.quizIndex < items.length - 1) {
        store.set({ quizIndex: s.quizIndex + 1, ticker: 'Item ' + (s.quizIndex + 2) + ' of ' + items.length + '.' });
      }
    },
    submitQuiz() {
      const s = store.state;
      const mode = s.mode;
      if (!mode) return;
      if (s.quizSubmitted) return; // assessment contract: no re-submission, no score mutation
      const items = CL.QUIZ[mode];
      const allLocked = items.every((q) => s.quizLocked[q.id]);
      if (!allLocked) return; // must validate every item first
      const score = items.filter((q) => s.quizAnswers[q.id] === q.correct).length;
      store.set({
        quizSubmitted: true,
        quizScore: score,
        phase: 'debrief',
        showCompletion: true,
        completedAt: new Date().toISOString(),
        ticker: 'Knowledge check submitted — ' + score + '/' + items.length + ' correct. Debrief unlocked.',
      });
    },
    openCompletion() {
      store.set({ showCompletion: true });
    },
    closeCompletion() {
      store.set({ showCompletion: false });
    },
    setTicker(msg) {
      store.set({ ticker: msg });
    },
    reset() {
      store.reset();
    },
  };

  // ---------------- selectors / derived helpers (ported 1:1) ----------------
  function progressOf(state) {
    const mode = state.mode;
    if (!mode) return { done: 0, total: 0, pct: 0 };
    const objs = CL.objectivesFor(mode);
    const done = objs.filter((o) => state.completed[o.id]).length;
    return { done, total: objs.length, pct: objs.length ? Math.round((done / objs.length) * 100) : 0 };
  }

  function scoreOf(state) {
    const mode = state.mode;
    if (!mode) return { objPct: 0, quizPct: 0, score: 0 };
    const objs = CL.objectivesFor(mode);
    const items = CL.QUIZ[mode];
    const objPct = objs.length ? (objs.filter((o) => state.completed[o.id]).length / objs.length) * 100 : 0;
    const quizPct = state.quizSubmitted ? (state.quizScore / items.length) * 100 : 0;
    const score = Math.round(objPct * 0.7 + quizPct * 0.3);
    return { objPct: Math.round(objPct), quizPct: Math.round(quizPct), score };
  }

  function starsOf(state) {
    const mode = state.mode;
    if (!mode) return { stars: 0, penalty: 0 };
    const objs = CL.objectivesFor(mode);
    let penalty = 0;
    for (const o of objs) {
      penalty += (state.hintsUsed[o.id] ?? 0) * 0.2;
      penalty += Math.max(0, (state.attempts[o.id] ?? 1) - 1) * 0.25;
    }
    const items = CL.QUIZ[mode];
    const wrong = state.quizSubmitted ? items.length - state.quizScore : 0;
    penalty += wrong * 0.2;
    const stars = Math.max(1, Math.min(5, 5 - penalty));
    return { stars: Math.round(stars * 2) / 2, penalty: Math.round(penalty * 100) / 100 };
  }

  function allObjectivesDone(state) {
    const mode = state.mode;
    if (!mode) return false;
    return CL.objectivesFor(mode).every((o) => state.completed[o.id]);
  }

  function instrumentStatus(state, inst) {
    const mode = state.mode;
    if (!mode) return 'off';
    const objs = CL.objectivesFor(mode).filter((o) => o.instrument === inst);
    if (!objs.length) return 'off';
    return objs.every((o) => state.completed[o.id]) ? 'done' : 'work';
  }

  CL.store = store;
  CL.actions = actions;
  CL.hydrate = hydrate;
  CL.progressOf = progressOf;
  CL.scoreOf = scoreOf;
  CL.starsOf = starsOf;
  CL.allObjectivesDone = allObjectivesDone;
  CL.instrumentStatus = instrumentStatus;
  CL.STORAGE_KEY = STORAGE_KEY;
})(window.CyberLab);
