// STATE — persistence, helpers — MVHA Custody Bureau (Security+ SY0-801 · 3.3) — static port v4.
// Source: single-file lab, byte-identical content. All content is synthetic training material.

"use strict";
/* ================= STATE ================= */
const KEY="mvha-custody-lab-v1";
let S={mode:null,sec:"briefing",seen:{},obj:{},env:{},quiz:{answers:{},done:false,score:0},certSeen:false};
let storageOK=true;
function save(){ if(!storageOK) return; try{ localStorage.setItem(KEY,JSON.stringify(S)); }catch(e){ storageOK=false; } }
function load(){ try{ const r=localStorage.getItem(KEY); if(r){ const p=JSON.parse(r); if(p&&p.mode) S=Object.assign(S,p); } }catch(e){ storageOK=false; } }
const $=(s,r)=>(r||document).querySelector(s);
const $$=(s,r)=>Array.from((r||document).querySelectorAll(s));
const PILL={U:"Understand",R:"Recognize",D:"Detect",M:"Mitigate"};
function objsFor(mode){ return Object.keys(OBJ).filter(k=>OBJ[k] && (mode==="medium"?k[0]==="m":k[0]==="h")); }
function announce(msg){ const el=$("#sr"); el.textContent=""; setTimeout(()=>{el.textContent=msg;},30); }
function esc(s){ return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
