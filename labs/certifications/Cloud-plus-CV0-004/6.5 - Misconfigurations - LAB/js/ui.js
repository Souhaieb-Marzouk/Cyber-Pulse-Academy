// ─── Ledgerline · UI rendering (template functions) ─────────────────────────
// Static port of the React component tree. Every screen is a pure template
// function returning HTML; app.js wires events via delegation.
// Content, wording, class structure (translated to the CSS above) and
// interaction semantics mirror the original 1:1.
'use strict';

// ── helpers ─────────────────────────────────────────────────────────────────
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const PILLAR_LABEL = { P1: 'Understand', P2: 'Recognize', P3: 'Detect', P4: 'Mitigate' };
const PILLAR_LABEL_FULL = { P1: 'Understand', P2: 'Recognize & analyze', P3: 'Detect', P4: 'Mitigate' };
const SCRAMBLED_ORDER = ['s3', 's5', 's1', 's4', 's2'];

function sevClass(sev) {
  return sev === 'critical' ? 'sev-critical' : sev === 'high' ? 'sev-high'
    : sev === 'medium' ? 'sev-medium' : sev === 'low' ? 'sev-low' : 'sev-info';
}

// ── posture gauge (SVG, animated like the original framer-motion circle) ───
function gaugeHtml(score, mode, ran, size, gaugeId) {
  var stroke = 8;
  var r = (size - stroke) / 2;
  var c = 2 * Math.PI * r;
  var pct = ran ? Math.max(0, Math.min(100, score)) : 0;
  var color = !ran ? '#8AA6A0' : pct >= 95 ? '#0E7A5F' : pct >= 60 ? '#B45309' : '#B42318';
  var track = mode === 'hard' ? '#223036' : '#EAE6DA';
  var label = ran ? 'Posture score ' + score + ' of 100' : 'Posture score — run a scan';
  return '<div class="gauge" style="width:' + size + 'px;height:' + size + 'px" role="img" aria-label="' + esc(label) + '">' +
    '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" data-gauge-id="' + gaugeId + '" data-c="' + c + '" data-pct="' + pct + '">' +
    '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke-width="' + stroke + '" stroke="' + track + '"></circle>' +
    '<circle class="gauge-circle" cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none' +
    '" stroke-width="' + stroke + '" stroke-linecap="round" stroke="' + color + '" stroke-dasharray="' + c + '" stroke-dashoffset="' + c + '"></circle>' +
    '</svg>' +
    '<div class="gauge-center">' +
    '<span class="gauge-value" style="font-size:' + (size * 0.26) + 'px">' + (ran ? score : '—') + '</span>' +
    '<span class="gauge-label">posture</span>' +
    '</div></div>';
}

// ── switch ──────────────────────────────────────────────────────────────────
function switchHtml(checked, fid, label, action, extra) {
  return '<button type="button" role="switch" aria-checked="' + (checked ? 'true' : 'false') + '"' +
    ' class="switch" data-fid="' + esc(fid) + '" aria-label="' + esc(label) + '" data-action="' + action + '"' + (extra || '') + '>' +
    '<span class="knob"></span></button>';
}

// ── select ──────────────────────────────────────────────────────────────────
function selectHtml(options, value, fid, label, attrs) {
  var opts = '<option value="" disabled' + (value ? '' : ' selected') + '>Choose…</option>';
  options.forEach(function (o) {
    opts += '<option value="' + esc(o.value) + '"' + (value === o.value ? ' selected' : '') + '>' + esc(o.label) + '</option>';
  });
  return '<span class="select"><select data-fid="' + esc(fid) + '" aria-label="' + esc(label) + '" ' + (attrs || '') + '>' + opts + '</select></span>';
}

// ═══ MODE SELECT ═════════════════════════════════════════════════════════════
function renderModeSelect(anim) {
  var cards = MODE_CARDS.map(function (m, i) {
    var iconColor = m.id === 'hard' ? 'color:#3FC79A' : 'color:#0E7A5F';
    var points = m.points.map(function (p) {
      return '<li>' + iconSvg('shield-check', 'icon ic-4') + '<span>' + esc(p) + '</span></li>';
    }).join('');
    return '<button type="button" role="radio" aria-checked="false" aria-label="' + esc(m.name + ' — ' + m.blurb) + '"' +
      ' data-action="SET_MODE" data-mode="' + m.id + '"' +
      ' class="mode-card ' + m.card + (anim.has('mode:' + i) ? ' anim-fade-up' : '') + '"' +
      (anim.has('mode:' + i) ? ' style="animation-delay:' + (0.08 * i) + 's"' : '') + '>' +
      '<div class="mode-card-head"><span class="mode-tag ' + m.id + '">' + esc(m.tag) + '</span>' +
      '<span style="' + iconColor + '">' + iconSvg(m.icon, 'icon ic-6') + '</span></div>' +
      '<h2 class="mode-name">' + esc(m.name) + '</h2>' +
      '<p class="mode-blurb">' + esc(m.blurb) + '</p>' +
      '<ul class="mode-points">' + points + '</ul>' +
      '<span class="mode-cta ' + m.id + '">Enter ' + esc(m.name) + '</span>' +
      '</button>';
  }).join('');
  return '<div class="screen-center"><div class="screen-center-inner' + (anim.has('mode:wrap') ? ' anim-fade-up' : '') + '">' +
    '<div class="brand-row"><div class="brand-tile">LL</div><div>' +
    '<p class="brand-kicker">Ledgerline · Posture Workbench</p>' +
    '<h1 class="brand-title">Cloud+ CV0-004 · Lesson 6.5 — Misconfigurations</h1></div></div>' +
    '<p class="screen-lede">Identify and fix misconfigurations in cloud setups — the final objective of the Cloud+ exam, practiced on a fully simulated estate: object storage, identity, network, compute, data and account guardrails. All data is synthetic training material; nothing here is a real cloud account.</p>' +
    '<div class="mode-grid" role="radiogroup" aria-label="Choose difficulty mode">' + cards + '</div>' +
    '<p class="mode-foot">Both modes share the same estate. Progress autosaves to this browser (localStorage) — a labelled RESET restores the pristine lab at any time.</p>' +
    '</div></div>';
}

// ═══ BRIEFING ════════════════════════════════════════════════════════════════
function renderBriefing(state, anim) {
  var hard = state.mode === 'hard';
  var loopItems = BRIEF_LOOP.map(function (s) {
    return '<li>' + iconSvg(s.icon, 'icon ic-4') + '<span>' + esc(s.t) + '</span></li>';
  }).join('');
  var scenario = hard
    ? '<h1 class="brief-title">03:03 — the note arrives</h1>' +
      '<div class="brief-quote hard"><p style="display:flex;align-items:flex-start;gap:0.5rem">' + iconSvg('file-warning', 'icon ic-4') +
      '<span>“4.2 GB of ' + esc(CUSTOMER) + ' customer records are on our leak site. Reach an arrangement, or the rest follows.” — actor <span class="actor">JOLTBREAK</span></span></p></div>' +
      '<p class="brief-p">You are the on-call cloud security engineer at NimbusSec, ' + esc(CUSTOMER) + '&rsquo;s internal security team. The provider says their platform is healthy — and they are right. Everything the attacker touched was <em>configured</em> that way: by a script, a shortcut, a forgotten statement. This is Lesson 6.5 in its natural habitat.</p>' +
      '<p class="brief-p" style="margin-bottom:1.5rem">Your evidence pack: the full <strong>posture scan</strong> of the estate (findings include genuine risk, accepted exceptions and noise), and the account&rsquo;s <strong>audit event log</strong> — recovered because a partial trail happened to be streaming to the SIEM. Reconstruct the chain, contain it, then fix the estate so this cannot repeat.</p>'
    : '<h1 class="brief-title">Monday, 09:00 — the compliance review</h1>' +
      '<p class="brief-p">' + esc(CUSTOMER) + ' is a mid-size logistics firm running its production estate on the fictional Stratonaut Cloud. In three days an external assessor will review the account for the annual certification. You are the cloud security engineer at NimbusSec, and the quarterly posture review is due <em>before</em> the assessor finds anything.</p>' +
      '<p class="brief-p" style="margin-bottom:1.5rem">Your tool is <strong>Ledgerline</strong>, the posture workbench: it scans every service family, stamps findings with severity, and gives you the controls to fix them. Some findings will be real traps; a few are documented exceptions the business accepted on purpose. Your job is to tell the difference — then close the real ones and prove it with a clean re-scan.</p>';
  return '<div class="brief-wrap" style="' + (hard ? 'background:#101619;color:#E7ECEA' : 'background:#F5F3EC;color:#1C2A2E') + '">' +
    '<main class="brief-card ' + (hard ? 'hard' : 'light') + (anim.has('briefing') ? ' anim-fade-up' : '') + '" style="width:100%;max-width:48rem">' +
    '<p class="brief-kicker">Case briefing · ' + (hard ? 'incident response' : 'scheduled audit') + ' · training scenario</p>' +
    scenario +
    '<div class="brief-loop ' + (hard ? 'hard' : 'light') + '">' +
    '<h2>' + iconSvg('book-open-text', 'icon ic-4') + ' The audit loop you will drill</h2>' +
    '<ol>' + loopItems + '</ol></div>' +
    '<div class="brief-meta"><span class="brief-chip ' + (hard ? 'hard' : 'medium') + '">' +
    (hard ? '10 objectives · strict checks' : '12 objectives · guided checks') + '</span>' +
    '<span>Synthetic data only · fictional provider, customer and actor</span></div>' +
    '<button type="button" class="btn-open-workbench" data-action="GOTO" data-stage="workbench">' +
    'Open the workbench ' + iconSvg('arrow-right', 'icon ic-4') + '</button>' +
    '</main></div>';
}

