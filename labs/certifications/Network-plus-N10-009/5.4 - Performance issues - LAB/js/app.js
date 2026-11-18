/* ===== js/app.js — objective cards, check flow, progress, modals, bootstrap =====
   objCard/doCheck (with answer lock R2 + attempt dedupe), completion report
   with focus areas (R8), glossary, mode gate, build and init wiring. */

'use strict';

/* ---------- objective cards ---------- */
function widgetFor(obj){
  const w=obj.widget;
  switch(w.type){
    case 'selectgrid': return wSelectGrid(obj, w);
    case 'order':      return wOrder(obj, w);
    case 'mixed':      return wMixed(obj, w);
    case 'console':    return wConsole(obj, w);
    case 'alarmeng':   return wAlarmEng(obj, w);
    case 'chanplan':   return wChanPlan(obj, w);
    case 'plan':       return wPlan(obj, w);
  }
  return el('<p class="kv">widget missing</p>');
}


function lockObjective(card){
  // R2: once an objective has PASSED, its answer is locked — no control may edit it anymore.
  card.querySelectorAll('.obj-widget select, .obj-widget input, .obj-widget button').forEach(e=>{ e.disabled=true; });
  card.querySelectorAll('.obj-widget .sw').forEach(b=>b.setAttribute('aria-disabled','true'));
  const act=card.querySelector('.obj-actions');
  if(act && !act.querySelector('.locknote')) act.insertAdjacentHTML('beforeend','<span class="hint-cost locknote">✓ passed — answers locked</span>');
}


function objCard(obj){
  const st=objState(obj.id);
  const p=PILLARS[obj.pillar];
  const isMed=state.mode==='medium';
  const ctx=isMed&&obj.ctx? '<p class="obj-ctx">'+obj.ctx+'</p>' : '';
  const look=isMed? '<button type="button" class="btn btn-sm btn-ghost" data-look="'+obj.look+'">Where to look</button>' : '';
  const hints=isMed
    ? '<span class="hint-cost">hints cost stars, never progress</span>'+[0,1,2].map(i=>'<button type="button" class="btn btn-sm btn-ghost" data-hint="'+i+'"'+((st.hints||0)>i?' disabled':'')+'>'+['Nudge','Direction','Show me'][i]+'</button>').join('')
    : '<button type="button" class="btn btn-sm btn-ghost" data-hint="0"'+((st.hints||0)>0?' disabled':'')+'>Costly nudge</button><span class="hint-cost">one nudge max — it costs a star</span>';
  const card=el('<article class="obj'+(st.passed?' passed':'')+'" id="card-'+obj.id+'" data-obj="'+obj.id+'" aria-label="Objective '+obj.id+'">'+
    '<div class="obj-head"><span class="obj-id">'+obj.id+'</span><span class="pillar-badge pb-'+obj.pillar+'" title="'+p[0]+'">'+obj.pillar+' · '+p[0]+'</span><span class="obj-status'+(st.passed?' pass':'')+'">'+(st.passed?'PASSED ✓':(st.attempts?'checked — see feedback':'not checked yet'))+'</span></div>'+
    '<div class="obj-body"><h4 style="margin:0 0 8px; font-size:15px">'+obj.title+'</h4><p class="obj-prompt">'+obj.prompt+'</p>'+ctx+
    '<div class="obj-widget"></div>'+
    '<div class="obj-actions"><button type="button" class="btn btn-primary" data-check>CHECK RESULTS</button>'+look+hints+'</div>'+
    '<div class="hintbox" data-hintbox></div>'+
    '<div class="obj-fb" data-fb role="status"></div></div></article>');
  card.querySelector('.obj-widget').appendChild(widgetFor(obj));
  if(st.passed) lockObjective(card);
  card.querySelector('[data-check]').addEventListener('click',()=>doCheck(obj, card));
  card.querySelectorAll('[data-hint]').forEach(b=>b.addEventListener('click',()=>{
    const i=parseInt(b.dataset.hint,10); const hs=objState(obj.id).hints||0;
    if(i>=(isMed?3:1)) return;
    objState(obj.id).hints=Math.max(hs, i+1); save();
    const box=card.querySelector('[data-hintbox]');
    const text=isMed? obj.hints[i] : obj.nudge;
    if(!box.textContent.includes(text)) box.textContent=(isMed?['Nudge: ','Direction: ','Show me: '][i]:'Nudge: ')+text;
    box.classList.add('show'); b.disabled=true;
    updateProgress();
  }));
  const lookBtn=card.querySelector('[data-look]');
  if(lookBtn) lookBtn.addEventListener('click',()=>{
    const t=document.querySelector(lookBtn.dataset.look);
    if(t){ t.scrollIntoView({behavior:'smooth', block:'start'}); t.classList.remove('flash'); void t.offsetWidth; t.classList.add('flash'); }
  });
  return card;
}


