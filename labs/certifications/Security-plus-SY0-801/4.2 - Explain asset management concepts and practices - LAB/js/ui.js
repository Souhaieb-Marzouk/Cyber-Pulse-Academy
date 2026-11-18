"use strict";
/* =============================================================================
   js/ui.js — rendering helpers and components: DOM query shorthands, ARIA
   live announcements, toast, progress ring, rail/station navigation, reusable
   builders (feedback, check button, multi-select cards, dropdown rows,
   sequence columns, flag pairs), all station renderers, objectives tracker,
   completion modal (stars + focus areas + certificate) and modal helpers.
   ========================================================================== */

const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));

function announce(m){const el=$("#sr");if(el)el.textContent=m;}
let toastT=null;
function toast(m){const el=$("#toast");el.textContent=m;el.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>{el.hidden=true;},3200);}

function updateRing(){const list=objs();const total=list.length;const done=list.filter(o=>(S.obj[o.id]||{}).done).length;
  $("#ringNum").textContent=done+"/"+total;
  $("#ringFg").style.strokeDashoffset=String(88*(1-(total?done/total:0)));}

function renderRail(){$("#railTabs").innerHTML=DESKS.map((d,i)=>'<button class="desk-tab" type="button" data-act="goto" data-st="'+d[0]+'" aria-current="'+(S.station===d[0])+'"><span class="dt-num">'+String(i+1).padStart(2,"0")+'</span>'+d[1]+'</button>').join("");}
function go(st){S.station=st;save();renderRail();renderStation();const m=$("#stage");if(m)m.scrollIntoView({behavior:"smooth",block:"start"});}
function renderStation(){const f={briefing:renderBriefing,knowledge:renderKnowledge,planning:renderPlanning,registry:renderRegistry,monitoring:renderMonitoring,bay:renderBay,quiz:renderQuiz,debrief:renderDebrief}[S.station]||renderBriefing;
  const stage=$("#stage");stage.innerHTML=f();stage.focus({preventScroll:true});}

/* ---------- shared builders ---------- */
function fb(id){return '<div class="feedback" data-fb="'+id+'"></div>';}
function checkBtn(id){return '<button class="checkbtn" type="button" data-act="check" data-obj="'+id+'">Check result</button>';}
function mselHTML(k,items,sel){return '<div class="msel">'+items.map(it=>'<button type="button" class="msel-card" data-act="msel" data-k="'+k+'" data-id="'+it.id+'" aria-pressed="'+sel.includes(it.id)+'"><strong>'+it.t+'</strong>'+(it.d?"<span>"+it.d+"</span>":(it.ev?"<span>Evidence: "+it.ev+"</span>":""))+'</button>').join("")+'</div>';}
function ddrow(label,selHTML){return '<div class="ddrow"><label>'+label+'</label>'+selHTML+'</div>';}
function selHTML(k,id,opts,cur,sub){return '<select data-k="'+k+'" data-id="'+id+'"'+(sub?' data-sub="'+sub+'"':'')+' aria-label="'+id+'"><option value="">— choose —</option>'+opts.map(o=>'<option value="'+o[0]+'"'+(cur===o[0]?" selected":"")+'>'+o[1]+'</option>').join("")+'</select>';}
function seqCols(b,poolItems,placed){return '<div class="seq-cols"><div><h4>Available (click to place)</h4><div class="seq-pool">'+(poolItems.filter(p=>!placed.includes(p.id)).map(p=>'<button type="button" class="seq-item" data-act="pool" data-b="'+b+'" data-id="'+p.id+'">'+p.t+'</button>').join("")||'<p style="font-size:12.5px;color:var(--ink2)">All placed.</p>')+'</div></div><div><h4>Your order (click to remove)</h4><div class="seq-done">'+(placed.map((id,i)=>{const it=poolItems.find(p=>p.id===id);return '<button type="button" class="seq-item" data-act="done" data-b="'+b+'" data-id="'+id+'"><b>'+(i+1)+'.</b> '+(it?it.t:id)+'</button>';}).join("")||'<p style="font-size:12.5px;color:var(--ink2)">Nothing placed yet.</p>')+'</div></div></div>';}
function flagPair(k,id,opts,cur){return '<div class="flagpair">'+opts.map(o=>'<button type="button" class="flagbtn opt-'+o[0]+'" data-act="flag" data-k="'+k+'" data-id="'+id+'" data-v="'+o[0]+'" aria-pressed="'+(cur===o[0])+'">'+o[1]+'</button>').join("")+'</div>';}

