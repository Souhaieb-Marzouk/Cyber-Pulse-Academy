/* ============================================================
   TRANSMISSION BENCH — STATIC BUILD · data
   DATA — all lab content as structured constants: glossary, media library, work orders (medium + hard), matrix items, quiz bank, field notes. Content only; no logic.
   (Code re-filed 1:1 from the original single-file lab;
    see conversion-notes.md. Content and behavior unchanged.)
   ============================================================ */

"use strict";

const GLOSSARY = [
  ["Attenuation","Signal power lost over distance, measured in dB. Loss grows with length, frequency and every connector in the path."],
  ["EMI / RFI","Electromagnetic / radio-frequency interference: external noise that corrupts a signal. Fiber is immune; copper and RF are not."],
  ["dB (decibel)","Logarithmic unit of gain or loss. Every 3 dB is roughly half the power; a 2-way splitter costs about 3.5 dB."],
  ["Non-overlapping channels","In 2.4 GHz Wi-Fi, channels 1, 6 and 11 do not spectrally collide — the standard three-AP plan."],
  ["OFDMA","802.11ax method that slices a channel into sub-channels so many devices transmit at once instead of queuing."],
  ["MIMO / MU-MIMO","Multiple antennas streaming in parallel (802.11n+); MU-MIMO (802.11ac/ax) serves several clients simultaneously."],
  ["DFS","Dynamic Frequency Selection: some 5 GHz channels are shared with radar and must vacate when radar appears."],
  ["CSMA/CA","Wi-Fi listen-before-talk discipline on a shared radio medium — one talker at a time per channel."],
  ["SFP / SFP+ / QSFP+","Hot-pluggable transceiver form factors: 1 G, 10 G and 40 G respectively. GBIC is the legacy ancestor."],
  ["Twinax / DAC","Short factory-terminated shielded copper cable with fixed transceiver ends — the cheapest short-reach link."],
  ["AOC","Active Optical Cable: same fixed-end convenience, fiber inside — lighter and longer reach than DAC."],
  ["VSAT","Very Small Aperture Terminal: small-dish satellite service, usually Ku or Ka band, subject to rain fade."],
  ["LEO / MEO / GEO","Orbit classes. Lower orbit = lower latency but smaller coverage per satellite: LEO 500-2,000 km, GEO 35,786 km."],
  ["DOCSIS","The data-over-cable standard carrying internet on TV coax. Splitter losses (about -3.5 dB per 2-way split) eat the budget."]
];

