/* ================================================================
   js/objectives.js
   CHECK RESULTS validation engine: one validator per objective (V.m1..m12,
   h1..h9). Pure functions over state + data; UI code lives elsewhere.
   ================================================================ */
function renderAll(){renderTop();renderQueue();renderWB();renderEV();renderOBJ();renderQuiz();renderKB();renderDebrief();save();}
/* ================================================================
   VALIDATORS (machine-checkable, per objective)
   ================================================================ */
const fail=(msg)=>({ok:false,why:msg});
const pass=(msg)=>({ok:true,why:msg});
const V={
 m1(){const bad=[];["CHG-0418","CHG-0419","CHG-0420","CHG-0421","CHG-0422","CHG-0423","CHG-0424","SR-0917"].forEach(id=>{if(F(id).type!==TICKETS[id].correctType)bad.push(id);});
  return bad.length?fail(bad.length+" of 8 items are misclassified ("+bad.join(", ")+"). Re-read each request: catalog swap = standard; active incident = emergency; a laptop image = service request; everything planned with full review = normal."):pass("Eight for eight. Type is the routing decision: standard skips the board, normal gets full review, emergency takes the expedite path, and SR-0917 never enters the pipeline — routing it here would drown the board's judgment in routine asks.");},
 m2(){const f=F("CHG-0421");
  if(!f.rfcmiss.length)return fail("Nothing selected yet — the intake review checklist lists eight elements; compare against policy R1.");
  if(!eqSet(f.rfcmiss,TICKETS["CHG-0421"].rfcMissingOk))return fail("Not the right set. Elements like affected systems, risk and window ARE present on the request; the ones marked “(not documented)” are what R1 calls mandatory: purpose & scope, rollback plan, test plan.");
  return pass("Exactly the three missing elements. An RFC without purpose, rollback or test plan is a promise without a plan — the board defers it until repaired, which is the next step.");},
 m3(){const f=F("CHG-0418");
  if(!f.affected.length)return fail("Select the affected systems — trace the topology: everything that sends traffic through the firewalls.");
  if(!eqSet(f.affected,TICKETS["CHG-0418"].affectedOk))return fail("Set doesn't match the blast radius. Both firewalls + site-to-site tunnels + remote-access VPN ride this upgrade; the core switch, APs, DNS and phones connect around it.");
  return pass("Full blast radius captured: both firewalls, three depot tunnels, remote users. Everything on this list gets watched during the window and re-checked in validation.");},
 m4(){const f=F("CHG-0418");const rOk=f.risk==="high",wOk=f.window==="B";
  if(!rOk&&!wOk)return fail("Two parts here: the risk level and the window. The firewalls carry every depot and remote user — that's HIGH. And policy R4 says high-risk changes run weekend overnight, long enough for estimate + rollback.");
  if(!rOk)return fail("Risk level is too low — an HA firewall pair touching all depot + remote traffic is HIGH, which is exactly what triggers R4's window rule.");
  if(!wOk)return fail("That window violates R4: high-risk changes need a weekend overnight slot at least as long as estimate + rollback time. Saturday 02:00–04:30 is the only compliant slot.");
  return pass("HIGH risk + Saturday 02:00–04:30. Risk level chooses the rules; the window then satisfies them — this pairing is exactly what auditors check first.");},
 m5(){const a=F("CHG-0418").rollback,b=F("CHG-0419").cfgsource;const aOk=a==="downgrade",bOk=b==="backup";
  if(!aOk&&!bOk)return fail("Both halves need work. The firewall's failure mode is its CODE → downgrade the image. The replacement switch's failure mode is that it's BLANK → restore that device's own backup configuration.");
  if(!aOk)return fail("Rollback must reverse the actual failure: the firmware image is the problem, so the plan downgrades to 4.2.6-275 from the standby image partition. Config restores and reboots don't remove a bad image.");
  if(!bOk)return fail("Golden configuration is a generic template — it would silently drop THIS device's port specifics. SC-114 step 4 restores the switch's own backup configuration: its last known good state.");
  return pass("Image downgrade for the firewall, backup configuration for the switch. A rollback plan is only real if it reverses the actual failure mode — and is tested before the window.");},
 m6(){const e=E("CHG-0420");
  if(!e.sandbox)return fail("Sequence not started: policy R5 requires the sandbox lease regression BEFORE production on a shared DHCP/DNS service.");
  if(!e.deployed)return fail("Sandbox passed — now the production deploy is unlocked. Finish the sequence.");
  return pass("Sandbox regression first, production second — the lock on the deploy button IS the process working. A regression caught in sandbox costs minutes; in production it costs depots their leases.");},
 m7(){const prob=[];
  ["CHG-0418","CHG-0420","CHG-0421","CHG-0422","CHG-0423"].forEach(id=>{if(F(id).decision!=="approve")prob.push(id+" → approve");});
  if(F("CHG-0424").decision!=="reject")prob.push("CHG-0424 → reject");
  if(F("CHG-0423").empathy!=="e1")prob.push("CHG-0423 → expedited duty-manager path");
  if(F("CHG-0421").decision==="approve"&&!(F("CHG-0421").purpose&&F("CHG-0421").rollback&&F("CHG-0421").test))prob.unshift("CHG-0421's RFC must be repaired BEFORE it can be approved");
  if(prob.length)return fail("The board's minutes don't hold up yet: "+prob.slice(0,3).join("; ")+". Approve planned-and-repaired work, reject what has no fallback, expedite — never skip — the emergency.");
  return pass("Board session complete: approvals for the planned work, rejection (with coaching) for the core-switch request that had no rollback or test plan, and the emergency approved on the duty-manager path with retro-review. That is judgment, applied consistently.");},
 m8(){const d=S.drift;
  if(d.device!=="HQ-CORE-01")return fail(d.device?(d.device==="FW-B"?"FW-B has a diff, but its banner cites an approved request (CHG-0416) — authorized, not drift.":"DEPOT-E-ASW-02 diffs cleanly — a clean diff rules a device out."):"Pick the drifted device in the investigation panel — Evidence → Configs diffs all three.");
  if(d.delta!=="vlan66")return fail("Read the HQ-CORE-01 diff again: what appears in production that the baseline never contained?");
  return pass("HQ-CORE-01: VLAN 66 “GUEST-TEMP” + port Gi1/0/24 re-pointed into it — all absent from baseline. The diff against the golden configuration is ground truth: this is what changed, and no request explains it.");},
 m9(){const d=S.drift;
  if(d.who!=="moreau")return fail("The audit trail has the answer: look for the config-commit with NO RFC reference — who, when?");
  if(d.cls!=="unauth")return fail("A commit with no RFC reference behind it is the definition of an unauthorized change — configuration drift, not a standard or cosmetic change.");
  if(d.rem!=="rfc")return fail("Drift is a fault (policy R7): the fix runs THROUGH the process — a remediation request and a revert to baseline. Quiet after-hours fixes are how the records and reality diverge forever.");
  return pass("j.moreau, 2026-11-05 21:38, no RFC reference → unauthorized change → remediation request + revert to baseline. Who/what/when from the audit trail; response from policy. That's request tracking earning its keep.");},
 m10(){const a=eqSet(F("CHG-0418").monitor,["ha","vpn"]),b=eqSet(F("CHG-0419").monitor,["lldp"]),c=eqSet(F("CHG-0420").monitor,["dhcp"]);const prob=[];
  if(!a)prob.push("CHG-0418 → HA failover log + VPN tunnel board");
  if(!b)prob.push("CHG-0419 → port/LLDP status");
  if(!c)prob.push("CHG-0420 → DHCP lease renewal stats");
  if(prob.length)return fail("Telemetry must map to the service, not the task: "+prob.join("; ")+".");
  return pass("Failover logs + tunnel status prove the firewall work; LLDP proves the switch passes traffic; lease renewals prove DHCP serves clients. Validation is done when telemetry says the SERVICE works — not when the command exits 0.");},
 m11(){const s=F("CHG-0419").doc==="snew",i=F("CHG-0421").ipam==="i1",sc=F("CHG-0421").schema==="sc1",tp=S.topoInstalled;const prob=[];
  if(!s)prob.push("new switch serial (SN-MFL-90377)");
  if(!i)prob.push("IPAM row for VLAN 40 → 10.40.20.0/24");
  if(!sc)prob.push("schema-vs-assignment classification");
  if(!tp)prob.push("candidate uplink on the topology diagram");
  if(prob.length)return fail("Documentation cascade incomplete: "+prob.join(", ")+". Policy R6 closes requests only after the records match reality.");
  return pass("Serial swapped, IPAM re-blocked to schema v2 (a SCHEMA change — a new block design, not just new addresses for a few devices), and the diagram shows the new link. This is the update the auditor's two-day hunt was missing.");},
 m12(){const c=S.concept;const okk=c.k1==="change"&&c.k2==="config"&&c.k3==="lifecycle"&&c.k4==="sr";
  if(!okk)return fail("Match by what the statement is ABOUT: approval records → change management; running-vs-baseline comparison → configuration management; EOL/EOS replacement planning → life-cycle management; a laptop/token ask → service request.");
  return pass("Four for four. Objective 3.1 deliberately groups change, configuration and life-cycle management with service requests — the exam expects you to know which process owns which statement.");},
 h1(){const bad=[];["CHG-0418","CHG-0419","CHG-0420","CHG-0421","CHG-0422","CHG-0423","CHG-0424","SR-0917"].forEach(id=>{if(F(id).type!==TICKETS[id].correctType)bad.push(id+" (type)");});
  PRIORITY_ITEMS.forEach(id=>{if(F(id).priority!==PRIORITY_OK[id])bad.push(id+" (priority)");});
  if(bad.length)return fail("Triage rejects: "+bad.slice(0,4).join(", ")+". Rule: emergency first → high risk by ticket ID → low risk → standard last. Type: catalog swap = standard, active incident = emergency, laptop ask = service request.");
  return pass("Queue triaged exactly per policy: 0423 emergency → 1, then high-risk 0418/0421/0422 by ID, low-risk 0420, catalog standard 0419 last. An ordered queue is how the night window gets spent on the right work.");},
 h2(){const f=F("CHG-0421");
  const parts=[["rfcmiss",eqSet(f.rfcmiss,TICKETS["CHG-0421"].rfcMissingOk),"missing elements"],["purpose",f.purpose==="p1","purpose"],["rollback",f.rollback==="r1","rollback"],["test",f.test==="t1","test plan"],["schema",f.schema==="sc1","schema-vs-assignment"]];
  const bad=parts.filter(p=>!p[1]).map(p=>p[2]);
  if(bad.length)return fail("RFC repair incomplete: "+bad.join(", ")+".");
  return pass("RFC repaired end-to-end: three missing elements identified, purpose re-blocked to 10.40.20.0/24, tested scope-revert rollback, sandbox pilot plan, and the schema call: a new address BLOCK design → schema change (the IPAM schema record, not individual assignments).");},
 h3(){return V.m3();},
 h4(){const d=S.drift;const prob=[];
  if(d.device!=="HQ-CORE-01"||d.delta!=="vlan66"||d.cls!=="unauth"||d.rem!=="rfc")prob.push("device/delta/classification/remediation");
  if(!d.fwOk)prob.push("dismiss the FW-B banner diff (authorized per CHG-0416)");
  if(!d.flapOk)prob.push("dismiss the unrelated link-flap alert");
  if(prob.length)return fail("Investigation unfinished: "+prob.join("; ")+".");
  return pass("True drift isolated with both red herrings explicitly dismissed: FW-B's banner cites approved CHG-0416; the flap cites carrier ticket NET-2211. The real finding: j.moreau's VLAN 66 on HQ-CORE-01, no RFC, remediated through the process.");},
  h5(){const s=E("CHG-0418").seq;const okk=s.length===6&&s[0]===0&&s[1]===1&&s[2]===2&&s[3]===3&&s[4]===4&&s[5]===5;
  return okk?pass("Sequence correct: announce → fail over to FW-B → downgrade FW-A → fail back → downgrade FW-B → verify HA + tunnels. One firewall at a time, with traffic shifted first — that's the safety logic you'd execute at 02:10."):fail("Order matters: never take both firewalls down together. Announce first, shift traffic to the standby, fix one device, return traffic, fix the other, then prove the pair and the tunnels are whole.");},
 h6(){const prob=[];
  ["CHG-0418","CHG-0420","CHG-0421","CHG-0422","CHG-0423"].forEach(id=>{if(F(id).decision!=="approve")prob.push(id+" → approve");if(id!=="CHG-0423"&&F(id).justify!=="j1")prob.push(id+" → recorded justification");});
  if(F("CHG-0424").decision!=="reject"||F("CHG-0424").justify!=="x1")prob.push("CHG-0424 → reject with justification");
  if(F("CHG-0423").empathy!=="e1")prob.push("CHG-0423 → expedited path");
  if(F("CHG-0422").rollback!=="r1")prob.push("CHG-0422 rollback plan must exist before approval");
  if(prob.length)return fail("Board record incomplete: "+prob.slice(0,4).join("; ")+".");
  return pass("Every decision carries its reason: tested fallback + staged upgrade for 0418, sandbox pass for 0420, repaired RFC for 0421, rollback-then-approve for 0422, expedite-with-retro-review for 0423, and a coached rejection for 0424. Approvals without recorded reasons cannot survive an audit.");},
 h7(){return eqSet(S.drift.ds,["cfgdiff","audit","asset"])?pass("Config diff proves WHAT changed; audit trail proves WHO/WHEN and whether a request authorized it; inventory reconciliation catches undocumented hardware. SLA reports, heat maps and UPS logs measure health — not change provenance."):fail("Source selection is wrong. Test each source with: could it ever show a change that no request explains? Health metrics (SLA, heat map, battery) never see provenance.");},
 h8(){const a=eqSet(F("CHG-0418").monitor,["ha","vpn"]),b=eqSet(F("CHG-0419").monitor,["lldp"]),c=eqSet(F("CHG-0423").monitor,["dns"]),d=E("CHG-0420").rolledBack,dd=eqSet(F("CHG-0420").monitor,["dhcp"]);const prob=[];
  if(!a)prob.push("0418 → HA + VPN telemetry");if(!b)prob.push("0419 → LLDP");if(!c)prob.push("0423 → sinkhole log");
  if(!d)prob.push("0420 → execute its rollback when validation fails");else if(!dd)prob.push("0420 → validate lease stats on 2.89");
  if(prob.length)return fail("Validation record incomplete: "+prob.join("; ")+".");
  return pass("You caught the night's failure correctly: dnsmasq 2.90 regressed lease renewals, the pre-planned rollback restored 2.89, and the request closes as attempted → failed → reverted → service safe. The process won even though the change didn't.");},
 h9(){const s=F("CHG-0419").doc==="snew",i=F("CHG-0421").ipam==="i1",sc=F("CHG-0421").schema==="sc1",tp=S.topoInstalled,fw=F("CHG-0418").doc==="v281";const prob=[];
  if(!s)prob.push("serial SN-MFL-90377");if(!i)prob.push("IPAM 10.40.20.0/24");if(!sc)prob.push("schema classification");if(!tp)prob.push("topology link");if(!fw)prob.push("FPR-4.2.7-281 version");
  if(prob.length)return fail("Documentation cascade incomplete (exact values required): "+prob.join(", ")+".");
  return pass("Four records, four exact values: SN-MFL-90377, VLAN 40 → 10.40.20.0/24 schema v2, the new uplink with its VRRP VIP, FPR-4.2.7-281. Near-misses were rejected for a reason — a record that merely sounds complete is how audits take two days.");}
};
function objResult(o,res){
 const st=OBJ(o.id);st.attempts++;st.last={ok:res.ok,why:res.why};
 const box=document.querySelector(`[data-vf="OBJ-${o.id}"]`);
 if(res.ok&&!st.done){st.done=true;announce(o.id+" complete. "+res.why);}
 if(box){box.className="verdict "+(res.ok?"ok":"no");box.innerHTML=(res.ok?"✓ <b>Check passed.</b> ":"✗ <b>Not yet.</b> ")+esc(res.why);}
 renderAll();
}
