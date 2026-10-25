// ── State store: plain-JS object + subscribe/notify + localStorage persistence ──
// Mirrors the original zustand store exactly:
//   • same storage key (aurelia-ovc-v1) and same {"state":…,"version":1} envelope
//   • same initial state, same hard-mode scramble preset, same action semantics
//   • same save-on-every-change / resume-on-load / confirmed-reset behavior
(function () {
  'use strict';

  var STORAGE_KEY = 'aurelia-ovc-v1';

  // Hard-mode inherited console: everything on except NTP + CASB (relay level stays DEBUG)
  var HARD_PRESET_SENSORS = {
    syslogRelay: true,
    ntpSync: false, // defect 1
    systemLogs: true,
    appLogs: true,
    securityLogs: true,
    fim: true,
    vulnScanner: true,
    discoveryAgent: true,
    packetCapture: true,
    flowMonitor: true,
    accessReview: true,
    pamVault: true,
    casb: false // defect 2
  };

  function initialState() {
    return {
      mode: null,
      phase: 'mode',
      sensors: {},
      relayLevel: 'DEBUG', // defect 3 (medium: student must consciously tune it)
      answers: {},
      progress: {},
      timeline: [],
      dashboard: [],
      rule: { name: '', source: '', field: '', condition: '', value: '', timeFilter: '', severity: '' },
      retention: 3,
      exports: [],
      classification: {},
      fpTriage: {},
      counter: [],
      quiz: {},
      quizSubmitted: false,
      quizScore: null,
      completionSeen: false,
      announce: ''
    };
  }

  // ── Load persisted state (zustand-persist compatible envelope) ───────────────
  function load() {
    var base = initialState();
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return base;
      var parsed = JSON.parse(raw);
      var saved = parsed && parsed.state ? parsed.state : null;
      if (!saved) return base;
      var merged = Object.assign({}, base, saved);
      // Deep-merge nested records so newly added keys always exist
      merged.sensors = Object.assign({}, saved.sensors || {});
      merged.answers = Object.assign({}, saved.answers || {});
      merged.progress = Object.assign({}, saved.progress || {});
      merged.rule = Object.assign({}, base.rule, saved.rule || {});
      merged.timeline = Array.isArray(saved.timeline) ? saved.timeline : [];
      merged.dashboard = Array.isArray(saved.dashboard) ? saved.dashboard : [];
      merged.exports = Array.isArray(saved.exports) ? saved.exports : [];
      merged.classification = Object.assign({}, saved.classification || {});
      merged.fpTriage = Object.assign({}, saved.fpTriage || {});
      merged.counter = Array.isArray(saved.counter) ? saved.counter : [];
      merged.quiz = Object.assign({}, saved.quiz || {});
      merged.relayLevel = saved.relayLevel || base.relayLevel;
      merged.retention = typeof saved.retention === 'number' ? saved.retention : base.retention;
      return merged;
    } catch (e) {
      // Storage unavailable or corrupted — degrade gracefully to pristine state
      return base;
    }
  }

  var state = load();
  var listeners = [];

  function subscribe(fn) {
    listeners.push(fn);
    return function unsubscribe() {
      listeners = listeners.filter(function (l) { return l !== fn; });
    };
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: state, version: 1 }));
    } catch (e) {
      /* storage full/unavailable — keep running in memory */
    }
  }

  /** Replace state and notify subscribers. opts.silent skips the notify (typing). */
  function setState(patch, opts) {
    state = Object.assign({}, state, patch);
    persist();
    if (!(opts && opts.silent)) {
      listeners.forEach(function (fn) {
        try { fn(); } catch (e) { /* one bad subscriber never breaks the rest */ }
      });
    }
  }

  function getState() { return state; }

  // ── Actions (same semantics as the original store) ──────────────────────────
  var actions = {

    setMode: function (m) {
      setState({
        mode: m,
        phase: 'briefing',
        sensors: m === 'hard' ? Object.assign({}, HARD_PRESET_SENSORS) : {}
      });
    },

    setPhase: function (p) { setState({ phase: p }); },

    toggleSensor: function (id) {
      var sensors = Object.assign({}, state.sensors);
      sensors[id] = !sensors[id];
      setState({ sensors: sensors });
    },

    setRelayLevel: function (l) { setState({ relayLevel: l }); },

    setAnswer: function (obj, field, value) {
      var forObj = Object.assign({}, state.answers[obj] || {});
      forObj[field] = value;
      var answers = Object.assign({}, state.answers);
      answers[obj] = forObj;
      setState({ answers: answers }, { silent: optsSilent(arguments[3]) });
    },

    recordAttempt: function (obj, pass) {
      var prev = state.progress[obj] || { done: false, attempts: 0, firstTry: false, hints: 0 };
      var progress = Object.assign({}, state.progress);
      progress[obj] = {
        done: prev.done || pass,
        attempts: prev.attempts + 1,
        firstTry: prev.firstTry || (pass && prev.attempts === 0),
        hints: prev.hints
      };
      setState({ progress: progress });
    },

    revealHint: function (obj) {
      var prev = state.progress[obj] || { done: false, attempts: 0, firstTry: false, hints: 0 };
      var progress = Object.assign({}, state.progress);
      progress[obj] = Object.assign({}, prev, { hints: Math.min(prev.hints + 1, 3) });
      setState({ progress: progress });
    },

    togglePin: function (id) {
      var timeline = state.timeline.slice();
      var i = timeline.indexOf(id);
      if (i >= 0) timeline.splice(i, 1);
      else timeline.push(id);
      setState({ timeline: timeline });
    },

    movePin: function (id, dir) {
      var arr = state.timeline.slice();
      var i = arr.indexOf(id);
      var j = i + dir;
      if (i < 0 || j < 0 || j >= arr.length) return;
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
      setState({ timeline: arr });
    },

    clearTimeline: function () { setState({ timeline: [] }); },

    toggleWidget: function (id) {
      var dashboard = state.dashboard.slice();
      var i = dashboard.indexOf(id);
      if (i >= 0) dashboard.splice(i, 1);
      else dashboard.push(id);
      setState({ dashboard: dashboard });
    },

    setRule: function (patch, opts) {
      setState({ rule: Object.assign({}, state.rule, patch) }, opts);
    },

    setRetention: function (n, opts) { setState({ retention: n }, opts); },

    addExport: function (id) {
      if (state.exports.indexOf(id) >= 0) return;
      setState({ exports: state.exports.concat([id]) });
    },

    setClassification: function (asset, cls) {
      var classification = Object.assign({}, state.classification);
      classification[asset] = cls;
      setState({ classification: classification });
    },

    setTriage: function (id, val) {
      var fpTriage = Object.assign({}, state.fpTriage);
      fpTriage[id] = val;
      setState({ fpTriage: fpTriage }, { silent: optsSilent(arguments[2]) });
    },

    assignCounter: function (id) {
      if (state.counter.indexOf(id) >= 0 || state.counter.length >= 3) return;
      setState({ counter: state.counter.concat([id]) });
    },

    removeCounter: function (slot) {
      setState({ counter: state.counter.filter(function (_, i) { return i !== slot; }) });
    },

    setQuizPick: function (qid, opt) {
      var quiz = Object.assign({}, state.quiz);
      quiz[qid] = opt;
      setState({ quiz: quiz }, { silent: optsSilent(arguments[2]) });
    },

    submitQuiz: function (score) { setState({ quizSubmitted: true, quizScore: score }); },

    resetQuiz: function () { setState({ quiz: {}, quizSubmitted: false, quizScore: null }); },

    markCompletionSeen: function () { setState({ completionSeen: true }); },

    say: function (msg) { setState({ announce: msg }); },

    /** Confirmed purge: wipe persistence and return the console to pristine. */
    reset: function () {
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
      state = initialState();
      persist();
      listeners.forEach(function (fn) {
        try { fn(); } catch (e) { /* ignore */ }
      });
    }
  };

  // Answer/triage/quiz updates default to silent (no re-render) so typing never
  // loses focus; explicit notify can be forced by passing `true` as last argument.
  function optsSilent(v) { return v !== true; }

  window.LAB_STATE = {
    STORAGE_KEY: STORAGE_KEY,
    HARD_PRESET_SENSORS: HARD_PRESET_SENSORS,
    initialState: initialState,
    get: getState,
    subscribe: subscribe,
    setState: setState,
    actions: actions
  };
})();
