/* ================================================================
   js/app.js
   Bootstrap + event wiring: gate advance logic, completion modal, click and
   keyboard handlers, mode gate, boot sequence.
   ================================================================ */
/* ================================================================
   GATE ADVANCE LOGIC
   ================================================================ */
function gateVerdict(tid,n,msg,ok){S.gv[tid+"-"+n]={ok,msg};
 const box=document.querySelector(`[data-vf="${tid}-${n}"]`);
 if(box){box.className="verdict "+(ok?"ok":"no");box.innerHTML=(ok?"✓ ":"✗ ")+esc(msg);}
 if(!ok)toast("✗ "+msg);
}
function vd(key){const g=S.gv&&S.gv[key];return `<div class="verdict ${g?(g.ok?"ok":"no"):""}" data-vf="${key}">${g?((g.ok?"✓ ":"✗ ")+esc(g.msg)):""}</div>`;}
function logAudit(tid,line){const e=E(tid);e.log=e.log||[];e.log.push(line);}
function advanceGate(tid){
 const e=E(tid),f=e.f,t=TICKETS[tid],st=e.stage;
 const stamp=(10+st)+":0"+st;
 if(tid==="SR-0917"){
  if(f.type!=="service request"){gateVerdict(tid,0,f.type?"That's a service request — laptops and tokens never enter the change pipeline; the service desk owns them. Route it there.":"Classify the item first.",false);return;}
  e.stage=1;logAudit(tid,"[Nov 6 09:05] routed to service desk — not a network change");gateVerdict(tid,0,"Routed to the service desk. Keeping it out of the change pipeline is itself correct process.",true);announce("SR-0917 routed to service desk");renderAll();return;
 }
 if(st===0){
  if(f.type!==t.correctType){gateVerdict(tid,0,"Classification is wrong for this request — re-read it against the type table in Knowledge Core card 2.",false);return;}
  e.stage=1;logAudit(tid,"[Nov 6 "+stamp+"] intake complete — classified "+String(f.type).toUpperCase());announce(tid+" intake complete");renderAll();return;
 }
 if(st===1){
  const prob=[];
  if(t.affectedOk&&!(t.affectedPrefilled===mode())&&!eqSet(f.affected,t.affectedOk))prob.push("impact analysis (affected systems)");
  if(tid==="CHG-0418"&&mode()==="medium"&&f.risk!=="high")prob.push("risk level");
  if(tid==="CHG-0418"&&mode()==="medium"&&f.rollback!=="downgrade")prob.push("rollback plan");
  if(tid==="CHG-0418"&&mode()==="hard"&&!(e.seq.length===6&&e.seq.join(",")==="0,1,2,3,4,5"))prob.push("rollback sequence (6 steps, in order)");
  if(tid==="CHG-0419"&&f.cfgsource!=="backup")prob.push("configuration restore source");
  if(tid==="CHG-0421"&&!(eqSet(f.rfcmiss,t.rfcMissingOk)&&f.purpose==="p1"&&f.rollback==="r1"&&f.test==="t1"))prob.push("RFC repair (missing elements + purpose + rollback + test plan)");
  if(tid==="CHG-0422"&&mode()==="hard"&&f.rollback!=="r1")prob.push("rollback plan");
  if(prob.length){gateVerdict(tid,1,"Gate 1 blocks the submission: "+prob.join(", ")+". The board will not review an unprepared request — that block is policy R1 doing its job.",false);return;}
  e.stage=2;logAudit(tid,"[Nov 6 "+stamp+"] risk & impact recorded — submitted to board");announce(tid+" submitted to board");renderAll();return;
 }
 if(st===2){
  if(tid==="CHG-0419"){e.stage=3;logAudit(tid,"[Nov 6 "+stamp+"] pre-approved (standard catalog SC-114)");announce(tid+" pre-approved");renderAll();return;}
  if(tid==="CHG-0424"){
   if(f.decision!=="reject"){gateVerdict(tid,2,"Approving a core-switch swap with no rollback, no test plan and no affected-systems list contradicts R1 — the board REJECTS and coaches. Re-planned work can come back.",false);return;}
   e.stage=8;logAudit(tid,"[Nov 6 "+stamp+"] REJECTED by board — no fallback, no plan; requester coached");announce("CHG-0424 rejected");renderAll();return;
  }
  if(f.decision!=="approve"){gateVerdict(tid,2,f.decision==="defer"?"Deferral is the right call only while the request is unready — repair what's missing, then bring it back for approval.":"This request is ready and planned — the board approves it. (Deferring or rejecting planned work is how windows go unused.)",false);return;}
  if(tid==="CHG-0423"&&f.empathy!=="e1"){gateVerdict(tid,2,"Emergency ≠ unapproved: the duty manager approves NOW and the board reviews retroactively within 24 h (R3).",false);return;}
  if(mode()==="hard"&&["CHG-0418","CHG-0420","CHG-0421","CHG-0422"].includes(tid)&&f.justify!=="j1"){gateVerdict(tid,2,"Approvals are recorded WITH reasons — pick the justification that matches the policy basis (tested fallback / sandbox pass / repaired RFC).",false);return;}
  e.stage=3;logAudit(tid,"[Nov 6 "+stamp+"] approved by "+(tid==="CHG-0423"?"NOC duty manager (expedite, retro-CAB ≤24h)":"change board"));announce(tid+" approved");renderAll();return;
 }
 if(st===3){
  if(tid==="CHG-0418"&&f.window!=="B"){gateVerdict(tid,3,f.window?"That window violates R4 (weekend overnight, ≥ estimate + rollback time).":"Pick the window from the calendar slots.",false);return;}
  e.stage=4;logAudit(tid,"[Nov 6 "+stamp+"] window locked — staged for implementation");announce(tid+" scheduled");renderAll();return;
 }
 if(st===5){
  if(!eqSet(f.monitor,t.monOk||[])){gateVerdict(tid,5,"Telemetry selection doesn't prove this change: choose only the signals that map to the SERVICE it touched.",false);return;}
  e.stage=6;logAudit(tid,"[Nov 6 "+stamp+"] validation recorded — telemetry "+(f.monitor||[]).join(" + "));announce(tid+" validated");renderAll();return;
 }
 if(st===6){
  const prob=[];
  if(t.docField&&f.doc!==t.docField.ok)prob.push(t.docField.label);
  if(tid==="CHG-0421"){if(f.ipam!=="i1")prob.push("IPAM record");if(f.schema!=="sc1")prob.push("schema classification");}
  if(tid==="CHG-0422"&&!S.topoInstalled)prob.push("topology diagram update");
  if(prob.length){gateVerdict(tid,6,"Documentation gate blocks the close: "+prob.join(", ")+". Policy R6: the record must match reality before the request closes.",false);return;}
  e.stage=7;logAudit(tid,"[Nov 6 "+stamp+"] documentation updated — request CLOSED");
  gateVerdict(tid,6,"✓ "+tid+" closed — validated and documented. The next incident response (and the next audit) will thank this record.",true);
  announce(tid+" closed");renderAll();maybeCompletion();return;
 }
}
function runExec(tid){
 const e=E(tid),t=TICKETS[tid];
 if(tid==="CHG-0420"){
  if(!e.sandbox){gateVerdict(tid,4,"Locked: sandbox lease regression must run first (policy R5).",false);return;}
  if(e.rolledBack){gateVerdict(tid,4,"Service is stable on 2.89 after the rollback — no re-deploy tonight. Close it as attempted → failed → reverted.",false);return;}
  if(e.deployed){return;}
  e.deployed=true;
  const lines=mode()==="hard"?t.execLinesFail:t.execLines;
  playLines(tid,lines,()=>{
   if(mode()==="hard"){e.deployFailed=true;gateVerdict(tid,4,"Telemetry shows a regression: 12% of depot clients fail lease renewal. Execute the rollback plan — that's what it's for.",false);}
   else{e.stage=5;logAudit(tid,"[Nov 11 01:05] implemented — validation next");announce("CHG-0420 implemented");}
   renderAll();
  });
  return;
 }
 if(tid==="CHG-0423"&&!e.notified){gateVerdict(tid,4,"Emergency path still requires notifications before implementation (policy R3).",false);return;}
 if(e.stage!==4){gateVerdict(tid,4,"The request isn't at its implementation gate yet.",false);return;}
 playLines(tid,t.execLines,()=>{e.stage=5;logAudit(tid,"[window] implemented during window");announce(tid+" implemented");renderAll();});
}
function playLines(tid,lines,done){
 const e=E(tid);if(e.playing)return;e.playing=true;e.log=[];let i=0;
 const step=()=>{if(i<lines.length){e.log.push(lines[i]);const c=document.querySelector(`[data-console="${tid}"]`);if(c)c.textContent=e.log.map(x=>x+"\n").join("");announce(lines[i]);i++;setTimeout(step,340);}else{e.playing=false;setTimeout(done,320);}};
 step();
}
function maybeCompletion(){if(allObjDone()&&!S.completionShown){setTimeout(openCompletion,600);}}
/* ---- completion modal ---- */
function stars(){
 const list=objs();let first=0,hints=0;
 list.forEach(o=>{const st=OBJ(o.id);if(st.attempts<=1&&st.done)first++;hints+=st.hints;});
 const pct=first/list.length;
 let s;if(pct>=0.9&&hints===0)s=5;else if(pct>=0.75&&hints<=3)s=4;else if(pct>=0.5)s=3;else s=2;
 return {s,pct,hints};
}
function focusAreas(){
 const list=objs();
 const items=[];
 list.forEach(o=>{const s=OBJ(o.id);if(s.done&&(s.attempts>1||s.hints>0))items.push(`<li><b>${o.id}</b> — needed ${s.attempts} check${s.attempts>1?"s":""}${s.hints?` and ${s.hints} hint${s.hints>1?"s":""}`:""}. Re-read its feedback in the Objectives tracker and the Knowledge Core card it points to.</li>`);});
 const quiz=QUIZ[mode()];
 quiz.forEach((q,i)=>{
  if(S.quiz.checked[i]===false)items.push(`<li><b>Quiz ${i+1}</b> (${q.t}) — answered wrong. Review the explanation under the question, then the matching Knowledge Core card.</li>`);
  if(S.quiz.checked[i]==null)items.push(`<li><b>Quiz ${i+1}</b> (${q.t}) — still unanswered. Scroll to the Knowledge Check and complete it.</li>`);
 });
 if(!items.length)items.push("<li>Clean run — no weak areas detected. Replay in the other mode to stretch further.</li>");
 return items.join("");
}
function openCompletion(){
 S.completionShown=true;save();
 const st=stars();const qc=QUIZ[mode()].filter((q,i)=>S.quiz.checked[i]===true).length;
 const by={P1:[],P2:[],P3:[],P4:[]};objs().forEach(o=>{if(OBJ(o.id).done)by[o.pillar].push(o.id);});
 const names={P1:"Understand",P2:"Recognize / Analyze",P3:"Detect",P4:"Mitigate"};
 $("#modalTitle").textContent="Shift complete — debrief";
 $("#modalBody").innerHTML=`
  <div class="stars" aria-label="${st.s} of 5 stars">${"★".repeat(st.s)}${"☆".repeat(5-st.s)}</div>
  <p><b>${objDoneCount()}/${objs().length}</b> objectives · quiz <b>${qc}/${QUIZ[mode()].length}</b> · first-attempt checks <b>${Math.round(st.pct*100)}%</b> · hints used <b>${st.hints}</b></p>
  <div class="dcard" style="margin:10px 0"><h4>Focus areas — where to push next</h4><ul style="margin:0;padding-left:18px;color:var(--dim)">${focusAreas()}</ul></div>
  <p class="small">You can now: explain the request lifecycle and its gates; read and repair an RFC; classify standard/normal/emergency/service-request work; detect unauthorized changes via config diffs and the audit trail; and run a board decision, window, rollback and documentation cascade with reasons. That is objective 3.1's change-management bullet, end to end.</p>
  <div class="dgrid">${Object.keys(by).map(p=>`<div class="dcard"><h4>${p} · ${names[p]}</h4><p class="mono small">${by[p].join(" · ")||"—"}</p></div>`).join("")}</div>
  <p class="small" style="margin-top:10px"><b>Learn next:</b> N10-009 objective 3.1's remaining bullets (documentation &amp; IPAM), objective 3.2 “use network monitoring technologies” (configuration monitoring is the drift detector you just used), and 5.1 troubleshooting methodology.</p>`;
 $("#modalBtns").innerHTML=`<button class="btn primary" data-act="closeModal">Back to the desk</button><button class="btn" data-act="doReset">Reset &amp; replay other mode</button>`;
 $("#modal").hidden=false;$("#modal").classList.add("open");
 announce("Shift complete. "+st.s+" of 5 stars. Focus areas listed in the debrief.");
}

