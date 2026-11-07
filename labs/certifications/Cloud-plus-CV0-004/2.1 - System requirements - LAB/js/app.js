'use strict';
/* ================= Engine: state, persistence, render, checks, quiz ================= */
function blankPer(){ return {solved:{},attempts:{},firstTry:{},hints:{},quiz:{},quizSub:{},fb:{}}; }
function defaults(){ return {
  v:1, mode:null, briefSeen:false,
  env:{
    spec:{ ledgerdb:{instance:'',storage:'',licensing:'',placement:'',window:''},
           webapp:{compute:''}, archive:{tier:''}, payroll:{region:'',controls:[]} },
    classify:{c1:'',c2:'',c3:'',c4:'',c5:'',c6:''},
    rto:'', blockers:[], gaps:[], gapsFleet:[], anomalies:[],
    calc:{archiveHours:'',archiveNights:'',fleetVolume:'',fleetHours:'',fleetNights:''},
    strategy:{ledgerdb:'',webapp:'',archive:'',payroll:'',reports:'',bom:''},
    waves:{archive:'',ledgerdb:'',webapp:'',payroll:'',reports:'',bom:''},
    gates:{payroll:'',webapp:''},
    rollback:{ledgerdb:'',webapp:'',archive:'',payroll:''},
    sizing:{p1:'',p2:'',p3:''}
  },
  per:{medium:blankPer(),hard:blankPer()},
  doneShown:{medium:false,hard:false},
  ui:{folder:'manual',tab:'core'}
};}
let S = defaults();
let storageOK = true;

function merge(base, over){
  if(Array.isArray(base)) return Array.isArray(over)? over.slice() : base.slice();
  if(base && typeof base==='object'){
    const out=Object.assign({},base);
    if(over && typeof over==='object') for(const k of Object.keys(over)) out[k] = (k in base)? merge(base[k],over[k]) : over[k];
    return out;
  }
  return over===undefined? base : over;
}
function save(){
  try{ localStorage.setItem(LAB_KEY, JSON.stringify(S)); }
  catch(e){
    storageOK=false;
    if(!storageAnnounced){ storageAnnounced=true; setTimeout(()=>announce('Note: browser storage is unavailable \u2014 progress will not survive a reload.'),50); }
  }
}
let storageAnnounced=false;
function load(){
  try{
    const raw=localStorage.getItem(LAB_KEY); if(!raw) return;
    const d=JSON.parse(raw);
    if(d && d.v===1) S=merge(defaults(),d);
  }catch(e){ storageOK=false; }
}
function getP(p){ return p.split('.').reduce((o,k)=>o==null?o:o[k],S); }
function setP(p,v){ const ks=p.split('.'); let o=S; for(let i=0;i<ks.length-1;i++){ if(o[ks[i]]==null||typeof o[ks[i]]!=='object') o[ks[i]]={}; o=o[ks[i]]; } o[ks[ks.length-1]]=v; }

const $=s=>document.querySelector(s);
function announce(msg){ const a=$('#announcer'); if(a){ a.textContent=''; setTimeout(()=>{a.textContent=msg;},30); } }
function showStamp(txt){
  const holder=$('#stampholder'); if(!holder) return;
  const d=document.createElement('div'); d.className='stamp'; d.textContent=txt;
  holder.appendChild(d); setTimeout(()=>d.remove(),950);
}
function flashTerm(id){
  const el=document.getElementById(id); if(!el) return;
  el.scrollIntoView({block:'center',behavior:'smooth'});
  el.style.transition='background .3s'; el.style.background='#F3EAD2';
  setTimeout(()=>{el.style.background='transparent';},1600);
}

