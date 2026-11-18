/*!
 * js/app.js - bootstrap and event wiring: mode select, ribbon,
 * console interactions, hints/nudges, completion report, ticker,
 * overlays (ESC / click-outside / focus trap) and resume-on-load.
 */
/* ============ Completion ============ */
function openFinish(){
 const body=$('#finishBody');
 const objs=OBJS_BY_MODE(S.mode);
 const solved=objs.filter(o=>S.ans[o.id]&&S.ans[o.id].solved).length;
 const bank=QUIZ[S.mode]; const q=ensureQuiz();
 const checked=bank.filter((b,i)=>q.checked[i]).length;
 const remaining=objs.filter(o=>!(S.ans[o.id]&&S.ans[o.id].solved));
 const quizLeft=bank.length-checked;
 if(remaining.length||quizLeft){
  $('#finishSwitch').hidden=true;
  body.innerHTML=`<p><strong>Not ready for change-over yet.</strong></p>
   <p>Missions solved: <strong>${solved}/${objs.length}</strong>${remaining.length?' — still open: '+esc(remaining.map(o=>'OBJ-'+o.id).join(', ')):''}.</p>
   <p>Knowledge check: <strong>${checked}/${bank.length}</strong> answered${quizLeft?' — '+quizLeft+' question(s) left (open Knowledge Check from the ribbon)':''}.</p>
   <p>Keep going — every open mission is one of the four mastery pillars not yet proven.</p>`;
 } else {
  const correct=quizScore();
  const quizPct=Math.round(correct/bank.length*100);
  const overall=Math.round(0.6*100+0.4*quizPct);
  const stars=starScore();
  const full=Math.floor(stars); const half=(stars-full)>=0.5;
  const starHtml='★'.repeat(full)+(half?'<span style="opacity:.35">★</span>':'')+'☆'.repeat(Math.max(0,5-full-(half?1:0)));
  const tot={P1:0,P2:0,P3:0,P4:0}, done={P1:0,P2:0,P3:0,P4:0};
  objs.forEach(o=>{tot[o.pillar]++; if(S.ans[o.id]&&S.ans[o.id].solved)done[o.pillar]++;});
  S.done=true; save();
  const focus=[];
  objs.forEach(o=>{ const a=S.ans[o.id]||{}; const parts=[];
   if((a.attempts||0)>0) parts.push(a.attempts+' extra check'+((a.attempts||0)>1?'s':'')+' before it passed');
   if(S.mode==='medium'&&(a.hintShown||0)>0) parts.push(a.hintShown+' hint'+(a.hintShown>1?'s':'')+' used');
   if(S.mode==='hard'&&a.nudge) parts.push('the paid nudge');
   if(parts.length) focus.push(`<li><strong>OBJ-${o.id}</strong> <span class="pillar ${o.pillar}">${o.pillar}</span> — ${esc(o.title)}: ${parts.join(', ')}. Re-read that mission’s Field Manual chapter, then re-run it on the other watch without help.</li>`);
  });
  bank.forEach((b,i)=>{ if(q.checked[i]&&q.ans[i]!==b.ans) focus.push(`<li><strong>Knowledge check Q${i+1}</strong> (${esc(b.topic||'general')}): answered wrong. Revisit that chapter before the exam.</li>`); });
  if(!focus.length) focus.push('<li>No friction recorded — every mission passed on the first check and the knowledge check was clean. Push into the other watch mode for the opposite discipline.</li>');
  $('#finishSwitch').hidden=false;
  body.innerHTML=`
   <div class="story">Watch change-over accepted. You walked one synthetic campaign through every console, proved all ${objs.length} missions, and passed the knowledge check — the full Lesson 4.7 scope, from tailgating to DDoS.</div>
   <div class="finish-grid">
    <div class="scorebox">
      <div class="big">${overall}%</div>
      <div class="stars" aria-label="${stars} of 5 stars">${starHtml}</div>
      <div class="sc-note">${stars} / 5 stars · based on first-attempt accuracy and ${S.mode==='hard'?'nudge':'hint'} usage<br>Knowledge check: ${correct}/${bank.length}</div>
    </div>
    <div class="pillrecap">
      ${['P1','P2','P3','P4'].map(p=>`<div class="pillrow"><span class="pillar ${p}">${p}</span>
       <span>${{P1:'Understand — mechanism, value, chain position',P2:'Recognize — evidence analysis',P3:'Detect — sources, pairing, adjudication',P4:'Mitigate — controls, constraints, residual risk'}[p]}</span>
       <span class="pillbar" style="max-width:120px"><i style="width:${Math.round(done[p]/tot[p]*100)}%"></i></span>
       <span class="oid">${done[p]}/${tot[p]}</span></div>`).join('')}
    </div>
   </div>
   <p><strong>Focus areas for your next watch</strong> (from your own answers — extra checks, ${S.mode==='hard'?'nudges':'hints'} and missed quiz items):</p>
   <ul class="nextlist">${focus.join('')}</ul>
   <p><strong>What to learn next:</strong></p>
   <ul class="nextlist">
    <li>Run the <strong>other watch mode</strong> — the same floor, the opposite discipline (guided teaching vs strict discovery).</li>
    <li>Next lesson in Domain 4: <strong>hardening techniques in depth</strong> (4.3) — you already operated most of them once.</li>
    <li>Say the chain out loud from memory: tailgating → rogue device → MAC flood → ARP poison → rogue DHCP/DNS → evil twin + DDoS. If any link is fuzzy, re-open that console.</li>
    <li>For depth beyond the exam, the Debrief links the MITRE ATT&amp;CK counterparts of these attacks.</li>
   </ul>`;
 }
 $('#ovFinish').hidden=false;
}
/* ============ Ticker ============ */
let tickIdx=0, tickTimer=null;
function startTicker(){
 if(tickTimer) clearInterval(tickTimer);
 tickTimer=setInterval(()=>{ tickIdx=(tickIdx+1)%TICKS.length; const el=$('#tickerText'); if(el) el.textContent=TICKS[tickIdx]; },4200);
}
/* ============ Overlays / mode / boot ============ */
let ovOpener=null;
function openOv(id){
 const el=$('#'+id); if(!el) return;
 ovOpener=document.activeElement;
 el.hidden=false;
 const sh=el.querySelector('.sheet'); if(sh) sh.focus();
}
function closeOv(id){
 const el=$('#'+id); if(!el) return;
 el.hidden=true;
 if(id==='ovBrief'&&S&&!S.briefSeen){ S.briefSeen=true; save(); }
 if(ovOpener&&document.contains(ovOpener)&&!ovOpener.closest('.overlay')&&ovOpener.offsetParent!==null){ try{ovOpener.focus();}catch(_){/* detached */} }
 ovOpener=null;
 if(document.activeElement===document.body||!document.activeElement||document.activeElement===document.documentElement){
  const wb=$('#btnBrief'); if(wb&&wb.offsetParent){ wb.focus(); }
  else { const pm=$('#pickMedium'); if(pm&&pm.offsetParent) pm.focus(); }
 }
}
function startMode(mode){
 S=freshState(mode); ensureQuiz(); save();
 enterWorld(true);
 announce(S.mode==='medium'?'Day Watch started — 12 guided missions.':'Night Watch started — 9 challenges, strict validation.');
}
function enterWorld(showBrief){
 $('#modeSelect').setAttribute('hidden','');
 $('#world').hidden=false;
 renderConsoles(); renderLedger(); updateProgress();
 renderManual(); renderDebrief(); renderQuiz();
 startTicker();
 if(showBrief||!S.briefSeen) openOv('ovBrief');
}
function init(){
 $('#pickMedium').addEventListener('click',()=>startMode('medium'));
 $('#pickHard').addEventListener('click',()=>startMode('hard'));
 $('#btnBrief').addEventListener('click',()=>openOv('ovBrief'));
 $('#btnManual').addEventListener('click',()=>openOv('ovManual'));
 $('#btnQuiz').addEventListener('click',()=>openOv('ovQuiz'));
 $('#btnDebrief').addEventListener('click',()=>openOv('ovDebrief'));
 $('#btnFinish').addEventListener('click',openFinish);
 $('#btnReset').addEventListener('click',()=>openOv('ovReset'));
 $('#briefClose').addEventListener('click',()=>closeOv('ovBrief'));
 $('#manualClose').addEventListener('click',()=>closeOv('ovManual'));
 $('#quizClose').addEventListener('click',()=>closeOv('ovQuiz'));
 $('#debriefClose').addEventListener('click',()=>closeOv('ovDebrief'));
 $('#finishClose').addEventListener('click',()=>closeOv('ovFinish'));
 $('#finishSwitch').addEventListener('click',()=>{ closeOv('ovFinish'); openOv('ovReset'); });
 $('#resetNo').addEventListener('click',()=>closeOv('ovReset'));
 $('#resetYes').addEventListener('click',()=>{ try{localStorage.removeItem(LS_KEY);}catch(e){} location.reload(); });
 /* ribbon tabs */
 $('#tabstrip').addEventListener('click',e=>{ const t=e.target.closest('[data-tab]'); if(t){ activateTab(t.dataset.tab); announce('Console: '+t.textContent.trim()); } });
 $('#tabstrip').addEventListener('keydown',e=>{
  if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft') return;
  const idx=CONSOLES.findIndex(c=>c.id===S.tab);
  const next=CONSOLES[(idx+(e.key==='ArrowRight'?1:CONSOLES.length-1))%CONSOLES.length];
  activateTab(next.id); $('#tab-'+next.id).focus(); e.preventDefault();
 });
 /* console interactions */
 $('#consoles').addEventListener('click',e=>{
  const cam=e.target.closest('#camBtn');
  if(cam){ S.camSnap=true; save(); renderConsole('switch'); announce('CAM snapshot captured — analyze it for mission '+(S.mode==='hard'?'H1/H3':'M3')); return; }
  const mail=e.target.closest('[data-mail]');
  if(mail){ S.mailSel=mail.dataset.mail; save(); renderConsole('mail'); return; }
  const led=e.target.closest('.led');
  if(led){
   const path=led.dataset.path.split('.');
   const cur=led.getAttribute('aria-checked')==='true';
   S.env[path[0]][path[1]]=!cur; save();
   renderConsole(S.tab);
   const again=document.querySelector('.led[data-path="'+led.dataset.path+'"]');
   if(again) again.focus();
   return;
  }
 });
 $('#consoles').addEventListener('change',e=>{
  const es=e.target.closest('[data-envsel]');
  if(es){ const parts=es.dataset.envsel.split('.'); S.env[parts[0]][parts[1]]=es.value; save(); renderConsole(S.tab); }
 });
 /* ledger interactions */
 $('#ledgerList').addEventListener('change',e=>{
  const t=e.target; const df=t.dataset.f; if(!df) return;
  const parts=df.split('|'); const id=parts[0], key=parts[1];
  const a=ensureAns(id);
  if(t.tagName==='SELECT'&&t.dataset.oi!==undefined){
   const arr=a.v[key]||(a.v[key]=[]); arr[Number(t.dataset.oi)]=t.value;
  } else if(t.type==='checkbox'){
   const arr=a.v[key]||(a.v[key]=[]); const mv=t.dataset.mv;
   if(t.checked){ if(!arr.includes(mv)) arr.push(mv); } else { a.v[key]=arr.filter(x=>x!==mv); }
  } else { a.v[key]=t.value; }
  save();
 });
 $('#ledgerList').addEventListener('click',e=>{
  const go=e.target.closest('[data-go]');
  if(go){ goConsole(go.dataset.go); return; }
  const chk=e.target.closest('[data-check]');
  if(chk){ checkObjective(chk.dataset.check); return; }
  const h=e.target.closest('[data-hint]');
  if(h){
   const o=OBJ_DEFS.find(x=>x.id===h.dataset.hint); const a=ensureAns(o.id);
   if(a.hintShown<3){
    const sc=$('#ledgerList').scrollTop;
    a.hintShown++; save(); renderLedger(); updateProgress();
    $('#ledgerList').scrollTop=sc;
   }
   return;
  }
  const n=e.target.closest('[data-nudge]');
  if(n){
   const o=OBJ_DEFS.find(x=>x.id===n.dataset.nudge); const a=ensureAns(o.id);
   if(!a.nudge){
    const sc=$('#ledgerList').scrollTop;
    a.nudge=true; save(); renderLedger(); updateProgress();
    $('#ledgerList').scrollTop=sc;
    announce('Nudge revealed for OBJ-'+o.id+' — it costs score at change-over.');
   }
   return;
  }
 });
 /* quiz interactions */
 $('#quizBody').addEventListener('change',e=>{
  const t=e.target; if(!t.dataset.qi) return;
  const i=Number(t.dataset.qi);
  const q=ensureQuiz(); q.ans[i]=Number(t.value); q.warn[i]=false;
  const res=$('#qres-'+i); if(res&&!q.checked[i]){ res.className='qres'; res.textContent=''; }
  save();
 });
 $('#quizBody').addEventListener('click',e=>{
  const c=e.target.closest('[data-qcheck]');
  if(c){
   const i=Number(c.dataset.qcheck); const q=ensureQuiz();
   if(q.ans[i]===undefined||q.ans[i]===null){
    q.warn[i]=true; save(); renderQuiz();
    announce('Question '+(i+1)+': choose an answer first, then check.');
    return;
   }
   const ov=$('#ovQuiz'); const sc=ov.scrollTop;
   q.checked[i]=true; q.warn[i]=false; save(); renderQuiz(); updateProgress();
   $('#ovQuiz').scrollTop=sc;
   announce('Answer checked and locked — read the explanation before moving on.');
  }
 });
 /* overlay click-outside + ESC + focus trap (R7) */
 $$('.overlay').forEach(ov=>ov.addEventListener('click',e=>{ if(e.target===ov) closeOv(ov.id); }));
 document.addEventListener('keydown',e=>{
  const open=$$('.overlay').filter(o=>!o.hidden);
  if(!open.length) return;
  const top=open[open.length-1];
  if(e.key==='Escape'){ closeOv(top.id); e.preventDefault(); return; }
  if(e.key!=='Tab') return;
  const f=[...top.querySelectorAll('.sheet, button, select, input, a[href]')].filter(x=>!x.disabled&&x.offsetParent!==null);
  if(!f.length) return;
  const first=f[0], last=f[f.length-1];
  if(!top.contains(document.activeElement)){ first.focus(); e.preventDefault(); }
  else if(e.shiftKey&&document.activeElement===first){ last.focus(); e.preventDefault(); }
  else if(!e.shiftKey&&document.activeElement===last){ first.focus(); e.preventDefault(); }
 });
 /* boot resume */
 const saved=load();
 if(saved && saved.mode){ S=saved; ensureQuiz(); enterWorld(false); announce('Watch resumed — progress restored.'); }
 else { S=null; }
}
document.addEventListener('DOMContentLoaded',init);
