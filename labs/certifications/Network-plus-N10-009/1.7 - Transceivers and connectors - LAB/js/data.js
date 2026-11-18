// ─────────────────────────────────────────────────────────────────────────────
// THE PATCH BENCH — N10-009 Objective 1.7 practice lab (static port)
// js/data.js — parts catalog, bench ports, link computation, site manual,
// foreman's debrief content. All data is synthetic training content, carried
// over 1:1 from the original framework lab (src/lib/lab17/parts.ts + content.ts).
// ─────────────────────────────────────────────────────────────────────────────

// ── Parts catalog ────────────────────────────────────────────────────────────

const PARTS = [
  // Fiber connectors
  {
    id: "SC",
    kind: "connector",
    family: "fiber",
    code: "SC",
    name: "Subscriber Connector",
    tagline: "Square push-pull fiber connector on a 2.5 mm ferrule — \u201cstick and click\u201d.",
    specs: [
      ["Family", "Fiber optic"],
      ["Latch", "Push-pull tab (snap in / pull out)"],
      ["Ferrule", "2.5 mm ceramic"],
      ["Format", "Simplex or duplex"],
      ["Colors", "Blue = SM UPC · Green = SM APC · Beige/aqua = MM"],
    ],
    use: "Campus backbones, fiber patch panels, GBIC optics, ISP demarks.",
    status: "Very common; a backbone workhorse since the 1990s",
    tip: "Push until it clicks; pull straight out — never yank at an angle.",
  },
  {
    id: "LC",
    kind: "connector",
    family: "fiber",
    code: "LC",
    name: "Lucent Connector",
    tagline: "Small-form-factor fiber connector with an RJ-style trigger latch on a 1.25 mm ferrule.",
    specs: [
      ["Family", "Fiber optic"],
      ["Latch", "Trigger latch (like an RJ45 tab)"],
      ["Ferrule", "1.25 mm ceramic — half the size of SC/ST"],
      ["Format", "Usually duplex (Tx/Rx clipped together)"],
      ["Colors", "Blue = SM UPC · Green = SM APC · Aqua = MM"],
    ],
    use: "The standard face on SFP / SFP+ / SFP28 optics; highest-density patch fields.",
    status: "The modern default for new fiber installs",
    tip: "Smaller ferrule = more density; press the trigger to release — don't pull the cord.",
  },
  {
    id: "ST",
    kind: "connector",
    family: "fiber",
    code: "ST",
    name: "Straight Tip",
    tagline: "Round bayonet-lock fiber connector (twist to lock) on a 2.5 mm ferrule.",
    specs: [
      ["Family", "Fiber optic"],
      ["Latch", "Bayonet quarter-turn lock (like a BNC)"],
      ["Ferrule", "2.5 mm cylindrical"],
      ["Format", "Simplex"],
      ["Colors", "Usually black housing / beige MM boot"],
    ],
    use: "Legacy campus rings, older patch panels, 1990s–2000s fiber plants.",
    status: "Legacy — still met during repairs and migrations",
    tip: "Twist clockwise to lock, half-turn counter-clockwise to release.",
  },
  {
    id: "MPO",
    kind: "connector",
    family: "fiber",
    code: "MPO",
    name: "Multi-fiber Push-On",
    tagline: "One rectangular keyed plug carrying 12 or more fibers — the 40G/100G workhorse.",
    specs: [
      ["Family", "Fiber optic (multi-fiber)"],
      ["Latch", "Push-pull with a keyed housing"],
      ["Fibers", "12 (common) to 24+ in one plug; MTP is the premium US Conec brand"],
      ["Parallel optics", "40/100GBASE-SR4 uses 8 active fibers of an MPO-12"],
      ["Care", "Inspect and clean before EVERY mating; respect the key/polarity"],
    ],
    use: "Data-center trunks between QSFP+ / QSFP28 ports; high-density backbone cabling.",
    status: "Modern data centers and 400G-ready builds",
    tip: "One speck of dust on the array can kill the whole link — clean first, mate once.",
  },
  // Copper connectors
  {
    id: "RJ45",
    kind: "connector",
    family: "copper",
    code: "RJ45",
    name: "Registered Jack 45 (8P8C)",
    tagline: "The 8-position modular Ethernet plug — the standard LAN connector.",
    specs: [
      ["Family", "Copper, twisted pair"],
      ["Contacts", "8 positions / 8 conductors (8P8C)"],
      ["Cable", "cat5e / cat6 / cat6a UTP-STP"],
      ["Standards", "10BASE-T through 10GBASE-T (10G needs cat6a for the full 100 m)"],
      ["Extras", "Carries PoE power alongside data"],
    ],
    use: "Workstation drops, VoIP phones, APs, switch ports — nearly every copper LAN link.",
    status: "Ubiquitous",
    tip: "RJ11 physically fits some 8P8C jacks but only lands 2 conductors — never use it for data.",
  },
  {
    id: "RJ11",
    kind: "connector",
    family: "copper",
    code: "RJ11",
    name: "Registered Jack 11 (6P2C)",
    tagline: "The smaller telephone modular plug for one phone line (one pair).",
    specs: [
      ["Family", "Copper, twisted pair"],
      ["Contacts", "6 positions, 2 conductors used (6P2C; plugs are often 6P4C)"],
      ["Cable", "Voice-grade twisted pair"],
      ["Service", "POTS analog phone, fax, DSL modems"],
    ],
    use: "Desk phones, fax lines, DSL hand-off from the telco demarc.",
    status: "Legacy-ubiquitous (every phone wall plate)",
    tip: "Visibly narrower than an RJ45 — that size difference is a favorite exam question.",
  },
  {
    id: "FTYPE",
    kind: "connector",
    family: "copper",
    code: "F-type",
    name: "F-type threaded coax connector",
    tagline: "Threaded screw-on coaxial connector — the one on the back of every cable modem.",
    specs: [
      ["Family", "Copper, coaxial (75 Ω)"],
      ["Latch", "Threaded barrel — screw on (hand-tight plus ~1/8 turn)"],
      ["Cable", "RG-59 / RG-6 / RG-11"],
      ["Service", "CATV, DOCSIS cable internet, antennas, satellite"],
    ],
    use: "ISP cable-internet and TV drops, antenna feeds.",
    status: "Ubiquitous in homes and ISP plants",
    tip: "Threaded = F-type; the bayonet coax twist-lock is BNC — don't mix them up.",
  },
  {
    id: "BNC",
    kind: "connector",
    family: "copper",
    code: "BNC",
    name: "Bayonet Neill–Concelman",
    tagline: "Quarter-turn bayonet coaxial connector — legacy Ethernet and CCTV video.",
    specs: [
      ["Family", "Copper, coaxial (50 Ω and 75 Ω variants)"],
      ["Latch", "Bayonet: push in, quarter-turn to lock"],
      ["Cable", "RG-58 (50 Ω thinnet) / RG-59 (75 Ω video)"],
      ["Service", "10BASE-2 Ethernet bus, analog CCTV, test equipment"],
    ],
    use: "Analog camera head-ends, legacy coax bus segments, oscilloscope inputs.",
    status: "Legacy LAN, still standard in CCTV/test benches",
    tip: "Same twist motion as ST fiber — BNC is coax copper, ST is fiber glass.",
  },
  // Transceiver modules
  {
    id: "GBIC",
    kind: "module",
    code: "GBIC",
    name: "Gigabit Interface Converter",
    tagline: "The legacy hot-pluggable 1G module — grandfather of the pluggable family.",
    specs: [
      ["Speed", "1 Gbps"],
      ["Face", "SC duplex (fiber) or RJ45 (copper variant)"],
      ["Hot-swap", "Yes — insert/remove with power on"],
      ["Era", "Late 1990s–2000s; larger than an SFP"],
    ],
    use: "Old 1G switch uplinks; found during equipment audits.",
    status: "Legacy — replaced by SFP (\u201cmini-GBIC\u201d)",
    tip: "Too big for an SFP+ cage; if you find one, expect SC patch cords nearby.",
  },
  {
    id: "SFP",
    kind: "module",
    code: "SFP",
    name: "Small Form-factor Pluggable (mini-GBIC)",
    tagline: "Hot-pluggable 1G module — same footprint as SFP+, typically an LC face.",
    specs: [
      ["Speed", "1 Gbps"],
      ["Face", "LC duplex (fiber) or RJ45 (copper variant)"],
      ["Hot-swap", "Yes"],
      ["Match", "Media type (SM/MM), wavelength and reach must suit the link"],
    ],
    use: "1G fiber uplinks and long runs beyond copper's 100 m.",
    status: "Current",
    tip: "An SFP is 1G even in a faster cage (simplified: match the cage's generation).",
  },
  {
    id: "SFPPLUS",
    kind: "module",
    code: "SFP+",
    name: "Enhanced Small Form-factor Pluggable",
    tagline: "The 10 Gbps module — same size as SFP, LC duplex face.",
    specs: [
      ["Speed", "10 Gbps"],
      ["Face", "LC duplex"],
      ["Hot-swap", "Yes"],
      ["Variants", "SR (short reach, MM 850 nm) · LR (long reach, SM 1310 nm, ~10 km)"],
    ],
    use: "10G uplinks and spine links; the workhorse of campus cores.",
    status: "Current",
    tip: "An aqua OM4 cord suits SR optics; single-mode LR wants a yellow OS2 cord.",
  },
  {
    id: "SFP28",
    kind: "module",
    code: "SFP28",
    name: "25 Gbps SFP",
    tagline: "Single-lane 25 Gbps module — SFP+ footprint, LC face.",
    specs: [
      ["Speed", "25 Gbps"],
      ["Face", "LC duplex"],
      ["Hot-swap", "Yes"],
      ["Ecosystem", "Top-of-rack 25G server access; pairs with QSFP28 100G uplinks"],
    ],
    use: "25G server links in modern leaf-spine designs.",
    status: "Current",
    tip: "Needs a 25G-rated port — a 10G SFP+ cage won't run it (simplified rule).",
  },
  {
    id: "QSFPPLUS",
    kind: "module",
    code: "QSFP+",
    name: "Quad Small Form-factor Pluggable Plus",
    tagline: "Four-lane 40 Gbps module — 40G-SR4 sends 4 lanes over an MPO-12 trunk.",
    specs: [
      ["Speed", "40 Gbps (4 × 10G lanes)"],
      ["Face", "MPO-12 for 40GBASE-SR4 (8 active fibers) · duplex LC only for SM LR4 optics"],
      ["Hot-swap", "Yes"],
    ],
    use: "40G spine links and data-center trunks.",
    status: "Current",
    tip: "Duplex LC panels can't carry SR4 — parallel optics need the multi-fiber plug.",
  },
  {
    id: "QSFP28",
    kind: "module",
    code: "QSFP28",
    name: "Quad Small Form-factor Pluggable 28",
    tagline: "Four-lane 100 Gbps module — SR4 runs 4 × 25G over an MPO-12 (8 active fibers).",
    specs: [
      ["Speed", "100 Gbps (4 × 25G lanes)"],
      ["Face", "MPO-12 for 100GBASE-SR4 · duplex LC for 100GBASE-LR4 (SM)"],
      ["Hot-swap", "Yes"],
    ],
    use: "100G spine/leaf uplinks in modern data centers.",
    status: "Current",
    tip: "Of the 12 fibers in an MPO-12, SR4 lights 8 (4 Tx + 4 Rx); the rest ride along.",
  },
  // Cords
  {
    id: "LC_CORD",
    kind: "cord",
    code: "LC aqua",
    name: "LC-LC duplex patch cord, OM4 multimode",
    tagline: "Aqua 50 µm laser-optimized multimode cord — pairs with SR optics at 850 nm.",
    specs: [
      ["Connectors", "LC duplex both ends"],
      ["Fiber", "OM4 multimode (aqua), 850 nm"],
      ["Typical reach", "Up to 400 m at 10G (SR)"],
      ["Rule", "Aqua jacket = multimode. Match it to SR modules."],
    ],
    use: "In-row 10G SFP+ uplinks.",
    status: "Current",
    tip: "Never bridge SR multimode optics with a yellow single-mode cord — match media to module.",
  },
  {
    id: "LC_CORD_SM",
    kind: "cord",
    code: "LC yellow",
    name: "LC-LC duplex patch cord, OS2 single-mode",
    tagline: "Yellow 9 µm single-mode cord — pairs with LR optics at 1310 nm.",
    specs: [
      ["Connectors", "LC duplex both ends"],
      ["Fiber", "OS2 single-mode (yellow), 1310/1550 nm"],
      ["Typical reach", "Up to 10 km at 10G (LR)"],
      ["Rule", "Yellow jacket = single-mode. Match it to LR modules."],
    ],
    use: "Cross-campus 10G runs between buildings.",
    status: "Current",
    tip: "An aqua cord on LR optics will not carry a usable signal — media mismatch.",
  },
  {
    id: "MPO_CORD",
    kind: "cord",
    code: "MPO trunk",
    name: "MPO-12 trunk cable, OM4 multimode",
    tagline: "12-fiber aqua trunk with an MPO plug each end — feeds QSFP parallel optics.",
    specs: [
      ["Connectors", "MPO-12 both ends (keyed)"],
      ["Fiber", "OM4 multimode (aqua)"],
      ["Parallel optics", "8 of 12 fibers active for SR4 (4 Tx + 4 Rx)"],
      ["Care", "Inspect + clean ferrule arrays; align the key; check polarity A/B/C"],
    ],
    use: "40G/100G trunks between QSFP+ / QSFP28 ports.",
    status: "Current",
    tip: "If a trunk won't come up after a move: clean, re-seat with the key aligned, re-test.",
  },
];

