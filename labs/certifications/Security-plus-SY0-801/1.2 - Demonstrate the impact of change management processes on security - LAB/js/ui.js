/* ===================================================================
   ui.js — Rendering functions for all lab sections
   ===================================================================
   Each function returns an HTML string. The app.js module handles
   event delegation and wires up interactions.
   =================================================================== */

/* ----- Helper: escape HTML ----- */
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

/* ----- Helper: pillar badge ----- */
function pillarBadge(pillar) {
  var m = PILLAR_META[pillar];
  return '<span class="objective-pillar" style="color:' + m.color + ';border-color:' + m.border + ';background:' + m.bg + '">' + m.label + '</span>';
}

/* ===================================================================
   MODE SELECTION SCREEN
   =================================================================== */
function renderModeSelect() {
  return '<div class="mode-select">' +
    '<div style="text-align:center;margin-bottom:1.5rem;">' +
      '<div class="mode-seal">' + icon('stamp', 28) + '</div>' +
      '<h1 class="mode-title">Change Authority Bureau</h1>' +
      '<p class="mode-subtitle">CompTIA Security+ SY0-801 · Lesson 1.2</p>' +
      '<p class="mode-detail">Demonstrate the impact of change management processes on security</p>' +
    '</div>' +
    '<div class="mode-cards">' +
      '<button class="mode-card medium" data-action="select-mode" data-mode="medium">' +
        '<span class="mode-card-badge">MEDIUM · learn</span>' +
        '<h2>Guided Practice</h2>' +
        '<p class="mode-card-desc">Build understanding step by step.</p>' +
        '<ul>' +
          '<li>12 granular objectives, introduced in order</li>' +
          '<li>Tiered hints available (nudge → direction → demonstration)</li>' +
          '<li>Tolerant validation; every check explains WHY</li>' +
          '<li>7 concept-check questions with explanations</li>' +
          '<li>Best for: first encounter with the material</li>' +
        '</ul>' +
      '</button>' +
      '<button class="mode-card hard" data-action="select-mode" data-mode="hard">' +
        '<span class="mode-card-badge">HARD · challenge</span>' +
        '<h2>Discovery Triage</h2>' +
        '<p class="mode-card-desc">Test yourself against noisy evidence.</p>' +
        '<ul>' +
          '<li>9 broad, multi-step challenges</li>' +
          '<li>No "where to look"; hints disabled by default</li>' +
          '<li>Strict validation; near-misses rejected with rationale</li>' +
          '<li>8 scenario-based questions requiring analysis</li>' +
          '<li>Best for: confirming mastery before the exam</li>' +
        '</ul>' +
      '</button>' +
    '</div>' +
    '<p class="mode-disclaimer">Fictional training scenario. All organizations, persons, tickets, and data are synthetic.</p>' +
  '</div>';
}

/* ===================================================================
   BUREAU HEADER (sticky)
   =================================================================== */
function renderHeader() {
  var mode = state.selectedMode;
  var completed = getCompletedCount(mode);
  var total = getTotalCount(mode);
  var allDone = completed === total && state.quizRecords[mode].submitted;
  var stars = allDone ? computeStars(mode) : 0;

  var resetHtml = uiState.confirmReset
    ? '<button class="btn btn-danger btn-sm" data-action="confirm-reset">Confirm</button>' +
      '<button class="btn btn-outline btn-sm" data-action="cancel-reset">Cancel</button>'
    : '<button class="btn btn-outline btn-sm" data-action="reset">' + icon('rotate-ccw', 12) + ' Reset</button>';

  return '<header class="bureau-header">' +
    '<div class="bureau-header-inner">' +
      '<div class="header-seal">' + icon('stamp', 16) + '</div>' +
      '<div style="flex:1;min-width:0;">' +
        '<h1 class="header-title">Change Authority Bureau</h1>' +
        '<p class="header-sub">SY0-801 · L1.2 · ' + mode + '</p>' +
      '</div>' +
      '<div class="header-stats">' +
        '<div style="text-align:right;"><div class="header-stat-label">Progress</div><div class="header-stat-val">' + completed + '/' + total + '</div></div>' +
        (allDone ? '<div style="text-align:right;"><div class="header-stat-label">Rating</div><div class="header-stat-val">★ ' + stars + '</div></div>' : '') +
      '</div>' +
      '<div style="display:flex;gap:0.25rem;flex-shrink:0;">' + resetHtml + '</div>' +
    '</div>' +
  '</header>';
}

/* ===================================================================
   BRIEFING (C1)
   =================================================================== */
function renderBriefing() {
  return '<section id="briefing">' +
    '<div class="section-header"><div class="bar"></div><h2>Scenario Briefing</h2></div>' +
    '<div class="card">' +
      '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;">' +
        icon('building-2', 16) +
        '<span style="font-family:var(--font-serif);font-size:1rem;">' + esc(SCENARIO_ORG.name) + '</span>' +
        '<span class="stamp-badge bronze">' + esc(SCENARIO_ORG.tagline) + '</span>' +
      '</div>' +
      '<p style="font-size:0.75rem;color:rgba(245,235,216,0.75);line-height:1.5;">' + esc(SCENARIO_ORG.context) + '</p>' +
      '<hr class="separator">' +
      '<div style="display:grid;grid-template-columns:1fr;gap:0.75rem;">' +
        '<div style="border:1px solid rgba(124,92,46,0.3);border-radius:var(--radius-sm);padding:0.625rem;background:rgba(15,26,46,0.4);">' +
          '<div style="display:flex;align-items:center;gap:0.375rem;margin-bottom:0.25rem;">' + icon('alert-triangle', 14) + '<span class="header-stat-label">The incident</span></div>' +
          '<p style="font-size:0.7rem;color:rgba(245,235,216,0.8);line-height:1.3;">A 6-hour patient-portal outage traced to an undocumented firewall change. The CISO stood up the Change Authority Bureau.</p>' +
        '</div>' +
        '<div style="border:1px solid rgba(124,92,46,0.3);border-radius:var(--radius-sm);padding:0.625rem;background:rgba(15,26,46,0.4);">' +
          '<div style="display:flex;align-items:center;gap:0.375rem;margin-bottom:0.25rem;">' + icon('lock', 14) + '<span class="header-stat-label">Why it matters</span></div>' +
          '<p style="font-size:0.7rem;color:rgba(245,235,216,0.8);line-height:1.3;">HIPAA and PCI-DSS both require controlled change processes. Unmanaged changes are the #1 cause of unplanned security regressions.</p>' +
        '</div>' +
        '<div style="border:1px solid rgba(124,92,46,0.3);border-radius:var(--radius-sm);padding:0.625rem;background:rgba(15,26,46,0.4);">' +
          '<div style="display:flex;align-items:center;gap:0.375rem;margin-bottom:0.25rem;">' + icon('book-open', 14) + '<span class="header-stat-label">On the exam</span></div>' +
          '<p style="font-size:0.7rem;color:rgba(245,235,216,0.8);line-height:1.3;">SY0-801 Domain 1.2 expects you to demonstrate how planning, testing, approvals, and documentation maintain secure environments.</p>' +
        '</div>' +
      '</div>' +
    '</div>' +
  '</section>';
}

