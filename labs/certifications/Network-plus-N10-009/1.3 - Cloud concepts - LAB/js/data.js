// ── LZ-MERIDIAN static · data.js ──
// Ported 1:1 from src/lib/lab/data.ts (types erased; logic and strings untouched).
'use strict';
// ── LZ-MERIDIAN · Content data ─────────────────────────────────────────────
// All data is SYNTHETIC TRAINING DATA for CompTIA Network+ N10-009 · 1.3.
// Fictitious org: Aerolune Cargo (air-freight carrier, hub: Meridian Intl).
// IPs use RFC 1918 private space + RFC 5737 documentation ranges only.


const LAB_TAG = 'LZ-MERIDIAN';
const EXAM_TAG = 'N10-009 · 1.3 Cloud concepts & connectivity';

// ── Seed NSG table (shared by both modes) ──────────────────────────────────
const SEED_NSG_RULES = [
  { id: 'r-ssh', priority: 110, direction: 'in', action: 'allow', protocol: 'TCP', port: 22, source: '0.0.0.0/0', tag: 'MGMT-SSH (temporary)' },
  { id: 'r-deny8443', priority: 120, direction: 'in', action: 'deny', protocol: 'TCP', port: 8443, source: '0.0.0.0/0', tag: 'Legacy block on app port' },
  { id: 'r-8443corp', priority: 130, direction: 'in', action: 'allow', protocol: 'TCP', port: 8443, source: '10.20.6.0/24', tag: 'Ops subnet → app port' },
  { id: 'r-out443', priority: 140, direction: 'out', action: 'allow', protocol: 'TCP', port: 443, source: '0.0.0.0/0', tag: 'Patch egress' },
  { id: 'r-rdp', priority: 150, direction: 'in', action: 'allow', protocol: 'TCP', port: 3389, source: '0.0.0.0/0', tag: 'MGMT-RDP (temporary)' },
  { id: 'r-out8443', priority: 160, direction: 'out', action: 'allow', protocol: 'TCP', port: 8443, source: '0.0.0.0/0', tag: 'App egress 8443' },
];

// ── Simulator probe presets (concrete, RFC-5737/RFC1918) ───────────────────

const PROBE_PRESETS = [
  { id: 'sim-web', label: 'Customer → Web tier :443', fromIp: '198.51.100.10', fromZone: 'internet', toIp: '10.200.1.10', toZone: 'public', port: 443, protocol: 'TCP', note: 'Inbound shopping traffic to the public web tier.' },
  { id: 'sim-patch', label: 'Private VM → Patch mirror :443', fromIp: '10.200.2.10', fromZone: 'private', toIp: '203.0.113.20', toZone: 'internet', port: 443, protocol: 'TCP', note: 'Outbound patch pull from the private app subnet.' },
  { id: 'sim-probe', label: 'Patch mirror ⇢ Private VM :443', fromIp: '203.0.113.20', fromZone: 'internet', toIp: '10.200.2.10', toZone: 'private', port: 443, protocol: 'TCP', note: 'Unsolicited inbound probe — nobody asked for this.' },
  { id: 'sim-admin', label: 'HQ admin → Private VM :22', fromIp: '10.20.6.4', fromZone: 'hq', toIp: '10.200.2.10', toZone: 'private', port: 22, protocol: 'TCP', note: 'Administration session from HQ across the tunnel.' },
  { id: 'sim-scan', label: 'HQ scanner (10.20.5.4) → App VM :8443', fromIp: '10.20.5.4', fromZone: 'hq', toIp: '10.200.2.10', toZone: 'private', port: 8443, protocol: 'TCP', note: 'Vulnerability scanner hitting the app port.' },
];

const PRIVATE_SUBNET_CIDR = '10.200.2.0/24';
const PUBLIC_SUBNET_CIDR = '10.200.1.0/24';
const HQ_CIDR = '10.20.0.0/16';

// ── Gateway flows (M6 medium = first four · H5 hard = all five) ────────────
const GATEWAY_FLOWS = [
  { id: 'flow-web-in', label: 'Internet customers → Web tier (inbound HTTPS)', wants: 'igw' },
  { id: 'flow-egress', label: 'Private app subnet → Internet (outbound patches only)', wants: 'nat' },
  { id: 'flow-hq-vpn', label: 'HQ branch ↔ VPC (site-to-site admin tunnel)', wants: 'vpngw' },
  { id: 'flow-dc-sync', label: 'HQ datacenter → VPC (nightly 2 TB sync, 99.99% SLA)', wants: 'direct' },
  { id: 'flow-spokes', label: 'Two other Aerolune VPCs ↔ this VPC (spoke interconnect)', wants: 'transit' },
];

const GATEWAY_BANK = [
  { id: 'igw', label: 'Internet gateway (IGW)' },
  { id: 'nat', label: 'NAT gateway' },
  { id: 'vpngw', label: 'VPN gateway (site-to-site IPsec)' },
  { id: 'direct', label: 'Direct Connect (dedicated circuit)' },
  { id: 'transit', label: 'Transit gateway (hub)' },
  { id: 'storagegw', label: 'Storage gateway (hybrid file/volume bridge)' },
];

// ── Commissioning sequence bank (H5) ───────────────────────────────────────
const SEQ_STEPS = [
  { id: 'step-cidr', label: 'Reserve non-overlapping CIDR space' },
  { id: 'step-subnets', label: 'Create public/private subnets + route tables' },
  { id: 'step-gateways', label: 'Attach gateways (IGW · NAT · VPN · Direct Connect)' },
  { id: 'step-nsg', label: 'Apply least-privilege NSG rules' },
  { id: 'step-test', label: 'Validate with test traffic and flow logs' },
];
const SEQ_CORRECT = ['step-cidr', 'step-subnets', 'step-gateways', 'step-nsg', 'step-test'];

// ── Sorting deck: M1 workloads (medium) ────────────────────────────────────
const M1_WORKLOADS = [
  { id: 'm1-mail', label: 'Vendor-run mail & docs suite (like Microsoft 365)', hint: 'You only manage users and settings.' },
  { id: 'm1-erp', label: 'Ubuntu VM fleet running legacy ERP — you patch the OS', hint: 'You manage the guest OS and everything above.' },
  { id: 'm1-micro', label: 'Microservices pushed to a managed runtime with build pipeline', hint: 'You deploy code; the vendor runs OS and runtime.' },
  { id: 'm1-crm', label: 'CRM platform the sales team just logs into', hint: 'Nobody at Aerolune touches its servers.' },
  { id: 'm1-hadoop', label: 'Self-managed Hadoop cluster on raw VMs', hint: 'Raw compute you administer from OS up.' },
  { id: 'm1-pg', label: 'Managed PostgreSQL — vendor patches the engine', hint: 'Database-as-a-service: you manage data, not engine.' },
];

