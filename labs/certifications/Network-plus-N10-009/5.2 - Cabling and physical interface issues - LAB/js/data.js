// ── Lab 52 · CompTIA Network+ N10-009 · 5.2 Cabling & Physical Interface Issues ──
// All data is SYNTHETIC training data. Fictional org: Cedar Valley Technical College.
// Ported 1:1 from src/lib/lab52/data.ts (content, wording, answers identical).
'use strict';

// ── Cables (spool rack) ──────────────────────────────────────────────
const CABLES = [
  { id: 'c-cat5e-old', label: 'Cat5e UTP patch — old stock', spec: '100 MHz · 1 Gb/s @ 100 m · PVC · hand-stock', kind: 'copper', wiring: 'straight', maxM: 100 },
  { id: 'c-cat6-str', label: 'Cat6 UTP factory patch — 3 m', spec: '250 MHz · 1/10 Gb/s (10G ≤ 55 m) · PVC', kind: 'copper', wiring: 'straight', maxM: 100 },
  { id: 'c-cat6-str-5m', label: 'Cat6 UTP factory patch — 5 m', spec: '250 MHz · 1/10 Gb/s (10G ≤ 55 m) · PVC', kind: 'copper', wiring: 'straight', maxM: 100 },
  { id: 'c-cat6a-str', label: 'Cat6a STP factory patch — 3 m', spec: '500 MHz · 10 Gb/s @ 100 m · shielded', kind: 'copper', wiring: 'straight', maxM: 100 },
  { id: 'c-cat6-xover', label: 'Cat6 crossover — 2 m (legacy)', spec: 'TX pair (1,2) crossed onto RX pair (3,6)', kind: 'copper', wiring: 'crossover', maxM: 100 },
  { id: 'c-cat8-str', label: 'Cat8 STP factory patch — 2 m', spec: '2 GHz · 25/40 Gb/s · ≤ 30 m channel', kind: 'copper', wiring: 'straight', maxM: 30 },
  { id: 'c-cat6-plenum', label: 'Cat6 plenum-rated (F/UTP) — 15 m', spec: 'fire-code jacket for air-handling (plenum) spaces', kind: 'copper', wiring: 'straight', plenum: true, maxM: 100 },
  { id: 'f-om3-lc', label: 'OM3 multimode LC-LC — 5 m', spec: '50/125 µm · aqua · 850 nm laser-optimized', kind: 'fiber', fiberType: 'MMF', grade: 'OM3', conn: 'LC-LC', maxM: 550 },
  { id: 'f-om4-lc', label: 'OM4 multimode LC-LC — 5 m', spec: '50/125 µm · violet · 850 nm', kind: 'fiber', fiberType: 'MMF', grade: 'OM4', conn: 'LC-LC', maxM: 550 },
  { id: 'f-om2-sc', label: 'OM2 multimode SC-SC — 10 m (legacy)', spec: '50/125 µm · orange · SC connectors', kind: 'fiber', fiberType: 'MMF', grade: 'OM2', conn: 'SC-SC', maxM: 550 },
  { id: 'f-os2-lc', label: 'OS2 single-mode LC-LC — 5 m', spec: '9/125 µm · yellow · 1310/1550 nm', kind: 'fiber', fiberType: 'SMF', grade: 'OS2', conn: 'LC-LC', maxM: 10000 },
];

// ── Transceivers (optics tray) ───────────────────────────────────────
const TRANSCEIVERS = [
  { id: 't-sx', model: '1000Base-SX', form: 'SFP', speedG: 1, fiberType: 'MMF', wavelengthNm: 850, maxM: 550, note: 'GLC-SX-MM — multimode, 850 nm' },
  { id: 't-lx10', model: '1000Base-LX10', form: 'SFP', speedG: 1, fiberType: 'SMF', wavelengthNm: 1310, maxM: 10000, note: 'GLC-LX10 — single-mode, 1310 nm' },
  { id: 't-sr', model: '10GBase-SR', form: 'SFP+', speedG: 10, fiberType: 'MMF', wavelengthNm: 850, maxM: 400, note: 'SFP-10G-SR — needs an SFP+ slot' },
  { id: 't-lr', model: '10GBase-LR', form: 'SFP+', speedG: 10, fiberType: 'SMF', wavelengthNm: 1310, maxM: 10000, note: 'SFP-10G-LR — needs an SFP+ slot' },
];

