/* ==========================================================================
   js/stations.js — the seven audit stations + completion seal (static port)
   --------------------------------------------------------------------------
   1:1 ports of station-briefing / meters / invoice / attribution / controls /
   remediation / signoff and completion-seal from the original React lab:
   same copy, same order, same conditional rendering per mode.
   ========================================================================== */

'use strict';

function objById(id) {
  return allObjectives().find(function (o) {
    return o.id === id;
  });
}

/* ------------------------------ station 1 — briefing --------------------- */

function knowledgeCardHTML(iconName, title, rows) {
  return (
    '<div class="k-card"><h4 class="k-title">' + icon(iconName, 'i5') + esc(title) + '</h4>' +
    '<dl class="k-rows">' +
    rows
      .map(function (r) {
        return '<div class="k-row"><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>';
      })
      .join('') +
    '</dl></div>'
  );
}

function stationBriefingHTML() {
  const mode = getMode();
  const modeNote =
    mode === 'medium'
      ? inkNote(
          'amber',
          '<strong>Medium mode:</strong> work the stations in order — each objective gives context and a' +
            ' “where to look” cue, and hints are free (they only cost stars). Take your time; the desk is yours.'
        )
      : inkNote(
          'red',
          '<strong>Hard mode:</strong> every station is open and no one will point at the evidence. Two' +
            ' of the five October spikes were planned — find which. Validation is strict (exact IDs, exact' +
            ' amounts), you may spend at most one nudge, and near-misses get rejected with a reason.'
        );

  const glossary = GLOSSARY.map(function (g, i) {
    return (
      '<div class="acc-item">' +
      '<button class="acc-trigger" data-action="acc-toggle" aria-expanded="false" aria-controls="acc-p-' + i + '"' +
      ' id="acc-t-' + i + '">' + esc(g.term) + icon('ChevronDown', 'i4') + '</button>' +
      '<div class="acc-panel" id="acc-p-' + i + '" role="region" aria-labelledby="acc-t-' + i + '"><div>' +
      '<div class="acc-content">' + esc(g.def) + '</div></div></div></div>'
    );
  }).join('');

  return (
    '<div class="stack anim-station">' +
    ledgerPanel(
      'Case file C-1187 · opened Nov 1, 2026',
      'Scenario Briefing',
      '<div style="display:grid;gap:14px" class="lead-text">' +
        '<p>' + stampHTML('Training scenario', 'amber', 'mr') +
        '<strong class="t-ink">TrailGear Outfitters</strong> — a mid-size outdoor-gear retailer (fictional) — runs its e-commerce estate on' +
        ' <strong class="t-ink">SkyLoft Cloud</strong>. On Nov 1 the October invoice landed: <strong class="mono">$92,307.40</strong> against a forecast of' +
        ' <strong class="mono">$64,986.20</strong> — a <strong class="t-red">+42% overrun</strong>. The CFO convened the Cost Council and handed the case file to you, the newly' +
        ' appointed Cloud FinOps analyst.</p>' +
        '<p>A cloud bill is not just finance paperwork. In October it is also a <em>security sensor</em>: one' +
        ' of the spikes in this ledger is the classic billing signature of <strong>resource hijacking</strong> — attackers who rent your infrastructure to mine' +
        ' cryptocurrency get paid, and <em>you</em> get the invoice (MITRE ATT&amp;CK <strong>T1496 Resource Hijacking</strong>, tactic: Impact).</p>' +
        '<p>Your job, station by station: learn how the meter runs (billing models &amp; metering), mark up' +
        ' the invoice line by line, attribute every anomaly to an owner, build the controls that catch this' +
        ' before month-end, and write the remediation plan. Certification-wise this is' +
        ' <strong>CompTIA Cloud+ CV0-004 Objective 1.8</strong> — <em>summarize cost considerations related' +
        ' to cloud usage (billing models, resource metering, tagging, rightsizing)</em> — the exact skills' +
        ' the exam tests with scenario questions.</p>' +
        modeNote +
        '</div>'
    ) +
    ledgerPanel(
      'Knowledge core · objective 1.8',
      'How a cloud bill actually works',
      '<div class="knowledge-grid">' +
        knowledgeCardHTML('BadgeDollarSign', 'Billing models — what you commit to', [
          ['Pay-as-you-go (on-demand)', 'per unit, cancel anytime, highest rate — maximum flexibility'],
          ['Reserved capacity', 'commit 1–3 yrs to a size/family → big discount, billed even when idle'],
          ['Spot / reclaimable', 'spare capacity at ~70% off, reclaimable on short notice — interruptible work only'],
          ['Savings plan', 'commit to a $/hour of spend — the discount follows the money, not the machine'],
          ['Dedicated host', 'rent a whole physical server, single-tenant — billed whether you fill it or not'],
          ['BYOL / license-based', 'bring your own licenses, pay only the infrastructure rate'],
        ]) +
        knowledgeCardHTML('Gauge', 'Resource metering — what gets counted', [
          ['Compute', 'instance-hours (per-second billing, minimums apply)'],
          ['Storage', 'GB-month kept — deletion, not access, is what saves money'],
          ['Data transfer', 'egress (out) billed per GB · ingress (in) free'],
          ['Serverless', 'per request + duration'],
          ['Support', 'flat subscription — the only line that is not usage'],
        ]) +
        knowledgeCardHTML('Tags', 'Tagging — who pays for it', [
          ['Cost-allocation tags', 'key:value labels (dept, env, project) attached to resources'],
          ['Chargeback', 'costs are actually billed back to the owning team'],
          ['Showback', 'costs are reported for awareness — no actual billing'],
          ['Untagged spend', 'lands in an anonymous pool: invisible, unaccountable, unfixable'],
          ['Policy', 'mandatory tags (a tag policy) beat polite requests'],
        ]) +
        knowledgeCardHTML('Scale', 'Rightsizing — pay for what the workload needs', [
          ['Evidence first', 'utilization percentiles — p95 is the peak level (95% of samples stay below it), never gut feeling'],
          ['Bound resource', 'size follows what is actually full (CPU? memory?)'],
          ['Idle resources', 'zombie servers & orphaned snapshots: terminate + lifecycle rules'],
          ['Scheduling', 'non-prod fleets off nights/weekends'],
          ['Auto-scaling', 'structural rightsizing: capacity follows demand'],
        ]) +
        '</div>' +
        '<div class="sec-box">' +
        '<h4 class="sec-title">' + icon('ShieldAlert', 'i5') + 'The security angle: your bill as a detection sensor</h4>' +
        '<p class="sec-body">Cloud cost anomalies are a documented detection signal for' +
        ' <strong>MITRE ATT&amp;CK T1496 Resource Hijacking</strong> (tactic: Impact; platforms: IaaS,' +
        ' Containers, Linux, Windows, macOS, SaaS). Its sub-techniques:' +
        ' <strong>T1496.001 Compute Hijacking</strong> (cryptojacking), T1496.002 Bandwidth Hijacking,' +
        ' T1496.003 SMS Pumping, T1496.004 Cloud Service Hijacking. MITRE&#39;s detection analytic' +
        ' <strong>AN0744</strong> pairs &ldquo;sudden spikes in cloud VM CPU usage&rdquo; with outbound' +
        ' traffic to mining endpoints and unauthorized instance creation — exactly the pattern this' +
        ' incident will show you. Mitigation, honestly per MITRE: no simple preventive control exists' +
        ' because the abuse is of legitimate features — so the defense is guardrails + fast detection +' +
        ' fast response.</p>' +
        '<div class="sec-cards">' +
        '<div class="sec-card"><p class="sec-card-name">TeamTNT (G0139)</p>' +
        '<p class="sec-card-text">Targets cloud &amp; containerized environments since 2019; cryptojacking drove victims&#39; compute bills up.</p></div>' +
        '<div class="sec-card"><p class="sec-card-name">Kinsing (S0599)</p>' +
        '<p class="sec-card-text">Golang malware that runs a cryptocurrency miner and spreads itself across a victim environment.</p></div>' +
        '<div class="sec-card"><p class="sec-card-name">LABRAT (2023)</p>' +
        '<p class="sec-card-text">Cryptojacking <em>and</em> proxyjacking campaign (compute + bandwidth hijacking) targeting GitLab servers.</p></div>' +
        '</div>' +
        '<p class="sec-sourcing">Attribution and technique data verified against the official ATT&amp;CK pages (attack.mitre.org,' +
        ' fetched 2026-11-06). Simplified fictional rates elsewhere — always labeled.</p>' +
        '</div>'
    ) +
    ledgerPanel('Reference', 'Glossary — the desk dictionary', '<div class="acc">' + glossary + '</div>') +
    ledgerPanel(
      'Keep for the sign-off',
      'Official references',
      '<ul class="ref-list">' +
        '<li><a class="ref-link" href="https://attack.mitre.org/techniques/T1496/" target="_blank" rel="noopener noreferrer">' +
        icon('BookOpen', 'i4') + 'MITRE ATT&amp;CK T1496 — Resource Hijacking' + icon('ExternalLink', 'i4') + '</a></li>' +
        '<li><a class="ref-link" href="https://www.comptia.org/en-us/certifications/cloud" target="_blank" rel="noopener noreferrer">' +
        icon('BookOpen', 'i4') + 'CompTIA Cloud+ (CV0-004) — official exam objectives' + icon('ExternalLink', 'i4') + '</a></li>' +
        '</ul>'
    ) +
    nextStationButton('meters', 'To the price list & meters') +
    '</div>'
  );
}

