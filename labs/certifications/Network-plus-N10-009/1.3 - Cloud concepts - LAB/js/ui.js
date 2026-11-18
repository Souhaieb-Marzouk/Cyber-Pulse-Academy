// ── LZ-MERIDIAN static · ui.js (part 1: helpers, apron, header, brief, ground) ──
// Rendering helpers + template functions for every phase view.
// All student-facing wording is ported 1:1 from the original components.
'use strict';

/* ── tiny DOM/template helpers ─────────────────────────────────────────── */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function ic(name, cls) { return icon(name, cls); }

/* ── shared primitives (ported from shared.tsx) ────────────────────────── */
function trainingNote() {
  return '<span class="badge-training">' + ic('triangle-alert') + ' TRAINING DATA — synthetic</span>';
}
function secTitle(kicker, title, iconName) {
  return '<div class="sec-title">' +
    (iconName ? '<span class="ico">' + ic(iconName, 'sz-20') + '</span>' : '') +
    '<div><p class="kicker">' + esc(kicker) + '</p><h2>' + esc(title) + '</h2></div></div>';
}
function pillarBadge(pillar) {
  var meta = { P1: 'p1', P2: 'p2', P3: 'p3', P4: 'p4' }[pillar];
  var label = { P1: 'Understand', P2: 'Recognize', P3: 'Observe & Diagnose', P4: 'Harden & Decide' }[pillar];
  return '<span class="badge badge-pillar ' + meta + '" aria-label="Pillar: ' + esc(label) + '">' +
    esc(pillar) + ' · ' + esc(label) + '</span>';
}
function verdictBadge(v) {
  return v === 'allow'
    ? '<span class="badge badge-allow" aria-label="Allowed">' + ic('check', 'sz-12') + ' ALLOW</span>'
    : '<span class="badge badge-deny" aria-label="Denied">' + ic('x', 'sz-12') + ' DENY</span>';
}
/* Inline glossary term — hover/focus tooltip (hover-card behavior ported). */
function gTerm(term, labelOverride) {
  var entry = GLOSSARY.find(function (g) { return g.term.toLowerCase() === term.toLowerCase(); });
  if (!entry) return esc(labelOverride || term);
  return '<button type="button" class="g-term" data-glossary="' + esc(entry.term) + '"' +
    ' aria-label="Glossary: ' + esc(entry.term) + '">' + esc(labelOverride || entry.term) + '</button>';
}
function toolCard(id, title, sub, iconName, inner) {
  return '<section class="card scroll-anchor" id="' + esc(id) + '" data-tool="' + esc(id) + '">' +
    '<div class="card-pad"><div class="toolcard-head"><span class="ico">' + ic(iconName, 'sz-20') + '</span>' +
    '<div><h3>' + esc(title) + '</h3><p>' + esc(sub) + '</p></div></div>' + inner + '</div></section>';
}

/* ── F-1 · Mode apron (difficulty selection) ───────────────────────────── */
function viewModeApron() {
  return '<div class="apron">' +
    '<div class="fade-in">' +
      '<p class="kicker">Aerolune Cargo · Network Engineering Division</p>' +
      '<h1>LZ-MERIDIAN <span class="accent">Landing Zone</span></h1>' +
      '<p class="lede">An interactive commissioning lab for <strong>' + esc(EXAM_TAG) + '</strong>. You are the junior network engineer on the ' +
        'crew standing up Aerolune Cargo’s hybrid cloud landing zone — every panel, probe and checklist below drills a ' +
        'real objective from the exam blueprint.</p>' +
      '<div class="meta-row">' + trainingNote() +
        '<span class="badge badge-outline lz-mono" style="font-size:0.625rem;border-color:var(--teal);color:var(--teal);">DEFENSIVE / EDUCATIONAL</span>' +
        '<span class="badge badge-outline lz-mono" style="font-size:0.625rem;">Domain 1.0 · 23% of the exam</span>' +
      '</div>' +
    '</div>' +
    '<div class="mode-grid" role="radiogroup" aria-label="Choose difficulty mode">' +
      '<div class="fade-in d1"><div class="card mode-card teal">' +
        '<div class="pad">' +
          '<div><div class="head-row"><span class="mode-kicker teal-fg">Line Check</span>' + ic('book-open-check', 'sz-20 teal-fg') + '</div>' +
          '<h2>Medium — learn it</h2></div>' +
          '<p style="color:var(--muted-fg);">Guided commissioning: <strong>12 granular objectives</strong> introduced in order, each with context and a ' +
            '“where to look” pointer. Three-tier hints are free — they only cost stars. Wrong answers teach, never punish.</p>' +
          '<ul>' +
            '<li>' + ic('list-checks', 'sz-16 teal-fg') + ' 12 guided objectives · 6-question concept review</li>' +
            '<li>' + ic('lightbulb', 'sz-16 teal-fg') + ' Tiered hints (nudge → direction → demonstration)</li>' +
            '<li>' + ic('gauge', 'sz-16 teal-fg') + ' Tolerant checking: synonyms and formats accepted</li>' +
          '</ul>' +
          '<button type="button" class="btn btn-lg btn-teal btn-block" data-act="pick-mode" data-mode="medium" aria-label="Start Medium mode (Line Check)">' +
            ic('plane', 'sz-16') + ' Start the line check</button>' +
        '</div></div></div>' +
      '<div class="fade-in d2"><div class="card mode-card orange">' +
        '<div class="pad">' +
          '<div><div class="head-row"><span class="mode-kicker orange-fg">Type Rating</span>' + ic('compass', 'sz-20 orange-fg') + '</div>' +
          '<h2>Hard — prove it</h2></div>' +
          '<p style="color:var(--muted-fg);">Unsupervised sign-off: <strong>9 broad, multi-step challenges</strong> hidden inside a noisy discovery ' +
            'dossier — two red herrings included. One optional nudge per objective, and it costs score. Near-misses are ' +
            'rejected with the reason.</p>' +
          '<ul>' +
            '<li>' + ic('list-checks', 'sz-16 orange-fg') + ' 9 discovery challenges · 7-scenario certification review</li>' +
            '<li>' + ic('lightbulb', 'sz-16 orange-fg') + ' Single nudge only — visibly deducted</li>' +
            '<li>' + ic('keyboard', 'sz-16 orange-fg') + ' Strict checking: exact CIDRs, /32 scopes, priorities, sequences</li>' +
          '</ul>' +
          '<button type="button" class="btn btn-lg btn-orange btn-block" data-act="pick-mode" data-mode="hard" aria-label="Start Hard mode (Type Rating)">' +
            ic('plane', 'sz-16') + ' Start the type rating</button>' +
        '</div></div></div>' +
    '</div>' +
    '<p class="pillar-note" style="margin-top:2rem;">' + esc(LAB_TAG) + ' · progress auto-saves in your browser · RESET returns the lab to pristine state · every objective is ' +
      'machine-validated against the exam objective 1.3 sub-bullets.</p>' +
  '</div>';
}

/* ── F-3/F-4 · Header flight strip + phase machine ─────────────────────── */
var PHASES = [
  { key: 'brief', label: 'Briefing' },
  { key: 'ground', label: 'Ground school' },
  { key: 'floor', label: 'Floor' },
  { key: 'review', label: 'Review' },
  { key: 'handover', label: 'Handover' },
];
function viewHeader() {
  var mode = S.mode;
  var objectives = S.mode ? objectivesFor(S.mode) : [];
  var doneCount = objectives.filter(function (o) { return S.objectives[o.id] && S.objectives[o.id].done; }).length;
  var quizTotal = mode ? QUIZ.filter(function (q) { return q.mode === mode; }).length : 0;
  var firstUnvisited = null;
  for (var i = 0; i < PHASES.length; i++) { if (!S.visited[PHASES[i].key]) { firstUnvisited = PHASES[i].key; break; } }
  var nav = PHASES.map(function (p) {
    var active = S.phase === p.key;
    var visited = !!S.visited[p.key];
    var unlocked = visited || p.key === 'brief' || p.key === firstUnvisited;
    return '<button type="button" class="phase-btn' + (active ? ' active' : '') + '" data-act="goto" data-phase="' + p.key + '"' +
      (unlocked ? '' : ' disabled') + (active ? ' aria-current="page"' : '') + '>' + esc(p.label) + '</button>';
  }).join('');
  return '<header class="lab-header"><div class="inner">' +
    '<div class="brand"><span class="lz-head" style="font-weight:700;">LZ-MERIDIAN</span>' +
    '<span class="exam-tag">' + esc(EXAM_TAG) + ' · ' + (mode === 'medium' ? 'LINE CHECK' : 'TYPE RATING') + '</span></div>' +
    '<nav aria-label="Lab phases" class="phase-nav">' + nav + '</nav>' +
    '<div class="header-actions">' +
      '<span class="header-count" aria-live="polite" aria-label="Objectives complete: ' + doneCount + ' of ' + objectives.length + '">' +
        'OBJ ' + doneCount + '/' + objectives.length + (S.quiz.submitted ? ' · QZ ' + S.quiz.correct + '/' + quizTotal : '') + '</span>' +
      '<button type="button" class="btn btn-ghost-header" data-act="open-glossary" aria-label="Open glossary">' +
        ic('book-open-text', 'sz-16') + '<span class="hide-md lz-head" style="font-size:0.625rem;">Glossary</span></button>' +
      '<button type="button" class="btn btn-ghost-header" data-act="open-reset" aria-label="Reset the lab to pristine state">' +
        ic('rotate-ccw', 'sz-16') + '<span class="hide-md lz-head" style="font-size:0.625rem;">Reset</span></button>' +
    '</div>' +
  '</div></header>';
}