const LIB = [
  {
    id:"wifi", code:"MDL-811", name:"IEEE 802.11 — Wi-Fi (wireless)", accent:"#0e7490",
    spec:[
      ["Bands","2.4 GHz · 5 GHz · 6 GHz (Wi-Fi 6E)"],
      ["Throughput","11 Mbps (b) up to 9.6 Gbps theoretical (ax)"],
      ["Range","about 50-70 m indoor per AP on 5/6 GHz; farther on 2.4 GHz"],
      ["Latency","1-10 ms typical local"],
      ["EMI immunity","Low — a shared RF medium (CSMA/CA), half duplex per channel"],
      ["Security","RF is interceptable: WPA3/encryption is mandatory, the medium gives none"],
      ["Cost","Low CAPEX, no cable plant; capacity is shared per channel"]
    ],
    notes:[
      "2.4 GHz: 11 channels (FCC), only 1 / 6 / 11 are non-overlapping — the classic 3-AP plan.",
      "5 GHz: many channels (some require DFS radar detection), 20-160 MHz widths.",
      "6 GHz (Wi-Fi 6E): 1,200 MHz of clean spectrum, up to 7 x 160 MHz channels.",
      "Amendments: a = first OFDM on 5 GHz; b = 2.4 GHz 11 Mbps; g = 2.4 GHz 54 Mbps; n = first MIMO + 40 MHz bonding; ac = 5 GHz MU-MIMO; ax = OFDMA + TWT on 2.4/5/6 GHz; 802.11be (Wi-Fi 7, MLO, 320 MHz) is the newest and emerging.",
      "Classic interferers on 2.4 GHz: microwave ovens, Bluetooth, neighboring APs."
    ],
    traps:["802.11ac is 5 GHz ONLY — it never ran on 2.4 GHz.","Throughput numbers are theoretical maxima; real clients get a fraction.","Channels 2, 3, 4... overlap their neighbors: co-channel and adjacent-channel interference both cut throughput."],
    widget:{id:"w-std", title:"Standards table — match each amendment to its band and headline speed", twoCol:true,
      rows:[
        {std:"802.11b", o1:["5 GHz","2.4 + 5 + 6 GHz","2.4 GHz","2.4 + 5 GHz"], a1:2, o2:["54 Mbps","11 Mbps","9.6 Gbps","600 Mbps"], a2:1},
        {std:"802.11a", o1:["5 GHz","2.4 + 5 + 6 GHz","2.4 GHz","2.4 + 5 GHz"], a1:0, o2:["54 Mbps","11 Mbps","9.6 Gbps","600 Mbps"], a2:0},
        {std:"802.11n", o1:["5 GHz","2.4 + 5 + 6 GHz","2.4 GHz","2.4 + 5 GHz"], a1:3, o2:["54 Mbps","11 Mbps","9.6 Gbps","600 Mbps"], a2:3},
        {std:"802.11ax", o1:["5 GHz","2.4 + 5 + 6 GHz","2.4 GHz","2.4 + 5 GHz"], a1:1, o2:["54 Mbps","11 Mbps","9.6 Gbps","600 Mbps"], a2:2}
      ]}
  },
  {
    id:"cellular", code:"MDL-CEL", name:"Cellular — 2G to 5G (wireless)", accent:"#475569",
    spec:[
      ["Bands","sub-6 GHz (FR1) + mmWave 24-47 GHz (FR2, 5G only)"],
      ["Throughput","4G LTE ~100+ Mbps; 5G multi-Gbps (mmWave peak)"],
      ["Range","cells 1-30 km; mmWave under ~500 m and needs line of sight"],
      ["Latency","LTE 30-50 ms; 5G about 10-20 ms"],
      ["EMI immunity","Medium — licensed spectrum, but still RF"],
      ["Security","Carrier auth via SIM/eSIM; encrypt traffic anyway"],
      ["Cost","OPEX per GB, no cable plant; data caps and carrier coverage apply"]
    ],
    notes:[
      "Generations: 2G GSM/CDMA (voice + SMS) -> 3G UMTS/HSPA/EV-DO (mobile data, up to ~42 Mbps HSPA+) -> 4G LTE (all-IP, ~100+ Mbps, LTE-Advanced toward 1 Gbps) -> 5G NR (sub-6 + mmWave, network slicing, massive MIMO).",
      "Field roles: mobile staff, WAN backup/failover link, temporary events, hotspot/tethering.",
      "mmWave: huge capacity but short range, blocked by walls, trees, rain and even hands.",
      "GSM standardized the SIM; eSIM is the modern embedded form."
    ],
    traps:["5G mmWave is not automatically better indoors — sub-6 GHz often wins.","Coverage beats capacity at the cell edge; both beat promises on a data cap."],
    widget:{id:"w-gen", title:"Generations — match each to its defining capability", twoCol:false,
      rows:[
        {std:"3G", o:["All-IP core, about 100+ Mbps mobile broadband","Mobile data era: UMTS/HSPA, up to about 42 Mbps, voice + SMS mature","sub-6 GHz + mmWave, network slicing, multi-Gbps"], a:1},
        {std:"4G LTE", o:["All-IP core, about 100+ Mbps mobile broadband","Mobile data era: UMTS/HSPA, up to about 42 Mbps, voice + SMS mature","sub-6 GHz + mmWave, network slicing, multi-Gbps"], a:0},
        {std:"5G NR", o:["All-IP core, about 100+ Mbps mobile broadband","Mobile data era: UMTS/HSPA, up to about 42 Mbps, voice + SMS mature","sub-6 GHz + mmWave, network slicing, multi-Gbps"], a:2}
      ]}
  },
  {
    id:"satellite", code:"MDL-SAT", name:"Satellite — LEO / MEO / GEO (wireless)", accent:"#b45309",
    spec:[
      ["Orbits","LEO 500-2,000 km · MEO about 8,000-20,000 km · GEO 35,786 km"],
      ["Round-trip latency","LEO 25-60 ms · MEO 130-250 ms · GEO 480-700 ms"],
      ["Throughput","LEO 50-250 Mbps class; VSAT 10-150 Mbps; shared and asymmetric"],
      ["Line of sight","Strict; Ku/Ka bands suffer rain fade"],
      ["EMI immunity","Low — RF over very long path"],
      ["Security","Encrypt everything; RF downlink is interceptable"],
      ["Cost","High OPEX; the last-resort and remote-area medium"]
    ],
    notes:[
      "GEO: parked over the equator, huge fixed coverage, perfect for TV broadcast — the physics (about 72,000 km round trip at light speed) sets a floor near 480-700 ms RTT.",
      "LEO constellations: many satellites at a few hundred km, RTT in the tens of ms — interactive voice/video becomes usable.",
      "MEO sits between; GNSS constellations (GPS at 20,180 km) are the classic MEO example.",
      "VSAT = small dish terminal, maritime/aviation/rural workhorse; rain fade hits Ka band hardest."
    ],
    traps:["GEO latency is physics, not product maturity — no firmware update fixes 72,000 km.","Rain fade is real attenuation, not an outage ticket you can close from the NOC."],
    widget:null
  },
  {
    id:"fiber", code:"MDL-FO", name:"Optical fiber — SMF / MMF (wired)", accent:"#15803d",
    spec:[
      ["Core","SMF 9 um laser · MMF 50/62.5 um LED or VCSEL"],
      ["Wavelengths","850 nm (MMF) · 1310 / 1550 nm (SMF); SMF loss about 0.2-0.35 dB/km"],
      ["Grades","MMF OM1 orange / OM2 orange / OM3 aqua / OM4 aqua / OM5 lime · SMF OS1/OS2 yellow"],
      ["10G reach","10GBASE-SR: OM1 33 m, OM2 82 m, OM3 300 m, OM4 400 m · 10GBASE-LR: 10 km · ER: 40 km"],
      ["40G reach","40GBASE-SR4: OM3 100 m, OM4 150 m"],
      ["EMI immunity","Immune — light in glass; no crosstalk"],
      ["Security","Tap-resistant: no RF leakage; taps need physical access and are detectable"],
      ["Cost","Highest CAPEX and install skill; lowest loss per km; fragile at tight bends, connectors must stay clean"]
    ],
    notes:[
      "Connectors: LC = small form factor latch (today default, duplex); SC = push-pull stick-and-click; ST = bayonet legacy; MPO/MTP = 12+ fibers for 40/100G ribbons.",
      "Transceivers: SFP (1G) · SFP+ (10G) · SFP28 (25G) · QSFP+ (40G) · QSFP28 (100G); GBIC is legacy.",
      "FTTx: FTTH/FTTB/FTTC fiber-to-the-x; GPON splits one feeder passively (OLT in the CO, ONT at the premises).",
      "OM5 lime supports short-wavelength division multiplexing (SWDM)."
    ],
    traps:["OM1 at 10G stops at 33 m — a 45 m OM1 patch link IS a fault, not a mystery.","10GBASE-SR optics never reach 12 km; that is LR territory.","Dirt on an LC ferrule can add 3-5 dB — clean before you condemn the cable."],
    widget:{id:"w-conn", title:"Connector match — pair each connector with its one-line signature", twoCol:false,
      rows:[
        {std:"LC", o:["Push-pull stick-and-click","Small form-factor latch — today's default, duplex","Bayonet, legacy","12+ fibers, 40/100G ribbon"], a:1},
        {std:"SC", o:["Push-pull stick-and-click","Small form-factor latch — today's default, duplex","Bayonet, legacy","12+ fibers, 40/100G ribbon"], a:0},
        {std:"ST", o:["Push-pull stick-and-click","Small form-factor latch — today's default, duplex","Bayonet, legacy","12+ fibers, 40/100G ribbon"], a:2},
        {std:"MPO/MTP", o:["Push-pull stick-and-click","Small form-factor latch — today's default, duplex","Bayonet, legacy","12+ fibers, 40/100G ribbon"], a:3}
      ]}
  },
  {
    id:"coax", code:"MDL-CX", name:"Coaxial — RG-6 / RG-59 (wired)", accent:"#c2410c",
    spec:[
      ["Impedance","75 ohm (RG-6 / RG-59) · 50 ohm (RG-58 / RG-8 legacy Ethernet)"],
      ["Gauge","RG-6 = 18 AWG, dual/quad shield · RG-59 = 20 AWG, thinner"],
      ["Use","RG-6: cable TV + DOCSIS internet, longer runs · RG-59: short CCTV/baseband · RG-58: 10BASE2 Thinnet (185 m) legacy"],
      ["Throughput","DOCSIS 3.1 up to about 10 Gbps shared downstream"],
      ["EMI immunity","Good shielding, but loss rises steeply with frequency; kinks and cheap splitters hurt"],
      ["Security","Shielded; connectors in public spaces are the splice/tap point"],
      ["Cost","Low; often an installed TV plant you can reuse"]
    ],
    notes:[
      "Connectors: F-type = screw-on (RG-6/59, TV + cable modems); BNC = bayonet (legacy LAN, CCTV); N-type = RF/antenna work.",
      "Splitter math: every 2-way split costs about 3.5 dB per leg; a 3-way costs about 5 dB. Budget before you amplify.",
      "RG-59 at high frequency over distance is the classic dorm/CCTV fault: thin conductor, high loss.",
      "Old Ethernet on coax: 10BASE2 = RG-58 (185 m), 10BASE5 = RG-8 thicknet (500 m) — exam fossils, still asked."
    ],
    traps:["RG-6 and RG-59 are both 75 ohm — impedance is not what separates them; gauge and shielding are.","A 3-way splitter leg can lose about 5 dB: that is 70% of the power gone before the modem."],
    widget:null
  },
  {
    id:"dac", code:"MDL-DAC", name:"DAC & AOC — twinax copper (wired)", accent:"#6b21a8",
    spec:[
      ["Form","Twinax copper, factory-terminated with FIXED SFP+/SFP28/QSFP+ ends — no separate optics"],
      ["Lengths","Passive: up to about 5 m (no electronics) · Active: about 5-10 m (equalizers in the ends) · AOC (fiber inside): to about 100 m"],
      ["Power","DAC about 0.1-0.5 W vs roughly 1 W+ per optical transceiver pair"],
      ["Latency","Negligible on copper; lowest of any option"],
      ["EMI immunity","Shielded twinax; keep away from power runs and sharp bends"],
      ["Security","Short copper in a locked rack — low exposure"],
      ["Cost","Cheapest short-reach link in the data center"]
    ],
    notes:[
      "Home turf: top-of-rack to servers (0.5-5 m), adjacent rack (5-10 m), cable managers hate the bulk but budgets love the price.",
      "Passive DAC: the cable IS the link — nothing to configure, nothing to clean.",
      "Active DAC / AOC: electronics in the connector ends boost reach; AOC swaps copper for fiber — lighter, thinner, longer.",
      "Trade-offs vs optics: fixed length (buy exactly right), stiffer cable, limited reach, but no transceivers to buy or clean."
    ],
    traps:["Passive DAC at 8 m fails — that is what active DAC or AOC are for.","DAC ends are fixed: you cannot swap an SFP+ end for a QSFP+ one."]
  }
];

