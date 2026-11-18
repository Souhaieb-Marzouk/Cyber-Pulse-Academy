"use strict";
/* =============================================================================
   js/app.js — bootstrap and event wiring: modal close paths (X / Cancel /
   ESC / outside-click), toast dismissal, the delegated click & change
   handlers for every data-act control, mode-select listeners, RESET flow,
   and the resume-on-load entry point.
   ========================================================================== */

$$(".modal").forEach(m=>m.addEventListener("click",e=>{if(e.target===m&&m.id!=="resetModal")closeModal(m.id);}));
document.addEventListener("keydown",e=>{if(e.key==="Escape"){$$(".modal").forEach(m=>{if(!m.hidden)closeModal(m.id);});}});
$("#toast").addEventListener("click",()=>{$("#toast").hidden=true;});

/* ---------- delegated events ---------- */
document.addEventListener("click",e=>{const el=e.target.closest("[data-act]");if(!el)return;
  const act=el.dataset.act;
  if(act==="check"){doCheck(el.dataset.obj);}
  else if(act==="hint"){doHint(el.dataset.obj);}
  else if(act==="open-obj"){toggleObj(el.dataset.obj);}
  else if(act==="goto"){closeAllModals();go(el.dataset.st);}
  else if(act==="pool"){const b=el.dataset.b;const a=arrFor(b);if(!a.includes(el.dataset.id)){a.push(el.dataset.id);save();rerenderKeepScroll('[data-act="done"][data-b="'+b+'"][data-id="'+el.dataset.id+'"]');}}
  else if(act==="done"){const b=el.dataset.b;const a=arrFor(b);const i=a.indexOf(el.dataset.id);if(i>=0){a.splice(i,1);save();rerenderKeepScroll('[data-act="pool"][data-b="'+b+'"][data-id="'+el.dataset.id+'"]');}}
  else if(act==="msel"){toggleSel(el.dataset.k,el.dataset.id);el.setAttribute("aria-pressed",el.getAttribute("aria-pressed")!=="true"?"true":"false");}
  else if(act==="msel-oneway"){setVal(el.dataset.k,el.dataset.id,null,el.dataset.v);const row=el.parentElement;row.querySelectorAll(".chipbtn").forEach(c=>c.setAttribute("aria-pressed",c===el?"true":"false"));}
  else if(act==="flag"){setVal(el.dataset.k,el.dataset.id,null,el.dataset.v);const row=el.parentElement;row.querySelectorAll(".flagbtn").forEach(c=>c.setAttribute("aria-pressed",c===el?"true":"false"));}
  else if(act==="quiz"){answerQuiz(+el.dataset.qi,+el.dataset.oi);}
  else if(act==="finish"){finishAudit(el);}
  else if(act==="close"){closeModal(el.dataset.close);}});
function closeAllModals(){$$(".modal").forEach(m=>m.hidden=true);}
document.addEventListener("change",e=>{const el=e.target;if(el.matches&&el.matches("select[data-k]")){setVal(el.dataset.k,el.dataset.id,el.dataset.sub,el.value);}});

/* ---------- boot ---------- */
function enterWorld(){$("#modeSelect").hidden=true;$("#world").hidden=false;
  const badge=$("#modeBadge");badge.textContent=S.mode==="medium"?"Medium":"Hard";badge.classList.toggle("hard",S.mode==="hard");
  renderRail();renderTracker();renderStation();updateRing();}
$("#pickMedium").addEventListener("click",()=>{S=freshState();S.mode="medium";save();enterWorld();announce("Medium mode started. Guided audit with 12 objectives.");});
$("#pickHard").addEventListener("click",()=>{S=freshState();S.mode="hard";save();enterWorld();announce("Hard mode started. Full audit with 8 deep objectives and red herrings.");});
$("#glossBtn").addEventListener("click",e=>{$("#glossBody").innerHTML=GLOSSARY.map(g=>'<p style="margin:8px 0"><strong>'+g[0]+'</strong> — '+g[1]+'</p>').join("");openModal("glossModal",e.currentTarget);});
$("#resetBtn").addEventListener("click",e=>openModal("resetModal",e.currentTarget));
$("#resetConfirm").addEventListener("click",()=>{wipe();location.reload();});
if(S.mode)enterWorld();