/* ── F-5 · Briefing (C1) ───────────────────────────────────────────────── */
function viewBriefing() {
  var modeLine = S.mode === 'medium' ? 'a guided line check' : 'an unsupervised type rating';
  return '<div class="wrap" style="max-width:48rem;">' +
    secTitle('Section 01 · Scenario briefing', 'Project Meridian Lift — Aerolune Cargo goes hybrid', 'plane-takeoff') +
    '<div class="card" style="margin-top:1.5rem;"><div class="prose-card"><div class="pad">' +
      '<p><strong>Aerolune Cargo</strong> — a fictional mid-size air-freight carrier hubbed at Meridian International — ' +
        'has outgrown its server room. Freight booking, truck telemetry, warehouse cameras, the ERP that prints the ' +
        'manifests: leadership has signed off <em>Project Meridian Lift</em>, a migration into a hybrid cloud landing ' +
        'zone codenamed <strong class="lz-mono">LZ-MERIDIAN</strong>.</p>' +
      '<div class="fact-grid">' +
        '<div class="fact-cell tinted">' + ic('radio', 'sz-16') + '<p class="t">Live telemetry</p><p class="d">2,000 trucks report positions on a 99.99% latency SLA.</p></div>' +
        '<div class="fact-cell tinted">' + ic('warehouse', 'sz-16') + '<p class="t">Nightly bulk sync</p><p class="d">2 TB of warehouse data moves to the cloud every night.</p></div>' +
        '<div class="fact-cell tinted">' + ic('file-warning', 'sz-16') + '<p class="t">An auditor’s memo</p><p class="d">HQ runs 10.20.0.0/16 — and last year’s audit flagged “world-open” firewall rules.</p></div>' +
      '</div>' +
      '<p>You are the <strong>junior network engineer</strong> on the landing-zone crew. Your shift today: commission the ' +
        'VPC, wire its gateways, author the screening rules, sort the incoming workloads into the right service models, ' +
        'and justify the connectivity spend — in ' + modeLine + '.</p>' +
      '<p class="quote-note">Why this matters beyond the exercise: this is <strong>N10-009 Objective 1.3</strong> — “Summarize cloud concepts ' +
        'and connectivity options” — 23% of the Network+ exam lives in Domain 1, and cloud questions lean on exactly these ' +
        'discriminations: who manages what, which door traffic takes, and why the rules are ordered the way they are.</p>' +
      '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:0.75rem;padding-top:0.25rem;">' + trainingNote() +
        '<span class="lz-mono" style="font-size:0.6875rem;color:var(--muted-fg);">All names, hosts, addresses and tickets in this lab are synthetic.</span></div>' +
    '</div></div></div>' +
    '<div class="section-cta" style="margin-top:1.5rem;">' +
      '<button type="button" class="btn btn-lg btn-dark" data-act="goto" data-phase="ground">Enter ground school ' + ic('arrow-right', 'sz-16') + '</button></div>' +
  '</div>';
}

/* ── F-6 · Ground school (C2) ──────────────────────────────────────────── */
var STACK = [
  { layer: 'Application code & config', onprem: 'C', iaas: 'C', paas: 'C', saas: 'P' },
  { layer: 'Data & encryption', onprem: 'C', iaas: 'C', paas: 'C', saas: 'C' },
  { layer: 'Language runtime', onprem: 'C', iaas: 'C', paas: 'P', saas: 'P' },
  { layer: 'Guest OS', onprem: 'C', iaas: 'C', paas: 'P', saas: 'P' },
  { layer: 'Virtualization / hypervisor', onprem: 'C', iaas: 'P', paas: 'P', saas: 'P' },
  { layer: 'Physical plant & network fabric', onprem: 'C', iaas: 'P', paas: 'P', saas: 'P' },
];
function respCell(v) {
  return v === 'C'
    ? '<td class="cell-you">YOU</td>'
    : '<td class="cell-prov">PROVIDER</td>';
}
function viewGroundSchool() {
  var matrix = STACK.map(function (r) {
    return '<tr><td style="padding:0.375rem 0.75rem;">' + esc(r.layer) + '</td>' +
      respCell(r.onprem) + respCell(r.iaas) + respCell(r.paas) + respCell(r.saas) + '</tr>';
  }).join('');
  return '<div class="wrap" style="max-width:56rem;">' +
    secTitle('Section 02 · Ground school', 'Everything 1.3 expects you to summarize', 'book-marked') +
    '<p style="color:var(--muted-fg);font-size:0.875rem;margin-top:0.75rem;">Six short units, each mapped to an official sub-bullet of N10-009 1.3. Dotted orange terms open glossary tooltips.</p>' +

    '<div class="card" style="margin-top:1.5rem;"><div class="prose-card"><div class="pad">' +
      '<p class="unit-kicker">Unit 1 · Deployment models</p>' +
      '<h3 class="unit-h3">Whose hardware is it, and who may use it?</h3>' +
      '<div class="fact-grid two">' +
        '<div class="fact-cell"><strong>' + gTerm('Public cloud') + '</strong> — provider-owned, ' + gTerm('multitenancy', 'multitenant') + ' infrastructure rented on demand (AWS, Azure, GCP). Fast, elastic, opex; less control, shared hardware.</div>' +
        '<div class="fact-cell"><strong>' + gTerm('Private cloud') + '</strong> — single-tenant, cloud-style automation on dedicated hardware for one organization. Maximum control for sovereignty/compliance; you pay for the dedication.</div>' +
        '<div class="fact-cell"><strong>' + gTerm('Hybrid cloud') + '</strong> — on-prem/private and public run as one orchestrated estate: cloud bursting, data gravity, phased migration. The connecting VPN or dedicated circuit is what makes it “hybrid” rather than “two estates”.</div>' +
        '<div class="fact-cell tinted" style="background:rgba(239,234,223,0.7);"><strong>Community cloud</strong> — the adjacent model: infrastructure shared by organizations with common requirements (e.g., an airline consortium). Know it as a distractor option.</div>' +
      '</div>' +
      '<p style="font-size:0.875rem;color:var(--muted-fg);">Real-world reference points: Netflix runs its streaming estate on public cloud; banks keep core ledgers private for ' +
        'data-sovereignty rules and burst analytics publicly (hybrid); and the 2017 Verizon contractor leak — an unprotected ' +
        'public-cloud storage bucket — is the standing example of what “shared infrastructure, your configuration” means.</p>' +
    '</div></div></div>' +

    '<div class="card" style="margin-top:1.5rem;"><div class="prose-card"><div class="pad">' +
      '<p class="unit-kicker">Unit 2 · Service models</p>' +
      '<h3 class="unit-h3">Who manages what — the responsibility stack</h3>' +
      '<p style="font-size:0.875rem;color:var(--muted-fg);">NIST SP 800-145 defines the SPI stack. Read the table row by row: the boundary slides <em>up</em> the stack as you ' +
        'move IaaS → PaaS → SaaS. Examples: raw VM fleets (AWS EC2, Azure VMs) = IaaS · managed databases/runtimes (Azure ' +
        'SQL, App Service) = PaaS · finished apps (Microsoft 365, Salesforce) = SaaS.</p>' +
      '<div class="matrix-wrap"><table class="tbl" aria-label="Shared responsibility matrix across service models">' +
        '<thead><tr><th style="text-align:left;">Stack layer</th><th>On-prem</th><th>IaaS</th><th>PaaS</th><th>SaaS</th></tr></thead>' +
        '<tbody>' + matrix + '</tbody></table></div>' +
      '<p style="font-size:0.875rem;color:var(--muted-fg);">Data is the one row that never fully leaves the customer — classification and encryption stay yours in every model.</p>' +
    '</div></div></div>' +

    '<div class="card" style="margin-top:1.5rem;"><div class="prose-card"><div class="pad">' +
      '<p class="unit-kicker">Unit 3 · Network function virtualization</p>' +
      '<h3 class="unit-h3">Appliances become software</h3>' +
      '<p style="font-size:0.875rem;">' + gTerm('NFV') + ' replaces dedicated hardware — firewalls, routers, load balancers, IDS/IPS — with <strong>VNFs</strong>' +
        ' (virtual network functions): VMs or containers running on commodity x86 hosts. Hosts run a ' +
        gTerm('hypervisor', 'hypervisor') + ' — <strong>Type 1</strong> is bare-metal (ESXi, Hyper-V, KVM), ' +
        '<strong>Type 2</strong> is hosted on an OS (VirtualBox, Workstation). Containers virtualize at the OS level and ' +
        'share the host kernel.</p>' +
      '<div class="fact-grid three">' +
        '<div class="fact-cell">' + ic('server', 'sz-16 teal-ico') + '<strong>Benefits</strong><br />Deploy in minutes, scale in/out, no forklift hardware, central orchestration.</div>' +
        '<div class="fact-cell">' + ic('network', 'sz-16') + '<strong>Typical VNFs</strong><br />vFirewall · vRouter · vLoadBalancer · vIDS/IPS · VPN concentrators.</div>' +
        '<div class="fact-cell">' + ic('waypoints', 'sz-16') + '<strong>Limits</strong><br />Proprietary-DSP appliances and legally mandated tamper-resistant hardware (HSMs) stay physical.</div>' +
      '</div>' +
    '</div></div></div>' +

    '<div class="card" style="margin-top:1.5rem;"><div class="prose-card"><div class="pad">' +
      '<p class="unit-kicker">Unit 4 · VPC, subnets &amp; screening</p>' +
      '<h3 class="unit-h3">Your private slice of a shared cloud</h3>' +
      '<p style="font-size:0.875rem;">A ' + gTerm('VPC') + ' is a logically isolated network you define inside a public cloud: your own ' + gTerm('CIDR block') + ', ' +
        'divided into <strong>public subnets</strong> (routed toward an ' + gTerm('internet gateway') + ') and ' +
        '<strong>private subnets</strong> (no direct internet path — outbound-only via a ' + gTerm('NAT gateway') + '). Isolation is ' +
        'logical, not physical: the same racks serve everyone.</p>' +
      '<div class="fact-grid two">' +
        '<div class="fact-cell"><strong>' + gTerm('NSG') + ' — network security group</strong><br /><em>Stateful</em> L3/L4 filter attached to NICs/subnets. Rules carry priority (lowest number evaluated first), direction, protocol, port, source CIDR and allow/deny. Return traffic of allowed sessions is permitted automatically.</div>' +
        '<div class="fact-cell"><strong>Network security list</strong><br /><em>Stateless</em>, subnet-level cousin: replies are not remembered, so explicit return rules (including ephemeral ports) are required in both directions. The exam’s favourite contrast pair.</div>' +
      '</div>' +
    '</div></div></div>' +

    '<div class="card" style="margin-top:1.5rem;"><div class="prose-card"><div class="pad">' +
      '<p class="unit-kicker">Unit 5 · Cloud gateways &amp; connectivity options</p>' +
      '<h3 class="unit-h3">Every flow needs the right front door</h3>' +
      '<ul class="gate-list">' +
        '<li><strong>Internet gateway (IGW)</strong> — bidirectional internet for public subnets.</li>' +
        '<li><strong>NAT gateway</strong> — outbound-only egress for private subnets; the internet cannot initiate.</li>' +
        '<li><strong>VPN gateway</strong> — your side of a site-to-site IPsec tunnel to HQ (cheap, fast, internet-grade latency).</li>' +
        '<li><strong>Direct Connect / ExpressRoute / Cloud Interconnect</strong> — dedicated private circuit: predictable latency, sustained throughput, higher cost — and <em>not encrypted by default</em>.</li>' +
        '<li class="adj">Adjacent doors: <em>transit gateway</em> (hub interconnecting VPCs), <em>storage gateway</em> (hybrid file/volume bridge — not a network door).</li>' +
      '</ul>' +
    '</div></div></div>' +

    '<div class="card" style="margin-top:1.5rem;"><div class="prose-card"><div class="pad">' +
      '<p class="unit-kicker">Unit 6 · Scalability · elasticity · multitenancy</p>' +
      '<h3 class="unit-h3">The three properties every cloud pitch leans on</h3>' +
      '<div class="fact-grid three">' +
        '<div class="fact-cell">' + ic('trending-up', 'sz-16') + '<strong>Scalability</strong><br />Capacity to grow: vertical = bigger box (more vCPU), horizontal = more boxes behind a balancer.</div>' +
        '<div class="fact-cell">' + ic('cloud', 'sz-16') + '<strong>Elasticity</strong><br />Capacity follows demand automatically and the bill follows capacity — add at 9am, drain by evening.</div>' +
        '<div class="fact-cell">' + ic('layers', 'sz-16') + '<strong>Multitenancy</strong><br />Many unrelated customers share one physical platform, logically isolated from each other.</div>' +
      '</div>' +
    '</div></div></div>' +

    '<div class="section-cta" style="margin-top:1.5rem;">' +
      '<button type="button" class="btn btn-lg btn-dark" data-act="goto" data-phase="floor">To the commissioning floor ' + ic('arrow-right', 'sz-16') + '</button></div>' +
  '</div>';
}

