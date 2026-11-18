/* =========================================================================
   Night Dispatch — js/quiz.js
   The review board: per-item lock-in flow, the R3 color contract (after a
   lock only the CHOSEN option is colored — green when right, red when wrong;
   the correct answer is never revealed on a wrong submission — full reveal
   happens in the done view for revision), submit gating and the completed
   board with explanations.
   ========================================================================= */

"use strict";

const quizItemsFor = (mode) => (mode === "medium" ? QUIZ_MEDIUM : QUIZ_HARD);

/** answers store option INDEX; map it back to the option id safely */
function itemsSafeOption(q, idx) {
  return q.options[idx]?.id ?? null;
}

function quizCounts(state, items) {
  const answered = items.filter((q) => state.quiz.answers[q.id] !== undefined).length;
  const checkedAll = items.every((q) => state.quiz.checked[q.id]);
  const correctCount = items.filter((q) => {
    const a = state.quiz.answers[q.id];
    return a !== undefined && itemsSafeOption(q, a) === q.correct;
  }).length;
  return { answered, checkedAll, correctCount };
}

/** Live review board (before final submission). */
function quizLiveHTML(state) {
  const mode = state.mode;
  const items = quizItemsFor(mode);
  const { answered, checkedAll, correctCount } = quizCounts(state, items);

  return `
    <main class="view view-review fade-up">
      <header>
        <h2 class="view-title">Review board — ${mode === "medium" ? "concept check" : "scenario tribunal"}</h2>
        <p class="view-sub">
          ${mode === "medium"
            ? "Six concept questions. Lock an answer, read the explanation, keep moving — wrong answers teach, they don't punish."
            : "Seven scenario rulings. Every wrong option is a plausible near-miss; the explanations say why it fails."}
        </p>
        <p class="mono quiz-progress" aria-live="polite">${answered}/${items.length} answered</p>
      </header>

      <ol class="quiz-list" role="list">
        ${items.map((q, i) => {
          const a = state.quiz.answers[q.id];
          const chosen = a !== undefined ? itemsSafeOption(q, a) : null;
          const isChecked = !!state.quiz.checked[q.id];
          const ok = chosen === q.correct;
          return `
            <li class="panel quiz-item" data-quiz-item="${esc(q.id)}">
              <p class="quiz-q"><span class="mono quiz-qnum">Q${i + 1}</span>${esc(q.question)}</p>
              <div class="quiz-options" role="radiogroup" aria-label="Question ${i + 1}">
                ${q.options.map((o) => {
                  /* R3: after lock-in only the CHOSEN answer is colored —
                     green when it was correct, red when wrong. The correct
                     answer is never revealed on a wrong submission. */
                  let cls = "quiz-opt";
                  if (isChecked && chosen === o.id && ok) cls += " quiz-opt-good";
                  else if (isChecked && chosen === o.id) cls += " quiz-opt-bad";
                  else if (chosen === o.id) cls += " quiz-opt-chosen";
                  return `
                    <button type="button" role="radio" aria-checked="${chosen === o.id}" ${isChecked ? "disabled" : ""}
                      data-action="quiz-answer" data-qid="${esc(q.id)}" data-qidx="${q.options.findIndex((x) => x.id === o.id)}" data-fk="qo-${esc(q.id)}-${esc(o.id)}"
                      class="${cls}">
                      <span class="mono quiz-opt-key">${esc(o.id.toUpperCase())}</span><span class="fx">${esc(o.label)}</span>
                    </button>`;
                }).join("")}
              </div>
              ${!isChecked ? `
                <button type="button" class="btn btn-default btn-sm quiz-lock" data-action="quiz-check" data-qid="${esc(q.id)}" data-fk="qlk-${esc(q.id)}" ${chosen === null ? "disabled" : ""}>
                  <span class="fx">Lock in answer</span>
                </button>` : `
                <div role="status" aria-live="polite" class="feedback ${ok ? "feedback-ok" : "feedback-warn"}">
                  <p class="feedback-verdict">
                    ${ok ? icon("circle-check", "size-4 text-emerald") : icon("circle-x", "size-4 text-amber")}
                    <span class="fx">${ok ? "Correct." : "Not this time."}</span>
                  </p>
                  <p class="mt-1">${esc(q.explain)}</p>
                </div>`}
            </li>`;
        }).join("")}
      </ol>

      <div class="quiz-submit-wrap">
        <button type="button" class="btn btn-lg btn-amber quiz-submit" data-action="quiz-finish" ${!checkedAll ? "disabled" : ""}>
          <span class="fx">Submit to the board secretary (${correctCount}/${items.length} correct)</span>
        </button>
        ${!checkedAll ? `<p class="quiz-submit-hint">Lock in every answer to submit — explanations appear immediately after each lock.</p>` : ""}
      </div>
    </main>`;
}

/** Completed board: score line + full reveal (this is the only place the key is shown). */
function quizDoneHTML(state) {
  const mode = state.mode;
  const items = quizItemsFor(mode);
  const { correctCount } = quizCounts(state, items);

  return `
    <main class="view view-review fade-up">
      <div class="panel quiz-done-card">
        ${icon("clipboard-list", "size-10 quiz-done-icon")}
        <h2 class="view-title">Review board complete</h2>
        <p class="view-sub">
          Score: <strong class="text-foreground">${correctCount}/${items.length}</strong> (${Math.round((correctCount / items.length) * 100)}%). The board secretary has recorded it — explanations below remain available for revision.
        </p>
        ${mode === "medium" ? `<p class="quiz-done-unlock">Handover notes are now unlocked on the duty rail.</p>` : ""}
      </div>
      <ol class="quiz-list" role="list">
        ${items.map((q, i) => {
          const a = state.quiz.answers[q.id];
          const chosen = a !== undefined ? itemsSafeOption(q, a) : null;
          const ok = chosen === q.correct;
          return `
            <li class="panel quiz-item" data-quiz-item="${esc(q.id)}">
              <p class="quiz-q"><span class="mono quiz-qnum">Q${i + 1}</span>${esc(q.question)}</p>
              <ul class="quiz-review-options" role="list">
                ${q.options.map((o) => {
                  let cls = "quiz-reveal-opt";
                  if (o.id === q.correct) cls += " quiz-reveal-correct";
                  else if (o.id === chosen) cls += " quiz-reveal-wrong";
                  return `<li class="${cls}">${esc(o.label)}</li>`;
                }).join("")}
              </ul>
              <p class="feedback ${ok ? "feedback-ok" : "feedback-warn"} quiz-explain">${esc(q.explain)}</p>
            </li>`;
        }).join("")}
      </ol>
    </main>`;
}

function reviewBoardHTML(state) {
  return state.quiz.done ? quizDoneHTML(state) : quizLiveHTML(state);
}
