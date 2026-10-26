/* ═══════════════════════════════════════════════════════════════════════════
   CyberLab static port — APP (js/app.js)
   Bootstrap + event wiring + station renderers. Parity port of lab-root.tsx,
   shell.tsx and stations-a/b/c/d.tsx:
     mode select → case banner → phase rail → stations → duty roster → quiz
     glossary / reset / completion dialogs
     focus + scroll preservation across re-renders
   No nav bar, no footer (original D4). Zero network calls at runtime — the
   only external links are the user-clicked reference links in Field Notes.
   ═══════════════════════════════════════════════════════════════════════════ */

(function (global) {
  'use strict';

  const LAB = global.LAB;
  const UI = global.LabUI;
  const Store = global.LabStore;
  const Obj = global.LabObjectives;
  const Quiz = global.LabQuiz;
  const esc = UI.esc;
  const icon = UI.icon;

  const root = document.getElementById('app');
  const dialogRoot = document.getElementById('dialog-root');
  const announcer = document.getElementById('station-announcer');

  /* runtime UI state (not persisted) */
  const app = {
    glossaryOpen: false,
    resetOpen: false,
    completeOpen: false,
    rosterOpen: false,          // mobile roster collapsed by default (parity)
    lastStation: null,
    glossaryFk: 'glossary-btn', // trigger data-fk keys (elements get detached by re-renders)
    resetFk: 'reset-btn',
    completionFk: null,
  };

  /* ─────────────────────────── tiny helpers ─────────────────────────────── */

  function findIn(list, id) {
    for (const item of list) if (item.id === id) return item;
    return null;
  }

  function findObjective(id) {
    return findIn(LAB.OBJECTIVES, id);
  }

  function objState(state, id) {
    return state.obj[id];
  }

  function cssAttrEscape(s) {
    return String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  /* ───────────────────────────── MODE SELECT ────────────────────────────── */

  function renderModeSelect(state) {
    const hasSave = !!Store.getSaved();
    let h = '<div class="mode-wrap">';
    h += '<p class="mode-kicker">CyberLab · CompTIA CySA+ CS0-003 · Lesson 9.1</p>';
    h += '<h1 class="mode-title">Analyzing Incident Response <span class="text-amber">Activities</span></h1>';
    h += '<p class="mode-sub">One live case — <strong class="text-zinc-200">' + esc(LAB.CASE.org) + '</strong>, ransomware on the payment server. You are the Incident Response Coordinator. Choose your deployment posture: everything is simulated, everything is teachable, and your progress saves in this browser.</p>';

    if (hasSave) {
      h += '<div class="resume">'
        + '<p>An unfinished deployment was found in this browser.</p>'
        + '<button type="button" class="btn btn-amber" data-action="resume" aria-label="Resume saved lab" data-fk="resume-btn">Resume where you left off</button>'
        + '</div>';
    }

    h += '<div class="mode-grid">';
    ['medium', 'hard'].forEach(function (key, i) {
      const card = LAB.MODE_CARDS[key];
      const isHard = key === 'hard';
      h += '<button type="button" class="mode-card ' + (isHard ? 'mode-card-rose' : 'mode-card-amber') + ' anim-pop" style="animation-delay:' + (0.1 + i * 0.1) + 's"'
        + ' data-action="pick-mode" data-mode="' + key + '"'
        + ' aria-label="Select ' + esc(card.title) + ' mode: ' + esc(card.sub) + '">';
      h += '<span class="mode-card-head"><span class="mode-icon ' + (isHard ? 'mode-icon-rose' : 'mode-icon-amber') + '">' + icon(card.icon, 'ic ic-22') + '</span>';
      h += '<span><span class="mode-name">' + esc(card.title) + '</span>';
      h += '<span class="mode-sublabel ' + (isHard ? 'mode-sublabel-rose' : 'mode-sublabel-amber') + '">' + esc(card.sub) + '</span></span></span>';
      h += '<ul class="mode-bullets">';
      card.bullets.forEach(function (b) {
        h += '<li>' + icon('check-circle-2', 'ic ic-14 ' + (isHard ? 'ic-rose' : 'ic-amber')) + esc(b) + '</li>';
      });
      h += '</ul>';
      h += '<p class="mode-cta ' + (isHard ? 'mode-cta-rose' : 'mode-cta-amber') + '">deploy ' + esc(card.title) + ' <span aria-hidden="true">→</span></p>';
      h += '</button>';
    });
    h += '</div>';

    h += '<p class="mode-legal">TRAINING SIMULATION — all hosts, users, domains and logs are synthetic. Defensive/educational use only. ATT&amp;CK IDs verified against attack.mitre.org at build time.</p>';
    h += '</div>';
    return h;
  }

  /* ───────────────────────────── CASE BANNER ────────────────────────────── */

  function renderBanner(state, score) {
    let h = '<header class="banner">';
    h += '<div class="banner-inner">';
    h += '<div class="banner-left">';
    h += '<span class="banner-dot" aria-hidden="true"><span class="banner-dot-ping"></span><span class="banner-dot-core"></span></span>';
    h += '<div class="banner-titles">';
    h += '<p class="banner-main">' + esc(LAB.CASE.org) + ' · CASE ' + esc(LAB.CASE.id) + ' “' + esc(LAB.CASE.codename) + '”</p>';
    h += '<p class="banner-sub">CS0-003 · L9.1 · ' + (state.mode === 'hard' ? 'Live Fire' : 'Guided Response') + ' · ' + esc(LAB.CASE.classification) + '</p>';
    h += '</div></div>';
    h += '<div class="banner-right">';
    h += '<div class="banner-progress">'
      + '<div class="bp-labels"><span>' + score.passedCount + '/' + score.totalCount + ' OBJ</span><span class="bp-pct">' + score.pct + '%</span></div>'
      + '<div class="bp-bar" role="progressbar" aria-label="Objectives progress: ' + score.passedCount + ' of ' + score.totalCount + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + (score.totalCount ? Math.round((score.passedCount / score.totalCount) * 100) : 0) + '">'
      + '<div class="bp-fill" style="width:' + (score.totalCount ? (score.passedCount / score.totalCount) * 100 : 0) + '%"></div></div>'
      + '</div>';
    h += '<button type="button" class="btn btn-outline btn-sm" data-action="open-glossary" id="glossary-trigger" data-fk="glossary-btn" aria-label="Open glossary">' + icon('book-open', 'ic ic-btn') + '<span class="hide-sm">Glossary</span></button>';
    h += '<button type="button" class="btn btn-outline btn-sm btn-reset" data-action="reset-request" data-fk="reset-btn" aria-label="Reset lab progress">' + icon('rotate-ccw', 'ic ic-btn') + '<span class="hide-sm">Reset</span></button>';
    h += '</div></div></header>';
    return h;
  }

  /* ───────────────────────────── PHASE RAIL ─────────────────────────────── */

  function stationProgressMap(state, mode) {
    const map = {};
    LAB.OBJECTIVES.forEach(function (o) {
      if (o.mode !== mode) return;
      const cur = map[o.station] || { passed: 0, total: 0 };
      cur.total += 1;
      if (state.obj[o.id] && state.obj[o.id].passed) cur.passed += 1;
      map[o.station] = cur;
    });
    return map;
  }

  function recommendedStation(mode, progMap) {
    if (!mode || mode === 'hard') return null; // free-roam: no spoon-feeding
    for (const s of LAB.STATIONS) {
      if (s.id === 'case') continue;
      const prog = progMap[s.id];
      if (prog && prog.passed < prog.total) return s.id;
    }
    return 'quiz';
  }

  function renderRail(state, progMap, recommended) {
    const current = state.station;
    let h = '<nav class="rail" aria-label="Incident response lifecycle stations">';

    /* desktop: vertical rail */
    h += '<ol class="rail-list">';
    LAB.STATIONS.forEach(function (s) {
      const active = current === s.id;
      const prog = progMap[s.id] || { passed: 0, total: 0 };
      const done = prog.total > 0 && prog.passed === prog.total;
      h += '<li><button type="button" class="rail-item' + (active ? ' rail-active' : '') + '"'
        + ' data-action="goto" data-station="' + s.id + '" data-fk="rail-' + s.id + '"'
        + (active ? ' aria-current="true"' : '') + '>';
      h += icon(s.icon, 'ic ic-16 rail-ic' + (active ? ' rail-ic-active' : ''));
      h += '<span class="rail-label"><span class="rail-num">' + s.n + '</span>' + esc(s.label) + '</span>';
      if (prog.total > 0) {
        h += '<span class="rail-count' + (done ? ' rail-done' : '') + '">' + (done ? '✓' : prog.passed + '/' + prog.total) + '</span>';
      }
      if (recommended === s.id && !active) {
        h += '<span class="rail-next">NEXT</span>';
      }
      h += '</button></li>';
    });
    h += '</ol>';

    /* mobile / tablet: horizontal chips */
    h += '<div class="chips">';
    LAB.STATIONS.forEach(function (s) {
      const active = current === s.id;
      const prog = progMap[s.id] || { passed: 0, total: 0 };
      const done = prog.total > 0 && prog.passed === prog.total;
      h += '<button type="button" class="chip' + (active ? ' chip-active' : '') + '"'
        + ' data-action="goto" data-station="' + s.id + '" data-fk="chip-' + s.id + '"'
        + (active ? ' aria-current="true"' : '') + '>';
      h += icon(s.icon, 'ic ic-14') + esc(s.label);
      if (prog.total > 0) {
        h += '<span class="rail-count' + (done ? ' rail-done' : '') + '">' + (done ? '✓' : prog.passed + '/' + prog.total) + '</span>';
      }
      h += '</button>';
    });
    h += '</div>';

    h += '</nav>';
    return h;
  }

  /* ───────────────────────────── DUTY ROSTER ────────────────────────────── */

  function renderRoster(state) {
    const mode = state.mode;
    const objectives = LAB.OBJECTIVES.filter(function (o) { return o.mode === mode; });
    const passed = objectives.filter(function (o) { return state.obj[o.id] && state.obj[o.id].passed; }).length;
    const allPassed = passed === objectives.length;
    const quiz = mode === 'hard' ? LAB.QUIZ_HARD : LAB.QUIZ_MEDIUM;
    const quizAnswered = quiz.filter(function (q) { return state.quiz.answers[q.id] !== undefined; }).length;
    const allQuiz = quizAnswered === quiz.length && quiz.length > 0;
    const ready = allPassed && allQuiz;

    let h = '<aside class="roster" aria-label="Duty roster — objectives tracker">';
    h += '<button type="button" class="roster-head" data-action="roster-toggle" aria-expanded="' + (app.rosterOpen ? 'true' : 'false') + '" data-fk="roster-head">';
    h += '<span class="roster-head-label">' + icon('clipboard-list', 'ic ic-btn ic-amber') + ' Duty roster</span>';
    h += '<span class="roster-head-right"><span class="roster-count' + (allPassed ? ' rail-done' : '') + '">' + passed + '/' + objectives.length + '</span>';
    h += '<span class="roster-toggle-txt">' + (app.rosterOpen ? 'hide ▲' : 'show ▼') + '</span></span>';
    h += '</button>';

    h += '<div class="roster-body' + (app.rosterOpen ? ' roster-open' : '') + '">';
    h += '<div class="roster-scroll">';
    LAB.STATIONS.forEach(function (s) {
      if (s.id === 'case') return;
      const list = objectives.filter(function (o) { return o.station === s.id; });
      if (list.length === 0) return;
      h += '<div class="roster-group">';
      h += '<p class="roster-group-label"><span class="roster-group-num">' + s.n + '</span>' + esc(s.label) + '</p>';
      h += '<ul>';
      list.forEach(function (o) {
        const st = objState(state, o.id);
        const isPassed = !!(st && st.passed);
        const pillar = LAB.PILLAR_META[o.pillar];
        h += '<li><button type="button" class="roster-item" data-action="goto" data-station="' + o.station + '" data-fk="roster-item-' + o.id + '" aria-label="Go to objective ' + esc(o.id) + ': ' + esc(o.title) + '">';
        h += isPassed ? icon('check-circle-2', 'ic ic-16 ic-emerald') : icon('circle', 'ic ic-16 ic-faint');
        h += '<span class="roster-item-text"><span class="roster-item-badges">';
        h += '<span class="roster-item-id' + (isPassed ? ' ic-emerald' : '') + '">' + o.id + '</span>';
        h += '<span class="badge badge-xs ' + pillar.cls + '">' + pillar.label + '</span>';
        h += '</span>';
        h += '<span class="roster-item-title' + (isPassed ? ' roster-item-done' : '') + '">' + esc(o.title) + '</span>';
        h += '</span></button></li>';
      });
      h += '</ul></div>';
    });
    h += '<div class="roster-quiz"><span>knowledge check</span><span class="' + (allQuiz ? 'ic-emerald' : '') + '">' + quizAnswered + '/' + quiz.length + '</span></div>';
    h += '</div>';

    h += '<div class="roster-cta-wrap">';
    h += '<button type="button" class="btn roster-cta' + (ready ? ' btn-emerald' : ' btn-zinc') + '"'
      + ' data-action="open-completion"' + (ready ? '' : ' disabled')
      + ' data-completion-trigger data-fk="complete-roster-btn"'
      + ' aria-label="Complete the lab and see your rating">';
    h += icon('trophy', 'ic ic-btn') + (ready ? 'CLOSE THE INCIDENT' : allPassed ? 'FINISH THE QUIZ FIRST' : 'VERIFY ALL OBJECTIVES FIRST');
    h += '</button></div>';

    h += '</div></aside>';
    return h;
  }

  /* ───────────────────────────── STATIONS ───────────────────────────────── */

  function stationCase(state) {
    const mode = state.mode;
    const modeObjs = LAB.OBJECTIVES.filter(function (o) { return o.mode === mode; });
    const total = modeObjs.length;
    const passed = modeObjs.filter(function (o) { return state.obj[o.id] && state.obj[o.id].passed; }).length;

    let h = UI.stationHeader('00', 'Case File · IR-2317 “BLACKROUTE”', LAB.CASE.classification, '');
    h += '<div class="case-grid">';
    h += '<div class="case-col">';
    h += UI.paperTag('Organization', 'fictional — training data',
      '<p class="case-org">' + esc(LAB.CASE.org) + '</p><p class="case-blurb">' + esc(LAB.CASE.orgBlurb) + '</p>');
    h += UI.paperTag('Situation report', '02:13 · night two',
      '<p class="case-brief">' + esc(LAB.CASE.brief) + '</p>');
    h += UI.infoNote('This lab simulates the <strong>response activities</strong> the lesson teaches — evidence collection, incident analysis, restoration, and preventive measures — as one continuous case. Your progress saves automatically in this browser.');
    h += '</div>';
    h += '<div class="case-col">';
    h += '<div class="panel"><p class="kicker">What is at stake</p><ul class="stakes-list">';
    LAB.CASE.stakes.forEach(function (s) {
      h += '<li><span class="stake-dot" aria-hidden="true"></span>' + esc(s) + '</li>';
    });
    h += '</ul></div>';
    h += '<div class="panel"><p class="kicker">Response roster</p><ul class="roster-names">';
    LAB.CASE.roster.forEach(function (r) {
      h += '<li>' + icon('file-text', 'ic ic-14 ic-faint') + esc(r.name) + '</li>';
    });
    h += '</ul></div>';
    h += '<button type="button" class="btn btn-amber btn-block" data-action="goto" data-station="prepare" aria-label="Proceed to the Preparation station" data-fk="enter-warroom">Enter the war room ' + icon('arrow-right', 'ic ic-btn') + '</button>';
    h += '<p class="case-queue">objectives in your queue: ' + passed + '/' + total + ' verified</p>';
    h += '</div></div>';
    return h;
  }

  function custodyLedger(env) {
    let h = '<div class="ledger">';
    h += '<p class="ledger-title">Chain of custody ledger — form CoC-IR</p>';
    h += '<div class="ledger-grid">';
    h += '<div><p class="ledger-label">Collector (who touched the evidence):</p>'
      + UI.selectHtml({ ariaLabel: 'Custody: collector', value: env.custody.collector, options: LAB.CUSTODY_COLLECTORS, change: 'env', placeholder: 'select collector…', extraAttrs: 'data-key="custody" data-sub="collector" data-fk="sel-custody-collector"' }) + '</div>';
    h += '<div><p class="ledger-label">Evidence tag (case-scoped, item-scoped):</p>'
      + UI.selectHtml({ ariaLabel: 'Custody: evidence tag', value: env.custody.tag, options: LAB.CUSTODY_TAGS, change: 'env', placeholder: 'select tag…', extraAttrs: 'data-key="custody" data-sub="tag" data-fk="sel-custody-tag"' }) + '</div>';
    h += '<div class="ledger-span"><p class="ledger-label">Integrity method:</p>'
      + UI.selectHtml({ ariaLabel: 'Custody: integrity method', value: env.custody.integrity, options: LAB.CUSTODY_INTEGRITY, change: 'env', placeholder: 'select method…', extraAttrs: 'data-key="custody" data-sub="integrity" data-fk="sel-custody-integrity"' }) + '</div>';
    h += '<div class="ledger-span"><p class="ledger-label">Why does the hash matter?</p>'
      + UI.selectHtml({ ariaLabel: 'Custody: purpose of hashing', value: env.custody.why, options: LAB.CUSTODY_WHY, change: 'env', placeholder: 'select the reason…', extraAttrs: 'data-key="custody" data-sub="why" data-fk="sel-custody-why"' }) + '</div>';
    h += '</div></div>';
    return h;
  }

  function clockLegend(mode) {
    let h = '<div class="clock-legend">';
    h += '<p class="cl-title">clock legend</p>';
    h += '<p>Mail gateway, VPN gateway, SIEM forwarders, backup agent — <span class="cl-strong">UTC</span>.</p>';
    h += '<p>EDR agents — <span class="cl-strong">local clock, UTC−1</span> (DST misconfig).</p>';
    if (mode === 'hard') h += '<p>NDR sensor — <span class="cl-strong">UTC but runs 3 minutes fast</span>.</p>';
    h += '<p class="cl-note">' + icon('hash', 'ic ic-12') + ' Normalize to true UTC before ordering.</p>';
    h += '</div>';
    return h;
  }

  function alertCard(a) {
    return '<div class="alert sev-' + esc(a.sev) + '">'
      + '<div class="alert-meta"><span class="alert-src">' + esc(a.src) + '</span><span>' + esc(a.time) + ' UTC</span>'
      + '<span class="sev-badge">' + esc(a.sev) + '</span></div>'
      + '<p class="alert-text">' + esc(a.text) + '</p></div>';
  }

  function ruleText(s) {
    if (s.f !== '—' && s.o !== '—' && s.v !== '—') {
      return s.f + ' ' + (s.o === 'is_not' ? 'not in' : s.o === 'is' ? '==' : s.o) + ' ' + s.v;
    }
    return null;
  }

  function stationPrepare(state) {
    const env = state.env;
    const m1 = findObjective('M1');
    const m2 = findObjective('M2');
    const pool = LAB.PHASE_POOL_ORDER.filter(function (id) { return env.phaseOrder.indexOf(id) < 0; });
    const activityOptions = LAB.PHASES.slice().reverse().map(function (p) { return { id: p.activity, label: p.activity }; });

    /* knowledge accordion */
    let kc = '<div class="panel panel-tight"><div class="acc">';
    kc += '<details class="acc-item" open><summary class="acc-trigger">' + icon('shield-check', 'ic ic-btn ic-amber') + ' What are incident response activities?</summary>'
      + '<div class="acc-content"><p>' + esc(LAB.KNOWLEDGE_CORE.what) + '</p><p class="mt2">' + esc(LAB.KNOWLEDGE_CORE.whyFast) + '</p></div></details>';
    kc += '<details class="acc-item" open><summary class="acc-trigger">' + icon('radar', 'ic ic-btn ic-amber') + ' The process — three ways to draw it</summary>'
      + '<div class="acc-content"><ul class="phase-list">';
    LAB.PHASES.forEach(function (p, i) {
      kc += '<li><span class="phase-num">' + (i + 1) + '.</span><span><strong>' + esc(p.name) + ':</strong> ' + esc(p.blurb) + '</span></li>';
    });
    kc += '</ul><div class="table-wrap"><table class="cmp-table"><thead><tr class="cmp-head"><th>Framework</th><th>Phases</th></tr></thead><tbody>';
    LAB.NIST_COMPARE.forEach(function (r) {
      kc += '<tr class="cmp-row"><td class="cmp-model">' + esc(r.model) + '</td><td>' + esc(r.phases) + '</td></tr>';
    });
    kc += '</tbody></table></div>'
      + '<p class="exam-tip">Exam tip: the first six steps never change order — frameworks differ only in where they draw the boxes. Lessons-learned reviews bridge Recovery → Rehearsal → the next Preparation.</p>'
      + '</div></details>';
    kc += '<details class="acc-item"><summary class="acc-trigger">' + icon('bell-ring', 'ic ic-btn ic-amber') + ' The chain you will investigate</summary>'
      + '<div class="acc-content"><p>' + esc(LAB.KNOWLEDGE_CORE.chainIntro) + '</p>'
      + '<ul class="chain-lines"><li>T1566.002 Spearphishing Link → T1078 Valid Accounts → T1003.001 LSASS Memory</li>'
      + '<li>→ T1053.005 Scheduled Task → T1021.002 SMB/Windows Admin Shares → T1136.001 Create Account</li>'
      + '<li>→ T1486 Data Encrypted for Impact</li></ul>'
      + '<p class="rw-title">Real-world parallels:</p><ul class="parallels">';
    LAB.KNOWLEDGE_CORE.parallels.forEach(function (p) {
      kc += '<li><span aria-hidden="true" class="ic-amber">›</span>' + esc(p) + '</li>';
    });
    kc += '</ul></div></details>';
    kc += '<details class="acc-item"><summary class="acc-trigger">' + icon('shield-check', 'ic ic-btn ic-amber') + ' Evidence, restoration &amp; prevention — the one-breath primers</summary>'
      + '<div class="acc-content"><p>' + esc(LAB.KNOWLEDGE_CORE.evidencePrimer) + '</p><p class="mt2">' + esc(LAB.KNOWLEDGE_CORE.restorePrimer) + '</p><p class="mt2">' + esc(LAB.KNOWLEDGE_CORE.preventPrimer) + '</p></div></details>';
    kc += '</div></div>';

    /* M1 body */
    let m1body = '<p class="ex-intro">Tap the steps in order to build the pipeline — tap a placed step to remove it.</p>';
    if (env.phaseOrder.length > 0) {
      m1body += '<ol class="placed" aria-label="Your current phase order">';
      env.phaseOrder.forEach(function (id, i) {
        const p = findIn(LAB.PHASES, id);
        m1body += '<li><button type="button" class="placed-item" data-action="phase-remove" data-id="' + esc(id) + '" data-fk="placed-' + esc(id) + '" aria-label="Remove step ' + (i + 1) + ': ' + esc(p ? p.name : '') + '">'
          + '<span class="placed-num">' + (i + 1) + '</span><span class="placed-name">' + esc(p ? p.name : '') + '</span>'
          + '<span aria-hidden="true" class="placed-hint">tap to remove</span></button></li>';
      });
      m1body += '</ol>';
    }
    m1body += '<div class="pool" aria-label="Remaining phase steps — tap to place">';
    pool.forEach(function (id) {
      const p = findIn(LAB.PHASES, id);
      if (!p) return;
      m1body += '<button type="button" class="pool-chip" data-action="phase-place" data-id="' + esc(id) + '" data-fk="pool-' + esc(id) + '" aria-label="Place ' + esc(p.name) + ' at position ' + (env.phaseOrder.length + 1) + '">' + esc(p.name) + '</button>';
    });
    if (pool.length === 0) m1body += '<span class="pool-done">all 7 placed — check when ready</span>';
    m1body += '</div>';

    /* M2 body */
    let m2body = '<div class="m2-list">';
    LAB.PHASES.forEach(function (p) {
      m2body += '<div class="m2-row"><span class="m2-name">' + esc(p.name) + '</span>'
        + UI.selectHtml({
          ariaLabel: 'Primary activity for ' + p.name,
          value: env.phaseMatch[p.id] || '',
          options: activityOptions,
          change: 'env',
          placeholder: 'primary activity…',
          extraAttrs: 'data-key="phaseMatch" data-sub="' + esc(p.id) + '" data-fk="sel-phaseMatch-' + esc(p.id) + '"',
        }) + '</div>';
    });
    m2body += '</div>';

    let h = UI.stationHeader('01', 'Prepare', 'Know the process cold before touching a single host', UI.nextStationBtn('Next: Detect', 'detect'));
    h += '<div class="grid2">';
    h += '<div class="stack">' + kc + '</div>';
    h += '<div class="stack">';
    h += UI.objectiveCard({ def: m1, state: objState(state, 'M1'), body: m1body });
    h += UI.objectiveCard({ def: m2, state: objState(state, 'M2'), body: m2body });
    h += '</div></div>';
    return h;
  }

  function stationDetect(state) {
    const mode = state.mode;
    const env = state.env;
    let h = UI.stationHeader('02', 'Detect',
      mode === 'hard' ? 'Triage the noisy intake queue and design the retro improvements' : 'Why did 16 hours of attacker activity stay quiet?',
      UI.nextStationBtn('Next: Analyze', 'analyze'));

    /* SOC console */
    h += '<div class="soc"><p class="soc-title">' + icon('bell-ring', 'ic ic-btn soc-bell') + ' SOC alert queue — incident window</p>';
    h += '<div class="alert-grid">';
    LAB.ALERT_QUEUE.forEach(function (a) { h += alertCard(a); });
    h += '</div></div>';

    if (mode === 'medium') {
      /* M5 */
      let m5body = '<p class="ex-intro">Detection lagged ~16 hours. Select the <strong>two</strong> data-source gaps that best explain the silence, then flag the one false positive.</p>';
      m5body += '<div class="stack-sm">';
      LAB.GAP_OPTIONS.forEach(function (g) {
        m5body += UI.toggleCard({
          selected: env.gapsSelected.indexOf(g.id) >= 0,
          key: 'gapsSelected', id: g.id, label: g.text,
        });
      });
      m5body += '</div><div class="mt3"><p class="fp-label">The false positive is:</p>';
      m5body += UI.selectHtml({
        ariaLabel: 'Select the false positive alert',
        value: env.fpSelected,
        options: LAB.ALERT_QUEUE.map(function (a) { return { id: a.id, label: a.id + ' — ' + a.src + ': ' + a.text.slice(0, 60) + '…' }; }),
        change: 'env', placeholder: 'pick an alert…',
        extraAttrs: 'data-key="fpSelected" data-fk="sel-fpSelected"',
      });
      m5body += '</div>';

      /* M6 */
      let m6body = '<p class="ex-intro">Build the VPN rule with three condition slots. A third slot can (and sometimes should) stay empty.</p>';
      m6body += '<div class="stack-sm">';
      [0, 1, 2].forEach(function (i) {
        m6body += '<div class="rule-row">';
        m6body += UI.selectHtml({ ariaLabel: 'Slot ' + (i + 1) + ' field', value: env.ruleSlots[i].f, options: LAB.RULE_FIELDS.map(function (f) { return { id: f, label: f }; }), change: 'rule-slot', extraAttrs: 'data-idx="' + i + '" data-part="f" data-fk="slot-' + i + '-f"' });
        m6body += UI.selectHtml({ ariaLabel: 'Slot ' + (i + 1) + ' operator', value: env.ruleSlots[i].o, options: LAB.RULE_OPS.map(function (o) { return { id: o, label: o === '—' ? '—' : o === 'is_not' ? 'is not' : o }; }), change: 'rule-slot', extraAttrs: 'data-idx="' + i + '" data-part="o" data-fk="slot-' + i + '-o"' });
        m6body += UI.selectHtml({ ariaLabel: 'Slot ' + (i + 1) + ' value', value: env.ruleSlots[i].v, options: LAB.RULE_VALUES.map(function (v) { return { id: v, label: v }; }), change: 'rule-slot', extraAttrs: 'data-idx="' + i + '" data-part="v" data-fk="slot-' + i + '-v"' });
        m6body += '</div>';
      });
      m6body += '</div>';
      const parts = [ruleText(env.ruleSlots[0]), ruleText(env.ruleSlots[1]), ruleText(env.ruleSlots[2])].filter(Boolean);
      m6body += '<div class="rule-preview mt3"><span class="rp-dim">alert when </span>'
        + (parts.length ? UI.esc(parts.join(' AND ')) : '<span class="rp-empty">— empty rule —</span>')
        + '</div>';

      h += '<div class="grid2">';
      h += UI.objectiveCard({ def: findObjective('M5'), state: objState(state, 'M5'), body: m5body });
      h += UI.objectiveCard({ def: findObjective('M6'), state: objState(state, 'M6'), body: m6body });
      h += '</div>';
    } else {
      /* H1 triage */
      let h1body = '<p class="ex-intro">Twelve intake items. Mark each <strong>KEEP</strong> if it belongs to Case IR-2317\u2019s kill chain, otherwise <strong>DISCARD</strong>. The keep/discard buttons are your triage verdicts.</p>';
      h1body += '<div class="triage-grid keep-scroll">';
      LAB.ARTIFACTS.forEach(function (a) {
        const verdict = env.hardTriage[a.id];
        let wrapCls = 'triage-card';
        if (verdict === 'keep') wrapCls += ' triage-keep';
        else if (verdict === 'discard') wrapCls += ' triage-discard';
        h1body += '<div class="' + wrapCls + '">';
        h1body += UI.paperTag(a.label, a.source + ' · ' + a.time + ' · ' + a.clock, UI.esc(a.detail));
        h1body += '<div class="triage-btns">';
        h1body += '<button type="button" class="btn btn-sm btn-flex ' + (verdict === 'keep' ? 'btn-amber' : 'btn-outline') + '" data-action="triage" data-id="' + esc(a.id) + '" data-verdict="keep" aria-pressed="' + (verdict === 'keep' ? 'true' : 'false') + '" data-fk="triage-' + esc(a.id) + '-keep" aria-label="Keep artifact ' + esc(a.id) + '">KEEP</button>';
        h1body += '<button type="button" class="btn btn-sm btn-flex ' + (verdict === 'discard' ? 'btn-zinc-solid' : 'btn-outline') + '" data-action="triage" data-id="' + esc(a.id) + '" data-verdict="discard" aria-pressed="' + (verdict === 'discard' ? 'true' : 'false') + '" data-fk="triage-' + esc(a.id) + '-discard" aria-label="Discard artifact ' + esc(a.id) + '">DISCARD</button>';
        h1body += '</div></div>';
      });
      h1body += '</div>';

      /* H8 retro */
      let h8body = '<p class="ex-intro">The retro board. Select the <strong>four</strong> improvements that add real coverage or correlation — reject the theater.</p>';
      h8body += '<div class="stack-sm">';
      LAB.RETRO_OPTIONS.forEach(function (o) {
        h8body += UI.toggleCard({ selected: env.hardRetro.indexOf(o.id) >= 0, key: 'hardRetro', id: o.id, label: o.text });
      });
      h8body += '</div>';

      h += '<div class="stack-lg">';
      h += UI.objectiveCard({ def: findObjective('H1'), state: objState(state, 'H1'), body: h1body });
      h += UI.objectiveCard({ def: findObjective('H8'), state: objState(state, 'H8'), body: h8body });
      h += '</div>';
    }
    return h;
  }

  function stationAnalyze(state) {
    const mode = state.mode;
    const env = state.env;
    const techniqueOptions = LAB.CHAIN_TECHNIQUES.map(function (t) { return { id: t.id, label: t.id + ' — ' + t.name }; });

    let h = UI.stationHeader('03', 'Analyze · Forensics Bench',
      mode === 'hard' ? 'Defensible acquisition and a five-source reconstruction' : 'Volatility, custody, time, and the attack chain',
      UI.nextStationBtn('Next: Contain', 'contain'));

    h += '<div class="grid2">';

    /* volatility (M3 / shared) */
    const m3 = findObjective('M3');
    if (mode === 'medium' && m3) {
      const m3body = '<p class="ex-intro">The intake rack from JH-01/FSV-01. Reorder — most volatile at the top.</p>'
        + UI.sequenceBuilder({
          items: LAB.VOLATILITY_ITEMS, ordered: env.volOrder, key: 'volOrder',
          resetOrder: LAB.RESET_ORDERS.volOrder,
        });
      h += UI.objectiveCard({ def: m3, state: objState(state, 'M3'), body: m3body });
    }

    /* medium acquisition + custody (M4) */
    const m4 = findObjective('M4');
    if (mode === 'medium' && m4) {
      let m4body = '<p class="ex-intro">JH-01 is still running. Choose the acquisition approach:</p><div class="stack-sm">';
      LAB.ACQ_APPROACHES.forEach(function (o) {
        m4body += UI.toggleCard({ selected: env.acqApproach === o.id, key: 'acqApproach', id: o.id, label: o.label, action: 'set-one' });
      });
      m4body += '</div>';
      m4body += '<div class="hold-row"><div><p class="hold-title">Apply a legal hold on incident records?</p>'
        + '<p class="hold-sub">Insurance and counsel may need this evidence later.</p></div>'
        + '<button type="button" role="switch" aria-checked="' + (env.legalHold ? 'true' : 'false') + '" class="switch' + (env.legalHold ? ' switch-on' : '') + '" data-action="flip-bool" data-key="legalHold" data-fk="switch-legalHold" aria-label="Toggle legal hold"><span class="switch-thumb"></span></button></div>';
      m4body += '<div class="mt3">' + custodyLedger(env) + '</div>';
      h += UI.objectiveCard({ def: m4, state: objState(state, 'M4'), body: m4body });
    }

    /* hard acquisition under pressure (H2) */
    const h2 = findObjective('H2');
    if (mode === 'hard' && h2) {
      let h2body = '<p class="ex-intro">Four parts. The backup vendor is on the phone offering to &quot;just clone the live-mounted SAN LUN for you, no write blocker needed, we do it all the time.&quot;</p>';
      h2body += '<div class="mb3"><p class="part-label">part 1 — volatility order</p>'
        + UI.sequenceBuilder({ items: LAB.VOLATILITY_ITEMS, ordered: env.volOrder, key: 'volOrder', resetOrder: LAB.RESET_ORDERS.volOrder }) + '</div>';
      h2body += '<div class="mb3"><p class="part-label">part 2 — first capture on the live host</p>'
        + UI.selectHtml({ ariaLabel: 'H2 part 2: first capture', value: env.h2First, options: LAB.H2_FIRST, change: 'env', placeholder: 'what do you capture first, and why…', extraAttrs: 'data-key="h2First" data-fk="sel-h2First"' }) + '</div>';
      h2body += '<div class="mb3"><p class="part-label">part 3 — the shortcut you refuse</p>'
        + UI.selectHtml({ ariaLabel: 'H2 part 3: unacceptable shortcut', value: env.h2Shortcut, options: LAB.H2_SHORTCUT, change: 'env', placeholder: 'which shortcut is indefensible…', extraAttrs: 'data-key="h2Shortcut" data-fk="sel-h2Shortcut"' }) + '</div>';
      h2body += '<p class="part-label">part 4 — custody ledger</p>' + custodyLedger(env);
      h += UI.objectiveCard({ def: h2, state: objState(state, 'H2'), body: h2body });
    }

    /* timeline wall (M7 medium / H3 hard) */
    const tlDef = mode === 'medium' ? findObjective('M7') : findObjective('H3');
    if (tlDef) {
      const events = mode === 'medium' ? LAB.TIMELINE_MEDIUM : LAB.TIMELINE_HARD;
      const orderedKey = mode === 'medium' ? 'timeOrder' : 'h3Order';
      let tlbody = clockLegend(mode);
      tlbody += UI.sequenceBuilder({
        items: events.map(function (e) { return { id: e.id, label: e.label, sub: e.source + ' — raw stamp ' + e.raw }; }),
        ordered: env[orderedKey], key: orderedKey, resetOrder: LAB.RESET_ORDERS[orderedKey],
      });
      if (mode === 'hard') {
        tlbody += '<div class="case-questions">';
        tlbody += '<p class="part-label">the four case questions</p>';
        tlbody += '<div><p class="q-label">Patient zero (where the phish landed):</p>'
          + UI.selectHtml({ ariaLabel: 'H3: patient zero', value: env.h3Answers.patient, options: LAB.H3_PATIENTS, change: 'env', placeholder: 'select host…', extraAttrs: 'data-key="h3Answers" data-sub="patient" data-fk="sel-h3-patient"' }) + '</div>';
        tlbody += '<div><p class="q-label">Initial access vector:</p>'
          + UI.selectHtml({ ariaLabel: 'H3: initial access vector', value: env.h3Answers.vector, options: LAB.H3_VECTORS, change: 'env', placeholder: 'select vector…', extraAttrs: 'data-key="h3Answers" data-sub="vector" data-fk="sel-h3-vector"' }) + '</div>';
        tlbody += '<div><p class="q-label">Dwell time (initial access → encryption burst):</p>'
          + UI.selectHtml({ ariaLabel: 'H3: dwell time', value: env.h3Answers.dwell, options: LAB.H3_DWELLS, change: 'env', placeholder: 'select duration…', extraAttrs: 'data-key="h3Answers" data-sub="dwell" data-fk="sel-h3-dwell"' }) + '</div>';
        tlbody += '<div><p class="q-label">Which log was cleared before impact?</p>'
          + UI.selectHtml({ ariaLabel: 'H3: cleared log', value: env.h3Answers.cleared, options: LAB.H3_CLEARED, change: 'env', placeholder: 'select log…', extraAttrs: 'data-key="h3Answers" data-sub="cleared" data-fk="sel-h3-cleared"' }) + '</div>';
        tlbody += '</div>';
      }
      h += UI.objectiveCard({ def: tlDef, state: objState(state, tlDef.id), body: tlbody });
    }

    /* chain board (M8, medium only) */
    const m8 = findObjective('M8');
    if (mode === 'medium' && m8) {
      let m8body = '<p class="ex-intro">Six artifacts from the case. Map each to the technique it evidences — two options are decoys.</p>';
      m8body += '<div class="stack">';
      LAB.CHAIN_ARTIFACTS.forEach(function (a) {
        let t = null;
        for (const x of LAB.CHAIN_TECHNIQUES) if (x.id === env.chain[a.id]) { t = x; break; }
        const ok = LAB.CHAIN_CORRECT[a.id] === env.chain[a.id];
        m8body += '<div><div class="chain-head"><p class="chain-label">' + esc(a.label) + '</p>';
        if (t) m8body += '<span class="chain-id' + (ok ? ' ic-emerald' : '') + '" aria-hidden="true">' + esc(t.id) + '</span>';
        m8body += '</div><div class="mt1">';
        m8body += UI.selectHtml({
          ariaLabel: 'Technique for: ' + a.label,
          value: env.chain[a.id] || '',
          options: techniqueOptions,
          change: 'env', placeholder: 'ATT&CK technique for: ' + a.hint.toLowerCase() + '…',
          extraAttrs: 'data-key="chain" data-sub="' + esc(a.id) + '" data-fk="sel-chain-' + esc(a.id) + '"',
        });
        m8body += '</div></div>';
      });
      m8body += '</div>';
      m8body += UI.infoNote('Techniques are listed with their verified IDs — you are matching behavior to ID, not recalling from memory. Distractors describe ways in that did not happen here.');
      h += UI.objectiveCard({ def: m8, state: objState(state, 'M8'), body: m8body });
    }

    /* hard: bench context panel */
    if (mode === 'hard') {
      h += '<div class="panel bench"><p class="kicker-teal">' + icon('microscope', 'ic ic-btn') + ' bench context</p>'
        + '<p class="bench-text">Keepers from your triage feed this bench. The timeline wall now carries <strong>eight</strong> events across <strong>five</strong> sources — two of which lie about time. Answer the four case questions after ordering, then move to Containment.</p></div>';
    }

    h += '</div>';
    return h;
  }

  function stationContain(state) {
    const mode = state.mode;
    const env = state.env;
    let h = UI.stationHeader('04', 'Contain · Decision Console',
      mode === 'hard' ? 'The payment window is real. Sequence around it.' : 'Stop the bleeding without burning the evidence',
      UI.nextStationBtn('Next: Eradicate', 'eradicate'));

    if (mode === 'medium') {
      const m9 = findObjective('M9');
      let m9body = '<p class="ex-intro">Encryption is active on FSV-01. Select the <strong>four</strong> actions that belong in your containment set.</p><div class="stack-sm">';
      LAB.CONTAIN_ACTIONS.forEach(function (a) {
        m9body += UI.toggleCard({
          selected: env.containSel.indexOf(a.id) >= 0,
          key: 'containSel', id: a.id, label: a.label, sub: a.impact,
          tone: a.good ? 'neutral' : 'danger',
        });
      });
      m9body += '</div><div class="divider-top"><p class="ex-intro">And the trade-off: what must you flag to the business owner <em>before</em> isolating FSV-01?</p><div class="stack-sm">';
      LAB.TRADEOFFS.forEach(function (t) {
        m9body += UI.toggleCard({ selected: env.tradeoff === t.id, key: 'tradeoff', id: t.id, label: t.label, action: 'set-one' });
      });
      m9body += '</div></div>';

      h += '<div class="grid2">';
      h += UI.objectiveCard({ def: m9, state: objState(state, 'M9'), body: m9body });
      h += '<div class="stack">';
      h += '<div class="panel panel-rose"><p class="kicker-rose">' + icon('flame', 'ic ic-btn') + ' console note — containment ≠ shutdown</p>'
        + '<p class="panel-text">EDR network containment keeps the host powered — memory intact, evidence warm. The power switch is not a containment tool; it is an evidence incinerator with a satisfying click.</p></div>';
      h += '<div class="panel"><p class="kicker">why the business call matters</p>'
        + '<p class="panel-text">Containment decisions are joint decisions: you own the technical action, the business owner owns the impact. Isolating the payment server without flagging the outage is how IR teams lose the room — and lose the authority they need for the next, faster call.</p></div>';
      h += '</div></div>';
    } else {
      const h4 = findObjective('H4');
      let h4body = '<div class="constraint"><strong>Business constraint:</strong> FSV-01 runs payment processing. The business owner agreed to isolate it at <strong>17:30, after batch close</strong>. No active encryption has been observed on FSV-01 — only lateral recon. Payment batch closes 17:10.</div>';
      h4body += UI.sequenceBuilder({ items: LAB.CONTAIN_SEQ_ITEMS, ordered: env.containSeq, key: 'containSeq', resetOrder: LAB.RESET_ORDERS.containSeq });

      let h4twin = '<p class="ex-intro">Two near-miss proposals reached your queue. Select <strong>both</strong> you formally reject — the check explains each rationale.</p><div class="stack-sm mt3">';
      LAB.CONTAIN_REJECTS.forEach(function (r) {
        h4twin += UI.toggleCard({
          selected: env.containReject.indexOf(r.id) >= 0,
          key: 'containReject', id: r.id, label: r.label, tone: 'danger',
        });
      });
      h4twin += '</div><p class="twin-hint">Both panels validate together: the five-step sequence and the two rejections.</p>';

      h += '<div class="grid2">';
      h += UI.objectiveCard({ def: h4, state: objState(state, 'H4'), body: h4body });
      h += UI.objectiveCard({ def: h4, state: objState(state, 'H4'), body: h4twin, twin: true });
      h += '</div>';
    }
    return h;
  }

  function stationEradicate(state) {
    const mode = state.mode;
    const env = state.env;
    let h = UI.stationHeader('05', 'Eradicate · Foothold Board',
      mode === 'hard' ? 'The case that would not die: re-infection at hour 36' : 'Close every foothold — then verify you closed every foothold',
      UI.nextStationBtn('Next: Recover', 'recover'));

    if (mode === 'medium') {
      const m10 = findObjective('M10');
      let m10body = '<p class="ex-intro">Build the checklist: select the <strong>five</strong> actions that genuinely remove attacker capability.</p><div class="grid-auto">';
      LAB.ERAD_ACTIONS.forEach(function (a) {
        m10body += UI.toggleCard({
          selected: env.eradSel.indexOf(a.id) >= 0,
          key: 'eradSel', id: a.id, label: a.label,
          tone: a.good ? 'neutral' : 'danger',
        });
      });
      m10body += '</div>';
      h += UI.objectiveCard({ def: m10, state: objState(state, 'M10'), body: m10body });
    } else {
      const h5 = findObjective('H5');
      let left = '<div class="panel panel-rose-solid"><p class="kicker-rose">' + icon('eraser', 'ic ic-btn') + ' hour 36 — it came back</p>'
        + '<p class="panel-text">Eradication was signed off. JH-01 and FSV-01 were rebuilt. Now FSV-02 — a host you never touched — is creating scheduled tasks and writing .blkrtn files. The SOC pages you back in.</p></div>';
      LAB.H5_ARTIFACTS.forEach(function (a) {
        left += UI.paperTag('fresh evidence · ' + a.id, '', UI.esc(a.text));
      });

      let h5body = '<p class="ex-intro">Find the <strong>two</strong> missed footholds, then name the skipped eradication step.</p>';
      h5body += '<p class="part-label">missed footholds (pick 2)</p><div class="stack-sm">';
      LAB.H5_MISSED.forEach(function (m) {
        h5body += UI.toggleCard({ selected: env.h5Missed.indexOf(m.id) >= 0, key: 'h5Missed', id: m.id, label: m.label });
      });
      h5body += '</div><p class="part-label mt4">the skipped step</p>';
      h5body += UI.selectHtml({ ariaLabel: 'H5: the skipped eradication step', value: env.h5Step, options: LAB.H5_STEPS, change: 'env', placeholder: 'what did eradication skip…', extraAttrs: 'data-key="h5Step" data-fk="sel-h5Step"' });

      h += '<div class="grid2"><div class="stack">' + left + '</div>';
      h += UI.objectiveCard({ def: h5, state: objState(state, 'H5'), body: h5body });
      h += '</div>';
    }
    return h;
  }

  function stationRecover(state) {
    const mode = state.mode;
    const env = state.env;
    const def = mode === 'medium' ? findObjective('M11') : findObjective('H6');
    const sources = mode === 'hard' ? LAB.H6_SOURCES : LAB.RESTORE_SOURCES;
    const srcValue = mode === 'hard' ? env.h6Src : env.restoreSrc;
    const srcKey = mode === 'hard' ? 'h6Src' : 'restoreSrc';

    let h = UI.stationHeader('06', 'Recover · Restoration Trust Ladder',
      mode === 'hard' ? 'Prove it clean, then prove it works' : 'Restore from what you can prove is safe',
      UI.nextStationBtn('Next: Debrief', 'debrief'));

    let srcBody = '<p class="ex-intro">Pick the ONE restore source you could defend in a boardroom:</p><div class="stack-sm">';
    sources.forEach(function (s) {
      srcBody += UI.toggleCard({
        selected: srcValue === s.id, key: srcKey, id: s.id,
        label: s.label, sub: s.detail, tone: 'danger', action: 'set-one',
      });
    });
    srcBody += '</div>';

    let ladderBody = '<p class="ex-intro">Order the validation ladder — trust is earned one rung at a time:</p>';
    if (mode === 'medium') {
      ladderBody += UI.sequenceBuilder({ items: LAB.RECOVERY_STEPS, ordered: env.recSteps, key: 'recSteps', resetOrder: LAB.RESET_ORDERS.recSteps });
    } else {
      ladderBody += UI.sequenceBuilder({ items: LAB.H6_STEPS, ordered: env.h6Steps, key: 'h6Steps', resetOrder: LAB.RESET_ORDERS.h6Steps });
      ladderBody += '<p class="part-label mt4">record the near-miss you reject</p>';
      ladderBody += UI.selectHtml({
        ariaLabel: 'H6: rejected near-miss', value: env.h6Reject,
        options: LAB.H6_REJECTS.map(function (r) { return { id: r.id, label: r.label }; }),
        change: 'env', placeholder: 'which shortcut is rejected…',
        extraAttrs: 'data-key="h6Reject" data-fk="sel-h6Reject"',
      });
    }
    ladderBody += '<div class="panel panel-emerald mt4"><p class="kicker-emerald">' + icon('heart-pulse', 'ic ic-btn') + ' console note</p>'
      + '<p class="panel-text">&quot;It looks fine&quot; is the most expensive sentence in incident response. Hashes, catalogs, scans, and a payment dry-run are how restored systems earn the right back into production.</p></div>';

    h += '<div class="grid2">';
    h += UI.objectiveCard({ def: def, state: objState(state, def.id), body: srcBody });
    h += UI.objectiveCard({ def: def, state: objState(state, def.id), body: ladderBody, twin: true });
    h += '</div>';
    return h;
  }

  function stationDebrief(state) {
    const mode = state.mode;
    const env = state.env;
    const controlOptions = LAB.CONTROL_OPTIONS.map(function (c) { return { id: c.id, label: c.label }; });

    let h = UI.stationHeader('07', 'Debrief · Lessons &amp; Prevention',
      mode === 'hard' ? 'Turn the incident into the roadmap — then file the report' : 'Convert root causes into prevention',
      '<button type="button" class="btn btn-outline btn-sm btn-final" data-action="goto" data-station="quiz" data-fk="next-quiz">Final: Knowledge Check ' + icon('arrow-right', 'ic ic-btn') + '</button>');

    h += '<div class="grid2">';

    /* exercises */
    h += '<div class="stack">';
    if (mode === 'medium') {
      const m12 = findObjective('M12');
      let m12body = '<p class="ex-intro">Four root causes from the post-incident review. Map each to its preventive control — two options are decoys that would NOT have stopped this chain.</p><div class="stack">';
      LAB.ROOT_CAUSES.forEach(function (rc) {
        m12body += '<div><p class="chain-label">' + esc(rc.text) + '</p><div class="mt1">'
          + UI.selectHtml({
            ariaLabel: 'Preventive control for: ' + rc.text,
            value: env.lessonMap[rc.id] || '', options: controlOptions,
            change: 'env', placeholder: 'control + MITRE ID…',
            extraAttrs: 'data-key="lessonMap" data-sub="' + esc(rc.id) + '" data-fk="sel-lessonMap-' + esc(rc.id) + '"',
          }) + '</div></div>';
      });
      m12body += '</div>';
      h += UI.objectiveCard({ def: m12, state: objState(state, 'M12'), body: m12body });
    } else {
      const h7 = findObjective('H7');
      let h7body = '<p class="ex-intro">Part 1 — map five root causes to controls (official mitigation IDs):</p><div class="stack">';
      LAB.H7_ROOT_CAUSES.forEach(function (rc) {
        h7body += '<div><p class="chain-label">' + esc(rc.text) + '</p><div class="mt1">'
          + UI.selectHtml({
            ariaLabel: 'Control for: ' + rc.text,
            value: env.h7Map[rc.id] || '', options: controlOptions,
            change: 'env', placeholder: 'control + MITRE ID…',
            extraAttrs: 'data-key="h7Map" data-sub="' + esc(rc.id) + '" data-fk="sel-h7Map-' + esc(rc.id) + '"',
          }) + '</div></div>';
      });
      h7body += '</div>';
      h7body += '<p class="ex-intro divider-top mt4">Part 2 — rank the five controls by <strong>time-to-protect</strong> (fastest protection first):</p>';
      h7body += UI.sequenceBuilder({
        items: ['M1017', 'M1032', 'M1030', 'M1021', 'M1053'].map(function (id) { return { id: id, label: id }; }),
        ordered: env.h7Rank, key: 'h7Rank', resetOrder: LAB.RESET_ORDERS.h7Rank,
      });
      if (env.h7Rank.length === 5) {
        h7body += '<ul class="rank-list">';
        env.h7Rank.forEach(function (id, i) {
          h7body += '<li class="rank-line">' + (i + 1) + '. ' + esc(id) + ' — ' + esc(LAB.H7_RANK_RATIONALE[id]) + '</li>';
        });
        h7body += '</ul>';
      }
      h += UI.objectiveCard({ def: h7, state: objState(state, 'H7'), body: h7body });

      const h9 = findObjective('H9');
      let h9body = '<p class="ex-intro">Part 1 — classify each action into its phase:</p><div class="stack">';
      LAB.H9_ACTIONS.forEach(function (a) {
        h9body += '<div><p class="chain-label">' + esc(a.label) + '</p><div class="mt1">'
          + UI.selectHtml({
            ariaLabel: 'Phase for: ' + a.label,
            value: env.h9Phases[a.id] || '', options: LAB.H9_PHASE_OPTIONS,
            change: 'env', placeholder: 'which phase…',
            extraAttrs: 'data-key="h9Phases" data-sub="' + esc(a.id) + '" data-fk="sel-h9Phases-' + esc(a.id) + '"',
          }) + '</div></div>';
      });
      h9body += '</div>';
      h9body += '<p class="ex-intro divider-top mt4">Part 2 — the root-cause statement:</p>';
      h9body += UI.selectHtml({ ariaLabel: 'H9: root cause statement', value: env.h9Root, options: LAB.H9_ROOTS, change: 'env', placeholder: 'state the root cause…', extraAttrs: 'data-key="h9Root" data-fk="sel-h9Root"' });
      h9body += '<p class="ex-intro mt3">Part 3 — the residual-risk stance leadership signs off on:</p>';
      h9body += UI.selectHtml({ ariaLabel: 'H9: residual risk stance', value: env.h9Risk, options: LAB.H9_RISKS.map(function (r) { return { id: r.id, label: r.label }; }), change: 'env', placeholder: 'select the honest answer…', extraAttrs: 'data-key="h9Risk" data-fk="sel-h9Risk"' });
      h += UI.objectiveCard({ def: h9, state: objState(state, 'H9'), body: h9body });
    }
    h += '</div>';

    /* C6 — field notes */
    h += '<div class="stack">';
    h += '<div class="panel"><p class="kicker-teal">' + icon('book-open', 'ic ic-btn') + ' field notes — detection opportunities</p><div class="stack-sm">';
    LAB.FIELD_NOTES.detections.forEach(function (d) {
      h += '<div class="det-row"><p class="det-src">' + esc(d.source) + '</p><p class="det-logic">' + esc(d.logic) + '</p></div>';
    });
    h += '</div></div>';

    h += '<div class="panel"><p class="kicker-emerald">' + icon('clipboard-check', 'ic ic-btn') + ' field notes — mitigations (official IDs)</p><ul class="mit-list">';
    LAB.FIELD_NOTES.mitigations.forEach(function (m) {
      h += '<li><span class="mit-id">' + esc(m.id) + '</span><span><strong>' + esc(m.name) + '</strong> — ' + esc(m.note) + '</span></li>';
    });
    h += '</ul></div>';

    h += '<div class="grid-sm"><div class="panel"><p class="kicker-teal">blue-team takeaways</p><ul class="take-list">';
    LAB.FIELD_NOTES.blue.forEach(function (b) {
      h += '<li><span aria-hidden="true" class="ic-teal">›</span>' + esc(b) + '</li>';
    });
    h += '</ul></div><div class="panel"><p class="kicker-rose">red-team mindset</p><ul class="take-list">';
    LAB.FIELD_NOTES.red.forEach(function (b) {
      h += '<li><span aria-hidden="true" class="ic-rose">›</span>' + esc(b) + '</li>';
    });
    h += '</ul></div></div>';

    h += '<div class="panel"><p class="kicker">official references <span class="refs-sub">(open in new tab)</span></p><ul class="ref-list">';
    LAB.FIELD_NOTES.links.forEach(function (l) {
      h += '<li><a class="reflink" href="' + esc(l.href) + '" target="_blank" rel="noopener noreferrer">' + icon('external-link', 'ic ic-12') + esc(l.label) + '</a></li>';
    });
    h += '</ul><p class="acc-note">' + esc(LAB.FIELD_NOTES.accuracyNote) + '</p></div>';

    h += '</div></div>';
    return h;
  }

  function stationQuiz(state, score) {
    const allObjectivesPassed = allPassed(state);
    return Quiz.render({ state: state, score: score, allObjectivesPassed: allObjectivesPassed });
  }

  /* ───────────────────────────── DIALOGS ────────────────────────────────── */

  function dialogShell(inner, opts) {
    return '<div class="overlay' + (opts.open ? '' : ' hidden') + '" data-overlay="' + opts.name + '">'
      + '<div class="dialog ' + (opts.cls || '') + '" role="dialog" aria-modal="true" aria-labelledby="' + opts.labelledby + '" tabindex="-1" data-dialog-panel>'
      + inner
      + '</div></div>';
  }

  function dialogHead(idTitle, titleHtml, descHtml) {
    return '<div class="dialog-head"><div>'
      + '<h2 class="dialog-title" id="' + idTitle + '">' + titleHtml + '</h2>'
      + (descHtml ? '<p class="dialog-desc">' + descHtml + '</p>' : '')
      + '</div>'
      + '<button type="button" class="dialog-x" data-action="dialog-close" aria-label="Close dialog">' + icon('x', 'ic ic-16') + '</button>'
      + '</div>';
  }

  function renderDialogs() {
    let h = '';

    /* Glossary */
    let g = dialogHead('glossary-title', icon('book-open', 'ic ic-btn ic-amber') + ' Field glossary — 15 terms',
      'Every term the lesson expects you to command, in one line each.');
    g += '<div class="dialog-scroll"><dl class="gloss-list">';
    LAB.GLOSSARY.forEach(function (term) {
      g += '<div class="gloss-item"><dt class="gloss-term">' + esc(term.term) + '</dt><dd class="gloss-def">' + esc(term.def) + '</dd></div>';
    });
    g += '</dl></div>';
    h += dialogShell(g, { open: app.glossaryOpen, name: 'glossary', cls: 'dialog-lg', labelledby: 'glossary-title' });

    /* Reset confirm */
    let r = '<div class="dialog-head"><div>'
      + '<h2 class="dialog-title" id="reset-title">Reset the lab?</h2>'
      + '<p class="dialog-desc">This wipes your mode, every verified objective, quiz answers, and all board state — back to a pristine case file. This cannot be undone.</p>'
      + '</div><button type="button" class="dialog-x" data-action="dialog-close" aria-label="Close dialog">' + icon('x', 'ic ic-16') + '</button></div>';
    r += '<div class="dialog-foot">'
      + '<button type="button" class="btn btn-outline" data-action="dialog-close" data-fk="reset-cancel">Keep my progress</button>'
      + '<button type="button" class="btn btn-rose" data-action="reset-confirm" data-fk="reset-confirm">Reset everything</button>'
      + '</div>';
    h += dialogShell(r, { open: app.resetOpen, name: 'reset', cls: 'dialog-sm', labelledby: 'reset-title' });

    /* Completion */
    if (app.completeOpen) {
      const state = Store.get();
      const score = Obj.computeScore(state);
      const mode = state.mode;
      const modeObjs = LAB.OBJECTIVES.filter(function (o) { return o.mode === mode; });

      let c = dialogHead('completion-title', icon('award', 'ic ic-btn ic-amber') + ' Case ' + esc(LAB.CASE.id) + ' closed — incident debrief',
        (mode === 'hard' ? 'Live Fire deployment' : 'Guided Response deployment') + ' · ' + esc(LAB.CASE.classification));

      /* hero */
      c += '<div class="complete-hero anim-pop">';
      c += '<div class="stars" role="img" aria-label="' + score.stars + ' of 3 stars">';
      [1, 2, 3].forEach(function (i) {
        c += '<span class="star' + (i <= score.stars ? ' star-on' : '') + '">' + icon('star', 'ic ic-32') + '</span>';
      });
      c += '</div>';
      c += '<p class="star-label">' + esc(LAB.STAR_LABELS[score.stars]) + '</p>';
      c += '<p class="mastery-line">mastery score ' + score.pct + '% (' + score.points + '/' + score.maxPoints + ' pts)</p>';
      c += '<div class="stat-grid">';
      c += '<div class="stat"><p class="stat-num ic-emerald">' + score.firstTryCount + '/' + score.totalCount + '</p><p class="stat-label">first-attempt</p></div>';
      c += '<div class="stat"><p class="stat-num ic-rose">−' + score.hintTiers + '</p><p class="stat-label">hints used</p></div>';
      c += '<div class="stat"><p class="stat-num ic-amber">' + score.quizCorrect + '/' + score.quizTotal + '</p><p class="stat-label">quiz</p></div>';
      c += '</div></div>';

      /* pillar recap */
      c += '<div class="panel"><p class="kicker-muted">mastery recap by pillar</p><ul class="pr-list">';
      ['P1', 'P2', 'P3', 'P4'].forEach(function (p) {
        const list = modeObjs.filter(function (o) { return o.pillar === p; });
        const passedN = list.filter(function (o) { return state.obj[o.id] && state.obj[o.id].passed; }).length;
        const meta = LAB.PILLAR_META[p];
        const full = passedN === list.length;
        const takeaway = mode === 'hard' ? LAB.PILLAR_TAKEAWAYS[p].hard : LAB.PILLAR_TAKEAWAYS[p].medium;
        c += '<li class="pr-item"><span class="badge ' + meta.cls + ' pr-badge">' + p + ' ' + meta.label + '</span>'
          + '<span><span class="pr-count' + (full ? ' ic-emerald' : ' ic-amber') + '">' + passedN + '/' + list.length + '</span>'
          + '<span class="pr-takeaway">' + esc(takeaway) + '</span></span></li>';
      });
      c += '</ul></div>';

      /* next steps */
      c += '<div class="panel"><p class="kicker-muted">what to learn next</p><ul class="next-list">';
      if (mode === 'hard') {
        c += '<li>› Replay Guided Response to bank the vocabulary, or replay Hard chasing 3 stars.</li>';
        c += '<li>› Read NIST SP 800-61 and map its four phases onto CompTIA\u2019s seven steps.</li>';
        c += '<li>› Walk the official ATT&amp;CK pages for the six techniques in the chain (Debrief → links).</li>';
      } else {
        c += '<li>› Deploy Live Fire — same case, noisy evidence, near-misses rejected. That is the exam feeling.</li>';
        c += '<li>› Read NIST SP 800-61 (linked in Field Notes) and compare its phase model.</li>';
        c += '<li>› Write the two detection rules from the Detect station in your SIEM\u2019s syntax.</li>';
      }
      c += '</ul></div>';

      c += '<div class="complete-actions">';
      c += '<button type="button" class="btn btn-outline btn-flex" data-action="replay" data-fk="replay-btn" aria-label="Replay this mode from a clean state">' + icon('rotate-ccw', 'ic ic-btn') + ' Replay ' + (mode === 'hard' ? 'Live Fire' : 'Guided Response') + '</button>';
      c += '<button type="button" class="btn btn-amber btn-flex" data-action="switch-mode" data-fk="switch-btn" aria-label="Switch to the other difficulty mode">' + (mode === 'hard' ? 'Deploy Guided Response' : 'Deploy Live Fire') + '</button>';
      c += '</div>';

      h += dialogShell(c, { open: true, name: 'completion', cls: 'dialog-xl', labelledby: 'completion-title' });
    }

    dialogRoot.innerHTML = h;
  }

  /* ───────────────────────────── MAIN RENDER ────────────────────────────── */

  function allPassed(state) {
    if (!state.mode) return false;
    const list = LAB.OBJECTIVES.filter(function (o) { return o.mode === state.mode; });
    return list.length > 0 && list.every(function (o) { return state.obj[o.id] && state.obj[o.id].passed; });
  }

  function render() {
    const state = Store.get();

    /* preserve focus + scroll across re-render */
    const prevActive = document.activeElement;
    const inDialog = prevActive && dialogRoot.contains(prevActive);
    const prevFk = prevActive && prevActive.getAttribute ? prevActive.getAttribute('data-fk') : null;
    const winY = global.scrollY;
    const stage = document.getElementById('stage');
    const stageScroll = stage ? stage.scrollTop : 0;

    const stationChanged = app.lastStation !== null && app.lastStation !== state.station;
    app.lastStation = state.station;

    if (!state.mode) {
      root.innerHTML = '<div class="app-bg">' + renderModeSelect(state) + '</div>';
      app.lastStation = null;
    } else {
      const score = Obj.computeScore(state);
      const progMap = stationProgressMap(state, state.mode);
      const recommended = recommendedStation(state.mode, progMap);
      const quiz = state.mode === 'hard' ? LAB.QUIZ_HARD : LAB.QUIZ_MEDIUM;
      const meta = findIn(LAB.STATIONS, state.station);

      let stageHtml = '';
      switch (state.station) {
        case 'case': stageHtml = stationCase(state); break;
        case 'prepare': stageHtml = stationPrepare(state); break;
        case 'detect': stageHtml = stationDetect(state); break;
        case 'analyze': stageHtml = stationAnalyze(state); break;
        case 'contain': stageHtml = stationContain(state); break;
        case 'eradicate': stageHtml = stationEradicate(state); break;
        case 'recover': stageHtml = stationRecover(state); break;
        case 'debrief': stageHtml = stationDebrief(state); break;
        case 'quiz': stageHtml = stationQuiz(state, score); break;
      }

      let h = '<div class="app-bg">';
      h += renderBanner(state, score);
      h += '<div class="layout">';
      h += renderRail(state, progMap, recommended);
      h += '<main id="stage" class="stage" tabindex="-1">';
      h += '<p class="sr-only" aria-live="polite">' + (meta ? 'Station ' + meta.n + ': ' + meta.label : '') + '</p>';
      h += '<div class="stage-anim' + (stationChanged ? ' stage-enter' : '') + '">' + stageHtml + '</div>';
      h += '</main>';
      h += '<div class="roster-col">' + renderRoster(state) + '</div>';
      h += '</div></div>';
      root.innerHTML = h;

      /* announce + scroll-to-top on station change (parity with lab-root) */
      if (stationChanged) {
        if (announcer && meta) announcer.textContent = 'Station ' + meta.n + ': ' + meta.label;
        global.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    renderDialogs();

    /* restore scroll + focus */
    if (state.mode) {
      const stage2 = document.getElementById('stage');
      if (stage2) stage2.scrollTop = stageScroll;
    }
    if (winY && !stationChanged && !app.lastScrolledTop) global.scrollTo(0, winY);

    if (inDialog) {
      const panel = dialogRoot.querySelector('.overlay:not(.hidden) [data-dialog-panel]');
      if (panel && !panel.contains(document.activeElement)) panel.focus();
    } else if (prevFk) {
      const target = root.querySelector('[data-fk="' + cssAttrEscape(prevFk) + '"]')
        || dialogRoot.querySelector('[data-fk="' + cssAttrEscape(prevFk) + '"]');
      if (target) target.focus({ preventScroll: true });
    }
    app.lastScrolledTop = false;
  }

  /* ─────────────────────────── dialog helpers ───────────────────────────── */

  function anyDialogOpen() {
    return app.glossaryOpen || app.resetOpen || app.completeOpen;
  }

  function closeDialogs(refocus) {
    const hadGlossary = app.glossaryOpen;
    const hadReset = app.resetOpen;
    const hadComplete = app.completeOpen;
    app.glossaryOpen = false;
    app.resetOpen = false;
    app.completeOpen = false;
    if (refocus) {
      /* focus returns to the triggering control (QA-5 parity) — resolved
         fresh from the live DOM via its stable data-fk key */
      const fk = hadComplete ? app.completionFk : hadGlossary ? app.glossaryFk : hadReset ? app.resetFk : null;
      if (fk) {
        const el = document.querySelector('[data-fk="' + cssAttrEscape(fk) + '"]');
        if (el) el.focus();
      }
    }
    app.completionFk = null;
    renderDialogs();
  }

  /* ─────────────────────────── top-level actions ────────────────────────── */

  function pickMode(mode) {
    app.rosterOpen = false;
    app.lastStation = null;
    Store.set(Store.pristine(mode));
  }

  function resume() {
    const saved = Store.getSaved();
    if (saved) Store.set(saved);
  }

  function doReset() {
    Store.clearState();
    Store.clearSaved();
    app.resetOpen = false;
    app.completeOpen = false;
    app.rosterOpen = false;
    app.lastStation = null;
    Store.set(Store.pristine(null));
  }

  function openCompletion(trigger) {
    app.completionFk = trigger && trigger.getAttribute ? trigger.getAttribute('data-fk') : null;
    Store.actions.markCompleted();
    app.completeOpen = true;
    renderDialogs();
    const panel = dialogRoot.querySelector('.overlay:not(.hidden) [data-dialog-panel]');
    if (panel) panel.focus();
  }

  function replayMode() {
    const mode = Store.get().mode;
    app.completeOpen = false;
    app.rosterOpen = false;
    app.lastStation = null;
    Store.set(Store.pristine(mode));
  }

  function switchMode() {
    Store.clearState();
    Store.clearSaved();
    app.completeOpen = false;
    app.rosterOpen = false;
    app.lastStation = null;
    Store.set(Store.pristine(null));
  }

  /* ─────────────────────────── event wiring ─────────────────────────────── */

  document.addEventListener('click', function (e) {
    const t = e.target.closest('[data-action]');
    if (!t || t.disabled) return;
    const ds = t.dataset;

    switch (ds.action) {
      case 'pick-mode': pickMode(ds.mode); break;
      case 'resume': resume(); break;
      case 'goto': Store.actions.goto(ds.station); break;
      case 'phase-place':
        Store.mutate(function (s) { s.env.phaseOrder.push(ds.id); });
        break;
      case 'phase-remove':
        Store.mutate(function (s) {
          s.env.phaseOrder = s.env.phaseOrder.filter(function (x) { return x !== ds.id; });
        });
        break;
      case 'toggle-item': Store.actions.toggleListItem(ds.key, ds.id); break;
      case 'set-one': Store.actions.setOne(ds.key, ds.id); break;
      case 'triage': Store.actions.setTriage(ds.id, ds.verdict); break;
      case 'flip-bool': Store.actions.flipBool(ds.key); break;
      case 'seq-move': Store.actions.seqMove(ds.key, parseInt(ds.idx, 10), parseInt(ds.dir, 10)); break;
      case 'seq-reset': Store.actions.seqReset(ds.key, ds.order.split(',')); break;
      case 'check': Store.actions.checkObjective(ds.obj); break;
      case 'hint': Store.actions.revealHint(ds.obj); break;
      case 'quiz-answer': Store.actions.answerQuiz(ds.qid, parseInt(ds.idx, 10)); break;
      case 'open-glossary':
        app.glossaryOpen = true;
        renderDialogs();
        const gp = dialogRoot.querySelector('.overlay:not(.hidden) [data-dialog-panel]');
        if (gp) gp.focus();
        break;
      case 'reset-request':
        app.resetOpen = true;
        renderDialogs();
        const rp = dialogRoot.querySelector('.overlay:not(.hidden) [data-dialog-panel]');
        if (rp) rp.focus();
        break;
      case 'reset-confirm': doReset(); break;
      case 'dialog-close': closeDialogs(true); break;
      case 'open-completion': openCompletion(t); break;
      case 'replay': replayMode(); break;
      case 'switch-mode': switchMode(); break;
      case 'roster-toggle':
        app.rosterOpen = !app.rosterOpen;
        render();
        break;
      default: break;
    }
  });

  document.addEventListener('change', function (e) {
    const t = e.target.closest('[data-change]');
    if (!t) return;
    const ds = t.dataset;
    switch (ds.change) {
      case 'env':
        if (ds.sub !== undefined && ds.sub !== '') Store.actions.setEnvSub(ds.key, ds.sub, t.value);
        else Store.actions.setOne(ds.key, t.value);
        break;
      case 'rule-slot':
        Store.actions.setRuleSlot(parseInt(ds.idx, 10), ds.part, t.value);
        break;
      default: break;
    }
  });

  /* keyboard: ESC closes dialogs; Tab is trapped inside an open dialog */
  document.addEventListener('keydown', function (e) {
    if (!anyDialogOpen()) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      closeDialogs(true);
      render();
      return;
    }
    if (e.key === 'Tab') {
      const active = dialogRoot.querySelector('.overlay:not(.hidden) [data-dialog-panel]');
      if (!active) return;
      const focusables = active.querySelectorAll('button, [href], select, [tabindex]:not([tabindex="-1"])');
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (!active.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  /* click on the dark overlay closes the dialog (Radix parity) */
  document.addEventListener('mousedown', function (e) {
    if (!anyDialogOpen()) return;
    if (e.target.classList && e.target.classList.contains('overlay')) {
      closeDialogs(true);
      render();
    }
  });

  /* ─────────────────────────── bootstrap ────────────────────────────────── */

  Store.hydrate();
  Store.subscribe(render);
  render();
})(window);
