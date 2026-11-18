// ── UI renderers ─────────────────────────────────────────────────────────────
// Template functions that produce the same DOM structure / classes / ARIA as the
// original lab52 components. Events are wired by app.js through data-action
// attributes (event delegation). All user-visible strings are identical.
'use strict';

// ── Small primitives ─────────────────────────────────────────────────
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function fmtNum(n) { return n.toLocaleString('en-US'); }

function readoutHTML(inner, tone, cls) {
  const tones = { default: 't-z200', good: 't-emerald400', warn: 't-amber400', bad: 't-red400', accent: 't-lime300' };
  return '<span class="readout ' + (tones[tone || 'default']) + (cls ? ' ' + cls : '') + '">' + inner + '</span>';
}

function ledHTML(tone, label) {
  const cls = { green: 'led-green', amber: 'led-amber', 'amber-blink': 'led-amber led-blink', off: 'led-off' }[tone];
  return '<span class="led-wrap"><span class="led ' + cls + '"></span><span class="sr-only">' + esc(label) + '</span></span>';
}

const PILLAR_META = {
  P1: { name: 'Understand', cls: 'badge-sky' },
  P2: { name: 'Recognize', cls: 'badge-violet' },
  P3: { name: 'Detect', cls: 'badge-amber' },
  P4: { name: 'Mitigate', cls: 'badge-emerald' },
};

function pillarBadgeHTML(p) {
  const m = PILLAR_META[p];
  return '<span class="pillar-badge ' + m.cls + '">' + p + ' · ' + m.name + '</span>';
}

function subheadHTML(children) {
  return '<h3 class="subhead">' + children + '</h3>';
}

// Engraved equipment-plate section (ui-bits Panel)
function panelHTML(opts, body) {
  return '<section' + (opts.id ? ' id="' + opts.id + '"' : '') + ' aria-label="' + esc(opts.title) + '" class="panel' + (opts.cls ? ' ' + opts.cls : '') + '">'
    + '<header class="panel-head">'
    +   '<div class="panel-head-l">'
    +     (opts.icon ? '<span class="panel-ic">' + opts.icon + '</span>' : '')
    +     '<div class="panel-title-wrap"><h2 class="panel-title">' + esc(opts.title) + '</h2>'
    +     (opts.sub ? '<p class="panel-sub">' + esc(opts.sub) + '</p>' : '') + '</div>'
    +   '</div>'
    +   (opts.right || '')
    + '</header>'
    + '<div class="panel-body">' + body + '</div>'
    + '</section>';
}

// Native checkbox styled like the lab's accent-orange checkbox rows
function checkboxRowHTML(attrs, labelHTML) {
  return '<label class="check-row" ' + attrs + '>' + labelHTML + '</label>';
}

function checkboxHTML(checked, ariaLabel, actionAttrs) {
  return '<input type="checkbox" class="cbx"' + (checked ? ' checked' : '') + ' aria-label="' + esc(ariaLabel) + '" ' + actionAttrs + ' />';
}

// Native select styled like the Radix Select trigger
function selectFieldHTML(k, placeholder, options, selected, ariaLabel, action) {
  let h = '<select class="field-select" data-action="' + action + '" data-k="' + esc(k) + '" aria-label="' + esc(ariaLabel || placeholder) + '">';
  h += '<option value="" disabled' + (selected ? '' : ' selected') + '>' + esc(placeholder) + '</option>';
  options.forEach(function (o) {
    h += '<option value="' + esc(o.v) + '"' + (selected === o.v ? ' selected' : '') + '>' + esc(o.label) + '</option>';
  });
  return h + '</select>';
}

function matchFieldHTML(k, label, options, selected) {
  return '<div class="match-row"><span class="match-label">' + esc(label) + '</span>'
    + selectFieldHTML(k, 'assign…', options, selected, label, 'match') + '</div>';
}

function numFieldHTML(k, label, unit, placeholder) {
  return '<label class="num-row"><span class="num-label">' + esc(label) + '</span>'
    + '<span class="num-wrap"><input type="text" inputmode="decimal" class="num-input" data-num="' + esc(k) + '"'
    + ' value="' + esc(state.env.num[k] || '') + '" placeholder="' + esc(placeholder || '') + '" aria-label="' + esc(label) + '" />'
    + (unit ? '<span class="num-unit">' + esc(unit) + '</span>' : '')
    + '</span></label>';
}

function multiPickHTML(k, options) {
  const cur = state.env.multi[k] || [];
  let h = '<div class="multi-grid">';
  options.forEach(function (o) {
    h += checkboxRowHTML(
      'data-action="multi-toggle" data-k="' + esc(k) + '" data-v="' + esc(o.v) + '"',
      checkboxHTML(cur.includes(o.v), o.label, 'data-multi-guard="1"') + '<span>' + esc(o.label) + '</span>'
    );
  });
  return h + '</div>';
}

// ── Hints (tiered) ───────────────────────────────────────────────────
function hintStackHTML(objId, tiers) {
  const st = state.obj[objId];
  const opened = st ? st.hintsUsed : 0;
  if (!tiers.length) return '';
  if (opened < tiers.length) {
    return '<div><button type="button" data-action="hint" data-arg="' + objId + '" class="hint-btn">'
      + icon('lightbulb', 'ic ic-14') + ' Hint ' + (opened + 1) + '/' + tiers.length
      + ' <span class="hint-cost">(costs stars)</span></button></div>';
  }
  let h = '<div class="hint-list" aria-live="polite">';
  tiers.slice(0, opened).forEach(function (ht, i) {
    h += '<p class="hint-item"><span class="hint-tag">H' + (i + 1) + '·</span> ' + esc(ht) + '</p>';
  });
  return h + '</div>';
}

// ── Check result (motion: fade + slide 180ms) ────────────────────────
function checkResultHTML(st, obj) {
  if (!st || st.lastPass === null || st.lastPass === undefined) return '';
  const pass = st.lastPass === true;
  return '<div role="status" aria-live="polite" class="check-result anim-check ' + (pass ? 'cr-pass' : 'cr-fail') + '">'
    + '<span class="cr-tag">' + (pass ? 'PASS ✓' : 'FAIL ✗') + '</span>' + esc(pass ? obj.passMsg : obj.failMsg) + '</div>';
}

// ═════════════════════════════════════════════════════════════════════
// MODE SELECT (LabRoot.tsx)
// ═════════════════════════════════════════════════════════════════════
function renderModeSelect() {
  return '<main class="mode-main">'
    + '<header class="mode-head">'
    +   '<p class="mode-kicker">CompTIA Network+ · N10-009 · Lesson 5.2</p>'
    +   '<h1 class="mode-title">LAYER<span class="t-orange500">·</span>1 BENCH</h1>'
    +   '<p class="mode-sub">Cabling &amp; physical interface issues — one wiring closet, five live tickets, real instruments.</p>'
    + '</header>'
    + '<div class="mode-cards">'
    +   '<button type="button" data-action="set-mode" data-arg="medium" class="mode-card mode-card-medium">'
    +     '<p class="mode-card-kicker kicker-emerald">Guided · Understand &amp; Apply</p>'
    +     '<h2 class="mode-card-title">Bench Apprentice</h2>'
    +     '<ul class="mode-card-list">'
    +       '<li>· 12 granular objectives, introduced in order</li>'
    +       '<li>· &ldquo;where to look&rdquo; guidance + 3-tier hints</li>'
    +       '<li>· tolerant checks — wrong answers teach</li>'
    +       '<li>· 7-question concept check at the end</li>'
    +     '</ul>'
    +     '<p class="mode-card-cta cta-emerald">start guided →</p>'
    +   '</button>'
    +   '<button type="button" data-action="set-mode" data-arg="hard" class="mode-card mode-card-hard">'
    +     '<p class="mode-card-kicker kicker-orange">On-call · Analyze &amp; Evaluate</p>'
    +     '<h2 class="mode-card-title">Solo On-Call</h2>'
    +     '<ul class="mode-card-list">'
    +       '<li>· 9 deep challenges across a noisy queue</li>'
    +       '<li>· red herrings — at least two are traps</li>'
    +       '<li>· strict checks, exact values &amp; sequences</li>'
    +       '<li>· one optional nudge, and it costs score</li>'
    +     '</ul>'
    +     '<p class="mode-card-cta cta-orange">go on-call →</p>'
    +   '</button>'
    + '</div>'
    + '<p class="mode-foot">synthetic training environment · same closet in both modes · progress auto-saves</p>'
    + '</main>';
}

// ═════════════════════════════════════════════════════════════════════
// BRIEFING (Briefing.tsx)
// ═════════════════════════════════════════════════════════════════════
const GLOSSARY = [
  ['Attenuation', 'Signal strength lost as a signal travels the medium — grows with distance; copper attenuates far faster than fiber.'],
  ['Crosstalk (NEXT)', 'A signal from one pair bleeding into an adjacent pair; worst where pairs are untwisted or split.'],
  ['EMI / RFI', 'Electromagnetic/radio interference induced into copper by power circuits, motors, fluorescents. Fiber is immune.'],
  ['Plenum rating', 'Jacket compound rated for air-handling spaces (fire code / low smoke) — legally required in plenum paths.'],
  ['Split pair', 'A conductor terminated onto the wrong twisted pair (e.g. pins 5/6 swapped) — links train but crosstalk wrecks throughput.'],
  ['T568A / T568B', 'The two standard 8P8C pin-outs. Pick one plant-wide (B here) and never mix within a channel.'],
  ['TX/RX transposed', 'Transmit and receive pairs land on the same pins at both ends — no link (or a crossover in a straight-through\'s place).'],
  ['Auto-MDIX', 'Port feature that swaps TX/RX electrically, silently fixing wrong cable types. Off on this legacy switch.'],
  ['CRC error', 'Checksum failure on a received frame — corrupted bits in flight; the classic physical-fault counter.'],
  ['Runt', 'Frame below the minimum 64-byte size — collisions or a faulty NIC.'],
  ['Giant', 'Frame above the maximum size with bad FCS — jumbo/MTU mismatch or faulty NIC.'],
  ['Drop', 'Packet discarded by a full buffer — congestion, or physical instability upstream.'],
  ['PoE (af/at/bt)', '802.3af 15.4 W · 802.3at (PoE+) 30 W · 802.3bt 60–90 W at the port; device classes draw less.'],
  ['PoE budget', 'The switch\'s total wattage it can commit across powered ports — exceed it and requests are denied.'],
  ['SFP / SFP+', 'Pluggable transceivers; must match speed (1G vs 10G), fiber mode (SMF/MMF) and wavelength (850/1310 nm).'],
  ['RX power (dBm)', 'Received optical power; below the receiver spec floor the link trains but errors and flaps follow.'],
  ['Err-disabled', 'Port shut by protection (link-flap, security, bad cable). Fix the cause, then re-enable.'],
  ['Suspended', 'Port waiting for a protocol partner — classically an LACP member missing from the channel group.'],
];

