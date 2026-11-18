/* == js/ui.js — rendering: ledger, acts, widgets, bench, brief, debrief, completion, modals. */
/* ---------- header / ledger ---------- */
function renderHeader(){
  const ids=objectivesOfMode(), solved=ids.filter(id=>orec(id).solved).length;
  document.getElementById('hScore').innerHTML='SOLVED <b>'+solved+'/'+ids.length+'</b>';
  document.getElementById('hStars').innerHTML='RATING <b>'+starsNow().toFixed(1)+'</b> ★';
  document.getElementById('hMode').textContent='SHIFT — '+MODES[S.mode].name.toUpperCase();
}
function renderLedger(){
  const ids=objectivesOfMode();
  const ul=document.getElementById('objList'); ul.innerHTML='';
  ids.forEach(id=>{
    const o=OBJ[id], r=orec(id);
    const li=elc('li');
    const b=elc('button','obutton'+(r.solved?' done':''));
    b.type='button';
    b.setAttribute('aria-label','Objective '+id+(r.solved?' — solved':''));
    b.innerHTML='<span class="st" aria-hidden="true">✓</span><span class="ot">'+esc(id)+' · '+esc(o.q.length>44?o.q.slice(0,44)+'…':o.q)+
      '<span class="meta">'+o.pillar+' · '+(r.solved?'SOLVED':(r.wrong? r.wrong+' retry'+(r.wrong>1?'s':''):'not yet')+(r.hints?' · '+r.hints+' hint'+(r.hints>1?'s':''):''))+'</span></span>';
    b.addEventListener('click',()=>{
      document.getElementById('obj-'+id).scrollIntoView({behavior:'smooth',block:'start'});
      document.getElementById('ledger').classList.remove('open');
      document.getElementById('ledgerToggle').setAttribute('aria-expanded','false');
    });
    li.appendChild(b); ul.appendChild(li);
  });
  const pr=document.getElementById('pillarRow'); pr.innerHTML='';
  ['P1','P2','P3','P4'].forEach(p=>{
    const tot=ids.filter(id=>OBJ[id].pillar===p).length;
    const done=ids.filter(id=>OBJ[id].pillar===p&&orec(id).solved).length;
    const sp=elc('span','ppill'+(done===tot&&tot>0?' done':''),p+' '+done+'/'+tot);
    sp.title={P1:'Understand',P2:'Recognize / Analyze',P3:'Detect',P4:'Mitigate'}[p];
    pr.appendChild(sp);
  });
  const nxt=ids.find(id=>!orec(id).solved);
  const nn=document.getElementById('nextNote');
  if(nxt){ const a=OBJ[nxt].act.toUpperCase(); nn.innerHTML='NEXT ON THE BOARD → <b>'+esc(nxt)+'</b> in '+esc(a)+'. The ledger entry scrolls you there.'; }
  else { nn.innerHTML='Every objective solved. <b>Cross-examination</b> is waiting in Act VI — then close the case in Act VII.'; }
  document.getElementById('ledgerStars').textContent=starString(starsNow())+'  '+starsNow().toFixed(1)+'/5';
  renderHeader();
}

/* ---------- act builders ---------- */
function buildActs(){
  const host=document.getElementById('acts'); host.innerHTML='';
  const acts=actsOfMode();
  acts.forEach((act,i)=>{
    const sec=elc('section','act'); sec.id=act.id;
    const unlocked=actUnlocked(i);
    if(!unlocked) sec.classList.add('locked');
    const head=elc('header');
    const objsN=act.objs? act.objs.length : 0;
    const solvedN=act.objs? act.objs.filter(id=>orec(id).solved).length : 0;
    head.innerHTML='<span class="ano">'+esc(act.no)+'</span><h2>'+esc(act.title)+'</h2>'+
      (objsN?'<span class="hintline">'+solvedN+'/'+objsN+' OBJECTIVES</span>':'');
    sec.appendChild(head);
    if(!unlocked){
      const prev=acts[i-1];
      const note=elc('div','locknote','⌧ LOCKED — complete '+esc(prev.no+': '+prev.title)+(prev.kind==='quiz'?' (submit the cross-examination)':'')+' first.');
      sec.appendChild(note); host.appendChild(sec); return;
    }
    const body=elc('div','actbody');
    if(act.kind==='brief') body.appendChild(buildBrief());
    if(act.kind==='suspects') body.appendChild(buildSuspectLine(act));
    if(act.kind==='evidence'){
      body.appendChild(buildBench(act));
      act.objs.forEach(id=>body.appendChild(objBlock(OBJ[id])));
    }
    if(act.kind==='detect'||act.kind==='harden'){
      body.appendChild(elc('p','note',ACT_INTRO[act.kind]));
      if(act.kind==='harden'&&S.mode==='hard') body.appendChild(hardeningConstraints());
      act.objs.forEach(id=>body.appendChild(objBlock(OBJ[id])));
    }
    if(act.kind==='quiz'){ body.appendChild(elc('p','note',ACT_INTRO.quiz)); body.appendChild(buildQuiz()); }
    if(act.kind==='debrief'){ body.appendChild(buildDebrief()); }
    sec.appendChild(body); host.appendChild(sec);
  });
  /* R2: after any rebuild, re-lock every already-solved objective's inputs */
  objectivesOfMode().forEach(id=>{ if(orec(id).solved) lockObjWidgets(id); });
}
function objAnchor(id){ return 'obj-'+id; }

