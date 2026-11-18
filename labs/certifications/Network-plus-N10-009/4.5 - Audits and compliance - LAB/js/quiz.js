/* ═══════════════════════════════════════════════════════════════════════════
   quiz.js — the Exit Interview (DES 6).
   Ported from src/components/lab/QuizPanel.tsx. One attempt per question,
   only the chosen option is highlighted after validation (never reveals the
   correct option on a miss), explanation always shown, progress squares,
   Previous/Next pager, and the closing gate. 0.22 s slide per question.
   ═══════════════════════════════════════════════════════════════════════════ */

window.LAB_QUIZ = (function () {
  "use strict";

  const U = window.LAB_UI;
  const S = window.LAB_STORE;
  const D = window.LAB_DATA;

  // Local pager index — the original keeps it in component state, which resets
  // whenever the zone unmounts; here it resets whenever the zone re-renders.
  let idx = 0;
  function resetIdx() { idx = 0; }

  function panel() {
    const st = S.state;
    const hard = st.mode === "hard";
    const quiz = hard ? D.QUIZ_HARD : D.QUIZ_MEDIUM;
    const root = U.el('<div class="zone-stack quiz-zone"></div>');

    function render() {
      const st = S.state;
      const q = quiz[idx];
      const chosen = st.quiz.answers[q.id];
      const answered = Boolean(chosen);
      const allAnswered = quiz.every((x) => st.quiz.answers[x.id]);
      const correctCount = quiz.filter((x) => st.quiz.answers[x.id] === x.correct).length;
      root.innerHTML = "";

      // header strip
      root.appendChild(U.el('<div class="desk-strip"><div class="desk-strip-top"><span class="zone-area">DESK 6</span>' +
        '<h2 class="zone-title">Exit Interview — the Lead Auditor checks your understanding</h2></div>' +
        '<p class="desk-blurb">' + (hard
          ? "Seven scenario calls. One attempt each — efficiency and accuracy drive the score."
          : "Six concept questions. One attempt each; every answer comes with an explanation.") + "</p></div>"));

      // progress squares
      const prog = U.el('<div class="quiz-prog" role="group" aria-label="Interview progress"></div>');
      quiz.forEach((qq, i) => {
        const done = Boolean(st.quiz.answers[qq.id]);
        const ok = st.quiz.answers[qq.id] === qq.correct;
        const b = U.el('<button type="button" class="quiz-dot' + (i === idx ? " active" : done ? (ok ? " ok" : " missed") : "") + '" aria-label="Question ' + (i + 1) + (done ? (ok ? " — correct" : " — missed") : "") + '"' + (i === idx ? ' aria-current="true"' : "") + ">" + (i + 1) + "</button>");
        b.addEventListener("click", () => { idx = i; render(); });
        prog.appendChild(b);
      });
      prog.appendChild(U.el('<span class="quiz-count">' + correctCount + "/" + quiz.length + " correct</span>"));
      root.appendChild(prog);

      // question card
      const card = U.el('<section class="quiz-card" aria-labelledby="quiz-' + q.id + '-t">' +
        '<h3 class="quiz-prompt" id="quiz-' + q.id + '-t">' + (idx + 1) + ". " + U.esc(q.prompt) + "</h3>" +
        (q.artifact ? '<pre class="quiz-artifact">' + U.esc(q.artifact) + "</pre>" : "") +
        '<div class="quiz-options" role="radiogroup" aria-label="Options for question ' + (idx + 1) + '"></div>' +
        '<div class="quiz-explain" role="status" aria-live="polite"></div>' +
        '<div class="quiz-nav"></div>' +
        "</section>");
      card.classList.add("anim-slide");

      const optsWrap = card.querySelector(".quiz-options");
      q.options.forEach((o) => {
        const isChosen = chosen === o.id;
        const b = U.el('<button type="button" role="radio" aria-checked="' + isChosen + '"' + (answered ? " disabled" : "") + ' class="quiz-opt' +
          (answered && isChosen && chosen === q.correct ? " chosen-correct" : "") +
          (answered && isChosen && chosen !== q.correct ? " chosen-wrong" : "") +
          (answered && !isChosen ? " dimmed" : "") + '">' +
          '<span class="quiz-opt-mark" aria-hidden="true">' +
          (answered && isChosen && chosen === q.correct ? U.icon("check-circle-2", 16, "ok-ic") :
           answered && isChosen && chosen !== q.correct ? U.icon("x-circle", 16, "no-ic") :
           '<span class="quiz-opt-circle"></span>') +
          '</span><span class="quiz-opt-label">' + U.esc(o.label) + "</span></button>");
        if (!answered) {
          b.addEventListener("click", () => {
            S.actions.setQuizAnswer(q.id, o.id);
            render(); // reveal state for this question
          });
        }
        optsWrap.appendChild(b);
      });

      if (answered) {
        card.querySelector(".quiz-explain").appendChild(U.el('<p class="quiz-explain-p ' + (chosen === q.correct ? "pass" : "fail") + '">' +
          (chosen === q.correct ? U.stamp("Correct", "green", -3, "fb-stamp") : U.stamp("Missed", "red", -3, "fb-stamp")) +
          U.esc(q.explain) + "</p>"));
      }

      const nav = card.querySelector(".quiz-nav");
      const prev = U.el('<button type="button" class="btn btn-ghost" data-quiz-prev' + (idx === 0 ? " disabled" : "") + ">" + U.icon("arrow-left", 16) + " Previous</button>");
      prev.addEventListener("click", () => { if (idx > 0) { idx = Math.max(0, idx - 1); render(); } });
      nav.appendChild(prev);
      if (idx < quiz.length - 1) {
        const next = U.el('<button type="button" class="btn btn-check" data-quiz-next>Next ' + U.icon("arrow-right", 16) + "</button>");
        next.addEventListener("click", () => { idx = Math.min(quiz.length - 1, idx + 1); render(); });
        nav.appendChild(next);
      } else {
        const close = U.el('<button type="button" class="btn btn-ink" data-quiz-close' + (!allAnswered || st.quiz.done ? " disabled" : "") + ">" + (st.quiz.done ? "Interview closed ✓" : "Close the interview") + "</button>");
        close.addEventListener("click", () => {
          if (!allAnswered || S.state.quiz.done) return;
          S.actions.finishQuiz();
          render();
        });
        nav.appendChild(close);
        if (!allAnswered) root.appendChild(U.el('<p class="quiz-must">Answer every question to close the interview.</p>'));
      }
      root.appendChild(card);

      // why an interview
      root.appendChild(U.el('<div class="quiz-why"><div class="section-title"><h3>Why an interview?</h3><div class="section-rule" aria-hidden="true"></div></div>' +
        "<p>The lab&#39;s four pillars — understand, recognize, detect, mitigate — are proven twice: once in the field (objectives) and once at the desk (this interview). Both feed your final score, 70 / 30.</p></div>"));
    }

    render();
    return root;
  }

  return { panel, resetIdx };
})();
