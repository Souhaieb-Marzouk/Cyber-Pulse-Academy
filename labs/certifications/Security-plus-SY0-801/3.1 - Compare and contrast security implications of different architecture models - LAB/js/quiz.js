// ─── The Cascadia Clearance — knowledge check (quiz) ──────────────────────
// Ported from the original Quiz component (panels.tsx). Same flow: one
// question at a time, an answer locks the question (R2 forward progression),
// only the picked option is highlighted (R3 color contract — the correct
// answer is never revealed when the pick was wrong), explanation shown after
// checking, Previous/Next navigation, "Review from start" on the last item.
'use strict';

function quizCurrent() {
  const questions = currentQuiz();
  const idx = Math.min(uiState.quizIdx, questions.length - 1);
  return { questions, idx, q: questions[idx] };
}

function renderQuizHTML() {
  return '<div class="stage-narrow">' + renderQuizInner() + '</div>';
}

function renderQuizInner() {
  const s = store.state;
  const { questions, idx, q } = quizCurrent();
  const picked = s.quiz[q.id];
  const checked = picked !== undefined && s.quiz[q.id + ':c'] === 1;
  const answered = questions.filter(function (qq) { return s.quiz[qq.id] !== undefined; }).length;
  const score = questions.filter(function (qq) { return s.quiz[qq.id] === qq.correct; }).length;
  const ok = picked === q.correct;

  let options = q.options.map(function (opt, i) {
    const isPicked = picked === i;
    const isCorrect = i === q.correct;
    // R3 color contract: after submission ONLY the picked option is
    // highlighted — green if it was correct, red if it was wrong.
    // The correct answer is never revealed when the pick was wrong.
    let cls = 'quiz-option';
    if (checked && isPicked && isCorrect) cls = 'quiz-option quiz-correct';
    else if (checked && isPicked && !isCorrect) cls = 'quiz-option quiz-wrong';
    else if (isPicked) cls = 'quiz-option quiz-picked';
    return (
      '<button type="button" role="radio" aria-checked="' + isPicked + '" data-action="quiz-pick" data-idx="' + i + '"' +
      (checked ? ' disabled' : '') +
      ' class="' + cls + '">' +
      '<span class="quiz-letter">' + String.fromCharCode(65 + i) + '</span>' + opt +
      (checked && isPicked ? '<span class="quiz-verdict">' + (isCorrect ? '✓ correct' : '✗ your pick — wrong') + '</span>' : '') +
      '</button>'
    );
  }).join('');

  let feedback = '';
  if (checked) {
    feedback =
      '<div role="status" aria-live="polite" class="feedback-box ' + (ok ? 'feedback-ok' : 'feedback-bad') + ' quiz-explain">' +
      '<span class="feedback-bold">' + (ok ? 'CORRECT — ' : 'NOT QUITE — ') + '</span>' + q.explain +
      '</div>';
  }

  let nav = '';
  if (idx < questions.length - 1) {
    // R2: forward progression is enforced — the next question unlocks
    // only after the current one has been checked.
    nav =
      '<button type="button" class="btn btn-primary btn-44" data-action="quiz-next"' +
      (checked ? '' : ' disabled') +
      ' aria-label="' + (checked ? 'Go to next question' : 'Answer the current question to unlock next') + '">' +
      'Next ' + icon('arrow-right', 'i-16') + '</button>';
  } else {
    nav = '<button type="button" class="btn btn-outline btn-44" data-action="quiz-review">Review from start</button>';
  }

  return (
    sectionTitle(s.mode === 'medium' ? 'Knowledge check · concepts' : 'Knowledge check · scenario triage', 'Prove it before you stamp it') +
      '<div class="card card-pad">' +
        '<div class="quiz-meta">' +
          '<span class="mono muted">Question ' + (idx + 1) + ' / ' + questions.length + '</span>' +
          '<span class="mono quiz-score">Answered ' + answered + ' · Correct ' + score + '</span>' +
        '</div>' +
        '<div class="quiz-progress" role="progressbar" aria-valuenow="' + answered + '" aria-valuemin="0" aria-valuemax="' + questions.length + '">' +
          '<div class="quiz-progress-fill" style="width:' + ((answered / questions.length) * 100) + '%"></div>' +
        '</div>' +
        (q.scenario ? '<p class="quiz-scenario">' + q.scenario + '</p>' : '') +
        '<h3 class="quiz-question">' + q.q + '</h3>' +
        '<div class="quiz-options" role="radiogroup" aria-label="Answer options">' + options + '</div>' +
        feedback +
        '<div class="quiz-nav">' +
          '<button type="button" class="btn btn-outline btn-44" data-action="quiz-prev"' + (idx === 0 ? ' disabled' : '') + '>Previous</button>' +
          nav +
        '</div>' +
      '</div>'
  );
}

function rerenderQuiz() {
  const el = document.getElementById('quiz-area');
  if (el) el.innerHTML = renderQuizInner();
}
