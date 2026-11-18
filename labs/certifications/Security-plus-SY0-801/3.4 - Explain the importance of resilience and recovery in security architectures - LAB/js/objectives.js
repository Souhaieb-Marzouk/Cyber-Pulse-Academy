/* =========================================================================
 * Continuity Bay — CHECK RESULTS Validation Engine
 * Ported 1:1 from the original validateObjective function.
 * Every validation rule is identical to the original lab.
 * ========================================================================= */

(function () {
  'use strict';

  const D = window.LAB_DATA;

  /* --- Main validation function --- */
  function validateObjective(objId, env, mode) {
    if (!mode) return 'idle';

    /* ===== MEDIUM ===== */
    if (mode === 'medium') {
      switch (objId) {
        case 'OBJ-M1': {
          const correct = D.CORRECT_BACKUP_ORDER;
          return env.backupOrder.length === 4 && correct.every((v, i) => env.backupOrder[i] === v)
            ? 'correct' : 'incorrect';
        }
        case 'OBJ-M2': {
          const allMatched = D.METRIC_DEFS.every(d => env.metricMatches[d.correct] === d.key);
          const allKeys = Object.keys(env.metricMatches).length >= 4;
          return allMatched && allKeys ? 'correct' : 'incorrect';
        }
        case 'OBJ-M3': {
          const correct = ['BCP', 'DRP', 'COOP'];
          return env.scopeOrder.length === 3 && correct.every((v, i) => env.scopeOrder[i] === v)
            ? 'correct' : 'incorrect';
        }
        case 'OBJ-M4': {
          return env.metricMatches['M4_missing'] === 'full' ? 'correct' : 'incorrect';
        }
        case 'OBJ-M5': {
          const required = ['spof_isp', 'spof_ups', 'spof_psu', 'spof_nic'];
          const picked = required.filter(k => env.metricMatches[k] === 'yes');
          // Must pick all 4 real SPOFs and NOT pick the 2 distractors
          const distractors = ['spof_rack', 'spof_cooling'];
          const noDistractors = distractors.every(k => env.metricMatches[k] !== 'yes');
          return picked.length === 4 && noDistractors ? 'correct' : 'incorrect';
        }
        case 'OBJ-M6': {
          return D.BUSINESS_FUNCTIONS_MEDIUM.every(f => env.recoverySitePicks[f.id] === f.correct)
            ? 'correct' : 'incorrect';
        }
        case 'OBJ-M7': {
          const schedOk =
            env.backupSnapshotFreq === 'hourly' || env.backupSnapshotFreq === '15min' ||
            env.backupIncrFreq === 'hourly' || env.backupIncrFreq === '15min';
          const togglesOk = env.immutability && env.replication && env.offsite;
          return schedOk && togglesOk ? 'correct' : 'incorrect';
        }
        case 'OBJ-M8': {
          return D.CONTINUITY_ARTIFACTS_MEDIUM.every(a =>
            (a.correct && env.continuityPicks[a.id] === 'BCP') ||
            (!a.correct && env.continuityPicks[a.id] !== 'BCP')
          ) ? 'correct' : 'incorrect';
        }
        case 'OBJ-M9': {
          return env.metricMatches['M9_missing'] === 'generator' ? 'correct' : 'incorrect';
        }
        case 'OBJ-M10': {
          const ok = env.dualPsu && env.ups && env.generator && env.redundantCircuits;
          return ok && env.simulationOutcome === 'survived' ? 'correct' : 'incorrect';
        }
        case 'OBJ-M11': {
          return D.TEST_SCENARIOS_MEDIUM.every(s => env.testPicks[s.id] === s.correct)
            ? 'correct' : 'incorrect';
        }
        case 'OBJ-M12': {
          const ok = env.platformDiversity && env.multiCloud;
          return ok && env.simulationOutcome === 'survived' ? 'correct' : 'incorrect';
        }
      }
    }

    /* ===== HARD ===== */
    if (mode === 'hard') {
      switch (objId) {
        case 'OBJ-H1': {
          return env.incidentCascade.length === 4 &&
            D.CORRECT_CASCADE.every((v, i) => env.incidentCascade[i] === v)
            ? 'correct' : 'incorrect';
        }
        case 'OBJ-H2': {
          const schedOk =
            env.backupSnapshotFreq === '15min' &&
            env.backupFullFreq === 'weekly' &&
            env.backupDiffFreq === 'daily';
          const togglesOk = env.immutability && env.replication && env.offsite;
          const seqOk = env.hardBackupRestoreSeq.length === 4 &&
            D.CORRECT_RESTORE_H2.every((v, i) => env.hardBackupRestoreSeq[i] === v);
          return schedOk && togglesOk && seqOk ? 'correct' : 'incorrect';
        }
        case 'OBJ-H3': {
          const picksOk = D.BUSINESS_FUNCTIONS_HARD.every(f => env.recoverySitePicks[f.id] === f.correct);
          const justOk = D.BUSINESS_FUNCTIONS_HARD.every(f => env.hardSiteJustifications[f.id] === f.justification);
          return picksOk && justOk ? 'correct' : 'incorrect';
        }
        case 'OBJ-H4': {
          return D.TEST_SCENARIOS_HARD.every(s => env.hardTestPicks[s.id] === s.correct)
            ? 'correct' : 'incorrect';
        }
        case 'OBJ-H5': {
          const allMatched = D.CONTINUITY_ARTIFACTS_HARD.every(a => env.hardArtifactPicks[a.id] === a.correct);
          return allMatched ? 'correct' : 'incorrect';
        }
        case 'OBJ-H6': {
          return D.CAPACITY_SCENARIOS_HARD.every(s => env.hardCapacityPicks[s.id] === s.correct)
            ? 'correct' : 'incorrect';
        }
        case 'OBJ-H7': {
          const ok = env.platformDiversity && env.multiCloud && (env.loadBalancer || env.clustering);
          return ok && env.simulationOutcome === 'survived' ? 'correct' : 'incorrect';
        }
        case 'OBJ-H8': {
          return env.hardBackupRestoreSeq.length === 4 &&
            D.CORRECT_RESTORE_H8.every((v, i) => env.hardBackupRestoreSeq[i] === v)
            ? 'correct' : 'incorrect';
        }
        case 'OBJ-H9': {
          const allMatched = Object.entries(D.CORRECT_DOMAIN_MATCHES).every(
            ([domain, failure]) => env.domainMatches[domain] === failure
          );
          return allMatched ? 'correct' : 'incorrect';
        }
      }
    }

    return 'incorrect';
  }

  /* --- Run simulation (determines survival based on enabled controls) --- */
  function runSimulation(env) {
    const powerSurvives = env.dualPsu && env.ups && env.generator && env.redundantCircuits;
    const vendorSurvives = env.platformDiversity && env.multiCloud;
    const hardVendorSurvives = env.platformDiversity && env.multiCloud && (env.loadBalancer || env.clustering);
    const survives = powerSurvives || vendorSurvives || hardVendorSurvives;
    return {
      simulationRun: true,
      simulationOutcome: survives ? 'survived' : 'failed',
    };
  }

  /* --- Compute star rating --- */
  function computeStars(state, objectivesForMode, quizForMode) {
    if (!state.mode) return 0;
    const completedCount = objectivesForMode.filter(o => state.objectives[o.id]?.status === 'correct').length;
    const totalCount = objectivesForMode.length;
    const quizCorrect = quizForMode.filter(q =>
      state.quizSubmitted[q.id] && state.quizAnswered[q.id] === q.correct
    ).length;
    const quizTotal = quizForMode.length;

    const objScore = totalCount > 0 ? (completedCount / totalCount) * 70 : 0;
    const quizScore = quizTotal > 0 ? (quizCorrect / quizTotal) * 30 : 0;
    const raw = objScore + quizScore;

    const totalHintsUsed = objectivesForMode.reduce((acc, o) => acc + (state.objectives[o.id]?.hintsUsed || 0), 0);
    const hintPenalty = Math.min(15, totalHintsUsed * 3);

    const attemptPenalty = objectivesForMode.reduce((acc, o) => {
      const r = state.objectives[o.id];
      if (!r) return acc;
      if (r.status === 'correct' && r.attempts > 1) return acc + Math.min(10, (r.attempts - 1) * 2);
      return acc;
    }, 0);

    const finalScore = Math.max(0, raw - hintPenalty - attemptPenalty);
    if (finalScore >= 90) return 5;
    if (finalScore >= 75) return 4;
    if (finalScore >= 55) return 3;
    if (finalScore >= 35) return 2;
    if (finalScore > 0) return 1;
    return 0;
  }

  /* --- Compute focus areas for completion report --- */
  function computeFocusAreas(state, objectivesForMode, quizForMode) {
    const areas = [];

    const failedObjs = objectivesForMode.filter(o => state.objectives[o.id]?.status !== 'correct');
    for (const o of failedObjs) {
      areas.push({
        topic: o.text.split('.')[0],
        reason: `Objective ${o.id.replace('OBJ-', '')} not yet cleared — covers: ${o.anchor}`,
      });
    }

    for (const q of quizForMode) {
      const selected = state.quizAnswered[q.id];
      const submitted = state.quizSubmitted[q.id];
      if (submitted && selected !== q.correct) {
        const topic = q.question.replace(/[?.].*$/, '').slice(0, 70);
        areas.push({
          topic,
          reason: `Quiz ${q.id} answered incorrectly — review the explanation above.`,
        });
      }
    }

    const stars = computeStars(state, objectivesForMode, quizForMode);
    if (areas.length === 0 && stars < 4) {
      areas.push({
        topic: 'Review hint usage and retry patterns',
        reason: `Star rating is ${stars}/5 — hints and multiple attempts reduced the score.`,
      });
    }

    return areas.slice(0, 6);
  }

  window.LAB_VALIDATE = { validateObjective, runSimulation, computeStars, computeFocusAreas };
})();
