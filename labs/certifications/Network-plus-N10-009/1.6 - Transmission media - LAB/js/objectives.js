/* ============================================================
   TRANSMISSION BENCH — STATIC BUILD · objectives
   OBJECTIVES ENGINE — the objective lists for both modes and the CHECK RESULTS validation logic, plus order certification and progress counting.
   (Code re-filed 1:1 from the original single-file lab;
    see conversion-notes.md. Content and behavior unchanged.)
   ============================================================ */

"use strict";

function _o(orders, id){ var ob = orders[id]; return (ob && ob.fields) ? ob.fields : {}; }
function _eq(v, exp){ return String(v === undefined || v === null ? "" : v) === String(exp); }
function _num(v, min, max){ var n = parseFloat(v); return !isNaN(n) && n >= min && n <= max; }
function _sameSet(arr, exp){ 
  var a = (arr||[]).map(String).sort().join("|"); 
  var b = exp.slice().sort().join("|"); 
  return a === b && (arr||[]).length === exp.length; 
}

var OBJ_MED = [
  {
    id:"OBJ-M1", pillar:"P1", text:"Load module MDL-811 (802.11) on the media rack and complete its standards table: band and headline speed for 802.11b, a, n and ax.",
    anchor:"CI-01 · amendments a/b/g/n/ax", go:{type:"module", id:"wifi"},
    hints:[
      "Open the media rack and pull out MDL-811 — the 802.11 module. Match the band first.",
      "b stayed on 2.4 GHz; a jumped to 5 GHz; n runs on both; ax runs on all three bands.",
      "The table: b = 2.4 GHz / 11 Mbps · a = 5 GHz / 54 Mbps · n = both / 600 Mbps · ax = all three / 9.6 Gbps."
    ],
    validate:function(st){
      var w = st.widgets["w-std"] || {};
      var rows = LIB.filter(function(m){ return m.id === "wifi"; })[0].widget.rows;
      var ok = true, miss = [];
      rows.forEach(function(r, i){
        if(!_eq(w["r"+i+"-b"], r.a1)) { ok=false; miss.push("band"); }
        if(!_eq(w["r"+i+"-s"], r.a2)) { ok=false; miss.push("speed"); }
      });
      return {pass: ok, why: ok ? "Correct: b (2.4/11) → a (5/54) → n (dual/600) → ax (all/9.6 Gbps). You can now read any Wi-Fi spec sheet against its amendment." :
        "Check the highlighted rows: each amendment needs BOTH its band and its headline speed. Wrong: " + miss.join(", ")};
    },
    fbOk:"The amendment alphabet is the backbone of every Wi-Fi question on N10-009 — bands, speeds and features all hang off it. Next: apply it on order W-101.",
    fbNo:"Each row needs the band AND the speed for that amendment. Re-read the MDL-811 spec table, then re-check."
  },
  {
    id:"OBJ-M2", pillar:"P2", text:"Certify order W-101: assign channels to AP-L1/L2/L3 with zero overlap on 2.4 GHz and set a sane channel width.",
    anchor:"CI-02/03/05 · bands, channels, interference", go:{type:"order", id:"ord-ch"},
    hints:[
      "Only three 2.4 GHz channels avoid overlap entirely — the reqs hint at them.",
      "Channels 1, 6 and 11 sit five channels apart — wide enough for 20 MHz carriers not to collide.",
      "Any assignment of 1, 6 and 11 across the three APs with 20 MHz width passes."
    ],
    validate:function(st){
      var f = _o(st.orders, "ord-ch");
      var chs = [f.ch1, f.ch2, f.ch3].map(function(x){ return parseInt(x, 10); });
      var valid = chs.every(function(c){ return c === 1 || c === 6 || c === 11; });
      var distinct = new Set(chs).size === 3;
      var widthOk = _eq(f.width, "20 MHz");
      if(valid && distinct && widthOk) return {pass:true, why:"Certified: 1/6/11 at 20 MHz gives each AP its own clean carrier. On 2.4 GHz, adding width (40+ MHz) or reusing channels costs more throughput than it buys."};
      var why = [];
      if(!valid) why.push("channels must come from the non-overlapping set {1, 6, 11}");
      if(valid && !distinct) why.push("no two APs may share a channel (co-channel overlap)");
      if(!widthOk) why.push("20 MHz is the sane width on 2.4 GHz (bonding overlaps the neighbors)");
      return {pass:false, why:"Not yet: " + why.join("; ") + "."};
    },
    fbOk:"Channel planning is the single most common Wi-Fi fix in the field — and a favorite exam distractor. Next: see what happens to RF in a microwave storm on ticket X-009.",
    fbNo:"The overlap meter shows exactly which cells collide. Fix the flagged pairs (and the width), then certify again."
  },
  {
    id:"OBJ-M3", pillar:"P1", text:"In module MDL-CEL, match each cellular generation (3G, 4G LTE, 5G NR) to the capability that defines it.",
    anchor:"CI-07/08 · generations and use", go:{type:"module", id:"cellular"},
    hints:[
      "Pull MDL-CEL from the rack — the generations widget is under the spec sheet.",
      "Think eras: mobile data begins on 3G; the all-IP broadband era is 4G; 5G brings sub-6 + mmWave and slicing.",
      "3G = UMTS/HSPA (~42 Mbps) · 4G LTE = all-IP, ~100+ Mbps · 5G = mmWave/sub-6, slicing, multi-Gbps."
    ],
    validate:function(st){
      var w = st.widgets["w-gen"] || {};
      var rows = LIB.filter(function(m){ return m.id === "cellular"; })[0].widget.rows;
      var ok = rows.every(function(r, i){ return _eq(w["r"+i], r.a); });
      return {pass: ok, why: ok ? "Correct: 3G opened mobile data, LTE made it all-IP broadband, 5G adds mmWave, slicing and massive MIMO." :
        "Each generation maps to exactly one era. Re-read the MDL-CEL notes on generations, then re-match."};
    },
    fbOk:"Generations are exam shorthand for capability sets — hotspot, failover and event Wi-Fi questions all assume you can read them. Next: mission-match orbits on S-310.",
    fbNo:"The three capability cards describe eras in order. Re-read the MDL-CEL spec table and notes, then re-check."
  },
  {
    id:"OBJ-M4", pillar:"P2", text:"Certify order S-310: match an orbit class (LEO/MEO/GEO) to each of the three missions — interactive classes, TV broadcast, GNSS reference.",
    anchor:"CI-10/11/13 · orbits, latency, use cases", go:{type:"order", id:"ord-sat"},
    hints:[
      "Open order S-310 — the readouts show the RTT you buy with each orbit.",
      "Interactive video needs tens of ms; broadcast wants huge fixed coverage; GNSS constellations fly mid-altitude.",
      "Rural interactive = LEO · TV headend broadcast = GEO · GNSS reference = MEO."
    ],
    validate:function(st){
      var f = _o(st.orders, "ord-sat");
      var ord = ORDERS_MED.filter(function(x){ return x.id === "ord-sat"; })[0];
      var ok = _eq(f.m1, ord.options.indexOf("LEO (500-2,000 km)")) &&
               _eq(f.m2, ord.options.indexOf("GEO (35,786 km)")) &&
               _eq(f.m3, ord.options.indexOf("MEO (about 8,000-20,000 km)"));
      return {pass: ok, why: ok ? "Certified: LEO for interactive (25-60 ms), GEO for broadcast (480-700 ms RTT is irrelevant one-way), MEO for GNSS (the GPS constellation flies at 20,180 km)." :
        "Match latency to the mission: which missions can tolerate 480-700 ms, and which one literally flies at 20,000 km? Re-check with the readouts open."};
    },
    fbOk:"Orbit selection is a latency decision dressed as a coverage decision — the exam frames it exactly this way. Next: spec the fiber trunk on F-204.",
    fbNo:"Use the live RTT readouts: GEO physics cannot be tuned away, and MEO is where GNSS constellations live. Re-check."
  },
  {
    id:"OBJ-M5", pillar:"P2", text:"Certify order F-204: spec the 8.6 km, 10 Gbps, EMI-hostile inter-building trunk — medium, grade, connector and optics.",
    anchor:"CI-14/15/16/18 · SMF/MMF, reach, transceivers", go:{type:"order", id:"ord-fib"},
    hints:[
      "Read the F-204 evidence: 8.6 km and a substation yard. Neither short-reach optics nor copper noise survive those numbers.",
      "10GBASE-SR stops at 400 m even on OM4; 8.6 km is 10GBASE-LR territory, and LR only runs on single-mode.",
      "Single-mode + OS2 grade + LC connectors + 10GBASE-LR SFP+ certifies the trunk."
    ],
    validate:function(st){
      var f = _o(st.orders, "ord-fib");
      var ord = ORDERS_MED.filter(function(x){ return x.id === "ord-fib"; })[0];
      var ok = _eq(f.type, ord.form.type.indexOf(ord.formAns.type)) &&
               _eq(f.grade, ord.form.grade.indexOf(ord.formAns.grade)) &&
               _eq(f.conn, ord.form.conn.indexOf(ord.formAns.conn)) &&
               _eq(f.optics, ord.form.optics.indexOf(ord.formAns.optics));
      if(ok) return {pass:true, why:"Certified: OS2 single-mode + LC + 10GBASE-LR reaches 10 km — the 8.6 km route clears with margin, and glass ignores the substation."};
      var why = [];
      if(!_eq(f.type, ord.form.type.indexOf(ord.formAns.type))) why.push("the medium must be single-mode (MMF dies at 400 m on SR)");
      if(!_eq(f.grade, ord.form.grade.indexOf(ord.formAns.grade))) why.push("OS2 is the long-haul SMF grade");
      if(!_eq(f.conn, ord.form.conn.indexOf(ord.formAns.conn))) why.push("LC is the modern duplex patch connector");
      if(!_eq(f.optics, ord.form.optics.indexOf(ord.formAns.optics))) why.push("10GBASE-LR is the only listed optic that reaches 10 km");
      return {pass:false, why:"Not yet: " + why.join("; ") + "."};
    },
    fbOk:"Reach tables + EMI reality is how the exam asks fiber questions. Next: the connector match in MDL-FO.",
    fbNo:"The live reach readout shows the max distance of your current combination — make it clear 8.6 km. Near-misses (SR on SMF, LR on MMF) are invalid pairings."
  },
  {
    id:"OBJ-M6", pillar:"P2", text:"In module MDL-FO, match each fiber connector (LC, SC, ST, MPO) to its one-line description.",
    anchor:"CI-17 · connectors", go:{type:"module", id:"fiber"},
    hints:[
      "The fiber module lists all four connectors with descriptions.",
      "Two are legacy (one bayonet, one screw-era), two are current (small latch, ribbon).",
      "LC = small latch · SC = stick-and-click · ST = bayonet legacy · MPO = 12+ fiber ribbon."
    ],
    validate:function(st){
      var w = st.widgets["w-conn"] || {};
      var rows = LIB.filter(function(m){ return m.id === "fiber"; })[0].widget.rows;
      var ok = rows.every(function(r, i){ return _eq(w["r"+i], r.a); });
      return {pass: ok, why: ok ? "Correct. LC dominates today; MPO appears the moment you need 40/100G; ST and SC explain every old panel you will ever open." :
        "Each connector has one signature: latch type and fiber count. Re-read MDL-FO and re-match."};
    },
    fbOk:"Connector ID is pure recognition — free points on the exam and free credibility in a closet. Next: the dorm coax drop on C-118.",
    fbNo:"Descriptions are one-line signatures. LC latches, SC pushes, ST twists (bayonet), MPO carries 12+ fibers."
  },
  {
    id:"OBJ-M7", pillar:"P2", text:"Certify order C-118: pick the cable and connector for the dorm DOCSIS drop and compute the loss of the in-line 2-way splitter (dB, positive number).",
    anchor:"CI-21/22/23/28 · RG types, connectors, dB math", go:{type:"order", id:"ord-coax"},
    hints:[
      "Open C-118. Which RG survives 60 m of high-frequency DOCSIS carriers? The coax module compares gauges.",
      "RG-6 is 18 AWG quad shield; RG-59 thins out at high frequency. The screw-on TV plant connector is the F-type.",
      "Every 2-way split costs about 3.5 dB per leg — enter 3.5 (±0.2 accepted)."
    ],
    validate:function(st){
      var f = _o(st.orders, "ord-coax");
      var ord = ORDERS_MED.filter(function(x){ return x.id === "ord-coax"; })[0];
      var ok = _eq(f.rg, ord.options.rg.indexOf("RG-6")) && _eq(f.conn, ord.options.conn.indexOf("F-type (screw-on)")) && _num(f.loss, 3.2, 3.8);
      if(ok) return {pass:true, why:"Certified: RG-6 (18 AWG, quad shield) + F-type + a planned 3.5 dB hit for the splitter. Budgeting dB BEFORE amplifying is the whole DOCSIS discipline."};
      var why = [];
      if(!_eq(f.rg, ord.options.rg.indexOf("RG-6"))) why.push("RG-6 (not RG-59/RG-58) is the ISP-grade cable at 60 m");
      if(!_eq(f.conn, ord.options.conn.indexOf("F-type (screw-on)"))) why.push("F-type is the screw-on connector of TV/internet plant");
      if(!_num(f.loss, 3.2, 3.8)) why.push("one 2-way split is about 3.5 dB per leg");
      return {pass:false, why:"Not yet: " + why.join("; ") + "."};
    },
    fbOk:"Splitter math (-3.5 dB per leg) shows up on the exam as both a recall item and a troubleshooting story. Next: the rack DAC orders.",
    fbNo:"Check the live readout for the gauge of your chosen RG, and recompute: a 2-way splitter halves the power to each leg (about -3.5 dB)."
  },
  {
    id:"OBJ-M8", pillar:"P4", text:"Certify order D-077: pick the link type for the 1.5 m and 6 m rack spans and select the justification the NOC can adopt.",
    anchor:"CI-25/26/27 · DAC passive vs active, trade-offs", go:{type:"order", id:"ord-dac"},
    hints:[
      "Open D-077 and read the length limits in the DAC module.",
      "Passive DAC has no electronics; active DAC adds equalizers in the connector ends for longer runs.",
      "1.5 m = passive DAC · 6 m = active DAC · the justification cites the ~5 m passive limit."
    ],
    validate:function(st){
      var f = _o(st.orders, "ord-dac");
      var ord = ORDERS_MED.filter(function(x){ return x.id === "ord-dac"; })[0];
      var ok = _eq(f.l1, ord.linkOpts.indexOf("Passive DAC")) &&
               _eq(f.l2, ord.linkOpts.indexOf("Active DAC")) &&
               _eq(f.reason, ord.reasonAns);
      if(ok) return {pass:true, why:"Certified: passive at 1.5 m (cheapest, ~0.1-0.5 W), active at 6 m (electronics extend reach to ~10 m). Power saved versus optics: roughly half a watt per link, before cost."};
      var why = [];
      if(!_eq(f.l1, ord.linkOpts.indexOf("Passive DAC"))) why.push("1.5 m is passive DAC territory");
      if(!_eq(f.l2, ord.linkOpts.indexOf("Active DAC"))) why.push("6 m exceeds the ~5 m passive limit — active DAC");
      if(!_eq(f.reason, ord.reasonAns)) why.push("the justification must cite the passive length limit");
      return {pass:false, why:"Not yet: " + why.join("; ") + "."};
    },
    fbOk:"DAC policy (passive ≤ 5 m, active to ~10 m) is both a cost decision and a power decision — exactly what a rack consolidation asks. Next: the triage queue.",
    fbNo:"The live readouts show which span fails its length limit. 'Passive works at any length' is the classic trap — it does not."
  },
  {
    id:"OBJ-M9", pillar:"P3", text:"Work the X-009 triage queue: assign each of the three tickets its root cause from the six-cause pool.",
    anchor:"CI-05/20/23 · interference, plant damage, contamination", go:{type:"order", id:"ord-diag"},
    hints:[
      "Three tickets, three media: Wi-Fi, coax, fiber. Read each PATTERN line twice.",
      "2.45 GHz bursts at lunchtime = kitchen appliance; a cracked 90-degree bend = damaged coax; loss up after panel work = dirty connector.",
      "T1 = 2.4 GHz RF interference · T2 = kinked/damaged coax · T3 = contaminated fiber connector."
    ],
    validate:function(st){
      var f = _o(st.orders, "ord-diag");
      var ord = ORDERS_MED.filter(function(x){ return x.id === "ord-diag"; })[0];
      var ok = ord.answers.every(function(a, i){ return _eq(f["t"+(i+1)], a); });
      return {pass: ok, why: ok ? "All three triaged correctly. Diagnostics rule #1: match the time/space pattern to the physics of the medium before touching hardware." :
        "Wrong calls pair real phenomena with the wrong medium — for example, GEO latency cannot affect a library AP. Re-read the PATTERN lines."};
    },
    fbOk:"Triage is the Detect pillar in miniature: symptom → medium physics → cause. Next: the two matrices, where you rank everything at once.",
    fbNo:"Each ticket contains its own tell (frequency, bend, maintenance window). Assign causes again — the distractors belong to other media."
  },
  {
    id:"OBJ-M10", pillar:"P4", text:"Complete the selection matrix: five real asks, one build decision each. Every row has exactly one best answer.",
    anchor:"CI-32 · media selection (+CI-10/13/21/25)", go:{type:"panel", id:"matrix"},
    hints:[
      "Each row hides one deciding constraint: distance, mobility, latency, existing plant, power.",
      "8 km + EMI = SMF · festival mobility = cellular · ranch interactive = LEO · TV plant = RG-6/DOCSIS · 2 m 25G = passive DAC.",
      "Answers: OS2 SMF · Cellular 5G/LTE + event Wi-Fi · LEO satellite · RG-6 + DOCSIS · Passive DAC."
    ],
    validate:function(st){
      var m = st.matrix.sel || {};
      var bad = [];
      MATRIX.sel.rows.forEach(function(r){ if(!_eq(m[r.id], r.ans)) bad.push(r.id); });
      return {pass: bad.length===0, why: bad.length===0 ? "All five builds are defensible — that is compare-and-contrast mastery. Note how each row's constraint eliminated three options instantly." :
        "Rows not yet right: " + bad.join(", ") + ". Re-read each ask for its deciding constraint."};
    },
    fbOk:"This matrix IS the N10-009 1.5 objective: given requirements, choose and defend the medium. Next: the properties ranking.",
    fbNo:"For each row, name the constraint that eliminates the wrong answers (km, mobility, latency, existing coax, rack power) — then re-pick."
  },
  {
    id:"OBJ-M11", pillar:"P3", text:"Complete the properties matrix: rank the media families on EMI, tapping, interception, price and weather.",
    anchor:"CI-28/29/30/31 · cross-cutting properties", go:{type:"panel", id:"matrix"},
    hints:[
      "Five properties, five families: think immunity, tap resistance, interception, cheap short copper, weather.",
      "Fiber wins the physics rows; RF loses the interception row; the 2 m price row is twinax; rain fade belongs to satellite.",
      "EMI = fiber · tap-resistant = fiber · easiest intercept = wireless RF · cheapest 2 m = DAC · rain fade/LoS = satellite."
    ],
    validate:function(st){
      var m = st.matrix.prop || {};
      var bad = [];
      MATRIX.prop.rows.forEach(function(r){ if(!_eq(m[r.id], r.ans)) bad.push(r.id); });
      return {pass: bad.length===0, why: bad.length===0 ? "Ranking complete: these five comparisons are the exam's favorite one-liner territory." :
        "Rows not yet right: " + bad.join(", ") + ". Physics first: what carries the signal, and what can reach it?"};
    },
    fbOk:"You can now defend the full comparison table — the heart of objective 1.5. Finish with the quiz, then open Field Notes for the defender's summary.",
    fbNo:"Two rows are fiber physics (no conductor), one is RF physics (everyone with an antenna), one is price-per-meter, one is atmosphere."
  }
];

