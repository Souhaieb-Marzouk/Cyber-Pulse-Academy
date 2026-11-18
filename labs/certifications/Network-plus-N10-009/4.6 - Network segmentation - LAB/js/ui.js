/* The Flat Net Incident — static build (N10-009 4.6).
   js/ui.js — Feedback UI (toast/modal/glossary), inline icons, shell render,
   mode select, stage dispatch.
   Extracted verbatim from download/flat-net-segmentation-lab.html (v2, post-audit). */
"use strict";
/* ================= FEEDBACK UI ================= */
var toastTimer=null;
function toast(msg){
  var t=document.getElementById("toast"); if(!t) return;
  t.textContent=msg; t.classList.add("show");
  if(toastTimer) clearTimeout(toastTimer);
  toastTimer=setTimeout(function(){ t.classList.remove("show"); },4200);
}
var lastFocus=null;
function showModal(html){
  var v=document.getElementById("veil"), m=document.getElementById("modal");
  lastFocus=document.activeElement;
  m.innerHTML=html; v.classList.add("show");
  var f=m.querySelector("button,select,input,a"); if(f) f.focus();
}
function closeModal(){
  document.getElementById("veil").classList.remove("show");
  if(lastFocus && lastFocus.focus){ try{ lastFocus.focus(); }catch(e){} }
}
function openGlossary(term){
  var html='<h3>Field Glossary</h3><div class="note">Every term below is exam vocabulary for Objective 4.6 or its supporting toolbox.</div>';
  GLOSSARY.forEach(function(g){
    html+='<div class="gitem" id="g-'+cssId(g[0])+'"><b>'+g[0]+'</b><p>'+g[1]+'</p></div>';
  });
  html+='<div class="nextrow"><button class="btn ghost" onclick="closeModal()">Close</button></div>';
  showModal(html);
  if(term){ var el=document.getElementById("g-"+cssId(term)); if(el) el.scrollIntoView({block:"center"}); }
}
function cssId(s){ return s.replace(/[^a-zA-Z0-9]/g,"_"); }
function termSpan(t){ return '<span class="term" tabindex="0" role="button" aria-label="Glossary: '+t+'" onclick="openGlossary(\''+t.replace(/'/g,"\\'")+'\')" onkeydown="if(event.key===\'Enter\'){openGlossary(\''+t.replace(/'/g,"\\'")+'\')}">'+t+'</span>'; }

/* ================= ICONS (inline Lucide-style SVG) ================= */
function icon(name,size){
  size=size||16;
  var paths={
    shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    zones:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M17.5 14v7M14 17.5h7"/>',
    lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
    flask:'<path d="M9 3h6M10 3v6L5 20a1 1 0 0 0 .9 1.4h12.2a1 1 0 0 0 .9-1.4L14 9V3"/>',
    book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    grid:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>',
    check:'<path d="M20 6 9 17l-5-5"/>',
    x:'<path d="M18 6 6 18M6 6l12 12"/>',
    reset:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    bulb:'<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V17h6v-.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z"/>',
    arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
    back:'<path d="M19 12H5M11 18l-6-6 6-6"/>',
    quiz:'<path d="M9 9a3 3 0 1 1 4.5 2.6c-.9.5-1.5 1.1-1.5 2.1v.3"/><path d="M12 17.5h.01"/><circle cx="12" cy="12" r="10"/>',
    flag:'<path d="M4 22V4s1.5-2 5-2 5 2 8 2 3-1 3-1v10s-1.5 1-3 1-5-2-8-2-5 2-5 2"/>',
    search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'
  };
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[name]||"")+'</svg>';
}

/* fixed display permutations — authored order must never reveal correct answers (audit R4/R6) */
function perm(arr,p){ return p.map(function(i){return arr[i];}); }
var P_BEN=[4,1,6,3,0,5,2], P_TECH=[4,0,5,2,1,3], P_DEFS=[2,0,4,1,5,3], P_SRC=[4,0,5,1,6,2,3],
    P_REASONS=[3,0,4,1,5,2], P_NEEDS=[4,1,6,0,3,5,2], P_CONTROLS=[3,0,5,2,7,1,6,4],
    P_FRIDGE=[4,1,5,2,0,3], P_CONDS=[3,0,4,1,5,2], P_WL=[2,0,1], P_SEQ=[6,1,4,0,5,2,3];

