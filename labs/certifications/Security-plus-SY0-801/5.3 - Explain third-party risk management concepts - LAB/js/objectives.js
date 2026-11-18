"use strict";
/* =========================================================================
   js/objectives.js — the objective engine (CHECK RESULTS) + all objectives
   Medium: OBJ_MED (M1–M6) and OBJ_MED2 (M7–M12). Hard: OBJ_HARD (H1–H10).
   Each objective = render(env) template + check(env) validator + hints + ok
   feedback. Validation logic, tolerances, hint tiers and feedback messages
   are carried over 1:1 from the original lab (v4 audited build, including
   R2 answer-locking, R4/R6 shuffled display orders, R5 length balance).
   ========================================================================= */

function modeObjs(){ return state.mode === "medium" ? OBJ_MED.concat(OBJ_MED2) : OBJ_HARD; }
function phaseObjs(p){ return modeObjs().filter(function(o){ return o.phase === p; }); }

var OBJ_MED = [];

/* OBJ-M1 — procurement request routing */
OBJ_MED.push({
  id:"OBJ-M1", phase:1, pillar:"P1",
  title:"Route the four procurement documents to the right selection stage (RFI / EOI / RFP / RFQ).",
  desc:"Four documents sit in the intake drawer. For each one, choose the selection stage it belongs to. This is how MVHN 'asks the market' — and the exam expects you to tell the four apart.",
  hints:[
    "Read what each document asks for: information? interest? full scored proposals? or a price for a fixed item?",
    "A and B are early-stage (requirements still open → RFI; shortlist → EOI). C scores full proposals; D prices a fully specified item.",
    "A → RFI, B → EOI, C → RFP, D → RFQ."
  ],
  ok:"Stamped. The escalation RFI → EOI → RFP → RFQ moves from open exploration to fixed requirements: each stage narrows the market until only price is left to negotiate. Mismatched stages waste months or lock in bad requirements.",
  render:function(){
    var h = docOpen({id:"m1", title:"Intake drawer — four procurement documents", look:"primer", lookLabel:"open the background readings"}, MED.m1.kind);
    for (var i=0;i<MED.m1.docs.length;i++){
      var d = MED.m1.docs[i];
      /* QA fix (R4/R6): rotate the dropdown order per document so doc position never mirrors the option list */
      h += '<div class="qrow"><span class="qlabel">'+d.title+'</span><div class="paperquote">'+d.text+'</div>'+selHTML("m1."+d.id, rotateArr(MED.m1.options, (i%MED.m1.options.length)+1), "Select stage for "+d.title)+'</div>';
    }
    return h + docClose();
  },
  check:function(env){
    var want = {"m1.d1":"RFI","m1.d2":"EOI","m1.d3":"RFP","m1.d4":"RFQ"};
    for (var k in want){ if (env[k] !== want[k]){ return {ok:false, msg:"Not yet — document "+k.split(".")[1].toUpperCase()+" is routed to "+(env[k]||"nothing")+". Re-read what it asks the market for: information about what exists (RFI), interest to build a shortlist (EOI), full scored proposals (RFP), or a price for a fully specified item (RFQ)."}; } }
    return {ok:true};
  }
});

/* OBJ-M2 — due diligence mapping */
OBJ_MED.push({
  id:"OBJ-M2", phase:1, pillar:"P2",
  title:"Map Nimbus's six diligence artifacts to the dimensions they prove — including the fourth-party disclosure.",
  desc:"Due diligence before signature is the cheapest risk control MVHN owns. Assign each artifact in Nimbus's diligence file to the dimension it evidences; each artifact is used exactly once.",
  hints:[
    "Six dimensions, six artifacts — the artifact names strongly hint at their dimension (e.g., 'subcontractor list' proves fourth parties).",
    "Security posture ← questionnaire; incident response ← runbook + post-mortems; certifications ← SOC 2 + ISO.",
    "sec→a, ir→b, cert→c, fin→d, legal→e, fourth→f."
  ],
  ok:"Stamped. Note what made the cut: not just security — financial stability (a bankrupt vendor is a breach of continuity), legal history, and the subcontractor list. The fourth-party list is the artifact most teams skip, and it is exactly where incidents hide.",
  render:function(){
    var h = docOpen({id:"m2", title:"Nimbus Chart Systems — due diligence file", look:"m1", lookLabel:"the intake drawer"}, MED.m2.kind);
    h += '<p style="font-size:14.5px;color:var(--ink-soft)">'+MED.m2.intro+'</p>';
    for (var i=0;i<MED.m2.dims.length;i++){
      var dm = MED.m2.dims[i];
      h += '<div class="qrow"><span class="qlabel">'+dm[1]+'</span>'+selHTML("m2."+dm[0], MED.m2.arts, "Artifact for "+dm[1])+'</div>';
    }
    return h + docClose();
  },
  check:function(env){
    var want = {"m2.sec":"a","m2.ir":"b","m2.cert":"c","m2.fin":"d","m2.legal":"e","m2.fourth":"f"};
    var wrong = [];
    for (var k in want){ if (env[k] !== want[k]){ wrong.push(k.split(".")[1]); } }
    if (wrong.length){ return {ok:false, msg:"Not yet — check the mapping for: "+wrong.join(", ")+". Read each artifact for what it actually proves: a questionnaire shows the security posture claimed; a runbook plus real post-mortems shows incident response practiced; an SOC 2 + ISO certificate shows independent certification; audited statements show financial stability; litigation and breach history shows legal exposure; the subcontractor list shows fourth parties."}; }
    return {ok:true};
  }
});

/* OBJ-M3 — conflict of interest */
OBJ_MED.push({
  id:"OBJ-M3", phase:1, pillar:"P2",
  title:"Resolve the selection-committee conflict of interest.",
  desc:"The Nimbus committee has a conflict problem. Choose MVHN's response.",
  hints:[
    "Whose behavior is the conflict about — the vendor's, or the evaluator's?",
    "A conflict of interest is handled by disclosure and recusal. The bidder did nothing wrong.",
    "Disclose, document, recuse — Nimbus remains a finalist."
  ],
  ok:"Stamped. The conflict belongs to the evaluator, not the vendor: disclosure + documentation + recusal protects the integrity of scoring while Nimbus stays in the process. Disqualification would punish the bidder for someone else's stake — and a 'promise of neutrality' is not a control.",
  render:function(){
    var h = docOpen({id:"m3", title:"Evaluation committee — conflict of interest", look:"m2", lookLabel:"the diligence file"}, MED.m3.kind);
    h += '<div class="paperquote">'+MED.m3.text+'</div>' + optHTML("m3.choice", MED.m3.options, "radio", "Conflict of interest response options");
    return h + docClose();
  },
  check:function(env){
    if (env["m3.choice"] !== "recuse"){ return {ok:false, msg:"Not yet. A conflict of interest is resolved by disclosure and recusal of the conflicted evaluator — never by disqualifying the bidder (who did nothing wrong), never by trusting a verbal promise of neutrality, and canceling a whole procurement is disproportionate."}; }
    return {ok:true};
  }
});