// ── Tickets ──────────────────────────────────────────────────────────
const TICKETS = [
  {
    id: 'TK-1042', code: 'TK-1042', real: true,
    title: 'Lab PC WS-12 shows "no link"',
    body: 'Library Lab 2, seat 12. Port P3 was fine Friday; now the NIC shows no link at all. Patch cord at the wall was replaced last week with a hand-crimped one from the parts bin.',
  },
  {
    id: 'TK-1043', code: 'TK-1043', real: true,
    title: 'Office PC WS-07 crawls',
    body: 'Admissions office. File copies stall, VoIP breaks up. Link light IS on, but the PC negotiated 100 Mb/s on a gigabit drop.',
  },
  {
    id: 'TK-1044', code: 'TK-1044', real: true,
    title: 'Conference room CR-2 drops constantly',
    body: 'Drops every meeting, reconnects after ~30 s. Room AV renovation last month bundled new low-voltage cabling with the power conduit along the wall. Submitter suggests "maybe duplex mismatch?"',
  },
  {
    id: 'TK-1045', code: 'TK-1045', real: true,
    title: 'AP-3 boot-loops since camera install',
    body: 'Library mezzanine AP-3 (802.3at, class 4, 25.5 W) cycles: LEDs on, boot, off, repeat — since the new camera C-9 was connected to P14 yesterday. Switch: SW-ACCESS-01, PoE budget 95 W.',
  },
  {
    id: 'TK-1046', code: 'TK-1046', real: true,
    title: 'Core uplink A1 dark',
    body: 'Uplink to SW-CORE went dark during this morning\'s optics service. Core-side inventory sticker (SW-CORE Gi1/0/1): "1000Base-LX10 · 1310 nm · SMF". Patch cord label: "OS2 single-mode".',
  },
  {
    id: 'TK-1047', code: 'TK-1047', real: false,
    title: 'Port P21 shows nothing on monitoring',
    body: 'Monitoring flags P21 as dark. Facilities says that drop feeds a wall plate in the storage annex.',
    decoyWhy: 'P21 is a planned spare — administratively down on purpose. Not every dark port is a fault.',
  },
  {
    id: 'TK-1048', code: 'TK-1048', real: false,
    title: 'PR-2 logs show CRC errors',
    body: 'The printer PR-2 (P17) logged 3 CRC errors since installation. Submitting "cabling is failing" ticket.',
    decoyWhy: '3 lifetime errors on an office printer is noise, not a trend. Healthy ports are not zero — they are stable.',
  },
  {
    id: 'TK-1049', code: 'TK-1049', real: false,
    title: 'HVAC alarm in IDF-2 yesterday',
    body: 'Facilities HVAC alarm tripped in the IDF-2 closet for 20 minutes. Asking if any network gear was affected.',
    decoyWhy: 'Out of scope for this ticket queue and no network symptoms correlate. Reject with a note.',
  },
];

