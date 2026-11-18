/* ============================================================
   js/state.js — state container, localStorage persistence and state
   helpers (persistence key n1009-24-lab-v1, identical semantics to
   the original lab: deep-merge restore, confirmed wipe on reset).
   ============================================================ */
"use strict";
function shuffle(arr){
  const a=arr.slice();
  for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}
function ensureMatchOrder(force){
  const ids=MATCH_TERMS.map(t=>t.id);
  if(!S.matchOrder || force ||
     !Array.isArray(S.matchOrder.terms) || S.matchOrder.terms.length!==ids.length ||
     !Array.isArray(S.matchOrder.defs) || S.matchOrder.defs.length!==ids.length){
    S.matchOrder={terms:shuffle(ids), defs:shuffle(ids)};
  }
}
/* ================= CORE — state, persistence, render loop ================= */

const LS_KEY = "n1009-24-lab-v1";
let S = null;
let PICK = { matchTerm:null, dev:null };
let lastDoneCount = -1;

function defaultState(){
  return {
    v:1, mode:null, startedAt:null, tab:"briefing", finished:false,
    obj:{},                       // id -> {done,attempts,hints,stars,fb,parts}
    quiz:{i:0, answers:[], revealed:false, best:null, done:false},
    env:{ rowA:"left", rowB:"right", aisle:"hot", tilesOpen:false, cutoutsSealed:false,
          crac1:true, crac2:false, therm:24, rh:50,
          tLo:"", tHi:"", hLo:"", hHi:"",
          sensors:{cold:false, hot:false, floor:false, ceiling:false},
          fire:"", recovered:false },
    rack:{ slots:new Array(15).fill(null), sel:null, lockable:false },
    power:{ upsModel:"", loadW:"", circuitW:"", volt:"", gen:false, ats:false, spd:false, wiring:{} },
    drill:{}, seq:{power:[], plan:[]},
    triage:{ c0:"",c1:"",c2:"",c3:"",c4:"",c5:"", cause:"" },
    incidents:{}, wo:[], exam:{}, hardJust:"",
    match:{},                     // M1 term->def matches
    matchOrder:null,              // shuffled display order for the vocabulary board (R6)
    quizBest:null
  };
}

function save(){
  try{ localStorage.setItem(LS_KEY, JSON.stringify(S)); }catch(e){/* degrade gracefully */}
}
function load(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if(!raw) return null;
    const d = JSON.parse(raw);
    if(!d || d.v!==1) return null;
    const base = defaultState();
    // deep-merge shallowly per section
    S = Object.assign(base, d);
    S.env = Object.assign(defaultState().env, d.env||{});
    S.env.sensors = Object.assign(defaultState().env.sensors, (d.env||{}).sensors||{});
    S.rack = Object.assign(defaultState().rack, d.rack||{});
    if(!Array.isArray(S.rack.slots) || S.rack.slots.length!==15) S.rack.slots = new Array(15).fill(null);
    S.power = Object.assign(defaultState().power, d.power||{});
    S.drill = d.drill||{}; S.seq = Object.assign({power:[],plan:[]}, d.seq||{});
    S.triage = Object.assign(defaultState().triage, d.triage||{});
    S.incidents = d.incidents||{}; S.wo = d.wo||[]; S.exam = d.exam||{};
    S.obj = d.obj||{}; S.match = d.match||{};
    S.quiz = Object.assign(defaultState().quiz, d.quiz||{});
    return S;
  }catch(e){ S = null; return null; }
}

function curObjs(){
  return Object.keys(OBJMETA).filter(id => OBJMETA[id].pillar && id[0] === (S.mode==="H"?"H":"M")).sort(
    (a,b)=>parseInt(a.slice(1),10)-parseInt(b.slice(1),10));
}
function objState(id){
  if(!S.obj[id]) S.obj[id] = {done:false, attempts:0, hints:0, stars:0, fb:"", parts:null};
  return S.obj[id];
}