/* ---------- stations ---------- */
function renderBriefing(){
  return '<div class="stage-head"><div class="inner"><span class="stage-chip">Case assignment</span><h1>Briefing — the Corvane audit</h1><p class="stage-sub">Fictional scenario · synthetic training data · CompTIA Security+ SY0-801 Objective 4.2</p></div></div>'
  +'<div class="desk-body">'
  +'<div class="card"><h3>Your assignment</h3>'
  +'<p>You are the new <strong>IT Asset &amp; Compliance Coordinator</strong> at Corvane Mutual Insurance — 4,200 employees, a headquarters, three regional offices and a claims operation that touches hundreds of thousands of policyholders\' records. Last year, a peer insurer was breached through a server that was not in anyone\'s inventory: unpatched, unsupported, invisible. The board asked Internal Audit to grade Corvane\'s asset management. The grade was not kind.</p>'
  +'<p>Your job over this exercise: walk the five lifecycle stages that SY0-801 Objective 4.2 expects you to explain — <em>planning &amp; scoping, acquisition &amp; procurement, assignment &amp; accounting, monitoring &amp; asset tracking, disposal &amp; decommissioning</em> — across all three asset families: hardware, software and data. Fix the registry. Flag the shadow IT. Retire FILE01 properly this time.</p>'
  +'<div class="note-strip"><strong>How the office works:</strong> the desks on the left mirror the five lifecycle stages. The <strong>objectives tracker</strong> on the right lists every task with its <em>Check</em> button and hints. Progress auto-saves in your browser. Everything you see is simulated training data — no real systems, people or hosts.</div></div>'
  +'<div class="card"><h3>Why this matters for the exam</h3><p>Objective 4.2 — <em>“Explain the security implications of proper hardware, software, and data asset management”</em> — carries the Asset management life cycle sub-objective with exactly five stages. The exam verb is <em>explain</em>: why records must be honest, why disposal leaves residue, why ownership matters. When you finish the desks here, you will have exercised every part of that scope — including the MITRE view: unmanaged hardware as <span class="mono">T1200</span>, unsanctioned cloud as <span class="mono">T1567.002</span>, and the controls <span class="mono">M1033/M1034/M1035/M1051</span>.</p></div>'
  +'</div>';}

function renderKnowledge(){
  const pool=["monitor","plan","dispose","acquire","assign"];
  const isM=S.mode==="medium";
  let h='<div class="stage-head"><div class="inner"><span class="stage-chip">Knowledge core</span><h1>What you must be able to explain</h1><p class="stage-sub">Read once, return anytime — the glossary button is on the top strip</p></div></div><div class="desk-body">';
  h+='<div class="card"><h3>The control behind every control</h3><p>'+KC.intro+'</p><p>'+KC.whyAttackers+'</p></div>';
  h+='<div class="card"><h3>The five lifecycle stages (SY0-801 4.2)</h3><div class="kc-grid">'+KC.stages.map(s=>'<div class="stage-card"><h4>'+s.n+' · '+s.t+'</h4><p>'+s.d+'</p></div>').join("")+'</div></div>';
  h+='<div class="card"><h3>Three asset families, one lifecycle</h3>'+KC.families+'</div>';
  h+='<div class="card"><h3>Ownership: decision vs. implementation</h3>'+KC.ownership+'</div>';
  h+='<div class="card"><h3>Sanitization &amp; destruction — the exam\'s favorite table</h3><table class="ledger disposal-table"><thead><tr><th>Method</th><th>Applies to</th><th>Key point</th></tr></thead><tbody>'+KC.disposalTable.map(r=>'<tr><td>'+r[0]+'</td><td>'+r[1]+'</td><td>'+r[2]+'</td></tr>').join("")+'</tbody></table></div>';
  h+='<div class="card"><h3>Widely reported real-world failures</h3><ul class="case-list">'+KC.cases.map(c=>'<li><strong>'+c.t+':</strong> '+c.d+'</li>').join("")+'</ul></div>';
  if(isM){h+='<div class="card"><h3>Practice: order the lifecycle</h3><span class="objref">Objective M1</span><p class="why">Click the five stages in the official order — first stage on top.</p>'
    +seqCols("lifecycle",pool.map(id=>({id,t:STAGE_NAMES[id]})),S.env.lifecycle)+checkBtn("M1")+fb("M1")+'</div>';}
  h+='</div>';return h;}

