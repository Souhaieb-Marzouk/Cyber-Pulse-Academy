// ── The Staging Bay · validators + scoring ──────────────────────────────────
// Static port of src/lib/lab/engine.ts (validators + score) — logic and every
// feedback string are 1:1. Data comes from window.LAB (js/data.js).
(function () {
'use strict';
const LAB = window.LAB;

const p = (s, slot, dev) => s.placements[slot] === dev;
const swAll = (s) => Object.values(s.accessSwitch).every(Boolean);

// ── validators ──
const VALIDATORS = {
  'OBJ-M1': (s) => {
    const ok = LAB.MATCH_ITEMS.every((d) => s.match[d]);
    if (!ok) return { pass: false, feedback: 'Role-match incomplete: assign every one of the 10 appliances. Two decoy roles must remain unused.' };
    const correct = { router: 'r-routes', switch: 'r-frames', firewall: 'r-policy', ids: 'r-alert', lb: 'r-spread', fproxy: 'r-egress', rproxy: 'r-front', nas: 'r-files', san: 'r-blocks', ap: 'r-radio' };
    const wrong = LAB.MATCH_ITEMS.filter((d) => s.match[d] !== correct[d]);
    if (wrong.length) {
      const names = wrong.join(', ');
      return { pass: false, feedback: `Not quite — recheck: ${names}. Watch the traps: forward proxy = OUTBOUND filter/cache, reverse proxy = INBOUND front door; NAS = file shares (SMB/NFS), SAN = raw blocks (FC/iSCSI).` };
    }
    return { pass: true, feedback: 'All ten matched. You can now tell the crew apart — including the outbound/inbound proxy pair and the file/block storage pair, the two classics exams love to swap.' };
  },
  'OBJ-M2': (s) => {
    if (s.path.length !== LAB.PATH_CORRECT.length) return { pass: false, feedback: `Sequence incomplete — ${s.path.length}/6 hops placed. Tap chips in the order an outside request travels.` };
    const ok = LAB.PATH_CORRECT.every((id, i) => s.path[i] === id);
    if (!ok) return { pass: false, feedback: 'Order is off. Remember: routing first, policy second; the reverse proxy receives outsiders BEFORE the load balancer picks a server; the web server is last.' };
    return { pass: true, feedback: 'Perfect chain: Internet → router → firewall → reverse proxy → load balancer → web server. Every appliance earns exactly one hop — that is chain position, the mental model for all placement questions.' };
  },
  'OBJ-M3': (s) => {
    const need = [['edge-router', 'router', 'Router'], ['edge-fw', 'ngfw', 'NGFW'], ['edge-ips', 'ips', 'inline IPS']];
    const missing = need.filter(([sl]) => !s.placements[sl]);
    const wrong = need.filter(([sl, dev]) => s.placements[sl] && s.placements[sl] !== dev);
    if (missing.length) return { pass: false, feedback: `EDGE BAY still has empty slot(s): ${missing.map(([, , n]) => n).join(', ')}. The passive IDS does NOT belong here — it is a core-bay mirror listener.` };
    if (wrong.length) return { pass: false, feedback: `Wrong crate in a slot: ${wrong.map(([, , n]) => n).join(', ')}. Edge order is physical: route (U1), filter (U2), block (U3, the INLINE sensor).` };
    return { pass: true, feedback: 'Perimeter racked: router → NGFW → inline IPS. Traffic is routed, policy-filtered, then actively blocked — the outside-in gauntlet is complete.' };
  },
  'OBJ-M4': (s) => {
    if (!p(s, 'dmz-rproxy', 'rproxy') || !p(s, 'dmz-lb', 'lb')) return { pass: false, feedback: 'DMZ BAY needs the reverse proxy (U1 · FRONT DOOR) and the load balancer (U2 · SPREAD). The forward proxy is the outbound one — wrong half of the pair.' };
    if (s.lb.algorithm !== 'weighted-rr') return { pass: false, feedback: 'Placement ✓. Now the balancer: WEB-02 has 2× CPU, so plain round robin wastes it. Set the algorithm to weighted round robin.' };
    if (s.lb.w2 < 2) return { pass: false, feedback: 'Weighted RR selected, but WEB-02 still has weight 1. Give it weight ≥ 2 so it receives its fair (double) share.' };
    if (!s.lb.healthChecks) return { pass: false, feedback: 'Almost — without health checks a dead node keeps receiving clients. Flip health checks ON.' };
    return { pass: true, feedback: 'DMZ live: outsiders land on the reverse proxy, the LB spreads load 2:1:1 across the farm, and dead nodes are drained by probes. This is the reference edge-to-farm stack.' };
  },
  'OBJ-M5': (s) => {
    if (!p(s, 'sto-nas', 'nas') || !p(s, 'sto-san', 'san')) return { pass: false, feedback: 'STORAGE BAY: NAS → U1 (files), SAN → U2 (blocks). They are complements, not competitors.' };
    if (s.storage.nasProto !== 'smb') return { pass: false, feedback: 'The office is a Windows mix — file shares need NAS over SMB/CIFS (NFS would be for Unix clients).' };
    if (s.storage.sanProto !== 'iscsi') return { pass: false, feedback: 'The virtualization cluster wants raw blocks; iSCSI carries SCSI commands inside ordinary Ethernet frames — set the SAN to iSCSI (FC is the premium fabric, a later lesson).' };
    return { pass: true, feedback: 'Storage settled: file shares ride the LAN on SMB, the cluster gets blocks over iSCSI. Files vs blocks, LAN vs fabric — the NAS/SAN exam question is now muscle memory.' };
  },
  'OBJ-M6': (s) => {
    const ids = ['wl-wlc', 'wl-ap1', 'wl-ap2', 'wl-ap3', 'wl-ext', 'wl-bridge'];
    const missing = ids.filter((sl) => !s.placements[sl]);
    if (missing.length) return { pass: false, feedback: `WIRELESS BAY incomplete (${6 - missing.length}/6 placed): controller, 3× AP, dock extender, Warehouse B bridge.` };
    if (s.wlPlan['warehouse'] !== 'bridge' || s.wlPlan['dock'] !== 'extender') return { pass: false, feedback: 'Planner mismatch: Warehouse B is a point-to-point WIRED-segment link → bridge. The dock is a client coverage gap → extender (at ~half throughput).' };
    return { pass: true, feedback: 'Radio overlay built: three APs under one controller, a bridge hop to Warehouse B, an extender patching the dock. One brain, three tools — coverage, links and clients are different problems.' };
  },
  'OBJ-M7': (s) => {
    if (!p(s, 'core-switch', 'l3switch') || !p(s, 'acc-switch', 'poeswitch')) return { pass: false, feedback: 'Install both switches first: core L3 → CORE U1, managed PoE access switch → ACCESS U1.' };
    const sw = s.accessSwitch;
    const todo = [];
    if (!sw.poe) todo.push('PoE');
    if (!sw.vlanStaff || !sw.vlanVoice || !sw.vlanCamera) todo.push('VLANs 10/20/30');
    if (!sw.stp) todo.push('STP');
    if (!sw.portSecurity) todo.push('port security');
    if (todo.length) return { pass: false, feedback: `SWITCH console still missing: ${todo.join(', ')}. Every user port gets power, segmentation, a loop referee and a MAC bouncer.` };
    return { pass: true, feedback: 'Access layer commissioned: phones and cameras power over Ethernet, three VLANs keep staff/voice/camera traffic apart, STP referees loops, port security bars rogue devices. The most-mocked N10-009 features, all live.' };
  },
  'OBJ-M8': (s) => {
    if (s.firewall.mode !== 'stateful') return { pass: false, feedback: 'The perimeter needs connection tracking — switch the firewall to stateful mode (replies of allowed sessions then pass without extra rules).' };
    if (!s.firewall.dmzZone) return { pass: false, feedback: 'Enable the DMZ zone: published servers must live in their own half-trusted segment, not on the LAN.' };
    if (s.firewall.rules.length === 0) return { pass: false, feedback: 'Ruleset empty. Build from the palette: ALLOW established+related first, ALLOW WAN→DMZ web 80/443 second, DENY staff→DMZ database third.' };
    const want = ['R-EST', 'R-DMZ-WEB', 'R-DENY-DMZDB'];
    if (s.firewall.rules.join('|') !== want.join('|')) {
      if (s.firewall.rules.includes('R-STAFF-DMZDB')) return { pass: false, feedback: 'That "the BI tool needs it" any→DB allow is exactly the rule to refuse — it defeats the DMZ. Remove it and add the explicit staff→DB DENY instead.' };
      if (s.firewall.rules.includes('R-ANYANY')) return { pass: false, feedback: 'ALLOW any-any turns the firewall into a cable. Remove it — unlisted traffic dies at the implicit deny, which is the point.' };
      return { pass: false, feedback: `Ruleset/order not right (have: ${s.firewall.rules.map((r) => LAB.FW_RULES[r].text.split('—')[0]).join(' → ')}). Required: ESTABLISHED → WAN→DMZ web → DENY staff→DB. Use ↑/↓ to reorder.` };
    }
    return { pass: true, feedback: 'Policy live: stateful tracking, DMZ segmented, and a clean three-rule base — established first, published web second, database shielded, implicit deny catching the rest. Order + intent both correct.' };
  },
  'OBJ-M9': (s) => {
    if (!p(s, 'core-ids', 'ids')) return { pass: false, feedback: 'Rack the IDS in CORE U2 (WATCH). The edge U3 slot already holds the inline IPS — different jobs.' };
    if (!s.accessSwitch.portMirror) return { pass: false, feedback: 'The passive IDS is staring at an empty mirror. Enable port mirroring (SPAN) in the SWITCH console so a copy of core traffic reaches its tap.' };
    if (s.sensors.idsMode !== 'signature' || s.sensors.ipsMode !== 'signature') return { pass: false, feedback: 'Set BOTH sensors to signature mode: known-bad certainty first, anomaly baselining later once the floor settles.' };
    return { pass: true, feedback: 'Eyes deployed: SPAN feeds the passive IDS (detect + alert), the inline IPS stands on the path (detect + block), both in signature mode. Placement = capability: mirror can\'t stop, inline can.' };
  },
  'OBJ-M10': (s) => {
    const answered = LAB.ALERTS.filter((a) => s.alertVerdicts[a.id]);
    if (answered.length < LAB.ALERTS.length) return { pass: false, feedback: `Classify all 6 alerts (${answered.length}/6 done). For each: is something actively attacking, or is the sensor just chatty?` };
    const wrong = LAB.ALERTS.filter((a) => s.alertVerdicts[a.id] !== a.verdict);
    if (wrong.length > 1) return { pass: false, feedback: `${wrong.length} misread — 5/6 needed. Hints: the 02:00 egress spike is the scheduled backup; the Apache banner disclosure is hygiene, not attack; external SYN sweep and SMB brute force are real hostilities.` };
    if (wrong.length === 1) {
      const a = wrong[0];
      return { pass: true, feedback: `5/6 — passes. The one you missed: ${a.id} is a ${a.verdict === 'tp' ? 'TRUE' : 'FALSE'} positive. ${a.teach}` };
    }
    return { pass: true, feedback: '6/6 triage. You separated hostile intent from sensor chatter — TP: SQLi, SYN scan, lateral SMB, phishing DNS; FP: banner disclosure, backup-job anomaly. That judgment is the daily SOC craft.' };
  },
  'OBJ-M11': (s) => {
    if (!p(s, 'core-fproxy', 'fproxy')) return { pass: false, feedback: 'Rack the forward proxy in CORE U3 (EGRESS). It faces the clients\' outbound requests — the mirror image of the DMZ reverse proxy.' };
    if (!s.proxies.fEnabled) return { pass: false, feedback: 'Enable the forward proxy in the PROXY console.' };
    if (!s.proxies.fCaching || !s.proxies.fFilter) return { pass: false, feedback: 'Switch on caching (repeated downloads served locally) and category filtering (policy at the door).' };
    if (!s.firewall.proxyOnlyEgress) return { pass: false, feedback: 'A proxy people can bypass is a suggestion. On the FIREWALL console, enforce "WAN egress only via proxy".' };
    return { pass: true, feedback: 'Egress locked: staff browsing is filtered and cached at the proxy, and the firewall makes that door the only way out. Inbound you published services; outbound you control them.' };
  },
  'OBJ-H1': (s) => {
    const parts = [];
    if (!p(s, 'edge-router', 'router')) parts.push('router → EDGE U1');
    if (!p(s, 'edge-fw', 'ngfw')) parts.push('NGFW → EDGE U2');
    if (!p(s, 'edge-ips', 'ips')) parts.push('IPS → EDGE U3');
    if (!p(s, 'dmz-rproxy', 'rproxy')) parts.push('reverse proxy → DMZ U1');
    if (!p(s, 'dmz-lb', 'lb')) parts.push('LB → DMZ U2');
    if (parts.length) return { pass: false, feedback: `Design review — placements missing: ${parts.join('; ')}.` };
    if (s.firewall.mode !== 'stateful' || !s.firewall.dmzZone) return { pass: false, feedback: 'FW must be stateful WITH the DMZ zone enabled — connection tracking and segmentation are both non-negotiable.' };
    if (!s.proxies.rTls || !s.proxies.rWaf) return { pass: false, feedback: 'Reverse proxy not commissioned: enable TLS offload AND WAF rules — terminate outsiders at the front door, inspect what they carry.' };
    if (s.lb.algorithm !== 'weighted-rr' || s.lb.w2 < 2 || !s.lb.healthChecks) return { pass: false, feedback: 'LB spec: weighted round robin, WEB-02 weight ≥ 2 (it has 2× CPU), health checks ON for automatic failover.' };
    return { pass: true, feedback: 'Design approved. Full edge-to-farm path delivered: routed → statefully filtered → inline-blocked → TLS-terminated/WAF-inspected → capacity-weighted with probe failover. Every requirement, one coherent stack.' };
  },
  'OBJ-H2': (s) => {
    if (!s.accessSwitch.stp) return { pass: false, feedback: 'STP is still disabled on SW-A1 — that is WHY the storm runs. Re-enable the referee in the SWITCH console.' };
    if (!s.loopPulled) return { pass: false, feedback: 'STP alone will block one port, but the rogue patch is a fault: pull the Gi0/3↔Gi0/4 loop link on the board.' };
    if (s.mc['stpRoot'] !== 'lowest') return { pass: false, feedback: 'Root-bridge question wrong — reread: the root bridge is the switch with the LOWEST bridge ID (priority + MAC), the referee all loop decisions hang off.' };
    return { pass: true, feedback: 'Storm killed: STP re-enabled, rogue patch pulled, root-bridge election explained. Diagnosis chain — MAC flapping → broadcast flood → disabled referee — is the exact N10-009 troubleshooting story.' };
  },
  'OBJ-H3': (s) => {
    const wrongAlerts = LAB.ALERTS.filter((a) => s.alertVerdicts[a.id] !== a.verdict).length;
    const parts = [];
    if (wrongAlerts > 0) parts.push(`alert stream ${LAB.ALERTS.length - wrongAlerts}/6 (needs 6/6)`);
    if (s.chain.q1 !== 'firewall') parts.push('Q1: who BLOCKED the 3389 scan?');
    if (s.chain.q2 !== 'ips') parts.push('Q2: who detected the SQLi?');
    if (s.chain.q3 !== 'inline') parts.push('Q3: which placement can block?');
    if (!s.sigTuned) parts.push('tune the noisy Apache signature');
    if (parts.length) return { pass: false, feedback: `Chain incomplete → ${parts.join(' · ')}. Think per control: what is DENIED at the FW never reaches sensors; the passive IDS only sees what the SPAN mirrors (core, not DMZ).` };
    return { pass: true, feedback: 'Full correlation: the firewall dropped the 3389 scan (implicit deny), the SQLi rode allowed 443 and was caught + dropped by the INLINE IPS, and the core IDS saw nothing because DMZ-bound traffic never crosses its SPAN. Then you silenced the banner noise instead of the sensor. That is multi-source analysis.' };
  },
  'OBJ-H4': (s) => {
    const w1 = s.storagePlan['w1'], w2 = s.storagePlan['w2'], w3 = s.storagePlan['w3'];
    if (!w1 || !w2 || !w3) return { pass: false, feedback: 'Answer all three workloads on the STORAGE board (class + protocol each).' };
    const parts = [];
    if (w1 !== 'nas-smb') parts.push('W1 editors = shared FILES over LAN → NAS + SMB');
    if (w2 !== 'san-iscsi') parts.push('W2 vSphere = raw BLOCK disks → SAN + iSCSI');
    if (w3 !== 'san-fc') parts.push('W3 analytics DB = lowest-latency blocks → SAN + Fibre Channel');
    if (parts.length) return { pass: false, feedback: `Storage audit → ${parts.join(' · ')}.` };
    return { pass: true, feedback: 'Storage tier approved: file-level over the LAN for humans, block-level over fabrics for machines — iSCSI for cost-effective blocks, FC where every microsecond is billed. One rule survives every exam: SHARE files → NAS; FEED disks → SAN.' };
  },
  'OBJ-H5': (s) => {
    const parts = [];
    if (s.wlPlan['warehouse'] !== 'bridge') parts.push('Warehouse B → bridge (wired-segment link)');
    if (s.wlPlan['dock'] !== 'extender') parts.push('dock → extender (client coverage)');
    if (s.wlPlan['mezzanine'] !== 'ap') parts.push('mezzanine → new AP on the controller (capacity)');
    if (!s.wireless.roaming) parts.push('controller roaming OFF');
    if (s.mc['extCost'] !== 'half') parts.push('extender-throughput question');
    if (parts.length) return { pass: false, feedback: `Wireless audit → ${parts.join(' · ')}.` };
    return { pass: true, feedback: 'Coverage solved with the right tool per problem: bridge for the un-cabled building, extender only for the dock gap (accepting the ~50% tax), a real AP for the busy mezzanine, and controller roaming so calls ride handoffs. Extenders are a last resort, never a link.' };
  },
  'OBJ-H6': (s) => {
    const parts = [];
    if (!s.lb.web3Drained) parts.push('drain WEB-03 out of rotation');
    if (s.lb.algorithm !== 'least-conn') parts.push('algorithm → least connections (uneven, long-lived requests)');
    if (!s.lb.persistence) parts.push('session persistence OFF (in-memory carts!)');
    if (s.mc['lbWhy'] !== 'session-bounce') parts.push('round-robin justification question');
    if (parts.length) return { pass: false, feedback: `Pool audit → ${parts.join(' · ')}.` };
    return { pass: true, feedback: 'Pool stabilized: failed WEB-03 drained by you (the health check would have, but you did not wait), least-connections respects request duration, persistence pins each buyer to their node\'s in-memory cart. Round robin would have bounced sessions mid-checkout.' };
  },
  'OBJ-H7': (s) => {
    const want = ['R-EST', 'R-DMZ-WEB', 'R-DENY-DMZDB', 'R-EGRESS-PROXY'];
    const parts = [];
    if (s.firewall.rules.includes('R-ANYANY') || s.firewall.rules.includes('R-STAFF-DMZDB')) parts.push('delete the toxic rules (any-any, staff→DB allow)');
    if (s.firewall.rules.join('|') !== want.join('|')) parts.push(`final order must be EST → WAN→DMZ web → DENY staff→DB → EGRESS-via-proxy (now: ${s.firewall.rules.length} rules)`);
    if (s.firewall.mode !== 'stateful') parts.push('mode → stateful');
    if (!s.firewall.dmzZone) parts.push('DMZ zone OFF');
    if (!s.firewall.proxyOnlyEgress) parts.push('egress-via-proxy OFF');
    if (parts.length) return { pass: false, feedback: `Rule-base audit → ${parts.join(' · ')}.` };
    return { pass: true, feedback: 'Rule base certified: toxic any-any and shadowed DB-allow deleted, established-first order restored, database explicitly shielded, egress pinned to the proxy. First-match-wins means ORDER is policy — you just proved it.' };
  },
  'OBJ-H8': (s) => {
    const parts = [];
    if (!s.proxies.denyList) parts.push('deny cdn-updates.example.tk on the proxy');
    if (!s.fwEgressBlock) parts.push('firewall egress block for 203.0.113.66');
    if (s.sensors.idsMode !== 'anomaly') parts.push('IDS → anomaly mode');
    if (s.mc['beacon'] !== 'anomaly') parts.push('detection-mode question');
    if (parts.length) return { pass: false, feedback: `Beacon response → ${parts.join(' · ')}. Layer it: stop the request, stop the destination, detect the NEXT one by behavior.` };
    return { pass: true, feedback: 'Beacon cut on three layers: proxy denies the C2 domain, firewall drops the IP outright, and anomaly mode now hunts machine-cadence deviations the signatures never knew. Defense in depth, egress edition.' };
  },
  'OBJ-H9': (s) => {
    const bad = LAB.SLOTS.filter((sl) => s.placements[sl.id] !== sl.accepts).map((sl) => sl.label);
    if (bad.length) return { pass: false, feedback: `Sign-off blocked — ${LAB.SLOTS.length - bad.length}/${LAB.SLOTS.length} slots correct. Wrong/empty: ${bad.slice(0, 6).join(', ')}${bad.length > 6 ? '…' : ''}.` };
    const parts = [];
    if (!swAll(s)) parts.push('switch console not fully commissioned (all 8)');
    if (s.firewall.mode !== 'stateful' || !s.firewall.dmzZone) parts.push('firewall stateful + DMZ');
    if (!s.lb.healthChecks) parts.push('LB health checks');
    if (!(s.proxies.fEnabled && s.proxies.fFilter && s.proxies.fCaching)) parts.push('forward proxy trio');
    if (!(s.proxies.rTls && s.proxies.rWaf)) parts.push('reverse proxy TLS+WAF');
    if (s.storage.nasProto !== 'smb' || s.storage.sanProto !== 'iscsi') parts.push('storage protocols (SMB / iSCSI)');
    if (!s.wireless.roaming || !s.wireless.autoProvision) parts.push('WLC roaming + auto-provision');
    if (!s.accessSwitch.portMirror) parts.push('SPAN feed');
    if (parts.length) return { pass: false, feedback: `Commissioning punch-list → ${parts.join(' · ')}.` };
    return { pass: true, feedback: 'SITE SIGNED OFF. 17 slots, every console, every policy — verified in one pass. You did not just read about networking appliances; you built, commissioned, defended and certified one. Take the bow.' };
  },
};

function evaluate(id, s) {
  const v = VALIDATORS[id];
  if (!v) return { pass: false, feedback: 'Validator not found.' };
  return v(s);
}

function objectivesFor(mode) {
  return LAB.OBJECTIVES.filter((o) => o.mode === mode);
}

// ── scoring (verbatim) ──
function score(s) {
  const mode = s.mode || 'medium';
  const objs = objectivesFor(mode);
  const objPassed = objs.filter((o) => s.objectives[o.id] && s.objectives[o.id].passed).length;
  const firstTry = objs.filter((o) => s.objectives[o.id] && s.objectives[o.id].passed && s.objectives[o.id].attempts === 1).length;
  const hintsTotal = objs.reduce((n, o) => n + ((s.objectives[o.id] && s.objectives[o.id].hintLevel) || 0), 0);
  const quizList = mode === 'medium' ? LAB.QUIZ_MEDIUM.map((q) => q.id) : LAB.QUIZ_HARD.map((q) => q.id);
  const answerOf = {};
  LAB.QUIZ_MEDIUM.concat(LAB.QUIZ_HARD).forEach((q) => { answerOf[q.id] = q.answer; });
  const quizCorrect = quizList.filter((q) => {
    const e = s.quiz[q];
    return !!e && e.checked && e.pick === answerOf[q];
  }).length;
  const objPct = objPassed / objs.length;
  const quizPct = quizList.length ? quizCorrect / quizList.length : 0;
  const overall = Math.round((0.6 * objPct + 0.4 * quizPct) * 100);
  const firstTryRate = objPassed ? firstTry / objPassed : 0;
  let stars = 1;
  if (firstTryRate >= 0.8 && hintsTotal <= 3 && quizPct >= 0.8) stars = 3;
  else if (firstTryRate >= 0.55 && hintsTotal <= 8 && quizPct >= 0.6) stars = 2;
  return { objPassed, objTotal: objs.length, objPct: Math.round(objPct * 100), firstTry, hintsTotal, quizCorrect, quizTotal: quizList.length, quizPct: Math.round(quizPct * 100), overall, stars };
}

window.evaluate = evaluate;
window.objectivesFor = objectivesFor;
window.score = score;
})();
