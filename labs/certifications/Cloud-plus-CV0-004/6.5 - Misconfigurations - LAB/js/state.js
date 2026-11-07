// ─── Ledgerline · runtime state, reducer, persistence ───────────────────────
// Static port of src/lib/lab/state.tsx. React useReducer is replaced by a
// plain-JS store with subscribe/notify; the action names, state shape,
// persistence key, save/restore/RESET semantics and scoring math are identical.
'use strict';

const STORAGE_KEY = 'cv0004-l65-ledgerline-v1';

function freshConfigs() {
  return JSON.parse(JSON.stringify(INITIAL_CONFIGS));
}

function freshState() {
  return {
    mode: null,
    stage: 'mode',
    configs: freshConfigs(),
    answers: {},
    actions: [],
    objectives: {},
    quiz: { answers: {}, checked: {} },
    scanCount: 0,
    dirty: false, // configs changed since last scan
    selectedResource: null,
    dossierTab: 'config',
    deskTab: 'findings',
    doctrineOpen: false,
    completedShown: false,
    breachLogOpen: false,
    pane: 'desk',
  };
}

function markDirty(state) {
  return Object.assign({}, state, { dirty: true });
}

function labReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return action.state;
    case 'SET_MODE': {
      var fresh = freshState();
      return Object.assign(fresh, { mode: action.mode, stage: 'briefing' });
    }
    case 'GOTO':
      return Object.assign({}, state, { stage: action.stage });
    case 'PATCH_BUCKET':
      return markDirty(Object.assign({}, state, {
        configs: Object.assign({}, state.configs, {
          buckets: Object.assign({}, state.configs.buckets, (function () {
            var o = {}; o[action.id] = Object.assign({}, state.configs.buckets[action.id], action.patch); return o;
          })()),
        }),
      }));
    case 'PATCH_IDENTITY':
      return markDirty(Object.assign({}, state, {
        configs: Object.assign({}, state.configs, {
          identities: Object.assign({}, state.configs.identities, (function () {
            var o = {}; o[action.id] = Object.assign({}, state.configs.identities[action.id], action.patch); return o;
          })()),
        }),
      }));
    case 'PATCH_INSTANCE':
      return markDirty(Object.assign({}, state, {
        configs: Object.assign({}, state.configs, {
          instances: Object.assign({}, state.configs.instances, (function () {
            var o = {}; o[action.id] = Object.assign({}, state.configs.instances[action.id], action.patch); return o;
          })()),
        }),
      }));
    case 'PATCH_DB':
      return markDirty(Object.assign({}, state, {
        configs: Object.assign({}, state.configs, {
          db: Object.assign({}, state.configs.db, (function () {
            var o = {}; o[action.id] = Object.assign({}, state.configs.db[action.id], action.patch); return o;
          })()),
        }),
      }));
    case 'PATCH_ACCOUNT':
      return markDirty(Object.assign({}, state, {
        configs: Object.assign({}, state.configs, {
          account: Object.assign({}, state.configs.account, (function () {
            var o = {}; o[action.id] = Object.assign({}, state.configs.account[action.id], action.patch); return o;
          })()),
        }),
      }));
    case 'PATCH_SG_RULE':
      return markDirty(Object.assign({}, state, {
        configs: Object.assign({}, state.configs, {
          sgs: Object.assign({}, state.configs.sgs, (function () {
            var sg = state.configs.sgs[action.sgId];
            var o = {}; o[action.sgId] = Object.assign({}, sg, {
              rules: sg.rules.map(function (r) { return r.id === action.ruleId ? Object.assign({}, r, { source: action.source }) : r; }),
            });
            return o;
          })()),
        }),
      }));
    case 'MARK_STATEMENT': {
      var b = state.configs.buckets[action.bucketId];
      var marked = b.markedStatements.includes(action.stmtId)
        ? b.markedStatements.filter(function (m) { return m !== action.stmtId; })
        : b.markedStatements.concat([action.stmtId]);
      return Object.assign({}, state, {
        configs: Object.assign({}, state.configs, {
          buckets: Object.assign({}, state.configs.buckets, (function () {
            var o = {}; o[action.bucketId] = Object.assign({}, b, { markedStatements: marked }); return o;
          })()),
        }),
      });
    }
    case 'LOG_ACTION':
      return state.actions.includes(action.actionId)
        ? state
        : Object.assign({}, state, { actions: state.actions.concat([action.actionId]) });
    case 'SET_ANSWER': {
      var objAnswers = state.answers[action.obj] || {};
      return Object.assign({}, state, {
        answers: Object.assign({}, state.answers, (function () {
          var o = {};
          o[action.obj] = Object.assign({}, objAnswers, (function () {
            var f = {}; f[action.field] = action.value; return f;
          })());
          return o;
        })()),
      });
    }
    case 'CHECK': {
      var prev = state.objectives[action.obj] || { status: 'todo', attempts: 0, hintsUsed: 0 };
      return Object.assign({}, state, {
        objectives: Object.assign({}, state.objectives, (function () {
          var o = {};
          o[action.obj] = {
            status: prev.status === 'passed' ? 'passed' : (action.pass ? 'passed' : 'todo'),
            attempts: prev.status === 'passed' ? prev.attempts : prev.attempts + 1,
            hintsUsed: prev.hintsUsed,
            lastDetail: action.detail,
          };
          return o;
        })()),
      });
    }
    case 'HINT': {
      var prevH = state.objectives[action.obj] || { status: 'todo', attempts: 0, hintsUsed: 0 };
      return Object.assign({}, state, {
        objectives: Object.assign({}, state.objectives, (function () {
          var o = {};
          o[action.obj] = Object.assign({}, prevH, { hintsUsed: Math.min(prevH.hintsUsed + 1, 3) });
          return o;
        })()),
      });
    }
    case 'SCAN':
      return Object.assign({}, state, { scanCount: state.scanCount + 1, dirty: false });
    case 'SELECT':
      return Object.assign({}, state, { selectedResource: action.resource });
    case 'SET_PANE':
      return Object.assign({}, state, { pane: action.pane });
    case 'DOSSIER_TAB':
      return Object.assign({}, state, { dossierTab: action.tab });
    case 'DESK_TAB':
      return Object.assign({}, state, { deskTab: action.tab });
    case 'DOCTRINE':
      return Object.assign({}, state, { doctrineOpen: action.open });
    case 'BREACH_LOG':
      return Object.assign({}, state, { breachLogOpen: action.open });
    case 'QUIZ_ANSWER':
      return Object.assign({}, state, {
        quiz: Object.assign({}, state.quiz, {
          answers: Object.assign({}, state.quiz.answers, (function () {
            var o = {}; o[action.qid] = action.choice; return o;
          })()),
        }),
      });
    case 'QUIZ_CHECK':
      return Object.assign({}, state, {
        quiz: Object.assign({}, state.quiz, {
          checked: Object.assign({}, state.quiz.checked, (function () {
            var o = {}; o[action.qid] = true; return o;
          })()),
        }),
      });
    case 'SHOW_COMPLETION':
      return Object.assign({}, state, { completedShown: action.shown });
    case 'RESET':
      return freshState();
    default:
      return state;
  }
}

