"use strict";
/* =====================================================================
   CyberLab "Harbor Control" — js/app.js
   SIMULATION + WIRING — the 1.6 s tick (pod life-cycle, reconciliation,
   traffic, downtime latch), all harbor actions, mode/screen flow, the
   delegated click/input/keyboard handlers and the bootstrap.
   Ported 1:1 from the audited single-file lab (v4, QA fixes included).
   ===================================================================== */

/* =====================================================================
   ENGINE — rendering, simulation, actions, checks, quiz, completion
   ===================================================================== */
var TICK_MS=1600, tickN=0;

function placePod(app,image,status){
  var cand=S.env.nodes.filter(function(n){return n.status==="ok"&&nodeLoad(n.name)<n.cap;});
  if(!cand.length) return null;
  cand.sort(function(a,b){return nodeLoad(a.name)-nodeLoad(b.name);});
  var n=cand[0];
  S.env.seqn++; var id=app+"-"+S.env.seqn.toString(16).slice(-4);
  var p={id:id,app:app,node:n.name,status:status||"Pending",restarts:0};
  S.env.pods.push(p);
  return p;
}
function podServing(p){
  if(S.flags.expectHeal>0){ S.flags.expectHeal--; S.env.healCount++; logEvent("ok","SELF-HEALING: replacement for a lost "+p.app+" pod is ready — no human involved"); }
}

function tick(){
  tickN++;
  var e=S.env;
  // pending -> running
  e.pods.forEach(function(p){
    if(p.status==="Pending"){
      p.status="Running";
      logEvent("ok","pod "+p.id+" is Running on "+p.node+(p.app==="cart-web"?" — serving via web Service":""));
      podServing(p);
    } else if(p.status==="Terminating"){
      p.gone=true;
    } else if(p.status==="CrashLoopBackOff"&&tickN%2===0){
      p.restarts++;
      if(tickN%4===0) logEvent("err","pod "+p.id+": Back-off restarting failed container (attempt #"+p.restarts+")");
    }
  });
  e.pods=e.pods.filter(function(p){return !p.gone;});
  // reconcile cart-web desired state
  var a=e.applied;
  if(a){
    var cur=e.pods.filter(function(p){return p.app===a.app&&p.status!=="Terminating";});
    var broken=tagOf(a.image)==="2.0.0-hotfix";
    if(cur.length<a.replicas){
      var missing=a.replicas-cur.length;
      for(var mi=0;mi<missing;mi++){
        var p=placePod(a.app,a.image,broken?"CrashLoopBackOff":(a.probes?"Running":"Pending"));
        if(p){ if(broken) logEvent("err","pod "+p.id+" scheduled on "+p.node+" — image "+a.image); else logEvent("info","scheduler: placing pod "+p.id+" on "+p.node+" (least loaded suitable pier)"); if(p.status==="Running") podServing(p); }
        else{ if(tickN%3===0) logEvent("warn","scheduler: no capacity — pod stays Pending (all piers full)"); break; }
      }
    } else if(cur.length>a.replicas){
      var excess=cur.length-a.replicas;
      for(var i=cur.length-1;i>=0&&excess>0;i--,excess--){ cur[i].status="Terminating"; logEvent("info","scale down: pod "+cur[i].id+" terminating"); }
    }
  }
  // traffic
  e.traffic=e.sale?Math.round(880+Math.random()*60):Math.round(105+Math.random()*30);
  // downtime latch
  if(a&&S.flags.sawRunning){
    var run=runningOf("cart-web");
    if(run===0){ if(!S.flags.dl){ S.flags.dl=true; e.downtime++; logEvent("err","STOREFRONT DOWN — 0 ready web pods; customers are dropped"); } }
    else if(S.flags.dl){ S.flags.dl=false; logEvent("ok","STOREFRONT RECOVERED — "+run+" web pods serving"); }
  }
  if(runningOf("cart-web")>0) S.flags.sawRunning=true;
  // hard chatter
  if(S.mode==="hard"&&tickN%6===0) logEvent("info",CHATTER[Math.floor(Math.random()*CHATTER.length)]);
  renderDynamic();
}