function doCheck(obj, card){
  const st=objState(obj.id);
  const res=runCheck(obj);
  const fb=card.querySelector('[data-fb]');
  fb.classList.add('show');
  card.classList.remove('failed');
  card.querySelectorAll('.obj-widget [data-field], .obj-widget select[data-ap]').forEach(e=>e.classList.remove('bad','ok'));
  if(res.ok){
    st.passed=true;
    card.classList.add('passed');
    lockObjective(card);
    card.querySelector('.obj-status').className='obj-status pass';
    card.querySelector('.obj-status').textContent='PASSED ✓';
    fb.className='obj-fb show ok';
    fb.innerHTML='<span class="fb-title">Check result — PASS · why it matters</span>'+obj.fbOk;
    toast(obj.id+' PASSED — check the feedback, then keep the shift moving.');
    live(obj.id+' passed. '+obj.fbOk.slice(0,140));
  } else {
    // count attempts per DISTINCT failing submission — rapid duplicate clicks don't inflate the star penalty
    const now=Date.now();
    const sig=JSON.stringify([st.answers,(obj.check&&obj.check.state||[]).map(s=>env[s.k])]);
    if(!(card._lastFailSig===sig && now-(card._lastFailT||0)<1200)){
      st.attempts=(st.attempts||0)+1; card._lastFailSig=sig; card._lastFailT=now;
    }
    card.classList.add('failed');
    card.querySelector('.obj-status').className='obj-status tried';
    card.querySelector('.obj-status').textContent='checked — see feedback';
    fb.className='obj-fb show bad';
    fb.innerHTML='<span class="fb-title">Check result — NOT YET · read the rationale</span>'+obj.fbBad;
    res.bad.forEach(b=>{ if(b.indexOf('state:')!==0){ const e=card.querySelector('[data-field="'+b+'"], select[data-ap="'+b+'"]'); if(e) e.classList.add('bad'); } });
    toast(obj.id+' not yet — feedback below the check button.');
    live(obj.id+' not yet. '+obj.fbBad.slice(0,140));
  }
  updateProgress(); save();
  if(allPassed() && !state.reportSeen){ state.reportSeen=true; save(); openReport(true); }
}


/* ---------- progress / clipboard / lamps ---------- */
function updateProgress(){
  const ord=order(), lst=list();
  const passed=ord.filter(id=>objState(id).passed).length;
  const pct=Math.round(passed/ord.length*100);
  document.getElementById('head-score').innerHTML='OBJECTIVES '+passed+'/'+ord.length+' · <b>'+pct+'%</b>';
  const lamps=document.getElementById('lamps');
  lamps.innerHTML=ord.map((id,i)=>'<span class="lamp '+(objState(id).passed?'on':(id===(lst[passed]&&lst[passed].id)?'cur':''))+'" title="'+id+'"></span>').join('');
  const pb=document.getElementById('progbar');
  pb.querySelector('i').style.width=pct+'%'; pb.setAttribute('aria-valuenow', String(pct));
  document.getElementById('clip-count').innerHTML='<b>'+passed+'/'+ord.length+'</b> objectives · hints used: <b id="hint-count">'+hintsUsed()+'</b>';
  document.querySelectorAll('[data-next]').forEach(b=>b.hidden=true);
  const nxt=lst[passed];
  if(nxt){ const bay=NEXT_BAY[nxt.id]; if(bay){ const b=document.querySelector('[data-next="'+bay+'"]'); if(b) b.hidden=false; } }
  renderClipList();
}


const NEXT_BAY={};
BAYS.forEach(b=>{ b.med.concat(b.hard).forEach(id=>NEXT_BAY[id]=b.id); });