/* ------------------------------ station 2 — meters ----------------------- */

const MODEL_CHOICES = [
  { id: 'ondemand', name: 'Pay-as-you-go (on-demand)' },
  { id: 'reserved', name: 'Reserved capacity' },
  { id: 'spot', name: 'Spot / reclaimable' },
  { id: 'byol', name: 'BYOL (license-based)' },
  { id: 'dedicatedhost', name: 'Dedicated host' },
];

function stationMetersHTML() {
  const mode = getMode();
  const env = state.env;

  let html =
    '<div class="stack anim-station">' +
    ledgerPanel(
      'Station 2 of 7',
      'Before you mark a single line: learn the meter',
      '<p class="lead-text">Every invoice line is <strong class="t-ink">metering × rate</strong>. The pricing sheet' +
        ' below (also in the Evidence Drawer) shows the four ways SkyLoft sells compute and the units each' +
        ' service is metered in. Price-ledger literacy comes first — the anomalies you will flag in Station 3' +
        ' only make sense once you know what the meter counts.</p>'
    );

  if (mode === 'medium') {
    const m1Body =
      '<div style="display:grid;gap:10px">' +
      PURCHASE_OPTIONS.map(function (o) {
        return (
          '<div class="opt-row"><div>' +
          '<p class="opt-name"><span class="opt">Option ' + o.id + '</span>' + esc(o.name) + '</p>' +
          '<p class="opt-blurb">' + esc(o.blurb) + '</p>' +
          '<p class="opt-rate">' + esc(o.rate) + ' · ' + esc(o.finePrint) + '</p></div>' +
          selectHTML('modelClassification.' + o.id, 'Billing model for Option ' + o.id, MODEL_CHOICES, env.modelClassification[o.id] || '', 'sm-fixed-56') +
          '</div>'
        );
      }).join('') +
      '</div>';
    html += objectiveCardHTML(objById('OBJ-M1'), m1Body, 'Pricing Sheet tab → Options A–E, fine print');

    const m2Body =
      '<div class="grid-sm-2-tight">' +
      METER_SERVICES.map(function (s) {
        return (
          '<div class="meter-card"><p class="meter-name">' + esc(s.name) + '</p>' +
          '<p class="meter-hint">' + esc(s.hint) + '</p>' +
          '<div style="margin-top:8px">' +
          selectHTML('meterMatches.' + s.id, 'Metering unit for ' + s.name, METER_UNITS, env.meterMatches[s.id] || '', '') +
          '</div></div>'
        );
      }).join('') +
      '</div>' +
      '<div style="margin-top:12px">' +
      inkNote('', 'Self-test while you match: the invoice has a <strong>Data Transfer IN</strong> line metered but' +
        ' billed <strong>$0.00</strong>. Same wire as egress, opposite direction, opposite price — hold that' +
        ' thought for Station 3.') +
      '</div>';
    html += objectiveCardHTML(objById('OBJ-M2'), m2Body, 'Pricing Sheet tab → rate notes; the invoice\'s $0.00 ingress line');
  }

  if (mode === 'hard') {
    html +=
      inkNote('red', '<strong>Hard:</strong> the same two tables exist in the drawer for a reason — the pricing sheet is' +
        ' the evidence base for the purchase-plan challenge later. Skim the instance size table now; you will' +
        ' need exact size IDs in the remediation plan.');
  }

  html +=
    evidenceDrawerHTML('pricing', ['pricing', 'memo']) +
    nextStationButton('invoice', 'To the invoice markup') +
    footChip() +
    '</div>';
  return html;
}

/* ------------------------------ station 3 — invoice ---------------------- */

const TRIAGE_SPIKES = [
  { id: 'gpu', name: 'GPU fleet (new line)', delta: '+$19,872.00' },
  { id: 'snapshots', name: 'Snapshot storage ×15.7', delta: '+$1,732.20' },
  { id: 'egress', name: 'Data transfer OUT ×21', delta: '+$4,220.60' },
  { id: 'campaign', name: 'Campaign burst fleet (new line)', delta: '+$204.80' },
  { id: 'support', name: 'Support plan upgrade', delta: '+$1,280.00' },
];

const EGRESS_CAUSE_OPTIONS = [
  { id: 'catalog', name: 'Catalog image traffic — customers downloading product photos' },
  { id: 'vaultsync', name: 'vault-sync initial full backup exported cross-region (CHG-4107)' },
  { id: 'cdn', name: 'A CDN misconfiguration serving video from origin' },
  { id: 'attack', name: 'Data exfiltration by an attacker' },
];

const EGRESS_RULE_OPTIONS = [
  { id: 'both-charged', name: 'Both ingress and egress are charged per GB' },
  { id: 'out-charged', name: 'Egress (data OUT) is charged; ingress (data IN) is free' },
  { id: 'in-charged', name: 'Ingress is charged; egress is free' },
  { id: 'night-cheap', name: 'Egress is cheaper during off-peak hours' },
];

const FIRE_DATE_OPTIONS = [
  { id: 'oct1', name: 'Oct 1 — the first of the month' },
  { id: 'oct2', name: 'Oct 2 — the fleet\'s first full day of burn' },
  { id: 'oct5', name: 'Oct 5 — the day the egress spike hit' },
  { id: 'oct31', name: 'Oct 31 — month-end close' },
];

const ROOT_CONTRIB_OPTIONS = [
  { id: 'gpu', label: 'Compute — GPU fleet (+$19,872.00)' },
  { id: 'egress', label: 'Data Transfer OUT (+$4,220.60)' },
  { id: 'snapshots', label: 'Snapshot Storage (+$1,732.20)' },
  { id: 'campaign', label: 'Campaign Burst Fleet (+$204.80)' },
  { id: 'support', label: 'Support Plan (+$1,280.00)' },
];