function buildSuspectLine(act){
  const wrap=elc('div');
  wrap.appendChild(elc('p','note',ACT_INTRO.suspects));
  const line=elc('div','suspectline');
  SUSPECTS.forEach(s=>{
    const c=elc('article','suspect');
    c.innerHTML='<span class="slot">'+esc(s.slot)+'</span><h4>'+esc(s.name)+'</h4><div class="aline">'+esc(s.aline)+'</div>'+
      '<div class="desc">'+esc(s.desc)+'</div>';
    line.appendChild(c);
  });
  wrap.appendChild(line);
  act.objs.forEach(id=>wrap.appendChild(objBlock(OBJ[id])));
  return wrap;
}

function hardeningConstraints(){
  const p=elc('div','paper');
  p.innerHTML='<span class="train-tag">TRAINING DATA — CIO MEMO (FICTIONAL)</span>'+
  '<h4>From: CIO, Halcyon Vale RMC — "Q3 hardening envelope"</h4>'+
  '<p class="mono" style="font-size:.82rem">Team — four initiatives fit this quarter\'s envelope, and I want them SEQUENCED, not just funded.<br>'+
  'Known facts from the post-incident review: entry vector was <b>phishing</b>; the <b>flat network</b> carried the lateral spread; <b>EDR is already deployed</b>; <b>off-site backups are already funded</b>.<br>'+
  'Everything else is competing for the same four slots. Choose deliberately. — R.M.</p>';
  return p;
}

