// ── quiz.js — Knowledge check (C5): sequential flow (R2) + selected-only
// coloring (R3), ported 1:1 from src/components/lab/QuizPhase.tsx.
// R2: one question at a time; forward movement locked until the current answer
//     is locked in; the chosen answer cannot change after lock-in.
// R3: after lock-in ONLY the chosen option is colored — green when correct,
//     red when wrong — and the correct option is never revealed on a wrong pick.

function quizBank() {
  return state.mode === "hard" ? QUIZ_HARD : QUIZ_MEDIUM;
}

function quizPhase() {
  if (!state.mode) return "";
  const bank = quizBank();
  const idx = Math.min(Math.max(state.quiz.quizIdx != null ? state.quiz.quizIdx : 0, 0), bank.length - 1);
  const q = bank[idx];
  const chosen = state.quiz.answers[q.id];
  const isChecked = state.quiz.checked[q.id] === true;
  const answered = bank.filter((x) => state.quiz.answers[x.id] !== undefined).length;
  const allDone = state.quiz.done;
  const hard = state.mode === "hard";

  const optionBtn = (opt, oi) => {
    const isChosen = chosen === oi;
    // R3: only the chosen option carries a state color after lock-in.
    let cls = "quiz-option";
    if (isChecked && isChosen) cls += chosen === q.answer ? " chosen-ok" : " chosen-no";
    else if (isChosen) cls += " chosen";
    return `
      <button type="button" role="radio" aria-checked="${isChosen}" ${isChecked ? "disabled" : ""}
        data-action="quiz-option" data-qid="${esc(q.id)}" data-idx="${oi}"
        class="${cls}" data-focus-key="quiz-${esc(q.id)}-${oi}">
        <span class="opt-letter">${String.fromCharCode(65 + oi)}</span>
        ${esc(opt)}
        ${isChecked && isChosen ? `<span class="opt-verdict ${chosen === q.answer ? "ok" : "no"}">${chosen === q.answer ? "✓ correct" : "✗ incorrect"}</span>` : ""}
      </button>`;
  };

  const scoreBadge = allDone
    ? `<span class="badge badge-xs mono ${state.quiz.correct === bank.length ? "badge-emerald" : "badge-amber"}">score ${state.quiz.correct}/${bank.length}</span>`
    : "";

  const explain = isChecked
    ? `<div class="explain ${chosen === q.answer ? "explain-ok" : "explain-no"}">
         <span class="explain-tag">${chosen === q.answer ? "Correct — why" : "Incorrect — why"}</span>
         <p class="explain-body">${esc(q.explain)}</p>
       </div>`
    : "";

  const lockBtn = chosen !== undefined && !isChecked
    ? `<button type="button" class="btn btn-outline-teal btn-xs" data-action="quiz-lock" data-qid="${esc(q.id)}" data-focus-key="quiz-lock">Lock in &amp; explain</button>`
    : "";

  const nav = `
    <div class="quiz-nav">
      <button type="button" class="btn btn-ghost btn-xs" ${idx === 0 ? "disabled" : ""} data-action="quiz-prev" data-focus-key="quiz-prev">‹ Previous</button>
      ${idx < bank.length - 1
        ? `<button type="button" class="btn btn-primary btn-xs mono-btn" ${isChecked ? "" : "disabled"} title="${isChecked ? "Next question" : "Lock in your answer to continue"}" data-action="quiz-next" data-focus-key="quiz-next">Next question ›</button>`
        : `<button type="button" class="btn btn-primary btn-xs mono-btn" ${!isChecked || allDone ? "disabled" : ""} title="${allDone ? "Knowledge check already submitted" : "Lock in your answer to finish"}" data-action="quiz-finish" data-focus-key="quiz-finish">${allDone ? "Submitted" : "Finish knowledge check"}</button>`}
    </div>`;

  const footer = allDone
    ? `<div class="quiz-done">Knowledge check complete: <span class="strong">${state.quiz.correct}/${bank.length}</span>. ${state.quiz.correct === bank.length ? "Clean sweep." : "Use ‹ Previous to re-read the explanations — every miss is a lesson."} Head to the Debrief key when ready.</div>`
    : `<p class="quiz-hint">Answer, lock in, and the next question opens — you can step back to review locked answers, but committed answers stay committed.</p>`;

  return `
    <div class="quiz-wrap">
      ${stationHeader("05 · CHECK", "Knowledge check",
        hard ? "Scenario-based — apply, don't recall. One question at a time; answers lock when you commit."
             : "One question at a time — the answer locks when you commit, then the explanation opens.")}
      <div class="quiz-badges">
        <span class="badge badge-xs mono badge-teal">question ${idx + 1} of ${bank.length}</span>
        <span class="badge badge-xs mono">${answered}/${bank.length} answered</span>
        ${scoreBadge}
        ${synthTag("ml-auto")}
      </div>
      <section aria-label="Question ${idx + 1}" class="quiz-card ${isChecked ? (chosen === q.answer ? "quiz-ok" : "quiz-no") : ""}">
        <div class="quiz-q-row">
          <span class="quiz-q-num">${idx + 1}</span>
          <h3 class="quiz-q-text">${esc(q.q)}</h3>
        </div>
        <div class="quiz-options" role="radiogroup" aria-label="Options for question ${idx + 1}">
          ${q.options.map(optionBtn).join("")}
        </div>
        ${lockBtn}
        ${explain}
        ${nav}
      </section>
      ${footer}
    </div>`;
}

/** Re-render the quiz panel (only while it is the active station). */
function refreshQuiz() {
  if (state.activeStation !== "quiz") return;
  rerenderPreservingFocus("station-root", () => {
    const root = document.getElementById("station-root");
    root.innerHTML = `<div class="fade-rise">${quizPhase()}</div>`;
    bindTermTooltips(root);
  });
}