const M1_ANSWERS = {
  'm1-mail': 'SaaS',
  'm1-erp': 'IaaS',
  'm1-micro': 'PaaS',
  'm1-crm': 'SaaS',
  'm1-hadoop': 'IaaS',
  'm1-pg': 'PaaS',
};

// ── H1 hard manifest (10 rows, 3 seeded-wrong, 2 red herrings) ─────────────
const H1_MANIFEST = [
  { id: 'w-mail', label: 'Corp mail & docs suite (vendor-run)', seeded: 'SaaS', correct: 'SaaS', note: 'Vendor runs everything; Aerolune configures users.' },
  { id: 'w-crm', label: 'Salesforce-style CRM subscription', seeded: 'IaaS', correct: 'SaaS', note: 'MISFILED — nobody manages servers for a CRM subscription.' },
  { id: 'w-pg', label: 'Managed PostgreSQL (vendor patches engine)', seeded: 'PaaS', correct: 'PaaS', note: 'Correct as filed — a managed engine is platform, not raw VMs.' },
  { id: 'w-erp', label: 'Ubuntu fleet running legacy ERP — we patch the OS', seeded: 'PaaS', correct: 'IaaS', note: 'MISFILED — OS-level control is the IaaS signature.' },
  { id: 'w-sql', label: 'Managed SQL platform (engine & OS vendor-managed)', seeded: 'IaaS', correct: 'PaaS', note: 'MISFILED — vendor-managed engine/OS makes it platform.' },
  { id: 'w-hadoop', label: 'Self-managed Hadoop on raw VMs', seeded: 'IaaS', correct: 'IaaS', note: 'Correct as filed — raw compute, full stack to patch.' },
  { id: 'w-mq', label: 'Managed message queue (we manage topics/ACLs)', seeded: 'PaaS', correct: 'PaaS', note: 'Correct as filed — managed middleware is platform.' },
  { id: 'w-blob', label: 'Blob storage for CCTV clips', seeded: 'IaaS', correct: 'IaaS', note: 'Correct as filed — raw storage/compute family.' },
  { id: 'w-ci', label: 'CI builders + container registry (push code)', seeded: 'PaaS', correct: 'PaaS', note: 'Correct as filed — build platform.' },
  { id: 'w-sso', label: 'Identity SSO portal (vendor-run)', seeded: 'SaaS', correct: 'SaaS', note: 'Correct as filed — finished application.' },
];

// ── Responsibility board: M2 IaaS lane · H9 PaaS lane ──────────────────────
const RESP_ITEMS = [
  { id: 'i-phys', label: 'Physical datacenter, racks & cabling', iaas: 'provider', paas: 'provider' },
  { id: 'i-hv', label: 'Hypervisor patching', iaas: 'provider', paas: 'provider' },
  { id: 'i-os', label: 'Guest OS patching', iaas: 'customer', paas: 'provider' },
  { id: 'i-rt', label: 'Language runtime patching', iaas: 'customer', paas: 'provider' },
  { id: 'i-app', label: 'Application code & data encryption', iaas: 'customer', paas: 'customer' },
  { id: 'i-nsg', label: 'NSG / firewall rule configuration', iaas: 'customer', paas: 'customer' },
  { id: 'i-id', label: 'Cloud identities & MFA enrolment', iaas: 'customer', paas: 'customer' },
  { id: 'i-net', label: 'Physical network fabric & facility power', iaas: 'provider', paas: 'provider' },
];

// ── M3 deployment-model matching ───────────────────────────────────────────
const M3_SCENARIOS = [
  { id: 'd1', label: 'Bursty dev/test teams want zero hardware and per-minute billing on shared provider gear.', answer: 'public' },
  { id: 'd2', label: 'Cargo-manifest system under a data-sovereignty mandate: dedicated hardware, one organization only.', answer: 'private' },
  { id: 'd3', label: 'Legacy mainframe stays on-prem while seasonal analytics burst into rented capacity, orchestrated together.', answer: 'hybrid' },
  { id: 'd4', label: 'Seven regional airlines co-fund one booking platform open only to member carriers.', answer: 'community' },
];

const M3_MODELS = [
  { id: 'public', label: 'Public cloud' },
  { id: 'private', label: 'Private cloud' },
  { id: 'hybrid', label: 'Hybrid cloud' },
  { id: 'community', label: 'Community cloud' },
];

// ── M4 / H6 NFV board ──────────────────────────────────────────────────────
const M4_APPLIANCES = [
  { id: 'a-fw', label: 'Border firewall pair (HA)', answer: 'virtualize' },
  { id: 'a-rtr', label: 'Core router', answer: 'virtualize' },
  { id: 'a-lb', label: 'Load-balancer tier', answer: 'virtualize' },
  { id: 'a-ids', label: 'IDS/IPS inspection sensors', answer: 'virtualize' },
  { id: 'a-vpn', label: 'Branch VPN concentrators', answer: 'virtualize' },
  { id: 'a-dns', label: 'Recursive DNS servers', answer: 'virtualize' },
  { id: 'a-woc', label: 'Branch WAN optimizer (proprietary DSP appliance)', answer: 'physical' },
  { id: 'a-hsm', label: 'FIPS HSM for key custody (tamper-resistant required)', answer: 'physical' },
];

const H6_FUNCTIONS = [
  { id: 'b-fw', label: 'Perimeter firewall', answer: 'virtualize' },
  { id: 'b-rtr', label: 'SDN edge router', answer: 'virtualize' },
  { id: 'b-lb', label: 'East-west load balancer', answer: 'virtualize' },
  { id: 'b-ids', label: 'IPS inspection for east-west traffic', answer: 'virtualize' },
  { id: 'b-wan', label: 'Branch WAN accelerator — DSP appliance, no spare server capacity', answer: 'physical' },
  { id: 'b-hsm', label: 'HSM key custody — compliance demands tamper-resistant hardware', answer: 'physical' },
];

const H6_REASON_BANK = [
  { id: 'compliance', label: 'Compliance requires tamper-resistant hardware' },
  { id: 'hardware-bound', label: 'Proprietary hardware / no host capacity to host it' },
  { id: 'cost', label: 'Cheaper to buy hardware outright' },
  { id: 'performance', label: 'Software can never match appliance throughput' },
];

