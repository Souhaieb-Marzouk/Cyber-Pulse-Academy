/* ============================================================================
   OBJECTIVES — CHECK RESULTS validation engine: per-objective recording,
   tracker/progress rendering, dock unlock chain, hint/nudge spenders, star math,
   and every per-dock validator (artifacts, yard, campaign, planner, policy,
   sequences, matcher, remote pack, anomalies, dashboard, spike). */
function recordCheck(objId, ok, msgEl, okTitle, okBody, badTitle, badBody){
  const o=state.objectives[objId];
  o.attempts+=1;
  if(ok){
    o.firstTry = o.attempts===1;
    o.done=true;
    setMsg(msgEl,true,okTitle||"Correct",okBody);
    const host=msgEl.closest(".workorder, .wo-checkzone, .panel-body");
    const stampHost=host && host.querySelector ? host.querySelector(".wo-status") : null;
    if(stampHost && !stampHost.innerHTML) stampHost.innerHTML='<span class="stamp">Checked ✓</span>';
    toast("Objective "+objId+" stamped — "+((state.mode==="hard"?OBJ_HARD:OBJ_MED).find(x=>x.id===objId)||{text:""}).text.slice(0,60)+"…");
  }else{
    o.done=false;
    setMsg(msgEl,false,badTitle||"Try again",badBody);
  }
  updateProgress();
  refreshTracker();
  updateUnlock();
  queueSave();
  return ok;
}

/* ---- progress + tracker ---- */

function activeObjs(){ return state.mode==="hard"?OBJ_HARD:OBJ_MED; }

function doneCount(){ return activeObjs().filter(o=>state.objectives[o.id].done).length; }

function updateProgress(){
  const total=activeObjs().length, done=doneCount();
  const pct=Math.round(done/total*100);
  const meter=document.getElementById("progress-meter");
  meter.setAttribute("aria-valuenow",pct);
  meter.querySelector("i").style.width=pct+"%";
  document.getElementById("progress-num").textContent=done+" / "+total+" objectives · "+pct+"% stamped";
  const finishBtn=document.getElementById("btn-finish");
  const quizDone=state.quiz.done;
  if(done===total){ finishBtn.style.display="inline-block"; finishBtn.textContent = quizDone? "Load out · finish" : "Load out · finish (Inspection pending)"; }
  else finishBtn.style.display="none";
}

function refreshTracker(){
  const t=document.getElementById("tracker-list"); if(!t) return;
  t.innerHTML=activeObjs().map(o=>{
    const st=state.objectives[o.id];
    return '<div class="tritem '+(st.done?"done":"")+'"><span class="oid">'+o.id+'</span><span class="p'+o.pillar.slice(1)+'">'+o.pillar+'</span><span>'+esc(o.text)+'</span></div>';
  }).join("");
  DOCK_ORDER.forEach(d=>{
    const mark=document.querySelector('[data-done="'+d+'"]');
    if(!mark) return;
    const objs=DOCK_OBJ[d];
    if(d==="quiz"){ mark.textContent=state.quiz.done?"✓":""; }
    else if(d==="debrief"){ mark.textContent=(state.visitedDocks.debrief)?"✓":""; }
    else if(objs.length===0){ mark.textContent=(state.visitedDocks[d])?"✓":""; }
    else mark.textContent=(objs.every(id=>state.objectives[id].done))?"✓":"";
  });
}

function buildTracker(){
  const stage=document.getElementById("stage");
  if(document.getElementById("panel-tracker")) return;
  const sec=document.createElement("section");
  sec.className="panel"; sec.id="panel-tracker"; sec.dataset.panel="tracker";
  sec.innerHTML='<div class="panel-head"><span class="tag">Manifest</span><h2>Manifest of Objectives</h2>'+
    '<p class="sub">Live status of every work order. Pillar badges: <b>P1</b> Understand · <b>P2</b> Recognize · <b>P3</b> Detect · <b>P4</b> Mitigate.</p></div>'+
    '<div class="panel-body"><div class="trlist" id="tracker-list"></div></div>';
  stage.insertBefore(sec, stage.firstChild);
  refreshTracker();
}

/* ---- views / unlock ---- */

