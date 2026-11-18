'use strict';
/* =====================================================================
   NIGHT-SHIFT DEPOT — rendering + UI helpers
   Everything that turns state into DOM: small template helpers, the
   LCS diff, and the rack / bench tab renderers. Renderers read state
   directly and write innerHTML; app.js decides when to re-render.
   ===================================================================== */

/* ---------- tiny DOM + a11y helpers ---------- */
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const announce = m => { $('sr-announcer').textContent = m; };

/* Overlay open/close with focus capture and return (quiz, report, reset). */
let lastFocus=null;
function openOv(id){ lastFocus=document.activeElement; $(id).classList.remove('hidden');
  const f=$(id).querySelector('button'); if(f)f.focus(); }
function closeOv(id){ $(id).classList.add('hidden'); if(lastFocus&&lastFocus.focus)lastFocus.focus(); }

/* Re-renders replace the DOM node under the keyboard user; remember where
   they were via a data-attribute selector and put focus back afterwards. */
function focusKey(el){ if(!el||!el.dataset||!el.dataset.act)return null;
  const parts=['[data-act="'+el.dataset.act+'"]'];
  ['k','t','r','v','id','q','o','file','dev','oid','key','i','d'].forEach(a=>{
    if(el.dataset[a]!==undefined)parts.push('[data-'+a+'="'+el.dataset[a]+'"]'); });
  if(el.tagName==='INPUT'&&el.type==='radio')parts.push('[value="'+el.value+'"]');
  return parts.join(''); }
function restoreFocus(key){ if(!key)return; const el=document.querySelector(key);
  if(el&&el.focus&&!el.disabled){ try{el.focus();}catch(e){} } }

/* ---------- diff (LCS) ---------- */
function diffLines(a,b){ const n=a.length,m=b.length;
  const dp=Array.from({length:n+1},()=>new Array(m+1).fill(0));
  for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--)
    dp[i][j]=a[i]===b[j]?dp[i+1][j+1]+1:Math.max(dp[i+1][j],dp[i][j+1]);
  const out=[];let i=0,j=0;
  while(i<n&&j<m){ if(a[i]===b[j]){out.push({t:'=',line:a[i]});i++;j++;}
    else if(dp[i+1][j]>=dp[i][j+1]){out.push({t:'-',line:a[i]});i++;}
    else{out.push({t:'+',line:b[j]});j++;} }
  while(i<n)out.push({t:'-',line:a[i++]}); while(j<m)out.push({t:'+',line:b[j++]});
  return out;
}
function diffHtml(recs){
  return `<pre class="cfgpre">${recs.map(r=>{
    if(r.t==='=')return esc(r.line);
    const cls=r.t==='+'?'c-add':'c-del'; const pfx=r.t==='+'?'+ ':'− ';
    return `<span class="${cls}">${esc(pfx+r.line)}</span>`;}).join('\n')}</pre>`;
}

/* ---------- shared template fragments ---------- */
function fileOpts(dev, cur){ return Object.values(DEVICES[dev].files)
  .map(f=>`<option value="${f.id}" ${f.id===cur?'selected':''}>${esc(f.name)}</option>`).join(''); }

function ledgerCard(f, compact){
  const badges=(f.badges||[]).map(b=>`<span class="stamp ${b==='GOLDEN'?'gold':b==='APPROVED'?'appr':b==='STALE'?'stale':'warnS'}">${b}</span>`).join(' ');
  return `<button class="ledger ${S.env.openFile===f.id?'sel':''}" data-act="openfile" data-file="${f.id}" aria-pressed="${S.env.openFile===f.id}">
    ${badges}<span class="lt">${esc(f.name)}</span>
    <span class="lm">${esc(f.meta.date)} · ${esc(f.meta.store)}${compact?'':'<br>'+esc(f.meta.by)}</span></button>`;
}