function renderClipList(){
  const host=document.getElementById('clip-list');
  const groups=[['briefing','Shift briefing'],['manual','Service manual'],['bay1','Bay 1 · Utilization'],['bay2','Bay 2 · Latency'],['bay3','Bay 3 · Loss'],['bay4','Bay 4 · RF']];
  const SEC={briefing:'briefing', manual:'manual', bay1:'bay1', bay2:'bay2', bay3:'bay3', bay4:'bay4'};
  host.innerHTML=groups.map(g=>{
    const items=list().filter(o=>SEC[o.sec]===g[0]);
    if(!items.length) return '';
    return '<div class="clip-group">'+g[1]+'</div>'+items.map(o=>{
      const st=objState(o.id);
      return '<button type="button" class="clip-item'+(st.passed?' passed':'')+'" data-goto="'+o.id+'"><span class="ci-lamp"></span><span><span class="ci-name">'+o.title+'</span><span class="ci-meta"><span class="pillar-badge pb-'+o.pillar+'">'+o.pillar+'</span><span class="kv">'+o.id+'</span></span></span></button>';
    }).join('');
  }).join('');
  host.querySelectorAll('[data-goto]').forEach(b=>b.addEventListener('click',()=>{
    closeClip();
    const c=document.getElementById('card-'+b.dataset.goto);
    if(c){ c.scrollIntoView({behavior:'smooth', block:'center'}); c.classList.remove('flash'); void c.offsetWidth; c.classList.add('flash'); }
  }));
}


function openClip(){ document.getElementById('clip').classList.add('open'); document.getElementById('clip-scrim').classList.add('show'); document.getElementById('btn-clip').setAttribute('aria-expanded','true'); }


function closeClip(){ document.getElementById('clip').classList.remove('open'); document.getElementById('clip-scrim').classList.remove('show'); document.getElementById('btn-clip').setAttribute('aria-expanded','false'); }


/* ---------- report modal (C7) ---------- */
function stars(){
  if(!allPassed()) return null;
  const wrong=failedChecks();
  let s=5; s-=Math.min(2, Math.floor(wrong/4));
  const h=hintsUsed();
  if(state.mode==='medium'){ if(h>3) s-=1; } else { if(h>0) s-=1; }
  return Math.max(1,s);
}


function focusAreas(){
  // R8: focus areas derived from the student's ACTUAL evidence (checks, exam, hints), never generic filler
  const out=[];
  const lst=list();
  const struggled=lst.filter(o=>(objState(o.id).attempts||0)>0)
    .sort((a,b)=>(objState(b.id).attempts||0)-(objState(a.id).attempts||0));
  struggled.slice(0,4).forEach(o=>{
    const a=objState(o.id).attempts;
    out.push('<b>'+o.id+' · '+o.title+'</b> — needed '+(a+1)+' check'+(a>0?'s':'')+' to pass. Re-read the NOT-YET rationale under that card and re-walk the bay evidence once more.');
  });
  const bank=state.mode==='medium'?QUIZ_MED:QUIZ_HARD;
  if(state.quiz.submitted){
    const wrong=bank.map((q,i)=>({i:i+1, ok:state.quiz.answers[i]===q.a})).filter(x=>!x.ok);
    out.push(wrong.length
      ? '<b>Operator exam:</b> '+wrong.length+'/'+bank.length+' items answered wrong — re-read the explanations on Q'+wrong.map(x=>x.i).join(', Q')+' in Block 04.'
      : '<b>Operator exam:</b> clean sheet — nothing to revisit there.');
  } else {
    out.push('<b>Operator exam:</b> not submitted yet — finish it; it feeds this report.');
  }
  const h=hintsUsed(); const cap=state.mode==='medium'?3:0;
  if(h>cap) out.push('<b>Hint reliance:</b> '+h+' hint'+(h===1?'':'s')+' used (a 5-star run allows '+cap+') — run the other shift without nudges to confirm mastery.');
  const byP={P1:[0,0],P2:[0,0],P3:[0,0],P4:[0,0]};
  lst.forEach(o=>{ byP[o.pillar][1]++; if(objState(o.id).passed) byP[o.pillar][0]++; });
  const weak=Object.keys(byP).filter(k=>byP[k][0]<byP[k][1]);
  if(weak.length) out.push('<b>Pillar gaps:</b> objectives still open in '+weak.map(k=>k+' · '+PILLARS[k][0]).join(', ')+'.');
  if(out.length<=1 && !weak.length && !struggled.length) out.push('<b>Clean shift:</b> first-check passes everywhere — consolidate by running the other difficulty mode.');
  return out;
}


