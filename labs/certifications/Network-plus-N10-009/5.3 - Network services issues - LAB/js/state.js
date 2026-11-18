/* =====================================================================
   Atlas NOC Command Deck — js/state.js
   Utilities, persistent state (per-mode localStorage), derived network
   facts (single source of truth), topology/ticket/gauge rendering,
   event log and toast.
   ===================================================================== */

/* ================= ATLAS NOC COMMAND DECK — core: state, data, topology ================= */
'use strict';

/* ---------- tiny utils ---------- */
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };
const shuffle = (arr, seed) => { const a = arr.slice(); let s = seed; for (let i = a.length - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; const j = Math.floor(s / 233280 * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* ---------- persistent state ---------- */
const LS_BASE = 'atlas-noc-deck-v1';
const LS_LEGACY = 'atlas-noc-deck-v1'; // pre-audit single-key storage; removed on first save
const lsKeyFor = (m) => LS_BASE + '-' + (m || 'X');
const DEFAULT_STATE = {
  v: 1,
  mode: null,            // 'M' | 'H'
  briefingSeen: false,
  doneShown: false,      // audit R7: completion modal auto-shows once per completed run
  env: {
    core1Prio: 32768,
    wh2StpOn: false,
    wh1PatchDown: false,
    wh2PatchDown: false,
    shipVlan: 2,
    nativeWh1: 1, nativeCore2: 999,
    acl: { applied: true, entries: [
      { seq: 10, action: 'deny',    src: '10.10.60.0/24' },
      { seq: 20, action: 'permit',  src: '10.10.50.0/24' },
      { seq: 30, action: 'deny',    src: 'any' }
    ]},
    coreBranchRoute: false,        // ip route 10.20.10.0 255.255.255.0 10.255.0.6
    staleRoute: true,              // 10.99.0.0/16 via 10.255.0.9 (decoy, decommissioned lab net)
    edgeDefault: false,            // ip route 0.0.0.0 0.0.0.0 203.0.113.1
    dhcp: { bits: 25, leaseH: 168 },
    wmsGw: '10.10.50.254', wmsMask: 24,
    cfoIp: '10.10.60.22', cfoMask: 28, cfoGw: '10.10.60.1',
    hireMode: 'static'
  },
  ans: {},               // per-objective answer store
  obj: {},               // per-objective: {done, attempts, hints, doneFirstTry}
  probes: [],            // log of probe summaries
  sweep: { run: false, pass: false },
  quiz: {},              // qid -> {pick, correct}
  scoreAdjusted: null
};
let S = null;

function freshState() { return JSON.parse(JSON.stringify(DEFAULT_STATE)); }
/* Audit B1: per-mode storage keys — switching modes must never wipe the other mode's progress. */
function save() {
  try {
    localStorage.setItem(lsKeyFor(S.mode), JSON.stringify(S));
    try { localStorage.removeItem(LS_LEGACY); } catch (e2) {} // one-time cleanup of pre-audit single key
  } catch (e) { /* degrade gracefully */ }
}
function loadFor(m) {
  try {
    const raw = localStorage.getItem(lsKeyFor(m));
    if (raw) { const p = JSON.parse(raw); if (p && p.v === DEFAULT_STATE.v && p.mode === m) return p; }
  } catch (e) {}
  return null;
}

/* ---------- derived network facts (single source of truth for probes/gauges) ---------- */
function F() {
  const e = S.env;
  const stormOn = !e.wh2StpOn && !e.wh1PatchDown && !e.wh2PatchDown;
  const seq10 = e.acl.entries.find(x => x.seq === 10);
  const seq30 = e.acl.entries.find(x => x.seq === 30);
  const branchPermit = e.acl.entries.some(x => x.action === 'permit' && x.src === '10.20.10.0/24');
  return {
    stormOn,
    stormCleared: !stormOn,
    rootIsCore1: e.core1Prio < 32768,
    internetUp: !!e.edgeDefault,
    branchUp: !!e.coreBranchRoute,
    finOk: !!e.acl.applied && seq10.action === 'permit',
    aclIntact: !!e.acl.applied && seq10.action === 'permit' && seq30 && seq30.action === 'deny' && e.acl.entries.length >= 3,
    branchHrOk: branchPermit,
    nativeOk: e.nativeWh1 === e.nativeCore2,
    shipOk: e.shipVlan === 30,
    shipHasLease: e.shipVlan === 30,
    trainHasLease: e.dhcp.bits >= 24,
    trainOk: e.dhcp.bits >= 24 && e.dhcp.leaseH <= 24,
    wmsOk: e.wmsGw === '10.10.50.1',
    cfoOk: e.cfoMask === 24,
    hireOk: e.hireMode === 'dhcp',
    warehouseOk: false
  };
}
function withWarehouse(f) { f.warehouseOk = f.stormCleared && f.shipOk && f.wmsOk; return f; }

/* ---------- topology data ---------- */
const nodeById = (id) => NODES.find(n => n.id === id);
function edgeBetween(a, b) { return EDGES.find(e => (e.a === a && e.b === b) || (e.a === b && e.b === a)); }

/* ---------- SVG rendering ---------- */
function nodeHalfExtents(n) {
  if (n.shape === 'router' || n.shape === 'cloud') return { rx: n.shape === 'router' ? 30 : 46, ry: n.shape === 'router' ? 30 : 26 };
  return { rx: (n.w || 100) / 2, ry: (n.h || 34) / 2 };
}
function renderTopology() {
  const svg = $('topo');
  svg.innerHTML = '';
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (t, at) => { const n = document.createElementNS(NS, t); for (const k in at) n.setAttribute(k, at[k]); return n; };
  // defs for probe glow
  const defs = mk('defs', {});
  defs.innerHTML = '<filter id="glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
  svg.appendChild(defs);
  const gE = mk('g', { id: 'gEdges' }); svg.appendChild(gE);
  EDGES.forEach(e => {
    const A = nodeById(e.a), B = nodeById(e.b);
    const ha = nodeHalfExtents(A), hb = nodeHalfExtents(B);
    const dx = B.x - A.x, dy = B.y - A.y, len = Math.hypot(dx, dy);
    const trimA = e.kind === 'patch' ? 0 : (A.shape === 'router' ? ha.rx * .72 : ha.rx * .92);
    const trimB = e.kind === 'patch' ? 0 : (B.shape === 'router' ? hb.rx * .72 : hb.rx * .92);
    const x1 = A.x + dx / len * trimA, y1 = A.y + dy / len * trimA;
    const x2 = B.x - dx / len * trimB, y2 = B.y - dy / len * trimB;
    const line = mk('line', { x1, y1, x2, y2, class: 'edge ' + (e.kind === 'trunk' ? 'trunk' : '') + (e.kind === 'patch' ? ' patchl' : ''), 'data-edge': e.id });
    gE.appendChild(line);
    if (e.label) {
      const t = mk('text', { x: (x1 + x2) / 2, y: (y1 + y2) / 2 - 5, class: 'elabel', 'text-anchor': 'middle' });
      t.textContent = e.label; gE.appendChild(t);
    }
  });
  const gN = mk('g', { id: 'gNodes' }); svg.appendChild(gN);
  NODES.forEach(n => {
    const g = mk('g', { class: 'node', 'data-node': n.id, role: 'button', tabindex: '0', 'aria-label': (n.dev ? 'Open console for ' : 'Endpoint group ') + n.label });
    if (n.shape === 'router') { g.appendChild(mk('circle', { cx: n.x, cy: n.y, r: 30 })); }
    else if (n.shape === 'cloud') { g.appendChild(mk('ellipse', { cx: n.x, cy: n.y, rx: 48, ry: 26 })); }
    else { const w = n.w || 92, h = n.h || 32; g.appendChild(mk('rect', { x: n.x - w / 2, y: n.y - h / 2, width: w, height: h, rx: 5 })); }
    const icon = mk('g', { transform: `translate(${n.x},${n.y - (n.shape === 'router' ? 6 : n.shape === 'cloud' ? -2 : 0)})` });
    icon.innerHTML = ICONS[n.shape] || '';
    g.appendChild(icon);
    let labelY, subY;
    if (n.shape === 'grp' || n.shape === 'srv') {
      const w = n.w || 110;
      const ig = mk('g', { transform: `translate(${n.x - w / 2 + 14},${n.y})` });
      ig.innerHTML = ICONS[n.shape] || '';
      icon.innerHTML = ''; icon.removeAttribute('transform');
      labelY = n.y + 1; subY = n.y + (n.h || 36) / 2 + 12;
    } else if (n.shape === 'router') { labelY = n.y + 16; subY = n.y + 28; }
    else if (n.shape === 'cloud') { labelY = n.y + 20; subY = n.y + 32; }
    else { labelY = n.y + 1; subY = n.y + 27; }
    const t1 = mk('text', { x: n.x, y: labelY, 'text-anchor': 'middle' });
    t1.textContent = n.label; g.appendChild(t1);
    const t2 = mk('text', { x: n.x, y: subY, 'text-anchor': 'middle', class: 'nip' });
    t2.textContent = n.sub; g.appendChild(t2);
    gN.appendChild(g);
    const open = () => { if (n.dev) window.Lab.openDevice(n.dev); else window.Lab.onEndpointClick(n.end); };
    g.addEventListener('click', open);
    g.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); open(); } });
  });
  updateTopology();
}
function updateTopology() {
  const f = withWarehouse(F());
  EDGES.forEach(e => {
    const line = document.querySelector(`[data-edge="${e.id}"]`);
    if (!line) return;
    line.classList.remove('storm', 'bad');
    if (e.id === 'l14' && f.stormOn) { line.classList.add('storm'); }
    if (e.id === 'l14' && !f.stormOn && !S.env.wh1PatchDown && !S.env.wh2PatchDown) line.classList.remove('bad');
  });
  document.querySelectorAll('.node').forEach(g => {
    const id = g.getAttribute('data-node');
    g.classList.remove('hot', 'down');
    if (f.stormOn && (id === 'swwh1' || id === 'swwh2' || id === 'wh' || id === 'ship')) g.classList.add('down');
    if (!f.internetUp && id === 'cloud') g.classList.add('down');
    if (!f.branchUp && id === 'brpcs') g.classList.add('down');
    if (!f.shipOk && id === 'ship') g.classList.add('down');
    if (!f.trainHasLease && id === 'train') g.classList.add('down');
    if (!f.wmsOk && id === 'srv') g.classList.add('down');
  });
}

