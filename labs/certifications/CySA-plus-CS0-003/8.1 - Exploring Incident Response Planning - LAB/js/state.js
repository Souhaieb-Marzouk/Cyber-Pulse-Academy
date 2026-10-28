/**
 * State store — plain-JS port of the original lab's zustand store
 * (src/lib/lab/store.ts + types.ts).
 *
 * - Single state object with a tiny subscribe/notify mechanism.
 * - SAME persistence key, version and save/restore/RESET semantics as the
 *   original: localStorage['cyberlab-irp-cs003-8-1'], JSON { state, version }.
 * - Every action is a pure state mutation followed by save() + notify().
 */

/* ------------------------------------------------------------------ */
/* Initial state (identical to the original, including scramble order) */
/* ------------------------------------------------------------------ */

var SCRAMBLED_PHASES = ['contain', 'prep', 'recover', 'ident', 'lessons', 'eradic'];
var SCRAMBLED_STEPS = ['ps4', 'ps1', 'ps6', 'ps2', 'ps5', 'ps3'];
var SCRAMBLED_EX = ['simulation', 'fullint', 'tabletop', 'parallel', 'walkthrough'];
var SCRAMBLED_QUEUE = ['hinc-b', 'hinc-a', 'hinc-c'];

function makeInitialState() {
  return {
    /* session */
    mode: null,
    startedAt: null,

    /* SEC-01 phases */
    phaseOrder: SCRAMBLED_PHASES.slice(),
    activityPhase: {},
    eventPhase: {},
    charterPick: [],

    /* SEC-02 team */
    roleMatch: {},
    crewMedium: [],
    crewHard: [],

    /* SEC-03 triage */
    incSev: {},
    incEsc: {},
    dutyEsc: {},
    queueOrder: SCRAMBLED_QUEUE.slice(),

    /* SEC-04 plans */
    planMatchM: {},
    planMatchH: {},

    /* SEC-05 comms */
    commsCh: {},
    commsTim: {},
    commsAud: {},
    commsActionH: {},

    /* SEC-06 exercises */
    exMatchM: {},
    exOrder: SCRAMBLED_EX.slice(),
    exStageH: {},

    /* SEC-07 vault */
    retDurM: {},
    holdTarget: '',
    retActionH: {},
    custodyPick: '',

    /* SEC-08 playbooks */
    playPick: [],
    playOrder: SCRAMBLED_STEPS.slice(),

    /* SEC-09 audit */
    auditMark: [],

    /* SEC-10 war room */
    warPick: {},

    /* objective engine */
    obj: {},

    /* quiz */
    quizAnswers: {},
    quizSubmitted: false,
    /** Score recorded at the FIRST submission — retry attempts never overwrite it. */
    quizFiledScore: null,
    /** Answer snapshot of the FIRST (filed) submission — powers the focus-area report.
     *  Audit v2 (R8). */
    quizFiledAnswers: {},
    /** True while a practice attempt is open (colors cleared, answers editable). */
    quizPractice: false,

    /* ui */
    activeSection: 'phases',
    briefingSeen: false,
    completionSeen: false,
  };
}

/* ------------------------------------------------------------------ */
/* Store                                                               */
/* ------------------------------------------------------------------ */

var STORAGE_KEY = 'cyberlab-irp-cs003-8-1';
var STORAGE_VERSION = 1;

/* Audit v3 (R2): once an objective is FILED, the answer fields it owns are
   locked. Mirrors the original's LOCKED_BY table in store.ts — the store
   refuses any mutation to a locked key, so no control (mouse, keyboard or
   future widget) can re-select or edit an already-checked answer. */
var LOCKED_BY = {
  medium: {
    phaseOrder: ['M1'],
    activityPhase: ['M2'],
    roleMatch: ['M3'],
    crewMedium: ['M4'],
    incSev: ['M5'],
    incEsc: ['M5'],
    dutyEsc: ['M11'],
    planMatchM: ['M6'],
    commsCh: ['M7'],
    commsTim: ['M7'],
    commsAud: ['M7'],
    exMatchM: ['M8'],
    exOrder: ['M8'],
    retDurM: ['M9'],
    holdTarget: ['M9'],
    playPick: ['M10'],
    playOrder: ['M10'],
    charterPick: ['M12'],
  },
  hard: {
    phaseOrder: ['H1'],
    eventPhase: ['H1'],
    crewHard: ['H2'],
    incSev: ['H3'],
    incEsc: ['H3'],
    queueOrder: ['H3'],
    exStageH: ['H4'],
    planMatchH: ['H5'],
    commsActionH: ['H6'],
    retActionH: ['H7'],
    custodyPick: ['H7'],
    auditMark: ['H8'],
    warPick: ['H9'],
  },
};