function dockUnlocked(dock){
  if(state.mode==="hard") return true;
  if(dock==="binder") return true;
  const idx=DOCK_ORDER.indexOf(dock);
  for(let i=0;i<idx;i++){
    const prev=DOCK_ORDER[i];
    if(prev==="quiz"){ if(!state.quiz.done) return false; continue; }
    const objs=DOCK_OBJ[prev];
    if(objs.length && !objs.every(id=>state.objectives[id].done)) return false;
    if(objs.length===0 && prev!=="quiz" && !state.visitedDocks[prev] && prev!=="debrief") { /* binder handled by M1 */ }
  }
  return true;
}

function nextTarget(){
  if(state.mode==="hard") return null;
  for(const d of DOCK_ORDER){
    if(d==="debrief") continue;
    if(d==="quiz"){ if(!state.quiz.done) return "quiz"; continue; }
    const objs=DOCK_OBJ[d];
    if(objs.length===0){ if(!state.visitedDocks[d]) return d; continue; }
    if(!objs.every(id=>state.objectives[id].done)) return d;
  }
  return "quiz";
}

function updateUnlock(){
  document.querySelectorAll("#docklist button").forEach(b=>{
    b.disabled=!dockUnlocked(b.dataset.view);
  });
  const pulse=nextTarget();
  document.querySelectorAll("#docklist button").forEach(b=>{
    b.classList.toggle("pulse", state.mode==="medium" && !b.disabled && b.dataset.view===pulse && b.dataset.view!==state.view);
  });
}

/* ---- hints ---- */

function hintButtons(objId, hardNudgeText){
  const o=state.objectives[objId];
  if(state.mode==="hard"){
    return '<div class="hintbar"><button class="btn small ghost" data-nudge="'+objId+'" type="button">'+
      (o.hints>0?"Nudge spent":"Spend the one allowed nudge (costs score)")+'</button>'+
      '<div class="hintbox" id="nudge-'+objId+'">'+(o.hints>0?esc(NUDGES[objId]||""):"")+'</div></div>';
  }
  const hs=HINTS[objId]||[];
  let out='<div class="hintbar">';
  for(let i=0;i<hs.length;i++){
    out+='<button class="btn small ghost" data-hint="'+objId+':'+i+'" type="button">Hint '+(i+1)+'</button>';
  }
  out+='<div class="hintbox" id="hintbox-'+objId+'"></div></div>';
  return out;
}

function onHintClick(btn){
  const [objId,idxS]=btn.dataset.hint.split(":");
  const idx=parseInt(idxS,10);
  const o=state.objectives[objId];
  if(o.hints>idx) o.hints=idx+1;
  if(o.hints<idx+1){ o.hints=idx+1; state.hintsUsed+=1; }
  const box=document.getElementById("hintbox-"+objId);
  box.classList.add("show");
  box.innerHTML="<b>Hint "+(idx+1)+" of 3:</b> "+esc(HINTS[objId][idx]);
  btn.disabled=true; btn.classList.add("stamped");
  updateProgress(); refreshTracker(); queueSave();
}

function onNudgeClick(btn){
  const objId=btn.dataset.nudge;
  const o=state.objectives[objId];
  if(o.hints>0) return;
  o.hints=1; state.nudgesUsed+=1;
  const box=document.getElementById("nudge-"+objId);
  box.classList.add("show"); box.innerHTML="<b>Nudge (score cost logged):</b> "+esc(NUDGES[objId]||"");
  btn.disabled=true; btn.classList.add("stamped"); btn.textContent="Nudge spent";
  toast("Nudge spent on "+objId+" — this will cost stars at load-out.");
  updateProgress(); queueSave();
}

/* ---- stars + completion ---- */

function computeStars(){
  const objs=activeObjs();
  const misses=objs.filter(o=>{const st=state.objectives[o.id];return st.done && !st.firstTry;}).length;
  const hintPoints = state.mode==="hard" ? state.nudgesUsed*2 : state.hintsUsed;
  const missAllowance = state.mode==="hard" ? 1 : 2;
  let stars = 5 - Math.max(0, misses-missAllowance) - Math.floor(hintPoints/3);
  if(state.nudgesUsed>0) stars-=1;
  return Math.max(1, Math.min(5, stars));
}

