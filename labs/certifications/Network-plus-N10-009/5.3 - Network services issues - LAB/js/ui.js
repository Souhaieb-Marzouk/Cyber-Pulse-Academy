/* =====================================================================
   Atlas NOC Command Deck — js/ui.js
   Device consoles: state-reflecting show commands, config actions
   (the only way to change the grid), DHCP service UI, drawer rendering.
   ===================================================================== */
'use strict';

/* ================= device consoles: show commands, logs, config actions ================= */

let curDev = null, curTab = 'show';


/* ---------- show command templates (state-reflecting, simplified IOS flavor) ---------- */
const hl = (s) => `<span class="c-hl">${s}</span>`;
const bad = (s) => `<span class="c-bad">${s}</span>`;
const okc = (s) => `<span class="c-ok">${s}</span>`;
const dim = (s) => `<span class="c-dim">${s}</span>`;

function showIpRouteCore() {
  const e = S.env;
  let s = 'Codes: C - connected, L - local, S - static        <span class="c-dim">[simplified output]</span>\n';
  s += 'Gateway of last resort is 10.255.0.1 to network 0.0.0.0\n\n';
  s += 'C    10.10.10.0/24 is directly connected,   Vlan10\n';
  s += 'C    10.10.20.0/24 is directly connected,   Vlan20\n';
  s += 'C    10.10.30.0/24 is directly connected,   Vlan30\n';
  s += 'C    10.10.40.0/24 is directly connected,   Vlan40\n';
  s += 'C    10.10.50.0/24 is directly connected,   Vlan50\n';
  s += 'C    10.10.60.0/24 is directly connected,   Vlan60\n';
  s += 'C    10.255.0.0/30 is directly connected,   GigabitEthernet0/0\n';
  s += 'C    10.255.0.4/30 is directly connected,   GigabitEthernet0/1\n';
  if (e.coreBranchRoute) s += okc('S    10.20.10.0/24 [1/0] via 10.255.0.6') + '   <span class="c-dim">(BR-RTR)</span>\n';
  if (e.staleRoute) s += 'S    10.99.0.0/16 [1/0] via 10.255.0.9   <span class="c-dim">(old lab network? — verify)</span>\n';
  s += 'S*   0.0.0.0/0 [1/0] via 10.255.0.1   <span class="c-dim">(to EDGE-RTR)</span>';
  return s;
}
function showAcl() {
  const a = S.env.acl; const c = a.counters || {};
  let s = 'Extended IP access list FINLOCK  ' + (a.applied ? okc('applied: OUT on Vlan50') : bad('NOT applied (removed!)')) + '\n';
  a.entries.forEach(en => {
    const hits = c[en.seq] != null ? ` <span class="c-dim">(${c[en.seq]} matches)</span>` : '';
    const dst = ' host 10.10.50.20';
    s += `    ${String(en.seq).padStart(3)} ${en.action.padEnd(6)} ip ${en.src.padEnd(15)}${dst}${hits}\n`;
  });
  s += dim('\n  implicit deny ip any any  — entries are processed top-down, first match wins');
  if (!a.entries.some(x => x.action === 'permit' && x.src === '10.10.60.0/24')) s += '\n' + bad('  NOTE: no entry permits finance (10.10.60.0/24) to reach HR-SRV');
  return s;
}
function showSpanCore1() {
  const e = S.env; const rootMac = 'aabb.cc00.0200';
  let s = 'Spanning tree (simplified) for VLAN0030\n';
  if (e.core1Prio < 32768) {
    s += okc('  This bridge is the ROOT for VLAN 0030') + '\n';
    s += `  Root ID  Priority ${e.core1Prio}  Address aabb.cc00.0500 (CORE-1)\n`;
  } else {
    s += `  Root ID  Priority 32768  Address ${rootMac}${hl('  (SW-TR-1 — training closet!)')}\n`;
    s += dim('  This bridge is NOT the root. Root should live on the distribution tier.\n');
    if (!e.wh2StpOn) s += bad('  WARNING: no BPDUs received from SW-WH-2 — bridge not participating in VLAN 0030');
  }
  s += '\n  Port            Role/State    Neighbor\n';
  s += '  Gi1/0/1         DESG FWD      CORE-2 (trunk)\n';
  s += '  Gi1/0/2         DESG FWD      RTR-CORE (trunk)\n';
  s += '  Gi1/0/3         DESG FWD      SW-TR-1\n';
  s += '  Gi1/0/4         DESG FWD      SW-WH-1\n';
  s += '  Gi1/0/5         DESG FWD      SW-WH-2\n';
  s += '  Gi1/0/6         DESG FWD      SW-HQ-1\n';
  s += '  Gi1/0/7-8       DESG FWD      SERVER RACK';
  return s;
}
function showSpanCore2() {
  const e = S.env; let s = 'Spanning tree (simplified) for VLAN0030\n';
  if (e.core1Prio < 32768) s += `  Root ID  Priority ${e.core1Prio}  aabb.cc00.0500 (CORE-1)\n`;
  else s += `  Root ID  Priority 32768  aabb.cc00.0200 (SW-TR-1)${e.wh2StpOn ? '' : ''}\n`;
  if (e.wh2StpOn && e.core1Prio >= 32768) s += bad('  WARNING: SW-WH-2 (aabb.cc00.0110, lowest MAC) would win the root election at default priority!\n');
  s += '\n  Port            Role/State    Note\n';
  s += '  Gi1/0/1         ' + (e.core1Prio < 32768 ? 'ROOT FWD      to CORE-1 (root path)' : 'DESG FWD      to CORE-1') + '\n';
  s += '  Gi1/0/5         ' + (e.wh2StpOn && e.core1Prio < 32768 ? 'ALTN BLK      to SW-WH-2 (blocked by STP)' : 'DESG FWD      to SW-WH-2') + '\n';
  s += '  Gi1/0/24        DESG FWD      to SW-WH-1 (trunk, native VLAN ' + e.nativeCore2 + ')';
  return s;
}
function showSpanSwtr() {
  const e = S.env; let s = 'Spanning tree (simplified) for VLAN0030\n';
  if (e.core1Prio < 32768) s += `  Root ID  Priority ${e.core1Prio}  aabb.cc00.0500 (CORE-1)\n  This bridge is NOT the root.\n`;
  else s += bad('  This bridge is the ROOT for VLAN 0030') + '\n  Root ID  Priority 32768  aabb.cc00.0200 (SW-TR-1)\n' + dim('  An old access switch is root — suboptimal L2 paths for the whole VLAN.\n');
  s += '\n  Port            Role/State    Note\n  Gi1/0/1         ' + (e.core1Prio < 32768 ? 'ROOT FWD      to CORE-1' : 'DESG FWD      to CORE-1');
  return s;
}
function showSpanSwwh1() {
  const e = S.env; let s = 'Spanning tree (simplified) for VLAN0030\n';
  const rootTxt = e.core1Prio < 32768 ? `Priority ${e.core1Prio}  aabb.cc00.0500 (CORE-1)` :
    (e.wh2StpOn ? 'Priority 32768  aabb.cc00.0110 (SW-WH-2)' : 'Priority 32768  aabb.cc00.0200 (SW-TR-1)');
  s += `  Root ID  ${rootTxt}\n  Port            Role/State    Note\n`;
  s += '  Gi1/0/1         ROOT FWD      to CORE-1\n';
  s += '  Gi1/0/2         ' + (e.core1Prio < 32768 ? 'ALTN BLK' : 'ALTN BLK') + '      to CORE-2 (redundant uplink)\n';
  if (e.wh1PatchDown) s += dim('  Gi1/0/23        admin down    patch to SW-WH-2 Gi0/3 (shutdown)\n');
  else s += (e.wh2StpOn ? okc('  Gi1/0/23        ALTN BLK      patch to SW-WH-2 (loop blocked by STP)') : bad('  Gi1/0/23        DESG FWD      patch to SW-WH-2 — NO BPDUs received back (peer STP off?)'));
  return s;
}
function showSpanSwwh2() {
  const e = S.env;
  if (!e.wh2StpOn) return bad('VLAN0030 — spanning tree is ADMINISTRATIVELY DISABLED on this bridge.\n') + dim('This switch forwards every frame it receives, on every port, blindly.\nAny redundant path through it is a live loop.\n');
  let s = 'Spanning tree (simplified) for VLAN0030\n';
  if (e.core1Prio < 32768) s += `  Root ID  Priority ${e.core1Prio}  aabb.cc00.0500 (CORE-1)\n`;
  else s += bad('  This bridge is the ROOT for VLAN 0030 (lowest MAC at default priority)') + '\n  Root ID  Priority 32768  aabb.cc00.0110 (SW-WH-2)\n';
  s += '\n  Port            Role/State    Note\n';
  s += '  Gi0/1           ' + (e.core1Prio < 32768 ? 'ROOT FWD      to CORE-1' : 'DESG FWD      to CORE-1') + '\n';
  s += '  Gi0/2           ' + (e.core1Prio < 32768 ? 'ALTN BLK      to CORE-2 (blocked by STP)' : 'DESG FWD      to CORE-2') + '\n';
  s += (e.wh2PatchDown ? dim('  Gi0/3           admin down    patch to SW-WH-1 Gi1/0/23') :
    (e.core1Prio < 32768 ? okc('  Gi0/3           DESG FWD      patch to SW-WH-1 (STP blocks the far end)') : '  Gi0/3           DESG FWD      patch to SW-WH-1'));
  return s;
}
function showVlanBriefSwwh1() {
  const e = S.env;
  const shipV = e.shipVlan;
  let s = 'VLAN Name             Status    Ports\n';
  s += '2    OLD-OFFICE       act/unsup Fa0/10-18' + (shipV === 2 ? bad('   <-- SHIPPING OFFICE is here') : '') + dim('  (deprecated: SVI removed in cleanup)\n');
  s += '30   WAREHOUSE        active    Fa0/1-9' + (shipV === 30 ? okc(', Fa0/10-18') : '') + ', Gi1/0/1-2, Gi1/0/23\n';
  s += '55   PRINTERS         active    Fa0/19-24\n';
  s += '999  NATIVE-UNUSED    active    (trunk native only)';
  return s;
}
function showTrunkSwwh1() {
  const e = S.env;
  return 'Port        Mode  Encapsulation  Native VLAN\n' +
    'Gi1/0/1     on    802.1q         1\n' +
    'Gi1/0/2     on    802.1q         ' + (e.nativeWh1 === 999 ? okc('999') : bad('1  <-- mismatch vs CORE-2 Gi1/0/24 (999)'));
}
function showTrunkCore2() {
  const e = S.env;
  return 'Port        Mode  Encapsulation  Native VLAN\n' +
    'Gi1/0/24    on    802.1q         ' + (e.nativeCore2 === 999 ? '999' : (e.nativeWh1 === 999 ? bad('1  <-- mismatch vs SW-WH-1 Gi1/0/2 (999)') : okc('1')));
}
function showRunSwwh2() {
  const e = S.env;
  let s = 'hostname SW-WH-2\nvlan 30\n name WAREHOUSE\n!\ninterface GigabitEthernet0/1\n switchport mode trunk\ninterface GigabitEthernet0/2\n switchport mode trunk\n';
  s += e.wh2PatchDown ? 'interface GigabitEthernet0/3\n shutdown\n' : 'interface GigabitEthernet0/3\n switchport mode trunk\n';
  s += (e.wh2StpOn ? '' : bad('no spanning-tree vlan 30') + '   ' + dim('<-- vendor "optimization"')) + '\nend';
  return s;
}
function showRunEdge() {
  const e = S.env;
  let s = 'hostname EDGE-RTR\n!\ninterface GigabitEthernet0/0\n ip address 203.0.113.2 255.255.255.252\ninterface GigabitEthernet0/1\n ip address 10.255.0.1 255.255.255.252\n!\n';
  s += 'ip route 10.10.0.0 255.255.0.0 10.255.0.2\n';
  s += e.edgeDefault ? okc('ip route 0.0.0.0 0.0.0.0 203.0.113.1') : dim('(no default route present) ' + bad('<-- 0.0.0.0/0 missing'));
  return s;
}
function showBriefRtr(dev) {
  if (dev === 'rtrcore') return 'Interface        IP-Address      Status    Protocol\nVlan10            10.10.10.1      up        up\nVlan20            10.10.20.1      up        up\nVlan30            10.10.30.1      up        up\nVlan40            10.10.40.1      up        up\nVlan50            10.10.50.1      up        up\nVlan60            10.10.60.1      up        up\nGi0/0             10.255.0.2      up        up\nGi0/1             10.255.0.5      up        up';
  if (dev === 'edge') return 'Interface        IP-Address      Status    Protocol\nGi0/0             203.0.113.2     up        up\nGi0/1             10.255.0.1      up        up';
  return 'Interface        IP-Address      Status    Protocol\nGi0/0             10.255.0.6      up        up\nGi0/1             10.20.10.1      up        up';
}
function showRouteEdge() {
  const e = S.env;
  let s = 'Codes: C - connected, S - static        <span class="c-dim">[simplified output]</span>\n';
  s += (e.edgeDefault ? 'Gateway of last resort is 203.0.113.1 to network 0.0.0.0' : bad('Gateway of last resort is NOT SET')) + '\n\n';
  s += 'C    203.0.113.0/30 is directly connected,   Gi0/0\n';
  s += 'C    10.255.0.0/30 is directly connected,    Gi0/1\n';
  s += 'S    10.10.0.0/16 [1/0] via 10.255.0.2\n';
  s += e.edgeDefault ? okc('S*   0.0.0.0/0 [1/0] via 203.0.113.1') : dim('% Network 0.0.0.0 not in table — internet-bound traffic is dropped here');
  return s;
}
function showRouteBranch() {
  return 'Codes: C - connected, S - static        <span class="c-dim">[simplified output]</span>\n' +
    'Gateway of last resort is 10.255.0.5 to network 0.0.0.0\n\n' +
    'C    10.255.0.4/30 is directly connected,   Gi0/0\n' +
    'C    10.20.10.0/24 is directly connected,   Gi0/1\n' +
    'S    10.10.0.0/16 [1/0] via 10.255.0.5\n' +
    'S*   0.0.0.0/0 [1/0] via 10.255.0.5';
}
function ipconfigHost(dev) {
  const e = S.env;
  if (dev === 'wms') {
    const gwOk = e.wmsGw === '10.10.50.1';
    return 'Windows IP Configuration — WMS-SRV (static)\n\n' +
      '   IPv4 Address. . . . : 10.10.50.30\n' +
      '   Subnet Mask . . . . : 255.255.255.0\n' +
      '   Default Gateway . . : ' + (gwOk ? okc(e.wmsGw) : bad(e.wmsGw + '   <-- nothing listens at .254 (gateway should be 10.10.50.1)')) + '\n' +
      '   DHCP Enabled. . . . : No';
  }
  if (dev === 'cfo') {
    const mask = e.cfoMask === 24 ? '255.255.255.0' : e.cfoMask === 28 ? '255.255.255.240' : '255.255.255.128';
    const mOk = e.cfoMask === 24;
    return 'Windows IP Configuration — CFO-PC (static)\n\n' +
      '   IPv4 Address. . . . : 10.10.60.22\n' +
      '   Subnet Mask . . . . : ' + (mOk ? okc(mask) : bad(mask + '   (/28)')) + '\n' +
      (mOk ? '' : bad('   ^ gateway 10.10.60.1 is OUTSIDE 10.10.60.16-31 -> host cannot even ARP for it\n')) +
      '   Default Gateway . . : 10.10.60.1\n' +
      '   DHCP Enabled. . . . : No';
  }
  if (dev === 'hire') {
    if (e.hireMode === 'dhcp') return okc('Windows IP Configuration — NEW-HIRE-PC (DHCP)\n\n   IPv4 Address. . . . : 10.10.60.73\n   Subnet Mask . . . . : 255.255.255.0\n   Default Gateway . . : 10.10.60.1\n   DHCP Enabled. . . . : Yes   (lease from SRV-DHCP)');
    return bad('Windows IP Configuration — NEW-HIRE-PC (static — copy-pasted from a floor sheet)\n\n') +
      '   IPv4 Address. . . . : ' + bad('10.10.10.50') + '   <-- belongs to VLAN 10, this port is VLAN 60\n' +
      '   Subnet Mask . . . . : 255.255.255.0\n' +
      '   Default Gateway . . : ' + bad('10.10.10.1') + '   <-- no such device on this segment (ARP fails)\n' +
      '   DHCP Enabled. . . . : No';
  }
  return '';
}

