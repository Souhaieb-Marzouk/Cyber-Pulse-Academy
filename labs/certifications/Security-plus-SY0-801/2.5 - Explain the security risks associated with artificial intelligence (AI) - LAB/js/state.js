"use strict";
/* =====================================================================
   Harbor Watch — js/state.js
   Ported verbatim from the original framework lab (scripts/lab/p4_engine.js).
   Single plain-JS state object + localStorage persistence with the SAME
   storage key and save/restore/RESET semantics as the original.
   Static-port addition (behavior-neutral): a tiny subscribe/notify mechanism.
   ===================================================================== */

const LSKEY = "harborwatch-lab-v1";

function freshState(){return {
 v:1, mode:null, obj:{},
 quiz:{i:0, ans:{}, done:false, score:0},
 env:{
  vocab:{}, sort:{}, turns:{}, dsFlags:{}, dsAnn:"",
  m5a:"-1", m5b:"-1", m6a:"-1", m6b:"-1", m6c:"-1",
  rule:{source:"-1", pats:{}, thresh:"-1", action:"-1"},
  ev:{}, tune:"-1",
  m8:{}, corpus:{}, ret:"-1",
  biasA:"-1", biasB:"-1", biasC:"-1",
  deck:{}, ethics:"-1", seq:[],
  verd:{}, just:{},
  h3:{a:"-1", t1:"", t2:"", c:"", d:"-1"},
  h4:{sid:"", c1:"-1", c2:"-1", host:"", d1:false, d2:false, d3:false},
  h7:{a:"-1", b:"-1", c:"-1", d:"-1"}
 },
 done:false, stars:0, penalty:0
};}
let S = freshState();
function save(){try{localStorage.setItem(LSKEY, JSON.stringify(S));}catch(e){}}
function load(){try{const r=localStorage.getItem(LSKEY); if(r){const p=JSON.parse(r); if(p && p.v===1) S=p;}}catch(e){S=freshState();}}


/* ---- tiny pub/sub (static-port addition; subscriber = header sync) ---- */
const _subs = [];
function subscribe(fn){ _subs.push(fn); }
function notify(){ for(const fn of _subs){ try{ fn(); }catch(e){} } }
