"use strict";
/* =====================================================================
   CyberLab "Harbor Control" — js/state.js
   STATE + PERSISTENCE — the single store object S, localStorage save/load,
   per-objective state, environment accessors, star math and the radio log.
   Ported 1:1 from the audited single-file lab (v4, QA fixes included).
   ===================================================================== */

var LS_KEY = "cyberlab.harbor.v1";
var $ = function(id){ return document.getElementById(id); };
function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
function nowT(){ var d=new Date(); return [d.getHours(),d.getMinutes(),d.getSeconds()].map(function(n){return ("0"+n).slice(-2);}).join(":"); }

/* ---------------- state ---------------- */
function freshEnv(mode){
  var e = {
    nodes:[ {name:"PIER-A",cap:8,status:"ok"}, {name:"PIER-B",cap:8,status:"ok"}, {name:"PIER-C",cap:6,status:"ok"} ],
    pods:[], applied:null, lastGoodImage:null, traffic:120, sale:false, salePeak:0, downtime:0,
    healCount:0, schedSpread:0, services:[{name:"cart-api-svc",dns:"cart-api.store.meridian.example",target:"cart-api"}],
    pvc:null, endpointCfg:"10.24.1.7", deployedOnce:false, hotfixDeployed:false, apiRescheduled:false,
    vendor:{privileged:true, secret:"plaintext", tag:"latest", probes:false},
    events:[], seq:0, evIds:{}, seqn:Math.floor(Math.random()*4000)+5000
  };
  var rnd = function(){ e.seqn++; return e.seqn.toString(16).slice(-4); };
  if(mode==="medium"){
    e.pods=[
      {id:"cart-api-"+rnd(),app:"cart-api",node:"PIER-A",status:"Running",restarts:0},
      {id:"cart-api-"+rnd(),app:"cart-api",node:"PIER-B",status:"Running",restarts:0},
      {id:"cart-sessions-"+rnd(),app:"cart-sessions",node:"PIER-C",status:"Running",restarts:0}
    ];
  } else {
    e.sale=true; e.traffic=910;
    e.applied={app:"cart-web",image:"meridian/cart-web:2.0.0-hotfix",replicas:4,port:8443,probes:false,privileged:false,secretMode:"secret-ref",storage:"none"};
    e.lastGoodImage="meridian/cart-web:1.4.2";
    e.deployedOnce=true; e.hotfixDeployed=true;
    for(var i=0;i<4;i++){ e.pods.push({id:"cart-web-"+rnd(),app:"cart-web",node:["PIER-A","PIER-B","PIER-C","PIER-A"][i],status:"CrashLoopBackOff",restarts:5+i}); }
    e.pods.push({id:"cart-api-"+rnd(),app:"cart-api",node:"PIER-B",status:"Running",restarts:0});
    e.pods.push({id:"cart-api-"+rnd(),app:"cart-api",node:"PIER-A",status:"Running",restarts:0});
    e.pods.push({id:"cart-sessions-"+rnd(),app:"cart-sessions",node:"PIER-C",status:"Running",restarts:0});
  }
  return e;
}
function freshState(){
  return { ver:1, screen:"mode", mode:null, env:freshEnv("medium"),
    ui:{}, wo:{}, flags:{}, quiz:{answers:{},locked:{},score:null}, hintCost:false, openWo:null, seenDone:false };
}
var S = freshState();
function woState(id){ if(!S.wo[id]) S.wo[id]={done:false,attempts:0,firstFail:false,hints:0}; return S.wo[id]; }
function save(){ try{ localStorage.setItem(LS_KEY, JSON.stringify(S)); }catch(e){} }
var saveT=null; function saveSoon(){ if(saveT) return; saveT=setTimeout(function(){ saveT=null; save(); },250); }
function load(){ try{ var raw=localStorage.getItem(LS_KEY); if(!raw) return false; var o=JSON.parse(raw); if(!o||o.ver!==1) return false;
  if(o.env&&o.env.nodes&&o.env.nodes.length===3&&o.env.nodes[0].cap===6){ o.env.nodes[0].cap=8; o.env.nodes[1].cap=8; o.env.nodes[2].cap=6; }
  S=o; return true; }catch(e){ return false; } }

/* ---------------- helpers ---------------- */
function webPods(){ return S.env.pods.filter(function(p){return p.app==="cart-web";}); }
function runningOf(app){ return S.env.pods.filter(function(p){return p.app===app&&p.status==="Running";}).length; }
function tagOf(img){ var i=String(img||"").lastIndexOf(":"); return i<0?"":img.slice(i+1); }
function nodeLoad(n){ return S.env.pods.filter(function(p){return p.node===n&&p.status!=="Terminating";}).length; }
function woDoneCount(){ var o=OBJ(); var n=0; for(var i=0;i<o.length;i++){ if(woState(o[i].id).done) n++; } return n; }
function OBJ(){ return S.mode==="hard"?OBJ_HARD:OBJ_MED; }
function starsCalc(){
  var o=OBJ(); var fails=0,hints=0;
  for(var i=0;i<o.length;i++){ var w=woState(o[i].id); if(w.firstFail) fails++; hints+=w.hints; }
  var s=5 - Math.floor(fails/2) - Math.floor(hints/2) - (S.hintCost?1:0);
  return Math.max(1, s);
}

/* ---------------- events / log ---------------- */
function logEvent(sev,msg,opts){
  opts=opts||{};
  var id="ev"+(++S.env.seq);
  var row={id:id,t:nowT(),sev:sev,msg:msg};
  S.env.events.unshift(row);
  if(S.env.events.length>240) S.env.events.pop();
  var live=$("srLive"); if(live){ live.textContent = sev.toUpperCase()+": "+msg; }
  return id;
}
