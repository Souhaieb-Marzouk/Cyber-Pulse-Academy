// ── quiz.js — Sheet 05 · Commissioning Exam (C5 Knowledge Check) ─────────────
// Rendering + submit logic. The quiz bank itself lives in js/data.js.
// R3 contract preserved: after submission ONLY the selected answer is
// highlighted — green when right, red when wrong; the correct option is never
// revealed on a wrong submission.
"use strict";

var U = window.LabUI;
var D = window.LabData;
var Store = window.LabStore;

function sheetExam() {
  var s = Store.state;
  var hard = s.mode === "hard";
  var questions = hard ? D.QUIZ_HARD : D.QUIZ_MEDIUM;
  var selections = s.answers["QUIZ"] || {};
  var submitted = s.quizSubmitted;
  var readyToSubmit = questions.every(function (q) { return selections[q.id] !== undefined; });
  var recommended = Store.progress().allPassed;
  var quizStats = Store.quizStats();

  var items = questions.map(function (q, qi) {
    var picked = selections[q.id] !== undefined ? Number(selections[q.id]) : null;
    var scenario = q.scenario
      ? '<p class="exam-scenario">' + esc(q.scenario) + "</p>"
      : "";
    var opts = q.options.map(function (opt, oi) {
      var isPicked = picked === oi;
      var isRight = oi === q.answer;
      var pickedRight = submitted && isPicked && isRight;
      var pickedWrong = submitted && isPicked && !isRight;
      var cls = "exam-opt";
      if (pickedRight) cls += " opt-right";
      else if (pickedWrong) cls += " opt-wrong";
      else if (isPicked) cls += " opt-picked";
      return '<label class="' + cls + (submitted ? " locked" : "") + '">' +
        '<input type="radio" name="' + q.id + '" value="' + oi + '"' + (isPicked ? " checked" : "") +
        (submitted ? " disabled" : "") + ' data-chg="quiz:' + q.id + '" aria-label="' + esc(opt) + '">' +
        "<span>" + esc(opt) +
        (pickedRight ? '<span class="lab-mono opt-verdict verdict-right">✓ YOUR ANSWER — CORRECT</span>' : "") +
        (pickedWrong ? '<span class="lab-mono opt-verdict verdict-wrong">✗ YOUR ANSWER — INCORRECT</span>' : "") +
        "</span></label>";
    }).join("");
    var why = submitted
      ? '<p class="exam-why"><span class="lab-mono why-label">WHY:</span>' + esc(q.why) + "</p>"
      : "";
    return '<li class="lab-sheet pad-4 exam-item">' +
      '<p class="lab-kicker">QUESTION ' + (qi + 1) + " OF " + questions.length + "</p>" +
      scenario +
      '<h2 class="exam-q">' + esc(q.q) + "</h2>" +
      '<div class="exam-opts" role="radiogroup" aria-label="' + esc(q.q) + '">' + opts + "</div>" +
      why +
      "</li>";
  }).join("");

  var submitArea = "";
  if (!submitted) {
    submitArea = '<div class="lab-sheet exam-submit-row">' +
      '<button type="button" id="exam-submit" class="btn btn-signal btn-lg" data-act="exam-submit" data-fkey="exam-submit"' +
      (readyToSubmit ? "" : " disabled") + ">SUBMIT COMMISSIONING EXAM</button>" +
      '<span class="exam-hint" id="exam-hint"' + (readyToSubmit ? ' hidden' : "") + ">Answer every question to submit — there is no penalty for guessing, only for not knowing why.</span>" +
      "</div>";
  }

  var scoredLine = "";
  if (submitted) {
    scoredLine = '<p class="lab-mono scored-line">SCORED: ' + quizStats.correct + "/" + quizStats.total + " — CORRECT</p>";
  }

  var headText = hard
    ? "Seven scenarios from the field. Every question demands application: read the evidence, pick the defensible answer. Explanations appear after you submit."
    : "Seven concept questions on the lesson's core. Pick an answer for each — the explanation appears for every option once you submit, right or wrong.";
  if (!recommended) headText += " (Recommended after the checklist is stamped — but the exam accepts you anytime.)";

  return '<div class="container-md stack">' +
    '<header class="lab-sheet pad-5">' +
    '<p class="lab-kicker">Sheet 05 · Commissioning Exam</p>' +
    '<h1 class="lab-mono sheet-h1 exam-h1">' + U.icon("pen-line", 20, "text-signal") + " " + (hard ? "Scenario-based commissioning exam" : "Concept check") + "</h1>" +
    '<p class="sheet-sub">' + headText + "</p>" +
    scoredLine +
    "</header>" +
    '<ol class="obj-list">' + items + "</ol>" +
    submitArea +
    "</div>";
}

// Submit handler (identical announcement + scoring)
function submitExam() {
  var s = Store.state;
  var hard = s.mode === "hard";
  var selections = s.answers["QUIZ"] || {};
  var answers = {};
  Object.keys(selections).forEach(function (k) { answers[k] = Number(selections[k]); });
  Store.dispatch({ type: "SUBMIT_QUIZ", answers: answers });
  var list = hard ? D.QUIZ_HARD : D.QUIZ_MEDIUM;
  var correct = list.filter(function (q) { return Number(selections[q.id]) === q.answer; }).length;
  U.announce("Exam submitted. Score: " + correct + " out of " + list.length + ". Explanations are now visible on every question.");
}

window.LabQuiz = { sheetExam: sheetExam, submitExam: submitExam };
