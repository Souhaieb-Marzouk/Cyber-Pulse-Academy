/* js/app.js — bootstrap: global event delegation, stage wiring, mode start/resume,
 * init, and the window.__lab automation hook (same code paths as the UI). */
'use strict';
/* ================= GLOBAL EVENTS ================= */
document.addEventListener('change',function(ev){var t=ev.target;if(!t)return;
 if(t.type==='radio'&&/^Q[MH]\d+$/.test(t.name)){var qn=$('#qnote-'+t.name);if(qn)qn.classList.remove('show');return}
 var k=t.getAttribute('data-kind');
 if(t.hasAttribute('data-sg')){state.env.sg[t.getAttribute('data-sg')]=t.checked;t.closest('.sgrule').classList.toggle('on',t.checked);updateEnvUI();return}
 if(t.hasAttribute('data-tag')){state.env.tags[t.getAttribute('data-tag')]=t.value;updateEnvUI();return}
 if(t.hasAttribute('data-iac')){state.env.iac[t.getAttribute('data-iac')]=t.value;save();return}
 if(t.hasAttribute('data-method')){state.audit.method[t.getAttribute('data-method')]=t.value;save();return}
 if(t.hasAttribute('data-stor')){state.audit.stor[t.getAttribute('data-stor')]=t.value;save();return}
 if(!k)return;
 var id=t.getAttribute('data-id');
 if(k==='classify')state.audit.classify[id]=t.value;
 else if(k==='cause')state.audit.cause[id]=t.value;
 else if(k==='driftflag'){state.audit.drift[id]=t.checked?(state.audit.drift[id]||'high'):'';renderAudit();if(t.checked){var live=document.querySelector('select[data-kind="driftsev"][data-id="'+id+'"]');if(live)live.focus()}}
 else if(k==='driftsev')state.audit.drift[id]=t.value;
 else if(k==='telo')state.audit.telo[id]=t.value;
 else if(k==='ruleEv')state.audit.ruleEv[id]=t.value;
 else if(k==='ruleCond')state.audit.ruleCond[id]=t.value;
 else if(k==='verify')state.audit.verify[id]=parseInt(t.value,10)||0;
 else if(k==='purch')state.audit.purch[id]=t.value;
 else if(k==='fix')state.audit.fix[id]=t.value;
 else if(k==='constraint'){state.audit.constraints[id]=t.checked}
 else if(k==='deny'){state.audit.regionDeny=t.checked}
 else if(k==='budget'){state.audit.budgetAlert=parseInt(t.value,10)||0;var bv=$('#budgetVal');if(bv)bv.textContent=state.audit.budgetAlert+'%'}
 save()});
document.addEventListener('click',function(ev){var b=ev.target.closest?ev.target.closest('[data-act],[data-obj],[role="tab"]'):null;if(!b)return;
 var act=b.getAttribute('data-act');
 if(act==='check'){checkObj(b.getAttribute('data-obj'))}
 else if(act==='quizcommit'){commitQuiz(b.getAttribute('data-q'))}
 else if(act==='jump'){doJump(b.getAttribute('data-obj'))}
 else if(act==='hint'){doHint(b.getAttribute('data-obj'))}
 else if(act==='sequp'||act==='seqdown'){var i=parseInt(b.getAttribute('data-i'),10),s=state.audit.seq,j=act==='sequp'?i-1:i+1;
  if(j<0||j>=s.length)return;var tmp=s[i];s[i]=s[j];s[j]=tmp;save();renderRemedy()}});
