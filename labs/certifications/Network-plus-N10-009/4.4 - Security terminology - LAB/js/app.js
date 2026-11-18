'use strict';
/* CyberLab — N10-009 Lesson 4.4 Security Terminology (static port v4).
   Ported 1:1 from the original single-file lab. ALL data is synthetic. */

/* ============ js/app.js — bootstrap + event wiring ============ */
/* ================= EVENT WIRING ================= */
document.addEventListener('click', function(e){
  const el=e.target.closest('[data-act]'); if(!el)return;
  const act=el.dataset.act;
  if(act==='start'){ S=freshState(el.dataset.mode); save(); renderLab(); }
  else if(act==='tab'){ renderTab(el.dataset.tab); }
  else if(act==='check'){ checkObjective(el.dataset.oid); }
  else if(act==='hint'){ const id=el.dataset.oid; snapshot(id); showHint(id,false); }
  else if(act==='quizcheck'){ checkQuiz(); }
  else if(act==='reset'){ askReset(); }
  else if(act==='doreset'){ try{ localStorage.removeItem(LS_KEY); }catch(err){} S=null; closeModal(); renderModeSelect(); }
  else if(act==='closemodal'){ closeModal(); }
  else if(act==='replay'){ S=freshState(S.mode); save(); closeModal(); renderLab(); }
  else if(act==='switchmode'){ S=null; try{ localStorage.removeItem(LS_KEY); }catch(err){} closeModal(); renderModeSelect(); }
  else if(act==='resume'){ closeModal(); renderLab(); }
});
document.addEventListener('change', function(e){
  if(e.target.closest('[data-oid]')){ snapshot(e.target.closest('[data-oid]').dataset.oid); save(); }
});
/* ================= BOOT ================= */
(function boot(){
  S=loadState();
  if(S&&S.mode&&!S.completed){ askResume(); renderLab(); restoreInputs(); }
  else if(S&&S.mode&&S.completed){ renderModeSelect(); }
  else { S=null; renderModeSelect(); }
})();

/* Keep the score HUD in sync with any state change (pub/sub demo). */
Bus.on('state:changed', function(){
  if (document.getElementById('trk-items') && S && S.mode) refreshTracker();
});