function renderPlanning(){
  let h='<div class="stage-head"><div class="inner"><span class="stage-chip">Lifecycle stages 1–2</span><h1>Planning Desk &amp; Intake</h1><p class="stage-sub">Security is cheapest before the purchase order exists</p></div></div><div class="desk-body">';
  if(S.mode==="medium"){
    h+='<div class="card"><h3>The 40-laptop request</h3><span class="objref">Objective M3</span><p class="why">Procurement drafted the purchase request for 40 new laptops. Select every planning &amp; scoping input that MUST be in it (6 of 9). Distractors exist.</p>'
      +mselHTML("planSel",ENV_M.plan.options,S.env.planSel)+checkBtn("M3")+fb("M3")+'</div>';
    h+='<div class="card"><h3>Three procurement calls</h3><span class="objref">Objective M4</span><p class="why">Choose the compliant decision for each acquisition scenario.</p>'
      +ENV_M.plan.scenarios.map(s=>ddrow('<strong>'+s.id.toUpperCase()+'.)</strong> '+s.t,selHTML("proc",s.id,ENV_M.plan.scenarioOpts[s.ans].map((t,i)=>["opt"+i,t]),S.env.proc[s.id]||""))).join("")
      +'<p style="font-size:12.5px;color:var(--ink2)">Note: each dropdown lists the same options as its scenario, in order.</p>'+checkBtn("M4")+fb("M4")+'</div>';
  } else {
    h+='<div class="card"><h3>Audit gaps → controls (with official IDs)</h3><span class="objref">Objective H7</span><p class="why">Internal audit found five gaps. Assign each the correct control, then order the four rollout phases.</p>'
      +ENV_H.ctrl.gaps.map(g=>ddrow('<strong>'+g.t+'</strong>',selHTML("ctrlMap",g.id,ENV_H.ctrl.controls.map(c=>[c.id,c.t]),S.env.ctrlH.map[g.id]))).join("")
      +'<h4 style="margin:16px 0 8px">Rollout phases</h4>'+seqCols("phases",[{id:"p3",t:ENV_H.ctrl.phases[2].t},{id:"p1",t:ENV_H.ctrl.phases[0].t},{id:"p4",t:ENV_H.ctrl.phases[3].t},{id:"p2",t:ENV_H.ctrl.phases[1].t}],S.env.ctrlH.phases)
      +checkBtn("H7")+fb("H7")+'</div>';
  }
  h+='</div>';return h;}

function renderRegistry(){
  let h='<div class="stage-head"><div class="inner"><span class="stage-chip">Lifecycle stage 3 (+ software &amp; data ledgers)</span><h1>Registry Desk</h1><p class="stage-sub">Assignment &amp; accounting — make the records honest</p></div></div><div class="desk-body">';
  if(S.mode==="medium"){
    h+='<div class="card"><h3>Reconciliation: scan vs. registry</h3><span class="objref">Objective M2</span><p class="why">Mark each discovered device <em>Known</em> or <em>Rogue</em>; mark each registry record <em>Live</em> or <em>Stale</em>. Exactly two devices and two records are wrong.</p>'
      +'<table class="ledger"><thead><tr><th>Discovered (network scan)</th><th>Detail</th><th>Your call</th></tr></thead><tbody>'
      +ENV_M.recon.devices.map(d=>'<tr><td><span class="tagchip">'+d.host+'</span></td><td><span class="mono">'+d.ip+'</span> · <span class="mono">'+d.mac+'</span><br><small>'+d.os+' — '+d.note+'</small></td><td>'+flagPair("reconMdev",d.id,[["known","Known"],["rogue","Rogue"]],S.env.reconM.dev[d.id])+'</td></tr>').join("")
      +'</tbody></table><table class="ledger" style="margin-top:12px"><thead><tr><th>Registry record (CMDB)</th><th>Detail</th><th>Your call</th></tr></thead><tbody>'
      +ENV_M.recon.registry.map(r=>'<tr><td><span class="tagchip">'+r.tag+'</span></td><td>'+r.type+' · owner: '+r.owner+(r.note?'<br><small>'+r.note+'</small>':'')+'</td><td>'+flagPair("reconMreg",r.id,[["live","Live"],["stale","Stale"]],S.env.reconM.reg[r.id])+'</td></tr>').join("")
      +'</tbody></table>'+checkBtn("M2")+fb("M2")+'</div>';
    h+='<div class="card"><h3>Owners, custodians &amp; classification</h3><span class="objref">Objective M5</span><p class="why">Who decides, who implements — then label the two assets.</p>'
      +ENV_M.roles.items.map(r=>ddrow(r.t,selHTML("roles",r.id,[["owner","Data owner"],["custodian","Custodian / steward"]],S.env.roles[r.id]))).join("")
      +ENV_M.roles.cls.map(c=>ddrow('Classify: <strong>'+c.t+'</strong>',selHTML("clsM",c.id,[["public","Public"],["internal","Internal"],["confidential","Confidential"],["restricted","Restricted"]],S.env.clsM[c.id]))).join("")
      +checkBtn("M5")+fb("M5")+'</div>';
  } else {
    h+='<div class="card"><h3>Full reconciliation report</h3><span class="objref">Objective H1</span><p class="why">Three evidence sources, 12 devices, 10 records. Two devices will tempt you into false findings — check the receiving reports and remember: identity is the MAC, an IP is a lease.</p>'
      +'<table class="ledger"><thead><tr><th>Discovered device</th><th>Evidence</th><th>Classification</th></tr></thead><tbody>'
      +ENV_H.recon.devices.map(d=>'<tr><td><span class="tagchip">'+d.host+'</span><br><small class="mono">'+d.ip+' · '+d.mac+'</small></td><td><small>'+d.src+'</small></td><td>'+selHTML("reconHdev",d.id,ENV_H.recon.devOpts,S.env.reconH.dev[d.id])+'</td></tr>').join("")
      +'</tbody></table><table class="ledger" style="margin-top:12px"><thead><tr><th>Registry record</th><th>Classification</th></tr></thead><tbody>'
      +ENV_H.recon.registry.map(r=>'<tr><td><span class="tagchip">'+r.tag+'</span><br><small>'+r.detail+'</small></td><td>'+selHTML("reconHreg",r.id,ENV_H.recon.regOpts,S.env.reconH.reg[r.id])+'</td></tr>').join("")
      +'</tbody></table><h4 style="margin:14px 0 8px">Receiving reports (evidence)</h4>'+ENV_H.recon.receipts.map(rc=>'<div class="stage-card" style="margin-bottom:8px"><h4>'+rc.t+'</h4><p>'+rc.d+'</p></div>').join("")
      +checkBtn("H1")+fb("H1")+'</div>';
    h+='<div class="card"><h3>Data inventory — apply the policy card</h3><span class="objref">Objective H2</span><p class="why">Owner, classification and retention for five data assets. Two are ambiguous until you apply the rules — that is the point.</p><div class="note-strip">'+ENV_H.dataInv.policy+'</div>'
      +ENV_H.dataInv.assets.map(a=>'<div class="stage-card" style="margin-top:10px"><h4><span class="mono">'+a.t+'</span></h4><p>'+a.d+'</p>'
        +ddrow("Owner",selHTML("inv",a.id,ENV_H.dataInv.owners,(S.env.dataInvH[a.id]||{}).o,"o"))
        +ddrow("Classification",selHTML("inv",a.id,ENV_H.dataInv.classes,(S.env.dataInvH[a.id]||{}).c,"c"))
        +ddrow("Retention",selHTML("inv",a.id,ENV_H.dataInv.rets,(S.env.dataInvH[a.id]||{}).r,"r"))+'</div>').join("")
      +checkBtn("H2")+fb("H2")+'</div>';
    h+='<div class="card"><h3>Software ledger: license position &amp; SBOM</h3><span class="objref">Objective H3</span><p class="why">Set status AND required action per title; then make the SBOM call on the vulnerable library.</p>'
      +'<table class="ledger"><thead><tr><th>Title</th><th>Model</th><th>Entitlements</th><th>Installs found</th><th>Status</th><th>Action</th></tr></thead><tbody>'
      +ENV_H.lic.titles.map(t=>'<tr><td><strong>'+t.t+'</strong></td><td>'+t.model+'</td><td class="mono">'+t.ent+'</td><td class="mono">'+t.inst+'</td><td>'+selHTML("licH",t.id,ENV_H.lic.statusOpts,S.env.licH[t.id])+'</td><td>'+selHTML("licAct",t.id,ENV_H.lic.actionOpts,S.env.licAct[t.id])+'</td></tr>').join("")
      +'</tbody></table><div class="note-strip" style="margin-top:12px">'+ENV_H.lic.sbomQ+'</div>'
      +'<p style="margin:10px 0 6px">Select every internal product affected by CVE-2026-1187:</p>'
      +mselHTML("sbomH",ENV_H.lic.sbomOpts.map(o=>({id:o[0],t:o[1]})),S.env.sbomH)
      +checkBtn("H3")+fb("H3")+'</div>';
  }
  h+='</div>';return h;}

