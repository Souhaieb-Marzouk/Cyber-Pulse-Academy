/* =========================================================================
 * Continuity Bay — Application Bootstrap & Station Rendering
 * Renders all stations, handles events, manages state subscriptions.
 * ========================================================================= */

(function () {
  'use strict';

  const D = window.LAB_DATA;
  const V = window.LAB_VALIDATE;
  const UI = window.LAB_UI;
  const Store = window.LAB_STORE;

  const { icon, esc, stationHeader, shuffled, objectiveCard } = UI;

  /* --- Current active station --- */
  let activeStation = 'briefing';

  /* --- Get objectives/quiz for current mode --- */
  function objs() { return Store.get().mode === 'medium' ? D.MEDIUM_OBJECTIVES : D.HARD_OBJECTIVES; }
  function quiz() { return Store.get().mode === 'medium' ? D.MEDIUM_QUIZ : D.HARD_QUIZ; }

  /* --- Main render entry point --- */
  function render() {
    const state = Store.get();
    const root = document.getElementById('lab-root');

    if (!state.mode) {
      root.innerHTML = renderModeSelector();
      return;
    }

    root.innerHTML = renderLabShell(state);
    renderStationContent(state);
  }

  /* --- Mode selector --- */
  function renderModeSelector() {
    return '<div class="mode-selector">' +
      '<div class="mode-container">' +
        '<div class="mode-header">' +
          '<div class="mode-badge">' + icon('shield', 14) + 'CompTIA Security+ SY0-801 · Lesson 3.4</div>' +
          '<h1>Continuity Bay</h1>' +
          '<p>A resilience &amp; recovery engineering console. Design and verify backup, redundancy, recovery-planning, and testing strategies for a fictional logistics company that just survived a regional outage.</p>' +
        '</div>' +
        '<div class="mode-cards">' +
          modeCard('medium', 'Medium — Learn', 'Guided · 12 objectives · tolerant validation', [
            '10–12 granular objectives introduced in order with where-to-look hints',
            'Tiered hints (3 levels); wrong answers teach, never penalize',
            '7 concept quiz questions with explanations',
            'Best for: first exposure to the material',
          ], '#2DD4BF', 'brain') +
          modeCard('hard', 'Hard — Challenge', 'Scenario-first · 9 deep objectives · strict validation', [
            'Noisy evidence with red herrings; minimal guidance',
            'Strict validation: exact values, sequences, multi-part state checks',
            '8 scenario-based quiz items with justification',
            'Best for: testing readiness before the exam',
          ], '#F59E0B', 'flame') +
        '</div>' +
        '<p class="mode-footer">Single self-contained page · No navigation · No footer · Auto-saves to localStorage</p>' +
      '</div>' +
    '</div>';
  }

  function modeCard(mode, title, tagline, bullets, accent, iconName) {
    return '<button class="mode-card" data-action="pick-mode" data-mode="' + mode + '" style="--accent:' + accent + '">' +
      '<div class="mode-card-header">' +
        '<div class="mode-card-icon" style="color:' + accent + ';background:' + accent + '20">' + icon(iconName, 20) + '</div>' +
        '<div><h3>' + title + '</h3><p class="mode-tagline">' + tagline + '</p></div>' +
      '</div>' +
      '<ul>' + bullets.map(b => '<li>' + icon('chevron-right', 14) + '<span>' + b + '</span></li>').join('') + '</ul>' +
      '<div class="mode-card-cta" style="color:' + accent + '">Enter this mode ' + icon('arrow-right', 14) + '</div>' +
    '</button>';
  }

  /* --- Lab shell --- */
  function renderLabShell(state) {
    const objectives = objs();
    const quizArr = quiz();
    const completedCount = objectives.filter(o => state.objectives[o.id]?.status === 'correct').length;
    const totalCount = objectives.length;
    const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    const stars = V.computeStars(state, objectives, quizArr);
    const quizSubmittedCount = quizArr.filter(q => state.quizSubmitted[q.id]).length;
    const allComplete = state.mode !== null && completedCount === totalCount && quizSubmittedCount === quizArr.length;

    return '<div class="lab-shell">' +
      renderHeader(state, progressPct, completedCount, totalCount, stars, allComplete) +
      '<main class="lab-main">' +
        '<div class="lab-content" id="lab-content"></div>' +
        '<aside class="lab-sidebar" id="lab-sidebar"></aside>' +
      '</main>' +
    '</div>';
  }

  function renderHeader(state, progressPct, completedCount, totalCount, stars, allComplete) {
    return '<header class="lab-header">' +
      '<div class="header-row">' +
        '<div class="header-brand">' +
          '<div class="brand-icon">' + icon('shield', 16) + '</div>' +
          '<div><div class="brand-title">Continuity Bay</div>' +
          '<div class="brand-sub">SY0-801 · 3.4 · Resilience &amp; Recovery</div></div>' +
        '</div>' +
        '<span class="mode-badge-pill ' + state.mode + '">' + state.mode.toUpperCase() + '</span>' +
        '<div class="header-progress">' +
          '<div class="progress-label"><span>Progress</span><span>' + completedCount + '/' + totalCount + '</span></div>' +
          '<div class="progress-bar"><div class="progress-fill" style="width:' + progressPct + '%"></div></div>' +
        '</div>' +
        '<div class="header-stars">' +
          [1,2,3,4,5].map(i => '<span class="star ' + (i <= stars ? 'filled' : '') + '">' + icon('star', 16) + '</span>').join('') +
        '</div>' +
        '<button class="btn btn-sm btn-outline" data-action="reset">' + icon('rotate-ccw', 14) + 'Reset</button>' +
        (allComplete ? '<button class="btn btn-sm btn-teal" data-action="show-completion">' + icon('trophy', 14) + 'View Results</button>' : '') +
      '</div>' +
      '<nav class="station-nav" aria-label="Stations">' +
        D.STATIONS.map(s => '<button class="station-tab ' + (activeStation === s.id ? 'active' : '') +
          '" data-action="switch-station" data-station="' + s.id + '">' + icon(s.icon, 14) + s.label + '</button>').join('') +
      '</nav>' +
    '</header>';
  }

  /* --- Station content rendering --- */
  function renderStationContent(state) {
    const content = document.getElementById('lab-content');
    const sidebar = document.getElementById('lab-sidebar');

    sidebar.innerHTML = renderObjectivesTracker(state);
    content.innerHTML = renderStation(state, activeStation);
  }

  function renderStation(state, stationId) {
    switch (stationId) {
      case 'briefing': return renderBriefing(state);
      case 'knowledge': return renderKnowledgeCore(state);
      case 'backup': return renderBackupVault(state);
      case 'redundancy': return renderRedundancyRack(state);
      case 'sites': return renderRecoverySites(state);
      case 'continuity': return renderContinuityLibrary(state);
      case 'tests': return renderTestDirector(state);
      case 'capacity': return renderCapacityDesk(state);
      case 'quiz': return renderQuizPanel(state);
      case 'debrief': return renderDebrief(state);
      default: return '';
    }
  }

  /* --- Briefing --- */
  function renderBriefing(state) {
    return stationHeader('compass', '#2DD4BF', 'Scenario Briefing', 'Cypress & Cedar Logistics — Post-Incident Resilience Review') +
      '<div class="card briefing-card">' +
        briefingSection('building', '#2DD4BF', 'The Organization',
          '<strong>Cypress &amp; Cedar Logistics</strong> is a fictional regional shipping company serving the U.S. Gulf Coast. They run an e-commerce platform, a warehouse management system, internal BI, and HR records from a single primary data center in Baton Rouge.') +
        '<div class="separator"></div>' +
        briefingSection('siren', '#F43F5E', 'The Incident',
          'On <span class="mono amber">2026-10-14</span>, a regional utility outage struck Baton Rouge. The primary site went dark for <strong class="danger">9 hours</strong>. During the outage:' +
          '<ul class="bullet-list"><li>The UPS held the load for ~10 minutes — then died. <span class="amber">No generator.</span></li>' +
          '<li>The single ISP uplink dropped with the utility. <span class="amber">No redundant ISP.</span></li>' +
          '<li>The team tried to fail over to the warm recovery site — it took <span class="danger">14 hours</span> to sync and come online (RTO was 4 hours).</li>' +
          '<li>The last good backup was <span class="danger">28 hours old</span> (RPO exceeded by ~24 hours).</li>' +
          '<li>The BCP existed on paper but had never been tested.</li>' +
          '<li>When the payment gateway was down, there was no plan to keep taking orders.</li></ul>') +
        '<div class="separator"></div>' +
        briefingSection('target', '#2DD4BF', 'Your Mission',
          'You are the new <strong>Resilience Architect</strong>. The board has given you <strong class="amber">30 days</strong> to design, configure, and verify a complete resilience &amp; recovery strategy across the four domains this lesson covers:' +
          '<div class="domain-grid">' +
            domainChip('database', 'Backups', 'full · incremental · differential · snapshot · replication · immutability · offsite') +
            domainChip('server-cog', 'Redundancy', 'load balancing · clustering · NIC teaming · dual PSU · UPS · generator · ISP · platform diversity · multi-cloud') +
            domainChip('clipboard-list', 'Recovery Planning', 'BCP · DRP · COOP · hot/warm/cold sites · RTO · RPO · MTTR · MTBF · capacity planning') +
            domainChip('workflow', 'Testing', 'tabletop · simulation · failover · parallel · cutover') +
          '</div>') +
        (state.mode === 'hard' ? '<div class="hard-notice">' + icon('flame', 14) + '<strong>HARD MODE NOTICE</strong><p>You will receive realistic, noisy evidence — including red herrings — and must find what matters. Validation is strict: exact values, exact sequences, multi-part state checks. One optional nudge per objective, and it visibly costs score.</p></div>' : '') +
      '</div>';
  }

  function briefingSection(iconName, color, title, body) {
    return '<div class="briefing-section">' +
      '<div class="briefing-section-icon" style="color:' + color + '">' + icon(iconName, 20) + '</div>' +
      '<div><h3>' + title + '</h3><div class="briefing-body">' + body + '</div></div>' +
    '</div>';
  }

  function domainChip(iconName, label, sub) {
    return '<div class="domain-chip">' +
      '<div class="domain-chip-label">' + icon(iconName, 14) + label + '</div>' +
      '<div class="domain-chip-sub">' + sub + '</div>' +
    '</div>';
  }

  /* --- Knowledge Core --- */
  function renderKnowledgeCore(state) {
    const objH9 = objs().find(o => o.id === 'OBJ-H9');
    let html = stationHeader('brain', '#2DD4BF', 'Knowledge Core', 'What / How / Why · Real-world patterns · Glossary');

    html += '<div class="card knowledge-card">' +
      accordionItem('what', 'info', '#2DD4BF', 'What resilience &amp; recovery actually means',
        '<p>Resilience is the property of <em>staying available</em> when components fail. Recovery is the property of <em>coming back</em> when something worse happens — data loss, site loss, or a prolonged outage. Together they answer two questions: "can we keep serving users through failures?" and "if we can\'t, how fast do we come back?"</p>' +
        '<p>CompTIA groups this lesson into four domains: <strong>Backups</strong> (data substrate), <strong>Redundancy</strong> (hardware/network substrate), <strong>Recovery Planning</strong> (process substrate), and <strong>Testing</strong> (verification substrate). Each domain has its own vocabulary, controls, and exam traps — the lab covers all of them.</p>') +
      accordionItem('how', 'wrench', '#2DD4BF', 'How it works mechanically',
        '<p><strong>Backup chains</strong> always start from a Full. Incrementals add only what changed since the <em>last backup of any type</em>; differentials add only what changed since the <em>last Full</em>. Restoring from incrementals means replaying every incremental in order on top of the Full. Restoring from differentials means just the latest differential + the Full.</p>' +
        '<p><strong>Snapshots</strong> are a separate mechanism — point-in-time state captures on VMs/cloud — and can be rolled back instantly without a full data restore.</p>' +
        '<p><strong>Redundancy</strong> works at every layer: NIC teaming (multiple NICs as one logical interface), port aggregation (multiple switch ports as one), dual PSUs (one fails, host stays up), UPS + generator (UPS bridges, generator carries), redundant circuits (multiple utility feeds), clustering (multiple servers as one), load balancing (distributor across servers), ISP redundancy (multiple ISPs), platform diversity (multiple OSs), multi-cloud (multiple cloud vendors).</p>') +
      accordionItem('why', 'target', '#2DD4BF', 'Why organizations invest here',
        '<p>The cost of downtime scales with revenue dependence: a payment gateway costing $50k/hour in lost sales justifies a hot site; an HR archive that can wait a week does not.</p>' +
        '<p>RPO and RTO convert business pain into engineering targets: RPO drives backup frequency; RTO drives redundancy + recovery site readiness + DR test cadence.</p>' +
        '<p>Testing exists because plans that have never been exercised almost always fail on first contact with reality — CompTIA emphasizes that <em>documented plans are not validated plans</em>.</p>') +
      accordionItem('real', 'flame', '#F59E0B', 'Real-world patterns this lab simulates',
        '<ul class="bullet-list"><li>Regional outage exposes missing generator (the Cypress &amp; Cedar scenario).</li>' +
        '<li>Ransomware deletes online backups — only immutable, offsite copies survive.</li>' +
        '<li>Single cloud vendor outage — multi-cloud customers fail over to the second vendor.</li>' +
        '<li>OS-wide CVE — platform-diverse estates keep the unaffected OS tier running.</li>' +
        '<li>Long incremental chains with no recent Full — restore fails because the chain anchor is missing.</li>' +
        '<li>Documented but untested DRP — gaps only discovered during the real incident.</li></ul>') +
    '</div>';

    html += '<div class="card knowledge-card">' +
      '<div class="card-title">' + icon('archive', 16) + '<h3>Glossary</h3></div>' +
      '<div class="glossary-grid">' +
        D.GLOSSARY.map(([term, def]) => '<div class="glossary-item"><span class="glossary-term">' + term + '</span> — <span class="glossary-def">' + def + '</span></div>').join('') +
      '</div>' +
    '</div>';

    if (objH9) {
      html += objectiveCard(objH9, state, state.mode, renderDomainMatching(state));
    }

    return html;
  }

  function accordionItem(id, iconName, color, title, body) {
    return '<details class="accordion-item">' +
      '<summary class="accordion-trigger">' + icon(iconName, 16) + '<span>' + title + '</span>' + icon('chevron-down', 16) + '</summary>' +
      '<div class="accordion-content">' + body + '</div>' +
    '</details>';
  }

  function renderDomainMatching(state) {
    return '<label class="input-label">Match each resilience domain to the failure mode it primarily prevents:</label>' +
      '<div class="domain-match-list">' +
        D.RESILIENCE_DOMAINS.map(d =>
          '<div class="domain-match-row">' +
            '<span class="domain-match-label">' + d.label + '</span>' +
            selectHtml('domain-matches', d.id, state.env.domainMatches[d.id] || '', 'Match a failure mode…',
              D.FAILURE_MODES.map(f => ({ value: f.key, label: f.label }))) +
          '</div>'
        ).join('') +
      '</div>';
  }

  /* --- Backup Vault --- */
  function renderBackupVault(state) {
    const objectives = objs();
    const objM1 = objectives.find(o => o.id === 'OBJ-M1');
    const objM2 = objectives.find(o => o.id === 'OBJ-M2');
    const objM4 = objectives.find(o => o.id === 'OBJ-M4');
    const objM7 = objectives.find(o => o.id === 'OBJ-M7');
    const objH2 = objectives.find(o => o.id === 'OBJ-H2');
    const objH8 = objectives.find(o => o.id === 'OBJ-H8');

    let html = stationHeader('database', '#2DD4BF', 'Backup Vault', 'Configure backup chains · Triage failed restores · Build RPO-compliant schedules');

    html += '<div class="card info-card">' + icon('hard-drive', 16) +
      '<p>The file server runs on a VM. Snapshots, replication, immutability, and offsite copies are all available. The Cypress &amp; Cedar restore failed because no Full had been taken in 30 days — only daily incrementals.</p></div>';

    if (objM4) {
      html += objectiveCard(objM4, state, state.mode,
        '<div class="log-viewer">' +
          '<div class="log-line amber">[RESTORE FAILED] 2026-10-15 09:14:22</div>' +
          '<div class="log-line">target: /var/orders/**</div>' +
          '<div class="log-line">chain: incremental×28 (2026-09-17 → 2026-10-15)</div>' +
          '<div class="log-line">foundation: NOT FOUND</div>' +
          '<div class="log-line">replication: present, last_sync 2026-10-15 09:13:58</div>' +
          '<div class="log-line danger">→ cannot restore: anchor missing from chain</div>' +
        '</div>' +
        '<label class="input-label">Which backup type was missing from the chain?</label>' +
        radioGrid('metricMatches.M4_missing', state.env.metricMatches['M4_missing'] || '', D.BACKUP_TYPES.map(t => ({ value: t.id, label: t.label }))) +
        '</div>');
    }

    if (objM1) {
      html += objectiveCard(objM1, state, state.mode, renderOrderPicker('backupOrder', state.env.backupOrder, shuffled(D.BACKUP_TYPES, 'backup-order-v1'), 'backup types'));
    }

    if (objM2) {
      html += objectiveCard(objM2, state, state.mode,
        '<div class="metric-match-list">' +
          D.METRICS.map(m =>
            '<div class="metric-match-row">' +
              '<span class="metric-label">' + m.label + '</span>' +
              selectHtml('metricMatches', m.id, state.env.metricMatches[m.id] || '', 'Match a definition…',
                D.METRIC_DEFS.map(d => ({ value: d.key, label: d.label }))) +
            '</div>'
          ).join('') +
        '</div>'
      );
    }

    if (objM7) {
      html += objectiveCard(objM7, state, state.mode, renderScheduleBuilder(state, '≤ 1 hour'));
    }

    if (objH2) {
      html += objectiveCard(objH2, state, state.mode,
        renderScheduleBuilder(state, '≤ 15 min', '≤ 4 hours') +
        '<div class="separator"></div>' +
        '<label class="input-label">Order the restore sequence (click steps in order):</label>' +
        renderSequencePicker('hardBackupRestoreSeq', state.env.hardBackupRestoreSeq, shuffled(D.RESTORE_STEPS, 'restore-seq-v1'), 4)
      );
    }

    if (objH8) {
      html += objectiveCard(objH8, state, state.mode,
        '<label class="input-label">A disaster has struck. Place the four DR execution steps in correct order (click in order — only 4 needed):</label>' +
        renderSequencePicker('hardBackupRestoreSeq', state.env.hardBackupRestoreSeq, shuffled(D.RESTORE_STEPS, 'restore-seq-h8'), 4)
      );
    }

    return html;
  }

  function renderScheduleBuilder(state, targetRpo, targetRto) {
    const env = state.env;
    const rpoFromFreq = (freq) => {
      if (freq === '15min') return 15 / 60;
      if (freq === 'hourly') return 1;
      if (freq === 'daily') return 24;
      if (freq === 'weekly') return 168;
      if (freq === 'monthly') return 720;
      return Infinity;
    };
    const effectiveRpo = Math.min(
      rpoFromFreq(env.backupSnapshotFreq),
      rpoFromFreq(env.backupIncrFreq),
      rpoFromFreq(env.backupDiffFreq),
      rpoFromFreq(env.backupFullFreq)
    );
    const rpoTarget = targetRpo.includes('15') ? 15 / 60 : 1;
    const rpoMet = effectiveRpo <= rpoTarget;

    const rpoDisplay = effectiveRpo === Infinity ? 'no backups scheduled' :
      effectiveRpo < 1 ? Math.round(effectiveRpo * 60) + ' min' :
      effectiveRpo < 24 ? effectiveRpo.toFixed(1) + ' h' :
      Math.round(effectiveRpo / 24) + ' day(s)';

    return '<div class="schedule-builder">' +
      '<div class="rpo-display">' +
        '<div class="rpo-targets">' +
          '<span class="rpo-target">Target RPO: <span class="amber">' + targetRpo + '</span></span>' +
          (targetRto ? '<span class="rpo-target">Target RTO: <span class="amber">' + targetRto + '</span></span>' : '') +
        '</div>' +
        '<div class="rpo-effective">' +
          '<span>Effective RPO (current schedule):</span>' +
          '<span class="' + (rpoMet ? 'success' : 'danger') + '">' + rpoDisplay + (rpoMet ? ' ✓' : ' ✗') + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="schedule-grid">' +
        scheduleRow('backupFullFreq', 'Full', 'hard-drive', env.backupFullFreq) +
        scheduleRow('backupDiffFreq', 'Differential', 'database', env.backupDiffFreq) +
        scheduleRow('backupIncrFreq', 'Incremental', 'layers', env.backupIncrFreq) +
        scheduleRow('backupSnapshotFreq', 'Snapshot', 'camera', env.backupSnapshotFreq) +
      '</div>' +
      '<div class="toggles-grid">' +
        toggleRow('immutability', 'Immutability', 'lock', env.immutability, 'Ransomware protection') +
        toggleRow('replication', 'Replication', 'network', env.replication, 'DR-ready copy') +
        toggleRow('offsite', 'Offsite Copies', 'archive', env.offsite, 'Geographic isolation') +
      '</div>' +
    '</div>';
  }

  function scheduleRow(envKey, label, iconName, value) {
    return '<div class="schedule-row">' +
      '<div class="schedule-label">' + icon(iconName, 12) + label + '</div>' +
      selectHtml('env.' + envKey, '', value, '', D.FREQ_OPTIONS.map(o => ({ value: o.value, label: o.label }))) +
    '</div>';
  }

  function toggleRow(envKey, label, iconName, on, desc) {
    return '<div class="toggle-row ' + (on ? 'on' : '') + '" data-action="toggle" data-env-key="' + envKey + '">' +
      '<div class="toggle-info">' + icon(iconName, 12) +
        '<div><div class="toggle-label">' + label + '</div><div class="toggle-desc">' + desc + '</div></div>' +
      '</div>' +
      '<div class="toggle-switch ' + (on ? 'on' : '') + '"><div class="toggle-knob"></div></div>' +
    '</div>';
  }

  /* --- Order picker (for backup types, scope, cascade) --- */
  function renderOrderPicker(stateKey, picked, options, label) {
    const remaining = options.filter(o => !picked.includes(o.id));
    const pickedObjs = picked.map(id => options.find(o => o.id === id)).filter(Boolean);
    return '<div class="order-picker">' +
      '<div class="picked-chain">' +
        (pickedObjs.length === 0 ? '<span class="picked-empty">click below to build the chain →</span>' : '') +
        pickedObjs.map((o, i) =>
          '<div class="picked-item">' +
            '<span class="picked-num">' + (i + 1) + '</span>' + esc(o.label) +
          '</div>' +
          (i < pickedObjs.length - 1 ? icon('chevron-right', 12) : '')
        ).join('') +
        (pickedObjs.length > 0 ? '<button class="btn-link danger" data-action="clear-order" data-key="' + stateKey + '">Clear</button>' : '') +
      '</div>' +
      '<div class="available-items">' +
        remaining.map(o => '<button class="available-item" data-action="pick-item" data-key="' + stateKey + '" data-item-id="' + o.id + '">+ ' + esc(o.label) +
          (o.desc ? '<div class="available-desc">' + esc(o.desc) + '</div>' : '') + '</button>').join('') +
      '</div>' +
    '</div>';
  }

  /* --- Sequence picker (for restore steps) --- */
  function renderSequencePicker(stateKey, picked, steps, maxItems) {
    const remaining = steps.filter(s => !picked.includes(s.id));
    const pickedObjs = picked.map(id => steps.find(s => s.id === id)).filter(Boolean);
    return '<div class="sequence-picker">' +
      '<div class="seq-picked">' +
        (pickedObjs.length === 0 ? '<span class="picked-empty">click steps in execution order →</span>' : '') +
        pickedObjs.map((s, i) =>
          '<div class="seq-item"><span class="seq-num">' + (i + 1) + '</span>' + esc(s.label) + '</div>'
        ).join('') +
      '</div>' +
      (pickedObjs.length > 0 ? '<button class="btn-link danger" data-action="clear-order" data-key="' + stateKey + '">Clear sequence</button>' : '') +
      '<div class="seq-available">' +
        remaining.map(s => '<button class="seq-avail-item' + (picked.length >= maxItems ? ' disabled' : '') +
          '" data-action="pick-item" data-key="' + stateKey + '" data-item-id="' + s.id + '"' +
          (picked.length >= maxItems ? ' disabled' : '') + '>+ ' + esc(s.label) + '</button>').join('') +
      '</div>' +
    '</div>';
  }

  /* --- Redundancy Rack --- */
  function renderRedundancyRack(state) {
    const objectives = objs();
    const objM5 = objectives.find(o => o.id === 'OBJ-M5');
    const objM9 = objectives.find(o => o.id === 'OBJ-M9');
    const objM10 = objectives.find(o => o.id === 'OBJ-M10');
    const objM12 = objectives.find(o => o.id === 'OBJ-M12');
    const objH7 = objectives.find(o => o.id === 'OBJ-H7');

    let html = stationHeader('server-cog', '#2DD4BF', 'Redundancy Rack', 'Toggle redundant controls · Identify SPOFs · Survive failure simulations');

    if (objM5) {
      html += objectiveCard(objM5, state, state.mode,
        '<label class="input-label">Click every component that is a Single Point of Failure (SPOF):</label>' +
        renderSPOFDiagram(state)
      );
    }

    if (objM9) {
      html += objectiveCard(objM9, state, state.mode,
        '<div class="log-viewer">' +
          '<div class="log-line amber">[POST-INCIDENT REPORT] 2026-10-14 outage</div>' +
          '<div class="log-line">cause: regional utility power loss</div>' +
          '<div class="log-line">duration: 9 hours (RTO = 4 hours — exceeded by 5 hours)</div>' +
          '<div class="log-line">existing controls:</div>' +
          '<div class="log-line pl-3">- UPS: present (10 min runtime)</div>' +
          '<div class="log-line pl-3">- dual PSU: present on hosts</div>' +
          '<div class="log-line pl-3">- redundant circuits: present</div>' +
          '<div class="log-line pl-3 danger">- ??? : MISSING</div>' +
          '<div class="log-line danger">→ UPS exhausted at 00:10, hosts went dark</div>' +
        '</div>' +
        '<label class="input-label">Which resilience control was missing?</label>' +
        radioGrid('metricMatches.M9_missing', state.env.metricMatches['M9_missing'] || '', [
          { value: 'generator', label: 'Generator' },
          { value: 'ups', label: 'UPS (additional)' },
          { value: 'loadbalancer', label: 'Load Balancer' },
          { value: 'cluster', label: 'Server Cluster' },
        ])
      );
    }

    if (objM10 || objM12 || objH7) {
      html += '<div class="card controls-card">' +
        '<label class="input-label">Enable redundant controls to engineer resilience:</label>' +
        '<div class="controls-grid">' +
          D.REDUNDANCY_CONTROLS.map(c => toggleRow(c.id, c.label, c.icon, state.env[c.id], c.desc)).join('') +
        '</div>' +
        '<div class="separator"></div>' +
        '<div class="sim-row">' +
          '<button class="btn btn-amber" data-action="run-sim">' + icon('flame', 14) + 'Run Failure Simulation</button>' +
          (state.env.simulationRun ?
            '<span class="sim-result ' + state.env.simulationOutcome + '">' +
              (state.env.simulationOutcome === 'survived' ? icon('check-circle', 14) : icon('x-circle', 14)) +
              'Simulation: ' + (state.env.simulationOutcome === 'survived' ? 'systems survived' : 'systems went down') +
            '</span>' : '') +
        '</div>' +
        (state.env.simulationRun && state.env.simulationOutcome === 'failed' ?
          '<div class="sim-fail-notice">' + icon('alert-triangle', 14) +
          '<p>The simulation took the systems down. Review which controls are still disabled and re-run. The validation requires the simulation to report <strong class="success">survived</strong>.</p></div>' : '') +
      '</div>';

      if (objM10) {
        html += objectiveCard(objM10, state, state.mode,
          '<p class="obj-instruction">Enable every power-resilience control above and run the simulation. The objective validates: dual PSU + UPS + generator + redundant circuits + simulation outcome = survived.</p>');
      }
      if (objM12) {
        html += objectiveCard(objM12, state, state.mode,
          '<p class="obj-instruction">Enable platform diversity AND multi-cloud, then run the simulation. Both must be ON and the simulation must report survived.</p>');
      }
      if (objH7) {
        html += objectiveCard(objH7, state, state.mode,
          '<p class="obj-instruction">A vendor outage is simulated. Enable the minimum set that survives: multi-cloud + platform diversity + (load balancer OR clustering). Then run the simulation.</p>');
      }
    }

    return html;
  }

  function renderSPOFDiagram(state) {
    return '<div class="spof-diagram">' +
      '<div class="spof-grid">' +
        D.SPOF_ITEMS.map(item => {
          const isPicked = state.env.metricMatches[item.id] === 'yes';
          return '<button class="spof-item ' + (isPicked ? 'picked' : '') +
            '" data-action="toggle-spof" data-spof-id="' + item.id + '">' +
            '<div class="spof-label">' + item.label +
            (isPicked ? icon('circle-dot', 12) : '') + '</div>' +
            '<div class="spof-desc">' + item.desc + '</div>' +
          '</button>';
        }).join('') +
      '</div>' +
      '<p class="spof-hint">Click to flag a SPOF. There are exactly four real SPOFs and two distractors.</p>' +
    '</div>';
  }

  /* --- Recovery Sites --- */
  function renderRecoverySites(state) {
    const objectives = objs();
    const objM6 = objectives.find(o => o.id === 'OBJ-M6');
    const objH3 = objectives.find(o => o.id === 'OBJ-H3');
    const functions = state.mode === 'hard' ? D.BUSINESS_FUNCTIONS_HARD : D.BUSINESS_FUNCTIONS_MEDIUM;

    let html = stationHeader('map-pin', '#2DD4BF', 'Recovery Site Map', 'Match business functions to hot / warm / cold sites');

    html += '<div class="site-types-grid">' +
      D.SITE_TYPES.map(s => '<div class="card site-type-card">' +
        '<div class="site-type-header">' + icon('building', 14) + '<span>' + s.label + '</span></div>' +
        '<p class="site-type-desc">' + s.desc + '</p>' +
        '<div class="site-type-cost">Cost: ' + s.cost + '</div>' +
      '</div>').join('') +
    '</div>';

    if (objM6) {
      html += objectiveCard(objM6, state, state.mode,
        '<div class="site-picker-list">' +
          functions.map(f => sitePickerRow(f, state.env.recoverySitePicks[f.id] || '')).join('') +
        '</div>'
      );
    }

    if (objH3) {
      html += objectiveCard(objH3, state, state.mode,
        '<div class="site-picker-hard-list">' +
          functions.map(f =>
            '<div class="site-picker-hard-row">' +
              '<div class="site-func-header"><span class="site-func-name">' + f.name + '</span><span class="site-func-rto">RTO: ' + f.rto + '</span></div>' +
              '<div class="site-radio-row">' +
                D.SITE_TYPES.map(s => radioItem('recoverySitePicks', f.id, s.id, s.id, state.env.recoverySitePicks[f.id] === s.id)).join('') +
              '</div>' +
              selectHtml('hardSiteJustifications', f.id, state.env.hardSiteJustifications[f.id] || '', 'Justify the cost / availability tradeoff…',
                D.JUSTIFICATION_OPTIONS.map(o => ({ value: o.value, label: o.label }))) +
            '</div>'
          ).join('') +
        '</div>'
      );
    }

    return html;
  }

  function sitePickerRow(f, currentValue) {
    return '<div class="site-picker-row">' +
      '<div class="site-func-header"><span class="site-func-name">' + f.name + '</span><span class="site-func-rto">RTO: ' + f.rto + '</span></div>' +
      '<div class="site-radio-row">' +
        D.SITE_TYPES.map(s => radioItem('recoverySitePicks', f.id, s.id, s.id, currentValue === s.id)).join('') +
      '</div>' +
    '</div>';
  }

  /* --- Continuity Library --- */
  function renderContinuityLibrary(state) {
    const objectives = objs();
    const objM3 = objectives.find(o => o.id === 'OBJ-M3');
    const objM8 = objectives.find(o => o.id === 'OBJ-M8');
    const objH1 = objectives.find(o => o.id === 'OBJ-H1');
    const objH5 = objectives.find(o => o.id === 'OBJ-H5');

    let html = stationHeader('clipboard-list', '#2DD4BF', 'Continuity Library', 'BCP · DRP · COOP — sort plans by scope and assign artifacts');

    html += '<div class="plan-types-grid">' +
      planCard('BCP', 'Business Continuity Plan', 'Enterprise-wide — keeps the BUSINESS running', 'building') +
      planCard('DRP', 'Disaster Recovery Plan', 'IT-focused — restores systems &amp; data (subset of BCP)', 'server-cog') +
      planCard('COOP', 'Continuity of Operations Plan', 'Mission-essential — may use non-technical fallbacks', 'shield') +
    '</div>';

    if (objM3) {
      html += objectiveCard(objM3, state, state.mode,
        '<label class="input-label">Order BCP, DRP, COOP from broadest business scope to narrowest mission-essential scope (click in order):</label>' +
        renderOrderPicker('scopeOrder', state.env.scopeOrder, shuffled([
          { id: 'BCP', label: 'BCP — Business Continuity Plan', desc: '' },
          { id: 'DRP', label: 'DRP — Disaster Recovery Plan', desc: '' },
          { id: 'COOP', label: 'COOP — Continuity of Operations Plan', desc: '' },
        ], 'scope-order-v1'), 'plans')
      );
    }

    if (objM8) {
      html += objectiveCard(objM8, state, state.mode,
        '<label class="input-label">Select every artifact that belongs in a BCP (multi-select):</label>' +
        '<div class="artifact-multiselect">' +
          D.CONTINUITY_ARTIFACTS_MEDIUM.map(a => {
            const picked = state.env.continuityPicks[a.id] === 'BCP';
            return '<button class="artifact-item ' + (picked ? 'picked' : '') +
              '" data-action="toggle-artifact" data-artifact-id="' + a.id + '">' +
              '<span class="checkbox ' + (picked ? 'checked' : '') + '"></span>' +
              '<span>' + esc(a.label) + '</span></button>';
          }).join('') +
        '</div>'
      );
    }

    if (objH1) {
      html += objectiveCard(objH1, state, state.mode,
        '<label class="input-label">Triage the 2026-10-14 incident. Place these four failures in the order they cascaded (click in order):</label>' +
        renderOrderPicker('incidentCascade', state.env.incidentCascade, shuffled(D.CASCADE_STEPS, 'cascade-v1'), 'failures')
      );
    }

    if (objH5) {
      html += objectiveCard(objH5, state, state.mode,
        '<label class="input-label">Match each artifact to the plan that owns it (BCP / DRP / COOP):</label>' +
        '<div class="artifact-tree-list">' +
          D.CONTINUITY_ARTIFACTS_HARD.map(a =>
            '<div class="artifact-tree-row">' +
              '<span class="artifact-tree-label">' + esc(a.label) + '</span>' +
              '<div class="artifact-tree-radios">' +
                ['BCP', 'DRP', 'COOP'].map(p => radioItem('hardArtifactPicks', a.id, p, p, state.env.hardArtifactPicks[a.id] === p)).join('') +
              '</div>' +
            '</div>'
          ).join('') +
        '</div>'
      );
    }

    return html;
  }

  function planCard(id, label, scope, iconName) {
    return '<div class="card plan-type-card">' +
      '<div class="site-type-header">' + icon(iconName, 14) + '<span>' + id + '</span></div>' +
      '<div class="plan-type-label">' + label + '</div>' +
      '<p class="plan-type-scope">' + scope + '</p>' +
    '</div>';
  }

  /* --- Test Director --- */
  function renderTestDirector(state) {
    const objectives = objs();
    const objM11 = objectives.find(o => o.id === 'OBJ-M11');
    const objH4 = objectives.find(o => o.id === 'OBJ-H4');

    let html = stationHeader('workflow', '#2DD4BF', 'Test Director', 'Tabletop · Simulation · Failover · Parallel · Cutover');

    html += '<div class="test-types-grid">' +
      D.TEST_TYPES.map(t => '<div class="card test-type-card">' +
        '<div class="site-type-header">' + icon('circle-dot', 14) + '<span>' + t.label + '</span></div>' +
        '<p class="test-type-desc">' + t.desc + '</p>' +
      '</div>').join('') +
    '</div>';

    if (objM11) {
      html += objectiveCard(objM11, state, state.mode,
        '<div class="test-picker-list">' +
          D.TEST_SCENARIOS_MEDIUM.map(s => testPickerRow(s, state.env.testPicks[s.id] || '', false)).join('') +
        '</div>'
      );
    }

    if (objH4) {
      html += objectiveCard(objH4, state, state.mode,
        '<div class="test-picker-list">' +
          D.TEST_SCENARIOS_HARD.map(s => testPickerRow(s, state.env.hardTestPicks[s.id] || '', true)).join('') +
        '</div>'
      );
    }

    return html;
  }

  function testPickerRow(s, currentValue, isHard) {
    const stateKey = isHard ? 'hardTestPicks' : 'testPicks';
    return '<div class="test-picker-row">' +
      '<p class="test-scenario">' + esc(s.scenario) + '</p>' +
      selectHtml(stateKey, s.id, currentValue, isHard ? 'Choose the deepest test the business can tolerate…' : 'Choose the correct test type…',
        D.TEST_TYPES.map(t => ({ value: t.id, label: t.label }))) +
    '</div>';
  }

  /* --- Capacity Desk --- */
  function renderCapacityDesk(state) {
    const objectives = objs();
    const objH6 = objectives.find(o => o.id === 'OBJ-H6');

    let html = stationHeader('gauge', '#2DD4BF', 'Capacity Desk', 'Match demand scenarios to people / technology / infrastructure strategies');

    html += '<div class="card info-card">' + icon('info', 16) +
      '<p>Capacity planning matches the supply of resources to demand. The exam tests three families: <strong>people</strong> (slow to scale), <strong>technology</strong> (autoscale/cloud, fast), and <strong>infrastructure</strong> (physical, longest lead time). Asset management and supply chain are sub-considerations within each.</p></div>';

    html += '<div class="capacity-types-grid">' +
      D.CAPACITY_TYPES.map(t => '<div class="card capacity-type-card">' +
        '<div class="site-type-header">' +
          (t.id === 'people' ? icon('users', 14) : t.id === 'technology' ? icon('workflow', 14) : icon('building', 14)) +
          '<span>' + t.label + '</span></div>' +
        '<p class="capacity-type-desc">' + t.desc + '</p>' +
      '</div>').join('') +
    '</div>';

    if (objH6) {
      html += objectiveCard(objH6, state, state.mode,
        '<div class="capacity-picker-list">' +
          D.CAPACITY_SCENARIOS_HARD.map(s =>
            '<div class="capacity-picker-row">' +
              '<p class="capacity-scenario">' + esc(s.scenario) + '</p>' +
              '<div class="capacity-radios">' +
                D.CAPACITY_TYPES.map(t => radioItem('hardCapacityPicks', s.id, t.id, t.id, state.env.hardCapacityPicks[s.id] === t.id)).join('') +
              '</div>' +
            '</div>'
          ).join('') +
        '</div>'
      );
    }

    return html;
  }

  /* --- Quiz Panel --- */
  function renderQuizPanel(state) {
    const quizArr = quiz();
    const accent = state.mode === 'medium' ? '#2DD4BF' : '#F59E0B';
    let html = stationHeader('help-circle', accent, 'Knowledge Check',
      state.mode === 'medium' ? '7 concept questions — select, then Submit to lock your answer' : '8 scenario-based items — select, then Submit to lock your answer');

    html += '<div class="quiz-list">' +
      quizArr.map((q, idx) => renderQuizQuestion(q, idx, state)).join('') +
    '</div>';

    return html;
  }

  function renderQuizQuestion(q, idx, state) {
    const selected = state.quizAnswered[q.id];
    const isSubmitted = state.quizSubmitted[q.id] || false;
    const isCorrect = selected === q.correct;

    return '<div class="card quiz-card">' +
      '<div class="quiz-header">' +
        '<span class="quiz-num">Q' + (idx + 1) + '</span>' +
        '<span class="quiz-id-badge">' + q.id + '</span>' +
        (isSubmitted ? '<span class="quiz-lock-badge ' + (isCorrect ? 'correct' : 'incorrect') + '">' +
          (isCorrect ? 'Locked · Correct' : 'Locked · Incorrect') + '</span>' : '') +
      '</div>' +
      '<p class="quiz-scenario">' + esc(q.scenario) + '</p>' +
      '<p class="quiz-question">' + esc(q.question) + '</p>' +
      '<div class="quiz-options" data-quiz-id="' + q.id + '">' +
        q.options.map(o => {
          const isSelected = selected === o.key;
          const showCorrect = isSubmitted && isSelected && o.key === q.correct;
          const showIncorrect = isSubmitted && isSelected && o.key !== q.correct;
          const cls = showCorrect ? 'correct' : showIncorrect ? 'incorrect' :
            isSubmitted ? 'dimmed' : isSelected ? 'selected' : '';
          return '<label class="quiz-option ' + cls + (isSubmitted ? ' locked' : '') + '">' +
            '<input type="radio" name="quiz-' + q.id + '" value="' + o.key + '"' +
            (isSelected ? ' checked' : '') + (isSubmitted ? ' disabled' : '') +
            ' data-action="quiz-select" data-quiz-id="' + q.id + '" data-option="' + o.key + '">' +
            '<span class="quiz-option-text"><span class="quiz-option-key">' + o.key + ')</span> ' + esc(o.label) + '</span>' +
            (showCorrect ? icon('check-circle', 14) : '') +
            (showIncorrect ? icon('x-circle', 14) : '') +
          '</label>';
        }).join('') +
      '</div>' +
      (!isSubmitted ?
        '<div class="quiz-submit-row">' +
          '<button class="btn btn-sm btn-teal" data-action="quiz-submit" data-quiz-id="' + q.id + '"' +
          (!selected ? ' disabled' : '') + '>' + icon('check-circle', 14) + 'Submit Answer</button>' +
          (!selected ? '<span class="quiz-hint">Select an option first</span>' : '') +
        '</div>' : '') +
      (isSubmitted ?
        '<div class="quiz-feedback ' + (isCorrect ? 'correct' : 'incorrect') + '">' +
          (isCorrect ? icon('check-circle', 14) : icon('x-circle', 14)) +
          '<p><strong class="' + (isCorrect ? 'success-text' : 'danger-text') + '">' +
          (isCorrect ? 'Correct. ' : 'Incorrect — ') + '</strong>' + esc(q.explanation) + '</p>' +
        '</div>' : '') +
    '</div>';
  }

  /* --- Debrief --- */
  function renderDebrief(state) {
    return stationHeader('clipboard-list', '#2DD4BF', 'Debrief · Field Notes', 'Detection opportunities · Mitigation recommendations · Blue-team &amp; Red-team takeaways') +
      '<div class="card debrief-card">' +
        '<div class="card-title">' + icon('activity', 16) + '<h3>Detection Opportunities</h3></div>' +
        '<ul class="bullet-list debrief-list">' +
          debriefItem('Backup-chain integrity monitors alert when no Full has succeeded within N days (Cypress &amp; Cedar had 28 days of incrementals with no anchor).') +
          debriefItem('UPS runtime telemetry — if runtime drops below a threshold without a generator paired, raise a SPOF ticket.') +
          debriefItem('Recovery site sync lag — alert if the warm site\'s last sync is older than RPO; that gap becomes RTO at failover time.') +
          debriefItem('Single-vendor concentration — asset inventory should flag when &gt; X% of workloads run on one cloud vendor or one OS.') +
        '</ul>' +
      '</div>' +
      '<div class="card debrief-card">' +
        '<div class="card-title">' + icon('shield-check', 16) + '<h3>Mitigation Recommendations</h3></div>' +
        '<div class="mitigation-grid">' +
          mitigationItem('Backups', 'Schedule recurring Fulls (weekly) + hourly snapshots or incrementals + immutability + replication + offsite copies.') +
          mitigationItem('Power', 'Dual PSU per host + UPS + generator + redundant circuits (single resilience family).') +
          mitigationItem('Network', 'NIC teaming + port aggregation + redundant ISP.') +
          mitigationItem('Compute', 'Clustering + load balancing for stateless tiers; replication for stateful tiers.') +
          mitigationItem('Recovery sites', 'Hot for revenue-critical; warm for operations; cold for archive — match RTO.') +
          mitigationItem('Plans', 'BCP (business) + DRP (IT) + COOP (mission-essential manual fallbacks).') +
          mitigationItem('Tests', 'Tabletop → simulation → failover → parallel → cutover, in increasing depth/risk.') +
          mitigationItem('Vendor risk', 'Platform diversity + multi-cloud for revenue-critical workloads.') +
        '</div>' +
      '</div>' +
      '<div class="debrief-two-col">' +
        '<div class="card debrief-card">' +
          '<div class="card-title">' + icon('shield', 16) + '<h3>Blue-Team Takeaways</h3></div>' +
          '<ul class="bullet-list debrief-list">' +
            debriefItem('Treat RPO and RTO as engineering targets, not paperwork.') +
            debriefItem('A documented plan is not a validated plan — test it.') +
            debriefItem('Immutability is the single best ransomware defense for backups.') +
            debriefItem('Multi-cloud + platform diversity cover both vendor outage AND vulnerability blast radius.') +
          '</ul>' +
        '</div>' +
        '<div class="card debrief-card">' +
          '<div class="card-title">' + icon('flame', 16) + '<h3>Red-Team-Mindset Takeaways</h3></div>' +
          '<ul class="bullet-list debrief-list">' +
            debriefItem('If backups aren\'t immutable, deleting them is the highest-impact move.') +
            debriefItem('Single-vendor estates are one CVE away from total compromise.') +
            debriefItem('Replication replicates corruption too — snapshots + immutability are the rollback path.') +
            debriefItem('Untested DRPs almost always have a hidden gap that fails on first contact.') +
          '</ul>' +
        '</div>' +
      '</div>' +
      '<div class="card debrief-card">' +
        '<div class="card-title">' + icon('file-text', 16) + '<h3>Official References</h3></div>' +
        '<ul class="ref-list">' +
          '<li><a href="https://www.comptia.org/en-us/certifications/security" target="_blank" rel="noopener noreferrer">CompTIA Security+ certification (SY0-801) — official page</a></li>' +
          '<li><a href="https://www.professormesser.com/security-plus/sy0-701/sy0-701-video/sy0-701-comptia-security-plus-course" target="_blank" rel="noopener noreferrer">Professor Messer SY0-701 training course (Section 3.4: Resiliency and Recovery)</a></li>' +
        '</ul>' +
      '</div>';
  }

  function debriefItem(text) {
    return '<li>' + icon('chevron-right', 12) + '<span>' + text + '</span></li>';
  }

  function mitigationItem(label, text) {
    return '<div class="mitigation-item"><div class="mitigation-label">' + label + '</div><div class="mitigation-text">' + text + '</div></div>';
  }

  /* --- Objectives Tracker (sidebar) --- */
  function renderObjectivesTracker(state) {
    const objectives = objs();
    const completedCount = objectives.filter(o => state.objectives[o.id]?.status === 'correct').length;
    const totalCount = objectives.length;
    const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const byPillar = {};
    objectives.forEach(o => { (byPillar[o.pillar] = byPillar[o.pillar] || []).push(o); });

    return '<div class="obj-tracker card">' +
      '<div class="tracker-header">' +
        icon('clipboard-list', 16) + '<h3>Objectives Tracker</h3>' +
        '<span class="tracker-count">' + completedCount + '/' + totalCount + '</span>' +
      '</div>' +
      '<div class="progress-bar"><div class="progress-fill" style="width:' + progressPct + '%"></div></div>' +
      '<div class="tracker-pillars">' +
        Object.keys(D.PILLAR_META).map(p => {
          const objs_p = byPillar[p];
          if (!objs_p || objs_p.length === 0) return '';
          const pm = D.PILLAR_META[p];
          return '<div class="tracker-pillar">' +
            '<div class="tracker-pillar-header">' + icon(pm.icon, 12) +
              '<span style="color:' + pm.color + '">' + pm.label + '</span></div>' +
            '<ul class="tracker-list">' +
              objs_p.map(o => {
                const status = state.objectives[o.id]?.status || 'idle';
                const stationId = stationIdForObjective(o);
                return '<li><button class="tracker-item ' + status +
                  '" data-action="jump-station" data-station="' + stationId + '" title="' + esc(o.text) + '">' +
                  (status === 'correct' ? icon('check-circle', 12) :
                   status === 'incorrect' ? icon('x-circle', 12) : icon('circle-dot', 12)) +
                  '<span>' + o.id.replace('OBJ-', '') + ': ' + esc(o.text.split('.')[0]) + '</span>' +
                '</button></li>';
              }).join('') +
            '</ul>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</div>';
  }

  function stationIdForObjective(o) {
    const s = o.station.toLowerCase();
    if (s.includes('knowledge')) return 'knowledge';
    if (s.includes('backup')) return 'backup';
    if (s.includes('redundancy') || s.includes('rack')) return 'redundancy';
    if (s.includes('site')) return 'sites';
    if (s.includes('continuity') && s.includes('library')) return 'continuity';
    if (s.includes('continuity') && s.includes('replay')) return 'briefing';
    if (s.includes('continuity') && s.includes('execution')) return 'tests';
    if (s.includes('test')) return 'tests';
    if (s.includes('capacity')) return 'capacity';
    if (s.includes('recovery objective')) return 'backup';
    return 'briefing';
  }

  /* --- Shared form helpers --- */
  function selectHtml(stateKey, fieldKey, value, placeholder, options) {
    const id = 'sel-' + stateKey.replace(/\./g, '-') + '-' + fieldKey;
    return '<select class="form-select" data-action="select-change" data-state-key="' + stateKey + '" data-field-key="' + fieldKey + '"' +
      (value ? '' : '') + '>' +
      (placeholder ? '<option value="">' + esc(placeholder) + '</option>' : '') +
      options.map(o => '<option value="' + esc(o.value) + '"' + (o.value === value ? ' selected' : '') + '>' + esc(o.label) + '</option>').join('') +
    '</select>';
  }

  function radioGrid(stateKey, currentValue, options) {
    const parts = stateKey.split('.');
    return '<div class="radio-grid">' +
      options.map(o =>
        '<label class="radio-item' + (currentValue === o.value ? ' selected' : '') + '">' +
          '<input type="radio" name="' + stateKey.replace(/\./g, '-') + '" value="' + o.value + '"' +
          (currentValue === o.value ? ' checked' : '') +
          ' data-action="radio-change" data-state-key="' + parts[0] + '" data-field-key="' + (parts[1] || '') + '">' +
          '<span>' + esc(o.label) + '</span>' +
        '</label>'
      ).join('') +
    '</div>';
  }

  function radioItem(stateKey, fieldKey, value, label, checked) {
    return '<label class="radio-inline' + (checked ? ' selected' : '') + '">' +
      '<input type="radio" name="' + stateKey + '-' + fieldKey + '" value="' + value + '"' +
      (checked ? ' checked' : '') +
      ' data-action="radio-change" data-state-key="' + stateKey + '" data-field-key="' + fieldKey + '">' +
      '<span>' + esc(label) + '</span>' +
    '</label>';
  }

  /* --- Completion modal --- */
  function renderCompletionModal(state) {
    const objectives = objs();
    const quizArr = quiz();
    const completedCount = objectives.filter(o => state.objectives[o.id]?.status === 'correct').length;
    const totalCount = objectives.length;
    const quizCorrect = quizArr.filter(q => state.quizSubmitted[q.id] && state.quizAnswered[q.id] === q.correct).length;
    const quizTotal = quizArr.length;
    const stars = V.computeStars(state, objectives, quizArr);
    const focusAreas = V.computeFocusAreas(state, objectives, quizArr);

    const byPillar = {};
    objectives.forEach(o => { (byPillar[o.pillar] = byPillar[o.pillar] || []).push(o); });

    const starsText = stars >= 5 ? 'Mastery achieved' : stars >= 4 ? 'Strong readiness' : stars >= 3 ? 'Solid foundation' : stars >= 2 ? 'Keep practicing' : 'Review and retry';

    return '<div class="modal-overlay" data-action="close-modal">' +
      '<div class="modal-content" onclick="event.stopPropagation()">' +
        '<button class="modal-close" data-action="close-modal" aria-label="Close">' + icon('x', 20) + '</button>' +
        '<div class="modal-header">' +
          '<h2>' + icon('trophy', 20) + 'Continuity Bay — Mission Complete</h2>' +
          '<p>Cypress &amp; Cedar Logistics now has a verified resilience &amp; recovery posture across backups, redundancy, recovery planning, and testing.</p>' +
        '</div>' +
        '<div class="modal-body">' +
          '<div class="modal-score">' +
            '<div class="modal-stars">' +
              [1,2,3,4,5].map(i => '<span class="star ' + (i <= stars ? 'filled' : '') + '">' + icon('star', 32) + '</span>').join('') +
            '</div>' +
            '<div class="modal-score-text">' + completedCount + '/' + totalCount + ' objectives · ' + quizCorrect + '/' + quizTotal + ' quiz</div>' +
            '<div class="modal-stars-label">' + starsText + '</div>' +
          '</div>' +
          '<div class="modal-pillars">' +
            Object.keys(D.PILLAR_META).map(p => {
              const objs_p = byPillar[p];
              if (!objs_p || objs_p.length === 0) return '';
              const pm = D.PILLAR_META[p];
              const cleared = objs_p.filter(o => state.objectives[o.id]?.status === 'correct').length;
              return '<div class="modal-pillar">' +
                '<div class="modal-pillar-header">' + icon(pm.icon, 14) +
                  '<span>' + pm.label + '</span>' +
                  '<span class="modal-pillar-count">' + cleared + '/' + objs_p.length + '</span></div>' +
                '<div class="modal-pillar-badges">' +
                  objs_p.map(o => {
                    const ok = state.objectives[o.id]?.status === 'correct';
                    return '<span class="modal-obj-badge ' + (ok ? 'correct' : 'incorrect') + '">' +
                      (ok ? icon('check-circle', 10) : icon('x-circle', 10)) +
                      o.id.replace('OBJ-', '') + '</span>';
                  }).join('') +
                '</div>' +
              '</div>';
            }).join('') +
          '</div>' +
          (focusAreas.length > 0 ?
            '<div class="modal-focus-areas">' +
              '<div class="modal-section-title">' + icon('target', 14) + '<span>Focus Areas — where to study more</span></div>' +
              '<ul class="focus-list">' +
                focusAreas.map(a => '<li>' + icon('arrow-right', 12) +
                  '<span><strong>' + esc(a.topic) + '</strong>' +
                  '<span class="focus-reason">' + esc(a.reason) + '</span></span></li>').join('') +
              '</ul>' +
            '</div>' : '') +
          '<div class="modal-next-steps">' +
            '<div class="modal-section-title">' + icon('arrow-right', 14) + '<span>What to learn next</span></div>' +
            '<ul class="next-list">' +
              '<li>• Move to ' + (state.mode === 'medium' ? 'Hard' : 'Medium') + ' mode for the same content from a different angle.</li>' +
              '<li>• Adjacent SY0-801 lessons: 3.1 (secure architecture), 3.2 (data protection), 3.3 (secure remote access).</li>' +
              '<li>• Related domains: Domain 4 (Security Operations) for incident response, Domain 5 (Governance/Risk/Compliance) for BCP governance.</li>' +
            '</ul>' +
          '</div>' +
          '<div class="modal-actions">' +
            '<button class="btn btn-outline" data-action="close-modal">Close</button>' +
            '<button class="btn btn-danger" data-action="reset">' + icon('rotate-ccw', 14) + 'Start over</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /* --- Reset dialog --- */
  function renderResetDialog() {
    return '<div class="modal-overlay" data-action="cancel-reset">' +
      '<div class="modal-content small" onclick="event.stopPropagation()">' +
        '<button class="modal-close" data-action="cancel-reset" aria-label="Close">' + icon('x', 20) + '</button>' +
        '<div class="modal-header">' +
          '<h2>' + icon('rotate-ccw', 16) + 'Reset the entire lab?</h2>' +
          '<p>This clears all progress, objectives, quiz answers, and environment state from localStorage and returns to the mode-selection screen. This cannot be undone.</p>' +
        '</div>' +
        '<div class="modal-actions">' +
          '<button class="btn btn-outline" data-action="cancel-reset">Cancel</button>' +
          '<button class="btn btn-danger" data-action="confirm-reset">' + icon('rotate-ccw', 14) + 'Reset everything</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /* --- Expose rendering + state --- */
  window.LAB_APP = {
    render, renderStationContent, renderCompletionModal, renderResetDialog,
    get activeStation() { return activeStation; },
    set activeStation(v) { activeStation = v; },
  };
})();
