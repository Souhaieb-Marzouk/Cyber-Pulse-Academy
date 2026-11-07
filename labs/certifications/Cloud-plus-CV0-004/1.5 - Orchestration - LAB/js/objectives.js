"use strict";
/* =====================================================================
   CyberLab "Harbor Control" — js/objectives.js
   CHECK RESULTS ENGINE — objective lookup, validation runs, hint economy
   (3 tiered hints in Medium; one star-costing nudge in Hard), completion gate.
   Ported 1:1 from the audited single-file lab (v4, QA fixes included).
   ===================================================================== */

/* ---------------- checks / hints ---------------- */
function findObj(id){ var o=OBJ(); for(var i=0;i<o.length;i++){ if(o[i].id===id) return o[i]; } return null; }
function runCheck(id){
  var o=findObj(id); if(!o) return;
  var w=woState(id);
  if(w.done){ toast("Work order already complete"); return; }
  var r=o.check(S);
  w.attempts++;
  if(!r.pass&&w.attempts===1) w.firstFail=true;
  w.fb=r;
  if(r.pass){
    w.done=true;
    logEvent("ok","work order "+id.replace("OBJ-","")+" complete — "+(o.pillar)+" objective achieved");
    toast("✔ "+id.replace("OBJ-","")+" complete");
  }
  saveSoon(); renderLedger(); renderStatus(); renderManifest(); renderFleet(); maybeComplete();
}
function useHint(id){
  var o=findObj(id); var w=woState(id);
  if(S.mode==="hard"){
    if(S.hintCost){ toast("The one nudge is already spent"); return; }
    S.hintCost=true; w.hints=1;
    toast("Nudge used — 1 star lost");
  } else {
    if(w.hints>=o.hints.length){ toast("No more hints for this order"); return; }
    w.hints++;
  }
  saveSoon(); renderLedger(); renderStatus();
}
function maybeComplete(){
  var total=OBJ().length;
  if(woDoneCount()<total) return;
  var qz=S.mode==="hard"?QUIZ_HARD:QUIZ_MED;
  for(var i=0;i<qz.length;i++){ if(S.quiz.locked[i]===undefined) return; }
  if(!S.seenDone){ S.seenDone=true; saveSoon(); openDone(); }
}