/* ---------- rack (left panel) ---------- */
function renderRack(){
  $('rack-units').innerHTML = Object.entries(DEVICES).map(([dev,d])=>{
    const open = S.env.selDev===dev;
    return `<div class="dev-unit">
      <button class="dev-head" data-act="seldev" data-dev="${dev}" aria-expanded="${open}">
        <span class="dot" style="background:${open?'var(--green)':'#4d5b80'}"></span>
        <span><span class="nm">${dev}</span><span class="rl">${esc(d.role)}</span></span></button>
      ${open?`<div class="dev-files">${d.files.map(f=>ledgerCard(f,true)).join('')}</div>`:''}
    </div>`;}).join('');
}

/* ---------- bench tab: file viewer ---------- */
function renderViewer(){
  const e=S.env; const allFiles=Object.values(DEVICES).flatMap(d=>d.files);
  const f=allFiles.find(x=>x.id===e.openFile);
  if(!f) return `<p class="hintline" style="margin-bottom:12px">Select a configuration file card on the rack to open it here.
    Every card carries its provenance: who saved it, when, where it lives, and its checksum.</p>
    <div class="callout brief"><p>Pick a card on the <b>device rack</b> (left) to inspect it.</p></div>`;
  const d=DEVICES[f.device];
  const hasRS = d.files.some(x=>x.name.startsWith('running-config')) && d.files.some(x=>x.name.startsWith('startup-config'));
  const run=d.files.find(x=>x.name.startsWith('running-config')), su=d.files.find(x=>x.name.startsWith('startup-config'));
  let rsHtml='';
  if(hasRS){
    const did=f.device; const show=e.rsCompare[did];
    rsHtml=`<div style="margin-top:14px">
      <button class="gbtn" data-act="rscompare" data-dev="${did}">Compare running ↔ startup</button>
      <span class="attempt-note" style="margin-left:8px">unsaved-change check</span>
      ${show?`<div style="margin-top:10px">${diffHtml(diffLines(run.lines,su.lines))}</div>`:''}</div>`;
  }
  return `<div class="bench-h"><h3>${esc(f.name)}</h3><span class="plate dim">${esc(f.device)}</span></div>
    <div class="meta-grid">
      <div class="meta-cell"><b>Saved</b><span>${esc(f.meta.saved)}</span></div>
      <div class="meta-cell"><b>Stored</b><span>${esc(f.meta.store)}</span></div>
      <div class="meta-cell"><b>Saved by</b><span>${esc(f.meta.by)}</span></div>
      <div class="meta-cell"><b>Date</b><span>${esc(f.meta.date)}</span></div>
      <div class="meta-cell"><b>Checksum</b><span>${esc(f.meta.checksum)}</span></div>
    </div>
    ${f.note?`<p class="hintline" style="margin:4px 0 10px">⚠ ${esc(f.note)}</p>`:''}
    <pre class="cfgpre">${f.lines.map(l=>esc(l)).join('\n')}</pre>${rsHtml}`;
}

