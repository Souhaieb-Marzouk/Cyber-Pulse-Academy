/* ══════════════════════════════════════════════════════════════════════
   js/ui.js — shared UI helpers: DOM/escape/toast/log utilities, screen
   + bay navigation, tool tabs, mode-dependent panel visibility, the
   objectives rail and focus chip, modals (focus-managed) and glossary.
   Load order: 3rd (top-level lets: toastT, modalOpener).
   ══════════════════════════════════════════════════════════════════════ */
"use strict";

/* ══════════════ UTILITIES ══════════════ */
const $=id=>document.getElementById(id);
function esc(s){ return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
let toastT=null;
function toast(msg){ const t=$("toast"); t.innerHTML=esc(msg)+'<span class="t-close" aria-hidden="true">✕</span>'; t.classList.add("show");
  $("ariaLog").textContent=msg; clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove("show"),3200); }
function logLine(el,html){ el.innerHTML+=html+"\n"; el.scrollTop=el.scrollHeight; }

/* ══════════════ RENDER: screens, stepper, tabs ══════════════ */
function showScreen(name){ S.screen=name;
  $("screenMode").classList.toggle("hidden",name!=="mode");
  $("screenBrief").classList.toggle("hidden",name!=="brief");
  $("screenLab").classList.toggle("hidden",name!=="lab");
  window.scrollTo({top:0}); save(); }

function showBay(n){ S.bay=n;
  [1,2,3,4].forEach(i=>$("bay"+i).classList.toggle("hidden",i!==n));
  document.querySelectorAll(".step-btn").forEach(b=>{ const on=+b.dataset.bay===n;
    b.classList.toggle("active",on);
    b.classList.toggle("done",[1,2,3].includes(+b.dataset.bay)&&+(b.dataset.bay)<n); });
  save(); }

function bindTabs(){ document.querySelectorAll(".tabbar button").forEach(b=>b.addEventListener("click",()=>{
  document.querySelectorAll(".tabbar button").forEach(x=>{x.classList.remove("active");x.setAttribute("aria-selected","false");});
  b.classList.add("active"); b.setAttribute("aria-selected","true");
  ["scan","ipam","cspm","code","pentest"].forEach(t=>$("tool-"+t).classList.toggle("hidden",t!==b.dataset.tab)); })); }

/* ══════════════ RENDER: mode-dependent panels ══════════════ */
function renderModePanels(){ const m=S.mode;
  $("rankPanelM").classList.toggle("hidden",m!=="medium");
  $("rankPanelH").classList.toggle("hidden",m!=="hard");
  $("planPanel").classList.toggle("hidden",m!=="medium");
  $("reportPanel").classList.toggle("hidden",m!=="medium");
  $("chainPanel").classList.toggle("hidden",m!=="hard");
  $("cvssPanel").classList.toggle("hidden",m!=="hard");
  $("stmtPanel").classList.toggle("hidden",m!=="hard");
  $("quizIntro").textContent = m==="medium"
    ?"6 concept questions, one at a time. Validate locks your answer and shows why; Next moves you on. Feeds the completion score."
    :"7 scenario judgments from this weekend's floor, one at a time. Analysis, not recall — validate to lock, then move on.";
}

/* ══════════════ OBJECTIVES RAIL ══════════════ */
function renderObjectives(){ const box=$("objList"); box.innerHTML="";
  objList().forEach(id=>{ const o=S.obj[id]||{passed:false,tries:0,hints:0,fb:null}; const d=OBJ[id];
    const el=document.createElement("div"); el.className="obj"+(o.passed?" passed":(o.tries&&!o.passed?" failed":""));
    el.innerHTML='<div class="obj-top"><span class="obj-dot"></span><div class="obj-body">'+
      '<div class="obj-sent"><b class="mono" style="color:var(--amber)">OBJ-'+id+'</b> — '+esc(d.txt)+'</div>'+
      '<div class="obj-meta"><span class="pill '+d.p.toLowerCase()+'">'+d.p+'</span>'+
      '<span class="chip">'+(d.bay==="brief"?"Knowledge Core":"BAY 0"+d.bay.slice(3))+'</span>'+
      (S.mode==="medium"?'<span class="chip c-teal">hints: '+(o.hints||0)+'/3</span>':'')+'</div>'+
      '<div class="obj-actions">'+
        (o.passed?'<button class="btn small" data-check="'+id+'">CHECK RESULTS</button>':'<button class="btn small primary" data-check="'+id+'">CHECK RESULTS</button>')+
        (S.mode==="medium"?'<button class="btn small ghost" data-hint="'+id+'"'+((o.hints||0)>=3?" disabled":"")+'>Hint</button>':'<button class="btn small ghost" data-hint="'+id+'"'+((o.hints||0)>=1?" disabled":"")+'>Nudge</button>')+
      '</div>'+(o.fb?'<div class="fb '+(o.ok?"ok":"no")+'">'+esc(o.fb)+'</div>':"")+'</div></div>';
    box.append(el); });
  box.querySelectorAll("[data-check]").forEach(b=>b.addEventListener("click",()=>runCheck(b.dataset.check)));
  box.querySelectorAll("[data-hint]").forEach(b=>b.addEventListener("click",()=>addHint(b.dataset.hint))); }

function renderFocus(){ const chip=$("focusChip");
  if(S.mode!=="medium"){ chip.classList.remove("show"); return; }
  const next=objList().find(id=>!(S.obj[id]||{}).passed);
  if(!next){ const allDone=objList().every(id=>(S.obj[id]||{}).passed);
    chip.classList.add("show");
    $("focusText").innerHTML=allDone&&!S.quiz.submitted?"<b>LINE CHECK OUTSTANDING</b> — submit the knowledge check to earn your certificate.":"All objectives passed — review the Safety Review Board notes.";
    $("focusGo").textContent=allDone&&!S.quiz.submitted?"Go":"Read";
    $("focusGo").onclick=()=>{ $("bayQuiz").scrollIntoView({behavior:"smooth"}); };
    return; }
  const d=OBJ[next]; chip.classList.add("show");
  $("focusText").innerHTML="<b>NEXT · OBJ-"+next+"</b> ("+d.p+") — "+esc(d.txt);
  $("focusGo").textContent="Go";
  $("focusGo").onclick=()=>{ if(d.bay==="brief") showScreen("brief"); else { showBay(+d.bay.slice(3)); $("bay"+d.bay.slice(3)).scrollIntoView({behavior:"smooth"}); } }; }

/* ══════════════ MODALS, GLOSSARY, RESET ══════════════ */
let modalOpener=null;
function openModal(id){ modalOpener=document.activeElement; $(id).classList.remove("hidden");
  const f=$(id).querySelector("button,select,input"); if(f) f.focus(); }
function closeModals(){ document.querySelectorAll(".overlay").forEach(o=>o.classList.add("hidden"));
  if(modalOpener&&document.contains(modalOpener)){ try{ modalOpener.focus(); }catch(e){} } modalOpener=null; }
function renderGlossary(){ $("glossaryList").innerHTML=GLOSSARY.map(([t,d])=>'<div class="glossary-item"><b>'+esc(t)+'</b><p>'+esc(d)+'</p></div>').join(""); }
