/* ═══════════════════════════════════════════════════════════════════════════
   data.js — ALL lab content, carried over 1:1 from the original framework lab
   (src/lib/lab/data.ts + objectives.ts + quiz.ts). Same wording, same answers,
   same hint tiers, same feedback, same option orders (shuffled pools preserved).
   Content + validation rules are data here; engines live in state/objectives/quiz.

   Lab data model: CompTIA Security+ SY0-801 · Objective 3.2
   "Given a scenario, manage the security architecture to best protect the
    infrastructure." All organizations, hosts, accounts and addresses are
    FICTIONAL TRAINING DATA (RFC 5737 / RFC 1918 addressing only).
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";

const ZONES = [
  { id: "INT", label: "Internet", short: "INT", purpose: "Untrusted external network.", tint: "#EDE7D8", stroke: "#8A8168", external: true },
  { id: "DMZ", label: "DMZ", short: "DMZ", purpose: "Brokers internet-facing services; limits what a compromise can reach.", tint: "#F3E3C2", stroke: "#B45309" },
  { id: "CORP", label: "Corporate LAN", short: "CORP", purpose: "User and internal server zone; no direct internet-facing services.", tint: "#E5EADC", stroke: "#6B8E4E" },
  { id: "OT", label: "Operations (OT / ICS)", short: "OT", purpose: "Process-control systems; strict control of data in and out.", tint: "#F2DDD3", stroke: "#B4553B" },
  { id: "MGT", label: "Management network", short: "MGT", purpose: "Isolates admin tooling and backups from user and server traffic.", tint: "#E9E4D6", stroke: "#7A7260" },
  { id: "CLD", label: "Cloud VPC", short: "CLD", purpose: "Hosted applications under company policy (shared responsibility).", tint: "#EFE6D3", stroke: "#A08A54" },
  { id: "GST", label: "Guest Wi-Fi", short: "GST", purpose: "Visitor internet access with no internal reach.", tint: "#F5F1E8", stroke: "#B0A88F" },
  { id: "QTN", label: "Quarantine VLAN", short: "QTN", purpose: "Holds non-compliant devices where they can be cleaned, not connect.", tint: "#F0E6DA", stroke: "#A8562F" },
  { id: "RMT", label: "Remote users", short: "RMT", purpose: "Company laptops working off-site; enter only through the VPN gateway.", tint: "#EAE5F0", stroke: "#7C6E9B", external: true },
  { id: "BR", label: "Branch depot", short: "BR", purpose: "Remote site; connects to HQ over a permanent encrypted tunnel.", tint: "#E3EBEA", stroke: "#5E8683", external: true },
];

const PLACEABLE_ZONE_IDS = ["CORP", "DMZ", "OT", "MGT", "CLD", "GST", "QTN"];

// ── Assets ───────────────────────────────────────────────────────────────────
const ASSETS = [
  { id: "WEB-01", name: "Public web server", kind: "server", owner: "IT / Web team", criticality: "High", notes: "Customer tracking portal. Internet-facing. Incident IR-2411: initial access point (unpatched upload service).", startZone: "CORP", movable: true },
  { id: "MAIL-01", name: "Mail gateway", kind: "server", owner: "IT / Messaging", criticality: "High", notes: "Accepts SMTP from the internet for mail filtering before delivery to internal mail store.", startZone: "CORP", movable: true },
  { id: "HIST-01", name: "Plant data historian", kind: "server", owner: "Operations", criticality: "Critical", notes: "Collects conveyor + gate telemetry from PLC-01/HMI-01. Its share was reached from the Corporate LAN in IR-2411.", startZone: "CORP", movable: true },
  { id: "JMP-01", name: "Admin jump box", kind: "server", owner: "IT Infrastructure", criticality: "Critical", notes: "Hardened host network admins must traverse for device administration. Currently reachable from the user LAN.", startZone: "CORP", movable: true },
  { id: "FS-01", name: "File server", kind: "server", owner: "IT / Ops", criticality: "High", notes: "Department shares. Lateral-movement pivot target in IR-2411 (SMB).", startZone: "CORP", movable: false },
  { id: "DB-01", name: "Freight & customer DB", kind: "server", owner: "IT / Apps", criticality: "Critical", notes: "Holds consignment + customer records. Only WEB-01 should hold a data path to it.", startZone: "CORP", movable: false },
  { id: "WS-114", name: "Workstation WS-114", kind: "workstation", owner: "Finance", criticality: "Medium", notes: "Finance workstation. Called out to internet during IR-2411 (443 beacon pattern).", startZone: "CORP", movable: false },
  { id: "PLC-01", name: "Conveyor controller", kind: "ot", owner: "Operations", criticality: "Critical", notes: "PLCs driving the sorting conveyor. Safety-relevant; no direct route to it from user LANs should exist.", startZone: "OT", movable: false },
  { id: "HMI-01", name: "Yard HMI", kind: "ot", owner: "Operations", criticality: "Critical", notes: "Operator console, Windows Server 2012 — END OF LIFE, cannot be patched. Isolation is the control.", startZone: "OT", movable: false },
  { id: "BAK-01", name: "Backup server", kind: "server", owner: "IT Infrastructure", criticality: "Critical", notes: "Receives backups from all zones. Belongs beside the jump box, off the user LAN.", startZone: "MGT", movable: false },
  { id: "APP-01", name: "TMS cloud app", kind: "cloud", owner: "IT / Apps (SaaS+IaaS)", criticality: "High", notes: "Transport-management system in the VPC. Per standard, reached per-application through the SSE/ZTNA gateway — not flat VPN-to-LAN.", startZone: "CLD", movable: false },
  { id: "LAP-087", name: "Field laptop LAP-087", kind: "laptop", owner: "Field ops", criticality: "Medium", notes: "Managed laptop, works off-site. Enters HQ networks only via client VPN (full tunnel, MFA + posture).", startZone: "RMT", movable: false, fixedNote: "Managed device — zone fixed (RMT); its access path is what you configure." },
  { id: "BR-RTR", name: "Branch router BR-RTR", kind: "network", owner: "IT Infrastructure", criticality: "High", notes: "Depot edge router. Telnet admin still ENABLED (see exposure audit).", startZone: "BR", movable: false, fixedNote: "Site edge device — zone fixed (BR)." },
  { id: "GTW-GUEST", name: "Guest gateway", kind: "appliance", owner: "IT Infrastructure", criticality: "Low", notes: "Visitor Wi-Fi edge. Must have no route into any internal zone.", startZone: "GST", movable: false, fixedNote: "Appliance — zone fixed (GST)." },
];

// ── Links (topology edges with configurable controls) ───────────────────────
const LINKS = [
  { id: "EDGE", a: "INT", b: "DMZ", label: "Internet ↔ DMZ", desc: "Perimeter edge. What the internet may reach, and what inspects it before it lands.", controls: ["policy", "ips"] },
  { id: "DMZ-CORP", a: "DMZ", b: "CORP", label: "DMZ ↔ Corporate", desc: "The brokered path. Standard: default-deny with explicit, documented allows only.", controls: ["policy"] },
  { id: "CORP-OT", a: "CORP", b: "OT", label: "Corporate ↔ OT", desc: "Plant boundary. Historian telemetry should leave OT one-way; nothing user-side should reach PLC/HMI.", controls: ["otpath"] },
  { id: "VPN-REMOTE", a: "RMT", b: "CORP", label: "Remote users ↔ HQ", desc: "Field laptops enter here. Configured per standard: client VPN, full tunnel, MFA, device posture.", controls: ["vpn", "tunnel", "mfa", "posture"] },
  { id: "S2S-BRANCH", a: "BR", b: "CORP", label: "Branch ↔ HQ", desc: "Permanent inter-site link. A site needs a site-to-site tunnel, not client software.", controls: ["vpn"] },
  { id: "CLOUD", a: "CORP", b: "CLD", label: "Corporate ↔ Cloud VPC", desc: "Path to the TMS app. Standard: per-application access via the SSE/ZTNA gateway.", controls: ["ztna"] },
  { id: "GUEST", a: "GST", b: "INT", label: "Guest ↔ Internet", desc: "Visitors get internet only. Isolation toggle decides whether any internal route exists.", controls: ["isolated"] },
];

// ── Link / flag configuration state ─────────────────────────────────────────
const DEFAULT_LINKS = Object.fromEntries(
  LINKS.map((l) => [
    l.id,
    { policy: "unspecified", ips: false, vpn: "none", tunnel: "split", mfa: false, posture: false, ztna: false, isolated: false, microseg: false, oneway: false },
  ]),
);

const DEFAULT_FLAGS = {
  dot1x: false,
  quarantineVlan: false,
  oob: false,
  jumpboxRequired: false,
  directAdminDisabled: false,
  adminProtocol: "none",
  fwFailMode: "unspecified",
  vendorDiversity: false,
  sftp: false,
  e2ee: false,
  gmsaBackup: false,
  gmsaWeb: false,
  creepAccount: "",
  creepFix: "",
  orphanFix: "",
  otProposal: "",
};

// ── Inline-answer state (tracker card widgets) ───────────────────────────────
const FLOW_ROWS = [
  { id: "F-01", text: "WS-114 → 198.51.100.23:443 (vendor portal)", answer: "NS" },
  { id: "F-02", text: "WS-114 → FS-01, TCP 445 (SMB)", answer: "EW" },
  { id: "F-03", text: "HMI-01 → HIST-01, TCP 5432 (telemetry)", answer: "EW" },
  { id: "F-04", text: "LAP-087 → APP-01 (cloud TMS, internet path)", answer: "NS" },
  { id: "F-05", text: "BAK-01 → FS-01, TCP 445 (nightly backup)", answer: "EW" },
];

const ZONE_MATCH = [
  { zone: "DMZ", correct: "m1" },
  { zone: "MGT", correct: "m2" },
  { zone: "OT", correct: "m3" },
  { zone: "QTN", correct: "m4" },
];
const ZONE_MATCH_OPTIONS = [
  // order shuffled (audit R6): correct ids m1..m4 must NOT align with the DMZ/MGT/OT/QTN row order
  { id: "d2", text: "Terminates site-to-site tunnels for branch depots" },
  { id: "m3", text: "Holds process-control systems; strict control of data in/out" },
  { id: "m1", text: "Brokers internet-facing services; limits what a compromise can reach" },
  { id: "d4", text: "Stores immutable backup copies offline" },
  { id: "m4", text: "Holds non-compliant devices where they can be cleaned, not connect" },
  { id: "d1", text: "Provides visitor internet access with no internal reach" },
  { id: "m2", text: "Isolates admin tooling and backups from user and server traffic" },
  { id: "d3", text: "Hosts the public DNS and CDN edge for marketing sites" },
];

const MATRIX_ROWS = [
  { id: "branch", label: "Branch depot (permanent site link)", correct: "s2s" },
  { id: "field", label: "Field laptops (managed, off-site staff)", correct: "client-full" },
  { id: "vendor", label: "Parts vendor (third party, TMS app only)", correct: "ztna" },
];
const MATRIX_OPTIONS = [
  // order shuffled (audit R6): correct ids s2s/client-full/ztna must NOT sit in row order
  { id: "client-split", text: "Client VPN, split tunnel for convenience" },
  { id: "ztna", text: "SSE / ZTNA per-application access — no network entry" },
  { id: "flat", text: "Add the vendor subnet to the Corporate LAN" },
  { id: "s2s", text: "Site-to-site IPsec tunnel between gateways" },
  { id: "client-full", text: "Client VPN, full tunnel, MFA + device posture" },
];

const BREACH_ANSWERS = {
  initial: { options: ["FS-01", "WS-114", "WEB-01", "BR-RTR", "HMI-01"], correct: "WEB-01" },
  hop: {
    options: [
      { id: "WS>DB", text: "WS-114 → DB-01 (5432)" },
      { id: "FS>OT", text: "FS-01 → HIST-01 (445)" },
      { id: "WEB>FS", text: "WEB-01 → FS-01 (SMB 445)" },
      { id: "MAIL>FS", text: "MAIL-01 → FS-01 (445)" },
    ],
    correct: "WEB>FS",
  },
  beacon: { options: ["HMI-01", "BAK-01", "LAP-087", "WS-114"], correct: "WS-114" },
  w1: {
    options: [
      { id: "no-vpn", text: "Remote VPN lacked MFA" },
      { id: "weak-wifi", text: "Guest Wi-Fi used weak encryption" },
      { id: "web-misplaced", text: "WEB-01 sat flat in the Corporate LAN (wrong zone)" },
      { id: "printers", text: "Printers ran unpatched firmware" },
    ],
    correct: "web-misplaced",
  },
  w2: {
    options: [
      { id: "no-tls", text: "Internal web apps lacked TLS" },
      { id: "flat-internal", text: "Flat east-west traffic: user LAN could reach file servers and the OT historian directly" },
      { id: "one-fw", text: "Only one firewall model was deployed" },
      { id: "no-dnssec", text: "The company DNS had no DNSSEC" },
    ],
    correct: "flat-internal",
  },
};

const REVIEW_PROPOSALS = [
  { id: "a", text: "Flatten the internal network to one VLAN and rely on host firewalls on every endpoint.", correct: "reject", why: "A flat network is exactly what let IR-2411 spread. Host firewalls alone are not segmentation; zones are the control." },
  { id: "b", text: "Put internet-facing services in a DMZ with default-deny filtering and explicit allows toward internal servers.", correct: "approve", why: "Textbook: a brokered DMZ shrinks what a web-server compromise can reach." },
  { id: "c", text: "Enable split tunneling for all remote laptops so streaming stays fast.", correct: "reject", why: "Convenience is not a security principle. Full tunnel keeps managed-laptop traffic inspected wherever it works." },
  { id: "d", text: "Standardize the entire firewall estate on one vendor to simplify operations.", correct: "reject", why: "Single-vendor stacks fail as one unit. Vendor/control diversity is an explicit 3.2 consideration." },
  { id: "e", text: "Deploy 802.1X on user ports with a quarantine VLAN for failing devices.", correct: "approve", why: "Port-based access control + NAC quarantine is the standard's own recommendation." },
  { id: "f", text: "Allow the DMZ to initiate connections into the Corporate LAN so troubleshooting is easier.", correct: "reject", why: "Inverts the DMZ model. Compromised DMZ hosts must not walk inward; only documented explicit allows." },
];

const SURFACE_ITEMS = [
  { id: "rdp-nat", text: "RDP on WS-114 published straight through a NAT rule to the internet", close: true, why: "Exposed remote-desktop services are a top intrusion path; remote entry belongs behind the VPN/jump box." },
  { id: "telnet-br", text: "Telnet administration enabled on BR-RTR (cleartext device credentials)", close: true, why: "Cleartext management of an edge router is a gift; disable for SSH, reachable via OOB/jump box only." },
  { id: "ftp-web", text: "Legacy FTP service still running on WEB-01", close: true, why: "The unpatched FTP upload service was the IR-2411 entry point; remove or replace with managed secure transfer." },
  { id: "close-dns", text: "Close outbound DNS to shrink the attack surface", close: false, why: "Breaking DNS availability is not risk reduction — controls must not destroy the service they protect." },
  { id: "drop-tls", text: "Drop TLS inspection entirely to improve throughput", close: false, why: "Throughput tuning is fine; abandoning transport encryption checks is not an attack-surface control." },
  { id: "single-fw", text: "Replace both firewall vendors with a single 'best-in-class' box", close: false, why: "Concentrates risk — the opposite of the diversity principle (3.2)." },
];

const FAILURE_CTX = [
  { id: "perimeter-fw", label: "Perimeter firewall (Internet ↔ DMZ)", correct: "fail-closed", why: "At the perimeter, exposure beats availability: if it cannot filter, it must not pass traffic." },
  { id: "nac-port", label: "NAC enforcement on user ports", correct: "fail-closed", why: "An unauthenticated port must not silently open onto the LAN — that recreates the flat network." },
  { id: "mes-sync", label: "MES↔ERP inventory sync job (non-critical, monitored)", correct: "fail-open", why: "A low-risk, monitored integration may favor availability; the risk is accepted and watched, not unmanaged." },
];

// ── Evidence binder documents ────────────────────────────────────────────────
const EVIDENCE = [
  {
    id: "E-01",
    tab: "E-01 Memo",
    title: "Engagement memo — from the CISO",
    body: `TO: New Security Architect (welcome aboard)
RE: Post-incident architecture review, Northwind Freight & Terminal Co.

We move freight through one HQ, a branch depot, and a yard full of
conveyor and gate automation. In November our tracking portal was
breached and the disruption reached the yard (incident IR-2411,
see E-02). The board has approved a redesign budget.

Your job: review the as-built schematic against our standard
NW-SEC-STD-7 (E-07), correct placement and zones, harden access
paths, and get every review finding approved in the tracker.

Everything in this binder is TRAINING DATA — synthetic, fictional.
Nothing here describes a real company or network.`,
  },
  {
    id: "E-02",
    tab: "E-02 IR-2411",
    title: "Incident post-mortem IR-2411 (synthetic)",
    body: `SUMMARY  Attackers exploited an unpatched upload service on WEB-01,
         which as-built sits FLAT IN THE CORPORATE LAN.
CHAIN    1) Internet → WEB-01 (no DMZ in front of it)
         2) WEB-01 → FS-01 over SMB/445 (flat east-west, no filtering)
         3) FS-01 → HIST-01 share (Corporate LAN could reach the OT
            historian directly)
         4) Yard gate + conveyor disruption for 6 hours.
ALSO     WS-114 called out to 198.51.100.23:443 in a regular beacon
         pattern during the incident window (unresolved — flagged for
         your flow review).
LESSON   Placement + zones + filtering would each have broken a link
         in that chain. This lab rebuilds all three.`,
  },
  {
    id: "E-03",
    tab: "E-03 Inventory",
    title: "Asset inventory (excerpt)",
    body: `ID        ZONE(as-built)  CRIT      NOTE
WEB-01    CORP (!)        High      Internet-facing portal
MAIL-01   CORP (!)        High      Internet SMTP gateway
HIST-01   CORP (!)        Critical  OT telemetry collector
JMP-01    CORP (!)        Critical  Admin jump box
FS-01     CORP            High      File shares
DB-01     CORP            Critical  Freight + customer DB
WS-114    CORP            Medium    Finance workstation
PLC-01    OT              Critical  Conveyor controller
HMI-01    OT              Critical  Win 2012 — END OF LIFE
BAK-01    MGT             Critical  Backup server
APP-01    CLD             High      TMS app (VPC)
LAP-087   RMT             Medium    Field laptop
BR-RTR    BR              High      Depot router — TELNET ON
GTW-GUEST GST             Low       Visitor Wi-Fi edge`,
    mono: true,
  },
  {
    id: "E-04",
    tab: "E-04 Flows",
    title: "Netflow excerpt (incident window, synthetic)",
    body: `F-01  WS-114 → 198.51.100.23:443   vendor portal check-in
F-02  WS-114 → FS-01:445           finance user → file share
F-03  HMI-01 → HIST-01:5432        plant telemetry
F-04  LAP-087 → APP-01:443         field laptop → cloud TMS
F-05  BAK-01 → FS-01:445           nightly backup job
—
Beacon note: F-01 shows a 60-second periodic pattern during the
incident window (regular size/timing). Flows F-02/F-05 are routine
business traffic — do not confuse pattern with purpose.`,
    mono: true,
  },
  {
    id: "E-05",
    tab: "E-05 Entitlements",
    title: "Entitlement review (synthetic)",
    body: `j.hollis   Finance analyst. Over 3 years accumulated: DB read,
           OT historian share, VPN admin group, old project shares.
           Uses ~10% of them. → classic PRIVILEGE CREEP.
m.osei     Ops supervisor. Rights match the role. Clean.
svc_backup Static password, never rotated since 2019, domain-wide
           rights. → gMSA candidate.
svc_web    Static password shared by two web apps. → gMSA candidate.
a.kwan     Departed employee, account still ACTIVE. Orphaned.`,
  },
  {
    id: "E-06",
    tab: "E-06 Proposal",
    title: "Vendor proposal V-9 (distractor-dense)",
    body: `We propose to simplify your network:
 a) One flat VLAN internally; host firewalls on endpoints.
 b) DMZ with default-deny + explicit allows (industry practice).
 c) Split tunnel for every remote laptop (convenience).
 d) Single firewall vendor estate-wide (simpler ops).
 e) 802.1X on user ports + quarantine VLAN (NAC).
 f) Permit DMZ hosts to initiate connections INTO the Corporate
    LAN, to make troubleshooting easier.
Note: proposals are mixed quality on purpose. Judge each against
the standard and the incident — the Hard-mode review board does.`,
  },
  {
    id: "E-07",
    tab: "E-07 Standard",
    title: "NW-SEC-STD-7 — zones & required controls",
    body: `ZONES (purpose)
 DMZ   internet-facing services, brokered; compromise here must not
       reach the internal network beyond documented allows.
 CORP  users + internal servers. No internet-facing service belongs
       here. East-west traffic filtered, not trusted.
 OT    process control. Telemetry leaves ONE-WAY to the historian.
       Nothing user-side initiates toward PLC/HMI.
 MGT   admin tooling + backups. Reachable via jump box / OOB only.
 QTN   non-compliant devices land here (NAC) until remediated.
 GST   visitors: internet only, zero internal routes.

REQUIRED CONTROLS
 Perimeter: default-deny, explicit allows, IPS on.
 DMZ→CORP: default-deny, explicit allows only (e.g. WEB-01→DB-01).
 Remote laptops: client VPN, FULL tunnel, MFA, device posture;
   cloud apps reached per-app via SSE/ZTNA — not flat VPN-to-LAN.
 Branch: site-to-site IPsec between gateways.
 User ports: 802.1X; NAC quarantine VLAN for failures.
 Admin: jump box required; direct device admin disabled; OOB mgmt;
   device admin protocol: TACACS+ (command-level AAA).
 Identity: least privilege; gMSA for services; entitlement reviews.
 Perimeter firewall failure mode: fail-CLOSED.`,
  },
];

// ── Glossary (Field Manual) ──────────────────────────────────────────────────
const GLOSSARY = [
  { term: "Attack surface", def: "The set of all points where an unauthorized actor could try to enter — every exposed service, port and path you can remove shrinks it." },
  { term: "Security zone", def: "A grouping of assets with a shared trust level and a defined policy on its boundaries (DMZ, Corporate, OT, Management…)." },
  { term: "DMZ", def: "A buffer zone for internet-facing services: if a host there is compromised, default-deny filtering limits what it can reach inward." },
  { term: "Quarantine VLAN", def: "Where NAC puts devices that fail posture checks — connected enough to be cleaned, never to the production LAN." },
  { term: "802.1X", def: "Port-based access control: a supplicant (device) asks an authenticator (switch/WLC), which forwards to an authentication server (RADIUS)." },
  { term: "NAC", def: "Network Access Control — admits devices based on identity AND health (posture), redirecting or quarantining failures." },
  { term: "Site-to-site VPN", def: "A permanent gateway-to-gateway tunnel connecting two sites' networks (branch ↔ HQ), transparent to users." },
  { term: "Client (remote-access) VPN", def: "Per-device tunnel from a laptop to the corporate gateway for individual remote users." },
  { term: "Split vs full tunnel", def: "Split sends only corporate-bound traffic through the VPN; full sends all traffic — better visibility and protection for managed devices." },
  { term: "ZTNA", def: "Zero Trust Network Access — grants access to one application per policy, never to the network behind it." },
  { term: "SSE", def: "Security Service Edge — cloud-delivered edge security (SWG + CASB + ZTNA) applied close to the user instead of one backhauled pipe." },
  { term: "Out-of-band (OOB) management", def: "A separate management path (dedicated interfaces/network) so admin access survives — and cannot ride — production traffic." },
  { term: "Jump box", def: "A single hardened, logged host that administrators must traverse to reach devices; removes direct admin routes." },
  { term: "gMSA", def: "Group Managed Service Account — Active Directory auto-rotates its password; services use it without humans handling secrets." },
  { term: "Privilege creep", def: "Rights accumulating across role changes until an account can do far more than its job needs — fixed by recertification and revocation." },
  { term: "Fail-closed / fail-open", def: "What a control does when IT fails: fail-closed blocks (secure), fail-open passes (available). Choose per context." },
  { term: "East-west vs north-south", def: "East-west = lateral traffic inside a zone/network (where attackers spread); north-south = traffic crossing the perimeter in/out." },
  { term: "Defense in depth", def: "Layered, independent controls so one failure never equals one breach." },
  { term: "Vendor diversity", def: "Deliberately using different vendors/technologies for parallel controls so a single flaw or outage is not total." },
];

// ── Field manual (Knowledge Core) copy ───────────────────────────────────────
const FIELD_MANUAL = {
  what: `Objective 3.2 asks you to MANAGE the security architecture: place devices where their compromise does the least damage, draw zones with real policy at their boundaries, verify users and devices before granting anything (Zero Trust), encrypt and control the paths that remain, and decide how each control behaves when it fails.`,
  how: `Mechanically it is four moves. (1) PLACEMENT & ZONES: internet-facing services go in a DMZ; admin tooling and backups leave the user LAN; process control gets its own OT zone with one-way telemetry. (2) ZERO TRUST: authenticate the user (MFA), check the device (posture + inventory), and grant per-application (ZTNA) — never implicit network-wide trust. (3) CONNECTIVITY: site-to-site tunnels for sites, client VPN with full tunnel + MFA + posture for laptops, SSE for per-app access, OOB management and a jump box for admins, secure file transfer and E2EE messaging for data in motion. (4) FAILURE MODES & DIVERSITY: perimeter controls fail closed; vendor and control diversity stop one flaw from being a total loss.`,
  why: `Attackers monetize everything 3.2 fixes. The IR-2411 chain is the canonical pattern: an internet-facing box parked in the user LAN (placement), flat east-west SMB (no zones/filtering), implicit trust inside the perimeter (no Zero Trust), and shared static credentials (no gMSA/least privilege). Northwind is fictional, but the pattern — exposed edge service, lateral movement over remote services (MITRE ATT&CK T1021.002, SMB/Admin Shares), then reach into sensitive systems — is documented across real public incident reports and CISA advisories (simplified here for training).`,
  chain: `Defender's chain position: this chapter is the architecture layer that every detection and response capability sits on top of. Segmentation (MITRE M1030), traffic filtering (M1037), account use policies (M1036), privileged account management (M1026) and encryption (M1041) are the official mitigation IDs this objective practices.`,
};

// ── Quiz bank (1:1) ──────────────────────────────────────────────────────────
// Audit contract (B3/B7.4/B7.5): correct-answer position ROTATES across items
// (medium [2,3,1,3,0,2] · hard [2,0,3,1,3,0,2]); the correct option is never the
// sole longest option; all options stay similar in length, structure and tone.
const QUIZ = {
  medium: [
    {
      id: "QM1",
      scenario: "Design fundamentals",
      question: "What is the primary security purpose of placing the public web server in a DMZ?",
      options: [
        "It speeds up delivery of the portal to internet users",
        "It removes the need to keep the portal patched",
        "It limits the inward reach if that server is compromised",
        "It hides the portal from automated port scanning",
      ],
      correct: 2,
      explanation:
        "A DMZ is a brokered buffer: internet-facing services live there, and default-deny filtering on the DMZ→internal boundary means a compromised host cannot walk into the Corporate LAN. Speed and stealth are not the point; blast-radius control is — patching is still required.",
    },
    {
      id: "QM2",
      scenario: "Access control mechanics",
      question: "In an 802.1X deployment, which component forwards authentication requests to the RADIUS server?",
      options: [
        "The supplicant, which is the laptop",
        "The DHCP server on the user VLAN",
        "The endpoint's EDR agent",
        "The authenticator, which is the switch",
      ],
      correct: 3,
      explanation:
        "Three roles: the SUPPLICANT (device) requests access, the AUTHENTICATOR (switch or wireless controller) relays it, and the AUTHENTICATION SERVER (RADIUS) decides. The switch never validates credentials itself, and the laptop or EDR agent has no relaying role.",
    },
    {
      id: "QM3",
      scenario: "Connectivity design",
      question: "For managed company laptops working from anywhere, why does the standard choose FULL tunnel over split tunnel?",
      options: [
        "Split tunnel breaks DNS on the laptop",
        "All traffic rides into corporate inspection",
        "Full tunnel avoids the need for MFA",
        "Full tunnel costs less per laptop",
      ],
      correct: 1,
      explanation:
        "Split tunnel sends only corporate-bound traffic through the VPN and lets the rest go direct — faster, but uninspected. Full tunnel keeps managed-device traffic visible and protected wherever the laptop works. MFA is required either way, and licensing cost is not the driver.",
    },
    {
      id: "QM4",
      scenario: "Zero Trust",
      question: "Which capability belongs to Zero Trust DEVICE management rather than user authentication?",
      options: [
        "Password rotation policy for all users",
        "SSO session tokens issued after login",
        "MFA push approval during sign-in",
        "Posture checks plus a device inventory",
      ],
      correct: 3,
      explanation:
        "Zero Trust verifies three things: the user (authentication), the DEVICE (health/posture checks + inventory), and the APPLICATION (per-app access control). Posture and inventory are the device-management half; the other three options all verify the user or the session.",
    },
    {
      id: "QM5",
      scenario: "Identity management",
      question: "What problem does a Group Managed Service Account (gMSA) solve?",
      options: [
        "Static service passwords that never rotate",
        "Service accounts consuming too many licenses",
        "Users forgetting service-account passwords",
        "Too many groups attached per user",
      ],
      correct: 0,
      explanation:
        "A gMSA's password is managed and auto-rotated by Active Directory; the service pulls it without any human handling a secret. Static service passwords — like Northwind's svc_backup — are a standing target for credential theft. Licenses and group sprawl are unrelated to gMSA.",
    },
    {
      id: "QM6",
      scenario: "Failure modes",
      question: "The perimeter firewall loses power. A fail-closed design means:",
      options: [
        "Only outbound traffic keeps passing",
        "The firewall reboots into bypass mode",
        "Traffic stops until the firewall recovers",
        "Traffic flows but every packet is logged",
      ],
      correct: 2,
      explanation:
        "Fail-closed = on failure, the control blocks (the gate shuts). At a security perimeter, brief unavailability is recoverable; unnoticed exposure is not. Fail-open is only acceptable where availability matters more than exposure — and that trade-off is a documented decision.",
    },
  ],
  hard: [
    {
      id: "QH1",
      scenario: "You inherit a network where the internet-facing portal sits in the user VLAN, SMB flows freely between user and server VLANs, and an IPS is installed but disabled.",
      question: "What is the BEST FIRST action to cut the attack surface?",
      options: [
        "Deploy a second SIEM instance for visibility coverage",
        "Add a WAF and keep every zone as built",
        "Enable IPS and default-deny first, then DMZ the portal",
        "Require monthly password rotation for every user account",
      ],
      correct: 2,
      explanation:
        "Sequence matters: reduce exposure first (default-deny + IPS live), then fix placement (DMZ). A SIEM or a WAF does not remove the flat east-west path, and password rotation does nothing against an unfiltered perimeter.",
    },
    {
      id: "QH2",
      scenario: "A parts vendor must submit shipping documents into the TMS application. The network team proposes adding the vendor's subnet to the Corporate LAN behind the site-to-site VPN.",
      question: "What is the correct third-party access design?",
      options: [
        "SSE/ZTNA per-application access with no network entry",
        "Site-to-site VPN with the vendor subnet routed inside",
        "Client VPN accounts shared among the vendor staff",
        "A persistent RDP jump host for the vendor",
      ],
      correct: 0,
      explanation:
        "Third parties get applications, not networks. ZTNA/SSE grants per-app reach with strong identity — no lateral movement surface, no shared accounts, no network presence. 'Routed subnet' and 'shared client VPN' are classic exam distractors, and a shared jump host is still network presence.",
    },
    {
      id: "QH3",
      scenario: "The OT historian collects conveyor telemetry from the plant floor. Operations asks for the data to stay available to analytics, but the plant cannot accept any inbound user-side connection.",
      question: "Which design satisfies both requirements?",
      options: [
        "Allow Corporate→OT SMB traffic but log every session",
        "Host the historian inside the DMZ instead",
        "A permanent site-to-site VPN into the plant",
        "One-way export from OT toward the analytics side",
      ],
      correct: 3,
      explanation:
        "Data diode / one-way export: telemetry leaves OT, nothing user-side enters. Logging a dangerous flow does not neutralize it, a VPN into the plant recreates IR-2411's last hop, and putting the historian in the DMZ exposes plant data to the edge.",
    },
    {
      id: "QH4",
      scenario: "You must choose the AAA protocol for administering switches and routers via the jump box.",
      question: "Which protocol, and why?",
      options: [
        "Kerberos — the strongest protocol available today",
        "TACACS+ — per-command authorization for device administration",
        "RADIUS — encrypts everything including the password header",
        "LDAP — directory-native and simple to operate",
      ],
      correct: 1,
      explanation:
        "TACACS+ separates authentication, authorization and accounting and can authorize PER COMMAND — built for device administration. RADIUS remains the network-access (802.1X) backend; Kerberos is an authentication protocol, not a device-admin AAA, and LDAP is a directory protocol. The two AAA choices are complements, not competitors.",
    },
    {
      id: "QH5",
      scenario: "An entitlement review finds a finance analyst holding DB read, OT historian share, VPN admin group and stale project rights (privilege creep), plus an active account for an employee who left.",
      question: "Choose the complete, correct remediation:",
      options: [
        "Demote the analyst to guest Wi-Fi; delete the orphan",
        "Move both accounts into one monitored quarterly group",
        "Promote the analyst; disable the orphan after 90 days",
        "Recertify and revoke the creep; deprovision the orphan",
      ],
      correct: 3,
      explanation:
        "Privilege creep is fixed by recertification/revocation back to the role's needs (least privilege). A departed employee's active account is a lifecycle failure: deprovision now. Demotion is not a remediation, 'monitor it' defers a live risk, and 'promote' worsens the creep.",
    },
    {
      id: "QH6",
      scenario: "NAC enforces posture checks on user ports. The network team asks whether the NAC enforcement should fail open (port admits on check-outage) or fail closed.",
      question: "Which choice and rationale is correct?",
      options: [
        "Fail closed — a silent port rebuilds the flat network",
        "Fail open — user productivity always outweighs access control",
        "Fail closed — 802.1X and NAC cannot coexist otherwise",
        "Fail open — NAC is only a detective control anyway",
      ],
      correct: 0,
      explanation:
        "NAC is the access boundary itself: if it fails open, unverified devices land on the production LAN — the exact condition segmentation exists to prevent. Productivity is a real cost but a documented, monitored exception is how you handle it — not a standing open door. (Compare: a non-critical, monitored sync job may reasonably fail open — context decides.)",
    },
    {
      id: "QH7",
      scenario: "Two DMZ service designs are proposed. A: strong perimeter firewall, flat DMZ-to-internal allow, unpatched hosts 'because the firewall is good'. B: default-deny both boundaries, WAF+IPS in front of services, patched hosts, explicit single allow to the database.",
      question: "Which assessment is correct?",
      options: [
        "A is defense in depth — it concentrates one strong control",
        "Both are equivalent; placement alone determines the outcome",
        "B is defense in depth — layered independent controls, least-privilege paths",
        "A is better — fewer rules are easier to audit",
      ],
      correct: 2,
      explanation:
        "Defense in depth = multiple independent layers (filtering, WAF/IPS, patching, least-privilege allows) so a single failure is not fatal. A is a single point of protection in front of an open interior — the architecture 3.2 exists to prevent. Rule count is not a security metric.",
    },
  ],
};

// ── Objectives (validation rules travel WITH the data, exactly as in the
//    original objectives.ts — the CHECK RESULTS engine just calls validate) ──
// helper: link config lookup (lazily materializes a default cfg)
function linkCfg(e, id) {
  if (!e.links[id]) {
    e.links[id] = { policy: "unspecified", ips: false, vpn: "none", tunnel: "split", mfa: false, posture: false, ztna: false, isolated: false, microseg: false, oneway: false };
  }
  return e.links[id];
}
const REVIEW_OK = REVIEW_PROPOSALS;
const SURFACE_OK = SURFACE_ITEMS;
const FAILCTX_OK = FAILURE_CTX;

const MEDIUM_OBJECTIVES = [
  {
    id: "OBJ-M1",
    mode: "medium",
    title: "Move the breached web server into the zone the standard demands",
    brief:
      "IR-2411 (binder → E-02) began on WEB-01. Open the schematic, click WEB-01, and assign it to the zone NW-SEC-STD-7 requires for internet-facing services.",
    pillar: "P2",
    anchor: "3.2 device placement + security zones (DMZ); grounded in procedure example IR-2411",
    kind: "env",
    hints: [
      "Where does a service the whole internet can reach belong — among user PCs, or in a buffer zone in front of the Corporate LAN?",
      "Read E-07 'Standard': the DMZ brokers internet-facing services so a compromise cannot walk into the internal network.",
      "Click WEB-01 on the schematic → set 'Assign zone' to DMZ.",
    ],
    passFeedback:
      "Placed. A DMZ host holds no user data and its inward path is filtered, so the same exploit now buys the attacker almost nothing. Device placement is the cheapest control on the sheet.",
    failFeedback:
      "Not yet. WEB-01 is internet-facing: among the seven assignable zones, exactly one is designed to broker that exposure. Re-read E-07's zone table, then click WEB-01 and reassign.",
    validate: (e) => e.assets["WEB-01"] === "DMZ",
  },
  {
    id: "OBJ-M2",
    mode: "medium",
    title: "Place the three other misplaced assets (MAIL-01, HIST-01, JMP-01)",
    brief:
      "The as-built inventory (E-03) flags four assets with '(!)'. WEB-01 is done — put the mail gateway, the OT historian and the admin jump box where the standard says they live.",
    pillar: "P4",
    anchor: "3.2 device placement + security zones (DMZ, OT, Management)",
    kind: "env",
    hints: [
      "Ask of each asset: who must reach it, and what happens if it is compromised? Internet SMTP → buffer zone; plant telemetry → plant zone; admin tooling → admin zone.",
      "MAIL-01 → DMZ · HIST-01 → OT · JMP-01 → Management network.",
      "Click each asset on the schematic and use 'Assign zone': MAIL-01→DMZ, HIST-01→OT, JMP-01→MGT.",
    ],
    passFeedback:
      "Placement complete: internet brokers in the DMZ, plant telemetry out of the user LAN, admin tooling isolated. Every zone now contains what its policy was written for.",
    failFeedback:
      "Some assets are still outside their standard zone. Check E-07: mail gateways face the internet, historians serve the plant, jump boxes serve administrators — each has one correct home.",
    validate: (e) => e.assets["MAIL-01"] === "DMZ" && e.assets["HIST-01"] === "OT" && e.assets["JMP-01"] === "MGT",
  },
  {
    id: "OBJ-M3",
    mode: "medium",
    title: "Match each zone to its purpose (design fluency)",
    brief:
      "You will manage what you can name. Match the four zones below to the purpose NW-SEC-STD-7 assigns them. Two options are distractors.",
    pillar: "P1",
    anchor: "3.2 security zones — DMZ, Management, OT, Quarantine semantics",
    kind: "zonematch",
    hints: [
      "DMZ = broker of internet exposure · MGT = admin isolation · OT = process control · QTN = holding pen for failed devices.",
      "The two distractors describe a guest network and a backup store — no zone on this sheet does either.",
      "DMZ→'Brokers internet-facing services…' · MGT→'Isolates admin tooling…' · OT→'Holds process-control systems…' · QTN→'Holds non-compliant devices…'.",
    ],
    passFeedback:
      "Zone vocabulary locked in. On the exam, 'which zone should host X' questions are free points once the purposes are reflexes.",
    failFeedback:
      "One or more matches are off. Re-read the ZONES section of E-07, then reassign — note the distractors describe services no zone here provides.",
    validate: (e) => ["DMZ", "MGT", "OT", "QTN"].every((z) => e.zoneMatch[z] === { DMZ: "m1", MGT: "m2", OT: "m3", QTN: "m4" }[z]),
  },
  {
    id: "OBJ-M4",
    mode: "medium",
    title: "Harden the remote-worker entry path to the standard",
    brief:
      "Field laptops (RMT ↔ HQ link) must enter exactly as NW-SEC-STD-7 requires: the right VPN type, full-tunnel inspection, user verification and device health, plus per-app access to the cloud TMS.",
    pillar: "P4",
    anchor: "3.2 Zero Trust (user authentication, device health) + VPN/tunneling + SSE/application access control",
    kind: "env",
    hints: [
      "Four switches and one dropdown on the VPN-REMOTE link, one toggle on the CLOUD link. Individuals enter as clients; managed laptops send ALL traffic through the tunnel; the TMS app is reached per-application, not by dumping users on the LAN.",
      "vpn=client · tunnel=full · MFA on · posture on · and on the CLOUD link enable the SSE/ZTNA gateway.",
      "Click the RMT↔CORP link: set VPN type 'Client', tunnel 'Full', switch MFA and Device posture ON. Then click CORP↔CLD and switch 'SSE/ZTNA gateway' ON.",
    ],
    passFeedback:
      "That is Zero Trust in miniature: the user proves identity (MFA), the device proves health (posture), all traffic stays visible (full tunnel), and the cloud app is reached per-application through SSE/ZTNA — never the flat network.",
    failFeedback:
      "The path is not yet to standard. Compare each control on the RMT↔CORP link against E-07's 'Remote laptops' line, and remember APP-01 is reached per-application via the SSE/ZTNA gateway.",
    validate: (e) => linkCfg(e, "VPN-REMOTE").vpn === "client" && linkCfg(e, "VPN-REMOTE").tunnel === "full" && linkCfg(e, "VPN-REMOTE").mfa && linkCfg(e, "VPN-REMOTE").posture && linkCfg(e, "CLOUD").ztna,
  },
  {
    id: "OBJ-M5",
    mode: "medium",
    title: "Connect the branch depot with the correct tunnel type",
    brief:
      "The depot needs a permanent, transparent link to HQ for its staff and shipment scanners. Configure the BR ↔ CORP link's VPN type accordingly.",
    pillar: "P4",
    anchor: "3.2 secure communication/access — VPN (site-to-site vs remote-access)",
    kind: "env",
    hints: [
      "Whole site ↔ whole site, always on, no per-user software: which of the three VPN types matches that?",
      "A site connects as a site — 'Site-to-site' on the S2S-BRANCH link.",
      "Click the BR↔CORP link → VPN type → 'Site-to-site'.",
    ],
    passFeedback:
      "Site-to-site it is: gateways speak IPsec, users just work, and no laptop ever holds HQ credentials. Choosing client VPN here would mean maintaining dozens of individual tunnels.",
    failFeedback:
      "Not the standard's choice. Re-read E-07's 'Branch' line — a permanent inter-site link is one gateway-to-gateway tunnel, not per-device client software.",
    validate: (e) => linkCfg(e, "S2S-BRANCH").vpn === "site-to-site",
  },
  {
    id: "OBJ-M6",
    mode: "medium",
    title: "Switch on port-based access control with a quarantine path",
    brief:
      "Any laptop that plugs into a user port must authenticate (802.1X), and any device failing its health check must land somewhere it cannot do damage. Open the Control Register and enable both.",
    pillar: "P4",
    anchor: "3.2 Zero Trust device management (health) + security zones (quarantine VLAN)",
    kind: "env",
    hints: [
      "Two switches in the Control Register's 'Access control' section.",
      "Enable 802.1X on user ports AND the NAC quarantine VLAN.",
      "Control Register → Access control → '802.1X on user ports' ON, 'NAC quarantine VLAN' ON.",
    ],
    passFeedback:
      "Now an unknown device gets challenged at the port (802.1X → RADIUS), and a sick one is parked in quarantine where it can be patched, not spread. This single pair would have blunted dozens of documented intrusions.",
    failFeedback:
      "Both halves are required: 802.1X without quarantine leaves failing devices with nowhere safe to go; quarantine without 802.1X has nothing to trigger it. Open the Control Register → Access control.",
    validate: (e) => e.flags.dot1x && e.flags.quarantineVlan,
  },
  {
    id: "OBJ-M7",
    mode: "medium",
    title: "Rebuild the administration path (jump box + OOB, no direct admin)",
    brief:
      "Today admins RDP straight from the user LAN into network gear. In the Control Register, make the admin path match the standard: traverse the jump box, disable direct administration, and give management its own wire.",
    pillar: "P4",
    anchor: "3.2 remote access (secured admin entry) + out-of-band management",
    kind: "env",
    hints: [
      "Three switches in the Control Register's 'Administration' section — two ON, one ON as well (nothing here ends up OFF).",
      "Jump box required ON · direct device admin DISABLED ON · OOB management ON.",
      "Control Register → Administration → 'Admin via jump box' ON, 'Direct device admin disabled' ON, 'OOB management network' ON.",
    ],
    passFeedback:
      "Administrative access is now concentrated on one hardened, fully logged host, and it rides its own out-of-band wire. Every admin session is attributable, and a production outage can no longer lock you out of your own gear.",
    failFeedback:
      "Check all three Administration switches. The standard removes the direct path (not just adds a new one) and gives management traffic its own network.",
    validate: (e) => e.flags.jumpboxRequired && e.flags.directAdminDisabled && e.flags.oob,
  },
  {
    id: "OBJ-M8",
    mode: "medium",
    title: "Triage the flow log: classify traffic, find the lateral hop",
    brief:
      "E-04 holds five flows from the incident window. Label each north-south (crossing the perimeter) or east-west (lateral, inside), then name the flow that matches IR-2411's lateral-movement step.",
    pillar: "P3",
    anchor: "3.2 attack surface / segmentation telemetry — east-west vs north-south; T1021.002 SMB lateral movement",
    kind: "flows",
    hints: [
      "To the internet or cloud or in from remote = north-south. Between internal hosts (user→file server, plant→historian, backup→server) = east-west.",
      "F-01 NS · F-02 EW · F-03 EW · F-04 NS · F-05 EW. The lateral hop is SMB from the workstation to the file server.",
      "Set F-01=NS, F-02=EW, F-03=EW, F-04=NS, F-05=EW; lateral movement = F-02.",
    ],
    passFeedback:
      "Read like an analyst: the beacon (F-01) crossed the perimeter, the damage moved east-west (F-02). Segmentation exists to break exactly that east-west class — which is why E-07 filters user→server SMB.",
    failFeedback:
      "Some labels are off. Rule of thumb from the Field Manual: crossing the perimeter (internet, cloud, remote in) is north-south; anything between hosts inside is east-west. F-02/F-05 look similar — check who initiates and why.",
    validate: (e) => {
      const want = { "F-01": "NS", "F-02": "EW", "F-03": "EW", "F-04": "NS", "F-05": "EW" };
      return Object.entries(want).every(([k, v]) => e.flows[k] === v) && e.lateral === "F-02";
    },
  },
  {
    id: "OBJ-M9",
    mode: "medium",
    title: "Fix identity: name the creep, revoke the bloat, adopt gMSAs",
    brief:
      "E-05's entitlement review needs action. In the objective panel below, name the privilege-creep account and choose its fix; then, in the Control Register's Identity section, convert the two static service accounts to gMSAs.",
    pillar: "P2",
    anchor: "3.2 identity management — privilege creep, least privilege, gMSAs, user management",
    kind: "identity",
    hints: [
      "Privilege creep = rights accumulated past what the role needs (E-05 spells out who). The fix restores least privilege; it does not promote or ignore.",
      "Account: j.hollis · fix: revoke/recertify unused rights. Services: svc_backup and svc_web become gMSAs.",
      "Pick 'j.hollis' + 'Revoke/recertify' below; Control Register → Identity → both gMSA switches ON.",
    ],
    passFeedback:
      "Least privilege restored and service passwords now auto-rotate without human hands (gMSA). Identity hygiene quietly deletes whole attack classes — stolen static service credentials become useless.",
    failFeedback:
      "Incomplete. E-05 shows exactly one account with accumulated unused rights, and exactly two static-password service accounts. The creep fix restores least privilege — revocation + recertification.",
    validate: (e) => e.flags.creepAccount === "j.hollis" && e.flags.creepFix === "revoke" && e.flags.gmsaBackup && e.flags.gmsaWeb,
  },
  {
    id: "OBJ-M10",
    mode: "medium",
    title: "Filter the DMZ boundary and inspect the perimeter",
    brief:
      "Placement alone is not policy. On the schematic: set the DMZ↔Corporate link to the standard's filtering posture, and enable inspection on the Internet↔DMZ link.",
    pillar: "P4",
    anchor: "3.2 security zones boundary policy + attack surface reduction (filter network traffic, M1037)",
    kind: "env",
    hints: [
      "E-07: 'DMZ→CORP: default-deny, explicit allows only' and 'Perimeter: default-deny, explicit allows, IPS on.'",
      "Two settings: DMZ-CORP policy = 'Default-deny, explicit allows' · EDGE 'IPS inspection' ON.",
      "Click DMZ↔CORP → policy 'Default-deny, explicit allows'. Click Internet↔DMZ → IPS ON.",
    ],
    passFeedback:
      "A compromised WEB-01 can now reach exactly one documented path (DB-01 on its port) and nothing else; the IPS watches what lands from the internet. This is the control that directly breaks IR-2411 step 2.",
    failFeedback:
      "Check both links against E-07. 'Flat-allow' is how IR-2411 spread; the standard demands default-deny with explicit, documented allows, plus inspection at the perimeter.",
    validate: (e) => linkCfg(e, "DMZ-CORP").policy === "default-deny-explicit" && linkCfg(e, "EDGE").ips,
  },
  {
    id: "OBJ-M11",
    mode: "medium",
    title: "Set the perimeter failure mode and diversify the control estate",
    brief:
      "Two architecture-level decisions from 3.2 remain: what the perimeter firewall does when IT fails, and whether one vendor flaw should be a total loss. Both live in the Control Register.",
    pillar: "P1",
    anchor: "3.2 failure modes + diversity (vendor/control diversity)",
    kind: "env",
    hints: [
      "At the perimeter, which is worse: brief unavailability, or an open door nobody notices? And should both firewalls share one vendor's bugs?",
      "Fail-CLOSED at the perimeter; accept the second-vendor proposal (diversity ON).",
      "Control Register → Resilience → 'Perimeter failure mode' = fail-closed, 'Vendor diversity' ON.",
    ],
    passFeedback:
      "Fail-closed turns a dead firewall into an outage, not an incident report; vendor diversity means one vendor's zero-day no longer defeats the whole estate. Availability is restored by ops — exposure is restored by nobody.",
    failFeedback:
      "Re-read E-07's last line and the Field Manual's failure-modes paragraph. At the perimeter the standard chooses security over availability, and diversity is an explicit 3.2 consideration.",
    validate: (e) => e.flags.fwFailMode === "fail-closed" && e.flags.vendorDiversity,
  },
  {
    id: "OBJ-M12",
    mode: "medium",
    title: "Encrypt the two rogue channels (file transfer + ops chat)",
    brief:
      "The comms audit found ops chat in cleartext and shipments exchanged over plain FTP. In the Control Register's 'Connectivity' section, bring both in line with the encryption standard.",
    pillar: "P3",
    anchor: "3.2 end-to-end encrypted messaging + secure file transfer",
    kind: "env",
    hints: [
      "Two switches: one replaces plain FTP with managed secure transfer, one turns ops chat end-to-end encrypted.",
      "Secure file transfer ON · E2EE ops messaging ON.",
      "Control Register → Connectivity → 'Secure file transfer (SFTP/MFT)' ON, 'E2EE ops messaging' ON.",
    ],
    passFeedback:
      "Data in motion is now protected end-to-end on both channels — interceptable traffic becomes useless ciphertext, and the FTP service (a classic exposed-service liability) disappears from the attack surface.",
    failFeedback:
      "Both channels violate the standard (E-07: secure file transfer; E2EE messaging). Toggle both in the Control Register → Connectivity.",
    validate: (e) => e.flags.sftp && e.flags.e2ee,
  },
];

const HARD_OBJECTIVES = [
  {
    id: "OBJ-H1",
    mode: "hard",
    title: "Rebuild the entire as-built to NW-SEC-STD-7 — in one pass",
    brief:
      "The board expects a complete re-architecture: every misplaced asset in its standard zone, perimeter default-deny + IPS, DMZ boundary default-deny, guest fully isolated, and the OT path brokered one-way. Configure the schematic until the whole sheet complies.",
    pillar: "P4",
    anchor: "3.2 device placement + security zones + attack surface + boundary policy (full chapter integration)",
    kind: "env",
    hints: [
      "Four assets (E-03 '(!)'), then four link settings: EDGE policy+IPS, DMZ-CORP policy, GUEST isolation, CORP-OT micro-seg + one-way.",
      "WEB-01 & MAIL-01→DMZ, HIST-01→OT, JMP-01→MGT · EDGE=default-deny-explicit+IPS · DMZ-CORP=default-deny-explicit · GUEST isolated · OT micro-seg ON + one-way export ON.",
      "Every zone and link listed in E-07's REQUIRED CONTROLS must read green. Click each element; leave nothing 'unspecified'.",
    ],
    passFeedback:
      "The sheet now complies end to end. This is the actual 3.2 exam skill: given a scenario drawing, produce the corrected architecture in full — not one control at a time.",
    failFeedback:
      "The sheet is not yet fully compliant. Audit every zone tint and every link chip against E-07's REQUIRED CONTROLS list — 'unspecified' anywhere is a finding.",
    validate: (e) =>
      e.assets["WEB-01"] === "DMZ" && e.assets["MAIL-01"] === "DMZ" && e.assets["HIST-01"] === "OT" && e.assets["JMP-01"] === "MGT" &&
      linkCfg(e, "EDGE").policy === "default-deny-explicit" && linkCfg(e, "EDGE").ips && linkCfg(e, "DMZ-CORP").policy === "default-deny-explicit" &&
      linkCfg(e, "GUEST").isolated && linkCfg(e, "CORP-OT").microseg && linkCfg(e, "CORP-OT").oneway,
  },
  {
    id: "OBJ-H2",
    mode: "hard",
    title: "Reconstruct the IR-2411 kill chain from raw evidence",
    brief:
      "No hints in the file — only E-02, E-03 and E-04. Name the initial-access asset, the exact lateral-movement hop, the host with beaconing behavior, and the TWO design weaknesses that made the chain walkable. Distractors included.",
    pillar: "P3",
    anchor: "3.2 attack surface + segmentation telemetry; procedure example IR-2411; ATT&CK T1021.002 / T1071 patterns",
    kind: "breach",
    hints: [
      "Correlate E-02's numbered chain with E-03's '(!)' placements and E-04's periodic pattern.",
      "Initial = the internet-facing misplaced box · hop = SMB from it to the file server · beacon = the workstation calling out to 198.51.100.23:443 · weaknesses = placement + flat east-west.",
      "WEB-01 → 'WEB-01 → FS-01 (SMB 445)' → WS-114 → 'WEB-01 sat flat in the Corporate LAN' + 'flat east-west traffic…'.",
    ],
    passFeedback:
      "Clean reconstruction. You demonstrated the examiner's real test: given noisy evidence, attribute the chain correctly and name the architecture that enabled it — placement and east-west trust.",
    failFeedback:
      "Rejected — part of the chain is misattributed. The beacon pattern (E-04 note) and the SMB hops (E-02 steps 2–3) anchor two of the answers; the weaknesses are both architecture flaws, not host flaws.",
    validate: (e) =>
      e.breach.initial === "WEB-01" && e.breach.hop === "WEB>FS" && e.breach.beacon === "WS-114" && e.breach.w1 === "web-misplaced" && e.breach.w2 === "flat-internal",
  },
  {
    id: "OBJ-H3",
    mode: "hard",
    title: "Deliver the hardened administration & device-management stack",
    brief:
      "Spec: admins traverse the jump box only; direct device administration dies; management rides out-of-band; network devices are administered over the AAA protocol built for command-level device control; and the perimeter firewall's failure mode follows the standard. Configure all five.",
    pillar: "P4",
    anchor: "3.2 remote access + OOB management + failure modes; TACACS+ vs RADIUS selection",
    kind: "env",
    hints: [
      "Four Control Register switches plus one dropdown. For device administration, which protocol sends PER-COMMAND authorization — RADIUS or TACACS+?",
      "jumpbox ON · directAdmin disabled ON · OOB ON · adminProtocol = TACACS+ · fwFailMode = fail-closed.",
      "Control Register → Administration (3 switches + protocol dropdown = TACACS+) → Resilience → fail-closed.",
    ],
    passFeedback:
      "The admin plane is now attributed end to end: one logged entry host, no direct routes, its own wire, per-command TACACS+ accounting, and a perimeter that fails shut. This stack is worth memorizing — it appears in exam scenarios nearly verbatim.",
    failFeedback:
      "One or more of the five requirements is unmet. Remember the distinction: RADIUS excels at network user authentication (your 802.1X backend); TACACS+ is the device-administration protocol with per-command authorization.",
    validate: (e) => e.flags.jumpboxRequired && e.flags.directAdminDisabled && e.flags.oob && e.flags.adminProtocol === "tacacs" && e.flags.fwFailMode === "fail-closed",
  },
  {
    id: "OBJ-H4",
    mode: "hard",
    title: "Produce the connectivity matrix for three access personas",
    brief:
      "Three personas, three correct access patterns — choose from the five options per row (two rows carry distractors engineered to look efficient). Branch depot, field laptops, parts vendor.",
    pillar: "P4",
    anchor: "3.2 VPN + tunneling + SSE/application access control (per-persona connectivity design)",
    kind: "matrix",
    hints: [
      "Site = site-to-site. Managed staff = client VPN, full tunnel, MFA + posture. Third party = per-application only (ZTNA) — vendors never enter the network.",
      "branch=s2s · field=client-full · vendor=ztna.",
      "Row 1 'Site-to-site IPsec' · Row 2 'Client VPN, full tunnel, MFA + device posture' · Row 3 'SSE / ZTNA per-application access'.",
    ],
    passFeedback:
      "Every persona now has the least access that still does the job: transparent encrypted site link, fully-inspected managed laptops, and a vendor that can touch one application and zero networks. 'Flat' and 'split-for-convenience' are the exam's favorite wrong answers.",
    failFeedback:
      "At least one persona got more access than its job requires. Test each option against the principle: networks are not given to people (or vendors) — applications and tunnels are.",
    validate: (e) => e.matrix["branch"] === "s2s" && e.matrix["field"] === "client-full" && e.matrix["vendor"] === "ztna",
  },
  {
    id: "OBJ-H5",
    mode: "hard",
    title: "Execute the full identity remediation from the entitlement review",
    brief:
      "From E-05 alone: name the creep account and fix it, handle the orphaned account of the departed employee, and migrate both static service accounts. Four decisions — near-misses are rejected.",
    pillar: "P2",
    anchor: "3.2 identity management — privilege creep, least privilege, gMSAs, user management lifecycle",
    kind: "identity",
    hints: [
      "Four fields: creep account + its fix, orphan fix, and the two gMSA switches. 'Monitor' is not a lifecycle action for an active account of someone who left.",
      "j.hollis · revoke/recertify · orphan → deprovision · svc_backup & svc_web → gMSA ON.",
      "Creep='j.hollis', fix='Revoke/recertify'; orphan fix='Deprovision'; Identity switches both ON.",
    ],
    passFeedback:
      "Full lifecycle handling: least privilege restored (creep), access removed at separation (orphan), and service secrets delegated to auto-rotating gMSAs. This is 3.2's identity bullet exercised end to end.",
    failFeedback:
      "Incomplete or over-broad. E-05 lists exactly one creep account, one orphan, and two gMSA candidates — and the orphaned account of a departed employee has one correct lifecycle action.",
    validate: (e) => e.flags.creepAccount === "j.hollis" && e.flags.creepFix === "revoke" && e.flags.orphanFix === "deprovision" && e.flags.gmsaBackup && e.flags.gmsaWeb,
  },
  {
    id: "OBJ-H6",
    mode: "hard",
    title: "Adjudicate the OT protection proposal for the unpatchable HMI",
    brief:
      "HMI-01 runs an EOL OS that cannot be patched. Three proposals are on the table (patch it, micro-segment with one-way telemetry, or keep it flat but monitored). Choose, then configure the OT link to match your decision.",
    pillar: "P4",
    anchor: "3.2 security zones/segmentation applied to OT; diversity of controls; risk trade-off decision",
    kind: "env",
    hints: [
      "You cannot patch what has no patches. What remains: shrink what can reach it, and let data out without letting anything in.",
      "Choose 'micro-segment + one-way telemetry', then set CORP-OT: micro-seg ON, one-way export ON.",
      "Objective panel: select the micro-segmentation proposal; schematic: CORP↔OT link → both toggles ON.",
    ],
    passFeedback:
      "Correct under real constraints: isolation replaces patching when patching is impossible, and the one-way export gives monitoring without handing plant control eastward. Flat-but-monitored only documents the breach faster.",
    failFeedback:
      "Rejected — 'patch' is unavailable for an EOL OS and 'flat but monitored' accepts the IR-2411 path as permanent. Pick the proposal that changes what can reach HMI-01, then set the two CORP-OT toggles to match.",
    validate: (e) => e.flags.otProposal === "microseg-oneway" && linkCfg(e, "CORP-OT").microseg && linkCfg(e, "CORP-OT").oneway,
  },
  {
    id: "OBJ-H7",
    mode: "hard",
    title: "Sit the design review board: approve or reject all six proposals",
    brief:
      "Vendor proposal V-9 (E-06) mixes sound engineering with plausible nonsense. Rule on each of the six proposals. Wrong stamps are rejected with the reason.",
    pillar: "P1",
    anchor: "3.2 zones + tunneling + diversity + 802.1X + DMZ direction (applied judgment across the chapter)",
    kind: "review",
    hints: [
      "Two proposals align with the standard and with defense-in-depth; four contradict segmentation, tunneling policy, diversity or DMZ direction.",
      "Approve: b (DMZ default-deny) and e (802.1X + quarantine). Reject: a, c, d, f.",
      "a REJECT (flat network) · b APPROVE · c REJECT (convenience) · d REJECT (single vendor) · e APPROVE · f REJECT (DMZ must not initiate inward).",
    ],
    passFeedback:
      "Board-worthy judgment: you rejected every proposal that recreates implicit trust and approved exactly the two the standard itself prescribes. This is the Analyze/Evaluate tier of the exam's PBQs.",
    failFeedback:
      "At least one stamp is wrong. Test each proposal against E-07 and IR-2411: does it shrink the attack surface and remove implicit trust — or trade security for convenience and simplicity?",
    validate: (e) => REVIEW_OK.every((p) => e.review[p.id] === p.correct),
  },
  {
    id: "OBJ-H8",
    mode: "hard",
    title: "Run the attack-surface audit: close exactly the three real exposures",
    brief:
      "The audit lists six findings; exactly three are genuine attack-surface reductions, three are traps (breaking services, or concentrating risk). Select only the three that should be closed.",
    pillar: "P3",
    anchor: "3.2 attack surface (+ secure file transfer / E2EE context)",
    kind: "surface",
    hints: [
      "A finding qualifies if removing it removes real exposure without removing a needed service — and if it doesn't concentrate risk.",
      "Exposed RDP through NAT, Telnet device admin, legacy FTP on the web server. The other three are availability or diversity traps.",
      "Check: rdp-nat, telnet-br, ftp-web. Leave the other three unchecked.",
    ],
    passFeedback:
      "Surgical. Exposed remote administration (RDP/Telnet) and a legacy FTP service are pure exposure; DNS, TLS and single-vendor 'fixes' would degrade the estate instead of shrinking its surface.",
    failFeedback:
      "Not exactly three — or a trap got in. Read each 'why' on rejection: breaking DNS/TLS harms availability, and single-vendor consolidation enlarges risk rather than surface.",
    validate: (e) => SURFACE_OK.every((s) => (e.surface[s.id] ?? false) === s.close),
  },
  {
    id: "OBJ-H9",
    mode: "hard",
    title: "Set failure modes per context — not one rule for everything",
    brief:
      "Failure modes are a per-context decision. Assign fail-open or fail-closed to the three contexts (perimeter firewall, NAC port enforcement, non-critical MES↔ERP sync). The same answer for all three is wrong.",
    pillar: "P1",
    anchor: "3.2 failure modes — contextual fail-safe vs fail-availability decisions",
    kind: "failctx",
    hints: [
      "Ask per context: which is cheaper — brief unavailability, or silent exposure? Security boundary vs convenience integration.",
      "Perimeter=fail-closed · NAC=fail-closed · MES sync (non-critical, monitored)=fail-open.",
      "Contexts 1 and 2 fail closed; the monitored, non-critical sync job fails open.",
    ],
    passFeedback:
      "Nuanced and correct: boundaries fail shut, availability-tolerable integrations may fail open — each with eyes on it. This per-context reasoning is exactly what the objective's 'failure modes' bullet tests.",
    failFeedback:
      "A uniform choice was applied. Reason per context: an open perimeter or an open unauthenticated port recreates the flat network; a monitored inventory sync stopping everything for a blip serves no one.",
    validate: (e) => FAILCTX_OK.every((c) => e.failctx[c.id] === c.correct),
  },
];

const ALL_OBJECTIVES = [...MEDIUM_OBJECTIVES, ...HARD_OBJECTIVES];
function objectivesFor(mode) {
  return mode === "medium" ? MEDIUM_OBJECTIVES : HARD_OBJECTIVES;
}
const PILLAR_LABEL = {
  P1: "Understand",
  P2: "Recognize / Analyze",
  P3: "Detect",
  P4: "Mitigate / Implement",
};
