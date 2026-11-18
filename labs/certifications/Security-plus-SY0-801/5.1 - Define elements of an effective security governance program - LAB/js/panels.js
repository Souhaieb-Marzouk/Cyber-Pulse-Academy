// ─── The Registry — js/panels.js ──────────────────────────────────────────
// Panel renderers (template functions returning HTML strings) for the seven
// lab sections: Briefing, Registry, Docket, Audit Desk, Objectives ledger,
// Quiz and Debrief. Carried over 1:1 from the framework lab
// (src/components/govlab/desks.tsx + panels.tsx).
//
// Ephemeral panel-local UI state (registry search box, glossary toggle,
// active docket ticket, quiz draft + cursor, objective feedback) lives in
// PANEL_UI — exactly the React useState values of the original, which also
// reset when you leave a tab.

window.PANEL_UI = {
  registryQuery: '',
  registryGlossaryOpen: false,
  docketActiveId: null,     // null → first ticket of the mode
  objFeedback: {},          // objective id → { pass, feedback } (last check)
  quizDrafts: {},           // quiz id → selected option index (string)
  quizCursor: 0,
};

window.PANELS = (function () {
  'use strict';

  var esc = UI.esc;
  var icon = UI.icon;
  var DATA = window.LAB_DATA;
  var TYPE_ORDER = ['policy', 'standard', 'procedure', 'guideline'];

  // ═══════════════ Shared option sets (Objectives ledger) ══════════════════
  var OPT_CLASSES = [
    { value: 'policy', label: 'Policy' },
    { value: 'standard', label: 'Standard' },
    { value: 'procedure', label: 'Procedure' },
    { value: 'guideline', label: 'Guideline' },
  ];
  var OPT_ROLES = [
    { value: 'owner', label: 'Data owner' },
    { value: 'controller', label: 'Data controller' },
    { value: 'processor', label: 'Data processor' },
    { value: 'custodian', label: 'Custodian / steward' },
  ];
  var OPT_DOCS = [
    { value: 'GOV-POL-02', label: 'GOV-POL-02 — Information Security Policy' },
    { value: 'GOV-POL-03', label: 'GOV-POL-03 — Incident Response Policy' },
    { value: 'GOV-STD-03', label: 'GOV-STD-03 — Encryption Standard' },
    { value: 'GOV-PRC-02', label: 'GOV-PRC-02 — Onboarding & Offboarding Procedure' },
  ];
  var REGISTRY_SHORT = [
    ['GOV-POL-01', 'Acceptable Use Policy'],
    ['GOV-POL-02', 'Information Security Policy'],
    ['GOV-POL-03', 'Incident Response Policy'],
    ['GOV-POL-05', 'Disaster Recovery Policy'],
    ['GOV-STD-01', 'Password Standard'],
    ['GOV-STD-02', 'Access Control Standard'],
    ['GOV-STD-03', 'Encryption Standard'],
    ['GOV-STD-04', 'Physical Security Standard'],
    ['GOV-PRC-02', 'Onboarding & Offboarding Procedure'],
    ['GOV-PRC-03', 'IR Playbook — Ransomware'],
    ['GOV-GLD-02', 'Data Handling Guideline'],
  ];
  var OPT_ALLDOCS = REGISTRY_SHORT.map(function (r) {
    return { value: r[0], label: r[0] + ' — ' + r[1] };
  });

  // R2 retry-clear: discard the objective's checked answers wholesale.
  function resetAnswersIn(d, id) {
    switch (id) {
      case 'OBJ-M1': d.matchings['m1'] = {}; break;
      case 'OBJ-M2': d.matchings['m2'] = {}; break;
      case 'OBJ-M3': d.matchings['m3'] = {}; break;
      case 'OBJ-M7': delete d.auditChecks['F2']; break;
      case 'OBJ-M8': delete d.auditChecks['F5']; d.misfileAnswer = undefined; break;
      case 'OBJ-M10': d.matchings['m10'] = {}; break;
      case 'OBJ-M11': d.matchings['m11'] = {}; break;
      case 'OBJ-M12': d.orders['m12'] = ['r', 'p', 'g', 's']; break;
      case 'OBJ-H2': d.auditChecks = {}; d.misfileAnswer = undefined; break;
      case 'OBJ-H3': d.h3 = { step: 1 }; break;
      case 'OBJ-H4': d.matchings['h4'] = {}; break;
      case 'OBJ-H5': d.matchings['h5'] = {}; break;
      case 'OBJ-H6': d.orders['h6'] = ['recover', 'notify', 'recert', 'disable', 'revoke']; delete d.matchings['h6s']; break;
      case 'OBJ-H7': d.matchings['h7'] = {}; break;
      case 'OBJ-H8': d.orders['h8'] = []; delete d.matchings['h8n']; break;
      case 'OBJ-H9': d.matchings['h9'] = {}; break;
    }
  }

  // Docket verdict for one ticket (used by the queue badges + objective list).
  function verdictFor(state, item) {
    var rec = state.dockets[item.id];
    if (!rec || !rec.filed) return null;
    var citeOk = item.acceptedCites.length > 0
      ? !!rec.cited && item.acceptedCites.indexOf(rec.cited) !== -1
      : !rec.cited;
    return citeOk && rec.stamp === item.acceptedStamp ? 'correct' : 'incorrect';
  }

  function docketStatusOf(state, item) {
    var rec = state.dockets[item.id];
    if (rec && rec.filed) {
      var correct = verdictFor(state, item) === 'correct';
      return correct
        ? { t: 'STAMPED ✓', c: 'docket-status-ok' }
        : { t: 'NOT CORRECT', c: 'docket-status-bad' };
    }
    return { t: 'NOT FILED', c: 'docket-status-none' };
  }

  // ═════════════════════════ BRIEFING (C1) ═════════════════════════════════
  function briefing(mode) {
    var h = '<div class="stack-4">';
    h += '<section class="panel panel-strong pad-4">';
    h += '<div class="flex-center-gap">' + icon('landmark', 'icon-lg icon-red') +
      '<h2 class="h2">Case briefing — the MFL registry</h2></div>';
    h += '<p class="body-text mt-2"><strong>' + esc(DATA.ORG.name) + '</strong> moves freight across three regions with 1,400 staff. Last quarter an auditor asked one question the depot could not answer: <em>“Which document actually governs this?”</em> Propping doors, personal USB sticks, VIPs without MFA, an emergency patch at 2 a.m. — every one of them has an answer, but only if staff can <strong>apply</strong> the register instead of reciting it.</p>';
    h += '<p class="body-text mt-2">You are the new governance clerk at the Registry. The desk has four drawers: the <strong>document Registry</strong> (17 governing documents), the <strong>Request Docket</strong> (live tickets that must be cited and stamped), the <strong>Audit Desk</strong> (claims to verify against the files), and your<strong> Objectives ledger</strong>. CompTIA Security+ (SY0-801) objective 5.1 — <em>“Apply policies, standards, procedures, and security guidance”</em> — is exactly this job.</p>';
    h += '<p class="training-note mt-2">TRAINING SIMULATION — Meridian Freight &amp; Logistics, all tickets, documents and events are synthetic. No real organizations, laws quoted verbatim, or personal data.</p>';
    h += '</section>';

    h += '<section class="panel panel-amber pad-4">';
    h += '<h3 class="h3">External governance — the pressure from outside</h3>';
    h += '<p class="body-text mt-1-5">The registry does not float free. <strong>Regulatory</strong> regimes (privacy acts), <strong>industry schemes</strong>, <strong>customer contracts</strong> and <strong>local/regional rules</strong> all push obligations inward. Every external driver must be traceable to an internal document that absorbs it — that traceability is a governance program’s audit trail. Governance itself is steered by structures: boards, committees and government entities, arranged centrally or decentralized into business units.</p>';
    h += '<div class="grid-4 mt-3">';
    var hier = [
      ['Intent', 'Policy', 'Management-approved. WHAT & WHY.'],
      ['Measurable', 'Standard', 'Exact requirements. WHAT EXACTLY.'],
      ['Executable', 'Procedure', 'Ordered steps. HOW.'],
      ['Advisory', 'Guideline', 'Recommended. "should / consider".'],
    ];
    hier.forEach(function (row, i) {
      h += '<div class="hier-card">';
      h += '<span class="hier-tag">' + esc(row[0].toUpperCase()) + '</span>';
      h += '<div class="hier-name">' + esc(row[1]) + '</div>';
      h += '<div class="hier-desc">' + esc(row[2]) + '</div>';
      if (i < 3) h += '<span class="hier-arrow" aria-hidden="true">→</span>';
      h += '</div>';
    });
    h += '</div></section>';

    h += '<section class="panel panel-amber pad-4">';
    h += '<h3 class="h3">How this lab works</h3>';
    h += '<ul class="nice-list mt-1-5">';
    if (mode === 'medium') {
      h += '<li>• Work the <strong>Objectives ledger</strong> top to bottom — each entry tells you where to look and offers tiered hints (hints cost stars, never progress).</li>';
      h += '<li>• Validate every objective with <strong>CHECK RESULTS</strong>; wrong answers teach, they never punish.</li>';
      h += '<li>• After practice, take the <strong>quiz</strong>; then file your <strong>final report</strong>.</li>';
    } else {
      h += '<li>• Six noisy tickets, eight audit claims, one exception workflow — and exactly three planted registry defects. One nudge is available for the whole lab (it costs score).</li>';
      h += '<li>• Validation is strict: exact codes, exact order, no partial credit. Distractors and a red herring are in the evidence.</li>';
      h += '<li>• Complete the ledger, pass the scenario quiz, then file your final report.</li>';
    }
    h += '</ul></section>';
    h += '</div>';
    return h;
  }

  // ═════════════════════════ REGISTRY DESK ═════════════════════════════════
  function isStale(doc) {
    var year = parseInt(doc.lastReview.slice(0, 4), 10);
    return year <= 2023; // annual cycle; anything from 2023 or earlier is overdue in this simulation (lab "today" = 2026)
  }

  function registryListHtml(state) {
    var query = PANEL_UI.registryQuery.toLowerCase();
    var filtered = DATA.REGISTRY.filter(function (d) {
      return !query ||
        d.code.toLowerCase().indexOf(query) !== -1 ||
        d.title.toLowerCase().indexOf(query) !== -1;
    });
    var openCode = state.openDoc || DATA.REGISTRY[0].code;
    var h = '';
    TYPE_ORDER.forEach(function (t) {
      var docs = filtered.filter(function (d) { return d.type === t; });
      if (docs.length === 0) return;
      h += '<div>';
      h += '<div class="index-group-title">' + esc(DATA.DOC_TYPE_INFO[t].label + 's') + '</div>';
      h += '<ul class="index-list">';
      docs.forEach(function (d) {
        var active = d.code === openCode;
        h +=
          '<li><button type="button" onclick="App.openRegistryDoc(\'' + d.code + '\')" aria-current="' + (active ? 'true' : 'false') + '"' +
          ' class="doc-link' + (active ? ' doc-link-active' : '') + '">' +
          icon('file-text', 'icon-sm icon-faint') +
          '<span><span class="doc-link-code">' + esc(d.code) + '</span>' +
          '<span class="doc-link-title">' + esc(d.title) + '</span></span>' +
          '</button></li>';
      });
      h += '</ul></div>';
    });
    return h;
  }

  function registry(state) {
    var doc = DATA.REGISTRY.filter(function (d) { return d.code === state.openDoc; })[0] || DATA.REGISTRY[0];
    var info = DATA.DOC_TYPE_INFO[doc.type];
    var showGlossary = PANEL_UI.registryGlossaryOpen;

    var h = '<div class="stack-4">';
    // Knowledge core strip
    h += '<div class="grid-2-4">';
    TYPE_ORDER.forEach(function (t) {
      var ti = DATA.DOC_TYPE_INFO[t];
      h += '<div class="panel pad-3">';
      h += '<div class="type-head"><span class="type-name">' + esc(ti.label) + '</span>';
      h += '<span class="' + (ti.authority === 'Mandatory' ? 'authority authority-mandatory' : 'authority authority-advisory') + '">' + esc(ti.authority) + '</span></div>';
      h += '<div class="type-says">says: ' + esc(ti.says) + '</div>';
      h += '<p class="type-blurb">' + esc(ti.blurb) + '</p>';
      h += '</div>';
    });
    h += '</div>';

    h += '<div class="registry-grid">';
    // Index
    h += '<div class="registry-index">';
    h += '<div class="registry-search-row">';
    h += '<label class="sr-only" for="registry-search">Search registry documents</label>';
    h += '<div class="flex-center-gap">' + icon('search', 'icon-sm icon-faint') +
      '<input id="registry-search" data-fid="registry-search" value="' + esc(PANEL_UI.registryQuery) + '"' +
      ' placeholder="Search code or title…" oninput="App.setRegistryQuery(this.value)" /></div>';
    h += '</div>';
    h += '<div id="registry-index-list" class="registry-index-list">' + registryListHtml(state) + '</div>';
    h += '<div class="registry-glossary-row">';
    h += '<button type="button" data-fid="glossary-toggle" aria-expanded="' + (showGlossary ? 'true' : 'false') + '"' +
      ' onclick="App.toggleGlossary()" class="glossary-toggle">' + icon('scroll-text', 'icon-sm') +
      ' Glossary (' + DATA.GLOSSARY.length + ' terms)</button>';
    if (showGlossary) {
      h += '<dl class="glossary-list">';
      DATA.GLOSSARY.forEach(function (g) {
        h += '<div><dt class="glossary-term">' + esc(g.term) + '</dt><dd class="glossary-def">' + esc(g.def) + '</dd></div>';
      });
      h += '</dl>';
    }
    h += '</div></div>';

    // Document viewer
    h += '<article aria-label="Document viewer: ' + esc(doc.code) + '" class="doc-viewer">';
    h += '<header class="doc-viewer-head">';
    h += '<div class="flex-wrap-gap"><span class="doc-code-badge">' + esc(doc.code) + '</span>';
    h += '<span class="' + (doc.type === 'guideline' ? 'doc-class doc-class-advisory' : 'doc-class doc-class-mandatory') + '">' +
      esc(info.label) + ' · ' + esc(info.authority) + '</span>';
    h += '<span class="doc-training">TRAINING DATA — fictional</span></div>';
    h += '<h3 class="doc-title">' + esc(doc.title) + '</h3>';
    h += '</header>';
    h += '<div class="doc-viewer-body">';
    h += '<dl class="doc-meta">';
    h += '<div><dt>Owner</dt><dd>' + esc(doc.owner) + '</dd></div>';
    h += '<div><dt>Approved by</dt><dd>' + esc(doc.approvedBy) + '</dd></div>';
    h += '<div><dt>Last review</dt><dd' + (isStale(doc) ? ' class="doc-stale"' : '') + '>' + esc(doc.lastReview) + '</dd></div>';
    h += '<div><dt>Cycle</dt><dd>' + esc(doc.reviewCycle) + '</dd></div>';
    h += '</dl>';
    h += '<div class="doc-excerpts">';
    doc.excerpt.forEach(function (line) {
      h += '<p class="doc-excerpt"><span class="excerpt-mark" aria-hidden="true">§</span>' + esc(line) + '</p>';
    });
    h += '</div></div></article>';
    h += '</div></div>';
    return h;
  }

  // ═════════════════════════ DOCKET DESK ═══════════════════════════════════
  function docket(mode, state) {
    var items = docketForMode(mode);
    var item = PANEL_UI.docketActiveId
      ? items.filter(function (i) { return i.id === PANEL_UI.docketActiveId; })[0] || items[0]
      : items[0];
    var ds = (item && state.dockets[item.id]) || { attempts: 0 };

    var filed = !!ds.filed;
    var citeOk = item.acceptedCites.length > 0
      ? !!ds.cited && item.acceptedCites.indexOf(ds.cited) !== -1
      : !ds.cited;
    var stampOk = ds.stamp === item.acceptedStamp;
    var verdict = filed ? (citeOk && stampOk ? 'correct' : 'incorrect') : null;
    var stampPicked = ds.stamp !== undefined;
    var ticketLocked = filed; // R2: after validate, the answer cannot be changed

    var h = '<div class="stack-4">';
    h += '<p class="panel panel-amber pad-inline-3 note-line">Requests arrive at the docket window. For each ticket: <strong>cite the governing document</strong> from the Registry, choose a <strong>disposition stamp</strong>, and submit. <span class="text-faint">TRAINING DATA — fictional tickets.</span></p>';
    h += '<div class="docket-grid">';

    // Queue
    h += '<ul class="docket-queue" aria-label="Request docket queue">';
    items.forEach(function (it) {
      var rec = state.dockets[it.id];
      var active = it.id === item.id;
      var badge;
      if (rec && verdictFor(state, it) === 'correct') {
        badge = '<span class="qbadge qbadge-stamped">STAMPED</span>';
      } else if (rec && rec.attempts) {
        badge = '<span class="qbadge qbadge-draft">DRAFT</span>';
      } else {
        badge = '<span class="qbadge qbadge-new">NEW</span>';
      }
      h +=
        '<li><button type="button" onclick="App.setDocketActive(\'' + it.id + '\')" aria-current="' + (active ? 'true' : 'false') + '"' +
        ' class="ticket-link' + (active ? ' ticket-link-active' : '') + '">' +
        '<span class="ticket-id">' + esc(it.id) + '</span>' +
        '<span class="ticket-subject">' + esc(it.subject) + '</span>' +
        '<span class="ticket-badge">' + badge + '</span>' +
        '</button></li>';
    });
    h += '</ul>';

    // Active ticket
    h += '<section aria-label="Ticket ' + esc(item.id) + '" class="ticket-pane">';
    h += '<header class="ticket-head">';
    h += '<div class="flex-wrap-baseline"><span class="ticket-id-lg">' + esc(item.id) + '</span>' +
      '<h3 class="ticket-title">' + esc(item.subject) + '</h3></div>';
    h += '<p class="ticket-from">From: ' + esc(item.from) + ' · ' + esc(item.role) + '</p>';
    h += '</header>';
    h += '<div class="ticket-body">';
    h += '<div class="ticket-message">';
    item.body.forEach(function (p) {
      h += '<p class="body-text">' + esc(p) + '</p>';
    });
    h += '</div>';

    h += '<div class="mt-3">';
    h += '<label for="cite-' + esc(item.id) + '" class="field-label">Citation — governing document code</label>';
    h += '<select id="cite-' + esc(item.id) + '" data-fid="cite-' + esc(item.id) + '"' +
      ' value="' + esc(ds.cited || '') + '"' +
      (ds.stamp === 'none' || ticketLocked ? ' disabled' : '') +
      ' onchange="App.setDocketCite(\'' + item.id + '\', this.value)" class="cite-select select-mono">';
    h += '<option value="">Select a document…</option>';
    DATA.REGISTRY.forEach(function (d) {
      h += '<option value="' + esc(d.code) + '"' + (ds.cited === d.code ? ' selected' : '') + '>' + esc(d.code) + ' — ' + esc(d.title) + '</option>';
    });
    h += '</select></div>';

    h += '<div class="mt-3">';
    h += '<span class="field-label field-label-block">Disposition stamp</span>';
    h += UI.stampPicker({
      value: ds.stamp,
      onChange: "App.setDocketStamp('" + item.id + "', {stamp})",
      disabled: ticketLocked,
    });
    h += '</div>';

    h += '<div class="flex-wrap-gap mt-3">';
    if (!ticketLocked) {
      h += '<button type="button" onclick="App.fileDocket(\'' + item.id + '\')"' +
        (stampPicked ? '' : ' disabled') +
        ' class="btn btn-primary">Stamp &amp; file the ticket</button>';
    }
    if (verdict === 'incorrect') {
      h += '<button type="button" onclick="App.clearDocketRetry(\'' + item.id + '\')" class="btn btn-outline-red">Clear &amp; retry</button>';
    }
    if (verdict) {
      h += '<span role="status" class="' + (verdict === 'correct' ? 'verdict verdict-ok' : 'verdict verdict-bad') + '">' +
        (verdict === 'correct' ? '✓ Filed correctly — ticket locked' : '✗ Not correct — answer locked; clear &amp; retry to re-answer') +
        '</span>';
    }
    if (ds.attempts > 0) {
      h += '<span class="text-xs-faint">Submissions: ' + ds.attempts + '</span>';
    }
    h += '</div>';
    h += '<p class="text-xs-faint mt-2">Stamps: ' + esc(DATA.STAMPS.comply.label) + ' · ' + esc(DATA.STAMPS.exception.label) +
      ' · ' + esc(DATA.STAMPS.advisory.label) + ' · ' + esc(DATA.STAMPS.none.label) +
      '. Filing a ticket locks its answer (clear &amp; retry to re-answer). Objective feedback explains the WHY on check.</p>';
    h += '</div></section>';
    h += '</div></div>';
    return h;
  }

  // ═════════════════════════ AUDIT DESK ════════════════════════════════════
  var AUDIT_CLAIMS = [
    { id: 'F1', claim: 'The registry contains no Acceptable Use Policy.', evidence: 'GOV-POL-01' },
    { id: 'F2', claim: 'The Disaster Recovery Policy has no supporting recovery procedure in the registry.', evidence: 'GOV-POL-05' },
    { id: 'F3', claim: 'The registry contains no Encryption Standard.', evidence: 'GOV-STD-03' },
    { id: 'F4', claim: 'The Incident Response Playbook is missing from the registry.', evidence: 'GOV-PRC-03' },
    { id: 'F5', claim: 'GOV-STD-05 is misclassified: its text is advisory, not a mandatory standard.', evidence: 'GOV-STD-05' },
    { id: 'F6', claim: 'The Change Management Procedure lacks an emergency path.', evidence: 'GOV-PRC-01' },
    { id: 'F7', claim: 'The Password Standard is stale — last reviewed in 2019 despite an annual review cycle.', evidence: 'GOV-STD-01' },
    { id: 'F8', claim: 'Guidelines in the registry exceed the annual review cycle.', evidence: 'GOV-GLD-01' },
  ];

  function audit(state) {
    // R2: findings checked by a validated objective are locked (fail or pass).
    // M7 guards F2, M8 guards F5 (+ follow-up), H2 guards the whole audit.
    var m7 = state.objectives['OBJ-M7'];
    var m8 = state.objectives['OBJ-M8'];
    var h2 = state.objectives['OBJ-H2'];
    var lockAll = !!(h2 && h2.locked);
    function isLocked(id) {
      return lockAll ||
        (id === 'F2' && !!(m7 && m7.locked)) ||
        (id === 'F5' && !!(m8 && m8.locked));
    }
    var anyLocked = lockAll || !!(m7 && m7.locked) || !!(m8 && m8.locked);

    var h = '<div class="stack-3">';
    h += '<p class="panel panel-amber pad-inline-3 note-line">' + icon('folder-open', 'icon-inline') +
      ' Audit Desk: verify each claim against the cited registry document before confirming it. Confirming a false claim is as damaging as missing a real defect. <span class="text-faint">TRAINING DATA — fictional registry.</span></p>';
    if (anyLocked) {
      h += '<p class="locked-note">Some findings are locked — they were already checked by an objective (CHECK RESULTS). Use "Clear &amp; retry" on that objective to re-answer.</p>';
    }
    h += '<ul class="stack-2 list-plain">';
    AUDIT_CLAIMS.forEach(function (f) {
      var checked = !!state.auditChecks[f.id];
      var locked = isLocked(f.id);
      h += '<li class="panel pad-3">';
      h += '<div class="finding-row">';
      h += '<label class="finding-label">';
      h += '<input type="checkbox" data-fid="audit-' + esc(f.id) + '"' + (checked ? ' checked' : '') +
        (locked ? ' disabled' : '') +
        ' onchange="App.toggleAudit(\'' + f.id + '\')" aria-label="Confirm finding: ' + esc(f.claim) + '"' +
        (locked ? ' aria-disabled="true"' : '') + ' />';
      h += '<span class="finding-text"><span class="finding-id">' + esc(f.id) + '</span>' + esc(f.claim) + '</span>';
      h += '</label>';
      h += '<span class="finding-evidence"><span class="text-xs-faint">Evidence:</span>' +
        UI.docChip(f.evidence, "onclick=\"App.openRegistryDoc('" + f.evidence + "')\"") + '</span>';
      h += '</div>';
      if (f.id === 'F5' && checked) {
        h += '<div class="misfile-followup">';
        h += '<label for="misfile-answer" class="field-label">Follow-up: GOV-STD-05 should really be classed as a…</label>';
        h += '<select id="misfile-answer" data-fid="misfile-answer"' + (locked ? ' disabled' : '') +
          ' onchange="App.setMisfile(this.value)" class="select-plain mt-1">';
        h += '<option value="">Select class…</option>';
        [['policy', 'Policy'], ['standard', 'Standard'], ['procedure', 'Procedure'], ['guideline', 'Guideline']].forEach(function (o) {
          h += '<option value="' + o[0] + '"' + (state.misfileAnswer === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
        });
        h += '</select></div>';
      }
      h += '</li>';
    });
    h += '</ul></div>';
    return h;
  }

  // ═══════════════ Objective exercises (inline interaction per objective) ══
  function openDocketBtn() {
    return '<button type="button" onclick="App.setTab(\'docket\')" class="btn btn-outline-red btn-muted-bg">Open the Docket window →</button>';
  }
  function openAuditBtn() {
    return '<button type="button" onclick="App.setTab(\'audit\')" class="btn btn-outline-red btn-muted-bg">Open the Audit Desk →</button>';
  }

  // Hard-mode exception workflow (gated steps)
  function exceptionWorkflow(state, locked) {
    var h3 = state.h3;
    function stepHead(n, title) {
      var h = '<div class="step-head">';
      h += '<span class="step-dot ' + (h3.step > n ? 'step-dot-done' : 'step-dot-active') + '">' + n + '</span>';
      h += '<span class="step-title">' + esc(title) + '</span>';
      if (h3.step <= n) h += '<span class="step-active-tag">active</span>';
      h += '</div>';
      return h;
    }
    function stepSelect(fid, n, value, options, onChange, mono) {
      var dis = locked || h3.step < n;
      var h = '<select data-fid="' + esc(fid) + '" aria-label="' + esc(fid.replace('h3-', 'Step ' + n + ': ')) + '"' +
        (dis ? ' disabled' : '') +
        ' onchange="' + esc(onChange) + '" class="select-plain select-full' + (mono ? ' select-mono' : '') + '">';
      h += '<option value="">Select…</option>';
      options.forEach(function (o) {
        h += '<option value="' + esc(o[0]) + '"' + (value === o[0] ? ' selected' : '') + '>' + esc(o[1]) + '</option>';
      });
      h += '</select>';
      return h;
    }
    var h = '<div class="panel pad-3 exception-workflow">';
    h += '<p class="text-xs-faint">Steps unlock in order — the sequence itself is graded. Based on ticket R-204 (VIP MFA).</p>';
    h += '<div>' + stepHead(1, 'Disposition') +
      stepSelect('h3-stamp', 1, h3.stamp, [
        ['comply', 'COMPLY — grant it'],
        ['exception', 'REFER TO EXCEPTION'],
        ['advisory', 'ADVISORY ONLY'],
        ['none', 'NO GOVERNING DOCUMENT'],
      ], "App.setException('stamp', this.value)") + '</div>';
    h += '<div>' + stepHead(2, 'Citation') +
      stepSelect('h3-cited', 2, h3.cited, [
        ['GOV-POL-02', 'GOV-POL-02'],
        ['GOV-STD-01', 'GOV-STD-01'],
        ['GOV-STD-02', 'GOV-STD-02'],
        ['GOV-STD-03', 'GOV-STD-03'],
        ['GOV-STD-04', 'GOV-STD-04'],
      ], "App.setException('cited', this.value)", true) + '</div>';
    h += '<div>' + stepHead(3, 'Approver') +
      stepSelect('h3-approver', 3, h3.approver, [
        ['vp', 'The requesting VP herself'],
        ['ciso', 'The CISO (per the exception rule)'],
        ['manager', 'Her line manager'],
        ['change', 'The on-call change manager'],
      ], "App.setException('approver', this.value)") + '</div>';
    h += '<div>' + stepHead(4, 'Required artifact') +
      stepSelect('h3-artifact', 4, h3.artifact, [
        ['verbal', 'A verbal OK on a call'],
        ['chat', 'A chat message from the approver'],
        ['riskaccept', 'Written risk acceptance with expiry, recorded in the exception register'],
        ['nothing', 'No artifact needed'],
      ], "App.setException('artifact', this.value)") + '</div>';
    if (!locked) {
      h += '<button type="button" onclick="App.resetExceptionSequence()" class="reset-seq-btn">Reset sequence</button>';
    }
    h += '</div>';
    return h;
  }

  function exerciseHtml(obj, state) {
    var id = obj.id;
    var oSt = state.objectives[id];
    // R2: once checked (fail or pass), the inline answers are locked.
    var exDisabled = !!oSt && (oSt.solved || !!oSt.locked);
    function M(key, item) {
      return (state.matchings[key] || {})[item];
    }

    switch (id) {
      case 'OBJ-M1':
        // Rows deliberately non-canonical — order must not reveal the answers (R6)
        return '<div>' +
          UI.matchRow({ name: 'M1B', labelHtml: '<span><strong>B.</strong> Specific, measurable technical requirement — says WHAT EXACTLY</span>', options: OPT_CLASSES, value: M('m1', 'B'), onChange: "App.setMatch('m1', 'B', this.value)", disabled: exDisabled, ariaLabel: 'M1B' }) +
          UI.matchRow({ name: 'M1D', labelHtml: '<span><strong>D.</strong> Recommended best practice for when no hard rule exists</span>', options: OPT_CLASSES, value: M('m1', 'D'), onChange: "App.setMatch('m1', 'D', this.value)", disabled: exDisabled, ariaLabel: 'M1D' }) +
          UI.matchRow({ name: 'M1A', labelHtml: '<span><strong>A.</strong> Management-approved statement of intent — says WHAT and WHY</span>', options: OPT_CLASSES, value: M('m1', 'A'), onChange: "App.setMatch('m1', 'A', this.value)", disabled: exDisabled, ariaLabel: 'M1A' }) +
          UI.matchRow({ name: 'M1C', labelHtml: '<span><strong>C.</strong> Ordered, task-level instructions — says HOW, step by step</span>', options: OPT_CLASSES, value: M('m1', 'C'), onChange: "App.setMatch('m1', 'C', this.value)", disabled: exDisabled, ariaLabel: 'M1C' }) +
          '</div>';
      case 'OBJ-M2':
        return '<div>' +
          '<p class="text-xs-faint mb-1">Three lines pulled from different registry documents:</p>' +
          UI.matchRow({ name: 'M2Y', labelHtml: '<span><strong>Y.</strong> “All laptops must use full-disk encryption with AES-256.”</span>', options: OPT_CLASSES, value: M('m2', 'Y'), onChange: "App.setMatch('m2', 'Y', this.value)", disabled: exDisabled, ariaLabel: 'M2Y' }) +
          UI.matchRow({ name: 'M2X', labelHtml: '<span><strong>X.</strong> “MFL shall protect the confidentiality, integrity and availability of shipment, customer and personnel data.”</span>', options: OPT_CLASSES, value: M('m2', 'X'), onChange: "App.setMatch('m2', 'X', this.value)", disabled: exDisabled, ariaLabel: 'M2X' }) +
          UI.matchRow({ name: 'M2Z', labelHtml: '<span><strong>Z.</strong> “STEP 1 — Obtain verbal approval from the on-call change manager.”</span>', options: OPT_CLASSES, value: M('m2', 'Z'), onChange: "App.setMatch('m2', 'Z', this.value)", disabled: exDisabled, ariaLabel: 'M2Z' }) +
          '</div>';
      case 'OBJ-M3': {
        var m3docs = [
          ['GOV-STD-04', 'Physical Security Standard'],
          ['GOV-GLD-01', 'Remote Work & Travel Security Guideline'],
          ['GOV-PRC-03', 'IR Playbook — Ransomware'],
          ['GOV-POL-05', 'Disaster Recovery Policy'],
        ];
        var h = '<div>';
        m3docs.forEach(function (d) {
          h += UI.matchRow({
            name: d[0],
            labelHtml: '<span>' + UI.docChip(d[0]) + ' <span class="ml-1">' + esc(d[1]) + '</span></span>',
            options: OPT_CLASSES,
            value: M('m3', d[0]),
            onChange: "App.setMatch('m3', '" + d[0] + "', this.value)",
            disabled: exDisabled,
            ariaLabel: d[0],
          });
        });
        return h + '</div>';
      }
      case 'OBJ-M4':
      case 'OBJ-M5':
      case 'OBJ-M6':
      case 'OBJ-M9':
      case 'OBJ-H1': {
        var req = {
          'OBJ-M4': ['R-101', 'R-104', 'R-102'],
          'OBJ-M5': ['R-103', 'R-105', 'R-106'],
          'OBJ-M6': ['R-107'],
          'OBJ-M9': ['R-109'],
          'OBJ-H1': ['R-201', 'R-202', 'R-203', 'R-204', 'R-205', 'R-206'],
        };
        var items = docketForMode(state.mode).filter(function (d) { return req[id].indexOf(d.id) !== -1; });
        var h = '<div class="stack-2"><ul class="stack-1 list-plain">';
        items.forEach(function (it) {
          var st = docketStatusOf(state, it);
          h += '<li class="docket-ref-row">' +
            '<span class="ticket-id">' + esc(it.id) + '</span>' +
            '<span class="docket-ref-subject">' + esc(it.subject) + '</span>' +
            '<span class="docket-status ' + st.c + '">' + esc(st.t) + '</span>' +
            '</li>';
        });
        h += '</ul>' + openDocketBtn() + '</div>';
        return h;
      }
      case 'OBJ-M7':
      case 'OBJ-H2': {
        var h = '<div class="stack-2 text-sm">';
        h += '<div class="panel pad-inline-3">';
        if (id === 'OBJ-M7') {
          h += 'Confirmed gap finding (F2): <strong class="' + (state.auditChecks['F2'] ? 'text-ok' : 'text-bad') + '">' +
            (state.auditChecks['F2'] ? 'CONFIRMED' : 'not yet confirmed') + '</strong>';
        } else {
          var confirmed = Object.keys(state.auditChecks).filter(function (k) { return state.auditChecks[k]; }).length;
          h += 'Audit tally — confirmed: <strong class="text-ink">' + confirmed + '</strong> of 8 claims. Target: exactly the 3 planted defects (a gap, a misfile, a stale review).';
        }
        h += '</div>';
        h += openAuditBtn();
        return h + '</div>';
      }
      case 'OBJ-M8': {
        var h = '<div class="stack-2 text-sm">';
        h += '<div class="panel pad-inline-3">Finding F5 ' +
          (state.auditChecks['F5'] ? '<strong class="text-ok">confirmed</strong>' : '<strong class="text-bad">not confirmed</strong>') +
          ' · follow-up answer: <strong>' + esc(state.misfileAnswer || '—') + '</strong></div>';
        h += openAuditBtn();
        return h + '</div>';
      }
      case 'OBJ-M10':
        // Rows deliberately non-canonical — order must not reveal the answers (R6)
        return '<div>' +
          UI.matchRow({ name: 'M10-RC', labelHtml: '<span><strong>RC.</strong> Determines the purposes and means of processing personal data</span>', options: OPT_ROLES, value: M('m10', 'RC'), onChange: "App.setMatch('m10', 'RC', this.value)", disabled: exDisabled, ariaLabel: 'M10-RC' }) +
          UI.matchRow({ name: 'M10-RS', labelHtml: '<span><strong>RS.</strong> Implements and maintains the safeguards day-to-day</span>', options: OPT_ROLES, value: M('m10', 'RS'), onChange: "App.setMatch('m10', 'RS', this.value)", disabled: exDisabled, ariaLabel: 'M10-RS' }) +
          UI.matchRow({ name: 'M10-RO', labelHtml: '<span><strong>RO.</strong> Approves access to the data set and sets its classification</span>', options: OPT_ROLES, value: M('m10', 'RO'), onChange: "App.setMatch('m10', 'RO', this.value)", disabled: exDisabled, ariaLabel: 'M10-RO' }) +
          UI.matchRow({ name: 'M10-RP', labelHtml: '<span><strong>RP.</strong> Processes personal data on behalf of the controller, under its instructions</span>', options: OPT_ROLES, value: M('m10', 'RP'), onChange: "App.setMatch('m10', 'RP', this.value)", disabled: exDisabled, ariaLabel: 'M10-RP' }) +
          '</div>';
      case 'OBJ-M11':
        return '<div>' +
          UI.matchRow({ name: 'M11-D1', labelHtml: '<span><strong>D1.</strong> National Data Protection Act — organizational privacy obligations <em>(regulation)</em></span>', options: OPT_DOCS, value: M('m11', 'D1'), onChange: "App.setMatch('m11', 'D1', this.value)", disabled: exDisabled, ariaLabel: 'M11-D1' }) +
          UI.matchRow({ name: 'M11-D2', labelHtml: '<span><strong>D2.</strong> Industry scheme: encrypted telemetry for cargo trackers <em>(industry standard)</em></span>', options: OPT_DOCS, value: M('m11', 'D2'), onChange: "App.setMatch('m11', 'D2', this.value)", disabled: exDisabled, ariaLabel: 'M11-D2' }) +
          UI.matchRow({ name: 'M11-D3', labelHtml: '<span><strong>D3.</strong> Key customer contract: 24-hour breach notification clause <em>(contract)</em></span>', options: OPT_DOCS, value: M('m11', 'D3'), onChange: "App.setMatch('m11', 'D3', this.value)", disabled: exDisabled, ariaLabel: 'M11-D3' }) +
          '</div>';
      case 'OBJ-M12':
        return UI.orderTray({
          label: 'Delegation chain order',
          items: [
            { id: 'p', label: 'Policy — management intent (WHAT & WHY)' },
            { id: 's', label: 'Standard — measurable requirement (WHAT EXACTLY)' },
            { id: 'r', label: 'Procedure — executable steps (HOW)' },
            { id: 'g', label: 'Guideline — recommended advice' },
          ],
          value: state.orders['m12'] || ['r', 'p', 'g', 's'],
          onChange: "App.moveOrder('m12', {i}, {d})",
          disabled: exDisabled,
        });
      case 'OBJ-H3':
        return exceptionWorkflow(state, exDisabled);
      case 'OBJ-H4': {
        var rows = [
          ['L1', '“Passphrases must be at least 14 characters.” (GOV-STD-01)'],
          ['L2', '“Staff are encouraged to use the VPN whenever they use open Wi-Fi.” (GOV-GLD-01)'],
          ['L3', '“All changes to production systems shall be reviewed and approved before implementation.” (GOV-POL-06)'],
          ['L4', '“Consider double-checking recipient lists before sending customer data.” (GOV-GLD-02)'],
          ['L5', '“Visitor badges expire at close of business on the day of issue.” (GOV-STD-04)'],
          ['L6', '“It is generally a good idea to review default accounts from time to time.” (GOV-STD-05)'],
        ];
        var optBin = [{ value: 'mandatory', label: 'MANDATORY' }, { value: 'advisory', label: 'ADVISORY' }];
        // Rows deliberately non-alternating — order must not reveal the answers (R6)
        var h = '<div>';
        rows.forEach(function (r) {
          h += UI.matchRow({ name: 'H4-' + r[0], labelHtml: esc(r[1]), options: optBin, value: M('h4', r[0]), onChange: "App.setMatch('h4', '" + r[0] + "', this.value)", disabled: exDisabled, ariaLabel: r[1] });
        });
        return h + '</div>';
      }
      case 'OBJ-H5':
        return '<div>' +
          UI.matchRow({ name: 'H5-policy', labelHtml: 'Layer 1 — the POLICY that intends encryption at rest:', options: OPT_ALLDOCS, value: M('h5', 'policy'), onChange: "App.setMatch('h5', 'policy', this.value)", disabled: exDisabled, ariaLabel: 'H5-policy' }) +
          UI.matchRow({ name: 'H5-clause', labelHtml: 'Layer 2 — the STANDARD clause that makes it measurable:', options: [
            { value: 'aes256', label: 'AES-256; keys generated & stored in the MFL key vault (HSM)' },
            { value: 'aes128', label: 'AES-128 for depot backup media' },
            { value: 'norule', label: '“Staff should classify shipment manifests before sharing.”' },
          ], value: M('h5', 'clause'), onChange: "App.setMatch('h5', 'clause', this.value)", disabled: exDisabled, ariaLabel: 'H5-clause' }) +
          UI.matchRow({ name: 'H5-step', labelHtml: 'Layer 3 — the PROCEDURE step that executes it:', options: [
            { value: 'provision', label: 'Onboarding step 3: laptop imaged with disk encryption enabled BEFORE handover' },
            { value: 'aup', label: 'Onboarding step 4: signed AUP acknowledgment before access' },
            { value: 'matrix', label: 'Onboarding step 2: accounts strictly per the role-access matrix' },
          ], value: M('h5', 'step'), onChange: "App.setMatch('h5', 'step', this.value)", disabled: exDisabled, ariaLabel: 'H5-step' }) +
          '</div>';
      case 'OBJ-H6':
        return '<div>' +
          UI.orderTray({
            label: 'Offboarding sequence',
            items: [
              { id: 'notify', label: 'Manager notifies IT of the departure' },
              { id: 'disable', label: 'Disable all accounts and tokens' },
              { id: 'recover', label: 'Recover badges, keys and assets' },
              { id: 'revoke', label: 'Revoke certificates and vault-held keys' },
              { id: 'recert', label: 'Data owners complete access recertification within 30 days' },
            ],
            value: state.orders['h6'] || ['recover', 'notify', 'recert', 'disable', 'revoke'],
            onChange: "App.moveOrder('h6', {i}, {d})",
            disabled: exDisabled,
          }) +
          '<div class="mt-2">' +
          UI.matchRow({ name: 'H6-std', labelHtml: 'This sequence enforces the revocation deadline in which standard?', options: [
            { value: 'GOV-STD-01', label: 'GOV-STD-01 — Password Standard' },
            { value: 'GOV-STD-02', label: 'GOV-STD-02 — Access Control Standard' },
            { value: 'GOV-STD-03', label: 'GOV-STD-03 — Encryption Standard' },
            { value: 'GOV-STD-04', label: 'GOV-STD-04 — Physical Security Standard' },
          ], value: M('h6s', 'std'), onChange: "App.setMatch('h6s', 'std', this.value)", disabled: exDisabled, ariaLabel: 'H6-std' }) +
          '</div></div>';
      case 'OBJ-H7':
        return '<div>' +
          UI.matchRow({ name: 'H7-E1', labelHtml: '<span><strong>E1.</strong> Privacy regulation: national Data Protection Act <em>(regulation)</em></span>', options: OPT_DOCS, value: M('h7', 'E1'), onChange: "App.setMatch('h7', 'E1', this.value)", disabled: exDisabled, ariaLabel: 'H7-E1' }) +
          UI.matchRow({ name: 'H7-E2', labelHtml: '<span><strong>E2.</strong> Industry scheme: encrypted cargo telemetry <em>(industry standard)</em></span>', options: OPT_DOCS, value: M('h7', 'E2'), onChange: "App.setMatch('h7', 'E2', this.value)", disabled: exDisabled, ariaLabel: 'H7-E2' }) +
          UI.matchRow({ name: 'H7-E3', labelHtml: '<span><strong>E3.</strong> Customer contract: 24-hour breach notice <em>(contract)</em></span>', options: OPT_DOCS, value: M('h7', 'E3'), onChange: "App.setMatch('h7', 'E3', this.value)", disabled: exDisabled, ariaLabel: 'H7-E3' }) +
          UI.matchRow({ name: 'H7-E4', labelHtml: '<span><strong>E4.</strong> Regional labor rules on new-hire documentation <em>(local rule)</em></span>', options: OPT_DOCS, value: M('h7', 'E4'), onChange: "App.setMatch('h7', 'E4', this.value)", disabled: exDisabled, ariaLabel: 'H7-E4' }) +
          '</div>';
      case 'OBJ-H8':
        return '<div class="stack-3">' +
          UI.sequencePicker({
            label: 'First three playbook actions',
            max: 3,
            seq: state.orders['h8'] || [],
            disabled: exDisabled,
            onToggle: "App.toggleSequence('h8', {id})",
            options: [
              { id: 'isolate', label: 'Isolate the affected host(s) from the network' },
              { id: 'report', label: 'Report to the CISO within 1 hour; open the incident bridge' },
              { id: 'preserve', label: 'Preserve volatile evidence' },
              { id: 'reimage', label: 'Reimage the server immediately' },
              { id: 'pay', label: 'Engage the ransom negotiator' },
              { id: 'disable', label: 'Disable compromised accounts & reset credentials' },
            ],
          }) +
          UI.matchRow({ name: 'H8-who', labelHtml: 'GOV-POL-03: cargo/dispatch incidents must be escalated to…', options: [
            { value: 'ciso', label: 'The CISO only' },
            { value: 'committee', label: 'The Security Governance Committee' },
            { value: 'hr', label: 'HR Operations' },
            { value: 'regulator', label: 'The regulator, immediately' },
          ], value: M('h8n', 'who'), onChange: "App.setMatch('h8n', 'who', this.value)", disabled: exDisabled, ariaLabel: 'H8-who' }) +
          '</div>';
      case 'OBJ-H9':
        return '<div>' +
          UI.matchRow({ name: 'H9-first', labelHtml: 'FIRST amendment (the obligation itself):', options: OPT_ALLDOCS, value: M('h9', 'first'), onChange: "App.setMatch('h9', 'first', this.value)", disabled: exDisabled, ariaLabel: 'H9-first' }) +
          UI.matchRow({ name: 'H9-second', labelHtml: 'SECOND amendment (the execution layer):', options: OPT_ALLDOCS, value: M('h9', 'second'), onChange: "App.setMatch('h9', 'second', this.value)", disabled: exDisabled, ariaLabel: 'H9-second' }) +
          '</div>';
      default:
        return '';
    }
  }

  // ═════════════════════════ OBJECTIVES LEDGER (C4) ════════════════════════
  function objectives(state, canFile) {
    var objectivesList = objectivesForMode(state.mode);
    var hintsUsedTotal = objectivesList.reduce(function (a, o) {
      return a + ((state.objectives[o.id] && state.objectives[o.id].hints) || 0);
    }, 0);
    var solvedCount = objectivesList.filter(function (o) {
      return state.objectives[o.id] && state.objectives[o.id].solved;
    }).length;
    var isHard = state.mode === 'hard';

    var h = '<div class="stack-3">';
    h += '<div class="ledger-head">';
    h += '<span class="ledger-title">Objectives ledger — ' + solvedCount + '/' + objectivesList.length + ' stamped PASS</span>';
    h += '<button type="button" onclick="App.fileReport()"' + (canFile ? '' : ' disabled') + ' class="btn btn-green">File final report</button>';
    h += '</div>';

    objectivesList.forEach(function (obj, i) {
      var o = state.objectives[obj.id] || { solved: false, attempts: 0, hints: 0 };
      var fb = PANEL_UI.objFeedback[obj.id];
      h += '<article class="obj-card' + (o.solved ? ' obj-card-solved' : '') + '">';
      h += '<header class="obj-head">';
      h += '<span class="obj-id">' + esc(obj.id) + '</span>';
      h += UI.pillarBadge(obj.pillar);
      if (o.solved) {
        h += '<span class="obj-pass">' + icon('check-circle-2', 'icon-xs') + ' PASS</span>';
      } else {
        h += '<span class="obj-attempts">' + (o.attempts > 0 ? o.attempts + ' failed check' + (o.attempts > 1 ? 's' : '') : 'unchecked') + '</span>';
      }
      h += '</header>';
      h += '<div class="obj-body">';
      h += '<p class="obj-text">' + (i + 1) + '. ' + esc(obj.text) + '</p>';
      if (!isHard && obj.context) h += '<p class="obj-context">' + esc(obj.context) + '</p>';
      if (!isHard && obj.whereToLook) h += '<p class="obj-where">Where to look: ' + esc(obj.whereToLook) + '</p>';
      if (o.hints > 0) {
        h += '<ul class="obj-hints" aria-label="Hints revealed">';
        obj.hints.slice(0, o.hints).forEach(function (hint) {
          h += '<li>' + icon('lightbulb', 'icon-xs icon-gold') + '<span>' + esc(hint) + '</span></li>';
        });
        h += '</ul>';
      }
      h += '<div class="mt-2-5">' + exerciseHtml(obj, state) + '</div>';
      h += '<div class="flex-wrap-gap mt-3">';
      h += '<button type="button" onclick="App.checkObjective(\'' + obj.id + '\')"' +
        (o.solved || o.locked ? ' disabled' : '') +
        ' class="btn btn-primary">Check results</button>';
      if (o.locked && !o.solved) {
        h += '<button type="button" onclick="App.clearRetryObjective(\'' + obj.id + '\')" class="btn btn-outline-red">Clear &amp; retry</button>';
      }
      if (!isHard && o.hints < obj.hints.length && !o.solved) {
        h += '<button type="button" onclick="App.revealHint(\'' + obj.id + '\')" class="btn btn-outline-gold">Reveal hint ' + (o.hints + 1) + '/' + obj.hints.length + '</button>';
      }
      if (isHard && o.hints === 0 && !o.solved && hintsUsedTotal === 0) {
        h += '<button type="button" onclick="App.revealHint(\'' + obj.id + '\')" class="btn btn-outline-gold">Spend the single nudge (−8 score)</button>';
      }
      if (fb) {
        h += '<p role="status" class="obj-feedback ' + (fb.pass ? 'feedback-ok' : 'feedback-bad') + '">' +
          '<strong>' + (fb.pass ? 'PASS — ' : 'NOT YET — ') + '</strong>' + esc(fb.feedback) + '</p>';
      }
      h += '</div>';
      h += '</div></article>';
    });
    h += '</div>';
    return h;
  }

  // ═════════════════════════ QUIZ (C5) ═════════════════════════════════════
  function quiz(state) {
    var items = state.mode === 'medium' ? DATA.QUIZ_MEDIUM : DATA.QUIZ_HARD;
    var drafts = PANEL_UI.quizDrafts;
    var firstUnlocked = -1;
    for (var i = 0; i < items.length; i++) {
      if (state.quiz[items[i].id] === undefined) { firstUnlocked = i; break; }
    }
    var allLocked = firstUnlocked === -1;
    // Enforced progression: the student always faces the first unanswered question.
    var idx = Math.min(PANEL_UI.quizCursor, allLocked ? items.length - 1 : firstUnlocked);
    var correctCount = items.filter(function (q) { return state.quiz[q.id] === String(q.answer); }).length;
    var lockedCount = items.filter(function (q) { return state.quiz[q.id] !== undefined; }).length;

    var h = '<div class="stack-3">';
    h += '<div class="panel panel-amber pad-inline-3 note-line">' + icon('graduation-cap', 'icon-inline') + ' ' +
      (state.mode === 'medium'
        ? 'Knowledge check — 6 concept questions, one at a time. Lock an answer to see the explanation; wrong locks are teaching moments.'
        : 'Scenario check — 7 items requiring application, not recall, one at a time. Efficiency and accuracy drive the score.') +
      '<span class="quiz-progress">' +
      (allLocked
        ? 'Complete: ' + correctCount + '/' + items.length + ' correct'
        : 'Question ' + (idx + 1) + ' of ' + items.length + ' · locked ' + lockedCount + '/' + items.length) +
      '</span></div>';

    if (allLocked) {
      h += '<div class="quiz-done-banner">Quiz complete — ' + correctCount + '/' + items.length + ' correct. Finish the ledger, then file your final report.</div>';
      items.forEach(function (q, i) {
        h += UI.quizCard({ q: q, index: i, quizState: state.quiz });
      });
    } else {
      var q = items[idx];
      h += UI.quizCard({
        q: q,
        index: idx,
        quizState: state.quiz,
        drafts: drafts,
        onDraft: "App.setQuizDraft('" + q.id + "', {oi})",
        onLock: "App.lockQuiz('" + q.id + "')",
      });
      if (state.quiz[q.id] !== undefined) {
        h += '<button type="button" onclick="App.quizNext()" class="btn btn-green">Next question →</button>';
      }
    }
    h += '</div>';
    return h;
  }

  // ═════════════════════════ DEBRIEF (C6) ══════════════════════════════════
  function debrief() {
    var h = '<div class="stack-4">';
    h += '<section class="panel panel-strong pad-4">';
    h += '<h2 class="h2 flex-center-gap">' + icon('shield-check', 'icon-lg icon-green') + ' Field notes — governance as detection &amp; mitigation</h2>';
    h += '<div class="debrief-grid mt-3">';
    h += '<div><h3 class="h4-red">Verification / detection opportunities</h3><ul class="nice-list mt-1-5">';
    h += '<li>• <strong>Registry completeness audit:</strong> walk each policy’s delegation chain (standard? procedure?) — GOV-POL-05’s missing DR procedure was exactly this check.</li>';
    h += '<li>• <strong>Language audit:</strong> scan for advisory verbs (“should/consider”) inside mandatory codes — catches misfiles like GOV-STD-05.</li>';
    h += '<li>• <strong>Review-cycle monitoring:</strong> compare lastReview vs reviewCycle — GOV-STD-01 (2019) is a stale control that no longer matches current threats.</li>';
    h += '<li>• <strong>Exception register review:</strong> every exception should have an approver, a written acceptance and an expiry; informal exceptions are unmanaged risk.</li>';
    h += '<li>• <strong>Onboarding/offboarding sampling:</strong> pick recent joiners/leavers and verify the GOV-PRC-02 sequence actually ran (access revoked within 24 h).</li>';
    h += '<li>• <strong>Change-adherence sampling:</strong> compare CAB minutes against production change tickets (GOV-PRC-01 emergency path).</li>';
    h += '</ul></div>';
    h += '<div><h3 class="h4-red">Mitigation recommendations</h3>';
    h += '<table class="debrief-table mt-1-5"><thead><tr><th>Gap found</th><th>Remediation</th><th>Verify by</th></tr></thead><tbody>';
    var rows = [
      ['Policy without execution layer', 'Author the missing standard/procedure (owner assigned)', 'Chain-walk audit'],
      ['Misclassified document', 'Re-class + re-issue under the right code (advisory vs mandatory)', 'Language audit'],
      ['Stale standard', 'Scheduled review with owner sign-off (GOV-STD-01)', 'Review-cycle report'],
      ['Informal exceptions', 'Route through GOV-POL-02 exception rule (CISO, register, expiry)', 'Exception register review'],
      ['External change (regulation)', 'Amend intent document first, then execution layer (see OBJ-H9)', 'Traceability matrix'],
    ];
    rows.forEach(function (r) {
      h += '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td></tr>';
    });
    h += '</tbody></table></div>';
    h += '</div></section>';

    h += '<div class="grid-2 mt-0">';
    h += '<section class="panel panel-amber pad-4"><h3 class="h4-blue">Blue-team takeaways</h3><ul class="nice-list mt-1-5">';
    h += '<li>• A register you can’t cite in the moment behaves as if it doesn’t exist.</li>';
    h += '<li>• Intent without an execution layer is the governance equivalent of an unmonitored port.</li>';
    h += '<li>• Enforce by language, not by title — verbs decide whether a rule binds.</li>';
    h += '<li>• Exceptions are risk decisions, not favors: approver, register, expiry.</li>';
    h += '</ul></section>';
    h += '<section class="panel panel-amber pad-4"><h3 class="h4-maroon">Red-team mindset (defensive awareness)</h3><ul class="nice-list mt-1-5">';
    h += '<li>• Attackers probe for undefined exception paths and “one-off” approvals that never expire.</li>';
    h += '<li>• Stale standards (2019 password rules) signal which controls decayed — and where pressure succeeds.</li>';
    h += '<li>• Confusing guideline with standard creates either paper walls or unenforced rules — both exploitable.</li>';
    h += '<li>• “Which document governs this?” is also the question an attacker asks — the answer maps the control surface.</li>';
    h += '</ul></section>';
    h += '</div>';

    h += '<section class="panel panel-amber pad-4"><h3 class="h3">Official reference</h3>';
    h += '<p class="body-text mt-1">Objective source (opens in a new tab): <a href="https://www.comptia.org/en-us/certifications/security/v8" target="_blank" rel="noopener noreferrer" class="ext-link">CompTIA Security+ SY0-801 exam objectives ' + icon('external-link', 'icon-xs') + '</a>. Domain 5 — Security Program Management &amp; Oversight. Next objectives in the domain: 5.2 risk management, 5.3 third-party risk, 5.4 compliance &amp; privacy, 5.5 audits &amp; assessments, 5.6 awareness practices.</p>';
    h += '<p class="mt-2 syn-note">' + icon('book-open-check', 'icon-xs') + ' All lab data above is synthetic training material.</p>';
    h += '</section>';
    h += '</div>';
    return h;
  }

  return {
    briefing: briefing,
    registry: registry,
    registryListHtml: registryListHtml,
    docket: docket,
    audit: audit,
    objectives: objectives,
    quiz: quiz,
    debrief: debrief,
    resetAnswersIn: resetAnswersIn,
    verdictFor: verdictFor,
  };
})();