function checkArtifact(which){
  const checkOne=a=>{const s=state.artifacts[a.id];return s&&s.t===a.t&&s.a===a.a;};
  if(which==="safe"){
    const ok=ARTIFACTS[4]&&checkOne(ARTIFACTS[4])&&checkOne(ARTIFACTS[5]);
    const msg=document.getElementById("msg-M6");
    recordCheck("M6",ok,msg,
      "both legitimate — correctly reported as safe",
      "Real domain + ticketed change (CHG-2291, real intranet host) and an established vendor thread with no urgency. "+ARTIFACTS[4].why.split(". ").slice(1).join(". "),
      "at least one flag is wrong",
      "Re-read the gateway notes: real sender domain, real link host, ticketed change, established thread. “Strange” is not “suspicious” — and neither WO-5 nor WO-6 needs an action. Set both to “Legitimate — verified safe” + “No action needed”.");
    return;
  }
  if(which==="all"){
    const wrong=ARTIFACTS.filter(a=>!checkOne(a));
    const ok=wrong.length===0;
    const msg=document.getElementById("msg-H1");
    if(ok){ recordCheck("H1",true,msg,"all six exact — the intake is clean",
      "Including the two legitimate ones — separating signal from noise is the intake skill. Near-zero false positives with zero misses is the standard the audit wants."); }
    else{ const w=wrong[0]; recordCheck("H1",false,msg,"rejected — "+wrong.length+" of 6 still wrong",
      "First miss: <b>"+w.id+"</b> ("+w.chan.toLowerCase()+"). Rationale: "+w.note+" Exact type AND exact action required — near-misses are rejected with a reason."); }
    return;
  }
  const idx=["a1","a2","a3","a4"].indexOf(which);
  const objId=["M2","M3","M4","M5"][idx];
  const a=ARTIFACTS[idx];
  const ok=checkOne(a);
  recordCheck(objId,ok,document.getElementById("msg-"+objId),
    a.t===0?"that is credential-harvest phishing, handled correctly":"correctly triaged",
    a.why,
    "not yet — look again",
    a.why.split(". ").slice(1).join(". ")+" Re-check the type and the action: the evidence is in the gateway note. (Type: "+TYPES[a.t].replace("—","–")+" · Action: "+ACTIONS[a.a]+")");
}

function checkBec(){
  const ok=state.bec.join(",")===BEC_CORRECT.join(",");
  let firstWrong=-1;
  for(let i=0;i<5;i++){ if(state.bec[i]!==BEC_CORRECT[i]){ firstWrong=i; break; } }
  recordCheck("H9",ok,document.getElementById("msg-H9"),
    "sequence exact — the finance team reacts like the playbook says",
    "Nothing goes back into the attacker’s thread; verification uses a previously known channel; the report preserves evidence while finance freezes the payment.",
    "rejected — position "+(firstWrong+1)+" is wrong",
    firstWrong>=0?"Correct step for position "+(firstWrong+1)+": “"+BEC_STEPS.find(x=>x[0]===BEC_CORRECT[firstWrong])[1]+"”. Reason: the attacker owns the email thread, so no reply may go into it, and verification must use a channel the attacker does not control.":"");
}

/* ================= DOCK 2 — YARD SWEEP ================= */

function checkYard(){
  const objId=state.mode==="medium"?"M7":"H2";
  const need=state.mode==="medium"?6:9;
  const correct=PINS.filter(p=>{const st=state.pins[p.id];return st&&st.checked&&st.ok;}).length;
  const opened=PINS.filter(p=>state.pins[p.id]&&state.pins[p.id].opened).length;
  const ok=correct>=need;
  const wrongs=PINS.filter(p=>{const st=state.pins[p.id];return st&&st.checked&&!st.ok;});
  let bad="";
  if(wrongs.length){
    const w=wrongs[0];
    bad=(state.mode==="hard")
      ? "First miss: <b>"+w.label+"</b>. "+w.teach
      : "First miss: <b>"+w.label+"</b>. Correct tag: “"+PIN_TAGS[w.risk]+"”, handling: “"+PIN_ACTIONS[w.act]+"”. "+w.teach;
  } else if(opened<9){ bad="You have inspected "+opened+" of 9 markers — sweep every room before checking."; }
  recordCheck(objId,ok,document.getElementById("msg-"+objId),
    correct+" / 9 findings correctly tagged"+(correct===9?" — the yard is clean":""),
    "Findings feed the Training Yard as real gap evidence (printer tray → data handling, bin → disposal, badge door → social-engineering brief)."+(state.mode==="medium"&&correct<9?" Extra inspected pins beyond 6 also count once correct.":""),
    ok?"":"not enough correct findings",
    ok?"":(bad||""));
}

/* ================= DOCK 3 — CAMPAIGN STUDIO ================= */