/* ---------------- ORDERS — MEDIUM ---------------- */

const OPTS_ORBIT = ["LEO (500-2,000 km)","MEO (about 8,000-20,000 km)","GEO (35,786 km)"];
const CAUSES = ["Kinked / damaged coax","GEO satellite latency","Contaminated fiber connector","Co-channel Wi-Fi overlap","Exceeded passive DAC length","2.4 GHz RF interference"];

const ORDERS_MED = [
  {
    id:"ord-ch", code:"W-101", title:"Library Wi-Fi channel plan", obj:"OBJ-M2", kind:"channels", sig:"wireless",
    brief:"Three library APs (AP-L1, AP-L2, AP-L3) cover a floor with overlapping cells. Assign each a 2.4 GHz channel and set the channel width. The overlap meter reacts as you go — watch it.",
    reqs:["No co-channel overlap","Use only the non-overlapping set","20 MHz width on 2.4 GHz"],
    readouts:null
  },
  {
    id:"ord-fib", code:"F-204", title:"HQ MDF to Science Hall fiber", obj:"OBJ-M5", kind:"fiber", sig:"fiber",
    brief:"New 10 Gbps trunk between the HQ MDF and the Science Hall IDF. The duct route crosses the substation yard. Spec the medium, grade, connector and optics.",
    evidence:"ROUTE      HQ MDF -> Science Hall IDF\nLENGTH     8.6 km (duct route via north spine)\nENVIRONMENT  crosses substation yard — heavy EMI\nSERVICE     10 Gbps, 5-year horizon\nTERMINATION  patch panels both ends (SFP+ slots)",
    reqs:["8.6 km reach","10 Gbps","EMI-immune","patchable termination"],
    form:{
      type:["Multimode (MMF)","Single-mode (SMF)"],
      grade:["OM1","OM3","OM4","OS2 (single-mode)"],
      conn:["SC (push-pull)","ST (bayonet, legacy)","MPO/MTP (12+ fibers)","LC (small latch, duplex)"],
      optics:["10GBASE-SR (SFP+)","40GBASE-SR4 (QSFP+)","10GBASE-LR (SFP+)"]
    },
    formAns:{type:"Single-mode (SMF)", grade:"OS2 (single-mode)", conn:"LC (small latch, duplex)", optics:"10GBASE-LR (SFP+)"},
    readouts:null
  },
  {
    id:"ord-sat", code:"S-310", title:"Remote uplinks — three missions", obj:"OBJ-M4", kind:"orbit", sig:"sat",
    brief:"Three very different missions need satellite service. Match an orbit class to each mission — the readouts show what each orbit costs you in latency.",
    reqs:["Latency matched to the mission","Orbit class matched to the service"],
    missions:[
      {key:"m1", label:"Mission 1 — Rural field station: live video classes, interactive use"},
      {key:"m2", label:"Mission 2 — Campus TV headend: one-way broadcast distribution"},
      {key:"m3", label:"Mission 3 — GNSS timing reference: which orbit class do GNSS constellations fly?"}
    ],
    options:OPTS_ORBIT,
    rtt:{LEO:"25-60 ms", MEO:"130-250 ms", GEO:"480-700 ms"}
  },
  {
    id:"ord-coax", code:"C-118", title:"Dormitory DOCSIS drop", obj:"OBJ-M7", kind:"coax", sig:"coax",
    brief:"A dorm room gets cable ISP service (TV + 1 Gbps internet) over a 60 m drop with one 2-way splitter in line. Pick the cable, the connector — and compute the splitter loss.",
    evidence:"DROP       dorm riser -> room 214\nLENGTH     60 m + one 2-way splitter\nSERVICE    CATV + DOCSIS 3.1 internet\nTERMINATION  screw-on at both ends, wall plate at room",
    reqs:["Cable-ISP grade cable","Correct connector for the plant","Splitter loss in dB (positive number)"],
    options:{
      rg:["RG-59","RG-6","RG-58"],
      conn:["BNC (bayonet)","F-type (screw-on)","N-type (RF/antenna)"]
    }
  },
  {
    id:"ord-dac", code:"D-077", title:"Top-of-rack links — CORE-SW1", obj:"OBJ-M8", kind:"dac", sig:"dac",
    brief:"Two 25 Gbps SFP28 links leave CORE-SW1: one to SVR-B2 (1.5 m, same rack), one to SW-ADJ (6 m, adjacent rack). Power budget is tight. Pick a link type for each and justify the pair.",
    reqs:["25 Gbps on both links","Minimum power and cost","Length limits respected"],
    links:[
      {key:"l1", label:"Link 1 — CORE-SW1 to SVR-B2 · 1.5 m"},
      {key:"l2", label:"Link 2 — CORE-SW1 to SW-ADJ · 6 m"}
    ],
    linkOpts:["Active DAC","Passive DAC","AOC","SMF + LR optics"],
    reasonAns:1,
    reasons:[
      "Passive DAC works at any length, so use it twice and save the most.",
      "Passive DAC has no electronics: cheapest and lowest power, but only up to about 5 m — the 6 m link needs active electronics.",
      "Fiber LR optics are always the right answer inside a rack.",
      "Active DAC is always cheaper than passive at short lengths."
    ]
  },
  {
    id:"ord-diag", code:"X-009", title:"Fault triage queue — three tickets", obj:"OBJ-M9", kind:"diag", sig:"coax",
    brief:"Three tickets landed on the bench at once. Read each piece of evidence, then pick the root cause. The wrong-guess distractors are all real phenomena — that is the point.",
    tickets:[
      {key:"t1", ev:"TICKET 1 — Library AP-L2\nSYMPTOM   clients drop every lunch hour\nPATTERN   2.4 GHz clients only; spectrum shows spike at 2.45 GHz\nNOTES     starts ~11:30, ends ~13:15, weekdays"},
      {key:"t2", ev:"TICKET 2 — Dorm room 214 modem\nSYMPTOM   CRC errors spike, TV pixelates in rain\nFOUND     sharp 90-degree bend behind the cabinet, jacket cracked\nNOTES     splitter and connectors re-torqued, no change"},
      {key:"t3", ev:"TICKET 3 — Science Hall fiber link\nSYMPTOM   optical loss up 4 dB after panel maintenance\nLOGS      optics healthy, power budget exceeded\nNOTES     LC pair disturbed during work"}
    ],
    options:CAUSES,
    answers:[5,0,2]
  }
];

