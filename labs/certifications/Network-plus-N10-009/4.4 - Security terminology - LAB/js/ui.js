'use strict';
/* CyberLab — N10-009 Lesson 4.4 Security Terminology (static port v4).
   Ported 1:1 from the original single-file lab. ALL data is synthetic. */

/* ============ js/ui.js — rendering helpers, components, screens ============ */
/* ---------- helpers ---------- */
function h(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
const norm = s => String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
function okAny(v, list){ const n=norm(v); return list.some(a=>norm(a)===n); }
const eq=(a,b)=>norm(a)===norm(b);
function hasAny(v, words){ const n=norm(v); return words.some(w=>n.includes(w)); }
function hasAll(v, words){ const n=norm(v); return words.every(w=>n.includes(w)); }
function sel(id, options, ph){
  return '<select id="'+id+'" class="ans" aria-label="'+h(ph||id)+'">' +
    '<option value="">'+h(ph||'Select an answer…')+'</option>' +
    options.map(o=>'<option value="'+h(o.v||o)+'">'+h(o.t||o)+'</option>').join('') + '</select>';
}
function tinput(id, ph, width){
  return '<input type="text" id="'+id+'" class="ans" autocomplete="off" spellcheck="false" ' +
    'placeholder="'+h(ph||'Type your answer…')+'" style="width:'+(width||'100%')+'" aria-label="'+h(ph||id)+'">';
}
function chk(id, label){
  return '<div class="chk"><input type="checkbox" id="'+id+'" class="ans"><label for="'+id+'">'+label+'</label></div>';
}


/* ================= MODAL ================= */
let lastFocus=null;
function openModal(html, opts){
  opts=opts||{};
  lastFocus=document.activeElement;
  const root=document.getElementById('modal-root');
  root.innerHTML='<div class="modal-bg" role="presentation"><div class="modal" role="dialog" aria-modal="true" aria-label="'+(opts.aria||'Dialog')+'">'+html+'</div></div>';
  const dlg=root.querySelector('.modal');
  const f=dlg.querySelector('input,select,button');
  if(f)f.focus();
}
function closeModal(){
  document.getElementById('modal-root').innerHTML='';
  if(lastFocus&&lastFocus.focus)lastFocus.focus();
  lastFocus=null;
}

/* ================= MODE SELECT SCREEN ================= */
function renderModeSelect(){
  document.getElementById('main').innerHTML =
  '<div class="hero"><div class="kicker">CyberLab · CompTIA Network+ N10-009 · Lesson 4.4</div>'+
  '<h1>Security Terminology — SOC Analyst First Shift</h1>'+
  '<p style="color:var(--muted);max-width:640px;margin:8px auto 0">You inherit the overnight queue at the Meridian Regional Health security operations desk. Work the tickets, hunt the logs, and speak the language of risk, vulnerability, exploit, threat and the CIA triad.</p></div>'+
  '<div class="notice">⚠ SYNTHETIC TRAINING DATA: every hostname, IP address, ticket, CVE, actor name and log entry in this lab is fictional and was generated for training. All exercises are from the defensive analyst\u2019s perspective.</div>'+
  '<div class="mode-grid">'+
    '<div class="mode-card"><span class="badge med">MEDIUM · GUIDED RESPONSE</span><h3>SOC First Shift</h3>'+
      '<ul><li>11 guided objectives</li><li>3-tier hints per objective, no penalty</li><li>Tolerant answer checking</li><li>Covers all 4 pillars (Understand · Identify &amp; Analyze · Detect · Mitigate)</li><li>170 points possible</li></ul>'+
      '<button class="btn primary" data-act="start" data-mode="medium">Start Medium mode</button></div>'+
    '<div class="mode-card"><span class="badge hard">HARD · INCIDENT SURGE</span><h3>Incident Surge</h3>'+
      '<ul><li>9 multi-step challenges</li><li>Max 1 hint per challenge (−5 pts)</li><li>Strict checking + red herrings</li><li>At least one challenge per pillar</li><li>205 points possible</li></ul>'+
      '<button class="btn primary" data-act="start" data-mode="hard">Start Hard mode</button></div>'+
  '</div>'+
  '<div class="card sub"><h3>How scoring works</h3><p style="color:var(--muted)">Each objective is verified by the CHECK RESULTS engine. Progress auto-saves in your browser (localStorage) — you can close the tab and resume later. Stars: 90%+ ★★★ · 75%+ ★★ · 50%+ ★.</p></div>';
}

/* ================= LAB RENDERING ================= */
function getDefs(){ return S.mode==='medium'?MED_OBJ:HARD_CH; }
function getDef(id){ return getDefs().find(d=>d.id===id); }
function totalPts(){ return getDefs().reduce((a,d)=>a+d.pts,0)+(S.mode==='medium'?QUIZ.medium.length*10:QUIZ.hard.length*10); }
function earnedPts(){
  let p=getDefs().reduce((a,d)=>a+(S.obj[d.id]&&S.obj[d.id].done?d.pts:0),0);
  if(S.quizDone)p+=(S.mode==='medium'?QUIZ.medium.length*10:QUIZ.hard.length*10);
  if(S.mode==='hard')p-=getDefs().reduce((a,d)=>a+((S.obj[d.id]&&S.obj[d.id].hint)?5:0),0);
  return p;
}
function doneCount(){ return getDefs().filter(d=>S.obj[d.id]&&S.obj[d.id].done).length; }
function allDone(){ return doneCount()===getDefs().length&&S.quizDone; }

function renderLab(){
  const defs=getDefs();
  const modeBadge = S.mode==='medium'?'<span class="badge med">MEDIUM · GUIDED</span>':'<span class="badge hard">HARD · SURGE</span>';
  document.getElementById('main').innerHTML =
  '<div class="card" style="border-top:4px solid var(--accent)">'+
    '<div class="obj-head"><div><h1 style="font-size:1.3rem">Security Terminology — SOC Analyst First Shift</h1>'+
    '<div style="color:var(--muted);font-size:.9rem">CompTIA Network+ N10-009 · Lesson 4.4 · '+modeBadge+' <span class="autosave">· progress auto-saved</span></div></div>'+
    '<div style="text-align:right"><div id="scorebox" style="font-weight:700;color:var(--warn)"></div>'+
    '<button class="btn danger" data-act="reset" style="margin-top:6px">Reset lab</button></div></div></div>'+
  scenarioHTML()+
  knowledgeHTML()+
  socDeskHTML()+
  '<div class="tracker" aria-label="Objective tracker"><div class="row"><b id="trk-title">Objective tracker</b>'+
    '<div class="bar" aria-hidden="true"><i id="trk-bar"></i></div><span id="trk-count" style="color:var(--muted);font-size:.9rem"></span></div>'+
    '<div class="titems" id="trk-items"></div></div>'+
  '<h2 style="margin-top:22px">Objectives</h2><div id="obj-list"></div>'+
  quizHTML()+
  debriefHTML();
  renderObjList();
  refreshTracker();
  window.scrollTo(0,0);
}
function scenarioHTML(){
  return '<section class="card" aria-labelledby="c1"><h2 id="c1">1 · Scenario Briefing</h2>'+
  '<p>It is 07:40. You are the incoming SOC analyst at <b>Meridian Regional Health</b>. The night shift left you: a ticket queue, a web-server log excerpt for <b>WEB-01</b>, the asset inventory, and an intel feed. The clinical staff starts at 08:00 — you need to triage what happened overnight and recommend what to fix, in the correct security terminology.</p>'+
  '<p style="color:var(--muted)">Work through the objectives below. Each one is checked automatically; answers draw on the SOC Desk evidence. In Hard mode, red herrings are waiting.</p></section>';
}
function knowledgeHTML(){
  const g=GLOSSARY.map(t=>'<div><dt>'+t[0]+'</dt><dd>'+t[1]+'</dd></div>').join('');
  return '<section class="card" aria-labelledby="c2"><h2 id="c2">2 · Knowledge Core</h2>'+
  '<h3>The CIA triad</h3><div class="cia">'+
    '<div><b>Confidentiality</b><p>Only authorized parties can see the data. Threats: theft, exposure, snooping. Controls: encryption, access control.</p></div>'+
    '<div><b>Integrity</b><p>Data stays accurate and untampered. Threats: silent modification, corruption. Controls: hashing, audit logging, least privilege.</p></div>'+
    '<div><b>Availability</b><p>Systems are reachable when needed. Threats: ransomware, outages, DDoS. Controls: backups, redundancy, resilience.</p></div></div>'+
  '<h3>How the terms connect</h3>'+
  '<div class="chain"><span class="node">Threat actor</span><span class="arr">—uses→</span><span class="node">Exploit</span><span class="arr">—targets→</span><span class="node">Vulnerability</span><span class="arr">⇒</span><span class="node">Risk (likelihood × impact)</span><span class="arr">↓ lowered by</span><span class="node">Mitigation</span></div>'+
  '<h3>Glossary (12 terms)</h3><dl class="gloss">'+g+'</dl></section>';
}
function socDeskHTML(){
  return '<section class="card" aria-labelledby="c3"><h2 id="c3">3 · SOC Desk (interactive evidence)</h2>'+
  '<div class="tabs" role="tablist" aria-label="SOC Desk evidence tabs">'+
    '<button class="tab" role="tab" aria-selected="true" id="tab-tickets" data-act="tab" data-tab="tickets">Ticket Queue</button>'+
    '<button class="tab" role="tab" aria-selected="false" id="tab-logs" data-act="tab" data-tab="logs">Log Viewer</button>'+
    '<button class="tab" role="tab" aria-selected="false" id="tab-assets" data-act="tab" data-tab="assets">Asset Inventory</button>'+
    '<button class="tab" role="tab" aria-selected="false" id="tab-intel" data-act="tab" data-tab="intel">Intel Feed</button>'+
    '<button class="tab" role="tab" aria-selected="false" id="tab-dns" data-act="tab" data-tab="dns">DNS Log</button>'+
  '</div><div id="tabpane"></div></section>';
}
function renderTab(name){
  document.querySelectorAll('.tab').forEach(t=>t.setAttribute('aria-selected', String(t.dataset.tab===name)));
  const pane=document.getElementById('tabpane');
  pane.setAttribute('role','tabpanel'); pane.setAttribute('aria-live','polite');
  if(name==='tickets'){ pane.innerHTML=TICKETS.map(t=>'<div class="ticket"><div class="tid">'+t.id+'</div><div class="tt">'+h(t.title)+'</div><div class="tb">'+h(t.body).replace(/&lt;code&gt;/g,'<code>').replace(/&lt;\/code&gt;/g,'</code>')+'</div></div>').join(''); }
  else if(name==='logs'){ pane.innerHTML='<div class="logwrap"><table><thead><tr><th>Line</th><th>Time</th><th>Source IP</th><th>Method</th><th>Path / payload</th><th>Status</th></tr></thead><tbody>'+
    LOGS.map(l=>'<tr><td>'+l[0]+'</td><td>'+l[1]+'</td><td>'+l[2]+'</td><td>'+h(l[3])+'</td><td>'+h(l[4])+'</td><td>'+h(l[5])+'</td></tr>').join('')+'</tbody></table></div>'+
    '<p class="autosave" style="margin-top:8px">WEB-01 log excerpt 02:14–02:27 · 11 lines · raw access log, unfiltered.</p>'; }
  else if(name==='assets'){ pane.innerHTML=ASSETS.map(a=>'<div class="asset"><span class="an">'+a.id+' · '+h(a.name)+'</span><div class="ad">'+h(a.desc)+' <b style="color:var(--accent)">Primary: '+a.cia+'</b></div></div>').join(''); }
  else if(name==='intel'){ pane.innerHTML=INTEL.map(i=>'<div class="ticket" style="border-left-color:var(--warn)"><div class="tid" style="color:var(--warn)">'+i.tag+'</div><div class="tb">'+h(i.text)+'</div></div>').join(''); }
  else if(name==='dns'){ pane.innerHTML='<div class="logwrap"><table><thead><tr><th>Time</th><th>Host</th><th>Queried name</th><th>Type</th><th>Bytes</th><th>Note</th></tr></thead><tbody>'+
    DNSLOG.map(l=>'<tr><td>'+l[0]+'</td><td>'+l[1]+'</td><td>'+h(l[2])+'</td><td>'+l[3]+'</td><td>'+l[4]+'</td><td>'+h(l[5])+'</td></tr>').join('')+'</tbody></table></div>'+
    '<p class="autosave" style="margin-top:8px">Resolving DNS server log · last hour · all internal clients.</p>'; }
}
/* ---------- objective cards ---------- */
function renderObjList(){
  const defs=getDefs();
  document.getElementById('obj-list').innerHTML=defs.map(d=>{
    const st=S.obj[d.id]||{done:false};
    return '<section class="card obj'+(st.done?' done':'')+'" id="card-'+d.id+'" data-oid="'+d.id+'" aria-label="Objective '+d.id+'">'+
    '<div class="obj-head"><div><span class="oid">'+d.id+'</span> <span class="'+PILLAR_CLASS[d.pillar]+'">'+PILLARS[d.pillar]+'</span>'+
      '<h3 style="display:inline;margin-left:8px">'+d.title+'</h3></div><span class="obj-pts">'+d.pts+' pts'+(S.mode==='hard'?' · hint −5':'')+'</span></div>'+
    '<p style="color:var(--muted)">'+d.brief+'</p>'+
    (st.done?'<div class="feedback ok">✔ Objective complete — '+d.pts+' points awarded.</div><div class="anslock" aria-hidden="true">'+d.render()+'</div>'
      :'<div id="body-'+d.id+'">'+d.render()+'</div>'+
       '<div id="hint-'+d.id+'"></div>'+
       '<div class="feedback" id="fb-'+d.id+'" role="status" aria-live="polite"></div>'+
       '<div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn primary" data-act="check" data-oid="'+d.id+'">Check results</button>'+
       '<button class="btn" data-act="hint" data-oid="'+d.id+'">'+(S.mode==='hard'?'Use hint (−5 pts)':'Get hint')+'</button></div>')+
    '</section>';
  }).join('');
  defs.forEach(d=>{ const st=S.obj[d.id]; if(st&&st.done) lockCard(d.id); if(st&&st.hint) showHint(d.id,true); });
  renderTab(document.querySelector('.tab[aria-selected="true"]').dataset.tab);
}
function lockCard(id){
  const card=document.getElementById('card-'+id);
  card.querySelectorAll('.ans').forEach(el=>{ el.disabled=true; el.style.opacity=.75; });
}
function snapshot(id){
  const card=document.getElementById('card-'+id); if(!card)return;
  const st=S.obj[id]||(S.obj[id]={done:false,tries:0,hint:0,inputs:{}});
  card.querySelectorAll('.ans').forEach(el=>{ st.inputs[el.id]=el.type==='checkbox'?el.checked:el.value; });
}
function restoreInputs(){
  const defs=getDefs();
  defs.forEach(d=>{ const st=S.obj[d.id]; if(!st||!st.inputs)return;
    Object.keys(st.inputs).forEach(k=>{ const el=document.getElementById(k); if(!el)return;
      if(el.type==='checkbox')el.checked=st.inputs[k]; else el.value=st.inputs[k]; });
  });
}
function showHint(id, silent){
  const d=getDef(id);
  let st=S.obj[id];
  if(st&&st.done)return; /* completed cards no longer display hints */
  if(!st)st=S.obj[id]={done:false,tries:0,hint:0,inputs:{}};
  if(S.mode==='hard'){
    if(!st.hint&&!silent){ st.hint=1; save(); refreshTracker(); }
    if(st.hint){ document.getElementById('hint-'+id).innerHTML='<div class="hintbox"><span class="ht">HINT (−5 pts)</span><br>'+h(d.hints[0])+'</div>';
      const b=document.querySelector('[data-act="hint"][data-oid="'+id+'"]'); if(b)b.disabled=true; }
  } else {
    if(st.hint===0&&!silent)st.hint=1;
    const tier=Math.min(st.hint,d.hints.length);
    document.getElementById('hint-'+id).innerHTML=d.hints.slice(0,tier).map((t,i)=>'<div class="hintbox"><span class="ht">Hint '+(i+1)+' of '+d.hints.length+'</span><br>'+h(t)+'</div>').join('');
    const b=document.querySelector('[data-act="hint"][data-oid="'+id+'"]');
    if(b){ if(st.hint>=d.hints.length){b.disabled=true;b.textContent='All hints shown';} else b.textContent='Get hint ('+(st.hint+1)+' of '+d.hints.length+')'; }
    save();
  }
}
function checkObjective(id){
  const d=getDef(id); const card=document.getElementById('card-'+id);
  const fb=document.getElementById('fb-'+id);
  const res=d.check(card);
  const st=S.obj[id]||(S.obj[id]={done:false,tries:0,hint:0,inputs:{}});
  st.tries++;
  if(res.ok){
    st.done=true; snapshot(id);
    fb.className='feedback ok'; fb.textContent='✔ Correct — objective complete. '+d.pts+' points awarded.';
    card.classList.add('done');
    card.querySelectorAll('.ans').forEach(el=>el.disabled=true);
    const btns=card.querySelectorAll('button'); btns.forEach(b=>{ if(b.dataset.act==='check'||b.dataset.act==='hint')b.style.display='none'; });
  } else {
    fb.className='feedback bad'; fb.textContent='✘ '+res.msg;
    card.classList.remove('failed-shake'); void card.offsetWidth; card.classList.add('failed-shake');
  }
  save(); refreshTracker();
  if(allDone()&&!S.completed)completeLab();
}
/* ---------- tracker ---------- */
function refreshTracker(){
  const defs=getDefs(); const done=doneCount();
  const scorebox=document.getElementById('scorebox');
  if(scorebox)scorebox.textContent='Score: '+earnedPts()+' / '+totalPts();
  const bar=document.getElementById('trk-bar');
  if(bar)bar.style.width=Math.round(done/defs.length*100)+'%';
  const cnt=document.getElementById('trk-count');
  if(cnt)cnt.textContent=done+' / '+defs.length+' objectives';
  const items=document.getElementById('trk-items');
  if(items)items.innerHTML=defs.map(d=>'<span class="tchip'+(S.obj[d.id]&&S.obj[d.id].done?' done':'')+'">'+(S.obj[d.id]&&S.obj[d.id].done?'✔ ':'')+d.id+'</span>').join('')+
    '<span class="tchip'+(S.quizDone?' done':'')+'">'+(S.quizDone?'✔ ':'')+'QUIZ</span>';
}

/* ---------- debrief (C6) ---------- */
function debriefHTML(){
  const locked=!S.completed;
  return '<section class="card" id="debrief" aria-labelledby="c6"><h2 id="c6">Debrief: Detection &amp; Mitigation Recommendations</h2>'+
  (locked?'<p style="color:var(--muted)">🔒 Complete every objective and the quiz to unlock the analyst debrief.</p>'
   :'<p>The shift report you would file after this overnight queue:</p>'+
    '<h3>Detection recommendations</h3><ul style="color:var(--muted)">'+
    '<li>Alert on SQL-syntax patterns (<code>UNION SELECT</code>, <code>OR 1=1</code>) and script-injection payloads in web request parameters.</li>'+
    '<li>Alert on long, high-entropy DNS subdomains repeating at fixed intervals — classic DNS exfiltration beaconing.</li>'+
    '<li>Baseline authorized scanning: whitelist scanner source IPs and schedules so triage does not chase red herrings.</li>'+
    '<li>Correlate IDS alerts with asset inventories (installed product + version) before escalating.</li></ul>'+
    '<h3>Mitigation recommendations</h3><ul style="color:var(--muted)">'+
    '<li>Enforce a patch SLA for internet-facing frameworks (WEB-01 web framework must move to ≥ 2.5.30).</li>'+
    '<li>Roll out MFA and unique admin accounts; remove shared credentials.</li>'+
    '<li>Encrypt patient data exports at rest; keep offline, restore-tested backups for ransomware recovery.</li>'+
    '<li>Apply least privilege plus tamper-evident audit logging to sensitive ledgers to counter insider threats.</li>'+
    '<li>When a patch is unavailable, deploy compensating controls: VLAN isolation, allow-listing, enhanced logging.</li></ul></section>');
}
/* ---------- completion (C7) ---------- */
function completeLab(){
  S.completed=true; save();
  const total=totalPts(); const got=earnedPts(); const pct=Math.round(got/total*100);
  const stars=pct>=90?3:pct>=75?2:pct>=50?1:0;
  const defs=getDefs();
  const perPillar=Object.keys(PILLARS).map(p=>{
    const ds=defs.filter(d=>d.pillar===p);
    const max=ds.reduce((a,d)=>a+d.pts,0);
    const got2=ds.reduce((a,d)=>a+(S.obj[d.id]&&S.obj[d.id].done?d.pts:0),0);
    return '<div class="pillbar"><span class="pb">'+PILLARS[p]+'</span><div class="bar"><i style="width:'+Math.round(got2/max*100)+'%"></i></div><span>'+got2+'/'+max+'</span></div>';
  }).join('');
  openModal('<h2 style="color:var(--accent)">Shift complete!</h2>'+
    '<div class="stars" aria-label="'+stars+' of 3 stars">'+'★'.repeat(stars)+'<span style="color:#3a4a68">'+'★'.repeat(3-stars)+'</span></div>'+
    '<p style="font-size:1.1rem"><b>'+got+' / '+total+' points ('+pct+'%)</b></p>'+
    '<div style="margin:14px 0">'+perPillar+'</div>'+
    '<p style="color:var(--muted)">You covered all four mastery pillars and every Lesson 4.4 exam point: risk, vulnerability, exploit, threat and the CIA triad. The debrief below is now unlocked.</p>'+
    '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px"><button class="btn primary" data-act="closemodal">Review debrief</button>'+
    '<button class="btn" data-act="replay">Replay this mode</button><button class="btn" data-act="switchmode">Switch mode</button></div>',
    {aria:'Lab complete'});
  const db=document.getElementById('debrief');
  if(db){ db.outerHTML=debriefHTML(); }
  if(stars>=2){ try{ document.getElementById('debrief').scrollIntoView({behavior:'smooth'}); }catch(e){} }
}
/* ---------- reset / resume ---------- */
function askReset(){
  openModal('<h2>Reset the lab?</h2><p style="color:var(--muted)">This deletes your saved progress for both modes and starts over. This cannot be undone.</p>'+
    '<div style="display:flex;gap:10px;margin-top:14px"><button class="btn danger" data-act="doreset">Yes, reset everything</button>'+
    '<button class="btn" data-act="closemodal">Cancel</button></div>',{aria:'Confirm reset'});
}
function askResume(){
  const m=S.mode;
  openModal('<h2>Welcome back, analyst.</h2><p style="color:var(--muted)">Saved progress found for <b>'+(m==='medium'?'MEDIUM':'HARD')+' mode</b> ('+doneCount()+'/'+getDefs().length+' objectives done, score '+earnedPts()+'/'+totalPts()+').</p>'+
    '<div style="display:flex;gap:10px;margin-top:14px"><button class="btn primary" data-act="resume">Resume where I left off</button>'+
    '<button class="btn danger" data-act="doreset">Start fresh</button></div>',{aria:'Resume lab'});
}