/* OBJ-M4 — agreement types */
OBJ_MED.push({
  id:"OBJ-M4", phase:2, pillar:"P1",
  title:"Assign all seven agreement types to the roles they play in MVHN's relationships.",
  desc:"Seven role descriptions, seven agreement types — each used exactly once. Get the pairings right and the Nimbus contract stack almost writes itself.",
  hints:[
    "Two roles are about internal commitments vs. a single target inside them (SLA vs. SLO). Two are the informal vs. binding inter-org pair (MOU vs. MOA).",
    "Umbrella → MSA; deliverables → SOW; enforceable commitments → SLA; one measurable target → SLO; confidentiality first → NDA; non-binding understanding → MOU; formal binding obligations → MOA.",
    "r1 MSA, r2 SOW, r3 SLA, r4 SLO, r5 NDA, r6 MOU, r7 MOA."
  ],
  ok:"Stamped. Together these seven documents are the contract stack: MSA (umbrella) + SOW (the work) + SLA with measurable SLOs (the promises) + NDA (confidentiality), with MOU/MOA reserved for inter-organization understandings — informal vs. binding. The exam will hand you realistic snippets and ask you to name the instrument; you just practiced exactly that.",
  render:function(){
    var h = docOpen({id:"m4", title:"The Nimbus engagement — agreement drawer", look:"primer", lookLabel:"the background readings"}, MED.m4.kind);
    h += '<p style="font-size:14.5px;color:var(--ink-soft)">'+MED.m4.intro+'</p>';
    for (var i=0;i<MED.m4.roles.length;i++){
      var r = MED.m4.roles[i];
      h += '<div class="qrow"><span class="qlabel">'+r[1]+'</span>'+selHTML("m4."+r[0], MED.m4.types, "Agreement type for role "+r[0])+'</div>';
    }
    return h + docClose();
  },
  check:function(env){
    var want = {"m4.r1":"MSA","m4.r2":"SOW","m4.r3":"SLA","m4.r4":"SLO","m4.r5":"NDA","m4.r6":"MOU","m4.r7":"MOA"};
    var wrong = [];
    for (var k in want){ if (env[k] !== want[k]){ wrong.push(k.split(".")[1]); } }
    if (wrong.length){ return {ok:false, msg:"Not yet — roles out of place: "+wrong.join(", ")+". Anchor each role to its function: legal umbrella (MSA) vs. specific work (SOW); the whole commitments contract (SLA) vs. one measurable target inside it (SLO); confidentiality (NDA); and the inter-org pair — non-binding understanding (MOU) vs. formal binding obligations (MOA)."}; }
    return {ok:true};
  }
});

/* OBJ-M5 — SLO selection */
OBJ_MED.push({
  id:"OBJ-M5", phase:2, pillar:"P3",
  title:"Select every clause that is a measurable SLO for the Boreal SLA — reject the vague ones.",
  desc:"An SLO the monthly report cannot grade is not a commitment. Check exactly the clauses that state measurable targets; leave the imposter clauses unchecked.",
  hints:[
    "A measurable SLO has a metric, a threshold, and a measurement window. Read clause s5 again — can you grade 'unnecessary delay'?",
    "s3 is a remedy (what happens on a miss), not a target; s4 is marketing language. Targets name a number and a clock.",
    "Select s1, s2 and s6 only."
  ],
  ok:"Stamped. Each accepted clause can be graded from a monthly report: 99.95% uptime, 15-minute response, 24-hour notification. The rejected ones teach the boundary — remedies (credits) live in the SLA too, but they are consequences, not targets; and 'without unnecessary delay' is unenforceable precisely because no report can measure it.",
  render:function(){
    var h = docOpen({id:"m5", title:"Boreal Cloud Hosting — drafting the SLOs", look:"m4", lookLabel:"the agreement drawer"}, MED.m5.kind);
    h += '<p style="font-size:14.5px;color:var(--ink-soft)">'+MED.m5.intro+'</p>';
    var opts = []; for (var i=0;i<MED.m5.clauses.length;i++){ opts.push([MED.m5.clauses[i][0], MED.m5.clauses[i][1]]); }
    h += optHTML("m5sel", opts, "check", "SLO candidate clauses");
    return h + docClose();
  },
  check:function(env){
    var want = ["s1","s2","s6"];
    for (var i=0;i<want.length;i++){ if (env["m5sel."+want[i]] !== "on"){ return {ok:false, msg:"Not yet — clause "+want[i].toUpperCase()+" states a real, measurable target (metric + threshold + window), so it belongs in the SLO set. Re-read the candidates with this test: could a monthly report grade this clause to met/missed?"}; } }
    var bad = []; var all = ["s3","s4","s5"];
    for (var j=0;j<all.length;j++){ if (env["m5sel."+all[j]] === "on"){ bad.push(all[j].toUpperCase()); } }
    if (bad.length){ return {ok:false, msg:"Not yet — "+bad.join(", ")+" is not an SLO: s3 is a remedy (the consequence of a miss), s4 is marketing language, s5 has no measurable clock ('unnecessary delay' cannot be graded). Keep remedies in the SLA, but do not count them as targets."}; }
    return {ok:true};
  }
});

/* OBJ-M6 — right to audit */
OBJ_MED.push({
  id:"OBJ-M6", phase:2, pillar:"P4",
  title:"Choose which relationships need a right-to-audit clause, and what the clause actually buys.",
  desc:"Right-to-audit clauses cost goodwill, so MVHN spends them where risk justifies. Check the relationships that should carry the clause, then select what the clause entitles MVHN to do.",
  hints:[
    "Match risk: who touches PHI or shares incident data — and who touches only coffee?",
    "The clause is about assurance: auditing the vendor's controls, or reviewing their independent audit reports.",
    "Check v1 (Nimbus) and v2 (County EMS); enable = audit."
  ],
  ok:"Stamped. Right-to-audit is a contractual permission to verify — audit the vendor's controls or review their independent audit reports on agreed notice. It is not unlimited facility access, not free testing, and not a termination right. Reserve it for relationships where you cannot otherwise see risk: PHI systems and shared-response partners — not the coffee supplier.",
  render:function(){
    var h = docOpen({id:"m6", title:"Right-to-audit — where it belongs", look:"m4", lookLabel:"the agreement drawer"}, MED.m6.kind);
    h += '<p style="font-size:14.5px;color:var(--ink-soft)">'+MED.m6.intro+'</p>';
    h += '<div class="qrow"><span class="qlabel">Which relationships carry the clause?</span>' + optHTML("m6v", MED.m6.vendors, "check", "Vendors") + '</div>';
    h += '<div class="qrow"><span class="qlabel">What does the clause entitle MVHN to do?</span>' + optHTML("m6.enable", MED.m6.enable, "radio", "What right-to-audit enables") + '</div>';
    return h + docClose();
  },
  check:function(env){
    if (env["m6v.v1"] !== "on" || env["m6v.v2"] !== "on"){ return {ok:false, msg:"Not yet — the clause belongs where MVHN cannot otherwise see risk: Nimbus (hosts PHI, 24×7 clinical dependency) and the County EMS partnership (shared incident data). The coffee supplier has no systems and no data; a right-to-audit there is pure friction."}; }
    if (env["m6v.v3"] === "on"){ return {ok:false, msg:"Not yet — the coffee supplier has no systems access and no data. Right-to-audit clauses are spent where risk justifies the friction, not on every vendor."}; }
    if (env["m6.enable"] !== "audit"){ return {ok:false, msg:"Not yet on the second part — the clause entitles MVHN to audit the vendor's controls or review their independent audit reports on agreed notice. It is not unlimited facility access, not a free penetration test, and not a termination right."}; }
    return {ok:true};
  }
});

/* ---------------- Medium objectives 7–12 ---------------- */
var OBJ_MED2 = [];

