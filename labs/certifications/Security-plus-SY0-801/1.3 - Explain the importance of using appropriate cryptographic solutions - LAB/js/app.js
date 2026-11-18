"use strict";

/* ============================================================================
   js/app.js — bootstrap & wiring: event bindings (incl. popup easy-close R7),
   build/restore pipelines, mode entry, boot. Loaded LAST.
   ============================================================================ */

function bindEvents(){
  document.addEventListener("click",(ev)=>{
    const b=ev.target.closest(".optBtn");
    if(!b) return;
    const d=b.dataset;
    let key=null;
    if(d.escrow!==undefined&&d.escrow!=="") key="escrow";
    else if(d.escrowwhy!==undefined&&d.escrowwhy!=="") key="escrowWhy";
    else if(d.ca!==undefined) key="ca";
    else if(d.type!==undefined) key="ctype";
    else if(d.rev!==undefined) key="rev";
    else if(d.symasym!==undefined) key="symasym";
    else if(d.proto!==undefined&&d.proto!=="") key="proto";
    else if(d.kx!==undefined&&d.kx!=="") key="kx";
    else if(d.kxwhy!==undefined&&d.kxwhy!=="") key="kxwhy";
    else if(d.verdict!==undefined&&d.verdict!=="") key="verdict";
    else if(d.halgo!==undefined&&d.halgo!=="") key="halgo";
    else if(d.saltwhy!==undefined&&d.saltwhy!=="") key="saltwhy";
    else if(d.h5verdict!==undefined&&d.h5verdict!=="") key="h5verdict";
    else if(d.h5ctrl!==undefined&&d.h5ctrl!=="") key="h5ctrl";
    else if(d.h6vuln!==undefined&&d.h6vuln!=="") key="h6vuln";
    else if(d.h6fix!==undefined&&d.h6fix!=="") key="h6fix";
    else if(d.postwhy!==undefined&&d.postwhy!=="") key="postwhy";
    else if(d.h2check!==undefined&&d.h2check!=="") key="h2check";
    else if(d.h2root!==undefined&&d.h2root!=="") key="h2root";
    if(key && isKeyLocked(key)){ announce(LOCK_MSG); return; }
    const triad=b.closest(".triad");
    if(triad) triad.querySelectorAll(".optBtn").forEach(x=>x.classList.remove("sel"));
    b.classList.add("sel");
    const e=state.env;
    if(d.escrow!==undefined&&d.escrow!=="") e.escrow=d.escrow;
    else if(d.escrowwhy!==undefined&&d.escrowwhy!=="") e.escrowWhy=d.escrowwhy;
    else if(d.ca!==undefined) e.ca[d.ca]=d.val;
    else if(d.type!==undefined) e.ctype[d.type]=d.val;
    else if(d.rev!==undefined) e.rev[d.rev]=d.val;
    else if(d.symasym!==undefined) e.symasym[d.symasym]=d.val;
    else if(d.proto!==undefined&&d.proto!=="") e.proto=d.proto;
    else if(d.kx!==undefined&&d.kx!=="") e.kx=d.kx;
    else if(d.kxwhy!==undefined&&d.kxwhy!=="") e.kxwhy=d.kxwhy;
    else if(d.verdict!==undefined&&d.verdict!=="") e.verdict=d.verdict;
    else if(d.halgo!==undefined&&d.halgo!=="") e.halgo=d.halgo;
    else if(d.saltwhy!==undefined&&d.saltwhy!=="") e.saltwhy=d.saltwhy;
    else if(d.h5verdict!==undefined&&d.h5verdict!=="") e.h5verdict=d.h5verdict;
    else if(d.h5ctrl!==undefined&&d.h5ctrl!=="") e.h5ctrl=d.h5ctrl;
    else if(d.h6vuln!==undefined&&d.h6vuln!=="") e.h6vuln=d.h6vuln;
    else if(d.h6fix!==undefined&&d.h6fix!=="") e.h6fix=d.h6fix;
    else if(d.postwhy!==undefined&&d.postwhy!=="") e.postwhy=d.postwhy;
    else if(d.h2check!==undefined&&d.h2check!=="") e.h2check=d.h2check;
    else if(d.h2root!==undefined&&d.h2root!=="") e.h2root=d.h2root;
    save(); refreshLamps(); refreshDial();
  });
  document.addEventListener("click",(ev)=>{
    const b=ev.target.closest(".assign button");
    if(!b) return;
    if(isKeyLocked("lane")){ announce(LOCK_MSG); return; }
    const key=b.dataset.task, k=b.dataset.key;
    state.env.lane[key]=k;
    const card=b.closest(".taskCard");
    card.querySelectorAll("button").forEach(x=>x.classList.toggle("sel",x.dataset.key===k));
    (k==="private"?$("#lanePriv"):$("#lanePub")).appendChild(card);
    save(); refreshLamps(); refreshDial();
  });
  $$(".stationBtn").forEach(b=>b.addEventListener("click",()=>showStation(b.dataset.station)));
  $$(".propsGrid input").forEach(p=>p.addEventListener("change",()=>{ if(isKeyLocked("props")){ announce(LOCK_MSG); p.checked=!!state.env.props[p.dataset.prop]; return; } state.env.props[p.dataset.prop]=p.checked; save(); refreshLamps(); refreshDial(); }));
  const serial=$("#h2serial"); if(serial) serial.addEventListener("input",()=>{ if(isKeyLocked("h2serial")){ announce(LOCK_MSG); serial.value=state.env.h2serial||""; return; } state.env.h2serial=serial.value; save(); refreshLamps(); refreshDial(); });
  $("#hashABtn").addEventListener("click",()=>{ sha256hex(FILE_A).then(h=>{ state.env.hashA=h; renderHashOut(); save(); refreshLamps(); refreshDial(); announce("Archived copy hashed."); }); });
  $("#hashBBtn").addEventListener("click",()=>{ sha256hex(FILE_B).then(h=>{ state.env.hashB=h; renderHashOut(); save(); refreshLamps(); refreshDial(); announce("Received copy hashed."); }); });
  $("#saltToggle").addEventListener("click",()=>{ if(isKeyLocked("saltOn")){ announce(LOCK_MSG); return; } state.env.saltOn=!state.env.saltOn; const t=$("#saltToggle"); t.textContent=state.env.saltOn?"Salt: ON — turn OFF (not recommended)":"Salt: OFF — turn per-user salting ON"; renderSalt(); save(); refreshLamps(); refreshDial(); });
  $("#tamperBtn").addEventListener("click",()=>{ state.env.tampered=true; state.env.verified=null; renderSignOut(); save(); announce("Tamper applied: one character flipped in the report."); });
  $("#verifyBtn").addEventListener("click",()=>{
    const e=state.env;
    e.verified = e.sign.join(",")!=="hash,priv,attach,verify" ? "malformed" : (e.tampered ? "fail" : "pass");
    renderSignOut(); save();
    announce(e.verified==="pass"?"Verification passed.":e.verified==="fail"?"Verification failed: document changed after signing.":"Signature malformed: pipeline incomplete or out of order.");
  });
  $("#introNext").addEventListener("click",()=>showStation("k"));
  $("#finishBtn").addEventListener("click",finishLab);
  $("#closeComplete").addEventListener("click",closeComplete);
  $("#completeX").addEventListener("click",closeComplete);
  $("#reviewLedgerBtn").addEventListener("click",()=>{ closeComplete(); showStation("intro"); $("#ledger").scrollIntoView({behavior:"smooth"}); });
  $("#glossaryBtn").addEventListener("click",()=>{ $("#glossaryDrawer").classList.add("on"); $("#glossaryDrawer").setAttribute("aria-hidden","false"); $("#glossaryClose").focus(); });
  $("#glossaryClose").addEventListener("click",closeGlossary);
  $("#restartBtn").addEventListener("click",()=>$("#resetOverlay").classList.add("on"));
  $("#resetX").addEventListener("click",closeReset);
  $("#resetCancel").addEventListener("click",closeReset);
  document.addEventListener("keydown",(ev)=>{
    if(ev.key!=="Escape") return;
    if($("#completeOverlay").classList.contains("on")) closeComplete();
    else if($("#resetOverlay").classList.contains("on")) closeReset();
    else if($("#glossaryDrawer").classList.contains("on")) closeGlossary();
  });
  $("#completeOverlay").addEventListener("mousedown",(ev)=>{ if(ev.target===ev.currentTarget) closeComplete(); });
  $("#resetOverlay").addEventListener("mousedown",(ev)=>{ if(ev.target===ev.currentTarget) closeReset(); });
  document.addEventListener("mousedown",(ev)=>{
    const dr=$("#glossaryDrawer");
    if(!dr.classList.contains("on")) return;
    if(dr.contains(ev.target) || ev.target.closest("#glossaryBtn")) return;
    closeGlossary();
  });
  $("#resetConfirm").addEventListener("click",()=>{ try{ localStorage.removeItem(SKEY); }catch(e){} location.reload(); });
  $("#ledgerToggle").addEventListener("click",()=>{
    const led=$("#ledger"); const collapsed=led.classList.toggle("collapsedM");
    $("#ledgerToggle").textContent = collapsed ? "Show ledger ▼" : "Hide ledger ▲";
    $("#ledgerToggle").setAttribute("aria-expanded", String(!collapsed));
  });
}

