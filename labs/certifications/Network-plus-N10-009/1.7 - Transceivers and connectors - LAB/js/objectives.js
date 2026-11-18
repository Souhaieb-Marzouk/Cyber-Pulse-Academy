// ─────────────────────────────────────────────────────────────────────────────
// THE PATCH BENCH — js/objectives.js
// Mastery blueprint: 12 Apprentice (Medium) + 10 Journeyman (Hard) work orders.
// Validators are pure functions of the lab state — this is the CHECK RESULTS
// engine. Content carried over 1:1 from src/lib/lab17/objectives.ts.
// ─────────────────────────────────────────────────────────────────────────────

// Answer lookup helpers (same conventions as the original)
const A = (s, k) => s.answers[k];
const pick = (s, obj, item, part = 1) => {
  const v = A(s, `${obj}:${item}${part === 2 ? "#2" : ""}`);
  return typeof v === "string" && v !== "" ? v : undefined;
};

// sort answers: `${obj}:bin:${itemId}` = binId
// matrix answers: `${obj}:${row}:${col}` = "works" | "fails"
// order answers: `${obj}:order` = string[] (current order of step ids)
// audit answers: flags in `${obj}:flag:${rowId}` = "1" | "" and fixes `${obj}:fix:${rowId}`

// ─────────────────────────────────────────────────────────────────────────────
// MEDIUM — APPRENTICE WORK ORDERS (12)
// ─────────────────────────────────────────────────────────────────────────────

const M1_ITEMS = [
  { id: "SC", label: "SC" },
  { id: "LC", label: "LC" },
  { id: "ST", label: "ST" },
  { id: "MPO", label: "MPO" },
  { id: "RJ45", label: "RJ45" },
  { id: "RJ11", label: "RJ11" },
  { id: "FTYPE", label: "F-type" },
  { id: "BNC", label: "BNC" },
];

const M2_LEFTS = [
  { id: "SC", label: "SC" },
  { id: "LC", label: "LC" },
  { id: "ST", label: "ST" },
  { id: "MPO", label: "MPO" },
];
const M2_RIGHTS = [
  { id: "pp25", label: "Push-pull tab · 2.5 mm ferrule" },
  { id: "bay25", label: "Bayonet quarter-turn · 2.5 mm ferrule" },
  { id: "trig125", label: "Trigger latch · 1.25 mm ferrule" },
  { id: "keyarr", label: "Keyed push-pull · 12-fiber array" },
];
const M2_KEY = { SC: "pp25", LC: "trig125", ST: "bay25", MPO: "keyarr" };

const M3_LEFTS = [
  { id: "SC", label: "SC" },
  { id: "LC", label: "LC" },
  { id: "ST", label: "ST" },
  { id: "MPO", label: "MPO" },
  { id: "BNC", label: "BNC" },
  { id: "RJ45", label: "RJ45" },
];
const M3_RIGHTS = [
  { id: "sub", label: "Subscriber Connector" },
  { id: "luc", label: "Lucent Connector" },
  { id: "straight", label: "Straight Tip" },
  { id: "mfpo", label: "Multi-fiber Push-On" },
  { id: "bncfull", label: "Bayonet Neill–Concelman" },
  { id: "8p8c", label: "8P8C modular plug" },
];
const M3_KEY = { SC: "sub", LC: "luc", ST: "straight", MPO: "mfpo", BNC: "bncfull", RJ45: "8p8c" };

const M6_ITEMS = [
  {
    id: "c1",
    prompt: "The ISP's cable-internet feed (DOCSIS over RG-6) lands at the modem. Which fitting terminates it?",
    options: [
      { id: "a", label: "F-type" },
      { id: "b", label: "RJ45" },
      { id: "c", label: "BNC" },
      { id: "d", label: "RJ11" },
    ],
  },
  {
    id: "c2",
    prompt: "An analog dome camera loops back to the DVR head-end on RG-59. Which connector ends the run?",
    options: [
      { id: "a", label: "RJ45" },
      { id: "b", label: "SC" },
      { id: "c", label: "BNC" },
      { id: "d", label: "F-type" },
    ],
  },
  {
    id: "c3",
    prompt: "A 1 Gbps desktop drop runs 40 m on cat6. Which connector terminates both ends?",
    options: [
      { id: "a", label: "RJ11" },
      { id: "b", label: "RJ45" },
      { id: "c", label: "F-type" },
      { id: "d", label: "ST" },
    ],
  },
  {
    id: "c4",
    prompt: "A hotel desk phone needs its analog POTS line from the PBX. Which plug?",
    options: [
      { id: "a", label: "RJ45" },
      { id: "b", label: "BNC" },
      { id: "c", label: "MPO" },
      { id: "d", label: "RJ11" },
    ],
  },
];
const M6_KEY = { c1: "a", c2: "c", c3: "b", c4: "d" };

const M7_ITEMS = [
  {
    id: "f1",
    prompt: "A new 10G uplink is patched into an SFP+ transceiver. Which connector mates with the optic's face?",
    options: [
      { id: "a", label: "SC" },
      { id: "b", label: "ST" },
      { id: "c", label: "LC" },
      { id: "d", label: "MPO" },
    ],
  },
  {
    id: "f2",
    prompt: "Two core routers get a 100G spine link. Which single connector carries it?",
    options: [
      { id: "a", label: "MPO" },
      { id: "b", label: "LC" },
      { id: "c", label: "RJ45" },
      { id: "d", label: "ST" },
    ],
  },
  {
    id: "f3",
    prompt: "A 2008 fiber router with round twist-lock ports needs a repair patch. Which connector?",
    options: [
      { id: "a", label: "LC" },
      { id: "b", label: "F-type" },
      { id: "c", label: "MPO" },
      { id: "d", label: "ST" },
    ],
  },
  {
    id: "f4",
    prompt: "At the fiber panel, the campus backbone hands off to patch cords on square push-pull adapters. Which connector?",
    options: [
      { id: "a", label: "BNC" },
      { id: "b", label: "SC" },
      { id: "c", label: "RJ11" },
      { id: "d", label: "LC" },
    ],
  },
];
const M7_KEY = { f1: "c", f2: "a", f3: "d", f4: "b" };

const M8_LEFTS = [
  { id: "GBIC", label: "GBIC" },
  { id: "SFP", label: "SFP" },
  { id: "SFPPLUS", label: "SFP+" },
  { id: "SFP28", label: "SFP28" },
  { id: "QSFPPLUS", label: "QSFP+" },
  { id: "QSFP28", label: "QSFP28" },
];
const M8_RIGHTS = [
  { id: "g1", label: "1 Gbps · legacy form factor · SC duplex face" },
  { id: "g2", label: "1 Gbps · \u201cmini-GBIC\u201d · LC duplex face" },
  { id: "g3", label: "10 Gbps · single lane · LC duplex face" },
  { id: "g4", label: "25 Gbps · single lane · LC duplex face" },
  { id: "g5", label: "40 Gbps · four lanes · MPO-12 face for SR4" },
  { id: "g6", label: "100 Gbps · four lanes · MPO-12 face for SR4" },
];
const M8_KEY = { GBIC: "g1", SFP: "g2", SFPPLUS: "g3", SFP28: "g4", QSFPPLUS: "g5", QSFP28: "g6" };