/* ── Stable per-mount row shuffle (ported from shared.tsx useShuffled) ────
   Order never reveals answer patterns; re-rolls only when the source set
   changes (e.g. M4↔H6 on mode switch) or the panel is re-entered. */
var SHUFFLE_CACHE = {};
function shuffleKeyed(key, items) {
  var sig = items.length + ':' + (items.length ? items[0].id : '');
  var c = SHUFFLE_CACHE[key];
  if (!c || c.sig !== sig) {
    var idx = items.map(function (_, i) { return i; });
    for (var i = idx.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = idx[i]; idx[i] = idx[j]; idx[j] = t;
    }
    c = { sig: sig, order: idx };
    SHUFFLE_CACHE[key] = c;
  }
  return c.order.map(function (i) { return items[i]; });
}
function invalidateShuffles() { SHUFFLE_CACHE = {}; }

/* ── F-9 · Checklist dock (C4) ─────────────────────────────────────────── */
function objListHtml() {
  var objectives = objectivesFor(S.mode);
  return '<div class="stack" style="gap:0.625rem;">' + objectives.map(function (o) {
    var st = S.objectives[o.id] || { done: false, attempts: 0, firstAttempt: false, hintsUsed: 0 };
    var isDone = st.done;
    var fb = UI.feedback[o.id];
    var expanded = UI.focusedId === o.id;
    var hints = '';
    if (st.hintsUsed > 0) {
      hints = '<div class="stack" style="gap:0.375rem;">' + o.hints.slice(0, st.hintsUsed).map(function (h, i) {
        return '<p class="hint-box">' + ic('lightbulb', 'sz-14 amber-ico') + ' <strong>Hint ' + (i + 1) + ':</strong> ' + esc(h) + '</p>';
      }).join('') + '</div>';
    }
    var hintBtn = '';
    if (st.hintsUsed < o.hints.length) {
      var label = S.mode === 'medium'
        ? 'Reveal hint ' + (st.hintsUsed + 1) + '/' + o.hints.length + ' (costs stars)'
        : 'Use the one nudge (−6 pts)';
      hintBtn = '<button type="button" class="btn btn-sm btn-outline-amber" data-act="hint" data-id="' + esc(o.id) + '">' +
        ic('lightbulb', 'sz-16') + ' ' + esc(label) + '</button>';
    }
    var whereBtn = S.mode === 'medium'
      ? '<button type="button" class="btn btn-sm btn-outline-teal" data-act="where" data-id="' + esc(o.id) + '">' +
          ic('footprints', 'sz-16') + ' Where to look</button>'
      : '';
    var fbHtml = fb
      ? '<div aria-live="polite" class="fb ' + (fb.ok ? 'ok' : 'no') + '"><p class="t">' + esc(fb.title) + '</p><p class="b">' + esc(fb.body) + '</p></div>'
      : '';
    return '<div class="obj-card' + (isDone ? ' done' : expanded ? ' focused' : '') + '">' +
      '<button type="button" class="obj-toggle" data-act="focus-obj" data-id="' + esc(o.id) + '" aria-expanded="' + (expanded ? 'true' : 'false') + '">' +
        '<span class="' + (isDone ? 'done-ico' : 'open-ico') + '">' + ic(isDone ? 'check-circle-2' : 'circle', 'sz-20') + '</span>' +
        '<span class="body"><span class="meta">' +
          '<span class="badge badge-id">' + esc(o.id) + '</span>' +
          '<span class="badge badge-pillar ' + o.pillar.toLowerCase() + '">' + esc(o.pillar) + '</span>' +
          (st.attempts > 0 && !isDone ? '<span class="attempts">· ' + st.attempts + ' check' + (st.attempts > 1 ? 's' : '') + '</span>' : '') +
        '</span><span class="title">' + esc(o.title) + '</span></span>' +
        '<span class="chev' + (expanded ? ' up' : '') + '">' + ic('chevron-down', 'sz-16') + '</span>' +
      '</button>' +
      (expanded
        ? '<div class="obj-detail"><p class="brief">' + esc(o.brief) + '</p>' +
          '<p class="anchor">Covers: ' + esc(o.anchor) + '</p>' + hints + hintBtn +
          '<div class="btn-row">' + whereBtn +
            '<button type="button" class="btn btn-sm ' + (isDone ? 'btn-teal' : 'btn-orange') + '" data-act="check" data-id="' + esc(o.id) + '">' +
              ic('gavel', 'sz-16') + ' Check results</button></div>' + fbHtml + '</div>'
        : '') +
      '</div>';
  }).join('') + '</div>';
}
function viewChecklistDock() {
  var objectives = objectivesFor(S.mode);
  var done = objectives.filter(function (o) { return S.objectives[o.id] && S.objectives[o.id].done; }).length;
  var total = objectives.length;
  var firstIncomplete = null;
  for (var i = 0; i < objectives.length; i++) { if (!(S.objectives[objectives[i].id] || {}).done) { firstIncomplete = objectives[i]; break; } }
  var progressHead =
    '<div class="dock-progress"><div class="row"><p class="t">Commissioning checklist</p>' +
    '<span class="n">' + done + '/' + total + '</span></div>' +
    '<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round((done / total) * 100) + '" aria-label="' + done + ' of ' + total + ' objectives complete"><div style="width:' + ((done / total) * 100) + '%"></div></div>' +
    (firstIncomplete
      ? '<button type="button" class="btn btn-sm btn-outline nextup" data-act="focus-obj" data-id="' + esc(firstIncomplete.id) + '" style="border:0;color:var(--orange);justify-content:flex-start;padding-left:0;">Next up: ' + esc(firstIncomplete.id) + ' ' + ic('chevron-down', 'sz-12') + '</button>'
      : '<p class="all-done">✓ All objectives complete — finish the review, then file for clearance.</p>') +
    '</div>';
  return '<aside aria-label="Commissioning checklist">' +
    '<div class="dock-mobile">' +
      '<button type="button" class="btn btn-outline dock-summary-btn" data-act="toggle-mobile-checklist" aria-expanded="' + (UI.mobileChecklist ? 'true' : 'false') + '">' +
        '<span class="lz-head" style="font-size:0.75rem;letter-spacing:0.08em;text-transform:uppercase;">Commissioning checklist · ' + done + '/' + total + '</span>' +
        '<span class="chev' + (UI.mobileChecklist ? ' up' : '') + '" style="display:inline-flex;">' + ic('chevron-down', 'sz-16') + '</span></button>' +
      (UI.mobileChecklist ? '<div style="margin-top:0.5rem;">' + objListHtml() + '</div>' : '') +
    '</div>' +
    '<div class="dock-desktop"><div class="dock-rail">' + progressHead +
      '<div class="dock-list-scroll lz-scroll">' + objListHtml() + '</div></div></div>' +
  '</aside>';
}

