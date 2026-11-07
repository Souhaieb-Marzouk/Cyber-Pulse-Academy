/* js/quiz.js — certification drill: render, select → commit → lock, strict in-order gating. */
'use strict';
/* ================= QUIZ ================= */
function firstOpenIdx(bank){for(var i=0;i<bank.length;i++){var r=state.quiz[bank[i].id];if(!(r&&r.pick!==undefined))return i}return -1}
function answerQuiz(qid,pick){var bank=QUIZ[state.mode]||[],q=bank.filter(function(x){return x.id===qid})[0];if(!q)return;
 if(state.quiz[qid]&&state.quiz[qid].pick!==undefined)return;
 state.quiz[qid]={pick:pick,ok:pick===q.c};save();renderQuiz();updateHeader();
 var next=null;for(var i=0;i<bank.length;i++){var r=state.quiz[bank[i].id];if(!(r&&r.pick!==undefined)){next=bank[i];break}}
 var t=next||q,card=$('.quizcard[data-q="'+t.id+'"]');if(card){card.setAttribute('tabindex','-1');card.focus();card.scrollIntoView({behavior:'smooth',block:'center'})}}
function commitQuiz(qid){var bank=QUIZ[state.mode]||[],q=bank.filter(function(x){return x.id===qid})[0];if(!q)return;
 if(state.quiz[qid]&&state.quiz[qid].pick!==undefined)return;
 var fo=firstOpenIdx(bank);if(fo>-1&&bank[fo].id!==qid)return;
 var card=$('.quizcard[data-q="'+qid+'"]'),picked=card?card.querySelector('input[type="radio"]:checked'):null;
 if(!picked){var n=$('#qnote-'+qid);if(n){n.textContent='Select an answer first — nothing was committed or highlighted.';n.classList.add('show')}return}
 var note=$('#qnote-'+qid);if(note)note.classList.remove('show');
 answerQuiz(qid,parseInt(picked.value,10))}
function renderQuiz(){var hard=state.mode==='hard',bank=QUIZ[mode()],fo=firstOpenIdx(bank);
 $('#quizKind').textContent=hard?'scenario review (Hard)':'concept check (Medium)';
 $('#quizSub').textContent=hard?'Application questions — select an answer, commit it, and own the result. Questions unlock in order.':'6 concept questions — select an answer, commit it, and the explanation opens. Questions unlock in order.';
 $('#quizList').innerHTML=bank.map(function(q,ix){var rec=state.quiz[q.id]||{},committed=rec.pick!==undefined,gated=!committed&&ix!==fo;
  return '<div class="quizcard'+(gated?' gated':'')+'" data-q="'+q.id+'"><div class="qk">Question '+(ix+1)+' of '+bank.length+(gated?' · commit question '+(fo+1)+' first':'')+'</div><p class="qt">'+q.q+'</p>'+
  '<div role="radiogroup" aria-label="Answer options for question '+(ix+1)+'">'
  +q.o.map(function(o,i){var cls='qopt';
   if(committed){if(i===rec.pick)cls+=rec.ok?' correct':' wrong'}
   else if(rec.pick===i)cls+=' sel';
   return '<label class="'+cls+(committed?' lock':'')+'"><input type="radio" name="'+q.id+'" value="'+i+'"'+(rec.pick===i?' checked':'')+(committed||gated?' disabled':'')+'><span>'+o+'</span></label>'}).join('')
  +'</div>'
  +'<div class="qnote" id="qnote-'+q.id+'" role="status"></div>'
  +(committed?'<div class="qcommitted">'+icon('checkcircle',14)+' Answer committed — '+(rec.ok?'correct':'not correct')+'. Explanation below.</div>'
    :'<button class="mini primary" data-act="quizcommit" data-q="'+q.id+'"'+(gated?' disabled':'')+'>Commit answer</button>')
  +'<div class="qexplain'+(committed?' show':'')+'"><b>'+(committed?(rec.ok?'Correct. ':'Not quite. '):'')+'</b>'+q.e+'</div></div>'}).join('')}
function mode(){return state.mode}
