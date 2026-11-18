"use strict";

/* ============================================================================
   js/state.js — core: tiny DOM/escape helpers, hash utilities (WebCrypto with a
   documented deterministic fallback for file:// or insecure contexts), the single
   plain-JS state object, localStorage persistence (same key + save/restore/RESET
   semantics as the original, incl. flush-on-unload so fast reloads never lose progress).
   ============================================================================ */

const SKEY = "arhn-trust-fabric-v1";

const $ = (s) => document.querySelector(s);

const $$ = (s) => Array.from(document.querySelectorAll(s));

function freshState(mode){
  return {
    mode: mode,
    createdAt: Date.now(),
    active: "intro",
    env: {
      lane:{}, escrow:null, escrowWhy:null,
      ca:{}, ctype:{}, rev:{}, h2serial:"", h2check:null, h2root:null, h2seq:[],
      symasym:{}, levels:{}, proto:null, kx:null, kxwhy:null,
      posture:{}, postwhy:null,
      hashA:null, hashB:null, verdict:null, halgo:null,
      saltOn:false, saltwhy:null,
      sign:[], tampered:false, verified:null, props:{},
      h5verdict:null, h5ctrl:null, h6vuln:null, h6fix:null,
      cal:{}, h7seq:[],
      dossier:{}, h1class:{},
      mitre:{}, props9:{},
      quiz:{}
    },
    obj:{},
    quizIdx:0,
    completedShown:false,
    nudgeUsed:false
  };
}

function loadState(){
  try{ const raw = localStorage.getItem(SKEY); if(!raw) return null; const s = JSON.parse(raw); if(s && s.mode && s.env) return s; }catch(e){}
  return null;
}

let saveTimer = null;

let saveWarned = false;

function flushSave(){
  if(saveTimer){ clearTimeout(saveTimer); saveTimer=null; try{ localStorage.setItem(SKEY, JSON.stringify(state)); }catch(e){ if(!saveWarned){ saveWarned=true; announce("Progress could not be saved (storage unavailable or full) — the lab still works in this session."); } } }
}

function save(){
  if(saveTimer) return;
  saveTimer = setTimeout(flushSave, 150);
}

window.addEventListener("beforeunload", flushSave);

document.addEventListener("visibilitychange", ()=>{ if(document.visibilityState==="hidden") flushSave(); });

let state = null;

/* ---------- hashing ---------- */

function fallbackHash(str){ /* deterministic simulated digest (FNV-1a x4), used only if WebCrypto is unavailable */
  let out = "";
  for(let r=0;r<4;r++){
    let h = 0x811c9dc5 ^ (r*0x9e3779b9);
    for(let i=0;i<str.length;i++){ h ^= str.charCodeAt(i)+r; h = Math.imul(h, 0x01000193) >>> 0; }
    out += h.toString(16).padStart(8,"0");
  }
  return out;
}
async function sha256hex(str){
  try{
    if(crypto && crypto.subtle){
      const b = new TextEncoder().encode(str);
      const d = await crypto.subtle.digest("SHA-256", b);
      return Array.from(new Uint8Array(d)).map(x=>x.toString(16).padStart(2,"0")).join("");
    }
  }catch(e){}
  return fallbackHash(str);
}

const cut32 = (h) => h.slice(0,32);

/* ---------- announcements & feedback ---------- */

function escapeHtml(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }

function el(tag, cls, html){ const n=document.createElement(tag); if(cls) n.className=cls; if(html!==undefined) n.innerHTML=html; return n; }
