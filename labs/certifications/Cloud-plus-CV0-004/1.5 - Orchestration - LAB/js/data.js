"use strict";
/* =====================================================================
   CyberLab "Harbor Control" — js/data.js
   ALL LAB CONTENT — data only, no engine logic.
   Ported 1:1 from the audited single-file lab (v4, QA fixes included).
   ===================================================================== */

/* ---------------- glossary ---------------- */
var GLOSSARY=[
 ["Orchestration","Automating the deployment, scaling and operation of containers across environments."],
 ["Stand-alone container","A single container running independently — no coordination, no self-healing."],
 ["Cluster","Every machine (node) the orchestrator manages as one unit."],
 ["Node / Pier","One worker machine where containers actually run."],
 ["Control plane","The orchestrator's brain: API server, state store (etcd), scheduler, controller manager."],
 ["Desired state","What you declared you want; the orchestrator reconciles reality toward it."],
 ["Pod","The smallest deployable unit — one or more containers sharing network and storage."],
 ["Deployment","Declares how many replicas of which image should run; enables rolling updates."],
 ["Scheduling","Deciding which node each new pod lands on."],
 ["Self-healing","Automatic restart or rescheduling of failed or unresponsive containers."],
 ["Auto-scaling","Automatically adding or removing replicas as load changes."],
 ["Load balancing","Spreading traffic across replica instances."],
 ["Service discovery","A dynamic, auto-updating registry (Service DNS) so containers find each other without hardcoded IPs."],
 ["Rolling update","Staged image replacement with zero downtime; reversible."],
 ["PV / PVC","Persistent Volume and Persistent Volume Claim — storage decoupled from the container life-cycle."],
 ["Image registry","Image repository (Docker Hub, AWS ECR, Azure ACR, Google GCR) that orchestrators pull from."]
];

/* =====================================================================
   OBJECTIVES — Medium (12)
   Each: id, pillar, title, brief, look (where-to-look, medium only),
   ui(state)->html, check(state)->{pass,cls,msg}, hints[3]
   ===================================================================== */
