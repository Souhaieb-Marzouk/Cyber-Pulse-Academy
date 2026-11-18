/* ============================================================
   Larkspur Logistics — INC-2026-0117 · Incident Response Lab
   CompTIA Security+ SY0-801 · Lesson 4.7 (training exercise)
   File: js/quiz.js
   Sequential quiz: enforced progression, answer lock, color contract, scoring.
   Content extracted 1:1 from the audited lab (static port v4).
   ============================================================ */
/* ---- quiz (sequential: enforced progression + R2 answer lock + R3 color contract) ---- */
function quizBank(){return S.mode==='medium'?QUIZ_M:QUIZ_H;}
function quizCur(){const b=quizBank();let i=0;while(i<b.length&&S.quiz[i]&&S.quiz[i].checked)i++;return i;}
function renderQuiz(){
  const b=quizBank();
  $('quizSub').textContent=(S.mode==='medium'?'6 concept checks':'7 scenario checks')+' · one at a time · answer locks on check';
  const qc=$('quizCards');qc.innerHTML='';
  const cur=quizCur();
  for(let i=0;i<cur;i++){ // answered & locked summary cards
    const q=b[i],rec=S.quiz[i];
    const card=el('div','qcard locked');
    card.appendChild(el('div','qno','QUESTION '+(i+1)+' — answered &amp; locked'));
    card.appendChild(el('div','qtext',q.q));
    card.appendChild(el('div','qsel','Your answer: <b>'+esc(q.opts[rec.pick])+'</b> '+(rec.ok?'<span style="color:var(--green)">✔ correct</span>':'<span style="color:var(--red)">✘ incorrect</span>')));
    card.appendChild(el('div','qexp show','<b>Why:</b> '+q.exp+(rec.ok?'':'<br><b>Correct option:</b> '+esc(q.opts[q.ok]))));
    qc.appendChild(card);
  }
  if(cur>=b.length){
    const sc=quizScore();
    qc.appendChild(el('div','qcard','<b style="color:var(--green)">Review complete: '+sc.ok+'/'+sc.total+' correct.</b><p style="color:var(--dim);font-size:13px;margin-top:6px">Use Finish &amp; score (top right) for the completion report with focus areas.</p>'));
    return;
  }
  const q=b[cur];
  const card=el('div','qcard');
  card.appendChild(el('div','qno','QUESTION '+(cur+1)+' / '+b.length));
  card.appendChild(el('div','qtext',q.q));
  const g=el('div','radio-grid');
  q.opts.forEach((o,oi)=>{
    const lab=el('label');const r=document.createElement('input');r.type='radio';r.name='q'+cur;r.value=oi;
    const rec=S.quiz[cur];if(rec&&rec.pick===oi&&!rec.checked)r.checked=true;
    r.onchange=()=>{S.quiz[cur]=Object.assign({},S.quiz[cur],{pick:oi,checked:false});save();};
    lab.appendChild(r);lab.appendChild(el('span',null,esc(o)));g.appendChild(lab);});
  card.appendChild(g);
  const warn=el('div','qwarn','Pick an option first — then check.');
  const row=el('div','wcheck');
  const btn=el('button','btn small','Check answer');btn.type='button';
  const nxt=el('button','btn small','Next question →');nxt.type='button';nxt.style.display='none';
  btn.onclick=()=>{
    const rec=S.quiz[cur];
    if(!rec||rec.pick==null){warn.style.display='block';return;} // no false highlighting on empty submit
    warn.style.display='none';
    rec.checked=true;rec.ok=rec.pick===q.ok;save();
    btn.disabled=true;
    g.querySelectorAll('input').forEach(x=>{x.disabled=true; // R2: answer locks on check
      if(x.checked)x.parentElement.classList.add(rec.ok?'sel-ok':'sel-no');}); // R3: selected only; no correct-reveal on wrong
    card.appendChild(el('div','qmark '+(rec.ok?'ok':'no'),(rec.ok?'✔ correct':'✘ incorrect — why below')));
    card.appendChild(el('div','qexp show','<b>Why:</b> '+q.exp+(rec.ok?'':'<br><b>Correct option:</b> '+esc(q.opts[q.ok]))));
    nxt.style.display='';nxt.focus();
    flashTicker(rec.ok?'ok':'bad',(rec.ok?'✔':'✘')+' quiz '+(cur+1)+': '+(rec.ok?'correct':'review the explanation'));
  };
  nxt.onclick=()=>{renderQuiz();const c=$('quizCards');if(c.lastElementChild)c.lastElementChild.scrollIntoView({block:'nearest'});};
  row.appendChild(btn);row.appendChild(nxt);card.appendChild(row);card.appendChild(warn);
  qc.appendChild(card);
}
function quizScore(){const b=quizBank();let ok=0,done=0;b.forEach((q,i)=>{const r=S.quiz[i];if(r&&r.checked){done++;if(r.ok)ok++;}});return {ok,done,total:b.length};}