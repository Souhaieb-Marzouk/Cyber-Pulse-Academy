/* ============================================================
   js/app.js — interaction layer: field binding, sequence placement,
   sensor toggles, the delegated event wiring (click/change/input/
   keydown) and boot (saved-session detection).
   ============================================================ */
"use strict";

/* ---------------- event wiring ---------------- */
function setField(path, value){
  const parts=path.split("."); let o=S;
  for(let i=0;i<parts.length-1;i++){
    if(typeof o[parts[i]]!=="object" || o[parts[i]]===null) o[parts[i]]={};
    o=o[parts[i]];
  }
  o[parts[parts.length-1]]=value;
}
function placeSeq(list, id){
  if(S.seq[list].includes(id)) return;
  if(S.seq[list].length>= (list==="power"?SEQ_POWER.length:SEQ_PLAN.length)) return;
  S.seq[list].push(id);
}
function toggleSensor(k){ S.env.sensors[k]=!S.env.sensors[k]; announce((S.env.sensors[k]?"Placed ":"Removed ")+({cold:"cold-aisle intake sensor",hot:"hot-aisle sensor",floor:"under-floor leak sensor",ceiling:"ceiling smoke sensor"}[k])); }

document.addEventListener("click", function(e){
  if(e.target.classList && e.target.classList.contains("modal")){ closeModals(); return; } // backdrop click closes (R7)
  const t=e.target.closest("[data-action],[data-sensor],[data-tab]");
  if(!t) return;
  const a=t.getAttribute("data-action");
  if(!a && t.getAttribute("data-tab")){ S.tab=t.getAttribute("data-tab"); refresh(); return; }
  if(t.getAttribute("data-sensor") && !a){ toggleSensor(t.getAttribute("data-sensor")); refresh(); return; }
  const id=t.getAttribute("data-id"), tab=t.getAttribute("data-tab");
  switch(a){
    case "select-mode": selectMode(t.getAttribute("data-mode")); break;
    case "resume": enterLab(); break;
    case "set-tab": S.tab=tab; refresh(); break;
    case "open-punch": document.getElementById("punch").classList.add("open");
      document.getElementById("punchToggle").setAttribute("aria-expanded","true"); break;
    case "close-punch": document.getElementById("punch").classList.remove("open");
      document.getElementById("punchToggle").setAttribute("aria-expanded","false"); break;
    case "close-modal": closeModals(); break;
    case "gloss-open": renderGlossary(); openModal("modal-gloss"); break;
    case "debrief-open": renderDebrief(); openModal("modal-debrief"); break;
    case "quiz-open": S.quiz.i=0; S.quiz.answers=[]; renderQuiz(); openModal("modal-quiz"); break;
    case "quiz-pick": S.quiz.answers[S.quiz.i]=Number(t.getAttribute("data-i")); renderQuiz(); break;
    case "quiz-next": S.quiz.i++; renderQuiz(); break;
    case "quiz-prev": S.quiz.i=Math.max(0,S.quiz.i-1); renderQuiz(); break; // already-checked answers stay locked (R2)
    case "quiz-restart": S.quiz.i=0; S.quiz.answers=[]; renderQuiz(); break;
    case "reset-open": openModal("modal-reset"); break;
    case "reset-cancel": closeModals(); break;
    case "reset-confirm": try{localStorage.removeItem(LS_KEY);}catch(_){} location.reload(); break;
    case "finish-open": renderDone(); openModal("modal-done"); break;
    case "check": checkObjective(id); {
        const el=document.getElementById("punch-"+id); if(el) el.scrollIntoView({block:"nearest",behavior:"smooth"});
      } break;
    case "hint": giveHint(id); break;
    case "match-term": {
        if(S.match[id]){ delete S.match[id]; }
        else PICK.matchTerm = (PICK.matchTerm===id? null : id);
        refresh(); break; }
    case "match-def": {
        if(!PICK.matchTerm){ announce("Pick a term first (left column), then its definition."); return; }
        const owner=Object.keys(S.match).find(k=>S.match[k]===id);
        if(owner) delete S.match[owner];
        S.match[PICK.matchTerm]=id; PICK.matchTerm=null; refresh(); break; }
    case "match-reset": S.match={}; PICK.matchTerm=null; ensureMatchOrder(true); refresh(); break;
    case "pick-dev": PICK.dev=(PICK.dev===id?null:id); refresh(); break;
    case "slot": {
        const i=Number(t.getAttribute("data-i")); const occ=S.rack.slots[i];
        if(occ){ // remove whole device (or single blank cell)
          if(occ==="blank"){ S.rack.slots[i]=null; }
          else { for(let k=0;k<S.rack.slots.length;k++) if(S.rack.slots[k]===occ) S.rack.slots[k]=null; }
        } else if(PICK.dev){
          const d=DEV(PICK.dev);
          if(i+d.u-1>14){ announce("That device does not fit above U"+(i+1)+" — pick a lower slot."); return; }
          for(let k=i;k<i+d.u;k++) if(S.rack.slots[k]){ announce("No room — those units are occupied."); return; }
          for(let k=i;k<i+d.u;k++) S.rack.slots[k]=PICK.dev;
          if(PICK.dev!=="blank") PICK.dev=null;
        } else { announce("Select a device chip first, then click a slot."); return; }
        refresh(); break; }
    case "clear-rack": S.rack.slots=new Array(15).fill(null); refresh(); break;
    case "toggle-lock": S.rack.lockable=!S.rack.lockable; refresh(); break;
    case "seq-add": placeSeq(t.getAttribute("data-list"), id); refresh(); break;
    case "seq-remove": S.seq[t.getAttribute("data-list")].splice(Number(t.getAttribute("data-i")),1); refresh(); break;
    case "toggle-power": { const k=t.getAttribute("data-k"); S.power[k]=!S.power[k]; refresh(); break; }
    case "toggle-env": { const k=t.getAttribute("data-k"); S.env[k]=!S.env[k]; refresh(); break; }
    case "toggle-row": { const k=t.getAttribute("data-row"); S.env[k]=(S.env[k]==="right"?"left":"right"); refresh(); break; }
    case "set-aisle": S.env.aisle=t.getAttribute("data-v"); refresh(); break;
    case "toggle-crac": { const k=t.getAttribute("data-k"); S.env[k]=!S.env[k]; refresh(); break; }
    case "toggle-sensor": toggleSensor(t.getAttribute("data-k")); refresh(); break;
    case "wo-toggle": { const i=Number(t.getAttribute("data-line"));
        if(S.wo.includes(i)) S.wo=S.wo.filter(x=>x!==i); else S.wo.push(i);
        t.closest(".wo-line").classList.toggle("picked", S.wo.includes(i)); save(); break; }
    case "run-recovery": {
        if(S.env.crac2 && !S.env.crac1 && aisleOk() && envInBand()){
          S.env.recovered=true; announce("Recovery simulation: intake back to "+S.env.therm.toFixed(1)+" °C — in band. Room recovered.");
        } else {
          announce("Recovery blocked: need CRAC-2 on, CRAC-1 left offline, correct airflow state and setpoints in band.");
        }
        refresh(); break; }
  }
});

