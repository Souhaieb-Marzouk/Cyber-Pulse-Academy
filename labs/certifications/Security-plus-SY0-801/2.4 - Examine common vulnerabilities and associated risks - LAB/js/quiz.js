/**
 * Knowledge Check — quiz modal (static port).
 *
 * Source: src/components/lab/KnowledgeCheck.tsx (149 lines).
 *
 * Audit-fix behaviors:
 *   R2 (answer lock): once a quiz answer is recorded, that option button is
 *     disabled and cannot be re-picked. The per-question Retry button
 *     (visible only when !quiz.completed) clears the locked answer.
 *   R3 (only-selected highlighting): picked-correct → green ONLY on that
 *     option; picked-wrong → red ONLY on that option. The correct answer is
 *     NOT revealed in green when the student picked wrong. Unpicked options
 *     stay neutral.
 *   R4 (position rotation) + R5 (length discipline): options are rendered
 *     in the order authored in Data.QUIZ_MEDIUM / Data.QUIZ_HARD — which
 *     already carries the post-fix answer positions and option lengths.
 *
 * Exposed on the global Lab namespace as Lab.Quiz.
 */
(function (global) {
  "use strict";

  var Lab = global.Lab || (global.Lab = {});
  var Data = Lab.Data;
  var Store = Lab.Store;
  var Quiz = (Lab.Quiz = {});

  // UI helpers are looked up lazily because quiz.js loads BEFORE ui.js in the
  // script order required by the spec (data → cvss → state → objectives →
  // quiz → ui → app). At IIFE-eval time Lab.UI is still undefined; by the
  // time Quiz.renderQuizModal is actually called (post-app-bootstrap),
  // Lab.UI exists and exposes escapeHtml + icon.
  function escapeHtml(s) { return Lab.UI.escapeHtml(s); }
  function icon(name, size) { return Lab.UI.icon(name, size); }

  /**
   * Renders the full quiz modal (overlay + dialog + questions + footer).
   * @param {string} mode "medium" | "hard"
   */
  Quiz.renderQuizModal = function (mode) {
    var questions = Data.quizForMode(mode);
    var answers = Store.quiz.answers;
    var completed = Store.quiz.completed;

    var answered = questions.filter(function (q) { return answers[q.id] !== undefined; }).length;
    var correct = questions.filter(function (q) { return answers[q.id] === q.answer; }).length;
    var allAnswered = answered === questions.length;

    var questionsHtml = questions
      .map(function (q, qi) {
        var picked = answers[q.id];
        var isLocked = picked !== undefined;

        var optionsHtml = q.options
          .map(function (opt, oi) {
            var isPicked = picked === oi;
            var isAnswer = oi === q.answer;
            // R3: ONLY the selected option gets color.
            //   - picked-correct → green on that option only.
            //   - picked-wrong → red on that option only.
            //   - correct answer is NOT revealed in green on wrong pick.
            //   - unpicked options stay neutral.
            var showGreen = isLocked && isPicked && isAnswer;
            var showRed = isLocked && isPicked && !isAnswer;
            var cls = "quiz-option";
            if (!isLocked) cls += " open";
            if (showGreen) cls += " correct";
            if (showRed) cls += " wrong";
            if (isLocked && !isPicked) cls += " muted";

            var label =
              "Option " + String.fromCharCode(65 + oi) + ": " + opt +
              (showGreen ? " (correct, you picked this)" : showRed ? " (your answer, incorrect)" : "");

            var iconHtml = showGreen ? icon("check_circle", 16) : icon("circle_dot", 16);
            var letter = String.fromCharCode(65 + oi);

            return (
              '<button type="button" class="' + cls + '"' +
              (isLocked || completed ? " disabled" : "") +
              ' data-action="pick-quiz" data-qid="' + escapeHtml(q.id) + '" data-idx="' + oi + '"' +
              ' aria-pressed="' + isPicked + '" aria-label="' + escapeHtml(label) + '">' +
              '<span class="quiz-option-icon">' + iconHtml + "</span>" +
              '<span class="quiz-option-letter mono">' + letter + "</span>" +
              "<span>" + escapeHtml(opt) + "</span>" +
              "</button>"
            );
          })
          .join("");

        var explanationHtml = "";
        if (isLocked) {
          explanationHtml =
            '<div class="quiz-explanation-row">' +
              '<p class="quiz-explanation"><span class="quiz-explanation-label accent">Explanation: </span>' +
              escapeHtml(q.explanation) + "</p>" +
              (!completed
                ? '<button type="button" class="quiz-retry" data-action="retry-quiz" data-qid="' + escapeHtml(q.id) + '" aria-label="Retry question ' + (qi + 1) + '">' +
                  icon("rotate_ccw", 12) + " Retry</button>"
                : "") +
            "</div>";
        }

        return (
          '<div class="quiz-question">' +
            '<p class="quiz-prompt"><span class="mono accent">Q' + (qi + 1) + ".</span> " + escapeHtml(q.prompt) + "</p>" +
            '<div class="quiz-options">' + optionsHtml + "</div>" +
            explanationHtml +
          "</div>"
        );
      })
      .join("");

    return (
      '<div class="modal-overlay" data-action="close-quiz"></div>' +
      '<div class="modal lab-scroll quiz-modal" role="dialog" aria-modal="true" aria-labelledby="quiz-title">' +
        '<button type="button" class="modal-close" data-action="close-quiz" aria-label="Close quiz">' + icon("x", 20) + "</button>" +
        '<div class="modal-head">' +
          '<h2 class="modal-title" id="quiz-title"><span class="accent">' + icon("brain", 16) +
          "</span> Knowledge Check — " + (mode === "medium" ? "Medium" : "Hard") + "</h2>" +
          '<p class="modal-sub">' + answered + "/" + questions.length + " answered · " + correct + " correct. Pick an " +
          "option to lock your answer and see the explanation. Use Retry to clear a locked answer before finishing.</p>" +
        "</div>" +
        '<div class="modal-body quiz-body">' + questionsHtml + "</div>" +
        '<div class="modal-footer">' +
          '<button type="button" class="btn-outline" data-action="close-quiz">Close</button>' +
          '<button type="button" class="btn-primary" data-action="finish-quiz"' +
          (!allAnswered || completed ? " disabled" : "") + ">" +
          (completed ? "Completed" : "Finish quiz") + "</button>" +
        "</div>" +
      "</div>"
    );
  };
})(typeof window !== "undefined" ? window : globalThis);
