/* The Flat Net Incident — static build (N10-009 4.6).
   js/quiz.js — Station 6 — knowledge check (Medium 6 items / Hard 7 items).
   Extracted verbatim from download/flat-net-segmentation-lab.html (v2, post-audit). */
"use strict";
/* ================= STATION 6 — QUIZ ================= */
function quizBank(){ return S.mode==="hard"?QUIZ_H:QUIZ_M; }
function stQuiz(){
  var bank=quizBank();
  if(S.quiz.done){
    var correct=S.quiz.answers.filter(function(a){return a&&a.ok;}).length;
    var h='<div class="panel"><h3><span class="n">06</span> Shift exam — complete</h3>'
      +'<p class="lead">Scored <b>'+correct+' / '+bank.length+'</b>. '+(correct===bank.length?"Flawless — the concepts are yours.":"Review the explanations below the questions you missed, then retake if you want a clean sheet — retakes are free, stars only remember your best.")+'</p>'
      +'<button class="btn ghost" id="qretake">'+icon("reset")+' Retake exam</button>';
    bank.forEach(function(q,i){
      var a=S.quiz.answers[i];
      h+='<div class="panel" style="margin-top:10px"><div class="qmeta">Q'+(i+1)+' — you chose: '+(a?bank[i].o[a.pick]:"—")+'</div><div class="quizq">'+q.q+'</div>';
      if(a){ h+=(a.ok?"":'<div class="qmeta" style="color:var(--amber)">Correct answer: '+bank[i].o[bank[i].a]+'</div>')+'<div class="qwhy '+(a.ok?"good":"bad")+' show">'+(a.ok?"Correct. ":"Not quite. ")+q.w+'</div>'; }
      h+='</div>';
    });
    h+=nextBtn("Go to Handover",7)+'</div>';
    return h;
  }
  var i=S.quiz.i, q=bank[i], a=S.quiz.answers[i];
  var h='<div class="panel"><h3><span class="n">06</span> Shift exam — '+(S.mode==="hard"?"scenario judgment":"concept check")+'</h3>'
    +'<p class="lead">'+(S.mode==="hard"?"Seven judgment calls from the field. Accuracy drives the score — read each scenario twice.":"Six concept questions. One answer each, an explanation after every click, wrong answers never penalize progress.")+'</p>'
    +'<div class="qmeta">QUESTION '+(i+1)+' / '+bank.length+(S.quiz.answers.length?" · "+S.quiz.answers.filter(function(x){return x&&x.ok;}).length+" correct so far":"")+'</div>'
    +'<div class="quizq">'+q.q+'</div><div role="group" aria-label="Answer options">';
  q.o.forEach(function(op,oi){
    var cls="qopt";
    if(a && oi===a.pick) cls += a.ok ? " correct" : " wrong";
    h+='<button class="'+cls+'" data-qopt="'+oi+'" '+(a?"disabled":"")+'>'+op+'</button>';
  });
  h+='</div>';
  if(a){
    h+='<div class="qwhy '+(a.ok?"good":"bad")+' show" role="status">'+(a.ok?"Correct. ":"Not quite. ")+q.w+'</div>'
      +'<div class="nextrow"><button class="btn" id="qnext">'+(i+1<bank.length?"Next question":"Finish exam")+' '+icon("arrow")+'</button></div>';
  }
  h+='</div><div class="nextrow">'+backBtn(5,"Commissioning")+'</div>';
  return h;
}
function bindQuiz(){
  var ret=document.getElementById("qretake");
  if(ret) ret.addEventListener("click",function(){ S.quiz={i:0,answers:[],done:false}; save(); renderAll(); });
  Array.prototype.forEach.call(document.querySelectorAll("[data-qopt]"),function(b){
    b.addEventListener("click",function(){
      var i=S.quiz.i; if(S.quiz.answers[i]) return;
      var oi=parseInt(b.getAttribute("data-qopt"),10);
      var q=quizBank()[i];
      S.quiz.answers[i]={pick:oi, ok:oi===q.a};
      save(); renderAll();
    });
  });
  var nx=document.getElementById("qnext");
  if(nx) nx.addEventListener("click",function(e){
    if(e.detail>1) return; /* double-click must not skip a question */
    var bank=quizBank();
    if(S.quiz.i+1<bank.length){ S.quiz.i++; }
    else { S.quiz.done=true; }
    save(); renderAll();
    if(S.quiz.done && objDoneCount()===activeObjs().length) toast("Exam complete — all objectives done. File your shift report at Handover.");
    else if(S.quiz.done) toast("Exam complete — some objectives are still open; the report button wants them all.");
  });
}

