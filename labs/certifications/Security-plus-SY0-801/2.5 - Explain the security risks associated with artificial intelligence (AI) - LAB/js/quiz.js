"use strict";
/* =====================================================================
   Harbor Watch — js/quiz.js
   Knowledge/scenario quiz ported verbatim from the original framework lab.
   quizAnswer/quizNext are the original inline dispatcher bodies, moved here
   unchanged so quiz logic lives in its own module (readability only).
   ===================================================================== */

function quizUnlocked(){ return doneCount() >= Math.ceil(objs().length*0.6); }

function renderQuiz(){
 const Q = S.mode==="hard"?QUIZ_H:QUIZ_M;
 const pts = S.mode==="hard"?6:5;
 if(!quizUnlocked()){
  $("quiz-cards").innerHTML = `<div class="card">${cardHead("LOCKED","Knowledge check","completes the lab")}
   <div class="card-body"><p>Finish at least <strong>${Math.ceil(objs().length*0.6)} of ${objs().length}</strong> objectives (${doneCount()} done) to unlock the quiz.</p></div></div>`;
  return;
 }
 if(S.quiz.done){
  $("quiz-cards").innerHTML = `<div class="card">${cardHead("RESULT","Knowledge check complete","")}
   <div class="card-body"><p>Score: <strong>${S.quiz.score} / ${Q.length*pts}</strong> — ${S.quiz.score===Q.length*pts?"flawless.":S.quiz.score>=Q.length*pts*0.7?"solid work.":"review the debrief, then RETAKE from the Reset menu if you want a clean sheet."}</p></div></div>`;
  return;
 }
 const i = Math.min(S.quiz.i, Q.length-1);
 const q = Q[i];
 const chosen = S.quiz.ans[i];
 const opts = q.o.map((o,j)=>{
  let cls="qopt";
  /* R3: ONLY the chosen answer is highlighted — green if it was correct, red if wrong.
     The correct option is never revealed in green on a wrong submission. */
  if(chosen!==undefined && j===chosen) cls += (j===q.a ? " correct" : " wrong");
  return `<button class="${cls}" data-act="quiz-ans" data-i="${i}" data-j="${j}" ${(chosen!==undefined)?"disabled":""}>${String.fromCharCode(65+j)}. ${esc(o)}</button>`;
 }).join("");
 const exp = chosen!==undefined ? `<div class="qexp"><strong>${chosen===q.a?"Correct.":"Not quite."}</strong> ${esc(q.e)}</div>` : "";
 const next = chosen!==undefined ? `<div class="quiz-nav"><button class="obtn" data-act="quiz-next">${i<Q.length-1?"NEXT QUESTION":"FINISH QUIZ"}</button></div>` : "";
 $("quiz-cards").innerHTML = `<div class="card">${cardHead("QUESTION "+(i+1)+" OF "+Q.length, esc(q.q), pts+" pts")}
  <div class="card-body"><div class="quiz-q"><div class="quiz-opts">${opts}</div>${exp}${next}</div></div></div>`;
}


/* ---- answer/next flow (verbatim bodies from the original dispatcher) ---- */
function quizAnswer(btn){
  const i=+btn.dataset.i, j=+btn.dataset.j;
  const Q = S.mode==="hard"?QUIZ_H:QUIZ_M; const pts = S.mode==="hard"?6:5;
  if(S.quiz.ans[i]!==undefined) return;
  S.quiz.ans[i]=j;
  if(j===Q[i].a){ S.quiz.score += pts; announce("Correct. "+Q[i].e); } else { announce("Incorrect. "+Q[i].e); }
  save(); renderQuiz(); updateHeader();
}
function quizNext(){
  const Q = S.mode==="hard"?QUIZ_H:QUIZ_M;
  if(S.quiz.i < Q.length-1){ S.quiz.i++; }
  else { S.quiz.done = true; }
  save(); renderQuiz(); if(allDone() && S.quiz.done && !S.done) complete();
}
