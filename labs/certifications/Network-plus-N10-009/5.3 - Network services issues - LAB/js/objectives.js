/* =====================================================================
   Atlas NOC Command Deck — js/objectives.js
   Mission board engine: 12 Medium + 9 Hard work orders (briefs, hints,
   validation rules), hint vault, CHECK RESULTS, scoring and stars.
   Objective content (briefs/hints/feedback) is embedded in OBJ_DEFS
   exactly as in the original lab — 1:1, not restructured.
   ===================================================================== */
'use strict';

/* ================= mission board: 12 Medium + 9 Hard objectives, validation, hints ================= */

/* Audit R6: display order must never reveal correct pairs — deterministic shuffles for every
   option list whose correct entries would otherwise cluster at fixed leading positions.
   Validation keys stay stable; only the rendered order is shuffled. */
const CONTROLS8_VIEW = shuffle(CONTROLS8, 1);
const CONTROLS10_VIEW = shuffle(CONTROLS10, 1);
const CAUSE3_VIEW = shuffle([['pool', 'Pool exhaustion'], ['vlan', 'Wrong port VLAN'], ['uplink', 'Uplink congestion']], 1);
const WHY3_VIEW = shuffle([
  ['blast', 'Site-wide egress is down for every department at peak — largest blast radius'],
  ['first', 'It was reported first'],
  ['router', 'Router problems always come before switch problems']], 1);
const H7MAP_VIEW = shuffle([['pool', 'Pool exhaustion'], ['storm', 'Broadcast storm'], ['route', 'Route loss / rollback surprises']], 1);
const H8OPTS_VIEW = shuffle([
  ['mask', 'Wrong subnet mask'], ['gw', 'Wrong gateway'], ['stp', 'STP loop / rogue root'], ['vlan', 'Wrong port VLAN'],
  ['acl', 'ACL lockdown'], ['pool', 'DHCP pool exhaustion'], ['route', 'Missing route'], ['rh', 'RED HERRING']], 1);