/* ---------- bench tab: comparator ---------- */
function renderComparator(){
  const e=S.env, c=e.comp;
  const dev=c.dev, files=DEVICES[dev].files;
  const A=files.find(f=>f.id===c.a)||files[0], B=files.find(f=>f.id===c.b)||files[1];
  const key=dev+'|'+A.id+'|'+B.id;
  let out='';
  if(e.compRuns[key]){
    const recs=diffLines(A.lines,B.lines);
    const adds=recs.filter(r=>r.t==='+').length, dels=recs.filter(r=>r.t==='-').length;
    const known=(dev==='KV-EDGE-RTR-01'&&A.id==='edge-gold'&&B.id==='edge-run');
    out=`<div style="margin-top:14px">
      <p style="font-size:13px;color:var(--dim);margin-bottom:8px">Comparing <b style="color:var(--paper)">${esc(A.name)}</b>
      (left/reference) against <b style="color:var(--paper)">${esc(B.name)}</b> (right/candidate):
      <b style="color:#8fd6b0">${adds} line(s) added</b>, <b style="color:#f0a49c">${dels} line(s) removed</b>.
      ${known?'These are the six change records your duty board asks about (r1–r6).':''}</p>
      ${diffHtml(recs)}
      ${known?`<div style="margin-top:12px">${CHANGE_RECORDS.map(r=>`
        <div class="alert-row" style="grid-template-columns:44px 1fr">
          <span class="plate ${r.op==='+'?'ok':r.op==='−'?'bad':'dim'}" style="text-align:center">${r.op==='~'?'chg':r.op}</span>
          <span class="am" style="font-family:var(--mono);font-size:12.5px"><b style="color:var(--faint)">${r.id}</b> ${esc(r.line)}
          ${r.ctx?`<br><span style="color:var(--faint);font-size:11px">${esc(r.ctx)}</span>`:''}</span></div>`).join('')}</div>`:''}
    </div>`;
  }
  return `<div class="bench-h"><h3>Comparator</h3>
      <span class="hintline">Reference file vs candidate file — the diff is the ground truth.</span></div>
    <div class="abar">
      <div class="field"><label>Device</label>
        <select data-act="compdev">${Object.keys(DEVICES).map(d=>`<option ${d===dev?'selected':''}>${d}</option>`).join('')}</select></div>
      <div class="field"><label>Reference (A)</label><select data-act="compa">${fileOpts(dev,c.a)}</select></div>
      <div class="field"><label>Candidate (B)</label><select data-act="compb">${fileOpts(dev,c.b)}</select></div>
      <button class="abtn" data-act="comprun">Run comparison</button>
    </div>${out}`;
}

/* ---------- bench tab: tickets (+ hard-mode change board) ---------- */
function renderTickets(){
  const hard=S.mode==='hard';
  let h=`<div class="bench-h"><h3>Change tickets</h3><span class="hintline">If a config line is not traceable to a ticket, it is unauthorized by definition.</span></div>`;
  const list = hard?['chg2291','chg2288']:['chg2291'];
  h+=list.map(k=>{const t=TICKETS[k];return `<div class="stub"><h4>${t.id} — ${esc(t.title)}</h4>
    <div class="when">${esc(t.when)}</div><p>${esc(t.body)}</p>
    ${t.lines.length?`<div class="lines">${t.lines.map(esc).join('\n')}</div>`:''}</div>`;}).join('');
  if(hard){
    const h7locked=objState('H7').done;
    h+=`<h4 style="font-family:var(--serif);font-weight:400;color:var(--paper);font-size:17px;margin:16px 0 4px">Change board — three requests await your call</h4>
    <p class="hintline" style="margin-bottom:10px">Decide each one here; the duty board validates your decisions and reasons.${h7locked?' <b style="color:#8fd6b0">The board has adjourned — H7 is signed off and the decisions are locked.</b>':''}</p>`;
    h+=TICKETS.h7.tickets.map(t=>`<div class="stub"><h4>${t.id} — ${esc(t.title)}</h4>
      <div class="when">${esc(t.when)}</div><p>${esc(t.body)}</p>
      <div class="abar" style="margin-top:10px">
        ${t.opts.map((o,i)=>`<button class="stampbtn ${S.env.h7.d[t.id]===o?'picked':''}" data-act="h7d" data-t="${t.id}" data-v="${esc(o)}" style="flex:0 1 auto" ${h7locked?'disabled':''}>${esc(o)}</button>`).join('')}
      </div>
      ${S.env.h7.d[t.id]?`<div class="abar" style="margin-top:8px">
        <div class="field" style="flex:1"><label>Your stated reason (pick the justification that matches your decision)</label>
        <select data-act="h7r" data-t="${t.id}" ${h7locked?'disabled':''}>
          <option value="">— pick the justification —</option>
          ${H7ORD[t.id].map(v=>{const j=H7J.find(x=>x.v===v);
            return `<option value="${j.v}" ${S.env.h7.r[t.id]===j.v?'selected':''}>${esc(j.t)}</option>`;}).join('')}
        </select></div></div>`:''}
      </div>`).join('');
  }
  return h;
}