/* OBJ-M7 — SLA report triage */
OBJ_MED2.push({
  id:"OBJ-M7", phase:4, pillar:"P3",
  title:"Triage Boreal's monthly SLA report: mark every commitment Met or Missed, and choose the follow-up for each miss.",
  desc:"Service-level monitoring is measurement against targets, then action on misses. Read the measured column carefully — two rows are misses that a rushed reader would pass.",
  hints:[
    "Compare each measured value with its threshold: 99.71 < 99.95 (miss); 31 > 24 (miss); delivered on the 9th vs. the 5th business day (miss).",
    "Misses that breach service or security targets earn credits plus a remediation plan; minor administrative misses get logged and watched.",
    "Verdicts: row1 missed, row2 met, row3 missed, row4 met, row5 missed. Actions: rows 1 and 3 → credits + remediation; row 5 → log and watch."
  ],
  ok:"Stamped. This is service-level monitoring doing its job: three missed SLOs, each with a proportionate follow-up — credits and a remediation plan for the availability and notification breaches, a logged watch for the late report. Trend it month over month; repeated misses are registry-tier evidence.",
  render:function(){
    var h = docOpen({id:"m7", title:"Boreal Cloud Hosting — monthly SLA report (September)", look:"m5", lookLabel:"the SLOs you drafted"}, MED.m7.kind);
    h += '<p style="font-size:14.5px;color:var(--ink-soft)">'+MED.m7.intro+'</p>';
    h += '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:14px" aria-label="Boreal monthly SLA report">';
    h += '<caption class="sr-only">Boreal monthly SLA report with targets, measured values, verdict and follow-up columns</caption>';
    h += '<tr>'+(function(){var t="";for(var i=0;i<MED.m7.cols.length;i++){t+='<th scope="col" style="text-align:left;padding:8px 10px;border-bottom:2px solid var(--line);font-family:var(--serif)">'+MED.m7.cols[i]+'</th>';}return t;})()+'</tr>';
    for (var i=0;i<MED.m7.rows.length;i++){
      var r = MED.m7.rows[i];
      h += '<tr><td style="padding:8px 10px;border-bottom:1px solid var(--line)">'+r.slo+'</td>'+
        '<td style="padding:8px 10px;border-bottom:1px solid var(--line);font-family:var(--mono)">'+r.val+'</td>'+
        '<td style="padding:8px 10px;border-bottom:1px solid var(--line)">'+selHTML("m7."+r.id+".verdict", MED.m7.verdicts, "Verdict for "+r.slo)+'</td>'+
        '<td style="padding:8px 10px;border-bottom:1px solid var(--line)">'+selHTML("m7."+r.id+".action", MED.m7.actions, "Follow-up for "+r.slo)+'</td></tr>';
    }
    h += '</table></div>';
    return h + docClose();
  },
  check:function(env){
    var want = {"row1":["missed","credit"],"row2":["met","none"],"row3":["missed","credit"],"row4":["met","none"],"row5":["missed","log"]};
    for (var k in want){
      if (env["m7."+k+".verdict"] !== want[k][0]){
        return {ok:false, msg:"Not yet — re-grade row "+k.slice(3)+" by comparing the measured value with the threshold: 99.71% < 99.95%, 31 h > 24 h, delivered on the 9th vs. the 5th business day are all misses; 9 min ≤ 15 min and 22 d ≤ 30 d are met."};
      }
      if (want[k][0] === "missed" && env["m7."+k+".action"] !== want[k][1]){
        return {ok:false, msg:"Verdict accepted for row "+k.slice(3)+", but the follow-up is off: availability and security-notification breaches earn service credits plus a remediation plan; a late administrative report is logged and watched for a repeat."};
      }
      if (want[k][0] === "met" && env["m7."+k+".action"] !== "none"){
        return {ok:false, msg:"Row "+k.slice(3)+" was met — met commitments need no action. Save credits for misses."};
      }
    }
    return {ok:true};
  }
});

/* OBJ-M8 — vendor registry */
OBJ_MED2.push({
  id:"OBJ-M8", phase:4, pillar:"P3",
  title:"File four vendors into the registry with the right tier and data access — then allocate the deep-assessment hours.",
  desc:"The registry is the authoritative inventory: who touches what data, who owns the relationship, what tier applies. Tier follows data access and business dependency — then assessment depth follows tier (that is how two analysts survive 140 vendors).",
  hints:[
    "Ask two questions per vendor: does it store or process PHI? Does clinical work stop when it does?",
    "Nimbus (stores PHI, clinical dependency) and Boreal (processes PHI, hosts the portal) are Critical; Corvus is High (limited PHI); Talon is Low (no PHI).",
    "Deepest assessment goes to the Critical tier first: Nimbus and Boreal."
  ],
  ok:"Stamped. Tier is a function of data access plus business dependency — Nimbus stores PHI and carries clinical dependency; Boreal processes PHI for the portal; Corvus processes limited PHI; Talon touches none. And depth follows tier: the 12 assessment hours go to Critical vendors first. That proportionality is the answer to the staffing limitation, not a workaround of it.",
  render:function(){
    var h = docOpen({id:"m8", title:"Vendor registry — Q3 filing", look:"m2", lookLabel:"Nimbus's diligence file"}, MED.m8.kind);
    h += '<p style="font-size:14.5px;color:var(--ink-soft)">'+MED.m8.intro+'</p>';
    var keys = ["nimbus","corvus","boreal","talon"];
    for (var i=0;i<MED.m8.vendors.length;i++){
      var v = MED.m8.vendors[i], k = keys[i];
      h += '<div class="qrow"><span class="qlabel">'+v[0]+'</span><div class="paperquote">'+v[1]+'</div>'+
        '<div style="display:flex;gap:10px;flex-wrap:wrap"><div style="flex:1;min-width:200px">'+selHTML("m8."+k+".tier", MED.m8.tiers, "Risk tier for "+v[0])+'</div>'+
        '<div style="flex:1;min-width:200px">'+selHTML("m8."+k+".access", MED.m8.access, "Data access for "+v[0])+'</div></div></div>';
    }
    h += '<div class="qrow"><span class="qlabel">'+MED.m8.depthQ+'</span>' + optHTML("m8.depth", MED.m8.depthOpts, "radio", "Assessment depth decision") + '</div>';
    return h + docClose();
  },
  check:function(env){
    var want = {"nimbus":["critical","stores"],"corvus":["high","processes"],"boreal":["critical","processes"],"talon":["low","none"]};
    for (var k in want){
      if (env["m8."+k+".tier"] !== want[k][0]){ return {ok:false, msg:"Not yet — re-read the "+k.toUpperCase()+" row with the tier test (data access + business dependency). Talon touches no PHI (Low); Corvus processes limited PHI (High); Nimbus stores PHI with 24×7 clinical dependency and Boreal hosts the patient portal (Critical)."}; }
      if (env["m8."+k+".access"] !== want[k][1]){ return {ok:false, msg:"Not yet — the data-access level for "+k.toUpperCase()+" is off. Nimbus stores PHI as a system of record; Corvus and Boreal process or transmit PHI; Talon has no PHI access."}; }
    }
    if (env["m8.depth"] !== "critical-first"){ return {ok:false, msg:"Not yet on assessment depth — with two analysts and 12 hours, depth follows tier: Nimbus and Boreal (Critical) are assessed first. 'Equal depth for all' is how registries rot."}; }
    return {ok:true};
  }
});

/* OBJ-M9 — attestation verification */
OBJ_MED2.push({
  id:"OBJ-M9", phase:3, pillar:"P3",
  title:"Verify Nimbus's four assurance artifacts: accept or reject each, with a reason for every rejection.",
  desc:"Compliance attestation is independent evidence — but only if the type, the period and the scope fit. The engagement starts next month; audit each artifact and stamp your verdict.",
  hints:[
    "Check three things per artifact: who produced it (independent?), what it tests (design vs. operating effectiveness), and when its period ends.",
    "A SOC 2 Type II covering the year to 2026-03-31 is current enough for a Q3 engagement; a Type I 'as of' a date 13+ months back is not.",
    "Accept a1 and a3; reject a2 (Type I + stale — reason r22) and a4 (self-written — reason r42)."
  ],
  ok:"Stamped. The two survivors share the same anatomy: an independent auditor, testing beyond design (Type II operating effectiveness over a period; ISO 27001 certification), scoped to the platform MVHN actually buys. The rejects fail in kind: a Type I 'as of' a stale date proves design on one day, and a vendor-written pen test summary is self-assessment — not third-party assurance.",
  render:function(){
    var h = docOpen({id:"m9", title:"Nimbus Chart Systems — assurance drawer", look:"m2", lookLabel:"the diligence file"}, MED.m9.kind);
    h += '<p style="font-size:14.5px;color:var(--ink-soft)">'+MED.m9.intro+'</p>';
    for (var i=0;i<MED.m9.arts.length;i++){
      var a = MED.m9.arts[i];
      h += '<div class="qrow"><span class="qlabel">Artifact '+a.id.toUpperCase()+'</span><div class="paperquote">'+a.text+'</div>'+
        '<div style="display:flex;gap:14px;flex-wrap:wrap"><label class="choice" style="min-width:130px"><input type="radio" name="g_m9.'+a.id+'" data-env="m9.'+a.id+'" value="accept"><span>Accept as evidence</span></label>'+
        '<label class="choice" style="min-width:130px"><input type="radio" name="g_m9.'+a.id+'" data-env="m9.'+a.id+'" value="reject"><span>Reject</span></label></div>';
      if (a.reasons){
        h += '<div style="padding-left:4px">'+selHTML("m9."+a.id+".reason", a.reasons, "Reason for rejecting "+a.id)+'</div>';
      }
      h += '</div>';
    }
    return h + docClose();
  },
  check:function(env){
    var want = {"a1":"accept","a3":"accept","a2":"reject","a4":"reject"};
    for (var k in want){
      if (env["m9."+k] !== want[k]){ return {ok:false, msg:"Not yet — verdict on artifact "+k.toUpperCase()+" is off. Ask of each: Is the producer independent? Does it test operating effectiveness, not just design? Is the period current for a Q3 2026 engagement? Is the scope the service MVHN buys?"}; }
    }
    if (env["m9.a2.reason"] !== "r22"){ return {ok:false, msg:"The a2 verdict stands, but pick the reason: a SOC 2 Type I tests control design only, at a single point in time — and September 2024 is over a year stale for a Q3 2026 engagement."}; }
    if (env["m9.a4.reason"] !== "r42"){ return {ok:false, msg:"The a4 verdict stands, but pick the reason: a summary written by the vendor's own engineers is self-assessment. Third-party assurance requires an independent third party."}; }
    return {ok:true};
  }
});