function renderMonitoring(){
  let h='<div class="stage-head"><div class="inner"><span class="stage-chip">Lifecycle stage 4</span><h1>Monitoring Feed</h1><p class="stage-sub">Change detection — hunting the unaccounted</p></div></div><div class="desk-body">';
  if(S.mode==="medium"){
    h+='<div class="card"><h3>Unmanaged-asset alerts</h3><span class="objref">Objective M6</span><p class="why">Select the 3 alerts that indicate an unmanaged asset. The rest is routine operations noise.</p>'
      +mselHTML("alertsSel",ENV_M.alerts.map(a=>({id:a.id,t:a.t})),S.env.alertsSel)+checkBtn("M6")+fb("M6")+'</div>';
    h+='<div class="card"><h3>Shadow IT sweep</h3><span class="objref">Objective M7</span><p class="why">Six discovered services (egress + expense evidence). Flag every unsanctioned one.</p>'
      +mselHTML("shadowSel",ENV_M.shadow,S.env.shadowSel)+checkBtn("M7")+fb("M7")+'</div>';
  } else {
    h+='<div class="card"><h3>Unmanaged-device hunt</h3><span class="objref">Objective H5</span><p class="why">Twelve events, two of them authorized red herrings. Answer the four questions.</p>'
      +'<div class="stage-card" style="margin-bottom:10px"><h4>Evidence — monitoring feed (last 24h)</h4>'+ENV_H.rogue.feed.map(f=>'<p style="margin:6px 0;font-size:13px">• '+f.t+'</p>').join("")+'</div>'
      +ENV_H.rogue.q.map(q=>ddrow(q.q,selHTML("rogueH",q.id,q.opts,S.env.rogueH[q.id]))).join("")
      +checkBtn("H5")+fb("H5")+'</div>';
    h+='<div class="card"><h3>Postmortem record</h3><span class="objref">Objective H8</span><p class="why">'+ENV_H.pm.brief+'</p>'
      +ddrow("Entry technique (MITRE)",selHTML("pmH","tech",ENV_H.pm.techOpts,S.env.pmH.tech))
      +ddrow("Lifecycle stage that failed",selHTML("pmH","stage",ENV_H.pm.stageOpts,S.env.pmH.stage))
      +ddrow("Accountable role for the claims data",selHTML("pmH","role",ENV_H.pm.roleOpts,S.env.pmH.role))
      +'<p style="margin:10px 0 6px">Select the TWO controls that would have caught this:</p>'
      +mselHTML("pmCtl",ENV_H.pm.ctlOpts.map(o=>({id:o[0],t:o[1]})),S.env.pmH.ctl)
      +checkBtn("H8")+fb("H8")+'</div>';
  }
  h+='</div>';return h;}

