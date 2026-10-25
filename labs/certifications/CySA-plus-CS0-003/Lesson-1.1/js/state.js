/**
 * CyberLab — "The Leadership Ledger" — STATE STORE
 *
 * Plain-JS port of the original zustand store (store.ts), preserving:
 *   - the same localStorage key and the same partialized fields
 *   - the same action semantics (start/mode-switch, filed-guard, hint caps,
 *     quiz gating, completion auto-open flags, pristine reset)
 *   - graceful degradation when localStorage is unavailable
 *
 * A tiny subscribe/notify mechanism lets app.js re-render only what changed.
 */
'use strict';

var STORAGE_KEY = 'cyberlab-cysa-leadership-v1';

/* Same partialize() set as the original — dialogs/announcements are session-only. */
var PERSIST_FIELDS = [
  'phase',
  'mode',
  'progress',
  'answers',
  'activeId',
  'quizAnswers',
  'quizSubmitted',
  'completionSeen',
  'decoyOpened',
];

var labState = {
  phase: 'cover', // 'cover' | 'active'
  mode: null, // 'medium' | 'hard' | null
  progress: {}, // objId -> ObjectiveProgress
  answers: {}, // objId -> (partIdx -> PartAnswers)
  activeId: null, // objective id or 'QUIZ'
  quizAnswers: {}, // quizId -> optionId
  quizSubmitted: false,
  completionSeen: false,
  briefingOpen: false,
  completionOpen: false,
  decoyOpened: false,
  announcement: '',
};

var stateListeners = [];
var persistScheduled = false;

function subscribeState(fn) {
  stateListeners.push(fn);
  return function unsubscribe() {
    var i = stateListeners.indexOf(fn);
    if (i >= 0) stateListeners.splice(i, 1);
  };
}

/**
 * Merge a patch into state, persist, and notify listeners with the patch keys.
 * @param {Record<string, unknown>} patch
 */
function setState(patch) {
  for (var k in patch) labState[k] = patch[k];
  schedulePersist();
  for (var i = 0; i < stateListeners.length; i++) stateListeners[i](patch);
}

function schedulePersist() {
  if (persistScheduled) return;
  persistScheduled = true;
  /* microtask batching: N rapid setAnswer calls → 1 localStorage write */
  Promise.resolve().then(function () {
    persistScheduled = false;
    persistState();
  });
}

function persistState() {
  try {
    var out = {};
    for (var i = 0; i < PERSIST_FIELDS.length; i++) {
      var f = PERSIST_FIELDS[i];
      out[f] = labState[f];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(out));
  } catch (e) {
    /* storage unavailable/full — degrade to in-memory, lab stays usable */
  }
}

/** Immediately rehydrate a saved session (same as the original's module-scope rehydrate). */
function rehydrateState() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    var parsed = JSON.parse(raw);
    for (var i = 0; i < PERSIST_FIELDS.length; i++) {
      var f = PERSIST_FIELDS[i];
      if (f in parsed) labState[f] = parsed[f];
    }
  } catch (e) {
    /* corrupt or unavailable storage — start pristine */
  }
}

/* ------------------------------------------------------------------ */
/* Actions (1:1 semantics with store.ts)                               */
/* ------------------------------------------------------------------ */

function freshProgress() {
  return { status: 'todo', attempts: 0, hintsUsed: 0, solvedFirstAttempt: false, lastResult: 'none' };
}

function startMode(mode) {
  if (labState.mode === mode) {
    setState({ phase: 'active', briefingOpen: false });
  } else {
    /* switching modes files the old session and begins fresh (state is per-mode) */
    setState({
      phase: 'active',
      mode: mode,
      progress: {},
      answers: {},
      activeId: null,
      quizAnswers: {},
      quizSubmitted: false,
      completionSeen: false,
      decoyOpened: false,
      briefingOpen: false,
    });
  }
}

function goCover() {
  setState({ phase: 'cover', briefingOpen: false });
}

function openObjective(id) {
  setState({ activeId: id });
}

function setAnswer(objId, partIdx, value) {
  var perObj = labState.answers[objId] ? Object.assign({}, labState.answers[objId]) : {};
  perObj[partIdx] = value;
  var answers = Object.assign({}, labState.answers);
  answers[objId] = perObj;
  setState({ answers: answers });
}

