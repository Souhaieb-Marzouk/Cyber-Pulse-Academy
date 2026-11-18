// ═══════════════════════════════════════════════════════════════════════════
// Gateway Operations Center — Lab 001 · js/state.js
// Single plain-JS state object + tiny subscribe/notify store.
// Persistence matches the original zustand-persist layout exactly:
//   localStorage key : "goc-lab-n10-009-v1"
//   wrapper          : { state: {…partialized…}, version: 2 }
//   partialized      : phase, mode, activeBench, ledgerOpen, env, answers,
//                      results, quizAnswers, quizChecked, completedShown
//   migration        : v2 rebuilt the quiz bank → drop quiz answers/checks
// ═══════════════════════════════════════════════════════════════════════════

(function (root) {
  "use strict";
  var D = root.GocData;

  var STORAGE_KEY = "goc-lab-n10-009-v1";
  var STORAGE_VERSION = 2;

  function freshEnv(mode) {
    return D.seedEnv(mode);
  }

  function initialState() {
    return {
      phase: "gate", // "gate" | "briefing" | "ops"
      mode: null, // "medium" | "hard" | null
      activeBench: "forwarding",
      ledgerOpen: true,
      drawer: "none", // "none" | "locker" | "glossary"
      modal: "none", // "none" | "comms" | "handover" | "debrief" | "reset"
      spot: null,

      env: freshEnv("medium"),
      answers: {},
      results: {},
      quizAnswers: {},
      quizChecked: {},
      completedShown: false,
    };
  }

  // ── persistence ────────────────────────────────────────────────────────────
  function partialize(s) {
    return {
      phase: s.phase,
      mode: s.mode,
      activeBench: s.activeBench,
      ledgerOpen: s.ledgerOpen,
      env: s.env,
      answers: s.answers,
      results: s.results,
      quizAnswers: s.quizAnswers,
      quizChecked: s.quizChecked,
      completedShown: s.completedShown,
    };
  }

  function save(state) {
    try {
      var payload = { state: partialize(state), version: STORAGE_VERSION };
      root.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      /* storage unavailable (private mode / file:// quota) — lab keeps running */
    }
  }

  function load() {
    var raw = null;
    try {
      raw = root.localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      raw = null;
    }
    if (!raw) return initialState();
    try {
      var parsed = JSON.parse(raw);
      var p = parsed && parsed.state ? parsed.state : {};
      // v2 migration: quiz options were rebuilt (rotation/length fixes) — old
      // saved option indexes no longer match the bank, so drop quiz state only.
      // (Same as the original: migrate() runs only on a version mismatch.)
      if (!parsed || parsed.version !== STORAGE_VERSION) {
        p.quizAnswers = {};
        p.quizChecked = {};
      }
      // shallow merge over pristine state, exactly like zustand persist
      var base = initialState();
      var keys = Object.keys(base);
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        if (p[k] !== undefined && p[k] !== null) base[k] = p[k];
      }
      return base;
    } catch (e) {
      return initialState();
    }
  }

  function wipe() {
    try {
      root.localStorage.removeItem(STORAGE_KEY);
    } catch (e) { /* ignore */ }
  }

  // ── store ──────────────────────────────────────────────────────────────────
  var listeners = [];

  function subscribe(fn) {
    listeners.push(fn);
    return function () {
      var i = listeners.indexOf(fn);
      if (i !== -1) listeners.splice(i, 1);
    };
  }

  function notify() {
    for (var i = 0; i < listeners.length; i++) listeners[i]();
  }

  var state = initialState();

  function commit() {
    save(state);
    notify();
  }

  function uid(prefix) {
    return prefix + "-" + Math.random().toString(36).slice(2, 8);
  }

  // ── actions (same semantics as the original store) ────────────────────────
  var actions = {
    chooseMode: function (m) {
      state.mode = m;
      state.phase = "briefing";
      state.env = freshEnv(m);
      state.answers = {};
      state.results = {};
      state.quizAnswers = {};
      state.quizChecked = {};
      state.completedShown = false;
      state.activeBench = "forwarding";
      state.ledgerOpen = true;
      state.drawer = "none";
      state.modal = "none";
      state.spot = null;
      commit();
    },
    enterOps: function () {
      state.phase = "ops";
      commit();
    },
    backToGate: function () {
      state.phase = "gate";
      commit();
    },
    resetAll: function () {
      var fresh = initialState();
      var keys = Object.keys(fresh);
      for (var i = 0; i < keys.length; i++) state[keys[i]] = fresh[keys[i]];
      state.env = freshEnv("medium");
      commit();
    },
    openBench: function (b) {
      state.activeBench = b;
      commit();
    },
    setLedger: function (open) {
      state.ledgerOpen = open;
      commit();
    },
    setDrawer: function (d) {
      state.drawer = d;
      commit();
    },
    setModal: function (m) {
      state.modal = m;
      commit();
    },
    setSpot: function (id) {
      state.spot = id;
      commit();
    },

    setAnswer: function (objId, key, value) {
      if (!state.answers[objId]) state.answers[objId] = {};
      state.answers[objId][key] = value;
      commit();
    },
    useHint: function (objId) {
      var r = state.results[objId] || { done: false, attempts: 0, hintsUsed: 0, firstTry: true };
      r.hintsUsed = Math.min(r.hintsUsed + 1, 3);
      state.results[objId] = r;
      commit();
    },
    checkObjective: function (objId) {
      if (!state.mode) return { ok: false, msg: "Select a mode first." };
      var res = root.GocObjectives.validateObjective(objId, state.env, state.answers, state.mode);
      var prev = state.results[objId] || { done: false, attempts: 0, hintsUsed: 0, firstTry: true };
      var next = {
        done: prev.done || res.ok,
        attempts: prev.attempts + 1,
        hintsUsed: prev.hintsUsed,
        firstTry: prev.done ? prev.firstTry : res.ok && prev.attempts === 0,
        lastOk: res.ok,
        lastMsg: res.msg,
      };
      state.results[objId] = next;
      commit();
      return res;
    },

    runPacket: function (dst) {
      if (!state.mode) return { error: "Select a mode first." };
      var out = root.GocEngine.makePacketRun(state.env, state.mode, dst);
      if (out.error) return out;
      state.env.packetRuns = [out].concat(state.env.packetRuns).slice(0, 12);
      state.env.runCounter = out.id;
      commit();
      return out;
    },

    addStatic: function (r) {
      var id = uid("sr");
      state.env.staticRoutes.push(Object.assign({ id: id }, r));
      commit();
      return id;
    },
    removeStatic: function (id) {
      state.env.staticRoutes = state.env.staticRoutes.filter(function (x) { return x.id !== id; });
      commit();
    },

    addSubif: function (s0) {
      var name = "G0/0." + s0.tag;
      var i;
      for (i = 0; i < state.env.subifs.length; i++) {
        if (state.env.subifs[i].name === name)
          return { ok: false, msg: name + " already exists." };
      }
      for (i = 0; i < state.env.subifs.length; i++) {
        if (state.env.subifs[i].tag === s0.tag)
          return {
            ok: false,
            msg: "802.1Q conflict: another subinterface already claims tag " + s0.tag + ". One tag, one subinterface.",
          };
      }
      var id = uid("si");
      state.env.subifs.push(Object.assign({ name: name, id: id }, s0));
      commit();
      return { ok: true, msg: name + " created — dot1q " + s0.tag + ", ip " + s0.ip };
    },
    updateSubif: function (id, patch) {
      var target = null;
      for (var i = 0; i < state.env.subifs.length; i++) {
        if (state.env.subifs[i].id === id) { target = state.env.subifs[i]; break; }
      }
      if (!target) return { ok: false, msg: "No such subinterface." };
      if (patch.tag !== undefined) {
        var name = "G0/0." + patch.tag;
        for (var j = 0; j < state.env.subifs.length; j++) {
          var other = state.env.subifs[j];
          if (other.id !== id && other.tag === patch.tag)
            return {
              ok: false,
              msg: "802.1Q conflict: tag " + patch.tag + " is already claimed. One tag, one subinterface.",
            };
        }
        for (var k = 0; k < state.env.subifs.length; k++) {
          if (state.env.subifs[k].id === id) {
            Object.assign(state.env.subifs[k], patch, { name: name });
          }
        }
        commit();
        return { ok: true, msg: name + " updated." };
      }
      for (var m = 0; m < state.env.subifs.length; m++) {
        if (state.env.subifs[m].id === id) Object.assign(state.env.subifs[m], patch);
      }
      commit();
      return { ok: true, msg: target.name + " updated." };
    },
    removeSubif: function (id) {
      state.env.subifs = state.env.subifs.filter(function (x) { return x.id !== id; });
      commit();
    },

    patchFhrp: function (patch) {
      Object.assign(state.env.fhrp, patch);
      commit();
    },

    fixOspf: function (stage) {
      state.env.ospfStage =
        stage === "area0" ? "full" : stage === "timers" ? "mtu" : "full";
      commit();
    },

    withdrawSeedRoute: function (routeId) {
      if (state.env.removedRouteIds.indexOf(routeId) === -1) {
        state.env.removedRouteIds.push(routeId);
      }
      commit();
    },

    buildNat: function (e) {
      state.env.natBuilt = state.env.natBuilt.filter(function (x) { return x.id !== e.id; });
      state.env.natBuilt.push(e);
      commit();
    },

    pushH8: function (opId) {
      if (state.env.h8order.indexOf(opId) === -1) state.env.h8order.push(opId);
      commit();
    },
    undoH8: function () {
      state.env.h8order.pop();
      commit();
    },
    clearH8: function () {
      state.env.h8order = [];
      commit();
    },

    setQuizAnswer: function (qid, idx) {
      // R2 answer lock: a checked question can never be re-answered.
      if (state.quizChecked[qid]) return;
      state.quizAnswers[qid] = idx;
      commit();
    },
    checkQuizItem: function (qid) {
      state.quizChecked[qid] = true;
      commit();
    },
    markDebriefShown: function () {
      state.completedShown = true;
      commit();
    },
  };

  // ── derived helpers ────────────────────────────────────────────────────────
  function objectivesFor(mode) {
    return mode ? D.objectivesForMode(mode) : [];
  }
  function quizFor(mode) {
    return mode === "hard" ? D.QUIZ_HARD : D.QUIZ_MEDIUM;
  }
  function quizCorrectCount(mode) {
    var items = quizFor(mode);
    var n = 0;
    items.forEach(function (q) {
      if (state.quizChecked[q.id] && state.quizAnswers[q.id] === q.correct) n++;
    });
    return n;
  }
  function quizDone(mode) {
    var need = mode === "hard" ? 8 : 7;
    var checked = 0;
    Object.keys(state.quizChecked).forEach(function (k) {
      if (state.quizChecked[k]) checked++;
    });
    return checked >= need;
  }
  function allDone(mode) {
    var objs = objectivesFor(mode);
    return objs.every(function (o) { return state.results[o.id] && state.results[o.id].done; });
  }
  function isComplete(mode) {
    return !!mode && allDone(mode) && quizDone(mode);
  }

  root.GocStore = {
    get state() { return state; },
    actions: actions,
    subscribe: subscribe,
    commit: commit,
    load: load,
    wipe: wipe,
    objectivesFor: objectivesFor,
    quizFor: quizFor,
    quizCorrectCount: quizCorrectCount,
    quizDone: quizDone,
    allDone: allDone,
    isComplete: isComplete,
  };
})(typeof window !== "undefined" ? window : globalThis);