/* ===================================================================
   KNOWLEDGE CORE (C2)
   =================================================================== */
function renderKnowledgeCore() {
  var pillarCards = FOUR_PILLARS.map(function(p) {
    return '<div class="pillar-card">' +
      '<div class="pillar-card-header">' +
        '<div class="pillar-icon" style="background:' + p.color + '20;border:1px solid ' + p.color + '60;">' + icon(p.icon, 16) + '</div>' +
        '<h3 style="color:' + p.color + ';">' + p.title + '</h3>' +
      '</div>' +
      '<p class="pillar-body">' + p.body + '</p>' +
      '<div class="pillar-tags">' + p.points.map(function(pt) {
        return '<span class="pillar-tag" style="color:' + p.color + ';border-color:' + p.color + '50;background:' + p.color + '10;">' + esc(pt) + '</span>';
      }).join('') + '</div>' +
    '</div>';
  }).join('');

  var changeTypes = CHANGE_TYPES.map(function(c) {
    return '<div class="change-type-card" style="border-color:' + c.tone + '50;background:' + c.tone + '10;">' +
      '<div class="change-type-label" style="color:' + c.tone + ';">' + c.label + '</div>' +
      '<p class="change-type-desc">' + c.desc + '</p>' +
    '</div>';
  }).join('');

  var lifecycle = PROCESS_STEPS_LIFECYCLE.map(function(step, i, arr) {
    return '<span class="lifecycle-step">' + step + '</span>' + (i < arr.length - 1 ? '<span class="lifecycle-arrow">▸</span>' : '');
  }).join('');

  var failures = REAL_WORLD_EXAMPLES.map(function(e) {
    return '<div class="failure-example">' +
      '<div class="failure-example-header">' +
        '<span class="failure-example-org">' + esc(e.org) + '</span>' +
        '<span class="failure-example-incident">' + esc(e.incident) + '</span>' +
      '</div>' +
      '<p class="failure-example-cause">' + esc(e.cause) + '</p>' +
    '</div>';
  }).join('');

  var glossaryItems = GLOSSARY.map(function(g) {
    return '<div class="glossary-item"><span class="glossary-term">' + esc(g.term) + '</span> — <span style="color:rgba(245,235,216,0.75);">' + esc(g.def) + '</span></div>';
  }).join('');

  return '<section id="knowledge">' +
    '<div class="section-header"><div class="bar"></div><h2>Knowledge Core</h2></div>' +
    '<p class="section-intro">The four pillars of change management — the spine of Lesson 1.2. Read each before opening the Bureau Console.</p>' +
    '<div class="pillar-cards">' + pillarCards + '</div>' +
    '<div class="card" style="margin-top:0.75rem;">' +
      '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;">' + icon('git-branch', 16) + '<h3 style="font-family:var(--font-serif);font-size:0.85rem;">Three change types</h3></div>' +
      '<div class="change-types">' + changeTypes + '</div>' +
    '</div>' +
    '<div class="card" style="margin-top:0.75rem;">' +
      '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;">' + icon('activity', 16) + '<h3 style="font-family:var(--font-serif);font-size:0.85rem;">The change lifecycle</h3></div>' +
      '<div class="lifecycle">' + lifecycle + '</div>' +
    '</div>' +
    '<div class="card" style="margin-top:0.75rem;">' +
      '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;">' + icon('users', 16) + '<h3 style="font-family:var(--font-serif);font-size:0.85rem;">Roles &amp; the segregation-of-duties rule</h3></div>' +
      '<p style="font-size:0.7rem;color:rgba(245,235,216,0.75);line-height:1.4;margin-bottom:0.5rem;">Three roles must be held by different people: the <span style="color:var(--seal-amber-light);">requester</span> (proposes the change), the <span style="color:var(--seal-amber-light);">approver</span> (CAB or ECAB member), and the <span style="color:var(--seal-amber-light);">implementer</span> (executes the change). When one person holds two or more of these roles, the independent review that the CAB exists to provide is gone.</p>' +
      '<div class="roles-grid">' +
        '<div class="role-cell"><div class="role-label">Requester</div><div class="role-action">proposes</div></div>' +
        '<div class="role-cell"><div class="role-label">CAB / ECAB</div><div class="role-action">approves</div></div>' +
        '<div class="role-cell"><div class="role-label">Implementer</div><div class="role-action">executes</div></div>' +
      '</div>' +
    '</div>' +
    '<div class="card" style="margin-top:0.75rem;">' +
      '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;">' + icon('alert-triangle', 16) + '<h3 style="font-family:var(--font-serif);font-size:0.85rem;">Real-world failure patterns</h3></div>' +
      '<p style="font-size:0.65rem;color:rgba(245,235,216,0.5);font-style:italic;margin-bottom:0.5rem;">Composite illustrative cases — patterns drawn from public post-mortems, anonymized.</p>' +
      failures +
    '</div>' +
    '<div class="card" style="margin-top:0.75rem;">' +
      '<button class="glossary-toggle ' + (uiState.glossaryOpen ? 'open' : '') + '" data-action="toggle-glossary">' +
        '<div style="display:flex;align-items:center;gap:0.5rem;">' + icon('book-open', 16) + '<h3 style="font-family:var(--font-serif);font-size:0.85rem;">Glossary (' + GLOSSARY.length + ' terms)</h3></div>' +
        icon('chevron-right', 16) +
      '</button>' +
      (uiState.glossaryOpen ? '<div class="glossary-list">' + glossaryItems + '</div>' : '') +
    '</div>' +
  '</section>';
}

/* ===================================================================
   BUREAU CONSOLE — ENVIRONMENT (C3)
   =================================================================== */
var TAB_ICONS = { triage: 'clipboard-check', workflow: 'activity', forensics: 'search', compliance: 'file-text', decision: 'gavel' };

