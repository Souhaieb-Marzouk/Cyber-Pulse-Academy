// Northwind Hardening Yard - UI rendering (static port).
// Every view is a pure function of state -> HTML string, matching the original
// React components' text, structure, ARIA labels and color semantics 1:1.
'use strict';

(function () {
  var DATA = window.LAB_DATA;
  var Engine = window.LabEngine;
  var Quiz = window.LabQuiz;
  var icon = window.lucideIcon;

  // ---------- helpers ----------

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  var PILLAR_META = {
    P1: { label: 'P1 Understand', cls: 'pillar pillar-p1' },
    P2: { label: 'P2 Recognize', cls: 'pillar pillar-p2' },
    P3: { label: 'P3 Detect', cls: 'pillar pillar-p3' },
    P4: { label: 'P4 Mitigate', cls: 'pillar pillar-p4' },
  };

  function pillarBadge(pillar) {
    var m = PILLAR_META[pillar];
    return '<span class="' + m.cls + '">' + m.label + '</span>';
  }

  var ZONE_ICON = {
    endpoints: icon('monitor-smartphone', 'ic ic-14'),
    mobile: icon('radio', 'ic ic-14'),
    network: icon('router', 'ic ic-14'),
    appsdata: icon('app-window', 'ic ic-14'),
  };

  function progress(pct, label) {
    return (
      '<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' +
      pct +
      '" aria-label="' +
      esc(label) +
      '"><div class="progress-indicator" style="width:' +
      pct +
      '%"></div></div>'
    );
  }

  function starsRow(stars) {
    var out = '';
    for (var i = 1; i <= 5; i++) {
      out +=
        '<span class="star ' + (i <= stars ? 'star-filled' : 'star-empty') + '">' +
        icon('star', 'ic ic-18') +
        '</span>';
    }
    return out;
  }

  // ---------- mode select ----------

  var MODES = [
    {
      id: 'medium',
      title: 'Day Shift',
      tag: 'MEDIUM - guided hardening',
      desc: [
        '12 guided work orders, in order, each one a single learning bite.',
        'Three hint levels per order, tolerant checking, teaching feedback on every check - including wrong ones.',
      ],
      bullets: ['Hints free, cost stars only', 'Where-to-look affordances', 'Quiz after practice'],
      iconName: 'sun-medium',
      accent: 'amber',
    },
    {
      id: 'hard',
      title: 'Night Shift',
      tag: 'HARD - cold yard',
      desc: [
        '9 broad work orders against noisy evidence: audits, configs, code, incident timelines.',
        'Distractors and two red herrings are planted. Exact states and exact answers required; near-misses are rejected with a reason.',
      ],
      bullets: ['One optional nudge, costs score', 'No where-to-look', 'Scenario quiz, accuracy scored'],
      iconName: 'moon-star',
      accent: 'zinc',
    },
  ];

  function renderModeSelect() {
    var cards = MODES.map(function (m, idx) {
      var desc = m.desc
        .map(function (d) {
          return '<p class="mode-desc">' + esc(d) + '</p>';
        })
        .join('');
      var bullets = m.bullets
        .map(function (b) {
          return '<li class="mode-bullet"><span class="dot" aria-hidden="true"></span>' + esc(b) + '</li>';
        })
        .join('');
      return (
        '<button type="button" class="mode-card mode-card-' + m.accent + ' fade-up" style="animation-delay:' +
        (0.1 + idx * 0.12) +
        's" data-action="set-mode" data-mode="' + m.id + '" aria-label="Start ' + esc(m.title) +
        ' mode: ' + esc(m.tag) + '">' +
        '<div class="mode-card-top"><span class="mode-tag mode-tag-' + m.accent + '">' + esc(m.tag) + '</span>' +
        '<span class="' + (m.accent === 'amber' ? 'text-amber-300' : 'text-zinc-300') + '">' +
        icon(m.iconName, 'ic ic-20') + '</span></div>' +
        '<h2 class="mode-title">' + esc(m.title) + '</h2>' +
        '<div class="mode-descs">' + desc + '</div>' +
        '<ul class="mode-bullets">' + bullets + '</ul>' +
        '<span class="mode-clock ' + (m.accent === 'amber' ? 'text-amber-300' : 'text-zinc-200') + '">Clock in ' +
        icon('chevron-right', 'ic ic-16') + '</span>' +
        '</button>'
      );
    }).join('');

    return (
      '<div class="mode-select">' +
      '<div class="mode-select-inner">' +
      '<div class="mode-brand fade-up">' +
      '<div class="mode-brand-badge">' + icon('hard-hat', 'ic ic-20') + '</div>' +
      '<div><p class="mode-brand-kicker">Northwind Freight &amp; Logistics - training simulation</p>' +
      '<h1 class="mode-brand-title">The Hardening Yard</h1></div>' +
      '</div>' +
      '<p class="mode-intro">Master <span class="intro-strong">objective 4.1: &ldquo;Apply common security techniques to computing resources&rdquo;</span> - securing endpoints, networks, applications and data of a fictional freight company. Pick your shift. All data in this lab is synthetic training data.</p>' +
      '<div class="mode-grid">' + cards + '</div>' +
      '<p class="mode-scope">Scope note: the quoted lesson text &ldquo;Apply common security techniques to computing resources - Help secure endpoints, networks, applications, and data&rdquo; is the official objective 4.1 wording (SY0-701 objectives document; in the SY0-801/V8 document the domain was renumbered). This lab covers that objective&rsquo;s full sub-bullet area. Simplified where noted.</p>' +
      '</div></div>'
    );
  }

  // ---------- header ----------

  function renderHeader(state, score, passedCount, total) {
    return (
      '<header class="app-header" role="banner">' +
      '<div class="app-header-inner">' +
      '<div class="header-brand">' +
      '<div class="header-badge">' + icon('hard-hat', 'ic ic-16') + '</div>' +
      '<div class="min-w-0"><p class="header-kicker">Hardening Yard</p>' +
      '<h1 class="header-title">Northwind Freight &amp; Logistics <span class="header-shift">' +
      (state.mode === 'hard' ? 'night shift' : 'day shift') + '</span></h1></div>' +
      '</div>' +
      '<div class="header-stats">' +
      '<div class="header-posture" aria-label="Facility hardening posture ' + score.posturePct + ' percent">' +
      '<div class="header-posture-labels"><span>Yard posture</span><span class="text-amber-300">' + score.posturePct + '%</span></div>' +
      progress(score.posturePct, 'Hardening posture') +
      '</div>' +
      '<div class="header-counters">' +
      '<div>Work orders <span class="text-zinc-200">' + passedCount + '/' + total + '</span></div>' +
      '<div class="header-stars">' + icon('trophy', 'ic ic-12 star-trophy') + '<span class="text-zinc-200">' + score.stars + '</span><span>/5 stars</span></div>' +
      '</div>' +
      '<div class="header-actions">' +
      (passedCount === total
        ? '<button type="button" class="btn btn-outline-amber btn-sm" data-action="show-completion">Debrief out</button>'
        : '') +
      '<button type="button" class="btn btn-ghost-rose btn-sm" data-action="reset-open" aria-label="Reset the lab to pristine state">' +
      icon('rotate-ccw', 'ic ic-14') + ' Reset</button>' +
      '</div>' +
      '</div></div></header>'
    );
  }

  // ---------- navigation ----------

  var NAV_ZONES = [
    { id: 'briefing', label: 'Orientation', sub: 'briefing + core' },
    { id: 'endpoints', label: 'Endpoint Workshop' },
    { id: 'mobile', label: 'Yard Ops Deck' },
    { id: 'network', label: 'Perimeter Yard' },
    { id: 'appsdata', label: 'Data Vault & App Factory' },
    { id: 'evidence', label: 'Evidence Locker' },
    { id: 'quiz', label: 'Gate Exam' },
    { id: 'debrief', label: 'Debrief' },
  ];

  function navButton(z, state, postureByZone, variant) {
    var active = state.view === z.id;
    var posture = postureByZone[z.id];
    var cls = 'nav-btn' + (variant === 'strip' ? ' nav-btn-strip' : '') + (active ? ' nav-btn-active' : '');
    return (
      '<button type="button" class="' + cls + '" data-action="go" data-view="' + z.id + '"' +
      (active ? ' aria-current="page"' : '') + '>' +
      '<span class="nav-btn-label">' + esc(z.label) + '</span>' +
      (z.sub ? '<span class="nav-btn-sub">' + esc(z.sub) + '</span>' : '') +
      (posture !== undefined
        ? '<span class="nav-btn-posture">posture <span class="' + (posture.pct === 100 ? 'text-emerald-400' : 'text-amber-300') + '">' + posture.pct + '%</span></span>'
        : '') +
      '</button>'
    );
  }

  function renderNavStrip(state, postureByZone, passedCount, totalCount) {
    return (
      '<nav class="nav-strip" aria-label="Yard navigation">' +
      '<div class="nav-strip-inner">' +
      NAV_ZONES.map(function (z) { return navButton(z, state, postureByZone, 'strip'); }).join('') +
      '<div class="nav-strip-wo"><span class="nav-btn-label">Work orders ' + passedCount + '/' + totalCount + '</span>' +
      '<span class="nav-btn-sub">right panel on desktop</span></div>' +
      '</div></nav>'
    );
  }

  function renderRail(state, postureByZone, passedCount, totalCount) {
    return (
      '<nav aria-label="Yard navigation" class="rail">' +
      NAV_ZONES.map(function (z) { return navButton(z, state, postureByZone, 'rail'); }).join('') +
      '<div class="rail-wo"><p class="rail-wo-title">Work orders</p>' +
      '<p class="rail-wo-count"><span class="text-amber-300">' + passedCount + '</span>/' + totalCount + ' passed</p></div>' +
      '</nav>'
    );
  }

  // ---------- briefing ----------

  function renderBriefing() {
    var chainRows = DATA.KNOWLEDGE.chain
      .map(function (row) {
        return (
          '<tr><td class="chain-stage">' + esc(row.stage) + '</td>' +
          '<td class="chain-example">' + esc(row.example) + '</td>' +
          '<td class="chain-technique">' + esc(row.technique) + '</td></tr>'
        );
      })
      .join('');
    var cases = DATA.KNOWLEDGE.cases
      .map(function (c) {
        return '<li class="case-card"><p class="case-name">' + esc(c.name) + '</p><p class="case-fact">' + esc(c.fact) + '</p></li>';
      })
      .join('');
    var variants = DATA.KNOWLEDGE.variants
      .map(function (v) {
        return '<li class="variant-item"><span class="dot" aria-hidden="true"></span>' + esc(v) + '</li>';
      })
      .join('');
    var glossary = DATA.GLOSSARY
      .map(function (t) {
        return '<div class="gloss-item"><dt>' + esc(t.term) + '</dt><dd>' + esc(t.def) + '</dd></div>';
      })
      .join('');

    return (
      '<div class="stack-lg">' +
      '<section class="card briefing-card fade-up" aria-label="Scenario briefing">' +
      '<div class="card-head-amber">' + icon('factory', 'ic ic-14') +
      '<h2 class="card-title">Scenario briefing - the night the yard stood still</h2></div>' +
      '<div class="briefing-body">' +
      '<p><strong class="text-zinc-100">Northwind Freight &amp; Logistics</strong> runs a regional freight yard: two depots, a container crane, cold storage, 60 drivers with their own phones, and a customer booking portal. Last month an intruder walked the whole chain - default switch password, flat network, unvalidated upload, bulk export, and finally a stolen laptop from a truck cab. The incident report is <span class="mono-amber">DOC-02</span> in the Evidence Locker.</p>' +
      '<p>You are the newly hired <strong class="text-zinc-100">hardening engineer</strong>. Your job is the post-incident fix: apply the common security techniques of <span class="mono-amber">objective 4.1</span> across every computing resource the yard owns. The facility is simulated - every asset, log and document here is <span class="text-amber-200">synthetic training data</span>, and the goal is defensive mastery: explain each technique, recognize its absence in evidence, and apply it correctly.</p>' +
      '<p class="text-zinc-400">Certification relevance: this is a &ldquo;given a scenario&rdquo; objective - the exam hands you a broken configuration and expects the correct fix. Domain 4 (Security Operations) is the heaviest-weighted domain, and this lesson is its practical core.</p>' +
      '</div></section>' +

      '<section class="card fade-up" aria-label="Knowledge core" style="animation-delay:0.06s">' +
      '<div class="card-head-amber">' + icon('book-open', 'ic ic-14') +
      '<h2 class="card-title">Knowledge core - what, how, why</h2></div>' +
      '<p class="body-text">' + esc(DATA.KNOWLEDGE.what) + '</p>' +
      '<p class="body-text">' + esc(DATA.KNOWLEDGE.how) + '</p>' +
      '<div><h3 class="subhead">Where each technique sits in an attack chain</h3>' +
      '<div class="table-scroll"><table class="data-table">' +
      '<thead><tr><th>Chain stage</th><th>Without the technique</th><th>Technique that breaks the chain</th></tr></thead>' +
      '<tbody>' + chainRows + '</tbody></table></div></div>' +
      '<div><h3 class="subhead">Real-world anchors (documented incidents, news-level summaries)</h3>' +
      '<ul class="stack-sm">' + cases + '</ul></div>' +
      '<div><h3 class="subhead">Variants and easy-to-confuse pivots</h3>' +
      '<ul class="stack-xs">' + variants + '</ul></div>' +
      '</section>' +

      '<section class="card fade-up" aria-label="Glossary" style="animation-delay:0.12s">' +
      '<div class="card-head-amber gloss-head">' + icon('graduation-cap', 'ic ic-14') +
      '<h2 class="card-title">Yard glossary - 15 terms</h2></div>' +
      '<dl class="gloss-grid">' + glossary + '</dl>' +
      '<p class="gloss-ref">' + icon('link-2', 'ic ic-12') + ' Reference: official objective documents at comptia.org/testing/exam-objectives (opens in a new tab), also linked in the Debrief.</p>' +
      '</section>' +
      '</div>'
    );
  }

  // ---------- zone console (assets) ----------

  function assetPct(asset, envState) {
    var ok = 0;
    asset.controls.forEach(function (c) {
      var got = envState[c.id];
      var good = typeof c.good === 'boolean' ? got === c.good : Engine.norm(got) === Engine.norm(c.good);
      if (good) ok += 1;
    });
    return Math.round((ok / asset.controls.length) * 100);
  }

  function renderZone(state, zone) {
    var zoneMeta = null;
    DATA.ZONES.forEach(function (z) {
      if (z.id === zone) zoneMeta = z;
    });
    var assets = DATA.ASSETS.filter(function (a) {
      return a.zone === zone;
    });
    var cards = assets
      .map(function (asset, idx) {
        var ast = state.env[asset.id] || {};
        var pct = assetPct(asset, ast);
        var rows = asset.controls
          .map(function (c) {
            var current = ast[c.id];
            var isGood =
              typeof c.good === 'boolean'
                ? current === c.good
                : String(current).trim().toLowerCase() === String(c.good).trim().toLowerCase();
            var fid = 'ctl.' + asset.id + '.' + c.id;
            var control;
            if (c.kind === 'toggle') {
              control =
                '<button type="button" role="switch" id="' + esc(fid) + '" data-fid="' + esc(fid) + '" aria-checked="' +
                (current === true) + '" data-action="toggle" data-asset="' + esc(asset.id) + '" data-control="' + esc(c.id) +
                '" class="switch' + (current === true ? ' switch-on' : '') + '" aria-label="' + esc(c.label) + ' on ' + esc(asset.id) + '">' +
                '<span class="switch-thumb"></span></button>';
            } else {
              var opts = (c.choices || [])
                .map(function (opt) {
                  return '<option value="' + esc(opt.id) + '"' + (String(current) === String(opt.id) ? ' selected' : '') + '>' + esc(opt.label) + '</option>';
                })
                .join('');
              control =
                '<select id="' + esc(fid) + '" data-fid="' + esc(fid) + '" data-action="choice" data-asset="' + esc(asset.id) +
                '" data-control="' + esc(c.id) + '" class="select select-w64" aria-label="' + esc(c.label) + ' on ' + esc(asset.id) + '">' + opts + '</select>';
            }
            return (
              '<li class="control-row">' +
              '<div class="control-text"><div class="control-label-line">' +
              '<label for="' + esc(fid) + '" class="control-label">' + esc(c.label) + '</label>' +
              '<span aria-hidden="true" class="state-dot ' + (isGood ? 'state-good' : 'state-bad') + '"></span>' +
              '<span class="sr-only">' + (isGood ? 'hardened state' : 'not in hardened state') + '</span>' +
              '</div>' +
              '<p class="control-why">' + icon('info', 'ic ic-12 why-info') + esc(c.why) + '</p></div>' +
              control +
              '</li>'
            );
          })
          .join('');
        return (
          '<article class="asset-card fade-up" style="animation-delay:' + (idx * 0.04) + 's" aria-label="Asset ' + esc(asset.id) + '">' +
          '<div class="asset-head">' +
          '<div class="asset-title-line"><span class="mono-amber asset-id">' + esc(asset.id) + '</span>' +
          '<span class="asset-name">' + esc(asset.name) + '</span>' +
          '<span class="asset-kind">' + esc(asset.kind) + '</span></div>' +
          '<div class="asset-posture">' + progress(pct, 'Asset posture ' + pct + ' percent') +
          '<span class="asset-pct ' + (pct === 100 ? 'pct-good' : pct >= 50 ? 'pct-mid' : 'pct-bad') + '">' + pct + '%</span></div>' +
          (pct === 100
            ? '<span class="asset-flag flag-good">' + icon('shield-check', 'ic ic-14') + ' hardened</span>'
            : '<span class="asset-flag flag-bad">' + icon('shield-alert', 'ic ic-14') + ' exposure</span>') +
          '</div>' +
          '<p class="asset-note">' + esc(asset.note) + '</p>' +
          '<ul class="control-list">' + rows + '</ul>' +
          '</article>'
        );
      })
      .join('');

    return (
      '<section class="stack-md" aria-label="' + esc(zoneMeta.name) + ' console">' +
      '<div class="card zone-head">' +
      '<div class="card-head-amber">' + ZONE_ICON[zone] +
      '<h2 class="card-title">' + esc(zoneMeta.name) + '</h2>' +
      '<span class="zone-sub">' + esc(zoneMeta.sub) + '</span></div>' +
      '<p class="body-text">' + esc(DATA.ZONE_NOTE[zone]) + '</p>' +
      '</div>' +
      '<div class="stack-md">' + cards + '</div>' +
      '</section>'
    );
  }

  // ---------- evidence ----------

  function renderEvidence(state) {
    var mode = state.mode;
    var docs = DATA.EVIDENCE_DOCS
      .map(function (doc) {
        var open = state.openDoc === doc.id;
        var hl = state.highlightDoc === doc.id;
        return (
          '<div class="acc-item' + (hl ? ' acc-hl' : '') + '">' +
          '<button type="button" class="acc-trigger" data-action="acc-toggle" data-doc="' + esc(doc.id) + '" aria-expanded="' + open + '">' +
          '<span class="acc-title-line"><span class="doc-tag">' + esc(doc.tag) + '</span>' +
          '<span class="mono-amber doc-id">' + esc(doc.id) + '</span>' +
          '<span class="doc-title">' + esc(doc.title) + '</span></span>' +
          icon('chevron-down', 'ic ic-14 acc-chevron' + (open ? ' acc-chevron-open' : '')) +
          '</button>' +
          (open ? '<div class="acc-content"><pre class="doc-pre">' + esc(doc.body.join('\n')) + '</pre></div>' : '') +
          '</div>'
        );
      })
      .join('');

    return (
      '<div class="stack-md">' +
      '<section class="card" aria-label="Evidence locker">' +
      '<div class="card-head-amber">' + icon('file-search', 'ic ic-14') +
      '<h2 class="card-title">Evidence locker</h2>' +
      '<span class="zone-sub">' + (mode === 'hard' ? 'noisy - distractors included' : 'supporting documents') + '</span></div>' +
      '<p class="body-text">Five documents pulled from the yard&rsquo;s systems. Everything here is <span class="text-amber-200">synthetic training data</span> for a fictional company. Work orders that reference a document expect you to read it here first' +
      (mode === 'hard' ? ' - and to distrust what looks obvious' : '') + '.</p>' +
      '<p class="hard-notice">' + icon('alert-triangle', 'ic ic-14 notice-icon') + ' Hard-mode notice: at least two findings across these documents are red herrings. Triage, do not swallow.</p>' +
      '</section>' +
      '<div class="stack-sm">' + docs + '</div>' +
      '</div>'
    );
  }

  // ---------- exercise panel ----------

  function goDocBtn(label, view, doc, extraCls) {
    return (
      '<button type="button" class="btn btn-outline-zinc btn-sm ' + (extraCls || '') + '" data-action="go-doc" data-view="' + view + '"' +
      (doc ? ' data-doc="' + esc(doc) + '"' : '') + '>Open ' + esc(label) + ' ' + icon('arrow-right', 'ic ic-12') + '</button>'
    );
  }

  function exercisePanel(obj, mode, answer, revealed) {
    var ex = obj.exercise;
    var html = '';

    if (ex.type === 'toggles') {
      html +=
        '<div class="ex-box"><p class="ex-task"><span class="ex-task-tag">Task</span>' + esc(ex.todo) + '</p>' +
        (obj.zone
          ? '<div class="mt-3"><button type="button" class="btn btn-outline-amber btn-sm" data-action="go" data-view="' + esc(obj.zone) + '">Go to the asset console ' + icon('arrow-right', 'ic ic-12') + '</button></div>'
          : '') +
        '<p class="ex-live-note">This order is validated against the live control states in the yard - set the switches, then check here.</p></div>';
      return html;
    }

    if (ex.type === 'match') {
      var a = answer || {};
      var seed = obj.id.split('').reduce(function (s, ch) { return s + ch.charCodeAt(0); }, 0);
      var shuffledItems = Engine.stableShuffle(ex.items, seed * 131 + 7);
      var shuffledOptions = Engine.stableShuffle(ex.options, seed * 17 + 3);
      var rows = shuffledItems
        .map(function (item) {
          var sel = a[item.id] || '';
          var st;
          if (!sel) st = 'blank';
          else if (!revealed) st = 'neutral';
          else st = sel === ex.solution[item.id] ? 'correct' : 'wrong';
          var cls = 'select select-match' + (revealed ? (st === 'correct' ? ' sel-correct' : st === 'wrong' ? ' sel-wrong' : ' sel-blank') : '');
          var opts =
            '<option value="">- select -</option>' +
            shuffledOptions
              .map(function (opt) {
                return '<option value="' + esc(opt.id) + '"' + (sel === opt.id ? ' selected' : '') + '>' + esc(opt.label) + '</option>';
              })
              .join('');
          return (
            '<li class="match-row"><span class="match-label">' + esc(item.label) + '</span>' +
            '<select aria-label="Answer for: ' + esc(item.label) + '" data-fid="match.' + obj.id + '.' + item.id + '" data-action="answer-match" data-id="' + esc(obj.id) + '" data-item="' + esc(item.id) + '"' +
            (revealed ? ' disabled' : '') + ' class="' + cls + '">' + opts + '</select></li>'
          );
        })
        .join('');
      html +=
        '<div class="ex-box stack-sm"><p class="ex-prompt">' + esc(ex.prompt) + '</p>' +
        (obj.doc && mode === 'hard' ? '<div>' + goDocBtn(obj.doc, 'evidence', obj.doc) + '</div>' : '') +
        '<ul class="stack-xs">' + rows + '</ul></div>';
      return html;
    }

    if (ex.type === 'multi') {
      var arr = Array.isArray(answer) ? answer : [];
      var opts2 = ex.options
        .map(function (opt) {
          var checked = arr.indexOf(opt.id) !== -1;
          var isSolution = ex.solution.indexOf(opt.id) !== -1;
          var cls = 'multi-row';
          if (revealed && checked) cls += isSolution ? ' multi-correct' : ' multi-wrong';
          var fid = 'multi.' + obj.id + '.' + opt.id;
          return (
            '<li class="' + cls + '"><div class="multi-line">' +
            '<input type="checkbox" id="' + esc(fid) + '" data-fid="' + esc(fid) + '" data-action="answer-multi" data-id="' + esc(obj.id) + '" data-opt="' + esc(opt.id) + '"' +
            (checked ? ' checked' : '') + (revealed ? ' disabled' : '') + ' class="checkbox">' +
            '<label for="' + esc(fid) + '" class="multi-label">' + esc(opt.label) + '</label>' +
            '</div></li>'
          );
        })
        .join('');
      html +=
        '<div class="ex-box stack-sm"><div class="multi-prompt-line"><p class="ex-prompt">' + esc(ex.prompt) + '</p>' +
        goDocBtn(ex.doc, 'evidence', ex.doc, 'btn-xs') + '</div>' +
        '<ul class="stack-xs">' + opts2 + '</ul></div>';
      return html;
    }

    if (ex.type === 'radio') {
      var opts3 = ex.options
        .map(function (opt) {
          var checked = answer === opt.id;
          var isSolution = opt.id === ex.solution;
          var cls = 'radio-row';
          if (revealed && checked) cls += isSolution ? ' multi-correct' : ' multi-wrong';
          var fid = 'radio.' + obj.id + '.' + opt.id;
          return (
            '<li class="' + cls + '"><div class="multi-line">' +
            '<button type="button" role="radio" aria-checked="' + checked + '" aria-label="' + esc(opt.label) + '" data-fid="' + esc(fid) + '" data-action="answer-radio" data-id="' + esc(obj.id) + '" data-opt="' + esc(opt.id) + '"' +
            (revealed ? ' disabled' : '') + ' class="radio-dot' + (checked ? ' radio-dot-on' : '') + '"></button>' +
            '<button type="button" data-action="answer-radio" data-id="' + esc(obj.id) + '" data-opt="' + esc(opt.id) + '"' +
            (revealed ? ' disabled' : '') + ' class="radio-text">' + esc(opt.label) + '</button>' +
            '</div></li>'
          );
        })
        .join('');
      html +=
        '<div class="ex-box stack-sm"><p class="ex-prompt">' + esc(ex.prompt) + '</p>' +
        (ex.doc ? '<div>' + goDocBtn(ex.doc, 'evidence', ex.doc) + '</div>' : '') +
        '<ul class="stack-xs" role="radiogroup" aria-label="' + esc(ex.prompt) + '">' + opts3 + '</ul></div>';
      return html;
    }

    // sequence
    var seq = Array.isArray(answer) ? answer : [];
    var pool = ex.items.filter(function (i) { return seq.indexOf(i.id) === -1; });
    pool = Engine.stableShuffle(pool, obj.id.length * 977 + ex.items.length * 31);
    var itemLabel = function (id) {
      var found = null;
      ex.items.forEach(function (i) {
        if (i.id === id) found = i;
      });
      return found ? found.label : id;
    };
    var ordered = seq
      .map(function (id, i) {
        var correctPos = revealed && ex.solution[i] === id;
        var wrongPos = revealed && ex.solution[i] !== id;
        var cls = 'seq-item' + (correctPos ? ' seq-correct' : wrongPos ? ' seq-wrong' : '');
        return (
          '<li><button type="button" data-fid="seq.' + obj.id + '.' + i + '" data-action="seq-remove" data-id="' + esc(obj.id) + '" data-index="' + i + '"' +
          (revealed ? ' disabled' : '') + ' class="' + cls + '"><span class="seq-num">' + (i + 1) + '.</span>' + esc(itemLabel(id)) + '</button></li>'
        );
      })
      .join('');
    var available = pool
      .map(function (item) {
        return (
          '<li><button type="button" data-fid="pool.' + obj.id + '.' + item.id + '" data-action="seq-add" data-id="' + esc(obj.id) + '" data-item="' + esc(item.id) + '"' +
          (revealed ? ' disabled' : '') + ' class="seq-pool-item">' + esc(item.label) + '</button></li>'
        );
      })
      .join('');
    html +=
      '<div class="ex-box stack-sm"><p class="ex-prompt">' + esc(ex.prompt) + '</p>' +
      '<div><p class="ex-subhead">Your rollout order (click a step to remove it)</p>' +
      '<ol class="stack-xs seq-list" aria-label="Your ordered rollout">' + ordered + '</ol></div>' +
      '<div><p class="ex-subhead">Available steps (click to append)</p>' +
      '<ul class="stack-xs">' + available + '</ul></div></div>';
    return html;
  }

  function checkFeedback(revealed, passed, feedback) {
    if (!revealed) return '';
    return (
      '<div role="status" aria-live="polite" class="feedback ' + (passed ? 'feedback-pass' : 'feedback-fail') + '">' +
      '<div class="feedback-head">' + (passed ? icon('check-circle-2', 'ic ic-14') : icon('x-circle', 'ic ic-14')) +
      (passed ? 'PASSED - why this matters' : 'Not yet - teaching feedback') + '</div>' +
      esc(feedback) +
      (!passed
        ? '<p class="feedback-tail">Adjust your work (switches, selections or ordering) and check again. Wrong checks never block progress - they cost stars only.</p>'
        : '') +
      '</div>'
    );
  }

  function hintBar(obj, level, mode) {
    var max = mode === 'hard' ? 1 : 3;
    var shown = level > 0 ? obj.hints.slice(0, Math.min(level, obj.hints.length)) : [];
    var shownHtml = shown
      .map(function (h, i) {
        return (
          '<p class="hint-line">' + icon('sparkles', 'ic ic-12 hint-icon') +
          '<span><span class="hint-count">hint ' + (i + 1) + '/' + obj.hints.length + ':</span>' + esc(h) + '</span></p>'
        );
      })
      .join('');
    var btnText =
      mode === 'hard'
        ? level >= 1
          ? 'Nudge used'
          : 'Use the one nudge (costs score)'
        : level >= max
          ? 'No more hints'
          : 'Reveal hint ' + (level + 1) + ' of ' + max;
    var exhausted = level >= max;
    return (
      '<div class="stack-xs">' +
      (shown.length > 0 ? '<div class="hint-box" aria-live="polite">' + shownHtml + '</div>' : '') +
      '<div><button type="button" class="btn btn-ghost-amber btn-xs" data-action="hint" data-id="' + esc(obj.id) + '"' +
      (exhausted ? ' disabled' : '') + '>' + icon('sparkles', 'ic ic-12') + ' ' + btnText + '</button></div>' +
      '</div>'
    );
  }

  // ---------- ledger ----------

  function exPanelShowsNoDoc(obj) {
    var ex = obj.exercise;
    if (ex.type === 'multi') return false;
    if (ex.type === 'radio') return false;
    if (ex.type === 'toggles') return !!obj.doc;
    return true;
  }

  function renderLedger(state) {
    var mode = state.mode;
    var objectives = Engine.objectivesFor(mode);
    var passedCount = objectives.filter(function (o) {
      return state.checks[o.id] && state.checks[o.id].passed;
    }).length;

    var items = objectives
      .map(function (obj) {
        var check = state.checks[obj.id];
        var revealed = check ? check.revealed !== false : false;
        var open = state.openObjective === obj.id;
        var hintLevel = state.hints[obj.id] || 0;
        var maxHints = mode === 'hard' ? 1 : 3;
        var cls = 'ledger-item' + (check && check.passed ? ' ledger-passed' : open ? ' ledger-open' : '');

        var body = '';
        if (open) {
          var hasInlineAnswer = obj.exercise.type !== 'toggles';
          body =
            '<div class="ledger-body">' +
            '<p class="ledger-brief">' + esc(obj.brief) + '</p>' +
            (mode === 'medium'
              ? '<p class="where-to-look">' + icon('crosshair', 'ic ic-12 wtl-icon') + '<span><span class="wtl-tag">where to look:</span>' + esc(obj.location) + '</span></p>'
              : '') +
            exercisePanel(obj, mode, state.answers[obj.id], revealed) +
            (obj.doc && exPanelShowsNoDoc(obj)
              ? '<p class="evidence-ref">' + icon('file-text', 'ic ic-12') + ' Evidence: ' + esc(obj.doc) + ' in the Evidence Locker.</p>'
              : '') +
            hintBar(obj, hintLevel, mode) +
            '<div class="ledger-actions">' +
            (hasInlineAnswer && revealed
              ? '<button type="button" class="btn btn-outline-zinc btn-sm" data-action="retake" data-id="' + esc(obj.id) + '">' + icon('rotate-ccw', 'ic ic-14') + ' Start a new attempt</button>'
              : '<button type="button" class="btn btn-primary btn-sm" data-action="check" data-id="' + esc(obj.id) + '">' + icon('clipboard-check', 'ic ic-14') + ' Check results</button>') +
            '</div>' +
            (check && revealed ? checkFeedback(true, check.passed, obj.feedback) : '') +
            '</div>';
        }

        return (
          '<article class="' + cls + '">' +
          '<button type="button" class="ledger-trigger" data-action="toggle-obj" data-id="' + esc(obj.id) + '" aria-expanded="' + open + '">' +
          (check && check.passed
            ? icon('check-circle-2', 'ic ic-14 ledger-icon-pass')
            : icon('circle-dashed', 'ic ic-14 ' + (check ? 'ledger-icon-fail' : 'ledger-icon-idle'))) +
          '<span class="ledger-main"><span class="ledger-id-line"><span class="mono-amber ledger-id">' + esc(obj.id) + '</span>' +
          pillarBadge(obj.pillar) + '</span>' +
          '<span class="ledger-title">' + esc(obj.title) + '</span></span>' +
          icon('chevron-down', 'ic ic-14 acc-chevron' + (open ? ' acc-chevron-open' : '')) +
          '</button>' +
          body +
          '</article>'
        );
      })
      .join('');

    var allPassed = objectives.every(function (o) {
      return state.checks[o.id] && state.checks[o.id].passed;
    });
    var banner = '';
    if (allPassed) {
      banner =
        '<div class="all-passed-box"><p class="all-passed-text">All work orders passed. ' +
        (state.quizSubmitted ? 'Head to the debrief out above.' : 'Now clear the Gate Exam (quiz) to clock out.') +
        '</p>' +
        (!state.quizSubmitted
          ? '<button type="button" class="btn btn-primary btn-sm mt-2" data-action="go" data-view="quiz">Go to the Gate Exam</button>'
          : '') +
        '</div>';
    }

    return (
      '<section class="stack-sm" aria-label="Work orders - objectives tracker">' +
      '<div class="ledger-head"><h2 class="ledger-heading">Work orders - objectives tracker</h2>' +
      '<span class="ledger-count">' + passedCount + '/' + objectives.length + '</span></div>' +
      items +
      banner +
      '</section>'
    );
  }

  // ---------- quiz ----------

  function renderQuiz(state) {
    var mode = state.mode;
    var items = Quiz.quizItems(mode);
    var answered = Quiz.answeredCount(items, state.quizAnswers);
    var allAnswered = answered === items.length;
    var correct = Quiz.correctCount(items, state.quizAnswers);

    var cards = items
      .map(function (q, idx) {
        var picked = state.quizAnswers[q.id];
        var isCorrect = picked === q.answer;
        var cardCls = 'card quiz-card' + (state.quizSubmitted ? (isCorrect ? ' quiz-card-pass' : ' quiz-card-fail') : '');
        var opts = q.options
          .map(function (opt) {
            var checked = picked === opt.id;
            var cls = 'radio-row';
            if (state.quizSubmitted && checked) cls += isCorrect ? ' multi-correct' : ' multi-wrong';
            var fid = 'quiz.' + q.id + '.' + opt.id;
            return (
              '<li class="' + cls + '"><div class="multi-line">' +
              '<button type="button" role="radio" aria-checked="' + checked + '" aria-label="' + esc(opt.label) + '" data-fid="' + esc(fid) + '" data-action="quiz-answer" data-qid="' + esc(q.id) + '" data-opt="' + esc(opt.id) + '"' +
              (state.quizSubmitted ? ' disabled' : '') + ' class="radio-dot' + (checked ? ' radio-dot-on' : '') + '"></button>' +
              '<button type="button" data-action="quiz-answer" data-qid="' + esc(q.id) + '" data-opt="' + esc(opt.id) + '"' +
              (state.quizSubmitted ? ' disabled' : '') + ' class="radio-text">' + esc(opt.label) + '</button>' +
              '</div></li>'
            );
          })
          .join('');
        var explain = '';
        if (state.quizSubmitted) {
          var answerLabel = '';
          q.options.forEach(function (o) {
            if (o.id === q.answer) answerLabel = o.label;
          });
          explain =
            '<div role="status" aria-live="polite" class="feedback ' + (isCorrect ? 'feedback-pass' : 'feedback-fail') + '">' +
            '<div class="feedback-head">' + (isCorrect ? icon('check-circle-2', 'ic ic-14') : icon('x-circle', 'ic ic-14')) +
            (isCorrect ? 'Correct' : 'Incorrect - the answer is: ' + esc(answerLabel)) + '</div>' +
            esc(q.explain) + '</div>';
        }
        return (
          '<section class="' + cardCls + '" aria-label="Question ' + (idx + 1) + '">' +
          '<div class="quiz-q-line"><span class="quiz-q-num">Q' + (idx + 1) + '</span>' +
          '<p class="quiz-q-text">' + esc(q.q) + '</p></div>' +
          '<ul class="stack-xs" role="radiogroup" aria-label="' + esc(q.q) + '">' + opts + '</ul>' +
          explain +
          '</section>'
        );
      })
      .join('');

    var submitArea;
    if (!state.quizSubmitted) {
      submitArea =
        '<div class="quiz-submit-row">' +
        '<button type="button" class="btn btn-primary btn-lg" data-action="quiz-submit"' + (allAnswered ? '' : ' disabled') + '>Submit gate exam</button>' +
        (!allAnswered ? '<p class="quiz-submit-note">' + icon('info', 'ic ic-14') + ' Answer all ' + items.length + ' questions to submit.</p>' : '') +
        '</div>';
    } else {
      submitArea =
        '<div class="all-passed-box quiz-result"><p class="quiz-result-title">Gate result: ' + correct + '/' + items.length + ' correct.</p>' +
        '<p class="quiz-result-sub">' +
        (correct === items.length
          ? 'Flawless. The debrief below consolidates the whole objective - give it a slow read.'
          : 'Read every explanation above once more, then continue to the debrief. Consider a reset later to test first-try mastery.') +
        '</p></div>';
    }

    return (
      '<div class="stack-md">' +
      '<section class="card" aria-label="Gate exam">' +
      '<div class="card-head-amber">' + icon('shield-question', 'ic ic-14') +
      '<h2 class="card-title">Gate exam - clock-out quiz</h2>' +
      '<span class="zone-sub">' + (mode === 'hard' ? 'scenario application' : 'concept check') + '</span></div>' +
      '<p class="body-text">' +
      (mode === 'hard'
        ? 'Seven scenario items. Each asks you to APPLY the right technique to a concrete situation - recall alone will not pass this gate. Explanations appear after submission.'
        : 'Six concept questions. Answer honestly, submit, and read every explanation - each one is part of the lesson. You can retake by resetting, but first-try accuracy drives your stars.') +
      '</p>' +
      '<p class="quiz-counter">answered <span class="text-amber-300">' + answered + '</span>/' + items.length + '</p>' +
      '</section>' +
      cards +
      submitArea +
      '</div>'
    );
  }

  // ---------- debrief ----------

  function renderDebrief(state, score) {
    var mode = state.mode;
    var detections = DATA.DEBRIEF.detections
      .map(function (d) {
        return '<tr><td class="det-source">' + esc(d.source) + '</td><td class="det-logic">' + esc(d.logic) + '</td></tr>';
      })
      .join('');
    var mitigations = DATA.DEBRIEF.mitigations
      .map(function (m) {
        return '<li class="mit-item"><p class="mit-id">' + esc(m.id) + '</p><p class="mit-rec">' + esc(m.rec) + '</p></li>';
      })
      .join('');
    var blue = DATA.DEBRIEF.blueTeam
      .map(function (t) {
        return '<li class="variant-item"><span class="dot dot-zinc" aria-hidden="true"></span>' + esc(t) + '</li>';
      })
      .join('');
    var red = DATA.DEBRIEF.redTeam
      .map(function (t) {
        return '<li class="variant-item"><span class="dot dot-rose" aria-hidden="true"></span>' + esc(t) + '</li>';
      })
      .join('');
    var links = DATA.DEBRIEF.links
      .map(function (l) {
        return (
          '<li><a href="' + esc(l.url) + '" target="_blank" rel="noopener noreferrer" class="ext-link">' +
          esc(l.label) + ' ' + icon('external-link', 'ic ic-12') + '</a></li>'
        );
      })
      .join('');

    return (
      '<div class="stack-md">' +
      '<section class="card" aria-label="Debrief">' +
      '<div class="card-head-amber">' + icon('flag', 'ic ic-14') +
      '<h2 class="card-title">Debrief - field notes</h2></div>' +
      '<p class="body-text">The whole objective on one page: where to detect it, what to deploy, and what both sides of the house know. Score snapshot: ' +
      score.objectivesPassed + '/' + score.objectivesTotal + ' work orders, quiz ' + score.quizCorrect + '/' + score.quizTotal + ', ' + score.stars + '/5 stars.</p>' +
      '</section>' +

      '<section class="card" aria-label="Detection opportunities">' +
      '<div class="card-head-teal">' + icon('radar', 'ic ic-14') +
      '<h3 class="card-subtitle">Detection opportunities - data source, example logic</h3></div>' +
      '<div class="table-scroll"><table class="data-table">' +
      '<thead><tr><th>Data source</th><th>Example detection logic</th></tr></thead>' +
      '<tbody>' + detections + '</tbody></table></div>' +
      '</section>' +

      '<section class="card" aria-label="Mitigation recommendations">' +
      '<div class="card-head-emerald">' + icon('wrench', 'ic ic-14') +
      '<h3 class="card-subtitle">Mitigation recommendations - mapped to objective 4.1 bullets</h3></div>' +
      '<p class="mit-note">Reference IDs are the official sub-bullets of the chosen input (&ldquo;Apply common security techniques to computing resources&rdquo;). This is a certification chapter - there are no MITRE M-IDs to cite here; for countermeasure-level mappings see MITRE D3FEND (link below).</p>' +
      '<ul class="stack-sm">' + mitigations + '</ul>' +
      '</section>' +

      '<div class="grid-2">' +
      '<section class="card" aria-label="Blue team takeaways">' +
      '<div class="card-head-plain">' + icon('shield', 'ic ic-14') +
      '<h3 class="card-subtitle">Blue-team takeaways</h3></div>' +
      '<ul class="stack-sm">' + blue + '</ul></section>' +
      '<section class="card" aria-label="Red team mindset takeaways">' +
      '<div class="card-head-rose">' + icon('swords', 'ic ic-14') +
      '<h3 class="card-subtitle">Red-team mindset (defensive use)</h3></div>' +
      '<ul class="stack-sm">' + red + '</ul></section>' +
      '</div>' +

      '<section class="card" aria-label="Official references">' +
      '<h3 class="card-subtitle refs-title">Official references (new tab)</h3>' +
      '<ul class="stack-xs">' + links + '</ul>' +
      '</section>' +
      '</div>'
    );
  }

  // ---------- completion modal ----------

  function renderCompletion(state, score) {
    if (!state.completionOpen) return '';
    var mode = state.mode;
    var objectives = Engine.objectivesFor(mode);
    var quizItems = Quiz.quizItems(mode);
    var checks = state.checks;

    var byPillar = {};
    ['P1', 'P2', 'P3', 'P4'].forEach(function (p) {
      byPillar[p] = { total: 0, passed: 0, firstTry: 0 };
    });
    objectives.forEach(function (o) {
      byPillar[o.pillar].total += 1;
      if (checks[o.id] && checks[o.id].passed) byPillar[o.pillar].passed += 1;
      if (checks[o.id] && checks[o.id].firstTry) byPillar[o.pillar].firstTry += 1;
    });

    // R8: focus areas derived from THIS student's actual evidence
    var hintBudget = Math.ceil(objectives.length / 4);
    var focusAreas = [];

    var retried = objectives.filter(function (o) {
      return checks[o.id] && !checks[o.id].firstTry;
    });
    if (retried.length > 0) {
      focusAreas.push(
        'Work orders needed a retry: ' +
          retried
            .slice(0, 3)
            .map(function (o) { return o.id + ' (' + o.title + ')'; })
            .join('; ') +
          '. Re-work these on the Debrief page until the technique is automatic.'
      );
    }

    ['P1', 'P2', 'P3', 'P4'].forEach(function (p) {
      var s = byPillar[p];
      if (s.total > 0 && s.firstTry < s.total) {
        focusAreas.push(
          PILLAR_META[p].label + ': ' + (s.total - s.firstTry) + ' of ' + s.total +
            ' work orders were not solved first-try - revise this pillar\u2019s techniques before the exam.'
        );
      }
    });

    var missedQuiz = quizItems.filter(function (q) {
      return state.quizAnswers[q.id] !== q.answer;
    });
    if (missedQuiz.length > 0) {
      focusAreas.push(
        'Gate exam misses: ' +
          missedQuiz
            .slice(0, 3)
            .map(function (q) { return q.id; })
            .join(', ') +
          ' - re-read the explanations on the Gate Exam page and the matching Debrief rows.'
      );
    }

    var hinted = objectives.filter(function (o) {
      return (state.hints[o.id] || 0) > 0;
    });
    if (hinted.length > hintBudget) {
      focusAreas.push(
        'Hints were used on ' + hinted.length + ' work orders (budget ~' + hintBudget +
          ') - drill these objectives until no nudge is needed: ' +
          hinted
            .slice(0, 4)
            .map(function (o) { return o.id; })
            .join(', ') + '.'
      );
    }

    var cleanRun = focusAreas.length === 0;

    var nextSteps =
      mode === 'medium'
        ? [
            'Re-run the lab in Night Shift (Hard) mode - same yard, noisy evidence, exact answers.',
            'Take a full SY0 practice exam focusing on Domain 4 performance-based questions.',
            'Read the Debrief page detection table and try mapping each row to a tool your own organization runs.',
          ]
        : [
            'Teach-back: explain all five chain stages of DOC-02 and the technique for each, out loud, in under three minutes.',
            'Continue to objective 4.2 (asset management) - it feeds the baseline work you just did.',
            'Map the Debrief detection table to real detections (SIEM rules, MDM compliance, CSPM) in a home lab.',
          ];

    var pillarRows = ['P1', 'P2', 'P3', 'P4']
      .map(function (p) {
        var s = byPillar[p];
        var meta = PILLAR_META[p];
        return (
          '<li class="pillar-row"><span class="' + meta.cls + '">' + meta.label + '</span>' +
          '<span class="pillar-counts">' + (s ? s.passed : 0) + '/' + (s ? s.total : 0) + ' passed &middot; ' + (s ? s.firstTry : 0) + ' first try</span></li>'
        );
      })
      .join('');

    var focusHtml = cleanRun
      ? '<p class="focus-clean">No weak areas detected: every work order passed first-try, the gate exam is flawless and no hints were needed. Keep the momentum - the next steps below are stretch goals, not remediation.</p>'
      : '<ul class="stack-xs">' +
        focusAreas
          .map(function (f) {
            return '<li class="variant-item"><span class="dot" aria-hidden="true"></span>' + esc(f) + '</li>';
          })
          .join('') +
        '</ul>';

    var nextHtml = nextSteps
      .map(function (n) {
        return '<li class="variant-item"><span class="dot" aria-hidden="true"></span>' + esc(n) + '</li>';
      })
      .join('');

    return (
      '<div class="overlay" data-action="completion-backdrop" role="presentation">' +
      '<div class="dialog completion-dialog" role="dialog" aria-modal="true" aria-labelledby="completion-title">' +
      '<button type="button" class="dialog-x" data-action="completion-close" aria-label="Close">&#215;</button>' +
      '<div class="dialog-head">' +
      '<h2 class="dialog-title" id="completion-title">' + icon('party-popper', 'ic ic-16 text-amber-300') + ' Shift complete - you hardened the yard</h2>' +
      '<p class="dialog-desc">Every work order passed and the gate exam is submitted. Objective 4.1 is yours: you can explain the techniques, recognize their absence in evidence, and apply them to real resources.</p>' +
      '</div>' +
      '<div class="stack-md">' +
      '<div class="stars-row" aria-label="' + score.stars + ' of 5 stars">' + starsRow(score.stars) + '</div>' +
      '<p class="stars-caption">' + score.objectivesPassed + '/' + score.objectivesTotal + ' work orders passed (' + score.firstTryRate + '% first try) &middot; quiz ' +
      score.quizCorrect + '/' + score.quizTotal + ' &middot; ' + score.hintUses + ' hint' + (score.hintUses === 1 ? '' : 's') + ' used.<br>Stars = first-attempt accuracy and hint discipline.</p>' +
      '<div class="recap-box">' +
      '<p class="recap-title">' + icon('trophy', 'ic ic-12 recap-trophy') + ' objective recap by mastery pillar</p>' +
      '<ul class="stack-xs">' + pillarRows + '</ul></div>' +
      '<div class="focus-box"><p class="focus-title">Focus areas - from your own run</p>' + focusHtml + '</div>' +
      '<div class="next-box"><p class="next-title">What to learn next</p><ul class="stack-xs">' + nextHtml + '</ul></div>' +
      '<div class="dialog-actions">' +
      '<button type="button" class="btn btn-outline-zinc" data-action="reset-open">' + icon('rotate-ccw', 'ic ic-14') + ' Reset for another shift</button>' +
      '<button type="button" class="btn btn-primary" data-action="completion-debrief">Read the debrief</button>' +
      '</div>' +
      '</div></div></div>'
    );
  }

  // ---------- reset dialog ----------

  function renderResetDialog(state) {
    if (!state.resetOpen) return '';
    return (
      '<div class="overlay" data-action="reset-backdrop" role="presentation">' +
      '<div class="dialog reset-dialog" role="alertdialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-desc">' +
      '<div class="dialog-head">' +
      '<h2 class="dialog-title" id="reset-title">Reset the yard?</h2>' +
      '<p class="dialog-desc" id="reset-desc">This wipes all progress - control states, checked work orders, quiz answers and hints - and returns the lab to its pristine state. This cannot be undone.</p>' +
      '</div>' +
      '<div class="dialog-actions">' +
      '<button type="button" class="btn btn-outline-zinc" data-action="reset-cancel">Keep working</button>' +
      '<button type="button" class="btn btn-rose" data-action="reset-confirm">Reset everything</button>' +
      '</div></div></div>'
    );
  }

  // ---------- root render ----------

  function render(state) {
    if (!state.mode) {
      return renderModeSelect();
    }
    var Engine2 = Engine;
    var posture = Engine2.computePosture(state.env);
    var score = Engine2.computeScore(state.mode, state);
    var objectives = Engine2.objectivesFor(state.mode);
    var passedCount = score.objectivesPassed;
    var total = objectives.length;

    var main = '';
    switch (state.view) {
      case 'briefing':
        main = renderBriefing();
        break;
      case 'endpoints':
      case 'mobile':
      case 'network':
      case 'appsdata':
        main = renderZone(state, state.view);
        break;
      case 'evidence':
        main = renderEvidence(state);
        break;
      case 'quiz':
        main = renderQuiz(state);
        break;
      case 'debrief':
        main = renderDebrief(state, score);
        break;
    }

    var header = renderHeader(
      state,
      {
        posturePct: posture.pct,
        stars: score.stars,
      },
      passedCount,
      total
    );

    return (
      '<div class="app-shell">' +
      header +
      renderNavStrip(state, posture.byZone, passedCount, total) +
      '<div class="page-body">' +
      '<div class="page-grid">' +
      '<aside class="rail-aside"><div class="rail-sticky">' +
      renderRail(state, posture.byZone, passedCount, total) +
      '</div></aside>' +
      '<main aria-label="Yard console" class="console">' + main + '</main>' +
      '<aside class="ledger-aside"><div class="ledger-sticky">' + renderLedger(state) + '</div></aside>' +
      '</div></div>' +
      renderCompletion(state, score) +
      renderResetDialog(state) +
      '</div>'
    );
  }

  window.LabUI = { render: render, esc: esc };
})();