// ═══ CONSOLE HEADER ══════════════════════════════════════════════════════════
function renderHeader(state) {
  var hard = state.mode === 'hard';
  var defs = OBJECTIVES_BY_MODE[state.mode || 'medium'];
  var allPassed = defs.every(function (o) { return state.objectives[o.id] && state.objectives[o.id].status === 'passed'; });
  var openCount = activeFindings(state.configs).length;
  var countClean = state.scanCount > 0 && openCount === 0;
  var workModes = [
    { stage: 'workbench', label: 'Workbench', icon: 'wrench' },
    { stage: 'review', label: 'Review Deck', icon: 'clipboard-check' },
    { stage: 'report', label: 'Posture Report', icon: 'clipboard-check' },
  ].map(function (w) {
    return '<button type="button" data-action="GOTO" data-stage="' + w.stage + '"' +
      (state.stage === w.stage ? ' aria-current="page"' : '') +
      ' class="btn ' + (state.stage === w.stage ? 'btn-primary' : 'btn-ghost') + ' btn-nav">' +
      iconSvg(w.icon, 'icon ic-4') + w.label + '</button>';
  }).join('');
  return '<header class="console-header"><div class="header-inner">' +
    '<div class="header-brand"><div class="header-tile">LL</div><div style="min-width:0">' +
    '<p class="header-kicker">Ledgerline · Posture Workbench</p>' +
    '<p class="header-sub">nimbus-prod — Nimbus Logistics <span class="soft">(synthetic training estate)</span></p></div></div>' +
    '<div class="header-posture">' + gaugeHtml(postureScore(state.configs), state.mode, state.scanCount > 0, 52, 'header') +
    '<div class="header-findings"><p class="label">open findings</p>' +
    '<p class="value' + (countClean ? ' clean' : '') + '">' + (state.scanCount === 0 ? '—' : openCount) + '</p></div></div>' +
    '<nav aria-label="Workbench views" class="header-nav">' + workModes +
    '<button type="button" class="btn btn-ghost btn-nav" data-action="DOCTRINE_OPEN">' + iconSvg('book-open-text', 'icon ic-4') + ' Doctrine</button>' +
    (allPassed ? '<button type="button" class="btn btn-ghost btn-nav" data-action="COMPLETION_REOPEN">' +
      iconSvg('trophy', 'icon ic-4') + ' Completion</button>' : '') +
    '<span class="mode-chip">' + (hard ? 'HARD · NIGHT SHIFT' : 'MEDIUM · GUIDED AUDIT') + '</span>' +
    '<button type="button" class="btn btn-ghost btn-nav" data-action="RESET_OPEN" aria-label="Reset the lab">' +
    iconSvg('rotate-ccw', 'icon ic-4') + ' Reset</button>' +
    '</nav></div></header>';
}

// ═══ RESOURCE LEDGER ═════════════════════════════════════════════════════════
function renderLedger(state) {
  var KIND_ICON = { bucket: 'archive', identity: 'user-cog', sg: 'network', instance: 'server', db: 'database', account: 'landmark' };
  var counts = {};
  if (state.scanCount > 0) {
    FINDINGS.forEach(function (f) {
      if (!f.active(state.configs)) return;
      var c = counts[f.resource] || (counts[f.resource] = { critical: 0, high: 0, other: 0 });
      if (f.severity === 'critical') c.critical++;
      else if (f.severity === 'high') c.high++;
      else c.other++;
    });
  }
  var families = FAMILY_ORDER.map(function (fam) {
    var rows = RESOURCES.filter(function (r) { return r.family === fam; }).map(function (r) {
      var c = counts[r.id];
      var badge = '';
      if (c && c.critical > 0) badge = '<span class="count-badge sev-critical">' + c.critical + 'C</span>';
      else if (c && c.critical === 0 && c.high > 0) badge = '<span class="count-badge sev-high">' + c.high + 'H</span>';
      else if (c && c.critical === 0 && c.high === 0 && c.other > 0) badge = '<span class="count-badge sev-medium">' + c.other + 'M</span>';
      else if (c && c.critical + c.high + c.other === 0) badge = '<span class="count-badge sev-accent">✓</span>';
      var selected = state.selectedResource === r.id;
      return '<li><button type="button" data-action="SELECT_RESOURCE" data-resource="' + r.id + '"' +
        ' data-fid="ledger:' + r.id + '"' + (selected ? ' aria-current="true"' : '') +
        ' class="ledger-row' + (selected ? ' active' : '') + '">' +
        '<div class="ledger-row-top"><span style="color:var(--accent)">' + iconSvg(KIND_ICON[r.kind], 'icon ic-4') + '</span>' +
        '<span class="ledger-row-name">' + esc(r.name) + '</span>' + badge + '</div>' +
        '<p class="ledger-row-ref">' + esc(r.refId) + '</p></button></li>';
    }).join('');
    return '<div class="ledger-family"><p class="ledger-family-title">' + esc(FAMILY_LABEL[fam]) + '</p>' +
      '<ul class="ledger-list">' + rows + '</ul></div>';
  }).join('');
  return '<nav aria-label="Resource ledger" style="display:flex;flex-direction:column;gap:0">' + families + '</nav>';
}

// ═══ RESOURCE DOSSIER ════════════════════════════════════════════════════════
function policyDocView(doc) {
  var json = JSON.stringify({ Action: doc.actions, Resource: doc.resources }, null, 2);
  return '<div class="policy-doc"><p class="doc-name">' + esc(doc.name) + '</p>' +
    '<pre class="code-block">' + esc(json) + '</pre></div>';
}

function bucketPolicyTab(state, bucketId) {
  var stmts = BUCKET_POLICIES[bucketId] || [];
  var marked = state.configs.buckets[bucketId].markedStatements;
  var cards = stmts.map(function (st) {
    var isMarked = marked.includes(st.id);
    var pre = 'Effect:    ' + st.effect + '\nPrincipal: ' + st.principal + '\nAction:    ' + st.action + '\nResource:  ' + st.resource;
    return '<div class="stmt-card' + (isMarked ? ' marked' : '') + '">' +
      '<div class="stmt-head"><span class="label">statement ' + esc(st.id) + '</span>' +
      (st.markable
        ? '<button type="button" class="btn btn-ghost btn-sm btn-mark" aria-pressed="' + isMarked + '"' +
          ' data-fid="mark:' + bucketId + ':' + st.id + '" data-action="MARK_STATEMENT" data-bucket="' + bucketId + '" data-stmt="' + st.id + '">' +
          (isMarked ? 'Marked ✓' : 'Mark the problem') + '</button>'
        : '') +
      '</div><pre class="code-block padded-sm">' + esc(pre) + '</pre>' +
      (st.note ? '<p class="stmt-note">note: ' + esc(st.note) + '</p>' : '') +
      '</div>';
  }).join('');
  return '<div class="stack"><p class="cfg-note">Policy document (simplified). Statements grant <span class="mono">Principal</span> the listed <span class="mono">Action</span> on <span class="mono">Resource</span>.</p>' + cards + '</div>';
}