/* ---------- cabinet & board ---------- */
function folderById(id){ return FOLDERS.find(f=>f.id===id); }
function renderCabinet(){
  const groups=[]; FOLDERS.forEach(f=>{ if(!groups.includes(f.group)) groups.push(f.group); });
  $('#cabinet').innerHTML = groups.map(g=>
    '<div class="cab-group">'+g+'</div>'+
    FOLDERS.filter(f=>f.group===g).map(f=>{
      const on = f.id===S.ui.folder;
      return '<button class="folder" data-folder="'+f.id+'" aria-current="'+(on?'true':'false')+'">'+ICONS[f.icon]+
        '<span><span class="fname">'+f.name+'</span><span class="ftag">'+f.tag+'</span></span></button>';
    }).join('')
  ).join('');
}
function renderBoard(focusBoard){
  const f=folderById(S.ui.folder); if(!f) return;
  const tabs=f.tabs, tab=tabs.find(t=>t.id===S.ui.tab)||tabs[0];
  S.ui.tab=tab.id;
  $('#boardtitle').textContent=f.name; $('#boardtag').textContent=f.tag;
  $('#tabs').innerHTML = tabs.map(t=>'<button class="tab" role="tab" aria-selected="'+(t.id===tab.id)+'" data-tab="'+t.id+'">'+t.label+'</button>').join('');
  let html = tab.render? tab.render() : '';
  if(f.id==='quiz') html = renderQuiz();
  const b=$('#board'); b.innerHTML=html;
  applyLocks(b);
  if(focusBoard) b.focus({preventScroll:true});
}
/* Stamped objectives lock their inputs (state-driven, so re-renders keep it) */
function lockOwner(path){
  const p=S.per[S.mode]; if(!p) return false;
  for(const o of objsFor(S.mode)){
    if(!p.solved[o.id] || !o.lock) continue;
    for(const pre of o.lock){ if(path===pre || path.startsWith(pre+'.')) return true; }
  }
  return false;
}
function applyLocks(scope){
  scope.querySelectorAll('[data-f],[data-set]').forEach(el=>{
    const path = el.dataset.f ? el.dataset.f : 'env.'+el.dataset.set;
    if(lockOwner(path)){
      el.disabled=true; el.classList.add('locked'); el.title='Stamped objective \u2014 locked';
      const c=el.closest('.choice'); if(c) c.classList.add('locked');
    }
  });
}
function setFolder(id,tab){
  const f=folderById(id); if(!f) return;
  S.ui.folder=id; S.ui.tab=tab||f.tabs[0].id; save();
  renderCabinet(); renderBoard(true);
  announce('Opened '+f.name+' \u2014 '+S.ui.tab);
}

/* ---------- header / progress ---------- */
function updateHeader(){
  if(!S.mode){ $('#modechip').textContent='\u2014'; return; }
  const list=objsFor(S.mode), p=S.per[S.mode];
  const done=list.filter(o=>p.solved[o.id]).length;
  $('#modechip').textContent = S.mode==='medium'? 'Medium \u00b7 Guided Drafting' : 'Hard \u00b7 Unassisted Review';
  $('#btn-switchmode').textContent = 'Switch to '+(S.mode==='medium'?'Hard':'Medium');
  $('#objcount').textContent = done+'/'+list.length;
  const frac=list.length? done/list.length : 0;
  $('#ring').style.strokeDashoffset = (119.4*(1-frac)).toFixed(1);
  const q=QUIZ[S.mode], sub=list.length&&q.filter(x=>p.quizSub[x.id]).length, corr=q.filter(x=>p.quizSub[x.id]&&p.quiz[x.id]===x.a).length;
  const quizRatio = q.length && sub===q.length ? corr/q.length : 0;
  const objRatio = list.length? list.filter(o=>p.firstTry[o.id]).length/list.length : 0;
  const score=Math.round(objRatio*70+quizRatio*30);
  $('#scorepct').textContent = done? score+'%' : '\u2013';
  $('#quizpct').textContent = q.length && sub===q.length ? 'quiz '+corr+'/'+q.length : (sub? 'quiz '+sub+'/'+q.length+' taken' : 'quiz not taken');
  $('#btn-finish').disabled = done!==list.length;
}

