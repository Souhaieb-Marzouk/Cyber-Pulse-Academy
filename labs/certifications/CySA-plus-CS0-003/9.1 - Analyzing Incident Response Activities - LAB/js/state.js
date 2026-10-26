/* ═══════════════════════════════════════════════════════════════════════════
   CyberLab static port — STATE STORE (js/state.js)
   Plain-JS recreation of src/lib/irlab/engine.ts state + persistence (F3):
   same LabState shape, same STORAGE_KEY, same STATE_VERSION, same
   save/restore/RESET semantics, same graceful degradation without
   localStorage. Tiny subscribe/notify; re-render only on change.
   ═══════════════════════════════════════════════════════════════════════════ */

(function (global) {
  'use strict';

  const LAB = global.LAB;

  /* ─────────────────────────── pristine state ───────────────────────────── */

  function emptyEnv() {
    return {
      /* prepare */
      phaseOrder: [],
      phaseMatch: {},
      /* detect */
      gapsSelected: [],
      fpSelected: '',
      ruleSlots: [
        { f: '—', o: '—', v: '—' },
        { f: '—', o: '—', v: '—' },
        { f: '—', o: '—', v: '—' },
      ],
      hardTriage: {},
      hardRetro: [],
      /* analyze — sequencer boards start pre-shuffled (fixed, non-canonical) */
      volOrder: LAB.INITIAL_ORDERS.volOrder.slice(),
      acqApproach: '',
      legalHold: false,
      custody: { collector: '', tag: '', integrity: '', why: '' },
      h2First: '',
      h2Shortcut: '',
      timeOrder: LAB.INITIAL_ORDERS.timeOrder.slice(),
      h3Order: LAB.INITIAL_ORDERS.h3Order.slice(),
      h3Answers: { patient: '', vector: '', dwell: '', cleared: '' },
      chain: {},
      /* contain */
      containSel: [],
      tradeoff: '',
      containSeq: ['S3', 'S5', 'S1', 'S4', 'S2'],
      containReject: [],
      /* eradicate */
      eradSel: [],
      h5Missed: [],
      h5Step: '',
      /* recover */
      restoreSrc: '',
      recSteps: LAB.INITIAL_ORDERS.recSteps.slice(),
      h6Src: '',
      h6Steps: LAB.INITIAL_ORDERS.h6Steps.slice(),
      h6Reject: '',
      /* debrief */
      lessonMap: {},
      h7Map: {},
      h7Rank: LAB.INITIAL_ORDERS.h7Rank.slice(),
      h9Phases: {},
      h9Root: '',
      h9Risk: '',
    };
  }

  function pristine(mode) {
    return {
      v: LAB.STATE_VERSION,
      mode: mode || null,
      station: 'case',
      env: emptyEnv(),
      obj: {},
      quiz: { answers: {} },
      completed: false,
      savedAt: null,
    };
  }

  /* ─────────────────────────── persistence (F3) ─────────────────────────── */

  function loadState() {
    try {
      const raw = global.localStorage.getItem(LAB.STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.v === LAB.STATE_VERSION && parsed.env && parsed.obj && parsed.quiz) {
        /* merge in any env fields added after save (forward-compat) */
        const base = pristine(parsed.mode || null);
        const merged = {};
        for (const k in base) merged[k] = base[k];
        for (const k in parsed) merged[k] = parsed[k];
        /* deep-merge env so new nested keys survive too */
        merged.env = {};
        for (const k in base.env) merged.env[k] = base.env[k];
        for (const k in parsed.env) merged.env[k] = parsed.env[k];
        return merged;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  function saveState(state) {
    try {
      const clone = shallowCopy(state);
      clone.savedAt = new Date().toISOString();
      global.localStorage.setItem(LAB.STORAGE_KEY, JSON.stringify(clone));
    } catch (e) {
      /* localStorage unavailable — degrade gracefully (F3/G5) */
    }
  }

  function clearState() {
    try {
      global.localStorage.removeItem(LAB.STORAGE_KEY);
    } catch (e) {
      /* ignore */
    }
  }

  function shallowCopy(o) {
    const c = {};
    for (const k in o) c[k] = o[k];
    return c;
  }

  /* ─────────────────────────── store + pub/sub ──────────────────────────── */

  let state = pristine(null);   // replaced by hydrate() if a save exists
  let saved = null;             // the loaded save (for the resume banner)
  let hydrated = false;
  const listeners = [];

  function subscribe(fn) {
    listeners.push(fn);
  }

  function notify() {
    for (const fn of listeners) fn();
  }

  function hydrate() {
    const loaded = loadState();
    if (loaded && loaded.mode) saved = loaded;
    hydrated = true;
  }

  /** Read the save found during hydration (may be null). */
  function getSaved() {
    return saved;
  }

  function clearSaved() {
    saved = null;
  }

  function get() {
    return state;
  }

  /** Replace the whole state (mode pick, resume, reset, replay, switch). */
  function set(next) {
    state = next;
    persist();
    notify();
  }

  /**
   * Mutate the current state in place via mutator(state), then persist +
   * notify. Synchronous, so rapid successive clicks can never clobber one
   * another (parity with the original's functional updaters — audit QA-6).
   */
  function mutate(mutator) {
    mutator(state);
    persist();
    notify();
  }

  function persist() {
    if (hydrated && state.mode) saveState(state);
  }

  /* ─────────────── frequently used env mutations (parity helpers) ───────── */

  const Actions = {
    toggleListItem(key, id) {
      mutate(function (s) {
        const list = s.env[key];
        const i = list.indexOf(id);
        if (i >= 0) list.splice(i, 1);
        else list.push(id);
      });
    },
    setOne(key, value) {
      mutate(function (s) {
        s.env[key] = value;
      });
    },
    setEnvSub(key, sub, value) {
      mutate(function (s) {
        if (!s.env[key] || typeof s.env[key] !== 'object') s.env[key] = {};
        s.env[key][sub] = value;
      });
    },
    setRuleSlot(idx, part, value) {
      mutate(function (s) {
        s.env.ruleSlots[idx][part] = value;
      });
    },
    setTriage(id, verdict) {
      mutate(function (s) {
        s.env.hardTriage[id] = verdict;
      });
    },
    flipBool(key) {
      mutate(function (s) {
        s.env[key] = !s.env[key];
      });
    },
    seqMove(key, idx, dir) {
      mutate(function (s) {
        const arr = s.env[key];
        const j = idx + dir;
        if (j < 0 || j >= arr.length) return;
        const tmp = arr[idx];
        arr[idx] = arr[j];
        arr[j] = tmp;
      });
    },
    seqReset(key, order) {
      mutate(function (s) {
        s.env[key] = order.slice();
      });
    },
    goto(station) {
      mutate(function (s) {
        s.station = station;
      });
    },
    checkObjective(id) {
      mutate(function (s) {
        const prev = s.obj[id];
        if (prev && prev.passed) return;
        const result = global.LabObjectives.validateObjective(id, s.env);
        const attempts = (prev ? prev.attempts : 0) + 1;
        s.obj[id] = {
          attempts: attempts,
          passed: result.pass,
          firstTry: result.pass && attempts === 1,
          hintLevel: prev ? prev.hintLevel : 0,
          lastResult: result,
        };
      });
    },
    revealHint(id) {
      mutate(function (s) {
        const def = LAB.OBJECTIVES.find(function (o) { return o.id === id; });
        if (!def) return;
        /* Hard mode: ONE scored nudge. Medium: full tiered hints. */
        const maxHints = def.mode === 'hard' ? 1 : def.hints.length;
        const prev = s.obj[id];
        const nextLevel = Math.min((prev ? prev.hintLevel : 0) + 1, maxHints);
        if (prev && nextLevel === prev.hintLevel) return;
        s.obj[id] = {
          attempts: prev ? prev.attempts : 0,
          passed: prev ? prev.passed : false,
          firstTry: prev ? prev.firstTry : false,
          hintLevel: nextLevel,
          lastResult: prev ? prev.lastResult : null,
        };
      });
    },
    answerQuiz(qid, idx) {
      mutate(function (s) {
        if (s.quiz.answers[qid] !== undefined) return;
        s.quiz.answers[qid] = idx;
      });
    },
    markCompleted() {
      mutate(function (s) {
        s.completed = true;
      });
    },
  };

  global.LabStore = {
    /* state access */
    get: get,
    set: set,
    mutate: mutate,
    subscribe: subscribe,
    hydrate: hydrate,
    getSaved: getSaved,
    clearSaved: clearSaved,
    pristine: pristine,
    /* persistence passthrough */
    clearState: clearState,
    saveState: saveState,
    /* domain actions */
    actions: Actions,
    /* exposed for tests */
    emptyEnv: emptyEnv,
  };
})(window);