function identityPolicyTab(state, identityId) {
  var ident = state.configs.identities[identityId];
  var candidates = identityId === 'iam-svc-deploy'
    ? POLICIES.filter(function (p) { return p.id !== 'pol-readonly-correct'; })
    : POLICIES.filter(function (p) { return p.id === ident.policyId; });
  var hint = identityId === 'iam-svc-deploy'
    ? '<p class="cfg-note">Least-privilege rewrite: pick the policy that grants exactly what the pipeline needs — near-misses are deliberately offered.</p>'
    : '';
  var cards = candidates.map(function (p) {
    var current = ident.policyId === p.id;
    var qChip = p.quality === 'least' || p.quality === 'ok' ? '<span class="stamp sev-accent">' + (p.quality === 'least' ? 'least privilege' : 'correctly scoped') + '</span>'
      : p.quality === 'wildcard-all' ? '<span class="stamp sev-critical">wildcard ×2</span>'
        : '<span class="stamp sev-high">near-miss</span>';
    return '<div class="policy-card' + (current ? ' current' : '') + '">' +
      '<div class="policy-card-head"><div class="left"><p class="name">' + esc(p.name) + '</p>' + qChip + '</div>' +
      (identityId === 'iam-svc-deploy' && !current
        ? '<button type="button" class="btn btn-primary btn-sm" data-fid="apply:' + p.id + '" data-action="APPLY_POLICY" data-identity="' + identityId + '" data-policy="' + p.id + '">Apply policy</button>'
        : '') +
      (current ? '<span class="chip">attached</span>' : '') +
      '</div>' + policyDocView(p) + '</div>';
  }).join('');
  return '<div class="stack-3">' + hint + cards + '</div>';
}

function evidenceTab(state, kind, id) {
  if (kind === 'bucket') {
    var objects = id === 'st-nl-logs' ? LOG_OBJECTS : (GENERIC_OBJECTS[id] || []);
    var rows = objects.map(function (o) {
      var warn = o.note.startsWith('⚠');
      var warnCls = warn ? (state.mode === 'hard' ? ' warn-hard' : '') : '';
      var warnStyle = warn && state.mode !== 'hard' ? ' style="color:#B45309"' : '';
      var secretPre = (id === 'st-nl-logs' && o.note.includes('SKNS'))
        ? '<pre class="code-block tight" style="margin-top:0.5rem">[2026-11-06 02:11:47] DEBUG analytics.collect: using credential\n  AWS_ACCESS_KEY_ID=SKNS7F4K9Q2MEXAMPLE</pre>'
        : '';
      return '<div class="obj-listing"><p class="key">' + esc(o.key) + ' <span class="meta">· ' + esc(o.size) + '</span></p>' +
        '<p class="note' + warnCls + '"' + warnStyle + '>' + esc(o.note) + '</p>' + secretPre + '</div>';
    }).join('');
    return '<div class="stack"><p class="cfg-note">Object listing (read-only, simulated). Objects are evidence — treat contents accordingly.</p>' + rows + '</div>';
  }
  if (kind === 'instance') {
    var ins = state.configs.instances[id];
    var ud = USER_DATA[id];
    var removed = ins.userDataSecretRemoved;
    var box = '';
    if (!removed) {
      box = '<div class="secret-warn"><p>' + iconSvg('alert-triangle', 'icon ic-4') +
        '<span>The script above embeds a live access key (and it also leaked into archived logs — see nl-logs-archive evidence).</span></p>' +
        '<button type="button" class="btn btn-primary btn-sm" style="margin-top:0.75rem" data-fid="scrub:' + id + '"' +
        ' data-action="REMOVE_SECRET" data-instance="' + id + '">' + iconSvg('shield-check', 'icon ic-4') +
        ' Remove hardcoded secret → instance profile (simplified)</button></div>';
    } else if (id === 'in-analytics01') {
      box = '<p class="scrubbed-note">Scrubbed. The runtime now resolves credentials from an instance profile — nothing long-lived lives on disk.</p>';
    }
    return '<div class="stack"><p class="cfg-note">Provisioning user-data (simulated). Anything placed here is readable on the host.</p>' +
      '<pre class="code-block">' + esc(ud.script.join('\n')) + '</pre>' + box + '</div>';
  }
  return '';
}