/* True when every objective that owns `key` (in the current mode) is filed. */
function fieldLocked(s, key) {
  var table = s.mode === 'hard' ? LOCKED_BY.hard : LOCKED_BY.medium;
  var owners = table[key];
  if (!owners || owners.length === 0) return false;
  for (var i = 0; i < owners.length; i++) {
    var o = s.obj[owners[i]];
    if (!o || !o.done) return false;
  }
  return true;
}

var LabStore = (function () {
  var state = makeInitialState();
  var listeners = [];

  function save() {
    try {
      var persisted = {};
      /* persist every data field (functions never live on state) — same
         semantics as zustand persist with createJSONStorage(localStorage) */
      for (var k in state) {
        if (Object.prototype.hasOwnProperty.call(state, k)) persisted[k] = state[k];
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: persisted, version: STORAGE_VERSION }));
    } catch (e) {
      /* storage unavailable (private mode / file:// restrictions) — the lab
         still works for the session, it just won't resume. Never crash. */
    }
  }

  function load() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || !parsed.state) return;
      if (typeof parsed.version === 'number' && parsed.version !== STORAGE_VERSION) return;
      var fresh = makeInitialState();
      var incoming = parsed.state;
      var merged = {};
      for (var k in fresh) {
        if (Object.prototype.hasOwnProperty.call(incoming, k) && incoming[k] !== undefined) {
          merged[k] = incoming[k];
        } else {
          merged[k] = fresh[k];
        }
      }
      state = merged;
    } catch (e) {
      /* corrupted storage → pristine state */
      state = makeInitialState();
    }
  }

  function notify(currentState, patch) {
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](currentState, patch); } catch (e) { /* a listener must never break the store */ }
    }
  }

  var store = {
    getState: function () { return state; },

    subscribe: function (fn) {
      listeners.push(fn);
      return function unsubscribe() {
        var i = listeners.indexOf(fn);
        if (i !== -1) listeners.splice(i, 1);
      };
    },

    /** Merge a patch into state, persist, notify. */
    set: function (patch) {
      for (var k in patch) {
        if (Object.prototype.hasOwnProperty.call(patch, k)) state[k] = patch[k];
      }
      save();
      notify(state, patch);
      return state;
    },

    /* ---------------- actions (mirroring the original API) --------------- */

    setMode: function (m) {
      store.set({ mode: m, startedAt: Date.now(), activeSection: 'phases' });
    },
    setActiveSection: function (s) { store.set({ activeSection: s }); },
    setBriefingSeen: function () { store.set({ briefingSeen: true }); },
    setCompletionSeen: function (v) { store.set({ completionSeen: v }); },
    markCompletionSeen: function () { store.set({ completionSeen: true }); },

    resetAll: function () {
      state = makeInitialState();
      save();
      notify(state, state); /* full-pristine patch → subscriber rebuilds the view */
    },

    /* generic list helpers — Audit v3 (R2): mutators refuse changes to
       fields owned by a FILED objective. */
    setPhaseOrder: function (o) { if (!fieldLocked(state, 'phaseOrder')) store.set({ phaseOrder: o }); },
    setExOrder: function (o) { if (!fieldLocked(state, 'exOrder')) store.set({ exOrder: o }); },
    setPlayOrder: function (o) { if (!fieldLocked(state, 'playOrder')) store.set({ playOrder: o }); },
    setQueueOrder: function (o) { if (!fieldLocked(state, 'queueOrder')) store.set({ queueOrder: o }); },

    LIST_KEYS: ['charterPick', 'crewMedium', 'crewHard', 'playPick', 'auditMark'],
    FIELD_KEYS: ['activityPhase', 'eventPhase', 'roleMatch', 'incSev', 'incEsc', 'dutyEsc',
      'planMatchM', 'planMatchH', 'commsCh', 'commsTim', 'commsAud', 'commsActionH',
      'exMatchM', 'exStageH', 'retDurM', 'retActionH'],

    toggleIn: function (key, id) {
      if (fieldLocked(state, key)) return; /* Audit v3 (R2) */
      var arr = state[key] || [];
      var idx = arr.indexOf(id);
      var next = idx === -1 ? arr.concat([id]) : arr.filter(function (x) { return x !== id; });
      var patch = {};
      patch[key] = next;
      store.set(patch);
    },

    setField: function (key, field, value) {
      if (fieldLocked(state, key)) return; /* Audit v3 (R2) */
      /* Object.assign mirrors the original's {...spread, [field]: value}:
         existing keys keep their position, new keys append */
      var patch = {};
      patch[key] = Object.assign({}, state[key], {});
      patch[key][field] = value;
      store.set(patch);
    },

    setHoldTarget: function (v) { if (!fieldLocked(state, 'holdTarget')) store.set({ holdTarget: v }); },
    setCustodyPick: function (v) { if (!fieldLocked(state, 'custodyPick')) store.set({ custodyPick: v }); },
    setWarPick: function (inject, option) {
      if (fieldLocked(state, 'warPick')) return; /* Audit v3 (R2) */
      var patchOpt = {};
      patchOpt[inject] = option;
      store.set({ warPick: Object.assign({}, state.warPick, patchOpt) });
    },

    setQuizAnswer: function (qid, idx) {
      /* locked after filing unless a practice attempt is open — same gate */
      if (state.quizSubmitted && !state.quizPractice) return;
      var patchAns = {};
      patchAns[qid] = idx;
      store.set({ quizAnswers: Object.assign({}, state.quizAnswers, patchAns) });
    },

    /* First submission files the score AND snapshots the graded answers (R8 focus report);
       retry attempts are practice-only and change neither. */
    submitQuiz: function () {
      var patch = { quizSubmitted: true, quizPractice: false };
      if (state.quizFiledScore === null || state.quizFiledScore === undefined) {
        patch.quizFiledScore = LabEngine.computeQuizScore(state);
        patch.quizFiledAnswers = Object.assign({}, state.quizAnswers);
      }
      store.set(patch);
    },

    /* Re-open the annex for practice: grading colors cleared, answers editable. */
    retryQuiz: function () { store.set({ quizPractice: true }); },

    revealHint: function (id) {
      var prev = state.obj[id];
      /* Object.assign mirrors the original's {...(prev ?? defaults), hints: n}:
         a pre-existing `hints` key keeps its position; a new one appends last */
      var base = prev || { done: false, attempts: 0, firstTry: false, lastResult: null };
      var patchObj = {};
      patchObj[id] = Object.assign({}, base, { hints: ((prev && prev.hints) || 0) + 1 });
      store.set({ obj: Object.assign({}, state.obj, patchObj) });
    },

    /**
     * Check the given objective ids against the validators.
     * Returns [{ id, pass, firstTry }] — identical semantics to the original:
     * an already-done objective stays done and is not re-attempt-counted.
     */
    checkObjectives: function (ids) {
      var results = [];
      var nextObjPatch = {};
      for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        var pass = LabEngine.VALIDATORS[id] ? LabEngine.VALIDATORS[id](state) : false;
        var prev = state.obj[id];
        if (prev && prev.done) {
          results.push({ id: id, pass: true, firstTry: prev.firstTry });
          continue;
        }
        var attempts = ((prev && prev.attempts) || 0) + 1;
        var firstTry = pass && attempts === 1;
        nextObjPatch[id] = {
          done: pass,
          attempts: attempts,
          hints: (prev && prev.hints) || 0,
          firstTry: firstTry,
          lastResult: pass ? 'pass' : 'fail',
        };
        results.push({ id: id, pass: pass, firstTry: firstTry });
      }
      store.set({ obj: Object.assign({}, state.obj, nextObjPatch) });
      return results;
    },
  };

  /* restore persisted state at script load (before first render) */
  load();

  return store;
})();