/* ================= SHELL RENDER ================= */
var STATIONS = [
  {n:1,name:"Briefing",ic:"flag"},
  {n:2,name:"Field Manual",ic:"book"},
  {n:3,name:"Evidence Locker",ic:"search"},
  {n:4,name:"Zone Board",ic:"zones"},
  {n:5,name:"Commissioning",ic:"flask"},
  {n:6,name:"Shift Exam",ic:"quiz"},
  {n:7,name:"Handover",ic:"check"}
];
function stationDone(n){
  var ids=OBJECTIVES.filter(function(o){return o.st===n && o.hard===(S.mode==="hard");}).map(function(o){return o.id;});
  if(!ids.length) return S.visited.indexOf(n)>=0;
  return ids.every(function(id){return S.obj[id]&&S.obj[id].done;});
}
function renderConsole(){
  var done=objDoneCount(), tot=activeObjs().length;
  var h='<header class="console" role="banner">'
    +'<div class="mark">'+icon("zones",26)+'<div><div class="t1">The Flat Net Incident</div><div class="t2">Segmentation console · N10-009 Obj 4.6 · training range</div></div></div>'
    +'<div class="spacer"></div>'
    +'<span class="hchip">MODE <b>'+(S.mode==="hard"?"HARD":"MEDIUM")+'</b></span>'
    +'<span class="hchip">OBJ <b>'+done+'/'+tot+'</b></span>'
    +'<span class="hchip">MASTERY <b>'+mastery()+'%</b></span>'
    +'<span class="hstars" title="Live star rating" aria-label="Stars: '+starCount()+' of 5">'+starStr()+'</span>'
    +'<button class="hbtn" id="btn-dock" aria-label="Toggle objectives panel">'+icon("list")+' Objectives</button>'
    +'<button class="hbtn danger" id="btn-reset">'+icon("reset")+' Reset</button>'
    +'</header>';
  return h;
}
function renderRail(){
  var h='<nav class="rail" aria-label="Lab stations"><div class="rlab">Shift stations</div>';
  STATIONS.forEach(function(st){
    var locked = (S.mode==="medium" && st.n>1 && S.visited.indexOf(st.n-1)<0 && S.visited.indexOf(st.n)<0);
    var d=stationDone(st.n);
    h+='<button class="stn'+(S.station===st.n?" active":"")+((locked && S.station!==st.n)?" locked":"")+'" data-st="'+st.n+'" aria-current="'+(S.station===st.n?"true":"false")+'">'
      +'<span class="dot'+(d?" done":"")+'"></span><span class="num">'+st.n+'</span><span class="nm">'+st.name+'</span></button>';
  });
  h+='<div class="railnote">'+(S.mode==="medium"
    ?"Guided shift: stations unlock in order. Every check explains itself. Hints cost a little star shine."
    :"Rough shift: all stations open, one nudge per objective max, herrings everywhere. Efficiency drives the stars.")+'</div></nav>';
  return h;
}
function renderDock(){
  var done=objDoneCount(), tot=activeObjs().length;
  var h='<h3>Objectives <span class="oring" style="--p:'+(tot?Math.round(done/tot*100):0)+'" role="img" aria-label="'+done+' of '+tot+' objectives complete"><i>'+done+'/'+tot+'</i></span></h3>';
  h+='<div class="dockfilter">'+(S.mode==="hard"?"Hard mode — 9 broad challenges, one nudge max each":"Medium mode — 12 guided steps, 3 hint tiers each")+' · pillars: <span class="pill U">U</span> understand <span class="pill R">R</span> recognize <span class="pill D">D</span> detect <span class="pill M">M</span> mitigate</div>';
  var here=[], other=[];
  activeObjs().forEach(function(id){
    var o=OBJ(id); (o.st===S.station?here:other).push(id);
  });
  function card(id,ctx){
    var o=OBJ(id), st=S.obj[id]||{};
    var done=st.done;
    var isCtx = (o.st!==S.station);
    return '<div class="obj'+(done?" done":"")+(!isCtx&&o.st===S.station?" current":"")+'" data-obj="'+id+'">'
      +'<div style="display:flex;align-items:center;gap:8px">'
      +'<span class="st-ic '+(done?"ok":"no")+'">'+(done?"✓":"○")+'</span>'
      +'<span class="pill '+o.p+'" style="border-color:'+PILLAR[o.p][2]+';color:'+PILLAR[o.p][2]+'">'+o.p+'</span>'
      +'<span class="tag" style="margin-left:auto">'+id+'</span></div>'
      +'<div class="ot">'+o.title+'</div>'
      +(ctx?"":'<div class="owhy">'+o.why+'</div>')
      +(ctx?"":'<div class="obtns"><button class="btn sm" onclick="doCheck(\''+id+'\')">Check</button>'
        +'<button class="btn ghost sm" onclick="useHint(\''+id+'\')" aria-label="Hint for '+id+'">'+icon("bulb",14)+' '+(S.mode==="hard"?"Nudge":"Hint")+'</button></div>')
      +'<div class="ofb" id="dfb-'+id+'" data-ofb="'+id+'" role="status"></div>'
      +'</div>';
  }
  here.forEach(function(id){ h+=card(id,false); });
  if(other.length){
    h+='<h3 style="margin-top:14px">Other stations</h3>';
    other.forEach(function(id){ h+=card(id,true); });
  }
  return h;
}
function renderAll(){
  var app=document.getElementById("app");
  if(!S.mode){
    app.innerHTML=renderModeSelect();
    bindModeSelect();
    return;
  }
  var dockOpen = document.getElementById("dock") && document.getElementById("dock").classList.contains("open");
  app.innerHTML = renderConsole()
    +'<div class="workbench">'+renderRail()
    +'<main class="stage" id="stage">'+renderStage()+'</main>'
    +'<aside class="dock'+(dockOpen?" open":"")+'" id="dock" aria-label="Objectives tracker">'+renderDock()+'</aside>'
    +'</div>'
    +'<button class="docktoggle" id="btn-dock2">'+icon("list")+' Objectives '+objDoneCount()+'/'+activeObjs().length+'</button>';
  bindAll();
}
function bindShell(){
  Array.prototype.forEach.call(document.querySelectorAll(".stn"),function(b){
    b.addEventListener("click",function(){
      var n=parseInt(b.getAttribute("data-st"),10);
      var locked = (S.mode==="medium" && n>1 && S.visited.indexOf(n-1)<0 && S.visited.indexOf(n)<0);
      if(locked){ toast("Medium mode: finish station "+(n-1)+" first (its 'Next' button unlocks it)."); return; }
      goStation(n);
    });
  });
  var d1=document.getElementById("btn-dock"); if(d1) d1.addEventListener("click",toggleDock);
  var d2=document.getElementById("btn-dock2"); if(d2) d2.addEventListener("click",toggleDock);
  var r=document.getElementById("btn-reset"); if(r) r.addEventListener("click",confirmReset);
}
function toggleDock(){ var d=document.getElementById("dock"); if(d) d.classList.toggle("open"); }
function goStation(n){
  if(S.visited.indexOf(n)<0) S.visited.push(n);
  S.station=n; save(); renderAll();
  var st=document.getElementById("stage"); if(st) window.scrollTo({top:0,behavior:"smooth"});
}
function confirmReset(){
  showModal('<h3>Reset the range?</h3><p class="lead">This wipes your mode, every objective, all zoning, rules, quiz answers and saved progress, and returns to the mode select. The lab will be pristine.</p>'
    +'<div class="nextrow"><button class="btn ghost" id="rst-no">Keep my progress</button><button class="btn" id="rst-yes" style="background:var(--red);color:#fff">Reset everything</button></div>');
  document.getElementById("rst-no").addEventListener("click",closeModal);
  document.getElementById("rst-yes").addEventListener("click",function(){
    try{ localStorage.removeItem(LS_KEY); }catch(e){}
    S=freshState(); closeModal(); renderAll(); toast("Range reset — pristine state restored.");
  });
}

