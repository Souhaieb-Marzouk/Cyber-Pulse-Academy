/* ── Objectives engine ────────────────────────────────────────────────────────
 * The 22 objective definitions (Medium M1–M12, Hard H1–H10) with the EXACT
 * validation predicates ported from the original src/lib/lab/objectives.ts,
 * plus the scoring helpers from src/lib/lab/engine.ts.
 * Metadata (titles, hints, feedback) lives in js/data.js → window.LAB.
 */
(function () {
  'use strict';

  const LAB = window.LAB;

  const setEq = (a, b) =>
    a.length === b.length && [...a].sort().join('|') === [...b].sort().join('|');

  const PILLAR_LABEL = {
    understand: 'Understand',
    recognize: 'Recognize',
    detect: 'Detect',
    mitigate: 'Mitigate',
  };

  /* ── validators: one per objective id, same signature as the original ─────── */
  const VALIDATORS = {
    // ══════════════════ MEDIUM ══════════════════
    M1: (s) => LAB.matchTechs.every((t) => s.drills.matchTech[t.id] === t.id),
    M2: (s) => LAB.vocabSentences.every((v) => s.drills.vocabAssign[v.id] === v.correct),
    M3: (s) => s.drills.funcChoice === LAB.funcCorrect && s.drills.ciaChoice === LAB.ciaCorrect,
    M4: (s) => s.drills.hiChoice === LAB.hiCorrect && s.drills.loChoice === LAB.loCorrect,
    M5: (s) => s.traps.honeypot.deployed && s.traps.honeypot.segment === 'decoy-yard' &&
      s.traps.honeypot.services.ssh && s.traps.honeypot.monitoring,
    M6: (s) => s.traps.honeyfile.host === 'filesrv-01' && s.traps.honeyfile.file !== 'none' &&
      s.traps.honeyfile.canary && s.traps.honeytoken.enabled,
    M7: (s) => s.traps.sinkhole.enabled && s.traps.sinkhole.logQueries &&
      s.traps.sinkhole.domain === 'cdn-metrics-sync.com' && s.traps.tarpit.enabled,
    M8: (s) => {
      const dec = s.feed.filter((e) => e.deception).map((e) => e.id);
      return dec.length >= 4 && setEq(s.drills.reconSelected, dec);
    },
    M9: (s) => {
      const hasHp = s.feed.some((e) => e.id === 'W-HP');
      const reA = /uname\s+-a/i;
      const reB = /cat\s+\/etc\/passwd/i;
      const a = s.drills.cmdA, b = s.drills.cmdB;
      return hasHp && ((reA.test(a) && reB.test(b)) || (reA.test(b) && reB.test(a)));
    },
    M10: (s) => s.traps.fence.closed &&
      /(pivot|prod|production|reach|lateral|jump|hop|move|spread|attack\s+other|real\s+system)/i.test(s.drills.fenceWhy),
    M11: (s) => s.drills.irOrder.length === 4 && setEq(s.drills.irOrder, LAB.irCorrect) &&
      s.drills.irOrder[0] === 'rotate',
    M12: (s) => setEq(s.drills.limitations, LAB.limitationCorrect),
    // ══════════════════ HARD ══════════════════
    H1: (s) => LAB.hardFeed.every((e) => s.drills.triage[e.id] === e.category),
    H2: (s) => s.drills.chainOrder.length === 6 && setEq(s.drills.chainOrder, LAB.chainCorrect) &&
      s.drills.chainOrder[0] === 'c1',
    H3: (s) => /ssh/i.test(s.drills.vectorInput) &&
      /(brute|guess|credential|stuff|password)/i.test(s.drills.vectorInput),
    H4: (s) => s.drills.htEvent === 'E-0241' && s.drills.htProof === LAB.htProofCorrect,
    H5: (s) => s.traps.fence.closed && s.drills.fenceJustify === LAB.fenceJustifyCorrect,
    H6: (s) => setEq(s.drills.herrings, LAB.herringCorrect) && s.drills.herringWhy === LAB.herringWhyCorrect,
    H7: (s) => LAB.attackBehaviors.every((b) => s.drills.attackMap[b.id] === LAB.attackCorrect[b.id]),
    H8: (s) => s.drills.rule.source === LAB.ruleCorrect.source && s.drills.rule.condition === LAB.ruleCorrect.condition &&
      s.drills.rule.threshold === LAB.ruleCorrect.threshold && s.drills.rule.response === LAB.ruleCorrect.response,
    H9: (s) => setEq(s.drills.residual, LAB.residualCorrect) && s.drills.nextInvest === LAB.nextInvestCorrect,
    H10: (s) => LAB.riskSlots.every((slot) => slot.correct === '' || s.drills.riskFill[slot.id] === slot.correct),
  };

  const OBJECTIVES = LAB.objectivesMeta.map((o) => ({ ...o, validate: VALIDATORS[o.id] }));

  function objectivesFor(mode) {
    return OBJECTIVES.filter((o) => o.mode === mode).sort((a, b) => a.order - b.order);
  }

  function objectiveById(id) {
    return OBJECTIVES.find((o) => o.id === id) || null;
  }

  /* ── scoring (ported 1:1 from engine.ts) ──────────────────────────────────── */
  const quizFor = (mode) => (mode === 'medium' ? LAB.quizMedium : LAB.quizHard);

  const objectivesTotal = (mode) => objectivesFor(mode).length;

  const objectivesPassed = (session, mode) =>
    objectivesFor(mode).filter((o) => session.objProgress[o.id] && session.objProgress[o.id].done).length;

  const quizCorrect = (session, mode) =>
    quizFor(mode).filter((q) => session.quizAnswers[q.id] === q.correct).length;

  const quizCheckedCount = (session, mode) =>
    quizFor(mode).filter((q) => session.quizChecked[q.id]).length;

  const quizComplete = (session, mode) => quizCheckedCount(session, mode) === quizFor(mode).length;

  const labComplete = (session, mode) =>
    objectivesPassed(session, mode) === objectivesTotal(mode) && quizComplete(session, mode);

  const computeScore = (session, mode) => {
    const o = objectivesPassed(session, mode) / objectivesTotal(mode);
    const q = quizCorrect(session, mode) / quizFor(mode).length;
    return Math.round(70 * o + 30 * q);
  };

  const hintsUsed = (session, mode) =>
    objectivesFor(mode).reduce((n, o) => n + ((session.objProgress[o.id] && session.objProgress[o.id].hintsUsed) || 0), 0);

  const firstTryMisses = (session, mode) =>
    objectivesFor(mode).filter((o) => {
      const p = session.objProgress[o.id];
      return p && p.done && !p.firstTry;
    }).length;

  const computeStars = (session, mode) => {
    const misses = firstTryMisses(session, mode);
    const hints = hintsUsed(session, mode);
    const raw = mode === 'medium' ? 5 - 0.4 * misses - 0.25 * hints : 5 - 0.6 * misses - 1.0 * hints;
    const clamped = Math.max(1, Math.min(5, raw));
    return Math.round(clamped * 2) / 2;
  };

  window.LabObjectives = {
    setEq, PILLAR_LABEL, OBJECTIVES, objectivesFor, objectiveById,
    quizFor, objectivesTotal, objectivesPassed, quizCorrect, quizCheckedCount,
    quizComplete, labComplete, computeScore, hintsUsed, firstTryMisses, computeStars,
  };
})();