/* ---------------- ORDERS — HARD ---------------- */

const MED_OPTS_AUDIT = ["802.11","Cellular","Satellite","SMF fiber","MMF fiber","RG-6 coax","RG-59 coax","DAC"];

const ORDERS_HARD = [
  {
    id:"h-audit", code:"AUD-77", title:"District site audit — 8 links, 2 bad tags", obj:"OBJ-H1", kind:"audit", sig:null,
    brief:"A contractor labeled everything during the summer install. You have 8 evidence cards. Identify the real medium of each link AND flag every card whose printed tag contradicts the evidence. Two tags are wrong.",
    reqs:["Identify all 8 media from evidence","Flag exactly the cards with wrong tags","No hints on this one — the evidence is all you get"],
    items:[
      {id:"A1", tag:"OM4 AQUA — MDF to IDF trunk", text:"Yellow jacket, 9 um core, LC duplex, 1310 nm laser source, 12 km span"},
      {id:"A2", tag:"RG-6 QUAD — CCTV riser", text:"Thin 20 AWG conductor, 75 ohm, 40 m baseband CCTV run, screw-on F-terminators"},
      {id:"A3", tag:"AP-LIB-1 — config export", text:"band 5 GHz, channel 44, width 80 MHz, WPA3, DFS-clean"},
      {id:"A4", tag:"DORM-DROP-214", text:"18 AWG quad shield, screw-on connector, DOCSIS 3.1, 60 m to room"},
      {id:"A5", tag:"CORE-TOR-3", text:"Twinax, fixed SFP28 ends both sides, 2 m, no optics in slots"},
      {id:"A6", tag:"FIELD-STN-7", text:"Flat-panel phased-array terminal, 512 km constellation, RTT 40 ms"},
      {id:"A7", tag:"GW-LTE-B", text:"Carrier WAN failover, eSIM, LTE-A 150/50 Mbps, external antenna"},
      {id:"A8", tag:"RACK-B2-SW", text:"Aqua jacket, 50 um core, VCSEL 850 nm, 30 m patch run"}
    ],
    answers:{A1:"SMF fiber", A2:"RG-59 coax", A3:"802.11", A4:"RG-6 coax", A5:"DAC", A6:"Satellite", A7:"Cellular", A8:"MMF fiber"},
    wrongTags:["A1","A2"],
    options:MED_OPTS_AUDIT
  },
  {
    id:"h-feas", code:"FEA-12", title:"Link feasibility review — three proposed builds", obj:"OBJ-H2", kind:"feas", sig:null,
    brief:"Three build proposals arrived with the numbers attached. Rule each PASS or FAIL against the spec limit, and pick the certified fix for every failure. Near-misses will be rejected with a rationale.",
    reqs:["Judge each span against its standard limit","Choose the certified fix for each failure"],
    rows:[
      {id:"f1", text:"40GBASE-SR4 over OM4 aqua — span 180 m",
       fixes:["Retry with OM3 instead","40GBASE-LR4 over OS2 SMF","Passive DAC SFP28 pair"], fixAns:1,
       why:"40GBASE-SR4 tops out at 150 m on OM4 (100 m on OM3) — 180 m exceeds both. The certified fix moves to SMF: 40GBASE-LR4 handles 10 km."},
      {id:"f2", text:"Passive DAC, SFP28 — span 8 m",
       fixes:["Two passive DACs in series","RG-6 with BNC ends","Active DAC or AOC"], fixAns:2,
       why:"Passive DAC has no electronics and tops out around 5 m. Active DAC (to about 10 m) or AOC carry the 8 m span."},
      {id:"f3", text:"RG-59, DOCSIS 3.1 carriers at 1 GHz — span 300 m",
       fixes:["Replace with quad-shield RG-6","Keep RG-59 and add one line amplifier","Downgrade to RG-58 Thinnet"], fixAns:0,
       why:"RG-59 is thin 20 AWG with high loss at high frequency — 300 m of DOCSIS 3.1 carriers is out of budget. RG-6 (18 AWG quad shield) is the certified medium; an amplifier cannot rescue the wrong cable."}
    ],
    verdictOpts:["PASS — within spec","FAIL — exceeds spec"]
  },
  {
    id:"h-lat", code:"LAT-01", title:"Voice latency budget — satellite backup", obj:"OBJ-H3", kind:"lat", sig:null,
    brief:"Voice over the satellite backup must keep round-trip latency at or under 150 ms. Enter the typical RTT range midpoints you would plan against for GEO and LEO, rule each PASS/FAIL against the SLA, and recommend.",
    reqs:["GEO and LEO RTT numbers (ms, typical planning values)","Verdict against the 150 ms RTT SLA","A recommendation the NOC can act on"],
    sla:150,
    verdictOpts:["PASS — meets the 150 ms RTT SLA","FAIL — breaks the SLA"],
    recOpts:["GEO everywhere — it is the cheapest","MEO for everything","LEO carries voice; GEO stays on broadcast/one-way","No satellite — run DAC between buildings"],
    recAns:2
  },
  {
    id:"h-spec", code:"RF-88", title:"2.4 GHz forensics — library floor", obj:"OBJ-H4", kind:"spec", sig:null,
    brief:"Analyzer capture from the library floor. Re-plan the channels, name the interferer, set the width, and call the strategy. Every field is graded strictly.",
    evidence:"SPECTRUM SCAN 2.35-2.55 GHz (synthetic capture)\nAP-A        channel 2   RSSI -45 dBm\nAP-B        channel 7   RSSI -52 dBm\nNEIGHBOR-1  channel 1   (adjacent building, -78 dBm)\nNEIGHBOR-2  channel 6   (adjacent building, -81 dBm)\nNOISE       periodic wideband burst 2.45 GHz, 11:30-13:15 weekdays\nCLIENTS     60% are 5/6 GHz capable; 40% legacy 2.4-only",
    reqs:["Three non-overlapping channels, planned against the neighbors","Interferer identified","Width + density strategy called"],
    aps:["AP-A","AP-B","AP-C (new AP)"],
    interfererOpts:["Bluetooth hopper","Microwave oven (2.45 GHz)","DFS radar event","Co-channel overlap only"],
    widthOpts:["20 MHz","40 MHz","80 MHz","160 MHz"],
    strategyOpts:["Add more 2.4 GHz APs on new channels","Boost AP transmit power on 2.4 GHz","Move high-density to 5/6 GHz, keep 2.4 GHz for legacy clients","Ban lunchtime equipment use"]
  },
  {
    id:"h-fibfix", code:"FBR-31", title:"OM1 plant failure — Science Hall patches", obj:"OBJ-H5", kind:"fibfix", sig:null,
    brief:"Ten 10GBASE-SR links run over orange OM1 patch cables through a 45 m ceiling route. Since the panel maintenance they flap intermittently. Root-cause it, state the spec limit, and prescribe the remediation set.",
    evidence:"PLANT       OM1 62.5 um, orange — installed years ago for 1G\nLINKS       10 x 10GBASE-SR, LC duplex\nSPAN        45 m ceiling route (2 panels + 1 splice tray)\nHISTORY     1G for years, clean; flapping began after panel work\nLOGS        FCS errors, optical budget exceeded on 6 of 10 links",
    reqs:["Root cause from the evidence","The 10G OM1 distance limit (meters)","Remediation set — wrong boxes break the check"],
    causeOpts:["Connector gender mismatch at panels","OM1 exceeds its 10GBASE-SR distance limit (45 m > limit)","40G optics seated in 10G slots","SMF and MMF swapped end to end"],
    actions:["Re-pull the route with OM3 or OM4 aqua, laser-optimized","Clean and inspect every LC ferrule, then re-test loss","Swap the route to quad-shield RG-6 coax"]
  },
  {
    id:"h-kit", code:"KIT-04", title:"Disaster-response connectivity kit", obj:"OBJ-H6", kind:"kit", sig:null,
    brief:"The county asked the college to build a deployable kit: teams drive between sites, there is no wired plant, 50+ Mbps sustained is needed, and video calls are mandatory. Choose primary, fallback — and mark every option you are rejecting with the reason why.",
    reqs:["Primary that moves and sustains 50+ Mbps","Fallback that works where cellular does not","All rejections marked with reasons"],
    primaryOpts:["GEO VSAT terminal","LTE-A / 5G sub-6 GHz with eSIM","5G mmWave fixed CPE","Passive DAC kit"],
    fallbackOpts:["GEO VSAT","RG-6 to the nearest pole","LEO flat-panel VSAT","None — single path is fine"],
    rejects:["GEO RTT (480-700 ms) breaks interactive voice/video","mmWave needs line of sight and does not tolerate vehicle mobility","Fixed-length DAC copper has no role outside the rack"]
  },
  {
    id:"h-amp", code:"STD-19", title:"Amendment forensics — 802.11 features", obj:"OBJ-H7", kind:"amp", sig:null,
    brief:"The pool contains six feature cards. Five belong to the five amendments; one is a decoy that belongs to none of them. Place each card against the right amendment — no card may be used twice.",
    reqs:["Every amendment matched exactly","The decoy must remain unplaced"],
    rows:["802.11a","802.11b","802.11n","802.11ac","802.11ax"],
    pool:["5 GHz only, MU-MIMO, 80/160 MHz channels","9.6 Gbps on 60 GHz (WiGig)","2.4 GHz, 11 Mbps, DSSS","OFDMA + TWT; 6 GHz added as Wi-Fi 6E","First OFDM, 5 GHz, 54 Mbps","First MIMO and 40 MHz bonding, dual-band"],
    answers:[4,2,5,0,3]
  },
  {
    id:"h-coax", code:"CPL-09", title:"Coax plant upgrade — DOCSIS 3.1 rollout", obj:"OBJ-H8", kind:"coaxplant", sig:null,
    brief:"The dorm plant gets DOCSIS 3.1. One drop: ground block, then a 2-way splitter (about -3.5 dB per leg), then a 3-way balanced splitter (about -5 dB per leg), then the modem. Compute the total passive loss, re-spec the medium and termination, and call the amplifier policy.",
    evidence:"DROP PATH   tap -> ground block -> 2-way -> 3-way -> modem\nCARRIER PLAN  DOCSIS 3.1, up to 1 GHz\nEXISTING    mixed RG-59/RG-6, unt weatherized connectors\nGOAL        TV + 1 Gbps internet on every leg",
    reqs:["Total splitter loss in dB (positive number)","Medium + termination to spec","Amplifier policy"],
    rgOpts:["RG-59","RG-58 Thinnet","RG-6 quad-shield","Keep whatever exists"],
    connOpts:["BNC bayonet","Cheap twist-on F","N-type","F-type, weatherproofed, torque-spec"],
    ampOpts:["An amplifier at every outlet","Never amplify — always re-cable instead","Amplify only the RG-59 legs","Unity-gain amp at the ground block when the budget is exceeded"]
  },
  {
    id:"h-rack", code:"PWR-55", title:"Rack consolidation — three lengths + power bill", obj:"OBJ-H9", kind:"rackpower", sig:null,
    brief:"Rack B consolidates onto one switch. Three link lengths, 8 links total, and a power budget. Pick the link type per length, compute the power saved versus 1.0 W optical transceivers per link (DAC/AOC average about 0.4 W), and justify the policy.",
    reqs:["Link type per length (some spans admit more than one right answer)","Power saved in watts","One policy line the NOC can adopt"],
    rows:[
      {id:"p1", label:"0.8 m — SVR to ToR, same rack"},
      {id:"p2", label:"6 m — ToR to mid-rack switch"},
      {id:"p3", label:"25 m — ToR to Rack-C core"}
    ],
    linkOpts:["AOC","Passive DAC","10GBASE-LR over SMF","Active DAC"],
    accept:{p1:["Passive DAC"], p2:["Active DAC","AOC"], p3:["AOC","10GBASE-LR over SMF"]},
    whyRows:{p2:"6 m exceeds the ~5 m passive limit: active electronics or fiber is required.", p3:"25 m is AOC territory (or SMF LR optics) — twinax cannot reach it."},
    powerNote:"8 links x (1.0 W optics - 0.4 W DAC/AOC average)",
    reasonAns:1,
    reasons:["Passive DAC everywhere regardless of length","DAC for short links saves power and cost; AOC or fiber covers the longer runs","LR optics everywhere — fiber is always right","Coax with BNC is the cheapest rack link"]
  }
];

