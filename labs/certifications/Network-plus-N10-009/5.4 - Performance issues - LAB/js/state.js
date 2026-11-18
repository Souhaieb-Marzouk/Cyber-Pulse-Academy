/* ===== js/state.js — state, persistence, identity =====
   Same localStorage key ('ckcr_signalbench_v1'), same shape, same save/restore
   and guarded-reset semantics as the original. */

'use strict';

/* ===== CKCR SIGNAL BENCH — app core: state, persistence, checks, charts, widgets ===== */'use strict';
const LS_KEY = 'ckcr_signalbench_v1';


const ORDER_MED  = OBJ_MED.map(o=>o.id);


const ORDER_HARD = OBJ_HARD.map(o=>o.id);


const OBJ_BY_ID = {};
OBJ_MED.concat(OBJ_HARD).forEach(o=>{OBJ_BY_ID[o.id]=o;});


/* ---------- state ---------- */
function ENV0(){return{
  qosVoip:false, rateLimitLoop:false, uplinkUpgrade:false, reschedBackup:false,
  patchReplaced:false, portLocked:false, verifyRun:false, newSwitch:false,
  bandSteer:false, kitchenMoved:false, width24:'40',
  alarmTh:90, alarmMin:60, alarmWin:false, flag_10:null, flag_02:null,
  apChan_CAFE1:'6', apChan_CAFE2:'10', apChan_ROAST1:'1', apChan_ROAST2:'1', apChan_ROAST3:'11',
  after:{fixCongest:null, fixLoss:null, fixRF:null}
};}


function S0(){return{ mode:null, objs:{}, quiz:{answers:{}, submitted:false, score:null}, reportSeen:false, started:Date.now() };}


let state = S0();


let env = ENV0();


function objState(id){ if(!state.objs[id]) state.objs[id]={passed:false, attempts:0, hints:0, answers:{}}; return state.objs[id]; }


function persistNow(){ if(window.__ckcrResetting) return; try{ localStorage.setItem(LS_KEY, JSON.stringify({v:1, mode:state.mode, objs:state.objs, env:env, quiz:state.quiz, reportSeen:state.reportSeen, started:state.started})); }catch(e){} }


let saveT=null;


function save(){ clearTimeout(saveT); saveT=setTimeout(persistNow, 120); }


function load(){
  let raw=null; try{ raw=localStorage.getItem(LS_KEY); }catch(e){ return; }
  if(!raw) return;
  try{
    const d=JSON.parse(raw);
    state.mode = d.mode||null;
    state.objs = (d.objs&&typeof d.objs==='object')? d.objs : {};
    state.quiz = Object.assign(S0().quiz, d.quiz||{});
    state.reportSeen = !!d.reportSeen;
    state.started = d.started||Date.now();
    env = Object.assign(ENV0(), d.env||{});
    env.after = Object.assign(ENV0().after, (d.env&&d.env.after)||{});
  }catch(e){ /* corrupted state -> pristine */ }
}


function norm(v){ return String(v==null?'':v).trim().toLowerCase().replace(/\s+/g,''); }
