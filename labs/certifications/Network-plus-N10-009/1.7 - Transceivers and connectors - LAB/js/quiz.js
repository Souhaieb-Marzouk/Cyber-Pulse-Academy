// ─────────────────────────────────────────────────────────────────────────────
// THE PATCH BENCH — js/quiz.js
// Counter exams (C5): 6 Apprentice concept questions + 7 Journeyman scenario
// questions. Content carried over 1:1 from src/lib/lab17/objectives.ts.
// ─────────────────────────────────────────────────────────────────────────────

const QUIZ_MEDIUM = [
  {
    id: "mq1",
    prompt: "You're patching a 10G link into an SFP+ transceiver. Which connector mates with the optic's port?",
    topic: "SFP optics and their LC face",
    options: [
      { id: "a", label: "LC", why: "Correct. SFP/SFP+/SFP28 optics present an LC duplex face — the small 1.25 mm-ferrule connector is made for that density." },
      { id: "b", label: "SC", why: "SC is the square 2.5 mm-ferrule backbone connector — too large for an SFP+ cage." },
      { id: "c", label: "ST", why: "ST's round bayonet belongs to legacy ring gear, not modern optics." },
      { id: "d", label: "MPO", why: "MPO carries 12+ fibers for parallel optics — an SFP+ is a two-fiber (duplex) module." },
    ],
    correct: "a",
  },
  {
    id: "mq2",
    prompt: "ST and SC share which ferrule size?",
    topic: "Ferrule sizes: 2.5 mm vs 1.25 mm",
    options: [
      { id: "a", label: "1.25 mm", why: "1.25 mm is LC's ferrule — half the size, double the density." },
      { id: "b", label: "8.3 µm", why: "8.3 µm is single-mode fiber's core diameter — a glass dimension, not a ferrule size." },
      { id: "c", label: "2.5 mm", why: "Correct. SC and ST both use 2.5 mm ceramic ferrules; LC alone uses 1.25 mm." },
      { id: "d", label: "A 12-fiber array", why: "Only MPO replaces the ferrule with a multi-fiber array; SC and ST are single-fiber connectors." },
    ],
    correct: "c",
  },
  {
    id: "mq3",
    prompt: "Which connector attaches by threading — you screw it on?",
    topic: "Coax latch styles: threaded vs bayonet",
    options: [
      { id: "a", label: "F-type", why: "Correct. The F-type's threaded barrel screws onto 75 Ω coax for CATV/DOCSIS and antennas." },
      { id: "b", label: "BNC", why: "BNC is the quarter-turn bayonet coax connector — push and twist, no threads." },
      { id: "c", label: "RJ11", why: "RJ11 snaps into modular jacks; nothing screws." },
      { id: "d", label: "MPO", why: "MPO is a keyed push-pull fiber plug." },
    ],
    correct: "a",
  },
  {
    id: "mq4",
    prompt: "Why does a 100G spine link use an MPO connector rather than LC?",
    topic: "Parallel optics: why MPO exists",
    options: [
      { id: "a", label: "MPO is cheaper per fiber", why: "Cost isn't the reason — physics is. The link physically needs more fibers than a duplex pair." },
      { id: "b", label: "MPO polishes to 8° like APC", why: "MPO comes in UPC and APC variants, but that's not why 100G uses it." },
      { id: "c", label: "MPO is hot-swappable and LC isn't", why: "Both mate to passive adapters; the module is the hot-swap part." },
      { id: "d", label: "One plug carries 12 fibers", why: "Correct. Parallel optics split 100G into 4×25G lanes — SR4 lights 8 fibers (4 Tx + 4 Rx), all delivered by one keyed MPO-12." },
    ],
    correct: "d",
  },
  {
    id: "mq5",
    prompt: "A desk phone's analog line (POTS) terminates on which connector?",
    topic: "POTS lines land on RJ11",
    options: [
      { id: "a", label: "RJ45 — every plate has one", why: "RJ45 is the 8P8C data plug; phone lines use the narrower 6-position plug." },
      { id: "b", label: "RJ11", why: "Correct. RJ11 (6P2C) carries one phone pair for POTS/DSL/fax." },
      { id: "c", label: "F-type", why: "F-type is 75 Ω coax — TV and cable internet, not telephone." },
      { id: "d", label: "BNC", why: "BNC is coax video/legacy Ethernet, not POTS." },
    ],
    correct: "b",
  },
  {
    id: "mq6",
    prompt: "Which statement about GBIC vs SFP is TRUE?",
    topic: "Transceiver generations: GBIC → SFP",
    options: [
      { id: "a", label: "GBIC is the newer, smaller module", why: "Backwards — GBIC is the older, larger form factor." },
      { id: "b", label: "SFP is the legacy module; GBIC replaced it", why: "Backwards — SFP (mini-GBIC) miniaturized and replaced GBIC." },
      { id: "c", label: "GBIC is the older 1G module SFP miniaturized", why: "Correct. GBIC ran 1G with SC faces; SFP delivered the same speed in a smaller footprint (usually LC)." },
      { id: "d", label: "Both are 10G modules", why: "Both are 1G modules — 10G arrived with SFP+." },
    ],
    correct: "c",
  },
];