// ── M5 VPC commissioning (medium) ──────────────────────────────────────────
const M5_CIDR_OPTIONS = [
  { id: 'c1', label: '10.20.0.0/16', note: 'Matches HQ’s current range exactly' },
  { id: 'c2', label: '10.200.0.0/16', note: 'Free space reserved for cloud; room to grow' },
  { id: 'c3', label: '10.20.200.0/24', note: 'A slice carved from inside HQ’s range' },
];
const M5_CORRECT_CIDR = '10.200.0.0/16';

// ── H2 VPC audit (hard) — seeded flawed design ─────────────────────────────
const H2_SEED_SUBNETS = [
  { id: 's-web', name: 'web', cidr: '10.200.1.0/24', type: 'public' },
  { id: 's-db', name: 'db', cidr: '10.200.2.0/24', type: 'public' },
  { id: 's-cache', name: 'cache', cidr: '10.200.3.0/24', type: 'private' },
];

// ── M10 / H8 connectivity decisions ────────────────────────────────────────
const M10_FLOWS = [
  { id: 'c1', label: 'Dev/test burst from the HQ lab into the cloud', answer: 'vpn', factor: 'fast-cheap' },
  { id: 'c2', label: 'Nightly 2 TB warehouse sync', answer: 'direct', factor: 'throughput' },
  { id: 'c3', label: 'Live freight telemetry with a 99.99% latency SLA', answer: 'direct', factor: 'latency' },
];

const H8_FLOWS = [
  { id: 'd1', label: 'Dev/test burst from the HQ lab into the cloud', answer: 'vpn', factor: 'fast-cheap' },
  { id: 'd2', label: '600 branch sites aggregating into the cloud', answer: 'vpn', factor: 'scale' },
  { id: 'd3', label: 'Live freight telemetry with a 99.99% latency SLA', answer: 'direct', factor: 'latency' },
  { id: 'd4', label: 'Nightly 2 TB warehouse sync', answer: 'direct', factor: 'throughput' },
];

const FACTOR_BANK = [
  { id: 'fast-cheap', label: 'Minutes to stand up, no circuit fees; internet-grade latency is fine' },
  { id: 'throughput', label: 'Sustained multi-Gbps transfer without per-GB internet variance' },
  { id: 'latency', label: 'Predictable latency and jitter on a private circuit' },
  { id: 'scale', label: 'Internet underlay scales to hundreds of sites without a circuit each' },
  { id: 'mfa', label: 'It satisfies the MFA policy for admins' },
];

// ── M11 concept sort ───────────────────────────────────────────────────────
const M11_STATEMENTS = [
  { id: 's1', label: 'Forty unrelated companies run workloads on the same physical host, logically isolated.', answer: 'multitenancy' },
  { id: 's2', label: 'When Friday traffic doubles, 30 web VMs spin up automatically and drain away by evening.', answer: 'elasticity' },
  { id: 's3', label: 'The database VM was resized from 8 to 64 vCPUs.', answer: 'scalability' },
  { id: 's4', label: 'Four more identical web VMs joined the balancer pool.', answer: 'scalability' },
  { id: 's5', label: 'Airline A’s portal and retailer B’s store share one rack; neither can see the other’s data.', answer: 'multitenancy' },
  { id: 's6', label: 'Storage grows during ingestion week and shrinks after — billed only while used.', answer: 'elasticity' },
];

// ── M12 flow-log triage (vendor collector) ─────────────────────────────────
const M12_FLOWLOG = [
  { line: '09:41:02  10.20.7.20 → 10.200.2.10:8443  TCP  VERDICT: DENY  MATCHED-RULE: r-deny8443 (pri 120, deny 8443 in from 0.0.0.0/0)' },
  { line: '09:41:02  DNS  pkgs.aerolune.example → 10.20.7.20  OK' },
  { line: '09:41:03  10.20.6.4 → 10.200.2.10:8443  TCP  VERDICT: ALLOW  MATCHED-RULE: r-8443corp (pri 130)' },
  { line: '09:42:10  10.200.2.10 → 203.0.113.20:443  TCP  VERDICT: ALLOW  (outbound, NAT)' },
];

const M12_CAUSE_OPTIONS = [
  { id: 'cause-deny', label: 'An explicit deny at priority 120 is the first match for the collector — and no allow rule covers 10.20.7.20.' },
  { id: 'cause-dns', label: 'DNS resolution failed for the collector host.' },
  { id: 'cause-out', label: 'The outbound rules block the return traffic.' },
  { id: 'cause-nat', label: 'The private subnet has no NAT gateway.' },
];

// ── M9 answers ─────────────────────────────────────────────────────────────
const M9_VERDICT_OPTIONS = [
  { id: 'allowed', label: 'Allowed' },
  { id: 'denied', label: 'Denied' },
];
const M9_REASON_OPTIONS = [
  { id: 'no-allow', label: 'No inbound allow rule covers the probe, and stateful auto-return only applies to established outbound sessions — this probe is new.' },
  { id: 'explicit-deny', label: 'An explicit inbound deny rule for port 443 blocks it.' },
  { id: 'nat-block', label: 'NAT gateways block all inbound traffic by design, even replies.' },
];
const M9_NSL_OPTIONS = [
  { id: 'nsl-return', label: 'Explicit return rules must be added in both directions (including ephemeral ports) — lists are stateless.' },
  { id: 'nsl-none', label: 'Nothing — lists behave exactly like security groups.' },
  { id: 'nsl-bigger', label: 'A larger NAT gateway must be attached.' },
];

// ── H7 final question ──────────────────────────────────────────────────────
const H7_OPTIONS = [
  { id: 'h7-nat', label: 'The NAT gateway is failing again — replace it.' },
  { id: 'h7-stateful', label: 'Expected behaviour: stateful default deny — no inbound allow covers unsolicited flows; the outbound session’s return path is not this probe.' },
  { id: 'h7-ip', label: 'The private VM needs a static public IP.' },
];