function configTab(state, kind, id) {
  var rowCls = 'cfg-row';
  var hard = state.mode === 'hard';
  if (kind === 'bucket') {
    var b = state.configs.buckets[id];
    return '<div class="stack">' +
      '<div class="' + rowCls + '"><div><p class="name">' + iconSvg('shield-ban', 'icon ic-4') + ' Block Public Access</p>' +
      '<p class="desc">Guardrail that overrides any anonymous-read statement. <span class="mono">(simplified)</span></p></div>' +
      switchHtml(b.blockPublicAccess, 'sw:bucket:' + id + ':bpa', 'Toggle Block Public Access', 'TOGGLE_BPA', ' data-id="' + id + '"') + '</div>' +
      '<div class="' + rowCls + '"><div><p class="name">Encryption at rest</p>' +
      '<p class="desc">SSE-KMS = customer-managed keys · SSE-S3 = provider-managed · none = plaintext on disk</p></div>' +
      selectHtml([{ value: 'none', label: 'none' }, { value: 'sse-s3', label: 'SSE-S3' }, { value: 'sse-kms', label: 'SSE-KMS' }],
        b.encryption, 'sel:bucket:' + id + ':enc', 'Encryption at rest',
        'data-change="PATCH_BUCKET_ENC" data-id="' + id + '" style="width:10.625rem"') + '</div>' +
      '<div class="' + rowCls + '"><div><p class="name">Versioning</p><p class="desc">Keeps prior object versions — recovery from overwrite or deletion.</p></div>' +
      switchHtml(b.versioning, 'sw:bucket:' + id + ':ver', 'Toggle versioning', 'TOGGLE_PLAIN', ' data-kind="bucket" data-id="' + id + '" data-field="versioning"') + '</div>' +
      '<div class="' + rowCls + '"><div><p class="name">Server access logging</p><p class="desc">Records every read — the "what did they take?" evidence.</p></div>' +
      switchHtml(b.accessLogging, 'sw:bucket:' + id + ':log', 'Toggle access logging', 'TOGGLE_PLAIN', ' data-kind="bucket" data-id="' + id + '" data-field="accessLogging"') + '</div>' +
      '<p class="cfg-note">Resulting state: anonymous reads are ' + (b.blockPublicAccess ? 'blocked by the guardrail' : 'PERMITTED by the policy') + '.</p>' +
      '</div>';
  }
  if (kind === 'identity') {
    var ident = state.configs.identities[id];
    var isDeploy = id === 'iam-svc-deploy';
    var keyRows = ident.keys.map(function (k) {
      var stamps = '';
      stamps += k.status === 'active'
        ? '<span class="stamp sev-medium">ACTIVE</span>'
        : '<span class="stamp sev-accent">REVOKED</span>';
      if (k.exposure === 'exposed' && k.status === 'active') stamps += '<span class="stamp sev-critical">EXPOSED</span>';
      if (k.exposure === 'stale' && k.status === 'active') stamps += '<span class="stamp sev-high">UNUSED ' + k.lastUsedDays + 'd</span>';
      if (k.exposure === 'clean' && k.status === 'active') stamps += '<span class="stamp sev-accent">NEW</span>';
      var revoke = (k.status === 'active' && k.exposure !== 'clean')
        ? '<button type="button" class="btn btn-ghost btn-sm" data-fid="revoke:' + id + ':' + k.id + '" data-action="REVOKE_KEY" data-identity="' + id + '" data-key="' + k.id + '">Revoke key</button>'
        : '';
      return '<li class="key-row"><span class="id">' + esc(k.id) + '</span>' + stamps +
        '<span class="last-used">last used: ' + (k.status === 'revoked' ? '—' : k.lastUsedDays + 'd ago') + '</span>' + revoke + '</li>';
    }).join('');
    var rotate = '';
    if (isDeploy) {
      var hasClean = ident.keys.some(function (k) { return k.exposure === 'clean' && k.status === 'active'; });
      if (!hasClean) {
        rotate = '<button type="button" class="btn btn-primary btn-sm" style="margin-top:0.75rem" data-fid="rotate:' + id + '"' +
          ' data-action="ROTATE_KEY" data-identity="' + id + '">' + iconSvg('rotate-cw', 'icon ic-4') + ' Rotate key (issue replacement)</button>';
      }
    }
    var wildHint = (isDeploy && ident.policyId === 'pol-wildcard-all')
      ? '<p class="cfg-note" style="margin-top:0.5rem">Candidates and the rewrite live in the <button type="button" class="inline-link" data-action="DOSSIER_TAB_SET" data-tab="policy">policy tab</button>.</p>'
      : '';
    var currentDoc = POLICIES.find(function (p) { return p.id === ident.policyId; });
    return '<div class="stack">' +
      '<div class="' + rowCls + '"><div><p class="name">' + iconSvg('shield-check', 'icon ic-4') + ' Enforce MFA</p>' +
      '<p class="desc">Hardens console logins. Static API keys are protected by rotation, not MFA.</p></div>' +
      switchHtml(ident.mfa, 'sw:identity:' + id + ':mfa', 'Toggle MFA enforcement', 'TOGGLE_MFA', ' data-id="' + id + '"') + '</div>' +
      '<div class="cfg-sub"><p class="name">Attached policy</p>' + policyDocView(currentDoc) + wildHint + '</div>' +
      '<div class="cfg-sub"><p class="name">' + iconSvg('key-round', 'icon ic-4') + ' Access keys</p>' +
      '<ul class="key-list">' + keyRows + '</ul>' + rotate + '</div>' +
      '</div>';
  }
  if (kind === 'instance') {
    var ins = state.configs.instances[id];
    return '<div class="stack">' +
      '<div class="' + rowCls + '"><div><p class="name">Public IP address</p><p class="desc">Direct internet path to the instance — remove unless required.</p></div>' +
      switchHtml(ins.publicIp, 'sw:instance:' + id + ':ip', 'Toggle public IP', 'TOGGLE_PLAIN', ' data-kind="instance" data-id="' + id + '" data-field="publicIp"') + '</div>' +
      '<div class="' + rowCls + '"><div><p class="name">Instance metadata service (IMDS)</p><p class="desc">v2-only requires a session token first — breaks SSRF credential theft (T1552.005).</p></div>' +
      selectHtml([{ value: 'v1', label: 'v1 — token not required' }, { value: 'v1v2', label: 'v1 + v2 — token optional' }, { value: 'v2', label: 'v2 only — token required' }],
        ins.imds, 'sel:instance:' + id + ':imds', 'Metadata service version',
        'data-change="PATCH_INSTANCE_IMDS" data-id="' + id + '" style="width:13.125rem"') + '</div>' +
      '<div class="' + rowCls + '"><div><p class="name">Volume encryption at rest</p><p class="desc">Lab simplification: one switch. Real workflow re-encrypts via snapshot copy.</p></div>' +
      switchHtml(ins.volumeEncrypted, 'sw:instance:' + id + ':enc', 'Toggle volume encryption', 'TOGGLE_PLAIN', ' data-kind="instance" data-id="' + id + '" data-field="volumeEncrypted"') + '</div>' +
      '</div>';
  }
  if (kind === 'sg') {
    var sg = state.configs.sgs[id];
    var rows = sg.rules.map(function (rule) {
      return '<div class="' + rowCls + '"><div><p class="name">' + esc(rule.label) + ' <span class="mono" style="font-size:0.75rem;color:var(--ink-soft)">· tcp/' + esc(rule.port) + '</span></p>' +
        '<p class="desc">ingress source CIDR</p></div>' +
        selectHtml(CIDR_OPTIONS, rule.source, 'sel:sg:' + id + ':' + rule.id, 'Source for ' + rule.label,
          'data-change="PATCH_SG_SOURCE" data-sg="' + id + '" data-rule="' + rule.id + '" style="width:17.5rem;max-width:60vw"') + '</div>';
    }).join('');
    return '<div class="stack">' + rows + '</div>';
  }
  if (kind === 'db') {
    var db = state.configs.db[id];
    return '<div class="stack">' +
      '<div class="' + rowCls + '"><div><p class="name">Public accessibility</p><p class="desc">Gives the database a routable public endpoint — app-tier private routing is the default.</p></div>' +
      switchHtml(db.publicAccess, 'sw:db:' + id + ':pub', 'Toggle public accessibility', 'TOGGLE_PLAIN', ' data-kind="db" data-id="' + id + '" data-field="publicAccess"') + '</div>' +
      '<div class="' + rowCls + '"><div><p class="name">Encryption at rest</p><p class="desc">Encrypts storage, snapshots and backups.</p></div>' +
      switchHtml(db.encryptionAtRest, 'sw:db:' + id + ':enc', 'Toggle encryption at rest', 'TOGGLE_PLAIN', ' data-kind="db" data-id="' + id + '" data-field="encryptionAtRest"') + '</div>' +
      '<div class="' + rowCls + '"><div><p class="name">Automated backups</p><p class="desc">Recovery point for destructive events — confidentiality is not the only concern.</p></div>' +
      switchHtml(db.backups, 'sw:db:' + id + ':bak', 'Toggle automated backups', 'TOGGLE_PLAIN', ' data-kind="db" data-id="' + id + '" data-field="backups"') + '</div>' +
      '</div>';
  }
  // account
  var acct = state.configs.account[id];
  return '<div class="stack">' +
    '<div class="' + rowCls + '"><div><p class="name">Control-plane audit trail</p><p class="desc">Records every API call account-wide — detection and forensics in one (M1047).</p></div>' +
    switchHtml(acct.auditTrail, 'sw:account:' + id + ':trail', 'Toggle audit trail', 'TOGGLE_PLAIN', ' data-kind="account" data-id="' + id + '" data-field="auditTrail"') + '</div>' +
    '<div class="' + rowCls + '"><div><p class="name">Configuration-drift alerts</p><p class="desc">Continuous posture: page when live state diverges from the approved baseline.</p></div>' +
    switchHtml(acct.driftAlerts, 'sw:account:' + id + ':drift', 'Toggle drift alerts', 'TOGGLE_PLAIN', ' data-kind="account" data-id="' + id + '" data-field="driftAlerts"') + '</div>' +
    '</div>';
}

function renderDossier(state) {
  var r = state.selectedResource ? RESOURCE_BY_ID[state.selectedResource] : null;
  if (!r) {
    return '<div class="dossier-empty">Select a resource from the ledger to open its dossier.</div>';
  }
  var activeHere = state.scanCount > 0
    ? FINDINGS.filter(function (f) { return f.resource === r.id && f.active(state.configs); })
    : [];
  var tabsAvailable = ['config'];
  if (r.kind === 'bucket' || r.kind === 'identity') tabsAvailable.push('policy');
  if (r.kind === 'bucket' || r.kind === 'instance') tabsAvailable.push('evidence');
  var tab = tabsAvailable.includes(state.dossierTab) ? state.dossierTab : 'config';

  var exceptionBox = r.exception
    ? '<div class="exception-box"><p class="title">' + iconSvg('badge-check', 'icon ic-4') +
      ' Accepted exception — ' + esc(r.exception.title) + '</p><p class="why">' + esc(r.exception.why) + '</p></div>'
    : '';
  var findingsChips = '';
  if (state.scanCount > 0) {
    var chips = activeHere.length === 0
      ? '<span class="stamp sev-accent">none — clean</span>'
      : activeHere.map(function (f) {
        var cls = f.severity === 'critical' ? 'sev-critical' : f.severity === 'high' ? 'sev-high' : 'sev-medium';
        return '<span class="stamp ' + cls + '">' + esc(f.code) + '</span>';
      }).join('');
    findingsChips = '<div class="findings-here" aria-live="polite"><span class="label">open findings:</span>' + chips + '</div>';
  }
  var tabBtns = tabsAvailable.map(function (t) {
    return '<button type="button" role="tab" aria-selected="' + (tab === t) + '" data-action="DOSSIER_TAB_SET" data-tab="' + t + '"' +
      ' data-fid="dtab:' + t + '" class="btn ' + (tab === t ? 'btn-primary' : 'btn-ghost') + '">' + t + '</button>';
  }).join('');
  var body = tab === 'config' ? configTab(state, r.kind, r.id)
    : tab === 'policy' ? (r.kind === 'bucket' ? bucketPolicyTab(state, r.id) : identityPolicyTab(state, r.id))
      : evidenceTab(state, r.kind, r.id);
  return '<div class="stack-3">' +
    '<div class="dossier-head"><div class="dossier-head-top"><h2 class="dossier-name">' + esc(r.name) + '</h2>' +
    '<span class="chip-11 chip">' + esc(r.refId) + '</span><span class="chip-11 chip">' + esc(r.region) + '</span></div>' +
    '<p class="dossier-summary">' + esc(r.summary) + '</p>' + exceptionBox + findingsChips + '</div>' +
    '<div class="dossier-tabs" role="tablist" aria-label="Dossier views">' + tabBtns + '</div>' +
    body + '</div>';
}

