/**
 * The Deployment Factory — static port.
 * state.js — lab-wide state store. Vanilla re-implementation of the framework's
 * LabContext (src/components/lab/LabContext.tsx): same LabState shape, same
 * actions, same persistence semantics, same run-animation timing.
 *
 * Ephemeral UI state (running/inspector/binder/console/completion/hints/accordion)
 * is kept OUT of the persisted state, exactly like the original's useState fields.
 */
const LabStore = (() => {
  const listeners = new Set();

  const ui = {
    running: false,
    liveStage: null,
    inspector: null, // StageId | null
    binder: "knowledge", // "knowledge" | "quiz" | "debrief"
    consoleOpen: false,
    completionOpen: false,
    consoleLines: [],
    hintOpen: {}, // objId -> boolean (component state in the original)
    openOrders: {}, // objId -> boolean (accordion state in the original)
  };

  // Pre-restore state is the pristine mode-select screen (mirrors the
  // original's hydration-safe initial render; restore happens right after boot).
  let state = initialState("medium", "mode-select");
  let restored = false;

  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }
  function notify(type) {
    for (const fn of listeners) fn(type);
  }

  /** Commit a LabState mutation: save (post-restore) + notify. */
  function commit(mutator, evtType) {
    const next = mutator(state);
    if (next !== state) state = next;
    // original rule: never write before the restore pass has completed
    if (restored) saveState(state);
    notify(evtType);
  }

  /** Restore persisted progress (original: one post-hydration effect). */
  function restore() {
    const saved = loadState();
    if (saved) state = saved;
    restored = true;
    notify("restore");
  }

  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ----------------------------- actions ----------------------------- */

  function setEnv(patch, evtType = "env") {
    commit((s) => ({ ...s, env: typeof patch === "function" ? patch(s.env) : { ...s.env, ...patch } }), evtType);
  }
  /** Typing inputs only change state (nothing else re-renders visually). */
  function setEnvTyping(patch) {
    setEnv(patch, "typing");
  }

  function logAction(name) {
    setEnv((e) => ({ ...e, actionLog: [...e.actionLog, name] }));
  }

  function setAnswer(objId, key, value) {
    commit(
      (s) => ({
        ...s,
        formAnswers: {
          ...s.formAnswers,
          [objId]: { ...(s.formAnswers[objId] ?? {}), [key]: value },
        },
      }),
      "answer"
    );
  }

  function revealHint(objId) {
    commit((s) => {
      const p = s.objectives[objId];
      if (!p || p.passed) return s;
      return {
        ...s,
        objectives: { ...s.objectives, [objId]: { ...p, hintsUsed: p.hintsUsed + 1 } },
      };
    }, "hint");
  }

  function checkObjective(objId) {
    const obj = objectivesFor(state.mode).find((o) => o.id === objId);
    if (!obj) return;
    const answers = state.formAnswers[objId] ?? {};
    const result = validateObjective(obj, state.env, answers);
    commit((s) => {
      const prev = s.objectives[objId] ?? { passed: false, attempts: 0, hintsUsed: 0 };
      return {
        ...s,
        objectives: {
          ...s.objectives,
          [objId]: {
            ...prev,
            passed: prev.passed || result.passed,
            attempts: prev.passed ? prev.attempts : prev.attempts + 1,
          },
        },
        lastFeedback: { ...s.lastFeedback, [objId]: result },
      };
    }, "check");
  }

  /** RUN THE LINE — same stage sweep + timing as the original runLine(). */
  async function runLine() {
    if (ui.running) return;
    ui.running = true;
    ui.consoleOpen = true;
    notify("run-tick");
    for (const s of STAGE_ORDER) {
      ui.liveStage = s;
      notify("run-tick");
      await delay(240);
    }
    await delay(200);
    ui.liveStage = null;

    const run = simulateRun(state.env);
    const applied = applyRun(state.env, run);
    const lines = [
      `── diagnostic sweep #${run.runNo} · ${new Date().toLocaleTimeString("en-GB")} · evaluating every station ──`,
    ];
    for (const st of STAGE_ORDER) lines.push(...run.stages[st].log);
    lines.push(`── sweep #${run.runNo} complete · ${run.greenCount}/7 stations green ──`);

    commit((s) => ({ ...s, env: applied }), "run-done");
    ui.consoleLines = [...ui.consoleLines.slice(-160), ...lines];
    ui.running = false;
    // full re-render: header clears the "Sweeping…" state, conveyor appends the log
    notify("run-done");
  }

  function openStation(s) {
    ui.inspector = s;
    notify("ui-modal");
  }
  function setBinder(b) {
    ui.binder = b;
    notify("ui-binder");
  }
  function setConsoleOpen(v) {
    ui.consoleOpen = !!v;
    notify("ui-console");
  }
  function setCompletionOpen(v) {
    ui.completionOpen = !!v;
    notify("ui-completion");
  }
  function toggleHintOpen(objId) {
    ui.hintOpen[objId] = !ui.hintOpen[objId];
    notify("ui-hint");
  }
  function toggleOrder(objId) {
    ui.openOrders[objId] = !ui.openOrders[objId];
    notify("ui-order");
  }

  function chooseMode(m) {
    state = initialState(m, "briefing");
    if (restored) saveState(state);
    ui.consoleLines = [];
    ui.binder = "knowledge";
    ui.hintOpen = {};
    ui.openOrders = {};
    notify("phase");
  }

  function startShift() {
    commit((s) => ({ ...s, phase: "lab" }), "phase");
  }

  function resetAll() {
    clearState();
    state = initialState(state.mode, "mode-select");
    ui.consoleLines = [];
    ui.inspector = null;
    ui.completionOpen = false;
    ui.binder = "knowledge";
    ui.hintOpen = {};
    ui.openOrders = {};
    notify("phase");
  }

  function setQuizAnswer(id, idx) {
    commit((s) => ({ ...s, quiz: { ...s.quiz, answers: { ...s.quiz.answers, [id]: idx } } }), "quiz");
  }
  function lockQuizAnswer(id) {
    commit((s) => ({ ...s, quiz: { ...s.quiz, locked: { ...s.quiz.locked, [id]: true } } }), "quiz");
  }
  function advanceQuiz() {
    commit((s) => ({ ...s, quiz: { ...s.quiz, current: s.quiz.current + 1 } }), "quiz");
  }
  function submitQuiz() {
    commit((s) => ({ ...s, quiz: { ...s.quiz, submitted: true } }), "quiz");
  }

  return {
    subscribe,
    restore,
    // state getters
    getState: () => state,
    getMode: () => state.mode,
    getEnv: () => state.env,
    getObjectives: () => objectivesFor(state.mode),
    // ephemeral getters
    getUi: () => ui,
    // actions
    setEnv,
    setEnvTyping,
    logAction,
    setAnswer,
    revealHint,
    checkObjective,
    runLine,
    openStation,
    setBinder,
    setConsoleOpen,
    setCompletionOpen,
    toggleHintOpen,
    toggleOrder,
    chooseMode,
    startShift,
    resetAll,
    setQuizAnswer,
    lockQuizAnswer,
    advanceQuiz,
    submitQuiz,
  };
})();
