/* ============================================================
 * CONTROLS BRIDGE — State + Persistence + Pub/Sub
 * Single plain-JS state object with subscribe/notify.
 * Same persistence keys and semantics as the original lab.
 * ============================================================ */

var Lab = window.Lab || {};

Lab.state = (function() {
  "use strict";

  var STORAGE_KEY = "controls-bridge-lab-v1";
  var subscribers = [];

  // ---- Initial pristine state ----
  function pristineState() {
    return {
      mode: null,
      hasStarted: false,
      objectives: {},          // { id: { status, attempts, hintsUsed, hardNudgeUsed, completedAt } }
      classifications: {},     // { controlId: { category, function } }
      stress: {},              // { layer: { disabledControls: [], running: bool } }
      sequences: {},           // { objectiveId: [orderedIds] }
      selections: {},          // { objectiveId: [selectedOptions] }
      freeText: {},            // { objectiveId: "text" }
      compositeSelections: {}, // { "objId--specIndex": "value" }
      compositeFreeText: {},   // { "objId--specIndex": "text" }
      quiz: {},                // { questionId: { selectedIndex, checked, answeredAt } }
      quizCurrentIndex: 0,     // which quiz question is displayed
      hintsUsedTotal: 0,
      tutorCallsUsed: 0,
      completedAt: null,
      completionDismissed: false,
    };
  }

  var state = pristineState();

  // ---- Persistence ----
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch(e) {
      // localStorage unavailable or full — degrade gracefully.
      console.warn("[Controls Bridge] localStorage save failed:", e);
    }
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var parsed = JSON.parse(raw);
      // Merge with pristine to handle new fields added after initial save.
      state = Object.assign(pristineState(), parsed);
      // Ensure quiz entries have the `checked` field (added in audit fix).
      if (state.quiz) {
        Object.keys(state.quiz).forEach(function(qid) {
          if (state.quiz[qid] && typeof state.quiz[qid].checked === "undefined") {
            state.quiz[qid].checked = false;
          }
        });
      }
    } catch(e) {
      console.warn("[Controls Bridge] localStorage load failed:", e);
      state = pristineState();
    }
  }

  // ---- Pub/Sub ----
  function subscribe(fn) {
    subscribers.push(fn);
    return function unsubscribe() {
      subscribers = subscribers.filter(function(f) { return f !== fn; });
    };
  }

  function notify() {
    save();
    subscribers.forEach(function(fn) {
      try { fn(state); } catch(e) { console.error("[Controls Bridge] subscriber error:", e); }
    });
  }

  // ---- Helper: update state and notify ----
  function set(partial) {
    if (typeof partial === "function") {
      var result = partial(state);
      if (result) Object.assign(state, result);
    } else {
      Object.assign(state, partial);
    }
    notify();
  }

  // ---- Actions (same names + semantics as the original Zustand store) ----

  function startLab(mode) {
    set(function(s) {
      var base = {
        mode: mode,
        hasStarted: true,
        completedAt: null,
        completionDismissed: false,
      };
      // Medium mode: pre-seed CTL-018 as the "trap" (preventive instead of detective).
      if (mode === "medium" && !s.classifications["CTL-018"]) {
        return Object.assign(base, {
          classifications: Object.assign({}, s.classifications, {
            "CTL-018": { category: "technical", function: "preventive" },
          }),
        });
      }
      return base;
    });
  }

  function exitToModeSelect() {
    set({ mode: null, hasStarted: false, completedAt: null, completionDismissed: false });
  }

  function setObjectiveStatus(id, status) {
    var cur = state.objectives[id] || { status:"untouched", attempts:0, hintsUsed:0, hardNudgeUsed:false };
    state.objectives[id] = Object.assign(
      {},
      cur,
      { status: status, completedAt: status === "correct" ? Date.now() : undefined }
    );
    notify();
  }

  function incrementAttempts(id) {
    var cur = state.objectives[id] || { status:"untouched", attempts:0, hintsUsed:0, hardNudgeUsed:false };
    if (cur.status === "untouched") cur.status = "in-progress";
    cur.attempts = (cur.attempts || 0) + 1;
    state.objectives[id] = cur;
    notify();
  }

  function useHint(id) {
    var cur = state.objectives[id] || { status:"untouched", attempts:0, hintsUsed:0, hardNudgeUsed:false };
    if (cur.hintsUsed >= 3) return;
    cur.hintsUsed = (cur.hintsUsed || 0) + 1;
    state.objectives[id] = cur;
    state.hintsUsedTotal = (state.hintsUsedTotal || 0) + 1;
    notify();
  }

  function useHardNudge(id) {
    var cur = state.objectives[id] || { status:"untouched", attempts:0, hintsUsed:0, hardNudgeUsed:false };
    if (cur.hardNudgeUsed) return;
    cur.hardNudgeUsed = true;
    state.objectives[id] = cur;
    state.hintsUsedTotal = (state.hintsUsedTotal || 0) + 1;
    notify();
  }

  function setClassification(controlId, field, value) {
    var cur = state.classifications[controlId] || { category: null, function: null };
    cur[field] = value;
    state.classifications[controlId] = cur;
    notify();
  }

  function setStressDisabled(layer, controlIds) {
    var cur = state.stress[layer] || { disabledControls: [], running: false };
    state.stress[layer] = { disabledControls: controlIds, running: cur.running };
    notify();
  }

  function setSequence(objectiveId, order) {
    state.sequences[objectiveId] = order;
    notify();
  }

  function setSelection(objectiveId, options) {
    state.selections[objectiveId] = options;
    notify();
  }

  function setFreeText(objectiveId, text) {
    state.freeText[objectiveId] = text;
    notify();
  }

  function setCompositeSelection(key, value) {
    state.compositeSelections[key] = value;
    notify();
  }

  function setCompositeFreeText(key, value) {
    state.compositeFreeText[key] = value;
    notify();
  }

  function setQuizAnswer(questionId, selectedIndex) {
    var existing = state.quiz[questionId];
    if (existing && existing.checked) return; // R2: locked after check
    state.quiz[questionId] = {
      selectedIndex: selectedIndex,
      checked: existing ? existing.checked : false,
      answeredAt: Date.now(),
    };
    notify();
  }

  function setQuizChecked(questionId) {
    var existing = state.quiz[questionId];
    if (!existing || existing.selectedIndex === null) return;
    state.quiz[questionId] = Object.assign(existing, { checked: true, answeredAt: Date.now() });
    notify();
  }

  function setQuizCurrentIndex(idx) {
    state.quizCurrentIndex = idx;
    notify();
  }

  function markComplete() {
    set({ completedAt: Date.now() });
  }

  function dismissCompletion() {
    set({ completionDismissed: true });
  }

  function reset() {
    state = pristineState();
    notify();
  }

  function resetObjective(id) {
    state.objectives[id] = { status:"untouched", attempts:0, hintsUsed:0, hardNudgeUsed:false };
    notify();
  }

  // ---- Public API ----
  return {
    getState: function() { return state; },
    subscribe: subscribe,
    load: load,
    save: save,
    startLab: startLab,
    exitToModeSelect: exitToModeSelect,
    setObjectiveStatus: setObjectiveStatus,
    incrementAttempts: incrementAttempts,
    useHint: useHint,
    useHardNudge: useHardNudge,
    setClassification: setClassification,
    setStressDisabled: setStressDisabled,
    setSequence: setSequence,
    setSelection: setSelection,
    setFreeText: setFreeText,
    setCompositeSelection: setCompositeSelection,
    setCompositeFreeText: setCompositeFreeText,
    setQuizAnswer: setQuizAnswer,
    setQuizChecked: setQuizChecked,
    setQuizCurrentIndex: setQuizCurrentIndex,
    markComplete: markComplete,
    dismissCompletion: dismissCompletion,
    reset: reset,
    resetObjective: resetObjective,
    pristineState: pristineState,
  };
})();
