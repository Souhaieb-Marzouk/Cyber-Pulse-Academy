// APP — event wiring and bootstrap — MVHA Custody Bureau (Security+ SY0-801 · 3.3) — static port v4.
// Source: single-file lab, byte-identical content. All content is synthetic training material.

"use strict";
// Event wiring (relocated verbatim, original relative order preserved)
document.addEventListener("click",e=>{
  const b=e.target.closest("[data-sec]"); if(b){ switchSec(b.dataset.sec); return; }
  const g=e.target.closest("[data-goto]"); if(g){ switchSec(g.dataset.goto); return; }
  const c=e.target.closest("[data-close]"); if(c){ closeLayer(c.dataset.close); }
});

$("#curGo").addEventListener("click",()=>{ if(S.curObj){ gotoBench(S.curObj); } });

$("#curSkip").addEventListener("click",()=>{ advancePointer(true); });

document.addEventListener("keydown",e=>{
  if(e.metaKey||e.ctrlKey||e.altKey) return;
  const t=e.target.tagName;
  if(t==="INPUT"||t==="SELECT"||t==="TEXTAREA") return;
  if(e.key>="1"&&e.key<="6"&&S.mode){ switchSec(SECS[+e.key-1]); }
  else if(e.key==="g"||e.key==="G"){ toggleGloss(); }
  else if(e.key==="Escape"){ closeLayer("glossDrawer"); closeLayer("inspector"); closeLayer("certModal"); closeLayer("resetModal"); hideTip(); }
});

document.addEventListener("mouseover",e=>{ const d=e.target.closest("dfn[data-g]"); if(d) showTip(d); });

document.addEventListener("mouseout",e=>{ if(e.target.closest&&e.target.closest("dfn[data-g]")) tipTimer=setTimeout(hideTip,150); });

document.addEventListener("focusin",e=>{ const d=e.target.closest&&e.target.closest("dfn[data-g]"); if(d) showTip(d); });

document.addEventListener("focusout",e=>{ if(e.target.closest&&e.target.closest("dfn[data-g]")) hideTip(); });

$("#glossBtn").addEventListener("click",toggleGloss);

$("#quizSubmit").addEventListener("click",()=>{
  if(!S.mode) return;
  if(S.quiz.done){ S.quiz={answers:{},done:false,score:0}; $("#quizScore").textContent=""; renderQuiz(); announce("Examination reset. Answer the items and submit again."); save(); return; }
  gradeQuiz(true);
});

$("#certAgainBtn").addEventListener("click",()=>{
  const all=S.mode&&objsFor(S.mode).every(id=>S.obj[id]&&S.obj[id].pass);
  if(all) openCert(); else announce("The certificate stamps only when every objective on the audit board has passed.");
});

$("#resetBtn").addEventListener("click",()=>openLayer("resetModal"));

$("#resetConfirm").addEventListener("click",()=>{ try{ localStorage.removeItem(KEY); }catch(e){} location.reload(); });

$$("#modeOverlay [data-mode]").forEach(b=>b.addEventListener("click",()=>{
  S.mode=b.dataset.mode; S.obj={}; S.env={}; S.quiz={answers:{},done:false,score:0}; S.seen={}; S.certSeen=false; S.curObj=null;
  $("#modeOverlay").hidden=true;
  $("#modeChipTxt").textContent=S.mode==="medium"?"Registry Apprentice · Medium":"Chief Custodian · Hard";
  renderMode(); switchSec("briefing");
  announce(S.mode==="medium"
    ? "Registry Apprentice mode started. Twelve objectives await on the case floor; hints are free to use but cost stars."
    : "Chief Custodian mode started. Nine missions, noisy evidence with decoys, and strict grading.");
}));

/* ================= DELEGATED CLICKS ================= */
document.addEventListener("click",e=>{
  const df=e.target.closest("dfn[data-g]");
  if(df){ if(tipFor===df){ hideTip(); tipFor=null; } else { tipFor=df; showTip(df); } return; }
  if(tipFor){ tipFor=null; hideTip(); }
  const ck=e.target.closest("[data-check]"); if(ck){ checkObj(ck.dataset.check); return; }
  const h=e.target.closest("[data-hint]"); if(h){ useHint(h.dataset.hint); return; }
  const n=e.target.closest("[data-nudge]"); if(n){ useHint(n.dataset.nudge); return; }
  const op=e.target.closest("[data-open]"); if(op){ gotoBench(op.dataset.open); return; }
  const d=e.target.closest(".dossier"); if(d){ openDoc(d.dataset.doc); return; }
  const ov=e.target.closest(".overlay");
  if(ov&&e.target===ov&&ov.id!=="modeOverlay"){ closeLayer(ov.id); return; }
});

/* ================= INIT ================= */
function init(){
  load();
  buildGlossary(); buildTicker();
  if(S.mode){
    $("#modeOverlay").hidden=true;
    $("#modeChipTxt").textContent=S.mode==="medium"?"Registry Apprentice · Medium":"Chief Custodian · Hard";
    renderMode();
    switchSec(S.sec&&SECS.includes(S.sec)?S.sec:"briefing");
  }
  if(!storageOK) announce("Note: this browser blocks local storage, so progress will not persist after you leave the page.");
}
init();
