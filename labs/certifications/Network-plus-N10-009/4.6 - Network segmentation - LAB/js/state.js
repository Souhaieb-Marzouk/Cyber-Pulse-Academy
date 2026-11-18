/* The Flat Net Incident — static build (N10-009 4.6).
   js/state.js — State, localStorage persistence (key: flatnet-lab-v2), scoring.
   Extracted verbatim from download/flat-net-segmentation-lab.html (v2, post-audit). */
"use strict";
/* ================= STATE ================= */
function freshState(){
  return {
    mode:null, station:0, visited:[], etab:"inv",
    obj:{},                 // id -> {done, attempts, firstTry, hints}
    zones:{}, tags:{}, tagged:{}, rules:[], ruleSeq:0,
    breach:{}, picks:{}, picksH8:{}, defMatch:{}, midInput:"",
    alerts:{}, noisy:{}, conds:[], whitelist:[], controls:{}, fridge:[],
    seq:{}, wlan:{},
    picksM1:[], picksM2:[], picksM7:[], picksM12:[],
    sources:[], tagSel:{},
    quiz:{i:0, answers:[], done:false},
    reportFiled:false
  };
}
var S = freshState();
function save(){
  try{ localStorage.setItem(LS_KEY, JSON.stringify(S)); }catch(e){ /* degrade gracefully */ }
}
function load(){
  try{
    var raw = localStorage.getItem(LS_KEY);
    if(raw){ var parsed = JSON.parse(raw); if(parsed && parsed.mode){ S = parsed; return true; } }
  }catch(e){}
  return false;
}
function fmtPts(){ return mastery(); }
function objDoneCount(){ var ids=activeObjs(); return ids.filter(function(id){return S.obj[id]&&S.obj[id].done;}).length; }
function activeObjs(){ return OBJECTIVES.filter(function(o){return o.hard===(S.mode==="hard");}).map(function(o){return o.id;}); }
function OBJ(id){ for(var i=0;i<OBJECTIVES.length;i++) if(OBJECTIVES[i].id===id) return OBJECTIVES[i]; return null; }
function hintCostTotal(){ var t=0; Object.keys(S.obj).forEach(function(id){ t+=(S.obj[id].hints||0); }); return t; }
function mastery(){
  var ids=activeObjs(); if(!ids.length) return 0;
  var max = ids.length*10 + quizMaxPts();
  var pts = 0;
  ids.forEach(function(id){ var o=S.obj[id]; if(o&&o.done) pts += o.firstTry?10:6; });
  pts -= hintCostTotal()*2; if(pts<0) pts=0;
  pts += quizPts();
  return Math.max(0, Math.min(100, Math.round(pts/max*100)));
}
function quizMaxPts(){ return (S.mode==="hard"?QUIZ_H.length:QUIZ_M.length)*4; }
function quizPts(){ var c=0; (S.quiz.answers||[]).forEach(function(a){ if(a&&a.ok) c++; }); return c*4; }
function starCount(){ var m=mastery(); return m>=90?5:m>=75?4:m>=60?3:m>=40?2:1; }
function starStr(){ var n=starCount(); var s=""; for(var i=0;i<5;i++) s+= i<n?"★":"☆"; return s; }

/* record a check attempt */
function recordCheck(id, ok){
  var o = S.obj[id] || (S.obj[id]={done:false,attempts:0,firstTry:false,hints:0});
  o.attempts++;
  if(ok){
    if(!o.done && o.attempts===1 && o.hints===0) o.firstTry=true;
    if(!o.done){ o.done=true; toast("Objective "+id+" complete — "+OBJ(id).title); }
    o.done=true;
  }
  save(); renderAll();
}

/* hints */
function useHint(id){
  var o = S.obj[id] || (S.obj[id]={done:false,attempts:0,firstTry:false,hints:0});
  var ob = OBJ(id);
  if(S.mode==="hard"){ if(o.hints>=1){ toast("Hard mode allows a single nudge — already used."); return; } o.hints++; }
  else { if(o.hints>=ob.hints.length){ toast("All hint tiers already shown."); return; } o.hints++; }
  save(); renderAll();
  showFeedback(id,"hint",(S.mode==="hard"?"NUDGE (costs score): ":"HINT "+o.hints+"/3: ")+ob.hints[o.hints-1]);
}

