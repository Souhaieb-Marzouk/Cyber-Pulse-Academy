/* ============================================================
   TRANSMISSION BENCH — STATIC BUILD · quiz
   QUIZ — knowledge-check panel: rendering, scoring, one-shot answering with the color contract (only the picked option is colored; wrong never reveals the answer).
   (Code re-filed 1:1 from the original single-file lab;
    see conversion-notes.md. Content and behavior unchanged.)
   ============================================================ */

"use strict";

/* ---------------- quiz panel ---------------- */

function renderQuiz(){
  var host = $id("panel-quiz");
  host.innerHTML = "";
  var qs = quizFor();
  var h = el("div", "panel-head");
  h.innerHTML = '<h2>Knowledge check</h2><span class="ph-sub">' +
    (S.mode === "medium" ? "Concept questions — an explanation follows every answer." : "Scenario items — application, not recall. Locked after answering.") + '</span>' +
    '<span class="chip" id="quizScore"></span>';
  host.appendChild(h);
  var ans = st().quiz.answers;
  qs.forEach(function(q, i){
    var card = el("div", "qcard");
    var answered = ans[i] !== undefined;
    card.innerHTML = '<span class="q-tag">Q' + (i+1) + " / " + qs.length + '</span><p class="q-text">' + esc(q.q) + '</p>';
    var opts = el("div", "qopts");
    q.opts.forEach(function(op, j){
      var b = el("button", "qopt");
      b.type = "button";
      b.textContent = op;
      if(answered){
        b.disabled = true;
        // R3 color contract: ONLY the selected answer is highlighted —
        // green if it was correct, red if wrong; the correct option is
        // never revealed by color on a wrong submission.
        if(j === ans[i]) b.classList.add(ans[i] === q.ans ? "correct" : "wrong");
      } else {
        b.setAttribute("data-act", "quiz");
        b.setAttribute("data-q", String(i));
        b.setAttribute("data-opt", String(j));
      }
      opts.appendChild(b);
    });
    card.appendChild(opts);
    if(answered){
      var ok = ans[i] === q.ans;
      var ex = el("div", "q-expl " + (ok ? "ok" : "no"));
      ex.innerHTML = ok ? "<strong>Correct.</strong> " + esc(q.expl) :
        "<strong>Not quite — you picked &ldquo;" + esc(q.opts[ans[i]]) + "&rdquo;; the correct answer is &ldquo;" + esc(q.opts[q.ans]) + ".&rdquo;</strong> " + esc(q.expl);
      card.appendChild(ex);
    }
    host.appendChild(card);
  });
  updateQuizScore();
}
function updateQuizScore(){
  var elq = $id("quizScore");
  if(!elq) return;
  var qs = quizFor(), ans = st().quiz.answers;
  var correct = 0, n = 0;
  qs.forEach(function(q, i){ if(ans[i] !== undefined){ n++; if(ans[i] === q.ans) correct++; } });
  elq.textContent = "SCORE " + correct + " / " + qs.length + (n === qs.length ? " · COMPLETE" : "");
  if(n === qs.length && !st().quiz.done){
    st().quiz.done = true; save();
    toast("Knowledge check complete — open FINISH on the cert card");
    renderCard(); updateMeter();
  }
}
function answerQuiz(qi, oi){
  var st0 = st();
  if(st0.quiz.answers[qi] !== undefined) return;
  st0.quiz.answers[qi] = oi;
  save();
  renderQuiz(); updateMeter(); renderCard();
  var ok = quizFor()[qi].ans === oi;
  sr(ok ? "Correct answer." : "Incorrect answer — explanation shown.");
}
