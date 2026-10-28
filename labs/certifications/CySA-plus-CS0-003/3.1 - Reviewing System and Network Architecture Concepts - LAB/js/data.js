// ─── CyberLab "Drafting Room" — data core (js/data.js) ───
// ALL lab content: zones, log types, telemetry samples, artifacts, stack,
// NAC devices, trust statements, segmentation rules, sequence pool, glossary,
// quiz banks and the 21 objectives with hints/feedback.
// Ported 1:1 (mechanical TypeScript strip) from src/components/archlab/content.ts.
// Synthetic training data only — fictional org "Meridian Logistics".

const LAB_META = {
  org: "MERIDIAN LOGISTICS",
  drawingNo: "DWG № CS0-003-3.1",
  title: "Network Security Architecture Survey",
  revision: "REV A — TRAINING EXERCISE",
  objective: "CS0-003 · Domain 1.0 (33%) · Objective 1.1",
  objectiveFull: "Explain the importance of system and network architecture concepts in security operations."
};
const ZONES = [
  {
    id: "edge",
    name: "Internet Edge",
    tag: "ISP HAND-OFF",
    purpose: "The single controlled boundary between Meridian and the internet. All north–south traffic must pass here.",
    devices: ["Perimeter firewall 'BRICK-1'", "IPS sensor 'SENTRY-1'", "ISP hand-off (1 Gbps)"],
    telemetry: ["firewall", "ips"],
    controls: [
      "Default-deny rulebase (explicit permits only)",
      "IPS signatures updated nightly",
      "No inbound RDP/SSH from the internet"
    ],
    risks: [
      "Single chokepoint — if it fails open, everything is exposed",
      "Zero visibility into east–west traffic inside the LAN"
    ],
    area: "edge",
    icon: "shield"
  },
  {
    id: "dmz",
    name: "DMZ",
    tag: "VLAN 5",
    purpose: "Screening buffer for internet-facing services. If the web tier is compromised, attackers still face a second wall before the LAN.",
    devices: [
      "Reverse proxy + web tier 'orders.meridianlog.example'",
      "Mail relay 'relay01'"
    ],
    telemetry: ["application"],
    controls: ["WAF in front of the web tier", "TLS everywhere", "Egress restricted to patches/DNS"],
    risks: [
      "Legacy rule still permits DMZ → SQL01:1433 'temporarily' (ticket #4412, opened 2021)",
      "Mail relay is a common pivot target"
    ],
    area: "dmz",
    icon: "shieldAlert"
  },
  {
    id: "core",
    name: "Core / Distribution",
    tag: "L3 BACKBONE",
    purpose: "Backbone that routes all inter-VLAN (east–west) traffic — the natural place for flow telemetry and routing policy.",
    devices: ["Core switch stack 'CORE-S1/S2'", "Inter-VLAN routing (Layer 3)"],
    telemetry: ["network"],
    controls: ["Inter-VLAN ACLs (partially deployed)", "DHCP snooping on distribution"],
    risks: ["Several leftover 'permit ip any any' ACL entries", "No NAC yet on access ports"],
    area: "core",
    icon: "network"
  },
  {
    id: "corporate",
    name: "Corporate LAN",
    tag: "VLANs 10 / 20 / 25",
    purpose: "Where people and their endpoints work — the largest attack surface and the richest endpoint telemetry harvest.",
    devices: [
      "Staff workstations (VLAN 10) — includes WIN-AW7",
      "Finance workstations (VLAN 20)",
      "Guest Wi-Fi (VLAN 25, internet-only by design)",
      "Forward proxy 'PXY-01'"
    ],
    telemetry: ["endpoint", "proxy"],
    controls: ["GPO baseline on all endpoints", "EDR agent fleet-wide", "802.1X planned (not enabled)"],
    risks: [
      "Guest VLAN 25 is currently routed into the LAN (should be internet-only)",
      "Personal devices appear on staff ports"
    ],
    area: "corporate",
    icon: "monitor"
  },
  {
    id: "servers",
    name: "Server Farm",
    tag: "VLAN 30",
    purpose: "Crown-jewel data systems. Should talk only to well-defined client VLANs and to management.",
    devices: [
      "SQL01 — cardholder / PCI database",
      "FILE01 — department shares",
      "DNS01 — internal DNS"
    ],
    telemetry: ["dns", "sql"],
    controls: ["Host firewalls enabled", "DB audit logging on SQL01", "Admin access only from MGMT (policy, not yet enforced)"],
    risks: [
      "Reachable today from EVERY VLAN — including the legacy lab",
      "PCI data broadens compliance blast radius"
    ],
    area: "servers",
    icon: "database"
  },
  {
    id: "mgmt",
    name: "Management VLAN",
    tag: "VLAN 99",
    purpose: "Restricted operations core: the keys to the kingdom — backups, virtualization, identity.",
    devices: [
      "Jump host 'JMP-01'",
      "Backup server 'BU-01'",
      "RADIUS / NAC server",
      "VPN concentrator",
      "Hypervisor cluster"
    ],
    telemetry: ["security"],
    controls: ["MFA on VPN and admin accounts", "No direct internet access"],
    risks: [
      "Currently reachable from every VLAN (flat management)",
      "Compromise here = compromise of everything"
    ],
    area: "mgmt",
    icon: "keyRound"
  },
  {
    id: "lab",
    name: "Legacy Lab",
    tag: "FLAT · UNSEGMENTED",
    purpose: "Leftover from a 2019 migration. A flat, bridged network bolted into the core 'temporarily'.",
    devices: [
      "Build server 'LNX-BLD1' (old Ubuntu)",
      "Test IoT devices",
      "An unclaimed print server"
    ],
    telemetry: [],
    controls: ["None — no 802.1X", "No EDR on the build server", "Shared local admin password"],
    risks: [
      "Malware here can scan and reach VLAN 30 directly",
      "Completely unmonitored blind spot — produces no telemetry at all"
    ],
    area: "lab",
    icon: "flaskConical",
    legacy: true
  }
];
const LOG_TYPES = [
  {
    id: "firewall",
    name: "Firewall",
    records: "Permitted / denied connections: src & dst IP+port, rule hit, action, timestamp.",
    detects: "Blocked scans, policy violations, unexpected outbound destinations.",
    canonicalZone: "edge",
    icon: "brick"
  },
  {
    id: "ips",
    name: "IPS / IDS",
    records: "Signature- or anomaly-based alerts (and blocks) on inspected traffic.",
    detects: "Exploit attempts and known-bad payloads at the inspection point.",
    canonicalZone: "edge",
    icon: "radar"
  },
  {
    id: "application",
    name: "Application",
    records: "Requests, errors, logins and business events emitted by the app itself.",
    detects: "Web abuse: credential stuffing, broken access control, error spikes.",
    canonicalZone: "dmz",
    icon: "appWindow"
  },
  {
    id: "endpoint",
    name: "Endpoint",
    records: "Process creation, file writes, registry changes from agents (EDR/Sysmon).",
    detects: "Malware execution, persistence (run keys), encoded PowerShell.",
    canonicalZone: "corporate",
    icon: "monitor"
  },
  {
    id: "security",
    name: "Security",
    records: "OS/identity security events: logons (4624/4625), lockouts, privilege use.",
    detects: "Brute force, anomalous logon patterns, privilege escalation.",
    canonicalZone: "mgmt",
    icon: "lock"
  },
  {
    id: "network",
    name: "Network (NetFlow)",
    records: "Flow summaries: who talked to whom, ports, bytes — no payload content.",
    detects: "Lateral movement, scanning, beaconing intervals across the interior.",
    canonicalZone: "core",
    icon: "network"
  },
  {
    id: "dns",
    name: "DNS",
    records: "Every name query: client, domain, record type, response, timestamp.",
    detects: "DNS tunneling, DGA lookups, queries to malicious domains.",
    canonicalZone: "servers",
    icon: "globe"
  },
  {
    id: "proxy",
    name: "Proxy",
    records: "Internal clients' web requests via PXY-01: URL, domain, user-agent, bytes.",
    detects: "Web C2 beaconing, uploads to cloud drops, policy bypass.",
    canonicalZone: "corporate",
    icon: "arrowLeftRight"
  },
  {
    id: "sql",
    name: "SQL",
    records: "Database audit trail: queries, logins, schema changes on SQL01.",
    detects: "Mass extraction, off-hours admin, new logins from odd hosts.",
    canonicalZone: "servers",
    icon: "database"
  }
];
const CANONICAL_TELEMETRY = Object.fromEntries(LOG_TYPES.map((l) => [l.id, l.canonicalZone]));
const HARD_PREWIRED_ERRORS = {
  proxy: "dmz",
  security: "corporate"
};
const SNIPPETS = [
  {
    id: "snip-dns",
    title: "Sample A — 02:14 UTC",
    body: "dns01 named[512]: client 10.10.4.87#5311: query: a91f.meridian-cdn-sync.example IN TXT - (len 247) — repeats every ~1s",
    correct: "dns",
    teaching: "High-entropy subdomains + TXT records every second = DNS tunneling (T1071.004). Only DNS logs see this."
  },
  {
    id: "snip-prx",
    title: "Sample B — 02:15 UTC",
    body: 'PXY-01: 10.10.4.87 → http://cdn-updates.example/px.gif 200 OK · up 512 B / down 1 KB · UA "Mozilla/4.0 (compatible; MSIE 6.0)" · repeats every 60 s',
    correct: "proxy",
    teaching: "Fixed-interval, tiny, identical GETs with an ancient user-agent = classic web beacon (T1071.001). The proxy sees it even when TLS hides content."
  },
  {
    id: "snip-edr",
    title: "Sample C — 02:16 UTC",
    body: "EDR on WIN-AW7: procstart powershell.exe -nop -w hidden -enc SQBFAFg… parent: WINWORD.EXE",
    correct: "endpoint",
    teaching: "Hidden, encoded PowerShell spawned by Word = malicious-document chain. Endpoint logs give the process lineage nothing else can."
  },
  {
    id: "snip-fw",
    title: "Sample D — 02:20 UTC",
    body: "BRICK-1 DENY 10.20.5.44:445 → 10.30.1.10:445 TCP (rule 88 default-deny) ×340 in 60 s",
    correct: "firewall",
    teaching: "An SMB flood from finance to the server farm = scanning / lateral movement attempt. Firewall logs catch the noise; NetFlow adds the full east–west map."
  }
];
const BEHAVIORS = [
  {
    id: "b1",
    text: "A workstation sends TXT queries with random subdomains to one odd domain, every second.",
    correct: "dns",
    why: "DNS-tunneling signature (T1071.004) — visible only in DNS logs."
  },
  {
    id: "b2",
    text: "A workstation fetches the same 512-byte image from the same web domain every 60 seconds.",
    correct: "proxy",
    why: "Periodic beacon (T1071.001) — the proxy records every internal web request."
  },
  {
    id: "b3",
    text: "A new unsigned EXE registers itself to start at logon and spawns on boot.",
    correct: "endpoint",
    why: "Registry persistence (T1547.001) — endpoint/EDR telemetry captures the process and registry write."
  },
  {
    id: "b4",
    text: "Massive east–west SMB chatter between two internal VLANs, never seen before.",
    correct: "network",
    alt: "firewall",
    why: "NetFlow shows the whole conversation map (who↔whom, volume); firewall denies corroborate. NetFlow is the canonical interior view."
  }
];
const ARTIFACTS = [
  {
    id: "win-reg",
    os: "win",
    title: "Registry export — HKCU Run key",
    kind: "REGISTRY",
    body: [
      "Key:   HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run",
      'Value: OneDriveSyncHelper = "C:\\Users\\awilson\\AppData\\Local\\Temp\\update_helper.exe"',
      "Note:  OneDrive's real binary lives in Program Files — not in %TEMP%."
    ].join(`
`),
    suspicious: true,
    hardOnly: false,
    note: "T1547.001 (Registry Run Keys): a Run key pointing into %TEMP% under a legitimate-sounding name. Registry auditing + endpoint logs catch this."
  },
  {
    id: "win-tr",
    os: "win",
    title: "PowerShell transcript",
    kind: "POWERSHELL",
    body: [
      "--- 2025-11-03 14:02 · awilson@MERIDIAN ---",
      'PS> Get-ADGroupMember "VPN-Users" | measure',
      "PS> Invoke-Command -ComputerName FILE01 -ScriptBlock { Get-Volume }",
      "--- transcript ends (script-block logging ON via GPO WS-SEC-BASELINE v2.3) ---"
    ].join(`
`),
    suspicious: false,
    hardOnly: false,
    note: "Routine inventory commands. Notice the GPO enabled script-block + transcript logging — that is WHY you can read this at all."
  },
  {
    id: "win-gpo",
    os: "win",
    title: "Group Policy result (gpresult /r)",
    kind: "GROUP POLICY",
    body: [
      "Applied GPOs: WS-SEC-BASELINE v2.3 · WS-LAPS-ROTATION · WS-FW-HOST",
      "Settings: UAC=On · PS script-block logging=On · BitLocker=On · LAPS=On",
      "Last applied: 2025-11-01 06:00 (domain MERIDIANLOG)"
    ].join(`
`),
    suspicious: false,
    hardOnly: false,
    note: "Group Policy is how Windows baselines scale — one object, thousands of hosts. A healthy, expected result."
  },
  {
    id: "win-task",
    os: "win",
    title: "Scheduled task export",
    kind: "TASK SCHEDULER",
    body: [
      "TaskName: \\GoogleUpdateTaskMachineCore",
      'Run:      "C:\\Program Files (x86)\\Google\\Update\\GoogleUpdate.exe" /c',
      "Trigger:  daily 09:17 · Signer: Google LLC (valid)"
    ].join(`
`),
    suspicious: false,
    hardOnly: false,
    note: 'Signed binary in Program Files on a daily schedule = normal update task. Confidently judging "normal" is a skill too.'
  },
  {
    id: "win-wmi",
    os: "win",
    title: "WMI permanent subscription",
    kind: "WMI",
    body: [
      `__EventFilter:  "SystemHealthMonitor"  WHERE TargetInstance ISA 'Win32_LogonSession'`,
      'Consumer:       CommandLineEventConsumer "HealthPing"',
      "CommandLine:    powershell.exe -nop -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGo…",
      "Binding:        Filter → Consumer"
    ].join(`
`),
    suspicious: true,
    hardOnly: true,
    note: "T1546.003 (WMI Event Subscription): fires encoded PowerShell at every logon. Lives in the CIM repository, invisible to a directory listing. WMI + endpoint logs expose it."
  },
  {
    id: "win-logons",
    os: "win",
    title: "Security log excerpt (4625 / 4624)",
    kind: "SECURITY LOG",
    body: [
      "02:11  4625  awilson  src 10.10.4.87  (failed, 0xC000006A)",
      "02:11  4625  awilson  src 10.10.4.87  (failed, 0xC000006A)",
      "02:12  4624  awilson  src 10.10.4.87  (success — Logon Type 10, RDP via JMP-01)"
    ].join(`
`),
    suspicious: false,
    hardOnly: true,
    note: "Two typos then success from the jump host = a human, not a spray (no rotation, short window, matching context). Context beats pattern-matching."
  }
];
const LINUX_MODULES = [
  { name: "xfs", size: "245760", usedBy: "3" },
  { name: "crc32c", size: "16384", usedBy: "1" },
  { name: "usb_storage", size: "77824", usedBy: "0" },
  { name: "binfmt_misc", size: "24576", usedBy: "1" },
  { name: "khidnet", size: "16384", usedBy: "0", rogue: true },
  { name: "i2c_core", size: "57344", usedBy: "4" }
];
const LIN_JUST_OPTIONS = [
  {
    id: "j1",
    label: "Enforcing blocks unauthorized actions (loading modules, writing protected paths) at the kernel — instead of only logging them."
  },
  { id: "j2", label: "Permissive mode uses less CPU, which is the main benefit." },
  { id: "j3", label: "SELinux replaces the need for backups." },
  { id: "j4", label: "Disabled mode is recommended for build servers." }
];
const STACK_LAYERS = [
  {
    id: "l1",
    label: "1 · Perimeter",
    desc: "The internet boundary — what is allowed in or out at all.",
    correctControl: "c-fwips"
  },
  {
    id: "l2",
    label: "2 · Network interior",
    desc: "How traffic moves between zones once inside.",
    correctControl: "c-seg"
  },
  {
    id: "l3",
    label: "3 · Identity & access",
    desc: "Who may connect, and to what, on every request.",
    correctControl: "c-id"
  },
  {
    id: "l4",
    label: "4 · Endpoint",
    desc: "The hosts themselves — hardened and watched.",
    correctControl: "c-endpoint"
  },
  {
    id: "l5",
    label: "5 · Application",
    desc: "The code users actually drive.",
    correctControl: "c-app"
  },
  {
    id: "l6",
    label: "6 · Data",
    desc: "The crown jewels at the center.",
    correctControl: "c-data"
  }
];
const STACK_CONTROLS = [
  { id: "c-fwips", label: "Default-deny perimeter firewall + IPS", why: "Layer 1: filters north–south traffic at the boundary." },
  { id: "c-seg", label: "VLAN segmentation + micro-segmentation (ACLs)", why: "Layer 2: limits east–west blast radius between zones." },
  { id: "c-id", label: "802.1X NAC + MFA + least privilege", why: "Layer 3: proves identity and health before granting access." },
  { id: "c-endpoint", label: "EDR + hardened OS baseline (GPO / SELinux)", why: "Layer 4: hardens and watches each host." },
  { id: "c-app", label: "WAF + rapid patching", why: "Layer 5: shields and maintains the application code." },
  { id: "c-data", label: "Encryption at rest + DLP + tested backups", why: "Layer 6: protects the data even if other layers fail." },
  { id: "c-siem", label: "SIEM correlation dashboards", why: "Valuable — but it MONITORS the layers; it is not one of the six defense layers here." },
  { id: "c-training", label: "Annual awareness slide deck", why: "A people control, not an architecture layer — and annual-only is weak." },
  { id: "c-honeypot", label: "A honeypot on every VLAN", why: "Deception can help, but sprinkling honeypots everywhere is not the control that defines these layers." },
  { id: "c-cloud", label: '"Move everything to the cloud"', why: "Migration is not a control — the cloud still needs every one of these layers." },
  { id: "c-ups", label: "Bigger UPS units", why: "Availability infrastructure, not a security layer for this stack." },
  { id: "c-print", label: "Biometric printer locks", why: "A single-device lock is not an architecture layer." }
];
const ACCESS_DEVICES = [
  {
    id: "d1",
    name: "Laptop LT-2210",
    facts: ["Meridian asset tag verified", "Valid 802.1X certificate", "EDR healthy, patches current"],
    correct: "allow",
    why: "Known device + healthy posture → full access with zero friction. This is NAC working as intended."
  },
  {
    id: "d2",
    name: "Laptop LT-1177",
    facts: ["Valid certificate", "EDR signatures 34 days stale", "3 critical patches missing"],
    correct: "quarantine",
    why: "Known device, unhealthy posture → remediation VLAN until fixed. NAC is not only allow/deny."
  },
  {
    id: "d3",
    name: "Unknown device — port j-12/4",
    facts: ["No 802.1X supplicant", "MAC not in inventory", "Plugged in at the warehouse"],
    correct: "deny",
    why: "No identity, no posture → deny and alert. This is how rogue devices get stopped at the wall plate."
  },
  {
    id: "d4",
    name: "Contractor tablet CT-08",
    facts: ["Valid GUEST certificate", "Requests internet on VLAN 25 only"],
    correct: "allow",
    why: "Scoped certificate matching a scoped request — least privilege in action."
  }
];
const TRUST_STATEMENTS = [
  {
    id: "t1",
    text: "Verify explicitly — check identity, device health and context on every request.",
    zt: true,
    why: "Core principle #1 of zero trust."
  },
  {
    id: "t2",
    text: "Once a device is on the VPN, it is inside the castle and may roam freely.",
    zt: false,
    why: "The classic perimeter myth zero trust rejects — network location is not identity."
  },
  {
    id: "t3",
    text: "Grant least privilege — the minimum access needed, for the minimum time.",
    zt: true,
    why: "Core principle #2 of zero trust."
  },
  {
    id: "t4",
    text: "A flat network is safer because there are fewer rules to misconfigure.",
    zt: false,
    why: "Flat = unlimited blast radius. Fewer rules is not fewer risks."
  },
  {
    id: "t5",
    text: "Assume breach — segment so one compromised host cannot reach everything.",
    zt: true,
    why: "Core principle #3 of zero trust."
  },
  {
    id: "t6",
    text: "With good endpoint antivirus everywhere, network segmentation is unnecessary.",
    zt: false,
    why: "Single-layer thinking. Defense in depth requires layers exactly because any one control can fail."
  }
];
const SEG_RULES = [
  {
    id: "r1",
    label: "VLAN 10/20 (corporate + finance) → SQL01:1433",
    note: "Business-critical client path. Keep.",
    defaultOn: true,
    mustStayOn: true
  },
  {
    id: "r2",
    label: "VLAN 99 (management) → server-farm admin ports",
    note: "Admin path via jump host. Keep.",
    defaultOn: true,
    mustStayOn: true
  },
  {
    id: "r3",
    label: "VLAN 5 (DMZ) → SQL01:1433",
    note: "Legacy 'temporary' rule from ticket #4412 (2021). The DMZ should never reach the database directly.",
    defaultOn: true,
    mustStayOn: false
  },
  {
    id: "r4",
    label: "VLAN 25 (guest) → server farm",
    note: "Guests are internet-only by design. This must go.",
    defaultOn: true,
    mustStayOn: false
  },
  {
    id: "r5",
    label: "Legacy lab → SQL01 / FILE01",
    note: "The flat lab bridge. Compliance-critical to remove (PCI).",
    defaultOn: true,
    mustStayOn: false
  }
];
const SEQUENCE_POOL = [
  { id: "a-iso", label: "Use EDR to isolate WIN-AW7 from the network" },
  { id: "a-block", label: "Block meridian-cdn-sync.example + the C2 IP at proxy/firewall" },
  { id: "a-mem", label: "Capture AW7 memory (volatile evidence) before any re-image" },
  { id: "a-logs", label: "Preserve & export proxy, DNS and endpoint logs" },
  { id: "a-cred", label: "Reset AW7's user credentials + review active sessions" },
  { id: "a-reimage", label: "Re-image AW7 immediately (fastest fix!)" },
  { id: "a-staff", label: "Email all staff asking if anything seems weird" }
];
const SEQUENCE_CORRECT = ["a-iso", "a-block", "a-mem", "a-logs", "a-cred"];
const GLOSSARY = [
  { id: "g-attack-surface", term: "Attack surface", def: "Every point where an attacker could try to enter or extract data." },
  { id: "g-baseline", term: "Baseline", def: "The documented, enforced 'normal' configuration of systems (e.g., via Group Policy)." },
  { id: "g-did", term: "Defense in depth", def: "Multiple independent layers of control so a single failure is not fatal." },
  { id: "g-dmz", term: "DMZ", def: "A buffer network for internet-facing services, isolated from the LAN." },
  { id: "g-eastwest", term: "East–west traffic", def: "Traffic between systems inside the network (vs north–south, in and out)." },
  { id: "g-8021x", term: "802.1X", def: "Port-based network access control: a device must authenticate before the switch port opens." },
  { id: "g-leastpriv", term: "Least privilege", def: "Grant the minimum access needed, for the minimum time needed." },
  { id: "g-microseg", term: "Micro-segmentation", def: "Enforcing policy down to individual workloads/hosts, not just the network edge." },
  { id: "g-nac", term: "NAC", def: "Network access control — decides whether a device may connect, and where, based on identity and health." },
  { id: "g-netflow", term: "NetFlow", def: "Router/switch summaries of conversations (who talked to whom, ports, bytes) without payloads." },
  { id: "g-posture", term: "Posture check", def: "Verifying a device's health (patches, AV, encryption) before granting access." },
  { id: "g-seg", term: "Segmentation", def: "Dividing the network into isolated zones to limit blast radius." },
  { id: "g-telemetry", term: "Telemetry", def: "The logs and events a system emits — the raw material of detection." },
  { id: "g-zt", term: "Zero trust", def: "Verify explicitly, least privilege, assume breach — no implicit trust by network location." }
];
const QUIZ_MEDIUM = [
  {
    id: "qm1",
    question: "A DMZ is best described as…",
    options: [
      { id: "a", text: "A screening buffer for internet-facing services, isolated from the LAN" },
      { id: "b", text: "A quarantine VLAN where compromised laptops are wiped and reimaged" },
      { id: "c", text: "A storage tier where encrypted backups are staged before offsite transfer" },
      { id: "d", text: "A trusted management segment where firewall admin consoles are hosted" }
    ],
    correct: "a",
    explanation: "The DMZ exists so a compromised internet-facing service still faces a second wall before the LAN — segmentation as containment."
  },
  {
    id: "qm2",
    question: "Suspicious bursts of TXT-record subdomain queries are best caught by…",
    options: [
      { id: "a", text: "SQL audit logs" },
      { id: "b", text: "DNS logs" },
      { id: "c", text: "Application logs" },
      { id: "d", text: "Endpoint logs" }
    ],
    correct: "b",
    explanation: "Only the DNS server sees every query — the signature of DNS tunneling (T1071.004). Matching the evidence to the log source that records it is the core 1.1 skill."
  },
  {
    id: "qm3",
    question: "Which Windows mechanism centrally enforces the endpoint security baseline across thousands of machines?",
    options: [
      { id: "a", text: "Group Policy" },
      { id: "b", text: "Task Scheduler" },
      { id: "c", text: "The Registry itself" },
      { id: "d", text: "BitLocker To Go" }
    ],
    correct: "a",
    explanation: "Group Policy (GPOs) distributes and enforces baselines domain-wide — one object, thousands of hosts."
  },
  {
    id: "qm4",
    question: "Which SELinux mode BLOCKS policy violations instead of only logging them?",
    options: [
      { id: "a", text: "Permissive" },
      { id: "b", text: "Disabled" },
      { id: "c", text: "Enforcing" },
      { id: "d", text: "Standby" }
    ],
    correct: "c",
    explanation: "Enforcing = kernel denies the action. Permissive = logs only. Disabled = no SELinux at all."
  },
  {
    id: "qm5",
    question: "An 802.1X posture check primarily decides…",
    options: [
      { id: "a", text: "How much bandwidth the device may consume on the link" },
      { id: "b", text: "Whether the device joins, and where, by identity and health" },
      { id: "c", text: "Whether the device needs its disk encrypted before users log in" },
      { id: "d", text: "Which firewall rules apply between the device and the internet" }
    ],
    correct: "b",
    explanation: "NAC combines identity (certificate/credentials) with posture (health) to admit, quarantine or deny a device."
  },
  {
    id: "qm6",
    question: '"Multiple independent layers of control, so one failure is not fatal" is the definition of…',
    options: [
      { id: "a", text: "Zero trust" },
      { id: "b", text: "Network address translation" },
      { id: "c", text: "NetFlow" },
      { id: "d", text: "Defense in depth" }
    ],
    correct: "d",
    explanation: "Defense in depth is the layered-security principle your LESSON_DETAIL highlights — architecture provides the layers."
  },
  {
    id: "qm7",
    question: "In a zero-trust design, a user who authenticated this morning should…",
    options: [
      { id: "a", text: "Keep full trust for the rest of the workday" },
      { id: "b", text: "Re-verify identity and posture at each sensitive request" },
      { id: "c", text: "Trust the other devices that share their VLAN" },
      { id: "d", text: "Disable MFA to make daily sign-ins faster" }
    ],
    correct: "b",
    explanation: "Zero trust never converts one authentication into standing trust — verification is continuous and per-request."
  }
];
const QUIZ_HARD = [
  {
    id: "qh1",
    scenario: "02:00 — NetFlow shows LNX-BLD1 (legacy lab) sweeping VLAN 30.",
    question: "Your FIRST containment action?",
    options: [
      { id: "a", text: "Re-image every server in VLAN 30 as a precaution" },
      { id: "b", text: "Bridge the lab off VLAN 30 at the core" },
      { id: "c", text: "Email all staff asking about unusual activity" },
      { id: "d", text: "Disable NetFlow collection to reduce the noise" }
    ],
    correct: "b",
    explanation: "Cut the attack path first (segmentation is your containment tool), then investigate. Everything else loses evidence or time."
  },
  {
    id: "qh2",
    scenario: "Proxy logs show WIN-AW7 beaconing to meridian-cdn-sync.example.",
    question: "Which source corroborates FASTEST with process lineage?",
    options: [
      { id: "a", text: "Endpoint / EDR logs on AW7" },
      { id: "b", text: "The SQL audit trail" },
      { id: "c", text: "The DHCP lease file" },
      { id: "d", text: "The firewall deny log for that hour" }
    ],
    correct: "a",
    explanation: "Only endpoint telemetry answers WHO ran WHAT (process tree, T1059.001). Each log source has a job — pick the one that fits the question."
  },
  {
    id: "qh3",
    scenario: "A warehouse manager reports an unknown laptop in a wall plate.",
    question: "Which control most directly stops this class of attack?",
    options: [
      { id: "a", text: "Web application firewall" },
      { id: "b", text: "Full-disk encryption" },
      { id: "c", text: "802.1X port authentication" },
      { id: "d", text: "DLP on email" }
    ],
    correct: "c",
    explanation: "802.1X makes the switch port itself demand identity — no supplicant, no network. The uninvited device never gets an IP."
  },
  {
    id: "qh4",
    scenario: 'gpresult shows "PowerShell script-block logging = Disabled" on one workstation (all others: On).',
    question: "The real risk is…",
    options: [
      { id: "a", text: "Slower PowerShell execution on that host because every command is transcribed" },
      { id: "c", text: "Scripts would run with reduced privileges on that host" },
      { id: "d", text: "The workstation would fail its next patch compliance scan" },
      { id: "b", text: "Encoded PowerShell would leave no script evidence to review later" }
    ],
    correct: "b",
    explanation: "Baseline drift on ONE host is a detection gap exactly where attackers look. Re-apply the GPO and investigate why it drifted."
  },
  {
    id: "qh5",
    scenario: "SQL audit: a new login 'svc_build' from the legacy lab read 4,000,000 rows at 03:00.",
    question: "Best interpretation + response?",
    options: [
      { id: "b", text: "Likely staged exfiltration: segment the path, disable the login, preserve evidence" },
      { id: "a", text: "Normal ETL for that service account, no action needed" },
      { id: "c", text: "A backup job reading its dataset; verify the schedule and close" },
      { id: "d", text: "Delete the audit entries to save storage space" }
    ],
    correct: "b",
    explanation: "New login + off-hours + bulk reads + forbidden origin = classic staged exfiltration. Kill the path, kill the credential, keep the evidence."
  },
  {
    id: "qh6",
    scenario: "You are mapping the design against zero-trust maturity.",
    question: "Which finding is a GENUINE zero-trust violation?",
    options: [
      { id: "a", text: "MFA is enforced on the VPN and all admin accounts" },
      { id: "c", text: "PCI systems are micro-segmented with distributed ACLs and host firewalls" },
      { id: "d", text: "Backups run nightly and are restore-tested every quarter" },
      { id: "b", text: "Management VLAN reachable from guest Wi-Fi without a jump path" }
    ],
    correct: "b",
    explanation: "Implicit trust granted by network location (guest → management) is the exact pattern zero trust exists to destroy."
  },
  {
    id: "qh7",
    scenario: 'Change request: open DMZ → SQL01:1433 "for reporting".',
    question: "Best response as the security architect?",
    options: [
      { id: "a", text: "Approve it, since only one port is affected" },
      { id: "c", text: "Approve it and disable SQL audit logging for speed" },
      { id: "b", text: "Deny as designed; offer a read replica or brokered query instead" },
      { id: "d", text: "Approve with compensating controls: an IDS signature and a weekly review" }
    ],
    correct: "b",
    explanation: "Preserve the segmentation principle, meet the business need another way. Architecture controls are policy, not obstacles."
  }
];
const OBJECTIVES_MEDIUM = [
  {
    id: "M1",
    mode: "medium",
    pillar: "P1",
    sheet: "blueprint",
    title: "Walk the blueprint",
    task: "Open the inspector for all 7 zones, then answer: what role does the DMZ play in this architecture?",
    anchor: "Network security concepts — segmentation & DMZ (CS0-003 1.1)",
    hints: {
      nudge: "The blueprint is on the Blueprint sheet — every zone card is clickable.",
      direction: "Click each of the 7 zones once (visited zones get a check mark), then use the DMZ selector on this card.",
      demo: "Open Edge → DMZ → Core → Corporate → Servers → Mgmt → Lab; then pick option A: the DMZ is a screening buffer walled off from the LAN."
    },
    feedback: "You can now describe every zone and the DMZ's containment role — architecture knowledge is the map analysts navigate incidents with.",
    choices: [
      {
        items: [
          {
            key: "m1-dmz",
            prompt: "The DMZ is…",
            options: [
              { id: "buffer", label: "A screening buffer: internet-facing services, walled off from the LAN" },
              { id: "storage", label: "A quarantine segment where compromised devices are wiped and rebuilt" },
              { id: "vault", label: "A storage tier for staging encrypted nightly backups" },
              { id: "guest", label: "A management segment hosting firewall admin consoles" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "M2",
    mode: "medium",
    pillar: "P1",
    sheet: "defense",
    title: "Build the defense-in-depth stack",
    task: "Assign exactly one control to each of the six layers, from perimeter to data.",
    anchor: "Defense in depth — the layered-security theme of Lesson 3.1",
    hints: {
      nudge: "The Defense Stack is on the Defense & Access sheet.",
      direction: 'Each layer has one matching control among the 12 options — think "what would this layer exist to do?"',
      demo: "Perimeter→firewall+IPS · Interior→segmentation · Identity→NAC+MFA · Endpoint→EDR+baseline · Application→WAF+patching · Data→encryption+DLP."
    },
    feedback: "Six independent layers, each covering the others' failure — that is defense in depth: one breach should never equal total compromise."
  },
  {
    id: "M3",
    mode: "medium",
    pillar: "P2",
    sheet: "blueprint",
    title: "Wire perimeter telemetry",
    task: "Connect the Firewall, IPS/IDS and Network (NetFlow) modules to the zones that produce them.",
    anchor: "Log types — firewall, IPS/IDS, network (CS0-003 1.1)",
    hints: {
      nudge: "The Telemetry Rack sits under the zone map on the Blueprint sheet.",
      direction: "Zone inspectors list exactly which telemetry each zone produces — match three modules.",
      demo: "Firewall→Internet Edge · IPS→Internet Edge · NetFlow→Core/Distribution."
    },
    feedback: "Perimeter chokepoint and interior routing are wired. NetFlow on the core is your east–west radar — firewalls alone never see lateral movement."
  },
  {
    id: "M4",
    mode: "medium",
    pillar: "P2",
    sheet: "blueprint",
    title: "Wire the interior telemetry",
    task: "Connect the remaining six modules: Application, Endpoint, Proxy, DNS, SQL and Security logs.",
    anchor: "Log types — application, endpoint, proxy, DNS, SQL, security (CS0-003 1.1)",
    hints: {
      nudge: "Same rack — six modules left.",
      direction: 'Ask "what box WRITES this log?" — the app in the DMZ, workstations for endpoint/proxy, DNS01 & SQL01 in the server farm, identity in MGMT.',
      demo: "Application→DMZ · Endpoint→Corporate · Proxy→Corporate · DNS→Servers · SQL→Servers · Security→Management."
    },
    feedback: "All nine log types now report from their true sources. Analysts who know where evidence is born investigate in minutes, not hours."
  },
  {
    id: "M5",
    mode: "medium",
    pillar: "P2",
    sheet: "hosts",
    title: "Triage the Windows host (WIN-AW7)",
    task: "In the evidence drawer, judge each visible Windows artifact as Suspicious or Normal.",
    anchor: "Windows OS security — Registry, PowerShell logging, Group Policy (CS0-003 1.1)",
    hints: {
      nudge: "The Host Evidence sheet has a Windows / Linux tab switch.",
      direction: "Read WHERE each binary lives and WHO signed it. %TEMP% paths and look-alike names deserve suspicion.",
      demo: "The Run key pointing into %TEMP% is the suspicious one; transcript, gpresult and the signed task are routine."
    },
    feedback: "You judged artifacts by context — location, signer, expectation. That habit catches T1547.001-style persistence without a single alert."
  },
  {
    id: "M6",
    mode: "medium",
    pillar: "P2",
    sheet: "hosts",
    title: "Harden the Linux host (LNX-BLD1)",
    task: "Set SELinux to Enforcing, flag the rogue kernel module for removal, and fix deploy.key's permissions.",
    anchor: "Linux/macOS OS security — SELinux, kernel modules, filesystem permissions (CS0-003 1.1)",
    hints: {
      nudge: "The Linux tab shows getenforce, lsmod and the file card.",
      direction: 'Enforcing is one switch; look for a module matching no vendor driver with "Used by 0"; private keys want 600.',
      demo: "Set Enforcing · flag khidnet · chmod 600 on /srv/build/deploy.key."
    },
    feedback: "SELinux Enforcing, rogue module (T1547.006) flagged, key locked to 600 — the three Linux hygiene moves this exam expects you to know."
  },
  {
    id: "M7",
    mode: "medium",
    pillar: "P3",
    sheet: "blueprint",
    title: "Tag the raw samples",
    task: "Four telemetry samples arrived. Tag each with the log type that produced it.",
    anchor: "Log types in practice — recognizing sources from raw evidence (CS0-003 1.1)",
    hints: {
      nudge: "The Snippet Tray is at the bottom of the Blueprint sheet.",
      direction: "Named hosts give it away: dns01 → DNS logs, PXY-01 → proxy, EDR on a workstation → endpoint, BRICK-1 → firewall.",
      demo: "A=DNS · B=Proxy · C=Endpoint · D=Firewall."
    },
    feedback: "Source identification from raw lines is the daily bread of a SOC analyst — and the first step of every detection you will ever write."
  },
  {
    id: "M8",
    mode: "medium",
    pillar: "P3",
    sheet: "blueprint",
    title: "Match behavior to sensor",
    task: "For each of the four behaviors, choose the single best log source that would catch it.",
    anchor: "Detection planning — data sources per behavior (CS0-003 1.1 + ATT&CK data sources)",
    hints: {
      nudge: "The four Behavior selects are on this card.",
      direction: "Think where the evidence is BORN: name queries → DNS; web fetches → proxy; process/registry → endpoint; interior flows → NetFlow.",
      demo: "1→DNS · 2→Proxy · 3→Endpoint · 4→Network (NetFlow)."
    },
    feedback: "You just did coverage planning: each attacker behavior maps to a sensor. A log source with no behavior, or a behavior with no sensor, is a gap."
  },
  {
    id: "M9",
    mode: "medium",
    pillar: "P4",
    sheet: "defense",
    title: "Work the NAC queue",
    task: "Decide Allow / Quarantine / Deny for each of the four devices in the access console.",
    anchor: "Network access control — 802.1X & posture checks (CS0-003 1.1)",
    hints: {
      nudge: "The Access Console is on the Defense & Access sheet.",
      direction: "Identity first, health second: unknown → deny; known+unhealthy → quarantine; known+healthy+scoped → allow.",
      demo: "LT-2210→Allow · LT-1177→Quarantine · Unknown→Deny · CT-08→Allow."
    },
    feedback: "You admitted, remediated and rejected — the three NAC outcomes. Notice quarantine keeps productivity while denying stops strangers cold."
  },
  {
    id: "M10",
    mode: "medium",
    pillar: "P4",
    sheet: "defense",
    title: "Separate zero trust from myth",
    task: "Select the THREE statements that are genuine zero-trust principles (the other three are perimeter-era myths).",
    anchor: "Zero trust — verify explicitly, least privilege, assume breach (CS0-003 1.1)",
    hints: {
      nudge: "The Trust Sort panel is on the Defense & Access sheet.",
      direction: 'Myths grant trust by LOCATION ("inside the castle", "flat is fine", "AV replaces segmentation").',
      demo: "Pick t1 (verify explicitly), t3 (least privilege), t5 (assume breach)."
    },
    feedback: "Verify explicitly · least privilege · assume breach. If a sentence grants trust because of where something IS, it is a myth."
  },
  {
    id: "M11",
    mode: "medium",
    pillar: "P4",
    sheet: "blueprint",
    title: "Apply the segmentation fix",
    task: "In the Server Farm inspector, apply the proposed VLAN 30 policy: keep the corporate and management paths, cut DMZ, guest and lab.",
    anchor: "Segmentation — VLANs, DMZ isolation, blast radius (CS0-003 1.1)",
    hints: {
      nudge: "Open the Server Farm zone — the policy panel is inside its inspector.",
      direction: "Five toggles: r1 and r2 stay ON; r3, r4 and r5 go OFF.",
      demo: "Corporate→ON · Mgmt→ON · DMZ→OFF · Guest→OFF · Lab→OFF."
    },
    feedback: `Blast radius cut: the DMZ, guests and the flat lab can no longer touch crown jewels. This one panel is the lesson's "why architecture matters" made real.`
  },
  {
    id: "M12",
    mode: "medium",
    pillar: "P1",
    sheet: "brief",
    title: "Vocabulary lock-in",
    task: "Match the four key architecture terms to their definitions.",
    anchor: "Chapter vocabulary — defense in depth, segmentation, NAC, zero trust",
    hints: {
      nudge: "The Reference Shelf (Sheet 1) holds all four definitions.",
      direction: "Layers→depth · zones→segmentation · device admission→NAC · no implicit trust→zero trust.",
      demo: "Defense in depth→layers · Segmentation→isolated zones · NAC→admit by identity+health · Zero trust→verify every request."
    },
    feedback: "Exam vocabulary locked. These four terms carry a large share of objective 1.1's conceptual weight.",
    choices: [
      {
        items: [
          {
            key: "m12-did",
            prompt: "Defense in depth",
            options: [
              { id: "d-zt", label: "No implicit trust by network location; verify every request" },
              { id: "d-layers", label: "Multiple independent control layers, so one failure is not fatal" },
              { id: "d-zones", label: "Dividing the network into isolated zones that cap blast radius" },
              { id: "d-nac", label: "Admitting devices onto the network based on identity and health" }
            ]
          },
          {
            key: "m12-seg",
            prompt: "Segmentation",
            options: [
              { id: "d-nac", label: "Admitting devices onto the network based on identity and health" },
              { id: "d-zt", label: "No implicit trust by network location; verify every request" },
              { id: "d-zones", label: "Dividing the network into isolated zones that cap blast radius" },
              { id: "d-layers", label: "Multiple independent control layers, so one failure is not fatal" }
            ]
          },
          {
            key: "m12-nac",
            prompt: "NAC",
            options: [
              { id: "d-layers", label: "Multiple independent control layers, so one failure is not fatal" },
              { id: "d-zt", label: "No implicit trust by network location; verify every request" },
              { id: "d-zones", label: "Dividing the network into isolated zones that cap blast radius" },
              { id: "d-nac", label: "Admitting devices onto the network based on identity and health" }
            ]
          },
          {
            key: "m12-zt",
            prompt: "Zero trust",
            options: [
              { id: "d-nac", label: "Admitting devices onto the network based on identity and health" },
              { id: "d-layers", label: "Multiple independent control layers, so one failure is not fatal" },
              { id: "d-zt", label: "No implicit trust by network location; verify every request" },
              { id: "d-zones", label: "Dividing the network into isolated zones that cap blast radius" }
            ]
          }
        ]
      }
    ]
  }
];
const OBJECTIVES_HARD = [
  {
    id: "H1",
    mode: "hard",
    pillar: "P1",
    sheet: "blueprint",
    title: "Architecture audit",
    task: "Three-part verdict from the blueprint: (1) the zone that is Meridian's biggest flat-network risk, (2) the compliance-critical path that must not exist, (3) the single most impactful architectural change.",
    anchor: "Segmentation & compliance blast radius (CS0-003 1.1)",
    hints: {
      nudge: 'Walk the zone inspectors yourself — the answers live in "risks".',
      direction: "Which zone produces no telemetry AND touches VLAN 30? What is PCI-relevant? What one change kills both?",
      demo: "Lab zone · lab→SQL01 (PCI) path · micro-segment VLAN 30 / cut the lab bridge."
    },
    feedback: "The flat lab bridge is the keystone risk: unmonitored, unsegmented, and touching PCI. One architectural change collapses three findings.",
    choices: [
      {
        items: [
          {
            key: "audit-zone",
            prompt: "1 · Biggest flat-network risk",
            options: [
              { id: "z-lab", label: "The legacy lab (flat, unmonitored)" },
              { id: "z-dmz", label: "The DMZ screening buffer" },
              { id: "z-mgmt", label: "The management VLAN (VLAN 99)" },
              { id: "z-core", label: "The core switch stack (L3 backbone)" }
            ]
          },
          {
            key: "audit-path",
            prompt: "2 · Forbidden compliance path",
            options: [
              { id: "p-guest-mail", label: "Guest Wi-Fi traffic can reach the mail relay" },
              { id: "p-dmz-file", label: "The DMZ can reach FILE01" },
              { id: "p-lab-sql", label: "The legacy lab can reach SQL01 (PCI) directly" },
              { id: "p-vpn-print", label: "VPN users can ping the printer" }
            ]
          },
          {
            key: "audit-change",
            prompt: "3 · Most impactful change",
            options: [
              { id: "c-ips2", label: "Buy and deploy a second perimeter IPS appliance" },
              { id: "c-dnscloud", label: "Move DNS resolution to a cloud provider" },
              { id: "c-guestoff", label: "Disable the guest Wi-Fi network entirely" },
              { id: "c-microseg", label: "Micro-segment VLAN 30 and cut the lab bridge" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "H2",
    mode: "hard",
    pillar: "P3",
    sheet: "blueprint",
    title: "Telemetry integrity check",
    task: "Your predecessor pre-wired the rack. Audit all nine modules against the zone inspectors, then fix every mis-wired source at its true home.",
    anchor: "Log sources & detection coverage — misconfigured telemetry (CS0-003 1.1)",
    hints: {
      nudge: "Compare each module's assigned zone with the telemetry listed in that zone's inspector.",
      direction: "Two modules sit in zones that would never produce them. Ask: who WRITES forward-proxy lines? Who writes 4625s?",
      demo: "Proxy belongs to the Corporate LAN (PXY-01 serves staff); Security events belong to Management (identity/auth)."
    },
    feedback: "Mis-wired telemetry is a silent detection gap: analysts hunt in logs that never record the crime. Coverage audits belong in change review."
  },
  {
    id: "H3",
    mode: "hard",
    pillar: "P2",
    sheet: "hosts",
    title: "Deep-dive WIN-AW7",
    task: "The drawer shows SIX artifacts (two more than usual). Flag every malicious artifact, name the ATT&CK tactic, and attribute one technique ID.",
    anchor: "Windows OS security — Registry run keys + WMI subscriptions (T1547.001 / T1546.003)",
    hints: {
      nudge: "Two artifacts use mechanisms that survive reboots without touching disk.",
      direction: "The %TEMP% Run key is one. Find the second persistence mechanism hiding in a WMI card, then classify.",
      demo: "Flag the Run key AND the WMI subscription; tactic = Persistence; technique T1547.001 or T1546.003."
    },
    feedback: "Run keys and WMI subscriptions are the classic persistence pair (T1547.001 / T1546.003) — both rely on Windows mechanisms your baseline (GPO) can audit and restrict.",
    choices: [
      {
        items: [
          {
            key: "win-tactic",
            prompt: "ATT&CK tactic",
            options: [
              { id: "ta-persist", label: "Persistence" },
              { id: "ta-exec", label: "Execution" },
              { id: "ta-defense", label: "Defense Evasion" },
              { id: "ta-lateral", label: "Lateral Movement" },
              { id: "ta-initial", label: "Initial Access" }
            ]
          },
          {
            key: "win-tech",
            prompt: "Technique ID (exact ATT&CK format)",
            options: []
          }
        ]
      }
    ]
  },
  {
    id: "H4",
    mode: "hard",
    pillar: "P2",
    sheet: "hosts",
    title: "Deep-dive LNX-BLD1",
    task: "Name the rogue kernel module exactly, give its ATT&CK technique ID, restore the host to hardened state, and pick the correct justification for SELinux Enforcing.",
    anchor: "Linux/macOS OS security — kernel modules (T1547.006), SELinux, permissions",
    hints: {
      nudge: "One lsmod entry matches no vendor driver.",
      direction: "Module: kh-something. Technique: Kernel Modules and Extensions. Then set Enforcing, flag it, chmod the key.",
      demo: "khidnet · T1547.006 · Enforcing + flag + chmod 600 · justification J1."
    },
    choices: [
      {
        items: [
          {
            key: "lin-module",
            prompt: "Rogue kernel module — exact name as shown in lsmod",
            options: []
          },
          {
            key: "lin-tech",
            prompt: "ATT&CK technique",
            options: [
              { id: "tech-kmod", label: "T1547.006: Kernel Modules and Extensions" },
              { id: "tech-runkey", label: "T1547.001: Registry Run Keys / Startup Folder" },
              { id: "tech-wmi", label: "T1546.003: WMI Event Subscription" },
              { id: "tech-dns", label: "T1071.004: DNS Protocol" }
            ]
          }
        ]
      }
    ],
    feedback: "A rootkit-style kernel module (T1547.006) in a blind-spot zone with a world-writable key: exactly the host state SELinux Enforcing + module auditing exist to catch."
  },
  {
    id: "H5",
    mode: "hard",
    pillar: "P3",
    sheet: "blueprint",
    title: "Write the beacon detection",
    task: "In the Rule Editor, build a high-fidelity beacon rule: choose dataset, domain, host, cadence and severity.",
    anchor: "Detection engineering from log sources (proxy telemetry · T1071.001)",
    hints: {
      nudge: "Which sensor records outbound web requests from workstations?",
      direction: "Dataset=proxy · the odd cdn-sync domain · the flagged workstation · fixed 60-second cadence · severity high.",
      demo: "Proxy + meridian-cdn-sync.example + WIN-AW7 + repeated at fixed 60 s intervals + High."
    },
    feedback: "A beacon rule tuned on dataset+domain+cadence fires on AW7's C2 (T1071.001) and not on every web request — fidelity comes from picking the right source AND the right conditions."
  },
  {
    id: "H6",
    mode: "hard",
    pillar: "P4",
    sheet: "defense",
    title: "Sequence the containment",
    task: "Order the AW7 response: contain first, then preserve. Build the 5-step chain; leave the two bad moves OUT entirely.",
    anchor: "Security operations workflow — contain → preserve evidence → eradicate (CS0-003 1.1 context)",
    hints: {
      nudge: "Two pool items destroy evidence or help the attacker — they stay out.",
      direction: "Order: isolate the host → cut C2 → capture memory → export logs → rotate credentials.",
      demo: "a-iso, a-block, a-mem, a-logs, a-cred — in that order; skip re-image-first and the staff email."
    },
    feedback: "Contain, cut, capture, collect, clean up. Re-imaging before memory capture destroys the best evidence; mass emails tip off the adversary (and colleagues)."
  },
  {
    id: "H7",
    mode: "hard",
    pillar: "P4",
    sheet: "defense",
    title: "Redesign under constraints",
    task: "Three constraints, three decisions. Pick the control that satisfies each without violating the others.",
    anchor: "Segmentation, NAC, least privilege — trade-off decisions (CS0-003 1.1)",
    hints: {
      nudge: "Each correct answer uses what ALREADY exists, cheaper and more targeted.",
      direction: "Distributed ACLs for PCI · jump host with named accounts for developers · 802.1X on existing switches.",
      demo: "k1→micro-segmentation · k2→jump host + least-privilege DB accounts · k3→enable 802.1X NAC."
    },
    feedback: "Real hardening is constraint-solving: micro-segmentation, brokered least-privilege access and NAC each hit the requirement without buying a new world.",
    choices: [
      {
        items: [
          {
            key: "k1",
            prompt: "Constraint 1 — PCI must be isolated from the lab; no new appliances in budget",
            options: [
              { id: "k1-dmz", label: "Move SQL01 into the DMZ network" },
              { id: "k1-micro", label: "Enable micro-segmentation with distributed ACLs and host firewalls" },
              { id: "k1-fw", label: "Request budget for a new datacenter firewall stack" },
              { id: "k1-ignore", label: "Document a risk exception for the next 3 years" }
            ]
          },
          {
            key: "k2",
            prompt: "Constraint 2 — Developers (VLAN 20) need read access to one build database, nothing wider",
            options: [
              { id: "k2-open", label: "Open VLAN 20 to all ports on VLAN 30" },
              { id: "k2-vpn", label: "Give every developer full VPN admin" },
              { id: "k2-jump", label: "Route via JMP-01 with named, least-privilege DB accounts" },
              { id: "k2-copy", label: "Copy the database onto a dev laptop" }
            ]
          },
          {
            key: "k3",
            prompt: "Constraint 3 — Warehouse switch ports accept any device; budget blocks new switches",
            options: [
              { id: "k3-mac", label: "Sticky-MAC port security as the only control, audited yearly" },
              { id: "k3-flat", label: "Accept the flat network and log nothing" },
              { id: "k3-wifi", label: "Ban all wired ports and go all-Wi-Fi" },
              { id: "k3-nac", label: "Turn on 802.1X using the existing RADIUS server" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "H8",
    mode: "hard",
    pillar: "P4",
    sheet: "defense",
    title: "Rogue device response",
    task: "Unknown MAC on port j-12/4 (already denied in the queue). Choose the immediate action AND the two controls that prevent a repeat.",
    anchor: "NAC / 802.1X — port security & dynamic quarantine (CS0-003 1.1)",
    hints: {
      nudge: "The immediate action stops THIS device; the controls stop the NEXT one.",
      direction: "Shut the port (preserve its logs). Prevention: port authentication + a quarantine landing zone.",
      demo: "Action: disable the port & preserve logs. Controls: 802.1X NAC + port security/dynamic VLAN."
    },
    feedback: 'Deny today, authenticate tomorrow: 802.1X plus dynamic quarantine turns "any device, any port" into "identified, healthy, or nothing".',
    choices: [
      {
        items: [
          {
            key: "rogue-action",
            prompt: "Immediate action",
            options: [
              { id: "ra-port", label: "Disable switch port j-12/4; preserve the logs" },
              { id: "ra-monitor", label: "Watch the port for a while longer" },
              { id: "ra-wifi", label: "Rotate the Wi-Fi passphrase and guest VLAN" },
              { id: "ra-wait", label: "Wait for the device to go away" }
            ]
          }
        ]
      }
    ],
    multi: {
      key: "roguectl",
      prompt: "Pick the TWO preventive controls:",
      options: [
        { id: "pc-nac", label: "802.1X NAC on access ports" },
        { id: "pc-port", label: "Port security with a dynamic quarantine VLAN" },
        { id: "pc-ups", label: "A bigger UPS" },
        { id: "pc-nolog", label: "Disabling logging for performance" }
      ],
      pick: 2
    }
  },
  {
    id: "H9",
    mode: "hard",
    pillar: "P1",
    sheet: "defense",
    title: "Zero-trust gap review",
    task: "Five findings from your survey. Select the TWO that most directly violate zero-trust architecture.",
    anchor: "Zero trust — implicit trust by location is the anti-pattern (CS0-003 1.1)",
    hints: {
      nudge: "Violations grant trust because of WHERE something is, not WHAT it is.",
      direction: "One violation lives in VLAN 99, one at the VPN.",
      demo: "Flat management VLAN reachable from everywhere · VPN users with full LAN and no posture check."
    },
    feedback: "Flat management reach and posture-free VPN access are standing implicit trust — the two highest-value zero-trust fixes in this design.",
    multi: {
      key: "ztgaps",
      prompt: "Select the TWO zero-trust violations:",
      options: [
        { id: "zg-mgmt", label: "Management VLAN 99 is reachable from every VLAN with no jump-path enforcement" },
        { id: "zg-vpn", label: "VPN users receive full LAN access with no device-posture check" },
        { id: "zg-gpo", label: "Endpoint baseline GPO is applied fleet-wide" },
        { id: "zg-nac", label: "802.1X is on the roadmap for next quarter" },
        { id: "zg-backup", label: "Backups run nightly and are restore-tested" }
      ],
      pick: 2
    }
  }
];
const ALL_OBJECTIVES = [...OBJECTIVES_MEDIUM, ...OBJECTIVES_HARD];
const PILLAR_META = {
  P1: { label: "Understand", color: "text-amber-300 border-amber-400/40 bg-amber-400/10" },
  P2: { label: "Recognize", color: "text-teal-300 border-teal-400/40 bg-teal-400/10" },
  P3: { label: "Detect", color: "text-lime-300 border-lime-400/40 bg-lime-400/10" },
  P4: { label: "Mitigate", color: "text-rose-300 border-rose-400/40 bg-rose-400/10" }
};

// Expose the data core on globalThis (debug/introspection convenience).
Object.assign(globalThis, { LAB_META, ZONES, LOG_TYPES, CANONICAL_TELEMETRY, HARD_PREWIRED_ERRORS, SNIPPETS, BEHAVIORS, ARTIFACTS, LINUX_MODULES, LIN_JUST_OPTIONS, STACK_LAYERS, STACK_CONTROLS, ACCESS_DEVICES, TRUST_STATEMENTS, SEG_RULES, SEQUENCE_POOL, SEQUENCE_CORRECT, GLOSSARY, QUIZ_MEDIUM, QUIZ_HARD, OBJECTIVES_MEDIUM, OBJECTIVES_HARD, ALL_OBJECTIVES, PILLAR_META });
