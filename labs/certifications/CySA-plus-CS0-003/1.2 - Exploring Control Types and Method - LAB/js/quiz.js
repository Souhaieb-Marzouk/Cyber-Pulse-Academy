/* ═══════════════════════════════════════════════════════════════════════════
   THE CONTROL GRID — js/quiz.js
   Knowledge check (C5): per-mode question pools, one-shot reveal, score
   screen. Same behavior as the original quiz component.
   ═══════════════════════════════════════════════════════════════════════════ */

"use strict";

(function () {
  var esc = CG.ui.esc;
  var icon = CG.ui.icon;
  var consoleLabel = CG.ui.consoleLabel;

  function questionsFor(mode) {
    return mode === "hard" ? CG.QUIZ_HARD : CG.QUIZ_MEDIUM;
  }

  function score(questions, quizState) {
    var n = 0;
    questions.forEach(function (q) {
      if (quizState.answers[q.id] === q.correct) n++;
    });
    return n;
  }

  /** Renders the quiz phase body (question card or score screen). */
  function render(mode, questions, quiz) {
    var total = questions.length;
    var idx = Math.min(quiz.idx, total - 1);
    var q = questions[idx];
    var revealed = !!quiz.revealed[q.id];
    var chosen = quiz.answers[q.id] || null;
    var sc = score(questions, quiz);

    if (quiz.done) {
      var pct = Math.round((sc / total) * 100);
      var msg =
        pct >= 85
          ? "Exam-ready recall. The grid is yours."
          : pct >= 60
            ? "Solid — revisit the debrief notes for the cells that wobbled."
            : "Worth a re-run through the field work — the grid rewards repetition.";
      var chips = questions
        .map(function (qq) {
          var ok = quiz.answers[qq.id] === qq.correct;
          return (
            '<span class="quiz-chip ' +
            (ok ? "ok" : "bad") +
            '" aria-label="Question ' +
            esc(qq.id) +
            ": " +
            (ok ? "correct" : "missed") +
            '">' +
            (ok ? "✓" : "✗") +
            "</span>"
          );
        })
        .join("");
      return (
        '<div class="quiz-wrap"><div class="quiz-card quiz-done-card">' +
        consoleLabel("knowledge check complete") +
        '<p class="quiz-score">' +
        sc +
        '<span class="quiz-score-total">/' +
        total +
        "</span></p>" +
        '<p class="quiz-verdict">' +
        msg +
        "</p>" +
        '<div class="quiz-chips">' +
        chips +
        "</div>" +
        '<button type="button" data-action="quiz-finish" class="btn btn-primary mt6">Go to field notes →</button>' +
        "</div></div>"
      );
    }

    var options = q.options
      .map(function (o) {
        var isSel = chosen === o.id;
        var isCorrect = o.id === q.correct;
        // R3 color contract: after CHECK, ONLY the selected option is
        // highlighted — green if it was correct, red if it was wrong. The
        // correct answer is never revealed in green on a wrong submission;
        // unselected options stay neutral.
        var showVerdict = revealed && isSel;
        var cls =
          showVerdict
            ? isCorrect
              ? "q-ok"
              : "q-bad"
            : isSel
              ? "v-sel"
              : "v-idle q-hover";
        if (revealed && !isSel) cls += " is-locked";
        var letter = String.fromCharCode(65 + q.options.indexOf(o));
        return (
          '<button type="button"' +
          // R2 hard lock: after CHECK the option loses its action hook entirely,
          // so no click path can re-pick it (pick() also refuses in state).
          (revealed ? "" : ' data-action="quiz-pick" data-arg="' + esc(o.id) + '"') +
          ' data-fk="q:' +
          esc(q.id) +
          ":" +
          esc(o.id) +
          '" aria-pressed="' +
          (isSel ? "true" : "false") +
          '"' +
          (revealed ? ' aria-disabled="true"' : "") +
          ' class="quiz-opt ' +
          cls +
          '">' +
          '<span class="quiz-letter" aria-hidden="true">' +
          letter +
          "</span>" +
          "<span>" +
          esc(o.label) +
          "</span>" +
          (showVerdict && isCorrect ? icon("circle-check-big", "icon-sm ok-icon") : "") +
          (showVerdict && !isCorrect ? icon("circle-x", "icon-sm bad-icon") : "") +
          "</button>"
        );
      })
      .join("");

    var explanation = revealed
      ? '<div class="quiz-explain" role="status" aria-live="polite">' +
        consoleLabel("explanation") +
        '<p class="quiz-explain-text">' +
        esc(q.explain) +
        "</p></div>"
      : "";

    var nextLabel = quiz.idx + 1 >= total ? "Finish check" : "Next question →";
    var progressPct = ((quiz.idx + (revealed ? 1 : 0)) / total) * 100;

    // R2 mechanics: selecting is free until CHECK is pressed; after CHECK the
    // answer locks (pick() refuses to overwrite) and only NEXT can proceed.
    var actions =
      '<div class="quiz-next">' +
      (!revealed
        ? '<button type="button" data-action="quiz-check" data-fk="quiz-check"' +
          (chosen ? "" : " disabled") +
          ' class="btn btn-primary">' +
          icon("scan-search", "icon-sm") +
          " Check answer</button>"
        : "") +
      '<button type="button" data-action="quiz-next"' +
      (revealed ? "" : " disabled") +
      ' class="btn btn-primary">' +
      nextLabel +
      "</button></div>";

    return (
      '<div class="quiz-wrap">' +
      '<div class="quiz-topline">' +
      consoleLabel("knowledge check · " + (mode === "hard" ? "scenario drill" : "concept drill")) +
      consoleLabel(quiz.idx + 1 + " / " + total) +
      "</div>" +
      '<div class="quiz-progress" role="presentation"><div class="quiz-progress-fill" style="width:' +
      progressPct +
      '%"></div></div>' +
      '<div class="quiz-card">' +
      '<p class="quiz-prompt">' +
      esc(q.prompt) +
      "</p>" +
      '<div class="stack-sm">' +
      options +
      "</div>" +
      explanation +
      actions +
      "</div></div>"
    );
  }

  /* ─── State transitions (same semantics as the original) ────────────────── */

  function currentQuestion(state) {
    var questions = questionsFor(state.mode);
    return questions[Math.min(state.quiz.idx, questions.length - 1)];
  }

  /** Selecting is free until CHECK is pressed — pick only records the answer. */
  function pick(state, optId) {
    var q = currentQuestion(state);
    if (state.quiz.revealed[q.id]) return; // answer locked after Check
    CG.state.update(function (s) {
      return Object.assign({}, s, {
        quiz: Object.assign({}, s.quiz, {
          answers: Object.assign({}, s.quiz.answers, (function () { var a = {}; a[q.id] = optId; return a; })()),
        }),
      });
    });
  }

  /** Check answer: reveals the verdict for the CURRENT question (needs a selection). */
  function check(state) {
    var q = currentQuestion(state);
    if (state.quiz.revealed[q.id] || !state.quiz.answers[q.id]) return; // no selection → no reveal (R3)
    CG.state.update(function (s) {
      return Object.assign({}, s, {
        quiz: Object.assign({}, s.quiz, {
          revealed: Object.assign({}, s.quiz.revealed, (function () { var r = {}; r[q.id] = true; return r; })()),
        }),
      });
    });
  }

  function next(state) {
    var questions = questionsFor(state.mode);
    var total = questions.length;
    var q = currentQuestion(state);
    if (!state.quiz.revealed[q.id]) return; // next-question enforcement (R2)
    CG.state.update(function (s) {
      if (s.quiz.idx + 1 >= total) {
        return Object.assign({}, s, { quiz: Object.assign({}, s.quiz, { idx: total - 1, done: true }) });
      }
      return Object.assign({}, s, { quiz: Object.assign({}, s.quiz, { idx: s.quiz.idx + 1 }) });
    });
  }

  CG.quiz = {
    questionsFor: questionsFor,
    score: score,
    render: render,
    pick: pick,
    check: check,
    next: next,
  };
})();