function invoiceTableHTML() {
  const env = state.env;
  const openRow = uiState.invoiceOpenRow;

  const rows = INVOICE.map(function (l) {
    const isOpen = openRow === l.id;
    const isFlagged = env.flagged.indexOf(l.id) !== -1;
    const delta = l.oct - l.forecast;
    const notable = Math.abs(delta) > 500;
    const expand =
      isOpen
        ? '<tr class="invoice-expand"><td colspan="7"><div class="invoice-expand-grid">' +
          '<div><p class="expand-metering">Metering: ' + esc(l.metering) + '</p>' +
          '<p class="expand-note">' + esc(l.note) + '</p></div>' +
          '<div class="bars-box"><p class="bars-label">Daily cost, Oct 1–31</p>' +
          miniBars(l.daily, notable ? 'red' : 'ink', 'Daily cost chart for ' + l.service + ': ' +
            (l.oct > 0 ? 'total $' + money(l.oct) : 'zero billed')) +
          '</div></div></td></tr>'
        : '';
    return (
      '<tr class="data-row' + (isOpen ? ' open' : '') + '">' +
      '<td><button class="icon-btn bordered' + (isFlagged ? ' flagged' : '') + '" data-action="toggle-flag" data-id="' + l.id + '"' +
      ' aria-pressed="' + isFlagged + '" aria-label="' + (isFlagged ? 'Unflag' : 'Flag') + ' line ' + esc(l.service) + '">' +
      icon(isFlagged ? 'Flag' : 'FlagOff', 'i4') + '</button></td>' +
      '<td><button class="service-btn" data-action="toggle-row" data-id="' + l.id + '" aria-expanded="' + isOpen + '">' +
      '<span class="service-name">' + esc(l.service) + '</span>' +
      '<span class="service-detail">' + esc(l.detail) + '</span></button></td>' +
      '<td class="amount muted">' + money(l.sep) + '</td>' +
      '<td class="amount bold">' + money(l.oct) + '</td>' +
      '<td class="amount muted">' + money(l.forecast) + '</td>' +
      '<td class="delta' + (notable ? ' notable' : '') + '">' + (delta >= 0 ? '+' : '−') + money(Math.abs(delta)) + '</td>' +
      '<td style="padding:8px 4px"><button class="icon-btn' + (isOpen ? ' open' : '') + '" data-action="toggle-row" data-id="' + l.id + '"' +
      ' aria-label="Toggle evidence for ' + esc(l.service) + '" style="' + (isOpen ? 'transform:rotate(180deg);' : '') + '">' +
      icon('ChevronDown', 'i4') + '</button></td>' +
      '</tr>' + expand
    );
  }).join('');

  return (
    '<div class="invoice-wrap"><table class="invoice-table"><thead><tr>' +
    '<th>Flag</th><th>Service</th><th class="num">Sep</th><th class="num">Oct</th><th class="num">Forecast</th>' +
    '<th class="num">Δ vs fc</th><th style="width:2rem"><span class="sr-only">Expand</span></th></tr></thead><tbody>' +
    rows +
    '<tr class="total-row"><td></td><td class="serif">Invoice total</td>' +
    '<td class="amount muted">' + money(INVOICE_TOTALS.sep) + '</td>' +
    '<td class="amount bold">' + money(INVOICE_TOTALS.oct) + '</td>' +
    '<td class="amount muted">' + money(INVOICE_TOTALS.forecast) + '</td>' +
    '<td class="delta notable">+' + money(INVOICE_TOTALS.oct - INVOICE_TOTALS.forecast) + '</td><td></td></tr>' +
    '</tbody></table></div>' +
    '<p class="flagged-note">Currently flagged: ' +
    (env.flagged.length === 0 ? 'none' : esc(env.flagged.join(', '))) +
    ' · October month-over-month: +' + money(INVOICE_TOTALS.oct - INVOICE_TOTALS.sep) + ' (+51.6%)</p>'
  );
}

function triageHTML() {
  const env = state.env;
  return (
    '<div style="display:grid;gap:8px">' +
    TRIAGE_SPIKES.map(function (s) {
      const v = env.spikeVerdicts[s.id] || '';
      return (
        '<div class="triage-row"><div>' +
        '<p class="triage-name">' + esc(s.name) + '</p>' +
        '<p class="triage-delta">' + esc(s.delta) + ' vs forecast</p></div>' +
        '<div class="triage-btns" role="group" aria-label="Verdict for ' + esc(s.name) + '">' +
        '<button class="triage-btn' + (v === 'anomaly' ? ' active-red' : '') + '" data-action="verdict" data-id="' + s.id +
        '" data-value="anomaly" aria-pressed="' + (v === 'anomaly') + '">' + stampHTML('True anomaly', 'red') + '</button>' +
        '<button class="triage-btn' + (v === 'expected' ? ' active-green' : '') + '" data-action="verdict" data-id="' + s.id +
        '" data-value="expected" aria-pressed="' + (v === 'expected') + '">' + stampHTML('Expected', 'green') + '</button>' +
        '</div></div>'
      );
    }).join('') +
    '</div>'
  );
}

function stationInvoiceHTML() {
  const mode = getMode();
  const env = state.env;

  let html =
    '<div class="stack anim-station">' +
    ledgerPanel(
      'Station 3 of 7',
      'The October invoice — SkyLoft Cloud account SKY-4471',
      '<p class="lead-text">Click a line to open its evidence (30-day daily bars + notes). Then' +
        ' <strong class="t-ink">FLAG</strong> the lines that are genuinely anomalous — moved' +
        ' without an approved business reason. The Change Log tab is your ground truth for' +
        ' &ldquo;approved&rdquo;.</p>' +
        invoiceTableHTML()
    );

  if (mode === 'medium') {
    html += objectiveCardHTML(
      objById('OBJ-M3'),
      inkNote('amber', 'Flag with your analyst judgment, then check. The Change Log distinguishes approved movement' +
        ' (tickets MKTG-889, FIN-220, CHG-4107…) from silent movement (&ldquo;no ticket&rdquo; entries).'),
      'The ledger above; Change Log tab for approvals'
    );

    html += objectiveCardHTML(objById('OBJ-M6'), triageHTML(), 'Triage board below + Change Log tab');

    const m10Body =
      '<div style="display:grid;gap:12px">' +
      '<div><label for="egress-cause" class="field-label">1 · What caused the October egress spike?</label>' +
      selectHTML('egressCause', 'What caused the October egress spike?', EGRESS_CAUSE_OPTIONS, env.egressCause, '') + '</div>' +
      '<div><label for="egress-rule" class="field-label">2 · Which metering rule explains why this costs money?</label>' +
      selectHTML('egressRule', 'Which metering rule explains why this costs money?', EGRESS_RULE_OPTIONS, env.egressRule, '') + '</div>' +
      '</div>';
    html += objectiveCardHTML(objById('OBJ-M10'), m10Body, 'Usage Report + Change Log tabs; the egress row above');

    const m12Body =
      '<div><label for="alert-fire-date" class="field-label">First date the &gt;$500 MTD new-line alert would have fired</label>' +
      selectHTML('alertFireDate', 'First date the >$500 MTD new-line alert would have fired', FIRE_DATE_OPTIONS, env.alertFireDate, 'sm-fixed-56') +
      '</div>';
    html += objectiveCardHTML(
      objById('OBJ-M12'),
      m12Body,
      'The GPU row in the ledger above (burn rate $662.40/day, created Oct 2) + Finance Memo directive 2'
    );
  }

  html += evidenceDrawerHTML('usage', null);

  if (mode === 'hard') {
    const env_ = state.env;
    const h1Body =
      '<div style="display:grid;gap:12px">' +
      '<p style="font-weight:600;color:var(--ink)">Select the three biggest contributors to the overrun (and only those):</p>' +
      '<div class="grid-sm-2-tight">' +
      ROOT_CONTRIB_OPTIONS.map(function (c) {
        const checked = env_.rootContribs.indexOf(c.id) !== -1;
        return (
          '<label class="check-row centered"><input type="checkbox" data-env-list="rootContribs" data-id="' + c.id + '"' +
          (checked ? ' checked' : '') + '>' + esc(c.label) + '</label>'
        );
      }).join('') +
      '</div>' +
      '<div><label for="root-overrun" class="field-label">Total overrun vs forecast (US$)</label>' +
      '<input class="input narrow" id="root-overrun" inputmode="decimal" data-env-input="rootOverrun" value="' + esc(env_.rootOverrun) +
      '" placeholder="October total − forecast total"></div>' +
      '</div>';
    html += objectiveCardHTML(objById('OBJ-H1'), h1Body, 'The ledger deltas above + Change Log approvals (rank by Δ vs forecast)');
  }

  html += nextStationButton('attribution', 'To attribution & tags') + footChip() + '</div>';
  return html;
}

