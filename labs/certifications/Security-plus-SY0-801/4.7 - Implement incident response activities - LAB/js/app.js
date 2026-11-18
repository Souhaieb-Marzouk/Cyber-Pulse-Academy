/* ============================================================
   Larkspur Logistics — INC-2026-0117 · Incident Response Lab
   CompTIA Security+ SY0-801 · Lesson 4.7 (training exercise)
   File: js/app.js
   Bootstrap: completion report, global render, event wiring, RESET, boot (loads last).
   Content extracted 1:1 from the audited lab (static port v4).
   ============================================================ */
/* ---- completion ---- */
function scoring(){
  const ids=curIds();let first=0,hints=0;
  ids.forEach(id=>{const o=S.st[id];if(o.done&&o.firstTry)first++;hints+=o.hints;});
  const acc=first/ids.length;
  let score=Math.round(acc*100)-hints*(S.mode==='medium'?3:10);
  score=Math.max(20,Math.min(100,score));
  const stars=(acc>=0.85&&hints<=2)?3:(acc>=0.6?2:1);
  return {acc,score,stars,hints,first};
}
function openDone(){
  const sc=scoring(),q=quizScore();
  $('doneScore').textContent=sc.score;
  const st=$('doneStars');st.innerHTML='';
  for(let i=0;i<3;i++)st.appendChild(el('span',i<sc.stars?'lit':'','★'));
  $('doneWhy').textContent='3★ = '+Math.round(sc.acc*100)+'% first-attempt accuracy · '+sc.hints+' hint uses. Formula: first-attempt accuracy & hint cost.';
  $('doneMsg').innerHTML=objsDone()===curIds().length?
    'Every objective validated in <b>'+(S.mode==='medium'?'Guided':'Live-fire')+'</b> mode. Quiz: <b>'+q.ok+'/'+q.total+'</b> checked answers correct'+(q.done<q.total?' ('+(q.total-q.done)+' not yet checked — the review below still waits for you).':'.')+'<br>You can now: explain the eight phases and the five-phase backbone, triage noisy evidence, run custody-clean investigation, contain without destroying evidence, set a defensible negotiation stance, sequence recovery, build a notification plan, and turn a PIR into changed controls.':
    'Shift in progress: <b>'+objsDone()+'/'+curIds().length+'</b> objectives validated. Keep working the rail — the score updates as you go.';
  const pc=$('donePillars');pc.innerHTML='';
  ['P1','P2','P3','P4'].forEach((p,i)=>{
    const names=['Understand','Recognize / Analyze','Detect','Mitigate'];
    const ids=curIds().filter(id=>curDefs()[id].pillar.includes(p));
    const dn=ids.filter(id=>S.st[id].done).length;
    pc.appendChild(el('div','pc','<h4 style="color:var(--'+['teal','cyan','violet','amberT'][i]+')">'+p+' · '+names[i]+'</h4><p>'+dn+'/'+ids.length+' objectives — pillar recap lives in the Objectives tracker.</p>'));});
  // R8: focus areas derived from the student's actual run
  const fz=$('doneFocus');fz.innerHTML='';
  const fitems=[];
  curIds().forEach(id=>{const o=S.st[id],d=curDefs()[id];const t=d.title.replace(/<[^>]*>/g,'');
    if(o.done&&o.attempts>1)fitems.push('<li><b>'+id+' — '+esc(t)+'</b><br>Needed '+o.attempts+' checks. Re-run this station and re-derive the answers without help.</li>');
    else if(o.done&&o.hints>0)fitems.push('<li><b>'+id+' — '+esc(t)+'</b><br>Solved with '+(o.hints>1?o.hints+' hints':'a '+(S.mode==='medium'?'hint':'nudge'))+'. Redo it once unaided; if it wobbles, reread the Knowledge Core phase: '+esc(PHASES.find(p=>p.id===d.phase).n)+'.</li>');});
  quizBank().forEach((qq,i)=>{const r=S.quiz[i];if(r&&r.checked&&!r.ok)fitems.push('<li><b>Quiz item '+(i+1)+'</b><br>'+esc(qq.q.slice(0,90))+(qq.q.length>90?'…':'')+'<br>Answered wrong — the explanation in the After-action review names the deciding concept. Restate it in your own words.</li>');});
  if(q.done<q.total)fitems.push('<li><b>After-action review incomplete</b><br>'+(q.total-q.done)+' item(s) not yet checked — finish them; the explanations are the fastest recap.</li>');
  if(!fitems.length)fitems.push('<li><b>Clean run — no weak spots detected.</b><br>Stretch: repeat the lab in the other mode without hints, and run one real 90-minute tabletop with your own contact list.</li>');
  fz.innerHTML=fitems.join('');
  $('doneOverlay').classList.add('on');
}
/* ---- global render ---- */
function renderAll(){renderStrip();renderRail();renderDesk();renderSide();renderTicker();renderBottomBar();renderObjDrawer();}
function enterLab(mode){
  S=freshState(mode);save();
  $('mode-screen').style.display='none';$('app').classList.add('on');
  $('quiz').classList.add('showSec');$('debrief').classList.add('showSec');$('knowcore').classList.add('showSec');
  renderKnow();renderQuiz();renderDebrief();renderGloss();renderAll();
  window.scrollTo(0,0);
  addTick('info','Shift started in '+(mode==='medium'?'GUIDED':'LIVE-FIRE')+' mode. Detection logged Mon 08:20 — the 72h window is running.');
}
/* ---- wire up ---- */
function wire(){
  $('pickMedium').onclick=()=>enterLab('medium');
  $('pickHard').onclick=()=>enterLab('hard');
  $('resumeBtn').onclick=()=>{if(S&&S.mode){$('mode-screen').style.display='none';$('app').classList.add('on');$('quiz').classList.add('showSec');$('debrief').classList.add('showSec');$('knowcore').classList.add('showSec');renderKnow();renderQuiz();renderDebrief();renderGloss();renderAll();}};
  $('checkBtn').onclick=()=>{const c=currentObjId();if(!c)return;
    // validation must land on a visible card: jump to the objective's station first
    const ph=curDefs()[c].phase;
    if(ph!==S.stationSel){S.stationSel=ph;save();renderAll();}
    checkObj(c);};
  $('hintBtn').onclick=hintClick;
  $('whereBtn').onclick=whereClick;
  $('objListBtn').onclick=()=>{lastOpener=document.activeElement;renderObjDrawer();$('objOverlay').classList.add('on');};
  $('glossBtn').onclick=()=>{lastOpener=document.activeElement;$('glossOverlay').classList.add('on');};
  $('finishBtn').onclick=()=>{lastOpener=document.activeElement;openDone();};
  $('doneReset').onclick=doReset;
  $('resetBtn').onclick=doReset;
  $('tabEv').onclick=()=>switchTab('ev');$('tabLed').onclick=()=>switchTab('led');$('tabCom').onclick=()=>switchTab('com');
  document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>closeOverlay(b.dataset.close));
  ['objOverlay','glossOverlay','doneOverlay'].forEach(id=>{
    $(id).addEventListener('click',e=>{if(e.target===$(id))closeOverlay(id);});});
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape')['objOverlay','glossOverlay','doneOverlay'].forEach(id=>closeOverlay(id));});
}
function doReset(){
  if(!confirm('RESET the lab?\nAll progress, answers and quiz results in this browser will be erased.'))return;
  try{localStorage.removeItem(KEY);}catch(e){}
  location.reload();
}

/* ---- boot ---- */
(function boot(){
  wire();
  const saved=loadS();
  if(saved&&saved.mode&&saved.st){S=saved;
    // shape-drift guard: any mismatch between saved answers and current defs resets cleanly
    const bad=curIds().some(id=>{const d=curDefs()[id],a=S.ans[id];
      return !a||!S.st[id]||a.length!==d.widget.parts.length||
        d.widget.parts.some((p,pi)=>
          (p.kind==='seq'&&(!Array.isArray(a[pi])||a[pi].length!==p.items.length))||
          (p.kind==='multi'&&(!a[pi]||Object.keys(a[pi]).length!==p.items.length)));
    });
    if(bad){S=freshState(saved.mode);}
    $('resumeRow').style.display='';
  }
})();