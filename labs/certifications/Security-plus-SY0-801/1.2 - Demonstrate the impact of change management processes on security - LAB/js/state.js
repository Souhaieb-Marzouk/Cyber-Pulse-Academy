/* ===================================================================
   state.js — State management + localStorage persistence
   ===================================================================
   Single plain-JS state object with subscribe/notify.
   Same persistence key and semantics as the original framework lab.
   =================================================================== */

const STORAGE_KEY = 'cab-lab-state-v1';

/* ----- Initial environment state ----- */
function emptyEnv() {
  return {
    rfcClassifications: {},    // rfcId -> 'standard'|'normal'|'emergency'
    rfcApprovals: {},          // rfcId -> 'pre-approved'|'cab'|'ecab'|'none'
    rfcMissingFields: {},      // rfcId -> fieldId
    processOrder: [],          // step IDs in student's chosen order
    identifiedDrifts: [],      // rule IDs flagged as unauthorized
    identifiedViolations: [],   // violation IDs
    reconstructedOrder: [],    // event IDs in reconstructed order
    rollbackOrder: [],         // step IDs in student's rollback plan
    docChecks: {},             // docId -> boolean (and '__m1_read')
    impactAnswers: {},         // fieldId -> text (and 'h3_control', 'h6_break')
    failureMatches: {},        // failureId -> consequenceId
    justificationText: '',     // H9 text
    incidentFailures: [],       // failure IDs (shared by M4/H1/H7)
  };
}

/* ----- Initial quiz record ----- */
function emptyQuizRecord() { return { answers: {}, submitted: false, score: 0 }; }

/* ----- Load from localStorage or create fresh ----- */
function loadState() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      var parsed = JSON.parse(raw);
      if (parsed && parsed.state) return parsed.state;
    }
  } catch (e) { /* localStorage unavailable or corrupt — start fresh */ }
  return {
    selectedMode: null,
    startedAt: null,
    objectiveRecords: {},
    quizRecords: { medium: emptyQuizRecord(), hard: emptyQuizRecord() },
    env: emptyEnv(),
    completionDismissed: false,
  };
}

/* ----- The global state ----- */
var state = loadState();
var listeners = [];

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: state, version: 0 }));
  } catch (e) { /* localStorage full or unavailable — degrade silently */ }
}

function subscribe(fn) { listeners.push(fn); }

function notify() {
  saveState();
  listeners.forEach(function(fn) { try { fn(state); } catch (e) { console.error('Listener error:', e); } });
}

/* ----- State mutations ----- */
function setMode(mode) {
  state.selectedMode = mode;
  state.startedAt = Date.now();
  state.completionDismissed = false;
  notify();
}

function resetLab() {
  state.selectedMode = null;
  state.startedAt = null;
  state.objectiveRecords = {};
  state.quizRecords = { medium: emptyQuizRecord(), hard: emptyQuizRecord() };
  state.env = emptyEnv();
  state.completionDismissed = false;
  notify();
}

function getObjectiveRecord(id) {
  return state.objectiveRecords[id] || { completed: false, attempts: 0, hintsUsed: 0, lastCheckAt: 0 };
}

function checkObjective(objectiveId) {
  var mode = state.selectedMode;
  if (!mode) return false;
  var all = MEDIUM_OBJECTIVES.concat(HARD_OBJECTIVES);
  var obj = null;
  for (var i = 0; i < all.length; i++) { if (all[i].id === objectiveId) { obj = all[i]; break; } }
  if (!obj) return false;
  var passed = obj.check(state);
  var prev = getObjectiveRecord(objectiveId);
  state.objectiveRecords[objectiveId] = {
    completed: prev.completed || passed,
    attempts: prev.attempts + 1,
    hintsUsed: prev.hintsUsed,
    lastCheckAt: Date.now(),
  };
  notify();
  return passed;
}

function useHint(objectiveId) {
  var prev = getObjectiveRecord(objectiveId);
  state.objectiveRecords[objectiveId] = {
    completed: prev.completed,
    attempts: prev.attempts,
    hintsUsed: Math.min(prev.hintsUsed + 1, 3),
    lastCheckAt: prev.lastCheckAt,
  };
  notify();
}

function patchEnv(key, value) {
  state.env[key] = value;
  notify();
}

function setQuizAnswer(mode, questionId, optionIndices) {
  var qr = state.quizRecords[mode];
  qr.answers[questionId] = optionIndices;
  notify();
}

function submitQuiz(mode, score) {
  var qr = state.quizRecords[mode];
  qr.submitted = true;
  qr.score = score;
  notify();
}

function dismissCompletion() {
  state.completionDismissed = true;
  notify();
}

/* ----- Selectors ----- */
function getCompletedCount(mode) {
  var objs = getObjectives(mode);
  var count = 0;
  for (var i = 0; i < objs.length; i++) { if (getObjectiveRecord(objs[i].id).completed) count++; }
  return count;
}

function getTotalCount(mode) { return getObjectives(mode).length; }

function computeStars(mode) {
  var objs = getObjectives(mode);
  if (objs.length === 0) return 0;
  var completed = 0, totalHints = 0, totalAttempts = 0;
  objs.forEach(function(o) {
    var rec = getObjectiveRecord(o.id);
    if (rec.completed) completed++;
    totalHints += rec.hintsUsed;
    totalAttempts += rec.attempts;
  });
  if (completed < objs.length) return 0;
  var maxHints = objs.length * 2;
  var maxAttempts = objs.length * 1.5;
  var hintPenalty = Math.min(totalHints / maxHints, 1) * 1.5;
  var attemptPenalty = Math.min(Math.max(totalAttempts - objs.length, 0) / maxAttempts, 1) * 0.5;
  var stars = 5 - hintPenalty - attemptPenalty;
  return Math.max(3, Math.min(5, Math.round(stars)));
}

function isQuizCorrect(question) {
  var mode = state.selectedMode;
  var qr = state.quizRecords[mode];
  var ans = qr.answers[question.id] || [];
  return ans.length === question.correct.length && ans.every(function(i) { return question.correct.indexOf(i) !== -1; });
}

/* ----- Expanded objective state (for UI: which objective is expanded, hint level shown) ----- */
var uiState = {
  expandedObjective: null,
  hintLevels: {},    // objectiveId -> number of hints shown
  feedback: {},      // objectiveId -> { ok: bool, msg: string }
  activeTab: 'triage',
  glossaryOpen: false,
  confirmReset: false,
};