const OBJ_DEFS = {
  /* ---------------- MEDIUM ---------------- */
  M1: { mode:'M', pillar:'P1', title:'Triage the board', anchor:'rows 1–7 + methodology',
    brief:'Seven tickets, three fault domains. Assign each ticket to the domain its symptom lives in: SWITCHING (frames: STP/VLAN/ACL), ROUTING (paths between networks), ADDRESSING (leases, IP, mask, gateway).',
    hints:['Read each ticket for the layer it complains about: frame forwarding (switching), inter-network reachability (routing), host addressing (addressing).',
      'T1–T3 all describe Layer 2 forwarding problems. T4–T5 describe reachability between networks.',
      'Key: T1=SWITCHING, T2=SWITCHING, T3=SWITCHING, T4=ROUTING, T5=ROUTING, T6=ADDRESSING, T7=ADDRESSING.'],
    render(pane, id) {
      const opts = [['SW','SWITCHING'],['RT','ROUTING'],['AD','ADDRESSING']];
      pane.innerHTML = TICKETS.map(t => `<div class="mrow"><span class="mlabel"><b>${t.id}</b> ${esc(t.title)}</span>
        <select data-ans="${id}.${t.id}" aria-label="domain for ${t.id}"><option value="">—</option>${opts.map(o=>`<option value="${o[0]}">${o[1]}</option>`).join('')}</select></div>`).join('');
      bindSelects(pane, id);
      const a = S.ans[id] || {}; pane.querySelectorAll('select').forEach(s => { if (a[s.dataset.ans.split('.')[1]]) s.value = a[s.dataset.ans.split('.')[1]]; });
    },
    validate() {
      const key = { T1:'SW', T2:'SW', T3:'SW', T4:'RT', T5:'RT', T6:'AD', T7:'AD' };
      return mapCheck('M1', key, {
        ok:'Correct triage. Notice the shape of the deck: switching faults announce themselves with storms/APIPA-on-one-port, routing faults with reachability between subnets, addressing faults with wrong or missing host IPs. On the exam, classify first — it halves the search space.',
        bad:'Triage rationale: T1 (storm/STP) and T2 (VLAN assignment) are frame-forwarding → SWITCHING; T3 lives on the router\'s ACL applied to a switch SVI → SWITCHING per the N10-009 grouping; T4 (missing route) and T5 (missing default route) → ROUTING; T6 (pool exhaustion) and T7 (gateway/mask) → ADDRESSING.'
      });
    } },
  M2: { mode:'M', pillar:'P2', title:'Spot the loop signature in the log', anchor:'row 1: storm/MAC flapping',
    brief:'Broadcast storms and MAC flapping are the fingerprint of a Layer 2 loop. Open CORE-1 → LOG (or read below) and select EVERY line that indicates a loop.',
    hints:['Loops duplicate frames, so the same source MAC keeps appearing on different ports — and broadcast volume spikes.',
      'Look for MACFLAP entries, storm-control suppression, and rising input queue drops. Duplex, port-security and backup lines are unrelated.',
      'Correct: both MACFLAP lines, the STORM_CONTROL line, and the INPUT_DROPS line.'],
    render(pane, id) {
      const a = S.ans[id] || {};
      pane.innerHTML = '<div class="checklines">' + LOGS.core1.map((l, i) =>
        `<label class="mrow"><input type="checkbox" data-log="${i}" ${a['l' + i] ? 'checked' : ''}> <code style="font-size:11px">${esc(l)}</code></label>`).join('') + '</div>';
      pane.querySelectorAll('[data-log]').forEach(c => c.addEventListener('change', () => { getAns(id)['l' + c.dataset.log] = c.checked; save(); }));
    },
    validate() {
      const want = { l0:true, l1:true, l2:true, l3:true };
      const a = S.ans.M2 || {}; const got = {}; Object.keys(want).forEach(k => got[k] = !!a[k]);
      const allLogs = LOGS.core1.length;
      let extra = false; for (let i = 0; i < allLogs; i++) { if (a['l' + i] && !want['l' + i]) extra = true; }
      const ok = extra === false && Object.keys(want).every(k => got[k]);
      return { ok,
        okMsg:'Exactly. Duplicate frames force the switch to keep re-learning the same MAC on alternating ports (MACFLAP), storm-control throttles the broadcast flood, and input queues fill. Any two of these together = hunt for a loop before the VLAN melts.',
        failMsg: extra ? 'Some selected lines are real faults but not loop signatures (duplex mismatch, port-security, backup CPU) — they are distractors you WILL meet on the exam. The loop set is: MAC flapping (same MAC on alternating ports), storm-control suppression, and rising input queue drops.' : 'Select all loop signatures: both MACFLAP lines, STORM_CONTROL suppression, and INPUT_DROPS.' };
    } },
  M3: { mode:'M', pillar:'P4', title:'Reclaim the root bridge, stop the storm', anchor:'row 1: root election + STP repair',
    brief:'STP picks the root bridge by LOWEST bridge ID (priority, then MAC). Today an old training-closet switch is root — and the vendor switch is not even playing. Name the current root, then fix the tiering and the storm.',
    hints:['CORE-1 → show spanning-tree vlan 30 names the current root bridge.',
      'Root election: lowest bridge ID wins. Dropping CORE-1\'s priority below 32768 makes it root regardless of MACs.',
      'Set CORE-1 priority 24576; re-enable spanning-tree on SW-WH-2 (its config disables VLAN 30), or shut the rogue patch port.'],
    render(pane, id) {
      pane.innerHTML = `<div class="mrow"><span class="mlabel">1. Current VLAN 30 root bridge (per CORE-1 → SHOW)?</span>
        <select data-ans="${id}.root"><option value="">—</option><option>CORE-1</option><option>CORE-2</option><option>SW-TR-1</option><option>SW-WH-1</option><option>SW-WH-2</option></select></div>
        <div class="mrow"><span class="mlabel">2. Set the correct root (CORE-1 → CONFIG) and 3. stop the storm (SW-WH-2 → CONFIG).</span>
        <span class="tag ${S.env.core1Prio < 32768 ? 'green' : 'red'}">prio ${S.env.core1Prio}</span>
        <span class="tag ${withWarehouse(F()).stormCleared ? 'green' : 'red'}">storm ${withWarehouse(F()).stormCleared ? 'cleared' : 'ACTIVE'}</span></div>`;
      bindSelects(pane, id); restoreSelects(pane, id);
    },
    validate() {
      const a = S.ans.M3 || {}; const f = withWarehouse(F());
      const lines = [
        cl(a.root === 'SW-TR-1', 'root identified as SW-TR-1'),
        cl(S.env.core1Prio === 24576, 'CORE-1 priority set to 24576 (distribution tier owns the root)'),
        cl(f.stormCleared, 'storm cleared (STP re-enabled on SW-WH-2 or patch shut down)')
      ];
      return finish('M3', lines, 'Root bridge placement is a design decision: the root should be the most powerful, most central switch — the distribution tier. With CORE-1 at 24576, election is deterministic; with SW-WH-2 participating again, STP can finally SEE the redundant path and block it. Re-probe WH-SCAN→WMS: latency should drop from seconds to single-digit ms.',
        'The root today is SW-TR-1 (lowest MAC among participating bridges — a coincidence of aging hardware, and exactly how root-bridge theft happens in real networks). Set CORE-1 to 24576, re-enable STP on SW-WH-2, and the loop port will transition to blocking.');
    } },
  M4: { mode:'M', pillar:'P2', title:'Re-home the shipping office (VLANs)', anchor:'row 2: VLAN assignment + native VLAN',
    brief:'APIPA on exactly one group of ports is a VLAN-assignment smell. Move SW-WH-1 Fa0/10-18 into the correct VLAN, then fix the native VLAN mismatch CDP is complaining about.',
    hints:['SW-WH-1 → SHOW → show vlan brief: see which VLAN Fa0/10-18 live in today.',
      'VLAN 2 (OLD-OFFICE) has no SVI and no DHCP scope — that is why those clients sit on 169.254.x.x. Move the ports to VLAN 30 (WAREHOUSE).',
      'Then align the trunk native VLAN: CDP names both ends (SW-WH-1 Gi1/0/2 vs CORE-2 Gi1/0/24). Either side may move; both must agree.'],
    render(pane, id) {
      const f = F();
      pane.innerHTML = `<div class="mrow"><span class="mlabel">Shipping ports Fa0/10-18</span><span class="tag ${f.shipOk ? 'green' : 'red'}">VLAN ${S.env.shipVlan}</span>
        <button class="btn small" data-dev="swwh1">Open SW-WH-1 console</button></div>
        <div class="mrow"><span class="mlabel">Trunk native VLAN (SW-WH-1 Gi1/0/2 ↔ CORE-2 Gi1/0/24)</span>
        <span class="tag ${f.nativeOk ? 'green' : 'red'}">${S.env.nativeWh1} vs ${S.env.nativeCore2}</span>
        <button class="btn small" data-dev="core2">Open CORE-2 console</button></div>`;
      pane.querySelectorAll('[data-dev]').forEach(b => b.addEventListener('click', () => window.Lab.openDevice(b.dataset.dev)));
    },
    validate() {
      const f = F();
      const lines = [cl(f.shipOk, 'Fa0/10-18 in VLAN 30 (WAREHOUSE)'), cl(f.nativeOk, 'trunk native VLANs aligned')];
      return finish('M4', lines, 'An access port is a promise about broadcast domains: the wrong promise strands clients in a VLAN with no gateway and no DHCP scope — the symptom looks identical to DHCP failure, which is why you check the PORT first, then the server. Native VLAN mismatches do not always break traffic, but they silently leak untagged frames between VLANs and upset management traffic — pin both ends to an unused native VLAN and log it as standard.',
        'Shipping ports still sit in VLAN 2 — a VLAN whose SVI was removed and which has no DHCP scope, so clients APIPA. Set Fa0/10-18 to VLAN 30 on SW-WH-1, and make the trunk native VLANs agree (SW-WH-1 Gi1/0/2 and CORE-2 Gi1/0/24).');
    } },
  M5: { mode:'M', pillar:'P2', title:'Unblock finance, keep the lockdown', anchor:'row 3: ACL order + hit counters',
    brief:'FINLOCK on RTR-CORE protects HR-SRV (10.10.50.20): finance and the servers subnet may reach it, everyone else is denied. Find which entry actually blocks finance and fix it — WITHOUT removing the intended control.',
    hints:['RTR-CORE → SHOW → show access-lists. The match counters prove which line the finance packets die on.',
      'Read seq 10 literally: it DENIES 10.10.60.0/24 (finance) to HR-SRV. The security team meant to permit it.',
      'Change seq 10 action to permit. Seq 20 (servers) and seq 30 (deny any) must stay — deleting the ACL would also delete the intended protection.'],
    render(pane, id) {
      pane.innerHTML = `<div class="mrow"><span class="mlabel">Which FINLOCK entry is dropping finance→HR-SRV?</span>
        <select data-ans="${id}.culprit"><option value="">—</option><option value="seq10">seq 10 (10.10.60.0/24)</option><option value="seq20">seq 20 (10.10.50.0/24)</option><option value="seq30">seq 30 (deny any)</option></select>
        <button class="btn small" data-dev="rtrcore">Open RTR-CORE console</button></div>
        <div class="mrow"><span class="mlabel">ACL state</span><span class="tag ${F().finOk ? 'green' : 'red'}">finance ${F().finOk ? 'permitted' : 'denied'}</span>
        <span class="tag ${F().aclIntact ? 'green' : 'red'}">lockdown ${F().aclIntact ? 'intact' : 'broken/removed'}</span></div>`;
      bindSelects(pane, id); restoreSelects(pane, id);
      pane.querySelectorAll('[data-dev]').forEach(b => b.addEventListener('click', () => window.Lab.openDevice(b.dataset.dev)));
    },
    validate() {
      const a = S.ans.M5 || {}; const f = F();
      if (S.env.acl.applied === false) return { ok:false, failMsg:'You removed the whole ACL — that "fixes" finance by exposing HR-SRV to EVERY department and site. The exam (and your CISO) call this a control-deletion failure: change the one wrong entry instead.' };
      const lines = [cl(a.culprit === 'seq10', 'culprit identified: seq 10'), cl(f.finOk, 'seq 10 now permits finance'), cl(f.aclIntact, 'seq 20 + seq 30 intact — lockdown preserved')];
      return finish('M5', lines, 'ACLs process top-down, first match wins, and an implicit deny waits at the end. Match counters are your lie detector: 214 hits on seq 10 while finance complains = the smoking gun. The intended policy needed permit-finance, permit-servers, deny-any — one wrong action word turned a protection into an outage. Never delete a control to make a symptom disappear.',
        'The counters on seq 10 climb with every finance attempt: it literally says deny for 10.10.60.0/24 → HR-SRV. Change its action to permit — and leave seq 20/30 in place, they ARE the policy.');
    } },
  M6: { mode:'M', pillar:'P3', title:'Rebuild the branch route', anchor:'row 4: routing table',
    brief:'Branch cannot open anything at HQ. Traceroute from BR-PC-01 toward WMS-SRV, read where the path dies, and repair RTR-CORE\'s routing table.',
    hints:['Probe: traceroute BR-PC-01 → WMS-SRV. Note where the stars begin and read the annotation.',
      'Requests reach HQ but replies die at RTR-CORE — it has no route back to 10.20.10.0/24 (lost in Sunday\'s route cleanup).',
      'RTR-CORE → CONFIG → add: ip route 10.20.10.0 255.255.255.0 via 10.255.0.6. (That 10.99.0.0/16 entry pointing at .9 is a stale decoy — different problem, note it for the After-Action.)'],
    render(pane, id) {
      pane.innerHTML = `<div class="mrow"><span class="mlabel">Route 10.20.10.0/24 on RTR-CORE</span>
        <span class="tag ${S.env.coreBranchRoute ? 'green' : 'red'}">${S.env.coreBranchRoute ? 'installed via 10.255.0.6' : 'MISSING'}</span>
        <button class="btn small" data-dev="rtrcore">Open RTR-CORE console</button></div>
        <div class="mrow"><button class="btn small" id="m6probe">Run traceroute BR-PC→WMS</button></div>`;
      restoreSelects(pane, id);
      pane.querySelector('#m6probe').addEventListener('click', () => { $('probeSrc').value = 'brpc'; $('probeType').value = 'trace'; $('probeDst').value = 'wms'; $('probeSrc').dispatchEvent(new Event('change')); runProbe(); });
      pane.querySelectorAll('[data-dev]').forEach(b => b.addEventListener('click', () => window.Lab.openDevice(b.dataset.dev)));
    },
    validate() {
      const lines = [cl(!!S.env.coreBranchRoute, 'ip route 10.20.10.0 255.255.255.0 10.255.0.6 present on RTR-CORE')];
      return finish('M6', lines, 'Routing tables only know what they are told. A missing route is invisible until someone needs that path — and the failure is ASYMMETRIC: requests flowed fine (BR-RTR still had its route to 10.10.0.0/16), replies died at the first router that lacked a return route. "Ping fails but the first hops look clean" is the classic signature of a one-way table.',
        'RTR-CORE lost its static route to the branch subnet during the cleanup script. Re-add ip route 10.20.10.0 255.255.255.0 10.255.0.6 (the BR-RTR end of the WAN /30).');
    } },
  M7: { mode:'M', pillar:'P3', title:'Restore the road to the internet', anchor:'row 5: default route',
    brief:'Internal apps work, the internet is gone for every site. Walk the path to 8.8.8.8, find the hop that drops it, and put the missing route back.',
    hints:['Probe: traceroute HQ-PC-12 → INTERNET. The trace stops right after the edge.',
      'EDGE-RTR → SHOW → show ip route: "Gateway of last resort is NOT SET" — Sunday\'s rollback ate the default route.',
      'EDGE-RTR → CONFIG → add: ip route 0.0.0.0 0.0.0.0 203.0.113.1.'],
    render(pane, id) {
      pane.innerHTML = `<div class="mrow"><span class="mlabel">Default route on EDGE-RTR</span>
        <span class="tag ${S.env.edgeDefault ? 'green' : 'red'}">${S.env.edgeDefault ? '0.0.0.0/0 via 203.0.113.1' : 'NOT SET'}</span>
        <button class="btn small" data-dev="edge">Open EDGE-RTR console</button></div>
        <div class="mrow"><button class="btn small" id="m7probe">Run traceroute HQ→INTERNET</button></div>`;
      pane.querySelector('#m7probe').addEventListener('click', () => { $('probeSrc').value = 'hqpc'; $('probeType').value = 'trace'; $('probeDst').value = 'net'; $('probeSrc').dispatchEvent(new Event('change')); runProbe(); });
      pane.querySelectorAll('[data-dev]').forEach(b => b.addEventListener('click', () => window.Lab.openDevice(b.dataset.dev)));
    },
    validate() {
      const lines = [cl(!!S.env.edgeDefault, 'ip route 0.0.0.0 0.0.0.0 203.0.113.1 present on EDGE-RTR')];
      return finish('M7', lines, 'A default route is the router\'s "everything else goes here" entry — 0.0.0.0/0 matches every destination that nothing more-specific covers. Its loss is unmistakable: everything INTERNAL works (specific routes still exist), everything EXTERNAL dies at the edge. Rollbacks are the classic killer: restoring an old config silently deletes routes added since.',
        'The failover-test rollback restored an older EDGE-RTR config — the default route was never re-added. Install ip route 0.0.0.0 0.0.0.0 203.0.113.1.');
    } },
  M8: { mode:'M', pillar:'P2', title:'Decongest the training pool', anchor:'row 6: address pool exhaustion',
    brief:'Onboarding day: 130 laptops, but POOL-TRAIN keeps saying no. Diagnose the root cause from the DHCP console evidence, then size the scope and the lease correctly.',
    hints:['SRV-DHCP → POOLS: compare POOL-TRAIN capacity with today\'s population.',
      'A /25 yields 126 usable minus the gateway = 125 assignable leases. Demand is 130 — and a 7-day lease keeps departed clients bound.',
      'Expand the scope to 10.10.40.0/24 (253 assignable) and cut the lease to a day or less.'],
    render(pane, id) {
      pane.innerHTML = `<div class="mrow"><span class="mlabel">Root cause</span>
        <select data-ans="${id}.cause"><option value="">—</option>${CAUSE3_VIEW.map(o => `<option value="${o[0]}">${o[1]}</option>`).join('')}</select></div>
        <div class="mrow"><span class="mlabel">POOL-TRAIN</span><span class="tag ${S.env.dhcp.bits === 24 ? 'green' : 'red'}">10.10.40.0/${S.env.dhcp.bits}</span>
        <span class="tag ${S.env.dhcp.leaseH <= 24 ? 'green' : 'red'}">lease ${S.env.dhcp.leaseH}h</span>
        <button class="btn small" data-dev="dhcp">Open DHCP console</button></div>`;
      bindSelects(pane, id); restoreSelects(pane, id);
      pane.querySelectorAll('[data-dev]').forEach(b => b.addEventListener('click', () => window.Lab.openDevice(b.dataset.dev)));
    },
    validate() {
      const a = S.ans.M8 || {}; const f = F();
      const lines = [cl(a.cause === 'pool', 'cause: pool exhaustion (not VLAN, not congestion)'),
        cl(S.env.dhcp.bits === 24, 'scope expanded to 10.10.40.0/24 (253 assignable ≥ 130 demand)'),
        cl(S.env.dhcp.leaseH <= 24, 'lease shortened to ≤ 24 h')];
      return finish('M8', lines, 'DHCP capacity math is exam-favorite: a /26 holds 62 hosts, a /25 holds 126, a /24 holds 254 (minus network, broadcast, gateway). Lease time is the other half of capacity: 7-day leases mean a departed laptop still owns its address for a week. Short leases for volatile populations, utilization alerts at ~85%, and you never meet this outage again.',
        'POOL-TRAIN is a /25: 126 usable − 1 gateway = 125 assignable, against 130 laptops, with 7-day leases pinning stale clients. Expand to /24 and shorten the lease.');
    } },
  M9: { mode:'M', pillar:'P2', title:'Right-size two static hosts', anchor:'row 7: wrong gateway / mask',
    brief:'Two static configurations, two classic errors. Diagnose each from its ipconfig + symptom, then correct them: WMS-SRV (warehouse terminal cannot reach it — but pings from its own subnet work) and CFO-PC (reaches nothing at all).',
    hints:['If same-subnet pings reach a server but cross-subnet pings die, the server\'s GATEWAY is lying.',
      'A /28 mask makes the host believe its subnet is 10.10.60.16-31 — gateway 10.10.60.1 is outside that range, so it cannot even ARP for it.',
      'WMS gateway → 10.10.50.1. CFO mask → 255.255.255.0 (/24).'],
    render(pane, id) {
      pane.innerHTML = `<div class="mrow"><span class="mlabel">WMS-SRV diagnosis</span>
        <select data-ans="${id}.wmsDiag"><option value="">—</option><option value="gw">Wrong default gateway</option><option value="mask">Wrong subnet mask</option><option value="ip">Wrong IP address</option><option value="ok">Working as designed</option></select>
        <span class="tag ${F().wmsOk ? 'green' : 'red'}">gw ${esc(S.env.wmsGw)}</span>
        <button class="btn small" data-dev="wms">Open console</button></div>
        <div class="mrow"><span class="mlabel">CFO-PC diagnosis</span>
        <select data-ans="${id}.cfoDiag"><option value="">—</option><option value="gw">Wrong default gateway</option><option value="mask">Wrong subnet mask</option><option value="ip">Wrong IP address</option><option value="ok">Working as designed</option></select>
        <span class="tag ${F().cfoOk ? 'green' : 'red'}">mask /${S.env.cfoMask}</span>
        <button class="btn small" data-dev="cfo">Open console</button></div>`;
      bindSelects(pane, id); restoreSelects(pane, id);
      pane.querySelectorAll('[data-dev]').forEach(b => b.addEventListener('click', () => window.Lab.openDevice(b.dataset.dev)));
    },
    validate() {
      const a = S.ans.M9 || {}; const f = F();
      const lines = [cl(a.wmsDiag === 'gw', 'WMS diagnosis: wrong gateway'), cl(a.cfoDiag === 'mask', 'CFO diagnosis: wrong mask'),
        cl(f.wmsOk, 'WMS gateway corrected to 10.10.50.1'), cl(f.cfoOk, 'CFO mask corrected to 255.255.255.0')];
      return finish('M9', lines, 'Memorize the two signatures: (1) REACHABLE-locally-but-not-remotely = the target\'s gateway is wrong (its replies cannot leave the subnet); (2) cannot-reach-EVEN-the-gateway = the mask is wrong (the host is ARPing for a gateway it believes is remote). The subnet mask defines what "local" means — every static-IP change deserves a mask/gateway double-check.',
        'WMS replies to other subnets die at gateway 10.10.50.254 (nothing listens there — the SVI is .1). The CFO\'s /28 mask carves her onto 10.10.60.16-31, excluding her own gateway. Fix: gateway 10.10.50.1; mask 255.255.255.0.');
    } },
  M10: { mode:'M', pillar:'P3', title:'Run the end-of-shift verification sweep', anchor:'rows 1–7: synthesis',
    brief:'Fixes without verification are hopes. The sweep fires six probes covering every fault family of this shift. Make all six paths healthy.',
    hints:['Run the sweep below and watch the event log.',
      'Any FAIL names the subsystem still broken — work the tickets in the rail.',
      'All six green needs: EDGE default route, FINLOCK seq10 permit, WMS gateway, shipping VLAN 30, pool space, branch route.'],
    render(pane, id) {
      const f = withWarehouse(F());
      pane.innerHTML = `<div class="mrow"><button class="btn primary" id="m10sweep">Run verification sweep (6 probes)</button>
        <span class="tag ${S.sweep.run ? (S.sweep.pass ? 'green' : 'red') : 'grey'}">${S.sweep.run ? (S.sweep.pass ? '6/6 healthy' : 'faults remain') : 'not run yet'}</span></div>
        <div class="checklines" id="m10lines"></div>`;
      pane.querySelector('#m10sweep').addEventListener('click', () => {
        const okr = runSweep();
        checkObjective('M10');
        toast(okr ? 'Sweep: all paths healthy' : 'Sweep: outstanding faults — see event log');
      });
    },
    validate() {
      const f = withWarehouse(F());
      const lines = [
        cl(f.internetUp, 'internet path (EDGE default route)'),
        cl(f.finOk, 'finance → HR-SRV (FINLOCK)'),
        cl(f.wmsOk, 'scanner → WMS (gateway)'),
        cl(f.shipHasLease, 'shipping office DHCP (VLAN)'),
        cl(f.trainHasLease, 'training DHCP (pool space)'),
        cl(f.branchUp, 'branch ↔ HQ (routing table)')
      ];
      const ok = S.sweep.run && lines.every(l => l.ok);
      return { ok, okMsg:'Six for six. This sweep IS the exam\'s last step: after any change, re-verify the WHOLE path, not just the ticket you touched — fixes routinely break neighbors, and the sweep is how you notice.', failMsg:'The sweep only passes when every fault family is fixed: default route, FINLOCK, WMS gateway, shipping VLAN, pool space, branch route. Keep working the rail.' , lines };
    } },
  M11: { mode:'M', pillar:'P1', title:'Walk the troubleshooting methodology', anchor:'row 8: N10-009 5.1 carry-in',
    brief:'You have been improvising this order all shift — now formalize it. Rebuild the CompTIA 7-step troubleshooting methodology: click chips in order.',
    hints:['It starts with identifying the problem and ends after the fix is verified.',
      'Between them: theory → test theory → plan → implement-or-escalate.',
      'Order: identify problem, establish theory, test theory, plan of action, implement (or escalate), verify functionality, document findings.'],
    render(pane, id) { renderOrder(pane, id, STEPS7, [5, 0, 3, 6, 1, 4, 2]); },
    validate() {
      const a = (S.ans.M11 || {}).seq || [];
      const ok = a.length === 7 && a.every((v, i) => v === i);
      return { ok, okMsg:'This is the skeleton under every ticket you just closed. Note step 3\'s escape hatch — if the theory fails, build a NEW theory, do not re-test the old one — and step 7: documentation is what turned this weekend\'s rollback into a mystery instead of a five-minute fix.', failMsg:'Correct order: 1) identify the problem, 2) establish a theory of probable cause, 3) test the theory, 4) establish a plan of action, 5) implement or escalate, 6) verify full functionality, 7) document findings.' };
    } },
  M12: { mode:'M', pillar:'P4', title:'Harden the deck (prevention mapping)', anchor:'row 9: mitigations',
    brief:'The shift repeats itself unless the design changes. Map each incident class below to the control that would have prevented it.',
    hints:['Match the failure mode, not the vendor: loops need frame-rate suppression + BPDU policing; root instability needs an election plan.',
      'Addressing incidents need visibility (alerts, registers), not bigger pipes.',
      'Storm → storm control + BPDU guard. Root → priority plan. Pool → alert + short leases. Static typos → IP register / DHCP-first.'],
    render(pane, id) {
      const rows = [['storm', 'Broadcast storm / rogue loop (T1)'], ['root', 'Root bridge in a closet (T1b)'], ['pool', 'DHCP pool exhaustion (T6)'], ['static', 'Static host typos (T7)']];
      pane.innerHTML = rows.map(r => `<div class="mrow"><span class="mlabel">${r[1]}</span>
        <select data-ans="${id}.${r[0]}" style="max-width:340px"><option value="">—</option>${CONTROLS8_VIEW.map(c => `<option value="${c[0]}">${c[1]}</option>`).join('')}</select></div>`).join('');
      bindSelects(pane, id); restoreSelects(pane, id);
    },
    validate() {
      const key = { storm:'sc', root:'rb', pool:'dh', static:'ip' };
      return mapCheck('M12', key, {
        ok:'Prevention is design, not vigilance. Storm control caps broadcast rates; BPDU guard err-disables any access port that starts speaking BPDUs (a switch in disguise); a priority plan makes root election deterministic; utilization alerts fire while there is still headroom; an IP register / DHCP-first policy removes the human typo from the loop.',
        bad:'Correct mapping: storm → storm control + BPDU guard; rogue root → priority plan (distribution = primary); pool exhaustion → 85% utilization alert + short leases; static typos → IP address register / DHCP-first policy. The 10G upgrade and flat-VLAN options are expensive non-sequiturs.'
      });
    } },

  /* ---------------- HARD ---------------- */
  H1: { mode:'H', pillar:'P1', title:'Bridge up: triage under fire', anchor:'rows 1+4+5+6',
    brief:'06:58. Three incidents land at once: (A) all sites lose the internet, (B) warehouse floor is drowning in a broadcast storm, (C) onboarding laptops show 169.254.x.x. Order them by business impact for Atlas at peak, justify your #1, then fix all three root causes.',
    hints:['Rank by blast radius at peak: site-wide egress > revenue-generating floor > onboarding room.'],
    render(pane, id) {
      const f = withWarehouse(F());
      const items = ['A · Internet down at all sites', 'B · Broadcast storm on warehouse VLAN', 'C · Onboarding laptops APIPA'];
      renderOrder(pane, id, items, [1, 2, 0]);
      pane.insertAdjacentHTML('beforeend', `<div class="mrow"><span class="mlabel">Why is your #1 first?</span>
        <select data-ans="${id}.why" style="max-width:420px"><option value="">—</option>
        ${WHY3_VIEW.map(o => `<option value="${o[0]}">${o[1]}</option>`).join('')}</select></div>
        <div class="mrow"><span class="mlabel">Fix state</span>
        <span class="tag ${f.internetUp ? 'green' : 'red'}">internet</span>
        <span class="tag ${f.stormCleared ? 'green' : 'red'}">storm</span>
        <span class="tag ${f.trainOk ? 'green' : 'red'}">pool</span></div>`);
      bindSelects(pane, id); restoreSelects(pane, id);
    },
    validate() {
      const a = S.ans.H1 || {}; const f = withWarehouse(F());
      const seq = a.seq || [];
      const lines = [cl(seq.length === 3 && seq[0] === 2 && seq[1] === 0 && seq[2] === 1, 'priority: internet > storm > onboarding pool'),
        cl(a.why === 'blast', '#1 justified by blast radius'),
        cl(f.internetUp, 'internet restored (EDGE default route)'),
        cl(f.stormCleared, 'storm cleared'),
        cl(f.trainOk, 'pool sized + lease shortened')];
      return finish('H1', lines, 'Triage is a business calculation: egress outage stops every order at peak (blast radius: everything); the storm halts fulfillment (blast radius: revenue-critical but narrower); the onboarding room costs an HR morning. Impact first, effort second — the exam words it "identify the problem, including impact".',
        'Expected: A (internet) first — everyone, at peak. B (storm) second — the fulfillment floor stops shipping. C (pool) third. #1 is justified by blast radius, not by who shouted loudest. Then fix all three root causes.');
    } },
  H2: { mode:'H', pillar:'P2', title:'Root-cause the storm, port by port', anchor:'row 1: STP internals',
    brief:'Prove you can read a spanning tree. Answer all three questions from the evidence, then apply the full fix: correct root, STP restored, and the rogue patch neutralized.',
    hints:['Read SW-WH-2\'s running-config: what did the vendor disable? Election = priority, then lowest MAC — but only among bridges that participate.'],
    render(pane, id) {
      const f = withWarehouse(F());
      pane.innerHTML = `<div class="mrow"><span class="mlabel">1. Current VLAN 30 root</span>
        <select data-ans="${id}.root"><option value="">—</option><option>CORE-1</option><option>CORE-2</option><option>SW-TR-1</option><option>SW-WH-1</option><option>SW-WH-2</option></select></div>
        <div class="mrow"><span class="mlabel">2. SW-WH-2 has the lowest MAC (aabb.cc00.0110) — why is it NOT root?</span>
        <select data-ans="${id}.why" style="max-width:460px"><option value="">—</option>
        <option value="mac">Lowest MAC never wins an election</option>
        <option value="off">It is not participating: spanning tree is disabled for VLAN 30 in its config</option>
        <option value="access">Access switches can never become root</option></select></div>
        <div class="mrow"><span class="mlabel">3. Once STP runs again with CORE-1 as root, which port blocks?</span>
        <select data-ans="${id}.blk"><option value="">—</option><option>CORE-1 Gi1/0/5</option><option>SW-WH-1 Gi1/0/23 (patch end)</option><option>SW-WH-2 Gi0/3 (patch end)</option><option>SW-TR-1 Gi1/0/1</option></select></div>
        <div class="mrow"><span class="mlabel">Fix state</span>
        <span class="tag ${S.env.core1Prio === 24576 ? 'green' : 'red'}">prio ${S.env.core1Prio}</span>
        <span class="tag ${S.env.wh2StpOn ? 'green' : 'red'}">STP on WH-2</span>
        <span class="tag ${(S.env.wh1PatchDown || S.env.wh2PatchDown) ? 'green' : 'red'}">patch shut</span></div>`;
      bindSelects(pane, id); restoreSelects(pane, id);
    },
    validate() {
      const a = S.ans.H2 || {}; const f = withWarehouse(F());
      const lines = [cl(a.root === 'SW-TR-1', 'current root: SW-TR-1'),
        cl(a.why === 'off', 'WH-2 not root because STP is disabled (non-participant)'),
        cl(a.blk === 'SW-WH-1 Gi1/0/23 (patch end)', 'blocking port: SW-WH-1 Gi1/0/23'),
        cl(S.env.core1Prio === 24576 && S.env.wh2StpOn, 'CORE-1 root at 24576 with WH-2 participating'),
        cl(S.env.wh1PatchDown || S.env.wh2PatchDown, 'rogue patch shut down')];
      return finish('H2', lines, 'On the WH1–WH2 link both bridges sit at root-path-cost 4, so the tie breaks on lower bridge ID: SW-WH-2 (…0110) is designated, and SW-WH-1\'s patch port Gi1/0/23 goes ALTN/BLK. Blocking at the patch end is also operationally correct: that cable should not exist at all, so shut it and let BPDU guard police the future.',
        'Root is SW-TR-1 (lowest MAC among PARTICIPATING bridges). WH-2 cannot win while `no spanning-tree vlan 30` removes it from the election. With STP restored and CORE-1 at 24576, the patch blocks at the SW-WH-1 end (Gi1/0/23) — WH-2 has the lower MAC on that link, so its side is designated. Set the priority, re-enable STP, and shut the patch.');
    } },
  H3: { mode:'H', pillar:'P2', title:'The APIPA twins', anchor:'rows 2+6: same symptom, two causes',
    brief:'Shipping office AND training room both show 169.254.x.x — identical symptom, different disease. Diagnose each from its own evidence (DHCP pool stats vs port VLAN table), then fix both. Choosing "expand the pool" for the shipping office is a trap.',
    hints:['Both rooms show 169.254.x.x, but the evidence differs: one scope is genuinely full; the other ports sit in a VLAN with no scope at all.'],
    render(pane, id) {
      const f = F();
      pane.innerHTML = `<div class="mrow"><span class="mlabel">Training room (POOL-TRAIN 125/125 used, ports correctly in VLAN 40)</span>
        <select data-ans="${id}.train"><option value="">—</option><option value="pool">DHCP pool exhaustion</option><option value="vlan">Wrong port VLAN</option><option value="uplink">Uplink congestion</option></select></div>
        <div class="mrow"><span class="mlabel">Shipping office (POOL-WH shows 96/253 used; Fa0/10-18 sit in VLAN 2 — no SVI, no scope)</span>
        <select data-ans="${id}.ship"><option value="">—</option><option value="pool">DHCP pool exhaustion</option><option value="vlan">Wrong port VLAN</option><option value="uplink">Uplink congestion</option></select></div>
        <div class="mrow"><span class="mlabel">Fix state</span><span class="tag ${f.trainOk ? 'green' : 'red'}">pool /24 + short lease</span>
        <span class="tag ${f.shipOk ? 'green' : 'red'}">shipping ports VLAN 30</span></div>`;
      bindSelects(pane, id); restoreSelects(pane, id);
    },
    validate() {
      const a = S.ans.H3 || {}; const f = F();
      const lines = [cl(a.train === 'pool', 'training: pool exhaustion'), cl(a.ship === 'vlan', 'shipping: wrong port VLAN'),
        cl(f.trainOk, 'training fixed (/24 + short lease)'), cl(f.shipOk, 'shipping fixed (VLAN 30)'),
        cl(f.nativeOk, 'trunk native VLAN aligned (ticket T2 second clue)')];
      return finish('H3', lines, 'This is the exam\'s favorite shell game: APIPA means "the host got no lease" — it says nothing about WHY. Capacity (125/125) and scope existence (no scope for VLAN 2) are different failures with different owners and different fixes. Evidence per room, diagnosis per room — and ticket T2\'s CDP log reminds you the trunk native VLAN still needs aligning.',
        'Training = exhaustion: 125 assignable against 130 laptops with 7-day leases. Shipping = assignment: POOL-WH has 157 free addresses, but those ports sit in VLAN 2, which has neither an SVI nor a scope — expanding any pool would fix nothing there. Then align the trunk native VLANs named by CDP (SW-WH-1 Gi1/0/2 ↔ CORE-2 Gi1/0/24) to close ticket T2.');
    } },
  H4: { mode:'H', pillar:'P4', title:'Rewrite FINLOCK properly', anchor:'row 3: ACL design',
    brief:'Policy, confirmed by the security office: HR-SRV (10.10.50.20) is reachable by FINANCE, by BRANCH ACCOUNTING (10.20.10.0/24), and by the SERVERS subnet — everyone else is denied. Rebuild FINLOCK with exactly four entries in the correct order, still applied OUT on Vlan50.',
    hints:['Order matters: permits first (finance, branch, servers), the deny ANY last — the first match wins.'],
    render(pane, id) {
      pane.innerHTML = `<div class="mrow"><span class="mlabel">Edit the ACL in RTR-CORE → CONFIG → ACL FINLOCK (add the branch permit; set actions/sources; dst stays host 10.10.50.20).</span>
        <button class="btn small" data-dev="rtrcore">Open RTR-CORE console</button></div>
        <div class="checklines">${S.env.acl.entries.map(e2 => `<div>seq ${e2.seq}: ${e2.action} ip ${e2.src} → host 10.10.50.20</div>`).join('')}
        <div class="${S.env.acl.applied ? 'cl-ok' : 'cl-bad'}">applied: ${S.env.acl.applied ? 'OUT on Vlan50' : 'REMOVED'}</div></div>`;
      pane.querySelectorAll('[data-dev]').forEach(b => b.addEventListener('click', () => window.Lab.openDevice(b.dataset.dev)));
    },
    validate() {
      const en = S.env.acl.entries;
      const want = [
        { seq: 10, action: 'permit', src: '10.10.60.0/24' },
        { seq: 15, action: 'permit', src: '10.20.10.0/24' },
        { seq: 20, action: 'permit', src: '10.10.50.0/24' },
        { seq: 30, action: 'deny', src: 'any' }
      ];
      const exact = en.length === 4 && want.every((w, i) => en[i] && en[i].seq === w.seq && en[i].action === w.action && en[i].src === w.src);
      const lines = [cl(S.env.acl.applied, 'still applied OUT on Vlan50'), cl(exact, 'exactly 4 entries: permit finance, permit branch, permit servers, deny any — in that order')];
      return finish('H4', lines, 'A well-formed ACL reads like the policy sentence it implements: the three permits state WHO may enter, the deny any closes the door, and the implicit deny stands behind it as insurance. Order is load-bearing — put deny any first and all three permits become dead entries; a missing branch permit would break payroll for the branch the moment you fixed T4\'s route.',
        'Target shape: 10 permit ip 10.10.60.0/24 · 15 permit ip 10.20.10.0/24 · 20 permit ip 10.10.50.0/24 · 30 deny ip any — all to host 10.10.50.20, applied OUT on Vlan50. Use Add entry for the branch permit and set each action/source.');
    } },
  H5: { mode:'H', pillar:'P3', title:'Routing-table audit', anchor:'rows 4+5: routes + asymmetry',
    brief:'The table on RTR-CORE contains two problems and one lie. Restore the branch route, restore the EDGE default route, remove the stale entry — and explain why the branch traceroute died AT the core.',
    hints:['Three things wrong: two routes missing, one route a lie. And remember — replies need a route home too.'],
    render(pane, id) {
      pane.innerHTML = `<div class="mrow"><span class="mlabel">Route state</span>
        <span class="tag ${S.env.coreBranchRoute ? 'green' : 'red'}">branch route</span>
        <span class="tag ${S.env.edgeDefault ? 'green' : 'red'}">EDGE default</span>
        <span class="tag ${!S.env.staleRoute ? 'green' : 'red'}">stale 10.99/16 ${S.env.staleRoute ? 'present' : 'removed'}</span>
        <button class="btn small" data-dev="rtrcore">RTR-CORE</button><button class="btn small" data-dev="edge">EDGE-RTR</button></div>
        <div class="mrow"><span class="mlabel">Why did traceroute from BR-PC-01 die after the core hop?</span>
        <select data-ans="${id}.why" style="max-width:460px"><option value="">—</option>
        <option value="out">The request died on the way out, at BR-RTR</option>
        <option value="ret">The request reached HQ, but replies died at RTR-CORE — it has no return route to 10.20.10.0/24</option>
        <option value="dns">Branch DNS was broken</option></select></div>`;
      bindSelects(pane, id); restoreSelects(pane, id);
      pane.querySelectorAll('[data-dev]').forEach(b => b.addEventListener('click', () => window.Lab.openDevice(b.dataset.dev)));
    },
    validate() {
      const a = S.ans.H5 || {};
      const lines = [cl(!!S.env.coreBranchRoute, 'branch route installed'), cl(!!S.env.edgeDefault, 'EDGE default restored'),
        cl(!S.env.staleRoute, 'stale 10.99.0.0/16 removed'), cl(a.why === 'ret', 'asymmetry explained: return path')];
      return finish('H5', lines, 'Route audits are hygiene: a stale route pointing at a dead next-hop silently blackholes any future traffic to 10.99.0.0/16, and no alarm fires because nothing uses it today. And the asymmetry lesson is the deepest of the shift: reachability is a ROUND TRIP — check both tables.',
        'Missing: branch route on RTR-CORE, default on EDGE-RTR. The lie: 10.99.0.0/16 via 10.255.0.9 — a decommissioned lab network pointing at a dead hop. The trace died mid-path because replies had no route home at RTR-CORE.');
    } },
  H6: { mode:'H', pillar:'P2', title:'Three statics, three faults', anchor:'row 7: gateway / mask / wrong IP',
    brief:'Three hosts, three DIFFERENT static-configuration faults. From the symptom text and each ipconfig only, diagnose and fix: WMS-SRV (scanner cannot open WMS; pings from its own subnet work), CFO-PC (reaches nothing at all), NEW-HIRE-PC (onboarding; ARP for its gateway never answers).',
    hints:['One host cannot leave its /28; one replies through a dead gateway; one is wearing another VLAN\'s address.'],
    render(pane, id) {
      pane.innerHTML = `<div class="mrow"><span class="mlabel">WMS-SRV</span>
        <select data-ans="${id}.wms"><option value="">—</option><option value="gw">Wrong gateway</option><option value="mask">Wrong mask</option><option value="ip">Wrong IP</option><option value="ok">Fine</option></select>
        <span class="tag ${F().wmsOk ? 'green' : 'red'}">gw ${esc(S.env.wmsGw)}</span><button class="btn small" data-dev="wms">console</button></div>
        <div class="mrow"><span class="mlabel">CFO-PC</span>
        <select data-ans="${id}.cfo"><option value="">—</option><option value="gw">Wrong gateway</option><option value="mask">Wrong mask</option><option value="ip">Wrong IP</option><option value="ok">Fine</option></select>
        <span class="tag ${F().cfoOk ? 'green' : 'red'}">mask /${S.env.cfoMask}</span><button class="btn small" data-dev="cfo">console</button></div>
        <div class="mrow"><span class="mlabel">NEW-HIRE-PC</span>
        <select data-ans="${id}.hire"><option value="">—</option><option value="gw">Wrong gateway</option><option value="mask">Wrong mask</option><option value="ip">Wrong IP (static where DHCP belongs)</option><option value="ok">Fine</option></select>
        <span class="tag ${F().hireOk ? 'green' : 'red'}">${S.env.hireMode === 'dhcp' ? 'DHCP' : 'static (wrong subnet)'}</span><button class="btn small" data-dev="hire">console</button></div>`;
      bindSelects(pane, id); restoreSelects(pane, id);
      pane.querySelectorAll('[data-dev]').forEach(b => b.addEventListener('click', () => window.Lab.openDevice(b.dataset.dev)));
    },
    validate() {
      const a = S.ans.H6 || {}; const f = F();
      const lines = [cl(a.wms === 'gw' && f.wmsOk, 'WMS: wrong gateway → 10.10.50.1'),
        cl(a.cfo === 'mask' && f.cfoOk, 'CFO: wrong mask → /24'),
        cl(a.hire === 'ip' && f.hireOk, 'NEW-HIRE: static on wrong subnet → DHCP')];
      return finish('H6', lines, 'Three hosts, three distinct diseases, one shared lesson: static configuration has no guardrails. The wrong-IP case is the sneakiest — 10.10.10.50 is a REAL address elsewhere in the company, so the host half-works while confusing return traffic; DHCP-first for user devices removes the entire failure class.',
        'WMS: gateway .254 is dead → replies cannot leave the subnet (classic same-subnet-OK signature). CFO: /28 mask excludes her own gateway → ARP fails (classic cannot-even-reach-gateway signature). NEW-HIRE: copy-pasted VLAN-10 static onto a VLAN-60 port → switch to DHCP.');
    } },
  H7: { mode:'H', pillar:'P4', title:'Design the monitors', anchor:'row 9: detection engineering',
    brief:'Pick the operating thresholds that would have caught this shift early, and map each monitor to the incident it watches. Strict values — near-misses are rejected.',
    hints:['Alert while there is still headroom (85%), suppress before saturation (2%), snapshot configs nightly.'],
    render(pane, id) {
      pane.innerHTML = `<div class="mrow"><span class="mlabel">DHCP scope utilization alert fires at…</span>
        <select data-ans="${id}.thr"><option value="">—</option><option value="50">50%</option><option value="70">70%</option><option value="85">85%</option><option value="95">95%</option></select></div>
        <div class="mrow"><span class="mlabel">Storm-control broadcast suppression begins at…</span>
        <select data-ans="${id}.storm"><option value="">—</option><option value="05">0.5% of bandwidth</option><option value="2">2% of bandwidth</option><option value="5">5%</option><option value="20">20%</option></select></div>
        <div class="mrow"><span class="mlabel">Config backup cadence</span>
        <select data-ans="${id}.bak"><option value="">—</option><option value="never">never</option><option value="monthly">monthly</option><option value="weekly">weekly</option><option value="daily">daily</option></select></div>
        <div class="mrow"><span class="mlabel">85% scope alert watches for…</span><select data-ans="${id}.m1"><option value="">—</option>${H7MAP_VIEW.map(o => `<option value="${o[0]}">${o[1]}</option>`).join('')}</select></div>
        <div class="mrow"><span class="mlabel">2% storm control watches for…</span><select data-ans="${id}.m2"><option value="">—</option>${H7MAP_VIEW.map(o => `<option value="${o[0]}">${o[1]}</option>`).join('')}</select></div>
        <div class="mrow"><span class="mlabel">Daily backups watch for…</span><select data-ans="${id}.m3"><option value="">—</option>${H7MAP_VIEW.map(o => `<option value="${o[0]}">${o[1]}</option>`).join('')}</select></div>`;
      bindSelects(pane, id); restoreSelects(pane, id);
    },
    validate() {
      const a = S.ans.H7 || {};
      const lines = [cl(a.thr === '85', 'DHCP alert at 85% (headroom, not 95% — too late)'),
        cl(a.storm === '2', 'storm control at 2% (early suppression; 20% is already an outage)'),
        cl(a.bak === 'daily', 'daily config backups'),
        cl(a.m1 === 'pool' && a.m2 === 'storm' && a.m3 === 'route', 'each monitor mapped to its incident')];
      return finish('H7', lines, 'Thresholds encode response time: an alert at 95% leaves you minutes; 85% leaves you a change window. Storm control at 2% clamps a loop before it saturates the VLAN — at 20% you are throttling an outage in progress. Daily backups turn "Sunday rollback ate the default route" from an outage into a diff.',
        '85% (headroom to act), 2% (clamp loops early), daily (rollbacks happen between weekly snapshots). Mappings: 85% → pool exhaustion, 2% → broadcast storm, daily → route loss/rollback surprises.');
    } },
  H8: { mode:'H', pillar:'P2', title:'Disposition the noise', anchor:'rows 1–3+7: red herrings',
    brief:'Five reports hit the bridge. Two are red herrings — closed tickets or measurements taken before fixes landed. Assign each report its true root cause.',
    hints:['Check dates and evidence: two reports describe incidents that were already resolved, or were tested before the fix deployed.'],
    render(pane, id) {
      const opts = H8OPTS_VIEW;
      const rows = [
        ['r1', '"CFO\'s PC cannot reach anything — not even the gateway ping." (ipconfig: 10.10.60.22 / 255.255.255.240)'],
        ['r2', '"Meeting-room switch port threw a security violation!" (CORE log, timestamped LAST TUESDAY, marked errdisable-recovery cleared)'],
        ['r3', '"Branch accounting still cannot open payroll on HR-SRV." (logged AFTER your route fix; FINLOCK seq 30 has no branch permit)'],
        ['r4', '"Warehouse scanners keep dropping." (MACFLAP + storm-control lines still ticking)'],
        ['r5', '"Training laptops are STILL slow to get online!" (user tested at 06:40; your pool fix deployed 07:15)']
      ];
      pane.innerHTML = rows.map(r => `<div class="mrow"><span class="mlabel">${r[1]}</span>
        <select data-ans="${id}.${r[0]}"><option value="">—</option>${opts.map(o => `<option value="${o[0]}">${o[1]}</option>`).join('')}</select></div>`).join('');
      bindSelects(pane, id); restoreSelects(pane, id);
    },
    validate() {
      const key = { r1:'mask', r2:'rh', r3:'acl', r4:'stp', r5:'rh' };
      return mapCheck('H8', key, {
        ok:'Clean dispositions. r2 is a closed incident wearing a scary timestamp; r5 is a measurement from before the fix — both are noise designed to burn bridge time. r3 is the layered one: the route fix was necessary but not sufficient, because FINLOCK still has no branch permit (that is H4\'s job). Evidence + timestamps beat intuition.',
        bad:'Key: r1 → wrong subnet mask (the /28). r2 → RED HERRING (resolved last Tuesday, auto-recovery). r3 → ACL lockdown (FINLOCK denies branch→HR-SRV until you add the permit). r4 → STP loop (storm signatures still live). r5 → RED HERRING (tested at 06:40, fix deployed 07:15).'
      });
    } },
  H9: { mode:'H', pillar:'P4', title:'Build the prevention board', anchor:'row 9: controls + mapping',
    brief:'The post-incident review wants six controls that would have prevented this shift — select exactly six of the ten proposals, then map each incident class to its control. Distractors are expensive theater.',
    hints:['Six controls map 1:1 onto the faults you just fixed; the other four are theater.'],
    render(pane, id) {
      const set = S.ans.H9?.set || {};
      pane.innerHTML = '<div class="checklines">' + CONTROLS10_VIEW.map(c =>
        `<label class="mrow"><input type="checkbox" data-c9="${c[0]}" ${set[c[0]] ? 'checked' : ''}> ${c[1]}</label>`).join('') + '</div>' +
        [['mStorm', 'Broadcast storm / rogue loop'], ['mRoot', 'Root in a closet'], ['mPool', 'Pool exhaustion'], ['mRoute', 'Route loss / rollback']].map(r =>
          `<div class="mrow"><span class="mlabel">${r[1]} → prevented by</span>
           <select data-ans="H9.${r[0]}" style="max-width:360px"><option value="">—</option>${CONTROLS10_VIEW.filter(c => !c[0].startsWith('x')).map(c => `<option value="${c[0]}">${c[1]}</option>`).join('')}</select></div>`).join('');
      bindSelects(pane, id); restoreSelects(pane, id);
      pane.querySelectorAll('[data-c9]').forEach(c => c.addEventListener('change', () => { getAns('H9').set = getAns('H9').set || {}; getAns('H9').set[c.dataset.c9] = c.checked; save(); }));
    },
    validate() {
      const a = S.ans.H9 || {}; const set = a.set || {};
      const want = { sc:true, rb:true, dh:true, ip:true, b1:true, b6:true };
      let extra = false; ['x1','x2','x3','x4','x5','x6'].forEach(k => { if (set[k]) extra = true; });
      const sixOk = !extra && Object.keys(want).every(k => set[k]);
      const lines = [cl(sixOk, 'exactly the six real controls selected'),
        cl(a.mStorm === 'sc' || a.mStorm === 'b1', 'storm → storm control / BPDU guard'),
        cl(a.mRoot === 'rb', 'root → priority plan'),
        cl(a.mPool === 'dh', 'pool → utilization alert + lease policy'),
        cl(a.mRoute === 'b6', 'route loss → backups + change review')];
      return finish('H9', lines, 'Every real control on this board exists because a fault had NO guardrail: BPDUs walked in through access ports, root was decided by accident, capacity was invisible, statics had no registry, and a rollback had no backup to diff against. The four distractors are budget theater — expensive, impressive, and preventive of nothing that happened today.',
        'The six: BPDU guard + PortFast on access ports · root guard on distribution downlinks · storm control · DHCP utilization alerts + lease policy · IP/VLAN register · config backups + change review. Storm→storm control/BPDU guard, root→priority plan, pool→alert+lease, route→backups+change review.');
    } }
};