/* ================================================================
   EVENTS
   ================================================================ */
document.addEventListener("click",ev=>{
 const el=ev.target.closest("[data-act]");
 if(!el)return;
 const act=el.dataset.act;
 if(act==="chip"){
  const tid=el.dataset.tid,key=el.dataset.key,val=el.dataset.val;
  let arr;
  if(tid==="DRIFT"&&key==="ds"){arr=S.drift.ds;}
  else{arr=F(tid)[key]=F(tid)[key]||[];}
  const i=arr.indexOf(val);if(i>=0)arr.splice(i,1);else arr.push(val);
  el.setAttribute("aria-pressed",String(arr.includes(val)));renderAll();return;
 }
 if(act==="choice"){F(el.dataset.tid)[el.dataset.key]=el.dataset.val;renderAll();return;}
 if(act==="driftDev"){S.drift.device=el.dataset.val;renderAll();return;}
 if(act==="win"){F("CHG-0418").window=el.dataset.slot;renderAll();return;}
 if(act==="selectTicket"){S.active=el.dataset.tid;renderAll();const wb=document.getElementById("workbench");if(wb)wb.scrollIntoView({behavior:"smooth",block:"nearest"});return;}
 if(act==="advance"){advanceGate(el.dataset.tid);return;}
 if(act==="exec"){runExec(el.dataset.tid);return;}
 if(act==="sandbox"){const e=E(el.dataset.tid);if(e.sandbox)return;e.sandbox=1;toast("Sandbox regression: <span class='mono'>5,000 leases OK · DNS resolution OK</span> — production deploy unlocked.");logAudit(el.dataset.tid,"[lab] sandbox lease regression passed");announce("Sandbox regression passed");renderAll();return;}
 if(act==="rollbackRun"){const e=E(el.dataset.tid);if(!e.deployFailed||e.rolledBack)return;playLines(el.dataset.tid,TICKETS[el.dataset.tid].rollbackLines,()=>{e.rolledBack=true;e.stage=5;logAudit(el.dataset.tid,"[01:12] ROLLBACK executed — stable on 2.89");announce("Rollback executed — service stable");renderAll();});return;}
 if(act==="notify"){const e=E(el.dataset.tid);if(e.notified)return;e.notified=true;toast("Notifications sent: <span class='mono'>helpdesk · 3 depots · security officer</span> (policy R3).");announce("Notifications sent");renderAll();return;}
 if(act==="seqStep"){const tid=el.dataset.tid,idx=parseInt(el.dataset.idx,10);const e=E(tid);const at=e.seq.indexOf(idx);
  if(at>=0)e.seq.splice(at,1);else e.seq.push(idx);
  el.classList.add("shake");setTimeout(()=>el.classList.remove("shake"),350);renderAll();return;}
 if(act==="markFw"){S.drift.fwOk=true;toast("Marked: FW-B banner diff is <span class='mono'>authorized per CHG-0416</span> — reviewed, not drift.");renderAll();return;}
 if(act==="markFlap"){S.drift.flapOk=true;toast("Marked: Gi1/0/17 flap is a <span class='mono'>carrier issue (NET-2211)</span> — unrelated to change activity.");renderAll();return;}
 if(act==="evTab"){S.evTab=el.dataset.tab;renderEV();save();return;}
 if(act==="cfgTab"){S.cfgTab=el.dataset.dev;renderEV();save();return;}
 if(act==="checkObj"){const id=el.dataset.oid;const o=objs().find(x=>x.id===id);if(!o)return;objResult(o,V[o.v]());return;}
 if(act==="hintObj"){const id=el.dataset.oid;const o=objs().find(x=>x.id===id);const st=OBJ(id);
  const max=mode()==="medium"?3:1;
  if(st.hints>=max){toast(mode()==="medium"?"That's all three hint tiers for this objective.":"Night shift allows ONE nudge per objective — and you've used it.");return;}
  st.hints++;
  const box=document.querySelector(`[data-hb="${id}"]`);
  if(box){box.classList.add("show");box.innerHTML="<b>Hint "+st.hints+"/"+max+":</b> "+esc(o.hints[st.hints-1]||o.hints[0]);}
  renderTop();save();return;}
 if(act==="quizOpt"){const qi=el.dataset.qi;if(S.quiz.checked[qi]!=null)return;S.quiz.pick[qi]=parseInt(el.dataset.oi,10);renderQuiz();save();return;}
 if(act==="quizCheck"){const qi=el.dataset.qi;const q=QUIZ[mode()][qi];const pick=S.quiz.pick[qi];
  if(pick==null)return;S.quiz.checked[qi]=(pick===q.c);renderQuiz();renderTop();save();
  announce(pick===q.c?"Correct":"Not quite — read the explanation");return;}
 if(act==="acc"){const body=el.nextElementSibling;if(!body)return;const open=!body.hidden;body.hidden=open;el.setAttribute("aria-expanded",String(!open));el.firstElementChild.textContent=open?"▸":"▾";return;}
 if(act==="tipClose"){S.tipClosed=true;renderTop();save();return;}
 if(act==="openCompletion"){openCompletion();return;}
 if(act==="doReset"){requestReset();return;}
 if(act==="closeModal"){$("#modal").classList.remove("open");$("#modal").hidden=true;return;}
});
document.addEventListener("change",ev=>{
 const el=ev.target;
 if(el&&el.matches&&el.matches("select[data-bind]")){
  const parts=el.dataset.bind.split("|");const scope=parts[0],key=parts[1];
  if(scope==="CONCEPT"){S.concept[key]=el.value;renderKB();save();return;}
  if(scope==="DRIFT"){S.drift[key]=el.value;renderAll();save();return;}
  F(scope)[key]=el.value;
  renderAll();
 }
});
/* topology candidate link */
document.addEventListener("click",ev=>{
 const cand=ev.target.closest("#candLink");
 if(!cand||S.topoInstalled)return;
 if(stageOf("CHG-0422")<4){toast("Not yet: you can only document a link that exists. Implement <span class='mono'>CHG-0422</span> first, then activate the candidate uplink here.");return;}
 S.topoInstalled=true;toast("Topology updated: <span class='mono'>HQ-CORE-01 ↔ FW-B uplink · VRRP VIP 10.10.0.1</span> — documented per R6.");announce("Topology diagram updated");renderAll();
});
/* drawer + scrim close */
document.addEventListener("click",ev=>{
 if(ev.target.closest("[data-close-drawer]")){$("#objDrawer").classList.remove("open");$("#objDrawer").hidden=true;}
});
$("#objPill").addEventListener("click",()=>{renderOBJ();$("#objDrawer").hidden=false;$("#objDrawer").classList.add("open");});
$("#kbBtn").addEventListener("click",()=>{$("#knowledge").scrollIntoView({behavior:"smooth"});});
$("#startBtn").addEventListener("click",()=>{S.floorOpened=true;renderTop();save();$("#floor").scrollIntoView({behavior:"smooth"});});
/* modal scrim + reset */
document.addEventListener("click",ev=>{
 const m=$("#modal");
 if(!m.classList.contains("open"))return;
 if(ev.target.dataset&&ev.target.dataset.closeModal!==undefined){m.classList.remove("open");m.hidden=true;}
});
function requestReset(){
 $("#modalTitle").textContent="Reset the lab?";
 $("#modalBody").innerHTML="<p>This clears your mode, every objective, all ticket states, quiz answers and saved progress — back to the pristine mode-selection screen.</p>";
 $("#modalBtns").innerHTML=`<button class="btn bad" data-act="doResetConfirm">Yes — reset everything</button><button class="btn" data-act="closeModal">Cancel</button>`;
 $("#modal").hidden=false;$("#modal").classList.add("open");
}
document.addEventListener("click",ev=>{
 if(ev.target.closest("#resetBtn")){requestReset();return;}
 if(ev.target.closest("[data-act='doResetConfirm']")){
  try{localStorage.removeItem(LS_KEY);}catch(e){}
  S=freshState();
  $("#modal").classList.remove("open");$("#modal").hidden=true;
  $("#lab").hidden=true;$("#modeGate").hidden=false;
  window.scrollTo({top:0,behavior:"smooth"});
 }
});
/* mode selection */
document.querySelectorAll(".modecard").forEach(card=>{
 card.addEventListener("click",()=>{
  S=freshState();S.mode=card.dataset.mode;
  objs().forEach(o=>OBJ(o.id));
  $("#modeGate").hidden=true;$("#lab").hidden=false;
  renderAll();
  window.scrollTo({top:0});
  announce("Lab started in "+S.mode+" mode");
 });
});
/* boot */
load();
if(S.mode){$("#modeGate").hidden=true;$("#lab").hidden=false;renderAll();}
else{$("#modeGate").hidden=false;}
/* keyboard: Escape closes drawer/modal; Enter/Space activates the candidate topology link */
document.addEventListener("keydown",ev=>{
 if(ev.key==="Enter"||ev.key===" "){
  const t=ev.target;
  if(t&&t.id==="candLink"){ev.preventDefault();t.dispatchEvent(new MouseEvent("click",{bubbles:true}));return;}
 }
 if(ev.key!=="Escape")return;
 const d=$("#objDrawer");if(d.classList.contains("open")){d.classList.remove("open");d.hidden=true;}
 const m=$("#modal");if(m.classList.contains("open")&&!m.hidden){m.classList.remove("open");m.hidden=true;}
});