var OBJ_HARD = [
  {
    id:"OBJ-H1", pillar:"P2", text:"AUD-77: identify the real medium of all 8 evidence cards and flag exactly the cards whose printed tag lies. Two tags are wrong.",
    anchor:"CI-03/14/21 · evidence recognition, mislabels", go:{type:"order", id:"h-audit"},
    hints:["Two tags lie. Judge the PHYSICAL evidence, not the tag: jacket color, core size, laser wavelength, conductor gauge, fixed ends."],
    validate:function(st){
      var f = _o(st.orders, "h-audit");
      var def = ORDERS_HARD[0];
      var bad = [];
      def.items.forEach(function(it){
        var raw = f["m-" + it.id];
        var name = (raw === undefined || raw === "") ? "" : def.options[parseInt(raw, 10)];
        if(name !== def.answers[it.id]) bad.push(it.id + " medium");
        var shouldFlag = def.wrongTags.indexOf(it.id) >= 0;
        var flagged = f["w-"+it.id] === true;
        if(shouldFlag !== flagged) bad.push(it.id + " tag-flag");
      });
      return {pass: bad.length===0, why: bad.length===0 ? "Clean audit: 8 media identified, both lying tags (the 'OM4' trunk that is really yellow 9 um SMF, and the 'RG-6' riser that is really 20 AWG RG-59) flagged. This is exactly how label drift happens in real closets." :
        "Not yet: " + bad.join("; ") + ". Note A1: yellow jacket + 9 um + 12 km is SMF, whatever the tag says; A2: 20 AWG thin + short CCTV is RG-59."};
    },
    fbOk:"Label drift is a top-three field hazard: the tag is a claim, the jacket is evidence. Next: feasibility math.",
    fbNo:"Near-misses rejected with rationale: compare each card's physical facts against the tag. Two cards contradict themselves."
  },
  {
    id:"OBJ-H2", pillar:"P3", text:"FEA-12: rule all three proposed spans PASS or FAIL against their spec limits and pick the certified fix for every failure.",
    anchor:"CI-16/21/26 · reach limits", go:{type:"order", id:"h-feas"},
    hints:["Judge against the limit table: 40GBASE-SR4 = 150 m on OM4 · passive DAC = ~5 m · RG-59 at 1 GHz over 300 m = out of budget."],
    validate:function(st){
      var f = _o(st.orders, "h-feas");
      var ord = ORDERS_HARD.filter(function(x){ return x.id === "h-feas"; })[0];
      var bad = [];
      ord.rows.forEach(function(r){
        if(!_eq(f["v-"+r.id], 1)) bad.push(r.id + " verdict");
        if(!_eq(f["x-"+r.id], r.fixAns)) bad.push(r.id + " fix");
      });
      return {pass: bad.length===0, why: bad.length===0 ? "All three ruled FAIL with certified fixes: LR4 on SMF for 180 m, active DAC/AOC for 8 m, quad-shield RG-6 for the DOCSIS span. Reading limits before ordering parts is the job." :
        "Every one of these spans exceeds its limit — check the numbers again (150 m, ~5 m, high-frequency RG-59), and the fix must be a certified medium, not a band-aid."};
    },
    fbOk:"Feasibility triage is what change-review meetings are made of. Next: the latency budget.",
    fbNo:"Near-misses rejected: 'add an amplifier' does not fix RG-59 physics; 'try OM3' makes 180 m worse (OM3 = 100 m on SR4)."
  },
  {
    id:"OBJ-H3", pillar:"P3", text:"LAT-01: enter planning RTT values for GEO and LEO, rule each against the 150 ms voice SLA, and pick the NOC recommendation.",
    anchor:"CI-10/11 · latency physics", go:{type:"order", id:"h-lat"},
    hints:["GEO plans against ~480-700 ms RTT; LEO against ~25-60 ms. Only one of them meets a 150 ms SLA."],
    validate:function(st){
      var f = _o(st.orders, "h-lat");
      var ord = ORDERS_HARD.filter(function(x){ return x.id === "h-lat"; })[0];
      var ok = _num(f.geo, 450, 700) && _num(f.leo, 20, 70) && _eq(f.vgeo, 1) && _eq(f.vleo, 0) && _eq(f.rec, ord.recAns);
      return {pass: ok, why: ok ? "Budget done: GEO fails the SLA by 3-4x (physics: ~72,000 km round trip at light speed); LEO passes with margin. The NOC line: LEO carries voice, GEO stays on broadcast." :
        "Check: GEO RTT accepted range 450-700 ms, LEO 20-70 ms; verdicts must follow the numbers, and the recommendation must send voice somewhere that can carry it."};
    },
    fbOk:"Latency budgets turn orbit classes into procurement decisions — the exam loves this framing. Next: spectrum forensics.",
    fbNo:"Enter typical PLANNING values (mid-range), not best-case marketing numbers. Then let the SLA rule, not your hopes."
  },
  {
    id:"OBJ-H4", pillar:"P3", text:"RF-88: re-plan the three APs on the non-overlapping set, name the interferer, set the width, and call the density strategy.",
    anchor:"CI-03/05 · channel planning, interference", go:{type:"order", id:"h-spec"},
    hints:["Build from {1, 6, 11} against the neighbors on 1 and 6; the 2.45 GHz lunchtime bursts are kitchen-grade; 40% of clients are 2.4-only."],
    validate:function(st){
      var f = _o(st.orders, "h-spec");
      var ord = ORDERS_HARD.filter(function(x){ return x.id === "h-spec"; })[0];
      var chs = [f["ch-0"], f["ch-1"], f["ch-2"]].map(function(x){ return parseInt(x,10); });
      var setOk = _sameSet(chs, [1,6,11]);
      var ok = setOk &&
        _eq(f.interferer, ord.interfererOpts.indexOf("Microwave oven (2.45 GHz)")) &&
        _eq(f.width, ord.widthOpts.indexOf("20 MHz")) &&
        _eq(f.strategy, ord.strategyOpts.indexOf("Move high-density to 5/6 GHz, keep 2.4 GHz for legacy clients"));
      return {pass: ok, why: ok ? "Floor re-planned: APs on 1/6/11 at 20 MHz clear both the neighbors and each other; the microwave explains the lunchtime noise; density moves to 5/6 GHz with 2.4 GHz kept for the legacy 40%." :
        "Not yet: " + (setOk ? "" : "the three APs must hold exactly {1, 6, 11} between them (distinct); ") + "the burst signature at 2.45 GHz is a microwave oven; 20 MHz on 2.4 GHz; density belongs on 5/6 GHz."};
    },
    fbOk:"Spectrum forensics: separate permanent topology faults (overlap) from cyclic environment noise (the oven), then move capacity to the band that can carry it.",
    fbNo:"Near-misses rejected: 'co-channel overlap only' ignores the 2.45 GHz burst; 'boost power' makes the collision bigger, not smaller."
  },
  {
    id:"OBJ-H5", pillar:"P3", text:"FBR-31: root-cause the OM1 failures, state the 10G OM1 distance limit, and prescribe the remediation set (wrong boxes break the check).",
    anchor:"CI-16/20 · reach limits, connector hygiene", go:{type:"order", id:"h-fibfix"},
    hints:["Orange OM1 dies at 33 m on 10GBASE-SR — and the span is 45 m. Remediation = laser-optimized fiber + clean connectors."],
    validate:function(st){
      var f = _o(st.orders, "h-fibfix");
      var ord = ORDERS_HARD.filter(function(x){ return x.id === "h-fibfix"; })[0];
      var ok = _eq(f.cause, ord.causeOpts.indexOf("OM1 exceeds its 10GBASE-SR distance limit (45 m > limit)")) &&
               _num(f.limit, 32, 34) && f["a-0"]===true && f["a-1"]===true && f["a-2"]!==true;
      return {pass: ok, why: ok ? "Correct: OM1 carries 10GBASE-SR only 33 m (the 45 m span never truly met spec), and the panel work added dirty-ferrule loss on top. Re-pull OM3/OM4, clean and inspect every LC, re-test." :
        "Check: cause must cite the OM1 10G limit (33 m ± 1); remediation requires the fiber re-pull AND connector hygiene; the coax box does not belong in a fiber remedy."};
    },
    fbOk:"Two faults can share one symptom: a marginal medium (OM1 at 10G) plus a maintenance-induced loss (dirt). Fix both or the flapping returns.",
    fbNo:"Near-misses rejected: 'swap SMF/MMF' contradicts the orange jacket; 'gender mismatch' does not explain loss magnitude. The limit is 33 m, not 300."
  },
  {
    id:"OBJ-H6", pillar:"P4", text:"KIT-04: choose the kit's primary and fallback connectivity and mark every rejected option with its reason.",
    anchor:"CI-08/09/13 · use-case planning", go:{type:"order", id:"h-kit"},
    hints:["Mobility + 50 Mbps sustained = cellular sub-6; where towers are gone, LEO answers. GEO latency and mmWave line-of-sight are the rejects — so is anything made of copper."],
    validate:function(st){
      var f = _o(st.orders, "h-kit");
      var ord = ORDERS_HARD.filter(function(x){ return x.id === "h-kit"; })[0];
      var ok = _eq(f.primary, ord.primaryOpts.indexOf("LTE-A / 5G sub-6 GHz with eSIM")) &&
               _eq(f.fallback, ord.fallbackOpts.indexOf("LEO flat-panel VSAT")) &&
               f["rj-0"]===true && f["rj-1"]===true && f["rj-2"]===true;
      return {pass: ok, why: ok ? "Kit spec'd: LTE-A/5G sub-6 primary (moves with the teams, 50+ Mbps realistic), LEO flat-panel fallback (works where towers are down), GEO/mmWave/DAC rejected for latency, line-of-sight and irrelevance respectively." :
        "Check all three boxes: each rejected option needs its reason marked. GEO breaks interactive apps, mmWave breaks on mobility, DAC is rack-only copper."};
    },
    fbOk:"Contingency design = primary, fallback, and documented rejections. The exam asks 'which option and WHY NOT the others' more often than you would think.",
    fbNo:"Near-misses rejected: a GEO-only kit breaks the video-call requirement; an mmWave CPE cannot ride in a moving vehicle."
  },
  {
    id:"OBJ-H7", pillar:"P2", text:"STD-19: place all five feature cards against their 802.11 amendments — and leave the decoy unplaced.",
    anchor:"CI-01/04 · amendments and features", go:{type:"order", id:"h-amp"},
    hints:["Five cards fit the five amendments; the '9.6 Gbps on 60 GHz' card is a WiGig decoy that belongs to none of them."],
    validate:function(st){
      var f = _o(st.orders, "h-amp");
      var ord = ORDERS_HARD.filter(function(x){ return x.id === "h-amp"; })[0];
      var ok = ord.answers.every(function(a, i){ return _eq(f["amp-"+i], a); });
      return {pass: ok, why: ok ? "Placed: a = first OFDM on 5 GHz; b = 2.4 GHz/11 Mbps DSSS; n = first MIMO + 40 MHz bonding; ac = 5 GHz MU-MIMO; ax = OFDMA + TWT + 6E. The 60 GHz card is WiGig (802.11ad) — deliberately not on the board." :
        "Each card goes to exactly one amendment and each amendment to one card — the decoy stays out. OFDM-first is a, MU-MIMO is ac, OFDMA+TWT is ax."};
    },
    fbOk:"Amendment-to-feature mapping is half of the Wi-Fi questions you will meet; the 60 GHz family (ad/ay) is the classic decoy.",
    fbNo:"Near-misses rejected: '9.6 Gbps' pairs with ax only on 2.4/5/6 GHz — 60 GHz is a different amendment family entirely."
  },
  {
    id:"OBJ-H8", pillar:"P4", text:"CPL-09: compute the total splitter loss, re-spec the medium and termination, and set the amplifier policy.",
    anchor:"CI-22/23 · DOCSIS plant, dB math", go:{type:"order", id:"h-coax"},
    hints:["dB adds in series: -3.5 then -5 → about -8.5 total. Medium = quad-shield RG-6; termination = weatherized torque-spec F-type; amplify only when the budget says so."],
    validate:function(st){
      var f = _o(st.orders, "h-coax");
      var ord = ORDERS_HARD.filter(function(x){ return x.id === "h-coax"; })[0];
      var ok = _num(f.total, 8.1, 8.9) &&
               _eq(f.rg, ord.rgOpts.indexOf("RG-6 quad-shield")) &&
               _eq(f.conn, ord.connOpts.indexOf("F-type, weatherproofed, torque-spec")) &&
               _eq(f.amp, ord.ampOpts.indexOf("Unity-gain amp at the ground block when the budget is exceeded"));
      return {pass: ok, why: ok ? "Plant spec'd: about 8.5 dB of passive loss (3.5 + 5), quad-shield RG-6 throughout, weatherized torque-spec F-type, and a unity-gain amp at the ground block only if the modem's budget is exceeded. Amplifiers add noise — they are a last resort, not a fixture." :
        "Check: 3.5 + 5 = 8.5 dB (± 0.4); RG-6 quad-shield; weatherized F-type; the amp is conditional, not automatic."};
    },
    fbOk:"dB budgets are additive — that is the whole skill. One number, one medium, one policy: the DOCSIS upgrade in three lines.",
    fbNo:"Near-misses rejected: 'amplify everything' trades noise for level; RG-58 is 50-ohm legacy Thinnet, not TV plant."
  },
  {
    id:"OBJ-H9", pillar:"P4", text:"PWR-55: pick the link type for the 0.8 m, 6 m and 25 m spans (two spans admit more than one right answer), compute the power saved on 8 links, and set the policy line.",
    anchor:"CI-27/31 · DAC trade-offs, cost", go:{type:"order", id:"h-rack"},
    hints:["0.8 m = passive DAC; 6 m exceeds the ~5 m passive limit (active DAC or AOC); 25 m = AOC or SMF LR optics. Power: 8 links x (1.0 - 0.4) W."],
    validate:function(st){
      var f = _o(st.orders, "h-rack");
      var ord = ORDERS_HARD.filter(function(x){ return x.id === "h-rack"; })[0];
      var acc = ord.accept;
      var bad = [];
      ["p1","p2","p3"].forEach(function(id){
        var raw = f["lnk-" + id];
        var name = (raw === undefined || raw === "") ? "" : ord.linkOpts[parseInt(raw, 10)];
        if(acc[id].indexOf(name) < 0) bad.push(id);
      });
      var ok = bad.length===0 && _num(f.power, 3.5, 6.0) && _eq(f.reason, ord.reasonAns);
      if(ok) return {pass:true, why: bad.length===0 ? "Consolidation spec'd: passive at 0.8 m, active DAC or AOC at 6 m, AOC or LR optics at 25 m — and about 4.8 W saved across 8 links (8 x 0.6 W). Small numbers on a switch; real money across a data center." :
        "Not yet: " + bad.join(", ") + "."};
      return {pass:false, why:"Not yet: " + (bad.length? bad.join(", ") + " link type; " : "") + "power saved must be about 8 x (1.0 - 0.4) = 4.8 W (accept 3.5-6.0), and the policy must match the length limits."};
    },
    fbOk:"This is the DAC trade-off as a procurement decision: reach limits first, then power, then price. Your policy line is adoptable verbatim.",
    fbNo:"Near-misses rejected: passive DAC at 6 m exceeds its ~5 m limit; LR optics everywhere pays 1 W per link for nothing at 0.8 m."
  }
];