// ── Bench ports ──────────────────────────────────────────────────────────────

const coaxReject = (portLabel, jack) => ({
  BNC: `${portLabel} is a ${jack} jack — a bayonet coax connector like BNC can't seat in a modular jack.`,
  FTYPE: `${portLabel} is a ${jack} jack — a threaded coax F-type barrel has nothing to screw onto here.`,
});

const PORTS = [
  // Copper service board
  {
    id: "DATA1",
    bay: "copper",
    label: "DATA-1",
    caption: "Office LAN drop — 85 m, 10G workstation",
    accepts: ["RJ45"],
    ghost: "jack8",
    reject: {
      RJ11: "An RJ11 (6P2C) is narrower — it wobbles in an 8P8C data jack and only lands one pair. Data drops need an RJ45.",
      ...coaxReject("DATA-1", "8P8C modular data"),
      SC: "DATA-1 is a copper jack — an SC fiber connector can't terminate twisted pair here.",
      LC: "DATA-1 is a copper jack — an LC fiber connector belongs on optics or a fiber panel.",
      ST: "DATA-1 is a copper jack — an ST bayonet fiber connector doesn't seat in a modular jack.",
      MPO: "DATA-1 is a copper jack — an MPO multi-fiber plug is far too large and optical.",
    },
  },
  {
    id: "VOICE1",
    bay: "copper",
    label: "VOICE-1",
    caption: "Fax / POTS line from the telco demarc",
    accepts: ["RJ11"],
    ghost: "jack6",
    reject: {
      RJ45: "An RJ45 plug is too wide for this 6-position voice jack — and analog POTS lands on RJ11.",
      ...coaxReject("VOICE-1", "voice"),
      SC: "VOICE-1 is a copper voice jack — fiber connectors don't terminate POTS.",
      LC: "VOICE-1 is a copper voice jack — fiber connectors don't terminate POTS.",
      ST: "VOICE-1 is a copper voice jack — fiber connectors don't terminate POTS.",
      MPO: "VOICE-1 is a copper voice jack — an MPO plug can't carry a phone line.",
    },
  },
  {
    id: "CATV1",
    bay: "copper",
    label: "CATV-1",
    caption: "ISP cable-internet drop (DOCSIS, RG-6)",
    accepts: ["FTYPE"],
    ghost: "coaxThread",
    reject: {
      BNC: "Both are coax, but CATV-1 wants the threaded F-type (screw-on), not BNC's quarter-turn bayonet.",
      RJ45: "CATV-1 is a 75 Ω coax fitting — an 8P8C modular plug can't terminate RG-6.",
      RJ11: "CATV-1 is a 75 Ω coax fitting — a telephone plug can't terminate RG-6.",
      SC: "CATV-1 is coax copper — an SC fiber connector can't terminate it.",
      LC: "CATV-1 is coax copper — an LC fiber connector can't terminate it.",
      ST: "CATV-1 is coax copper — an ST fiber connector can't terminate it.",
      MPO: "CATV-1 is coax copper — an MPO plug is a multi-fiber optical interface.",
    },
  },
  {
    id: "CAM1",
    bay: "copper",
    label: "CAM-1",
    caption: "Analog CCTV camera loop to the DVR head-end",
    accepts: ["BNC"],
    ghost: "coaxBayonet",
    reject: {
      FTYPE: "Both are coax, but the camera loop uses BNC's quarter-turn bayonet — an F-type barrel has no bayonet lugs.",
      RJ45: "This analog camera loop is 75 Ω coax — an RJ45 would be for an IP camera on twisted pair.",
      RJ11: "This analog camera loop is 75 Ω coax — a telephone plug can't carry video.",
      SC: "CAM-1 is coax copper — an SC fiber connector can't terminate RG-59.",
      LC: "CAM-1 is coax copper — an LC fiber connector can't terminate RG-59.",
      ST: "CAM-1 is coax copper — an ST fiber connector can't terminate RG-59.",
      MPO: "CAM-1 is coax copper — an MPO plug is a multi-fiber optical interface.",
    },
  },
  // Fiber panel adapter plates
  {
    id: "BBSC",
    bay: "fiber",
    label: "BB-SC",
    caption: "Backbone patch panel — campus ring hand-off",
    accepts: ["SC"],
    ghost: "scAdapter",
    reject: {
      LC: "BB-SC is an SC adapter plate — the LC plug is visibly smaller; it would rattle loose. LC lands on the LC plate or an optic.",
      ST: "Close family, wrong plate: BB-SC takes a square push-pull SC, not ST's round bayonet.",
      MPO: "BB-SC is a simplex/duplex SC plate — an MPO array plug is a different world entirely.",
      RJ45: "This is a fiber adapter plate — copper modular plugs have no place in it.",
      RJ11: "This is a fiber adapter plate — copper modular plugs have no place in it.",
      FTYPE: "This is a fiber adapter plate — coax F-type fittings don't mate with it.",
      BNC: "This is a fiber adapter plate — coax BNC connectors don't mate with it.",
    },
  },
  {
    id: "LEGST",
    bay: "fiber",
    label: "LEG-ST",
    caption: "Legacy ring — 2008 fiber router port",
    accepts: ["ST"],
    ghost: "stAdapter",
    reject: {
      SC: "LEG-ST takes the round bayonet ST — a square SC won't twist-lock here.",
      LC: "LEG-ST takes ST bayonet connectors; the little LC belongs on optics and modern panels.",
      MPO: "LEG-ST is a single ST bayonet port — an MPO array plug doesn't fit.",
      RJ45: "This is a fiber adapter — copper modular plugs don't mate with it.",
      RJ11: "This is a fiber adapter — copper modular plugs don't mate with it.",
      FTYPE: "This is a fiber adapter — coax F-type fittings don't mate with it.",
      BNC: "Twist-lock cousin, wrong plant: LEG-ST is fiber (glass), BNC is coax (copper).",
    },
  },
  {
    id: "UPLKLC",
    bay: "fiber",
    label: "UPLK-LC",
    caption: "High-density LC adapter plate — feeds SFP+ uplink panel port",
    accepts: ["LC"],
    ghost: "lcAdapter",
    reject: {
      SC: "UPLK-LC is the small-form LC plate — a square SC is twice the size and won't latch.",
      ST: "UPLK-LC takes LC trigger-latch plugs — ST's round bayonet won't seat in this plate.",
      MPO: "UPLK-LC is a duplex LC plate — the MPO array goes to its own TRK-MPO plate.",
      RJ45: "This is a fiber adapter plate — copper modular plugs have no place in it.",
      RJ11: "This is a fiber adapter plate — copper modular plugs have no place in it.",
      FTYPE: "This is a fiber adapter plate — coax F-type fittings don't mate with it.",
      BNC: "This is a fiber adapter plate — coax BNC connectors don't mate with it.",
    },
  },
  {
    id: "TRKMPO",
    bay: "fiber",
    label: "TRK-MPO",
    caption: "MPO-12 adapter plate — spine trunk landing",
    accepts: ["MPO"],
    ghost: "mpoAdapter",
    reject: {
      SC: "TRK-MPO takes the wide keyed MPO array — a single-fiber SC won't carry a trunk.",
      LC: "TRK-MPO takes the 12-fiber MPO array — a small LC plug carries only 2 fibers.",
      ST: "TRK-MPO takes the MPO array — ST bayonets are single-fiber legacy connectors.",
      RJ45: "This is a fiber adapter plate — copper modular plugs have no place in it.",
      RJ11: "This is a fiber adapter plate — copper modular plugs have no place in it.",
      FTYPE: "This is a fiber adapter plate — coax F-type fittings don't mate with it.",
      BNC: "This is a fiber adapter plate — coax BNC connectors don't mate with it.",
    },
  },
  // Switch cages
  {
    id: "CAGEA",
    bay: "switch",
    label: "CAGE-A",
    caption: "Switch 1 · SFP+ cage (10G)",
    accepts: ["SFP", "SFPPLUS"],
    ghost: "cageSfp",
    reject: {
      GBIC: "A GBIC is the old, larger form factor — it physically won't enter this SFP+ cage.",
      SFP28: "This cage is rated to 10G. An SFP28 needs a 25G-rated port (simplified rule: match generations).",
      QSFPPLUS: "QSFP+ is a four-lane, double-wide module — it can't enter a single-lane SFP+ cage.",
      QSFP28: "QSFP28 is a four-lane module — it can't enter a single-lane SFP+ cage.",
      SC: "This is a transceiver cage — you seat modules here, then patch them with fiber cords.",
      LC: "This is a transceiver cage. Seat an SFP+ module first; LC plugs land on the module's face afterward.",
      ST: "This is a transceiver cage — seat an SFP-family module first.",
      MPO: "This is a transceiver cage — seat a QSFP-family module; MPO plugs land on its face.",
      RJ45: "This is a transceiver cage — it takes pluggable modules, not bare connectors.",
      RJ11: "This is a transceiver cage — it takes pluggable modules, not bare connectors.",
      FTYPE: "This is a transceiver cage — it takes pluggable modules, not bare connectors.",
      BNC: "This is a transceiver cage — it takes pluggable modules, not bare connectors.",
    },
  },
  {
    id: "CAGEB",
    bay: "switch",
    label: "CAGE-B",
    caption: "Switch 2 · SFP+ cage (10G)",
    accepts: ["SFP", "SFPPLUS"],
    ghost: "cageSfp",
    reject: {
      GBIC: "A GBIC is the old, larger form factor — it physically won't enter this SFP+ cage.",
      SFP28: "This cage is rated to 10G. An SFP28 needs a 25G-rated port (simplified rule: match generations).",
      QSFPPLUS: "QSFP+ is a four-lane, double-wide module — it can't enter a single-lane SFP+ cage.",
      QSFP28: "QSFP28 is a four-lane module — it can't enter a single-lane SFP+ cage.",
      SC: "This is a transceiver cage — you seat modules here, then patch them with fiber cords.",
      LC: "This is a transceiver cage. Seat an SFP+ module first; LC plugs land on the module's face afterward.",
      ST: "This is a transceiver cage — seat an SFP-family module first.",
      MPO: "This is a transceiver cage — seat a QSFP-family module; MPO plugs land on its face.",
      RJ45: "This is a transceiver cage — it takes pluggable modules, not bare connectors.",
      RJ11: "This is a transceiver cage — it takes pluggable modules, not bare connectors.",
      FTYPE: "This is a transceiver cage — it takes pluggable modules, not bare connectors.",
      BNC: "This is a transceiver cage — it takes pluggable modules, not bare connectors.",
    },
  },
  {
    id: "CAGEQ",
    bay: "switch",
    label: "CAGE-Q",
    caption: "Switch core · QSFP28 cage (100G)",
    accepts: ["QSFPPLUS", "QSFP28"],
    ghost: "cageQsfp",
    reject: {
      SFP: "An SFP is a single-lane module — this four-lane QSFP cage won't hold it.",
      SFPPLUS: "An SFP+ is single-lane — this four-lane QSFP28 cage takes QSFP-family modules.",
      SFP28: "An SFP28 is single-lane — this cage takes QSFP-family modules.",
      GBIC: "A GBIC won't come within a mile of this cage — wrong decade and wrong size.",
      SC: "This is a transceiver cage — seat a QSFP-family module first.",
      LC: "This is a transceiver cage — seat a QSFP-family module first; its face takes MPO or LC.",
      ST: "This is a transceiver cage — seat a QSFP-family module first.",
      MPO: "Seat the QSFP module first — then the MPO trunk lands on the module's face.",
      RJ45: "This is a transceiver cage — it takes pluggable modules, not bare connectors.",
      RJ11: "This is a transceiver cage — it takes pluggable modules, not bare connectors.",
      FTYPE: "This is a transceiver cage — it takes pluggable modules, not bare connectors.",
      BNC: "This is a transceiver cage — it takes pluggable modules, not bare connectors.",
    },
  },
];

