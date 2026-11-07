// ─── Blueprint Studio · Sheet 05 inspection stamps (static port) ────────────
// Vanilla-JS translation of QuizSheet.tsx. Flow contract (R2/R3): pick an
// option → press STAMP ANSWER → the question locks permanently, only the
// SELECTED option is colored (green if correct, red if wrong — the correct
// option is never revealed on a wrong pick), feedback explains the why, and
// the next question becomes active. Questions lock in order.

(function () {
  'use strict';

  var Store = window.LabStore;
  var P = window.BP;
  var icon = P.icon;
  var esc = P.esc;

  function renderQuiz(anim) {
    var s = Store.getState();
    var mode = s.mode;
    var quiz = s.quiz;
    var bank = mode === 'hard' ? QUIZ_HARD : QUIZ_MEDIUM;
    var score = Store.quizScore(mode, quiz);
    var checked = quiz.checked || {};

    // Only the first unchecked question is active — progression is enforced.
    var activeIdx = quiz.submitted ? -1 : bank.findIndex(function (_, i) { return !checked[i]; });
    var allChecked = activeIdx === -1;
    var answeredCount = bank.filter(function (_, i) { return checked[i]; }).length;

    var sub =
      mode === 'hard'
        ? 'Seven scenario items — application, not recall. Pick an answer, stamp it, and it locks; the next item unlocks. Every option could happen; only one is the professional move.'
        : 'Six concept questions. Pick an answer, stamp it, and it locks; the next question unlocks. After each stamp you get the reasoning — collect the WHY, not just the checkmark.';

    var items = bank.map(function (item, i) {
      var picked = quiz.answers[i];
      var isChecked = !!checked[i];
      var isActive = i === activeIdx;
      var waiting = !isChecked && !isActive; // locked until its turn
      var locked = isChecked || quiz.submitted;
      var isCorrect = locked && picked === item.correct;

      var itemCls =
        'quiz-item' +
        (isCorrect === true ? ' is-correct' : isCorrect === false ? ' is-wrong' : isActive ? ' is-active' : '') +
        (waiting ? ' waiting' : '');
      var delayStyle = anim
        ? ' style="animation:fade-up-6 0.3s ease ' + Math.min(i * 0.03, 0.2).toFixed(2) + 's both"'
        : '';
      var aria =
        'Question ' + (i + 1) +
        (locked ? ' — stamped and locked' : isActive ? ' — active' : ' — unlocks after the previous question is stamped');

      var html = '<li class="' + itemCls + '"' + delayStyle + ' aria-label="' + esc(aria) + '">';

      html += '<div class="quiz-q">';
      html += '<p><span class="qn">Q' + (i + 1) + '</span>' + esc(item.q) + '</p>';
      if (locked && picked !== undefined) {
        html += P.draftStamp(picked === item.correct ? 'pass' : 'fail', picked === item.correct ? 'APPROVED' : 'REJECTED');
      }
      html += '</div>';

      html += '<div class="quiz-opts" role="radiogroup" aria-label="Options for question ' + (i + 1) + '">';
      html += item.options.map(function (opt, oi) {
        var isPicked = picked === oi;
        // R3: only the SELECTED option is colored after stamping — green when
        // it was correct, red when it was wrong. The correct option is NEVER
        // revealed on a wrong submission.
        var showGreen = locked && isPicked && picked === item.correct;
        var showRed = locked && isPicked && picked !== item.correct;
        var showAmber = !locked && isPicked;
        var cls =
          'quiz-opt' +
          (showGreen ? ' correct' : showRed ? ' wrong' : showAmber ? ' picked-active' : '');
        return (
          '<button type="button" role="radio" aria-checked="' + isPicked + '"' +
          (locked || !isActive ? ' disabled' : '') +
          ' class="' + cls + '" data-act="quiz-pick" data-q="' + i + '" data-opt="' + oi + '"' +
          ' data-fid="q' + i + 'o' + oi + '">' +
          '<span class="prefix">' + 'ABCD'.charAt(oi) + '.</span>' +
          esc(opt) +
          (showGreen ? icon('check', 'ic-14 mark-ic') : '') +
          (showRed ? icon('x', 'ic-14 mark-ic') : '') +
          '</button>'
        );
      }).join('');
      html += '</div>';

      // Per-question validating action — locks the answer (R2)
      if (isActive) {
        html += '<div class="quiz-stamp-row">';
        html +=
          '<button type="button" class="btn btn-amber" data-act="quiz-stamp" data-q="' + i + '"' +
          ' data-fid="qstamp-' + i + '"' + (picked === undefined ? ' disabled' : '') + '>' +
          icon('stamp', 'ic-14') + ' STAMP ANSWER</button>';
        if (picked === undefined) {
          html += '<span class="quiz-stamp-note">select an option above to enable stamping</span>';
        }
        html += '</div>';
      }
      if (locked) {
        html += '<p class="quiz-locked">' + icon('lock', 'ic-12') + ' ANSWER STAMPED &amp; LOCKED</p>';
      }

      if (isChecked) {
        html += '<div class="quiz-why" aria-live="polite">';
        html += icon('stamp', 'ic-14 inline-ic') + ' <strong>WHY ▸</strong> ' + esc(item.why);
        if (!isCorrect && item.focus) {
          html += '<span class="focus-line"><strong>FOCUS ▸</strong> ' + esc(item.focus) + '</span>';
        }
        html += '</div>';
      }

      html += '</li>';
      return html;
    }).join('');

    var foot = '<div class="quiz-foot">';
    if (!quiz.submitted) {
      foot +=
        '<button type="button" class="btn btn-submit" data-act="quiz-submit" data-fid="quiz-submit"' +
        (allChecked ? '' : ' disabled') + '>' +
        'SUBMIT FOR INSPECTION' + (allChecked ? '' : ' (' + answeredCount + '/' + bank.length + ' STAMPED)') +
        '</button>';
      if (!allChecked) {
        foot += '<span class="quiz-foot-note">stamp every question to unlock the final inspection</span>';
      }
    } else {
      foot +=
        '<p class="quiz-result" aria-live="polite">INSPECTION RESULT ▸ ' +
        '<span class="ok">' + score.correct + '/' + score.total + ' approved</span>' +
        ' · every stamp is locked — re-read the WHY notes on the items you rejected.</p>';
    }
    foot += '</div>';

    var inner = '<ol class="quiz-list">' + items + '</ol>' + foot;
    return P.sheetFrame('05', 'INSPECTION STAMPS', sub, inner);
  }

  window.BQuiz = {
    renderQuiz: renderQuiz,
  };
})();
