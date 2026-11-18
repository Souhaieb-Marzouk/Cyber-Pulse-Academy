/* ================= STATE — single source of truth =================
   State object, localStorage persistence (same key and semantics as the
   original lab), shared lookups, and the confirmed reset. Rendering is
   called explicitly after mutations, exactly like the original engine. */

const LS_KEY = "n10_009_lab32_v1";
const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

let S = null;

/* ---------- state ---------- */
function defaultState(){
  return {
    v:1, mode:null, screen:"gate", briefingSeen:false,
    wo:{},                                    // objId -> {status, attempts, hint, passed}
    env:{
      lamps:{}, flags:{}, highFlags:{}, noticePicks:{},
      timeline:[], timelineUsed:{},
      defs:{eol:"",eos:""}, eosChecks:{},
      classify:{}, evidence:{},
      bench:{device:null, actions:{}, toggles:{}},
      incidentSeq:[], incidentUsed:{},
      rolloutSeq:[], rolloutUsed:{}, rolloutRollback:false,
      gate:{routes:{}, steps:{}},
      ledger:{}, matrix:{},
      fwTarget:"", fwReason:"",
      riskFacts:{}
    },
    quiz:{answers:{}, correct:0, done:false, scorePct:0},
    score:{objPct:0, hintCostPts:0}
  };
}

function freshWoList(){
  const list = S.mode === "hard" ? OBJ_HARD : OBJ_MED;
  const wo = {};
  list.forEach(o => wo[o.id] = {status:"open", attempts:0, hint:0, passed:false});
  return wo;
}

function save(){ try{ localStorage.setItem(LS_KEY, JSON.stringify(S)); }catch(e){/* degrade gracefully */} }
function loadSaved(){ try{ const raw = localStorage.getItem(LS_KEY); return raw ? JSON.parse(raw) : null; }catch(e){ return null; } }

function deviceById(id){ return DEVICES.find(d => d.id === id); }
function woList(){ return S.mode === "hard" ? OBJ_HARD : OBJ_MED; }
function woState(id){ if(!S.wo[id]) S.wo[id] = {status:"open", attempts:0, hint:0, passed:false}; return S.wo[id]; }

/* ---------- reset ---------- */
function doReset(){
  try{ localStorage.removeItem(LS_KEY); }catch(e){}
  window.location.reload();
}
