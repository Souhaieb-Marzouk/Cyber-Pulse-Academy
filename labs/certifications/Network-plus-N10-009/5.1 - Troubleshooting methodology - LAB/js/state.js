// ── Fault Isolation Line — state layer (js/state.js) ──
// Plain-JS store: single state object + tiny subscribe/notify + reducer ported
// 1:1 from the original React useReducer, plus the SAME localStorage
// persistence semantics (same key, merge-load, save-on-change, confirmed reset).

function createInitialState() {
  return {
    mode: null,
    phase: 'mode',
    stationIdx: 0,
    objectives: {},
    results: {},
    dispatch: { stepOrder: DRILL_INITIAL_ORDER.slice(), subMatches: {} },
    intake: { facts: [], chats: [], duplicated: false, changeId: null, triage: {} },
    theory: { obvious: [], causeId: null, approach: null, minis: {}, probeOrder: ['po3', 'po5', 'po1', 'po4', 'po2'] },
    test: { probes: [], verdict: null, branch: null, newCause: null, discarded: false },
    plan: { order: ['a3', 'a1', 'a5', 'a2', 'a6', 'a4'], effects: [] },
    implement: { decision: null, reasons: [], actions: [], mistakes: [] },
    verify: { checks: [], preventive: [] },
    doc: { device: '', port: '', cause: '', changeId: '', actions: [], outcome: null, lessons: [], closed: false },
    quiz: { idx: 0, answers: {}, revealed: [], submitted: false },
    completedSeen: false,
  };
}

