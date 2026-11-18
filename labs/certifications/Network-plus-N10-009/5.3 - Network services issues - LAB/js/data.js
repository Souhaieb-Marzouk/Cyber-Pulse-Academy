/* =====================================================================
   Atlas NOC Command Deck — js/data.js
   ALL lab content as structured constants: topology, tickets, device
   registry, switch/router logs, DHCP pools/bindings, probe endpoints,
   mitigation control lists, field manual + glossary, cert-drill banks.
   Content is ported verbatim from the audited original lab.
   ===================================================================== */
'use strict';

/* ---- network topology: nodes and links ---- */

const NODES = [
  { id:'cloud', x:985, y:80,  w:150, h:52, shape:'cloud', label:'INTERNET', sub:'8.8.8.8 · ISP 203.0.113.1' },
  { id:'edge',  x:860, y:180, w:0,   h:0,  shape:'router', label:'EDGE-RTR', sub:'203.0.113.2 · 10.255.0.1', dev:'edge' },
  { id:'core',  x:620, y:268, w:0,   h:0,  shape:'router', label:'RTR-CORE', sub:'all SVIs 10.10.x.1', dev:'rtrcore' },
  { id:'brrtr', x:215, y:218, w:0,   h:0,  shape:'router', label:'BR-RTR', sub:'10.255.0.6 · 10.20.10.1', dev:'brrtr' },
  { id:'brpcs', x:95,  y:108, w:118, h:36, shape:'grp', label:'BRANCH OFFICE', sub:'10.20.10.0/24', end:'brpc' },
  { id:'core1', x:497, y:400, w:0,   h:0,  shape:'switch', label:'CORE-1', sub:'aabb.cc00.0500', dev:'core1' },
  { id:'core2', x:743, y:400, w:0,   h:0,  shape:'switch', label:'CORE-2', sub:'aabb.cc00.0600', dev:'core2' },
  { id:'swtr',  x:150, y:508, w:0,   h:0,  shape:'switch', label:'SW-TR-1', sub:'training closet', dev:'swtr' },
  { id:'train', x:62,  y:616, w:120, h:36, shape:'grp', label:'TRAINING RM', sub:'VLAN 40 · 130 laptops', end:'train' },
  { id:'swwh1', x:330, y:515, w:0,   h:0,  shape:'switch', label:'SW-WH-1', sub:'warehouse access', dev:'swwh1' },
  { id:'swwh2', x:502, y:538, w:0,   h:0,  shape:'switch', label:'SW-WH-2', sub:'vendor-added', dev:'swwh2' },
  { id:'wh',    x:238, y:622, w:110, h:36, shape:'grp', label:'WAREHOUSE', sub:'VLAN 30 · scanners', end:'whscan' },
  { id:'ship',  x:395, y:624, w:112, h:36, shape:'grp', label:'SHIPPING', sub:'office Fa0/10-18', end:'ship' },
  { id:'swhq',  x:862, y:515, w:0,   h:0,  shape:'switch', label:'SW-HQ-1', sub:'HQ access', dev:'swhq' },
  { id:'hq',    x:762, y:622, w:104, h:36, shape:'grp', label:'HQ OFFICE', sub:'VLAN 10 · 20', end:'hqpc' },
  { id:'fin',   x:952, y:622, w:104, h:36, shape:'grp', label:'FINANCE', sub:'VLAN 60', end:'fin' },
  { id:'srv',   x:992, y:392, w:118, h:40, shape:'srv', label:'SERVER RACK', sub:'10.10.50.0/24', end:'srv' }
];
const EDGES = [
  { id:'l01', a:'brpcs', b:'brrtr', label:'' },
  { id:'l02', a:'brrtr', b:'core',  label:'WAN 10.255.0.4/30', kind:'trunk' },
  { id:'l03', a:'core',  b:'edge',  label:'10.255.0.0/30' },
  { id:'l04', a:'edge',  b:'cloud', label:'203.0.113.0/30' },
  { id:'l05', a:'core',  b:'core1', label:'trunks' },
  { id:'l06', a:'core',  b:'core2', label:'trunks' },
  { id:'l07', a:'core1', b:'swtr',  label:'' },
  { id:'l08', a:'core1', b:'swwh1', label:'' },
  { id:'l09', a:'core1', b:'swwh2', label:'' },
  { id:'l10', a:'core1', b:'swhq',  label:'' },
  { id:'l11', a:'core2', b:'swwh1', label:'trunk Gi1/0/24', kind:'trunk' },
  { id:'l12', a:'core2', b:'swwh2', label:'' },
  { id:'l13', a:'core2', b:'swhq',  label:'' },
  { id:'l14', a:'swwh1', b:'swwh2', label:'rogue patch', kind:'patch' },
  { id:'l15', a:'swtr',  b:'train', label:'' },
  { id:'l16', a:'swwh1', b:'wh',    label:'' },
  { id:'l17', a:'swwh1', b:'ship',  label:'' },
  { id:'l18', a:'swhq',  b:'hq',    label:'' },
  { id:'l19', a:'swhq',  b:'fin',   label:'' },
  { id:'l20', a:'core1', b:'srv',   label:'' },
  { id:'l21', a:'core2', b:'srv',   label:'' }
];

