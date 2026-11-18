/* ── Knowledge check (quiz) ───────────────────────────────────────────────────
 * Port of the DebriefBoard quiz list: per-question "Lock in answer" (R2),
 * only-selected color contract (R3: green ONLY on a picked correct option,
 * red ONLY on a wrong pick — a wrong pick never reveals the right answer),
 * irreversible lock, full-label MISSED feedback + explanation.
 */
(function () {
  'use strict';

  const { quizFor } = window.LabObjectives;

  function pad2(n) { return String(n).padStart(2, '0'); }

  function render(session, mode) {
    const quiz = quizFor(mode);
    const items = quiz.map((q, qi) => {
      const answered = session.quizAnswers[q.id] !== undefined;
      const checked = !!session.quizChecked[q.id];
      const correct = session.quizAnswers[q.id] === q.correct;

      const opts = q.options.map((opt) => {
        const selected = session.quizAnswers[q.id] === opt.id;
        // R3: green ONLY on the option the student picked AND which is correct —
        // a wrong pick must never light up the correct option
        const isCorrect = checked && selected && opt.id === q.correct;
        const isWrongPick = checked && selected && opt.id !== q.correct;
        let cls = 'quiz-opt';
        if (isCorrect) cls += ' correct-pick';
        else if (isWrongPick) cls += ' wrong-pick';
        else if (selected) cls += ' selected';
        let mark = '';
        if (isCorrect) mark = '<span class="mark ok">' + window.LabUI.icon('check-circle-2', 'ic-16') + '</span>';
        else if (isWrongPick) mark = '<span class="mark no">' + window.LabUI.icon('x-circle', 'ic-16') + '</span>';
        return (
          '<label class="' + cls + (checked ? ' locked' : '') + '">' +
          '<input type="radio" name="quiz-' + q.id + '" value="' + window.LabUI.escA(opt.id) + '"' +
          (selected ? ' checked' : '') + (checked ? ' disabled' : '') +
          ' data-change="quiz" data-qid="' + q.id + '">' +
          '<span class="flex1">' + window.LabUI.esc(opt.label) + '</span>' + mark +
          '</label>'
        );
      }).join('');

      let lock = '';
      if (!checked) {
        lock = '<button type="button" class="btn btn-solid btn-sm quiz-lock" data-action="check-quiz" data-qid="' + q.id + '"' +
          ' data-qi="' + qi + '"' + (answered ? '' : ' disabled') + '>Lock in answer</button>';
      } else {
        const correctLabel = q.options.find((o) => o.id === q.correct).label;
        lock = '<div class="quiz-feedback ' + (correct ? 'good' : 'bad') + '" role="status">' +
          '<span class="ft">' + (correct ? 'CORRECT ▸' : 'MISSED — correct: ' + window.LabUI.esc(correctLabel) + ' ▸') + '</span>' +
          window.LabUI.esc(q.explanation) + '</div>';
      }

      return (
        '<li class="quiz-item">' +
        '<p class="quiz-q"><span class="qn">' + pad2(qi + 1) + '.</span>' + window.LabUI.esc(q.prompt) + '</p>' +
        '<div class="quiz-opts" role="radiogroup" aria-label="Question ' + (qi + 1) + ' options">' + opts + '</div>' +
        lock +
        '</li>'
      );
    }).join('');

    return (
      '<section class="card" aria-labelledby="knowledge-check">' +
      '<h3 id="knowledge-check" class="debrief-h3">' +
      window.LabUI.icon('clipboard-check', 'ic-16') + ' Knowledge check — ' + quiz.length + ' scenario questions</h3>' +
      '<ol class="quiz-list">' + items + '</ol>' +
      '</section>'
    );
  }

  /* R2: progression cue — once locked, bring the next unanswered question into view */
  function scrollAfterLock(qi) {
    requestAnimationFrame(() => {
      const items = Array.from(document.querySelectorAll('main ol > li'));
      const next = items.slice(qi + 1).find((li) => {
        const radios = li.querySelectorAll('input[type=radio]');
        return radios.length > 0 && !radios[0].disabled;
      });
      if (next && next.scrollIntoView) next.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  window.LabQuiz = { render, scrollAfterLock };
})();