function moveItem(arr, id, dir) {
  const i = arr.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= arr.length) return arr;
  const copy = arr.slice();
  const tmp = copy[i];
  copy[i] = copy[j];
  copy[j] = tmp;
  return copy;
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_MODE':
      return Object.assign({}, state, { mode: action.mode, phase: 'dispatch' });
    case 'GOTO':
      return Object.assign({}, state, { phase: action.phase, stationIdx: action.stationIdx !== undefined ? action.stationIdx : state.stationIdx });
    case 'MOVE_STEP':
      return Object.assign({}, state, { dispatch: Object.assign({}, state.dispatch, { stepOrder: moveItem(state.dispatch.stepOrder, action.id, action.dir) }) });
    case 'SET_SUBMATCH':
      return Object.assign({}, state, { dispatch: Object.assign({}, state.dispatch, { subMatches: Object.assign({}, state.dispatch.subMatches, obj(action.id, action.value)) }) });
    case 'TOGGLE_FACT':
      return Object.assign({}, state, { intake: Object.assign({}, state.intake, { facts: toggleIn(state.intake.facts, action.id) }) });
    case 'OPEN_CHAT':
      if (state.intake.chats.indexOf(action.id) !== -1) return state;
      return Object.assign({}, state, { intake: Object.assign({}, state.intake, { chats: state.intake.chats.concat([action.id]) }) });
    case 'RUN_DUPLICATE':
      return Object.assign({}, state, { intake: Object.assign({}, state.intake, { duplicated: true }) });
    case 'SET_CHANGE':
      return Object.assign({}, state, { intake: Object.assign({}, state.intake, { changeId: action.id }) });
    case 'SET_TRIAGE':
      return Object.assign({}, state, { intake: Object.assign({}, state.intake, { triage: Object.assign({}, state.intake.triage, obj(action.id, action.value)) }) });
    case 'TOGGLE_OBVIOUS':
      return Object.assign({}, state, { theory: Object.assign({}, state.theory, { obvious: toggleIn(state.theory.obvious, action.id) }) });
    case 'SET_CAUSE':
      return Object.assign({}, state, { theory: Object.assign({}, state.theory, { causeId: action.id }) });
    case 'SET_APPROACH':
      return Object.assign({}, state, { theory: Object.assign({}, state.theory, { approach: action.id }) });
    case 'SET_MINI':
      return Object.assign({}, state, { theory: Object.assign({}, state.theory, { minis: Object.assign({}, state.theory.minis, obj(action.id, action.value)) }) });
    case 'MOVE_PROBE_ORDER':
      return Object.assign({}, state, { theory: Object.assign({}, state.theory, { probeOrder: moveItem(state.theory.probeOrder, action.id, action.dir) }) });
    case 'RUN_PROBE':
      if (state.test.probes.indexOf(action.id) !== -1) return state;
      return Object.assign({}, state, { test: Object.assign({}, state.test, { probes: state.test.probes.concat([action.id]) }) });
    case 'SET_VERDICT':
      return Object.assign({}, state, { test: Object.assign({}, state.test, { verdict: action.value, branch: null }) });
    case 'SET_BRANCH':
      return Object.assign({}, state, { test: Object.assign({}, state.test, { branch: action.value || null }) });
    case 'SET_NEW_CAUSE':
      return Object.assign({}, state, { test: Object.assign({}, state.test, { newCause: action.id }) });
    case 'ADOPT_NEW_THEORY':
      return Object.assign({}, state, {
        test: Object.assign({}, state.test, { discarded: true }),
        theory: Object.assign({}, state.theory, { causeId: state.test.newCause !== null ? state.test.newCause : state.theory.causeId }),
      });
    case 'MOVE_PLAN':
      return Object.assign({}, state, { plan: Object.assign({}, state.plan, { order: moveItem(state.plan.order, action.id, action.dir) }) });
    case 'TOGGLE_EFFECT':
      return Object.assign({}, state, { plan: Object.assign({}, state.plan, { effects: toggleIn(state.plan.effects, action.id) }) });
    case 'SET_DECISION':
      return Object.assign({}, state, { implement: Object.assign({}, state.implement, { decision: action.value }) });
    case 'TOGGLE_REASON':
      return Object.assign({}, state, { implement: Object.assign({}, state.implement, { reasons: toggleIn(state.implement.reasons, action.id) }) });
    case 'DO_ACTION': {
      let def = null;
      for (const a of IMPLEMENT_ACTIONS) if (a.id === action.id) def = a;
      const isMistake = !!(def && def.distractor) && state.implement.mistakes.indexOf(action.id) === -1;
      return Object.assign({}, state, {
        implement: Object.assign({}, state.implement, {
          actions: state.implement.actions.concat([action.id]),
          mistakes: isMistake ? state.implement.mistakes.concat([action.id]) : state.implement.mistakes,
        }),
      });
    }
    case 'UNDO_ACTION':
      return Object.assign({}, state, { implement: Object.assign({}, state.implement, { actions: state.implement.actions.slice(0, -1) }) });
    case 'ABORT_WINDOW':
      // Audit QA-7 fix: clears the executor for a clean restart of the change
      // window. Difficulty is NOT weakened: the failed attempt is already
      // recorded (attempts+1 → star deduction) and the check feedback stands.
      return Object.assign({}, state, { implement: Object.assign({}, state.implement, { actions: [], mistakes: [] }) });
    case 'RUN_CHECK': {
      const result = evaluateObjective(action.id, state);
      const prev = state.objectives[action.id] || { done: false, attempts: 0, firstTry: false, hints: 0 };
      const attempts = prev.attempts + 1;
      const nowDone = prev.done || result.pass;
      const objectives = Object.assign({}, state.objectives);
      objectives[action.id] = {
        done: nowDone,
        attempts: attempts,
        firstTry: prev.done ? prev.firstTry : (attempts === 1 && result.pass),
        hints: prev.hints,
      };
      const results = Object.assign({}, state.results);
      results[action.id] = result;
      return Object.assign({}, state, { objectives: objectives, results: results });
    }
    case 'OPEN_HINT': {
      const o = OBJECTIVES[action.id];
      const prev = state.objectives[action.id] || { done: false, attempts: 0, firstTry: false, hints: 0 };
      // Audit QA-10 fix: hard mode allows exactly ONE optional hint (costed).
      const cap = state.mode === 'hard' ? 1 : o.hints.length;
      if (prev.hints >= cap) return state;
      const objectives = Object.assign({}, state.objectives);
      objectives[action.id] = Object.assign({}, prev, { hints: prev.hints + 1 });
      return Object.assign({}, state, { objectives: objectives });
    }
    case 'RUN_VERIFY':
      if (state.verify.checks.indexOf(action.id) !== -1) return state;
      return Object.assign({}, state, { verify: Object.assign({}, state.verify, { checks: state.verify.checks.concat([action.id]) }) });
    case 'TOGGLE_PREVENTIVE':
      return Object.assign({}, state, { verify: Object.assign({}, state.verify, { preventive: toggleIn(state.verify.preventive, action.id) }) });
    case 'SET_DOC':
      return Object.assign({}, state, { doc: Object.assign({}, state.doc, obj(action.field, action.value)) });
    case 'TOGGLE_DOC_ACTION':
      return Object.assign({}, state, { doc: Object.assign({}, state.doc, { actions: toggleIn(state.doc.actions, action.id) }) });
    case 'TOGGLE_LESSON':
      return Object.assign({}, state, { doc: Object.assign({}, state.doc, { lessons: toggleIn(state.doc.lessons, action.id) }) });
    case 'CLOSE_TICKET':
      return Object.assign({}, state, { doc: Object.assign({}, state.doc, { closed: true }) });
    case 'QUIZ_SELECT': {
      const answers = Object.assign({}, state.quiz.answers);
      answers[action.qid] = action.idx;
      return Object.assign({}, state, { quiz: Object.assign({}, state.quiz, { answers: answers }) });
    }
    case 'QUIZ_LOCK': {
      if (state.quiz.revealed[state.quiz.idx]) return state;
      const revealed = state.quiz.revealed.slice();
      revealed[state.quiz.idx] = true;
      return Object.assign({}, state, { quiz: Object.assign({}, state.quiz, { revealed: revealed }) });
    }
    case 'QUIZ_NEXT':
      return Object.assign({}, state, { quiz: Object.assign({}, state.quiz, { idx: state.quiz.idx + 1 }) });
    case 'QUIZ_SUBMIT':
      return Object.assign({}, state, { quiz: Object.assign({}, state.quiz, { submitted: true }), phase: 'debrief' });
    case 'SEEN_COMPLETION':
      return Object.assign({}, state, { completedSeen: true });
    case 'RESET':
      return createInitialState();
    default:
      return state;
  }
}

