/* ================================================================
   js/ui.js
   Render engine: DOM helpers, topbar, dispatch queue, workbench gates,
   evidence locker, objectives drawer, knowledge core, debrief, renderAll().
   ================================================================ */
/* ================================================================
   RENDER ENGINE
   ================================================================ */
const $=(s)=>document.querySelector(s);
const esc=(t)=>String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
function toast(html){const t=$("#toast");t.innerHTML=html;t.classList.add("show");clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove("show"),4200);}
function announce(msg){const r=$("#srt");r.textContent="";setTimeout(()=>{r.textContent=msg;},60);}

/* ---- topbar ---- */
function renderTop(){if(!mode())return;
 $("#modeChip").textContent=mode()==="medium"?"MEDIUM · GUIDED":"HARD · NIGHT SHIFT";
 $("#objCount").textContent=objDoneCount()+"/"+objs().length;
 const doneQ=Object.keys(S.quiz.checked).length?S.quiz.checked:{};
 const qc=QUIZ[mode()].filter((q,i)=>doneQ[i]===true).length;
 $("#quizScore").textContent=Object.keys(doneQ).length?qc+"/"+QUIZ[mode()].length:"–";
 $("#quizScore2").textContent=$("#quizScore").textContent;
 $("#progBar").style.width=(objs().length?100*objDoneCount()/objs().length:0)+"%";
 const tip=$("#nextTip");
 if(mode()==="medium"&&S.floorOpened&&!allObjDone()&&!S.tipClosed){
   const nx=objs().find(o=>!OBJ(o.id).done);
   $("#nextTipBody").innerHTML="<b>"+nx.id+"</b> — "+esc(nx.loc);
   tip.classList.add("show");
 }else tip.classList.remove("show");
}

/* ---- queue ---- */
function stageLabel(id){const st=stageOf(id);
 if(id==="CHG-0424"&&isRejected(id))return "REJECTED";
 if(id==="SR-0917"&&F(id).type==="service request")return "ROUTED → SERVICE DESK";
 return STAGES[Math.min(st,7)].toUpperCase();}
function renderQueue(){
 const list=$("#queueList");
 list.innerHTML=QUEUE_ORDER.map(id=>{
  const t=TICKETS[id],e=E(id);
  const cls=id==="SR-0917"?"sr":(id==="DRIFT-0066"||id==="CHG-0423")?"pinned":"";
  const riskCls=t.riskAssess==="critical"?"crit":t.riskAssess==="high"?"high":"low";
  const chips=[];
  chips.push(`<span class="stagebadge">${stageLabel(id)}</span>`);
  if(id!=="DRIFT-0066")chips.push(F(id).type?`<span class="tag teal">${esc(F(id).type)}</span>`:`<span class="tag amber">type?</span>`);
  if(id!=="SR-0917"&&id!=="DRIFT-0066")chips.push(`<span class="tag" title="assessed risk"><span class="riskdot ${riskCls}"></span> ${esc(t.riskAssess)}</span>`);
  return `<button class="qcard ${cls}${S.active===id?" active":""}" data-act="selectTicket" data-tid="${id}" aria-label="Open ${id}: ${esc(t.title)}">
    <span class="rid">${id==="DRIFT-0066"?"⚠ ":""}${id}</span>
    <span class="ttl">${esc(t.title)}</span>
    <span class="chips">${chips.join("")}</span></button>`;
 }).join("");
 $("#qcount").textContent=QUEUE_ORDER.length+" items";
}