/* ------------------------------ station 4 — attribution ------------------ */

function stationAttributionHTML() {
  const mode = getMode();
  const env = state.env;
  let html =
    '<div class="stack anim-station">' +
    ledgerPanel(
      'Station 4 of 7',
      'Every dollar needs a name',
      '<p class="lead-text">Anomalies found in Station 3 mean nothing until they have an <strong>owner</strong> — a team, an' +
        ' account, a ticket. This station attributes the untagged spend, applies the tag policy, and — in Hard' +
        ' mode — follows the security thread to its ATT&amp;CK technique and reconciles the one line Finance' +
        ' can actually dispute.</p>'
    );

  if (mode === 'medium') {
    const m4Body =
      '<div class="grid-sm-2">' +
      '<div><label for="untagged-count" class="field-label">How many resources are missing a dept tag?</label>' +
      '<input class="input" id="untagged-count" inputmode="numeric" data-env-input="untaggedCount" value="' + esc(env.untaggedCount) + '" placeholder="e.g. 12"></div>' +
      '<div><label for="untagged-team" class="field-label">Which team owns them (per the Change Log)?</label>' +
      selectHTML('untaggedTeam', 'Which team owns them (per the Change Log)?', UNTAGGED_TEAMS.filter(function (t) { return t.id; }), env.untaggedTeam, '') +
      '</div></div>';
    html += objectiveCardHTML(objById('OBJ-M4'), m4Body, 'Tag Audit + Change Log tabs (CHG-4112)');

    const applyDisabled = env.tagsApplied || !env.tagDept || !env.tagEnv;
    const m9Body =
      '<div class="grid-sm-2">' +
      '<div><label for="tag-dept" class="field-label">dept tag</label>' +
      selectHTML('tagDept', 'dept tag', [
        { id: 'growth-lab', name: 'growth-lab' },
        { id: 'platform', name: 'platform' },
        { id: 'finance', name: 'finance' },
        { id: 'security', name: 'security' },
      ], env.tagDept, '') + '</div>' +
      '<div><label for="tag-env" class="field-label">env tag</label>' +
      selectHTML('tagEnv', 'env tag', [
        { id: 'prod', name: 'prod' },
        { id: 'sandbox', name: 'sandbox' },
        { id: 'staging', name: 'staging' },
      ], env.tagEnv, '') + '</div></div>' +
      '<div style="margin-top:12px">' +
      '<button class="btn ' + (env.tagsApplied ? 'btn-green is-done' : 'btn-ink') + '" data-action="apply-tags"' +
      (applyDisabled ? ' disabled' : '') + '>' + icon('Stamp', 'i4') +
      (env.tagsApplied ? 'Tags applied to all 14 resources' : 'Apply tags to the 14 hack-* resources') + '</button>' +
      (!env.tagsApplied && (!env.tagDept || !env.tagEnv)
        ? '<p style="margin-top:6px;font-size:12px;color:var(--ink-mute)">Pick both tag values first.</p>'
        : '') +
      '</div>';
    html += objectiveCardHTML(objById('OBJ-M9'), m9Body, 'Finance Memo tab (directive 4) + Change Log');
  }

  if (mode === 'hard') {
    const ordered = env.responseOrder
      .map(function (id) { return RESPONSE_STEPS.find(function (s) { return s.id === id; }); })
      .filter(Boolean);
    const notYetOrdered = RESPONSE_STEPS.filter(function (s) { return env.responseOrder.indexOf(s.id) === -1; });

    let h2Body =
      '<div style="display:grid;gap:16px">' +
      '<div><label for="incident-id" class="field-label">Exact ATT&amp;CK sub-technique ID (format: T####.###)</label>' +
      '<input class="input narrow" id="incident-id" data-env-input="incidentId" value="' + esc(env.incidentId) + '" placeholder="T1496…"></div>' +
      '<div><p class="field-label" style="margin-bottom:6px">Order the response actions (first = top). Use the arrows.</p>' +
      '<ol style="display:grid;gap:6px;list-style:none">';
    h2Body += ordered
      .map(function (s, i) {
        return (
          '<li class="seq-row"><span class="seq-num">' + (i + 1) + '</span>' +
          '<span class="seq-label">' + esc(s.label) + '</span>' +
          '<span class="seq-btns">' +
          '<button class="icon-btn" data-action="seq-move" data-idx="' + i + '" data-dir="-1" aria-label="Move action ' + (i + 1) + ' up">' +
          icon('ArrowUp', 'i4') + '</button>' +
          '<button class="icon-btn" data-action="seq-move" data-idx="' + i + '" data-dir="1" aria-label="Move action ' + (i + 1) + ' down">' +
          icon('ArrowDown', 'i4') + '</button>' +
          '</span></li>'
        );
      })
      .join('');
    h2Body += '</ol>';
    if (notYetOrdered.length > 0) {
      h2Body +=
        '<div style="margin-top:8px;display:grid;gap:6px"><p class="ungrouped-label">Not yet sequenced:</p>' +
        notYetOrdered
          .map(function (s) {
            return (
              '<button class="ungrouped-btn" data-action="seq-add" data-id="' + s.id + '">+ ' + esc(s.label) + '</button>'
            );
          })
          .join('') +
        '</div>';
    }
    h2Body += '</div></div>';
    html += objectiveCardHTML(objById('OBJ-H2'), h2Body, 'Guardrail Metrics + Change Log tabs');

    const h6Body =
      '<div class="grid-sm-2">' +
      '<div><label for="cb-amount" class="field-label">October cost to charge back (US$)</label>' +
      '<input class="input" id="cb-amount" inputmode="decimal" data-env-input="chargebackAmount" value="' + esc(env.chargebackAmount) + '" placeholder="e.g. 512.40"></div>' +
      '<div><label for="cb-model" class="field-label">Financial model (per directive 4)</label>' +
      selectHTML('chargebackModel', 'Financial model (per directive 4)', [
        { id: 'chargeback', name: 'Chargeback — actually bill the team' },
        { id: 'showback', name: 'Showback — report only, no billing' },
      ], env.chargebackModel, '') + '</div></div>';
    html += objectiveCardHTML(objById('OBJ-H6'), h6Body, 'Tag Audit tab (sum the Oct cost column) + Finance Memo (directive 4)');

    const h9Body =
      '<div class="grid-sm-2">' +
      '<div><label for="rec-amount" class="field-label">Disputed amount (US$)</label>' +
      '<input class="input" id="rec-amount" inputmode="decimal" data-env-input="reconcileAmount" value="' + esc(env.reconcileAmount) + '" placeholder="billed − owed"></div>' +
      '<div><label for="rec-basis" class="field-label">Reconciliation basis</label>' +
      selectHTML('reconcileBasis', 'Reconciliation basis', [
        { id: 'proration', name: 'Proration period — billed days exceed active days' },
        { id: 'wrong-tier', name: 'Wrong tier — the upgrade never happened' },
        { id: 'double-bill', name: 'Double billing — two support plans charged at once' },
        { id: 'rate-error', name: 'Rate error — Business costs less than $60/day' },
      ], env.reconcileBasis, '') + '</div></div>' +
      '<div style="margin-top:12px">' +
      inkNote('', 'Reconciliation worksheet: Business tier bills <span class="mono">$60/day</span>.' +
        ' The invoice charged 31 days. FIN-220 says the tier went active <span class="mono">Oct 22</span>' +
        ' and the old Developer plan cancelled the same day — so it was billed for 21 extra days.') +
      '</div>';
    html += objectiveCardHTML(objById('OBJ-H9'), h9Body, 'Change Log (FIN-220, Oct 22) + Pricing Sheet support rates + the invoice row');
  }

  html += evidenceDrawerHTML('tags', null) +
    nextStationButton('controls', 'To controls & alerts') + footChip() + '</div>';
  return html;
}

/* ------------------------------ station 5 — controls --------------------- */