// ── Switch ports ─────────────────────────────────────────────────────
const PORTS = [
  { id: 'p2', num: 2, label: 'VoIP phone · Reception', poe: { std: '802.3af', cls: 2, drawW: 7.0 } },
  { id: 'p3', num: 3, label: 'WS-12 · Library Lab 2' },
  { id: 'p4', num: 4, label: 'VoIP phone · Admissions', poe: { std: '802.3af', cls: 2, drawW: 7.0 } },
  { id: 'p5', num: 5, label: 'WS-07 · Admissions' },
  { id: 'p7', num: 7, label: 'CR-2 · Conference room wall drop' },
  { id: 'p8', num: 8, label: 'VoIP phone · Registrar', poe: { std: '802.3af', cls: 3, drawW: 12.95 } },
  { id: 'p9', num: 9, label: 'NAS-2 · Backup drop' },
  { id: 'p11', num: 11, label: 'WS-14 · Lab 1' },
  { id: 'p12', num: 12, label: 'AP-1 · Cafeteria', poe: { std: '802.3at', cls: 4, drawW: 25.5 } },
  { id: 'p13', num: 13, label: 'WS-11 · Lab 1' },
  { id: 'p14', num: 14, label: 'C-9 · New IP camera', poe: { std: '802.3af', cls: 3, drawW: 12.95 } },
  { id: 'p16', num: 16, label: 'AP-3 · Library mezzanine' },
  { id: 'p17', num: 17, label: 'PR-2 · Office printer' },
  { id: 'p18', num: 18, label: 'C-4 · IP camera', poe: { std: '802.3af', cls: 3, drawW: 12.95 } },
  { id: 'p19', num: 19, label: 'SRV-B · Hypervisor (jumbo on)' },
  { id: 'p21', num: 21, label: 'Spare · Storage annex' },
];

const SFP_PORTS = [
  { id: 'A1', num: 1, label: 'Uplink → SW-CORE', sfp: true },
  { id: 'A2', num: 2, label: 'Uplink → Library WAP', sfp: true },
  { id: 'A3', num: 3, label: 'Uplink → SW-ACCESS-02 (LACP Po2)', sfp: true },
  { id: 'A4', num: 4, label: 'Spare uplink', sfp: true },
];

// ── Interface counter snapshots (lifetime + rate/min) ────────────────
const COUNTERS = {
  p3: { crc: 0, input: 0, runts: 0, giants: 0, drops: 0, collisions: 0, speed: '—', duplex: '—', note: 'No link — autonegotiation failed.' },
  p5: { crc: 4812, input: 5077, runts: 2, giants: 0, drops: 0, collisions: 0, crcRate: 142, inRate: 158, speed: '100 Mb/s', duplex: 'full', note: 'Gigabit drop, negotiated 100 Mb/s. CRC climbing steadily.' },
  p7: { crc: 918, input: 931, runts: 0, giants: 0, drops: 44, collisions: 0, crcRate: 12, inRate: 12, speed: '100 Mb/s', duplex: 'full', note: 'Utilization spikes to 90%+ during meetings; drops during bursts.' },
  p9: { crc: 3205, input: 3300, runts: 0, giants: 0, drops: 0, collisions: 0, flaps: 27, crcRate: 0, inRate: 0, speed: '—', duplex: '—', note: 'Err-disabled (reason: link-flap). Port shut down by protection after 27 flaps in 10 min.' },
  p11: { crc: 876, input: 940, runts: 210, giants: 0, drops: 0, collisions: 1204, crcRate: 19, inRate: 21, speed: '100 Mb/s', duplex: 'half', note: 'Partner NIC forced 100/full; this side autonegotiated to half. Late collisions climbing.' },
  p12: { crc: 0, input: 0, runts: 0, giants: 0, drops: 0, collisions: 0, speed: '1000 Mb/s', duplex: 'full', note: 'Healthy — PoE at 25.5 W (802.3at class 4).' },
  p13: { crc: 0, input: 0, runts: 0, giants: 0, drops: 0, collisions: 0, speed: '1000 Mb/s', duplex: 'full', note: 'Healthy reference port — counters at zero since reload.' },
  p14: { crc: 0, input: 0, runts: 0, giants: 0, drops: 0, collisions: 0, speed: '100 Mb/s', duplex: 'full', note: 'New camera C-9 — drawing 12.95 W.' },
  p16: { crc: 0, input: 0, runts: 0, giants: 0, drops: 0, collisions: 0, speed: '—', duplex: '—', note: 'No link. PoE denied — device boot-loops, tripping the power budget each attempt.' },
  p17: { crc: 3, input: 3, runts: 0, giants: 0, drops: 0, collisions: 0, crcRate: 0, inRate: 0, speed: '100 Mb/s', duplex: 'full', note: '3 lifetime CRC errors, zero rate since install. Healthy.' },
  p18: { crc: 0, input: 0, runts: 0, giants: 0, drops: 0, collisions: 0, speed: '100 Mb/s', duplex: 'full', note: 'Healthy — PoE at 12.95 W.' },
  p19: { crc: 0, input: 4001, runts: 0, giants: 3981, drops: 0, collisions: 0, inRate: 87, speed: '1000 Mb/s', duplex: 'full', note: 'SRV-B sends jumbo (9000-byte) frames; path MTU mismatch on this VLAN.' },
  p21: { crc: 0, input: 0, runts: 0, giants: 0, drops: 0, collisions: 0, speed: '—', duplex: '—', note: 'Administratively down (shutdown configured). Planned spare.' },
  A1: { crc: 0, input: 0, runts: 0, giants: 0, drops: 0, collisions: 0, speed: '—', duplex: '—', note: 'No link since core-side optics service.' },
  A2: { crc: 214, input: 220, runts: 0, giants: 0, drops: 0, collisions: 0, crcRate: 2, inRate: 2, speed: '1000 Mb/s', duplex: 'full', note: 'Up. Optical RX −24.8 dBm (spec floor −17.0 dBm) — LOW.' },
  A3: { crc: 0, input: 0, runts: 0, giants: 0, drops: 0, collisions: 0, speed: '—', duplex: '—', note: 'Suspended — waiting for LACP partner. Member not in Po2 on this switch.' },
  A4: { crc: 0, input: 0, runts: 0, giants: 0, drops: 0, collisions: 0, speed: '—', duplex: '—', note: 'Administratively down. Planned spare.' },
};

