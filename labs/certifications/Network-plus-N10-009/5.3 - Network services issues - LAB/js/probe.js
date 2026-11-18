/* =====================================================================
   Atlas NOC Command Deck — js/probe.js
   Probe engine: ping / traceroute / DHCP renew with per-fault outcomes,
   SVG path animation, ACL counter evidence, verification sweep (M10).
   ===================================================================== */
'use strict';

/* ================= probe engine: ping / traceroute / DHCP renew with fault injection ================= */
/* build the probe result — the single place where faults decide outcomes */
function buildProbe(src, tool, dst) {
  const f = withWarehouse(F());
  const e = S.env;
  const key = tool === 'dhcp' ? `${src}>srv` : `${src}>${dst}`;
  const path = PATHS[key];
  const res = { ok: true, degraded: false, tool, src, dst, lines: [], path, failAtIndex: -1, failNote: '' };
  const L = (s, c) => res.lines.push([s, c || '']);

  /* --- source-side pre-flight --- */
  if (src === 'cfo' && !f.cfoOk) {
    res.ok = false; res.failAtIndex = 0;
    res.failNote = 'CFO-PC cannot leave its own /28: mask 255.255.255.240 makes 10.10.60.1 "remote", and ARP for it fails.';
    L(`PING 10.10.50.50 (PRINT-SRV):`, 'h'); L('ARP: who-has 10.10.60.1? tell 10.10.60.22 — no answer (timeout)', 'bad');
    L('Host believes its subnet is 10.10.60.16-31. The gateway is not in it.', 'bad');
    return res;
  }
  if (src === 'hire' && !f.hireOk) {
    res.ok = false; res.failAtIndex = 0;
    res.failNote = 'NEW-HIRE-PC ARPs for gateway 10.10.10.1, which does not exist on VLAN 60 — the static config was copy-pasted from another floor sheet.';
    L(`PING 10.10.50.20 (HR-SRV):`, 'h'); L('ARP: who-has 10.10.10.1? tell 10.10.10.50 — no answer (timeout)', 'bad');
    L('This port is in VLAN 60 (10.10.60.0/24). The typed static IP/gateway belong to VLAN 10.', 'bad');
    return res;
  }
  if (tool === 'dhcp') {
    if (src === 'ship') {
      if (!f.shipHasLease) {
        res.ok = false; res.failAtIndex = 0;
        res.failNote = 'SHIP-PC broadcasts DHCPDISCOVER inside VLAN 2 (OLD-OFFICE): no SVI, no ip helper, no scope — silence → APIPA.';
        L('DHCPDISCOVER broadcast on VLAN 2 (10.10.2.0/24 deprecated)...', 'h');
        L('No OFFER received: VLAN 2 has no SVI on RTR-CORE and no DHCP scope.', 'bad');
        L('Host self-assigns APIPA: 169.254.44.12/16 (link-local only, non-routable).', 'bad');
      } else {
        L('DHCPDISCOVER broadcast on VLAN 30...', 'h');
        L(`DHCPOFFER via relay 10.10.30.1 from 10.10.50.11 (POOL-WH)`, 'ok');
        L(okc('DHCPACK: 10.10.30.60/24, gw 10.10.30.1, lease 12h'));
      }
      return res;
    }
    if (src === 'train') {
      if (!f.trainHasLease) {
        res.ok = false; res.failAtIndex = 0;
        res.failNote = 'POOL-TRAIN is sized /25 = 125 assignable leases for 130 laptops, with a 7-day lease. 100% utilized → new DISCOVERs get no OFFER → APIPA.';
        L('DHCPDISCOVER via relay 10.10.40.1 → scope POOL-TRAIN 10.10.40.0/25...', 'h');
        L('Scope FULL: 125/125 leases in use (7-day lease keeps stale clients bound).', 'bad');
        L('Host self-assigns APIPA: 169.254.200.7/16 (link-local only, non-routable).', 'bad');
      } else {
        L('DHCPDISCOVER via relay 10.10.40.1 → scope POOL-TRAIN 10.10.40.0/24...', 'h');
        L(`DHCPACK: 10.10.40.126/24, gw 10.10.40.1, lease ${e.dhcp.leaseH}h — leases available`, 'ok');
      }
      return res;
    }
  }

  /* --- hop-by-hop traceroute / ping paths --- */
  const HOPS = {
    'hqpc>net': [
      ['10.10.10.1', 'RTR-CORE Vlan10'],
      ['10.255.0.1', 'EDGE-RTR'],
      ['203.0.113.1', 'ISP gateway'],
      ['8.8.8.8', 'destination']
    ],
    'hqpc>hrsrv': [['10.10.10.1', 'RTR-CORE Vlan10'], ['10.10.50.20', 'HR-SRV']],
    'hqpc>wms': [['10.10.10.1', 'RTR-CORE Vlan10'], ['10.10.50.30', 'WMS-SRV']],
    'hqpc>brpc': [['10.10.10.1', 'RTR-CORE Vlan10'], ['10.255.0.6', 'BR-RTR WAN'], ['10.20.10.51', 'BR-PC-01']],
    'finpc>hrsrv': [['10.10.60.1', 'RTR-CORE Vlan60'], ['10.10.50.20', 'HR-SRV']],
    'finpc>wms': [['10.10.60.1', 'RTR-CORE Vlan60'], ['10.10.50.30', 'WMS-SRV']],
    'finpc>net': [['10.10.60.1', 'RTR-CORE Vlan60'], ['10.255.0.1', 'EDGE-RTR'], ['203.0.113.1', 'ISP gateway'], ['8.8.8.8', 'destination']],
    'cfo>print': [['10.10.60.1', 'RTR-CORE Vlan60'], ['10.10.50.50', 'PRINT-SRV']],
    'cfo>net': [['10.10.60.1', 'RTR-CORE Vlan60'], ['10.255.0.1', 'EDGE-RTR'], ['8.8.8.8', 'destination']],
    'hire>hrsrv': [['10.10.60.1', 'RTR-CORE Vlan60'], ['10.10.50.20', 'HR-SRV']],
    'hire>net': [['10.10.60.1', 'RTR-CORE Vlan60'], ['10.255.0.1', 'EDGE-RTR'], ['8.8.8.8', 'destination']],
    'whscan>wms': [['10.10.30.1', 'RTR-CORE Vlan30'], ['10.10.50.30', 'WMS-SRV']],
    'whscan>net': [['10.10.30.1', 'RTR-CORE Vlan30'], ['10.255.0.1', 'EDGE-RTR'], ['203.0.113.1', 'ISP'], ['8.8.8.8', 'destination']],
    'brpc>wms': [['10.20.10.1', 'BR-RTR'], ['10.255.0.5', 'RTR-CORE WAN'], ['10.10.50.30', 'WMS-SRV']],
    'brpc>hrsrv': [['10.20.10.1', 'BR-RTR'], ['10.255.0.5', 'RTR-CORE WAN'], ['10.10.50.20', 'HR-SRV']],
    'brpc>net': [['10.20.10.1', 'BR-RTR'], ['10.255.0.5', 'RTR-CORE WAN'], ['10.255.0.1', 'EDGE-RTR'], ['8.8.8.8', 'destination']]
  };
  const hops = HOPS[key];
  const dstIp = hops[hops.length - 1][0];
  const isPing = tool === 'ping';
  L(`${isPing ? 'PING' : 'Traceroute to'} ${dstIp} ${key.includes('net') ? '(8.8.8.8)' : ''}`, 'h');

  /* decide where/if the path breaks, and why */
  let breakAt = -1, note = '', cls = 'bad';
  if (dst === 'net' && !f.internetUp && (src === 'brpc' ? true : true)) { breakAt = 1; note = 'EDGE-RTR: destination unreachable — no default route (gateway of last resort is not set).'; }
  if (key === 'hqpc>brpc' && !f.branchUp) { breakAt = 0; note = 'RTR-CORE: no route to 10.20.10.0/24 — packet dropped at the core (route lost in Sunday cleanup).'; }
  if ((key === 'brpc>wms' || key === 'brpc>hrsrv') && !f.branchUp) { breakAt = 1; note = 'Replies die at RTR-CORE: no return route to 10.20.10.0/24. Requests reach HQ; replies never come back (asymmetric path).'; }
  if (key === 'brpc>hrsrv' && f.branchUp && !f.branchHrOk) { breakAt = 1; note = 'RTR-CORE Vlan50 out: FINLOCK seq 30 denies any→HR-SRV. Branch accounting (10.20.10.0/24) has no permit entry.'; cls = 'bad'; }
  if (key === 'finpc>hrsrv' && !f.finOk) { breakAt = 0; note = 'RTR-CORE Vlan50 out: FINLOCK seq 10 "deny ip 10.10.60.0 0.0.0.255 host 10.10.50.20" — finance is explicitly denied (should be permit).'; }
  if ((key === 'hqpc>wms' || key === 'finpc>wms' || key === 'whscan>wms') && !f.wmsOk) { breakAt = hops.length - 2; note = 'Request delivered to WMS-SRV, but no reply: WMS gateway 10.10.50.254 is dead — replies to other subnets cannot leave the server.'; }
  if (key === 'cfo>print' && f.cfoOk) { breakAt = -1; }
  if (key === 'hire>hrsrv' && f.hireOk) { breakAt = -1; }

  /* emit hops */
  let degraded = f.stormOn && (src === 'whscan' || src === 'ship');
  for (let i = 0; i < hops.length; i++) {
    if (breakAt >= 0 && i > breakAt) {
      L('  * * *  (request timed out)', cls);
      if (i === breakAt + 1) L(dim('  ↑ ') + note, 'sys');
      continue;
    }
    const [ip, lbl] = hops[i];
    if (isPing) {
      if (breakAt >= 0 && i === hops.length - 1) { L(`Request timed out for ${ip}`, cls); }
      else {
        const t = degraded ? (900 + Math.floor(Math.random() * 2900)) : (1 + Math.floor(Math.random() * (i + 2) * 2));
        L(`Reply from ${ip}: bytes=32 time=${t}ms TTL=${64 - i}${degraded ? bad('  [STORM]') : ''}`, degraded ? 'bad' : 'ok');
      }
    } else {
      if (breakAt >= 0 && i === breakAt && note.includes('administratively prohibited')) {
        L(`  ${i + 1}  ${ip}  !A ${note}`, cls); break;
      }
      if (breakAt >= 0 && i === breakAt && (key === 'brpc>wms' || key === 'brpc>hrsrv') && f.branchUp === false) {
        L(`  ${i + 1}  ${ip}  ${lbl}`, 'ok');
        L(dim('     (probe reached the destination; its REPLY was dropped here — check the return route)'));
        continue;
      }
      const t = degraded ? (800 + Math.floor(Math.random() * 3000)) : (1 + Math.floor(Math.random() * (i + 2) * 2));
      L(`  ${i + 1}  ${ip}  ${t}ms  ${lbl}${degraded ? bad('  [STORM: 40% loss]') : ''}`, degraded ? 'bad' : 'ok');
    }
  }
  if (breakAt < 0) {
    if (degraded) { res.degraded = true; L(bad('Path completes but VLAN 30 is storming: duplicate frames, MAC flapping, 40% loss.'), 'sys'); }
    else L(okc(isPing ? `Success — ${hops.length} hop(s), path healthy.` : 'Trace complete — path healthy.'), 'ok');
  } else { res.ok = false; res.failAtIndex = breakAt; res.failNote = note; }
  res.degraded = degraded;
  return res;
}

