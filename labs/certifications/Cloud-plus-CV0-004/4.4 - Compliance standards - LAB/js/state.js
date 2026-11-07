'use strict';
/* state.js — the single plain-JS state store: one object S, localStorage
// persistence under the SAME key as the original, and the answer setters.
// Re-render is explicit (renderAll / partial), exactly like the original.
 */
const LSKEY='cloudplus-44-lab-v1';
let S={mode:null,tab:'briefing',env:{},checks:{},quiz:{ans:{},locked:{}}};
function save(){try{localStorage.setItem(LSKEY,JSON.stringify(S));}catch(e){}}
function load(){try{const r=localStorage.getItem(LSKEY);if(!r)return;const p=JSON.parse(r);
 if(p&&typeof p==='object'){S={mode:p.mode||null,tab:p.tab||'briefing',env:p.env||{},checks:p.checks||{},quiz:(p.quiz&&typeof p.quiz==='object')?{ans:p.quiz.ans||{},locked:p.quiz.locked||{}}:{ans:{},locked:{}}};}}catch(e){}}
function put(k,v){S.env[k]=v;save();}
/* Fisher–Yates; used to keep pairing/ordering start orders from revealing answers (R6) */
/* when true (objective already stamped) every widget renders its answer locked (R2) */
let WLOCK=false;
/* store a row answer BOTH flat (key.row) and nested (key={row:val}) so validators can read either */
function putRow(key,row,val){
 put(key+'.'+row,val);
 const o=Object.assign({},aget(key)||{});o[row]=val;put(key,o);
}
function aget(k){return S.env[k];}