/* ---------------- MATRIX PANEL ---------------- */

const MATRIX = {
  sel:{
    title:"Selection matrix — five real asks",
    obj:"OBJ-M10",
    intro:"For each ask, pick the one medium you would actually build. Every row has exactly one best answer at N10-009 depth.",
    rows:[
      {id:"s1", text:"Two campus buildings, 8 km apart, 10 Gbps, duct crosses the substation yard", opts:["Multimode OM4","RG-6 coax","Single-mode fiber (OS2)","5G mmWave"], ans:2},
      {id:"s2", text:"One-day festival on the quad: 10,000 attendees, no wired plant, mobility required", opts:["GEO satellite terminal","Cellular 5G/LTE + event Wi-Fi","Passive DAC","RG-59 cabling"], ans:1},
      {id:"s3", text:"Rural ranch annex, no terrestrial backhaul, needs live video classes", opts:["GEO satellite","RG-59 cabling","Passive DAC","LEO satellite"], ans:3},
      {id:"s4", text:"Existing cable-TV plant must now deliver 1 Gbps internet", opts:["RG-58 Thinnet","2G GSM modem","RG-6 + DOCSIS","ST connectors on OM1"], ans:2},
      {id:"s5", text:"Two servers 2 m apart in the same rack, 25 Gbps, minimize power", opts:["AOC","SMF + LR optics","GEO terminal","Passive DAC"], ans:3}
    ]
  },
  prop:{
    title:"Properties matrix — rank the media",
    obj:"OBJ-M11",
    intro:"Compare the media families on the properties the exam keeps asking about.",
    rows:[
      {id:"r1", text:"Highest EMI immunity", opts:["Coax","Fiber","DAC","Wireless RF","Satellite"], ans:1},
      {id:"r2", text:"Most tap-resistant physical medium", opts:["Wireless RF","Satellite","Coax","Fiber","DAC"], ans:3},
      {id:"r3", text:"Easiest to intercept — encryption is mandatory", opts:["Fiber","Coax","Wireless RF","DAC","Satellite"], ans:2},
      {id:"r4", text:"Cheapest link inside one rack (2 m)", opts:["Coax","Fiber optics","Passive DAC","Wireless RF","Satellite"], ans:2},
      {id:"r5", text:"Subject to rain fade and strict line of sight", opts:["Coax","DAC","Fiber","Wireless RF (indoor)","Satellite"], ans:4}
    ]
  }
};

