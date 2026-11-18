/* ============================================================
   Commission Room 104 — N10-009 Lesson 2.4 Physical Installations Lab
   js/data.js — the full content layer: devices, sizing constants,
   matching pairs, sequences, drills, logs, incidents, work order,
   exam, quiz banks, glossary, objective metadata, hints, feedback.
   Data only — no behavior. Loaded first.
   ============================================================ */
"use strict";
/* ================= DATA LAYER — Commission Room 104 ================= */

const DEVICES = [
  {id:"ups2", name:"UPS 3 kVA (2U)",        u:2, w:0,   kg:32, psu:0, note:"Battery backup for the whole rack"},
  {id:"srv1", name:"Server Node A (2U)",    u:2, w:450, kg:22, psu:2},
  {id:"srv2", name:"Server Node B (2U)",    u:2, w:450, kg:22, psu:2},
  {id:"stor", name:"Storage Array (2U)",    u:2, w:380, kg:30, psu:2},
  {id:"sw",   name:"Core Switch (1U)",      u:1, w:180, kg:5,  psu:2},
  {id:"rtr",  name:"Edge Router (1U)",      u:1, w:90,  kg:6,  psu:1},
  {id:"kvm",  name:"KVM Console (1U)",      u:1, w:30,  kg:4,  psu:1},
  {id:"pp",   name:"Patch Panel (1U)",      u:1, w:0,   kg:2,  psu:0, note:"Copper terminations"},
  {id:"fdp",  name:"Fiber Distribution Panel (1U)", u:1, w:0, kg:2, psu:0, note:"Fiber terminations"},
  {id:"cm",   name:"Cable Manager (1U)",    u:1, w:0,   kg:2,  psu:0},
  {id:"blank",name:"Blanking Panel (1U)",   u:1, w:0,   kg:1,  psu:0, note:"Multi-place"}
];
const UPS_MODELS = [
  {v:"750",  label:"750 VA / 600 W"},
  {v:"1500", label:"1500 VA / 1200 W"},
  {v:"2200", label:"2200 VA / 1760 W"},
  {v:"3000", label:"3000 VA / 2400 W"}
];
const IT_DEVICE_IDS = ["srv1","srv2","stor","sw","rtr","kvm"]; // powered devices
const DUAL_IDS = ["srv1","srv2","stor","sw"];
const SINGLE_IDS = ["rtr","kvm"];
const CIRCUIT_USABLE = 1440; // 15A x 120V x 80% (simplified)
const TOTAL_LOAD = 1580;     // sum of IT_DEVICE_IDS watts
const UPS_MIN_W = 1975;      // 1580 x 1.25

const MATCH_TERMS = [
  {id:"t1",  term:"Rack unit (U)",  def:"1.75 in (44.45 mm) of vertical rack space; a 2U device fills two units"},
  {id:"t2",  term:"MDF",            def:"Main distribution frame — the primary comms room where service entrances land"},
  {id:"t3",  term:"IDF",            def:"Intermediate distribution frame — a downstream wiring closet that homes to the MDF"},
  {id:"t4",  term:"Patch panel",    def:"Copper termination point; rear punch-downs, front ports patch to switches"},
  {id:"t5",  term:"Fiber distribution panel", def:"Termination and patching point for fiber runs"},
  {id:"t6",  term:"UPS",            def:"Battery-backed unit that bridges a power outage instantly (no transfer gap)"},
  {id:"t7",  term:"PDU",            def:"Power distribution unit — splits UPS/panel power into rack outlets"},
  {id:"t8",  term:"ATS",            def:"Automatic transfer switch — starts/switches to the generator on utility loss"},
  {id:"t9",  term:"Cold aisle",     def:"Aisle equipment intakes from; perforated tiles supply conditioned air here"},
  {id:"t10", term:"Blanking panel", def:"Fills empty rack U so air flows front-to-back through gear, not around it"}
];
// display order for the vocabulary board is runtime-shuffled (see ensureMatchOrder)