/* ---------- bench tab: monitor ---------- */
function renderMonitor(){
  const m=S.env.monitor, hard=S.mode==='hard';
  let h=`<div class="bench-h"><h3>Configuration monitor</h3>
    <span class="hintline">Watch production for drift — and watch the jobs that protect recovery.</span></div>
  <div class="abar">
    <div class="field"><label>Watch device</label>
      <select data-act="mondev"><option value="">— select —</option>${Object.keys(DEVICES).map(d=>`<option ${m.dev===d?'selected':''}>${d}</option>`).join('')}</select></div>
    <div class="field"><label>Compare against</label>
      <select data-act="monref"><option value="">— select —</option>
        <option value="baseline" ${m.ref==='baseline'?'selected':''}>Signed GOLDEN baseline</option>
        <option value="backup" ${m.ref==='backup'?'selected':''}>Most recent backup</option>
        <option value="startup" ${m.ref==='startup'?'selected':''}>Device startup config</option></select></div>
    <div class="field"><label>Check frequency</label>
      <select data-act="monfreq"><option value="">— select —</option>
        <option ${m.freq==='hourly'?'selected':''}>hourly</option><option ${m.freq==='daily'?'selected':''}>daily</option>
        <option ${m.freq==='weekly'?'selected':''}>weekly</option></select></div>
    <div class="field"><label>On drift detected</label>
      <select data-act="monact"><option value="">— select —</option>
        <option value="log" ${m.act==='log'?'selected':''}>Write to log only</option>
        <option value="alert" ${m.act==='alert'?'selected':''}>Alert duty phone</option>
        <option value="ticket" ${m.act==='ticket'?'selected':''}>Alert + open incident ticket</option></select></div>
    <label class="chk" style="min-height:42px;align-items:center"><input type="checkbox" data-act="monwatch" ${m.watch?'checked':''}>
      <span style="font-family:system-ui;font-size:12.5px">Also alert when a <b>backup job fails</b></span></label>
  </div>
  <p class="hintline" id="mon-state">Monitor state: ${m.dev?`${esc(m.dev)} production vs ${esc(m.ref||'—')}, ${esc(m.freq||'—')}, action=${esc(m.act||'—')}${m.watch?', job-failure watch ON':', job-failure watch OFF'}`:'not configured'}</p>
  <h4 style="font-family:var(--serif);font-weight:400;color:var(--paper);font-size:17px;margin:16px 0 8px">Alert feed</h4>`;
  h+=ALERTS.map(a=>`<div class="alert-row ${a.cls}"><time>${a.t}</time><span class="am">${a.m}</span></div>`).join('');
  if(hard){ h+=`<h4 style="font-family:var(--serif);font-weight:400;color:var(--paper);font-size:17px;margin:16px 0 8px">Shift chat</h4>`+
    CHATLOG.map(c=>`<div class="alert-row cold"><time>${c.t}</time><span class="am"><b style="color:var(--amber)">${esc(c.u)}:</b> ${esc(c.m)}</span></div>`).join(''); }
  return h;
}

