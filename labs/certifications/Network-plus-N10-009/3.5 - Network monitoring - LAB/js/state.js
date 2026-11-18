// SIGNALPATH lab — state store, initial state, persistence
// Static port of src/lib/lab/state.ts + the persistence side of LabProvider.tsx.
// Same storage key, same version check, same reducer semantics, same 250 ms
// debounced save — so saved progress behaves identically to the original.
window.SP_STATE = (function () {
  "use strict";

  var STORAGE_KEY = "signalpath-meridian-n10-009-l32-v1";
  var STATE_VERSION = 1;

  var SNMP_DEFAULTS = {
    PRN: { version: "v2c", community: "public" },
  };

  function initialState() {
    return {
      version: STATE_VERSION,
      mode: null,
      gateSeen: false,
      phase: "baseline",
      baselineRecorded: false,
      // instruments
      snmpDevices: [],
      snmpVersion: null,
      snmpAuthPriv: false,
      deviceSnmp: {
        PRN: { version: "v2c", community: "public", acl: false },
      },
      flowDevices: [],
      flowVersion: null,
      flowCollector: null,
      spanSwitch: null,
      spanSource: null,
      syslogDevices: [],
      syslogTransport: null,
      syslogMinSeverity: null,
      apiEnabled: false,
      apiReadOnly: false,
      apiTokenRotated: false,
      // evidence interaction
      activeView: null,
      apiQueries: [],
      selectedLogIds: [],
      logOrder: [], // hard: ordered selection
      alertsClassified: {},
      // responses
      responseActions: [], // clicked in order
      containment: {
        portDisabled: false,
        c2Blocked: false,
        evidencePreserved: false,
        credsRotated: false,
        reimageScheduled: false,
      },
      verifiedStop: false,
      // exercises
      toolMatch: {},
      snmpQuiz: { trapPort: "", oid: "", trigger: "" },
      baselineAnswers: { util: "", backup: "", pair: "" },
      apiAnswers: { cpu: "", wan: "" },
      flowAnswers: { host: "", c2: "", volume: "", port: "" },
      packetAnswers: { interval: "", pattern: "" },
      detectionTuning: { threshold: "", scope: "" },
      solutionsMatch: {},
      acquisitionQ: null, // TAP vs SPAN decision
      baselineDiscrim: {}, // H2 six-scenario drill
      hardening: {
        printerSnmp: false,
        branchSyslog: false,
        apiToken: false,
        mon1Snmp: false,
      },
      // tracker
      objectives: {},
      // R2 answer lock: after an objective's CHECK runs, its embedded answer inputs
      // lock until the student explicitly presses REVISE (which clears the check).
      lockedAnswers: {},
      quizAnswers: {},
      quizSubmitted: false,
      alertsSubmitted: false,
      completionSeen: false,
      locateTarget: null,
    };
  }

  function cloneShallow(s) {
    // One-level copy helper: the reducer always replaces nested objects wholesale,
    // so a shallow spread per mutated branch (as in the original) is enough.
    return s;
  }

  function reducer(state, action) {
    switch (action.type) {
      case "SET_MODE":
        return Object.assign({}, state, { mode: action.mode, gateSeen: true });
      case "SET_PHASE":
        return Object.assign({}, state, { phase: action.phase });
      case "RECORD_BASELINE":
        return Object.assign({}, state, { baselineRecorded: true });
      case "TOGGLE_SNMP_DEVICE": {
        var has = state.snmpDevices.indexOf(action.device) !== -1;
        var next = has
          ? state.snmpDevices.filter(function (d) { return d !== action.device; })
          : state.snmpDevices.concat([action.device]);
        // PRN is legacy — it cannot join v3 polling; handled separately via deviceSnmp
        return Object.assign({}, state, { snmpDevices: next.filter(function (d) { return d !== "PRN"; }) });
      }
      case "SET_SNMP_VERSION":
        return Object.assign({}, state, { snmpVersion: action.version });
      case "SET_SNMP_AUTHPRIV":
        return Object.assign({}, state, { snmpAuthPriv: action.on });
      case "SET_PRN_SNMP":
        return Object.assign({}, state, {
          deviceSnmp: Object.assign({}, state.deviceSnmp, {
            PRN: { version: "v2c", community: action.community, acl: action.acl },
          }),
        });
      case "TOGGLE_FLOW_DEVICE": {
        var had = state.flowDevices.indexOf(action.device) !== -1;
        return Object.assign({}, state, {
          flowDevices: had
            ? state.flowDevices.filter(function (d) { return d !== action.device; })
            : state.flowDevices.concat([action.device]),
        });
      }
      case "SET_FLOW_VERSION":
        return Object.assign({}, state, { flowVersion: action.version });
      case "SET_FLOW_COLLECTOR":
        return Object.assign({}, state, { flowCollector: action.ip });
      case "SET_SPAN":
        return Object.assign({}, state, { spanSwitch: action.sw, spanSource: action.source });
      case "SET_ACQUISITION":
        return Object.assign({}, state, { acquisitionQ: action.value });
      case "TOGGLE_SYSLOG_DEVICE": {
        var hadL = state.syslogDevices.indexOf(action.device) !== -1;
        return Object.assign({}, state, {
          syslogDevices: hadL
            ? state.syslogDevices.filter(function (d) { return d !== action.device; })
            : state.syslogDevices.concat([action.device]),
        });
      }
      case "SET_SYSLOG_TRANSPORT":
        return Object.assign({}, state, { syslogTransport: action.t });
      case "SET_SYSLOG_SEVERITY":
        return Object.assign({}, state, { syslogMinSeverity: action.sev });
      case "SET_API_ENABLED":
        return Object.assign({}, state, { apiEnabled: action.on });
      case "SET_VIEW": {
        var seenStop =
          action.view === "flow" &&
          state.phase === "incident" &&
          state.containment.portDisabled &&
          state.containment.c2Blocked;
        return Object.assign({}, state, {
          activeView: action.view,
          verifiedStop: state.verifiedStop || !!seenStop,
        });
      }
      case "LOG_API_QUERY":
        if (state.apiQueries.indexOf(action.path) !== -1) return state;
        return Object.assign({}, state, { apiQueries: state.apiQueries.concat([action.path]) });
      case "TOGGLE_LOG_SELECT": {
        var hasSel = state.selectedLogIds.indexOf(action.id) !== -1;
        return Object.assign({}, state, {
          selectedLogIds: hasSel
            ? state.selectedLogIds.filter(function (i) { return i !== action.id; })
            : state.selectedLogIds.concat([action.id]),
        });
      }
      case "ADD_LOG_CHAIN":
        if (state.logOrder.indexOf(action.id) !== -1) return state;
        return Object.assign({}, state, { logOrder: state.logOrder.concat([action.id]) });
      case "CLEAR_LOG_CHAIN":
        return Object.assign({}, state, { logOrder: [] });
      case "CLASSIFY_ALERT": {
        var nextCls = Object.assign({}, state.alertsClassified);
        nextCls[action.id] = action.verdict;
        return Object.assign({}, state, { alertsClassified: nextCls });
      }
      case "APPLY_RESPONSE": {
        if (state.responseActions.indexOf(action.id) !== -1) return state;
        var containment = Object.assign({}, state.containment);
        if (action.id === "port") containment.portDisabled = true;
        if (action.id === "block") containment.c2Blocked = true;
        if (action.id === "evidence") containment.evidencePreserved = true;
        if (action.id === "creds") containment.credsRotated = true;
        if (action.id === "reimage") containment.reimageScheduled = true;
        return Object.assign({}, state, {
          responseActions: state.responseActions.concat([action.id]),
          containment: containment,
        });
      }
      case "UNDO_RESPONSE": {
        var last = state.responseActions[state.responseActions.length - 1];
        if (!last) return state;
        var cont = Object.assign({}, state.containment);
        if (last === "port") cont.portDisabled = false;
        if (last === "block") cont.c2Blocked = false;
        if (last === "evidence") cont.evidencePreserved = false;
        if (last === "creds") cont.credsRotated = false;
        if (last === "reimage") cont.reimageScheduled = false;
        return Object.assign({}, state, {
          responseActions: state.responseActions.slice(0, -1),
          containment: cont,
          verifiedStop: false,
        });
      }
      case "SET_TOOL_MATCH": {
        var tm = Object.assign({}, state.toolMatch);
        tm[action.tool] = action.role;
        return Object.assign({}, state, { toolMatch: tm });
      }
      case "SET_SOLUTION": {
        var sm = Object.assign({}, state.solutionsMatch);
        sm[action.id] = action.value;
        return Object.assign({}, state, { solutionsMatch: sm });
      }
      case "SET_SNMP_QUIZ": {
        var q = Object.assign({}, state.snmpQuiz);
        q[action.field] = action.value;
        return Object.assign({}, state, { snmpQuiz: q });
      }
      case "SET_BASELINE_ANSWER": {
        var ba = Object.assign({}, state.baselineAnswers);
        ba[action.field] = action.value;
        return Object.assign({}, state, { baselineAnswers: ba });
      }
      case "SET_API_ANSWER": {
        var aa = Object.assign({}, state.apiAnswers);
        aa[action.field] = action.value;
        return Object.assign({}, state, { apiAnswers: aa });
      }
      case "SET_FLOW_ANSWER": {
        var fa = Object.assign({}, state.flowAnswers);
        fa[action.field] = action.value;
        return Object.assign({}, state, { flowAnswers: fa });
      }
      case "SET_PACKET_ANSWER": {
        var pa = Object.assign({}, state.packetAnswers);
        pa[action.field] = action.value;
        return Object.assign({}, state, { packetAnswers: pa });
      }
      case "SET_TUNING": {
        var dt = Object.assign({}, state.detectionTuning);
        dt[action.field] = action.value;
        return Object.assign({}, state, { detectionTuning: dt });
      }
      case "SET_DISCRIM": {
        var bd = Object.assign({}, state.baselineDiscrim);
        bd[action.id] = action.value;
        return Object.assign({}, state, { baselineDiscrim: bd });
      }
      case "SET_HARDENING": {
        var h = Object.assign({}, state.hardening);
        h[action.key] = action.value;
        var extra = {};
        if (action.key === "apiToken") {
          extra = { apiReadOnly: action.value, apiTokenRotated: action.value };
        }
        return Object.assign({}, state, { hardening: h }, extra);
      }
      case "CHECK_OBJECTIVE": {
        var prev = state.objectives[action.id] || {
          done: false,
          attempts: 0,
          hintsUsed: 0,
          firstTry: true,
        };
        var nxt = {
          done: prev.done || action.pass,
          attempts: prev.attempts + 1,
          hintsUsed: prev.hintsUsed,
          firstTry: prev.done ? prev.firstTry : action.pass && prev.attempts === 0,
        };
        var obj = Object.assign({}, state.objectives);
        obj[action.id] = nxt;
        var locks = Object.assign({}, state.lockedAnswers);
        // R2: any check locks this objective's embedded answer inputs until REVISE
        locks[action.id] = true;
        return Object.assign({}, state, { objectives: obj, lockedAnswers: locks });
      }
      case "REVISE_ANSWERS": {
        var nextLocks = Object.assign({}, state.lockedAnswers);
        delete nextLocks[action.id];
        return Object.assign({}, state, { lockedAnswers: nextLocks });
      }
      case "SUBMIT_VERDICTS":
        return Object.assign({}, state, { alertsSubmitted: true });
      case "REVISE_ALERTS":
        return Object.assign({}, state, { alertsClassified: {}, alertsSubmitted: false });
      case "VERIFY_STOP":
        return Object.assign({}, state, { verifiedStop: true });
      case "USE_HINT": {
        var p = state.objectives[action.id] || { done: false, attempts: 0, hintsUsed: 0, firstTry: true };
        var obj2 = Object.assign({}, state.objectives);
        obj2[action.id] = Object.assign({}, p, { hintsUsed: Math.min(3, p.hintsUsed + 1) });
        return Object.assign({}, state, { objectives: obj2 });
      }
      case "SET_QUIZ_ANSWER": {
        var qa = Object.assign({}, state.quizAnswers);
        qa[action.id] = action.value;
        return Object.assign({}, state, { quizAnswers: qa });
      }
      case "SUBMIT_QUIZ":
        return Object.assign({}, state, { quizSubmitted: true });
      case "SEEN_COMPLETION":
        return Object.assign({}, state, { completionSeen: true });
      case "SET_LOCATE":
        return Object.assign({}, state, { locateTarget: action.target });
      case "HYDRATE":
        return action.state;
      case "RESET":
        return Object.assign(initialState(), { gateSeen: false });
      default:
        return state;
    }
  }

  function loadState() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (parsed.version !== STATE_VERSION) return null;
      // shallow-merge over initial state so new fields always exist
      return Object.assign(initialState(), parsed);
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
    } catch (e) {
      // ignore
    }
  }

  // ---------------- tiny pub/sub store (React useReducer equivalent) ----------------
  var state = initialState();
  var listeners = [];
  var saveTimer = null;
  var hydrated = false;

  function notify() {
    for (var i = 0; i < listeners.length; i++) listeners[i](state);
  }

  function dispatch(action) {
    var next = reducer(state, action);
    if (next !== state) {
      state = next;
      notify();
      if (hydrated) {
        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = setTimeout(function () { saveState(state); }, 250);
      }
    }
  }

  function hydrate() {
    // Restore persisted state before the first paint (the original deferred this
    // until after React mount to dodge SSR mismatches — static has no SSR).
    var loaded = loadState();
    if (loaded) state = loaded;
    hydrated = true;
  }

  var SELECTABLE_DEVICES = window.SP_DATA.DEVICES.filter(function (d) { return d.selectable; });

  return {
    STORAGE_KEY: STORAGE_KEY,
    SNMP_DEFAULTS: SNMP_DEFAULTS,
    initialState: initialState,
    reducer: reducer,
    dispatch: dispatch,
    subscribe: function (fn) { listeners.push(fn); },
    getState: function () { return state; },
    isHydrated: function () { return hydrated; },
    hydrate: hydrate,
    loadState: loadState,
    saveState: saveState,
    clearState: clearState,
    SELECTABLE_DEVICES: SELECTABLE_DEVICES,
    _cloneNote: cloneShallow,
  };
})();