// ── Objectives (Medium 12 · Hard 9) ────────────────────────────────────────
const OBJECTIVES = [
  // ── MEDIUM ──
  { id: 'M1', mode: 'medium', pillar: 'P1', order: 1, title: 'Sort the six incoming workloads into the correct service-model trays (SaaS / PaaS / IaaS).', brief: 'The migration manifest’s first six rows just arrived at the sorting deck. Decide who manages what: the vendor only, the vendor up to the runtime, or you from the OS up.', anchor: 'Service models — SaaS / IaaS / PaaS (N10-009 1.3)', toolKey: 'sorting', hints: ['Ask: who patches the operating system? If the answer is “nobody here”, it is not IaaS.', 'SaaS = finished application you log into. PaaS = you push code/data onto a vendor-managed runtime. IaaS = raw VMs/storage you administer.', 'Mail suite & CRM → SaaS · managed Postgres & microservice runtime → PaaS · ERP VM fleet & Hadoop → IaaS.'] },
  { id: 'M2', mode: 'medium', pillar: 'P1', order: 2, title: 'Assign each of the eight operations to Provider or Customer on the shared-responsibility board (IaaS lane).', brief: 'The ERP VM fleet lands as IaaS. Place every operation on the correct side of the responsibility line.', anchor: 'Service models — shared responsibility (IaaS lane)', toolKey: 'sorting', hints: ['The provider owns everything from the hypervisor down; you own everything from the guest OS up.', 'Physical plant and hypervisor = provider. Guest OS, code, NSG rules, identities = customer.', 'Datacenter/hypervisor/network fabric → Provider · OS patching, app data, NSG config, MFA → Customer.'] },
  { id: 'M3', mode: 'medium', pillar: 'P1', order: 3, title: 'Match each of the four scenarios to its deployment model (public / private / hybrid / community).', brief: 'Four Aerolune project proposals just landed. Community cloud is on the board too — it is the adjacent model the exam expects you to recognize.', anchor: 'Deployment models — public, private, hybrid (+ community as adjacent)', toolKey: 'sorting', hints: ['Whose infrastructure is it, and who can use it?', 'Shared provider gear for anyone = public · dedicated single-org = private · orchestrated mix = hybrid · shared by organisations with common needs = community.', 'Dev/test burst → public · sovereignty system → private · mainframe + burst → hybrid · airline consortium → community.'] },
  { id: 'M4', mode: 'medium', pillar: 'P2', order: 4, title: 'Flag which appliances on the NFV migration sheet become virtual network functions — and which must stay physical.', brief: 'NFV turns network appliances into software (VNFs) on commodity servers. Two items on the sheet cannot make that jump — find them.', anchor: 'NFV — VNFs, hypervisors, virtual vs physical appliances', toolKey: 'sorting', hints: ['A VNF is just software: firewalls, routers, balancers, IDS all virtualize happily.', 'Look for items whose value is the physical box itself — proprietary hardware or legally mandated hardware.', 'Everything virtualizes except the DSP-based WAN optimizer and the FIPS HSM.'] },
  { id: 'M5', mode: 'medium', pillar: 'P2', order: 5, title: 'Commission the VPC: pick a CIDR that does not collide with HQ, then create the public web subnet and the private app subnet.', brief: 'HQ already runs 10.20.0.0/16. Reserve the cloud block, then carve web (public) and app/db (private) /24s from it.', anchor: 'VPC — CIDR blocks, public vs private subnets', toolKey: 'subnets', hints: ['A CIDR that overlaps HQ’s 10.20.0.0/16 will break routing on day one.', 'Take the block reserved for cloud, then cut /24s from it: web from .1.x, app/db from .2.x.', 'CIDR = 10.200.0.0/16 · web = 10.200.1.0/24 (public) · app/db = 10.200.2.0/24 (private).'] },
  { id: 'M6', mode: 'medium', pillar: 'P2', order: 6, title: 'Wire each of the four traffic flows to its correct gateway.', brief: 'Inbound customers, outbound patches, the HQ tunnel, and the nightly 2 TB sync each need the right front door. Two distractor gateways are on the bench.', anchor: 'Cloud gateways (IGW, NAT) + connectivity options (VPN gateway, Direct Connect)', toolKey: 'gateways', hints: ['Public inbound needs the internet gateway; private outbound-only egress needs NAT.', 'Site-to-site tunnel from HQ = VPN gateway; the SLA-bound bulk sync = the dedicated circuit.', 'web-in → IGW · egress → NAT · HQ tunnel → VPN gateway · 2 TB sync → Direct Connect.'] },
  { id: 'M7', mode: 'medium', pillar: 'P4', order: 7, title: 'Author the inbound NSG rule that lets HTTPS reach the web tier from anywhere.', brief: 'The seed table has no web rule yet. Add: allow · inbound · TCP · 443 · source 0.0.0.0/0, with a sensible priority.', anchor: 'NSG rule structure — priority, direction, action, protocol, port, source CIDR', toolKey: 'screening', hints: ['Rules need: priority (lower = evaluated first), direction in, action allow, protocol TCP, port 443, source 0.0.0.0/0.', 'Any priority from 10–4095 works; pick something below the default-deny noise.', 'Example: priority 100, in, allow, TCP, 443, 0.0.0.0/0, tag WEB.'] },
  { id: 'M8', mode: 'medium', pillar: 'P4', order: 8, title: 'Close the hole: SSH (22) is open to the whole internet. Restrict it to HQ’s CIDR.', brief: 'Rule r-ssh (priority 110) allows TCP/22 from 0.0.0.0/0 — an auditor’s nightmare. Edit its source to HQ’s 10.20.0.0/16.', anchor: 'NSG least privilege — default deny, restrict management ports', toolKey: 'screening', hints: ['Least privilege = only HQ admins may reach SSH.', 'Edit the r-ssh row: change source from 0.0.0.0/0 to 10.20.0.0/16.', 'Result: no inbound allow/22 from 0.0.0.0/0 remains, and an in/allow/22 from 10.20.0.0/16 exists.'] },
  { id: 'M9', mode: 'medium', pillar: 'P3', order: 9, title: 'Run the packet simulator: prove the outbound patch pull works and the unsolicited probe fails — then explain both, and the stateless-list contrast.', brief: 'Run probes “Private VM → Patch mirror :443” and “Patch mirror ⇢ Private VM :443”, record both verdicts, answer why, and answer the security-list question.', anchor: 'NSG statefulness vs stateless security lists + NAT egress', toolKey: 'screening', hints: ['Run sim-patch first; its success creates the established session the stateful engine remembers.', 'The probe is a NEW unsolicited flow — no inbound allow rule covers it, and statefulness only auto-allows return traffic of established sessions.', 'Verdicts: outbound = allowed · probe = denied · reason = “no-allow” option · lists = “nsl-return” option.'] },
  { id: 'M10', mode: 'medium', pillar: 'P4', order: 10, title: 'Choose VPN or Direct Connect for each of the three connectivity flows — and pick the deciding factor for each.', brief: 'Cost and speed of delivery versus predictable latency and throughput. Justify each pick with the matching factor from the bank.', anchor: 'Connectivity options — VPN vs Direct Connect trade-offs', toolKey: 'decisions', hints: ['VPN = over the internet, fast and cheap, variable latency. Direct Connect = private circuit, predictable, pricier.', 'Dev/test burst values speed-of-delivery and cost; SLA telemetry values latency; bulk sync values sustained throughput.', 'c1 → VPN + fast-cheap · c2 → Direct Connect + throughput · c3 → Direct Connect + latency.'] },
  { id: 'M11', mode: 'medium', pillar: 'P1', order: 11, title: 'Classify the six statements as multitenancy, elasticity, or scalability.', brief: 'Three properties every cloud pitch leans on. Two statements per bucket — one of the scalability pair is vertical, one horizontal.', anchor: 'Scalability (vertical/horizontal) · elasticity · multitenancy', toolKey: 'sorting', hints: ['Multitenancy = many unrelated customers, one physical platform. Elasticity = automatic add/remove with demand.', 'Bigger single box = vertical scalability; more identical boxes = horizontal scalability.', 's1 & s5 → multitenancy · s2 & s6 → elasticity · s3 & s4 → scalability.'] },
  { id: 'M12', mode: 'medium', pillar: 'P3', order: 12, title: 'Triage the flow log: why can the monitoring collector not reach the app VM on 8443, and what is the minimal fix?', brief: 'Read the flow-log excerpt on the Decision Desk, pick the true cause, then record the fix: destination port and a priority that beats the deny.', anchor: 'Flow-log reading + NSG priority-order diagnosis', toolKey: 'decisions', hints: ['Find the DENY line and read its MATCHED-RULE column — which rule actually fired?', 'The collector (10.20.7.20) is outside the ops subnet, and the legacy deny at priority 120 matches before any default. A fix must allow TCP 8443 from 10.20.7.20 with priority < 120.', 'Cause = “cause-deny” · fix port = 8443 · fix priority = any number below 120.'] },
  // ── HARD ──
  { id: 'H1', mode: 'hard', pillar: 'P2', order: 1, title: 'Manifest triage: exactly three rows are filed under the wrong service model. Find them and correct all ten rows.', brief: 'The Discovery Dossier’s manifest is noisy — two rows look wrong but are filed correctly (managed engine, managed queue). Trust the definition, not the vibe: who manages the OS and the runtime?', anchor: 'Service models — SaaS / PaaS / IaaS + shared responsibility', toolKey: 'sorting', hints: ['Re-file by control: OS access = IaaS, vendor-managed engine/runtime = PaaS, finished app = SaaS.', 'Red herrings: managed PostgreSQL and the managed message queue are PaaS exactly as filed.', 'Fix rows: CRM (→ SaaS), Ubuntu ERP fleet (→ IaaS), managed SQL platform (→ PaaS).'] },
  { id: 'H2', mode: 'hard', pillar: 'P3', order: 2, title: 'VPC design audit: the proposed LZ design carries exactly three flaws. Fix the CIDR, the misplaced DB subnet, and the wrong private route target.', brief: 'The design sheet conflicts with the HQ address plan and strands the database on a public path. Two more items look suspicious but are intentional (documented jump host and NTP in the public subnet) — leave them.', anchor: 'VPC — CIDR overlap, public/private subnet placement, route tables', toolKey: 'subnets', hints: ['Flaw 1: the chosen CIDR collides with HQ’s 10.20.0.0/16.', 'Flaw 2: the db subnet is marked public. Flaw 3: the private route 0.0.0.0/0 points at the internet gateway instead of the NAT gateway.', 'Set CIDR = 10.200.0.0/16 · db type = private · route target = NAT.'] },
  { id: 'H3', mode: 'hard', pillar: 'P3', order: 3, title: 'NSG forensics: the vulnerability scanner (10.20.5.4) is denied on 8443. Diagnose the cause and author the minimal rule that fixes it.', brief: 'The ops-subnet allow (10.20.6.0/24) does not cover the scanner, and a legacy deny sits at priority 120. Prove the fix by re-running the scanner probe in the simulator.', anchor: 'NSG rule processing — first-match by priority, direction, CIDR scoping', toolKey: 'screening', hints: ['Evaluation is first-match, lowest priority number wins.', 'Add: in · allow · TCP · 8443 · source 10.20.5.4/32 · priority strictly below 120.', 'Then run the “HQ scanner → App VM :8443” probe and confirm ALLOW.'] },
  { id: 'H4', mode: 'hard', pillar: 'P4', order: 4, title: 'Least-privilege sweep: bring the screening table to exactly the approved five-rule set — no world-open management ports, no dead rules.', brief: 'Approved set: web HTTPS from anywhere · SSH from HQ only · patch egress 443 out · app 8443 from the ops subnet · app 8443 from the scanner /32. Everything else goes.', anchor: 'NSG least privilege — exact-state hardening', toolKey: 'screening', hints: ['Delete the RDP rule and the legacy 8443 deny; restrict SSH to 10.20.0.0/16; make sure the web 443 allow and the scanner 8443 /32 exist.', 'Final table must contain exactly five rules — extras and world-open management ports both fail.', 'Required five: in/443/0.0.0.0/0 · in/22/10.20.0.0/16 · out/443 · in/8443/10.20.6.0/24 · in/8443/10.20.5.4/32.'] },
  { id: 'H5', mode: 'hard', pillar: 'P4', order: 5, title: 'Gateway architecture: wire all five flows to the correct gateways, then place the five commissioning steps in the correct order.', brief: 'The full landing zone: inbound web, private egress, HQ tunnel, SLA sync, and VPC-to-VPC spokes. One bank entry is a decoy. Then sequence the build.', anchor: 'Cloud gateways + connectivity options + commissioning order', toolKey: 'gateways', hints: ['Spoke-to-spoke interconnection is the transit gateway’s whole job; the storage-gateway entry is the decoy.', 'web-in → IGW · egress → NAT · HQ tunnel → VPN gateway · 2 TB sync → Direct Connect · spokes → transit gateway.', 'Order: CIDR → subnets → gateways → NSG → validate.'] },
  { id: 'H6', mode: 'hard', pillar: 'P2', order: 6, title: 'NFV placement board: decide virtualize vs keep-physical for all six functions, then attach the correct justification to each keep-physical pick.', brief: 'Constraints are in the labels. “Software can never match hardware” is NOT a valid reason on this board — pick from the bank.', anchor: 'NFV — VNF placement limits and justifications', toolKey: 'sorting', hints: ['Firewall, router, balancer, IPS all virtualize.', 'The DSP accelerator is hardware-bound; the HSM is a compliance requirement.', 'b-wan → physical + “hardware-bound” · b-hsm → physical + “compliance”.'] },
  { id: 'H7', mode: 'hard', pillar: 'P3', order: 7, title: 'Patch-outage runbook: capture the failing probe, wire the fix, prove recovery — then explain why the unsolicited probe still fails.', brief: 'Sequence matters and is checked: (1) run the outbound patch probe and capture its DENY, (2) wire the missing gateway on the Gateways bench, (3) re-run the probe to ALLOW, (4) answer the final question about the unsolicited probe.', anchor: 'NAT gateway egress + stateful default deny (diagnosis sequence)', toolKey: 'screening', hints: ['Run “Private VM → Patch mirror :443” before touching anything and note the verdict.', 'The deny reason tells you which gateway is missing — wire flow-egress to it on the Gateways bench, then re-run until ALLOW.', 'The unsolicited probe still fails by design: stateful default deny — answer “h7-stateful”.'] },
  { id: 'H8', mode: 'hard', pillar: 'P4', order: 8, title: 'Procurement matrix: pick VPN or Direct Connect for all four flows with the deciding factor each — then answer the encryption trap.', brief: 'Four very different flows, one factor bank, one decoy factor. And before sign-off: which of the two options ships unencrypted by default?', anchor: 'Connectivity options — VPN vs Direct Connect trade-offs + encryption gap', toolKey: 'decisions', hints: ['Two flows favour the internet underlay (cost, scale), two favour the private circuit (latency, throughput).', 'd1 → VPN + fast-cheap · d2 → VPN + scale · d3 → Direct Connect + latency · d4 → Direct Connect + throughput.', 'The trap: Direct Connect is NOT encrypted by default — it needs an IPsec/MACsec overlay.'] },
  { id: 'H9', mode: 'hard', pillar: 'P1', order: 9, title: 'Shared-responsibility audit (PaaS lane): place all eight operations on the provider/customer board for the managed-runtime platform.', brief: 'Same board as your IaaS days — but the lane changed to PaaS, so two operations flip sides. Get all eight right.', anchor: 'Service models — shared responsibility (PaaS lane)', toolKey: 'sorting', hints: ['On PaaS the provider takes the guest OS and the runtime; you keep code/data, NSG rules and identities.', 'Compare with IaaS: OS patching and runtime patching both move to the provider.', 'Provider: physical, hypervisor, OS, runtime, fabric/power · Customer: app code, NSG config, identities/MFA.'] },
];