function scenarioHTML() {
  return '<div class="stack-sm prose">'
    + '<p><span class="readout t-lime300">MON 07:40 · CVTC-NOC</span> — You are the on-call network technician for '
    + '<strong class="t-z100">Cedar Valley Technical College</strong> (fictional). Overnight the monitoring desk queued '
    + 'five tickets against <span class="readout t-z200">SW-ACCESS-01</span>, the 24-port access switch in IDF-2: a dead lab PC, a crawling office '
    + 'PC, a conference room that drops mid-meeting, an access point stuck in a boot loop, and a dark fiber uplink to the core.</p>'
    + '<p>Every one of them is a <strong class="t-z100">Layer-1 problem</strong> wearing a different mask: cable types, '
    + 'signal degradation, bad terminations, transposed pairs, climbing counters, port states, PoE budgets and mismatched optics. '
    + 'The bench in front of you holds the switch wall, a handheld tester, a dB meter, the spool rack, the optics tray and the '
    + 'PoE panel. Diagnose from evidence, fix in the right order, verify on the LED wall, and document.</p>'
    + '<div class="callout-box"><p class="callout-label">Why this matters for N10-009</p>'
    + '<p class="text-13">Domain 5 (Network Troubleshooting) is <strong>24% of the exam</strong>, and objective <strong>5.2 — cabling and '
    + 'physical interface issues</strong> is fully scenario-based: &ldquo;Given a scenario, troubleshoot…&rdquo; means the exam hands '
    + 'you symptoms and expects a diagnosis, not a definition. This bench drills exactly that loop.</p></div>'
    + '<p class="synthetic-note">Synthetic training data · fictional organization · no real systems were touched</p>'
    + '</div>';
}

function knowledgeHTML() {
  return '<div class="stack-md prose">'
    + '<section><h3 class="k-head">' + icon('map', 'ic ic-14') + ' Where Layer 1 sits</h3>'
    + '<p>Every network conversation ultimately rides a physical circuit. When Layer 1 misbehaves, the symptoms float upward: '
    + '&ldquo;slow PC&rdquo;, &ldquo;flaky Wi-Fi&rdquo;, &ldquo;drops during meetings&rdquo;. 5.2 teaches you to read those symptoms back down to their '
    + 'physical cause — <em>cable</em>, <em>interface</em>, or <em>hardware</em> — because fixing Layer 3 doesn\'t help a split pair.</p></section>'
    + '<section><h3 class="k-head">Cable issues</h3><ul class="disc-list text-13">'
    + '<li><strong class="t-z100">Incorrect cable type</strong> — single-mode vs multimode (9 µm vs 50 µm core; km vs hundreds of m), Cat 5/6/7/8 bandwidth-distance limits (Cat6: 10 G to 55 m; Cat8: ≤ 30 m), STP vs UTP (shielding against EMI), plenum vs PVC jackets (fire code).</li>'
    + '<li><strong class="t-z100">Signal degradation</strong> — crosstalk (untwist/split pairs), interference (EMI from power circuits), attenuation (distance + connectors vs the dB budget; 100 m channel for 1000BASE-T).</li>'
    + '<li><strong class="t-z100">Improper termination</strong> — wrong pinout, split pairs, untwist past 13 mm, bad crimps; links may still train but perform terribly.</li>'
    + '<li><strong class="t-z100">TX/RX transposed</strong> — both ends transmitting on the same pair. Auto-MDIX normally masks it; legacy ports don\'t.</li>'
    + '</ul></section>'
    + '<section><h3 class="k-head">Interface issues</h3><ul class="disc-list text-13">'
    + '<li><strong class="t-z100">Increasing counters</strong> — CRC (corrupted bits → physical fault), runts (collisions/faulty NIC), giants (jumbo/MTU mismatch), drops (congestion). Watch <em>rates</em>, not lifetime totals.</li>'
    + '<li><strong class="t-z100">Port status</strong> — error-disabled (protection tripped), administratively down (intentional), suspended (LACP waiting), plus the LED language: green good, amber caution, off no-link.</li>'
    + '</ul></section>'
    + '<section><h3 class="k-head">Hardware issues</h3><ul class="disc-list text-13">'
    + '<li><strong class="t-z100">PoE</strong> — standards af (15.4 W) / at (30 W) / bt (60–90 W); device class sets the draw. Two failure modes: <em>budget exceeded</em> (requests denied) and <em>incorrect standard</em> (device under-powered even with budget free).</li>'
    + '<li><strong class="t-z100">Transceiver mismatch</strong> — ends must agree on speed (SFP vs SFP+), fiber mode (SMF/MMF) and wavelength (850/1310 nm). One disagreement = dark link.</li>'
    + '<li><strong class="t-z100">Signal strength</strong> — fiber RX power below the spec floor means dirty/loose connectors or a failing transceiver even when the link is &ldquo;up&rdquo;.</li>'
    + '</ul></section>'
    + '<section class="callout-box"><h3 class="callout-label">Field notes (synthetic, typical patterns)</h3>'
    + '<ul class="disc-list text-125 t-z400">'
    + '<li>A university library lost gigabit across a floor after a &ldquo;helpful&rdquo; re-punch introduced one split pair — the link stayed green for weeks while CRCs climbed.</li>'
    + '<li>A warehouse AP boot-looped every time the new PTZ camera scheduler kicked in: PoE budget fine at noon, denied at 3 PM.</li>'
    + '<li>A campus link between buildings came back from an optics service dark: one end upgraded to 10G SR, the other still 1G SX.</li>'
    + '</ul></section>'
    + '</div>';
}

function glossaryHTML() {
  let h = '<dl class="glossary-grid">';
  GLOSSARY.forEach(function (g) {
    h += '<div class="glossary-item"><dt class="glossary-term">' + esc(g[0]) + '</dt><dd class="glossary-def">' + esc(g[1]) + '</dd></div>';
  });
  return h + '</dl>';
}

function briefingBodyHTML() {
  const tab = uiState.briefTab || 'scenario';
  const tabs = [
    { id: 'scenario', label: 'Scenario', icon: 'graduation-cap' },
    { id: 'knowledge', label: 'Knowledge core', icon: 'map' },
    { id: 'glossary', label: 'Glossary', icon: 'library' },
  ];
  let tl = '<div class="tab-list" role="tablist">';
  tabs.forEach(function (t) {
    tl += '<button type="button" role="tab" aria-selected="' + (tab === t.id) + '" data-action="brief-tab" data-arg="' + t.id + '"'
      + ' class="tab' + (tab === t.id ? ' tab-active' : '') + '">' + icon(t.icon, 'ic ic-14') + ' ' + t.label + '</button>';
  });
  tl += '</div>';
  const body = tab === 'scenario' ? scenarioHTML() : tab === 'knowledge' ? knowledgeHTML() : glossaryHTML();
  return tl + '<div class="tab-panel">' + body + '</div>';
}

function renderBriefing(compact) {
  const right = compact ? '' : readoutHTML('N10-009 · 5.2');
  const enterBtn = compact ? '' :
    '<div class="brief-actions"><button type="button" data-action="enter-bench" class="btn btn-orange text-xs">ENTER THE BENCH ' + icon('arrow-right', 'ic ic-16') + '</button></div>';
  return panelHTML(
    { title: 'Field manual · scenario & knowledge core', sub: 'read once, return anytime', icon: icon('book-open', 'ic ic-16'), right: right },
    briefingBodyHTML() + enterBtn
  );
}

// ═════════════════════════════════════════════════════════════════════
// HEADER + BAY TABS (LabRoot.tsx)
// ═════════════════════════════════════════════════════════════════════
function renderHeader() {
  const objectives = OBJECTIVES[state.mode];
  const stats = objectiveStats(state.obj, objectives.map(function (o) { return o.id; }));
  const allDone = stats.done === stats.total;
  const phaseChips = [['bench', 'bench'], ['quiz', 'quiz'], ['debrief', 'debrief']].map(function (pc) {
    const active = state.phase === pc[0];
    return '<button type="button" data-action="set-phase" data-arg="' + pc[0] + '" aria-pressed="' + active + '"'
      + ' class="phase-chip' + (active ? ' chip-active' : '') + '">' + pc[1] + '</button>';
  }).join('');
  return '<header class="masthead"><div class="masthead-in">'
    + '<div class="brand">'
    +   icon('zap', 'ic ic-16 t-orange500')
    +   '<div class="brand-txt"><p class="brand-name">LAYER·1 BENCH</p><p class="brand-sub">N10-009 · 5.2 · CVTC IDF-2</p></div>'
    +   '<span class="mode-chip ' + (state.mode === 'medium' ? 'mode-chip-medium' : 'mode-chip-hard') + '">' + (state.mode === 'medium' ? 'guided' : 'on-call') + '</span>'
    + '</div>'
    + '<div class="head-actions">'
    +   phaseChips
    +   '<button type="button" data-action="open-manual" class="btn btn-manual">' + icon('book-open', 'ic ic-14') + ' manual</button>'
    +   '<button type="button" data-action="open-objectives" class="btn btn-emerald">' + icon('target', 'ic ic-14') + ' OBJECTIVES '
    +     stats.done + '/' + stats.total + ' · ' + stats.pct + '%</button>'
    +   '<button type="button" data-action="sign-off" class="btn btn-signoff"' + (allDone ? '' : ' disabled') + '>' + icon('trophy', 'ic ic-14') + ' sign-off</button>'
    +   '<button type="button" data-action="ask-reset" class="btn btn-reset" aria-label="Reset bench">' + icon('rotate-ccw', 'ic ic-14') + '<span class="sr-only">Reset bench</span></button>'
    + '</div>'
    + '</div></header>';
}

const BAY_TABS = [
  { id: 'bay-tickets', label: 'Tickets', icon: 'ticket' },
  { id: 'bay-patch', label: 'Patch', icon: 'plug' },
  { id: 'bay-switch', label: 'Switch', icon: 'server' },
  { id: 'bay-test', label: 'Test', icon: 'scan-line' },
  { id: 'bay-power', label: 'Power', icon: 'battery' },
  { id: 'bay-term', label: 'Term', icon: 'plug-zap' },
];

function renderBayTabs() {
  let h = '<nav aria-label="Bench bays" class="bay-tabs">';
  BAY_TABS.forEach(function (b) {
    h += '<button type="button" data-action="jump" data-arg="' + b.id + '" class="bay-tab">' + icon(b.icon, 'ic ic-14 t-orange500') + ' ' + b.label + '</button>';
  });
  return h + '</nav>';
}