function openReport(){
  rememberOpener();
  const ord=order(), passed=ord.filter(id=>objState(id).passed).length;
  const s=stars();
  const done=allPassed();
  document.getElementById('report-stars').innerHTML= done?
    [1,2,3,4,5].map(i=>'<span class="st'+(i<=s?' lit':'')+'" aria-hidden="true">★</span>').join('')+'<span class="sr-only">'+s+' of 5 stars</span>'
    : '<span style="font-size:14px; color:var(--ink-mute); font-family:var(--mono)">stars unlock when every objective passes</span>';
  document.getElementById('report-score').innerHTML= done?
    'ALL '+ord.length+' OBJECTIVES PASSED · wrong-check count: '+failedChecks()+' · hints used: '+hintsUsed()+' · exam: '+
    (state.quiz.score!=null? state.quiz.score+'/'+(state.mode==='medium'?QUIZ_MED.length:QUIZ_HARD.length):'not submitted')+
    '<br><span style="color:var(--ink-mute)">Stars: 5 base, −1 per 4 failed checks (max −2), '+(state.mode==='medium'?'−1 if more than 3 hints':'−1 for any hint')+', floor 1.</span>'
    : 'Progress: '+passed+'/'+ord.length+' objectives · hints used: '+hintsUsed()+' · exam: '+(state.quiz.score!=null? state.quiz.score:'—');
  const byP={P1:[0,0],P2:[0,0],P3:[0,0],P4:[0,0]};
  list().forEach(o=>{ byP[o.pillar][1]++; if(objState(o.id).passed) byP[o.pillar][0]++; });
  document.getElementById('report-recap').innerHTML=Object.keys(PILLARS).map(k=>
    '<div class="recap-row"><span class="rb pb-'+k+'">'+k+' · '+PILLARS[k][0]+'</span><span class="kv"><b>'+byP[k][0]+'/'+byP[k][1]+'</b> objectives passed</span></div>').join('');
  document.getElementById('report-focus').innerHTML=focusAreas().map(x=>'<li>'+x+'</li>').join('');
  document.getElementById('report-next').innerHTML= done?
    '<b style="color:var(--amber-soft)">What to learn next:</b> N10-009 5.5 (routing & wireless connectivity — where channel overlap formally lives), 5.6 (tools & protocols: tcpdump, nmap, LLDP/CDP, speed testers), and 3.4 (network monitoring technologies: SNMP, flow data, logs). '+
    (state.mode==='medium'? 'Then run the INCIDENT SHIFT on this same bench — same evidence, no guardrails.' : 'You already survived the incident shift — redo it aiming for 5 stars, then move to 5.5.') : '';
  document.getElementById('mod-report').classList.add('show');
  const f=document.getElementById('btn-report-close'); if(f) f.focus();
}


/* ---------- glossary modal ---------- */
function openGloss(){
  rememberOpener();
  document.getElementById('gloss-grid').innerHTML=GLOSSARY.map(g=>'<div style="background:var(--panel); border:1px solid var(--line); border-radius:8px; padding:10px 12px"><b style="color:var(--amber-soft); font-size:13px">'+g.t+'</b><p style="margin:4px 0 0; font-size:12px; color:var(--ink-dim)">'+g.d+'</p></div>').join('');
  document.getElementById('mod-gloss').classList.add('show');
}


function rememberOpener(){ window.__ckcrOpener=document.activeElement; }


function closeOverlay(ov){
  if(!ov) return;
  ov.classList.remove('show');
  const o=window.__ckcrOpener;
  if(o && o.focus){ try{ o.focus(); }catch(e){} }
}


/* ---------- mode gate / build ---------- */
function buildLab(){
  document.getElementById('gate').hidden=true;
  document.getElementById('lab').hidden=false;
  // briefing objectives
  const bMount=document.getElementById('mount-OBJ-M1');
  bMount.innerHTML=''; bMount.className='objs';
  list().filter(o=>o.sec==='briefing').forEach(o=>bMount.appendChild(objCard(o)));
  // manual objectives
  const mMount=document.getElementById('mount-OBJ-M8');
  mMount.innerHTML=''; mMount.className='objs';
  list().filter(o=>o.sec==='manual').forEach(o=>mMount.appendChild(objCard(o)));
  buildBays();
  const bays=BAYS;
  bays.forEach(b=>{
    const host=document.querySelector('[data-objs="'+b.id+'"]');
    host.innerHTML='';
    (state.mode==='medium'?b.med:b.hard).forEach(id=>host.appendChild(objCard(OBJ_BY_ID[id])));
  });
  renderQuiz();
  updateProgress();
  document.getElementById('quiz-score').textContent= state.quiz.submitted? 'SCORE '+state.quiz.score+'/'+(state.mode==='medium'?QUIZ_MED.length:QUIZ_HARD.length):'';
  toast('Shift started — memo first, then the bays. Clipboard (☐) tracks all objectives.');
}


