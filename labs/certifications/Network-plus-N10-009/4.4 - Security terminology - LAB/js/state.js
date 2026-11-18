'use strict';
/* CyberLab — N10-009 Lesson 4.4 Security Terminology (static port v4).
   Ported 1:1 from the original single-file lab. ALL data is synthetic. */

/* ============ js/state.js — state, persistence, pub/sub ============ */
const LS_KEY = 'cyberlab_n10009_44_v1';

/* Tiny pub/sub: components can react to state changes without polling. */
const Bus = {
  _sub: {},
  on(evt, fn){ (this._sub[evt] = this._sub[evt] || []).push(fn); },
  emit(evt, payload){ (this._sub[evt] || []).forEach(fn => fn(payload)); }
};

/* ================= STATE & PERSISTENCE ================= */
let S = null;
function freshState(mode){
  return {mode:mode, obj:{}, quiz:{}, quizDone:false, completed:false, started:Date.now()};
}
function save(){
  try{ localStorage.setItem(LS_KEY, JSON.stringify(S)); }catch(e){/* storage unavailable — lab still playable */}
}
function loadState(){
  try{ const raw=localStorage.getItem(LS_KEY); return raw?JSON.parse(raw):null; }catch(e){ return null; }
}

/* Every persist() notifies subscribers (used by app.js to refresh HUD). */
const _origSave = save;
save = function(){ _origSave(); Bus.emit('state:changed', S); };