const ICONS = {
  router: '<path class="nicn" d="M-9 2 L-3 -3 M-9 -3 L-3 2 M3 -3 L9 2 M3 2 L9 -3" transform="translate(0,1)"/>',
  switch: '<path class="nicn" d="M-9 -3 h6 m2 0 h6 m-3 -3 l3 3 -3 3 M9 5 h-6 m-2 0 h-6 m3 -3 l-3 3 3 3"/>',
  grp:    '<path class="nicn" d="M-8 -5 h16 v9 h-16 z M-3 7 h6"/>',
  srv:    '<path class="nicn" d="M-8 -8 h16 v6 h-16 z M-8 0 h16 v6 h-16 z M-5 -5 h.01 M-5 3 h.01" stroke-linecap="round"/>',
  cloud:  '<path class="nicn" d="M-20 8 a9 9 0 0 1 -2 -17 a11 11 0 0 1 21 -4 a9 9 0 0 1 12 8 a8 8 0 0 1 -4 13 z" transform="translate(6,-4)"/>'
};
/* ---- device registry (console tabs per device) ---- */

const DEVICES = {
  rtrcore: { name: 'RTR-CORE', tag: 'L3 core router', tabs: ['show', 'config', 'log'] },
  edge:    { name: 'EDGE-RTR', tag: 'internet edge',  tabs: ['show', 'config', 'log'] },
  brrtr:   { name: 'BR-RTR',   tag: 'branch router',  tabs: ['show', 'log'] },
  core1:   { name: 'CORE-1',   tag: 'distribution L2',tabs: ['show', 'config', 'log'] },
  core2:   { name: 'CORE-2',   tag: 'distribution L2',tabs: ['show', 'config', 'log'] },
  swtr:    { name: 'SW-TR-1',  tag: 'training access',tabs: ['show', 'log'] },
  swwh1:   { name: 'SW-WH-1',  tag: 'warehouse access',tabs: ['show', 'config', 'log'] },
  swwh2:   { name: 'SW-WH-2',  tag: 'vendor-added access',tabs: ['show', 'config', 'log'] },
  swhq:    { name: 'SW-HQ-1',  tag: 'HQ access',      tabs: ['show', 'log'] },
  dhcp:    { name: 'SRV-DHCP', tag: 'DHCP service 10.10.50.11', tabs: ['pools', 'bindings', 'log'] },
  wms:     { name: 'WMS-SRV',  tag: 'warehouse mgmt server 10.10.50.30', tabs: ['ipconfig', 'nic'] },
  cfo:     { name: 'CFO-PC',   tag: 'static workstation 10.10.60.22', tabs: ['ipconfig', 'nic'] },
  hire:    { name: 'NEW-HIRE-PC', tag: 'onboarding workstation', tabs: ['ipconfig', 'nic'] }
};
/* ---- device log buffers (synthetic, state-independent evidence) ---- */