/* ---------------- actions ---------------- */
function applyManifest(){
  var f=readForm();
  if(!f.name){ toast("App name is required"); return; }
  if(!/^[a-z0-9-]+$/.test(f.name)){ toast("App name: lowercase letters, digits, dashes"); return; }
  if(f.name.length>30){ toast("App name: 30 characters max"); return; }
  if(!(f.replicas>=1&&f.replicas<=64)){ toast("Replicas must be 1–64"); return; }
  if(!(f.port>=1024&&f.port<=65535)){ toast("Port must be 1024–65535"); return; }
  var e=S.env;
  var templateChange=!e.applied||e.applied.app!==f.name||e.applied.image!==f.image||e.applied.probes!==f.probes||e.applied.privileged!==f.priv||e.applied.secretMode!==f.secret||e.applied.port!==f.port;
  var oldPods=templateChange?e.pods.filter(function(p){return p.app===f.name&&p.status!=="Terminating";}):[];
  if(e.applied&&["1.4.2","1.5.0"].indexOf(tagOf(e.applied.image))>=0&&e.applied.image!==f.image) e.lastGoodImage=e.applied.image;
  e.applied={app:f.name,image:f.image,replicas:f.replicas,port:f.port,probes:f.probes,privileged:f.priv,secretMode:f.secret,storage:f.store};
  e.deployedOnce=true; e.dtMark=e.downtime;
  if(e.sale&&f.replicas>e.salePeak) e.salePeak=f.replicas;
  var hot=tagOf(f.image)==="2.0.0-hotfix";
  logEvent(hot?"err":"info","APPLY: desired state declared — "+f.name+" · "+f.image+" · replicas "+f.replicas+(f.probes?" · probes ON":" · probes OFF")+(templateChange?" (template change — rolling replacement)":" (scale change only)"));
  if(f.priv) logEvent("warn","SECURITY: manifest requests privileged: true — least-privilege violation");
  if(f.secret==="plaintext") logEvent("warn","SECURITY: secret in plaintext env var — move to a Secret object");
  if(templateChange&&oldPods.length){
    var hadServing=oldPods.some(function(p){return p.status==="Running";});
    oldPods.forEach(function(p){ p.status="Terminating"; });
    if(hadServing&&(hot||!f.probes)){ e.downtime++; S.flags.dl=true; logEvent("err","STOREFRONT DOWN — serving pods replaced with "+(hot?"crashing":"unready")+" ones; customers are dropped"); }
    var stNow=f.probes&&!hot?"Running":"Pending";
    for(var np=0;np<f.replicas;np++){ var npod=placePod(f.name,f.image,stNow); if(npod&&npod.status==="Running") podServing(npod); }
    if(f.probes&&!hot) logEvent("info","rolling update: new replicas pass readiness and take traffic — old replicas retire");
    else if(hot) logEvent("err","rolling update: replacement pods crash on start — image "+f.image);
    else logEvent("warn","no probes — old replicas retired immediately; traffic may hit unready pods");
  }
  saveSoon(); renderAll();
}
function readForm(){
  function v(id){ var el=$(id); return el?el.value:""; }
  return { name:v("m-name").trim().toLowerCase(), image:v("m-image"), replicas:parseInt(v("m-replicas"),10)||0,
    port:parseInt(v("m-port"),10)||0, probes:$("m-probes")?$("m-probes").checked:false, priv:$("m-priv")?$("m-priv").checked:false,
    secret:v("m-secret")||"secret-ref", store:v("m-store")||"none" };
}
function doRollback(){
  var e=S.env;
  if(!e.applied||!e.lastGoodImage){ toast("Nothing to roll back yet"); return; }
  e.applied.image=e.lastGoodImage;
  e.pods.forEach(function(p){ if(p.app===e.applied.app&&p.status!=="Terminating") p.status="Terminating"; });
  logEvent("ok","ROLLBACK initiated — deployment rolled to last-known-good "+e.lastGoodImage+"; fleet will be replaced from the good image");
  S.ui.mform=S.ui.mform||{}; S.ui.mform.image=e.lastGoodImage;
  saveSoon(); renderAll();
}
function doHotfix(){
  var e=S.env;
  if(!e.applied){ toast("Declare a deployment first"); return; }
  e.hotfixDeployed=true;
  if(tagOf(e.applied.image)!=="2.0.0-hotfix") e.lastGoodImage=e.applied.image;
  e.applied.image="meridian/cart-web:2.0.0-hotfix";
  e.pods.forEach(function(p){ if(p.app==="cart-web"&&p.status!=="Terminating") p.status="Terminating"; });
  if(S.ui.mform) S.ui.mform.image=e.applied.image;
  logEvent("err","vendor script deployed meridian/cart-web:2.0.0-hotfix — untested tag pushed straight to production");
  saveSoon(); renderAll();
}
function doSale(on){
  var e=S.env; e.sale=on;
  if(on){ e.traffic=905; logEvent("warn","FLASH SALE LIVE — storefront traffic ~900 rps (baseline 120)"); }
  else { e.traffic=125; logEvent("info","sale ended — traffic returning to baseline; scale down idle replicas"); }
  var b1=$("btnSale"), b2=$("btnSaleEnd");
  if(b1) b1.disabled=on; if(b2) b2.disabled=!on;
  saveSoon(); renderAll();
}
function doKill(){
  var run=S.env.pods.filter(function(p){return p.status==="Running";});
  if(!run.length){ toast("No running pod to kill"); return; }
  var p=run[Math.floor(Math.random()*run.length)];
  p.status="Terminating"; S.flags.expectHeal=(S.flags.expectHeal||0)+1;
  logEvent("err","DRILL: pod "+p.id+" killed by watch officer — observe the response");
  saveSoon(); renderAll();
}
function doDrain(name){
  var n=S.env.nodes.find(function(x){return x.name===name;});
  if(!n) return;
  if(n.status==="drained"){ n.status="ok"; logEvent("info",name+" reopened — scheduler may use it again"); }
  else{
    n.status="drained";
    var moved=0;
    S.env.pods.forEach(function(p){ if(p.node===name&&p.status!=="Terminating"){ p.status="Terminating"; moved++; S.flags.expectHeal=(S.flags.expectHeal||0)+1; } });
    logEvent("warn",name+" DRAINED — "+moved+" pod(s) evicted; replacements will be rescheduled");
  }
  saveSoon(); renderAll();
}
function doRescheduleApi(){
  var run=S.env.pods.filter(function(p){return p.app==="cart-api"&&p.status==="Running";});
  if(!run.length){ toast("No running cart-api pod"); return; }
  var p=run[0]; p.status="Terminating"; S.flags.expectHeal=(S.flags.expectHeal||0)+1;
  S.env.apiRescheduled=true;
  logEvent("warn","cart-api maintenance: pod "+p.id+" evicted — its pod IP 10.24."+Math.floor(Math.random()*9)+"."+Math.floor(Math.random()*200+20)+" will change");
  saveSoon(); renderAll();
}
function doClaimPvc(){
  var name=$("pvc-name")?$("pvc-name").value.trim():"";
  var size=$("pvc-size")?$("pvc-size").value:"2Gi";
  if(!name){ toast("Name your claim first (e.g. cart-sessions-pvc)"); return; }
  S.env.pvc={name:name,size:size};
  logEvent("ok","PVC "+name+" ("+size+") bound — cart-sessions now PV-backed; data will survive restarts");
  saveSoon(); renderAll();
}
function doEndpoint(v){
  S.env.endpointCfg=v;
  if(v==="cart-api.store.meridian.example") logEvent("ok","storefront endpoint set to Service DNS — registry handles IP churn");
  else logEvent("warn","storefront endpoint points at a pod address — it will break on the next reschedule");
  saveSoon(); renderAll();
}
function doVendorToggle(k){
  var v=S.env.vendor;
  if(k==="priv"){ v.privileged=false; logEvent("ok","vendor manifest: privileged removed — least privilege restored"); }
  if(k==="secret"){ v.secret="vault-ref"; logEvent("ok","vendor manifest: DB_PASSWORD moved to vault reference — rotate the exposed value"); }
  if(k==="tag"){ v.tag="3.0.1"; logEvent("ok","vendor manifest: image pinned to 3.0.1"); }
  if(k==="probes"){ v.probes=true; logEvent("ok","vendor manifest: readiness probes enabled"); }
  saveSoon(); renderAll();
}

