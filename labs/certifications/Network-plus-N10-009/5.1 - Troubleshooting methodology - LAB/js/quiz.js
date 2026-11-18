// ── Fault Isolation Line — quiz runner (js/quiz.js) ──
// Ported 1:1 from the QuizRunner in src/components/lab/flows.tsx,
// including the audit fixes: locked-only scoring (QA-1) and the
// only-selected-answer highlight contract (QA-2/R3).

function quizQuestionsFor(mode) {
  return mode === 'hard' ? QUIZ_HARD : QUIZ_MEDIUM;
}

function QuizRunner(s) {
  const questions = quizQuestionsFor(s.mode);
  const idx = Math.min(s.quiz.idx, questions.length - 1);
  const q = questions[idx];
  const picked = s.quiz.answers[q.id];
  const revealed = !!s.quiz.revealed[idx];
  const last = idx === questions.length - 1;
  // Audit QA-1 fix: only LOCKED (revealed) questions count — otherwise the live
  // counter leaks which option is correct before the answer is committed.
  let score = 0;
  questions.forEach(function (qq, i) {
    if (s.quiz.revealed[i] && s.quiz.answers[qq.id] === qq.answer) score += 1;
  });

  let html = '<div class="quiz-wrap">';
  html += '<div class="quiz-headrow">' +
    '<p class="eyebrow">Quality audit — question ' + (idx + 1) + ' / ' + questions.length + '</p>' +
    '<p class="quiz-score">correct so far: ' + score + '</p>' +
    '</div>';
  html += HazardBar();
  html += '<section aria-label="Quiz question ' + (idx + 1) + '" class="quiz-card">';

  html += '<h2 class="quiz-prompt">' + esc(q.prompt) + '</h2>';
  html += '<div role="radiogroup" aria-label="Answer options" class="quiz-options">';
  q.options.forEach(function (o, i) {
    const isPicked = picked === i;
    // Audit QA-2 fix (R3): ONLY the selected answer is highlighted after
    // lock — green when it is correct, red when it is wrong. The correct
    // option is never revealed in green on a wrong submission.
    let tone = 'quiz-opt';
    if (revealed && isPicked) {
      tone += picked === q.answer ? ' quiz-opt-pass' : ' quiz-opt-fail';
    } else if (isPicked) {
      tone += ' quiz-opt-picked';
    }
    const marker = revealed && isPicked ? (picked === q.answer ? '\u2713' : '\u2717') : String.fromCharCode(65 + i);
    html += '<button type="button" role="radio" aria-checked="' + isPicked + '"' + (revealed ? ' disabled' : '') +
      ' data-act="' + actAttr(JSON.stringify({ type: 'QUIZ_SELECT', qid: q.id, idx: i })) + '" data-fk="q-' + idx + '-' + i + '"' +
      ' class="' + tone + '"><span aria-hidden="true" class="quiz-mark">' + marker + '</span>' + esc(o) + '</button>';
  });
  html += '</div>';

  if (!revealed) {
    html += '<button type="button" data-act="' + actAttr(JSON.stringify({ type: 'QUIZ_LOCK' })) + '" data-fk="quiz-lock"' +
      (picked === undefined ? ' disabled' : '') +
      ' class="btn btn-orange quiz-lock-btn">Lock answer</button>';
  } else {
    html += '<div class="stack-sm mt-4">' +
      '<p role="status" class="feedback ' + (picked === q.answer ? 'feedback-pass' : 'feedback-fail') + '">' +
      '<strong class="feedback-k">' + (picked === q.answer ? '\u2713 Correct' : '\u2717 Missed it') + '</strong><br>' + esc(q.explanation) +
      '</p>';
    if (last) {
      html += '<button type="button" data-act="' + actAttr(JSON.stringify({ type: 'QUIZ_SUBMIT' })) + '" data-fk="quiz-submit" class="btn btn-ink">Submit audit \u2192 Debrief</button>';
    } else {
      html += '<button type="button" data-act="' + actAttr(JSON.stringify({ type: 'QUIZ_NEXT' })) + '" data-fk="quiz-next" class="btn btn-white">Next question \u2192</button>';
    }
    html += '</div>';
  }
  html += '</section></div>';
  return html;
}