/* OBJ-M10 — ROE assembly */
OBJ_MED2.push({
  id:"OBJ-M10", phase:3, pillar:"P4",
  title:"Assemble the ROE for the Kestrel pen test: select exactly the six clauses that belong.",
  desc:"A pen test of vendor-hosted systems only happens inside rules of engagement. Check the six clauses that belong in the ROE; leave out the four that violate scope, legal, or environment limits — the debrief will name each violated limitation.",
  hints:[
    "Two clauses overreach the physical/shared environment; one violates PHI law; one attacks MVHN's own staff.",
    "In scope: the MVHN tenant, agreed techniques and windows, escalation contacts, synthetic data, report-and-demonstrate handling.",
    "Select c1–c6; leave c7 (physical, shared datacenter), c8 (social engineering), c9 (real PHI), c10 (other tenants) out."
  ],
  ok:"Stamped. This ROE encodes three limitations by design: environment (a multitenant platform is not yours to probe — other tenants stay out of scope and isolation is verified via Nimbus attestations), legal/regulatory (real PHI never becomes attack data), and scope discipline (no physical, no social engineering). Out-of-scope findings get reported, not pursued — that rule is what keeps the test lawful.",
  render:function(){
    var h = docOpen({id:"m10", title:"Kestrel Cyber Testing — assemble the ROE", look:"primer", lookLabel:"the background readings"}, MED.m10.kind);
    h += '<p style="font-size:14.5px;color:var(--ink-soft)">'+MED.m10.intro+'</p>';
    var opts = []; for (var i=0;i<MED.m10.clauses.length;i++){ opts.push([MED.m10.clauses[i][0], MED.m10.clauses[i][1]]); }
    h += optHTML("m10sel", opts, "check", "ROE clause bank");
    return h + docClose();
  },
  check:function(env){
    var good = ["c1","c2","c3","c4","c5","c6"], bad = ["c7","c8","c9","c10"];
    for (var i=0;i<good.length;i++){ if (env["m10sel."+good[i]] !== "on"){ return {ok:false, msg:"Not yet — clause "+good[i].toUpperCase()+" is core ROE material (scope, techniques, window, contacts, data handling, or findings handling). A test without it is uncontrolled."}; } }
    for (var j=0;j<bad.length;j++){ if (env["m10sel."+bad[j]] === "on"){ return {ok:false, msg:"Not yet — clause "+bad[j].toUpperCase()+" violates a limit: c7 and c10 exceed the environment (a shared datacenter and other tenants are never MVHN's to test), c8 attacks MVHN staff rather than systems, c9 turns PHI into attack data (legal/regulatory limit). Out-of-scope findings are reported, not pursued."}; } }
    return {ok:true};
  }
});

/* OBJ-M11 — limitations desk */
OBJ_MED2.push({
  id:"OBJ-M11", phase:4, pillar:"P4",
  title:"Name the limitation in each of the four constraint cases, and pick the proportionate response.",
  desc:"The exam lists eight limitations on third-party risk management. Four real cases are on the desk — match each to its limitation category, then choose the response a professional program would defend.",
  hints:[
    "The category names are literal: staffing = too few people; resource = no SMEs/lab/window; geography = other jurisdictions; ROI = control cost vs. expected loss.",
    "Proportionate responses work with the constraint (tiering, contracts, scheduling, documented acceptance) rather than ignoring it.",
    "case1: staffing — tier the registry (middle option). case2: geography — contract data-residency (last option). case3: ROI — the proportionate control (first option). case4: resource — reschedule and lean on attestations (middle option)."
  ],
  ok:"Stamped. Four limitations, four proportionate responses: tiering under staffing limits, contractual data-residency under jurisdiction limits, documented risk acceptance under ROI limits, and rescheduling plus attestation reliance under resource limits. Naming the limitation is half the exam question; knowing the professional response is the other half.",
  render:function(){
    var h = docOpen({id:"m11", title:"Limitations desk — four cases", look:"primer", lookLabel:"the limitations reading"}, MED.m11.kind);
    h += '<p style="font-size:14.5px;color:var(--ink-soft)">'+MED.m11.intro+'</p>';
    for (var i=0;i<MED.m11.cases.length;i++){
      var c = MED.m11.cases[i];
      h += '<div class="qrow"><span class="qlabel">Case '+(i+1)+'</span><div class="paperquote">'+c.text+'</div>'+
        '<div style="display:flex;gap:10px;flex-wrap:wrap"><div style="flex:1;min-width:220px">'+selHTML("m11."+c.id+".limit", MED.m11.limitOpts, "Limitation category for case "+(i+1))+'</div>'+
        '<div style="flex:1;min-width:220px">'+selHTML("m11."+c.id+".resp", MED.m11.respOpts[c.id], "Response for case "+(i+1))+'</div></div></div>';
    }
    return h + docClose();
  },
  check:function(env){
    var want = {"case1":"staffing","case2":"geography","case3":"roi","case4":"resource"};
    for (var k in want){
      if (env["m11."+k+".limit"] !== want[k]){ return {ok:false, msg:"Not yet — re-read case "+k.slice(4)+" against the category names: staffing (too few analysts), geography/jurisdiction (datacenter in another jurisdiction), financial/ROI ($250k control vs. $90k/year expected loss), resource availability (no SMEs, no lab, no window)."}; }
      if (env["m11."+k+".resp"] !== "resp1"){ return {ok:false, msg:"The category is right for case "+k.slice(4)+", but the response must work with the constraint — tier the registry, write residency clauses, document accepted residual risk, or reschedule and rely on attestations. Ignoring, over-spending, or dropping vendors are all ways programs fail."}; }
    }
    return {ok:true};
  }
});

