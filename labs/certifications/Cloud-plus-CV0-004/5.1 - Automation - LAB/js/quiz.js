/* ============================================================
   THE AUTOMATION WORKS — Cloud+ CV0-004 · Lesson 5.1 practice lab
   js/quiz.js — knowledge check: render, answer-lock, finish

   Faithful 1:1 static port of the original single-file lab.
   Code lines are unchanged; they were only regrouped per concern.
   Load order: state.js -> ui.js -> data.js -> objectives.js -> quiz.js -> app.js
   (data.js must come after ui.js: work-order machine hooks call cvHook at load.)
   ============================================================ */
"use strict";
/* ===== QUIZ (C5) ===== */
/* ================= QUIZ (C5) ================= */
function renderQuiz(){
  const qs = QUIZ[S.mode];
  $("quizIntro").innerHTML = S.mode==="hard"
    ? "Night-shift inspection: <b>scenario items</b> — triage the artifact, pick and justify. Every answer locks in with its explanation. No retakes within this shift."
    : "Six inspection questions after your floor rotation. Every answer explains itself — wrong answers teach, they never punish beyond the star rating.";
  $("quizSheet").innerHTML = qs.map((q,qi) => {
    const picked = S.quiz.ans[qi];
    const opts = q.opts.map((o,oi) => {
      const isPicked = picked===oi;
      const reveal = picked!==undefined && isPicked ? ` style="border-color:${picked===q.correct?"var(--teal)":"var(--red)"}"` : "";
      return `<button type="button" class="opt" data-qi="${qi}" data-oi="${oi}" aria-pressed="${isPicked}" ${picked!==undefined?"disabled":""}${reveal}><span class="key">${String.fromCharCode(65+oi)}</span><span>${esc(o)}</span></button>`;
    }).join("");
    const exp = picked!==undefined ? `<div class="qExp show ${picked===q.correct?"good":"bad"}">${qExpHTML(q, picked)}</div>` : `<div class="qExp" data-qexp="${qi}"></div>`;
    return `<div class="qCard"><p class="qText"><span class="qNo">Q${qi+1}.</span>${esc(q.q)}</p><div class="pickOpts">${opts}</div>${exp}</div>`;
  }).join("");
  if(S.quiz.done){
    $("quizScore").textContent = `Quiz recorded: ${S.quiz.score}/${qs.length}`;
    $("btnQuizFinish").disabled = true; $("btnQuizFinish").textContent = "QUIZ COMPLETE";
    if(S.completed && !$("btnPlaque")){
      const b = document.createElement("button"); b.className="ghostBtn"; b.id="btnPlaque"; b.type="button";
      b.dataset.plaque="1"; b.textContent="REOPEN CERTIFICATION PLAQUE"; $("quizScore").after(b);
    }
  }
}
function qExpHTML(q, picked){
  const good = picked===q.correct;
  const pointer = good ? "" : ` The correct choice is <b>(${String.fromCharCode(65+q.correct)})</b>.`;
  return `<b>${good?"Correct.":"Not quite."}</b>${pointer} ${esc(q.exp)}`;
}
function quizAnswer(qi, oi){
  if(S.quiz.ans[qi]!==undefined) return;
  const q = QUIZ[S.mode][qi];
  S.quiz.ans[qi] = oi;
  const card = document.querySelectorAll(".qCard")[qi];
  if(card){
    const exp = card.querySelector(".qExp");
    exp.className = "qExp show "+(oi===q.correct?"good":"bad");
    exp.innerHTML = qExpHTML(q, oi);
    card.querySelectorAll(".opt").forEach((b,idx)=>{ b.disabled=true; if(idx===oi) b.style.borderColor = oi===q.correct ? "var(--teal)" : "var(--red)"; });
  }
  announce(oi===q.correct ? "Correct. "+q.exp : "Not quite. "+q.exp);
  save();
}
function finishQuiz(){
  const qs = QUIZ[S.mode];
  const answered = Object.keys(S.quiz.ans).length;
  if(S.quiz.done) return;
  if(answered < qs.length){ $("quizScore").textContent = `Answer all questions first — ${qs.length-answered} remaining.`; announce(`${qs.length-answered} quiz questions still unanswered.`); return; }
  let score = 0; qs.forEach((q,qi)=>{ if(S.quiz.ans[qi]===q.correct) score++; });
  S.quiz.done = true; S.quiz.score = score;
  renderQuiz();
  announce(`Quiz complete: ${score} out of ${qs.length}.`);
  save(); maybeComplete();
}