/* ── F-10 · Live landing-zone schematic (state-driven SVG) ─────────────── */
var SCH_ANCHORS = {
  internet: { x: 70, y: 150 },
  hq: { x: 845, y: 60 },
  spokes: { x: 845, y: 250 },
  public: { x: 470, y: 105 },
  private: { x: 470, y: 300 },
};
function schZoneOfRun(flowId, which) {
  switch (flowId) {
    case 'sim-web': return which === 'from' ? 'internet' : 'public';
    case 'sim-patch': return which === 'from' ? 'private' : 'internet';
    case 'sim-probe': return which === 'from' ? 'internet' : 'private';
    case 'sim-admin': return which === 'from' ? 'hq' : 'private';
    case 'sim-scan': return which === 'from' ? 'hq' : 'private';
    default: return 'internet';
  }
}
function viewSchematic() {
  var env = S.env;
  var mode = S.mode;
  var igw = env.gatewayPlan['flow-web-in'] === 'igw';
  var nat = env.gatewayPlan['flow-egress'] === 'nat';
  var vpn = env.gatewayPlan['flow-hq-vpn'] === 'vpngw';
  var direct = env.gatewayPlan['flow-dc-sync'] === 'direct';
  var transit = env.gatewayPlan['flow-spokes'] === 'transit';
  var cidr = env.vpc.cidr;
  var web = env.vpc.subnets.find(function (s) { return s.name.toLowerCase().includes('web'); });
  var db = env.vpc.subnets.find(function (s) { return /app|db/.test(s.name.toLowerCase()); });
  var cache = env.vpc.subnets.find(function (s) { return s.name.toLowerCase().includes('cache'); });
  var webLabel = web ? (web.name + ' · ' + web.cidr + (web.type === 'public' ? ' · PUBLIC' : ''))
    : (mode === 'hard' ? 'web · 10.200.1.0/24 · public' : 'web subnet — not created');
  var dbLabel = db ? (db.name + ' · ' + db.cidr + (db.type === 'public' ? ' · PUBLIC!' : ' · PRIVATE'))
    : (mode === 'hard' ? 'db · 10.200.2.0/24 · PUBLIC' : 'app/db subnet — not created');
  var cacheLabel = cache ? (cache.name + ' · ' + cache.cidr + ' · PRIVATE')
    : (mode === 'hard' ? 'cache · 10.200.3.0/24 · private' : '');
  var lastRun = env.packetRuns.length ? env.packetRuns[env.packetRuns.length - 1] : null;
  var from = lastRun ? (SCH_ANCHORS[schZoneOfRun(lastRun.flowId, 'from')] || SCH_ANCHORS.internet) : null;
  var to = lastRun ? (SCH_ANCHORS[schZoneOfRun(lastRun.flowId, 'to')] || SCH_ANCHORS.internet) : null;
  var runKey = lastRun ? String(lastRun.order) : 'none';
  var isNewRun = lastRun && UI.animatedRunKey !== runKey;
  var dotAt = isNewRun ? from : to;
  var verdictCls = lastRun ? (lastRun.result === 'allow' ? 'probe-verdict' : 'probe-verdict') : '';
  var verdictShow = lastRun && !isNewRun ? ' show' : '';
  var gateways = [
    { x: 290, label: 'IGW', on: igw, sub: 'flow-web-in' },
    { x: 380, label: 'NAT', on: nat, sub: 'flow-egress' },
    { x: 470, label: 'VPN GW', on: vpn, sub: 'flow-hq-vpn' },
    { x: 560, label: 'DX', on: direct, sub: 'flow-dc-sync' },
    { x: 620, label: 'TGW', on: transit, sub: 'flow-spokes' },
  ].map(function (g) {
    return '<g><rect x="' + (g.x - 30) + '" y="138" width="60" height="26" rx="4" fill="' + (g.on ? '#0f6e64' : '#efeadf') +
      '" stroke="' + (g.on ? '#0b584f' : '#d8d2c2') + '" stroke-width="1.5"></rect>' +
      '<text x="' + g.x + '" y="155" text-anchor="middle" font-size="10" font-weight="700" fill="' + (g.on ? '#ffffff' : '#55636b') + '">' + g.label + '</text>' +
      '<text x="' + g.x + '" y="178" text-anchor="middle" font-size="7.5" fill="#55636b">' + g.sub + '</text></g>';
  }).join('');
  var routeText = env.vpc.routeTarget === 'nat' ? 'NAT gateway'
    : env.vpc.routeTarget === 'igw' ? 'internet gateway'
    : (nat ? 'NAT gateway' : '— not set');
  var svg =
    '<svg viewBox="0 0 900 380" role="img" aria-label="Landing zone schematic showing VPC, subnets, gateways and the latest packet probe result">' +
    '<g><ellipse cx="70" cy="150" rx="52" ry="26" fill="#fffdf7" stroke="#1c2b33" stroke-width="1.5"></ellipse>' +
    '<text x="70" y="147" text-anchor="middle" font-size="11" font-weight="700" fill="#1c2b33">INTERNET</text>' +
    '<text x="70" y="160" text-anchor="middle" font-size="9" fill="#55636b">198.51.100.0/24</text></g>' +
    '<g><rect x="800" y="34" width="88" height="52" rx="4" fill="#fffdf7" stroke="#1c2b33" stroke-width="1.5"></rect>' +
    '<text x="844" y="55" text-anchor="middle" font-size="11" font-weight="700" fill="#1c2b33">HQ BRANCH</text>' +
    '<text x="844" y="70" text-anchor="middle" font-size="9" fill="#55636b">10.20.0.0/16</text></g>' +
    '<g><rect x="800" y="224" width="88" height="52" rx="4" fill="#fffdf7" stroke="#1c2b33" stroke-width="1.5" stroke-dasharray="' + (transit ? '0' : '4 3') + '"></rect>' +
    '<text x="844" y="245" text-anchor="middle" font-size="10" font-weight="700" fill="#1c2b33">SPOKE VPCs</text>' +
    '<text x="844" y="260" text-anchor="middle" font-size="9" fill="#55636b">2 × other VPCs</text></g>' +
    '<line x1="122" y1="150" x2="290" y2="150" stroke="#1c2b33" stroke-width="1.5" stroke-dasharray="' + (igw ? '0' : '5 4') + '" opacity="' + (igw ? 1 : 0.45) + '"></line>' +
    '<line x1="800" y1="70" x2="620" y2="70" stroke="#1c2b33" stroke-width="1.5" stroke-dasharray="' + (vpn ? '0' : '5 4') + '" opacity="' + (vpn ? 1 : 0.45) + '"></line>' +
    '<line x1="800" y1="250" x2="620" y2="250" stroke="#1c2b33" stroke-width="1.5" stroke-dasharray="' + (transit ? '0' : '5 4') + '" opacity="' + (transit ? 1 : 0.45) + '"></line>' +
    '<line x1="800" y1="80" x2="620" y2="80" stroke="#92400e" stroke-width="2" stroke-dasharray="' + (direct ? '0' : '5 4') + '" opacity="' + (direct ? 0.9 : 0.35) + '"></line>' +
    '<line x1="470" y1="164" x2="470" y2="124" stroke="#1c2b33" stroke-width="1.5" stroke-dasharray="' + (nat ? '0' : '5 4') + '" opacity="' + (nat ? 1 : 0.4) + '"></line>' +
    '<g aria-label="Gateway instruments">' + gateways + '</g>' +
    '<g><rect x="240" y="84" width="470" height="264" rx="8" fill="#fffdf7" fill-opacity="0.75" stroke="#0f6e64" stroke-width="2"></rect>' +
    '<text x="256" y="102" font-size="11" font-weight="800" fill="#0f6e64">VPC · LZ-MERIDIAN</text>' +
    '<text x="256" y="114" font-size="9" fill="#55636b">' + (cidr ? 'CIDR ' + esc(cidr) : 'CIDR — not reserved') + '</text>' +
    '<rect x="330" y="124" width="370" height="72" rx="4" fill="' + (web ? '#e7f3f0' : '#f4f1e8') + '" stroke="#0f6e64" stroke-width="1.5" stroke-dasharray="' + (web ? '0' : '4 3') + '"></rect>' +
    '<text x="344" y="144" font-size="10" font-weight="700" fill="#1c2b33">' + esc(webLabel) + '</text>' +
    '<text x="344" y="158" font-size="9" fill="#55636b">web tier 10.200.1.10 · reachable via IGW</text>' +
    '<rect x="330" y="276" width="370" height="72" rx="4" fill="' + (db ? '#e7f3f0' : '#f4f1e8') + '" stroke="#0f6e64" stroke-width="1.5" stroke-dasharray="' + (db ? '0' : '4 3') + '"></rect>' +
    '<text x="344" y="296" font-size="10" font-weight="700" fill="#1c2b33">' + esc(dbLabel) + '</text>' +
    '<text x="344" y="310" font-size="9" fill="#55636b">app VM 10.200.2.10 · egress only via NAT</text>' +
    (cacheLabel ? '<text x="344" y="324" font-size="9" fill="#55636b">' + esc(cacheLabel) + '</text>' : '') +
    '<rect x="256" y="210" width="140" height="44" rx="4" fill="#efeadf" stroke="#d8d2c2"></rect>' +
    '<text x="264" y="228" font-size="9" font-weight="700" fill="#1c2b33">ROUTE TABLE (private)</text>' +
    '<text x="264" y="243" font-size="9" fill="#55636b">0.0.0.0/0 → ' + esc(routeText) + '</text>' +
    '<rect x="640" y="210" width="58" height="44" rx="4" fill="#1c2b33"></rect>' +
    '<text x="669" y="229" text-anchor="middle" font-size="10" font-weight="800" fill="#f5f2ea">NSG</text>' +
    '<text x="669" y="243" text-anchor="middle" font-size="9" fill="#e8c9b8">' + env.nsgRules.length + ' rules</text></g>' +
    (lastRun && dotAt
      ? '<circle id="probe-dot" r="6" fill="' + (lastRun.result === 'allow' ? '#0f6e64' : '#b3261e') + '" cx="' + dotAt.x + '" cy="' + dotAt.y + '" opacity="1"></circle>' +
        '<text id="probe-verdict" class="' + verdictCls + verdictShow + '" x="' + (to ? to.x : 470) + '" y="' + ((to ? to.y : 300) - 26) +
        '" text-anchor="middle" font-size="11" font-weight="800" fill="' + (lastRun.result === 'allow' ? '#0f6e64' : '#b3261e') + '">' +
        (lastRun.result === 'allow' ? 'ALLOW ✓' : 'DENY ✕') + '</text>'
      : '') +
    '</svg>';
  return '<div class="schematic lz-blueprint">' +
    '<div class="sch-head"><p class="t">LZ-MERIDIAN · landing zone schematic (live)</p>' +
    '<p class="s">simplified engine · training data</p></div>' + svg +
    '<div class="sch-foot"><span>IGW ' + (igw ? '●' : '○') + ' · NAT ' + (nat ? '●' : '○') + ' · VPN ' + (vpn ? '●' : '○') +
    ' · DX ' + (direct ? '●' : '○') + ' · TGW ' + (transit ? '●' : '○') + ' — public subnet · private subnet</span></div></div>';
}

