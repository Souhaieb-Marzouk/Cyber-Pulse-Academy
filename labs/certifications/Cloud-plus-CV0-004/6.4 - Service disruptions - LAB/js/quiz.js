/* ===================
   The Network Clinic — CV0-004 Lesson 6.4 static port — board exam: rendering, scoring, lock
   Vanilla ES2020+, classic scripts, load order: data -> state -> objectives -> quiz -> ui -> app.
   Bodies are verbatim from the audited build; only code motion, no logic edits.
   ============================================================ */
"use strict";

function renderQuiz() {
  const qs = QUIZ.map((q, i) => ({ ...q, i }));
  const mine = qs.filter((q) => q.m === (S.mode === "medium" ? "M" : "H"));
  const sub = S.quiz.submitted;
  $("#examModeNote").textContent = S.mode === "medium" ? "Open-book concept check — 6 questions" : "Scenario examination — 8 items, analysis required";
  $("#examIntro").textContent = S.mode === "medium"
    ? "Board exam, day-shift rules: open notes (the Attending's reference is right above), every answer gets an explanation, and a wrong answer costs pride only."
    : "Board exam, night-shift rules: every item is a scenario you just lived through. Justification is built into the options — choose the one you could defend at 3 a.m.";
  $("#quizList").innerHTML = mine.map((q) => {
    const pick = S.quiz.a[q.i];
    const right = sub ? String(pick) === String(q.a) : null;
    return '<div class="qcard"><div class="q-txt">Q' + (mine.indexOf(q) + 1) + ". " + esc(q.q) + "</div>" +
      q.o.map((o, j) => {
        const picked = String(pick) === String(j);
        const cls = "choice" + (sub && picked ? (right ? " pick-right" : " pick-wrong") : "");
        const flag = sub && picked ? '<span class="pick-flag">' + (right ? "\u2713 correct" : "\u2717 incorrect") + "</span>" : "";
        return '<label class="' + cls + '"><input type="radio" name="q' + q.i + '" data-field="quiz:' + q.i + '" value="' + j + '"' + (picked ? " checked" : "") + (sub ? " disabled" : "") + "><span>" + esc(o) + "</span>" + flag + "</label>";
      }).join("") +
      (sub ? '<div class="q-explain">' + (right ? "<strong>Correct.</strong> " : "<strong>Not quite.</strong> ") + esc(q.e) + "</div>" : "") + "</div>";
  }).join("");
  if (sub) {
    const total = mine.length;
    $("#quizScore").hidden = false;
    $("#quizScore").innerHTML = "<strong>Board exam scored: " + S.quiz.correct + " / " + total + ".</strong> " + (S.quiz.correct === total ? "Distinction. The attending has nothing to add." : "Review the explanations above — each wrong pick is a real-world 3 a.m. mistake.");
  }
}

function quizSubmit() {
  if (S.quiz.submitted) { toast("The board exam is already scored — answers and explanations are on the cards."); return; }
  const mine = QUIZ.map((q, i) => ({ ...q, i })).filter((q) => q.m === (S.mode === "medium" ? "M" : "H"));
  let correct = 0; const unanswered = [];
  mine.forEach((q) => { const v = S.quiz.a[q.i]; if (v === undefined) unanswered.push(q.i); else if (String(v) === String(q.a)) correct++; });
  if (unanswered.length) { toast("Answer every item first — " + unanswered.length + " left blank.", "warn"); return; }
  S.quiz.submitted = true; S.quiz.correct = correct;
  logAdd("Board examination submitted: " + correct + "/" + mine.length + ".");
  save(); renderQuiz(); updateTaskListMeta();
  toast("Board exam scored: " + correct + "/" + mine.length + ". Explanations are now on every card.");
}