/* ================= MODE SELECT ================= */
function renderModeSelect(){
  return '<div class="modeveil">'
    +'<div class="synth"><b>SYNTHETIC TRAINING DATA</b> · fictional Cascadia Beverage Co. · every host, IP and log on this page is invented for practice</div>'
    +'<div class="kicker">CompTIA Network+ N10-009 · Objective 4.6 · Network segmentation</div>'
    +'<h1>The Flat Net Incident</h1>'
    +'<p class="sub">A bottling plant runs one flat VLAN — cameras, PLCs, guests and personal phones side by side. Last night that flatness let a smart camera with default credentials drive a Modbus pen through the pasteurizer. You are the network engineer on shift: learn why segmentation matters, rebuild the plant into zones, and prove the gates hold.</p>'
    +'<div class="modecards">'
    +'<div class="modecard"><div class="lv">MODE 01 — EDUCATIONAL</div><h2>Medium · guided shift</h2>'
    +'<ul><li>12 granular objectives, taken in order</li><li>3 hint tiers on every objective</li><li>Tolerant checks, teaching feedback on everything</li><li>Quiz: 6 concept questions</li></ul>'
    +'<p class="lead" style="font-size:12.5px">Best if you have read the lesson once and want to understand and apply it.</p>'
    +'<button class="modecard go" data-mode="medium">Start guided shift</button></div>'
    +'<div class="modecard"><div class="lv">MODE 02 — CHALLENGE</div><h2>Hard · rough shift</h2>'
    +'<ul><li>9 broad, multi-step challenges, free-roam from the start</li><li>No hints — one scored nudge max per objective</li><li>Noisy evidence, 3 red herrings, strict validation</li><li>Quiz: 7 scenario judgments</li></ul>'
    +'<p class="lead" style="font-size:12.5px">Best if you already know the terms and want to test mastery under pressure.</p>'
    +'<button class="modecard go" data-mode="hard">Start rough shift</button></div>'
    +'</div>'
    +'<p class="sub" style="font-size:12px">Both modes share the same evidence core. Progress auto-saves in your browser; Reset returns everything to pristine.</p>'
    +'</div>';
}
function bindModeSelect(){
  Array.prototype.forEach.call(document.querySelectorAll("[data-mode]"),function(b){
    b.addEventListener("click",function(){
      S.mode=b.getAttribute("data-mode"); S.station=1;
      if(S.visited.indexOf(1)<0) S.visited.push(1);
      save(); renderAll();
      toast(S.mode==="hard" ? "Rough shift started — all stations open. The evidence will lie to you." : "Guided shift started — head to the Briefing.");
    });
  });
}
/* ================= STAGE DISPATCH ================= */
function renderStage(){
  switch(S.station){
    case 1: return stBriefing();
    case 2: return stManual();
    case 3: return stEvidence();
    case 4: return stZoneBoard();
    case 5: return stCommission();
    case 6: return stQuiz();
    case 7: return stHandover();
  }
  return '<div class="panel"><h3>Offline</h3><p class="lead">Unknown station.</p></div>';
}
function nextBtn(label,n){
  return '<div class="nextrow"><button class="btn" data-goto="'+n+'">'+label+' '+icon("arrow")+'</button></div>';
}
function backBtn(n,label){
  return '<button class="btn ghost" data-goto="'+n+'">'+icon("back")+' '+(label||"Back")+'</button>';
}
function bindNav(){
  Array.prototype.forEach.call(document.querySelectorAll("[data-goto]"),function(b){
    b.addEventListener("click",function(){ goStation(parseInt(b.getAttribute("data-goto"),10)); });
  });
}
function objCardInline(id){
  var o=OBJ(id), st=S.obj[id]||{};
  return '<div class="obj'+(st.done?" done":"")+'" data-obj="'+id+'" style="margin-top:14px">'
    +'<div style="display:flex;align-items:center;gap:8px">'
    +'<span class="st-ic '+(st.done?"ok":"no")+'">'+(st.done?"✓":"○")+'</span>'
    +'<span class="pill '+o.p+'" style="border-color:'+PILLAR[o.p][2]+';color:'+PILLAR[o.p][2]+'">'+o.p+'</span>'
    +'<span class="tag" style="margin-left:auto">'+id+'</span></div>'
    +'<div class="ot">'+o.title+'</div><div class="owhy">'+o.why+'</div>'
    +'<div class="obtns"><button class="btn sm" onclick="doCheck(\''+id+'\')">Check</button>'
    +'<button class="btn ghost sm" onclick="useHint(\''+id+'\')">'+icon("bulb",14)+' Hint</button></div>'
    +'<div class="ofb" id="fb-'+id+'" data-ofb="'+id+'" role="status"></div></div>';
}

