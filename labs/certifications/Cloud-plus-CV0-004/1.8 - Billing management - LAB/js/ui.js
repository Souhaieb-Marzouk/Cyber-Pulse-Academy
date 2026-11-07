/* ==========================================================================
   js/ui.js — shared view layer (static port of ui-bits + chrome components)
   --------------------------------------------------------------------------
   Small HTML-template functions replacing the original React components:
   stamps, badges, ledger panels, ink notes, the objective card, the masthead,
   station rail, objectives tracker, mode gate and the evidence drawer.
   Rendering is string-based; app.js owns events and focus restoration.
   ========================================================================== */

'use strict';

/* ------------------------------ primitives ------------------------------ */

function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Inline lucide SVG (exact path data from js/icons.js). cls sizes it. */
function icon(name, cls, extra) {
  return (
    '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor"' +
    ' stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' +
    (extra ? ' ' + extra : '') + '>' + ICONS[name] + '</svg>'
  );
}

function stampHTML(text, tone, className) {
  return '<span class="stamp stamp-' + tone + (className ? ' ' + className : '') + '">' + esc(text) + '</span>';
}

function pillarBadge(pillar) {
  const meta = PILLAR_META[pillar];
  return (
    '<span class="pillar-badge" title="' + esc(meta ? meta.name : pillar) + '">' +
    esc(meta ? meta.short : pillar) + '</span>'
  );
}

function trainingChip() {
  return '<span class="chip">Synthetic training data</span>';
}

function ledgerPanel(kicker, title, bodyHTML) {
  return (
    '<section class="panel">' +
    '<header class="panel-hd">' +
    (kicker ? '<p class="panel-kicker">' + esc(kicker) + '</p>' : '') +
    '<h3 class="panel-title">' + esc(title) + '</h3>' +
    '</header>' +
    '<div class="panel-bd">' + bodyHTML + '</div>' +
    '</section>'
  );
}

function inkNote(tone, bodyHTML) {
  return '<div class="note' + (tone && tone !== 'plain' ? ' note-' + tone : '') + '">' + bodyHTML + '</div>';
}

/** Daily-cost mini bar chart (deterministic SVG, same geometry as original). */
function miniBars(daily, tone, label) {
  const fill =
    tone === 'red' ? '#A62219' : tone === 'green' ? '#1B6B33' : tone === 'amber' ? '#8A5A00' : '#5F584C';
  const max = Math.max.apply(null, daily.concat([0.01]));
  let bars = '';
  daily.forEach((v, i) => {
    const h = Math.max((v / max) * 40, v > 0 ? 2 : 0.5);
    bars +=
      '<rect x="' + i * 10 + '" y="' + (43 - h).toFixed(2) + '" width="8" height="' + h.toFixed(2) +
      '" fill="' + fill + '" opacity="' + (v > 0 ? '0.9' : '0.25') + '"></rect>';
  });
  return (
    '<svg class="minibars" role="img" aria-label="' + esc(label) + '" viewBox="0 0 310 44" preserveAspectRatio="none">' +
    '<line x1="0" y1="43" x2="310" y2="43" stroke="#D9CCAE" stroke-width="1"></line>' +
    bars +
    '<text x="0" y="8" font-size="7" fill="#6E6355">Oct 1</text>' +
    '<text x="284" y="8" font-size="7" fill="#6E6355">Oct 31</text>' +
    '</svg>'
  );
}

/* ------------------------------ objective card --------------------------- */

/**
 * The C4 workhorse: objective header + interactive body + check/hint footer.
 * bodyHTML is produced by the station renderers; whereToLook is the Medium
 * "where to look" cue (hidden in Hard mode and once passed, as in original).
 */