// ── Punch-down pins (T568B canonical order) ──────────────────────────
const PIN_PAIRS = [
  { id: 'WO', label: 'white/orange', colors: ['#f5f5f4', '#f97316'] },
  { id: 'O', label: 'orange', colors: ['#f97316', '#f97316'] },
  { id: 'WG', label: 'white/green', colors: ['#f5f5f4', '#22c55e'] },
  { id: 'BL', label: 'blue', colors: ['#3b82f6', '#3b82f6'] },
  { id: 'WBL', label: 'white/blue', colors: ['#f5f5f4', '#3b82f6'] },
  { id: 'G', label: 'green', colors: ['#22c55e', '#22c55e'] },
  { id: 'WBR', label: 'white/brown', colors: ['#f5f5f4', '#a16207'] },
  { id: 'BR', label: 'brown', colors: ['#a16207', '#a16207'] },
];

const T568B = ['WO', 'O', 'WG', 'BL', 'WBL', 'G', 'WBR', 'BR'];

// Jack audit strip (Hard H7): plant standard is T568B end-to-end, no split pairs
const JACKS = [
  { id: 'J-A', order: ['WO', 'O', 'WG', 'BL', 'WBL', 'G', 'WBR', 'BR'], note: 'IDF-2 row 1 — punched last quarter, certified.' },
  { id: 'J-B', order: ['WG', 'G', 'WO', 'BL', 'WBL', 'O', 'WBR', 'BR'], note: 'IDF-2 row 2 — punched by a contractor.' },
  { id: 'J-C', order: ['WO', 'O', 'WG', 'BL', 'G', 'WBL', 'WBR', 'BR'], note: 'IDF-2 row 3 — re-punched after a move.' },
  { id: 'J-D', order: ['WO', 'O', 'WG', 'BL', 'WBL', 'G', 'WBR', 'BR'], note: 'IDF-2 row 4 — punched last quarter, certified.' },
];