function applyShuffles(){
  const nonIdentity=(order)=>{ if(order.length&&order.every((v,i)=>v===i)) order.push(order.shift()); return order; };
  ["h2pool","signPool","h7pool"].forEach(pid=>{ const pool=$("#"+pid); const btns=$$("#"+pid+" button"); const order=nonIdentity(stablePermutation("shuffle-"+pid+"|t2", btns.length, btns.length)); order.forEach(i=>pool.appendChild(btns[i])); });
  $$(".triad").forEach((tri,idx)=>{
    const btns=$$(".optBtn").filter(b=>b.closest(".triad")===tri);
    if(btns.length>1){
      const sorted=btns.slice().sort((a,b)=>a.textContent.localeCompare(b.textContent));
      const order=nonIdentity(stablePermutation("shuffle-triad|t2|"+idx, sorted.length, sorted.length));
      order.forEach(i=>tri.appendChild(sorted[i]));
    }
  });
}

function buildAll(){
  buildLaneTasks(); buildLevelBoard(); buildPostureBoard(); buildCalBoard(); buildMitreBoard(); buildPropBoard();
  setupPipe("h2pool","h2seq","h2seq",3); setupPipe("signPool","signPipeline","sign",4); setupPipe("h7pool","h7seq","h7seq",5);
  applyShuffles();
  setManifest();
}