function renderEnvironment() {
  var tabs = ['triage', 'workflow', 'forensics', 'compliance', 'decision'].map(function(t) {
    return '<button class="tab ' + (uiState.activeTab === t ? 'active' : '') + '" data-action="switch-tab" data-tab="' + t + '">' + icon(TAB_ICONS[t], 16) + '<span>' + t.charAt(0).toUpperCase() + t.slice(1) + '</span></button>';
  }).join('');

  var panel = '';
  if (uiState.activeTab === 'triage') panel = renderTriageStation();
  else if (uiState.activeTab === 'workflow') panel = renderWorkflowStation();
  else if (uiState.activeTab === 'forensics') panel = renderForensicsStation();
  else if (uiState.activeTab === 'compliance') panel = renderComplianceStation();
  else if (uiState.activeTab === 'decision') panel = renderDecisionStation();

  return '<section id="environment">' +
    '<div class="section-header"><div class="bar"></div><h2>The Bureau Console</h2></div>' +
    '<p class="section-intro">Five stations. Each station contains the evidence and controls you need to complete specific objectives. Open the Objectives Tracker to see which station each objective lives in.</p>' +
    '<div class="tabs-list">' + tabs + '</div>' +
    '<div class="tab-panel">' + panel + '</div>' +
  '</section>';
}

function stationHeader(ic, title, desc) {
  return '<div class="station-header">' +
    '<div class="station-icon">' + icon(ic, 20) + '</div>' +
    '<div><div class="station-title">' + title + '</div><div class="station-desc">' + desc + '</div></div>' +
  '</div>';
}

/* ----- Station 1: TRIAGE (RFC Triage + Incident Triage) ----- */
function renderTriageStation() {
  var env = state.env;
  var riskTone = { low: 'sage', medium: 'amber', high: 'crimson' };

  var tickets = RFC_TICKETS.map(function(t) {
    var cls = env.rfcClassifications[t.id] || '';
    var appr = env.rfcApprovals[t.id] || '';
    var missing = env.rfcMissingFields[t.id] || '';

    var classSelect = '<select data-action="set-classification" data-rfc="' + t.id + '"><option value="">— select —</option><option value="standard"' + (cls === 'standard' ? ' selected' : '') + '>Standard</option><option value="normal"' + (cls === 'normal' ? ' selected' : '') + '>Normal</option><option value="emergency"' + (cls === 'emergency' ? ' selected' : '') + '>Emergency</option></select>';
    var apprSelect = '<select data-action="set-approval" data-rfc="' + t.id + '"><option value="">— select —</option><option value="pre-approved"' + (appr === 'pre-approved' ? ' selected' : '') + '>Pre-approved</option><option value="cab"' + (appr === 'cab' ? ' selected' : '') + '>CAB</option><option value="ecab"' + (appr === 'ecab' ? ' selected' : '') + '>ECAB</option></select>';

    var missingHtml = '';
    if (t.missingField) {
      var opts = RFC_FIELDS.map(function(f) { return '<option value="' + f.id + '"' + (missing === f.id ? ' selected' : '') + '>' + esc(f.label) + '</option>'; }).join('');
      missingHtml = '<div style="margin-top:0.75rem;padding-top:0.75rem;border-top:1px solid rgba(124,92,46,0.2);">' +
        '<label class="lbl" style="color:var(--crimson);">⚠ Missing-field inspector (OBJ-M3)</label>' +
        '<select data-action="set-missing-field" data-rfc="' + t.id + '"><option value="">Which required field is missing?</option>' + opts + '</select>' +
      '</div>';
    }

    return '<div class="rfc-ticket">' +
      '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.5rem;">' +
        '<div style="min-width:0;flex:1;">' +
          '<div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">' +
            '<span class="rfc-id">' + t.id + '</span>' +
            '<span class="stamp-badge ' + riskTone[t.risk] + '">' + t.risk + ' risk</span>' +
          '</div>' +
          '<h4 class="rfc-title">' + esc(t.title) + '</h4>' +
        '</div>' +
      '</div>' +
      '<p class="rfc-summary">' + esc(t.summary) + '</p>' +
      '<div class="rfc-meta"><span style="font-family:var(--font-mono);">Requester:</span> ' + esc(t.requester) + ' &nbsp;•&nbsp; <span style="font-family:var(--font-mono);">System:</span> ' + esc(t.system) + ' &nbsp;•&nbsp; <span style="font-family:var(--font-mono);">Blast radius:</span> ' + esc(t.blastRadius) + '</div>' +
      '<div class="rfc-fields">' +
        '<div><label class="lbl">Classification</label>' + classSelect + '</div>' +
        '<div><label class="lbl">Approval body</label>' + apprSelect + '</div>' +
      '</div>' +
      missingHtml +
    '</div>';
  }).join('');

  /* Incident Triage */
  var incidentChecks = INCIDENT_FAILURE_OPTIONS.map(function(opt) {
    var checked = env.incidentFailures.indexOf(opt.id) !== -1;
    return '<label class="check-row ' + (checked ? 'checked-amber' : 'unchecked') + '" data-action="toggle-incident" data-id="' + opt.id + '">' +
      '<span class="check-box"></span>' +
      '<span class="check-label">' + esc(opt.label) + '</span>' +
    '</label>';
  }).join('');

  return '<div style="display:flex;flex-direction:column;gap:1.5rem;">' +
    '<div class="parchment">' +
      stationHeader('clipboard-check', 'RFC Triage Board', 'Classify each Request for Change and route it to the correct approval body.') +
      tickets +
    '</div>' +
    '<div class="parchment">' +
      stationHeader('alert-triangle', 'Incident Triage', 'Read the incident report and identify the change-management failure(s).') +
      '<div style="border:1px solid rgba(185,28,28,0.3);border-radius:var(--radius-sm);padding:0.75rem;background:rgba(185,28,28,0.05);margin-bottom:0.75rem;">' +
        '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.25rem;"><span style="font-family:var(--font-mono);font-size:0.7rem;color:var(--crimson);">' + INCIDENT_REPORT.id + '</span><span class="stamp-badge crimson">incident</span></div>' +
        '<h4 style="font-family:var(--font-serif);font-size:0.95rem;color:var(--text-ink);">' + esc(INCIDENT_REPORT.title) + '</h4>' +
        '<p style="font-size:0.7rem;color:rgba(26,20,16,0.8);margin-top:0.5rem;line-height:1.4;">' + esc(INCIDENT_REPORT.summary) + '</p>' +
      '</div>' +
      '<label class="lbl" style="margin-bottom:0.5rem;">Identify the change-management failure(s) — select all that apply</label>' +
      '<div style="display:grid;grid-template-columns:1fr;gap:0.5rem;">' +
        '<div style="display:contents;">' + incidentChecks + '</div>' +
      '</div>' +
      '<p style="font-size:0.65rem;color:var(--bronze);margin-top:0.5rem;font-style:italic;">Medium OBJ-M4: select exactly ONE (the single step whose absence caused the outage). Hard OBJ-H1: select exactly THREE.</p>' +
    '</div>' +
  '</div>';
}

