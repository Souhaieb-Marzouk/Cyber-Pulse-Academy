'use strict';
/* =====================================================================
   NIGHT-SHIFT DEPOT — event wiring, completion report, bootstrap
   One delegated click/change/input listener pair handles every
   [data-act] control; a keydown listener covers ESC (overlays + drawer)
   and Enter/Space activation of role=button items. finishShift() builds
   the end-of-shift report; startMode()/boot() bring the lab up and
   restore a saved shift.
   ===================================================================== */

function openObjCard(id){ S.openObj=id; renderDuty(); }

/* ---------- delegated click handling ---------- */
document.addEventListener('click',ev=>{
  const t=ev.target.closest('[data-act]'); if(!t)return;
  const fk=focusKey(t);
  const act=t.dataset.act, e=S.env;
  switch(act){
    case 'mode': startMode(t.dataset.mode); break;
    case 'openfile':{ const f=Object.values(DEVICES).flatMap(d=>d.files).find(x=>x.id===t.dataset.file);
      e.openFile=f.id; e.selDev=f.device; e.viewed[f.id]=true; save(); renderRack(); renderBench(); renderDuty(); break; }
    case 'seldev': e.selDev=t.dataset.dev; save(); renderRack(); renderDuty(); break;
    case 'rscompare': e.rsCompare[t.dataset.dev]=true; save(); renderBench(); renderDuty(); announce('Running vs startup comparison shown'); break;
    case 'comprun':{ const c=e.comp; e.compRuns[c.dev+'|'+c.a+'|'+c.b]=true; save(); renderBench(); renderDuty();
      announce('Comparison run'); break; }
    case 'storage': e.storage=t.dataset.v; save(); renderBench(); renderDuty(); break;
    case 'h7d': e.h7.d[t.dataset.t]=t.dataset.v; save(); renderBench(); renderDuty(); break;
    case 'stamp': e.classify[t.dataset.r]=t.dataset.v; save(); renderDuty(); break;
    case 'seqadd': if(!e.seq[t.dataset.key].includes(t.dataset.id)){ e.seq[t.dataset.key].push(t.dataset.id); save(); renderDuty(); } break;
    case 'seqrm': e.seq[t.dataset.key]=e.seq[t.dataset.key].filter(x=>x!==t.dataset.id); save(); renderDuty(); break;
    case 'seqmv':{ const arr=e.seq[t.dataset.key]; const i=+t.dataset.i, j=i+ +t.dataset.d;
      if(j>=0&&j<arr.length){ [arr[i],arr[j]]=[arr[j],arr[i]]; save(); renderDuty(); } break; }
    case 'hint':{ const st=objState(t.dataset.oid); st.hints++; save(); renderDuty(); announce('Hint shown'); break; }
    case 'check': runCheck(t.dataset.oid); break;
    case 'objopen': S.openObj=(S.openObj===t.dataset.oid)?null:t.dataset.oid; renderDuty(); break;
    case 'h3file': e.h3.file=t.dataset.v||t.value; save(); renderDuty(); break;
    case 'quizpick': S.quiz.answers[t.dataset.q]=+t.dataset.o; save(); break;
    case 'tab': S.curTab=t.dataset.tab; save(); renderBench();
      document.querySelectorAll('.btab').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab===S.curTab))); break;
  }
  restoreFocus(fk);
});

