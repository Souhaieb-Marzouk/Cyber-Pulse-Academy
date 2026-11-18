// QUIZ — examination renderer and grader — MVHA Custody Bureau (Security+ SY0-801 · 3.3) — static port v4.
// Source: single-file lab, byte-identical content. All content is synthetic training material.

"use strict";
/* ================= QUIZ ================= */
function renderQuiz(){
  const items=QUIZ[S.mode]; if(!items) return;
  const host=$("#quizHost");
  host.innerHTML=items.map((it,i)=>`<div class="q" data-q="${i}">
    <span class="qno">Item ${i+1} of ${items.length}</span>
    <h4>${it.q}</h4>
    <div class="qopts">${it.o.map((o,j)=>`<label><input type="radio" name="q${i}" value="${j}"> ${esc(o[1])}</label>`).join("")}</div>
    <div class="why"></div></div>`).join("");
  const ans=S.quiz.answers||{};
  items.forEach((it,i)=>{ if(ans[i]!==undefined){ const r=$(`input[name="q${i}"][value="${ans[i]}"]`,host); if(r) r.checked=true; } });
  if(S.quiz.done) gradeQuiz(false);
  $("#examLead").innerHTML = S.mode==="medium"
   ? "Seven concept items — answer, submit, and read every explanation."
   : "Seven scenario items — application, not recall. Efficiency and accuracy drive the score.";
}
function gradeQuiz(record){
  const items=QUIZ[S.mode]; const ans=S.quiz.answers||{};
  items.forEach((it,i)=>{ const r=$(`input[name="q${i}"]:checked`); if(r) ans[i]=+r.value; });
  let score=0;
  items.forEach((it,i)=>{
    const q=$(`.q[data-q="${i}"`+"]"); q.classList.add("done");
    $$(".qopts input",q).forEach(r=>r.disabled=true);
    const why=$(".why",q); const sel=ans[i];
    if(sel===undefined){ q.classList.add("wrong"); why.textContent="Left unanswered. "+it.w; }
    else if(sel===it.a){ score++; q.classList.add("correct"); why.textContent="Correct. "+it.w; }
    else { q.classList.add("wrong"); why.textContent=`The correct answer is “${it.o[it.a][1]}”. ${it.w}`; }
  });
  S.quiz.answers=ans;
  if(record){ S.quiz.done=true; S.quiz.score=score; }
  $("#quizScore").textContent=`Examination: ${score} / ${items.length} (${Math.round(score/items.length*100)}%)`;
  $("#quizSubmit").textContent="Retake examination";
  updateDots();
  if(record) announce(`Examination submitted: ${score} of ${items.length} correct. Explanations revealed under each item.`);
  save();
}