var OBJ_MED=[
{id:"OBJ-M1",pillar:"P1",title:"Sort the watch list: orchestrator, human, or stand-alone?",
 brief:"Six tasks sit in the unsorted tray. Decide for each: is it the ORCHESTRATOR'S JOB (continuous, automatic), a ONE-OFF MANUAL TASK (a human, once), or a STAND-ALONE CONTAINER RISK (unmanaged, nobody watching)? Click a task, then click a bin.",
 look:"This card is the whole exercise — no tools needed.",
 hints:["Think: which tasks must happen CONTINUOUSLY and REACTIVELY (restart, scale, DNS)? Those are the orchestrator's.",
        "One-off chores that a person does once are manual. A container nobody supervises is a stand-alone risk — that is exactly what orchestration removes.",
        "Correct: orchestrator = restart carts, add replicas, stable DNS. Manual = laptop script, Monday file copies. Stand-alone risk = the dying side project."],
 ui:function(){ var st=S.ui.M1||(S.ui.M1={sel:null,place:{}});
  var items=[["t1","Restart the cart container that crashed at 03:00 — before anyone notices"],
   ["t2","Add 12 replicas the moment the flash sale opens"],
   ["t3","Give checkout a stable DNS name that survives rescheduling"],
   ["t4","Run a one-off data-fix script on a laptop for ten minutes"],
   ["t5","Copy log files between servers by hand every Monday"],
   ["t6","A side-project container that died overnight — nobody noticed until Monday"]];
  if(!st.order){ st.order=items.map(function(it){return it[0];});
    for(var sh=st.order.length-1;sh>0;sh--){ var sj=Math.floor(Math.random()*(sh+1)); var tmp=st.order[sh]; st.order[sh]=st.order[sj]; st.order[sj]=tmp; } }
  var bins=[["orch","Orchestrator's job"],["manual","One-off manual task"],["solo","Stand-alone container risk"]];
  var h='<div class="miniui"><div class="stencil" style="margin-bottom:6px">UNSORTED TRAY</div>';
  st.order.forEach(function(k){ var it=items.find(function(x){return x[0]===k;}); if(!it||st.place[k]) return;
    h+='<div class="sortitem"><button class="mchip '+(st.sel===k?"sel":"")+'" data-act="sort-pick" data-wo="OBJ-M1" data-key="'+k+'" style="flex:1">'+esc(it[1])+'</button></div>';
  });
  h+='<div class="bins">';
  bins.forEach(function(b){ h+='<div class="bin '+(st.sel?"hot":"")+'" data-act="sort-drop" data-wo="OBJ-M1" data-bin="'+b[0]+'" role="button" tabindex="0" aria-label="Drop the selected task into: '+esc(b[1])+'"><h5>'+b[1]+'</h5>';
    items.forEach(function(it){ if(st.place[it[0]]===b[0]) h+='<div class="in">'+esc(it[1])+'</div>'; });
    h+='</div>'; });
  h+='</div><div class="note" style="margin-top:8px">Click a task, then click its bin. '+(Object.keys(st.place).length)+'/6 placed.</div></div>';
  return h; },
 check:function(){ var st=S.ui.M1||{}; var place=st.place||{};
  var truth={t1:"orch",t2:"orch",t3:"orch",t4:"manual",t5:"manual",t6:"solo"};
  var keys=Object.keys(truth);
  for(var i=0;i<keys.length;i++){ if(!place[keys[i]]) return {pass:false,msg:"Place all six tasks first — "+(keys.length-Object.keys(place).length)+" left in the tray.",cls:"no"}; }
  for(var j=0;j<keys.length;j++){ if(place[keys[j]]!==truth[keys[j]])
    return {pass:false,msg:"Not yet — task "+keys[j].toUpperCase()+" is in the wrong bin. Re-read the bins: continuous & automatic = orchestrator; once, by a person = manual; unmanaged container = stand-alone risk.",cls:"no"}; }
  return {pass:true,cls:"ok",msg:"Correct. Orchestration is exactly this line: continuous, automatic management of container life-cycle (restarts, scaling, discovery) versus one-off human chores versus unmanaged stand-alone containers. On the exam, 'nobody restarts it at 03:00' is the stand-alone tell."}; }
},
{id:"OBJ-M2",pillar:"P1",title:"Name the four core orchestrator tasks",
 brief:"Four things the harbor master does for you, four scenarios. Match each scenario to the orchestrator task it demonstrates: Scheduling, Scaling, Load balancing, Self-healing.",
 look:"Work order card — pure analysis, no tools.",
 hints:["Placement of pods onto nodes = scheduling. Changing the NUMBER of replicas = scaling.",
        "Distributing customer requests across replicas = load balancing. Replacing something that died = self-healing.",
        "1→Scheduling, 2→Scaling, 3→Load balancing, 4→Self-healing."],
 ui:function(){ var st=S.ui.M2||(S.ui.M2={sel:null,map:{}});
  if(!st.tOrder) st.tOrder={};
  var sc=[["s1","Nine new pods appear; each is placed on the least-busy pier with room."],
   ["s2","Replica count goes 4 → 16 as the sale opens, then back to 6 overnight."],
   ["s3","Customers are spread evenly across 16 identical cart replicas."],
   ["s4","A crashed pod is replaced 8 seconds later — no human involved."]];
  var tasks=[["sch","Scheduling"],["scl","Scaling"],["lb","Load balancing"],["heal","Self-healing"]];
  var h='<div class="miniui">';
  sc.forEach(function(x){ if(st.map[x[0]]) return;
    var ord=st.tOrder[x[0]];
    if(!ord){ ord=tasks.map(function(t){return t[0];});
      for(var sh=ord.length-1;sh>0;sh--){ var sj=Math.floor(Math.random()*(sh+1)); var tmp=ord[sh]; ord[sh]=ord[sj]; ord[sj]=tmp; }
      st.tOrder[x[0]]=ord; }
    h+='<div style="margin:6px 0"><div class="note" style="margin:2px 0">'+esc(x[1])+'</div><div style="display:flex;gap:6px;flex-wrap:wrap">';
    ord.forEach(function(tk){ var t=tasks.find(function(tt){return tt[0]===tk;}); h+='<button class="mchip" data-act="match-pick" data-wo="OBJ-M2" data-key="'+x[0]+'" data-opt="'+t[0]+'" style="padding:7px 10px;font-size:12px">'+t[1]+'</button>'; });
    h+='</div></div>'; });
  var names={sch:"Scheduling",scl:"Scaling",lb:"Load balancing",heal:"Self-healing"};
  var placed=Object.keys(st.map).length;
  if(placed) { h+='<div class="note">Matched so far: '; Object.keys(st.map).forEach(function(k){ h+='<span class="tag">S'+k.slice(1)+' → '+names[st.map[k]]+'</span> '; }); h+='</div>'; }
  h+='</div>'; return h; },
 check:function(){ var st=S.ui.M2||{}; var m=st.map||{}; var truth={s1:"sch",s2:"scl",s3:"lb",s4:"heal"};
  var ks=Object.keys(truth); if(ks.some(function(k){return !m[k];})) return {pass:false,msg:"Match all four scenarios before checking.",cls:"no"};
  for(var i=0;i<ks.length;i++){ if(m[ks[i]]!==truth[ks[i]])
    return {pass:false,msg:"One or more are off. Ask: does the scenario move PODS TO NODES (scheduling), change the COUNT (scaling), SPLIT TRAFFIC (load balancing), or REPLACE THE DEAD (self-healing)?",cls:"no"}; }
  return {pass:true,cls:"ok",msg:"Correct — these are the four things an orchestrator does continuously: schedule containers across resources, scale counts with load, load-balance between replicas, and monitor with self-healing. Cloud+ loves this quartet."}; }
},
{id:"OBJ-M3",pillar:"P1",title:"Declare your first deployment (desired state)",
 brief:"Stop doing, start declaring. On the MANIFEST tab, assemble the cart-web deployment: app name cart-web, image meridian/cart-web tag 1.4.2, 4 replicas, container port 8443 — then press APPLY DECLARATION. This manifest IS desired state: you describe the end state, the orchestrator makes it real.",
 look:"MANIFEST tab → fill the form → APPLY DECLARATION → come back and CHECK.",
 hints:["App name and tag are typed exactly: cart-web and 1.4.2. Replicas and port are numbers: 4 and 8443.",
        "After applying, the radio log should show the scheduler placing pods on piers.",
        "Set: name cart-web · image meridian/cart-web:1.4.2 · replicas 4 · port 8443 → APPLY → CHECK here."],
 ui:function(){ var a=S.env.applied;
  return '<div class="miniui"><div class="note">Current declaration: <b>'+(a?esc(a.app+" · "+a.image+" · replicas "+a.replicas+" · port "+a.port):"nothing applied yet")+'</b></div>'
   +(S.env.deployedOnce?'<div class="note">Pods in harbor: '+webPods().length+'</div>':'')+'</div>'; },
 check:function(){ var a=S.env.applied;
  if(!a||a.app!=="cart-web") return {pass:false,msg:"No cart-web declaration applied yet. Open the MANIFEST tab, fill the form, press APPLY DECLARATION.",cls:"no"};
  if(tagOf(a.image)!=="1.4.2") return {pass:false,msg:"Wrong image tag — this exercise pins 1.4.2 (a known-good version). Pinning exact tags instead of 'latest' is itself a lesson.",cls:"no"};
  if(a.replicas!==4) return {pass:false,msg:"Replicas must be 4 — the sale-tested baseline for this fleet.",cls:"no"};
  if(a.port!==8443) return {pass:false,msg:"Container port must be 8443.",cls:"no"};
  S.flags.declared=true;
  return {pass:true,cls:"ok",msg:"Declared and applied. Notice what you did NOT do: you never started a container by hand. You declared desired state — name, image, count, port — and the harbor master made it so. That is orchestration."}; }
},
{id:"OBJ-M4",pillar:"P1",title:"Watch the harbor master schedule",
 brief:"Your 4 replicas are in the water. Look at the harbor map: which piers did the scheduler choose, and why? Answer the question below, and make sure at least three different piers hold a cart-web pod.",
 look:"HARBOR MAP (left) — then answer here.",
 hints:["Count pods per pier. The scheduler avoids overloading one pier when others have room.",
        "The scheduler places each pod on a suitable node with free capacity — spreading replicas for resilience.",
        "Pick: 'It spreads replicas across suitable piers, following the declared desired state', after pods run on 3+ piers."],
 ui:function(){ var st=S.ui.M4||(S.ui.M4={q:null});
  var opts=[["a","It spreads replicas across suitable piers, following the declared desired state"],
   ["b","The first pod picks a pier and the rest copy it"],
   ["c","Container images are pinned to specific piers at build time"],
   ["d","Placement is random and meaningless"]];
  var h='<div class="miniui">';
  opts.forEach(function(o){ h+='<label class="qopt"><input type="radio" name="m4q" data-act="radio" data-wo="OBJ-M4" data-key="q" data-val="'+o[0]+'" '+(st.q===o[0]?"checked":"")+'><span>'+esc(o[1])+'</span></label>'; });
  var nodes={}; webPods().forEach(function(p){ if(p.status!=="Terminating") nodes[p.node]=1; });
  h+='<div class="note">cart-web pods currently on: <b>'+(Object.keys(nodes).join(", ")||"—")+'</b></div></div>'; return h; },
 check:function(){ var st=S.ui.M4||{}; var nodes={}; webPods().forEach(function(p){ if(p.status!=="Terminating") nodes[p.node]=1; });
  if(Object.keys(nodes).length<3) return {pass:false,msg:"Not enough evidence yet — apply the manifest (OBJ-M3) and let the pods run on at least three piers first.",cls:"no"};
  if(st.q!=="a") return {pass:false,msg:"Not quite. The scheduler is not random and images are not node-pinned: it places each replica on a suitable node with capacity, spreading load.",cls:"no"};
  return {pass:true,cls:"ok",msg:"Correct. Scheduling = placing containers across available resources. Spread placement is deliberate: if one pier floods, the other piers still serve. On the exam: 'scheduler + desired state' is always the answer shape."}; }
},
{id:"OBJ-M5",pillar:"P2",title:"Ride the sale: scale up, then down",
 brief:"Press 🌊 SIMULATE FLASH SALE (harbor map) — traffic jumps to ~900 rps. Scale cart-web up to at least 10 replicas while the sale runs, then end the sale and scale back to 6 or fewer. Scaling up AND down is the point: idle replicas cost money.",
 look:"🌊 button on the harbor map → MANIFEST tab (replicas) → APPLY → repeat after the sale ends.",
 hints:["The replicas field lives in the manifest; changing it + APPLY re-declares desired state. Do the scale-UP while the sale is running.",
        "Peak replicas while sale active must be ≥ 10; after pressing End sale, bring replicas to ≤ 6.",
        "Sequence: Sale → replicas 10–16 + APPLY → End sale → replicas 6 + APPLY."],
 ui:function(){ var e=S.env;
  return '<div class="miniui"><div class="note">Sale running: <b>'+(e.sale?"YES":"no")+'</b> · traffic <b>'+e.traffic+' rps</b> · declared replicas <b>'+(e.applied?e.applied.replicas:"—")+'</b> · peak during sale <b>'+e.salePeak+'</b></div></div>'; },
 check:function(){ var e=S.env;
  if(!S.flags.declared) return {pass:false,msg:"Declare cart-web first (OBJ-M3).",cls:"no"};
  if(e.salePeak<10) return {pass:false,msg:"Scale UP first: start the sale, set replicas to 10+ and APPLY while the sale is running. Peak so far: "+e.salePeak+".",cls:"no"};
  if(e.sale) return {pass:false,msg:"Good peak ("+e.salePeak+"). Now press END SALE and scale back down to 6 or fewer — replicas cost money when idle.",cls:"no"};
  if(!e.applied||e.applied.replicas>6) return {pass:false,msg:"Sale is over but the fleet is still bloated. Declare "+e.applied.replicas+" → 6 and APPLY.",cls:"no"};
  return {pass:true,cls:"ok",msg:"Scaled up under load, scaled down after. That two-way adjustment — automatically driven by demand in production (auto-scaling) — is a headline orchestration benefit: right-size for the spike, don't pay for idle capacity at 03:00."}; }
},
{id:"OBJ-M6",pillar:"P2",title:"Storm drill: kill a pod, drain a pier",
 brief:"Break things on purpose: press ☠ KILL A RUNNING POD and/or a pier's DRAIN button. Watch the harbor map and radio log, then tick EVERY statement below that describes what the orchestrator did (not what a human would have done).",
 look:"☠ button + pier DRAIN buttons on the harbor map; watch the RADIO LOG.",
 hints:["The radio log shows a Terminating event, then a new pod being placed — count how many times the fleet healed itself.",
        "A drained pier evicts its pods; they are re-scheduled onto healthy piers automatically.",
        "Correct statements: desired count restores the fleet · traffic kept flowing via the Service · replacement was rescheduled on a healthy pier. NOT: a human was paged."],
 ui:function(){ var st=S.ui.M6||(S.ui.M6={c:{}});
  var opts=[["c1","The declared replica count pulled the fleet back to full strength"],
   ["c2","A human was paged and restarted the container by hand"],
   ["c3","Traffic kept flowing through the Service while the pod was replaced"],
   ["c4","The replacement was rescheduled onto a healthy pier automatically"]];
  var h='<div class="miniui"><div class="note">Self-healing events so far: <b>'+S.env.healCount+'</b></div>';
  opts.forEach(function(o){ h+='<label class="qopt"><input type="checkbox" data-act="checkb" data-wo="OBJ-M6" data-key="'+o[0]+'" '+(st.c[o[0]]?"checked":"")+'><span>'+esc(o[1])+'</span></label>'; });
  h+='</div>'; return h; },
 check:function(){ var st=S.ui.M6||{}; var c=st.c||{};
  if(S.env.healCount<1) return {pass:false,msg:"No healing observed yet — kill a pod or drain a pier, then give the harbor a moment to replace it.",cls:"no"};
  if(!c.c1||c.c2||!c.c3||!c.c4) return {pass:false,msg:"Re-check the statements. What you SAW: the declared count triggered a replacement, traffic flowed via the Service, and the new pod landed on a healthy pier. Nobody paged a human — that's the difference orchestration makes.",cls:"no"};
  return {pass:true,cls:"ok",msg:"Exactly: monitoring + self-healing. The orchestrator notices the failed container and reconciles actual state (pod gone) toward desired state (4 replicas) — fault tolerance without the 03:00 pager. Draining a pier is how you patch nodes with zero downtime."}; }
},
{id:"OBJ-M7",pillar:"P2",title:"Rolling update: 1.4.2 → 1.5.0, zero downtime",
 brief:"Ship the new version: on the MANIFEST tab set the image tag to 1.5.0, turn READINESS PROBES ON, and APPLY. Watch the radio log: new pods must pass probes and take traffic BEFORE the old ones retire. The store must never drop to zero running web pods.",
 look:"MANIFEST tab → tag 1.5.0 + probes ON → APPLY. Watch RADIO LOG, then CHECK.",
 hints:["Readiness probes = a gate: no traffic reaches a pod until it reports ready. Turn them on BEFORE applying the new tag.",
        "If downtime is not 0, you applied the update without probes — roll back, enable probes, try again.",
        "Tag 1.5.0 + probes ON + APPLY → radio log shows new pods Running before old pods terminate."],
 ui:function(){ var e=S.env;
  return '<div class="miniui"><div class="note">Applied image: <b>'+(e.applied?esc(e.applied.image):"—")+'</b> · probes <b>'+(e.applied&&e.applied.probes?"ON":"OFF")+'</b> · downtime events <b>'+e.downtime+'</b></div></div>'; },
 check:function(){ var e=S.env; var a=e.applied;
  if(!a) return {pass:false,msg:"Nothing applied yet.",cls:"no"};
  if(tagOf(a.image)==="2.0.0-hotfix") return {pass:false,msg:"That is the broken vendor tag — do not ship it here. Use 1.5.0.",cls:"no"};
  if(tagOf(a.image)!=="1.5.0") return {pass:false,msg:"Set the image tag to 1.5.0 on the MANIFEST tab and APPLY.",cls:"no"};
  if(!a.probes) return {pass:false,msg:"Probes are OFF — without readiness probes, traffic can hit pods that are not ready (that is how downtime happens). Enable probes and re-apply.",cls:"no"};
  if(e.downtime>(e.dtMark||0)) return {pass:false,msg:"THIS update dropped the store to zero running pods (downtime since your last APPLY). Enable probes, APPLY again — staged replacement needs the probe gate.",cls:"no"};
  S.flags.rollingDone=true;
  return {pass:true,cls:"ok",msg:"Zero-downtime rolling update, achieved. With readiness probes ON, the orchestrator starts new pods, waits for them to pass probes, shifts traffic, then retires old pods — and a revision rollback is one command away if 1.5.0 misbehaves."}; }
},
{id:"OBJ-M8",pillar:"P3",title:"Mayday: diagnose the CrashLoop",
 brief:"Someone shipped the vendor's '2.0.0-hotfix' (MANIFEST tab → red button). The fleet is looping. Read the radio log, pick the ROOT CAUSE below, then fix the fleet (restore image 1.5.0 — the Rollback button or the manifest both work) and let it reach Running.",
 look:"MANIFEST tab → 🚨 vendor hotfix button. RADIO LOG for the error lines.",
 hints:["Read the log lines around the CrashLoopBackOff — what does the cluster say it is pulling and failing on?",
        "The failing image tag does not exist in the registry — a bad tag causes exactly this loop. Memory, network and probes are red herrings here.",
        "Answer: wrong image tag. Fix: image back to meridian/cart-web:1.5.0 + APPLY (or Rollback), wait for Running."],
 ui:function(){ var st=S.ui.M8||(S.ui.M8={q:null});
  var opts=[["a","Wrong image tag — 2.0.0-hotfix is not a real, working image, so containers crash and restart forever"],
   ["b","A pier ran out of memory"],
   ["c","A network policy blocked the pods"],
   ["d","The readiness probe was misconfigured"]];
  var loop=webPods().filter(function(p){return p.status==="CrashLoopBackOff";}).length;
  var h='<div class="miniui"><div class="note">Pods in CrashLoopBackOff right now: <b>'+loop+'</b></div>';
  opts.forEach(function(o){ h+='<label class="qopt"><input type="radio" name="m8q" data-act="radio" data-wo="OBJ-M8" data-key="q" data-val="'+o[0]+'" '+(st.q===o[0]?"checked":"")+'><span>'+esc(o[1])+'</span></label>'; });
  h+='</div>'; return h; },
 check:function(){ var st=S.ui.M8||{}; var a=S.env.applied;
  var loop=webPods().filter(function(p){return p.status==="CrashLoopBackOff";}).length;
  if(st.q!=="a") return {pass:false,msg:"Re-read the radio log: the failing pulls all mention the hotfix tag. The loop is caused by a broken/nonexistent image tag — not memory, network or probes.",cls:"no"};
  if(loop>0||!a||tagOf(a.image)!=="1.5.0") return {pass:false,msg:"Diagnosis noted — now FIX it: set the image back to meridian/cart-web:1.5.0 (Rollback button on MANIFEST works too), APPLY, and wait for Running.",cls:"no"};
  return {pass:true,cls:"ok",msg:"Fixed. CrashLoopBackOff = the kubelet restarts a container that keeps dying, with exponential backoff. Your first reflex (read events, suspect the newest change, roll back) is the real-world playbook: last-known-good image is one rollback away because the orchestrator keeps revisions."}; }
},
{id:"OBJ-M9",pillar:"P1",title:"Service discovery: stop hardcoding IPs",
 brief:"cart-api pods get rescheduled and their pod IPs change — hardcoded addresses rot. On the SERVICES & STORE tab: press RESCHEDULE CART-API once (watch the IP churn), then point the storefront's API endpoint at the stable Service DNS name instead of the IP.",
 look:"SERVICES & STORE tab → Reschedule button → endpoint selector.",
 hints:["The Service gives the fleet a DNS name that survives rescheduling: cart-api.store.meridian.example.",
        "First press Reschedule cart-api so you SEE the IP change; then choose the DNS name in the endpoint selector.",
        "Reschedule once + endpoint = cart-api.store.meridian.example."],
 ui:function(){ var e=S.env;
  return '<div class="miniui"><div class="note">cart-api rescheduled for you: <b>'+(e.apiRescheduled?"yes":"not yet")+'</b> · storefront endpoint: <b>'+esc(e.endpointCfg)+'</b></div></div>'; },
 check:function(){ var e=S.env;
  if(!e.apiRescheduled) return {pass:false,msg:"Press RESCHEDULE CART-API on the Services & Store tab first — watch what happens to the pod IP in the radio log.",cls:"no"};
  if(e.endpointCfg!=="cart-api.store.meridian.example") return {pass:false,msg:"The endpoint still points at a pod IP — that dies on the next reschedule. Choose the Service DNS name: cart-api.store.meridian.example.",cls:"no"};
  return {pass:true,cls:"ok",msg:"That is service discovery. The Service keeps a dynamic, auto-updating registry (DNS) for the replicas; callers use the name, never the IP. Client-side vs server-side discovery differs in WHO looks up the registry — Cloud+ mainly wants the concept: no hardcoded addresses in a dynamic fleet."}; }
},
{id:"OBJ-M10",pillar:"P4",title:"Anchors: make cart sessions survive restarts",
 brief:"cart-sessions currently uses EPHEMERAL storage — every restart wipes shopping carts. On the SERVICES & STORE tab, claim a Persistent Volume (PVC) for it, then answer: which storage survives a pod restart?",
 look:"SERVICES & STORE tab → Storage section → claim the PVC.",
 hints:["Claim a PVC (any name, any size) and switch cart-sessions to it.",
        "Ephemeral storage dies with the pod; PV-backed storage is decoupled from the pod life-cycle.",
        "Claim the PVC, then answer 'Only PVC-backed storage survives a pod restart'."],
 ui:function(){ var e=S.env;
  return '<div class="miniui"><div class="note">cart-sessions storage: <b>'+(e.pvc?("PVC "+esc(e.pvc.name)+" ("+esc(e.pvc.size)+")"):"ephemeral")+'</b></div>'
   +'<label class="qopt"><input type="radio" name="m10q" data-act="radio" data-wo="OBJ-M10" data-key="q" data-val="a"><span>Both survive a restart</span></label>'
   +'<label class="qopt"><input type="radio" name="m10q" data-act="radio" data-wo="OBJ-M10" data-key="q" data-val="b"><span>Only PVC-backed storage survives a pod restart</span></label>'
   +'<label class="qopt"><input type="radio" name="m10q" data-act="radio" data-wo="OBJ-M10" data-key="q" data-val="c"><span>Only ephemeral storage survives</span></label>'
   +'<label class="qopt"><input type="radio" name="m10q" data-act="radio" data-wo="OBJ-M10" data-key="q" data-val="d"><span>Neither — all cart data is always lost</span></label></div>'; },
 check:function(){ var e=S.env; var st=S.ui.M10||{};
  if(!e.pvc) return {pass:false,msg:"No PVC claimed yet — Storage section on the Services & Store tab: name it and press CLAIM PVC.",cls:"no"};
  if(st.q!=="b") return {pass:false,msg:"Think it through: ephemeral storage lives and dies with the container. A Persistent Volume is claimed by the pod but NOT destroyed when the pod stops — that is the whole point of PV/PVC.",cls:"no"};
  return {pass:true,cls:"ok",msg:"Anchored. Kubernetes decouples storage from containers with Persistent Volumes; pods request them with Persistent Volume Claims. Restart, reschedule, crash — the claim re-attaches. Exam phrase: 'PV decouples storage from the container life-cycle; PVC = the pod's claim on it'."}; }
},
{id:"OBJ-M11",pillar:"P3",title:"Audit the vendor manifest before it ships",
 brief:"A vendor sent a manifest for legacy-importer (REGISTRY & AUDIT tab, red panel). Tick EVERY finding below that is a genuine security problem — and only those. Clean findings should NOT be ticked.",
 look:"REGISTRY & AUDIT tab → vendor manifest panel → tick findings here.",
 hints:["Compare the vendor manifest to the hardening rules: least privilege, secrets in Secret objects, pinned image tags.",
        "privileged: true, a plaintext DB password in env, and the 'latest' tag are the three problems. Non-root user, fixed port and a readiness probe are GOOD things.",
        "Tick exactly: privileged container · plaintext secret · unpinned 'latest' tag."],
 ui:function(){ var st=S.ui.M11||(S.ui.M11={c:{}});
  var opts=[["f1","Container runs with privileged: true (host-level access)"],
   ["f2","DB_PASSWORD is hardcoded in plaintext in the manifest env"],
   ["f3","Image tag is 'latest' — builds are not reproducible or scannable"],
   ["f4","Container runs as a non-root user"],
   ["f5","A readiness probe is defined"],
   ["f6","The manifest declares container port 8443"]];
  var h='<div class="miniui">';
  opts.forEach(function(o){ h+='<label class="auditopt"><input type="checkbox" data-act="checkb" data-wo="OBJ-M11" data-key="'+o[0]+'" '+(st.c[o[0]]?"checked":"")+'><span>'+esc(o[1])+'</span></label>'; });
  h+='</div>'; return h; },
 check:function(){ var st=S.ui.M11||{}; var c=st.c||{}; var truth={f1:true,f2:true,f3:true};
  var ks=Object.keys(truth);
  for(var i=0;i<ks.length;i++){ if(!c[ks[i]]) return {pass:false,msg:"Missed a real risk. Hardening rules: no privileged containers (escape risk), no plaintext secrets in manifests, no 'latest' tags (unscannable, unreproducible).",cls:"no"}; }
  if(c.f4||c.f5||c.f6) return {pass:false,msg:"Non-root user, a readiness probe and a declared port are GOOD hygiene, not findings — flagging clean things trains the wrong reflex.",cls:"no"};
  return {pass:true,cls:"ok",msg:"Clean audit. Privileged containers are a stepping stone to container escape; plaintext secrets leak into images and logs; 'latest' makes builds unreproducible and hides what you actually run. These three map straight onto the exam's container-security bullets."}; }
},
{id:"OBJ-M12",pillar:"P4",title:"Choose the fleet: matching tool to scenario",
 brief:"Three situations, one choice each. Remember the field: Kubernetes (industry standard; managed services EKS/GKE/AKS), Docker Swarm (simple, ships with Docker), Apache Mesos (legacy, retired 2025) — and the honest fourth option: no orchestrator at all.",
 look:"This card — three dropdowns.",
 hints:["'Industry standard, managed control planes' = Kubernetes. 'Simplest, ships with Docker, small estate' = Swarm.",
        "'One container, one laptop, no HA needs' does not need an orchestrator — stand-alone is honest.",
        "a→Kubernetes, b→Docker Swarm, c→Stand-alone container."],
 ui:function(){ var st=S.ui.M12||(S.ui.M12={a:"",b:"",c:""});
  var opts='<option value="">— choose —</option><option value="k8s">Kubernetes (or managed EKS/GKE/AKS)</option><option value="swarm">Docker Swarm</option><option value="mesos">Apache Mesos</option><option value="solo">Stand-alone container (none)</option>';
  function sel(k){ var v=st[k]||""; var o='<option value="">— choose —</option><option value="k8s"'+(v==="k8s"?" selected":"")+'>Kubernetes (or managed EKS/GKE/AKS)</option><option value="swarm"'+(v==="swarm"?" selected":"")+'>Docker Swarm</option><option value="mesos"'+(v==="mesos"?" selected":"")+'>Apache Mesos</option><option value="solo"'+(v==="solo"?" selected":"")+'>Stand-alone container (none)</option>';
   return '<select data-act="select" data-wo="OBJ-M12" data-key="'+k+'" style="width:100%">'+o+'</select>'; }
  var h='<div class="miniui">'
   +'<div class="formrow"><label>a · 12-node multinational fleet; wants the industry standard with managed control planes (AWS/Azure/Google)</label>'+sel("a")+'</div>'
   +'<div class="formrow"><label>b · 5-node on-prem Docker estate; wants the simplest orchestrator that ships with Docker</label>'+sel("b")+'</div>'
   +'<div class="formrow"><label>c · A one-container weekend project on a single laptop; no availability requirements</label>'+sel("c")+'</div></div>'; return h; },
 check:function(){ var st=S.ui.M12||{}; var t={a:"k8s",b:"swarm",c:"solo"};
  var ks=Object.keys(t); for(var i=0;i<ks.length;i++){ if(!st[ks[i]]) return {pass:false,msg:"Answer all three scenarios first.",cls:"no"}; }
  for(var j=0;j<ks.length;j++){ if(st[ks[j]]!==t[ks[j]])
    return {pass:false,msg:"Rebalance: biggest ecosystem + managed control planes = Kubernetes; simplest, Docker-native = Swarm; Mesos is retired (Apache Attic, 2025) — a legacy distractor; a single laptop container needs no orchestrator at all.",cls:"no"}; }
  return {pass:true,cls:"ok",msg:"Right calls. Kubernetes is the default production answer (managed EKS/GKE/AKS remove control-plane burden); Swarm fits small Docker-native estates; Mesos is history; and 'no orchestrator' is sometimes the correct, simplest answer. Expect Cloud+ to test exactly these distinctions."}; }
}
];
/* =====================================================================
   OBJECTIVES — Hard (9): broad, multi-step, strict validation
   ===================================================================== */
