"use strict";
/* =====================================================================
   CyberLab "Harbor Control" — js/ui.js
   RENDERING — status bar, harbor map, workbench tabs, work-order ledger,
   radio log, debrief, toasts and the docking-certificate completion modal.
   Ported 1:1 from the audited single-file lab (v4, QA fixes included).
   ===================================================================== */

/* ---------------- completion ---------------- */
function openDone(){
  var total=OBJ().length, done=woDoneCount();
  var qz=S.mode==="hard"?QUIZ_HARD:QUIZ_MED;
  var qc=quizScore();
  var score=Math.round(done/total*50+qc/qz.length*50);
  var st=starsCalc();
  var pillars={P1:[0,0],P2:[0,0],P3:[0,0],P4:[0,0]};
  OBJ().forEach(function(o){ pillars[o.pillar][1]++; var w=woState(o.id); if(w.done&&!w.firstFail) pillars[o.pillar][0]++; });
  var names={P1:"Understand",P2:"Recognize / Analyze",P3:"Detect",P4:"Mitigate"};
  var recap="";
  ["P1","P2","P3","P4"].forEach(function(p){ var v=pillars[p]; var pc=v[1]?Math.round(v[0]/v[1]*100):0;
    recap+='<div class="pr-cell"><div class="prn badge '+p.toLowerCase()+'">'+p+' · '+names[p]+'</div><div style="font:700 15px/1 var(--mono);margin-top:8px">'+v[0]+' / '+v[1]+'</div><div class="stencil" style="margin-top:2px;font-size:10px">passed first try</div><div class="prbar"><div class="prfill" style="width:'+pc+'%"></div></div></div>'; });
  // R8: focus areas derived from actual performance
  var focus=[];
  OBJ().forEach(function(o){ var w=woState(o.id); if(w.firstFail) focus.push({p:o.pillar,t:o.title,n:w.attempts,h:w.hints}); });
  var qMiss=[]; for(var qi=0;qi<qz.length;qi++){ if(S.quiz.locked[qi]!==undefined&&S.quiz.answers[qi]!==qz[qi].a) qMiss.push(qi+1); }
  var focusHtml="";
  if(focus.length||qMiss.length){
    focusHtml='<div class="stencil" style="margin:16px 0 6px">Focus areas — where to double down</div><ul style="margin:0;padding-left:18px;color:var(--mist);font-size:13.5px">';
    focus.forEach(function(f){ focusHtml+='<li style="margin:5px 0"><b style="color:var(--foam)">'+f.p+' · '+esc(f.t)+'</b> — solved on check #'+f.n+(f.h?' with '+f.h+' hint(s)':'')+'. Walk it again mentally and re-read the matching section of the Harbor-ops manual (briefing screen).</li>'; });
    if(qMiss.length) focusHtml+='<li style="margin:5px 0"><b style="color:var(--foam)">Examination Q'+qMiss.join(", Q")+'</b> — missed. Reopen the Examination tab and re-read the explanation under each missed question.</li>';
    focusHtml+='</ul>';
  } else {
    focusHtml='<div class="callout" style="border-left-color:var(--seafoam);margin-top:14px"><b>Focus areas: none.</b> Every work order passed on the first check and every examination item was correct. For more depth, replay the other watch mode.</div>';
  }
  $("doneBody").innerHTML='<h2 id="doneTitle">⚓ Docking certificate — watch complete</h2>'
   +'<div class="bigstars" aria-label="'+st+' of 5 stars">'+"★★★★★".slice(0,st)+'<span class="off">'+"★★★★★".slice(st)+'</span></div>'
   +'<div class="score-big">'+score+'<span style="font-size:16px;color:var(--mist)"> / 100</span></div>'
   +'<p class="note">Work orders '+done+'/'+total+' · examination '+qc+'/'+qz.length+' · stars reflect first-attempt accuracy and hint use.</p>'
   +'<div class="pillar-recap">'+recap+'</div>'
   +focusHtml
   +'<p class="note"><b>You can now:</b> explain what orchestration does that stand-alone containers and one-off scripts cannot; read a cluster event stream and find the real faults; declare, scale, update, heal and persist a container fleet; and harden it — least privilege, secrets, pinned images, probes — while naming what risk remains.</p>'
   +'<p class="note"><b>Next on your chart:</b> CV0-004 objective 1.6 containerization deep-dive (images, registries, port mapping) · Domain 2.0 cloud security controls · Kubernetes tutorials at kubernetes.io · MITRE ATT&amp;CK container techniques (T1609–T1613) for the defender view.</p>'
   +'<div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap"><button class="btn" data-act="done-debrief">Review the debrief</button><button class="btn-ghost btn" data-act="done-close">Close</button></div>';
  $("modal-done").classList.remove("hidden");
  var b=$("doneBody").querySelector("button"); if(b) b.focus();
}

