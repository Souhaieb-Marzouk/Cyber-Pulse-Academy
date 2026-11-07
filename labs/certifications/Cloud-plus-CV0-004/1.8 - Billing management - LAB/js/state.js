/* ==========================================================================
   js/state.js — state engine (static port of src/lib/lab/state.tsx)
   --------------------------------------------------------------------------
   A single plain-JS store with the SAME actions, reducer semantics,
   localStorage key, save/restore/RESET behavior, scoring and star rating as
   the original React reducer. A tiny subscribe/notify mechanism replaces the
   React context: listeners re-render the views they own.

   Non-persisted view state (the original's component-local useState) lives in
   `uiState`: the invoice's expanded row and per-objective last check result.
   Like React component state, both reset when you leave a station.
   ========================================================================== */

'use strict';

const STORAGE_KEY = 'cloudplus-billing-lab-v1';

const STATIONS = [
  { id: 'briefing', title: 'Pre-Audit Review', kicker: 'The case file' },
  { id: 'meters', title: 'Price List & Meters', kicker: 'How the meter runs' },
  { id: 'invoice', title: 'Invoice Markup', kicker: 'Line by line' },
  { id: 'attribution', title: 'Attribution & Tags', kicker: 'Who owns what' },
  { id: 'controls', title: 'Controls & Alerts', kicker: 'Never again' },
  { id: 'remediation', title: 'Remediation Plan', kicker: 'Fix the leak' },
  { id: 'signoff', title: 'Sign-Off', kicker: 'Close the ledger' },
];

function emptyEnv() {
  return {
    // Station 2 — meters
    modelClassification: {},
    meterMatches: {},
    // Station 3 — invoice markup
    flagged: [],
    spikeVerdicts: {},
    egressCause: '',
    egressRule: '',
    alertFireDate: '',
    // Station 4 — attribution & tags
    untaggedCount: '',
    untaggedTeam: '',
    tagDept: '',
    tagEnv: '',
    tagsApplied: false,
    incidentId: '',
    responseOrder: [],
    rootContribs: [],
    rootOverrun: '',
    chargebackAmount: '',
    chargebackModel: '',
    reconcileAmount: '',
    reconcileBasis: '',
    // Station 5 — controls
    budgetCap: '',
    budgetThreshold: '',
    alertRuleA: false,
    alertAmtA: '',
    alertRuleB: false,
    alertPctB: '',
    alertFreq: '',
    alertRoutes: [],
    // Station 6 — remediation
    dbSize: '',
    reservedCount: '',
    reservedScope: '',
    fleetPlans: {},
    fleetJust: {},
    rszActions: {},
    snapDeleted: false,
    snapLifecycle: false,
    egressControls: [],
    policyFlaws: [],
  };
}

function emptyObjState() {
  const rec = {};
  for (const o of OBJECTIVES.medium) {
    rec[o.id] = { passed: false, attempts: 0, firstAttempt: true, hintsUsed: 0 };
  }
  for (const o of OBJECTIVES.hard) {
    rec[o.id] = { passed: false, attempts: 0, firstAttempt: true, hintsUsed: 0 };
  }
  return rec;
}

function freshState() {
  return {
    mode: null, // null = the mode gate is showing
    env: emptyEnv(),
    obj: emptyObjState(),
    quizAnswers: {},
    quizSubmitted: false,
    station: 'briefing',
    visited: ['briefing'],
    completionSeen: false,
    hydrated: false,
  };
}

/* View-local (non-persisted) state — mirrors the original's useState hooks. */
const uiState = {
  invoiceOpenRow: 'gpu', // StationInvoice's useState('gpu')
  lastResult: {}, // ObjectiveCard's useState<'pass' | 'fail' | null>
  drawerTab: null, // EvidenceDrawer's uncontrolled Tabs state (per station mount)
  _extraKeys: {}, // bookkeeping: which card reveals already played their animation
};

function resetViewForStation(station) {
  if (station === 'invoice') uiState.invoiceOpenRow = 'gpu';
  else uiState.invoiceOpenRow = null;
  uiState.lastResult = {};
  uiState.drawerTab = null;
  uiState._extraKeys = {};
}

/* ------------------------------ store ----------------------------------- */

let state = freshState();
const listeners = new Set();

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  for (const fn of listeners) fn();
}

function persist() {
  if (!state.hydrated) return;
  try {
    const { hydrated: _omit, ...snapshot } = state;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // storage full/blocked — the lab keeps working in-memory
  }
}

/** Apply one action (reducer semantics ported 1:1), persist, notify. */
function dispatch(action) {
  const next = reduce(state, action);
  if (next !== state) {
    state = next;
    persist();
    if (action.type === 'SET_STATION') resetViewForStation(action.station);
    if (action.type === 'SET_MODE' || action.type === 'RESET') resetViewForStation(state.station);
    notify();
  }
}

