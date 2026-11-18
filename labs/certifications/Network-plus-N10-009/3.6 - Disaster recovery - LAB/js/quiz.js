// Operation THAWLINE — static port: Board Review quiz (board 07).
// Faithful re-render of src/components/lab/boards/board-review.tsx including
// the audited lifecycle (Fixes Ledger FIX-1/2/3/5):
//   - progressive disclosure: only validated questions and the first
//     unanswered one render — later questions are structurally unreachable;
//   - pre-validation selection is free; CHECK ANSWER locks the answer;
//   - after validation ONLY the selected option is highlighted (green when
//     correct, red when wrong) — the correct answer is never revealed by
//     color, only taught in text;
//   - options are shuffled deterministically per mode+item (stable seeds), so
//     the correct position rotates; grading is by option id.
// Depends on globals: LabUI, LabData, LabStore, shuffledBySeed.

var LabQuiz = (function () {
  "use strict";

  /* focus handoff state (mirrors justValidated / goToNext in the original) */
  let focusFeedbackFor = null; // quiz item id whose feedback should receive focus after render

  function bank(mode) {
    return mode === "hard" ? LabData.QUIZ_HARD : LabData.QUIZ_MEDIUM;
  }

  function quizCard(item, index, total, mode, isCurrent) {
    const u = LabUI;
    const answers = LabStore.state.answers;
    const options = shuffledBySeed(item.options, (mode === "hard" ? "hard-opts:" : "medium-thaw:") + item.id);
    const validatedPick = answers["quiz." + item.id];
    const validated = validatedPick !== undefined;
    const picked = validated ? validatedPick : preSelection[item.id] ?? null;
    const pickedOption = picked ? options.find((o) => o.id === picked) : undefined;
    const correctOption = options.find((o) => o.id === item.correct);
    const pickedIsCorrect = picked === item.correct;

    let optionsHtml = "";
    for (const opt of options) {
      const isPicked = picked === opt.id;
      // color contract (R3): after validation ONLY the selected answer is
      // highlighted; the correct option is NOT revealed on a wrong submission.
      const revealedAndCorrect = validated && isPicked && opt.id === item.correct;
      const revealedAndWrong = validated && isPicked && opt.id !== item.correct;
      let cls = "quiz-option";
      if (!validated) {
        if (isPicked) cls += " picked-pre";
      } else {
        cls += " validated";
        if (revealedAndCorrect) cls += " revealed-correct";
        else if (revealedAndWrong) cls += " revealed-wrong";
        else cls += " revealed-other";
      }
      optionsHtml +=
        '<button type="button" role="radio" tabindex="-1" data-action="quiz-pick" data-item="' + item.id + '" ' +
        'data-opt="' + opt.id + '" data-focus-id="opt-' + item.id + "-" + opt.id + '"' + (validated ? " disabled" : "") + ' ' +
        'aria-checked="' + (isPicked ? "true" : "false") + '" class="' + cls + '">' +
        (revealedAndCorrect ? u.icon("CheckCircle2") : revealedAndWrong ? u.icon("XCircle") : "") +
        u.esc(opt.text) +
        "</button>";
    }

    let feedbackHtml = "";
    if (validated && pickedOption) {
      feedbackHtml =
        '<div class="quiz-feedback ' + (pickedIsCorrect ? "ok" : "fail") + '" tabindex="-1" aria-live="polite" data-feedback="' + item.id + '">' +
        '<p><strong>' + (pickedIsCorrect ? "Correct. " : "Not this one. ") + "</strong>" + u.esc(pickedOption.why) + "</p>" +
        (!pickedIsCorrect && correctOption
          ? '<p><strong>Correct answer: &ldquo;' + u.esc(correctOption.text) + '.&rdquo; </strong>' + u.esc(correctOption.why) + "</p>"
          : "") +
        '<p class="qf-tests">Tests: ' + u.esc(item.topic) + " — " + u.esc(item.study) + ".</p>" +
        "</div>";
    }

    let actionsHtml = "";
    if (!validated) {
      actionsHtml =
        '<div class="quiz-actions">' +
        '<button type="button" class="btn btn-spruce btn-h10" data-action="quiz-check" data-item="' + item.id + '"' +
        (!picked ? " disabled" : "") +
        ' data-focus-id="quiz-check-' + item.id + '"' +
        ' aria-label="Check answer for question ' + (index + 1) + '">' + u.icon("ListChecks") + "CHECK ANSWER</button>" +
        (!picked
          ? '<span class="quiz-action-note">Select an answer to enable the check.</span>'
          : '<span class="quiz-action-note">Checking locks your answer for this question.</span>') +
        "</div>";
    } else if (isCurrent) {
      actionsHtml =
        '<div class="quiz-next-row">' +
        '<button type="button" class="btn btn-outline-spruce btn-h10" data-action="quiz-next" data-index="' + (index + 1) + '" ' +
        'data-focus-id="quiz-next-' + (index + 1) + '" ' +
        'aria-label="Move to the next question">Next question ' + u.icon("ArrowDown") + "</button></div>";
    }

    let cardCls = "quiz-card";
    if (validated) cardCls += pickedIsCorrect ? " ok" : " wrong";
    else if (isCurrent) cardCls += " current";

    return (
      '<section id="quiz-q-' + (index + 1) + '" class="' + cardCls + '" aria-label="Question ' + (index + 1) + " of " + total + '">' +
      '<div class="quiz-stem-row"><span class="quiz-qnum">Q' + (index + 1) + "/" + total + "</span>" +
      '<p class="quiz-stem">' + u.esc(item.stem) + "</p></div>" +
      '<div class="quiz-options" role="radiogroup" aria-label="' + u.esc(item.stem) + '">' + optionsHtml + "</div>" +
      actionsHtml +
      feedbackHtml +
      "</section>"
    );
  }

  /* local pre-validation selection (not persisted — same as the original's
     useState in QuizCard) */
  const preSelection = {};

  function render(mode) {
    const u = LabUI;
    const answers = LabStore.state.answers;
    const bk = bank(mode);
    const p = LabStore.progress();
    const answered = bk.filter((q) => answers["quiz." + q.id] !== undefined).length;
    // mandatory progression (R2)
    const firstUnanswered = bk.findIndex((q) => answers["quiz." + q.id] === undefined);
    const visible = firstUnanswered === -1 ? bk.length : firstUnanswered + 1;

    let cards = "";
    for (let i = 0; i < visible; i++) {
      cards += quizCard(bk[i], i, bk.length, mode, i === firstUnanswered);
    }

    const intro =
      mode === "medium"
        ? "Six concept questions, one at a time. Pick an answer, press CHECK ANSWER — your choice locks, the explanation appears, and the next question opens."
        : "Seven scenario items, one at a time — apply the concepts to situations, not definitions. Checking locks your answer and opens the next item.";

    return (
      '<div class="board-tight" id="quiz-area">' +
      LabUI.sectionTitle("Board Review — concept check", "Board 07") +
      '<p class="quiz-intro">' + intro + "</p>" +
      '<div class="quiz-status">Answered <strong>' + answered + "</strong> of " + bk.length +
      ' · score so far <strong style="font-family:var(--font-doc)">' + p.quizCorrect + "/" + p.quizTotal + "</strong> — it feeds 30% of the final score.</div>" +
      '<div class="quiz-list">' + cards + "</div>" +
      (answered === bk.length
        ? '<div class="quiz-done">Board review complete — every item answered and locked. The result feeds 30% of your debrief score, and any misses are listed under <strong>Focus areas</strong> in the completion report.</div>'
        : "") +
      "</div>"
    );
  }

  /* post-render focus/scroll handling (called by the app after re-render) */
  function afterRender() {
    if (focusFeedbackFor) {
      const fb = document.querySelector('[data-feedback="' + focusFeedbackFor + '"]');
      if (fb) fb.focus();
      focusFeedbackFor = null;
    }
  }

  function pick(itemId, optId) {
    preSelection[itemId] = optId;
    rerenderCurrent();
  }

  function check(itemId) {
    const mode = LabStore.state.mode;
    if (!mode) return;
    const picked = preSelection[itemId];
    if (!picked) return;
    if (LabStore.state.answers["quiz." + itemId] !== undefined) return; // already locked
    focusFeedbackFor = itemId;
    LabStore.setAnswer("quiz." + itemId, picked); // store write + lock
  }

  function next(index) {
    // scroll to the next question and focus its first option (parity with
    // goToNext in the original)
    const el = document.getElementById("quiz-q-" + (index + 1));
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      const first = el.querySelector("button[role=radio]");
      if (first) first.focus();
    }
  }

  function rerenderCurrent() {
    const stage = document.getElementById("stage-content");
    const mode = LabStore.state.mode;
    if (!stage || !mode) return;
    LabApp.renderStageInto(stage, mode);
    afterRender();
  }

  return {
    render: render,
    pick: pick,
    check: check,
    next: next,
    afterRender: afterRender,
  };
})();
