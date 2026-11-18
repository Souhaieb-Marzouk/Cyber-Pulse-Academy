/* == js/quiz.js — cross-examination engine: per-answer lock (R2), color contract (R3). */
/* ---------- quiz ---------- */
/* R2: selecting an answer IS the validation moment — the choice locks immediately,
   feedback shows, and the answer cannot be changed afterwards (disabled inputs).
   R3: only the selected option is highlighted — green if correct, red if wrong —
   and the correct option is never revealed in green on a wrong submission. */
function paintQuizRow(row,qi,q,locked){
  const sel=S.quiz.answers[qi];
  row.querySelectorAll('label.chk').forEach((lab,oi)=>{
    const inp=lab.querySelector('input');
    lab.classList.remove('opt-ok','opt-bad');
    const tag=lab.querySelector('.locktag'); if(tag) tag.remove();
    inp.disabled=locked;
    if(sel===oi){
      const ok=sel===q.a;
      lab.classList.add(ok?'opt-ok':'opt-bad');
      lab.insertAdjacentHTML('beforeend',' <span class="locktag '+(ok?'ok':'bad')+'" aria-hidden="true">'+(ok?'✓ CORRECT':'✗ WRONG')+'</span>');
    }
  });
}
function buildQuiz(){
  const wrap=elc('div');
  const quiz=quizOfMode();
  quiz.forEach((q,qi)=>{
    const row=elc('div','qrow');
    row.innerHTML='<h4>Q'+(qi+1)+'. '+esc(q.q)+'<span class="ctx" style="display:block;font-family:var(--mono);font-size:.62rem;letter-spacing:1px;color:var(--faint)">TOPIC: '+esc(q.topic||'')+'</span></h4>';
    q.opts.forEach((op,oi)=>{
      const lab=elc('label','chk');
      const rb=document.createElement('input'); rb.type='radio'; rb.name='quiz-'+qi; rb.value=String(oi);
      const answered=S.quiz.answers[qi]!==undefined;
      rb.disabled=answered||S.quiz.submitted;
      if(answered && S.quiz.answers[qi]===oi) rb.checked=true;
      rb.setAttribute('aria-label','Q'+(qi+1)+' option '+(oi+1));
      rb.addEventListener('change',()=>{
        if(S.quiz.answers[qi]!==undefined) return; /* R2: locked after validation */
        S.quiz.answers[qi]=oi; save();
        paintQuizRow(row,qi,q,true);
        const exp=row.querySelector('.qexp');
        exp.classList.add('show');
        exp.innerHTML=(oi===q.a?'<b>Correct.</b> ':'<b>Not this one.</b> ')+esc(q.exp);
        announce('Q'+(qi+1)+' '+(oi===q.a?'correct':'wrong')+' — answer locked. '+q.topic);
      });
      lab.appendChild(rb);
      lab.appendChild(document.createTextNode(op));
      row.appendChild(lab);
    });
    if(S.quiz.answers[qi]!==undefined){
      paintQuizRow(row,qi,q,true);
      const exp=elc('div','qexp show');
      exp.innerHTML=(S.quiz.answers[qi]===q.a?'<b>Correct.</b> ':'<b>Not this one.</b> ')+esc(q.exp);
      row.appendChild(exp);
    } else {
      row.appendChild(elc('div','qexp'));
    }
    wrap.appendChild(row);
  });
  const row=elc('div','checkrow');
  const btn=elc('button','btn','SUBMIT THE CROSS-EXAMINATION'); btn.type='button';
  const score=elc('span','note');
  if(S.quiz.submitted){
    const c0=quiz.filter((q,qi)=>S.quiz.answers[qi]===q.a).length;
    score.innerHTML='<b>Filed: '+c0+'/'+quiz.length+'.</b> '+
      (c0===quiz.length?'Counsel has nothing further.':'Review the explanations above — each wrong answer teaches the next one.');
    btn.disabled=true;
  }
  btn.addEventListener('click',()=>{
    const answered=Object.keys(S.quiz.answers).length;
    if(answered<quiz.length){ score.innerHTML='Answer all '+quiz.length+' questions first — '+answered+' done.'; announce('Cross-examination incomplete: '+answered+' of '+quiz.length+' answered.'); return; }
    const correct=quiz.filter((q,qi)=>S.quiz.answers[qi]===q.a).length;
    S.quiz.submitted=true; save();
    score.innerHTML='<b>Filed: '+correct+'/'+quiz.length+'.</b> '+
      (correct===quiz.length?'Counsel has nothing further.':'Review the explanations above — each wrong answer teaches the next one.');
    announce('Cross-examination submitted: '+correct+' of '+quiz.length+' correct.');
    refreshGating(); renderLedger(); paintCloseButton();
  });
  row.appendChild(btn); row.appendChild(score);
  wrap.appendChild(row);
  return wrap;
}
