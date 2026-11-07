// ---------------------------------------------------------------------------
// sheets-a.js — drawing sheets A-000 → X-400.
// 1:1 vanilla ports of BriefingSheet, CoreSheet, MatcherSheet, SandboxSheet
// and ScaleSheet (src/components/lab/sheets/…). Each factory returns
// { el, update(state) } — the DOM is built once per sheet activation and
// patched on store changes, mirroring the React render output exactly.
// ---------------------------------------------------------------------------

// eslint-disable-next-line no-undef
var SheetsA = (function () {
  'use strict';

  var U = LabUI;
  var icon = U.icon;
  var esc = U.esc;

  function store() {
    return LabStore.getState();
  }

  // ======================================================================
  // A-000 Briefing
  // ======================================================================
  function BriefingSheet() {
    var root = U.el('article');

    function reviewLi3(mode) {
      return mode === 'medium'
        ? 'Medium mode: hints (up to three tiers) are one click away and lower your rating only slightly. A “where to look” chip tells you which sheet hosts each item.'
        : 'Hard mode: evidence is noisy, validation is strict, near-misses are rejected with reasons, and your single nudge per item costs rating. Efficiency and accuracy drive the score.';
    }

    root.innerHTML =
      U.sheetIntro(
        'A-000',
        'Scenario briefing — the Meridian design review',
        '<p>A fictional but realistic setting, prepared for exam practice. Everything you will read — the company, the metrics, the logs — is synthetic training data.</p>',
      ) +
      '<div class="grid-3">' +
      '<section class="sheet-card rounded-md p-4">' +
      icon('Landmark', 'briefing-icon') +
      '<h3 class="inner-title" style="margin-top:0.5rem">The client</h3>' +
      '<p class="body-sm" style="margin-top:0.375rem"><strong class="ink-strong">Meridian Retail Group</strong> runs 212 stores and a fast-growing web shop. Its databases still live on two ageing virtual machines. The board has approved a move to the cloud — but only for a design that survives scrutiny.</p>' +
      '</section>' +
      '<section class="sheet-card rounded-md p-4">' +
      icon('ClipboardList', 'briefing-icon') +
      '<h3 class="inner-title" style="margin-top:0.5rem">Your role</h3>' +
      '<p class="body-sm" style="margin-top:0.375rem">You are the junior cloud architect on the design review. The lead architect has left you the drawing set: ten sheets covering every database decision in <strong class="ink-strong">CompTIA Cloud+ CV0-004 Objective 1.6</strong> — “exploring database concepts and their cloud applications”.</p>' +
      '</section>' +
      '<section class="sheet-card rounded-md p-4">' +
      icon('Factory', 'briefing-icon') +
      '<h3 class="inner-title" style="margin-top:0.5rem">The stakes</h3>' +
      '<p class="body-sm" style="margin-top:0.375rem">The database is usually the most expensive component of an architecture and the one least able to scale horizontally. Wrong store choices, wrong replication patterns and untested backups are where outages — and exam questions — live.</p>' +
      '</section>' +
      '</div>' +
      '<section class="sheet-card rounded-md p-4" style="margin-top:1rem">' +
      '<h3 class="inner-title">How the review works</h3>' +
      '<ol style="margin-top:0.5rem;padding-left:1.25rem;list-style:decimal" class="body-sm">' +
      '<li style="margin-top:0.375rem">Work through the drawing set: each sheet contains review items tied to objective details. Complete the work the item asks for, then press <em>“Submit for review”</em>.</li>' +
      '<li style="margin-top:0.375rem">The review stamps each item <strong style="color:var(--verified)">APPROVED</strong> or <strong style="color:var(--wax)">REVISE</strong> — with an explanation either way, because the explanation is the lesson.</li>' +
      '<li style="margin-top:0.375rem" data-role="mode-li"></li>' +
      '<li style="margin-top:0.375rem">Close the review at <span class="log-mono">Q-900 Sign-off</span>: knowledge check, field notes, and — when everything is stamped — the completion rating.</li>' +
      '</ol>' +
      '<p class="body-xs" style="margin-top:0.75rem">Certification relevance: Domain 1.0 “Cloud Architecture” carries 23% of CV0-004, and the decision rules practiced here reappear in Domains 3 (Operations), 4 (Security) and 6 (Troubleshooting). <a class="threat-link" href="' +
      esc(COMPTIA_REF.url) +
      '" target="_blank" rel="noopener noreferrer">Official exam objectives ↗</a></p>' +
      '</section>' +
      '<section class="inline-alert" style="margin-top:1rem">' +
      icon('ShieldAlert') +
      '<p>Safety note: this lab is defensive and educational. All trade-craft discussion stays at the depth needed to recognise and mitigate problems; every artefact is simulated and labelled.</p>' +
      '</section>';

    root.appendChild(U.nextSheetButton('core', 'Next sheet: K-100 Knowledge Core'));

    var modeLi = root.querySelector('[data-role="mode-li"]');

    function update(state) {
      modeLi.textContent = reviewLi3(state.mode);
    }
    update(store());
    return { el: root, update: update };
  }

  // ======================================================================
  // K-100 Knowledge Core (+ OBJ-M1 property bench, OBJ-M2 ACID bench)
  // ======================================================================
  function CoreSheet() {
    var root = U.el('article');
    var m1 = U.reviewItemCard('OBJ-M1');
    var m2 = U.reviewItemCard('OBJ-M2');
    // -- property sorting bench --
    var bench = U.el('section', 'sheet-card rounded-md p-4');
    bench.setAttribute('aria-label', 'Property sorting bench');
    bench.innerHTML =
      '<p class="body-sm" style="font-weight:600;color:var(--ink)">Property notes bench — tap a column for each note (tap again to unassign):</p><ul style="margin-top:0.75rem" class="bench-list"></ul>';
    var benchList = bench.querySelector('.bench-list');
    var chipButtons = {};
    PROPERTY_CHIPS.forEach(function (chip) {
      var li = U.el(
        'li',
        'bench-row',
        '<span class="bench-row-label">' +
          esc(chip.label) +
          '</span><div class="bench-row-actions">' +
          '<button type="button" class="chip-option" data-testid="chip-' +
          chip.id +
          '-sql">Relational</button>' +
          '<button type="button" class="chip-option" data-testid="chip-' +
          chip.id +
          '-nosql">Non-relational</button>' +
          '</div>',
      );
      var sqlBtn = li.querySelector('[data-testid="chip-' + chip.id + '-sql"]');
      var nosqlBtn = li.querySelector('[data-testid="chip-' + chip.id + '-nosql"]');
      function setSort(col) {
        LabStore.actions.updateEnv(function (e) {
          var next = Object.assign({}, e.core.propertySort);
          if (next[chip.id] === col) delete next[chip.id];
          else next[chip.id] = col;
          return Object.assign({}, e, { core: Object.assign({}, e.core, { propertySort: next }) });
        });
      }
      sqlBtn.addEventListener('click', function () {
        setSort('sql');
      });
      nosqlBtn.addEventListener('click', function () {
        setSort('nosql');
      });
      chipButtons[chip.id] = { sql: sqlBtn, nosql: nosqlBtn };
      benchList.appendChild(li);
    });

    // -- ACID bench --
    var acidBench = U.el('section', 'sheet-card rounded-md p-4');
    acidBench.setAttribute('aria-label', 'ACID bench');
    acidBench.innerHTML =
      '<p class="body-sm" style="font-weight:600;color:var(--ink)">ACID bench — a $100 transfer between account A and account B. Toggle the guardrails, then inject the crash.</p>' +
      '<div class="grid-2" style="margin-top:0.75rem" data-role="acid-cards"></div>' +
      '<div style="margin-top:0.75rem;display:flex;flex-wrap:wrap;align-items:center;gap:0.5rem">' +
      '<button type="button" class="btn btn-sm btn-default" data-testid="acid-crash">' +
      icon('Play') +
      ' Run crash test</button>' +
      '<button type="button" class="btn btn-sm btn-outline" data-role="acid-reset">' +
      icon('RotateCcw') +
      ' Reset bench</button>' +
      '</div>' +
      '<div data-role="crash"></div>' +
      '<fieldset class="plain" style="margin-top:1rem"><legend>Bench question: which property prevented a half-applied transfer?</legend>' +
      '<div class="grid-4-md" style="margin-top:0.5rem" data-role="acid-answers"></div></fieldset>';

    var acidCards = acidBench.querySelector('[data-role="acid-cards"]');
    var crashBox = acidBench.querySelector('[data-role="crash"]');
    var answerWrap = acidBench.querySelector('[data-role="acid-answers"]');
    var acidBtns = {};
    ACID_PROPS.forEach(function (p) {
      var btn = U.el('button', 'acid-card');
      btn.type = 'button';
      btn.setAttribute('role', 'switch');
      btn.setAttribute('data-testid', 'acid-' + p.id);
      btn.addEventListener('click', function () {
        LabStore.actions.updateEnv(function (e) {
          var acid = Object.assign({}, e.core.acid);
          acid[p.id] = !acid[p.id];
          return Object.assign({}, e, { core: Object.assign({}, e.core, { acid: acid }) });
        });
      });
      acidCards.appendChild(btn);
      acidBtns[p.id] = btn;
    });
    ACID_PROPS.forEach(function (p) {
      var btn = U.el(
        'button',
        'chip-option',
        esc(p.label),
      );
      btn.type = 'button';
      btn.setAttribute('data-testid', 'acid-answer-' + p.id);
      btn.addEventListener('click', function () {
        LabStore.actions.updateEnv(function (e) {
          return Object.assign({}, e, { core: Object.assign({}, e.core, { acidAnswer: p.id }) });
        });
      });
      answerWrap.appendChild(btn);
      acidBtns['answer-' + p.id] = btn;
    });
    acidBench.querySelector('[data-role="acid-reset"]').addEventListener('click', function () {
      LabStore.actions.updateEnv(function (e) {
        return Object.assign({}, e, { core: Object.assign({}, e.core, { acidCrashTestRun: false }) });
      });
    });
    acidBench.querySelector('[data-testid="acid-crash"]').addEventListener('click', function () {
      LabStore.actions.updateEnv(function (e) {
        return Object.assign({}, e, { core: Object.assign({}, e.core, { acidCrashTestRun: true }) });
      });
    });

    root.innerHTML =
      U.sheetIntro(
        'K-100',
        'Knowledge core — how the stores work and why',
        '<p>The explainer behind every decision you will draft. Read it once; return whenever a review item refers back. Terms are in the margin glossary.</p>',
      ) +
      '<div class="grid-2">' +
      '<section class="sheet-card rounded-md p-4"><h3 class="inner-title">Relational stores &amp; ACID</h3><p class="body-sm" style="margin-top:0.375rem">Tables with a <strong class="ink-strong">fixed schema</strong>, relationships and constraints, queried with SQL. Their defining property is <strong class="ink-strong">ACID</strong> transactions: a transaction <em>fully happens or does not</em>, and concurrent transactions do not corrupt each other. Choose relational when data is structured and interrelated, correctness under concurrency matters, and queries are varied and not known in advance — financial records, orders, inventory.</p></section>' +
      '<section class="sheet-card rounded-md p-4"><h3 class="inner-title">The NoSQL family — four shapes</h3><ul class="stack-list"><li><strong class="ink-strong">Key-value</strong> — a dictionary at scale; fast lookups by key, no querying by value. Sessions, caches, profiles.</li><li><strong class="ink-strong">Document</strong> — self-contained JSON records with flexible schema, queryable by fields. Catalogues, content, events.</li><li><strong class="ink-strong">Wide-column</strong> — sparse, dynamic columns; huge write volumes. Time series and telemetry.</li><li><strong class="ink-strong">Graph</strong> — nodes and edges, built for traversing relationships. Social graphs, fraud detection, recommendations.</li></ul></section>' +
      '<section class="sheet-card rounded-md p-4"><h3 class="inner-title">CAP &amp; BASE</h3><p class="body-sm" style="margin-top:0.375rem">When a network partition occurs, a distributed store must choose <strong class="ink-strong">consistency or availability</strong> — not both. BASE (Basically Available, Soft state, Eventually consistent) is the practical face of choosing availability, which is why many non-relational stores are eventually consistent. The exam rewards one decision rule: <strong class="ink-strong">choose by access pattern</strong> — “must never show a stale balance” has already told you the answer; “the team prefers document databases” is not a reason.</p></section>' +
      '<section class="sheet-card rounded-md p-4"><h3 class="inner-title">Three replication patterns, three costs</h3><ul class="stack-list"><li><strong class="ink-strong">Read replica</strong> = read scaling with <em>replication lag</em> — a write-then-read against a replica can miss. Route must-be-current reads to the primary.</li><li><strong class="ink-strong">Synchronous standby (multi-AZ)</strong> = availability. Serves no traffic; costs write latency. High-availability requirement → this.</li><li><strong class="ink-strong">Multi-primary</strong> = write availability and locality; costs <em>write conflicts</em>. Right for globally distributed writes, usually wrong for transactional apps.</li></ul></section>' +
      '<section class="sheet-card rounded-md p-4"><h3 class="inner-title">Managed DBaaS: the responsibility line</h3><p class="body-sm" style="margin-top:0.375rem">The provider takes <strong class="ink-strong">install/patching, automated backups + PITR within the retention window, replication/failover, monitoring, scaling ops</strong>. You keep <strong class="ink-strong">schema &amp; query design (including indexing), the data itself, access control and the network path, encryption choices, capacity &amp; cost</strong>, and any backup beyond the retention window or outside the account. Trade-offs: restricted superuser, a maintenance window you configure but do not control, and provider lock-in. Need engine control? Self-managed on IaaS — and you take back patching, backup, replication and failover.</p></section>' +
      '<section class="sheet-card rounded-md p-4"><h3 class="inner-title">Backups, PITR, warehouse, cache</h3><ul style="margin-top:0.375rem" class="takeaways"><li>Retention windows are finite — take your own snapshots for longer.</li><li>Restores create a <strong class="ink-strong">new instance</strong>: repoint the app; restore time is real — measure it.</li><li>Deleting the instance can delete its automated backups; manual snapshots usually survive.</li><li>Backups default to the same account/region — the cloud version of storing tapes next to the server.</li><li><strong class="ink-strong">Warehouse</strong> = OLAP (columnar, compressed, parallel). <strong class="ink-strong">Cache</strong> = speed, not durability — invalidation is the hard part, cold start hurts, never a system of record.</li></ul></section>' +
      '</div>';

    root.appendChild(m1.el);
    root.appendChild(bench);
    root.appendChild(m2.el);
    root.appendChild(acidBench);
    root.appendChild(U.nextSheetButton('matcher', 'Next sheet: W-200 Workload Matcher'));

    function update(state) {
      m1.update(state);
      m2.update(state);
      var env = state.env;
      // property chips
      PROPERTY_CHIPS.forEach(function (chip) {
        var cur = env.core.propertySort[chip.id];
        ['sql', 'nosql'].forEach(function (col) {
          var btn = chipButtons[chip.id][col];
          btn.setAttribute('aria-pressed', String(cur === col));
          btn.className = 'chip-option' + (cur === col ? (col === 'sql' ? ' on-verified' : ' on-wax') : '');
        });
      });
      // acid guardrail cards
      ACID_PROPS.forEach(function (p) {
        var on = env.core.acid[p.id];
        var btn = acidBtns[p.id];
        btn.setAttribute('aria-checked', String(on));
        btn.className = 'acid-card ' + (on ? 'on' : 'off');
        btn.innerHTML =
          '<span style="display:flex;align-items:center;justify-content:space-between">' +
          '<span class="acid-card-name">' +
          esc(p.label) +
          '</span>' +
          '<span class="acid-card-state ' +
          (on ? 'on' : 'off') +
          '">' +
          (on ? 'ON' : 'OFF') +
          '</span></span>' +
          '<span class="acid-card-desc">' +
          esc(on ? p.on : p.off) +
          '</span>';
      });
      // crash outcome
      var acid = env.core.acid;
      var allOn = acid.atomicity && acid.consistency && acid.isolation && acid.durability;
      var firstOff = null;
      for (var i = 0; i < ACID_PROPS.length; i++) {
        if (!acid[ACID_PROPS[i].id]) {
          firstOff = ACID_PROPS[i];
          break;
        }
      }
      if (!env.core.acidCrashTestRun) {
        crashBox.innerHTML = '';
      } else if (allOn) {
        crashBox.innerHTML =
          '<div class="logbox ok" aria-live="polite" style="margin-top:0.75rem">CRASH INJECTED at t=49ms → transaction ROLLED BACK CLEANLY. Both accounts untouched. The bench certifies this transfer.</div>';
      } else {
        crashBox.innerHTML =
          '<div class="logbox bad" aria-live="polite" style="margin-top:0.75rem">' +
          icon('AlertTriangle', '', null) +
          ' CRASH INJECTED at t=49ms → ' +
          esc(firstOff ? firstOff.off : '') +
          ' The bench rejects this configuration.</div>';
      }
      // bench answer
      ACID_PROPS.forEach(function (p) {
        var chosen = env.core.acidAnswer === p.id;
        var btn = acidBtns['answer-' + p.id];
        btn.setAttribute('aria-pressed', String(chosen));
        btn.className = 'chip-option' + (chosen ? ' on-wax' : '');
      });
    }
    update(store());
    return { el: root, update: update };
  }

  // ======================================================================
  // W-200 Workload Matcher (OBJ-M3/M4 or OBJ-H1)
  // ======================================================================
  function MatcherSheet() {
    var root = U.el('article');
    var items = U.reviewItemsFor('matcher');

    var selects = {};
    root.innerHTML = U.sheetIntro(
      'W-200',
      'Workload matcher — choose by access pattern',
      '<p>Six workload briefs from the Meridian estate. The exam rewards one decision rule: <strong>choose by access pattern</strong>. What are the queries? Known in advance? Highly interrelated? Does a stale read cause harm? Team preference is not a reason.</p>',
    );
    root.appendChild(items.el);
    var grid = U.el('div', 'grid-2');
    grid.style.marginTop = '1rem';
    WORKLOADS.forEach(function (w) {
      var card = U.el(
        'section',
        'workload-card',
        '<div class="workload-head"><h3 class="workload-name">' +
          esc(w.name) +
          '</h3><span class="workload-code">' +
          esc(w.code) +
          '</span></div>' +
          '<p class="workload-brief">' +
          esc(w.brief) +
          '</p>' +
          '<ul class="signal-list">' +
          w.signals
            .map(function (s) {
              return '<li class="signal-chip">' + esc(s) + '</li>';
            })
            .join('') +
          '</ul>' +
          '<div class="grid-2-sm" style="margin-top:0.75rem" data-role="selects"></div>',
      );
      card.setAttribute('aria-label', 'Workload ' + w.code + ' ' + w.name);
      card.setAttribute('data-testid', 'workload-' + w.id);
      var selectsWrap = card.querySelector('[data-role="selects"]');
      var archSel = U.draftSelect({
        label: 'Store shape',
        options: ARCHETYPE_OPTIONS,
        testid: 'arch-' + w.id,
        onChange: function (v) {
          LabStore.actions.updateEnv(function (e) {
            var base = e.matcher[w.id] || {};
            var assign = Object.assign({}, base, { archetype: v });
            var matcher = Object.assign({}, e.matcher);
            matcher[w.id] = assign;
            return Object.assign({}, e, { matcher: matcher });
          });
        },
      });
      selectsWrap.appendChild(archSel);
      var consSel = U.draftSelect({
        label: 'Consistency mode',
        options: CONSISTENCY_OPTIONS,
        testid: 'cons-' + w.id,
        onChange: function (v) {
          LabStore.actions.updateEnv(function (e) {
            var base = e.matcher[w.id] || {};
            var assign = Object.assign({}, base, { consistency: v });
            var matcher = Object.assign({}, e.matcher);
            matcher[w.id] = assign;
            return Object.assign({}, e, { matcher: matcher });
          });
        },
      });
      selectsWrap.appendChild(consSel);
      // The consistency select only exists in Hard mode.
      if (store().mode !== 'hard') consSel.style.display = 'none';
      selects[w.id] = { arch: archSel, cons: consSel };
      grid.appendChild(card);
    });
    root.appendChild(grid);
    root.appendChild(U.nextSheetButton('sandbox', 'Next sheet: S-300 Consistency Sandbox'));

    function update(state) {
      items.update(state);
      WORKLOADS.forEach(function (w) {
        var a = state.env.matcher[w.id] || {};
        selects[w.id].arch.update(a.archetype || '');
        // The consistency select only exists in Hard mode.
        selects[w.id].cons.style.display = state.mode === 'hard' ? '' : 'none';
        selects[w.id].cons.update(a.consistency || '');
      });
    }
    update(store());
    return { el: root, update: update };
  }

  // ======================================================================
  // S-300 Consistency Sandbox (OBJ-M5/M6 or OBJ-H2)
  // ======================================================================
  var BASE_OPTIONS = [
    { value: 'bass', label: 'Basically Available, Soft state, Eventually consistent' },
    { value: 'b1', label: 'Backups Automated, Snapshots Encrypted, Store-native' },
    { value: 'b2', label: 'Blocked And Serialized Until Settled' },
    { value: 'b3', label: 'B-tree Adaptive Storage System' },
  ];
  var CONFLICT_OPTIONS = [
    { value: 'multi-primary', label: 'Multi-primary (active-active) writes' },
    { value: 'standby', label: 'Synchronous multi-AZ standby (failover)' },
    { value: 'replicas', label: 'Read replicas serving read traffic' },
    { value: 'sharding', label: 'Sharding across four nodes' },
  ];
  var READS_OPTIONS = [
    { value: 'primary', label: 'Route them to the primary' },
    { value: 'replica', label: 'Any replica — they are in sync' },
    { value: 'cache', label: 'The cache — fastest answer' },
    { value: 'either', label: 'Either — all copies are current' },
  ];
  var LOST_OPTIONS = [
    { value: 'recent-writes', label: 'Recent writes not yet replicated' },
    { value: 'none', label: 'No committed data can be lost' },
    { value: 'all', label: 'All data, committed and in flight' },
    { value: 'indexes', label: 'Only indexes — the data survives' },
  ];

  function topoNode(name, role, opts) {
    opts = opts || {};
    return (
      '<div class="topo-node' +
      (opts.primary ? ' primary' : '') +
      (opts.partitioned ? ' partitioned' : '') +
      '"' +
      (opts.key ? ' data-role="' + opts.key + '"' : '') +
      '>' +
      (opts.partitioned ? '<span class="topo-partitioned-flag">PARTITIONED</span>' : '') +
      '<p class="topo-name">' +
      esc(name) +
      '</p><p class="topo-role" data-role="role">' +
      esc(role) +
      '</p></div>'
    );
  }

  function SandboxSheet() {
    var root = U.el('article');
    var sbSel = {};
    var policyBtns = {};

    root.innerHTML =
      U.sheetIntro(
        'S-300',
        'Consistency sandbox — CAP under your fingers',
        '<p>A three-node Meridian cluster: the primary in AZ-A, copies in AZ-B and AZ-C. Cut the network, choose postures, and watch each guarantee answer for itself.</p>',
      ) +
      '<section class="sheet-card rounded-md p-4" aria-label="Cluster topology">' +
      '<div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:0.75rem">' +
      '<h3 class="inner-title">Topology — orders estate cluster</h3>' +
      '<button type="button" class="btn btn-sm btn-outline" data-testid="partition-toggle" aria-pressed="false"></button>' +
      '</div>' +
      '<div class="topo-grid" style="margin-top:1rem" data-role="nodes"></div>' +
      '<div class="logbox neutral" aria-live="polite" style="margin-top:0.75rem" data-role="write-outcome"></div>' +
      '<div class="grid-2-sm" style="margin-top:1rem;gap:1rem">' +
      '<div>' +
      '<label for="rf" class="step-label">Replication factor: <span class="log-mono" style="color:var(--wax)" data-role="rf-val">2</span></label>' +
      '<input id="rf" data-testid="rf-slider" class="range-slider" type="range" min="1" max="5" step="1" value="2" aria-valuetext="2 copies" />' +
      '<p class="section-note">1 = primary only. Each extra copy survives one more failure — and costs write latency when synchronous.</p>' +
      '</div>' +
      '<fieldset class="plain legend-xs"><legend>Write propagation</legend>' +
      '<div style="margin-top:0.5rem;display:flex;gap:0.5rem">' +
      '<button type="button" class="chip-option" data-testid="writemode-quorum-sync" style="flex:1">Quorum-synchronous</button>' +
      '<button type="button" class="chip-option" data-testid="writemode-async" style="flex:1">Asynchronous</button>' +
      '</div></fieldset>' +
      '</div>' +
      '</section>';

    var nodesWrap = root.querySelector('[data-role="nodes"]');
    var partitionBtn = root.querySelector('[data-testid="partition-toggle"]');
    var writeOutcome = root.querySelector('[data-role="write-outcome"]');
    var rfVal = root.querySelector('[data-role="rf-val"]');
    var rfSlider = root.querySelector('[data-testid="rf-slider"]');
    var wmSync = root.querySelector('[data-testid="writemode-quorum-sync"]');
    var wmAsync = root.querySelector('[data-testid="writemode-async"]');

    partitionBtn.addEventListener('click', function () {
      var e = store().env;
      LabStore.actions.updateEnv(function (e2) {
        return Object.assign({}, e2, { sandbox: Object.assign({}, e2.sandbox, { partition: !e2.sandbox.partition }) });
      });
    });
    rfSlider.addEventListener('input', function () {
      var v = Number(rfSlider.value);
      LabStore.actions.updateEnv(function (e) {
        return Object.assign({}, e, { sandbox: Object.assign({}, e.sandbox, { replicationFactor: v }) });
      });
    });
    wmSync.addEventListener('click', function () {
      LabStore.actions.updateEnv(function (e) {
        return Object.assign({}, e, { sandbox: Object.assign({}, e.sandbox, { writeMode: 'quorum-sync' }) });
      });
    });
    wmAsync.addEventListener('click', function () {
      LabStore.actions.updateEnv(function (e) {
        return Object.assign({}, e, { sandbox: Object.assign({}, e.sandbox, { writeMode: 'async' }) });
      });
    });

    // Mode-dependent review items + interactive panels.
    var state0 = store();
    var mediumWrap = U.el('div');
    var hardWrap = U.el('div');

    if (state0.mode === 'medium') {
      var m5 = U.reviewItemCard('OBJ-M5');
      var capPanel = U.el('section', 'sheet-card rounded-md p-4');
      capPanel.setAttribute('aria-label', 'CAP posture per service');
      capPanel.innerHTML =
        '<p class="body-sm" style="font-weight:600;color:var(--ink)">Partition drill — choose each service’s posture during the partition:</p><div class="grid-2" style="margin-top:0.75rem" data-role="services"></div>';
      var servicesWrap = capPanel.querySelector('[data-role="services"]');
      var SERVICES = [
        { key: 'checkout', name: 'Checkout ledger', hint: 'Two conflicting balances is an incident; a paused write is a wait.' },
        { key: 'recs', name: 'Recommendations feed', hint: 'A slightly stale “you may also like” is invisible to customers.' },
      ];
      var outcomeEls = {};
      SERVICES.forEach(function (s) {
        var wrapper = U.el('div');
        wrapper.style.border = '1px solid var(--line)';
        wrapper.style.borderRadius = 'var(--radius-sm)';
        wrapper.style.padding = '0.75rem';
        wrapper.innerHTML =
          '<p class="inner-title-sm">' +
          esc(s.name) +
          '</p><p class="body-xs" style="font-style:italic">' +
          esc(s.hint) +
          '</p><div style="margin-top:0.5rem;display:flex;gap:0.5rem">' +
          '<button type="button" class="chip-option" data-testid="policy-' +
          s.key +
          '-consistency" style="flex:1">Stay consistent (CP)</button>' +
          '<button type="button" class="chip-option" data-testid="policy-' +
          s.key +
          '-availability" style="flex:1">Stay available (AP)</button>' +
          '</div><p aria-live="polite" class="mono-xs" style="margin-top:0.5rem" data-role="poutcome"></p>';
        ['consistency', 'availability'].forEach(function (v) {
          var btn = wrapper.querySelector('[data-testid="policy-' + s.key + '-' + v + '"]');
          btn.addEventListener('click', function () {
            LabStore.actions.updateEnv(function (e) {
              var sp = Object.assign({}, e.sandbox.servicePolicy);
              sp[s.key] = v;
              return Object.assign({}, e, { sandbox: Object.assign({}, e.sandbox, { servicePolicy: sp }) });
            });
          });
          policyBtns[s.key + '-' + v] = btn;
        });
        outcomeEls[s.key] = wrapper.querySelector('[data-role="poutcome"]');
        servicesWrap.appendChild(wrapper);
      });
      var m6 = U.reviewItemCard('OBJ-M6');
      var consPanel = U.el('section', 'sheet-card rounded-md p-4');
      consPanel.setAttribute('aria-label', 'Consistency modes and BASE');
      consPanel.innerHTML =
        '<p class="body-sm" style="font-weight:600;color:var(--ink)">Consistency modes — per service, per requirement:</p>' +
        '<div class="grid-2-sm" style="margin-top:0.75rem;gap:0.75rem">' +
        '<div style="border:1px solid var(--line);border-radius:var(--radius-sm);padding:0.75rem"><p class="body-sm" style="font-weight:700;color:var(--ink)">Billing service</p><p class="body-xs">“Must never show a stale amount.”</p><div style="margin-top:0.5rem" data-role="cons-billing"></div></div>' +
        '<div style="border:1px solid var(--line);border-radius:var(--radius-sm);padding:0.75rem"><p class="body-sm" style="font-weight:700;color:var(--ink)">Price watchlist</p><p class="body-xs">“Seconds of convergence are fine.”</p><div style="margin-top:0.5rem" data-role="cons-watchlist"></div></div>' +
        '</div>' +
        '<fieldset class="plain" style="margin-top:1rem"><legend>Expand BASE correctly:</legend><div style="margin-top:0.5rem;display:grid;gap:0.5rem" data-role="base"></div></fieldset>';
      var billingSel = U.draftSelect({
        label: 'Required consistency',
        options: CONSISTENCY_OPTIONS,
        testid: 'cons-billing',
        onChange: function (v) {
          LabStore.actions.updateEnv(function (e) {
            var cm = Object.assign({}, e.sandbox.consistencyMode, { billing: v });
            return Object.assign({}, e, { sandbox: Object.assign({}, e.sandbox, { consistencyMode: cm }) });
          });
        },
      });
      var watchSel = U.draftSelect({
        label: 'Required consistency',
        options: CONSISTENCY_OPTIONS,
        testid: 'cons-watchlist',
        onChange: function (v) {
          LabStore.actions.updateEnv(function (e) {
            var cm = Object.assign({}, e.sandbox.consistencyMode, { watchlist: v });
            return Object.assign({}, e, { sandbox: Object.assign({}, e.sandbox, { consistencyMode: cm }) });
          });
        },
      });
      consPanel.querySelector('[data-role="cons-billing"]').appendChild(billingSel);
      consPanel.querySelector('[data-role="cons-watchlist"]').appendChild(watchSel);
      var baseBtns = {};
      var baseWrap = consPanel.querySelector('[data-role="base"]');
      BASE_OPTIONS.forEach(function (o) {
        var btn = U.el('button', 'chip-option', esc(o.label));
        btn.type = 'button';
        btn.style.textAlign = 'left';
        btn.setAttribute('data-testid', 'base-' + o.value);
        btn.addEventListener('click', function () {
          LabStore.actions.updateEnv(function (e) {
            return Object.assign({}, e, { sandbox: Object.assign({}, e.sandbox, { baseAnswer: o.value }) });
          });
        });
        baseWrap.appendChild(btn);
        baseBtns[o.value] = btn;
      });
      mediumWrap.appendChild(m5.el);
      mediumWrap.appendChild(capPanel);
      mediumWrap.appendChild(m6.el);
      mediumWrap.appendChild(consPanel);
      root.appendChild(mediumWrap);
      sbSel = { billing: billingSel, watch: watchSel };
      hardWrap = null;
    } else {
      var h2 = U.reviewItemCard('OBJ-H2');
      var incident = U.el('section', 'sheet-card rounded-md p-4');
      incident.setAttribute('aria-label', 'Partition incident analysis');
      incident.innerHTML =
        '<p class="body-sm" style="font-weight:600;color:var(--ink)">Incident analysis — answer all three exactly. The panel accepts only the configuration from the review item.</p>' +
        '<div class="grid-3" style="margin-top:0.75rem">' +
        '<div style="border:1px solid var(--line);border-radius:var(--radius-sm);padding:0.75rem"><p class="body-xs" style="font-weight:700;color:var(--ink)">1 · Write conflicts are introduced by which pattern?</p><div style="margin-top:0.5rem" data-role="h-conflicts"></div></div>' +
        '<div style="border:1px solid var(--line);border-radius:var(--radius-sm);padding:0.75rem"><p class="body-xs" style="font-weight:700;color:var(--ink)">2 · Write-then-read must never miss. Route those reads to…</p><div style="margin-top:0.5rem" data-role="h-currentreads"></div></div>' +
        '<div style="border:1px solid var(--line);border-radius:var(--radius-sm);padding:0.75rem"><p class="body-xs" style="font-weight:700;color:var(--ink)">3 · With async copies, a zone failure can lose…</p><div style="margin-top:0.5rem" data-role="h-lost"></div></div>' +
        '</div>';
      function hardSel(key, opts, label, path) {
        var s = U.draftSelect({
          label: label,
          options: opts,
          testid: key,
          onChange: function (v) {
            LabStore.actions.updateEnv(function (e) {
              var ha = Object.assign({}, e.sandbox.hardAnswers);
              ha[path] = v;
              return Object.assign({}, e, { sandbox: Object.assign({}, e.sandbox, { hardAnswers: ha }) });
            });
          },
        });
        incident.querySelector('[data-role="' + key + '"]').appendChild(s);
        return s;
      }
      var selConflicts = hardSel('h-conflicts', CONFLICT_OPTIONS, 'Pattern', 'conflicts');
      var selReads = hardSel('h-currentreads', READS_OPTIONS, 'Destination', 'currentReads');
      var selLost = hardSel('h-lost', LOST_OPTIONS, 'What is lost', 'lost');
      hardWrap.appendChild(h2.el);
      hardWrap.appendChild(incident);
      root.appendChild(hardWrap);
      sbSel = { conflicts: selConflicts, reads: selReads, lost: selLost };
      mediumWrap = null;
    }

    root.appendChild(U.nextSheetButton('scale', 'Next sheet: X-400 Scale Lab'));

    function update(state) {
      var env = state.env;
      var sb = env.sandbox;
      // partition button
      partitionBtn.setAttribute('aria-pressed', String(sb.partition));
      partitionBtn.className = 'btn btn-sm ' + (sb.partition ? 'btn-destructive' : 'btn-outline');
      if (!sb.partition) {
        partitionBtn.style.borderColor = 'rgba(41,36,28,0.4)';
        partitionBtn.style.color = 'var(--ink)';
      } else {
        partitionBtn.style.borderColor = '';
        partitionBtn.style.color = '';
      }
      partitionBtn.innerHTML = sb.partition
        ? icon('ZapOff') + ' Heal partition'
        : icon('Zap') + ' Inject network partition';
      // nodes
      var role = sb.writeMode === 'quorum-sync' ? 'Sync copy (quorum)' : 'Async copy';
      nodesWrap.innerHTML =
        topoNode('AZ-A · node-1', 'PRIMARY — all writes', { primary: true }) +
        topoNode('AZ-B · node-2', role) +
        topoNode('AZ-C · node-3', role, { partitioned: sb.partition });
      var outcome;
      if (sb.partition && sb.writeMode === 'quorum-sync') {
        outcome =
          'Quorum-synchronous writes: with a zone cut off, writes that cannot reach quorum PAUSE — the ledger stays consistent (CP behaviour).';
      } else if (sb.partition && sb.writeMode === 'async') {
        outcome =
          'Asynchronous writes: the primary keeps accepting writes while the partitioned copy drifts — a failover now can lose the most recent writes (AP behaviour, availability over consistency).';
      } else if (sb.writeMode === 'quorum-sync') {
        outcome = 'Commits wait for the second copy: slightly slower writes, nothing diverges.';
      } else {
        outcome = 'Commits return immediately; copies catch up later (replication lag).';
      }
      writeOutcome.textContent = outcome;
      writeOutcome.className = 'logbox ' + (sb.partition ? 'warn' : 'neutral');
      // slider
      rfVal.textContent = String(sb.replicationFactor);
      if (document.activeElement !== rfSlider) rfSlider.value = String(sb.replicationFactor);
      rfSlider.setAttribute('aria-valuetext', sb.replicationFactor + ' copies');
      // write mode buttons
      wmSync.setAttribute('aria-pressed', String(sb.writeMode === 'quorum-sync'));
      wmSync.className = 'chip-option' + (sb.writeMode === 'quorum-sync' ? ' on-wax' : '');
      wmAsync.setAttribute('aria-pressed', String(sb.writeMode === 'async'));
      wmAsync.className = 'chip-option' + (sb.writeMode === 'async' ? ' on-wax' : '');

      if (state.mode === 'medium') {
        m5.update(state);
        m6.update(state);
        // CAP drill
        ['checkout', 'recs'].forEach(function (key) {
          ['consistency', 'availability'].forEach(function (v) {
            var on = sb.servicePolicy[key] === v;
            policyBtns[key + '-' + v].setAttribute('aria-pressed', String(on));
            policyBtns[key + '-' + v].className = 'chip-option' + (on ? ' on-wax' : '');
          });
          var chosen = sb.servicePolicy[key];
          var elOut = outcomeEls[key];
          if (sb.partition && chosen) {
            elOut.textContent =
              chosen === 'consistency'
                ? '→ Writes to the isolated copy are REJECTED until the partition heals. No divergence.'
                : '→ The isolated copy keeps SERVING (possibly stale) reads. It converges after healing.';
          } else {
            elOut.textContent = '';
          }
        });
        // consistency selects + BASE
        sbSel.billing.update(sb.consistencyMode.billing);
        sbSel.watch.update(sb.consistencyMode.watchlist);
        BASE_OPTIONS.forEach(function (o) {
          var on = sb.baseAnswer === o.value;
          baseBtns[o.value].setAttribute('aria-pressed', String(on));
          baseBtns[o.value].className = 'chip-option' + (on ? ' on-wax' : '');
        });
      } else {
        h2.update(state);
        sbSel.conflicts.update(sb.hardAnswers.conflicts);
        sbSel.reads.update(sb.hardAnswers.currentReads);
        sbSel.lost.update(sb.hardAnswers.lost);
      }
    }
    update(store());
    return { el: root, update: update };
  }

  // ======================================================================
  // X-400 Scale Lab (OBJ-M7, or OBJ-H4 + OBJ-H9)
  // ======================================================================
  var LOADS = [
    { level: 1, label: 'Normal', factor: 1 },
    { level: 2, label: 'Busy · 2×', factor: 2 },
    { level: 3, label: 'Peak · 3×', factor: 3 },
    { level: 4, label: 'Flash sale · 6×', factor: 6 },
  ];
  var TOOL_OPTIONS = [
    { value: 'warehouse', label: 'Data warehouse (OLAP)' },
    { value: 'replica', label: 'Read replica offload' },
    { value: 'cache', label: 'In-memory cache' },
    { value: 'sharding', label: 'Sharding' },
  ];
  var TOOL_STATEMENTS = [
    { id: 'agg', text: '“Every night we aggregate billions of order rows for finance — the transactional store groans.”' },
    { id: 'week', text: '“Month-end reporting briefly hurts the primary; we need the smaller fix, this week.”' },
    { id: 'repeat', text: '“The same product summary is recomputed thousands of times a second.”' },
    { id: 'write', text: '“A single huge orders table has exhausted write throughput — reads are fine.”' },
  ];

  function ScaleSheet() {
    var root = U.el('article');
    var state0 = store();

    var m7 = state0.mode === 'medium' ? U.reviewItemCard('OBJ-M7') : null;
    var h4 = state0.mode === 'hard' ? U.reviewItemCard('OBJ-H4') : null;
    var h9 = state0.mode === 'hard' ? U.reviewItemCard('OBJ-H9') : null;

    var section = U.el('section', 'sheet-card rounded-md p-4');
    section.setAttribute('aria-label', 'Traffic and controls');
    section.innerHTML =
      '<div class="grid-2-lg">' +
      '<div>' +
      '<p class="step-label">1 · Traffic dial</p>' +
      '<div class="grid-2-sm" style="margin-top:0.5rem" data-role="loads"></div>' +
      '<p class="step-label" style="margin-top:1rem">2 · Read-scaling controls</p>' +
      '<div style="margin-top:0.5rem;display:flex;align-items:center;gap:0.75rem">' +
      '<button type="button" class="btn btn-outline btn-icon" aria-label="Remove read replica" data-testid="replica-minus">' +
      icon('Minus') +
      '</button>' +
      '<span class="replica-count" aria-live="polite" data-role="replicas"></span>' +
      '<button type="button" class="btn btn-outline btn-icon" aria-label="Add read replica" data-testid="replica-plus">' +
      icon('Plus') +
      '</button>' +
      '</div>' +
      '<button type="button" role="switch" aria-checked="false" data-testid="pooling-switch" class="pooling-row">' +
      '<span><span class="switch-row-label">Connection pooling</span>' +
      '<span class="body-xs" style="display:block">Reuse connections instead of one-per-request.</span></span>' +
      '<span class="switch-row-state bad" data-role="pooling-state">OFF</span>' +
      '</button>' +
      '<div style="margin-top:0.75rem" data-role="instance"></div>' +
      '</div>' +
      '<div>' +
      '<p class="step-label">3 · Live gauges</p>' +
      '<div class="grid-2-sm" style="margin-top:0.5rem" aria-live="polite" data-role="gauges"></div>' +
      '<p class="section-note">Note the deliberate lesson in the gauges: vertical scale (instance class) helps a little; only replicas add read paths. Replicas always introduce lag — the green “healthy” world still has that trade.</p>' +
      '</div>' +
      '</div>';

    var loadsWrap = section.querySelector('[data-role="loads"]');
    var loadBtns = {};
    LOADS.forEach(function (l) {
      var btn = U.el('button', 'chip-option', esc(l.label));
      btn.type = 'button';
      btn.setAttribute('data-testid', 'load-' + l.level);
      btn.addEventListener('click', function () {
        LabStore.actions.updateEnv(function (e) {
          return Object.assign({}, e, { scale: Object.assign({}, e.scale, { loadLevel: l.level }) });
        });
      });
      loadsWrap.appendChild(btn);
      loadBtns[l.level] = btn;
    });
    var minusBtn = section.querySelector('[data-testid="replica-minus"]');
    var plusBtn = section.querySelector('[data-testid="replica-plus"]');
    var replicasEl = section.querySelector('[data-role="replicas"]');
    var poolingBtn = section.querySelector('[data-testid="pooling-switch"]');
    var poolingState = section.querySelector('[data-role="pooling-state"]');
    minusBtn.addEventListener('click', function () {
      LabStore.actions.updateEnv(function (e) {
        return Object.assign({}, e, {
          scale: Object.assign({}, e.scale, { replicas: Math.max(0, e.scale.replicas - 1) }),
        });
      });
    });
    plusBtn.addEventListener('click', function () {
      LabStore.actions.updateEnv(function (e) {
        return Object.assign({}, e, {
          scale: Object.assign({}, e.scale, { replicas: Math.min(4, e.scale.replicas + 1) }),
        });
      });
    });
    poolingBtn.addEventListener('click', function () {
      LabStore.actions.updateEnv(function (e) {
        return Object.assign({}, e, { scale: Object.assign({}, e.scale, { pooling: !e.scale.pooling }) });
      });
    });
    var instanceSel = U.draftSelect({
      label: 'Instance class (vertical scale)',
      options: [
        { value: 'small', label: 'Small — 4 vCPU' },
        { value: 'medium', label: 'Medium — 8 vCPU' },
        { value: 'large', label: 'Large — 16 vCPU' },
      ],
      testid: 'instance-class',
      onChange: function (v) {
        LabStore.actions.updateEnv(function (e) {
          return Object.assign({}, e, { scale: Object.assign({}, e.scale, { instanceClass: v }) });
        });
      },
    });
    section.querySelector('[data-role="instance"]').appendChild(instanceSel);
    var gaugesWrap = section.querySelector('[data-role="gauges"]');

    // build page flow
    root.innerHTML = U.sheetIntro(
      'X-400',
      'Scale lab — the flash-sale stress table',
      '<p>Meridian’s marketing team has planned a flash sale. This simulation table lets you load the orders estate and apply the scaling tools until every gauge is honest.</p>',
    );
    if (m7) root.appendChild(m7.el);
    root.appendChild(section);

    // hard-mode panels
    var shardSel = {};
    var toolSels = {};
    var shardBtns = {};
    if (state0.mode === 'hard') {
      root.appendChild(h4.el);
      var sharding = U.el('section', 'sheet-card rounded-md p-4');
      sharding.setAttribute('aria-label', 'Sharding panel');
      sharding.innerHTML =
        '<p class="body-sm" style="font-weight:600;color:var(--ink)">Sharding panel — the writes, not the reads, are exhausted now. Shard the orders table:</p>' +
        '<button type="button" role="switch" aria-checked="false" data-testid="shard-switch" class="shard-enable">Enable sharding on orders</button>' +
        '<fieldset class="plain legend-xs" data-role="keyset"><legend>Shard key candidates</legend>' +
        '<div class="grid-3-sm" style="margin-top:0.5rem" data-role="keys"></div></fieldset>' +
        '<div class="grid-3" style="margin-top:0.75rem" data-role="justify"></div>';
      var shardSwitch = sharding.querySelector('[data-testid="shard-switch"]');
      shardSwitch.addEventListener('click', function () {
        LabStore.actions.updateEnv(function (e) {
          return Object.assign({}, e, { scale: Object.assign({}, e.scale, { sharded: !e.scale.sharded }) });
        });
      });
      var keyDescs = {
        customer_id: 'Millions of customers; each customer’s orders queried together.',
        order_date: 'New rows always arrive at “today”.',
        status: 'Values: pending, paid, shipped, refunded, closed.',
      };
      var keysWrap = sharding.querySelector('[data-role="keys"]');
      ['customer_id', 'order_date', 'status'].forEach(function (v) {
        var btn = U.el(
          'button',
          'shardkey-btn',
          '<span class="shardkey-name">' +
            esc(v) +
            '</span><span class="shardkey-desc">' +
            esc(keyDescs[v]) +
            '</span>',
        );
        btn.type = 'button';
        btn.setAttribute('data-testid', 'shardkey-' + v);
        btn.addEventListener('click', function () {
          LabStore.actions.updateEnv(function (e) {
            return Object.assign({}, e, { scale: Object.assign({}, e.scale, { shardKey: v }) });
          });
        });
        keysWrap.appendChild(btn);
        shardBtns[v] = btn;
      });
      var justifyWrap = sharding.querySelector('[data-role="justify"]');
      function justifySel(testid, label, path, options) {
        var s = U.draftSelect({
          label: label,
          options: options,
          testid: testid,
          onChange: function (v) {
            LabStore.actions.updateEnv(function (e) {
              var sj = Object.assign({}, e.scale.shardJustify);
              sj[path] = v;
              return Object.assign({}, e, { scale: Object.assign({}, e.scale, { shardJustify: sj }) });
            });
          },
        });
        justifyWrap.appendChild(s);
        return s;
      }
      shardSel.whyCustomer = justifySel('why-customer', 'Why does customer_id distribute well?', 'whyCustomer', [
        { value: 'cardinality', label: 'High cardinality across customers' },
        { value: 'skew', label: 'Zero skew by its very construction' },
        { value: 'proximity', label: 'Proximity to the primary node' },
      ]);
      shardSel.whyNotStatus = justifySel('why-not-status', 'Why reject status?', 'whyNotStatus', [
        { value: 'lowcard', label: 'Too few distinct values — hot partitions' },
        { value: 'skew', label: 'It skews every write to one busy value' },
        { value: 'latency', label: 'It adds write latency without adding reads' },
      ]);
      shardSel.whyNotDate = justifySel('why-not-date', 'Why reject order_date?', 'whyNotDate', [
        { value: 'skew', label: 'The recent window takes most writes' },
        { value: 'lowcard', label: 'Too few distinct values to spread' },
        { value: 'proximity', label: 'Historical queries cannot be served fast' },
      ]);
      root.appendChild(sharding);

      root.appendChild(h9.el);
      var tools = U.el('section', 'sheet-card rounded-md p-4');
      tools.setAttribute('aria-label', 'Tool matching board');
      tools.innerHTML =
        '<p class="body-sm" style="font-weight:600;color:var(--ink)">Tool-matching board — one tool per statement, no repeats needed:</p><div style="margin-top:0.75rem;display:flex;flex-direction:column;gap:0.5rem" data-role="tools"></div>';
      var toolsWrap = tools.querySelector('[data-role="tools"]');
      TOOL_STATEMENTS.forEach(function (s) {
        var row = U.el(
          'div',
          'tool-row',
          '<p class="mono-xs">' + esc(s.text) + '</p>',
        );
        var sel = U.draftSelect({
          label: 'Right tool',
          options: TOOL_OPTIONS,
          testid: 'tool-' + s.id,
          onChange: function (v) {
            LabStore.actions.updateEnv(function (e) {
              var tm = Object.assign({}, e.scale.toolMatch);
              tm[s.id] = v;
              return Object.assign({}, e, { scale: Object.assign({}, e.scale, { toolMatch: tm }) });
            });
          },
        });
        row.appendChild(sel);
        toolsWrap.appendChild(row);
        toolSels[s.id] = sel;
      });
      root.appendChild(tools);
    }

    root.appendChild(U.nextSheetButton('ops', 'Next sheet: D-500 Ops Journal'));

    var shardSwitchEl = state0.mode === 'hard' ? root.querySelector('[data-testid="shard-switch"]') : null;
    var keysetFieldset = state0.mode === 'hard' ? root.querySelector('[data-role="keyset"]') : null;
    var justifyGrid = state0.mode === 'hard' ? root.querySelector('[data-role="justify"]') : null;

    function update(state) {
      if (m7) m7.update(state);
      if (h4) h4.update(state);
      if (h9) h9.update(state);
      var sc = state.env.scale;
      LOADS.forEach(function (l) {
        var on = sc.loadLevel === l.level;
        loadBtns[l.level].setAttribute('aria-pressed', String(on));
        loadBtns[l.level].className = 'chip-option' + (on ? ' on-wax' : '');
      });
      minusBtn.disabled = sc.replicas === 0;
      plusBtn.disabled = sc.replicas === 4;
      replicasEl.textContent = sc.replicas + ' replica' + (sc.replicas === 1 ? '' : 's');
      poolingBtn.setAttribute('aria-checked', String(sc.pooling));
      poolingBtn.className = 'pooling-row' + (sc.pooling ? ' on' : '');
      poolingState.textContent = sc.pooling ? 'ON' : 'OFF';
      poolingState.className = 'switch-row-state ' + (sc.pooling ? 'ok' : 'bad');
      instanceSel.update(sc.instanceClass);

      // gauge formulas — identical to the original component
      var factor = LOADS[sc.loadLevel - 1].factor;
      var classBonus = sc.instanceClass === 'large' ? 0.8 : sc.instanceClass === 'medium' ? 0.4 : 0;
      var connLoad = Math.min(120, Math.round((factor * 34 * (sc.pooling ? 0.55 : 1)) / (1 + 0.45 * sc.replicas)));
      var readLat = Math.round((14 * factor) / (1 + 1.1 * sc.replicas + classBonus));
      var writeLat = sc.instanceClass === 'large' ? 10 : sc.instanceClass === 'medium' ? 15 : 22;
      var lag = sc.replicas > 0 ? Math.round((0.8 + 0.4 * sc.replicas + 0.3 * factor) * 10) / 10 : 0;
      gaugesWrap.innerHTML = '';
      gaugesWrap.appendChild(
        U.gauge(
          'connections',
          connLoad,
          '%',
          connLoad <= 80,
          connLoad > 80 ? 'Primary connection queue saturating.' : 'Connection load healthy.',
        ),
      );
      gaugesWrap.appendChild(
        U.gauge(
          'read-latency',
          readLat,
          'ms p95',
          readLat <= 45,
          readLat > 45 ? 'Reads waiting on a saturated primary.' : 'Reads served within budget.',
        ),
      );
      gaugesWrap.appendChild(U.gauge('write-latency', writeLat, 'ms p95', writeLat <= 25, 'Writes are not the storm — reads are.'));
      gaugesWrap.appendChild(
        U.gauge(
          'replication-lag',
          lag,
          's',
          true,
          lag > 0 ? 'Expected: async replicas trail the primary. Read-after-write → primary.' : 'No replicas — no lag, no read scaling either.',
        ),
      );

      if (state.mode === 'hard') {
        shardSwitchEl.setAttribute('aria-checked', String(sc.sharded));
        shardSwitchEl.className = 'shard-enable' + (sc.sharded ? ' on' : '');
        shardSwitchEl.textContent = sc.sharded
          ? 'Sharding ENABLED — orders split across 4 shards'
          : 'Enable sharding on orders';
        keysetFieldset.classList.toggle('dimmed', !sc.sharded);
        keysetFieldset.disabled = !sc.sharded;
        justifyGrid.classList.toggle('dimmed', !sc.sharded);
        justifyGrid.style.pointerEvents = sc.sharded ? '' : 'none';
        justifyGrid.style.opacity = sc.sharded ? '' : '0.5';
        Object.keys(shardBtns).forEach(function (v) {
          var on = sc.shardKey === v;
          shardBtns[v].classList.toggle('on', on);
          shardBtns[v].setAttribute('aria-pressed', String(on));
        });
        shardSel.whyCustomer.update(sc.shardJustify.whyCustomer || '');
        shardSel.whyNotStatus.update(sc.shardJustify.whyNotStatus || '');
        shardSel.whyNotDate.update(sc.shardJustify.whyNotDate || '');
        TOOL_STATEMENTS.forEach(function (s) {
          toolSels[s.id].update(sc.toolMatch[s.id] || '');
        });
      }
    }
    update(store());
    return { el: root, update: update };
  }

  return {
    BriefingSheet: BriefingSheet,
    CoreSheet: CoreSheet,
    MatcherSheet: MatcherSheet,
    SandboxSheet: SandboxSheet,
    ScaleSheet: ScaleSheet,
  };
})();