/* OBJ-M12 — vendor lock-in */
OBJ_MED2.push({
  id:"OBJ-M12", phase:4, pillar:"P2",
  title:"Pick the clauses that reduce Talon lock-in, and name the core risk.",
  desc:"Three years of print queues, rules and accounting live in Talon's proprietary world. Renewal is due — check exactly the four clauses that protect MVHN's exit, then name the core lock-in risk.",
  hints:[
    "Exit protection looks like: open data, paid-for transition help, escrowed keys to the kingdom, and an honest annual exit-cost review.",
    "x5 and x6 deepen dependence — one accepts the formats as-is, the other penalizes leaving.",
    "Select x1–x4; risk = proprietary formats and server make migration slow and costly."
  ],
  ok:"Stamped. Lock-in is the gap between how fast MVHN could leave Talon and how fast it would need to. Open documented exports, pre-agreed transition assistance, escrow, and annual exit-cost reviews narrow that gap; proprietary-format acceptance and punitive auto-renewal widen it. Exit clauses are cheapest at renewal time and most expensive during an incident.",
  render:function(){
    var h = docOpen({id:"m12", title:"Talon Managed Print — the lock-in review", look:"m8", lookLabel:"the registry filing"}, MED.m12.kind);
    h += '<p style="font-size:14.5px;color:var(--ink-soft)">'+MED.m12.intro+'</p>';
    var opts = []; for (var i=0;i<MED.m12.clauses.length;i++){ opts.push([MED.m12.clauses[i][0], MED.m12.clauses[i][1]]); }
    h += '<div class="qrow"><span class="qlabel">Renewal clauses</span>' + optHTML("m12sel", opts, "check", "Renewal clause bank") + '</div>';
    h += '<div class="qrow"><span class="qlabel">'+MED.m12.riskQ+'</span>' + optHTML("m12.risk", MED.m12.riskOpts, "radio", "Core lock-in risk") + '</div>';
    return h + docClose();
  },
  check:function(env){
    var good = ["x1","x2","x3","x4"], bad = ["x5","x6"];
    for (var i=0;i<good.length;i++){ if (env["m12sel."+good[i]] !== "on"){ return {ok:false, msg:"Not yet — clause "+good[i].toUpperCase()+" is exit protection: open documented exports, transition assistance, escrow, or an exit-cost review. All four narrow the gap between how fast MVHN could leave and how fast it would need to."}; } }
    for (var j=0;j<bad.length;j++){ if (env["m12sel."+bad[j]] === "on"){ return {ok:false, msg:"Not yet — clause "+bad[j].toUpperCase()+" deepens the lock-in: accepting proprietary formats and penalizing early exit both widen MVHN's dependence. They are the opposite of exit protection."}; } }
    if (env["m12.risk"] !== "risk1"){ return {ok:false, msg:"Name the core risk precisely: print queues, rules and accounting exist only in Talon's proprietary formats and server — migrating away is slow and costly. That dependence is what every selected clause reduces."}; }
    return {ok:true};
  }
});

/* ---------------- Hard-mode objectives (War Room) ---------------- */
var OBJ_HARD = [];

/* OBJ-H1 — evidence triage */
OBJ_HARD.push({
  id:"OBJ-H1", pillar:"P2",
  title:"Triage the intake tray: select every item material to deciding MVHN's response.",
  desc:"Seven items arrived overnight. Two are red herrings — real documents about the wrong vendors. Material evidence is what changes the response: what happened, what was exposed, what the contract says, what the record shows.",
  nudge:"A material item either describes the incident and exposure, or shows what MVHN's protections and records actually say. One red herring is good news about an unrelated vendor; the other is routine paperwork.",
  ok:"Triage stamped: E1–E5 are material — incident facts (E1), contractual protections (E2), the subcontractor's own account (E3), MVHN's record (E4), and the assurance on offer (E5). E6 is routine paperwork for an unrelated vendor and E7 is good news about a different vendor entirely: both would have burned war-room time. This is exactly why intake triage is a skill, not a formality.",
  render:function(){
    var h = docOpen({id:"h1", title:"Intake tray — overnight arrivals", kind:"training data — fictional"}, "evidence triage");
    h += '<p style="font-size:14.5px;color:var(--ink-soft)">'+HARD.h1.intro+'</p>';
    h += '<div class="tray">';
    for (var i=0;i<HARD.tray.length;i++){
      var t = HARD.tray[i];
      h += '<label class="tray-item"><input type="checkbox" data-env="h1.'+t.id+'" value="on"><span><b>'+t.title+'</b> — '+t.summary+'</span></label>';
    }
    h += '</div>';
    for (var j=0;j<HARD.tray.length;j++){
      var t2 = HARD.tray[j];
      h += '<details class="ev" id="ev-'+t2.id+'"'+(t2.open?" open":"")+'><summary>'+t2.title+' — read the full item</summary><div class="ev-body">';
      var body = HARD.evidence[t2.id];
      for (var k=0;k<body.length;k++){ h += '<div class="paperquote">'+body[k]+'</div>'; }
      h += '</div></details>';
    }
    return h + docClose();
  },
  check:function(env){
    var mat = ["e1","e2","e3","e4","e5"], herr = ["e6","e7"];
    for (var i=0;i<herr.length;i++){ if (env["h1."+herr[i]] === "on"){ return {ok:false, msg:"Rejected — E"+herr[i].slice(1)+" is a red herring: it is genuine paperwork, but about an unrelated vendor with no bearing on the Peregrine incident. Material evidence describes the incident, the exposure, the contract, MVHN's record, or the assurance on offer."}; } }
    for (var j=0;j<mat.length;j++){ if (env["h1."+mat[j]] !== "on"){ return {ok:false, msg:"Not yet — E"+mat[j].slice(1)+" is material and unaccounted for. Walk the response questions again: What happened and what was exposed? What does the contract actually promise? What does MVHN's own record say? What independent assurance exists?"}; } }
    return {ok:true};
  }
});

/* OBJ-H2 — fourth party + registry failure */
OBJ_HARD.push({
  id:"OBJ-H2", pillar:"P2",
  title:"Name the fourth party, the document that proves it, and the registry failure that hid it.",
  desc:"Three parts, all exact: (1) the subcontractor's name; (2) which tray item names it and its role; (3) why MVHN's registry never flagged this vendor.",
  nudge:"The name is in the notification letter. The registry failure is about a tier that no longer matched the data access recorded on the same card.",
  ok:"Stamped. SwiftFreight Line is the fourth party — named and described in E1 (Peregrine's letter); E2's clause 11 merely shows subcontracting was permitted at Peregrine's discretion. The registry failure is the deeper lesson: Peregrine's data access (patient-address manifests) was recorded at onboarding, yet the tier stayed Low and was 'never revisited' — so assessment and monitoring never applied. A registry that is not re-tiered is a fiction.",
  render:function(){
    var h = docOpen({id:"h2", title:"Challenge 2 · Fourth party & registry failure", kind:"multi-part — exact answers"}, "identification");
    h += '<div class="qrow"><span class="qlabel">1 · Name the fourth party (the subcontractor operating Peregrine\'s overnight routes)</span>'+
      '<input class="text-in" type="text" data-env="h2.name" aria-label="Fourth party name" autocomplete="off" spellcheck="false"></div>';
    h += '<div class="qrow"><span class="qlabel">2 · Which tray item names the fourth party and describes its role?</span>' + optHTML("h2.doc", [["e2","E2 — Peregrine contract binder"],["e3","E3 — SwiftFreight press notice"],["e1","E1 — Peregrine breach notification letter"],["e7","E7 — Boreal SLA report"]], "radio", "Document naming the fourth party") + '</div>';
    h += '<div class="qrow"><span class="qlabel">3 · What registry failure let this vendor go unassessed?</span>' + optHTML("h2.fail", [
      ["no-field", "The registry had no tier field at all"],
      ["mis-tier", "Tiered Low despite recorded PHI access — never revisited"],
      ["never-read", "Nobody reads the registry — paperwork only"],
      ["never-onboarded", "Peregrine was never onboarded into the registry"]
    ], "radio", "Registry failure") + '</div>';
    return h + docClose();
  },
  check:function(env){
    var n = (env["h2.name"]||"").toLowerCase().replace(/[^a-z]/g,"");
    if (n !== "swiftfreight" && n !== "swiftfreightline"){ return {ok:false, msg:"Rejected — '"+(env["h2.name"]||"blank")+"' is not the fourth party. Re-read E1: the subcontractor operating Peregrine's regional overnight routes is named in the first sentences."}; }
    if (env["h2.doc"] !== "e1"){ return {ok:false, msg:"Rejected — E1 is the only item that names SwiftFreight and describes its role (operating the overnight routes). E2's clause 11 only shows subcontracting was permitted; E3 talks about SwiftFreight but is its own spin, not the identification."}; }
    if (env["h2.fail"] !== "mis-tier"){ return {ok:false, msg:"Rejected — read E4 again: the tier field exists, Peregrine IS in the registry, and its PHI access was recorded at onboarding. The failure is that the tier stayed Low while the data access was patient manifests — a mis-tiering that was 'never revisited', so assessment and monitoring never applied."}; }
    return {ok:true};
  }
});

