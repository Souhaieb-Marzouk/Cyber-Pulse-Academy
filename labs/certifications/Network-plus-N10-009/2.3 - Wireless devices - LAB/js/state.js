// ── Lab state: store + persistence + pub/sub (parity with the original) ─────
// js/state.js — a single plain-JS state object with a tiny subscribe/notify
// mechanism. Same persistence key, same save/restore/RESET semantics as the
// original lab (localStorage; resume exactly; confirmed reset to pristine).
"use strict";

var D = window.LabData;
var LAB_OBJECTIVES = window.LabObjectives;

var STATE_VERSION = 1;

function deepCloneAp(a) {
  var radios = {};
  Object.keys(a.radios).forEach(function (k) { radios[k] = { channel: a.radios[k].channel, widthMhz: a.radios[k].widthMhz }; });
  return {
    id: a.id, label: a.label, kind: a.kind, slotId: a.slotId,
    bands: a.bands.slice(), radios: radios, powerMw: a.powerMw, antenna: a.antenna,
  };
}

function initialEnv() {
  return {
    aps: D.INITIAL_APS.map(deepCloneAp),
    ssids: D.INITIAL_SSIDS.map(function (s) { return Object.assign({}, s); }),
    wpsEnabled: true,
    tags: {},
    guestTest: "idle",
    guestTestDetails: [],
    actionLog: [], // first-enable order of guest controls (epoch-scoped)
  };
}

function pristine() {
  return {
    version: STATE_VERSION,
    hydrated: false,
    started: false,
    mode: null,
    sheet: 0,
    benchTab: "plan",
    env: initialEnv(),
    answers: {},
    objectives: {},
    quiz: {},
    quizSubmitted: false,
    completionSeen: false,
  };
}

// Guest control → action-log field mapping (first-enable order recording)
var GUEST_LOG_FIELDS = { isolation: "isolation", portal: "portal", vlan: "vlan", rateLimitMbps: "rateLimit" };

function logGuestControl(log, field, active) {
  if (!active) return log;
  if (log.some(function (r) { return r.field === field; })) return log;
  return log.concat([{ field: field, seq: log.length }]);
}

function cloneShallowEnvSsids(env) {
  return env.ssids.map(function (s) { return Object.assign({}, s); });
}

// The reducer: every lab action with EXACTLY the original semantics.
function reduce(state, action) {
  switch (action.type) {
    case "START":
      return Object.assign({}, state, { started: true, mode: action.mode, sheet: 0, completionSeen: false });
    case "GOTO":
      return Object.assign({}, state, { sheet: action.sheet });
    case "GOTO_WIDGET":
      return Object.assign({}, state, { sheet: action.sheet, benchTab: action.tab });
    case "PATCH_AP":
      return Object.assign({}, state, {
        env: Object.assign({}, state.env, {
          aps: state.env.aps.map(function (a) { return a.id === action.id ? Object.assign({}, a, action.patch) : a; }),
        }),
      });
    case "PATCH_RADIO":
      return Object.assign({}, state, {
        env: Object.assign({}, state.env, {
          aps: state.env.aps.map(function (a) {
            if (a.id === action.id && a.radios[action.band]) {
              var radios = Object.assign({}, a.radios);
              radios[action.band] = Object.assign({}, radios[action.band], action.patch);
              return Object.assign({}, a, { radios: radios });
            }
            return a;
          }),
        }),
      });
    case "PATCH_SSID": {
      var isGuest = action.id === "guest";
      var log = state.env.actionLog;
      if (isGuest) {
        Object.keys(GUEST_LOG_FIELDS).forEach(function (key) {
          if (key in action.patch) {
            var v = action.patch[key];
            var active =
              typeof v === "boolean" ? v === true
                : key === "vlan" ? String(v).trim() === "60"
                  : Number(v) > 0;
            log = logGuestControl(log, GUEST_LOG_FIELDS[key], active);
          }
        });
      }
      return Object.assign({}, state, {
        env: Object.assign({}, state.env, {
          actionLog: log,
          ssids: state.env.ssids.map(function (s) { return s.id === action.id ? Object.assign({}, s, action.patch) : s; }),
        }),
      });
    }
    case "SET_WPS":
      return Object.assign({}, state, { env: Object.assign({}, state.env, { wpsEnabled: action.enabled }) });
    case "TAG_BEACON": {
      var tags = Object.assign({}, state.env.tags);
      tags[action.id] = action.tag;
      return Object.assign({}, state, { env: Object.assign({}, state.env, { tags: tags }) });
    }
    case "SET_ANSWER": {
      var forObj = Object.assign({}, state.answers[action.obj]);
      forObj[action.field] = action.value;
      var answers = Object.assign({}, state.answers);
      answers[action.obj] = forObj;
      return Object.assign({}, state, { answers: answers });
    }
    case "TOGGLE_ANSWER_VALUE": {
      // Always derives from the LATEST state, so several checkboxes changed in
      // the same tick can never overwrite each other.
      var current = ((state.answers[action.obj] && state.answers[action.obj][action.field]) || "")
        .split("|").filter(Boolean);
      var next;
      if (action.on) {
        next = current.concat([action.value]).filter(function (v, i, arr) { return arr.indexOf(v) === i; });
      } else {
        next = current.filter(function (v) { return v !== action.value; });
      }
      var obj2 = Object.assign({}, state.answers[action.obj]);
      obj2[action.field] = next.join("|");
      var answers2 = Object.assign({}, state.answers);
      answers2[action.obj] = obj2;
      return Object.assign({}, state, { answers: answers2 });
    }
    case "CHECK": {
      var prev = state.objectives[action.obj] || { passed: false, attempts: 0, hintsUsed: 0 };
      var objectives = Object.assign({}, state.objectives);
      objectives[action.obj] = { passed: prev.passed || action.result.pass, attempts: prev.attempts + 1, hintsUsed: prev.hintsUsed };
      return Object.assign({}, state, { objectives: objectives });
    }
    case "HINT": {
      var prevH = state.objectives[action.obj] || { passed: false, attempts: 0, hintsUsed: 0 };
      var objectivesH = Object.assign({}, state.objectives);
      objectivesH[action.obj] = Object.assign({}, prevH, { hintsUsed: Math.min(prevH.hintsUsed + 1, 3) });
      return Object.assign({}, state, { objectives: objectivesH });
    }
    case "RUN_GUEST_TEST": {
      var checks = D.runGuestChecks(state.env.ssids);
      var ok = checks.length > 0 && checks.every(function (c) { return c.ok; });
      return Object.assign({}, state, {
        env: Object.assign({}, state.env, { guestTest: ok ? "pass" : "fail", guestTestDetails: checks }),
      });
    }
    case "FACTORY_GUEST":
      return Object.assign({}, state, {
        env: Object.assign({}, state.env, {
          actionLog: [],
          guestTest: "idle",
          guestTestDetails: [],
          ssids: state.env.ssids.map(function (s) {
            return s.id === "guest"
              ? { id: s.id, name: "linksys", hidden: true, security: "wep", authType: "psk", radiusHost: "", radiusPort: "", isolation: false, portal: false, vlan: "", rateLimitMbps: 0 }
              : s;
          }),
        }),
      });
    case "SUBMIT_QUIZ":
      return Object.assign({}, state, { quiz: action.answers, quizSubmitted: true });
    case "SEEN_COMPLETION":
      return Object.assign({}, state, { completionSeen: true });
    case "RESET":
      return Object.assign(pristine(), { hydrated: state.hydrated });
    default:
      return state;
  }
}