// ═════════════════════════════════════════════════════════════════════
// TICKET RAIL (TicketRail.tsx)
// ═════════════════════════════════════════════════════════════════════
function renderTicketRail() {
  const hard = state.mode === 'hard';
  const tickets = TICKETS.filter(function (t) { return hard || t.real; });
  const realCount = TICKETS.filter(function (t) { return t.real; }).length;
  let h = panelHTML(
    { id: 'bay-tickets', title: 'Ticket queue · CVTC NOC', sub: 'Cedar Valley Technical College — synthetic training tickets', icon: icon('ticket', 'ic ic-16'), right: readoutHTML(state.env.docDone.length + '/' + realCount + ' documented') },
    '<div class="ticket-grid">' + tickets.map(function (t) {
      const doc = state.env.docDone.includes(t.id);
      return '<article class="ticket-card ' + (t.real ? 'ticket-real' : 'ticket-decoy') + '">'
        + '<header class="ticket-head">'
        +   readoutHTML(esc(t.code), t.real ? 'accent' : 'warn')
        +   (!t.real ? '<span class="judge-badge">' + icon('help-circle', 'ic ic-12') + ' judge it</span>' : '')
        + '</header>'
        + '<h3 class="ticket-title">' + esc(t.title) + '</h3>'
        + '<p class="ticket-body">' + esc(t.body) + '</p>'
        + (t.real ? checkboxRowHTML('data-action="doc-toggle" data-id="' + t.id + '"',
            checkboxHTML(doc, 'Document findings for ' + t.code, 'data-multi-guard="1"')
            + icon('file-check-2', 'ic ic-14 t-z500') + '<span>findings documented</span>') : '')
        + '</article>';
    }).join('') + '</div>'
  );
  return h;
}

// ═════════════════════════════════════════════════════════════════════
// PATCH BAY (PatchBay.tsx)
// ═════════════════════════════════════════════════════════════════════
const JOBS = [
  { id: 'job-10g', icon: 'git-branch', label: 'JOB A · 10 Gb/s server link — 80 m structured channel', hint: 'SRV-VIRTUAL → SW-ACCESS-01. Speed + distance both bind.' },
  { id: 'job-xover', icon: 'arrow-right-left', label: 'JOB B · SW-LAB-3 ⟷ SW-LAB-4 — 2 m, auto-MDIX disabled', hint: 'Like devices, MDIX off: the wiring style is the binding constraint.' },
  { id: 'job-plenum', icon: 'flame', label: 'JOB C · Camera run through ceiling plenum — 20 m, fire code', hint: 'Air-handling space: the jacket rating is the binding constraint.' },
  { id: 'job-fiber', icon: 'waves', label: 'JOB D · Annex building link — 3 km, 1 Gb/s (LC ports)', hint: 'Reach decides the fiber type; the port decides the connector.' },
];

function cableChipHTML(cableId, jobId, jobLabel) {
  const c = CABLES.find(function (x) { return x.id === cableId; });
  const installed = state.env.jobCables[jobId] === cableId;
  return '<button type="button" data-action="install-cable" data-job="' + jobId + '" data-cable="' + cableId + '"'
    + ' aria-pressed="' + installed + '" aria-label="Install ' + esc(c.label) + ' for ' + esc(jobLabel) + '"'
    + ' class="cable-chip' + (installed ? ' chip-on' : '') + '">' + esc(c.label) + '</button>';
}

function renderPatchBay() {
  const env = state.env;
  const d = derive(env);
  const copper = CABLES.filter(function (c) { return c.kind === 'copper'; });
  const fiber = CABLES.filter(function (c) { return c.kind === 'fiber'; });

  const jobsHTML = JOBS.map(function (j) {
    const opts = (j.id === 'job-fiber' ? fiber : copper).map(function (c) { return cableChipHTML(c.id, j.id, j.label); }).join('');
    const installedCable = env.jobCables[j.id] ? CABLES.find(function (c) { return c.id === env.jobCables[j.id]; }) : null;
    return '<div class="job-plate">'
      + '<p class="job-label"><span class="t-orange500">' + icon(j.icon, 'ic ic-14') + '</span>' + esc(j.label) + '</p>'
      + '<p class="job-hint">' + esc(j.hint) + '</p>'
      + '<div class="chip-flex">' + opts + '</div>'
      + (installedCable ? '<p class="installed-line">installed: ' + readoutHTML(esc(installedCable.spec), 'accent') + '</p>' : '')
      + '</div>';
  }).join('');

  // Run repairs
  const repairBlock = function (subhead, desc, jobId, jobLabel, okLine) {
    return '<div class="job-plate">'
      + subheadHTML(subhead)
      + '<p class="text-11 t-z400">' + desc + '</p>'
      + '<div class="chip-flex">' + copper.map(function (c) { return cableChipHTML(c.id, jobId, jobLabel); }).join('') + '</div>'
      + okLine
      + '</div>';
  };

  const repairsHTML =
    repairBlock('RUN WS-12 · wall port ⟷ P3',
      'Current cord: hand-crimped from the parts bin (suspect — tester shows transposed pairs). Install a factory patch:',
      'r-ws12', 'run WS-12 repair',
      d.ws12Link ? '<p class="ok-line flex-ic">' + icon('check-circle-2', 'ic ic-12') + ' Healthy straight-through installed — P3 will train.</p>' : '')
    + repairBlock('RUN P9 · NAS-2 backup drop',
      'Port P9 is err-disabled (link-flap ×27). Replace the damaged patch, then recover the port from its interface panel.',
      'r-p9', 'run P9 repair',
      d.p9CableNew ? '<p class="ok-line">Replacement ready → Recover P9 on the switch wall.</p>' : '');

  const cr2Toggle = function (flag, label) {
    const on = env[flag];
    return '<button type="button" data-action="cr2-toggle" data-arg="' + flag + '" aria-pressed="' + on + '"'
      + ' class="fix-toggle' + (on ? ' fix-on' : '') + '">'
      + (on ? icon('check-circle-2', 'ic ic-16 t-emerald400') : icon('circle', 'ic ic-16 t-z600'))
      + label + '</button>';
  };

  const cr2HTML = '<div class="job-plate">'
    + subheadHTML('RUN CR-2 · conference room channel')
    + '<p class="text-11 t-z400">Two faults, two fixes: the path shares conduit with power circuits, and the channel measures 112.4 m.</p>'
    + '<div class="fix-col">'
    +   cr2Toggle('cr2Reroute', 'Re-route the run clear of the power conduit (separate path, own hooks)')
    +   cr2Toggle('cr2Recert', 'Re-terminate to a 96 m channel &amp; re-certify ≤ 100 m / within loss budget')
    + '</div>'
    + (d.cr2Fixed ? '<p class="ok-line">CR-2 channel healthy: 96 m, insertion loss back inside spec.</p>' : '')
    + '</div>';

  return '<div class="stack-md">'
    + panelHTML(
        { id: 'bay-patch', title: 'Patch bay · connection jobs & run repairs', sub: 'pick a cable from the rack for each job — then verify against the switch wall', icon: icon('cable', 'ic ic-16') },
        '<div class="stack-md">' + jobsHTML + '</div>')
    + panelHTML(
        { title: 'Run repairs · physical fixes', sub: 'cause first — then cure. the interface panel verifies each one', icon: icon('check-circle-2', 'ic ic-16') },
        '<div class="stack-md">' + repairsHTML + cr2HTML + '</div>')
    + '</div>';
}

// ═════════════════════════════════════════════════════════════════════
// SWITCH FACE + INTERFACE PANEL (SwitchFace.tsx)
// ═════════════════════════════════════════════════════════════════════
function renderSwitchFace() {
  const env = state.env;
  const d = derive(env);
  const selPort = PORTS.concat(SFP_PORTS).find(function (p) { return p.id === uiState.selPort; }) || PORTS.find(function (p) { return p.id === 'p5'; });
  const view = portView(selPort, env, d);
  const counters = COUNTERS[selPort.id];

  const copperPorts = Array.from({ length: 24 }, function (_, i) { return i + 1; }).map(function (n) {
    const def = PORTS.find(function (p) { return p.num === n; });
    const id = def ? def.id : 'empty-' + n;
    const v = def ? portView(def, env, d) : { led: 'off', status: 'no device', detail: '', selectable: false };
    const active = uiState.selPort === id;
    return '<button type="button" data-action="select-port" data-arg="' + id + '"' + (def ? '' : ' disabled')
      + ' aria-label="Port ' + n + (def ? ' — ' + esc(def.label) + ' — ' + esc(v.status) : ' — vacant') + '"'
      + ' aria-pressed="' + active + '"'
      + ' class="port-btn' + (active ? ' port-active' : '') + (v.led === 'amber-blink' ? ' anim-pulse' : '') + (def ? '' : ' port-empty') + '">'
      + ledHTML(v.led, v.status)
      + '<span class="port-num' + (active ? ' t-orange300' : '') + '">' + n + '</span>'
      + '</button>';
  }).join('');

  const sfpBays = SFP_PORTS.map(function (def) {
    const v = portView(def, env, d);
    const active = uiState.selPort === def.id;
    return '<button type="button" data-action="select-port" data-arg="' + def.id + '"'
      + ' aria-label="SFP ' + def.id + ' — ' + esc(def.label) + ' — ' + esc(v.status) + '"'
      + ' aria-pressed="' + active + '"'
      + ' class="sfp-btn' + (active ? ' port-active' : '') + '">'
      + '<span class="flex-ic gap-6px">' + ledHTML(v.led, v.status)
      + '<span class="sfp-id' + (active ? ' t-orange300' : '') + '">' + def.id + '</span></span>'
      + readoutHTML(esc(v.status), 'default', 'sfp-status')
      + '</button>';
  }).join('');

  // Interface detail panel
  const rateArrow = function (rate) { return rate ? '<em class="rate t-amber400"> ▲' + rate + '/m</em>' : ''; };
  let countersHTML = '';
  if (counters) {
    countersHTML = '<div class="table-scroll"><table class="counter-table"><thead><tr>'
      + '<th>CRC err</th><th>Input err</th><th>Runts</th><th>Giants</th><th>Drops</th><th>Collisions</th>'
      + (counters.flaps !== undefined ? '<th>Link flaps</th>' : '')
      + '</tr></thead><tbody><tr>'
      + '<td>' + fmtNum(counters.crc) + rateArrow(counters.crcRate) + '</td>'
      + '<td>' + fmtNum(counters.input) + rateArrow(counters.inRate) + '</td>'
      + '<td>' + fmtNum(counters.runts) + '</td>'
      + '<td>' + fmtNum(counters.giants) + (counters.giants > 0 ? '<em class="rate t-amber400"> ▲</em>' : '') + '</td>'
      + '<td>' + fmtNum(counters.drops) + '</td>'
      + '<td>' + fmtNum(counters.collisions) + '</td>'
      + (counters.flaps !== undefined ? '<td>' + counters.flaps + '</td>' : '')
      + '</tr></tbody></table></div>';
  }

  // P9 recover control (sequenced fix)
  const p9Control = (selPort.id === 'p9' && !d.p9Recovered)
    ? '<div class="p9-box"><p class="text-11 t-amber200">Err-disable recovery — the port stays locked until the physical cause (damaged patch) is replaced.</p>'
      + '<button type="button" data-action="recover-p9" class="btn btn-amber"' + (d.p9CableNew ? '' : ' disabled') + '>'
      + icon('rotate-ccw', 'ic ic-14') + ' Recover port (shutdown / no shutdown)</button>'
      + (!d.p9CableNew ? '<p class="blocked-line">Blocked: install a healthy straight-through patch on run P9 first.</p>' : '')
      + '</div>'
    : '';

  // P21 decoy action (Hard-mode discipline trap)
  const p21Control = (selPort.id === 'p21' && !env.p21Enabled && state.mode === 'hard')
    ? '<div class="p21-box"><p class="text-11 t-z400">Configuration port: <span class="readout t-z200">shutdown</span> — planned spare per change log CHG-2214.</p>'
      + '<button type="button" data-action="enable-p21" class="btn btn-outline-dark">' + icon('ban', 'ic ic-14') + ' no shutdown (enable anyway)</button></div>'
    : '';

  const interfacePanel = panelHTML(
    { title: 'Interface · ' + selPort.label, sub: 'Gi/Te port ' + (selPort.id.indexOf('A') === 0 ? 'A' + selPort.num : selPort.num) + ' · synthetic telemetry',
      icon: icon('scan-search', 'ic ic-16'),
      right: selPort.poe ? readoutHTML(selPort.poe.std + ' · ' + selPort.poe.drawW + ' W', 'accent') : '' },
    '<div class="stack-10px">'
    + '<div class="status-line"><span class="flex-ic">' + ledHTML(view.led, view.status) + readoutHTML(esc(view.status)) + '</span>'
    + (counters ? readoutHTML(esc(counters.speed), 'accent') + readoutHTML('duplex: ' + counters.duplex) : '')
    + '</div>'
    + '<p class="text-xs prose">' + esc(view.detail) + '</p>'
    + countersHTML
    + (counters && counters.note ? '<p class="counter-note">Note: ' + esc(counters.note) + '</p>' : '')
    + p9Control + p21Control
    + '</div>'
  );

  const switchPanel = panelHTML(
    { id: 'bay-switch', title: 'SW-ACCESS-01 · Switch wall', sub: 'IDF-2 · 24× 1000BASE-T + 4× SFP · click a port for its interface readout', icon: icon('server', 'ic ic-16') },
    '<div class="port-grid">' + copperPorts + '</div>'
    + '<div class="sfp-grid">' + sfpBays + '</div>'
    + '<p class="led-legend">LED semantics: <span class="t-emerald400">green = link good</span> · <span class="t-amber400">amber = caution/fault</span> · off = no link. Status text is always provided — never rely on color alone.</p>'
  );

  return '<div class="stack-md">' + switchPanel + interfacePanel + '</div>';
}

