/* ===== js/quiz.js — operator exam =====
   Render, selected-answer-only color contract (R3), submit/lock (R2),
   explanations, scoring, full-retake reset. */

'use strict';

/* ---------- quiz ---------- */
function renderQuiz(){
  const bank=state.mode==='medium'? QUIZ_MED : QUIZ_HARD;
  const host=document.getElementById('quiz-list');
  host.innerHTML=bank.map((q,i)=>{
    const picked=state.quiz.answers[i];
    const mark=state.quiz.submitted&&picked!=null ? (picked===q.a?' opt-correct':' opt-wrong') : ''; // R3: selected answer only
    return '<div class="qz-item" data-qz="'+i+'"><p class="qz-q"><span class="qz-no">Q'+(i+1)+'</span>'+q.q+'</p>'+
      '<div class="opt-list">'+q.o.map((o,j)=>'<label class="opt'+(picked===j?mark:'')+'"><input type="radio" name="qz'+i+'" value="'+j+'"'+(picked===j?' checked':'')+(state.quiz.submitted?' disabled':'')+'><span>'+o+'</span></label>').join('')+'</div>'+
      '<div class="qz-why'+(state.quiz.submitted?' show':'')+(state.quiz.submitted? (picked===q.a?' correct':' wrong'):'')+'" data-why="'+i+'">'+(state.quiz.submitted? qzWhyText(bank,i):'')+'</div></div>';
  }).join('');
  host.querySelectorAll('input[type="radio"]').forEach(r=>r.addEventListener('change',()=>{
    if(r.disabled) return; // R2: no change after submission
    state.quiz.answers[parseInt(r.name.slice(2),10)]=parseInt(r.value,10); save();
  }));
  const sub=document.getElementById('btn-quiz-submit');
  sub.disabled=state.quiz.submitted;
}


function qzWhyText(bank,i){
  const q=bank[i], picked=state.quiz.answers[i];
  const head=picked===q.a? '<b style="color:var(--green)">Correct ✓</b> ' : (picked==null? '<b style="color:var(--amber)">No answer selected.</b> ' : '<b style="color:var(--red)">Not this one ✗</b> ');
  return head+q.why;
}


function submitQuiz(){
  const bank=state.mode==='medium'? QUIZ_MED : QUIZ_HARD;
  let score=0;
  bank.forEach((q,i)=>{ const picked=state.quiz.answers[i]; const ok=picked===q.a; if(ok) score++;
    const w=document.querySelector('[data-why="'+i+'"]');
    if(w){ w.className='qz-why show '+(ok?'correct':'wrong'); w.innerHTML=qzWhyText(bank,i); }
    const item=document.querySelector('[data-qz="'+i+'"]');
    if(item){
      item.querySelectorAll('.opt').forEach(l=>l.classList.remove('opt-correct','opt-wrong'));
      if(picked!=null){ // R3: highlight ONLY the selected answer — never reveal the correct one on a wrong pick
        const lbl=item.querySelector('input[value="'+picked+'"]').closest('.opt');
        lbl.classList.add(ok?'opt-correct':'opt-wrong');
      }
      item.querySelectorAll('input').forEach(r=>r.disabled=true);
    }
  });
  state.quiz.submitted=true; state.quiz.score=score; save();
  document.getElementById('quiz-score').textContent='SCORE '+score+'/'+bank.length+(score===bank.length?' — flawless shift.':score>=Math.ceil(bank.length*0.7)?' — solid. Read the red explanations.':' — read every explanation, then retake.');
  document.getElementById('btn-quiz-submit').disabled=true;
  toast('Exam submitted: '+score+'/'+bank.length);
  live('Exam submitted. Score '+score+' of '+bank.length);
  if(allPassed() && !state.reportSeen){ state.reportSeen=true; save(); openReport(true); }
}
