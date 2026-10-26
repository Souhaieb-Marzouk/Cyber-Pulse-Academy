/**
 * Knowledge Check annex — vanilla port of src/components/lab/quiz.tsx.
 *
 * Color contract (identical to the original):
 *  - the student's correct pick  → green highlight + check icon
 *  - the student's wrong pick    → red highlight only, X icon
 *  - the correct answer is NEVER revealed in green on a wrong submission
 *  - Retry clears all color states (practice attempt); the filed score is
 *    recorded at the FIRST submission and never overwritten.
 */

var LabQuiz = (function () {
  var U = LabUI;

  function render(mode, root) {
    var questions = mode === 'hard' ? QUIZ_HARD : QUIZ_MEDIUM;
    var state = LabStore.getState();
    var answers = state.quizAnswers;
    var submitted = state.quizSubmitted;
    var practice = state.quizPractice;
    var filedScore = state.quizFiledScore;
    var grading = submitted && !practice;
    var answered = questions.filter(function (q) { return answers[q.id] !== undefined; }).length;

    /* Filed score never changes after the first submission. */
    var filedPct = filedScore !== null && filedScore !== undefined
      ? Math.round(filedScore * 100)
      : submitted ? Math.round(LabEngine.quizScore(state) * 100) : null;
    var practicePct = submitted && practice ? Math.round(LabEngine.computeQuizScore(state) * 100) : null;

    var el = document.createElement('section');
    el.className = 'section-shell view-anim';
    el.setAttribute('aria-labelledby', 'quiz-title');

    /* header ---------------------------------------------------------- */
    var headerRight = submitted
      ? U.stamp({ tone: (filedPct || 0) >= 60 ? 'pass' : 'fail', label: filedPct + '% · Filed' })
      : '';

    var statusLine = '';
    if (grading) {
      statusLine = '<p class="mono-note">Filed ' + filedPct + '% — the annex keeps this first-filing score. Retry for practice below.</p>';
    }

    el.innerHTML =
      '<header class="sec-header">' +
        '<div class="sec-header-top">' +
          '<span class="sec-icon mono-icon" aria-hidden="true">KC</span>' +
          '<div class="sec-title-wrap">' +
            '<p class="sec-eyebrow">Binder annex · knowledge check</p>' +
            '<h2 id="quiz-title" class="sec-title">Knowledge Check — ' + (mode === 'hard' ? 'scenario exam' : 'concept quiz') + '</h2>' +
          '</div>' + headerRight +
        '</div>' +
        '<p class="sec-intro">' + U.esc(mode === 'hard'
          ? 'Seven scenario items. Each demands application, not recall — justify-by-choice. Every graded answer earns an explanation, right or wrong.'
          : 'Six concept questions. Pick an answer, submit, and read the explanation — the why matters more than the letter.') + '</p>' +
        (grading ? statusLine : '') +
        (practice
          ? '<p class="mono-note" aria-live="polite">Practice attempt — colors cleared. Change any answers and resubmit; your filed score stays ' + filedPct + '%.' + (practicePct !== null ? ' (Last practice result: ' + practicePct + '%.)' : '') + '</p>'
          : '') +
        (!grading
          ? '<p class="mono-note">Answered ' + answered + '/' + questions.length + ' — all answers required before submission.</p>'
          : '') +
      '</header>' +
      '<div class="stack-3 quiz-list" data-list></div>' +
      '<div class="quiz-footer" data-footer></div>';

    /* question cards --------------------------------------------------- */
    var list = el.querySelector('[data-list]');
    questions.forEach(function (q, qi) {
      var picked = answers[q.id];
      var card = document.createElement('div');
      card.className = 'card';
      var optsHtml = '<div class="stack-2 quiz-options" role="radiogroup" aria-label="' + U.esc(q.prompt) + '">';
      q.options.forEach(function (optText, oi) {
        var isPicked = picked === oi;
        /* Reveal colors only while grading — and only on the student's pick. */
        var isCorrectPick = grading && isPicked && oi === q.answer;
        var isWrongPick = grading && isPicked && oi !== q.answer;
        var rowClass = U.cx('choice-row choice-row--option',
          isCorrectPick && 'quiz-option--correct',
          isWrongPick && 'quiz-option--wrong');
        var iconHtml = isCorrectPick
          ? labIcon('CheckCircle2', 'quiz-verdict quiz-verdict--ok') + '<span class="sr-only">Your answer — correct</span>'
          : isWrongPick
            ? labIcon('XCircle', 'quiz-verdict quiz-verdict--bad') + '<span class="sr-only">Your answer — incorrect</span>'
            : '';
        optsHtml += '<div class="' + rowClass + '">' +
          '<input type="radio" class="choice-input" name="quiz-' + q.id + '" id="' + q.id + '-' + oi + '" value="' + oi + '"' +
          (isPicked ? ' checked' : '') + (grading ? ' disabled' : '') +
          ' aria-label="' + U.esc(optText) + '">' +
          '<label class="choice-label" for="' + q.id + '-' + oi + '">' + U.esc(optText) + iconHtml + '</label>' +
          '</div>';
      });
      optsHtml += '</div>';
      card.innerHTML =
        '<p class="quiz-prompt"><span class="mono-chip mono-chip--amber">Q' + (qi + 1) + '</span>' + U.esc(q.prompt) + '</p>' + optsHtml;
      if (grading) {
        card.innerHTML +=
          '<div class="teach-box"><p class="teach-title">' + (picked === q.answer ? 'Correct — why it matters' : 'The teaching point') + '</p>' +
          '<p class="teach-text">' + U.esc(q.explain) + '</p></div>';
      }
      if (!grading) {
        card.querySelectorAll('input[type="radio"]').forEach(function (input) {
          input.addEventListener('change', function () {
            LabStore.setQuizAnswer(q.id, Number(input.value));
            /* update the answered counter without re-rendering (colors untouched) */
            var st = LabStore.getState();
            var ans = questions.filter(function (qq) { return st.quizAnswers[qq.id] !== undefined; }).length;
            el.querySelector('[data-answered]').textContent =
              'Answered ' + ans + '/' + questions.length + ' — all answers required before submission.';
            submitBtn.disabled = ans < questions.length;
          });
        });
      }
      list.appendChild(card);
    });

    /* footer ----------------------------------------------------------- */
    var footer = el.querySelector('[data-footer]');
    var submitBtn;
    if (grading) {
      footer.className = 'quiz-footer quiz-footer--graded';
      footer.innerHTML =
        '<div class="quiz-footer-left">' +
          '<span class="filed-badge">Filed score ' + filedPct + '%</span>' +
          '<p class="quiz-footer-note">Annex filed. The Sign-Off desk weighs this score together with your objective record.</p>' +
        '</div>' +
        '<button type="button" class="btn btn--outline btn--lg" data-x="retry">' +
          labIcon('RotateCcw', 'btn-icon icon-amber') + 'Retry for practice</button>';
      footer.querySelector('[data-x="retry"]').addEventListener('click', function () {
        LabStore.retryQuiz();
        render(mode, root); /* colors cleared → fresh practice attempt */
      });
    } else {
      footer.className = 'quiz-footer quiz-footer--pending';
      footer.innerHTML =
        '<p class="quiz-footer-note">' + (practice
          ? 'Practice submission — re-grades the colors and explanations, but the filed score above never changes.'
          : 'Submission locks your answers and files the annex.') + '</p>' +
        '<button type="button" class="btn btn--primary btn--lg" data-x="submit"' + (answered < questions.length ? ' disabled' : '') + '>' +
          (practice ? 'Resubmit practice attempt' : 'Submit knowledge check') + '</button>';
      submitBtn = footer.querySelector('[data-x="submit"]');
      submitBtn.addEventListener('click', function () {
        LabStore.submitQuiz();
        render(mode, root);
      });
    }

    /* the answered counter paragraph needs a lookup hook */
    var answeredNote = el.querySelector('.mono-note');
    if (answeredNote && !grading && !practice) answeredNote.setAttribute('data-answered', '');

    root.innerHTML = '';
    root.appendChild(el);
  }

  return { render: render };
})();