/* ---------- widgets ---------- */
function suspectOptions(withNoise,key){
  let vals=SUSPECTS.map(s=>s.id); if(withNoise) vals=vals.concat(['NOISE']);
  const perm=shuffled((key||'pins')+'::opts',vals.length);
  return '<option value="">— pin to suspect —</option>'+perm.map(i=>{
    const v=vals[i];
    return '<option value="'+v+'">'+esc(v==='NOISE'?'NOISE — red herring':SNAME[v])+'</option>';
  }).join('');
}
function optList(vals){ return vals.map(v=>'<option value="'+esc(v)+'">'+esc(v)+'</option>').join(''); }
function renderWidget(o,w,host){
  const t=w.type;
  if(t==='match'){
    const isSuspect=(w.opts&&SUSPECTS.find(s=>s.id===w.opts[0]));
    const vals=isSuspect? SUSPECTS.map(s=>s.id) : (w.opts? w.opts.slice() : SUSPECTS.map(s=>s.id));
    const optPerm=shuffled(w.key+'::opts',vals.length);
    const optsHtml=optPerm.map(i=>isSuspect? '<option value="'+vals[i]+'">'+esc(SNAME[vals[i]])+'</option>' : '<option value="'+esc(vals[i])+'">'+esc(vals[i])+'</option>').join('');
    const rowPerm=shuffled(w.key,w.rows.length);
    rowPerm.forEach((orig,disp)=>{
      const r=w.rows[orig];
      const row=elc('div','matchrow');
      row.innerHTML='<span class="defno">'+(disp+1)+'</span><span style="flex:2;min-width:180px;font-size:.84rem">'+esc(r.t)+'</span>';
      const sel=elc('select','ui');
      sel.innerHTML='<option value="">— select —</option>'+optsHtml;
      sel.setAttribute('aria-label','Item '+(disp+1)+' answer');
      const cur=(getW(w.key)||[])[orig]; if(cur) sel.value=cur;
      sel.addEventListener('change',()=>{ const arr=(getW(w.key)||[]).slice(); arr[orig]=sel.value; setW(w.key,arr); });
      row.appendChild(sel); host.appendChild(row);
    });
  }
  else if(t==='match2'){
    const rowPerm=shuffled(w.key,w.rows.length);
    const motPerm=shuffled(w.key+'::m',MOT_NAMES.length);
    const susPerm=shuffled(w.key+'::s',SUSPECTS.length);
    rowPerm.forEach((orig,disp)=>{
      const r=w.rows[orig];
      const row=elc('div','matchrow');
      row.innerHTML='<span class="defno">'+(disp+1)+'</span><span style="flex:2;min-width:170px;font-size:.8rem">'+esc(r.t)+'</span>';
      const msel=elc('select','ui');
      msel.innerHTML='<option value="">— motive —</option>'+motPerm.map(i=>'<option value="'+esc(MOT_NAMES[i])+'">'+esc(MOT_NAMES[i])+'</option>').join('');
      const ssel=elc('select','ui');
      ssel.innerHTML='<option value="">— actor —</option>'+susPerm.map(i=>'<option value="'+SUSPECTS[i].id+'">'+esc(SUSPECTS[i].name)+'</option>').join('');
      const cur=getW(w.key)||[];
      if(cur[orig]){ msel.value=cur[orig].m||''; ssel.value=cur[orig].s||''; }
      msel.setAttribute('aria-label','Item '+(disp+1)+' motivation');
      ssel.setAttribute('aria-label','Item '+(disp+1)+' actor');
      msel.addEventListener('change',()=>{ const arr=(getW(w.key)||[]).slice(); arr[orig]=Object.assign({},arr[orig],{m:msel.value}); setW(w.key,arr); });
      ssel.addEventListener('change',()=>{ const arr=(getW(w.key)||[]).slice(); arr[orig]=Object.assign({},arr[orig],{s:ssel.value}); setW(w.key,arr); });
      row.appendChild(msel); row.appendChild(ssel); host.appendChild(row);
    });
  }
  else if(t==='dials'){
    const grid=elc('div','wgrid');
    const cardPerm=shuffled(w.key,w.cards.length);
    cardPerm.forEach(ci=>{
      const c=w.cards[ci];
      const card=elc('div','wcard');
      const sus=SUSPECTS.find(s=>s.id===c.sid);
      card.innerHTML='<h4>'+esc(sus? sus.name : c.sid)+'</h4>';
      const cur=getW(w.key)||{};
      cur[c.sid]=cur[c.sid]||{};
      c.fields.forEach(f=>{
        const lab=elc('label',null,esc(f.l));
        const sel=elc('select','ui');
        sel.innerHTML='<option value="">—</option>'+f.opts.map(x=>'<option value="'+esc(x)+'">'+esc(x)+'</option>').join('');
        if(cur[c.sid][f.k]) sel.value=cur[c.sid][f.k];
        sel.setAttribute('aria-label',esc((sus? sus.name:c.sid)+' — '+f.l));
        sel.addEventListener('change',()=>{ const st=getW(w.key)||{}; st[c.sid]=st[c.sid]||{}; st[c.sid][f.k]=sel.value; setW(w.key,st); });
        card.appendChild(lab); card.appendChild(sel);
      });
      grid.appendChild(card);
    });
    host.appendChild(grid);
  }
  else if(t==='stamp'){
    const itemPerm=shuffled(w.key,w.items.length);
    itemPerm.forEach(ii=>{
      const it=w.items[ii];
      const box=elc('div','qrow');
      box.innerHTML='<h4>'+esc(it.l)+'</h4><p class="note" style="margin:.1em 0 .4em">'+esc(it.d)+'</p>';
      const set=elc('div','stampset'); set.setAttribute('role','group'); set.setAttribute('aria-label','Verdict for '+esc(it.l));
      const cur=getW(w.key)||{};
      w.choices.forEach(ch=>{
        const b=elc('button','stampbtn'+(ch.green?' greenpick':''),esc(ch.label));
        b.type='button'; b.setAttribute('aria-pressed',cur[it.id]===ch.v?'true':'false');
        b.addEventListener('click',()=>{
          const st=getW(w.key)||{}; st[it.id]= (st[it.id]===ch.v? '' : ch.v); setW(w.key,st);
          set.querySelectorAll('.stampbtn').forEach(x=>x.setAttribute('aria-pressed','false'));
          if(st[it.id]) b.setAttribute('aria-pressed','true');
          announce((st[it.id]?'Marked ':'Cleared ')+it.l);
        });
        set.appendChild(b);
      });
      box.appendChild(set); host.appendChild(box);
    });
  }
  else if(t==='order'){
    const list=elc('ul','orderlist');
    const itemPerm=shuffled(w.key,w.items.length);
    const paint=()=>{
      const cur=getW(w.key)||[];
      list.innerHTML='';
      itemPerm.forEach(ii=>{
        const it=w.items[ii];
        const li=elc('li');
        const b=elc('button','orditem');
        b.type='button'; b.setAttribute('aria-pressed',cur.includes(it.id)?'true':'false');
        const idx=cur.indexOf(it.id);
        b.innerHTML='<span class="no" aria-hidden="true">'+(idx>=0?(idx+1):'·')+'</span><span class="txt">'+esc(it.txt)+'</span>';
        b.setAttribute('aria-label',(idx>=0?'Position '+(idx+1)+': ':'Unranked: ')+it.txt+'. Activate to '+(idx>=0?'remove from':'add to')+' the sequence.');
        b.addEventListener('click',()=>{
          let c=(getW(w.key)||[]).slice();
          if(c.includes(it.id)){ c=c.filter(x=>x!==it.id); }
          else c.push(it.id);
          setW(w.key,c); paint();
          announce(c.includes(it.id)?('Ranked position '+(c.indexOf(it.id)+1)):('Removed from sequence: '+it.txt));
        });
        li.appendChild(b); list.appendChild(li);
      });
    };
    paint();
    host.appendChild(list);
    const clr=elc('button','btn ghost small','Clear ranking'); clr.type='button';
    clr.style.marginTop='8px';
    clr.addEventListener('click',()=>{ setW(w.key,[]); paint(); });
    host.appendChild(clr);
  }
  else if(t==='multi'){
    const cur=getW(w.key)||[];
    const optPerm=shuffled(w.key,w.opts.length);
    optPerm.forEach(oi=>{
      const op=w.opts[oi];
      const lab=elc('label','chk');
      const cb=document.createElement('input'); cb.type='checkbox';
      cb.checked=cur.includes(op.v);
      cb.setAttribute('aria-label',esc(op.label));
      cb.addEventListener('change',()=>{
        let c=(getW(w.key)||[]).slice();
        if(cb.checked && !c.includes(op.v)) c.push(op.v);
        if(!cb.checked) c=c.filter(x=>x!==op.v);
        setW(w.key,c);
      });
      lab.appendChild(cb);
      lab.appendChild(document.createTextNode(op.label));
      host.appendChild(lab);
    });
  }
  else if(t==='radio'){
    const optPerm=shuffled(w.key,w.opts.length);
    optPerm.forEach(oi=>{
      const op=w.opts[oi];
      const lab=elc('label','chk');
      const rb=document.createElement('input'); rb.type='radio'; rb.name=w.key; rb.value=op.v;
      if(getW(w.key)===op.v) rb.checked=true;
      rb.setAttribute('aria-label',esc(op.label));
      rb.addEventListener('change',()=>{ setW(w.key,op.v); });
      lab.appendChild(rb);
      lab.appendChild(document.createTextNode(op.label));
      host.appendChild(lab);
    });
  }
  else if(t==='text'){
    const ta=elc('textarea','ui');
    ta.rows=2; ta.style.width='100%';
    ta.placeholder=w.placeholder||'';
    if(getW(w.key)) ta.value=getW(w.key);
    ta.setAttribute('aria-label',w.placeholder||'Justification');
    ta.addEventListener('input',()=>{ setW(w.key,ta.value); });
    host.appendChild(ta);
  }
  else if(t==='pinref'){
    const note=elc('p','note');
    note.innerHTML= w.withNoise
      ? 'Use the pin selector on every slip in the Evidence Bench (all five drawers). Two slips belong in the NOISE bin.'
      : 'Use the pin selector on the six primary slips in the Evidence Bench below.';
    host.appendChild(note);
  }
}

