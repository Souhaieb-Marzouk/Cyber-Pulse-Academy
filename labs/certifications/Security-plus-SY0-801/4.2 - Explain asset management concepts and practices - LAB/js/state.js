"use strict";
/* =============================================================================
   js/state.js — single state object + persistence (localStorage) + setters.
   Same persistence key, same save/restore/RESET semantics as the original
   (localStorage with in-memory fallback; resume exactly; wipe() for RESET).
   The original's architecture is "mutate state, then targeted re-render";
   that explicit-render contract is preserved 1:1 instead of introducing a
   pub/sub layer (behavioral parity first — see Conversion Notes).
   ========================================================================== */

const LSKEY="sy0801-42-asset-lab-v1";
let MEM=null;
function freshState(){return{v:1,mode:null,station:"briefing",open:[],
  env:{lifecycle:[],reconM:{dev:{},reg:{}},planSel:[],proc:{s1:"",s2:"",s3:""},roles:{},clsM:{},
    alertsSel:[],shadowSel:[],methodsM:{},gapsSel:[],seqM:[],certReq:[],certIns:[],retM:{},
    reconH:{dev:{},reg:{}},dataInvH:{},licH:{},licAct:{},sbomH:[],
    h4:{seq:[],methods:{},ev:[],gaps:[]},
    rogueH:{device:"",entry:"",contain:"",follow:""},
    riskH:{stmt:"",resp:"",owner:"",ctl:[],review:""},
    ctrlH:{map:{},phases:[]},pmH:{tech:"",stage:"",role:"",ctl:[]}},
  obj:{},quiz:{},finished:false};}
function save(){try{localStorage.setItem(LSKEY,JSON.stringify(S));}catch(e){MEM=S;}}
function load(){try{const r=localStorage.getItem(LSKEY);if(!r)return null;const p=JSON.parse(r);return Object.assign(freshState(),p);}catch(e){return MEM;}}
function wipe(){try{localStorage.removeItem(LSKEY);}catch(e){}MEM=null;}
let S=load()||freshState();
const objs=()=>OBJS.filter(o=>o.mode===(S.mode==="medium"?"M":"H"));
const rec=id=>{if(!S.obj[id])S.obj[id]={attempts:0,hints:0,done:false,msg:"",ok:null};return S.obj[id];};

/* ---------- setters (mutate S.env + persist) ---------- */
function setVal(k,id,sub,val){const e=S.env;
  switch(k){
    case"proc":e.proc[id]=val;break; case"roles":e.roles[id]=val;break; case"clsM":e.clsM[id]=val;break;
    case"retM":e.retM[id]=val;break; case"methodsM":e.methodsM[id]=val;break;
    case"inv":e.dataInvH[id]=Object.assign({},e.dataInvH[id],{[sub]:val});break;
    case"licH":e.licH[id]=val;break; case"licAct":e.licAct[id]=val;break; case"h4methods":e.h4.methods[id]=val;break;
    case"rogueH":e.rogueH[id]=val;break; case"riskH":e.riskH[id]=val;break;
    case"ctrlMap":e.ctrlH.map[id]=val;break; case"pmH":e.pmH[id]=val;break;
    case"reconMdev":e.reconM.dev[id]=val;break; case"reconMreg":e.reconM.reg[id]=val;break;
    case"reconHdev":e.reconH.dev[id]=val;break; case"reconHreg":e.reconH.reg[id]=val;break;
  }save();}
function arrFor(k){const e=S.env;switch(k){
  case"planSel":return e.planSel; case"alertsSel":return e.alertsSel; case"shadowSel":return e.shadowSel;
  case"gapsSel":return e.gapsSel; case"certReq":return e.certReq; case"certIns":return e.certIns;
  case"sbomH":return e.sbomH; case"h4ev":return e.h4.ev; case"h4gaps":return e.h4.gaps;
  case"riskCtl":return e.riskH.ctl; case"pmCtl":return e.pmH.ctl; case"lifecycle":return e.lifecycle;
  case"seqM":return e.seqM; case"h4seq":return e.h4.seq; case"phases":return e.ctrlH.phases;}return null;}
function toggleSel(k,id){const a=arrFor(k);const i=a.indexOf(id);if(i>=0)a.splice(i,1);else a.push(id);save();}
