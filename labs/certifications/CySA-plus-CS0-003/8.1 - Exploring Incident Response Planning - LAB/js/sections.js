/**
 * Binder sections — vanilla ports of src/components/lab/section-shell.tsx,
 * sections-a.tsx and sections-b.tsx (SEC-01 … SEC-10).
 *
 * Every section renders once per mount; field interactions commit straight to
 * the store and require no re-render (values live in the DOM until the next
 * mount). The Check button runs the objective engine and surgically updates
 * the stamp + results area, exactly like the original's SectionShell.
 */

var LabSections = (function () {
  var U = LabUI;

  function opt(list, labelKey) {
    return list.map(function (x) { return { id: x.id, label: x[labelKey] }; });
  }

  /* ---------------------------------------------------------------- */
  /* SectionShell (section-shell.tsx)                                  */
  /* ---------------------------------------------------------------- */

  /**
   * Builds the shared frame into `root`: header (icon, code, title, stamp),
   * intro, objective chips, body (filled by section builder), check footer.
   * Returns { bodyEl, onCheck wired } — the section-specific builder fills
   * bodyEl and returns nothing; check wiring is handled here.
   */
  function sectionShell(root, sectionKey, mode, bodyHtml, checkLabel) {
    var meta = null;
    for (var i = 0; i < SECTIONS.length; i++) if (SECTIONS[i].key === sectionKey) meta = SECTIONS[i];
    var state = LabStore.getState();
    var objectiveIds = [];
    for (var j = 0; j < meta.serves.length; j++) {
      if (meta.serves[j].mode === mode) objectiveIds = meta.serves[j].objectiveIds;
    }
    var objectives = OBJECTIVES.filter(function (o) { return objectiveIds.indexOf(o.id) !== -1; });
    var allDone = objectiveIds.length > 0 && objectiveIds.every(function (id) { return state.obj[id] && state.obj[id].done; });

    var el = document.createElement('section');
    el.className = 'section-shell';
    el.setAttribute('aria-labelledby', 'sec-' + sectionKey + '-title');

    var chipsHtml = '';
    for (var c = 0; c < objectives.length; c++) {
      var o = objectives[c];
      var done = state.obj[o.id] && state.obj[o.id].done;
      chipsHtml += '<span class="obj-chip ' + (done ? 'obj-chip--done' : '') + '" title="' + U.esc(o.title) + '">' +
        labIcon(PILLARS[o.pillar].icon) + U.esc(o.fullId) + '</span>';
    }

    el.innerHTML =
      '<header class="sec-header">' +
        '<div class="sec-header-top">' +
          '<span class="sec-icon" aria-hidden="true">' + labIcon(meta.icon) + '</span>' +
          '<div class="sec-title-wrap">' +
            '<p class="sec-eyebrow">' + U.esc(meta.code) + ' · Atlas Freight &amp; Logistics — IR Program Binder</p>' +
            '<h2 id="sec-' + sectionKey + '-title" class="sec-title">' + U.esc(meta.label) + '</h2>' +
          '</div>' +
          '<div class="sec-stamp"></div>' +
        '</div>' +
        '<p class="sec-intro">' + U.esc(meta.intro) + '</p>' +
        (objectives.length > 0
          ? '<div class="sec-obj-chips" aria-label="Objectives served by this section">' + chipsHtml + '</div>'
          : '') +
      '</header>' +
      '<div class="sec-body"></div>' +
      (objectiveIds.length > 0
        ? '<div class="sec-footer">' +
            '<p class="sec-footer-text">' + U.esc(allDone ? 'This section is stamped and filed.' : 'Finished with this section? Run the verification stamp.') + '</p>' +
            '<button type="button" class="btn btn--primary btn--lg sec-check">' +
              labIcon('ClipboardCheck', 'btn-icon') + U.esc(checkLabel || 'Check this section') +
            '</button>' +
          '</div>'
        : '') +
      '<div class="sec-results" aria-live="polite"></div>';

    root.appendChild(el);
    var bodyEl = el.querySelector('.sec-body');
    if (typeof bodyHtml === 'string') bodyEl.innerHTML = bodyHtml;
    return { el: el, bodyEl: bodyEl, meta: meta, objectiveIds: objectiveIds };
  }

  /** Wire the check button of a shell built by sectionShell. */
  function wireCheck(shell, mode) {
    if (!shell.objectiveIds.length) return;
    var el = shell.el;
    var checkBtn = el.querySelector('.sec-check');
    var stampEl = el.querySelector('.sec-stamp');
    var resultsEl = el.querySelector('.sec-results');
    checkBtn.addEventListener('click', function () {
      var outcomes = LabStore.checkObjectives(shell.objectiveIds);
      var st = LabStore.getState();
      var allDone = shell.objectiveIds.every(function (id) { return st.obj[id] && st.obj[id].done; });

      /* stamp */
      stampEl.innerHTML = U.stamp({ tone: allDone ? 'pass' : 'fail', label: allDone ? 'Verified' : 'Rejected', animate: false });
      U.replayStamp(stampEl.firstElementChild);

      /* footer text */
      el.querySelector('.sec-footer-text').textContent = allDone
        ? 'This section is stamped and filed.'
        : 'Finished with this section? Run the verification stamp.';

      /* result lines */
      var html = '';
      for (var i = 0; i < outcomes.length; i++) {
        var r = outcomes[i];
        var o = null;
        for (var k = 0; k < OBJECTIVES.length; k++) if (OBJECTIVES[k].id === r.id) o = OBJECTIVES[k];
        html += U.resultLine(r.pass, '<strong class="mono">' + U.esc(o.fullId) + '</strong> — ' +
          U.esc(r.pass ? o.feedbackPass : o.feedbackFail));
      }
      resultsEl.innerHTML = html;
    });
  }

  /* ---------------------------------------------------------------- */
  /* small builders shared by sections                                 */
  /* ---------------------------------------------------------------- */

  function card(innerHtml, extraClass) {
    return '<div class="card ' + (extraClass || '') + '">' + innerHtml + '</div>';
  }
  function cardTitle(text, extra) {
    return '<h3 class="card-title' + (extra ? ' ' + extra : '') + '">' + text + '</h3>';
  }
  function cardSub(text) {
    return '<p class="card-sub">' + U.esc(text) + '</p>';
  }

  /* ================================================================== */
  /* SEC-01 · Lifecycle Ledger (PhasesSection)                          */
  /* ================================================================== */

  function phasesSection(root, mode) {
    var shell = sectionShell(root, 'phases', mode, '');
    var state = LabStore.getState();
    var phaseOptions = opt(PHASES, 'name');

    var leftCard = document.createElement('div');
    leftCard.className = 'card';
    leftCard.innerHTML =
      cardTitle(mode === 'hard' ? 'Phase sequence (strict)' : 'A1 · Sequence the lifecycle') +
      cardSub(mode === 'hard'
        ? 'Drag the cards or use the arrows. Exact order required — no partial credit.'
        : 'Drag the cards or use the arrows. The loop closes at the end.');
    var seq = U.sequencer({
      idPrefix: 'phase-seq',
      hint: 'Incident response lifecycle, first to last',
      items: PHASES.map(function (p) { return { id: p.id, label: p.name, desc: p.tagline }; }),
      value: state.phaseOrder.slice(),
      onChange: function (order) { LabStore.setPhaseOrder(order); },
    });
    leftCard.appendChild(seq);

    var rightCol = document.createElement('div');
    rightCol.className = 'stack';

    if (mode === 'medium') {
      var a2 = document.createElement('div');
      a2.className = 'card';
      a2.innerHTML = cardTitle('A2 · File the activities') + cardSub('Assign each activity to the phase that owns it.');
      var list = document.createElement('div');
      list.className = 'stack-2';
      ACTIVITIES.forEach(function (a, i) {
        list.appendChild(U.assignRow({
          index: i + 1,
          labelHtml: U.esc(a.label),
          options: phaseOptions,
          value: state.activityPhase[a.id] || '',
          onChange: function (v) { LabStore.setField('activityPhase', a.id, v); },
          ariaLabel: 'Phase for activity: ' + a.label,
        }));
      });
      a2.appendChild(list);
      rightCol.appendChild(a2);

      var a3 = document.createElement('div');
      a3.className = 'card card--amber';
      var charterHtml = cardTitle('A3 · Program charter wall') +
        cardSub('Check the three commitments that come straight from the lesson — the other three are anti-patterns.') +
        '<div class="stack-2">';
      CHARTER_OPTIONS.forEach(function (c) {
        charterHtml += U.checkboxRow({
          id: 'charter-' + c.id,
          labelHtml: U.esc(c.label),
          checked: state.charterPick.indexOf(c.id) !== -1,
          ariaLabel: c.label,
        });
      });
      charterHtml += '</div>';
      a3.innerHTML = charterHtml;
      a3.querySelectorAll('.choice-input').forEach(function (input) {
        input.addEventListener('change', function () {
          LabStore.toggleIn('charterPick', input.id.replace('charter-', ''));
        });
      });
      rightCol.appendChild(a3);
    }

    if (mode === 'hard') {
      var tl = document.createElement('div');
      tl.className = 'card';
      tl.innerHTML =
        cardTitle(labIcon('AlertTriangle', 'icon-rose inline-icon') + ' Live case · FILE01 ransomware timeline') +
        cardSub('Ten synthetic events. Assign each to its phase — near-misses (e.g. “declaration = Containment”) are rejected.');
      var scrollWrap = document.createElement('div');
      scrollWrap.className = 'scroll-list vault-scroll';
      scrollWrap.setAttribute('data-scrollkeep', '1');
      TIMELINE_EVENTS.forEach(function (e) {
        scrollWrap.appendChild(U.assignRow({
          labelHtml: '<span class="mono-chip mono-chip--stone">' + U.esc(e.time) + '</span>' + U.esc(e.text),
          options: phaseOptions,
          value: state.eventPhase[e.id] || '',
          onChange: function (v) { LabStore.setField('eventPhase', e.id, v); },
          ariaLabel: 'Phase for event ' + e.time + ': ' + e.text,
        }));
      });
      tl.appendChild(scrollWrap);
      rightCol.appendChild(tl);
    }

    shell.bodyEl.innerHTML = '<div class="grid-2"></div>';
    var grid = shell.bodyEl.querySelector('.grid-2');
    grid.appendChild(leftCard);
    grid.appendChild(rightCol);
    wireCheck(shell, mode);
  }

  /* ================================================================== */
  /* SEC-02 · CSIRT Roster (TeamSection)                                */
  /* ================================================================== */

  function teamSection(root, mode) {
    var shell = sectionShell(root, 'team', mode, '');
    var state = LabStore.getState();
    var roleOptions = opt(ROLE_CARDS, 'role');

    var leftCard = document.createElement('div');
    leftCard.className = 'card';
    leftCard.innerHTML =
      cardTitle(mode === 'hard' ? 'Standing seats (reference)' : 'B1 · Who owns which duty') +
      cardSub(mode === 'hard'
        ? 'Reference sheet — the six core seats of any CSIRT.'
        : 'Six duties are pinned to the wall. Assign the seat that owns each.');
    var list = document.createElement('div');
    list.className = 'stack-2';
    ROLE_CARDS.forEach(function (r) {
      list.appendChild(U.assignRow({
        labelHtml: U.esc(r.duty),
        options: roleOptions,
        value: state.roleMatch[r.id] || '',
        onChange: function (v) { LabStore.setField('roleMatch', r.id, v); },
        ariaLabel: 'Role responsible for: ' + r.duty,
        placeholder: 'Assign a seat…',
      }));
    });
    leftCard.appendChild(list);

    var rightCol = document.createElement('div');
    rightCol.className = 'stack';

    if (mode === 'medium') {
      var crew = document.createElement('div');
      crew.className = 'card';
      var html =
        '<div class="banner banner--amber">' + labIcon('FileText', 'banner-icon') +
          '<div><p class="banner-eyebrow">Flash report · SEV-2 · synthetic</p>' +
          '<p class="banner-text">Phishing campaign: credential link, three users clicked and submitted, one mailbox server implicated. Runbook staffing call needed.</p></div>' +
        '</div>' +
        cardTitle('B2 · Call the crew') +
        cardSub('Check exactly the four people the runbook requires for this case.') +
        '<div class="grid-2 grid-2--tight">';
      CREW_MEDIUM.forEach(function (c) {
        html += U.checkboxRow({
          id: 'crew-' + c.id,
          labelHtml: '<span class="choice-strong">' + U.esc(c.name) + '</span><span class="choice-sub">' + U.esc(c.blurb) + '</span>',
          checked: state.crewMedium.indexOf(c.id) !== -1,
          ariaLabel: c.name,
        });
      });
      html += '</div><p class="mono-note" data-counter>Selected: ' + state.crewMedium.length + ' of 4 required</p>';
      crew.innerHTML = html;
      crew.querySelectorAll('.choice-input').forEach(function (input) {
        input.addEventListener('change', function () {
          LabStore.toggleIn('crewMedium', input.id.replace('crew-', ''));
          crew.querySelector('[data-counter]').textContent =
            'Selected: ' + LabStore.getState().crewMedium.length + ' of 4 required';
        });
      });
      rightCol.appendChild(crew);
    }

    if (mode === 'hard') {
      var roster = document.createElement('div');
      roster.className = 'card card--rose';
      var rHtml =
        '<div class="banner banner--rose">' + labIcon('AlertTriangle', 'banner-icon') +
          '<div><p class="banner-eyebrow">Incident brief · SEV-2 data breach · synthetic</p>' +
          '<p class="banner-text">Customer PII exposed through a compromised VPN account. Legal exposure likely. Stand up the CSIRT: exactly <strong>six</strong> people.</p></div>' +
        '</div>' +
        '<div class="grid-2 grid-2--tight">';
      ROSTER_HARD.forEach(function (p) {
        rHtml += U.checkboxRow({
          id: 'roster-' + p.id,
          labelHtml: '<span class="choice-strong">' + U.esc(p.name) + '</span><span class="choice-sub">' + U.esc(p.bio) + '</span>',
          checked: state.crewHard.indexOf(p.id) !== -1,
          ariaLabel: p.name,
        });
      });
      rHtml += '</div><p class="mono-note" data-counter>Selected: ' + state.crewHard.length + ' / 6 — strict set check</p>';
      roster.innerHTML = rHtml;
      roster.querySelectorAll('.choice-input').forEach(function (input) {
        input.addEventListener('change', function () {
          LabStore.toggleIn('crewHard', input.id.replace('roster-', ''));
          roster.querySelector('[data-counter]').textContent =
            'Selected: ' + LabStore.getState().crewHard.length + ' / 6 — strict set check';
        });
      });
      rightCol.appendChild(roster);
    }

    shell.bodyEl.innerHTML = '<div class="grid-2"></div>';
    var grid = shell.bodyEl.querySelector('.grid-2');
    grid.appendChild(leftCard);
    grid.appendChild(rightCol);
    wireCheck(shell, mode);
  }

  /* ================================================================== */
  /* SEC-03 · Triage Desk (TriageSection)                               */
  /* ================================================================== */

  function triageSection(root, mode) {
    var shell = sectionShell(root, 'triage', mode, '');
    var state = LabStore.getState();
    var sevOptions = opt(SEV_LEVELS, 'label');
    var escOptions = opt(ESC_OPTIONS, 'label');

    var sevMatrixHtml = '<div class="sev-matrix" aria-label="Severity matrix">';
    SEV_LEVELS.forEach(function (s) {
      sevMatrixHtml += '<div class="sev-card sev-card--' + s.id + '">' +
        '<p class="mono-label">' + U.esc(s.label) + '</p>' +
        '<p class="sev-desc">' + U.esc(s.desc) + '</p></div>';
    });
    sevMatrixHtml += '</div>';

    function incidentRows(incidents, mount) {
      incidents.forEach(function (i) {
        var wrap = document.createElement('div');
        wrap.className = 'incident-card';
        wrap.innerHTML = '<p class="incident-text"><span class="mono-chip mono-chip--rose">' + U.esc(i.code) + '</span>' + U.esc(i.text) + '</p>' +
          '<div class="grid-2 grid-2--tight incident-grid">' +
          '<div><label class="field-label">Severity</label><div data-slot="sev"></div></div>' +
          '<div><label class="field-label">Escalation</label><div data-slot="esc"></div></div>' +
          '</div>';
        wrap.querySelector('[data-slot="sev"]').appendChild(U.assignRow({
          options: sevOptions, value: state.incSev[i.id] || '',
          onChange: function (v) { LabStore.setField('incSev', i.id, v); },
          ariaLabel: 'Severity for ' + i.code,
        }));
        wrap.querySelector('[data-slot="esc"]').appendChild(U.assignRow({
          options: escOptions, value: state.incEsc[i.id] || '',
          onChange: function (v) { LabStore.setField('incEsc', i.id, v); },
          ariaLabel: 'Escalation for ' + i.code,
        }));
        mount(wrap);
      });
    }

    if (mode === 'medium') {
      var c1 = document.createElement('div');
      c1.className = 'card';
      c1.innerHTML = cardTitle('C1 · Grade the queue') + cardSub('Set severity and the mandated escalation for each report. All synthetic.');
      var c1list = document.createElement('div');
      c1list.className = 'stack-3';
      incidentRows(INCIDENTS_MEDIUM, function (w) { c1list.appendChild(w); });
      c1.appendChild(c1list);

      var c2 = document.createElement('div');
      c2.className = 'card';
      c2.innerHTML = cardTitle('C2 · Night-shift duty log') + cardSub('Two graded entries need their escalation call confirmed.');
      var c2list = document.createElement('div');
      c2list.className = 'stack-2';
      DUTY_LOG.forEach(function (d) {
        c2list.appendChild(U.assignRow({
          labelHtml: '<span class="mono-chip mono-chip--rose">' + U.esc(d.code) + '</span>' + U.esc(d.text),
          options: escOptions, value: state.dutyEsc[d.id] || '',
          onChange: function (v) { LabStore.setField('dutyEsc', d.id, v); },
          ariaLabel: 'Escalation for ' + d.code,
        }));
      });
      c2.appendChild(c2list);

      shell.bodyEl.innerHTML = sevMatrixHtml + '<div class="stack"></div>';
      shell.bodyEl.querySelector('.stack').appendChild(c1);
      shell.bodyEl.querySelector('.stack').appendChild(c2);
    }

    if (mode === 'hard') {
      var q = document.createElement('div');
      q.className = 'card card--rose';
      q.innerHTML = cardTitle('Three-incident queue') + cardSub('One IR manager. Grade each, set escalation — then order the queue.');
      var qlist = document.createElement('div');
      qlist.className = 'stack-3';
      incidentRows(INCIDENTS_HARD, function (w) { qlist.appendChild(w); });
      q.appendChild(qlist);

      var order = document.createElement('div');
      order.className = 'card';
      order.innerHTML = cardTitle('Response order') + cardSub('Drag the queue into the order the IR manager works them.');
      order.appendChild(U.sequencer({
        idPrefix: 'queue-seq',
        hint: 'Response priority, first to last',
        items: INCIDENTS_HARD.map(function (i) { return { id: i.id, label: i.code, desc: i.text.slice(0, 72) + '…' }; }),
        value: state.queueOrder.slice(),
        onChange: function (o) { LabStore.setQueueOrder(o); },
      }));

      shell.bodyEl.innerHTML = sevMatrixHtml + '<div class="grid-2"></div>';
      var grid = shell.bodyEl.querySelector('.grid-2');
      grid.appendChild(q);
      grid.appendChild(order);
    }

    wireCheck(shell, mode);
  }

  /* ================================================================== */
  /* SEC-04 · Plan Library (PlansSection)                               */
  /* ================================================================== */

  function plansSection(root, mode) {
    var shell = sectionShell(root, 'plans', mode, '');
    var state = LabStore.getState();
    var isHard = mode === 'hard';
    var scenarios = isHard ? PLAN_SCENARIOS_H : PLAN_SCENARIOS_M;
    var fieldKey = isHard ? 'planMatchH' : 'planMatchM';
    var stateMap = isHard ? state.planMatchH : state.planMatchM;
    var planOptions = opt(PLAN_OPTIONS, 'short');

    var shelfHtml =
      cardTitle('The shelf cards') + '<div class="stack-2">';
    PLAN_BLURBS.forEach(function (b) {
      var short = '';
      for (var i = 0; i < PLAN_OPTIONS.length; i++) if (PLAN_OPTIONS[i].id === b.id) short = PLAN_OPTIONS[i].short;
      shelfHtml += '<div class="shelf-card"><p class="shelf-label">' + U.esc(short) + '</p><p class="shelf-text">' + U.esc(b.label) + '</p></div>';
    });
    shelfHtml += '</div>' +
      '<p class="shelf-note">' + U.term('Stakeholder', 'Stakeholders') +
      ' across the business rely on the right plan being invoked — filing a disruption under the wrong plan wastes the first, most expensive minutes.</p>';

    var filesCard = document.createElement('div');
    filesCard.className = 'card';
    filesCard.innerHTML =
      cardTitle(isHard ? 'Disaster drill actions (5 files)' : 'File the disruptions (4 files)') +
      cardSub(isHard
        ? 'The COOP/BCP boundary is deliberately tricky. Read the distinguishing words.'
        : 'Route each scenario to the plan that governs it.');
    var list = document.createElement('div');
    list.className = 'stack-2';
    scenarios.forEach(function (s, i) {
      list.appendChild(U.assignRow({
        index: i + 1,
        labelHtml: U.esc(s.text),
        options: planOptions,
        value: stateMap[s.id] || '',
        onChange: function (v) { LabStore.setField(fieldKey, s.id, v); },
        ariaLabel: 'Governing plan for: ' + s.text,
        placeholder: 'Which plan?',
      }));
    });
    filesCard.appendChild(list);

    shell.bodyEl.innerHTML = '<div class="grid-plans"><div class="stack" data-shelf></div></div>';
    var grid = shell.bodyEl.querySelector('.grid-plans');
    var shelfCard = document.createElement('div');
    shelfCard.className = 'card';
    shelfCard.innerHTML = shelfHtml;
    grid.querySelector('[data-shelf]').appendChild(shelfCard);
    grid.appendChild(filesCard);
    wireCheck(shell, mode);
  }

  /* ================================================================== */
  /* SEC-05 · Comms Matrix (CommsSection)                               */
  /* ================================================================== */

  function commsSection(root, mode) {
    var shell = sectionShell(root, 'comms', mode, '');
    var state = LabStore.getState();

    var channelOptions = [
      { id: 'bridge', label: 'War-room bridge' },
      { id: 'briefing', label: 'Executive briefing call' },
      { id: 'intranet', label: 'Intranet notice' },
      { id: 'statuspage', label: 'Status page / support email' },
      { id: 'portal', label: 'Regulatory portal filing' },
      { id: 'press', label: 'Press release' },
    ];
    var timingOptions = [
      { id: 'now', label: 'Immediately' },
      { id: '1h', label: 'Within 1 hour' },
      { id: 'daily', label: 'Daily report' },
      { id: 'legal', label: 'After legal review' },
    ];
    var audOptions = [
      { id: 'internal', label: 'Internal' },
      { id: 'external', label: 'External' },
    ];
    var actionOptions = [
      { id: 'now', label: 'Notify immediately' },
      { id: '1h', label: 'Notify within 1 hour' },
      { id: 'review', label: 'Only after legal review & containment confirmed' },
      { id: 'hold', label: 'Do not contact yet' },
    ];

    if (mode === 'medium') {
      var card1 = document.createElement('div');
      card1.className = 'card';
      card1.innerHTML =
        cardTitle(labIcon('Info', 'inline-icon icon-amber') + ' D1 · Notification matrix — five groups') +
        cardSub('For each group set channel, timing, and whether the audience is internal or external. Rule of thumb: insiders move first; outsiders wait for verified facts and legal review.');
      var list = document.createElement('div');
      list.className = 'stack-3';
      STAKEHOLDERS_M.forEach(function (st) {
        var wrap = document.createElement('div');
        wrap.className = 'incident-card';
        wrap.innerHTML = '<p class="choice-strong">' + U.esc(st.name) + '</p>' +
          '<div class="grid-3">' +
          '<div><label class="field-label">Channel</label><div data-slot="ch"></div></div>' +
          '<div><label class="field-label">Timing</label><div data-slot="tim"></div></div>' +
          '<div><label class="field-label">Audience</label><div data-slot="aud"></div></div>' +
          '</div>';
        wrap.querySelector('[data-slot="ch"]').appendChild(U.assignRow({
          options: channelOptions, value: state.commsCh[st.id] || '',
          onChange: function (v) { LabStore.setField('commsCh', st.id, v); },
          ariaLabel: 'Channel for ' + st.name,
        }));
        wrap.querySelector('[data-slot="tim"]').appendChild(U.assignRow({
          options: timingOptions, value: state.commsTim[st.id] || '',
          onChange: function (v) { LabStore.setField('commsTim', st.id, v); },
          ariaLabel: 'Timing for ' + st.name,
        }));
        wrap.querySelector('[data-slot="aud"]').appendChild(U.assignRow({
          options: audOptions, value: state.commsAud[st.id] || '',
          onChange: function (v) { LabStore.setField('commsAud', st.id, v); },
          ariaLabel: 'Audience type for ' + st.name,
        }));
        list.appendChild(wrap);
      });
      card1.appendChild(list);
      shell.bodyEl.appendChild(card1);
    }

    if (mode === 'hard') {
      var card2 = document.createElement('div');
      card2.className = 'card card--rose';
      card2.innerHTML =
        '<div class="banner banner--rose">' + labIcon('AlertTriangle', 'banner-icon') +
          '<div><p class="banner-eyebrow">Update · SEV-2 breach now has regulatory exposure · synthetic</p>' +
          '<p class="banner-text">Confirmed customer PII exposure. Seven parties are queued for a decision. One of them must be explicitly <strong>held back</strong> — choose carefully.</p></div>' +
        '</div>';
      var stack = document.createElement('div');
      stack.className = 'stack-2';
      PARTIES_H.forEach(function (p) {
        stack.appendChild(U.assignRow({
          labelHtml: U.esc(p.name),
          options: actionOptions, value: state.commsActionH[p.id] || '',
          onChange: function (v) { LabStore.setField('commsActionH', p.id, v); },
          ariaLabel: 'Notification decision for ' + p.name,
          placeholder: 'Decision…',
        }));
      });
      card2.appendChild(stack);
      shell.bodyEl.appendChild(card2);
    }

    wireCheck(shell, mode);
  }

  /* ================================================================== */
  /* SEC-06 · Exercise Yard (ExercisesSection)                          */
  /* ================================================================== */

  function exercisesSection(root, mode) {
    var shell = sectionShell(root, 'exercises', mode, '');
    var state = LabStore.getState();
    var typeOptions = opt(EX_TYPES, 'label');
    var isHard = mode === 'hard';
    var rows = isHard ? STAGES_H : EXERCISES_M;
    var fieldKey = isHard ? 'exStageH' : 'exMatchM';
    var stateMap = isHard ? state.exStageH : state.exMatchM;

    var leftCard = document.createElement('div');
    leftCard.className = 'card';
    leftCard.innerHTML =
      cardTitle(isHard ? 'Program design (3 stages)' : 'E1 · Label the drills') +
      cardSub(isHard
        ? 'One type per maturity stage. Budget, risk and what must be proven all constrain the choice.'
        : 'Five descriptions from the exercise catalog. Return each its type label.');
    var list = document.createElement('div');
    list.className = 'stack-2';
    rows.forEach(function (x, i) {
      list.appendChild(U.assignRow({
        index: i + 1,
        labelHtml: U.esc(x.text),
        options: typeOptions,
        value: stateMap[x.id] || '',
        onChange: function (v) { LabStore.setField(fieldKey, x.id, v); },
        ariaLabel: 'Exercise type for: ' + x.text,
        placeholder: 'Exercise type…',
      }));
    });
    leftCard.appendChild(list);

    shell.bodyEl.innerHTML = '<div class="grid-2"></div>';
    var grid = shell.bodyEl.querySelector('.grid-2');
    grid.appendChild(leftCard);

    if (mode === 'medium') {
      var ladder = document.createElement('div');
      ladder.className = 'card';
      ladder.innerHTML = cardTitle('E2 · The disruption ladder') +
        cardSub('Rank all five types from least to most disruptive to production. Each rung adds realism — and risk.');
      ladder.appendChild(U.sequencer({
        idPrefix: 'ex-seq',
        hint: 'Exercise types, least to most disruptive',
        items: EX_TYPES.map(function (t) { return { id: t.id, label: t.label }; }),
        value: state.exOrder.slice(),
        onChange: function (o) { LabStore.setExOrder(o); },
      }));
      grid.appendChild(ladder);
    }

    if (mode === 'hard') {
      var watch = document.createElement('div');
      watch.className = 'card';
      watch.innerHTML =
        cardTitle(labIcon('ShieldAlert', 'inline-icon icon-amber') + ' Near-miss watch') +
        '<ul class="stack-2 plain-list">' +
          '<li class="hint-card">A first-ever exercise is <strong>never</strong> a full interruption — and “we want failover proof without touching customer traffic” is the dictionary definition of the parallel test.</li>' +
          '<li class="hint-card">Simulation proves the <strong>people</strong>; parallel proves the <strong>alternate site</strong>. Auditors asking for site proof want the latter.</li>' +
        '</ul>';
      grid.appendChild(watch);
    }

    wireCheck(shell, mode);
  }

  /* ================================================================== */
  /* SEC-07 · Evidence Vault (VaultSection)                             */
  /* ================================================================== */

  function vaultSection(root, mode) {
    var shell = sectionShell(root, 'vault', mode, '');
    var state = LabStore.getState();
    var durOptions = opt(DURATION_OPTIONS, 'label');
    var actionOptions = opt(RET_ACTION_OPTIONS, 'label');

    var leftCol = document.createElement('div');
    leftCol.className = 'stack';

    var memo = document.createElement('div');
    memo.className = 'card card--amber';
    memo.innerHTML =
      '<p class="pin-label">' + labIcon('Pin', 'pin-icon') + ' Policy memo · simplified</p>' +
      '<ul class="memo-list">' +
        '<li>· Firewall &amp; VPN logs — <strong>1 year</strong></li>' +
        '<li>· Endpoint (EDR) telemetry — <strong>90 days</strong></li>' +
        '<li>· Email records — <strong>3 years</strong></li>' +
        '<li>· Anything under a legal hold — <strong>until release</strong></li>' +
      '</ul>' +
      '<p class="fineprint">Training data — durations are fictional Atlas policy, not legal advice.</p>';
    leftCol.appendChild(memo);

    if (mode === 'hard') {
      var notice = document.createElement('div');
      notice.className = 'card card--rose';
      notice.innerHTML =
        '<p class="pin-label pin-label--rose">' + labIcon('Pin', 'pin-icon') + ' Preservation notice · in force</p>' +
        '<p class="notice-text">Outside counsel has issued a litigation hold covering <strong>all materials related to last quarter’s phishing near-miss</strong>. Destruction of anything in scope is suspended until release.</p>';
      leftCol.appendChild(notice);
    }
    if (mode === 'medium') {
      var notice2 = document.createElement('div');
      notice2.className = 'card card--rose';
      notice2.innerHTML =
        '<p class="pin-label pin-label--rose">' + labIcon('Pin', 'pin-icon') + ' Preservation notice · new</p>' +
        '<p class="notice-text">Regulators sent a preservation notice for last quarter’s phishing near-miss. Decide which artifact class it overrides.</p>';
      leftCol.appendChild(notice2);
    }

    var rightCol = document.createElement('div');
    rightCol.className = 'stack';

    if (mode === 'medium') {
      var f1 = document.createElement('div');
      f1.className = 'card';
      f1.innerHTML = cardTitle('F1 · Set the schedules') + cardSub('Apply the policy-memo duration to each artifact class.');
      var f1list = document.createElement('div');
      f1list.className = 'stack-2';
      RETENTION_M.forEach(function (r) {
        f1list.appendChild(U.assignRow({
          labelHtml: U.esc(r.name),
          options: durOptions, value: state.retDurM[r.id] || '',
          onChange: function (v) { LabStore.setField('retDurM', r.id, v); },
          ariaLabel: 'Retention duration for ' + r.name,
          placeholder: 'Duration…',
        }));
      });
      f1.appendChild(f1list);
      rightCol.appendChild(f1);

      var f2 = document.createElement('div');
      f2.className = 'card';
      f2.innerHTML = cardTitle('F2 · Apply the hold') +
        cardSub('Which artifact class does the preservation notice override — and what does its duration become?');
      var f2list = document.createElement('div');
      f2list.className = 'stack-2';
      f2list.appendChild(U.assignRow({
        labelHtml: 'Artifact class covered by the hold',
        options: opt(RETENTION_M, 'name'), value: state.holdTarget,
        onChange: function (v) { LabStore.setHoldTarget(v); },
        ariaLabel: 'Artifact class covered by the legal hold',
        placeholder: 'Pick the class…',
      }));
      f2.appendChild(f2list);
      var note = document.createElement('p');
      note.className = 'fineprint';
      note.innerHTML = '(Set that class’s duration above to <span class="mono">Until legal release (hold)</span>.)';
      f2.appendChild(note);
      rightCol.appendChild(f2);
    }

    if (mode === 'hard') {
      var f1h = document.createElement('div');
      f1h.className = 'card';
      f1h.innerHTML = cardTitle('F1 · Decide each class’s fate') + cardSub('The hold follows the incident — not the org chart.');
      var f1hlist = document.createElement('div');
      f1hlist.className = 'stack-2';
      RETENTION_H.forEach(function (r) {
        f1hlist.appendChild(U.assignRow({
          labelHtml: U.esc(r.name),
          options: actionOptions, value: state.retActionH[r.id] || '',
          onChange: function (v) { LabStore.setField('retActionH', r.id, v); },
          ariaLabel: 'Retention decision for ' + r.name,
          placeholder: 'Decision…',
        }));
      });
      f1h.appendChild(f1hlist);
      rightCol.appendChild(f1h);

      var f2h = document.createElement('div');
      f2h.className = 'card';
      var custodyHtml = cardTitle('F2 · Find the custody break') +
        '<p class="card-sub"><strong>Chain of custody</strong> = continuous, documented control of evidence. One handling step below breaks it. Mark it.</p>' +
        '<div class="stack-2" role="radiogroup" aria-label="Select the step that breaks chain of custody">';
      CUSTODY_STEPS.forEach(function (c, i) {
        custodyHtml += U.radioRow({
          name: 'custody-pick',
          id: 'custody-' + c.id,
          value: c.id,
          checked: state.custodyPick === c.id,
          ariaLabel: 'Step ' + (i + 1),
          labelHtml: '<span class="mono-chip mono-chip--stone">STEP ' + (i + 1) + '</span>' + U.esc(c.text),
          wrapClass: 'choice-row',
        });
      });
      custodyHtml += '</div>';
      f2h.innerHTML = custodyHtml;
      f2h.querySelectorAll('input[type="radio"]').forEach(function (input) {
        input.addEventListener('change', function () {
          if (input.checked) LabStore.setCustodyPick(input.value);
        });
      });
      rightCol.appendChild(f2h);
    }

    shell.bodyEl.innerHTML = '<div class="grid-plans"></div>';
    var grid = shell.bodyEl.querySelector('.grid-plans');
    grid.appendChild(leftCol);
    grid.appendChild(rightCol);
    wireCheck(shell, mode);
  }

  /* ================================================================== */
  /* SEC-08 · Playbook Stand (PlaybookSection, medium)                  */
  /* ================================================================== */

  function playbookSection(root, mode) {
    var shell = sectionShell(root, 'playbooks', mode, '');
    var state = LabStore.getState();

    var pickCard = document.createElement('div');
    pickCard.className = 'card';
    var pickHtml = cardTitle('G1 · Which get a playbook?') +
      cardSub('Keep the three candidates that are repeatable <em>security incidents</em>. The other two go back.') +
      '<div class="stack-2">';
    PLAY_CANDIDATES.forEach(function (c) {
      pickHtml += U.checkboxRow({
        id: 'play-' + c.id,
        labelHtml: U.esc(c.label),
        checked: state.playPick.indexOf(c.id) !== -1,
        ariaLabel: c.label,
      });
    });
    pickHtml += '</div><p class="mono-note" data-counter>Selected: ' + state.playPick.length + ' of 3</p>';
    pickCard.innerHTML = pickHtml;
    pickCard.querySelectorAll('.choice-input').forEach(function (input) {
      input.addEventListener('change', function () {
        LabStore.toggleIn('playPick', input.id.replace('play-', ''));
        pickCard.querySelector('[data-counter]').textContent =
          'Selected: ' + LabStore.getState().playPick.length + ' of 3';
      });
    });

    var orderCard = document.createElement('div');
    orderCard.className = 'card';
    orderCard.innerHTML = cardTitle(labIcon('FileText', 'inline-icon icon-amber') + ' G2 · Order the phishing playbook') +
      cardSub('Six steps, scrambled. Put them in execution order.');
    orderCard.appendChild(U.sequencer({
      idPrefix: 'play-seq',
      hint: 'Phishing playbook steps in execution order',
      items: PLAYBOOK_STEPS.map(function (p) { return { id: p.id, label: p.text }; }),
      value: state.playOrder.slice(),
      onChange: function (o) { LabStore.setPlayOrder(o); },
    }));

    shell.bodyEl.innerHTML = '<div class="grid-2"></div>';
    var grid = shell.bodyEl.querySelector('.grid-2');
    grid.appendChild(pickCard);
    grid.appendChild(orderCard);
    wireCheck(shell, mode);
  }

  /* ================================================================== */
  /* SEC-09 · Plan Audit (AuditSection, hard)                           */
  /* ================================================================== */

  function auditSection(root, mode) {
    var shell = sectionShell(root, 'audit', mode, '', 'Submit the audit');
    var state = LabStore.getState();

    var doc = document.createElement('div');
    doc.className = 'card card--flush';
    var linesHtml = '';
    AUDIT_LINES.forEach(function (l) {
      var marked = state.auditMark.indexOf(l.id) !== -1;
      linesHtml += '<li><button type="button" class="audit-line ' + (marked ? 'audit-line--marked' : '') + '" data-line="' + U.esc(l.id) + '" aria-pressed="' + marked + '">' +
        '<span class="audit-mark" aria-hidden="true">' + (marked ? '✕' : '·') + '</span>' +
        '<span>' + U.esc(l.text.replace(/^\d+\.\s*/, '')) + '</span>' +
        '</button></li>';
    });
    doc.innerHTML =
      '<div class="audit-head">' +
        '<div><p class="mono-label">Draft document · inherited from the disbanded program · synthetic</p>' +
        '<h3 class="card-title">“Atlas IR Plan — DRAFT v0.9”</h3></div>' +
        '<p class="audit-flag">4 defects · marking sound lines fails</p>' +
      '</div>' +
      '<div class="audit-body">' +
        '<p class="audit-hint">' + labIcon('AlertTriangle', 'inline-icon icon-amber') + ' Tap a line to mark it defective. Tap again to clear. Two lines are odd-but-sound red herrings.</p>' +
        '<ul class="audit-list">' + linesHtml + '</ul>' +
      '</div>';
    doc.querySelectorAll('.audit-line').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.dataset.line;
        LabStore.toggleIn('auditMark', id);
        var marked = LabStore.getState().auditMark.indexOf(id) !== -1;
        btn.classList.toggle('audit-line--marked', marked);
        btn.setAttribute('aria-pressed', String(marked));
        btn.querySelector('.audit-mark').textContent = marked ? '✕' : '·';
      });
    });

    shell.bodyEl.appendChild(doc);
    wireCheck(shell, mode);
  }

  /* ================================================================== */
  /* SEC-10 · War Room (WarRoomSection, hard)                           */
  /* ================================================================== */

  function warRoomSection(root, mode) {
    var shell = sectionShell(root, 'warroom', mode, '', 'Sign the decision log');
    var state = LabStore.getState();

    var wrap = document.createElement('div');
    wrap.className = 'stack';
    var banner = document.createElement('div');
    banner.className = 'dark-banner';
    banner.innerHTML = labIcon('AlertTriangle', 'dark-banner-icon') +
      '<p class="dark-banner-text"><span class="dark-banner-label">Tabletop · live-fire · synthetic</span><br>' +
      'Four injects, in fixed order. One correct action each — the tempting wrong answer is always in the room. Your choices are logged with timestamps.</p>';
    wrap.appendChild(banner);

    INJECTS.forEach(function (inj, idx) {
      var cardEl = document.createElement('div');
      cardEl.className = 'card';
      var optsHtml = '<div class="stack-2" role="radiogroup" aria-label="Action for inject ' + (idx + 1) + ': ' + U.esc(inj.scenario) + '">';
      inj.options.forEach(function (o) {
        optsHtml += U.radioRow({
          name: 'war-' + inj.id,
          id: inj.id + '-' + o.id,
          value: o.id,
          checked: state.warPick[inj.id] === o.id,
          ariaLabel: o.label,
          labelHtml: U.esc(o.label),
          wrapClass: 'choice-row choice-row--option',
        });
      });
      optsHtml += '</div>';
      cardEl.innerHTML =
        '<div class="inject-head">' +
          '<span class="mono-chip mono-chip--dark">' + U.esc(inj.clock) + '</span>' +
          '<span class="inject-eyebrow">Inject ' + (idx + 1) + ' of ' + INJECTS.length + '</span>' +
        '</div>' +
        '<p class="inject-scenario">' + U.esc(inj.scenario) + '</p>' + optsHtml;
      cardEl.querySelectorAll('input[type="radio"]').forEach(function (input) {
        input.addEventListener('change', function () {
          if (input.checked) LabStore.setWarPick(inj.id, input.value);
        });
      });
      wrap.appendChild(cardEl);
    });

    shell.bodyEl.appendChild(wrap);
    wireCheck(shell, mode);
  }

  /* ---------------------------------------------------------------- */
  /* router                                                            */
  /* ---------------------------------------------------------------- */

  function render(mode, sectionKey, root) {
    root.innerHTML = '';
    switch (sectionKey) {
      case 'phases': phasesSection(root, mode); break;
      case 'team': teamSection(root, mode); break;
      case 'triage': triageSection(root, mode); break;
      case 'plans': plansSection(root, mode); break;
      case 'comms': commsSection(root, mode); break;
      case 'exercises': exercisesSection(root, mode); break;
      case 'vault': vaultSection(root, mode); break;
      case 'playbooks': playbookSection(root, mode); break;
      case 'audit': auditSection(root, mode); break;
      case 'warroom': warRoomSection(root, mode); break;
    }
    root.firstElementChild.classList.add('view-anim');
  }

  return { render: render };
})();