function campaignProblems(){
  const c=state.campaign, probs=[];
  if(c.payload!==CAMPAIGN_GOOD.payload) probs.push("payload should be the credential-harvest landing page (records opens only — never captures credentials)");
  if(c.audience!==CAMPAIGN_GOOD.audience) probs.push("audience should start with Finance + Dispatch — the departments the Q1 threat data flags (38- and 25-point gaps)");
  if(c.difficulty!==CAMPAIGN_GOOD.difficulty) probs.push("difficulty should escalate as report rates rise, not start at an extreme");
  if(c.cadence!==CAMPAIGN_GOOD.cadence) probs.push("cadence should be monthly and randomized — annual-only training decays within weeks");
  if(!c.reportBtn) probs.push("the one-click report button must be live — it is the program’s telemetry source");
  if(c.tone!==CAMPAIGN_GOOD.tone) probs.push("click consequences should be educational — punitive tone suppresses reporting");
  if(!c.metrics.includes("m-report")||!c.metrics.includes("m-ttr")) probs.push("metrics must include report rate AND median time-to-report — the pair that proves value");
  if(c.metrics.includes("m-names")) probs.push("publishing individual clicker names must be off — shame kills reporting");
  if(state.mode==="hard" && c.reason!==REPORT_REASON.correct) probs.push("the “why” answer is wrong — the button turns users into detection telemetry and drives report rate + time-to-report");
  return probs;
}

function checkCampaign(){
  const objId=state.mode==="medium"?"M8":"H3";
  const probs=campaignProblems();
  const ok=probs.length===0;
  recordCheck(objId,ok,document.getElementById("msg-"+objId),
    "campaign launched — config matches best practice",
    "Safe payload (opens recorded, nothing captured), data-driven audience, escalating difficulty, monthly randomized cadence, live report button, educational tone, and the KPI pair that proves value. Repeat clickers (already tracked) drop 9.2% → 4.7% by Q3.",
    "rejected — "+probs.length+" setting"+(probs.length===1?"":"s")+" still wrong",
    probs.map(p=>"• "+p).join("<br>"));
}

/* ================= DOCK 4 — TRAINING YARD ================= */

function checkPlanner(){
  const wrongGaps=GAPS.filter(g=>state.planner[g.id]!==g.correct);
  const usedDistractors=Object.values(state.planner).some(v=>v&&v.startsWith("d"));
  const ok=wrongGaps.length===0&&!usedDistractors;
  let bad="";
  if(wrongGaps.length){ const g=wrongGaps[0]; bad="First miss: gap “"+g.title+"”. The right intervention is: “"+POOL.find(p=>p[0]===g.correct)[1]+"”. Evidence: "+g.ev; }
  else if(usedDistractors) bad="A trap chip got used: annual lectures don’t build skill, name-publishing suppresses reporting, and a firewall doesn’t patch a behavior gap.";
  recordCheck("M9",ok,document.getElementById("msg-M9"),
    "all five gaps matched — and the traps stayed in the box",
    "Notice the shape: every correct intervention is behavioral (managers, modules, culture) or technical-but-people-adjacent (password managers, MFA clinics). That is what “user guidance and training” means in objective 5.6.",
    "not yet — some gaps are mismatched",
    bad);
}

function checkPolicy(){
  const need=["a-ok1","a-ok2","a-ok3"];
  const ack=state.policy.ack;
  const okA=need.every(k=>ack[k]) && !ack["a-no1"] && !ack["a-no2"];
  const okC=state.policy.chain==="c1";
  const ok=okA&&okC;
  let bad="";
  if(!okA) bad="Re-examine the boxes: a signature records expectations and supports liability defense — it cannot transfer skill (“replaces training” is false) and cannot force behavior (“guarantees compliance” is false).";
  else if(!okC) bad="Chain check: never reply through the attacker’s thread, and never spread a live phish to coworkers. Report button → security, original preserved.";
  recordCheck("M12",ok,document.getElementById("msg-M12"),
    "policy desk complete — expectations recorded, chain correct",
    "Signed acknowledgments are evidence for governance (SY0-801 5.1) and malpractice liability; the chain keeps evidence intact and stops coworker spread. Policy is the frame; training is the muscle.",
    "not yet",bad);
}

