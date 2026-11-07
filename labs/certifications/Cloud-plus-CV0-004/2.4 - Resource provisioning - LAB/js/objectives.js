/* js/objectives.js — CHECK RESULTS validation engine.
 * monthlyCost / reqStatus / testsCompute feed both the UI and the validators;
 * vM1..vM12 and vH1..vH9 are the per-objective rules, VALS maps objective id → rule. */
'use strict';
/* ================= COMPUTATIONS ================= */
function monthlyCost(){var e=state.env,c=0,lines=[];
 if(e.compSize){var inst=instById(e.compSize),cc=inst.price*e.count;c+=cc;lines.push([inst.id+' × '+e.count+' node(s)',cc])}
 if(e.nat){c+=65;lines.push(['NAT gateway',65])}
 if(e.subPub){c+=25;lines.push(['Load balancer',25])}
 if(e.storeType==='block'){var sc=40+Math.round((e.iops-1000)/500)*5;c+=sc;lines.push(['Block store @ '+e.iops+' IOPS',sc])}
 else if(e.storeType==='object'){var oc=e.storeTier==='archive'?6:(e.storeTier==='infrequent'?15:30);c+=oc;lines.push(['Object store ('+(e.storeTier||'standard')+' tier)',oc])}
 else if(e.storeType==='file'){c+=50;lines.push(['File share',50])}
 if(e.db==='relational'){var dc=e.multiAz?360:180;c+=dc;lines.push(['Relational DB'+(e.multiAz?' · Multi-AZ':''),dc])}
 else if(e.db==='nosql'){var nc=e.multiAz?280:140;c+=nc;lines.push(['NoSQL DB'+(e.multiAz?' · Multi-AZ':''),nc])}
 return{total:c,lines:lines}}
function reqStatus(){var e=state.env,c=monthlyCost();return[
 {t:'EU/EEA residency',d:'Region must be in the EU.',ok:!!(regById(e.region)&&regById(e.region).eu)},
 {t:'Lowest latency to Zurich',d:'Frankfurt (cf-eu-central) is the closest EU region.',ok:e.region==='cf-eu-central'},
 {t:'Data tier 99.9% availability',d:'Relational DB with a Multi-AZ standby.',ok:!!e.multiAz},
 {t:'≤ CHF '+BUDGET.toLocaleString('en-US')+'/month',d:'Steady-state monthly cost (Bill of Materials).',ok:!!e.compSize&&c.total<=BUDGET},
 {t:'Data store not internet-reachable',d:'No world-open database or SSH rules; data lives in the private subnet.',ok:e.subPriv!==''&&!e.sg.r5432any&&!e.sg.r22any},
 {t:'Tagged per policy',d:'environment=prod · owner=platform · cost-center=CC-2847 · data-class=confidential.',ok:tagsOk()}]}
function testsCompute(){var e=state.env;return[
 {id:'T1',t:'Internet path to the web tier',d:'IGW attached and a public subnet selected for the load balancer.',ok:!!(e.igw&&e.subPub),fix:'Attach the IGW and select the public subnet (Draft → Region & network).'},
 {id:'T2',t:'Data store isolation',d:'Database in the private subnet; no world-open DB rule.',ok:!!(e.subPriv&&!e.sg.r5432any),fix:'Select the private subnet and remove any 5432-from-anywhere rule.'},
 {id:'T3',t:'Private egress for patching',d:'NAT gateway present for the private subnet.',ok:!!e.nat,fix:'Enable the NAT gateway in the public subnet.'},
 {id:'T4',t:'High availability of the data tier',d:'Multi-AZ standby enabled for the database.',ok:!!e.multiAz,fix:'Enable Multi-AZ on the database (Draft → Storage & data), then re-provision.'},
 {id:'T5',t:'Compliance & hygiene',d:'EU region + all four mandatory tags applied.',ok:!!(regById(e.region)&&regById(e.region).eu&&tagsOk()),fix:'Choose an EU region and complete the tag policy (Draft → Security & access).'}]}