/* ---------- clipboard / objectives ---------- */
const PILLAR_NAME={P1:'Understand',P2:'Analyze',P3:'Detect gaps',P4:'Plan & mitigate'};
function renderClipboard(){
  const list=objsFor(S.mode||'medium'), p=S.per[S.mode||'medium'];
  const done=list.filter(o=>p.solved[o.id]).length;
  const next=list.find(o=>!p.solved[o.id]);
  let h='<div class="clip-head"><h2>Objectives clipboard</h2>'+
    '<span class="pillcount">'+done+' of '+list.length+' stamped \u00b7 '+(S.mode==='medium'?'12 guided \u00b7 hints available':'9 challenges \u00b7 strict checks')+'</span>';
  if(next){ h+='<p class="upnext">Up next: <strong>'+next.id+'</strong> \u2014 '+next.title+'</p>'; }
  else { h+='<p class="upnext" style="color:var(--moss)"><strong>All objectives stamped \u2014 use Finish &amp; debrief.</strong></p>'; }
  h+='</div>';
  h+=list.map(o=>{
    const ok=!!p.solved[o.id], fb=p.fb[o.id];
    const hintLvl=p.hints[o.id]||0, maxH=S.mode==='medium'?3:1;
    let hh='';
    for(let i=1;i<=Math.min(hintLvl,maxH);i++) hh+='<div class="hintbox"><strong>Hint '+i+':</strong> '+o.hints[Math.min(i-1,o.hints.length-1)]+'</div>';
    return '<div class="obj'+(ok?' done':'')+'" id="clip-'+o.id+'">'+
      '<div class="obj-head"><span class="obj-id">'+o.id+'</span>'+
      '<span class="pillar '+o.pillar+'" title="'+PILLAR_NAME[o.pillar]+'">'+o.pillar+'</span>'+
      '<span class="obj-title">'+o.title+'</span><span class="status-ico">'+(ok?'\u2713':'')+'</span></div>'+
      '<p class="blurb">'+o.blurb+'</p>'+
      (o.look&&S.mode==='medium'? '<button class="btn btn-sm btn-ghost" data-go="'+o.look.folder+'|'+o.look.tab+'">Show me where: '+folderById(o.look.folder).name+' \u2192 '+o.look.tab+'</button>':'')+
      '<div class="obj-actions">'+
        (ok? '' : '<button class="btn btn-sm btn-solid" data-check="'+o.id+'">Check results</button>')+
        (!ok&&hintLvl<maxH? '<button class="btn btn-sm" data-hint="'+o.id+'">'+(S.mode==='medium'?'Hint':'Nudge (costs stars)')+'</button>':'')+
      '</div>'+hh+
      (fb? '<div class="fb'+(fb.ok?'':' bad')+'"><span class="fb-t">'+(fb.ok?'Stamped \u2014 why it matters:':'Not stamped yet')+'</span>'+fb.msg+'</div>':'')+
    '</div>';
  }).join('');
  $('#clipboard').innerHTML=h;
}
function checkObjective(id){
  const o=OBJ.find(x=>x.id===id); if(!o) return;
  const p=S.per[S.mode], res=o.check(S);
  p.attempts[id]=(p.attempts[id]||0)+1;
  if(res.ok){
    if(!p.solved[id]){ p.solved[id]=true; p.firstTry[id]=(p.attempts[id]===1); showStamp('REVIEWED'); renderBoard(); }
    p.fb[id]={ok:true,msg:o.why};
  } else { p.fb[id]={ok:false,msg:res.msg}; }
  save(); renderClipboard(); updateHeader();
  announce((res.ok? 'Objective '+id+' stamped. ' : 'Objective '+id+' not stamped yet. ')+(res.ok?o.why:res.msg));
  const all=objsFor(S.mode).every(x=>S.per[S.mode].solved[x.id]);
  if(all && !S.doneShown[S.mode]){ S.doneShown[S.mode]=true; save(); setTimeout(openDone,700); }
}
function hintObjective(id){
  const o=OBJ.find(x=>x.id===id); if(!o) return;
  const p=S.per[S.mode], maxH=S.mode==='medium'?3:1;
  if((p.hints[id]||0)>=maxH) return;
  p.hints[id]=(p.hints[id]||0)+1; save(); renderClipboard();
  announce('Hint shown for '+id+'. Hint usage reduces the star rating.');
}

