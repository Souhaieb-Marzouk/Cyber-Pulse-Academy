// Northwind Hardening Yard - gate exam (quiz) helpers (static port).
// Scoring lives here; rendering lives in ui.js.
'use strict';

(function () {
  var DATA = window.LAB_DATA;

  function quizItems(mode) {
    return DATA.QUIZZES[mode] || [];
  }

  function answeredCount(items, quizAnswers) {
    return items.filter(function (q) {
      return quizAnswers[q.id];
    }).length;
  }

  function correctCount(items, quizAnswers) {
    return items.filter(function (q) {
      return quizAnswers[q.id] === q.answer;
    }).length;
  }

  window.LabQuiz = {
    quizItems: quizItems,
    answeredCount: answeredCount,
    correctCount: correctCount,
  };
})();