const SEQ_POWER = [
  {id:"utility", label:"Utility service entrance"},
  {id:"ats",     label:"Automatic transfer switch (generator)"},
  {id:"ups",     label:"UPS"},
  {id:"pdu",     label:"Rack PDU"},
  {id:"psu",     label:"Device power supply"}
];
const SEQ_POWER_ANSWER = ["utility","ats","ups","pdu","psu"];

const SEQ_PLAN = [
  {id:"room",  label:"Verify room & location (MDF/IDF decision, floor load, door)"},
  {id:"racks", label:"Mount racks & secure gear"},
  {id:"power", label:"Provision power (circuits, UPS, PDU)"},
  {id:"cabling", label:"Run & terminate cabling (patch panel, FDP)"},
  {id:"environment", label:"Configure environment (cooling, humidity, fire suppression)"},
  {id:"signoff", label:"Test, label, document & sign off"}
];
const SEQ_PLAN_ANSWER = ["room","racks","power","cabling","environment","signoff"];

const DRILL = [
  {k:"mdf",   q:"Floor plan says Room C-104 is the building's ONLY comms room; four wiring closets on floors 2–5 home-run to it. Room C-104 is the…",
   opts:[["IDF","IDF — a downstream closet"],["MDF","MDF — the main distribution frame"],["Neither","Neither — it's a user area"]], ans:"MDF"},
  {k:"copper", q:"All Cat6 horizontal runs from the closets terminate on the…",
   opts:[["patch","Patch panel (copper)"],["fdp","Fiber distribution panel"],["ups","UPS"]], ans:"patch"},
  {k:"fiber", q:"The ISP's single-mode fiber entrance lands on the…",
   opts:[["cm","Cable management tray"],["patch","Copper patch panel"],["fdp","Fiber distribution panel"]], ans:"fdp"},
  {k:"bend",  q:"Inspection: a Cat6 run has a hard 90° kink crushed behind the panel. Correct action?",
   opts:[["leave","Leave it — copper forgives"],["repull","Re-pull to the bend radius"],["tape","Tape the kink straight for support"],["elbow","Add another elbow for strain relief"]], ans:"repull"},
  {k:"label", q:"Which labeling scheme passes the site standard (TIA-606-style, simplified)?",
   opts:[["names","Users' names per port"],["colors","Random color tape only"],["none","No labels; staff memorize"],["position","Position scheme: rack-panel-port (R1-PP-A/P12)"]], ans:"position"}
];

const LOG_EVENTS = [
  {t:"21:40", txt:"Door C-104 opened (contact sensor); closed 4 min later.", cls:"norm"},
  {t:"21:42", txt:"Cold-aisle intake 22.4 °C / 45 % RH.", cls:"norm"},
  {t:"21:58", txt:"UPS self-test passed — 12 min on battery, no transfer.", cls:"norm"},
  {t:"22:01", txt:"CRAC-1 compressor fault — high head pressure; unit offline.", cls:"crit"},
  {t:"22:05", txt:"Cold-aisle intake 25.1 °C — trend +1.2 °C/min.", cls:"warn"},
  {t:"22:12", txt:"Cold-aisle intake 28.4 °C / 41 % RH.", cls:"crit"}
];
const LOG_CONTEXT_HARD = [
  {t:"20:05", txt:"Generator exercised on schedule — no transfer.", ctx:true},
  {t:"21:10", txt:"Firmware maintenance window scheduled Thursday.", ctx:true}
];
const LOG_CONTEXT_HARD2 = [
  {t:"22:20", txt:"Cleaning crew confirmed for Friday 22:00.", ctx:true},
  {t:"22:31", txt:"PDU-B load steady at 560 W.", ctx:true}
];
const TRIAGE_OPTS = [["","— classify —"],["normal","Normal"],["warning","Warning"],["critical","Critical"]];
const TRIAGE_ANS = ["normal","normal","normal","critical","warning","critical"];
const CAUSE_OPTS = [["","— pick the root cause —"],["crac","CRAC-1 compressor failure stopped cooling"],["door","Door was left open"],["ups","UPS self-test heat load"],["cleaning","Cleaning crew heat load"]];
const JUST_KEYWORDS = ["crac","compressor","cool","hvac"];