function stationControlsHTML() {
  const mode = getMode();
  const env = state.env;
  let html =
    '<div class="stack anim-station">' +
    ledgerPanel(
      'Station 5 of 7',
      'Make October impossible to repeat',
      '<p class="lead-text">Detection engineering for money: a <strong>budget</strong> with an alert that fires' +
        ' <em>before</em> the ceiling, and <strong>anomaly rules</strong> that catch a repeat of this month' +
        ' mid-flight — including the security routing, because an ownerless GPU fleet is an incident, not a' +
        ' rounding error.</p>'
    );

  if (mode === 'medium') {
    const m5Body =
      '<div class="grid-sm-2">' +
      '<div><label for="budget-cap" class="field-label">Monthly budget cap (US$)</label>' +
      '<input class="input" id="budget-cap" inputmode="numeric" data-env-input="budgetCap" value="' + esc(env.budgetCap) + '" placeholder="per the directive"></div>' +
      '<div><label for="budget-threshold" class="field-label">Alert threshold — 85% of cap (US$)</label>' +
      '<input class="input" id="budget-threshold" inputmode="numeric" data-env-input="budgetThreshold" value="' + esc(env.budgetThreshold) + '" placeholder="cap × 0.85"></div>' +
      '</div>' +
      '<div style="margin-top:12px">' +
      inkNote('amber', 'Why 85%? October&#39;s spend crossed its forecast mid-month. An alert at' +
        ' <span class="mono">$63,750</span> would have fired on <strong>Oct 22</strong>' +
        ' — nine days to act. An alert at 100% fires when the breach already happened.') +
      '</div>';
    html += objectiveCardHTML(objById('OBJ-M5'), m5Body, 'Finance Memo tab — directive 1');
  }

  if (mode === 'hard') {
    const ruleA =
      '<div class="rule-card"><div class="rule-head"><div>' +
      '<p class="rule-name">Rule A — new-line rule (absolute dollars)</p>' +
      '<p class="rule-desc">Any service line with NO prior-month history accruing more than $___ month-to-date.' +
      '<span class="rule-why">Why absolute? The GPU fleet started from a $0 baseline — percentage rules divide by zero.</span></p>' +
      '</div>' +
      '<button class="switch" role="switch" data-action="switch" data-env="alertRuleA" aria-checked="' + !!env.alertRuleA + '"' +
      ' aria-label="Toggle rule A"><span class="switch-thumb"></span></button></div>' +
      (env.alertRuleA
        ? '<input class="input narrow" style="margin-top:8px" aria-label="Rule A threshold in dollars" inputmode="numeric"' +
          ' data-env-input="alertAmtA" value="' + esc(env.alertAmtA) + '" placeholder="$ threshold, MTD">'
        : '') +
      '</div>';
    const ruleB =
      '<div class="rule-card"><div class="rule-head"><div>' +
      '<p class="rule-name">Rule B — established-line rule (percentage over baseline)</p>' +
      '<p class="rule-desc">Any established line whose single-day cost exceeds its trailing 30-day daily average' +
      ' by more than ___%.</p></div>' +
      '<button class="switch" role="switch" data-action="switch" data-env="alertRuleB" aria-checked="' + !!env.alertRuleB + '"' +
      ' aria-label="Toggle rule B"><span class="switch-thumb"></span></button></div>' +
      (env.alertRuleB
        ? '<input class="input narrow" style="margin-top:8px" aria-label="Rule B percentage threshold" inputmode="numeric"' +
          ' data-env-input="alertPctB" value="' + esc(env.alertPctB) + '" placeholder="% over 30-day avg">'
        : '') +
      '</div>';

    const h5Body =
      '<div style="display:grid;gap:16px">' +
      ruleA + ruleB +
      '<div class="grid-sm-2">' +
      '<div><label for="alert-freq" class="field-label">Evaluation cadence</label>' +
      selectHTML('alertFreq', 'Evaluation cadence', [
        { id: 'daily', name: 'Daily' },
        { id: 'weekly', name: 'Weekly' },
        { id: 'monthend', name: 'At month-end close' },
      ], env.alertFreq, '') + '</div>' +
      '<div><p class="field-label">Alert routes (select all)</p>' +
      '<div style="display:grid;gap:8px">' +
      '<label class="route-row"><input type="checkbox" data-env-list="alertRoutes" data-id="finops"' +
      (env.alertRoutes.indexOf('finops') !== -1 ? ' checked' : '') + '>FinOps channel (the cost council)</label>' +
      '<label class="route-row"><input type="checkbox" data-env-list="alertRoutes" data-id="security"' +
      (env.alertRoutes.indexOf('security') !== -1 ? ' checked' : '') + ">Security channel (S. Chen&#39;s SOC)</label>" +
      '</div></div></div></div>';
    html += objectiveCardHTML(objById('OBJ-H5'), h5Body, 'Finance Memo tab — directives 2 &amp; 3');
  }

  html +=
    '<div class="grid-md-2">' +
    '<div class="info-card"><h4 class="info-title">' + icon('Landmark', 'i5', 'class="amber-icon"') + 'What the budget does</h4>' +
    '<p class="info-body">A budget is a contract with Finance: a hard cap plus an early-warning line. It does not stop' +
    ' spend — clouds happily bill past any budget — but it converts a month-end surprise into a' +
    ' mid-month decision.</p></div>' +
    '<div class="info-card"><h4 class="info-title">' + icon('BellRing', 'i5', 'class="red-icon"') + 'What the anomaly rules do</h4>' +
    '<p class="info-body">Anomaly rules are the security sensor: MITRE&#39;s T1496 detection guidance expects cost spikes' +
    ' to be paired with guardrail metrics (flat 24/7 CPU, unknown endpoints, unauthorized instance' +
    ' creation). Routing to Security is what turns &ldquo;weird bill&rdquo; into &ldquo;live' +
    ' incident&rdquo;.</p></div>' +
    '</div>' +
    evidenceDrawerHTML('memo', ['memo', 'usage']) +
    nextStationButton('remediation', 'To the remediation plan') +
    footChip() +
    '</div>';
  return html;
}

/* ------------------------------ station 6 — remediation ------------------ */

const VERDICT_OPTIONS = [
  { id: 'downsize', name: 'Downsize (with evidence)' },
  { id: 'keep', name: 'Keep current size' },
  { id: 'terminate', name: 'Terminate — zombie resource' },
];