/* ================= OBJECTIVES ================= */
function V(ok,near,msg){return{ok:ok,near:near,msg:msg}}
var PILLARS={P1:'Understand',P2:'Recognize & configure',P3:'Verify & detect',P4:'Mitigate & govern'};
var PCOL={P1:'var(--p1)',P2:'var(--p2)',P3:'var(--p3)',P4:'var(--p4)'};
var METHOD_NAMES={console:'console',cli:'scripted CLI',iac:'IaC pipeline',catalog:'self-service catalog'};
function vM1(){var a=state.audit.method,miss=[],bad=[];
 ['sit1','sit2','sit3'].forEach(function(k){if(!a[k])miss.push(k);else if(a[k]!==METHOD_OK[k])bad.push(k)});
 if(!miss.length&&!bad.length)return V(true,false,'All three match. Note the pattern: the more a build repeats, the more it wants code — the console is for disposable one-offs, the pipeline for anything you rebuild.');
 var w=[];miss.forEach(function(k){w.push('situation '+k.slice(3)+' needs a method')});bad.forEach(function(k){w.push('situation '+k.slice(3)+' fits “'+METHOD_NAMES[METHOD_OK[k]]+'” better')});
 return V(false,false,'Not yet — '+w.join('; ')+'. Ask: will this be done once (console), does it need custom logic (CLI), or is it rebuilt identically many times (IaC)?');}
function vM2(){var r=state.env.region;
 if(r==='cf-eu-central')return V(true,false,'Frankfurt satisfies EU/EEA residency and gives the lowest latency to Zurich/Munich (~4 ms). Region is the least reversible decision — from here, everything else inherits it.');
 if(r==='cf-eu-west')return V(false,true,'Dublin passes residency but is not the lowest-latency EU location for Zurich/Munich users (~13 ms). A near-miss: legal ✓, user experience ✗. Check the latency note on each region.');
 if(!r)return V(false,false,'Choose a region in Draft → Region & network first.');
 return V(false,false,'That region fails the residency requirement — patient data must stay in the EU/EEA. Pick an EU region, then optimize for latency.');}
function vM3(){var e=state.env,miss=[];
 if(e.vpc!=='10.0.0.0/16')miss.push('VPC CIDR 10.0.0.0/16 (unclaimed space; 192.168.0.0/16 overlaps the corp network)');
 if(e.subPub!=='10.0.1.0/24')miss.push('public subnet 10.0.1.0/24');
 if(e.subPriv!=='10.0.2.0/24')miss.push('private subnet 10.0.2.0/24');
 if(!e.igw)miss.push('internet gateway');
 if(!e.nat)miss.push('NAT gateway');
 if(!miss.length)return V(true,false,'The network foundation is right: unclaimed VPC space, a public subnet for the load balancer, a private subnet for data, IGW for inbound web traffic, NAT for private outbound patching.');
 if(e.vpc==='192.168.0.0/16')return V(false,true,'192.168.0.0/16 already routes the corporate offices and partner VPN — an overlapping VPC breaks routing (see the forensics bench in Hard mode). Choose unclaimed space.');
 return V(false,false,'Still missing: '+miss.join('; ')+'.');}
function vM4(){var e=state.env,inst=INSTANCES.filter(function(i){return i.id===e.compSize})[0];
 if(!inst)return V(false,false,'Select an instance type in Draft → Compute first.');
 if(e.compSize==='standard.large'){if(e.count===2&&e.auto)return V(true,false,'standard.large (8 vCPU / 32 GB) is the smallest type meeting the profile, ×2 nodes with autoscaling gives HA headroom at ~CHF 480/mo — right-sized.');
  return V(false,false,'Right type! Now set count = 2 and enable the autoscaling group for elasticity.');}
 if(e.compSize==='gpu.accel')return V(false,false,'The GPU family is ~CHF 1,450/node — it crushes the CHF 2,000 budget and the analytics profile needs CPU/RAM, not GPUs. (The CFO’s “newest GPU family” line is a red herring.)');
 if(e.compSize==='compute.xlarge')return V(false,true,'compute.xlarge (16 vCPU / 32 GB) meets the ≥8 vCPU / ≥32 GB profile but is oversized for it — right-sizing says take the smallest type that meets the profile: standard.large.');
 return V(false,false,'That type misses the workload profile (≥ 8 vCPU and ≥ 32 GB RAM per node). Check each option’s specs in the grid.');}