/* ---------- delegated change handling (selects, checkboxes) ---------- */
document.addEventListener('change',ev=>{
  const t=ev.target.closest('[data-act]'); if(!t)return;
  const fk=focusKey(t);
  const act=t.dataset.act, e=S.env, v=t.value;
  const set=(k1,k2,val)=>{ if(k2)e[k1][k2]=val; else e[k1]=val; save(); renderBench(); renderDuty(); };
  switch(act){
    case 'compdev':{ e.comp.dev=v; const fs=Object.values(DEVICES[v].files); e.comp.a=fs[0].id; e.comp.b=(fs[1]||fs[0]).id;
      e.compRuns={}; save(); renderBench(); break; }
    case 'compa': e.comp.a=v; save(); renderBench(); break;
    case 'compb': e.comp.b=v; save(); renderBench(); break;
    case 'mondev': set('monitor','dev',v); break;
    case 'monref': set('monitor','ref',v); break;
    case 'monfreq': set('monitor','freq',v); break;
    case 'monact': set('monitor','act',v); break;
    case 'monwatch': e.monitor.watch=t.checked; save(); renderBench(); renderDuty(); break;
    case 'fwsched': set('fwJob','sched',v); break;
    case 'fwdest': set('fwJob','dest',v); break;
    case 'fwret': set('fwJob','ret',v); break;
    case 'fwtest': set('fwJob','test',v); break;
    case 'fwalert': e.fwJob.alert=t.checked; save(); renderBench(); renderDuty(); break;
    case 'polfreq': set('polJob','freq',v); break;
    case 'polalert': set('polJob','alert',v); break;
    case 'polretry': set('polJob','retry',v); break;
    case 'polstorage': set('polJob','storage',v); break;
    case 'poltest': set('polJob','test',v); break;
    case 'h7r': e.h7.r[t.dataset.t]=v; save(); renderDuty(); break;
    case 'm1': e.m1[t.dataset.k]=v; save(); renderDuty(); break;
    case 'tag': e.tags[t.dataset.k]=v; save(); renderDuty(); break;
    case 'm7': e.m7=v; save(); renderDuty(); break;
    case 'h1dev': e.h1.dev=v; save(); renderDuty(); break;
    case 'h1cause': e.h1.cause=v; save(); renderDuty(); break;
    case 'h1clue': e.h1.clue=v; save(); renderDuty(); break;
    case 'h3why': e.h3.why=v; save(); renderDuty(); break;
    case 'h5why': e.h5why=v; save(); renderDuty(); break;
    case 'h8chk':{ const idv=t.dataset.v||v; const i=e.h8.indexOf(idv); if(t.checked&&i<0)e.h8.push(idv); if(!t.checked&&i>=0)e.h8.splice(i,1);
      save(); renderDuty(); break; }
    case 'h9l':{ const idv=t.dataset.v||v; const i=e.h9.lessons.indexOf(idv); if(t.checked&&i<0)e.h9.lessons.push(idv); if(!t.checked&&i>=0)e.h9.lessons.splice(i,1);
      save(); renderDuty(); break; }
    case 'h9risk': e.h9.risk=v; save(); renderDuty(); break;
  }
  restoreFocus(fk);
});

/* ---------- free-text inputs (save on every keystroke) ---------- */
document.addEventListener('input',ev=>{
  const t=ev.target.closest('[data-act]'); if(!t)return;
  const e=S.env;
  if(t.dataset.act==='m4count'){ e.m4.count=t.value; save(); }
  if(t.dataset.act==='m4name'){ e.m4.name=t.value; save(); }
  if(t.dataset.act==='h2user'){ e.h2.user=t.value; save(); }
  if(t.dataset.act==='h2log'){ e.h2.log=t.value; save(); }
  if(t.dataset.act==='h2sub'){ e.h2.subnet=t.value; save(); }
});

/* ---------- keyboard: ESC closes topmost overlay / drawer;
   Enter / Space activate role=button items ---------- */
document.addEventListener('keydown',ev=>{
  if(ev.key==='Escape'){
    const ov=[...document.querySelectorAll('.overlay:not(.hidden)')].pop();
    if(ov){ closeOv(ov.id); return; }
    if($('drawer').classList.contains('open')){ $('drawer').classList.remove('open'); if(lastFocus&&lastFocus.focus)lastFocus.focus(); }
    return; }
  if((ev.key==='Enter'||ev.key===' ')&&ev.target.matches('[role="button"][data-act]')){
    ev.preventDefault(); ev.target.click(); }
});

/* =====================================================================
   COMPLETION — end-of-shift report
   Score = round(first-attempt ratio × 70 + quiz ratio × 30); stars by
   score with a hint penalty on the top rating. Focus areas are derived
   from actual evidence: retried items, hinted items, missed quiz tags.
   ===================================================================== */
