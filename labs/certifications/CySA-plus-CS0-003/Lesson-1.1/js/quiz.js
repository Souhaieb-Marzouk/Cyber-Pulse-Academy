/**
 * CyberLab — "The Leadership Ledger" — EXIT INTERVIEW (C5 quiz workspace)
 *
 * Vanilla-JS port of the QuizWorkspace in LeadershipLab.tsx: 7 questions per
 * mode, submit gating on all-answered, verdict highlighting + per-question
 * explanations after submit, submitted summary with correct count.
 * Re-render happens on submit (structure changes); answering updates classes
 * and the submit button in place.
 */
'use strict';

function buildQuizWorkspace(mode) {
  var section = el('section', 'quiz-workspace');
  section.setAttribute('aria-label', 'Exit interview');

  var head = el('div', 'ws-head');
  head.appendChild(el('p', 'ws-memono', 'EXIT INTERVIEW · KNOWLEDGE CHECK'));
  head.appendChild(el('h2', null, mode === 'medium' ? 'Seven concept questions' : 'Seven scenario judgments'));
  head.appendChild(
    el(
      'p',
      'ink',
      mode === 'medium'
        ? 'Answer all seven, then submit. Every answer comes with an explanation — the learning is in the why.'
        : 'Triage each situation like it is real. Submit to see the verdict and reasoning for every call you made.'
    )
  );
  section.appendChild(head);

  var questions = QUIZ.filter(function (q) { return q.mode === mode; });
  var list = el('ol');
  list.style.display = 'flex';
  list.style.flexDirection = 'column';
  list.style.gap = '0'; /* spacing handled by .quiz-q + .quiz-q margin */

  questions.forEach(function (q, qi) {
    var li = el('li', 'quiz-q');
    li.dataset.qid = q.id;
    li.appendChild(el('p', 'qq-prompt', 'Q' + (qi + 1) + '. ' + q.prompt));
    var opts = el('div', 'qq-options');
    opts.setAttribute('role', 'radiogroup');
    opts.setAttribute('aria-label', q.prompt);
    q.options.forEach(function (o) {
      var picked = labState.quizAnswers[q.id];
      var selected = picked === o.id;
      var row = el('label', 'q-opt');
      if (selected) row.classList.add('selected');
      var input = document.createElement('input');
      input.type = 'radio';
      input.name = q.id;
      input.value = o.id;
      input.checked = selected;
      input.disabled = labState.quizSubmitted;
      input.addEventListener('change', function () {
        if (input.disabled) return;
        var rows = opts.querySelectorAll('.q-opt');
        for (var i = 0; i < rows.length; i++) rows[i].classList.remove('selected');
        row.classList.add('selected');
        answerQuiz(q.id, o.id);
        refreshQuizSubmit();
      });
      row.appendChild(input);
      row.appendChild(el('span', 'ink', o.label));
      opts.appendChild(row);
    });
    li.appendChild(opts);
    list.appendChild(li);
  });
  section.appendChild(list);

  var submitRow = el('div', 'quiz-submit-row');
  var submitBtn = el('button', 'btn btn-dark btn-pill btn-touch');
  submitBtn.type = 'button';
  submitBtn.setAttribute('aria-label', 'Submit knowledge check');
  submitBtn.appendChild(icon('ClipboardList', { px: 16, cls: 'icon-inline' }));
  submitBtn.appendChild(document.createTextNode(' SUBMIT EXIT INTERVIEW'));
  submitBtn.addEventListener('click', function () {
    if (submitBtn.disabled) return;
    submitQuiz();
  });
  var hintP = el('p', 'muted');
  hintP.style.fontSize = '12px';
  submitRow.appendChild(submitBtn);
  submitRow.appendChild(hintP);
  section.appendChild(submitRow);

  function refreshQuizSubmit() {
    if (labState.quizSubmitted) return; /* verdict UI takes over below */
    var allAnswered = questions.every(function (q) { return !!labState.quizAnswers[q.id]; });
    submitBtn.disabled = !allAnswered;
    hintP.textContent = allAnswered ? '' : 'Answer all ' + questions.length + ' questions to submit.';
  }
  refreshQuizSubmit();

  /* verdict rendering — mirrors the submitted branch of the original */
  function renderVerdict() {
    if (!labState.quizSubmitted) return;
    var correctCount = questions.filter(function (q) { return labState.quizAnswers[q.id] === q.correct; }).length;
    list.querySelectorAll('.quiz-q').forEach(function (li) {
      var q = questions.find(function (x) { return x.id === li.dataset.qid; });
      if (!q) return;
      var picked = labState.quizAnswers[q.id];
      li.querySelectorAll('.q-opt').forEach(function (row) {
        var input = row.querySelector('input');
        var isCorrect = input.value === q.correct;
        var isWrongPick = picked === input.value && input.value !== q.correct;
        row.classList.add('submitted');
        row.classList.toggle('is-correct', isCorrect);
        row.classList.toggle('is-wrong-pick', isWrongPick);
        row.classList.toggle('selected', picked === input.value && !isCorrect && !isWrongPick);
        input.disabled = true;
      });
      /* explanation (only once) */
      if (!li.querySelector('.qq-explain')) {
        var ok = picked === q.correct;
        var exp = el(
          'p',
          'qq-explain ' + (ok ? 'ok' : 'bad'),
          (ok ? 'Correct. ' : 'Not quite. ') + q.explain
        );
        li.appendChild(exp);
      }
    });
    /* swap the submit row for the verdict block (idempotent) */
    var oldVerdict = section.querySelector('.quiz-verdict');
    if (oldVerdict) oldVerdict.remove();
    submitRow.style.display = 'none';
    var verdict = el('div', 'quiz-verdict');
    verdict.setAttribute('role', 'status');
    verdict.appendChild(
      el(
        'p',
        null,
        'Submitted — ' + correctCount + '/' + questions.length +
          ' correct. Each verdict above now carries its explanation; read the ones you missed, then check the completion report.'
      )
    );
    section.appendChild(verdict);
  }

  section.refreshVerdict = renderVerdict;
  section.refreshSubmit = refreshQuizSubmit;
  if (labState.quizSubmitted) renderVerdict(); /* resume/reopen in submitted state */
  return section;
}