/* OBJ-H3 — contract gap analysis */
OBJ_HARD.push({
  id:"OBJ-H3", pillar:"P1",
  title:"Identify exactly the three missing contract protections that made this incident worse.",
  desc:"E2's binder is missing three protections. Select exactly those three from the options — near-misses are rejected with a reason.",
  nudge:"One gap is about knowing promptly; one is about verifying; one is about the subcontractor chain. Three of the eight options are plausible-sounding but wrong tools.",
  ok:"Stamped. Three absences, three consequences: no incident-notification SLO meant MVHN learned ~17 hours after confirmation — by courtesy, not by contract; no right-to-audit meant MVHN could not compel verification of Peregrine's or SwiftFreight's claims; no fourth-party flow-down meant the subcontractor chain carried none of MVHN's security obligations. Contract language is preventive control — these gaps were preventable in 2023.",
  render:function(){
    var h = docOpen({id:"h3", title:"Challenge 3 · Contract gap analysis (E2)", look:"h1", lookLabel:"the contract binder (E2)"}, "exact set — 3 of 8");
    h += '<p style="font-size:14.5px;color:var(--ink-soft)">'+HARD.h3.intro+'</p>' + optHTML("h3sel", HARD.h3.opts, "check", "Missing protections");
    return h + docClose();
  },
  check:function(env){
    var good = ["gap-notify","gap-audit","gap-fourth"], badMap = {
      "gap-mou":"an MOU with SwiftFreight — MVHN has no relationship (no privity) with its vendor's subcontractor; an MOU is the wrong instrument and would not bind anyway",
      "gap-rfq":"an RFQ prices replacement couriers — it adds no protection to the existing contract",
      "gap-msa":"a second MSA layered on the first adds nothing — the fix is clauses IN the existing MSA",
      "gap-uptime":"the tracking-portal uptime SLO already exists in the SLA — and portal uptime is not the gap this incident exploited",
      "gap-escrow":"source-code escrow for dispatch software is irrelevant — no MVHN dependency on that code exists"
    };
    for (var i=0;i<good.length;i++){ if (env["h3sel."+good[i]] !== "on"){ return {ok:false, msg:"Not yet — one of the three real gaps is missing. Walk E2 clause by clause: what does the SLA say about security-incident notification (nothing)? What audit rights exist (none)? What binds SwiftFreight to MVHN's security requirements (nothing — clause 11 allows subcontracting 'at its discretion')?"}; } }
    for (var k in badMap){ if (env["h3sel."+k] === "on"){ return {ok:false, msg:"Rejected — "+k+" is "+badMap[k]+"."}; } }
    return {ok:true};
  }
});

/* OBJ-H4 — the skipped diligence check */
OBJ_HARD.push({
  id:"OBJ-H4", pillar:"P1",
  title:"Name the due-diligence check that would have caught this — and the evidence to demand going forward.",
  desc:"Peregrine onboarded in 2023 under older standards. Two exact answers.",
  nudge:"The exposure came through a subcontractor. Which diligence dimension asks about exactly that?",
  ok:"Stamped. Fourth-party disclosure during due diligence is the check that was skipped: in 2023 nobody asked 'who else touches this data?' Going forward the demand is specific — a current SOC 2 Type II scoped to the freight operations (not corporate IT), plus contractual flow-down so security obligations bind the subcontractor. Financial statements, references and litigation searches are real diligence dimensions; none of them surfaces a fourth party.",
  render:function(){
    var h = docOpen({id:"h4", title:"Challenge 4 · The diligence check that was skipped", look:"h1", lookLabel:"the notification letter and binder"}, "two exact answers");
    h += '<p style="font-size:14.5px;color:var(--ink-soft)">'+HARD.h4.intro+'</p>';
    h += '<div class="qrow"><span class="qlabel">'+HARD.h4.q1+'</span>' + optHTML("h4.q1", HARD.h4.q1opts, "radio", "Diligence dimension") + '</div>';
    h += '<div class="qrow"><span class="qlabel">'+HARD.h4.q2+'</span>' + optHTML("h4.q2", HARD.h4.q2opts, "radio", "Evidence to demand") + '</div>';
    return h + docClose();
  },
  check:function(env){
    if (env["h4.q1"] !== "fourth"){ return {ok:false, msg:"Rejected — the exposure reached MVHN data through a subcontractor. Only one diligence dimension asks who else touches the data: fourth-party/subcontractor disclosure. Financials, references and litigation history are legitimate checks, but none would surface SwiftFreight."}; }
    if (env["h4.q2"] !== "ev1"){ return {ok:false, msg:"Rejected — 'a verbal assurance' proves nothing (and is exactly what MVHN relied on in 2023); press notices are marketing; 'nothing' is how this incident happened. Demand the testable evidence: a current SOC 2 Type II scoped to freight operations, plus flow-down obligations."}; }
    return {ok:true};
  }
});

/* OBJ-H5 — containment sequence */
OBJ_HARD.push({
  id:"OBJ-H5", pillar:"P4",
  title:"Sequence the five containment steps in the exact right order.",
  desc:"Click actions from the bank to build the plan; reorder inside the plan with the arrows. Order is exact: contain first, assess exposure second, preserve evidence third, invoke the contract fourth, fix the record last.",
  nudge:"Containment precedes assessment; the registry fix is administrative and comes after the legal steps, not before them.",
  ok:"Sequence stamped — and the order is the lesson: suspend access first (stop new exposure), assess PHI exposure second (privacy office owns that call), preserve evidence and request the incident report third (before vendors clean up or memories fade), invoke contractual remedies fourth (the MSA is leverage, not a first responder), and re-tier/brief last (fix the record once the facts are established). Sequencing failures usually mean assessment happened before containment, or legal steps came too late.",
  render:function(env){
    var h = docOpen({id:"h5", title:"Challenge 5 · Containment sequence", kind:"sequence — exact order"}, "response actions");
    h += '<p style="font-size:14.5px;color:var(--ink-soft)">'+HARD.h5.intro+'</p>';
    h += '<div id="h5-seq" class="doc-body" style="padding:0">';
    var order = [];
    try { order = env["h5.order"] ? JSON.parse(env["h5.order"]) : []; } catch(e){ order = []; }
    h += '<div style="display:grid;gap:14px;grid-template-columns:1fr 1fr" id="h5-cols">';
    h += '<div class="seq-bank"><b style="font-family:var(--serif)">Action bank</b>';
    for (var i=0;i<HARD.h5.actions.length;i++){
      var a = HARD.h5.actions[i];
      var used = order.indexOf(a[0]) >= 0;
      h += '<button type="button" class="seq-chip" data-seq-add="'+a[0]+'"'+(used?' disabled style="opacity:.45"':'')+'><span class="seq-n">'+(i+1)+'</span><span>'+a[1]+'</span></button>';
    }
    h += '</div><div class="seq-plan"><b style="font-family:var(--serif)">Plan (in order)</b>';
    if (!order.length){ h += '<div class="seq-empty">Click actions on the left to add them, in order.</div>'; }
    for (var j=0;j<order.length;j++){
      var id2 = order[j], label = "";
      for (var m=0;m<HARD.h5.actions.length;m++){ if (HARD.h5.actions[m][0] === id2){ label = HARD.h5.actions[m][1]; } }
      h += '<div class="seq-chip"><span class="seq-n">'+(j+1)+'</span><span>'+label+'</span>'+
        '<span class="seq-ctl"><button type="button" data-seq-up="'+id2+'" aria-label="Move up">↑</button>'+
        '<button type="button" data-seq-down="'+id2+'" aria-label="Move down">↓</button>'+
        '<button type="button" data-seq-remove="'+id2+'" aria-label="Remove from plan">✕</button></span></div>';
    }
    h += '</div></div></div>';
    return h + docClose();
  },
  check:function(env){
    var order = [];
    try { order = env["h5.order"] ? JSON.parse(env["h5.order"]) : []; } catch(e){ order = []; }
    var want = ["a1","a2","a3","a4","a5"];
    if (order.length < want.length){ return {ok:false, msg:"The plan is incomplete — all five actions must be placed before the sequence can be judged."}; }
    for (var i=0;i<want.length;i++){
      if (order[i] !== want[i]){
        return {ok:false, msg:"Rejected at step "+(i+1)+". The required logic: contain first (suspend integrations/API access), assess exposure second (privacy office starts the PHI review), preserve evidence third (request the incident report, legal hold — before anyone cleans up), invoke contractual remedies fourth (breach notice and cure period under the MSA), and re-tier + brief leadership last (administrative, once facts are established)."};
      }
    }
    return {ok:true};
  }
});