function stationRemediationHTML() {
  const mode = getMode();
  const env = state.env;
  let html =
    '<div class="stack anim-station">' +
    ledgerPanel(
      'Station 6 of 7',
      'The remediation plan — close every leak',
      '<p class="lead-text">Findings become fixes. Right-size on evidence, commit only steady load, expire what should not' +
        ' exist, and write the policy so this stays fixed. Every action below shows its monthly dollar effect' +
        ' — the language Finance understands.</p>'
    ) +
    ledgerPanel(
      'Inventory evidence',
      'Rightsizing candidates &amp; utilization',
      '<div class="grid-md-3">' +
        RSZ_CANDIDATES.map(function (r) {
          return (
            '<div class="rsz-card"><p class="rsz-name">' + esc(r.name) + '</p>' +
            '<p class="rsz-current">' + esc(r.current) + '</p>' +
            '<div class="rsz-chips"><span class="metric-chip">' + esc(r.cpu) + '</span>' +
            '<span class="metric-chip">' + esc(r.mem) + '</span></div>' +
            '<p class="rsz-note">' + esc(r.note) + '</p></div>'
          );
        }).join('') +
        '</div>'
    );

  if (mode === 'medium') {
    const dbOptions = SIZE_TABLE.filter(function (s) {
      return s.id.indexOf('db.r6') === 0;
    }).map(function (s) {
      return { id: s.id, name: s.id + ' — ' + s.spec + ' — $' + s.hourly.toFixed(2) + '/hr' };
    });
    const m7Body =
      '<div class="db-flex-row" style="display:flex;flex-direction:column;gap:12px">' +
      '<div style="flex:1"><label for="db-size" class="field-label">Target size for prod-postgres-01</label>' +
      selectHTML('dbSize', 'Target size for prod-postgres-01', dbOptions, env.dbSize, '') + '</div>' +
      (env.dbSize === 'db.r6.xlarge'
        ? inkNote('green', 'Projected: <span class="mono">$4,999.68 → $1,249.92/mo</span> — saves' +
            ' <strong>$3,749.76/mo (−75%)</strong> with every p95 peak under 30% of capacity.')
        : '') +
      '</div>';
    html += objectiveCardHTML(objById('OBJ-M7'), m7Body, 'Inventory above + Pricing Sheet size table');

    const riOk =
      env.reservedCount && Number(env.reservedCount.replace(/\D/g, '')) === 48 && env.reservedScope === 'webapp';
    const m8Body =
      '<div class="grid-sm-2">' +
      '<div><label for="ri-count" class="field-label">Reserved nodes to commit (1-yr Steady Commit)</label>' +
      '<input class="input" id="ri-count" inputmode="numeric" data-env-input="reservedCount" value="' + esc(env.reservedCount) + '" placeholder="how many nodes?"></div>' +
      '<div><label for="ri-scope" class="field-label">Scope of the commitment</label>' +
      selectHTML('reservedScope', 'Scope of the commitment', [
        { id: 'webapp', name: 'Prod Web/App fleet only' },
        { id: 'allcompute', name: 'All compute fleets (web + campaign + dev)' },
        { id: 'gpu', name: 'The GPU fleet' },
      ], env.reservedScope, '') + '</div></div>' +
      (riOk
        ? '<div style="margin-top:12px">' +
          inkNote('green', 'Projected: 48 × $0.876/hr × 744 h = <span class="mono">$31,283.71/mo</span> vs' +
            ' $52,139.52 on-demand — saves <strong>$20,855.81/mo (−40%)</strong>, and not one reserved' +
            ' dollar sits idle.') +
          '</div>'
        : '');
    html += objectiveCardHTML(objById('OBJ-M8'), m8Body, 'Invoice row 1 (steady baseline) + Pricing Sheet Option B');

    const m11Body =
      '<div style="display:grid;gap:12px">' +
      '<div class="snap-row"><div><p class="snap-name">Delete the orphaned Meridian snapshot set</p>' +
      '<p class="snap-desc">2,100 snapshots · 88,200 GB · <span class="mono">$1,852.20/mo</span> — the' +
      ' project was deleted Aug 12 (CHG-4021); nothing can restore to them.</p></div>' +
      '<button class="switch" role="switch" data-action="switch" data-env="snapDeleted" aria-checked="' + !!env.snapDeleted + '"' +
      ' aria-label="Delete the orphaned Meridian snapshot set"><span class="switch-thumb"></span></button></div>' +
      '<div class="snap-row"><div><p class="snap-name">Enable snapshot lifecycle policy</p>' +
      '<p class="snap-desc">Expire non-prod snapshots after 30 days; keep production backups per the retention' +
      ' policy (the recovery point objective — RPO — stays protected).</p></div>' +
      '<button class="switch" role="switch" data-action="switch" data-env="snapLifecycle" aria-checked="' + !!env.snapLifecycle + '"' +
      ' aria-label="Enable snapshot lifecycle policy"><span class="switch-thumb"></span></button></div>' +
      '<p class="footnote">' + icon('ArchiveX', 'i4') + 'Both switches = cleanup today + prevention tomorrow.</p>' +
      '</div>';
    html += objectiveCardHTML(objById('OBJ-M11'), m11Body, 'Invoice Snapshot Storage row + Change Log (CHG-4021)');
  }

  if (mode === 'hard') {
    const h3Body =
      '<div style="display:grid;gap:12px">' +
      FLEETS.map(function (f) {
        return (
          '<div class="fleet-card"><div class="fleet-head"><div>' +
          '<p class="fleet-name">' + esc(f.name) + '</p>' +
          '<p class="fleet-shape">' + esc(f.shape) + '</p></div>' +
          selectHTML('fleetPlans.' + f.id, 'Billing model for ' + f.name, FLEET_MODELS, env.fleetPlans[f.id] || '', 'sm-fixed-64') +
          '</div>' +
          (f.id === 'campaign' && env.fleetPlans['campaign']
            ? '<div style="margin-top:8px"><label for="campaign-just" class="field-label" style="font-size:13px">Justify the campaign fleet choice:</label>' +
              selectHTML('fleetJust.campaign', 'Justify the campaign fleet choice', CAMPAIGN_JUSTIFICATIONS, env.fleetJust['campaign'] || '', '') +
              '</div>'
            : '') +
          '</div>'
        );
      }).join('') +
      '</div>';
    html += objectiveCardHTML(objById('OBJ-H3'), h3Body, 'Inventory + invoice rows; Pricing Sheet options');

    const h4Body =
      '<div style="display:grid;gap:10px">' +
      RSZ_CANDIDATES.map(function (r) {
        return (
          '<div class="rsz-flex-row triage-row"><div style="min-width:0">' +
          '<p class="rsz-name">' + esc(r.name) + '</p>' +
          '<p class="rsz-current">' + esc(r.cpu) + ' · ' + esc(r.mem) + '</p></div>' +
          selectHTML('rszActions.' + r.id, 'Verdict for ' + r.name, VERDICT_OPTIONS, env.rszActions[r.id] || '', 'sm-fixed-72') +
          '</div>'
        );
      }).join('') +
      '<p class="footnote">' + icon('ShieldCheck', 'i4') + 'Rule of the desk: rightsizing follows the BINDING resource — a full-memory cache is not' +
      ' idle just because its CPU is quiet. One of the three must stay.</p>' +
      '</div>';
    html += objectiveCardHTML(objById('OBJ-H4'), h4Body, 'Inventory panel above — read WHICH resource is bound');

    const h7Body =
      '<div style="display:grid;gap:8px">' +
      '<p style="font-weight:600;color:var(--ink)">Select every control that actually reduces billed egress (and only those):</p>' +
      EGRESS_CONTROLS.map(function (c) {
        return (
          '<label class="check-row"><input type="checkbox" data-env-list="egressControls" data-id="' + c.id + '"' +
          (env.egressControls.indexOf(c.id) !== -1 ? ' checked' : '') + '>' + esc(c.label) + '</label>'
        );
      }).join('') +
      '</div>';
    html += objectiveCardHTML(objById('OBJ-H7'), h7Body, 'Pricing Sheet rate notes (egress $0.09/GB, no time discount)');

    const h8Body =
      '<div style="display:grid;gap:8px">' +
      '<p style="font-weight:600;color:var(--ink)">The CFO drafted a policy. Mark every FLAWED clause (leave sound clauses unmarked):</p>' +
      POLICY_CLAUSES.map(function (c) {
        return (
          '<label class="check-row"><input type="checkbox" data-env-list="policyFlaws" data-id="' + c.id + '"' +
          (env.policyFlaws.indexOf(c.id) !== -1 ? ' checked' : '') + '>' + esc(c.label) + '</label>'
        );
      }).join('') +
      '</div>';
    html += objectiveCardHTML(objById('OBJ-H8'), h8Body, 'Everything you fixed in Stations 3–6');
  }

  html +=
    '<div class="info-card"><h4 class="info-title">' + icon('CalendarClock', 'i5', 'class="amber-icon"') + 'Sequencing note (for the debrief)</h4>' +
    '<p class="info-body">Optimization has an order: stop the bleeding (security incident) → delete waste (snapshots, zombie' +
    ' resources) → right-size (evidence) → commit steady load (reserved) → automate prevention' +
    ' (lifecycle, tags, alerts, scheduling). Reversing the order means paying October&#39;s invoice' +
    ' again in November.</p></div>' +
    evidenceDrawerHTML('pricing', null) +
    nextStationButton('signoff', 'To the sign-off') +
    footChip() +
    '</div>';
  return html;
}

/* ------------------------------ station 7 — sign-off --------------------- */