const INCIDENTS = [
  {id:"inc1", title:"Ticket 4471 — Surge damage",
   txt:"Lightning hit the upstream feeder last night. Both core-switch power supplies died.",
   opts:[["gen","Add a standby generator"],
         ["therm","Lower the thermostat to 18 °C"],
         ["spd","Add surge protection; replace damaged PSUs"],
         ["tiles","Add blanking panels to the rack"]], ans:"spd"},
  {id:"inc2", title:"Ticket 4472 — Long outage",
   txt:"Utility outage lasted 3 hours. The UPS batteries drained after 40 minutes and everything shut down.",
   opts:[["gen","Add a standby generator with ATS"],
         ["spd","Add a second surge protector"],
         ["ups2","Add a larger UPS to the rack"],
         ["tiles","Open more perforated floor tiles"]], ans:"gen"},
  {id:"inc3", title:"Ticket 4473 — Thermal excursion",
   txt:"CRAC-1's compressor failed. Intake temperature reached 30 °C before anyone noticed.",
   opts:[["door","Prop the room door open wider"],
         ["therm","Raise the thermostat setpoint higher"],
         ["spd","Add surge protection at the racks"],
         ["crac","Add N+1 redundant CRAC; tune alarms"]], ans:"crac"},
  {id:"inc4", title:"Ticket 4474 — Under-floor water",
   txt:"A chilled-water line cracked under the raised floor. Water pooled for hours before discovery.",
   opts:[["humid","Raise RH to 60 %"],
         ["leak","Install under-floor leak detection with shutoff"],
         ["ups","Move the UPS to the rack top"],
         ["crac","Add a second CRAC unit"]], ans:"leak"},
  {id:"inc5", title:"Ticket 4475 — Dry air",
   txt:"Winter heating season: RH reads 22 % and staff report static shocks at the racks.",
   opts:[["therm","Raise the temperature to 30 °C"],
         ["dehum","Add a dehumidifier to dry the air"],
         ["humid","Add humidification to reach the RH band"],
         ["tiles","Open the under-floor cutouts wider"]], ans:"humid"},
  {id:"inc6", title:"Ticket 4476 — Phantom breaker trips (NIGHT SHIFT)",
   txt:"A feeder breaker trips repeatedly with no load change. No electrician is on site tonight.",
   opts:[["ups","Add a bigger UPS to the feeder"],
         ["escalate","No hardware fix; call an electrician"],
         ["spd","Add a surge protector upstream"],
         ["tiles","Seal the under-floor cutouts tight"]], ans:"escalate", hard:true}
];

const WORKORDER = [
  {txt:"Rack: 42U floor rack, anchor to slab; cage nuts supplied.", bad:false},
  {txt:"Mount the 2U UPS at U42 (top of rack) — easiest access.", bad:true},
  {txt:"Patch panel at U24, core switch at U10 — 15 ft jumpers approved.", bad:true},
  {txt:"Cat6 runs: maintain ≥4× outside-diameter bend radius; no kinks.", bad:false},
  {txt:"Label ports with the position scheme (rack / panel / port).", bad:false},
  {txt:"Power: plug BOTH power supplies of each server into the same PDU outlet strip for simplicity.", bad:true},
  {txt:"Leave the under-floor cable cutouts open for future flexibility.", bad:true},
  {txt:"Skip blanking panels — budget.", bad:true},
  {txt:"RH setpoint 45 %; alert band 40–60 %.", bad:false},
  {txt:"Existing sprinkler heads above the racks are sufficient; no special suppression needed.", bad:true}
];

