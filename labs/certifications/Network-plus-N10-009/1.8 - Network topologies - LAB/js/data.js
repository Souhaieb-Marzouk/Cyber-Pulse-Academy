/* ============================================================================
   The Blueprint Room — js/data.js
   ALL lab content: field guide, glossary, handover notes, site drawings,
   evidence files, annex part slots. Content is transcribed 1:1 from the
   original lab source (content.ts + sites.ts). No logic lives here.
   All client data is SYNTHETIC TRAINING DATA — fictional client/devices.
   ============================================================================ */

"use strict";

/** Global content namespace. */
window.LAB_DATA = (function () {

  const SYNTHETIC = "SYNTHETIC TRAINING DATA — fictional client, devices and tickets.";

  /* ------------------------------ Field Guide ----------------------------- */

  const GUIDE = [
    {
      id: "mesh",
      name: "Mesh (full / partial)",
      tagline: "Direct interconnection for maximum fault tolerance",
      how: "In a FULL mesh every node links to every other node — n(n−1)/2 links (5 nodes = 10, 8 sites = 28). A PARTIAL mesh connects only the pairs that need direct redundancy.",
      pros: ["Best fault tolerance — many alternate paths", "No central bottleneck or SPOF", "Link failures reroute instantly (on a well-designed partial mesh)"],
      cons: ["Link count and cost grow quadratically", "Hard to manage as nodes increase", "Rarely affordable as a true full mesh beyond small node counts"],
      where: "Metro/WAN backbones, backup links between critical sites, some industrial/wireless meshes (generalized industry practice).",
      tip: "Compute n(n−1)/2 cold: 5→10, 6→15, 8→28. The exam loves the math and the full-vs-partial distinction.",
      accent: "#22D3EE",
    },
    {
      id: "hybrid",
      name: "Hybrid",
      tagline: "Two or more topologies combined — what real networks are",
      how: "Any composition of topology types: stars hanging off a mesh core, a three-tier campus with point-to-point WAN circuits, a ring stitched to a spine-and-leaf DC.",
      pros: ["Match the pattern to each zone's needs", "Scales across large, mixed environments", "Lets cheap star LANs ride resilient mesh WANs"],
      cons: ["Documentation and troubleshooting complexity", "Failure domains can blur at the seams between patterns"],
      where: "Practically every enterprise at campus scale (generalized industry practice).",
      tip: "The skill tested is DECOMPOSITION: label each zone of a drawing with its pattern, then name the combination hybrid.",
      accent: "#A78BFA",
    },
    {
      id: "star",
      name: "Star / hub-and-spoke",
      tagline: "One center, every endpoint a spoke",
      how: "All nodes connect to a central device (switch today) and to nothing else. Adding a node = one cable to the center.",
      pros: ["Simplest to wire, manage and expand", "One cable failure affects one node", "Most common LAN topology by far"],
      cons: ["The center is a single point of failure", "Center capacity bounds the whole LAN"],
      where: "Office LANs, branch stores, classrooms (generalized industry practice).",
      tip: "Exam trap: 'hub and spoke' ≠ a literal hub. A hub is a legacy repeater that floods bits to every port; modern stars center on SWITCHES. Also note N10-009 dropped bus/ring — don't answer them.",
      accent: "#F59E0B",
    },
    {
      id: "spine-leaf",
      name: "Spine-and-leaf",
      tagline: "The two-stage data-center fabric",
      how: "Leaf switches attach servers; spine switches attach leaves only. EVERY leaf connects to EVERY spine; servers never attach to spines. Any server-to-server path is leaf → spine → leaf — two fabric stages (Clos-based, simplified).",
      pros: ["Uniform, predictable low latency anywhere in the pod", "Scales horizontally: add spines or leaves", "Built-in spine redundancy per leaf"],
      cons: ["Fabric-specific hardware/design discipline", "North-south border needs dedicated gateway/border leaves", "Overkill outside DC-scale east-west workloads"],
      where: "Modern data centers and cloud pods running virtualization and east-west-heavy workloads (generalized industry practice).",
      tip: "Fingerprint: exactly 2 tiers, servers only on leaves, every leaf ↔ every spine, same hop count for any server pair.",
      accent: "#34D399",
    },
    {
      id: "p2p",
      name: "Point-to-point",
      tagline: "Exactly two endpoints, one dedicated link",
      how: "A single dedicated circuit joins two devices/sites — leased line, private fiber, direct backhaul. No intermediaries touch the traffic.",
      pros: ["Dedicated, guaranteed bandwidth", "Private and simple to reason about", "Predictable latency"],
      cons: ["The link itself is a SPOF", "No fan-out — one more site needs one more link", "Costly per covered distance vs shared networks"],
      where: "WAN leased circuits, building-to-building fiber, site-to-site backhaul (generalized industry practice).",
      tip: "Distinguish from a VPN over the internet: a VPN rides shared public infrastructure — it's an overlay, not a private point-to-point circuit.",
      accent: "#F472B6",
    },
    {
      id: "three-tier",
      name: "Three-tier (core / distribution / access)",
      tagline: "The hierarchical campus classic",
      how: "ACCESS attaches endpoints; DISTRIBUTION aggregates access groups and enforces policy/routing between them; CORE interconnects distribution blocks and the WAN at high speed.",
      pros: ["Scales cleanly campus-wide", "Clear failure domains per layer/building", "Policy enforcement naturally lives at distribution"],
      cons: ["More devices, cabling and cost", "Single-homed access uplinks concentrate risk at distribution", "Extra hop between access groups for east-west flows"],
      where: "Large campuses and enterprise HQ networks (generalized industry practice).",
      tip: "Diagnose by symptoms: one building dark + internal traffic OK ⇒ distribution layer. Redundant cores fail gracefully — test it.",
      accent: "#38BDF8",
    },
    {
      id: "collapsed-core",
      name: "Collapsed core (two-tier)",
      tagline: "Core + distribution merged into one tier",
      how: "For sites too small to justify full three-tier, the core and distribution layers merge into a single collapsed-core tier; access remains below it.",
      pros: ["Fewer devices, less cabling, cheaper", "Simpler to operate", "Still layer-clean if built with a redundant pair"],
      cons: ["Less scaling headroom than full three-tier", "Merged tier concentrates policy + backbone duties"],
      where: "Small/medium business sites, branch HQs, single buildings (generalized industry practice).",
      tip: "Exam answers: merges CORE + DISTRIBUTION; layers remaining = 2; access layer is NOT removed.",
      accent: "#FB923C",
    },
  ];

  const TRAFFIC_NOTE = {
    eastWest: "EAST-WEST = node-to-node traffic INSIDE a site (server↔server, PC↔PC). Spine-and-leaf is built for it.",
    northSouth: "NORTH-SOUTH = traffic entering/leaving the site (client↔data center, WAN uplinks). Three-tier campuses and border gateways are built for it.",
  };

  const GLOSSARY = [
    { term: "Topology", def: "The physical or logical arrangement of nodes and links in a network." },
    { term: "Node", def: "Any device on the network — switch, router, host, or whole site." },
    { term: "Link", def: "A connection (cable or circuit) between two nodes." },
    { term: "Degree", def: "The number of links attached to one node (a leaf with 2 spine uplinks + 2 servers = degree 4)." },
    { term: "Full mesh", def: "Every node connects directly to every other node: n(n−1)/2 links." },
    { term: "Partial mesh", def: "Only selected node pairs connect directly — targeted redundancy at fraction of the cost." },
    { term: "Star / hub-and-spoke", def: "All nodes connect to one central device; spokes never interconnect." },
    { term: "Spine", def: "A DC fabric switch that interconnects leaves only — servers never attach to it." },
    { term: "Leaf", def: "A DC fabric switch that attaches servers and uplinks to every spine." },
    { term: "Collapsed core", def: "A two-tier design merging the core and distribution layers into one." },
    { term: "Point-to-point link", def: "A dedicated connection between exactly two devices — no intermediaries." },
    { term: "Hybrid topology", def: "A network combining two or more topology types." },
    { term: "East-west traffic", def: "Server-to-server / node-to-node traffic inside the same site or fabric." },
    { term: "North-south traffic", def: "Traffic entering or leaving the site (client↔DC, WAN)." },
    { term: "SPOF", def: "Single point of failure — any one component whose loss takes service down." },
  ];

  const HANDOVER = {
    diagnose: [
      { what: "One device unreachable + many endpoints orphaned", reads: "star SPOF — the center died; check monitoring for WHICH device", source: "SHT-01" },
      { what: "Whole building isolated, internal traffic fine, other buildings fine", reads: "distribution-layer failure in a three-tier campus", source: "SHT-02" },
      { what: "Traceroutes always cross the same number of fabric stages between any servers", reads: "spine-and-leaf — uniform 2-stage fabric", source: "SHT-03" },
      { what: "A site with a single link (degree 1)", reads: "partial-mesh gap — one cut isolates it; add a second link", source: "SHT-04" },
      { what: "Exactly two endpoints on a private circuit", reads: "point-to-point — dedicated bandwidth, but the link is a SPOF", source: "SHT-05" },
      { what: "Mixed patterns in one drawing (stars + mesh + circuits)", reads: "hybrid — label zones, don't force one label", source: "SHT-06" },
      { what: "One switch doing aggregation AND backbone duty for a small site", reads: "collapsed core (two-tier)", source: "SHT-07" },
    ],
    actions: [
      { id: "R-01", text: "Dual-home access→distribution uplinks (HQ) — kills the 4-endpoint DIST-2 SPOF class" },
      { id: "R-02", text: "Keep ≥2 spines and every-leaf-every-spine wiring in the DC pod (already built: verify on change)" },
      { id: "R-03", text: "Collapsed core for the annex (cost) — with a redundant pair if uptime targets rise" },
      { id: "R-04", text: "Bring WH-6 into the metro partial mesh with 2 links; validate every single-link cut before rollout" },
      { id: "R-05", text: "Match topology to traffic: east-west pods → spine-and-leaf; north-south campuses → three-tier/collapsed core" },
      { id: "R-06", text: "Price designs before promoting them: n(n−1)/2 × monthly circuit cost vs budget ceiling" },
      { id: "R-07", text: "Verify by failure simulation (this lab's rig) BEFORE change windows, not after incidents" },
      { id: "R-08", text: "Replace legacy hubs with switches — same star shape, intelligent forwarding" },
    ],
    exam: [
      "Know all seven N10-009 topologies cold: mesh, hybrid, star/hub-and-spoke, spine-and-leaf, point-to-point, three-tier, collapsed core (Domain 1.0, Networking Concepts, 23%).",
      "Full-mesh math: n(n−1)/2 — compute it, don't count it.",
      "Star's SPOF is the center; hub = legacy repeater trap.",
      "Spine-and-leaf: servers on leaves only; every leaf ↔ every spine; uniform latency = east-west story.",
      "Three-tier layer roles and the 'one building dark' distribution diagnosis.",
      "Collapsed core merges core+distribution; two layers remain; access never disappears.",
      "Scenario items are decomposition tests: label zones, then name the hybrid.",
    ],
    attacker: [
      "An attacker maps your topology first: stars advertise a one-device kill shot; single-homed uplinks advertise building kill shots.",
      "Degree-1 nodes (like WH-6 before your fix) are trivial denial-of-service targets — one cut, one casualty.",
      "Predictable fabrics cut both ways: uniform latency helps defenders spot anomalies too (path changes become signals).",
    ],
    nextSteps: [
      "N10-009 Domain 1.0 continues: network types, cloud concepts, IP addressing — revisit lesson numbering in your study plan.",
      "Practice decomposition on real network diagrams (draw.io/Visio exports) until hybrid labeling is automatic.",
      "Study traffic engineering next: VLANs and STP live inside these shapes (Domain 2.0, Network Implementation 20%).",
    ],
  };

  const LINKS = [
    { label: "CompTIA Network+ (N10-009) certification page", url: "https://www.comptia.org/en-us/certifications/network" },
    { label: "CompTIA Network+ N10-009 exam objectives (PDF)", url: "https://www.comptia.org/training/by-certification/network/network-n10-009" },
  ];

  /* ----------------------------- Site drawings ----------------------------- */
  /* Transcribed 1:1 from sites.ts (Trellis Foods — fictional).               */

  /* Branch */
  const branchNodes = [
    { id: "br-wan", label: "HQ / WAN", kind: "cloud", x: 400, y: 48, note: "Uplink anchor — the rest of the Trellis network." },
    { id: "sw-b1", label: "SW-B1", kind: "switch", x: 400, y: 196, model: "TS-24G access switch", note: "The branch's only switch. Every endpoint hangs off it — hub was replaced with this switch in 2019." },
    { id: "pos-1", label: "POS-1", kind: "host", isHost: true, x: 172, y: 112 },
    { id: "pos-2", label: "POS-2", kind: "host", isHost: true, x: 172, y: 276 },
    { id: "pos-3", label: "POS-3", kind: "host", isHost: true, x: 250, y: 380 },
    { id: "pc-1", label: "PC-1", kind: "host", isHost: true, x: 400, y: 380 },
    { id: "prn-1", label: "PRN-1", kind: "host", isHost: true, x: 550, y: 380 },
    { id: "ap-1", label: "AP-1", kind: "host", isHost: true, x: 628, y: 276 },
    { id: "cam-1", label: "CAM-1", kind: "host", isHost: true, x: 628, y: 112 },
  ];
  const branchEdges = [
    { id: "e-br-up", a: "sw-b1", b: "br-wan", media: "fiber", bw: "1 Gbps", note: "Branch uplink to HQ." },
    { id: "e-b1", a: "sw-b1", b: "pos-1", media: "copper", bw: "1 Gbps" },
    { id: "e-b2", a: "sw-b1", b: "pos-2", media: "copper", bw: "1 Gbps" },
    { id: "e-b3", a: "sw-b1", b: "pos-3", media: "copper", bw: "1 Gbps" },
    { id: "e-b4", a: "sw-b1", b: "pc-1", media: "copper", bw: "1 Gbps" },
    { id: "e-b5", a: "sw-b1", b: "prn-1", media: "copper", bw: "1 Gbps" },
    { id: "e-b6", a: "sw-b1", b: "ap-1", media: "copper", bw: "1 Gbps" },
    { id: "e-b7", a: "sw-b1", b: "cam-1", media: "copper", bw: "100 Mbps" },
  ];

  /* HQ */
  const hqNodes = [
    { id: "hq-wan", label: "WAN", kind: "cloud", x: 450, y: 40, note: "Uplink anchor — internet + other sites." },
    { id: "core-a", label: "CORE-A", kind: "router", layer: "core", x: 300, y: 122, model: "CX-9600", note: "Core layer — high-speed backbone between layers and to the WAN." },
    { id: "core-b", label: "CORE-B", kind: "router", layer: "core", x: 600, y: 122, model: "CX-9600", note: "Second core for redundancy." },
    { id: "dist-1", label: "DIST-1", kind: "switch", layer: "distribution", x: 150, y: 244, model: "CX-6400", note: "Distribution layer — aggregates Building A access switches, applies policy." },
    { id: "dist-2", label: "DIST-2", kind: "switch", layer: "distribution", x: 450, y: 244, model: "CX-6400", note: "Distribution layer — aggregates Building B access switches, applies policy." },
    { id: "dist-3", label: "DIST-3", kind: "switch", layer: "distribution", x: 750, y: 244, model: "CX-6400", note: "Distribution layer — aggregates Building C access switches, applies policy." },
    { id: "acc-1a", label: "ACC-1A", kind: "switch", layer: "access", x: 80, y: 352, note: "Access layer — endpoint connections. Single-homed to DIST-1." },
    { id: "acc-1b", label: "ACC-1B", kind: "switch", layer: "access", x: 220, y: 352, note: "Access layer — endpoint connections. Single-homed to DIST-1." },
    { id: "acc-2a", label: "ACC-2A", kind: "switch", layer: "access", x: 380, y: 352, note: "Access layer — endpoint connections. Single-homed to DIST-2." },
    { id: "acc-2b", label: "ACC-2B", kind: "switch", layer: "access", x: 520, y: 352, note: "Access layer — endpoint connections. Single-homed to DIST-2." },
    { id: "acc-3a", label: "ACC-3A", kind: "switch", layer: "access", x: 680, y: 352, note: "Access layer — endpoint connections. Single-homed to DIST-3." },
    { id: "acc-3b", label: "ACC-3B", kind: "switch", layer: "access", x: 820, y: 352, note: "Access layer — endpoint connections. Single-homed to DIST-3." },
  ];
  const hostCoords = [40, 120, 180, 260, 320, 420, 480, 560, 640, 720, 780, 860];
  const hostNames = ["PC-1A1", "PC-1A2", "PC-1B1", "PC-1B2", "PC-2A1", "PC-2A2", "PC-2B1", "PC-2B2", "PC-3A1", "PC-3A2", "PC-3B1", "PC-3B2"];
  const hostAccess = ["acc-1a", "acc-1a", "acc-1b", "acc-1b", "acc-2a", "acc-2a", "acc-2b", "acc-2b", "acc-3a", "acc-3a", "acc-3b", "acc-3b"];
  hostNames.forEach(function (n, i) {
    hqNodes.push({ id: n.toLowerCase(), label: n, kind: "host", isHost: true, x: hostCoords[i], y: 468 });
  });
  const hqEdges = [
    { id: "e-hq-wa", a: "core-a", b: "hq-wan", media: "wan", bw: "10 Gbps", note: "WAN uplink via CORE-A." },
    { id: "e-hq-wb", a: "core-b", b: "hq-wan", media: "wan", bw: "10 Gbps", note: "WAN uplink via CORE-B." },
    { id: "e-hq-ab", a: "core-a", b: "core-b", media: "fiber", bw: "40 Gbps", note: "Core interconnect." },
    { id: "e-hq-d1a", a: "dist-1", b: "core-a", media: "fiber", bw: "20 Gbps" },
    { id: "e-hq-d1b", a: "dist-1", b: "core-b", media: "fiber", bw: "20 Gbps" },
    { id: "e-hq-d2a", a: "dist-2", b: "core-a", media: "fiber", bw: "20 Gbps" },
    { id: "e-hq-d2b", a: "dist-2", b: "core-b", media: "fiber", bw: "20 Gbps" },
    { id: "e-hq-d3a", a: "dist-3", b: "core-a", media: "fiber", bw: "20 Gbps" },
    { id: "e-hq-d3b", a: "dist-3", b: "core-b", media: "fiber", bw: "20 Gbps" },
    { id: "e-hq-1aa", a: "acc-1a", b: "dist-1", media: "fiber", bw: "10 Gbps", note: "Single-homed uplink — no second path." },
    { id: "e-hq-1ba", a: "acc-1b", b: "dist-1", media: "fiber", bw: "10 Gbps", note: "Single-homed uplink — no second path." },
    { id: "e-hq-2aa", a: "acc-2a", b: "dist-2", media: "fiber", bw: "10 Gbps", note: "Single-homed uplink — no second path." },
    { id: "e-hq-2ba", a: "acc-2b", b: "dist-2", media: "fiber", bw: "10 Gbps", note: "Single-homed uplink — no second path." },
    { id: "e-hq-3aa", a: "acc-3a", b: "dist-3", media: "fiber", bw: "10 Gbps", note: "Single-homed uplink — no second path." },
    { id: "e-hq-3ba", a: "acc-3b", b: "dist-3", media: "fiber", bw: "10 Gbps", note: "Single-homed uplink — no second path." },
  ];
  hostAccess.forEach(function (acc, i) {
    hqEdges.push({ id: "e-hq-h" + (i + 1), a: hostNames[i].toLowerCase(), b: acc, media: "copper", bw: "1 Gbps" });
  });

  /* DC */
  const dcNodes = [
    { id: "dc-gw", label: "DC-GW", kind: "router", x: 450, y: 44, model: "border gateway", note: "Fabric border — anchor to the rest of the network." },
    { id: "sp-1", label: "SP-1", kind: "spine", layer: "spine", x: 320, y: 142, model: "DC-SPINE", note: "Spine — interconnects leaves only. No servers attach here." },
    { id: "sp-2", label: "SP-2", kind: "spine", layer: "spine", x: 580, y: 142, model: "DC-SPINE", note: "Spine — interconnects leaves only. No servers attach here." },
    { id: "lf-1", label: "LF-1", kind: "leaf", layer: "leaf", x: 130, y: 276, model: "DC-LEAF", note: "Leaf — attaches servers; connects to EVERY spine." },
    { id: "lf-2", label: "LF-2", kind: "leaf", layer: "leaf", x: 330, y: 276, model: "DC-LEAF", note: "Leaf — attaches servers; connects to EVERY spine." },
    { id: "lf-3", label: "LF-3", kind: "leaf", layer: "leaf", x: 570, y: 276, model: "DC-LEAF", note: "Leaf — attaches servers; connects to EVERY spine." },
    { id: "lf-4", label: "LF-4", kind: "leaf", layer: "leaf", x: 770, y: 276, model: "DC-LEAF", note: "Leaf — attaches servers; connects to EVERY spine." },
  ];
  const vmDefs = [
    ["VM-A1", "lf-1", 80], ["VM-A2", "lf-1", 180], ["VM-B1", "lf-2", 280], ["VM-B2", "lf-2", 380],
    ["VM-C1", "lf-3", 520], ["VM-C2", "lf-3", 620], ["VM-D1", "lf-4", 720], ["VM-D2", "lf-4", 820],
  ];
  vmDefs.forEach(function (def) {
    dcNodes.push({ id: def[0].toLowerCase(), label: def[0], kind: "host", isHost: true, x: def[2], y: 404 });
  });
  const dcEdges = [
    { id: "e-dc-g1", a: "dc-gw", b: "sp-1", media: "fiber", bw: "100 Gbps" },
    { id: "e-dc-g2", a: "dc-gw", b: "sp-2", media: "fiber", bw: "100 Gbps" },
  ];
  ["lf-1", "lf-2", "lf-3", "lf-4"].forEach(function (lf) {
    dcEdges.push({ id: "e-dc-" + lf + "1", a: lf, b: "sp-1", media: "fiber", bw: "40 Gbps" });
    dcEdges.push({ id: "e-dc-" + lf + "2", a: lf, b: "sp-2", media: "fiber", bw: "40 Gbps" });
  });
  vmDefs.forEach(function (def) {
    dcEdges.push({ id: "e-dc-" + def[0].toLowerCase(), a: def[0].toLowerCase(), b: def[1], media: "copper", bw: "10 Gbps" });
  });

  /* Metro */
  const metroNodes = [
    { id: "wh-1", label: "WH-1 Central", kind: "site", x: 400, y: 72, note: "Central warehouse — anchor for the metro ring." },
    { id: "wh-2", label: "WH-2 East", kind: "site", x: 648, y: 160 },
    { id: "wh-3", label: "WH-3 South", kind: "site", x: 648, y: 330 },
    { id: "wh-4", label: "WH-4 Depot", kind: "site", x: 400, y: 418 },
    { id: "wh-5", label: "WH-5 West", kind: "site", x: 152, y: 330 },
    { id: "wh-6", label: "WH-6 Ridge", kind: "site", x: 152, y: 160, note: "Newest site — NOT yet connected to the metro links." },
  ];
  const metroEdges = [
    { id: "e-m12", a: "wh-1", b: "wh-2", media: "wan", bw: "1 Gbps" },
    { id: "e-m23", a: "wh-2", b: "wh-3", media: "wan", bw: "1 Gbps" },
    { id: "e-m34", a: "wh-3", b: "wh-4", media: "wan", bw: "1 Gbps" },
    { id: "e-m45", a: "wh-4", b: "wh-5", media: "wan", bw: "1 Gbps" },
    { id: "e-m51", a: "wh-5", b: "wh-1", media: "wan", bw: "1 Gbps" },
  ];

  /* WAN */
  const wanNodes = [
    { id: "hq-wan2", label: "HQ / WAN", kind: "cloud", x: 130, y: 84 },
    { id: "internet", label: "Internet", kind: "cloud", x: 640, y: 84, note: "Public broadband + VPN overlay path." },
    { id: "tr-edge", label: "TRELLIS-EDGE-R1", kind: "router", x: 270, y: 218, model: "EG-3000" },
    { id: "pt-edge", label: "PARTNER-EDGE-R1", kind: "router", x: 540, y: 218, model: "EG-3000", note: "Partner fulfillment center's edge router." },
  ];
  const wanEdges = [
    { id: "e-p2p", a: "tr-edge", b: "pt-edge", media: "fiber", bw: "10 Gbps", note: "PRIVATE LAYER-2 CIRCUIT — dedicated fiber between exactly two endpoints. No intermediary devices, guaranteed bandwidth." },
    { id: "e-tr-in", a: "tr-edge", b: "internet", media: "wan", bw: "500 Mbps", note: "Broadband internet breakout (VPN overlay to partner)." },
    { id: "e-pt-in", a: "pt-edge", b: "internet", media: "wan", bw: "500 Mbps", note: "Partner's broadband breakout." },
    { id: "e-tr-hq", a: "tr-edge", b: "hq-wan2", media: "wan", bw: "10 Gbps", note: "Trellis WAN uplink." },
  ];

  /* Campus */
  const campusNodes = [
    { id: "campus-wan", label: "WAN", kind: "cloud", x: 400, y: 52 },
    { id: "bs-a", label: "BLDG-A SW", kind: "switch", x: 200, y: 156, note: "Building A switch — endpoints star off it." },
    { id: "bs-b", label: "BLDG-B SW", kind: "switch", x: 600, y: 156, note: "Building B switch — endpoints star off it." },
    { id: "bs-c", label: "BLDG-C SW", kind: "switch", x: 400, y: 320, note: "Building C switch — endpoints star off it." },
    { id: "ca-1", label: "A-1", kind: "host", isHost: true, x: 96, y: 258 },
    { id: "ca-2", label: "A-2", kind: "host", isHost: true, x: 208, y: 288 },
    { id: "cb-1", label: "B-1", kind: "host", isHost: true, x: 512, y: 258 },
    { id: "cb-2", label: "B-2", kind: "host", isHost: true, x: 624, y: 288 },
    { id: "cc-1", label: "C-1", kind: "host", isHost: true, x: 296, y: 424 },
    { id: "cc-2", label: "C-2", kind: "host", isHost: true, x: 400, y: 440 },
    { id: "cc-3", label: "C-3", kind: "host", isHost: true, x: 504, y: 424 },
  ];
  const campusEdges = [
    { id: "e-c-wa", a: "bs-a", b: "campus-wan", media: "wan", bw: "2 Gbps" },
    { id: "e-c-ab", a: "bs-a", b: "bs-b", media: "fiber", bw: "10 Gbps", note: "Inter-building fiber." },
    { id: "e-c-bc", a: "bs-b", b: "bs-c", media: "fiber", bw: "10 Gbps", note: "Inter-building fiber." },
    { id: "e-c-ac", a: "bs-a", b: "bs-c", media: "fiber", bw: "10 Gbps", note: "Inter-building fiber — closes a full mesh across the three building switches." },
    { id: "e-c-a1", a: "ca-1", b: "bs-a", media: "copper", bw: "1 Gbps" },
    { id: "e-c-a2", a: "ca-2", b: "bs-a", media: "copper", bw: "1 Gbps" },
    { id: "e-c-b1", a: "cb-1", b: "bs-b", media: "copper", bw: "1 Gbps" },
    { id: "e-c-b2", a: "cb-2", b: "bs-b", media: "copper", bw: "1 Gbps" },
    { id: "e-c-c1", a: "cc-1", b: "bs-c", media: "copper", bw: "1 Gbps" },
    { id: "e-c-c2", a: "cc-2", b: "bs-c", media: "copper", bw: "1 Gbps" },
    { id: "e-c-c3", a: "cc-3", b: "bs-c", media: "copper", bw: "1 Gbps" },
  ];

  /* Annex */
  const annexNodes = [
    { id: "annex-wan", label: "HQ / WAN", kind: "cloud", x: 400, y: 48 },
    { id: "ax-cc1", label: "ANNEX-CORE-1", kind: "switch", layer: "collapsed", x: 400, y: 158, model: "CX-8200", note: "COLLAPSED CORE — merges the core and distribution layers into one device." },
    { id: "ax-ac1", label: "ANNEX-ACC-1", kind: "switch", layer: "access", x: 220, y: 288 },
    { id: "ax-ac2", label: "ANNEX-ACC-2", kind: "switch", layer: "access", x: 580, y: 288 },
    { id: "ax-1", label: "H-1", kind: "host", isHost: true, x: 120, y: 396 },
    { id: "ax-2", label: "H-2", kind: "host", isHost: true, x: 292, y: 396 },
    { id: "ax-3", label: "H-3", kind: "host", isHost: true, x: 508, y: 396 },
    { id: "ax-4", label: "H-4", kind: "host", isHost: true, x: 680, y: 396 },
  ];
  const annexEdges = [
    { id: "e-ax-up", a: "ax-cc1", b: "annex-wan", media: "wan", bw: "2 Gbps" },
    { id: "e-ax-1", a: "ax-cc1", b: "ax-ac1", media: "fiber", bw: "10 Gbps" },
    { id: "e-ax-2", a: "ax-cc1", b: "ax-ac2", media: "fiber", bw: "10 Gbps" },
    { id: "e-ax-h1", a: "ax-1", b: "ax-ac1", media: "copper", bw: "1 Gbps" },
    { id: "e-ax-h2", a: "ax-2", b: "ax-ac1", media: "copper", bw: "1 Gbps" },
    { id: "e-ax-h3", a: "ax-3", b: "ax-ac2", media: "copper", bw: "1 Gbps" },
    { id: "e-ax-h4", a: "ax-4", b: "ax-ac2", media: "copper", bw: "1 Gbps" },
  ];

  /* ------------------------------- Evidence -------------------------------- */
  /* Branch — incident 09:12 (H1 triage evidence). */
  const branchEvidence = {
    label: "Incident 09:12",
    tickets: [
      { id: "T-1042", from: "Store manager (phone)", time: "09:12", text: "\"THE WHOLE NETWORK IS DOWN!! Customers at the registers, nothing works. I think the internet company broke us.\"" },
      { id: "T-1043", from: "Cashier POS-3", time: "09:15", text: "Card terminal shows 'no connection'. Same on POS-1 and POS-2." },
      { id: "T-1044", from: "Auto-monitor", time: "09:16", text: "Device SW-B1 unreachable (ICMP + SNMP). Uplink e-br-up healthy. AP-1 radio still up but no backhaul." },
    ],
    monitoring: [
      { label: "SW-B1 reachability", value: "UNREACHABLE", flag: "down" },
      { label: "Uplink e-br-up (to HQ)", value: "healthy, 62% utilization", flag: "ok" },
      { label: "HQ / WAN anchor", value: "healthy", flag: "ok" },
      { label: "Interfaces on SW-B1", value: "not responding (management plane down)", flag: "down" },
    ],
  };

  /* Branch — incident 14:03 (H10 evidence).
     FIX (static port v4): in the ORIGINAL lab this block existed in sites.ts as
     `branchEvidence2` but was never wired into any site, so H10 referenced
     evidence that could not be seen. Here it is served in Hard mode so H10 is
     answerable from the Evidence tab as its own text instructs. See the
     Conversion Notes. */
  const branchEvidence2 = {
    label: "Incident 14:03",
    tickets: [
      { id: "T-1071", from: "Store manager", time: "14:03", text: "\"Network is down again. Registers are frozen, we're losing sales — this place is a disaster.\"" },
      { id: "T-1072", from: "Cashier POS-2", time: "14:04", text: "My terminal shows the link LED off. Other registers seem... actually fine?" },
      { id: "T-1073", from: "Facilities", time: "14:10", text: "Reminder: scheduled AP-1 radio maintenance window completed last night 02:00 (as planned)." },
    ],
    monitoring: [
      { label: "SW-B1 reachability", value: "reachable, CPU 9%", flag: "ok" },
      { label: "Interface to POS-2 (Gig0/7)", value: "link DOWN — no signal", flag: "down" },
      { label: "All other SW-B1 interfaces", value: "up, normal traffic", flag: "ok" },
      { label: "Uplink e-br-up", value: "healthy", flag: "ok" },
    ],
    traces: ["POS-2 → SW-B1: no response (link down)", "PC-1 → POS-2: no response", "PC-1 → PRN-1: OK (1 hop)"],
  };

  const hqEvidence = {
    tickets: [
      { id: "T-2201", from: "Building B floor 2", time: "11:41", text: "Nobody in Building B can reach the file servers in Building A. We can still print and share inside Building B." },
      { id: "T-2202", from: "Buildings A & C users", time: "11:44", text: "No problems reported — everything normal here." },
    ],
    monitoring: [
      { label: "DIST-2 status", value: "amber — control plane up, 2 of 4 uplinks down", flag: "warn" },
      { label: "CORE-A / CORE-B", value: "healthy", flag: "ok" },
      { label: "ACC-2A / ACC-2B uplinks", value: "up to DIST-2, but DIST-2 cannot forward upstream", flag: "warn" },
      { label: "DIST-1 / DIST-3", value: "healthy", flag: "ok" },
    ],
  };

  const dcEvidence = {
    traces: [
      "trace VM-A1 → VM-C2:  VM-A1 → [leaf] → [tier-B] → [leaf] → VM-C2  (3 fabric switch hops)",
      "trace VM-A1 → VM-D1:  VM-A1 → [leaf] → [tier-B] → [leaf] → VM-D1  (3 fabric switch hops)",
      "trace VM-B2 → VM-C1:  VM-B2 → [leaf] → [tier-B] → [leaf] → VM-C1  (3 fabric switch hops)",
      "trace VM-D2 → VM-A2:  VM-D2 → [leaf] → [tier-B] → [leaf] → VM-A2  (3 fabric switch hops)",
    ],
    monitoring: [
      { label: "Switch tiers discovered", value: "exactly 2 tiers between servers and border: leaf tier + one upper tier", flag: "ok" },
      { label: "Upper-tier devices", value: "2 units; EVERY lower-tier switch has uplinks to BOTH", flag: "ok" },
      { label: "Lower-tier switches", value: "4 units; NO lower-to-lower links; no servers on the upper tier", flag: "ok" },
      { label: "Failover drill (kill 1 upper-tier unit)", value: "all 8 servers still reach the border — zero isolation", flag: "ok" },
    ],
    stats: [
      { label: "Measured latency VM↔VM (any leaf pair)", value: "identical: 2 fabric stages every time" },
      { label: "Traffic mix (analytics cluster)", value: "78% server-to-server (east-west)" },
    ],
  };

  /* Sites (evidence may be one file or several groups — groups render in order) */
  const SITES = [
    {
      id: "branch",
      name: "Branch Store #12",
      sheet: "SHT-01",
      blurb: "Trellis Foods retail branch. One wiring closet, one switch, seven endpoints, one uplink.",
      anchor: "br-wan",
      hosts: ["pos-1", "pos-2", "pos-3", "pc-1", "prn-1", "ap-1", "cam-1"],
      nodes: branchNodes,
      edges: branchEdges,
      truth: "star / hub-and-spoke",
      evidenceGroups: [branchEvidence],
      viewBox: "0 0 800 470",
    },
    {
      id: "hq",
      name: "HQ Campus (3 buildings)",
      sheet: "SHT-02",
      blurb: "Headquarters: two redundant cores, three distribution switches, six access switches, twelve PCs. Access switches are single-homed.",
      anchor: "hq-wan",
      hosts: hostNames.map(function (n) { return n.toLowerCase(); }),
      nodes: hqNodes,
      edges: hqEdges,
      truth: "three-tier (core / distribution / access)",
      evidenceGroups: [hqEvidence],
      viewBox: "0 0 900 540",
    },
    {
      id: "dc",
      name: "Data Center pod",
      sheet: "SHT-03",
      blurb: "Trellis DC analytics pod: a two-stage fabric, 8 servers, one border gateway.",
      anchor: "dc-gw",
      hosts: vmDefs.map(function (d) { return d[0].toLowerCase(); }),
      nodes: dcNodes,
      edges: dcEdges,
      truth: "spine-and-leaf (2 spines × 4 leaves)",
      evidenceGroups: [dcEvidence],
      viewBox: "0 0 900 470",
    },
    {
      id: "metro",
      name: "Metro warehouses",
      sheet: "SHT-04",
      blurb: "Six warehouses across the metro area linked by leased circuits. WH-1..WH-5 form a ring; WH-6 (new) is not connected yet.",
      anchor: "wh-1",
      hosts: [],
      nodes: metroNodes,
      edges: metroEdges,
      truth: "partial mesh (ring today, WH-6 isolated)",
      viewBox: "0 0 800 480",
    },
    {
      id: "wan",
      name: "Partner circuit",
      sheet: "SHT-05",
      blurb: "Connectivity between Trellis and the partner fulfillment center: a private circuit and a public backup path.",
      anchor: "hq-wan2",
      hosts: [],
      nodes: wanNodes,
      edges: wanEdges,
      truth: "point-to-point circuit (plus internet distractors)",
      viewBox: "0 0 800 300",
    },
    {
      id: "campus",
      name: "Riverside campus",
      sheet: "SHT-06",
      blurb: "Three small buildings: endpoints star off each building switch, and the three building switches are interconnected by fiber.",
      anchor: "campus-wan",
      hosts: ["ca-1", "ca-2", "cb-1", "cb-2", "cc-1", "cc-2", "cc-3"],
      nodes: campusNodes,
      edges: campusEdges,
      truth: "hybrid (stars + 3-node mesh core)",
      viewBox: "0 0 800 480",
    },
    {
      id: "annex",
      name: "Annex (planned v1)",
      sheet: "SHT-07",
      blurb: "Planned 45-user annex: ONE switch sits between the access layer and the WAN — a merged-layer design.",
      anchor: "annex-wan",
      hosts: ["ax-1", "ax-2", "ax-3", "ax-4"],
      nodes: annexNodes,
      edges: annexEdges,
      truth: "collapsed core (two-tier)",
      viewBox: "0 0 800 440",
    },
  ];

  const BUILD_METRO_BASE = SITES.find(function (s) { return s.id === "metro"; });
  const BUILD_ANNEX_VIEWBOX = "0 0 800 470";
  const ANNEX_PART_SLOTS = {
    collapsed: [{ x: 320, y: 170 }, { x: 560, y: 170 }],
    access: [{ x: 220, y: 300 }, { x: 580, y: 300 }],
    host: [{ x: 120, y: 412 }, { x: 300, y: 412 }, { x: 500, y: 412 }, { x: 680, y: 412 }],
  };

  return {
    SYNTHETIC: SYNTHETIC,
    GUIDE: GUIDE,
    TRAFFIC_NOTE: TRAFFIC_NOTE,
    GLOSSARY: GLOSSARY,
    HANDOVER: HANDOVER,
    LINKS: LINKS,
    SITES: SITES,
    BUILD_METRO_BASE: BUILD_METRO_BASE,
    BUILD_ANNEX_VIEWBOX: BUILD_ANNEX_VIEWBOX,
    ANNEX_PART_SLOTS: ANNEX_PART_SLOTS,
    BRANCH_EVIDENCE_2: branchEvidence2,
  };
})();