/* ---------------- QUIZ ---------------- */

const QUIZ = {
  medium:[
    {q:"Which amendment first brought OFDMA and the 6 GHz band (Wi-Fi 6E)?", opts:["802.11n","802.11ax","802.11ac","802.11g"], ans:1,
     expl:"OFDMA channel slicing and the 6 GHz band both arrive with 802.11ax; 6 GHz operation is branded Wi-Fi 6E. 802.11be (Wi-Fi 7) extends these as the newest generation."},
    {q:"The classic non-overlapping channel plan on 2.4 GHz is:", opts:["1, 6, 11","1, 5, 9, 13","2, 7, 11","3, 6, 9"], ans:0,
     expl:"2.4 GHz channels are 5 MHz apart but 20 MHz wide, so only 1, 6 and 11 avoid overlap. Adjacent APs on 2 and 7 bleed into each other."},
    {q:"Which satellite orbit class carries the highest round-trip latency?", opts:["LEO","MEO","Polar LEO","GEO"], ans:3,
     expl:"GEO sits at 35,786 km: about 72,000 km of light-speed round trip puts RTT at roughly 480-700 ms. LEO keeps RTT in the 25-60 ms class."},
    {q:"You terminate a cable-modem drop on the side of a house. The connector is:", opts:["BNC","F-type","N-type","LC"], ans:1,
     expl:"F-type screw-on connectors terminate RG-6/RG-59 TV and cable-internet plant. BNC is legacy LAN/CCTV, N-type is RF/antenna work, LC is fiber."},
    {q:"A passive DAC is a sensible link when the span is about:", opts:["30 m","12 m","2 m","50 m"], ans:2,
     expl:"Passive DAC has no electronics and tops out around 5 m. Longer spans need active DAC (to about 10 m), AOC, or fiber."},
    {q:"Which medium is effectively immune to EMI from the substation next door?", opts:["Optical fiber","RG-6 coax","Twinax DAC","2.4 GHz Wi-Fi"], ans:0,
     expl:"Fiber carries light in glass — no electrical conductor, no induced noise. Shielded copper (coax, twinax) resists but does not defeat a substation."}
  ],
  hard:[
    {q:"40GBASE-SR4 over OM4, span 120 m. Verdict?", opts:["Fail — OM4 stops at 100 m","Pass — OM4's limit is 150 m","Pass — OM4 reaches 300 m","Fail — SR4 requires SMF always"], ans:1,
     expl:"40GBASE-SR4 reaches 100 m on OM3 and 150 m on OM4 — 120 m on OM4 passes. The 300 m figure belongs to 10GBASE-SR on OM3."},
    {q:"A research vessel needs broadband with live video calls while underway. Best pick?", opts:["GEO VSAT","Passive DAC to the bridge","LEO flat-panel terminal","WiGig mesh below deck"], ans:2,
     expl:"GEO RTT (480-700 ms) wrecks interactive calls; LEO keeps RTT in the tens of ms and tracks the vessel. Fixed copper obviously cannot sail."},
    {q:"In a clean 6 GHz (Wi-Fi 6E) deployment, the sensible channel width for high throughput is:", opts:["20 MHz — bonding is illegal in 6 GHz","Up to 160 MHz — the band has room","40 MHz maximum, set by regulation","Width no longer applies in 6 GHz"], ans:1,
     expl:"6 GHz offers about 1,200 MHz of spectrum, so up to 7 x 160 MHz channels fit. On 2.4 GHz the same bonding would be self-defeating."},
    {q:"Two 2-way splitters sit in series on a coax drop. Approximate total loss on a leg?", opts:["3.5 dB","5 dB","10.5 dB","7 dB"], ans:3,
     expl:"Each 2-way split costs about 3.5 dB per leg; in series the dB adds: about 7 dB, i.e. roughly 80% of the power is gone before the modem."},
    {q:"A 7 m passive DAC link between two switches fails to train. Most likely cause and fix?", opts:["Length limit — swap to active DAC or AOC","Dirty optics — clean, inspect, re-test loss","VLAN misconfigured on both switch ports","RG-59 run too lossy — replace with RG-6"], ans:0,
     expl:"Passive DAC tops out around 5 m because there is no signal conditioning in the cable. Active DAC (to about 10 m) or AOC carry 7 m."},
    {q:"Which statement about 5G mmWave is correct?", opts:["It penetrates walls better than sub-6 does","It fully replaced LTE in 5G networks","Multi-Gbps peak, but needs line of sight","It is the band GSM historically used"], ans:2,
     expl:"FR2 mmWave (24-47 GHz) buys capacity with range: under ~500 m, blocked by walls, trees, rain and hands. Sub-6 GHz carries the coverage layer."},
    {q:"A 300 m DOCSIS 3.1 drop is currently RG-59. The certified remediation is:", opts:["Replace with quad-shield RG-6","Add one amplifier on the RG-59","Re-terminate with BNC","Split the drop into four RG-58 runs"], ans:0,
     expl:"RG-59 (20 AWG) loses too much at 1 GHz over 300 m; RG-6 (18 AWG, better shielding) is the certified medium. Amplifiers add noise and do not fix the wrong cable."}
  ]
};

