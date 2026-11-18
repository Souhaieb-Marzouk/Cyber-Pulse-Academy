'use strict';
/* =====================================================================
   QUIZ — certification drill: per-question check → answer lock → mandatory next,
selected-only highlighting, scoring and summary.
   ===================================================================== */

function renderQuiz(){
 var qs=S.mode==='medium'?QUIZ_M:QUIZ_H;
 var locked=quizLocked();
 $('quizLock').style.display=locked?'flex':'none';
 $('quizCards').hidden=locked;$('quizFoot').hidden=true;
 if(locked){var defs=currentDefs();var done=defs.filter(function(o){return objSt(o.id).done}).length;$('quizLock').querySelector('span').innerHTML='The drill opens at '+(S.mode==='medium'?8:6)+' of '+defs.length+' orders complete — you are at '+done+'. Practice first, then prove it.';return}
 if(S.quiz.scored){renderQuizSummary();return}
 var i=Math.min(S.quiz.idx||0,qs.length-1);
 var q=qs[i];var picked=S.quiz.ans[i];var isChecked=!!S.quiz.checked[i];
 var opts=q.o.map(function(t,j){
  var cls='qOpt';var mark='';
  if(isChecked&&String(picked)===String(j)){
   if(String(picked)===String(q.c)){cls+=' correct';mark='<span class="mark">✓ correct</span>'}
   else{cls+=' wrong';mark='<span class="mark">✗ your answer — wrong</span>'}
  }
  return '<label class="'+cls+'"><input type="radio" name="q_'+i+'" value="'+j+'" data-qi="'+i+'"'+(String(picked)===String(j)?' checked':'')+(isChecked?' disabled':'')+'><span>'+esc(t)+'</span>'+mark+'</label>';
 }).join('');
 var explain='<div class="qExplain'+(isChecked?' show':'')+'"><b>Why:</b> '+esc(q.e)+'</div>';
 var fb='<p class="fb" id="qFb" role="status" aria-live="polite" style="'+(isChecked?'':'display:none')+'"></p>';
 $('quizCards').innerHTML='<div class="qCard" data-qi="'+i+'"><h4>Item '+(i+1)+' of '+qs.length+(isChecked?' — '+esc(q.topic):'')+'</h4><p class="qText">'+esc(q.q)+'</p>'+opts+explain+
  '<div class="qnav"><button class="btn primary" id="checkQBtn" type="button"'+(isChecked?' disabled':'')+'>Check answer</button>'+
  '<button class="btn" id="nextQBtn" type="button" style="color:#2E3B44;border-color:#C9BC9C"'+(isChecked?'':' disabled')+'>Next question</button></div>'+fb+'</div>';
 $('quizScore').textContent='Progress: '+(Object.keys(S.quiz.checked||{}).length)+' / '+qs.length;
 var sb=$('scoreQuizBtn');if(sb)sb.style.display='none';
}

function quizLocked(){var defs=currentDefs();var done=defs.filter(function(o){return objSt(o.id).done}).length;var need=S.mode==='medium'?8:6;return done<need}

function updateQuizLock(){var locked=quizLocked();$('quizLock').style.display=locked?'flex':'none';$('quizCards').hidden=locked;$('quizFoot').hidden=true;if(!locked&&!$('quizCards').childElementCount){renderQuiz()}}

function checkCurrent(){
 var qs=S.mode==='medium'?QUIZ_M:QUIZ_H;var i=Math.min(S.quiz.idx||0,qs.length-1);
 if(S.quiz.checked[i]){return}
 var picked=S.quiz.ans[i];var fb=$('qFb');
 if(picked===undefined||picked===null||picked===''){fb.className='fb show no';fb.innerHTML='<b><svg class="icon"><use href="#i-alert"/></svg> Choose an answer first</b><span>Nothing is selected, so nothing is highlighted.</span>';return}
 S.quiz.checked[i]=true;
 if(String(picked)!==String(qs[i].c)){if(!S.quiz.wrongIds)S.quiz.wrongIds=[];if(S.quiz.wrongIds.indexOf(i)<0)S.quiz.wrongIds.push(i)}
 renderQuiz();save();
}

function nextCurrent(){
 var qs=S.mode==='medium'?QUIZ_M:QUIZ_H;var i=Math.min(S.quiz.idx||0,qs.length-1);
 if(!S.quiz.checked[i])return;
 if(i+1>=qs.length){finishQuiz();return}
 S.quiz.idx=i+1;renderQuiz();save();
}

function finishQuiz(){
 var qs=S.mode==='medium'?QUIZ_M:QUIZ_H;var correct=0;
 qs.forEach(function(q,i){if(String(S.quiz.ans[i])===String(q.c))correct++});
 S.quiz.scored=true;S.quiz.correct=correct;
 $('statQuiz').textContent=correct+'/'+qs.length;
 log('Certification drill finished: '+correct+' of '+qs.length+'. Answers are locked.');
 renderQuiz();updateStats();save();
}

function renderQuizSummary(){
 var qs=S.mode==='medium'?QUIZ_M:QUIZ_H;
 var rows=qs.map(function(q,i){var okk=String(S.quiz.ans[i])===String(q.c);return '<div class="rrow">'+(okk?'<b style="color:#1E6B40">✓</b> ':'<b style="color:#A93226">✗</b> ')+'Item '+(i+1)+' — '+esc(q.topic)+(okk?'':' — brush up in the Chart Room Reference')+'</div>'}).join('');
 $('quizCards').innerHTML='<div class="qCard"><h4>Drill complete</h4><p class="qText" style="font-size:1.5rem;font-family:var(--serif)">Score: '+S.quiz.correct+' / '+qs.length+'</p><div class="qrev">'+rows+'</div><p class="srcLine">Answers lock once checked. Use Reset lab to run the drill again from scratch.</p></div>';
 $('quizScore').textContent='Drill score: '+S.quiz.correct+' / '+qs.length;
 var sb=$('scoreQuizBtn');if(sb)sb.style.display='none';
}