// ── Quiz ───────────────────────────────────────────────────────────────────
// R4: correct-answer positions rotate (medium c,a,d,b,a,c · hard b,d,a,c,b,a,d).
// R5: the correct option is never the longest; all options are similar in
// length, structure and plausibility, so nothing gives the answer away.
const QUIZ = [
  // Medium (6 concept questions)
  { id: 'q-m1', mode: 'medium', topic: 'Deployment models', prompt: 'A freight-claims system must run on hardware dedicated to Aerolune only, operated by a provider, with cloud-style self-service. Which deployment model fits?', options: [{ key: 'a', label: 'Public cloud' }, { key: 'b', label: 'Hybrid cloud' }, { key: 'c', label: 'Private cloud' }, { key: 'd', label: 'Community cloud' }], answerKey: 'c', explanation: 'Private cloud = single-tenant infrastructure dedicated to one organization, even when a provider operates it. Public is shared multitenant gear, hybrid needs an orchestrated on-prem/public mix, and community is shared by several organizations — none of which the scenario describes.' },
  { id: 'q-m2', mode: 'medium', topic: 'IaaS shared responsibility', prompt: 'Under IaaS, who patches the guest operating system?', options: [{ key: 'a', label: 'The customer' }, { key: 'b', label: 'The provider' }, { key: 'c', label: 'The hardware vendor' }, { key: 'd', label: 'The compliance office' }], answerKey: 'a', explanation: 'IaaS draws the line at the hypervisor: the provider owns everything below it, the customer everything from the guest OS up. The hardware vendor only sells parts, and the compliance office audits rather than patches — misreading this split is how unpatched customer VMs get blamed on the cloud.' },
  { id: 'q-m3', mode: 'medium', topic: 'NAT gateway egress', prompt: 'Private-subnet VMs must download vendor patches from the internet, but nothing on the internet may initiate a session to them. What do you attach?', options: [{ key: 'a', label: 'An internet gateway' }, { key: 'b', label: 'A transit gateway' }, { key: 'c', label: 'A storage gateway' }, { key: 'd', label: 'A NAT gateway' }], answerKey: 'd', explanation: 'A NAT gateway gives private subnets outbound-only egress: sessions the VMs start can return, but unsolicited inbound is impossible. An internet gateway is bidirectional for public subnets, a transit gateway interconnects VPCs, and a storage gateway moves files rather than packets.' },
  { id: 'q-m4', mode: 'medium', topic: 'Stateful NSGs', prompt: 'A VM sends an outbound HTTPS request through its NSG. What happens to the reply packets?', options: [{ key: 'a', label: 'They need an explicit inbound allow rule' }, { key: 'b', label: 'They flow automatically — NSGs are stateful' }, { key: 'c', label: 'They arrive only through a NAT translation' }, { key: 'd', label: 'They are dropped by the default posture' }], answerKey: 'b', explanation: 'NSGs are stateful: return traffic of an allowed session is permitted automatically, with no matching inbound rule and no NAT involved. The explicit-rule and reply-port answers describe a stateless security list, and the default-posture answer describes brand-new unsolicited flows, not established sessions.' },
  { id: 'q-m5', mode: 'medium', topic: 'NFV', prompt: 'What is the core promise of NFV?', options: [{ key: 'a', label: 'Network functions run as software on commodity servers' }, { key: 'b', label: 'Network functions gain dedicated physical expansion slots' }, { key: 'c', label: 'Network traffic skips the hypervisor for lower latency' }, { key: 'd', label: 'Network teams shrink because appliances need no patching' }], answerKey: 'a', explanation: 'NFV decouples network functions (firewall, router, balancer, IDS) from dedicated hardware: they become VNFs — VMs or containers on commodity hosts, deployable in minutes and orchestrated centrally. Physical slots describe the appliance era, hypervisor bypass is a NIC optimization rather than NFV itself, and VNFs still need patching.' },
  { id: 'q-m6', mode: 'medium', topic: 'VPN vs Direct Connect', prompt: 'When is a dedicated Direct Connect circuit the better choice than a site-to-site VPN?', options: [{ key: 'a', label: 'When the branch needs connectivity within the hour' }, { key: 'b', label: 'When encryption must exist by default on the link' }, { key: 'c', label: 'When predictable latency and sustained bandwidth matter most' }, { key: 'd', label: 'When the site lacks any usable ISP line' }], answerKey: 'c', explanation: 'Direct Connect buys predictable latency, jitter and sustained multi-Gbps throughput on a private circuit — at higher cost and slower provisioning than VPN. Inside-the-hour delivery is VPN territory, encryption-by-default is a VPN property (Direct Connect is NOT encrypted by default), and no ISP line rules out both options.' },
  // Hard (7 scenario applications)
  { id: 'q-h1', mode: 'hard', topic: 'NSG first-match evaluation', prompt: 'Flow log: 10.20.5.4 → 10.200.2.10:8443 DENY (matched r-deny8443, priority 120). The table also holds r-8443corp: allow 8443 in from 10.20.6.0/24 at priority 130. Why was the scanner denied?', options: [{ key: 'a', label: 'Deny actions always outrank allow actions in NSG tables' }, { key: 'b', label: 'The scanner is outside 10.20.6.0/24 — the deny matched first' }, { key: 'c', label: 'Outbound rules blocked the return path of the scan' }, { key: 'd', label: 'The subnet lacks a NAT gateway for inbound scans' }], answerKey: 'b', explanation: 'NSG evaluation is first-match by ascending priority — deny does not outrank allow, and outbound or NAT reasoning misreads the direction. The scanner sits outside the ops /24, so the corp allow at 130 never applied; the legacy deny at 120 fired first. Fix: allow 10.20.5.4/32 at a priority below 120.' },
  { id: 'q-h2', mode: 'hard', topic: 'Stateless security lists', prompt: 'You swap a subnet’s NSG for a stateless network security list and keep one inbound allow rule. What else must you add?', options: [{ key: 'a', label: 'Nothing — the list inherits the NSG’s session state' }, { key: 'b', label: 'A second NAT gateway for the reply traffic' }, { key: 'c', label: 'A route table entry for every VM in the subnet' }, { key: 'd', label: 'Explicit return rules for the ephemeral reply ports' }], answerKey: 'd', explanation: 'Security lists are stateless: replies are not remembered, so both directions of every session need explicit rules — including the ephemeral reply ports. Lists inherit nothing from NSGs, and NAT or route entries solve routing problems, not the stateless filtering gap.' },
  { id: 'q-h3', mode: 'hard', topic: 'Public-subnet exposure', prompt: 'Design review: a database subnet holds production Postgres and is marked public, with 0.0.0.0/0 routed to the internet gateway. What is the primary risk?', options: [{ key: 'a', label: 'The database is directly addressable from the internet' }, { key: 'b', label: 'The database will run slower on shared hardware' }, { key: 'c', label: 'Multitenancy stops working between the subnets' }, { key: 'd', label: 'The VPC CIDR will collide with the HQ range' }], answerKey: 'a', explanation: 'A public subnet with an IGW default route is internet-addressable — production data exposed to scanning and exploitation (the ATT&CK T1190 pattern behind real cloud breaches). Shared-hardware speed, multitenancy breakage and CIDR collision are unrelated to the exposure this routing creates.' },
  { id: 'q-h4', mode: 'hard', topic: 'Commissioning order', prompt: 'Order the commissioning of a new VPC: (1) apply NSG rules, (2) reserve a non-overlapping CIDR, (3) validate with test traffic, (4) attach gateways, (5) create subnets/route tables.', options: [{ key: 'a', label: '4 → 2 → 5 → 1 → 3' }, { key: 'b', label: '5 → 2 → 4 → 1 → 3' }, { key: 'c', label: '2 → 5 → 4 → 1 → 3' }, { key: 'd', label: '2 → 4 → 5 → 1 → 3' }], answerKey: 'c', explanation: 'Address space first (nothing exists without it), then subnets and route tables, then gateways, then filtering rules, then validation — each layer depends on the one before it. Gateways before subnets leaves them attached to nothing, and filters before gateways leaves nothing to filter.' },
  { id: 'q-h5', mode: 'hard', topic: 'Transit gateway', prompt: 'Two Aerolune VPCs plus HQ all need to route through one hub VPC. Which gateway belongs at the hub?', options: [{ key: 'a', label: 'Storage gateway' }, { key: 'b', label: 'Transit gateway' }, { key: 'c', label: 'Internet gateway' }, { key: 'd', label: 'NAT gateway' }], answerKey: 'b', explanation: 'A transit gateway is the hub that interconnects multiple VPCs and on-prem networks in a hub-and-spoke design. Internet and NAT gateways face the internet, and a storage gateway bridges hybrid file/volume storage — it moves no packets between VPCs.' },
  { id: 'q-h6', mode: 'hard', topic: 'Hybrid cloud', prompt: 'Seasonal analytics bursts from the on-prem mainframe platform into the public cloud, orchestrated by one control plane. Which model — and what makes it work?', options: [{ key: 'a', label: 'Hybrid — one orchestrated mix joined by a circuit' }, { key: 'b', label: 'Public — the provider owns and operates every server' }, { key: 'c', label: 'Private — the mainframe never leaves the company estate' }, { key: 'd', label: 'Community — both sides co-fund one shared platform' }], answerKey: 'a', explanation: 'Hybrid cloud = on-prem/private and public operated as one orchestrated estate; the VPN tunnel or dedicated circuit is what turns two estates into one operable platform. Public and private each misread the ownership split, and community requires several organizations with common needs sharing one platform.' },
  { id: 'q-h7', mode: 'hard', topic: 'NFV concentration risk', prompt: 'After migrating to NFV, the auditor asks: what new class of risk arrives with appliances that are now software on hypervisors?', options: [{ key: 'a', label: 'Firewalls lose their ability to log flow traffic' }, { key: 'b', label: 'VNFs can no longer be snapshotted safely' }, { key: 'c', label: 'Load balancers stop spreading traffic across backends' }, { key: 'd', label: 'One host escape touches every VNF on it' }], answerKey: 'd', explanation: 'NFV concentrates many functions onto shared hypervisors, so a host escape or misconfiguration can compromise every VNF on that host at once (cf. ATT&CK T1611, Escape to Host). Logging, snapshots and load distribution are unaffected — the new risk class is concentration, mitigated by host hardening, patching and segmentation.' },
];