// ═════════════════════════════════════════════════════════════════════
// TEST BENCH (TestBench.tsx)
// ═════════════════════════════════════════════════════════════════════
const STRAIGHT = T568B;
const TXRX = ['WG', 'G', 'WO', 'BL', 'WBL', 'O', 'WBR', 'BR'];   // 1,2 ⟷ 3,6
const SPLIT = ['WO', 'O', 'WG', 'BL', 'G', 'WBL', 'WBR', 'BR'];  // 5/6 swapped

function pinLabel(id) {
  const p = PIN_PAIRS.find(function (x) { return x.id === id; });
  return p ? p.label : id;
}
function pinColors(id) {
  const p = PIN_PAIRS.find(function (x) { return x.id === id; });
  return p ? p.colors : ['#555', '#555'];
}
function pinChipHTML(p) {
  const c = pinColors(p);
  return '<span class="pin-chip" style="background:linear-gradient(90deg, ' + c[0] + ' 0 50%, ' + c[1] + ' 50% 100%)"></span>';
}

function wireMapHTML(endA, endB) {
  const col = function (end, head) {
    return '<div class="wire-col"><p class="wire-head">' + head + '</p>' + end.map(function (p, i) {
      return '<div class="wire-row"><span class="wire-num">' + (i + 1) + '</span>' + pinChipHTML(p) + '<span>' + esc(pinLabel(p)) + '</span></div>';
    }).join('') + '</div>';
  };
  return '<div class="wire-map" role="img" aria-label="Wire map, end A versus end B">'
    + col(endA, 'End A · patch panel')
    + '<div class="wire-arrow">⇄</div>'
    + col(endB, 'End B · switch face')
    + '</div>';
}

function testResultFor() {
  const d = derive(state.env);
  switch (uiState.testRun) {
    case 'ws12':
      return d.ws12Link
        ? { verdict: 'PASS — straight-through, all 4 pairs correct', tone: 'good', endB: STRAIGHT }
        : { verdict: 'FAIL — pairs 1,2 ⟷ 3,6 TRANSPOSED at end B', tone: 'bad', endB: TXRX, extra: 'End A (panel) is T568B; end B (hand-crimped RJ45) carries a crossover pattern. Length 3 m · pairs 4,5,7,8 OK.' };
    case 'ws07':
      return d.ws07Fixed
        ? { verdict: 'PASS — T568B, untwist within 13 mm', tone: 'good', endB: STRAIGHT }
        : { verdict: 'CAUTION — SPLIT PAIR: pins 5/6 swapped at end B', tone: 'warn', endB: SPLIT, extra: 'Link pairs 1,2 & 3,6 pass — the link still trains, but green pair conductors land across two twisted pairs → crosstalk (NEXT). Length 46 m.' };
    case 'p9':
      return d.p9CableNew
        ? { verdict: 'PASS — new patch, all pairs OK', tone: 'good', endB: STRAIGHT }
        : { verdict: 'FAIL — INTERMITTENT SHORT at 3.1 m (wiggle test)', tone: 'bad', endB: STRAIGHT, extra: 'Jacket crushed at 3.1 m (chair castor). Shorts trip link-flap protection → err-disable.' };
    case 'cr2':
      return state.env.cr2Recert
        ? { verdict: 'PASS — re-certified 96 m, pairs OK', tone: 'good', endB: STRAIGHT }
        : { verdict: 'Wire map OK — all 4 pairs straight (T568B)', tone: 'warn', endB: STRAIGHT, extra: 'Length 112.4 m. Wiring is correct here — run the SIGNAL METER for the loss story.' };
    default:
      return { verdict: 'no run selected', tone: 'warn', endB: STRAIGHT };
  }
}

function meterReadoutHTML() {
  const env = state.env;
  if (uiState.meterRun === 'cr2') {
    return env.cr2Recert
      ? '<div>' + readoutHTML('Channel 96.0 m · insertion loss 20.1 dB @100 MHz · limit 21.3 dB', 'good')
        + '<p class="mt-6px t-emerald400 text-11">PASS — back inside the channel budget after re-termination.</p></div>'
      : '<div>' + readoutHTML('Channel 112.4 m · insertion loss 23.8 dB @100 MHz · limit 21.3 dB', 'bad')
        + '<p class="mt-6px t-red400 text-11">FAIL — channel exceeds the 100 m standard; attenuation is out of budget.</p></div>';
  }
  if (uiState.meterRun === 'lib2') {
    return env.lib2Replaced
      ? '<div>' + readoutHTML('Channel 92.0 m · insertion loss 19.6 dB @100 MHz · limit 24.0 dB (Cat5e)', 'good')
        + '<p class="mt-6px t-emerald400 text-11">PASS — 4.4 dB headroom on the replacement Cat6 channel.</p></div>'
      : '<div>' + readoutHTML('Channel 108.2 m · insertion loss 26.2 dB @100 MHz · limit 24.0 dB (Cat5e)', 'bad')
        + '<p class="mt-6px t-red400 text-11">FAIL — 2.2 dB over budget. Field note: cable crushed flat under staple studs at three points along the corridor.</p></div>';
  }
  // a2 fiber
  return env.a2Cleaned
    ? '<div>' + readoutHTML('Optical RX −16.9 dBm · spec floor −17.0 dBm', 'good')
      + '<p class="mt-6px t-emerald400 text-11">PASS — receive power restored after connector clean &amp; reseat.</p></div>'
    : '<div>' + readoutHTML('Optical RX −24.8 dBm · spec floor −17.0 dBm', 'bad')
      + '<p class="mt-6px t-red400 text-11">LOW — link trains but the receiver is starved. Visual fault locator: bright scatter at the patch connector → dirty / loose LC ferrule.</p></div>';
}

function renderTestBench() {
  const env = state.env;
  const hard = state.mode === 'hard';
  const tested = !!env.tested[uiState.testRun];
  const metered = !!env.metered[uiState.meterRun];
  const tr = testResultFor();

  const runBtns = [
    { id: 'ws12', label: 'RUN WS-12' },
    { id: 'ws07', label: 'RUN WS-07' },
    { id: 'p9', label: 'RUN P9' },
    { id: 'cr2', label: 'RUN CR-2' },
  ].map(function (r) {
    return '<button type="button" data-action="select-test-run" data-arg="' + r.id + '" aria-pressed="' + (uiState.testRun === r.id) + '"'
      + ' class="chip min-h-44' + (uiState.testRun === r.id ? ' chip-on' : '') + '">' + r.label + (env.tested[r.id] ? ' ·' : '') + '</button>';
  }).join('');

  const meterRuns = [{ id: 'cr2', label: 'CR-2 (copper)' }]
    .concat(hard ? [{ id: 'lib2', label: 'LIB-2 (copper)' }, { id: 'a2', label: 'A2 (fiber RX)' }] : [])
    .map(function (r) {
      return '<button type="button" data-action="select-meter-run" data-arg="' + r.id + '" aria-pressed="' + (uiState.meterRun === r.id) + '"'
        + ' class="chip min-h-44' + (uiState.meterRun === r.id ? ' chip-on' : '') + '">' + r.label + '</button>';
    }).join('');

  const testerResult = tested
    ? '<div class="result-box" role="status" aria-live="polite">'
      + '<p class="mb-8px">' + readoutHTML(esc(tr.verdict), tr.tone) + '</p>'
      + wireMapHTML(STRAIGHT, tr.endB)
      + (tr.extra ? '<p class="mt-8px text-11 prose">' + esc(tr.extra) + '</p>' : '')
      + '</div>'
    : '';

  const meterActions =
    (uiState.meterRun === 'a2' && !env.a2Cleaned
      ? '<button type="button" data-action="a2-clean" class="btn btn-outline-dark mt-8px">Clean &amp; reseat the LC connector</button>' : '')
    + (uiState.meterRun === 'lib2' && !env.lib2Replaced
      ? '<button type="button" data-action="lib2-replace" class="btn btn-outline-dark mt-8px">Replace the crushed LIB-2 cable (new Cat6, 92 m)</button>' : '');

  const meterResult = metered
    ? '<div class="result-box" role="status" aria-live="polite">' + meterReadoutHTML()
      + (uiState.meterRun === 'cr2' && !env.cr2Recert
        ? '<p class="field-note">' + icon('triangle-alert', 'ic ic-14 t-amber400') + ' Field note: this run shares its tray with a 277 V lighting feeder for 18 m, and the channel passes through two extra patch points from last month\'s AV renovation.</p>'
        : '')
      + meterActions + '</div>'
    : '';

  return '<div class="stack-md">'
    + panelHTML(
        { id: 'bay-test', title: 'Handheld tester · wire map', sub: 'clip onto a run, TEST, read the pin map like a wiring diagram — re-test after every repair', icon: icon('scan-line', 'ic ic-16') },
        '<div class="chip-flex mb-10px">' + runBtns + '</div>'
        + '<button type="button" data-action="run-test" class="btn btn-orange text-xs">' + icon('scan-line', 'ic ic-16') + ' TEST ' + uiState.testRun.toUpperCase() + '</button>'
        + testerResult)
    + panelHTML(
        { title: 'Signal meter · dB loss & optical power', sub: 'channel length, insertion loss and fiber RX power vs. spec', icon: icon('gauge', 'ic ic-16') },
        '<div class="chip-flex mb-10px">' + meterRuns + '</div>'
        + '<button type="button" data-action="run-meter" class="btn btn-meter text-xs">' + icon('gauge', 'ic ic-16') + ' METER ' + uiState.meterRun.toUpperCase() + '</button>'
        + meterResult)
    + '</div>';
}

