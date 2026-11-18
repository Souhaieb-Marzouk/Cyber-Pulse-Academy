'use strict';
/* =====================================================================
   NIGHT-SHIFT DEPOT — knowledge check
   Question bank lives in js/data.js (QUIZ). Here: rendering the quiz
   body, the submit guard, scoring, and the answer lock. After submit the
   picked option (and only it) is colored green/red with a ✓/✕ marker and
   every radio is disabled — answers cannot be changed afterwards.
   ===================================================================== */

function quizBody(){
  const qs=QUIZ[S.mode]; const sub=S.quiz.submitted;
  return qs.map((q,qi)=>{
    const picked=S.quiz.answers[qi];
    const opts=q.opts.map((o,oi)=>{
      let cls='qopt', mark='';
      if(sub&&oi===picked){
        if(picked===q.a){ cls+=' pick-ok'; mark='✓ '; }
        else{ cls+=' pick-bad'; mark='✕ '; } }
      return `<label class="${cls}"><input type="radio" name="q${qi}" data-act="quizpick" data-q="${qi}" data-o="${oi}"
        ${picked===oi?'checked':''} ${sub?'disabled':''}><span style="font-size:13px">${mark}${esc(o)}</span></label>`;}).join('');
    const expl=sub?`<div class="qexpl show ${picked===q.a?'good':'badx'}"><b>${picked===q.a?'Correct.':'Not quite.'}</b> ${esc(q.expl)}</div>`:'';
    return `<div class="qcard"><h4>${qi+1}. ${esc(q.q)}</h4>${opts}${expl}</div>`;}).join('');
}

function openQuiz(){
  $('quiz-title').textContent=S.mode==='medium'?'Knowledge check — Depot induction':'Knowledge check — incident debrief';
  $('quiz-intro').textContent=S.mode==='medium'
    ?'Six concept questions. An explanation follows each answer — wrong answers teach here.'
    :'Seven scenario items from tonight’s incident. Each needs the judgment call, not the definition.';
  $('quiz-body').innerHTML=quizBody();
  $('quiz-submit').classList.toggle('hidden',S.quiz.submitted);
  $('quiz-result').textContent=S.quiz.submitted?`Score ${S.quiz.score}/${QUIZ[S.mode].length}`:'';
  openOv('quiz-view');
}

function submitQuiz(){
  const qs=QUIZ[S.mode]; const a=S.quiz.answers;
  if(qs.some((_,i)=>a[i]===undefined)){ announce('Answer every question before submitting'); return; }
  S.quiz.score=qs.filter((q,i)=>a[i]===q.a).length; S.quiz.submitted=true; save();
  $('quiz-body').innerHTML=quizBody();
  $('quiz-submit').classList.add('hidden');
  $('quiz-result').textContent=`Score ${S.quiz.score}/${qs.length} — explanations are shown on each card.`;
  announce(`Quiz submitted. Score ${S.quiz.score} of ${qs.length}.`);
  renderDuty();
}