// ── Link computation (VERIFY LINKS button) ───────────────────────────────────

function computeLinks(s) {
  const links = {};
  const a = s.seated["CAGEA"];
  const b = s.seated["CAGEB"];
  const corded = s.lcCordA !== null && s.lcCordB !== null;
  if (a === "SFPPLUS" && b === "SFPPLUS" && corded && s.lcCordKind === "LC_CORD") {
    links["10G-A↔B"] = { state: "up", detail: "10G up — SFP+ pair on OM4 aqua LC cord. LEDs green." };
  } else if (a === "SFPPLUS" && b === "SFPPLUS" && corded && s.lcCordKind === "LC_CORD_SM") {
    links["10G-A↔B"] = {
      state: "down",
      detail: "Down — single-mode yellow cord on SR multimode optics: media mismatch, almost no light couples.",
    };
  } else {
    links["10G-A↔B"] = { state: "down", detail: "Down — link incomplete (modules + LC cord both ends)." };
  }
  const q = s.seated["CAGEQ"];
  if (q === "QSFP28" && s.mpoTrunk) {
    links["100G-Q"] = { state: "up", detail: "100G up — QSFP28 SR4 on the MPO-12 OM4 trunk (8 active fibers)." };
  } else if (q === "QSFPPLUS" && s.mpoTrunk) {
    links["100G-Q"] = { state: "up", detail: "40G up — QSFP+ SR4 on the MPO-12 trunk. (A QSFP28 module would push 100G.)" };
  } else {
    links["100G-Q"] = { state: "down", detail: "Down — seat a QSFP-family module, then land the MPO trunk." };
  }
  return links;
}