// ═════════════════════════════════════════════════════════════════════
// POWER BAY + OPTICS TRAY + HARD-ONLY BAYS (PowerBay.tsx)
// ═════════════════════════════════════════════════════════════════════
const POWERED = ['p2', 'p4', 'p8', 'p12', 'p14', 'p18'];

function renderPowerBay() {
  const env = state.env;
  const d = derive(env);
  const hard = state.mode === 'hard';
  const sfpA1 = TRANSCEIVERS.find(function (t) { return t.id === env.sfpA1; });
  const sfpCore = TRANSCEIVERS.find(function (t) { return t.id === env.sfpCore; });
  const cord = CABLES.find(function (c) { return c.id === env.cordA1; });

  const mismatch = [];
  if (sfpA1.speedG !== sfpCore.speedG) mismatch.push('speed ' + sfpA1.speedG + ' vs ' + sfpCore.speedG + ' Gb/s');
  if (sfpA1.fiberType !== sfpCore.fiberType) mismatch.push('fiber mode ' + sfpA1.fiberType + ' vs ' + sfpCore.fiberType);
  if (sfpA1.wavelengthNm !== sfpCore.wavelengthNm) mismatch.push('wavelength ' + sfpA1.wavelengthNm + ' vs ' + sfpCore.wavelengthNm + ' nm');
  if (cord && sfpA1.id === sfpCore.id && ((sfpA1.fiberType === 'MMF' && cord.fiberType !== 'MMF') || (sfpA1.fiberType === 'SMF' && cord.fiberType !== 'SMF'))) mismatch.push('cord is ' + cord.fiberType + ' but optics need ' + sfpA1.fiberType);

  // PoE panel
  const barColor = d.poeExceed > 0 ? 'bar-red' : (d.poeRequired > POE_BUDGET * 0.85 ? 'bar-amber' : 'bar-emerald');
  const poeRows = PORTS.filter(function (p) { return POWERED.includes(p.id) && !(p.id === 'p14' && env.poeP14Moved); }).map(function (p) {
    return '<tr><td>' + p.num + '</td><td>' + esc(p.label.split(' · ')[1] || p.label) + '</td><td>' + p.poe.std + '</td><td>' + p.poe.cls + '</td><td class="t-lime300">' + p.poe.drawW.toFixed(2) + ' W</td></tr>';
  }).join('');
  const poeHTML = panelHTML(
    { id: 'bay-power', title: 'PoE panel · SW-ACCESS-01', sub: 'power budget ' + POE_BUDGET + ' W · committed vs required', icon: icon('zap', 'ic ic-16'),
      right: readoutHTML(d.poeRequired.toFixed(2) + ' / ' + POE_BUDGET + ' W', d.poeExceed > 0 ? 'bad' : 'good') },
    '<div class="stack-10px">'
    + '<div><div class="poe-labels"><span>COMMITTED ' + d.poeUsed.toFixed(2) + ' W</span>'
    + '<span>+ AP-3 REQUEST 25.50 W → ' + d.poeRequired.toFixed(2) + ' W</span></div>'
    + '<div class="poe-bar" role="img" aria-label="PoE budget bar: ' + d.poeRequired + ' of ' + POE_BUDGET + ' watts">'
    + '<div class="poe-fill ' + barColor + '" style="width:' + Math.min(100, (d.poeRequired / POE_BUDGET) * 100) + '%"></div></div>'
    + (d.poeExceed > 0
        ? '<p class="mt-6px t-red400 text-11">OVER BUDGET by ' + d.poeExceed.toFixed(2) + ' W — the switch denies the request; AP-3 boot-loops.</p>'
        : '<p class="mt-6px t-emerald400 text-11">Within budget — every class-4 request can be honored.</p>')
    + '</div>'
    + '<div class="table-scroll"><table class="counter-table poe-table"><thead><tr><th>Port</th><th>Device</th><th>Std</th><th>Class</th><th>Draw</th></tr></thead>'
    + '<tbody>' + poeRows
    + '<tr class="poe-total-row"><td>16</td><td>AP-3 (requested)</td><td>' + (env.poeP16Standard === 'auto' ? '802.3at' : '802.3af-limited') + '</td><td>4</td>'
    + '<td class="' + (d.poeExceed > 0 ? 't-red400' : 't-lime300') + '">25.50 W</td></tr></tbody></table></div>'
    + '<div class="p16-controls">'
    + '<div class="flex-between-wrap"><div><h3 class="subhead">P16 · AP-3 port controls</h3>'
    + '<p class="text-11 t-z400">AP-3 nameplate: 802.3at (PoE+), class 4, 25.5 W max.</p></div>'
    + '<button type="button" data-action="toggle-p14" class="btn ' + (env.poeP14Moved ? 'btn-outline-dark' : 'btn-orange') + '">'
    + (env.poeP14Moved ? 'Undo: camera back on P14' : 'Relocate camera C-9 → SW-OFFICE-2') + '</button></div>'
    + (hard
        ? '<div class="p16-std-row"><span class="std-label">P16 PoE standard:</span>'
          + [['af-limit', '802.3af-limited (15.4 W)'], ['auto', 'auto · 802.3at/af (30 W max)']].map(function (s) {
              return '<button type="button" data-action="set-p16-std" data-arg="' + s[0] + '" aria-pressed="' + (env.poeP16Standard === s[0]) + '"'
                + ' class="chip min-h-44' + (env.poeP16Standard === s[0] ? ' chip-on' : '') + '">' + s[1] + '</button>';
            }).join('')
          + '<span class="text-10 t-z500">change-log note: someone clamped this port to af during the camera install.</span></div>'
        : '<p class="text-10 t-z500">Port standard: auto (802.3at/af) — the budget is this ticket\'s only power fault in guided mode.</p>')
    + '</div>'
    + '</div>'
  );

  // Optics tray
  const opticsPicker = function (sideLabel, key, note) {
    return '<div class="optic-box"><h3 class="subhead">' + sideLabel + '</h3>'
      + readoutHTML(esc(TRANSCEIVERS.find(function (t) { return t.id === env[key]; }).model), 'accent')
      + '<p class="optic-spec">' + TRANSCEIVERS.find(function (t) { return t.id === env[key]; }).form + ' · '
      + TRANSCEIVERS.find(function (t) { return t.id === env[key]; }).speedG + ' Gb/s · '
      + TRANSCEIVERS.find(function (t) { return t.id === env[key]; }).fiberType + ' · '
      + TRANSCEIVERS.find(function (t) { return t.id === env[key]; }).wavelengthNm + ' nm</p>'
      + '<div class="chip-flex mt-8px">' + TRANSCEIVERS.map(function (t) {
          return '<button type="button" data-action="set-sfp" data-side="' + key + '" data-arg="' + t.id + '" aria-pressed="' + (env[key] === t.id) + '"'
            + ' class="chip min-h-44' + (env[key] === t.id ? ' chip-on' : '') + '">' + t.model + '</button>';
        }).join('') + '</div></div>';
  };
  const opticsHTML = panelHTML(
    { title: 'Optics tray · A1 uplink service', sub: 'both ends + cord must agree: speed · fiber mode · wavelength', icon: icon('waves', 'ic ic-16') },
    '<div class="stack-10px">'
    + '<div class="optic-grid">' + opticsPicker('A1 · access side (swappable)', 'sfpA1') + opticsPicker('Core side · SW-CORE Gi1/0/1 (remote hands)', 'sfpCore') + '</div>'
    + '<div class="optic-box"><h3 class="subhead">A1 patch cord</h3><div class="chip-flex">'
    + CABLES.filter(function (c) { return c.kind === 'fiber'; }).map(function (c) {
        return '<button type="button" data-action="set-cord" data-arg="' + c.id + '" aria-pressed="' + (env.cordA1 === c.id) + '"'
          + ' class="chip chip-tight min-h-44' + (env.cordA1 === c.id ? ' chip-on' : '') + '">' + esc(c.label) + '</button>';
      }).join('') + '</div></div>'
    + '<div role="status" aria-live="polite" class="optic-status ' + (mismatch.length ? 'optic-bad' : 'optic-good') + '">'
    + (mismatch.length
        ? 'MISMATCH DETECTED — ' + esc(mismatch.join(' · ')) + '. An SX emitting 850 nm into a receiver expecting 1310 nm never meets; SFP+ (10 G) modules do not belong in 1 G SFP slots.'
        : 'OPTICS MATCHED — speed, fiber mode and wavelength agree across both ends and the cord' + (d.a1Up ? '. Uplink A1: UP.' : '. Install the pair to bring A1 up.'))
    + '</div></div>'
  );

  // Hard-only: counter forensics grid
  let gridHTML = '';
  if (hard) {
    const gridOpts = [
      { v: 'duplex', label: 'duplex mismatch' },
      { v: 'damaged', label: 'damaged cable (err-disable)' },
      { v: 'jumbo', label: 'jumbo / MTU mismatch' },
      { v: 'healthy', label: 'healthy — no fault' },
    ];
    const rows = ['p11', 'p9', 'p19', 'p13'].map(function (pid) {
      const c = COUNTERS[pid];
      const num = PORTS.find(function (p) { return p.id === pid; }).num;
      let bits = '<span class="t-z200">P' + num + '</span><span>' + c.speed + (c.duplex !== '—' ? ' · ' + c.duplex : '') + '</span>';
      if (c.collisions > 0) bits += '<span class="t-amber400">coll ' + fmtNum(c.collisions) + '</span>';
      if (c.crc > 0) bits += '<span class="t-amber400">crc ' + fmtNum(c.crc) + (c.crcRate ? ' ▲' + c.crcRate + '/m' : '') + '</span>';
      if (c.runts > 0) bits += '<span class="t-amber400">runts ' + c.runts + '</span>';
      if (c.giants > 0) bits += '<span class="t-amber400">giants ' + fmtNum(c.giants) + ' ▲</span>';
      if (!!c.flaps) bits += '<span class="t-amber400">flaps ' + c.flaps + '</span>';
      if (c.crc === 0 && c.input === 0) bits += '<span class="t-emerald400">all counters 0 · rate 0</span>';
      return '<div class="job-plate"><div class="grid-head">' + bits + '</div>'
        + matchFieldHTML('g-' + pid, 'cause:', gridOpts, env.match['g-' + pid]) + '</div>';
    }).join('');
    gridHTML = panelHTML(
      { title: 'Counter forensics grid', sub: 'four ports · four snapshots · one exact cause each (read the interface panels first)', icon: icon('grid-3x3', 'ic ic-16') },
      '<div class="stack-10px">' + rows + '</div>');
  }

  // Hard-only: LACP sequencer
  let lacpHTML = '';
  if (hard) {
    const displayOrder = shuffleLacpDisplay();
    const seq = env.lacpOrder;
    const steps = displayOrder.map(function (sid) {
      const step = LACP_STEPS.find(function (s) { return s.id === sid; });
      const used = seq.includes(sid);
      const nextIndex = seq.indexOf(sid) + 1;
      return '<button type="button" data-action="lacp-enqueue" data-arg="' + sid + '"' + (used || env.lacpApplied ? ' disabled' : '')
        + ' class="lacp-step' + (used ? ' lacp-used' : '') + '">'
        + (used ? '<span class="lacp-idx">' + nextIndex + '.</span>' : '')
        + esc(step.label) + '</button>';
    }).join('');
    lacpHTML = panelHTML(
      { title: 'LACP sequencer · suspended member A3', sub: 'order the remediation, then apply — sequence is enforced', icon: icon('link-2', 'ic ic-16'),
        right: env.lacpApplied ? readoutHTML('A3 · (bu) bundled', 'good') : readoutHTML('A3 · suspended', 'warn') },
      '<div class="stack-10px">'
      + subheadHTML('Available steps (click to enqueue in order)')
      + '<div class="flex-col gap-6px">' + steps + '</div>'
      + '<div class="flex-wrap-center-gap">'
      + '<button type="button" data-action="lacp-apply" class="btn btn-orange"' + (seq.length !== 4 || env.lacpApplied ? ' disabled' : '') + '>APPLY SEQUENCE</button>'
      + '<button type="button" data-action="lacp-clear" class="btn btn-outline-dark">' + icon('rotate-ccw', 'ic ic-14') + ' Clear</button>'
      + (env.lacpApplied ? '<span class="text-11 t-emerald400">Applied in order — A3 bundled into Po2.</span>' : '')
      + '</div>'
      + '<p class="text-10 t-z500">Sequence is validated on APPLY: confirm the diagnosis before changing anything, verify before documenting.</p>'
      + '</div>');
  }

  return '<div class="stack-md">' + poeHTML + opticsHTML + gridHTML + lacpHTML + '</div>';
}