/* ---------- quiz ---------- */
function renderQuiz(){
  const qs=QUIZ[S.mode], p=S.per[S.mode];
  const sub=qs.filter(x=>p.quizSub[x.id]).length;
  let h='<h3>Exam drill <span class="qmeta">'+(S.mode==='medium'?'6 concept questions \u00b7 explanation after each answer':'7 scenario items \u00b7 justification required')+'</span></h3>';
  h+=P('Answer, submit, read the explanation \u2014 the drill contributes 30% of your score and does not gate the completion stamp.');
  h+=qs.map((q,i)=>{
    const done=!!p.quizSub[q.id], chosen=p.quiz[q.id];
    const good=chosen===q.a;
    return '<div class="qcard"><div class="qmeta">Question '+(i+1)+' of '+qs.length+'</div><fieldset'+(done?' disabled':'')+'><legend>'+q.q+'</legend>'+
      q.opts.map((o,j)=>{
        let cls='choice';
        if(done && j===chosen) cls+=' '+(good?'opt-good':'opt-bad');
        return '<label class="'+cls+'"><input type="radio" name="qz-'+q.id+'" value="'+j+'"'+(chosen===j?' checked':'')+(done?' disabled':'')+'><span>'+o+'</span></label>';
      }).join('')+
      '</fieldset>'+
      (done? explBlock(q,chosen)
           : '<button class="btn btn-sm btn-solid" style="margin-top:8px" data-quiz="'+q.id+'">Submit answer</button>')+
    '</div>';
  }).join('');
  h+='<p class="small">'+sub+' of '+qs.length+' submitted.</p>';
  return h;
}
function explBlock(q,chosen){
  const good=chosen===q.a;
  return '<div class="expl '+(good?'good':'bad')+'"><strong>'+(good?'\u2713 Correct.':'\u2717 Incorrect \u2014 the answer is \u201c'+q.opts[q.a]+'\u201d.')+'</strong> '+q.why+'</div>';
}
function submitQuiz(qid){
  const q=QUIZ[S.mode].find(x=>x.id===qid); if(!q) return;
  const p=S.per[S.mode]; if(p.quizSub[qid]) return;
  const sel=document.querySelector('input[name="qz-'+qid+'"]:checked');
  if(!sel){ announce('Choose an answer before submitting.'); return; }
  p.quiz[qid]=parseInt(sel.value,10); p.quizSub[qid]=true;
  save(); renderBoard(); updateHeader();
  const good=p.quiz[qid]===q.a;
  announce((good?'Correct. ':'Incorrect. ')+q.why);
}

