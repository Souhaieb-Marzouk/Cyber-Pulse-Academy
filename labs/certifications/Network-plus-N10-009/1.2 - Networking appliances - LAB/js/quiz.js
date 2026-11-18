// ── The Staging Bay · C5 knowledge check (quiz) ─────────────────────────────
// Static port of QuizDeck.tsx. Flow contract (R2): each question is validated by
// its own CHECK ANSWER button; on press the chosen answer locks (state-enforced),
// feedback explains the why, and NEXT QUESTION is the only way forward.
// Color contract (R3): a correct pick turns green; a wrong pick turns RED ONLY —
// the correct option is never revealed in green on a wrong submission.
// No selection → Check stays disabled.
(function () {
'use strict';

function quizCard(state, dispatch, onOpenCompletion) {
  const mode = state.mode || 'medium';
  const LAB = window.LAB;
  const quiz = mode === 'hard' ? LAB.QUIZ_HARD : LAB.QUIZ_MEDIUM;
  const entries = state.quiz;
  const checkedCount = quiz.filter((q) => entries[q.id] && entries[q.id].checked).length;
  const submitted = state.quizSubmitted;
  const correct = quiz.filter((q) => entries[q.id] && entries[q.id].checked && entries[q.id].pick === q.answer).length;
  const idx = Math.min(state.quizIdx, quiz.length - 1);
  const q = quiz[idx];
  const entry = entries[q.id];
  const picked = entry ? entry.pick : undefined;
  const checked = !!(entry && entry.checked);
  const isLast = idx === quiz.length - 1;

  const card = window.h('div', { class: 'quiz-inner' });

  // header row
  const headRow = window.h('div', { class: 'quiz-head' });
  headRow.appendChild(window.icon('pen-line', 'ic-16 amber'));
  headRow.appendChild(window.h('span', { class: 'mono-dim-11', text: `${checkedCount}/${quiz.length} locked` }));
  if (submitted) {
    headRow.appendChild(window.StatusChip(correct / quiz.length >= 0.6, `${correct}/${quiz.length} correct`));
    headRow.appendChild(window.h('button', {
      type: 'button', class: 'btn-lime quiz-report-btn', text: 'view sign-off report',
      onclick: onOpenCompletion,
    }));
  }
  card.appendChild(headRow);

  // progress rail (read-only: forward-only flow)
  const rail = window.h('ol', { class: 'quiz-rail', 'aria-label': `Exam progress: question ${idx + 1} of ${quiz.length}` });
  quiz.forEach((qq, i) => {
    const st = entries[qq.id];
    const doneRight = st && st.checked && st.pick === qq.answer;
    const doneWrong = st && st.checked && st.pick !== qq.answer;
    const li = window.h('li', {
      class: 'quiz-rail-step ' + (i === idx ? 'is-current' : doneRight ? 'is-right' : doneWrong ? 'is-wrong' : ''),
      'aria-current': i === idx ? 'step' : undefined,
    });
    li.appendChild(document.createTextNode(String(i + 1)));
    if (st && st.checked) {
      li.appendChild(window.h('span', { 'aria-hidden': 'true', text: doneRight ? '✓' : '✗' }));
      li.appendChild(window.h('span', { class: 'sr-only', text: doneRight ? ' — checked, correct' : ' — checked, wrong' }));
    } else if (i === idx) {
      li.appendChild(window.h('span', { class: 'sr-only', text: ' — current' }));
    } else {
      li.appendChild(window.h('span', { class: 'sr-only', text: ' — not reached' }));
    }
    rail.appendChild(li);
  });
  card.appendChild(rail);

  // question fieldset
  const fs = window.h('fieldset', { class: 'quiz-fieldset', 'aria-live': 'polite' });
  const legend = window.h('legend', { class: 'quiz-legend' });
  legend.appendChild(window.h('span', { class: 'mono-amber-11', text: `Q${idx + 1}/${quiz.length}` }));
  legend.appendChild(window.h('span', { class: 'quiz-topic', text: `topic · ${q.topic}` }));
  legend.appendChild(window.h('span', { class: 'quiz-prompt', text: q.prompt }));
  fs.appendChild(legend);

  const group = window.h('div', { class: 'quiz-options', role: 'radiogroup', 'aria-label': `Question ${idx + 1} options` });
  q.options.forEach((opt, oi) => {
    const isPicked = picked === oi;
    // R3 color contract: highlight ONLY the selected option — green if right, red if wrong.
    const greenPick = checked && isPicked && oi === q.answer;
    const redPick = checked && isPicked && oi !== q.answer;
    const cls = 'quiz-option' + (greenPick ? ' pick-right' : redPick ? ' pick-wrong' : checked ? ' pick-dim' : '');
    const lab = window.h('label', { class: cls });
    const radio = window.h('input', { type: 'radio', name: 'quiz-' + q.id, value: String(oi), disabled: checked ? '' : undefined });
    radio.checked = isPicked;
    radio.addEventListener('change', () => {
      if (radio.checked && !entryChecked()) dispatch({ type: 'QUIZ_PICK', qid: q.id, idx: oi });
    });
    function entryChecked() {
      const st = window.APP.store.state.quiz[q.id];
      return !!(st && st.checked);
    }
    lab.appendChild(radio);
    lab.appendChild(window.h('span', { class: 'quiz-option-text', text: opt }));
    if (greenPick) lab.appendChild(window.icon('badge-check', 'ic-16 green'));
    if (redPick) lab.appendChild(window.icon('circle-dashed', 'ic-16 red'));
    group.appendChild(lab);
  });
  fs.appendChild(group);

  if (!checked) {
    const checkBtn = window.h('button', {
      type: 'button', class: 'btn-amber quiz-check-btn', text: 'check answer',
      disabled: picked === undefined ? '' : undefined,
      'aria-label': `Check answer for question ${idx + 1}`,
      onclick: () => dispatch({ type: 'QUIZ_CHECK', qid: q.id }),
    });
    fs.appendChild(checkBtn);
  } else {
    fs.appendChild(window.h('p', { class: 'quiz-why', role: 'status' },
      window.h('span', { class: 'quiz-verdict ' + (picked === q.answer ? 'good' : 'bad'), text: picked === q.answer ? 'correct · ' : 'wrong · ' }),
      document.createTextNode(q.why)));
    const row = window.h('div', { class: 'quiz-after' });
    if (isLast) {
      row.appendChild(window.h('button', {
        type: 'button', class: 'btn-lime', text: 'finish exam → sign-off report', onclick: onOpenCompletion,
      }));
    } else {
      row.appendChild(window.h('button', {
        type: 'button', class: 'btn-amber', text: 'next question →',
        'aria-label': `Move to question ${idx + 2}`,
        onclick: () => dispatch({ type: 'QUIZ_NEXT' }),
      }));
    }
    row.appendChild(window.h('span', { class: 'mono-dim-10', text: 'answer locked — moving on is required' }));
    fs.appendChild(row);
  }
  card.appendChild(fs);
  return card;
}

window.createQuizRegion = function createQuizRegion(store, onOpenCompletion) {
  const section = window.h('section', { id: 'sec-quiz', 'aria-labelledby': 'h-quiz', class: 'scroll-mt' });
  const mode = store.state.mode || 'medium';
  const head = window.SectionHead('act 06 · knowledge check', mode === 'hard' ? 'Cold-site exam' : 'Site exam',
    mode === 'hard'
      ? 'Seven scenario calls, one at a time. Check each answer to lock it in — the justification follows immediately.'
      : 'Six concept questions, one at a time. Check each answer to lock it in — the why follows immediately.');
  section.appendChild(head);
  const panel = window.h('div', { class: 'panel quiz-panel' });
  section.appendChild(panel);

  let lastKey = null;
  let pickTarget = null; // radio group element for targeted pick updates (keeps keyboard flow alive)

  function key(s) {
    const entries = s.quiz;
    const k = [s.mode, s.quizIdx, s.quizSubmitted, Object.keys(entries).length,
      Object.entries(entries).map(([id, e]) => id + (e.checked ? 'c' : 'u')).sort().join(',')].join('|');
    return k;
  }

  function render(s) {
    panel.innerHTML = '';
    panel.appendChild(quizCard(s, store.dispatch, onOpenCompletion));
    // stash the active radio group for targeted pick updates
    pickTarget = panel.querySelector('.quiz-options:not([data-stale])');
  }

  function update(prev, s) {
    const k = key(s);
    if (k !== lastKey) {
      lastKey = k;
      render(s);
      return;
    }
    // same question, same lock states → a PICK happened: update targeted (no rebuild,
    // so radio-group keyboard navigation never loses focus)
    const entries = s.quiz;
    const quiz = (s.mode === 'hard' ? window.LAB.QUIZ_HARD : window.LAB.QUIZ_MEDIUM);
    const idx = Math.min(s.quizIdx, quiz.length - 1);
    const q = quiz[idx];
    const picked = entries[q.id] ? entries[q.id].pick : undefined;
    group: {
      const groupEl = panel.querySelector('.quiz-options');
      if (!groupEl) break group;
      const radios = groupEl.querySelectorAll('input[type=radio]');
      radios.forEach((r, oi) => {
        if (r.checked !== (picked === oi)) r.checked = picked === oi;
      });
      const checkBtn = panel.querySelector('.quiz-check-btn');
      if (checkBtn) {
        if (picked === undefined) checkBtn.setAttribute('disabled', '');
        else checkBtn.removeAttribute('disabled');
      }
    }
  }

  render(store.state);
  lastKey = key(store.state);
  return { el: section, update };
};
})();
