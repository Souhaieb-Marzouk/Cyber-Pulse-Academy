/* js/state.js — single state object + localStorage persistence.
 * Same key, same save/restore/RESET semantics as the original (deep-merge on load,
 * try/catch around storage). Explicit targeted re-renders (no framework). */
'use strict';
/* ================= STATE & PERSISTENCE ================= */
var LSKEY='cv0004-lab-2-4-v1';
function freshState(){return{
 mode:null,finished:false,seenDone:false,hintsUsed:0,
 env:{region:'',vpc:'',subPub:'',subPriv:'',igw:false,nat:false,compSize:'',count:1,auto:false,storeType:'',storeTier:'',iops:1000,db:'',multiAz:false,sg:{},iam:'',tags:{environment:'',owner:'','cost-center':'','data-class':''},iac:{region:'',count:'',machine:'',env:''},provisioned:false,testsRun:false},
 audit:{method:{},stor:{},constraints:{},classify:{},fix:{},cause:{},drift:{},telo:{},ruleEv:{},ruleCond:{},verify:{},purch:{},budgetAlert:0,regionDeny:false,seq:SEQ_INIT.slice()},
 obj:{},quiz:{},hints:{}}}
var state=freshState();
function deepMerge(def,sav){if(sav===undefined||sav===null)return def;if(typeof def!=='object'||def===null||Array.isArray(def))return sav;var out={};Object.keys(def).forEach(function(k){out[k]=deepMerge(def[k],sav[k])});Object.keys(sav).forEach(function(k){if(!(k in out))out[k]=sav[k]});return out}
function load(){try{var raw=localStorage.getItem(LSKEY);if(!raw)return false;var s=JSON.parse(raw);if(!s||!s.mode)return false;state=deepMerge(freshState(),s);if(!state.audit.seq||state.audit.seq.length!==7)state.audit.seq=SEQ_INIT.slice();return true}catch(e){return false}}
function save(){try{localStorage.setItem(LSKEY,JSON.stringify(state))}catch(e){}}
function regById(id){return REGIONS.filter(function(r){return r.id===id})[0]}
function instById(id){return INSTANCES.filter(function(i){return i.id===id})[0]}
function tagsOk(){var t=state.env.tags;return Object.keys(TAGPOLICY).every(function(k){return t[k]===TAGPOLICY[k]})}
function objDef(id){return OBJ[state.mode].filter(function(o){return o.id===id})[0]}
function objList(){return OBJ[state.mode]}
