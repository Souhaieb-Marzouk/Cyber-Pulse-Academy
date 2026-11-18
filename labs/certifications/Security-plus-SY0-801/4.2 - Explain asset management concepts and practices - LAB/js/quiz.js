"use strict";
/* =============================================================================
   js/quiz.js — knowledge check: rendering + answer handling.
   Contract preserved from the audited original: questions unlock in order,
   each answer locks on submission, only the chosen option is highlighted
   (red when wrong — the correct option is never revealed in green),
   prose explanation always follows.
   ========================================================================== */

function renderQuiz(){
  const list=QUIZ[S.mode];
  const total=list.length;const answered=Object.keys(S.quiz).length;
  let h='<div class="stage-head"><div class="inner"><span class="stage-chip">Knowledge check</span><h1>'+(S.mode==="medium"?"Concept check":"Scenario triage")+'</h1><p class="stage-sub">'+(S.mode==="medium"?"Six concept questions, unlocked in order — each answer locks when submitted and is explained.":"Seven scenario items, unlocked in order — application, not recall. Each answer locks when submitted.")+'</p></div></div><div class="desk-body">';
  list.forEach((q,qi)=>{const chosen=S.quiz[qi];const done=chosen!==undefined;
    const gated=qi>0&&S.quiz[qi-1]===undefined;
    h+='<div class="card quizq"><p class="qtext">Q'+(qi+1)+' · '+q.q+(gated?' <span class="objref" style="margin-bottom:0">Answer Q'+qi+' first</span>':'')+'</p>'+q.opts.map((o,oi)=>{
      let cls="quizopt";if(done){cls+=(oi===chosen?(oi===q.c?" sel-right":" sel-wrong"):"");}
      return '<button type="button" class="'+cls+'" data-act="quiz" data-qi="'+qi+'" data-oi="'+oi+'"'+((done||gated)?" disabled":"")+'>'+o+'</button>';}).join("")
      +'<div class="qwhy'+(done?" show":"")+'"><strong>'+(done?(chosen===q.c?"Correct.":"Not quite."):"")+'</strong> '+q.why+'</div></div>';});
  h+='<div class="card"><h3>Score</h3><p>'+answered+' of '+total+' answered · correct: '+list.reduce((a,q,qi)=>a+((S.quiz[qi]===q.c)?1:0),0)+'</p><p style="font-size:13px;color:var(--ink2)">Answers lock once submitted and questions unlock in order. The quiz feeds your completion report — finish the desks first, then this, then close with “Finish audit” in the tracker.</p></div></div>';
  return h;}

function answerQuiz(qi,oi){if(S.quiz[qi]!==undefined)return;if(qi>0&&S.quiz[qi-1]===undefined)return;S.quiz[qi]=oi;save();
  const q=QUIZ[S.mode][qi];const ok=oi===q.c;
  announce((ok?"Correct. ":"Not correct. ")+q.why);
  renderStation();const next=Array.from(document.querySelectorAll(".quizopt")).find(b=>!b.disabled);if(next)next.focus();}
