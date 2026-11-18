// ─── Shift Quiz kiosk (ported from sections.tsx#QuizKiosk) ──────────────────
// One-shot answers (locked after pick). R3 color contract: ONLY the picked option
// is highlighted after the validating press — green when it was correct, red when
// it was wrong; unpicked options (including the correct one on a wrong submission)
// stay neutral; the explanation teaches. Color is never the sole carrier (icons
// + explanation text carry meaning too).

(function () {
  "use strict";

  const LAB = () => window.LAB;
  const Store = () => window.LabStore;
  const Engine = () => window.LabEngine;
  const { esc, icon } = window.LabUI;

  function quizSectionHTML(mode) {
    const qs = LAB().QUIZ[mode];
    const answered = qs.filter((q) => Store().state.quizAnswers[q.id] !== undefined).length;
    const correct = qs.filter((q) => Store().state.quizAnswers[q.id] === q.correct).length;
    const sub = mode === "medium"
      ? "Seven concept questions. Answer, lock, and read the why — the explanation is the point."
      : "Seven scenario calls from tonight's storm. No retakes per question: choose like it's 02:00.";

    return `<section id="quiz" class="card quiz" aria-labelledby="quiz-h">
      ${window.LabUI.sectionHeading("Certification checkpoint", "Shift Quiz", sub)}
      <div class="quiz-counter">
        ${icon("badgeCheck")}
        <p aria-live="polite" id="quiz-counter-text">answered <b>${answered}</b>/${qs.length} · correct <b class="text-primary">${correct}</b></p>
      </div>
      <ol class="quiz-list">${qs.map((q, qi) => quizItemHTML(q, qi, mode)).join("")}</ol>
      ${answered === qs.length ? quizBannerHTML(mode) : ""}
    </section>`;
  }

  function quizItemHTML(q, qi, mode) {
    const picked = Store().state.quizAnswers[q.id];
    const locked = !!Store().state.quizLocked[q.id];
    return `<li class="quiz-item" data-quiz-qid="${q.id}">
      <fieldset>
        <legend class="quiz-legend"><span class="quiz-num">Q${qi + 1}</span>${esc(q.prompt)}</legend>
        <div class="quiz-options">${q.options.map((o) => quizOptionHTML(q, o, picked, locked)).join("")}</div>
      </fieldset>
      ${locked ? quizExplainHTML(q) : ""}
    </li>`;
  }

  function quizOptionHTML(q, o, picked, locked) {
    const isPicked = picked === o.id;
    const isCorrect = o.id === q.correct;
    const rightPick = locked && isPicked && isCorrect;
    const wrongPick = locked && isPicked && !isCorrect;
    const cls = rightPick ? "quiz-opt quiz-opt-right" : wrongPick ? "quiz-opt quiz-opt-wrong" : locked ? "quiz-opt quiz-opt-locked" : "quiz-opt";
    return `<button type="button" ${locked ? "disabled" : ""} aria-pressed="${isPicked}"
      data-action="quiz-answer" data-qid="${q.id}" data-oid="${o.id}" class="${cls}">
      ${rightPick ? icon("checkCircle", "quiz-icon-emerald") : ""}${wrongPick ? icon("x", "quiz-icon-red") : ""}<span>${esc(o.label)}</span>
    </button>`;
  }

  function quizExplainHTML(q) {
    return `<div aria-live="polite" class="quiz-explain">${icon("bookMarked")}<span>${esc(q.explain)}</span></div>`;
  }

  function quizBannerHTML(mode) {
    const qs = LAB().QUIZ[mode];
    const picked = Store().state.quizAnswers;
    const correct = qs.filter((q) => picked[q.id] === q.correct).length;
    return `<div class="quiz-banner" aria-live="polite">Checkpoint complete — ${correct}/${qs.length} correct. ${correct === qs.length ? "Flawless board work." : "Re-read the explanations above; every miss is a floor worth revisiting."}</div>`;
  }

  // granular patch for one question (keeps focus on the pressed button)
  function patchQuizQuestion(qid) {
    const mode = Store().state.mode;
    const qs = LAB().QUIZ[mode];
    const qi = qs.findIndex((q) => q.id === qid);
    if (qi === -1) return;
    const q = qs[qi];
    const li = document.querySelector(`[data-quiz-qid="${qid}"]`);
    if (!li) return;
    const picked = Store().state.quizAnswers[qid];
    const locked = !!Store().state.quizLocked[qid];
    const optionsHost = li.querySelector(".quiz-options");
    optionsHost.innerHTML = q.options.map((o) => quizOptionHTML(q, o, picked, locked)).join("");
    // explanation appears after lock
    const existing = li.querySelector(".quiz-explain");
    if (locked && !existing) li.insertAdjacentHTML("beforeend", quizExplainHTML(q));
    // counters + banner
    updateQuizCounters();
    if (qs.every((x) => Store().state.quizAnswers[x.id] !== undefined)) {
      const section = document.getElementById("quiz");
      if (section && !section.querySelector(".quiz-banner")) {
        section.insertAdjacentHTML("beforeend", quizBannerHTML(mode));
      }
    }
  }

  function updateQuizCounters() {
    const mode = Store().state.mode;
    const qs = LAB().QUIZ[mode];
    const answered = qs.filter((q) => Store().state.quizAnswers[q.id] !== undefined).length;
    const correct = qs.filter((q) => Store().state.quizAnswers[q.id] === q.correct).length;
    const text = document.getElementById("quiz-counter-text");
    if (text) text.innerHTML = `answered <b>${answered}</b>/${qs.length} · correct <b class="text-primary">${correct}</b>`;
  }

  window.LabQuiz = { quizSectionHTML, patchQuizQuestion, updateQuizCounters };
})();