const M10_ITEMS = [
  {
    id: "d1",
    prompt: "Case 1 — A tech can't get the patch in: the SC plug will not enter the new switch's SFP+ cage. What's the real problem?",
    evidence: "Field note: \u201cTrying to patch the backbone SC cord straight into the SFP+ cage. It just won't go in.\u201d",
    options: [
      { id: "a", label: "Defective cage — RMA it" },
      { id: "b", label: "Wrong connector: SFP+ takes LC" },
      { id: "c", label: "Dirty ferrules — clean and retry" },
      { id: "d", label: "Fit a GBIC to accept SC" },
    ],
  },
  {
    id: "d2",
    prompt: "Case 2 — Two brand-new 10G-SR optics, but the link never comes up with the yellow LC cord that was on the shelf.",
    evidence: "Optics: 10GBASE-SR (multimode, 850 nm). Cord in use: LC-LC, yellow jacket, OS2 single-mode.",
    options: [
      { id: "a", label: "The optics are counterfeit" },
      { id: "b", label: "Force the port speed to 1G" },
      { id: "c", label: "Wrong cord media for SR" },
      { id: "d", label: "Swap to an orange OM1 cord" },
    ],
  },
  {
    id: "d3",
    prompt: "Case 3 — Since a rack move, the MPO trunk drops for a few seconds at a time. The inspection scope shows dust on the ferrule array.",
    options: [
      { id: "a", label: "Inspect, clean, re-seat keyed" },
      { id: "b", label: "The trunk got too long" },
      { id: "c", label: "Dust cleans itself when mated" },
      { id: "d", label: "Swap in a single-mode trunk" },
    ],
  },
];
const M10_KEY = { d1: "b", d2: "c", d3: "a" };

const M11_ITEMS = [
  {
    id: "e1",
    prompt: "Which jacket color marks a single-mode patch cord?",
    options: [
      { id: "a", label: "Aqua" },
      { id: "b", label: "Lime" },
      { id: "c", label: "Yellow" },
      { id: "d", label: "Orange" },
    ],
  },
  {
    id: "e2",
    prompt: "OM3/OM4 laser-optimized multimode cable is jacketed in…",
    options: [
      { id: "a", label: "Aqua" },
      { id: "b", label: "Yellow" },
      { id: "c", label: "Blue" },
      { id: "d", label: "Slate" },
    ],
  },
  {
    id: "e3",
    prompt: "A green fiber connector body tells you…",
    options: [
      { id: "a", label: "It means multimode glass core" },
      { id: "b", label: "It carries PoE power" },
      { id: "c", label: "It's a duplex assembly" },
      { id: "d", label: "It's an APC 8° polish" },
    ],
  },
  {
    id: "e4",
    prompt: "Before mating ANY fiber connector (especially MPO arrays), a tech should…",
    options: [
      { id: "a", label: "Blow on it, wipe with a shirt" },
      { id: "b", label: "Scope it, then one-click clean" },
      { id: "c", label: "Raise Tx power to burn through" },
      { id: "d", label: "Trust the pre-cleaned label" },
    ],
  },
];
const M11_KEY = { e1: "c", e2: "a", e3: "d", e4: "b" };

const M12_ITEMS = [
  {
    id: "g1",
    prompt: "A new MDF must patch dozens of SFP+ optics at the highest density. Which connector family for the patch field?",
    options: [
      { id: "a", label: "LC — highest patch density" },
      { id: "b", label: "SC — larger, lower density" },
      { id: "c", label: "ST — twist-lock tradition" },
      { id: "d", label: "BNC — proven for decades" },
    ],
  },
  {
    id: "g2",
    prompt: "10G to desktops, runs up to 90 m, all-copper budget. What terminates the runs?",
    options: [
      { id: "a", label: "RJ45 on cat5e" },
      { id: "b", label: "RJ11 on voice pair" },
      { id: "c", label: "RJ45 on cat6a" },
      { id: "d", label: "F-type on RG-6" },
    ],
  },
  {
    id: "g3",
    prompt: "A data hall wants trunk cabling that will scale toward 400G without re-pulling. What do you specify?",
    options: [
      { id: "a", label: "An ST fiber backbone" },
      { id: "b", label: "MPO-12/24 parallel trunks" },
      { id: "c", label: "RG-11 coax trunks" },
      { id: "d", label: "Cat6 RJ45 trunks" },
    ],
  },
];
const M12_KEY = { g1: "a", g2: "c", g3: "b" };

const benchAll = (s, req) =>
  Object.entries(req).every(([port, part]) => s.seated[port] === part);

const linkUp = (s, id) => s.links[id] && s.links[id].state === "up";

