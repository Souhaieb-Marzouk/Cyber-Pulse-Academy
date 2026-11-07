/* =========================================================================
   The Engagement Desk — static port (js/quiz.js)
   -------------------------------------------------------------------------
   Competency Review (sequential format) — faithful port of Quiz.tsx:
   - one question at a time; the validating button locks the chosen answer;
     the only forward path is "Next question" (audit R2)
   - color contract (audit R3): after a check ONLY the picked option is
     highlighted — green when correct, red when wrong; the correct answer is
     never revealed in green on a wrong submission
   - resume lands on the first unchecked item (checked items are final)
   ========================================================================= */

(function () {
  "use strict";

  var D = window.LabData;
  var S = window.LabState;
  var U = window.LabUI;

  // Local view state (original: useState inside the Quiz component, reset on
  // every mount = every entry into the review stage).
  var viewOverride = null;

  function resetView() {
    viewOverride = null;
  }

  function setView(v) {
    viewOverride = v;
  }

  function currentView(s) {
    var questions = D.QUIZ[s.mode];
    var firstUnchecked = -1;
    for (var i = 0; i < questions.length; i++) {
      if (!s.quiz.checked[questions[i].id]) {
        firstUnchecked = i;
        break;
      }
    }
    var baseView = firstUnchecked === -1 ? questions.length - 1 : firstUnchecked;
    return viewOverride === null ? baseView : Math.min(viewOverride, baseView);
  }

  function currentQuestion(s) {
    return D.QUIZ[s.mode][currentView(s)];
  }

  function view(s) {
    var mode = s.mode;
    var questions = D.QUIZ[mode];
    var QC = D.QUIZ_COPY;

    var checkedCount = 0;
    var score = 0;
    for (var i = 0; i < questions.length; i++) {
      if (s.quiz.checked[questions[i].id]) {
        checkedCount++;
        if (s.quiz.answers[questions[i].id] === questions[i].answer) score++;
      }
    }
    var allChecked = checkedCount === questions.length;
    var view_ = currentView(s);
    var q = questions[view_];
    var answered = s.quiz.answers[q.id];
    var checked = !!s.quiz.checked[q.id];
    var correct = checked && answered === q.answer;
    var isLast = view_ === questions.length - 1;

    var options = "";
    for (var o = 0; o < q.options.length; o++) {
      var opt = q.options[o];
      var isPicked = answered === opt.id;
      var stateCls = !checked
        ? isPicked ? " chip-on" : ""
        : isPicked
          ? correct ? " quiz-correct" : " quiz-wrong"
          : " quiz-dim";
      options +=
        '<button type="button" role="radio" aria-checked="' + isPicked + '" data-act="quiz-pick" data-qid="' + q.id +
        '" data-oid="' + opt.id + '" class="quiz-opt' + stateCls + '"' + (checked ? " disabled" : "") + ">" +
        '<span class="quiz-opt-id">' + opt.id.toUpperCase() + "</span>" + U.esc(opt.text) +
        (checked && isPicked
          ? '<span class="quiz-stamp ' + (correct ? "text-green" : "text-red") + '">' + (correct ? QC.yourAnswerOk : QC.yourAnswerNo) + "</span>"
          : "") +
        "</button>";
    }

    var control;
    if (!checked) {
      control =
        '<button type="button" data-act="quiz-check" class="btn btn-primary btn-sm"' + (!answered ? " disabled" : "") + ">" +
        QC.check + "</button>";
    } else {
      control =
        '<div class="quiz-expl" aria-live="polite"><strong>' + (correct ? QC.whyRight : QC.whyRemember) + "</strong>" +
        U.esc(q.explanation) + "</div>" +
        (isLast
          ? '<p class="quiz-last">' + U.icon("ic-lock", "ic-tight") + " " + QC.lastItem + "</p>"
          : '<button type="button" data-act="quiz-next" class="btn btn-primary btn-sm quiz-next">' + QC.next + " " + U.icon("ic-arrow-right") + "</button>");
    }

    return (
      '<main class="stage-quiz stage-enter">' +
      U.sectionTitle(QC.kicker, mode === "hard" ? QC.titleHard : QC.titleMedium, mode === "hard" ? QC.subHard : QC.subMedium) +
      '<div class="quiz-meta">' +
      '<p class="mono-xs" aria-live="polite">' + QC.question + " " + (view_ + 1) + "/" + questions.length + " · " + QC.checked + " " + checkedCount + " · " + QC.correctLabel + " " + score + "</p>" +
      (s.quiz.completed ? '<p class="quiz-sealed">' + QC.reviewSealed + " " + S.computeProgress(s).quizPct + "%</p>" : "") +
      "</div>" +
      '<article class="quiz-card" aria-label="Question ' + (view_ + 1) + " of " + questions.length + '">' +
      '<div class="quiz-card-top"><p class="kicker-sm">Q' + (view_ + 1) + " " + (q.scenario ? "· " + QC.scenario : "· " + QC.concept) + "</p>" +
      (checked
        ? correct
          ? '<span class="quiz-verdict text-green">' + U.icon("ic-check-circle-2", "ic-tight") + " " + QC.correct + "</span>"
          : '<span class="quiz-verdict text-red">' + U.icon("ic-circle-x", "ic-tight") + " " + QC.incorrect + "</span>"
        : "") +
      "</div>" +
      (q.scenario ? '<p class="quiz-scenario">' + U.esc(q.scenario) + "</p>" : "") +
      '<p class="panel-q">' + U.esc(q.prompt) + "</p>" +
      '<div role="radiogroup" aria-label="Answers for question ' + (view_ + 1) + '" class="stack-2">' + options + "</div>" +
      control +
      "</article>" +
      '<div class="quiz-seal-row"><p class="quiz-seal-note">' + (allChecked ? QC.allChecked : QC.notAll) + "</p>" +
      '<button type="button" data-act="quiz-seal" class="btn btn-primary btn-lg btn-cta"' + (!allChecked ? " disabled" : "") + ">" +
      (s.quiz.completed ? QC.sealed : QC.seal) + " " + U.icon("ic-arrow-right") + "</button></div>" +
      (!allChecked ? '<p class="quiz-locknote">' + U.icon("ic-lock", "ic-tight") + " " + QC.lockedNote + "</p>" : "") +
      "</main>"
    );
  }

  window.LabQuiz = {
    view: view,
    resetView: resetView,
    setView: setView,
    currentView: currentView,
    currentQuestion: currentQuestion,
  };
})();