// ═══ OBJECTIVE CARD ══════════════════════════════════════════════════════════
function renderObjectiveInput(state, def, inp) {
  var getVal = function (field) { return state.answers[def.id] ? state.answers[def.id][field] : undefined; };
  if (inp.kind === 'select') {
    var val = typeof getVal(inp.field) === 'string' ? getVal(inp.field) : '';
    return '<div class="objective-input"><p class="label">' + esc(inp.label) + '</p>' +
      selectHtml(inp.options || [], val, 'ans:' + def.id + ':' + inp.field, inp.label,
        'data-change="SET_ANSWER_SELECT" data-obj="' + def.id + '" data-field="' + inp.field + '" class="w-full"') +
      '</div>';
  }
  if (inp.kind === 'cards') {
    var items = (inp.items || []).map(function (it) {
      var record = getVal(inp.field) || {};
      var chosen = record[it.id];
      var control;
      if (it.options && it.options.length === 2) {
        control = '<div class="answer-pair">' + it.options.map(function (o) {
          return '<button type="button" aria-pressed="' + (chosen === o.value) + '"' +
            ' data-fid="ans:' + def.id + ':' + inp.field + ':' + it.id + ':' + o.value + '"' +
            ' data-action="SET_ANSWER_CARD" data-obj="' + def.id + '" data-field="' + inp.field + '" data-item="' + it.id + '" data-value="' + o.value + '"' +
            ' class="btn ' + (chosen === o.value ? 'btn-primary' : 'btn-ghost') + '">' + esc(o.label) + '</button>';
        }).join('') + '</div>';
      } else {
        control = selectHtml(it.options || [], chosen || '', 'ans:' + def.id + ':' + inp.field + ':' + it.id,
          inp.label + ': ' + it.label,
          'data-change="SET_ANSWER_CARD_SELECT" data-obj="' + def.id + '" data-field="' + inp.field + '" data-item="' + it.id + '" class="w-full-sm"');
      }
      return '<li class="answer-card"><p class="q">' + esc(it.label) + '</p>' + control + '</li>';
    }).join('');
    return '<div class="objective-input"><p class="label">' + esc(inp.label) + '</p><ul class="answer-cards">' + items + '</ul></div>';
  }
  // order input
  var src = (def.inputs || []).find(function (i) { return i.kind === 'cards'; });
  var labels = {};
  if (src && src.items) src.items.forEach(function (it) { labels[it.id] = it.label; });
  var v = getVal(inp.field);
  var ord = Array.isArray(v) ? v : SCRAMBLED_ORDER;
  var rows = ord.map(function (id, i) {
    return '<li class="order-row"><span class="num">' + (i + 1) + '.</span>' +
      '<span class="label">' + esc(labels[id] != null ? labels[id] : id) + '</span>' +
      '<button type="button" aria-label="Move step ' + (i + 1) + ' up" data-fid="ord:' + def.id + ':' + i + ':up"' +
      ' data-action="ORDER_MOVE" data-obj="' + def.id + '" data-field="' + inp.field + '" data-index="' + i + '" data-dir="-1" class="mover">' +
      iconSvg('arrow-up', 'icon ic-4') + '</button>' +
      '<button type="button" aria-label="Move step ' + (i + 1) + ' down" data-fid="ord:' + def.id + ':' + i + ':down"' +
      ' data-action="ORDER_MOVE" data-obj="' + def.id + '" data-field="' + inp.field + '" data-index="' + i + '" data-dir="1" class="mover">' +
      iconSvg('arrow-down', 'icon ic-4') + '</button></li>';
  }).join('');
  return '<div class="objective-input"><p class="label">' + esc(inp.label) + '</p><ol class="order-list">' + rows + '</ol></div>';
}

function renderObjectiveCard(state, def, index, total) {
  var hard = state.mode === 'hard';
  var prog = state.objectives[def.id] || { status: 'todo', attempts: 0, hintsUsed: 0 };
  var passed = prog.status === 'passed';
  var defs = OBJECTIVES_BY_MODE[state.mode || 'medium'];
  var active = defs.find(function (o) { return !(state.objectives[o.id] && state.objectives[o.id].status === 'passed'); });
  var isActive = active && active.id === def.id;
  var cls = 'objective-card' + (passed ? ' passed' : isActive ? ' active' : '');

  var inputs = (def.inputs || []).map(function (inp) { return renderObjectiveInput(state, def, inp); }).join('');

  var actions = '<button type="button" class="btn btn-primary btn-md" data-fid="check:' + def.id + '"' +
    ' data-action="CHECK_OBJ" data-obj="' + def.id + '" aria-label="Check objective: ' + esc(def.title) + '">' +
    iconSvg('crosshair', 'icon ic-4') + ' CHECK RESULTS</button>';
  if (def.jump && !hard) {
    actions += '<button type="button" class="btn btn-ghost btn-md" data-action="JUMP_RESOURCE" data-resource="' + def.jump.resource + '">' +
      iconSvg('eye', 'icon ic-4') + ' Where to look: ' + esc(def.jump.note) + '</button>';
  }
  if (!hard && prog.hintsUsed < def.hints.length) {
    actions += '<button type="button" class="btn btn-ghost btn-md" data-fid="hint:' + def.id + '" data-action="HINT_OBJ" data-obj="' + def.id + '">' +
      iconSvg('lightbulb', 'icon ic-4') + ' Hint ' + (prog.hintsUsed + 1) + '/' + def.hints.length + ' · −0.15★</button>';
  }
  if (hard && prog.hintsUsed === 0) {
    actions += '<button type="button" class="btn btn-ghost btn-md" data-fid="hint:' + def.id + '" data-action="HINT_OBJ" data-obj="' + def.id + '">' +
      iconSvg('lightbulb', 'icon ic-4') + ' Reveal the one nudge · −0.4★</button>';
  }

  var hintsBox = '';
  if (prog.hintsUsed > 0) {
    var hintTexts = def.hints.slice(0, prog.hintsUsed).map(function (h) {
      return '<p class="hint-text">' + esc(h) + '</p>';
    }).join('');
    hintsBox = '<div class="hint-box"><p class="kicker">hint</p>' + hintTexts + '</div>';
  }

  var resultBox = '';
  if (prog.attempts > 0 && prog.lastDetail) {
    resultBox = '<div aria-live="polite" class="result-box ' + (passed ? 'pass' : 'fail') + '">' +
      '<p class="verdict">' + iconSvg(passed ? 'check-circle-2' : 'x-circle', 'icon ic-4') +
      '<span>' + esc(prog.lastDetail) + '</span></p>' +
      (passed ? '<p class="feedback">' + esc(def.feedback) + '</p>' : '') +
      '</div>';
  }

  return '<article class="' + cls + '" aria-label="Objective ' + (index + 1) + ' of ' + total + '">' +
    '<div class="objective-head"><span class="stamp sev-accent">' + esc(def.id.replace('OBJ-', '')) + '</span>' +
    '<span class="chip">' + esc(def.pillar) + ' · ' + esc(PILLAR_LABEL[def.pillar]) + '</span>' +
    '<span class="right">' + (passed ? iconSvg('check-circle-2', 'icon ic-5 sev-accent') : '') + '</span></div>' +
    '<h3 class="objective-title">' + esc(def.title) + '</h3>' +
    '<p class="objective-context">' + esc(def.context) + '</p>' +
    '<p class="objective-anchor">covers: ' + esc(def.anchor) + '</p>' +
    inputs +
    '<div class="objective-actions">' + actions + '</div>' +
    hintsBox + resultBox +
    '</article>';
}