function renderBay(){
  let h='<div class="stage-head"><div class="inner"><span class="stage-chip">Lifecycle stage 5</span><h1>Decommission Bay</h1><p class="stage-sub">Disposal — where data outlives hardware unless you stop it</p></div></div><div class="desk-body">';
  if(S.mode==="medium"){
    h+='<div class="card"><h3>Retirement queue: sanitization methods</h3><span class="objref">Objective M8</span><p class="why">Six assets, five methods. Media physics and data sensitivity both matter; one method is never correct.</p>'
      +ENV_M.disposal.assets.map(a=>'<div style="margin-bottom:10px"><p style="margin:0 0 6px"><strong>'+a.t+'</strong> <span class="tagchip">'+a.cls+'</span></p><div class="chips">'+ENV_M.disposal.methods.map(m=>'<button type="button" class="chipbtn" data-act="msel-oneway" data-k="methodsM" data-id="'+a.id+'" data-v="'+m.id+'" aria-pressed="'+(S.env.methodsM[a.id]===m.id)+'">'+m.t+'</button>').join("")+'</div></div>').join("")
      +checkBtn("M8")+fb("M8")+'</div>';
    h+='<div class="card"><h3>FILE01\'s leftovers</h3><span class="objref">Objective M9</span><p class="why">FILE01 was powered off and rack-removed last quarter. Select every unresolved exposure (5 of 7).</p>'
      +mselHTML("gapsSel",ENV_M.gaps,S.env.gapsSel)+checkBtn("M9")+fb("M9")+'</div>';
    h+='<div class="card"><h3>Clean decommissioning sequence</h3><span class="objref">Objective M10</span><p class="why">Order the six steps — first on top.</p>'
      +seqCols("seqM",[{id:"q5",t:ENV_M.seq[4].t},{id:"q3",t:ENV_M.seq[2].t},{id:"q6",t:ENV_M.seq[5].t},{id:"q1",t:ENV_M.seq[0].t},{id:"q4",t:ENV_M.seq[3].t},{id:"q2",t:ENV_M.seq[1].t}],S.env.seqM)
      +checkBtn("M10")+fb("M10")+'</div>';
    h+='<div class="card"><h3>Certificate of destruction — judge the evidence</h3><span class="objref">Objective M11</span><p class="why">Part 1: select the four required elements. Part 2: mark which evidence specimens are INSUFFICIENT.</p>'
      +'<p style="margin:8px 0 6px"><strong>Part 1 — required elements:</strong></p>'+mselHTML("certReq",ENV_M.cert.req,S.env.certReq)
      +'<p style="margin:12px 0 6px"><strong>Part 2 — select the insufficient evidence:</strong></p>'+mselHTML("certIns",ENV_M.cert.ev.map(e=>({id:e.id,t:e.t})),S.env.certIns)
      +checkBtn("M11")+fb("M11")+'</div>';
    h+='<div class="card"><h3>Retention vs. legal hold</h3><span class="objref">Objective M12</span><p class="why">Five archived batches — decide for each.</p>'
      +ENV_M.retention.map(b=>ddrow('<strong>'+b.t+'</strong> <small>('+b.meta+')</small>',selHTML("retM",b.id,ENV_M.retOpts,S.env.retM[b.id]))).join("")
      +checkBtn("M12")+fb("M12")+'</div>';
  } else {
    h+='<div class="card"><h3>FILE01 decommissioning plan (four parts)</h3><span class="objref">Objective H4</span><p class="why">All four parts must be exact. Sub-check feedback tells you which part failed.</p>'
      +'<p style="margin:10px 0 6px"><strong>Part A — order the 8 steps:</strong></p>'
      +seqCols("h4seq",[{id:"h8",t:ENV_H.bay4.seq[7].t},{id:"h5",t:ENV_H.bay4.seq[4].t},{id:"h2",t:ENV_H.bay4.seq[1].t},{id:"h7",t:ENV_H.bay4.seq[6].t},{id:"h6",t:ENV_H.bay4.seq[5].t},{id:"h4",t:ENV_H.bay4.seq[3].t},{id:"h3",t:ENV_H.bay4.seq[2].t},{id:"h1",t:ENV_H.bay4.seq[0].t}],S.env.h4.seq)
      +'<p style="margin:14px 0 6px"><strong>Part B — method per component:</strong></p>'
      +ENV_H.bay4.methods.map(m=>ddrow(m.t,selHTML("h4methods",m.id,ENV_M.disposal.methods.filter(x=>x.id!=="quickformat").map(x=>[x.id,x.t]),S.env.h4.methods[m.id]))).join("")
      +'<p style="margin:14px 0 6px"><strong>Part C — valid evidence artifacts (select 3):</strong></p>'+mselHTML("h4ev",ENV_H.bay4.evOpts,S.env.h4.ev)
      +'<p style="margin:14px 0 6px"><strong>Part D — leftover exposures the plan must close (select 4):</strong></p>'+mselHTML("h4gaps",ENV_H.bay4.gapOpts,S.env.h4.gaps)
      +checkBtn("H4")+fb("H4")+'</div>';
    h+='<div class="card"><h3>Risk register: the EOS exception</h3><span class="objref">Objective H6</span><p class="why">'+ENV_H.risk.brief+'</p>'
      +ddrow("Risk statement",selHTML("riskH","stmt",ENV_H.risk.stmtOpts,S.env.riskH.stmt))
      +ddrow("Formal response",selHTML("riskH","resp",ENV_H.risk.respOpts,S.env.riskH.resp))
      +ddrow("Accountable owner",selHTML("riskH","owner",ENV_H.risk.ownerOpts,S.env.riskH.owner))
      +'<p style="margin:10px 0 6px">Compensating controls (select every correct one — none of the fakes):</p>'
      +mselHTML("riskCtl",ENV_H.risk.ctlOpts.map(o=>({id:o[0],t:o[1]})),S.env.riskH.ctl)
      +ddrow("Review point",selHTML("riskH","review",ENV_H.risk.reviewOpts,S.env.riskH.review))
      +checkBtn("H6")+fb("H6")+'</div>';
  }
  h+='</div>';return h;}