function enterMode(mode){
  state.mode=mode; save();
  buildLab();
}


function showGate(){
  document.getElementById('gate').hidden=false;
  document.getElementById('lab').hidden=true;
  closeClip();
  window.scrollTo({top:0, behavior:'smooth'});
}


/* ---------- init ---------- */
function init(){
  load();
  // restore env-bound widgets if mode already chosen
  document.getElementById('mode-med').addEventListener('click',()=>enterMode('medium'));
  document.getElementById('mode-hard').addEventListener('click',()=>enterMode('hard'));
  // shift switch (progress for both shifts is stored per objective-ID, nothing is lost)
  const headActions=document.getElementById('btn-reset');
  if(headActions && !document.getElementById('btn-report')){
    const rb=document.createElement('button');
    rb.className='hbtn'; rb.id='btn-report'; rb.textContent='End-of-shift report';
    rb.addEventListener('click',()=>{ if(!state.mode){ toast('Pick a shift first — the report tracks a shift in progress.'); return; } openReport(); });
    headActions.parentNode.insertBefore(rb, headActions);
  }
  if(headActions && !document.getElementById('btn-switch')){
    const sw=document.createElement('button');
    sw.className='hbtn'; sw.id='btn-switch'; sw.textContent='⟲ Switch shift';
    sw.addEventListener('click',showGate);
    headActions.parentNode.insertBefore(sw, headActions);
  }
  const tEl=document.getElementById('toast'); // R7: transient toast is dismissible on click
  tEl.title='Dismiss'; tEl.style.cursor='pointer';
  tEl.addEventListener('click',()=>tEl.classList.remove('show'));
  document.getElementById('btn-clip').addEventListener('click',()=>{ document.getElementById('clip').classList.contains('open')?closeClip():openClip(); });
  document.getElementById('btn-clip-close').addEventListener('click',closeClip);
  document.getElementById('clip-scrim').addEventListener('click',closeClip);
  document.getElementById('btn-gloss').addEventListener('click',openGloss);
  document.getElementById('btn-gloss-close').addEventListener('click',()=>closeOverlay(document.getElementById('mod-gloss')));
  document.getElementById('btn-report-close').addEventListener('click',()=>closeOverlay(document.getElementById('mod-report')));
  document.getElementById('btn-quiz-submit').addEventListener('click',submitQuiz);
  document.getElementById('btn-quiz-reset').addEventListener('click',()=>{
    state.quiz={answers:{}, submitted:false, score:null}; save(); renderQuiz();
    document.getElementById('quiz-score').textContent='';
    toast('Exam cleared — take it again any time.');
  });
  // reset modal
  const modReset=document.getElementById('mod-reset');
  document.getElementById('btn-reset').addEventListener('click',()=>{ modReset.classList.add('show'); document.getElementById('reset-confirm').checked=false; document.getElementById('btn-reset-go').disabled=true; });
  document.getElementById('reset-confirm').addEventListener('change',e=>{ document.getElementById('btn-reset-go').disabled=!e.target.checked; });
  document.getElementById('btn-reset-cancel').addEventListener('click',()=>modReset.classList.remove('show'));
  document.getElementById('btn-reset-go').addEventListener('click',()=>{ window.__ckcrResetting=true; try{localStorage.removeItem(LS_KEY);}catch(e){} location.reload(); });
  document.querySelectorAll('.overlay').forEach(ov=>{ if(ov.id!=='mod-reset') ov.addEventListener('click',e=>{ if(e.target===ov) closeOverlay(ov); }); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'){ document.querySelectorAll('.overlay.show').forEach(o=>closeOverlay(o)); closeClip(); } });
  window.addEventListener('beforeunload', persistNow);
  if(state.mode) buildLab();
}
document.addEventListener('DOMContentLoaded', init);