var OBJ_HARD=[
{id:"OBJ-H1",pillar:"P3",title:"Cut through the noise: flag the three CRITICAL events",
 brief:"Midnight. Flash sale live, store down. The radio log is noisy — marketing's load test, canary pulls, tide chatter. Flag EXACTLY the three events that represent real, actionable faults. Wrong flags cost you: this is triage.",
 look:"RADIO LOG — every row has a FLAG button. Flag 3, then CHECK.",
 hints:["Ask of each event: does it describe BROKEN FUNCTIONALITY or EXPOSED SECRETS — or is it routine traffic?",
        "A looping image tag, a privileged pod alert and a plaintext database password are faults. A load-test pod, a canary pull and NTP drift are noise.",
        "Flag: CrashLoopBackOff ×5 on cart-web:2.0.0-hotfix · SECURITY privileged pod detected · SECURITY DB_PASSWORD in manifest env."],
 ui:function(){ var st=S.ui.H1||(S.ui.H1={flags:{}});
  var n=Object.keys(st.flags).filter(function(k){return st.flags[k];}).length;
  return '<div class="miniui"><div class="note">Flagged so far: <b>'+n+'</b> (target: exactly 3). Rows flagged in the log appear in the CHECK.</div></div>'; },
 check:function(){ var st=S.ui.H1||{}; var f=st.flags||{};
  var truth={}; [S.env.evIds.crash,S.env.evIds.priv,S.env.evIds.secret].forEach(function(id){ truth[id]=true; });
  var flagged=Object.keys(f).filter(function(k){return f[k];});
  if(flagged.length!==3) return {pass:false,msg:"You flagged "+flagged.length+" — triage discipline means EXACTLY the real faults. Unflag or flag until you have exactly 3.",cls:"no"};
  for(var i=0;i<flagged.length;i++){ if(!truth[flagged[i]]){
    return {pass:false,msg:"Near miss — rejected. '"+(function(){var e=S.env.events.find(function(x){return x.id===flagged[i]});return e?e.msg.split("—")[0].trim():"event";})()+"' is noise, not a fault. Routine load tests and canary pulls look dramatic but change nothing for users.",cls:"near"}; } }
  var missed=Object.keys(truth).filter(function(k){return !f[k];});
  if(missed.length) return {pass:false,msg:"You missed a real fault: a looping deployment, a privileged pod and a plaintext password are the three signals that need action tonight.",cls:"no"};
  return {pass:true,cls:"ok",msg:"Sharp triage. In a noisy cluster the skill is separating CHANGE-driven faults (bad image, config drift), SECURITY signals (privileged pod, exposed secret) from ROUTINE churn (load tests, canaries, cron). Those three flags define tonight's whole response."}; }
},
{id:"OBJ-H2",pillar:"P2",title:"Root cause the outage — exact values",
 brief:"Answer with precision: (1) the PRIMARY cause of the store outage, (2) the misconfiguration that let broken pods take traffic, (3) the replica count required to carry 900 rps under the runbook (pod budget 60 rps each, N+1 headroom).",
 look:"RADIO LOG + this card. The numbers must be exact.",
 hints:["Primary cause: the fleet is looping on a tag that does not work. Traffic-on-dead-pods is a different failure: which gate was off?",
        "900 ÷ 60 = base fleet. The runbook demands N+1 — one more than the base.",
        "Primary = wrong image tag (2.0.0-hotfix) · gate = readiness probes disabled · replicas = 16."],
 ui:function(){ var st=S.ui.H2||(S.ui.H2={c1:"",c2:"",c3:""});
  function sel(k,opts){ var v=st[k]||""; var o='<option value="">— choose —</option>'+opts.map(function(x){return '<option value="'+x[0]+'"'+(v===x[0]?" selected":"")+'>'+esc(x[1])+'</option>';}).join(""); return '<select data-act="select" data-wo="OBJ-H2" data-key="'+k+'" style="width:100%">'+o+'</select>'; }
  return '<div class="miniui">'
   +'<div class="formrow"><label>1 · Primary cause of the outage</label>'+sel("c1",[["img","Wrong image tag: 2.0.0-hotfix loops and never runs"],["oom","Pier ran out of memory"],["node","A pier failed"],["net","A network policy blocked traffic"]])+'</div>'
   +'<div class="formrow"><label>2 · Why broken pods still received traffic</label>'+sel("c2",[["probe","Readiness probes were disabled"],["hpa","No auto-scaler"],["pvc","No persistent volume"],["rbac","RBAC misconfigured"]])+'</div>'
   +'<div class="formrow"><label>3 · Required replicas (60 rps/pod, N+1)</label><input type="number" min="1" max="64" data-act="number" data-wo="OBJ-H2" data-key="c3" value="'+esc(st.c3||"")+'" style="width:110px"></div>'
   +'</div>'; },
 check:function(){ var st=S.ui.H2||{};
  if(!st.c1||!st.c2||!st.c3) return {pass:false,msg:"Answer all three parts.",cls:"no"};
  if(st.c1!=="img") return {pass:false,msg:"Primary cause rejected. Memory, piers and policy are stable tonight — the fleet loops on meridian/cart-web:2.0.0-hotfix. The newest change is the prime suspect.",cls:"no"};
  if(st.c2!=="probe") return {pass:false,msg:"Rejected: without readiness probes the orchestrator cannot tell a ready pod from a dead one, so traffic hit the looping pods. HPA, PVC and RBAC are unrelated to THIS outage.",cls:"no"};
  if(String(st.c3)!=="16"){ if(String(st.c3)==="15") return {pass:false,msg:"Near miss — rejected. 15 covers 900 ÷ 60 exactly, but the runbook demands N+1 headroom: one replica must absorb failure during the sale.",cls:"near"};
    return {pass:false,msg:"Wrong count. Compute: 900 rps ÷ 60 rps per pod = 15, plus N+1 headroom.",cls:"no"}; }
  return {pass:true,cls:"ok",msg:"Precise. Outage chain: bad tag → CrashLoopBackOff; probes off → broken pods kept taking traffic; N+1 sizing (16) keeps the store up even while one replica fails. Name all three links in the debrief."}; }
},
{id:"OBJ-H3",pillar:"P2",title:"Fix under pressure: 1.5.0 · 16 replicas · probes ON",
 brief:"Execute the fix: image meridian/cart-web:1.5.0, replicas 16, readiness probes ON, APPLY — then let the fleet reach all-Running before checking. No near-misses: the wrong tag or the wrong count fails the watch.",
 look:"MANIFEST tab → set all three fields → APPLY → watch RADIO LOG until green.",
 hints:["All three fields, one APPLY: tag 1.5.0, replicas 16, probes ON.",
        "1.4.2 is the old version — rolling back to it would also undo tonight's feature. The runbook says fix FORWARD to 1.5.0.",
        "Applied must read meridian/cart-web:1.5.0 · replicas 16 · probes ON, with every cart-web pod Running."],
 ui:function(){ var a=S.env.applied; var run=runningOf("cart-web"); var loop=webPods().filter(function(p){return p.status==="CrashLoopBackOff";}).length;
  return '<div class="miniui"><div class="note">Applied: <b>'+(a?esc(a.image+" · replicas "+a.replicas+" · probes "+(a.probes?"ON":"OFF")):"—")+'</b> · web pods Running <b>'+run+'</b> · looping <b>'+loop+'</b></div></div>'; },
 check:function(){ var a=S.env.applied;
  if(!a) return {pass:false,msg:"Nothing applied.",cls:"no"};
  if(tagOf(a.image)==="2.0.0-hotfix") return {pass:false,msg:"That is the broken tag — the whole outage. Ship 1.5.0.",cls:"no"};
  if(tagOf(a.image)==="1.4.2") return {pass:false,msg:"Near miss — rejected. 1.4.2 restores service but un-ships the release the sale depends on; the runbook says fix forward to 1.5.0.",cls:"near"};
  if(tagOf(a.image)!=="1.5.0") return {pass:false,msg:"Unexpected tag "+tagOf(a.image)+". The runbook fix is meridian/cart-web:1.5.0.",cls:"no"};
  if(a.replicas!==16){ if(a.replicas===15) return {pass:false,msg:"Near miss — rejected. 15 carries the load with zero headroom; N+1 says 16.",cls:"near"};
    return {pass:false,msg:"Replicas must be exactly 16 (900 ÷ 60 = 15, +1 headroom).",cls:"no"}; }
  if(!a.probes) return {pass:false,msg:"Probes OFF is what let broken pods take traffic. ON, or the same outage repeats.",cls:"no"};
  if(runningOf("cart-web")<a.replicas) return {pass:false,msg:"Applied correctly, but the fleet is not there yet — wait until all web pods report Running (watch the harbor map).",cls:"no"};
  return {pass:true,cls:"ok",msg:"Store restored: 16 probed replicas on 1.5.0. Notice the sequence you just performed — declare desired state once, and reconciliation does the staging: new pods pass probes before old ones retire."}; }
},
{id:"OBJ-H4",pillar:"P3",title:"Show the capacity math the debrief will demand",
 brief:"Prove the numbers behind 16: input (1) the base replica count for 900 rps at 60 rps per pod, and (2) the runbook total with N+1 headroom. Both exact.",
 look:"This card — two number fields.",
 hints:["Base = traffic ÷ per-pod budget.",
        "Headroom adds exactly one replica to absorb a single failure during the sale.",
        "Base = 15 · with N+1 = 16."],
 ui:function(){ var st=S.ui.H4||(S.ui.H4={b:"",h:""});
  return '<div class="miniui"><div class="formrow"><label>Base replicas (900 rps ÷ 60 rps/pod)</label><input type="number" min="1" max="64" data-act="number" data-wo="OBJ-H4" data-key="b" value="'+esc(st.b||"")+'" style="width:110px"></div>'
   +'<div class="formrow"><label>Runbook total with N+1 headroom</label><input type="number" min="1" max="64" data-act="number" data-wo="OBJ-H4" data-key="h" value="'+esc(st.h||"")+'" style="width:110px"></div></div>'; },
 check:function(){ var st=S.ui.H4||{};
  if(!st.b||!st.h) return {pass:false,msg:"Fill both fields.",cls:"no"};
  if(String(st.b)!=="15") return {pass:false,msg:"Base rejected: 900 ÷ 60 = 15 pods to carry the sale at budget.",cls:"no"};
  if(String(st.h)!=="16"){ if(String(st.h)==="30") return {pass:false,msg:"Near miss — rejected: doubling (2N) is a different policy; Meridian's runbook specifies N+1.",cls:"near"};
    return {pass:false,msg:"With N+1: one more than base = 16.",cls:"no"}; }
  return {pass:true,cls:"ok",msg:"Math holds. Capacity math for orchestrators: per-pod budget × base count covers load; +1 absorbs a single replica failure. Auto-scalers automate this from live metrics — but the runbook numbers are still YOUR accountability."}; }
},
{id:"OBJ-H5",pillar:"P4",title:"Sequence the response — incident order matters",
 brief:"Six response actions, wrong order below. Put them in the order a disciplined platform engineer executes them (first action on top). Use the ↑/↓ arrows.",
 look:"This card — reorder the six actions.",
 hints:["Evidence before action, restore service before cleanup, paperwork last.",
        "Confirm from the log → restore last-known-good → restore capacity/health → contain the secret exposure → verify hygiene → debrief.",
        "1 Flag & confirm from events · 2 Roll back bad image · 3 Restore 16 replicas + probes · 4 Rotate the exposed password into a Secret · 5 Re-scan registry & re-audit manifests · 6 Write the debrief."],
 ui:function(){ var st=S.ui.H5||(S.ui.H5={order:["a5","a2","a6","a1","a3","a4"]});
  var acts={a1:"Roll the bad image back to last-known-good",a2:"Restore capacity: 16 replicas with probes ON",a3:"Rotate the exposed DB password into a Secret",a4:"Write the debrief and hand over the watch",a5:"Flag & confirm the fault from the event log",a6:"Re-scan the registry and re-audit all manifests"};
  var h='<div class="miniui">';
  st.order.forEach(function(id,i){ h+='<div class="seqrow"><span class="num">'+(i+1)+'</span><span class="txt">'+esc(acts[id])+'</span><span class="mv">'
   +'<button data-act="seq-up" data-wo="OBJ-H5" data-idx="'+i+'" aria-label="Move up">↑</button><button data-act="seq-down" data-wo="OBJ-H5" data-idx="'+i+'" aria-label="Move down">↓</button></span></div>'; });
  h+='</div>'; return h; },
 check:function(){ var st=S.ui.H5||{}; var truth=["a5","a1","a2","a3","a6","a4"];
  for(var i=0;i<truth.length;i++){ if(st.order[i]!==truth[i]) return {pass:false,msg:"Sequence rejected at position "+(i+1)+". Logic: confirm before you act (events), restore service before cleanup (rollback, capacity), contain secrets before paperwork, and the debrief is always last.",cls:"no"}; }
  return {pass:true,cls:"ok",msg:"Correct order. Incident response in an orchestrated world: evidence → restore service → restore capacity → contain (rotate the secret; it was exposed, so rotating matters more than deleting) → verify hygiene → debrief. Same skeleton as any IR plan, just faster because reconciliation does the heavy lifting."}; }
},
{id:"OBJ-H6",pillar:"P4",title:"Harden the vendor importer before dawn",
 brief:"The legacy-importer manifest is on the REGISTRY & AUDIT tab (red panel). Fix ALL four findings in place: privileged OFF, DB password moved to a vault reference, image pinned to 3.0.1, readiness probes ON. The panel shows live state.",
 look:"REGISTRY & AUDIT tab → vendor panel → four toggles → CHECK here.",
 hints:["Four findings from your own audit: privileged, plaintext secret, 'latest' tag, missing probes.",
        "Least privilege, Secret reference (then rotate the value), exact tag 3.0.1, probes ON.",
        "All four toggles flipped in the vendor panel."],
 ui:function(){ var v=S.env.vendor;
  return '<div class="miniui"><div class="note">Vendor manifest state — privileged <b>'+(v.privileged?"STILL ON":"off")+'</b> · secret <b>'+esc(v.secret)+'</b> · tag <b>'+esc(v.tag)+'</b> · probes <b>'+(v.probes?"ON":"off")+'</b></div></div>'; },
 check:function(){ var v=S.env.vendor;
  if(v.privileged) return {pass:false,msg:"privileged: true still grants host-level access — the classic stepping stone to container escape. Turn it OFF in the vendor panel.",cls:"no"};
  if(v.secret!=="vault-ref") return {pass:false,msg:"The password is still plaintext in the manifest. Move it to a vault/Secret reference (and rotate the value — it has been exposed).",cls:"no"};
  if(v.tag!=="3.0.1") return {pass:false,msg:"'latest' is unpinned: unreproducible and unscannable. Pin 3.0.1.",cls:"no"};
  if(!v.probes) return {pass:false,msg:"No readiness probes — the orchestrator cannot tell ready from broken, which is exactly how tonight's outage spread. Enable them.",cls:"no"};
  return {pass:true,cls:"ok",msg:"Hardened. Four controls, four exam bullets: least privilege (no host-level containers), secrets management (Secret objects/vault + rotation), image pinning (reproducible, scannable), health probes (the orchestrator can only heal what it can measure). Residual risk remains: control-plane and supply-chain compromise — hence RBAC, quotas and registry scanning."}; }
},
{id:"OBJ-H7",pillar:"P4",title:"Fleet decision: platform, reasons, honest limitation",
 brief:"Post-incident, Meridian migrates to a managed platform. Choose (1) the platform, (2) BOTH valid justifications, (3) the one limitation that still remains YOUR team's responsibility. Exact set — distractors are deliberate.",
 look:"This card — one dropdown + four checkboxes + one dropdown.",
 hints:["Managed control planes: who operates the API server, etcd, upgrades? Not you. Ecosystem matters for hiring and tooling.",
        "Two justifications are true of managed Kubernetes; two are classic misconceptions (Mesos age, Swarm ecosystem).",
        "Platform: Managed Kubernetes (EKS/GKE/AKS). Reasons: control-plane burden shifts to provider + ecosystem/hiring. Limitation: nodes, upgrades and cost governance stay yours."],
 ui:function(){ var st=S.ui.H7||(S.ui.H7={p:"",r:{},l:""});
  var plats='<option value="">— choose —</option><option value="k8s">Managed Kubernetes (EKS / GKE / AKS)</option><option value="swarm">Self-hosted Docker Swarm</option><option value="mesos">Apache Mesos</option><option value="solo">Stand-alone containers, no orchestrator</option>';
  var lims='<option value="">— choose —</option><option value="ops">Node capacity, upgrades and cost governance remain our job</option><option value="none">A managed platform removes all residual risk</option><option value="sec">The provider becomes responsible for our application code</option>';
  function cb(k,txt){ return '<label class="auditopt"><input type="checkbox" data-act="checkb" data-wo="OBJ-H7" data-key="r" data-val="'+k+'" '+(st.r[k]?"checked":"")+'><span>'+esc(txt)+'</span></label>'; }
  return '<div class="miniui">'
   +'<div class="formrow"><label>Platform</label><select data-act="select" data-wo="OBJ-H7" data-key="p" style="width:100%">'+plats+'</select></div>'
   +'<div class="stencil" style="margin:10px 0 4px">JUSTIFICATIONS — tick ALL that are TRUE of this choice</div>'
   +cb("r1","The provider operates the control plane (API server, etcd, upgrades) — less operator burden")
   +cb("r2","The largest ecosystem and hiring pool for container orchestration skills")
   +cb("r3","Apache Mesos is newer than Kubernetes, so it is the safer bet")
   +cb("r4","Docker Swarm has the largest ecosystem of the three tools")
   +'<div class="formrow" style="margin-top:10px"><label>Honest limitation that REMAINS</label><select data-act="select" data-wo="OBJ-H7" data-key="l" style="width:100%">'+lims+'</select></div></div>'; },
 check:function(){ var st=S.ui.H7||{};
  if(!st.p||!st.l) return {pass:false,msg:"Choose a platform and a limitation.",cls:"no"};
  if(st.p!=="k8s") return {pass:false,msg:"Rejected. Meridian's size, the managed-control-plane requirement and the hiring market all point to managed Kubernetes. Swarm fits small estates; Mesos is retired (2025); stand-alone is what caused tonight.",cls:"no"};
  if(!st.r.r1||!st.r.r2||st.r.r3||st.r.r4) return {pass:false,msg:"Justifications rejected: the two TRUE ones are provider-operated control plane and ecosystem/hiring. Mesos is OLDER than Kubernetes (and retired); Swarm has the SMALLEST ecosystem of the three.",cls:"no"};
  if(st.l!=="ops") return {pass:false,msg:"No — a managed platform does NOT remove all residual risk, and the provider never owns your application code. What stays with you: worker nodes, capacity, upgrades and cost.",cls:"no"};
  return {pass:true,cls:"ok",msg:"Well-argued. Managed Kubernetes (EKS/GKE/AKS) buys an operated control plane and ecosystem reach; the honest residual is yours: node health, capacity planning, upgrades, cost governance — and the supply chain you pour into it. Naming residual risk IS the Cloud+ answer pattern."}; }
},
{id:"OBJ-H8",pillar:"P1",title:"Debrief: map tonight's outcomes to orchestrator capabilities",
 brief:"Four facts from tonight's radio log, four capabilities. Match each fact to the capability that PRODUCED it — exact matches, this goes in the incident report.",
 look:"This card — click a fact, then its capability.",
 hints:["What MECHANISM makes each fact possible? Count changing with load = one mechanism; identity surviving reschedule = another.",
        "Replicas 4→16 fast = auto-scaling. Dead pod replaced, no human = self-healing. Name kept working across IP churn = service discovery. Pier loss, zero user impact = fault tolerance.",
        "f1→Auto-scaling · f2→Self-healing · f3→Service discovery · f4→Fault tolerance."],
 ui:function(){ var st=S.ui.H8||(S.ui.H8={sel:null,map:{}});
  if(!st.cOrder) st.cOrder={};
  var facts=[["f1","Replicas went 4 → 16 in under a minute when the sale opened"],
   ["f2","A crashed web pod was replaced in 8 seconds with no human involved"],
   ["f3","Storefront calls to cart-api never noticed the pod IP changing"],
   ["f4","PIER-B went dark mid-sale and zero carts were lost"]];
  var caps=[["as","Auto-scaling"],["heal","Self-healing"],["sd","Service discovery"],["ft","Fault tolerance"]];
  var h='<div class="miniui">';
  facts.forEach(function(x){ if(st.map[x[0]]) return;
    var ord=st.cOrder[x[0]];
    if(!ord){ ord=caps.map(function(c){return c[0];});
      for(var sh=ord.length-1;sh>0;sh--){ var sj=Math.floor(Math.random()*(sh+1)); var tmp=ord[sh]; ord[sh]=ord[sj]; ord[sj]=tmp; }
      st.cOrder[x[0]]=ord; }
    h+='<div style="margin:6px 0"><div class="note" style="margin:2px 0">'+esc(x[1])+'</div><div style="display:flex;gap:6px;flex-wrap:wrap">';
    ord.forEach(function(ck){ var c=caps.find(function(cc){return cc[0]===ck;}); h+='<button class="mchip" data-act="match-pick" data-wo="OBJ-H8" data-key="'+x[0]+'" data-opt="'+c[0]+'">'+c[1]+'</button>'; });
    h+='</div></div>'; });
  h+='</div>'; return h; },
 check:function(){ var st=S.ui.H8||{}; var m=st.map||{}; var truth={f1:"as",f2:"heal",f3:"sd",f4:"ft"};
  var ks=Object.keys(truth); if(ks.some(function(k){return !m[k];})) return {pass:false,msg:"Match all four facts first.",cls:"no"};
  for(var i=0;i<ks.length;i++){ if(m[ks[i]]!==truth[ks[i]]) return {pass:false,msg:"Rejected — read each fact for its mechanism: load-driven COUNT change (auto-scaling), DEAD-THEN-REPLACED (self-healing), IDENTITY SURVIVES MOVES (service discovery), FAILURE WITHOUT USER IMPACT (fault tolerance).",cls:"no"}; }
  return {pass:true,cls:"ok",msg:"Report-ready. These four capabilities are why Cloud+ calls orchestration the way workloads run in the cloud: scale on demand, heal without pagers, discover dynamically, tolerate failure by default. Tonight each one earned its keep."}; }
},
{id:"OBJ-H9",pillar:"P4",title:"Write the rollback clause into the runbook",
 brief:"Tonight could have been worse if 1.5.0 itself had failed its probes. Finish the runbook: (1) which image is the rollback TARGET if a forward fix fails, (2) the rollback POLICY, (3) how the orchestrator VERIFIES a rollback succeeded. Exact choices.",
 look:"This card — three dropdowns.",
 hints:["The rollback target is the last version known to serve traffic correctly tonight — not the broken hotfix.",
        "Policy: let the probes decide automatically, don't wait for a human at 03:00.",
        "Target 1.4.2 · policy: auto-rollback when readiness probes fail · verification: radio log shows Running + probes passing."],
 ui:function(){ var st=S.ui.H9||(S.ui.H9={t:"",p:"",v:""});
  function sel(k,opts){ var v=st[k]||""; var o='<option value="">— choose —</option>'+opts.map(function(x){return '<option value="'+x[0]+'"'+(v===x[0]?" selected":"")+'>'+esc(x[1])+'</option>';}).join(""); return '<select data-act="select" data-wo="OBJ-H9" data-key="'+k+'" style="width:100%">'+o+'</select>'; }
  return '<div class="miniui">'
   +'<div class="formrow"><label>1 · Rollback target if the forward fix fails probes</label>'+sel("t",[["v142","meridian/cart-web:1.4.2 (last-known-good)"],["vhot","meridian/cart-web:2.0.0-hotfix"],["vlatest","meridian/cart-web:latest"]])+'</div>'
   +'<div class="formrow"><label>2 · Rollback policy</label>'+sel("p",[["auto","Automatic: roll back when readiness probes keep failing"],["man","Wait for a human to approve each step"],["del","Delete the deployment and re-create from scratch"]])+'</div>'
   +'<div class="formrow"><label>3 · Rollback VERIFIED by…</label>'+sel("v",[["log","Radio log: pods Running and probes passing on the target image"],["cpu","CPU graphs return to baseline"],["hop","Nobody complains on the status page"]])+'</div></div>'; },
 check:function(){ var st=S.ui.H9||{};
  if(!st.t||!st.p||!st.v) return {pass:false,msg:"Answer all three parts.",cls:"no"};
  if(st.t!=="v142") return {pass:false,msg:"Rejected: the hotfix is tonight's arsonist and 'latest' is unpinned. The rollback target is the last-known-good: 1.4.2.",cls:"no"};
  if(st.p!=="auto") return {pass:false,msg:"At 03:00 you want the probe gate deciding, not a human on a pager. Probes failing persistently → automatic rollback.",cls:"no"};
  if(st.v!=="log") return {pass:false,msg:"Verification must be a health signal the orchestrator emits: pods Running and probes passing on the target image. CPU graphs and complaint silence are lagging, ambiguous indicators.",cls:"no"};
  return {pass:true,cls:"ok",msg:"Runbook complete. Versioned deployments make rollback cheap: the orchestrator keeps revisions, probes provide the automatic tripwire, and the event stream is the evidence that recovery actually happened. That is the full desired-state loop: declare → reconcile → verify."}; }
}
];