/* ---------- bench tab: storage & jobs ---------- */
function renderStorage(){
  const e=S.env, hard=S.mode==='hard';
  let h=`<div class="bench-h"><h3>Storage &amp; backup jobs</h3>
    <span class="hintline">Where configs sleep, and whether they can wake up again.</span></div>
  <div class="stor-grid">${STORAGE.map(s=>`
    <div class="stor"><h5>${esc(s.name)}</h5><p>${esc(s.desc)}</p>
      <button class="stampbtn ${e.storage===s.id?'picked':''} pick" data-act="storage" data-v="${s.id}">${e.storage===s.id?'✓ Selected':'Select as backup home'}</button>
    </div>`).join('')}</div>
  <h4 style="font-family:var(--serif);font-weight:400;color:var(--paper);font-size:17px;margin:18px 0 8px">Backup job report — all devices</h4>
  <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px">
    <thead><tr style="color:var(--faint);text-transform:uppercase;font-size:10.5px;letter-spacing:.1em;text-align:left">
      <th style="padding:7px 9px;border-bottom:1px solid var(--line)">Device</th><th style="padding:7px 9px;border-bottom:1px solid var(--line)">Schedule</th>
      <th style="padding:7px 9px;border-bottom:1px solid var(--line)">Last success</th><th style="padding:7px 9px;border-bottom:1px solid var(--line)">Failure alerting</th></tr></thead>
    <tbody>${JOBS.map(j=>`<tr style="border-bottom:1px solid var(--line)"><td style="padding:8px 9px;font-family:var(--mono)">${j.device}</td>
      <td style="padding:8px 9px">${j.sched}</td><td style="padding:8px 9px">${j.last}</td><td style="padding:8px 9px">${j.alert}</td></tr>`).join('')}</tbody>
  </table></div>`;
  const j=e.fwJob;
  h+=`<h4 style="font-family:var(--serif);font-weight:400;color:var(--paper);font-size:17px;margin:18px 0 4px">Repair the fw-nightly job — KV-FW-01</h4>
  <p class="hintline" style="margin-bottom:10px">Last success 87 days ago, failure alerting off. Rebuild the job so a restore is actually possible.</p>
  <div class="abar">
    <div class="field"><label>Run schedule</label><select data-act="fwsched"><option value="">— select —</option>
      ${['hourly','daily','weekly'].map(o=>`<option ${j.sched===o?'selected':''}>${o}</option>`).join('')}</select></div>
    <div class="field"><label>Destination</label><select data-act="fwdest"><option value="">— select —</option>
      <option value="archive" ${j.dest==='archive'?'selected':''}>cfg-archive (encrypted, offsite)</option>
      <option value="flash" ${j.dest==='flash'?'selected':''}>Device local flash</option>
      <option value="tftp" ${j.dest==='tftp'?'selected':''}>dmz-old TFTP share</option>
      <option value="cloud" ${j.dest==='cloud'?'selected':''}>Vendor shared cloud folder</option></select></div>
    <div class="field"><label>Retention</label><select data-act="fwret"><option value="">— select —</option>
      <option value="3" ${j.ret==='3'?'selected':''}>Keep 3 versions</option>
      <option value="30" ${j.ret==='30'?'selected':''}>Keep 30 versions</option>
      <option value="90" ${j.ret==='90'?'selected':''}>Keep 90 versions</option></select></div>
    <div class="field"><label>Restore test</label><select data-act="fwtest"><option value="">— select —</option>
      <option value="never" ${j.test==='never'?'selected':''}>Never</option>
      <option value="annual" ${j.test==='annual'?'selected':''}>Annually</option>
      <option value="monthly" ${j.test==='monthly'?'selected':''}>Monthly</option></select></div>
    <label class="chk" style="min-height:42px;align-items:center"><input type="checkbox" data-act="fwalert" ${j.alert?'checked':''}>
      <span style="font-family:system-ui;font-size:12.5px">Alert on job <b>failure</b></span></label>
  </div>`;
  if(hard){
    const p=e.polJob;
    h+=`<h4 style="font-family:var(--serif);font-weight:400;color:var(--paper);font-size:17px;margin:18px 0 4px">Archive policy board — design the standard (all devices)</h4>
    <p class="hintline" style="margin-bottom:10px">Requirement on the table: config recovery point objective (RPO) ≤ 24 h, recovery time objective (RTO) ≤ 4 h. Set the house policy.</p>
    <div class="abar">
      <div class="field"><label>Backup frequency</label><select data-act="polfreq"><option value="">— select —</option>
        ${['hourly','daily','weekly'].map(o=>`<option ${p.freq===o?'selected':''}>${o}</option>`).join('')}</select></div>
      <div class="field"><label>On job failure</label><select data-act="polalert"><option value="">— select —</option>
        <option value="on" ${p.alert==='on'?'selected':''}>Alert duty phone immediately</option>
        <option value="review" ${p.alert==='review'?'selected':''}>Check in the monthly review</option>
        <option value="off" ${p.alert==='off'?'selected':''}>Nobody is paged</option></select></div>
      <div class="field"><label>Retry behavior</label><select data-act="polretry"><option value="">— select —</option>
        <option value="auto" ${p.retry==='auto'?'selected':''}>Auto-retry, then page on-call</option>
        <option value="none" ${p.retry==='none'?'selected':''}>Wait for tomorrow’s run</option></select></div>
      <div class="field"><label>Storage standard</label><select data-act="polstorage"><option value="">— select —</option>
        <option value="archive" ${p.storage==='archive'?'selected':''}>Encrypted offsite archive, versioned</option>
        <option value="local" ${p.storage==='local'?'selected':''}>On each device only</option>
        <option value="tftp" ${p.storage==='tftp'?'selected':''}>Plaintext TFTP share</option></select></div>
      <div class="field"><label>Restore-test cadence</label><select data-act="poltest"><option value="">— select —</option>
        <option value="monthly" ${p.test==='monthly'?'selected':''}>Monthly</option>
        <option value="annual" ${p.test==='annual'?'selected':''}>Annually</option>
        <option value="never" ${p.test==='never'?'selected':''}>Never</option></select></div>
    </div>`;
  }
  return h;
}