/* ---------- objective block ---------- */
/* R2 lock: once an objective is SOLVED its inputs lock — a checked result can no longer be edited. */
function lockObjWidgets(id){
  const box=document.getElementById('obj-'+id); if(!box) return;
  box.querySelectorAll('select,input,textarea').forEach(x=>{ x.disabled=true; });
  box.querySelectorAll('.stampbtn,.orditem').forEach(b=>{ b.disabled=true; b.setAttribute('aria-disabled','true'); });
  const clr=[...box.querySelectorAll('button')].find(b=>/Clear ranking/.test(b.textContent));
  if(clr) clr.disabled=true;
}
function objBlock(o){
  const box=elc('div','obj'); box.id=objAnchor(o.id);
  const r=orec(o.id);
  if(r.solved) box.classList.add('solved');
  const head=elc('div','objhead');
  head.innerHTML='<span class="oid">'+esc(o.id)+'</span><span class="pbadge p-'+o.pillar+'">'+o.pillar+' · '+
    ({P1:'UNDERSTAND',P2:'RECOGNIZE',P3:'DETECT',P4:'MITIGATE'})[o.pillar]+'</span>'+
    (r.solved?'<span class="pinok" style="margin-left:auto;font-family:var(--mono);font-size:.7rem;color:var(--green-text)">✔ SOLVED</span>':'');
  box.appendChild(head);
  box.appendChild(elc('p','objq',esc(o.q)+'<span class="ctx">Anchors: '+esc(o.anchor)+'</span>'));
  renderWidget(o,o.widget,box);
  if(o.widget2){ box.appendChild(elc('h4',null,esc(o.widget2.q||'Part 2:'))); renderWidget(o,o.widget2,box); }
  if(o.widget3){ box.appendChild(elc('h4',null,'Part 3:')); renderWidget(o,o.widget3,box); }
  const row=elc('div','checkrow');
  const chk=elc('button','btn','CHECK RESULT'); chk.type='button';
  chk.setAttribute('aria-label','Check result for objective '+o.id);
  chk.addEventListener('click',()=>checkObjective(o.id));
  row.appendChild(chk);
  const hintWrap=elc('span');
  hintWrap.style.display='inline-flex'; hintWrap.style.gap='8px'; hintWrap.style.flexWrap='wrap';
  row.appendChild(hintWrap);
  box.appendChild(row);
  const fb=elc('div','feedback'); fb.id='fb-'+o.id; fb.setAttribute('role','status');
  box.appendChild(fb);
  const hb=elc('div','hintbox'); hb.id='hb-'+o.id; hb.style.display='none';
  box.appendChild(hb);
  paintHints(o,hintWrap,hb);
  return box;
}
function paintHints(o,wrap,hb){
  wrap.innerHTML='';
  const r=orec(o.id);
  if(S.mode==='medium'){
    const shown=r.hints;
    if(shown<o.hints.length){
      const b=elc('button','btn ghost small','HINT '+(shown+1)+'/'+o.hints.length+' (−0.1 rating)');
      b.type='button';
      b.setAttribute('aria-label','Reveal hint '+(shown+1)+' of '+o.hints.length);
      b.addEventListener('click',()=>{ r.hints++; save(); paintHints(o,wrap,hb); showHint(o,hb,r.hints-1); renderLedger(); });
      wrap.appendChild(b);
    } else {
      wrap.appendChild(elc('span','note','all hints revealed'));
    }
    const shownBox=elc('div');
    for(let i=0;i<r.hints;i++){ const p=elc('div'); p.innerHTML='<b>HINT '+(i+1)+':</b> '+esc(o.hints[i]); shownBox.appendChild(p); }
    if(r.hints>0){ hb.style.display='block'; hb.innerHTML=shownBox.innerHTML; }
  } else {
    if(r.hints===0){
      const b=elc('button','btn ghost small','REVEAL THE ONE NUDGE (−0.25 rating)');
      b.type='button';
      b.addEventListener('click',()=>{ r.hints++; save(); paintHints(o,wrap,hb); showHint(o,hb,0); renderLedger(); });
      wrap.appendChild(b);
    }
  }
}
function showHint(o,hb,i){
  hb.style.display='block';
  const txt = S.mode==='hard' ? o.hints[0] : o.hints[i];
  if(S.mode==='hard'){ hb.innerHTML='<b>NUDGE:</b> '+esc(txt)+' <span class="note">(single nudge used — no more for this objective)</span>'; }
  else { if(!hb.innerHTML.includes('HINT '+(i+1))) hb.innerHTML+='<div><b>HINT '+(i+1)+':</b> '+esc(txt)+'</div>'; }
  announce('Hint revealed for '+o.id);
}