function vM5(){var a=state.audit.stor,e=state.env,miss=[];
 ['st1','st2','st3'].forEach(function(k){if(a[k]!==STOR_OK[k])miss.push('workload '+k.slice(2)+' → '+STOR_OK[k]+' storage')});
 if(e.storeType!=='block')miss.push('platform data store = block (it backs the relational database)');
 if(e.db!=='relational')miss.push('patient-data database engine = relational');
 if(e.storeTier!=='archive')miss.push('audit-log tier = archive');
 if(e.iops<3000)miss.push('IOPS ≥ 3,000 (currently '+e.iops+')');
 if(!miss.length)return V(true,false,'Correct: transactional volume → block, data lake → object, shared homes → file; the platform store backing the relational database is block; structured patient records with transactions → a relational engine; write-once audit logs belong in the archive tier; and the analytics profile needs ≥ 3,000 IOPS.');
 return V(false,false,'Not yet — '+miss.join('; ')+'.');}
function vM6(){var t=state.env.iac,miss=[];
 if((t.region||'').trim().toLowerCase()!=='cf-eu-central')miss.push('region = cf-eu-central');
 if((t.count||'').trim()!=='2')miss.push('count = 2');
 if((t.machine||'').trim().toLowerCase()!=='standard.large')miss.push('machine_type = standard.large');
 if((t.env||'').trim().toLowerCase()!=='prod')miss.push('environment = prod');
 if(!miss.length)return V(true,false,'Template complete. This file is now the source of truth: apply it twice and you get the same environment — that is idempotency. Commit it to Git so drift is detectable.');
 return V(false,false,'Fill all four blanks to match the approved design — missing: '+miss.join('; ')+'.');}
function vM7(){var e=state.env,need={r443:1,r22corp:1,r5432priv:1},danger={r22any:1,r5432any:1,r80:1},extra=[],miss=[],dang=[];
 SG.forEach(function(r){var on=!!e.sg[r.id];if(need[r.id]&&!on)miss.push(r.id);if(!need[r.id]&&on){if(danger[r.id])dang.push(r.id);else extra.push(r.id)}});
 if(dang.length)return V(false,false,'Rejected: a world-open rule ('+dang.join(', ')+') exposes instances or the data store to the entire internet — the most common real-world mis-provisioning. Remove it and allow-list named sources only.');
 if(!miss.length&&!extra.length){if(e.iam==='app-runtime-least')return V(true,false,'Default-deny, minimum exposure: 443 to the web tier, SSH from the corp range only, database reachable from the private subnet — and a least-privilege execution role.');
  return V(false,false,'The rule set is right. Now pick the execution role — least privilege means only the actions the platform performs.');}
 if(miss.length)return V(false,false,'Missing required rules: '+miss.join(', ')+'. '+(extra.length?'And remove the unneeded: '+extra.join(', ')+'.':''));
 return V(false,false,'Remove unneeded rules: '+extra.join(', ')+' — every open port is attack surface you must justify.');}
function vM8(){var e=state.env.tags,miss=[];
 Object.keys(TAGPOLICY).forEach(function(k){if(e[k]!==TAGPOLICY[k])miss.push(k+'='+TAGPOLICY[k])});
 if(!miss.length)return V(true,false,'All four policy tags set: environment, owner, cost center, data class. Every resource can now answer “who owns me, what data do I hold, what do I cost”.');
 return V(false,false,'Tag policy not satisfied — missing or wrong: '+miss.join('; ')+'. Untagged resources are unallocatable and unauditable.');}
function vM9(){var e=state.env;
 if(!e.provisioned)return V(false,false,'Run “Run provision” in the Build stage first — then read the log.');
 if(!e.testsRun)return V(false,false,'Now run the validation tests in the Verify stage.');
 var ts=testsCompute(),fails=ts.filter(function(t){return!t.ok});
 if(!fails.length)return V(true,false,'All five tests green — the deployment is proven: reachable, isolated, egress-patched, highly available, compliant. This is the Go for launch.');
 var msgs=fails.map(function(t){return t.t+': '+t.fix});
 return V(false,false,'Tests still failing — '+msgs.join(' | ')+' Fix the blueprint, re-provision if needed, and re-run the tests.');}