// ═════════════════════════════════════════════════════════════════════
// TERMINATION (Termination.tsx)
// ═════════════════════════════════════════════════════════════════════
function renderTermination() {
  const env = state.env;
  const d = derive(env);
  const hard = state.mode === 'hard';
  const slots = env.pins;

  const slotCells = T568B.map(function (_, i) {
    const pinId = slots[i];
    const meta = PIN_PAIRS.find(function (p) { return p.id === pinId; });
    const correctHere = pinId ? T568B[i] === pinId : null;
    const cls = pinId ? (correctHere ? 'slot-correct' : 'slot-wrong') : 'slot-empty';
    return '<div class="slot ' + cls + '"><span class="slot-num">' + (i + 1) + '</span>'
      + (meta
        ? '<span class="slot-chips"><span class="mini-chip" style="background:' + meta.colors[0] + '"></span><span class="mini-chip" style="background:' + meta.colors[1] + '"></span></span>'
          + '<span class="slot-label">' + esc(meta.label) + '</span>'
        : '<span>—</span>')
      + '</div>';
  }).join('');

  const conductorBtns = PIN_PAIRS.map(function (p) {
    return '<button type="button" data-action="punch" data-arg="' + p.id + '"' + (slots.length >= 8 || d.pinOk ? ' disabled' : '')
      + ' aria-label="Punch ' + esc(p.label) + ' into next slot" class="conductor-btn">'
      + '<span class="slot-chips"><span class="mini-chip chip-border" style="background:' + p.colors[0] + '"></span>'
      + '<span class="mini-chip chip-border" style="background:' + p.colors[1] + '"></span></span>'
      + esc(p.label) + '</button>';
  }).join('');

  const mainPanel = panelHTML(
    { id: 'bay-term', title: 'Termination station · WS-07 patch panel jack J-2', sub: 'punch the 8 conductors in exact T568B order · untwist ≤ 13 mm (½ in)', icon: icon('plug-zap', 'ic ic-16'),
      right: readoutHTML(env.pins.length + '/8', d.pinOk ? 'good' : 'warn') },
    '<div class="stack-md">'
    + '<div class="slot-grid" aria-label="Punch-down slots">' + slotCells + '</div>'
    + '<div>' + subheadHTML('Conductor tray (click in termination order)') + '<div class="chip-flex">' + conductorBtns + '</div></div>'
    + '<div class="flex-wrap-gap">'
    +   '<button type="button" data-action="punch-undo" class="btn btn-outline-dark text-xs"' + (!slots.length || d.pinOk ? ' disabled' : '') + '>' + icon('undo-2', 'ic ic-14') + ' Undo last</button>'
    +   '<button type="button" data-action="punch-reset" class="btn btn-outline-dark text-xs"' + (!slots.length ? ' disabled' : '') + '>' + icon('rotate-ccw', 'ic ic-14') + ' Reset jack</button>'
    + '</div>'
    + checkboxRowHTML('data-action="untwist-toggle"',
        '<input type="checkbox" class="cbx"' + (env.untwist ? ' checked' : '') + ' aria-label="Untwist kept under 13 mm" data-multi-guard="1" />'
        + '<span>Untwist kept ≤ 13 mm — twist preserves pair geometry; excess untwist invites crosstalk (NEXT)</span>')
    + (d.pinOk && env.untwist
        ? '<p role="status" class="term-ok">J-2 re-terminated to T568B — WS-07 will retrain at 1000 Mb/s. Verify on the switch wall (P5 speed line).</p>'
        : '')
    + '</div>'
  );

  let auditPanel = '';
  if (hard) {
    const jackRows = JACKS.map(function (j) {
      const pins = j.order.map(function (pinId, i) {
        const meta = PIN_PAIRS.find(function (p) { return p.id === pinId; });
        return '<span class="jack-pin"><span class="t-z600">' + (i + 1) + '</span>'
          + '<span class="slot-chips"><span class="mini-chip" style="background:' + meta.colors[0] + '"></span><span class="mini-chip" style="background:' + meta.colors[1] + '"></span></span>'
          + esc(meta.label) + '</span>';
      }).join('');
      return '<div class="job-plate"><div class="flex-between"><span>' + readoutHTML(j.id, 'accent') + '</span>'
        + '<span class="jack-note">' + esc(j.note) + '</span></div>'
        + '<div class="chip-flex jack-pins">' + pins + '</div></div>';
    }).join('');
    auditPanel = panelHTML(
      { title: 'Termination audit · IDF-2 rows', sub: 'plant standard: T568B end-to-end, no split pairs — a jack can work and still be non-compliant', icon: icon('clipboard-list', 'ic ic-16') },
      '<div class="stack-8px">' + jackRows
      + '<div>' + subheadHTML('Audit answer — which jacks violate the plant standard?')
      + multiPickHTML('jack-audit', JACKS.map(function (j) { return { v: j.id, label: j.id + ' — non-compliant' }; }))
      + '</div></div>');
  }

  return '<div class="stack-md">' + mainPanel + auditPanel + '</div>';
}

// ═════════════════════════════════════════════════════════════════════
// OBJECTIVES DOCK (ObjectivesDock.tsx)
// ═════════════════════════════════════════════════════════════════════
function answerFieldsHTML(obj) {
  const fields = ANSWER_FIELDS[obj.id];
  if (!fields) return '';
  return '<div class="stack-8px">' + fields.map(function (f) {
    if (f.type === 'note') return '<p class="text-11 t-z400">' + esc(f.text) + '</p>';
    if (f.type === 'diag') return selectFieldHTML(f.k, f.placeholder, typeof f.opts === 'string' ? DIAG_OPTS[f.opts] : f.opts, state.env.diag[f.k], f.placeholder, 'diag');
    if (f.type === 'multi') return multiPickHTML(f.k, f.opts);
    if (f.type === 'match') return matchFieldHTML(f.k, f.label, DIAG_OPTS[f.opts], state.env.match[f.k]);
    if (f.type === 'num') return numFieldHTML(f.k, f.label, f.unit, f.placeholder);
    return '';
  }).join('') + '</div>';
}

function objectiveCardHTML(obj, mode) {
  const st = state.obj[obj.id];
  const open = uiState.openCards[obj.id] !== undefined ? uiState.openCards[obj.id] : (mode === 'medium');
  const d = derive(state.env);
  const pass = obj.check(state.env, d);
  let h = '<article class="obj-card' + (st && st.done ? ' obj-done' : '') + '">'
    + '<header class="obj-head"><div class="min-w-0">'
    + '<div class="obj-tags"><span class="obj-id">' + obj.id + '</span>' + pillarBadgeHTML(obj.pillar)
    + (st && st.done ? '<span class="done-chip">' + icon('check-circle-2', 'ic ic-12') + ' done</span>' : '')
    + '</div>'
    + '<button type="button" data-action="toggle-card" data-arg="' + obj.id + '" aria-expanded="' + open + '" class="obj-title">'
    + esc(obj.title) + icon('chevron-down', 'ic ic-14 chev' + (open ? ' chev-open' : ''))
    + '</button>'
    + '</div></header>';
  if (open) {
    h += '<div class="obj-body">'
      + '<p class="text-11 obj-guide">' + esc(obj.guide) + '</p>'
      + hintStackHTML(obj.id, mode === 'hard' ? [obj.hints[0]] : obj.hints)
      + answerFieldsHTML(obj)
      + '<div class="flex-ic gap-8px">'
      + '<button type="button" data-action="check" data-arg="' + obj.id + '" aria-label="CHECK RESULTS ' + obj.id + '" class="btn btn-orange obj-check">CHECK RESULTS</button>'
      + (st && st.attempts ? '<span class="attempts">attempts: ' + st.attempts + (st.done ? (st.firstTry ? ' · first try ✓' : '') : '') + '</span>' : '')
      + '</div>'
      + checkResultHTML(st, obj)
      + '</div>';
  }
  return h + '</article>';
}