/* ----- Station 2: WORKFLOW (Process Sequencer + Rollback Builder) ----- */
function renderSequencer(poolItems, placedIds, addAction, removeAction, moveAction) {
  var remaining = poolItems.filter(function(s) { return placedIds.indexOf(s.id) === -1; });
  var pool = remaining.map(function(s) {
    return '<button class="seq-pool-item" data-action="' + addAction + '" data-id="' + s.id + '">' +
      icon('plus', 14) +
      '<div><div class="seq-pool-label">' + esc(s.label) + '</div><div class="seq-pool-desc">' + esc(s.desc) + '</div></div>' +
    '</button>';
  }).join('');

  var placed = placedIds.map(function(id, idx) {
    var step = poolItems.filter(function(s) { return s.id === id; })[0];
    if (!step) return '';
    return '<div class="seq-placed">' +
      '<span class="seq-num">' + (idx + 1) + '</span>' +
      '<div style="flex:1;min-width:0;"><div class="seq-placed-label">' + esc(step.label) + '</div></div>' +
      '<div class="seq-controls">' +
        '<button data-action="' + moveAction + '" data-id="' + id + '" data-dir="-1"' + (idx === 0 ? ' disabled' : '') + '>' + icon('arrow-up', 12) + '</button>' +
        '<button data-action="' + moveAction + '" data-id="' + id + '" data-dir="1"' + (idx === placedIds.length - 1 ? ' disabled' : '') + '>' + icon('arrow-down', 12) + '</button>' +
      '</div>' +
      '<button class="seq-remove" data-action="' + removeAction + '" data-id="' + id + '">' + icon('x', 14) + '</button>' +
    '</div>';
  }).join('');

  return '<div class="sequencer">' +
    '<div><label class="lbl" style="margin-bottom:0.5rem;">Available steps</label>' +
      '<div style="min-height:200px;">' + (pool || '<div class="seq-empty">All steps placed.</div>') + '</div>' +
    '</div>' +
    '<div><label class="lbl" style="margin-bottom:0.5rem;">Your sequence</label>' +
      '<div style="min-height:200px;">' + (placed || '<div class="seq-empty">Click steps on the left to build your sequence.</div>') + '</div>' +
    '</div>' +
  '</div>';
}

function renderWorkflowStation() {
  return '<div style="display:flex;flex-direction:column;gap:1.5rem;">' +
    '<div class="parchment">' +
      stationHeader('activity', 'Process Sequencer', 'Arrange the 8 change-management process steps in the correct order.') +
      renderSequencer(PROCESS_STEPS, state.env.processOrder, 'add-process', 'remove-process', 'move-process') +
    '</div>' +
    '<div class="parchment">' +
      stationHeader('wrench', 'Rollback Plan Builder', 'Build a rollback plan for a failed firewall rule change. Select only actual rollback steps, in the correct order.') +
      renderSequencer(ROLLBACK_STEPS, state.env.rollbackOrder, 'add-rollback', 'remove-rollback', 'move-rollback') +
    '</div>' +
  '</div>';
}

