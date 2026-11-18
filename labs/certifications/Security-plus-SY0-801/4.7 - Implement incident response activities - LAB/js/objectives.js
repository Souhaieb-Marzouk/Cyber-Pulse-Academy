/* ============================================================
   Larkspur Logistics — INC-2026-0117 · Incident Response Lab
   CompTIA Security+ SY0-801 · Lesson 4.7 (training exercise)
   File: js/objectives.js
   Objective engine: action desk, widget renderers, CHECK RESULTS validation, hints, bottom bar.
   Content extracted 1:1 from the audited lab (static port v4).
   ============================================================ */
/* ---- desk ---- */
function currentObjId(){
  const ids=curIds();for(const id of ids){if(!S.st[id].done)return id;}return null;
}
function renderDesk(){
  const ph=PHASES.find(p=>p.id===S.stationSel);
  const st=STATIONS[ph.id];
  const sit=$('sitCard');sit.innerHTML='';
  const unlocked=stationUnlocked(ph.id);
  sit.appendChild(el('h3',null,'<span class="ph" style="--pc:'+ph.c+'">'+ph.n+'</span>Station '+(PHASES.indexOf(ph)+1)+' of 8'));
  sit.appendChild(el('p',null,unlocked?st.sit[S.mode==='medium'?'m':'h']:'<b>Locked.</b> Finish the previous station to open this one.'));
  const arts=st.arts.filter(a=>!ART[a].hard||S.mode==='hard');
  sit.appendChild(el('p',null,'<span class="micro">Evidence on this station:</span> '+arts.map(a=>esc(ART[a].t)).join(' · ')));
  const cur=currentObjId();
  const ic=$('interCard');ic.innerHTML='';
  const objs=defsFor(ph.id);
  if(!objs.length){ic.appendChild(el('p','empty','No objectives on this station — it advances when adjacent stations complete.'));return;}
  objs.forEach(id=>{
    const d=curDefs()[id],stt=S.st[id];
    const card=el('div','card'+(cur===id?' cur-obj':''));
    card.style.marginTop='0px';card.dataset.obj=id;
    if(cur===id){card.style.borderColor='var(--amber)';}
    card.appendChild(el('h3',null,'<span class="badge '+d.pillar+'">'+d.pillar+'</span> <span class="k">'+id+'</span> · '+d.title));
    card.appendChild(el('p',null,d.brief));
    const w=el('div','widget');d.widget.parts.forEach((p,pi)=>w.appendChild(renderPart(d,p,pi,id)));card.appendChild(w);
    const wr=el('div','wcheck');
    const cb=el('button','btn small','Check results');cb.type='button';
    cb.onclick=()=>checkObj(id);
    wr.appendChild(cb);
    if(stt.done)wr.appendChild(el('span','okmark','✔ validated'+(stt.firstTry?' on first attempt':'')));
    else if(stt.attempts>0)wr.appendChild(el('span','okmark no','✘ checked '+stt.attempts+'× — rework and recheck'));
    wr.appendChild(el('span','hintnote',(S.mode==='medium'?stt.hints+' hint(s) used':(stt.hints?'nudge used (−10)':'no nudge used'))));
    card.appendChild(wr);
    const feed=el('div','feed');feed.setAttribute('role','status');feed.setAttribute('aria-live','polite');feed.id='feed-'+id;card.appendChild(feed);
    if(stt.done){feed.className='feed show pass';feed.innerHTML='<b>✔ Validated</b>'+d.fb.pass;}
    else if(stt.attempts>0){feed.className='feed show fail';feed.innerHTML='<b>✘ Not yet — teaching point</b>'+d.fb.fail;}
    if(stt.done){
      // R2 lock: a validated objective is read-only — answers cannot be changed after validation
      card.querySelectorAll('button,select,input').forEach(x=>{x.disabled=true;});
      cb.textContent='Validated ✓';
    }
    ic.appendChild(card);
  });
}
function setFeed(id,pass,html){const f=$('feed-'+id);if(!f)return;f.className='feed show '+(pass?'pass':'fail');f.innerHTML=(pass?'<b>✔ Validated — why it matters</b>':'<b>✘ Not yet — teaching point</b>')+html;}
/* ---- widgets ---- */
function renderPart(d,p,pi,objId){
  const box=el('div');
  if(p.items&&p.items.length&&p.kind!=='multi')box.appendChild(el('div','wtitle',p.kind==='seq'?'Order the steps — use ▲▼':(p.bins.length===3?'Classify each item — three verdicts':'Sort each item')));
  if(p.kind==='bins'){
    p.items.forEach((it,ii)=>{
      const row=el('div','bin-row');row.appendChild(el('div','txt',esc(it.txt)));
      const seg=el('div','seg');p.bins.forEach((bn,bi)=>{
        const o=el('button','opt',esc(bn));o.type='button';o.setAttribute('aria-pressed',S.ans[objId][pi][it.id]===bi?'true':'false');
        o.onclick=()=>{S.ans[objId][pi][it.id]=bi;save();seg.querySelectorAll('.opt').forEach((x,k)=>x.setAttribute('aria-pressed',S.ans[objId][pi][it.id]===k?'true':'false'));};
        seg.appendChild(o);});
      row.appendChild(seg);box.appendChild(row);});
  }else if(p.kind==='match'){
    const perm=p.perm||p.opts.map((_,i)=>i);
    const rperm=p.rperm||p.rows.map((_,i)=>i);
    rperm.forEach(ri=>{
      const it=p.rows[ri];
      const row=el('div','match-row');row.appendChild(el('div','txt',esc(it.txt)));
      const sel=document.createElement('select');
      sel.setAttribute('aria-label','Choose the correct option for: '+it.txt.slice(0,60));
      sel.appendChild(new Option('— choose —',''));
      perm.forEach((oi,di)=>sel.appendChild(new Option(p.opts[oi],di)));
      const real=S.ans[objId][pi][it.id];
      sel.value=(real!==undefined&&perm.indexOf(real)>-1)?String(perm.indexOf(real)):'';
      sel.onchange=()=>{S.ans[objId][pi][it.id]=sel.value===''?undefined:perm[+sel.value];save();};
      row.appendChild(sel);box.appendChild(row);});
  }else if(p.kind==='multi'){
    box.appendChild(el('div','wtitle',objId&&curDefs()[objId]&&curDefs()[objId].widget.parts[pi].prompt?curDefs()[objId].widget.parts[pi].prompt:'Select every item that qualifies — exact set required'));
    const deck=el('div','multi-deck');
    p.items.forEach(it=>{
      const t=el('button','tog');t.type='button';t.setAttribute('aria-pressed',S.ans[objId][pi][it.id]?'true':'false');
      t.innerHTML='<span class="tk">'+(S.ans[objId][pi][it.id]?'■':'□')+'</span><span>'+esc(it.txt)+'</span>';
      t.onclick=()=>{S.ans[objId][pi][it.id]=!S.ans[objId][pi][it.id];save();t.setAttribute('aria-pressed',S.ans[objId][pi][it.id]?'true':'false');t.querySelector('.tk').textContent=S.ans[objId][pi][it.id]?'■':'□';};
      deck.appendChild(t);});
    box.appendChild(deck);
  }else if(p.kind==='seq'){
    const list=el('div','seq-list');list.dataset.obj=objId;list.dataset.pi=pi;
    const order=S.ans[objId][pi];
    order.forEach((itemIdx,pos)=>{
      const it=p.items[itemIdx];
      const row=el('div','seq-item');row.dataset.pos=pos;
      row.innerHTML='<span class="idx">'+(pos+1)+'</span><span class="txt">'+esc(it.txt)+'</span>';
      const mv=el('div','mv');
      const up=el('button','iconbtn','▲');up.type='button';up.setAttribute('aria-label','Move up: '+it.txt.slice(0,50));
      const dn=el('button','iconbtn','▼');dn.type='button';dn.setAttribute('aria-label','Move down: '+it.txt.slice(0,50));
      up.disabled=pos===0;dn.disabled=pos===order.length-1;
      up.onclick=()=>moveSeq(objId,pi,pos,-1);dn.onclick=()=>moveSeq(objId,pi,pos,1);
      mv.appendChild(up);mv.appendChild(dn);row.appendChild(mv);list.appendChild(row);});
    box.appendChild(list);
  }else if(p.kind==='form'){
    const g=el('div','form-grid');
    p.fields.forEach(f=>{
      const lab=el('label',null,esc(f.lbl));
      const inp=document.createElement('input');inp.type='text';inp.placeholder=f.ph||'';inp.value=S.ans[objId][pi][f.id]||'';
      inp.setAttribute('aria-label',f.lbl);
      inp.oninput=()=>{S.ans[objId][pi][f.id]=inp.value;save();};
      lab.appendChild(inp);g.appendChild(lab);});
    box.appendChild(g);
  }else if(p.kind==='radio'){
    const perm=p.perm||p.opts.map((_,i)=>i);
    const g=el('div','radio-grid');g.setAttribute('role','radiogroup');
    perm.forEach((oi,di)=>{
      const lab=el('label');const r=document.createElement('input');r.type='radio';r.name='rad-'+objId+'-'+pi;r.value=di;
      r.checked=S.ans[objId][pi]===oi;
      r.onchange=()=>{S.ans[objId][pi]=oi;save();};
      lab.appendChild(r);lab.appendChild(el('span',null,esc(p.opts[oi])));g.appendChild(lab);});
    box.appendChild(g);
  }
  return box;
}
function moveSeq(objId,pi,pos,delta){
  const a=S.ans[objId][pi];const j=pos+delta;if(j<0||j>=a.length)return;
  [a[pos],a[j]]=[a[j],a[pos]];save();
  const card=$('interCard');card.querySelectorAll('.seq-list').forEach(list=>{
    if(list.dataset.obj===objId&&+list.dataset.pi===pi){const d=curDefs()[objId];const fresh=renderPart(d,d.widget.parts[pi],pi,objId);list.replaceWith(fresh);}});
}
/* ---- validation ---- */
function partResult(p,pi,ansPi){
  if(p.kind==='bins'){
    let wrong=0,miss=0;
    p.items.forEach(it=>{if(ansPi[it.id]===undefined)miss++;else if(ansPi[it.id]!==it.ok)wrong++;});
    return (miss||wrong)?{ok:false,d:(miss?miss+' item(s) unclassified':'')+((miss&&wrong)?'; ':'')+ (wrong?wrong+' misclassified':'')}:{ok:true,d:''};
  }
  if(p.kind==='match'){
    let wrong=0,miss=0;
    p.rows.forEach(it=>{if(ansPi[it.id]===undefined)miss++;else if(+ansPi[it.id]!==it.ok)wrong++;});
    return (miss||wrong)?{ok:false,d:(miss?miss+' unrouted':'')+((miss&&wrong)?'; ':'')+(wrong?wrong+' wrong routing':'')}:{ok:true,d:''};
  }
  if(p.kind==='multi'){
    let wrong=0;p.items.forEach(it=>{if((ansPi[it.id]===true)!==(it.ok===1))wrong++;});
    return wrong?{ok:false,d:wrong+' item(s) selected wrongly'}:{ok:true,d:''};
  }
  if(p.kind==='seq'){
    for(let i=0;i<p.items.length;i++){if(ansPi[i]!==i)return {ok:false,d:'order breaks at position '+(i+1)};}
    return {ok:true,d:''};
  }
  if(p.kind==='form'){
    for(const f of p.fields){if(!f.ck(ansPi[f.id]))return {ok:false,d:'field "'+f.lbl+'" needs attention'};}
    return {ok:true,d:''};
  }
  if(p.kind==='radio'){
    return ansPi===p.ok?{ok:true,d:''}:{ok:false,d:'reconsider the choice'};
  }
  return {ok:true,d:''};
}
function checkObj(id){
  const d=curDefs()[id],stt=S.st[id];
  if(stt.done)return; // validated objectives are locked (R2)
  stt.attempts++;
  let firstFail=null;
  d.widget.parts.forEach((p,pi)=>{const r=partResult(p,pi,S.ans[id][pi]);if(!r.ok&&firstFail===null)firstFail={pi,r};});
  const pass=firstFail===null;
  if(pass){
    stt.done=true;stt.firstTry=stt.attempts===1;
    addTick('ok','✔ '+id+' validated — '+d.title.replace(/<[^>]*>/g,''));
    S.ledger.push({t:fmtT(S.tmin),cls:'good',x:id+' validated · '+d.title.replace(/<[^>]*>/g,'')});
    advanceIfStation(d.phase);
    save();renderAll();setFeed(id,true,d.fb.pass);
    if(objsDone()===curIds().length&&!S.done){S.done=true;save();setTimeout(openDone,900);}
  }else{
    addTick('bad','✘ '+id+' check failed — '+firstFail.r.d);
    save();setFeed(id,false,d.fb.fail+'<br><span style="color:var(--red)">Checker detail — part '+(firstFail.pi+1)+': '+esc(firstFail.r.d)+'.</span>');
  }
  renderBottomBar();renderObjDrawer();
}
function advanceIfStation(ph){
  if(S.adv[ph])return;
  if(stationDone(ph)){S.adv[ph]=true;S.tmin+=PHASES.find(p=>p.id===ph).t;
    addTick('warn','Phase closed: '+PHASES.find(p=>p.id===ph).n+' — sim clock advances to '+fmtT(S.tmin));
    S.ledger.push({t:fmtT(S.tmin),cls:'info',x:'Phase closed: '+PHASES.find(p=>p.id===ph).n});
    if(ph==='notif'){S.out['Draft · Regulator notice (72h clock, phased)']='To the supervisory authority: Larkspur Logistics detected a personal-data breach incident INC-2026-0117 on Mon 08:20. Preliminary facts: extortion incident on finance systems; categories of data and scale under assessment; DPO contact: dpo@larkspur.example. Updates to follow in phases. — Elena Cruz, Legal.';
      S.out['Draft · Customer notice (after facts verified)']='What happened: attempted extortion against Larkspur systems; what data: [verified categories]; what we did: contained, investigated, rebuilt; what to do: follow the guidance in this notice. One voice: Tom Okafor. Plain language. No blame, no jargon.';
      save();}
    renderStrip();}
}

