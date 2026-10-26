// ─── CyberLab · js/quiz.js ────────────────────────────────────────────────
// Knowledge-check helpers — port of the quiz logic in
// src/components/lab/ir/aar.tsx (QuizSection) + the banks live in data.js.

window.LAB = window.LAB || {};
(function (LAB) {
  'use strict';

  function bank(mode) {
    return mode === 'medium' ? LAB.QUIZ_M : LAB.QUIZ_H;
  }

  function answeredCount(s) {
    var b = bank(s.mode);
    var n = 0;
    for (var i = 0; i < b.length; i++) if (s.quizAnswers[b[i].id] !== undefined) n++;
    return n;
  }

  /** Score = number of questions whose chosen option is the correct one.
   *  (Same computation as the original submit handler.) */
  function score(s) {
    var b = bank(s.mode);
    var n = 0;
    for (var i = 0; i < b.length; i++) {
      var chosen = s.quizAnswers[b[i].id];
      if (chosen !== undefined && b[i].options[chosen] && b[i].options[chosen].correct) n++;
    }
    return n;
  }

  /** Verdict chip copy under a submitted quiz (same thresholds/copy). */
  function verdict(sc, total) {
    return sc === total ? 'FLAWLESS' : sc >= total * 0.7 ? 'SHIP-SHAPE' : 'REVIEW THE DECK';
  }

  LAB.quiz = {
    bank: bank,
    answeredCount: answeredCount,
    score: score,
    verdict: verdict,
  };
})(window.LAB);