/* ---------- helpers ---------- */
function getAns(id) { S.ans[id] = S.ans[id] || {}; return S.ans[id]; }
function cl(ok, text) { return { ok, text: (ok ? '✓ ' : '✗ ') + text }; }
function bindSelects(pane, id) {
  pane.querySelectorAll('select[data-ans]').forEach(sel => sel.addEventListener('change', () => {
    const path = sel.getAttribute('data-ans').split('.');
    if (path.length === 2) getAns(path[0])[path[1]] = sel.value; else getAns(path[0])[path[1]] = sel.value;
    save();
  }));
}
function restoreSelects(pane, id) {
  const a = S.ans[id] || {};
  pane.querySelectorAll('select[data-ans]').forEach(sel => {
    const k = sel.getAttribute('data-ans').split('.')[1];
    if (a[k] != null && a[k] !== '') sel.value = a[k];
  });
}
function mapCheck(id, key, fb) {
  const a = S.ans[id] || {};
  const lines = Object.keys(key).map(k => cl(a[k] === key[k], `${k} → ${key[k]}`));
  const ok = lines.every(l => l.ok);
  return { ok, okMsg: fb.ok, failMsg: fb.bad, lines };
}
function finish(id, lines, okMsg, failMsg) {
  const ok = lines.every(l => l.ok);
  return { ok, okMsg, failMsg, lines };
}
function renderOrder(pane, id, items, shuffledIdxs) {
  const a = getAns(id); a.seq = a.seq || [];
  const poolEl = el('div', 'orderpool'); const seqEl = el('div', 'orderseq');
  seqEl.setAttribute('aria-label', 'ordered sequence'); poolEl.setAttribute('aria-label', 'unordered items');
  function chip(idx, inSeq) {
    const b = el('button', 'ochip');
    b.innerHTML = (inSeq ? `<span class="ord">${a.seq.indexOf(idx) + 1}.</span>` : '') + esc(items[idx]);
    b.setAttribute('aria-label', (inSeq ? 'remove ' : 'add ') + items[idx]);
    b.addEventListener('click', () => {
      if (inSeq) { a.seq = a.seq.filter(x => x !== idx); } else if (!a.seq.includes(idx)) { a.seq.push(idx); }
      save(); renderOrder.refresh();
    });
    return b;
  }
  function refresh() {
    poolEl.innerHTML = ''; seqEl.innerHTML = '';
    shuffledIdxs.forEach(i => { if (!a.seq.includes(i)) poolEl.appendChild(chip(i, false)); });
    a.seq.forEach(i => seqEl.appendChild(chip(i, true)));
    if (!poolEl.childNodes.length && !seqEl.childNodes.length) poolEl.textContent = '—';
  }
  renderOrder.refresh = refresh;
  pane.appendChild(el('div', 'drawernote', 'Available steps (click to add in order):'));
  pane.appendChild(poolEl);
  pane.appendChild(el('div', 'drawernote', 'Your sequence:'));
  pane.appendChild(seqEl);
  refresh();
}

