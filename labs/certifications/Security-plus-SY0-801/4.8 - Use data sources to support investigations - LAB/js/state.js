"use strict";
/* ======================================================
   SY0-801 4.8 Practice Lab — The Evidence Room · state.js
Single state object, localStorage persistence (key hlx408lab_v1), state
accessors (getO/getUI/curObj/objById) and the aria-live announcer.
   ====================================================== */
/* ===== ENGINE: state, helpers, board & sheet rendering ===== */
const LSKEY="hlx408lab_v1";
let S={v:1,mode:null,obj:{},stamps:{},ui:{},bench:{clauses:[]},quiz:{i:0,ans:[],done:false,correct:0},seen:{}};
function save(){try{localStorage.setItem(LSKEY,JSON.stringify(S))}catch(e){/* degrade gracefully */}}
function load(){try{const r=localStorage.getItem(LSKEY);if(r){const p=JSON.parse(r);if(p&&p.v===1)S=p}}catch(e){/* ignore */}}
function announce(m){const l=document.getElementById("live");l.textContent="";setTimeout(()=>{l.textContent=m},30)}
function getUI(id,def){if(!S.ui[id]){S.ui[id]=JSON.parse(JSON.stringify(def))}
 else{for(const k in def){if(!(k in S.ui[id]))S.ui[id][k]=JSON.parse(JSON.stringify(def[k]))}}
 return S.ui[id]}
function curObj(){return S.mode==="medium"?OBJM:OBJH}
function objById(id){return curObj().find(o=>o.id===id)||OBJM.concat(OBJH).find(o=>o.id===id)}
function getO(id){if(!S.obj[id])S.obj[id]={done:false,attempts:0,hints:0,firstTry:true,checked:false};return S.obj[id]}