function renderDynamic(){ renderPiers(); renderMeter(); renderFleet(); renderLog(); renderSnaps(); renderStatus(); }

/* ---------------- renderers ---------------- */
function statusChip(){
  var c=$("modeChip"); if(!c) return;
  c.textContent=S.mode==="hard"?"NIGHT WATCH":"DAY WATCH";
  c.className="badge modechip"+(S.mode==="hard"?" night":"");
}
function renderStatus(){
  statusChip();
  var total=OBJ().length, done=woDoneCount(), pct=total?Math.round(done/total*100):0;
  $("woProgressTxt").textContent="Work orders "+done+"/"+total;
  $("ringTxt").textContent=pct+"%";
  $("ringFg").style.strokeDashoffset=(100.5*(1-pct/100)).toFixed(1);
  var st=starsCalc();
  $("starsBox").innerHTML="★★★★★".slice(0,st)+'<span class="off">'+"★★★★★".slice(st)+"</span>";
  var qz=S.mode==="hard"?QUIZ_HARD:QUIZ_MED, allQ=true;
  for(var i=0;i<qz.length;i++){ if(S.quiz.locked[i]===undefined) allQ=false; }
  $("btnFinish").disabled=!(done===total&&allQ);
  $("rlCount").textContent=S.env.events.length+" events";
}
function renderPiers(){
  var h="";
  S.env.nodes.forEach(function(n){
    var load=nodeLoad(n.name);
    h+='<div class="pier '+(n.status==="drained"?"drained":"ok")+'"><div class="pier-head"><span>'+n.name+'</span>'
     +'<span class="cap">'+load+"/"+n.cap+' berths</span>'
     +(n.status==="drained"?'<span class="stat-bad">DRAINED</span> <button class="flagbtn" data-act="drain" data-node="'+n.name+'">REOPEN</button>'
                           :'<button class="flagbtn" data-act="drain" data-node="'+n.name+'" aria-label="Drain '+n.name+'">DRAIN</button>')+'</div><div class="berths">';
    S.env.pods.forEach(function(p){ if(p.node!==n.name) return;
      h+='<span class="podchip '+p.status+'">'+p.id+(p.restarts?' <span class="rs">↻'+p.restarts+"</span>":"")+"</span>"; });
    if(load===0) h+='<span class="note" style="align-self:center">empty</span>';
    h+="</div></div>";
  });
  $("piers").innerHTML=h;
}
function renderMeter(){
  $("trafficVal").textContent=S.env.traffic+" rps"+(S.env.sale?" · SALE":"");
  $("trafficFill").style.width=Math.min(100,Math.round(S.env.traffic/1000*100))+"%";
  var b1=$("btnSale"), b2=$("btnSaleEnd");
  if(b1) b1.disabled=S.env.sale; if(b2) b2.disabled=!S.env.sale;
}
function renderManifest(){
  var mf=S.ui.mform||(S.ui.mform={name:"",image:"meridian/cart-web:1.4.2",replicas:"",port:"",probes:false,priv:false,secret:"secret-ref",store:"none"});
  var f=S.ui.mform;
  var imgSel=function(v,l){return '<option value="'+v+'"'+(f.image===v?" selected":"")+">"+l+"</option>";};
  var a=S.env.applied;
  $("wb-manifest").innerHTML=
   '<div class="stencil">Declaration editor — desired state</div>'
   +'<p class="note">You declare the END STATE; the harbor master reconciles reality toward it. This is the opposite of hand-running containers.</p>'
   +'<div class="formgrid">'
   +'<div class="formrow"><label for="m-name">App name</label><input id="m-name" placeholder="cart-web" value="'+esc(f.name)+'"></div>'
   +'<div class="formrow"><label for="m-image">Image + tag</label><select id="m-image">'
     +imgSel("meridian/cart-web:1.4.2","meridian/cart-web:1.4.2 ✓ pinned")
     +imgSel("meridian/cart-web:1.5.0","meridian/cart-web:1.5.0 ✓ pinned")
     +imgSel("meridian/cart-web:2.0.0-hotfix","meridian/cart-web:2.0.0-hotfix ⚠ vendor tag")
     +imgSel("meridian/cart-web:latest","meridian/cart-web:latest ⚠ unpinned")
   +'</select></div>'
   +'<div class="formrow"><label for="m-replicas">Replicas</label><input id="m-replicas" type="number" min="1" max="64" placeholder="4" value="'+esc(f.replicas)+'"></div>'
   +'<div class="formrow"><label for="m-port">Container port</label><input id="m-port" type="number" placeholder="8443" value="'+esc(f.port)+'"></div>'
   +'</div>'
   +'<label class="auditopt"><input id="m-probes" type="checkbox" '+(f.probes?"checked":"")+'><span>Readiness probes ON — no traffic until a pod proves it is ready</span></label>'
   +'<label class="auditopt"><input id="m-priv" type="checkbox" '+(f.priv?"checked":"")+'><span>privileged: true ⚠ (host-level access — never in production)</span></label>'
   +'<div class="formrow"><label for="m-secret">Secrets</label><select id="m-secret"><option value="secret-ref"'+(f.secret==="secret-ref"?" selected":"")+'>Secret object reference ✓</option><option value="plaintext"'+(f.secret==="plaintext"?" selected":"")+'>⚠ plaintext env var</option></select></div>'
   +'<div class="formrow"><label for="m-store">Storage</label><select id="m-store"><option value="none"'+(f.store==="none"?" selected":"")+'>ephemeral</option><option value="pvc"'+(f.store==="pvc"?" selected":"")+'>PVC claim</option></select></div>'
   +'<div class="manifbox" id="m-preview"></div>'
   +'<div style="display:flex;gap:10px;margin-top:12px;flex-wrap:wrap">'
   +'<button class="btn" data-act="apply">APPLY DECLARATION</button>'
   +(a&&S.env.lastGoodImage?'<button class="btn-ghost btn" data-act="rollback">⟲ Roll back to '+esc(tagOf(S.env.lastGoodImage))+"</button>":"")
   +(S.mode==="medium"&&woState("OBJ-M7").done?'<button class="btn-danger btn" data-act="hotfix">🚨 Deploy vendor hotfix (2.0.0-hotfix)</button>':"")
   +"</div>"
   +(a?'<p class="note" style="margin-top:10px">Last applied: <b>'+esc(a.app+" · "+a.image+" · replicas "+a.replicas+" · port "+a.port+" · probes "+(a.probes?"ON":"OFF"))+"</b></p>":"");
  updatePreview();
}
function updatePreview(){
  var f=readForm();
  var y="apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: "+(f.name||"<app-name>")+"\nspec:\n  replicas: "+(f.replicas||"<n>")+"\n  template:\n    spec:\n      containers:\n      - name: "+(f.name||"<app>")+"\n        image: "+(f.image||"<image:tag>")+"\n        ports:\n        - containerPort: "+(f.port||"<port>")+"\n        readinessProbe:\n          httpGet: { path: /readyz, port: "+(f.port||"<port>")+" }";
  if(f.priv) y+="\n        securityContext:\n          privileged: true   # ⚠ LEAST-PRIVILEGE VIOLATION";
  if(f.secret==="plaintext") y+="\n      env:\n      - name: DB_PASSWORD\n        value: \"hunter2\"   # ⚠ PLAINTEXT SECRET";
  else y+="\n      envFrom:\n      - secretRef: { name: cart-db-secret }   # ✓";
  if(f.store==="pvc") y+="\n      volumeMounts:\n      - { name: data, mountPath: /data }\n  volumes:\n  - name: data\n    persistentVolumeClaim: { claimName: cart-sessions-pvc }";
  else y+="\n  # storage: ephemeral — data dies with the pod";
  var el=$("m-preview"); if(el) el.textContent=y;
}
function renderFleet(){
  var e=S.env,a=e.applied;
  var loop=e.pods.filter(function(p){return p.status==="CrashLoopBackOff";}).length;
  var pend=e.pods.filter(function(p){return p.status==="Pending";}).length;
  $("wb-fleet").innerHTML='<div class="stencil">Fleet ops — reconciliation status</div>'
   +'<div class="manifbox">declared : '+(a?esc(a.app+" replicas="+a.replicas+" image="+a.image):"— nothing declared")+"\n"
   +"actual  : "+e.pods.length+" pods in harbor ("+runningOf("cart-web")+" web Running, "+pend+" Pending, "+loop+" in CrashLoop)\n"
   +"last-known-good image : "+(e.lastGoodImage?esc(e.lastGoodImage):"—")+"\n"
   +"downtime events : "+e.downtime+"   self-healing events : "+e.healCount+"\n"
   +"sale : "+(e.sale?"LIVE — "+e.traffic+" rps":"no")+"</div>"
   +'<div class="callout">Desired state is a contract: the controller compares this block every second and fixes drift. Scale, kill or drain anything — declared state wins.</div>'
   +'<p class="note">Operational buttons live on the harbor map (sale, kill, drain). Rollback and the vendor hotfix live on the MANIFEST tab.</p>';
}
function renderSvc(){
  var e=S.env;
  var svc='<table style="width:100%;border-collapse:collapse;font:500 13px/1.7 var(--mono)"><tr style="color:var(--dim)"><td>SERVICE</td><td>DNS NAME</td><td>TARGET APP</td></tr>';
  e.services.forEach(function(s){ svc+="<tr><td>"+esc(s.name)+'</td><td style="color:var(--seafoam)">'+esc(s.dns)+"</td><td>"+esc(s.target)+"</td></tr>"; });
  svc+="</table>";
  var epOptions=[["10.24.1.7","10.24.1.7 (pod IP — rots on reschedule)"],["cart-api.store.meridian.example","cart-api.store.meridian.example (Service DNS ✓)"],["10.24.3.1:30443","10.24.3.1:30443 (node port)"]];
  var ep='<select data-act="endpoint" style="width:100%;max-width:420px"><option value="">— choose the storefront endpoint —</option>';
  epOptions.forEach(function(o){ ep+='<option value="'+o[0]+'"'+(e.endpointCfg===o[0]?" selected":"")+">"+o[1]+"</option>"; });
  ep+="</select>";
  $("wb-svc").innerHTML='<div class="stencil">Service directory — discovery</div>'+svc
   +'<p class="note" style="margin-top:10px">The Service owns a DNS name and an auto-updating registry of the current replicas. Callers that use the name never notice rescheduling.</p>'
   +'<div class="callout">Storefront → cart-api endpoint: '+ep+' <button class="btn-ghost btn btn-sm" data-act="resched">RESCHEDULE CART-API</button></div>'
   +'<div class="stencil" style="margin-top:16px">Storage ledger — persistence</div>'
   +'<div class="manifbox">cart-sessions storage : '+(e.pvc?("PVC "+esc(e.pvc.name)+" ("+esc(e.pvc.size)+") — PV-backed ✓"):"ephemeral — data dies with the pod ⚠")+"</div>"
   +'<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:10px">'
   +'<input id="pvc-name" placeholder="claim name, e.g. cart-sessions-pvc" style="min-width:220px">'
   +'<select id="pvc-size"><option>1Gi</option><option selected>2Gi</option><option>8Gi</option></select>'
   +'<button class="btn btn-sm" data-act="claim">CLAIM PVC</button></div>'
   +'<p class="note">A Persistent Volume decouples storage from the pod life-cycle; the PVC is the pod\u2019s claim on it. Ephemeral volumes vanish on restart.</p>';
}
function renderReg(){
  var v=S.env.vendor;
  var rows=[["meridian/cart-web","1.4.2 · 1.5.0 · latest · 2.0.0-hotfix","2.0.0-hotfix: NOT FOUND in registry"],
   ["meridian/cart-api","2.1.0 · 2.2.0-beta","clean — scanned 2h ago"],
   ["vendor/legacy-importer","latest → 3.0.1","clean on pinned tag"]];
  var t='<table style="width:100%;border-collapse:collapse;font:500 13px/1.7 var(--mono)"><tr style="color:var(--dim)"><td>REPOSITORY</td><td>TAGS</td><td>SCAN</td></tr>';
  rows.forEach(function(r){ t+="<tr><td>"+r[0]+"</td><td>"+r[1]+'</td><td style="color:'+(r[2].indexOf("NOT FOUND")>=0?"var(--red)":"var(--seafoam)")+'">'+r[2]+"</td></tr>"; });
  t+="</table>";
  var y="apiVersion: v1\nkind: Pod\nmetadata:\n  name: legacy-importer\nspec:\n  containers:\n  - name: importer\n    image: vendor/legacy-importer:"+(v.tag==="latest"?"latest  # ⚠ unpinned":"3.0.1  # ✓ pinned")+"\n"
   +(v.privileged?"    securityContext:\n      privileged: true   # ⚠ host-level access\n":"    securityContext:\n      runAsNonRoot: true   # ✓\n")
   +(v.secret==="plaintext"?'    env:\n    - name: DB_PASSWORD\n      value: "hunter2"   # ⚠ PLAINTEXT\n':"    envFrom:\n    - secretRef: { name: vendor-vault }   # ✓\n")
   +(v.probes?"    readinessProbe:\n      httpGet: { path: /readyz, port: 8443 }   # ✓":"    # ⚠ no readiness probe");
  $("wb-reg").innerHTML='<div class="stencil">Image registry — pull sources & scans</div>'+t
   +'<div class="callout" style="border-left-color:var(--red)"><b>Vendor manifest — legacy-importer (audit target)</b>'
   +'<div class="manifbox" style="margin-top:8px">'+esc(y)+"</div>"
   +'<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">'
   +'<button class="btn-ghost btn btn-sm" data-act="vendor" data-key="priv"'+(v.privileged?"":" disabled")+'>Remove privileged</button>'
   +'<button class="btn-ghost btn btn-sm" data-act="vendor" data-key="secret"'+(v.secret==="plaintext"?"":" disabled")+'>Secret → vault ref</button>'
   +'<button class="btn-ghost btn btn-sm" data-act="vendor" data-key="tag"'+(v.tag==="latest"?"":" disabled")+'>Pin tag 3.0.1</button>'
   +'<button class="btn-ghost btn btn-sm" data-act="vendor" data-key="probes"'+(v.probes?" disabled":"")+'>Enable probes</button>'
   +"</div></div>"
   +'<p class="note">Orchestrators pull images from registries (Docker Hub, AWS ECR, Azure ACR, Google GCR). Pin tags, scan images, and treat registry content as part of your supply chain.</p>';
}
function renderLex(){
  var h='<div class="stencil">Harbor lexicon — every term, one line each</div>';
  GLOSSARY.forEach(function(g){ h+='<p style="margin:7px 0"><b style="color:var(--foam)">'+g[0]+"</b> — "+esc(g[1])+"</p>"; });
  $("wb-lex").innerHTML=h;
}

