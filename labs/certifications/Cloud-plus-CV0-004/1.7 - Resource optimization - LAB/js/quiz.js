/* ==========================================================================
   NIMBUS TOWER — js/quiz.js
   Pure helpers for the debrief quiz contract (R2/R3 parity):
   - medium: per-question CHECK locks the item; submit is implicit once all
     items are checked; validation NEVER happens on answering itself.
   - hard: nothing reveals until the single submit; everything locks after.
   - only the SELECTED option is ever colored after validation.
   ========================================================================== */
(function (root) {
  'use strict';

  var LAB = root.LAB;

  LAB.quiz = {
    bank: function (mode) { return mode === 'medium' ? LAB.QUIZ.medium : LAB.QUIZ.hard; },

    answeredAll: function (mode, quiz) {
      var qs = LAB.quiz.bank(mode);
      return qs.every(function (_, i) { return quiz.answers[i] !== undefined; });
    },

    checkedAll: function (mode, quiz) {
      var qs = LAB.quiz.bank(mode);
      return qs.every(function (_, i) { return quiz.checked[i] === true; });
    },

    /* reveal rule: medium reveals per-question on CHECK; hard only after whole-quiz submit. */
    revealed: function (mode, quiz, qi) {
      return mode === 'hard' ? quiz.submitted : quiz.checked[qi] === true;
    },

    /* lock rule mirrors the reveal rule; state-level guards also refuse writes. */
    locked: function (mode, quiz, qi) {
      return mode === 'hard' ? quiz.submitted : quiz.checked[qi] === true;
    },

    correctCount: function (mode, quiz) {
      var qs = LAB.quiz.bank(mode);
      return qs.reduce(function (acc, q, i) { return acc + (quiz.answers[i] === q.answer ? 1 : 0); }, 0);
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