/* ----- Station 3: FORENSICS (Drift Inspector + Audit Trail) ----- */
function renderForensicsStation() {
  var env = state.env;

  /* Drift Inspector */
  var baselineHtml = BASELINE_RULES.map(function(r) {
    return '<div class="rule-display"><div class="rule-line"><span class="action" style="color:var(--text-ink);">' + r.action + '</span><span>' + r.src + '</span>' + icon('arrow-right', 12) + '<span>' + r.dst + ':' + r.port + '/' + r.proto + '</span></div><div class="rule-note">' + esc(r.note) + '</div></div>';
  }).join('');

  var currentHtml = CURRENT_RULES.map(function(r) {
    var flagged = env.identifiedDrifts.indexOf(r.id) !== -1;
    return '<button class="rule-display rule-flaggable ' + (flagged ? 'flagged' : '') + '" data-action="toggle-drift" data-id="' + r.id + '">' +
      '<div class="rule-line"><span class="action" style="color:var(--text-ink);">' + r.action + '</span><span>' + r.src + '</span>' + icon('arrow-right', 12) + '<span>' + r.dst + ':' + r.port + '/' + r.proto + '</span>' + (flagged ? '<span class="stamp-badge crimson">flagged</span>' : '') + '</div>' +
      '<div class="rule-note">' + esc(r.note) + '</div>' +
    '</button>';
  }).join('');

  /* Audit Trail events */
  var eventsHtml = AUDIT_TRAIL.map(function(e) {
    var hasViolation = !!e.violation;
    var flagged = hasViolation && env.identifiedViolations.indexOf(e.violation) !== -1;
    return '<div class="audit-event ' + (hasViolation ? 'violation' : 'normal') + '">' +
      '<div style="display:flex;align-items:center;gap:0.375rem;flex-wrap:wrap;">' +
        '<span class="audit-event-id">' + e.id + '</span>' +
        '<span class="audit-event-ts">' + e.ts + '</span>' +
        (hasViolation ? '<button class="violation-toggle ' + (flagged ? 'on' : 'off') + '" data-action="toggle-violation-event" data-violation="' + e.violation + '">' + (flagged ? '✓ flagged' : 'flag violation') + '</button>' : '') +
      '</div>' +
      '<div class="audit-event-action"><span style="font-family:var(--font-mono);color:var(--bronze);">' + esc(e.actor) + ':</span> ' + esc(e.action) + '</div>' +
    '</div>';
  }).join('');

  var violationChips = AUDIT_VIOLATIONS.map(function(v) {
    var on = env.identifiedViolations.indexOf(v.id) !== -1;
    return '<button class="violation-chip ' + (on ? 'active' : '') + '" data-action="toggle-violation" data-id="' + v.id + '">' + v.label + '</button>';
  }).join('');

  /* Sequence reconstruction (H6) */
  var remainingEvents = AUDIT_TRAIL.filter(function(e) { return env.reconstructedOrder.indexOf(e.id) === -1; });
  var remainingHtml = remainingEvents.map(function(e) {
    return '<button class="seq-pool-item" data-action="add-order" data-id="' + e.id + '">' + icon('plus', 14) + '<span class="audit-event-id">' + e.id + '</span><span class="audit-event-ts">' + e.ts + '</span><span class="audit-event-action" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + esc(e.action) + '</span></button>';
  }).join('');

  var placedOrder = env.reconstructedOrder.map(function(id, idx) {
    var e = AUDIT_TRAIL.filter(function(x) { return x.id === id; })[0];
    if (!e) return '';
    return '<div class="seq-placed">' +
      '<span class="seq-num">' + (idx + 1) + '</span>' +
      '<span class="audit-event-id">' + e.id + '</span><span class="audit-event-ts">' + e.ts + '</span>' +
      '<span class="audit-event-action" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + esc(e.action) + '</span>' +
      '<div class="seq-controls">' +
        '<button data-action="move-order" data-id="' + id + '" data-dir="-1"' + (idx === 0 ? ' disabled' : '') + '>' + icon('arrow-up', 12) + '</button>' +
        '<button data-action="move-order" data-id="' + id + '" data-dir="1"' + (idx === env.reconstructedOrder.length - 1 ? ' disabled' : '') + '>' + icon('arrow-down', 12) + '</button>' +
      '</div>' +
      '<button class="seq-remove" data-action="remove-order" data-id="' + id + '">' + icon('x', 14) + '</button>' +
    '</div>';
  }).join('');

  return '<div style="display:flex;flex-direction:column;gap:1.5rem;">' +
    '<div class="parchment">' +
      stationHeader('search', 'Drift Inspector', 'Compare the baseline firewall config to the current config. Flag unauthorized rules.') +
      '<div style="display:grid;grid-template-columns:1fr;gap:0.75rem;">' +
        '<div><label class="lbl" style="margin-bottom:0.5rem;">Baseline (documented standard)</label>' + baselineHtml + '</div>' +
        '<div><label class="lbl" style="margin-bottom:0.5rem;">Current (live) — click to flag unauthorized</label>' + currentHtml + '</div>' +
      '</div>' +
      '<hr class="separator">' +
      '<div><label class="lbl" style="color:var(--bronze);margin-bottom:0.25rem;">Hard OBJ-H3: which control would have caught these unauthorized changes?</label>' +
        '<input type="text" data-action="set-h3-control" value="' + esc(env.impactAnswers['h3_control'] || '') + '" placeholder="e.g., configuration drift monitoring"></div>' +
    '</div>' +
    '<div class="parchment">' +
      stationHeader('scroll-text', 'Audit Trail Inspector', 'Review the timestamped events for RFC-2026-0143. Identify violations and reconstruct the sequence.') +
      '<div style="display:grid;grid-template-columns:1fr;gap:1rem;">' +
        '<div>' +
          '<label class="lbl" style="margin-bottom:0.5rem;">Event log — flag violations</label>' +
          '<div class="scrollable" style="padding:0.5rem;">' + eventsHtml + '</div>' +
          '<div style="margin-top:0.5rem;"><label class="lbl" style="margin-bottom:0.25rem;">Identified violation types</label><div class="violation-chips">' + violationChips + '</div></div>' +
        '</div>' +
        '<div>' +
          '<label class="lbl" style="margin-bottom:0.5rem;">Hard OBJ-H6: reconstruct chronological order</label>' +
          '<div style="max-height:140px;overflow-y:auto;margin-bottom:0.5rem;">' + (remainingHtml || '<div class="seq-empty">All events placed.</div>') + '</div>' +
          placedOrder +
          '<div style="margin-top:0.75rem;"><label class="lbl" style="color:var(--bronze);margin-bottom:0.25rem;">At which event ID did the process break?</label>' +
            '<input type="text" data-action="set-h6-break" value="' + esc(env.impactAnswers['h6_break'] || '') + '" placeholder="e.g., e4"></div>' +
        '</div>' +
      '</div>' +
    '</div>' +
  '</div>';
}

/* ----- Station 4: COMPLIANCE (Doc Vault + Impact Worksheet + Justification) ----- */
function renderComplianceStation() {
  var env = state.env;

  var docChecks = DOC_CHECKLIST.map(function(d) {
    var checked = env.docChecks[d.id] === true;
    return '<label class="check-row ' + (checked ? 'checked-sage' : 'unchecked') + '" data-action="toggle-doc" data-id="' + d.id + '">' +
      '<span class="check-box"></span>' +
      '<div style="flex:1;"><div class="check-label">' + esc(d.label) + '</div><div class="check-desc">' + esc(d.desc) + '</div></div>' +
    '</label>';
  }).join('');

  var m1Check = '<label class="check-row ' + (env.docChecks['__m1_read'] === true ? 'checked-amber' : 'unchecked') + '" data-action="toggle-m1">' +
    '<span class="check-box"></span>' +
    '<div style="flex:1;"><div class="check-label">I have read the four pillars of change management (Planning, Testing, Approvals, Documentation) in the Knowledge Core above.</div>' +
    '<div class="check-desc">Medium OBJ-M1 — confirm understanding of the four lesson pillars.</div></div>' +
  '</label>';

  var impactFields = IMPACT_WORKSHEET_FIELDS.map(function(f) {
    return '<div><label class="lbl">' + f.label + '</label>' +
      '<textarea data-action="set-impact" data-field="' + f.id + '" placeholder="' + esc(f.placeholder) + '">' + esc(env.impactAnswers[f.id] || '') + '</textarea></div>';
  }).join('');

  return '<div style="display:flex;flex-direction:column;gap:1.5rem;">' +
    '<div class="parchment">' +
      stationHeader('file-text', 'Documentation Vault', 'After a network topology change (new subnet added), check every artifact that must be updated.') +
      docChecks +
      '<hr class="separator">' + m1Check +
    '</div>' +
    '<div class="parchment">' +
      stationHeader('book-open', 'Impact Analysis Worksheet', 'Complete a full impact analysis for RFC-2026-0145 (vendor telemetry rule to billing subnet).') +
      impactFields +
      '<p style="font-size:0.65rem;color:var(--bronze);margin-top:0.5rem;font-style:italic;">Hard OBJ-H8: each field must contain the relevant concept keywords (≥2 per field) to pass validation.</p>' +
    '</div>' +
    '<div class="parchment">' +
      stationHeader('gavel', 'Justification Composer', 'Write a 3-5 sentence justification for adopting formal change management. Cite at least 4 specific security risks it mitigates.') +
      '<textarea data-action="set-justification" placeholder="Meridian Health Networks should adopt formal change management because…" style="min-height:120px;">' + esc(env.justificationText || '') + '</textarea>' +
      '<p style="font-size:0.65rem;color:var(--bronze);margin-top:0.5rem;font-style:italic;">Hard OBJ-H9 — your answer must cite ≥4 named risks and be ≥40 words.</p>' +
    '</div>' +
  '</div>';
}

