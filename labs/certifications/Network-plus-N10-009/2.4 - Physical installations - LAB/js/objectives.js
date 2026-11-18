/* ============================================================
   js/objectives.js — the CHECK RESULTS engine: per-objective
   validators (same rules and answer values as the original lab),
   hint tiers, star scoring, and the check/hint flow.
   ============================================================ */
"use strict";
/* ================= VALIDATORS + CHECK ENGINE ================= */

const HINTS_H = {
  H1:"Start with the heavy gear: where did the contractor put the UPS, and where do the two server power supplies land?",
  H2:"Rules: UPS on the floor, heavy gear low, panel beside switch, no open gaps, lockable doors.",
  H3:"Load × 1.25 sizes the UPS; 15 × 120 × 0.8 sizes the circuit.",
  H4:"Classify by consequence: is cooling degraded, at its limit, or lost entirely?",
  H5:"The band edges themselves are the alert values.",
  H6:"The failed unit stays offline: recovery needs CRAC-2 running, the airflow state correct, setpoints in band — then run the simulation.",
  H7:"Count them: unsplit PSUs, unassigned singles, missing UPS, missing generator/ATS, missing SPD.",
  H8:"A repeating breaker trip with no load change is an upstream electrical fault — hardware swaps don't fix it.",
  H9:"Every answer appears in the consoles: 1.75 · 1440 · MDF · cold aisle · clean agent · ESD · UPS · No."
};