const LOGS = {
  core1: [
    '%MAC_MOVE-5-MACFLAP: Host 00:1a:2b:aa:00:31 flapping between port Gi1/0/5 and Gi1/0/4 in VLAN 0030',
    '%STORM_CONTROL-5-SUPPRESSED: Broadcast traffic on Gi1/0/5 exceeded configured threshold (was 20.00%, now 41.30%)',
    '%QUEUE-4-INPUT_DROPS: GigabitEthernet1/0/5 input queue drops rising (broadcast amplification suspected)',
    '%MAC_MOVE-5-MACFLAP: Host 00:1a:2b:aa:00:87 flapping between port Gi1/0/5 and Gi1/0/4 in VLAN 0030',
    '%LINK-3-UPDOWN: Interface FastEthernet0/5 on SW-WH-1, changed state to down (label printer, duplex renegotiated)',
    '%PORT_SECURITY-2-PSECURE_VIOLATION: SECURITY violation on SW-HQ-1 Fa0/7 (MAC 00c0.aabb.1234) — RESOLVED 06:12, meeting-room visitor, auto errdisable-recovery',
    '%SYS-5-CONFIG_I: Config saved from console by admin on 10.10.50.11 (scheduled nightly backup, CPU spike 74%)',
    '%CDP-4-DUPLEX_MISMATCH: duplex mismatch discovered on SW-WH-1 Fa0/5 (half), with label-prn-01 (full)',
    '%LINEPROTO-5-UPDOWN: Line protocol on Interface Gi1/0/4, changed state to up (redundant uplink healthy)',
    '%SYS-6-LOGOUT: User noc-tech has exited idle session'
  ],
  core2: [
    '%CDP-4-NATIVE_VLAN_MISMATCH: Native VLAN mismatch discovered on GigabitEthernet1/0/24 (999), with SW-WH-1 GigabitEthernet1/0/2 (1)',
    '%SPANTREE-5-TOPOTRAP: Topology Change Trap for vlan 30 (frequent topology changes observed upstream)',
    '%SYS-5-CONFIG_I: Config saved by admin (nightly backup)'
  ],
  swwh2: [
    '%SYS-6-CFGNOTE: Vendor engineer session (Sun 23:40): "tuning broadcast behavior per legacy site template" — no change ticket on file',
    '%SPANTREE-6-NOTE: VLAN 0030 spanning tree administratively disabled in running-config',
    '%LINK-3-UPDOWN: Interface GigabitEthernet0/3, changed state to up (patch panel port 14)'
  ],
  swhq: [
    '%PORT_SECURITY-2-PSECURE_VIOLATION: Fa0/7 violation (meeting-room visitor switch) — RESOLVED last Tue, auto-recovery',
    '%SYS-5-CONFIG_I: Config saved (nightly backup)'
  ],
  dhcp: [
    'DHCP scope POOL-TRAIN: 0 addresses available (pool full)',
    'DHCPDISCOVER from 00:1a:4d:09:11:02 via relay 10.10.40.1: no available leases (POOL-TRAIN)',
    'DHCP scope POOL-TRAIN utilization 100% for 14 minutes',
    'DHCP scope POOL-OFFICE utilization 23% (normal)'
  ],
  edge: [
    '%SYS-5-CONFIG_I: Failover test rolled back from <backup-sun-23:58> — "restore completed" (verify critical routes after rollback)',
    '%BGP-5-ADJCHANGE: neighbor 203.0.113.1 Up (provider link healthy)',
    '%SYS-6-CFGNOTE: Route Map ISP-TEST removed after failed failover drill'
  ],
  rtrcore: [
    '%SYS-5-CFGEDIT: route-cleanup.ps1 removed 3 static routes (Sun 02:10) — "remove unused 10.x entries per audit AR-2214"',
    '%SEC-6-INFO: ACL FINLOCK installed on Vlan50 outbound (ticket SEC-8871, approved by CISO office)',
    '%SYS-5-CONFIG_I: Config saved (nightly backup)'
  ],
  brrtr: [
    '%LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/0, changed state to up (WAN healthy)',
    '%SYS-6-NOTE: No local faults detected; all internal branch services normal'
  ],
  wms: [], cfo: [], hire: [], swtr: [
    '%SYS-6-NOTE: Switch uptime 4.7 years. Foundation-day vintage: never re-prioritized since install.',
    '%SPANTREE-6-NOTE: This platform currently operates as VLAN 0030 root bridge (default priority 32768)'
  ]
};
/* ---- DHCP active bindings sample ---- */