const QUIZ_HARD = [
  {
    id: "hq1",
    prompt: "Ticket: \u201cISP live-internet hand-off, DOCSIS.\u201d A tech preps an RJ45/cat6 drop. Correct call?",
    topic: "DOCSIS hand-offs need F-type on coax",
    options: [
      { id: "a", label: "Approve — ISPs use Ethernet hand-offs", why: "Not this service: DOCSIS arrives on 75 Ω coax." },
      { id: "b", label: "Reject — specify BNC on RG-58", why: "BNC/RG-58 is 50 Ω thinnet territory; CATV plant is F-type/RG-6." },
      { id: "c", label: "Reject — specify F-type on RG-6", why: "Correct. Cable internet rides coax; the threaded F-type terminates it." },
      { id: "d", label: "Reject — specify SC on OS2", why: "Fiber hand-offs exist, but the ticket says DOCSIS — that's coax." },
    ],
    correct: "c",
  },
  {
    id: "hq2",
    prompt: "New 100G spine link, 30 m, in-row multimode. Which kit is correct?",
    topic: "100G SR4 builds: QSFP28 + MPO-12",
    options: [
      { id: "a", label: "QSFP28 SR4 + MPO-12 OM4 trunk", why: "Correct. SR4 rides 8 active fibers of an MPO-12 over OM4 — the standard in-row 100G build." },
      { id: "b", label: "QSFP28 LR4 + duplex LC OS2", why: "LR4 is a 10 km-class single-mode optic — wrong medium and reach class for 30 m MM." },
      { id: "c", label: "QSFP28 SR4 + duplex LC OM4", why: "SR4 can't ride duplex LC — it needs 8 fibers." },
      { id: "d", label: "4 × SFP28 + breakout, one LC each", why: "That's a 4×25G breakout build, not a single 100G spine port as ticketed." },
    ],
    correct: "a",
  },
  {
    id: "hq3",
    prompt: "An analog CCTV camera must reach a DVR head-end. Which connector + medium?",
    topic: "Analog CCTV runs on BNC/RG-59",
    options: [
      { id: "a", label: "F-type on RG-6", why: "Right medium family (coax), wrong latch: camera loops use bayonet BNC." },
      { id: "b", label: "RJ45 on cat5e", why: "That's an IP camera build; this camera is analog." },
      { id: "c", label: "ST on OM2", why: "ST is fiber — this loop is coax." },
      { id: "d", label: "BNC on RG-59", why: "Correct — 75 Ω coax with bayonet BNC is the analog CCTV standard." },
    ],
    correct: "d",
  },
  {
    id: "hq4",
    prompt: "One cubicle, two wall plates: a 1G PC and a desk phone. Which pair of connectors?",
    topic: "Wall-plate service mapping (RJ45/RJ11)",
    options: [
      { id: "a", label: "RJ45 ×2 — phones are Ethernet today", why: "VoIP phones are Ethernet, but a POTS/analog desk phone lands on RJ11." },
      { id: "b", label: "RJ45 for data, RJ11 for voice", why: "Correct — data on 8P8C, POTS on 6P2C." },
      { id: "c", label: "RJ11 ×2 — both are phone-class drops", why: "A PC needs 8 conductors; RJ11 won't carry data." },
      { id: "d", label: "RJ45 on data, F-type on the phone", why: "Coax serves TV/modem services, not a desk phone." },
    ],
    correct: "b",
  },
  {
    id: "hq5",
    prompt: "Log review: two 10G-LR (single-mode) SFP+ optics, no link, and the cord is aqua OM4 LC-LC. First suspicion?",
    topic: "Media matching: aqua MM vs yellow SM",
    options: [
      { id: "a", label: "Dirty ferrules on both LC ends", why: "Possible, but the color evidence points at something systematic — check media first." },
      { id: "b", label: "Port speed forced to 1G", why: "A speed mismatch wouldn't explain the wrong-jacket cord." },
      { id: "c", label: "MM aqua cord on SM optics", why: "Correct. Aqua = OM3/OM4 multimode (850 nm); LR wants yellow OS2 (1310 nm). Light barely couples." },
      { id: "d", label: "APC connector mated to UPC", why: "That causes reflection/loss — but the jacket color already proves the media mismatch." },
    ],
    correct: "c",
  },
  {
    id: "hq6",
    prompt: "A colleague wants 40G-SR4 between two QSFP+ ports using the existing duplex-LC OM4 panels. Why won't it work?",
    topic: "SR4 fiber count vs duplex LC",
    options: [
      { id: "a", label: "SR4 needs 8 fibers, not 2", why: "Correct. SR4 splits 40G into 4 lanes needing 4 Tx + 4 Rx fibers on an MPO-12 — a duplex LC pair carries only 2." },
      { id: "b", label: "OM4 can't carry 40G at all", why: "OM4 carries 40G fine — the constraint is fiber COUNT, not bandwidth." },
      { id: "c", label: "QSFP+ ports reject LC connectors", why: "The port isn't the issue — SR4 optics present an MPO face." },
      { id: "d", label: "The LC panels are single-mode only", why: "OM4 LC panels are multimode; medium isn't the blocker here." },
    ],
    correct: "a",
  },
  {
    id: "hq7",
    prompt: "After a rack move, an MPO trunk is intermittent; the scope shows dust on the ferrule arrays. Best first action?",
    topic: "MPO care: inspect, clean, re-seat keyed",
    options: [
      { id: "a", label: "Replace the whole trunk", why: "Expensive and unnecessary — contamination is cleanable." },
      { id: "b", label: "Raise transmit power to mask it", why: "Treats the symptom, can damage receivers, and the dust remains." },
      { id: "c", label: "Swap polarity methods blindly", why: "Polarity changes without inspection can add a second fault." },
      { id: "d", label: "Inspect, clean, re-seat keyed, re-test", why: "Correct — inspect, clean, re-seat keyed, verify. The standard MPO first response." },
    ],
    correct: "d",
  },
];

// Expose
window.LAB_QUIZ = { MEDIUM: QUIZ_MEDIUM, HARD: QUIZ_HARD };