function renderDebrief(){
  $("wb-debrief").innerHTML='<div class="debrief">'
   +'<div class="stencil">Chart table — debrief &amp; field notes</div>'
   +"<h3>Detection opportunities (what defenders watch)</h3>"
   +"<ul><li><b>Cluster event stream</b> — CrashLoopBackOff storms, OOMKilled, probe failures, Pending storms. Example logic: <code>events.reason = \"BackOff\" AND count ≥ 5 in 5m</code>.</li>"
   +"<li><b>Manifest &amp; admission audit</b> — privileged pods, plaintext env secrets, unpinned tags. Example: <code>admission DENY when securityContext.privileged = true</code>.</li>"
   +"<li><b>Registry scanning</b> — unknown tags (<code>2.0.0-hotfix</code> did not exist), unscanned images, pulls from untrusted repos.</li>"
   +"<li><b>Orchestrator audit logs</b> — who applied what, when. Sudden replica spikes or new deployments outside change windows are signals.</li></ul>"
   +"<h3>The same plane, seen from the threat model <span class=\"tag\">simplified</span></h3>"
   +"<ul><li><a href=\"https://attack.mitre.org/techniques/T1609/\" target=\"_blank\" rel=\"noopener\">T1609 Container Administration Command</a> — abusing the orchestrator API / exec into containers.</li>"
   +"<li><a href=\"https://attack.mitre.org/techniques/T1610/\" target=\"_blank\" rel=\"noopener\">T1610 Deploy Container</a> — deploying a container to execute or evade defenses.</li>"
   +"<li><a href=\"https://attack.mitre.org/techniques/T1611/\" target=\"_blank\" rel=\"noopener\">T1611 Escape to Host</a> — breaking out of the container isolation boundary.</li>"
   +"<li><a href=\"https://attack.mitre.org/techniques/T1613/\" target=\"_blank\" rel=\"noopener\">T1613 Container and Resource Discovery</a> — enumerating the cluster before acting.</li></ul>"
   +"<h3>Mitigation recommendations</h3>"
   +"<ul><li><b>Least privilege</b> — no <code>privileged: true</code>, non-root users, minimal capabilities.</li>"
   +"<li><b>Secrets management</b> — Secret objects / vault refs, rotation after any exposure.</li>"
   +"<li><b>Image hygiene</b> — pinned tags, scanned images, trusted registries only.</li>"
   +"<li><b>Access control &amp; quotas</b> — RBAC on the API, namespaces, resource quotas.</li>"
   +"<li><b>Health probes</b> — the orchestrator can only heal and route around what it can measure.</li>"
   +"<li><b>Residual risk</b> — control-plane compromise, supply-chain (registry) compromise, kernel-level escape. Managed services reduce the first, not the others.</li></ul>"
   +"<h3>Blue-team takeaways</h3><ul><li>Read events before touching keyboards: the newest change is the prime suspect (tonight: a tag).</li>"
   +"<li>Probes are a safety gate you own; disabling them converts any bad deploy into an outage.</li>"
   +"<li>Rollback is a first-class tool — keep last-known-good pinned and rehearsed.</li></ul>"
   +"<h3>Red-team-mindset takeaways (defensive use)</h3><ul><li>The orchestrator API is the crown jewel: one admin command reaches every pod.</li>"
   +"<li>A privileged pod or a plaintext secret in git is a short path to host access and lateral movement.</li>"
   +"<li>New, unscanned images appearing mid-incident deserve as much suspicion as any exploit.</li></ul>"
   +"<h3>Official references (open in a new tab)</h3><ul>"
   +'<li><a href="https://www.comptia.org/en-us/certifications/cloud" target="_blank" rel="noopener">CompTIA Cloud+ CV0-004 — official page &amp; objectives</a></li>'
   +'<li><a href="https://kubernetes.io/docs/home/" target="_blank" rel="noopener">Kubernetes documentation</a></li>'
   +'<li><a href="https://kubernetes.io/docs/tutorials/kubernetes-basics/" target="_blank" rel="noopener">Kubernetes Basics tutorial</a></li></ul>'
   +'<p class="note">MITRE mappings above are simplified defensive context for this lesson; consult the linked pages for full detail.</p></div>';
}