const BINDINGS = [
  ['00:1a:4d:09:11:02', '10.10.40.12', 'POOL-TRAIN', 'leased 6d22h'],
  ['00:1a:4d:09:2b:77', '10.10.40.31', 'POOL-TRAIN', 'leased 6d21h'],
  ['00:1a:4d:08:00:aa', '10.10.30.101', 'POOL-WH', 'leased 11h'],
  ['00:1a:4d:01:0f:3c', '10.10.10.57', 'POOL-OFFICE', 'leased 3h'],
  ['00:1a:4d:06:12:9e', '10.10.60.44', 'POOL-FIN', 'leased 45m']
];
/* ---- probe engine data: endpoints, targets, permissions, paths ---- */

const ENDPOINTS = {
  hqpc:  { label: 'HQ-PC-12 · 10.10.10.57 (VLAN 10)', node: 'hq' },
  finpc: { label: 'FIN-PC-02 · 10.10.60.44 (VLAN 60)', node: 'fin' },
  cfo:   { label: 'CFO-PC · 10.10.60.22 static (VLAN 60)', node: 'fin' },
  hire:  { label: 'NEW-HIRE-PC · onboarding (VLAN 60)', node: 'fin' },
  whscan:{ label: 'WH-SCAN-01 · 10.10.30.101 (VLAN 30)', node: 'wh' },
  ship:  { label: 'SHIP-PC-03 · shipping office (Fa0/10-18)', node: 'ship' },
  train: { label: 'TRAIN-LT-07 · training laptop', node: 'train' },
  brpc:  { label: 'BR-PC-01 · 10.20.10.51 (branch)', node: 'brpcs' }
};
const TARGETS = {
  hrsrv: { label: 'HR-SRV · 10.10.50.20 (payroll app)', node: 'srv' },
  wms:   { label: 'WMS-SRV · 10.10.50.30', node: 'srv' },
  print: { label: 'PRINT-SRV · 10.10.50.50', node: 'srv' },
  net:   { label: 'INTERNET · 8.8.8.8', node: 'cloud' },
  brpc:  { label: 'BR-PC-01 · 10.20.10.51', node: 'brpcs' }
};
const RENEW_ALLOWED = { ship: true, train: true, hqpc: true, finpc: true, whscan: true };
const ALLOWED = {
  hqpc: ['net', 'hrsrv', 'wms', 'brpc'],
  finpc: ['hrsrv', 'wms', 'net'],
  cfo: ['print', 'net'],
  hire: ['hrsrv', 'net'],
  whscan: ['wms', 'net'],
  brpc: ['wms', 'hrsrv', 'net']
};
const PATHS = {
  'hqpc>net':   ['hq', 'swhq', 'core', 'edge', 'cloud'],
  'hqpc>hrsrv': ['hq', 'swhq', 'core', 'srv'],
  'hqpc>wms':   ['hq', 'swhq', 'core', 'srv'],
  'hqpc>brpc':  ['hq', 'swhq', 'core', 'brrtr', 'brpcs'],
  'finpc>hrsrv':['fin', 'swhq', 'core', 'srv'],
  'finpc>wms':  ['fin', 'swhq', 'core', 'srv'],
  'finpc>net':  ['fin', 'swhq', 'core', 'edge', 'cloud'],
  'cfo>print':  ['fin', 'swhq', 'core', 'srv'],
  'cfo>net':    ['fin', 'swhq', 'core', 'edge', 'cloud'],
  'hire>hrsrv': ['fin', 'swhq', 'core', 'srv'],
  'hire>net':   ['fin', 'swhq', 'core', 'edge', 'cloud'],
  'whscan>wms': ['wh', 'swwh1', 'core', 'srv'],
  'whscan>net': ['wh', 'swwh1', 'core', 'edge', 'cloud'],
  'ship>srv':   ['ship', 'swwh1', 'core', 'srv'],
  'train>srv':  ['train', 'swtr', 'core', 'srv'],
  'brpc>wms':   ['brpcs', 'brrtr', 'core', 'srv'],
  'brpc>hrsrv': ['brpcs', 'brrtr', 'core', 'srv'],
  'brpc>net':   ['brpcs', 'brrtr', 'core', 'edge', 'cloud']
};

