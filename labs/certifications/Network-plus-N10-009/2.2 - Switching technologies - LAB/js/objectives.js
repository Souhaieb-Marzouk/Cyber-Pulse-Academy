// THE FABRIC BENCH — static port. ported 1:1 from src/lib/lab/objectives.ts (tsc es2020).
// Content, algorithms, wording and answers are identical to the original framework lab.
// Loaded as a classic <script>: top-level const/function become page-global in load order.

// ============================================================================
// THE FABRIC BENCH — mastery blueprint (objectives + validation rules)
// Medium: 12 guided objectives (OBJ-M1..M12) · Hard: 9 broad challenges (OBJ-H1..H9)
// Every check is machine-evaluated against the simulated environment (F2).
// ============================================================================


// ---------------------------------------------------------------------------
// answer helpers
// ---------------------------------------------------------------------------
const norm = (s) => s.trim().toLowerCase().replace(/\s+/g, ' ');
const num = (a) => (typeof a === 'string' ? parseFloat(a.trim()) : NaN);
const str = (a) => (typeof a === 'string' ? a.trim() : '');
const multi = (a) => (Array.isArray(a) ? a : []);
const picks = (a, expected) => {
    const m = multi(a);
    return m.length === expected.length && expected.every(e => m.includes(e));
};
const P = (env, id) => env.ports[id];
// environment helpers ---------------------------------------------------------
function vlanDbOk(env) {
    const missing = [];
    for (const v of DESIGN.vlans) {
        const found = env.vlans.find(x => x.id === v.id);
        if (!found)
            missing.push(`VLAN ${v.id} (${v.name}) missing from the database`);
        else if (norm(found.name) !== norm(v.name))
            missing.push(`VLAN ${v.id} is named "${found.name}" — work order says "${v.name}"`);
    }
    return missing;
}
function accessOk(env) {
    const bad = [];
    for (const row of DESIGN.access) {
        const end = env.ends[row.end];
        const p = P(env, end.portId);
        if (!p.enabled)
            bad.push(`${p.switchId} ${p.name} (${end.name}) is shut down`);
        else if (p.mode !== 'access')
            bad.push(`${p.switchId} ${p.name} (${end.name}) is not in access mode`);
        else if (p.accessVlan !== row.vlan)
            bad.push(`${p.switchId} ${p.name} (${end.name}) carries VLAN ${p.accessVlan}, work order says ${row.vlan}`);
    }
    return bad;
}
function trunkIssues(env, portIds, opts) {
    const bad = [];
    for (const id of portIds) {
        const p = P(env, id);
        if (!p.enabled) {
            bad.push(`${p.switchId} ${p.name} is shut down`);
            continue;
        }
        if (p.mode !== 'trunk') {
            bad.push(`${p.switchId} ${p.name} is in ${p.mode} mode — trunks carry all VLANs on one link`);
            continue;
        }
        const allowed = [...p.allowedVlans].sort((a, b) => a - b);
        if (opts.exactAllowed) {
            if (JSON.stringify(allowed) !== JSON.stringify([...TRUNK_ALLOWED_SPEC])) {
                const miss = TRUNK_ALLOWED_SPEC.filter(v => !p.allowedVlans.includes(v));
                const extra = p.allowedVlans.filter(v => !TRUNK_ALLOWED_SPEC.includes(v));
                bad.push(`${p.switchId} ${p.name} allowed list ${miss.length ? `missing ${miss.join(', ')}` : ''}${miss.length && extra.length ? ' / ' : ''}${extra.length ? `has unwanted ${extra.join(', ')}` : ''}`);
            }
        }
        else if (opts.needVlans) {
            const miss = opts.needVlans.filter(v => !p.allowedVlans.includes(v));
            if (miss.length)
                bad.push(`${p.switchId} ${p.name} allowed list missing ${miss.join(', ')}`);
        }
    }
    return bad;
}
function nativeMismatches(env) {
    const out = [];
    for (const l of env.links) {
        const a = P(env, l.a), b = P(env, l.b);
        if (a.enabled && b.enabled && a.mode === 'trunk' && b.mode === 'trunk' && a.nativeVlan !== b.nativeVlan) {
            out.push(`Native VLAN mismatch: ${a.switchId} ${a.name}=${a.nativeVlan} vs ${b.switchId} ${b.name}=${b.nativeVlan}`);
        }
    }
    return out;
}
function edgeGaps(env, want) {
    const bad = [];
    for (const id of EDGE_PORT_IDS) {
        const p = P(env, id);
        if (!p.enabled) {
            bad.push(`${p.switchId} ${p.name} is shut down`);
            continue;
        }
        if (want.portfast && !p.portfast)
            bad.push(`${p.switchId} ${p.name} missing PortFast`);
        if (want.bpduguard && !p.bpduguard)
            bad.push(`${p.switchId} ${p.name} missing BPDU Guard`);
    }
    if (want.shutUnused)
        for (const id of UNUSED_PORT_IDS)
            if (P(env, id).enabled)
                bad.push(`${P(env, id).switchId} ${P(env, id).name} is an unused port still enabled`);
    return bad;
}
function jumboScope(env) {
    const broken = [];
    const overscope = [];
    for (const id of DESIGN.jumboElements) {
        if (id === 'nas-san' || id === 'srv-vmi') {
            if (env.ends[id].nicMtu !== 9000)
                broken.push(`${env.ends[id].name} NIC MTU ${env.ends[id].nicMtu}`);
            continue;
        }
        const p = P(env, id);
        if (p.mtu !== 9000)
            broken.push(`${p.switchId} ${p.name} MTU ${p.mtu}`);
    }
    for (const p of Object.values(env.ports)) {
        if (p.mtu === 9000 && !DESIGN.jumboElements.includes(p.id))
            overscope.push(`${p.switchId} ${p.name}`);
    }
    for (const e of Object.values(env.ends)) {
        if (e.nicMtu === 9000 && !DESIGN.jumboElements.includes(e.id))
            overscope.push(`${e.name} NIC`);
    }
    return { ok: broken.length === 0, broken, overscope };
}
const stpRoot = (env) => computeStp(env).root;
const receiversFrom = (env, src) => flood(env, src).receivers.length;
const ok = (feedback) => ({ pass: true, feedback });
const no = (feedback, nearMiss) => ({ pass: false, feedback, nearMiss });
// ---------------------------------------------------------------------------
// MEDIUM — 12 guided objectives
// ---------------------------------------------------------------------------
const MEDIUM_OBJECTIVES = [
    {
        id: 'M1', pillar: 'P1', anchor: 'V1 · broadcast domains',
        title: 'Prove the flat-network problem',
        brief: 'Right now every port on all three switches sits in VLAN 1 — one giant broadcast domain. Use the TESTS tab: run a Broadcast flood from PC-STAFF1 and watch the fabric light up.',
        inputs: [
            { key: 'count', kind: 'number', label: 'How many OTHER devices received the broadcast?', placeholder: 'count the receivers in the result card' },
            {
                key: 'why', kind: 'choice', label: 'Why do VLANs fix this?',
                options: [
                    { value: 'a', label: 'VLANs encrypt frames between switches' },
                    { value: 'b', label: 'Each VLAN is its own broadcast domain' },
                    { value: 'c', label: 'VLANs raise MTU so fewer frames are sent' },
                ],
            },
        ],
        hints: [
            'Open the TESTS tab, pick PC-STAFF1 as source, choose "Broadcast flood", press Run — the result card lists every receiver.',
            'The camera port ships disabled, so it cannot receive. Count every other end system on all three switches.',
            'It is 8 — every device except PC-STAFF1 itself and the powered-down camera. That is what one broadcast domain means.',
        ],
        check: ({ env, answers }) => {
            const actual = receiversFrom(env, 'pc-staff1');
            const c = num(answers.count);
            if (c !== actual)
                return no(`Your count (${isNaN(c) ? '—' : c}) does not match the fabric. Re-run the flood: the result card lists ${actual} receivers right now.`, 'Count the "received by" list in the result card, not the switch LEDs.');
            if (answers.why !== 'b')
                return no('The count is right, but VLANs are not about encryption or frame size. Each VLAN is a separate broadcast domain — that is the entire point.');
            return ok('Before segmentation, one broadcast from a front-desk PC tickles all 8 other hosts — including the SAN. VLANs partition this: students, staff, servers, cameras each get their own domain. Next, a defender builds the VLAN database (that is your next task).');
        },
    },
    {
        id: 'M2', pillar: 'P1', anchor: 'V4 · 802.1Q · V5 native · S4 convergence',
        title: 'Read a frame on the wire',
        brief: 'Before we trunk anything, look at what crosses a switch-to-switch link today. In TESTS, ping PC-STAFF1 → PC-LAB1, open the Frame detail, and study the tagging row. Then answer from what you saw plus the manual.',
        inputs: [
            { key: 'tagBytes', kind: 'number', label: 'An 802.1Q tag adds how many bytes after the Source MAC field?', placeholder: 'bytes' },
            {
                key: 'native', kind: 'choice', label: 'Frames from a trunk\'s NATIVE VLAN cross the link…',
                options: [
                    { value: 'a', label: 'tagged with VLAN ID 1 like all the rest' },
                    { value: 'b', label: 'dropped — they never cross a trunk' },
                    { value: 'c', label: 'untagged — the trunk\'s one unmarked lane' },
                ],
            },
            {
                key: 'rstp', kind: 'choice', label: 'Which standard converges in seconds instead of 30–50 s?',
                options: [
                    { value: 'a', label: '802.1w — Rapid STP' },
                    { value: 'b', label: '802.1D — classic STP' },
                    { value: 'c', label: '802.3af — Power over Ethernet' },
                ],
            },
        ],
        hints: [
            'Run any cross-switch ping and press "Frame detail" in the result card — it shows the tagging row.',
            'The tag sits between Source MAC and the payload; the manual\'s Spanning Tree table lists the standards and their convergence times.',
            '4 bytes; native VLAN frames cross untagged; 802.1w (RSTP) is the fast one. Today the frame shows "no tag" because every port is still VLAN 1 access.',
        ],
        check: ({ answers }) => {
            if (num(answers.tagBytes) !== 4)
                return no('The 802.1Q tag is 4 bytes (TPID 0x8100 + priority/CFI + 12-bit VLAN ID), inserted right after the Source MAC. Check the Frame detail row again.');
            if (answers.native !== 'c')
                return no('The native VLAN is the ONE VLAN that crosses a trunk untagged — an attacker’s opening for double-tag hopping, which is why we will move it off VLAN 1.');
            if (answers.rstp !== 'a')
                return no('802.3af is Power over Ethernet! The fast converging standard is 802.1w — Rapid STP: discarding/learning/forwarding with sub-second handshakes.');
            return ok('You can now read the wire: untagged on access links and native VLAN, 4-byte 802.1Q tag everywhere else on a trunk. RSTP (802.1w) cuts convergence from up to 50 s of listening/learning timers to seconds. Next: build the VLANs so tags have something meaningful to say.');
        },
    },
    {
        id: 'M3', pillar: 'P2', anchor: 'V2 · V3 · I3 · I4',
        title: 'Build the VLAN database & wire the edges',
        brief: 'Execute the work-order table: create VLANs 10/20/30/40/99/150 with the exact names, put every end-system port in access mode with its VLAN, enable the shipped-disabled camera port, and describe each edge port (the "Fill descriptions" button applies them all).',
        inputs: [],
        hints: [
            'The PORTS tab lists each switch\'s ports; the SWITCH tab holds the VLAN database editor.',
            'CAM-3F\'s port (B2 Gi0/5) arrived disabled — flip it on, then set access VLAN 40.',
            'Full receipt: VLANs 10 STUDENTS, 20 STAFF, 30 SERVERS, 40 CAMERAS, 99 MGMT, 150 VOICE; PC/phone/printer/NAS/camera/server ports in the listed VLANs; camera port up; all 10 edge ports described.',
        ],
        check: ({ env }) => {
            const db = vlanDbOk(env);
            if (db.length)
                return no(`The VLAN database is incomplete: ${db[0]}.`);
            const acc = accessOk(env);
            if (acc.length)
                return no(`Access-port assignments are off: ${acc[0]}${acc.length > 1 ? ` (+${acc.length - 1} more)` : ''}`);
            const undescribed = EDGE_PORT_IDS.map(id => P(env, id)).filter(p => !p.description.trim());
            if (undescribed.length)
                return no(`Document your work: ${undescribed.length} edge ports have no description (e.g. ${undescribed[0].switchId} ${undescribed[0].name}). The "Fill descriptions" button in the port editor applies them all.`, 'A port without a description is a port the next tech will misread at 2 a.m.');
            return ok('VLAN database live, every edge port segmented and documented, camera powered up. Nothing is reachable across switches yet — the switch-to-switch links still carry only VLAN 1. That is exactly why trunks exist: next task.');
        },
    },
    {
        id: 'M4', pillar: 'P2', anchor: 'V4 · V5 · trunking',
        title: 'Trunk the building',
        brief: 'Convert all six switch-to-switch ports (both uplink pairs + the B1↔B2 crosslink) to 802.1Q trunks: allowed VLANs 10,20,30,40,99,150 and native VLAN 99 on BOTH ends of every link. Then answer the native-VLAN question.',
        inputs: [
            { key: 'defNative', kind: 'number', label: 'Vendor-style default native VLAN (the one we are moving away from)?', placeholder: 'VLAN ID' },
        ],
        hints: [
            'Select each switch in PORTS; uplink ports are Gi0/23/Gi0/24 (access switches) and Gi0/1/Gi0/2 (core). Crosslink = Gi0/24 on B1 and B2.',
            'Set mode Trunk, tick all six allowed VLANs, set Native VLAN 99 — repeat on BOTH ends of all three links (6 ports total).',
            'The vendor-style default native VLAN is 1 — the reason VLAN-hopping folklore starts with "change your native VLAN".',
        ],
        check: ({ env, answers }) => {
            if (num(answers.defNative) !== 1)
                return no('Vendor-style default native VLAN is 1. We move trunks to 99 so untagged frames have nowhere interesting to land.');
            const off = trunkIssues(env, ALL_TRUNK_PORTS, { exactAllowed: true });
            if (off.length)
                return no(`Trunks are not to spec: ${off[0]}${off.length > 1 ? ` (+${off.length - 1} more)` : ''}`, 'Both ends of each link need: mode trunk · allowed {10,20,30,40,99,150} · native 99.');
            const mm = nativeMismatches(env);
            if (mm.length)
                return no(`Ends disagree: ${mm[0]} — a native mismatch makes untagged frames switch into the wrong VLAN.`);
            return ok('One cable per pair now carries six VLANs, each frame labeled with a 4-byte 802.1Q tag (watch a ping in Frame detail now — it is tagged). Native VLAN 99 keeps untagged traffic out of user space. Next: the phone shares its jack with a PC — voice VLAN time.');
        },
    },
    {
        id: 'M5', pillar: 'P2', anchor: 'V6 · voice VLAN',
        title: 'Give the phone its own lane',
        brief: 'PHONE-STAFF1 hangs off B1 Gi0/3 together with a PC. Configure that port for data VLAN 20 AND voice VLAN 150 so voice traffic rides its own broadcast domain.',
        inputs: [
            {
                key: 'how', kind: 'choice', label: 'How does one access port serve a phone and a PC?',
                options: [
                    { value: 'a', label: 'The port must become a mini-trunk' },
                    { value: 'b', label: 'One data VLAN plus a voice VLAN' },
                    { value: 'c', label: 'Both devices share VLAN 1' },
                ],
            },
        ],
        hints: [
            'Port B1 Gi0/3 — the Voice VLAN dropdown appears on access-mode ports.',
            'Keep Access VLAN 20 (the PC), add Voice VLAN 150 (the phone).',
            'Access ports can carry exactly one data VLAN plus an optional auxiliary voice VLAN — no trunking needed.',
        ],
        check: ({ env, answers }) => {
            const p = P(env, 'B1|Gi0/3');
            if (answers.how !== 'b')
                return no('An access port never becomes a trunk for this: it carries ONE data VLAN plus an optional voice (auxiliary) VLAN — the phone tags its own frames with 150.');
            if (p.mode !== 'access' || p.accessVlan !== 20)
                return no('B1 Gi0/3 must stay an access port in data VLAN 20 — the PC behind the phone depends on it.');
            if (p.voiceVlan !== 150)
                return no('Set the port\'s Voice VLAN to 150 so the phone\'s tagged frames land in the VOICE VLAN.');
            return ok('One cable, two broadcast domains: the PC sits untagged in STAFF (20), the phone tags itself into VOICE (150). Voice gets its own domain, its own addressing, and its own trouble domain. Next: prove the isolation you have built.');
        },
    },
    {
        id: 'M6', pillar: 'P2', anchor: 'V1 · isolation proof',
        title: 'Prove the isolation',
        brief: 'Re-run the exact experiment from task 1: Broadcast flood from PC-STAFF1. Compare with what you saw on the flat network and answer.',
        inputs: [
            { key: 'count', kind: 'number', label: 'How many OTHER devices receive it now?', placeholder: 'count the receivers' },
            {
                key: 'who', kind: 'choice', label: 'Which group is now OUTSIDE PC-STAFF1\'s broadcast?',
                options: [
                    { value: 'a', label: 'PC-STAFF2 and PRN-LIB' },
                    { value: 'b', label: 'Nobody — all hosts still hear it' },
                    { value: 'c', label: 'The lab PCs, NAS and camera' },
                ],
            },
        ],
        hints: [
            'TESTS tab → source PC-STAFF1 → Broadcast flood → Run.',
            'Compare "received by" with task 1: same VLAN 20 only — and the trunk must actually carry VLAN 20.',
            'Only VLAN-20 members hear it: PC-STAFF2, PHONE-STAFF1 (data side) and PRN-LIB — 3 receivers.',
        ],
        check: ({ env, answers }) => {
            const f = flood(env, 'pc-staff1');
            if (f.storm)
                return no('The fabric is storming — restore STP (SWITCH tab) before measuring anything.');
            const c = num(answers.count);
            if (c !== f.receivers.length) {
                return no(`Your count (${isNaN(c) ? '—' : c}) ≠ the fabric (${f.receivers.length}). ${f.receivers.length < 3 ? 'Is VLAN 20 actually allowed on the trunks? Check the missed list in the result card.' : 'Too many receivers — is every port really in its work-order VLAN?'}`);
            }
            if (answers.who !== 'c')
                return no('Look at the missed list: the lab PCs, NAS and camera are in VLANs 10/30/40 — they no longer hear staff broadcasts at all.');
            return ok('From 8 receivers to 3: VLAN 20\'s broadcast domain now ends where its ports end. The same flood from PC-LAB1 would only touch the lab. Segmentation proven on your own fabric. Next: making VLANs talk — safely, through a router.');
        },
    },
    {
        id: 'M7', pillar: 'P2', anchor: 'V7 · interVLAN routing',
        title: 'Connect the islands — with a router',
        brief: 'Ping PC-STAFF1 → SRV-VMI (VLAN 20 → VLAN 30). It should fail: Layer 2 never crosses VLANs. Then enable IP routing on CORE-1 (its SVIs become each VLAN\'s gateway) and ping again.',
        inputs: [
            {
                key: 'who', kind: 'choice', label: 'Which device routes between VLANs?',
                options: [
                    { value: 'a', label: 'The Layer-3 switch, via SVIs' },
                    { value: 'b', label: 'ACCESS-B1, in hardware' },
                    { value: 'c', label: 'None — VLANs route themselves' },
                ],
            },
        ],
        hints: [
            'Run the ping first and read the failure reason — it names the missing piece.',
            'SWITCH tab → CORE-1 → "IP routing (interVLAN)" switch.',
            'A Layer-3 switch routes between VLANs via SVIs; an access switch has no routing brain at all.',
        ],
        check: ({ env, answers }) => {
            if (answers.who !== 'a')
                return no('InterVLAN routing is router work: in a modern campus the Layer-3 switch (CORE-1) does it with one SVI per VLAN. Access switches only switch.');
            if (!env.switches.CORE.ipRouting)
                return no('Enable IP routing on CORE-1 — without it, each VLAN is an island with no gateway.');
            const r = ping(env, 'pc-staff1', 'srv-vmi', 64);
            if (!r.ok)
                return no(`The staff→server ping still fails: ${r.reason ?? 'unknown'} — fix the path, then re-check.`);
            return ok(`Routed! The frame left PC-STAFF1, was switched in VLAN 20 up to CORE-1, routed by the VLAN-20 SVI into VLAN 30, and delivered. The classic alternative is a "router-on-a-stick" — one router interface trunked to the switch. Next: the fabric has a chronic disease for you to hunt.`);
        },
    },
    {
        id: 'M8', pillar: 'P3', anchor: 'I1 · I2 · duplex mismatch',
        title: 'Hunt the duplex mismatch',
        brief: 'PRN-LIB prints at a crawl and DIAG shows something ugly climbing on exactly one port. Find the sick link, read its negotiated values, fix the negotiation on BOTH sides (NIC + switch port), and confirm the counters freeze.',
        inputs: [
            {
                key: 'sig', kind: 'choice', label: 'Which signature betrayed the mismatch?',
                options: [
                    { value: 'a', label: 'A native-VLAN mismatch syslog' },
                    { value: 'b', label: 'Late collisions and CRC errors climbing' },
                    { value: 'c', label: 'ICMP fragmentation-needed messages' },
                ],
            },
        ],
        hints: [
            'DIAG tab: compare "negotiated" speed/duplex on every link — one link disagrees with itself.',
            'The printer NIC is forced 100/full; its switch port auto-negotiated to 100/HALF — classic mismatch.',
            'Fix: set BOTH sides to the same honest setting (both auto → 1000/full, or both 100/full). Watch the counters stop.',
        ],
        check: ({ env, answers }) => {
            if (answers.sig !== 'b')
                return no('The tell-tale of a duplex mismatch is late collisions and CRC/input errors on the half side — VLAN syslogs and ICMP fragmentation are entirely different diseases.');
            const p = P(env, 'B1|Gi0/4');
            const neg = portNeg(env, 'B1|Gi0/4');
            if (neg.down)
                return no('The link is DOWN now — forcing different speeds on the two ends kills it. Bring both ends to the same speed.');
            if (neg.mismatch)
                return no(`Still mismatched: switch side negotiated ${neg.speed}/${neg.duplex}. A mismatch cures only when BOTH ends agree — set both to auto/auto or both to the same forced speed+duplex.`);
            const end = env.ends['prn-lib'];
            const c = env.counters['B1|Gi0/4'];
            return ok(`Clean: both sides now ${neg.speed}/${neg.duplex} and B1 Gi0/4\'s late-collision counter has frozen at ${c.late}. Root cause: printer NIC forced 100/full, switch on auto → switch settled 100/half. Lesson: when in doubt, auto on both ends — or force BOTH ends deliberately. Next: the fabric\'s silent guardian.`);
        },
    },
    {
        id: 'M9', pillar: 'P3', anchor: 'S2 · S7 · root election',
        title: 'Elect the right root bridge',
        brief: 'Open the STP view (DIAG tab). With all bridges at the default priority 32768, the election is decided by the lowest bridge ID — and the winner may surprise you. Record who is root today, learn the rule, then set CORE-1\'s priority so the distribution switch wins, as the work order demands.',
        inputs: [
            { key: 'before', kind: 'text', label: 'Which switch is root BEFORE you change anything?', placeholder: 'hostname' },
            {
                key: 'rule', kind: 'choice', label: 'The election rule is…',
                options: [
                    { value: 'a', label: 'Highest IP address wins' },
                    { value: 'b', label: 'The fastest switch wins' },
                    { value: 'c', label: 'Lowest bridge ID wins' },
                ],
            },
        ],
        hints: [
            'DIAG → STP view: each switch shows priority + MAC. Bridge ID = priority + MAC; lowest wins.',
            'ACCESS-B1 carries the lowest MAC (0004.a1b2.c301) — with equal priorities it wins. Set CORE-1 priority to 4096.',
            'Before: ACCESS-B1. After CORE-1 sits at 4096 it beats every 32768 bridge regardless of MAC.',
        ],
        check: ({ env, answers }) => {
            const b = norm(str(answers.before));
            if (!['b1', 'access-b1', 'access b1'].includes(b))
                return no('Before your change, every priority was 32768 — so the lowest MAC decided. Check the STP view: ACCESS-B1 (0004.a1b2.c301) wore the crown.', 'Tie on priority → the lowest MAC wins. Which switch has the smallest MAC?');
            if (answers.rule !== 'c')
                return no('IPs and CPUs play no role: the root is the bridge with the LOWEST bridge ID — priority first, MAC as tie-breaker.');
            if (env.switches.CORE.priority > 4096)
                return no(`CORE-1 still sits at priority ${env.switches.CORE.priority}. Lower it to 4096 (work order) so it beats every default bridge.`);
            const root = stpRoot(env);
            if (root !== 'CORE')
                return no(`The fabric still bows to ${root === null ? 'nobody (storm!)' : env.switches[root].hostname}. Did you lower CORE-1's priority?`);
            return ok('CORE-1 is root: exactly where a distribution switch belongs. An access switch as root is not just embarrassing — it drags the blocked port onto the wrong link and lengthens every path. Note how the block moved when the crown moved. Next: find the standby link STP keeps dark.');
        },
    },
    {
        id: 'M10', pillar: 'P3', anchor: 'S1 · S3 · S4 · S5 · storm drill',
        title: 'Read the blocked port — then unleash the storm',
        brief: 'With CORE-1 as root, one redundant link is held in blocking state. Find it. Then run the STORM DRILL (SWITCH tab → Maintenance): bypass STP on CORE-1 for a moment, watch the triangle melt, re-enable, and watch RSTP re-block. Answer from what you saw.',
        inputs: [
            {
                key: 'blocked', kind: 'choice', label: 'Which port is BLOCKED while CORE-1 is root?',
                options: [
                    { value: 'a', label: 'B2 Gi0/24 — crosslink port on ACCESS-B2' },
                    { value: 'b', label: 'B1 Gi0/24 — crosslink port on ACCESS-B1' },
                    { value: 'c', label: 'CORE Gi0/1 — the uplink to B1' },
                ],
            },
            {
                key: 'cause', kind: 'choice', label: 'What made the storm during the drill?',
                options: [
                    { value: 'a', label: 'Too many VLANs for switch memory' },
                    { value: 'b', label: 'A Layer-2 loop with no loop prevention' },
                    { value: 'c', label: 'Jumbo frames overflowing the buffers' },
                ],
            },
            {
                key: 'mstp', kind: 'choice', label: 'A campus wants one tree per GROUP of VLANs, load-balanced. Which variant?',
                options: [
                    { value: 'a', label: 'PortFast on all edge ports' },
                    { value: 'b', label: '802.1D with longer timers' },
                    { value: 'c', label: 'MSTP — 802.1s instances' },
                ],
            },
        ],
        hints: [
            'DIAG → STP view lists every switch-to-switch port with its role: root / designated / alternate (blocked).',
            'Run the drill: SWITCH tab → CORE-1 → STP bypass OFF, watch the storm meter, switch it back ON.',
            'B2\'s crosslink port blocks (B1 has the lower bridge ID on that segment). Storms = loops without STP. MSTP groups VLANs into instances.',
        ],
        check: ({ env, answers, flags }) => {
            if (!env.switches.CORE.stpEnabled)
                return no('STP is still bypassed on CORE-1 — re-enable it, the fabric is one loop away from meltdown.');
            if (!env.switches.B1.stpEnabled || !env.switches.B2.stpEnabled)
                return no('Every switch must run STP again — one bypassed bridge un-protects the whole triangle.');
            if (!flags.stormDrillRan)
                return no('You have not run the storm drill — SWITCH tab → CORE-1 → turn spanning tree OFF, watch the storm, then restore it. Feel the storm once; you will never forget it.', 'The drill flag only sets if the storm actually ramped (meter > 60) and you recovered.');
            if (answers.blocked !== 'a')
                return no('Follow the STP view: B1 and B2 reach CORE-1 via their uplinks (root ports); on the B1–B2 crosslink, B1 wins designated (lower bridge ID), so B2 Gi0/24 sits in blocking/alternate.');
            if (answers.cause !== 'b')
                return no('A broadcast storm is a Layer-2 loop: switches flood each broadcast out every port, including back where it came from — forever, multiplying. Only loop prevention (STP/RSTP) breaks the cycle.');
            if (answers.mstp !== 'c')
                return no('MSTP (802.1s) maps many VLANs into a few instances — one tree per group. PortFast is an edge feature, not a variant.');
            return ok('You have now SEEN why spanning tree exists: the storm you ignited is what a single unplugged patch cable can do to a real building. RSTP re-converged in seconds (802.1D would sit 30–50 s in listening/learning). Next: harden the edge so nobody can do this to you on purpose.');
        },
    },
    {
        id: 'M11', pillar: 'P4', anchor: 'S6 · V8 · edge hardening',
        title: 'Harden the edge',
        brief: 'Any socket in the wall is an invitation: plug in a switch, advertise the lowest bridge ID, own the campus. Close that door: enable PortFast + BPDU Guard on every end-system port (all 10, including the camera and servers).',
        inputs: [
            {
                key: 'bpdu', kind: 'choice', label: 'What does BPDU Guard actually prevent?',
                options: [
                    { value: 'a', label: 'A rogue switch capturing the root bridge' },
                    { value: 'b', label: 'Storms caused by jumbo frames' },
                    { value: 'c', label: 'Tags stripped on access ports' },
                ],
            },
        ],
        hints: [
            'PORTS tab: the two edge toggles sit in every port card. All 10 edge ports, not the uplinks.',
            'Edge ports = every port facing an end system (PCs, phone, printer, labs, NAS, camera, SRV-VMI) — never the switch-to-switch trunks.',
            'PortFast = instant-up edge; BPDU Guard = err-disable that edge if anyone injects a BPDU. Together: fast AND defended.',
        ],
        check: ({ env, answers }) => {
            if (answers.bpdu !== 'a')
                return no('BPDU Guard err-disables an edge port the moment it sees a BPDU — exactly what a rogue switch must send to win the root election and start seeing your traffic (a man-in-the-middle setup).');
            const gaps = edgeGaps(env, { portfast: true, bpduguard: true });
            if (gaps.length)
                return no(`Edge protection incomplete: ${gaps[0]}${gaps.length > 1 ? ` (+${gaps.length - 1} more)` : ''}`, 'All ten end-system ports need BOTH toggles; uplinks keep listening for real BPDUs.');
            return ok('Every wall socket is now a tripwire: instant-up for honest devices, err-disable for anyone advertising a bridge. This is the cheapest defense against root-capture man-in-the-middle play (the same family of abuse MITRE catalogs as T1557, simplified). Finish with the frame-size frontier.');
        },
    },
    {
        id: 'M12', pillar: 'P4', anchor: 'M1 · M2 · J1–J4 · jumbo end-to-end',
        title: 'Roll out jumbo frames — end to end',
        brief: 'The NAS→SRV-VMI backup path deserves 9000-byte frames. Set MTU 9000 on BOTH NICs and all four switch ports of that path, prove it with an Oversized ping (8972 B), then deliberately break ONE hop (CORE Gi0/3 → 1500), re-test to meet ICMP Type 3 Code 4, and restore.',
        inputs: [
            { key: 'mtu', kind: 'number', label: 'Standard Ethernet MTU (the default we keep everywhere else)?', placeholder: 'bytes' },
            {
                key: 'e2e', kind: 'choice', label: 'Why must jumbo frames be configured on EVERY hop?',
                options: [
                    { value: 'a', label: 'VLAN tags enlarge frames on trunks' },
                    { value: 'b', label: 'A 1500 hop drops them — ICMP 3/4' },
                    { value: 'c', label: 'STP blocks paths with mixed MTUs' },
                ],
            },
        ],
        hints: [
            'Path: NAS NIC · B2 Gi0/4 · B2 Gi0/23 · CORE Gi0/2 · CORE Gi0/3 · SRV NIC — all six to 9000.',
            'Oversized ping lives in TESTS (source NAS-SAN). To meet the ICMP message, set CORE Gi0/3 back to 1500, run it, then restore 9000 and pass again.',
            'Standard MTU is 1500 bytes. Jumbo only works if every NIC and every port on the path agrees.',
        ],
        check: ({ env, answers, flags }) => {
            if (num(answers.mtu) !== 1500)
                return no('Standard Ethernet MTU is 1500 bytes — jumbo frames raise it (typically to 9000) only where the whole path allows.');
            if (answers.e2e !== 'b')
                return no('MTU is a per-hop contract: the first 1500-byte hop on the path drops the oversized frame and answers ICMP "Fragmentation needed" (Type 3, Code 4) — exactly what you triggered.');
            if (!flags.fragObserved)
                return no('You have not witnessed the failure mode: set ONE path hop (CORE Gi0/3) to 1500, run the oversized ping, read the ICMP Type 3 Code 4 result, then restore it.', 'The check needs proof you saw ICMP 3/4 — it is logged the moment an oversized ping dies at a small hop.');
            const j = jumboScope(env);
            if (j.broken.length)
                return no(`The jumbo path is incomplete: ${j.broken[0]}${j.broken.length > 1 ? ` (+${j.broken.length - 1} more)` : ''} — every element of the path must be 9000.`, 'NAS NIC · B2 Gi0/4 · B2 Gi0/23 · CORE Gi0/2 · CORE Gi0/3 · SRV NIC.');
            if (!flags.jumboTestPassed)
                return no('Prove it: run the Oversized ping (8972 B) from NAS-SAN to SRV-VMI with the path complete — it must pass.');
            return ok('8972 bytes sail through in one frame. Same bytes at MTU 1500 would need six frames — six chances for per-frame overhead and interrupts. That is why SAN/iSCSI/backup networks run jumbo… and why a forgotten hop announces itself as exactly the ICMP message you met.');
        },
    },
];
// ---------------------------------------------------------------------------
// HARD — 9 broad, multi-step challenges (free-roam ticket board)
// ---------------------------------------------------------------------------
const HARD_OBJECTIVES = [
    {
        id: 'H1', pillar: 'P3', anchor: 'V3/V4/V5 · chained faults',
        title: 'TICKET #4411 — Lab row is dark',
        brief: 'PC-LAB1 cannot reach anything; LAB2/LAB3 are slow but alive. The previous tech\'s note claims "trunks are clean". Diagnose the full fault CHAIN on the lab path, fix every link in it, then select exactly which faults you found.',
        inputs: [
            {
                key: 'faults', kind: 'multi', label: 'Select the faults you found and fixed on the lab path:',
                options: [
                    { value: 'duplex', label: 'A duplex mismatch on the lab ports' },
                    { value: 'shut', label: 'B2 Gi0/1 was administratively shut down' },
                    { value: 'native', label: 'A native VLAN mismatch on the B2 uplink' },
                    { value: 'trunk', label: 'VLAN 10 was missing from the B2 uplink\'s allowed list' },
                    { value: 'mtu', label: 'An MTU hole on the path' },
                    { value: 'vlan', label: 'B2 Gi0/1 carried the wrong access VLAN' },
                ],
            },
        ],
        hints: [
            'Follow the frame: NIC → port → trunk. Check B2 Gi0/1 (status? VLAN?), then VLAN 10\'s ride up the B2 uplink.',
            'Three separate faults, one per stage: the port, the VLAN on the port, the VLAN on the trunk.',
            'All three: port shut down · access VLAN 20 instead of 10 · VLAN 10 missing from B2 Gi0/23\'s allowed list.',
        ],
        check: ({ env, answers }) => {
            if (!picks(answers.faults, ['shut', 'vlan', 'trunk']))
                return no('The lab path had exactly three chained faults: port shut, wrong access VLAN, VLAN missing from the trunk list — no native/duplex/MTU issues here. Re-select.', 'Trace bottom-up: port status → access VLAN → trunk allowed list. There is one fault per stage.');
            const p = P(env, 'B2|Gi0/1');
            if (!p.enabled)
                return no('B2 Gi0/1 is still shut down — the lab PC stays dark.');
            if (p.accessVlan !== 10)
                return no(`B2 Gi0/1 now carries VLAN ${p.accessVlan}; the lab belongs in VLAN 10.`);
            const t = trunkIssues(env, ['B2|Gi0/23'], { exactAllowed: false, needVlans: [10] });
            if (t.length)
                return no(`${t[0]} — LAB traffic cannot leave the floor without it.`);
            const r = ping(env, 'pc-lab1', 'srv-vmi', 64);
            return r.ok ? ok('Full chain repaired: port enabled, VLAN corrected, trunk carrying 10. Tickets like this teach the discipline: verify every stage a frame crosses — port, VLAN, trunk — before blaming the application.') : no(`Faults cleared but LAB1→SRV still fails: ${r.reason}. Check the whole path once more.`);
        },
    },
    {
        id: 'H2', pillar: 'P2', anchor: 'V5 · V6 · native mismatch + trunk carry',
        title: 'TICKET #4412 — Phones unregister every hour',
        brief: 'Voice staff report phones dropping registration, and the syslog shows a native-VLAN complaint on the B2 side. Two distinct trunk faults are killing voice. Fix both, then select exactly which ones you found.',
        inputs: [
            {
                key: 'faults', kind: 'multi', label: 'Select the faults you found and fixed:',
                options: [
                    { value: 'duplex', label: 'Duplex mismatch on the phone port' },
                    { value: 'native', label: 'Native VLAN mismatch on the B2↔CORE trunk (1 vs 99)' },
                    { value: 'nat-b1', label: 'Native VLAN mismatch on the B1↔CORE trunk' },
                    { value: 'voice', label: 'VLAN 150 missing from the B1↔CORE trunk allowed list' },
                ],
            },
        ],
        hints: [
            'Read DIAG\'s trunk table: compare native VLANs on both ends of each link; compare allowed lists against the VOICE VLAN 150.',
            'The syslog names the mismatched link. The second fault hides in the allowed list of the OTHER uplink.',
            'B2 Gi0/23 native must match CORE Gi0/2 (99). And VLAN 150 must be allowed on BOTH ends of the B1 uplink.',
        ],
        check: ({ env, answers }) => {
            if (!picks(answers.faults, ['native', 'voice']))
                return no('Exactly two faults: the B2↔CORE native mismatch and VLAN 150 missing from the B1 uplink. The B1↔CORE native pair was healthy.', 'One fault is named in the syslog; the other one lives in an allowed list.');
            const mm = nativeMismatches(env);
            if (mm.length)
                return no(`A native mismatch remains: ${mm[0]} — align both ends (work order: 99 everywhere).`);
            const t = trunkIssues(env, ['B1|Gi0/23', 'CORE|Gi0/1'], { exactAllowed: false, needVlans: [150] });
            if (t.length)
                return no(`${t[0]} — the phone tags its voice frames with 150 and the trunk refuses them.`);
            return ok('Voice restored: VLAN 150 rides the B1 uplink again, and the native pair agrees (99/99). A native mismatch does not stop frames — it silently lands untagged traffic in the WRONG VLAN on one side, which is worse: it works until it leaks.');
        },
    },
    {
        id: 'H3', pillar: 'P3', anchor: 'V2/V3 · red-herring ticket',
        title: 'TICKET #4413 — Camera shows black',
        brief: 'Facilities insists the new camera is defective and wants an RMA. The tech note says "camera hardware dead". Prove them wrong: find why VLAN 40 traffic never leaves the 3rd floor and fix the path.',
        inputs: [
            {
                key: 'faults', kind: 'multi', label: 'Select the real faults:',
                options: [
                    { value: 'hw', label: 'Camera hardware failure (RMA justified)' },
                    { value: 'shut', label: 'The camera port (B2 Gi0/5) was shut down' },
                    { value: 'poe', label: 'PoE budget exhausted on B2' },
                    { value: 'trunk', label: 'VLAN 40 was missing from the uplink allowed list' },
                ],
            },
        ],
        hints: [
            'Two config faults, zero hardware. Check the port state, then whether VLAN 40 rides the B2 uplink.',
            'The "RMA" story is the red herring — switches do not forward VLANs they are not told to carry.',
            'Enable B2 Gi0/5 (access VLAN 40) and allow VLAN 40 on B2 Gi0/23 AND CORE Gi0/2.',
        ],
        check: ({ env, answers }) => {
            if (!picks(answers.faults, ['shut', 'trunk']))
                return no('Not the hardware: the port was shut and VLAN 40 was never allowed up the trunk. Both red herrings (RMA, PoE) rejected.', 'If the camera were dead, its port would still show the VLAN config. Compare config against behavior.');
            const p = P(env, 'B2|Gi0/5');
            if (!p.enabled || p.accessVlan !== 40)
                return no('B2 Gi0/5 must be enabled in access VLAN 40.');
            const t = trunkIssues(env, ['B2|Gi0/23', 'CORE|Gi0/2'], { exactAllowed: false, needVlans: [40] });
            if (t.length)
                return no(`${t[0]} — the camera\'s VLAN never leaves the floor.`);
            const f = flood(env, 'cam-3f');
            return f.receivers.length === 0 && !f.storm ? ok('Camera path live: its broadcasts now flood inside VLAN 40 across the trunk (and nowhere else — that is the point of a camera VLAN). Red herring filed where it belongs.') : no('VLAN 40 connectivity is odd — re-check the port and the trunk lists.');
        },
    },
    {
        id: 'H4', pillar: 'P1', anchor: 'S2/S7 · root forensics',
        title: 'Root-bridge forensics',
        brief: 'The previous tech "tuned" STP: B1=24576, B2=61440, CORE=32768. Work out who is root TODAY and who SHOULD be root per policy (the distribution switch), name the election rule, then set CORE-1 to 4096 and verify the block moved to the right place.',
        inputs: [
            { key: 'before', kind: 'text', label: 'Root bridge BEFORE your fix (hostname):', placeholder: 'hostname' },
            {
                key: 'should', kind: 'choice', label: 'Which switch SHOULD be root, and why?',
                options: [
                    { value: 'a', label: 'ACCESS-B1 — it serves the most users' },
                    { value: 'b', label: 'CORE-1 — the distribution switch' },
                    { value: 'c', label: 'It does not matter who is root' },
                ],
            },
            {
                key: 'rule', kind: 'choice', label: 'Election rule:',
                options: [
                    { value: 'a', label: 'Highest MAC address wins' },
                    { value: 'b', label: 'Fewest ports wins' },
                    { value: 'c', label: 'Lowest bridge ID wins' },
                ],
            },
        ],
        hints: [
            'Compare bridge IDs: 24576 beats 32768 regardless of MAC. That makes an ACCESS switch root today.',
            'Policy root = CORE-1 at 4096. After the change, the blocked port should sit on the B1↔B2 crosslink, B2 side.',
            'Before: ACCESS-B1 (priority 24576). Election = lowest priority, then lowest MAC.',
        ],
        check: ({ env, answers }) => {
            const b = norm(str(answers.before));
            if (!['b1', 'access-b1', 'access b1'].includes(b))
                return no('With B1 at 24576 and everyone else higher, ACCESS-B1 was root before your fix — check the STP view\'s crown.', 'Lowest bridge ID wins; 24576 < 32768 < 61440.');
            if (answers.should !== 'b')
                return no('Root placement is topology design: the distribution switch (CORE-1) as root keeps paths short and puts the blocked port on the least-used link.');
            if (answers.rule !== 'c')
                return no('The rule never changes: lowest bridge ID — priority first, lowest MAC as tie-breaker.');
            if (env.switches.CORE.priority > 4096)
                return no('CORE-1 needs priority 4096 (below B1\'s 24576) to win the crown.');
            const stp = computeStp(env);
            if (stp.root !== 'CORE')
                return no(`The fabric still follows ${stp.root === null ? 'a storm' : env.switches[stp.root].hostname}.`);
            if (stp.storm)
                return no('The fabric is storming — restore STP everywhere, then verify the election.');
            const blockedNow = stp.blockedPorts.map(id => `${P(env, id).switchId} ${P(env, id).name}`).join(', ');
            const blockNote = blockedNow
                ? `Blocked port now: ${blockedNow} — the standby link is the cheap one, exactly as designed.`
                : 'With the crosslink still down there is nothing to block yet — when you bring it back (safe-loop ticket), the block will settle on B2 Gi0/24, the cheap standby link.';
            return ok(`Crown relocated to CORE-1. ${blockNote} A rogue or misplaced root bends the whole topology around itself.`);
        },
    },
    {
        id: 'H5', pillar: 'P3', anchor: 'S1/S3/S4 · safe loop closure',
        title: 'Close the crosslink — safely',
        brief: 'After yesterday\'s storm, the crosslink was left disabled and someone switched STP off on ACCESS-B2 entirely. Restore redundancy WITHOUT repeating the storm: correct order matters. Verify exactly one blocked port at the end.',
        inputs: [
            {
                key: 'why', kind: 'choice', label: 'Why must STP run BEFORE the crosslink comes up?',
                options: [
                    { value: 'a', label: 'The triangle closes and the storm starts' },
                    { value: 'b', label: 'Trunk links renegotiate MTU on link-up' },
                    { value: 'c', label: 'Spanning tree assigns the VLAN numbers' },
                ],
            },
            {
                key: 'resid', kind: 'choice', label: 'Residual risk even WITH spanning tree?',
                options: [
                    { value: 'a', label: 'None — STP makes loops impossible' },
                    { value: 'b', label: 'Brief bursts during convergence' },
                    { value: 'c', label: 'Blocked ports storm once per hour' },
                ],
            },
        ],
        hints: [
            'SWITCH tab → ACCESS-B2 → re-enable STP FIRST; only then enable both crosslink ports (B1 Gi0/24, B2 Gi0/24).',
            'Success looks like: crosslink up, exactly ONE alternate/blocked port (B2 Gi0/24), storm meter at zero.',
            'If you storm the fabric: shut one crosslink port, enable STP on B2, then retry in the right order.',
        ],
        check: ({ env, answers }) => {
            if (answers.why !== 'a')
                return no('Bringing up a redundant link without loop prevention completes the triangle and starts the storm instantly — the sequence you just avoided.');
            if (answers.resid !== 'b')
                return no('STP is not instant: during convergence (seconds on RSTP, up to 50 s on 802.1D) loops can burst. Residual risk is real; that is why edge hygiene still matters.');
            const stp = computeStp(env);
            if (stp.storm)
                return no('The fabric is STORMING. Break the loop (disable one crosslink port), enable STP on ACCESS-B2, then close the loop in the correct order.', 'Order: STP on → THEN crosslink up.');
            if (!env.switches.B2.stpEnabled)
                return no('ACCESS-B2 still runs without spanning tree — that is how yesterday happened. Switch it back on first.');
            if (!env.ports['B1|Gi0/24'].enabled || !env.ports['B2|Gi0/24'].enabled)
                return no('The crosslink is still down — enable both Gi0/24 ports now that STP protects the triangle.');
            if (stp.blockedPorts.length !== 1)
                return no(`Expected exactly one blocked port, found ${stp.blockedPorts.length}. A healthy triangle holds one alternate.`);
            return ok('Redundancy restored the professional way: loop prevention live before the loop existed. The fabric now survives either uplink failure — B1↔B2 takes over in seconds while the alternate port wakes. This is the whole value proposition of spanning tree.');
        },
    },
    {
        id: 'H6', pillar: 'P4', anchor: 'J1–J4 · scope discipline',
        title: 'SAN jumbo rollout — with scope discipline',
        brief: 'The backup window is too slow. Roll out 9000-byte MTU on the NAS↔SRV-VMI path (both NICs, all four switch ports) — and ONLY there. One hop was left at 1500; find it. Any port outside the path at 9000 fails this check. Prove with an oversized ping.',
        inputs: [
            { key: 'hops', kind: 'text', label: 'How many elements (NICs + ports) must be exactly 9000 on this path?', placeholder: 'count' },
            {
                key: 'why', kind: 'choice', label: 'Why do jumbo frames speed up storage traffic?',
                options: [
                    { value: 'a', label: 'They bypass switch forwarding tables' },
                    { value: 'b', label: '802.1Q prioritizes them automatically' },
                    { value: 'c', label: 'Fewer frames means less per-frame overhead' },
                ],
            },
        ],
        hints: [
            'The path: NAS NIC · B2 Gi0/4 · B2 Gi0/23 · CORE Gi0/2 · CORE Gi0/3 · SRV NIC.',
            'Run the oversized ping to find the 1500-byte hole — the ICMP message names the hop.',
            'Six elements at 9000, everything else (printer, labs, camera, crosslink, spares) at 1500.',
        ],
        check: ({ env, answers, flags }) => {
            if (num(answers.hops) !== 6)
                return no('Count them: 2 NICs + 4 switch ports = 6 elements on the NAS→SRV path.');
            if (answers.why !== 'c')
                return no('Jumbo frames win on arithmetic: 8972 B in one frame instead of six — five fewer headers, five fewer interrupts, five fewer forwarding decisions.');
            const j = jumboScope(env);
            if (j.broken.length)
                return no(`Still too small: ${j.broken[0]}${j.broken.length > 1 ? ` (+${j.broken.length - 1} more)` : ''}.`, 'The oversized ping names the failing hop — trust the ICMP message.');
            if (j.overscope.length)
                return no(`SCOPE VIOLATION: ${j.overscope[0]} is at 9000 but is NOT on the SAN path. Jumbo belongs on storage segments, not on the printer or the crosslink — non-storage gear chokes on 9 KB frames.`, 'Every port/NIC outside {NAS, B2 Gi0/4, B2 Gi0/23, CORE Gi0/2, CORE Gi0/3, SRV} must stay 1500.');
            if (!flags.jumboTestPassed)
                return no('Prove the path: TESTS → oversized ping (8972 B) from NAS-SAN to SRV-VMI must pass.');
            return ok('Scoped, proven, signed: 9000 end-to-end on the storage path, 1500 everywhere else. Oversizing the world would trade a fast SAN for a sad printer. Scope discipline IS the jumbo skill.');
        },
    },
    {
        id: 'H7', pillar: 'P4', anchor: 'V8 · S6 · hopping defenses',
        title: 'Hardening sweep — close the hopping doors',
        brief: 'Before sign-off: disable every unused port, put PortFast+BPDU Guard on every active edge port, and confirm no trunk still uses native VLAN 1. Then select the measures that actually mitigate VLAN-hopping / rogue-root play.',
        inputs: [
            {
                key: 'def', kind: 'multi', label: 'Select the REAL mitigations:',
                options: [
                    { value: 'mtu', label: 'MTU 9000 on every port' },
                    { value: 'bpdu', label: 'BPDU Guard on all edge ports' },
                    { value: 'native', label: 'Native VLAN moved off 1 and consistent on both ends' },
                    { value: 'route', label: 'IP routing enabled on the core' },
                    { value: 'unused', label: 'Unused ports administratively disabled' },
                ],
            },
        ],
        hints: [
            'Six spare ports are still live. Ten edge ports need both toggles. Every trunk native must be 99.',
            'Ask per option: does it stop a double-tagged frame, a rogue BPDU, or a free wall socket? If not, it is not a hopping defense.',
            'native ≠ 1 · BPDU Guard · disabled spares — the other two are performance features, not security controls.',
        ],
        check: ({ env, answers }) => {
            if (!picks(answers.def, ['native', 'bpdu', 'unused']))
                return no('The real trio: native VLAN hygiene, BPDU Guard, disabled spares. MTU and IP routing change performance, not attack surface for hopping.', 'Double-tagging abuses the native VLAN; rogue roots need BPDUs; attackers need a live port. Pick accordingly.');
            const unused = UNUSED_PORT_IDS.filter(id => P(env, id).enabled);
            if (unused.length)
                return no(`${unused.length} unused ports still live (${unused.map(id => P(env, id).name).join(', ')} on their switches) — every live socket is an invitation.`);
            const gaps = edgeGaps(env, { portfast: true, bpduguard: true });
            if (gaps.length)
                return no(`Edge gaps: ${gaps[0]}${gaps.length > 1 ? ` (+${gaps.length - 1} more)` : ''}`);
            const badNative = ALL_TRUNK_PORTS.filter(id => P(env, id).mode === 'trunk' && P(env, id).nativeVlan === 1);
            if (badNative.length)
                return no(`${badNative.map(id => P(env, id).name).join(', ')} still use native VLAN 1 — the double-tagging classic. Move to 99.`);
            const mm = nativeMismatches(env);
            if (mm.length)
                return no(`Native pairs disagree: ${mm[0]}`);
            return ok('Doors closed: dead sockets off, edges tripwired, native VLAN boring and consistent. A would-be hopper finds no untagged wasteland, no root to steal, no free port. Cheap controls, disproportionate protection.');
        },
    },
    {
        id: 'H8', pillar: 'P2', anchor: 'I1/I2 · throughput forensics',
        title: 'Why is floor-to-floor so slow?',
        brief: 'Staff-to-SAN copies crawl, but no ticket says "outage". DIAG holds the answer on the B1↔CORE uplink. Read the negotiated values, identify the signature, fix it properly (work order: gigabit, full duplex), and prove the link is whole again.',
        inputs: [
            {
                key: 'before', kind: 'choice', label: 'What had the uplink negotiated BEFORE your fix?',
                options: [
                    { value: 'a', label: '100 Mbps at half duplex' },
                    { value: 'b', label: '1000 Mbps at full duplex' },
                    { value: 'c', label: 'Down — it never negotiated' },
                ],
            },
            {
                key: 'sig', kind: 'choice', label: 'Which signature matched?',
                options: [
                    { value: 'a', label: 'ICMP fragmentation-needed messages' },
                    { value: 'b', label: 'Climbing collisions, 10× slowdown' },
                    { value: 'c', label: 'Native VLAN mismatch syslogs' },
                ],
            },
        ],
        hints: [
            'DIAG: one side of the B1 uplink was FORCED to 100/half; the auto side obliged. Read "negotiated", not "configured".',
            'Half duplex on a busy uplink = collisions + CSMA/CD retries. The counter trail is in DIAG.',
            'Set BOTH ends to auto (→ 1000/full) or both to 1000/full explicitly.',
        ],
        check: ({ env, answers }) => {
            if (answers.before !== 'a')
                return no('The uplink had negotiated 100/half: B1\'s port was forced to 100/half, so the auto side settled at 100/half too. Read the negotiated column, not the configured one.');
            if (answers.sig !== 'b')
                return no('Half duplex breeds collisions and CSMA/CD backoff — the throughput crater you were shown. Fragmentation and VLAN syslogs are different diseases.');
            const na = portNeg(env, 'CORE|Gi0/1'), nb = portNeg(env, 'B1|Gi0/23');
            if (na.down || nb.down)
                return no('The uplink is down — you forced mismatched speeds. Both ends need the same speed.');
            if (na.mismatch || nb.mismatch || na.duplex === 'half' || na.speed < 1000)
                return no(`The uplink still runs ${na.speed}/${na.duplex}. Work order: gigabit full — set both ends auto, or both 1000/full.`);
            const c = env.counters['B1|Gi0/23'];
            return ok(`Uplink whole again: ${na.speed}/${na.duplex} end to end, collision counter frozen at ${c.coll}. One forced 100/half setting on one port throttled an entire floor — speed/duplex hygiene is a performance control AND a sanity control.`);
        },
    },
    {
        id: 'H9', pillar: 'P4', anchor: 'Full work-order compliance',
        title: 'Acceptance sweep — sign off Building B',
        brief: 'The cutover checklist, all at once: VLAN database + names, every access assignment, all trunks (allowed {10,20,30,40,99,150}, native 99, no mismatch), crosslink up with one block, CORE-1 root at ≤4096, IP routing on, edge ports PortFast+BPDU Guard, spares disabled, jumbo scoped to the SAN path, camera up. No prompts this time.',
        inputs: [],
        hints: [
            'Work through the work-order table section by section; the earlier tickets fixed most of it.',
            'The sweep validates the COMPLETE spec — anything you skipped in earlier tasks resurfaces here.',
            'Green means: signed. If it fails, the feedback names the first non-compliant item.',
        ],
        check: ({ env, flags }) => {
            const db = vlanDbOk(env);
            if (db.length)
                return no(`VLAN database: ${db[0]}`);
            const acc = accessOk(env);
            if (acc.length)
                return no(`Access layer: ${acc[0]}`);
            const tr = trunkIssues(env, ALL_TRUNK_PORTS, { exactAllowed: true });
            if (tr.length)
                return no(`Trunking: ${tr[0]}`);
            const mm = nativeMismatches(env);
            if (mm.length)
                return no(`Native VLANs: ${mm[0]}`);
            if (!env.ports['B1|Gi0/24'].enabled || !env.ports['B2|Gi0/24'].enabled)
                return no('The crosslink must be up — redundancy was the point of buying that third fiber.');
            const stp = computeStp(env);
            if (stp.storm)
                return no('The fabric is storming — restore STP everywhere first.');
            if (stp.root !== 'CORE' || env.switches.CORE.priority > 4096)
                return no('CORE-1 must be root at priority ≤ 4096.');
            if (stp.blockedPorts.length !== 1)
                return no(`Expected exactly one blocked port, found ${stp.blockedPorts.length}.`);
            if (!env.switches.CORE.ipRouting)
                return no('InterVLAN routing (IP routing on CORE-1) must stay enabled.');
            const gaps = edgeGaps(env, { portfast: true, bpduguard: true, shutUnused: true });
            if (gaps.length)
                return no(`Edge/security: ${gaps[0]}`);
            const j = jumboScope(env);
            if (j.broken.length)
                return no(`Jumbo path incomplete: ${j.broken[0]}`);
            if (j.overscope.length)
                return no(`Jumbo scope leak: ${j.overscope[0]} should be 1500.`);
            if (!flags.jumboTestPassed)
                return no('Run the oversized-ping proof once with the final config (TESTS).');
            const r = ping(env, 'pc-staff1', 'srv-vmi', 64);
            if (!r.ok)
                return no(`Final smoke test failed: ${r.reason}`);
            return ok('SIGNED. Building B is segmented, trunked, loop-safe, edge-hardened and scope-clean. You configured every switching technology in N10-009 2.2 on a live fabric and defended it against the classic failure modes. The next tech inherits a documented, defended network — because you described every port.');
        },
    },
];
const OBJECTIVES = {
    medium: MEDIUM_OBJECTIVES,
    hard: HARD_OBJECTIVES,
};