function quizHTML() {
  const mode = getMode();
  const quiz = quizFor(mode);
  const items = quiz.map(function (q, qi) {
    const chosen = state.quizAnswers[q.id];
    const answered = Boolean(chosen);
    const correct = chosen === q.correct;
    const stamp = answered ? stampHTML(correct ? 'Correct' : 'Incorrect', correct ? 'green' : 'red', 'shrink-0') : '';
    const options = q.options
      .map(function (o) {
        let cls = 'quiz-option';
        if (chosen === o.id) cls += o.id === q.correct ? ' is-correct' : ' is-wrong';
        if (answered) cls += ' is-locked';
        return (
          '<label class="' + cls + '"><input type="radio" id="q-' + q.id + '-' + o.id + '" name="quiz-' + q.id + '"' +
          ' value="' + o.id + '"' + (chosen === o.id ? ' checked' : '') + (answered ? ' disabled' : '') +
          ' data-action="answer" data-qid="' + q.id + '" data-oid="' + o.id + '" aria-label="' + esc(o.text) + '">' +
          '<span>' + esc(o.text) + '</span></label>'
        );
      })
      .join('');
    return (
      '<li class="quiz-item"><div class="quiz-q-row">' +
      '<p class="quiz-q"><span class="qnum">Q' + (qi + 1) + '.</span>' + esc(q.prompt) + '</p>' + stamp + '</div>' +
      '<div class="quiz-grid" role="radiogroup" aria-label="Question ' + (qi + 1) + '">' + options + '</div>' +
      (answered
        ? '<div class="quiz-explain" aria-live="polite">' + inkNote(correct ? 'green' : 'red', esc(q.explanation)) + '</div>'
        : '') +
      '</li>'
    );
  }).join('');

  const answeredCount = Object.keys(state.quizAnswers).length;
  const remaining =
    answeredCount < quiz.length
      ? '<span class="quiz-remaining">' + (quiz.length - answeredCount) + ' item(s) left</span>'
      : '';

  return (
    ledgerPanel(
      'Station 7 of 7',
      'Knowledge Check — then we close the ledger',
      '<p class="lead-text">' +
        (mode === 'medium'
          ? 'Six concept questions. Answer each — the explanation appears immediately and counts toward your score once you submit.'
          : 'Seven scenario items. Each one is an application problem straight from the case file — answer, read the justification, then submit.') +
        ' First pass the audit stations (currently ' + summarize(state, mode).passed + '/' + summarize(state, mode).total +
        '); the completion seal unlocks when both are done.</p>'
    ) +
    ledgerPanel(
      'Knowledge check · ' + quiz.length + ' items',
      'Answer, then read the why',
      '<ol class="quiz-list">' + items + '</ol>' +
        '<div class="quiz-actions">' +
        '<button class="btn btn-ink" data-action="submit-quiz"' +
        (state.quizSubmitted || answeredCount < quiz.length ? ' disabled' : '') + '>' +
        icon('GraduationCap', 'i4') +
        (state.quizSubmitted
          ? 'Submitted — ' + summarize(state, mode).quizCorrect + '/' + summarize(state, mode).quizTotal + ' correct'
          : 'Submit knowledge check') +
        '</button>' + remaining + '</div>'
    )
  );
}

function debriefHTML() {
  return ledgerPanel(
    'Debrief · field notes',
    'What a defender walks away with',
    '<div class="debrief-grid">' +
      '<div class="debrief-card"><h4 class="debrief-title">Detection opportunities</h4>' +
      '<ul class="debrief-list">' +
      '<li><strong>Billing data</strong> — new-line rule (&gt;$500 MTD with no history) + % rule (&gt;120% over trailing 30-day daily average), evaluated daily, routed to FinOps <em>and</em> Security.</li>' +
      '<li><strong>Budget alerts</strong> — threshold at 85% of cap, weeks before month-end.</li>' +
      '<li><strong>Guardrail metrics</strong> — MITRE T1496 analytic AN0744: flat 24/7 CPU saturation + unknown external compute endpoints + unauthorized instance creation.</li>' +
      '<li><strong>Change-log correlation</strong> — a cost mover with no ticket is a finding; with a ticket it is explained variance.</li>' +
      '</ul></div>' +
      '<div class="debrief-card"><h4 class="debrief-title">Mitigation recommendations</h4>' +
      '<ul class="debrief-list">' +
      '<li><strong>Financial guardrails:</strong> budgets + anomaly alerts + mandatory tag policy (dept, env) + chargeback for experiments.</li>' +
      '<li><strong>Structural cost controls:</strong> reserved for steady baselines, spot for checkpointable bursts, scheduling for dev, rightsizing on p95 evidence, lifecycle rules for snapshots.</li>' +
      '<li><strong>Egress architecture:</strong> same-region targets, incremental-after-full, compression — billed GB is the lever.</li>' +
      '<li><strong>Identity hygiene:</strong> short-lived credentials for CI runners, rotation process, no standing keys.</li>' +
      '<li><strong>T1496 note (per MITRE):</strong> no simple preventive control exists — abuse of legitimate features; detection + response speed is the defense.</li>' +
      '</ul></div>' +
      '<div class="debrief-card"><h4 class="debrief-title iconed">' + icon('BadgeCheck', 'i5', 'class="green-icon"') + 'Blue-team takeaways</h4>' +
      '<ul class="debrief-list">' +
      '<li>Triangulate every anomaly: invoice ↔ usage report ↔ change log. One source lies; three rarely do.</li>' +
      '<li>Separate explained variance (approved movers) from true anomalies before escalating.</li>' +
      '<li>Cost telemetry is security telemetry: route it to the SOC.</li>' +
      '<li>Containment order for hijacked compute: credential → host → resources → guardrails.</li>' +
      '<li>Reconcile amounts even on legitimate changes (proration errors are real money: $1,260 here).</li>' +
      '</ul></div>' +
      '<div class="debrief-card"><h4 class="debrief-title iconed">' + icon('Swords', 'i5', 'class="red-icon"') + 'Red-team-mindset takeaways</h4>' +
      '<ul class="debrief-list">' +
      '<li>Every metered surface is attack surface: an attacker with a standing API key can turn your account into their revenue.</li>' +
      '<li>Cryptojacking (T1496.001) is designed to be invisible to users — flat 24/7 utilization is its silhouette; the bill is often the first alarm.</li>' +
      '<li>Defenders who ignore billing data give the attacker a free, noisy channel nobody reads.</li>' +
      '<li>Guardrails (new-line rules, spend caps) raise attacker cost and time, even when prevention is impossible.</li>' +
      '</ul></div>' +
      '</div>' +
      '<div class="debrief-links">' +
      '<a class="link-line" href="https://attack.mitre.org/techniques/T1496/" target="_blank" rel="noopener noreferrer">ATT&amp;CK T1496 — Resource Hijacking ' +
      icon('ExternalLink', 'i4') + '</a>' +
      '<a class="link-line" href="https://www.comptia.org/en-us/certifications/cloud" target="_blank" rel="noopener noreferrer">CompTIA Cloud+ CV0-004 objectives ' +
      icon('ExternalLink', 'i4') + '</a>' +
      '</div>'
  );
}