function reduce(s, action) {
  switch (action.type) {
    case 'HYDRATE':
      return { ...action.payload, hydrated: true };

    case 'SET_MODE': {
      // Selecting a mode always starts from a pristine case file.
      return { ...freshState(), mode: action.mode, hydrated: true };
    }

    case 'SET_STATION':
      return {
        ...s,
        station: action.station,
        visited: s.visited.includes(action.station) ? s.visited : [...s.visited, action.station],
      };

    case 'PATCH_ENV':
      return { ...s, env: { ...s.env, ...action.patch } };

    case 'TOGGLE_FLAG': {
      const cur = s.env.flagged;
      const next = cur.includes(action.id) ? cur.filter((x) => x !== action.id) : [...cur, action.id];
      return { ...s, env: { ...s.env, flagged: next } };
    }

    case 'CHECK': {
      const prev = s.obj[action.id];
      const wasPassed = prev ? prev.passed : false;
      const attempts = (prev ? prev.attempts : 0) + 1;
      const passed = wasPassed ? true : action.ok;
      const firstAttempt = wasPassed ? prev.firstAttempt : prev && prev.attempts === 0 && action.ok;
      return {
        ...s,
        obj: {
          ...s.obj,
          [action.id]: { ...prev, passed, attempts, firstAttempt: firstAttempt === undefined ? false : firstAttempt },
        },
      };
    }

    case 'HINT': {
      const prev = s.obj[action.id];
      return {
        ...s,
        obj: { ...s.obj, [action.id]: { ...prev, hintsUsed: (prev ? prev.hintsUsed : 0) + 1 } },
      };
    }

    case 'ANSWER':
      return { ...s, quizAnswers: { ...s.quizAnswers, [action.qid]: action.oid } };

    case 'SUBMIT_QUIZ':
      return { ...s, quizSubmitted: true };

    case 'SHOW_COMPLETION':
      return { ...s, completionSeen: false };

    case 'SEEN_COMPLETION':
      return { ...s, completionSeen: true };

    case 'RESET':
      return { ...freshState(), hydrated: true };

    default:
      return s;
  }
}

/* ------------------------------ hydration ------------------------------- */

function hydrate() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = {
        ...freshState(),
        ...parsed,
        env: { ...emptyEnv(), ...(parsed.env || {}) },
        obj: { ...emptyObjState(), ...(parsed.obj || {}) },
        hydrated: true,
      };
    } else {
      state = { ...freshState(), hydrated: true };
    }
  } catch {
    // localStorage unavailable or corrupt — degrade gracefully to pristine state
    state = { ...freshState(), hydrated: true };
  }
  resetViewForStation(state.station);
}

/* ------------------------------ selectors ------------------------------- */

function objectivesFor(mode) {
  return OBJECTIVES[mode];
}

function quizFor(mode) {
  return mode === 'medium' ? QUIZ_MEDIUM : QUIZ_HARD;
}

function allObjectives() {
  return [...OBJECTIVES.medium, ...OBJECTIVES.hard];
}

/** Machine-checkable CHECK RESULTS: validate + record the attempt. */
function check(id) {
  const def = allObjectives().find((o) => o.id === id);
  if (!def || !state.mode) return false;
  const ok = def.validate(state.env);
  dispatch({ type: 'CHECK', id, ok });
  return ok;
}

/* ------------------------------ scoring --------------------------------- */

function summarize(s, mode) {
  const objs = objectivesFor(mode);
  const quiz = quizFor(mode);
  const passed = objs.filter((o) => s.obj[o.id] && s.obj[o.id].passed).length;
  const passedStates = objs.map((o) => s.obj[o.id]).filter((st) => st && st.passed);
  const firstAttemptRatio = passedStates.length
    ? passedStates.filter((st) => st.firstAttempt).length / passedStates.length
    : 0;
  const hintsUsed = objs.reduce((a, o) => a + ((s.obj[o.id] && s.obj[o.id].hintsUsed) || 0), 0);
  const quizCorrect = quiz.filter((q) => s.quizAnswers[q.id] === q.correct).length;
  const points = passed * 10 + quizCorrect * 5;
  const maxPoints = objs.length * 10 + quiz.length * 5;
  const pct = maxPoints === 0 ? 0 : points / maxPoints;

  let stars = 1;
  if (passed === objs.length && s.quizSubmitted) {
    let quality = firstAttemptRatio * 0.6 + (quizCorrect / quiz.length) * 0.4;
    quality -= hintsUsed * (mode === 'hard' ? 0.1 : 0.02);
    stars = quality >= 0.95 ? 5 : quality >= 0.85 ? 4 : quality >= 0.7 ? 3 : quality >= 0.5 ? 2 : 1;
  }
  return {
    passed,
    total: objs.length,
    quizCorrect,
    quizTotal: quiz.length,
    points,
    maxPoints,
    pct,
    stars,
    firstAttemptRatio,
    hintsUsed,
  };
}
