'use strict';
/* app.js — bootstrap and event wiring: mode selection, tab / artifact /
// ledger navigation, reset, keyboard paths and the DOMContentLoaded boot.
 */
/* ================= application ================= */
function setMode(m){S.mode=m;if(!S.tab)S.tab='briefing';save();renderAll();say('Mode: '+modeName());}
function init(){
 load();
 live=$('#live');
 $('#brandicon').innerHTML=ic('stamp');
 $('#manualbody').innerHTML=MANUAL.map(function(s){return '<section id="'+s.id+'"><h3>'+s.t+'</h3>'+s.h+'</section>';}).join('');
 $('#glossgrid').innerHTML=GLOSSARY.map(function(g){return '<div class="gcard"><b>'+g.t+'</b><div class="mini" style="margin-top:4px">'+g.d+'</div></div>';}).join('');
 $('#pick-medium').addEventListener('click',function(){setMode('medium');});
 $('#pick-hard').addEventListener('click',function(){setMode('hard');});
 $('#modechip').addEventListener('click',function(){
  if(!S.mode)return;
  const other=S.mode==='medium'?'hard':'medium';
  if(window.confirm('Switch to '+(other==='medium'?'Medium (Audit Prep)':'Hard (Field Audit')+')? Progress for both modes is kept — the room shows one at a time.'))setMode(other);
 });
 $('#btn-manual').addEventListener('click',function(){openSheet('#manual-overlay');});
 $('#manual-close').addEventListener('click',function(){closeSheet('#manual-overlay');});
 $('#btn-glossary').addEventListener('click',function(){openSheet('#gloss-overlay');});
 $('#gloss-close').addEventListener('click',function(){closeSheet('#gloss-overlay');});
 $('#cert-close').addEventListener('click',function(){closeSheet('#cert-overlay');});
 $('#btn-reset').addEventListener('click',function(){
  if(window.confirm('Reset the lab? All stamps, answers and quiz results are erased and the room returns to pristine state.')){
   try{localStorage.removeItem(LSKEY);}catch(e){}
   window.location.reload();
  }});
 [ '#gloss-overlay','#manual-overlay','#cert-overlay'].forEach(function(sel){
  $(sel).addEventListener('click',function(ev){if(ev.target===ev.currentTarget)closeSheet(sel);});});
 document.addEventListener('keydown',function(ev){
  if(ev.key==='Escape'){['#gloss-overlay','#manual-overlay','#cert-overlay'].forEach(function(s){closeSheet(s);});}});
 $('#stage').addEventListener('click',function(ev){
  const look=ev.target.closest('.look');if(look){goLook(look.dataset.go);return;}
  const evc=ev.target.closest('.evcard');if(evc){goArt(evc.dataset.art);return;}
  const rt=ev.target.closest('#btn-retake');if(rt){
   if(window.confirm('Retake the knowledge check? All answers for this mode are cleared and every question is asked again — your latest pass is the one that counts.')){
    S.quiz={ans:{},locked:{}};save();refreshQuiz();say('Knowledge check reset — answer every question again.');}
   return;}
  const act=ev.target.closest('[data-act]');
  if(act){if(act.dataset.act==='check')doCheck(act.dataset.obj);else if(act.dataset.act==='hint')doHint(act.dataset.obj);return;}});
 $('#stage').addEventListener('keydown',function(ev){
  if(ev.key!=='Enter'&&ev.key!==' ')return;
  const evc=ev.target.closest('.evcard');if(evc){ev.preventDefault();goArt(evc.dataset.art);}});
 $('#rail').addEventListener('click',function(ev){
  const t=ev.target.closest('.ftab');if(t)goTab(t.dataset.tab);});
 $('#ledger').addEventListener('click',function(ev){
  if(ev.target.closest('#btn-cert')){openCert();return;}
  const j=ev.target.closest('.ljmp');if(j){const o=OBJ_BY[j.dataset.obj];if(o){goTab(o.sec);window.setTimeout(function(){const el=document.getElementById('ows-'+o.id);if(el)el.scrollIntoView({behavior:'smooth',block:'start'});},60);}}});
 $('#ledger').addEventListener('keydown',function(ev){
  if(ev.key!=='Enter'&&ev.key!==' ')return;
  const j=ev.target.closest('.ljmp');if(j){ev.preventDefault();const o=OBJ_BY[j.dataset.obj];if(o){goTab(o.sec);window.setTimeout(function(){const el=document.getElementById('ows-'+o.id);if(el)el.scrollIntoView({behavior:'smooth',block:'start'});},60);}}});
 document.addEventListener('change',function(ev){
  const t=ev.target;
  if(t&&t.name&&t.name.indexOf('quiz.')===0&&!t.disabled){
   const qid=t.name.slice(5);
   if(S.quiz.locked[qid])return;
   S.quiz.ans[qid]=t.value;S.quiz.locked[qid]=true;save();refreshQuiz();
   say('Answer recorded.');
  }});
 renderAll();
}
document.addEventListener('DOMContentLoaded',init);
