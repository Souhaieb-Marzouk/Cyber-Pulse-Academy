/* ============================================================
   TRANSMISSION BENCH — STATIC BUILD · state
   STATE — the plain-JS store, localStorage persistence (save/load), fresh-state factories, and tiny DOM/escaping helpers. Same persistence key and semantics as the original lab.
   (Code re-filed 1:1 from the original single-file lab;
    see conversion-notes.md. Content and behavior unchanged.)
   ============================================================ */

"use strict";

var LS_KEY = "lab-n10-009-l16-transmission-media-v1";
var S = null;                 // whole state
var currentOrder = null;      // open order id
var SIG_UID = 0;

function $id(x){ return document.getElementById(x); }
function st(){ return S.modes[S.mode]; }
function objListFor(){ return S.mode === "hard" ? OBJ_HARD : OBJ_MED; }
function ordersFor(){ return S.mode === "hard" ? ORDERS_HARD : ORDERS_MED; }
function quizFor(){ return QUIZ[S.mode]; }
function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function el(tag, cls, html){ var e = document.createElement(tag); if(cls) e.className = cls; if(html !== undefined) e.innerHTML = html; return e; }

function freshMode(){
  return { objectives:{}, orders:{}, widgets:{}, matrix:{sel:{},prop:{}}, quiz:{answers:{},done:false}, hints:{}, finished:false, stars:null };
}
function freshState(){ return { v:1, mode:null, modes:{ medium:freshMode(), hard:freshMode() }, shared:{ libOpen:{} } }; }

function save(){
  try { localStorage.setItem(LS_KEY, JSON.stringify(S)); } catch(e){ /* degrade gracefully */ }
}
function load(){
  try {
    var raw = localStorage.getItem(LS_KEY);
    if(!raw) return freshState();
    var parsed = JSON.parse(raw);
    if(!parsed || parsed.v !== 1 || !parsed.modes) return freshState();
    // fill any missing fields (schema evolution)
    var base = freshState();
    ["medium","hard"].forEach(function(m){
      parsed.modes[m] = Object.assign(base.modes[m], parsed.modes[m] || {});
      parsed.modes[m].matrix = Object.assign({sel:{},prop:{}}, parsed.modes[m].matrix || {});
      parsed.modes[m].quiz = Object.assign({answers:{},done:false}, parsed.modes[m].quiz || {});
    });
    parsed.shared = Object.assign({libOpen:{}}, parsed.shared || {});
    return parsed;
  } catch(e){ return freshState(); }
}

var toastTimer = null;
function toast(msg){
  var t = $id("toast");
  t.textContent = msg;
  t.classList.add("show");
  if(toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){ t.classList.remove("show"); }, 2600);
}
function sr(msg){ $id("sr").textContent = ""; setTimeout(function(){ $id("sr").textContent = msg; }, 30); }
