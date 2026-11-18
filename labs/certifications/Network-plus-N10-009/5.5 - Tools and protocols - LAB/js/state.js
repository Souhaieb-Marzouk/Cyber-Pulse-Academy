/* =====================================================================
   SIGNAL PATH · TOOL BENCH — Network+ N10-009 Lesson 5.5 (static port v4)
   js/state.js — persistence key, DOM helpers, lab state, save/restore.
   Ported verbatim from the certified single-file build; no logic changes.
   ===================================================================== */
'use strict';

/* ---------------- shared DOM helpers ---------------- */
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

/* ---------------- storage key (same as the original lab) ---------------- */
const KEY = 'n1009-55-toolbench-v1';

/* ================= state ================= */
function freshState(mode){
  return { v:1, mode: mode||null,
    obj:{}, inputs:{}, formChecked:{},
    term:{hist:[]}, cmds:[],
    an:{captured:false, filter:'', opened:null},
    cable:{sel:null, tested:[]},
    pair:null, steps:null,
    quiz:{idx:0, results:{}, done:false},
    doneShown:false };
}
function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}
function shufflePair(){ return {lo: shuffle(PAIRS.map((_,i)=>i)), ro: shuffle(PAIRS.map((_,i)=>i)), made:{}, checked:false, ok:false, attempts:0}; }
function shuffleSteps(){ return {order: shuffle(STEPS.map((_,i)=>i)), seq:[], checked:false, ok:false, attempts:0}; }

let S = freshState();
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){ /* storage full or blocked: lab keeps working in memory */ } }
function load(){ try{ const raw = localStorage.getItem(KEY); if(!raw) return null; const p = JSON.parse(raw); if(!p || p.v!==1 || !p.mode) return null; return p; }catch(e){ return null; } }