// ── Stars & score (identical math) ──────────────────────────────────────────
function computeStars(mode, objectives, progress) {
  if (!mode) return 0;
  var stars = 5;
  objectives.forEach(function (o) {
    var p = progress[o.id];
    if (!p || p.status !== 'passed') return;
    if (p.attempts > 1) stars -= 0.25;
    stars -= p.hintsUsed * (mode === 'hard' ? 0.4 : 0.15);
  });
  return Math.max(1, Math.round(stars * 2) / 2);
}

function quizCorrectCount(quiz, questions) {
  return questions.filter(function (q) { return quiz.checked[q.id] && quiz.answers[q.id] === q.correct; }).length;
}

function computeScore(objectives, progress, quiz, questions) {
  var passed = objectives.filter(function (o) { return progress[o.id] && progress[o.id].status === 'passed'; }).length;
  var objPct = passed / Math.max(1, objectives.length);
  var quizPct = questions.length > 0 ? quizCorrectCount(quiz, questions) / questions.length : 0;
  return Math.round((objPct * 0.75 + quizPct * 0.25) * 100);
}

// ── Persistence wrapper ─────────────────────────────────────────────────────
function loadState() {
  try {
    var raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return null;
    var parsed = JSON.parse(raw);
    // minimal shape guard
    if (!parsed || typeof parsed !== 'object' || !('configs' in parsed) || !('stage' in parsed)) return null;
    return Object.assign(freshState(), parsed);
  } catch (e) {
    return null;
  }
}

function saveState(state) {
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // storage unavailable — degrade gracefully (in-memory only)
  }
}

function clearState() {
  try {
    if (typeof window !== 'undefined') window.localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // ignore
  }
}

// ── Store: subscribe/notify (replacement for React context) ────────────────
const LabStore = {
  state: freshState(),
  listeners: [],
  dispatch: function (action) {
    var next = labReducer(this.state, action);
    if (next !== this.state) {
      this.state = next;
      this.listeners.forEach(function (fn) { fn(LabStore.state); });
    }
  },
  subscribe: function (fn) {
    this.listeners.push(fn);
    return function unsubscribe() {
      var i = LabStore.listeners.indexOf(fn);
      if (i > -1) LabStore.listeners.splice(i, 1);
    };
  },
  // hydrate once at boot, then persist with the same 250ms debounce
  boot: function () {
    var self = this;
    var loaded = loadState();
    if (loaded) {
      this.state = loaded;
    }
    var timer = null;
    this.subscribe(function (state) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () { saveState(state); }, 250);
    });
  },
};
