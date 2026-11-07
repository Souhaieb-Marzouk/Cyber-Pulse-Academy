/**
 * The Deployment Factory — static port.
 * quiz.js — Final Quiz binder panel. Vanilla translation of the Quiz component
 * in Binders.tsx: one question at a time, lock → explanation → enforced advance,
 * then a full result sheet with unlocked explanations.
 */

const Quiz = (() => {
  /** Build the quiz panel HTML for the current quiz state. */
  function render() {
    const state = LabStore.getState();
    const questions = quizFor(state.mode);
    const submitted = state.quiz.submitted;
    // Clamp protects saved sessions whose index drifted out of range (as in the original).
    const current = Math.min(Math.max(state.quiz.current, 0), questions.length - 1);
    const q = questions[current];
    const picked = state.quiz.answers[q.id];
    const locked = !!state.quiz.locked[q.id];
    const isCorrectPick = picked === q.correct;
    const lockedCount = questions.filter((x) => state.quiz.locked[x.id]).length;

    /* -------- Review state (after the last question is revealed) -------- */
    if (submitted) {
      const correctCount = questions.filter((x) => state.quiz.answers[x.id] === x.correct).length;
      return `
        <div class="panel kb-panel">
          ${hazardHeader("Final quiz · result sheet")}
          <p class="quiz-scored" role="status">${icon("check-circle-2", "i-4")} scored ${correctCount}/${questions.length} — explanations unlocked below</p>
          <ol class="quiz-review">
            ${questions
              .map((x, xi) => {
                const xpicked = state.quiz.answers[x.id];
                const xCorrectPick = xpicked === x.correct;
                return `
                <li class="quiz-review-item">
                  <p class="quiz-q"><span class="qno">Q${xi + 1}.</span>${esc(x.stem)}</p>
                  <div class="quiz-options" role="radiogroup" aria-label="Question ${xi + 1} review">
                    ${x.options
                      .map((opt, oi) => {
                        const isPicked = xpicked === oi;
                        const cls = isPicked && xCorrectPick ? "picked-correct" : isPicked && !xCorrectPick ? "picked-wrong" : "dimmed";
                        const mark =
                          isPicked && xCorrectPick
                            ? `<span class="opt-verdict correct">${icon("check-circle-2", "i-4")}<span class="sr-only">your answer, correct</span></span>`
                            : isPicked && !xCorrectPick
                              ? `<span class="opt-verdict wrong">${icon("x-circle", "i-4")}<span class="sr-only">your answer, wrong</span></span>`
                              : "";
                        return `
                        <div class="quiz-opt ${cls}" aria-pressed="${isPicked}">
                          <span class="opt-letter">${String.fromCharCode(65 + oi)}.</span>
                          <span class="opt-text">${esc(opt)}</span>
                          ${mark}
                        </div>`;
                      })
                      .join("")}
                  </div>
                  <p class="quiz-explain quiz-review-explain">${esc(x.explanation)}</p>
                </li>`;
              })
              .join("")}
          </ol>
        </div>`;
    }

    /* -------- Live per-question flow (check → lock → enforced advance) -------- */
    return `
      <div class="panel kb-panel">
        ${hazardHeader(`Final quiz · ${state.mode === "medium" ? "concepts" : "scenario judgment"}`)}
        <p class="quiz-intro">${
          state.mode === "medium"
            ? "Six concept questions, one at a time. Pick an answer, lock it in, and the next question opens — every answer gets a full explanation."
            : "Seven scenario questions, one at a time. Lock your judgment on each; justifications follow every lock."
        }</p>
        <div class="quiz-meta">
          <p class="qm-pos">question ${current + 1} of ${questions.length}</p>
          <p class="qm-locked" aria-live="polite">${lockedCount}/${questions.length} locked</p>
        </div>
        <div class="quiz-progress" aria-hidden="true"><div style="width:${(lockedCount / questions.length) * 100}%"></div></div>

        <div class="quiz-card" aria-live="polite">
          <p class="quiz-q"><span class="qno">Q${current + 1}.</span>${esc(q.stem)}</p>
          <div class="quiz-options" role="radiogroup" aria-label="Question ${current + 1}">
            ${q.options
              .map((opt, oi) => {
                const isPicked = picked === oi;
                let cls = "";
                if (locked) {
                  cls = isPicked && isCorrectPick ? "picked-correct" : isPicked && !isCorrectPick ? "picked-wrong" : "dimmed";
                } else if (isPicked) {
                  cls = "picked-unlocked";
                }
                const mark =
                  locked && isPicked && isCorrectPick
                    ? `<span class="opt-verdict correct">${icon("check-circle-2", "i-4")} correct</span>`
                    : locked && isPicked && !isCorrectPick
                      ? `<span class="opt-verdict wrong">${icon("x-circle", "i-4")} not correct</span>`
                      : "";
                return `
                <button type="button" class="quiz-opt ${cls}" ${locked ? "disabled" : ""} data-quiz-pick="${q.id}:${oi}" aria-pressed="${isPicked}">
                  <span class="opt-letter">${String.fromCharCode(65 + oi)}.</span>
                  <span class="opt-text">${esc(opt)}</span>
                  ${mark}
                </button>`;
              })
              .join("")}
          </div>

          ${locked ? `<p class="quiz-explain">${esc(q.explanation)}</p>` : ""}

          <div class="quiz-actions">
            ${
              !locked
                ? `<button type="button" class="btn btn-amber btn-h10 btn-sm-mono" data-quiz-lock="${q.id}" ${picked === undefined ? "disabled" : ""} aria-label="Lock answer for question ${current + 1}">Lock answer</button>`
                : ""
            }
            ${
              locked && current < questions.length - 1
                ? `<button type="button" class="btn btn-amber btn-h10 btn-sm-mono" data-quiz-next="1" aria-label="Advance to question ${current + 2}">Next question →</button>`
                : ""
            }
            ${
              locked && current === questions.length - 1
                ? `<button type="button" class="btn btn-amber btn-h10 btn-sm-mono" data-quiz-submit="1">Reveal score &amp; explanations</button>`
                : ""
            }
            ${!locked && picked === undefined ? `<p class="quiz-note">select an option to enable locking</p>` : ""}
            ${locked ? `<p class="quiz-note dim">answer locked — cannot be changed</p>` : ""}
          </div>
        </div>
      </div>`;
  }

  /** Wire events for the quiz panel (called after its HTML is injected). */
  function wire(root) {
    root.querySelectorAll("[data-quiz-pick]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const [id, oi] = btn.getAttribute("data-quiz-pick").split(":");
        LabStore.setQuizAnswer(id, Number(oi));
      });
    });
    const lockBtn = root.querySelector("[data-quiz-lock]");
    if (lockBtn)
      lockBtn.addEventListener("click", () => {
        LabStore.lockQuizAnswer(lockBtn.getAttribute("data-quiz-lock"));
      });
    const nextBtn = root.querySelector("[data-quiz-next]");
    if (nextBtn) nextBtn.addEventListener("click", () => LabStore.advanceQuiz());
    const submitBtn = root.querySelector("[data-quiz-submit]");
    if (submitBtn) submitBtn.addEventListener("click", () => LabStore.submitQuiz());
  }

  return { render, wire };
})();
