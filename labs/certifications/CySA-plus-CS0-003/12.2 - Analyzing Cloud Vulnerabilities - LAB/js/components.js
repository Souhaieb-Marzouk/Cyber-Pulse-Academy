// ─── SKYSCAN components: section renderers (template functions) ──────────────
// 1:1 visual port of the original framework lab's React components. Each
// renderer returns an HTML string; app.js owns all event handling via
// data-sk-* attributes. Interactions, states, wording and structure mirror
// src/components/lab/* exactly.

(function (SKY) {
  'use strict';

  var esc = SKY.esc;

  // ─── Mode select screen (mode-select.tsx) ──────────────────────────────────

  SKY.renderModeSelect = function () {
    var cards = SKY.MODES.map(function (m, idx) {
      var bullets = m.bullets.map(function (b) {
        return '<li class="sk-modecard-bullet">' +
          (b.good ? SKY.icon('check', 4) + '<span>' + esc(b.good) + '</span>' : SKY.icon('x', 4) + '<span>' + esc(b.bad) + '</span>') +
          '</li>';
      }).join('');
      return '<button type="button" data-sk-action="select-mode" data-mode="' + m.mode + '" class="sk-modecard ' + m.ring + '" aria-label="Select ' + m.mode + ' mode: ' + esc(m.tagline) + '" style="animation-delay:' + (0.12 * (idx + 1)) + 's">' +
        '<div class="sk-modecard-top">' + SKY.icon(m.icon, 6) + '<span class="sk-modecard-title ' + m.accent + '">' + esc(m.title) + '</span></div>' +
        '<p class="sk-modecard-tagline">' + esc(m.tagline) + '</p>' +
        '<ul class="sk-modecard-list">' + bullets + '</ul>' +
        '<div class="sk-modecard-foot"><span class="sk-badge sk-badge-outline">' + esc(m.time) + '</span><span class="sk-modecard-start ' + m.accent + '">START &rarr;</span></div>' +
        '</button>';
    }).join('');

    return '<div class="sk-modescreen">' +
      '<div class="sk-modescreen-inner">' +
      '<div class="sk-modehead">' +
      '<div class="sk-modehead-brand">' + SKY.icon('scan-search', 5) + '<span>SKYSCAN // CLOUD POSTURE LAB</span></div>' +
      '<h1 class="sk-modehead-title">Analyzing Cloud Vulnerabilities</h1>' +
      '<p class="sk-modehead-sub">CompTIA CySA+ CS0-003 \u00b7 Lesson 12.2 \u2014 you are the analyst operating ' + esc(SKY.ORG) + '\u2019s new cloud assessment platform.</p>' +
      '<p class="sk-synth-notice">' + SKY.icon('shield-alert', 3.5) + ' SYNTHETIC TRAINING ENVIRONMENT \u2014 every resource, log and CVE here is fictional</p>' +
      '</div>' +
      '<div class="sk-modegrid">' + cards + '</div>' +
      '<p class="sk-modefoot">Both tracks run the same assessment platform and the same estate. The report is identical \u2014 how much help you get is not.</p>' +
      '<div class="sk-modefast">' + SKY.btn('data-sk-action="select-mode" data-mode="medium"', 'sk-btn sk-btn-ghost sk-btn-quickstart', 'Just get me in (medium)') + '</div>' +
      '</div></div>';
  };

  // ─── Top bar (topbar.tsx) ──────────────────────────────────────────────────

  SKY.renderTopbar = function (state, env) {
    var verified = state.scanRescan;
    return '<header class="sk-topbar">' +
      '<div class="sk-topbar-inner">' +
      '<div class="sk-brand">' + SKY.icon('scan-search', 5) +
      '<div class="sk-brand-text"><p class="sk-brand-title">SKYSCAN</p><p class="sk-brand-sub">CLOUD POSTURE LAB \u00b7 CS0-003 12.2</p></div>' +
      '</div>' +
      '<span class="sk-badge sk-badge-outline sk-modebadge">' + (state.mode === 'hard' ? 'HARD' : 'MEDIUM') + ' TRACK</span>' +
      '<div class="sk-topbar-right">' +
      '<div class="sk-posture" title="' + (verified ? 'Posture score — verified by re-assessment' : 'Posture score — projected, run a re-assessment to verify') + '">' +
      SKY.postureDial(env.posture) +
      '<span class="sk-posture-label">POSTURE<br><span class="' + (verified ? 'sk-posture-verified' : 'sk-posture-projected') + '">' + (verified ? 'VERIFIED' : 'PROJECTED') + '</span></span>' +
      '</div>' +
      SKY.btn('data-sk-action="open-missions"', 'sk-btn-missions', SKY.icon('crosshair', 4) + '<span class="hide-sm">MISSIONS</span> ' + env.doneCount + '/' + env.totalObjectives).replace('<button ', '<button aria-label="Open missions: ' + env.doneCount + ' of ' + env.totalObjectives + ' objectives complete" ') +
      SKY.btn('data-sk-action="reset-request"', 'sk-btn-reset', SKY.icon('rotate-ccw', 4) + '<span class="hide-sm">RESET</span>').replace('<button ', '<button aria-label="Reset the lab" ') +
      '</div></div></header>';
  };

  // ─── C1 — Scenario Briefing (knowledge.tsx) ────────────────────────────────

  SKY.renderBriefing = function () {
    return '<section aria-labelledby="briefing-h" class="sk-panel sk-briefing">' +
      '<div class="sk-panel-head">' + SKY.icon('file-text', 5) + '<h2 id="briefing-h" class="sk-h2 sk-h2-amber">SCENARIO BRIEFING // TRAINING SCENARIO \u2014 SYNTHETIC DATA</h2></div>' +
      '<div class="sk-briefing-body">' + SKY.BRIEFING_HTML + '</div>' +
      '</section>';
  };

  // ─── C2 — Knowledge Core (knowledge.tsx) ───────────────────────────────────

  SKY.renderKnowledge = function (app) {
    var items = SKY.CORE.map(function (c) {
      var open = app.knowledgeOpen === c.id;
      return '<div class="sk-acc-item">' +
        '<h3 class="sk-acc-heading"><button type="button" class="sk-acc-trigger" data-sk-action="accordion" data-id="' + c.id + '" aria-expanded="' + open + '" aria-controls="sk-acc-' + c.id + '">' +
        '<span>' + esc(c.title) + '</span>' + SKY.icon('chevron-down', 4) +
        '</button></h3>' +
        '<div id="sk-acc-' + c.id + '" class="sk-acc-content' + (open ? ' sk-acc-open' : '') + '" role="region"' + (open ? '' : ' hidden') + '><div class="sk-acc-inner">' + c.html + '</div></div>' +
        '</div>';
    }).join('');

    var glossary = '<dl class="sk-glossary-list">' + SKY.GLOSSARY.map(function (g) {
      return '<div class="sk-glossary-term"><dt class="sk-glossary-dt">' + esc(g.term) + '</dt><dd class="sk-glossary-dd">' + esc(g.def) + '</dd></div>';
    }).join('') + '</dl>';

    return '<section aria-labelledby="core-h" class="sk-panel sk-knowledge">' +
      '<div class="sk-panel-head">' + SKY.icon('graduation-cap', 5) + '<h2 id="core-h" class="sk-h2 sk-h2-emerald">KNOWLEDGE CORE // read once, use everywhere</h2></div>' +
      '<div class="sk-accordion">' + items + '</div>' +
      '<div class="sk-glossary">' +
      '<button type="button" class="sk-glossary-trigger" data-sk-action="glossary" aria-expanded="' + app.glossaryOpen + '" aria-controls="sk-glossary-content">' +
      SKY.icon('book-marked', 4) + ' FIELD GLOSSARY \u2014 ' + SKY.GLOSSARY.length + ' terms' + SKY.icon('chevron-down', 4) +
      '</button>' +
      '<div id="sk-glossary-content"' + (app.glossaryOpen ? '' : ' hidden') + '>' + glossary + '</div>' +
      '</div>' +
      '</section>';
  };

  // ─── Estate tree (estate.tsx) ──────────────────────────────────────────────

  SKY.renderEstateTree = function (state, app) {
    var showCounts = state.mode === 'medium';
    var html = SKY.DOMAINS.map(function (d) {
      var domainResources = SKY.RESOURCES.filter(function (r) { return r.domain === d.id; });
      var rows = domainResources.map(function (r) {
        var flagged = state.flags.indexOf(r.id) !== -1;
        var findingCount = r.findingIds.length;
        var isInspecting = app.inspecting === r.id;
        return '<li><button type="button" data-sk-action="open-resource" data-id="' + r.id + '" class="sk-estate-res' + (flagged ? ' sk-estate-res-flagged' : '') + (isInspecting ? ' sk-estate-res-inspecting' : '') + '" aria-label="Open inspector for ' + esc(r.name) + (flagged ? ' (flagged for triage)' : '') + '">' +
          SKY.icon('file-search', 3.5) +
          '<span class="sk-estate-res-name">' + esc(r.name) + '</span>' +
          '<span class="sk-estate-res-right">' +
          (flagged ? SKY.icon('flag', 3) : '') +
          (showCounts && findingCount > 0 ? '<span class="sk-badge sk-badge-count">' + findingCount + '</span>' : '') +
          '</span></button></li>';
      }).join('');
      return '<div class="sk-estate-domain"><div class="sk-estate-domain-label">' + SKY.domainIcon(d.id, 3) + esc(d.label) + '</div><ul class="sk-estate-list">' + rows + '</ul></div>';
    }).join('');
    return '<nav aria-label="Cloud estate resources" class="sk-estate">' + html +
      '<p class="sk-estate-foot">' + (showCounts ? 'badges = finding count \u00b7 ' : '') + 'flagged = amber</p>' +
      '</nav>';
  };

  // ─── Inspector dialog content (estate.tsx InspectorDialog) ─────────────────

  SKY.inspectorHtml = function (resourceId, state, env) {
    var resource = SKY.RESOURCES.filter(function (r) { return r.id === resourceId; })[0] || null;
    if (!resource) return '';
    var linked = SKY.FINDINGS.filter(function (f) { return f.resourceId === resource.id; });
    var flagged = state.flags.indexOf(resource.id) !== -1;

    var attrs = resource.attrs.map(function (a, i) {
      return '<tr class="' + (i % 2 === 0 ? 'sk-attr-row-a' : 'sk-attr-row-b') + '">' +
        '<th scope="row" class="sk-attr-key">' + esc(a.key) + '</th>' +
        '<td class="sk-attr-value">' + esc(a.value) + '</td></tr>';
    }).join('');

    var findingsHtml = linked.length === 0
      ? '<p class="sk-inspector-clean">No findings — this resource came back clean. Not every resource is guilty.</p>'
      : '<ul class="sk-inspector-findings">' + linked.map(function (f) {
          return '<li class="sk-inspector-finding">' +
            '<div class="sk-inspector-finding-head"><span class="sk-finding-id">' + esc(f.id) + '</span>' + SKY.severityBadge(f.severity) + SKY.statusBadge(env.statusOf(f)) + '</div>' +
            '<p class="sk-inspector-finding-ev">' + esc(f.evidence) + '</p></li>';
        }).join('') + '</ul>';

    return '<div class="sk-inspector-header">' +
      '<h2 id="sk-inspector-title" class="sk-inspector-title">' + SKY.domainIcon(resource.domain, 4) + ' ' + esc(resource.name) + ' <span class="sk-inspector-type">\u00b7 ' + esc(resource.type) + '</span></h2>' +
      '<p id="sk-inspector-desc" class="sk-inspector-desc">RAW RESOURCE CONFIGURATION \u2014 synthetic training data. Evidence read here overrides report claims.</p>' +
      '</div>' +
      '<button type="button" class="sk-modal-close" data-sk-action="close-modal" aria-label="Close">' + SKY.icon('x', 4) + '</button>' +
      '<div class="sk-inspector-body">' +
      '<div><h4 class="sk-inspector-subhead">configuration attributes</h4><table class="sk-attr-table"><tbody>' + attrs + '</tbody></table></div>' +
      '<div><h4 class="sk-inspector-subhead">findings touching this resource</h4>' + findingsHtml + '</div>' +
      '</div>' +
      '<div class="sk-inspector-footer">' +
      SKY.btn('data-sk-action="toggle-flag" data-id="' + resource.id + '" aria-pressed="' + flagged + '" id="sk-flag-btn"', 'sk-btn sk-btn-flag' + (flagged ? ' sk-btn-flag-active' : ''), (flagged ? SKY.icon('flag-off', 4) : SKY.icon('flag', 4)) + (flagged ? ' UNFLAG' : ' FLAG FOR TRIAGE')) +
      '<span class="sk-inspector-footnote">' + (flagged ? 'on the triage list' : 'flag = add to triage list') + '</span>' +
      '</div>';
  };

  // ─── Assessment tab — ScanPanel (scan-panel.tsx) ───────────────────────────

  SKY.renderScanPanel = function (state, env, app) {
    var scan = app.scan;

    // running overlay
    if (scan.running) {
      var logIdx = scan.logIdx;
      var activeDomain = SKY.SCAN_SCRIPT[Math.min(logIdx, SKY.SCAN_SCRIPT.length - 1)].domain;
      var chips = SKY.DOMAINS.map(function (d) {
        var done = SKY.SCAN_SCRIPT.slice(0, logIdx + 1).some(function (s) { return s.domain === d.id; });
        var active = activeDomain === d.id;
        return '<span class="sk-chip' + (done ? ' sk-chip-done' : active ? ' sk-chip-active' : '') + '">' + esc(d.label) + '</span>';
      }).join('');
      var lines = SKY.SCAN_SCRIPT.slice(0, logIdx + 1).map(function (s, i) {
        return '<p><span class="sk-log-ts">[' + String(i * 0.35).padStart(4, '0') + 's]</span> ' + esc(s.line) + '</p>';
      }).join('');
      return '<div class="sk-scan-running">' +
        '<div class="sk-scan-status" role="status">' + SKY.icon('scan-search', 5) + ' ' + (scan.running === 'initial' ? 'RUNNING INITIAL ASSESSMENT\u2026' : 'RUNNING RE-ASSESSMENT\u2026') +
        SKY.btn('data-sk-action="skip-scan"', 'sk-btn sk-btn-ghost sk-btn-skip', SKY.icon('fast-forward', 3.5) + ' SKIP') +
        '</div>' +
        '<div class="sk-domain-chips" aria-hidden="true">' + chips + '</div>' +
        '<div id="sk-scan-log" class="sk-scan-log" role="log" aria-live="polite" aria-label="Assessment scan log">' + lines + '</div>' +
        '</div>';
    }

    // pre-scan state
    if (!state.scanInitial) {
      return '<div class="sk-scan-empty">' +
        SKY.icon('scan-search', 10) +
        '<h3 class="sk-scan-empty-title">NO ASSESSMENT DATA YET</h3>' +
        '<p class="sk-scan-empty-text">The platform has inventoried the estate but has not assessed it. Run the initial assessment to sweep all six domains — applications, instances and platform configuration.</p>' +
        SKY.btn('data-sk-action="run-scan" data-which="initial"', 'sk-btn sk-btn-scan', SKY.icon('play', 4) + ' RUN INITIAL ASSESSMENT').replace('<button ', '<button aria-label="Run initial assessment scan" ') +
        '</div>';
    }

    // report view
    var sevFilter = app.filters.sev;
    var layerFilter = app.filters.layer;
    var statusFilter = app.filters.status;

    var rows = SKY.FINDINGS.filter(function (f) {
      if (sevFilter !== 'all') {
        if (sevFilter === 'ch' && f.severity !== 'critical' && f.severity !== 'high') return false;
        if (sevFilter !== 'ch' && f.severity !== sevFilter) return false;
      }
      if (layerFilter !== 'all' && f.layer !== layerFilter) return false;
      var st = env.statusOf(f);
      if (statusFilter === 'open' && st !== 'open') return false;
      if (statusFilter === 'cleared' && st === 'open') return false;
      return true;
    });

    var counts = SKY.FINDINGS.reduce(function (acc, f) {
      acc[f.severity] = (acc[f.severity] || 0) + 1;
      return acc;
    }, {});

    var sevCounts = ['critical', 'high', 'medium', 'low', 'informational'].map(function (s) {
      var n = counts[s] || 0;
      return '<span class="sk-sevcount' + (n ? '' : ' sk-sevcount-zero') + '">' + n + ' ' + s.slice(0, 4) + '.</span>';
    }).join('');

    var filterSel = function (id, label, value, opts) {
      var o = opts.map(function (op) { return '<option value="' + op.v + '"' + (value === op.v ? ' selected' : '') + '>' + esc(op.l) + '</option>'; }).join('');
      return '<select id="' + id + '" aria-label="' + label + '" class="sk-select sk-select-filter" data-sk-filter="' + id + '">' + o + '</select>';
    };

    var bodyRows = rows.map(function (f) {
      var st = env.statusOf(f);
      return '<tr data-sk-action="open-resource" data-id="' + f.resourceId + '" tabindex="0" class="sk-report-row" aria-label="Finding ' + esc(f.id) + ': ' + esc(f.title) + '. Status ' + st + '">' +
        '<td class="sk-td sk-td-id">' + esc(f.id) + '</td>' +
        '<td class="sk-td">' + SKY.severityBadge(f.severity) + '</td>' +
        '<td class="sk-td sk-td-score">' + f.score.toFixed(1) + '</td>' +
        '<td class="sk-td sk-td-layer">' + (f.layer === 'platform' ? 'PLATFORM' : 'APP/INST') + '</td>' +
        '<td class="sk-td sk-td-resource">' + esc(f.resourceId) + '</td>' +
        '<td class="sk-td sk-td-source"><span class="sk-source">' + SKY.sourceIcon(f.dataSource, 3.5) + ' ' + esc(f.dataSource) + '</span></td>' +
        '<td class="sk-td">' + SKY.statusBadge(st) + '</td>' +
        '</tr>';
    }).join('');

    return '<div class="sk-report">' +
      '<div class="sk-report-head"><h3 class="sk-report-title">FINDINGS REPORT</h3>' +
      '<span class="sk-report-meta">' + SKY.FINDINGS.length + ' lines \u00b7 ' + env.openCount + ' open \u00b7 ' + env.clearedCount + ' cleared</span>' +
      '<span class="sk-sevcounts">' + sevCounts + '</span></div>' +
      '<div class="sk-report-filters">' +
      filterSel('sk-filter-sev', 'Filter by severity', sevFilter, [{ v: 'all', l: 'all severities' }, { v: 'ch', l: 'critical + high' }, { v: 'critical', l: 'critical' }, { v: 'high', l: 'high' }, { v: 'medium', l: 'medium' }, { v: 'low', l: 'low' }, { v: 'informational', l: 'informational' }]) +
      filterSel('sk-filter-layer', 'Filter by assessment layer', layerFilter, [{ v: 'all', l: 'all layers' }, { v: 'platform', l: 'platform config' }, { v: 'app', l: 'app / instance' }]) +
      filterSel('sk-filter-status', 'Filter by status', statusFilter, [{ v: 'all', l: 'all status' }, { v: 'open', l: 'open only' }, { v: 'cleared', l: 'cleared only' }]) +
      SKY.btn('data-sk-action="run-scan" data-which="re"' + (env.clearedCount === 0 ? ' disabled' : ''), 'sk-btn sk-btn-rescan', SKY.icon('rotate-cw', 3.5) + ' RUN RE-ASSESSMENT' + (env.clearedCount === 0 ? ' (remediate first)' : '')).replace('<button ', '<button aria-label="Run re-assessment to verify remediations" ') +
      '</div>' +
      '<div class="sk-table-wrap"><table class="sk-report-table">' +
      '<caption class="sk-sr-only">Assessment findings report. Click a row to open the resource inspector.</caption>' +
      '<thead><tr class="sk-report-headrow">' +
      '<th scope="col" class="sk-th sk-th-first">ID</th><th scope="col" class="sk-th">Sev</th><th scope="col" class="sk-th">Score</th>' +
      '<th scope="col" class="sk-th sk-col-layer">Layer</th><th scope="col" class="sk-th">Resource</th><th scope="col" class="sk-th sk-col-source">Source</th><th scope="col" class="sk-th">Status</th>' +
      '</tr></thead><tbody>' + bodyRows +
      (rows.length === 0 ? '<tr><td colspan="7" class="sk-report-empty">No findings match the current filters.</td></tr>' : '') +
      '</tbody></table></div>' +
      '<p class="sk-report-foot">click a row \u2192 raw resource evidence \u00b7 every report line includes a remediation recommendation (see the deck) \u00b7 scores are simplified CVSS-style training data</p>' +
      '</div>';
  };

  // ─── Remediation tab — deck (remediation-deck.tsx) ─────────────────────────

  SKY.renderDeck = function (state, env) {
    var mode = state.mode || 'medium';
    var cleared = SKY.FINDINGS.filter(function (f) { return env.statusOf(f) !== 'open'; });
    var open = SKY.FINDINGS.filter(function (f) { return env.statusOf(f) === 'open'; });

    var cards = open.concat(cleared).map(function (f) {
      var seq = state.applied[f.id] || [];
      var status = env.statusOf(f);
      var clearedNow = status !== 'open';

      var reqLabel =
        mode === 'hard'
          ? f.hardMode === 'sequence'
            ? f.hardRequired.length + ' actions \u00b7 ORDER MATTERS'
            : f.hardMode === 'all'
              ? f.hardRequired.length + ' actions \u00b7 ALL REQUIRED'
              : '1 action'
          : '1 action (report\u2019s first recommendation)';

      var actionsHtml = '';
      if (!clearedNow) {
        actionsHtml = '<p class="sk-deck-req">' + SKY.icon('circle-dashed', 3) + ' requires: ' + reqLabel + '</p>' +
          '<div class="sk-deck-actions">' + f.actions.map(function (a) {
            var applied = seq.indexOf(a.id) !== -1;
            var appliedWrong = applied && !clearedNow;
            return SKY.btn(
              'data-sk-action="apply" data-finding="' + f.id + '" data-action="' + a.id + '"' + (applied || clearedNow ? ' disabled' : ''),
              'sk-btn sk-btn-action' + (appliedWrong ? ' sk-btn-action-wrong' : ''),
              SKY.icon('wrench', 3.5) + ' ' + esc(a.label)
            ).replace('<button ', '<button aria-label="Apply action on ' + f.id + ': ' + esc(a.label).replace(/"/g, '&quot;') + '" ');
          }).join('') + '</div>';
      }

      var appliedHtml = '';
      if (seq.length > 0) {
        appliedHtml = '<ul class="sk-deck-applied">' + seq.map(function (aid, i) {
          var a = f.actions.filter(function (x) { return x.id === aid; })[0];
          if (!a) return '';
          return '<li><span class="sk-deck-applied-idx">[' + (i + 1) + ']</span> <span class="sk-deck-applied-label">' + esc(a.label) + '</span> — ' + esc(a.note) + '</li>';
        }).join('') + '</ul>';
      }

      return '<li class="sk-deck-card' + (clearedNow ? ' sk-deck-card-cleared' : '') + '">' +
        '<div class="sk-deck-card-head"><span class="sk-finding-id-lg">' + esc(f.id) + '</span>' + SKY.severityBadge(f.severity) + SKY.statusBadge(status) +
        '<span class="sk-deck-card-reset">' + ((seq.length > 0 && !clearedNow) ? SKY.btn('data-sk-action="reset-finding" data-finding="' + f.id + '"', 'sk-btn sk-btn-ghost sk-btn-mini', SKY.icon('rotate-ccw', 3) + ' reset').replace('<button ', '<button aria-label="Reset applied actions on ' + f.id + '" ') : '') + '</span></div>' +
        '<p class="sk-deck-title">' + esc(f.title) + '</p>' +
        '<div class="sk-deck-reco">' + SKY.icon('clipboard-list', 3) + '<span><span class="sk-deck-reco-label">REPORT RECOMMENDATION:</span> ' + esc(f.recommendation) + '</span></div>' +
        actionsHtml + appliedHtml +
        '</li>';
    }).join('');

    return '<div class="sk-deck">' +
      '<div class="sk-deck-head"><h3 class="sk-subtitle">REMEDIATION DECK</h3>' +
      '<span class="sk-subtitle-meta">apply the report\u2019s recommendations \u00b7 verify with a re-assessment</span>' +
      '<span class="sk-deck-count">' + cleared.length + '/' + SKY.FINDINGS.length + ' handled</span></div>' +
      (open.length === 0 ? '<div class="sk-deck-allclear" role="status">' + SKY.icon('circle-check-big', 4) + ' Every finding is handled. Run RUN RE-ASSESSMENT in the Assessment tab to verify — the posture score confirms it.</div>' : '') +
      '<ul class="sk-deck-list">' + cards + '</ul>' +
      '</div>';
  };

  // ─── Drills tab (drills.tsx) ───────────────────────────────────────────────

  function widgetShell(o, state, ready, note, question, body) {
    var done = state.objectives[o.id] && state.objectives[o.id].done;
    return '<div class="sk-widget">' +
      (question ? '<p class="sk-widget-q" id="' + o.id + '-q">' + esc(question) + '</p>' : '') +
      body +
      '<div class="sk-widget-actions">' +
      SKY.btn('data-sk-action="check-obj" data-obj="' + o.id + '"' + (ready ? '' : ' disabled'), 'sk-btn sk-btn-check' + (done ? ' sk-btn-recheck' : ''), done ? 'RE-CHECK' : 'SUBMIT & CHECK').replace('<button ', '<button aria-label="Check objective ' + o.id + '" ') +
      (note ? '<span class="sk-widget-note">' + esc(note) + '</span>' : '') +
      '</div></div>';
  }

  function drillToggleList(o, d, cfg, pickKey) {
    var sel = d[pickKey] || [];
    var pick = cfg.pick || 2;
    var body = cfg.options.map(function (opt, i) {
      var isSel = sel.indexOf(i) !== -1;
      var isObj = typeof opt === 'string';
      var label = isObj ? opt : opt.label;
      var key = isObj ? i : opt.key;
      var disabled = !isSel && sel.length >= pick;
      return SKY.btn(
        'data-sk-action="drill-toggle" data-obj="' + o.id + '" data-kind="' + cfg.kind + '" data-key="' + esc(String(key)) + '" data-idx="' + i + '" aria-pressed="' + isSel + '"' + (disabled ? ' disabled' : ''),
        'sk-opt' + (isSel ? ' sk-opt-on' : ''),
        esc(label)
      );
    }).join('');
    return '<div class="sk-opt-list">' + body + '</div>';
  }

  SKY.drillWidget = function (o, state, env) {
    var cfg = o.drill;
    var d = SKY.getDrill(state, o.id);

    switch (cfg.kind) {
      case 'multi': {
        var sel = d.sel || [];
        return widgetShell(o, state, sel.length === cfg.pick, sel.length + '/' + cfg.pick + ' selected', cfg.question, drillToggleList(o, d, cfg, 'sel'));
      }
      case 'pick2': {
        var pick = d.pick || [];
        var body = cfg.options.map(function (op) {
          var isSel = pick.indexOf(op.key) !== -1;
          var disabled = !isSel && pick.length >= 2;
          return SKY.btn(
            'data-sk-action="drill-toggle" data-obj="' + o.id + '" data-kind="pick2" data-key="' + esc(op.key) + '" aria-pressed="' + isSel + '"' + (disabled ? ' disabled' : ''),
            'sk-opt' + (isSel ? ' sk-opt-on' : ''),
            esc(op.label)
          );
        }).join('');
        return widgetShell(o, state, pick.length === 2, pick.length + '/2 selected', cfg.question, '<div class="sk-opt-list">' + body + '</div>');
      }
      case 'classify': {
        var cls = d.cls || {};
        var allAssigned = cfg.items.every(function (it) { return cls[it.key]; });
        var rowsC = cfg.items.map(function (it) {
          var btns = cfg.options.map(function (op) {
            var on = cls[it.key] === op.id;
            return SKY.btn('data-sk-action="drill-set" data-obj="' + o.id + '" data-field="cls" data-row="' + esc(it.key) + '" data-val="' + esc(op.id) + '" aria-pressed="' + on + '"',
              'sk-opt-toggle' + (on ? ' sk-opt-on' : ''), esc(op.label));
          }).join('');
          return '<li class="sk-drill-row"><span class="sk-drill-row-label">' + esc(it.label) + '</span><div class="sk-drill-row-opts">' + btns + '</div></li>';
        }).join('');
        return widgetShell(o, state, allAssigned, Object.keys(cls).length + '/' + cfg.items.length + ' classified', null, '<ul class="sk-drill-rows">' + rowsC + '</ul>');
      }
      case 'match': {
        var match = d.match || {};
        var allM = cfg.rows.every(function (r) { return match[r.key]; });
        var rowsM = cfg.rows.map(function (r) {
          return '<li class="sk-drill-row"><span class="sk-drill-row-label">' + esc(r.label) + '</span>' +
            SKY.select(o.id + '-match-' + r.key, 'Technique for ' + r.label, match[r.key] || '', cfg.options,
              'data-sk-select data-obj="' + o.id + '" data-field="match" data-row="' + esc(r.key) + '"', 'ATT&amp;CK ID').replace('class="sk-select"', 'class="sk-select sk-select-match"') +
            '</li>';
        }).join('');
        return widgetShell(o, state, allM, Object.keys(match).length + '/' + cfg.rows.length + ' mapped', null, '<ul class="sk-drill-rows">' + rowsM + '</ul>');
      }
      case 'resp': {
        var resp = d.resp || {};
        var allR = cfg.rows.every(function (r) { return resp[r.key]; });
        var rowsR = cfg.rows.map(function (r) {
          var btns = ['customer', 'provider'].map(function (p) {
            var on = resp[r.key] === p;
            return SKY.btn('data-sk-action="drill-set" data-obj="' + o.id + '" data-field="resp" data-row="' + esc(r.key) + '" data-val="' + p + '" aria-pressed="' + on + '"',
              'sk-opt-toggle' + (on ? ' sk-opt-on' : ''), p);
          }).join('');
          return '<li class="sk-drill-row"><span class="sk-drill-row-label">' + esc(r.label) + '</span><div class="sk-drill-row-opts">' + btns + '</div></li>';
        }).join('');
        return widgetShell(o, state, allR, Object.keys(resp).length + '/' + cfg.rows.length + ' assigned', null, '<ul class="sk-drill-rows">' + rowsR + '</ul>');
      }
      case 'order': {
        var order = d.order || cfg.items.map(function (i) { return i.key; }).slice().reverse();
        var rowsO = order.map(function (key, idx) {
          var item = cfg.items.filter(function (i) { return i.key === key; })[0];
          return '<li class="sk-order-row">' +
            '<span class="sk-order-num">' + (idx + 1) + '</span>' +
            '<span class="sk-order-label">' + esc(item.label) + '</span>' +
            '<span class="sk-order-btns">' +
            SKY.btn('data-sk-action="order-move" data-obj="' + o.id + '" data-idx="' + idx + '" data-dir="-1"' + (idx === 0 ? ' disabled' : ''), 'sk-btn sk-btn-ghost sk-btn-icon', SKY.icon('arrow-up', 3.5)).replace('<button ', '<button aria-label="Move ' + esc(item.key) + ' up" ') +
            SKY.btn('data-sk-action="order-move" data-obj="' + o.id + '" data-idx="' + idx + '" data-dir="1"' + (idx === order.length - 1 ? ' disabled' : ''), 'sk-btn sk-btn-ghost sk-btn-icon', SKY.icon('arrow-down', 3.5)).replace('<button ', '<button aria-label="Move ' + esc(item.key) + ' down" ') +
            '</span></li>';
        }).join('');
        return widgetShell(o, state, true, 'use arrows to set priority order (1 = fix first)', null, '<ol class="sk-order-list">' + rowsO + '</ol>');
      }
      case 'ids': {
        var vals = d;
        var allI = cfg.fields.every(function (fd) { return String(vals[fd.key] == null ? '' : vals[fd.key]).trim().length > 0; });
        var fields = cfg.fields.map(function (fd) {
          return '<div><label for="' + o.id + '-' + fd.key + '" class="sk-field-label">' + esc(fd.label) + '</label>' +
            '<input id="' + o.id + '-' + fd.key + '" type="text" value="' + esc(String(vals[fd.key] == null ? '' : vals[fd.key])) + '" placeholder="' + esc(fd.placeholder) + '" data-sk-input data-obj="' + o.id + '" data-key="' + fd.key + '" class="sk-input" autocomplete="off" spellcheck="false"></div>';
        }).join('');
        return widgetShell(o, state, allI, null, null, '<div class="sk-fields">' + fields + '</div>');
      }
      case 'pairs': {
        var pairs = d.pairs || {};
        var allP = cfg.rows.every(function (r) { return pairs[r.key] && pairs[r.key].finding && pairs[r.key].field; });
        var rowsP = cfg.rows.map(function (r) {
          var fVal = pairs[r.key] ? pairs[r.key].finding : '';
          var fldVal = pairs[r.key] ? pairs[r.key].field : '';
          var fOpts = '<option value="" disabled' + (fVal ? '' : ' selected') + ' hidden>finding</option>' + r.findingOptions.map(function (op) {
            return '<option value="' + esc(op) + '"' + (fVal === op ? ' selected' : '') + '>' + esc(op) + '</option>';
          }).join('');
          var lOpts = '<option value="" disabled' + (fldVal ? '' : ' selected') + ' hidden>evidence field</option>' + r.fieldOptions.map(function (op) {
            return '<option value="' + esc(op) + '"' + (fldVal === op ? ' selected' : '') + '>' + esc(op) + '</option>';
          }).join('');
          return '<li class="sk-pairs-row"><p class="sk-pairs-label">' + esc(r.label) + '</p>' +
            '<div class="sk-pairs-grid">' +
            '<select id="' + o.id + '-pairs-' + r.key + '-finding" aria-label="Finding for ' + esc(r.label) + '" class="sk-select" data-sk-select data-obj="' + o.id + '" data-field="pairs" data-row="' + esc(r.key) + '" data-sub="finding">' + fOpts + '</select>' +
            '<select id="' + o.id + '-pairs-' + r.key + '-field" aria-label="Evidence field for ' + esc(r.label) + '" class="sk-select sk-select-mono" data-sk-select data-obj="' + o.id + '" data-field="pairs" data-row="' + esc(r.key) + '" data-sub="field">' + lOpts + '</select>' +
            '</div></li>';
        }).join('');
        return widgetShell(o, state, allP, 'select the finding + the evidence field that disproves it', null, '<ul class="sk-pairs-list">' + rowsP + '</ul>');
      }
      case 'select2': {
        var s2 = d.s2 || {};
        var allS = cfg.selects.every(function (s) { return s2[s.key]; });
        var sels = cfg.selects.map(function (s) {
          return '<div><label class="sk-field-label" for="' + o.id + '-' + s.key + '">' + esc(s.label) + '</label>' +
            SKY.select(o.id + '-' + s.key, s.label, s2[s.key] || '', s.options, 'data-sk-select data-obj="' + o.id + '" data-field="s2" data-row="' + esc(s.key) + '"').replace('class="sk-select"', 'class="sk-select sk-select-wide"') +
            '</div>';
        }).join('');
        return widgetShell(o, state, allS, null, null, '<div class="sk-fields">' + sels + '</div>');
      }
    }
    return '';
  };

  SKY.renderDrills = function (state, env, app) {
    var objectives = (state.mode === 'hard' ? SKY.HARD_OBJECTIVES : SKY.MEDIUM_OBJECTIVES).filter(function (o) { return o.drill; });
    var warRoom = state.mode === 'hard';
    var cards = objectives.map(function (o) {
      var res = app.feedback[o.id];
      var done = state.objectives[o.id] && state.objectives[o.id].done;
      var feedback = '';
      if (res) {
        feedback = '<div class="sk-feedback ' + (res.pass ? 'sk-feedback-ok' : 'sk-feedback-err') + '" role="status">' +
          '<span class="sk-feedback-head">' + (res.pass ? SKY.icon('circle-check-big', 3.5) : SKY.icon('circle-x', 3.5)) + (res.pass ? 'CHECK PASSED' : 'CHECK FAILED — teaching feedback') + '</span>' +
          esc(res.msg) + '</div>';
      }
      return '<div class="sk-drill-card' + (done ? ' sk-card-done' : '') + '">' +
        '<div class="sk-drill-head"><span class="sk-drill-id">' + o.id + '</span>' + SKY.pillarBadge(o.pillar) + (done ? SKY.icon('circle-check-big', 4) : '') + '</div>' +
        '<p class="sk-drill-title">' + esc(o.title) + '</p>' +
        '<div class="sk-drill-widget">' + SKY.drillWidget(o, state, env) + '</div>' +
        '<div aria-live="polite" role="status">' + feedback + '</div>' +
        '</div>';
    }).join('');
    return '<div class="sk-drills">' +
      '<div class="sk-drills-head"><h3 class="sk-subtitle">' + (warRoom ? 'WAR ROOM // challenge drills' : 'DRILLS // practice widgets') + '</h3>' +
      '<span class="sk-subtitle-meta">submit a drill = CHECK its objective</span></div>' +
      '<div class="sk-drills-list">' + cards + '</div>' +
      '</div>';
  };

  // ─── Missions rail (objectives.tsx) ────────────────────────────────────────

  var WHERE_ICON = { drill: 'crosshair', deck: 'wrench', flag: 'map', read: 'book-open' };

  function whereOf(o) {
    if (o.drill) return 'drill';
    if (o.deckBased) return 'deck';
    if (o.flagOnly) return 'flag';
    return 'read';
  }

  SKY.renderRail = function (state, env, app) {
    var objectives = state.mode === 'hard' ? SKY.HARD_OBJECTIVES : SKY.MEDIUM_OBJECTIVES;
    var hard = state.mode === 'hard';
    var pct = env.totalObjectives ? Math.round((env.doneCount / env.totalObjectives) * 100) : 0;

    var cards = objectives.map(function (o) {
      var os = state.objectives[o.id] || { done: false, wrong: 0, hints: 0 };
      var res = app.feedback[o.id];
      var where = whereOf(o);
      var hintTier = Math.min(os.hints, o.hints.length) - 1;
      var whereLabel = where === 'drill' ? 'Drills tab' : where === 'deck' ? 'Remediation deck' : where === 'flag' ? 'Estate tab' : 'Report';

      var actionsHtml = '';
      if (!os.done) {
        var hintBtn = '';
        if ((!hard || os.hints < 1) && o.hints.length > 0) {
          hintBtn = SKY.btn('data-sk-action="hint" data-obj="' + o.id + '"', 'sk-btn sk-btn-hint',
            SKY.icon('lightbulb', 3.5) + (hard ? 'NUDGE (\u2212score)' : 'HINT ' + (os.hints + 1) + '/3'))
            .replace('<button ', '<button aria-label="Reveal hint for ' + o.id + (hard ? ' (costs score)' : '') + '" ');
        }
        actionsHtml = '<div class="sk-obj-actions">' +
          SKY.btn('data-sk-action="check-obj" data-obj="' + o.id + '"', 'sk-btn sk-btn-objcheck', 'CHECK RESULTS').replace('<button ', '<button aria-label="Check ' + o.id + '" ') +
          hintBtn + '</div>';
      }

      var hintHtml = '';
      if (hintTier >= 0 && !(res && res.pass)) {
        hintHtml = '<p class="sk-hint" role="status">' + SKY.icon('lightbulb', 3) + esc(o.hints[hintTier]) + '</p>';
      }

      var resHtml = '';
      if (res) {
        resHtml = '<p class="sk-obj-feedback ' + (res.pass ? 'sk-feedback-ok' : 'sk-feedback-err') + '">' + esc(res.msg) + '</p>';
      }

      return '<li class="sk-obj-card' + (os.done ? ' sk-obj-done' : '') + '">' +
        '<div class="sk-obj-head">' +
        '<span class="sk-obj-status-icon">' + (os.done ? SKY.icon('circle-check-big', 18 / 4) : SKY.icon('circle-dashed', 18 / 4)) + '</span>' +
        '<div class="sk-obj-head-main"><div class="sk-obj-tags"><span class="sk-obj-id">' + o.id + '</span>' + SKY.pillarBadge(o.pillar) + '</div>' +
        '<p class="sk-obj-title">' + esc(o.title) + '</p></div></div>' +
        '<p class="sk-obj-meta">' + SKY.icon(WHERE_ICON[where], 3) + ' ' + whereLabel +
        (os.hints > 0 ? ' \u00b7 <span class="sk-meta-hints">hints used: ' + os.hints + '</span>' : '') +
        (!os.done && os.wrong > 0 ? ' \u00b7 <span class="sk-meta-wrong">failed checks: ' + os.wrong + '</span>' : '') +
        '</p>' +
        actionsHtml + hintHtml +
        '<div aria-live="polite" role="status">' + resHtml + '</div>' +
        '</li>';
    }).join('');

    return '<div class="sk-rail">' +
      '<div class="sk-rail-progress">' +
      '<div class="sk-rail-progress-head">' + SKY.icon('crosshair', 4) + '<h2 class="sk-rail-title">MISSION RAIL</h2><span class="sk-rail-count">' + env.doneCount + '/' + env.totalObjectives + '</span></div>' +
      '<div class="sk-progressbar" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100" aria-label="Objective progress"><div class="sk-progressbar-fill" style="width:' + pct + '%"></div></div>' +
      '<p class="sk-rail-note">' + (hard
        ? 'Hard mode: broad challenges, strict checks. One paid nudge per objective.'
        : 'Medium mode: work top to bottom. Hints (3 tiers) cost stars but never block.') + '</p>' +
      '</div>' +
      '<ol class="sk-obj-list">' + cards + '</ol>' +
      '</div>';
  };

  // ─── Debrief (debrief.tsx) ─────────────────────────────────────────────────

  SKY.renderDebrief = function (state, env) {
    var eligible = SKY.allObjectivesDone(state) && SKY.quizAllChecked(state);
    var missingObjs = env.totalObjectives - env.doneCount;
    var quizDone = SKY.quizAllChecked(state);

    var det = SKY.DETECTION_OPPS.map(function (d) {
      return '<li class="sk-debrief-item"><p class="sk-debrief-item-title">' + esc(d.source) + '</p>' +
        '<p class="sk-debrief-item-logic">e.g. ' + esc(d.logic) + '</p>' +
        '<p class="sk-debrief-item-covers">covers: ' + esc(d.covers) + '</p></li>';
    }).join('');

    var mit = SKY.MITIGATION_RECS.map(function (m) {
      return '<li class="sk-debrief-item"><p class="sk-debrief-item-title">' + esc(m.control) + '</p>' +
        '<p class="sk-debrief-item-covers">fixes ' + esc(m.fixes) + ' \u00b7 <span class="sk-mitre-teal">' + esc(m.mitre) + '</span></p></li>';
    }).join('');

    var blue = SKY.BLUE_TAKEAWAYS.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('');
    var red = SKY.RED_TAKEAWAYS.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('');

    var refs = SKY.TECHNIQUES.map(function (t) {
      return '<a class="sk-reflink" href="' + t.link + '" target="_blank" rel="noopener noreferrer">' + SKY.icon('external-link', 3) + ' ' + esc(t.id) + ' ' + esc(t.name) + '</a>';
    }).join('') +
      '<a class="sk-reflink sk-reflink-violet" href="https://www.comptia.org/certifications/cysa" target="_blank" rel="noopener noreferrer">' + SKY.icon('external-link', 3) + ' CompTIA CySA+ CS0-003</a>';

    return '<section aria-labelledby="debrief-h" class="sk-panel sk-debrief">' +
      '<div class="sk-panel-head">' + SKY.icon('file-search', 5) + '<h2 id="debrief-h" class="sk-h2 sk-h2-teal">DEBRIEF // FIELD NOTES</h2></div>' +
      '<div class="sk-debrief-grid">' +
      '<div class="sk-debrief-card"><h3 class="sk-debrief-sub sk-debrief-sub-teal">' + SKY.icon('file-search', 3.5) + ' DETECTION OPPORTUNITIES</h3><ul class="sk-debrief-list">' + det + '</ul></div>' +
      '<div class="sk-debrief-card"><h3 class="sk-debrief-sub sk-debrief-sub-teal">' + SKY.icon('wrench', 3.5) + ' MITIGATION RECOMMENDATIONS</h3><ul class="sk-debrief-list">' + mit + '</ul></div>' +
      '<div class="sk-debrief-card"><h3 class="sk-debrief-sub sk-debrief-sub-emerald">' + SKY.icon('shield-check', 3.5) + ' BLUE-TEAM TAKEAWAYS</h3><ul class="sk-debrief-takeaways">' + blue + '</ul></div>' +
      '<div class="sk-debrief-card"><h3 class="sk-debrief-sub sk-debrief-sub-rose">' + SKY.icon('swords', 3.5) + ' RED-TEAM MINDSET (defensive)</h3><ul class="sk-debrief-takeaways">' + red + '</ul></div>' +
      '</div>' +
      '<div class="sk-debrief-card sk-debrief-refs"><h3 class="sk-debrief-refs-title">OFFICIAL REFERENCES (open in new tab)</h3><div class="sk-reflinks">' + refs + '</div></div>' +
      '<p class="sk-debrief-foot">SKYSCAN CLOUD POSTURE LAB — 100% synthetic training data (fictional org, resources, advisories, simplified CVE scores) \u00b7 defensive/educational use only \u00b7 CompTIA CySA+ CS0-003 Lesson 12.2 practice environment \u00b7 progress auto-saves to this browser.</p>' +
      '<div class="sk-debrief-complete">' +
      '<span class="sk-debrief-trophy">' + SKY.icon('trophy', 5) + '</span>' +
      '<div class="sk-debrief-complete-text">' +
      (eligible
        ? '<p class="sk-debrief-eligible">All missions complete and the knowledge check is in. Close the lab and collect your rating.</p>'
        : '<p class="sk-debrief-locked">' + SKY.icon('lock', 3.5) + ' Completion unlocks after every mission is checked off <span class="sk-locked-count">(' + (missingObjs > 0 ? missingObjs + ' mission' + (missingObjs > 1 ? 's' : '') + ' left' : 'missions done') + (quizDone ? ', quiz done' : ', quiz pending') + ')</span>.</p>') +
      '</div>' +
      SKY.btn('data-sk-action="complete-lab"' + (eligible ? '' : ' disabled'), 'sk-btn sk-btn-complete', 'COMPLETE LAB').replace('<button ', '<button aria-label="Complete the lab" ') +
      '</div>' +
      '</section>';
  };

  // ─── Completion modal content (completion.tsx) ─────────────────────────────

  SKY.completionHtml = function (state, env) {
    var mode = state.mode || 'medium';
    var objectives = mode === 'hard' ? SKY.HARD_OBJECTIVES : SKY.MEDIUM_OBJECTIVES;
    var stars = SKY.starRating(state);
    var quiz = SKY.quizScore(state);
    var quizItems = SKY.QUIZ_BY_MODE(mode);
    var byPillar = ['P1', 'P2', 'P3', 'P4'].map(function (p) {
      return {
        pillar: p,
        done: objectives.filter(function (o) { return o.pillar === p && state.objectives[o.id] && state.objectives[o.id].done; }).length,
        total: objectives.filter(function (o) { return o.pillar === p; }).length,
      };
    });

    var weakObjs = objectives
      .map(function (o) { return { o: o, s: state.objectives[o.id] }; })
      .filter(function (x) { return x.s && (x.s.wrong > 0 || x.s.hints > 0); })
      .sort(function (a, b) { return (b.s.wrong + b.s.hints) - (a.s.wrong + a.s.hints); })
      .slice(0, 3);
    var missedQuiz = quizItems.filter(function (q) {
      if (!state.quizChecked[q.id]) return false;
      var a = state.quizAnswers[q.id] || [];
      return !(q.correct.length === a.length && q.correct.every(function (c) { return a.indexOf(c) !== -1; }));
    });
    var hasFocusAreas = weakObjs.length > 0 || missedQuiz.length > 0;

    var fullStars = Math.floor(stars);
    var hasHalf = stars - fullStars >= 0.5;
    var starsHtml = '';
    for (var i = 0; i < 5; i++) {
      if (i < fullStars) starsHtml += SKY.icon('star', 7).replace('class="sk-icon', 'class="sk-star-full sk-icon');
      else if (i === fullStars && hasHalf) starsHtml += SKY.icon('star-half', 7).replace('class="sk-icon', 'class="sk-star-full sk-icon');
      else starsHtml += SKY.icon('star', 7).replace('class="sk-icon', 'class="sk-star-empty sk-icon');
    }

    var whereLabel = function (o) {
      if (o.drill) return 'Drills tab';
      if (o.deckBased) return 'Remediation deck';
      if (o.flagOnly) return 'Estate tab';
      return 'Assessment tab';
    };

    var focusHtml;
    if (hasFocusAreas) {
      var items = weakObjs.map(function (x) {
        return '<li><span class="sk-focus-topic">' + esc(SKY.FOCUS_TOPIC[x.o.id] || x.o.title) + '</span> — ' + x.s.wrong + ' failed check' + (x.s.wrong === 1 ? '' : 's') +
          (x.s.hints > 0 ? ', ' + x.s.hints + ' hint' + (x.s.hints === 1 ? '' : 's') + ' used' : '') +
          '. Revisit the <span class="sk-focus-where">' + whereLabel(x.o) + '</span> (' + x.o.id + ') and re-run it clean.</li>';
      }).join('');
      items += missedQuiz.map(function (q) {
        return '<li><span class="sk-focus-topic">' + esc(SKY.QUIZ_TOPIC[q.id] || q.question) + '</span> — quiz item answered incorrectly. Re-read that item\u2019s explanation in the Knowledge Check.</li>';
      }).join('');
      focusHtml = '<ul class="sk-focus-list">' + items + '</ul>';
    } else {
      focusHtml = '<p class="sk-focus-perfect">Flawless run — no failed checks, no hints, and a perfect knowledge check. To keep stretching: rebuild one config-check rule from the Debrief as policy-as-code, then read the T1530 and T1562.008 ATT&amp;CK pages end-to-end.</p>';
    }

    var pillarHtml = byPillar.map(function (p) {
      return '<li class="sk-pillar-row"><span class="sk-badge sk-badge-bold ' + (p.done === p.total ? 'sk-pillar-p1' : 'sk-pillar-p2') + '">' + p.pillar + '</span>' +
        '<span class="sk-pillar-label">' + esc(SKY.PILLAR_LABEL[p.pillar]) + '</span>' +
        '<span class="sk-pillar-count">' + p.done + '/' + p.total + '</span></li>';
    }).join('');

    return '<div class="sk-completion-head">' +
      '<h2 id="sk-completion-title" class="sk-completion-title">' + SKY.icon('trophy', 5) + ' LAB COMPLETE — ' + (mode === 'hard' ? 'INCIDENT PRESSURE' : 'GUIDED ANALYSIS') + ' TRACK</h2>' +
      '<p id="sk-completion-desc" class="sk-completion-desc">You can now explain, recognize, detect and mitigate the full scope of cloud vulnerability analysis from Lesson 12.2.</p>' +
      '</div>' +
      '<button type="button" class="sk-modal-close" data-sk-action="close-modal" aria-label="Close">' + SKY.icon('x', 4) + '</button>' +
      '<div class="sk-completion-body">' +
      '<div class="sk-completion-stars">' +
      '<div class="sk-stars" role="img" aria-label="' + stars + ' out of 5 stars">' + starsHtml + '</div>' +
      '<p class="sk-stars-meta">' + stars + '/5 \u00b7 objectives ' + env.doneCount + '/' + env.totalObjectives + ' \u00b7 quiz ' + quiz.correct + '/' + quiz.total + ' \u00b7 rating reflects first-attempt accuracy and hint usage</p>' +
      '</div>' +
      '<div class="sk-completion-focus"><h3 class="sk-focus-head">' + SKY.icon('crosshair', 3.5) + ' focus areas — where to push next</h3>' + focusHtml + '</div>' +
      '<div class="sk-completion-card"><h3 class="sk-completion-cardtitle">mastery recap by pillar</h3><ul class="sk-pillar-list">' + pillarHtml + '</ul></div>' +
      '<div class="sk-completion-card"><h3 class="sk-completion-cardtitle">what to learn next</h3><ul class="sk-next-list">' +
      '<li>CS0-003 Domain 2: vulnerability scan triangulation, CVSS vs contextual prioritization, remediation validation (objective ' + (mode === 'hard' ? '2.4 deep-dive' : '2.2 / 2.4 / 2.5') + ').</li>' +
      '<li>Follow one finding into MITRE: read T1530 and T1562.008 pages end-to-end, then D3FEND countermeasures for cloud storage.</li>' +
      '<li>Practice writing the config-check rules from the Debrief as code against a cloud provider\u2019s policy-as-code engine.</li>' +
      '<li>Re-run this lab in the other track — Hard mode hides the counts and plants false positives.</li>' +
      '</ul></div>' +
      '<div class="sk-completion-actions">' +
      SKY.btn('data-sk-action="close-modal"', 'sk-btn sk-btn-complete sk-btn-grow', 'KEEP EXPLORING ' + SKY.icon('arrow-right', 4)) +
      SKY.btn('data-sk-action="completion-reset"', 'sk-btn sk-btn-outline sk-btn-grow', SKY.icon('rotate-ccw', 4) + ' RESET LAB').replace('<button ', '<button aria-label="Reset the lab to pristine state" ') +
      '</div></div>';
  };

  // ─── Reset confirm content (topbar.tsx AlertDialog) ────────────────────────

  SKY.resetDialogHtml = function () {
    return '<div class="sk-reset-head">' +
      '<h2 id="sk-reset-title" class="sk-reset-title">Reset the lab?</h2>' +
      '<p id="sk-reset-desc" class="sk-reset-desc">This wipes saved progress (mode, scan results, remediations, missions, quiz) and restores the pristine state. This cannot be undone.</p>' +
      '</div>' +
      '<div class="sk-reset-actions">' +
      SKY.btn('data-sk-action="reset-cancel"', 'sk-btn sk-btn-outline sk-btn-cancel', 'CANCEL') +
      SKY.btn('data-sk-action="reset-confirm"', 'sk-btn sk-btn-danger', 'RESET LAB') +
      '</div>';
  };
})(window.SKY);
