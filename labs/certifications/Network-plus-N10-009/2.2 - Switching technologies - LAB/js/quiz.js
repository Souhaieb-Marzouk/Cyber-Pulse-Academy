// THE FABRIC BENCH — static port. ported 1:1 from src/lib/lab/quiz.ts (tsc es2020).
// Content, algorithms, wording and answers are identical to the original framework lab.
// Loaded as a classic <script>: top-level const/function become page-global in load order.

const QUIZ_MEDIUM = [
    {
        id: 'qm1',
        q: 'What does a VLAN primarily contain?',
        options: [
            'A collision domain',
            'A multicast filter',
            'A broadcast domain',
            'A routing domain',
        ],
        answer: 2,
        explain: 'Each VLAN is its own broadcast domain: switches flood broadcasts only within the VLAN. A collision domain ends at every switch port regardless of VLANs, a routing domain is a Layer-3 concept, and multicast filtering is a switch feature, not what a VLAN is.',
        focus: 'Manual → VLANs · “Why VLANs exist”',
    },
    {
        id: 'qm2',
        q: 'How large is the 802.1Q tag, and what does it carry?',
        options: [
            '4 bytes, carrying priority and VLAN ID',
            '8 bytes, carrying the destination MAC',
            '2 bytes, carrying a frame checksum',
            '12 bytes, carrying the source port',
        ],
        answer: 0,
        explain: 'The 802.1Q tag is 4 bytes inserted after the Source MAC: TPID (0x8100), 3 priority bits (PCP), 1 CFI bit, and a 12-bit VLAN ID (1–4094). The MAC address is not inside the tag, checksums live in the frame trailer, and source ports are never carried.',
        focus: 'Manual → VLANs · “Access ports, trunks & 802.1Q” + Frame detail in TESTS',
    },
    {
        id: 'qm3',
        q: 'Frames from the native VLAN cross a trunk…',
        options: [
            'tagged with VLAN 1',
            'encrypted with 802.1X',
            'dropped at the far end',
            'sent through untagged',
        ],
        answer: 3,
        explain: 'The native VLAN is sent untagged — that is its definition. Both trunk ends must agree on it, and leaving it at the default (VLAN 1) invites double-tag hopping abuse. It is not tagged with VLAN 1, 802.1X is port authentication (not encryption), and native frames are delivered, not dropped.',
        focus: 'Manual → VLANs · native VLAN paragraph',
    },
    {
        id: 'qm4',
        q: 'A Layer-2 loop without spanning tree causes…',
        options: [
            'Fragmented frames on every trunk',
            'Duplicate gateways on every VLAN',
            'A multiplying broadcast storm',
            'A rebooting root bridge',
        ],
        answer: 2,
        explain: 'Ethernet has no TTL: switches flood each broadcast out of every port, including back toward its origin, forever — frames multiply until every link saturates. Fragmentation is an MTU behavior, duplicate gateways are a routing misconfiguration, and the root bridge does not reboot — it is simply elected.',
        focus: 'Bench: SWITCH tab → storm drill (objective M10) + Manual → STP',
    },
    {
        id: 'qm5',
        q: 'Which pairing is correct?',
        options: [
            'RSTP = 802.1s, MSTP = 802.1w',
            'RSTP = 802.11n, MSTP = 802.1D',
            'RSTP = 802.1D, MSTP = 802.3af',
            'RSTP = 802.1w, MSTP = 802.1s',
        ],
        answer: 3,
        explain: 'Rapid STP is 802.1w (converges in seconds: discarding→learning→forwarding); Multiple STP is 802.1s (one instance per GROUP of VLANs). Classic STP is 802.1D with 30–50 s convergence, and 802.11n/802.3af are Wi-Fi and Power over Ethernet — not spanning tree at all.',
        focus: 'Manual → STP · “Variants” table',
    },
    {
        id: 'qm6',
        q: 'Jumbo frames are typically…',
        options: [
            '1500 bytes, on every LAN',
            '~9000 bytes, on storage paths',
            '64 bytes, for voice traffic',
            '9216 bytes, on trunk links only',
        ],
        answer: 1,
        explain: 'Jumbo frames (~9000 B payload, vendor maximum ≈ 9216) reduce per-frame overhead for storage traffic (SAN/iSCSI/backup) — but only if the ENTIRE path (NICs + switch ports) is configured; one 1500-MTU hop drops them and answers ICMP Type 3 Code 4. 1500 B is the standard MTU, 64 B is a minimum-size frame, and jumbo is about size, not trunking.',
        focus: 'Manual → MTU · jumbo frames (objective M12)',
    },
];
const QUIZ_HARD = [
    {
        id: 'qh1',
        q: 'show spanning-tree (excerpt):\nCORE-1  Priority 32768  MAC 0c14.8a3f.1101\nACCESS-B1  Priority 24576  MAC 0004.a1b2.c301\nACCESS-B2  Priority 61440  MAC 0c22.1133.4402\nWho is the root bridge?',
        options: ['CORE-1', 'Undecided — MAC conflict', 'ACCESS-B2', 'ACCESS-B1'],
        answer: 3,
        explain: 'Lowest bridge ID wins, priority first: 24576 < 32768 < 61440. ACCESS-B1 is root no matter its MAC — the tie-breaker never gets used here. An access switch as root is a topology design smell worth fixing by lowering the distribution switch.',
        focus: 'DIAG → STP view + objective H4 walkthrough',
    },
    {
        id: 'qh2',
        q: 'PCs in VLAN 20 reach each other; every ping from VLAN 20 to VLAN 30 times out. Same-floor and cross-floor, both VLANs are on the trunks. First thing to check?',
        options: [
            'Whether IP routing is on at the core',
            'Native VLAN settings on the trunks',
            'MTU settings on the server NIC',
            'Duplex on the access ports',
        ],
        answer: 0,
        explain: 'Same-VLAN success proves Layer 2 is healthy — trunking, natives and duplex are fine. Crossing VLANs requires a router: on a modern campus, the Layer-3 switch with one SVI per VLAN (or a router-on-a-stick). No routing = islands.',
        focus: 'Manual → VLANs · “Voice VLAN & interVLAN routing” (objective M7)',
    },
    {
        id: 'qh3',
        q: 'Syslog: "%SPANTREE-2-NATIVE_VLAN_MISMATCH: Gi0/23 (native 1) vs Gi0/2 (native 99)". What is the actual risk?',
        options: [
            'The trunk refuses to come up',
            'Untagged traffic lands in the wrong VLAN',
            'Jumbo frames are silently dropped',
            'The root bridge resets its priority',
        ],
        answer: 1,
        explain: 'A native mismatch does not break the trunk — that is the trap. Untagged frames (including ones an attacker sends) are filed under different VLANs on the two ends: silent leakage and a hopping foothold. MTU and priority are unrelated mechanisms, and trunks stay up through this.',
        focus: 'Manual → VLANs · native VLAN + objective H2',
    },
    {
        id: 'qh4',
        q: 'An oversized ping (8972 B) from the NAS dies with "ICMP Type 3 Code 4, next-hop MTU 1500 at CORE Gi0/3". What does this tell you?',
        options: [
            'The VLAN tag was stripped at that port',
            'STP is blocking that port right now',
            'That hop is 1500 and dropped the frame',
            'The NIC settled on half duplex',
        ],
        answer: 2,
        explain: 'Type 3 Code 4 is "Destination unreachable — fragmentation needed". It names the first too-small hop: CORE Gi0/3 has MTU 1500, so the jumbo path is broken there. Tag stripping, STP blocking and duplex are different failure modes with different symptoms.',
        focus: 'Manual → MTU · PMTUD + objective H6',
    },
    {
        id: 'qh5',
        q: 'Where do PortFast + BPDU Guard belong?',
        options: [
            'On trunks between switches',
            'On edge ports facing end systems',
            'Only on the root bridge ports',
            'On camera and phone ports only',
        ],
        answer: 1,
        explain: 'PortFast skips listening/learning for honest edge devices; BPDU Guard err-disables the edge port if a BPDU appears (rogue switch). They go on EVERY end-system-facing port — not just cameras/phones — and never on trunks, where both features would break loop prevention.',
        focus: 'Manual → STP · “Edge protections” (objectives M11/H7)',
    },
    {
        id: 'qh6',
        q: 'During a move, a tech patches two access switches together "temporarily" while STP is disabled for maintenance. Ten seconds later the NOC phone rings. What happened?',
        options: [
            'The link negotiated 10 Mbps half duplex',
            'The native VLAN fell back to VLAN 1',
            'The trunk allowed list reset itself',
            'A Layer-2 loop formed with no STP',
        ],
        answer: 3,
        explain: 'A second parallel path + no STP = loop. Broadcasts circulate and multiply (no TTL in Ethernet) until every link saturates — the storm IS the phone call. Negotiation, native VLAN and allowed lists do not change by patching a cable.',
        focus: 'Bench: SWITCH tab → storm drill + objective H5',
    },
    {
        id: 'qh7',
        q: 'Which control set actually mitigates VLAN-hopping / rogue-root play?',
        options: [
            'Native off 1, BPDU Guard, spares shut',
            'Jumbo frames, IP routing, descriptions',
            'Autonegotiation off on every port',
            'RSTP plus MSTP plus PVST+ together',
        ],
        answer: 0,
        explain: 'Double-tagging abuses the native VLAN; rogue-root needs to inject BPDUs; attackers need a live port — the trio closes all three doors. The other sets tune performance or add features (MTU, routing, descriptions, negotiation, STP flavor) without touching the hopping attack surface.',
        focus: 'Debrief → “Mitigation recommendations” + objective H7',
    },
];
const QUIZ = {
    medium: QUIZ_MEDIUM,
    hard: QUIZ_HARD,
};

