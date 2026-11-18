/* ═══════════════════════════════════════════════════════════════════════════
   objectives.js — CHECK RESULTS engine: scoring, stars, focus areas.
   Mirrors computeScore / computeStars / deriveFocusAreas from the original
   (src/lib/lab/state.ts + CompletionModal.tsx). Validation rules themselves
   live with each objective in data.js — the engine calls obj.validate(env).
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";

function computeScore(state, objectives) {
  const passed = objectives.filter((o) => state.obj[o.id]?.passed).length;
  const quizItems = state.mode ? QUIZ[state.mode] : [];
  // only CHECKED (locked) items count toward the score — unchecked picks never leak results
  const correct = quizItems.filter((q) => state.quiz.checked?.[q.id] && state.quiz.answers[q.id] === q.correct).length;
  const total = objectives.length + quizItems.length;
  const score = total === 0 ? 0 : Math.round(((passed + correct) / total) * 100);
  const allPassed = objectives.length > 0 && passed === objectives.length;
  const quizGraded = state.quiz.graded;
  return {
    passed,
    objTotal: objectives.length,
    correct,
    quizTotal: quizItems.length,
    score,
    allPassed,
    quizGraded,
    complete: allPassed && quizGraded,
  };
}

function computeStars(state, objectives) {
  let extraAttempts = 0;
  let hints = 0;
  let firstTryAll = true;
  for (const o of objectives) {
    const p = state.obj[o.id];
    if (!p) continue;
    hints += p.hintsUsed;
    if (p.passed) {
      if (p.attempts > 1) {
        extraAttempts += p.attempts - 1;
        firstTryAll = false;
      }
    }
  }
  if (hints === 0 && extraAttempts === 0 && firstTryAll) return 3;
  if (hints <= 2 && extraAttempts <= 3) return 2;
  return 1;
}

// R8: focus areas derived from the student's ACTUAL evidence — wrong exam items,
// objectives that needed retries, and objectives that needed hints — never generic filler.
function deriveFocusAreas(state, objectives) {
  const areas = [];
  const quizItems = state.mode ? QUIZ[state.mode] : [];
  quizItems.forEach((q, i) => {
    const picked = state.quiz.answers[q.id];
    if (state.quiz.checked?.[q.id] && picked !== q.correct) {
      areas.push({
        title: `Board exam item ${i + 1} — ${q.scenario.split(".")[0]}`,
        detail: `Answered wrong. Study: ${q.explanation}`,
      });
    }
  });
  for (const o of objectives) {
    const p = state.obj[o.id];
    if (!p?.passed) continue;
    const bits = [];
    if (p.attempts > 1) bits.push(`took ${p.attempts} checks`);
    if (p.hintsUsed > 0) bits.push(`used ${p.hintsUsed} hint${p.hintsUsed > 1 ? "s" : ""}`);
    if (bits.length > 0) {
      areas.push({
        title: `${o.id} — ${o.title}`,
        detail: `Passed, but ${bits.join(" and ")}. Revisit the underlying idea before the exam: ${o.anchor.split(";")[0]}.`,
      });
    }
  }
  return areas.slice(0, 7);
}