const VALIDATORS = {
  M1(){ const ok=Object.keys(MATCH_TERMS).filter((_,i)=>S.match[MATCH_TERMS[i].id]===MATCH_TERMS[i].id).length;
    return {pass: ok===MATCH_TERMS.length, parts:[{label:`${ok}/10 terms matched to the right definition`, ok: ok===MATCH_TERMS.length}],
      fb:"Every pair must be exact — definitions are one-liners, so re-read the near-misses."}; },
  M2(){ const pass=JSON.stringify(S.seq.power)===JSON.stringify(SEQ_POWER_ANSWER);
    let firstBad=-1; S.seq.power.forEach((id,i)=>{ if(firstBad<0 && id!==SEQ_POWER_ANSWER[i]) firstBad=i+1; });
    return {pass, parts:[{label:"Chain order = utility → ATS → UPS → PDU → device PSU", ok:pass}],
      fb: firstBad>0?`Slot ${firstBad} is where the chain breaks. Ask: who must see power FIRST after the utility?`:"Place all five elements."}; },
  M3(){ const pass=JSON.stringify(S.seq.plan)===JSON.stringify(SEQ_PLAN_ANSWER);
    let firstBad=-1; S.seq.plan.forEach((id,i)=>{ if(firstBad<0 && id!==SEQ_PLAN_ANSWER[i]) firstBad=i+1; });
    return {pass, parts:[{label:"Six steps in commissioning order", ok:pass}],
      fb: firstBad>0?`Step ${firstBad} is out of place — you cannot terminate cables before power exists, or rack gear in an unverified room.`:"Place all six steps."}; },
  M4(){ const rr=rackRules(); return {pass: rr.every(r=>r.ok), parts:rr.map(r=>({label:r.label, ok:r.ok})),
      fb:"Check the live rule list in Rack Works — it mirrors this list item by item."}; },
  M5(){ const lw=Number(S.power.loadW), cw=Number(S.power.circuitW);
    const parts=[
      {label:`IT load entered as ${TOTAL_LOAD} W (you: ${S.power.loadW||"—"})`, ok: lw===TOTAL_LOAD},
      {label:"UPS with ≥25 % headroom → 3000 VA / 2400 W", ok: S.power.upsModel==="3000"},
      {label:`Usable watts on one 15 A / 120 V circuit = ${CIRCUIT_USABLE} W (you: ${S.power.circuitW||"—"})`, ok: cw===CIRCUIT_USABLE},
      {label:"Circuit voltage = 120 V", ok: S.power.volt==="120"}];
    return {pass: parts.every(p=>p.ok), parts,
      fb:"Load math first: add the six powered devices. Then VA × 0.8 = W, and you need load × 1.25."}; },
  M6(){ const parts=[
      {label:"Row A front faces the aisle", ok: S.env.rowA==="right"},
      {label:"Row B front faces the aisle", ok: S.env.rowB==="left"},
      {label:"Aisle configured COLD with vent tiles open", ok: S.env.aisle==="cold" && S.env.tilesOpen},
      {label:"Under-floor cable cutouts sealed", ok: S.env.cutoutsSealed}];
    return {pass: parts.every(p=>p.ok), parts,
      fb:"Follow the air: gear breathes front-to-back, so fronts must face the COLD aisle; tiles and sealed cutouts keep that air coming."}; },
  M7(){ const parts=DRILL.map(d=>({label:d.q.slice(0,58)+"…", ok: S.drill[d.k]===d.ans}));
    return {pass: parts.every(p=>p.ok), parts,
      fb:"Copper → patch panel, fiber → FDP, position labels, re-pull kinked runs, and C-104 (only comms room) is the MDF."}; },
  M8(){ const parts=[
      {label:"Temp/RH sensor at the cold-aisle intake", ok: !!S.env.sensors.cold},
      {label:"Leak sensor under the raised floor near the CRAC", ok: !!S.env.sensors.floor},
      {label:"Smoke sensor at the ceiling", ok: !!S.env.sensors.ceiling},
      {label:"Fire suppression: clean agent (simplified)", ok: S.env.fire==="clean"}];
    return {pass: parts.every(p=>p.ok), parts,
      fb:"Monitor what the gear breathes, where water gathers, and the ceiling. Hot-aisle sensor is optional context, not required."}; },
  M9(){ const tLo=parseFloat(S.env.tLo), tHi=parseFloat(S.env.tHi), hLo=parseFloat(S.env.hLo), hHi=parseFloat(S.env.hHi);
    const band=(v,lo,hi)=>v>=lo&&v<=hi;
    const parts=[
      {label:"Low-temp alert within 17–19 °C (guidance edge 18)", ok: band(tLo,17,19)},
      {label:"High-temp alert within 26–28 °C (guidance edge 27)", ok: band(tHi,26,28)},
      {label:"Low-RH alert within 38–42 % (guidance edge 40)", ok: band(hLo,38,42)},
      {label:"High-RH alert within 58–62 % (guidance edge 60)", ok: band(hHi,58,62)}];
    return {pass: parts.every(p=>p.ok), parts,
      fb:"The simplified guidance band is 18–27 °C and 40–60 % RH — alarms belong at its edges."}; },
  M10(){ const n=[0,1,2,3,4,5].filter(i=>S.triage["c"+i]===TRIAGE_ANS[i]).length;
    const parts=[
      {label:`6/6 events classified correctly (${n}/6 so far)`, ok: n===6},
      {label:"Root cause: CRAC-1 compressor failure", ok: S.triage.cause==="crac"}];
    return {pass: parts.every(p=>p.ok), parts,
      fb:"Routine noise (door, self-test) is normal; a lost compressor is critical; 25.1 °C climbing is your early warning; 28.4 °C breaches the 27 °C edge."}; },
  M11(){ const spo=spofCount(); const la=feedLoad("A"), lb=feedLoad("B");
    const parts=[
      {label:`SPOF counter reads 0 (now: ${spo})`, ok: spo===0},
      {label:"Both feeds carry load", ok: la>0 && lb>0},
      {label:"Each feed within the 80 % guideline", ok: la<=CIRCUIT_USABLE && lb<=CIRCUIT_USABLE}];
    return {pass: parts.every(p=>p.ok), parts,
      fb:"Redundancy requires independent paths: one PSU per feed for dual-PSU gear, plus UPS (gap), generator+ATS (long outage), SPD (transients)."}; },
  M12(){ const incs=INCIDENTS.filter(x=>!x.hard); const n=incs.filter(x=>S.incidents[x.id]===x.ans).length;
    return {pass:n===incs.length, parts:[{label:`${n}/5 tickets mapped to the correct control`, ok:n===incs.length}],
      fb:"Threat → control: transients→SPD, long outage→generator+ATS, heat→N+1 CRAC + alarms, water→leak detection + shutoff, dry air→humidifier."}; },

  H1(){ const want=[1,2,5,6,7,9]; const got=[...S.wo].sort((a,b)=>a-b);
    const vOk = want.every(i=>got.includes(i)) && got.length===want.length;
    const noFalse = got.every(i=>want.includes(i));
    return {pass: vOk && noFalse, parts:[
      {label:"All 6 violating lines selected", ok: vOk},
      {label:"No correct line (incl. both red herrings) selected", ok: noFalse}],
      fb:"Judge each line against a rule: heavy-low, panel adjacency, PSU independence, airflow sealing, blanking, suppression."}; },
  H2(){ return VALIDATORS.M4(); },
  H3(){ const lw=Number(S.power.loadW), cw=Number(S.power.circuitW);
    const spo=spofCount(); const la=feedLoad("A"), lb=feedLoad("B");
    const parts=[
      {label:`IT load = ${TOTAL_LOAD} W exact`, ok: lw===TOTAL_LOAD},
      {label:"UPS = 3000 VA / 2400 W (≥ load × 1.25)", ok: S.power.upsModel==="3000"},
      {label:`Usable watts per circuit = ${CIRCUIT_USABLE} W exact`, ok: cw===CIRCUIT_USABLE},
      {label:"Circuit voltage = 120 V", ok: S.power.volt==="120"},
      {label:`SPOF counter = 0 (now: ${spo})`, ok: spo===0},
      {label:`Feeds A ${la} W / B ${lb} W — both loaded, both ≤ ${CIRCUIT_USABLE} W`, ok: la>0&&lb>0&&la<=CIRCUIT_USABLE&&lb<=CIRCUIT_USABLE}];
    return {pass: parts.every(p=>p.ok), parts,
      fb:"Exact numbers: 1580 W load, 1975 W needed, 3000 VA chosen, 1440 W usable, 120 V, independent A/B paths."}; },
  H4(){ const base=VALIDATORS.M10();
    const just=(S.hardJust||"").toLowerCase();
    const jOk = just.length>=20 && JUST_KEYWORDS.some(k=>just.includes(k));
    base.parts.push({label:"Written justification mentions the failed component (≥20 chars)", ok: jOk});
    base.pass = base.pass && jOk;
    base.fb = "Write the note a shift lead can act on: what failed, what you verified, what you dispatched.";
    return base; },
  H5(){ const tLo=parseFloat(S.env.tLo), tHi=parseFloat(S.env.tHi), hLo=parseFloat(S.env.hLo), hHi=parseFloat(S.env.hHi);
    const parts=[
      {label:"Low-temp alert = 18 °C exact", ok: tLo===18},
      {label:"High-temp alert = 27 °C exact", ok: tHi===27},
      {label:"Low-RH alert = 40 % exact", ok: hLo===40},
      {label:"High-RH alert = 60 % exact", ok: hHi===60}];
    return {pass: parts.every(p=>p.ok), parts,
      fb:"Ridgeline standard adopts the simplified band edges: 18 / 27 °C and 40 / 60 %."}; },
  H6(){ const parts=[
      {label:"CRAC-2 running, failed CRAC-1 left offline", ok: S.env.crac2 && !S.env.crac1},
      {label:"Airflow state correct (rows → cold aisle, tiles open, cutouts sealed)", ok: aisleOk()},
      {label:"Setpoints inside 18–27 °C / 40–60 % RH", ok: envInBand()},
      {label:"Recovery simulation run and confirmed", ok: !!S.env.recovered}];
    return {pass: parts.every(p=>p.ok), parts,
      fb:"N+1 means the spare engages while the failed unit is serviced — and recovery is confirmed by measurement, not hope."}; },
  H7(){ const spo=spofCount(); return {pass: spo===0, parts:[{label:`SPOF counter = 0 (now: ${spo})`, ok: spo===0}],
      fb:"Every unsplit PSU, unassigned single, missing UPS / generator+ATS / SPD still counts as one."}; },
  H8(){ const n=INCIDENTS.filter(x=>S.incidents[x.id]===x.ans).length;
    return {pass:n===INCIDENTS.length, parts:[{label:`${n}/6 tickets correct (incl. the escalation)`, ok:n===INCIDENTS.length}],
      fb:"Know when NOT to fix: an upstream electrical fault belongs to a licensed electrician."}; },
  H9(){ const e1=Math.abs(Number(S.exam.e1)-1.75), e2=Math.abs(Number(S.exam.e2)-1440);
    const parts=[
      {label:"1U = 1.75 in", ok: Number(S.exam.e1)>0 && e1<=0.01},
      {label:"Usable per 15 A / 120 V circuit = 1440 W", ok: Number(S.exam.e2)>0 && e2<=1},
      {label:"C-104 is the MDF", ok: S.exam.e3==="MDF"},
      {label:"Fronts face the cold aisle", ok: S.exam.e4==="cold"},
      {label:"Suppression = clean agent (simplified)", ok: S.exam.e5==="clean"},
      {label:"22 % RH risk = ESD", ok: S.exam.e6==="esd"},
      {label:"Bridges a 10-min outage = UPS", ok: S.exam.e7==="ups"},
      {label:"1580 W on one circuit = not compliant", ok: S.exam.e8==="no"}];
    return {pass: parts.every(p=>p.ok), parts,
      fb:"These eight lines are the exam surface of 2.4 — all of them were practiced in the consoles."}; }
};