// ── Glossary (15 shipped terms) ────────────────────────────────────────────
const GLOSSARY = [
  { term: 'Multitenancy', def: 'Many customers share the same physical infrastructure, logically isolated from one another.' },
  { term: 'Public cloud', def: 'Provider-owned, multitenant infrastructure offered on demand (AWS, Azure, GCP).' },
  { term: 'Private cloud', def: 'Cloud-style, single-tenant infrastructure dedicated to one organization.' },
  { term: 'Hybrid cloud', def: 'On-prem/private and public environments operated as one, orchestrated together (e.g., cloud bursting).' },
  { term: 'IaaS', def: 'Provider supplies raw compute/network/storage; customer manages the guest OS and everything above.' },
  { term: 'PaaS', def: 'Provider supplies the runtime/platform; customer deploys code and data only.' },
  { term: 'SaaS', def: 'A finished application delivered over the internet; the customer configures rather than builds.' },
  { term: 'Shared responsibility model', def: 'The split of security and operations duties between provider and customer, which shifts with the service model.' },
  { term: 'NFV', def: 'Network Function Virtualization — network appliances become software (VNFs) on commodity servers.' },
  { term: 'VPC', def: 'Virtual Private Cloud — a logically isolated, customer-defined network segment inside a public cloud.' },
  { term: 'CIDR block', def: 'An IP range written addr/prefix (e.g., 10.200.0.0/16) defining a network or subnet boundary.' },
  { term: 'Internet gateway', def: 'Redundant VPC component that gives public subnets bidirectional internet access.' },
  { term: 'NAT gateway', def: 'Managed service giving private subnets outbound-only internet access; the internet cannot initiate inbound.' },
  { term: 'Direct Connect', def: 'A dedicated private circuit from premises/colo into the cloud (AWS Direct Connect, Azure ExpressRoute, GCP Cloud Interconnect). Not encrypted by default.' },
  { term: 'NSG', def: 'Network security group — a stateful virtual firewall ruleset (priority, direction, protocol, port, CIDR, allow/deny).' },
];

