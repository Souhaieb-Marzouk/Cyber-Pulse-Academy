// ---------------------------------------------------------------------------
// sheets-b.js — drawing sheets D-500 → M-800.
// 1:1 vanilla ports of OpsSheet, ResilienceSheet, SecuritySheet and
// StudioSheet (src/components/lab/sheets/…), including the seeded runbook
// shuffle (fix #6) and the action-log ordering the Hard validator checks.
// ---------------------------------------------------------------------------

// eslint-disable-next-line no-undef
var SheetsB = (function () {
  'use strict';

  var U = LabUI;
  var icon = U.icon;
  var esc = U.esc;

  function store() {
    return LabStore.getState();
  }

  // ======================================================================
  // D-500 Ops Journal (OBJ-M8 or OBJ-H3)
  // ======================================================================
  var SEV_CLASS = { info: 'info', warn: 'warn', error: 'error' };

  function OpsSheet() {
    var root = U.el('article');
    var mode0 = store().mode;
    var review = U.reviewItemCard(mode0 === 'medium' ? 'OBJ-M8' : 'OBJ-H3');

    root.innerHTML = U.sheetIntro(
      'D-500',
      'Ops journal — read the evidence before touching anything',
      '<p>Last night the checkout p95 tripled. The journal below is the estate’s telemetry — some of it matters, some of it is noise. A managed service will run a bad query forever: query design and indexing are always your job under DBaaS.</p>',
    );
    root.appendChild(review.el);

    // Journal lines
    var journal = U.el('section', 'sheet-card rounded-md p-4');
    journal.setAttribute('aria-label', 'Operations journal');
    journal.innerHTML =
      '<h3 class="inner-title">Operations journal — estate-db-01</h3><ul class="journal-list log-mono" style="margin-top:0.75rem" aria-label="Log lines"></ul>';
    var journalList = journal.querySelector('.journal-list');
    root.appendChild(journal);

    // Noise triage (Hard only)
    var noiseSection = null;
    var noiseBtns = {};
    if (mode0 === 'hard') {
      noiseSection = U.el('section', 'sheet-card rounded-md p-4');
      noiseSection.setAttribute('aria-label', 'Noise triage');
      noiseSection.innerHTML =
        '<h3 class="inner-title">Noise triage — is each line related to the checkout incident?</h3>' +
        '<p class="body-xs" style="margin-top:0.25rem">Mark unrelated lines before any remediation is accepted.</p>' +
        '<div style="margin-top:0.75rem;display:flex;flex-direction:column;gap:0.5rem" data-role="noise"></div>';
      var noiseWrap = noiseSection.querySelector('[data-role="noise"]');
      [
        { id: 'etl', text: 'Marketing ETL CPU spike 02:00–02:40 (expected window)' },
        { id: 'cert', text: 'staging-lb certificate expiry warning' },
        { id: 'bi', text: 'BI dashboard vendor cache warm-up slowness' },
      ].forEach(function (n) {
        var row = U.el(
          'div',
          'noise-row',
          '<p class="mono-xs">' + esc(n.text) + '</p>' +
            '<div style="display:flex;gap:0.5rem">' +
            '<button type="button" class="chip-option" data-testid="noise-' + n.id + '-related" style="flex:1">Related</button>' +
            '<button type="button" class="chip-option" data-testid="noise-' + n.id + '-unrelated" style="flex:1">Unrelated (noise)</button>' +
            '</div>',
        );
        ['related', 'unrelated'].forEach(function (v) {
          var btn = row.querySelector('[data-testid="noise-' + n.id + '-' + v + '"]');
          btn.addEventListener('click', function () {
            LabStore.actions.updateEnv(function (e) {
              var noise = Object.assign({}, e.ops.noise);
              noise[n.id] = v;
              return Object.assign({}, e, { ops: Object.assign({}, e.ops, { noise: noise }) });
            });
          });
          noiseBtns[n.id + '-' + v] = btn;
        });
        noiseWrap.appendChild(row);
      });
      root.appendChild(noiseSection);
    }

    // Diagnosis cards
    var diag = U.el('section', 'sheet-card rounded-md p-4');
    diag.setAttribute('aria-label', 'Diagnosis');
    diag.innerHTML =
      '<h3 class="inner-title">Diagnosis cards</h3><div class="grid-2" style="margin-top:0.75rem" data-role="diag-cards"></div>';
    var diagWrap = diag.querySelector('[data-role="diag-cards"]');
    var diagSels = {};
    function diagCard(key, prompt, options, testid, path) {
      var box = U.el(
        'div',
        '',
        '<p class="body-xs" style="font-weight:700;color:var(--ink)">' + esc(prompt) + '</p>',
      );
      box.style.border = '1px solid var(--line)';
      box.style.borderRadius = 'var(--radius-sm)';
      box.style.padding = '0.75rem';
      var holder = U.el('div');
      holder.style.marginTop = '0.5rem';
      var sel = U.draftSelect({
        label: key === 'seqscan' ? 'Evidence reading' : 'Connection holder',
        options: options,
        testid: testid,
        onChange: function (v) {
          LabStore.actions.updateEnv(function (e) {
            var d = Object.assign({}, e.ops.diagnosis);
            d[path] = v;
            return Object.assign({}, e, { ops: Object.assign({}, e.ops, { diagnosis: d }) });
          });
        },
      });
      holder.appendChild(sel);
      box.appendChild(holder);
      diagWrap.appendChild(box);
      diagSels[path] = sel;
    }
    diagCard(
      'seqscan',
      OPS_DIAGNOSIS.seqscan.prompt,
      OPS_DIAGNOSIS.seqscan.options.map(function (o, i) {
        return { value: String(i), label: o };
      }),
      'diag-seqscan',
      'seqscan',
    );
    if (mode0 === 'hard') {
      diagCard(
        'conn',
        OPS_DIAGNOSIS.conn.prompt,
        OPS_DIAGNOSIS.conn.options.map(function (o, i) {
          return { value: String(i), label: o };
        }),
        'diag-conn',
        'conn',
      );
    }
    root.appendChild(diag);

    // Remediation board
    var remediation = U.el('section', 'sheet-card rounded-md p-4');
    remediation.setAttribute('aria-label', 'Remediation board');
    remediation.innerHTML =
      '<h3 class="inner-title">Remediation board — apply only what the evidence supports</h3>' +
      '<div class="grid-2" style="margin-top:0.75rem;gap:0.5rem" data-role="actions"></div>' +
      '<p class="section-note">Applied actions are numbered in order. Tap an applied action to withdraw it.</p>';
    var actionsWrap = remediation.querySelector('[data-role="actions"]');
    var actionBtns = {};
    OPS_ACTIONS.forEach(function (a) {
      var btn = U.el(
        'button',
        'action-btn',
        '<span><span data-role="label">' + esc(a.label) + '</span><span class="order" data-role="order"></span></span>' +
          '<span data-role="icon"></span>',
      );
      btn.type = 'button';
      btn.setAttribute('data-testid', 'action-' + a.id);
      btn.setAttribute('aria-pressed', 'false');
      btn.addEventListener('click', function () {
        LabStore.actions.updateEnv(function (e) {
          var applied = e.ops.applied.slice();
          if (applied.indexOf(a.id) !== -1) {
            applied = applied.filter(function (x) {
              return x !== a.id;
            });
          } else {
            applied.push(a.id);
          }
          return Object.assign({}, e, { ops: Object.assign({}, e.ops, { applied: applied }) });
        });
      });
      actionsWrap.appendChild(btn);
      actionBtns[a.id] = btn;
    });
    root.appendChild(remediation);
    root.appendChild(U.nextSheetButton('resilience', 'Next sheet: R-600 Resilience Desk'));

    function update(state) {
      review.update(state);
      var ops = state.env.ops;
      // journal
      journalList.innerHTML = OPS_LINES.map(function (l, i) {
        return (
          '<li class="journal-line ' +
          SEV_CLASS[l.severity] +
          (state.mode === 'hard' && l.herring ? ' herring' : '') +
          '"><span class="journal-ts">' +
          esc(l.ts) +
          '</span> <span class="journal-src">[' +
          esc(l.source) +
          ']</span> ' +
          esc(l.text) +
          '</li>'
        );
      }).join('');
      // noise
      if (state.mode === 'hard') {
        ['etl', 'cert', 'bi'].forEach(function (id) {
          ['related', 'unrelated'].forEach(function (v) {
            var on = ops.noise[id] === v;
            var btn = noiseBtns[id + '-' + v];
            btn.setAttribute('aria-pressed', String(on));
            btn.className =
              'chip-option' +
              (on ? (v === 'unrelated' ? ' on-verified' : ' on-wax') : '');
          });
        });
      }
      diagSels.seqscan.update(ops.diagnosis.seqscan || '');
      if (state.mode === 'hard') diagSels.conn.update(ops.diagnosis.conn || '');
      // actions with order numbers
      OPS_ACTIONS.forEach(function (a) {
        var applied = ops.applied.indexOf(a.id) !== -1;
        var btn = actionBtns[a.id];
        btn.setAttribute('aria-pressed', String(applied));
        btn.className = 'action-btn' + (applied ? ' applied' : '');
        btn.querySelector('[data-role="order"]').textContent = applied
          ? '#' + (ops.applied.indexOf(a.id) + 1)
          : '';
        btn.querySelector('[data-role="icon"]').innerHTML = applied
          ? icon('Ban')
          : icon('Wrench', '', null).replace('<svg ', '<svg style="opacity:0.6" ');
      });
    }
    update(store());
    return { el: root, update: update };
  }

  // ======================================================================
  // R-600 Resilience Desk (OBJ-M9 or OBJ-H5)
  // ======================================================================
  var CONTROL_LIST = [
    { key: 'pitr', label: 'Point-in-time recovery (PITR)', desc: 'Replay transaction logs onto a base backup — restore to any moment in the window.', log: 'pitr' },
    { key: 'snapshotSchedule', label: 'Manual snapshot schedule (your own)', desc: 'Manual snapshots usually survive instance deletion — automated ones often do not.', log: 'snapshotSchedule' },
    { key: 'crossRegion', label: 'Cross-region backup copy', desc: 'A regional failure must not take the data and its backups together.', log: 'crossRegion' },
    { key: 'crossAccount', label: 'Cross-account backup copy', desc: 'An account compromise must not take the data and its backups together.', log: 'crossAccount' },
    { key: 'multiAz', label: 'Synchronous multi-AZ standby', desc: 'Hot in-step copy in another zone with automatic failover. Resilience, not read scaling — costs write latency.', log: 'multiAz' },
    { key: 'offlineVault', label: 'Offline export vault', desc: 'Air-gapped periodic export, physically separated.', log: 'offlineVault' },
  ];

  function ResilienceSheet() {
    var root = U.el('article');
    var mode0 = store().mode;
    var review = U.reviewItemCard(mode0 === 'medium' ? 'OBJ-M9' : 'OBJ-H5');

    root.innerHTML = U.sheetIntro(
      'R-600',
      'Resilience desk — what the recovery guarantee really is',
      '<p>Backup edges from the lesson, now on your desk: retention windows are finite; restores create a new instance; automated backups can die with the instance; and by default everything lives in one account and region. Enable controls in the order a real incident would demand.</p>',
    );
    root.appendChild(review.el);

    // Requirements card
    var req = U.el('section', 'sheet-card rounded-md p-4');
    req.setAttribute('aria-label', 'Requirements card');
    req.innerHTML =
      '<h3 class="inner-title">Requirements card</h3><ul class="requirement-list" data-role="reqs"></ul>';
    var reqsEl = req.querySelector('[data-role="reqs"]');
    root.appendChild(req);

    // Control bank
    var bank = U.el('section', 'sheet-card rounded-md p-4');
    bank.setAttribute('aria-label', 'Backup and DR control bank');
    bank.innerHTML =
      '<h3 class="inner-title">Control bank</h3><div style="margin-top:0.75rem;display:flex;flex-direction:column;gap:0.5rem" data-role="controls"></div>';
    var controlsWrap = bank.querySelector('[data-role="controls"]');
    var controlBtns = {};
    CONTROL_LIST.forEach(function (c) {
      var btn = U.el(
        'button',
        'switch-row',
        '<span><span class="switch-row-label">' +
          esc(c.label) +
          '</span><span class="switch-row-desc">' +
          esc(c.desc) +
          '</span></span>' +
          '<span class="switch-row-state bad" data-role="state">OFF</span>',
      );
      btn.type = 'button';
      btn.setAttribute('role', 'switch');
      btn.setAttribute('aria-checked', 'false');
      btn.setAttribute('data-testid', 'res-' + c.key);
      btn.addEventListener('click', function () {
        LabStore.actions.updateEnv(function (e) {
          var r = e.resilience;
          var log = r.actionLog.slice();
          if (!r[c.key]) log.push(c.log);
          else log = log.filter(function (a) { return a !== c.log; });
          var patch = Object.assign({}, r);
          patch[c.key] = !r[c.key];
          patch.actionLog = log;
          return Object.assign({}, e, { resilience: patch });
        });
      });
      controlsWrap.appendChild(btn);
      controlBtns[c.key] = btn;
    });
    var retentionCard = U.el(
      'div',
      '',
      '<p class="switch-row-label">Automated-backup retention window</p>' +
        '<p class="switch-row-desc">Finite by design. Damage discovered after the window is unrecoverable from automated backups.</p>',
    );
    retentionCard.style.border = '1px solid var(--line)';
    retentionCard.style.borderRadius = 'var(--radius-sm)';
    retentionCard.style.background = 'rgba(255,255,255,0.6)';
    retentionCard.style.padding = '0.75rem';
    var retentionSel = U.draftSelect({
      label: 'Retention',
      options: [
        { value: '7', label: '7 days — $0' },
        { value: '14', label: '14 days — +$60/mo' },
        { value: '35', label: '35 days — +$140/mo' },
      ],
      testid: 'res-retention',
      onChange: function (v) {
        LabStore.actions.updateEnv(function (e) {
          return Object.assign({}, e, {
            resilience: Object.assign({}, e.resilience, { retentionDays: Number(v) }),
          });
        });
      },
    });
    retentionCard.appendChild(retentionSel);
    controlsWrap.appendChild(retentionCard);

    var failoverRow = U.el('div', '');
    failoverRow.style.cssText = 'margin-top:1rem;display:flex;flex-wrap:wrap;align-items:center;gap:0.5rem';
    var failoverBtn = U.el(
      'button',
      'btn btn-sm btn-default',
      icon('PlayCircle') + ' Run failover test (AZ-A → AZ-B)',
    );
    failoverBtn.type = 'button';
    failoverBtn.setAttribute('data-testid', 'failover-test');
    failoverBtn.addEventListener('click', function () {
      LabStore.actions.updateEnv(function (e) {
        return Object.assign({}, e, {
          resilience: Object.assign({}, e.resilience, { failoverTestRun: true }),
        });
      });
    });
    var failoverMsg = U.el('span', 'live-line');
    failoverRow.appendChild(failoverBtn);
    failoverRow.appendChild(failoverMsg);
    bank.appendChild(failoverRow);
    root.appendChild(bank);

    // Recovery readout
    var readout = U.el('section', 'sheet-card rounded-md p-4');
    readout.setAttribute('aria-label', 'Recovery readout');
    readout.innerHTML =
      '<h3 class="inner-title">Recovery readout</h3>' +
      '<div style="margin-top:0.75rem" class="grid-2-sm grid-4-desktop" aria-live="polite" data-role="tiles"></div>' +
      '<p class="section-note">Restores create a <strong>new instance</strong> — recovery is not in-place: repoint the application and expect restore time proportional to data. Measure it.</p>';
    var tiles = readout.querySelector('[data-role="tiles"]');
    root.appendChild(readout);
    root.appendChild(U.nextSheetButton('security', 'Next sheet: SEC-700 Security Desk'));

    function fmtMin(mins) {
      return mins >= 60 ? Math.round(mins / 60) + ' h' : mins + ' min';
    }

    function update(state) {
      review.update(state);
      var r = state.env.resilience;
      // requirements (mode-aware)
      reqsEl.innerHTML =
        state.mode === 'medium'
          ? '<li>1 · Recover with <strong>RPO ≤ 15 minutes</strong>.</li>' +
            '<li>2 · Data survives <strong>instance deletion</strong> (including its automated backups).</li>' +
            '<li>3 · Service survives an <strong>availability-zone failure</strong>.</li>' +
            '<li style="font-size:0.75rem;color:var(--ink-muted)">…and prove it: run the failover test. An untested DR plan is a hypothesis.</li>'
          : '<li>1 · Recover with <strong>RPO ≤ 5 minutes</strong>.</li>' +
            '<li>2 · Survive <strong>account compromise</strong> (everything in the account deleted).</li>' +
            '<li>3 · Survive <strong>regional failure</strong>.</li>' +
            '<li>4 · Enable the controls in the <strong>correct sequence</strong> — window first, then blast radius.</li>' +
            '<li>5 · Stay under <strong>$2,000/month</strong> — the vault option is a near-miss.</li>';
      // controls
      CONTROL_LIST.forEach(function (c) {
        var on = r[c.key];
        var btn = controlBtns[c.key];
        btn.setAttribute('aria-checked', String(on));
        btn.className = 'switch-row' + (on ? ' on' : '');
        btn.querySelector('[data-role="state"]').textContent = on ? 'ON' : 'OFF';
        btn.querySelector('[data-role="state"]').className =
          'switch-row-state ' + (on ? 'ok' : 'bad');
      });
      retentionSel.update(String(r.retentionDays));
      // failover
      failoverMsg.textContent = r.failoverTestRun
        ? '✓ Failover rehearsed: standby promoted in 94 s, writes resumed.'
        : '';
      // readout
      var guarantees = RPO_RTO.compute(r);
      var cost = RPO_RTO.cost(r);
      var overBudget = cost > 2000;
      var rpoTarget = state.mode === 'medium' ? 15 : 5;
      tiles.innerHTML =
        '<div class="readout-tile"><p class="readout-caption">RPO</p><p class="readout-value ' +
        (guarantees.rpo <= rpoTarget ? 'g-ok' : 'g-bad') +
        '">' +
        fmtMin(guarantees.rpo) +
        '</p></div>' +
        '<div class="readout-tile"><p class="readout-caption">RTO</p><p class="readout-value ' +
        (guarantees.rto <= 120 ? 'g-ok' : 'g-bad') +
        '">' +
        fmtMin(guarantees.rto) +
        '</p></div>' +
        '<div class="readout-tile"><p class="readout-caption">Survives</p><p class="body-xs" style="margin-top:0.125rem;font-weight:600;line-height:1.4;color:var(--ink)">instance delete: ' +
        (guarantees.survivesInstanceDelete ? '✓' : '✗') +
        ' · region: ' +
        (guarantees.survivesRegion ? '✓' : '✗') +
        ' · account: ' +
        (guarantees.survivesAccount ? '✓' : '✗') +
        '</p></div>' +
        '<div class="readout-tile ' +
        (overBudget ? 'tile-bad' : 'tile-ok') +
        '"><p class="readout-caption">Cost</p><p class="readout-value ' +
        (overBudget ? 'g-bad' : 'g-ok') +
        '">$' +
        cost.toLocaleString() +
        '<span class="gauge-unit">/mo</span></p><p class="body-xs" style="font-size:10px">budget cap (Hard): $2,000</p></div>';
    }
    update(store());
    return { el: root, update: update };
  }

  // ======================================================================
  // SEC-700 Security Desk (OBJ-M10 or OBJ-H6)
  // ======================================================================
  function SecuritySheet() {
    var root = U.el('article');
    var mode0 = store().mode;
    var review = U.reviewItemCard(mode0 === 'medium' ? 'OBJ-M10' : 'OBJ-H6');

    root.innerHTML = U.sheetIntro(
      'SEC-700',
      'Security desk — access control is always yours',
      '<p>Under DBaaS the provider patches and backs up; you keep access control, the network path and encryption choices. Every red line here is a map pin for an attacker.</p>',
    );
    root.appendChild(review.el);

    var board = U.el('section', 'sheet-card rounded-md p-4');
    board.setAttribute('aria-label', 'Posture board');
    board.innerHTML =
      '<h3 class="inner-title">Posture board — estate-db-01</h3><div style="margin-top:0.75rem;display:flex;flex-direction:column;gap:0.5rem" data-role="controls"></div>' +
      '<p aria-live="polite" style="margin-top:0.75rem" class="posture-msg" data-role="board-msg"></p>';
    var controlsWrap = board.querySelector('[data-role="controls"]');
    var boardMsg = board.querySelector('[data-role="board-msg"]');
    root.appendChild(board);

    var CONTROLS = [
      { key: 'encryptRest', label: 'Encryption at rest (incl. snapshots & backups)' },
      { key: 'tls', label: 'TLS in transit (client ↔ database ↔ replicas)' },
      { key: 'iamAuth', label: 'Identity-based access — no static DB passwords' },
      { key: 'audit', label: 'Audit logging of reads & admin actions' },
      { key: 'secretsManager', label: 'Application secrets moved to a secrets manager' },
    ];
    var secBtns = {};
    CONTROLS.forEach(function (c) {
      var btn = U.el(
        'button',
        'switch-row',
        '<span><span class="switch-row-label">' +
          esc(c.label) +
          '</span><span class="switch-row-desc" data-role="state-text"></span></span>' +
          '<span data-role="icon"></span>',
      );
      btn.type = 'button';
      btn.setAttribute('role', 'switch');
      btn.setAttribute('aria-checked', 'false');
      btn.setAttribute('data-testid', 'sec-' + c.key);
      btn.addEventListener('click', function () {
        LabStore.actions.updateEnv(function (e) {
          var s = e.security;
          var patch = Object.assign({}, s);
          patch[c.key] = !s[c.key];
          return Object.assign({}, e, { security: patch });
        });
      });
      controlsWrap.appendChild(btn);
      secBtns[c.key] = btn;
    });
    var publicBtn = U.el(
      'button',
      'switch-row',
      '<span><span class="switch-row-label">Public internet access to the database endpoint</span>' +
        '<span class="switch-row-desc" data-role="state-text"></span></span>' +
        '<span data-role="icon"></span>',
    );
    publicBtn.type = 'button';
    publicBtn.setAttribute('role', 'switch');
    publicBtn.setAttribute('data-testid', 'sec-public');
    publicBtn.addEventListener('click', function () {
      LabStore.actions.updateEnv(function (e) {
        var s = e.security;
        return Object.assign({}, e, { security: Object.assign({}, s, { publicAccess: !s.publicAccess }) });
      });
    });
    controlsWrap.appendChild(publicBtn);

    // Threat mapping (Hard)
    var threatSection = null;
    var mitreSels = {};
    if (mode0 === 'hard') {
      threatSection = U.el('section', 'sheet-card rounded-md p-4');
      threatSection.setAttribute('aria-label', 'Threat mapping');
      threatSection.innerHTML =
        '<h3 class="inner-title">Threat mapping — ATT&amp;CK technique IDs</h3>' +
        '<div style="margin-top:0.75rem;display:flex;flex-direction:column;gap:0.75rem">' +
        '<div style="border:1px solid var(--line);border-radius:var(--radius-sm);padding:0.75rem"><p class="body-xs" style="font-weight:700;color:var(--ink)">Path A: an attacker steals the application’s database credentials (reused static password), connects, and quietly copies the customer table.</p><div style="margin-top:0.5rem" data-role="mitre1"></div></div>' +
        '<div style="border:1px solid var(--line);border-radius:var(--radius-sm);padding:0.75rem"><p class="body-xs" style="font-weight:700;color:var(--ink)">Path B: the same attacker finds the estate’s snapshot copies sitting in an object-storage bucket and downloads them.</p><div style="margin-top:0.5rem" data-role="mitre2"></div></div>' +
        '</div>' +
        '<ul style="margin-top:0.75rem;display:flex;flex-direction:column;gap:0.25rem;list-style:none">' +
        MITRE_LINKS.map(function (m) {
          return (
            '<li><a class="threat-link" style="display:inline-flex;align-items:center;gap:0.25rem" href="' +
            esc(m.url) +
            '" target="_blank" rel="noopener noreferrer">' +
            esc(m.label) +
            ' ' +
            icon('ExternalLink', '', null) +
            '</a></li>'
          );
        }).join('') +
        '</ul>';
      var MITRE_OPTS = [
        { value: 'T1213', label: 'T1213' },
        { value: 'T1530', label: 'T1530' },
        { value: 'T1078', label: 'T1078' },
        { value: 'T1486', label: 'T1486' },
      ];
      mitreSels.mitre1 = U.draftSelect({
        label: 'ATT&CK technique',
        options: MITRE_OPTS,
        testid: 'mitre-1',
        onChange: function (v) {
          LabStore.actions.updateEnv(function (e) {
            return Object.assign({}, e, { security: Object.assign({}, e.security, { mitre1: v }) });
          });
        },
      });
      mitreSels.mitre2 = U.draftSelect({
        label: 'ATT&CK technique',
        options: MITRE_OPTS,
        testid: 'mitre-2',
        onChange: function (v) {
          LabStore.actions.updateEnv(function (e) {
            return Object.assign({}, e, { security: Object.assign({}, e.security, { mitre2: v }) });
          });
        },
      });
      threatSection.querySelector('[data-role="mitre1"]').appendChild(mitreSels.mitre1);
      threatSection.querySelector('[data-role="mitre2"]').appendChild(mitreSels.mitre2);
      root.appendChild(threatSection);
    }

    root.appendChild(U.nextSheetButton('studio', 'Next sheet: M-800 Schema & Migration Studio'));

    function update(state) {
      review.update(state);
      var s = state.env.security;
      CONTROLS.forEach(function (c) {
        var on = s[c.key];
        var btn = secBtns[c.key];
        btn.setAttribute('aria-checked', String(on));
        btn.className = 'switch-row ' + (on ? 'on' : 'off-danger');
        btn.querySelector('[data-role="state-text"]').textContent = on
          ? 'Control active.'
          : 'Open — attacker map pin.';
        btn.querySelector('[data-role="state-text"]').className =
          'switch-row-desc ' + (on ? 'state-ok' : 'state-bad');
        btn.querySelector('[data-role="icon"]').innerHTML = on
          ? icon('Lock', 'ok')
          : icon('Unlock', 'bad');
      });
      var pub = s.publicAccess;
      publicBtn.setAttribute('aria-checked', String(pub));
      publicBtn.className = 'switch-row ' + (pub ? 'off-alert' : 'on');
      publicBtn.querySelector('[data-role="state-text"]').textContent = pub
        ? 'OPEN TO THE INTERNET — flag this in every review.'
        : 'Private network path only.';
      publicBtn.querySelector('[data-role="state-text"]').className =
        'switch-row-desc ' + (pub ? 'state-bad' : 'state-ok');
      publicBtn.querySelector('[data-role="icon"]').innerHTML = pub
        ? icon('Unlock', 'bad')
        : icon('Lock', 'ok');
      var boardGreen =
        s.encryptRest && s.tls && s.iamAuth && s.audit && s.secretsManager && !s.publicAccess;
      boardMsg.className = 'posture-msg ' + (boardGreen ? 'pm-ok' : 'pm-bad');
      boardMsg.textContent = boardGreen
        ? 'Posture board GREEN — baseline closed.'
        : 'Posture board still shows open lines.';
      if (state.mode === 'hard') {
        mitreSels.mitre1.update(s.mitre1);
        mitreSels.mitre2.update(s.mitre2);
      }
    }
    update(store());
    return { el: root, update: update };
  }

  // ======================================================================
  // M-800 Schema & Migration Studio (OBJ-M11/M12 or OBJ-H7/H8)
  // ======================================================================
  // R6: runbook candidates must never display in their correct order.
  // Deterministic seeded shuffle (SSR-safe LCG in the original; identical math).
  function seededShuffle(arr, seed) {
    var a = arr.slice();
    var s = (seed >>> 0) || 1;
    function rand() {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    }
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }
  var CORRECT_ORDER = MIGRATION_STEPS.map(function (s) { return s.id; }).join(',');
  function pickSeed(start) {
    var s = start;
    for (var i = 0; i < 99; i++) {
      if (
        seededShuffle(MIGRATION_STEPS, s)
          .map(function (x) { return x.id; })
          .join(',') !== CORRECT_ORDER
      )
        return s;
      s += 1;
    }
    return s;
  }

  function StudioSheet() {
    var root = U.el('article');
    var mode0 = store().mode;
    var shuffleSeed = pickSeed(20260101);

    var mediumCards = mode0 === 'medium' ? [U.reviewItemCard('OBJ-M11'), U.reviewItemCard('OBJ-M12')] : null;
    var hardCards = mode0 === 'hard' ? [U.reviewItemCard('OBJ-H7'), U.reviewItemCard('OBJ-H8')] : null;

    root.innerHTML = U.sheetIntro(
      'M-800',
      'Schema & migration studio — models, forms and moves',
      '<p>The studio drafts the structural decisions: who operates the store, where analytics belongs, how a specimen table breaks the rules, and how an estate changes engines.</p>',
    );

    // ---------- Medium ----------
    var mediumWrap = null;
    var caseBtns = {};
    var tradeBtns = {};
    var olapSels = {};
    var cacheBtns = {};
    if (mode0 === 'medium') {
      mediumWrap = U.el('div');
      // service-model cases
      var cases = U.el('section', 'sheet-card rounded-md p-4');
      cases.setAttribute('aria-label', 'Service model cases');
      function caseBox(title, testPrefix, id, desc) {
        var box = U.el('div');
        box.style.border = '1px solid var(--line)';
        box.style.borderRadius = 'var(--radius-sm)';
        box.style.padding = '0.75rem';
        box.innerHTML =
          '<p class="body-sm" style="font-weight:700;color:var(--ink)">' +
          esc(title) +
          '</p><p class="body-xs" style="margin-top:0.25rem">' +
          esc(desc) +
          '</p><div style="margin-top:0.5rem;display:flex;gap:0.5rem">' +
          '<button type="button" class="chip-option" data-testid="' + testPrefix + '-dbaas" style="flex:1">Managed DBaaS</button>' +
          '<button type="button" class="chip-option" data-testid="' + testPrefix + '-iaas" style="flex:1">Self-managed on IaaS</button>' +
          '</div>';
        ['dbaas', 'iaas'].forEach(function (v) {
          var btn = box.querySelector('[data-testid="' + testPrefix + '-' + v + '"]');
          btn.addEventListener('click', function () {
            LabStore.actions.updateEnv(function (e) {
              var sm = Object.assign({}, e.studio.serviceModel);
              sm[id] = v;
              return Object.assign({}, e, { studio: Object.assign({}, e.studio, { serviceModel: sm }) });
            });
          });
          caseBtns[testPrefix + '-' + v] = btn;
        });
        return box;
      }
      cases.innerHTML =
        '<h3 class="inner-title">Service-model cases</h3><div class="grid-2" style="margin-top:0.75rem" data-role="cases"></div>' +
        '<h4 class="inner-title-sm" style="margin-top:1rem">Trade-off cards — who does the work?</h4>' +
        '<div style="margin-top:0.5rem;display:flex;flex-direction:column;gap:0.5rem" data-role="trades"></div>';
      var casesWrap = cases.querySelector('[data-role="cases"]');
      casesWrap.appendChild(
        caseBox(
          'Case A — storefront database',
          'casea',
          'caseA',
          'A three-person platform team, a vanilla PostgreSQL engine, no DBA, and a strong preference for spending engineering time on product rather than operations.',
        ),
      );
      casesWrap.appendChild(
        caseBox(
          'Case B — risk-engine database',
          'caseb',
          'caseB',
          'Needs a custom engine extension and engine-level settings the managed service forbids (restricted superuser). The team can staff a small operations rota.',
        ),
      );
      var tradesWrap = cases.querySelector('[data-role="trades"]');
      TRADEOFF_ROWS.forEach(function (row) {
        var div = U.el(
          'div',
          '',
          '<p class="body-xs" style="font-weight:600;color:var(--ink)">' + esc(row.text) + '</p>',
        );
        div.style.cssText =
          'display:grid;align-items:center;gap:0.5rem;border:1px solid var(--line);border-radius:var(--radius-sm);padding:0.625rem';
        var btns = U.el('div');
        btns.style.cssText = 'display:flex;gap:0.5rem';
        ['dbaas', 'iaas'].forEach(function (v) {
          var btn = U.el(
            'button',
            'chip-option',
            esc(v === 'dbaas' ? 'Managed (DBaaS)' : 'It’s on you (IaaS)'),
          );
          btn.type = 'button';
          btn.style.cssText = 'flex:1;min-height:44px';
          btn.setAttribute('data-testid', 'trade-' + row.id + '-' + v);
          btn.addEventListener('click', function () {
            LabStore.actions.updateEnv(function (e) {
              var tm = Object.assign({}, e.studio.tradeoffMatch);
              tm[row.id] = v;
              return Object.assign({}, e, { studio: Object.assign({}, e.studio, { tradeoffMatch: tm }) });
            });
          });
          btns.appendChild(btn);
          tradeBtns[row.id + '-' + v] = btn;
        });
        div.appendChild(btns);
        tradesWrap.appendChild(div);
      });
      mediumWrap.appendChild(mediumCards[0].el);
      mediumWrap.appendChild(cases);

      // analytics routing
      var routing = U.el('section', 'sheet-card rounded-md p-4');
      routing.setAttribute('aria-label', 'Analytics routing');
      routing.innerHTML =
        '<h3 class="inner-title">Analytics routing</h3><div style="margin-top:0.75rem;display:flex;flex-direction:column;gap:0.5rem" data-role="olap"></div>' +
        '<fieldset class="plain" style="margin-top:0.75rem"><legend>Can the cache be the system of record?</legend>' +
        '<div style="margin-top:0.5rem;display:flex;flex-wrap:wrap;gap:0.5rem" data-role="cachedur"></div></fieldset>';
      var olapWrap = routing.querySelector('[data-role="olap"]');
      var ROUTE_OPTIONS = [
        { value: 'warehouse', label: 'Move it to the data warehouse' },
        { value: 'cache', label: 'Serve it from a warm cache' },
        { value: 'replica', label: 'Throw hardware at the primary' },
        { value: 'sharding', label: 'Shard the transactional table' },
      ];
      OLAP_ROWS.forEach(function (row) {
        var div = U.el('div', 'tool-row', '<p class="mono-xs">' + esc(row.text) + '</p>');
        var sel = U.draftSelect({
          label: 'Route to',
          options: ROUTE_OPTIONS,
          testid: 'olap-' + row.id,
          onChange: function (v) {
            LabStore.actions.updateEnv(function (e) {
              var om = Object.assign({}, e.studio.olapMatch);
              om[row.id] = v;
              return Object.assign({}, e, { studio: Object.assign({}, e.studio, { olapMatch: om }) });
            });
          },
        });
        div.appendChild(sel);
        olapWrap.appendChild(div);
        olapSels[row.id] = sel;
      });
      var cacheWrap = routing.querySelector('[data-role="cachedur"]');
      [
        { v: 'no', label: 'No — a cache is a rebuildable copy' },
        { v: 'yes', label: 'Yes — provided the TTL is long enough' },
        { v: 'pitr', label: 'Yes — PITR protects caches too' },
      ].forEach(function (o) {
        var btn = U.el('button', 'chip-option', esc(o.label));
        btn.type = 'button';
        btn.setAttribute('data-testid', 'cachedur-' + o.v);
        btn.addEventListener('click', function () {
          LabStore.actions.updateEnv(function (e) {
            return Object.assign({}, e, { studio: Object.assign({}, e.studio, { cacheDurability: o.v }) });
          });
        });
        cacheWrap.appendChild(btn);
        cacheBtns[o.v] = btn;
      });
      mediumWrap.appendChild(mediumCards[1].el);
      mediumWrap.appendChild(routing);
      root.appendChild(mediumWrap);
    }

    // ---------- Hard ----------
    var hardWrap = null;
    var mstepBtns = {};
    if (mode0 === 'hard') {
      hardWrap = U.el('div');
      // specimen
      var specimen = U.el('section', 'sheet-card rounded-md p-4');
      specimen.setAttribute('aria-label', 'Specimen table');
      specimen.innerHTML =
        '<h3 class="inner-title">Specimen — legacy orders table</h3>' +
        '<div style="margin-top:0.5rem;overflow-x:auto"><table class="data-table"><thead><tr>' +
        ['ORDER_ID', 'CUSTOMER', 'ITEMS'].map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') +
        '</tr></thead><tbody>' +
        '<tr><td class="log-mono">1001</td><td class="log-mono">Ada Byron</td><td class="log-mono">2× Kettle, 1× Toaster</td></tr>' +
        '<tr><td class="log-mono">1002</td><td class="log-mono">Grace Hop</td><td class="log-mono">1× Lamp</td></tr>' +
        '<tr><td class="log-mono">1003</td><td class="log-mono">Ada Byron</td><td class="log-mono">3× Kettle</td></tr>' +
        '</tbody></table></div>' +
        '<div class="grid-2" style="margin-top:0.75rem" data-role="specsel"></div>';
      var specWrap = specimen.querySelector('[data-role="specsel"]');
      var nfSel = U.draftSelect({
        label: 'Which normal form does the ITEMS column violate?',
        options: [
          { value: '1nf', label: 'First normal form (1NF)' },
          { value: '2nf', label: 'Second normal form (2NF)' },
          { value: '3nf', label: 'Third normal form (3NF)' },
          { value: 'bcnf', label: 'Boyce–Codd (BCNF)' },
        ],
        testid: 'nf-select',
        onChange: function (v) {
          LabStore.actions.updateEnv(function (e) {
            return Object.assign({}, e, { studio: Object.assign({}, e.studio, { normalForm: v }) });
          });
        },
      });
      var decompSel = U.draftSelect({
        label: 'Correct decomposition',
        options: [
          { value: 'orderitems', label: 'Orders + Order_items, row per line' },
          { value: 'addcols', label: 'Add more ITEMS_2 and ITEMS_3 columns' },
          { value: 'jsonstring', label: 'Concatenate ITEMS into one JSON string' },
          { value: 'widetable', label: 'Build one wide table per product type' },
        ],
        testid: 'decomp-select',
        onChange: function (v) {
          LabStore.actions.updateEnv(function (e) {
            return Object.assign({}, e, { studio: Object.assign({}, e.studio, { decomposition: v }) });
          });
        },
      });
      specWrap.appendChild(nfSel);
      specWrap.appendChild(decompSel);
      hardWrap.appendChild(hardCards[0].el);
      hardWrap.appendChild(specimen);

      // migration board
      var migration = U.el('section', 'sheet-card rounded-md p-4');
      migration.setAttribute('aria-label', 'Migration board');
      migration.innerHTML =
        '<h3 class="inner-title">Migration board</h3>' +
        '<div class="grid-2" style="margin-top:0.75rem" data-role="moves"></div>' +
        '<p class="body-sm" style="margin-top:1rem;font-weight:600;color:var(--ink)">Runbook — click the five steps in the correct order:</p>' +
        '<ol class="runbook-list" aria-label="Current runbook order" data-role="runbook"></ol>' +
        '<div style="margin-top:0.5rem;display:flex;flex-wrap:wrap;gap:0.5rem" data-role="candidates"></div>' +
        '<p class="continue-hint" data-role="continue" style="display:none">' +
        icon('ArrowDown', '', null) +
        ' continue the sequence</p>';
      var movesWrap = migration.querySelector('[data-role="moves"]');
      function moveBox(title, sub, testid, path) {
        var box = U.el('div');
        box.style.cssText = 'border:1px solid var(--line);border-radius:var(--radius-sm);padding:0.75rem';
        box.innerHTML =
          '<p class="body-sm" style="font-weight:700;color:var(--ink)">' +
          esc(title) +
          '</p><p class="body-xs" style="margin-top:0.125rem">' +
          esc(sub) +
          '</p>';
        var holder = U.el('div');
        holder.style.marginTop = '0.5rem';
        var sel = U.draftSelect({
          label: 'Migration type',
          options: [
            { value: 'homogeneous', label: 'Homogeneous' },
            { value: 'heterogeneous', label: 'Heterogeneous' },
          ],
          testid: testid,
          onChange: function (v) {
            LabStore.actions.updateEnv(function (e) {
              var mt = Object.assign({}, e.studio.migrationTypes);
              mt[path] = v;
              return Object.assign({}, e, { studio: Object.assign({}, e.studio, { migrationTypes: mt }) });
            });
          },
        });
        holder.appendChild(sel);
        box.appendChild(holder);
        movesWrap.appendChild(box);
        return sel;
      }
      var oracleSel = moveBox('Move 1: Oracle ERP → managed PostgreSQL', 'Different engine on the other side.', 'mig-oracle', 'oracle');
      var pgSel = moveBox('Move 2: PostgreSQL on VMs → managed PostgreSQL', 'Same engine family on both sides.', 'mig-pg', 'pg');
      hardWrap.appendChild(hardCards[1].el);
      hardWrap.appendChild(migration);
      root.appendChild(hardWrap);
    }

    root.appendChild(U.nextSheetButton('signoff', 'Final sheet: Q-900 Sign-off'));

    // dynamic regions (queried after root is in the DOM tree of the caller)
    var runbookEl = mode0 === 'hard' ? root.querySelector('[data-role="runbook"]') : null;
    var candidatesEl = mode0 === 'hard' ? root.querySelector('[data-role="candidates"]') : null;
    var continueEl = mode0 === 'hard' ? root.querySelector('[data-role="continue"]') : null;
    var mstepResetBtn = null;

    function renderRunbook(state) {
      var steps = state.env.studio.migrationSteps;
      var done = steps.length >= MIGRATION_STEPS.length;
      runbookEl.innerHTML = steps
        .map(function (id, i) {
          var step = null;
          MIGRATION_STEPS.forEach(function (s) {
            if (s.id === id) step = s;
          });
          return (
            '<li class="runbook-step"><span class="runbook-num">' +
            (i + 1) +
            '</span><span class="runbook-label">' +
            esc(step.label) +
            '</span></li>'
          );
        })
        .join('');
      candidatesEl.innerHTML = '';
      mstepResetBtn = null;
      if (!done) {
        var shuffled = seededShuffle(MIGRATION_STEPS, shuffleSeed);
        shuffled.forEach(function (s) {
          if (steps.indexOf(s.id) !== -1) return;
          var btn = U.el('button', 'mstep-candidate', esc(s.label));
          btn.type = 'button';
          btn.setAttribute('data-testid', 'mstep-' + s.id);
          btn.addEventListener('click', function () {
            LabStore.actions.updateEnv(function (e) {
              return Object.assign({}, e, {
                studio: Object.assign({}, e.studio, {
                  migrationSteps: e.studio.migrationSteps.concat([s.id]),
                }),
              });
            });
          });
          candidatesEl.appendChild(btn);
          mstepBtns[s.id] = btn;
        });
      } else {
        mstepResetBtn = U.el('button', 'mstep-reset', 'Clear runbook and re-order');
        mstepResetBtn.type = 'button';
        mstepResetBtn.setAttribute('data-testid', 'mstep-reset');
        mstepResetBtn.addEventListener('click', function () {
          LabStore.actions.updateEnv(function (e) {
            return Object.assign({}, e, {
              studio: Object.assign({}, e.studio, { migrationSteps: [] }),
            });
          });
          shuffleSeed = pickSeed(shuffleSeed + 1);
          renderRunbook(LabStore.getState());
        });
        candidatesEl.appendChild(mstepResetBtn);
      }
      continueEl.style.display =
        steps.length > 0 && steps.length < MIGRATION_STEPS.length ? '' : 'none';
    }

    function update(state) {
      var st = state.env.studio;
      if (state.mode === 'medium') {
        mediumCards[0].update(state);
        mediumCards[1].update(state);
        ['casea', 'caseb'].forEach(function (prefix) {
          ['dbaas', 'iaas'].forEach(function (v) {
            var key = prefix === 'casea' ? 'caseA' : 'caseB';
            var on = st.serviceModel[key] === v;
            var btn = caseBtns[prefix + '-' + v];
            btn.setAttribute('aria-pressed', String(on));
            btn.className = 'chip-option' + (on ? ' on-wax' : '');
          });
        });
        TRADEOFF_ROWS.forEach(function (row) {
          ['dbaas', 'iaas'].forEach(function (v) {
            var on = st.tradeoffMatch[row.id] === v;
            var btn = tradeBtns[row.id + '-' + v];
            btn.setAttribute('aria-pressed', String(on));
            btn.className = 'chip-option' + (on ? ' on-wax' : '');
          });
        });
        olapSels.monthend.update(st.olapMatch.monthend || '');
        olapSels.repeat.update(st.olapMatch.repeat || '');
        Object.keys(cacheBtns).forEach(function (v) {
          var on = st.cacheDurability === v;
          cacheBtns[v].setAttribute('aria-pressed', String(on));
          cacheBtns[v].className = 'chip-option' + (on ? ' on-wax' : '');
        });
      } else {
        hardCards[0].update(state);
        hardCards[1].update(state);
        nfSel.update(st.normalForm);
        decompSel.update(st.decomposition);
        oracleSel.update(st.migrationTypes.oracle);
        pgSel.update(st.migrationTypes.pg);
        renderRunbook(state);
      }
    }
    update(store());
    return { el: root, update: update };
  }

  return {
    OpsSheet: OpsSheet,
    ResilienceSheet: ResilienceSheet,
    SecuritySheet: SecuritySheet,
    StudioSheet: StudioSheet,
  };
})();
