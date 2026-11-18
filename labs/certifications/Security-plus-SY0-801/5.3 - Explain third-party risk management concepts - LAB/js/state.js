"use strict";
/* =========================================================================
   js/state.js — the store: state object, persistence, pub/sub, reset
   Same persistence semantics as the original lab:
   - same localStorage key, saved on every mutation
   - resume exactly (mode, phase, answers, stamps, quiz, feedback)
   - storage-unavailable degrades gracefully (lab still runs)
   - RESET returns to pristine after confirmation
   A tiny subscribe/notify mechanism carries cross-cutting state events;
   DOM updates otherwise stay the original's explicit render calls so
   behavior is identical (SC-D4).
   ========================================================================= */

/* Persistence key — identical to the original lab */
var STORAGE_KEY = "mvhn-cyberlab-sy0801-53-v1";

/* ----- tiny pub/sub ----- */
var __stateListeners = [];
function onChange(fn){ __stateListeners.push(fn); }
function notify(reason){
  for (var i = 0; i < __stateListeners.length; i++){ try { __stateListeners[i](reason); } catch(e){} }
}

function newObjState(){ return { done:false, tries:0, hint:0 }; }
function freshState(){ return { mode:null, phase:1, env:{}, obj:{}, lastFb:{}, lastQz:{}, quiz:{ answers:{}, tried:{}, checked:{}, picked:{} }, completed:false, storageOk:true }; }

var state = freshState();
var canStore = true;
try { localStorage.setItem("__mvhn_t","1"); localStorage.removeItem("__mvhn_t"); } catch(e){ canStore = false; state.storageOk = false; }

function save(){
  if (!canStore) return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch(e){
    canStore = false; state.storageOk = false;
    notify("storage-unavailable");   // app.js turns this into the same announcer message
  }
}

function load(){
  if (!canStore) return;
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (raw){ var s = JSON.parse(raw); if (s && s.mode){ state = s; if (!state.quiz) state.quiz = {answers:{},tried:{},checked:{},picked:{}}; if (!state.quiz.picked) state.quiz.picked = {}; if (!state.lastQz) state.lastQz = {}; if (!state.lastFb) state.lastFb = {}; if (!state.obj) state.obj = {}; } }
  } catch(e){ /* corrupted state — start fresh */ }
}
function objState(id){ if (!state.obj[id]) state.obj[id] = newObjState(); return state.obj[id]; }


/* ----- RESET (confirmed by the UI; returns the lab to pristine) ----- */
function doReset(){
  try { localStorage.removeItem(STORAGE_KEY); } catch(e){}
  state = freshState();
  $("reset-overlay").classList.remove("open"); $("reset-overlay").hidden = true;
  $("done-overlay").classList.remove("open"); $("done-overlay").hidden = true;
  lastOverlayTrigger = null;
  showModeScreen();
  announce("Lab reset — all progress cleared.");
}

