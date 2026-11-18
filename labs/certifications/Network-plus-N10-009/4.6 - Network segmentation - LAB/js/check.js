/* The Flat Net Incident — static build (N10-009 4.6).
   js/check.js — CHECK RESULTS engine: evaluates objectives against live state.
   Extracted verbatim from download/flat-net-segmentation-lab.html (v2, post-audit). */
"use strict";
/* ================= CHECK ENGINE ================= */
function bindAll(){
  bindShell();
  bindNav();
  bindBriefing();
  bindManual();
  bindEvidence();
  bindZoneBoard();
  bindCommission();
  bindQuiz();
  bindHandover();
}
function syncPick(id,key,on){
  var a=S.picks[key]; if(!a) a=S.picks[key]=[];
  var i=a.indexOf(id);
  if(on&&i<0) a.push(id); if(!on&&i>=0) a.splice(i,1);
  save();
}
function bindBriefing(){
  Array.prototype.forEach.call(document.querySelectorAll("[data-ben]"),function(el){
    el.addEventListener("change",function(){ syncPick(el.getAttribute("data-ben"),"M1",el.checked); });
  });
}
function bindManual(){
  Array.prototype.forEach.call(document.querySelectorAll("[data-def]"),function(el){
    el.addEventListener("change",function(){ S.defMatch[el.getAttribute("data-def")]=el.value||undefined; save(); });
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-tech]"),function(el){
    el.addEventListener("change",function(){ syncPick(el.getAttribute("data-tech"),"M2",el.checked); });
  });
  var mid=document.querySelector("[data-mid]");
  if(mid) mid.addEventListener("input",function(){ S.midInput=mid.value; save(); });
}
function showFeedback(id,cls,text){
  Array.prototype.forEach.call(document.querySelectorAll('[data-ofb="'+id+'"]'),function(box){
    box.className="ofb "+cls+" show"; box.textContent=text;
  });
}
function doCheck(id){
  var ob=OBJ(id); if(!ob) return;
  var res=ob.check(S);
  recordCheck(id,res.ok);
  showFeedback(id, res.ok?"good":"bad", res.msg);
}