document.addEventListener("change", function(e){
  const el=e.target;
  if(el.matches("[data-field]")){
    const f=el.getAttribute("data-field");
    let v=el.value;
    if(f==="env.therm"||f==="env.rh") v=parseFloat(v)||0;
    setField(f, v);
    refresh();
  }
});

document.addEventListener("input", function(e){
  const el=e.target;
  if(el.matches('input[type=range][data-field]')){
    const f=el.getAttribute("data-field");
    setField(f, parseFloat(el.value));
    if(f==="env.therm" && document.getElementById("readTherm")) document.getElementById("readTherm").textContent=parseFloat(el.value).toFixed(1)+" °C";
    if(f==="env.rh" && document.getElementById("readRh")) document.getElementById("readRh").textContent=el.value+" %";
    renderMap(); save();
  }
});

document.addEventListener("keydown", function(e){
  if((e.key==="Enter"||e.key===" ") && e.target.classList && e.target.classList.contains("hs")){
    e.preventDefault();
    const el=e.target;
    if(typeof el.click==="function") el.click();
    else el.dispatchEvent(new MouseEvent("click",{bubbles:true}));
  }
  if(e.key==="Escape"){ closeModals(); document.getElementById("punch").classList.remove("open"); }
});

/* ---------------- boot ---------------- */
(function boot(){
  const loaded=load();
  if(loaded && loaded.mode){
    document.getElementById("resumeWrap").hidden=false;
    document.getElementById("resumeInfo").textContent =
      `Saved ${loaded.mode==="H"?"Hard":"Medium"} session — objectives ${Object.keys(loaded.obj).filter(k=>loaded.obj[k]&&loaded.obj[k].done).length} signed.`;
  }
})();