function objectiveCardHTML(obj, bodyHTML, whereToLook) {
  const mode = getMode();
  const st = state.obj[obj.id];
  const passed = Boolean(st && st.passed);
  const maxHints = mode === 'hard' ? 1 : obj.hints.length;
  const revealedHints = Math.min(st ? st.hintsUsed : 0, maxHints);
  const lastResult = uiState.lastResult[obj.id] || null;
  const showExtra = revealedHints > 0 || Boolean(lastResult);

  // Animate the reveal only when its content actually changed (the original's
  // AnimatePresence animates on appear, not on unrelated re-renders).
  const extraKey = revealedHints + ':' + (lastResult || '');
  const needsAnim = showExtra && uiState._extraKeys[obj.id] !== extraKey;
  if (showExtra) uiState._extraKeys[obj.id] = extraKey;
  else delete uiState._extraKeys[obj.id];

  let hintsHTML = '';
  if (revealedHints > 0) {
    hintsHTML =
      '<ol class="hint-list" aria-label="Revealed hints">' +
      obj.hints
        .slice(0, revealedHints)
        .map((h, i) => '<li><span class="hint-num">H' + (i + 1) + '</span><span>' + esc(h) + '</span></li>')
        .join('') +
      '</ol>';
  }

  let resultHTML = '';
  if (lastResult === 'pass') {
    resultHTML =
      '<div aria-live="polite" role="status">' +
      inkNote('green', '<strong class="t-green">Pass — </strong>' + esc(obj.passFeedback)) +
      '</div>';
  } else if (lastResult === 'fail') {
    resultHTML =
      '<div aria-live="polite" role="status">' +
      inkNote('red', '<strong class="t-red">Not yet — </strong>' + esc(obj.failFeedback)) +
      '</div>';
  }

  const whereHTML =
    whereToLook && mode === 'medium' && !passed
      ? '<p class="where-look">' + icon('Lightbulb', 'i4') + 'Where to look: ' + esc(whereToLook) + '</p>'
      : '';

  const checkBtn = passed
    ? '<button id="check-' + esc(obj.id) + '" class="btn btn-ink is-done" data-action="noop" disabled>' +
      icon('Check', 'i4') + 'Objective passed</button>'
    : '<button id="check-' + esc(obj.id) + '" class="btn btn-ink" data-action="check" data-obj="' + esc(obj.id) + '">Check results</button>';

  const hintBtn =
    !passed && revealedHints < maxHints
      ? '<button id="hint-' + esc(obj.id) + '" class="btn btn-outline" data-action="hint" data-obj="' + esc(obj.id) + '" aria-label="' +
        (mode === 'hard'
          ? 'Spend the single nudge (costs star quality)'
          : 'Reveal hint level ' + (revealedHints + 1) + ' of ' + maxHints) +
        '">' +
        icon('Lightbulb', 'i4') +
        (mode === 'hard' ? 'Spend a nudge (−star quality)' : 'Hint ' + (revealedHints + 1) + '/' + maxHints) +
        '</button>'
      : '';

  const counts =
    '<span class="obj-count">attempts: ' + (st ? st.attempts : 0) +
    (st && st.hintsUsed > 0 ? ' · hints: ' + st.hintsUsed : '') + '</span>';

  return (
    '<article id="obj-' + esc(obj.id) + '" aria-labelledby="obj-' + esc(obj.id) + '-title"' +
    ' class="obj-card' + (passed ? ' passed' : '') + '">' +
    '<header class="obj-hd"><div style="min-width:0;flex:1 1 0%">' +
    '<div class="obj-meta-row">' +
    pillarBadge(obj.pillar) +
    '<span class="obj-id">' + esc(obj.id) + '</span>' +
    (passed ? stampHTML('Checked ✓', 'green') : '') +
    '</div>' +
    '<h4 id="obj-' + esc(obj.id) + '-title" class="obj-title">' + esc(obj.title) + '</h4>' +
    '<p class="obj-context">' + esc(obj.context) + '</p>' +
    whereHTML +
    '</div></header>' +
    '<div class="obj-bd">' + bodyHTML + '</div>' +
    '<footer class="obj-ft">' + checkBtn + hintBtn + counts + '</footer>' +
    (showExtra
      ? '<div class="obj-extra' + (needsAnim ? '' : ' open') + '" data-anim="' + (needsAnim ? '1' : '') + '">' +
        '<div><div class="obj-extra-inner">' + hintsHTML + resultHTML + '</div></div></div>'
      : '') +
    '</article>'
  );
}

/* ------------------------------ mode gate ------------------------------- */

