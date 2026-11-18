// ── The Access Bureau — state store + persistence ─────────────────────────
// Plain-JS re-implementation of the original lab's zustand store
// (src/lib/lab/store.ts): same shape, same actions, same persistence key,
// same save/restore/RESET semantics. Tiny subscribe/notify mechanism;
// components re-render only the regions affected by a change.
'use strict';
(function (global) {
  const ABData = global.ABData;
  const ABObjectives = global.ABObjectives;

  /** localStorage key — IDENTICAL to the original lab (zustand persist name). */
  const STORE_KEY = 'access-bureau-v1';

  function emptyState() {
    return {
      mode: null,                      // 'medium' | 'hard' | null (mode select screen)
      stage: 'desk',                   // 'desk' | 'quiz' | 'debrief' (kept for parity)
      env: ABData.emptyEnv(),
      objState: {},                    // objective id -> { attempts, passed, hints }
      feedback: {},                    // objective id -> { pass, feedback } (NOT persisted)
      quizAnswers: {},                 // quiz id -> chosen option index
      quizDone: false,
      completedShown: false,
      highlight: null,                 // station id with the gold ring (NOT persisted)
    };
  }

  const store = {
    state: emptyState(),
    _listeners: [],

    subscribe(fn) { this._listeners.push(fn); },

    /** Merge a patch, persist, then notify listeners with the changed keys. */
    set(patch) {
      const keys = Object.keys(patch);
      for (const k of keys) this.state[k] = patch[k];
      this.persist();
      for (const fn of this._listeners) fn(this.state, keys);
    },

    /** Accepts a partial patch OR an updater so every merge reads the freshest
     *  env — same contract as the original store (fixes lost sibling updates). */
    patchEnv(patch) {
      const env = this.state.env;
      const resolved = typeof patch === 'function' ? patch(env) : patch;
      this.set({ env: Object.assign({}, env, resolved) });
    },

    setMode(m) {
      this.set({
        mode: m, env: ABData.emptyEnv(), objState: {}, feedback: {},
        quizAnswers: {}, quizDone: false, completedShown: false, stage: 'desk',
      });
    },

    checkObjective(id) {
      const s = this.state;
      if (!s.mode) return;
      const obj = ABObjectives.objectivesFor(s.mode).find(function (o) { return o.id === id; });
      if (!obj) return;
      const prev = s.objState[id] || { attempts: 0, passed: false, hints: 0 };
      if (prev.passed) return;               // original: no-op once passed
      const res = obj.validate(s.env);
      this.set({
        objState: Object.assign({}, s.objState, { [id]: { attempts: prev.attempts + 1, passed: res.pass, hints: prev.hints } }),
        feedback: Object.assign({}, s.feedback, { [id]: res }),
      });
    },

    revealHint(id) {
      const s = this.state;
      const prev = s.objState[id] || { attempts: 0, passed: false, hints: 0 };
      this.set({
        objState: Object.assign({}, s.objState, { [id]: Object.assign({}, prev, { hints: prev.hints + 1 }) }),
      });
    },

    goto(stage) { this.set({ stage: stage }); },
    answerQuiz(qid, idx) { this.set({ quizAnswers: Object.assign({}, this.state.quizAnswers, { [qid]: idx }) }); },
    finishQuiz() { this.set({ quizDone: true }); },
    markCompletedShown() { this.set({ completedShown: true }); },
    setHighlight(id) { this.set({ highlight: id }); },

    hardReset() { this.set(emptyState()); },

    /** Persist the same partialized subset as the original store:
     *  everything except transient `feedback` and `highlight`. */
    persist() {
      try {
        const s = this.state;
        const slice = {
          mode: s.mode, stage: s.stage, env: s.env, objState: s.objState,
          quizAnswers: s.quizAnswers, quizDone: s.quizDone, completedShown: s.completedShown,
        };
        localStorage.setItem(STORE_KEY, JSON.stringify(slice));
      } catch (e) { /* storage unavailable — lab still works for the session */ }
    },

    /** Restore a saved session; resumes exactly where the student left off. */
    restore() {
      try {
        const raw = localStorage.getItem(STORE_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw);
        this.state = Object.assign(emptyState(), saved);
        // guard: partial saves (e.g. cleared mid-write) fall back to a valid env
        if (!this.state.env) this.state.env = ABData.emptyEnv();
      } catch (e) { this.state = emptyState(); }
    },

    wipe() {
      try { localStorage.removeItem(STORE_KEY); } catch (e) { /* noop */ }
    },
  };

  // ── derived helpers (same formulas as the original store) ──

  function quizItems(mode) { return mode === 'medium' ? ABData.QUIZ_MEDIUM : ABData.QUIZ_HARD; }

  function progress(mode, objState) {
    const objs = mode ? ABObjectives.objectivesFor(mode) : [];
    const done = objs.filter(function (o) { return objState[o.id] && objState[o.id].passed; }).length;
    return { done: done, total: objs.length, pct: objs.length ? Math.round((done / objs.length) * 100) : 0 };
  }

  function stars(mode, objState, quizAnswers, quizDone) {
    if (!mode) return 0;
    let penalty = 0;
    for (const o of ABObjectives.objectivesFor(mode)) {
      const st = objState[o.id];
      if (!st || !st.passed) continue;
      if (st.attempts > 1) penalty += 0.4;
      penalty += st.hints * (mode === 'hard' ? 0.75 : 0.3);
    }
    if (quizDone) {
      const items = quizItems(mode);
      const wrong = items.filter(function (q) { return quizAnswers[q.id] !== q.correct; }).length;
      penalty += wrong * 0.25;
    }
    return Math.max(1, Math.min(5, Math.round(5 - penalty)));
  }

  function allPassed(mode, objState) {
    if (!mode) return false;
    return ABObjectives.objectivesFor(mode).every(function (o) { return objState[o.id] && objState[o.id].passed; });
  }

  global.ABStore = store;
  global.ABStoreHelpers = { quizItems: quizItems, progress: progress, stars: stars, allPassed: allPassed, STORE_KEY: STORE_KEY };
})(typeof window !== 'undefined' ? window : globalThis);