/* ── F-11 · Sorting deck ───────────────────────────────────────────────── */
var MODELS3 = ['SaaS', 'PaaS', 'IaaS'];
function viewWorkloadTrays() {
  var rows = shuffleKeyed('m1', M1_WORKLOADS);
  return toolCard('tool-m1', 'Workload sorting trays', 'Six incoming rows — drop each into its service model.', 'folder-tree',
    '<div class="stack" style="gap:0.5rem;">' + rows.map(function (w) {
      return '<div class="rowitem split"><p class="label-area" style="flex:1;">' + esc(w.label) + '</p>' +
        '<div role="radiogroup" aria-label="Service model for: ' + esc(w.label) + '" class="chip-row">' +
        MODELS3.map(function (m) {
          var sel = S.env.workloadAssign[w.id] === m;
          return '<button type="button" class="chip chip-' + m.toLowerCase() + '" aria-pressed="' + sel + '" data-act="set-workload" data-id="' + w.id + '" data-val="' + m + '">' + m + '</button>';
        }).join('') + '</div></div>';
    }).join('') + '</div>' +
    '<p class="pillar-note">M1 · discriminator: who patches the OS and the runtime?</p>');
}
function viewManifestTable() {
  var rows = shuffleKeyed('h1', H1_MANIFEST);
  return toolCard('tool-h1', 'Migration manifest — 10 rows', 'Exactly three rows are misfiled. Two are correct but suspicious — trust definitions.', 'folder-tree',
    '<div class="stack" style="gap:0.5rem;">' + rows.map(function (w) {
      var cur = S.env.manifestAssign[w.id] || w.seeded;
      var changed = cur !== w.seeded;
      return '<div class="rowitem split' + (changed ? ' changed' : '') + '"><p class="label-area" style="flex:1;">' + esc(w.label) + '</p>' +
        '<div style="display:flex;align-items:center;gap:0.5rem;">' +
        '<span class="filed-tag">filed: ' + w.seeded + '</span>' +
        '<select class="select w24 lz-mono" style="font-size:0.75rem;" aria-label="Service model for ' + esc(w.label) + '" data-act="set-manifest" data-id="' + w.id + '">' +
        MODELS3.map(function (m) { return '<option value="' + m + '"' + (cur === m ? ' selected' : '') + '>' + m + '</option>'; }).join('') +
        '</select></div></div>';
    }).join('') + '</div>' +
    '<p class="pillar-note">H1 · red herrings are live: two rows look wrong but are filed correctly.</p>');
}
function viewResponsibilityBoard() {
  var lane = S.mode === 'hard' ? 'PaaS lane (managed-runtime platform)' : 'IaaS lane (ERP VM fleet)';
  var rows = shuffleKeyed('resp', RESP_ITEMS);
  return toolCard('tool-resp', 'Shared-responsibility board', 'Place every operation on the correct side — ' + lane + '.', 'cpu',
    '<div class="stack" style="gap:0.5rem;">' + rows.map(function (i) {
      var val = S.env.respBoard[i.id];
      return '<div class="rowitem split"><p class="label-area" style="flex:1;">' + esc(i.label) + '</p>' +
        '<div role="radiogroup" aria-label="Who handles: ' + esc(i.label) + '" style="display:flex;gap:1rem;">' +
        ['provider', 'customer'].map(function (side) {
          var checked = val === side;
          var cls = checked ? (side === 'provider' ? 'radio-row checked-provider' : 'radio-row checked-customer') : 'radio-row';
          return '<label class="' + cls + '"><input type="radio" name="resp-' + i.id + '" value="' + side + '"' +
            (checked ? ' checked' : '') + ' data-act="set-resp" data-id="' + i.id + '" data-val="' + side + '" /> ' + side + '</label>';
        }).join('') + '</div></div>';
    }).join('') + '</div>' +
    '<p class="pillar-note">' + (S.mode === 'hard' ? 'H9' : 'M2') + ' · on PaaS, watch which two operations flip from IaaS.</p>');
}
function viewDeploymentMatch() {
  var rows = shuffleKeyed('dep', M3_SCENARIOS);
  return toolCard('tool-dep', 'Deployment-model matching', 'Four proposals — public, private, hybrid and community are all on the board.', 'arrow-down-to-line',
    '<div class="stack" style="gap:0.5rem;">' + rows.map(function (s) {
      var val = S.env.depMatch[s.id];
      return '<div class="rowitem split"><p class="label-area" style="flex:1;">' + esc(s.label) + '</p>' +
        '<div role="radiogroup" aria-label="Deployment model for: ' + esc(s.label) + '" class="chip-row">' +
        M3_MODELS.map(function (m) {
          return '<button type="button" class="chip" aria-pressed="' + (val === m.id) + '" data-act="set-dep" data-id="' + s.id + '" data-val="' + m.id + '">' + esc(m.label) + '</button>';
        }).join('') + '</div></div>';
    }).join('') + '</div>' +
    '<p class="pillar-note">M3 · ownership + audience words telegraph the answer.</p>');
}
function viewNfvBoard() {
  var source = S.mode === 'hard' ? H6_FUNCTIONS : M4_APPLIANCES;
  var items = shuffleKeyed('nfv', source);
  return toolCard('tool-nfv', 'NFV placement board', 'Virtualize into VNFs — or keep physical, with a defensible reason.', 'cpu',
    '<div class="stack" style="gap:0.5rem;">' + items.map(function (a) {
      var val = S.env.nfvBoard[a.id];
      var needReason = S.mode === 'hard' && a.answer === 'physical';
      return '<div class="rowitem" style="gap:0.5rem;">' +
        '<div class="rowitem split" style="border:0;padding:0;background:transparent;"><p class="label-area" style="flex:1;">' + esc(a.label) + '</p>' +
        '<div role="radiogroup" aria-label="Placement for: ' + esc(a.label) + '" class="chip-row">' +
        ['virtualize', 'physical'].map(function (opt) {
          return '<button type="button" class="chip chip-' + opt + '" aria-pressed="' + (val === opt) + '" data-act="set-nfv" data-id="' + a.id + '" data-val="' + opt + '">' + opt + '</button>';
        }).join('') + '</div></div>' +
        (needReason
          ? '<div style="display:flex;align-items:center;gap:0.5rem;">' +
            '<span class="filed-tag">reason:</span>' +
            '<select class="select w80" style="font-size:0.75rem;" aria-label="Justification for keeping ' + esc(a.label) + ' physical" data-act="set-nfv-reason" data-id="' + a.id + '">' +
            '<option value="" disabled' + (S.env.nfvReasons[a.id] ? '' : ' selected') + '>Pick the defensible reason…</option>' +
            H6_REASON_BANK.map(function (r) {
              return '<option value="' + r.id + '"' + (S.env.nfvReasons[a.id] === r.id ? ' selected' : '') + '>' + esc(r.label) + '</option>';
            }).join('') + '</select></div>'
          : '') +
        '</div>';
    }).join('') + '</div>' +
    '<p class="pillar-note">' + (S.mode === 'hard' ? 'H6' : 'M4') + ' · “software is slow” is not a reason on this board.</p>');
}
function viewConceptSort() {
  var buckets = ['multitenancy', 'elasticity', 'scalability'];
  var rows = shuffleKeyed('m11', M11_STATEMENTS);
  return toolCard('tool-concept', 'Concept sort: multitenancy · elasticity · scalability', 'Six statements, three buckets, two each.', 'folder-tree',
    '<div class="stack" style="gap:0.5rem;">' + rows.map(function (s) {
      var val = S.env.conceptSort[s.id];
      return '<div class="rowitem split"><p class="label-area" style="flex:1;">' + esc(s.label) + '</p>' +
        '<div role="radiogroup" aria-label="Concept for: ' + esc(s.label) + '" class="chip-row">' +
        buckets.map(function (b) {
          return '<button type="button" class="chip" aria-pressed="' + (val === b) + '" data-act="set-concept" data-id="' + s.id + '" data-val="' + b + '">' + b + '</button>';
        }).join('') + '</div></div>';
    }).join('') + '</div>' +
    '<p class="pillar-note">M11 · one scalability pair is vertical, one horizontal — both count as scalability.</p>');
}
function viewSortingDeck() {
  var medium = S.mode === 'medium';
  return '<div class="stack">' +
    '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:0.5rem;">' + pillarBadge('P1') + pillarBadge('P2') +
    '<span class="filed-tag" style="font-size:0.6875rem;">classification panels · click to assign</span></div>' +
    (medium
      ? viewWorkloadTrays() + viewResponsibilityBoard() + viewDeploymentMatch() + viewNfvBoard() + viewConceptSort()
      : viewManifestTable() + viewResponsibilityBoard() + viewNfvBoard()) +
    '</div>';
}