/* ---------- config action definitions (the ONLY way to change the grid) ---------- */
function applyEnv(fn, logMsg) { fn(S.env); logEv(logMsg, 'sys'); save(); window.Lab.rerender(); }

const CONFIG_DEFS = {
  core1: { title: 'CONFIG — CORE-1 (spanning tree)', render(box) {
    box.innerHTML = `<div class="cfgform"><h4>spanning-tree vlan 30 priority</h4>
      <div class="row"><label>Priority</label>
      <select id="cfgPrio"><option value="32768">32768 — default</option><option value="24576">24576 — distribution tier primary</option><option value="4096">4096 — highest</option></select>
      <button class="btn small primary" id="cfgPrioGo">Apply</button></div>
      <p class="drawernote">Root bridge election: lowest bridge ID wins (priority first, then lowest MAC). Best practice: root on the distribution tier.</p></div>`;
    box.querySelector('#cfgPrioGo').addEventListener('click', () => {
      const v = parseInt(box.querySelector('#cfgPrio').value, 10);
      applyEnv(e => { e.core1Prio = v; }, `CONFIG: CORE-1 spanning-tree vlan 30 priority ${v}`);
      toast('CORE-1 priority applied: ' + v);
    });
  }},
  swwh2: { title: 'CONFIG — SW-WH-2', render(box) {
    box.innerHTML = `<div class="cfgform"><h4>spanning-tree vlan 30</h4>
      <div class="row"><button class="btn small ${S.env.wh2StpOn ? '' : 'primary'}" id="cfgStpOn">spanning-tree vlan 30 (enable)</button>
      <button class="btn small ${S.env.wh2StpOn ? 'danger' : ''}" id="cfgStpOff">no spanning-tree vlan 30</button></div>
      <p class="drawernote">This switch sits between CORE-1, CORE-2 and the rogue patch. A bridge with STP off cannot see — or prevent — loops.</p></div>
      <div class="cfgform"><h4>interface Gi0/3 (patch to SW-WH-1)</h4>
      <div class="row"><button class="btn small" id="cfgWh2Shut">shutdown</button><button class="btn small" id="cfgWh2Open">no shutdown</button>
      <span class="drawernote">state: ${S.env.wh2PatchDown ? 'admin down' : 'up'}</span></div></div>`;
    box.querySelector('#cfgStpOn').addEventListener('click', () => applyEnv(e => { e.wh2StpOn = true; }, 'CONFIG: SW-WH-2 — spanning-tree vlan 30 enabled'));
    box.querySelector('#cfgStpOff').addEventListener('click', () => applyEnv(e => { e.wh2StpOn = false; }, 'CONFIG: SW-WH-2 — spanning-tree vlan 30 disabled'));
    box.querySelector('#cfgWh2Shut').addEventListener('click', () => applyEnv(e => { e.wh2PatchDown = true; }, 'CONFIG: SW-WH-2 Gi0/3 shutdown'));
    box.querySelector('#cfgWh2Open').addEventListener('click', () => applyEnv(e => { e.wh2PatchDown = false; }, 'CONFIG: SW-WH-2 Gi0/3 no shutdown'));
  }},
  swwh1: { title: 'CONFIG — SW-WH-1', render(box) {
    box.innerHTML = `<div class="cfgform"><h4>shipping-office ports Fa0/10-18 — switchport access vlan</h4>
      <div class="row"><label>VLAN</label><select id="cfgShipVlan">
        <option value="2">2 — OLD-OFFICE (deprecated)</option><option value="30">30 — WAREHOUSE</option><option value="55">55 — PRINTERS</option></select>
        <button class="btn small primary" id="cfgShipGo">Apply to Fa0/10-18</button></div>
      <p class="drawernote">A port in a VLAN with no SVI and no DHCP scope leaves clients on 169.254.x.x (APIPA).</p></div>
      <div class="cfgform"><h4>interface Gi1/0/2 (trunk to CORE-2) — native VLAN</h4>
      <div class="row"><label>native</label><select id="cfgNat1"><option value="1">1</option><option value="999">999 — NATIVE-UNUSED</option></select>
      <button class="btn small primary" id="cfgNatGo">Apply</button></div>
      <p class="drawernote">Native VLAN must match on both ends of a trunk; CDP logs the mismatch.</p></div>
      <div class="cfgform"><h4>interface Gi1/0/23 (rogue patch to SW-WH-2 Gi0/3)</h4>
      <div class="row"><button class="btn small" id="cfgP1Shut">shutdown</button><button class="btn small" id="cfgP1Open">no shutdown</button>
      <span class="drawernote">state: ${S.env.wh1PatchDown ? 'admin down' : 'up'}</span></div></div>`;
    box.querySelector('#cfgShipGo').addEventListener('click', () => { const v = parseInt(box.querySelector('#cfgShipVlan').value, 10); applyEnv(e => { e.shipVlan = v; }, `CONFIG: SW-WH-1 Fa0/10-18 switchport access vlan ${v}`); toast('Shipping ports now in VLAN ' + v); });
    box.querySelector('#cfgNatGo').addEventListener('click', () => { const v = parseInt(box.querySelector('#cfgNat1').value, 10); applyEnv(e => { e.nativeWh1 = v; }, `CONFIG: SW-WH-1 Gi1/0/2 native vlan ${v}`); });
    box.querySelector('#cfgP1Shut').addEventListener('click', () => applyEnv(e => { e.wh1PatchDown = true; }, 'CONFIG: SW-WH-1 Gi1/0/23 shutdown'));
    box.querySelector('#cfgP1Open').addEventListener('click', () => applyEnv(e => { e.wh1PatchDown = false; }, 'CONFIG: SW-WH-1 Gi1/0/23 no shutdown'));
    box.querySelector('#cfgShipVlan').value = String(S.env.shipVlan);
    box.querySelector('#cfgNat1').value = String(S.env.nativeWh1);
  }},
  core2: { title: 'CONFIG — CORE-2', render(box) {
    box.innerHTML = `<div class="cfgform"><h4>interface Gi1/0/24 (trunk to SW-WH-1) — native VLAN</h4>
      <div class="row"><label>native</label><select id="cfgNat2"><option value="999">999 — NATIVE-UNUSED</option><option value="1">1</option></select>
      <button class="btn small primary" id="cfgNat2Go">Apply</button></div>
      <p class="drawernote">Align with SW-WH-1 Gi1/0/2 — either side may move, both must agree.</p></div>`;
    box.querySelector('#cfgNat2Go').addEventListener('click', () => { const v = parseInt(box.querySelector('#cfgNat2').value, 10); applyEnv(e => { e.nativeCore2 = v; }, `CONFIG: CORE-2 Gi1/0/24 native vlan ${v}`); });
    box.querySelector('#cfgNat2').value = String(S.env.nativeCore2);
  }},
  rtrcore: { title: 'CONFIG — RTR-CORE', render(box) {
    const e = S.env;
    box.innerHTML = `<div class="cfgform"><h4>static routes</h4>
      <div class="row"><label>route</label><select id="cfgRtPfx"><option value="10.20.10.0">10.20.10.0 255.255.255.0</option></select>
      <label>via</label><select id="cfgRtNh"><option value="10.255.0.6">10.255.0.6 (BR-RTR)</option></select>
      <button class="btn small primary" id="cfgRtAdd">${e.coreBranchRoute ? 'Re-apply' : 'Add route'}</button>
      ${e.coreBranchRoute ? '<button class="btn small danger" id="cfgRtDel">Remove</button>' : ''}</div>
      ${e.staleRoute ? `<div class="row"><span class="drawernote">Stale entry in table: 10.99.0.0/16 via 10.255.0.9</span><button class="btn small danger" id="cfgStaleDel">Remove stale route</button></div>` : ''}</div>
      <div class="cfgform"><h4>ACL FINLOCK (applied OUT on Vlan50 — dst is always host 10.10.50.20 / HR-SRV)</h4>
      <table class="acltable"><thead><tr><th>seq</th><th>action</th><th>source</th><th></th></tr></thead><tbody id="aclRows"></tbody></table>
      <div class="row"><button class="btn small" id="aclAdd">Add entry</button><button class="btn small danger" id="aclDel">Remove ACL from interface</button></div>
      <p class="drawernote">Entries run top-down, first match wins, implicit deny at the end. The intent of FINLOCK: finance AND branch accounting may reach HR-SRV; the servers subnet may reach it; everyone else is denied.</p></div>`;
    const rows = box.querySelector('#aclRows');
    e.acl.entries.forEach((en, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${en.seq}</td>
        <td><select data-i="${i}" data-k="action"><option value="permit">permit</option><option value="deny">deny</option></select></td>
        <td><select data-i="${i}" data-k="src">
          <option value="10.10.60.0/24">10.10.60.0 0.0.0.255 (finance)</option>
          <option value="10.20.10.0/24">10.20.10.0 0.0.0.255 (branch)</option>
          <option value="10.10.50.0/24">10.10.50.0 0.0.0.255 (servers)</option>
          <option value="any">any</option></select></td>
        <td><button class="btn small danger" data-del="${i}" aria-label="delete entry ${en.seq}">✕</button></td>`;
      rows.appendChild(tr);
      tr.querySelector('[data-k=action]').value = en.action;
      tr.querySelector('[data-k=src]').value = en.src;
      tr.querySelectorAll('select').forEach(sel => sel.addEventListener('change', () => {
        const idx = parseInt(sel.getAttribute('data-i'), 10), k = sel.getAttribute('data-k');
        applyEnv(env => { env.acl.entries[idx][k] = sel.value; }, `CONFIG: FINLOCK seq ${env.acl.entries[idx].seq} ${k} -> ${sel.value}`);
      }));
      tr.querySelector('[data-del]').addEventListener('click', () => {
        applyEnv(env => { env.acl.entries.splice(i, 1); }, `CONFIG: FINLOCK entry ${en.seq} deleted`);
      });
    });
    box.querySelector('#aclAdd').addEventListener('click', () => {
      applyEnv(env => {
        const seqs = env.acl.entries.map(x => x.seq);
        let ns = 15; while (seqs.includes(ns)) ns += 1;
        env.acl.entries.push({ seq: ns, action: 'permit', src: '10.20.10.0/24' });
        env.acl.entries.sort((a, b) => a.seq - b.seq);
      }, 'CONFIG: FINLOCK entry added (default: permit branch)');
    });
    box.querySelector('#aclDel').addEventListener('click', () => {
      applyEnv(env => { env.acl.applied = false; }, 'CONFIG: ip access-group FINLOCK removed from Vlan50');
      toast('FINLOCK removed from Vlan50 — HR-SRV is now open to EVERYONE');
    });
    const rtAdd = box.querySelector('#cfgRtAdd');
    if (rtAdd) rtAdd.addEventListener('click', () => { applyEnv(env => { env.coreBranchRoute = true; }, 'CONFIG: ip route 10.20.10.0 255.255.255.0 10.255.0.6'); toast('Branch route installed on RTR-CORE'); });
    const rtDel = box.querySelector('#cfgRtDel');
    if (rtDel) rtDel.addEventListener('click', () => applyEnv(env => { env.coreBranchRoute = false; }, 'CONFIG: route to 10.20.10.0/24 removed'));
    const stDel = box.querySelector('#cfgStaleDel');
    if (stDel) stDel.addEventListener('click', () => applyEnv(env => { env.staleRoute = false; }, 'CONFIG: stale route 10.99.0.0/16 removed'));
  }},
  edge: { title: 'CONFIG — EDGE-RTR', render(box) {
    const e = S.env;
    box.innerHTML = `<div class="cfgform"><h4>default route</h4>
      <div class="row"><label>route</label><select id="cfgDefPfx"><option value="0.0.0.0">0.0.0.0 0.0.0.0 (default)</option></select>
      <label>via</label><select id="cfgDefNh"><option value="203.0.113.1">203.0.113.1 (ISP)</option></select>
      <button class="btn small primary" id="cfgDefAdd">${e.edgeDefault ? 'Re-apply' : 'Add default route'}</button>
      ${e.edgeDefault ? '<button class="btn small danger" id="cfgDefDel">Remove</button>' : ''}</div>
      <p class="drawernote">The default route (0.0.0.0/0) is what a router uses when nothing more-specific matches. The edge router is its natural home.</p></div>`;
    const add = box.querySelector('#cfgDefAdd');
    add.addEventListener('click', () => { applyEnv(env => { env.edgeDefault = true; }, 'CONFIG: ip route 0.0.0.0 0.0.0.0 203.0.113.1'); toast('Default route restored on EDGE-RTR'); });
    const del = box.querySelector('#cfgDefDel');
    if (del) del.addEventListener('click', () => applyEnv(env => { env.edgeDefault = false; }, 'CONFIG: default route removed from EDGE-RTR'));
  }},
  dhcp: { title: 'DHCP SERVICE — SRV-DHCP', render(box) { renderDhcpConfig(box); }},
  wms: { title: 'NIC — WMS-SRV', render(box) {
    box.innerHTML = `<div class="cfgform"><h4>WMS-SRV network settings (static)</h4>
      <div class="row"><label>IP</label><input type="text" value="10.10.50.30" readonly style="width:130px"><label>mask</label><input type="text" value="255.255.255.0" readonly style="width:130px"></div>
      <div class="row"><label>gateway</label><input type="text" id="cfgWmsGw" value="${esc(S.env.wmsGw)}" style="width:140px" aria-label="WMS gateway">
      <button class="btn small primary" id="cfgWmsGo">Apply</button></div>
      <p class="drawernote">The servers subnet gateway is 10.10.50.1 (Vlan50 SVI on RTR-CORE).</p></div>`;
    box.querySelector('#cfgWmsGo').addEventListener('click', () => {
      const v = box.querySelector('#cfgWmsGw').value.trim();
      if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(v)) { toast('Not a valid IPv4 address'); return; }
      applyEnv(env => { env.wmsGw = v; }, `CONFIG: WMS-SRV default gateway -> ${v}`);
    });
  }},
  cfo: { title: 'NIC — CFO-PC', render(box) {
    box.innerHTML = `<div class="cfgform"><h4>CFO-PC network settings (static)</h4>
      <div class="row"><label>IP</label><input type="text" value="10.10.60.22" readonly style="width:130px"><label>gateway</label><input type="text" value="10.10.60.1" readonly style="width:130px"></div>
      <div class="row"><label>subnet mask</label><select id="cfgCfoMask">
        <option value="28">255.255.255.240 (/28)</option><option value="24">255.255.255.0 (/24)</option><option value="25">255.255.255.128 (/25)</option></select>
        <button class="btn small primary" id="cfgCfoGo">Apply</button></div>
      <p class="drawernote">VLAN 60 (finance) is a /24: gateway .1, hosts .2-.254. The mask tells the host which destinations are "local".</p></div>`;
    box.querySelector('#cfgCfoGo').addEventListener('click', () => {
      const v = parseInt(box.querySelector('#cfgCfoMask').value, 10);
      applyEnv(env => { env.cfoMask = v; }, `CONFIG: CFO-PC subnet mask -> /${v}`);
    });
    box.querySelector('#cfgCfoMask').value = String(S.env.cfoMask);
  }},
  hire: { title: 'NIC — NEW-HIRE-PC', render(box) {
    box.innerHTML = `<div class="cfgform"><h4>NEW-HIRE-PC addressing mode</h4>
      <div class="row"><label><input type="radio" name="hireMode" value="dhcp" ${S.env.hireMode === 'dhcp' ? 'checked' : ''}> DHCP (recommended for user devices)</label></div>
      <div class="row"><label><input type="radio" name="hireMode" value="static" ${S.env.hireMode === 'static' ? 'checked' : ''}> Static — 10.10.10.50/24 gw 10.10.10.1 (as typed on Sunday)</label></div>
      <div class="row"><button class="btn small primary" id="cfgHireGo">Apply</button></div>
      <p class="drawernote">This port is provisioned in VLAN 60 (finance, 10.10.60.0/24). DHCP hands out addresses that actually belong to the segment.</p></div>`;
    box.querySelector('#cfgHireGo').addEventListener('click', () => {
      const v = box.querySelector('input[name=hireMode]:checked').value;
      applyEnv(env => { env.hireMode = v; }, `CONFIG: NEW-HIRE-PC addressing -> ${v}`);
    });
  }}
};
function renderDhcpConfig(box) {
  const e = S.env;
  const cap = e.dhcp.bits === 25 ? 125 : 253;
  const used = Math.min(125, cap);
  const pct = Math.round(used / cap * 100);
  box.innerHTML = `<div class="cfgform"><h4>POOL-TRAIN (training VLAN 40) — edit</h4>
    <div class="row"><label>network</label><select id="cfgPoolNet">
      <option value="25" ${e.dhcp.bits === 25 ? 'selected' : ''}>10.10.40.0/25 (125 assignable)</option>
      <option value="24" ${e.dhcp.bits === 24 ? 'selected' : ''}>10.10.40.0/24 (253 assignable)</option></select></div>
    <div class="row"><label>lease</label><select id="cfgPoolLease">
      <option value="1" ${e.dhcp.leaseH === 1 ? 'selected' : ''}>1 hour</option>
      <option value="8" ${e.dhcp.leaseH === 8 ? 'selected' : ''}>8 hours</option>
      <option value="24" ${e.dhcp.leaseH === 24 ? 'selected' : ''}>1 day</option>
      <option value="168" ${e.dhcp.leaseH === 168 ? 'selected' : ''}>7 days</option></select>
      <button class="btn small primary" id="cfgPoolGo">Apply</button></div>
    <div class="row"><span class="drawernote">Demand today: 130 laptops. Utilization now: ${used}/${cap} (${pct}%).</span></div></div>`;
  box.querySelector('#cfgPoolGo').addEventListener('click', () => {
    const bits = parseInt(box.querySelector('#cfgPoolNet').value, 10);
    const lease = parseInt(box.querySelector('#cfgPoolLease').value, 10);
    applyEnv(env => { env.dhcp.bits = bits; env.dhcp.leaseH = lease; }, `CONFIG: POOL-TRAIN -> 10.10.40.0/${bits}, lease ${lease}h`);
    toast('POOL-TRAIN updated');
  });
}
function dhcpPoolRows() {
  const e = S.env;
  const rows = [
    ['POOL-OFFICE', '10.10.10.0/24', 58, 253, '1d'],
    ['POOL-GUEST', '10.10.20.0/24', 12, 253, '2h'],
    ['POOL-WH', '10.10.30.0/24', 96, 253, '12h'],
    ['POOL-TRAIN', `10.10.40.0/${e.dhcp.bits}`, Math.min(125, e.dhcp.bits === 25 ? 125 : 125), e.dhcp.bits === 25 ? 125 : 253, e.dhcp.leaseH >= 24 ? (e.dhcp.leaseH / 24 + 'd') : e.dhcp.leaseH + 'h'],
    ['POOL-FIN', '10.10.60.0/24', 21, 253, '1d']
  ];
  return rows.map(r => {
    const pct = Math.round(r[2] / r[3] * 100);
    const cls = pct >= 95 ? 'red' : pct >= 85 ? 'amber' : 'green';
    return `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}/${r[3]}</td><td>${r[4]}</td><td><span class="tag ${cls}">${pct}%</span></td></tr>`;
  }).join('');
}
const SHOW_COMMANDS = {
  rtrcore: [['show ip route', showIpRouteCore], ['show access-lists', showAcl], ['show ip interface brief', () => showBriefRtr('rtrcore')]],
  edge: [['show ip route', showRouteEdge], ['show running-config | section route', showRunEdge], ['show ip interface brief', () => showBriefRtr('edge')]],
  brrtr: [['show ip route', showRouteBranch], ['show ip interface brief', () => showBriefRtr('brrtr')]],
  core1: [['show spanning-tree vlan 30', showSpanCore1], ['show ip interface brief', () => showBriefRtr('rtrcore')]],
  core2: [['show spanning-tree vlan 30', showSpanCore2], ['show interfaces trunk', showTrunkCore2]],
  swtr: [['show spanning-tree vlan 30', showSpanSwtr]],
  swwh1: [['show vlan brief', showVlanBriefSwwh1], ['show spanning-tree vlan 30', showSpanSwwh1], ['show interfaces trunk', showTrunkSwwh1]],
  swwh2: [['show spanning-tree vlan 30', showSpanSwwh2], ['show running-config | section vlan,span', showRunSwwh2]],
  swhq: [['show vlan brief', () => 'VLAN Name             Status    Ports\n10   HQ-OFFICE        active    Fa0/1-40\n20   GUEST            active    Fa0/41-44\n60   FINANCE          active    Fa0/45-48\n999  NATIVE-UNUSED    active    (trunk native only)']]
};
const TAB_LABELS = { show: 'SHOW', config: 'CONFIG', log: 'LOG', pools: 'POOLS', bindings: 'BINDINGS', ipconfig: 'IPCONFIG', nic: 'NIC SETTINGS' };
let cmdOut = '';

function renderDrawer() {
  const pick = $('devPick');
  if (!pick.options.length) {
    Object.keys(DEVICES).forEach(k => { const o = document.createElement('option'); o.value = k; o.textContent = `${DEVICES[k].name} — ${DEVICES[k].tag}`; pick.appendChild(o); });
    pick.addEventListener('change', () => window.Lab.openDevice(pick.value));
  }
  const body = $('devBody');
  if (!curDev) { $('devTag').textContent = 'no device'; body.innerHTML = '<p class="drawernote">Pick a device — or click one on the map — to read its show commands and apply configuration changes.</p>'; return; }
  const dev = DEVICES[curDev];
  pick.value = curDev;
  $('devTag').textContent = dev.tag;
  let tabsHtml = `<div class="dtabs" role="tablist" aria-label="${dev.name} console tabs">` +
    dev.tabs.map(t => `<button role="tab" data-tab="${t}" aria-selected="${t === curTab}">${TAB_LABELS[t]}</button>`).join('') + '</div>';
  body.innerHTML = tabsHtml + '<div id="devPane"></div>';
  body.querySelectorAll('.dtabs button').forEach(b => b.addEventListener('click', () => { curTab = b.getAttribute('data-tab'); renderDrawer(); }));
  const pane = body.querySelector('#devPane');
  if (curTab === 'show') {
    const cmds = SHOW_COMMANDS[curDev] || [];
    pane.innerHTML = '<div class="cmdlist" role="group" aria-label="show commands">' +
      cmds.map((c, i) => `<button data-cmd="${i}">${esc(c[0])}</button>`).join('') + '</div><div class="terminal" id="termOut">' + (cmdOut || dim('# select a command above')) + '</div>';
    pane.querySelectorAll('[data-cmd]').forEach(b => b.addEventListener('click', () => {
      cmdOut = cmds[parseInt(b.getAttribute('data-cmd'), 10)][1]();
      $('termOut').innerHTML = cmdOut;
    }));
  } else if (curTab === 'config') {
    CONFIG_DEFS[curDev].render(pane);
  } else if (curTab === 'log') {
    const logs = LOGS[curDev] || [];
    pane.innerHTML = '<div class="terminal">' + (logs.map(l => esc(l)).join('\n') || dim('(log buffer empty)')) + '</div>';
  } else if (curTab === 'pools') {
    pane.innerHTML = `<div class="terminal"><b>DHCP pools — SRV-DHCP 10.10.50.11</b>  <span class="c-dim">[simplified service UI]</span>
<table class="acltable"><thead><tr><th>pool</th><th>network</th><th>used/cap</th><th>lease</th><th>util</th></tr></thead><tbody>${dhcpPoolRows()}</tbody></table>
<span class="c-dim">Capacity = usable host addresses minus the gateway. POOL-TRAIN is the only scope this account may edit.</span></div>` +
      '<div id="devCfg"></div>';
    renderDhcpConfig(pane.querySelector('#devCfg'));
  } else if (curTab === 'bindings') {
    pane.innerHTML = '<div class="terminal"><b>Active bindings (sample)</b>\n' + BINDINGS.map(b => `${b[0]}  ${b[1].padEnd(15)} ${b[2].padEnd(12)} ${b[3]}`).join('\n') + '\n' + (S.env.dhcp.bits === 25 ? '<span class="c-bad">POOL-TRAIN: 0 free leases — new DISCOVERs get no OFFER</span>' : '<span class="c-ok">POOL-TRAIN: leases available</span>') + '</div>';
  } else if (curTab === 'ipconfig') {
    pane.innerHTML = '<div class="terminal">' + ipconfigHost(curDev) + '</div>';
  } else if (curTab === 'nic') {
    CONFIG_DEFS[curDev].render(pane);
  }
}
