/*!
 * js/state.js - the single state object, localStorage persistence
 * (key: hccf-portwatch-v1) and the screen-reader announcer. Save/restore/
 * RESET semantics are identical to the source lab.
 */
/* ============ Application state ============ */
let S = null;
let storageOK = true;
function freshState(mode){
 return {v:1, mode:mode, camSnap:false, mailSel:'e1', tab:'switch', briefSeen:false, done:false,
  env:{switch:{portSec:false,snooping:false,trustUplink:false,dai:false,noDtp:false,nativeVlan:'1',shutUnused:false},
       wifi:{wpa3:false,noLegacy:false,wips:false},
       phys:{mantrap:false,escort:false,shred:false,film:false,aware:false}},
  ans:{}, quiz:{}};
}
function save(){ if(!storageOK) return; try{ localStorage.setItem(LS_KEY, JSON.stringify(S)); }catch(e){ if(storageOK){ storageOK=false; const el=$('#srStatus'); if(el) announce('Browser storage is unavailable — the lab still works, but progress will not persist.'); } } }
function load(){ try{ const r=localStorage.getItem(LS_KEY); if(!r) return null; const s=JSON.parse(r); if(!s||!s.mode) return null; return s; }catch(e){ return null; } }
function ensureAns(id){ if(!S.ans[id]) S.ans[id]={v:{},attempts:0,solved:false,hints:0,nudge:false,hintShown:0}; return S.ans[id]; }
function ensureQuiz(){ if(!S.quiz[S.mode]) S.quiz[S.mode]={ans:{},checked:{},warn:{}}; if(!S.quiz[S.mode].warn) S.quiz[S.mode].warn={}; return S.quiz[S.mode]; }
function announce(msg){ const el=$('#srStatus'); el.textContent=''; setTimeout(()=>{el.textContent=msg;},30); }