/* ---------- gauges / tickets ---------- */
const GAUGES = [
  { id: 'net',   label: 'INTERNET',  ok: (f) => f.internetUp },
  { id: 'branch',label: 'BRANCH',    ok: (f) => f.branchUp },
  { id: 'wh',    label: 'WAREHOUSE', ok: (f) => f.warehouseOk },
  { id: 'train', label: 'TRAINING',  ok: (f) => f.trainOk },
  { id: 'fin',   label: 'FINANCE',   ok: (f) => f.finOk && f.cfoOk }
];
function renderGauges() {
  const f = withWarehouse(F());
  $('gauges').innerHTML = GAUGES.map(g => {
    const ok = g.ok(f);
    return `<div class="gauge ${ok ? 'ok' : ''}" title="${g.label} service"><span class="lamp" aria-hidden="true"></span>${g.label}</div>`;
  }).join('');
}

const TICKETS = [
  { id:'T1', title:'Warehouse scanners crawling', body:'Scanners time out opening WMS; warehouse switch fans screaming. Started after a vendor added SW-WH-2 and "tidied cabling" on Sunday.', dev:'swwh1', objM:'M3', objH:'H2',
    fixed:(f) => f.stormCleared && S.env.core1Prio === 24576 },
  { id:'T2', title:'Shipping office: no network', body:'All shipping-office PCs show 169.254.x.x since Sunday. Core-2 also logs a native VLAN mismatch against SW-WH-1.', dev:'swwh1', objM:'M4', objH:'H3',
    fixed:(f) => f.shipOk && f.nativeOk },
  { id:'T3', title:'Finance locked out of payroll', body:'Finance PCs cannot open the payroll app on HR-SRV. Other departments are blocked too — but that part is intentional policy.', dev:'rtrcore', objM:'M5', objH:'H4',
    fixed:(f) => f.finOk && f.aclIntact },
  { id:'T4', title:'Branch cannot reach HQ', body:'Branch office cannot open anything at HQ. Started after Sunday\'s "route cleanup" on RTR-CORE.', dev:'rtrcore', objM:'M6', objH:'H5',
    fixed:(f) => f.branchUp },
  { id:'T5', title:'No internet anywhere', body:'Every site loses the internet; internal apps are fine. EDGE-RTR was touched during Sunday\'s failover test.', dev:'edge', objM:'M7', objH:'H1',
    fixed:(f) => f.internetUp },
  { id:'T6', title:'Training laptops: 169.254.x.x', body:'Onboarding day: 130 new hires. The first ~120 laptops work; the rest self-assigned 169.254.x.x.', dev:'dhcp', objM:'M8', objH:'H3',
    fixed:(f) => f.trainOk },
  { id:'T7', title:'CFO + warehouse terminal dead', body:'CFO\'s PC reaches nothing at all. A warehouse terminal cannot open WMS — yet pings from the server room to WMS work.', dev:'wms', objM:'M9', objH:'H6',
    fixed:(f) => f.wmsOk && f.cfoOk }
];
function ticketStatus(t) {
  const f = withWarehouse(F());
  return t.fixed(f) ? 'fixed' : 'open';
}
function renderTickets() {
  const box = $('tickets');
  box.innerHTML = '';
  TICKETS.forEach(t => {
    const st = ticketStatus(t);
    const d = el('div', 'tk ' + (st === 'fixed' ? 'fixed' : ''));
    const objId = S.mode === 'M' ? t.objM : t.objH;
    const objState = S.obj[objId];
    const diag = objState && objState.attempts > 0;
    d.innerHTML = `<div class="tkhead"><b>${t.id}</b><span class="tag ${st === 'fixed' ? 'green' : 'red'}">${st === 'fixed' ? 'RESOLVED' : 'OPEN'}</span></div>
      <p><b style="color:var(--ink)">${esc(t.title)}</b> — ${esc(t.body)}</p>
      <div class="tkobj">work order <button data-obj="${objId}">${objId}</button> ${diag && st !== 'fixed' ? '<span class="tag amber">DIAGNOSING</span>' : ''}</div>`;
    d.addEventListener('click', (ev) => {
      if (ev.target.tagName === 'BUTTON') { window.Lab.goToObjective(ev.target.getAttribute('data-obj')); }
      else { window.Lab.openDevice(t.dev); window.Lab.scrollToStage(); }
    });
    box.appendChild(d);
  });
  const open = TICKETS.filter(t => ticketStatus(t) !== 'fixed').length;
  $('railCount').textContent = `${TICKETS.length - open}/${TICKETS.length} resolved`;
}

/* ---------- event log / toast ---------- */
function logEv(msg, cls) {
  S.probes.unshift({ m: msg, c: cls || '', t: new Date().toLocaleTimeString('en-GB', { hour12: false }) });
  if (S.probes.length > 80) S.probes.length = 80;
  renderEvlog(); save();
}
function renderEvlog() {
  const b = $('evlog');
  b.innerHTML = S.probes.map(p => `<div class="${p.c}">[${p.t}] ${p.m}</div>`).join('') || '<div class="sys">Event log empty — launch a probe or change a config.</div>';
}
let toastTimer = null;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg; t.style.display = 'block';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.style.display = 'none'; }, 2600);
}