function loadState() {
  try {
    var raw = window.localStorage.getItem(D.STORAGE_KEY);
    if (!raw) return pristine();
    var parsed = JSON.parse(raw);
    if (parsed.version !== STATE_VERSION) return pristine();
    var base = pristine();
    var merged = Object.assign(base, parsed);
    merged.env = Object.assign({}, base.env, parsed.env || {});
    merged.env.aps = (parsed.env && parsed.env.aps) ? parsed.env.aps : base.env.aps;
    merged.env.ssids = (parsed.env && parsed.env.ssids) ? parsed.env.ssids : base.env.ssids;
    merged.benchTab = parsed.benchTab != null ? parsed.benchTab : "plan";
    merged.objectives = parsed.objectives || {};
    merged.answers = parsed.answers || {};
    merged.quiz = parsed.quiz || {};
    return merged;
  } catch (e) {
    return pristine();
  }
}

function persist(state) {
  try {
    window.localStorage.setItem(D.STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // storage unavailable — lab still runs, just without resume
  }
}

// ── Tiny store with subscribe/notify ─────────────────────────────────────────
var LabStore = {
  state: pristine(),
  _listeners: [],

  hydrate: function () {
    this.state = loadState();
    this.state.hydrated = true;
    this._notify();
    this._persist();
  },

  dispatch: function (action) {
    this.state = reduce(this.state, action);
    this._notify();
    this._persist();
  },

  // Run a validator against the CURRENT state and record the attempt.
  checkObjective: function (objId) {
    var obj = LAB_OBJECTIVES.findObjective(objId);
    if (!obj) return { pass: false, okMsg: "", failMsg: "Unknown objective." };
    var result = obj.validate(this.state.env, this.state.answers);
    this.dispatch({ type: "CHECK", obj: objId, result: result });
    return result;
  },

  start: function (mode) { this.dispatch({ type: "START", mode: mode }); },

  subscribe: function (fn) { this._listeners.push(fn); },
  _notify: function () {
    this._listeners.forEach(function (fn) { fn(); });
  },
  _persist: function () {
    if (this.state.hydrated) persist(this.state);
  },

  // ── Selectors (same formulas as the original context provider) ────────────
  objectives: function () {
    return LAB_OBJECTIVES.objectivesFor(this.state.mode || "medium");
  },
  progress: function () {
    var objs = this.objectives();
    var passed = objs.filter(function (o) { return LabStore.state.objectives[o.id] && LabStore.state.objectives[o.id].passed; }).length;
    return { passed: passed, total: objs.length, allPassed: objs.length > 0 && passed === objs.length };
  },
  quizList: function () {
    return this.state.mode === "hard" ? D.QUIZ_HARD : D.QUIZ_MEDIUM;
  },
  quizStats: function () {
    var list = this.quizList();
    var quiz = this.state.quiz;
    var correct = list.filter(function (q) { return quiz[q.id] === q.answer; }).length;
    return { correct: correct, total: list.length, ratio: list.length ? correct / list.length : 0 };
  },
  stars: function () {
    var objs = this.objectives();
    if (!objs.length) return 0;
    var s = this.state;
    var firstAttempt = objs.filter(function (o) {
      var p = s.objectives[o.id];
      return p && p.passed && p.attempts === 1;
    }).length / objs.length;
    var hints = objs.reduce(function (acc, o) { return acc + ((s.objectives[o.id] && s.objectives[o.id].hintsUsed) || 0); }, 0);
    var base = firstAttempt >= 0.9 ? 3 : firstAttempt >= 0.6 ? 2 : firstAttempt > 0 ? 1 : 0;
    var hintBonus = hints <= 2 ? 1 : 0;
    var quizBonus = s.quizSubmitted && this.quizStats().ratio >= 0.8 ? 1 : 0;
    return Math.min(5, Math.max(1, base + hintBonus + quizBonus));
  },
};

window.LabStore = LabStore;