function pickMode(m){
  S.mode=m; S.env=freshEnv(m); S.screen="brief";
  S.ui={}; S.wo={}; S.flags={}; S.quiz={answers:{},locked:{},score:null}; S.hintCost=false; S.seenDone=false;
  if(m==="hard"){ var ap=S.env.applied; S.ui.mform={name:ap.app,image:ap.image,replicas:String(ap.replicas),port:String(ap.port),probes:ap.probes,priv:false,secret:"secret-ref",store:"none"}; }
  else { S.ui.mform={name:"",image:"meridian/cart-web:1.4.2",replicas:"",port:"",probes:false,priv:false,secret:"secret-ref",store:"none"}; }
  logEvent("info","sign-on: "+(m==="hard"?"NIGHT WATCH begins — storm conditions, store down":"DAY WATCH begins — training cruise, calm seas"));
  if(m==="hard") seedHardEvents();
  save(); showScreen(); window.scrollTo(0,0);
}
function enterLab(){
  S.screen="lab"; save(); showScreen(); switchTab(S.ui.tab||"manifest");
  renderAll(); window.scrollTo(0,0);
  toast(S.mode==="hard"?"Night watch: the store is DOWN. Start with work order H1 — triage the radio log.":"Day watch: open work order 1 in the ledger and follow the pier pointers.");
}

