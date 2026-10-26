/* ═══════════════════════════════════════════════════════════════════════════
   CyberLab static port — KNOWLEDGE CHECK (js/quiz.js)
   Parity port of stations-d.tsx QuizStation / QuizItem:
   - answers commit once (radio-style, disabled after answer);
   - color contract (audit B3/QA-1): ONLY the chosen option is colored after
     submission — red when wrong, green when right. The correct option is
     NEVER revealed in green alongside a wrong pick; the explanation carries
     the teaching. Color is never the only carrier — the explanation opens
     with "Correct." / "Not quite.".
   ═══════════════════════════════════════════════════════════════════════════ */

(function (global) {
  'use strict';

  const LAB = global.LAB;
  const UI = global.LabUI;
  const esc = UI.esc;
  const icon = UI.icon;

  /** One quiz question card. */
  function quizItem(q, answer, index, total) {
    const answered = answer !== undefined && answer !== null;
    const correct = answer === q.correct;

    let h = '<div class="quiz-item" aria-live="polite">';
    h += '<p class="quiz-kicker">question ' + (index + 1) + ' / ' + total + '</p>';
    h += '<h3 class="quiz-prompt">' + esc(q.prompt) + '</h3>';
    h += '<div class="quiz-opts" role="radiogroup" aria-label="' + esc(q.prompt) + '">';

    q.options.forEach(function (opt, i) {
      const isChosen = answered && answer === i;
      const isRight = q.correct === i;
      /* Color contract: only the CHOSEN option is colored after submission. */
      let stateCls = '';
      if (isChosen && isRight) stateCls = ' qo-right';
      else if (isChosen && !isRight) stateCls = ' qo-wrong';

      h += '<button type="button" role="radio" aria-checked="' + (isChosen ? 'true' : 'false') + '"'
        + (answered ? ' disabled' : '')
        + ' class="quiz-opt' + stateCls + '"'
        + ' data-action="quiz-answer" data-qid="' + esc(q.id) + '" data-idx="' + i + '"'
        + ' data-fk="quiz-' + esc(q.id) + '-' + i + '">';
      h += '<span class="quiz-letter">' + String.fromCharCode(65 + i) + '.</span>' + esc(opt);
      h += '</button>';
    });
    h += '</div>';

    if (answered) {
      h += '<div class="quiz-expl ' + (correct ? 'qe-ok' : 'qe-no') + '">';
      h += '<strong>' + (correct ? 'Correct. ' : 'Not quite. ') + '</strong>' + esc(q.explanation);
      h += '</div>';
    }
    h += '</div>';
    return h;
  }

  /** The full Knowledge Check station body. */
  function render(ctx) {
    const state = ctx.state;
    const mode = state.mode;
    const score = ctx.score;
    const questions = mode === 'hard' ? LAB.QUIZ_HARD : LAB.QUIZ_MEDIUM;
    const answeredCount = questions.filter(function (q) { return state.quiz.answers[q.id] !== undefined; }).length;
    const allAnswered = answeredCount === questions.length;
    const allObjectivesPassed = ctx.allObjectivesPassed;

    let h = UI.stationHeader('08', 'Knowledge Check',
      mode === 'hard' ? 'Scenario triage — every answer needs application' : 'Concept quiz — every answer teaches', '');

    h += '<div class="quiz-wrap">';

    /* progress row with dots */
    h += '<div class="quiz-progress-row">';
    h += '<p class="quiz-counter">' + icon('list-checks', 'ic ic-btn ic-amber') + ' ' + answeredCount + '/' + questions.length + ' answered · ' + score.quizCorrect + ' correct</p>';
    h += '<div class="dots" aria-hidden="true">';
    questions.forEach(function (q, i) {
      const a = state.quiz.answers[q.id];
      let dotCls = 'dot';
      if (a === undefined) dotCls += ' dot-open';
      else if (a === q.correct) dotCls += ' dot-ok';
      else dotCls += ' dot-no';
      h += '<span class="' + dotCls + '" title="Question ' + (i + 1) + '"></span>';
    });
    h += '</div></div>';

    questions.forEach(function (q, i) {
      h += quizItem(q, state.quiz.answers[q.id], i, questions.length);
    });

    /* completion gate */
    h += '<div class="quiz-cta">';
    if (allAnswered) {
      if (allObjectivesPassed) {
        h += '<p class="quiz-cta-title">All objectives verified and the check is complete — time to close the incident.</p>';
        h += '<button type="button" class="btn btn-amber" data-action="open-completion" data-completion-trigger data-fk="complete-quiz-btn">COMPLETE THE LAB · SEE YOUR RATING</button>';
      } else {
        const remaining = score.totalCount - score.passedCount;
        h += '<p class="quiz-cta-note">Quiz done — but ' + remaining + ' objective' + (remaining === 1 ? ' remains' : 's remain') + ' unverified. Work the roster, then return here to complete the lab.</p>';
      }
    } else {
      h += '<p class="quiz-cta-note">Answer every question — each one explains itself after you commit. ' + (questions.length - answeredCount) + ' to go.</p>';
    }
    h += '</div>';

    h += '</div>';
    return h;
  }

  global.LabQuiz = {
    render: render,
    quizItem: quizItem,
  };
})(window);