/* ----- Station 5: DECISION (Failure Matcher + Emergency Decision) ----- */
function renderDecisionStation() {
  var env = state.env;

  var failureMatchers = FAILURE_MODES.map(function(f) {
    var match = env.failureMatches[f.id] || '';
    var opts = '<option value="">— select consequence —</option>' + FAILURE_CONSEQUENCES.map(function(c) {
      return '<option value="' + c.id + '"' + (match === c.id ? ' selected' : '') + '>' + esc(c.label) + '</option>';
    }).join('');
    return '<div class="rfc-ticket" style="border-color:rgba(124,92,46,0.25);background:rgba(237,224,200,0.3);">' +
      '<div class="check-label">' + esc(f.label) + '</div>' +
      '<div class="check-desc" style="margin-bottom:0.5rem;">' + esc(f.desc) + '</div>' +
      '<select data-action="set-match" data-failure="' + f.id + '">' + opts + '</select>' +
    '</div>';
  }).join('');

  var decisionChecks = EMERGENCY_DECISION_OPTIONS.map(function(opt) {
    var checked = env.incidentFailures.indexOf(opt.id) !== -1;
    return '<label class="check-row ' + (checked ? 'checked-amber' : 'unchecked') + '" data-action="toggle-decision" data-id="' + opt.id + '">' +
      '<span class="check-box"></span>' +
      '<span class="check-label">' + esc(opt.label) + '</span>' +
    '</label>';
  }).join('');

  return '<div style="display:flex;flex-direction:column;gap:1.5rem;">' +
    '<div class="parchment">' +
      stationHeader('alert-triangle', 'Failure Mode Matcher', 'Match each change-management failure to its characteristic security consequence.') +
      failureMatchers +
    '</div>' +
    '<div class="parchment">' +
      stationHeader('shield-check', 'Emergency Change Decision Panel', 'A zero-day RCE is being actively exploited. Choose the correct emergency-change steps AND identify the forbidden shortcuts.') +
      '<div style="border:1px solid rgba(185,28,28,0.3);border-radius:var(--radius-sm);padding:0.5rem;background:rgba(185,28,28,0.05);margin-bottom:0.75rem;font-size:0.7rem;color:var(--text-ink);"><strong>Scenario:</strong> CVE-2026-1187 — RCE in the patient portal web framework. Active exploitation in the wild. Vendor hotfix available. Must deploy within 4 hours.</div>' +
      '<p style="font-size:0.65rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--bronze);margin-bottom:0.5rem;">Select all 5 correct answers (3 correct steps + 2 forbidden shortcuts)</p>' +
      decisionChecks +
      '<p style="font-size:0.65rem;color:var(--bronze);margin-top:0.5rem;font-style:italic;">Hard OBJ-H7 — select exactly 5: the 3 correct steps AND the 2 forbidden shortcuts.</p>' +
    '</div>' +
  '</div>';
}

/* ===================================================================
   OBJECTIVES TRACKER (C4)
   =================================================================== */
function renderTracker() {
  var mode = state.selectedMode;
  var objs = getObjectives(mode);
  var completed = getCompletedCount(mode);
  var total = getTotalCount(mode);
  var pct = total > 0 ? (completed / total) * 100 : 0;

  /* Pillar groups */
  var pillars = { P1: { done: 0, total: 0 }, P2: { done: 0, total: 0 }, P3: { done: 0, total: 0 }, P4: { done: 0, total: 0 } };
  objs.forEach(function(o) { pillars[o.pillar].total++; if (getObjectiveRecord(o.id).completed) pillars[o.pillar].done++; });

  var pillarCells = ['P1', 'P2', 'P3', 'P4'].map(function(p) {
    var m = PILLAR_META[p];
    return '<div class="pillar-cell" style="border-color:' + m.border + ';background:' + m.bg + ';"><div class="pillar-label" style="color:' + m.color + ';">' + m.label + '</div><div class="pillar-count">' + pillars[p].done + '/' + pillars[p].total + '</div></div>';
  }).join('');

  var rows = objs.map(function(o) {
    var rec = getObjectiveRecord(o.id);
    var expanded = uiState.expandedObjective === o.id && !rec.completed;
    var feedback = uiState.feedback[o.id];
    var hintLevel = uiState.hintLevels[o.id] || 0;

    var headerBtn = '<button class="objective-header" data-action="toggle-objective" data-id="' + o.id + '">' +
      (rec.completed ? icon('check-circle', 16) : '<span style="color:var(--text-muted);">' + icon('chevron-right', 16) + '</span>') +
      '<div style="flex:1;min-width:0;">' +
        '<div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.125rem;">' +
          '<span class="objective-id">' + o.id + '</span>' + pillarBadge(o.pillar) +
          '<span class="objective-station">@ ' + o.station + '</span>' +
        '</div>' +
        '<div class="objective-title">' + esc(o.title) + '</div>' +
      '</div>' +
    '</button>';

    var body = '';
    if (expanded) {
      body = '<div class="objective-body">' +
        '<p class="objective-prompt">' + esc(o.prompt) + '</p>' +
        '<div class="objective-actions">' +
          '<button class="btn btn-primary btn-sm" data-action="check-objective" data-id="' + o.id + '">' + icon('clipboard-list', 14) + ' CHECK RESULTS</button>' +
          (mode === 'medium' && o.hints.length > 0 && hintLevel < o.hints.length ? '<button class="btn btn-outline btn-sm" data-action="use-hint" data-id="' + o.id + '">' + icon('lightbulb', 14) + ' Hint (' + hintLevel + '/' + o.hints.length + ')</button>' : '') +
        '</div>' +
        (hintLevel > 0 ? '<div class="objective-hint"><div class="objective-hint-label">Hint ' + hintLevel + '</div><p class="objective-hint-text">' + esc(o.hints[hintLevel - 1]) + '</p></div>' : '') +
        (feedback ? '<div class="objective-feedback ' + (feedback.ok ? 'pass' : 'fail') + '"><p class="objective-feedback-text">' + esc(feedback.msg) + '</p></div>' : '') +
        '<p class="objective-coverage">Coverage: ' + esc(o.coverageAnchor) + '</p>' +
      '</div>';
    }

    return '<div class="objective-row ' + (rec.completed ? 'completed' : 'pending') + '">' + headerBtn + body + '</div>';
  }).join('');

  return '<section id="tracker">' +
    '<div class="section-header"><div class="bar"></div><h2>Objectives Tracker</h2></div>' +
    '<div class="card">' +
      '<div class="tracker-summary">' +
        '<div class="text-xs text-muted"><span class="tracker-count">' + completed + '</span><span class="text-faint"> / ' + total + ' objectives complete</span></div>' +
        '<span class="stamp-badge bronze">' + mode + '</span>' +
      '</div>' +
      '<div class="progress-bar"><div class="progress-fill" style="width:' + pct + '%;"></div></div>' +
      '<div class="pillar-grid">' + pillarCells + '</div>' +
    '</div>' +
    rows +
  '</section>';
}

