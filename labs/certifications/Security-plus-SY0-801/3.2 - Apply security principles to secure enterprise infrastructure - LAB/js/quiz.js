/* ═══════════════════════════════════════════════════════════════════════════
   quiz.js — Board exam (Knowledge Check) board.
   Mirrors QuizBoard.tsx and its assessment contract (QA-D10 / R2 / R3):
   one item at a time; "Check answer" LOCKS the answer; progression to the next
   item is enforced; after checking, ONLY the picked option is highlighted
   (green if correct / red if wrong — the correct option is never revealed in
   green on a wrong pick); no selection → no check; checked items never re-open.
   The stepper position re-derives from persistence on every fresh mount.
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";

const QuizBoard = {
  /** stepper index — null until the board is (re)entered, mirroring useState init */
  idx: null,

  /** derive the stepper position like the original: first unchecked item (or last) */
  ensureIdx(items, checked) {
    if (this.idx === null) {
      const first = items.findIndex((q) => !checked[q.id]);
      this.idx = first === -1 ? items.length - 1 : first;
    }
    this.idx = Math.min(this.idx, items.length - 1);
  },

  reset() {
    this.idx = null;
  },

  render(state, mode) {
    const items = QUIZ[mode];
    const answers = state.quiz.answers;
    const checked = state.quiz.checked ?? {};
    const checkedCount = items.filter((q) => checked[q.id]).length;
    const correctCount = items.filter((q) => checked[q.id] && answers[q.id] === q.correct).length;
    const graded = state.quiz.graded;

    this.ensureIdx(items, checked);
    const idx = this.idx;
    const q = items[Math.min(idx, items.length - 1)];
    const isLocked = !!checked[q.id];
    const picked = answers[q.id];
    const isLast = idx === items.length - 1;

    const options = q.options
      .map((opt, oi) => {
        const isPicked = picked === oi;
        // ONLY the picked option ever receives green/red; the correct option is
        // never highlighted when the pick was wrong (R3).
        const showPickedRight = isLocked && isPicked && oi === q.correct;
        const showPickedWrong = isLocked && isPicked && oi !== q.correct;
        const stateCls = showPickedRight ? "q-right" : showPickedWrong ? "q-wrong" : isPicked ? "q-picked" : "";
        return `<button type="button" role="radio" aria-checked="${isPicked}" ${isLocked ? "disabled" : ""} class="q-option ${stateCls}" data-action="quiz-pick" data-oi="${oi}">
          <span class="q-letter">${String.fromCharCode(65 + oi)}</span>
          <span>${esc(opt)}</span>
          ${showPickedRight ? `<span class="q-verdict q-verdict-ok">your pick · correct</span>` : ""}
          ${showPickedWrong ? `<span class="q-verdict q-verdict-no">your pick · wrong</span>` : ""}
        </button>`;
      })
      .join("");

    return `<div class="stack-4">
      ${paper(`
        ${sheetHeading(mode === "medium" ? "EX-A" : "EX-B", mode === "medium" ? "Knowledge check (6 concepts)" : "Design board exam (7 scenarios)",
          graded ? `<span class="q-score">${correctCount}/${items.length} correct</span>` : mono(`${checkedCount}/${items.length} checked · answers lock on check`))}
        <p class="q-lede">${mode === "medium"
          ? "Concept check after practice. One item at a time: pick an answer, CHECK it — the answer locks and the next item unlocks. An explanation appears after every check."
          : "Scenario-based items: each one is a judgment call from the chapter, not a recall question. Check in order; every check locks the answer — near-misses score as wrong."}</p>
        <div class="progress" role="progressbar" aria-valuenow="${checkedCount}" aria-valuemin="0" aria-valuemax="${items.length}" aria-label="Exam items checked">
          <div class="progress-fill" style="width:${(checkedCount / items.length) * 100}%"></div>
        </div>
        ${graded ? `<p class="q-graded">board exam complete — ${correctCount}/${items.length} correct · return to the checklist to claim the certificate</p>` : ""}
      `)}

      ${paper(`
        <div class="q-topline">
          ${mono(`item ${idx + 1} of ${items.length} · ${q.id}${isLocked ? " · locked" : ""}`)}
          ${isLocked ? `<span class="q-lockverdict ${picked === q.correct ? "q-ok" : "q-no"}">${picked === q.correct ? "correct" : "incorrect"}</span>` : ""}
        </div>
        <p class="q-scenario">${esc(q.scenario)}</p>
        <h3 class="q-question">${esc(q.question)}</h3>
        <div class="q-options" role="radiogroup" aria-label="Question ${idx + 1}" ${isLocked ? 'aria-disabled="true"' : ""}>
          ${options}
        </div>
        ${!isLocked
          ? `<button type="button" ${picked === undefined ? "disabled" : ""} class="btn btn-solid q-check" data-action="quiz-check">${picked === undefined ? "Select an answer to check" : "Check answer (locks this item)"}</button>`
          : `<div class="${picked === q.correct ? "fb fb-pass" : "fb fb-fail"} q-explain">
              ${picked !== q.correct ? `<p class="fb-correct">correct answer: ${String.fromCharCode(65 + q.correct)}</p>` : ""}
              <p>${esc(q.explanation)}</p>
            </div>`}
        <div class="q-nav">
          <button type="button" ${idx === 0 ? "disabled" : ""} class="btn btn-outline" data-action="quiz-prev">← previous (read-only)</button>
          ${isLast
            ? `<span class="q-nav-note">${checkedCount === items.length ? "all items checked" : "check this item to finish"}</span>`
            : `<button type="button" ${!isLocked ? "disabled" : ""} ${!isLocked ? `title="Check the current item to unlock the next one"` : `title="Next question"`} class="btn btn-outline q-next ${isLocked ? "q-next-ready" : ""}" data-action="quiz-next">${isLocked ? "next question →" : "next (locked until checked)"}</button>`}
        </div>
      `)}
    </div>`;
  },

  pick(state, oi) {
    const mode = state.mode;
    const items = QUIZ[mode];
    const q = items[Math.min(this.idx ?? 0, items.length - 1)];
    const isLocked = !!(state.quiz.checked ?? {})[q.id];
    if (isLocked) return; // answer lock: a checked item can never be re-answered
    store.patch((s) => ({ ...s, quiz: { ...s.quiz, answers: { ...s.quiz.answers, [q.id]: oi } } }));
  },

  check(state) {
    const mode = state.mode;
    const items = QUIZ[mode];
    const q = items[Math.min(this.idx ?? 0, items.length - 1)];
    const picked = state.quiz.answers[q.id];
    const isLocked = !!(state.quiz.checked ?? {})[q.id];
    if (picked === undefined || isLocked) return; // no selection → nothing to validate
    const right = picked === q.correct;
    store.patch((s) => ({
      ...s,
      quiz: {
        ...s.quiz,
        checked: { ...(s.quiz.checked ?? {}), [q.id]: true },
        graded: items.every((it) => it.id === q.id || (s.quiz.checked ?? {})[it.id]),
      },
    }));
    announce(
      right
        ? `Item ${(this.idx ?? 0) + 1} correct. ${q.explanation.slice(0, 140)}`
        : `Item ${(this.idx ?? 0) + 1} incorrect — correct answer ${String.fromCharCode(65 + q.correct)}. ${q.explanation.slice(0, 120)}`,
    );
  },

  next() {
    this.idx = Math.min((this.idx ?? 0) + 1, 99);
  },

  prev() {
    this.idx = Math.max((this.idx ?? 0) - 1, 0);
  },
};