function modeGateHTML() {
  return (
    '<div class="gate">' +
    '<div class="anim-gate w-full">' +
    '<p class="gate-kicker">CompTIA Cloud+ CV0-004 · Objective 1.8 · Lesson 1.8: Billing management</p>' +
    '<h1 class="gate-title">The Billing Audit Desk</h1>' +
    '<p class="gate-lead">TrailGear Outfitters&#39; October cloud invoice just landed <strong>+42% over forecast</strong>.' +
    ' You are the FinOps analyst on the Cost Council: audit the ledger line by line, attribute every anomaly,' +
    ' and close the leaks — before Finance closes on you.</p>' +
    '<div class="gate-chip-row">' + trainingChip() + '</div>' +
    '</div>' +
    '<div class="gate-grid">' +
    '<button class="gate-card gate-card-medium anim-gate anim-delay-1" data-action="set-mode" data-mode="medium"' +
    ' aria-label="Choose Medium mode: guided learning">' +
    '<div class="gate-card-head">' +
    '<span class="gate-card-icon">' + icon('BookOpenCheck', 'i6') + '</span>' +
    '<div><h2 class="gate-card-title">Medium</h2>' +
    '<p class="gate-card-sub">Guided learning · understand &amp; learn</p></div></div>' +
    '<ul class="gate-list">' +
    '<li>' + icon('FileSpreadsheet', 'i4') + '<span>12 granular objectives introduced in audit order, each with “where to look” cues</span></li>' +
    '<li>' + icon('Timer', 'i4') + '<span>Up to 3-tier hints per objective — they cost a few stars, never progress</span></li>' +
    '<li>' + icon('ShieldCheck', 'i4') + '<span>Tolerant checking: wrong answers teach, nothing is locked</span></li>' +
    '</ul>' +
    '<p class="gate-cta">Start the guided audit →</p>' +
    '</button>' +
    '<button class="gate-card gate-card-hard anim-gate anim-delay-2" data-action="set-mode" data-mode="hard"' +
    ' aria-label="Choose Hard mode: challenge">' +
    '<div class="gate-card-head">' +
    '<span class="gate-card-icon">' + icon('ShieldCheck', 'i6') + '</span>' +
    '<div><h2 class="gate-card-title">Hard</h2>' +
    '<p class="gate-card-sub">Challenge · test &amp; stretch</p></div></div>' +
    '<ul class="gate-list">' +
    '<li>' + icon('FileSpreadsheet', 'i4') + '<span>9 broad multi-step challenges across the full case file — root-cause, attribute, decide</span></li>' +
    '<li>' + icon('Timer', 'i4') + '<span>No cues, all stations open at once — two spikes in the ledger are red herrings</span></li>' +
    '<li>' + icon('ShieldCheck', 'i4') + '<span>Strict validation: exact IDs and amounts; one paid nudge; near-misses are rejected with a rationale</span></li>' +
    '</ul>' +
    '<p class="gate-cta">Take the case file →</p>' +
    '</button>' +
    '</div>' +
    '<p class="gate-foot">100% educational simulation. All organizations, invoices, people and metrics are fictional training' +
    ' data; security framing follows MITRE ATT&amp;CK T1496 (Resource Hijacking). Your progress auto-saves to this browser.</p>' +
    '</div>'
  );
}

/* ------------------------------ masthead -------------------------------- */

function mastheadHTML() {
  const mode = getMode();
  const summary = summarize(state, mode);
  const nudge =
    summary.hintsUsed > 0
      ? '<span title="Hints/nudges used reduce the final star rating">nudges: ' + summary.hintsUsed + '</span>'
      : '';
  return (
    '<header class="masthead"><div class="masthead-in">' +
    '<div class="masthead-row">' +
    '<div class="masthead-main">' +
    '<div class="masthead-kicker-row">' +
    stampHTML('Cost Council', 'ink') +
    '<span class="masthead-kicker">' + esc(ORG) + ' · ' + esc(PROVIDER) + ' · ' + esc(BILLING_PERIOD) + '</span>' +
    '</div>' +
    '<h1 class="masthead-title">The Billing Audit Desk' +
    '<span class="masthead-mode">CV0-004 · 1.8 Billing management · ' + (mode === 'medium' ? 'Medium' : 'Hard') + ' mode</span>' +
    '</h1></div>' +
    '<div class="masthead-tools">' +
    '<div class="progress-wrap" role="status" aria-label="Progress: ' + summary.passed + ' of ' + summary.total +
    ' objectives passed. Score ' + summary.points + ' of ' + summary.maxPoints + ' points.">' +
    '<div class="progress-label"><span>' + icon('Sigma', 'i4') +
    summary.passed + '/' + summary.total + ' objectives · ' + summary.points + '/' + summary.maxPoints + ' pts</span>' +
    nudge + '</div>' +
    '<div class="progress" aria-hidden="true"><i style="width:' +
    Math.round((summary.passed / summary.total) * 100) + '%"></i></div>' +
    '</div>' +
    '<button class="btn btn-outline" data-action="open-reset" aria-label="Reset the lab to pristine state">' +
    icon('RotateCcw', 'i4') + '<span class="reset-label">Reset</span></button>' +
    '</div></div>' +
    '<div class="masthead-foot">' + trainingChip() +
    '<span class="autosave-note">progress auto-saves in this browser</span></div>' +
    '</div></header>'
  );
}

