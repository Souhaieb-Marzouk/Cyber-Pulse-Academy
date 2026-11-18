// THE FABRIC BENCH — static port. ported 1:1 from src/lib/lab/model.ts (tsc es2020).
// Content, algorithms, wording and answers are identical to the original framework lab.
// Loaded as a classic <script>: top-level const/function become page-global in load order.

// ============================================================================
// THE FABRIC BENCH — model & seed data
// CompTIA Network+ N10-009 · Objective 2.2 — Switching Technologies
// All data is synthetic training data (fictional org: Meridian College).
// Vendor-style defaults (VLAN 1, priority 32768) are labeled as such in-UI.
// ============================================================================
// ---------------------------------------------------------------------------
// Constants & helpers
// ---------------------------------------------------------------------------
const TRUNK_ALLOWED_SPEC = [10, 20, 30, 40, 99, 150];
const NATIVE_SPEC = 99;
const ROOT_PRIORITY_SPEC = 4096;
const JUMBO_PATH_PORTS = ['B2|Gi0/4', 'B2|Gi0/23', 'CORE|Gi0/2', 'CORE|Gi0/3'];
const JUMBO_PATH_NICS = ['nas-san', 'srv-vmi'];
const EDGE_PORT_IDS = [
    'B1|Gi0/1', 'B1|Gi0/2', 'B1|Gi0/3', 'B1|Gi0/4',
    'B2|Gi0/1', 'B2|Gi0/2', 'B2|Gi0/3', 'B2|Gi0/4', 'B2|Gi0/5',
    'CORE|Gi0/3',
];
const UNUSED_PORT_IDS = ['B1|Gi0/5', 'B1|Gi0/6', 'B2|Gi0/6', 'CORE|Gi0/4', 'CORE|Gi0/5', 'CORE|Gi0/6'];
const ALL_TRUNK_PORTS = ['B1|Gi0/23', 'B1|Gi0/24', 'B2|Gi0/23', 'B2|Gi0/24', 'CORE|Gi0/1', 'CORE|Gi0/2'];
const PRIORITIES = [0, 4096, 8192, 12288, 16384, 20480, 24576, 28672, 32768, 36864, 40960, 45056, 49152, 53248, 57344, 61440];
const pid = (s, n) => `${s}|${n}`;
const VLAN_COLORS = {
    10: '#E8A33D', // amber — students
    20: '#4ADE80', // green — staff
    30: '#F472B6', // pink — servers
    40: '#22D3EE', // cyan — cameras
    99: '#94A3B8', // slate — mgmt
    150: '#C084FC', // violet — voice
    1: '#6B7280',
};
const vlanColor = (v) => VLAN_COLORS[v] ?? '#9CA3AF';
// ---------------------------------------------------------------------------
// Design table (the "work order" the student implements)
// ---------------------------------------------------------------------------
const DESIGN = {
    vlans: [
        { id: 10, name: 'STUDENTS', members: 'Lab PCs (B2)' },
        { id: 20, name: 'STAFF', members: 'Staff PCs, phone (data), printer (B1)' },
        { id: 30, name: 'SERVERS', members: 'NAS-SAN (B2), SRV-VMI (CORE)' },
        { id: 40, name: 'CAMERAS', members: 'CAM-3F (B2)' },
        { id: 99, name: 'MGMT', members: 'Native VLAN on every trunk' },
        { id: 150, name: 'VOICE', members: 'PHONE-STAFF1 voice side (B1 Gi0/3)' },
    ],
    access: [
        { end: 'pc-staff1', vlan: 20 }, { end: 'pc-staff2', vlan: 20 },
        { end: 'phone-1', vlan: 20, voice: 150 }, { end: 'prn-lib', vlan: 20 },
        { end: 'pc-lab1', vlan: 10 }, { end: 'pc-lab2', vlan: 10 }, { end: 'pc-lab3', vlan: 10 },
        { end: 'nas-san', vlan: 30 }, { end: 'cam-3f', vlan: 40 }, { end: 'srv-vmi', vlan: 30 },
    ],
    trunkAllowed: TRUNK_ALLOWED_SPEC,
    trunkNative: NATIVE_SPEC,
    jumboElements: [...JUMBO_PATH_PORTS, ...JUMBO_PATH_NICS],
};
// ---------------------------------------------------------------------------
// End systems
// ---------------------------------------------------------------------------
function ends() {
    const list = [
        { id: 'pc-staff1', name: 'PC-STAFF1', kind: 'pc', switchId: 'B1', portId: pid('B1', 'Gi0/1'), dataVlan: 20, mac: '00:50:56:C1:01:11', ip: '10.20.0.11', nicSpeed: 'auto', nicDuplex: 'auto', nicMtu: 1500 },
        { id: 'pc-staff2', name: 'PC-STAFF2', kind: 'pc', switchId: 'B1', portId: pid('B1', 'Gi0/2'), dataVlan: 20, mac: '00:50:56:C1:01:12', ip: '10.20.0.12', nicSpeed: 'auto', nicDuplex: 'auto', nicMtu: 1500 },
        { id: 'phone-1', name: 'PHONE-STAFF1', kind: 'phone', switchId: 'B1', portId: pid('B1', 'Gi0/3'), dataVlan: 20, mac: '00:50:56:C1:01:13', ip: '10.150.0.13', nicSpeed: 'auto', nicDuplex: 'auto', nicMtu: 1500 },
        { id: 'prn-lib', name: 'PRN-LIB', kind: 'printer', switchId: 'B1', portId: pid('B1', 'Gi0/4'), dataVlan: 20, mac: '00:50:56:C1:01:14', ip: '10.20.0.14', nicSpeed: 100, nicDuplex: 'full', nicMtu: 1500 },
        { id: 'pc-lab1', name: 'PC-LAB1', kind: 'pc', switchId: 'B2', portId: pid('B2', 'Gi0/1'), dataVlan: 10, mac: '00:50:56:C2:02:21', ip: '10.10.0.21', nicSpeed: 'auto', nicDuplex: 'auto', nicMtu: 1500 },
        { id: 'pc-lab2', name: 'PC-LAB2', kind: 'pc', switchId: 'B2', portId: pid('B2', 'Gi0/2'), dataVlan: 10, mac: '00:50:56:C2:02:22', ip: '10.10.0.22', nicSpeed: 'auto', nicDuplex: 'auto', nicMtu: 1500 },
        { id: 'pc-lab3', name: 'PC-LAB3', kind: 'pc', switchId: 'B2', portId: pid('B2', 'Gi0/3'), dataVlan: 10, mac: '00:50:56:C2:02:23', ip: '10.10.0.23', nicSpeed: 'auto', nicDuplex: 'auto', nicMtu: 1500 },
        { id: 'nas-san', name: 'NAS-SAN', kind: 'nas', switchId: 'B2', portId: pid('B2', 'Gi0/4'), dataVlan: 30, mac: '00:50:56:C2:02:24', ip: '10.30.0.24', nicSpeed: 'auto', nicDuplex: 'auto', nicMtu: 1500 },
        { id: 'cam-3f', name: 'CAM-3F', kind: 'camera', switchId: 'B2', portId: pid('B2', 'Gi0/5'), dataVlan: 40, mac: '00:50:56:C2:02:25', ip: '10.40.0.25', nicSpeed: 'auto', nicDuplex: 'auto', nicMtu: 1500 },
        { id: 'srv-vmi', name: 'SRV-VMI', kind: 'server', switchId: 'CORE', portId: pid('CORE', 'Gi0/3'), dataVlan: 30, mac: '00:50:56:C0:00:31', ip: '10.30.0.31', nicSpeed: 'auto', nicDuplex: 'auto', nicMtu: 1500 },
    ];
    return Object.fromEntries(list.map(e => [e.id, e]));
}
// ---------------------------------------------------------------------------
// Ports
// ---------------------------------------------------------------------------
function mkPort(s, name, role, over = {}) {
    return {
        id: pid(s, name), switchId: s, name, role,
        enabled: true, description: '',
        mode: 'access', accessVlan: 1, voiceVlan: null,
        allowedVlans: [1], nativeVlan: 1,
        speed: 'auto', duplex: 'auto', mtu: 1500,
        portfast: false, bpduguard: false,
        ...over,
    };
}
function ports() {
    const list = [
        // ACCESS-B1 (2nd floor — staff wing)
        mkPort('B1', 'Gi0/1', 'edge'), mkPort('B1', 'Gi0/2', 'edge'),
        mkPort('B1', 'Gi0/3', 'edge'), mkPort('B1', 'Gi0/4', 'edge'),
        mkPort('B1', 'Gi0/5', 'spare'), mkPort('B1', 'Gi0/6', 'spare'),
        mkPort('B1', 'Gi0/23', 'uplink'), mkPort('B1', 'Gi0/24', 'crosslink'),
        // ACCESS-B2 (3rd floor — labs)
        mkPort('B2', 'Gi0/1', 'edge'), mkPort('B2', 'Gi0/2', 'edge'),
        mkPort('B2', 'Gi0/3', 'edge'), mkPort('B2', 'Gi0/4', 'edge'),
        mkPort('B2', 'Gi0/5', 'edge', { enabled: false }),
        mkPort('B2', 'Gi0/6', 'spare'),
        mkPort('B2', 'Gi0/23', 'uplink'), mkPort('B2', 'Gi0/24', 'crosslink'),
        // CORE-1 (main IDF)
        mkPort('CORE', 'Gi0/1', 'uplink'), mkPort('CORE', 'Gi0/2', 'uplink'),
        mkPort('CORE', 'Gi0/3', 'edge'),
        mkPort('CORE', 'Gi0/4', 'spare'), mkPort('CORE', 'Gi0/5', 'spare'), mkPort('CORE', 'Gi0/6', 'spare'),
    ];
    return Object.fromEntries(list.map(p => [p.id, p]));
}
const LINKS = [
    { id: 'L-CORE-B1', a: pid('CORE', 'Gi0/1'), b: pid('B1', 'Gi0/23'), kind: 'uplink' },
    { id: 'L-CORE-B2', a: pid('CORE', 'Gi0/2'), b: pid('B2', 'Gi0/23'), kind: 'uplink' },
    { id: 'L-B1-B2', a: pid('B1', 'Gi0/24'), b: pid('B2', 'Gi0/24'), kind: 'crosslink' },
];
function switches() {
    return {
        CORE: { id: 'CORE', hostname: 'CORE-1', floor: 'Main IDF (1st floor)', mac: '0c14.8a3f.1101', priority: 32768, stpMode: '802.1w', stpEnabled: true, ipRouting: false, x: 500, y: 118 },
        B1: { id: 'B1', hostname: 'ACCESS-B1', floor: '2nd floor — staff wing', mac: '0004.a1b2.c301', priority: 32768, stpMode: '802.1w', stpEnabled: true, ipRouting: false, x: 235, y: 428 },
        B2: { id: 'B2', hostname: 'ACCESS-B2', floor: '3rd floor — labs', mac: '0c22.1133.4402', priority: 32768, stpMode: '802.1w', stpEnabled: true, ipRouting: false, x: 765, y: 428 },
    };
}
const LINK_COST_AT = (speed) => (speed >= 1000 ? 4 : 19);
// ---------------------------------------------------------------------------
// Initial environments
// ---------------------------------------------------------------------------
function initialEnv(mode) {
    const env = {
        vlans: [{ id: 1, name: 'default' }],
        switches: switches(),
        ports: ports(),
        ends: ends(),
        links: LINKS.map(l => ({ ...l })),
        counters: {},
    };
    for (const p of Object.values(env.ports))
        env.counters[p.id] = { crc: 0, coll: 0, late: 0 };
    if (mode === 'medium') {
        // Factory-floor flat network. Camera port shipped disabled.
        env.ports[pid('B1', 'Gi0/4')].description = ''; // printer port, mismatch seeded via NIC
        env.ends['prn-lib'].nicSpeed = 100;
        env.ends['prn-lib'].nicDuplex = 'full';
        return env;
    }
    // ---- HARD: a previous tech left a half-finished, faulty cutover ----
    env.vlans = [
        { id: 1, name: 'default' },
        ...DESIGN.vlans.map(v => ({ id: v.id, name: v.name })),
    ];
    const P = env.ports;
    // B1 access side mostly right
    P[pid('B1', 'Gi0/1')].accessVlan = 20;
    P[pid('B1', 'Gi0/1')].description = 'PC-STAFF1';
    P[pid('B1', 'Gi0/2')].accessVlan = 20;
    P[pid('B1', 'Gi0/2')].description = 'PC-STAFF2';
    P[pid('B1', 'Gi0/3')].accessVlan = 20;
    P[pid('B1', 'Gi0/3')].voiceVlan = 150;
    P[pid('B1', 'Gi0/3')].description = 'PHONE-STAFF1';
    P[pid('B1', 'Gi0/4')].accessVlan = 20;
    P[pid('B1', 'Gi0/4')].description = 'PRN-LIB';
    // B2: ticket A faults (LAB1 port shut + wrong VLAN)
    P[pid('B2', 'Gi0/1')].enabled = false;
    P[pid('B2', 'Gi0/1')].accessVlan = 20;
    P[pid('B2', 'Gi0/1')].description = 'PC-LAB1';
    P[pid('B2', 'Gi0/2')].accessVlan = 10;
    P[pid('B2', 'Gi0/2')].description = 'PC-LAB2';
    P[pid('B2', 'Gi0/3')].accessVlan = 10;
    P[pid('B2', 'Gi0/3')].description = 'PC-LAB3';
    P[pid('B2', 'Gi0/4')].accessVlan = 30;
    P[pid('B2', 'Gi0/4')].description = 'NAS-SAN';
    P[pid('B2', 'Gi0/4')].mtu = 9000;
    P[pid('B2', 'Gi0/5')].enabled = false;
    P[pid('B2', 'Gi0/5')].accessVlan = 40;
    P[pid('B2', 'Gi0/5')].description = 'CAM-3F';
    // Trunks: partial allowed lists + native mismatch on B2 side
    P[pid('B1', 'Gi0/23')].mode = 'trunk';
    P[pid('B1', 'Gi0/23')].allowedVlans = [20, 30, 99];
    P[pid('B1', 'Gi0/23')].nativeVlan = 99;
    P[pid('B1', 'Gi0/23')].description = 'Uplink CORE';
    P[pid('B1', 'Gi0/23')].speed = 100;
    P[pid('B1', 'Gi0/23')].duplex = 'half'; // ticket H8
    P[pid('CORE', 'Gi0/1')].mode = 'trunk';
    P[pid('CORE', 'Gi0/1')].allowedVlans = [20, 30, 99];
    P[pid('CORE', 'Gi0/1')].nativeVlan = 99;
    P[pid('CORE', 'Gi0/1')].description = 'ACCESS-B1';
    P[pid('B2', 'Gi0/23')].mode = 'trunk';
    P[pid('B2', 'Gi0/23')].allowedVlans = [20, 30, 99];
    P[pid('B2', 'Gi0/23')].nativeVlan = 1; // mismatch
    P[pid('B2', 'Gi0/23')].description = 'Uplink CORE';
    P[pid('B2', 'Gi0/23')].mtu = 9000;
    P[pid('CORE', 'Gi0/2')].mode = 'trunk';
    P[pid('CORE', 'Gi0/2')].allowedVlans = [20, 30, 99];
    P[pid('CORE', 'Gi0/2')].nativeVlan = 99;
    P[pid('CORE', 'Gi0/2')].description = 'ACCESS-B2';
    P[pid('CORE', 'Gi0/2')].mtu = 9000;
    P[pid('B1', 'Gi0/24')].mode = 'trunk';
    P[pid('B1', 'Gi0/24')].allowedVlans = [99];
    P[pid('B1', 'Gi0/24')].nativeVlan = 99;
    P[pid('B1', 'Gi0/24')].description = 'Crosslink B2';
    P[pid('B2', 'Gi0/24')].mode = 'trunk';
    P[pid('B2', 'Gi0/24')].allowedVlans = [99];
    P[pid('B2', 'Gi0/24')].nativeVlan = 99;
    P[pid('B2', 'Gi0/24')].description = 'Crosslink B1';
    // Crosslink left administratively down after the storm incident
    P[pid('B1', 'Gi0/24')].enabled = false;
    P[pid('B2', 'Gi0/24')].enabled = false;
    // Jumbo path seeded but CORE Gi0/3 was missed (ticket H6)
    P[pid('CORE', 'Gi0/3')].accessVlan = 30;
    P[pid('CORE', 'Gi0/3')].description = 'SRV-VMI';
    P[pid('CORE', 'Gi0/3')].mtu = 1500;
    env.ends['nas-san'].nicMtu = 9000;
    env.ends['srv-vmi'].nicMtu = 9000;
    // STP: B2 left with STP administratively off after the storm
    env.switches.B2.stpEnabled = false;
    // Priorities: someone tried to fix the root and made ACCESS-B1 the root
    env.switches.B1.priority = 24576;
    env.switches.B2.priority = 61440;
    env.switches.CORE.priority = 32768;
    env.switches.CORE.ipRouting = true;
    return env;
}
// ---------------------------------------------------------------------------
// Static reference content (manual / quiz / briefing)
// ---------------------------------------------------------------------------
const STP_VARIANTS = [
    { name: 'STP', std: '802.1D', conv: '30–50 s', note: 'Original. One instance, slow to converge. States: blocking → listening → learning → forwarding.' },
    { name: 'RSTP', std: '802.1w', conv: 'seconds', note: 'Rapid STP. States: discarding → learning → forwarding. Fast handshakes replace timers.' },
    { name: 'MSTP', std: '802.1s', conv: 'seconds', note: 'Multiple Spanning Tree. Groups VLANs into instances — one tree per group, scalable.' },
    { name: 'PVST+ / RPVST+', std: 'Cisco', conv: '30–50 s / seconds', note: 'Per-VLAN spanning tree — one instance per VLAN (Cisco proprietary).' },
];
const GLOSSARY = [
    { term: 'VLAN', def: 'Virtual LAN — a logical Layer-2 segment; each VLAN is its own broadcast domain.' },
    { term: 'Broadcast domain', def: 'The set of ports a broadcast frame reaches. Switches flood broadcasts inside a VLAN; routers/SVIs do not forward them.' },
    { term: '802.1Q tag', def: 'A 4-byte field inserted after the source MAC that marks a frame with its VLAN ID (and priority bits).' },
    { term: 'Trunk', def: 'A switch port that carries multiple VLANs by tagging frames (802.1Q).' },
    { term: 'Access port', def: 'A port serving one data VLAN, sending and receiving untagged frames.' },
    { term: 'Native VLAN', def: 'The one VLAN sent untagged on a trunk. Both ends must match; leaving it at VLAN 1 invites hopping abuse.' },
    { term: 'Voice VLAN', def: 'A second VLAN on an access port dedicated to IP-phone traffic (device learns it via LLDP/CDP or config).' },
    { term: 'InterVLAN routing', def: 'Routing between VLANs — done by a Layer-3 switch with SVIs or a router-on-a-stick.' },
    { term: 'SVI', def: 'Switched Virtual Interface — a virtual VLAN interface on a Layer-3 switch that acts as the gateway for that VLAN.' },
    { term: 'Spanning Tree Protocol', def: 'Protocol that blocks redundant Layer-2 paths to prevent loops while keeping a standby path.' },
    { term: 'Bridge ID', def: 'Priority + MAC address. The LOWEST bridge ID wins the root-bridge election.' },
    { term: 'BPDU', def: 'Bridge Protocol Data Unit — hello frames (every 2 s) switches exchange to run spanning tree.' },
    { term: 'Root port', def: 'On a non-root switch, the port with the best (lowest-cost) path to the root bridge.' },
    { term: 'Designated port', def: 'The forwarding port on each link segment, closest to the root.' },
    { term: 'Alternate port (blocked)', def: 'RSTP name for a redundant port deliberately left in discarding/blocking state.' },
    { term: 'PortFast', def: 'Edge-port optimization: skip listening/learning so a workstation comes up instantly.' },
    { term: 'BPDU Guard', def: 'Shuts down an edge port if it receives a BPDU — defends against rogue switches capturing the root.' },
    { term: 'MTU', def: 'Maximum transmission unit — largest IP payload a link carries. Standard Ethernet: 1500 bytes.' },
    { term: 'Jumbo frames', def: 'Frames up to ~9000 bytes (vendor max ≈ 9216). Used on SAN/iSCSI/backup networks; every hop must support them.' },
    { term: 'Duplex mismatch', def: 'One side full, the other half (usually a failed autonegotiation). Causes late collisions, CRC errors, terrible throughput.' },
    { term: 'PMTUD', def: 'Path MTU Discovery — endpoints learn the smallest MTU along the path via ICMP "Fragmentation needed" (Type 3, Code 4).' },
];