// ═══ AUDIT DESK ══════════════════════════════════════════════════════════════
function renderDesk(state) {
  var hard = state.mode === 'hard';
  var mode = state.mode || 'medium';
  var defs = OBJECTIVES_BY_MODE[mode];
  var active = activeFindings(state.configs).slice().sort(function (a, b) {
    return SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
  });
  var score = postureScore(state.configs);
  var passedCount = defs.filter(function (o) { return state.objectives[o.id] && state.objectives[o.id].status === 'passed'; }).length;

  var tabs = ['findings', 'objectives'].map(function (t) {
    return '<button type="button" role="tab" aria-selected="' + (state.deskTab === t) + '" data-action="DESK_TAB_SET" data-tab="' + t + '"' +
      ' data-fid="dtab2:' + t + '" class="btn ' + (state.deskTab === t ? 'btn-primary' : 'btn-ghost') + '">' +
      (t === 'findings' ? 'Findings ledger' : 'Objectives ' + passedCount + '/' + defs.length) + '</button>';
  }).join('');

  var scanning = UIState.scanning;
  var sevCount = function (sev) { return active.filter(function (f) { return f.severity === sev; }).length; };

  var findingsTab = '<div style="display:flex;flex-direction:column;gap:1rem">' +
    '<div class="scan-card"><div class="scan-card-top">' +
    gaugeHtml(score, state.mode, state.scanCount > 0, 88, 'desk') +
    '<div style="flex:1;min-width:0"><p class="kicker">posture scan</p>' +
    '<p class="status">' + (state.scanCount === 0
      ? 'The estate has never been scanned. Run the sweep to surface findings.'
      : active.length + ' open finding' + (active.length === 1 ? '' : 's') + ' across the estate.') + '</p>' +
    '<button type="button" class="btn btn-primary btn-md" data-action="SCAN" data-fid="scan"' +
    ' aria-label="Run posture scan"' + (scanning ? ' disabled' : '') + '>' +
    iconSvg('refresh-cw', 'icon ic-4' + (scanning ? ' anim-spin' : '')) +
    (scanning ? ' Sweeping estate…' : state.scanCount === 0 ? ' RUN POSTURE SCAN' : ' RE-SCAN TO VERIFY') + '</button></div></div>' +
    '<div class="sweep-strip"' + (scanning ? '' : ' aria-hidden="true"') + '">' +
    FAMILY_ORDER.map(function (f) { return '<div class="sweep-chip" data-family="' + f + '">' + esc(FAMILY_LABEL[f].split(' ')[0]) + '</div>'; }).join('') +
    '</div>';

  if (state.scanCount > 0) {
    findingsTab += '<div class="sev-counts" aria-live="polite">' +
      '<span class="stamp sev-critical">' + sevCount('critical') + ' critical</span>' +
      '<span class="stamp sev-high">' + sevCount('high') + ' high</span>' +
      '<span class="stamp sev-medium">' + sevCount('medium') + ' medium</span>' +
      '<span class="stamp sev-low">' + sevCount('low') + ' low</span>' +
      (state.dirty ? '<span class="dirty-badge">config changed — re-scan to verify</span>' : '') +
      '</div>';
  }
  findingsTab += '</div>';

  if (hard) {
    findingsTab += '<button type="button" class="btn btn-ghost btn-md breach-btn" data-action="SIEM_OPEN">' +
      iconSvg('file-terminal', 'icon ic-4') + ' Open breach evidence — audit event log (E-01…E-07)</button>';
  }

  if (state.scanCount > 0) {
    var listItems = active.map(function (f) {
      var animCls = UIState.anim.has('findings:' + state.scanCount) ? ' anim-in' : '';
      return '<li class="finding-card' + animCls + '">' +
        '<div class="finding-top"><span class="stamp ' + sevClass(f.severity) + '">' + f.severity.toUpperCase() + '</span>' +
        '<span class="code">' + esc(f.code) + '</span><span class="title">' + esc(f.title) + '</span></div>' +
        '<pre class="code-block padded-sm" style="margin-top:0.5rem">' + esc(f.evidence) + '</pre>' +
        '<p class="why">' + esc(f.why) + '</p>' +
        '<div class="finding-foot">' +
        (f.mitre ? '<span class="chip">' + esc(f.mitre) + '</span>' : '') +
        '<span class="chip">' + esc(f.responsibility) + ' responsibility</span>' +
        '<button type="button" class="inline-link jump" data-action="JUMP_RESOURCE" data-resource="' + f.resource + '">open dossier →</button>' +
        '</div></li>';
    }).join('');
    if (active.length === 0) {
      listItems += '<li class="zero-findings"><span class="inner">' + iconSvg('shield-alert', 'icon ic-4') +
        ' Zero open findings — every control holds. (Accepted exceptions are listed below; they are not misconfigurations.)</span></li>';
    }
    var exceptionItems = EXCEPTIONS.map(function (x) {
      return '<li class="finding-card"><div class="finding-top"><span class="stamp sev-accent">EXCEPTION</span>' +
        '<span class="title">' + esc(x.title) + '</span></div>' +
        '<p class="why">' + esc(x.why) + '</p>' +
        '<button type="button" class="inline-link" style="margin-top:0.375rem" data-action="JUMP_RESOURCE" data-resource="' + x.resource + '">open dossier →</button></li>';
    }).join('');
    findingsTab += '<div class="findings-wrap scroll-y"><p class="wb-kicker" style="margin-bottom:0.5rem">findings</p>' +
      '<ul class="findings-list">' + listItems + '</ul>' +
      '<p class="exceptions-kicker">accepted exceptions (not findings)</p>' +
      '<ul class="findings-list">' + exceptionItems + '</ul></div>';
  }

  var objectivesTab = '<div class="scan-card">' +
    '<div class="obj-progress-head"><p class="kicker">' +
    (hard ? 'challenge sheet — 10 broad tasks' : 'audit runbook — 12 guided steps') + '</p>' +
    '<span class="count">' + passedCount + '/' + defs.length + ' passed</span></div>' +
    '<div class="progress-track"><div class="progress-fill" style="width:' + ((passedCount / defs.length) * 100) + '%"></div></div>' +
    '<div class="objectives-list scroll-y">' +
    defs.map(function (o, i) { return renderObjectiveCard(state, o, i, defs.length); }).join('') +
    '</div></div>';

  return '<div class="desk">' +
    '<div class="desk-tabs" role="tablist" aria-label="Audit desk views">' + tabs + '</div>' +
    (state.deskTab === 'findings' ? findingsTab : objectivesTab) +
    '</div>';
}

// ═══ WORKBENCH ═══════════════════════════════════════════════════════════════
function renderWorkbench(state) {
  var panes = [
    { id: 'ledger', label: 'Ledger', icon: 'archive' },
    { id: 'dossier', label: 'Dossier', icon: 'user-cog' },
    { id: 'desk', label: 'Desk', icon: 'network' },
  ];
  var paneBtns = panes.map(function (p) {
    return '<button type="button" role="tab" aria-selected="' + (state.pane === p.id) + '" data-action="SET_PANE" data-pane="' + p.id + '"' +
      ' data-fid="pane:' + p.id + '" class="btn ' + (state.pane === p.id ? 'btn-primary' : 'btn-ghost') + '">' +
      (state.pane === p.id ? iconSvg(p.icon, 'icon ic-4') : '') + p.label + '</button>';
  }).join('');
  var ledgerCol = '<section aria-label="Resource ledger" class="wb-panel wb-scroll scroll-y">' +
    '<p class="wb-kicker">resource ledger</p>' + renderLedger(state) + '</section>';
  var dossierCol = '<section aria-label="Resource dossier" class="wb-panel padded wb-scroll scroll-y">' +
    '<p class="wb-kicker">resource dossier</p>' + renderDossier(state) + '</section>';
  var deskCol = '<section aria-label="Audit desk" class="wb-scroll scroll-y" style="border-radius:0.5rem">' + renderDesk(state) + '</section>';
  var stackContent = state.pane === 'ledger' ? ledgerCol : state.pane === 'dossier' ? dossierCol : deskCol;
  return '<div class="workbench">' +
    '<div class="pane-switch"><div class="pane-switch-grid" role="tablist" aria-label="Workbench panes">' + paneBtns + '</div></div>' +
    '<div class="workbench-grid">' + ledgerCol + dossierCol + deskCol + '</div>' +
    '<div class="workbench-stack">' + stackContent + '</div>' +
    '<p class="wb-footnote">' + iconSvg('server', 'icon ic-3') + iconSvg('database', 'icon ic-3') + iconSvg('landmark', 'icon ic-3') +
    ' six families · ' + (state.scanCount > 0 ? 'estate scanned' : 'estate unscanned') + '</p>' +
    '</div>';
}