function checkObjective(objId) {
  var obj = findObjective(objId);
  if (!obj || !labState.mode) return;
  var ans = labState.answers[objId] || {};
  if (!isObjectiveTouched(obj, ans)) return;
  var prev = labState.progress[objId] || freshProgress();
  /* already filed — never re-count attempts (guards rapid double-clicks) */
  if (prev.status === 'filed') return;
  var correct = isObjectiveCorrect(obj, ans);
  var next = Object.assign({}, prev, {
    attempts: prev.attempts + 1,
    status: correct ? 'filed' : 'todo',
    lastResult: correct ? 'filed' : 'returned',
    solvedFirstAttempt: correct ? prev.attempts === 0 : prev.solvedFirstAttempt,
  });
  var progress = Object.assign({}, labState.progress);
  progress[objId] = next;
  setState({
    progress: progress,
    announcement: correct
      ? obj.code + ' filed. Objective complete.'
      : obj.code + ' returned. Read the feedback and try again.',
  });
}

function revealHint(objId) {
  var prev = labState.progress[objId] || freshProgress();
  var obj = findObjective(objId);
  var maxHints = obj ? obj.hints.length : 0;
  if (prev.hintsUsed >= maxHints) return;
  var progress = Object.assign({}, labState.progress);
  progress[objId] = Object.assign({}, prev, { hintsUsed: prev.hintsUsed + 1 });
  setState({
    progress: progress,
    announcement: 'Hint revealed for ' + (obj ? obj.code : 'objective') + '.',
  });
}

function answerQuiz(qid, optId) {
  var quizAnswers = Object.assign({}, labState.quizAnswers);
  quizAnswers[qid] = optId;
  setState({ quizAnswers: quizAnswers });
}

function submitQuiz() {
  setState({
    quizSubmitted: true,
    announcement: 'Knowledge check submitted. Explanations are now visible.',
  });
}

function setBriefingOpen(open) {
  setState({ briefingOpen: open });
}

function setCompletionOpen(open) {
  var patch = { completionOpen: open };
  if (open) patch.completionSeen = true;
  setState(patch);
}

function openDecoy() {
  setState({ decoyOpened: true });
}

function announce(msg) {
  setState({ announcement: msg });
}

function resetAll() {
  setState({
    phase: 'cover',
    mode: null,
    progress: {},
    answers: {},
    activeId: null,
    quizAnswers: {},
    quizSubmitted: false,
    completionSeen: false,
    briefingOpen: false,
    completionOpen: false,
    decoyOpened: false,
    announcement: 'Lab reset to pristine state.',
  });
}

/* ------------------------------------------------------------------ */
/* Scoring (ported 1:1 from store.ts)                                  */
/* ------------------------------------------------------------------ */

function objectiveScore(p) {
  if (!p || p.status !== 'filed') return 0;
  var base = p.solvedFirstAttempt ? 10 : 6;
  return Math.max(3, base - p.hintsUsed);
}

function computeScore(mode, progress, quizAnswers, quizSubmitted) {
  var objs = objectivesForMode(mode);
  var filed = 0;
  var objScore = 0;
  for (var i = 0; i < objs.length; i++) {
    if (progress[objs[i].id] && progress[objs[i].id].status === 'filed') filed++;
    objScore += objectiveScore(progress[objs[i].id]);
  }
  var quiz = QUIZ.filter(function (q) { return q.mode === mode; });
  var quizCorrect = 0;
  for (var j = 0; j < quiz.length; j++) {
    if (quizAnswers[quiz[j].id] === quiz[j].correct) quizCorrect++;
  }
  var quizScore = quizSubmitted ? quizCorrect * 10 : 0;
  var max = MAX_SCORE[mode];
  var score = objScore + quizScore;
  var percent = Math.round((score / max) * 100);
  return {
    score: score,
    max: max,
    percent: percent,
    stars: starsFor(percent),
    filed: filed,
    total: objs.length,
    quizCorrect: quizCorrect,
    quizTotal: quiz.length,
  };
}
