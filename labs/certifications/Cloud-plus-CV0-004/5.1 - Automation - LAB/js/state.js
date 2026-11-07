/* ============================================================
   THE AUTOMATION WORKS — Cloud+ CV0-004 · Lesson 5.1 practice lab
   js/state.js — state store, localStorage persistence, helpers

   Faithful 1:1 static port of the original single-file lab.
   Code lines are unchanged; they were only regrouped per concern.
   Load order: state.js -> ui.js -> data.js -> objectives.js -> quiz.js -> app.js
   (data.js must come after ui.js: work-order machine hooks call cvHook at load.)
   ============================================================ */
"use strict";
/* ================= CORE: state, persistence, helpers ================= */
const LSKEY = "cyberlab-automation-works-v1";
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const getE = (k) => (S.env[k] = S.env[k] || {});
let S = null;

function freshState(mode){ return {v:1, mode, obj:{}, attempts:{}, hints:{}, hintOpen:{}, skip:{}, env:{}, quiz:{ans:{}, done:false, score:0, answered:0}, completed:false, stars:0}; }
function save(){ try{ localStorage.setItem(LSKEY, JSON.stringify(S)); }catch(e){ /* degrade gracefully */ } }
function loadState(){ try{ const r = localStorage.getItem(LSKEY); return r ? JSON.parse(r) : null; }catch(e){ return null; } }
function announce(msg){ const l = $("live"); if(!l) return; l.textContent = ""; requestAnimationFrame(()=>{ l.textContent = msg; }); }
function shuffle(a){ const c = a.slice(); for(let i=c.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [c[i],c[j]]=[c[j],c[i]]; } return c; }

/* current mode's work-order set */
const WOS = () => (S.mode==="hard" ? WO_HARD : WO_MED);