// ── Site manual (C2) and foreman's debrief (C6) content ──────────────────────

const GLOSSARY = [
  { id: "ferrule", term: "Ferrule", def: "The precision ceramic or metal tube inside a fiber connector that aligns and holds the polished fiber end." },
  { id: "duplex", term: "Duplex", def: "Two connectors joined as one assembly (Tx + Rx), clipped back-to-back — e.g., LC duplex." },
  { id: "simplex", term: "Simplex", def: "A single-fiber connector or cord — one Tx or one Rx path per plug." },
  { id: "upc", term: "UPC", def: "Ultra Physical Contact — 0° ferrule polish, blue body on single-mode; mates only to UPC." },
  { id: "apc", term: "APC", def: "Angled Physical Contact — 8° ferrule polish, green body; never mate APC to UPC (air gap = loss and reflection)." },
  { id: "8p8c", term: "8P8C", def: "8-position, 8-contact modular interface — what an \u201cRJ45\u201d Ethernet plug actually keys into." },
  { id: "pots", term: "POTS", def: "Plain Old Telephone Service — the analog phone line that lands on RJ11." },
  { id: "docsis", term: "DOCSIS", def: "The cable-internet standard ISPs deliver over 75 Ω coax with F-type fittings." },
  { id: "10base2", term: "10BASE-2", def: "Legacy 10 Mbps Ethernet on thin coax (RG-58) with BNC T-connectors — \u201cthinnet\u201d." },
  { id: "hotswap", term: "Hot-swappable", def: "A module (the SFP family) designed to be inserted or removed while the switch is powered." },
  { id: "polarity", term: "MPO polarity (A/B/C)", def: "The Tx↔Rx pairing convention across an MPO trunk so one end's transmit lands on the other's receive." },
  { id: "om3om4", term: "OM3 / OM4", def: "Laser-optimized multimode fiber, aqua jacket, 850 nm — the media for SR optics." },
  { id: "os2", term: "OS2", def: "Single-mode fiber, 9 µm core, yellow jacket, 1310/1550 nm — the media for LR optics and long runs." },
  { id: "patchpanel", term: "Patch panel", def: "Passive termination frame where permanent backbone cabling meets patch cords via adapter plates." },
  { id: "transceiver", term: "Transceiver", def: "Pluggable module that converts a port's electrical signals to a media's light (fiber) — SFP family." },
];