/* =====================================================================
   QUIZZES — C5
   ===================================================================== */
var QUIZ_MED=[
{q:"Orchestration is best defined as…",opts:["writing a script for one server chore on a schedule","buying more servers before a traffic spike","automating deployment, scaling and operation of containers across environments","running containers by hand with docker run"],a:2,why:"Orchestration = automated deployment + scaling + operation of containers across environments. One scripted chore is automation; orchestration coordinates the whole life-cycle continuously."},
{q:"The biggest operational risk of a STAND-ALONE production container is…",opts:["it uses too much CPU during traffic spikes","it cannot be built from a base image","it must stay on the laptop it was built on","nobody restarts or reschedules it when it dies"],a:3,why:"A stand-alone container has no coordination and no self-healing: when it fails at 03:00, it stays failed. That single fact is why production fleets use orchestrators."},
{q:"Desired state (a Deployment manifest) matters because the orchestrator…",opts:["continuously reconciles actual state toward it","executes it once and forgets it","converts it into a virtual machine","emails it to the compliance team"],a:0,why:"Declarative configuration is a contract: the controller keeps comparing reality with the declaration and corrects drift — pods restart, get replaced, get rescheduled until actual = desired."},
{q:"After a reschedule, cart-api's pod IP changes and the frontend breaks. The orchestration-native fix is…",opts:["ping the pod IP every minute from a cron job","a Service giving the app a stable DNS name","freeze all rescheduling until the sale ends","hardcode the new IP and hope for the best"],a:1,why:"Service discovery: a Service exposes a stable DNS name over an auto-updating registry of the current replicas. Callers use names, never pod IPs — IP churn is normal in an orchestrated fleet."},
{q:"Shopping-cart data must survive pod restarts. The orchestrator feature you reach for is…",opts:["a bigger container image","more replicas of the same pod","Persistent Volumes claimed by a PVC","a readiness probe"],a:2,why:"Ephemeral storage dies with the container. A Persistent Volume decouples storage from the pod life-cycle; the pod claims it with a Persistent Volume Claim and the data re-attaches on restart."},
{q:"During a rolling update, readiness probes exist to…",opts:["keep traffic away from unready pods during rollout","speed up how fast the image build finishes","scan images for vulnerabilities during every rollout","encrypt all traffic between pods inside the cluster"],a:0,why:"The probe gate is what makes zero-downtime possible: new replicas receive traffic only after passing readiness, then old replicas retire. Without probes, traffic can hit dead or unready pods — exactly tonight's outage pattern."}];
var QUIZ_HARD=[
{q:"21:12 — cart-web loops in CrashLoopBackOff after a deploy. Your FIRST action?",opts:["Scale to 32 replicas to absorb the failures","Reboot every pier until the loops stop","Delete the namespace and start over clean","Check the newest deploy's image tag and config"],a:3,why:"New fault after a change = suspect the change. The event stream names the failing image; rolling back or fixing the tag precedes any capacity heroics."},
{q:"900 rps sale traffic, budget 60 rps per pod, runbook says N+1. Declare replicas =",opts:["15","30","16","900"],a:2,why:"900 ÷ 60 = 15 base; N+1 adds one failure-absorbing replica → 16. 30 (2N) wastes money; 15 has zero headroom."},
{q:"You find DB_PASSWORD as plaintext env in a live manifest. Correct sequence?",opts:["Move it to a Secret and rotate the exposed value","Delete the manifest and start from scratch","Rename the variable so it is harder to find","Leave it; it is encrypted at rest by the registry"],a:0,why:"Plaintext-in-manifest means exposure (git, logs, screens). Both halves matter: reference a Secret going forward and ROTATE the exposed value; then audit access."},
{q:"An admission alert flags a privileged: true pod nobody recognizes. Why is this urgent?",opts:["Privileged pods render noticeably slowly for end users","Host-level access makes container escape far easier","Privileged pods cannot be stopped once they are running","It breaks the naming policy and nothing else"],a:1,why:"privileged: true grants near-host capabilities; combined with a kernel bug it is the classic path to escaping the container to the host (ATT&CK T1611). Unknown privileged pods get incident response, not a shrug."},
{q:"You drain a pier during peak sale and three pods sit Pending. Explanation?",opts:["Pending is a transient image-pull state, so wait it out","Probe failures keep the pods Pending until they pass","DNS resolution broke and the pods cannot start","Remaining piers are at capacity, so pods wait for room"],a:3,why:"Scheduling needs free capacity. If every remaining pier is full, pods wait in Pending — a capacity-planning lesson the exam does test. Auto-scaling node pools address exactly this."},
{q:"Which MITRE ATT&CK technique describes an adversary deploying a container to facilitate execution or evade defenses?",opts:["T1610 Deploy Container","T1613 Container and Resource Discovery","T1059 Command and Scripting Interpreter","T1078 Valid Accounts"],a:0,why:"T1610 = Deploy Container. Related: T1609 (container administration command), T1611 (escape to host), T1613 (container & resource discovery). The same orchestrator you administer is the one attackers abuse — hence RBAC, admission control and image scanning."},
{q:"A rolling update ships with readiness probes DISABLED and the new build crashes on boot. Most likely user impact?",opts:["Nothing at all — probes are optional in production","The old version keeps serving all traffic indefinitely","Downtime — traffic lands on never-ready pods","Images stop being pulled from the registry"],a:2,why:"Without the probe gate the orchestrator cannot distinguish ready from broken; it retires healthy pods and serves from broken ones — the exact mechanism behind tonight's 40-minute outage. Probes ON is what made your fix zero-downtime."}];