const EXAM = [
  {k:"e1", q:"One rack unit (1U) = ____ inches of vertical space.", type:"num", ans:1.75, tol:0.01, unit:"in"},
  {k:"e2", q:"Under the 80 % guideline (simplified), usable watts on ONE 15 A / 120 V circuit: ____ W", type:"num", ans:1440, tol:1, unit:"W"},
  {k:"e3", q:"Room C-104 is the building's only comms room and all closets home-run to it. It is the…", type:"sel",
   opts:[["MDF","MDF"],["IDF","IDF"]], ans:"MDF"},
  {k:"e4", q:"In a hot/cold-aisle room, equipment FRONT faces (intake) point…", type:"sel",
   opts:[["hot","Into the hot aisle"],["wall","Toward the wall"],["cold","Into the cold aisle"]], ans:"cold"},
  {k:"e5", q:"Preferred fire suppression for an occupied equipment room (simplified):", type:"sel",
   opts:[["clean","A clean-agent suppression system"],["wet","Wet sprinklers over every rack"],["none","None"]], ans:"clean"},
  {k:"e6", q:"RH falls to 22 % in winter. The primary equipment risk is…", type:"sel",
   opts:[["cond","Condensation on boards"],["esd","Electrostatic discharge (ESD)"],["mold","Mold on surfaces"]], ans:"esd"},
  {k:"e7", q:"Which device bridges a 10-minute utility outage?", type:"sel",
   opts:[["ups","UPS"],["ats","ATS alone"],["spd","Surge protector"]], ans:"ups"},
  {k:"e8", q:"Is a 1580 W load on ONE 15 A / 120 V circuit compliant with the 80 % guideline (1440 W usable)?", type:"sel",
   opts:[["yes","Yes — 1580 W is under 1440 W"],["no","No — 1580 W exceeds 1440 W"]], ans:"no"}
];

const QUIZ_M = [
  {q:"How much vertical space is one rack unit (1U)?",
   opts:["1.25 inches","3.5 inches","1.75 inches","2.5 inches"], ans:2,
   expl:"A rack unit is standardized at 1.75 in / 44.45 mm of vertical pitch. A “2U” device fills two units — that is exactly what “rack size” means when you plan an elevation."},
  {q:"Why mount the patch panel directly beside the core switch?",
   opts:["Short jumpers keep cabling and patching simple","It looks tidy from the front aisle","The switch heats the panel's terminals","Longer jumpers violate the site standard"], ans:0,
   expl:"Panel-next-to-switch keeps patch cords short: less cable clutter in the front, less blocking of intake air, and faster moves/adds/changes. This is the classic installation-implications pairing."},
  {q:"In a hot/cold-aisle layout, where should equipment FRONT faces (intake) point?",
   opts:["Toward the wall","Toward the hot aisle","Upward","Toward the cold aisle"], ans:3,
   expl:"Servers pull air in at the front and exhaust at the rear (port-side intake/exhaust). Fronts face the cold aisle so gear breathes conditioned air; exhausts feed the hot aisle back to the CRAC."},
  {q:"A UPS differs from a surge protector because the UPS…",
   opts:["Clamps short voltage transients like an SPD does","Carries the load through an outage on battery","Steps the 120 V supply down to 12 V","Filters dust from the incoming intake air"], ans:1,
   expl:"Both matter, but they answer different threats: the SPD clamps short voltage spikes; the UPS carries the load through the seconds-to-minutes gap until the generator (via the ATS) takes over."},
  {q:"Under the 80 % continuous-load guideline (simplified), usable watts on one 15 A / 120 V circuit are:",
   opts:["1440 W","1800 W","1580 W","1200 W"], ans:0,
   expl:"15 A × 120 V = 1800 VA; the 80 % design rule (simplified NEC guidance) leaves 1440 W of usable continuous load. This is why Room 104's 1580 W load needs two feeds."},
  {q:"Relative humidity falls to 22 % in winter. The main equipment risk is:",
   opts:["Condensation on boards","Corrosion from moisture","Clogged air intake filters","Electrostatic discharge (ESD)"], ans:3,
   expl:"Dry air builds static charge that discharges into pins and boards. That is why the simplified guidance keeps RH at 40–60 % — high humidity brings condensation risk instead."}
];

