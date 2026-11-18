/* ============================================================================
 * Indicator Bay 02 - knowledge check / scenario drill (js/quiz.js)
 * ----------------------------------------------------------------------------
 * Ported from the QuizSection in src/components/lab/Sections.tsx with every
 * audit fix carried over:
 *  - sequential, enforced progression: only the first UNANSWERED question is
 *    active; later questions are not rendered (R2)
 *  - color contract: ONLY the selected option is highlighted - green when
 *    right, red when wrong; the correct answer is never revealed on a wrong
 *    submission (QA-1)
 *  - answered questions become locked review rows with no interactive
 *    controls
 * ========================================================================== */

'use strict';

window.LAB_QUIZ = (function () {
  var UI = window.LAB_UI;
  var h = UI.h;
  var icon = UI.icon;
  var ENGINE = window.LAB_ENGINE;
  var DATA = window.LAB_DATA;

  function QuizSection(deps) {
    var state = deps.state;
    var mode = deps.mode;
    var actions = deps.actions;
    var questions = mode === 'medium' ? DATA.MEDIUM_QUIZ : DATA.HARD_QUIZ;
    var answered = questions.filter(function (q) { return state.quiz[q.id] !== undefined; }).length;
    var correct = questions.filter(function (q) { return state.quiz[q.id] === q.correct; }).length;
    var currentIdx = -1;
    for (var i = 0; i < questions.length; i++) {
      if (state.quiz[questions[i].id] === undefined) { currentIdx = i; break; }
    }
    var finished = currentIdx === -1;

    // answered questions - locked, review-only (no re-answering possible)
    var reviewRows = [];
    for (var r = 0; r < Math.max(currentIdx, 0); r++) {
      reviewRows.push(reviewRow(questions[r], r, state.quiz[questions[r].id]));
    }

    // current question - the only interactive one
    var current = null;
    if (!finished) current = currentQuestion(questions[currentIdx], currentIdx, state, actions);

    var footNote = null;
    if (!finished && state.quiz[questions[currentIdx].id] === undefined) {
      footNote = h(
        'p',
        { class: 'quiz-foot' },
        'Answer question ' + (currentIdx + 1) + ' to unlock the next one.',
      );
    }
    var finishedBox = null;
    if (finished) {
      finishedBox = h(
        'p',
        { class: 'quiz-finished', 'aria-live': 'polite' },
        'Review complete - ' + correct + '/' + questions.length + ' correct. Your accuracy feeds the end-of-shift report.',
      );
    }

    return UI.SectionShell(
      'quiz',
      'Compliance review',
      mode === 'medium' ? 'Knowledge check' : 'Scenario drill',
      'ScrollText',
      'slate',
      [
        h(
          'p',
          { class: 'guide-intro' },
          mode === 'medium'
            ? 'Six concept checks, one at a time. Pick an answer, read the debrief, then move on - wrong answers teach, they do not punish.'
            : 'Seven scenario drills, one at a time. Each is a shift decision: pick the BEST action, read the rationale, then continue. Accuracy drives your end-of-shift rating.',
        ),
        h(
          'p',
          { class: 'quiz-counter' },
          answered + '/' + questions.length + ' answered · ' + correct + ' correct',
        ),
        reviewRows,
        current ? h('ol', { class: 'quiz-current' }, current) : null,
        footNote,
        finishedBox,
      ],
    );
  }

  function reviewRow(q, i, chosen) {
    var right = chosen === q.correct;
    return h(
      'div',
      { class: 'quiz-review' },
      h(
        'p',
        { class: 'quiz-review-scenario' },
        h('span', { class: 'quiz-num' }, pad(i + 1) + ' '),
        h('span', { class: 'quiz-scenario-text' }, q.scenario),
        right
          ? h(
              'span',
              { class: 'quiz-verdict text-emerald' },
              icon('Check', 'i-sm'),
              ' correct',
            )
          : h(
              'span',
              { class: 'quiz-verdict text-red' },
              icon('X', 'i-sm'),
              ' missed',
            ),
      ),
      h(
        'p',
        { class: 'quiz-your-answer' },
        'Your answer: ',
        h('span', { class: right ? 'text-emerald' : 'text-red' }, q.options[chosen]),
      ),
      h(
        'div',
        { class: 'obj-panel' },
        h('p', { class: 'quiz-why-label' }, 'The why - ' + q.topic),
        h('p', { class: 'quiz-explanation' }, q.explanation),
      ),
    );
  }

  function currentQuestion(q, currentIdx, state, actions) {
    var chosen = state.quiz[q.id];
    var done = chosen !== undefined;
    var optionBtns = q.options.map(function (opt, oi) {
      var isChosen = chosen === oi;
      var isRight = oi === q.correct;
      // color contract (QA-1 fix): only the selected option is highlighted
      var styleClass = 'quiz-option';
      if (!done) styleClass += ' quiz-option-open';
      else if (isChosen && isRight) styleClass += ' quiz-option-right';
      else if (isChosen && !isRight) styleClass += ' quiz-option-wrong';
      else styleClass += ' quiz-option-flat';
      return h(
        'button',
        {
          type: 'button',
          class: styleClass,
          disabled: done,
          'aria-pressed': done && isChosen ? 'true' : 'false',
          'aria-label': done && isChosen ? (isRight ? 'Your answer - correct' : 'Your answer - wrong') : undefined,
          onClick: function () { if (!done) actions.onAnswer(q.id, oi); },
        },
        h('span', { class: 'quiz-letter' }, String.fromCharCode(65 + oi)),
        h('span', { class: 'quiz-option-text' }, opt),
        done && isChosen && isRight ? icon('Check', 'i-base i-emerald', 'Your correct answer') : null,
        done && isChosen && !isRight ? icon('X', 'i-base i-red', 'Your wrong answer') : null,
      );
    });

    return h(
      'li',
      { id: 'quiz-q-' + q.id, class: 'quiz-active', 'aria-current': 'step' },
      h(
        'p',
        { class: 'quiz-scenario' },
        h('span', { class: 'quiz-num' }, pad(currentIdx + 1) + ' '),
        q.scenario,
      ),
      h('div', { class: 'quiz-options' }, optionBtns),
      done
        ? h(
            'div',
            { class: 'obj-panel', 'aria-live': 'polite' },
            h(
              'p',
              { class: 'quiz-why-label' },
              chosen === q.correct ? 'Correct - here is the why' : 'Not this time - here is the why',
            ),
            h('p', { class: 'quiz-explanation' }, q.explanation),
          )
        : null,
      done
        ? h(
            'p',
            { class: 'quiz-locked' },
            'Answer locked - your verdict and the next question follow below.',
          )
        : null,
    );
  }

  function pad(n) {
    var s = String(n);
    return s.length < 2 ? '0' + s : s;
  }

  return { QuizSection: QuizSection };
})();
