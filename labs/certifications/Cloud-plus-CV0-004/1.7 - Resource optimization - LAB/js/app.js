/* ==========================================================================
   NIMBUS TOWER — js/app.js
   Bootstrap, state orchestration, mode select, status bar, channels and all
   renderers. Ported from src/components/lab/LabRoot.tsx (+ Briefing/FleetRack/
   Panels/Clearances/Debrief) with identical behavior, copy and persistence.
   Re-render strategy: after every state mutation the active channel pane is
   rebuilt (parity with React's re-render); focus is restored to the control
   the user was on via data-fk keys so keyboard/typing flows stay intact.
   ========================================================================== */
(function (root) {
  'use strict';

  var LAB = root.LAB;
  var el = LAB.el;

  /* ---------- module state ---------- */
  var state = null;            // LabState (same shape as the original)
  var channel = 'brief';       // current channel tab (not persisted, like the original)
  var openStrip = null;        // which strip is expanded (not persisted)
  var signOffManual = false;
  var signOffDismissed = false;
  var signOffDialog = null;    // open dialog handle
  var telemetry = { lines: [], tick: 0, timer: null };
  var appEl;
  var renderPending = false;

  /* ---------- derived helpers ---------- */
  function mode() { return state ? state.mode : null; }
  function ms() { var m = mode(); return m ? state[m] : null; }
  function objectives() {
    var m = mode();
    return m === 'medium' ? LAB.MEDIUM_OBJECTIVES : m === 'hard' ? LAB.HARD_OBJECTIVES : [];
  }
  function passedCount() {
    var m = ms(), os = objectives();
    var n = 0;
    os.forEach(function (o) { if (m && m.checks[o.id] && m.checks[o.id].passed) n++; });
    return n;
  }
  function savings() { return ms() ? LAB.computeSavingsPublic(ms().env) : 0; }
  function signOffReady() { var m = ms(); return m ? passedCount() === objectives().length && m.quiz.submitted : false; }
  function signOffOpen() { return signOffManual || (signOffReady() && !signOffDismissed); }
  function clearSignOff() { signOffManual = false; signOffDismissed = false; }
  function save() { LAB.saveLabState(state); }

  /* ---------- state mutations (parity with LabRoot callbacks) ---------- */

  // Pure: mark any clearances the environment now satisfies (idempotent).
  function runPendingChecks() {
    if (!state.mode) return;
    var cur = state[state.mode];
    var objs = state.mode === 'medium' ? LAB.MEDIUM_OBJECTIVES : LAB.HARD_OBJECTIVES;
    objs.forEach(function (o) {
      var rec = cur.checks[o.id];
      if (!(rec && rec.passed) && o.check(cur.env)) {
        cur.checks[o.id] = { passed: true, attempts: (rec && rec.attempts) || 0 };
        cur.msgs[o.id] = { ok: true, msg: o.pass };
      }
    });
  }

  function mutateEnv(fn) {
    if (!state || !state.mode) return;
    fn(state[state.mode].env);
    runPendingChecks();
    save();
    scheduleRender();
  }

  function pushEvent(evt) { mutateEnv(function (d) { d.events.push(evt); }); }

  function mark(id, v) {
    mutateEnv(function (d) {
      if (v === null) delete d.flags[id];
      else { d.flags[id] = v; d.events.push('mark:' + id + ':' + v); }
    });
  }

  function runCheck(o) {
    if (!state || !state.mode) return;
    var c = state[state.mode];
    var passed = o.check(c.env);
    var rec = c.checks[o.id] || { passed: false, attempts: 0 };
    c.checks[o.id] = { passed: passed || rec.passed, attempts: rec.attempts + (passed ? 0 : 1) };
    c.msgs[o.id] = { ok: passed, msg: passed ? o.pass : o.fail };
    save();
    scheduleRender();
  }

  function useHint(o) {
    if (!state || !state.mode) return;
    var c = state[state.mode];
    c.hints[o.id] = Math.min((c.hints[o.id] || 0) + 1, o.hints.length);
    save();
    scheduleRender();
  }

  function mutateQuiz(fn) {
    if (!state || !state.mode) return;
    fn(state[state.mode], state.mode);
    save();
    scheduleRender();
  }

  // R2: answering never validates by itself — validation happens on CHECK (medium)
  // or the submit button (hard). Once validated, the answer is locked.
  function answerQuiz(qi, oi) {
    mutateQuiz(function (c) {
      if (c.quiz.checked[qi] || c.quiz.submitted) return; // locked after validation
      c.quiz.answers[qi] = oi;
    });
  }
  function checkQuiz(qi) {
    mutateQuiz(function (c, m) {
      if (c.quiz.answers[qi] === undefined || c.quiz.checked[qi]) return;
      c.quiz.checked[qi] = true;
      if (Object.keys(c.quiz.checked).length >= LAB.QUIZ[m].length) c.quiz.submitted = true;
    });
  }
  function submitQuiz() { mutateQuiz(function (c) { c.quiz.submitted = true; }); }

  function setMode(m) {
    if (!state) return;
    state.mode = m;
    save();
    scheduleRender();
  }

  function resetMode() {
    if (!mode()) return;
    clearSignOff();
    state[mode()] = LAB.createModeState();
    channel = 'brief';
    save();
    scheduleRender();
  }

  function wipeAll() {
    LAB.clearLabState();
    clearSignOff();
    state = LAB.createLabState();
    channel = 'brief';
    scheduleRender();
  }

  /* ---------- focus preservation across re-renders ---------- */
  function captureFocus() {
    var a = document.activeElement;
    if (a && a.dataset && a.dataset.fk) return a.dataset.fk;
    return null;
  }
  function restoreFocus(fk) {
    if (!fk) return;
    var n = appEl.querySelector('[data-fk="' + fk.replace(/"/g, '\\"') + '"]');
    if (n && n.focus) n.focus();
  }

  function scheduleRender() {
    if (renderPending) return;
    renderPending = true;
    root.setTimeout(function () { renderPending = false; render(); }, 0);
  }

  /* ---------- shared builders ---------- */
  function selectCtl(fk, label, value, options, onchange, disabled) {
    var sel = el('select', {
      class: 'sel', 'data-fk': fk, 'aria-label': label, disabled: disabled || null,
      onchange: function () { onchange(sel.value); },
    }, options.map(function (o) {
      var opt = el('option', { value: o.value }, o.label);
      if (String(o.value) === String(value)) opt.selected = true;
      return opt;
    }));
    return sel;
  }

  function field(labelText, control) {
    return el('label', { class: 'block' }, [
      el('span', { class: 'field-label' }, labelText),
      control,
    ]);
  }

  function numInput(fk, ariaLabel, value, onchange, opts) {
    var inp = el('input', {
      class: 'inp', type: 'number', 'data-fk': fk, 'aria-label': ariaLabel,
      inputMode: 'numeric', value: value === null || value === undefined ? '' : String(value),
      oninput: function () { onchange(inp.value); },
    });
    if (opts) {
      if (opts.min !== undefined) inp.setAttribute('min', opts.min);
      if (opts.max !== undefined) inp.setAttribute('max', opts.max);
      if (opts.step !== undefined) inp.setAttribute('step', opts.step);
      if (opts.placeholder) inp.setAttribute('placeholder', opts.placeholder);
    }
    return inp;
  }

  /* ==========================================================================
     MODE SELECT SCREEN
     ========================================================================== */
  function renderModeScreen() {
    var mediumCard = el('button', {
      class: 'mode-card medium', type: 'button',
      onclick: function () { setMode('medium'); },
    }, [
      el('p', { class: 'mode-tag' }, 'training shift · medium'),
      el('h2', {}, 'Learn with a supervisor'),
      el('ul', {}, [
        el('li', {}, '· 12 guided clearances, taken in order'),
        el('li', {}, '· “where to look” pointers on every step'),
        el('li', {}, '· 3 free hints per clearance; tolerant checks'),
        el('li', {}, '· concept quiz with per-item check & explanations'),
      ]),
      el('p', { class: 'mode-cta' }, '→ start training shift'),
    ]);
    var hardCard = el('button', {
      class: 'mode-card hard', type: 'button',
      onclick: function () { setMode('hard'); },
    }, [
      el('p', { class: 'mode-tag' }, 'solo night shift · hard'),
      el('h2', {}, 'Prove it alone'),
      el('ul', {}, [
        el('li', {}, '· 9 broad challenges over noisy evidence'),
        el('li', {}, '· the advisor lies 3 times — find the herrings'),
        el('li', {}, '· strict checks: exact sizes, sequences, IDs'),
        el('li', {}, '· 1 optional nudge, and it costs stars'),
      ]),
      el('p', { class: 'mode-cta' }, '→ go solo'),
    ]);

    return el('div', { class: 'mode-screen' }, [
      el('div', { class: 'mode-head' }, [
        el('p', { class: 'mode-kicker' }, [LAB.icon('radio-tower'), ' Nimbus Tower · capacity control']),
        el('h1', { class: 'mode-title' }, 'Choose your shift'),
        el('p', { class: 'mode-sub' }, [
          'Interactive practice lab for ', el('strong', {}, 'CompTIA Cloud+ CV0-004 — Lesson 1.7: Resource optimization'),
          ' (optimizing cloud resources for performance and cost efficiency). Same tower, same evidence — two very different shifts. Progress autosaves in your browser.',
        ]),
      ]),
      el('div', { class: 'mode-grid' }, [mediumCard, hardCard]),
    ]);
  }

  /* ==========================================================================
     STATUS BAR + CHANNEL TABS
     ========================================================================== */
  function renderStatusBar() {
    var hard = mode() === 'hard';
    var target = hard ? LAB.SAVINGS_TARGET_HARD : 1460;
    var sv = savings();
    var pc = passedCount();
    var total = objectives().length;

    var gauge = el('div', { class: 'savings' }, [
      el('p', { class: 'savings-label' }, [
        'live savings ', el('span', { class: 'green-text' }, '$' + sv + '/mo'),
        hard ? el('span', { class: 'muted' }, ' / target $' + LAB.SAVINGS_TARGET_HARD) : null,
      ]),
      el('div', { class: 'savings-track', 'aria-hidden': 'true' }, [
        el('div', { class: 'savings-fill', style: { width: Math.min(100, (sv / target) * 100) + '%' } }),
      ]),
    ]);

    var bar = el('header', { class: 'statusbar' }, [
      el('div', { class: 'statusbar-row' }, [
        el('p', { class: 'statusbar-brand' }, [LAB.icon('tower-control'), ' Nimbus Tower']),
        el('p', { class: 'statusbar-meta' }, [
          'CV0-004 · L1.7 resource optimization · ',
          el('span', { class: hard ? 'amber-text' : 'green-text' }, hard ? 'solo night shift' : 'training shift'),
          ' · synthetic data',
        ]),
        el('div', { class: 'statusbar-right' }, [
          gauge,
          LAB.donut(pc, total, 'clearances issued'),
          el('button', {
            class: 'btn btn-ghost', type: 'button', 'data-fk': 'switch-shift', 'data-role': 'switch-trigger',
            onclick: function () { openSwitchDialog(bar.querySelector('[data-role="switch-trigger"]')); },
          }, 'switch shift'),
          el('button', {
            class: 'btn btn-reset', type: 'button', 'data-fk': 'reset', 'data-role': 'reset-trigger',
            onclick: function () { openResetDialog(bar.querySelector('[data-role="reset-trigger"]')); },
          }, [LAB.icon('rotate-ccw'), ' reset']),
        ]),
      ]),
    ]);
    return bar;
  }

  var CHANNELS = [
    { id: 'brief', freq: '121.5', label: 'Briefing' },
    { id: 'floor', freq: '118.1', label: 'Tower floor' },
    { id: 'clear', freq: '119.9', label: 'Clearances' },
    { id: 'debrief', freq: '121.7', label: 'Debrief' },
  ];

  function renderTabs() {
    var pc = passedCount(), total = objectives().length;
    var list = el('div', { class: 'channel-tabs', role: 'tablist', 'aria-label': 'Tower channels' });
    CHANNELS.forEach(function (c, i) {
      var tab = el('button', {
        class: 'channel-tab', type: 'button', role: 'tab', id: 'tab-' + c.id,
        'aria-selected': channel === c.id ? 'true' : 'false',
        'aria-controls': 'pane-' + c.id, tabindex: channel === c.id ? '0' : '-1',
        'data-fk': 'tab-' + c.id,
        onclick: function () { setChannel(c.id); },
        onkeydown: function (e) { tabKeynav(e, i); },
      }, [
        el('span', { class: 'freq' }, c.freq + ' · '),
        c.label,
        c.id === 'clear' ? el('span', { class: 'count' }, pc + '/' + total) : null,
      ]);
      list.appendChild(tab);
    });
    return list;
  }

  // roving tabindex + arrow keys (Radix Tabs keyboard parity)
  function tabKeynav(e, idx) {
    var dir = 0;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') dir = 1;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') dir = -1;
    else if (e.key === 'Home') { e.preventDefault(); var f0 = appEl.querySelectorAll('[role="tab"]')[0]; if (f0) { f0.focus(); } return; }
    else if (e.key === 'End') { e.preventDefault(); var tabs = appEl.querySelectorAll('[role="tab"]'); var l = tabs[tabs.length - 1]; if (l) { l.focus(); } return; }
    else return;
    e.preventDefault();
    var all = appEl.querySelectorAll('[role="tab"]');
    var next = all[(idx + dir + all.length) % all.length];
    if (next) { next.focus(); next.click(); }
  }

  function setChannel(c) {
    channel = c;
    render();
  }

  /* ==========================================================================
     BRIEFING CHANNEL (C1 scenario · C2 knowledge core · drills · glossary)
     ========================================================================== */
  function renderBriefing() {
    var m = mode();
    var env = ms().env;
    var wrap = el('div', { class: 'stack' });

    // --- shift briefing ---
    wrap.appendChild(LAB.panel({ title: '121.5 · Shift briefing', sub: 'read me first', accent: 'green' }, [
      el('div', { class: 'prose' }, [
        el('p', { html: 'You are the night-shift capacity controller at <strong>NimbusCart</strong>, a mid-size online retailer running on the fictional NimbusGrid cloud. Last quarter the bill grew while customers complained about slow pages — and the quarterly review starts in one shift.' }),
        el('p', { html: 'Your console has the whole estate: <span class="mono green-text">12 flights</span> on the strip rack (compute), the storage bay, the spend board, and the scaling console. Everything is <strong>synthetic training data</strong> — the economics are simplified, the patterns are real.' }),
        el('p', {}, [
          el('span', { html: 'The mission, in exam terms: <em>optimize cloud resources for performance <span class="muted">and</span> cost</em> — without breaking the storefront SLA, and without right-sizing a compromised host into oblivion.' }),
          m === 'medium'
            ? ' Clearances (objectives) are ordered — take them top to bottom; hints are free.'
            : ' You are solo: evidence is noisy, the advisor lies three times, and clearances are strict. One paid nudge is available per run.',
        ]),
      ]),
    ]));

    // --- knowledge core ---
    var kcBody = [];
    var leverGrid = el('div', { class: 'lever-grid' });
    LAB.LEVERS.forEach(function (l) {
      leverGrid.appendChild(el('div', { class: 'lever-card' }, [
        el('p', { class: 'lever-title' }, l.title),
        el('p', { class: 'lever-body' }, l.body),
        el('p', { class: 'lever-where' }, '↳ ' + l.lever),
      ]));
    });
    kcBody.push(leverGrid);
    kcBody.push(el('div', { class: 'note-box note-amber', style: { marginTop: '12px' } }, [
      el('p', { class: 'note-title' }, [LAB.icon('lightbulb'), ' where this sits in the life cycle']),
      el('p', { html: '<span class="mono">provision → <span class="green-text">meter</span> → <span class="green-text">analyze</span> → <span class="green-text">optimize</span> → repeat</span>. Optimization is a loop, not a project: every lever above consumes metering data and produces new baselines.' }),
    ]));

    var twoCol = el('div', { class: 'grid-2-lg', style: { marginTop: '8px' } });
    var billingBox = el('div', { class: 'note-box note-cyan' }, [
      el('p', { class: 'note-title', style: { color: '#5FD4E8' } }, 'billing models at a glance'),
      (function () {
        var t = el('table', { class: 'billing-table' });
        t.appendChild(el('thead', {}, [el('tr', {}, [
          el('th', {}, 'model'), el('th', {}, 'fits'), el('th', {}, 'risk'),
        ])]));
        var tb = el('tbody', {});
        [['pay-as-you-go', 'variable demand', 'highest unit price'], ['reserved', 'steady 24/7', 'commitment lock-in'], ['spot', 'interruptible/retryable', '2-min eviction'], ['dedicated host', 'per-core licensing', 'capacity you own idle']].forEach(function (r) {
          tb.appendChild(el('tr', {}, [el('td', {}, r[0]), el('td', {}, r[1]), el('td', {}, r[2])]));
        });
        t.appendChild(tb);
        return t;
      })(),
      el('p', { class: 't-9 label muted', style: { marginTop: '4px' } }, 'simplified — discounts vary by provider'),
    ]);
    var securityBox = el('div', { class: 'note-box note-coral' }, [
      el('p', { class: 'note-title' }, [LAB.icon('shield-alert'), ' security cross-link']),
      el('p', { html: 'Optimization and security share one instrument: the baseline. A zombie instance is waste <em>and</em> attack surface; unexplained CPU burn on an unowned host is the signature of cryptojacking (resource hijacking — cf. MITRE ATT&amp;CK <a href="https://attack.mitre.org/techniques/T1496/" target="_blank" rel="noreferrer">T1496</a>, and CV0-004 4.6 “cryptojacking / zombie instances”). Isolate first, economize later.' }),
    ]);
    twoCol.appendChild(billingBox); twoCol.appendChild(securityBox);
    kcBody.push(twoCol);

    var practice = el('div', { class: 'note-box note-cyan', style: { marginTop: '8px' } }, [
      el('p', { class: 'note-title' }, [LAB.icon('book-open'), ' real-world practice (illustrative, simplified)']),
      el('ul', { class: 'practice-list' }, [
        el('li', {}, 'Major providers ship advisor tools that continuously suggest right-sizes, reservations and idle cleanups from metering — exactly what the advisor queue simulates.'),
        el('li', {}, 'Spot fleets are standard for CI and batch because jobs checkpoint and re-queue; checkout APIs do not run there.'),
        el('li', {}, 'Archive classes trade retrieval time (hours) for ~80–90% cost cuts — perfect for compliance data, wrong for retrieval SLAs.'),
        el('li', {}, 'FinOps teams treat tags as a prerequisite for chargeback/showback; untagged spend is usually the first thing an audit finds.'),
      ]),
    ]);
    kcBody.push(practice);
    wrap.appendChild(LAB.panel({ title: 'Knowledge core — the optimizer’s toolbox', sub: 'CV0-004 1.10 / 1.8 / 3.2', accent: 'cyan' }, kcBody));

    // --- medium drills / hard strategy board ---
    if (m === 'medium') {
      var termGrid = el('div', { class: 'grid-2' });
      LAB.DRILL_TERMS.forEach(function (d) {
        termGrid.appendChild(el('div', { class: 'drill-card' }, [
          el('p', { class: 'drill-term' }, d.term),
          selectCtl('drill-terms-' + d.id, 'definition of ' + d.term, env.drills.terms[d.id] || '', function () {
            return [{ value: '', label: '— pick the definition —' }].concat(d.options.map(function (o) { return { value: o.key, label: o.key.toUpperCase() + ' · ' + o.text }; }));
          }(), function (v) { mutateEnv(function (dr) { dr.drills.terms[d.id] = v; }); }),
        ]));
      });
      wrap.appendChild(LAB.panel({ title: 'Term control drill', sub: 'clearance M1', accent: 'green' }, [termGrid]));

      var billGrid = el('div', { class: 'grid-2' });
      LAB.DRILL_BILLING.forEach(function (d) {
        billGrid.appendChild(el('div', { class: 'drill-card' }, [
          el('p', { class: 'drill-term' }, d.workload),
          el('p', { class: 'drill-detail' }, d.detail),
          selectCtl('drill-billing-' + d.id, 'billing model for ' + d.workload, env.drills.billing[d.id] || '', [
            { value: '', label: '— assign billing model —' },
            { value: 'payg', label: 'pay-as-you-go' },
            { value: 'reserved', label: 'reserved' },
            { value: 'spot', label: 'spot' },
            { value: 'dedicated', label: 'dedicated host' },
          ], function (v) { mutateEnv(function (dr) { dr.drills.billing[d.id] = v; }); }),
        ]));
      });
      wrap.appendChild(LAB.panel({ title: 'Billing board drill', sub: 'clearance M2', accent: 'amber' }, [billGrid]));

      var platGrid = el('div', { class: 'grid-2' });
      LAB.DRILL_PLATFORM.forEach(function (d) {
        platGrid.appendChild(el('div', { class: 'drill-card' }, [
          el('p', { class: 'drill-term' }, d.workload),
          el('p', { class: 'drill-detail' }, d.detail),
          selectCtl('drill-platform-' + d.id, 'platform for ' + d.workload, env.drills.platform[d.id] || '', [
            { value: '', label: '— choose platform —' },
            { value: 'vm', label: 'VM (full control)' },
            { value: 'container', label: 'containers + orchestration' },
            { value: 'serverless', label: 'serverless functions' },
            { value: 'managed', label: 'managed service' },
          ], function (v) { mutateEnv(function (dr) { dr.drills.platform[d.id] = v; }); }),
        ]));
      });
      wrap.appendChild(LAB.panel({ title: 'Platform board drill', sub: 'clearance M3', accent: 'cyan' }, [platGrid]));
    } else {
      var stratGrid = el('div', { class: 'grid-2' });
      LAB.STRATEGY_WORKLOADS.forEach(function (d) {
        stratGrid.appendChild(el('div', { class: 'drill-card' }, [
          el('p', { class: 'drill-term' }, d.workload),
          el('p', { class: 'drill-detail' }, d.detail),
          el('div', { class: 'strategy-cols' }, [
            selectCtl('strategy-p-' + d.id, 'platform for ' + d.workload, (env.strategy[d.id] && env.strategy[d.id].platform) || '', [
              { value: '', label: 'platform…' },
              { value: 'vm', label: 'VM' },
              { value: 'container', label: 'containers' },
              { value: 'serverless', label: 'serverless' },
              { value: 'managed', label: 'managed' },
            ], function (v) { mutateEnv(function (dr) { dr.strategy[d.id] = { billing: (dr.strategy[d.id] && dr.strategy[d.id].billing) || '', platform: v }; }); }),
            selectCtl('strategy-b-' + d.id, 'billing for ' + d.workload, (env.strategy[d.id] && env.strategy[d.id].billing) || '', [
              { value: '', label: 'billing…' },
              { value: 'payg', label: 'pay-as-you-go' },
              { value: 'reserved', label: 'reserved' },
              { value: 'spot', label: 'spot' },
              { value: 'dedicated', label: 'dedicated host' },
            ], function (v) { mutateEnv(function (dr) { dr.strategy[d.id] = { platform: (dr.strategy[d.id] && dr.strategy[d.id].platform) || '', billing: v }; }); }),
          ]),
        ]));
      });
      wrap.appendChild(LAB.panel({ title: 'Strategy board', sub: 'clearance H4', accent: 'amber' }, [stratGrid]));
    }

    // --- glossary ---
    var gl = el('dl', { class: 'glossary' });
    LAB.GLOSSARY.forEach(function (g) {
      gl.appendChild(el('div', { class: 'glossary-item' }, [
        el('dt', {}, g.term),
        el('dd', {}, g.def),
      ]));
    });
    wrap.appendChild(LAB.panel({ title: 'Glossary', sub: LAB.GLOSSARY.length + ' terms', accent: 'cyan' }, [gl]));

    wrap.appendChild(el('p', { class: 'briefing-foot' }, [
      LAB.icon('graduation-cap'), ' CompTIA Cloud+ CV0-004 · Lesson 1.7 resource optimization · ',
      LAB.icon('list-checks'), ' all objectives live in the 119.9 CLEARANCES channel ',
      LAB.chip('training data'),
    ]));

    return wrap;
  }

  /* ==========================================================================
     TOWER FLOOR CHANNEL (C3 interactive environment)
     ========================================================================== */

  // --- radar scope (decorative companion to the accessible strip rack) ---
  function hashAngle(id) {
    var h = 0;
    for (var i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360;
    return h;
  }

  function renderRadar(fleet) {
    var blips = fleet.filter(function (fl) { return fl.status === 'running'; }).map(function (fl) {
      var dev = fl.cpuAvg - 65;
      var radius = 26 + Math.min(104, Math.abs(dev) * 1.35);
      var angle = (hashAngle(fl.id) * Math.PI) / 180;
      var x = 150 + radius * Math.cos(angle);
      var y = 150 + radius * Math.sin(angle);
      var color = Math.abs(dev) <= 12 ? '#35E08C' : Math.abs(dev) <= 28 ? '#FFB454' : '#FF6B6B';
      return { id: fl.id, x: x, y: y, color: color, cpu: fl.cpuAvg };
    });
    var inBand = blips.filter(function (b) { return b.color === '#35E08C'; }).length;

    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 300 300');
    svg.setAttribute('class', 'radar-svg');
    svg.setAttribute('aria-hidden', 'true');
    function c(cx, cy, r, fill, stroke, dash, sw) {
      var n = document.createElementNS(NS, 'circle');
      n.setAttribute('cx', cx); n.setAttribute('cy', cy); n.setAttribute('r', r);
      if (fill) n.setAttribute('fill', fill); else n.setAttribute('fill', 'none');
      if (stroke) { n.setAttribute('stroke', stroke); n.setAttribute('stroke-width', sw || 1); }
      if (dash) n.setAttribute('stroke-dasharray', dash);
      return n;
    }
    svg.appendChild(c(150, 150, 146, '#0A101A', '#1C2836'));
    svg.appendChild(c(150, 150, 110, null, '#1C2836', '3 5'));
    svg.appendChild(c(150, 150, 74, null, '#1C2836', '3 5'));
    svg.appendChild(c(150, 150, 38, null, 'rgba(53,224,140,0.33)', '2 4'));
    [[150, 10, 150, 290], [10, 150, 290, 150]].forEach(function (l) {
      var ln = document.createElementNS(NS, 'line');
      ln.setAttribute('x1', l[0]); ln.setAttribute('y1', l[1]); ln.setAttribute('x2', l[2]); ln.setAttribute('y2', l[3]);
      ln.setAttribute('stroke', '#1C2836'); ln.setAttribute('stroke-width', '0.5');
      svg.appendChild(ln);
    });
    blips.forEach(function (b) {
      svg.appendChild(c(b.x, b.y, 6.5, b.color));
      svg.appendChild(c(b.x, b.y, 3, b.color));
    });
    svg.appendChild(c(150, 150, 2.5, '#E8EEF6'));
    var t = document.createElementNS(NS, 'text');
    t.setAttribute('x', '150'); t.setAttribute('y', '176'); t.setAttribute('textAnchor', 'middle');
    t.setAttribute('fill', '#8FA0B5'); t.setAttribute('fontSize', '8'); t.setAttribute('fontFamily', 'monospace');
    t.textContent = '60–70% band';
    svg.appendChild(t);

    return el('div', { class: 'radar-wrap' }, [
      el('p', { class: 'sr-only' }, 'Radar scope: ' + blips.length + ' running resources. ' + inBand + ' are in the balanced 60 to 70 percent CPU band; the rest drift toward the edge, meaning over- or under-provisioning. Use the strip rack for details.'),
      el('div', { class: 'radar-ring-wrap', 'aria-hidden': 'true' }, [el('div', { class: 'radar-sweep' })]),
      svg,
      el('div', { class: 'radar-legend', 'aria-hidden': 'true' }, [
        el('span', {}, [el('span', { class: 'dot', style: { background: '#35E08C' } }), ' balanced']),
        el('span', {}, [el('span', { class: 'dot', style: { background: '#FFB454' } }), ' drifting']),
        el('span', {}, [el('span', { class: 'dot', style: { background: '#FF6B6B' } }), ' far off']),
      ]),
    ]);
  }

  function renderFloorLegend() {
    var items = [
      ['activity', 'metered live'],
      ['circle-dollar-sign', 'simplified economics'],
      ['gauge', 'CPU avg vs peak'],
      ['alert-triangle', 'anomaly = security signal'],
      ['radio-tower', 'NIMBUS TOWER · training data'],
    ];
    return el('div', { class: 'legend-strip' }, items.map(function (i) {
      return el('span', {}, [LAB.icon(i[0]), ' ' + i[1]]);
    }));
  }

  // --- observability ---
  function renderObservability(env) {
    return LAB.panel({ title: 'Observability', sub: 'tripwire config', accent: 'cyan' }, [
      el('p', { class: 't-11 muted', style: { marginBottom: '8px' } }, 'Right-size tripwire: fire when a host’s CPU stays under the threshold for the full window. Batch jobs and month-end spikes are filtered by the window length.'),
      el('div', { class: 'asg-grid' }, [
        field('CPU threshold %', numInput('alerts-threshold', 'CPU threshold %', env.alerts.threshold, function (v) {
          mutateEnv(function (d) { d.alerts.threshold = v === '' ? null : Number(v); });
        }, { min: 1, max: 50, placeholder: 'e.g. 10' })),
        field('window (days)', numInput('alerts-window', 'window (days)', env.alerts.window, function (v) {
          mutateEnv(function (d) { d.alerts.window = v === '' ? null : Number(v); });
        }, { min: 1, max: 60, placeholder: 'e.g. 14' })),
      ]),
      el('div', { class: 'switch-row' }, [
        LAB.switchBtn(env.alerts.enabled, 'enable underutilization alert', function (v) {
          mutateEnv(function (d) { d.alerts.enabled = v; });
        }),
        el('span', { class: 'switch-caption mono' }, env.alerts.enabled ? 'tripwire ARMED' : 'tripwire disarmed'),
      ]),
    ]);
  }

  // --- telemetry feed (interval-driven; own DOM node, not re-rendered) ---
  function pushTelemetryLine() {
    if (document.hidden) return;
    var env = ms() && ms().env;
    if (!env) return;
    var running = env.fleet.filter(function (fl) { return fl.status === 'running'; });
    if (!running.length) return;
    telemetry.tick++;
    var fl = running[Math.floor(Math.random() * running.length)];
    var cpu = Math.max(0, Math.min(99, Math.round(fl.cpuAvg + (Math.random() * 10 - 5))));
    var mem = Math.max(0, Math.round(fl.memAvg + (Math.random() * 6 - 3)));
    var stamp = ('0' + (3 + (telemetry.tick % 6))).slice(-2) + ':' + ('0' + (telemetry.tick * 7 % 60)).slice(-2) + ':' + ('0' + (telemetry.tick * 13 % 60)).slice(-2);
    var line = '[' + stamp + '] ' + fl.id + ' cpu=' + cpu + '% mem=' + mem + '% net=' + Math.round(40 + Math.random() * 900) + 'Mb/s';
    telemetry.lines = telemetry.lines.slice(-8).concat([line]);
    var box = document.getElementById('telemetry-lines');
    if (!box) return;
    var digest = document.getElementById('telemetry-digest');
    var latest = telemetry.lines[telemetry.lines.length - 1];
    if (digest) digest.textContent = latest;
    box.innerHTML = '';
    telemetry.lines.forEach(function (l) {
      box.appendChild(el('p', { class: l.indexOf('cpu=9') > -1 ? 'hot' : null }, l));
    });
    box.scrollTop = box.scrollHeight;
  }

  function renderTelemetry() {
    var latest = telemetry.lines.length ? telemetry.lines[telemetry.lines.length - 1] : 'telemetry link open — awaiting metrics';
    return LAB.panel({ title: 'Telemetry feed', sub: 'synthetic', accent: 'cyan', className: 'overflow-hidden' }, [
      el('div', { id: 'telemetry-digest', 'aria-live': 'polite', 'aria-atomic': 'true', class: 'sr-only' }, latest),
      el('div', { id: 'telemetry-lines', class: 'telemetry-lines', 'aria-hidden': 'true' },
        telemetry.lines.length === 0
          ? [el('p', { class: 'muted' }, 'link open — metrics arrive every few seconds…')]
          : telemetry.lines.map(function (l) { return el('p', { class: l.indexOf('cpu=9') > -1 ? 'hot' : null }, l); })
      ),
    ]);
  }

  // --- strip rack ---
  var BTN_GHOST = 'btn btn-ghost';
  var BTN_GREEN = 'btn btn-green';
  var BTN_CORAL = 'btn btn-coral';

  function renderStrip(item, env) {
    var decommissioned = item.status === 'decommissioned';
    var size = item.sizeIdx >= 0 ? LAB.SIZE_LADDER[item.sizeIdx] : null;
    var cpuColor = item.cpuAvg >= 85 ? '#FF6B6B' : item.cpuAvg <= 12 ? '#FFB454' : '#35E08C';
    var baseSizeIdx = -1;
    LAB.FLEET.forEach(function (x) { if (x.id === item.id) baseSizeIdx = x.sizeIdx; });
    var resized = item.sizeIdx !== baseSizeIdx;
    var open = openStrip === item.id;

    var armBtn = null;

    var headChips = [];
    if (size) headChips.push(LAB.chip(size.name.split(' ')[0]));
    else headChips.push(LAB.chip('managed', 'cyan'));
    headChips.push(LAB.chip(LAB.BILLING_LABELS[item.billing], item.billing === 'payg' ? 'muted' : item.billing === 'spot' ? 'amber' : 'green'));
    if (item.schedule.enabled) headChips.push(LAB.chip('sched ' + item.schedule.start + '–' + item.schedule.end, 'cyan'));
    if (item.isolated) headChips.push(LAB.chip('isolated', 'coral'));
    if (decommissioned) headChips.push(LAB.chip('retired'));

    var header = el('div', { class: 'strip-head' }, [
      el('span', {
        class: 'strip-dot', 'aria-hidden': 'true',
        style: { backgroundColor: decommissioned ? '#2A3B50' : item.isolated ? '#FF6B6B' : cpuColor },
        title: decommissioned ? 'decommissioned' : item.isolated ? 'isolated' : 'CPU status',
      }),
      el('button', {
        class: 'strip-toggle', type: 'button', 'aria-expanded': open ? 'true' : 'false',
        'data-fk': 'strip-toggle-' + item.id,
        onclick: function () { openStrip = open ? null : item.id; render(); },
      }, [
        el('span', { class: 'strip-name' }, item.name),
        el('span', { class: 'strip-role' }, item.role),
      ].concat(headChips, [
        el('span', { class: 'strip-cost' }, '$' + item.cost + '/mo'),
        LAB.icon(open ? 'chevron-up' : 'chevron-down', 'strip-chevron'),
      ])),
    ]);

    var card = el('article', {
      class: 'strip' + (decommissioned ? ' retired' : item.isolated ? ' isolated' : ''),
      'aria-label': 'Flight strip ' + item.name,
    }, [header]);

    if (!open) return card;

    var body = el('div', { class: 'strip-body' });
    body.appendChild(el('p', { class: 'strip-evidence' }, [
      el('span', { class: 'ev-label' }, 'evidence · '),
      item.note,
    ]));

    if (decommissioned) {
      body.appendChild(el('div', { class: 'retired-row' }, [
        LAB.chip('decommissioned — snapshotted: ' + (item.snapshotted ? 'yes' : 'no')),
        el('button', { class: BTN_GHOST, type: 'button', 'data-fk': 'restore-' + item.id, onclick: function () { mutateEnv(function (d) { var it = d.fleet.find(function (x) { return x.id === item.id; }); if (it) it.status = 'running'; }); } }, 'restore (undo)'),
      ]));
      card.appendChild(body);
      return card;
    }

    body.appendChild(el('div', { class: 'strip-metrics' }, [
      LAB.metricBar(item.cpuAvg, 'cpu avg'),
      LAB.metricBar(item.cpuPeak, 'cpu peak'),
      LAB.metricBar(item.memAvg, 'mem'),
      el('span', { class: 'strip-tags-line' }, 'tags: ' + (item.tags.length ? item.tags.join(', ') : '— untagged —')),
    ]));

    var controls = el('div', { class: 'strip-controls' });
    // mark (audit)
    var markOpts = [{ value: '', label: '— mark —' }].concat(Object.keys(LAB.AUDIT_LABELS).map(function (v) { return { value: v, label: LAB.AUDIT_LABELS[v] }; }));
    controls.appendChild(selectCtl('mark-' + item.id, 'mark (audit)', env.flags[item.id] || '', markOpts, function (v) { mark(item.id, v || null); }));
    // size
    controls.appendChild(selectCtl('size-' + item.id, 'size', String(item.sizeIdx),
      LAB.SIZE_LADDER.map(function (s, i) { return { value: String(i), label: s.name }; }),
      function (v) {
        var idx = Number(v);
        mutateEnv(function (d) {
          var it = d.fleet.find(function (x) { return x.id === item.id; });
          if (it) { it.sizeIdx = idx; it.cost = LAB.SIZE_LADDER[idx].cost; d.events.push('size:' + item.id + ':' + LAB.SIZE_LADDER[idx].name.split(' ')[0]); }
        });
      }, item.sizeIdx < 0));
    // right-size rule (justify) — only when resized
    if (resized) {
      controls.appendChild(selectCtl('justify-' + item.id, 'right-size rule (justify)', env.sizeJustification[item.id] || '',
        [{ value: '', label: '— pick rule —' }].concat(LAB.JUSTIFY_OPTIONS),
        function (v) {
          mutateEnv(function (d) {
            if (v) { d.sizeJustification[item.id] = v; d.events.push('justify:' + item.id + ':' + v); }
            else delete d.sizeJustification[item.id];
          });
        }));
    }
    // billing
    controls.appendChild(selectCtl('billing-' + item.id, 'billing model', item.billing, [
      { value: 'payg', label: 'pay-as-you-go' },
      { value: 'reserved', label: 'reserved' },
      { value: 'spot', label: 'spot' },
      { value: 'dedicated', label: 'dedicated host' },
    ], function (v) {
      mutateEnv(function (d) {
        var it = d.fleet.find(function (x) { return x.id === item.id; });
        if (it) { it.billing = v; d.events.push('billing:' + item.id + ':' + v); }
      });
    }));
    // schedule preset / start / end
    controls.appendChild(selectCtl('schedpreset-' + item.id, 'schedule preset', item.schedule.preset, [
      { value: 'none', label: 'no schedule (24/7)' },
      { value: 'weekdays', label: 'weekdays' },
      { value: 'daily', label: 'every day' },
    ], function (v) {
      mutateEnv(function (d) {
        var it = d.fleet.find(function (x) { return x.id === item.id; });
        if (it) { it.schedule = Object.assign({}, it.schedule, { preset: v, enabled: v !== 'none' }); d.events.push('schedule:' + item.id + ':' + v); }
      });
    }));
    controls.appendChild(selectCtl('schedstart-' + item.id, 'start', item.schedule.start,
      LAB.SCHEDULE_STARTS.map(function (h) { return { value: h, label: h }; }),
      function (v) { mutateEnv(function (d) { var it = d.fleet.find(function (x) { return x.id === item.id; }); if (it) it.schedule = Object.assign({}, it.schedule, { start: v }); }); }));
    controls.appendChild(selectCtl('schedend-' + item.id, 'end', item.schedule.end,
      LAB.SCHEDULE_ENDS.map(function (h) { return { value: h, label: h }; }),
      function (v) { mutateEnv(function (d) { var it = d.fleet.find(function (x) { return x.id === item.id; }); if (it) it.schedule = Object.assign({}, it.schedule, { end: v }); }); }));
    body.appendChild(controls);

    var actions = el('div', { class: 'strip-actions' });
    actions.appendChild(el('button', {
      class: BTN_GREEN, type: 'button', 'data-fk': 'snapshot-' + item.id, disabled: item.snapshotted,
      onclick: function () {
        mutateEnv(function (d) {
          var it = d.fleet.find(function (x) { return x.id === item.id; });
          if (it) { it.snapshotted = true; d.events.push('snapshot:' + item.id); }
        });
      },
    }, [LAB.icon('rocket'), ' ' + (item.snapshotted ? 'snapshot ✓' : 'snapshot')]));
    actions.appendChild(el('button', {
      class: BTN_CORAL, type: 'button', 'data-fk': 'isolate-' + item.id, disabled: item.isolated,
      onclick: function () {
        mutateEnv(function (d) {
          var it = d.fleet.find(function (x) { return x.id === item.id; });
          if (it) { it.isolated = true; d.events.push('isolate:' + item.id); }
        });
      },
    }, [LAB.icon('shield-alert'), ' ' + (item.isolated ? 'isolated ✓' : 'isolate')]));

    var keptTags = item.tags.filter(function (t) { return LAB.OPS_TAGS.indexOf(t) === -1; });
    var tagSel = selectCtl('tag-' + item.id, 'apply tag', item.tags.find(function (t) { return LAB.OPS_TAGS.indexOf(t) > -1; }) || '', [
      { value: '', label: '— none —' },
      { value: 'decommission', label: 'decommission' },
      { value: 'quarantine', label: 'quarantine' },
    ], function (tag) {
      mutateEnv(function (d) {
        var it = d.fleet.find(function (x) { return x.id === item.id; });
        if (!it) return;
        var kept = it.tags.filter(function (t) { return LAB.OPS_TAGS.indexOf(t) === -1; });
        it.tags = tag === '' ? kept : Array.from(new Set(kept.concat([tag])));
        if (tag !== '') d.events.push('tag:' + item.id + ':' + tag);
      });
    });
    tagSel.removeAttribute('data-fk'); tagSel.setAttribute('data-fk', 'tag-' + item.id);
    var tagWrap = el('div', { class: 'tag-select' }, (function () { var l = el('label', {}); l.appendChild(el('span', { class: 'field-label' }, 'apply tag')); l.appendChild(tagSel); return l; })());
    actions.appendChild(tagWrap);

    // two-step decommission (arm → confirm, 3 s disarm)
    var armed = false, armTimer = null;
    armBtn = el('button', {
      class: BTN_CORAL, type: 'button', 'data-fk': 'decommission-' + item.id,
      onclick: function () {
        if (!armed) {
          armed = true;
          armBtn.classList.add('btn-arm');
          armBtn.textContent = '';
          armBtn.appendChild(document.createTextNode('confirm retire?'));
          armTimer = root.setTimeout(function () { armed = false; armBtn.classList.remove('btn-arm'); armBtn.textContent = ''; armBtn.appendChild(document.createTextNode('decommission')); }, 3000);
          return;
        }
        if (armTimer) root.clearTimeout(armTimer);
        armed = false;
        mutateEnv(function (d) {
          var it = d.fleet.find(function (x) { return x.id === item.id; });
          if (it) { it.status = 'decommissioned'; d.events.push('decommission:' + item.id); }
        });
      },
    }, [LAB.icon('plane'), ' decommission']);
    actions.appendChild(armBtn);
    body.appendChild(actions);

    card.appendChild(body);
    return card;
  }

  function renderRack(env) {
    var rack = el('div', { class: 'rack', role: 'list', 'aria-label': 'Flight strip rack — fleet manifest' });
    env.fleet.forEach(function (item) {
      rack.appendChild(el('div', { role: 'listitem' }, [renderStrip(item, env)]));
    });
    rack.appendChild(el('p', { class: 'panel-footnote' }, [LAB.icon('radar'), ' ' + env.fleet.length + ' strips · click a strip to manage · synthetic training data']));
    return el('section', { class: 'panel', 'aria-label': 'Flight strip rack' }, [
      el('header', { class: 'panel-head' }, [el('h3', { class: 'panel-title' }, [el('span', { class: 'dot', 'aria-hidden': 'true', style: { background: '#35E08C' } }), 'Strip rack — fleet manifest'])]),
      el('div', { class: 'panel-body' }, [rack]),
    ]);
  }

  // --- scaling panel ---
  function renderScaling(env) {
    var a = env.asg;
    var grid = el('div', { class: 'asg-grid' });
    grid.appendChild(field('scaling type', selectCtl('asg-type', 'scaling type', a.type, [
      { value: 'vertical', label: 'vertical (resize host)' },
      { value: 'horizontal', label: 'horizontal (add hosts)' },
    ], function (v) { mutateEnv(function (d) { d.asg.type = v; }); })));
    grid.appendChild(field('policy / trigger', selectCtl('asg-policy', 'policy / trigger', a.policy, [
      { value: 'manual', label: 'manual' },
      { value: 'load', label: 'triggered — load' },
      { value: 'trending', label: 'triggered — trending' },
      { value: 'event', label: 'triggered — event' },
      { value: 'scheduled', label: 'scheduled' },
    ], function (v) { mutateEnv(function (d) { d.asg.policy = v; }); })));
    [['min', 'min hosts'], ['max', 'max hosts'], ['desired', 'desired']].forEach(function (p) {
      var k = p[0];
      grid.appendChild(field(p[1], numInput('asg-' + k, p[1], a[k], function (v) {
        mutateEnv(function (d) { d.asg[k] = Math.max(0, Math.min(32, Number(v) || 0)); });
      }, { min: 0, max: 32 })));
    });
    grid.appendChild(field('CPU target %', numInput('asg-target', 'CPU target %', a.cpuTarget, function (v) {
      mutateEnv(function (d) { d.asg.cpuTarget = Math.max(10, Math.min(95, Number(v) || 0)); });
    }, { min: 10, max: 95 })));

    var preWarmRow = el('div', { class: 'switch-row', style: { marginTop: '8px' } }, [
      LAB.switchBtn(a.preWarm, 'pre-warm before campaign', function (v) { mutateEnv(function (d) { d.asg.preWarm = v; }); }),
      el('span', { class: 'switch-caption mono' }, 'pre-warm (scheduled scale-up before the event)'),
      el('div', { style: { width: '112px' } }, [
        selectCtl('asg-prewarm-window', 'pre-warm window', a.preWarmWindow, [
          { value: '', label: 'window…' },
          { value: '05:00', label: '05:00' },
          { value: '06:00', label: '06:00' },
          { value: '07:00', label: '07:00' },
        ], function (v) { mutateEnv(function (d) { d.asg.preWarmWindow = v; }); }),
      ]),
    ]);

    var ciRow = el('div', { class: 'switch-row', style: { alignItems: 'flex-start' } }, [
      el('div', { style: { width: '176px' } }, [
        el('span', { class: 'field-label' }, 'CI spot interruption handling'),
        selectCtl('ci-handling', 'CI spot interruption handling', env.campaign.ciSpotHandling, [
          { value: 'none', label: 'none' },
          { value: 'checkpoint-queue', label: 'checkpoint + re-queue' },
          { value: 'ignore', label: 'accept failed builds' },
        ], function (v) { mutateEnv(function (d) { d.campaign.ciSpotHandling = v; }); }),
      ]),
      el('p', { class: 't-11 muted', style: { flex: 1 } }, 'Spot capacity is reclaimable — builds must survive node loss to run on it safely.'),
    ]);

    var resBox = el('div', { class: 'warm-row', style: { marginTop: '8px' } }, [
      el('p', { class: 't-10 label muted', style: { marginBottom: '6px' } }, 'resilience posture (multi-AZ replicas)'),
    ]);
    [['storefrontAz', 'storefront tier — multi-AZ'], ['dbAz', 'database tier — multi-AZ'], ['devTestReplica', 'dev/test tier — cross-AZ replica']].forEach(function (p) {
      resBox.appendChild(el('div', { class: 'resilience-row', style: { marginBottom: '6px' } }, [
        el('span', { class: 'switch-caption mono' }, p[1]),
        LAB.switchBtn(env.resilience[p[0]], p[1], function (v) { mutateEnv(function (d) { d.resilience[p[0]] = v; }); }),
      ]));
    });

    return LAB.panel({ title: 'Scaling panel — storefront group', sub: 'CV0-004 3.2', accent: 'green' }, [grid, preWarmRow, ciRow, resBox]);
  }

  // --- storage bay ---
  var TIERS = ['hot', 'warm', 'cold', 'archive'];

  function renderStorageCard(item, env) {
    var iopsGap = item.iopsObserved > item.iopsProvisioned && item.iopsProvisioned > 0;
    var meta = (item.sizeGB >= 1024 ? (item.sizeGB / 1024).toFixed(1) + ' TB' : item.sizeGB + ' GB') +
      ' · last access ' + (item.lastAccessDays === 0 ? 'today' : item.lastAccessDays + 'd ago') +
      (item.retrievalHours ? ' · retrieval SLA ' + item.retrievalHours + 'h' : '');

    var controls = el('div', { class: 'storage-controls' });
    controls.appendChild(field('tier', selectCtl('tier-' + item.id, 'tier', item.tier, TIERS.map(function (t) { return { value: t, label: t }; }),
      function (v) {
        mutateEnv(function (d) {
          var it = d.storage.find(function (x) { return x.id === item.id; });
          if (it) { it.tier = v; it.cost = LAB.storageCost(it, v); }
        });
      })));
    if (item.kind === 'block') {
      controls.appendChild(field('provisioned IOPS', numInput('iops-' + item.id, 'provisioned IOPS', item.iopsProvisioned, function (v) {
        mutateEnv(function (d) { var it = d.storage.find(function (x) { return x.id === item.id; }); if (it) it.iopsProvisioned = Math.max(500, Number(v) || 0); });
      }, { min: 500, max: 64000, step: 500 })));
    } else {
      controls.appendChild(field('retention tag', selectCtl('retention-' + item.id, 'retention tag', item.retentionTag || '', [
        { value: '', label: '— none —' },
        { value: 'backup', label: 'backup' },
        { value: 'logs-90d', label: 'logs-90d' },
        { value: 'media', label: 'media' },
      ], function (v) { mutateEnv(function (d) { var it = d.storage.find(function (x) { return x.id === item.id; }); if (it) it.retentionTag = v || null; }); })));
    }
    var switches = el('div', { class: 'storage-switches' });
    switches.appendChild(el('span', { class: 'sw-pair' }, [
      LAB.switchBtn(item.lifecycle, 'lifecycle policy ' + item.id, function (v) { mutateEnv(function (d) { var it = d.storage.find(function (x) { return x.id === item.id; }); if (it) it.lifecycle = v; }); }),
      el('span', { class: 'sw-label' }, 'lifecycle'),
    ]));
    if (item.id === 'static-assets') {
      switches.appendChild(el('span', { class: 'sw-pair' }, [
        LAB.switchBtn(item.cdn, 'CDN offload ' + item.id, function (v) { mutateEnv(function (d) { var it = d.storage.find(function (x) { return x.id === item.id; }); if (it) it.cdn = v; }); }),
        el('span', { class: 'sw-label' }, 'CDN'),
      ]));
    }
    controls.appendChild(switches);

    return el('div', { class: 'storage-card' }, [
      el('div', { class: 'storage-card-head' }, [
        el('span', { class: 'storage-id' }, item.id),
        el('div', { class: 'storage-chips' }, [
          LAB.chip(item.tier, item.tier === 'archive' ? 'cyan' : item.tier === 'hot' ? 'amber' : 'muted'),
          LAB.chip(item.kind),
          el('span', { class: 'mono t-10 muted' }, '$' + item.cost + '/mo'),
        ]),
      ]),
      el('p', { class: 'storage-meta' }, [meta, iopsGap ? el('span', { class: 'iops-warn' }, ' · IOPS ' + item.iopsObserved.toLocaleString() + ' demand vs ' + item.iopsProvisioned.toLocaleString() + ' provisioned ⚠') : null]),
      el('p', { class: 'storage-note' }, item.note),
      controls,
    ]);
  }

  function renderStorageBay(env) {
    var list = el('div', { class: 'stack', style: { gap: '8px' } });
    env.storage.forEach(function (item) { list.appendChild(renderStorageCard(item, env)); });
    return LAB.panel({ title: 'Storage bay', sub: 'tier · IOPS · lifecycle', accent: 'cyan' }, [list]);
  }

  // --- spend board ---
  function renderSpend(env, hardMode) {
    var body = el('div', { class: 'stack', style: { gap: '8px' } });

    env.spend.forEach(function (c) {
      var over = c.monthly > c.budget;
      var ratio = Math.min(1.6, c.monthly / c.budget);
      body.appendChild(el('div', { class: 'spend-row' }, [
        el('div', { class: 'spend-row-head' }, [
          el('span', { class: 'spend-name' }, c.label),
          el('span', { class: 'spend-nums' }, [
            el('span', { style: { color: over ? '#FF6B6B' : '#8FA0B5' } }, '$' + c.monthly.toLocaleString()),
            el('span', { class: 'muted' }, ' / budget $' + c.budget.toLocaleString()),
            over ? el('span', { class: 'coral-text', style: { marginLeft: '4px' } }, '+' + Math.round(((c.monthly - c.budget) / c.budget) * 100) + '%') : null,
          ]),
        ]),
        el('div', { class: 'spend-bar-row' }, [
          el('div', { class: 'spend-bar-track' }, [el('div', { class: 'spend-bar-fill', style: { width: (ratio / 1.6) * 100 + '%', backgroundColor: over ? '#FF6B6B' : '#35E08C' } })]),
          LAB.sparkline(c.trend, over ? 1.1 : undefined),
        ]),
      ]));
    });

    // compute spend by tag (metering)
    var sums = {};
    env.fleet.forEach(function (fl) {
      if (fl.status === 'decommissioned') return;
      var key = fl.tags.length === 0 ? 'untagged' : fl.tags.indexOf('prod') > -1 ? 'prod' : fl.tags[0];
      sums[key] = (sums[key] || 0) + fl.cost;
    });
    var tagRows = Object.keys(sums).map(function (k) { return { tag: k, monthly: sums[k] }; }).sort(function (a, b) { return b.monthly - a.monthly; });
    var tagGrid = el('div', { class: 'tag-spend-grid' });
    tagRows.forEach(function (t) {
      tagGrid.appendChild(el('span', { class: t.tag === 'untagged' ? 'untagged' : 'tagged' }, t.tag === 'untagged' ? '⚠ untagged' : t.tag + ': $' + Math.round(t.monthly)));
    });
    body.appendChild(el('div', { class: 'warm-row', style: { marginTop: '4px' } }, [
      el('p', { class: 't-10 label muted', style: { marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' } }, [LAB.icon('tags'), ' compute spend by tag (metering)']),
      tagGrid,
    ]));

    // answer fields
    var ans = el('div', { class: 'spend-answer-grid' });
    ans.appendChild(field('over-budget service', selectCtl('spend-service', 'over-budget service', env.spendAnswer.service,
      [{ value: '', label: '— select —' }].concat(env.spend.map(function (c) { return { value: c.id, label: c.label }; })),
      function (v) { mutateEnv(function (d) { d.spendAnswer.service = v; }); })));
    ans.appendChild(field('% over budget', numInput('spend-pct', '% over budget', env.spendAnswer.pct, function (v) {
      mutateEnv(function (d) { d.spendAnswer.pct = v; });
    }, { placeholder: 'e.g. 12' })));
    if (hardMode) {
      ans.appendChild(el('div', { class: 'span-2' }, field('root-cause driver', selectCtl('spend-cause', 'root-cause driver', env.spendCause, [
        { value: '', label: '— select driver —' },
        { value: 'snapshot-sprawl', label: 'snapshot sprawl from an idle host' },
        { value: 'new-backup-jobs', label: 'new backup jobs added this month' },
        { value: 'price-increase', label: 'provider price increase' },
        { value: 'iops-growth', label: 'IOPS provisioning growth' },
      ], function (v) { mutateEnv(function (d) { d.spendCause = v; }); }))));
    }
    body.appendChild(ans);
    body.appendChild(el('p', { class: 'panel-footnote' }, 'simplified training economics — not real CSP pricing'));

    return LAB.panel({ title: 'Spend board', sub: 'monthly · simplified', accent: 'amber' }, [body]);
  }

  // --- advisor queue ---
  function renderAdvisor(env) {
    var list = el('div', { class: 'stack', style: { gap: '8px' } });
    LAB.FINDINGS.forEach(function (fd) {
      var verdict = env.triage[fd.id];
      list.appendChild(el('div', { class: 'finding' + (verdict ? ' verdict-set' : '') }, [
        el('p', { class: 'finding-text' }, [el('span', { class: 'muted' }, fd.id + ' · '), fd.text]),
        el('div', { class: 'finding-actions' }, [
          el('button', {
            class: 'finding-btn' + (verdict === 'confirm' ? ' confirm-active' : ''), type: 'button',
            'aria-pressed': verdict === 'confirm' ? 'true' : 'false', 'data-fk': 'confirm-' + fd.id,
            onclick: function () { mutateEnv(function (d) { d.triage[fd.id] = 'confirm'; }); },
          }, 'confirm'),
          el('button', {
            class: 'finding-btn' + (verdict === 'dismiss' ? ' dismiss-active' : ''), type: 'button',
            'aria-pressed': verdict === 'dismiss' ? 'true' : 'false', 'data-fk': 'dismiss-' + fd.id,
            onclick: function () { mutateEnv(function (d) { d.triage[fd.id] = 'dismiss'; }); },
          }, 'dismiss'),
          verdict ? el('span', { class: 'finding-logged' }, 'logged — CHECK the clearance to validate') : null,
        ]),
      ]));
    });
    list.appendChild(el('p', { class: 'panel-footnote' }, 'advisor findings may be wrong — evidence first'));
    return LAB.panel({ title: 'Advisor queue', sub: 'triage required', accent: 'coral' }, [list]);
  }

  function renderFloor() {
    var env = ms().env;
    var hard = mode() === 'hard';
    var grid = el('div', { class: 'floor-grid' });

    var col1 = el('div', { class: 'stack' });
    col1.appendChild(el('section', { class: 'panel', 'aria-label': 'Radar scope' }, [
      el('header', { class: 'panel-head' }, [el('h3', { class: 'panel-title' }, [el('span', { class: 'dot', 'aria-hidden': 'true', style: { background: '#35E08C' } }), 'Radar scope'])]),
      el('div', { class: 'panel-body' }, [renderRadar(env.fleet)]),
    ]));
    col1.appendChild(renderFloorLegend());
    col1.appendChild(renderObservability(env));
    col1.appendChild(renderTelemetry());

    var col2 = el('div', { class: 'stack' });
    col2.appendChild(renderRack(env));
    col2.appendChild(renderScaling(env));

    var col3 = el('div', { class: 'stack' });
    col3.appendChild(renderStorageBay(env));
    col3.appendChild(renderSpend(env, hard));
    col3.appendChild(renderAdvisor(env));

    grid.appendChild(col1); grid.appendChild(col2); grid.appendChild(col3);
    return grid;
  }

  /* ==========================================================================
     CLEARANCES CHANNEL (C4 objective tracker + CHECK engine + hints)
     ========================================================================== */
  var PILLAR_ORDER = { P1: 0, P2: 1, P3: 2, P4: 3 };

  function renderClearances() {
    var m = mode();
    var cur = ms();
    var hard = m === 'hard';
    var os = objectives();
    var num = function (id) { return Number(id.replace(/^OBJ-[MH]/, '')); };
    var sorted = os.slice().sort(function (a, b) {
      var pa = cur.checks[a.id] && cur.checks[a.id].passed ? 1 : 0;
      var pb = cur.checks[b.id] && cur.checks[b.id].passed ? 1 : 0;
      if (pa !== pb) return pa - pb;
      var oa = PILLAR_ORDER[a.pillar] - PILLAR_ORDER[b.pillar];
      return oa !== 0 ? oa : num(a.id) - num(b.id);
    });
    var pc = passedCount();
    var ready = signOffReady();

    var wrap = el('div', { class: 'stack' });

    wrap.appendChild(el('div', { class: 'clear-head' }, [
      el('p', { class: 'clear-head-main' }, [
        'clearances issued: ', el('span', { class: 'green-text' }, pc + '/' + os.length),
        el('span', { class: 'muted', style: { marginLeft: '12px' } },
          hard ? 'live savings gauge: $' + savings() + ' / target $' + LAB.SAVINGS_TARGET_HARD : 'live savings: $' + savings() + '/mo'),
      ]),
      hard
        ? el('p', { class: 'clear-head-mode amber-text' }, 'solo shift: 1 paid nudge max · near-misses rejected with rationale')
        : el('p', { class: 'clear-head-mode muted' }, 'training shift: hints free · tolerant checks'),
    ]));

    var list = el('div', { class: 'clear-list' });
    sorted.forEach(function (o) {
      list.appendChild(renderClearance(o, cur, hard, num));
    });
    wrap.appendChild(list);

    var gate = el('div', { class: 'signoff-gate' }, [
      el('p', {}, 'Sign-off unlocks when every clearance is issued and the debrief quiz is submitted. Stars reward first-attempt accuracy and low hint use.'),
      el('button', {
        class: 'btn btn-green btn-lg', type: 'button', 'data-fk': 'request-signoff',
        disabled: !ready, id: 'request-signoff-btn',
        onclick: function () { signOffManual = true; scheduleRender(); },
      }, 'request sign-off' + (ready ? '' : ' ( ' + pc + '/' + os.length + ' clearances · quiz ' + (cur.quiz.submitted ? '✓' : 'pending') + ' )')),
    ]);
    wrap.appendChild(gate);
    return wrap;
  }

  function renderClearance(o, cur, hard, num) {
    var rec = cur.checks[o.id];
    var passed = !!(rec && rec.passed);
    var hintLevel = cur.hints[o.id] || 0;
    var fb = cur.msgs[o.id];
    var open = !!clearanceOpen[o.id];
    var maxHints = hard ? 1 : 3;

    var card = el('article', { class: 'clearance' + (passed ? ' passed' : '') });

    var toggle = el('button', {
      class: 'clear-toggle', type: 'button', 'aria-expanded': open ? 'true' : 'false',
      'data-fk': 'clearance-' + o.id,
      onclick: function () { clearanceOpen[o.id] = !open; render(); },
    }, [
      LAB.icon(passed ? 'check-circle-2' : 'circle-dashed', 'clear-status ' + (passed ? 'passed' : 'pending')),
      el('span', { class: 'clear-idline' }, [
        el('span', { class: 'clear-id' }, o.id),
        el('span', { class: 'clear-title' }, o.title),
      ]),
      LAB.pillarChip(o.pillar),
      LAB.icon(open ? 'chevron-down' : 'chevron-right', 'clear-chevron'),
    ]);
    card.appendChild(toggle);

    // collapsible body: always in the DOM so the 0fr→1fr grid transition animates
    var inner = el('div', { class: 'clear-body-pad' });
    if (open) {
      inner.appendChild(el('p', { class: 'clear-task' }, o.task));
      if (o.where) inner.appendChild(el('p', { class: 'clear-where' }, 'where to look → ' + o.where));
      inner.appendChild(el('div', { class: 'clear-covers' }, o.covers.map(function (c) { return LAB.chip(c); })));

      if (hintLevel > 0) {
        var hints = el('div', { class: 'hint-stack', role: 'status' });
        o.hints.slice(0, hintLevel).forEach(function (h, i) {
          hints.appendChild(el('p', { class: 'hint-box' }, 'hint ' + (i + 1) + ': ' + h));
        });
        inner.appendChild(hints);
      }

      if (fb) {
        inner.appendChild(el('div', { role: 'status', 'aria-live': 'polite', class: 'clear-feedback ' + (fb.ok ? 'ok' : 'fail') }, [
          el('span', { class: 'cf-label' }, fb.ok ? 'check results — cleared ✓' : 'check results — rejected'),
          el('br'), fb.msg,
        ]));
      }

      var actions = el('div', { class: 'clear-actions' });
      actions.appendChild(el('button', {
        class: 'btn btn-green', type: 'button', 'data-fk': 'check-' + o.id,
        onclick: function () { runCheck(o); },
      }, 'check results'));
      if (!passed && hintLevel < maxHints) {
        actions.appendChild(el('button', {
          class: 'btn btn-amber', type: 'button', 'data-fk': 'hint-' + o.id,
          onclick: function () { useHint(o); },
        }, [LAB.icon('lightbulb'), ' ' + (hard ? 'nudge (' + hintLevel + '/1 · costs stars)' : 'hint ' + (hintLevel + 1) + '/3')]));
      }
      if (rec && rec.attempts > 0 && !passed) {
        actions.appendChild(el('span', { class: 'failed-count' }, 'failed checks: ' + rec.attempts));
      }
      inner.appendChild(actions);
    }

    var body = el('div', { class: 'clear-body' + (open ? ' open' : '') }, [el('div', { class: 'clear-body-inner' }, [inner])]);
    card.appendChild(body);
    return card;
  }

  /* ==========================================================================
     DEBRIEF CHANNEL (C5 knowledge quiz + C6 field notes)
     ========================================================================== */
  function renderDebrief() {
    var m = mode();
    var cur = ms();
    var hard = m === 'hard';
    var questions = LAB.quiz.bank(m);
    var answeredAll = LAB.quiz.answeredAll(m, cur.quiz);
    var checkedAll = LAB.quiz.checkedAll(m, cur.quiz);
    var submitted = cur.quiz.submitted;
    var correctCount = LAB.quiz.correctCount(m, cur.quiz);

    var wrap = el('div', { class: 'stack' });

    var quizBody = [];
    if (hard && !submitted) quizBody.push(el('p', { class: 'quiz-note' }, 'Solo shift: nothing reveals until you submit. Review every pick — submission is final.'));
    if (hard && submitted) quizBody.push(el('p', { class: 'quiz-note' }, 'Submitted — answers are locked. Your picks are marked; the debrief notes explain every call.'));

    var ol = el('ol', { class: 'quiz-list' });
    questions.forEach(function (q, qi) {
      ol.appendChild(renderQuizItem(q, qi, m, cur, hard));
    });
    quizBody.push(ol);

    if (hard) {
      var row = el('div', { class: 'quiz-actions' }, [
        el('button', {
          class: 'btn btn-amber btn-lg', type: 'button', 'data-fk': 'quiz-submit',
          disabled: !answeredAll || submitted,
          onclick: function () { submitQuiz(); },
        }, submitted ? 'submitted — ' + correctCount + '/' + questions.length + ' correct' : 'submit answers'),
        !answeredAll && !submitted ? el('span', { class: 'quiz-next-note' }, 'answer all items, review, then submit') : null,
      ]);
      quizBody.push(row);
    } else {
      quizBody.push(el('p', { class: 'quiz-scoreline' },
        checkedAll
          ? 'score: ' + correctCount + '/' + questions.length + ' correct · explanations stay open for review'
          : 'answered ' + Object.keys(cur.quiz.answers).length + '/' + questions.length + ' · check each item to lock it'));
    }

    wrap.appendChild(LAB.panel({
      title: 'Knowledge check',
      sub: hard ? '7 scenario items · review, then submit once' : '6 concept items · check each answer to lock it',
      accent: 'amber',
    }, quizBody));

    // --- field notes: detection opportunities ---
    var table = el('table', { class: 'notes-table' });
    table.appendChild(el('thead', {}, [el('tr', {}, [
      el('th', {}, 'signal'), el('th', {}, 'example detection logic'), el('th', {}, 'first action'),
    ])]));
    var tb = el('tbody', {});
    LAB.DETECTION_TABLE.forEach(function (r) {
      tb.appendChild(el('tr', {}, [el('td', {}, r[0]), el('td', {}, r[1]), el('td', {}, r[2])]));
    });
    table.appendChild(tb);
    wrap.appendChild(LAB.panel({ title: 'Field notes — detection opportunities', sub: 'signals → logic → action', accent: 'cyan' }, [
      el('div', { class: 'notes-table-wrap' }, [table]),
    ]));

    // --- field notes: mitigation playbook ---
    var pb = el('div', { class: 'playbook-grid' });
    LAB.PLAYBOOK.forEach(function (p) {
      pb.appendChild(el('div', { class: 'playbook-card' }, [
        el('p', { class: 'playbook-title' }, p[0]),
        el('p', { class: 'playbook-body' }, p[1]),
      ]));
    });
    wrap.appendChild(LAB.panel({ title: 'Field notes — mitigation playbook', sub: 'mapped to CV0-004 objectives', accent: 'green' }, [pb]));

    // --- field notes: two mindsets ---
    var mind = el('div', { class: 'mindset-grid' });
    mind.appendChild(el('div', { class: 'mindset-card blue' }, [
      el('p', { class: 'mindset-title' }, 'blue-team takeaways'),
      el('ul', { class: 'mindset-list' }, LAB.BLUE_TAKEAWAYS.map(function (t) { return el('li', { html: t }); })),
    ]));
    mind.appendChild(el('div', { class: 'mindset-card red' }, [
      el('p', { class: 'mindset-title' }, 'red-team mindset (defensive use)'),
      el('ul', { class: 'mindset-list' }, LAB.RED_TAKEAWAYS.map(function (t) { return el('li', {}, t); })),
    ]));
    wrap.appendChild(LAB.panel({ title: 'Field notes — two mindsets', sub: 'blue / red', accent: 'coral' }, [
      mind,
      el('p', { class: 'refs-row' }, [
        el('span', { class: 'refs-label' }, [LAB.icon('link'), ' official references:']),
        el('a', { href: 'https://www.comptia.org/en-us/certifications/cloud', target: '_blank', rel: 'noreferrer' }, 'CompTIA Cloud+ (exam page & objectives PDF)'),
        el('a', { href: 'https://attack.mitre.org/techniques/T1496/', target: '_blank', rel: 'noreferrer' }, 'MITRE ATT&CK T1496 — Resource Hijacking'),
      ]),
      el('p', { class: 'disclaimer' }, [
        LAB.icon('notebook-pen'),
        ' All figures in this lab are simplified training economics on a fictional provider (NimbusGrid). Real pricing, discount rates and retrieval SLAs vary by provider and region.',
      ]),
    ]));

    return wrap;
  }

  function renderQuizItem(q, qi, m, cur, hard) {
    var chosen = cur.quiz.answers[qi];
    var show = LAB.quiz.revealed(m, cur.quiz, qi);
    var locked = LAB.quiz.locked(m, cur.quiz, qi);

    var li = el('li', { class: 'quiz-item' });
    li.appendChild(el('p', { id: 'quiz-q' + qi, tabindex: '-1', class: 'quiz-q' }, [
      el('span', { class: 'qnum' }, 'Q' + (qi + 1) + '.'),
      q.q,
    ]));

    var opts = el('div', { class: 'quiz-opts' });
    q.options.forEach(function (opt, oi) {
      var isChosen = chosen === oi;
      var cls = 'quiz-opt';
      if (show && isChosen) cls += oi === q.answer ? ' good' : ' bad';
      else if (isChosen) cls += ' picked';
      var kids = [
        el('span', { class: 'opt-letter' }, String.fromCharCode(65 + oi)),
        el('span', {}, opt),
      ];
      if (show && isChosen && oi === q.answer) kids.push(el('span', { class: 'opt-verdict' }, 'correct ✓'));
      if (show && isChosen && oi !== q.answer) kids.push(el('span', { class: 'opt-verdict' }, 'your pick'));
      opts.appendChild(el('button', {
        class: cls, type: 'button', 'aria-pressed': isChosen ? 'true' : 'false',
        disabled: locked, 'data-fk': 'quiz-' + qi + '-' + oi,
        onclick: function () { answerQuiz(qi, oi); },
      }, kids));
    });
    li.appendChild(opts);

    if (show && chosen !== undefined) {
      li.appendChild(el('p', { class: 'quiz-why' }, [
        el('span', { class: 'why-label' }, 'why · '),
        q.explain,
      ]));
    }

    if (!hard) {
      var row = el('div', { class: 'quiz-actions' });
      var btn = el('button', {
        class: 'btn btn-green', type: 'button', 'data-fk': 'quizcheck-' + qi,
        disabled: chosen === undefined || cur.quiz.checked[qi] === true,
        onclick: function () {
          checkQuiz(qi);
          // D10: enforced progression — after validation the student moves to the next question
          root.setTimeout(function () {
            var next = document.getElementById('quiz-q' + (qi + 1));
            if (next) next.focus();
          }, 60);
        },
      }, cur.quiz.checked[qi] ? [LAB.icon('lock'), ' answer locked'] : 'check answer');
      row.appendChild(btn);
      if (cur.quiz.checked[qi] && qi < LAB.QUIZ[m].length - 1) row.appendChild(el('span', { class: 'quiz-next-note' }, 'locked — next question ↓'));
      if (cur.quiz.checked[qi] && qi === LAB.QUIZ[m].length - 1) row.appendChild(el('span', { class: 'quiz-next-note' }, 'locked — all items checked'));
      li.appendChild(row);
    }
    return li;
  }

  /* ==========================================================================
     DIALOGS (reset · switch · sign-off)
     ========================================================================== */
  function openResetDialog(opener) {
    LAB.openDialog({
      role: 'alertdialog', alert: true, opener: opener, labelId: 'reset-title',
      build: function (box, close) {
        var desc = el('p', { class: 'dialog-desc', id: 'reset-desc' }, [
          'This wipes all clearances, hints, quiz answers and every environment action for the ', el('strong', {}, 'current shift'), ', restoring the pristine tower.',
          el('br'),
          el('button', { class: 'linkish', type: 'button', style: { marginTop: '8px' }, onclick: function () { close(); wipeAll(); } }, '…or wipe BOTH shifts and all saved progress'),
        ]);
        box.appendChild(el('header', {}, [
          el('h2', { class: 'dialog-title', id: 'reset-title' }, 'Reset shift?'),
          desc,
        ]));
        box.appendChild(el('div', { class: 'dialog-actions' }, [
          el('button', { class: 'btn btn-ghost', type: 'button', onclick: close }, 'cancel'),
          el('button', { class: 'btn btn-solid-coral', type: 'button', onclick: function () { close(); resetMode(); } }, 'reset this shift'),
        ]));
      },
    });
  }

  function openSwitchDialog(opener) {
    var m = mode();
    var otherMode = m === 'medium' ? 'hard' : 'medium';
    LAB.openDialog({
      role: 'alertdialog', alert: true, opener: opener, labelId: 'switch-title',
      build: function (box, close) {
        box.appendChild(el('header', {}, [
          el('h2', { class: 'dialog-title', id: 'switch-title' }, 'Switch shift?'),
          el('p', { class: 'dialog-desc', id: 'switch-desc' }, [
            'Each shift keeps its own independent progress. Your ', (m === 'medium' ? 'training' : 'solo'),
            ' shift progress is saved — you can switch back anytime.',
          ]),
        ]));
        box.appendChild(el('div', { class: 'dialog-actions' }, [
          el('button', { class: 'btn btn-ghost', type: 'button', onclick: close }, 'stay'),
          el('button', {
            class: 'btn btn-solid-green', type: 'button',
            onclick: function () {
              close();
              state.mode = otherMode;
              clearSignOff();
              channel = 'brief';
              save();
              scheduleRender();
            },
          }, '→ ' + (otherMode === 'medium' ? 'training shift (medium)' : 'solo night shift (hard)')),
        ]));
      },
    });
  }

  function openSignOff() {
    if (signOffDialog) return;
    var m = mode();
    var cur = ms();
    var os = objectives();
    var hard = m === 'hard';
    var score = LAB.computeScore(m, cur, os.length);
    var opener = document.getElementById('request-signoff-btn') || null;

    signOffDialog = LAB.openDialog({
      signoff: true, opener: opener, labelId: 'signoff-title',
      onClose: function () {
        signOffDialog = null;
        signOffManual = false;
        signOffDismissed = true;
      },
      build: function (box, close) {
        var content = el('div', { class: 'stack', style: { gap: '12px', marginTop: '10px' } });

        // score row
        var stars = el('p', { class: 'stars', role: 'img', 'aria-label': score.stars + ' of 3 stars' });
        [1, 2, 3].forEach(function (i) {
          var s = LAB.icon('star');
          s.style.color = i <= score.stars ? '#FFB454' : '#2A3B50';
          s.style.fill = i <= score.stars ? '#FFB454' : 'transparent';
          stars.appendChild(s);
        });
        content.appendChild(el('div', { class: 'signoff-score' }, [
          el('p', { class: 'score-label' }, 'score'),
          el('p', { class: 'score-value' }, Math.round(score.score * 100) + '%'),
          stars,
        ]));

        content.appendChild(el('p', { class: 'signoff-stats' },
          score.passed + '/' + os.length + ' clearances · quiz ' + score.quizCorrect + '/' + score.quizTotal +
          ' · hints used ' + score.hintsUsed + ' · first-try failures ' + score.failedAttempts +
          '. Stars: ≥90% score with ' + (hard ? 'zero hints (the paid nudge costs the 3rd star)' : '≤2 hints') + ' and ≤2 failed checks = 3★.'));

        // R8 focus areas — from this student's own evidence
        var areas = LAB.computeFocusAreas(m, cur);
        var focus = el('div', { class: 'focus-block' }, [
          el('p', { class: 'focus-title' }, 'focus areas — from your own run'),
        ]);
        if (areas.length === 0) {
          focus.appendChild(el('p', { class: 't-12', style: { lineHeight: '1.4' } },
            'No weak signals: every clearance first-try, no hints, full quiz correct. Next stop: the ' + (m === 'medium' ? 'solo night shift (hard)' : 'exam itself') + '.'));
        } else {
          focus.appendChild(el('ul', {}, areas.map(function (a) {
            return el('li', {}, [el('span', { class: 'fl' }, a.label), ' — ' + a.detail]);
          })));
        }
        content.appendChild(focus);

        // pillar recap
        var recap = el('div', { class: 'pillar-recap' });
        ['P1', 'P2', 'P3', 'P4'].forEach(function (p) {
          var pos = os.filter(function (o) { return o.pillar === p; });
          var done = pos.filter(function (o) { return cur.checks[o.id] && cur.checks[o.id].passed; }).length;
          recap.appendChild(el('div', { class: 'pillar-box' }, [
            el('p', { class: 'pb-head' }, (p === 'P1' ? 'understand' : p === 'P2' ? 'recognize' : p === 'P3' ? 'detect' : 'mitigate') + ' · ' + done + '/' + pos.length),
            el('p', { class: 'pb-ids' }, pos.map(function (o) { return o.id.replace('OBJ-', ''); }).join(', ')),
          ]));
        });
        content.appendChild(recap);

        // what to learn next
        content.appendChild(el('div', { class: 'next-steps' }, [
          el('p', { class: 'ns-title' }, 'what to learn next'),
          el('ul', {}, LAB.NEXT_STEPS.map(function (n) { return el('li', {}, n); })),
        ]));

        content.appendChild(el('p', { class: 'signoff-foot' }, 'You can keep working the tower after sign-off — the environment stays live and the reset button restores a pristine shift.'));

        box.appendChild(el('header', {}, [
          el('div', { style: { display: 'flex', justifyContent: 'flex-end' } }, [LAB.dialogX(close)]),
          el('h2', { class: 'dialog-title signoff-title', id: 'signoff-title' }, 'Shift sign-off'),
          el('p', { class: 'dialog-desc', id: 'signoff-desc', style: { fontSize: '11px' } }, 'Shift results and focus areas — close it anytime; the tower stays live.'),
        ]));
        box.appendChild(content);
      },
    });
  }

  /* ==========================================================================
     RENDER ROOT
     ========================================================================== */
  var clearanceOpen = {}; // per-clearance disclosure state (not persisted, like the original)

  function render() {
    if (!state || !appEl) return;
    var fk = captureFocus();

    // keep the telemetry timer in step with the active channel (parity with
    // the original's mount/unmount of the TelemetryFeed component)
    if (channel === 'floor' && mode()) {
      if (!telemetry.timer) telemetry.timer = root.setInterval(pushTelemetryLine, 4000);
    } else if (telemetry.timer) {
      root.clearInterval(telemetry.timer);
      telemetry.timer = null;
    }

    var root_;
    if (!mode()) {
      root_ = renderModeScreen();
    } else {
      var shell = el('div', { class: 'shell' });
      shell.appendChild(renderStatusBar());
      shell.appendChild(renderTabs());

      var paneId = 'pane-' + channel;
      var pane;
      if (channel === 'brief') pane = renderBriefing();
      else if (channel === 'floor') pane = renderFloor();
      else if (channel === 'clear') pane = renderClearances();
      else pane = renderDebrief();

      var paneWrap = el('div', {
        class: 'channel-pane', id: paneId, role: 'tabpanel', 'aria-labelledby': 'tab-' + channel, tabindex: '-1',
      }, [pane]);
      shell.appendChild(paneWrap);
      root_ = shell;
    }

    appEl.innerHTML = '';
    appEl.appendChild(el('div', { class: 'scanlines', 'aria-hidden': 'true' }));
    appEl.appendChild(root_);

    restoreFocus(fk);

    // sign-off auto-open / manual open (once ready); never re-opens after dismissal
    if (mode() && signOffOpen() && !signOffDialog) openSignOff();
  }

  /* ---------- boot ---------- */
  function boot() {
    appEl = document.getElementById('app');
    state = LAB.loadLabState() || LAB.createLabState();
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(typeof window !== 'undefined' ? window : globalThis);