// ── Debrief content (C6) ───────────────────────────────────────────────────
const DEBRIEF = {
  detections: [
    { title: 'NSG drift beyond the approved set', logic: 'cloud.events | where operation == "NSG rules updated" and not (rule_set in approved_sets) → alert' },
    { title: 'World-open management ports', logic: 'nsg.rules | where direction=="in" and action=="allow" and port in (22,3389) and source=="0.0.0.0/0" → critical' },
    { title: 'Database on a public path', logic: 'vpc.subnets | where tag=="db" and type=="public" → audit-fail' },
    { title: 'Denied-flow spike on the app port', logic: 'flowlogs | where verdict=="DENY" and port==8443 | summarize count() by src, 5m → investigate' },
    { title: 'Private egress without NAT', logic: 'flowlogs | where subnet=="private" and dst=="internet" and verdict=="DENY" and reason=="no-route" → config-gap' },
  ],
  mitigations: [
    { id: 'M1030', label: 'Network Segmentation', how: 'Public/private subnet split, db off the internet path, transit-gateway hub for east-west.' },
    { id: 'M1037', label: 'Filter Network Traffic', how: 'Stateful NSGs everywhere; stateless lists only where forced; first-match priorities documented.' },
    { id: 'M1041', label: 'Encrypt Sensitive Information', how: 'IPsec on VPN tunnels; encryption overlay on Direct Connect (it is NOT encrypted by default).' },
    { id: 'M1026', label: 'Privileged Account Management', how: 'Separate cloud admin identities, JIT elevation on console access.' },
    { id: 'M1032', label: 'Multi-factor Authentication', how: 'MFA on every cloud control-plane account — the console is a network device now.' },
    { id: 'CIS v8 #4/12/13', label: 'Secure Configuration · Network Infrastructure Mgmt · Monitoring & Defense', how: 'Benchmark the landing zone, manage it like core network, monitor flow logs and change events.' },
  ],
  blue: [
    'Evaluation is first-match by priority — write rules as an ordered story, lowest number first.',
    'Stateful ≠ stateless: groups remember sessions, lists need explicit return rules (ephemeral ports!).',
    'Default posture is your friend: default inbound deny / outbound allow keeps mistakes small.',
    'Flow logs + change events turn the NSG table into an auditable, alertable asset.',
  ],
  red: [
    'World-open 22/3389 in a public subnet is the fastest cloud win there is (T1190).',
    'Cloud consoles are network devices — stolen cloud accounts are stolen networks (T1078.004).',
    'Your VPC topology, CIDRs and gateways are discoverable via the console/API (T1580) — label nothing helpfully.',
    'Disabling cloud logs or neutering NSGs is attacker housekeeping (T1562.007/.008) — alert on it.',
    'NFV concentrates risk: one hypervisor escape touches every VNF on the host (T1611).',
  ],
  links: [
    { label: 'CompTIA Network+ N10-009 (official exam page)', url: 'https://www.comptia.org/certifications/network' },
    { label: 'MITRE ATT&CK — Enterprise / Cloud tactics matrix', url: 'https://attack.mitre.org/matrices/enterprise/cloud/' },
    { label: 'NIST SP 800-145 — The NIST Definition of Cloud Computing', url: 'https://csrc.nist.gov/pubs/sp/800/145/final' },
    { label: 'NIST SP 800-144 — Guidelines on Security & Privacy in Public Cloud Computing', url: 'https://csrc.nist.gov/pubs/sp/800/144/final' },
    { label: 'Professor Messer — free N10-009 video course', url: 'https://www.professormesser.com/network-plus/n10-009/n10-009-video/n10-009-video/' },
  ],
};

const PILLAR_META = {
  P1: { label: 'Understand', color: 'bg-[#1C2B33] text-[#F5F2EA]' },
  P2: { label: 'Recognize', color: 'bg-[#0F6E64] text-white' },
  P3: { label: 'Observe & Diagnose', color: 'bg-[#92400E] text-white' },
  P4: { label: 'Harden & Decide', color: 'bg-[#C2410C] text-white' },
};