// helpers shared by the reducer
function obj(key, value) { const o = {}; o[key] = value; return o; }
function toggleIn(arr, id) {
  return arr.indexOf(id) !== -1 ? arr.filter(function (x) { return x !== id; }) : arr.concat([id]);
}

// ── Persistence (graceful degradation, same semantics as the original) ──
function loadState() {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(LS_KEY) : null;
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const fresh = createInitialState();
    return Object.assign({}, fresh, parsed, {
      dispatch: Object.assign({}, fresh.dispatch, parsed.dispatch),
      intake: Object.assign({}, fresh.intake, parsed.intake),
      theory: Object.assign({}, fresh.theory, parsed.theory),
      test: Object.assign({}, fresh.test, parsed.test),
      plan: Object.assign({}, fresh.plan, parsed.plan),
      implement: Object.assign({}, fresh.implement, parsed.implement),
      verify: Object.assign({}, fresh.verify, parsed.verify),
      doc: Object.assign({}, fresh.doc, parsed.doc),
      quiz: Object.assign({}, fresh.quiz, parsed.quiz),
      objectives: parsed.objectives || {},
      results: parsed.results || {},
    });
  } catch (e) {
    return null;
  }
}
function saveState(s) {
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(s));
  } catch (e) {
    /* storage unavailable — degrade gracefully */
  }
}

// ── Tiny store: subscribe/notify around the reducer ──
const store = (function () {
  let state = null;
  const listeners = [];
  return {
    init() {
      state = loadState() || createInitialState();
    },
    getState() { return state; },
    dispatch(action, opts) {
      const next = reducer(state, action);
      if (next === state) return; // reducer returned identical state → no notify
      state = next;
      saveState(state);
      if (!(opts && opts.silent)) notify();
    },
    subscribe(fn) { listeners.push(fn); },
  };
  function notify() { for (const fn of listeners) fn(); }
})();