const MANUAL = [
  {
    id: "objective",
    title: "What objective 1.7 asks of you",
    body: [
      "CompTIA Network+ N10-009, Domain 1 (Networking Concepts), objective 1.7: \u201cTransceivers and connectors: SC, LC, ST, MPO, RJ11, RJ45, F-type, BNC.\u201d You must be able to identify each by sight, name its full name and mechanics, and choose the right one for a described service.",
      "The objective has two halves. Connectors terminate a medium — glass or copper — at a panel, a wall plate or an optic's face. Transceivers are the pluggable modules (GBIC, SFP, SFP+, SFP28, QSFP+, QSFP28) that let one switch speak fiber, copper, at 1G to 100G, by swapping a cartridge.",
      "Everything here lives at OSI Layer 1, the physical signal chain: NIC → transceiver → patch cord → panel → backbone → far-end transceiver. A wrong piece anywhere in that chain breaks every layer above it — which is why this objective is a troubleshooting superpower.",
    ],
  },
  {
    id: "mechanics",
    title: "Read a connector like a tech",
    body: [
      "Ask three questions. 1 — What does it carry? Fiber connectors hold one (or twelve) polished glass ends; copper connectors land metal conductors: twisted pair (RJ45/RJ11) or coax (F-type/BNC). 2 — How does it latch? Push-pull (SC), trigger (LC), bayonet twist (ST, BNC), threads (F-type), snap-in tab (RJ45/RJ11), keyed push-pull (MPO). 3 — How big is the business end? Ferrules: 2.5 mm (SC, ST), 1.25 mm (LC); MPO replaces the single ferrule with a 12-fiber array.",
      "Colors are content, not decoration: yellow jacket = OS2 single-mode; aqua = OM3/OM4 multimode; lime = OM5; orange = OM1/OM2 legacy. Connector bodies: blue = SM UPC, green = SM APC (8° polish — never mate to UPC), beige = multimode.",
      "Simplified for training: real cages vary in multirate support and vendor lock-ins exist. The bench enforces the exam-level rule — modules match their generation's cage.",
    ],
  },
  {
    id: "family",
    title: "The pluggable family tree",
    body: [
      "GBIC (1G, SC face) — the 1990s original. SFP, the \u201cmini-GBIC\u201d (1G, LC face), shrank it. SFP+ kept the footprint and reached 10G. SFP28 pushed a single lane to 25G. Then the module went wide: QSFP+ puts four 10G lanes side by side (40G), QSFP28 four 25G lanes (100G) — both presenting MPO-12 faces for SR4 parallel optics (8 active fibers: 4 Tx + 4 Rx).",
      "Media matching is the perennial trap: SR optics are multimode at 850 nm and want aqua OM3/OM4; LR optics are single-mode at 1310 nm and want yellow OS2. A yellow cord on SR optics — or aqua on LR — produces a dead or wildly lossy link. Distance ratings matter too: 10GBASE-T needs cat6a for a full 100 m channel; cat6 only carries 10G roughly 45–55 m.",
      "Adjacent concepts you'll meet in the field (beyond this objective's list): twinax DAC cables with fixed SFP+ plugs for in-row links, AOC assemblies, and QSFP-DD for 400G.",
    ],
  },
  {
    id: "care",
    title: "Install & care discipline",
    body: [
      "Fiber rule zero: inspect and clean before EVERY mating. A single dust speck on an MPO array can spoil all 12 fibers. Use a scope and one-click cleaners; never wipe with clothing; never transmit power through contamination.",
      "Respect the key: MPO plugs are keyed so polarity (Tx↔Rx) lands correctly — a forced, rotated key dead-ends the trunk. Respect the bend radius: glass kinks long before it visibly breaks. UPC to UPC, APC to APC — never mixed.",
      "Verify like a pro: link LEDs for a first look, a light source/power meter for loss, a wire mapper for copper pairs, a certifier for bandwidth sign-off, an OTDR to locate fiber faults. Document every run — labels at both ends.",
    ],
  },
];

