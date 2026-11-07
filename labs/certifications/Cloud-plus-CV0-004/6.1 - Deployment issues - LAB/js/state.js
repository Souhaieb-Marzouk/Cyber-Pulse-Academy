// ─── Launch Control lab — state store (js/state.js) ──────────────────────────
// Faithful vanilla-JS port of the original zustand store (src/lib/lab/store.ts):
//   · same persisted localStorage key  : "cobalt-launch-control-v1"
//   · same persist envelope            : { state: <partialized>, version: 1 }
//   · same partialized key list (15 keys) — transient UI state never saved
//   · same action semantics (attempts, first-try, hints, locks, focus nonce…)
//   · same confirmed-RESET-to-pristine behavior
// Data (js/data.js) and validators (js/objectives.js) load before this file.

(function () {
  "use strict";

  const STORAGE_KEY = "cobalt-launch-control-v1";
  const STATE_VERSION = 1;

  const { QUIZ_MEDIUM, QUIZ_HARD } = window.LAB;
  const engine = window.LAB_OBJECTIVES;

  // ── initial state (same shape as LabState + transient fields) ─────────────
  function emptyCaseState() {
    return {
      opened: false,
      lines: [],
      category: null,
      detail: {},
      checks: {},
      orders: {},
      actions: [],
      actionPos: {},
    };
  }

  function initialLabState() {
    return {
      version: STATE_VERSION,
      mode: null,
      phase: "mode",
      activeCase: null,
      activeTab: "log",
      cases: {},
      objectives: {},
      quiz: { answers: {}, checked: {} },
      pipelineOrder: [],
      matchPairs: {},
      dataSources: {},
      prevention: [],
      blueprint: {},
      completedSeen: false,
      completedAt: null,
    };
  }

  function initialTransient() {
    return {
      hydrated: false,
      manualOpen: false,
      trackerOpen: false,
      completionOpen: false,
      triageTab: "diagnosis",
      focusNonce: 0,
      focusWidget: null,
    };
  }

  // ── storage helpers (localStorage unavailable → degrade gracefully, G5) ───
  function storageGet() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }
  function storageSet(value) {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore — persistence is best-effort */
    }
  }
  function storageClear() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  // ── persisted key list (same as the original's partialize) ────────────────
  const PERSISTED_KEYS = [
    "version", "mode", "phase", "activeCase", "activeTab", "cases", "objectives",
    "quiz", "pipelineOrder", "matchPairs", "dataSources", "prevention", "blueprint",
    "completedSeen", "completedAt",
  ];

  function partialize(s) {
    const out = {};
    for (const k of PERSISTED_KEYS) out[k] = s[k];
    return out;
  }

  // ── rehydrate: same envelope zustand's createJSONStorage writes ───────────
  function load() {
    const raw = storageGet();
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== STATE_VERSION || !parsed.state) return null;
      return parsed.state;
    } catch {
      return null;
    }
  }

  // ── store ──────────────────────────────────────────────────────────────────
  const listeners = new Set();

  const store = Object.assign({}, initialLabState(), initialTransient());

  function set(patch, meta) {
    Object.assign(store, patch);
    storageSet(JSON.stringify({ state: partialize(store), version: STATE_VERSION }));
    for (const fn of listeners) fn(store, meta || { type: "set" });
  }

  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  function deepCloneDefault(v, fallback) {
    return v === undefined || v === null ? fallback : v;
  }

  function hydrate() {
    const saved = load();
    if (saved) {
      // shallow merge over initial, same as zustand persist default
      for (const k of PERSISTED_KEYS) {
        if (saved[k] !== undefined) store[k] = saved[k];
      }
      // defensive shape repair for partial/legacy saves
      store.cases = deepCloneDefault(store.cases, {});
      store.objectives = deepCloneDefault(store.objectives, {});
      store.quiz = deepCloneDefault(store.quiz, { answers: {}, checked: {} });
      store.pipelineOrder = Array.isArray(store.pipelineOrder) ? store.pipelineOrder : [];
      store.matchPairs = deepCloneDefault(store.matchPairs, {});
      store.dataSources = deepCloneDefault(store.dataSources, {});
      store.prevention = Array.isArray(store.prevention) ? store.prevention : [];
      store.blueprint = deepCloneDefault(store.blueprint, {});
    }
    store.hydrated = true;
    for (const fn of listeners) fn(store, { type: "hydrated" });
  }

  // ── actions (mirror the original one-for-one) ─────────────────────────────
  const actions = {
    setMode(m) {
      set({ mode: m, phase: "briefing", activeCase: null }, { type: "mode" });
    },
    setPhase(p) {
      set({ phase: p }, { type: "phase" });
    },
    finishBriefing() {
      set({ phase: "room", activeCase: "dep-2201", activeTab: "log" }, { type: "phase" });
    },
    setActiveCase(id, tab) {
      const cases = Object.assign({}, store.cases);
      cases[id] = Object.assign({}, cases[id] || emptyCaseState(), { opened: true });
      set(
        { activeCase: id, activeTab: tab !== undefined ? tab : store.activeTab, cases },
        { type: "case-open", caseId: id },
      );
    },
    setActiveTab(tab) {
      set({ activeTab: tab }, { type: "tab" });
    },
    setManualOpen(v) {
      set({ manualOpen: v }, { type: "manual-open" });
    },
    setTrackerOpen(v) {
      set({ trackerOpen: v }, { type: "tracker-open" });
    },
    setCompletionOpen(v) {
      set({ completionOpen: v }, { type: "completion-open" });
    },
    setTriageTab(t) {
      set({ triageTab: t }, { type: "triage-tab" });
    },
    focusOn(target) {
      const cases = Object.assign({}, store.cases);
      if (target.caseId) {
        cases[target.caseId] = Object.assign(
          {}, cases[target.caseId] || emptyCaseState(), { opened: true },
        );
      }
      set(
        {
          focusNonce: store.focusNonce + 1,
          focusWidget: target.widget || null,
          manualOpen: target.widget ? true : store.manualOpen,
          activeCase: target.caseId || store.activeCase,
          activeTab: target.tab !== undefined
            ? target.tab
            : target.caseId ? "log" : store.activeTab,
          triageTab: target.widget === "sweep-board" ? "sweep" : store.triageTab,
          cases,
        },
        { type: "focus", target },
      );
    },

    toggleLine(caseId, lineId) {
      const c = store.cases[caseId] || emptyCaseState();
      const lines = c.lines.includes(lineId)
        ? c.lines.filter((l) => l !== lineId)
        : [...c.lines, lineId];
      set(
        { cases: Object.assign({}, store.cases, { [caseId]: Object.assign({}, c, { lines }) }) },
        { type: "case-field", caseId, field: "lines" },
      );
    },
    setCategory(caseId, category) {
      const c = store.cases[caseId] || emptyCaseState();
      set(
        { cases: Object.assign({}, store.cases, { [caseId]: Object.assign({}, c, { category, opened: true }) }) },
        { type: "case-field", caseId, field: "category" },
      );
    },
    // `silent` skips re-render notifications (text inputs keep focus/caret);
    // persistence still runs, exactly like the original's per-keystroke save.
    setDetail(caseId, field, value, silent) {
      const c = store.cases[caseId] || emptyCaseState();
      const detail = Object.assign({}, c.detail, { [field]: value });
      set(
        { cases: Object.assign({}, store.cases, { [caseId]: Object.assign({}, c, { detail }) }) },
        silent ? { type: "silent" } : { type: "case-field", caseId, field: "detail" },
      );
    },
    toggleCheck(caseId, field, value) {
      const c = store.cases[caseId] || emptyCaseState();
      const cur = c.checks[field] || [];
      const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
      const checks = Object.assign({}, c.checks, { [field]: next });
      set(
        { cases: Object.assign({}, store.cases, { [caseId]: Object.assign({}, c, { checks }) }) },
        { type: "case-field", caseId, field: "checks" },
      );
    },
    setOrder(caseId, field, order) {
      const c = store.cases[caseId] || emptyCaseState();
      const orders = Object.assign({}, c.orders, { [field]: order });
      set(
        { cases: Object.assign({}, store.cases, { [caseId]: Object.assign({}, c, { orders }) }) },
        { type: "case-field", caseId, field: "orders" },
      );
    },
    toggleAction(caseId, actionId) {
      const c = store.cases[caseId] || emptyCaseState();
      const has = c.actions.includes(actionId);
      const nextActions = has ? c.actions.filter((a) => a !== actionId) : [...c.actions, actionId];
      const actionPos = Object.assign({}, c.actionPos);
      if (has) delete actionPos[actionId];
      else actionPos[actionId] = nextActions.length;
      set(
        { cases: Object.assign({}, store.cases, { [caseId]: Object.assign({}, c, { actions: nextActions, actionPos }) }) },
        { type: "case-field", caseId, field: "actions" },
      );
    },
    setActionPos(caseId, actionId, pos) {
      const c = store.cases[caseId] || emptyCaseState();
      const actionPos = Object.assign({}, c.actionPos, { [actionId]: pos });
      set(
        { cases: Object.assign({}, store.cases, { [caseId]: Object.assign({}, c, { actionPos }) }) },
        { type: "case-field", caseId, field: "actions" },
      );
    },

    checkObjective(objectiveId) {
      const def = engine.OBJECTIVES.find((o) => o.id === objectiveId);
      if (!def || store.mode !== def.mode) {
        return { pass: false, title: "Unavailable", feedback: "This objective belongs to a different mode." };
      }
      const result = engine.VALIDATORS[objectiveId](store);
      const prev = store.objectives[objectiveId];
      const isFirstAttempt = (prev && prev.attempts ? prev.attempts : 0) === 0;
      const objectives = Object.assign({}, store.objectives);
      objectives[objectiveId] = {
        done: (objectives[objectiveId] && objectives[objectiveId].done) || result.pass,
        attempts: ((prev && prev.attempts) || 0) + 1,
        hintsUsed: (prev && prev.hintsUsed) || 0,
        passedFirstTry: result.pass && isFirstAttempt
          ? true
          : (prev && prev.passedFirstTry) || false,
        lastResult: result.pass ? "pass" : "fail",
      };
      set({ objectives }, { type: "objectives", objectiveId });
      return result;
    },
    useHint(objectiveId) {
      const def = engine.OBJECTIVES.find((o) => o.id === objectiveId);
      const max = def ? def.hints.length : 0;
      const cur = (store.objectives[objectiveId] && store.objectives[objectiveId].hintsUsed) || 0;
      if (cur >= max) return;
      const prev = store.objectives[objectiveId];
      const objectives = Object.assign({}, store.objectives);
      objectives[objectiveId] = {
        done: (prev && prev.done) || false,
        attempts: (prev && prev.attempts) || 0,
        hintsUsed: cur + 1,
        passedFirstTry: (prev && prev.passedFirstTry) || false,
        lastResult: prev ? prev.lastResult : undefined,
      };
      set({ objectives }, { type: "objectives", objectiveId });
    },

    answerQuiz(itemId, value) {
      const quiz = Object.assign({}, store.quiz, {
        answers: Object.assign({}, store.quiz.answers, { [itemId]: value }),
      });
      set({ quiz }, { type: "quiz-answer", itemId });
    },
    checkQuizItem(itemId) {
      const quiz = Object.assign({}, store.quiz, {
        checked: Object.assign({}, store.quiz.checked, { [itemId]: true }),
      });
      set({ quiz }, { type: "quiz-check", itemId });
    },

    setPipelineOrder(order) {
      set({ pipelineOrder: order }, { type: "widget", key: "pipelineOrder" });
    },
    setMatchPair(sig, cat) {
      set({ matchPairs: Object.assign({}, store.matchPairs, { [sig]: cat }) }, { type: "widget", key: "matchPairs" });
    },
    setDataSource(id, value) {
      set({ dataSources: Object.assign({}, store.dataSources, { [id]: value }) }, { type: "widget", key: "dataSources" });
    },
    togglePrevention(value) {
      const prevention = store.prevention.includes(value)
        ? store.prevention.filter((v) => v !== value)
        : [...store.prevention, value];
      set({ prevention }, { type: "widget", key: "prevention" });
    },
    setBlueprint(controlId, stage) {
      set({ blueprint: Object.assign({}, store.blueprint, { [controlId]: stage }) }, { type: "widget", key: "blueprint" });
    },

    resetAll() {
      storageClear();
      const fresh = Object.assign({}, initialLabState(), initialTransient(), { hydrated: true });
      set(fresh, { type: "reset" });
    },
  };

  // ── derived helpers (same formulas as the original) ────────────────────────
  function quizDone(mode, quiz) {
    const items = mode === "medium" ? QUIZ_MEDIUM : QUIZ_HARD;
    return items.every((i) => quiz.checked[i.id]);
  }
  function quizScore(mode, quiz) {
    const items = mode === "medium" ? QUIZ_MEDIUM : QUIZ_HARD;
    return items.filter((i) => quiz.checked[i.id] && quiz.answers[i.id] === i.answer).length;
  }
  function isComplete(mode, s) {
    const total = engine.objectivesForMode(s, mode).length;
    return engine.doneCount(s, mode) >= total && quizDone(mode, s.quiz);
  }

  window.LabStore = {
    store,
    actions,
    subscribe,
    hydrate,
    set,
    quizDone,
    quizScore,
    isComplete,
    STORAGE_KEY,
    STATE_VERSION,
  };
})();