function enterLab(resume){
  $("#modeSelect").style.display="none";
  $("#lab").classList.add("on");
  $("#modeChip").textContent=state.mode.toUpperCase();
  $$(".hardOnly").forEach(h=>h.style.display = state.mode==="hard" ? "block" : "none");
  if(state.mode==="hard"){
    const introBtn=$$('.stationBtn').find(b=>b.dataset.station==="intro");
    introBtn.querySelector(".st-name").textContent="Audit Dossier";
    introBtn.querySelector(".st-sub").textContent="triage the 8 findings";
    $("#quizName").textContent="Scenario Sign-Off";
    $("#quizTitle").textContent="Scenario sign-off";
    $("#quizLead").textContent="Seven scenario calls. Every answer is graded right or wrong with a full justification — efficiency and accuracy drive the score.";
    $("#introNext").textContent="Work the stations → Key Pairs & PKI";
    injectDossier();
  }
  buildAll(); bindEvents();
  if(resume) applyEnvToUI(); else renderSalt();
  renderLedger(); renderQuiz();
  showStation(state.active||"intro");
  refreshDial(); refreshLamps(); refreshGuidance();
}

function boot(){
  renderGlossary();
  $$("#modeSelect [data-mode]").forEach(b=>b.addEventListener("click",()=>{ state=freshState(b.dataset.mode); enterLab(false); announce("Lab started in "+b.dataset.mode+" mode."); }));
  const saved=loadState();
  if(saved){ state=saved; enterLab(true); }
}
boot();