function renderQuiz(){
  const list=QUIZ[S.mode];
  const total=list.length;const answered=Object.keys(S.quiz).length;
  let h='<div class="stage-head"><div class="inner"><span class="stage-chip">Knowledge check</span><h1>'+(S.mode==="medium"?"Concept check":"Scenario triage")+'</h1><p class="stage-sub">'+(S.mode==="medium"?"Six concept questions, unlocked in order — each answer locks when submitted and is explained.":"Seven scenario items, unlocked in order — application, not recall. Each answer locks when submitted.")+'</p></div></div><div class="desk-body">';
  list.forEach((q,qi)=>{const chosen=S.quiz[qi];const done=chosen!==undefined;
    const gated=qi>0&&S.quiz[qi-1]===undefined;
    h+='<div class="card quizq"><p class="qtext">Q'+(qi+1)+' · '+q.q+(gated?' <span class="objref" style="margin-bottom:0">Answer Q'+qi+' first</span>':'')+'</p>'+q.opts.map((o,oi)=>{
      let cls="quizopt";if(done){cls+=(oi===chosen?(oi===q.c?" sel-right":" sel-wrong"):"");}
      return '<button type="button" class="'+cls+'" data-act="quiz" data-qi="'+qi+'" data-oi="'+oi+'"'+((done||gated)?" disabled":"")+'>'+o+'</button>';}).join("")
      +'<div class="qwhy'+(done?" show":"")+'"><strong>'+(done?(chosen===q.c?"Correct.":"Not quite."):"")+'</strong> '+q.why+'</div></div>';});
  h+='<div class="card"><h3>Score</h3><p>'+answered+' of '+total+' answered · correct: '+list.reduce((a,q,qi)=>a+((S.quiz[qi]===q.c)?1:0),0)+'</p><p style="font-size:13px;color:var(--ink2)">Answers lock once submitted and questions unlock in order. The quiz feeds your completion report — finish the desks first, then this, then close with “Finish audit” in the tracker.</p></div></div>';
  return h;}

