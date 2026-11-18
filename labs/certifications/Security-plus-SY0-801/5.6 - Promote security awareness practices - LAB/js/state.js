/* ============================================================================
   STATE — the single plain-JS store + persistence (same key and semantics as
   the original: localStorage 'hbf-progyard-v1', save version 2, debounced writes
   with a beforeunload flush, suppress flag so RESET survives the flush). */
const LS_KEY = "hbf-progyard-v1";

const DOCK_ORDER = ["binder","dock1","dock2","dock3","dock4","dock5","quiz","debrief"];

const DOCK_OBJ = {};

function rebuildDockObj(){ DOCK_OBJ.binder=[];DOCK_OBJ.dock1=[];DOCK_OBJ.dock2=[];DOCK_OBJ.dock3=[];DOCK_OBJ.dock4=[];DOCK_OBJ.dock5=[];DOCK_OBJ.quiz=[];DOCK_OBJ.debrief=[];
  (state.mode==="hard"?OBJ_HARD:OBJ_MED).forEach(o=>DOCK_OBJ[o.dock].push(o.id)); }

let state = null;

function freshState(){
  const objs = {};
  (OBJ_MED.concat(OBJ_HARD)).forEach(o=>objs[o.id]={done:false,attempts:0,firstTry:false,hints:0});
  return {
    v:2, mode:null, started:false, view:"binder", completed:false, stars:null, /* v2: QA audit rebuilt quiz — pre-audit saves invalidated deliberately */
    objectives:objs, hintsUsed:0, nudgesUsed:0,
    layer:null, layerConfirmed:false,
    artifacts:{}, pins:{}, activePin:null,
    campaign:{ payload:"payload-link", audience:"aud-all", difficulty:"diff-obvious", cadence:"cad-once", reportBtn:false, tone:"tone-pun", metrics:["m-click","m-names"], reason:null, launched:false },
    planner:{ g1:null,g2:null,g3:null,g4:null,g5:null },
    seq:SEQ_SHUFFLED.slice(), match:{ m0:null,m1:null,m2:null,m3:null,m4:null,m5:null },
    remote:{}, insider:{ action:null, why:null },
    anomalies:{}, dash:{ worst:null,kpi:null,verdict:null }, spike:{ p1:null,p2:null,p3:null },
    policy:{ ack:{}, chain:null },
    bec:[], becOrder:["dont-reply","verify-dir","report-sec","alert-fin","preserve"],
    quiz:{ answers:{}, done:false, score:0, current:null },
    visitedDocks:{}, q1open:false
  };
}

function save(){
  try{ localStorage.setItem(LS_KEY, JSON.stringify(state)); }catch(e){ /* degrade gracefully */ }
}

let saveT=null;

let saveSuppressed=false; /* QA fix: reset must survive the beforeunload flush */

function queueSave(){ clearTimeout(saveT); saveT=setTimeout(save,250); }
/* QA fix (B6): flush pending state synchronously when the tab closes — a change made in the last
   250 ms before unload must not be lost (debounce alone can drop it). */

window.addEventListener("beforeunload", ()=>{ if(!saveSuppressed) save(); });

function load(){
  try{
    const raw=localStorage.getItem(LS_KEY);
    if(!raw) return null;
    const s=JSON.parse(raw);
    if(!s || s.v!==2) return null;
    return s;
  }catch(e){ return null; }
}

/* ---- feedback + toast ---- */