/* ===================================================================
   QUIZ (C5)
   =================================================================== */
function renderQuiz() {
  var mode = state.selectedMode;
  var questions = mode === 'medium' ? MEDIUM_QUIZ : HARD_QUIZ;
  var qr = state.quizRecords[mode];

  var allAnswered = questions.every(function(q) { return (qr.answers[q.id] || []).length > 0; });

  var cards = questions.map(function(q, qi) {
    var sel = qr.answers[q.id] || [];
    var isRevealed = qr.submitted;
    var isCorrect = sel.length === q.correct.length && sel.every(function(i) { return q.correct.indexOf(i) !== -1; });

    var options = q.options.map(function(opt, oi) {
      var chosen = sel.indexOf(oi) !== -1;
      var isAns = q.correct.indexOf(oi) !== -1;
      var cls = 'quiz-option unclicked';
      var extraIcon = '';

      if (isRevealed) {
        if (chosen && isAns) { cls = 'quiz-option correct-selected'; extraIcon = icon('check-circle', 14); }
        else if (chosen && !isAns) { cls = 'quiz-option wrong-selected'; extraIcon = icon('x-circle', 14); }
        else cls = 'quiz-option muted';
      } else if (chosen) {
        cls = 'quiz-option selected';
      }

      return '<button class="' + cls + '" data-action="answer-quiz" data-qid="' + q.id + '" data-oid="' + oi + '"' + (isRevealed ? ' disabled' : '') + '>' +
        '<span class="quiz-option-letter">' + String.fromCharCode(65 + oi) + '.</span>' +
        '<span style="flex:1;">' + esc(opt) + '</span>' +
        extraIcon +
      '</button>';
    }).join('');

    return '<div class="quiz-card">' +
      '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.25rem;">' +
        '<span class="objective-id">Q' + (qi + 1) + '</span>' +
        (isRevealed ? (isCorrect ? icon('check-circle', 16) : icon('x-circle', 16)) : '') +
      '</div>' +
      '<p class="quiz-scenario">' + esc(q.scenario) + '</p>' +
      '<p class="quiz-question">' + esc(q.question) + '</p>' +
      options +
      (isRevealed ? '<div class="quiz-explanation"><div class="quiz-explanation-label">Explanation</div><p class="quiz-explanation-text">' + esc(q.explanation) + '</p></div>' : '') +
    '</div>';
  }).join('');

  var footer = '';
  if (!qr.submitted) {
    footer = '<button class="btn btn-primary" data-action="submit-quiz"' + (allAnswered ? '' : ' disabled') + '>' + icon('clipboard-list', 16) + ' ' + (allAnswered ? 'Submit Quiz' : 'Answer all questions (' + Object.keys(qr.answers).length + '/' + questions.length + ')') + '</button>';
  } else {
    footer = '<div class="quiz-score-card"><div style="display:flex;align-items:center;gap:0.5rem;">' + icon('award', 20) + '<span style="font-size:0.85rem;">Quiz score: <span style="font-family:var(--font-mono);font-weight:bold;color:var(--sage-light);">' + qr.score + '</span> / ' + questions.length + '</span></div></div>';
  }

  return '<section id="quiz">' +
    '<div class="section-header"><div class="bar"></div><h2>Knowledge Check</h2></div>' +
    '<p class="section-intro">' + (mode === 'medium'
      ? 'Seven concept questions. Each answer reveals an explanation — read them; they reinforce the lesson.'
      : 'Eight scenario-based questions. Apply what you practiced — these require analysis, not recall.') + '</p>' +
    cards + footer +
  '</section>';
}

/* ===================================================================
   DEBRIEF (C6)
   =================================================================== */
function renderDebrief() {
  var detection = DEBRIEF.detectionOpportunities.map(function(d) { return '<li>' + esc(d) + '</li>'; }).join('');
  var mitigations = DEBRIEF.mitigationRecommendations.map(function(m) {
    return '<div class="mitigation-item"><span class="mitigation-id">' + m.id + '</span> <span class="mitigation-label">' + esc(m.label) + '</span><div class="mitigation-desc">' + esc(m.desc) + '</div></div>';
  }).join('');
  var blue = DEBRIEF.blueTeamTakeaways.map(function(t) { return '<li>' + esc(t) + '</li>'; }).join('');
  var red = DEBRIEF.redTeamTakeaways.map(function(t) { return '<li>' + esc(t) + '</li>'; }).join('');
  var refs = DEBRIEF.officialReferences.map(function(r) {
    return '<a class="reference-link" href="' + r.url + '" target="_blank" rel="noopener noreferrer">' + icon('external-link', 12) + '<span>' + esc(r.label) + '</span></a>';
  }).join('');

  return '<section id="debrief">' +
    '<div class="section-header"><div class="bar"></div><h2>Field Notes &amp; Debrief</h2></div>' +
    '<div class="debrief-grid">' +
      '<div class="debrief-card detection">' + icon('search', 16) + '<h3>Detection opportunities</h3><ul class="debrief-list">' + detection + '</ul></div>' +
      '<div class="debrief-card mitigation">' + icon('shield-check', 16) + '<h3>Mitigation recommendations</h3>' + mitigations + '</div>' +
      '<div class="debrief-card blue">' + icon('shield-check', 16) + '<h3>Blue-team takeaways</h3><ul class="debrief-list">' + blue + '</ul></div>' +
      '<div class="debrief-card red">' + icon('alert-triangle', 16) + '<h3>Red-team mindset</h3><ul class="debrief-list">' + red + '</ul></div>' +
    '</div>' +
    '<div class="debrief-card references" style="margin-top:0.75rem;">' + icon('book-open', 16) + '<h3>Official references</h3><div style="display:grid;grid-template-columns:1fr;gap:0.25rem;">' + refs + '</div></div>' +
  '</section>';
}

/* ===================================================================
   COMPLETION MODAL (C7) — with performance-derived focus areas (R8)
   =================================================================== */