/* ------------------------------ station rail ---------------------------- */

function stationRailHTML() {
  const mode = getMode();
  const objs = objectivesFor(mode);
  const items = STATIONS.map((s, i) => {
    const mine = objs.filter((o) => o.station === s.id);
    const count = mine.filter((o) => state.obj[o.id] && state.obj[o.id].passed).length;
    const total = mine.length;
    const active = state.station === s.id;
    const visited = state.visited.includes(s.id);
    const done = total > 0 && count === total;
    const sub = total > 0 && mode === 'medium' ? count + '/' + total + ' objectives' : s.kicker;
    return (
      '<li><button class="station-btn ' + (active ? 'active' : visited ? 'visited' : 'unvisited') + '"' +
      ' data-action="set-station" data-station="' + s.id + '"' + (active ? ' aria-current="true"' : '') + '>' +
      '<span class="station-num' + (done ? ' done' : '') + '">' + (done ? icon('Check', 'i4') : i + 1) + '</span>' +
      '<span class="station-text"><span class="station-name">' + esc(s.title) + '</span>' +
      '<span class="station-sub">' + esc(sub) + '</span></span></button></li>'
    );
  }).join('');
  return '<nav class="rail" aria-label="Audit stations"><ol>' + items + '</ol></nav>';
}

/* ------------------------------ objectives tracker ---------------------- */

function trackerHTML() {
  const mode = getMode();
  const objs = objectivesFor(mode);
  const items = objs.map((o) => {
    const st = state.obj[o.id];
    const station = STATIONS.find((s) => s.id === o.station);
    const passed = Boolean(st && st.passed);
    return (
      '<li><button class="tracker-item' + (passed ? ' passed' : '') + '" data-action="set-station" data-station="' +
      o.station + '" aria-label="' + o.id + (passed ? ' (passed)' : '') + ' — go to ' + esc(station ? station.title : o.station) + '">' +
      '<span class="tracker-dot">' + (passed ? icon('Check', 'i3') : icon('CircleDashed', 'i3', 'style="opacity:0"')) + '</span>' +
      '<span style="min-width:0">' +
      '<span class="tracker-id-row">' + pillarBadge(o.pillar) +
      '<span class="obj-id">' + esc(o.id) + '</span></span>' +
      '<span class="tracker-title">' + esc(o.title) + '</span>' +
      '<span class="tracker-station">' + esc(station ? station.title : '') + '</span>' +
      '</span></button></li>'
    );
  }).join('');
  const passedCount = objs.filter((o) => state.obj[o.id] && state.obj[o.id].passed).length;
  return (
    '<aside class="tracker" aria-label="Objectives tracker">' +
    '<h2 class="tracker-head">' + icon('ListChecks', 'i5') + 'Audit objectives' +
    '<span class="tracker-count">' + passedCount + '/' + objs.length + '</span></h2>' +
    '<ol class="tracker-list">' + items + '</ol></aside>'
  );
}

/* ------------------------------ evidence drawer -------------------------- */

const DRAWER_TABS = [
  { id: 'usage', label: 'Usage Report', icon: 'ReceiptText' },
  { id: 'tags', label: 'Tag Audit', icon: 'Tag' },
  { id: 'changelog', label: 'Change Log', icon: 'FileClock' },
  { id: 'guardrail', label: 'Guardrail Metrics', icon: 'ScanEye' },
  { id: 'pricing', label: 'Pricing Sheet', icon: 'Landmark' },
  { id: 'memo', label: 'Finance Memo', icon: 'FileText' },
];

function drawerBody(title, inner) {
  return (
    '<div class="drawer-bd"><div class="drawer-hd">' +
    '<h4 class="drawer-title">' + esc(title) + '</h4>' + trainingChip() + '</div>' +
    '<div class="drawer-scroll">' + inner + '</div></div>'
  );
}