function vM10(){var c=state.audit.classify,miss=[];
 FINDINGS.forEach(function(f){if(c[f.id]!==(f.real?'real':'benign'))miss.push(f.id)});
 if(!miss.length)return V(true,false,'Correct triage: F1–F4 are real mis-provisioning (public store, untagged fleet, wildcard role, oversized node); F5–F6 are designed behavior (backup job, elasticity at peak). Distinguishing signal from noise is the auditor’s core skill.');
 return V(false,false,'Re-check '+miss.join(', ')+'. Ask: does this violate a policy or create exposure (real), or is it documented, intentional behavior (benign)?');}
function vM11(){var f=state.audit.fix,miss=[],bad=[],order=false,seq=state.audit.seq;
 FINDINGS.filter(function(x){return x.real}).forEach(function(x){var correct=x.fixes.filter(function(o){return o.ok})[0];if(!f[x.id])miss.push(x.id);else if(f[x.id]!==correct.id)bad.push(x.id)});
 if(seq[0]!==0||seq[1]!==1)order=true;
 if(!miss.length&&!bad.length&&!order)return V(true,false,'All four fixes correct, and the plan starts with containment (block public access) before assessment and deeper fixes. Contain → assess → fix → verify is the standing remediation order.');
 var w=[];miss.forEach(function(id){w.push('choose a fix for '+id)});bad.forEach(function(id){w.push('reconsider the '+id+' fix (it makes things worse or dodges the problem)')});
 if(order)w.push('the first two sequenced steps must be the containment step, then preserving evidence');
 return V(false,false,'Not yet — '+w.join('; ')+'.');}
function vM12(){var p=state.audit.purch,miss=[];
 if(p['web-tier-247']!=='reserved')miss.push('web tier → reserved');
 if(p['nightly-batch']!=='spot')miss.push('nightly batch → spot');
 if(p['dev-sandbox']!=='on-demand')miss.push('dev sandbox → on-demand');
 if(state.audit.budgetAlert!==80)miss.push('budget alert at 80%');
 if(!miss.length)return V(true,false,'Model matches workload profile: reserved for the steady baseline, spot for interruptible batch, on-demand for the unpredictable sandbox — and the 80% budget alert turns overspend into a notification instead of an invoice surprise.');
 return V(false,false,'Not yet — '+miss.join('; ')+'.');}
function vH1(){var c=state.audit.constraints,sel=CONSTRAINTS.filter(function(k){return c[k.id]}),bad=sel.filter(function(k){return!k.ok}),miss=CONSTRAINTS.filter(function(k){return k.ok&&!c[k.id]});
 if(sel.length===6&&bad.length===0)return V(true,false,'Exactly the six binding constraints. The discarded six were red herrings: aspirations (10k users), future phases (CRM, Sydney DR), preferences (GPU, mh- prefix) and schedule pressure — none of them constrain the configuration.');
 var w=[];miss.forEach(function(k){w.push('missed: '+k.t)});bad.forEach(function(k){w.push('“'+k.t+'” is a red herring ('+k.src+')')});
 return V(false,false,'Binding constraints must be exactly six — '+w.join('; ')+'.');}
function vH2(){var e=state.env,c=monthlyCost(),req=reqStatus();
 if(!e.provisioned)return V(false,false,'Provision the blueprint in the Build stage — the board only stamps a build that ran.');
 var fails=req.filter(function(r){return!r.ok});
 if(fails.length)return V(false,false,'Requirements not met: '+fails.map(function(r){return r.t}).join(' | ')+'. Tighten the draft and re-provision.');
 if(c.total>BUDGET)return V(false,false,'Over budget: CHF '+c.total+'/mo vs cap CHF '+BUDGET+'. Right-size compute and check the purchasing plan.');
 var ts=testsCompute().filter(function(t){return!t.ok});
 if(ts.length)return V(false,false,'Validation failing: '+ts.map(function(t){return t.t}).join(' | '));
 return V(true,false,'Full blueprint accepted: all six constraints stamped, CHF '+c.total+'/mo under the cap, five validation tests green. That is objective 2.4 performed end to end.');}
function vH3(){var c=state.audit.cause,miss=[];
 FORENSICS.forEach(function(f){if(c[f.id]!==f.ok)miss.push(f.id)});
 if(!miss.length)return V(true,false,'All three root causes correct: CIDR overlap, quota exhaustion, missing pipeline permissions — the three most common non-logic provisioning failures. Each has a process fix: plan ranges, pre-check quotas, grant least-privilege pipeline rights.');
 return V(false,false,'Re-read the ERROR lines for '+miss.join(', ')+' — each message names its class (overlap / limit / unauthorized). Match it to the root-cause list.');}