const DEBRIEF_MATRIX = [
  { part: "SC", full: "Subscriber Connector", medium: "Fiber", latch: "Push-pull tab", end: "2.5 mm ferrule", use: "Backbone panels, GBIC optics" },
  { part: "LC", full: "Lucent Connector", medium: "Fiber", latch: "Trigger latch", end: "1.25 mm ferrule", use: "SFP/SFP+ optics, high density" },
  { part: "ST", full: "Straight Tip", medium: "Fiber", latch: "Bayonet twist", end: "2.5 mm ferrule", use: "Legacy campus rings" },
  { part: "MPO", full: "Multi-fiber Push-On", medium: "Fiber ×12", latch: "Keyed push-pull", end: "12-fiber array", use: "40/100G SR4 trunks" },
  { part: "RJ45", full: "8P8C modular", medium: "Twisted pair", latch: "Snap-in tab", end: "8 contacts", use: "Ethernet LAN, PoE" },
  { part: "RJ11", full: "6P2C modular", medium: "Twisted pair", latch: "Snap-in tab", end: "2 contacts used", use: "POTS, DSL, fax" },
  { part: "F-type", full: "F-type threaded", medium: "Coax 75 Ω", latch: "Screw thread", end: "Center pin", use: "CATV, DOCSIS, antennas" },
  { part: "BNC", full: "Bayonet Neill–Concelman", medium: "Coax 50/75 Ω", latch: "Quarter-turn bayonet", end: "Center pin", use: "10BASE-2, CCTV, test gear" },
];