/* ---------- completion ---------- */
const PILLAR_FIX={P1:'Field Manual \u2192 The three lenses \u00b7 Glossary: compatibility',P2:'Field Manual \u2192 Baselines &amp; percentiles \u00b7 Data volume &amp; the transfer equation \u00b7 Dependencies',P3:'Debrief \u2192 the reviewer\u2019s checklist (gap hunting, false alarms)',P4:'Field Manual \u2192 The Six Rs \u00b7 Compliance &amp; residency \u00b7 Cost requirements'};
function computeFocusAreas(){
  const list=objsFor(S.mode), p=S.per[S.mode], q=QUIZ[S.mode];
  const areas=[];
  ['P1','P2','P3','P4'].forEach(pk=>{
    const objs=list.filter(o=>o.pillar===pk);
    const retried=objs.filter(o=>p.solved[o.id]&&p.firstTry[o.id]===false);
    const hinted=objs.filter(o=>(p.hints[o.id]||0)>0);
    const qw=q.map((x,i)=>({x,i})).filter(z=>z.x.p===pk&&p.quizSub[z.x.id]&&p.quiz[z.x.id]!==z.x.a);
    if(!retried.length && !hinted.length && !qw.length) return;
    const bits=[];
    if(retried.length) bits.push('needed a retry: '+retried.map(o=>'<strong>'+o.id+'</strong> '+o.title).join(' \u00b7 '));
    if(hinted.length) bits.push('hints used on '+hinted.map(o=>o.id).join(', '));
    if(qw.length) bits.push('drill item'+(qw.length>1?'s':'')+' '+qw.map(z=>'#'+(z.i+1)+' ('+z.x.t+')').join(', ')+' answered wrong');
    areas.push({pk,bits:bits.join(' \u00b7 ')});
  });
  if(q.length && !q.every(x=>p.quizSub[x.id])){
    const sub=q.filter(x=>p.quizSub[x.id]).length;
    areas.push({pk:null,bits:'the exam drill is unfinished ('+sub+' of '+q.length+' submitted) \u2014 it is 30% of the score'});
  }
  return areas;
}
function stars(){
  const list=objsFor(S.mode), p=S.per[S.mode];
  const ft=list.filter(o=>p.firstTry[o.id]).length/list.length;
  const hints=Object.values(p.hints).reduce((a,b)=>a+b,0);
  let s= ft>=0.9?3 : ft>=0.7?2 : ft>=0.5?1 : 0;
  s+= hints===0?2 : (S.mode==='medium'? (hints<=3?1:0) : 0);
  return Math.max(1,Math.min(5,s));
}
function openDone(){
  const list=objsFor(S.mode), p=S.per[S.mode];
  const q=QUIZ[S.mode], corr=q.filter(x=>p.quizSub[x.id]&&p.quiz[x.id]===x.a).length;
  const st=stars(), scorepct=$('#scorepct').textContent;
  const recap=['P1','P2','P3','P4'].map(k=>{
    const l=list.filter(o=>o.pillar===k), d=l.filter(o=>p.solved[o.id]).length;
    return '<div class="flexrow"><span class="pillar '+k+'">'+k+'</span> '+PILLAR_NAME[k]+' \u2014 '+d+'/'+l.length+' stamped</div>';
  }).join('');
  const quizLine = q.every(x=>p.quizSub[x.id]) ? 'Exam drill: '+corr+'/'+q.length+' correct.' : 'Exam drill: not finished \u2014 '+corr+'/'+q.length+' so far (it is 30% of the score).';
  const focusHTML=computeFocusAreas().map(a=>
    '<li>'+(a.pk? '<span class="pillar '+a.pk+'">'+a.pk+'</span> <strong>'+PILLAR_NAME[a.pk]+'</strong> \u2014 ' : '')+a.bits+
    (a.pk? '. <em>Revisit: '+PILLAR_FIX[a.pk]+'.</em>' : '')+'</li>').join('');
  $('#donecard').innerHTML=
    '<span class="qmeta">Requirements dossier \u2014 '+(S.mode==='medium'?'Guided Drafting':'Unassisted Review')+'</span>'+
    '<h2 id="donetitle">Dossier approved \u2014 the drafting room is quiet</h2>'+
    '<div class="flexrow"><div class="stars" role="img" aria-label="'+st+' of 5 stars">'+
      [1,2,3,4,5].map(i=>i<=st?STAR_ON:STAR_OFF).join('')+'</div>'+
      '<strong style="font-size:22px;font-family:var(--mono)">'+scorepct+'</strong><span class="small">overall score</span></div>'+
    '<p>'+quizLine+' Stars reflect first-attempt accuracy ('+Math.round(100*list.filter(o=>p.firstTry[o.id]).length/list.length)+'%) and hint usage.</p>'+
    '<h3>Recap by pillar</h3>'+recap+
    '<h3>Focus areas</h3>'+
    (focusHTML.length? '<ul class="tight">'+focusHTML+'</ul>'
      : '<div class="ok"><strong>None \u2014 clean run.</strong> Every objective was stamped first-pass without hints'+(q.every(x=>p.quizSub[x.id])?' and the drill was flawless':'')+'. Carry the method straight into 2.2.</div>')+
    '<h3>What to learn next</h3><ul class="tight">'+
    '<li><strong>2.2 Infrastructure as Code</strong> \u2014 turn these spec sheets into repeatable templates.</li>'+
    '<li><strong>2.3 Workload migrations</strong> \u2014 execute the assess \u2192 plan \u2192 move \u2192 validate cycle this dossier set up.</li>'+
    '<li><strong>2.4 Resource provisioning</strong> \u2014 provision exactly what you specified here (PBQs love this).</li></ul>'+
    '<p class="small">Official reference: <a href="https://www.comptia.org/en-us/certifications/cloud" target="_blank" rel="noopener">CompTIA Cloud+</a> (new tab).</p>'+
    '<div class="flexrow" style="margin-top:10px"><button class="btn btn-solid" id="btn-done-close">Back to the room</button>'+
    '<button class="btn" id="btn-done-switch">Switch to '+(S.mode==='medium'?'Hard':'Medium')+' mode</button>'+
    '<button class="btn btn-ghost" id="btn-done-reset">Reset the lab</button></div>';
  $('#overlay-done').classList.remove('hidden');
  $('#btn-done-close').focus();
  announce('Completion modal opened. '+st+' of 5 stars.');
}

/* ---------- overlays / modes / reset ---------- */
function chooseMode(m){ S.mode=m; save(); $('#overlay-mode').classList.add('hidden');
  $('#brief-mode-note').textContent='Selected: '+(m==='medium'?'Guided Drafting (Medium)':'Unassisted Review (Hard)')+' \u2014 you can switch later from the title block.';
  $('#overlay-brief').classList.remove('hidden'); }