/* ── F-12 · Subnet & route bench ───────────────────────────────────────── */
function viewSubnetBench() {
  var medium = S.mode === 'medium';
  var subnets = S.env.vpc.subnets;
  var cidrPicker = '<div class="stack" style="gap:0.5rem;" role="radiogroup" aria-label="VPC CIDR block">' +
    '<span class="label" style="font-size:0.875rem;">VPC address block</span>' +
    M5_CIDR_OPTIONS.map(function (o) {
      var sel = S.env.vpc.cidr === o.label;
      return '<button type="button" class="cidr-option' + (sel ? ' sel' : '') + '" aria-pressed="' + sel + '" data-act="set-cidr" data-val="' + esc(o.label) + '">' +
        '<span class="cidr">' + esc(o.label) + '</span><span class="note">' + esc(o.note) + '</span></button>';
    }).join('') + '</div>';
  var subnetRows = subnets.map(function (s, i) {
    return '<div class="subnet-row">' +
      '<div><label class="label" for="sn-name-' + esc(s.id) + '">Name</label>' +
      '<input class="input lz-mono" id="sn-name-' + esc(s.id) + '" value="' + esc(s.name) + '" placeholder="e.g. web" data-env-input="subnet" data-idx="' + i + '" data-field="name" /></div>' +
      '<div><label class="label" for="sn-cidr-' + esc(s.id) + '">CIDR</label>' +
      '<input class="input lz-mono" id="sn-cidr-' + esc(s.id) + '" value="' + esc(s.cidr) + '" placeholder="10.200.x.0/24" data-env-input="subnet" data-idx="' + i + '" data-field="cidr" /></div>' +
      '<div><label class="label">Exposure</label>' +
      '<select class="select" aria-label="Exposure for ' + esc(s.name || 'subnet') + '" data-act="set-subnet-type" data-idx="' + i + '">' +
      '<option value="public"' + (s.type === 'public' ? ' selected' : '') + '>public</option>' +
      '<option value="private"' + (s.type === 'private' ? ' selected' : '') + '>private</option></select></div></div>';
  }).join('');
  var addBtn = (medium && subnets.length < 2)
    ? '<button type="button" class="btn btn-outline" style="width:100%;" data-act="add-subnet">+ Add subnet (' + subnets.length + '/2)</button>'
    : '';
  var routeTarget = !medium
    ? '<div class="route-box"><span class="title">' + ic('route', 'sz-16 amber-ico') + ' Private route table · 0.0.0.0/0 →</span>' +
      '<select class="select w80" aria-label="Default route target for the private subnet" data-act="set-route-target">' +
      '<option value="" disabled' + (S.env.vpc.routeTarget ? '' : ' selected') + '>Pick the target…</option>' +
      '<option value="nat"' + (S.env.vpc.routeTarget === 'nat' ? ' selected' : '') + '>NAT gateway (outbound-only egress)</option>' +
      '<option value="igw"' + (S.env.vpc.routeTarget === 'igw' ? ' selected' : '') + '>Internet gateway (bidirectional)</option></select>' +
      '<p class="why">Where the private subnet’s default route points decides whether it is reachable from the internet.</p></div>'
    : '';
  return '<div class="stack"><section class="card" id="tool-subnets" data-tool="tool-subnets"><div class="card-pad">' +
    '<div class="toolcard-head"><span class="ico">' + ic('grid-3x3', 'sz-20') + '</span><div>' +
    '<h3>' + (medium ? 'VPC commissioning form' : 'VPC design audit — fix the flaws') + '</h3>' +
    '<p>' + (medium
      ? 'M5 · reserve a non-colliding CIDR, then carve the public web subnet and the private app/db subnet.'
      : 'H2 · the proposal carries exactly three flaws. Jump host and NTP in the public subnet are intentional — leave them.') +
    '</p></div></div>' +
    cidrPicker +
    '<div class="stack" style="gap:0.5rem;"><span class="label" style="font-size:0.875rem;">Subnets</span>' + subnetRows + addBtn + '</div>' +
    routeTarget +
    '</div></section></div>';
}

/* ── F-13 · Gateway wiring bench ───────────────────────────────────────── */
function viewGatewayBench() {
  var flows = S.mode === 'hard' ? GATEWAY_FLOWS : GATEWAY_FLOWS.slice(0, 4);
  var flowRows = flows.map(function (f) {
    var val = S.env.gatewayPlan[f.id] || '';
    return '<div class="rowitem split"><p class="label-area" style="flex:1;">' + esc(f.label) + '</p>' +
      '<select class="select w72" style="font-size:0.75rem;" aria-label="Gateway for: ' + esc(f.label) + '" data-act="set-gateway" data-flow="' + f.id + '">' +
      '<option value="" disabled' + (val ? '' : ' selected') + '>Wire a gateway…</option>' +
      GATEWAY_BANK.map(function (g) {
        return '<option value="' + g.id + '"' + (val === g.id ? ' selected' : '') + '>' + esc(g.label) + '</option>';
      }).join('') + '</select></div>';
  }).join('');
  var seq = '';
  if (S.mode === 'hard') {
    var remaining = SEQ_STEPS.filter(function (s) { return S.env.seqOrder.indexOf(s.id) === -1; });
    seq = '<section class="card"><div class="card-pad">' +
      '<div class="toolcard-head"><span class="ico">' + ic('list-ordered', 'sz-20') + '</span><div>' +
      '<h3>Commissioning sequence</h3><p>Click the five steps in the order the crew must execute them.</p></div></div>' +
      '<div class="seq-chips">' + remaining.map(function (s) {
        return '<button type="button" class="btn btn-sm btn-outline" data-act="seq-add" data-step="' + s.id + '">+ ' + esc(s.label) + '</button>';
      }).join('') + '</div>' +
      '<ol class="seq-list" aria-label="Commissioning order chosen" style="margin-top:0.75rem;">' +
      S.env.seqOrder.map(function (id, i) {
        var step = SEQ_STEPS.find(function (s) { return s.id === id; });
        return '<li><span class="num">' + (i + 1) + '.</span><span class="lbl">' + esc(step ? step.label : id) + '</span>' +
          '<button type="button" class="btn-icon danger" data-act="seq-remove" data-step="' + esc(id) + '" aria-label="Remove step ' + (i + 1) + '">' + ic('x', 'sz-16') + '</button></li>';
      }).join('') +
      (S.env.seqOrder.length === 0 ? '<li class="seq-empty" style="border:0;background:transparent;padding:0;">No steps placed yet.</li>' : '') +
      '</ol></div></section>';
  }
  return '<div class="stack"><section class="card" id="tool-gateways" data-tool="tool-gateways"><div class="card-pad">' +
    '<div class="toolcard-head"><span class="ico">' + ic('door-open', 'sz-20') + '</span><div>' +
    '<h3>Gateway wiring board</h3>' +
    '<p>' + (S.mode === 'hard' ? 'H5 · all five flows — one bank entry is a decoy.' : 'M6 · four flows, two decoy doors on the bench.') + '</p>' +
    '</div></div><div class="stack" style="gap:0.5rem;">' + flowRows + '</div></div></section>' + seq + '</div>';
}