function objectivesSheetHTML() {
  const objectives = OBJECTIVES[state.mode];
  const done = objectives.filter(function (o) { return state.obj[o.id] && state.obj[o.id].done; }).length;
  const pct = Math.round((done / objectives.length) * 100);
  return '<div class="backdrop" data-action="close-objectives"></div>'
    + '<aside class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title" data-overlay="sheet">'
    + '<button type="button" data-action="close-objectives" class="overlay-x" aria-label="Close">' + icon('x', 'ic ic-16') + '</button>'
    + '<div class="sheet-head">'
    + '<h2 id="sheet-title" class="sheet-title">' + icon('target', 'ic ic-16 t-orange500') + ' Objectives · ' + (state.mode === 'medium' ? 'guided' : 'on-call') + ' mode</h2>'
    + '<p class="sr-only">Live objective tracker with per-objective checks, hints and progress for this bench.</p>'
    + '<div class="sheet-progress" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100">'
    + '<div class="sheet-progress-fill" style="width:' + pct + '%"></div></div>'
    + '<p class="sheet-note">' + (state.mode === 'medium'
        ? 'guided · tiered hints available · wrong answers teach, never block'
        : 'on-call · one optional nudge (costs score) · strict validation') + '</p>'
    + '</div>'
    + '<div class="sheet-body">'
    + objectives.map(function (o) { return objectiveCardHTML(o, state.mode); }).join('')
    + '</div></aside>';
}

// ═════════════════════════════════════════════════════════════════════
// QUIZ (QuizSection.tsx) — sequential, answer locks on submit
// ═════════════════════════════════════════════════════════════════════
function renderQuiz() {
  const mode = state.mode;
  const questions = quizFor(mode);
  const idx = Math.min(uiState.quizIdx, questions.length - 1);
  const q = questions[idx];
  const chosen = state.quizAnswers[q.id];
  const draft = uiState.quizDrafts[q.id];
  const isLocked = !!state.quizLocked[q.id];
  const isRight = chosen === q.correct;
  const correct = questions.filter(function (x) { return state.quizLocked[x.id] && state.quizAnswers[x.id] === x.correct; }).length;
  const answered = questions.filter(function (x) { return state.quizLocked[x.id]; }).length;
  const allAnswered = answered === questions.length;

  const rail = '<div class="quiz-rail" aria-label="Question ' + Math.min(idx + 1, questions.length) + ' of ' + questions.length + '">'
    + readoutHTML('Q ' + Math.min(idx + 1, questions.length) + '/' + questions.length, 'default', 'rail-count')
    + '<div class="quiz-segments" aria-hidden="true">'
    + questions.map(function (x, i) {
        const cls = state.quizLocked[x.id] ? (state.quizAnswers[x.id] === x.correct ? 'seg-good' : 'seg-bad') : (i === idx ? 'seg-cur' : 'seg');
        return '<span class="quiz-seg ' + cls + '"></span>';
      }).join('')
    + '</div></div>';

  const options = q.options.map(function (opt, oi) {
    const isChosen = chosen === oi;
    // R3 color contract: green ONLY on the student's own correct pick, red ONLY on
    // the student's own wrong pick. The correct answer is never revealed in green.
    const rightPick = isLocked && isChosen && isRight;
    const wrongPick = isLocked && isChosen && !isRight;
    const cls = !isLocked ? 'opt'
      : rightPick ? 'opt opt-right' : wrongPick ? 'opt opt-wrong' : 'opt opt-dim';
    return '<label class="' + cls + '">'
      + '<input type="radio" name="quiz-' + q.id + '" value="' + oi + '" class="rdio"'
      + (isLocked ? ' disabled' : '')
      + (String(draft !== undefined ? draft : (chosen !== undefined ? chosen : '')) === String(oi) ? ' checked' : '')
      + ' data-action="quiz-draft" data-id="' + q.id + '" data-arg="' + oi + '" aria-label="' + esc(opt) + '" />'
      + '<span class="opt-text">' + esc(opt) + '</span>'
      + (rightPick ? icon('check-circle-2', 'ic ic-16 t-emerald400') + '<span class="sr-only">correct</span>' : '')
      + (wrongPick ? icon('x-circle', 'ic ic-16 t-red400') + '<span class="sr-only">incorrect</span>' : '')
      + '</label>';
  }).join('');

  const article = '<article class="quiz-card ' + (isLocked ? (isRight ? 'quiz-good' : 'quiz-bad') : '') + '">'
    + '<header class="quiz-head"><span class="quiz-qnum">Q' + (idx + 1) + '</span>'
    + '<p class="quiz-qtext">' + esc(q.q) + '</p></header>'
    + '<div class="quiz-opts">' + options + '</div>'
    + (!isLocked
        ? '<div class="quiz-actions"><button type="button" data-action="quiz-submit" data-arg="' + q.id + '" class="btn btn-orange"'
          + (draft === undefined ? ' disabled' : '') + '>SUBMIT ANSWER</button></div>'
        : '<p class="quiz-explain ' + (isRight ? 'qe-good' : 'qe-bad') + '"><span class="qe-mark">' + (isRight ? '✓' : '✗') + '</span>' + esc(q.explain) + '</p>'
          + (idx < questions.length - 1
              ? '<div class="quiz-actions"><button type="button" data-action="quiz-next" class="btn btn-orange">NEXT QUESTION ' + icon('arrow-right', 'ic ic-14') + '</button></div>'
              : ''))
    + '</article>';

  const summary = allAnswered
    ? '<div class="quiz-done" role="status">' + readoutHTML('Quiz complete — ' + correct + '/' + questions.length + ' (' + Math.round((correct / questions.length) * 100) + '%)', 'accent', 'text-sm')
      + '<p class="mt-4px text-11 t-z500">Score is informational; your mastery rating comes from the objectives. Re-read the field manual for any question you missed.</p></div>'
    : (!allAnswered && answered > idx + 1 ? '<p class="quiz-locked-note">Earlier answers are locked — they stay saved and counted.</p>' : '');

  return panelHTML(
    { id: 'bay-quiz', title: 'Knowledge check · ' + (mode === 'medium' ? 'concepts' : 'scenario triage'),
      sub: mode === 'medium' ? 'answer, read the explanation, keep moving' : 'application-level — justify like you would to a lead tech',
      icon: icon('graduation-cap', 'ic ic-16'),
      right: readoutHTML(correct + '/' + questions.length + ' correct', allAnswered ? (correct === questions.length ? 'good' : 'warn') : 'default') },
    rail + article + summary
  );
}

// ═════════════════════════════════════════════════════════════════════
// DEBRIEF (Debrief.tsx)
// ═════════════════════════════════════════════════════════════════════
const DETECTION = [
  ['Interface counters (CLI / SNMP)', 'Poll CRC/input-error deltas; alert on rate, not totals.', 'if delta(ifInCRCs, 5m) > 50 → open physical-layer ticket'],
  ['Port status + LED wall', 'linkDown/linkUp traps, err-disable reasons, admin-down audit.', 'trap linkDown on Gi1/0/3 within 60s of change → notify NOC'],
  ['Cable tester / certifier', 'Wire-map + length + insertion loss at commissioning and after every move.', 'certify every new channel ≤ 100 m, headroom ≥ 1.5 dB'],
  ['PoE budget monitoring', 'Track committed draw vs budget; alert before the deny threshold.', 'draw > 85% of budget → capacity review'],
  ['Optical power (DOM)', 'Read transceiver RX/TX dBm; trend degradation over weeks.', 'RX below spec floor −1 dB → clean/replace connector'],
];

const MITIGATIONS = [
  'Standardize one pin-out (T568B) plant-wide; certify every channel at commissioning (≤ 100 m, loss within budget).',
  'Stock factory-terminated patch cords in matched categories; retire the crimp tool from the parts bin.',
  'Separate copper from power paths; use STP or fiber where separation is impossible (fiber is EMI-immune).',
  'Match optics end-to-end: speed, fiber mode, wavelength — and label both ends plus the cord.',
  'Plan PoE with ≥ 20% headroom; pin device standards (af/at/bt) to the port config, never clamp below the device class.',
  'Recover err-disable ports only after the cause is fixed; treat admin-down states as intentional until proven otherwise.',
];

function renderDebrief() {
  const detectionRows = DETECTION.map(function (row) {
    return '<tr><td class="det-src">' + esc(row[0]) + '</td><td>' + esc(row[1]) + '</td><td><code class="det-code">' + esc(row[2]) + '</code></td></tr>';
  }).join('');
  return panelHTML(
    { title: 'Debrief · field notes', sub: 'detection opportunities · mitigation recommendations · both mindsets', icon: icon('clipboard-check', 'ic ic-16'), right: readoutHTML('N10-009 · 5.2') },
    '<div class="stack-md">'
    + '<section><h3 class="k-head">' + icon('radar', 'ic ic-14') + ' Detection opportunities</h3>'
    + '<div class="table-scroll"><table class="det-table"><thead><tr><th>Data source</th><th>What to watch</th><th>Example detection logic</th></tr></thead>'
    + '<tbody>' + detectionRows + '</tbody></table></div></section>'
    + '<section><h3 class="k-head">' + icon('wrench', 'ic ic-14') + ' Mitigation recommendations</h3>'
    + '<ul class="disc-list text-125">' + MITIGATIONS.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ul></section>'
    + '<section class="team-grid">'
    + '<div class="team-card team-blue"><h3 class="team-head team-head-blue">' + icon('shield-alert', 'ic ic-14') + ' Blue-team takeaways</h3>'
    + '<ul class="disc-list text-xs"><li>Verify with rates and deltas — totals mislead; a &ldquo;healthy&rdquo; port is stable, not zero.</li>'
    + '<li>Separate evidence from symptoms: tester wire-map, meter dB, counters, LEDs.</li>'
    + '<li>Fix the cause before recovering the port; document after verifying.</li>'
    + '<li>Leave intentional states (admin-down, spares) alone — change without cause is its own incident.</li></ul></div>'
    + '<div class="team-card team-red"><h3 class="team-head team-head-red">' + icon('search', 'ic ic-14') + ' Red-team mindset (defensive)</h3>'
    + '<ul class="disc-list text-xs"><li>Think like an auditor: where is the unlabeled patch, the shared conduit, the spare that &ldquo;nobody knows&rdquo;?</li>'
    + '<li>Physical-layer blind spots are operational risk: a stolen PoE port or an unplugged uplink needs no exploit.</li>'
    + '<li>Your monitoring only sees what cabling carries — certify the channel before trusting the telemetry.</li>'
    + '<li>Every fault class in this bench is also an outage class someone could cause accidentally. Design to fail safe.</li></ul></div>'
    + '</section>'
    + '<section class="refs-box"><h3 class="callout-label">' + icon('book-marked', 'ic ic-14') + ' References (open in new tab)</h3>'
    + '<ul class="disc-list text-xs">'
    + '<li><a href="https://www.comptia.org/certifications/network" target="_blank" rel="noopener noreferrer" class="ref-link">CompTIA Network+ certification page (N10-009 objectives)</a></li>'
    + '<li><a href="https://standards.ieee.org/ieee/802.3/7029/" target="_blank" rel="noopener noreferrer" class="ref-link">IEEE 802.3 (Ethernet — incl. PoE af/at/bt)</a></li>'
    + '</ul>'
    + '<p class="refs-note">Simplifications: Cat7 treated as shielded cabling with GG45/TERA connectors; auto-MDIX disabled fleet-wide in this scenario to keep classic wiring rules exam-visible.</p>'
    + '</section>'
    + '</div>'
  );
}

