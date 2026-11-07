/* ─────────────────────────────────────────────────────────────────────────────
 * data.js — ALL lab content for the Cloud+ CV0-004 · Lesson 4.5 "Control Cutaway"
 * static lab. Content is carried over 1:1 from the original framework lab
 * (src/lib/lab/data.ts + widget/scenario constants). Data is separated from logic
 * (state.js / objectives.js / engine.js / ui.js).
 *
 * ALL DATA BELOW IS SYNTHETIC TRAINING DATA for the fictional organization
 * "Northwind Cargo Systems" (freight-booking SaaS: LoadBoard).
 * Hostnames, IPs, CVE IDs and events are invented. No real PII. No real orgs.
 * ───────────────────────────────────────────────────────────────────────────── */

var LAB = (function () {
  "use strict";

  var ORG = {
    name: "Northwind Cargo Systems",
    product: "LoadBoard",
    tagline: "Freight booking SaaS — cloud tenancy, go-live in 9 days",
    cloud: "public cloud tenancy (IaaS + a managed Postgres + SaaS email)",
  };

  var DECKS = [
    {
      id: "edge",
      name: "Deck 1 · Edge & Perimeter",
      sub: "what the internet touches first",
      blurb:
        "Public entry points: load balancer, CDN, DNS. Controls here filter north–south traffic before it reaches your estate.",
    },
    {
      id: "network",
      name: "Deck 2 · Network",
      sub: "subnets, security groups, inspection",
      blurb:
        "Security groups and NACLs gate every flow; inspection sensors watch what gets through. East–west segmentation lives here.",
    },
    {
      id: "compute",
      name: "Deck 3 · Compute & Workloads",
      sub: "VMs, containers, agents",
      blurb:
        "The workloads themselves: endpoint protection, hardening baselines, patching. If a perimeter control misses, this deck is the next net.",
    },
    {
      id: "data",
      name: "Deck 4 · Data & Storage",
      sub: "the crown jewels",
      blurb:
        "Databases, file shares, backups. Encryption, loss-prevention and recovery controls protect what attackers ultimately want.",
    },
    {
      id: "identity",
      name: "Deck 5 · Identity & Visibility",
      sub: "who gets in, and who is watching",
      blurb:
        "MFA, least privilege, service accounts — plus the SIEM pipeline that records what every other deck saw.",
    },
  ];

  var CONTROLS = [
    {
      id: "waf",
      name: "WAF (web application firewall)",
      deck: "edge",
      category: "technical",
      types: ["preventive", "detective"],
      blurb:
        "Inspects HTTP(S) requests to lb-01 and blocks web-attack patterns (SQLi, path traversal) before they reach the app.",
      teach:
        "A managed rule set stops the most common web attacks on day one; run it in detect mode first so you can tune false positives before you let it block traffic.",
      cost: 2,
      latency: 1,
      friction: 1,
      configs: [
        {
          key: "mode",
          label: "Inspection mode",
          options: [
            { value: "detect", label: "Detect — log only" },
            { value: "block", label: "Block — enforce rules" },
          ],
        },
      ],
      deployLabel: "Attach WAF to lb-01",
    },
    {
      id: "ddos",
      name: "DDoS edge shield",
      deck: "edge",
      category: "technical",
      types: ["preventive"],
      blurb: "Absorbs and filters volumetric floods at the provider edge.",
      teach:
        "Volumetric attacks must be absorbed before they congest your origin — that is why the shield sits at the edge deck, above everything you deploy.",
      cost: 2,
      latency: 1,
      friction: 1,
      deployLabel: "Enable edge shield",
    },
    {
      id: "ips",
      name: "IPS/IDS sensor",
      deck: "network",
      category: "technical",
      types: ["preventive", "detective"],
      blurb:
        "Signature and anomaly inspection of network flows. IDS records and alerts; IPS can drop offending packets in-line.",
      teach:
        "The same sensor is detective in IDS mode and preventive in IPS mode. Deploy in detect mode first, tune, then flip to block — or you will block legitimate business traffic.",
      cost: 2,
      latency: 2,
      friction: 1,
      configs: [
        {
          key: "mode",
          label: "Sensor mode",
          options: [
            { value: "detect", label: "IDS — detect & alert" },
            { value: "block", label: "IPS — block in-line" },
          ],
        },
      ],
      deployLabel: "Deploy sensor",
    },
    {
      id: "honeypot",
      name: "Honeypot segment",
      deck: "network",
      category: "technical",
      types: ["detective", "deterrent"],
      blurb:
        "A decoy subnet with juicy-looking but fake services. Legitimate users never touch it; anything that does is hostile.",
      teach:
        "Deception controls produce near-zero false positives and reveal attacker tradecraft — a low-cost detective layer for east–west movement.",
      cost: 1,
      latency: 1,
      friction: 1,
      deployLabel: "Seed decoy segment",
    },
    {
      id: "microseg",
      name: "Micro-segmentation policies",
      deck: "network",
      category: "technical",
      types: ["preventive"],
      blurb:
        "Host-level policies so workloads only accept traffic from explicitly allowed peers — shrinking east–west blast radius.",
      teach:
        "Perimeter firewalls barely limit lateral movement. Zero-trust practice: verify every flow, allow only what a workload needs, deny by default.",
      cost: 3,
      latency: 2,
      friction: 2,
      deployLabel: "Apply policies",
    },
    {
      id: "edr",
      name: "EDR / endpoint protection agent",
      deck: "compute",
      category: "technical",
      types: ["preventive", "detective"],
      blurb:
        "Installs on VMs: malware prevention, behavioural detection, isolation capability, telemetry to the SIEM.",
      teach:
        "The official 4.5 bullet 'endpoint protection'. Agents need an OS you control — legacy appliances that forbid agents need a compensating control instead.",
      cost: 2,
      latency: 1,
      friction: 1,
      configs: [
        {
          key: "targets",
          label: "Deploy to",
          options: [
            { value: "app-vm-01", label: "app-vm-01 (web tier)" },
            { value: "api-vm-02", label: "api-vm-02 (already covered)" },
            { value: "pricing-vm", label: "pricing-vm (legacy appliance)" },
          ],
        },
      ],
      deployLabel: "Install agent",
    },
    {
      id: "patch",
      name: "Patch job — CVE-2024-9681 (fictional)",
      deck: "compute",
      category: "technical",
      types: ["corrective", "preventive"],
      blurb:
        "Rolls the vendor hotfix for a critical remote-code-execution flaw onto app-vm-01 after backup.",
      teach:
        "Vulnerability management: scan, prioritize by exploitability, back up, patch, verify. Patching removes the flaw itself — no detection needed.",
      cost: 1,
      latency: 2,
      friction: 2,
      deployLabel: "Run patch job",
    },
    {
      id: "sandbox",
      name: "Attachment sandbox",
      deck: "compute",
      category: "technical",
      types: ["preventive", "detective"],
      blurb:
        "Detonates unknown files in an isolated environment before they reach a workload.",
      teach:
        "Sandboxing is isolation as prevention: let the unknown execute where it can do no harm, and only forward it when it behaves.",
      cost: 2,
      latency: 2,
      friction: 2,
      deployLabel: "Enable sandbox",
    },
    {
      id: "jumphost",
      name: "Jump host + allowlist (compensating)",
      deck: "compute",
      category: "technical",
      types: ["compensating", "preventive"],
      blurb:
        "All administration of pricing-vm flows through a hardened jump host; the VM runs an allowlist of known-good binaries and sits in an isolated segment.",
      teach:
        "When the primary control (an EDR agent) is impossible, a compensating control must reduce the same risk a different way — isolation, allowlisting, choke-point monitoring.",
      cost: 2,
      latency: 2,
      friction: 3,
      deployLabel: "Build jump host path",
    },
    {
      id: "kms",
      name: "KMS encryption at rest",
      deck: "data",
      category: "technical",
      types: ["preventive"],
      blurb:
        "Encrypts orders-db storage volumes and snapshots under customer-managed keys.",
      teach:
        "Encryption at rest makes a stolen volume or snapshot worthless without the key. Keys live in KMS with their own access policy and audit trail.",
      cost: 1,
      latency: 1,
      friction: 1,
      configs: [
        {
          key: "targets",
          label: "Encrypt",
          options: [{ value: "orders-db", label: "orders-db + snapshots" }],
        },
      ],
      deployLabel: "Enable encryption",
    },
    {
      id: "backups",
      name: "Nightly backup schedule",
      deck: "data",
      category: "technical",
      types: ["corrective"],
      blurb:
        "Nightly snapshots of orders-db to an isolated vault, with restore tested weekly.",
      teach:
        "Backups do not stop an attack — they make recovery possible. A corrective control: an untested backup is a hope, not a control.",
      cost: 1,
      latency: 1,
      friction: 1,
      deployLabel: "Schedule backups",
    },
    {
      id: "dlp",
      name: "DLP policy — PII egress",
      deck: "data",
      category: "technical",
      types: ["detective", "preventive"],
      blurb:
        "Content-aware inspection on the file share: detects PII patterns and can block uploads, share links and bulk exports.",
      teach:
        "The official 4.5 bullet 'data loss prevention'. Exfiltration often rides trusted, legitimate channels that firewalls never question — DLP watches the content, not the port.",
      cost: 2,
      latency: 2,
      friction: 2,
      configs: [
        {
          key: "mode",
          label: "Policy mode",
          options: [
            { value: "monitor", label: "Monitor — alert on PII movement" },
            { value: "block", label: "Block — stop PII egress" },
          ],
        },
      ],
      deployLabel: "Apply DLP policy",
    },
    {
      id: "mfa",
      name: "MFA enforcement",
      deck: "identity",
      category: "technical",
      types: ["preventive"],
      blurb:
        "Requires a second factor for console logins. Passwords alone are assumed compromised.",
      teach:
        "Stolen credentials are the top cloud attack vector. MFA on privileged accounts is the cheapest high-value preventive control in the catalog.",
      cost: 1,
      latency: 1,
      friction: 2,
      configs: [
        {
          key: "targets",
          label: "Scope",
          options: [
            { value: "admins", label: "Privileged admins only" },
            { value: "all", label: "All console users" },
          ],
        },
      ],
      deployLabel: "Enforce MFA",
    },
    {
      id: "siem",
      name: "SIEM log pipeline",
      deck: "identity",
      category: "technical",
      types: ["detective"],
      blurb:
        "Streams WAF, flow, auth and endpoint logs into one correlation engine with alert rules.",
      teach:
        "A detective fabric across every deck. Controls you cannot verify are controls you cannot trust — the SIEM is how deployed controls prove they work.",
      cost: 2,
      latency: 1,
      friction: 1,
      deployLabel: "Start pipeline",
    },
  ];

  var SG_RULES_INITIAL = [
    { id: "r1", src: "0.0.0.0/0", port: "22", proto: "tcp", note: "SSH — open to the world (CSPM flagged)" },
    { id: "r2", src: "0.0.0.0/0", port: "443", proto: "tcp", note: "HTTPS — public booking API (intended)" },
    { id: "r3", src: "10.0.4.0/22", port: "5432", proto: "tcp", note: "Postgres — app tier only" },
  ];

  var SG_MGMT_CIDR = "10.0.2.0/24";

  var FINDINGS_MEDIUM = [
    {
      id: "f-db",
      resource: "orders-db",
      severity: "critical",
      text: "Storage volumes and snapshots are unencrypted.",
      genuine: true,
      deck: "data",
      why: "Crown-jewel data readable from any stolen volume or snapshot — needs encryption at rest.",
    },
    {
      id: "f-mfa",
      resource: "admin-02, admin-03",
      severity: "critical",
      text: "MFA is disabled for two privileged console accounts.",
      genuine: true,
      deck: "identity",
      why: "Password-only privileged accounts are the top cloud attack vector — enforce MFA.",
    },
    {
      id: "f-sg",
      resource: "sg-app / TCP 22",
      severity: "high",
      text: "SSH open to 0.0.0.0/0 on the app subnet.",
      genuine: true,
      deck: "network",
      why: "World-open management port — restrict to the management CIDR.",
    },
    {
      id: "f-edr",
      resource: "app-vm-01",
      severity: "high",
      text: "No endpoint protection agent installed.",
      genuine: true,
      deck: "compute",
      why: "The official 4.5 bullet 'endpoint protection' — this workload has no last line of defense.",
    },
    {
      id: "f-ttl",
      resource: "cdn-01",
      severity: "info",
      text: "Cache TTL 120s vs 300s recommended in the vendor playbook.",
      genuine: false,
      deck: "edge",
      why: "Performance tuning, not a security control gap. Red herrings look like findings — scope is the skill.",
    },
    {
      id: "f-tls",
      resource: "lb-01",
      severity: "medium",
      text: "Legacy TLS 1.0/1.1 disabled on the listener.",
      genuine: false,
      deck: "edge",
      why: "Already remediated last sprint — a closed ticket is not an open gap.",
    },
  ];

  var FINDINGS_HARD = [
    FINDINGS_MEDIUM[0],
    FINDINGS_MEDIUM[1],
    FINDINGS_MEDIUM[2],
    FINDINGS_MEDIUM[3],
    {
      id: "f-backup",
      resource: "orders-db",
      severity: "critical",
      text: "No backup schedule or restore test exists.",
      genuine: true,
      deck: "data",
      why: "Without backups, ransomware on orders-db is unrecoverable — a missing corrective control.",
    },
    {
      id: "f-dlp",
      resource: "file-share",
      severity: "high",
      text: "No DLP policy; PII can be exported via share links.",
      genuine: true,
      deck: "data",
      why: "The official 4.5 bullet 'data loss prevention' — nothing watches content leaving via trusted channels.",
    },
    {
      id: "f-waf",
      resource: "lb-01",
      severity: "high",
      text: "Public booking API has no WAF attached.",
      genuine: true,
      deck: "edge",
      why: "Web attacks hit the public API first — the edge deck has no preventive filter.",
    },
    FINDINGS_MEDIUM[4],
    FINDINGS_MEDIUM[5],
    {
      id: "f-scan",
      resource: "api-vm-02",
      severity: "info",
      text: "Patch scan: zero missing patches; EDR agent healthy.",
      genuine: false,
      deck: "compute",
      why: "A clean result is not a gap — do not deploy controls where evidence shows coverage.",
    },
  ];

  var SIEM_EVENTS_MEDIUM = [
    {
      id: "e1",
      ts: "01:42",
      source: "auth-log / cloud-iam",
      text: "500 failed logins in 5 min against svc-deploy from 198.51.100.7, then 1 success from same ASN.",
      tp: true,
      action: "contain",
      actionLabel: "Contain: disable svc-deploy + rotate key",
      why: "Brute-force burst followed by a success is a textbook true positive — contain the account, rotate the credential, then investigate.",
    },
    {
      id: "e2",
      ts: "02:00",
      source: "flow-log / backup-gw",
      text: "Large nightly egress to backup-gw.internal during the scheduled backup window.",
      tp: false,
      action: "suppress",
      actionLabel: "Tune: suppress rule for backup window",
      why: "Known-good scheduled job matching an expected destination — a false positive. Tuning keeps analysts trusting the alerts that matter.",
    },
    {
      id: "e3",
      ts: "03:15",
      source: "auth-log / vpn",
      text: "Impossible travel: dev-kat seen from Lisbon and Shanghai 10 minutes apart.",
      tp: false,
      action: "suppress",
      actionLabel: "Tune: whitelist Kat's approved travel",
      why: "HR and badge records confirm approved travel with a new device. False positive — but document the exception, do not silence the rule class.",
    },
    {
      id: "e4",
      ts: "04:03",
      source: "app-log / waf-sampled",
      text: "Sustained path-traversal probes against /admin from 203.0.113.7 (repeated 404s, rotating UA).",
      tp: true,
      action: "escalate",
      actionLabel: "Escalate: open incident + block source",
      why: "Deliberate recon with evasion tricks. Even if probes 404 today, escalate — recon precedes exploitation.",
    },
  ];

  var SIEM_EVENTS_HARD = [
    {
      id: "h-e1",
      ts: "01:12",
      source: "change-log",
      text: "Planned maintenance: ops-jim opens SSH from mgmt CIDR, approved CHG-1187.",
      tp: false,
      action: "none",
      actionLabel: "Acknowledge",
      why: "Approved change, expected source — noise you must be able to read past.",
    },
    {
      id: "h-e2",
      ts: "01:40",
      source: "auth-log",
      text: "svc-deploy: 500 failed logins then success, new API key created, role escalated to *.",
      tp: true,
      action: "contain",
      actionLabel: "Contain: disable account + revoke keys",
      why: "Burst → success → persistence (new key) → privilege escalation. Unambiguous compromise chain.",
    },
    {
      id: "h-e3",
      ts: "02:00",
      source: "flow-log",
      text: "Nightly 2.1 GB egress to backup-gw.internal, matches schedule.",
      tp: false,
      action: "none",
      actionLabel: "Acknowledge",
      why: "Scheduled backup — expected.",
    },
    {
      id: "h-e4",
      ts: "02:26",
      source: "dlp-pilot / file-share",
      text: "4.2 GB of HR exports downloaded then re-shared to a personal cloud drive.",
      tp: true,
      action: "contain",
      actionLabel: "Contain: revoke links + isolate share",
      why: "Bulk PII leaving via trusted channels is exactly the exfiltration pattern firewalls miss — and the lab's DLP gap made visible.",
    },
    {
      id: "h-e5",
      ts: "02:55",
      source: "scan-log",
      text: "Internal vuln scanner completed: 0 criticals on api-vm-02.",
      tp: false,
      action: "none",
      actionLabel: "Acknowledge",
      why: "Clean scan result — informational.",
    },
    {
      id: "h-e6",
      ts: "03:30",
      source: "cert-log",
      text: "ACME auto-renewal issued cert for lb-01.northwind.example.",
      tp: false,
      action: "none",
      actionLabel: "Acknowledge",
      why: "Routine certificate automation.",
    },
    {
      id: "h-e7",
      ts: "04:10",
      source: "honeypot (decoy-seg)",
      text: "Decoy segment touched by 10.0.4.19 — lateral scan after the svc-deploy success.",
      tp: true,
      action: "escalate",
      actionLabel: "Escalate: incident + quarantine host",
      why: "Only attackers touch decoys; correlated with h-e2 this is confirmed lateral movement — quarantine and hunt.",
    },
    {
      id: "h-e8",
      ts: "05:00",
      source: "billing-log",
      text: "Spot-instance price alert: compute spend 8% over budget.",
      tp: false,
      action: "none",
      actionLabel: "Acknowledge",
      why: "Cost signal, not a security event — triage means knowing what is not yours.",
    },
  ];

  var REPLAYS = [
    {
      id: "sqli",
      name: "Replay A · SQL injection vs booking API",
      story:
        "Classic ' OR 1=1 -- injection attempts against /bookings/search on the public endpoint.",
      blockedByDeck: ["edge", "network"],
      blockedByIds: ["waf:block", "ips:block"],
      detectedByIds: ["waf:detect", "ips:detect", "siem"],
    },
    {
      id: "ssh",
      name: "Replay B · SSH brute force from internet",
      story:
        "Credential spraying against TCP/22 on the app subnet from a cloud-hosted botnet.",
      blockedByDeck: ["network"],
      blockedByIds: ["sg-fixed", "ips:block"],
      detectedByIds: ["ips:detect", "siem", "honeypot"],
    },
    {
      id: "creds",
      name: "Replay C · Credential attack on admin console",
      story:
        "Replayed breached password list against admin-02 with valid username enumeration.",
      blockedByDeck: ["identity"],
      blockedByIds: ["mfa"],
      detectedByIds: ["siem"],
    },
    {
      id: "exfil",
      name: "Replay D · PII exfiltration via file-share links",
      story:
        "Insider-style bulk export of HR files through legitimate share links — no exploit, no strange port, all 'authorized' tooling.",
      blockedByDeck: ["data"],
      blockedByIds: ["dlp:block"],
      detectedByIds: ["dlp:monitor", "siem"],
    },
  ];

  var GLOSSARY = [
    { term: "Security control", def: "A safeguard or countermeasure that avoids, detects, counters, or minimizes risk to an asset." },
    { term: "Preventive control", def: "Stops an undesired action before it happens — a WAF rule, an MFA challenge." },
    { term: "Detective control", def: "Identifies and records an action during or after it — a SIEM alert, an IDS signature." },
    { term: "Corrective control", def: "Restores a secure state after an incident — restoring from backup, re-imaging a host." },
    { term: "Deterrent control", def: "Discourages an attempt — a warning banner, visible monitoring." },
    { term: "Compensating control", def: "An alternative safeguard used when the preferred control is not feasible." },
    { term: "Directive control", def: "Guides behavior through policy or procedure — an acceptable-use policy, change process." },
    { term: "Defense in depth", def: "Layering independent controls so a miss at one layer is caught at the next." },
    { term: "Shared responsibility", def: "The model dividing security duties between cloud provider and customer by service model." },
    { term: "CSPM", def: "Cloud Security Posture Management — continuously finds misconfigurations and drift." },
    { term: "East–west traffic", def: "Flows between resources inside the environment — the lateral-movement path." },
    { term: "Least privilege", def: "Granting only the minimum access required, for the minimum time." },
    { term: "Baseline / drift", def: "The documented standard configuration; drift is any deviation from it." },
    { term: "Allowlist / blocklist", def: "Permitting only known-good, or blocking known-bad." },
  ];

  var PILLAR_META = {
    understand: { label: "Understand", short: "U", css: "pillar-understand" },
    recognize: { label: "Recognize", short: "R", css: "pillar-recognize" },
    detect: { label: "Detect", short: "D", css: "pillar-detect" },
    mitigate: { label: "Mitigate", short: "M", css: "pillar-mitigate" },
  };

  // Deck asset lists (verbatim from the original Cutaway component).
  var DECK_ASSETS = {
    edge: [
      "lb-01 — public load balancer (TLS termination)",
      "cdn-01 — content delivery",
      "booking.northwind.example — public FQDN",
    ],
    network: [
      "vpc-prod — 10.0.0.0/16",
      "subnet-app 10.0.1.0/24 · subnet-mgmt 10.0.2.0/24 · subnet-db 10.0.4.0/22",
      "sg-app — stateless permit rules",
    ],
    compute: [
      "app-vm-01 — web tier · no agent · CVE-2024-9681 (critical, fictional)",
      "api-vm-02 — API tier · agent present · fully patched",
      "pricing-vm — legacy appliance · agents forbidden",
    ],
    data: [
      "orders-db — managed Postgres · order + PII data",
      "file-share — HR exports & PII documents",
      "snapshot vault — isolated storage account",
    ],
    identity: [
      "admin-01..03 — privileged console accounts (MFA off on two)",
      "svc-deploy — deployment service account (over-privileged)",
      "northwind SaaS mail tenant — SaaS",
    ],
  };

  // Doctrine Codex content.
  var CATEGORIES = [
    { key: "technical", label: "Technical", desc: "Hardware/software logic enforces the rule — firewalls, agents, encryption." },
    { key: "administrative", label: "Administrative", desc: "Policy and process direct human behavior — approval boards, training, procedures." },
    { key: "physical", label: "Physical", desc: "Site and hardware access — badges, mantraps, cameras, locks. In cloud, largely the provider's." },
  ];

  var TYPES = [
    { key: "preventive", label: "Preventive", desc: "Stops it happening." },
    { key: "detective", label: "Detective", desc: "Spots it happening." },
    { key: "corrective", label: "Corrective", desc: "Repairs after it happened." },
    { key: "deterrent", label: "Deterrent", desc: "Discourages the attempt." },
    { key: "compensating", label: "Compensating", desc: "Alternative when the primary control is impossible." },
    { key: "directive", label: "Directive", desc: "Instructs behavior via policy/process." },
  ];

  var SIX_TYPES = [
    { v: "preventive", t: "Preventive" },
    { v: "detective", t: "Detective" },
    { v: "corrective", t: "Corrective" },
    { v: "deterrent", t: "Deterrent" },
    { v: "compensating", t: "Compensating" },
    { v: "directive", t: "Directive" },
  ];

  // Widget item banks (verbatim from the original ledger widgets).
  var WIDGET_ITEMS = {
    M1: [
      { id: "edr", t: "EDR agent running on app-vm-01" },
      { id: "badge", t: "Badge reader + mantrap at the data center" },
      { id: "cab", t: "Change-approval board (CAB) process" },
      { id: "backup", t: "Backup & restore service" },
    ],
    M2: [
      { id: "waf", t: "WAF rule blocking SQL-injection patterns" },
      { id: "aup", t: "Acceptable-use policy signed by every employee" },
      { id: "siem", t: "SIEM correlation alert on impossible-travel logins" },
      { id: "restore", t: "Restore orders-db from last night's snapshot" },
      { id: "banner", t: "Warning banner on the VPN login page" },
      { id: "jump", t: "Legacy VM locked behind jump host + allowlist (no agent possible)" },
    ],
    M3: [
      { id: "hypervisor", t: "Patching the hypervisor host" },
      { id: "cctv", t: "Physical CCTV inside the provider data center" },
      { id: "dbengine", t: "Patching the managed Postgres engine" },
      { id: "guestos", t: "Patching the guest OS of your IaaS VM" },
      { id: "mfa", t: "Enforcing MFA on your cloud console admins" },
      { id: "classification", t: "Classifying and labeling your data" },
    ],
    H3: [
      { id: "physical", t: "Physical datacenter security (guards, cameras, locks)" },
      { id: "hypervisor", t: "Patching the hypervisor host" },
      { id: "dbengine", t: "Patching the managed Postgres engine" },
      { id: "appcode", t: "Fixing vulnerabilities in your application code" },
      { id: "tenantmfa", t: "Enforcing MFA on your SaaS mail tenant" },
      { id: "classification", t: "Classifying and labeling your data" },
    ],
    M4: [
      { id: "waf", t: "WAF (inspects HTTP(S) requests)" },
      { id: "ips", t: "IPS/IDS sensor (inspects network flows)" },
      { id: "edr", t: "EDR agent (watches host processes)" },
      { id: "kms", t: "KMS encryption at rest (protects stored bytes)" },
      { id: "mfa", t: "MFA enforcement (gates console logins)" },
    ],
    H2: [
      { id: "banner", t: "Warning banner shown at every VPN login" },
      { id: "restore", t: "Restore from immutable backup after ransomware" },
      { id: "cab", t: "CAB approval required before any production change" },
      { id: "mantrap", t: "Mantrap + security guard at the data center door" },
      { id: "honeypot", t: "Honeypot decoy segment that records attacker tradecraft" },
    ],
  };

  // Sequence-rail steps (verbatim, incl. scrambled initial orders).
  var SEQ = {
    "OBJ-M12": {
      steps: [
        { k: "detect", t: "Deploy WAF in detect mode, baseline real traffic" },
        { k: "tune", t: "Analyze logs; tune rules and false positives" },
        { k: "block", t: "Switch the WAF policy to block mode" },
        { k: "verify", t: "Run an adversarial replay to confirm blocking works" },
        { k: "document", t: "Document the control; monitor continuously" },
      ],
      initial: ["tune", "detect", "document", "block", "verify"],
    },
    "OBJ-H4": {
      steps: [
        { k: "backup", t: "Snapshot orders-db before touching anything" },
        { k: "staging", t: "Patch staging; run regression tests" },
        { k: "prod", t: "Patch production in the approved change window" },
        { k: "detect", t: "Enable the IPS in detect mode" },
        { k: "tune", t: "Tune signatures against one week of real traffic" },
        { k: "block", t: "Switch the IPS to block mode" },
      ],
      initial: ["prod", "detect", "backup", "block", "staging", "tune"],
    },
  };

  var H5 = {
    A: {
      prompt:
        "Scenario A — pricing-vm cannot run any security agent (vendor contract). Reduce the same risk differently:",
      choices: [
        { v: "backup", t: "Weekly backups of the VM" },
        { v: "aup", t: "A stricter signed AUP for admins" },
        { v: "jump", t: "Jump host, allowlist, isolated segment" },
      ],
    },
    B: {
      prompt:
        "Scenario B — managed Postgres: you cannot install a host IDS on the provider's appliance. Compensate for the lost visibility:",
      choices: [
        { v: "snapshot", t: "Weekly manual snapshots of the DB" },
        { v: "auditlog", t: "Audit logging and anomaly alerts" },
        { v: "acl", t: "Provider IP allowlisting request" },
      ],
    },
  };

  var H7 = {
    constraint:
      "Constraint: budget covers one network project this quarter. Observed risk: intruders pivoting between the 40 internal workloads after an initial foothold.",
    choices: [
      { v: "fw", t: "A second, bigger internet firewall" },
      { v: "isp", t: "A second ISP uplink for resilience" },
      { v: "microseg", t: "Micro-segmentation across the 40 workloads" },
      { v: "lb", t: "An upgrade for the load balancer" },
    ],
  };

  var H8_ITEMS = [
    { id: "restore-drill", t: "Quarterly restore drill from the isolated vault" },
    { id: "replay-test", t: "Run the four adversarial replays and read the traces" },
    { id: "alert-fire", t: "Inject a test event; confirm the SIEM alert fires" },
    { id: "log-review", t: "Review SIEM log coverage for every deck" },
    { id: "docs", t: "Read the vendor documentation cover to cover" },
    { id: "agents", t: "Install two more agents, for good measure" },
    { id: "budget", t: "Request a budget increase" },
  ];

  var H9_ROWS = [
    { id: "sqli", name: "Replay A · SQLi" },
    { id: "ssh", name: "Replay B · SSH brute force" },
    { id: "creds", name: "Replay C · Credential attack" },
    { id: "exfil", name: "Replay D · PII exfiltration" },
  ];

  // Debrief content.
  var DETECTION = [
    {
      source: "SG / NACL change events",
      logic: "event.name = AuthorizeSecurityGroupIngress AND ingress.cidr = 0.0.0.0/0 AND port IN (22, 3389) → CRITICAL",
    },
    {
      source: "WAF / IPS logs",
      logic: "signature.family IN (SQLi, PathTraversal) AND count > 10 in 5m per source_ip → alert, correlate with auth events",
    },
    {
      source: "Auth / IAM logs",
      logic: "failed_logins ≥ 100 in 5m on principal AND followed_by success AND (new_key OR role_change) → incident",
    },
    {
      source: "DLP incidents",
      logic: "dlp.pattern = PII AND bytes_out > 1GB AND destination.external = true → block + page data owner",
    },
    {
      source: "CSPM findings",
      logic: "finding.status = open AND finding.control IN (encryption-at-rest, backup-policy, mfa-for-admins) → posture gate fails",
    },
  ];

  var MITIGATIONS = [
    {
      rec: "Enforce MFA for every privileged account; review service-account privileges quarterly (least privilege).",
      anchor: "CV0-004 4.5 · CIS v8 Control 6 · MITRE M1032 (Multi-factor Authentication) + M1026 (Privileged Account Management)",
    },
    {
      rec: "Run WAF + IPS: detect → tune → block, with monthly signature review.",
      anchor: "CV0-004 4.5 · CIS v8 Control 13 · MITRE M1030 (Network Segmentation) + M1037 (Filter Network Traffic)",
    },
    {
      rec: "Endpoint protection on every OS you own; patch criticals within SLA, always after backup.",
      anchor: "CV0-004 4.5 · CIS v8 Controls 10 & 7 · MITRE M1049 (Antivirus/Antimalware) + M1051 (Update Software)",
    },
    {
      rec: "Encrypt at rest under customer-managed keys; test restores quarterly (an untested backup is a hope).",
      anchor: "CV0-004 4.5 · CIS v8 Controls 3 & 11 · MITRE M1041 (Encrypt Sensitive Information) + M1053 (Data Backup)",
    },
    {
      rec: "DLP on content-bearing channels (file share, mail); monitor mode first, then block.",
      anchor: "CV0-004 4.5 (official bullet) · CIS v8 Control 3 · MITRE M1041 (Encrypt Sensitive Information) · DLP itself is a content-aware control with no single ATT&CK mitigation ID",
    },
    {
      rec: "Stream every deck's logs to the SIEM and gate go-live on verified replays, not installed agents.",
      anchor: "CV0-004 4.5 · CIS v8 Control 8 · MITRE M1047 (Audit) + M1019 (Threat Intelligence Program)",
    },
  ];

  // Completion-report focus areas (audit fix QA-5 / requirement R8) — derived
  // STRICTLY from the student's actual evidence. Never generic filler.
  var OBJ_STUDY = {
    "OBJ-M1": { topic: "control categories (technical / administrative / physical)", action: "Re-read the Doctrine Codex categories panel, then classify five controls from your own estate before retrying." },
    "OBJ-M2": { topic: "control types (preventive → directive)", action: "Re-read the Codex types panel and sort the catalog chips by type; watch when each control acts." },
    "OBJ-M3": { topic: "shared responsibility ownership", action: "Redraw the CSP-vs-customer line for one IaaS, one PaaS and one SaaS service you use at work." },
    "OBJ-M4": { topic: "defense-in-depth layer placement", action: "Walk the five cutaway decks and name what each layer physically inspects (HTTP, flows, processes, bytes, logins)." },
    "OBJ-M5": { topic: "CSPM finding triage (gap vs noise)", action: "Re-run the triage mentally: verb tense tells you whether a finding is a gap, a tuning note or a closed ticket." },
    "OBJ-M6": { topic: "security-group least privilege", action: "Audit one real security group for world-open management ports (SSH 22, RDP 3389) today." },
    "OBJ-M7": { topic: "proving detective controls work", action: "Remember: a control that is installed but produces no telemetry is a hole — always pair deploy with replay." },
    "OBJ-M8": { topic: "alert tuning and containment", action: "Review the corroboration rule: a failure burst followed by a success is never noise; scheduled jobs to internal destinations usually are." },
    "OBJ-M9": { topic: "endpoint protection & patching", action: "Re-check which VMs in the Compute deck lack agents, and read the patch card's backup-first sequence." },
    "OBJ-M10": { topic: "data-layer controls (encryption, backups, DLP)", action: "Revisit Deck 4 and connect each control to its type: encryption preventive, backups corrective, DLP content-aware." },
    "OBJ-M11": { topic: "compensating controls", action: "Re-read the legacy-exception card: a compensating control must reduce the SAME risk through a DIFFERENT mechanism." },
    "OBJ-M12": { topic: "safe rollout sequencing", action: "Memorize the cutover pattern: detect → tune → block → verify → document. Never block on day one." },
    "OBJ-H1": { topic: "gap triage under noisy evidence", action: "Filter red herrings by verb tense and status: informational, already-remediated and clean-result findings are not gaps." },
    "OBJ-H2": { topic: "tricky control classifications", action: "Apply the mechanism test: what does the control physically DO, and does it need technology, process or a site?" },
    "OBJ-H3": { topic: "shared responsibility across IaaS/PaaS/SaaS", action: "For each duty ask: can I log into it, configure it, or label it? If yes, it is yours." },
    "OBJ-H4": { topic: "hardening runbook ordering", action: "Two chains: backup → test → deploy, and observe → tune → enforce. Restore capability must exist before you patch." },
    "OBJ-H5": { topic: "justifying compensating controls", action: "Practice the auditor's phrasing: name the exact mechanism and argue risk-for-risk equivalence." },
    "OBJ-H6": { topic: "correlating an attack chain in the SIEM", action: "Re-read the 8 events by timestamp: compromise → persistence → lateral movement → exfiltration, then pick the control that cuts the last mile." },
    "OBJ-H7": { topic: "control-to-risk alignment under budget", action: "Match the control to the traffic direction: lateral (east-west) risk calls for segmentation, not a bigger border." },
    "OBJ-H8": { topic: "control-effectiveness verification", action: "A verification activity must generate EVIDENCE: restore drill, adversarial replay, alert test, log-coverage review." },
    "OBJ-H9": { topic: "attribution and closing the passing attack", action: "Re-run the four replays and read which deck acted; remember Replay D only falls to content-aware controls." },
  };

  var QUIZ_STUDY = {
    "q-m1": { topic: "control types (the WAF question)", action: "Re-read the Codex types panel; mode changes a control's type." },
    "q-m2": { topic: "shared responsibility (guest OS)", action: "Redraw the IaaS responsibility stack from the hardware up." },
    "q-m3": { topic: "defense in depth", action: "Re-read the Codex 'estate you are defending' panel." },
    "q-m4": { topic: "detective controls", action: "Sort the control catalog by type and check when each acts." },
    "q-m5": { topic: "compensating controls", action: "Re-read the legacy-exception card on the Compute deck." },
    "q-m6": { topic: "detect-then-block rollout", action: "Re-read the safe-cutover note under the WAF/IPS drawers." },
    "q-h1": { topic: "open management ports", action: "Re-check the SG editor flow: restrict first, watch second." },
    "q-h2": { topic: "corrective controls & backups", action: "Re-read the backup card on Deck 4 and the restore-drill objective." },
    "q-h3": { topic: "control-effectiveness proof", action: "Re-run one replay and read its trace — that IS the proof pattern." },
    "q-h4": { topic: "PaaS responsibility edges", action: "Re-do the responsibility-matrix widget and read each row aloud." },
    "q-h5": { topic: "DLP incident response", action: "Re-read the h-e4 event disposition and the DLP card on Deck 4." },
    "q-h6": { topic: "matching controls to risk", action: "Re-read the budget-call objective and the exfil replay story." },
    "q-h7": { topic: "zero trust", action: "Re-read the micro-segmentation card and the zero-trust glossary term." },
  };

  return {
    ORG: ORG,
    DECKS: DECKS,
    CONTROLS: CONTROLS,
    SG_RULES_INITIAL: SG_RULES_INITIAL,
    SG_MGMT_CIDR: SG_MGMT_CIDR,
    FINDINGS_MEDIUM: FINDINGS_MEDIUM,
    FINDINGS_HARD: FINDINGS_HARD,
    SIEM_EVENTS_MEDIUM: SIEM_EVENTS_MEDIUM,
    SIEM_EVENTS_HARD: SIEM_EVENTS_HARD,
    REPLAYS: REPLAYS,
    GLOSSARY: GLOSSARY,
    PILLAR_META: PILLAR_META,
    DECK_ASSETS: DECK_ASSETS,
    CATEGORIES: CATEGORIES,
    TYPES: TYPES,
    SIX_TYPES: SIX_TYPES,
    WIDGET_ITEMS: WIDGET_ITEMS,
    SEQ: SEQ,
    H5: H5,
    H7: H7,
    H8_ITEMS: H8_ITEMS,
    H9_ROWS: H9_ROWS,
    DETECTION: DETECTION,
    MITIGATIONS: MITIGATIONS,
    OBJ_STUDY: OBJ_STUDY,
    QUIZ_STUDY: QUIZ_STUDY,
  };
})();