// ── LACP remediation steps (Hard H8) ─────────────────────────────────
const LACP_STEPS = [
  { id: 'confirm', label: 'Confirm on both switches: A3 is a member of Po2 on SW-ACCESS-02 but NOT grouped on SW-ACCESS-01.' },
  { id: 'add', label: 'Add A3 to channel-group 2 (mode active) on SW-ACCESS-01.' },
  { id: 'verify', label: 'Verify A3 now shows "(bu) bundled" and port-channel Po2 is up with both members.' },
  { id: 'document', label: 'Document root cause and fix in TK-1046\'s sister ticket before closing.' },
];

// ── Environment state ────────────────────────────────────────────────
function initialEnv() {
  return {
    jobCables: {},        // job/run → cable id
    tested: {},           // runId → tested (wire map revealed)
    metered: {},          // runId → metered
    diag: {},             // diagnosis keys → option id
    multi: {},            // multi-select keys
    match: {},            // matching keys (status/signature/grid)
    num: {},              // numeric text answers
    pins: [],             // punch-down slot order
    untwist: false,       // untwist kept ≤ 13 mm
    port9Recovered: false,
    sfpA1: 't-sx',
    sfpCore: 't-lx10',
    cordA1: 'f-os2-lc',
    poeP14Moved: false,
    poeP16Standard: 'auto',
    lacpOrder: [],
    lacpApplied: false,
    a2Cleaned: false,
    lib2Replaced: false,
    cr2Reroute: false,
    cr2Recert: false,
    p21Enabled: false,
    docDone: [],
  };
}

// ── Derived facts (what the bench looks like right now) ──────────────
const POE_BUDGET = 95;

function isStraightCopper(cableId) {
  if (!cableId) return false;
  const c = CABLES.find(function (x) { return x.id === cableId; });
  return !!c && c.kind === 'copper' && c.wiring === 'straight';
}

function pinOrderCorrect(pins) {
  return pins.length === 8 && T568B.every(function (p, i) { return pins[i] === p; });
}

function sfpPairValid(a, b, cord) {
  const ca = CABLES.find(function (x) { return x.id === cord; });
  if (a === 't-sx' && b === 't-sx') return !!ca && ca.fiberType === 'MMF' && (ca.grade === 'OM3' || ca.grade === 'OM4');
  if (a === 't-lx10' && b === 't-lx10') return !!ca && ca.fiberType === 'SMF' && ca.grade === 'OS2';
  return false;
}

function derive(e) {
  const ws12GoodPatch = isStraightCopper(e.jobCables['r-ws12']);
  const p9GoodPatch = isStraightCopper(e.jobCables['r-p9']);
  const ws07Fixed = pinOrderCorrect(e.pins) && e.untwist;
  const p9Recovered = p9GoodPatch && e.port9Recovered;
  const cr2Fixed = e.cr2Reroute && e.cr2Recert;
  const poeUsed = +(7.0 + 7.0 + 12.95 + 25.5 + 12.95 + (e.poeP14Moved ? 0 : 12.95)).toFixed(2);
  const poeRequired = +(poeUsed + 25.5).toFixed(2);
  const poeExceed = +Math.max(0, poeRequired - POE_BUDGET).toFixed(2);
  const p16PowerOk = poeExceed === 0 && e.poeP16Standard === 'auto';
  const a1Up = sfpPairValid(e.sfpA1, e.sfpCore, e.cordA1);
  const a1Sfp = TRANSCEIVERS.find(function (t) { return t.id === e.sfpA1; });
  const a1SfpModel = a1Sfp ? a1Sfp.model : '—';
  const lib2Fixed = e.lib2Replaced;
  const a2Fixed = e.a2Cleaned;
  const allRealFixed = ws12GoodPatch && ws07Fixed && p9Recovered && cr2Fixed && a1Up && p16PowerOk && e.lacpApplied && a2Fixed && lib2Fixed;
  const decoysUntouched = !e.p21Enabled;
  const docOk = ['TK-1042', 'TK-1043', 'TK-1044', 'TK-1045', 'TK-1046'].every(function (t) { return e.docDone.includes(t); });
  return {
    ws12Link: ws12GoodPatch, ws07Fixed: ws07Fixed, p9CableNew: p9GoodPatch, p9Recovered: p9Recovered, cr2Fixed: cr2Fixed,
    poeUsed: poeUsed, poeRequired: poeRequired, poeExceed: poeExceed, p16PowerOk: p16PowerOk, a1Up: a1Up, a1SfpModel: a1SfpModel, a3Bundled: e.lacpApplied,
    pinOk: pinOrderCorrect(e.pins), lib2Fixed: lib2Fixed, a2Fixed: a2Fixed,
    allRealFixed: allRealFixed, decoysUntouched: decoysUntouched, docOk: docOk,
    ws07GoodPatch: true, ws12GoodPatch: ws12GoodPatch, p9GoodPatch: p9GoodPatch,
  };
}