/* ---------- bench tab: briefing ---------- */
function renderBrief(){
  const hard=S.mode==='hard';
  return `<div class="brief">
    <div class="bench-h"><h3>Shift briefing</h3><span class="plate dim">fictional scenario · synthetic data</span></div>
    <p><b>Kestrel Valley Transit Authority</b> runs fare gates, payment links and dispatcher radios off a small depot network.
    Last Friday night the change board approved <b>CHG-2291</b>: a contractor would add a DHCP relay and a payment-server rule
    on the edge router during the 23:00–01:00 maintenance window. The window closed. The ticket was signed off.</p>
    <p>${hard?'It is now <b>Monday 07:12</b>. Fare-gate payments are failing intermittently and the syslog collector has gone quiet for the edge router. You are alone on the desk until 09:00 — triage the evidence, find what does not belong, and decide what happens next. Two of the alarms in the feed are red herrings; so is one ticket.':'You are the Sunday-to-Thursday night network operator. The shift lead has posted your duty list on the right. Work through it at the bench: open files, run the comparator, read tickets, configure monitors, and make the depot’s config management real.'}</p>
    <div class="callout"><b>Why this matters for Network+ (N10-009):</b> the exam expects you to explain configuration management —
    <b>production</b>, <b>backup</b> and <b>baseline/golden</b> configurations — and the change-management process that keeps them
    honest (Domain 3.0). The same skills decide whether a Monday like this one costs hours or weeks. Defensive anchors used in this
    lab: MITRE ATT&amp;CK <a href="https://attack.mitre.org/mitigations/M1053/" target="_blank" rel="noopener">M1053 Data Backup</a> and
    <a href="https://attack.mitre.org/mitigations/M1026/" target="_blank" rel="noopener">M1026 Privileged Account Management</a>.</div>
    <p><b>The desk:</b> the <b>device rack</b> (left) holds every config file as a ledger card with provenance metadata.
    The <b>bench</b> (center) is where you work — file viewer, comparator, tickets, monitor, storage &amp; jobs.
    The <b>duty board</b> (right) is your objective list: each item is checked and signed off as you complete it,
    with educational feedback every time.</p>
    <p style="color:var(--faint);font-size:12.5px">All hostnames, addresses, credentials and events are invented for training.
    Any resemblance to a real network is coincidental. Real-world framing example (verified): Cisco Talos, “Static Tundra”, 2025 —
    an espionage actor mass-stealing Cisco device configurations, adding privileged local accounts, enabling telnet and altering
    logging to evade detection.</p>
  </div>`;
}

/* ---------- bench dispatcher ---------- */
function renderBench(){
  const t=S.curTab||'viewer';
  $('bench-body').innerHTML = t==='brief'?renderBrief(): t==='viewer'?renderViewer():
    t==='comparator'?renderComparator(): t==='tickets'?renderTickets(): t==='monitor'?renderMonitor():renderStorage();
}

function renderAll(){ renderRack(); renderBench(); renderDuty();
  document.querySelectorAll('.btab').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab===S.curTab))); }
