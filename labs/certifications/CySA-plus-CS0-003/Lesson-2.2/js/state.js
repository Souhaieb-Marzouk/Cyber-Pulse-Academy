// ─── Threat Hunt Expedition — state, persistence & scoring utils ─────────────
// Verbatim static port of src/lib/hunt-lab/state.ts.
// localStorage only. All failures degrade gracefully to in-memory play.
// Same STORAGE_KEY, same save/restore/RESET semantics as the original lab.
/* eslint-disable */

window.HuntState = (function () {
  "use strict";

  var STORAGE_KEY = "cysa22-threathunt-v1";

  function emptyEnv() {
    return {
      readBulletins: [],
      huntOrNot: {},
      huntScenarios: {},
      huntType: "",
      trigger: "",
      huntSources: [],
      hypothesis: "",
      cycleOrder: [],
      intelProducts: {},
      routeItems: {},
      queriesRun: [],
      triage: {},
      contactFlags: [],
      techTag: "",
      chainIp: "",
      chainHost: "",
      killChain: [],
      diamond: {},
      attck: {},
      tactic: "",
      originTags: {},
      motivations: {},
      profilerType: "",
      profilerDossier: "",
      attribution: "",
      attributionTraits: [],
      intelFormat: "",
      intelTransport: "",
      packageItems: [],
      feedbackActions: [],
      nextHypothesis: "",
      shareObjects: [],
      priorityHunt: "",
      programMetric: "",
    };
  }

  function freshState(mode) {
    return {
      version: 1,
      mode: mode || null,
      phase: mode ? "briefing" : "basecamp",
      visitedPhases: mode ? ["basecamp", "briefing"] : ["basecamp"],
      env: emptyEnv(),
      objectives: {},
      quiz: {},
      completedAt: null,
    };
  }

  function emptyProgress() {
    return {
      done: false,
      attempts: 0,
      failedChecks: 0,
      hintsUsed: 0,
      nudgeUsed: false,
      lastPass: null,
      lastFeedback: "",
    };
  }

  function isLabState(v) {
    if (!v || typeof v !== "object") return false;
    return (
      v.version === 1 &&
      (v.mode === null || v.mode === "medium" || v.mode === "hard") &&
      typeof v.phase === "string" &&
      !!v.env &&
      typeof v.env === "object"
    );
  }

  function loadState() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!isLabState(parsed)) return null;
      // merge in any env fields added since the save
      parsed.env = Object.assign({}, emptyEnv(), parsed.env);
      parsed.objectives = parsed.objectives || {};
      parsed.quiz = parsed.quiz || {};
      parsed.visitedPhases = parsed.visitedPhases || ["basecamp"];
      return parsed;
    } catch (e) {
      return null; // private mode, quota, corruption → fresh lab
    }
  }

  function saveState(state) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* degrade silently — lab still playable in-memory */
    }
  }

  function clearState() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      /* noop */
    }
  }

  // ── scoring ────────────────────────────────────────────────────────────────
  function computeStats(state) {
    var defs = state.mode ? window.HuntObjectives.objectivesForMode(state.mode) : [];
    var quiz = state.mode === "hard" ? window.HuntData.quizHard : window.HuntData.quizMedium;
    var done = 0;
    var firstTry = 0;
    var hintsUsed = 0;
    var byPillar = {
      P1: { done: 0, total: 0 },
      P2: { done: 0, total: 0 },
      P3: { done: 0, total: 0 },
      P4: { done: 0, total: 0 },
    };
    var perObjective = defs.map(function (d) {
      var p = state.objectives[d.id];
      var isDone = !!(p && p.done);
      var isFirst = isDone && p.failedChecks === 0;
      if (isDone) done += 1;
      if (isFirst) firstTry += 1;
      hintsUsed += (p && p.hintsUsed) || 0;
      byPillar[d.pillar].total += 1;
      if (isDone) byPillar[d.pillar].done += 1;
      return {
        id: d.id,
        title: d.title,
        pillar: d.pillar,
        done: isDone,
        firstTry: isFirst,
      };
    });
    var quizCorrect = quiz.filter(function (q) { return state.quiz[q.id] === q.correct; }).length;
    var quizTotal = quiz.length;

    // stars: 65% first-attempt objective accuracy, 35% quiz accuracy, −0.25/hint
    var firstTryRatio = defs.length ? firstTry / defs.length : 0;
    var quizRatio = quizTotal ? quizCorrect / quizTotal : 0;
    var raw = 5 * (0.65 * firstTryRatio + 0.35 * quizRatio) - 0.25 * Math.min(hintsUsed, 8);
    var stars = Math.max(1, Math.min(5, Math.round(raw)));

    return {
      total: defs.length,
      done: done,
      firstTry: firstTry,
      hintsUsed: hintsUsed,
      byPillar: byPillar,
      perObjective: perObjective,
      quizCorrect: quizCorrect,
      quizTotal: quizTotal,
      stars: stars,
    };
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    emptyEnv: emptyEnv,
    freshState: freshState,
    emptyProgress: emptyProgress,
    loadState: loadState,
    saveState: saveState,
    clearState: clearState,
    computeStats: computeStats,
  };
})();