function enterRoom(){ S.briefSeen=true; save(); $('#overlay-brief').classList.add('hidden');
  renderCabinet(); renderBoard(); renderClipboard(); updateHeader();
  announce('Drafting room open. Mode: '+S.mode+'.'); }
function switchMode(){ S.mode=S.mode==='medium'?'hard':'medium'; save();
  renderCabinet(); renderBoard(); renderClipboard(); updateHeader();
  announce('Switched to '+S.mode+' mode. Objectives and quiz are tracked separately.'); }
function doReset(){ try{ localStorage.removeItem(LAB_KEY); }catch(e){} location.reload(); }
function closeDone(){ $('#overlay-done').classList.add('hidden'); const b=$('#btn-finish'); if(b && !b.disabled) b.focus(); }
function closeReset(){ $('#overlay-reset').classList.add('hidden'); const b=$('#btn-reset'); if(b) b.focus(); }
function bind(){
  document.addEventListener('keydown',e=>{
    if(e.key!=='Escape') return;
    if(!$('#overlay-done').classList.contains('hidden')) closeDone();
    else if(!$('#overlay-reset').classList.contains('hidden')) closeReset();
    else if(!$('#overlay-brief').classList.contains('hidden') && S.mode) enterRoom();
  });
  $('#overlay-done').addEventListener('click',e=>{ if(e.target.id==='overlay-done') closeDone(); });
  $('#overlay-reset').addEventListener('click',e=>{ if(e.target.id==='overlay-reset') closeReset(); });
  document.addEventListener('click',e=>{
    const t=e.target.closest('button'); if(!t) return;
    if(t.dataset.folder) setFolder(t.dataset.folder);
    else if(t.dataset.tab){ S.ui.tab=t.dataset.tab; save(); renderBoard(true); }
    else if(t.dataset.mode) chooseMode(t.dataset.mode);
    else if(t.dataset.check) checkObjective(t.dataset.check);
    else if(t.dataset.hint) hintObjective(t.dataset.hint);
    else if(t.dataset.go){ const [f,tb]=t.dataset.go.split('|'); setFolder(f,tb); }
    else if(t.dataset.quiz) submitQuiz(t.dataset.quiz);
    else if(t.dataset.term){ setFolder('glossary','terms'); setTimeout(()=>flashTerm(t.dataset.term),80); }
    else if(t.id==='btn-switchmode') switchMode();
    else if(t.id==='btn-enter') enterRoom();
    else if(t.id==='btn-finish') openDone();
    else if(t.id==='btn-reset') $('#overlay-reset').classList.remove('hidden');
    else if(t.id==='btn-reset-no') closeReset();
    else if(t.id==='btn-reset-yes') doReset();
    else if(t.id==='btn-done-close') closeDone();
    else if(t.id==='btn-done-switch'){ $('#overlay-done').classList.add('hidden'); switchMode(); }
    else if(t.id==='btn-done-reset') doReset();
  });
  document.addEventListener('change',e=>{
    const el=e.target;
    if(el.dataset.f){ setP(el.dataset.f, el.value); save(); updateHeader();
      if(S.ui.folder==='budget' && el.dataset.f.indexOf('env.spec')===0) renderBoard();
    }
    else if(el.dataset.set){ const set=el.dataset.set, val=el.dataset.val;
      const arr = getP('env.'+set) || [];
      const i=arr.indexOf(val);
      if(el.checked && i<0) arr.push(val);
      if(!el.checked && i>=0) arr.splice(i,1);
      setP('env.'+set, arr);
      save();
    }
  });
}
function init(){
  load(); bind();  renderCabinet(); renderBoard(); renderClipboard(); updateHeader();
  $('#overlay-mode').classList.toggle('hidden', !!S.mode);
  $('#overlay-brief').classList.toggle('hidden', S.briefSeen || !S.mode);
  $('#overlay-done').classList.add('hidden');
  $('#overlay-reset').classList.add('hidden');
  if(!S.mode) $('#overlay-mode').classList.remove('hidden');
  else if(!S.briefSeen) $('#overlay-brief').classList.remove('hidden');
  if(!storageOK){ storageAnnounced=true; setTimeout(()=>announce('Note: browser storage is unavailable \u2014 progress will not survive a reload.'),600); }
}
init();