/* ---- bottom bar ---- */
function renderBottomBar(){
  const cur=currentObjId(),bar=$('curObj');
  if(!cur){bar.innerHTML='<b>All objectives validated.</b> Finish &amp; score, then take the after-action review below.';}
  else{const d=curDefs()[cur];
    bar.innerHTML=(S.mode==='medium'?'Objective ':'Challenge ')+cur+' · <b>'+d.title+'</b>';}
  const wb=$('whereBtn');wb.style.display=S.mode==='medium'?'':'none';
  const hb=$('hintBtn');
  if(!cur){hb.disabled=true;wb.disabled=true;$('checkBtn').disabled=true;$('hintBox').innerHTML='';}
  else{const stt=S.st[cur];
    $('checkBtn').disabled=false;wb.disabled=false;
    if(S.mode==='medium'){hb.disabled=stt.hints>=3;hb.textContent='Hint ('+stt.hints+'/3)';}
    else{hb.disabled=stt.hints>=1;hb.textContent='Request nudge (−10)';}
  }
}
function hintClick(){
  const cur=currentObjId();if(!cur)return;
  const stt=S.st[cur];
  if(S.mode==='hard'){stt.hints++;save();$('hintBox').textContent='NUDGE (costs 10 pts): '+curDefs()[cur].hints[0];flashTicker('warn','Nudge used on '+cur+' — score impact −10');renderBottomBar();return;}
  stt.hints++;save();
  const lvl=['Nudge','Direction','Demonstration'][stt.hints-1];
  $('hintBox').textContent=lvl+' · '+curDefs()[cur].hints[stt.hints-1];
  renderBottomBar();
}
function whereClick(){
  const cur=currentObjId();if(!cur)return;
  const w=curDefs()[cur].where;
  if(w&&w.doc){switchTab('ev');S.selDoc=w.doc;save();renderSide();const dv=$('docView').firstElementChild;if(dv){dv.classList.add('glow');setTimeout(()=>dv.classList.remove('glow'),3000);}}
  else{const c=$('interCard');c.classList.add('glow');setTimeout(()=>c.classList.remove('glow'),3000);}
}