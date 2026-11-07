// ─────────────────────────────────────────────────────────────────────────────
// THE SWITCH YARD — js/quiz.js
// Yardmaster exam (C5): sequential questions with enforced progression.
// Ported 1:1 from the framework lab's QuizView (sections.tsx):
//  - one item at a time; future chips locked until the current one is submitted
//  - answers lock on submit (radios disabled + state guard)
//  - audit R3 color contract: only the SELECTED option is highlighted — green
//    when correct, red when wrong; the correct option is NEVER revealed on a
//    wrong submission; color is never the sole carrier (✓/✗ icons + text)
// ─────────────────────────────────────────────────────────────────────────────
(function (LAB) {
  'use strict';

  LAB.views = LAB.views || {};

  LAB.views.exam = function (st) {
    var mode = st.mode;
    var items = mode === 'medium' ? LAB.QUIZ_MEDIUM : LAB.QUIZ_HARD;
    var ui = LAB.store.ui;
    var view = ui.examView;

    var done = items.filter(function (i) { return st.quiz.submitted[i.id]; }).length;
    var correct = items.filter(function (i) { return st.quiz.submitted[i.id] && st.quiz.answers[i.id] === i.answer; }).length;
    // enforced progression: the furthest reachable question is the first unanswered one
    var firstOpen = -1;
    for (var i0 = 0; i0 < items.length; i0++) { if (!st.quiz.submitted[items[i0].id]) { firstOpen = i0; break; } }
    var maxReached = firstOpen === -1 ? items.length - 1 : firstOpen;
    var cur = Math.min(view, maxReached);
    var allAnswered = firstOpen === -1;
    var it = items[cur];
    var sub = !!st.quiz.submitted[it.id];
    var chosen = st.quiz.answers[it.id];
    var isLast = cur === items.length - 1;

    var html = '<div class="narrow-view">';

    // exam header
    html += '<div class="exam-head">' +
      '<p class="exam-kicker">' + LAB.icon('clipboard-check', 'icn-sm') + ' Yardmaster exam — ' + (mode === 'medium' ? 'concepts' : 'scenarios') + '</p>' +
      '<p class="exam-desc">' + (mode === 'medium'
        ? 'Concept check: one question at a time. Pick an answer, submit, read the why — then move on. Wrong answers teach, they do not punish.'
        : 'Scenario check: one question at a time. Every item is a piece of yard evidence — choose the action a defender takes, submit, and justify it to yourself via the explanation.') + '</p>' +
      '<p class="exam-score mono" aria-live="polite">score ' + correct + '/' + done + ' answered · ' + items.length + ' items</p>' +
      '</div>';

    // progress chips: future questions locked until the current one is submitted
    html += '<div class="row-wrap" role="group" aria-label="Exam progress">';
    items.forEach(function (q, i) {
      var answered = !!st.quiz.submitted[q.id];
      var locked = i > maxReached;
      var cls = 'exam-chip';
      if (i === cur) cls += ' exam-chip--current';
      else if (answered) cls += ' exam-chip--answered';
      else if (locked) cls += ' exam-chip--locked';
      html += '<button type="button" data-action="quiz-goto" data-arg="' + i + '" data-fid="chip-' + i + '"' +
        (locked ? ' disabled' : '') +
        ' aria-label="Question ' + (i + 1) + (answered ? ' (answered)' : locked ? ' (locked)' : ' (current)') + '"' +
        (i === cur ? ' aria-current="true"' : '') +
        ' class="' + cls + '">' + (i + 1) + (answered ? '✓' : '') + '</button>';
    });
    html += '</div>';

    // current item
    var itemBody = '';
    if (it.scenario) itemBody += '<p class="scenario-box">' + LAB.esc(it.scenario) + '</p>';
    if (it.code) itemBody += '<pre class="code-box">' + LAB.esc(it.code) + '</pre>';
    itemBody += '<p class="item-q">' + LAB.esc(it.q) + '</p>';
    itemBody += '<div class="stack-1">';
    it.options.forEach(function (opt, oi) {
      var isChosen = chosen === oi;
      // audit R3: only the SELECTED option is highlighted — green when it is
      // the correct one, red when it is not. The correct option is NEVER
      // revealed on a wrong submission.
      var showOk = sub && isChosen && oi === it.answer;
      var showBad = sub && isChosen && oi !== it.answer;
      var cls = 'option-row';
      if (showOk) cls += ' option-row--ok';
      else if (showBad) cls += ' option-row--bad';
      else if (isChosen) cls += ' option-row--chosen';
      itemBody += '<label class="' + cls + '">' +
        '<input type="radio" name="' + LAB.esc(it.id) + '" ' + (isChosen ? 'checked' : '') + (sub ? ' disabled' : '') +
        ' data-change="quiz-pick" data-arg="' + LAB.esc(it.id) + '" data-val="' + oi + '" aria-label="Option ' + (oi + 1) + '" />' +
        '<span class="option-text">' + LAB.esc(opt) + '</span>' +
        (showOk ? LAB.icon('check-circle-2', 'icn-sm icn-ok-fixed') : '') +
        (showBad ? LAB.icon('x-circle', 'icn-sm icn-bad-fixed') : '') +
        '</label>';
    });
    itemBody += '</div>';

    if (!sub) {
      itemBody += '<div class="mt-2">' + LAB.yardButton({ tone: 'primary', action: 'quiz-submit', arg: it.id, fid: 'submit-q', disabled: chosen === undefined, label: 'Submit answer' }) + '</div>';
    } else {
      itemBody += '<div class="stack-2 mt-2">';
      itemBody += '<div class="explain-box">' +
        '<p class="explain-verdict ' + (chosen === it.answer ? 'text-ok-strong' : 'text-bad-strong') + '">' +
        (chosen === it.answer
          ? LAB.icon('check-circle-2', 'icn-xs') + ' Correct.'
          : LAB.icon('x-circle', 'icn-xs') + ' Not quite — here is the why.') +
        '</p>' + LAB.esc(it.explain) + '</div>';
      if (!isLast) {
        itemBody += '<div>' + LAB.yardButton({ tone: 'primary', action: 'quiz-next', fid: 'next-q', label: 'Next question ' + LAB.icon('chevron-right', 'icn-xs') }) + '</div>';
      }
      if (isLast && allAnswered) {
        itemBody += '<p class="exam-done" role="status">Exam complete — ' + correct + '/' + items.length + ' correct. The SAFETY REVIEW tab wraps up the lesson.</p>';
      }
      itemBody += '</div>';
    }

    html += LAB.panel('Item ' + (cur + 1) + ' of ' + items.length + (it.topic ? ' — ' + it.topic : ''), LAB.icon('radio', 'icn-xs'), itemBody);
    html += '</div>';
    return html;
  };
})(window.LAB = window.LAB || {});