function drawerTabContent(tab) {
  switch (tab) {
    case 'usage':
      return drawerBody(
        'Detailed usage report — metered records (excerpt)',
        '<div class="data-table-wrap"><table class="data-table"><thead><tr>' +
          '<th>Timestamp</th><th>Resource</th><th>Meter</th><th>Qty</th><th class="num">Cost</th></tr></thead><tbody>' +
          USAGE_ROWS.map(function (r) {
            return (
              '<tr><td>' + esc(r.ts) + '</td><td>' + esc(r.resource) + '</td><td>' + esc(r.meter) +
              '</td><td>' + esc(r.qty) + '</td><td class="num">' + esc(r.cost) + '</td></tr>'
            );
          }).join('') +
          '</tbody></table></div>'
      );
    case 'tags':
      return drawerBody(
        'Tag audit — resources missing cost-allocation tags',
        '<div class="data-table-wrap"><table class="data-table"><thead><tr>' +
          '<th>Resource</th><th>Type</th><th>Created</th><th>dept</th><th>env</th><th class="num">Oct cost</th></tr></thead><tbody>' +
          TAG_AUDIT.map(function (r) {
            return (
              '<tr><td class="strong">' + esc(r.resource) + '</td><td>' + esc(r.type) + '</td><td>' + esc(r.created) +
              '</td><td class="missing">' + esc(r.dept) + '</td><td class="missing">' + esc(r.env) +
              '</td><td class="num">$' + money(r.octCost) + '</td></tr>'
            );
          }).join('') +
          '<tr class="total-row"><td colspan="5">14 untagged resources — October total</td>' +
          '<td class="num">$' + money(TAG_AUDIT_TOTAL) + '</td></tr>' +
          '</tbody></table></div>'
      );
    case 'changelog':
      return drawerBody(
        'Change log &amp; tickets — who deployed what, when',
        '<ol style="display:grid;gap:10px;list-style:none">' +
          CHANGE_LOG.map(function (c) {
            const pill =
              c.tag === 'security' ? 'security' : c.tag === 'marketing' || c.tag === 'finance' ? c.tag : '';
            return (
              '<li class="entry-card"><div class="entry-meta">' +
              '<span class="entry-date">' + esc(c.date) + '</span><span>' + esc(c.ticket) + '</span>' +
              '<span class="tag-pill ' + pill + '">' + esc(c.tag) + '</span></div>' +
              '<p class="entry-text"><span class="actor">' + esc(c.actor) + ':</span> ' + esc(c.text) + '</p></li>'
            );
          }).join('') +
          '</ol>'
      );
    case 'guardrail':
      return drawerBody(
        'Guardrail metrics — GPU fleet (Oct 2 → present)',
        '<ul style="display:grid;gap:8px;list-style:none">' +
          GUARDRAIL.map(function (g) {
            return (
              '<li class="guardrail-item' + (g.severity === 'high' ? ' high' : '') + '">' +
              '<div class="guardrail-head"><span class="guardrail-label">' + esc(g.label) + '</span>' +
              '<span class="guardrail-value">' + esc(g.value) + '</span></div>' +
              '<p class="guardrail-note">' + esc(g.note) + '</p></li>'
            );
          }).join('') +
          '</ul>'
      );
    case 'pricing':
      return drawerBody(
        'SkyLoft Cloud pricing sheet (synthetic, simplified)',
        '<div style="display:grid;gap:10px">' +
          PURCHASE_OPTIONS.map(function (o) {
            return (
              '<div class="entry-card"><div class="price-head-row">' +
              '<span class="price-name"><span class="opt">Option ' + o.id + '</span>' + esc(o.name) + '</span>' +
              '<span class="price-rate">' + esc(o.rate) + '</span></div>' +
              '<p class="price-blurb">' + esc(o.blurb) + '</p>' +
              '<p class="price-fine">Fine print: ' + esc(o.finePrint) + '</p></div>'
            );
          }).join('') +
          '<div class="entry-card"><p class="subheading">Instance size table</p>' +
          '<div class="data-table-wrap"><table class="data-table size-table"><thead><tr>' +
          '<th>Size</th><th>Spec</th><th class="num">On-demand $/hr</th></tr></thead><tbody>' +
          SIZE_TABLE.map(function (s) {
            return (
              '<tr><td class="strong">' + esc(s.id) + '</td><td>' + esc(s.spec) +
              '</td><td class="num">' + s.hourly.toFixed(2) + '</td></tr>'
            );
          }).join('') +
          '</tbody></table></div></div>' +
          '<ul class="rate-notes">' +
          '<li>' + esc(RATE_NOTES.objectStorage) + '</li>' +
          '<li>' + esc(RATE_NOTES.egress) + '</li>' +
          '<li>' + esc(RATE_NOTES.ingress) + '</li>' +
          '<li>' + esc(RATE_NOTES.snapshots) + '</li>' +
          '<li>Support: Developer $580/mo flat · Business $60/day flat</li>' +
          '</ul></div>'
      );
    case 'memo':
      return drawerBody(
        'CFO memo — finance directives (M. Okafor, Nov 1)',
        '<ol style="display:grid;gap:8px;list-style:none">' +
          CFO_MEMO.map(function (d) {
            return '<li class="memo-item">' + esc(d) + '</li>';
          }).join('') +
          '</ol>'
      );
    default:
      return '';
  }
}