// ═══ REVIEW DECK ═════════════════════════════════════════════════════════════
function renderReviewDeck(state) {
  var hard = state.mode === 'hard';
  var questions = QUIZ_BY_MODE[state.mode || 'medium'];
  var correct = quizCorrectCount(state.quiz, questions);
  var checkedCount = questions.filter(function (q) { return state.quiz.checked[q.id]; }).length;

  var sections = questions.map(function (q, i) {
    var picked = state.quiz.answers[q.id];
    var isChecked = !!state.quiz.checked[q.id];
    var isCorrect = picked === q.correct;
    var options = q.options.map(function (o) {
      var chosen = picked === o.id;
      var cls = '';
      if (isChecked) {
        if (o.id === q.correct) cls = ' correct';
        else if (chosen) cls = ' wrong';
      } else if (chosen) cls = ' chosen';
      return '<button type="button" role="radio" aria-checked="' + chosen + '" data-fid="quiz:' + q.id + ':' + o.id + '"' +
        ' data-action="QUIZ_ANSWER" data-qid="' + q.id + '" data-oid="' + o.id + '"' +
        ' class="quiz-option' + cls + '"><span class="oid">' + o.id + ')</span>' + esc(o.text) + '</button>';
    }).join('');
    var foot = !isChecked
      ? '<button type="button" class="btn btn-primary btn-md" data-fid="qcheck:' + q.id + '"' +
        ' data-action="QUIZ_CHECK" data-qid="' + q.id + '"' + (picked ? '' : ' disabled') + '>' +
        iconSvg('help-circle', 'icon ic-4') + ' Check answer</button>'
      : '<div aria-live="polite" class="result-box ' + (isCorrect ? 'pass' : 'fail') + '">' +
        '<p class="verdict">' + iconSvg(isCorrect ? 'check-circle-2' : 'x-circle', 'icon ic-4') +
        '<span>' + (isCorrect ? 'Correct.' : 'Not quite — the correct answer is ' + q.correct.toUpperCase() + '.') + '</span></p>' +
        '<p class="feedback" style="margin-top:0.375rem">' + esc(q.explanation) + '</p></div>';
    return '<section class="quiz-card" aria-label="Question ' + (i + 1) + '">' +
      '<div class="quiz-top"><span class="qnum">Q' + (i + 1) + '</span><div>' +
      (q.scenario ? '<p class="quiz-scenario">Scenario: ' + esc(q.scenario) + '</p>' : '') +
      '<h2 class="quiz-prompt">' + esc(q.prompt) + '</h2></div></div>' +
      '<div class="quiz-options" role="radiogroup" aria-label="Options for question ' + (i + 1) + '">' + options + '</div>' +
      '<div class="quiz-foot">' + foot + '</div></section>';
  }).join('');

  var finish = checkedCount === questions.length
    ? '<div class="deck-finish"><p class="headline">Deck finished — ' + correct + '/' + questions.length + ' correct.</p>' +
      '<p class="sub">' + (correct === questions.length
        ? 'Full marks. Open the Posture Report for the debrief, then collect your completion stars.'
        : 'Reread the explanations you missed, then open the Posture Report — the debrief reinforces every item.') + '</p></div>'
    : '';

  return '<main class="deck-main">' +
    '<div class="deck-head"><p class="kicker">review deck · knowledge check</p>' +
    '<h1>' + (hard ? 'Scenario checks — apply, don&#39;t recall' : 'Concept check — explain your picks') + '</h1>' +
    '<p class="sub">' + (hard
      ? 'Each item drops you into a live decision. Pick the answer you would defend in a debrief.'
      : 'Answer, check, and read the explanation — the why matters more than the letter.') +
    ' Score so far: <span class="score">' + correct + '/' + questions.length + '</span> checked (' + checkedCount + ' answered).</p></div>' +
    sections + finish + '</main>';
}

// ═══ POSTURE REPORT ══════════════════════════════════════════════════════════
function renderPostureReport(state) {
  var hard = state.mode === 'hard';
  var detectRows = DETECTION_ROWS.map(function (r) {
    return '<tr><td class="cell-strong">' + esc(r.signal) + '</td><td class="cell-soft">' + esc(r.source) + '</td>' +
      '<td><code>' + esc(r.logic) + '</code></td></tr>';
  }).join('');
  var mitigations = MITIGATIONS.map(function (m) {
    return '<li><span class="id">' + esc(m.id) + '</span> — <span class="name">' + esc(m.name) + '</span>' +
      '<span class="covers">covers: ' + esc(m.covers) + '</span></li>';
  }).join('');
  var blue = BLUE_TAKEAWAYS.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('');
  var red = RED_TAKEAWAYS.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('');
  var links = REPORT_LINKS.map(function (l) {
    return '<li><a class="ext-link" href="' + esc(l.href) + '" target="_blank" rel="noopener noreferrer">' +
      esc(l.label) + ' ' + iconSvg('external-link', 'icon ic-3') + '</a></li>';
  }).join('');
  return '<main class="report-main">' +
    '<div class="report-card"><p class="kicker">posture report · debrief &amp; field notes</p>' +
    '<h1>What this estate taught you</h1>' +
    '<p class="sub">The synthesis layer of Lesson 6.5: where misconfigurations show up, what stops them, and how both sides of the house think about them.</p></div>' +
    '<section class="report-card report-section" aria-label="Detection opportunities">' +
    '<h2 class="kicker">Detection opportunities</h2>' +
    '<div class="detect-table-wrap"><table class="detect-table"><thead><tr>' +
    '<th>Signal</th><th>Data source</th><th>Example rule logic</th></tr></thead><tbody>' + detectRows + '</tbody></table></div></section>' +
    '<section class="report-card report-section" aria-label="Mitigation recommendations">' +
    '<h2 class="kicker">Mitigation recommendations (official ATT&amp;CK IDs)</h2>' +
    '<ul class="mitigation-list">' + mitigations + '</ul></section>' +
    '<div class="report-grid">' +
    '<section class="report-card report-section" aria-label="Blue-team takeaways"><h2 class="kicker">Blue-team takeaways</h2>' +
    '<ul class="takeaway-list">' + blue + '</ul></section>' +
    '<section class="report-card report-section" aria-label="Red-team mindset takeaways"><h2 class="kicker">Red-team mindset takeaways</h2>' +
    '<ul class="takeaway-list">' + red + '</ul></section></div>' +
    '<section class="report-card report-section" aria-label="Official references">' +
    '<h2 class="kicker">Official references (open in new tab)</h2>' +
    '<div class="links-grid"><ul class="links-list">' + links + '</ul></div></section>' +
    '<p class="report-closing">' + (hard
      ? 'Night shift complete — the same estate runs a Guided Audit in Medium mode if you want the gentler pass.'
      : 'Guided audit complete — the Night Shift (Hard) mode re-runs this estate as a live breach.') + '</p>' +
    '</main>';
}

// ═══ DOCTRINE DRAWER ═════════════════════════════════════════════════════════
function renderDoctrineDrawer(state) {
  if (!state.doctrineOpen) return '';
  var sections = DOCTRINE_SECTIONS.map(function (s, i) {
    return '<section class="drawer-section"><h3>' + String(i + 1).padStart(2, '0') + ' · ' + esc(s.title) + '</h3>' +
      '<p class="body">' + esc(s.body) + '</p></section>';
  }).join('');
  var chain = DOCTRINE_CHAIN.map(function (c) {
    return '<li><span class="tid">' + esc(c.id) + '</span> — ' + esc(c.label) +
      '<span class="tactic">' + esc(c.tactic) + '</span></li>';
  }).join('');
  var incidents = REAL_INCIDENTS.map(function (r) {
    return '<li><p class="org">' + esc(r.org) + '</p><p class="detail">' + esc(r.detail) + '</p>' +
      '<p class="mapping">' + esc(r.mapping) + '</p></li>';
  }).join('');
  var glossary = GLOSSARY.map(function (g) {
    return '<div class="entry"><dt>' + esc(g.term) + '</dt><dd>' + esc(g.def) + '</dd></div>';
  }).join('');
  var links = DOCTRINE_LINKS.map(function (l) {
    return '<li><a class="ext-link" href="' + esc(l.href) + '" target="_blank" rel="noopener noreferrer">' +
      esc(l.label) + ' ' + iconSvg('external-link', 'icon ic-3') + '</a></li>';
  }).join('');
  return '<div class="overlay" data-action="DOCTRINE_CLOSE"></div>' +
    '<aside class="drawer scroll-y" role="dialog" aria-modal="true" aria-label="Doctrine — misconfigurations in the cloud">' +
    '<div class="drawer-head"><div class="titles"><p class="drawer-title">' + iconSvg('scroll-text', 'icon ic-4') +
    ' Doctrine — misconfigurations in the cloud</p>' +
    '<p class="drawer-desc">The knowledge core for Cloud+ CV0-004 · Lesson 6.5. Everything here is exam-relevant; glossary terms are used throughout the lab.</p></div>' +
    '<button type="button" class="drawer-close" data-action="DOCTRINE_CLOSE" aria-label="Close doctrine">' + iconSvg('x', 'icon ic-4') + '</button></div>' +
    '<div class="drawer-body">' + sections +
    '<section class="drawer-section"><h3 class="spaced">The chain misconfigurations enable</h3>' +
    '<ol class="chain-list">' + chain + '</ol></section>' +
    '<section class="drawer-section"><h3 class="spaced">Real incidents (public record)</h3>' +
    '<ul class="incident-list">' + incidents + '</ul></section>' +
    '<section class="drawer-section"><h3 class="spaced">Glossary</h3>' +
    '<dl class="glossary-list">' + glossary + '</dl></section>' +
    '<section class="drawer-section"><h3 class="spaced">Official references</h3>' +
    '<ul class="drawer-links">' + links + '</ul></section>' +
    '</div></aside>';
}