function renderDebrief(){
  let h='<div class="stage-head"><div class="inner"><span class="stage-chip">Field notes</span><h1>Debrief — what a defender keeps</h1><p class="stage-sub">Detection opportunities · mitigations with official IDs · both mindsets</p></div></div><div class="desk-body">';
  h+='<div class="card"><h3>Detection opportunities</h3>'+DEBRIEF.detect.map(d=>'<div class="stage-card" style="margin-bottom:8px"><h4>'+d[0]+'</h4><p>'+d[1]+'</p></div>').join("")+'</div>';
  h+='<div class="card"><h3>Mitigations (official MITRE IDs, verified)</h3><table class="ledger"><thead><tr><th>ID</th><th>How it maps to this chapter</th></tr></thead><tbody>'+DEBRIEF.mitigate.map(m=>'<tr><td><span class="tagchip">'+m[0]+'</span></td><td>'+m[1]+'</td></tr>').join("")+'</tbody></table></div>';
  h+='<div class="kc-grid" style="margin-top:2px">';
  h+='<div class="card"><h3>Blue-team takeaways</h3><ul class="case-list">'+DEBRIEF.blue.map(b=>'<li>'+b+'</li>').join("")+'</ul></div>';
  h+='<div class="card"><h3>Red-team mindset (know the other side)</h3><ul class="case-list">'+DEBRIEF.red.map(b=>'<li>'+b+'</li>').join("")+'</ul></div>';
  h+='</div>';
  h+='<div class="card"><h3>Official references (open in new tab)</h3><ul class="case-list">'+DEBRIEF.links.map(l=>'<li><a href="'+l[0]+'" target="_blank" rel="noopener">'+l[1]+'</a></li>').join("")+'</ul><h3 style="margin-top:14px">Learn next</h3><ul class="case-list">'+DEBRIEF.next.map(n=>'<li>'+n+'</li>').join("")+'</ul></div>';
  h+='</div>';return h;}

/* ---------- tracker ---------- */
function renderTracker(){const list=objs();const total=list.length;const done=list.filter(o=>(S.obj[o.id]||{}).done).length;
  let h='<h2>Objectives tracker · '+done+'/'+total+'</h2><div class="pillar-legend">'+Object.keys(P).map(k=>'<span class="pillbadge">'+k+'</span> '+P[k]).join(" · ")+'</div>';
  list.forEach(o=>{const r=S.obj[o.id]||{hints:0,done:false,ok:null,msg:""};const open=S.open.includes(o.id);
    h+='<div class="objcard'+(r.done?" done":"")+(open?" open":"")+'" id="objc-'+o.id+'">'
      +'<button type="button" class="oh" data-act="open-obj" data-obj="'+o.id+'" aria-expanded="'+open+'"><span class="oid">'+o.id+'</span>'
      +'<span class="pillbadge" title="'+P[o.pillar]+'">'+o.pillar+'</span><span class="otitle">'+o.title+'</span>'
      +'<span class="ostatus '+(r.done?"ok":"pending")+'">'+(r.done?"PASS":"pending")+'</span></button>'
      +'<div class="obody"><p class="odesc">'+o.desc+'</p>'
      +'<div class="objbtns"><button type="button" class="mini-check" data-act="check" data-obj="'+o.id+'">Check</button>'
      +'<button type="button" class="mini-hint" data-act="hint" data-obj="'+o.id+'">'+(S.mode==="medium"?"Hint ("+r.hints+"/3)":"Nudge ("+r.hints+"/1)")+'</button>'
      +'<button type="button" class="mini-hint" data-act="goto" data-st="'+o.desk+'">Open desk</button></div>'
      +'<div class="hintbox" data-hb="'+o.id+'"></div>'
      +'<div class="feedback'+(r.msg?" show":"")+(r.ok===true?" pass":r.ok===false?" fail":"")+'" data-fb="'+o.id+'">'+(r.ok===true?'<span class="stamp">Pass</span>':r.ok===false?'<span class="stamp">Retry</span>':'')+(r.msg||"")+'</div>'
      +'</div></div>';});
  h+='<button type="button" class="finishbtn" data-act="finish">'+(done===total?"Finish audit — see your score":"Finish audit ("+(total-done)+" objectives remaining)")+'</button>';
  $("#tracker").innerHTML=h;}

