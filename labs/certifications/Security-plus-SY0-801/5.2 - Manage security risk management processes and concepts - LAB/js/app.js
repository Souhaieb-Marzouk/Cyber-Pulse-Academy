'use strict';
/* =====================================================================
   APP — event wiring, bootstrap, and the built-in self-test harness (dev tool,
not part of the learning path).
   ===================================================================== */

var CONTAINER_OBJ={briefPanel:{medium:'M9',hard:'H8'},reviewPanel:{medium:'M12',hard:'H5'},exceptionPanel:{medium:null,hard:'H6'}};

function ownerOfField(el){
 var ord=el.closest('.order');if(ord)return ord.getAttribute('data-obj');
 var pc=el.closest('.panel');if(pc){var m=CONTAINER_OBJ[pc.id];if(m)return m[S.mode]||null}
 return null;
}

function bindEvents(){
 document.addEventListener('change',function(ev){
  var t=ev.target;
  if(t.matches('input[data-f],select[data-f]')){
   var oid=ownerOfField(t);if(!oid)return;
   if(objSt(oid).done){ // answer lock: restore the checked answer
    var prev=S.ans[oid]?S.ans[oid][t.getAttribute('data-f')]:undefined;
    if(t.type==='checkbox'){t.checked=(prev===true)}else{t.value=(prev===undefined?'':prev)}
    return}
   if(!S.ans[oid])S.ans[oid]={};
   S.ans[oid][t.getAttribute('data-f')]=t.type==='checkbox'?t.checked:t.value;
   save();return;
  }
  if(t.id==='benchRisk'){S.bench.risk=t.value;renderBench();save();return}
  if(t.id==='resL'){S.bench.resL=t.value;save();return}
  if(t.id==='resI'){S.bench.resI=t.value;save();return}
  if(t.name==='treat'){S.bench.treat=t.value;save();return}
  if(t.hasAttribute('data-ctl')){var rid=t.getAttribute('data-ctl');
   if((S.mode==='medium'&&rid==='R-101'&&objSt('M11').done)||(S.mode==='hard'&&rid==='R-103'&&objSt('H4').done)){t.checked=!t.checked;benchFb('no','That order is checked — its controls are locked.');return}
   save();return}
  if(t.hasAttribute('data-feedf')){if(S.mode==='hard'&&objSt('H1').done){t.checked=!t.checked;return}var fid=t.getAttribute('data-feedid');var f=t.getAttribute('data-feedf');if(!S.feed[fid])S.feed[fid]={filed:true};S.feed[fid][f]=t.type==='checkbox'?t.checked:t.value;save();return}
  if(t.hasAttribute('data-qi')){var qi=t.getAttribute('data-qi');if(S.quiz.checked&&S.quiz.checked[qi]){t.checked=String(S.quiz.ans[qi])===String(t.value);return}S.quiz.ans[qi]=t.value;save();return}
 });
 document.addEventListener('click',function(ev){
  var t=ev.target.closest('button');if(!t)return;
  if(t.hasAttribute('data-file')){fileRisk(t.getAttribute('data-file'));return}
  if(t.hasAttribute('data-feedfile')){if(S.mode==='hard'&&objSt('H1').done){log('Order H1 is checked — the intake channel is locked.');return}fileFeed(t.getAttribute('data-feedfile'));return}
  if(t.hasAttribute('data-chip')){var cid=t.getAttribute('data-chip'),ck=t.getAttribute('data-kind');
   if(S.mode==='medium'&&objSt('M8').done&&ck==='inh'&&['R-101','R-102','R-105','R-107'].indexOf(cid)>=0){log('Order M8 is checked — those plotted markers are locked.');return}
   pickChip(cid,ck);return}
  if(t.hasAttribute('data-dock')){var did=t.getAttribute('data-dock');
   if(S.mode==='medium'&&objSt('M8').done&&['R-101','R-102','R-105','R-107'].indexOf(did)>=0){log('Order M8 is checked — those vessels are locked in position.');return}
   plotDock(did);return}
  if(t.hasAttribute('data-cell')){var c=carriedChip();if(!c){var h=$('chartHint');h.innerHTML='<b>No vessel in hand</b> — click a docked vessel or a plotted marker first, then click its cell.';return}var parts=t.getAttribute('data-cell').split('-');setChart(c.id,c.kind,parseInt(parts[0],10),parseInt(parts[1],10));return}
  if(t.hasAttribute('data-stage')){if((S.mode==='medium'&&objSt('M12').done)||(S.mode==='hard'&&objSt('H5').done)){log('The review desk is locked — that order is checked.');return}var s=t.getAttribute('data-stage');var ix=S.seq.indexOf(s);if(ix>=0){S.seq.splice(ix,1)}else{S.seq.push(s)}renderReview();renderOrders();save();return}
  if(t.hasAttribute('data-check')){checkObj(t.getAttribute('data-check'));return}
  if(t.hasAttribute('data-hint')){revealHint(t.getAttribute('data-hint'));return}
  if(t.id==='checkQBtn'){checkCurrent();return}
  if(t.id==='nextQBtn'){nextCurrent();return}
 });
 $('plotResBtn').addEventListener('click',function(){
  var r=S.bench.risk;
  if((S.mode==='medium'&&r==='R-101'&&objSt('M11').done)||(S.mode==='hard'&&r==='R-103'&&objSt('H4').done)){benchFb('no','That order is checked — its residual marker is locked.');return}
  plotResidual();
 });
 $('resetBtn').addEventListener('click',function(){$('resetModal').hidden=false});
 $('cancelResetBtn').addEventListener('click',function(){$('resetModal').hidden=true});
 $('confirmResetBtn').addEventListener('click',function(){try{localStorage.removeItem(LS_KEY)}catch(e){}location.reload()});
 $('closeDoneBtn').addEventListener('click',function(){$('doneModal').hidden=true});
 $('doneResetBtn').addEventListener('click',function(){$('doneModal').hidden=true;$('resetModal').hidden=false});
 $('reportBtn').addEventListener('click',function(){if(!$('reportBtn').disabled)openCompletion()});
 // R7: click-outside closes both modals; focus returns to a sensible element
 $('doneModal').addEventListener('click',function(ev){if(ev.target===this){this.hidden=true;var rb=$('reportBtn');if(rb)rb.focus()}});
 $('resetModal').addEventListener('click',function(ev){if(ev.target===this){this.hidden=true;var rb=$('resetBtn');if(rb)rb.focus()}});
 document.addEventListener('keydown',function(ev){
  if(ev.key==='Escape'){if(!$('resetModal').hidden){$('resetModal').hidden=true;var rb=$('resetBtn');if(rb)rb.focus()}if(!$('doneModal').hidden){$('doneModal').hidden=true;var rb2=$('reportBtn');if(rb2)rb2.focus()}}
 });
}