function seedHardEvents(){
  var e=S.env; e.evIds={};
  SEED_SEQ.forEach(function(r){ var id=logEvent(r[0],r[1]); });
  e.evIds.crash=e.events.find(function(x){return x.msg.indexOf("Back-off restarting failed container")>=0;}).id;
  e.evIds.priv=e.events.find(function(x){return x.msg.indexOf("privileged: true")>=0;}).id;
  e.evIds.secret=e.events.find(function(x){return x.msg.indexOf("DB_PASSWORD")>=0;}).id;
  S.flags.sawRunning=true; S.flags.dl=true; e.downtime=1;
}

/* ---------------- delegation ---------------- */
function onClick(ev){
  var t=ev.target.closest("[data-act]");
  if(!t) return;
  var act=t.getAttribute("data-act");
  var wo=t.getAttribute("data-wo"), key=t.getAttribute("data-key"), v=t.getAttribute("data-val")||t.getAttribute("data-opt")||t.getAttribute("data-node")||t.getAttribute("data-ev")||t.getAttribute("data-tab")||"";
  var LOCKABLE={"sort-pick":1,"sort-drop":1,"match-pick":1,"seq-up":1,"seq-down":1};
  if(wo&&LOCKABLE[act]&&woState(wo).done) return; // R2: answers of a checked exercise are locked
  if(act==="mode-med"){ pickMode("medium"); }
  else if(act==="mode-hard"){ pickMode("hard"); }
  else if(act==="enter-lab"){ enterLab(); }
  else if(act==="back-mode"){ S.screen="mode"; save(); showScreen(); }
  else if(act==="acc"){ var b=t, body=$(b.getAttribute("data-acc")); var ex=b.getAttribute("aria-expanded")==="true";
    b.setAttribute("aria-expanded",ex?"false":"true"); if(body) body.classList.toggle("hidden",ex); }
  else if(act==="tab"){ switchTab(t.getAttribute("data-tab")); }
  else if(act==="wo-head"){ S.openWo=(S.openWo===wo)?null:wo; renderLedger(); }
  else if(act==="wo-look"){ switchTab(v); var el=$("wb-"+v); if(el) el.scrollIntoView({behavior:"smooth",block:"start"}); }
  else if(act==="wo-check"){ runCheck(wo); }
  else if(act==="wo-hint"){ useHint(wo); }
  else if(act==="apply"){ applyManifest(); }
  else if(act==="rollback"){ doRollback(); }
  else if(act==="hotfix"){ doHotfix(); }
  else if(act==="sale"){ doSale(true); }
  else if(act==="sale-end"){ doSale(false); }
  else if(act==="kill"){ doKill(); }
  else if(act==="drain"){ doDrain(v); }
  else if(act==="resched"){ doRescheduleApi(); }
  else if(act==="claim"){ doClaimPvc(); }
  else if(act==="vendor"){ doVendorToggle(key); }
  else if(act==="sort-pick"){ var uk=wo.replace("OBJ-",""); var st=S.ui[uk]||(S.ui[uk]={sel:null,place:{}}); st.sel=key; renderLedger(); }
  else if(act==="sort-drop"){ var uk2=wo.replace("OBJ-",""); var st2=S.ui[uk2]||(S.ui[uk2]={sel:null,place:{}}); if(st2.sel){ st2.place[st2.sel]=(t.getAttribute("data-bin")); st2.sel=null; } renderLedger(); }
  else if(act==="match-pick"){ var uk3=wo.replace("OBJ-",""); var st3=S.ui[uk3]||(S.ui[uk3]={sel:null,map:{}}); st3.map[key]=v; renderLedger(); }
  else if(act==="seq-up"||act==="seq-down"){ var uk4=wo.replace("OBJ-",""); var st4=S.ui[uk4]||(S.ui[uk4]={order:[]}); var i=parseInt(t.getAttribute("data-idx"),10);
    var j=act==="seq-up"?i-1:i+1; if(j>=0&&j<st4.order.length){ var tmp=st4.order[i]; st4.order[i]=st4.order[j]; st4.order[j]=tmp; } renderLedger(); }
  else if(act==="flag"){ if(woState("OBJ-H1").done) return; var st5=S.ui.H1||(S.ui.H1={flags:{}}); st5.flags[v]=!st5.flags[v]; renderLog(); renderSnaps(); }
  else if(act==="quiz"){ quizPick(parseInt(t.getAttribute("data-q"),10),parseInt(t.getAttribute("data-opt"),10)); }
  else if(act==="finish"){ openDone(); }
  else if(act==="reset"){ $("modal-reset").classList.remove("hidden"); var r=$("btnResetYes"); if(r) r.focus(); }
  else if(act==="reset-yes"){ try{ localStorage.removeItem(LS_KEY); }catch(e){} location.reload(); }
  else if(act==="reset-no"){ $("modal-reset").classList.add("hidden"); var rb=$("btnReset"); if(rb) rb.focus(); }
  else if(act==="done-debrief"){ $("modal-done").classList.add("hidden"); switchTab("debrief"); var tb=$("tab-debrief"); if(tb) tb.focus(); }
  else if(act==="done-close"){ $("modal-done").classList.add("hidden"); var fb=$("btnFinish"); if(fb) fb.focus(); }
}

