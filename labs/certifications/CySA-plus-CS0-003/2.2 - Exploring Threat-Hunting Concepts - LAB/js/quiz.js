// ─── Threat Hunt Expedition — FIELD EXAM (block C5) ──────────────────────────
// One-shot quiz console: once answered, the option set locks and the "Why"
// feedback unlocks. Verbatim questions/options/explanations from data.js.

window.HuntQuiz = (function () {
  "use strict";

  var UI = window.HuntUI;
  var esc = UI.esc;
  var icon = UI.icon;

  /** Supportive on Guided Patrol, dry and brief on Deep Range. */
  var TONE_LINE = {
    correct: {
      medium: "Logged. That is a pattern worth keeping in the satchel.",
      hard: "Logged. Keep moving.",
    },
    wrong: {
      medium: "Wrong answers teach — skim the matching manual chapter and carry on.",
      hard: "Noted. The reasoning above is the takeaway.",
    },
  };

  function quizFor(mode) {
    return mode === "hard" ? window.HuntData.quizHard : window.HuntData.quizMedium;
  }

  function oneCard(q, index, mode, chosen) {
    var locked = chosen !== undefined && chosen !== null;
    var wasCorrect = chosen === q.correct;

    var optionsHtml = q.options
      .map(function (opt, oi) {
        // R3 color contract: after Check, ONLY the selected answer is
        // highlighted — green when it was correct, red when it was wrong.
        // The correct option is NEVER revealed in green (nor by icon or
        // screen-reader text) on a wrong submission; the "Why" feedback
        // below still teaches the reasoning behind the right answer.
        var isChosen = chosen === oi;
        var chosenIsCorrect = locked && isChosen && chosen === q.correct;
        var optCls = "opt";
        var dotCls = "";
        if (locked) {
          if (isChosen && chosenIsCorrect) { optCls = "opt opt-correct"; dotCls = " dot-correct"; }
          else if (isChosen) { optCls = "opt opt-chosen-wrong"; dotCls = " dot-wrong"; }
          else { optCls = "opt opt-dim"; dotCls = " dot-dim"; }
        }
        var sr = "";
        if (chosenIsCorrect) {
          sr = '<span class="sr-only"> — correct, your answer</span>';
        } else if (locked && isChosen && !chosenIsCorrect) {
          sr = '<span class="sr-only"> — your answer, incorrect</span>';
        }
        return (
          '<button type="button" class="' + optCls + '" data-action="quiz-answer" data-q="' + esc(q.id) +
          '" data-index="' + oi + '" aria-pressed="' + (isChosen ? "true" : "false") + '"' + (locked ? " disabled" : "") + ">" +
          '<span class="opt-dot' + dotCls + '" aria-hidden="true"></span>' +
          '<span class="opt-text">' + esc(opt) + "</span>" +
          (chosenIsCorrect ? '<span class="opt-mark" aria-hidden="true">' + icon("check", "h-4 w-4 mark-lime") + "</span>" : "") +
          (locked && isChosen && !chosenIsCorrect ? '<span class="opt-mark" aria-hidden="true">' + icon("x", "h-4 w-4 mark-rose") + "</span>" : "") +
          sr +
          "</button>"
        );
      })
      .join("");

    var evidenceHtml = q.scenario
      ? '<div class="quiz-evidence"><p class="quiz-evidence-label">' + icon("file-search", "h-3.5 w-3.5") +
        ' Evidence</p><p class="quiz-evidence-body">' + esc(q.scenario) + "</p></div>"
      : "";

    var feedbackHtml = locked
      ? '<div class="quiz-feedback ' + (wasCorrect ? "fb-correct" : "fb-wrong") + '" role="status" aria-live="polite">' +
        '<p class="fb-head"><span class="' + (wasCorrect ? "fb-lime" : "fb-rose") + '">' + (wasCorrect ? "Correct" : "Missed") +
        '</span><span class="fb-why"> · Why:</span></p>' +
        '<p class="fb-body">' + esc(q.explanation) + "</p>" +
        '<p class="fb-tone">' + TONE_LINE[wasCorrect ? "correct" : "wrong"][mode] + "</p></div>"
      : "";

    return (
      '<li class="quiz-item" id="quiz-item-' + esc(q.id) + '">' +
      '<section class="panel quiz-card" aria-labelledby="quiz-' + esc(q.id) + '">' +
      '<div class="quiz-card-head"><span class="quiz-qnum">Q' + String(index + 1).padStart(2, "0") + "</span>" +
      UI.dataLabel(mode === "hard" ? "Deep Range · scenario item" : "Guided Patrol · concept check") +
      "</div>" +
      '<h2 class="quiz-prompt" id="quiz-' + esc(q.id) + '">' + esc(q.prompt) + "</h2>" +
      evidenceHtml +
      '<div role="group" aria-labelledby="quiz-' + esc(q.id) + '" class="quiz-options">' + optionsHtml + "</div>" +
      feedbackHtml +
      "</section></li>"
    );
  }

  /** Full quiz phase view. */
  function view(mode, answers) {
    var quiz = quizFor(mode);
    var answeredCount = quiz.filter(function (q) { return answers[q.id] !== undefined; }).length;
    var correctCount = quiz.filter(function (q) { return answers[q.id] === q.correct; }).length;
    var allDone = answeredCount === quiz.length;

    var cards = quiz
      .map(function (q, i) {
        return oneCard(q, i, mode, answers[q.id]);
      })
      .join("");

    return (
      '<div class="container-quiz" aria-label="Field exam">' +
      '<header class="quiz-header">' +
      '<div class="quiz-header-top"><p class="kicker-block">Block C5 · Assessment</p>' +
      '<p class="route-label">' + (mode === "hard" ? "Route: Deep Range" : "Route: Guided Patrol") + "</p></div>" +
      '<h1 class="page-title exam-title">FIELD EXAM</h1>' +
      '<p class="exam-sub">Answer everything; explanations unlock as you go.</p>' +
      '<p class="exam-score" aria-live="polite"><span class="amber-txt" id="quiz-count">' + answeredCount + " / " + quiz.length +
      '</span> answered · <span class="lime-txt" id="quiz-correct">' + correctCount + "</span> correct</p>" +
      "</header>" +
      '<ol class="quiz-list">' + cards + "</ol>" +
      '<div class="quiz-sticky"><div class="panel quiz-summary">' +
      '<div class="quiz-summary-left"><p class="quiz-summary-count"><span class="amber-txt">' + answeredCount + " / " + quiz.length +
      '</span> answered · <span class="lime-txt">' + correctCount + '</span> correct</p>' +
      '<div class="quiz-track"><div class="quiz-bar" id="quiz-bar" style="width:' +
      (quiz.length ? (answeredCount / quiz.length) * 100 : 0) + '%"></div></div></div>' +
      '<button type="button" class="btn btn-primary btn-continue" id="quiz-continue" data-action="quiz-continue"' +
      (allDone ? "" : " disabled") + ">" + (allDone ? "Continue to debrief" : "Answer all to continue") + "</button>" +
      "</div></div></div>"
    );
  }

  /** After an answer: surgically update the card, counters, bar and button. */
  function syncAfterAnswer(qid, answers, mode) {
    var quiz = quizFor(mode);
    var q = quiz.filter(function (x) { return x.id === qid; })[0];
    var index = quiz.indexOf(q);
    var old = document.getElementById("quiz-item-" + qid);
    if (old) {
      var fresh = UI.h(oneCard(q, index, mode, answers[q.id]));
      // retrigger the entrance-free swap: keep layout stable
      old.replaceWith(fresh);
    }
    var answeredCount = quiz.filter(function (x) { return answers[x.id] !== undefined; }).length;
    var correctCount = quiz.filter(function (x) { return answers[x.id] === x.correct; }).length;
    var allDone = answeredCount === quiz.length;

    var count = document.getElementById("quiz-count");
    var correct = document.getElementById("quiz-correct");
    var bar = document.getElementById("quiz-bar");
    var btn = document.getElementById("quiz-continue");
    if (count) count.textContent = answeredCount + " / " + quiz.length;
    if (correct) correct.textContent = String(correctCount);
    if (bar) bar.style.width = (quiz.length ? (answeredCount / quiz.length) * 100 : 0) + "%";
    if (btn) {
      btn.disabled = !allDone;
      btn.textContent = allDone ? "Continue to debrief" : "Answer all to continue";
    }
    // sticky bar counters (query inside the sticky summary)
    var sticky = document.querySelector(".quiz-summary-count");
    if (sticky) {
      sticky.innerHTML =
        '<span class="amber-txt">' + answeredCount + " / " + quiz.length + '</span> answered · <span class="lime-txt">' + correctCount + "</span> correct";
    }
    var headScore = document.getElementById("quiz-correct");
    if (headScore) headScore.textContent = String(correctCount);
  }

  return {
    view: view,
    syncAfterAnswer: syncAfterAnswer,
    quizFor: quizFor,
  };
})();
