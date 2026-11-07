// ─────────────────────────────────────────────────────────────────────────────
// js/quiz.js — SIGNAL CHECK (C5): concept quiz (medium) / scenario quiz (hard).
// 1:1 port of signal-check.tsx including the QA-audit contract:
//   R2  two-phase flow — selection is free and changeable until the student
//       presses "Check answer", which locks the question forever;
//   R3  color contract — ONLY the chosen option is highlighted: green if it
//       was correct, red if wrong; the correct option is NEVER revealed on a
//       wrong submission; pressing Check with no selection highlights nothing.
// Every question must be locked before the lab can complete.
// ─────────────────────────────────────────────────────────────────────────────

window.Lab = window.Lab || {};
(function (Lab) {
  'use strict';

  const { esc, el, icon } = Lab.ui;
  const D = window.LAB_DATA;
  const S = () => Lab.store;
  const E = () => Lab.engine;

  function renderSignalCheck() {
    const state = S().getState();
    const mode = state.mode || 'medium';
    const quiz = D.quiz[mode] || [];
    const prog = E().computeProgress(state);

    const wrap = el(`
    <section class="signal-check" aria-label="Signal check — knowledge quiz">
      <div class="panel-head">
        ${icon('signal', 's16 text-teal')}
        <h2 class="panel-title">Signal check</h2>
        <span class="panel-counters" data-quiz-counters>${prog.quizCorrect}/${prog.quizTotal} correct · ${mode === 'hard' ? 'scenario items — justify each call' : 'concept items — one best answer'}</span>
      </div>
      <div class="quiz-grid" data-quiz-grid></div>
    </section>`);

    const grid = wrap.querySelector('[data-quiz-grid]');
    quiz.forEach((q, qi) => grid.appendChild(renderQuizItem(q, qi, state)));
    return wrap;
  }

  function optionClasses(state, q, oi) {
    const rec = state.quiz[q.id];
    const revealed = Boolean(rec && rec.revealed);
    const chosen = rec && rec.chosen === oi;
    if (revealed && chosen && q.correct === oi) return 'quiz-opt opt-pass'; // selected AND correct
    if (revealed && chosen) return 'quiz-opt opt-fail';                     // selected AND wrong → red only
    if (revealed) return 'quiz-opt opt-neutral';                            // others stay neutral
    if (chosen) return 'quiz-opt opt-picked';                               // pre-validation amber
    return 'quiz-opt';
  }

  function optionIcon(state, q, oi) {
    const rec = state.quiz[q.id];
    const revealed = Boolean(rec && rec.revealed);
    const chosen = rec && rec.chosen === oi;
    if (revealed && chosen && q.correct === oi) return icon('circle-check', 's14 text-green opt-icon');
    if (revealed && chosen) return icon('circle-x', 's14 text-red opt-icon');
    return `<span class="opt-letter">${String.fromCharCode(65 + oi)}</span>`;
  }

  function renderQuizItem(q, qi, state) {
    const rec = state.quiz[q.id];
    const revealed = Boolean(rec && rec.revealed);
    const noPick = Boolean(Lab.quizRuntime[q.id] && Lab.quizRuntime[q.id].noPick);

    const options = q.options
      .map(
        (opt, oi) => `<button type="button" data-quiz-opt="${oi}" role="radio" aria-checked="${rec && rec.chosen === oi}"
          ${revealed ? 'disabled' : ''} class="${optionClasses(state, q, oi)}">
          ${optionIcon(state, q, oi)}<span>${esc(opt)}</span>
        </button>`
      )
      .join('');

    const scenario = q.scenario ? `<pre class="quiz-scenario lab-scrollbar">${esc(q.scenario)}</pre>` : '';

    const checkRow = revealed
      ? ''
      : `<div class="quiz-check-row">
          <button type="button" data-quiz-check="${esc(q.id)}" class="btn btn-primary btn-quiz-check">
            ${icon('lock', 's14')} Check answer
          </button>
          ${noPick ? '<span class="quiz-nopick" role="status" aria-live="polite">Select an answer first, then check.</span>' : ''}
        </div>`;

    const explanation = revealed
      ? `<div class="anim-expand" data-quiz-expl>
          <p class="quiz-expl-text ${rec.correct ? 'expl-pass' : 'expl-fail'}" role="status"><span class="${rec.correct ? 'text-green' : 'text-red'} fb-bold">${rec.correct ? 'Correct. ' : 'Not this time. '}</span>${esc(q.explanation)}</p>
        </div>
        <p class="quiz-locked">Answer locked — every question must be answered before clocking out.</p>`
      : '';

    return el(`
    <article data-quiz-q="${esc(q.id)}" class="quiz-card">
      <div class="quiz-prompt-row">
        <span class="quiz-num">${String(qi + 1).padStart(2, '0')}</span>
        <h3 class="quiz-prompt">${esc(q.prompt)}</h3>
      </div>
      ${scenario}
      <div class="quiz-options" role="radiogroup" aria-label="Answers for question ${qi + 1}">${options}</div>
      ${checkRow}
      ${explanation}
    </article>`);
  }

  // In-place refresh of one question card after CHOOSE_QUIZ / ANSWER_QUIZ.
  function updateQuizItem(qid) {
    const state = S().getState();
    const mode = state.mode || 'medium';
    const quiz = D.quiz[mode] || [];
    const qi = quiz.findIndex((q) => q.id === qid);
    if (qi === -1) return;
    const card = document.querySelector(`[data-quiz-q="${CSS.escape(qid)}"]`);
    if (!card) return;
    const fresh = renderQuizItem(quiz[qi], qi, state);
    card.replaceWith(fresh);
    updateQuizCounters();
  }

  function updateQuizCounters() {
    const prog = E().computeProgress(S().getState());
    const state = S().getState();
    const mode = state.mode || 'medium';
    const counter = document.querySelector('[data-quiz-counters]');
    if (counter) {
      counter.textContent = `${prog.quizCorrect}/${prog.quizTotal} correct · ${mode === 'hard' ? 'scenario items — justify each call' : 'concept items — one best answer'}`;
    }
    const hc = document.querySelector('[data-hc-quiz]');
    if (hc) hc.textContent = `${prog.quizCorrect}/${prog.quizTotal}`;
    const dc = document.querySelector('[data-dispatch-counters]');
    if (dc) {
      dc.textContent = `${prog.completed}/${prog.total} objectives · ${prog.quizCorrect}/${prog.quizTotal} signal check`;
    }
  }

  Lab.quiz = { renderSignalCheck, updateQuizItem, updateQuizCounters };
})(window.Lab);