function checkObjective(id){
  const st=objState(id);
  if(st.done || !VALIDATORS[id]) return;
  const v = VALIDATORS[id]();
  st.attempts++;
  st.parts = v.parts;
  if(v.pass){
    st.done = true;
    const fails = st.attempts-1, hints = st.hints||0;
    let stars = (hints===0 && fails===0) ? 3 : (hints<=1 && fails<=2) ? 2 : 1;
    if(S.mode==="H" && hints>0) stars = 1;
    st.stars = stars;
    st.fb = FB[id] || "Objective complete.";
    announce(`Objective ${id} signed off: ${stars} of 3 stars.`);
  } else {
    st.fb = "Not yet — work the part list below. Teaching note: " + (v.fb||"");
    announce(`Objective ${id} is not complete yet.`);
  }
  refresh();
}

function giveHint(id){
  const st=objState(id);
  if(st.done) return;
  const isH = S.mode==="H";
  if(isH){
    if(st.hints>0) return;
    st.hints = 1;
    announce("Emergency nudge used — this objective is now capped at 1 star.");
  } else {
    const tiers = HINTS[id]||[];
    if(st.hints>=tiers.length) return;
    st.hints++;
    announce("Hint " + st.hints + " revealed.");
  }
  refresh();
}

function hintHtml(id){
  const st=objState(id);
  if(!st.hints) return "";
  if(S.mode==="H") return `<div class="hintbox"><strong>Nudge (−1 star):</strong> ${esc(HINTS_H[id]||"")}</div>`;
  const tiers=HINTS[id]||[];
  const shown=tiers.slice(0,st.hints).map((t,i)=>`<div><strong>L${i+1}:</strong> ${esc(t)}</div>`).join("");
  return `<div class="hintbox">${shown}</div>`;
}