function finishAudit(trigger){const list=objs();const done=list.filter(o=>(S.obj[o.id]||{}).done);
  if(done.length<list.length){toast("Complete all objectives first — "+(list.length-done.length)+" remaining.");return;}
  S.finished=true;save();
  const listQ=QUIZ[S.mode];const qAnswered=Object.keys(S.quiz).length;
  const qCorrect=listQ.reduce((a,q,qi)=>a+((S.quiz[qi]===q.c)?1:0),0);
  const stars=starCount();
  const recap={P1:[],P2:[],P3:[],P4:[]};list.forEach(o=>{if((S.obj[o.id]||{}).done)recap[o.pillar].push(o.id+" · "+o.title);});
  const focus=[];
  list.forEach(o=>{const r=S.obj[o.id]||{};const retried=(r.attempts||0)>1;const hinted=(r.hints||0)>0;
    if(retried||hinted){const bits=[];if(retried)bits.push(((r.attempts||1)-1)+" retr"+(((r.attempts||1)-1)===1?"y":"ies"));if(hinted)bits.push(r.hints+(S.mode==="medium"?" hint(s)":" nudge(s)"));
      focus.push({t:o.id+" · "+o.title+" ("+bits.join(", ")+")",d:"Revisit the "+(DESK_NAMES[o.desk]||o.desk)+" and rework this task before the exam."});}});
  if(qAnswered<listQ.length)focus.push({t:"Knowledge check incomplete ("+qAnswered+"/"+listQ.length+" answered)",d:"Finish the quiz — it validates recall of the chapter's core concepts."});
  listQ.forEach((q,qi)=>{if(S.quiz[qi]!==undefined&&S.quiz[qi]!==q.c)focus.push({t:"Quiz item "+(qi+1)+" ("+q.topic+")",d:"Re-answer it after reviewing the matching desk; the explanation sits under the item."});});
  const pstats={P1:[0,0],P2:[0,0],P3:[0,0],P4:[0,0]};list.forEach(o=>{const r=S.obj[o.id]||{};pstats[o.pillar][1]++;if(r.firstTry)pstats[o.pillar][0]++;});
  $("#doneBody").innerHTML=
    '<p style="font-size:15px"><strong>Audit complete.</strong> '+done.length+'/'+list.length+' objectives passed in '+S.mode+' mode.'
    +(qAnswered?' Quiz: '+qCorrect+'/'+listQ.length+' correct.':' Quiz not taken — it feeds your knowledge score.')+'</p>'
    +'<div class="stars" aria-label="'+stars+' of 5 stars">'+"★".repeat(stars)+'<span class="dim">'+"★".repeat(5-stars)+'</span></div>'
    +'<p style="font-size:12.5px;color:var(--ink2)">Stars: first-attempt accuracy across all objectives ('+list.filter(o=>(S.obj[o.id]||{}).firstTry).length+'/'+list.length+' first-try), minus '+ (S.mode==="medium"?"0.25":"0.5") +' per hint/nudge used.</p>'
    +'<p style="font-size:12.5px;color:var(--ink2)">First-try by pillar: '+Object.keys(pstats).map(k=>k+" "+pstats[k][0]+"/"+pstats[k][1]).join(" · ")+'</p>'
    +'<h3 style="margin-top:14px">Focus areas</h3>'
    +(focus.length?'<ul class="case-list">'+focus.map(f=>'<li><strong>'+f.t+'</strong> — '+f.d+'</li>').join("")+'</ul>':'<p>No focus areas flagged: every objective passed on the first attempt, no hints or nudges were used, and the quiz is fully correct. Sharpen speed next — re-run the desks in '+ (S.mode==="medium"?"Hard mode":"Medium mode to drill recall") +'.</p>')
    +'<div class="recap"><div><h4>P1 Understand</h4><ul>'+recap.P1.map(x=>'<li>'+x+'</li>').join("")+'</ul></div><div><h4>P2 Recognize / Analyze</h4><ul>'+recap.P2.map(x=>'<li>'+x+'</li>').join("")+'</ul></div><div><h4>P3 Detect</h4><ul>'+recap.P3.map(x=>'<li>'+x+'</li>').join("")+'</ul></div><div><h4>P4 Mitigate</h4><ul>'+recap.P4.map(x=>'<li>'+x+'</li>').join("")+'</ul></div></div>'
    +'<div class="cert"><div class="barcode"></div><p style="margin:10px 0 2px;font-weight:800;letter-spacing:.08em;text-transform:uppercase">Asset Audit Certificate</p>'
    +'<p style="margin:0;font-size:13px;color:var(--ink2)">The Registry · Corvane Mutual Insurance training simulation · '+S.mode+' mode · CompTIA Security+ SY0-801 Objective 4.2 scope exercised end to end.</p></div>'
    +'<h3 style="margin-top:16px">Learn next</h3><ul class="case-list">'+DEBRIEF.next.map(n=>'<li>'+n+'</li>').join("")+'</ul>'
    +'<div style="margin-top:14px"><button type="button" class="checkbtn" data-act="goto" data-st="debrief" id="modalGoDebrief">Review the debrief</button> <button type="button" class="hintbtn" data-act="close" data-close="doneModal">Close</button></div>';
  openModal("doneModal",trigger);announce("Audit complete. "+stars+" of 5 stars.");}

let lastTrigger=null;
function openModal(id,trigger){const m=document.getElementById(id);m.hidden=false;lastTrigger=trigger||null;const btn=m.querySelector(".closebtn");if(btn)btn.focus();}
function closeModal(id){const m=document.getElementById(id);if(m.hidden)return;m.hidden=true;if(lastTrigger&&document.body.contains(lastTrigger)){try{lastTrigger.focus();}catch(e){}}lastTrigger=null;}

/* Re-render the station while preserving scroll position and focus */
function rerenderKeepScroll(focusSel){const y=window.scrollY;renderStation();window.scrollTo(0,y);if(focusSel){const el=document.querySelector(focusSel);if(el)el.focus();}}