// ── Port LED / status view (derived) ─────────────────────────────────
function portView(p, e, d) {
  const id = p.id;
  if (id === 'p3') return d.ws12Link
    ? { led: 'green', status: 'up · 1000 Mb/s full', detail: 'Link up after patch replacement. Re-test the wire map to confirm the fix.', selectable: true }
    : { led: 'off', status: 'down · down', detail: 'No link. Autonegotiation fails — this legacy switch has auto-MDIX disabled on access ports, so pair faults will not self-correct.', selectable: true };
  if (id === 'p5') return d.ws07Fixed
    ? { led: 'green', status: 'up · 1000 Mb/s full', detail: 'Termination corrected — renegotiated at 1000 Mb/s. CRC rate falling. Counters are cumulative; watch the rate, not the total.', selectable: true }
    : { led: 'green', status: 'up · 100 Mb/s full', detail: 'Link up but downshifted to 100 Mb/s with steady CRC errors — classic symptom pair for a split pair at the termination.', selectable: true };
  if (id === 'p7') return d.cr2Fixed
    ? { led: 'green', status: 'up · 1000 Mb/s full', detail: 'Re-routed and re-certified at 96 m — insertion loss back inside the channel limit.', selectable: true }
    : { led: 'amber', status: 'up · 100 Mb/s · flapping', detail: 'Link flaps under load. Run is bundled with the power conduit and the channel measures over 100 m.', selectable: true };
  if (id === 'p9') return d.p9Recovered
    ? { led: 'green', status: 'up · 1000 Mb/s full', detail: 'Recovered after cable replacement. Cause fixed first, then port re-enabled — correct order.', selectable: true }
    : { led: 'amber', status: 'err-disabled', detail: 'Err-disabled (link-flap protection). Fix the physical cause (damaged patch) BEFORE re-enabling, or it will just trip again.', selectable: true };
  if (id === 'p16') return d.p16PowerOk
    ? { led: 'green', status: 'up · 1000 Mb/s · 25.5 W', detail: 'AP-3 powered: 802.3at class 4 at 25.5 W, inside the budget.', selectable: true }
    : { led: 'amber-blink', status: 'down · PoE cycling', detail: d.poeExceed > 0
        ? 'PoE denied: adding AP-3 would draw ' + d.poeRequired + ' W on a ' + POE_BUDGET + ' W budget (over by ' + d.poeExceed.toFixed(2) + ' W).'
        : 'Budget is fine now, but the port is limited to 802.3af (15.4 W) while the AP needs 25.5 W. Set the port standard to auto/802.3at.', selectable: true };
  if (id === 'p14') return e.poeP14Moved
    ? { led: 'off', status: 'vacant', detail: 'Camera C-9 relocated to SW-OFFICE-2. Budget pressure released.', selectable: true }
    : { led: 'green', status: 'up · 100 Mb/s · 12.95 W', detail: 'New camera C-9 — 802.3af class 3, 12.95 W committed against the budget.', selectable: true };
  if (id === 'p21') return e.p21Enabled
    ? { led: 'green', status: 'up · 1000 Mb/s', detail: 'You enabled a planned spare. Nothing was wrong here — this was an intentional admin-down port.', selectable: true }
    : { led: 'off', status: 'admin down', detail: 'Administratively down — shutdown configured on purpose (planned spare). Leave intentional states alone.', selectable: true };
  if (id === 'A1') return d.a1Up
    ? { led: 'green', status: 'up · 1000 Mb/s · ' + d.a1SfpModel, detail: 'Matched optics, mode and cord — uplink restored.', selectable: true }
    : { led: 'off', status: 'down · down', detail: 'Dark. A1 holds a 1000Base-SX (850 nm MMF) while the core side is documented as 1000Base-LX10 (1310 nm SMF).', selectable: true };
  if (id === 'A2') return d.a2Fixed
    ? { led: 'green', status: 'up · 1000 Mb/s · RX −16.9 dBm', detail: 'Connector cleaned/reseated — receive power back above the −17.0 dBm spec floor.', selectable: true }
    : { led: 'green', status: 'up · 1000 Mb/s · RX −24.8 dBm LOW', detail: 'Link is up but receive power is 7.8 dB below the spec floor — CRCs will climb. Check for dirty/loose connectors.', selectable: true };
  if (id === 'A3') return d.a3Bundled
    ? { led: 'green', status: 'up · (bu) bundled · Po2', detail: 'Bundled into port-channel Po2 with both members active.', selectable: true }
    : { led: 'amber', status: 'suspended', detail: 'Suspended — the port waits for a LACP partner that was never configured on this side. Not down, not err-disabled: suspended.', selectable: true };
  // Static / healthy ports
  const statics = {
    p2: { led: 'green', status: 'up · 100 Mb/s · 7.0 W', detail: 'Healthy phone — 802.3af class 2.', selectable: false },
    p4: { led: 'green', status: 'up · 100 Mb/s · 7.0 W', detail: 'Healthy phone — 802.3af class 2.', selectable: false },
    p8: { led: 'green', status: 'up · 100 Mb/s · 12.95 W', detail: 'Healthy phone — 802.3af class 3.', selectable: false },
    p11: { led: 'green', status: 'up · 100 Mb/s HALF', detail: 'Duplex mismatch: partner forced 100/full, this side autonegotiated to half. Collisions + CRC — a Layer-1/2 crossover fault.', selectable: true },
    p12: { led: 'green', status: 'up · 1000 Mb/s · 25.5 W', detail: 'Healthy AP — 802.3at class 4.', selectable: false },
    p13: { led: 'green', status: 'up · 1000 Mb/s full', detail: 'Healthy reference port — zero counters since reload.', selectable: true },
    p17: { led: 'green', status: 'up · 100 Mb/s', detail: 'Healthy. 3 lifetime CRC errors with zero rate — not a fault. Don\'t chase stable counters.', selectable: true },
    p18: { led: 'green', status: 'up · 100 Mb/s · 12.95 W', detail: 'Healthy camera — 802.3af class 3.', selectable: false },
    p19: { led: 'green', status: 'up · 1000 Mb/s', detail: 'Giants climbing: jumbo frames (9000 B) meet a 1500 B path — MTU mismatch, will be dropped.', selectable: true },
  };
  const empty = { led: 'off', status: 'no device', detail: 'Vacant port.', selectable: false };
  if (id === 'A4') return { led: 'off', status: 'admin down', detail: 'Administratively down — planned spare.', selectable: false };
  return statics[id] || empty;
}

// Empty copper ports
const EMPTY_PORTS = [1, 6, 10, 15, 20, 22, 23, 24];
