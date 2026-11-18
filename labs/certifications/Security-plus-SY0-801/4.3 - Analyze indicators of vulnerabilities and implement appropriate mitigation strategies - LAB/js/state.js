/* ══════════════════════════════════════════════════════════════════════
   js/state.js — single plain-JS state object + localStorage persistence.
   Same persistence key (sy0801-lab-43-v2), same save/restore/RESET
   semantics as the original: save() serializes S; load() merges a saved
   payload onto a pristine default (unknown keys ignored); RESET deletes
   the key and reloads. Load order: 2nd (needs js/data.js constants).
   ══════════════════════════════════════════════════════════════════════ */
"use strict";

/* ══════════════ STATE ══════════════ */
const LS_KEY = "sy0801-lab-43-v2";
const MODE_OBJS = { medium:["M1","M2","M3","M4","M5","M6","M7","M8","M9","M10","M11","M12"],
                    hard:["H1","H2","H3","H4","H5","H6","H7","H8","H9"] };

function defaultState(){ return {
  mode:null, screen:"mode", bay:1,
  phaseOrder:[...PHASES], phaseOrderOK:false,
  scans:{}, crashLesson:false,
  ipamReconciled:false, ipamAdded:false, cspmRun:false,
  codeCorrect:false, codePicked:null,
  planA:"", planB:"", planC:"",
  discovered:{},
  rankM:[...RANK_M], rankH:[...RANK_H],
  chain:[], stmts:[],
  wo:{}, exc:{isolate:false, owner:"", review:""}, wafF1:false,
  cvssA:"", cvssAM:"", cvssB:"", cvssBM:"",
  reportA:"", reportB:"", reportC:"",
  rts:{ran:false, dec107:"", reboot107:false, dec106:"", decSanity:"", back109:false, sweeps:0},
  validated:{},
  obj:{}, quiz:{picked:{}, checked:{}, current:0, done:false, submitted:false, correct:0, total:0, order:{}},
  hintsUsed:0, certShown:false
};}
let S = defaultState();

function save(){ try{ localStorage.setItem(LS_KEY, JSON.stringify(S)); }catch(e){} }
function load(){ try{ const raw=localStorage.getItem(LS_KEY); if(!raw) return;
  const p=JSON.parse(raw); const d=defaultState();
  for(const k in d){ if(p[k]!==undefined) d[k]=p[k]; }
  S=d; }catch(e){ S=defaultState(); } }