let _lastUnlocked=null;
function refreshGating(){
  const acts=actsOfMode();
  const sig=acts.map((a,i)=>actUnlocked(i)?'1':'0').join('');
  if(sig!==_lastUnlocked){ _lastUnlocked=sig; buildActs(); }
  else {
    acts.forEach(act=>{
      if(act.objs){
        const s=act.objs.filter(id=>orec(id).solved).length;
        const h=act.id==='act6'?null:document.querySelector('#'+act.id+' .hintline');
        if(h) h.textContent=s+'/'+act.objs.length+' OBJECTIVES';
      }
    });
  }
}

/* ---------- evidence bench ---------- */
function buildBench(act){
  const wrap=elc('div');
  wrap.appendChild(elc('p','note',ACT_INTRO.evidence));
  const withNoise=(S.mode==='hard');
  const pinIds=new Set();
  objectivesOfMode().forEach(id=>{ const o=OBJ[id]; if(o.widget.type==='pinref') o.widget.evs.forEach(e=>pinIds.add(e)); });
  const tabs=elc('div','benchtabs'); tabs.setAttribute('role','tablist'); tabs.setAttribute('aria-label','Evidence drawers');
  const panels=elc('div');
  TABS.forEach((tb,i)=>{
    const b=elc('button','btab',esc(tb.label)); b.type='button';
    b.id='btab-'+tb.id; b.setAttribute('role','tab');
    b.setAttribute('aria-selected',i===0?'true':'false');
    b.setAttribute('aria-controls','bpanel-'+tb.id);
    b.addEventListener('click',()=>{
      tabs.querySelectorAll('.btab').forEach(x=>x.setAttribute('aria-selected','false'));
      b.setAttribute('aria-selected','true');
      panels.querySelectorAll('[role="tabpanel"]').forEach(p=>p.hidden=true);
      const pn=document.getElementById('bpanel-'+tb.id); pn.hidden=false;
      announce('Drawer: '+tb.label);
    });
    tabs.appendChild(b);
  });
  TABS.forEach((tb,i)=>{
    const pn=elc('div'); pn.id='bpanel-'+tb.id; pn.setAttribute('role','tabpanel'); pn.setAttribute('aria-labelledby','btab-'+tb.id);
    pn.hidden=i!==0;
    const grid=elc('div','slips');
    EVIDENCE.filter(e=>e.tab===tb.id).forEach(ev=>{
      const slip=elc('article','slip'); slip.dataset.ev=ev.id;
      let tag='<span class="src">'+esc(ev.src)+'</span>';
      if(ev.herring) tag+=' <span class="src" style="background:#6b2415">UNATTRIBUTED</span>';
      slip.innerHTML='<h4>'+esc(ev.title)+' '+tag+'</h4><div class="body">'+esc(ev.body)+'</div>';
      if(pinIds.has(ev.id)){
        const row=elc('div','pinrow');
        row.innerHTML='<label for="pin-'+ev.id+'">PIN TO →</label>';
        const sel=elc('select','ui'); sel.id='pin-'+ev.id;
        sel.innerHTML=suspectOptions(withNoise);
        const pins=getW('pins')||{};
        if(pins[ev.id]) sel.value=pins[ev.id];
        sel.setAttribute('aria-label','Pin evidence '+ev.id+' to a suspect');
        sel.addEventListener('change',()=>{ const st=getW('pins')||{}; st[ev.id]=sel.value; setW('pins',st);
          announce(ev.id+' pinned to '+(sel.value==='NOISE'?'NOISE':(SNAME[sel.value]||'nothing'))); });
        row.appendChild(sel); slip.appendChild(row);
      } else {
        const note=elc('p','note'); note.style.fontSize='.72rem'; note.style.marginTop='8px';
        note.innerHTML='<span class="mono">▸ CONTEXT SLIP — analyzed inside later objectives.</span>';
        slip.appendChild(note);
      }
      grid.appendChild(slip);
    });
    pn.appendChild(grid); panels.appendChild(pn);
  });
  wrap.appendChild(tabs); wrap.appendChild(panels);
  return wrap;
}