function renderCompletionModal() {
  var mode = state.selectedMode;
  if (!mode) return '';
  var objs = getObjectives(mode);
  var completed = getCompletedCount(mode);
  var total = getTotalCount(mode);
  var quizDone = state.quizRecords[mode].submitted;
  var allDone = completed === total && quizDone;

  if (!allDone || state.completionDismissed) return '';

  var stars = computeStars(mode);
  var quizScore = state.quizRecords[mode].score;
  var quizTotal = (mode === 'medium' ? MEDIUM_QUIZ : HARD_QUIZ).length;

  /* Pillar recap */
  var pillars = { P1: { done: 0, total: 0 }, P2: { done: 0, total: 0 }, P3: { done: 0, total: 0 }, P4: { done: 0, total: 0 } };
  objs.forEach(function(o) { pillars[o.pillar].total++; if (getObjectiveRecord(o.id).completed) pillars[o.pillar].done++; });

  var pillarHtml = ['P1', 'P2', 'P3', 'P4'].map(function(p) {
    var m = PILLAR_META[p];
    return '<div class="modal-pillar" style="border-color:' + m.border + ';background:' + m.bg + ';"><div class="label" style="color:' + m.color + ';">' + m.label + '</div><div class="count">' + pillars[p].done + '/' + pillars[p].total + '</div></div>';
  }).join('');

  /* Focus areas (R8) */
  var focusAreas = [];

  var hintStations = {};
  objs.forEach(function(o) { var rec = getObjectiveRecord(o.id); if (rec.hintsUsed > 0) hintStations[o.station] = true; });
  var hintList = Object.keys(hintStations);
  if (hintList.length > 0) focusAreas.push({ area: 'Stations where you used hints', detail: hintList.join(', ') + '. Re-read the Knowledge Core sections for these topics, then retry the objectives without hints.' });

  var struggleStations = {};
  objs.forEach(function(o) { var rec = getObjectiveRecord(o.id); if (rec.attempts > 2) struggleStations[o.station] = true; });
  var struggleList = Object.keys(struggleStations);
  if (struggleList.length > 0) focusAreas.push({ area: 'Stations that took multiple attempts', detail: struggleList.join(', ') + '. The concepts didn\'t click on the first try — review them before the exam.' });

  var quiz = mode === 'medium' ? MEDIUM_QUIZ : HARD_QUIZ;
  var qr = state.quizRecords[mode];
  var wrongTopics = [];
  quiz.forEach(function(q) {
    var ans = qr.answers[q.id] || [];
    var isCorrect = ans.length === q.correct.length && ans.every(function(i) { return q.correct.indexOf(i) !== -1; });
    if (!isCorrect) wrongTopics.push(QUIZ_TOPICS[q.id] || q.question.substring(0, 40));
  });
  if (wrongTopics.length > 0) focusAreas.push({ area: 'Quiz concepts you missed', detail: wrongTopics.join('; ') + '. Read the explanations for each missed question in the Knowledge Check section above.' });

  var weakestPillar = null, weakestRatio = 1;
  ['P1', 'P2', 'P3', 'P4'].forEach(function(p) { var r = pillars[p].total > 0 ? pillars[p].done / pillars[p].total : 1; if (r < weakestRatio) { weakestRatio = r; weakestPillar = p; } });
  if (weakestPillar && weakestRatio < 1) focusAreas.push({ area: 'Weakest pillar: ' + PILLAR_META[weakestPillar].label, detail: pillars[weakestPillar].done + '/' + pillars[weakestPillar].total + ' objectives complete. Spend extra study time on ' + PILLAR_META[weakestPillar].label.toLowerCase() + ' concepts.' });

  if (focusAreas.length === 0) focusAreas.push({ area: 'No weak areas detected', detail: 'You completed every objective without hints and aced the quiz. You are ready for the exam questions on this lesson.' });

  var focusHtml = focusAreas.map(function(fa) {
    return '<div class="modal-focus-area"><div class="area">' + esc(fa.area) + '</div><p class="detail">' + esc(fa.detail) + '</p></div>';
  }).join('');

  var starsHtml = [1, 2, 3, 4, 5].map(function(n) {
    return '<span class="' + (n <= stars ? 'filled' : 'empty') + '">' + icon('star', 28) + '</span>';
  }).join('');

  return '<div class="modal-overlay" data-action="overlay-click">' +
    '<div class="modal">' +
      '<button class="modal-close" data-action="dismiss-completion" aria-label="Close">✕</button>' +
      '<div class="modal-title">' + icon('award', 24) + ' Change Authority Certified</div>' +
      '<div class="modal-subtitle">CompTIA Security+ SY0-801 — Lesson 1.2 complete (' + mode + ' mode)</div>' +
      '<div class="modal-stars">' + starsHtml + '</div>' +
      '<div class="modal-scores">' +
        '<div class="modal-score"><div class="modal-score-label">Objectives</div><div class="modal-score-val" style="color:var(--sage-light);">' + completed + '/' + total + '</div></div>' +
        '<div class="modal-score"><div class="modal-score-label">Quiz</div><div class="modal-score-val" style="color:var(--seal-amber-light);">' + quizScore + '/' + quizTotal + '</div></div>' +
      '</div>' +
      '<div class="modal-section-label">Mastery by pillar</div>' +
      '<div class="modal-pillars">' + pillarHtml + '</div>' +
      '<hr class="separator">' +
      '<div class="modal-section-label" style="color:var(--crimson-light);">Focus areas — where to study more</div>' +
      focusHtml +
      '<hr class="separator">' +
      '<div class="modal-section-label">What to learn next</div>' +
      '<ul class="modal-next-list">' +
        '<li>Lesson 1.3 — configuration management (the twin of change management).</li>' +
        '<li>Domain 4 — incident response: change logs are the FIRST place responders look.</li>' +
        '<li>Try the other difficulty mode of this lab for a different angle.</li>' +
      '</ul>' +
      '<div class="modal-actions">' +
        '<button class="btn btn-outline" data-action="dismiss-completion" style="flex:1;">Review the lab</button>' +
        '<button class="btn btn-primary" data-action="reset" style="flex:1;">' + icon('rotate-ccw', 14) + ' Reset &amp; retry</button>' +
      '</div>' +
    '</div>' +
  '</div>';
}

/* ===================================================================
   FULL PAGE RENDER
   =================================================================== */
function renderPage() {
  if (!state.selectedMode) return renderModeSelect();

  return renderHeader() +
    '<main class="main">' +
      renderBriefing() +
      renderKnowledgeCore() +
      renderEnvironment() +
      renderTracker() +
      renderQuiz() +
      renderDebrief() +
    '</main>' +
    renderCompletionModal();
}
