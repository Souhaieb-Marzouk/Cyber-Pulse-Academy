// ORBIT static port — state, persistence (F3/F18), simulators (F9).
// 1:1 port of the original zustand store in src/lib/lab/store.ts:
// same state shape, same persistence key, same save/restore/RESET semantics,
// same simulator scripts and the same 350 ms / 420 ms line cadence.
//
// Depends on: ORBIT.DATA, ORBIT.ENGINE (loaded first).
var ORBIT = window.ORBIT || {};
window.ORBIT = ORBIT;

ORBIT.STORE = (function () {
  "use strict";

  var D = ORBIT.DATA;
  var E = ORBIT.ENGINE;

  var STORAGE_KEY = "orbit-cv0004-lifecycle-v2";

  var BASE_ASG = { min: 1, max: 2, desired: 1, threshold: 90, windowMin: 15, cooldown: 30 };
  var BASE_FINALE = { scheduled: false, preTime: "none", dynamic: true, threshold: 90, max: 50, cooldown: 30 };

  // Pristine state — field-for-field identical to the original fresh() factory.
  function fresh() {
    return {
      phase: "gate",
      mode: "MEDIUM",
      activeBay: "fleet",

      attempts: {},
      passed: {},
      passedOn: {},
      hintsUsed: {},
      feedback: {},
      activeObj: null,
      completedSeen: false,

      quizIdx: 0,
      quizAnswers: {},
      quizDone: false,

      // shared environment
      lifecycleSeq: [],
      classified: {},
      provision: { method: "", reasons: [] },
      flaggedDrift: [],
      asg: shallowCopy(BASE_ASG),
      simState: "idle",
      simOutcome: "none",
      simLog: [],
      scaleApproach: "",
      triggerMatch: {},
      updateChoice: { version: "", window: "" },
      patch: { strategy: "", batch: "half", healthCheck: false, rollback: false, window: "" },
      halcyonSel: [],
      decomSeq: [],
      storagePolicy: { archiveAfter: 0, deleteAfter: 0, tagEnforce: false },

      // hard-mode environment
      triage: { vuln: [], manual: [], orphan: [] },
      launchSeq: [],
      finaleCfg: shallowCopy(BASE_FINALE),
      finaleState: "idle",
      finaleOutcome: "none",
      finaleLog: [],
      tierStrategy: { web: "", db: "" },
      tierReasons: { web: [], db: [] },
      cutoverSeq: [],
      bucketSeq: [],
      policyPack: {},
      costCut: [],
      costProtect: [],
      anomalyLines: [],
      containmentSeq: [],
    };
  }

  function shallowCopy(o) {
    return Object.assign({}, o);
  }

  // ---------- persistence (same key, same payload as the original) ----------
  // The original persists the whole state minus the action functions; our state
  // object never contains functions, so the payload shape matches 1:1.
  function persist(state) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // localStorage unavailable (private mode / quota) — degrade gracefully,
      // the session still works in memory exactly like the original fallback.
    }
  }

  function load() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var saved = JSON.parse(raw);
      if (!saved || typeof saved !== "object") return null;
      // merge over fresh defaults so unknown/missing keys resume safely
      return Object.assign(fresh(), saved);
    } catch (e) {
      return null;
    }
  }

  // ---------- tiny pub/sub store ----------
  var state = load() || fresh();
  var listeners = [];

  function get() {
    return state;
  }

  function set(partial) {
    state = Object.assign({}, state, partial);
    persist(state);
    listeners.forEach(function (fn) {
      try {
        fn();
      } catch (e) {
        // one broken listener must not block the rest
      }
    });
  }

  function subscribe(fn) {
    listeners.push(fn);
    return function () {
      var i = listeners.indexOf(fn);
      if (i !== -1) listeners.splice(i, 1);
    };
  }

  // ---------- simulators ----------
  // Same scripted outputs and branch logic as the original simLines()/finaleLines().
  function simLines(asg) {
    var min = asg.min, max = asg.max, threshold = asg.threshold, windowMin = asg.windowMin, cooldown = asg.cooldown;
    if (max < 6 || threshold >= 85 || windowMin >= 15) {
      return {
        outcome: "saturation",
        lines: [
          "SIM · Finale ramp begins — target 6.0x baseline.",
          "SIM · t+8 min: load 3.4x · capacity " + min + " node(s) · CPU 91%",
          "SIM · t+14 min: trigger (" + threshold + "% for " + windowMin + " min) finally arms",
          "SIM · t+22 min: load 6.0x · queue depth exploding · p95 latency 9.8 s",
          "SIM · RESULT: SATURATION — viewers see buffering. Trigger too late, ceiling too low.",
        ],
      };
    }
    if (max > 20) {
      return {
        outcome: "costblow",
        lines: [
          "SIM · Finale ramp begins — target 6.0x baseline.",
          "SIM · t+10 min: autoscaler adds nodes continuously (trigger OK)",
          "SIM · t+26 min: " + max + " instances running — SLA holding",
          "SIM · t+30 min: anomaly spike on one node → fleet grows to ceiling " + max,
          "SIM · RESULT: SLA held, but spend +180%. An uncapped ceiling is a billing incident waiting for a bad night.",
        ],
      };
    }
    return {
      outcome: "ok",
      lines: [
        "SIM · Finale ramp begins — target 6.0x baseline.",
        "SIM · t+6 min: load 2.9x · CPU " + threshold + "% for " + windowMin + " min → trigger arms",
        "SIM · t+9 min: scale-out " + min + " → 9 nodes (cooldown " + cooldown + " min respected)",
        "SIM · t+18 min: load 6.0x · capacity 9 nodes · p95 latency 0.31 s — nominal",
        "SIM · t+55 min: load decays → scale-in to " + min + ". RESULT: SURVIVED — capacity tracked demand.",
      ],
    };
  }

  function finaleLines(cfg) {
    var preTime = cfg.preTime, threshold = cfg.threshold, max = cfg.max, cooldown = cfg.cooldown;
    if (!cfg.scheduled || preTime !== "1930") {
      return {
        outcome: "saturation",
        lines: [
          "SIM · 19:30 — no pre-scale scheduled. Fleet at baseline.",
          "SIM · 20:00 — premiere hits 6.0x instantly; dynamic trigger starts from behind",
          "SIM · 20:04 — p95 latency 7.9 s during the catch-up window",
          "SIM · RESULT: SATURATION — the predictable ramp must be met with a scheduled pre-scale.",
        ],
      };
    }
    if (max > 20) {
      return {
        outcome: "costblow",
        lines: [
          "SIM · " + (preTime === "1930" ? "19:30" : "19:30") + " — scheduled pre-scale to 8 nodes (OK)",
          "SIM · 20:00 — premiere 6.0x · dynamic trigger tops the fleet up (OK)",
          "SIM · 22:40 — anomaly: one node at 97% CPU, no matching traffic (fabricated load)",
          "SIM · 22:41-23:10 — autoscaler buys the anomaly instances up to ceiling " + max,
          "SIM · RESULT: SLA held; spend +180%. The ceiling turned one bad node into a billing incident.",
        ],
      };
    }
    if (!cfg.dynamic || threshold >= 85) {
      return {
        outcome: "saturation",
        lines: [
          "SIM · 19:30 — scheduled pre-scale to 8 (OK)",
          "SIM · 20:00 — premiere 6.0x · no effective dynamic trigger to top up micro-spikes",
          "SIM · 20:06 — p95 latency 4.2 s, creeping",
          "SIM · RESULT: SATURATION — keep the dynamic trigger armed at a sane threshold.",
        ],
      };
    }
    return {
      outcome: "ok",
      lines: [
        "SIM · 19:30 — scheduled pre-scale to 8 nodes",
        "SIM · 20:00 — premiere 6.0x · dynamic trigger (CPU " + threshold + "%) tops fleet to 11",
        "SIM · 20:15 — p95 latency 0.29 s · cooldown " + cooldown + " min keeping the scaler calm",
        "SIM · 22:40 — anomaly: web node at 97% CPU with NO traffic increase (fabricated load)",
        "SIM · 22:41 — autoscaler adds only 2 nodes before hitting ceiling " + max + " — bleed stopped",
        "SIM · 23:30 — RESULT: SURVIVED — premiere served; anomaly contained to a blip.",
      ],
    };
  }

  // ---------- actions ----------
  function enter(mode) {
    set({
      phase: "ops",
      mode: mode,
      activeBay: mode === "HARD" ? "fleet" : "launch",
      activeObj: mode === "HARD" ? "H1" : "M1",
    });
  }

  function backToGate() {
    set({ phase: "gate" });
  }

  function reset() {
    set(fresh());
  }

  function setActiveObj(id) {
    set({ activeObj: id });
  }

  function setBay(bay) {
    set({ activeBay: bay });
  }

  function patch_(partial) {
    set(partial);
  }

  function hint(id) {
    var s = get();
    var obj = null;
    D.OBJECTIVES[s.mode].forEach(function (o) { if (o.id === id) obj = o; });
    if (!obj) return;
    var used = s.hintsUsed[id] ?? 0;
    if (used >= obj.hints.length) return;
    var next = Object.assign({}, s.hintsUsed);
    next[id] = used + 1;
    set({ hintsUsed: next });
  }

  function check(id) {
    var s = get();
    if (s.passed[id]) return;
    var r = E.validate(id, s);
    var obj = null;
    D.OBJECTIVES[s.mode].forEach(function (o) { if (o.id === id) obj = o; });
    var att = (s.attempts[id] ?? 0) + 1;
    var attempts = Object.assign({}, s.attempts);
    attempts[id] = att;
    var feedback = Object.assign({}, s.feedback);
    feedback[id] = { pass: r.pass, text: r.pass ? (obj && obj.passMsg) || "Correct." : r.fail };
    var partial = {
      attempts: attempts,
      feedback: feedback,
    };
    if (r.pass) {
      var passed = Object.assign({}, s.passed);
      passed[id] = true;
      var passedOn = Object.assign({}, s.passedOn);
      passedOn[id] = att;
      partial.passed = passed;
      partial.passedOn = passedOn;
    }
    set(partial);
  }

  function runSim() {
    var s = get();
    var sim = simLines(s.asg);
    set({ simState: "running", simOutcome: "none", simLog: [] });
    sim.lines.forEach(function (line, i) {
      setTimeout(function () {
        var st = get();
        var next = st.simLog.concat([line]);
        if (i === sim.lines.length - 1) {
          set({ simLog: next, simState: "done", simOutcome: sim.outcome });
        } else {
          set({ simLog: next });
        }
      }, 350 * (i + 1));
    });
  }

  function runFinaleSim() {
    var s = get();
    var sim = finaleLines(s.finaleCfg);
    set({ finaleState: "running", finaleOutcome: "none", finaleLog: [] });
    sim.lines.forEach(function (line, i) {
      setTimeout(function () {
        var st = get();
        var next = st.finaleLog.concat([line]);
        if (i === sim.lines.length - 1) {
          set({ finaleLog: next, finaleState: "done", finaleOutcome: sim.outcome });
        } else {
          set({ finaleLog: next });
        }
      }, 420 * (i + 1));
    });
  }

  function answerQuiz(qid, choice) {
    var s = get();
    var answers = Object.assign({}, s.quizAnswers);
    answers[qid] = choice;
    set({ quizAnswers: answers });
  }

  function quizLen(mode) {
    return mode === "HARD" ? 7 : 7;
  }

  function nextQuiz() {
    var s = get();
    set({ quizIdx: Math.min(s.quizIdx + 1, quizLen(s.mode) - 1) });
  }

  function finishQuiz() {
    set({ quizDone: true });
  }

  function showComplete() {
    set({ completedSeen: true });
  }

  // Retake (original: useLab.setState({ quizDone: false, quizIdx: 0, quizAnswers: {} }))
  function retakeQuiz() {
    set({ quizDone: false, quizIdx: 0, quizAnswers: {} });
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    get: get,
    set: set,
    subscribe: subscribe,
    enter: enter,
    backToGate: backToGate,
    reset: reset,
    setActiveObj: setActiveObj,
    setBay: setBay,
    patch_: patch_,
    hint: hint,
    check: check,
    runSim: runSim,
    runFinaleSim: runFinaleSim,
    answerQuiz: answerQuiz,
    nextQuiz: nextQuiz,
    finishQuiz: finishQuiz,
    retakeQuiz: retakeQuiz,
    showComplete: showComplete,
  };
})();
