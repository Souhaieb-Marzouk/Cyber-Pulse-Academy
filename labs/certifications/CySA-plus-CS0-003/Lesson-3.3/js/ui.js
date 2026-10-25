// ── UI rendering layer ────────────────────────────────────────────────────────
// Every view of the original lab, rebuilt as readable template functions:
// mode select → briefing/knowledge core → floor (grid + sensor bay + feed wall
// + workbenches) → watch tasks → quiz → debrief → completion/purge dialogs.
// Content comes from data.js/objectives.js/quiz.js; DOM rendering is plain
// string templating. Transient component state (open tab, open card, filters)
// mirrors the original component-local useState semantics, including resets
// when a phase is re-entered.
(function () {
  'use strict';

  var D = window.LAB_DATA;
  var S = window.LAB_STATE;
  var OBJ = window.LAB_OBJECTIVES;
  var QUIZ = window.LAB_QUIZ.QUIZ;

  // ── helpers ─────────────────────────────────────────────────────────────────
  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function options(list, selected, emptyLabel) {
    var out = '';
    if (emptyLabel != null) {
      out += '<option value=""' + (!selected ? ' selected' : '') + '>' + esc(emptyLabel) + '</option>';
    }
    list.forEach(function (o) {
      out += '<option value="' + esc(o.value) + '"' + (selected === o.value ? ' selected' : '') + '>' + esc(o.label) + '</option>';
    });
    return out;
  }

  function ring(pct, size) {
    var r = (size - 6) / 2;
    var c = 2 * Math.PI * r;
    var half = size / 2;
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" role="img" aria-label="Sweep integrity ' + pct + ' percent">' +
      '<circle cx="' + half + '" cy="' + half + '" r="' + r + '" fill="none" stroke="#22301f" stroke-width="3"/>' +
      '<circle cx="' + half + '" cy="' + half + '" r="' + r + '" fill="none" stroke="#4ade80" stroke-width="3" stroke-dasharray="' + ((c * pct) / 100) + ' ' + c + '" stroke-linecap="round" transform="rotate(-90 ' + half + ' ' + half + ')" class="ring-progress"/>' +
      '<text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-size="9" fill="#9aa68f" font-family="monospace">' + pct + '%</text>' +
      '</svg>';
  }

  var PILLAR_ICON = { understand: 'book-open', recognize: 'scan-search', detect: 'radar', mitigate: 'shield' };

  function pillarBadge(pillar) {
    return '<span class="pillar-badge pb-' + pillar + '">' + window.icon(PILLAR_ICON[pillar], 12) + pillar + '</span>';
  }

  var FLAG_LABEL = { ok: 'OK', alert: 'ALERT', noise: 'NOISE', sanctioned: 'SANCTIONED', watch: 'WATCH', benign: 'BENIGN' };

  function flagBadge(flag) {
    return '<span class="flag-badge fb-' + flag + '">' + esc(FLAG_LABEL[flag] || String(flag).toUpperCase()) + '</span>';
  }

  function blindSpot(sensorName, zoneNote, childrenHtml) {
    return '<div class="blind-spot" role="status">' +
      window.icon('radar', 32) +
      '<div class="bs-title">No sensor — blind spot</div>' +
      '<p class="bs-text">This pane is dark because no instrument is watching it. Enable <span class="green">' + esc(sensorName) + '</span> in the Sensor Bay. ' + esc(zoneNote) + '</p>' +
      (childrenHtml || '') +
      '</div>';
  }

  // ── transient UI state (equivalents of the original component useState) ─────
  var openObjectiveId = null;
  var railInitialized = false;
  var feedGroup = 'evidence';
  var evidenceTab = 'logs';
  var workbenchTab = 'timeline';
  var kcTab = 'fundamentals';
  var logFilters = { level: 'all', source: 'all', host: 'all', q: '' };
  var cardResults = {}; // objId -> { pass, msg } (component state of ObjectiveCard)
  var openPopover = null;
  var lastTransientPhase = null;

  function resetTransient() {
    openObjectiveId = null;
    railInitialized = false;
    feedGroup = 'evidence';
    evidenceTab = 'logs';
    workbenchTab = 'timeline';
    kcTab = 'fundamentals';
    logFilters = { level: 'all', source: 'all', host: 'all', q: '' };
    cardResults = {};
    openPopover = null;
  }

  /** Reset per-mount state when the phase changes (component remount semantics). */
  function syncTransient(phase) {
    if (phase !== lastTransientPhase) {
      resetTransient();
      lastTransientPhase = phase;
    }
    var s = S.get();
    if ((s.phase === 'floor') && !railInitialized) {
      var objectives = OBJ.OBJECTIVES[s.mode];
      var firstUndone = objectives.filter(function (o) { return !(s.progress[o.id] && s.progress[o.id].done); })[0];
      openObjectiveId = (firstUndone || objectives[0]).id;
      railInitialized = true;
    }
  }

  // ══════════════════════════ MODE SELECT ══════════════════════════════════════
  var MODES = [
    {
      id: 'medium', icon: 'sun', name: 'DAY WATCH', tag: 'Standard watch · guided',
      bullets: [
        '12 granular tasks, taken in order — one learning bite each',
        'The console starts dark; you build every zone of visibility yourself',
        '3-tier hints (nudge → direction → demonstration), never blocking',
        'Tolerant checks: synonyms accepted, wrong answers teach, never punish',
        'Knowledge check comes after practice, in a supportive tone'
      ],
      cta: 'Take the day watch'
    },
    {
      id: 'hard', icon: 'moon', name: 'NIGHT WATCH', tag: 'Challenge watch · discovery',
      bullets: [
        '9 broad, multi-step challenges spanning the whole incident',
        'You inherit a half-broken console mid-incident — find the defects yourself',
        'Noisy evidence with planted red herrings; separate signal from noise',
        'Strict checks: exact values, exact order, state-based validation',
        'At most one optional nudge — and it visibly costs stars'
      ],
      cta: 'Take the night watch'
    }
  ];

  function renderModeScreen() {
    var cards = MODES.map(function (m, i) {
      return '<button type="button" class="mode-card anim-' + (i + 2) + '" data-action="mode-set" data-mode="' + m.id + '" aria-label="' + esc(m.cta) + ': ' + esc(m.tag) + '">' +
        '<span class="mode-head"><span class="mode-icon">' + window.icon(m.icon, 20) + '</span>' +
        '<span class="mode-id"><span class="mode-name">' + m.name + '</span><span class="mode-tag">' + esc(m.tag) + '</span></span></span>' +
        '<ul class="mode-bullets">' + m.bullets.map(function (b) { return '<li><span class="bullet-dot"></span>' + esc(b) + '</li>'; }).join('') + '</ul>' +
        '<span class="mode-cta">' + esc(m.cta) + ' →</span>' +
        '</button>';
    }).join('');

    return '<div class="mode-screen">' +
      '<div class="mode-hero anim-1">' +
      '<div class="plaque">CompTIA CySA+ CS0-003 · Lesson 3.3</div>' +
      '<h1 class="mode-title">Maintaining Operational Visibility</h1>' +
      '<p class="mode-lede">You have been sworn in as watch officer of the <span class="green">Operations Visibility Center</span> at Aurelia Freight &amp; Logistics. Overnight, something moved through the estate. Choose your watch: learn the craft step by step, or inherit the broken console and prove you can run it in the dark.</p>' +
      '</div>' +
      '<div class="mode-grid">' + cards + '</div>' +
      '<p class="mode-disclaimer">SIMULATED TRAINING ENVIRONMENT — every organization, host, account, IP address and log line is synthetic (TEST-NET ranges). Defensive/educational framing only. Progress auto-saves in your browser.</p>' +
      '</div>';
  }

  // ══════════════════════════ HEADER (status strip) ════════════════════════════
  var PHASES = [
    { id: 'briefing', label: 'Briefing' },
    { id: 'floor', label: 'Floor' },
    { id: 'debrief', label: 'Debrief' },
    { id: 'check', label: 'Check' }
  ];

  function renderShell(s) {
    var objectives = OBJ.OBJECTIVES[s.mode];
    var doneCount = objectives.filter(function (o) { return s.progress[o.id] && s.progress[o.id].done; }).length;
    var allDone = objectives.length > 0 && doneCount === objectives.length;
    var stars = OBJ.computeStars(s.progress, objectives.length);
    var eligible = allDone && s.quizSubmitted;
    var sensorsOn = Object.keys(s.sensors).filter(function (k) { return s.sensors[k]; }).length;

    var phaseBtns = PHASES.map(function (p) {
      var locked = p.id === 'debrief' ? !(s.mode === 'hard' || doneCount >= 6)
        : p.id === 'check' ? !(s.mode === 'hard' || allDone) : false;
      var active = s.phase === p.id;
      var title = locked ? (p.id === 'debrief' ? 'Unlocks at 6 validated tasks' : 'Unlocks when every task is validated') : null;
      return '<button type="button" class="phase-btn' + (active ? ' active' : '') + (locked ? ' locked' : '') + '"' +
        ' data-action="phase-set" data-phase="' + p.id + '" data-fk="phase-' + p.id + '"' +
        (locked ? ' disabled title="' + title + '"' : '') +
        (active ? ' aria-current="page"' : '') + '>' +
        (locked ? window.icon('lock', 12, 'lock-ic') : '') + p.label + '</button>';
    }).join('');

    var main = '';
    if (s.phase === 'briefing') main = renderBriefing(s);
    else if (s.phase === 'floor') main = renderFloor(s);
    else if (s.phase === 'debrief') main = renderDebrief();
    else if (s.phase === 'check') main = renderQuiz(s);

    return '<a href="#main" class="skip-link">Skip to console</a>' +
      '<header class="strip">' +
      '<div class="strip-inner">' +
      '<div class="brand">' +
      '<span class="brand-mark"><span class="pulse-dot"></span></span>' +
      '<span class="brand-text"><span class="plaque">Aurelia Freight &amp; Logistics</span><span class="brand-title">Operations Visibility Center</span></span>' +
      '<span class="sim-badge">Simulated training data</span>' +
      '</div>' +
      '<nav aria-label="Watch phases" class="phase-nav">' + phaseBtns + '</nav>' +
      '<div class="strip-right">' +
      '<span class="stat-block" aria-label="Tasks ' + doneCount + ' of ' + objectives.length + ', quality ' + stars.pct + '%">' +
      ring(stars.pct, 38) +
      '<span class="stat-text">TASKS <b class="stat-num">' + doneCount + '/' + objectives.length + '</b><br>SENSORS <b class="stat-num">' + sensorsOn + '</b></span>' +
      '</span>' +
      (eligible ? '<button type="button" class="btn btn-amber btn-sm" data-action="open-clearance" data-fk="clearance">' + window.icon('sparkles', 14) + ' Clearance</button>' : '') +
      '<button type="button" class="btn btn-outline btn-sm purge-btn" aria-label="Purge and restart the watch" data-action="purge-open" data-fk="purge">' + window.icon('rotate-ccw', 14) + ' Purge</button>' +
      '</div>' +
      '</div>' +
      '</header>' +
      '<main id="main" class="main">' + main + '</main>';
  }

  // ══════════════════════════ BRIEFING + KNOWLEDGE CORE ════════════════════════
  var ACTION_ICONS = { scan: 'scan-search', fence: 'fence', shield: 'shield' };

  function term(t) {
    var entry = null;
    for (var i = 0; i < D.GLOSSARY.length; i++) {
      if (D.GLOSSARY[i].term.toLowerCase() === t.toLowerCase()) { entry = D.GLOSSARY[i]; break; }
    }
    if (!entry) return '<span>' + esc(t) + '</span>';
    var key = 'term-' + t;
    var pop = '';
    if (openPopover === key) {
      pop = '<span class="popover pop-top" role="dialog"><span class="pop-term">' + esc(entry.term) + '</span>' + esc(entry.def) + '</span>';
    }
    return '<span class="pop-wrap"><button type="button" class="term" aria-label="Definition of ' + esc(entry.term) + '" data-action="pop" data-key="' + esc(key) + '">' + esc(entry.term) + '</button>' + pop + '</span>';
  }

  function renderBriefing(s) {
    var kcTabs = [
      { id: 'fundamentals', label: 'Fundamentals', icon: 'book-open' },
      { id: 'sources', label: 'Data Sources', icon: 'scan-search' },
      { id: 'attacker', label: 'Attacker’s View', icon: 'shield' },
      { id: 'glossary', label: 'Glossary', icon: 'book-open' }
    ];

    var tablist = '<div class="tab-strip scroll-slim" role="tablist" aria-label="Knowledge core">' +
      kcTabs.map(function (t) {
        return '<button type="button" role="tab" aria-selected="' + (kcTab === t.id) + '" class="tab' + (kcTab === t.id ? ' active' : '') + '" data-action="kc-tab" data-tab="' + t.id + '" data-fk="kc-' + t.id + '">' + window.icon(t.icon, 14, 'tab-ic') + ' ' + t.label + '</button>';
      }).join('') + '</div>';

    var panel = '';
    if (kcTab === 'fundamentals') {
      panel = '<p class="kc-lede">The key to effective security operations is ' + term('Operational Visibility') + ': identifying, containing and protecting all data, so teams can quickly identify and respond to unauthorized access events — and prove compliance, correct handling, and control over <span class="mono green">who, when, where, how</span> resources are accessed.</p>' +
        '<div class="fund-grid">' + D.CORE_FUNDAMENTALS.map(function (f) {
          return '<div class="mini-card"><span class="fund-icon">' + window.icon(ACTION_ICONS[f.icon], 16) + '</span><span class="fund-action">' + f.action + '</span><p class="mini-text">' + esc(f.text) + '</p></div>';
        }).join('') + '</div>' +
        '<p class="kc-note">Where it sits in the chain: visibility is not a phase — it is the continuous ground the whole attack chain plays out on. Attackers probe where it is thin; defenders win where it is deep. (Simplified for training.)</p>';
    } else if (kcTab === 'sources') {
      panel = '<ul class="source-list">' + D.CORE_SOURCE_TAXONOMY.map(function (src) {
        return '<li class="mini-card"><span class="source-name">' + esc(src.name) + '</span><span class="source-detail">' + esc(src.detail) + '</span></li>';
      }).join('') + '</ul>';
    } else if (kcTab === 'attacker') {
      panel = D.CORE_ATTACKER_VIEW.map(function (v) {
        return '<div class="mini-card"><div class="attacker-title">' + esc(v.title) + '</div><p class="mini-text">' + esc(v.body) + '</p></div>';
      }).join('') +
        '<div class="composite-card"><div class="composite-title">Composite scenarios (dramatized from public incident reporting)</div><ul class="composite-list">' +
        D.CORE_EXAMPLES.map(function (e) { return '<li><strong>' + esc(e.title) + '.</strong> ' + esc(e.body) + '</li>'; }).join('') +
        '</ul></div>' +
        '<div class="mini-card"><div class="mitre-title">MITRE alignment (simplified)</div><ul class="mitre-list">' +
        D.MITRE_ALIGNMENT.map(function (m) {
          return '<li><a href="' + esc(m.href) + '" target="_blank" rel="noreferrer" class="mitre-link">' + esc(m.label) + ' ' + window.icon('external-link', 12) + '</a><span class="mitre-note">— ' + esc(m.note) + '</span></li>';
        }).join('') + '</ul></div>';
    } else {
      panel = '<div class="glossary-grid">' + D.GLOSSARY.map(function (g) {
        return '<div class="mini-card"><div class="glossary-term">' + esc(g.term) + '</div><p class="mini-text">' + esc(g.def) + '</p></div>';
      }).join('') + '</div>';
    }

    return '<div class="briefing-grid">' +
      '<section class="brief-card">' +
      '<div class="plaque">C1 · Mission Briefing — eyes only</div>' +
      '<h2 class="h2">The night shift at Aurelia</h2>' +
      '<div class="brief-copy">' +
      '<p><strong class="bright">09:07 —</strong> Aurelia Freight &amp; Logistics moves freight for 400+ mid-market customers. Last night, between 02:00 and 04:00, something crossed the estate. The morning SOC cannot say what, because it cannot say <em>where it can even look</em>: parts of the console are dark, and dark zones keep no stories.</p>' +
      '<p>You are the watch officer. Your mandate is the chapter itself: ' + term('Operational Visibility') + ' — <strong class="green">identify</strong> every asset and data set, <strong class="green">contain</strong> who can reach them, and <strong class="green">protect</strong> how they are handled — so that unauthorized access is found fast, response is possible, and compliance can be proven.</p>' +
      '<p>The instrument panel is real (simulated): relays, taps, baselines, brokers. Light the zones, read the feeds, build the timeline, and answer the only question that matters at 09:07: <em>what moved, and how do we make sure it never moves again?</em></p>' +
      '</div>' +
      '<div class="cert-card"><div class="cert-kicker">Certification relevance</div>CompTIA CySA+ CS0-003 · Lesson 3.3 “Maintaining Operational Visibility” — this lesson supports Domain 4 of the CS0-003 blueprint (<span class="green">Security Operations and Monitoring</span>: how security data is collected, monitored and analyzed), with dashboards &amp; reports supporting reporting practice. Sub-objective numbering varies by curriculum — match it to your own study guide. Every task below is an exam concept made hands-on.</div>' +
      '<button type="button" class="btn btn-primary btn-block btn-tall" data-action="take-floor">Take the floor ' + window.icon('arrow-right', 16) + '</button>' +
      '</section>' +
      '<section class="kc-card">' +
      '<div class="section-head"><div class="plaque">C2 · Knowledge Core</div><h2 class="h2">What you are operating</h2></div>' +
      tablist +
      '<div class="tab-panel" role="tabpanel">' + panel + '</div>' +
      '</section>' +
      '</div>';
  }

  // ══════════════════════════ FLOOR: COVERAGE GRID ═════════════════════════════
  function zoneState(sensors, ids) {
    var lit = ids.filter(function (id) { return sensors[id]; }).length;
    if (lit === 0) return 'dark';
    if (lit === ids.length) return 'full';
    return 'partial';
  }
  var ZONE_LABEL = { full: 'COVERED', partial: 'PARTIAL', dark: 'BLIND' };

  function renderCoverageGrid(s) {
    var totalRequired = D.ZONES.reduce(function (n, z) { return n + z.sensors.length; }, 0) + 2;
    var lit = D.ZONES.reduce(function (n, z) { return n + z.sensors.filter(function (id) { return s.sensors[id]; }).length; }, 0) +
      (s.sensors.syslogRelay ? 1 : 0) + (s.sensors.ntpSync ? 1 : 0);
    var pct = Math.round((lit / totalRequired) * 100);

    var tiles = D.ZONES.map(function (z) {
      var st = zoneState(s.sensors, z.sensors);
      var litCount = z.sensors.filter(function (id) { return s.sensors[id]; }).length;
      var key = 'zone-' + z.id;
      var pop = '';
      if (openPopover === key) {
        pop = '<span class="popover pop-bottom" role="dialog"><span class="pop-term">' + esc(z.name) + '</span><p class="pop-blurb">' + esc(z.blurb) + '</p>' +
          '<ul class="pop-list">' + z.sensors.map(function (id) {
            return '<li><span class="pop-sensor">' + esc(D.SENSOR_BY_ID[id].name) + '</span><span class="' + (s.sensors[id] ? 'green' : 'dim') + '">' + (s.sensors[id] ? '● live' : '○ off') + '</span></li>';
          }).join('') + '</ul><p class="pop-note">Toggle these instruments in the Sensor Bay.</p></span>';
      }
      return '<span class="pop-wrap zone-wrap">' +
        '<button type="button" class="zone-tile zt-' + st + '" aria-label="Zone ' + esc(z.name) + ': ' + ZONE_LABEL[st] + ' — ' + litCount + ' of ' + z.sensors.length + ' sensors. Show details." data-action="pop" data-key="' + key + '" data-fk="' + key + '">' +
        '<span class="zone-row"><span class="zone-name">' + esc(z.name) + '</span><span class="zone-dot zd-' + st + '"></span></span>' +
        '<span class="zone-sub">' + ZONE_LABEL[st] + ' · ' + litCount + '/' + z.sensors.length + '</span>' +
        '</button>' + pop + '</span>';
    }).join('');

    var central = '<div class="central-tile"><span class="central-name">Central</span>' +
      '<span class="central-lines"><span class="' + (s.sensors.syslogRelay ? 'green' : 'dim') + '">relay ' + (s.sensors.syslogRelay ? '●' : '○') + '</span>' +
      '<span class="' + (s.sensors.ntpSync ? 'green' : 'dim') + '">ntp ' + (s.sensors.ntpSync ? '●' : '○') + '</span></span></div>';

    return '<div class="panel-card grid-card">' +
      '<span class="radar-sweep" aria-hidden="true"></span>' +
      '<div class="grid-head">' +
      '<div><div class="plaque">Aurelia Freight &amp; Logistics · data estate</div><h2 class="h2-sm">Coverage Grid</h2></div>' +
      '<div class="grid-ring">' + ring(pct, 44) + '<span class="ring-text">SWEEP INTEGRITY<br><b class="ring-num">' + lit + '/' + totalRequired + ' instruments</b></span></div>' +
      '</div>' +
      '<div class="zone-grid">' + tiles + central + '</div>' +
      '</div>';
  }

  // ══════════════════════════ FLOOR: SENSOR BAY ════════════════════════════════
  function switchBtn(s, id) {
    var on = !!s.sensors[id];
    var name = D.SENSOR_BY_ID[id].name;
    return '<button type="button" role="switch" aria-checked="' + on + '" aria-label="Toggle ' + esc(name) + '" class="switch' + (on ? ' on' : '') + '" data-action="toggle-sensor" data-id="' + id + '" data-fk="sw-' + id + '"><span class="switch-knob"></span></button>';
  }

  var FEED_LABEL = { logs: 'log stream', pcap: 'packet capture', flow: 'traffic flow', iam: 'access report', assets: 'asset inventory', fim: 'file integrity', casb: 'saas discovery', vuln: 'vuln scan' };

  function renderSensorBay(s) {
    var central = D.SENSORS.filter(function (x) { return x.zone === 'central'; });
    var groups = D.ZONES.map(function (z) {
      return { zone: z, list: D.SENSORS.filter(function (x) { return x.zone === z.id; }) };
    });

    var centralRows = central.map(function (sn) {
      var extra = '';
      if (sn.id === 'syslogRelay') {
        extra = '<span class="relay-row"><span class="relay-label">Forward level ≥</span>' +
          '<span class="select-wrap"><select class="select select-xs" aria-label="Relay forwarded level" data-action="relay-level" data-fk="relay-level">' +
          options(D.LOG_LEVEL_ORDER.map(function (l) { return { value: l, label: l }; }), s.relayLevel) +
          '</select></span></span>';
      }
      if (sn.id === 'ntpSync') {
        extra = '<div class="skew-card"><div class="skew-head">Recorded pre-sync drift' + (s.sensors.ntpSync ? ' <span class="green">· now synchronized ✓</span>' : '') + '</div>' +
          '<div class="skew-grid">' + D.HOST_SKEW.map(function (h) {
            return '<span class="skew-cell"><span>' + h.host + '</span><span class="' + (Math.abs(h.skew) >= 7 ? 'red' : '') + '">' + (h.skew >= 0 ? '+' : '') + h.skew + 'm</span></span>';
          }).join('') + '</div></div>';
      }
      return '<div class="sensor-row"><span class="sensor-top"><span class="sensor-name">' + esc(sn.name) + '</span>' + switchBtn(s, sn.id) + '</span>' +
        '<p class="sensor-desc">' + esc(sn.short) + '</p>' + extra + '</div>';
    }).join('');

    var groupCards = groups.map(function (g) {
      var rows = g.list.map(function (sn) {
        return '<div class="sensor-row"><span class="sensor-top"><span class="sensor-name">' + esc(sn.name) + '</span>' + switchBtn(s, sn.id) + '</span>' +
          '<p class="sensor-desc">' + esc(sn.short) + '</p>' +
          (sn.feed ? '<span class="powers-badge">powers: ' + FEED_LABEL[sn.feed] + '</span>' : '') +
          '</div>';
      }).join('');
      return '<div class="sensor-group"><span class="sg-head">' + window.icon('boxes', 16, 'dim-ic') + '<span class="plaque">' + esc(g.zone.name) + '</span></span>' + rows + '</div>';
    }).join('');

    return '<div class="space-y">' +
      '<div class="sensor-group main-sensor-group"><span class="sg-head">' + window.icon('satellite', 16, 'green-ic') + '<span class="plaque">Sensor Bay — Central Services</span></span>' + centralRows + '</div>' +
      groupCards +
      '</div>';
  }

  // ══════════════════════════ FLOOR: EVIDENCE FEEDS ════════════════════════════
  var SOURCE_SENSOR = { system: 'systemLogs', application: 'appLogs', security: 'securityLogs' };

  function logStreamBody(s) {
    var relayLevel = s.relayLevel;
    var ntpOn = !!s.sensors.ntpSync;
    var skew = {};
    D.HOST_SKEW.forEach(function (h) { skew[h.host] = h.skew; });

    var anySource = ['systemLogs', 'appLogs', 'securityLogs'].some(function (id) { return s.sensors[id]; });
    var entries = D.LOGS.filter(function (l) {
      if (!s.sensors[SOURCE_SENSOR[l.source]]) return false;
      if (!D.levelAtLeast(l.level, relayLevel)) return false;
      if (logFilters.level !== 'all' && l.level !== logFilters.level) return false;
      if (logFilters.source !== 'all' && l.source !== logFilters.source) return false;
      if (logFilters.host !== 'all' && l.host !== logFilters.host) return false;
      if (logFilters.q && l.msg.toLowerCase().indexOf(logFilters.q.toLowerCase()) < 0) return false;
      return true;
    });
    var shown = entries.slice(0, 100);
    var hosts = Array.from(new Set(D.LOGS.map(function (l) { return l.host; })));
    var LEVEL_COLOR = { DEBUG: 'lv-debug', INFO: 'lv-info', WARNING: 'lv-warning', ERROR: 'lv-error', CRITICAL: 'lv-critical' };

    var rows = shown.map(function (l) {
      var t = ntpOn ? l.time : D.applySkew(l.time, skew[l.host] || 0);
      var mark = (!ntpOn && (skew[l.host] || 0) !== 0) ? '<span class="skew-mark">±</span>' : '';
      return '<tr><td class="nowrap dim-cell">' + t + mark + '</td><td class="nowrap host-cell">' + l.host + '</td><td class="nowrap src-cell">' + l.source.slice(0, 3).toUpperCase() + '</td><td class="nowrap lvl-cell ' + LEVEL_COLOR[l.level] + '">' + l.level + '</td><td class="msg-cell">' + esc(l.msg) + '</td></tr>';
    }).join('');
    if (shown.length === 0) {
      rows = '<tr><td colspan="5" class="empty-cell">No entries match the current filters.</td></tr>';
    }

    return (anySource ? '' : '<div class="notice">The relay is live but no log source is enabled — enable System / Application / Security Logs in the Sensor Bay.</div>') +
      '<div id="log-stream-body">' +
      '<div class="scroll-box scroll-slim log-scroll" data-fk="log-scroll" role="log" aria-label="Aggregated log stream">' +
      '<table class="feed-table"><thead><tr><th>Time</th><th>Host</th><th>Src</th><th>Lvl</th><th>Message</th></tr></thead><tbody>' + rows + '</tbody></table>' +
      '</div>' +
      '<div class="log-footer"><span>Showing ' + shown.length + ' of ' + entries.length + ' entries · threshold <span class="green">' + relayLevel + '</span></span>' +
      (!ntpOn ? '<span class="skew-warn">⚠ Clock skew detected — timestamps uncorrected (± drift per host)</span>' : '') +
      (entries.length > shown.length ? '<span>Raise the threshold or narrow filters to see fewer rows.</span>' : '') +
      '</div></div>';
  }

  function renderLogStream(s) {
    if (!s.sensors.syslogRelay) {
      return '<div id="log-stream-root">' + blindSpot('Syslog Relay & Aggregator', 'The relay is the single pipe every log source flows through — without it the console has no stream at all.') + '</div>';
    }
    var hosts = Array.from(new Set(D.LOGS.map(function (l) { return l.host; })));
    var filters =
      '<span class="select-wrap"><select class="select" aria-label="Filter by level" data-action="log-filter" data-f="level" data-fk="log-f-level">' +
      options([{ value: 'all', label: 'Level: any' }].concat(D.LOG_LEVEL_ORDER.map(function (l) { return { value: l, label: l }; })), logFilters.level) + '</select></span>' +
      '<span class="select-wrap"><select class="select" aria-label="Filter by source" data-action="log-filter" data-f="source" data-fk="log-f-source">' +
      options([{ value: 'all', label: 'Source: any' }, { value: 'system', label: 'System' }, { value: 'application', label: 'Application' }, { value: 'security', label: 'Security' }], logFilters.source) + '</select></span>' +
      '<span class="select-wrap"><select class="select" aria-label="Filter by host" data-action="log-filter" data-f="host" data-fk="log-f-host">' +
      options([{ value: 'all', label: 'Host: any' }].concat(hosts.map(function (h) { return { value: h, label: h }; })), logFilters.host) + '</select></span>' +
      '<input class="input" value="' + esc(logFilters.q) + '" placeholder="Search messages…" aria-label="Search log messages" data-log-search data-fk="log-q">';

    return '<div class="space-y"><div class="filter-grid" role="group" aria-label="Log stream filters">' + filters + '</div>' +
      '<div id="log-stream-root">' + logStreamBody(s) + '</div></div>';
  }

  function renderPcapFeed(s) {
    if (!s.sensors.packetCapture) return blindSpot('Packet Capture (Edge Tap)', 'Bulk exfiltration that no host will ever log is plainly visible here.');
    var rows = D.PCAP.map(function (r) {
      return '<tr class="' + (r.flag === 'alert' ? 'row-alert' : '') + '"><td>' + r.time + '</td><td class="host-cell">' + r.src + '</td><td class="bright-cell">' + esc(r.dst) + '</td><td class="dim-cell">' + r.proto + '</td><td class="bright-cell semibold">' + r.bytes + '</td><td>' + flagBadge(r.flag) + '</td></tr>';
    }).join('');
    return '<div class="scroll-box scroll-slim maxh-420"><table class="feed-table"><thead><tr><th>Time</th><th>Source</th><th>Destination</th><th>Proto</th><th>Bytes</th><th>Status</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  function renderFlowFeed(s) {
    if (!s.sensors.flowMonitor) return blindSpot('Network Traffic Analyzer', 'Flow summaries turn millions of packets into a ranked list of top talkers.');
    var max = Math.max.apply(null, D.FLOWS.map(function (f) { return f.volumeMB; }));
    return '<div class="space-y"><div class="plaque">Top talkers · 22:00–04:00</div>' + D.FLOWS.map(function (f) {
      var vol = f.volumeMB >= 1024 ? (f.volumeMB / 1024).toFixed(1) + ' GB' : f.volumeMB + ' MB';
      return '<div class="flow-row ' + (f.flag === 'alert' ? 'row-alert-box' : '') + '">' +
        '<div class="flow-top"><span class="bright-cell">' + esc(f.pair) + '</span><span class="flow-vol"><b class="bright">' + vol + '</b>' + flagBadge(f.flag) + '</span></div>' +
        '<div class="flow-bar"><div class="flow-fill ' + (f.flag === 'alert' ? 'fill-alert' : 'fill-ok') + '" style="width:' + ((f.volumeMB / max) * 100) + '%"></div></div>' +
        '<div class="flow-note">' + esc(f.note) + '</div></div>';
    }).join('') + '</div>';
  }

  function renderIamFeed(s) {
    if (!s.sensors.accessReview) return blindSpot('Access Review Collector', 'Access reviews answer who / when / where / how — and double as audit evidence.');
    var rows = D.IAM.map(function (r) {
      return '<tr class="' + (r.flag === 'alert' ? 'row-alert' : '') + '"><td class="bright-cell semibold">' + r.user + '</td><td class="host-cell">' + r.action + '</td><td class="bright-cell">' + esc(r.resource) + '</td><td class="nowrap dim-cell">' + r.when + '</td><td class="dim-cell">' + esc(r.where) + '</td><td class="host-cell">' + r.how + '</td><td>' + flagBadge(r.flag) + '</td></tr>';
    }).join('');
    var pam = s.sensors.pamVault
      ? '<div class="space-y-xs">' + D.PAM_RECORDS.map(function (p) {
        return '<div class="pam-row"><span class="semibold bright-cell">' + esc(p.session) + '</span><span class="pam-finding">— ' + esc(p.finding) + '</span></div>';
      }).join('') + '</div>'
      : '<div class="pam-off">Privileged sessions are unrecorded — enable <span class="green">PAM</span> to vault credentials and see what privileged accounts actually do.</div>';
    return '<div class="space-y"><div class="scroll-box scroll-slim maxh-300"><table class="feed-table"><thead><tr><th>User</th><th>Action</th><th>Resource</th><th>When</th><th>Where</th><th>How</th><th>Status</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<div><div class="plaque mb-xs">Privileged session records (PAM)</div>' + pam + '</div></div>';
  }

  function renderAssetsFeed(s) {
    if (!s.sensors.discoveryAgent) {
      return blindSpot('Asset Discovery Agent', 'An unmanaged asset is an invisible one — and invisible assets cannot be classified, patched or defended.', '<div class="bs-count">0 of ' + D.ASSET_TOTAL + ' assets identified</div>');
    }
    var unclassified = D.ASSETS.filter(function (a) { return a.classification === 'unclassified' && !s.classification[a.id]; });
    var realRows = D.ASSETS.map(function (a) {
      var val = s.classification[a.id] || a.pre || '';
      var clsCell;
      if (a.classification === 'unclassified') {
        clsCell = '<span class="select-wrap"><select class="select select-cls" aria-label="Classify ' + esc(a.name) + '" data-action="classify" data-asset="' + a.id + '" data-fk="cls-' + a.id + '">' +
          '<option value=""' + (!val ? ' selected' : '') + '>Unclassified — set</option>' +
          options([{ value: 'public', label: 'Public' }, { value: 'internal', label: 'Internal' }, { value: 'restricted', label: 'Restricted' }], val) +
          '</select></span>';
      } else {
        clsCell = '<span class="dim-cell">' + esc(val) + '</span>';
      }
      return '<tr><td class="dim-cell">' + a.id + '</td><td class="bright-cell semibold">' + a.name + '</td><td class="host-cell">' + a.kind + '</td><td class="bright-cell">' + esc(a.data) + '</td><td>' + clsCell + '</td></tr>';
    }).join('');
    var fillerRows = D.FILLER_ASSETS.map(function (a) {
      return '<tr class="filler-row"><td class="dim-cell">' + a.id + '</td><td class="host-cell">—</td><td class="dim-cell">' + a.kind + '</td><td class="dim-cell">no sensitive data flagged</td><td class="dim-cell">' + a.cls + '</td></tr>';
    }).join('');
    return '<div class="space-y">' +
      '<div class="assets-head"><div class="plaque">Discovered estate</div><span class="assets-badge">' + D.ASSET_TOTAL + ' / ' + D.ASSET_TOTAL + ' assets</span></div>' +
      '<div class="scroll-box scroll-slim maxh-320"><table class="feed-table"><thead><tr><th>ID</th><th>Asset</th><th>Kind</th><th>Data</th><th>Classification</th></tr></thead><tbody>' + realRows + fillerRows + '</tbody></table></div>' +
      (unclassified.length > 0 ? '<div class="amber-note">⚠ ' + unclassified.length + ' sensitive asset(s) still unclassified — identification is the first act of protection.</div>' : '') +
      '</div>';
  }

  function renderFimFeed(s) {
    if (!s.sensors.fim) return blindSpot('File Integrity Monitoring', 'FIM is the earliest tripwire for tampering and persistence.');
    var rows = D.FIM.map(function (r) {
      return '<tr class="' + (r.flag === 'alert' ? 'row-alert' : '') + '"><td class="bright-cell">' + esc(r.path) + (r.note ? '<div class="fim-note">' + esc(r.note) + '</div>' : '') + '</td><td class="host-cell">' + r.host + '</td><td class="dim-cell">' + r.baseline + '</td><td class="dim-cell">' + r.current + '</td><td class="dim-cell">' + r.when + '</td><td>' + flagBadge(r.flag) + '</td></tr>';
    }).join('');
    return '<div class="scroll-box scroll-slim maxh-420"><table class="feed-table"><thead><tr><th>Path</th><th>Host</th><th>Baseline</th><th>Current</th><th>When</th><th>Status</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  function renderCasbFeed(s) {
    if (!s.sensors.casb) return blindSpot('CASB — SaaS Discovery', 'To the firewall, SaaS sync is plain HTTPS; only a CASB names the app behind it.');
    return '<div class="saas-grid">' + D.SAAS_APPS.map(function (a) {
      return '<div class="saas-card ' + (a.risk === 'HIGH' ? 'row-alert-box' : '') + '">' +
        '<div class="saas-head"><span class="sensor-name">' + esc(a.name) + '</span>' +
        '<span class="saas-badge ' + (a.status === 'sanctioned' ? 'sb-sanctioned' : 'sb-unsanctioned') + '">' + a.status + '</span>' +
        (a.risk !== '—' ? '<span class="saas-risk ' + (a.risk === 'HIGH' ? 'sr-high' : 'sr-low') + '">' + a.risk + ' RISK</span>' : '') +
        '</div><p class="mini-text">' + esc(a.detail) + '</p><p class="saas-users">users: ' + esc(a.users) + '</p></div>';
    }).join('') + '</div>';
  }

  function renderVulnFeed(s) {
    if (!s.sensors.vulnScanner) return blindSpot('Vulnerability Scanner', 'Scanning reveals the exposure an attacker would find — before or while they do.');
    var SEV = { CRITICAL: 'sev-critical', HIGH: 'sev-high', MEDIUM: 'sev-medium', LOW: 'sev-low' };
    return '<div class="space-y"><div class="plaque">Scanner output (simulated)</div>' + D.VULNS.map(function (v) {
      return '<div class="vuln-row"><span class="sev-badge ' + SEV[v.sev] + '">' + v.sev + '</span><span class="bright-cell">' + v.asset + '</span><span class="dim-cell">' + esc(v.vid) + '</span><span class="vuln-title">' + esc(v.title) + '</span></div>';
    }).join('') + '</div>';
  }

  // ══════════════════════════ FLOOR: WORKBENCHES ═══════════════════════════════
  function renderTimelineWB(s) {
    var ntpOn = !!s.sensors.ntpSync;
    var target = s.mode === 'hard' ? D.HARD_SEQ : D.MEDIUM_SEQ;
    var skew = {};
    D.HOST_SKEW.forEach(function (h) { skew[h.host] = h.skew; });

    var intro = '<div class="notice">Contact board: pin the evidence that tells the incident’s story, in chronological order.' +
      (s.mode === 'medium' ? ' Medium watch: pin exactly three events — the failed-logon burst, the manifests access, the log clearing.' : ' Night watch: reconstruct the full chain — every event that matters.') +
      (!ntpOn ? ' Without NTP the order you see is a lie — clocks disagree by minutes.' : '') +
      '</div>';

    var chips = D.TIMELINE_EVENTS.map(function (e) {
      var visible = e.needs.some(function (n) { return s.sensors[n]; });
      var pinned = s.timeline.indexOf(e.id) >= 0;
      var disabled = !visible || pinned;
      return '<button type="button" class="tl-chip' + (!visible ? ' unavail' : pinned ? ' pinned' : '') + '"' +
        ' data-action="pin-toggle" data-id="' + e.id + '"' +
        ' aria-label="' + esc(visible ? 'Pin event: ' + e.label : 'Evidence unavailable — requires sensor: ' + e.needs.join(' or ')) + '"' +
        (disabled ? ' disabled' : '') + '>' +
        '<span class="chip-time">' + e.time + '</span> ' + esc(visible ? e.label : 'evidence blind — needs ' + e.needs.join(' / ')) +
        '</button>';
    }).join('');

    var pinnedList = '';
    if (s.timeline.length === 0) {
      pinnedList = '<div class="empty-board">Nothing pinned yet — click chips above.</div>';
    } else {
      pinnedList = '<ol class="tl-list">' + s.timeline.map(function (id, i) {
        var e = null;
        for (var j = 0; j < D.TIMELINE_EVENTS.length; j++) if (D.TIMELINE_EVENTS[j].id === id) { e = D.TIMELINE_EVENTS[j]; break; }
        var t = ntpOn ? e.time : D.applySkew(e.time, skew[D.EVENT_HOST[e.id]] || 0);
        return '<li class="tl-item"><span class="tl-num">' + (i + 1) + '</span>' +
          '<span class="' + (ntpOn ? 'dim-cell' : 'red-cell') + '">' + t + '</span>' +
          '<span class="tl-label">' + esc(e.label) + '</span>' +
          '<span class="tl-scene">' + esc(e.scene) + '</span>' +
          '<span class="tl-actions">' +
          '<button type="button" class="icon-btn" aria-label="Move event ' + (i + 1) + ' up" data-action="pin-move" data-id="' + id + '" data-dir="-1"' + (i === 0 ? ' disabled' : '') + '>' + window.icon('arrow-up', 14) + '</button>' +
          '<button type="button" class="icon-btn" aria-label="Move event ' + (i + 1) + ' down" data-action="pin-move" data-id="' + id + '" data-dir="1"' + (i === s.timeline.length - 1 ? ' disabled' : '') + '>' + window.icon('arrow-down', 14) + '</button>' +
          '<button type="button" class="icon-btn" aria-label="Unpin event ' + (i + 1) + '" data-action="pin-toggle" data-id="' + id + '">' + window.icon('x', 14) + '</button>' +
          '</span></li>';
      }).join('') + '</ol>';
    }

    return '<div class="space-y">' + intro +
      '<div><div class="plaque mb-xs">Available evidence chips</div><div class="tl-chips">' + chips + '</div></div>' +
      '<div><div class="plaque mb-xs">Pinned sequence' + (s.timeline.length > 0 ? ' · ' + s.timeline.length + '/' + target.length : '') + '</div>' + pinnedList +
      (s.timeline.length > 0 ? '<button type="button" class="link-btn" data-action="pin-clear">' + window.icon('archive-restore', 14) + ' Clear board</button>' : '') +
      '</div></div>';
  }

  function renderDashboardWB(s) {
    var cards = D.WIDGETS.map(function (w) {
      var sel = s.dashboard.indexOf(w.id) >= 0;
      return '<button type="button" class="widget-card' + (sel ? ' selected' : '') + '" aria-pressed="' + sel + '" aria-label="Widget: ' + esc(w.name) + '" data-action="widget-toggle" data-id="' + w.id + '" data-fk="w-' + w.id + '">' +
        '<span class="widget-top">' + window.icon('layout-dashboard', 14, sel ? 'green-ic' : 'dim-ic') + '<span class="sensor-name">' + esc(w.name) + '</span></span>' +
        '<p class="mini-text">' + esc(w.desc) + '</p></button>';
    }).join('');
    return '<div class="space-y"><div class="notice">Build the “Unauthorized Access Detection” pack: pick the four widgets that together watch entry → access → tampering → exfiltration. A dashboard watched daily is continuous monitoring.</div>' +
      '<div class="widget-grid">' + cards + '</div>' +
      '<div class="count-row"><span>Selected: ' + s.dashboard.length + ' of 8 · the pack requires exactly 4</span>' +
      (s.dashboard.length === 4 ? '<span class="green">Pack size reached — run the CHECK on task 11.</span>' : '') +
      '</div></div>';
  }

  function renderResponseDesk(s) {
    var answers = (s.answers && s.answers['OBJ-M12']) || {};
    var rows = D.FINDINGS.map(function (f) {
      return '<div class="mini-card finding-card"><div class="finding-text">' + window.icon('clipboard-check', 16, 'amber-ic') + '<p class="finding-p">' + esc(f.text) + '</p></div>' +
        '<div class="field sm-max"><span class="select-wrap"><select class="select" aria-label="Action for finding ' + f.id + '" data-action="field-set" data-obj="OBJ-M12" data-field="' + f.id + '" data-fk="ans-OBJ-M12-' + f.id + '">' +
        options(D.RESPONSE_ACTIONS, answers[f.id] || '', 'Select action…') + '</select></span></div></div>';
    }).join('');
    return '<div class="space-y-xs"><div class="notice">Four findings from the live feeds. Three are containment/protection calls; one is the auditor-evidence call. Choose deliberately — every action has a consequence.</div>' + rows + '</div>';
  }

  function renderTriageDesk(s) {
    var rows = D.TRIAGE_ITEMS.map(function (t) {
      return '<div class="triage-row"><p class="triage-text">' + esc(t.text) + '</p>' +
        '<span class="triage-select"><span class="select-wrap"><select class="select" aria-label="Classify anomaly ' + t.id + '" data-action="triage-set" data-id="' + t.id + '" data-fk="tri-' + t.id + '">' +
        options([{ value: 'tp', label: 'True positive' }, { value: 'fp', label: 'False positive' }], s.fpTriage[t.id] || '', 'Classify…') +
        '</select></span></span></div>';
    }).join('');
    return '<div class="space-y-xs"><div class="notice">Six anomalies are flagged across the console. Classify each as true or false positive — ask of every one: is it documented, sanctioned, expected?</div>' + rows + '</div>';
  }

  function renderCounterBoard(s) {
    var slots = [0, 1, 2].map(function (i) {
      var cid = s.counter[i];
      var inner = cid
        ? '<span class="slot-filled"><span>' + esc((D.COUNTERMEASURES.filter(function (c) { return c.id === cid; })[0] || {}).label || '') + '</span>' +
        '<button type="button" class="icon-btn sm" aria-label="Remove priority ' + (i + 1) + '" data-action="counter-remove" data-slot="' + i + '" data-fk="cr-' + i + '">' + window.icon('x', 12) + '</button></span>'
        : '<span class="slot-empty">— empty —</span>';
      return '<div class="slot"><div class="slot-label">Priority ' + (i + 1) + '</div>' + inner + '</div>';
    }).join('');
    var buttons = D.COUNTERMEASURES.map(function (c) {
      var used = s.counter.indexOf(c.id) >= 0;
      var full = s.counter.length >= 3;
      return '<button type="button" class="cm-btn' + (used ? ' used' : '') + (full && !used ? ' blocked' : '') + '" aria-label="Assign control: ' + esc(c.label) + '" data-action="counter-assign" data-id="' + c.id + '" data-fk="cm-' + c.id + '"' + ((used || full) ? ' disabled' : '') + '>' +
        '<span class="sensor-name">' + esc(c.label) + '</span></button>';
    }).join('');
    return '<div class="space-y"><div class="notice">Three slots. Assign the controls that would have broken this attack chain — in the order you would apply them: first stops initial access, second closes authorization paths, third contains privilege abuse.</div>' +
      '<div class="slot-grid">' + slots + '</div><div class="cm-list">' + buttons + '</div></div>';
  }

  function renderRuleBuilder(s) {
    var r = s.rule;
    return '<div class="space-y"><div class="notice">Detection engineering: write a rule that fires on any access to the manifests share outside business hours. Every clause is a false-positive filter.</div>' +
      '<div class="rule-grid">' +
      '<div class="field"><label class="label" for="rule-name">Rule name</label><input class="input" id="rule-name" value="' + esc(r.name) + '" placeholder="e.g. off-hours manifests access" data-rule-input="name" data-fk="rule-name"></div>' +
      '<div class="field"><span class="label">Source dataset</span><span class="select-wrap"><select class="select" aria-label="Rule source dataset" data-action="rule-set" data-f="source" data-fk="rule-source">' + options(D.RULE_SOURCES, r.source, 'Select…') + '</select></span></div>' +
      '<div class="field"><span class="label">Match field</span><span class="select-wrap"><select class="select" aria-label="Rule match field" data-action="rule-set" data-f="field" data-fk="rule-field">' + options(D.RULE_FIELDS, r.field, 'Select…') + '</select></span></div>' +
      '<div class="field"><span class="label">Condition</span><span class="select-wrap"><select class="select" aria-label="Rule condition" data-action="rule-set" data-f="condition" data-fk="rule-condition">' + options(D.RULE_CONDITIONS, r.condition, 'Select…') + '</select></span></div>' +
      '<div class="field"><label class="label" for="rule-value">Value</label><input class="input" id="rule-value" value="' + esc(r.value) + '" placeholder="as written in the IAM report" data-rule-input="value" data-fk="rule-value"></div>' +
      '<div class="field"><span class="label">Time filter</span><span class="select-wrap"><select class="select" aria-label="Rule time filter" data-action="rule-set" data-f="timeFilter" data-fk="rule-timeFilter">' + options(D.RULE_TIMEFILTERS, r.timeFilter, 'Select…') + '</select></span></div>' +
      '<div class="field"><span class="label">Severity</span><span class="select-wrap"><select class="select" aria-label="Rule severity" data-action="rule-set" data-f="severity" data-fk="rule-severity">' + options(D.RULE_SEVERITIES, r.severity, 'Select…') + '</select></span></div>' +
      '</div></div>';
  }

  function renderSaasDesk(s) {
    var answers = (s.answers && s.answers['OBJ-H8']) || {};
    return '<div class="space-y"><div class="notice">One unsanctioned app is actively leaking company files. Name it and choose the proportionate action pair — not an overreach, not a shrug.</div>' +
      '<div class="two-col">' +
      '<div class="field"><span class="label">Leaking app</span><span class="select-wrap"><select class="select" aria-label="Leaking application" data-action="field-set" data-obj="OBJ-H8" data-field="app" data-fk="ans-OBJ-H8-app">' +
      options([{ value: 'dropvaultsync', label: 'DropVaultSync' }, { value: 'chartexpress', label: 'ChartExpress' }, { value: 'northmail365', label: 'NorthMail 365' }], answers.app || '', 'Select app…') +
      '</select></span></div>' +
      '<div class="field"><span class="label">Action pair</span><span class="select-wrap"><select class="select" aria-label="Action pair" data-action="field-set" data-obj="OBJ-H8" data-field="action" data-fk="ans-OBJ-H8-action">' +
      options([{ value: 'blockdlp', label: 'Block the app & enable DLP on file exports' }, { value: 'allowwarn', label: 'Allow with a warning banner' }, { value: 'blockall', label: 'Block every cloud tool company-wide' }, { value: 'migrate', label: 'Migrate users to ChartExpress' }], answers.action || '', 'Select action…') +
      '</select></span></div>' +
      '</div></div>';
  }

  function renderRecordsDesk(s) {
    var exBtn = function (id, label, done, msg) {
      return '<button type="button" class="btn btn-outline btn-sm' + (s.exports.indexOf(id) >= 0 ? ' exported' : '') + '" data-action="export" data-id="' + id + '" data-msg="' + esc(msg) + '" data-fk="ex-' + id + '">' +
        window.icon('download', 14) + ' ' + (s.exports.indexOf(id) >= 0 ? label + ' ✓' : label) + '</button>';
    };
    return '<div class="space-y">' +
      '<div class="policy-card"><div class="policy-head">' + window.icon('file-clock', 14) + ' SEC-POL-07 — records policy</div>' +
      'Security-relevant logs SHALL be retained for <span class="green">12 months</span>. Access reviews SHALL be produced quarterly. FIM baselines SHALL be reviewed on every change. Evidence SHALL outlive the audit.</div>' +
      '<div class="two-col">' +
      '<div class="field"><span class="label">Security-log retention</span><span class="select-wrap"><select class="select" aria-label="Retention period" data-action="retention-set" data-fk="retention">' +
      options([3, 6, 12, 24].map(function (m) { return { value: String(m), label: m + ' months' }; }), String(s.retention)) +
      '</select></span></div>' +
      '<div class="field"><span class="label">Audit artifacts</span><span class="export-row">' +
      exBtn('accessReview', 'Export access review', false, 'Access review report exported — who / when / where / how, last 90 days') +
      exBtn('fim', 'Export FIM baseline', false, 'FIM baseline report exported — out-of-baseline changes, 12-month scope') +
      '</span></div>' +
      '</div></div>';
  }

  function renderPostMortem(s) {
    var answers = (s.answers && s.answers['OBJ-H9']) || {};
    return '<div class="space-y"><div class="notice">Before the console was repaired, cross-host correlation failed silently. Name the root cause and quantify the worst offender, using the drift table the NTP sensor recorded before sync.</div>' +
      '<div class="mini-card"><div class="plaque mb-xs">Recorded pre-sync drift (last observation)</div>' +
      '<div class="pm-skew-grid">' + D.HOST_SKEW.map(function (h) {
        return '<span class="pm-skew-cell' + (Math.abs(h.skew) >= 7 ? ' bad' : '') + '"><span>' + h.host + '</span><span>' + (h.skew >= 0 ? '+' : '') + h.skew + ' min</span></span>';
      }).join('') + '</div></div>' +
      '<div class="two-col">' +
      '<div class="field"><span class="label">Root cause</span><span class="select-wrap"><select class="select" aria-label="Root cause" data-action="field-set" data-obj="OBJ-H9" data-field="cause" data-fk="ans-OBJ-H9-cause">' +
      options(D.POSTMORTEM_CAUSES, answers.cause || '', 'Select…') + '</select></span></div>' +
      '<div class="field"><label class="label" for="skew-min">Largest skew (minutes)</label><input class="input" id="skew-min" type="number" value="' + esc(answers.skew || '') + '" data-field-input="OBJ-H9|skew" data-fk="ans-OBJ-H9-skew"></div>' +
      '</div></div>';
  }

  var EVIDENCE_TABS = [
    { id: 'logs', label: 'Log Stream', icon: 'list-tree' },
    { id: 'pcap', label: 'Packet Capture', icon: 'waves' },
    { id: 'flow', label: 'Traffic Flow', icon: 'activity' },
    { id: 'iam', label: 'IAM Access', icon: 'fingerprint' },
    { id: 'assets', label: 'Assets', icon: 'boxes' },
    { id: 'fim', label: 'File Integrity', icon: 'shield-alert' },
    { id: 'casb', label: 'SaaS Discovery', icon: 'radio-tower' },
    { id: 'vuln', label: 'Vuln Scan', icon: 'git-branch' }
  ];

  var WORKBENCH_TABS = {
    medium: [
      { id: 'timeline', label: 'Incident Timeline', icon: 'radio' },
      { id: 'dashboard', label: 'Dashboard Builder', icon: 'layout-dashboard' },
      { id: 'response', label: 'Response Desk', icon: 'clipboard-check' }
    ],
    hard: [
      { id: 'timeline', label: 'Incident Timeline', icon: 'radio' },
      { id: 'triage', label: 'Triage Desk', icon: 'clipboard-check' },
      { id: 'rule', label: 'Rule Builder', icon: 'radio' },
      { id: 'counter', label: 'Countermeasure Board', icon: 'layout-dashboard' },
      { id: 'saas', label: 'SaaS Desk', icon: 'layout-dashboard' },
      { id: 'records', label: 'Records Desk', icon: 'file-clock' },
      { id: 'postmortem', label: 'Post-mortem', icon: 'archive-restore' }
    ]
  };

  function renderWorkbenchPanel(s, id) {
    switch (id) {
      case 'timeline': return renderTimelineWB(s);
      case 'dashboard': return renderDashboardWB(s);
      case 'response': return renderResponseDesk(s);
      case 'triage': return renderTriageDesk(s);
      case 'rule': return renderRuleBuilder(s);
      case 'counter': return renderCounterBoard(s);
      case 'saas': return renderSaasDesk(s);
      case 'records': return renderRecordsDesk(s);
      case 'postmortem': return renderPostMortem(s);
      default: return '';
    }
  }

  function renderFeedWall(s) {
    var workbenches = WORKBENCH_TABS[s.mode || 'medium'];

    var groupTabs = '<div class="group-tabs" role="group" aria-label="Pane group">' +
      ['evidence', 'workbench'].map(function (g) {
        return '<button type="button" class="group-tab' + (feedGroup === g ? ' active' : '') + '" aria-pressed="' + (feedGroup === g) + '" data-action="group-set" data-group="' + g + '" data-fk="group-' + g + '">' + (g === 'evidence' ? 'Evidence Panes' : 'Workbenches') + '</button>';
      }).join('') + '</div>';

    var body = '';
    if (feedGroup === 'evidence') {
      var tablist = '<div class="tab-strip scroll-slim" role="tablist" aria-label="Evidence panes">' +
        EVIDENCE_TABS.map(function (t) {
          return '<button type="button" role="tab" aria-selected="' + (evidenceTab === t.id) + '" class="tab tab-evidence' + (evidenceTab === t.id ? ' active' : '') + '" data-action="ev-tab" data-tab="' + t.id + '" data-fk="ev-' + t.id + '">' + window.icon(t.icon, 14, 'tab-ic') + ' ' + t.label + '</button>';
        }).join('') + '</div>';
      var panel = ({ logs: renderLogStream, pcap: renderPcapFeed, flow: renderFlowFeed, iam: renderIamFeed, assets: renderAssetsFeed, fim: renderFimFeed, casb: renderCasbFeed, vuln: renderVulnFeed })[evidenceTab](s);
      body = tablist + '<div class="tab-panel" role="tabpanel" id="ev-panel">' + panel + '</div>';
    } else {
      var wlist = '<div class="tab-strip scroll-slim" role="tablist" aria-label="Workbenches">' +
        workbenches.map(function (t) {
          return '<button type="button" role="tab" aria-selected="' + (workbenchTab === t.id) + '" class="tab tab-workbench' + (workbenchTab === t.id ? ' active' : '') + '" data-action="wb-tab" data-tab="' + t.id + '" data-fk="wb-' + t.id + '">' + window.icon(t.icon, 14, 'tab-ic') + ' ' + t.label + '</button>';
        }).join('') + '</div>';
      body = wlist + '<div class="tab-panel" role="tabpanel" id="wb-panel">' + renderWorkbenchPanel(s, workbenchTab) + '</div>';
    }

    var foot = '';
    if (feedGroup === 'workbench' && s.mode === 'hard') {
      foot = '<div class="wall-note">Night watch desks stay open — the check engine validates state when you run CHECK RESULTS on each task.</div>';
    } else if (feedGroup === 'evidence') {
      foot = '<div class="wall-note">Panes are powered by sensors — a dark pane is a <span class="amber-text">blind spot</span>, and blind spots are where incidents live.</div>';
    }

    return '<div class="feedwall">' + groupTabs + body + foot + '</div>';
  }

  function renderFloor(s) {
    return '<div class="floor-grid">' +
      '<div class="fg-sensors">' + renderSensorBay(s) + '</div>' +
      '<div class="fg-center">' + renderCoverageGrid(s) + renderFeedWall(s) + '</div>' +
      '<div class="fg-tasks">' + renderTaskRail(s) + '</div>' +
      '</div>';
  }

  // ══════════════════════════ WATCH TASKS (objective rail) ═════════════════════
  function fieldHtml(o, f, s) {
    var val = (s.answers && s.answers[o.id] && s.answers[o.id][f.id]) || '';
    if (f.type === 'select') {
      return '<div class="field"><span class="label">' + esc(f.label) + '</span>' +
        '<span class="select-wrap"><select class="select" aria-label="' + esc(f.label) + '" data-action="field-set" data-obj="' + o.id + '" data-field="' + f.id + '" data-fk="ans-' + o.id + '-' + f.id + '">' +
        options(f.options || [], val, 'Select…') + '</select></span></div>';
    }
    return '<div class="field"><label class="label" for="' + o.id + '-' + f.id + '">' + esc(f.label) + '</label>' +
      '<input class="input mono-input" id="' + o.id + '-' + f.id + '" type="' + (f.type === 'number' ? 'number' : 'text') + '" value="' + esc(val) + '"' +
      (f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : '') +
      ' data-field-input="' + o.id + '|' + f.id + '" data-fk="ans-' + o.id + '-' + f.id + '"></div>';
  }

  function objBodyHtml(o, index, s) {
    var prog = s.progress[o.id];
    var done = !!(prog && prog.done);
    var mode = s.mode;
    var hintCount = (prog && prog.hints) || 0;
    var maxHints = mode === 'hard' ? 1 : 3;
    var hintsLeft = Math.min(maxHints, o.hints.length) - hintCount;

    var fieldsHtml = '';
    if (o.fields.length > 0) {
      fieldsHtml = '<div class="fields-grid">' + o.fields.map(function (f) { return fieldHtml(o, f, s); }).join('') + '</div>';
    }

    var actions = '<div class="obj-actions">';
    if (!done) {
      actions += '<button type="button" class="btn btn-primary" data-action="check" data-obj="' + o.id + '" data-fk="check-' + o.id + '">Check results</button>';
    } else {
      actions += '<span class="validated-note">' + window.icon('check-circle-2', 14) + ' validated ' + (prog.firstTry ? '· first try' : '· after ' + prog.attempts + ' attempt(s)') + '</span>';
    }
    if (!done && hintsLeft > 0) {
      actions += mode === 'hard'
        ? '<button type="button" class="hint-btn" data-action="hint" data-obj="' + o.id + '" data-fk="hint-' + o.id + '">' + window.icon('moon-star', 14) + ' Request nudge (costs stars)</button>'
        : '<button type="button" class="hint-btn" data-action="hint" data-obj="' + o.id + '" data-fk="hint-' + o.id + '">' + window.icon('lightbulb', 14) + ' Hint (' + (hintCount + 1) + '/' + maxHints + ')</button>';
    }
    actions += '</div>';

    var hintsHtml = '';
    if (hintCount > 0) {
      hintsHtml = '<div class="hints-list">' + o.hints.slice(0, hintCount).map(function (h, i) {
        return '<div class="hint-box"><span class="hint-kicker">hint ' + (i + 1) + '</span> — ' + esc(h) + '</div>';
      }).join('') + '</div>';
    }

    var result = cardResults[o.id];
    var resultHtml = '';
    if (result) {
      resultHtml = '<div role="status" class="result-box ' + (result.pass ? 'pass' : 'fail') + '">' +
        '<span class="result-kicker">' + (result.pass ? '✓ validated — why it matters' : '○ not yet — read this') + '</span>' +
        esc(result.msg) + '</div>';
    }

    return '<div class="obj-body-inner"><p class="obj-instruction">' + esc(o.instruction) + '</p>' +
      '<span class="covers-badge">covers: ' + esc(o.anchor) + '</span>' +
      fieldsHtml + actions + hintsHtml + resultHtml + '</div>';
  }

  function renderTaskRail(s) {
    var objectives = OBJ.OBJECTIVES[s.mode];
    var doneCount = objectives.filter(function (o) { return s.progress[o.id] && s.progress[o.id].done; }).length;

    var cards = objectives.map(function (o, i) {
      var prog = s.progress[o.id];
      var done = !!(prog && prog.done);
      var open = openObjectiveId === o.id;
      return '<div class="obj-card' + (done ? ' done' : '') + (open ? ' open' : '') + '">' +
        '<button type="button" class="obj-head" aria-expanded="' + open + '" data-action="obj-open" data-obj="' + o.id + '" data-fk="obj-' + o.id + '">' +
        '<span class="obj-num">' + String(i + 1).padStart(2, '0') + '</span>' +
        (done ? window.icon('check-circle-2', 16, 'ok-ic') : open ? window.icon('chevron-right', 16, 'open-ic') : window.icon('circle', 16, 'idle-ic')) +
        '<span class="obj-title' + (done ? ' struck' : '') + '">' + esc(o.title) + '</span>' +
        pillarBadge(o.pillar) +
        window.icon('chevron-down', 16, 'chev' + (open ? ' rot' : '')) +
        '</button>' +
        (open ? '<div class="obj-body">' + objBodyHtml(o, i, s) + '</div>' : '') +
        '</div>';
    }).join('');

    return '<div><div class="rail-head"><span class="plaque">Watch Tasks · ' + (s.mode === 'hard' ? 'Night' : 'Day') + ' watch</span>' +
      '<span class="rail-count">' + doneCount + '/' + objectives.length + '</span></div>' +
      '<div class="task-list">' + cards + '</div></div>';
  }

  // ══════════════════════════ DEBRIEF (C6) ═════════════════════════════════════
  function renderDebrief() {
    return '<div class="debrief-wrap">' +
      '<section class="panel-card pad-lg"><div class="section-head"><div class="plaque">C6 · Debrief — field notes</div><h2 class="h2">What the watch taught</h2></div>' +
      '<p class="debrief-lede">The incident that crossed the estate last night was visible only where instruments were live — and only correlated where clocks agreed. This page is the permanent record: what to detect, what to mitigate, and what both sides of the house learned.</p></section>' +

      '<section class="panel-card pad-lg"><div class="debrief-title">Detection opportunities — data source → example logic</div>' +
      '<div class="scroll-box scroll-slim maxh-288"><table class="feed-table"><thead><tr><th>Data source</th><th>Example detection logic</th></tr></thead><tbody>' +
      D.DEBRIEF_DETECTIONS.map(function (d) {
        return '<tr><td class="bright-cell semibold">' + esc(d.source) + '</td><td class="host-cell">' + esc(d.logic) + '</td></tr>';
      }).join('') + '</tbody></table></div></section>' +

      '<section class="panel-card pad-lg"><div class="debrief-title">Mitigation recommendations — with official IDs</div>' +
      '<ul class="mitigation-grid">' + D.MITRE_ALIGNMENT.filter(function (m) { return m.label.indexOf('M1') === 0; }).map(function (m) {
        return '<li class="mini-card"><a href="' + esc(m.href) + '" target="_blank" rel="noreferrer" class="mitigation-link">' + esc(m.label) + ' ' + window.icon('external-link', 12) + '</a><p class="mini-text">' + esc(m.note) + '</p></li>';
      }).join('') + '</ul>' +
      '<p class="residual-note">Residual risk: controls reduce the chain but never zero it — keep the dashboard loop running, review access quarterly, and test your blind spots before an attacker does.</p></section>' +

      '<div class="two-col-wide">' +
      '<section class="panel-card pad-lg blue-card"><div class="debrief-title">Blue-team takeaways</div><ul class="takeaway-list">' +
      D.DEBRIEF_BLUE.map(function (b) { return '<li><span class="bullet-dot green-dot"></span>' + esc(b) + '</li>'; }).join('') + '</ul></section>' +
      '<section class="panel-card pad-lg amber-card"><div class="debrief-title amber-text">Red-team mindset (defensive use)</div><ul class="takeaway-list">' +
      D.DEBRIEF_RED.map(function (b) { return '<li><span class="bullet-dot amber-dot"></span>' + esc(b) + '</li>'; }).join('') + '</ul></section>' +
      '</div>' +

      '<section class="panel-card pad-lg"><div class="debrief-title">Learn next</div><ul class="next-list">' +
      D.NEXT_STEPS.map(function (n) { return '<li>→ ' + esc(n) + '</li>'; }).join('') +
      '<li>→ <a href="https://www.comptia.org/certifications/cybersecurity-analyst" target="_blank" rel="noreferrer" class="mitre-link">CompTIA CySA+ CS0-003 objectives ' + window.icon('external-link', 12) + '</a> <span class="dim-cell">— official exam page (new tab)</span></li>' +
      '</ul></section>' +
      '</div>';
  }

  // ══════════════════════════ QUIZ (C5) ════════════════════════════════════════
  function renderQuiz(s) {
    var mode = s.mode;
    var items = QUIZ[mode];
    var objectives = OBJ.OBJECTIVES[mode];
    var allObjectivesDone = objectives.every(function (o) { return s.progress[o.id] && s.progress[o.id].done; });
    var allAnswered = items.every(function (q) { return s.quiz[q.id]; });
    var eligible = allObjectivesDone && s.quizSubmitted;
    var stars = OBJ.computeStars(s.progress, objectives.length);
    var answeredCount = items.filter(function (q) { return s.quiz[q.id]; }).length;

    var itemHtml = items.map(function (q, idx) {
      var picked = s.quiz[q.id];
      var opts = q.options.map(function (o) {
        var isPicked = picked === o.value;
        var isAnswer = q.answer === o.value;
        var cls = '';
        if (s.quizSubmitted && isAnswer) cls = ' correct';
        else if (s.quizSubmitted && isPicked) cls = ' incorrect';
        else if (isPicked) cls = ' picked';
        var tail = '';
        if (s.quizSubmitted && isAnswer) tail = window.icon('check-circle-2', 16, 'ok-ic');
        else if (s.quizSubmitted && isPicked && !isAnswer) tail = window.icon('circle-x', 16, 'bad-ic');
        return '<label class="opt' + cls + '"><input type="radio" name="' + q.id + '" value="' + o.value + '"' + (picked === o.value ? ' checked' : '') + (s.quizSubmitted ? ' disabled' : '') + ' data-quiz="' + q.id + '" data-fk="qz-' + q.id + '-' + o.value + '"><span class="opt-text">' + esc(o.label) + '</span>' + tail + '</label>';
      }).join('');

      var expl = '';
      if (s.quizSubmitted) {
        var correct = picked === q.answer;
        expl = '<div class="explanation ' + (correct ? 'ex-ok' : 'ex-no') + '"><span class="result-kicker">' + (correct ? '✓ correct' : '✗ the answer, and why') + '</span>' + esc(q.explanation) + '</div>';
      }

      return '<fieldset class="quiz-item"><legend class="quiz-legend">Q' + (idx + 1) + '</legend>' +
        '<p class="quiz-stem">' + esc(q.stem) + '</p>' +
        '<div class="opts" role="radiogroup" aria-label="' + esc(q.stem) + '">' + opts + '</div>' + expl + '</fieldset>';
    }).join('');

    var actions = '<div class="quiz-actions">';
    if (!s.quizSubmitted) {
      actions += '<button type="button" class="btn btn-primary"' + (allAnswered ? '' : ' disabled') + ' data-action="quiz-submit" data-fk="quiz-submit">Submit answers' + (allAnswered ? '' : ' (' + answeredCount + '/' + items.length + ')') + '</button>';
    } else {
      var score = s.quizScore;
      actions += '<div class="score-line">SCORE ' + score.correct + '/' + score.total + (score.correct === score.total ? ' · flawless watch' : '') + '</div>' +
        '<button type="button" class="btn btn-outline" data-action="quiz-retake" data-fk="quiz-retake">' + window.icon('rotate-ccw', 14) + ' Retake</button>';
    }
    if (eligible) {
      actions += '<button type="button" class="btn btn-amber clearance-cta" data-action="open-clearance" data-fk="view-clearance">View clearance ★' + stars.stars + '</button>';
    }
    if (!allObjectivesDone) {
      var doneSoFar = objectives.filter(function (o) { return s.progress[o.id] && s.progress[o.id].done; }).length;
      actions += '<span class="quiz-hint">Clearance opens when every watch task is validated (' + doneSoFar + '/' + objectives.length + ' so far).</span>';
    }
    if (s.quizSubmitted && allObjectivesDone) {
      actions += '<span class="done-note">watch complete — open your clearance →</span>';
    }
    actions += '</div>';

    return '<div class="quiz-wrap">' +
      '<div class="panel-card quiz-head-card"><div class="plaque">C5 · Knowledge check — ' + (mode === 'hard' ? 'scenario application' : 'concepts') + '</div>' +
      '<p class="quiz-head-copy">' + (mode === 'hard'
        ? 'Seven scenario items. Each needs application, not recall — justify the triage call, pick and defend the control.'
        : 'Seven concept questions. An explanation follows every answer — read it even when you are right.') + '</p></div>' +
      itemHtml + actions + '</div>';
  }

  // ══════════════════════════ DIALOGS ══════════════════════════════════════════
  function completionDialogHtml(s) {
    var mode = s.mode;
    var objectives = OBJ.OBJECTIVES[mode];
    var st = OBJ.computeStars(s.progress, objectives.length);
    var PILLAR_ORDER = ['understand', 'recognize', 'detect', 'mitigate'];

    var starIcons = '';
    for (var i = 1; i <= 5; i++) {
      starIcons += window.icon('star', 28, i <= st.stars ? 'star-on' : 'star-off', i <= st.stars);
    }

    var pillarCards = PILLAR_ORDER.map(function (p) {
      return '<div class="mini-card"><div class="pillar-label">' + OBJ.PILLAR_LABEL[p] + '</div><ul class="pillar-list">' +
        objectives.filter(function (o) { return o.pillar === p; }).map(function (o) {
          return '<li><span class="' + (s.progress[o.id] && s.progress[o.id].done ? 'green' : 'dim') + '">✓</span> <span class="pillar-obj">' + esc(o.title) + '</span></li>';
        }).join('') + '</ul></div>';
    }).join('');

    return '<div class="overlay" data-overlay="completion"><div class="dialog" role="dialog" aria-modal="true" aria-labelledby="completion-title">' +
      '<div class="plaque">Watch complete · ' + (mode === 'hard' ? 'night' : 'day') + ' watch</div>' +
      '<h2 id="completion-title" class="dialog-title">Clearance granted</h2>' +
      '<p class="dialog-desc">Every task validated, every question answered. You can now explain operational visibility, recognize it in raw evidence, choose a detection approach, and justify mitigations — with residual risk named. That is the whole lesson, in your hands.</p>' +
      '<div class="score-card"><div class="stars" role="img" aria-label="' + st.stars + ' of 5 stars">' + starIcons + '</div>' +
      '<div class="score-stats"><div><span class="pct-big">' + st.pct + '%</span> quality</div>' +
      '<div>first-try ' + st.firstTry + '/' + st.doneCount + ' · hints ' + st.hints + '</div>' +
      '<div>quiz ' + (s.quizScore ? s.quizScore.correct + '/' + s.quizScore.total : '—') + '</div></div></div>' +
      '<p class="formula-note">Stars = (3×first-try + 1×retry-passed − 0.5×hints) ÷ 3×tasks, capped 1–5. Hints cost half a star each; retaking the quiz is free.</p>' +
      '<div class="pillar-grid">' + pillarCards + '</div>' +
      '<div class="kg-card"><div class="pillar-label">Keep going</div><ul class="next-list">' +
      D.NEXT_STEPS.map(function (n) { return '<li>→ ' + esc(n) + '</li>'; }).join('') + '</ul></div>' +
      '<div class="dialog-actions">' +
      '<button type="button" class="btn btn-primary" data-action="completion-review" data-autofocus>Review the debrief</button>' +
      '<button type="button" class="btn btn-outline" data-action="completion-purge">Purge &amp; restart watch</button>' +
      '</div></div></div>';
  }

  function purgeDialogHtml() {
    return '<div class="overlay" data-overlay="purge"><div class="dialog" role="alertdialog" aria-modal="true" aria-labelledby="purge-title" aria-describedby="purge-desc">' +
      '<h2 id="purge-title" class="dialog-title">Purge &amp; restart the watch?</h2>' +
      '<p id="purge-desc" class="dialog-desc">This wipes saved progress — sensor states, tasks, quiz results and your clearance — and returns the console to its pristine state. The estate will not remember you.</p>' +
      '<div class="dialog-actions">' +
      '<button type="button" class="btn btn-outline" data-action="purge-cancel" data-autofocus>Stand down</button>' +
      '<button type="button" class="btn btn-danger" data-action="purge-confirm">Purge everything</button>' +
      '</div></div></div>';
  }

  // ══════════════════════════ ROOT RENDER ══════════════════════════════════════
  function renderAppHtml(s) {
    if (!s.mode || s.phase === 'mode') {
      return '<div class="app-shell">' + renderModeScreen() + '</div>';
    }
    syncTransient(s.phase);
    return '<div class="app-shell">' + renderShell(s) + '</div>';
  }

  window.LAB_UI = {
    renderAppHtml: renderAppHtml,
    logStreamBody: logStreamBody,
    completionDialogHtml: completionDialogHtml,
    purgeDialogHtml: purgeDialogHtml,
    esc: esc,
    get openPopover() { return openPopover; },
    set openPopover(v) { openPopover = v; }
  };

  // ── bridges used by app.js (transient state lives in this closure) ──────────
  window.__labSetGroup = function (g) { feedGroup = g; };
  window.__labSetTab = function (kind, id) {
    if (kind === 'evidence') evidenceTab = id;
    else if (kind === 'workbench') workbenchTab = id;
    else if (kind === 'kc') kcTab = id;
  };
  window.__labSetLogFilter = function (f, v) { logFilters[f] = v; };
  window.__labToggleObjective = function (id) {
    openObjectiveId = openObjectiveId === id ? null : id;
  };
  window.__labSetResult = function (id, res) { cardResults[id] = res; };
})();