function wireDraft(){
 $('#selRegion').addEventListener('change',function(){state.env.region=this.value;updateEnvUI()});
 $('#selVpc').addEventListener('change',function(){state.env.vpc=this.value;state.env.subPub='';state.env.subPriv='';buildSubnets();updateEnvUI()});
 $('#selSubPub').addEventListener('change',function(){state.env.subPub=this.value;updateEnvUI()});
 $('#selSubPriv').addEventListener('change',function(){state.env.subPriv=this.value;updateEnvUI()});
 $('#ckIgw').addEventListener('change',function(){state.env.igw=this.checked;updateEnvUI()});
 $('#ckNat').addEventListener('change',function(){state.env.nat=this.checked;updateEnvUI()});
 $('#instGrid').addEventListener('change',function(ev){var r=ev.target.closest('input[name="inst"]');if(!r)return;state.env.compSize=r.value;buildInstGrid();updateEnvUI()});
 $('#cntMinus').addEventListener('click',function(){state.env.count=Math.max(1,state.env.count-1);$('#cntVal').textContent=state.env.count;updateEnvUI()});
 $('#cntPlus').addEventListener('click',function(){state.env.count=Math.min(6,state.env.count+1);$('#cntVal').textContent=state.env.count;updateEnvUI()});
 $('#ckAuto').addEventListener('change',function(){state.env.auto=this.checked;updateEnvUI()});
 $('#selStoreType').addEventListener('change',function(){state.env.storeType=this.value;updateEnvUI()});
 $('#selStoreTier').addEventListener('change',function(){state.env.storeTier=this.value;updateEnvUI()});
 $('#rgIops').addEventListener('input',function(){state.env.iops=parseInt(this.value,10);$('#iopsVal').textContent=state.env.iops;updateEnvUI()});
 $('#selDb').addEventListener('change',function(){state.env.db=this.value;updateEnvUI()});
 $('#ckMultiAz').addEventListener('change',function(){state.env.multiAz=this.checked;updateEnvUI()});
 $('#selIam').addEventListener('change',function(){state.env.iam=this.value;updateEnvUI()});
 $('#btnProvision').addEventListener('click',runProvision);
 $('#btnTests').addEventListener('click',runTests);
 $$('.stagebar button').forEach(function(b){b.addEventListener('click',function(){showStage(b.id.replace('tab-',''))})});
 $$('.subtabs button').forEach(function(b){b.addEventListener('click',function(){showSub(b.getAttribute('data-sub'))})});
 $$('.audtabs button').forEach(function(b){b.addEventListener('click',function(){showAud(b.getAttribute('data-aud'))})});
}
function wireChrome(){
 $('#btnReset').addEventListener('click',function(){$('#modalResetBack').classList.add('show');$('#btnResetCancel').focus()});
 $('#btnResetCancel').addEventListener('click',function(){$('#modalResetBack').classList.remove('show');$('#btnReset').focus()});
 $('#btnResetConfirm').addEventListener('click',function(){try{localStorage.removeItem(LSKEY)}catch(e){}location.reload()});
 $('#btnFinish').addEventListener('click',openDone);
 $('#btnDoneClose').addEventListener('click',function(){$('#modalDoneBack').classList.remove('show');$('#btnFinish').focus()});
 $('#modalResetBack').addEventListener('click',function(ev){if(ev.target===this){this.classList.remove('show');$('#btnReset').focus()}});
 $('#modalDoneBack').addEventListener('click',function(ev){if(ev.target===this){this.classList.remove('show');$('#btnFinish').focus()}});
 $('#toast').addEventListener('click',function(){this.classList.remove('show');clearTimeout(toastTimer)});
 document.addEventListener('keydown',function(ev){if(ev.key==='Escape'){
  var r=$('#modalResetBack'),d=$('#modalDoneBack'),moved=false;
  if(r.classList.contains('show')){r.classList.remove('show');$('#btnReset').focus();moved=true}
  if(d.classList.contains('show')){d.classList.remove('show');$('#btnFinish').focus();moved=true}
  if(moved)ev.preventDefault()}});
 document.addEventListener('keydown',function(ev){if(ev.key!=='Tab')return;
  var back=['modalResetBack','modalDoneBack'].map(function(id){return document.getElementById(id)}).filter(function(b){return b.classList.contains('show')})[0];
  if(!back)return;
  var f=back.querySelectorAll('button,[href],input,select,textarea');if(!f.length)return;
  var first=f[0],last=f[f.length-1];
  if(!back.contains(document.activeElement)){ev.preventDefault();first.focus()}
  else if(ev.shiftKey&&document.activeElement===first){ev.preventDefault();last.focus()}
  else if(!ev.shiftKey&&document.activeElement===last){ev.preventDefault();first.focus()}});
 $('#btnMedium').addEventListener('click',function(){startMode('medium')});
 $('#btnHard').addEventListener('click',function(){startMode('hard')});
}
function startMode(m){state=freshState();state.mode=m;save();
 try{localStorage.setItem(LSKEY,JSON.stringify(state))}catch(e){}
 enterMode(m,false)}
