/* ============================================================
   Larkspur Logistics — INC-2026-0117 · Incident Response Lab
   CompTIA Security+ SY0-801 · Lesson 4.7 (training exercise)
   File: js/ui.js
   Rendering helpers and shared UI: strip, rail, evidence tray, ticker, drawers, glossary, debrief, knowledge core, overlays.
   Content extracted 1:1 from the audited lab (static port v4).
   ============================================================ */
const $=id=>document.getElementById(id);
const el=(tag,cls,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* ---- strip ---- */
function renderStrip(){
  const total=curIds().length,done=objsDone();
  $('clockChip').innerHTML='T+ <b>'+fmtDur(S.tmin)+'</b> · sim '+fmtT(S.tmin);
  const left=Math.max(0,4320-S.tmin);
  $('regChip').innerHTML='72h window: <b>'+fmtDur(left)+'</b> left';
  $('regChip').className='chip '+(left<720?'alarm':'hot');
  $('mfill').style.width=(done/total*100)+'%';
  $('mlabel').textContent=done+'/'+total+' objectives'+(S.mode==='hard'?' · live-fire':'');
}

/* ---- rail ---- */
function renderRail(){
  const r=$('rail');r.innerHTML='';
  r.appendChild(el('h3',null,'Lifecycle rail'));
  PHASES.forEach((p,i)=>{
    const objs=defsFor(p.id),done=objs.length&&objs.every(id=>S.st[id]&&S.st[id].done);
    const ul=stationUnlocked(p.id);
    const b=el('button','stn'+(S.stationSel===p.id?' active':'')+(done?' done':'')+(ul?'':' locked'));
    b.style.setProperty('--pc',p.c);
    b.innerHTML='<span class="num">'+(i+1)+'</span><span class="bar"></span><span class="nm">'+p.n+'</span>'+
      '<span class="st" aria-hidden="true">'+(done?'✔':(ul?'●':'🔒'))+'</span>';
    b.setAttribute('aria-label',p.n+(done?' — complete':(ul?' — open':' — locked')));
    b.onclick=()=>{if(!ul){flashTicker('warn','Station locked: finish the previous phase first.');return;}
      S.stationSel=p.id;save();renderAll();};
    r.appendChild(b);
  });
  const sub=el('div','rail-sub','<span class="micro">Lesson backbone</span><br>');
  BACKBONE.forEach(([t,ph])=>{const s=el('span','bb',t);s.style.borderColor=PHASES.find(p=>p.id===ph).c;s.style.color=PHASES.find(p=>p.id===ph).c;sub.appendChild(s);});
  sub.appendChild(el('div',null,'<span style="font-size:11px">Your lesson\'s five phases, mapped onto the official eight.</span>'));
  r.appendChild(sub);
}
/* ---- evidence / ledger / outbox ---- */
function renderSide(){
  const ph=PHASES.find(p=>p.id===S.stationSel);
  const arts=STATIONS[ph.id].arts.filter(a=>!ART[a].hard||S.mode==='hard');
  const dl=$('docList');dl.innerHTML='';
  arts.forEach(a=>{
    const b=el('button','docbtn'+(S.selDoc===a?' active':''));b.type='button';
    b.innerHTML=esc(ART[a].t)+(ART[a].hard?'<span class="noiseflag">noise?</span>':'');
    b.onclick=()=>{S.selDoc=a;save();renderSide();};
    dl.appendChild(b);});
  const dv=$('docView');dv.innerHTML='';
  if(S.selDoc&&arts.includes(S.selDoc)){
    const d=el('div','doc on');d.setAttribute('role','document');d.textContent=ART[S.selDoc].b;dv.appendChild(d);
  }else{
    dv.appendChild(el('div','empty','Select an artifact to inspect it. Everything here is synthetic training data.'));
  }
  const lg=$('ledger');lg.innerHTML='';
  if(!S.ledger.length)lg.appendChild(el('div','empty','Decision ledger is empty — validated actions land here.'));
  S.ledger.slice(-40).forEach(e=>lg.appendChild(el('div','lg '+(e.cls||''),'<span class="lt">['+e.t+']</span> '+e.x)));
  const ob=$('outbox');ob.innerHTML='';
  const outs=Object.keys(S.out||{});
  if(!outs.length)ob.appendChild(el('div','empty','Comms outbox empty — draft notifications unlock when the notification station validates.'));
  outs.forEach(k=>ob.appendChild(el('div','outmsg','<b>'+k+'</b>'+S.out[k])));
}
function flashTicker(cls,x){addTick(cls,x);}
function addTick(cls,x){S.ticks.push({t:fmtT(S.tmin),cls,x});if(S.ticks.length>60)S.ticks.shift();renderTicker();}
function renderTicker(){
  const t=$('ticker');t.innerHTML='';
  S.ticks.slice(-24).forEach(e=>t.appendChild(el('div',e.cls||'','<span class="tt">['+e.t+']</span> '+e.x)));
  t.scrollTop=t.scrollHeight;
}
/* ---- objectives drawer ---- */
function renderObjDrawer(){
  const list=$('objList');list.innerHTML='';
  curIds().forEach(id=>{
    const d=curDefs()[id],stt=S.st[id];
    const row=el('div','objrow'+(stt.done?'':' '));
    const status=stt.done?'✔ done':(currentObjId()===id?'● current — check it now':'○ open');
    row.innerHTML='<div class="or1"><span class="oid">'+id+'</span><span class="ot">'+d.title+'</span>'+
      '<span class="badge '+d.pillar+'">'+d.pillar+'</span><span class="ost '+(stt.done?'done':(currentObjId()===id?'cur':'open'))+'">'+status+'</span></div>'+
      '<div class="fb2">'+d.fb.pass+'</div>';
    const btn=el('button','btn ghost small','Go to station');
    btn.onclick=()=>{S.stationSel=d.phase;save();closeOverlay('objOverlay');renderAll();};
    row.appendChild(btn);row.onclick=e=>{if(e.target===row)row.classList.toggle('opened');};
    list.appendChild(row);});
}

/* ---- glossary ---- */
function renderGloss(){
  const g=$('glossList');g.innerHTML='';
  GLOSSARY.forEach(([t,d])=>g.appendChild(el('div','gterm','<b>'+esc(t)+'</b><p>'+esc(d)+'</p>')));
}
/* ---- debrief ---- */
function renderDebrief(){
  const d=$('debBody');
  const t=el('table','dtable','<tr><th>Detection source</th><th>What it sees</th><th>Example detection logic</th></tr>'+
    DEB.detect.map(r=>'<tr><td>'+r[0]+'</td><td>'+r[1]+'</td><td>'+r[2]+'</td></tr>').join(''));
  const c1=el('div','dcard','<h3>🔍 Detection opportunities</h3><p style="font-size:12.5px;color:var(--dim);margin-bottom:4px">Data sources this chapter feeds on — with example logic to tune.</p>');
  const tw=el('div','dtablewrap');tw.appendChild(t);c1.appendChild(tw);
  const c2=el('div','dcard','<h3>🛡 Mitigation recommendations</h3><ul>'+DEB.mitig.map(m=>'<li>'+m+'</li>').join('')+'</ul>');
  const c3=el('div','dcard','<h3>🔵 Blue-team takeaways</h3><ul>'+DEB.blue.map(m=>'<li>'+m+'</li>').join('')+'</ul>');
  const c4=el('div','dcard','<h3>🔴 Red-team mindset (defensive)</h3><ul>'+DEB.red.map(m=>'<li>'+m+'</li>').join('')+'</ul>');
  const c5=el('div','dcard','<h3>🔗 Official references</h3><p style="font-size:12.5px;color:var(--dim)">Primary sources for this chapter — open in a new tab.</p><div class="linkrow">'+
    DEB.links.map(l=>'<a href="'+l[1]+'" target="_blank" rel="noopener noreferrer">'+l[0]+'</a>').join('')+'</div>');
  d.appendChild(c1);d.appendChild(el('div','dgrid'));const grid=el('div','dgrid');grid.appendChild(c2);grid.appendChild(c3);grid.appendChild(c4);grid.appendChild(c5);
  d.appendChild(grid);
}

/* ---- knowledge core (C2) ---- */
function renderKnow(){
  const kp=$('knowPhases');kp.innerHTML='';
  PHASES.forEach((p,i)=>{
    kp.appendChild(el('div','kphase','<h4 style="color:'+p.c+'"><span class="kn">'+(i+1)+'</span>'+p.n+'</h4><p>'+p.d+'</p>'));});
  const kb=$('knowBack');kb.innerHTML='';
  kb.innerHTML='<b>Your lesson backbone → official headings:</b> '+BACKBONE.map(([t,ph])=>{
    const p=PHASES.find(x=>x.id===ph);return '<span class="badge" style="border-color:'+p.c+';color:'+p.c+'">'+t+' → '+p.n+'</span>';
  }).join(' ')+' — plus three headings your chapter folds into the flow: <b>Investigation</b> (forensics &amp; custody during identification), <b>Negotiation</b> and <b>Notification</b> (parallel tracks once extortion is confirmed).';
  const kl=$('knowLinks');kl.innerHTML='<span class="micro" style="align-self:center">Anchors:</span>'+
    DEB.links.map(l=>'<a href="'+l[1]+'" target="_blank" rel="noopener noreferrer">'+l[0]+'</a>').join('')+
    '<button class="btn ghost small" id="kcGloss">Open glossary</button>';
  $('kcGloss').onclick=()=>{lastOpener=document.activeElement;$('glossOverlay').classList.add('on');};
}
/* ---- tabs / overlays ---- */
function switchTab(k){
  [['ev','tabEv','bodyEv'],['led','tabLed','bodyLed'],['com','tabCom','bodyCom']].forEach(([x,tb,bb])=>{
    const on=x===k;$(tb).setAttribute('aria-selected',on?'true':'false');$(bb).classList.toggle('on',on);});
}
function closeOverlay(id){$(id).classList.remove('on');
  if(lastOpener&&document.body.contains(lastOpener)&&lastOpener.focus){try{lastOpener.focus();}catch(e){}}
  lastOpener=null;}