// ═════════════════════════════════════════════════════════════════════
// COMPLETION MODAL (CompletionModal.tsx)
// ═════════════════════════════════════════════════════════════════════
const FOCUS_POINTER = {
  M1: 'category bandwidth–distance limits, crossover vs straight-through, plenum fire code',
  M2: 'single-mode vs multimode reach and connector families',
  M3: 'reading a wire map: split pairs, crosstalk (NEXT) and the gigabit downshift',
  M4: 'TX/RX transposition and the auto-MDIX caveat',
  M5: 'channel length / insertion-loss budgets (100 m rule, dB math)',
  M6: 'EMI coupling from power paths and why fiber is immune',
  M7: 'port states: err-disabled vs admin-down vs suspended vs PoE-denied',
  M8: 'which counters prove a physical fault (CRC/input rates vs totals)',
  M9: 'counter signatures: CRC, runts, giants, drops',
  M10: 'PoE budget arithmetic and the af/at/bt standard ladder',
  M11: 'transceiver matching: speed, fiber mode, wavelength',
  M12: 'termination discipline: T568B, untwist ≤13 mm, cause-before-cure ordering',
  H1: 'building an evidence → diagnosis → fix → verify chain',
  H2: 'two-fault PoE triage: budget math AND the standard clamp',
  H3: 'optics physics: which wavelength rides which fiber mode',
  H4: 'rejecting decoy theories with interface evidence',
  H5: 'counter forensics: assigning exact causes from snapshots',
  H6: 'copper dB excess vs fiber dB shortfall certification math',
  H7: 'plant-standard audits: T568A/B mixing and split pairs',
  H8: 'remediation ordering: confirm → change → verify → document',
  H9: 'red-herring discipline: fix real faults, leave intentional states alone',
};

function starIcon(cls, ariaHidden) {
  // filled star (fill=currentColor) used for empty/full/half layers
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="' + (ariaHidden !== false) + '" class="' + cls + '"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
}

function renderCompletionModal() {
  const mode = state.mode;
  const objectives = OBJECTIVES[mode];
  const stats = objectiveStats(state.obj, objectives.map(function (o) { return o.id; }));
  const stars = starsFor(stats);
  const quiz = quizFor(mode);
  const quizCorrect = quiz.filter(function (q) { return state.quizLocked[q.id] && state.quizAnswers[q.id] === q.correct; }).length;

  const byPillar = ['P1', 'P2', 'P3', 'P4'].map(function (p) {
    return { p: p, items: objectives.filter(function (o) { return o.pillar === p; }) };
  });

  // R8: focus areas derived from THIS student's evidence
  const focus = [];
  objectives.forEach(function (o) {
    const st = state.obj[o.id];
    if (!st) return;
    const parts = [];
    if (!st.firstTry) parts.push('closed on attempt ' + st.attempts);
    if (st.hintsUsed > 0) parts.push(st.hintsUsed + ' hint' + (st.hintsUsed > 1 ? 's' : '') + ' used');
    if (parts.length) focus.push({ area: o.id, evidence: parts.join(' · '), study: FOCUS_POINTER[o.id] || o.title });
  });
  const missedQuiz = quiz.filter(function (q) { return state.quizLocked[q.id] && state.quizAnswers[q.id] !== q.correct; });
  missedQuiz.slice(0, 4).forEach(function (q) {
    focus.push({ area: 'Quiz ' + q.id.toUpperCase(), evidence: 'answered wrong', study: q.topic });
  });

  const nextSteps = mode === 'medium'
    ? ['Re-run the bench in Hard mode — same closet, no guidance, red herrings included.', 'Review N10-009 5.1 (troubleshooting methodology) and connect each step to a bench action you just took.', 'Practice reading real `show interface` output and classify every counter line.']
    : ['Take a full N10-009 Domain 5 practice set and time yourself on scenario items.', 'Shadow a cable certification job: tester, dB budget, label discipline.', 'Move on to the next Domain 5 objectives (common network & service issues) — Layer 2/3 faults now.'];

  // 5-star meter (full / half / empty) — one icon per star
  const starRow = [1, 2, 3, 4, 5].map(function (n) {
    const full = stars >= n;
    const half = !full && stars >= n - 0.5;
    return '<span class="star-wrap">'
      + starIcon('star star-empty')
      + (full ? starIcon('star star-full') : '')
      + (half ? '<span class="star-half-clip">' + starIcon('star star-full') + '</span>' : '')
      + '</span>';
  }).join('');

  const focusHTML = focus.length === 0
    ? '<p class="focus-clean">Clean run: every objective closed first-try with no hints and every quiz item correct. Keep the same discipline on the next domain.</p>'
    : '<ul class="focus-list">' + focus.map(function (f) {
        return '<li><span class="focus-chip">' + esc(f.area) + '</span><span class="focus-evidence">(' + esc(f.evidence) + ')</span><br /><span class="focus-study">Review ' + esc(f.study) + '.</span></li>';
      }).join('') + '</ul>';

  const recap = byPillar.map(function (ref) {
    return '<div class="pillar-recap"><p class="recap-line">'
      + '<span class="pillar-badge ' + PILLAR_META[ref.p].cls + '">' + ref.p + ' · ' + PILLAR_META[ref.p].name + '</span>'
      + '<span class="recap-count">' + ref.items.filter(function (o) { return state.obj[o.id] && state.obj[o.id].done; }).length + '/' + ref.items.length + '</span></p>'
      + '<ul class="recap-list">' + ref.items.map(function (o) {
          return '<li>' + icon('check-circle-2', 'ic ic-12 ' + (state.obj[o.id] && state.obj[o.id].done ? 't-emerald400' : 't-z700'))
            + '<span class="clamp-1">' + esc(o.title) + '</span></li>';
        }).join('') + '</ul></div>';
  }).join('');

  return '<div class="backdrop" data-action="close-completion"></div>'
    + '<div class="modal modal-completion" role="dialog" aria-modal="true" aria-labelledby="completion-title" aria-describedby="completion-desc" data-overlay="modal">'
    + '<button type="button" data-action="close-completion" class="overlay-x" aria-label="Close">' + icon('x', 'ic ic-16') + '</button>'
    + '<div class="modal-head">'
    + '<h2 id="completion-title" class="modal-title">' + icon('trophy', 'ic ic-20 t-amber400') + ' Bench sign-off · ' + (mode === 'medium' ? 'guided' : 'on-call') + ' mode</h2>'
    + '<p id="completion-desc" class="modal-desc">All ' + stats.total + ' objectives closed. Here is what the bench recorded.</p>'
    + '</div>'
    + '<div class="stack-md">'
    + '<div class="stars-box"><div class="star-row" role="img" aria-label="Mastery ' + stars + ' out of 5 stars">' + starRow + '</div>'
    + '<p class="stars-stats">first-attempt ' + stats.firstTry + '/' + stats.total + ' · hints used ' + stats.hints + ' · quiz ' + quizCorrect + '/' + quiz.length + '</p></div>'
    + '<div class="focus-box"><h3 class="focus-head">' + icon('crosshair', 'ic ic-14') + ' Focus areas for review</h3>' + focusHTML + '</div>'
    + '<div><h3 class="recap-head">Mastery recap by pillar</h3><div class="stack-6px">' + recap + '</div></div>'
    + '<div class="next-box"><h3 class="next-head">' + icon('compass', 'ic ic-14') + ' What to learn next</h3>'
    + '<ul class="disc-list text-xs">' + nextSteps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul></div>'
    + '<div class="modal-footer">'
    + '<button type="button" data-action="reset-from-modal" class="btn btn-outline-dark">' + icon('rotate-ccw', 'ic ic-14') + ' RESET BENCH</button>'
    + '<button type="button" data-action="close-completion" class="btn btn-orange">BACK TO THE BENCH</button>'
    + '</div>'
    + '</div></div>';
}

// Reset confirmation dialog (AlertDialog — no outside-click dismissal)
function renderResetDialog() {
  return '<div class="backdrop"></div>'
    + '<div class="modal modal-alert" role="alertdialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-desc" data-overlay="modal">'
    + '<div class="modal-head">'
    + '<h2 id="reset-title" class="modal-title modal-title-sm">Reset the bench?</h2>'
    + '<p id="reset-desc" class="modal-desc">Wipes mode, objectives, quiz answers and every physical fix. The closet returns to its Monday-morning state.</p>'
    + '</div>'
    + '<div class="alert-footer">'
    + '<button type="button" data-action="close-reset" class="btn btn-outline-dark">keep working</button>'
    + '<button type="button" data-action="do-reset" class="btn btn-danger">reset everything</button>'
    + '</div></div>';
}

// Field manual dialog
function renderManualDialog() {
  return '<div class="backdrop" data-action="close-manual"></div>'
    + '<div class="modal modal-manual" role="dialog" aria-modal="true" aria-labelledby="manual-title" aria-describedby="manual-desc" data-overlay="modal">'
    + '<button type="button" data-action="close-manual" class="overlay-x" aria-label="Close">' + icon('x', 'ic ic-16') + '</button>'
    + '<div class="modal-head">'
    + '<h2 id="manual-title" class="modal-title modal-title-xs">Field manual</h2>'
    + '<p id="manual-desc" class="modal-desc">Scenario briefing, knowledge core and glossary — same content as the entry screen.</p>'
    + '</div>'
    + renderBriefing(true)
    + '</div>';
}