/* ---------------- ledger ---------------- */
var SNAPS={
 "OBJ-M5":function(){ return "Sale running: <b>"+(S.env.sale?"YES":"no")+"</b> · traffic <b>"+S.env.traffic+" rps</b> · declared replicas <b>"+(S.env.applied?S.env.applied.replicas:"—")+"</b> · peak during sale <b>"+S.env.salePeak+"</b>"; },
 "OBJ-M7":function(){ var a=S.env.applied; return "Applied image: <b>"+(a?esc(a.image):"—")+"</b> · probes <b>"+(a&&a.probes?"ON":"OFF")+"</b> · downtime events <b>"+S.env.downtime+"</b>"; },
 "OBJ-M8":function(){ return "Pods in CrashLoopBackOff right now: <b>"+webPods().filter(function(p){return p.status==="CrashLoopBackOff";}).length+"</b>"; },
 "OBJ-M6":function(){ return "Self-healing events so far: <b>"+S.env.healCount+"</b>"; },
 "OBJ-M9":function(){ return "cart-api rescheduled for you: <b>"+(S.env.apiRescheduled?"yes":"not yet")+"</b> · storefront endpoint: <b>"+esc(S.env.endpointCfg)+"</b>"; },
 "OBJ-M10":function(){ return "cart-sessions storage: <b>"+(S.env.pvc?("PVC "+esc(S.env.pvc.name)+" ("+esc(S.env.pvc.size)+")"):"ephemeral")+"</b>"; },
 "OBJ-M3":function(){ var a=S.env.applied; return "Current declaration: <b>"+(a?esc(a.app+" · "+a.image+" · replicas "+a.replicas+" · port "+a.port):"nothing applied yet")+"</b>"; },
 "OBJ-M4":function(){ var nodes={}; webPods().forEach(function(p){ if(p.status!=="Terminating") nodes[p.node]=1; }); return "cart-web pods currently on: <b>"+(Object.keys(nodes).join(", ")||"—")+"</b>"; },
 "OBJ-H1":function(){ var st=S.ui.H1||{flags:{}}; return "Flagged so far: <b>"+Object.keys(st.flags||{}).filter(function(k){return st.flags[k];}).length+"</b> (target: exactly 3)."; },
 "OBJ-H3":function(){ var a=S.env.applied; return "Applied: <b>"+(a?esc(a.image+" · replicas "+a.replicas+" · probes "+(a.probes?"ON":"OFF")):"—")+"</b> · web Running <b>"+runningOf("cart-web")+"</b> · looping <b>"+webPods().filter(function(p){return p.status==="CrashLoopBackOff";}).length+"</b>"; },
 "OBJ-H6":function(){ var v=S.env.vendor; return "Vendor manifest state — privileged <b>"+(v.privileged?"STILL ON":"off")+"</b> · secret <b>"+esc(v.secret)+"</b> · tag <b>"+esc(v.tag)+"</b> · probes <b>"+(v.probes?"ON":"off")+"</b>"; }
};
function renderSnaps(){
  document.querySelectorAll("[data-snap]").forEach(function(el){
    var f=SNAPS[el.getAttribute("data-snap")]; if(f) el.innerHTML=f();
  });
}
function renderLedger(){
  var o=OBJ(), h="";
  var head=$("ledgerHead");
  head.textContent="Work orders — "+(S.mode==="hard"?"NIGHT WATCH (9 challenges)":"DAY WATCH (12 orders)");
  o.forEach(function(obj){
    var w=woState(obj.id);
    var open=S.openWo===obj.id;
    h+='<div class="wo'+(w.done?" done":"")+'"><div class="wo-head" role="button" tabindex="0" data-act="wo-head" data-wo="'+obj.id+'" aria-expanded="'+open+'">'
     +'<span class="woid">'+obj.id.replace("OBJ-","")+'</span><span class="badge '+obj.pillar.toLowerCase()+'">'+obj.pillar+'</span>'
     +'<span class="title">'+esc(obj.title)+'</span>'+(w.done?'<span class="chk">✔</span>':"")+"</div>";
    if(open){
      h+='<div class="wo-body"><p class="brief">'+esc(obj.brief)+"</p>"
       +(S.mode==="medium"&&obj.look&&lookTab(obj.id)?'<button class="look" data-act="wo-look" data-tab="'+lookTab(obj.id)+'">🔎 Where to look: '+esc(obj.look)+"</button>":"")
       +'<div class="miniui-holder" data-holder="'+obj.id+'">'+obj.ui()+"</div>"
       +(SNAPS[obj.id]?'<div class="note" style="margin-top:8px" data-snap="'+obj.id+'">'+SNAPS[obj.id]()+"</div>":"")
       +'<div class="wo-foot">'
       +'<button class="btn btn-sm" data-act="wo-check" data-wo="'+obj.id+'">CHECK RESULTS</button>'
       +'<button class="btn-ghost btn btn-sm" data-act="wo-hint" data-wo="'+obj.id+'">'+(S.mode==="hard"?(S.hintCost?"Nudge spent":"Use the one nudge (−1 ★)"):"Hint flag ▲ "+w.hints+"/3")+"</button></div>"
       +(S.mode==="medium"&&w.hints>0?'<div class="hintbox"><b>Hint level '+w.hints+":</b> "+esc(obj.hints[w.hints-1])+"</div>":"")
       +(S.mode==="hard"&&w.hints>0?'<div class="hintbox"><b>Nudge:</b> '+esc(obj.hints[0])+"</div>":"")
       +(w.fb?'<div class="fb '+w.fb.cls+'">'+esc(w.fb.msg)+"</div>":"")
       +(w.done?'<div class="note locknote" style="margin-top:6px">✔ Completed — answers locked.</div>':"")
       +"</div>";
    }
    h+="</div>";
  });
  $("ledgerList").innerHTML=h;
  // R2: a completed work order's answers are locked — disable every control in its card
  document.querySelectorAll("[data-holder]").forEach(function(hh){
    var w=S.wo[hh.getAttribute("data-holder")];
    if(w&&w.done) hh.querySelectorAll("button,input,select").forEach(function(el){ el.disabled=true; });
  });
}
function lookTab(id){
  var m={ "OBJ-M3":"manifest","OBJ-M4":"manifest","OBJ-M5":"manifest","OBJ-M7":"manifest","OBJ-M8":"manifest","OBJ-M9":"svc","OBJ-M10":"svc","OBJ-M11":"reg","OBJ-M6":"fleet","OBJ-M1":"","OBJ-M2":"","OBJ-M12":"" };
  return m[id]||"manifest";
}
function renderLog(){
  var h="";
  var h1=S.ui.H1||{flags:{}};
  S.env.events.forEach(function(ev){
    var cls=ev.sev==="err"?"rl-err":ev.sev==="warn"?"rl-warn":ev.sev==="ok"?"rl-ok":"rl-info";
    var flagged=h1.flags&&h1.flags[ev.id];
    h+='<div class="rl-row '+(flagged?"crit":"")+'"><span class="rl-t">['+ev.t+"]</span> <span class=\""+cls+'">'+esc(ev.msg)+"</span>";
    if(S.mode==="hard"&&woState("OBJ-H1")&&!woState("OBJ-H1").done)
      h+='<button class="flagbtn '+(flagged?"on":"")+' flagb" data-act="flag" data-ev="'+ev.id+'" aria-pressed="'+(flagged?"true":"false")+'">'+(flagged?"⚑ FLAGGED":"⚑ FLAG")+"</button>";
    h+="</div>";
  });
  $("rlScroll").innerHTML=h;
}
function renderAll(){
  renderStatus(); renderPiers(); renderMeter(); renderManifest(); renderFleet(); renderSvc(); renderReg(); renderLex(); renderExam(); renderDebrief(); renderLedger(); renderLog();
}
function switchTab(name){
  var tabs=["manifest","fleet","svc","reg","lex","exam","debrief"];
  tabs.forEach(function(t){
    var b=$("tab-"+t), p=$("wb-"+t);
    if(!b||!p) return;
    var sel=t===name;
    b.setAttribute("aria-selected",sel?"true":"false");
    p.classList.toggle("hidden",!sel);
  });
  S.ui.tab=name; saveSoon();
}

/* ---------------- screens ---------------- */
function showScreen(){
  $("screen-mode").classList.toggle("hidden",S.screen!=="mode");
  $("screen-brief").classList.toggle("hidden",S.screen!=="brief");
  $("screen-lab").classList.toggle("hidden",S.screen!=="lab");
  if(S.screen==="brief"){
    $("btnEnterLab").textContent=S.mode==="hard"?"Enter the Control Room — Night Watch →":"Enter the Control Room — Day Watch →";
  }
}
