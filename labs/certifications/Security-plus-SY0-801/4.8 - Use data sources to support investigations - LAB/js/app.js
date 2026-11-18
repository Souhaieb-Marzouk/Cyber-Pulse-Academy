"use strict";
/* ======================================================
   SY0-801 4.8 Practice Lab — The Evidence Room · app.js
Bootstrap: mode entry, event wiring, init. Loaded last.
   ====================================================== */
/* ---- init ---- */
function start(m){S.mode=m;save();enterLab();
 announce("Mode selected: "+(m==="medium"?"Guided case.":"Cold case."))}
function enterLab(){
 $("#modeSelect").hidden=true;$("#lab").hidden=false;
 $("#modeChip").textContent=S.mode==="medium"?"MEDIUM · GUIDED CASE":"HARD · COLD CASE";
 renderBoard();updateMeter();renderRibbon()}
function init(){
 load();
 document.getElementById("pickMedium").addEventListener("click",()=>start("medium"));
 document.getElementById("pickHard").addEventListener("click",()=>start("hard"));
 document.getElementById("glossaryBtn").addEventListener("click",openGlossary);
 document.getElementById("resetBtn").addEventListener("click",confirmReset);
 document.getElementById("backBtn").addEventListener("click",()=>document.body.classList.remove("desk-open"));
 document.addEventListener("keydown",e=>{
  if(e.key==="Escape"){
   const root=document.getElementById("modalRoot");
   if(root.firstChild){closeModal();return}
   document.body.classList.remove("desk-open")}});
 if(S.mode)enterLab()}
init();
