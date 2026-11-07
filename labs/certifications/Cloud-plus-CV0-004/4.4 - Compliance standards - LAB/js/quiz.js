'use strict';
/* quiz.js — the oral exam: card rendering, answer locking, retake flow and
// scoring. Answer submission colors ONLY the submitted option (audit R3).
 */
function quizCards(){
 const qs=QUIZ[S.mode];
 return qs.map(function(q,i){
  const locked=S.quiz.locked[q.id];const picked=S.quiz.ans[q.id];
  return '<div class="qcard'+(locked?' locked':'')+'"><div class="qh">QUESTION '+(i+1)+' / '+qs.length+'</div><div class="qb">'+
  '<p class="qq">'+q.q+'</p><div class="qopts">'+q.opts.map(function(o){
   /* only the submitted option is highlighted: green when it was right, red when wrong —
      the correct option is never revealed in green on a wrong submission (R3) */
   const cls=locked?(o.id===picked?(picked===q.a?' correct':' wrong'):''):'';
   return '<label class="qopt'+cls+'"><input type="radio" name="quiz.'+q.id+'" value="'+o.id+'"'+(locked?' disabled':'')+(picked===o.id?' checked':'')+'><span>'+o.t+'</span></label>';}).join('')+'</div>'+
  '<div class="qwhy'+(locked?' show':'')+'"><b>'+(locked?(picked===q.a?'Correct. ':'Not quite. '):'')+'</b>'+q.why+'</div></div></div>';}).join('');
}
function quizFoot(){
 const qs=QUIZ[S.mode];
 const answered=qs.filter(function(q){return S.quiz.locked[q.id];}).length;
 const corr=qs.filter(function(q){return S.quiz.locked[q.id]&&S.quiz.ans[q.id]===q.a;}).length;
 if(answered<qs.length)return '<span class="mini">'+answered+' of '+qs.length+' answered — explanations unlock as you go.</span>';
 return '<span class="qscore">Score: '+corr+' / '+qs.length+'</span><button type="button" class="btn small" id="btn-retake">'+ic('rotate')+'Retake — latest pass counts</button>';
}
function refreshQuiz(){
 const cards=$('#quizcards'),foot=$('#quizfoot');
 if(cards)cards.innerHTML=quizCards();
 if(foot)foot.innerHTML=quizFoot();
}

/* ---------- certificate ---------- */
function scoring(){
 const list=OBJ.filter(function(o){return o.mode===S.mode;});
 const total=list.length;
 const done=list.filter(function(o){return (S.checks[o.id]||{}).done;}).length;
 const qs=QUIZ[S.mode];
 const corr=qs.filter(function(q){return S.quiz.locked[q.id]&&S.quiz.ans[q.id]===q.a;}).length;
 const objFrac=total?done/total:0;const quizFrac=qs.length?corr/qs.length:0;
 const base=100*(0.7*objFrac+0.3*quizFrac);
 let hints=0,extra=0;
 list.forEach(function(o){const c=S.checks[o.id]||{};hints+=(c.hints||0);extra+=Math.max(0,(c.attempts||0)-(c.done?1:0));});
 const pen=(S.mode==='hard'?0.5:0.15)*hints;
 const stars=Math.max(1,Math.min(5,Math.round(base/20-pen-0.08*extra)));
 return{total:total,done:done,corr:corr,qs:qs.length,score:Math.round(base),stars:stars,complete:total>0&&done===total};
}
/* focus areas for the completion report — derived from THIS run's evidence (R8) */
