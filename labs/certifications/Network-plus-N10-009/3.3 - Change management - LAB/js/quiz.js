/* ================================================================
   js/quiz.js
   Knowledge-check quiz renderer: sequential unlock, answer lock after Check,
   only-selected-answer highlighting (green correct / red wrong, never both).
   ================================================================ */
/* ---- quiz ---- */
function renderQuiz(){
 $("#quizLede").innerHTML=mode()==="medium"
  ?"Six concept questions, unlocked in order: pick an answer, press Check, and the answer locks — the next question opens only after the check. An explanation follows every check."
  :"Seven scenario questions, unlocked in order — each one is a slice of the night you just worked. Pick, Check, and the answer locks before the next opens.";
 const quiz=QUIZ[mode()];
 const firstOpen=quiz.findIndex((q,i)=>S.quiz.checked[i]==null);
 const last=firstOpen===-1?quiz.length-1:firstOpen;
 $("#quizWrap").innerHTML=quiz.map((q,i)=>{
  if(i>last)return "";
  const pick=S.quiz.pick[i],answered=S.quiz.checked[i]!=null;
  const opts=q.o.map((o,j)=>{
   let cls="",mark="";
   if(answered&&pick===j){cls=pick===q.c?"correct":"wrong";mark=`<span class="tag ${pick===q.c?"teal":"red"}" style="margin-left:auto">${pick===q.c?"✓ yours — correct":"✗ yours — wrong"}</span>`;}
   return `<button class="qopt ${cls}" data-act="quizOpt" data-qi="${i}" data-oi="${j}" aria-pressed="${pick===j}" ${answered?"disabled":""}><span class="mono" style="color:var(--amber)">${"ABCD"[j]}</span><span>${esc(o)}</span>${mark}</button>`;
  }).join("");
  const next=answered&&i===last&&i<quiz.length-1?`<p class="small" style="margin:8px 0 0;color:var(--teal)">✓ Answer locked — question ${i+2} is now open below.</p>`:"";
  return `<div class="qcard2"><div class="qq">${i+1}. ${esc(q.q)}</div>${opts}
   ${answered?"":`<button class="btn sm primary" data-act="quizCheck" data-qi="${i}" ${pick==null?"disabled":""}>Check answer</button>`}
   ${next}
   <div class="qexp ${answered?"show":""}"><b>${answered?(pick===q.c?"Correct. ":"Not quite. "):""}</b>${esc(q.e)}</div>
  </div>`;
 }).join("");
}