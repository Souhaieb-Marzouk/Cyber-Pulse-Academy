// ── The Staging Bay · Content data (static port of src/lib/lab/data.ts, 1:1) ──
// ALL CONTENT SYNTHETIC · fictional org "Meridian Components Group" · RFC 5737 IPs
// Exposes one global: window.LAB
window.LAB = (function () {
'use strict';
// ── The Staging Bay · Content data ───────────────────────────────────────────
// ALL CONTENT SYNTHETIC · fictional org "Meridian Components Group" · RFC 5737 IPs


const SITE = {
  code: 'MERIDIAN-DC01',
  client: 'Meridian Components Group',
  build: 'HQ NETWORK REFIT — BUILD ORDER N° 2026-117',
};

// ── Bays (zone chain: WAN → edge → DMZ → core → access → storage/wireless) ──
const BAYS = [
  { id: 'edge', title: 'EDGE BAY', sub: 'WAN perimeter', chainNote: 'First hop after the ISP hand-off. Route, then filter, then block inline.' },
  { id: 'dmz', title: 'DMZ BAY', sub: 'published services', chainNote: 'Half-trusted strip between two firewalls — outsiders reach in, insiders reach out.' },
  { id: 'core', title: 'CORE BAY', sub: 'high-speed backbone', chainNote: 'Fast L3 spine. Everything is mirrored here for passive eyes.' },
  { id: 'access', title: 'ACCESS BAY', sub: 'user ports', chainNote: 'Where people, phones and cameras plug in. Segment and lock every port.' },
  { id: 'storage', title: 'STORAGE BAY', sub: 'file & block', chainNote: 'Files over the LAN, blocks over a dedicated fabric.' },
  { id: 'wireless', title: 'WIRELESS BAY', sub: 'radio overlay', chainNote: 'Radio coverage across the campus, orchestrated from one controller.' },
];

const DEVICES = [
  { id: 'router', code: 'RT-01', name: 'Router', category: 'router', layer: 'L3', blurb: 'Routes packets between networks using IP destinations and a routing table.', placeable: true },
  { id: 'l3switch', code: 'SW-C1', name: 'Core switch (L3)', category: 'switch', layer: 'L2/L3', blurb: 'Backbone switch that also routes between VLANs at wire speed.', placeable: true },
  { id: 'poeswitch', code: 'SW-A1', name: 'Access switch (managed PoE)', category: 'switch', layer: 'L2', blurb: 'Managed switch: VLANs, PoE, STP, port security on every user port.', placeable: true },
  { id: 'ngfw', code: 'FW-01', name: 'NGFW firewall', category: 'firewall', layer: 'L3–L7', blurb: 'Stateful perimeter firewall with deep inspection and app awareness.', placeable: true },
  { id: 'ids', code: 'SNS-P', name: 'IDS sensor (passive)', category: 'sensor', layer: 'L3–L7', blurb: 'Listens on a SPAN/mirror port and alerts on threats. Cannot block.', placeable: true },
  { id: 'ips', code: 'SNS-I', name: 'IPS appliance (inline)', category: 'sensor', layer: 'L3–L7', blurb: 'Sits in the traffic path and blocks malicious flows in real time.', placeable: true },
  { id: 'lb', code: 'LB-01', name: 'Load balancer', category: 'loadbalancer', layer: 'L4–L7', blurb: 'Spreads client requests across a server pool behind one virtual IP.', placeable: true },
  { id: 'fproxy', code: 'PXY-F', name: 'Forward proxy', category: 'proxy', layer: 'L7', blurb: 'Makes outbound requests on behalf of clients; filters and caches egress.', placeable: true },
  { id: 'rproxy', code: 'PXY-R', name: 'Reverse proxy', category: 'proxy', layer: 'L7', blurb: 'Terminates outside connections and protects/presents internal servers.', placeable: true },
  { id: 'nas', code: 'NAS-1', name: 'NAS filer', category: 'storage', layer: 'App (file)', blurb: 'File-level storage over the LAN via SMB/CIFS or NFS.', placeable: true },
  { id: 'san', code: 'SAN-1', name: 'SAN array', category: 'storage', layer: 'Block', blurb: 'Block-level storage on a dedicated fabric (FC / iSCSI / FCoE).', placeable: true },
  { id: 'ap', code: 'AP-xx', name: 'Access point', category: 'wireless', layer: 'L1/L2', blurb: 'Bridges Wi-Fi clients onto the wired LAN over radio.', placeable: true, multi: true },
  { id: 'wlc', code: 'WLC-1', name: 'Wireless controller', category: 'wireless', layer: 'L2', blurb: 'Central brain: pushes config to APs, manages channels and roaming.', placeable: true },
  { id: 'extender', code: 'EXT-1', name: 'Range extender', category: 'wireless', layer: 'L1/L2', blurb: 'Repeats a weak signal into a dead zone — at roughly half the throughput.', placeable: true },
  { id: 'bridge', code: 'BRG-1', name: 'Wireless bridge', category: 'wireless', layer: 'L1/L2', blurb: 'Point-to-point radio link between two wired network segments.', placeable: true },
  { id: 'hub', code: 'HUB-0', name: 'Hub (legacy)', category: 'legacy', layer: 'L1', blurb: 'Repeats every bit to every port. One collision domain, zero brains.', placeable: false, whyNot: 'Legacy crate — a hub floods every frame to every port. Not accepted on a modern floor.' },
  { id: 'unmanaged', code: 'SW-U0', name: 'Unmanaged switch', category: 'legacy', layer: 'L2', blurb: 'Plug-and-play switching with no VLANs, no PoE control, no security.', placeable: false, whyNot: 'Legacy crate — unmanaged means no VLANs, no STP tuning, no port security. Not accepted for this build.' },
];

const SLOTS = [
  { id: 'edge-router', bay: 'edge', accepts: 'router', label: 'U1 · ROUTE', caption: 'WAN hand-off' },
  { id: 'edge-fw', bay: 'edge', accepts: 'ngfw', label: 'U2 · FILTER', caption: 'policy choke point' },
  { id: 'edge-ips', bay: 'edge', accepts: 'ips', label: 'U3 · BLOCK', caption: 'inline sensor' },
  { id: 'dmz-rproxy', bay: 'dmz', accepts: 'rproxy', label: 'U1 · FRONT DOOR', caption: 'terminates outsiders' },
  { id: 'dmz-lb', bay: 'dmz', accepts: 'lb', label: 'U2 · SPREAD', caption: 'feeds the farm' },
  { id: 'core-switch', bay: 'core', accepts: 'l3switch', label: 'U1 · SPINE', caption: 'inter-VLAN routing' },
  { id: 'core-ids', bay: 'core', accepts: 'ids', label: 'U2 · WATCH', caption: 'SPAN tap' },
  { id: 'core-fproxy', bay: 'core', accepts: 'fproxy', label: 'U3 · EGRESS', caption: 'outbound gateway' },
  { id: 'acc-switch', bay: 'access', accepts: 'poeswitch', label: 'U1 · PORTS', caption: 'PoE + security' },
  { id: 'sto-nas', bay: 'storage', accepts: 'nas', label: 'U1 · FILES', caption: 'SMB / NFS shares' },
  { id: 'sto-san', bay: 'storage', accepts: 'san', label: 'U2 · BLOCKS', caption: 'FC / iSCSI fabric' },
  { id: 'wl-wlc', bay: 'wireless', accepts: 'wlc', label: 'U1 · BRAIN', caption: 'controller' },
  { id: 'wl-ap1', bay: 'wireless', accepts: 'ap', label: 'U2 · AP HQ', caption: 'main hall' },
  { id: 'wl-ap2', bay: 'wireless', accepts: 'ap', label: 'U3 · AP SHOP', caption: 'production floor' },
  { id: 'wl-ap3', bay: 'wireless', accepts: 'ap', label: 'U4 · AP YARD', caption: 'loading yard' },
  { id: 'wl-ext', bay: 'wireless', accepts: 'extender', label: 'U5 · DEAD ZONE', caption: 'dock repeater' },
  { id: 'wl-bridge', bay: 'wireless', accepts: 'bridge', label: 'U6 · LINK', caption: 'Warehouse B hop' },
];

// ── OBJ-M1 · role-match board ──
const MATCH_ITEMS = ['router', 'switch', 'firewall', 'ids', 'lb', 'fproxy', 'rproxy', 'nas', 'san', 'ap'];
const MATCH_ROLES = [
  { id: 'r-routes', text: 'Routes packets BETWEEN networks using IP destinations and a routing table' },
  { id: 'r-frames', text: 'Forwards frames WITHIN a LAN using a MAC address table' },
  { id: 'r-policy', text: 'Enforces security policy between zones by inspecting and permitting/denying traffic' },
  { id: 'r-alert', text: 'Passively watches mirrored traffic and ALERTS on attack patterns — cannot stop them' },
  { id: 'r-spread', text: 'Distributes client requests across a pool of servers behind one virtual IP' },
  { id: 'r-egress', text: 'Sits between internal clients and the internet to filter, cache and anonymize OUTBOUND traffic' },
  { id: 'r-front', text: 'Receives INBOUND connections first, hides and protects the internal servers behind it' },
  { id: 'r-files', text: 'Serves FILE-level storage over the LAN with SMB/CIFS or NFS shares' },
  { id: 'r-blocks', text: 'Serves BLOCK-level storage over a dedicated high-speed fabric (FC / iSCSI)' },
  { id: 'r-radio', text: 'Bridges wireless client traffic onto the wired LAN over radio' },
  { id: 'r-x-tape', text: 'Writes backups to magnetic tape cartridges' },
  { id: 'r-x-shout', text: 'Repeats every signal out of every port with no addressing at all' },
];

// ── OBJ-M2 · inbound path sequencing ──
const PATH_STEPS = [
  { id: 'p-internet', label: 'Internet client' },
  { id: 'p-router', label: 'Edge router' },
  { id: 'p-fw', label: 'Firewall' },
  { id: 'p-rproxy', label: 'Reverse proxy' },
  { id: 'p-lb', label: 'Load balancer' },
  { id: 'p-web', label: 'Web server' },
];
const PATH_CORRECT = ['p-internet', 'p-router', 'p-fw', 'p-rproxy', 'p-lb', 'p-web'];

// ── Firewall rule palette ──
const FW_RULES = {
  'R-EST': { text: 'ALLOW established + related — inbound', good: true },
  'R-DMZ-WEB': { text: 'ALLOW WAN → DMZ web farm TCP 80/443 (198.51.100.10-12)', good: true },
  'R-DENY-DMZDB': { text: 'DENY staff → DMZ database SVR-DB (198.51.100.20) any', good: true },
  'R-EGRESS-PROXY': { text: 'ALLOW staff → WAN but ONLY via forward proxy 192.0.2.5:3128', good: true },
  'R-STAFF-DMZDB': { text: 'ALLOW staff → DMZ database SVR-DB ANY — "the BI tool needs it"', good: false },
  'R-ANYANY': { text: 'ALLOW ip any any — "stop the ticket queue"', good: false },
};

// ── IDS alert stream (board A) ──
const ALERTS = [
  { id: 'A-101', sig: 'ET EXPLOIT SQLi', msg: "GET /products.php?id=1' OR 1=1-- from 203.0.113.44 → DMZ web farm", meta: 'signature hit · 12 events', verdict: 'tp', teach: 'Classic injection payload in the URL. This is a true positive — the inline IPS should have blocked it; check why it only alerted.' },
  { id: 'A-102', sig: 'SIG 2:2200085 Apache banner', msg: 'Server header discloses "Apache 2.4.29" on 198.51.100.10', meta: 'signature hit · info', verdict: 'fp', teach: 'Banner disclosure is bad hygiene, not an attack. A precise, noisy signature like this is the textbook false positive — tune it, do not rip the sensor.' },
  { id: 'A-103', sig: 'ET SCAN Nmap SYN', msg: '1,024 ports probed in 9s from 203.0.113.9 → perimeter', meta: 'signature hit · high', verdict: 'tp', teach: 'Sweep-rate signature over an external source: reconnaissance. True positive — verify the firewall denied it and consider geo/rate rules.' },
  { id: 'A-104', sig: 'ANOMALY volume', msg: '192.0.2.55 (SVR-BK01) egress 8× baseline at 02:00', meta: 'behavioral · medium', verdict: 'fp', teach: 'The scheduled nightly backup job. Baseline deviations need context — whitelist known scheduled jobs or every backup becomes alert noise.' },
  { id: 'A-105', sig: 'SMB lateral', msg: 'Guest-VLAN device 192.0.2.188 → staff VLAN SMB login attempts (37 fails)', meta: 'signature hit · high', verdict: 'tp', teach: 'Cross-segment brute force from a guest device: segmentation is doing its job by logging, but the host must be quarantined. True positive.' },
  { id: 'A-106', sig: 'DNS phishing', msg: 'Staff PC 192.0.2.77 resolved paypa1-support.tk', meta: 'reputation · medium', verdict: 'tp', teach: 'Typosquatted domain lookalike. True positive — the forward proxy should block the category and the host should be checked for creds.' },
];

// ── Objectives ──
const OBJECTIVES = [
  // ── MEDIUM ──
  {
    id: 'OBJ-M1', mode: 'medium', pillar: 'understand', title: 'Know the crew',
    line: 'In the FIELD MANUAL, match all 10 appliances on the ROLE-MATCH board to their one-line job.',
    brief: 'Before you rack anything, prove you can tell the crew apart. Distractor roles are mixed in — if a role describes tape backups or a shout-everything hub, leave it unused.',
    where: 'Field manual → ROLE-MATCH board (bottom of the manual).',
    anchor: 'C-01…C-09 — device roles',
    hints: ['Ten devices, ten correct roles; two roles are decoys and stay unused.', 'Start from the ones you cannot confuse: NAS = FILE shares over the LAN, SAN = BLOCK storage over a fabric.', 'Answers: router→routes between networks; switch→frames by MAC; firewall→zone policy; IDS→alerts passively; LB→spreads across a pool; forward proxy→outbound filter/cache; reverse proxy→inbound front door; NAS→file-level SMB/NFS; SAN→block FC/iSCSI; AP→wireless-to-wired bridge.'],
  },
  {
    id: 'OBJ-M2', mode: 'medium', pillar: 'understand', title: 'Trace the inbound request',
    line: 'On the PATH-SEQUENCE board, order the six hops of an outside web request from Internet client to web server.',
    brief: 'A customer hits meridian.example. Every edge appliance earns its keep at one hop — get the order right and you have internalized chain position.',
    where: 'Field manual → PATH-SEQUENCE board, tap the chips in order.',
    anchor: 'C-01/C-03/C-05/C-06 — chain position',
    hints: ['Routing first, policy second, presentation third.', 'The reverse proxy receives outsiders BEFORE the load balancer picks a server.', 'Order: Internet client → Edge router → Firewall → Reverse proxy → Load balancer → Web server.'],
  },
  {
    id: 'OBJ-M3', mode: 'medium', pillar: 'recognize', title: 'Rack the perimeter',
    line: 'From the DEPOT, install the router, the NGFW and the inline IPS into the EDGE BAY slots.',
    brief: 'The ISP fiber lands in the edge bay. Route, filter, block — in that physical order, because an inline IPS must sit where it can stop what the firewall lets through.',
    where: 'Depot (left) → tap a device → tap the matching EDGE BAY slot.',
    anchor: 'C-01/C-03/C-04 — edge placement',
    hints: ['Three crates, three edge slots. The IPS is INLINE — it belongs on the path, not on a mirror port.', 'The passive IDS is NOT racked here — it lives in the core bay on a SPAN tap.', 'Edge slots: U1 ROUTE=Router, U2 FILTER=NGFW, U3 BLOCK=IPS appliance.'],
  },
  {
    id: 'OBJ-M4', mode: 'medium', pillar: 'recognize', title: 'Stand up the DMZ',
    line: 'Install the reverse proxy and the load balancer in the DMZ BAY, then set the LB to weighted round-robin (WEB-02 weight 2+) with health checks ON.',
    brief: 'Outsiders must land on the reverse proxy, never on a raw web node. WEB-02 has twice the CPU of its siblings, so the balancer must favor it — and every pool member needs probing.',
    where: 'Depot → DMZ slots; then COMMISSIONING CONSOLE → LOAD BALANCER.',
    anchor: 'C-05/C-06 — DMZ stack',
    hints: ['The forward proxy handles outbound; the REVERSE proxy is the inbound front door.', 'Weighted round-robin + weight ≥ 2 on WEB-02 gives it double share.', 'Console: algorithm = weighted RR, WEB-02 weight 2 (or more), health checks ON.'],
  },
  {
    id: 'OBJ-M5', mode: 'medium', pillar: 'understand', title: 'Settle the storage question',
    line: 'Install the NAS and the SAN in the STORAGE BAY; set the NAS protocol to SMB and the SAN protocol to iSCSI.',
    brief: 'The brief asks for office file shares (Windows mix) and a virtualization cluster. Files over the LAN = NAS; blocks over a dedicated fabric = SAN.',
    where: 'Depot → STORAGE slots; COMMISSIONING CONSOLE → STORAGE.',
    anchor: 'C-07/C-08 — NAS vs SAN',
    hints: ['SMB serves Windows file shares; iSCSI carries SCSI blocks inside Ethernet frames.', 'Do not swap them: SMB on the SAN array would serve files, not blocks.', 'NAS protocol = SMB; SAN protocol = iSCSI.'],
  },
  {
    id: 'OBJ-M6', mode: 'medium', pillar: 'recognize', title: 'Build the wireless overlay',
    line: 'Install the controller, all three APs, the dock range extender and the Warehouse B wireless bridge; on the WIRELESS board assign Warehouse B → bridge and dock → extender.',
    brief: 'Three halls need real Wi-Fi (APs on the controller), the dock only needs a repeated signal, and Warehouse B across the yard needs a point-to-point link because there is no cable path.',
    where: 'Depot → WIRELESS slots; COMMISSIONING CONSOLE → WIRELESS (link & coverage planner).',
    anchor: 'C-09 — AP / WLC / extender / bridge',
    hints: ['Bridges link two WIRED segments; extenders only repeat radio for clients.', 'Warehouse B has no cable path → bridge. Dock is a client coverage gap → extender.', 'Place WLC + 3× AP + extender (U5) + bridge (U6); planner: warehouse=bridge, dock=extender.'],
  },
  {
    id: 'OBJ-M7', mode: 'medium', pillar: 'mitigate', title: 'Commission the switches',
    line: 'Install both switches (core U1, access U1), then on the SWITCH console enable: PoE, VLANs 10/20/30, STP and port security.',
    brief: 'Phones and cameras need power over the cable; staff, voice and cameras must not share a broadcast domain; loops need a referee; unknown MACs need a bouncer.',
    where: 'Depot → core & access slots; COMMISSIONING CONSOLE → SWITCH.',
    anchor: 'C-02 — managed switch features',
    hints: ['Six toggles in the SWITCH console, all ON for this build.', 'Voice VLAN (20) keeps phone traffic off the staff LAN; camera VLAN (30) isolates IoT.', 'Switch console: PoE ✓, VLAN 10 ✓, VLAN 20 ✓, VLAN 30 ✓, STP ✓, port security ✓.'],
  },
  {
    id: 'OBJ-M8', mode: 'medium', pillar: 'mitigate', title: 'Write the perimeter policy',
    line: 'On the FIREWALL console: switch to stateful mode, enable the DMZ zone, and add exactly three rules in order — allow established/related, allow WAN→DMZ web 80/443, deny staff→DMZ database.',
    brief: 'Stateful filtering remembers connections, so reply traffic is allowed without extra rules. Order matters: the general allow sits before the specific deny would be shadowed — here the deny is a different flow, but the established rule must always lead. Whatever falls through hits the implicit deny.',
    where: 'COMMISSIONING CONSOLE → FIREWALL → rule palette → ADD, then ↑/↓.',
    anchor: 'C-03 — stateful ACL / implicit deny',
    hints: ['Three rules from the palette, in this shape: ESTABLISHED first, DMZ web second, DENY database third.', '"ALLOW staff→DMZ database ANY" is the rule the ticket asked for — and exactly the rule you must NOT add.', 'Final ruleset: [ALLOW established+related, ALLOW WAN→DMZ 80/443, DENY staff→DB]. Mode=stateful, DMZ zone ON.'],
  },
  {
    id: 'OBJ-M9', mode: 'medium', pillar: 'detect', title: 'Deploy the eyes',
    line: 'Install the IDS in the CORE BAY, switch on port mirroring (SPAN), and set BOTH sensors to signature mode.',
    brief: 'The passive IDS is blind without a mirror feed — SPAN copies core traffic to its sniffing port. Signatures give known-bad certainty first; anomaly baselining comes later, after the floor settles.',
    where: 'Depot → CORE U2; COMMISSIONING CONSOLE → SWITCH (mirroring) + SENSORS.',
    anchor: 'C-04 — passive tap + modes',
    hints: ['Two things feed the IDS: its slot in the core bay and the SPAN toggle in the switch console.', 'Inline = blocking (that is the IPS, already racked at the edge). Passive = the core IDS.', 'IDS slot filled ✓, port mirroring ON ✓, IDS mode=signature, IPS mode=signature.'],
  },
  {
    id: 'OBJ-M10', mode: 'medium', pillar: 'detect', title: 'Read the alert stream',
    line: 'On the EVIDENCE WALL (ALERT STREAM), classify all six alerts as true or false positive — 5 of 6 correct passes.',
    brief: 'Signatures fire on patterns, not on intent. Context decides: an external scan is recon; a banner disclosure and a scheduled backup are noise. Wrong calls get teaching feedback either way.',
    where: 'EVIDENCE WALL → board A (ALERT STREAM) → radio buttons → then VERIFY.',
    anchor: 'C-04 — TP vs FP',
    hints: ['Ask per alert: is something actively attacking, or is the sensor just chatty?', '02:00 egress spike = the backup job. Apache banner = hygiene, not attack.', 'A-101 TP · A-102 FP · A-103 TP · A-104 FP · A-105 TP · A-106 TP.'],
  },
  {
    id: 'OBJ-M11', mode: 'medium', pillar: 'mitigate', title: 'Lock the way out',
    line: 'Install the forward proxy in the CORE BAY; enable it with caching and category filtering; on the firewall enable "WAN egress only via proxy".',
    brief: 'Staff traffic should leave through a controlled door: the proxy filters categories and caches repeats, and the firewall rule makes the door mandatory, not optional.',
    where: 'Depot → CORE U3; COMMISSIONING CONSOLE → PROXY + FIREWALL.',
    anchor: 'C-06 — forward proxy / egress control',
    hints: ['Forward = outbound (staff browsing). You already used the reverse one inbound.', 'Three proxy toggles ON, then the egress rule on the FIREWALL console.', 'Proxy: enabled ✓ caching ✓ filtering ✓ · Firewall: "egress only via proxy" ✓.'],
  },
  // ── HARD ──
  {
    id: 'OBJ-H1', mode: 'hard', pillar: 'recognize', title: 'Design the perimeter, cold',
    line: 'From an empty floor, deliver the full edge-to-farm path: router, stateful NGFW with DMZ zone, inline IPS, reverse proxy (TLS offload + WAF), LB (weighted RR, WEB-02 ≥2, health checks).',
    brief: 'No spotlight, no where-to-look. The commissioning report at the end lists every requirement; a single wrong toggle fails the design review.',
    where: '',
    anchor: 'C-01/C-03/C-04/C-05/C-06 — full edge stack',
    hints: ['Design-review checklist: 5 slots, FW stateful+DMZ, rproxy TLS+WAF, LB weighted-RR w2≥2 + health checks.'],
  },
  {
    id: 'OBJ-H2', mode: 'hard', pillar: 'detect', title: 'Kill the broadcast storm',
    line: 'Diagnose the storm on the EVIDENCE WALL (LOOP board): find the looped ports, re-enable the referee, pull the rogue patch, and answer the root-bridge question.',
    brief: 'Someone "fixed" slow Wi-Fi with a second patch cable. MAC flapping, 92% CPU, 3.1Mpps broadcast — textbook loop with the referee turned off.',
    where: '',
    anchor: 'C-02 — STP, root bridge, MAC flapping',
    hints: ['STP ON + pull link + why a root bridge is elected.'],
  },
  {
    id: 'OBJ-H3', mode: 'hard', pillar: 'detect', title: 'Correlate the intrusion chain',
    line: 'Reconstruct the attack from three logs on the CHAIN board, answer all three correlation questions exactly, classify ALL six alerts 6/6, and tune the noisy signature.',
    brief: 'One external source scanned and was denied; a different one slipped SQLi inside allowed HTTP. Which control saw what — and why did the core IDS see nothing at all?',
    where: '',
    anchor: 'C-03/C-04/C-06 — multi-log correlation',
    hints: ['Answers: port scan → firewall; SQLi → inline IPS; blocking placement → inline. Then tune the Apache banner signature.'],
  },
  {
    id: 'OBJ-H4', mode: 'hard', pillar: 'understand', title: 'Architect the storage tier',
    line: 'On the STORAGE board, pick the correct storage class AND protocol for all three workloads.',
    brief: 'Video editors need shared files over the LAN; the vSphere cluster needs raw blocks for VM disks; the analytics DB needs the lowest-latency fabric money buys. One wrong pick fails the audit.',
    where: '',
    anchor: 'C-07/C-08 — NAS/SAN per workload',
    hints: ['W1 file shares→NAS+SMB · W2 VM disks→SAN+iSCSI · W3 low-latency DB→SAN+FC.'],
  },
  {
    id: 'OBJ-H5', mode: 'hard', pillar: 'recognize', title: 'Fix the dead zones properly',
    line: 'Solve all three areas on the WIRELESS board (warehouse link, dock dead zone, mezzanine AP), enable controller roaming, and answer the extender-throughput question.',
    brief: 'Coverage is not one product: a building link, a client gap and a capacity area each want a different tool — and only the controller makes AP-to-AP handoffs invisible.',
    where: '',
    anchor: 'C-09 — full wireless toolkit',
    hints: ['warehouse→bridge · dock→extender · mezzanine→AP + roaming ON · extenders halve throughput.'],
  },
  {
    id: 'OBJ-H6', mode: 'hard', pillar: 'detect', title: 'Survive the node failure',
    line: 'On the POOL board: drain WEB-03, re-algorithm for uneven connection times, enable session persistence, and answer the round-robin question.',
    brief: 'WEB-03 is failing probes and still in rotation. The cart app keeps sessions in node memory, so a rebalancing algorithm that ignores connection counts would bounce buyers between nodes.',
    where: '',
    anchor: 'C-05 — health checks, algorithms, persistence',
    hints: ['Drain WEB-03 · algorithm = least connections · persistence ON · RR bounces sessions.'],
  },
  {
    id: 'OBJ-H7', mode: 'hard', pillar: 'mitigate', title: 'Audit the rule base',
    line: 'The firewall arrives pre-loaded with a rotten ruleset: reorder into best practice, delete the two toxic rules, add the missing database deny and proxy-only egress.',
    brief: 'Any-any "stopped the ticket queue", a shadowed DB allow sits above the deny, and the established rule is buried. Rebuild: final order = EST → WAN→DMZ web → DENY staff→DB → EGRESS-via-proxy, stateful, DMZ on.',
    where: '',
    anchor: 'C-03 — rule order, shadowing, implicit deny',
    hints: ['Delete R-ANYANY + R-STAFF-DMZDB; order R-EST, R-DMZ-WEB, R-DENY-DMZDB, R-EGRESS-PROXY; stateful + DMZ + egress-via-proxy ON.'],
  },
  {
    id: 'OBJ-H8', mode: 'hard', pillar: 'mitigate', title: 'Cut the beacon',
    line: 'On the BEACON board: identify the callout, deny it at the proxy, block the destination on the firewall, flip the IDS to anomaly mode, and answer the mode question.',
    brief: 'A staff host is GET-ing /beat?id=… to cdn-updates.example.tk every 60 seconds — machine timing, libcurl user-agent. Layered controls: proxy deny, egress block, behavioral detection.',
    where: '',
    anchor: 'C-06 + C-03 + C-04 — layered egress defense',
    hints: ['Proxy deny-list ✓ · FW egress block ✓ · IDS→anomaly · anomaly = baseline deviation.'],
  },
  {
    id: 'OBJ-H9', mode: 'hard', pillar: 'mitigate', title: 'Site sign-off',
    line: 'Commission the ENTIRE floor to spec: all 17 slots correctly filled, every switch toggle, both proxy pairs, both sensors, roaming + auto-provision, storage protocols, stateful DMZ firewall, LB health checks — then VERIFY.',
    brief: 'The capstone. The customer signs only a fully commissioned site: placement, configuration and policy all verified in one pass. This is the exam, with the room as the answer sheet.',
    where: '',
    anchor: 'C-10 — everything',
    hints: ['Walk bay by bay: EDGE(3) → DMZ(2) → CORE(3) → ACCESS(1) → STORAGE(2) → WIRELESS(6); then every console to spec.'],
  },
];

// ── Quiz ──
// B3/B7 discipline: correct-answer position ROTATES across items (no fixed index), option lengths are
// balanced (the correct answer is never the longest), distractors are same-family misconceptions.
const QUIZ_MEDIUM = [
  { id: 'QM1', topic: 'Switches', prompt: 'Which appliance forwards frames WITHIN a LAN using a MAC address table?', options: ['A router — moves packets between networks', 'A hub — repeats every bit to every port', 'A switch — learns MACs per port', 'A firewall — filters zone-to-zone traffic'], answer: 2, why: 'A switch learns source MACs per port (the CAM table) and forwards frames only out the destination port. The router moves packets BETWEEN networks; the hub repeats to everyone; the firewall judges traffic between zones, not inside a LAN.' },
  { id: 'QM2', topic: 'IDS / IPS', prompt: 'Which statement correctly pairs an intrusion sensor with its placement and behavior?', options: ['IDS — passive on a SPAN port — alerts', 'IPS — passive on a SPAN port — alerts', 'IDS — inline — blocks and alerts', 'Both must sit inline to see traffic'], answer: 0, why: 'An IDS is passive: it watches copied traffic on a SPAN/mirror port and alerts only. An IPS sits INLINE and can block. The other pairs swap the placements — exactly how the exam traps you.' },
  { id: 'QM3', topic: 'NAS vs SAN', prompt: 'A design calls for shared Windows file storage over the existing LAN. Which fits?', options: ['SAN with iSCSI block volumes', 'Load balancer with NFS exports', 'SAN with Fibre Channel LUNs', 'NAS with SMB/CIFS shares'], answer: 3, why: 'NAS serves FILE-level shares over the LAN — SMB/CIFS for Windows (NFS for Unix). The SAN options serve raw BLOCKS over a dedicated fabric for VM disks and databases; a load balancer spreads requests, it stores nothing.' },
  { id: 'QM4', topic: 'Load balancers', prompt: 'One web server in a pool has twice the CPU. Which algorithm uses it best?', options: ['Random selection per request', 'Weighted round robin', 'Round robin, equal turns', 'Least connections, busy-first'], answer: 1, why: 'Weighted round robin sends a proportionally larger share to higher-weighted nodes — weight 2 gets about twice the requests. Equal turns ignores capacity; least-connections targets busy-ness, not size; random wastes the big node.' },
  { id: 'QM5', topic: 'Switches', prompt: 'Which switch feature powers APs and cameras over the Ethernet cable itself?', options: ['PoE (802.3af/at/bt)', 'VLAN trunking (802.1Q tags)', 'STP redundant-path blocking', 'Port mirroring (SPAN copies)'], answer: 0, why: 'Power over Ethernet delivers DC power alongside data: about 15 W (802.3af), 30 W (at), 60–90 W (bt). Trunking tags VLANs, STP prevents loops, SPAN copies traffic — none of them push watts down the cable.' },
  { id: 'QM6', topic: 'Firewalls', prompt: 'What makes a STATEFUL firewall different from a stateless ACL?', options: ['It judges each packet in isolation, every time', 'It tracks connections and auto-allows replies', 'It always routes faster than a stateless ACL', 'It works only on layer-2 frames, not IP packets'], answer: 1, why: 'Stateful inspection keeps a table of active connections ("established/related"), so replies pass automatically. Judging packets in isolation IS the stateless ACL; speed claims and layer-2 scope are myths.' },
];

const QUIZ_HARD = [
  { id: 'QH1', topic: 'Switches', prompt: 'Build order: 40 IP phones plus 12 APs on user desks, voice separated from staff data. Minimum appliance choice?', options: ['Unmanaged switch + phone-side VLAN tags', 'Extra router installed per desk row', 'Hub per desk row, no VLANs at all', 'Managed PoE switch with a voice VLAN'], answer: 3, why: 'One cable per device needs PoE, and phones need their own broadcast domain — that is a managed PoE switch with a dedicated voice VLAN. Unmanaged gear offers neither; hubs and extra routers solve nothing here.' },
  { id: 'QH2', topic: 'Proxies', prompt: 'Three web servers in the DMZ must share load AND be shielded from direct outsider connections. Pick the stack.', options: ['Reverse proxy + load balancer in front', 'Forward proxy chained in front of servers', 'IDS tapped in front of the servers', 'Router publishing servers directly'], answer: 0, why: 'The reverse proxy terminates outsider sessions (TLS offload, WAF) and the LB spreads them across the pool with health checks. A forward proxy works the opposite direction — outbound — and an IDS only watches.' },
  { id: 'QH3', topic: 'NAS vs SAN', prompt: 'A vSphere cluster needs raw disks with the lowest possible latency. Choose storage.', options: ['NAS with SMB file shares', 'NAS with NFS exports', 'SAN with Fibre Channel', 'Cloud file drive per VM'], answer: 2, why: 'Hypervisor datastores want BLOCK-level LUNs on a dedicated fabric; Fibre Channel is the lowest-latency choice (iSCSI/FCoE carry blocks over Ethernet more cheaply). The NAS options are file-level and share-oriented.' },
  { id: 'QH4', topic: 'Switches', prompt: 'Users report a dead network. Logs: MAC aabb.cc11.2233 flapping between Gi0/3 and Gi0/4, 3.1Mpps broadcast, CPU 92%. First move?', options: ['Disable STP to bring CPU down first', 'Enable STP and pull the rogue patch', 'Add a third cable between the switches', 'Replace the uplink transceiver module'], answer: 1, why: 'MAC flapping + broadcast flood = a physical loop with spanning tree off (the "second cable for speed" mistake). Re-enable STP and pull the rogue link; disabling STP or adding cables feeds the storm.' },
  { id: 'QH5', topic: 'Proxies', prompt: 'Policy requires staff web traffic to be category-filtered, cached, and logged. Which appliance + placement?', options: ['Reverse proxy at the DMZ front door', 'IPS appliance inline at the WAN edge', 'Load balancer at the core spine', 'Forward proxy on the egress path'], answer: 3, why: 'Filtering/caching/logging of OUTBOUND staff browsing is the forward proxy\'s job; the firewall then enforces it as the only way out. Reverse proxies face inbound traffic; an IPS hunts attacks, not policy categories.' },
  { id: 'QH6', topic: 'Wireless', prompt: 'Warehouse B is across the yard — no cable path — and its 20 wired PCs must join the LAN. Pick the link.', options: ['Wireless bridge, point-to-point', 'Two range extenders chained inline', 'An extra AP with the same SSID', 'A repeater mounted on the roof'], answer: 0, why: 'A wireless bridge links two WIRED segments over a dedicated radio hop. Extenders and repeaters repeat CLIENT coverage and would throttle the whole segment; an AP serves wireless clients, not a wired building.' },
  { id: 'QH7', topic: 'Wireless', prompt: 'Floor staff roam between six APs mid-video-call and audio drops at every handoff. The fix?', options: ['Antenna upgrades on standalone APs', 'Louder single AP placed in the middle', 'Controller with fast/secure roaming', 'Transmit power dialed down to zero'], answer: 2, why: 'A controller centralizes config and orchestrates fast AP-to-AP roaming (client context moves between radios), so calls survive handoffs. Standalone APs force a full re-associate — and the call drops.' },
];

// ── Glossary ──
const GLOSSARY = [
  { term: 'VLAN', def: 'Virtual LAN — splits one physical switch into isolated broadcast domains (VLAN 10 staff, 20 voice, 30 cameras).' },
  { term: 'Trunk / 802.1Q', def: 'A port that carries multiple VLANs, tagging each frame with a 4-byte 802.1Q tag so the other switch knows its VLAN.' },
  { term: 'PoE (802.3af/at/bt)', def: 'Power over Ethernet delivers DC power with data: ~15.4 W (af), ~30 W (at), 60–90 W (bt) — enough for APs, phones, cameras.' },
  { term: 'STP', def: 'Spanning Tree Protocol — blocks redundant paths to prevent layer-2 loops and broadcast storms; re-opens them on failure.' },
  { term: 'Root bridge', def: 'The STP referee: the switch with the LOWEST bridge ID (priority + MAC) that all loop decisions are computed from.' },
  { term: 'Port security', def: 'Limits which/how many MACs a switch port accepts (e.g. 2 sticky MACs) — stops rogue devices and small switches on desk ports.' },
  { term: 'MAC (CAM) table', def: 'The switch table mapping source MAC addresses to ports, learned by reading inbound frames.' },
  { term: 'Stateful inspection', def: 'Firewall mode that tracks active connections; packets of ESTABLISHED/RELATED sessions pass without extra rules.' },
  { term: 'DMZ', def: 'De-militarized zone — a half-trusted segment for published services; outsiders reach it, it cannot reach the LAN.' },
  { term: 'NGFW', def: 'Next-gen firewall: stateful filtering PLUS application awareness and deep packet inspection up to layer 7.' },
  { term: 'UTM', def: 'Unified threat management — firewall + IPS + anti-malware + content filter bundled in one appliance.' },
  { term: 'Signature detection', def: 'Matches traffic against known attack patterns (like antivirus). Precise, but blind to zero-days.' },
  { term: 'Anomaly detection', def: 'Learns a baseline of normal and alerts on deviations (volume, timing, destinations) — catches the unknown, noisier.' },
  { term: 'SPAN / port mirroring', def: 'Switch feature copying traffic of chosen ports to an analysis port — the passive IDS\'s eyes.' },
  { term: 'Session persistence', def: 'Load-balancer stickiness: the same client keeps landing on the same pool member so in-memory sessions survive.' },
  { term: 'VIP', def: 'Virtual IP — the one address clients know; the load balancer maps it to healthy real servers.' },
  { term: 'LUN', def: 'Logical unit number — a raw block volume a SAN presents to a host, which formats it like a local disk.' },
  { term: 'Fast roaming (WLC)', def: 'Controller-orchestrated handoff between APs: client context moves radios without full re-association.' },
];

// ── Field manual device dossiers ──
const MANUAL = [
  {
    key: 'router', title: 'Router', layer: 'OSI L3 · network', role: 'Moves packets BETWEEN networks by reading IP destinations and choosing the best next hop from the routing table.',
    points: ['Routing table: destination network → next hop + metric; static routes are hand-written, dynamic ones learned via protocols (OSPF/BGP).', 'The default gateway of every LAN device is the router\'s address — the way out.', 'Sits at the WAN edge: first device after the ISP hand-off, often doing NAT.'],
    trap: 'Exam trap: routers segment BROADCAST domains; switches still share one per VLAN.',
  },
  {
    key: 'switch', title: 'Switch', layer: 'OSI L2 (L3 models add routing)', role: 'Forwards frames WITHIN a LAN using the MAC (CAM) table — one collision domain per port.',
    points: ['Managed vs unmanaged: managed adds VLANs, PoE control, STP, port security, mirroring; unmanaged is plug-and-play with none of it.', 'VLANs split one switch into isolated broadcast domains; 802.1Q trunks carry many VLANs with per-frame tags.', 'PoE powers APs/phones/cameras over the cable (802.3af ≈15 W, at ≈30 W, bt ≈60–90 W).', 'STP prevents layer-2 loops (root bridge = lowest bridge ID); port security limits MACs per port; SPAN mirrors traffic to sensors.'],
    trap: 'Exam trap: an unmanaged switch CANNOT do VLANs or port security — classic distractor.',
  },
  {
    key: 'firewall', title: 'Firewall', layer: 'L3–L4 (NGFW to L7)', role: 'Enforces policy between zones: permits, denies and logs traffic at the security boundary.',
    points: ['Stateless ACL: judges each packet alone. Stateful: tracks connections — replies of ESTABLISHED sessions pass automatically.', 'Rule bases run top-down, first match wins; everything else dies at the implicit deny.', 'DMZ: a half-trusted segment so published servers are reachable without opening the LAN.', 'NGFW adds app-aware deep inspection; UTM bundles firewall + IPS + AV + content filter in one box.'],
    trap: 'Exam trap: a more specific rule ABOVE a broader one is fine; a broader one ABOVE shadows (kills) the specific one.',
  },
  {
    key: 'idsips', title: 'IDS / IPS', layer: 'L3–L7 inspection', role: 'Watches traffic for attacks: IDS detects and alerts (passive), IPS sits inline and blocks (prevention).',
    points: ['IDS connects to a SPAN/mirror tap — a copy of the traffic — so it can never stop an attack, only shout.', 'IPS is inline on the path: same detection brains, plus blocking power (and blocking risk).', 'Signature mode = known-bad patterns, precise but blind to new attacks. Anomaly mode = learned baseline, catches zero-day behavior but noisier.', 'False positive = benign traffic flagged (banner disclosure, backup job). False negative = attack missed. Tuning fixes the first; layering covers the second.'],
    trap: 'Exam trap: "passive IDS blocks" — never. Passive means a copy of the traffic.',
  },
  {
    key: 'lb', title: 'Load balancer', layer: 'L4–L7', role: 'Presents one virtual IP and spreads client requests across a pool of servers.',
    points: ['Algorithms: round robin (equal turns), weighted RR (proportional to capacity), least connections (send to the least busy), source-IP hash (same client → same node).', 'Health checks probe each member and drain the dead ones automatically — failover without pages.', 'Session persistence keeps a client pinned to one member when the app keeps session state in memory.', 'Active-active scales; active-passive warms a standby.'],
    trap: 'Exam trap: weighted ≠ sticky. Weight spreads load; persistence pins users.',
  },
  {
    key: 'proxy', title: 'Proxy', layer: 'L7', role: 'Makes requests on behalf of someone: forward proxy for outbound clients, reverse proxy for inbound servers.',
    points: ['Forward proxy: staff traffic exits through it — content/category filtering, caching, logging, client anonymity. Firewall can make it the ONLY way out.', 'Reverse proxy: outsiders hit IT first — hides and protects the farm, can offload TLS, run WAF rules, cache statics.', 'Explicit proxy: clients configured for it. Transparent: traffic is redirected through it without client config.'],
    trap: 'Exam trap: forward = outbound egress control; reverse = inbound front door. Mnemonic: forward goes the same way as the clients\' requests (out).',
  },
  {
    key: 'nas', title: 'NAS', layer: 'File-level over TCP/IP', role: 'A file server appliance on the LAN: serves shared folders via SMB/CIFS or NFS.',
    points: ['FILE-level: clients mount shares and see files/folders — the NAS owns the filesystem.', 'Protocols: SMB/CIFS (Windows), NFS (Unix/Linux), AFP (legacy Mac).', 'Sweet spot: office shares, media libraries, private cloud — cheap and quick to deploy on the existing LAN.'],
    trap: 'Exam trap: NAS uses the general LAN — it is NOT a dedicated storage network.',
  },
  {
    key: 'san', title: 'SAN', layer: 'Block-level, dedicated fabric', role: 'A dedicated high-speed storage network presenting raw block volumes (LUNs) to servers.',
    points: ['BLOCK-level: the server\'s OS sees a local disk and writes its own filesystem — ideal for databases and hypervisor datastores.', 'Fabrics: Fibre Channel (lowest latency, HBAs + FC switches), iSCSI (SCSI in IP/Ethernet, cheap), FCoE (FC frames over Ethernet).', 'LUN = the raw volume handed to a host; zoning controls which hosts see which LUNs.'],
    trap: 'Exam trap: "SAN = big NAS" — no. Files vs blocks, LAN vs dedicated fabric.',
  },
  {
    key: 'wireless', title: 'Wireless devices', layer: 'L1/L2 radio', role: 'Carries the network over radio: APs bridge clients onto the wire; controllers orchestrate them.',
    points: ['Access point: Wi-Fi ↔ wired bridge for CLIENTS; radio is half-duplex (talk or listen, CSMA/CA).', 'Wireless controller (WLC): one brain for many APs — pushes config, tunes channels/power, enables fast roaming so calls survive handoffs (CAPWAP tunnels).', 'Range extender/repeater: repeats coverage for a dead zone at roughly HALF throughput (same radio re-transmits).', 'Wireless bridge: point-to-point link between two WIRED segments (buildings) — client coverage is not its job.'],
    trap: 'Exam trap: building-to-building with no cable path = BRIDGE, not extender. Extender = last-resort client coverage.',
  },
];

// ── Logs / evidence copy ──
const STP_LOG = [
  '14:02:11 SW-A1 %SPANTREE-5-TOPCHANGE: VLAN 1 topology change on Gi0/3',
  '14:02:12 SW-A1 MAC flap: aabb.cc11.2233 moved Gi0/3 → Gi0/4 (age 0s)',
  '14:02:12 SW-A1 MAC flap: aabb.cc11.2233 moved Gi0/4 → Gi0/3 (age 0s)',
  '14:02:15 SW-A1 %LINK-3-UPDOWN: Gi0/4 flapping — 14 transitions/min',
  '14:03:00 SW-A1 CPU: 92% · broadcast 3.1M pps on VLAN 1',
  '14:03:02 DHCP phone 192.0.2.41 request timed out (broadcast storm)',
  '14:03:31 config note: "spanning-tree" mode = DISABLED on SW-A1 (ticket #8841: "second uplink cable for speed")',
  '— all timestamps synthetic training data —',
];

const CHAIN_FW_LOG = [
  '11:40:03 FW-01 DENY TCP 203.0.113.9:4444 → 198.51.100.10:3389 (rule: implicit deny)',
  '11:40:04 FW-01 DENY TCP 203.0.113.9:4444 → 198.51.100.10:445 (rule: implicit deny)',
  '11:40:09 FW-01 ALLOW TCP 203.0.113.44:51200 → 198.51.100.10:443 (rule: R-DMZ-WEB)',
  '— synthetic training data —',
];

const CHAIN_SENSOR_LOG = [
  '11:40:09 SNS-I [inline] ET EXPLOIT SQLi → GET /products.php?id=1\' OR 1=1-- … ACTION: RESET-DROP',
  '11:40:09 SNS-P [passive] (no visibility — DMZ-bound traffic never crosses the core SPAN)',
  '11:40:41 SNS-I SIG 2:2200085 Apache banner disclosure on 198.51.100.10 (info, 214 hits today)',
  '— synthetic training data —',
];

const CHAIN_PROXY_LOG = [
  '11:40:00–11:41:00 PXY-F 0 requests from 203.0.113.x (external range — proxy is egress-only)',
  '— synthetic training data —',
];

const LB_POOL = [
  { node: 'WEB-01', ip: '198.51.100.10', weight: 1, state: 'UP', rtt: '12 ms', conns: 41 },
  { node: 'WEB-02', ip: '198.51.100.11', weight: 2, state: 'UP', rtt: '14 ms', conns: 39 },
  { node: 'WEB-03', ip: '198.51.100.12', weight: 1, state: 'PROBE FAIL ×5', rtt: '—', conns: 0 },
];

const BEACON_LOG = [
  '02:11:04 192.0.2.77 → cdn-updates.example.tk (203.0.113.66):80 GET /beat?id=8841 UA=libcurl/7.8',
  '02:12:04 192.0.2.77 → cdn-updates.example.tk (203.0.113.66):80 GET /beat?id=8842 UA=libcurl/7.8',
  '02:13:04 192.0.2.77 → cdn-updates.example.tk (203.0.113.66):80 GET /beat?id=8843 UA=libcurl/7.8',
  '(pattern: exact 60.0s cadence, size 512B, all day — Windows Update traffic is randomized, this is not)',
  '— synthetic training data —',
];

  return { SITE, BAYS, DEVICES, SLOTS, MATCH_ITEMS, MATCH_ROLES, PATH_STEPS, PATH_CORRECT, FW_RULES, ALERTS, OBJECTIVES, QUIZ_MEDIUM, QUIZ_HARD, GLOSSARY, MANUAL, STP_LOG, CHAIN_FW_LOG, CHAIN_SENSOR_LOG, CHAIN_PROXY_LOG, LB_POOL, BEACON_LOG };
})();