/* ---------- tracker ---------- */
function currentObjectives() { return Object.keys(OBJ_DEFS).filter(k => OBJ_DEFS[k].mode === S.mode); }
function renderMissionBoard() {
  const pane = $('panObj');
  pane.innerHTML = '';
  const ids = currentObjectives();
  const done = ids.filter(i => S.obj[i] && S.obj[i].done).length;
  const head = el('div', 'stagehead');
  head.innerHTML = `<h2>Mission Board — ${S.mode === 'M' ? 'Guided Work Orders' : 'Incident Bridge'}</h2>
    <span class="tag amber">${done}/${ids.length} complete</span>`;
  pane.appendChild(head);
  const intro = el('p', 'obrief');
  intro.innerHTML = S.mode === 'M'
    ? 'Work orders arrive in a sensible order, but you may tackle them freely. Each CHECK gives teaching feedback. Hints cost stars, never progress.'
    : 'Broad challenges, noisy evidence, strict validation. One nudge available per objective — it visibly costs score.';
  pane.appendChild(intro);
  ids.forEach(oId => {
    const d = OBJ_DEFS[oId]; const st = S.obj[oId] || {};
    const card = el('div', 'obj' + (st.done ? ' done' : ''));
    card.id = 'obj-' + oId;
    card.innerHTML = `<div class="objhead" role="button" tabindex="0" aria-expanded="${!st.done}">
      <span class="onum">${oId}</span>
      <span class="otitle"><b>${esc(d.title)}</b><small>${esc(d.brief)}</small></span>
      <span class="pillar ${d.pillar}">${PILLAR_NAMES[d.pillar]}</span>
      <span class="tag ${st.done ? 'green' : 'grey'}">${st.done ? 'DONE' : 'OPEN'}</span></div>`;
    const body = el('div', 'objbody');
    const ctl = el('div', 'ocontrols');
    body.appendChild(ctl);
    const actions = el('div', 'oactions');
    actions.innerHTML = `<button class="btn small primary" data-check="${oId}">Check results</button>
      <button class="btn small" data-hint="${oId}">Hint vault (${(st.hints || 0)}/${d.hints.length})</button>
      <span class="drawernote" data-att="${oId}">${st.attempts ? 'attempts: ' + st.attempts : ''}</span>`;
    body.appendChild(actions);
    const fb = el('div', 'ofeedback'); fb.id = 'fb-' + oId; body.appendChild(fb);
    const hb = el('div', 'hintbox'); hb.id = 'hint-' + oId; body.appendChild(hb);
    card.appendChild(body);
    pane.appendChild(card);
    d.render(ctl, oId);
    if (st.done && st.lastFeedback) { fb.className = 'ofeedback ok'; fb.innerHTML = st.lastFeedback; }
    else if (!st.done && st.lastFail) { fb.className = 'ofeedback bad'; fb.innerHTML = st.lastFail; }
    card.querySelector('.objhead').addEventListener('click', () => {
      body.style.display = body.style.display === 'none' ? '' : 'none';
    });
    actions.querySelector('[data-check]').addEventListener('click', () => checkObjective(oId));
    actions.querySelector('[data-hint]').addEventListener('click', () => showHint(oId));
  });
  updateHeader();
}
function showHint(oId) {
  const d = OBJ_DEFS[oId]; const st = S.obj[oId] = S.obj[oId] || {};
  st.hints = st.hints || 0;
  if (st.hints >= d.hints.length) { toast('Vault empty for ' + oId); return; }
  if (S.mode === 'H' && st.hints >= 1) { toast('Hard mode: one nudge max — it already cost you'); return; }
  const box = $('hint-' + oId);
  box.style.display = 'block';
  box.innerHTML = `<span class="hl">HINT ${st.hints + 1}/${d.hints.length}</span> — ${esc(d.hints[st.hints])}`;
  st.hints++;
  logEv(`HINT used on ${oId} (level ${st.hints})`, 'sys');
  save(); updateHeader();
}
function checkObjective(oId, silent) {
  const d = OBJ_DEFS[oId];
  const res = d.validate();
  const st = S.obj[oId] = S.obj[oId] || {};
  st.attempts = (st.attempts || 0) + 1;
  const fb = $('fb-' + oId);
  if (res.ok) {
    if (!st.done && st.attempts === 1) st.doneFirstTry = true;
    st.done = true;
    st.lastFeedback = '<b>Check passed.</b> ' + res.okMsg;
    fb.className = 'ofeedback ok';
    fb.innerHTML = st.lastFeedback;
    logEv(`${oId} COMPLETE (${st.attempts} attempt${st.attempts > 1 ? 's' : ''})`, 'ok');
  } else {
    st.done = false;
    fb.className = 'ofeedback bad';
    fb.innerHTML = '<b>Not yet.</b> ' + res.failMsg +
      (res.lines ? '<div class="checklines">' + res.lines.map(l => `<div class="${l.ok ? 'cl-ok' : 'cl-bad'}">${esc(l.text)}</div>`).join('') + '</div>' : '');
    st.lastFail = fb.innerHTML;
  }
  save();
  renderMissionBoard();
  renderTickets(); renderGauges(); updateTopology();
  const allDone = currentObjectives().every(i => S.obj[i] && S.obj[i].done);
  if (allDone && !S.doneShown) window.Lab.showCompletion(); /* R7: auto-show once per completion; reopen via the Shift report button */
  else if (allDone) toast('All work orders complete — Shift report is on the status strip');
}
function updateHeader() {
  const ids = currentObjectives();
  const done = ids.filter(i => S.obj[i] && S.obj[i].done).length;
  $('objCount').textContent = `${done}/${ids.length}`;
  const pct = computePct();
  const stars = starsFor(pct);
  $('starPreview').textContent = stars;
  const rep = $('btnReport'); /* R7 companion: explicit reopen path for the once-only completion modal */
  if (rep) rep.hidden = !(ids.length > 0 && ids.every(i => S.obj[i] && S.obj[i].done));
}
function computePct() {
  const ids = currentObjectives();
  let pts = 0, max = 0;
  ids.forEach(i => {
    const st = S.obj[i] || {};
    max += 10;
    if (st.done) {
      let p = 10 - Math.min(6, (st.attempts - 1) * 2) - (st.hints || 0);
      p = Math.max(4, p);
      pts += p;
    }
  });
  Object.keys(S.quiz).forEach(q => { max += 1; if (S.quiz[q].correct) pts += 1; });
  return max ? pts / max : 0;
}
function starsFor(pct) {
  const n = pct >= 0.9 ? 5 : pct >= 0.75 ? 4 : pct >= 0.6 ? 3 : pct >= 0.4 ? 2 : 1;
  return '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n);
}