/* build the probe result — the single place where faults decide outcomes */
/* ---- pillars + mitigation control catalogs ---- */

const PILLAR_NAMES = { P1: 'UNDERSTAND', P2: 'RECOGNIZE', P3: 'DETECT', P4: 'MITIGATE' };
const CONTROLS8 = [
  ['sc', 'storm control + BPDU guard on access ports'],
  ['rb', 'root-bridge priority plan (distribution tier = primary)'],
  ['dh', 'DHCP utilization alert at 85% + shorter leases'],
  ['ip', 'IP address register / DHCP-first policy for user devices'],
  ['x1', 'upgrade all access switches to 10G'],
  ['x2', 'disable CDP on every switch'],
  ['x3', 'merge all VLANs into one flat network'],
  ['x4', 'static ARP entries for all servers']
];
const CONTROLS10 = CONTROLS8.slice(0, 6).concat([
  ['x5', 'shutdown guest Wi-Fi during peak'],
  ['x6', 'static ARP entries for all servers']
]);
/* ---- CompTIA troubleshooting methodology steps ---- */

const STEPS7 = [
  'Identify the problem (symptoms, affected users)',
  'Establish a theory of probable cause',
  'Test the theory',
  'Establish a plan of action',
  'Implement the solution — or escalate',
  'Verify full functionality',
  'Document findings and lessons learned'
];
/* ---- field manual cards + glossary ---- */

const MANUAL = [
  { t: 'Switching loops & STP', b: `Spanning Tree Protocol (STP) exists because Ethernet frames have no TTL: any Layer 2 loop multiplies broadcast frames forever — a <dfn data-g="Broadcast storm">broadcast storm</dfn> that saturates bandwidth and CPU. Bridges elect one <dfn data-g="Root bridge">root bridge</dfn> by LOWEST bridge ID (configured priority first, then lowest MAC). Redundant ports compute their role and block, standing by until the topology changes.`,
    sig: 'MACFLAP syslog lines (same MAC alternating ports), storm-control suppression, input-queue drops, hot switch fans, "root is an access switch" in show spanning-tree.',
    fix: 'Root-priority plan (distribution tier primary), BPDU guard + PortFast on access ports, root guard on downlinks, storm control, never allow uncontrolled vendor switches.' },
  { t: 'VLAN assignment', b: `An access port's VLAN IS the client's broadcast domain. A port in a VLAN with no SVI and no DHCP scope strands clients on <dfn data-g="APIPA">APIPA</dfn> (169.254.0.0/16) — locally reachable, routed nowhere. Trunks carry multiple VLANs; their <dfn data-g="Native VLAN">native VLAN</dfn> must match on both ends or untagged frames silently migrate between VLANs.`,
    sig: 'APIPA on one port group only; show vlan brief shows ports in a deprecated VLAN; %CDP-4-NATIVE_VLAN_MISMATCH.',
    fix: 'Move ports to the intended VLAN; keep a documented VLAN map; pin native VLAN to an unused VLAN on every trunk; remove deprecated VLANs.' },
  { t: 'Access Control Lists', b: `ACLs filter routed traffic entry-by-entry, TOP-DOWN, first match wins, with an invisible "implicit deny any" at the end. Direction matters (IN = entering the interface, OUT = leaving it toward the subnet). The <dfn data-g="Implicit deny">implicit deny</dfn> means a permit-only ACL silently blocks everything you forgot to permit.`,
    sig: 'Traffic dropped after routing checks out; hit counters climbing on a deny entry; symptoms gated by source/destination pair, not by link.',
    fix: 'Fix the one wrong entry (action, source, or order); keep intended restrictions; review hit counters as evidence; never delete a control to make a symptom vanish.' },
  { t: 'Routing table', b: `A router forwards using its <dfn data-g="Routing table">routing table</dfn>: most-specific (longest-prefix) match wins; a static route pins a <dfn data-g="Next hop">next hop</dfn> for a prefix. A missing route = silent drop (often ICMP unreachable). Reachability is a ROUND TRIP: every router on BOTH paths needs a route.`,
    sig: 'Traceroute dies at the router lacking the route; ping fails while intermediate hops look healthy; asymmetric symptoms (one direction works).',
    fix: 'Re-add or correct the static route (exact prefix + next hop); audit tables after any "cleanup"; watch for stale routes pointing at dead next-hops.' },
  { t: 'Default route', b: `The <dfn data-g="Default route">default route</dfn> (0.0.0.0/0) is the router\'s catch-all — the "gateway of last resort". It lives naturally at the internet edge. Without it, every destination that no specific route covers is dropped — which, from inside, looks like "the internet is down" while everything internal works.`,
    sig: 'Traceroute to any public IP stops at the edge router; show ip route says "Gateway of last resort is not set"; internal apps unaffected.',
    fix: 'Restore ip route 0.0.0.0 0.0.0.0 &lt;ISP&gt; on the edge; diff configs after any rollback; monitor the default route\'s existence.' },
  { t: 'DHCP pool exhaustion', b: `A DHCP scope can only lease what it owns: usable addresses minus network, broadcast, and the gateway. When leases run out, new clients get nothing and self-assign APIPA. Lease TIME is the hidden capacity lever — a 7-day lease keeps a departed laptop holding an address for a week.`,
    sig: 'Utilization at 100%, "no available leases" in server logs, only LATER joiners affected (early birds hold leases), 169.254.x.x clients.',
    fix: 'Size the scope to the population with headroom; shorten leases for volatile populations; alert at ~85% utilization; secondary subnets/superscoping for events.' },
  { t: 'Wrong gateway / IP / subnet mask', b: `The <dfn data-g="Subnet mask / Default gateway">subnet mask</dfn> tells a host which destinations are "local" (ARP directly) versus "remote" (send to the gateway). A wrong gateway kills every cross-subnet REPLY; a wrong mask can exclude the gateway itself; a wrong IP can hijack another host\'s identity.`,
    sig: 'Gateway wrong: same-subnet traffic works, remote dies (replies never return). Mask wrong: host cannot even ARP for its gateway. Wrong IP: intermittent, duplicate-address behavior.',
    fix: 'Correct the static fields against the documented segment; prefer DHCP for user devices; keep an IP address register; verify mask + gateway on every static change.' }
];