/* ---------------- FIELD NOTES (debrief) ---------------- */

const NOTES = {
  detection:[
    ["Coax / cable plant","CRC and FCS error counters per modem; DOCSIS SNR per carrier","CRC rate climbs after rain + splitter count > 1 → inspect plant and connectors"],
    ["Fiber","OTDR baseline per span; optical dBm budget vs inventory","Loss jumps about 2 dB after panel work → clean and inspect LC ferrules first"],
    ["Wi-Fi RF","Spectrum scan 2.4/5 GHz; channel utilization; client health","Wideband 2.45 GHz burst at lunchtime → microwave oven, not an AP fault"],
    ["Satellite","RTT probes; rain-fade packet loss on Ku/Ka","RTT above ~400 ms in the path → a GEO hop is in play; plan for it"],
    ["Cellular","RSSI/RSRP trend; failover drill results","Failover that never drills is a bet, not a backup link"]
  ],
  mitigation:[
    ["802.11","Channel plan 1/6/11 at 20 MHz on 2.4 GHz; put density on 5/6 GHz; WPA3 everywhere"],
    ["Coax","Quad-shield RG-6 for ISP runs; weatherproofed torque-spec F-type; compute dB budget before amplifying"],
    ["Fiber","Grade to the standard, not the hope: OM3/OM4 for 10G SR, OS2 + LR beyond 400 m; clean + OTDR baseline"],
    ["Racks","Passive DAC up to ~5 m; active DAC/AOC to 10-25 m; policy beats improvisation at 25 Gbps"],
    ["Remote sites","LEO for interactive latency; GEO for broadcast/one-way; cellular as mobile primary, satellite as fallback"]
  ],
  blue:[
    "Media choice is a security control: fiber leaks nothing, coax leaks little, RF leaks everything — encrypt wireless by default and audit rogue APs.",
    "Baselines beat alarms: know each link's clean OTDR trace, dB budget and CRC rate before you need them.",
    "Label discipline is free detection: this whole lab's Hard audit exists because two tags lied."
  ],
  red:[
    "Think like the assessor: the wireless segment is the entry point of choice — test it the way an intruder would war-walk the parking lot.",
    "Connectors in public spaces (coax F-types on dorm walls) are splice/tap points; physical access controls are part of media security.",
    "Satellite and cellular links bypass your perimeter entirely — treat every remote terminal as a door, not a cable."
  ],
  links:[
    ["CompTIA Network+ (N10-009) certification page","https://www.comptia.org/certifications/network"],
    ["IEEE 802.11 wireless standard family","https://standards.ieee.org/ieee/802.11/7020/"],
    ["Wi-Fi Alliance — Wi-Fi 6 / 6E programs","https://www.wi-fi.org/discover-wi-fi/wi-fi-certified-6"]
  ]
};