function evidenceDrawerHTML(defaultTab, available) {
  const shown = available ? DRAWER_TABS.filter(function (t) { return available.indexOf(t.id) !== -1; }) : DRAWER_TABS;
  const active = uiState.drawerTab || defaultTab;
  return (
    '<section class="drawer" aria-label="Evidence drawer" id="evidence-drawer">' +
    '<div class="drawer-tabs" role="tablist" aria-label="Evidence drawer tabs">' +
    shown.map(function (t) {
      return (
        '<button class="tab" role="tab" id="tab-' + t.id + '" data-action="drawer-tab" data-tab="' + t.id + '"' +
        ' aria-selected="' + (t.id === active ? 'true' : 'false') + '" tabindex="' + (t.id === active ? '0' : '-1') + '">' +
        icon(t.icon, 'i4') + esc(t.label) + '</button>'
      );
    }).join('') +
    '</div>' +
    '<div role="tabpanel" aria-labelledby="tab-' + active + '">' + drawerTabContent(active) + '</div>' +
    '</section>'
  );
}

/* ------------------------------ next-station button --------------------- */

function nextStationButton(target, label) {
  if (state.mode !== 'medium') return '';
  return (
    '<div style="margin-top:24px;display:flex;justify-content:flex-end">' +
    '<button class="btn btn-plain btn-serif" data-action="set-station" data-station="' + target + '">' +
    esc(label) + icon('ChevronDown', 'i4') + '</button></div>'
  );
}

function footChip() {
  return '<p class="station-foot-note">' + trainingChip() + '</p>';
}

/* selection helper for native selects (placeholder option included) */
function selectHTML(id, label, options, value, fixedClass) {
  const opts = options
    .map(function (o) {
      return '<option value="' + esc(o.id) + '"' + (value === o.id ? ' selected' : '') + '>' + esc(o.name) + '</option>';
    })
    .join('');
  return (
    '<span class="select ' + (fixedClass || '') + '">' +
    '<select id="' + esc(id) + '" data-env="' + esc(id) + '" aria-label="' + esc(label) + '"' +
    (value ? '' : ' class="empty"') + '>' +
    '<option value="" disabled' + (value ? '' : ' selected') + '>' + esc(SELECT_PLACEHOLDERS[id] || 'Select…') + '</option>' +
    opts +
    '</select>' +
    '<span class="select-chevron">' + icon('ChevronDown', 'i4') + '</span></span>'
  );
}

const SELECT_PLACEHOLDERS = {
  'modelClassification.A': 'Assign billing model',
  'modelClassification.B': 'Assign billing model',
  'modelClassification.C': 'Assign billing model',
  'modelClassification.D': 'Assign billing model',
  'modelClassification.E': 'Assign billing model',
  'meterMatches.svc-compute': 'Select metering unit',
  'meterMatches.svc-object': 'Select metering unit',
  'meterMatches.svc-egress': 'Select metering unit',
  'meterMatches.svc-serverless': 'Select metering unit',
  'meterMatches.svc-support': 'Select metering unit',
  egressCause: 'Select the cause from the evidence',
  egressRule: 'Select the metering rule',
  alertFireDate: 'Stamp the date from the evidence',
  untaggedTeam: 'Select the owning team',
  tagDept: 'select dept',
  tagEnv: 'select env',
  cbModel: 'select model',
  chargebackModel: 'select model',
  reconcileBasis: 'select basis',
  alertFreq: 'select cadence',
  dbSize: 'select new size',
  reservedScope: 'select scope',
  'fleetPlans.webapp': 'assign model',
  'fleetPlans.campaign': 'assign model',
  'fleetPlans.dev': 'assign model',
  campaignJust: 'select the deciding property',
  'fleetJust.campaign': 'select the deciding property',
  'rszActions.prod-postgres-01': 'verdict',
  'rszActions.cache-memcached-01': 'verdict',
  'rszActions.build-runner-03': 'verdict',
};