function stationSignoffHTML() {
  const mode = getMode();
  const summary = summarize(state, mode);
  const objs = objectivesFor(mode);
  const allPassed = objs.every(function (o) {
    return state.obj[o.id] && state.obj[o.id].passed;
  });
  const eligible = allPassed && state.quizSubmitted;

  const statusText = eligible
    ? 'All stations audited and the knowledge check is in. Open the completion seal to see your score, star rating and what to learn next.'
    : allPassed
      ? 'The audit stations are all passed — finish the knowledge check to unlock the completion seal.'
      : 'Audit progress: ' + summary.passed + '/' + summary.total +
        ' objectives. The completion seal opens when every objective is passed and the quiz is submitted.';

  return (
    '<div class="stack anim-station">' +
    quizHTML() +
    debriefHTML() +
    ledgerPanel(
      'Close the case',
      'Finish the audit',
      '<p style="font-size:14px;line-height:1.625;color:var(--ink-soft)">' + statusText + '</p>' +
        '<div class="finish-note">' + icon('ShieldAlert', 'i4', 'class="amber-icon"') +
        'Learn next: CV0-004 Objective 1.10 (optimizing workloads) and Domain 4 security monitoring — both build directly on today&#39;s desk.</div>' +
        '<div class="finish-actions">' +
        '<button class="btn btn-serif ' + (eligible ? 'btn-green' : 'btn-brass-disabled') + '" data-action="show-completion"' +
        (eligible ? '' : ' disabled') + '>' + icon('Stamp', 'i4') + 'Open the completion seal</button>' +
        (eligible ? '' : '<span class="unlock-hint">Pass every objective + submit the quiz to unlock.</span>') +
        '</div>' +
        '<p style="margin-top:16px;text-align:center">' + trainingChip() + '</p>'
    ) +
    '</div>'
  );
}

/* ------------------------------ completion seal -------------------------- */

function completionSealHTML() {
  const mode = getMode();
  const summary = summarize(state, mode);
  const objs = objectivesFor(mode);

  const pillarGroups = ['P1', 'P2', 'P3', 'P4'].map(function (p) {
    const items = objs.filter(function (o) { return o.pillar === p; });
    const passed = objs.filter(function (o) { return o.pillar === p && state.obj[o.id] && state.obj[o.id].passed; }).length;
    return { pillar: p, name: PILLAR_META[p].name, items: items, passed: passed };
  });

  const quiz = quizFor(mode);
  const wrongQuiz = quiz
    .map(function (q, i) { return { q: q, n: i + 1 }; })
    .filter(function (x) {
      return state.quizAnswers[x.q.id] !== undefined && state.quizAnswers[x.q.id] !== x.q.correct;
    });
  const retriedObjs = objs.filter(function (o) {
    return (state.obj[o.id] ? state.obj[o.id].attempts : 0) > 1;
  });
  const hintedObjs = objs.filter(function (o) {
    return (state.obj[o.id] ? state.obj[o.id].hintsUsed : 0) > 0;
  });
  const hasFocus = wrongQuiz.length > 0 || retriedObjs.length > 0 || hintedObjs.length > 0;

  const stars = [1, 2, 3, 4, 5]
    .map(function (i) {
      return icon(
        'Star',
        i <= summary.stars ? 'earned' : 'unearned'
      );
    })
    .join('');

  const nextSteps =
    mode === 'medium'
      ? [
          'Re-run this lab in Hard mode — no cues, strict validation, red herrings live.',
          'Study CV0-004 Objective 1.10 (optimizing workloads with cloud resources) — rightsizing generalizes there.',
          'Map the incident to the full T1496 entry on attack.mitre.org, including all four sub-techniques.',
        ]
      : [
          'Explain the whole case to a colleague in five minutes — root cause, attribution, controls, plan (the mastery test).',
          'Explore a real provider\u2019s billing console against this case file (Cost Explorer / Cost Management style tooling).',
          'Move on to CV0-004 Objective 1.10 and Domain 4 (security monitoring) — the cost-sensor mindset carries over.',
        ];

  let focusHTML;
  if (hasFocus) {
    focusHTML =
      '<ul class="seal-focus-list">' +
      wrongQuiz
        .map(function (x) {
          return (
            '<li>' + icon('ArrowRight', 'i4') + '<span><strong>Knowledge check Q' + x.n + ' (' + esc(x.q.topic) +
            ')</strong> was missed — re-read the ledger evidence for ' + esc(x.q.topic.toLowerCase()) +
            ' and retake that item mentally before the exam.</span></li>'
          );
        })
        .join('') +
      retriedObjs
        .map(function (o) {
          return (
            '<li>' + icon('ArrowRight', 'i4') + '<span><strong>' + o.id + '</strong> took ' +
            (state.obj[o.id] ? state.obj[o.id].attempts : 0) +
            ' checks — re-run it in the other mode without touching the evidence drawer.</span></li>'
          );
        })
        .join('') +
      hintedObjs
        .map(function (o) {
          return (
            '<li>' + icon('ArrowRight', 'i4') + '<span><strong>' + o.id +
            '</strong> used a hint — revisit “' + esc(o.anchor) + '” on your own and redo the step from the evidence alone.</span></li>'
          );
        })
        .join('') +
      '</ul>';
  } else {
    focusHTML =
      '<p style="font-size:14px;line-height:1.625;color:var(--ink-warm)">No weak spots found: every objective passed on the first check and the knowledge check came' +
      ' back fully correct. The next stretch is to explain the whole case to a colleague from memory.</p>';
  }

  return (
    '<div class="modal-pop">' +
    '<div class="seal-banner-row"><span class="seal-banner">' + icon('Award', 'i7') + 'Audit complete</span></div>' +
    '<h2 class="seal-title" id="seal-title">The October ledger is closed</h2>' +
    '<p class="seal-desc" id="completion-desc">TrailGear&#39;s invoice was decomposed, attributed and remediated. Here is how you did.</p>' +
    '<div class="seal-grid">' +
    '<div class="seal-box"><p class="seal-box-label">Final score</p>' +
    '<p class="seal-score">' + summary.points + ' / ' + summary.maxPoints + '</p>' +
    '<p class="seal-sub">' + summary.passed + '/' + summary.total + ' objectives · quiz ' + summary.quizCorrect + '/' + summary.quizTotal + '</p></div>' +
    '<div class="seal-box"><p class="seal-box-label">Star rating</p>' +
    '<div class="seal-stars" role="img" aria-label="' + summary.stars + ' of 5 stars">' + stars + '</div>' +
    '<p class="seal-stars-note">First-attempt accuracy: ' + Math.round(summary.firstAttemptRatio * 100) +
    '% · hints/nudges used: ' + summary.hintsUsed + '</p></div>' +
    '</div>' +
    '<div class="seal-pillars"><p class="seal-pillars-label">Objective recap by mastery pillar</p>' +
    '<ul>' +
    pillarGroups
      .map(function (g) {
        return (
          '<li class="seal-pillar-row"><span class="pillar-badge">' + g.pillar + '</span>' +
          '<span class="seal-pillar-name">' + esc(g.name) + '</span>' +
          '<span class="seal-pillar-count">' + g.passed + '/' + g.items.length + ' passed</span>' +
          '<span class="seal-pillar-ids">' +
          g.items.map(function (o) { return o.id.replace('OBJ-', ''); }).join(' ') +
          '</span></li>'
        );
      })
      .join('') +
    '</ul></div>' +
    '<div class="seal-section"><p class="seal-section-title">' + icon('Crosshair', 'i5', 'class="red-icon"') +
    'Focus areas — where to sharpen before the exam</p>' + focusHTML + '</div>' +
    '<div class="seal-section"><p class="seal-section-title">' + icon('BookOpenCheck', 'i5', 'class="amber-icon"') +
    'What to learn next</p>' +
    '<ul class="seal-focus-list seal-next-list">' +
    nextSteps.map(function (s) {
      return '<li>' + icon('ArrowRight', 'i4') + '<span>' + esc(s) + '</span></li>';
    }).join('') +
    '</ul></div>' +
    '<div class="seal-actions">' +
    '<button class="btn btn-outline t-ink" data-action="seal-revisit">Revisit the desk</button>' +
    '<button class="btn btn-green" data-action="seal-keep">' + icon('Award', 'i4') + 'Keep the seal on file</button>' +
    '</div></div>'
  );
}

/* ------------------------------ stage dispatcher ------------------------- */

function stationHTML(station) {
  switch (station) {
    case 'briefing': return stationBriefingHTML();
    case 'meters': return stationMetersHTML();
    case 'invoice': return stationInvoiceHTML();
    case 'attribution': return stationAttributionHTML();
    case 'controls': return stationControlsHTML();
    case 'remediation': return stationRemediationHTML();
    case 'signoff': return stationSignoffHTML();
    default: return stationBriefingHTML();
  }
}
