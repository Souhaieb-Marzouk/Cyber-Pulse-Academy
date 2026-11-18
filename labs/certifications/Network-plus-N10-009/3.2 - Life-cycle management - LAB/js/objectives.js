/* ================= VALIDATION — machine-checkable rules per objective ================= */

const FLAGGABLE = ["fw1","sw1","sw2","sw3","ap1","ap2","srv1","srv2","nas1"];

function fail(msg){ return {ok:false, fail:msg}; }
function pass(){ return {ok:true}; }
function seqEqual(arr, expected){
  return arr.length === expected.length && expected.every((v,i)=>arr[i]===v);
}

const CHECKS = {
  /* ---------- MEDIUM ---------- */
  M1(){
    const t = S.env.timeline;
    if(t.length < TIMELINE_STAGES.length) return fail("The road has five stages — " + (TIMELINE_STAGES.length - t.length) + " slot(s) still empty. Click chips to fill every slot.");
    if(seqEqual(t,[0,1,2,3,4])) return pass();
    return fail("The order isn't the asset's real road yet. Ask for each stage: does it STOP SALES or STOP SUPPORT? Selling stops before supporting does, and the asset is still in production before either.");
  },
  M2(){
    const eolOk = S.env.defs.eol === "0";
    const eosOk = S.env.defs.eos === "1";
    if(eolOk && eosOk) return pass();
    if(!eolOk && !eosOk) return fail("Both definitions are swapped or off. Read the Orientation Shed cards: one term is about the vendor no longer SELLING the product, the other is about support ending COMPLETELY — patches, fixes, support, parts.");
    if(!eolOk) return fail("The EOL definition is off. End-of-life stops the vendor's SALES — deployed units usually keep working and keep support for a while afterwards. 'All patches, fixes and parts end' describes the OTHER term.");
    return fail("The EOS definition is off. End-of-support is the total end of vendor support: security patches, bug fixes, technical support AND spare parts. 'Can no longer be purchased new' describes EOL/end-of-sale.");
  },
  M3(){
    const c = S.env.eosChecks;
    const mustOn = [0,1,2,3].every(i=>c[i]);
    const mustOff = [4,5].every(i=>!c[i]);
    if(mustOn && mustOff) return pass();
    if(!mustOn) return fail("Missing something that genuinely disappears. A support contract delivers four things to you: think patches, fixes, someone to call, and parts.");
    return fail("One of the two 'physical' items is ticked. At end-of-support nothing happens to the hardware itself — the device keeps booting and your data stays put. That's exactly why EOS boxes linger dangerously in production.");
  },
  M4(){
    const wrong = CORE_DEVICES.filter(id => (S.env.lamps[id]||"") !== CORE_ANSWERS[id]);
    if(wrong.length === 0) return pass();
    const passedEos = CORE_DEVICES.filter(id => (S.env.lamps[id]||"") === "eos" && CORE_ANSWERS[id] !== "eos");
    const futureEos = CORE_DEVICES.filter(id => (S.env.lamps[id]||"") === "eol" && CORE_ANSWERS[id] === "sup");
    if(passedEos.length) return fail(wrong.length + " of 6 lamps don't match the evidence. Hint: an end-of-SUPPORT date that has already PASSED (before Nov 9, 2026) means EOS — check " + passedEos.map(id=>deviceById(id).tag).join(", ") + ". Open crate details for the exact dates.");
    if(futureEos.length) return fail("Almost — a device you marked EOL is actually fully supported: its end-of-sale hasn't even passed. Check the dates again (" + futureEos.map(id=>deviceById(id).tag).join(", ") + ").");
    return fail(wrong.length + " of 6 lamps don't match the notices and crate dates. Rule: end-of-support PASSED → EOS · end-of-sale passed but support still ahead → EOL · neither → Supported.");
  },
  M5(){
    const wrong = CLASSIFY_ITEMS.map((it,i)=> (S.env.classify[i]==String(it.a)) ? null : i).filter(v=>v!==null);
    if(wrong.length===0) return pass();
    const names = wrong.map(i=>"item "+(i+1)).join(", ");
    return fail(names + (wrong.length===1?" is":" are") + " misclassified. Ask: does it close a VULNERABILITY (security patch), fix faulty BEHAVIOR (bug fix), move the whole OS to a new MAJOR version (OS upgrade), or rewrite device low-level code — APs, switches, and server UEFI/BIOS all count (firmware)?");
  },
  M6(){
    const on = FLAGGABLE.filter(id=>S.env.flags[id]);
    const missing = M6_RISK.filter(id=>!S.env.flags[id]);
    const extra = on.filter(id=>!M6_RISK.includes(id));
    if(missing.length===0 && extra.length===0) return pass();
    if(missing.length) return fail(missing.map(id=>deviceById(id).tag).join(", ") + " — end-of-support has already passed there, yet no urgent-risk flag is set. Check each PASSED date on the crates.");
    return fail(extra.map(id=>deviceById(id).tag).join(", ") + (extra.length>1?" are":" is") + " flagged urgent, but their vendor support is still ahead (or current). EOL gear gets a REFRESH PLAN, not an incident flag — flagging everything urgent hides the real fires.");
  },
  M7(){
    const wrong = EVIDENCE_ROWS.map((r,i)=> (S.env.evidence[i]==String(r.a)) ? null : i).filter(v=>v!==null);
    if(wrong.length===0) return pass();
    return fail(wrong.map(i=>"row "+(i+1)).join(", ") + " — mismatched. Match the QUESTION to the document that owns that kind of fact: lifecycle dates live in vendor bulletins, available patches in service-release bulletins, what must be KEPT in the records-retention policy, and a drive's physical condition in the asset crate record.");
  },
  M8(){
    const need = {srv1:"patch", ap1:"fw", srv2:"os", sw1:"monitor"};
    const problems = [];
    Object.keys(need).forEach(id=>{
      const want = need[id];
      const got = S.env.bench.actions[id];
      const tg = S.env.bench.toggles[id] || {};
      if(got !== want){ problems.push(deviceById(id).tag + " needs a different decision — read its version report: what is pending, and what is already current?"); return; }
      if(want !== "monitor"){
        const missing = ["tested","window","rollback"].filter(t=>!tg[t]);
        if(missing.length) problems.push(deviceById(id).tag + ": an APPLY-type change needs all three preflights — tested in lab, maintenance window, rollback plan (" + missing.length + " missing).");
      }
    });
    if(problems.length===0) return pass();
    return fail(problems.join(" "));
  },
  M9(){
    const a1 = S.env.bench.actions.fw1, a2 = S.env.bench.actions.sw2;
    const interim = !!(S.env.bench.toggles.fw1 && S.env.bench.toggles.fw1.interim);
    if(a1==="replace" && a2==="replace" && interim) return pass();
    if(a1==="patch" || a2==="patch") return fail("The yard refuses patch jobs on EOS gear — read the warning note that appeared when you tried. Past end-of-support the vendor will NEVER publish that patch; there is nothing to apply.");
    const problems = [];
    if(a1!=="replace") problems.push("fw1 still has no real decision — an exploited EOS firewall can only be replaced.");
    if(a1==="replace" && !interim) problems.push("fw1 is marked for replacement, but nothing protects it in the meantime — tick the interim compensating controls (isolate, monitor) that bridge the gap until the new box lands.");
    if(a2!=="replace") problems.push("sw2 needs a real decision too — no Coreware 9.x patch exists, ever.");
    return fail(problems.join(" "));
  },
  M10(){
    const ids = ["lt1","lt2","md1","nas1","fw1"];
    const routeWrong = ids.filter(id => (S.env.gate.routes[id]||"") !== GATE_ANSWERS[id].route);
    if(routeWrong.length) return fail(routeWrong.map(id=>{
        const dev = deviceById(id);
        return dev.tag + " (" + dev.data + ")";
      }).join(", ") + " — re-match route to facts: working media + resale → wipe & resell · failing media that can't be wiped → destroy · phone with removable cards → factory-reset route · a records-retention hold → archive & retain · an unsupported SECURITY appliance is never resold.");
    const stepMissing = [];
    ids.forEach(id=>{
      const miss = GATE_ANSWERS[id].steps.filter(s => !(S.env.gate.steps[id] && S.env.gate.steps[id][s]));
      if(miss.length) stepMissing.push(deviceById(id).tag + " is missing " + miss.length + " required step(s)");
    });
    if(stepMissing.length) return fail(stepMissing.join(" · ") + ". Every departure needs its proof: backups before wiping, certificates after, SIM/SD out of phones, and the retention hold RECORDED — the hold is what makes 'archive' legal.");
    return pass();
  },
  M11(){
    const on = LEDGER_MED.filter(it=>S.env.ledger[it.id]);
    const missing = LEDGER_MED.filter(it=>it.ok && !S.env.ledger[it.id]).map(it=>it.t);
    const extra = on.filter(it=>!it.ok).map(it=>it.t);
    if(missing.length===0 && extra.length===0) return pass();
    if(missing.length) return fail("Still open: " + missing.join("; ") + ". Decommissioning ends when the paperwork stops lying — two documents must reflect reality, one certificate must exist, and one license action must be taken.");
    return fail("Ticked something that shouldn't happen: " + extra.join("; ") + ". Deleting backups and ticket history destroys evidence, not clutter — and EOS gear cannot receive SP-2026-11A at all.");
  },

  /* ---------- HARD ---------- */
  H1(){
    const wrongLamps = HARD_DEVICES.filter(id => (S.env.lamps[id]||"") !== HARD_ANSWERS[id]);
    const picks = NOTICES.filter(n=>S.env.noticePicks[n.id]).map(n=>n.id);
    const picksWrong = picks.filter(id=>!H1_NONLIFECYCLE.includes(id));
    const picksMissing = H1_NONLIFECYCLE.filter(id=>!picks.includes(id));
    if(wrongLamps.length===0 && picksWrong.length===0 && picksMissing.length===0) return pass();
    const problems = [];
    if(wrongLamps.length) problems.push(wrongLamps.length + " of 7 lamps don't match the bulletins — compare each crate's end-of-support date to Nov 9, 2026 (PASSED = EOS; end-of-sale passed but support ahead = EOL).");
    if(picksMissing.length) problems.push("The board still hides " + picksMissing.length + " non-lifecycle item(s): real lifecycle notices carry DATES and support language; flyers and new-model ads don't.");
    if(picksWrong.length) problems.push("You marked " + picksWrong.length + " real lifecycle bulletin(s) as noise — those carry actual end-of-support dates.");
    return fail(problems.join(" "));
  },
  H2(){
    const on = FLAGGABLE.filter(id=>S.env.flags[id]);
    const missing = H2_NO_UPDATES.filter(id=>!S.env.flags[id]);
    const extra = on.filter(id=>!H2_NO_UPDATES.includes(id));
    const hiOn = FLAGGABLE.filter(id=>S.env.highFlags[id]);
    const hiMissing = H2_HIGH_RISK.filter(id=>!S.env.highFlags[id]);
    const hiExtra = hiOn.filter(id=>!H2_HIGH_RISK.includes(id));
    if(missing.includes("sw3")) return fail("sw3 slipped through — read its crate note again. The DepotCare contract swaps BROKEN HARDWARE; it does not restore vendor security patches. Coreware 9.x is EOS: the vendor ships nothing for it, contract or not.");
    if(extra.includes("sw1")||extra.includes("ap1")||extra.includes("srv1")||extra.includes("ap2")) return fail(extra.map(id=>deviceById(id).tag).join(", ") + " still receives vendor updates — flagging supported gear dilutes the alert.");
    if(extra.includes("nas1")) return fail("nas1 is supported until 2027-08-31 — its constraint is the retention hold, not vendor support.");
    if(missing.length) return fail("Missing device(s): " + missing.map(id=>deviceById(id).tag).join(", ") + " — check every crate's end-of-support date against Nov 9, 2026, and read the yard-office crate's note.");
    if(hiMissing.length || hiExtra.length) return fail("The high-risk split is off. Among the unpatchable four: one guards the PERIMETER and one holds CONFIDENTIAL payroll data — those two are immediately dangerous. The branch and yard-office switches are unsupported but low-stakes.");
    return pass();
  },
  H3(){
    if(S.env.incidentSeq.length < INCIDENT_STEPS.length) return fail("The sequence has five steps — " + (INCIDENT_STEPS.length - S.env.incidentSeq.length) + " slot(s) empty.");
    if(seqEqual(S.env.incidentSeq,[0,1,2,3,4])) return pass();
    return fail("Order rejected. The operational logic: you can't fix what you haven't CONFIRMED; you don't wait unprotected (compensating controls go in immediately); you build the replacement BEFORE cutting over; and decommissioning + records close the incident — they don't open it.");
  },
  H4(){
    if(S.env.rolloutSeq.length < ROLLOUT_STEPS.length) return fail("All four actions must be ordered — " + (ROLLOUT_STEPS.length - S.env.rolloutSeq.length) + " slot(s) empty.");
    if(!S.env.rolloutRollback) return fail("No rollback commitment — a rollout without rollback plans is a gamble the exam (and the foreman) rejects. Tick it.");
    if(seqEqual(S.env.rolloutSeq,[0,1,2,3])) return pass();
    return fail("Sequence rejected. Two constraints drive it: one CVE is being ACTIVELY EXPLOITED today (quick win goes first), and one action is a hard PREREQUISITE for another — server UEFI 2.14 before Stratus OS 14 can install. The AP firmware window can wait for the warehouse's off-hours.");
  },
  H5(){
    if(S.env.fwTarget === "") return fail("Pick a target firmware version for ap1.");
    if(S.env.fwReason === "") return fail("Explain WHY — pick the statement that rules out the other big-number image.");
    if(S.env.fwTarget==="0" && S.env.fwReason==="0") return pass();
    if(S.env.fwTarget==="1") return fail("7.0.0 rejected. Bigger number ≠ compatible: the version report says 7.0.0 runs on A550-series hardware ONLY. ap1 is an A320.");
    if(S.env.fwTarget==="2") return fail("6.2.2 was WITHDRAWN and superseded — shipping a withdrawn image is a change-control failure.");
    if(S.env.fwTarget==="3") return fail("Staying on 6.2.1 leaves CVE-2026-0922 open on the warehouse Wi-Fi — the fix exists and ap1 is supported until 2027-01-31.");
    if(S.env.fwTarget==="0"){
      if(S.env.fwReason==="1") return fail("The reason contradicts your (correct) target: bigger number ≠ compatible. 7.0.0 was built for A550-series hardware — the version report says exactly that.");
      if(S.env.fwReason==="2") return fail("6.2.2 was WITHDRAWN and superseded by 6.2.3 — it was never the later-and-better choice.");
      return fail("“No update needed” leaves CVE-2026-0922 open on the warehouse Wi-Fi while a supported fix exists — update now, and plan the A-series replacement on the normal schedule.");
    }
    return fail("Target and reason must match each other: 6.2.3 is the newest image that supports the A320; 7.0.0's hardware requirement is the trap.");
  },
  H6(){
    const routeWrong = GATE_ASSETS.filter(id => (S.env.gate.routes[id]||"") !== GATE_ANSWERS[id].route);
    if(routeWrong.length) return fail(routeWrong.map(id=>{
        const dev = deviceById(id);
        return dev.tag + " (" + GATE_META[id] + ")";
      }).join(", ") + " — routes must match media condition, data sensitivity, and the retention rule. Remember: unsupported security appliances are never resold.");
    const problems = [];
    GATE_ASSETS.forEach(id=>{
      const req = GATE_ANSWERS[id].steps;
      const miss = req.filter(s => !(S.env.gate.steps[id] && S.env.gate.steps[id][s]));
      if(miss.length) problems.push(deviceById(id).tag + ": missing " + miss.length + " required step(s) (" + miss.map(s=>GATE_STEPS.find(x=>x.id===s).label).join(", ") + ")");
      const cands = gateCandidateSteps(id);
      const badTick = cands.filter(s => !req.includes(s) && S.env.gate.steps[id] && S.env.gate.steps[id][s]);
      if(badTick.length) problems.push(deviceById(id).tag + ": " + badTick.map(s=>GATE_STEPS.find(x=>x.id===s).label).join(", ") + " doesn't apply to this asset");
    });
    if(problems.length) return fail(problems.join(" · "));
    return pass();
  },
  H7(){
    const wrong = MATRIX_CASES.map((c,i)=> (S.env.matrix[i]==String(c.a)) ? null : i).filter(v=>v!==null);
    if(wrong.length===0) return pass();
    const ssdCase = wrong.includes(2);
    return fail((wrong.map(i=>"case "+(i+1)).join(", ")) + " — mismatched. Ask two questions: CAN the media be overwritten (working vs failing), and DOES degaussing even work on it? " + (ssdCase ? "Case 3 is the classic trap: SSDs have no magnetic platters — degaussing erases nothing." : ""));
  },
  H8(){
    const gaps = ["g1","g2","g3","g4"];
    const traps = ["t1","t2","t3"];
    const missingGap = gaps.filter(g=>!S.env.ledger[g]);
    const badTick = traps.filter(t=>S.env.ledger[t]);
    if(missingGap.length===0 && badTick.length===0) return pass();
    const problems = [];
    if(missingGap.length) problems.push(missingGap.length + " genuine gap(s) still unticked — the ledger must stop describing the OLD network: two documents still show removed devices, one certificate is missing, licenses are still live.");
    if(badTick.length) problems.push("Ticked items that must NOT happen: " + badTick.map(t=>LEDGER_HARD.traps.find(x=>x.id===t).t).join("; ") + ".");
    return fail(problems.join(" "));
  },
  H9(){
    const on = FACTS.filter(f=>S.env.riskFacts[f.id]);
    const missing = FACTS.filter(f=>f.ok && !S.env.riskFacts[f.id]);
    const extra = on.filter(f=>!f.ok);
    if(missing.length===0 && extra.length===0 && on.length===3) return pass();
    if(on.length !== 3) return fail("Exactly THREE facts — leadership stops reading at three. " + on.length + " selected.");
    if(missing.length) return fail("One of the three real facts is missing: what support ending MEANS, what the CVE bulletin PROVES, and what an AUDITOR will conclude.");
    return fail("The rest are misconceptions: EOS devices don't stop booting, EOL ≠ bankruptcy, third-party contracts swap hardware (they don't ship security patches), and EOL announcement ≠ destruction order.");
  }
};

/* run a check */
const lastCheckTs = {};
function runCheck(id){
  const o = woList().find(x=>x.id===id);
  const w = woState(id);
  if(!o) return;
  /* accidental double-click guard: one logical validation per 350ms per objective */
  const now = Date.now();
  if(now - (lastCheckTs[id] || 0) < 350) return;
  lastCheckTs[id] = now;
  if(w.passed){ woFeedback(id,"info","Already passed — the yard is satisfied. On to the next work order."); return; }
  const res = CHECKS[id]();
  w.attempts++;
  const card = $("#wo-"+id);
  if(res.ok){
    w.passed = true;
    if(card){
      card.classList.add("done");
      const chip = card.querySelector(".status-chip");
      if(chip){ chip.className = "status-chip pass"; chip.textContent = "✔ passed"; }
    }
    woFeedback(id,"ok","✔ Correct. " + o.fb);
    toast("Work order " + id + " passed.");
    const list = woList();
    if(list.every(x=>woState(x.id).passed)){
      toast("All work orders complete — the foreman's quiz just unlocked below.");
      announce("All work orders complete. Knowledge check unlocked.");
    }
    renderQuiz();
  } else {
    woFeedback(id,"no","✘ " + res.fail);
  }
  save();
  updateProgress();
}