function startLab(){
 $('modeSelect').hidden=true;$('lab').hidden=false;
 $('modeTag').textContent=S.mode==='medium'?'Medium watch':'Hard watch';
 S.reg=S.reg||{};
 renderAll();
 if(!S.greeted){log('Tower online. Watch: <strong>'+(S.mode==='medium'?'Watch Officer (Medium)':'Harbor Master (Hard)')+'</strong>. Appetite: residual ≤ 9.');log('Eight vessels are docked in the intake bay — start with the Orders Board below the console.');S.greeted=true;save()}
 updateStats();
}

function init(){
 var saved=load();
 if(saved&&saved.mode){S=saved;bindEvents();startLab();renderQuiz();}
 else{bindEvents();
  $('pickMedium').addEventListener('click',function(){S=freshState();S.mode='medium';startLab();save()});
  $('pickHard').addEventListener('click',function(){S=freshState();S.mode='hard';startLab();save()});
 }
}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init)}else{init()}

window.__selfTest=function(mode){
 var results=[];
 function ok(id,cond,label){results.push({id:id,ok:!!cond,label:label})}
 function probe(id,label,fn){var r;try{r=fn()}catch(e){r={ok:false,msg:'EXCEPTION '+e.message}}ok(id,r&&r.ok,label+' — expect PASS');}
 function neg(id,label,fn){var r;try{r=fn()}catch(e){r={ok:true,msg:'EXCEPTION '+e.message}}ok(id,(r&&!r.ok),label+' — expect REJECT');}
 var defs=mode==='medium'?OBJ_M:OBJ_H;
 // file everything needed
 if(mode==='medium'){RISKS.forEach(function(r){S.reg[r.id]={filed:true};S.chart[r.id]={inh:null,res:null}});}
 else{S.reg={};RISKS.forEach(function(r){S.reg[r.id]={filed:true};S.chart[r.id]={inh:null,res:null}});
   ['HF-A','HF-B','HF-C'].forEach(function(id){S.feed[id]={filed:false}})}
 if(mode==='medium'){
  S.ans.M1={st1:'Threat',st2:'Vulnerability',st3:'Impact driver',st4:'Likelihood driver'};
  S.ans.M2={a1:true,a2:true,a3:true,a4:true,a5:true,a6:true,a7:false,a8:false};
  S.ans.M3={o101:'Director of Operations',o104:'CTO',o105:'Head of Procurement',o107:'IT Manager'};
  S.ans.M4={r101L:'4',r101I:'5',r107L:'2',r107I:'3',r108L:'2',r108I:'5'};
  S.ans.M5={c101:'External',c102:'External',c103:'Legacy',c104:'IP theft',c105:'Multiparty',c106:'External',c107:'Software compliance',c108:'External',reg:'Regulatory requirements'};
  neg('M6a','M6 wrong SLE',function(){S.ans.M6={sle:'100000',ale:'100000',method:'quantitative'};return OBJ_M.filter(function(o){return o.id==='M6'})[0].check()});
  S.ans.M6={sle:'200000',ale:'100000',method:'quantitative'};
  S.ans.M7={b101:'5',b103:'4',bidef:'bidefB'};
  neg('M8a','M8 un-plotted vessel',function(){S.ans.M8={zone:'Critical'};return OBJ_M.filter(function(o){return o.id==='M8'})[0].check()});
  setChart('R-101','inh',4,5);setChart('R-102','inh',4,3);setChart('R-105','inh',3,3);setChart('R-107','inh',2,3);
  S.ans.M8={zone:'Critical'};
  S.ans.M9={q1:true,q2:true,q3:true,q4:true,q5:false,q6:false,q7:false};
  S.ans.M10={t101:'Mitigate',t105:'Transfer',t107:'Avoid',t108:'Transfer',ex102:'Mail filtering + annual awareness training'};
  neg('M11a','M11 wrong controls',function(){S.bench={risk:'R-101',treat:'Mitigate',resL:'2',resI:'4'};S.controls['R-101']=['Public bug bounty program'];renderBench();S.res['R-101']=[2,4];S.chart['R-101'].res=[2,4];return OBJ_M.filter(function(o){return o.id==='M11'})[0].check()});
  S.bench={risk:'R-101',treat:'Mitigate',resL:'2',resI:'4'};S.controls['R-101']=controlsFor('R-101').filter(function(c){return c.ok}).map(function(c){return c.t});renderBench();plotResidual();
  S.seq=['identify','assess','analyze','treat','communicate','review'];S.ans.M12={tr1:true,tr2:true,tr3:false,tr4:false};
 }else{
  S.feed['HF-A']={filed:true,cat:'Multiparty',L:'3',I:'4'};S.feed['HF-B']={filed:true,cat:'Internal',L:'3',I:'3'};S.feed['HF-C']={filed:true,cat:'Internal',L:'4',I:'3'};
  neg('H1a','H1 over-filing',function(){S.feed['HF-E']={filed:true};var r=OBJ_H.filter(function(o){return o.id==='H1'})[0].check();delete S.feed['HF-E'];return r});
  S.ans.H2={sle1:'200000',ale1:'100000',sle2:'200000',ale2:'40000',d1:'Approve',d2:'Reject'};
  S.ans.H3={f1:'2',f2:'2',f3:'Head of Procurement',f4:'Avoid',f5:'Triggered review due — regulator guidance'};
  neg('H4a','H4 impossible control',function(){S.bench={risk:'R-103',treat:'Mitigate',resL:'2',resI:'3'};S.controls['R-103']=['Vendor security patches'];renderBench();S.res['R-103']=[2,3];S.chart['R-103'].res=[2,3];return OBJ_H.filter(function(o){return o.id==='H4'})[0].check()});
  S.bench={risk:'R-103',treat:'Mitigate',resL:'2',resI:'3'};S.controls['R-103']=controlsFor('R-103').filter(function(c){return c.ok}).map(function(c){return c.t});renderBench();plotResidual();
  S.ans.H5={e1:true,e2:true,e3:false,e4:false,e5:true,o1:true,o2:true,o3:true,o4:false,o5:false};
  S.ans.H6={ex1:'Approve',ex2:'Reject',ex3:'Reject'};
  S.ans.H7={cl1:true,cl2:true,cl3:false,cl4:false,s1:'False',s2:'True'};
  S.ans.H8={route1:'Board / CFO',route2:'IT Manager',route3:'Head of Procurement',route4:'Security Manager',route5:'General Counsel'};
  neg('H9a','H9 wrong percentage',function(){S.ans.H9={pct:'73',n1:true,n2:true};return OBJ_H.filter(function(o){return o.id==='H9'})[0].check()});
  S.ans.H9={pct:'82',n1:true,n2:true,n3:false,n4:false};
 }
 defs.forEach(function(o){checkObj(o.id);ok(o.id,objSt(o.id).done,'objective '+o.id+' passes & marks done')});
 // quiz scoring path
 try{S.quiz={ans:{},checked:{},idx:0,scored:false,correct:0,wrongIds:[]};var qs=mode==='medium'?QUIZ_M:QUIZ_H;qs.forEach(function(q,i){S.quiz.ans[i]=String(q.c);S.quiz.checked[i]=true});S.quiz.idx=qs.length;finishQuiz();ok('QUIZ',S.quiz.scored&&S.quiz.correct===qs.length,'quiz full-score')}
 catch(e){ok('QUIZ',false,'quiz EXCEPTION '+e.message)}
 try{var c=starCount();ok('STARS',c.stars===5&&c.score>=95,'stars = 5 on perfect run (got '+c.stars+', '+c.score+')')}catch(e){ok('STARS',false,'stars EXCEPTION '+e.message)}
 return results;
};