/* ---------------- hard-mode radio chatter (synthetic noise lines) ---------------- */
var CHATTER=["marketing/big-stress-1 (load test) pulling image — routine","canary cart-web:2.2.0-beta pulled to PIER-C — routine",
 "node PIER-A NTP drift 41ms — nominal","cronjob index-refresh completed — routine","tide gauge nominal · cluster capacity OK",
 "kubelet heartbeat OK on all piers","registry mirror sync complete","HPA metrics pipeline nominal"];

/* ---------------- Night Watch opening incident script (seed log, oldest last) ---------------- */
  var SEED_SEQ=[
   ["info","21:02 cronjob index-refresh completed — routine"],
   ["info","21:07 registry mirror sync complete"],
   ["info","21:10 marketing/big-stress-1 (load test) started by team-marketing — NOT customer traffic"],
   ["warn","21:14 FLASH SALE LIVE — storefront traffic ~900 rps (baseline 120)"],
   ["err","21:16 vendor script deployed meridian/cart-web:2.0.0-hotfix — untested tag pushed to production"],
   ["info","21:17 canary cart-web:2.2.0-beta pulled to PIER-C — routine release-train pull"],
   ["info","21:18 kubelet heartbeat OK on all piers"],
   ["err","21:19 SECURITY: pod legacy-importer running with privileged: true — admission warning"],
   ["err","21:20 SECURITY: DB_PASSWORD found in plaintext env of manifest cart-web (git history)"],
   ["info","21:22 node PIER-A NTP drift 41ms — nominal"],
   ["info","21:24 HPA metrics pipeline nominal"],
   ["err","21:26 cart-web-00f1: Back-off restarting failed container — image meridian/cart-web:2.0.0-hotfix (attempt #5)"],
   ["info","21:28 cart-api image pull succeeded — routine"],
   ["warn","21:30 STOREFRONT DOWN — 0 ready web pods; customers are dropped"]
  ];