const GLOSSARY = [
  ['STP', 'Spanning Tree Protocol — elects a loop-free tree among switches by blocking redundant ports.'],
  ['BPDU', 'Bridge Protocol Data Unit — the hello frames switches exchange to run STP (every 2 s).'],
  ['Root bridge', 'The switch with the lowest bridge ID (priority, then MAC); the reference point of the tree.'],
  ['Broadcast storm', 'Runaway multiplication of broadcast frames in a Layer 2 loop; saturates links and CPU.'],
  ['MAC flapping', 'The same source MAC repeatedly learned on different ports — the fingerprint of a loop.'],
  ['VLAN', 'Virtual LAN — a Layer 2 broadcast domain; an access port\'s VLAN membership defines the client\'s segment.'],
  ['Native VLAN', 'The VLAN that carries UNtagged frames on a trunk; must match on both trunk ends.'],
  ['ACL', 'Access Control List — ordered packet filters processed top-down, first match wins.'],
  ['Implicit deny', 'The invisible "deny any" at the end of every ACL; anything not permitted is dropped.'],
  ['Routing table', 'The router\'s map of prefixes → next hops; longest-prefix match decides.'],
  ['Default route', '0.0.0.0/0 — the catch-all used when no more-specific route matches; "gateway of last resort".'],
  ['Next hop', 'The neighbor IP where a router sends packets for a given prefix.'],
  ['DHCP lease', 'A time-limited address grant; lease lifetime controls how fast stale addresses free up.'],
  ['APIPA', 'Automatic Private IP Addressing — 169.254.0.0/16 self-assignment when no DHCP lease arrives; link-local only.'],
  ['Subnet mask / Default gateway', 'The mask defines the host\'s "local" range; the gateway is where remote traffic is handed off.']
];