function enterMode(m,resumed){state.mode=m;$('#screenMode').style.display='none';$('#app').hidden=false;
 $('#tbMode').textContent=m==='medium'?'Medium — guided':'Hard — review board';
 $('#tbModeNote').textContent=m==='medium'?'hints & teaching feedback':'strict checks, 1 paid nudge';
 $('#packetPanel').hidden=m!=='hard';
 if(m==='hard'&&!$('#constraintGrid')){var pp=$('#packetPanel .pbody');pp.insertAdjacentHTML('beforeend','<div style="margin-top:12px;border-top:1px dashed var(--line);padding-top:10px" id="constraintWrap"><p class="eyebrow" style="margin-bottom:8px">Binding constraints (Objective H1) — pick exactly six</p><div class="cgrid" id="constraintGrid"></div></div>')}
 injectDrills();syncDraft();renderConstraints();
 renderLedger();renderAudit();renderRemedy();renderQuiz();renderGlossary();renderReq();renderBom();resumeRender();
 showStage('draft');updateHeader();
 if(resumed)toast('Resumed your saved session — '+(m==='medium'?'Medium':'Hard')+' mode')}
/* ================= INIT ================= */
function init(){
 $$('[data-icon]').forEach(function(el){el.innerHTML=icon(el.getAttribute('data-icon'),15)});
 $('#selRegion').innerHTML='<option value="">— choose region —</option>'+REGIONS.map(function(r){return '<option value="'+r.id+'">'+r.label+' · latency ~'+r.lat+' ms</option>'}).join('');
 $('#selVpc').innerHTML='<option value="">— choose CIDR —</option>'+VPCS.map(function(v){return '<option value="'+v+'">'+v+'</option>'}).join('');
 $('#selStoreType').innerHTML='<option value="">— choose —</option>'+STORETYPES.map(function(s){return '<option value="'+s.id+'">'+s.label+'</option>'}).join('');
 $('#selStoreTier').innerHTML='<option value="">— choose —</option>'+TIERS.map(function(s){return '<option value="'+s.id+'">'+s.label+'</option>'}).join('');
 $('#selDb').innerHTML='<option value="">— choose engine —</option>'+DBS.map(function(s){return '<option value="'+s.id+'">'+s.label+'</option>'}).join('');
 $('#selIam').innerHTML='<option value="">— choose role —</option>'+IAMS.map(function(s){return '<option value="'+s.id+'">'+s.label+'</option>'}).join('');
 wireDraft();wireChrome();
 var resumed=false;try{resumed=load()}catch(e){resumed=false}
 if(resumed&&state.mode&&OBJ[state.mode])enterMode(state.mode,true);
 else{state=freshState();$('#provLogWrap').innerHTML='<div class="emptystate">No provisioning run yet. Configure the Draft sheets, then run provision here — the log it prints is your evidence.</div>'}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
/* ================= TEST HOOK (used by the automated verifier; same code paths as the UI) ================= */
function __setEnv(o){Object.keys(o).forEach(function(k){state.env[k]=o[k]});syncDraft();updateEnvUI()}
function __setAudit(o){['method','stor','classify','fix','cause','drift','telo','ruleEv','ruleCond','verify','purch'].forEach(function(k){if(o[k])Object.keys(o[k]).forEach(function(id){state.audit[k][id]=o[k][id]})});
 if('budgetAlert' in o)state.audit.budgetAlert=o.budgetAlert;if('regionDeny' in o)state.audit.regionDeny=o.regionDeny;if(o.seq)state.audit.seq=o.seq.slice();
 if(o.constraints)Object.keys(o.constraints).forEach(function(id){state.audit.constraints[id]=o.constraints[id]});
 renderAudit();renderRemedy();renderConstraints();save();
 $$('[data-method]').forEach(function(el){el.value=state.audit.method[el.getAttribute('data-method')]||''});
 $$('[data-stor]').forEach(function(el){el.value=state.audit.stor[el.getAttribute('data-stor')]||''})}
window.__lab={
 state:function(){return state},
 mode:function(){return state.mode},
 check:function(id){checkObj(id);return state.obj[id]},
 hint:function(id){doHint(id)},
 provision:function(){runProvision()},
 tests:function(){runTests()},
 fill:function(id){var E=state.env;
  switch(id){
   case 'M1':__setAudit({method:{sit1:'console',sit2:'cli',sit3:'iac'}});break;
   case 'M2':__setEnv({region:'cf-eu-central'});break;
   case 'M3':__setEnv({vpc:'10.0.0.0/16',subPub:'10.0.1.0/24',subPriv:'10.0.2.0/24',igw:true,nat:true});break;
   case 'M4':__setEnv({compSize:'standard.large',count:2,auto:true});break;
   case 'M5':__setAudit({stor:{st1:'block',st2:'object',st3:'file'}});__setEnv({storeType:'block',db:'relational',storeTier:'archive',iops:3000});break;
   case 'M6':__setEnv({iac:{region:'cf-eu-central',count:'2',machine:'standard.large',env:'prod'}});break;
   case 'M7':__setEnv({sg:{r443:true,r22corp:true,r5432priv:true},iam:'app-runtime-least'});break;
   case 'M8':__setEnv({tags:{environment:'prod',owner:'platform','cost-center':'CC-2847','data-class':'confidential'}});break;
   case 'M9':this.fill('M2');this.fill('M3');this.fill('M4');this.fill('M5');this.fill('M6');this.fill('M7');this.fill('M8');
    E.multiAz=false;runProvision();runTests();E.multiAz=true;syncDraft();runProvision();runTests();break;
   case 'M10':__setAudit({classify:{F1:'real',F2:'real',F3:'real',F4:'real',F5:'benign',F6:'benign'}});break;
   case 'M11':__setAudit({fix:{F1:'a',F2:'a',F3:'a',F4:'a'},seq:[0,1,2,3,4,5,6]});break;
   case 'M12':__setAudit({purch:{'web-tier-247':'reserved','nightly-batch':'spot','dev-sandbox':'on-demand'},budgetAlert:80});break;
   case 'H1':__setAudit({constraints:{K1:true,K2:true,K3:true,K4:true,K5:true,K6:true}});break;
   case 'H2':this.fill('M2');this.fill('M3');this.fill('M4');this.fill('M5');this.fill('M6');this.fill('M7');this.fill('M8');
    E.multiAz=true;syncDraft();runProvision();runTests();break;
   case 'H3':__setAudit({cause:{E1:'cidr',E2:'quota',E3:'iam'}});break;
   case 'H4':__setAudit({drift:{D1:'high',D2:'high',D3:'high',D4:'medium',D5:'medium',D6:'',D7:'',D8:'',D9:'',D10:''}});break;
   case 'H5':__setAudit({seq:[0,1,2,3,4,5,6]});break;
   case 'H6':__setAudit({telo:{'web-01':'downsize','web-02':'upsize','batch-01':'terminate','db-01':'keep'}});break;
   case 'H7':__setAudit({purch:{'web-tier-247':'reserved','nightly-batch':'spot','dev-sandbox':'on-demand'},budgetAlert:80,regionDeny:true});break;
   case 'H8':__setAudit({ruleEv:{RA:'AuthorizeSecurityGroupIngress',RB:'CreateBucket',RC:'BudgetThreshold'},ruleCond:{RA:'principal is not the pipeline role (ci-deployer)',RB:'publicAccessBlock is disabled',RC:'run-rate exceeds 110% of forecast'}});break;
   case 'H9':__setAudit({verify:{S1:1,S2:2,S3:3,S4:4,S5:5,S6:0,S7:0,S8:0}});break;
  }
  return true}
};