function bindStatic(){
  var mm=$("btnModeMed"), mh=$("btnModeHard"), be=$("btnEnterLab"), bm=$("btnBackMode");
  if(mm) mm.setAttribute("data-act","mode-med");
  if(mh) mh.setAttribute("data-act","mode-hard");
  if(be) be.setAttribute("data-act","enter-lab");
  if(bm) bm.setAttribute("data-act","back-mode");
  ["manifest","fleet","svc","reg","lex","exam","debrief"].forEach(function(t){
    var b=$("tab-"+t); if(b){ b.setAttribute("data-act","tab"); b.setAttribute("data-tab",t); }
  });
  var bs=$("btnSale"); if(bs) bs.setAttribute("data-act","sale");
  var bse=$("btnSaleEnd"); if(bse) bse.setAttribute("data-act","sale-end");
  var bk=$("btnKill"); if(bk) bk.setAttribute("data-act","kill");
  var bf=$("btnFinish"); if(bf) bf.setAttribute("data-act","finish");
  var br=$("btnReset"); if(br) br.setAttribute("data-act","reset");
  var ry=$("btnResetYes"); if(ry) ry.setAttribute("data-act","reset-yes");
  var rn=$("btnResetNo"); if(rn) rn.setAttribute("data-act","reset-no");
  var md=$("modal-done");
  if(md) md.addEventListener("click",function(ev){ if(ev.target===md){ md.classList.add("hidden"); var b=$("btnFinish"); if(b) b.focus(); } });
  document.querySelectorAll("[data-acc]").forEach(function(b){ b.setAttribute("data-act","acc"); });
}
function onInput(ev){
  var t=ev.target;
  var act=t.getAttribute&&t.getAttribute("data-act");
  var ANSWER_ACTS={radio:1,checkb:1,select:1,number:1};
  if(act&&ANSWER_ACTS[act]&&woState(t.getAttribute("data-wo")||"").done) return; // R2 lock
  if(act==="radio"){ var wo=t.getAttribute("data-wo").replace("OBJ-",""); var st=S.ui[wo]||(S.ui[wo]={}); st[t.getAttribute("data-key")]=t.getAttribute("data-val"); saveSoon(); }
  else if(act==="checkb"){ var wo2=t.getAttribute("data-wo").replace("OBJ-",""); var val=t.getAttribute("data-val");
    var st2=S.ui[wo2]||(S.ui[wo2]={});
    if(wo2==="H7"){ st2.r=st2.r||{}; st2.r[val]=t.checked; }
    else if(wo2==="H1"){ st2.flags=st2.flags||{}; st2.flags[val]=t.checked; }
    else { st2.c=st2.c||{}; st2.c[t.getAttribute("data-key")]=t.checked; }
    saveSoon(); }
  else if(act==="select"){ var wo3=t.getAttribute("data-wo").replace("OBJ-",""); var st3=S.ui[wo3]||(S.ui[wo3]={}); st3[t.getAttribute("data-key")]=t.value; saveSoon(); }
  else if(act==="endpoint"){ doEndpoint(t.value); }
  else if(act==="number"){ var wo4=t.getAttribute("data-wo").replace("OBJ-",""); var st4=S.ui[wo4]||(S.ui[wo4]={}); st4[t.getAttribute("data-key")]=t.value; saveSoon(); }
  else if(t.id&&t.id.indexOf("m-")===0){ S.ui.mform=S.ui.mform||{}; 
    if(t.type==="checkbox") S.ui.mform[t.id.slice(2)]=t.checked; else S.ui.mform[t.id.slice(2)]=t.value;
    updatePreview(); saveSoon(); }
}
function toast(msg){
  var host=$("toastHost"); if(!host) return;
  var d=document.createElement("div"); d.className="toast"; d.textContent=msg;
  host.appendChild(d);
  setTimeout(function(){ if(d.parentNode) d.parentNode.removeChild(d); },2800);
}
document.addEventListener("click",function(ev){ onClick(ev); });
document.addEventListener("input",function(ev){ onInput(ev); });
document.addEventListener("keydown",function(ev){
  if(ev.key==="Escape"){
    var r=$("modal-reset"), d=$("modal-done");
    if(r&&!r.classList.contains("hidden")){ r.classList.add("hidden"); var b1=$("btnReset"); if(b1) b1.focus(); }
    if(d&&!d.classList.contains("hidden")){ d.classList.add("hidden"); var b2=$("btnFinish"); if(b2) b2.focus(); }
  }
  var t=ev.target;
  if(t&&t.getAttribute&&t.getAttribute("data-act")&&(ev.key==="Enter"||ev.key===" ")){
    var tag=t.tagName;
    if(tag!=="BUTTON"&&tag!=="INPUT"&&tag!=="SELECT"&&tag!=="A"){ ev.preventDefault(); onClick({target:t}); }
  }
});

function init(){
  var resumed=load();
  if(!S.mode){ S.screen="mode"; }
  else if(!S.env.evIds) S.env.evIds={};
  bindStatic();
  showScreen();
  if(S.screen==="lab") switchTab(S.ui.tab||"manifest");
  renderAll();
  setInterval(function(){ if(S.screen==="lab"&&!document.hidden) tick(); },TICK_MS);
}
init();