const QUIZ_H = [
  {q:"The contractor loaded the 42U rack with the UPS at the very top. Biggest operational problem?",
   opts:["It draws slightly more power than usual","It cools the lower devices more evenly","None — rack position is purely cosmetic","Top-heavy: tipping risk plus unsafe overhead lifting"], ans:3,
   expl:"Heavy equipment belongs at the bottom of the elevation: the rack stays stable, floor loading is easier to manage, and nobody wrestles a 32 kg UPS at shoulder height."},
  {q:"02:00 log: RH 68 % overnight with condensation on the window sill. First response?",
   opts:["Investigate the moisture source and dehumidify first","Ignore it — RH numbers are only cosmetic","Raise the thermostat setpoint to 30 °C","Switch off the CRAC unit overnight"], ans:0,
   expl:"Above the 40–60 % band (simplified) you risk condensation and corrosion. Find the moisture source first — a humidifier fighting a leak is a losing battle."},
  {q:"Can a 1580 W load run on ONE 15 A / 120 V circuit under the 80 % guideline (1440 W usable)?",
   opts:["Yes — 1580 W fits below 1440 W usable","Yes — thicker cable raises the circuit limit","No — 1580 W exceeds the 1440 W cap","Yes, but only during night hours"], ans:2,
   expl:"1580 W > 1440 W usable. This is the exact trap the A/B-feed wiring exercise fixes: two feeds, each within the guideline, with dual-PSU gear split between them."},
  {q:"Load is 1580 W and you want ≥25 % headroom (PF 0.8, simplified). Which UPS is correctly sized?",
   opts:["750 VA / 600 W","3000 VA / 2400 W","1500 VA / 1200 W","2200 VA / 1760 W"], ans:1,
   expl:"1580 × 1.25 = 1975 W needed. VA × 0.8 = W, so 2200 VA gives only 1760 W — short. The 3000 VA (2400 W) model clears 1975 W with margin."},
  {q:"Occupied equipment room with paper records nearby — preferred suppression (simplified)?",
   opts:["Wet sprinklers above the racks","A clean-agent suppression system","No active suppression installed","Water buckets kept per aisle"], ans:1,
   expl:"Clean agents knock down fire without soaking 2U of electronics or paperwork. Sprinklers protect the building shell, not the gear — hence agent systems (or pre-action) in equipment rooms."},
  {q:"Utility power fails at 02:00. What does the automatic transfer switch actually do?",
   opts:["Senses the loss and starts the generator","Filters harmonic distortion on the feed","Bridges the seconds gap on battery","Shuts everything down in a safe order"], ans:0,
   expl:"Chain position matters: ATS handles minutes-to-hours (generator), UPS handles the seconds during changeover. Neither substitutes for the other."},
  {q:"The contractor left cable cutouts open and installed no blanking panels. What symptom will you see?",
   opts:["Silent NICs on the copper links","Brownouts on the A feed only","Optical loss at the FDP ports","Hot spots as conditioned air short-cycles"], ans:3,
   expl:"Open cutouts and empty rack U short-circuit the airflow path: cold air escapes through the floor, hot exhaust recirculates to intakes, and intake temperatures climb — exactly what the alarm thresholds should catch."}
];

const GLOSSARY = [
  {t:"Rack unit (U)", d:"1.75 in (44.45 mm) of vertical rack space; a “2U” device fills two units."},
  {t:"MDF", d:"Main distribution frame: the building's primary comms room where service entrances land."},
  {t:"IDF", d:"Intermediate distribution frame: a downstream wiring closet that homes to the MDF."},
  {t:"Patch panel", d:"Copper termination point; rear punch-downs, front ports patch to switches."},
  {t:"Fiber distribution panel (FDP)", d:"Termination and patching point for fiber runs."},
  {t:"UPS", d:"Battery-backed unit that bridges a power outage instantly (no transfer gap)."},
  {t:"PDU", d:"Power distribution unit: splits UPS/panel power into rack outlets."},
  {t:"ATS", d:"Automatic transfer switch: starts/switches to the generator on utility loss."},
  {t:"Surge protector (SPD)", d:"Clamps short-duration voltage transients; does NOT bridge outages."},
  {t:"Power load", d:"Total watts drawn; design rule of thumb: keep circuits at ≤80 % (simplified)."},
  {t:"Voltage", d:"Electrical potential; North American rack gear typically uses 120 V branch circuits (simplified)."},
  {t:"Hot aisle", d:"Aisle equipment exhausts into; hot air returns to the CRAC."},
  {t:"Cold aisle", d:"Aisle equipment intakes from; perforated tiles supply conditioned air here."},
  {t:"Blanking panel", d:"Fills empty rack U so air flows front-to-back through gear, not around it."},
  {t:"CRAC", d:"Computer room air conditioner; CRAC N+1 means one more unit than strictly needed."},
  {t:"Relative humidity (RH)", d:"Water vapor in air; the simplified guidance band is 40–60 % (ESD below, condensation above)."},
  {t:"Clean-agent suppression", d:"Gas-based fire suppression that is safe for energized electronics (simplified)."},
  {t:"Bend radius", d:"Minimum curve a cable tolerates; Cat6 ≈ 4× its outside diameter (simplified)."}
];

