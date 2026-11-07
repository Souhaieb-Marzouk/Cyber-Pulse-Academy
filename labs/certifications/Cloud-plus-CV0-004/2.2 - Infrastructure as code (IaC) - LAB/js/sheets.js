// ─── Blueprint Studio · sheets 00/01/02/03-wrapper/04/06 (static port) ──────
// Vanilla-JS translations of ModeSelect, BriefSheet, FundamentalsSheet,
// WorkbenchSheet, TrackerSheet, DebriefSheet. Copy is carried over 1:1.

(function () {
  'use strict';

  var Store = window.LabStore;
  var P = window.BP;
  var icon = P.icon;
  var esc = P.esc;
  var attr = P.attr;

  // ── Sheet 00 · mode selection ──────────────────────────────────────────────

  var MODES = [
    {
      id: 'medium',
      icon: 'pencil-ruler',
      name: 'DRAFTSMAN',
      tag: 'MEDIUM · guided practice',
      blurb:
        '12 granular objectives introduced in order. Every objective tells you where to look, three hint tiers are always available, and every check explains WHY. Wrong answers cost nothing but stars.',
      bullets: ['Where-to-look on every objective', '3-tier hints (nudge → direction → demonstration)', 'Tolerant checking, teaching feedback', '≈ 35–50 min'],
      accent: '#7BC796',
    },
    {
      id: 'hard',
      icon: 'target',
      name: 'LEAD ENGINEER',
      tag: 'HARD · challenge mode',
      blurb:
        '9 broad, multi-step challenges over noisy evidence with two planted red herrings. No where-to-look, hints disabled except ONE paid nudge, strict validation — near-misses are rejected with a rationale.',
      bullets: ['Scenario-first, discovery-based', 'Exact values, exact IDs, ordered sequences', 'One optional nudge (−5 score)', '≈ 45–60 min'],
      accent: '#F08A85',
    },
  ];

  function renderModeSelect() {
    var cards = MODES.map(function (m, i) {
      return (
        '<button type="button" class="mode-card" data-act="enter-mode" data-mode="' + m.id + '"' +
        ' data-fid="mode-' + m.id + '" style="animation-delay:' + (0.1 + i * 0.1).toFixed(1) + 's"' +
        ' aria-label="Start ' + esc(m.name) + ' mode. ' + esc(m.tag) + '">' +
        '<div class="mode-card-top">' +
        icon(m.icon, 'ic-24').replace('class="lucide', 'style="color:' + m.accent + '" class="lucide') +
        icon('compass', 'ic-16 compass') +
        '</div>' +
        '<p class="tag" style="color:' + m.accent + '">' + esc(m.tag) + '</p>' +
        '<p class="name">' + esc(m.name) + '</p>' +
        '<p class="blurb">' + esc(m.blurb) + '</p>' +
        '<ul>' + m.bullets.map(function (b) { return '<li>▸ ' + esc(b) + '</li>'; }).join('') + '</ul>' +
        '</button>'
      );
    }).join('');

    return (
      '<main class="paper mode-main" aria-label="Mode selection">' +
      '<div class="mode-enter">' +
      '<div class="titleblock"><div class="titleblock-grid">' +
      '<div class="titleblock-cell tb-1"><p class="kicker">PROJECT</p><p class="value">BLUEPRINT<br>STUDIO</p></div>' +
      '<div class="titleblock-cell tb-2"><p class="kicker">SUBJECT</p><p class="value">CompTIA Cloud+ CV0-004 · Lesson 2.2<br>Infrastructure as Code (IaC) — implementing IaC techniques for automation</p></div>' +
      '<div class="titleblock-cell tb-3"><p class="kicker">REVISION</p><p class="value">R8 · DUAL MODE</p></div>' +
      '</div></div>' +
      '<div class="training-note">' +
      icon('shield-alert', 'ic-16') +
      '<p><strong>Training environment.</strong> Every company, template, log line and secret in this lab is synthetic and fictional. Nothing here connects to real infrastructure. Defensive, exam-oriented framing throughout.</p>' +
      '</div>' +
      '<h1 class="mode-heading">CHOOSE YOUR SEAT AT THE DRAFTING DESK</h1>' +
      '<p class="mode-sub">Same drawing set, same evidence, two experiences. You can switch modes later only by resetting the lab.</p>' +
      '<div class="mode-grid">' + cards + '</div>' +
      '</div>' +
      '</main>'
    );
  }

  // ── Sheet 01 · project briefing ────────────────────────────────────────────

  function renderBrief(anim) {
    var animCls = anim ? ' anim-fade-up' : '';
    var animClsLate = anim ? ' anim-fade-up-late' : '';
    var inner =
      '<div class="two-col">' +
      '<div class="card' + animCls + '" style="grid-column:1/-1">' +
      '<h3 class="card-head">' + icon('triangle-alert', 'ic-16 c-red') + ' THE 03:14 INCIDENT (FICTIONAL)</h3>' +
      '<div style="margin-top:8px;display:flex;flex-direction:column;gap:12px;font-size:13px;line-height:1.625;color:var(--soft)">' +
      '<p>At <strong style="color:var(--ink)">03:14</strong> on Sunday, Meridian Retail’s staging store slowed to a crawl. An on-call engineer opened the cloud console and, in four confident clicks, doubled the web server’s size and opened an RDP port “just to get in quickly.” The store recovered. Nobody wrote anything down.</p>' +
      '<p>Three weeks later the pipeline applied the week’s template changes — and quietly<strong style="color:var(--ink)"> un-did both fixes</strong>, because the code (the source of truth) still said<code class="inline-code">t3.micro</code> and<code class="inline-code">no :3389</code>. The hotfix died with it. The post-mortem’s headline: <em>our infrastructure exists in two places — the code, and whatever people did last — and only one of them has a memory.</em></p>' +
      '<p>The response: Meridian is adopting <strong style="color:var(--ink)">Infrastructure as Code</strong>, end to end. Templates in version control. A pipeline as the only path to production. Drift detection at night. Policy gates before resources exist.</p>' +
      '</div></div>' +
      '<div class="card' + animClsLate + '">' +
      '<h3 class="card-head">' + icon('drafting-compass', 'ic-16 c-amber') + ' YOUR DESK</h3>' +
      '<div style="margin-top:8px;display:flex;flex-direction:column;gap:12px;font-size:13px;line-height:1.625;color:var(--soft)">' +
      '<p>You are the new <strong style="color:var(--ink)">Cloud Automation Engineer</strong>. Your predecessor left you a working but flawed drawing set: a template with classic flaws, a hand-edited environment that has drifted, a state register in questionable shape, and two pipeline runs — one that stopped honestly, one that cheated.</p>' +
      '<p>Your job is to read it all, detect what moved, and harden the whole drafting workflow — the exact skills CV0-004’s <strong style="color:var(--ink)">Domain 2.0 “Deployment” (19%)</strong> tests under automation and orchestration, with DevOps fundamentals from Domain 5 woven in.</p>' +
      '</div></div>' +
      '</div>' +
      '<div class="two-col" style="margin-top:16px">' +
      '<div class="card">' +
      '<h3 class="card-head">' + icon('clipboard-list', 'ic-16 c-green') + ' HOW THIS LAB WORKS</h3>' +
      '<ul class="takeaways" style="margin-top:8px">' +
      '<li>▸ <strong style="color:var(--ink)">Sheets 01–06</strong> are your drawing set; navigate with the spine on the left (tabs on mobile).</li>' +
      '<li>▸ <strong style="color:var(--ink)">Sheet 03</strong> is the workbench: five drawers of evidence and tools.</li>' +
      '<li>▸ <strong style="color:var(--ink)">Sheet 04</strong> is your spec checklist — every objective is checked and stamped there.</li>' +
      '<li>▸ Progress saves automatically; the RESET control restores pristine state.</li>' +
      '</ul></div>' +
      '<div class="card">' +
      '<h3 class="card-head">' + icon('git-branch', 'ic-16 c-soft') + ' WHY THE EXAM CARES</h3>' +
      '<p style="margin-top:8px;font-size:13px;line-height:1.625;color:var(--soft)">Cloud+ expects a candidate who can <strong style="color:var(--ink)">explain IaC, pick the right tool, read a plan, manage state, catch drift, and keep the pipeline’s credentials safe</strong> — and who understands why attackers treat a leaked template repo as a master key to the building. Every drawer in Sheet 03 maps to one of those demands.</p>' +
      '</div></div>';
    return P.sheetFrame('01', 'PROJECT BRIEFING — MERIDIAN RETAIL GROUP',
      'A fictional mid-size retailer, a bad night, and a decision to never again fix production by hand. All names, logs and values are synthetic training data.',
      inner);
  }

  // ── Sheet 02 · drafting fundamentals ───────────────────────────────────────

  var WORKFLOW = [
    { cmd: 'init', what: 'Fetch provider plugins, prepare the backend (where state lives).' },
    { cmd: 'plan', what: 'Dry-run: compute the diff between code and reality. Always read it.' },
    { cmd: 'apply', what: 'Make reality match the code — create, update, or replace.' },
    { cmd: 'destroy', what: 'Tear down what the code manages. Handle with the same care as apply.' },
  ];

  var H7_SCENARIOS = [
    { id: 's1', text: 'One template set must provision networks and VMs across BOTH AWS and Azure.' },
    { id: 's2', text: '200 running Linux VMs must receive an identical hardened OS baseline — packages, users, SSH config. Nothing new is created.' },
    { id: 's3', text: 'An Azure-only platform team wants simpler templates that compile to ARM, dropping verbose JSON.' },
  ];

  function renderFundamentals(ui) {
    var s = Store.getState();
    var env = s.env;
    var mode = s.mode;

    var descOrder = env.benefitOrder && env.benefitOrder.length === Object.keys(BENEFIT_DEFS).length
      ? env.benefitOrder
      : Object.keys(BENEFIT_DEFS);
    var catOrder = env.toolCatOrder && env.toolCatOrder.length === TOOL_CATEGORIES.length
      ? env.toolCatOrder
      : TOOL_CATEGORIES.map(function (c) { return c.id; });

    // M1 pairing
    var terms = BENEFIT_TERMS.map(function (t) {
      var assigned = env.benefitsPairs[t];
      var active = ui.selectedTerm === t;
      return (
        '<button type="button" class="term-btn' + (active ? ' active' : '') + '" data-act="term-select" data-term="' + attr(t) + '"' +
        ' data-fid="term-' + attr(t) + '" aria-pressed="' + active + '">' +
        esc(t) +
        (assigned ? '<span class="paired">paired ✓</span>' : '') +
        '</button>'
      );
    }).join('');
    var descs = descOrder.map(function (k) {
      return (
        '<button type="button" class="desc-btn" data-act="desc-pick" data-key="' + attr(k) + '"' +
        ' data-fid="desc-' + attr(k) + '">' + esc(BENEFIT_DEFS[k]) + '</button>'
      );
    }).join('');

    // M2 snippets
    var snippets = DI_SNIPPETS.map(function (sn) {
      var cur = env.diClassify[sn.id];
      function stampBtn(opt) {
        var on = cur === opt;
        var cls = 'di-stamp' + (on ? (opt === 'declarative' ? ' on-declarative' : ' on-imperative') : '');
        return (
          '<button type="button" class="' + cls + '" data-act="di-stamp" data-id="' + sn.id + '" data-v="' + opt + '"' +
          ' data-fid="di-' + sn.id + '-' + opt + '" aria-pressed="' + on + '">' + opt.toUpperCase() + '</button>'
        );
      }
      return (
        '<div class="di-item">' +
        '<pre>' + esc(sn.code) + '</pre>' +
        '<div class="di-stamps">' + stampBtn('declarative') + stampBtn('imperative') + '</div>' +
        '<p class="di-hint">' + esc(sn.hint) + '</p>' +
        '</div>'
      );
    }).join('');

    // workflow
    var workflow = WORKFLOW.map(function (w, i) {
      return (
        '<div class="workflow-card">' +
        '<p class="step">STEP ' + (i + 1) + '</p>' +
        '<p class="cmd">$ terraform ' + esc(w.cmd) + '</p>' +
        '<p class="what">' + esc(w.what) + '</p>' +
        '</div>'
      );
    }).join('');

    // M3 tool wall
    var toolRows = TOOLS.map(function (t) {
      var cur = env.toolAssign[t] || '';
      var opts = '<option value="" disabled' + (cur === '' ? ' selected' : '') + '>— assign category —</option>';
      catOrder.forEach(function (cid) {
        var c = TOOL_CATEGORIES.find(function (x) { return x.id === cid; });
        opts += '<option value="' + attr(c.id) + '"' + (cur === c.id ? ' selected' : '') + '>' + esc(c.label) + '</option>';
      });
      return (
        '<div class="tool-row">' +
        '<span class="tool-name">' + esc(t) + '</span>' +
        '<select class="sel sel-compact" style="flex:1" data-env="toolAssign:' + attr(t) + '" aria-label="Category for ' + attr(t) + '">' + opts + '</select>' +
        '</div>'
      );
    }).join('');

    // H7 (hard only)
    var hardScenarios = '';
    if (mode === 'hard') {
      var sc = H7_SCENARIOS.map(function (o) {
        var cur = env.h7[o.id] || '';
        var opts = '<option value="" disabled' + (cur === '' ? ' selected' : '') + '>— tool —</option>';
        TOOLS.forEach(function (t) {
          opts += '<option value="' + attr(t) + '"' + (cur === t ? ' selected' : '') + '>' + esc(t) + '</option>';
        });
        return (
          '<div class="hs-card">' +
          '<p>' + esc(o.text) + '</p>' +
          '<select class="sel sel-compact sel-panel" style="width:100%" data-env="h7:' + o.id + '" aria-label="Tool for scenario ' + o.id + '">' + opts + '</select>' +
          '</div>'
        );
      }).join('');
      hardScenarios =
        '<div class="hard-scenarios">' +
        '<p class="kicker">' + P.pillarBadge('P1') + ' HARD SCENARIOS · SPEC H7 — pick a tool per constraint, not per habit.</p>' +
        '<div class="hs-grid">' + sc + '</div>' +
        '</div>';
    }

    // incidents
    var incidents = INCIDENTS.map(function (inc) {
      return (
        '<li><p class="inc-title">' + esc(inc.title) + '</p><p class="inc-body">' + esc(inc.body) + '</p></li>'
      );
    }).join('');

    var inner =
      P.blockHead('CORE CONCEPT', 'What Infrastructure as Code actually is') +
      '<div class="card"><p style="font-size:13px;line-height:1.625;color:var(--soft)">' +
      '<strong style="color:var(--ink)">IaC</strong> means defining infrastructure — networks, servers, storage, databases, permissions — in <strong style="color:var(--ink)">machine-readable definition files</strong> that are version-controlled and applied by an automation engine, instead of being built by hand in a console. The template is the<em> source of truth</em>: reality is made to match the code, never the other way around. Hand-built environments drift, diverge, and produce <strong style="color:var(--ink)">snowflake servers</strong> — fragile machines nobody can reproduce. Code-built environments can be rebuilt from the repo in minutes, which is also why IaC is the backbone of disaster recovery.' +
      '</p></div>' +

      P.blockHead('INTERACTION · SPEC M1', 'Why teams draft instead of clicking') +
      '<div class="card">' +
      '<p class="intro-line">' + P.pillarBadge('P1') + ' Click a <span style="color:var(--amber)">benefit term</span>, then click the description it belongs to. Each description is used exactly once.</p>' +
      '<div class="pair-grid">' +
      '<div class="stack" role="group" aria-label="Benefit terms">' + terms + '</div>' +
      '<div class="stack" role="group" aria-label="Descriptions">' + descs + '</div>' +
      '</div></div>' +

      P.blockHead('CORE CONCEPT · SPEC M2', 'Two ways to say it: declarative vs imperative') +
      '<div class="card">' +
      '<p class="intro-line">' + P.pillarBadge('P1') + ' <strong style="color:var(--ink)">Declarative = Destination.</strong> You describe the end state; the engine works out the steps. <strong style="color:var(--ink)">Imperative = Directions.</strong> You spell out the steps in order. Stamp each snippet:</p>' +
      '<div class="di-grid">' + snippets + '</div>' +
      '<p class="note-row" style="margin-top:12px">' + icon('repeat', 'ic-14') +
      '<span><strong>Idempotency</strong> is the superpower of the declarative style: applying the same template twice converges to the same result — the second run changes nothing. Mutable vs immutable: editing servers in place slowly re-creates snowflakes; replacing them wholesale from a fresh image (immutable) keeps every instance born identical.</span></p>' +
      '</div>' +

      P.blockHead('CORE CONCEPT', 'The core workflow — always plan before apply') +
      '<div class="card">' +
      '<div class="workflow-grid">' + workflow + '</div>' +
      '<p style="margin-top:12px;font-size:12px;line-height:1.625;color:var(--soft)">AWS CloudFormation’s <strong style="color:var(--ink)">change sets</strong> and Azure Bicep’s<strong style="color:var(--ink)"> what-if</strong> are the same idea in other dialects: preview the diff before you commit it. A plan that says <code class="inline-code red">-/+ destroy and then create</code> deserves a second read every time.</p>' +
      '</div>' +

      P.blockHead('INTERACTION · SPEC M3', 'The tool wall — file each tool by what it is for') +
      '<div class="card">' +
      '<p class="intro-line">' + P.pillarBadge('P1') + ' Provisioning builds the box; configuration management dresses the box; orchestration coordinates the whole ballet.</p>' +
      '<div class="tool-rows">' + toolRows + '</div>' +
      hardScenarios +
      '</div>' +

      P.blockHead('CHAIN POSITION · WHY ATTACKERS CARE', 'IaC as an attack surface') +
      '<div class="two-col">' +
      '<div class="card">' +
      '<h4 class="card-head">' + icon('shield-question', 'ic-16 c-red') + ' The attacker’s arithmetic</h4>' +
      '<p style="margin-top:8px;font-size:13px;line-height:1.625;color:var(--soft)">One template commit can reshape an entire environment — so a leaked repo credential or pipeline key is a<strong style="color:var(--ink)"> master key to the building</strong>. In ATT&amp;CK terms: a hardcoded key found in a file is <strong style="color:var(--red)">T1552.001 Credentials In Files</strong>; using it to log into the cloud is<strong style="color:var(--red)"> T1078.004 Valid Accounts: Cloud Accounts</strong>; creating and modifying compute through the API outside any pipeline is <strong style="color:var(--red)">T1578 Modify Cloud Compute Infrastructure</strong>. The full attacker’s map is on Sheet 06.</p>' +
      '</div>' +
      '<div class="card">' +
      '<h4 class="card-head">' + icon('book-open', 'ic-16 c-amber') + ' Publicly reported incidents (simplified)</h4>' +
      '<ul class="incident-list" style="margin-top:8px">' + incidents + '</ul>' +
      '</div></div>' +

      '<div class="footnote">' + icon('layers', 'ic-16') +
      '<p><strong>Modules</strong> (reusable, parameterized template packages — the “standard detail sheets” of a drawing set), <strong>variables</strong> and<strong> outputs</strong> are what make templates scale across environments. The<strong> LEGEND</strong> button (top strip) holds the full 15-term glossary — every jargon term in this lab is defined there. ' + icon('git-fork', 'ic-14 inline-ic') + ' GitOps: git is the source of truth, the pipeline is the only path to production.</p>' +
      '</div>';

    return P.sheetFrame('02', 'DRAFTING FUNDAMENTALS',
      'The knowledge core: what IaC is, the two ways to write it, and the tools that speak it. Interactions here feed spec items M1–M3 (and H7).',
      inner);
  }

  // ── Sheet 03 · workbench wrapper ───────────────────────────────────────────

  var DRAWERS = [
    { id: 0, name: 'DRAFTING BOARD', icon: 'drafting-compass', specs: 'M4 · M5 · H1' },
    { id: 1, name: 'PLAN STUDIO', icon: 'git-compare-arrows', specs: 'M6 · H3 · H6' },
    { id: 2, name: 'DRIFT BOARD', icon: 'radar', specs: 'M7 · M12 · H2' },
    { id: 3, name: 'SCAN BENCH', icon: 'scan-search', specs: 'M8 · M10 · H5 · H8' },
    { id: 4, name: 'PIPELINE &amp; REGISTER', icon: 'square-terminal', specs: 'M9 · M11 · H4' },
  ];

  function renderWorkbench(anim, ui) {
    var s = Store.getState();
    var tabs = DRAWERS.map(function (d) {
      var active = s.drawer === d.id;
      return (
        '<button type="button" class="drawer-tab' + (active ? ' active' : '') + '" role="tab"' +
        ' aria-selected="' + active + '" data-act="set-drawer" data-n="' + d.id + '"' +
        ' data-fid="drawer-' + d.id + '">' +
        '<span class="t1">' + icon(d.icon, 'ic-14') + ' DRAWER ' + (d.id + 1) + '</span>' +
        '<span class="t2">' + d.name + '</span>' +
        '<span class="t3">SPEC ' + d.specs + '</span>' +
        '</button>'
      );
    }).join('');

    var panelRenderers = [
      window.BPanels.draftingBoard,
      window.BPanels.planStudio,
      window.BPanels.driftBoard,
      window.BPanels.scanBench,
      window.BPanels.pipelineConsole,
    ];
    var panel = panelRenderers[s.drawer](anim, ui);

    var inner =
      '<div class="drawer-tabs" role="tablist" aria-label="Workbench drawers">' + tabs + '</div>' +
      '<div class="' + (anim ? 'anim-drawer' : '') + '">' + panel + '</div>';

    return P.sheetFrame('03', 'THE WORKBENCH',
      'Five drawers of evidence and tools. Every drawer serves specific spec items — the badge on each tab tells you which.',
      inner);
  }

  // ── Sheet 04 · spec checklist ──────────────────────────────────────────────

  function renderTracker(anim, ui) {
    var s = Store.getState();
    var prog = Store.progressFor(s.mode, s.objectives);
    var list = Store.objectivesForMode(s.mode);
    var allDone = prog.done === prog.total;

    var cards = list.map(function (o, i) {
      var delay = anim ? ' style="animation:fade-up-6 0.3s ease ' + Math.min(i * 0.03, 0.3).toFixed(2) + 's both"' : '';
      return '<div' + delay + '>' + P.objectiveCard(o, false, ui.checkFeedback[o.id]) + '</div>';
    }).join('');

    var helper = allDone
      ? 'Every spec item is stamped. Run the final inspection to receive your approval stamp and score.'
      : s.mode === 'medium'
        ? 'Work top to bottom — each objective links straight to the drawer that answers it.'
        : 'Challenges are independent; triage the evidence drawers in whatever order the scenario demands.';

    var btnLabel = allDone
      ? icon('party-popper', 'ic-16') + ' FINAL INSPECTION'
      : icon('clipboard-check', 'ic-16') + ' STAMP ALL ITEMS TO UNLOCK';

    var sub = s.mode === 'hard'
      ? '9 broad challenges. Strict validation — near-misses are rejected with a rationale. One paid nudge per objective.'
      : '12 granular objectives in a learning order. Hints are free; every check explains why.';

    var inner =
      '<div class="tracker-head">' +
      P.progressRing(prog.pct) +
      '<div class="tracker-text">' +
      '<p class="tracker-count">' + prog.done + ' / ' + prog.total + ' SPEC ITEMS STAMPED</p>' +
      '<p class="tracker-help">' + helper + '</p>' +
      '</div>' +
      '<button type="button" class="btn btn-final" data-act="open-completion" data-fid="final-inspection"' +
      (allDone ? '' : ' disabled') + '>' + btnLabel + '</button>' +
      '</div>' +
      '<div class="obj-grid">' + cards + '</div>';

    return P.sheetFrame('04', 'SPEC CHECKLIST', sub, inner);
  }

  // ── Sheet 06 · field notes / debrief ───────────────────────────────────────

  var LINKS = [
    { href: 'https://www.comptia.org/en-us/certifications/cloud', label: 'CompTIA Cloud+ (CV0-004) — official page' },
    { href: 'https://attack.mitre.org/techniques/T1552/001/', label: 'MITRE ATT&CK · T1552.001 Credentials In Files' },
    { href: 'https://attack.mitre.org/techniques/T1078/004/', label: 'MITRE ATT&CK · T1078.004 Valid Accounts: Cloud Accounts' },
    { href: 'https://attack.mitre.org/techniques/T1578/', label: 'MITRE ATT&CK · T1578 Modify Cloud Compute Infrastructure' },
    { href: 'https://developer.hashicorp.com/terraform/docs', label: 'Terraform documentation' },
    { href: 'https://docs.ansible.com/', label: 'Ansible documentation' },
  ];

  var DETECTION = [
    { src: 'Drift sentinel (scheduled plan vs actual / provider APIs + state)', logic: 'Nightly plan detects ANY delta not explained by the pipeline; alert with resource, attribute, and last pipeline revision.' },
    { src: 'Secret scanning (pre-commit + CI, over template and history)', logic: 'Patterns: provider key prefixes (e.g., AKIA…), private-key headers, high-entropy literals on password/secret/token attributes. Block the pipeline on CRITICAL.' },
    { src: 'Policy-as-code scan of every template revision', logic: 'deny public ACLs on data stores; deny world-open management ports; require encryption at rest; require mandatory tags.' },
    { src: 'Pipeline audit log + apply provenance', logic: 'Alert on apply executed off-pipeline, on self-approvals, on skipped gates ([skip-scan] tags), and on any credential echoed in logs.' },
  ];

  function renderDebrief() {
    var s = Store.getState();
    var env = s.env;
    var cardOrder = env.h9CardOrder && env.h9CardOrder.length === H9_CARDS.length
      ? env.h9CardOrder
      : H9_CARDS.map(function (c) { return c.id; });

    var detection = DETECTION.map(function (d) {
      return (
        '<div class="det-card"><p class="src">' + esc(d.src) + '</p><p class="logic">' + esc(d.logic) + '</p></div>'
      );
    }).join('');

    var h9 = '';
    if (s.mode === 'hard') {
      var evidence = H9_EVIDENCE.map(function (ev) {
        var cur = env.h9[ev.id] || '';
        var opts = '<option value="" disabled' + (cur === '' ? ' selected' : '') + '>— technique —</option>';
        cardOrder.forEach(function (cid) {
          var c = H9_CARDS.find(function (x) { return x.id === cid; });
          opts += '<option value="' + attr(c.id) + '"' + (cur === c.id ? ' selected' : '') + '>' + esc(c.id) + ' · ' + esc(c.name) + '</option>';
        });
        return (
          '<div class="h9-evidence">' +
          '<p>' + esc(ev.text) + '</p>' +
          '<select class="sel sel-mono10 sel-panel" style="width:100%;margin-top:8px" data-env="h9:' + ev.id + '" aria-label="MITRE technique for: ' + attr(ev.text) + '">' + opts + '</select>' +
          '</div>'
        );
      }).join('');
      var cards = cardOrder.map(function (cid) {
        var c = H9_CARDS.find(function (x) { return x.id === cid; });
        var used = Object.keys(env.h9).some(function (k) { return env.h9[k] === c.id; });
        return (
          '<div class="h9-card' + (used ? ' used' : '') + '"><span class="id">' + esc(c.id) + '</span> · ' + esc(c.name) +
          (used ? '<span class="paired">PAIRED</span>' : '') +
          '</div>'
        );
      }).join('');
      h9 =
        '<div class="card qbox-red" style="margin-top:16px">' +
        '<h3 class="card-head">' + icon('swords', 'ic-16 c-red') + ' ' + P.pillarBadge('P1') + ' THE ATTACKER’S MAP · SPEC H9</h3>' +
        '<p style="margin-top:8px;font-size:12px;color:var(--soft)">Pair each evidence item with the MITRE technique it enables. Two cards are decoys.</p>' +
        '<div class="h9-grid">' +
        '<div class="stack">' + evidence + '</div>' +
        '<div class="stack">' + cards + '</div>' +
        '</div></div>';
    }

    var links = LINKS.map(function (l) {
      return (
        '<li><a href="' + attr(l.href) + '" target="_blank" rel="noopener noreferrer">' +
        esc(l.label) + ' ' + icon('external-link', 'ic-12 inline-ic') + '</a></li>'
      );
    }).join('');

    var inner =
      '<div class="card">' +
      '<h3 class="card-head">' + icon('radar', 'ic-16 c-amber') + ' DETECTION OPPORTUNITIES (data source → example logic)</h3>' +
      '<div class="det-grid">' + detection + '</div>' +
      '</div>' +

      '<div class="card" style="margin-top:16px">' +
      '<h3 class="card-head">' + icon('shield-check', 'ic-16 c-green') + ' MITIGATION RECOMMENDATIONS (the control set)</h3>' +
      '<ul class="mit-list">' +
      '<li><strong>State hygiene</strong> — remote backend + locking + encryption; never local state for a team; treat state as sensitive (it can hold plaintext secrets).</li>' +
      '<li><strong>Secrets discipline</strong> — secrets managers only; rotate on any exposure; purge history. Counters <span class="mit">T1552.001</span>.</li>' +
      '<li><strong>Pipeline credential hygiene</strong> — OIDC/short-lived federated credentials instead of static keys; least-privilege pipeline role. Blunts <span class="mit">T1078.004</span>.</li>' +
      '<li><strong>Pipeline integrity</strong> — the pipeline is the only path to production; branch protection; no skip tags; no self-approval; provenance logging. Restricts <span class="mit">T1578</span>.</li>' +
      '<li><strong>Policy gates</strong> — policy-as-code in CI rejects misconfigured templates before resources exist.</li>' +
      '<li><strong>Reconciliation ritual</strong> — review drift daily; revert violations, codify improvements; destructive applies require snapshots and a window.</li>' +
      '</ul></div>' +

      h9 +

      '<div class="two-col" style="margin-top:16px">' +
      '<div class="card">' +
      '<h3 class="card-head">' + icon('shield-check', 'ic-16 c-green') + ' BLUE-TEAM TAKEAWAYS</h3>' +
      '<ul class="takeaways" style="margin-top:8px">' +
      '<li>▸ The code is the source of truth — if reality disagrees, one of them is lying, and your job is to find out which and why.</li>' +
      '<li>▸ Plan before apply, every time; a <span class="mono">-/+</span> line is a data-loss warning in disguise.</li>' +
      '<li>▸ Drift is a signal, not a nuisance: violations revert, improvements codify.</li>' +
      '<li>▸ Guardrails belong in the pipeline (policy as code), not in anyone’s memory.</li>' +
      '<li>▸ Auditability is a deliverable: git + pipeline records + drift reports answer the auditor for you.</li>' +
      '</ul></div>' +
      '<div class="card">' +
      '<h3 class="card-head">' + icon('swords', 'ic-16 c-red') + ' RED-TEAM MINDSET</h3>' +
      '<ul class="takeaways" style="margin-top:8px">' +
      '<li>▸ A repo with IaC templates is reconnaissance gold: resource layout, IPs, AMIs, and sometimes a key in a comment.</li>' +
      '<li>▸ One hardcoded credential = cloud account access with no malware, no phishing, no noise (T1552.001 → T1078.004).</li>' +
      '<li>▸ Pipelines concentrate power: a leaked static key there is a standing account; short-lived tokens shrink the loot window.</li>' +
      '<li>▸ Modification through the provider API (T1578) leaves fewer host artifacts than touching servers — cloud audit logs are the detection surface.</li>' +
      '<li>▸ Public buckets remove the “breach” step entirely (T1530): the data is already reachable.</li>' +
      '</ul></div></div>' +

      '<div class="two-col" style="margin-top:16px">' +
      '<div class="card" style="border-style:dashed;border-color:var(--amber-a50);background:var(--amber-a5)">' +
      '<h3 class="card-head" style="color:var(--amber)">' + icon('git-pull-request-arrow', 'ic-16') + ' WHERE TO GO NEXT</h3>' +
      '<ul class="takeaways" style="margin-top:8px">' +
      '<li>▸ CV0-004 Domain 2.0 continues with orchestration workflows, runbooks and CI/CD — you now know the machinery they automate.</li>' +
      '<li>▸ Practice the workflow hands-on: init → plan → apply against a personal sandbox account, then break something by hand and run a drift check.</li>' +
      '<li>▸ Read one real policy-as-code rule set (Checkov / tfsec style) and map its checks to the flaws you audited here.</li>' +
      '<li>▸ Then take the lab again in the other mode — Hard uses the same evidence and will read differently now.</li>' +
      '</ul></div>' +
      '<div class="card">' +
      '<h3 class="card-head">OFFICIAL REFERENCES (OPEN IN NEW TAB)</h3>' +
      '<ul class="ref-links" style="margin-top:8px">' + links + '</ul>' +
      '</div></div>';

    return P.sheetFrame('06', 'FIELD NOTES · AS-BUILT',
      'What you should carry out of this drafting studio: the detection opportunities, the control set, and both sides of the mindset.',
      inner);
  }

  window.BSheets = {
    renderModeSelect: renderModeSelect,
    renderBrief: renderBrief,
    renderFundamentals: renderFundamentals,
    renderWorkbench: renderWorkbench,
    renderTracker: renderTracker,
    renderDebrief: renderDebrief,
    DRAWERS: DRAWERS,
  };
})();