// ═══ COMPLETION MODAL ════════════════════════════════════════════════════════
function renderStars(value) {
  var out = '';
  for (var i = 1; i <= 5; i++) {
    if (value >= i) {
      out += iconSvg('star', 'icon ic-6').replace('fill="none"', 'fill="currentColor"');
    } else if (value >= i - 0.5) {
      out += iconSvg('star-half', 'icon ic-6').replace('fill="none"', 'fill="currentColor"');
    } else {
      out += iconSvg('star', 'icon ic-6').replace('class="icon ic-6"', 'class="icon ic-6" style="opacity:0.3"');
    }
  }
  return out;
}

function renderCompletionModal(state, open) {
  if (!open) return '';
  var hard = state.mode === 'hard';
  var mode = state.mode || 'medium';
  var defs = OBJECTIVES_BY_MODE[mode];
  var questions = QUIZ_BY_MODE[mode];
  var passed = defs.filter(function (o) { return state.objectives[o.id] && state.objectives[o.id].status === 'passed'; }).length;
  var score = computeScore(defs, state.objectives, state.quiz, questions);
  var stars = computeStars(mode, defs, state.objectives);
  var quizCorrect = quizCorrectCount(state.quiz, questions);
  var starsColor = hard ? '#FFB454' : '#B45309';
  var blurb = stars >= 4.5
    ? 'Elite run — first-attempt checks, barely any hints. That is exam-day shape.'
    : stars >= 3.5
      ? 'Solid. A few second attempts or hints — revisit those objectives before the real exam.'
      : 'Passed, with training wheels. Re-run the other mode for a clean, unhinted pass.';
  var pillarCards = ['P1', 'P2', 'P3', 'P4'].map(function (p) {
    var items = defs.filter(function (o) { return o.pillar === p; }).map(function (o) {
      return '<li><span class="check">✓</span><span>' + esc(o.title) + '</span></li>';
    }).join('');
    return '<div class="pillar-card"><p class="kicker">' + p + ' · ' + esc(PILLAR_LABEL_FULL[p]) + '</p><ul>' + items + '</ul></div>';
  }).join('');
  return '<div class="overlay" data-action="COMPLETION_CLOSE"></div>' +
    '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="completion-title">' +
    '<h2 class="modal-title" id="completion-title">Posture verified — Lesson 6.5 mastered' + (hard ? ' under fire' : '') + '</h2>' +
    '<p class="modal-desc">Every objective passed: you can now explain, recognize, detect and mitigate cloud misconfigurations — the full scope of CV0-004 6.5.</p>' +
    '<div class="stat-grid">' +
    '<div class="stat-cell"><p class="stat-value">' + score + '%</p><p class="stat-label">score</p></div>' +
    '<div class="stat-cell"><p class="stat-value">' + passed + '/' + defs.length + '</p><p class="stat-label">objectives</p></div>' +
    '<div class="stat-cell"><p class="stat-value">' + quizCorrect + '/' + questions.length + '</p><p class="stat-label">quiz</p></div></div>' +
    '<div class="stars-box"><div class="stars-row" style="color:' + starsColor + '" role="img" aria-label="' + stars + ' out of 5 stars">' +
    renderStars(stars) + '<span class="score-note">' + stars.toFixed(1) + ' / 5</span></div>' +
    '<p class="stars-blurb">' + blurb + '</p></div>' +
    '<div class="pillar-grid">' + pillarCards + '</div>' +
    '<div class="next-steps"><p class="kicker">what to learn next</p><ul>' +
    '<li>CV0-004 6.3 — security-incident response: the revoke → rotate → investigate reflex you used here.</li>' +
    '<li>CV0-004 4.2 — identity &amp; access management in depth (federation, SSO, service accounts).</li>' +
    '<li>CIS Benchmarks &amp; the provider&rsquo;s Well-Architected security pillar — where posture rules come from.</li>' +
    '<li>MITRE ATT&amp;CK cloud matrix + D3FEND — map the six techniques from this lab to detections.</li>' +
    '</ul></div>' +
    '<div class="modal-foot"><button type="button" class="btn btn-ghost btn-md" data-action="COMPLETION_CLOSE">Stay in the lab</button></div>' +
    '</div>';
}

// ═══ RESET DIALOG ═════════════════════════════════════════════════════════════
function renderResetDialog(open) {
  if (!open) return '';
  return '<div class="overlay" data-action="RESET_CANCEL"></div>' +
    '<div class="modal sm" role="alertdialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-desc">' +
    '<h2 class="modal-title" id="reset-title">Reset the entire lab?</h2>' +
    '<p class="modal-desc" id="reset-desc">This wipes all progress — mode, objectives, quiz results and every remediation you applied — and returns the estate to its pristine misconfigured state.</p>' +
    '<div class="modal-foot">' +
    '<button type="button" class="btn btn-ghost btn-md" data-action="RESET_CANCEL">Cancel</button>' +
    '<button type="button" class="btn btn-danger btn-md" data-action="RESET_CONFIRM">Reset lab</button>' +
    '</div></div>';
}

// ═══ SIEM DIALOG (Hard) ══════════════════════════════════════════════════════
function renderSiemDialog(state, open) {
  if (!open) return '';
  var rows = BREACH_EVENTS.map(function (e) {
    return '<li class="siem-row"><div class="siem-row-top"><span class="eid">' + esc(e.id) + '</span>' +
      '<span class="time">' + esc(e.time) + '</span><span class="event">' + esc(e.event) + '</span></div>' +
      '<p class="meta">actor: ' + esc(e.actor) + ' · source: ' + esc(e.source) + ' · target: ' + esc(e.target) + '</p>' +
      '<p class="note">' + esc(e.note) + '</p></li>';
  }).join('');
  return '<div class="overlay" data-action="SIEM_CLOSE"></div>' +
    '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="siem-title" aria-describedby="siem-desc">' +
    '<div style="display:flex;align-items:flex-start;gap:0.5rem"><div style="flex:1">' +
    '<h2 class="modal-title kicker-style" id="siem-title">NimbusSec SIEM — recovered control-plane events</h2>' +
    '<p class="modal-desc" id="siem-desc">Synthetic audit trail, 2026-11-07, account nimbus-prod. TRAINING DATA.</p></div>' +
    '<button type="button" class="drawer-close" data-action="SIEM_CLOSE" aria-label="Close breach evidence">' + iconSvg('x', 'icon ic-4') + '</button></div>' +
    '<ol class="siem-list" style="margin-top:1rem">' + rows + '</ol></div>';
}

// ═══ APP ROOT ════════════════════════════════════════════════════════════════
function renderApp(state) {
  var themeCls = (state.mode === 'hard' && state.stage !== 'mode') ? 'theme-hard' : 'theme-light';
  var inner = '';
  if (state.stage === 'mode' || state.stage === 'loading') {
    inner = renderModeSelect(UIState.anim);
  } else if (state.stage === 'briefing') {
    inner = renderBriefing(state, UIState.anim);
  } else {
    var console_ = renderHeader(state);
    if (state.stage === 'workbench') console_ += renderWorkbench(state);
    else if (state.stage === 'review') console_ += renderReviewDeck(state);
    else if (state.stage === 'report') console_ += renderPostureReport(state);
    console_ += renderDoctrineDrawer(state);
    console_ += renderSiemDialog(state, UIState.siemOpen);
    console_ += renderCompletionModal(state, UIState.completionOpen);
    console_ += renderResetDialog(UIState.resetOpen);
    inner = '<div class="console-root" aria-label="Ledgerline posture workbench — synthetic training environment">' + console_ + '</div>';
  }
  return '<div class="' + themeCls + '" id="app-root">' + inner + '</div>';
}

// ── UI-local (non-persisted) state: mirrors original local component state ──
const UIState = {
  scanning: false,       // AuditDesk local useState
  siemOpen: false,       // uncontrolled Dialog in AuditDesk
  resetOpen: false,      // uncontrolled AlertDialog in ConsoleHeader
  completionDismissed: false, // ConsoleHeader local useState
  completionOpen: false, // derived each render
  anim: new Set(),       // keys that should play entrance animations this paint
};
