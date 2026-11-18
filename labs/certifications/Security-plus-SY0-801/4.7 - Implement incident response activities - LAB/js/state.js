/* ============================================================
   Larkspur Logistics — INC-2026-0117 · Incident Response Lab
   CompTIA Security+ SY0-801 · Lesson 4.7 (training exercise)
   File: js/state.js
   State store, persistence (localStorage key ir47lab.v1), derived selectors, simulated clock formatters.
   Content extracted 1:1 from the audited lab (static port v4).
   ============================================================ */
/* ============ ENGINE ============ */
const KEY='ir47lab.v1';
const WD=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
let S=null, OBJSELMEMO=null, lastOpener=null;
const curDefs=()=>S.mode==='medium'?OBJ_M:OBJ_H;
const curIds=()=>Object.keys(curDefs());
const defsFor=phase=>curIds().filter(id=>curDefs()[id].phase===phase);
const objsDone=()=>curIds().filter(id=>S.st[id]&&S.st[id].done).length;
const stationDone=ph=>defsFor(ph).every(id=>S.st[id]&&S.st[id].done);
const stationUnlocked=ph=>{const i=PHASES.findIndex(p=>p.id===ph);for(let k=0;k<i;k++){if(!stationDone(PHASES[k].id))return false;}return true;};

function freshState(mode){
  const defs=mode==='medium'?OBJ_M:OBJ_H;
  const ids=Object.keys(defs);
  const st={};ids.forEach(id=>st[id]={done:false,attempts:0,hints:0,firstTry:false});
  const ans={};ids.forEach(id=>{const d=defs[id];ans[id]=d.widget.parts.map(p=>{
    if(p.kind==='bins'||p.kind==='match')return {};
    if(p.kind==='multi'){const o={};p.items.forEach(it=>o[it.id]=false);return o;}
    if(p.kind==='seq')return p.presented.slice();
    if(p.kind==='form'){const o={};p.fields.forEach(f=>o[f.id]='');return o;}
    if(p.kind==='radio')return null;return null;});});
  return {mode,stationSel:'prep',ans,st,quiz:{},tmin:0,adv:{},ticks:[],ledger:[],out:{},done:false,briefOpen:true,selDoc:null};
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){/* graceful degrade */}}
function loadS(){try{const r=localStorage.getItem(KEY);return r?JSON.parse(r):null;}catch(e){return null;}}

/* ---- simulated clock: detection Monday 08:20 (500 min after midnight) ---- */
function fmtT(min){const total=500+min;const d=Math.floor(total/1440),m=total%1440,h=Math.floor(m/60),mm=m%60;
  return WD[d%7]+' '+String(h).padStart(2,'0')+':'+String(mm).padStart(2,'0');}
function fmtDur(min){const h=Math.floor(min/60),m=min%60;return (h?h+'h':'')+String(m).padStart(h?2:1,'0')+'m';}