function vH4(){var d=state.audit.drift,miss=[];
 DRIFT.forEach(function(r){var want=r.drift?r.sev:'';var got=d[r.id]||'';if(got!==want)miss.push(r.id)});
 if(!miss.length)return V(true,false,'All five relevant drifts caught with correct severities (exposures = high; cost/governance = medium), and the cosmetic description change left unflagged. Severity discipline keeps responders focused on what is dangerous, not what is noisy.');
 return V(false,false,'Drift set not exact — re-examine '+miss.join(', ')+'. Only configuration with security, availability or cost impact counts; text changes are cosmetic.');}
function vH5(){var s=state.audit.seq;
 for(var i=0;i<7;i++){if(s[i]!==i)return V(false,false,'The order is not the contain → assess → fix → verify sequence. First block the exposure, then preserve/review evidence, then structural fixes, and verify last. Reorder with the arrows.')}
 return V(true,false,'Correct: contain (block public access) → assess (preserve + review logs) → fix (IAM, tags, sizing) → verify (re-scan + access attempt). Containment always comes before investigation so exposure stops growing.');}
function vH6(){var t=state.audit.telo,miss=[];
 TELE.forEach(function(r){if(t[r.id]!==r.ok)miss.push(r.id+' → '+r.ok)});
 if(!miss.length)return V(true,false,'Right-sizing correct: web-01 downsized (12% avg), web-02 upsized (99% peak, SLO breaches), batch-01 terminated and replaced by a spot job, db-01 kept (healthy headroom). Utilization data beats guesswork.');
 return V(false,false,'Re-check '+miss.join(', ')+'. Rules of thumb: sustained <30% → downsize; peaks hitting 100%/SLO breaches → upsize; idle-but-batch-shaped → replace with a cheaper model; healthy and SLA-bound → leave alone.');}
function vH7(){var p=state.audit.purch,miss=[];
 if(p['web-tier-247']!=='reserved')miss.push('web tier → reserved');if(p['nightly-batch']!=='spot')miss.push('nightly batch → spot');if(p['dev-sandbox']!=='on-demand')miss.push('dev sandbox → on-demand');
 if(state.audit.budgetAlert!==80)miss.push('budget alert at 80%');
 if(!state.audit.regionDeny)miss.push('region deny-policy enabled (guardrail)');
 if(!miss.length)return V(true,false,'Purchasing matches profiles, the alert fires before the invoice does, and the region deny-policy makes EU residency a platform guarantee instead of a habit.');
 return V(false,false,'Missing: '+miss.join('; ')+'.');}
function vH8(){var r=state.audit,miss=[];
 RULEDEFS.forEach(function(rd){if(r.ruleEv[rd.id]!==rd.evOk)miss.push(rd.id+' event');if(r.ruleCond[rd.id]!==rd.condOk)miss.push(rd.id+' condition')});
 if(!miss.length)return V(true,false,'All three detections correct: non-pipeline SG changes (drift), publicly created buckets (exposure), and run-rate above 110% of forecast (budget). Together they watch the three ways provisioning quietly goes wrong.');
 return V(false,false,'Re-check: '+miss.join('; ')+'. Anchor each rule on the event that begins the risk, then the condition that separates signal from routine work.');}
function vH9(){var v=state.audit.verify,miss=[];
 VSTEPS.forEach(function(s){if((v[s.id]||0)!==s.ok)miss.push(s.id)});
 if(!miss.length)return V(true,false,'Verification protocol exact: re-scan config, attempt the old access path (expect denial), confirm the alert lifecycle, re-run the full suite, then record residual risk and sign off. “It feels fixed” is not evidence; S6–S8 destroy data, delay, or leak.');
 return V(false,false,'Not the exact protocol — check '+miss.join(', ')+'. A verification step must produce evidence the specific risk is closed, in containment-check-first order.');}
var VALS={M1:vM1,M2:vM2,M3:vM3,M4:vM4,M5:vM5,M6:vM6,M7:vM7,M8:vM8,M9:vM9,M10:vM10,M11:vM11,M12:vM12,
 H1:vH1,H2:vH2,H3:vH3,H4:vH4,H5:vH5,H6:vH6,H7:vH7,H8:vH8,H9:vH9};
