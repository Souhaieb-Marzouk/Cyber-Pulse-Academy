/* ══════════════════════════════════════════════════════════════════════
   js/app.js — event wiring for every control and the boot sequence
   (load state, render everything, restore visible panels, resume).
   Load order: 7th/last (registers the DOMContentLoaded boot).
   ══════════════════════════════════════════════════════════════════════ */
"use strict";

/* ══════════════ WIRING ══════════════ */
function wire(){
  document.querySelectorAll(".mode-card").forEach(b=>b.addEventListener("click",()=>{ S.mode=b.dataset.mode; S.screen="brief";
    renderModePanels(); renderQuiz(); renderChain(); renderStmts(); renderObjectives(); renderDial(); renderFocus(); showScreen("brief"); save(); }));
  $("briefStart").addEventListener("click",()=>{ showScreen("lab"); });
  $("briefReopen").addEventListener("click",()=>showScreen("brief"));
  $("briefGlossary").addEventListener("click",()=>openModal("modalGlossary"));
  $("glossaryBtn").addEventListener("click",()=>openModal("modalGlossary"));
  $("resetBtn").addEventListener("click",()=>openModal("modalReset"));
  $("resetConfirm").addEventListener("click",()=>{ try{ localStorage.removeItem(LS_KEY); }catch(e){} location.reload(); });
  document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",closeModals));
  document.querySelectorAll(".overlay").forEach(o=>o.addEventListener("click",e=>{ if(e.target===o) closeModals(); }));
  document.addEventListener("keydown",e=>{ if(e.key==="Escape") closeModals(); });
  document.querySelectorAll(".step-btn").forEach(b=>b.addEventListener("click",()=>showBay(+b.dataset.bay)));
  bindTabs();
  $("runScan").addEventListener("click",runScan);
  $("scanScope").addEventListener("change",()=>{ updateScanHint(); save(); });
  $("scanCred").addEventListener("change",()=>{ updateScanHint(); save(); });
  $("scanIntr").addEventListener("change",()=>{ updateScanHint(); save(); });
  $("ipamReconcile").addEventListener("click",reconcileIpam);
  $("ipamAdd").addEventListener("click",addRogue);
  $("cspmRun").addEventListener("click",runCspm);
  bindPlan();
  $("excIsolate").addEventListener("change",e=>{ S.exc.isolate=e.target.checked; autoCheck(); save(); });
  $("excOwner").addEventListener("change",e=>{ S.exc.owner=e.target.value; autoCheck(); save(); });
  $("excReview").addEventListener("change",e=>{ S.exc.review=e.target.value; autoCheck(); save(); });
  $("wafF1").addEventListener("change",e=>{ S.wafF1=e.target.checked;
    toast(S.wafF1?"WAF virtual patch live in front of MR-101 — interim only, the finding stays OPEN.":"WAF virtual patch removed.");
    renderQueue(); autoCheck(); save(); });
  $("rtsRun").addEventListener("click",runRts);
  $("dec107Go").addEventListener("click",decide107);
  $("dec106Go").addEventListener("click",decide106);
  $("decSanityGo").addEventListener("click",decideSanity);
  $("mr109Back").addEventListener("click",back109);
  ["reportA","reportB","reportC"].forEach(k=>$(k).addEventListener("change",e=>{ S[k]=e.target.value; autoCheck(); save(); }));
  ["cvssA","cvssAM","cvssB","cvssBM"].forEach(k=>$(k).addEventListener("change",e=>{ S[k]=e.target.value; autoCheck(); save(); }));
  $("certClose").addEventListener("click",closeModals);
  $("toast").addEventListener("click",()=>{ $("toast").classList.remove("show"); });
  $("queueToggle").addEventListener("click",()=>{ const r=$("queueRail"); const open=r.classList.toggle("open");
    $("queueToggle").setAttribute("aria-expanded",String(open)); $("queueToggle").textContent=open?"Hide":"Queue"; });
  $("objToggle").addEventListener("click",()=>{ const r=$("objRail"); const open=r.classList.toggle("open");
    $("objToggle").setAttribute("aria-expanded",String(open)); $("objToggle").textContent=open?"Hide":"Objectives"; });
  window.addEventListener("resize",()=>{ if(window.innerWidth>860){ $("queueRail").classList.remove("open"); } if(window.innerWidth>1180){ $("objRail").classList.remove("open"); } });
}

/* ══════════════ BOOT ══════════════ */
function boot(){ load(); renderGlossary(); wire();
  renderOrder(); checkOrderSilent(); renderIpam(); renderCode(); renderQueue(); renderRank(); renderWo(); renderChain(); renderStmts(); renderQuiz();
  renderObjectives(); renderDial(); renderModePanels(); renderFocus(); renderLedger();
  if(S.rts.ran){ $("rtsSummary").classList.remove("hidden"); }
  if(S.rts.dec107) { $("dec107Panel").classList.remove("hidden"); $("dec107").value=S.rts.dec107; }
  if(S.rts.dec106) { $("dec106Panel").classList.remove("hidden"); $("dec106").value=S.rts.dec106; }
  if(S.rts.decSanity){ $("decSanityPanel").classList.remove("hidden"); $("decSanity").value=S.rts.decSanity; }
  if(S.rts.back109) $("mr109Back").classList.remove("hidden");
  ["excIsolate"].forEach(k=>{ $(k).checked=S.exc.isolate; }); $("excOwner").value=S.exc.owner; $("excReview").value=S.exc.review;
  $("wafF1").checked=S.wafF1; $("wafF1").disabled=!S.discovered.F1;
  ["scanPlanA","scanPlanB","scanPlanC"].forEach((k,i)=>{ $(k).value=S[["planA","planB","planC"][i]]; });
  ["reportA","reportB","reportC","cvssA","cvssAM","cvssB","cvssBM"].forEach(k=>$(k).value=S[k]||"");
  updateScanHint();
  showScreen(S.screen==="mode"&&!S.mode?"mode":(S.screen==="brief"&&S.mode?"brief":(S.mode?"lab":"mode")));
  if(S.screen!=="mode"){ showBay(S.bay||1); } }
function checkOrderSilent(){ if(S.phaseOrder.join()===PHASES_OK.join()){ S.phaseOrderOK=true;
  $("orderMsg").textContent="✓ Correct cycle: Identify → Prioritize → Remediate → Validate — then it repeats."; $("orderMsg").style.color="var(--ok)"; } }
document.addEventListener("DOMContentLoaded",boot);