const OBJMETA = {
  M1:{pillar:"U", console:"briefing", title:"Match the site vocabulary", anchor:"2.4 sub-bullets: IDF/MDF, rack size, UPS, PDU, cabling panels",
      desc:"Open the Briefing board and match all 10 terms to their definitions. This is the language every later objective uses."},
  M2:{pillar:"U", console:"power", title:"Assemble the power chain in order", anchor:"Power: UPS, PDU (+ ATS context)",
      desc:"In Power Works, drag the five chain elements into the correct order from the utility to a device's power supply."},
  M3:{pillar:"U", console:"signoff", title:"Sequence the commissioning plan", anchor:"All 2.4 facets, lifecycle view",
      desc:"On the Sign-off Desk, order the six commissioning steps for Room C-104."},
  M4:{pillar:"R", console:"rack", title:"Build a compliant 15U rack", anchor:"Rack size, patch-panel adjacency, blanking, lockable",
      desc:"In Rack Works, place every device so all five elevation rules pass. Click a device chip, then a slot; click placed gear to remove it."},
  M5:{pillar:"R", console:"power", title:"Size the power system", anchor:"Power: power load, voltage, UPS",
      desc:"In Power Works: compute the IT load in watts, pick the UPS with ≥25 % headroom, state the usable watts on one 15 A / 120 V circuit, and select the circuit voltage."},
  M6:{pillar:"R", console:"climate", title:"Fix the airflow path", anchor:"Port-side exhaust/intake, temperature management",
      desc:"In Climate Works: point both rack rows' fronts at the aisle, configure the aisle as COLD with vent tiles open, and seal the under-floor cable cutouts."},
  M7:{pillar:"R", console:"rack", title:"Pass the cable & standards drill", anchor:"Locations IDF/MDF, cabling: patch panel + FDP, lockable context",
      desc:"In Rack Works (Cable & standards card), answer the five termination and standards questions."},
  M8:{pillar:"D", console:"climate", title:"Place sensors & choose suppression", anchor:"Environmental factors: temperature, humidity, fire suppression",
      desc:"On the room map, place the intake, under-floor-leak and ceiling sensors, then select the fire suppression type for an occupied equipment room."},
  M9:{pillar:"D", console:"climate", title:"Set the alarm thresholds", anchor:"Environmental factors: temperature, humidity",
      desc:"In Climate Works, set the four alert thresholds to the simplified guidance band (18–27 °C, 40–60 % RH)."},
  M10:{pillar:"D", console:"climate", title:"Triage the sensor log", anchor:"Detection: log interpretation, root cause",
      desc:"Classify all six log events as normal / warning / critical, then pick the root cause of the temperature climb."},
  M11:{pillar:"M", console:"power", title:"Eliminate power single points of failure", anchor:"Power: UPS, PDU, redundancy",
      desc:"In Power Works: split every dual-PSU device across feeds A and B, assign the single-PSU gear, then enable generator + ATS + surge protection until the SPOF counter reads 0."},
  M12:{pillar:"M", console:"signoff", title:"Close out 5 incident tickets", anchor:"All facets as mitigation decisions",
      desc:"On the Sign-off Desk, choose the correct control for each of the five tickets."},

  H1:{pillar:"R", console:"signoff", title:"Audit the contractor work order", anchor:"All 2.4 sub-bullets as violations",
      desc:"Six of the ten work-order lines violate good installation practice; two are fine but look suspicious. Select ONLY the violating lines."},
  H2:{pillar:"R", console:"rack", title:"Build the rack to compliance", anchor:"Rack size, adjacency, blanking, lockable",
      desc:"Build the 15U elevation so every rule passes — no guidance this time. The work order you audited got several of these wrong."},
  H3:{pillar:"R", console:"power", title:"Engineer the power system", anchor:"Power: load, voltage, UPS, PDU, redundancy",
      desc:"Compute the load exactly, size the UPS with ≥25 % headroom, state usable circuit watts, set voltage, wire A/B feeds and enable generator + ATS + surge."},
  H4:{pillar:"D", console:"climate", title:"Triage the 02:00 alarm", anchor:"Detection: noisy log, red herrings, root cause",
      desc:"The log is noisy — three lines are routine noise. Classify the six monitored events, pick the root cause, and write a one-line justification."},
  H5:{pillar:"D", console:"climate", title:"Set thresholds to the Ridgeline standard", anchor:"Environmental factors: temperature, humidity",
      desc:"The Ridgeline standard adopts the simplified ASHRAE-derived band: 18–27 °C and 40–60 % RH. Enter the four alert values exactly."},
  H6:{pillar:"M", console:"climate", title:"Recover the room from the CRAC-1 failure", anchor:"Mitigation: N+1 cooling + airflow state",
      desc:"CRAC-1 is down and intake is 31.2 °C. Bring the room back into spec (redundant CRAC, aisle state, setpoints), then run the recovery simulation."},
  H7:{pillar:"M", console:"power", title:"Purge every single point of failure", anchor:"Power: UPS, ATS, SPD, dual feeds",
      desc:"Drive the SPOF counter to 0 — feeds, PSUs, UPS, generator/ATS and surge all count."},
  H8:{pillar:"M", console:"signoff", title:"Close out all 6 incident tickets", anchor:"Mitigation decisions incl. escalation",
      desc:"Six tickets tonight. One of them cannot be fixed with hardware — know when to escalate."},
  H9:{pillar:"U", console:"signoff", title:"Pass the sign-off exam", anchor:"Whole 2.4 chapter, exact values",
      desc:"Eight items, exact answers: the numbers, the room's role, the airflow rule, suppression, and the 80 % math."}
};