/* ---------- brief / knowledge core ---------- */
function buildBrief(){
  const wrap=elc('div');
  const memo=elc('div','paper');
  memo.innerHTML='<span class="train-tag red">TRAINING DATA — INTAKE MEMO (FICTIONAL ORG, SYNTHETIC EVIDENCE)</span>'+
   '<h3>The Quiet Ward</h3>'+
   '<p>Halcyon Vale Regional Medical Center, 420 beds, three towns, one data center. In a single quarter the security desk logged <b>six incidents</b>: a silent VPN intrusion, an unsanctioned cloud drive full of patient data, a defaced careers page, a six-hour portal outage claimed by a protest collective, a double-extortion ransom negotiation, and a departing analyst with a full USB stick.</p>'+
   '<p>You are the night-shift attribution analyst. Six suspect classes are booked on the wall. Your job: <b>profile them, pin the evidence, detect the next one early, and harden the hospital</b> — the same compare-and-contrast skill the CompTIA Security+ objective (SY0-801 Lesson 2.1, actor types, attributes, and motivations) tests on exam day.</p>';
  wrap.appendChild(memo);
  const kc=elc('section'); kc.setAttribute('aria-label','Knowledge core');
  kc.appendChild(elc('p','kicker','KNOWLEDGE CORE'));
  kc.appendChild(elc('h3',null,'The suspect line — six classes, one glance'));
  const grid=elc('div','suspectline');
  SUSPECTS.forEach(s=>{
    const kp=KNOW_PROFILES.find(k=>k.id===s.id);
    const c=elc('div','suspect');
    c.innerHTML='<span class="slot">'+esc(s.slot)+'</span><h4>'+esc(s.name)+'</h4><div class="aline">'+esc(s.aline)+'</div>'+
      '<div class="desc">'+esc(s.desc)+'</div>'+
      '<div class="attr"><b>WANTS:</b> '+esc(kp.mot)+'<br><b>BOOKING SHEET:</b> '+esc(kp.attr)+'</div>';
    grid.appendChild(c);
  });
  kc.appendChild(grid);
  kc.appendChild(elc('h3',null,'The motivation shelf — why they come'));
  const shelf=elc('div','wgrid');
  MOTIVATIONS.forEach(m=>{
    const c=elc('div','wcard'); c.innerHTML='<h4>'+esc(m[0])+'</h4><p style="font-size:.8rem;margin:0">'+esc(m[1])+'</p>';
    shelf.appendChild(c);
  });
  kc.appendChild(shelf);
  kc.appendChild(elc('h3',null,'The booking sheet — three attributes that compare actors'));
  const tbl=elc('table','dtable');
  tbl.innerHTML='<thead><tr><th>Attribute</th><th>What it separates</th><th>Exam-grade shorthand</th></tr></thead><tbody>'+
   '<tr><td><b>Internal / external</b></td><td>Whether access was granted (insider, shadow IT) or taken (everyone else)</td><td>Who holds the badge?</td></tr>'+
   '<tr><td><b>Resources / funding</b></td><td>Teenager\'s allowance → crime syndicate → state budget</td><td>How long can they pay to stay hidden?</td></tr>'+
   '<tr><td><b>Level of sophistication / capability</b></td><td>Default passwords → rented tooling → custom zero-days</td><td>What had to be improvised vs scripted?</td></tr></tbody>';
  kc.appendChild(tbl);
  kc.appendChild(elc('h3',null,'Real-world case files (MITRE ATT&CK — opens in a new tab)'));
  const ul=elc('ul','mlist links');
  MITRE_CASES.forEach(c=>{
    const li=elc('li');
    li.innerHTML='<b>'+esc(c.n)+' ('+esc(c.g)+')</b> — '+esc(c.t)+': '+esc(c.d)+' <a href="https://attack.mitre.org/groups/'+esc(c.g)+'/" target="_blank" rel="noopener">attack.mitre.org/groups/'+esc(c.g)+'/</a>';
    ul.appendChild(li);
  });
  kc.appendChild(ul);
  const blur=elc('div','paper');
  blur.innerHTML='<h4>When labels blur — the compare-and-contrast skill</h4>'+
   '<p>MITRE classifies LAPSUS$ (G1004) and Scattered Spider (G1015) as <b>criminal</b> groups, yet both are constantly described as hacktivist-like; CyberAv3ngers (G1027) wears a hacktivist costume over a suspected state affiliation; Lazarus (G0032) is a state group that robs exchanges. The exam will hand you exactly these edge cases. <b>Anchor on motivation and access</b> — who profits, who claims it, and who held a legitimate key — not on the label someone chose.</p>';
  kc.appendChild(blur);
  const gbtn=elc('button','btn ghost','OPEN THE GLOSSARY — '+GLOSSARY.length+' index cards'); gbtn.type='button';
  gbtn.addEventListener('click',()=>openModal('glossModal'));
  kc.appendChild(gbtn);
  wrap.appendChild(kc);
  return wrap;
}
/* ---------- debrief ---------- */
function buildDebrief(){
  const wrap=elc('div');
  wrap.appendChild(elc('p','kicker','FIELD NOTES FOR THE NEXT SHIFT'));
  wrap.appendChild(elc('h3',null,'Detection opportunities — data source → example logic'));
  const t=elc('table','dtable');
  t.innerHTML='<thead><tr><th>Data source</th><th>Example detection logic</th><th>Watch for</th></tr></thead><tbody>'+
    DETECT_ROWS.map(r=>'<tr><td><b>'+r[0]+'</b></td><td class="mono" style="font-size:.75rem">'+r[1]+'</td><td>'+r[2]+'</td></tr>').join('')+'</tbody>';
  wrap.appendChild(t);
  wrap.appendChild(elc('h3',null,'Mitigation recommendations — official MITRE ATT&CK mitigation IDs'));
  const ul=elc('ul','mlist');
  MIT_RECS.forEach(m=>{ ul.appendChild(elc('li','<b>'+m[0]+' · '+esc(m[1])+'</b> — '+esc(m[2]))); });
  wrap.appendChild(ul);
  wrap.appendChild(elc('h3',null,'Blue-team takeaways'));
  const b1=elc('ul','mlist');
  ['Attribute by BEHAVIOR, not geography: the wire report was wrong because a foreign IP is not a foreign actor — valid credentials and a badge were.',
   'False positives are workflow, not waste: annotate the approved scan, tune the rule, keep the decoy — silent deletion erases the audit trail.',
   'The insider program is an HR+IT join: grievance files, notice periods and badge physics belong in the same query as VPN logs.',
   'Shadow IT is a process failure wearing a user\'s face — sanction and broker apps, or the drive simply moves somewhere you cannot see.',
   'Motivation predicts the next move: financial actors open a payment window, espionage never breaks anything, and hacktivists need you SILENT more than they need you down.'].forEach(x=>b1.appendChild(elc('li',esc(x))));
  wrap.appendChild(b1);
  wrap.appendChild(elc('h3',null,'Red-team mindset (defensive use only)'));
  const b2=elc('ul','mlist');
  ['The cheapest attack surface is a person with a badge — no exploit chain outperforms a granted account and a grievance.',
   'Noise is cover: internet-wide scans and honeypot spray exist to drown the one alert that matters — defenders need baselines and paper trails, not more alerts.',
   'Every MFA exemption is a side door with your own name on it: "legacy device" profiles are how patient operators walk in.',
   'Resignation season is incident season: staging, forwarding and USB writes cluster in notice periods — watch the window, not just the wall.'].forEach(x=>b2.appendChild(elc('li',esc(x))));
  wrap.appendChild(b2);
  wrap.appendChild(elc('h3',null,'References (open in a new tab)'));
  const ref=elc('ul','mlist links');
  ref.appendChild(elc('li','<a href="https://attack.mitre.org/groups/" target="_blank" rel="noopener">MITRE ATT&CK Groups index</a> — G0007, G0016, G0032, G0046, G1004, G1015, G1027 case files above.'));
  ref.appendChild(elc('li','<a href="https://attack.mitre.org/mitigations/enterprise/" target="_blank" rel="noopener">MITRE ATT&CK Enterprise Mitigations index</a> — every M-ID cited in this lab.'));
  ref.appendChild(elc('li','<a href="https://www.comptia.org/training/by-certification/security/security" target="_blank" rel="noopener">CompTIA Security+ certification page</a> — this lab maps to the "threat actors and motivations" objective (course Lesson 2.1; numbered 2.2 in the official SY0-801 objectives document).'));
  wrap.appendChild(ref);
  const note=elc('p','note');
  note.innerHTML='Rating formula: start at 5.0 — each retry −0.15, each hint −0.1 (Medium) or −0.25 (Hard nudge), floor 1.0. Closing the case requires every objective solved and the cross-examination filed.';
  wrap.appendChild(note);
  const row=elc('div','checkrow');
  const btn=elc('button','btn','CLOSE THE CASE — completion report'); btn.type='button'; btn.id='btnCloseCase';
  btn.addEventListener('click',()=>{
    if(!objectivesOfMode().every(id=>orec(id).solved)||!S.quiz.submitted){
      announce('Case not closable yet: solve every objective and submit the cross-examination first.');
      const old=document.getElementById('closeWarn'); if(old) old.remove();
      btn.insertAdjacentHTML('afterend','<p class="note" id="closeWarn" style="color:var(--stamp-text)">Not yet — the ledger still shows open objectives'+(S.quiz.submitted?'':' and the cross-examination is unfiled')+'.</p>'); return; }
    openDone();
  });
  row.appendChild(btn);
  wrap.appendChild(row);
  return wrap;
}
function paintCloseButton(){
  const b=document.getElementById('btnCloseCase'); if(!b) return;
  const ready=objectivesOfMode().every(id=>orec(id).solved)&&S.quiz.submitted;
  b.disabled=!ready;
  b.title=ready?'Open the completion report':'Solve all objectives and file the quiz first';
}

