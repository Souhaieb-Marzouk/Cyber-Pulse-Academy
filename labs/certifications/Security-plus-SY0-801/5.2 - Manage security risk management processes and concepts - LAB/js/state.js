'use strict';
/* =====================================================================
   STATE — the single plain-JS store, localStorage persistence (same key and
save/restore/RESET semantics as the original) and shared state accessors.
   ===================================================================== */

var LS_KEY='harborline-risk-tower-v1';

function freshState(){return {v:1,mode:null,reg:{},obj:{},ans:{},owners:{},treat:{},res:{},controls:{},chart:{},bench:{risk:'',treat:'',resL:'',resI:''},feed:{},seq:[],quiz:{ans:{},checked:{},idx:0,scored:false,correct:0,wrongIds:[]},doneSeen:false}}

var S=freshState();

function shuf(arr,seed){var h=0;for(var i=0;i<seed.length;i++){h=(h*31+seed.charCodeAt(i))>>>0}var a=arr.slice();for(var i=a.length-1;i>0;i--){h=(h*1103515245+12345)>>>0;var j=h%(i+1);var t=a[i];a[i]=a[j];a[j]=t}return a}

function save(){try{localStorage.setItem(LS_KEY,JSON.stringify(S));var d=$('saveDot');if(d){d.style.background='#2E8B57'}}catch(e){/* degrade gracefully */}}

function load(){try{var raw=localStorage.getItem(LS_KEY);if(raw){var p=JSON.parse(raw);if(p&&p.v===1){return p}}}catch(e){}return null}

function objSt(id){if(!S.obj[id])S.obj[id]={done:false,attempts:0,hints:0};return S.obj[id]}

function log(msg){var t=$('towerLog');if(!t)return;var p=document.createElement('p');var d=new Date();var hh=('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);p.innerHTML='<b>'+hh+'</b> — '+msg;t.appendChild(p);t.scrollTop=t.scrollHeight;if(t.children.length>40)t.removeChild(t.firstChild)}

function ansGet(id){return S.ans[id]||{}}

function currentDefs(){return S.mode==='medium'?OBJ_M:OBJ_H}
