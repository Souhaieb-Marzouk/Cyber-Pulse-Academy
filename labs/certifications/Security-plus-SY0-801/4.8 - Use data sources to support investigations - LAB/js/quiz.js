"use strict";
/* ======================================================
   SY0-801 4.8 Practice Lab — The Evidence Room · quiz.js
Knowledge-check engine: pick -> lock -> explain -> enforced next -> finish,
with the audit-fixed color contract (selected option only).
   ====================================================== */
/* ---- quiz ---- */
function quizList(){return S.mode==="medium"?QUIZM:QUIZH}
function renderQuiz(){
 const qs=quizList();
 const head=h("h2",{},"Knowledge check — "+(S.mode==="medium"?"6 concept questions":"7 scenario items"));
 if(!S.quiz.done){
  const i=Math.min(S.quiz.i,qs.length-1),q=qs[i],ans=S.quiz.ans[i];
  const opts=q.opts.map((op,oi)=>{
   let cls="opt";
   if(ans!=null){if(oi===ans.pick)cls+=" "+(ans.ok?"correct":"wrong")}
   return h("button",{class:cls,onclick:()=>pickQuiz(i,oi),disabled:ans!=null,"aria-pressed":ans!=null&&ans.pick===oi},op)});
  return h("article",{class:"sheet",tabindex:"-1"},

   head,h("p",{class:"lead"},"Question "+(i+1)+" of "+qs.length+(ans==null?" — pick one answer.":"")),
   h("div",{class:"quiz-q"},h("h3",{},q.q)),
   opts,
   ans!=null?h("div",{class:"feedback "+(ans.ok?"ok":"no")},
     h("p",{},ans.ok?"Correct.":"Not quite — your pick is marked in red. "+(q.why&&q.why[ans.pick]?"Why not: "+q.why[ans.pick]:"")),
     h("p",{},"Why the right answer is right: "+q.ex)):null,
   ans!=null?h("div",{class:"obj-actions"},h("button",{class:"btn primary",onclick:()=>{
     if(i+1>=qs.length){S.quiz.done=true;save();openCard("quiz","quiz")}
     else{S.quiz.i=i+1;save();openCard("quiz","quiz")}}},i+1>=qs.length?"Finish check":"Next question")):null)}
 const total=qs.length;
 return h("article",{class:"sheet",tabindex:"-1"},

  head,h("p",{class:"lead"},"Finished — you answered "+S.quiz.correct+" of "+total+" correctly."),
  h("div",{class:"tscroll"},h("table",{},h("thead",{},h("tr",{},["#","question","result"].map(x=>h("th",{},x)))),
   h("tbody",{},qs.map((q,i)=>h("tr",{},h("td",{},i+1),h("td",{},q.q.slice(0,72)+(q.q.length>72?"…":"")),
    h("td",{},S.quiz.ans[i]&&S.quiz.ans[i].ok?"correct":"missed")))))),
  h("div",{class:"obj-actions"},h("button",{class:"btn",onclick:()=>openCard("close","close")},"Close the case →")))}
function pickQuiz(i,oi){
 if(S.quiz.ans[i])return;
 const q=quizList()[i];const ok=oi===q.ans;
 S.quiz.ans[i]={pick:oi,ok:ok};if(ok)S.quiz.correct++;
 announce(ok?"Correct answer.":"Incorrect answer.");
 save();openCard("quiz","quiz")}

/* ---- field notes (C6) ---- */