/* OBJ-H6 — assurance defects */
OBJ_HARD.push({
  id:"OBJ-H6", pillar:"P3",
  title:"Find the three defects in SwiftFreight's SOC 2 abstract.",
  desc:"E5 is the only independent assurance on the desk. Exactly three defects make it inadequate for freight operations — select those three.",
  nudge:"Judge the report on three axes: report type, report date, and what the scope actually covers.",
  ok:"Stamped — three defects, each fatal in its own way: Type I tests design at one point in time (no operating effectiveness over months); the date (2024-06-30) is over two years stale; and the scope — 'corporate IT and shipping-software development' — never covers the freight and logistics operations that handled the manifests. The named auditor and report length are normal. This is attestation review: type, period, scope — every time.",
  render:function(){
    var h = docOpen({id:"h6", title:"Challenge 6 · Assurance verification (E5)", look:"h1", lookLabel:"the SOC 2 abstract (E5)"}, "exact set — 3 of 6");
    h += '<p style="font-size:14.5px;color:var(--ink-soft)">'+HARD.h6.intro+'</p>' + optHTML("h6sel", HARD.h6.opts, "check", "SOC 2 defects");
    return h + docClose();
  },
  check:function(env){
    var good = ["d1","d2","d3"], bad = {"d4":"the auditor being named is normal and expected — it is how you verify independence","d5":"report length is cosmetic; abstracts are deliberately short","d6":"page numbers are formatting, not assurance"};
    for (var i=0;i<good.length;i++){ if (env["h6sel."+good[i]] !== "on"){ return {ok:false, msg:"Not yet — one real defect is missing. Judge E5 on three axes: report type (Type I vs Type II), report date (how stale?), and scope (does 'corporate IT and shipping-software development' cover the freight operations that held the manifests?)."}; } }
    for (var k in bad){ if (env["h6sel."+k] === "on"){ return {ok:false, msg:"Rejected — "+k+" is "+bad[k]+"."}; } }
    return {ok:true};
  }
});

/* OBJ-H7 — why no direct audit */
OBJ_HARD.push({
  id:"OBJ-H7", pillar:"P3",
  title:"Select exactly the three limitation categories that block a direct MVHN audit of SwiftFreight.",
  desc:"The board asks: 'Why not just audit SwiftFreight ourselves tomorrow?' Three of the eight limitation categories apply — select exactly those.",
  nudge:"Start from the contract: what authority does MVHN have over its vendor's vendor? Then ask where SwiftFreight operates, and what evidence it can offer.",
  ok:"Stamped. No privity (legal/regulatory factors): MVHN has no contract with SwiftFreight, so no authority to audit — rights flow only through Peregrine. Geography/jurisdiction: SwiftFreight's routes and systems sit outside MVHN's jurisdiction. Assurance mechanisms: the only independent evidence on offer is a weak attestation, so MVHN must rely on what Peregrine can compel. Staffing, ROI, lock-in, resources and multitenant environment are real limitations elsewhere — but not the answer to 'why can't we audit them'.",
  render:function(){
    var h = docOpen({id:"h7", title:"Challenge 7 · Why we cannot audit SwiftFreight directly", look:"h1", lookLabel:"the letter and binder"}, "exact set — 3 of 8");
    h += '<p style="font-size:14.5px;color:var(--ink-soft)">'+HARD.h7.intro+'</p>' + optHTML("h7sel", HARD.h7.opts, "check", "Limitation categories");
    return h + docClose();
  },
  check:function(env){
    var good = ["l-legal","l-geo","l-assurance"], bad = {
      "l-lockin":"vendor lock-in concerns proprietary exit costs — not audit authority",
      "l-roi":"ROI limits control spending — not whether an audit is possible",
      "l-staffing":"staffing limits how many assessments you can run — but you still could not audit SwiftFreight with a hundred analysts, because the authority does not exist",
      "l-resource":"resource availability is about SMEs and environments — again, not the blocker here",
      "l-env":"the multitenant-environment limitation applies to shared platforms like Nimbus's — SwiftFreight's issue is authority and jurisdiction, not shared tenancy"
    };
    for (var i=0;i<good.length;i++){ if (env["h7sel."+good[i]] !== "on"){ return {ok:false, msg:"Not yet — one of the three real blockers is missing. Ask: does MVHN have any contract with SwiftFreight (authority)? Where do its systems operate? What independent evidence does it offer?"}; } }
    for (var k in bad){ if (env["h7sel."+k] === "on"){ return {ok:false, msg:"Rejected — "+k+"."}; } }
    return {ok:true};
  }
});

/* OBJ-H8 — remediation amendments */
OBJ_HARD.push({
  id:"OBJ-H8", pillar:"P4",
  title:"Redline the renewal: select exactly the five amendments that close the gaps this incident exposed.",
  desc:"Legal opens Peregrine's binder in 30 days. Five amendments from the nine options — exact set.",
  nudge:"The five map to the gaps: notification, verification, the subcontractor chain (two instruments), and what happens to the data afterwards.",
  ok:"Stamped. The five amendments close every gap in the incident chain: a ≤24-hour notification SLO (no more learning by courtesy), a right-to-audit clause (verification rights), subcontractor approval plus security flow-down (the fourth-party chain now carries MVHN's obligations), NDA flow-down to bind subcontractors to confidentiality, and retention/destruction terms for the manifests (the data does not linger after the routes end). The rejected options are wrong tools: no privity for an MOU, an RFQ prices rather than protects, escrow is irrelevant, and 'terminate everyone' is avoidance, not remediation.",
  render:function(){
    var h = docOpen({id:"h8", title:"Challenge 8 · Remediation — rebuild the contract", look:"h3", lookLabel:"the gap analysis"}, "exact set — 5 of 9");
    h += '<p style="font-size:14.5px;color:var(--ink-soft)">'+HARD.h8.intro+'</p>' + optHTML("h8sel", HARD.h8.opts, "check", "Contract amendments");
    return h + docClose();
  },
  check:function(env){
    var good = ["m-notify","m-audit","m-fourth","m-nda","m-ret"], bad = {
      "m-rfq":"an RFQ prices replacement couriers — pricing is not protection",
      "m-mou":"MVHN has no privity with SwiftFreight — an MOU directly with it would not bind and signals misreading the legal chain",
      "m-term":"terminating all courier vendors is avoidance without analysis — it also stops specimen delivery at three hospitals",
      "m-escrow":"Peregrine's dispatch source code is irrelevant to MVHN — escrow guards software MVHN depends on"
    };
    for (var i=0;i<good.length;i++){ if (env["h8sel."+good[i]] !== "on"){ return {ok:false, msg:"Not yet — a real amendment is missing. Cover the chain: know fast (notification SLO), verify (right-to-audit), bind the subcontractors (approval + flow-down and NDA flow-down), and control the data lifecycle (retention/destruction)."}; } }
    for (var k in bad){ if (env["h8sel."+k] === "on"){ return {ok:false, msg:"Rejected — "+k+"."}; } }
    return {ok:true};
  }
});

