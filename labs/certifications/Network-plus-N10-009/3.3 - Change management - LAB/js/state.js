/* ================================================================
   js/state.js
   Single state object + persistence. Same localStorage key and same
   save/restore/RESET semantics as the original.
   ================================================================ */
/* ================================================================
   STATE + PERSISTENCE
   ================================================================ */
const LS_KEY="n1009_chmgmt_dispatch_v1";
const FRESH_ENV={stage:0,f:{type:null,risk:null,window:null,rollback:null,cfgsource:null,affected:[],rfcmiss:[],purpose:null,test:null,empathy:null,decision:null,justify:null,monitor:[],doc:null,schema:null,ipam:null,priority:null},sandbox:0,deployed:false,deployFailed:false,rolledBack:false,notified:false,playing:false,seq:[],log:[]};
function freshState(){return{mode:null,floorOpened:false,active:null,evTab:"topology",cfgTab:"HQ-CORE-01",env:{},gv:{},tipClosed:false,drift:{device:null,delta:null,cls:null,who:null,rem:null,ds:[],fwOk:false,flapOk:false},topoInstalled:false,concept:{k1:null,k2:null,k3:null,k4:null},obj:{},quiz:{pick:{},checked:{}},completionShown:false};}
let S=freshState();
function E(id){if(!S.env[id])S.env[id]=JSON.parse(JSON.stringify(FRESH_ENV));return S.env[id];}
function F(id){return E(id).f;}
function OBJ(id){if(!S.obj[id])S.obj[id]={done:false,attempts:0,hints:0};return S.obj[id];}
function save(){try{localStorage.setItem(LS_KEY,JSON.stringify(S));}catch(e){/* degrade gracefully */}}
function load(){try{const raw=localStorage.getItem(LS_KEY);if(raw){const p=JSON.parse(raw);if(p&&p.mode){S=Object.assign(freshState(),p);Object.keys(S.env).forEach(k=>S.env[k]=Object.assign(JSON.parse(JSON.stringify(FRESH_ENV)),S.env[k]));}}}catch(e){/* keep fresh state */}}

/* derived helpers */
const mode=()=>S.mode;
const objs=()=>OBJECTIVES[mode()]||[];
const objDoneCount=()=>objs().filter(o=>OBJ(o.id).done).length;
const allObjDone=()=>objs().length>0&&objDoneCount()===objs().length;
function stageOf(id){return E(id).stage;}
function isRejected(id){return id==="CHG-0424"&&F(id).decision==="reject";}
function eqSet(a,b){if(!Array.isArray(a))return false;const s1=[...new Set(a)].sort(),s2=[...new Set(b)].sort();return s1.length===s2.length&&s1.every((v,i)=>v===s2[i]);}