const HINTS = {
  M1:["Start with the terms you already know: UPS and surge protector appear in every server room.",
      "MDF is where the building's service entrances LAND; IDF is a downstream closet.",
      "Match UPS→“bridges outages”, PDU→“splits power to outlets”, ATS→“switches to generator”."],
  M2:["The UPS must see power before any rack device does.",
      "Generator changeover happens upstream of the UPS — the UPS bridges the switchover seconds.",
      "Order: utility → ATS → UPS → PDU → device power supply."],
  M3:["You cannot mount racks in a room that isn't verified ready.",
      "Power provisioning comes before cabling termination — you need outlets and lighting first.",
      "Ready room → racks → power → cabling → environment → sign-off."],
  M4:["Heavy gear goes at the very bottom of the elevation.",
      "The patch panel wants to sit directly beside the core switch.",
      "Fill every gap with blanking panels and switch the lockable doors on."],
  M5:["Add up the watts of the six powered devices (servers ×2, storage, switch, router, KVM).",
      "VA × 0.8 = W capacity; you need load × 1.25.",
      "1580 W × 1.25 = 1975 W → only the 3000 VA (2400 W) model qualifies. Circuit: 15×120×0.8."],
  M6:["Air flows front-to-back through the gear — where must the fronts face?",
      "Both rows' fronts should look at each other across the middle aisle.",
      "Set the aisle to COLD, open the vent tiles, and seal both cable cutouts."],
  M7:["C-104 is the only comms room — everything homes to it.",
      "Fiber never lands on a copper patch panel.",
      "Answers: MDF / patch panel / FDP / re-pull with ≥4× OD / position labels."],
  M8:["Monitor the air the gear actually breathes — which aisle is that?",
      "Water leaks start under the raised floor, near the CRAC plumbing.",
      "Place intake (cold aisle) + leak (under floor) + smoke (ceiling); choose clean agent."],
  M9:["The simplified temperature band is 18–27 °C.",
      "The simplified RH band is 40–60 %.",
      "Enter lo 18, hi 27, RH lo 40, RH hi 60."],
  M10:["Not every log line matters — several are routine.",
      "A compressor fault that takes the CRAC offline is never “normal”.",
      "Door/self-test = normal; CRAC fault = critical; 25.1 °C rising = warning; 28.4 °C = critical; cause = CRAC-1."],
  M11:["Every dual-PSU device needs one PSU on feed A and one on feed B.",
      "The generator is useless without an ATS to switch automatically.",
      "Enable generator + ATS + surge protection and re-check until the SPOF counter reads 0."],
  M12:["Match the threat to the control: transient→SPD, long outage→generator.",
      "Too dry? too wet? Each direction has its own fix.",
      "Surge→SPD · 3 h outage→generator+ATS · heat→N+1 CRAC+alarms · leak→detection+shutoff · dry air→humidifier."]
};