/* hard-mode orders reference data defined in 03-data.js */

/* ---------------- check engine ---------------- */

function checkObjective(id){
  var o = objListFor().filter(function(x){ return x.id === id; })[0];
  if(!o) return {pass:false, why:"unknown objective"};
  var res = o.validate(st());
  var rec = st().objectives[id] || (st().objectives[id] = {done:false, attempts:0, firstTry:null, last:null, passed:false});
  rec.attempts++;
  if(res.pass){
    if(rec.firstTry === null) rec.firstTry = rec.attempts === 1;
    rec.done = true; rec.passed = true;
    var ord = ordersFor().filter(function(x){ return x.obj === id; })[0];
    if(ord){
      var ost = st().orders[ord.id] || (st().orders[ord.id] = {fields:{}, certified:false});
      ost.certified = true;
    }
    rec.last = res.why + " " + o.fbOk;
    rec.lastIsHint = false;
    toast(id + " complete — " + doneCount() + "/" + objListFor().length + " objectives");
    sr(id + " passed. " + res.why);
  } else {
    if(rec.firstTry === null) rec.firstTry = false;
    rec.passed = false;
    rec.last = res.why + " " + o.fbNo;
    rec.lastIsHint = false;
    sr(id + " not yet passed. " + res.why);
  }
  save();
  renderCard(); renderBoard(); updateMeter();
  return res;
}
function doneCount(){
  return objListFor().filter(function(o){ var r = st().objectives[o.id]; return r && r.done; }).length;
}