function checkSeq(){
  const ok=state.seq.join(",")===SEQ_CORRECT.join(",");
  let fw=-1;
  for(let i=0;i<6;i++){ if(state.seq[i]!==SEQ_CORRECT[i]){ fw=i; break; } }
  recordCheck("H4",ok,document.getElementById("msg-H4"),
    "rollout sequence exact — development then execution, in order",
    "Baseline before anything (you cannot show improvement without a start point) → sponsorship (programs die without it) → policy frame → phased training → live simulations → measure & iterate forever. This is “initial vs recurring” from the objective.",
    "rejected — position "+(fw+1)+" is wrong",
    fw>=0?"Correct step for position "+(fw+1)+": “"+SEQ_STEPS.find(x=>x[0]===SEQ_CORRECT[fw])[1]+"”. "+SEQ_WHY[SEQ_CORRECT[fw]]:"");
}

function checkMatch(){
  let wrong=[];
  MATCH_PAIRS.forEach((p,i)=>{ if(state.match["m"+i]!==p[1]) wrong.push(i); });
  const ok=wrong.length===0;
  let bad="";
  if(wrong.length){ const i=wrong[0]; bad="Pattern "+(i+1)+" (“"+MATCH_PAIRS[i][0]+"”) needs: “"+MATCH_PAIRS[i][1]+"”. Decoys fight the wrong war — a WAF cannot stop a phone call."; }
  recordCheck("H7",ok,document.getElementById("msg-H7"),
    "all six pairs exact — every control targets the actual attack path",
    "Voice needs callback rules, stuffing needs unique passwords, sticks need media policy. Awareness guidance is attack-path-shaped — which is why the MITRE IDs matter when you brief leadership.",
    "rejected — "+wrong.length+" pair"+(wrong.length===1?"":"s")+" wrong",bad);
}

function checkRemote(){
  const correct=REMOTE_OPTS.filter(o=>o[2]).map(o=>o[0]);
  const picked=REMOTE_OPTS.filter(o=>state.remote[o[0]]).map(o=>o[0]);
  const ok=picked.length===5&&correct.every(c=>picked.includes(c));
  let bad="";
  if(!ok){
    if(picked.length!==5) bad="Count check: you picked "+picked.length+" — exactly 5 belong in the pack.";
    else { const wrongPick=picked.find(p=>!correct.includes(p)); const o=REMOTE_OPTS.find(x=>x[0]===wrongPick); bad="“"+o[1]+"” trades away a control for convenience — it cannot be in the pack. Near-misses are rejected: every keeper ADDS a control."; }
  }
  recordCheck("H8",ok,document.getElementById("msg-H8"),
    "guidance pack exact — five controls, zero convenience trades",
    "VPN everywhere, managed apps only, privacy filters, router hardening, MDM wipe-readiness — each adds a control to the remote attack surface (network, app, visual, home perimeter, device).",
    "rejected",bad);
}

/* ================= DOCK 5 — METRICS HOUSE ================= */

function insiderOk(){
  return state.insider.action===INSIDER_Q.actionCorrect && state.insider.why===INSIDER_Q.whyCorrect;
}

function checkH6(part){
  const aOk=anomAllCorrect(), iOk=insiderOk();
  const msgTri=document.getElementById("msg-H6"), msgIns=document.getElementById("msg-H6b");
  if(part==="tri"){
    if(!aOk){
      const wrong=ANOMALIES.filter(n=>{const st=state.anomalies[n.id];return !st||st.cls!==n.cls||st.resp!==n.correct;});
      const w=wrong[0], i=ANOMALIES.indexOf(w)+1;
      recordCheck("H6",false,msgTri,"rejected — "+wrong.length+" of 6 triage rows off",
        "Event "+i+" ("+w.who+"): "+w.teach+" Fix the board, then answer the insider two-parter below.");
      return;
    }
    if(iOk){ recordCheck("H6",true,msgTri,"all six triaged + insider two-parter solved","Risky invites, unexpected reveals, unintentional contains — and the insider case proves procedure beats confrontation."); }
    else{ setMsg(msgTri,true,"Part 1 clean","All six triaged correctly. Now solve the insider two-parter below — H6 completes only when both parts pass.");
      const wo=document.getElementById("wo-insider"); if(wo) wo.open=true; }
    return;
  }
  if(!aOk){
    const wrong=ANOMALIES.filter(n=>{const st=state.anomalies[n.id];return !st||st.cls!==n.cls||st.resp!==n.correct;});
    const w=wrong[0], i=ANOMALIES.indexOf(w)+1;
    recordCheck("H6",false,msgIns,"triage board is not clean yet",
      "Event "+i+" ("+w.who+"): "+w.teach+" H6 completes only when the anomaly board AND the insider answers both pass.");
    return;
  }
  if(!iOk){
    recordCheck("H6",false,msgIns,"rejected — insider answers are off",
      state.insider.action!==INSIDER_Q.actionCorrect
        ? "First move must be through the insider-threat procedure — reported now, not confronted and not delayed. Trained handlers preserve evidence and protect rights."
        : "The “why” matters: volume + timing + control bypass is the documented insider-threat pattern, so speed through the correct channel is the answer.");
    return;
  }
  recordCheck("H6",true,msgIns,"insider two-parter solved — procedure over confrontation",
    "Trained handlers preserve evidence, involve HR/legal correctly, and protect everyone’s rights — including the accused’s. A desk confrontation can destroy evidence and create liability.");
}

