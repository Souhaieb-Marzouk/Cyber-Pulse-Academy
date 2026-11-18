// SIGNALPATH lab — teaching content (knowledge core, glossary, quiz, debrief)
// Static port of src/lib/lab/content.ts — all wording identical.
window.SP_CONTENT = (function () {
  "use strict";

  var LAB_TITLE = "SIGNALPATH";
  var LAB_SUBTITLE = "Meridian Freight NOC — Network Monitoring";
  var LAB_META = "CompTIA Network+ N10-009 · Objective 3.2 (courseware Lesson 3.5)";

  var BRIEFING = {
    medium: [
      "Meridian Freight Systems (fictional) moves freight across two sites: an HQ with office, fleet-ops and server segments, and a branch office connected by VPN. After a ransomware near-miss last quarter, the operations director ordered a real monitoring program — and handed it to you, the new NOC engineer.",
      "A monitoring server (MON1, 10.30.0.20) is racked but unconfigured. Tonight you stand up the observation plane, record a baseline — and then, at 03:00, the overnight shift gets very interesting.",
      "Everything you see is synthetic training data. Your job is to learn the seven monitoring technologies of N10-009 objective 3.2 by actually using them.",
    ],
    hard: [
      "Meridian Freight Systems (fictional), Monday 02:00. The previous engineer left the monitoring plane half-deployed, a noisy alert queue is burning, and a page just came in: 'weird traffic on the fleet VLAN'.",
      "You get no where-to-look hints, exact answers are required, and the evidence is salted with red herrings: a sanctioned vendor transfer, a P2P policy violation, and a chatty printer.",
      "Everything is synthetic training data. Prove you can run the whole monitoring cycle: acquire, baseline, detect, correlate, respond — and harden the monitoring plane itself.",
    ],
  };

  // ---------- tool matching exercise (M1) ----------
  var TOOL_MATCH_TOOLS = [
    { id: "snmp", label: "SNMP" },
    { id: "flow", label: "Flow data" },
    { id: "pcap", label: "Packet capture" },
    { id: "baseline", label: "Baseline metrics" },
    { id: "logs", label: "Log aggregation" },
    { id: "api", label: "API integration" },
    { id: "mirror", label: "Port mirroring" },
  ];

  var TOOL_MATCH_ROLES = {
    r1: { id: "r1", label: "Device health counters & status, pulled or pushed (poll / trap)" },
    r2: { id: "r2", label: "Conversation metadata: who talked to whom, when, how much — no payloads" },
    r3: { id: "r3", label: "Full frame-level visibility down to packet payloads" },
    r4: { id: "r4", label: "A recorded profile of 'normal' that anomalies are measured against" },
    r5: { id: "r5", label: "Central collection & correlation of event streams from many devices" },
    r6: { id: "r6", label: "Programmatic exchange of data between monitoring tools (REST/JSON)" },
    r7: { id: "r7", label: "Copies traffic at a capture point so instruments can actually see it" },
  };

  var TOOL_MATCH_ANSWER = {
    snmp: "r1",
    flow: "r2",
    pcap: "r3",
    baseline: "r4",
    logs: "r5",
    api: "r6",
    mirror: "r7",
  };

  // ---------- solutions matcher (H9 / official 3.2 Solutions row) ----------
  var SOLUTIONS_SCENARIOS = [
    { id: "s1", text: "An auditor asks for an up-to-date device inventory; there is none. You run a one-off network discovery sweep." },
    { id: "s2", text: "Capacity planning: 'is our 200 Mb/s WAN link trending toward saturation by Q3?'" },
    { id: "s3", text: "The SLA promises 99.9% WAN availability; someone must know the moment it drops." },
    { id: "s4", text: "You must detect that a router's running-config silently drifted from the approved baseline." },
    { id: "s5", text: "An odd traffic pattern is reported; you analyze who is talking to whom and how much." },
  ];

  var SOLUTIONS_ANSWER = {
    s1: "discovery",
    s2: "performance",
    s3: "availability",
    s4: "configuration",
    s5: "traffic",
  };

  var SOLUTIONS_OPTIONS = {
    // insertion order = display order in the dropdown; deliberately NOT parallel to
    // the scenario order so option position never reveals the pairs (R6 shuffle).
    configuration: "Configuration monitoring",
    discovery: "Network discovery (ad hoc / scheduled)",
    availability: "Availability monitoring",
    traffic: "Traffic analysis",
    performance: "Performance monitoring",
  };

  // Fixed shuffled display order for the tool-match role options (R6): the list is
  // intentionally NOT parallel to TOOL_MATCH_TOOLS row order.
  var TOOL_MATCH_ROLE_ORDER = ["r7", "r2", "r5", "r1", "r6", "r3", "r4"];

  // ---------- knowledge core ----------
  var KNOWLEDGE = [
    {
      id: "snmp",
      title: "SNMP — Simple Network Management Protocol",
      what: [
        "An SNMP manager polls agents on network devices (UDP 161) for counters stored in the device's MIB — a hierarchical tree where every measurable object has an OID (e.g., sysUpTime = 1.3.6.1.2.1.1.3.0).",
        "Agents can also push traps — unsolicited event notifications sent to the manager on UDP 162. Informs are traps with delivery acknowledgment (v2c+).",
        "Version matters: v1/v2c authenticate with a community string that travels in cleartext (often the default 'public'); v3 adds per-user authentication and encryption (authPriv mode).",
      ],
      variants: [
        ["v2c", "Community-string auth, cleartext, widely supported — weak security"],
        ["v3", "Username + auth (SHA) + privacy (AES) — the secure choice"],
        ["Trap", "Agent-initiated, fire-and-forget event push to port 162"],
        ["Poll", "Manager-initiated request/response cycle on port 161"],
      ],
      watch: ["Devices still answering to community 'public' or 'private'", "Trap storms (many linkDown events) as early outage signals", "CPU/memory/utilization counters crossing baseline thresholds"],
      examples: "Common pollers: Zabbix, LibreNMS, PRTG, SolarWinds. On Network+ exams, know ports 161/162, MIB/OID, and v2c-vs-v3 cold.",
    },
    {
      id: "flow",
      title: "Flow data — conversation metadata",
      what: [
        "A flow record summarizes one conversation: source/destination IP and port, protocol, bytes, packets, timestamps and TCP flags — metadata only, never payload.",
        "Devices (exporters) emit flow records to a collector. NetFlow v9 and IPFIX use template-based export; sFlow samples packets; J-Flow is Juniper's equivalent.",
        "Because it is cheap to keep, flow data answers 'who talked to whom, when, how much' across weeks — ideal for top talkers, capacity planning and anomaly hunting.",
      ],
      variants: [
        ["NetFlow v5", "Classic fixed-format export (Cisco-origin)"],
        ["NetFlow v9 / IPFIX", "Template-based, extensible — IPFIX is the IETF standard"],
        ["sFlow", "Sampling-based; good at scale, approximate by design"],
        ["J-Flow", "Juniper's flow export implementation"],
      ],
      watch: ["Regular session cadence to a single external peer (beaconing)", "Egress volume per host exceeding baseline p95", "Brand-new destination peers appearing outside business hours"],
      examples: "Collectors/analyzers: ntopng, ElastiFlow, Arkime, PRTG flow sensors.",
    },
    {
      id: "pcap",
      title: "Packet capture — full payload visibility",
      what: [
        "Packet capture records complete frames — headers and payload — the deepest visibility in monitoring, and the heaviest to store.",
        "Tools: Wireshark (GUI) and tcpdump (CLI) are the classics; capture filters (BPF syntax, e.g., 'host 10.20.14.217 and port 443') limit what is recorded.",
        "An interface must be in promiscuous mode (or fed a copy of traffic) to see frames not addressed to it — which is why captures depend on port mirroring or TAPs.",
      ],
      variants: [
        ["Wireshark", "Interactive GUI analysis, deep dissection"],
        ["tcpdump", "CLI capture, scriptable, light on resources"],
        ["Full packet capture (FPC)", "Continuous recording — huge storage cost"],
        ["Capture filter (BPF)", "Pre-capture filter deciding what is recorded at all"],
      ],
      watch: ["Fixed-interval small sessions (beacons)", "One-directional full-length upload streams (exfil)", "Unexpected protocols or ports on a segment"],
      examples: "Wireshark, tcpdump, dumpcap, Arkime full-packet storage.",
    },
    {
      id: "baseline",
      title: "Baseline metrics — the reference recording",
      what: [
        "A baseline documents normal behavior over a representative period (at least a day, ideally a week to catch weekly patterns): utilization, latency, jitter, packet loss, device CPU/memory, top talkers.",
        "Every 'is this weird?' judgment in monitoring is really 'how far is this from baseline?'. Without a baseline, alerts are guesses.",
        "Baseline metrics power anomaly alerting/notification: thresholds and deviation alerts only make sense once normal is measured.",
      ],
      variants: [
        ["Traffic baseline", "Utilization curves, top talkers, per-host egress"],
        ["Performance baseline", "Latency, jitter, loss for the path/SLO"],
        ["Device baseline", "CPU, memory, error counters per box"],
        ["Anomaly alert", "Notification raised when current deviates from baseline"],
      ],
      watch: ["Weekly periodicity (weekday/night, weekend jobs)", "Scheduled jobs that explain 'scary' numbers", "p95/per-host thresholds as tuning material"],
      examples: "Record baselines in your NMS (Zabbix/LibreNMS/PRTG keep history); export p95 stats for alert tuning.",
    },
    {
      id: "logs",
      title: "Log aggregation — syslog collectors & SIEM",
      what: [
        "Devices emit syslog messages with a facility and a severity (0 = emergency … 7 = debug). A syslog collector receives them from many sources into one place.",
        "Transport matters: classic UDP 514 is fast but unreliable and cleartext; TCP 6514 with TLS encrypts and delivers reliably.",
        "A SIEM goes further: centralized storage, correlation across sources, alerting and retention — e.g., joining a failed logon on DC1 with a port flap on SW3.",
      ],
      variants: [
        ["Syslog collector", "Receives and stores event streams from devices"],
        ["SIEM", "Aggregation + correlation + alerting + retention"],
        ["UDP 514", "Classic syslog — fast, unreliable, cleartext"],
        ["TCP 6514 (TLS)", "Reliable, encrypted syslog transport"],
      ],
      watch: ["Failed→success logon chains (4625→4624) for service accounts", "Events that correlate in time across different devices", "Severity storms (many critical/error lines at once)"],
      examples: "syslog-ng, rsyslog collectors; Splunk, Elastic Security, Wazuh as SIEMs.",
    },
    {
      id: "api",
      title: "API integration — the monitoring glue",
      what: [
        "Modern platforms expose REST APIs returning JSON: monitoring tools pull device health, push tickets, and trigger automations programmatically.",
        "Northbound APIs expose a controller/platform to management tools; southbound APIs let controllers program devices.",
        "APIs enable monitoring at scale — scripted health checks, config audits, ticket enrichment — but are also an attack surface: protect with read-only scopes and rotated tokens.",
      ],
      variants: [
        ["REST + JSON", "The dominant integration style for monitoring platforms"],
        ["Northbound", "Platform → management/automation layer"],
        ["Southbound", "Controller → devices (e.g., SDN programming)"],
        ["Token auth", "API keys/OAuth tokens — rotate and scope them"],
      ],
      watch: ["Default install tokens left enabled", "Unscoped read-write tokens used for read-only jobs", "Config drift exposed by API-pulled configuration audits"],
      examples: "Meraki/DNA Center/Catalyst Center, NetBox, Prometheus, vendor REST APIs.",
    },
    {
      id: "mirror",
      title: "Port mirroring — SPAN ports and TAPs",
      what: [
        "A switch sees every frame on its ports but forwards them — port mirroring (a SPAN port) copies selected source ports/VLANs to a mirror port where an analyzer can capture.",
        "SPAN is free but not free of cost: the switch spends forwarding resources, and oversized sources can impact production — mirror deliberately.",
        "A TAP is a physical inline device that copies traffic independent of the switch; passive TAPs keep the link alive even if the tap loses power.",
      ],
      variants: [
        ["SPAN (local)", "Switch software copies source port/VLAN → mirror port"],
        ["RSPAN", "SPAN carried across switches via a dedicated VLAN"],
        ["Passive TAP", "Inline copper split; fail-safe pass-through without power"],
        ["Active TAP", "Powered regeneration; may support fail-open behavior"],
      ],
      watch: ["Mirroring more sources than the analyzer/uplink can handle", "SPAN sources on the wrong switch (you miss the traffic!)", "Placement: capture where the conversation lives"],
      examples: "SPAN configured on Catalyst switches; NetOptics/Garland TAPs inline.",
    },
  ];

  var KNOWLEDGE_FOOTNOTE =
    "Official objective N10-009 3.2 also lists monitoring *solutions*: network discovery (ad hoc/scheduled), traffic analysis, performance monitoring, availability monitoring and configuration monitoring — you will classify all five in this lab.";

  // ---------- glossary ----------
  var GLOSSARY = [
    { term: "OID", def: "Object Identifier — an address of one managed object (a counter or status value) inside the SNMP MIB tree, e.g., 1.3.6.1.2.1.1.3.0 for sysUpTime." },
    { term: "MIB", def: "Management Information Base — the hierarchical database of objects an SNMP agent exposes." },
    { term: "Community string", def: "Cleartext password-style authentication used by SNMP v1/v2c; v3 replaces it with users + auth + encryption." },
    { term: "Trap", def: "Unsolicited event notification an SNMP agent pushes to the manager on UDP port 162." },
    { term: "Poll", def: "Manager-initiated request/response cycle against an agent on UDP port 161." },
    { term: "Inform", def: "A trap that requires acknowledgment (v2c and later)." },
    { term: "Flow record", def: "Metadata summary of one conversation: IPs, ports, protocol, bytes, packets, timestamps, flags." },
    { term: "Flow exporter", def: "The device that emits flow records toward a collector." },
    { term: "Flow collector", def: "The server that receives, stores and analyzes flow records." },
    { term: "IPFIX", def: "IETF-standardized flow export (successor to NetFlow v9 template export)." },
    { term: "sFlow", def: "Sampling-based flow technology — statistical, scales to very high speeds." },
    { term: "Promiscuous mode", def: "Interface mode that passes all frames it sees to the capture stack, not just frames addressed to it." },
    { term: "Capture filter (BPF)", def: "Berkeley Packet Filter expression deciding which frames a capture records, e.g., 'host 10.20.14.217 and port 443'." },
    { term: "Baseline", def: "Recorded normal behavior over a representative period, used as the reference for anomaly detection." },
    { term: "Jitter", def: "Variation of packet delay; with latency and loss it defines path quality." },
    { term: "Syslog severity", def: "0–7 scale: emergency, alert, critical, error, warning, notice, informational, debug." },
    { term: "SIEM", def: "Security Information and Event Management — centralized log storage, correlation, alerting, retention." },
    { term: "SPAN", def: "Switched Port Analyzer — switch feature copying selected ports/VLANs to a mirror port for analysis." },
    { term: "TAP", def: "Physical inline device that copies network traffic to monitoring tools without using switch resources." },
    { term: "REST", def: "HTTP API style (GET/POST…) used by platforms to exchange data programmatically." },
    { term: "authPriv", def: "SNMPv3 mode with both authentication and encryption enabled." },
  ];

  // ---------- quiz ----------
  // R4: correct-answer positions rotate across items (medium indices: 2,0,3,1,3,0 ·
  // hard indices: 3,0,2,1,3,1,0 — no fixed position). R5: options are matched in
  // length/structure so the correct answer is never the giveaway.
  var QUIZ_MEDIUM = [
    {
      id: "qm1",
      topic: "SNMP ports & mechanics",
      prompt: "An SNMP agent pushes an unsolicited event notification to the manager. Where does the manager receive it?",
      options: ["UDP 161", "UDP 514", "UDP 162", "TCP 6514"],
      answer: 2,
      explanation: "Traps (and informs) arrive on UDP 162. UDP 161 is where agents LISTEN for polls. UDP 514 is classic syslog and TCP 6514 is syslog over TLS — different services entirely.",
    },
    {
      id: "qm2",
      topic: "SNMP versions & hardening",
      prompt: "A device still polls with community string 'public' in cleartext. What is the correct upgrade?",
      options: ["Move to SNMPv3 authPriv", "Switch to SNMPv1", "Change string to 'admin'", "Disable traps only"],
      answer: 0,
      explanation: "Only v3 adds authentication and encryption (authPriv). Renaming the string is still cleartext, v1 is weaker than v2c, and disabling traps only kills the event push while polls stay exposed.",
    },
    {
      id: "qm3",
      topic: "Choosing evidence: flow vs pcap",
      prompt: "Which evidence best answers 'which internal host sent the most data to which external peer last week?'",
      options: ["SNMP interface counters", "Packet capture of every host", "Syslog from the firewall", "Flow data from the core"],
      answer: 3,
      explanation: "Flow records are per-conversation metadata (who↔whom, bytes) retained cheaply for weeks. Packet capture has payloads but is far too heavy to keep; SNMP counters are per-interface, not per-conversation; firewall syslog shows sessions, not clean per-host volume totals.",
    },
    {
      id: "qm4",
      topic: "Port mirroring costs (SPAN vs TAP)",
      prompt: "Which traffic-acquisition method consumes switch forwarding resources and can impact production if oversized?",
      options: ["Passive network TAP", "SPAN port mirroring", "Promiscuous NIC mode", "API polling pull"],
      answer: 1,
      explanation: "SPAN is software copying inside the switch — oversized sources eat backplane/CPU. A TAP is external hardware and loads nothing; a promiscuous NIC only sees frames that reach it; an API pull moves JSON, not traffic.",
    },
    {
      id: "qm5",
      topic: "Baselines before anomaly alerts",
      prompt: "Before anomaly alerts mean anything, what must exist first?",
      options: ["A SIEM", "Full packet capture", "SNMPv3 everywhere", "A recorded baseline"],
      answer: 3,
      explanation: "Anomaly alerting/notification is defined as deviation from baseline metrics — no baseline, no deviation to alert on. A SIEM, full capture and SNMPv3 are all useful, but none of them defines 'normal'.",
    },
    {
      id: "qm6",
      topic: "Syslog severity scale",
      prompt: "On the syslog severity scale 0–7, which statement is correct?",
      options: ["0 is the most severe", "7 is the most severe", "All are informational", "Applies only to switches"],
      answer: 0,
      explanation: "Severity 0 = emergency, 7 = debug — lower number, worse event. Any device that can syslog has severities; treating them all as informational would drown real emergencies in debug noise.",
    },
  ];

  var QUIZ_HARD = [
    {
      id: "qh1",
      topic: "Baseline-first troubleshooting",
      prompt: "Users report a voice app degrading at 14:00 daily. Best first sequence?",
      options: [
        "Reboot the router, then capture packets all day",
        "Enable full packet capture network-wide",
        "Upgrade the WAN circuit, then re-measure",
        "Check baseline at 14:00, then flow top talkers",
      ],
      answer: 3,
      explanation: "Baseline first: is 14:00 actually abnormal? Flow top talkers then name who/what consumes the path in that window — cheap and non-disruptive. Reboots destroy evidence, network-wide capture is overkill before scope is known, and upgrading spend money without proof of cause.",
    },
    {
      id: "qh2",
      topic: "Beacon vs benign patterns",
      prompt: "Flow row: 10.20.14.217 → 203.0.113.66:443, 108 sessions in under 2 h, ~2.1 KB up / 0.4 KB down each, ~60 s apart. Classify it.",
      options: ["C2 beaconing", "Backup job", "Normal browsing", "Streaming video"],
      answer: 0,
      explanation: "Fixed-interval, near-constant-size sessions to one new external peer = beaconing (ATT&CK T1071.001 blends C2 into web traffic). Backups are bulk and scheduled, browsing is irregular and diverse, streaming is sustained high-rate video.",
    },
    {
      id: "qh3",
      topic: "TAP vs SPAN under load",
      prompt: "Payload-level capture of a 1 Gb/s uplink is needed, but the switch CPU is already stressed. Choose the acquisition method.",
      options: ["SPAN all VLANs on it", "Mirror the uplink twice", "Passive TAP on the link", "Promiscuous port on it"],
      answer: 2,
      explanation: "A passive TAP copies traffic in hardware without touching switch resources — and its fail-safe pass-through keeps the link alive if the tap loses power. SPAN of all VLANs would deepen the CPU problem; double mirroring duplicates it; a promiscuous port on the same switch never sees uplink frames not addressed to it.",
    },
    {
      id: "qh4",
      topic: "Compensating controls for legacy SNMP",
      prompt: "A legacy printer only supports SNMPv2c. Best compensating control set?",
      options: [
        "Rename printer, keep 'public' string",
        "Strong community + ACL + mgmt VLAN",
        "Disable SNMP and poll nothing",
        "Move the printer to guest Wi-Fi",
      ],
      answer: 1,
      explanation: "Where v3 is impossible: a strong community value, an ACL restricting which poller IPs may ask, and management-VLAN segmentation shrink the cleartext exposure. Renaming changes nothing, disabling removes availability monitoring, and guest Wi-Fi widens access instead of restricting it.",
    },
    {
      id: "qh5",
      topic: "Volume vs malice (change calendar)",
      prompt: "Three sustained uploads: FS1→BK1 40 GB (23:00 nightly), BK1→198.51.100.20 45 GB (02:30, change #CHG-2291), WS-FRT-217→203.0.113.66:8443 2.4 GB (03:10). Which is the exfiltration?",
      options: [
        "The nightly FS1→BK1 job",
        "All three are suspicious",
        "The BK1 vendor sync job",
        "The WS-FRT-217 upload",
      ],
      answer: 3,
      explanation: "Volume alone is not malice: FS1→BK1 is the scheduled backup in the baseline, BK1's 45 GB is the sanctioned vendor sync in the change calendar. A workstation uploading to a brand-new peer at 03:10 is the anomaly — servers have jobs, workstations shouldn't.",
    },
    {
      id: "qh6",
      topic: "Threshold tuning with p95",
      prompt: "Baseline p95 workstation egress = 410 MB/h; exfil ran ~960 MB/h from a workstation. Which tuning catches it without false pages?",
      options: [
        "450 MB/h on every subnet",
        "800 MB/h, workstations",
        "2.5 GB/h, server VLAN",
        "100 MB/h on everything",
      ],
      answer: 1,
      explanation: "800 MB/h scoped to workstations sits between normal p95 (410) and the exfil rate (960) with margin on both sides. 450 pages on ordinary users; 2.5 GB/h misses the event until far too late; 100 MB/h pages constantly — and server jobs stay out of scope.",
    },
    {
      id: "qh7",
      topic: "Containment ordering",
      prompt: "You suspect a compromised workstation. Which ordering is defensible?",
      options: [
        "Port down → block → preserve → rotate → re-image",
        "Re-image first, preserve memory later",
        "Rotate creds → email all staff → re-image → capture",
        "Block C2 → re-image → preserve memory → rotate",
      ],
      answer: 0,
      explanation: "Stop the bleeding at the access layer, cut the destination, preserve volatile evidence BEFORE destructive re-imaging, then handle the abused account (valid-account abuse, T1078). Re-imaging first destroys memory; emailing staff tips off the attacker; capturing after a re-image captures a clean machine.",
    },
  ];

  // ---------- debrief ----------
  var DETECTION_OPS = [
    { source: "SNMP", look: "Device health deltas vs baseline; trap storms (link flap, CPU thresholds)", logic: "alert if cpuPct > baseline_p95(cpu) for 15 min — or N linkDown traps within 5 min" },
    { source: "Flow data", look: "Fixed-interval sessions to one external peer; per-host egress vs p95", logic: "count flows per (src,dst) where stddev(bytes) < 10% and count > 50 in 1 h" },
    { source: "Packet capture", look: "Small fixed-size TLS sessions at regular inter-arrival; one-way upload streams", logic: "cluster client SYNs by inter-arrival delta; flag σ < 2 s with identical byte profile" },
    { source: "Syslog / SIEM", look: "4625→4624 logon chains for service accounts outside hours; correlated port flap + logon + new egress", logic: "join(Event 4625, Event 4624, same host, < 5 min, account like svc_*)" },
    { source: "API", look: "Port state changes, config drift pulled programmatically", logic: "diff(ifOperStatus, adminStatus) every 60 s; alert on unplanned adminStatus flips" },
  ];

  var MITIGATION_RECS = [
    { title: "Encrypt & authenticate the monitoring plane", detail: "SNMPv3 authPriv everywhere; retire v2c communities (where legacy forces v2c: strong string + ACL + management VLAN). Syslog over TLS on TCP 6514, not UDP 514. Rotate API tokens, scope read-only." },
    { title: "Instrument the right points", detail: "Flow export on core/edge (SW1, FW1), SPAN only where the question lives (SW3 for VLAN 20), passive TAP on saturated links." },
    { title: "Baseline then alert", detail: "7-day baseline before enabling anomaly alerting; tune thresholds between baseline p95 and attack rate; feed the change calendar into the SIEM to kill scheduled-job false positives." },
    { title: "Response readiness", detail: "Practice containment order: admin-down access port → block C2 egress → preserve volatile evidence → rotate credentials → re-image. Verify with flow data that the traffic actually stopped." },
  ];

  var BLUE_TAKEAWAYS = [
    "Every monitoring technology answers a different question — match the signal (health vs metadata vs payload vs events) to the question before instrumenting.",
    "Anomaly detection = current − baseline. Record the baseline first and keep the change calendar next to it.",
    "One 60-second beacon pattern was visible independently in flow data, packets and syslog — corroborate across sources before you alert.",
    "The monitoring plane itself is an attack surface: default SNMP communities, cleartext syslog and default API tokens all appeared in this lab's audit.",
  ];

  var RED_TAKEAWAYS = [
    "Regular beacon cadence is convenient for malware — and it is exactly what makes it detectable in flow and packet data.",
    "Bulk scheduled transfers (backups, vendor syncs) are the best camouflage for volume — defenders trust change calendars, so entries get abused.",
    "A compromised workstation 'lives' at an access switch port; monitoring placed at the right acquisition point sees what the edge firewall summary hides.",
    "Defenders' monitoring choices (v2c, UDP 514, default tokens) leak the map of what defenders can and cannot see.",
  ];

  var REFERENCES = [
    { label: "CompTIA Network+ N10-009 (official page)", url: "https://www.comptia.org/en-us/certifications/network/" },
    { label: "MITRE ATT&CK T1071.001 — Application Layer Protocol: Web Protocols", url: "https://attack.mitre.org/techniques/T1071/001/" },
    { label: "MITRE ATT&CK T1041 — Exfiltration Over C2 Channel", url: "https://attack.mitre.org/techniques/T1041/" },
    { label: "MITRE ATT&CK T1078 — Valid Accounts", url: "https://attack.mitre.org/techniques/T1078/" },
    { label: "MITRE D3FEND D3-NTA — Network Traffic Analysis", url: "https://d3fend.mitre.org/technique/d3f:NetworkTrafficAnalysis" },
  ];

  return {
    LAB_TITLE: LAB_TITLE,
    LAB_SUBTITLE: LAB_SUBTITLE,
    LAB_META: LAB_META,
    BRIEFING: BRIEFING,
    TOOL_MATCH_TOOLS: TOOL_MATCH_TOOLS,
    TOOL_MATCH_ROLES: TOOL_MATCH_ROLES,
    TOOL_MATCH_ANSWER: TOOL_MATCH_ANSWER,
    SOLUTIONS_SCENARIOS: SOLUTIONS_SCENARIOS,
    SOLUTIONS_ANSWER: SOLUTIONS_ANSWER,
    SOLUTIONS_OPTIONS: SOLUTIONS_OPTIONS,
    TOOL_MATCH_ROLE_ORDER: TOOL_MATCH_ROLE_ORDER,
    KNOWLEDGE: KNOWLEDGE,
    KNOWLEDGE_FOOTNOTE: KNOWLEDGE_FOOTNOTE,
    GLOSSARY: GLOSSARY,
    QUIZ_MEDIUM: QUIZ_MEDIUM,
    QUIZ_HARD: QUIZ_HARD,
    DETECTION_OPS: DETECTION_OPS,
    MITIGATION_RECS: MITIGATION_RECS,
    BLUE_TAKEAWAYS: BLUE_TAKEAWAYS,
    RED_TAKEAWAYS: RED_TAKEAWAYS,
    REFERENCES: REFERENCES,
  };
})();