/* ---------- completion ---------- */
function openDone(){
  const ids=objectivesOfMode();
  const solved=ids.filter(id=>orec(id).solved).length;
  const firsts=ids.filter(id=>orec(id).solved&&orec(id).wrong===0&&orec(id).hints===0).length;
  const correct=quizOfMode().filter((q,qi)=>S.quiz.answers[qi]===q.a).length;
  const v=starsNow();
  const box=document.getElementById('doneBox');
  let html='<button class="closex" data-close="doneModal" type="button">CLOSE ×</button>'+
   '<span class="kicker">CASE 2026-114 · CLOSED</span>'+
   '<h3 id="doneTitle">The Quiet Ward — attributed.</h3>'+
   '<div class="stars" aria-label="Rating '+v.toFixed(1)+' out of 5">'+starString(v)+'</div>'+
   '<p style="margin:.2em 0 .6em"><b>'+v.toFixed(1)+'/5 case rating</b> · '+solved+'/'+ids.length+' objectives · '+firsts+' first-attempt clean · '+
   (S.mode==='hard'?'nudges used: '+ids.reduce((a,id)=>a+(orec(id).hints||0),0):'hints used: '+ids.reduce((a,id)=>a+(orec(id).hints||0),0))+' · cross-examination '+correct+'/'+quizOfMode().length+'</p>';
  ['P1','P2','P3','P4'].forEach(p=>{
    const grp=ids.filter(id=>OBJ[id].pillar===p);
    if(!grp.length) return;
    html+='<div class="pillargroup"><h4>'+p+' · '+({P1:'UNDERSTAND',P2:'RECOGNIZE / ANALYZE',P3:'DETECT',P4:'MITIGATE'})[p]+'</h4><div class="recap">'+
      grp.map(id=>(orec(id).solved?'✔ ':'◻ ')+esc(id)+' '+esc(OBJ[id].q.length>60?OBJ[id].q.slice(0,60)+'…':OBJ[id].q)).join('<br>')+'</div></div>';
  });
  /* R8: focus areas derived from actual performance evidence */
  const weak=ids.filter(id=>orec(id).solved&&(orec(id).wrong>0||orec(id).hints>0))
    .sort((a,b)=>(orec(b).wrong+orec(b).hints)-(orec(a).wrong+orec(a).hints));
  const quizWrong=quizOfMode().map((q,qi)=>({q:q,ok:S.quiz.answers[qi]===q.a})).filter(x=>!x.ok);
  let focusHtml='';
  if(weak.length||quizWrong.length){
    focusHtml='<div class="focusbox"><h4>FOCUS AREAS — WHERE TO PUSH NEXT</h4><ul>';
    weak.forEach(id=>{
      const rr=orec(id);
      focusHtml+='<li><b>'+esc(id)+'</b> ('+OBJ[id].pillar+') — '+esc(OBJ[id].anchor.split(';')[0].slice(0,70))+
        ' · '+rr.wrong+' retr'+(rr.wrong===1?'y':'ies')+(rr.hints?', '+rr.hints+' hint'+(rr.hints>1?'s':''):'')+
        ' → re-read that section of the Knowledge Core, then re-run this shift and clear it first-attempt.</li>';
    });
    quizWrong.forEach(x=>{ focusHtml+='<li><b>Cross-examination:</b> review <i>'+esc(x.q.topic||'the related topic')+'</i> — you missed that item.</li>'; });
    if(weak.length){
      const byP={}; weak.forEach(id=>{ const p=OBJ[id].pillar; byP[p]=(byP[p]||0)+orec(id).wrong+orec(id).hints; });
      const heaviest=Object.keys(byP).sort((a,b)=>byP[b]-byP[a])[0];
      focusHtml+='</ul><p style="margin:.4em 0 0;font-size:.82rem"><b>Heaviest friction: '+heaviest+' '
        +({P1:'UNDERSTAND',P2:'RECOGNIZE / ANALYZE',P3:'DETECT',P4:'MITIGATE'})[heaviest]+
        '</b> — most of your retries and hints clustered there. Start your revision in that pillar.</p>';
    } else focusHtml+='</ul>';
    focusHtml+='</div>';
  } else {
    focusHtml='<div class="focusbox"><h4>FOCUS AREAS — WHERE TO PUSH NEXT</h4><p style="margin:.2em 0 0">No weak spots logged: every objective solved first-attempt with no hints, and a clean cross-examination. Push yourself with the other shift, then with the next lesson\'s material.</p></div>';
  }
  html+=focusHtml;
  html+='<p style="margin-top:12px">You can now explain <b>who</b> attacks (six actor classes), <b>why</b> (the motivation shelf), how they differ on the booking sheet (internal/external · funding · sophistication), where each shows up first in telemetry, and which controls take which actor off the board. That is the full span of the lesson.</p>'+
   '<p class="note"><b>What to learn next:</b> SY0-801 threat vectors and attack surfaces (the next lesson) — you already know WHO; now study HOW they get in. Re-read the MITRE case files you pinned least confidently. And if you took one shift, take the other: the same wall plays very differently unsupervised.</p>'+
   '<button class="btn" data-close="doneModal" type="button">Back to the wall</button>';
  box.innerHTML=html;
  S.completed=true; save();
  openModal('doneModal');
  announce('Case closed. Rating '+v.toFixed(1)+' out of 5.');
}

/* ---------- modals & boot ---------- */
let _modalReturn=null;
function openModal(id){
  _modalReturn=document.activeElement;
  const m=document.getElementById(id); m.classList.add('open');
  const f=m.querySelector('button'); if(f) f.focus();
}
function closeModal(id){
  const m=document.getElementById(id); if(!m) return;
  m.classList.remove('open');
  if(_modalReturn&&document.contains(_modalReturn)&&_modalReturn.focus){ try{ _modalReturn.focus(); }catch(e){} }
  _modalReturn=null;
}

