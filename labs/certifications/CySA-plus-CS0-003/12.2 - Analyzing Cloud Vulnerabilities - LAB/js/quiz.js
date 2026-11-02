// ─── SKYSCAN quiz: knowledge check renderer (quiz.tsx) ───────────────────────
// 1:1 port — per-item CHECK ANSWER, R3 color contract (only the selected
// option is highlighted after check), explanations, score summary.

(function (SKY) {
  'use strict';

  var esc = SKY.esc;

  SKY.renderQuiz = function (state) {
    var mode = state.mode || 'medium';
    var items = SKY.QUIZ_BY_MODE(mode);
    var checkedCount = items.filter(function (q) { return state.quizChecked[q.id]; }).length;
    var score = items.reduce(function (acc, q) {
      var a = state.quizAnswers[q.id] || [];
      return acc + (q.correct.length === a.length && q.correct.every(function (c) { return a.indexOf(c) !== -1; }) ? 1 : 0);
    }, 0);

    var cards = items.map(function (q, idx) {
      var sel = state.quizAnswers[q.id] || [];
      var checked = !!state.quizChecked[q.id];
      var isCorrect = q.correct.length === sel.length && q.correct.every(function (c) { return sel.indexOf(c) !== -1; });
      var multi = q.correct.length > 1;

      var options = q.options.map(function (opt, i) {
        var selected = sel.indexOf(i) !== -1;
        var isAnswer = q.correct.indexOf(i) !== -1;
        var cls;
        // R3 color contract: ONLY the selected option is highlighted after check.
        // selected+correct → green · selected+wrong → red · unselected → never reveals the answer.
        if (checked) {
          if (selected) cls = isAnswer ? 'sk-qopt sk-qopt-checked-correct' : 'sk-qopt sk-qopt-checked-wrong';
          else cls = 'sk-qopt sk-qopt-checked-other';
        } else {
          cls = selected ? 'sk-qopt sk-qopt-selected' : 'sk-qopt';
        }
        var markCls = 'sk-qopt-mark ' + (multi ? 'sk-mark-square' : 'sk-mark-round') + (selected ? (checked && isAnswer ? ' sk-mark-ok' : checked ? ' sk-mark-bad' : ' sk-mark-sel') : '');
        var role = multi ? 'checkbox' : 'radio';
        return SKY.btn(
          'data-sk-action="quiz-answer" data-q="' + q.id + '" data-idx="' + i + '" role="' + role + '" aria-checked="' + selected + '"' + (multi ? ' aria-pressed="' + selected + '"' : '') + (checked ? ' disabled' : ''),
          cls,
          '<span class="' + markCls + '" aria-hidden="true">' + (selected ? '\u25cf' : '') + '</span>' + esc(opt)
        );
      }).join('');

      var checkBtn = '';
      if (!checked) {
        checkBtn = SKY.btn('data-sk-action="quiz-check" data-q="' + q.id + '"' + (sel.length !== q.correct.length ? ' disabled' : ''), 'sk-btn sk-btn-quizcheck', 'CHECK ANSWER')
          .replace('<button ', '<button aria-label="Check answer for question ' + (idx + 1) + '" ');
      }

      var explanation = '';
      if (checked) {
        var correctLabels = q.correct.map(function (i) {
          return q.options[i].slice(0, 60) + (q.options[i].length > 60 ? '\u2026' : '');
        }).join(' \u00b7 ');
        explanation = '<div class="sk-q-explain" role="status">' +
          '<p class="sk-q-verdict ' + (isCorrect ? 'sk-q-verdict-ok' : 'sk-q-verdict-bad') + '">' +
          (isCorrect ? SKY.icon('circle-check-big', 3.5) : SKY.icon('circle-x', 3.5)) +
          (isCorrect ? 'correct' : 'correct answer: ' + esc(correctLabels)) + '</p>' +
          '<p class="sk-q-explanation">' + esc(q.explanation) + '</p></div>';
      }

      return '<li class="sk-quiz-item' + (checked ? (isCorrect ? ' sk-quiz-item-ok' : ' sk-quiz-item-bad') : '') + '">' +
        (q.scenario ? '<p class="sk-q-scenario">SCENARIO: ' + esc(q.scenario) + '</p>' : '') +
        '<p class="sk-q-question"><span class="sk-q-num">' + (idx + 1) + '.</span>' + esc(q.question) + '</p>' +
        (multi ? '<p class="sk-q-multi">select exactly ' + q.correct.length + '</p>' : '') +
        '<div class="sk-q-options" role="' + (multi ? 'group' : 'radiogroup') + '" aria-label="' + esc(q.question) + '">' + options + '</div>' +
        checkBtn + explanation +
        '</li>';
    }).join('');

    var summary = '';
    if (checkedCount === items.length) {
      summary = '<div class="sk-quiz-summary' + (score === items.length ? ' sk-quiz-summary-perfect' : '') + '" role="status">' +
        '<p class="sk-quiz-score">SCORE: ' + score + '/' + items.length + '</p>' +
        '<p class="sk-quiz-summary-text">' +
        (score === items.length
          ? 'Flawless. The concepts are locked in — head to the debrief and close the lab.'
          : 'Read the explanations on the missed items once more — they are exactly what the exam and the real SOC floor will ask of you.') +
        '</p></div>';
    }

    return '<section aria-labelledby="quiz-h" class="sk-panel sk-quiz">' +
      '<div class="sk-panel-head">' + SKY.icon('graduation-cap', 5) +
      '<h2 id="quiz-h" class="sk-h2 sk-h2-violet">KNOWLEDGE CHECK</h2>' +
      '<span class="sk-quiz-mode">' + (mode === 'hard' ? 'scenario triage — justify by elimination' : 'concept check — explanation after every answer') + '</span>' +
      '<span class="sk-quiz-progress" aria-live="polite">' + checkedCount + '/' + items.length + ' answered \u00b7 ' + score + ' correct</span></div>' +
      '<ol class="sk-quiz-list">' + cards + '</ol>' +
      summary +
      '</section>';
  };
})(window.SKY);