/* Item contract (audit R4/R5): correct index rotates across the set; the correct answer is never
   the longest option; all options share structure/tone; `t` = Field Manual card title used by
   the completion report's focus areas. */
const QUIZ_M = [
  { t: 'Switching loops & STP', q: 'What decides which switch becomes the STP root bridge?',
    o: ['The switch with the most active ports', 'The oldest switch in the VLAN', 'The lowest bridge ID: priority, then MAC', 'The switch closest to the routers'],
    c: 2, e: 'Election compares bridge IDs: configured priority first, MAC as tie-break. Port counts, age and rack position play no role — which is how an old access switch with a low MAC "steals" root from a distribution switch still at default 32768.' },
  { t: 'VLAN assignment', q: 'A workstation shows 169.254.18.222. The DHCP scope for its subnet has 100 free leases. Most likely cause?',
    o: ['Its port sits in a scope-less VLAN', 'The DHCP service stopped responding', "The workstation's lease expired early", 'The scope ran out of free leases'],
    c: 0, e: 'APIPA means "no lease arrived", and the scope has space — so capacity and server health are out. A port in the wrong VLAN puts the DISCOVER in a segment with no SVI and no scope: it never reaches the server. Check the port before the server.' },
  { t: 'Access Control Lists', q: 'An inbound ACL permits two subnets only. What happens to everyone else?',
    o: ['They are permitted by default', 'Only UDP sources are permitted', 'They match the last explicit rule', 'The implicit deny silently drops them'],
    c: 3, e: 'Every ACL ends with an invisible "deny any" — permits do not opt other sources out of it. There is no protocol-based default permit, and unmatched traffic never falls through to a softer rule: it is dropped.' },
  { t: 'Default route', q: 'Internal apps work; every external site is dead. Traceroutes stop right after the edge. What is missing?',
    o: ['A VLAN assignment on the access ports', "The edge router's missing default route", "The DNS server's forwarders", 'A static route to the file servers'],
    c: 1, e: 'Internal prefixes still have specific routes, so only the catch-all can be gone: 0.0.0.0/0 on the edge. DNS would resolve names but not restore reachability; VLAN or server-route faults would break internal traffic too.' },
  { t: 'DHCP pool exhaustion', q: 'POOL-TRAIN serves 130 laptops from 10.10.40.0/25. Which fix combination is right?',
    o: ['Shrink the scope and lengthen leases', 'Move the gateway to .254', 'Expand to /24, shorten the lease', 'Reserve more addresses for printers'],
    c: 2, e: 'A /25 holds 126 usable (125 after the gateway) — fewer than 130 clients. A /24 gives 253 assignable, and shorter leases free departed clients faster. Shrinking, lengthening leases or reserving more all move the wrong direction.' },
  { t: 'Wrong gateway / IP / subnet mask', q: 'A host at 10.10.60.22/28 (gateway .1) can open a printer at .30 but nothing else. Why does .30 work?',
    o: [".30 falls inside the host's /28 range", 'The printer answers without a gateway', 'The gateway forwards that one flow', "It does not — the report is wrong"],
    c: 0, e: 'A /28 makes the host believe its subnet is .16-.31, so it ARPs directly for .30 — inside the range. Everything else, gateway .1 included, is classified remote and sent to a gateway it cannot reach. The report is real; the mask is the culprit.' },
  { t: 'Wrong gateway / IP / subnet mask', q: 'A terminal reaches its own subnet server but no other subnet; the server answers only its own subnet. What is wrong?',
    o: ['The terminal is in the wrong VLAN', "The server's default gateway is dead", 'STP blocks the uplink intermittently', 'The DHCP scope is exhausted'],
    c: 1, e: 'Same-subnet both ways plus cross-subnet dead in both directions means one host cannot hand replies to a router: its gateway points at nothing. Wrong VLAN or exhaustion would show APIPA; a blocked uplink would kill the same-subnet path too.' }
];
const QUIZ_H = [
  { t: 'Routing table', q: 'Branch traceroute: hop 1 = 10.20.10.1, hop 2 = 10.255.0.5, then only stars. HQ users reach the same server fine. What do you fix?',
    o: ['Add a default route on BR-RTR', 'Reboot the WAN concentrator', 'Add a route to 10.10.50.0/24 on BR-RTR', 'Add the missing return route on RTR-CORE'],
    c: 3, e: 'The outbound path works — hop 2 answered and HQ users are fine — so requests arrive and the REPLIES die at the first router without a route back to 10.20.10.0/24. BR-RTR already reaches HQ (the probes got there), and a reboot fixes nothing structural.' },
  { t: 'Switching loops & STP', q: "show spanning-tree: root is 'aabb.cc00.0200 — SW-TR-1, training closet' at default priority. Best action?",
    o: ['Set the distribution switch priority to 24576', 'Force SW-TR-1 offline during business hours', "Lower SW-TR-1's MAC address in config", 'Disable STP and cable a single path'],
    c: 0, e: 'Root placement is a priority decision: drop the distribution switch below 32768 and the election is deterministic. Taking a switch offline mid-day causes an outage, MACs are burned in and cannot be configured, and disabling STP re-opens the door to loops.' },
  { t: 'DHCP pool exhaustion', q: 'Two rooms show APIPA. POOL-TRAIN reads 125/125 used; the other room uses a scope at 96/253 but its ports sit in VLAN 2. Diagnoses?',
    o: ['Both rooms are exhausting their scopes', 'Both rooms have wrong port VLANs', 'Training: exhausted scope. Other room: wrong VLAN', 'A native VLAN mismatch breaks both rooms'],
    c: 2, e: 'Identical symptom, different diseases: 125/125 is genuine exhaustion, while 96/253 means leases are plentiful where it matters — the DISCOVER never arrives because VLAN 2 has no SVI and no scope. A trunk mismatch breaks untagged traffic, not lease counts.' },
  { t: 'Access Control Lists', q: "FINLOCK shows seq 10 'deny ip 10.10.60.0 0.0.0.255 host 10.10.50.20' with 214 climbing matches. Finance is blocked. Action?",
    o: ['Remove the ACL from Vlan50', 'Change seq 10 to permit; keep the rest', 'Move the ACL to the inbound direction', 'Append permit ip any any as seq 40'],
    c: 1, e: 'The counter is the evidence: finance packets die at a line denying exactly the finance subnet — the security team meant to permit. Fix that one action word. Removal also removes the intended lockdown; the direction is already correct; a trailing permit-any is dead text after the implicit deny.' },
  { t: 'Wrong gateway / IP / subnet mask', q: 'A host at 10.10.60.22/28 opens a printer at 10.10.60.30 but nothing else. Why does .30 respond?',
    o: ['The gateway proxies that single flow', 'The printer holds a static ARP entry', "The host's DHCP lease covers .30", ".30 sits inside the host's /28 window"],
    c: 3, e: 'With mask 255.255.255.240 the host treats .16-.31 as local and ARPs directly — .30 answers, everything else is "remote" behind an unreachable gateway. No proxying or static ARP is involved, and a host this broken is static: there is no lease at all.' },
  { t: 'Switching loops & STP', q: 'MACFLAP and storm-control lines are ticking on one uplink; users see seconds-long delays. First action?',
    o: ['Break the loop, then harden the topology', 'Raise the storm-control threshold to 50%', 'Replace the failing uplink cable', 'Shorten the DHCP lease on that VLAN'],
    c: 0, e: 'MAC flapping plus storm suppression is a live Layer 2 loop: restore STP on the non-participating bridge or shut one redundant link, then re-establish the designed topology (root priority, BPDU guard). Raising the threshold silences the alarm, not the storm; the cable and DHCP are unrelated.' },
  { t: 'Default route', q: 'After a maintenance rollback: internal apps fine from every site; nothing beyond the ISP answers. Where first?',
    o: ['The core switch VLAN table', "The branch router's LAN interface", "The edge router's default route", "The DHCP server's scope options"],
    c: 2, e: 'Internal-ok plus external-dead-from-everywhere points at the one device every external path shares: the edge. Rollbacks routinely resurrect an older config missing 0.0.0.0/0 — check "gateway of last resort", then diff against the pre-change backup. The other three would each break internal traffic.' }
];