function anomAllCorrect(){
  return ANOMALIES.every(n=>{const st=state.anomalies[n.id];return st&&st.cls===n.cls&&st.resp===n.correct;});
}

function checkAnomalies(){
  const wrong=ANOMALIES.filter(n=>{const st=state.anomalies[n.id];return !st||st.cls!==n.cls||st.resp!==n.correct;});
  const ok=wrong.length===0;
  let bad="";
  if(wrong.length){ const w=wrong[0]; const i=ANOMALIES.indexOf(w)+1;
    bad="Event "+i+" ("+w.who+"): class “"+ANOM_CLASSES[w.cls]+"”, response “"+w.respOpts[w.correct]+"”. "+w.teach; }
  recordCheck("M10",ok,document.getElementById("msg-M10"),
    "all six triaged correctly — the taxonomy is yours now",
    "Risky acts invite the attack; unexpected signals reveal it; unintentional mistakes contain it. Responses differ by class — but reporting is the constant. Note n4: it is both unexpected AND the insider-threat entry point.",
    wrong.length+" of 6 still off",bad);
}

function checkDash(){
  const ok=state.dash.worst===DASH.worstCorrect&&state.dash.kpi===DASH.kpiCorrect&&state.dash.verdict===DASH.verdictCorrect;
  let bad="";
  if(state.dash.worst!==DASH.worstCorrect) bad="Gap check: Finance click 41% vs report 3% — a 38-point gap (Dispatch 25, Warehouse 9, Office −3). ";
  else if(state.dash.kpi!==DASH.kpiCorrect) bad="The program turns humans into sensors — so report rate and time-to-report are the value pair. Clicks alone can mislead. ";
  else if(state.dash.verdict!==DASH.verdictCorrect) bad="Read all three quarters: clicks −68.6% relative, reports +110.7%, ttr 6h→48m. That is “working, keep iterating” — Finance is next quarter’s target.";
  recordCheck("M11",ok,document.getElementById("msg-M11"),
    "dashboard read correctly — and Finance is next quarter’s target",
    "initial vs recurring: the Q1 baseline was initial; the monthly randomized campaigns are recurring. Improvement claims now cite numbers, which is exactly what the board and the SY0-801 exam want.",
    "not yet",bad);
}

function checkSpike(){
  const ok=state.spike.p1===SPIKE.part1.correct&&state.spike.p2===SPIKE.part2.correct&&state.spike.p3===SPIKE.part3.correct;
  let bad="";
  if(state.spike.p1!==SPIKE.part1.correct) bad="Find the cell that breaks the trend AND the silence pattern: Dispatch, week of Oct 20 (29% clicks, 0 reports). ";
  else if(state.spike.p2!==SPIKE.part2.correct) bad="A spike with zero reports during a real vishing wave is not “users got worse” — silence where there should be noise means treat as possible real compromise. ";
  else if(state.spike.p3!==SPIKE.part3.correct) bad="Escalation before education: gateway + voice logs, same-day dispatcher brief, then coaching. Publishing names would only suppress the reporting you need.";
  recordCheck("H5",ok,document.getElementById("msg-H5"),
    "spike analysis exact — triage before training",
    "You separated a simulation metric from a possible live incident and chose containment-first. That distinction — unexpected anomaly vs program trend — is the whole point of anomalous-behavior recognition.",
    "rejected",bad);
}

/* ================= QUIZ (QA rebuild: sequential flow, answer lock, red/green contract — R2/R3) ================= */