const FB = {
  M1:"Vocabulary locked in. Every vendor quote, work order and exam item uses these words — say them out loud once and they stick.",
  M2:"Chain position is the whole point: ATS handles the long outage, UPS bridges the switchover seconds, PDU distributes. A UPS downstream of a device is decoration.",
  M3:"You can't rack gear in an unverified room, and you can't terminate cables before power exists. Order of operations IS the installation implication.",
  M4:"A compliant elevation: heavy gear low, panel beside switch, no open gaps, doors lockable. Every rule here is either stability, airflow, or physical security.",
  M5:"Load math first, UPS second, circuit rule third: 1580 W → need ≥1975 W → 3000 VA (2400 W). The 80 % rule is why 1580 W doesn't fit one 15 A circuit.",
  M6:"Fronts to the cold aisle, tiles open, cutouts sealed — that's the complete intake path. Break any link and you get recirculation hot spots.",
  M7:"Copper lands on the patch panel, fiber on the FDP, everything gets position labels, and a kinked run gets re-pulled. IDF vs MDF is a location decision, not a naming preference.",
  M8:"You monitor what the gear breathes (cold-aisle intake), where water gathers (under the floor near the CRAC), and what kills first (smoke at the ceiling). Clean agent protects electronics and people.",
  M9:"Thresholds turn sensors into alarms: 18–27 °C and 40–60 % RH (simplified). Below the band = ESD risk; above = condensation risk.",
  M10:"Routine events are noise; the compressor fault is the signal, the rising trend is your early warning, and 28.4 °C is the breach. Picking the root cause is the defender's next step: dispatch cooling, not alarms.",
  M11:"Zero SPOFs: each dual-PSU device split A/B, generator + ATS for long outages, SPD for transients, UPS for the gap. Redundancy only works when the paths are independent.",
  M12:"Every ticket mapped to a control — and the mapping is the exam answer: surge→SPD, outage→generator+ATS, heat→N+1 CRAC, water→leak detection+shutoff, dry air→humidification.",
  H1:"Auditing is a Network+ skill: you separated real violations (heavy-high, panel 14U from switch, shared PSUs, open cutouts, no blanks, sprinkler-only) from plausible-but-fine lines.",
  H2:"Compliance rebuilt from an audited mess — that's the actual job.",
  H3:"Full power engineering in one pass: 1580 W load, 3000 VA (2400 W) UPS with headroom, 1440 W usable per circuit, 120 V, A/B independence, generator + ATS + SPD.",
  H4:"You found the signal in a noisy log and wrote the justification a shift lead needs. That note is what turns an alarm into a dispatched fix.",
  H5:"Exact bands entered — the room will now alarm at the edges of the safe envelope instead of after damage.",
  H6:"N+1 exists for exactly this night: redundancy engaged, airflow path verified, recovery confirmed by measurement — not hope.",
  H7:"Zero SPOFs means no single failure can darken the room. Re-audit this quarterly; SPOFs grow back.",
  H8:"Knowing when NOT to fix is a mitigation decision: a repeating breaker trip with no load change is an electrician problem, not a hardware-swap problem.",
  H9:"Sign-off passed: exact numbers, exact roles, exact rules. This is the 2.4 exam surface in one page."
};
