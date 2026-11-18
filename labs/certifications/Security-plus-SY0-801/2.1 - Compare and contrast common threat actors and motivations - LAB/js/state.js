/* == js/state.js — state store, localStorage persistence, seeded shuffle, mode helpers. */
/* ============ ENGINE A — STATE & RENDER ============ */
const LS_KEY = 'cyberlab-quiet-ward-v1';
const MODES = {
  medium:{key:'medium',label:'DAY SHIFT — GUIDED',name:'Medium',desc:'Guided progression. Twelve objectives introduced in order, three-tier hints, tolerant checking, teaching feedback on every answer.',points:['12 guided objectives','3-tier hints (cost a little rating)','Synonym-tolerant checks','Quiz after practice']},
  hard:{key:'hard',label:'NIGHT SHIFT — UNSUPERVISED',name:'Hard',desc:'Free-roam case wall from minute one. Broad multi-step challenges, two red herrings, one nudge per objective at a visible cost, strict validation.',points:['9 deep challenges','No where-to-look, no hand-holding','Exact values, exact sequences','Analysis quiz, efficiency scored']}
};
let S = null;

function freshState(){ return {mode:null,seed:Math.floor(Math.random()*1e9),obj:{},w:{},quiz:{answers:{},submitted:false},completed:false}; }
function orec(id){ if(!S.obj[id]) S.obj[id]={solved:false,wrong:0,hints:0}; return S.obj[id]; }
function save(){ try{ localStorage.setItem(LS_KEY, JSON.stringify(S)); }catch(e){} }
function load(){ try{ const r=localStorage.getItem(LS_KEY); return r?JSON.parse(r):null; }catch(e){ return null; } }
function getW(k){ return S.w[k]; }
function setW(k,v){ S.w[k]=v; save(); }
function announce(msg){ const el=document.getElementById('live'); el.textContent=''; setTimeout(()=>{el.textContent=msg;},30); }
function starsNow(){
  let wrong=0,hints=0;
  const pre=S.mode==='hard'?'H':(S.mode==='medium'?'M':null);
  Object.keys(S.obj).forEach(k=>{ if(pre&&k[0]!==pre) return; const o=S.obj[k]; wrong+=o.wrong||0; hints+=o.hints||0; });
  const perHint = S.mode==='hard' ? 0.25 : 0.1;
  return Math.max(1, Math.round((5 - 0.15*wrong - perHint*hints)*10)/10);
}
function starString(v){
  const full=Math.floor(v), half=(v-full)>=0.5;
  return '★'.repeat(full)+(half?'⯨':'')+'☆'.repeat(Math.max(0,5-full-(half?1:0)));
}
function esc(t){ return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function elc(tag,cls,html){ const e=document.createElement(tag); if(cls)e.className=cls; if(html!==undefined)e.innerHTML=html; return e; }
/* seeded shuffle: deterministic per (widget key, session seed) — persists across reloads,
   re-shuffles on RESET (new seed). Used to satisfy R6: display order never reveals answers. */
function hashStr(s){ let h=1779033703^s.length; for(let i=0;i<s.length;i++){ h=Math.imul(h^s.charCodeAt(i),3432918353); h=(h<<13)|(h>>>19); } return h>>>0; }
function mulberry32(a){ return function(){ a|=0; a=(a+0x6D2B79F5)|0; let t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }
function shuffled(key,n){
  const r=mulberry32(hashStr(key+'|'+(S.seed||0)));
  const arr=[]; for(let i=0;i<n;i++) arr.push(i);
  for(let i=n-1;i>0;i--){ const j=Math.floor(r()*(i+1)); const t=arr[i]; arr[i]=arr[j]; arr[j]=t; }
  return arr;
}
function objectivesOfMode(){ return S.mode==='hard' ? Object.keys(OBJ).filter(k=>k[0]==='H') : Object.keys(OBJ).filter(k=>k[0]==='M'); }
function actsOfMode(){ return S.mode==='hard' ? ACTS_HARD : ACTS_MED; }
function quizOfMode(){ return S.mode==='hard' ? QUIZ_H : QUIZ_M; }

/* ---------- act gating ---------- */
function actSolved(act){
  if(!act.objs) return true;
  return act.objs.every(id=>orec(id).solved);
}
function actUnlocked(i){
  const acts=actsOfMode();
  if(S.mode==='hard') return true;
  for(let p=0;p<i;p++){
    const prev=acts[p];
    if(prev.kind==='quiz' && !S.quiz.submitted) return false;
    if(prev.objs && !actSolved(prev)) return false;
  }
  return true;
}