/* ---- workbench ---- */
function renderRail(){
 const id=S.active;if(!id)return;const st=stageOf(id);
 const rejected=isRejected(id);
 $("#rail").innerHTML=STAGES.map((s,i)=>{
  let cls=i<st?"done":(i===st&&!rejected?"cur":"");
  if(rejected&&i<=1)cls="done";
  return `<div class="railnode ${cls}" role="listitem"><span class="lbl">${s}</span></div>`;
 }).join("")+(rejected?`<div class="railnode cur" role="listitem"><span class="lbl">Rejected</span></div>`:"");
}
function selHTML(tid,key,opts,cur,aria){
 return `<select data-bind="${tid}|${key}" aria-label="${aria||key}" style="max-width:100%">
  <option value="">— select —</option>
  ${opts.map(o=>`<option value="${o[0]}" ${cur===o[0]?"selected":""}>${esc(o[1])}</option>`).join("")}
 </select>`;
}
function chipsHTML(tid,key,opts,cur,good){
 return `<div class="chips">${opts.map(o=>`<button class="chip ${good?"good":""}" data-act="chip" data-tid="${tid}" data-key="${key}" data-val="${o[0]}" aria-pressed="${Array.isArray(cur)&&cur.includes(o[0])}">${esc(o[1])}</button>`).join("")}</div>`;
}
function radioHTML(tid,key,items,cur){
 return `<div class="radiocards">${items.map(o=>`<button class="radiocard" data-act="choice" data-tid="${tid}" data-key="${key}" data-val="${o[0]}" aria-pressed="${cur===o[0]}"><span class="rc-k">${o[0]}</span><span><b>${esc(o[1])}</b>${o[2]?`<br><span class="small">${esc(o[2])}</span>`:""}</span></button>`).join("")}</div>`;
}
function auditHTML(tid){
 const rows=E(tid).log||[];
 if(!rows.length)return "";
 return `<div class="audittrail" aria-label="Request audit trail">${rows.map(r=>`<span>${esc(r)}</span>`).join("")}<span class="small">audit trail — who/what/when on request ${tid}</span></div>`;
}
function planFieldsHTML(tid){
 const t=TICKETS[tid],f=F(tid),e=E(tid);
 let h="";
 if(tid==="CHG-0418"){
  if(mode()==="hard"){
   h+=`<div class="fieldrow"><span class="flabel">Rollback plan — build the sequence (click steps in order)</span>
    <div class="seq">${t.seqSteps.map((s,i)=>{const ord=e.seq.indexOf(i);
      return `<button class="seqitem${ord>=0?"":""}" data-act="seqStep" data-tid="${tid}" data-idx="${i}" aria-label="Rollback step ${i+1}: ${esc(s)}"><span class="ord">${ord>=0?(ord+1):"·"}</span><span>${esc(s)}</span></button>`;}).join("")}
    </div><p class="small" style="margin:6px 0 0">Clicked steps get numbered in your chosen order. Six steps, no swaps.</p></div>`;
  }else{
   h+=`<div class="fieldrow"><span class="flabel">Rollback / backout plan ${gi("rollback / backout plan")}</span>${selHTML(tid,"rollback",t.rollbackOpts,f.rollback,"Rollback plan")}</div>`;
  }
 }
 if(tid==="CHG-0419")h+=`<div class="fieldrow"><span class="flabel">Configuration restore source</span>${radioHTML(tid,"cfgsource",t.cfgOpts,f.cfgsource)}</div>`;
 if(tid==="CHG-0420"){
  h+=`<div class="fieldrow"><span class="flabel">Testing sequence</span><div class="checkrow">
   <button class="btn sm" data-act="sandbox" data-tid="${tid}" ${e.sandbox>=1?"disabled":""}>1 · Run sandbox lease regression</button>
   <button class="btn sm" data-act="exec" data-tid="${tid}" ${e.sandbox>=1?"":"disabled title='Locked: sandbox regression must run first'"}>2 · Deploy to production</button>
   ${e.sandbox>=1?'<span class="tag teal">sandbox ✓ 5,000 leases OK, DNS resolution OK</span>':""}
   ${e.deployed?`<span class="tag ${e.deployFailed?"red":"teal"}">${e.deployFailed?"⚠ production deploy — regression detected":"production deploy ✓"}</span>`:""}
   ${e.deployFailed&&!e.rolledBack?`<button class="btn sm bad" data-act="rollbackRun" data-tid="${tid}">Execute rollback plan</button>`:""}
   ${e.rolledBack?'<span class="tag teal">rolled back → 2.89 stable ✓</span>':""}
  </div></div>`;
 }
 if(tid==="CHG-0421"){
  const miss=f.rfcmiss||[];
  h+=`<div class="fieldrow"><span class="flabel">Intake review — which required elements are missing?</span>${chipsHTML(tid,"rfcmiss",t.rfcMissingOpts,miss,false)}</div>`;
  h+=`<div class="fieldrow"><span class="flabel">Complete — purpose, goal &amp; scope</span>${selHTML(tid,"purpose",t.purposeOpts,f.purpose,"Purpose")}</div>`;
  h+=`<div class="fieldrow"><span class="flabel">Complete — rollback / backout plan</span>${selHTML(tid,"rollback",t.rollbackOpts,f.rollback,"Rollback plan")}</div>`;
  h+=`<div class="fieldrow"><span class="flabel">Complete — test plan</span>${selHTML(tid,"test",t.testOpts,f.test,"Test plan")}</div>`;
 }
 if(tid==="CHG-0422"){
  const pre=(mode()==="medium");
  if(pre)h+=`<div class="fieldrow"><span class="flabel">Rollback / backout plan</span><p class="small" style="margin:4px 0">✓ documented in request: disable new link + remove VRRP VIP config (revert to baseline). Tested in sandbox, ~15 min.</p></div>`;
  else h+=`<div class="fieldrow"><span class="flabel">Rollback / backout plan — missing from the submission</span>${selHTML(tid,"rollback",t.rollbackOpts,f.rollback,"Rollback plan")}</div>`;
 }
 return h;
}
function affectedHTML(tid){
 const t=TICKETS[tid];if(!t.affectedOpts)return"";
 if(t.affectedPrefilled===mode())return `<div class="fieldrow"><span class="flabel">Affected systems — impact analysis</span><p class="small" style="margin:4px 0">✓ recorded by the requester: HQ-CORE-01 (core switch), FW-B (new uplink path), HQ wired clients (default-gateway traffic).</p></div>`;
 return `<div class="fieldrow"><span class="flabel">Affected systems — impact analysis</span>${chipsHTML(tid,"affected",t.affectedOpts,F(tid).affected||[],true)}</div>`;
}
function riskHTML(tid){
 const t=TICKETS[tid];
 if(tid==="CHG-0418"&&mode()==="hard")return `<div class="fieldrow"><span class="flabel">Risk level</span><p class="small" style="margin:4px 0">✓ pre-assessed: HIGH (senior engineer assessment on file).</p></div>`;
 return `<div class="fieldrow"><span class="flabel">Risk level</span>${selHTML(tid,"risk",RISK_OPTS,F(tid).risk,"Risk level")}</div>`;
}
function gateHTML(tid){
 const t=TICKETS[tid]||{},e=E(tid),st=e.stage;
 if(tid==="SR-0917"){
  if(E(tid).stage>=1)return `<div class="gate"><h4>✓ Routed</h4><p>This item is a <b>service request</b> — it has been routed to the service desk and leaves the change pipeline. Keeping routine user asks out of the change board is itself correct process: the board's judgment stays available for real changes.</p>${auditHTML(tid)}</div>`;
  return `<div class="gate"><h4>Intake</h4><p>${esc(t.desc)}</p>
   <div class="fieldrow"><span class="flabel">Classify this queue item</span>${selHTML(tid,"type",TYPE_OPTS,f0(tid,"type"),"Item type")}</div>
   <button class="btn primary" data-act="advance" data-tid="${tid}">Route item</button>
   ${vd(tid+"-0")}</div>`;
 }
 if(tid==="DRIFT-0066"){return driftHTML();}
 const f=F(tid),gates=[];
 /* G0 intake */
 gates.push(`<div class="gate"><h4>Gate 0 · Intake</h4><p>${esc(t.desc)}<br><span class="small">Requester: ${esc(t.requester)}</span></p>
  <div class="fieldrow"><span class="flabel">Classify — change type</span>${selHTML(tid,"type",TYPE_OPTS,f.type,"Change type")}</div>
  ${mode()==="hard"&&PRIORITY_ITEMS.includes(tid)?`<div class="fieldrow"><span class="flabel">Dispatch priority (policy card rule)</span>${selHTML(tid,"priority",Array.from({length:6},(_,i)=>[String(i+1),"Priority "+(i+1)]),f.priority,"Dispatch priority")}</div>`:""}
  ${st>0?`<p class="small">✓ classified</p>`:`<button class="btn primary" data-act="advance" data-tid="${tid}">Submit to risk review</button>`}
  ${vd(tid+"-0")}</div>`);
 /* G1 risk */
 if(st>=1)gates.push(`<div class="gate"><h4>Gate 1 · Risk &amp; Impact ${st>1?"✓":""}</h4>
  ${affectedHTML(tid)}${riskHTML(tid)}${planFieldsHTML(tid)}
  ${st>1?"":`<button class="btn primary" data-act="advance" data-tid="${tid}">Submit to board</button>`}
  ${vd(tid+"-1")}</div>`);
 /* G2 approval */
 if(st>=2&&tid!=="CHG-0419")gates.push(`<div class="gate"><h4>Gate 2 · Board approval ${st>2?"✓":""}</h4>
  ${tid==="CHG-0423"?`<div class="fieldrow"><span class="flabel">Approval path (emergency)</span>${selHTML(tid,"empathy",t.empathOpts,f.empathy,"Emergency approval path")}</div>`:""}
  <div class="fieldrow"><span class="flabel">Board decision</span>${selHTML(tid,"decision",[["approve","Approve"],["reject","Reject"],["defer","Defer — send back for work"]],f.decision,"Board decision")}</div>
  ${mode()==="hard"&&t.approveJOpts?`<div class="fieldrow"><span class="flabel">Recorded justification</span>${selHTML(tid,"justify",t.approveJOpts,f.justify,"Justification")}</div>`:""}
  ${mode()==="hard"&&t.rejectJOpts&&tid==="CHG-0424"?`<div class="fieldrow"><span class="flabel">Recorded justification for rejection</span>${selHTML(tid,"justify",t.rejectJOpts,f.justify,"Rejection justification")}</div>`:""}
  ${st>2?"":`<button class="btn primary" data-act="advance" data-tid="${tid}">Record board decision</button>`}
  ${vd(tid+"-2")}</div>`);
 if(st>=2&&tid==="CHG-0419")gates.push(`<div class="gate"><h4>Gate 2 · Board approval — STANDARD CHANGE</h4>
  <p>✓ Pre-approved under catalog item <b class="mono">SC-114</b> (identical-model access switch swap). The board is not consulted — that is what “standard” means. Proceed to scheduling.</p>
  ${st>2?"":`<button class="btn primary" data-act="advance" data-tid="${tid}">Proceed (pre-approved)</button>`}</div>`);
 /* G3 schedule */
 if(st>=3&&st<8)gates.push(`<div class="gate"><h4>Gate 3 · Scheduled ${st>3?"✓":""}</h4>
  ${tid==="CHG-0418"?`<div class="fieldrow"><span class="flabel">Maintenance window (policy R4)</span><div class="radiocards">${WINDOW_SLOTS.map(w=>`<button class="winslot" data-act="win" data-slot="${w[0]}" aria-pressed="${f.window===w[0]}"><span class="wk">${w[0]}</span><span><b>${w[1]}</b><br><span class="small ${w[3]==="yes"?"ok":"no"}">${w[2]}</span></span></button>`).join("")}</div></div>
   <button class="btn primary" data-act="advance" data-tid="${tid}" ${st>3?"disabled":""}>Lock window &amp; stage change</button>${vd(tid+"-3")}`
  :`<p>Window: <b class="mono">${tid==="CHG-0423"?"now — active incident INC-8841":tid==="CHG-0419"?"immediate — pre-approved standard change":tid==="CHG-0420"?"Tue Nov 11 · 01:00–02:00":tid==="CHG-0421"?"Sun Nov 16 · 01:00–03:00":"Sat Nov 15 · 23:00–03:00"}</b></p>
   <button class="btn primary" data-act="advance" data-tid="${tid}">Lock window &amp; stage change</button>`}
  </div>`);
 /* G4 implement */
 if(st>=4&&st<8){const em=tid==="CHG-0423";
  gates.push(`<div class="gate"><h4>Gate 4 · Implement ${st>4?"✓":""}</h4>
  ${em&&!e.notified?`<div class="fieldrow"><span class="flabel">Policy R3 — notifications</span><button class="btn sm" data-act="notify" data-tid="${tid}">Send stakeholder notifications</button> <span class="small">required before implementation on the emergency path</span></div>`:""}
  ${em&&e.notified?'<span class="tag teal">notifications sent ✓ (helpdesk, depots, security)</span>':""}
  <div class="checkrow"><button class="btn good" data-act="exec" data-tid="${tid}" ${em&&!e.notified?"disabled":""}>Execute change during window</button></div>
  <div class="console" data-console="${tid}" aria-live="polite">${(e.log||[]).map(l=>esc(l)+"\n").join("")}</div>
  ${vd(tid+"-4")}</div>`);}
 /* G5 validate */
 if(st>=5&&st<8&&t.monOk&&t.monOk.length)gates.push(`<div class="gate"><h4>Gate 5 · Validation ${st>5?"✓":""}</h4>
  <p class="gh">${esc(t.monQ)}</p>
  <div class="fieldrow"><span class="flabel">Proof telemetry — select all that apply</span>${chipsHTML(tid,"monitor",MONITOR_CARDS,f.monitor||[],true)}</div>
  <button class="btn primary" data-act="advance" data-tid="${tid}">Record validation</button>
  ${vd(tid+"-5")}</div>`);
 /* G6 document + close */
 if(st>=6&&st<8)gates.push(docGateHTML(tid));
 if(st>=7&&st<8)gates.push(`<div class="gate"><h4>✓ Closed</h4><p>${tid==="CHG-0420"&&mode()==="hard"?"Closed as <b>attempted → failed validation → rolled back → service restored on 2.89</b>. The process did its job.":"Request closed with validation records and documentation updates on file."}</p></div>`);
 if(isRejected(tid))gates.push(`<div class="gate"><h4>✖ Rejected by the board</h4><p>Rejection recorded with justification. The requester is coached to re-plan with a test plan and rollback — and resubmit. Rejecting an unready change is the board <b>working</b>, not failing.</p></div>`);
 return gates.join("");
}
function f0(tid,k){return F(tid)[k];}
function docGateHTML(tid){
 const t=TICKETS[tid],f=F(tid);
 let inner="";
 if(t.docField)inner+=`<div class="fieldrow"><span class="flabel">${esc(t.docField.label)}</span>${selHTML(tid,"doc",t.docField.opts,f.doc,"Documentation value")}</div>`;
 if(tid==="CHG-0421"){
  inner+=`<div class="fieldrow"><span class="flabel">IPAM record update</span>${selHTML(tid,"ipam",t.ipamOpts,f.ipam,"IPAM update")}</div>`;
  inner+=`<div class="fieldrow"><span class="flabel">Schema change or address-assignment change?</span>${selHTML(tid,"schema",t.schemaOpts,f.schema,"Schema vs assignment")}</div>`;}
 if(tid==="CHG-0422")inner+=`<div class="fieldrow"><span class="flabel">Topology diagram</span><p class="small" style="margin:4px 0">${S.topoInstalled?"✓ candidate uplink activated on the diagram with VRRP VIP 10.10.0.1 (Evidence → Topology).":"Open Evidence → Topology and click the dashed candidate uplink to document it."}</p></div>`;
 if(tid==="CHG-0423")inner+=`<p class="small">✓ retro-record attached: INC-8841 reference, expedite approval, notifications — documented after the fact per R3.</p>`;
 if(tid==="CHG-0420"&&mode()==="hard"&&E(tid).rolledBack)inner+=`<p class="small">✓ failure record attached: deployment failed validation (lease regression), rollback to 2.89 executed and verified. Closing as attempted → failed → reverted.</p>`;
 return `<div class="gate"><h4>Gate 6 · Document &amp; close ${E(tid).stage>6?"✓":""}</h4>${inner}
  <button class="btn primary" data-act="advance" data-tid="${tid}">Close request</button>
  ${vd(tid+"-6")}</div>`;
}
function driftHTML(){
 const d=S.drift;
 return `
 <div class="gate"><h4>Investigation · What changed?</h4>
  <p class="gh">Evidence → Configs diffs three devices against their baseline/golden configurations. Pick the drifted one.</p>
  <div class="fieldrow"><span class="flabel">Drifted device</span><div class="chips">${["HQ-CORE-01","FW-B","DEPOT-E-ASW-02"].map(x=>`<button class="chip" data-act="driftDev" data-val="${x}" aria-pressed="${d.device===x}">${x}</button>`).join("")}</div></div>
  <div class="fieldrow"><span class="flabel">The delta (production vs. baseline)</span>${selHTML("DRIFT","delta",[["vlan66","VLAN 66 “GUEST-TEMP” added + port Gi1/0/24 re-pointed into it — absent from baseline"],["banner","Login banner text changed"],["none","No differences"],["fwdown","Firmware downgraded"]],d.delta,"Delta description")}</div>
  <div class="fieldrow"><span class="flabel">Classification</span>${selHTML("DRIFT","cls",[["unauth","Unauthorized change — configuration drift (no matching request)"],["std","Approved standard change"],["cosm","Cosmetic change, authorized per CHG-0416"],["hw","Hardware failure artifact"]],d.cls,"Classification")}</div>
  <div class="verdict" data-vf="DRIFT-a"></div></div>
 <div class="gate"><h4>Investigation · Who &amp; how to respond</h4>
  <p class="gh">Evidence → Logs → audit trail answers who/what/when.</p>
  <div class="fieldrow"><span class="flabel">Account behind the commit</span>${selHTML("DRIFT","who",[["moreau","j.moreau (network intern) — 2026-11-05 21:38 — NO RFC reference"],["chen","a.chen — 2026-11-06 09:12 — case open"],["svc","svc-backup — scheduled job"],["none","No record exists"]],d.who,"Account")}</div>
  <div class="fieldrow"><span class="flabel">Correct response</span>${selHTML("DRIFT","rem",[["rfc","Raise a remediation change request; revert the device to its baseline/golden configuration"],["silent","Quietly delete VLAN 66 after hours"],["ask","Ask the intern to fix it without a ticket"],["leave","Leave it and mention it at the next audit"]],d.rem,"Response")}</div>
  <div class="verdict" data-vf="DRIFT-b"></div></div>
 <div class="gate"><h4>Detection engineering · which sources reveal unauthorized changes?</h4>
  <div class="fieldrow"><span class="flabel">Evidence sources (select all that apply)</span>${chipsHTML("DRIFT","ds",[["cfgdiff","Production vs. baseline/golden configuration diff"],["audit","Change / audit trail review"],["asset","Asset inventory reconciliation"],["sla","SLA availability report"],["heat","Wi-Fi heat map"],["ups","UPS battery log"]],d.ds||[],true)}</div>
  <div class="verdict" data-vf="DRIFT-c"></div></div>`;
}
function renderWB(){
 const id=S.active;
 if(!id){$("#wbHead").innerHTML=`<span class="rid">Select a queue item</span><p class="lede small">The workbench shows the request's checkpoints and gates. Everything a gate asks for is answered by the evidence locker →</p>`;$("#rail").innerHTML="";$("#wbBody").innerHTML="";return;}
 const t=TICKETS[id];
 $("#wbHead").innerHTML=`<span class="rid">${id}</span><span>${esc(t.title)}</span><span class="tag">requester: ${esc(t.requester)}</span>`;
 renderRail();
 $("#wbBody").innerHTML=gateHTML(id)+auditHTML(id);
}
/* ---- evidence ---- */
const EV_TABS=[["topology","Topology"],["configs","Config diffs"],["windows","Windows"],["inventory","Inventory"],["ipam","IPAM · DNS"],["logs","Logs"],["policy","Policy"]];
function renderEV(){
 $("#evTabs").innerHTML=EV_TABS.map(t=>`<button class="evtab" role="tab" aria-selected="${S.evTab===t[0]}" data-act="evTab" data-tab="${t[0]}">${t[1]}</button>`).join("");
 const b=$("#evBody");
 const tab=S.evTab;
 if(tab==="topology"){b.innerHTML=TOPOLOGY_SVG(S.topoInstalled);}
 else if(tab==="configs"){
  const dev=S.cfgTab;
  b.innerHTML=`<div class="cfgbar">${Object.keys(DIFFS).map(d=>`<button class="cfgtab" data-act="cfgTab" data-dev="${d}" aria-pressed="${dev===d}">${d}</button>`).join("")}</div>
  <p class="small" style="margin:2px 0 8px">Production configuration vs. <b style="color:var(--ink)">baseline/golden</b> — green = added in production, red = expected but missing.</p>
  <div class="diff">${DIFFS[dev].map(l=>`<div class="dl ${l[0]}">${esc(l[1])}</div>`).join("")}</div>
  ${dev==="FW-B"?(S.drift.fwOk?`<p class="small" style="color:var(--teal);margin:8px 0">✓ marked reviewed — authorized per CHG-0416 (approved 2026-11-03). Not drift.</p>`:`<div class="checkrow" style="margin-top:10px"><button class="btn sm" data-act="markFw">Mark reviewed — authorized per CHG-0416</button></div>`):""}
  ${dev==="DEPOT-E-ASW-02"?'<p class="small" style="margin:8px 0">A clean diff is a finding too: it rules this device out of the drift investigation.</p>':""}`;
 }
 else if(tab==="windows"){b.innerHTML=`<p class="small">Available maintenance slots (policy R4 governs high-risk work). CHG-0418's window is chosen from here.</p>`+WINDOW_SLOTS.map(w=>`<button class="winslot" data-act="win" data-slot="${w[0]}" aria-pressed="${F("CHG-0418").window===w[0]}"><span class="wk">${w[0]}</span><span><b>${w[1]}</b><br><span class="small ${w[3]==="yes"?"ok":"no"}">${w[2]}</span></span></button>`).join("");}
 else if(tab==="inventory"){
  const inv=INVENTORY.map(r=>{
   let row=[...r];
   if(r[0]==="DEPOT-E-ASW-02"&&F("CHG-0419").doc==="snew")row[2]="SN-MFL-90377 ✓ updated",row[4]="active";
   if(r[0]==="FW-A"&&F("CHG-0418").doc==="v281")row[3]="FPR 4.2.7-281 ✓ updated";
   if(r[0]==="FW-B"&&F("CHG-0418").doc==="v281")row[3]="FPR 4.2.7-281 ✓ updated";
   if(r[0]==="NETOPS-SRV"){row[3]=S.env["CHG-0420"]&&S.env["CHG-0420"].rolledBack?"dnsmasq 2.89 (rolled back ✓)":(S.env["CHG-0420"]&&S.env["CHG-0420"].deployed?"dnsmasq 2.90":"dnsmasq 2.89");}
   return row;});
  b.innerHTML=`<table class="data"><tr><th>Device</th><th>Role</th><th>Serial</th><th>SW/FW version</th><th>Status</th><th>Linked request</th></tr>${inv.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</table><p class="small" style="margin-top:8px">Rows update automatically when documentation fields are completed — that is the point of the Documentation gate.</p>`;
 }
 else if(tab==="ipam"){
  const rows=IPAM_ROWS.map(r=>{
   const rr=[...r];
   if(rr[0]==="VLAN 40"&&F("CHG-0421").ipam==="i1"){rr[2]="10.40.20.0/24 ✓";rr[3]="schema v2 ✓";rr[4]="CHG-0421 closed";}
   return rr;});
  if(S.drift.cls==="unauth"){rows.splice(5,0,["VLAN 66","GUEST-TEMP","(none recorded)","—","⚠ UNDOCUMENTED — drift confirmed (DRIFT-0066)"]);}
  b.innerHTML=`<p class="small">IPAM — the documented IP address <b style="color:var(--ink)">schema</b> (blocks/scopes) and assignments.</p>
  <table class="data"><tr><th>VLAN</th><th>Name</th><th>Block/scope</th><th>Schema</th><th>Note</th></tr>${rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</table>
  <p class="small" style="margin-top:10px"><b style="color:var(--ink)">DNS records</b></p>
  <table class="data"><tr><th>Record</th><th>Type</th><th>Value</th><th>Note</th></tr>${DNS_ROWS.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</table>`;
 }
 else if(tab==="logs"){
  b.innerHTML=`<p class="small"><b style="color:var(--ink)">Audit trail</b> — who committed what, when, under which request</p>
  <div class="logbox">${AUDIT_LOG.map(l=>`<span class="${l[4].includes("⚠")?"lw":"li"}">${l[0]}  ${l[1].padEnd(14)} ${esc(l[2])}  by ${esc(l[3])}  ${esc(l[4])}\n</span>`).join("")}</div>
  <p class="small" style="margin-top:10px"><b style="color:var(--ink)">Syslog</b></p>
  <div class="logbox">${SYSLOG.map(l=>`<span class="${l[3]==="warn"?"lw":"li"}">${l[0]} ${l[1]} ${esc(l[2])}\n</span>`).join("")}</div>
  <p class="small" style="margin-top:10px">${esc(HELPDESK_NOTE)}</p>
  <div class="checkrow" style="margin-top:8px">${S.drift.flapOk?'<span class="tag teal">✓ reviewed: link flap = carrier issue NET-2211, unrelated to changes</span>':'<button class="btn sm" data-act="markFlap">Mark reviewed — unrelated link flap (carrier ticket)</button>'}</div>`;
 }
 else if(tab==="policy"){b.innerHTML=POLICY_HTML+`<p class="small" style="margin-top:10px">Life-cycle context: EOL/EOS dates drive which changes get requested next quarter; decommissioning is itself a change type. (Objective 3.1 groups these together.)</p>`;}
}
/* ---- objectives drawer ---- */
function objPendingHTML(o,st){
 const max=mode()==="medium"?3:1;
 let h='<div class="checkrow"><button class="btn sm primary" data-act="checkObj" data-oid="'+o.id+'">Check results</button>';
 h+='<button class="btn sm" data-act="hintObj" data-oid="'+o.id+'">'+(mode()==="medium"?("Hint ("+st.hints+"/3)"):"Nudge (costs stars)")+'</button></div>';
 h+='<div class="hintbox '+(st.hints>0?"show":"")+'" data-hb="'+o.id+'">'+(st.hints>0?"<b>Hint "+st.hints+"/"+max+":</b> "+esc(o.hints[st.hints-1]||o.hints[0]):"")+'</div>';
 if(st.last)h+='<div class="verdict '+(st.last.ok?"ok":"no")+'">'+(st.last.ok?"✓ ":"✗ ")+esc(st.last.why)+'</div>';
 return h;
}
function renderOBJ(){
 $("#objStarLine").innerHTML=(mode()==="medium"?"Hints are free to use — they only affect your star rating at the end.":"Night shift: at most ONE nudge per objective, and each nudge visibly costs stars.")+(allObjDone()?' <button class="btn sm primary" data-act="openCompletion" style="margin-left:8px">Open shift debrief</button>':"");
 $("#objList").innerHTML=objs().map(o=>{
  const st=OBJ(o.id);
  let h='<div class="objcard '+(st.done?"done":"")+'" data-oc="'+o.id+'">';
  h+='<div class="otag"><span class="mono" style="color:var(--amber);font-weight:700">'+o.id+'</span><span class="pillar '+o.pillar.toLowerCase()+'">'+o.pillar+'</span>'+(st.done?'<span class="tag teal">✓ complete</span>':'<span class="tag">attempts: '+st.attempts+'</span>')+'</div>';
  h+='<div class="otext">'+esc(o.text)+'</div>';
  if(st.done)h+='<p class="small" style="color:var(--teal);margin:0">'+esc(o.why)+'</p>';
  else h+=objPendingHTML(o,st);
  h+='</div>';
  return h;
 }).join("");
}
/* ---- knowledge + debrief ---- */
function renderKB(){
 $("#accWrap").innerHTML=KNOWLEDGE.map((k,i)=>`<div class="acc"><button data-act="acc" data-i="${i}" aria-expanded="false"><span>▸</span><b>${k[0]}</b></button><div class="body" hidden>${k[1]}</div></div>`).join("")
 +`<h3 style="margin-top:18px">Objective drill — sort the four statements</h3><p class="small">Maps to ${mode()==="medium"?"OBJ-M12":"the triage objective"}: which process owns each statement?</p>`
 +CONCEPT_ITEMS.map(c=>`<div class="fieldrow"><span class="flabel">${esc(c[1])}</span>${selHTML("CONCEPT",c[0],CONCEPT_OPTS,S.concept[c[0]],"Category")}</div>`).join("")
 +`<div class="verdict" data-vf="CONCEPT"></div>`;
}
function renderDebrief(){
 $("#debriefGrid").innerHTML=Object.values(DEBRIEF).map(d=>`<div class="dcard"><h4>${d[0]}</h4>${d[1]}</div>`).join("");
}