const MEDIUM_OBJECTIVES = [
  {
    id: "OBJ-M1",
    mode: "medium",
    wo: "WO-01",
    title: "Sort the parts tray: fiber vs copper",
    brief:
      "Every connector in the tray carries either light through glass or electrical pulses through metal. Sorting them is the first reflex an installer builds.",
    look: "Use the parts tray under the panel — each card is one connector.",
    pillar: "P1",
    anchor: "C-01…C-08",
    widget: {
      type: "sort",
      items: M1_ITEMS,
      bins: [
        { id: "fiber", label: "Fiber optic (light / glass)" },
        { id: "copper", label: "Copper (electrical / metal)" },
      ],
      hint: "Click a connector card, then click the bin it belongs to.",
    },
    validate: (s) => M1_ITEMS.every((i) => A(s, `OBJ-M1:bin:${i.id}`) === (["SC", "LC", "ST", "MPO"].includes(i.id) ? "fiber" : "copper")),
    explainFail: () =>
      "Not every card is home yet. Remember: SC, LC, ST and MPO carry light through glass; RJ45 and RJ11 terminate twisted pair; F-type and BNC terminate coax.",
    success:
      "You just built the skill the whole objective hangs on: at a glance, fiber = SC/LC/ST/MPO, twisted pair = RJ45/RJ11, coax = F-type/BNC. On the exam, the first question a scenario answers is \u201cwhich medium?\u201d.",
    hints: [
      "Four of these terminate glass, four terminate metal.",
      "SC, LC, ST, MPO are the fiber family — the rest are copper.",
      "Assign: SC/LC/ST/MPO → fiber; RJ45/RJ11/F-type/BNC → copper.",
    ],
  },
  {
    id: "OBJ-M2",
    mode: "medium",
    wo: "WO-02",
    title: "Latch & ferrule mechanics",
    brief:
      "You release a connector the way you latch it: push-pull, trigger, or bayonet twist. Ferrule size (the ceramic tube that aligns the glass) splits SC/ST from LC.",
    look: "Check the SITE MANUAL → connector library if a mechanism is unfamiliar.",
    pillar: "P1",
    anchor: "C-01…C-04",
    widget: {
      type: "match",
      lefts: M2_LEFTS,
      rights: M2_RIGHTS,
      hint: "Pick the latch + ferrule combination for each fiber connector.",
    },
    validate: (s) => M2_LEFTS.every((l) => pick(s, "OBJ-M2", l.id) === M2_KEY[l.id]),
    explainFail: () =>
      "Some pairings are crossed. SC pushes and clicks on a 2.5 mm ferrule; ST twists (bayonet) on 2.5 mm; LC has a trigger latch on a 1.25 mm ferrule; MPO is a keyed push-pull over a 12-fiber array.",
    success:
      "Latch + ferrule is how techs identify fiber connectors by touch in a dark closet. SC and ST share the 2.5 mm ferrule; LC halves it to 1.25 mm for density; MPO replaces the single ferrule with a 12-fiber array.",
    hints: [
      "One of these latches like an RJ45 tab; one twists like a BNC.",
      "SC = push-pull, ST = bayonet twist, LC = trigger, MPO = keyed push-pull array.",
      "SC→push-pull 2.5 mm, ST→bayonet 2.5 mm, LC→trigger 1.25 mm, MPO→keyed 12-fiber array.",
    ],
  },
  {
    id: "OBJ-M3",
    mode: "medium",
    wo: "WO-03",
    title: "Full names for the bin labels",
    brief:
      "The exam loves full names — and so do spec sheets. Six bin labels lost their full names; put them back.",
    look: "All six answers are in the SITE MANUAL → connector library.",
    pillar: "P1",
    anchor: "C-01…C-08",
    widget: {
      type: "match",
      lefts: M3_LEFTS,
      rights: M3_RIGHTS,
      hint: "Match each abbreviation to its full name.",
    },
    validate: (s) => M3_LEFTS.every((l) => pick(s, "OBJ-M3", l.id) === M3_KEY[l.id]),
    explainFail: () =>
      "Close. SC = Subscriber Connector, LC = Lucent Connector, ST = Straight Tip, MPO = Multi-fiber Push-On, BNC = Bayonet Neill–Concelman, RJ45 = the 8P8C modular plug.",
    success:
      "Full names carry the mechanics: \u201cBayonet\u201d Neill–Concelman twists, \u201cStraight Tip\u201d is the round bayonet fiber connector, \u201cMulti-fiber Push-On\u201d pushes on with many fibers. Vocabulary is recognition.",
    hints: [
      "BNC's full name names its inventor pair and its latch style.",
      "LC comes from Lucent Technologies; MPO describes exactly how it seats.",
      "SC→Subscriber, LC→Lucent, ST→Straight Tip, MPO→Multi-fiber Push-On, BNC→Bayonet Neill–Concelman, RJ45→8P8C.",
    ],
  },
  {
    id: "OBJ-M4",
    mode: "medium",
    wo: "WO-04",
    title: "Wire the copper service board",
    brief:
      "Four copper services, four ports, four connectors. Seat the right plug in each port on the SERVICE BOARD — copper bay of the bench panel.",
    look: "Panel bay 1 (left): DATA-1, VOICE-1, CATV-1, CAM-1. Select the part below, then click the port.",
    pillar: "P2",
    anchor: "C-05…C-08",
    widget: {
      type: "bench",
      checklist: ["DATA-1 holds the RJ45", "VOICE-1 holds the RJ11", "CATV-1 holds the F-type", "CAM-1 holds the BNC"],
      hint: "Select a connector in the tray, then click its port. Wrong fits are refused — read why.",
    },
    validate: (s) => benchAll(s, { DATA1: "RJ45", VOICE1: "RJ11", CATV1: "FTYPE", CAM1: "BNC" }),
    explainFail: () =>
      "Check each port: the workstation drop takes RJ45 (8P8C), the fax/POTS line takes RJ11 (6P2C), the cable-modem drop takes the threaded F-type, and the analog camera loop takes the bayonet BNC.",
    success:
      "Copper board complete. Notice how each service dictated its connector: data = 8P8C modular, voice = 6P2C modular, DOCSIS = threaded 75 Ω coax, CCTV = bayonet 75 Ω coax. Medium follows service, connector follows medium.",
    hints: [
      "Each port's caption tells you the service; the tray card tells you the connector.",
      "DATA-1=RJ45, VOICE-1=RJ11, CATV-1=F-type, CAM-1=BNC.",
      "If a port refuses a part, read the refusal — it names the mismatch.",
    ],
  },
  {
    id: "OBJ-M5",
    mode: "medium",
    wo: "WO-05",
    title: "Load the fiber panel adapter plates",
    brief:
      "Passive fiber panels don't care about your optics — only about the plug's shape. Seat each fiber connector in its matching adapter plate.",
    look: "Panel bay 2 (middle): BB-SC, LEG-ST, UPLK-LC, TRK-MPO.",
    pillar: "P2",
    anchor: "C-01…C-04",
    widget: {
      type: "bench",
      checklist: ["BB-SC holds the SC", "LEG-ST holds the ST", "UPLK-LC holds the LC", "TRK-MPO holds the MPO"],
      hint: "Match plug shapes to adapter plates — the ghost outline in each port shows its receptacle.",
    },
    validate: (s) => benchAll(s, { BBSC: "SC", LEGST: "ST", UPLKLC: "LC", TRKMPO: "MPO" }),
    explainFail: () =>
      "Match by shape and size: square push-pull SC → BB-SC; round bayonet ST → LEG-ST; small trigger-latch LC → UPLK-LC; wide keyed 12-fiber MPO → TRK-MPO.",
    success:
      "Fiber panel loaded. You've now physically handled every fiber connector in the objective: SC, ST, LC and the 12-fiber MPO — and felt why density (LC) and parallel optics (MPO) exist.",
    hints: [
      "The port captions name the connector family each plate accepts.",
      "SC→BB-SC, ST→LEG-ST, LC→UPLK-LC, MPO→TRK-MPO.",
      "Eject a wrong seat by clicking the seated connector.",
    ],
  },
  {
    id: "OBJ-M6",
    mode: "medium",
    wo: "WO-06",
    title: "Copper call-outs from the field",
    brief:
      "Real jobs arrive as sentences, not diagrams. Read each ticket and call out the right copper connector — the skill the exam actually tests.",
    pillar: "P2",
    anchor: "C-05…C-08, C-11",
    widget: { type: "decision", items: M6_ITEMS, hint: "Pick one connector per ticket." },
    validate: (s) => M6_ITEMS.every((i) => pick(s, "OBJ-M6", i.id) === M6_KEY[i.id]),
    explainFail: () =>
      "Re-read the medium in each ticket: DOCSIS = 75 Ω coax → F-type; analog CCTV = 75 Ω coax → BNC; 1G data = twisted pair → RJ45; POTS voice = one pair → RJ11.",
    success:
      "Four field tickets, four correct call-outs. This is objective 1.7's daily shape: someone describes a service, you name the fitting — cable modem = F-type, analog camera = BNC, LAN = RJ45, phone = RJ11.",
    hints: [
      "DOCSIS and CCTV are both coax — but one is threaded and one is bayonet.",
      "Cable modem → F-type; camera → BNC; desktop → RJ45; phone → RJ11.",
      "Threaded coax = F-type; quarter-turn coax = BNC.",
    ],
  },
  {
    id: "OBJ-M7",
    mode: "medium",
    wo: "WO-07",
    title: "Fiber call-outs from the field",
    brief:
      "Same drill, glass side: pick the fiber connector each scenario is really asking for — generation and density decide.",
    pillar: "P2",
    anchor: "C-01…C-04, C-11",
    widget: { type: "decision", items: M7_ITEMS, hint: "Pick one connector per ticket." },
    validate: (s) => M7_ITEMS.every((i) => pick(s, "OBJ-M7", i.id) === M7_KEY[i.id]),
    explainFail: () =>
      "Anchor each answer to the equipment: SFP+ optics → LC; 100G parallel spine → MPO; 2008 twist-lock router → ST; backbone panel hand-off → SC.",
    success:
      "Fiber call-outs banked. Pattern to keep: modern optics speak LC, parallel optics speak MPO, legacy rings speak ST, backbone panels traditionally speak SC.",
    hints: [
      "Ask: what equipment is on the far end?",
      "SFP+ = LC, 100G spine = MPO, 2008 ring = ST, backbone panel = SC.",
      "The phrase \u201cround twist-lock\u201d points to ST; \u201csquare push-pull\u201d points to SC.",
    ],
  },
  {
    id: "OBJ-M8",
    mode: "medium",
    wo: "WO-08",
    title: "Pluggable generations: GBIC → QSFP28",
    brief:
      "The chapter title's other half: transceivers. Match each pluggable module to its generation, speed and face — the family tree in six cards.",
    look: "The MODULES section of the parts tray; details in the SITE MANUAL → pluggable family.",
    pillar: "P1",
    anchor: "C-09",
    widget: {
      type: "match",
      lefts: M8_LEFTS,
      rights: M8_RIGHTS,
      hint: "Match each module to its speed + face description.",
    },
    validate: (s) => M8_LEFTS.every((l) => pick(s, "OBJ-M8", l.id) === M8_KEY[l.id]),
    explainFail: () =>
      "Re-anchor by speed: GBIC 1G (SC face, legacy), SFP 1G, SFP+ 10G, SFP28 25G, QSFP+ 40G, QSFP28 100G — the QSFPs are four-lane and use MPO-12 for SR4 parallel optics.",
    success:
      "Family tree complete: GBIC → SFP shrank the module, SFP+ took it to 10G, SFP28 to 25G, and the four-lane QSFP+ / QSFP28 jumped to 40G/100G over MPO-12. Speeds and faces are the exam's favorite transceiver facts.",
    hints: [
      "Q in QSFP literally stands for Quad — four lanes.",
      "Speeds: 1, 1, 10, 25, 40, 100 Gbps in family order.",
      "GBIC→1G SC, SFP→1G LC, SFP+→10G, SFP28→25G, QSFP+→40G, QSFP28→100G.",
    ],
  },
  {
    id: "OBJ-M9",
    mode: "medium",
    wo: "WO-09",
    title: "Build the 10G uplink",
    brief:
      "Time to chain it end to end: seat the right modules in both SFP+ cages, land the matching patch cord, and prove the link with VERIFY.",
    look: "Switch bay (right): CAGE-A and CAGE-B. Cords are in the tray's CORDS section.",
    pillar: "P3",
    anchor: "C-09, C-10, C-14",
    widget: {
      type: "bench",
      checklist: [
        "CAGE-A holds an SFP+ module",
        "CAGE-B holds an SFP+ module",
        "LC cord lands on both module jacks (aqua OM4)",
        "VERIFY LINKS pressed — 10G LED green",
      ],
      hint: "Modules first, then cord, then VERIFY. The cord must match SR optics: aqua OM4.",
    },
    validate: (s) =>
      s.seated["CAGEA"] === "SFPPLUS" &&
      s.seated["CAGEB"] === "SFPPLUS" &&
      s.lcCordA !== null &&
      s.lcCordB !== null &&
      s.lcCordKind === "LC_CORD" &&
      linkUp(s, "10G-A↔B"),
    explainFail: () =>
      "Walk the chain: two SFP+ modules (not SFP — this is a 10G order), an aqua OM4 LC cord on BOTH module jacks, then press VERIFY LINKS. A yellow cord would prove the media-mismatch lesson instead.",
    success:
      "Link verified at 10G. You executed the full Layer-1 chain: module ↔ module face (LC duplex) ↔ matched media (OM4 aqua) ↔ verification. Media-matching (SR=multimode=aqua, LR=single-mode=yellow) is a guaranteed exam angle.",
    hints: [
      "The cages only accept SFP-family modules; 10G order = SFP+.",
      "After seating both SFP+ modules, LC jacks appear on their faces — click the aqua cord, then each jack.",
      "Finish with the VERIFY LINKS button on the switch face.",
    ],
  },
  {
    id: "OBJ-M10",
    mode: "medium",
    wo: "WO-10",
    title: "Dead-link clinic",
    brief:
      "Three broken links land on your bench. Diagnose each from its evidence — wrong connector, wrong media, or dirty glass.",
    pillar: "P3",
    anchor: "C-04, C-10, C-13",
    widget: { type: "decision", items: M10_ITEMS, hint: "Read each case's evidence before choosing." },
    validate: (s) => M10_ITEMS.every((i) => pick(s, "OBJ-M10", i.id) === M10_KEY[i.id]),
    explainFail: () =>
      "Triage each case by its clue: a plug that won't enter = wrong connector/form factor; a color mismatch (yellow cord, SR optics) = media mismatch; intermittent after a move with visible dust = contamination — clean and re-seat.",
    success:
      "Three for three. Your troubleshooting ladder now reads: won't fit → form factor; won't light → media/wavelength match; intermittent → inspect & clean. That ladder solves most of objective 1.7's scenario questions.",
    hints: [
      "Physical fit problems are form-factor problems — no amount of cleaning fixes them.",
      "Match cord jacket color to optic type: aqua=multimode SR, yellow=single-mode LR.",
      "Intermittent after handling = contamination: inspect, clean, re-seat keyed.",
    ],
  },
  {
    id: "OBJ-M11",
    mode: "medium",
    wo: "WO-11",
    title: "Color codes & fiber care",
    brief:
      "Jacket and body colors are the fiber plant's shared language — and fiber care is a discipline. Four quick rulings.",
    pillar: "P4",
    anchor: "C-10, C-12",
    widget: { type: "decision", items: M11_ITEMS, hint: "One pick per ruling." },
    validate: (s) => M11_ITEMS.every((i) => pick(s, "OBJ-M11", i.id) === M11_KEY[i.id]),
    explainFail: () =>
      "Fix the rulings: single-mode cords are yellow; OM3/OM4 multimode is aqua; green body = APC 8° polish (never mate to UPC); and every mating starts with inspect-and-clean.",
    success:
      "Rulings locked: yellow = OS2 single-mode, aqua = OM3/OM4 multimode, green = APC (8°, never to UPC blue), and inspect-and-clean before every mating. These are the care habits that keep links up for a decade.",
    hints: [
      "Two colors carry the SM/MM distinction: yellow and aqua.",
      "A = Angled: APC polishes at 8°, UPC at 0° (blue).",
      "Cleaning is always first — never transmit power through contamination.",
    ],
  },
  {
    id: "OBJ-M12",
    mode: "medium",
    wo: "WO-12",
    title: "New-build consult",
    brief:
      "A client asks you to specify three builds. Choose with the trade-offs in mind: density, distance, and future bandwidth.",
    pillar: "P4",
    anchor: "C-11, C-05, C-01…C-04",
    widget: { type: "decision", items: M12_ITEMS, hint: "One pick per build." },
    validate: (s) => M12_ITEMS.every((i) => pick(s, "OBJ-M12", i.id) === M12_KEY[i.id]),
    explainFail: () =>
      "Weigh each requirement: SFP+ patch density → LC; 10G at 90 m on copper → RJ45 on cat6a (cat5e won't carry 10GBASE-T); 400G-ready trunking → MPO-12/24 parallel trunks.",
    success:
      "Consult delivered — selection is the objective's P4: right connector for the right constraint. Density → LC, distance+speed → cat6a RJ45, future-proofing → MPO. Recommend, then verify with certification tools.",
    hints: [
      "Ferrule size drives patch-panel density.",
      "10GBASE-T over copper needs cat6a for full 100 m channels.",
      "Parallel optics (and 400G) ride multi-fiber MPO trunks.",
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HARD — JOURNEYMAN WORK ORDERS (10)
// ─────────────────────────────────────────────────────────────────────────────

const H1_ROWS = [
  { id: "b1", line: "cat6a patch cord, RJ45 both ends — workstation drop, 85 m, 10G" },
  {
    id: "b2",
    line: "Single-mode OS2 backbone — LC connectors on 2.5 mm ferrules",
    fix: [
      { id: "f2", label: "2.5 mm is correct" },
      { id: "f1", label: "Correct ferrule: 1.25 mm" },
      { id: "f3", label: "3.0 mm ferrules" },
    ],
  },
  { id: "b3", line: "Campus ring repair, 2008 router — ST simplex bayonet connectors" },
  {
    id: "b4",
    line: "CATV drop — RG-6 with BNC bayonet fittings",
    fix: [
      { id: "f1", label: "F-type threaded fittings" },
      { id: "f2", label: "BNC is correct" },
      { id: "f3", label: "RJ45 couplers" },
    ],
  },
  { id: "b5", line: "Fax line — RJ11 6P2C on voice-grade pair" },
  {
    id: "b6",
    line: "100G spine trunk — QSFP28 SR4 on MPO-8",
    fix: [
      { id: "f2", label: "MPO-8 is correct" },
      { id: "f3", label: "Duplex LC trunk" },
      { id: "f1", label: "MPO-12 trunk" },
    ],
  },
  { id: "b7", line: "SFP+ uplink — LC duplex, OM4 aqua patch cord" },
  {
    id: "b8",
    line: "Analog dome camera — F-type fittings on RG-59",
    fix: [
      { id: "f2", label: "F-type is correct" },
      { id: "f1", label: "BNC bayonet fittings" },
      { id: "f3", label: "RJ11 on voice pair" },
    ],
  },
  {
    id: "b9",
    line: "New workstation data drop — RJ11 6P2C",
    fix: [
      { id: "f1", label: "RJ45 8P8C" },
      { id: "f2", label: "RJ11 is correct" },
      { id: "f3", label: "F-type on RG-6" },
    ],
  },
  { id: "b10", line: "Legacy 10BASE-2 test segment — BNC T-connectors, RG-58" },
  { id: "b11", line: "Backbone patch panel — SC duplex adapters (blue, SM UPC)" },
  {
    id: "b12",
    line: "New high-density SFP+ patch area — ST adapters",
    fix: [
      { id: "f2", label: "ST is correct" },
      { id: "f3", label: "MPO adapters" },
      { id: "f1", label: "LC adapters" },
    ],
  },
  { id: "b13", line: "POTS splitter — RJ11 to phone, RJ11 to wall demarc" },
  {
    id: "b14",
    line: "Antenna feed — RG-6 with RJ45 threaded terminations",
    fix: [
      { id: "f3", label: "BNC fittings" },
      { id: "f2", label: "RJ45 is correct" },
      { id: "f1", label: "F-type fittings" },
    ],
  },
];
const H1_ERRORS = new Set(["b2", "b4", "b6", "b8", "b9", "b12", "b14"]);
const H1_FIX_KEY = { b2: "f1", b4: "f1", b6: "f1", b8: "f1", b9: "f1", b12: "f1", b14: "f1" };

const H2_ITEMS = [
  {
    id: "r1",
    prompt: "Run 1 — Workstation data, 85 m, 10G requirement",
    options: [
      { id: "a", label: "F-type" },
      { id: "b", label: "RJ11" },
      { id: "c", label: "RJ45" },
      { id: "d", label: "LC" },
    ],
    secondary: {
      options: [
        { id: "a", label: "cat5e" },
        { id: "b", label: "cat6" },
        { id: "c", label: "cat6a" },
      ],
    },
  },
  {
    id: "r2",
    prompt: "Run 2 — VoIP phone + PC pass-through, 40 m, 1G, budget build",
    options: [
      { id: "a", label: "RJ11" },
      { id: "b", label: "RJ45" },
      { id: "c", label: "BNC" },
      { id: "d", label: "ST" },
    ],
    secondary: {
      options: [
        { id: "a", label: "cat6" },
        { id: "b", label: "RG-6" },
        { id: "c", label: "cat5e" },
      ],
    },
  },
  {
    id: "r3",
    prompt: "Run 3 — ISP cable-internet drop (DOCSIS)",
    options: [
      { id: "a", label: "RJ45" },
      { id: "b", label: "BNC" },
      { id: "c", label: "SC" },
      { id: "d", label: "F-type" },
    ],
    secondary: {
      options: [
        { id: "a", label: "OM4" },
        { id: "b", label: "RG-6" },
        { id: "c", label: "cat6" },
      ],
    },
  },
  {
    id: "r4",
    prompt: "Run 4 — Analog camera loop to the DVR head-end",
    options: [
      { id: "a", label: "BNC" },
      { id: "b", label: "F-type" },
      { id: "c", label: "RJ45" },
      { id: "d", label: "MPO" },
    ],
    secondary: {
      options: [
        { id: "a", label: "RG-59" },
        { id: "b", label: "cat6a" },
        { id: "c", label: "OS2" },
      ],
    },
  },
  {
    id: "r5",
    prompt: "Run 5 — Fax / POTS line from the demarc",
    options: [
      { id: "a", label: "RJ45" },
      { id: "b", label: "F-type" },
      { id: "c", label: "RJ11" },
      { id: "d", label: "ST" },
    ],
    secondary: {
      options: [
        { id: "a", label: "cat6a pair" },
        { id: "b", label: "RG-59 coax" },
        { id: "c", label: "Voice-grade pair" },
      ],
    },
  },
  {
    id: "r6",
    prompt: "Run 6 — 10G uplink MDF↔IDF, 150 m, single-mode optics ordered",
    options: [
      { id: "a", label: "SC" },
      { id: "b", label: "LC" },
      { id: "c", label: "RJ45" },
      { id: "d", label: "BNC" },
    ],
    secondary: {
      options: [
        { id: "a", label: "OM4 (MM)" },
        { id: "b", label: "cat6" },
        { id: "c", label: "OS2 (SM)" },
      ],
    },
  },
  {
    id: "r7",
    prompt: "Run 7 — 100G spine trunk, 30 m, QSFP28 SR4 modules",
    options: [
      { id: "a", label: "LC" },
      { id: "b", label: "ST" },
      { id: "c", label: "F-type" },
      { id: "d", label: "MPO" },
    ],
    secondary: {
      options: [
        { id: "a", label: "OM4" },
        { id: "b", label: "OS2" },
        { id: "c", label: "RG-6" },
      ],
    },
  },
  {
    id: "r8",
    prompt: "Run 8 — Patch into the legacy ST ring router being kept in service",
    options: [
      { id: "a", label: "ST" },
      { id: "b", label: "LC" },
      { id: "c", label: "RJ11" },
      { id: "d", label: "BNC" },
    ],
    secondary: {
      options: [
        { id: "a", label: "OS2 (yellow SM)" },
        { id: "b", label: "OM2 (orange MM)" },
        { id: "c", label: "RG-58" },
      ],
    },
  },
];
const H2_KEY = {
  r1: ["c", "c"], // RJ45 + cat6a
  r2: ["b", "a"], // RJ45 + cat6
  r3: ["d", "b"], // F-type + RG-6
  r4: ["a", "a"], // BNC + RG-59
  r5: ["c", "c"], // RJ11 + voice-grade
  r6: ["b", "c"], // LC + OS2
  r7: ["d", "a"], // MPO + OM4
  r8: ["a", "b"], // ST + OM2
};

const H3_ITEMS = [
  {
    id: "L1",
    prompt: "Link 1 — 10G between buildings. Optics: SFP+ 10GBASE-LR (single-mode, 1310 nm) both ends. Cord: LC-LC aqua OM4. Result: no link, optics see no usable light.",
    options: [
      { id: "a", label: "RJ11 seated in an RJ45 jack" },
      { id: "b", label: "APC connector mated to UPC" },
      { id: "c", label: "MM aqua cord on SM optics" },
      { id: "d", label: "MPO key rotated at one end" },
    ],
  },
  {
    id: "L2",
    prompt: "Link 2 — 100G QSFP28 SR4 trunk, dead since a rack move. One end's MPO plug goes in rotated: the key was forced.",
    options: [
      { id: "a", label: "MPO key/polarity misalignment" },
      { id: "b", label: "Dirty ferrules on the array" },
      { id: "c", label: "1G SFP in a forced-10G port" },
      { id: "d", label: "SC plug forced into an LC cage" },
    ],
  },
  {
    id: "L3",
    prompt: "Link 3 — 10G link has high reflection and low signal. One end was patched with a green APC connector into a blue UPC adapter plate.",
    options: [
      { id: "a", label: "The fiber core is too thick" },
      { id: "b", label: "Wrong connector family (SC vs LC)" },
      { id: "c", label: "RJ11 seated in an RJ45 jack" },
      { id: "d", label: "APC-to-UPC polish mismatch" },
    ],
  },
  {
    id: "L4",
    prompt: "Link 4 — Copper-to-fiber edge case ruled out; scope shows a fingerprint smudge on one ferrule; link flaps under load.",
    options: [
      { id: "a", label: "MPO polarity incompatibility" },
      { id: "b", label: "Contaminated ferrule — clean it" },
      { id: "c", label: "1G SFP forced into a 10G port" },
      { id: "d", label: "MM cord on SM optics" },
    ],
  },
];
const H3_KEY = { L1: "c", L2: "a", L3: "d", L4: "b" };

const H4_ITEMS = [
  {
    id: "s1",
    prompt: "Two core switches, 30 m apart in-row. Which module pair delivers 100G over multimode?",
    options: [
      { id: "a", label: "SFP+ LR pair (10G, single-mode)" },
      { id: "b", label: "QSFP28 SR4 (4×25G, multimode)" },
      { id: "c", label: "QSFP28 LR4 (100G, single-mode)" },
      { id: "d", label: "SFP28 SR pair (25G, multimode)" },
    ],
  },
  {
    id: "s2",
    prompt: "Which trunk cable lands on those modules?",
    options: [
      { id: "a", label: "MPO-12 OM4 trunk" },
      { id: "b", label: "Duplex LC OM4 cord" },
      { id: "c", label: "MPO-8 OM3 trunk" },
      { id: "d", label: "cat6a copper bundle" },
    ],
  },
  {
    id: "s3",
    prompt: "How many fibers actively carry a 100GBASE-SR4 link?",
    options: [
      { id: "a", label: "2 (one Tx, one Rx)" },
      { id: "b", label: "4 (one per lane)" },
      { id: "c", label: "8 (4 Tx + 4 Rx)" },
      { id: "d", label: "12 (all of them)" },
    ],
  },
  {
    id: "s4",
    prompt: "And the remaining fibers in the MPO-12 plug?",
    options: [
      { id: "a", label: "They're grounded for safety" },
      { id: "b", label: "They carry reverse traffic" },
      { id: "c", label: "They power the modules" },
      { id: "d", label: "4 ride along unused" },
    ],
  },
];
const H4_KEY = { s1: "b", s2: "a", s3: "c", s4: "d" };

const H5_ROWS = [
  { id: "SFP", label: "SFP module (1G)" },
  { id: "SFPPLUS", label: "SFP+ module (10G)" },
  { id: "QSFPPLUS", label: "QSFP+ module (40G)" },
  { id: "QSFP28", label: "QSFP28 module (100G)" },
];
const H5_COLS = [
  { id: "cSFP", label: "SFP cage (1G)" },
  { id: "cSFPPLUS", label: "SFP+ cage (10G)" },
  { id: "cQSFPPLUS", label: "QSFP+ cage (40G)" },
  { id: "cQSFP28", label: "QSFP28 cage (100G)" },
];

const H6_STEPS = [
  { id: "h6a", label: "Survey & document the 10BASE-2 coax bus and the ST ring exactly as found" },
  { id: "h6b", label: "Install new cabling in parallel: cat6 to the desks, OS2 with LC panels for the ring" },
  { id: "h6c", label: "Cut over devices: workstations onto RJ45, routers onto SFP+/LC" },
  { id: "h6d", label: "Certify and document every new link before it carries production" },
  { id: "h6e", label: "Decommission the coax bus and ST hardware; recover and recycle" },
];
const H6_KEY = ["h6a", "h6b", "h6c", "h6d", "h6e"];

const H7_ITEMS = [
  {
    id: "h7a",
    prompt: "ROOT CAUSE — after reviewing all evidence, what actually kills the trunk?",
    options: [
      { id: "a", label: "The UPS sag corrupted the optics" },
      { id: "b", label: "A copper flap bled into the trunk" },
      { id: "c", label: "Dirty ferrules plus a misaligned key" },
      { id: "d", label: "Polarity method C rejects QSFP28" },
    ],
  },
  {
    id: "h7b",
    prompt: "CORRECTIVE SEQUENCE — pick the professionally correct one.",
    options: [
      { id: "a", label: "Reboot, replace the trunk, open a case" },
      { id: "b", label: "Raise Tx power, clean one end" },
      { id: "c", label: "Swap polarity blindly, skip cleaning" },
      { id: "d", label: "Clean both, re-seat keyed, re-test" },
    ],
  },
];
const H7_KEY = { h7a: "c", h7b: "d" };

const H8_ITEMS = [
  {
    id: "h8a",
    prompt: "The customer's existing patch field is duplex-LC OM4 panels. Can 40GBASE-SR4 ride it?",
    options: [
      { id: "a", label: "Yes — LC carries any speed" },
      { id: "b", label: "No — SR4 needs 8 fibers on MPO-12" },
      { id: "c", label: "Yes, if the cord is OM5" },
      { id: "d", label: "No — OM4 stops at 25G" },
    ],
  },
  {
    id: "h8b",
    prompt: "Correct fix for this in-row 25 m link?",
    options: [
      { id: "a", label: "Force both ports to 40G on LC" },
      { id: "b", label: "Swap the switches for cat8 ports" },
      { id: "c", label: "Bond two RG-6 runs for lanes" },
      { id: "d", label: "Install an MPO-12 OM4 trunk" },
    ],
  },
  {
    id: "h8c",
    prompt: "If they insist on reusing duplex-LC panels, the one legitimate alternative is…",
    options: [
      { id: "a", label: "40GBASE-LR4 over OS2 duplex LC" },
      { id: "b", label: "40G-SR4 with an LC-to-MPO clip" },
      { id: "c", label: "Four 10G links fused into one LC" },
      { id: "d", label: "A BNC trunk from the CCTV stock" },
    ],
  },
];
const H8_KEY = { h8a: "b", h8b: "d", h8c: "a" };

const H9_ROWS = [
  { id: "p1", line: "Workstation drop terminated on an RJ11 jack — \u201cit fit the plate\u201d" },
  { id: "p2", line: "Brand-new high-density SFP+ patch area wired with ST adapters" },
  { id: "p3", line: "MPO trunk mated straight out of the box — no inspection, no cleaning" },
  { id: "p4", line: "Fiber slack stuffed behind the panel, bend radius crushed to a few millimeters" },
  { id: "p5", line: "CATV drop: F-type hand-tight, then a quarter-turn with a wrench" },
  { id: "p6", line: "BNC T-connectors reused on the legacy test-bench coax segment" },
  { id: "p7", line: "10G-SR uplink patched with duplex LC on OM4 aqua cord" },
  { id: "p8", line: "Backbone landed on green SC/APC connectors, adapters all APC" },
  { id: "p9", line: "Every patch cord labeled at both ends with its run ID" },
  { id: "p10", line: "All RJ45 keystones terminated to 568B on both ends" },
];
const H9_VIOLATIONS = new Set(["p1", "p2", "p3", "p4"]);

const HARD_OBJECTIVES = [
  {
    id: "OBJ-H1",
    mode: "hard",
    wo: "WO-H1",
    title: "Audit the bill of materials",
    brief:
      "A 14-line BOM for the new comms room crossed your desk. Several lines mis-specify connectors or cable. Flag every erroneous line and pick the fix. Correct-but-unusual lines must NOT be flagged.",
    pillar: "P2",
    anchor: "C-15, C-01…C-09",
    widget: {
      type: "audit",
      rows: H1_ROWS,
      flagLabel: "Flag spec error",
      hint: "7 of the 14 lines contain spec errors.",
    },
    validate: (s) =>
      H1_ROWS.every((r) => {
        const flagged = A(s, `OBJ-H1:flag:${r.id}`) === "1";
        if (H1_ERRORS.has(r.id)) return flagged && pick(s, "OBJ-H1", `fix:${r.id}`) === H1_FIX_KEY[r.id];
        return !flagged;
      }),
    explainFail: (s) => {
      const wrongFlags = H1_ROWS.filter((r) => !H1_ERRORS.has(r.id) && A(s, `OBJ-H1:flag:${r.id}`) === "1");
      const missed = [...H1_ERRORS].filter((id) => A(s, `OBJ-H1:flag:${id}`) !== "1");
      const badFixes = [...H1_ERRORS].filter((id) => pick(s, "OBJ-H1", `fix:${id}`) !== H1_FIX_KEY[id]);
      return [
        wrongFlags.length ? `False positives: ${wrongFlags.map((r) => r.id.toUpperCase()).join(", ")} — those lines are unusual but correct for their context (legacy gear, test benches, brand-standard panels).` : "",
        missed.length ? `Missed errors: ${missed.join(", ").toUpperCase()}.` : "",
        badFixes.length ? `Fixes still wrong on: ${badFixes.join(", ").toUpperCase()}.` : "",
      ]
        .filter(Boolean)
        .join(" ");
    },
    success:
      "BOM signed back with seven corrections. Reading a BOM this way — LC=1.25 mm, CATV=F-type, SR4=MPO-12, cameras=BNC, data=RJ45, density=LC — is exactly how procurement errors are caught before they're pulled through 300 cables.",
    nudge: "Check ferrule sizes, coax latch styles, trunk widths and generation mismatches — 7 lines fail one of those tests.",
  },
  {
    id: "OBJ-H2",
    mode: "hard",
    wo: "WO-H2",
    title: "Spec the mixed-building job card",
    brief:
      "Eight runs, one building, zero tolerance: pick connector AND medium for each run. Distances and equipment constraints make exactly one combination correct per run.",
    pillar: "P4",
    anchor: "C-11, C-05…C-09",
    widget: { type: "decision", items: H2_ITEMS, hint: "Each run needs a connector pick AND a medium pick." },
    validate: (s) =>
      H2_ITEMS.every((i) => {
        const [c, m] = H2_KEY[i.id];
        return pick(s, "OBJ-H2", i.id) === c && pick(s, "OBJ-H2", i.id, 2) === m;
      }),
    explainFail: () =>
      "Re-check the constraint pairs: 10G@85 m → RJ45/cat6a (cat6 gives out before 100 m at 10G); 1G@40 m budget → RJ45/cat6; DOCSIS → F-type/RG-6; analog camera → BNC/RG-59; POTS → RJ11/voice; 150 m SM uplink → LC/OS2; 100G SR4 → MPO/OM4; legacy ST ring → ST/OM2.",
    success:
      "Job card approved first pass. You just did the paying version of objective 1.7: eight services in, eight connector+medium specs out — with the 10G/cat6a-at-distance trap handled.",
    nudge: "Run 1 is the trap: 10GBASE-T needs cat6a for anything near 100 m. Runs 3–5 are copper/coax classics.",
  },
  {
    id: "OBJ-H3",
    mode: "hard",
    wo: "WO-H3",
    title: "Four dead links, one cause each",
    brief:
      "Four tickets, four distinct Layer-1 causes. Match each link to its true root cause — the distractors are drawn from the same pool, so read the evidence, don't pattern-match.",
    pillar: "P3",
    anchor: "C-10, C-13, C-04",
    widget: { type: "decision", items: H3_ITEMS, hint: "Each option is used at most once — causes do not repeat." },
    validate: (s) => H3_ITEMS.every((i) => pick(s, "OBJ-H3", i.id) === H3_KEY[i.id]),
    explainFail: () =>
      "Cause taxonomy: won't light from day one with colored cords → media mismatch; dead after a physical move with a forced key → polarity; high reflection → APC/UPC mix; flapping with visible contamination → dirty ferrule.",
    success:
      "Four causes, four clean matches. You've separated the whole mismatch family: media (MM/SM), polarity (key), polish (APC/UPC) and contamination (clean-first). That taxonomy is the troubleshooting core of this objective.",
    nudge: "One cause is about the 8° polish angle, one about the keyway, one about jacket color, one about hygiene.",
  },
  {
    id: "OBJ-H4",
    mode: "hard",
    wo: "WO-H4",
    title: "Spec the 100G spine",
    brief: "Core pair, 30 m apart, multimode in the aisle. Specify the modules, the trunk, and prove you know where the fibers go.",
    pillar: "P1",
    anchor: "C-04, C-09, C-10",
    widget: { type: "decision", items: H4_ITEMS, hint: "SR4 = four lanes of 25G, each needing its own Tx and Rx fiber." },
    validate: (s) => H4_ITEMS.every((i) => pick(s, "OBJ-H4", i.id) === H4_KEY[i.id]),
    explainFail: () =>
      "Recompute: 100G in-row multimode = QSFP28 SR4; its face is MPO-12; SR4 lights 8 fibers (4 Tx + 4 Rx); the other 4 of 12 ride along unused as spares. LR4 would be duplex LC but single-mode and 10 km class — wrong tool for 30 m MM.",
    success:
      "Spine specced like a data-center tech: QSFP28 SR4 + MPO-12 OM4, 8 of 12 fibers active. Understanding why parallel optics need the multi-fiber plug is what separates MPO knowledge from trivia.",
    nudge: "Count the lanes, then count the directions, then count the leftovers.",
  },
  {
    id: "OBJ-H5",
    mode: "hard",
    wo: "WO-H5",
    title: "Module × cage compatibility matrix",
    brief:
      "Fill the matrix: for each module/cage pair, rule WORKS or FAILS (simplified rule: modules operate in their own generation's cage; physical families don't mix).",
    pillar: "P1",
    anchor: "C-09",
    widget: { type: "matrix", rows: H5_ROWS, cols: H5_COLS, hint: "Click a cell to cycle — blank → works → fails." },
    validate: (s) =>
      H5_ROWS.every((r) =>
        H5_COLS.every((c) => {
          const want = r.id === { cSFP: "SFP", cSFPPLUS: "SFPPLUS", cQSFPPLUS: "QSFPPLUS", cQSFP28: "QSFP28" }[c.id] ? "works" : "fails";
          return A(s, `OBJ-H5:${r.id}:${c.id}`) === want;
        })
      ),
    explainFail: () =>
      "Diagonal only, under the simplified rule: SFP↔SFP cage, SFP+↔SFP+ cage, QSFP+↔QSFP+ cage, QSFP28↔QSFP28 cage. Everything else — wrong generation, wrong lane count, wrong footprint — fails.",
    success:
      "Matrix complete — diagonal green. Real equipment sometimes negotiates across generations (labeled simplified here), but the exam and your first-week reflex should be: match module generation to cage generation.",
    nudge: "Four modules, four cages, one rule: same generation or it fails.",
  },
  {
    id: "OBJ-H6",
    mode: "hard",
    wo: "WO-H6",
    title: "Plan the legacy migration",
    brief:
      "A client still runs 10BASE-2 coax (BNC) to desks and an ST fiber ring between floors. Order the five migration steps correctly.",
    pillar: "P4",
    anchor: "C-11, C-03, C-08",
    widget: { type: "order", steps: H6_STEPS, hint: "Use the arrows — documentation precedes decommissioning; certification precedes cutback." },
    validate: (s) => {
      const order = A(s, "OBJ-H6:order");
      return Array.isArray(order) && order.length === H6_KEY.length && order.every((id, i) => id === H6_KEY[i]);
    },
    explainFail: () =>
      "Sequence discipline: survey → install in parallel → cut over → certify & document → decommission. Never certify after decommissioning, and never survey after cutting over.",
    success:
      "Migration plan approved. Note the embedded selections you made by choosing these steps: RJ45/cat6 for desks, SFP+/LC over OS2 for the ring — the modern replacements for BNC bus and ST ring, staged without downtime.",
    nudge: "Ask of each step: can it happen without the previous one being true?",
  },
  {
    id: "OBJ-H7",
    mode: "hard",
    wo: "WO-H7",
    title: "Intermittent trunk after the rack move",
    brief:
      "100G trunk drops for seconds at a time since the data hall was rearranged. Six evidence items — two are red herrings. Name the root cause and the correct corrective sequence.",
    evidence: [
      "E1 · UPS event log: 2-second input sag at 03:12 during the move",
      "E2 · Fiber scope: smudge + dust across both MPO ferrule arrays",
      "E3 · Move sheet: trunk re-terminated; port-2 end keyway noted \u201cwent in rotated, forced to seat\u201d",
      "E4 · Access-switch log: unrelated copper port flap on port 24",
      "E5 · Light source/power meter: 6.2 dB loss across the trunk (spec < 1.5 dB)",
      "E6 · Ticket: \u201ccomes up, drops after minutes\u201d — classic contamination signature",
    ],
    pillar: "P3",
    anchor: "C-04, C-12, C-13",
    widget: { type: "decision", items: H7_ITEMS, hint: "Two evidence items are noise; the meter reading and the move sheet agree with the scope." },
    validate: (s) => H7_ITEMS.every((i) => pick(s, "OBJ-H7", i.id) === H7_KEY[i.id]),
    explainFail: () =>
      "Follow the converging evidence: scope shows contamination, the move sheet shows a forced key, the meter shows 6.2 dB (vs < 1.5 dB spec), and the symptom is intermittent — the UPS sag and the copper flap are unrelated noise. Fix = clean both ends, re-seat keyed, then test.",
    success:
      "Case closed on evidence, not vibes: contamination + keyway misalignment, fixed by inspect → clean → re-seat keyed → test → monitor. Note what you rejected: raising Tx power treats the symptom and burns the budget.",
    nudge: "The UPS sag ended before symptoms began; the copper flap is on another device entirely.",
  },
  {
    id: "OBJ-H8",
    mode: "hard",
    wo: "WO-H8",
    title: "The 40G-over-LC consult",
    brief:
      "A customer bought QSFP+ SR4 modules and wants 40G over their existing duplex-LC OM4 patch panels. Kill the idea kindly, fix it properly, and offer the legitimate LC-based alternative.",
    pillar: "P4",
    anchor: "C-04, C-09, C-10, C-11",
    widget: { type: "decision", items: H8_ITEMS, hint: "SR4's four lanes are the whole story." },
    validate: (s) => H8_ITEMS.every((i) => pick(s, "OBJ-H8", i.id) === H8_KEY[i.id]),
    explainFail: () =>
      "The physics: SR4 splits 40G into 4×10G lanes needing 4 Tx + 4 Rx fibers — an MPO-12 job, impossible over one duplex LC pair. Fix = MPO-12 OM4 trunk. If they must keep LC panels: 40GBASE-LR4 over OS2 single-mode.",
    success:
      "Consult saved the project: no cabling exists that makes SR4 ride duplex LC. You proposed the MPO trunk and kept the LC fallback honest (LR4 over single-mode). That's vendor-grade selection reasoning from objective 1.7.",
    nudge: "Count how many fibers a duplex LC pair actually has — then count SR4's requirement.",
  },
  {
    id: "OBJ-H9",
    mode: "hard",
    wo: "WO-H9",
    title: "Punch-list audit",
    brief:
      "An installer's punch list, ten items. Exactly four are violations — flag them and only them. The other six are correct practice, however exotic they look.",
    pillar: "P2",
    anchor: "C-12, C-15, C-05…C-08",
    widget: {
      type: "audit",
      rows: H9_ROWS.map((r) => ({ id: r.id, line: r.line })),
      flagLabel: "Flag violation",
      hint: "Exactly 4 items violate practice. The rest are fine — including the legacy and APC ones.",
    },
    validate: (s) =>
      H9_ROWS.every((r) => (H9_VIOLATIONS.has(r.id) ? A(s, `OBJ-H9:flag:${r.id}`) === "1" : A(s, `OBJ-H9:flag:${r.id}`) !== "1")),
    explainFail: (s) => {
      const wrongFlags = H9_ROWS.filter((r) => !H9_VIOLATIONS.has(r.id) && A(s, `OBJ-H9:flag:${r.id}`) === "1");
      const missed = [...H9_VIOLATIONS].filter((id) => A(s, `OBJ-H9:flag:${id}`) !== "1");
      return [
        wrongFlags.length ? `False positives: ${wrongFlags.map((r) => r.id.toUpperCase()).join(", ")} — proper F-type torque, legacy BNC on a test bench, LC/OM4 for SR, APC-to-APC, labels, and 568B-on-both-ends are all correct.` : "",
        missed.length ? `Missed violations: ${missed.join(", ").toUpperCase()} — RJ11 data drop, ST in a new dense area, unmated-clean MPO, crushed bend radius.` : "",
      ]
        .filter(Boolean)
        .join(" ");
    },
    success:
      "Punch list audited: RJ11-as-data, ST-in-new-dense-areas, uncleaned MPO and crushed bend radius flagged; the six legitimate practices left standing. Distinguishing \u201cunusual but correct\u201d from \u201cwrong\u201d is the auditor's whole job.",
    nudge: "Two violations break connector-purpose rules, two break physical care rules.",
  },
  {
    id: "OBJ-H10",
    mode: "hard",
    wo: "WO-H10",
    title: "Bring up the comms room (capstone)",
    brief:
      "Everything at once: load the copper board, the fiber panel, both SFP+ cages with SFP+, the QSFP28 cage, land both cords, and verify every link. Order is forced by physics — modules before their cords, VERIFY last.",
    pillar: "P4",
    anchor: "C-14 + full objective",
    widget: {
      type: "bench",
      checklist: [
        "Copper board: RJ45 · RJ11 · F-type · BNC seated",
        "Fiber panel: SC · ST · LC · MPO seated",
        "SFP+ in CAGE-A and CAGE-B, aqua LC cord landed both ends",
        "QSFP28 in CAGE-Q, MPO trunk landed",
        "VERIFY LINKS pressed after everything — 10G and 100G green",
      ],
      hint: "Work bays left to right: copper, fiber panel, then cages and cords. VERIFY only when nothing else is left.",
    },
    validate: (s) => {
      const seats = benchAll(s, {
        DATA1: "RJ45",
        VOICE1: "RJ11",
        CATV1: "FTYPE",
        CAM1: "BNC",
        BBSC: "SC",
        LEGST: "ST",
        UPLKLC: "LC",
        TRKMPO: "MPO",
        CAGEA: "SFPPLUS",
        CAGEB: "SFPPLUS",
        CAGEQ: "QSFP28",
      });
      const cords = s.lcCordA !== null && s.lcCordB !== null && s.lcCordKind === "LC_CORD" && s.mpoTrunk;
      const lastIsVerify = s.benchLog.length > 0 && s.benchLog[s.benchLog.length - 1].kind === "verify";
      return seats && cords && lastIsVerify && linkUp(s, "10G-A↔B") && linkUp(s, "100G-Q");
    },
    explainFail: () =>
      "Sequence discipline: seat modules (SFP+ ×2, QSFP28) before their cords; LC cord needs aqua OM4 for the SR pair; MPO trunk lands on CAGE-Q only after the QSFP28 is seated; and the last action must be VERIFY LINKS with every port filled. Ejects are allowed — but verify again after any change.",
    success:
      "Comms room live: every copper service, every fiber plate, a verified 10G uplink and a 100G trunk — in the right order. This is the whole objective performed end to end: specify, seat, cord, verify.",
    nudge: "The bench refuses impossible orders — modules must exist before cords can land on their faces.",
  },
];

// Expose
window.LAB_OBJECTIVES = { MEDIUM: MEDIUM_OBJECTIVES, HARD: HARD_OBJECTIVES };