/* ── F-14 · Screening bench (NSG + packet simulator) ───────────────────── */
function viewScreeningBench() {
  var sorted = S.env.nsgRules.slice().sort(function (a, b) { return a.priority - b.priority; });
  var lastRun = S.env.packetRuns.length ? S.env.packetRuns[S.env.packetRuns.length - 1] : null;
  var draft = UI.ruleDraft;

  var rows = sorted.map(function (r) {
    return '<tr' + (r.action === 'deny' ? ' class="deny-row"' : '') + '>' +
      '<td style="font-weight:700;">' + r.priority + '</td>' +
      '<td>' + (r.direction === 'in' ? 'in' : 'out') + '</td>' +
      '<td><span class="' + (r.action === 'allow' ? 'act-allow' : 'act-deny') + '">' + r.action + '</span></td>' +
      '<td>' + r.protocol + '/' + r.port + '</td>' +
      '<td>' + esc(r.source) + '</td>' +
      '<td class="tag-cell">' + esc(r.tag) + '</td>' +
      '<td class="row-actions">' +
        '<button type="button" class="btn-icon" data-act="rule-edit" data-id="' + esc(r.id) + '" aria-label="Edit rule ' + esc(r.tag) + ' priority ' + r.priority + '">' + ic('pencil', 'sz-16') + '</button>' +
        '<button type="button" class="btn-icon danger" data-act="rule-del" data-id="' + esc(r.id) + '" aria-label="Delete rule ' + esc(r.tag) + ' priority ' + r.priority + '">' + ic('trash-2', 'sz-16') + '</button>' +
      '</td></tr>';
  }).join('');

  var editor = '';
  if (draft) {
    editor = '<div class="rule-editor" role="form" aria-label="NSG rule editor">' +
      '<div class="head"><p class="t">' + (draft.id ? 'Edit rule' : 'Author new rule') + '</p>' +
      '<button type="button" class="btn-icon" data-act="rule-close" aria-label="Close rule editor">' + ic('x', 'sz-16') + '</button></div>' +
      '<div class="rule-grid">' +
        '<div><label class="label" for="re-pri">Priority</label><input class="input lz-mono" id="re-pri" inputmode="numeric" value="' + esc(draft.priority) + '" placeholder="100" data-draft="priority" /></div>' +
        '<div><label class="label" for="re-dir">Direction</label><select class="select" id="re-dir" data-draft="direction">' +
          '<option value="in"' + (draft.direction === 'in' ? ' selected' : '') + '>in</option>' +
          '<option value="out"' + (draft.direction === 'out' ? ' selected' : '') + '>out</option></select></div>' +
        '<div><label class="label" for="re-act">Action</label><select class="select" id="re-act" data-draft="action">' +
          '<option value="allow"' + (draft.action === 'allow' ? ' selected' : '') + '>allow</option>' +
          '<option value="deny"' + (draft.action === 'deny' ? ' selected' : '') + '>deny</option></select></div>' +
        '<div><label class="label" for="re-pro">Protocol</label><select class="select" id="re-pro" data-draft="protocol">' +
          '<option value="TCP"' + (draft.protocol === 'TCP' ? ' selected' : '') + '>TCP</option>' +
          '<option value="UDP"' + (draft.protocol === 'UDP' ? ' selected' : '') + '>UDP</option></select></div>' +
        '<div><label class="label" for="re-port">Port</label><input class="input lz-mono" id="re-port" inputmode="numeric" value="' + esc(draft.port) + '" placeholder="443" data-draft="port" /></div>' +
        '<div><label class="label" for="re-src">Source CIDR</label><input class="input lz-mono" id="re-src" value="' + esc(draft.source) + '" placeholder="0.0.0.0/0" data-draft="source" /></div>' +
        '<div><label class="label" for="re-tag">Tag</label><input class="input" id="re-tag" value="' + esc(draft.tag) + '" placeholder="WEB" data-draft="tag" /></div>' +
      '</div>' +
      (UI.ruleError ? '<p class="rule-err" role="alert">' + esc(UI.ruleError) + '</p>' : '') +
      '<div class="btn-row"><button type="button" class="btn btn-sm btn-teal" data-act="rule-save">Save rule</button>' +
      '<button type="button" class="btn btn-sm btn-outline" data-act="rule-close">Cancel</button></div></div>';
  }

  var probeButtons = PROBE_PRESETS.map(function (p) {
    return '<button type="button" class="btn btn-sm btn-outline" data-act="probe" data-id="' + p.id + '" title="' + esc(p.note) + '">▶ ' + esc(p.label) + '</button>';
  }).join('');
  var probeResult = lastRun
    ? '<div class="verdict-card ' + lastRun.result + '"><div style="display:flex;align-items:center;gap:0.5rem;">' + verdictBadge(lastRun.result) +
      '<span class="flow-name">' + esc((PROBE_PRESETS.find(function (p) { return p.id === lastRun.flowId; }) || {}).label || '') + '</span></div>' +
      '<p class="reason">' + esc(lastRun.reason) + '</p>' +
      (lastRun.matchedRule ? '<p class="matched">matched: ' + esc(lastRun.matchedRule) + '</p>' : '') + '</div>'
    : '<p style="font-size:0.875rem;color:var(--muted-fg);">No probes fired yet. Try the outbound patch pull and the unsolicited inbound probe back-to-back — that pair is the statefulness lesson.</p>';
  var history = '';
  if (S.env.packetRuns.length > 0) {
    history = '<div class="run-history lz-scroll"><p class="cap">Run history (this session&apos;s engine is what the runbook checks)</p><ul>' +
      S.env.packetRuns.slice(-6).reverse().map(function (r) {
        return '<li><span style="color:var(--muted-fg);">#' + r.order + '</span>' + verdictBadge(r.result) +
          '<span>' + esc((PROBE_PRESETS.find(function (p) { return p.id === r.flowId; }) || {}).label || '') + '</span></li>';
      }).join('') + '</ul></div>';
  }

  var m9 = '';
  if (S.mode === 'medium') {
    m9 = '<section class="card" id="tool-m9" data-tool="tool-m9"><div class="card-pad">' +
      '<h3 style="font-weight:600;">M9 · Record the proof</h3>' +
      '<p style="font-size:0.75rem;color:var(--muted-fg);margin-top:0.25rem;">Run both probes above first — then record what you observed and why.</p>' +
      '<div class="m9-grid" style="margin-top:0.75rem;">' +
        '<div><label class="label" for="m9-out">Outbound patch pull (private VM → mirror :443)</label>' +
        '<select class="select" id="m9-out" data-act="set-m9" data-field="outboundVerdict">' +
        '<option value="" disabled' + (S.env.m9.outboundVerdict ? '' : ' selected') + '>Observed verdict…</option>' +
        M9_VERDICT_OPTIONS.map(function (o) { return '<option value="' + o.id + '"' + (S.env.m9.outboundVerdict === o.id ? ' selected' : '') + '>' + esc(o.label) + '</option>'; }).join('') +
        '</select></div>' +
        '<div><label class="label" for="m9-probe">Unsolicited probe (mirror ⇢ private VM :443)</label>' +
        '<select class="select" id="m9-probe" data-act="set-m9" data-field="probeVerdict">' +
        '<option value="" disabled' + (S.env.m9.probeVerdict ? '' : ' selected') + '>Observed verdict…</option>' +
        M9_VERDICT_OPTIONS.map(function (o) { return '<option value="' + o.id + '"' + (S.env.m9.probeVerdict === o.id ? ' selected' : '') + '>' + esc(o.label) + '</option>'; }).join('') +
        '</select></div>' +
        '<div><label class="label" for="m9-reason">Why did the probe fail?</label>' +
        '<select class="select" id="m9-reason" data-act="set-m9" data-field="reasonKey">' +
        '<option value="" disabled' + (S.env.m9.reasonKey ? '' : ' selected') + '>Pick the true reason…</option>' +
        M9_REASON_OPTIONS.map(function (o) { return '<option value="' + o.id + '"' + (S.env.m9.reasonKey === o.id ? ' selected' : '') + '>' + esc(o.label) + '</option>'; }).join('') +
        '</select></div>' +
        '<div><label class="label" for="m9-nsl">If this subnet used a stateless security LIST instead…</label>' +
        '<select class="select" id="m9-nsl" data-act="set-m9" data-field="nslKey">' +
        '<option value="" disabled' + (S.env.m9.nslKey ? '' : ' selected') + '>What extra config is needed?</option>' +
        M9_NSL_OPTIONS.map(function (o) { return '<option value="' + o.id + '"' + (S.env.m9.nslKey === o.id ? ' selected' : '') + '>' + esc(o.label) + '</option>'; }).join('') +
        '</select></div>' +
      '</div></div></section>';
  }

  return '<div class="stack">' +
    '<section class="card" id="tool-screening" data-tool="tool-screening"><div class="card-pad">' +
      '<div style="display:flex;flex-wrap:wrap;align-items:flex-start;justify-content:space-between;gap:0.5rem;">' +
        '<div class="toolcard-head" style="margin-bottom:0;"><span class="ico">' + ic('shield-plus', 'sz-20') + '</span><div>' +
        '<h3>Screening table — NSG rules</h3><p>First match wins, lowest priority number first. Edit, delete, or author new rules.</p></div></div>' +
        '<button type="button" class="btn btn-sm btn-dark" data-act="rule-new">' + ic('plus', 'sz-16') + ' New rule</button></div>' +
      '<div class="tbl-wrap" style="margin-top:0.75rem;"><table class="nsg" aria-label="NSG rule table ordered by priority">' +
        '<thead><tr><th>PRI</th><th>DIR</th><th>ACTION</th><th>PROTO/PORT</th><th>SOURCE</th><th>TAG</th><th style="text-align:right;">CREW ACTIONS</th></tr></thead>' +
        '<tbody>' + rows + '</tbody></table></div>' + editor +
    '</div></section>' +
    '<section class="card"><div class="card-pad">' +
      '<div class="toolcard-head"><span class="ico">' + ic('crosshair', 'sz-20') + '</span><div>' +
      '<h3>Packet flight probe</h3><p>Fires a synthetic flow through the real route + rule engine (simplified cloud-NSG semantics).</p></div></div>' +
      '<div class="probe-buttons">' + probeButtons + '</div>' +
      '<div aria-live="polite" class="probe-result" style="margin-top:0.75rem;">' + probeResult + '</div>' + history +
    '</div></section>' + m9 + '</div>';
}

