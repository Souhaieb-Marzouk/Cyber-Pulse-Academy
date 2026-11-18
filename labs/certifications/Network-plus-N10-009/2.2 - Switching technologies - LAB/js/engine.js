// THE FABRIC BENCH — static port. ported 1:1 from src/lib/lab/engine.ts (tsc es2020).
// Content, algorithms, wording and answers are identical to the original framework lab.
// Loaded as a classic <script>: top-level const/function become page-global in load order.

// ============================================================================
// THE FABRIC BENCH — simulation engine (pure functions)
// A faithful *simplification* of STP / autonegotiation for a 3-switch triangle.
// Simplifications are labeled in the UI.
// ============================================================================

/**
 * Simplified autonegotiation (vendor-style):
 *  auto + auto            → 1000 / full
 *  auto + forced(s, d)    → auto side adopts speed s; duplex = full only if s == 1000, else half
 *  forced + forced        → speed must match or the link stays down; duplexes used as forced
 */
function negotiatePort(aSpeed, aDup, bSpeed, bDup) {
    const side = (mySpeed, myDup, otherSpeed, otherDup) => {
        if (mySpeed === 'auto' && myDup === 'auto') {
            if (otherSpeed === 'auto')
                return { speed: 1000, duplex: 'full' };
            const s = otherSpeed;
            return { speed: s, duplex: s >= 1000 ? 'full' : 'half' };
        }
        if (mySpeed === 'auto') {
            // speed forced, duplex auto → full at that speed
            const s = otherSpeed === 'auto' ? 1000 : otherSpeed;
            return { speed: s, duplex: 'full' };
        }
        // speed forced
        const s = mySpeed;
        if (otherSpeed !== 'auto' && otherSpeed !== s)
            return { speed: 0, duplex: 'half' }; // speeds disagree → link down
        const d = myDup === 'auto' ? 'full' : myDup;
        return { speed: s, duplex: d };
    };
    const A = side(aSpeed, aDup, bSpeed, bDup);
    if (A.speed === 0)
        return { speed: 0, duplex: 'half', mismatch: false, down: true };
    const B = side(bSpeed, bDup, aSpeed, aDup);
    if (B.speed === 0)
        return { speed: 0, duplex: 'half', mismatch: false, down: true };
    return { speed: A.speed, duplex: A.duplex, mismatch: A.duplex !== B.duplex, down: false };
}
function portNeg(env, portId) {
    const p = env.ports[portId];
    const end = Object.values(env.ends).find(e => e.portId === portId);
    if (end) {
        return negotiatePort(p.speed, p.duplex, end.nicSpeed, end.nicDuplex);
    }
    const link = env.links.find(l => l.a === portId || l.b === portId);
    if (!link)
        return { speed: 1000, duplex: 'full', mismatch: false, down: false };
    const other = env.ports[link.a === portId ? link.b : link.a];
    return negotiatePort(p.speed, p.duplex, other.speed, other.duplex);
}
function linkUp(env, linkId) {
    const l = env.links.find(x => x.id === linkId);
    return env.ports[l.a].enabled && env.ports[l.b].enabled && !portNeg(env, l.a).down;
}
const bidLower = (env, a, b) => {
    const A = env.switches[a], B = env.switches[b];
    return A.priority !== B.priority ? A.priority < B.priority : A.mac < B.mac;
};
function computeStp(env) {
    const swIds = ['CORE', 'B1', 'B2'];
    const ports = {};
    const stpOff = swIds.filter(s => !env.switches[s].stpEnabled);
    const upLinks = env.links.filter(l => linkUp(env, l.id));
    // default: everything forwarding unless disabled
    for (const p of Object.values(env.ports)) {
        if (p.role === 'spare' || p.role === 'edge')
            ports[p.id] = { role: 'disabled', state: 'FWD', rootCost: 0 };
        else
            ports[p.id] = { role: 'disabled', state: p.enabled ? 'FWD' : 'DOWN', rootCost: 0 };
    }
    const hasLoop = (() => {
        // triangle exists if all three switches mutually connected by >=2 links forming a cycle
        if (upLinks.length < 3)
            return false;
        const adj = { CORE: new Set(), B1: new Set(), B2: new Set() };
        for (const l of upLinks) {
            const a = env.ports[l.a].switchId, b = env.ports[l.b].switchId;
            adj[a].add(b);
            adj[b].add(a);
        }
        return adj.CORE.has('B1') && adj.CORE.has('B2') && adj.B1.has('B2');
    })();
    const storm = hasLoop && stpOff.length > 0;
    if (storm) {
        for (const l of upLinks) {
            ports[l.a] = { role: 'designated', state: 'FWD', rootCost: 0 };
            ports[l.b] = { role: 'designated', state: 'FWD', rootCost: 0 };
        }
        return { root: null, storm, stpOffSwitches: stpOff, ports, blockedPorts: [] };
    }
    // elect root
    let root = swIds[0];
    for (const s of swIds)
        if (bidLower(env, s, root))
            root = s;
    // root path cost (Dijkstra over up links, cost by negotiated speed)
    const cost = { [root]: 0 };
    const Q = new Set(swIds);
    while (Q.size) {
        let u = null;
        for (const s of Q)
            if (cost[s] !== undefined && (u === null || cost[s] < cost[u]))
                u = s;
        if (u === null)
            break;
        Q.delete(u);
        for (const l of upLinks) {
            const a = env.ports[l.a].switchId, b = env.ports[l.b].switchId;
            const w = LINK_COST_AT(portNeg(env, l.a).speed);
            const [from, to] = a === u ? [a, b] : b === u ? [b, a] : [null, null];
            if (from === null)
                continue;
            const nd = cost[from] + w;
            if (cost[to] === undefined || nd < cost[to])
                cost[to] = nd;
        }
    }
    // root ports: for each non-root, neighbor minimizing (myCostViaNeighbor, neighborBID)
    for (const s of swIds) {
        if (s === root)
            continue;
        const myLinks = upLinks.filter(l => env.ports[l.a].switchId === s || env.ports[l.b].switchId === s);
        let best = null;
        for (const l of myLinks) {
            const myPort = env.ports[l.a].switchId === s ? l.a : l.b;
            const nbId = env.ports[l.a].switchId === s ? env.ports[l.b].switchId : env.ports[l.a].switchId;
            const nbCost = cost[nbId];
            if (nbCost === undefined)
                continue;
            const w = LINK_COST_AT(portNeg(env, l.a).speed);
            const key = nbCost + w;
            const nbBid = `${env.switches[nbId].priority}-${env.switches[nbId].mac}`;
            if (!best || key < best.key || (key === best.key && nbBid < best.nbBid))
                best = { port: myPort, key, nbBid };
        }
        if (best)
            ports[best.port] = { role: 'root', state: 'FWD', rootCost: best.key };
    }
    // designated per link: lower (rootCost, BID) wins; other end blocked unless it is a root port
    const blocked = [];
    for (const l of upLinks) {
        const a = env.ports[l.a], b = env.ports[l.b];
        const ca = cost[a.switchId] ?? Infinity, cb = cost[b.switchId] ?? Infinity;
        const aDesig = ca !== cb ? ca < cb : bidLower(env, a.switchId, b.switchId);
        const desigPort = aDesig ? l.a : l.b;
        const otherPort = aDesig ? l.b : l.a;
        ports[desigPort] = { role: 'designated', state: 'FWD', rootCost: aDesig ? ca : cb };
        if (ports[otherPort].role !== 'root') {
            ports[otherPort] = { role: 'alternate', state: 'BLK', rootCost: aDesig ? cb : ca };
            blocked.push(otherPort);
        }
    }
    return { root, storm, stpOffSwitches: stpOff, ports, blockedPorts: blocked };
}
// ---------------------------------------------------------------------------
// VLAN carriage & flood (broadcast domain)
// ---------------------------------------------------------------------------
/** The VLAN a host ACTUALLY lives in = its switch port's access VLAN (not the design intent). */
function endVlan(env, endId) {
    const e = env.ends[endId];
    const p = env.ports[e.portId];
    return p?.mode === 'access' ? p.accessVlan : e.dataVlan;
}
function vlanCarried(env, a, b, vlan) {
    const pa = env.ports[a], pb = env.ports[b];
    const carries = (p) => {
        if (!p.enabled)
            return false;
        if (p.mode === 'trunk')
            return p.allowedVlans.includes(vlan) || p.nativeVlan === vlan;
        return p.accessVlan === vlan || p.voiceVlan === vlan;
    };
    if (!carries(pa) || !carries(pb))
        return false;
    if (pa.mode === 'access' && pb.mode === 'access')
        return pa.accessVlan === pb.accessVlan;
    return true;
}
function flood(env, srcId) {
    const stp = computeStp(env);
    const src = env.ends[srcId];
    const vlan = endVlan(env, srcId);
    const blockedSet = new Set(stp.blockedPorts);
    // BFS across switches
    const adj = { CORE: new Set(), B1: new Set(), B2: new Set() };
    const blockedHops = [];
    for (const l of env.links) {
        const a = env.ports[l.a], b = env.ports[l.b];
        if (!a.enabled || !b.enabled) {
            blockedHops.push(`${a.name}↔${b.name} link down`);
            continue;
        }
        if (blockedSet.has(l.a) || blockedSet.has(l.b)) {
            blockedHops.push(`${a.switchId} ${a.name} (STP blocking)`);
            continue;
        }
        if (vlanCarried(env, l.a, l.b, vlan)) {
            adj[a.switchId].add(b.switchId);
            adj[b.switchId].add(a.switchId);
        }
        else
            blockedHops.push(`VLAN ${vlan} not carried on ${a.switchId} ${a.name} ↔ ${b.switchId} ${b.name}`);
    }
    const reached = new Set([src.switchId]);
    const q = [src.switchId];
    while (q.length) {
        const s = q.shift();
        for (const n of adj[s])
            if (!reached.has(n)) {
                reached.add(n);
                q.push(n);
            }
    }
    const receivers = [];
    const missed = [];
    for (const e of Object.values(env.ends)) {
        if (e.id === srcId)
            continue;
        const port = env.ports[e.portId];
        if (!port.enabled) {
            missed.push(`${e.name} (port shut down)`);
            continue;
        }
        const inVlan = port.accessVlan === vlan || port.voiceVlan === vlan;
        if (inVlan && reached.has(e.switchId))
            receivers.push(e.id);
        else
            missed.push(e.id);
    }
    return { receivers, missed, storm: stp.storm, blockedHops };
}
function l2Path(env, stp, from, to, vlan) {
    // BFS over links that carry vlan and are up & unblocked; returns ordered switch-switch ports along path
    const blockedSet = new Set(stp.blockedPorts);
    const prev = { [from]: { sw: null, ports: [] } };
    const q = [from];
    while (q.length) {
        const s = q.shift();
        for (const l of env.links) {
            const a = env.ports[l.a], b = env.ports[l.b];
            if (!a.enabled || !b.enabled)
                continue;
            if (blockedSet.has(l.a) || blockedSet.has(l.b))
                continue;
            if (!vlanCarried(env, l.a, l.b, vlan))
                continue;
            const [ns, portsPair] = a.switchId === s ? [b.switchId, [l.a, l.b]] : b.switchId === s ? [a.switchId, [l.b, l.a]] : [null, null];
            if (ns === null || prev[ns])
                continue;
            prev[ns] = { sw: s, ports: [...prev[s].ports, ...portsPair] };
            if (ns === to)
                return prev[ns].ports;
            q.push(ns);
        }
    }
    return null;
}
function ping(env, srcId, dstId, size) {
    const stp = computeStp(env);
    const src = env.ends[srcId], dst = env.ends[dstId];
    const srcVlan = endVlan(env, srcId);
    const dstVlan = endVlan(env, dstId);
    const hops = [];
    const mismatchHops = [];
    const pathPorts = [];
    const res = { ok: false, routed: false, hops, pathPorts, minSpeed: 1000, mismatchHops };
    const pushNic = (e, side) => {
        const p = env.ports[e.portId];
        const neg = portNeg(env, e.portId);
        if (!p.enabled) {
            res.reason = `${e.name}'s switch port ${p.name} is administratively shut down`;
        }
        hops.push({ label: `${side} ${e.name} NIC`, mtu: e.nicMtu, speed: neg.down ? 0 : neg.speed, duplex: neg.duplex });
        if (neg.mismatch)
            mismatchHops.push(`${side} ${e.name} link (${p.switchId} ${p.name})`);
        res.minSpeed = Math.min(res.minSpeed, neg.down ? 0 : neg.speed);
    };
    const pushPort = (portId) => {
        const p = env.ports[portId];
        const neg = portNeg(env, portId);
        hops.push({ label: `${p.switchId} ${p.name}`, mtu: p.mtu, speed: neg.down ? 0 : neg.speed, duplex: neg.duplex });
        if (env.links.some(l => l.a === portId || l.b === portId))
            pathPorts.push(portId);
        if (neg.mismatch)
            mismatchHops.push(`${p.switchId} ${p.name}`);
        res.minSpeed = Math.min(res.minSpeed, neg.down ? 0 : neg.speed);
    };
    pushNic(src, '→');
    pushPort(src.portId);
    if (res.reason)
        return res;
    const sameVlan = srcVlan === dstVlan;
    let trunkPorts = [];
    if (sameVlan) {
        if (src.switchId !== dst.switchId) {
            trunkPorts = l2Path(env, stp, src.switchId, dst.switchId, srcVlan) ?? [];
            if (trunkPorts.length === 0) {
                res.reason = `No Layer-2 path for VLAN ${srcVlan} — check trunk mode / allowed VLAN list on the switch-to-switch links`;
                return res;
            }
        }
    }
    else {
        if (!env.switches.CORE.ipRouting) {
            res.reason = `Different VLANs (${srcVlan} → ${dstVlan}) and no interVLAN routing enabled — enable IP routing on CORE-1`;
            return res;
        }
        const p1 = src.switchId === 'CORE' ? [] : l2Path(env, stp, src.switchId, 'CORE', srcVlan);
        const p2 = dst.switchId === 'CORE' ? [] : l2Path(env, stp, 'CORE', dst.switchId, dstVlan);
        if ((src.switchId !== 'CORE' && (!p1 || p1.length === 0)) || (dst.switchId !== 'CORE' && (!p2 || p2.length === 0))) {
            res.reason = `Routed path incomplete — VLAN ${srcVlan} or ${dstVlan} is not carried to CORE-1 (trunk allowed list?)`;
            return res;
        }
        trunkPorts = [...(p1 ?? []), ...(p2 ?? [])];
        res.routed = true;
    }
    for (const t of trunkPorts)
        pushPort(t);
    if (res.routed)
        hops.push({ label: 'CORE-1 SVI (routed between VLANs)', mtu: 9000, speed: 1000, duplex: 'full' });
    pushPort(dst.portId);
    pushNic(dst, '←');
    if (res.reason)
        return res;
    // MTU walk (src → dst)
    for (const h of hops) {
        if (h.mtu < size) {
            res.ok = false;
            res.mtuFailAt = h.label;
            res.icmp = `ICMP Destination Unreachable — Fragmentation Required (Type 3, Code 4) · next-hop MTU ${h.mtu} at ${h.label}`;
            res.reason = `Frame of ${size} B exceeds MTU ${h.mtu} at ${h.label}`;
            return res;
        }
    }
    // native VLAN mismatch warning (does not stop traffic — it leaks)
    for (const l of env.links) {
        const pa = env.ports[l.a], pb = env.ports[l.b];
        if (pa.enabled && pb.enabled && pa.mode === 'trunk' && pb.mode === 'trunk' && pa.nativeVlan !== pb.nativeVlan) {
            res.nativeWarn = `Native VLAN mismatch on ${pa.switchId} ${pa.name} (${pa.nativeVlan}) ↔ ${pb.switchId} ${pb.name} (${pb.nativeVlan}) — untagged frames land in different VLANs`;
        }
    }
    res.ok = mismatchHops.length === 0;
    if (!res.ok)
        res.reason = `Reachable but lossy: duplex mismatch at ${mismatchHops.join(', ')} — retransmissions will slow this flow`;
    return res;
}
const isJumboCapable = (e) => e.kind === 'nas' || e.kind === 'server';
/** BFS switch sequence carrying `vlan` (STP-aware). Returns [from..to] or null. */
function switchPath(env, stp, from, to, vlan) {
    if (from === to)
        return [from];
    const blockedSet = new Set(stp.blockedPorts);
    const prev = { [from]: null };
    const q = [from];
    while (q.length) {
        const s = q.shift();
        for (const l of env.links) {
            const a = env.ports[l.a], b = env.ports[l.b];
            if (!a.enabled || !b.enabled)
                continue;
            if (blockedSet.has(l.a) || blockedSet.has(l.b))
                continue;
            if (!vlanCarried(env, l.a, l.b, vlan))
                continue;
            const ns = a.switchId === s ? b.switchId : b.switchId === s ? a.switchId : null;
            if (ns === null || prev[ns] !== undefined)
                continue;
            prev[ns] = s;
            if (ns === to) {
                const seq = [to];
                let cur = to;
                while (cur !== null && cur !== from) {
                    cur = prev[cur];
                    if (cur !== null && cur !== undefined)
                        seq.unshift(cur);
                }
                return seq;
            }
            q.push(ns);
        }
    }
    return null;
}

