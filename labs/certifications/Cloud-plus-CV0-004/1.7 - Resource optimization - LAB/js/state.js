/* ==========================================================================
   NIMBUS TOWER — js/state.js
   State factory + persistence + scoring + focus areas.
   Ported 1:1 from src/lib/lab/engine.ts — same storage key, same JSON shape,
   same v1.1 migration, same scoring/star/focus rules.
   ========================================================================== */
(function (root) {
  'use strict';

  var LAB = root.LAB;

  var MEDIUM_ANSWERS = LAB.QUIZ.medium.map(function (q) { return q.answer; });
  var HARD_ANSWERS = LAB.QUIZ.hard.map(function (q) { return q.answer; });

  LAB.STORAGE_KEY = 'cv0004-tower-v1'; // identical to the original framework lab
  LAB.SAVINGS_TARGET_HARD = 1300;

  function deep(x) {
    // structuredClone when available; JSON fallback keeps file:// + older browsers alive.
    if (root.structuredClone) return root.structuredClone(x);
    return JSON.parse(JSON.stringify(x));
  }
  LAB.deepCopy = deep;

  LAB.createEnv = function () {
    return {
      fleet: deep(LAB.FLEET),
      storage: deep(LAB.STORAGE),
      spend: deep(LAB.SPEND),
      asg: { type: 'vertical', policy: 'manual', min: 2, max: 2, desired: 2, cpuTarget: 60, preWarm: false, preWarmWindow: '' },
      alerts: { threshold: null, window: null, enabled: false },
      drills: { terms: {}, billing: {}, platform: {} },
      triage: {},
      campaign: { ciSpotHandling: 'none' },
      resilience: { storefrontAz: true, dbAz: true, devTestReplica: true },
      flags: {},
      spendAnswer: { service: '', pct: '' },
      spendCause: '',
      sizeJustification: {},
      strategy: {},
      events: [],
    };
  };

  LAB.createModeState = function () {
    return {
      env: LAB.createEnv(),
      checks: {},
      hints: {},
      msgs: {},
      quiz: { answers: {}, checked: {}, submitted: false },
    };
  };

  LAB.createLabState = function () {
    return { version: 1, mode: null, medium: LAB.createModeState(), hard: LAB.createModeState() };
  };

  LAB.loadLabState = function () {
    try {
      var raw = root.localStorage.getItem(LAB.STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== 1 || !parsed.medium || !parsed.medium.env || !parsed.hard || !parsed.hard.env) return null;
      ['medium', 'hard'].forEach(function (m) {
        var ms = parsed[m];
        if (!ms.msgs) ms.msgs = {};
        if (!ms.env.sizeJustification || typeof ms.env.sizeJustification !== 'object') ms.env.sizeJustification = {};
        if (!ms.env.strategy || typeof ms.env.strategy !== 'object') ms.env.strategy = {};
        // v1.1 migration: per-question quiz lock. Older saves lack `checked`.
        if (!ms.quiz.checked || typeof ms.quiz.checked !== 'object') {
          var derived = {};
          if (ms.quiz.submitted) {
            var ans = ms.quiz.answers || {};
            Object.keys(ans).forEach(function (k) { derived[Number(k)] = true; });
          }
          ms.quiz.checked = derived;
        }
      });
      return parsed;
    } catch (e) {
      return null; // localStorage unavailable / corrupt — degrade to a fresh shift
    }
  };

  LAB.saveLabState = function (state) {
    try {
      root.localStorage.setItem(LAB.STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // localStorage unavailable — degrade gracefully (session-only progress)
    }
  };

  LAB.clearLabState = function () {
    try {
      root.localStorage.removeItem(LAB.STORAGE_KEY);
    } catch (e) { /* ignore */ }
  };

  /* ---------- scoring ---------- */
  LAB.computeScore = function (mode, ms, objectiveCount) {
    var ids = [];
    for (var i = 1; i <= objectiveCount; i++) ids.push((mode === 'medium' ? 'OBJ-M' : 'OBJ-H') + i);
    var passed = 0, hintsUsed = 0, failedAttempts = 0;
    ids.forEach(function (id) {
      var c = ms.checks[id];
      if (c && c.passed) passed++;
      hintsUsed += ms.hints[id] || 0;
      failedAttempts += (c && c.attempts) || 0;
    });
    var quizTotal = Object.keys(ms.quiz.answers || {}).length;
    var bank = mode === 'medium' ? MEDIUM_ANSWERS : HARD_ANSWERS;
    var quizCorrect = 0;
    if (mode === 'medium') {
      for (var j = 0; j < MEDIUM_ANSWERS.length; j++) if (ms.quiz.answers[j] === MEDIUM_ANSWERS[j]) quizCorrect++;
    } else {
      for (var k = 0; k < HARD_ANSWERS.length; k++) if (ms.quiz.answers[k] === HARD_ANSWERS[k]) quizCorrect++;
    }
    var submitted = ms.quiz.submitted;
    var denom = Math.max(1, quizTotal);
    var score = 0.7 * (passed / objectiveCount) + 0.3 * (submitted ? quizCorrect / denom : 0);
    // hard shift promise: the single paid nudge really does cost the 3rd star
    var hintCap = mode === 'hard' ? 0 : 2;
    var stars = score >= 0.9 && hintsUsed <= hintCap && failedAttempts <= 2 ? 3 : score >= 0.7 ? 2 : 1;
    return { passed: passed, total: objectiveCount, hintsUsed: hintsUsed, failedAttempts: failedAttempts, quizCorrect: quizCorrect, quizTotal: submitted ? quizTotal : 0, score: score, stars: stars };
  };

  /* ---------- R8 focus areas (evidence-derived, never generic filler) ---------- */
  LAB.computeFocusAreas = function (mode, ms) {
    var areas = [];
    var quiz = mode === 'medium' ? LAB.QUIZ.medium : LAB.QUIZ.hard;
    // 1) quiz items answered wrong, grouped by topic
    var wrongByTopic = {};
    for (var i = 0; i < quiz.length; i++) {
      var given = ms.quiz.answers[i];
      if (ms.quiz.submitted && given !== undefined && given !== quiz[i].answer) {
        var t = quiz[i].topic;
        (wrongByTopic[t] = wrongByTopic[t] || []).push(i + 1);
      }
    }
    Object.keys(wrongByTopic).forEach(function (topic) {
      var qs = wrongByTopic[topic].map(function (n) { return 'Q' + n; }).join(', Q');
      areas.push({ label: 'Revisit: ' + topic, detail: 'debrief quiz ' + qs + ' answered incorrectly — re-read the matching field notes and retry the linked clearance' });
    });
    // 2) clearances that needed repeated CHECK runs
    var retried = Object.keys(ms.checks).filter(function (id) { return ms.checks[id].attempts >= 1; })
      .map(function (id) { return id.replace('OBJ-', ''); });
    if (retried.length) areas.push({ label: 'Re-checked clearances', detail: retried.join(', ') + ' needed multiple CHECK runs — redo the evidence-reading step until the first call is right' });
    // 3) clearances solved with hint support
    var hinted = Object.keys(ms.hints).filter(function (id) { return ms.hints[id] > 0; })
      .map(function (id) { return id.replace('OBJ-', ''); });
    if (hinted.length) areas.push({ label: 'Hint-supported clearances', detail: hinted.join(', ') + ' were solved with hints — rebuild those answers from the strip evidence alone' });
    // 4) unanswered or unsubmitted quiz
    if (!ms.quiz.submitted) areas.push({ label: 'Debrief quiz incomplete', detail: 'the knowledge check was never submitted — finish it to validate recall before the exam' });
    return areas;
  };
})(typeof window !== 'undefined' ? window : globalThis);