/* ── F-16 · Decision desk ──────────────────────────────────────────────── */
function viewDecisionDesk() {
  var flows = S.mode === 'hard' ? H8_FLOWS : M10_FLOWS;
  var connRows = flows.map(function (f) {
    var c = S.env.connChoice[f.id] || { choice: null, factor: null };
    return '<div class="conn-flow"><p class="flow-label">' + esc(f.label) + '</p>' +
      '<div class="conn-grid"><div role="radiogroup" aria-label="Option for: ' + esc(f.label) + '" class="chip-row">' +
        '<button type="button" class="chip" style="flex:1;' + (c.choice === 'vpn' ? 'background:var(--ink);color:#fff;border-color:var(--ink);' : '') + '" aria-pressed="' + (c.choice === 'vpn') + '" data-act="set-conn-choice" data-flow="' + f.id + '" data-val="vpn">Site-to-site VPN</button>' +
        '<button type="button" class="chip chip-direct" style="flex:1;" aria-pressed="' + (c.choice === 'direct') + '" data-act="set-conn-choice" data-flow="' + f.id + '" data-val="direct">Direct Connect</button></div>' +
      '<select class="select" style="font-size:0.75rem;min-height:44px;" aria-label="Deciding factor for: ' + esc(f.label) + '" data-act="set-conn-factor" data-flow="' + f.id + '">' +
        '<option value="" disabled' + (c.factor ? '' : ' selected') + '>Deciding factor…</option>' +
        FACTOR_BANK.map(function (b) { return '<option value="' + b.id + '"' + (c.factor === b.id ? ' selected' : '') + '>' + esc(b.label) + '</option>'; }).join('') +
      '</select></div></div>';
  }).join('');
  var trap = '';
  if (S.mode === 'hard') {
    trap = '<div class="trap-box"><p class="q">⚠ Sign-off trap: which option is NOT encrypted by default?</p>' +
      '<div role="radiogroup" aria-label="Which option is not encrypted by default" class="chip-row">' +
      [{ id: 'vpn', label: 'Site-to-site VPN (IPsec)' }, { id: 'direct', label: 'Direct Connect (private circuit)' }].map(function (o) {
        return '<button type="button" class="chip chip-trap" aria-pressed="' + (S.env.notEncrypted === o.id) + '" data-act="set-not-encrypted" data-val="' + o.id + '">' + esc(o.label) + '</button>';
      }).join('') + '</div>' +
      '<p class="hint">A private path gives privacy, not confidentiality. Think about what has to be layered on top before sign-off.</p></div>';
  }
  var connCard = toolCard('tool-conn', 'Connectivity procurement matrix',
    S.mode === 'hard' ? 'H8 · four flows, one factor bank, one decoy — and the encryption trap below.' : 'M10 · pick the option AND the deciding factor for each flow.',
    'scale', '<div class="stack" style="gap:0.75rem;">' + connRows + '</div>' + trap);

  var triage = '';
  if (S.mode === 'medium') {
    triage = toolCard('tool-triage', 'Flow-log triage · monitoring collector outage',
      'M12 · the collector (10.20.7.20) cannot reach the app VM on 8443.', 'scroll-text',
      '<div class="flowlog" aria-label="Flow log excerpt (synthetic)">' +
      M12_FLOWLOG.map(function (l) { return '<div>' + esc(l.line) + '</div>'; }).join('') + '</div>' +
      '<div style="margin-top:0.75rem;"><label class="label" for="m12-cause">True cause</label>' +
      '<select class="select" id="m12-cause" data-act="set-triage" data-field="cause">' +
      '<option value="" disabled' + (S.env.flowTriage.cause ? '' : ' selected') + '>Read the MATCHED-RULE column…</option>' +
      M12_CAUSE_OPTIONS.map(function (o) { return '<option value="' + o.id + '"' + (S.env.flowTriage.cause === o.id ? ' selected' : '') + '>' + esc(o.label) + '</option>'; }).join('') +
      '</select></div>' +
      '<div class="triage-grid" style="margin-top:0.5rem;">' +
      '<div><label class="label" for="m12-port">Fix: destination port</label>' +
      '<input class="input lz-mono" id="m12-port" inputmode="numeric" value="' + esc(S.env.flowTriage.fixPort || '') + '" placeholder="8443" data-env-input="triage" data-field="fixPort" /></div>' +
      '<div><label class="label" for="m12-pri">Fix: rule priority (must beat the deny)</label>' +
      '<input class="input lz-mono" id="m12-pri" inputmode="numeric" value="' + esc(S.env.flowTriage.fixPriority || '') + '" placeholder="e.g. 90" data-env-input="triage" data-field="fixPriority" /></div></div>' +
      '<p class="pillar-note">Minimal fix = an inbound allow that matches the collector’s own flow — evaluated before the stale deny.</p>');
  }
  var h7 = '';
  if (S.mode === 'hard') {
    h7 = '<section class="card" id="tool-h7" data-tool="tool-h7"><div class="card-pad">' +
      '<div class="toolcard-head"><span class="ico">' + ic('messages-square', 'sz-20') + '</span><div>' +
      '<h3>H7 · final question — the probe still fails</h3>' +
      '<p>After your fix works (patch pull = ALLOW), the unsolicited inbound probe STILL gets DENY. Why?</p></div></div>' +
      '<div role="radiogroup" aria-label="Why does the unsolicited probe still fail">' +
      H7_OPTIONS.map(function (o) {
        return '<button type="button" class="option-card' + (S.env.h7Answer === o.id ? ' sel' : '') + '" aria-pressed="' + (S.env.h7Answer === o.id) + '" data-act="set-h7" data-val="' + o.id + '">' + esc(o.label) + '</button>';
      }).join('') + '</div>' +
      '<p class="pillar-note">Sequence is checked by the runbook: capture DENY → wire NAT → prove ALLOW → answer this.</p>' +
      '</div></section>';
  }
  return '<div class="stack">' + connCard + (S.mode === 'medium' ? triage : '') + (S.mode === 'hard' ? h7 : '') + '</div>';
}

/* ── F-8 · Floor wrapper (dock + schematic + tool tabs) ────────────────── */
var FLOOR_TABS = [
  { key: 'sorting', label: 'Sorting deck', icon: 'folder-tree' },
  { key: 'subnets', label: 'Subnets & routes', icon: 'grid-3x3' },
  { key: 'gateways', label: 'Gateway bench', icon: 'door-open' },
  { key: 'screening', label: 'Screening bench', icon: 'shield-plus' },
  { key: 'decisions', label: 'Decision desk', icon: 'scale' },
];
function viewFloor() {
  var objectives = objectivesFor(S.mode);
  var doneCount = objectives.filter(function (o) { return S.objectives[o.id] && S.objectives[o.id].done; }).length;
  var allDone = doneCount === objectives.length;
  var tabs = FLOOR_TABS.map(function (t) {
    return '<button type="button" class="tab" role="tab" aria-selected="' + (UI.activeTool === t.key) + '" data-act="tool" data-tool="' + t.key + '">' +
      ic(t.icon, 'sz-14') + ' ' + esc(t.label) + '</button>';
  }).join('');
  var panels = {
    sorting: viewSortingDeck(),
    subnets: viewSubnetBench(),
    gateways: viewGatewayBench(),
    screening: viewScreeningBench(),
    decisions: viewDecisionDesk(),
  };
  var panelHtml = FLOOR_TABS.map(function (t) {
    return '<div class="tabpanel" role="tabpanel"' + (UI.activeTool === t.key ? '' : ' hidden') + '>' + panels[t.key] + '</div>';
  }).join('');
  var nextPhase = allDone
    ? '<div class="section-cta"><button type="button" class="btn btn-lg btn-dark" data-act="goto" data-phase="review">Proceed to certification review ' + ic('arrow-right', 'sz-16') + '</button></div>'
    : '';
  return '<div class="wrap-floor" id="rack-anchor" style="scroll-margin-top:6rem;">' +
    '<div class="floor-grid">' +
      viewChecklistDock() +
      '<div class="stack">' +
        viewSchematic() +
        '<div><div class="tabs-list" role="tablist" aria-label="Instrument rack">' + tabs + '</div>' + panelHtml + '</div>' +
        nextPhase +
      '</div>' +
    '</div></div>';
}



