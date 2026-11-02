/**
 * quiz.js — Examination section (one question at a time, dots navigation).
 * ---------------------------------------------------------------------------
 * 1:1 port of the original Quiz.tsx behavior:
 *  - Locked in Medium mode until all objectives are done (Hard always open)
 *  - Progress dots are 44px buttons; jump to any question; answered dots tinted
 *    (correct green / wrong red); current dot solid burgundy
 *  - Options: select (pending) → Confirm → locked reveal (only the chosen
 *    option is highlighted; the correct one is never revealed green on a wrong
 *    answer — the written feedback carries the explanation)
 *  - "Next question" / "See results" flow; final score card
 *  - Question index/pending are view state (not persisted), re-derived on mount
 *    exactly like the original useState initializer.
 */

const QuizView = {
  idx: null,      // current question index (or qs.length for the results card)
  pending: null,  // option index chosen but not yet confirmed

  /** (Re)initialize the view state the way the original component mounts. */
  mount: function () {
    const qs = quizQuestions(store.state.mode);
    const firstUnanswered = qs.findIndex(function (q) { return store.state.quizAnswers[q.id] === undefined; });
    this.idx = firstUnanswered === -1 ? qs.length : firstUnanswered;
    this.pending = null;
  },

  reset: function () {
    this.idx = null;
    this.pending = null;
  },

  render: function (fresh) {
    const root = $('#stage-slot');
    if (!root) return;
    const s = store.state;
    if (!s) return;
    const mode = s.mode;
    const qs = quizQuestions(mode);
    const answers = s.quizAnswers;
    const unlocked = mode === 'hard' || allObjectivesDone(s);
    const ids = objectiveIds(mode);
    const doneCount = ids.filter(function (id) { return s.objectives[id] && s.objectives[id].done; }).length;

    if (this.idx === null) this.mount();
    const idx = Math.min(this.idx, qs.length);
    const finished = idx >= qs.length;
    const q = !finished ? qs[idx] : null;
    const recorded = q ? answers[q.id] : undefined;
    const revealed = q ? recorded !== undefined : false;
    const chosen = revealed ? recorded : this.pending;
    const answeredCount = qs.filter(function (x) { return answers[x.id] !== undefined; }).length;
    const correctCount = qs.filter(function (x) { return answers[x.id] === x.answer; }).length;

    let html = '' +
      '<div class="doc-heading">' +
        '<div class="doc-heading-code">Section 04 · Examination</div>' +
        '<h2 class="doc-heading-title">' + (mode === 'medium' ? 'Concept Check' : 'Scenario Examination') + '</h2>' +
        '<p class="doc-heading-sub">' +
          (mode === 'medium'
            ? 'Six concept questions — each answer comes with the reasoning an auditor needs.'
            : 'Seven scenario calls. Same standard the client’s board will apply: justify or reject.') +
        '</p>' +
      '</div>';

    if (!unlocked) {
      html += '' +
        '<div class="card">' +
          '<div class="card-pad quiz-locked">' +
            ic('lock', 'h-8 w-8 quiz-lock-icon') +
            '<p class="quiz-locked-title">The examination opens after the fieldwork</p>' +
            '<p class="quiz-locked-body">Guided-mode rule: finish the audit checklist first (' + doneCount + '/' + ids.length +
              ' objectives done), then test the concepts. The quiz stays available afterwards for review.</p>' +
          '</div>' +
        '</div>';
      root.innerHTML = '<div class="stage-anim' + (fresh ? '' : ' stage-anim-quiet') + '">' + html + '</div>';
      return;
    }

    // Progress dots
    html += '<div class="quiz-dots" aria-label="Quiz progress: ' + answeredCount + ' of ' + qs.length + ' answered">';
    qs.forEach(function (qq, i) {
      const answered = answers[qq.id] !== undefined;
      const correct = answered && answers[qq.id] === qq.answer;
      const dotCls = i === idx ? 'quiz-dot-current' : correct ? 'quiz-dot-correct' : answered ? 'quiz-dot-wrong' : 'quiz-dot-todo';
      html += '' +
        '<button type="button" class="quiz-dot-btn" data-action="quiz-goto" data-idx="' + i + '"' +
          ' aria-label="Question ' + (i + 1) + (answered ? (correct ? ', answered correctly' : ', answered incorrectly') : '') + '">' +
          '<span aria-hidden="true" class="quiz-dot ' + dotCls + '"></span>' +
        '</button>';
    });
    html += '<span class="quiz-progress-note">' + answeredCount + '/' + qs.length + ' answered · ' + correctCount + ' correct</span></div>';

    if (!finished && q) {
      html += '<div class="' + (fresh ? 'stage-anim' : 'stage-anim') + '"><div class="card quiz-card' + (fresh ? '' : ' quiz-card-anim') + '"><div class="card-pad">';
      html += '<div class="quiz-q-label">' + ic('graduation-cap', 'h-3.5 w-3.5') + ' Question ' + (idx + 1) + ' of ' + qs.length + '</div>';
      html += '<h2 class="quiz-q-text">' + esc(q.q) + '</h2>';
      html += '<div class="quiz-options" role="radiogroup" aria-label="' + esc(q.q) + '">';
      q.options.forEach(function (opt, i) {
        const isChosen = chosen === i;
        // R3 contract: after confirmation only the SELECTED option is highlighted
        // (green if it was correct, red if wrong). The correct option is never
        // revealed in green on a wrong submission — the written feedback below
        // carries the explanation instead.
        const showState = revealed && isChosen;
        let stateCls = '';
        if (showState) stateCls = recorded === q.answer ? 'quiz-opt-correct' : 'quiz-opt-wrong';
        else if (isChosen) stateCls = 'quiz-opt-chosen';
        html += '' +
          '<button type="button" role="radio" aria-checked="' + (isChosen ? 'true' : 'false') + '"' +
            ' class="quiz-option ' + stateCls + '"' + (revealed ? ' disabled' : '') +
            ' data-action="quiz-pick" data-idx="' + i + '">' +
            '<span class="quiz-opt-letter">' + String.fromCharCode(65 + i) + '</span>' +
            '<span class="quiz-opt-text">' + esc(opt) + '</span>' +
            (showState ? ic(recorded === q.answer ? 'circle-check' : 'circle-x', 'quiz-opt-icon') : '') +
          '</button>';
      });
      html += '</div>';

      if (revealed) {
        html += '' +
          '<div class="quiz-feedback ' + (recorded === q.answer ? 'quiz-feedback-ok' : 'quiz-feedback-no') + '">' +
            '<strong>' + (recorded === q.answer ? 'Correct.' : 'Not quite.') + '</strong> ' + esc(q.why) +
          '</div>';
        announce((recorded === q.answer ? 'Correct.' : 'Not quite.') + ' ' + q.why);
      }

      html += '<div class="quiz-actions">';
      if (!revealed) {
        html += '<button type="button" class="btn btn-primary" data-action="quiz-confirm"' + (this.pending === null ? ' disabled' : '') + '>Confirm answer</button>';
      } else if (idx < qs.length - 1) {
        html += '<button type="button" class="btn btn-primary" data-action="quiz-next">Next question ' + ic('arrow-right', 'h-4 w-4') + '</button>';
      } else {
        html += '<button type="button" class="btn btn-green" data-action="quiz-next">See results ' + ic('arrow-right', 'h-4 w-4') + '</button>';
      }
      html += '</div></div></div></div>';
    } else {
      // Results card
      html += '' +
        '<div class="stage-anim"><div class="card quiz-results-card"><div class="card-pad quiz-results">' +
          '<p class="quiz-results-label">Examination closed</p>' +
          '<p class="quiz-results-score">' + correctCount + '/' + qs.length + '</p>' +
          '<p class="quiz-results-note">' +
            (correctCount === qs.length
              ? 'Perfect paper — every justification matched the control’s real mechanism.'
              : 'Revisit any dot above to re-read the reasoning; answers are locked once confirmed.') +
          '</p>' +
        '</div></div></div>';
    }

    root.innerHTML = '<div>' + html + '</div>';
  },
};
