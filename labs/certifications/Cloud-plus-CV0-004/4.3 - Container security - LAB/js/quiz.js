// HARBOR-7 — Customs Inspection (knowledge check) helpers.
// Static port note: the quiz contract (R2/R3/QA-D10) lives in state.js actions and
// ui.js rendering; this module centralizes the bank access + sequencing rules so
// the contract is readable in one place.

/** The question bank for a mode (6 medium concepts / 7 hard scenarios). */
function quizFor(mode) {
  return mode === "hard" ? QUIZ_HARD : QUIZ_MEDIUM;
}

/**
 * Sequential enforcement: a question unlocks only after every earlier one is checked.
 * Returns the index of the first unchecked question, or -1 when all are checked.
 */
function firstUncheckedIndex(questions, quiz) {
  return questions.findIndex((q) => !quiz.checked[q.id]);
}

/** A question is unlocked when every earlier question has been validated. */
function isQuestionUnlocked(qi, questions, quiz) {
  const first = firstUncheckedIndex(questions, quiz);
  return qi <= first || (first === -1 && qi < questions.length);
}