const TROUBLESHOOT_LADDER = [
  "Link down? Check seating first — half-latched connectors are the #1 field fault.",
  "Confirm form factor: does the connector physically match the port (SC vs LC cage, RJ11 vs 8P8C)?",
  "Match media to module: aqua OM3/OM4 ↔ SR (multimode); yellow OS2 ↔ LR (single-mode).",
  "Check polish pairing: UPC to UPC (blue), APC to APC (green) — never mixed.",
  "For MPO: verify the key orientation and polarity method, then re-seat.",
  "Inspect and clean every fiber end, then re-test. Contamination is the #2 field fault.",
  "Measure: link LEDs → light meter/power meter → certifier → OTDR to localize.",
  "Still down? Swap one variable at a time (cord, then module) and document each result.",
];

const SELECTION_CHEATS = [
  "Highest fiber density / SFP+ patch field → LC.",
  "Campus backbone panels and GBIC-era gear → SC.",
  "Legacy ring or 2000s routers → ST (repair only — don't build new).",
  "40G/100G/400G parallel trunks → MPO-12 (MPO-24+ for growth).",
  "Any copper LAN drop ≤ 100 m → RJ45 (cat6a for 10G).",
  "Analog phone / fax / DSL → RJ11.",
  "Cable TV, DOCSIS internet, antennas → F-type on RG-6.",
  "Analog CCTV and coax test benches → BNC.",
];