function finishShift(){
  const set=OBJSETS[S.mode], total=set.length;
  const first=set.filter(o=>{const st=S.obj[o.id]||{};return st.done&&!st.everFailed;}).length;
  const hints=set.reduce((a,o)=>a+((S.obj[o.id]||{}).hints||0),0);
  const r1=first/total, r2=S.quiz.score/QUIZ[S.mode].length;
  const score=Math.round(r1*70+r2*30);
  const stars=score>=85&&hints<=2?5:score>=70?4:score>=55?3:score>=40?2:1;
  $('done-stars').innerHTML='★★★★★'.split('').map((c,i)=>i<stars?c:`<span class="off">${c}</span>`).join('');
  $('done-stars').setAttribute('aria-label',`${stars} of 5 stars`);
  $('done-score').textContent=`Score ${score}/100 · ${first}/${total} duty items on the first attempt · ${hints} hint(s) used · quiz ${S.quiz.score}/${QUIZ[S.mode].length}`;
  $('done-verdict').textContent={
    5:'Flawless night. You can explain the config triangle, read a diff like a rail timetable, detect drift, and land recovery — and you did it almost unaided.',
    4:'Strong shift. The depot is in order; revisit the one or two items that took retries and they will stick.',
    3:'Solid progress. You found most of what mattered; re-run the items that needed hints until the reasoning is automatic.',
    2:'The night was rough but the network survived. Walk the duty board again — the feedback under each item is the lesson.',
    1:'Every night shift is training. Re-run the desk from the briefing; the comparator and the duty-board feedback will carry you.'}[stars];
  const per={P1:[],P2:[],P3:[],P4:[]};
  set.forEach(o=>per[o.pillar].push((S.obj[o.id]||{}).done?`✓ ${o.title}`:`○ ${o.title}`));
  $('done-recap').innerHTML=Object.entries(per).map(([p,list])=>
    `<div class="rc"><b>${p} · ${PILLARS[p]}</b><ul>${list.map(l=>`<li>${esc(l)}</li>`).join('')}</ul></div>`).join('');
  const focus=[];
  set.forEach(o=>{const st=S.obj[o.id]||{}; if(!st.done)return;
    if(st.everFailed)focus.push(`Duty item <b>${o.id} — ${esc(o.title)}</b> took a retry. Re-open it on the duty board and read the signed-off feedback once more; the reasoning should be automatic before exam day.`);
    else if(st.hints>0)focus.push(`Duty item <b>${o.id} — ${esc(o.title)}</b> needed a hint. Re-run it without the lamp to prove the recall is yours.`);
  });
  const qs=QUIZ[S.mode];
  qs.forEach((q,i)=>{ if(S.quiz.answers[i]!==undefined&&S.quiz.answers[i]!==q.a)
    focus.push(`Knowledge-check item ${i+1} (<b>${esc(q.tag)}</b>) was missed. Re-read that concept in the briefing and glossary, then retake the check.`);
    if(S.quiz.answers[i]===undefined)focus.push(`Knowledge-check item ${i+1} (<b>${esc(q.tag)}</b>) was left unanswered — revisit it.`);
  });
  if(!focus.length)focus.push('No weak spots this run — every duty item landed first try and the quiz was clean. Stretch goal: run the other mode, or rebuild the depot\u2019s runbook from memory.');
  $('done-focus').innerHTML=focus.map(f=>`<li>${f}</li>`).join('');
  $('done-focus-wrap').style.display=focus.length?'block':'none';
  openOv('done-view');
  S.finished=true; save();
}

/* =====================================================================
   INIT — mode start and boot (with saved-shift resume)
   ===================================================================== */
function startMode(m){
  S=freshState(); S.mode=m; S.curTab='brief'; save();
  $('mode-screen').classList.add('hidden'); $('lab').classList.remove('hidden');
  $('mode-chip').textContent=m==='medium'?'Medium · guided night shift':'Hard · solo incident response';
  $('glossary-list').innerHTML=GLOSSARY.map(([t,d])=>`<dt>${esc(t)}</dt><dd>${esc(d)}</dd>`).join('');
  renderAll(); announce(m==='medium'?'Guided night shift started. Briefing tab is open.':'Incident mode started. Briefing tab is open.');
}

function boot(){
  const resumed=load();
  if(resumed&&S.mode){
    $('mode-screen').classList.add('hidden'); $('lab').classList.remove('hidden');
    $('mode-chip').textContent=S.mode==='medium'?'Medium · guided night shift':'Hard · solo incident response';
    $('glossary-list').innerHTML=GLOSSARY.map(([t,d])=>`<dt>${esc(t)}</dt><dd>${esc(d)}</dd>`).join('');
    renderAll(); announce('Previous shift resumed — progress restored.');
  }
  $('btn-brief').addEventListener('click',()=>{ S.curTab='brief'; renderBench();
    document.querySelectorAll('.btab').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab==='brief')));
    $('bench').scrollIntoView({behavior:'smooth'}); });
  $('btn-glossary').addEventListener('click',()=>{ lastFocus=document.activeElement;
    $('drawer').classList.add('open'); $('drawer-close').focus(); });
  $('drawer-close').addEventListener('click',()=>{ $('drawer').classList.remove('open'); if(lastFocus)lastFocus.focus(); });
  $('btn-quiz').addEventListener('click',openQuiz);
  $('quiz-close').addEventListener('click',()=>closeOv('quiz-view'));
  $('quiz-submit').addEventListener('click',submitQuiz);
  $('btn-finish').addEventListener('click',finishShift);
  $('done-review').addEventListener('click',()=>closeOv('done-view'));
  $('done-restart').addEventListener('click',()=>{ clearSaved(); location.reload(); });
  $('btn-reset').addEventListener('click',()=>openOv('reset-view'));
  $('reset-no').addEventListener('click',()=>closeOv('reset-view'));
  $('reset-yes').addEventListener('click',()=>{ clearSaved(); location.reload(); });
  document.querySelectorAll('.overlay').forEach(ov=>ov.addEventListener('click',ev=>{
    if(ev.target===ov)closeOv(ov.id); }));
}

boot();