/* OBJ-H9 — re-tier */
OBJ_HARD.push({
  id:"OBJ-H9", pillar:"P4",
  title:"Re-tier Peregrine in the registry — and select only the evidence that justifies the new tier.",
  desc:"Fix the record E4 shows: choose the new tier, then select every item of desk evidence that justifies it — and nothing that does not.",
  nudge:"Tier follows data access and dependency, then incidents and assurance posture sharpen it. On-time delivery and an old NDA are not risk evidence.",
  ok:"Stamped — Critical, and the record now matches reality: PHI in the manifests (j1), an actual fourth-party incident (j2), a logistics dependency for all three hospitals (j3), and weak assurance — a stale, out-of-scope Type I (j4). On-time delivery and a 2023 NDA say nothing about risk. Note what this fixes: with tier=Critical, assessment depth, monitoring cadence and attestation requirements all re-engage automatically.",
  render:function(){
    var h = docOpen({id:"h9", title:"Challenge 9 · Re-tier Peregrine (E4)", look:"h1", lookLabel:"the registry entry (E4)"}, "exact set");
    h += '<div class="qrow"><span class="qlabel">New tier</span>' + optHTML("h9.tier", HARD.h9.tiers, "radio", "New registry tier") + '</div>';
    h += '<div class="qrow"><span class="qlabel">Justifying evidence (select all that apply — only risk evidence)</span>' + optHTML("h9sel", HARD.h9.justOpts, "check", "Justifying evidence") + '</div>';
    return h + docClose();
  },
  check:function(env){
    if (env["h9.tier"] !== "critical"){ return {ok:false, msg:"Rejected — weigh the facts: PHI exposure, an actual fourth-party ransomware incident, a logistics dependency for all three hospitals, and no credible assurance. That is the definition of Critical in the tier model you filed this quarter."}; }
    var good = ["j1","j2","j3","j4"], bad = {"j5":"on-time delivery is performance, not risk — plenty of breached vendors deliver on time","j6":"an NDA signed in 2023 is paperwork age, not risk evidence — and NDAs protect confidentiality, not availability or integrity"};
    for (var i=0;i<good.length;i++){ if (env["h9sel."+good[i]] !== "on"){ return {ok:false, msg:"Not yet — justifying evidence "+good[i].toUpperCase()+" belongs in the re-tiering record. Tier decisions must cite data access, dependency, incident history, and assurance posture."}; } }
    for (var k in bad){ if (env["h9sel."+k] === "on"){ return {ok:false, msg:"Rejected — "+k+"."}; } }
    return {ok:true};
  }
});

/* OBJ-H10 — monitoring plan */
OBJ_HARD.push({
  id:"OBJ-H10", pillar:"P3",
  title:"Build the logistics-vendor monitoring plan: select exactly the five signals it must include.",
  desc:"The board funds a permanent monitoring plan for logistics vendors. Five signals from the nine options — exact set.",
  nudge:"The five cover: measured promises, renewed attestations, chain changes, outside news, and the record itself staying true.",
  ok:"Stamped. The five signals cover the full monitoring surface: service-level monitoring against the new notification SLO (measured promises), attestation renewal dates (evidence that does not rot unnoticed), fourth-party change notifications (the chain that caused this incident), sector threat-intel and breach news (what you will not hear from the vendor), and registry review cadence with re-tiering triggers (so the record stays true). The other three signals are real — but they belong to other vendors' plans.",
  render:function(){
    var h = docOpen({id:"h10", title:"Challenge 10 · The monitoring plan", look:"h9", lookLabel:"the re-tiered registry"}, "exact set — 5 of 9");
    h += '<p style="font-size:14.5px;color:var(--ink-soft)">'+HARD.h10.intro+'</p>' + optHTML("h10sel", HARD.h10.opts, "check", "Monitoring signals");
    return h + docClose();
  },
  check:function(env){
    var good = ["s1","s2","s3","s4","s5"], bad = {
      "s6":"Nimbus's uptime dashboard is already covered by Nimbus's Critical-tier monitoring plan — this question funds the logistics-vendor plan",
      "s7":"toner-consumption reports are operational noise, not security monitoring",
      "s8":"Kestrel's ROE updates belong to the testing program, not the logistics monitoring plan",
      "s9":"office-supplier insurance certificates are procurement paperwork with no bearing on logistics risk"
    };
    for (var i=0;i<good.length;i++){ if (env["h10sel."+good[i]] !== "on"){ return {ok:false, msg:"Not yet — signal "+good[i].toUpperCase()+" is missing. The plan must cover measured promises, renewed attestations, chain changes, outside news, and the registry record itself."}; } }
    for (var k in bad){ if (env["h10sel."+k] === "on"){ return {ok:false, msg:"Rejected — "+k+"."}; } }
    return {ok:true};
  }
});

var ALL_OBJ = OBJ_MED.concat(OBJ_MED2, OBJ_HARD);
var OBJMAP = {};
for (var _i=0; _i<ALL_OBJ.length; _i++){ OBJMAP[ALL_OBJ[_i].id] = ALL_OBJ[_i]; }

/* ---------- Check engine ---------- */
function checkObjective(id){
  var o = OBJMAP[id], os = objState(id);
  if (os.done) return;
  var res = o.check(state.env);
  os.tries++;
  if (!state.lastFb) state.lastFb = {};
  var okMsg = o.ok.replace(/^Stamped[.\s—-]*/, "");
  state.lastFb[id] = res.ok ? { cls:"ok", html:"<b>Stamped.</b> "+okMsg } : { cls:"no", html:res.msg };
  var fbEl = $("fb-"+id);
  if (res.ok){
    os.done = true; os.first = os.tries === 1;
    if (fbEl){ fbEl.className = "feedback ok"; fbEl.innerHTML = "<b>Stamped.</b> "+okMsg; }
    var doc = $(objDocId(o));
    if (doc && !doc.querySelector(".stamp")){
      var st = document.createElement("div"); st.innerHTML = stampHTML("Verified");
      doc.appendChild(st.firstChild); doc.classList.add("stamped");
    }
    lockObjDoc(o);
    announce("Objective verified — answers locked: "+o.title);
  } else {
    if (fbEl){ fbEl.className = "feedback no"; fbEl.innerHTML = res.msg; }
    announce("Not yet: "+o.title);
  }
  save(); renderLedger(); updateStats();
  if (state.mode === "medium") renderRail();
}

/* ---------- Hints ---------- */
function useHint(id){
  var o = OBJMAP[id], os = objState(id);
  var max = state.mode === "medium" ? 3 : 1;
  if (os.hint >= max) return;
  os.hint++;
  save(); renderLedger();
  var doc = $(objDocId(o));
  if (doc) doc.scrollIntoView({behavior:"smooth", block:"start"});
  announce("Hint revealed for "+o.title);
}

/* QA fix (B1/B6): after any (re)render, reflect persisted env in the controls —
   answers must look answered after a reload, for stamped AND in-progress docs. */
function restoreEnvControls(){
  function mark(el){ var w = el.closest(".choice"); if (w) w.classList.toggle("checked", el.checked); }
  var ctrls = document.querySelectorAll('#stage [data-env]');
  for (var i=0;i<ctrls.length;i++){
    var el = ctrls[i], key = el.getAttribute("data-env"), v = state.env[key];
    if (el.tagName === "SELECT"){ if (v) el.value = v; }
    else if (el.type === "checkbox"){ el.checked = !!v; mark(el); }
    else if (el.type === "radio"){ el.checked = (v === el.value); mark(el); }
    else if (el.tagName === "INPUT"){ if (v) el.value = v; }
  }
}
/* QA fix (R2): a stamped objective's answers are locked — no control can edit a validated answer */
function lockObjDoc(o){
  var doc = $(objDocId(o)); if (!doc) return;
  var ctrls = doc.querySelectorAll("input, select, button");
  for (var i=0;i<ctrls.length;i++){ ctrls[i].disabled = true; }
  doc.classList.add("locked");
}
function lockStampedDocs(){
  var objs = modeObjs();
  for (var i=0;i<objs.length;i++){ if (objState(objs[i].id).done) lockObjDoc(objs[i]); }
}
