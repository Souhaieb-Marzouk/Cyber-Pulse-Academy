// ── Red-Line Room · state store (state, reducer, persistence, pub/sub) ─
// Ported 1:1 from the original framework lab (src/lib/lab/engine.ts store
// section). Same state shape, same persistence key, same lock semantics.
"use strict";

(function () {
  var D = window.RL_DATA;
  var SIM = window.RL_SIM;

  var STORAGE_KEY = "redline-room-v1"; // identical to the original

  function structuredCloneShallow(v) {
    return JSON.parse(JSON.stringify(v));
  }

  function initialEnv() {
    var zones = {};
    for (var i = 0; i < D.DEVICES.length; i++) zones[D.DEVICES[i].id] = D.DEVICES[i].zone;
    var hardening = {};
    for (var j = 0; j < D.HARDENING.length; j++) hardening[D.HARDENING[j].id] = false;
    var keys = {};
    var nac = {
      guestDot1x: false,
      staffDot1x: true, // staff wired auth already exists (see evidence)
      posture: "none",
      quarantine: false,
      mabPrinters: false,
    };
    var filters = {
      dnsGuest: false,
      blockedGuest: ["streaming"], // legacy mis-tuned policy: blocks streaming, ignores malware
      blockedStaff: [],
      allowlist: [],
      blocklist: [],
      exeBlockGuest: false,
    };
    return { zones: zones, hardening: hardening, nac: nac, keys: keys, acl: structuredCloneShallow(D.ACL_INITIAL), filters: filters };
  }

  function initialRecords() {
    return {
      matchGame: {},
      tagGame: {},
      nacQuiz: null,
      memo: {},
      loghunt: {},
      rollout: [],
      detection: [],
      residualStatement: null,
      residualFamily: null,
    };
  }

  function initialState() {
    return {
      mode: null,
      started: false, // briefing seen
      env: initialEnv(),
      objectives: {},
      records: initialRecords(),
      predictions: {},
      runs: {},
      audit: null,
      quiz: {},
      version: 1,
    };
  }

  // ── Reducer (same action set and semantics as the original) ───────────
  function reducer(state, action) {
    switch (action.type) {
      case "HYDRATE":
        return action.state;
      case "SET_MODE":
        return Object.assign({}, state, { mode: action.mode });
      case "START":
        return Object.assign({}, state, { started: true });
      case "SET_ZONE":
        return setEnv(state, { zones: Object.assign({}, state.env.zones, obj(action.device, action.zone)) });
      case "TOGGLE_HARD":
        return setEnv(state, { hardening: Object.assign({}, state.env.hardening, obj(action.id, action.value)) });
      case "SET_NAC":
        return setEnv(state, { nac: Object.assign({}, state.env.nac, action.patch) });
      case "FIX_KEY":
        return setEnv(state, { keys: Object.assign({}, state.env.keys, obj(action.id, "fixed")) });
      case "ACL_ADD": {
        var rule = { id: "acl-" + Date.now() + "-" + Math.floor(Math.random() * 1e4), action: "permit", proto: "tcp", src: "any", dst: "any", port: "any", log: false };
        return setEnv(state, { acl: state.env.acl.concat([rule]) });
      }
      case "ACL_UPDATE":
        return setEnv(state, {
          acl: state.env.acl.map(function (r) { return r.id === action.id ? Object.assign({}, r, action.patch) : r; }),
        });
      case "ACL_MOVE": {
        var idx = state.env.acl.findIndex(function (r) { return r.id === action.id; });
        var to = idx + action.dir;
        if (idx < 0 || to < 0 || to >= state.env.acl.length) return state;
        var acl = state.env.acl.slice();
        var moved = acl.splice(idx, 1)[0];
        acl.splice(to, 0, moved);
        return setEnv(state, { acl: acl });
      }
      case "ACL_REMOVE":
        return setEnv(state, { acl: state.env.acl.filter(function (r) { return r.id !== action.id; }) });
      case "SET_FILTER":
        return setEnv(state, { filters: Object.assign({}, state.env.filters, action.patch) });
      case "TOGGLE_CAT": {
        var key = action.network === "guest" ? "blockedGuest" : "blockedStaff";
        var cur = state.env.filters[key];
        var next = action.value ? Array.from(new Set(cur.concat([action.cat]))) : cur.filter(function (c) { return c !== action.cat; });
        return setEnv(state, { filters: Object.assign({}, state.env.filters, obj(key, next)) });
      }
      case "TOGGLE_SITE": {
        var list = action.list === "allowlist" ? "allowlist" : "blocklist";
        var cur2 = state.env.filters[list];
        var next2 = action.value ? Array.from(new Set(cur2.concat([action.site]))) : cur2.filter(function (s) { return s !== action.site; });
        return setEnv(state, { filters: Object.assign({}, state.env.filters, obj(list, next2)) });
      }
      case "RECORD_MATCH":
        return setRecords(state, { matchGame: Object.assign({}, state.records.matchGame, obj(action.control, action.purpose)) });
      case "RECORD_TAG":
        return setRecords(state, { tagGame: Object.assign({}, state.records.tagGame, obj(action.snippet, action.family)) });
      case "RECORD_NACQUIZ":
        // R2 answer lock: once answered, this question can never be re-answered
        if (state.records.nacQuiz !== null) return state;
        return setRecords(state, { nacQuiz: action.answer });
      case "RECORD_MEMO":
        return setRecords(state, { memo: Object.assign({}, state.records.memo, obj(action.item, action.call)) });
      case "RECORD_LOGHUNT":
        return setRecords(state, { loghunt: Object.assign({}, state.records.loghunt, obj(action.entry, action.family)) });
      case "RECORD_ROLLOUT":
        return setRecords(state, { rollout: action.order });
      case "RECORD_DETECTION":
        return setRecords(state, { detection: action.enabled });
      case "RECORD_RESIDUAL":
        return setRecords(state, { residualStatement: action.statement, residualFamily: action.family });
      case "CHECK_OBJ": {
        var prev = state.objectives[action.id];
        var done = action.feedback.ok;
        return Object.assign({}, state, {
          objectives: Object.assign({}, state.objectives, obj(action.id, {
            done: (prev && prev.done) || done,
            attempts: ((prev && prev.attempts) || 0) + (done && prev && prev.done ? 0 : 1),
            hints: prev ? prev.hints : 0,
            firstTry: prev ? prev.firstTry : done, // if first-ever check passes → firstTry
            lastFeedback: action.feedback,
          })),
        });
      }
      case "USE_HINT": {
        var p = state.objectives[action.id];
        if (!p) return state;
        return Object.assign({}, state, {
          objectives: Object.assign({}, state.objectives, obj(action.id, Object.assign({}, p, { hints: Math.min((p.hints || 0) + 1, 3) }))),
        });
      }
      case "PREDICT": {
        if (state.runs[action.sample]) return state; // predictions only before a run
        return Object.assign({}, state, { predictions: Object.assign({}, state.predictions, obj(action.sample, action.value)) });
      }
      case "RUN_SAMPLE": {
        var sample = D.TRAFFIC_SAMPLES.find(function (s) { return s.id === action.sample; });
        if (!sample) return state;
        var result = SIM.simulate(state.env, sample);
        return Object.assign({}, state, { runs: Object.assign({}, state.runs, obj(sample.id, Object.assign({ at: Date.now() }, result))) });
      }
      case "RUN_AUDIT": {
        var results = {};
        for (var i = 0; i < D.TRAFFIC_SAMPLES.length; i++) {
          var s = D.TRAFFIC_SAMPLES[i];
          results[s.id] = SIM.simulate(state.env, s).final;
        }
        return Object.assign({}, state, { audit: { at: Date.now(), results: results } });
      }
      case "QUIZ_ANSWER":
        // R2 answer lock: a checked answer is final — the reducer refuses overwrites
        if (state.quiz[action.qid] !== undefined) return state;
        return Object.assign({}, state, { quiz: Object.assign({}, state.quiz, obj(action.qid, action.index)) });
      case "RESET":
        return initialState();
      default:
        return state;
    }
  }

  function obj(k, v) { var o = {}; o[k] = v; return o; }
  function setEnv(state, patch) { return Object.assign({}, state, { env: Object.assign({}, state.env, patch) }); }
  function setRecords(state, patch) { return Object.assign({}, state, { records: Object.assign({}, state.records, patch) }); }

  // ── Persistence (identical key + semantics to the original) ───────────
  function loadState() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== 1 || !parsed.env) return null;
      return parsed;
    } catch (e) {
      return null;
    }
  }

  function saveState(state) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // storage unavailable — degrade gracefully (in-memory only)
    }
  }

  function clearState() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (e) { /* ignore */ }
  }

  // ── Progress helpers ───────────────────────────────────────────────────
  function progressOf(state, ids) {
    var done = ids.filter(function (id) { return state.objectives[id] && state.objectives[id].done; }).length;
    return { done: done, total: ids.length, pct: ids.length ? Math.round((done / ids.length) * 100) : 0 };
  }

  function starsFor(state, ids) {
    var done = ids.filter(function (id) { return state.objectives[id] && state.objectives[id].done; });
    if (done.length < ids.length) return 0;
    var firstTry = done.filter(function (id) { return state.objectives[id].firstTry; }).length / done.length;
    var hints = done.reduce(function (acc, id) { return acc + (state.objectives[id].hints || 0); }, 0);
    if (firstTry >= 0.9 && hints <= 2) return 5;
    if (firstTry >= 0.75 && hints <= 5) return 4;
    if (firstTry >= 0.5) return 3;
    return 2;
  }

  // ── Tiny store with subscribe/notify (re-render only what changes) ────
  var listeners = [];

  var store = {
    state: initialState(),
    dispatch: function (action) {
      var next = reducer(store.state, action);
      if (next !== store.state) {
        store.state = next;
        saveState(store.state);
        listeners.forEach(function (l) { l(); });
      }
    },
    subscribe: function (fn) {
      listeners.push(fn);
      return function () {
        var i = listeners.indexOf(fn);
        if (i > -1) listeners.splice(i, 1);
      };
    },
    hydrate: function () {
      var saved = loadState();
      if (saved) {
        store.state = saved;
        listeners.forEach(function (l) { l(); });
      }
    },
    reset: function () {
      clearState();
      store.state = initialState();
      listeners.forEach(function (l) { l(); });
    },
  };

  window.RL_STORE = store;
  window.RL_STATE_HELPERS = {
    STORAGE_KEY: STORAGE_KEY,
    initialState: initialState,
    progressOf: progressOf,
    starsFor: starsFor,
  };
})();