const TAKEAWAYS = [
  {
    title: "Installer's takeaways (defender's habits)",
    points: [
      "Selection discipline: connector follows medium, medium follows service and distance — never the reverse.",
      "Clean-first culture: inspect and clean before every fiber mating; it's cheaper than any outage.",
      "Label and certify every link the day it's made; future-you is the customer.",
      "Respect mechanics: keyways, bend radius, torque limits — physics doesn't negotiate.",
    ],
  },
  {
    title: "Field-awareness takeaways (security mindset)",
    points: [
      "Unattended comms rooms are Layer-1 attack surface: anyone with closet access can unplug, mirror or swap a link in seconds.",
      "Audit physical ports as part of security reviews: unknown media converters or rogue patch cords are classic pivots.",
      "Lock the closet, log the visits, and photograph panel states after every authorized change.",
      "Label discipline doubles as detection: an unlabeled cord in a labeled plant is an anomaly worth chasing.",
    ],
  },
];

const NEXT_STEPS = [
  "Next objective in Domain 1: transmission media and their properties — coax vs twisted pair vs fiber categories, plenum, and the 568A/B termination standards that put these connectors to work.",
  "Then: Ethernet standards (100BASE-TX through 10GBASE-T, 40/100GBASE-SR4/LR4) to see exactly which speeds ride which connector.",
  "Practice with real hardware photos or a physical connector kit — shape recognition is a tested skill.",
  "Official reference: CompTIA N10-009 exam objectives (comptia.org) — keep the domain list open while you drill.",
];

const BAY_STYLES = {
  copper: { title: "SERVICE BOARD — COPPER", sub: "Twisted pair & coax services" },
  fiber: { title: "FIBER PANEL — ADAPTER PLATES", sub: "Glass lands here" },
  switch: { title: "SWITCH 1 — UPLINK CAGES", sub: "Hot-pluggable transceivers" },
};

// Lookups (same shape as the original's PART_BY_ID / PORT_BY_ID)
const PART_BY_ID = Object.fromEntries(PARTS.map((p) => [p.id, p]));
const PORT_BY_ID = Object.fromEntries(PORTS.map((p) => [p.id, p]));

// Expose to the rest of the classic scripts (load order: data → objectives → quiz → state → ui → app)
window.LAB = {
  PARTS,
  PORTS,
  PART_BY_ID,
  PORT_BY_ID,
  computeLinks,
  GLOSSARY,
  MANUAL,
  DEBRIEF_MATRIX,
  TROUBLESHOOT_LADDER,
  SELECTION_CHEATS,
  TAKEAWAYS,
  NEXT_STEPS,
  BAY_STYLES,
};