/* ---------- animation ---------- */
function animateProbe(res, done) {
  const svg = $('topo');
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  const dot = document.createElementNS(NS, 'circle');
  dot.setAttribute('r', '5'); dot.setAttribute('class', 'probe' + (res.ok ? '' : ' bad'));
  svg.appendChild(dot);
  const segs = [];
  for (let i = 0; i < res.path.length - 1; i++) {
    const A = nodeById(res.path[i]), B = nodeById(res.path[i + 1]);
    segs.push([A.x, A.y, B.x, B.y]);
  }
  const stopIdx = res.failAtIndex >= 0 ? Math.min(res.failAtIndex + 1, segs.length - 1) : segs.length - 1;
  if (reduce) { dot.remove(); if (done) done(); return; }
  let si = 0, t0 = null;
  const DUR = 420;
  function step(ts) {
    if (t0 === null) t0 = ts;
    const p = Math.min(1, (ts - t0) / DUR);
    const [x1, y1, x2, y2] = segs[si];
    dot.setAttribute('cx', x1 + (x2 - x1) * p);
    dot.setAttribute('cy', y1 + (y2 - y1) * p);
    if (p >= 1) {
      si++;
      t0 = null;
      if (si > stopIdx) {
        dot.setAttribute('class', 'probe ' + (res.ok ? 'good' : 'bad'));
        setTimeout(() => { dot.remove(); if (done) done(); }, res.ok ? 350 : 700);
        return;
      }
    }
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

let probeBusy = false;
function runProbe() {
  if (probeBusy) return;
  const src = $('probeSrc').value, tool = $('probeType').value, dst = $('probeDst').value;
  const res = buildProbe(src, tool, dst);
  probeBusy = true;
  renderProbeOut(res);
  logEv(`PROBE ${tool} ${src} → ${tool === 'dhcp' ? 'DHCP' : dst}: ${res.ok ? (res.degraded ? 'completed DEGRADED (storm)' : 'OK') : 'FAILED'}`, res.ok ? (res.degraded ? 'sys' : 'ok') : 'bad');
  animateProbe(res, () => {
    probeBusy = false;
    /* ACL hit counters tick on blocked finance/branch attempts */
    if (!res.ok && res.failNote && res.failNote.includes('seq 10')) {
      S.env.acl.counters = S.env.acl.counters || {};
      S.env.acl.counters[10] = (S.env.acl.counters[10] || 214) + 4; save(); if (curDev === 'rtrcore' && curTab === 'show') renderDrawer();
    }
    if (!res.ok && res.failNote && res.failNote.includes('seq 30')) {
      S.env.acl.counters = S.env.acl.counters || {};
      S.env.acl.counters[30] = (S.env.acl.counters[30] || 96) + 2; save(); if (curDev === 'rtrcore' && curTab === 'show') renderDrawer();
    }
  });
}
function renderProbeOut(res) {
  let box = $('probeOut');
  if (!box) {
    box = el('div', 'evlog'); box.id = 'probeOut'; box.setAttribute('role', 'status');
    $('evlog').parentNode.insertBefore(box, $('evlog'));
    const lbl = el('div', 'drawernote'); lbl.textContent = 'PROBE OUTPUT (latest run):'; box.parentNode.insertBefore(lbl, box);
  }
  box.innerHTML = res.lines.map(([s, c]) => `<div class="${c}">${s}</div>`).join('');
}
function fillProbeSelectors() {
  const srcSel = $('probeSrc'), dstSel = $('probeDst');
  srcSel.innerHTML = Object.keys(ENDPOINTS).map(k => `<option value="${k}">${ENDPOINTS[k].label}</option>`).join('');
  function fillDst() {
    const s = srcSel.value;
    dstSel.innerHTML = (ALLOWED[s] || []).map(k => `<option value="${k}">${TARGETS[k].label}</option>`).join('');
    $('probeType').disabled = !RENEW_ALLOWED[s] && false;
    const hasRenew = !!RENEW_ALLOWED[s];
    const t = $('probeType');
    t.querySelector('option[value=dhcp]').disabled = !hasRenew;
    if (t.value === 'dhcp' && !hasRenew) t.value = 'ping';
  }
  srcSel.addEventListener('change', fillDst);
  fillDst();
  $('btnProbe').addEventListener('click', runProbe);
}

/* ---------- verification sweep (objective M10) ---------- */
function runSweep() {
  const cases = [
    ['hqpc', 'ping', 'net', 'HQ → internet (default route)'],
    ['finpc', 'ping', 'hrsrv', 'Finance → HR-SRV (FINLOCK)'],
    ['whscan', 'ping', 'wms', 'Warehouse scanner → WMS (STP + gateway)'],
    ['ship', 'dhcp', null, 'Shipping office DHCP renew (VLAN assignment)'],
    ['train', 'dhcp', null, 'Training laptop DHCP renew (pool)'],
    ['brpc', 'ping', 'wms', 'Branch → WMS (routing table)']
  ];
  const f = withWarehouse(F());
  const results = cases.map(([s, t, d, lbl]) => {
    const r = buildProbe(s, t, d);
    return { lbl, ok: r.ok, degraded: r.degraded };
  });
  const allOk = results.every(r => r.ok);
  S.sweep = { run: true, pass: allOk };
  logEv(`VERIFICATION SWEEP: ${results.filter(r => r.ok).length}/6 paths healthy${allOk ? '' : ' — outstanding faults remain'}`, allOk ? 'ok' : 'bad');
  results.forEach(r => logEv(`  ${r.lbl}: ${r.ok ? (r.degraded ? 'degraded (storm)' : 'OK') : 'FAIL'}`, r.ok ? (r.degraded ? 'sys' : 'ok') : 'bad'));
  save(); window.Lab.rerender();
  return allOk;
}
