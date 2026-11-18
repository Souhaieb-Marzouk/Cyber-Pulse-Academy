/* == js/objectives.js — CHECK RESULTS validation engine + R2/R3 attempt accounting. */
/* ============ ENGINE B — VALIDATION, CONTENT, BOOT ============ */
function validateOne(w){
  if(w.type==='match'){
    const cur=getW(w.key)||[];
    if(w.rows.some((r,i)=>!cur[i])) return {empty:true};
    const bad=[]; w.rows.forEach((r,i)=>{ if(cur[i]!==w.answer[i]) bad.push(r.t.slice(0,28)+'…'); });
    return bad.length?{pass:false,msg:'Wrongly attributed: '+bad.join(' / ')+'.'}:{pass:true};
  }
  if(w.type==='match2'){
    const cur=getW(w.key)||[];
    if(w.rows.some((r,i)=>!cur[i]||!cur[i].m||!cur[i].s)) return {empty:true};
    const bad=[]; w.rows.forEach((r,i)=>{ if(cur[i].m!==w.rows[i].m||cur[i].s!==w.rows[i].s) bad.push(r.t.slice(0,28)+'…'); });
    return bad.length?{pass:false,msg:'Wrong motive or actor: '+bad.join(' / ')+'.'}:{pass:true};
  }
  if(w.type==='dials'){
    const cur=getW(w.key)||{}; const bad=[];
    for(const c of w.cards){ cur[c.sid]=cur[c.sid]||{};
      for(const f of c.fields){ if(!cur[c.sid][f.k]) return {empty:true}; if(cur[c.sid][f.k]!==f.a) bad.push((SUSPECTS.find(s=>s.id===c.sid)||{name:c.sid}).name+' · '+f.l); } }
    return bad.length?{pass:false,msg:'Still wrong: '+bad.join('; ')+'.'}:{pass:true};
  }
  if(w.type==='pinref'){
    const pins=getW('pins')||{}; const bad=[];
    for(const id of w.evs){ if(!pins[id]) return {empty:true};
      const ev=EVIDENCE.find(e=>e.id===id);
      if(pins[id]!==ev.pin) bad.push(id+' → '+(pins[id]==='NOISE'?'NOISE':SNAME[pins[id]])); }
    return bad.length?{pass:false,msg:'Wrong pins: '+bad.join(', ')+'.'}:{pass:true};
  }
  if(w.type==='stamp'){
    const cur=getW(w.key)||{}; const bad=[];
    for(const it of w.items){ if(!cur[it.id]) return {empty:true}; if(cur[it.id]!==w.answer[it.id]) bad.push(it.l); }
    return bad.length?{pass:false,msg:'Re-stamp: '+bad.join(', ')+'.'}:{pass:true};
  }
  if(w.type==='order'){
    const c=getW(w.key)||[];
    const expected=w.pick||w.items.length;
    if(c.length<expected) return {empty:true,msg:'Rank exactly '+expected+' items first ('+c.length+' ranked).'};
    return c.join('|')===w.answer.join('|')?{pass:true}:{pass:false,msg:'Sequence mismatch — the checker will not say which position is wrong.'};
  }
  if(w.type==='multi'){
    const c=(getW(w.key)||[]).slice().sort(); const a=w.answer.slice().sort();
    if(c.length===0) return {empty:true};
    return (c.length===a.length && c.every((x,i)=>x===a[i]))?{pass:true}:{pass:false,msg:'The selection set is not exactly right.'};
  }
  if(w.type==='radio'){
    const v=getW(w.key); if(!v) return {empty:true};
    return v===w.answer?{pass:true}:{pass:false};
  }
  if(w.type==='text'){
    const t=(getW(w.key)||'').trim();
    if(t.length<15) return {empty:true,msg:'Write at least one full sentence (15+ characters).'};
    const low=t.toLowerCase();
    const hits=w.keywords.filter(k=>low.includes(k));
    return hits.length>=w.min?{pass:true}:{pass:false,msg:'The justification must cite at least '+w.min+' pieces of case evidence (credentials, badge, USB, grievance…).'};
  }
  return {pass:false};
}
function validate(o){
  for(const w of [o.widget,o.widget2,o.widget3]){
    if(!w) continue;
    const r=validateOne(w);
    if(r.empty||!r.pass) return r;
  }
  return {pass:true};
}
function checkObjective(id){
  const o=OBJ[id], r=orec(id);
  const fb=document.getElementById('fb-'+id);
  const v=validate(o);
  /* attempt signature: identical widget state + repeated CHECK = same attempt, not a new penalty */
  const sig=JSON.stringify([o.widget,o.widget2,o.widget3].map(w=>w?getW(w.key):null));
  const show=(cls,html)=>{ fb.className='feedback show '+cls; fb.innerHTML=html; };
  if(v.empty){ show('bad','<span class="fbt">INCOMPLETE</span>'+(v.msg||'Complete every field for '+o.id+' before checking — nothing was scored.')); announce(o.id+' check incomplete: fill all fields first.'); return; }
  if(v.pass){
    const firstTime=!r.solved;
    r.solved=true; save();
    show('good','<span class="fbt">✔ '+o.id+' — SOLVED'+(r.wrong?' · '+r.wrong+' retr'+(r.wrong>1?'ies':'y'):' · first attempt')+'</span>'+esc(o.fbGood));
    const box=document.getElementById('obj-'+id); if(box) box.classList.add('solved');
    lockObjWidgets(id);
    refreshGating(); renderLedger();
    announce(o.id+' solved. '+o.fbGood.slice(0,80));
    if(firstTime && objectivesOfMode().every(x=>orec(x).solved)) announce('All objectives solved — the cross-examination and case closing are open.');
  } else {
    if(!r.solved && r.lastSig!==sig){ r.wrong++; r.lastSig=sig; }
    save();
    show('bad','<span class="fbt">✘ '+o.id+' — NOT QUITE</span>'+esc(o.fbBad)+(v.msg?'<br><i>Checker note:</i> '+esc(v.msg):''));
    renderLedger();
    announce(o.id+' not yet — read the feedback and retry.');
  }
}
