/* ============================================================================
 * CyberLab — The Documentation Drafting Room (STATIC PORT)
 * js/data.js — ALL lab content, 1:1 with the original framework lab
 *   (src/lib/lab/world.ts). Fictional org: Harborline Freight Co.
 * EVERYTHING HERE IS SYNTHETIC TRAINING DATA. No real devices, people or IPs.
 * Data only — no logic in this file (logic lives in state/objectives/quiz/ui).
 * ========================================================================= */
(function () {
  "use strict";

  var LabData = {};

  // ---------------------------------------------------------------- meta
  LabData.LAB_TITLE = "The Documentation Drafting Room";
  LabData.LAB_SUBTITLE = "CompTIA Network+ (N10-009) · Domain 3 · Objective 3.1 — Documentation";
  LabData.TRAINING_NOTICE =
    "TRAINING DATA — Harborline Freight Co. is fictional; every device, serial, IP and person below is synthetic.";

  // ---------------------------------------------------------------- stations
  LabData.SHEETS = [
    { id: "diagrams", tab: "Sheet 01 · Diagram Pair", tabShort: "Diagrams", icon: "Map", purpose: "Physical vs. logical diagrams", order: 1 },
    { id: "rack", tab: "Sheet 02 · Rack Elevation", tabShort: "Rack", icon: "Server", purpose: "Rack diagrams", order: 2 },
    { id: "cable", tab: "Sheet 03 · Cable Map", tabShort: "Cable map", icon: "Cable", purpose: "Cable maps & diagrams", order: 3 },
    { id: "netdiagram", tab: "Sheet 04 · L3 Network Diagram", tabShort: "Net diagram", icon: "Network", purpose: "Network diagrams (L1/L2/L3)", order: 4 },
    { id: "inventory", tab: "Sheet 05 · Asset Inventory", tabShort: "Inventory", icon: "ClipboardList", purpose: "Asset inventory", order: 5 },
    { id: "ipam", tab: "Sheet 06 · IPAM Worksheet", tabShort: "IPAM", icon: "MapPin", purpose: "IP address management", order: 6 },
    { id: "sla", tab: "Sheet 07 · SLA Desk", tabShort: "SLA", icon: "FileSignature", purpose: "Service level agreements", order: 7 },
    { id: "wireless", tab: "Sheet 08 · Wireless Survey", tabShort: "Wireless", icon: "Wifi", purpose: "Wireless surveys & heat maps", order: 8 },
    { id: "index", tab: "Sheet 09 · The Index", tabShort: "Index", icon: "BookMarked", purpose: "Choosing the right document", order: 9 },
  ];

  LabData.AUX_SHEETS = [
    { id: "archive", tab: "Archive · Knowledge Core", tabShort: "Archive", icon: "Library", purpose: "The explainer", order: 10 },
    { id: "quiz", tab: "Inspector's Quiz", tabShort: "Quiz", icon: "HelpCircle", purpose: "Knowledge check", order: 11 },
    { id: "notes", tab: "Field Notes · Debrief", tabShort: "Field notes", icon: "NotebookPen", purpose: "Synthesis & takeaways", order: 12 },
  ];

  // ---------------------------------------------------------------- building / scenario
  LabData.SCENARIO = {
    org: "Harborline Freight Co. — HQ, 3 floors + basement",
    story:
      "The previous network admin left Harborline Freight without warning. Since then, the network has changed and the documentation has drifted. This week the company starts a capacity-expansion project, and external auditors arrive in ten days. You are the new Network Documentation Specialist. Your first job: work through the drafting room, verify every sheet against what discovery actually finds, and bring the documentation set back to the truth.",
    building: [
      { floor: "Floor 3 — Operations", rooms: "Rooms 300–312 · IDF-3 closet (Rack C) · 3 APs" },
      { floor: "Floor 2 — Finance & Sales", rooms: "Rooms 200–209 · IDF-2 closet (Rack B) · 2 APs" },
      { floor: "Floor 1 — Reception & Docks", rooms: "Rooms 100–107 · 1 AP, patched directly at the MDF" },
      { floor: "Basement — MDF", rooms: "Main distribution facility · Rack A · Edge router, firewall, core switch, UPS" },
    ],
    topology: "Fiber runs daisy-chained: SW-CORE (Basement MDF) → SW-IDF2-1 (Floor 2) → SW-IDF3-1 (Floor 3).",
    vlans: [
      { id: 10, name: "STAFF", subnet: "10.20.10.0/24", gw: "10.20.10.1" },
      { id: 20, name: "VOICE", subnet: "10.20.20.0/24", gw: "10.20.20.1" },
      { id: 30, name: "GUEST-WIFI", subnet: "10.20.30.0/24", gw: "10.20.30.1" },
      { id: 99, name: "SERVERS", subnet: "10.20.99.0/24", gw: "10.20.99.1" },
    ],
  };

  // ---------------------------------------------------------------- sheet 1: diagrams
  LabData.DIAGRAM_CHIPS = [
    { id: "c1", label: "Cable types & connector locations", bin: "physical" },
    { id: "c2", label: "VLANs and IP subnets", bin: "logical" },
    { id: "c3", label: "Which room each device sits in", bin: "physical" },
    { id: "c4", label: "Routing boundaries between subnets", bin: "logical" },
    { id: "c5", label: "Rack locations and closet assignments", bin: "physical" },
    { id: "c6", label: "Firewall policy zones", bin: "logical" },
    { id: "c7", label: "Patch panel → switch port wiring", bin: "physical" },
    { id: "c8", label: "DHCP pools and gateway addresses", bin: "logical" },
  ];

  // Reading-the-map answers (M2)
  LabData.MAP_QUESTIONS = {
    room: {
      q: "In which room is the core switch SW-CORE physically mounted?",
      options: ["Basement MDF (Rack A)", "Floor 2 IDF-2 (Rack B)", "Floor 3 IDF-3 (Rack C)", "Room 105 comms cabinet"],
      answer: "Basement MDF (Rack A)",
      why: "The physical diagram places SW-CORE in Rack A inside the basement MDF — the anchor of the whole daisy chain.",
    },
    idfs: {
      q: "How many intermediate distribution frames (IDF closets) does the building have?",
      options: ["0", "1", "2", "3"],
      answer: "2",
      why: "IDF-2 (floor 2) and IDF-3 (floor 3). The basement hosts the MDF, which is the main facility, not an IDF.",
    },
    uplink: {
      q: "How does IDF-3 on floor 3 reach the core?",
      options: [
        "Direct dedicated fiber run to SW-CORE in the MDF",
        "Fiber uplink through IDF-2 (daisy chain)",
        "Copper patch through Room 105",
        "Wireless bridge to the MDF roof AP",
      ],
      answer: "Fiber uplink through IDF-2 (daisy chain)",
      why: "The physical map shows one daisy chain: MDF → IDF-2 → IDF-3. That single detail decides the blast radius when the MDF↔IDF-2 fiber is cut (see Hard mode).",
    },
  };

  // ---------------------------------------------------------------- sheet 2: rack
  LabData.RACK_DEVICES = [
    { id: "ups", name: "UPS-HQ-1 (3U, 96 kg)", sizeU: 3, hint: "Heaviest device + batteries: always mounted at the very bottom." },
    { id: "rtr", name: "EDGE-RTR-1 (ISP handoff)", sizeU: 1, hint: "Traffic enters here: keep the entry chain at the bottom, flowing upward." },
    { id: "fw", name: "FW-CORE-1 (firewall)", sizeU: 1, hint: "Sits directly above the router it receives from, below the core switch." },
    { id: "core", name: "SW-CORE-1 (core switch)", sizeU: 1, hint: "Third link of the entry chain, directly beneath its patch panels." },
    { id: "pp1", name: "PP-MDF-1 (patch panel, 48p)", sizeU: 1, hint: "Patch panels mount directly above the switches they patch into." },
    { id: "pp2", name: "PP-MDF-2 (patch panel, 48p)", sizeU: 1, hint: "Patch panels mount directly above the switches they patch into." },
  ];

  // Canonical solution: ups U1, rtr U5, fw U6, core U7, pp1 U8, pp2 U9 (pp1/pp2 may swap).
  // U4 intentionally left as ventilation gap above the UPS.
  LabData.RACK_SOLUTION = { ups: ["U1"], rtr: ["U5"], fw: ["U6"], core: ["U7"], pp1: ["U8", "U9"], pp2: ["U9", "U8"] };

  // Rack B (IDF-2) as currently (wrongly) diagrammed — Hard mode H1.
  LabData.RACK_B_CURRENT = [
    { u: "U10", dev: "SW-IDF2-1 · Aruba 2930F 48p" },
    { u: "U11", dev: "SW-IDF2-2 · Aruba 2930F 24p" },
    { u: "U12", dev: "PP-IDF2-1 · patch panel 48p" },
    { u: "U13", dev: "PP-IDF2-2 · patch panel 48p" },
    { u: "U14", dev: "UPS-IDF2 · 2U UPS" },
  ];
  LabData.RACK_B_AUDIT = {
    upsSlot: {
      options: ["U1", "U7", "U10", "U14"],
      answer: "U1",
      why: "Discovery photos show the UPS sitting on the floor of Rack B's base — a 2U UPS always documents at the bottom, never mid-rack.",
    },
    swModel: {
      options: ["Aruba 2930F 24p", "Aruba 2930F 48p", "Cisco C9200-24P", "Unknown"],
      answer: "Aruba 2930F 48p",
      why: "The device's own label (and its 48 patch cables) say 48 ports; the sheet's '24p' is stale.",
    },
    ppSlot: {
      options: ["U11", "U12", "U13", "U14"],
      answer: "U12",
      why: "With SW-IDF2-2 at U11, its patch panel must sit directly above it: U12 (currently occupied in the drawing by PP-IDF2-1's slot is the drift the audit fixes).",
    },
    missing: {
      options: ["PDU (power strip, 1U)", "Second UPS", "KVM console", "Nothing is missing"],
      answer: "PDU (power strip, 1U)",
      why: "Discovery lists a 1U PDU powering the switches; nothing documents it. Undocumented power gear hides outages from future troubleshooting.",
    },
  };
  LabData.RACK_B_DISCOVERY_LINES = [
    "Photos: UPS sits at the rack base (floor level).",
    "Chassis label SW-IDF2-2: 'Aruba 2930F 48p', 44 patch cables present.",
    "SW-IDF2-1 at U10, SW-IDF2-2 directly below at U11.",
    "PP-IDF2-2 must patch SW-IDF2-2 (panel directly above its switch).",
    "Power audit: one 1U PDU present, powering both switches.",
  ];

  // ---------------------------------------------------------------- sheet 3: cable map
  LabData.CABLE_WALLPORTS = [
    { id: "204-A", label: "204-A", detail: "Room 204 data drop · Cable ID C-204-A", correct: true },
    { id: "204-B", label: "204-B", detail: "Room 204 voice drop · Cable ID C-204-B", correct: false },
    { id: "205-A", label: "205-A", detail: "Room 205 data drop · Cable ID C-205-A", correct: false },
    { id: "203-A", label: "203-A", detail: "Room 203 data drop · Cable ID C-203-A", correct: false },
  ];

  LabData.CABLE_PANELPORTS = [
    { id: "pp-idf2-1-12", label: "PP-IDF2-1 · port 12", detail: "Backside of patch panel 1, IDF-2", correct: true },
    { id: "pp-idf2-1-07", label: "PP-IDF2-1 · port 07", detail: "Backside of patch panel 1, IDF-2", correct: false },
    { id: "pp-idf2-1-15", label: "PP-IDF2-1 · port 15", detail: "Backside of patch panel 1, IDF-2", correct: false },
    { id: "pp-idf2-2-04", label: "PP-IDF2-2 · port 04", detail: "Backside of patch panel 2, IDF-2", correct: false },
  ];

  LabData.CABLE_SWITCHPORTS = [
    { id: "gi1-0-12", label: "SW-IDF2-1 · Gi1/0/12", detail: "Access port — VLAN 10 STAFF", correct: true },
    { id: "gi1-0-07", label: "SW-IDF2-1 · Gi1/0/07", detail: "Access port — VLAN 20 VOICE", correct: false },
    { id: "gi1-0-15", label: "SW-IDF2-1 · Gi1/0/15", detail: "Access port — VLAN 30 GUEST-WIFI", correct: false },
    { id: "gi1-0-24", label: "SW-IDF2-1 · Gi1/0/24", detail: "Uplink to SW-IDF3-1", correct: false },
  ];

  LabData.CABLE_CHAIN_WHY =
    "A cable map entry is a three-link chain: wall port (work area) → patch panel port (closet) → switch port. Numbered labels (TIA/EIA-606 style) tie the three together so any tech can trace a drop without a toner kit.";

  // Hard mode H5: two runs to audit; C-201-B is mislabeled.
  LabData.CABLE_RUNS = [
    {
      id: "c-302-a",
      label: "C-302-A",
      map: "Wall 302-A → PP-IDF3-1 port 05 → SW-IDF3-1 Gi1/0/05",
      discovery: "Technician toner test: tone heard on PP-IDF3-1 p05 → Gi1/0/05. MATCH.",
      ok: true,
    },
    {
      id: "c-201-b",
      label: "C-201-B",
      map: "Wall 201-B → PP-IDF2-1 port 22 → SW-IDF2-1 Gi1/0/22",
      discovery: "Technician toner test: tone heard on PP-IDF2-1 p22, but the light is on switch port Gi1/0/24, not Gi1/0/22. MISMATCH.",
      ok: false,
    },
  ];
  LabData.CABLE_FIXED_PORTS = ["SW-IDF2-1 · Gi1/0/22", "SW-IDF2-1 · Gi1/0/24", "SW-IDF2-1 · Gi1/0/15", "SW-IDF3-1 · Gi1/0/05"];
  LabData.CABLE_FIX_ANSWER = "SW-IDF2-1 · Gi1/0/24";

  // ---------------------------------------------------------------- sheet 4: network diagram (L3)
  LabData.NET_ELEMENTS = [
    { id: "wan", label: "Internet", sub: "via ISP handoff 10.50.0.2", isError: false },
    { id: "rtr", label: "EDGE-RTR-1", sub: "WAN 10.50.0.2", isError: false },
    { id: "fw", label: "FW-CORE-1", sub: "INSIDE 10.20.0.2", isError: false },
    { id: "core", label: "SW-CORE-1 (L3 core)", sub: "SVI gateways below", isError: false },
    { id: "vlan10", label: "VLAN 10 STAFF", sub: "10.20.10.0/24 · GW .1", isError: false },
    { id: "vlan20", label: "VLAN 20 VOICE", sub: "10.20.20.0/24 · GW .1", isError: false },
    { id: "vlan30", label: "VLAN 30 GUEST", sub: "10.20.30.0/24 · GW .1", isError: false },
    { id: "vlan99", label: "VLAN 99 SERVERS", sub: "10.20.98.0/24 · GW .1", isError: true },
    { id: "srv", label: "SRV-DC1 / SRV-FS1", sub: "VLAN 99 · 10.20.99.10/.11", isError: false },
  ];

  LabData.DIAGRAM_DISCOVERY = [
    "SW-CORE-1# show ip interface brief",
    "  Vlan10  10.20.10.1   YES manual up/up",
    "  Vlan20  10.20.20.1   YES manual up/up",
    "  Vlan30  10.20.30.1   YES manual up/up",
    "  Vlan99  10.20.99.1   YES manual up/up",
    "SRV-DC1 ipconfig → IPv4 10.20.99.10/24, GW 10.20.99.1",
    "IPAM sheet 06 records SERVERS block as 10.20.99.0/24",
  ];
  // (Carried over 1:1 from the original; kept for content parity even though the
  //  framework build did not render it directly.)
  LabData.DIAGRAM_ERROR_WHY =
    "The diagram draws VLAN 99 as 10.20.98.0/24, but the switch's own interface table and IPAM both say 10.20.99.0/24. A Layer 3 diagram must match device reality — whoever troubleshoots from this sheet tonight will ping a whole wrong subnet.";

  // Hard H7: fiber cut blast radius (answers in order)
  LabData.BLAST_CLOSET_OPTIONS = ["Basement MDF (Rack A)", "IDF-2 (Floor 2)", "IDF-3 (Floor 3)", "None — all closets stay up"];
  LabData.BLAST_CLOSETS_ANSWER = ["IDF-2 (Floor 2)", "IDF-3 (Floor 3)"];
  LabData.BLAST_DOC_OPTIONS = ["Logical (L3) diagram", "Physical diagram / cable map", "SLA contract", "Wireless heat map"];
  LabData.BLAST_DOC_ANSWER = "Physical diagram / cable map";
  LabData.BLAST_SYSTEMS_OPTIONS = [
    "Everything, including servers",
    "Only floor-2 and floor-3 users/APs lose the path to the core; VLAN 99 servers in the basement stay up",
    "Only the guest Wi-Fi drops",
    "Nothing loses connectivity — fiber has a second path",
  ];
  LabData.BLAST_SYSTEMS_ANSWER =
    "Only floor-2 and floor-3 users/APs lose the path to the core; VLAN 99 servers in the basement stay up";
  LabData.BLAST_WHY =
    "The physical diagram (daisy chain MDF→IDF-2→IDF-3) is the first sheet to open when fiber breaks: it predicts that IDF-2 AND IDF-3 go dark while the basement (MDF, servers, firewall) stays alive. Only then does the logical diagram matter, for which subnets/VLANs those floors were serving.";

  // Hard H8: rebuild facts
  LabData.REBUILD_FACTS = [
    "Room 201-B drops to PP-IDF2-1 p22 → SW-IDF2-1 Gi1/0/24 (post-relabel, see Sheet 03 audit).",
    "SW-IDF2-1# show run interface Gi1/0/24 → 'switchport access vlan __' (blank in notes).",
    "Phones on floor 2 register to SRV-PBX at 10.20.20.20 and must reach it via their VLAN's gateway.",
    "SW-CORE-1# show ip interface brief → Vlan20 10.20.20.__ (blank in notes).",
  ];
  LabData.REBUILD_VLAN_OPTIONS = ["VLAN 10 STAFF", "VLAN 20 VOICE", "VLAN 30 GUEST", "VLAN 99 SERVERS"];
  LabData.REBUILD_PORT_ANSWER = "VLAN 10 STAFF"; // Room 201-B is the data drop for the workstation (cable map: VLAN 10)
  LabData.REBUILD_GW_ANSWER = "10.20.20.1";

  // ---------------------------------------------------------------- sheet 5: asset inventory
  LabData.ASSETS = [
    { id: "a1", tag: "LT-0401", type: "Laptop", model: "Dell Latitude 5420", serial: "HL-DL-71201", location: "RM 203", assigned: "r.cole", warranty: "2027-03" },
    { id: "a2", tag: "SW-IDF2-2", type: "Switch", model: "Aruba 2930F", serial: "HL-SW-88213", location: "IDF-2 (Rack B)", assigned: "network", warranty: "2026-11" },
    { id: "a3", tag: "PRN-003", type: "Printer", model: "HP LaserJet M404", serial: "HL-HP-33012", location: "RM 105", assigned: "facilities", warranty: "out" },
    { id: "a4", tag: "FW-CORE-1", type: "Firewall", model: "FortiGate 100F", serial: "HL-FG-55401", location: "MDF (Rack A)", assigned: "security", warranty: "2027-01" },
    { id: "a5", tag: "AP-302", type: "Access point", model: "Cisco C9130AXI", serial: "HL-AP-90733", location: "Floor 3 ceiling", assigned: "network", warranty: "2026-08" },
    { id: "a6", tag: "LT-0388", type: "Laptop", model: "Lenovo ThinkPad T14", serial: "HL-LN-55910", location: "RM 208", assigned: "j.mercer", warranty: "2026-05" },
  ];

  // M6: the two stale records are a2 (serial mismatch) and a3 (ghost device).
  LabData.INVENTORY_STALE = ["a2", "a3"];

  LabData.DISCOVERY_SCAN = [
    "nmap sweep 10.20.10.0/24 → 61 hosts up",
    "Device label SW-IDF2-2 reads SERIAL HL-SW-88217 (inventory says HL-SW-88213)",
    "Ticket #812 (closed): PRN-003 from RM 105 recycled — no device present at last visit",
    "FW-CORE-1 serial matches chassis label HL-FG-55401",
    "AP-302 responds on 10.20.10.6; label matches HL-AP-90733",
    "LT-0401 checks in to MDM from RM 203 — matches record",
    "LT-0388 checks in to MDM from RM 208 — matches record",
  ];

  // Hard H6 lifecycle tickets
  LabData.LIFECYCLE_TICKETS = [
    { id: "t1", text: "TICKET #901 — New switch SW-IDF3-2 received (Aruba 2930F). Rack it in IDF-3 and add it to inventory. Chassis serial: HL-SW-88220." },
    { id: "t2", text: "TICKET #902 — Disposal confirmed for PRN-003 (recycled, certificate filed)." },
    { id: "t3", text: "TICKET #903 — j.mercer's laptop LT-0388 physically relocated to Room 302." },
  ];
  LabData.LIFECYCLE_SERIAL_ANSWER = "HL-SW-88220";
  LabData.LIFECYCLE_PRN_OPTIONS = ["Keep active", "Mark disposed", "Mark lost", "Move to RM 302"];
  LabData.LIFECYCLE_PRN_ANSWER = "Mark disposed";
  LabData.LIFECYCLE_LT_OPTIONS = ["RM 208", "RM 203", "RM 302", "IDF-3"];
  LabData.LIFECYCLE_LT_ANSWER = "RM 302";

  // ---------------------------------------------------------------- sheet 6: IPAM
  LabData.IPAM_PLAN = [
    { range: "10.20.10.1", use: "Gateway (SVI VLAN 10)" },
    { range: "10.20.10.2 – .9", use: "Network infrastructure (APs, cameras) — static" },
    { range: "10.20.10.10 – .19", use: "Printers — static" },
    { range: "10.20.10.20 – .49", use: "Admin static devices" },
    { range: "10.20.10.50 – .149", use: "DHCP pool STAFF-DHCP" },
    { range: "10.20.10.150 – .199", use: "Reserved for expansion" },
    { range: "10.20.10.200 – .254", use: "Management (iLO/IPMI)" },
  ];

  LabData.IPAM_RECORDS = [
    { id: "i1", device: "PC-FIN-12", ip: "10.20.10.23", kind: "static", note: "Finance workstation" },
    { id: "i2", device: "PC-OPS-3", ip: "10.20.10.23", kind: "static", note: "Ops workstation" },
    { id: "i3", device: "PRN-206", ip: "10.20.10.77", kind: "static", note: "Floor 2 printer" },
    { id: "i4", device: "AP-201", ip: "10.20.10.3", kind: "static", note: "Floor 2 AP mgmt" },
    { id: "i5", device: "PC-SAL-8", ip: "10.20.10.112", kind: "dhcp", note: "Sales laptop (lease .112)" },
    { id: "i6", device: "PC-SAL-9", ip: "10.20.10.118", kind: "dhcp", note: "Sales laptop (lease .118)" },
    { id: "i7", device: "IPMI-IDF2", ip: "10.20.10.201", kind: "static", note: "Switch management" },
  ];

  LabData.IPAM_DUP_ANSWER = "10.20.10.23"; // i1 + i2 both static .23
  LabData.IPAM_PRN_ANSWER = "10.20.10.13"; // printer block .10–.19: .10,.11,.12 taken by PRN-203/204/205 → next free .13
  LabData.IPAM_PRN_CONTEXT = "Printer block: PRN-203=.10, PRN-204=.11, PRN-205=.12. Assign PRN-206 the next free printer-block address.";

  // Hard H2: three issues
  LabData.IPAM_ISSUES = [
    { id: "dup", label: "Duplicate static IP (.23 assigned twice)" },
    { id: "pool", label: "Static device inside the DHCP pool (PRN-206 at .77)" },
    { id: "gw", label: "Gateway documented as .254, device reality is .1" },
  ];
  LabData.IPAM_GW_REality = "SW-CORE-1# show ip interface brief → Vlan10 10.20.10.1 (the worksheet's gateway cell says 10.20.10.254)";
  LabData.IPAM_H_DUP_ANSWER = "10.20.10.45"; // next free admin-static slot (.20–.44 in use)
  LabData.IPAM_H_CONTEXT_DUP = "Admin static block: .20–.44 are all in use (verified against DHCP leases and ARP). Move PC-OPS-3 to the next free admin-static address.";
  LabData.IPAM_H_GW_ANSWER = "10.20.10.1";

  // ---------------------------------------------------------------- sheet 7: SLA
  // Contract: 30-day service month = 43,200 minutes.
  LabData.SLA_TIERS = [
    { id: "bronze", name: "Bronze", uptime: "99.0%", response: "8 business hours", maxDown: "432 min / 30-day month", price: "$—" },
    { id: "silver", name: "Silver", uptime: "99.5%", response: "4 business hours", maxDown: "216 min / 30-day month", price: "$$" },
    { id: "gold", name: "Gold", uptime: "99.9%", response: "1 hour, 24×7", maxDown: "43.2 min / 30-day month", price: "$$$$" },
  ];

  LabData.SLA_SERVICES = [
    { id: "svc1", name: "Online freight-booking checkout", needs: "Revenue-critical; every minute of downtime costs bookings; needs 24×7 fast response.", answer: "gold" },
    { id: "svc2", name: "Internal HR bulletin board", needs: "Nice-to-have; staff can wait until next business day if it breaks overnight.", answer: "bronze" },
    { id: "svc3", name: "Floor-2 warehouse scanning app", needs: "Shifts run evenings/weekends; downtime mid-shift stops shipping, but an hour's wait is survivable.", answer: "silver" },
  ];

  LabData.SLA_MATH = {
    question: "Harborline's Gold tier promises 99.9% uptime on a 30-day service month (43,200 minutes). What is the maximum downtime allowed, in minutes?",
    answer: 43.2,
    tolerance: 0.2,
    why: "43,200 × 0.001 = 43.2 minutes. Three nines ≈ 8.77 hours per YEAR, but the contract math is per service month — always convert before you promise.",
  };

  // Hard H3 verification: September outages
  LabData.SLA_INCIDENTS = [
    { date: "Sep 4, 14:22–14:40", mins: 18 },
    { date: "Sep 12, 03:05–03:17", mins: 12 },
    { date: "Sep 21, 09:30–10:01", mins: 31 },
  ];
  LabData.SLA_VERIFY = {
    total: 61,
    availability: 99.86, // (43200-61)/43200*100 = 99.8588 → 99.86
    breach: "yes",
    why: "18 + 12 + 31 = 61 min. (43,200 − 61) / 43,200 = 99.859% ≈ 99.86% availability. Gold allows 43.2 min, so 61 min breaches Gold (credits owed) but is inside Silver's 216 min.",
  };

  // ---------------------------------------------------------------- sheet 8: wireless survey
  // 5 rows × 8 cols, dBm values. Dead zone: r1c8 (NE corner behind break-room concrete wall).
  LabData.HEATMAP_ROWS = 5;
  LabData.HEATMAP_COLS = 8;
  LabData.HEATMAP = [
    [-52, -50, -55, -58, -62, -67, -74, -88],
    [-48, -44, -47, -52, -58, -63, -70, -80],
    [-50, -46, -49, -54, -60, -66, -72, -78],
    [-54, -50, -53, -58, -63, -68, -74, -82],
    [-60, -56, -58, -62, -68, -73, -79, -86],
  ];
  LabData.HEATMAP_APS = [
    { id: "AP-301", cell: "r2c2", channel: 1 },
    { id: "AP-302", cell: "r4c6", channel: 6 },
    { id: "AP-303", cell: "r1c5", channel: 6 }, // co-channel with 302 → student sets 11
  ];
  LabData.HEATMAP_DEAD = "r1c8";
  LabData.WIRELESS_CAUSES = [
    "Concrete break-room wall attenuating the signal at the building edge",
    "Rogue neighboring AP jamming the corner",
    "Too many users saturating the AP",
    "Faulty cable on AP-303",
  ];
  LabData.WIRELESS_CAUSE_ANSWER = "Concrete break-room wall attenuating the signal at the building edge";
  LabData.WIRELESS_CH_OPTIONS = ["1", "6", "11"];

  // Hard H4 redesign facts
  LabData.WIRELESS_REDESIGN = {
    channels: {
      options: ["1 / 6 / 11", "1 / 1 / 11", "6 / 6 / 6", "11 / 6 / 1"],
      answer: "1 / 6 / 11",
      why: "Only three non-overlapping 2.4 GHz channels exist (1, 6, 11). Assigning each AP a different one removes co-channel interference.",
    },
    apCount: {
      options: ["Add 1 AP near the break room", "Add 3 APs on the roof", "No change needed", "Remove AP-303"],
      answer: "Add 1 AP near the break room",
      why: "The dead zone is caused by the concrete wall; one additional AP placed on the break-room side covers it. Three roof APs overshoot, and removing AP-303 worsens coverage.",
    },
    wall: {
      options: ["Concrete (high attenuation)", "Drywall (low attenuation)", "Glass", "Wood door"],
      answer: "Concrete (high attenuation)",
      why: "The survey notes flag a new concrete break-room wall at the NE corner — high-attenuation material that explains the -88 dBm reading.",
    },
  };

  // ---------------------------------------------------------------- sheet 9: the index
  LabData.INDEX_SCENARIOS = [
    { id: "s1", text: "New hire starts Monday — you must tell the patch tech exactly which panel port and switch port her desk drop lands on.", answer: "cable" },
    { id: "s2", text: "A vendor asks for proof of where FW-CORE-1 is mounted and which rack units surround it.", answer: "rack" },
    { id: "s3", text: "You are re-numbering the guest Wi-Fi subnet and must record every address before the change.", answer: "ipam" },
    { id: "s4", text: "Accounting needs the serial number and warranty end date of every laptop.", answer: "inventory" },
    { id: "s5", text: "A tenant wants evidence of Wi-Fi coverage on every floor before signing a lease.", answer: "wireless" },
    { id: "s6", text: "You must check which uptime percentage and response time the ISP contractually promised.", answer: "sla" },
  ];

  LabData.INDEX_DOC_OPTIONS = [
    { id: "rack", label: "Rack diagram" },
    { id: "cable", label: "Cable map" },
    { id: "ipam", label: "IPAM records" },
    { id: "inventory", label: "Asset inventory" },
    { id: "wireless", label: "Wireless survey / heat map" },
    { id: "sla", label: "SLA contract" },
  ];

  LabData.INDEX_TERMS = [
    { id: "t1", term: "Rack unit (U)" },
    { id: "t2", term: "Patch panel" },
    { id: "t3", term: "Logical diagram" },
    { id: "t4", term: "DHCP pool" },
    { id: "t5", term: "Dead zone" },
    { id: "t6", term: "IPAM" },
  ];

  // Definitions are intentionally SHUFFLED (R6): this display order must NOT correlate with the
  // t1..t6 answer sequence (t1→d3, t2→d1, t3→d5, t4→d2, t5→d4, t6→d6), or students could win by
  // picking option N for term N without reading. Order below maps to answer positions [5,3,2,1,6,4].
  LabData.INDEX_DEFINITIONS = [
    { id: "d2", text: "The address range a DHCP server hands out dynamically to clients." }, // t4
    { id: "d5", text: "A network map showing VLANs, subnets, gateways and policy zones instead of rooms and cable runs." }, // t3
    { id: "d1", text: "A branded hardware board where cabling terminates into numbered ports; the bridge between wall drops and switch ports." }, // t2
    { id: "d6", text: "The practice and tooling for planning, tracking and managing IP address space across subnets." }, // t6
    { id: "d3", text: "1.75 inches of vertical space in a 19-inch equipment rack." }, // t1
    { id: "d4", text: "An area where measured signal strength is too weak for reliable service, revealed by a heat map." }, // t5
  ];

  // Correct term->definition mapping for validation
  LabData.INDEX_TERM_ANSWERS = { t1: "d3", t2: "d1", t3: "d5", t4: "d2", t5: "d4", t6: "d6" };

  // ---------------------------------------------------------------- hard-mode red herrings (discovery noise)
  LabData.RED_HERRINGS = [
    "PC-MKT-5 user complains 'Wi-Fi feels slow' — record shows the device and drop are documented correctly.",
    "SW-IDF3-1 has 400 days uptime; firmware is old but the asset and cabling records all match.",
    "Note (handwritten): 'coffee machine on floor 2 trips the breaker sometimes' — facilities, not network documentation.",
  ];

  // ---------------------------------------------------------------- knowledge core (Archive)
  LabData.TOPICS = [
    {
      id: "phys-logic",
      icon: "Map",
      title: "Physical vs. logical diagrams",
      body: "A physical diagram shows what you can touch: devices, rooms, closets, racks, cable types and connection points. A logical diagram shows how traffic flows: VLANs, subnets, gateways, routing and policy zones — no rooms, no cable runs. Same network, two lenses; keeping both current is the job.",
      examTip: "Exam tip: 'Which diagram shows…' questions hinge on rooms/cables = physical; IPs/VLANs/policy = logical.",
    },
    {
      id: "rack",
      icon: "Server",
      title: "Rack diagrams",
      body: "A rack diagram is the front elevation of an equipment rack, drawn as if you were standing in front of it. One rack unit (U) = 1.75 inches of vertical space in a 19-inch rack. Sheets record exact positions ('row 3, rack W, unit 14') so techs who never enter the data center still know what sits where. Conventions: heavy items (UPS) low, patch panels directly above the switches they serve, airflow gaps preserved.",
      examTip: "Exam tip: 1U = 1.75 in; UPS at the bottom; panels above switches.",
    },
    {
      id: "cable",
      icon: "Cable",
      title: "Cable maps",
      body: "Cable maps document every run: work-area wall port → closet patch panel port → switch port, each with a printed cable ID label. They live in the MDF/IDF and are the first tool for tracing a dead drop without a toner kit. Labels follow TIA/EIA-606-style numbering so wall, panel and switch agree.",
      examTip: "Exam tip: a cable map entry is a three-link chain; labels must agree end-to-end.",
    },
    {
      id: "netdiagram",
      icon: "Network",
      title: "Network diagrams (L1 / L2 / L3)",
      body: "Network diagrams can be drawn per OSI layer: Layer 1 shows physical interfaces and cabling, Layer 2 shows switches, MAC-level segments and VLAN trunks, Layer 3 shows routers, IP subnets and gateways. One combined drawing is common, but every element must match device reality — a wrong subnet on the sheet sends the next troubleshooter down a dead end.",
      examTip: "Exam tip: 'Which layer diagram shows MAC/VLAN trunks?' → L2. IPs/subnets → L3.",
    },
    {
      id: "inventory",
      icon: "ClipboardList",
      title: "Asset inventory",
      body: "Every device carries an asset tag (barcode/RFID) and a record: model, serial, location, assigned user, purchase date, warranty, software licenses. The inventory feeds trouble tickets, finance (depreciation) and security (what exists to patch or retire). It is only as good as its last audit — stale records are how ghost devices survive.",
      examTip: "Exam tip: serial + location + warranty + assigned user are the classic fields.",
    },
    {
      id: "ipam",
      icon: "MapPin",
      title: "IPAM (IP address management)",
      body: "IPAM plans, tracks and manages IP address space from one console: which subnets exist, what each block is for, where statics live, which ranges DHCP hands out. It maps users/devices to IPs over time and flags conflicts, shortages and drift — like a static device parked inside a DHCP pool.",
      examTip: "Exam tip: IPAM = planning + tracking + DHCP/DNS integration, not just a list of IPs.",
    },
    {
      id: "sla",
      icon: "FileSignature",
      title: "SLAs",
      body: "A service level agreement is the contractual minimum a provider must deliver: uptime percentage, response and resolution times, and remedies (credits) when missed. Do the math before promising: 99.9% of a 30-day month (43,200 min) is 43.2 min of allowed downtime; a year is 525,960 min, so 99.9% ≈ 8.77 h/yr and 99.99% ≈ 52.6 min/yr.",
      examTip: "Exam tip: memorize the nines — 99% ≈ 3.65 d/yr, 99.9% ≈ 8.77 h/yr, 99.99% ≈ 52.6 min/yr, 99.999% ≈ 5.26 min/yr.",
    },
    {
      id: "wireless",
      icon: "Wifi",
      title: "Wireless surveys & heat maps",
      body: "A wireless survey walks the site with a measurement tool and records every AP — including ones you don't own — and the frequencies in use. The heat map renders signal strength across the floor plan, exposing dead zones (walls, distance) and overlap (co-channel interference). In 2.4 GHz you have only channels 1, 6 and 11 that don't overlap.",
      examTip: "Exam tip: dead zone → attenuation/placement; two overlapping APs on one channel → co-channel interference; fix = 1/6/11 plan.",
    },
  ];

  LabData.GLOSSARY = [
    { term: "Physical diagram", def: "Map of tangible things: devices, rooms, racks, cable types and connection points." },
    { term: "Logical diagram", def: "Map of traffic concepts: VLANs, subnets, gateways, routing and policy — no rooms or cables." },
    { term: "Rack unit (U)", def: "1.75 inches of vertical space in a 19-inch equipment rack." },
    { term: "Patch panel", def: "Panel where cabling terminates in numbered ports, bridging wall drops to switch ports." },
    { term: "Cable map", def: "Record of every cable run: wall port → patch panel port → switch port, with labels." },
    { term: "MDF / IDF", def: "Main / Intermediate Distribution Facility — the primary and secondary wiring closets." },
    { term: "Asset inventory", def: "Central database of every device: tag, serial, model, location, user, warranty." },
    { term: "Asset tag", def: "Visible barcode/RFID label physically attached to each asset." },
    { term: "IPAM", def: "Planning, tracking and management of IP address space, often integrated with DHCP/DNS." },
    { term: "DHCP pool", def: "Address range a DHCP server dynamically leases to clients." },
    { term: "SLA", def: "Contractual minimum service level: uptime %, response/resolution times, remedies." },
    { term: "Heat map", def: "Floor-plan rendering of measured Wi-Fi signal strength." },
    { term: "Dead zone", def: "Area where signal is too weak for reliable service." },
    { term: "Co-channel interference", def: "Overlapping APs transmitting on the same channel, contending for airtime." },
    { term: "TIA/EIA-606", def: "Labeling standard for telecommunications infrastructure (cable/port naming)." },
  ];

  // ---------------------------------------------------------------- hints (Medium: 3 tiers; Hard: 1 nudge)
  LabData.HINTS = {
    medium: {
      M1: [
        "Read each chip and ask: could I touch it or photograph it? If yes → physical.",
        "VLANs, IPs, gateways, policies and routing exist only in configuration — they are logical.",
        "Physical: cable types, rooms, racks, patch wiring. Logical: VLANs/subnets, routing, firewall zones, DHCP pools.",
      ],
      M2: [
        "Look at the floor table under the physical diagram.",
        "Count the closets that are NOT the main one.",
        "Core is in the basement MDF; two IDFs; IDF-3 hangs off IDF-2.",
      ],
      M3: [
        "Start from the bottom: what is heaviest?",
        "Traffic enters low and flows up: router → firewall → switch.",
        "UPS U1, router U5, firewall U6, core U7, panels U8–U9.",
      ],
      M4: [
        "Match the room number first, then follow one cable ID.",
        "The data drop (A) is the workstation; B is the phone.",
        "204-A → PP-IDF2-1 port 12 → Gi1/0/12.",
      ],
      M5: [
        "Compare each subnet bubble with the discovery CLI output.",
        "Three bubbles match; one differs by one octet.",
        "VLAN 99 is drawn as .98 but reality says 10.20.99.0/24.",
      ],
      M6: [
        "A record is stale when the device differs from discovery or no longer exists.",
        "Check the serial of the IDF-2 switch and whether the RM 105 printer still exists.",
        "Flag SW-IDF2-2 (serial mismatch) and PRN-003 (recycled).",
      ],
      M7: [
        "Two devices share something they cannot share at the same time.",
        "The printer's address sits inside a range reserved for DHCP leases.",
        "Duplicate: 10.20.10.23. Correct printer IP: 10.20.10.13.",
      ],
      M8: [
        "Convert the month to minutes, then take 0.1%.",
        "30 days × 24 h × 60 min = 43,200.",
        "43,200 × 0.001 = 43.2 minutes.",
      ],
      M9: [
        "Match business pain to response time and uptime, then to price.",
        "Only one service is revenue-critical 24×7; one is nice-to-have; one is shift-critical but hour-tolerant.",
        "Checkout → Gold, bulletin board → Bronze, scanning app → Silver.",
      ],
      M10: [
        "Find the lightest (weakest dBm) cell on the grid — remember −85 dBm is near the floor of usability.",
        "The survey notes mention new construction in the NE corner.",
        "Dead cell r1c8; concrete wall; set AP-303 to channel 11.",
      ],
      M11: [
        "Ask: which artifact answers this question today?",
        "Ports and drops → Sheet 03; contracts → Sheet 07; coverage → Sheet 08.",
        "Map each scenario to the sheet whose name matches its subject matter.",
      ],
      M12: [
        "One definition per term; watch for the '1.75 inches' giveaway.",
        "Patch panel ≠ router; pool ≠ static.",
        "U→1.75 in, panel→termination board, logical→VLANs/subnets, pool→dynamic range, dead zone→weak signal, IPAM→address management.",
      ],
    },
    hard: {
      H1: [
        "Compare the drawing slot-by-slot with the discovery photos.",
        "Only one device can be at the bottom.",
        "UPS→U1, 48-port model, panel at U12, missing = PDU.",
      ],
      H2: [
        "An address can only appear once as a static.",
        "Compare each static against the block plan ranges.",
        "Issues: duplicate .23, PRN-206 in DHCP pool, gateway .254 vs .1; fixes: .45, .13, .1.",
      ],
      H3: [
        "Sum the outage minutes first.",
        "Availability = (43200 − downtime)/43200.",
        "61 min, 99.86%, Gold breached → credits.",
      ],
      H4: [
        "2.4 GHz has exactly three non-overlapping channels.",
        "Cover the dead zone with the minimum new hardware.",
        "1/6/11, add 1 AP near the break room, concrete.",
      ],
      H5: [
        "A toner tone and a lit port that disagree is the whole story.",
        "The panel port is right; the switch port is what drifted.",
        "C-201-B; fix switch port to Gi1/0/24.",
      ],
      H6: [
        "Add, dispose, move — apply each ticket to its record.",
        "The serial goes on the new switch record exactly as printed.",
        "HL-SW-88220; PRN-003 disposed; LT-0388 → RM 302.",
      ],
      H7: [
        "Which closets hang downstream of the cut?",
        "Basement devices never crossed the fiber.",
        "IDF-2 + IDF-3 down; consult physical/cable map first; servers stay up.",
      ],
      H8: [
        "Room 201-B is the workstation data drop from Sheet 03.",
        "Voice devices live in their own VLAN; its gateway is in the interface table.",
        "Gi1/0/24 → VLAN 10; Vlan20 gateway 10.20.20.1.",
      ],
      H9: [
        "For each change ask: which sheet becomes false if I do nothing?",
        "Hardware swap touches the inventory first.",
        "Inventory / IPAM(+logical) / cable map / rack / SLA.",
      ],
    },
  };

  // Pillar metadata (badge colors translated to plain CSS in styles.css)
  LabData.PILLAR_META = {
    P1: { name: "Understand", short: "U", cls: "pillar-amber" },
    P2: { name: "Recognize / Analyze", short: "R", cls: "pillar-teal" },
    P3: { name: "Detect (Audit)", short: "D", cls: "pillar-rose" },
    P4: { name: "Mitigate / Manage", short: "M", cls: "pillar-lime" },
  };

  window.LabData = LabData;
})();
