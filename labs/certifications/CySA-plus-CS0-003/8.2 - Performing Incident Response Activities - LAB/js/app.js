// ─── CyberLab · js/app.js — bootstrap, view orchestration, modals ─────────
// Port of the orchestrator (src/components/lab/ir/ir-lab.tsx) + the modal
// plumbing Radix provided in the original (Dialog / AlertDialog).
//
// Rendering model: the deck is mounted once per mode; a state change runs
// cheap per-component `update(state)` patchers (classes/text/aria on stable
// nodes). Only mode changes, station changes and reset do full swaps — the
// same granularity React's reconciliation achieved in the original.

window.LAB = window.LAB || {};
(function (LAB) {
  'use strict';

  var ui = LAB.ui;
  var h = ui.h;
  var results = {}; // validation feedback per objective — session-only (parity: not persisted)

  // ═══ modal system (Radix Dialog / AlertDialog parity) ════════════════════

  var openModalState = null; // { overlay, panel, opener, alert, onKeydown }

  function focusables(panel) {
    return panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  }

  function closeModal() {
    var m = openModalState;
    if (!m) return;
    openModalState = null;
    document.removeEventListener('keydown', m.onKeydown, true);
    m.overlay.classList.add('closing');
    setTimeout(function () {
      if (m.overlay.parentNode) m.overlay.parentNode.removeChild(m.overlay);
    }, 160);
    if (m.opener && m.opener.isConnected) m.opener.focus();
  }

  /** opts: { alert:boolean, title, titleClass, description, descriptionId, body:[els], footer:[els] } */
  function openModal(opts) {
    if (openModalState) closeModal();
    var opener = document.activeElement;

    var panel = h('div', { class: 'modal-panel' + (opts.alert ? ' is-alert' : ''), role: 'dialog', 'aria-modal': 'true', tabindex: '-1' });
    panel.setAttribute('aria-labelledby', 'modal-title');

    var head = h('div', { class: 'modal-head' });
    var title = h('h2', { id: 'modal-title', class: 'modal-title ' + (opts.titleClass || '') });
    if (opts.titleIcon) {
      title.appendChild(LAB.icon(opts.titleIcon, 'h-5 w-5 ' + (opts.titleIconClass || '')));
      title.appendChild(document.createTextNode(' '));
    }
    title.appendChild(document.createTextNode(opts.title));
    head.appendChild(title);
    if (!opts.alert) {
      var x = h('button', { type: 'button', class: 'modal-x', 'aria-label': 'Close' });
      x.appendChild(LAB.icon('X', 'h-4 w-4'));
      x.addEventListener('click', function () { closeModal(); });
      head.appendChild(x);
    }
    panel.appendChild(head);

    var bodyWrap = h('div', { class: 'modal-body' });
    if (opts.description) {
      bodyWrap.appendChild(h('p', { id: 'modal-desc', class: 'modal-desc', text: opts.description }));
      panel.setAttribute('aria-describedby', 'modal-desc');
    }
    for (var i = 0; i < (opts.body || []).length; i++) bodyWrap.appendChild(opts.body[i]);
    panel.appendChild(bodyWrap);
    if (opts.footer) panel.appendChild(h('div', { class: 'modal-footer' }, opts.footer));

    var overlay = h('div', { class: 'modal-overlay' }, panel);
    if (!opts.alert) {
      overlay.addEventListener('mousedown', function (ev) {
        if (!panel.contains(ev.target)) closeModal();
      });
    }

    var onKeydown = function (ev) {
      if (ev.key === 'Escape') { ev.preventDefault(); closeModal(); return; }
      if (ev.key === 'Tab') {
        var f = focusables(panel);
        if (!f.length) return;
        var first = f[0];
        var last = f[f.length - 1];
        if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
        else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKeydown, true);

    document.body.appendChild(overlay);
    openModalState = { overlay: overlay, panel: panel, opener: opener, alert: !!opts.alert, onKeydown: onKeydown };
    panel.focus();
    return closeModal;
  }

  // ── glossary dialog ──────────────────────────────────────────────────────
  function openGlossary(trigger) {
    var list = h('div', { class: 'gloss-list' });
    for (var i = 0; i < LAB.GLOSSARY.length; i++) {
      var g = LAB.GLOSSARY[i];
      list.appendChild(h('div', { class: 'g-item' },
        h('p', { class: 'mono g-term', text: g.term.toUpperCase() }),
        h('p', { class: 'g-def', text: g.def })));
    }
    openModal({
      alert: false,
      title: 'DECK GLOSSARY',
      titleClass: 'gloss-title',
      description: 'Fifteen terms this deck assumes you can use fluently.',
      body: [list],
    });
  }

  // ── reset confirm (AlertDialog: no backdrop-dismiss, no X — parity) ──────
  function openReset() {
    var cancel = h('button', { type: 'button', class: 'btn btn-outline btn-min11', text: 'STAND DOWN' });
    var confirm = h('button', { type: 'button', class: 'btn btn-rose-solid btn-min11', text: 'CONFIRM RESET' });
    cancel.addEventListener('click', function () { closeModal(); });
    confirm.addEventListener('click', function () { closeModal(); resetLab(); });
    openModal({
      alert: true,
      title: 'RESET THE LAB?',
      titleClass: 'reset-title',
      description: 'Wipes all progress, checks, quiz results and saved state for BOTH watches. The deck returns to the mode-selection screen.',
      footer: [cancel, confirm],
    });
  }

  // ── completion modal (C7) ────────────────────────────────────────────────
  function openCompletion(trigger) {
    var s = LAB.getState();
    var mode = s.mode;
    var total = mode === 'medium' ? 12 : 9;
    var passed = 0;
    for (var k in s.objectives) if (s.objectives[k].status === 'passed') passed++;
    var stars = LAB.computeStars(s);
    var pillars = LAB.pillarProgress(s);
    var quizTotal = mode === 'medium' ? LAB.QUIZ_M.length : LAB.QUIZ_H.length;

    var starsRow = h('div', { class: 'stars-row', role: 'img', 'aria-label': stars + ' out of 5 stars' });
    for (var i = 1; i <= 5; i++) {
      starsRow.appendChild(LAB.icon('Star', 'h-8 w-8 star' + (i <= stars ? ' filled' : ''), { fill: i <= stars }));
    }
    starsRow.appendChild(h('span', { class: 'mono stars-num', text: stars.toFixed(1) }));

    var statsGrid = h('div', { class: 'stats-grid' },
      h('div', { class: 'stat-box' }, h('p', { class: 'mono stat-num', text: passed + '/' + total }), h('p', { class: 'stat-label', text: 'OBJECTIVES' })),
      h('div', { class: 'stat-box' }, h('p', { class: 'mono stat-num', text: (s.quizScore || 0) + '/' + quizTotal }), h('p', { class: 'stat-label', text: 'KNOWLEDGE CHECK' })),
      h('div', { class: 'stat-box' }, h('p', { class: 'mono stat-num', text: '6/6' }), h('p', { class: 'stat-label', text: 'PHASES WORKED' })));

    var PILLAR_ROWS = [
      ['P1', 'UNDERSTAND — lifecycle, severity, exercises'],
      ['P2', 'RECOGNIZE — triage, chain, root cause'],
      ['P3', 'DETECT — earliest detection, metrics'],
      ['P4', 'MITIGATE — contain, eradicate, recover'],
    ];
    var pillarRows = h('div', { class: 'pl-rows' });
    for (var p = 0; p < PILLAR_ROWS.length; p++) {
      var key = PILLAR_ROWS[p][0];
      var label = PILLAR_ROWS[p][1];
      var done = pillars[key][0];
      var tot = pillars[key][1];
      pillarRows.appendChild(h('div', { class: 'pl-row' },
        h('span', { class: 'mono pl-key', text: key }),
        h('div', { class: 'pl-bar' }, h('div', { class: 'pl-fill', style: 'width:' + (done / tot) * 100 + '%' })),
        h('span', { class: 'mono pl-count', text: done + '/' + tot }),
        h('span', { class: 'pl-label', text: label })));
    }

    var nextLines = [
      '▸ Lesson 8.3 — digital forensics: chain of custody, order of volatility, imaging (your memory capture was a preview).',
      '▸ NIST SP 800-61r2 — the canonical IR lifecycle this deck follows (link in Field Notes).',
      '▸ Rerun the lab in ' + (mode === 'medium' ? 'HARD watch — noisy evidence, herrings, strict checks' : 'MEDIUM watch to bank a clean 5★ run') + '.',
      '▸ MITRE ATT&CK: trace T1566.001 and T1486 pages end-to-end, then map one control per mitigations list.',
    ];
    var nextList = h('ul', { class: 'next-list' });
    for (var n = 0; n < nextLines.length; n++) nextList.appendChild(h('li', { text: nextLines[n] }));

    var resetBtn = h('button', { type: 'button', class: 'btn btn-rose-outline btn-min11' });
    resetBtn.appendChild(LAB.icon('RotateCcw', 'h-4 w-4 btn-ico'));
    resetBtn.appendChild(document.createTextNode(' RESET LAB'));
    resetBtn.addEventListener('click', function () { closeModal(); resetLab(); });
    var backBtn = h('button', { type: 'button', class: 'btn btn-emerald btn-min11', text: 'BACK TO THE DECK' });
    backBtn.addEventListener('click', function () { closeModal(); });

    openModal({
      alert: false,
      title: 'INCIDENT IR-2025-0141 CLOSED',
      titleClass: 'completion-title',
      titleIcon: 'Award',
      titleIconClass: 'completion-ico',
      description: 'All stations worked, all objectives validated, knowledge check submitted. You did not just read about IR — you ran one.',
      body: [
        starsRow,
        h('p', { class: 'stars-explain', text: 'Stars = first-attempt accuracy and hint discipline.' }),
        statsGrid,
        h('div', { class: 'pillar-box' },
          h('p', { class: 'mono pillar-h', text: 'MASTERY BY PILLAR' }),
          pillarRows),
        h('div', { class: 'next-box' },
          h('p', { class: 'mono next-h', text: 'WHERE TO GO NEXT' }),
          nextList),
      ],
      footer: [resetBtn, backBtn],
    });
  }

  // ═══ app-level handlers (port of ir-lab.tsx callbacks) ═══════════════════

  function onCheck(id) {
    var s = LAB.getState();
    var res = LAB.validateObjective(id, s);
    var cur = s.objectives[id] || ui.defaultProg();
    var objectives = Object.assign({}, s.objectives);
    objectives[id] = {
      status: res.pass ? 'passed' : 'failed',
      attempts: cur.attempts + 1,
      fails: res.pass ? cur.fails : cur.fails + 1,
      hintsUsed: cur.hintsUsed,
    };
    results[id] = res;
    LAB.setState({ objectives: objectives });
  }

  function onHint(id) {
    var s = LAB.getState();
    var cur = s.objectives[id] || ui.defaultProg();
    var cap = s.mode === 'medium' ? 3 : 1;
    if (cur.hintsUsed >= cap) return;
    var objectives = Object.assign({}, s.objectives);
    objectives[id] = Object.assign({}, cur, { hintsUsed: cur.hintsUsed + 1 });
    LAB.setState({ objectives: objectives });
  }

  function resetLab() {
    LAB.clearState();
    for (var k in results) delete results[k]; // mutate in place: ctx.results keeps its reference
    closeModal();
    LAB.setState(LAB.defaultState()); // full replace (defaultState has every key)
    window.scrollTo(0, 0);
  }

  function pickMode(m) {
    for (var k in results) delete results[k]; // mutate in place: ctx.results keeps its reference
    LAB.setState(Object.assign(LAB.defaultState(), { mode: m }));
    window.scrollTo(0, 0);
  }

  // ═══ views ═══════════════════════════════════════════════════════════════

  var app; // #app container
  var deck = null; // registered deck updaters
  var ctx = {
    results: results,
    onCheck: onCheck,
    onHint: onHint,
    pickMode: pickMode,
    openCompletion: function (trigger) { openCompletion(trigger); },
  };

  var PHASE_ICONS = {
    identify: 'Radar',
    analyze: 'SearchCode',
    contain: 'ShieldHalf',
    eradicate: 'Eraser',
    recover: 'HeartPulse',
    learn: 'ClipboardCheck',
    aar: 'Flag',
  };

  function renderModeSelect() {
    app.innerHTML = '';
    app.appendChild(ui.modeSelect(ctx));
  }

  // ── center column: station workspace + advance/free-roam affordance ──────
  var lastAdvanceKey = null;

  function buildCenter(station) {
    var s = LAB.getState();
    var mode = s.mode;
    var ws;
    if (station === 'identify') ws = ui.identifyWorkspace(ctx);
    else if (station === 'analyze') ws = ui.analyzeWorkspace(ctx);
    else if (station === 'contain') ws = ui.containWorkspace(ctx);
    else if (station === 'eradicate') ws = ui.eradicateWorkspace(ctx);
    else if (station === 'recover') ws = ui.recoverWorkspace(ctx);
    else if (station === 'learn') ws = ui.learnWorkspace(ctx);
    else ws = ui.aarWing(ctx);

    var center = h('div', { class: 'center-inner' }, ws.el);
    var wsUpdate = ws.update;

    var advBox = null;
    function buildAdvance(st) {
      var box = h('div', { class: 'advance-area' });
      if (st.mode === 'medium' && st.station !== 'aar') {
        var gateOk = LAB.phaseGateSatisfied(st.station, st);
        if (gateOk) {
          var next = LAB.nextStation(st.station) || 'aar';
          var label = 'ADVANCE TO STATION ' + ui.pad2(LAB.STATION_ORDER.indexOf(st.station) + 2) + ' — ' + next.toUpperCase();
          var btn = h('button', { type: 'button', class: 'btn btn-emerald btn-lg btn-min11 advance-btn' }, document.createTextNode(label + ' '));
          btn.appendChild(LAB.icon('ArrowRight', 'h-4 w-4 btn-ico'));
          btn.addEventListener('click', function () { advance(); });
          box.appendChild(h('div', { class: 'advance-ok' },
            h('p', { class: 'advance-note' },
              document.createTextNode('Station objectives complete' + (st.station === 'identify' ? ' — incident declared' : '') + '. The lifecycle moves forward; the next station is unlocked and this one stays reviewable.')),
            btn));
        } else {
          box.appendChild(h('div', { class: 'advance-locked' },
            LAB.icon('Lock', 'h-4 w-4 lock-ico'),
            h('p', { class: 'advance-note', text: 'Phase discipline: pass this station\'s CHECK RESULTS to unlock the next lifecycle phase. That gate IS the lesson.' })));
        }
      } else if (st.mode === 'hard' && st.station !== 'aar') {
        box.appendChild(h('div', { class: 'advance-locked' },
          LAB.icon('ChevronRight', 'h-4 w-4 lock-ico'),
          h('p', { class: 'advance-note', text: 'Free-roam deck: work stations in any order. The After-Action wing (07) holds the knowledge check, field notes and completion.' })));
      }
      return box;
    }

    lastAdvanceKey = advanceKey(LAB.getState());
    var advWrap = h('div', null, buildAdvance(LAB.getState()));
    center.appendChild(advWrap);

    function update(st) {
      wsUpdate(st);
      var key = advanceKey(st);
      if (key !== lastAdvanceKey) {
        lastAdvanceKey = key;
        advWrap.innerHTML = '';
        advWrap.appendChild(buildAdvance(st));
      }
    }
    return { el: center, update: update };
  }

  function advanceKey(st) {
    if (st.mode === 'hard') return st.mode + ':' + st.station;
    return st.mode + ':' + st.station + ':' + LAB.phaseGateSatisfied(st.station, st);
  }
  function advance() {
    LAB.setState(function (prev) {
      var nxt = LAB.nextStation(prev.station);
      if (!nxt) return {};
      var maxI = LAB.STATION_ORDER.indexOf(prev.maxStation);
      var nxtI = LAB.STATION_ORDER.indexOf(nxt);
      return { station: nxt, maxStation: nxtI > maxI ? nxt : prev.maxStation };
    });
  }

  // ── deck (header + briefing + grid + rails) ──────────────────────────────
  function renderDeck() {
    var s = LAB.getState();
    var mode = s.mode;
    var total = mode === 'medium' ? 12 : 9;
    deck = {};

    // header
    var clockText = h('span', { class: 'mono sim-clock' });
    var badge = h('span', { class: 'mono mode-badge ' + (mode === 'medium' ? 'amber' : 'rose'), text: mode === 'medium' ? 'MEDIUM WATCH' : 'HARD WATCH' });
    var counterVal = h('p', { class: 'mono counter-value' });
    var sitrep = h('a', { href: '#briefing', class: 'mono sitrep-link', text: 'SITREP' });
    var resetBtn = h('button', { type: 'button', class: 'btn btn-outline btn-sm btn-min11 reset-btn' });
    resetBtn.appendChild(LAB.icon('RotateCcw', 'h-3.5 w-3.5 btn-ico'));
    resetBtn.appendChild(document.createTextNode(' RESET'));
    resetBtn.addEventListener('click', function () { openReset(); });

    var header = h('header', { class: 'cmd-bar' },
      h('div', { class: 'cmd-bar-inner' },
        h('div', { class: 'brand' },
          LAB.icon('Siren', 'h-4 w-4 siren-ico'),
          h('span', { class: 'mono brand-name', text: 'IR COMMAND DECK' })),
        clockText,
        badge,
        h('div', { class: 'hdr-right' },
          h('div', { class: 'counter-block' },
            h('p', { class: 'mono counter-label', text: 'OBJECTIVES' }),
            counterVal),
          sitrep,
          resetBtn)));

    // briefing
    var briefing = ui.briefingSection();
    var core = ui.knowledgeCore(ctx);

    // deck grid
    var bay = ui.assetBay();
    var sevLine = h('p', { class: 'mono ic-line' });
    var incidentCard = h('div', { class: 'incident-card' },
      h('p', { class: 'mono ic-label', text: 'INCIDENT CARD' }),
      h('p', { class: 'mono ic-line', text: 'ID · IR-2025-0141' }),
      h('p', { class: 'mono ic-line', text: 'TYPE · RANSOMWARE PRECURSOR' }),
      sevLine,
      h('p', { class: 'mono ic-line', text: 'CMDR · YOU' }));

    var trackList = h('ol', { class: 'track-list' });
    var trackItems = [];
    for (var i = 0; i < LAB.STATION_ORDER.length; i++) {
      (function (id, idx) {
        var iconSlot = h('span', { class: 'track-icon-slot' });
        var nameSpan = h('span', { class: 'mono track-t1' });
        var timeSpan = h('span', { class: 'track-t2' });
        var countSpan = h('span', { class: 'mono track-count' });
        var btn = h('button', { type: 'button', class: 'track-btn' }, iconSlot,
          h('span', { class: 'track-text' }, nameSpan, timeSpan), countSpan);
        btn.addEventListener('click', function () { LAB.setState({ station: id }); });
        var li = h('li', { class: 'track-item' }, btn);
        trackList.appendChild(li);
        trackItems.push({ id: id, idx: idx, btn: btn, iconSlot: iconSlot, nameSpan: nameSpan, timeSpan: timeSpan, countSpan: countSpan });
      })(LAB.STATION_ORDER[i], i);
    }
    var freeRoam = h('p', { class: 'free-roam-note', text: 'FREE-ROAM: every station is open from minute one. Prioritize like a commander — but the checks still grade the doctrine.' });

    var center = buildCenter(s.station);
    deck.centerUpdate = center.update;

    var grid = h('div', { class: 'deck-grid' },
      h('nav', { class: 'track-nav', 'aria-label': 'IR lifecycle stations' },
        h('div', { class: 'track-sticky' },
          h('p', { class: 'mono track-label', text: 'PHASE TRACK' }),
          trackList,
          mode === 'hard' ? freeRoam : null)),
      h('div', { class: 'center-col', 'aria-live': 'polite' }, center.el),
      h('aside', { class: 'rail', 'aria-label': 'Asset bay and status' },
        h('div', { class: 'rail-sticky' },
          h('div', null,
            h('p', { class: 'mono rail-label', text: 'ASSET BAY' }),
            bay.el),
          incidentCard)));

    // mobile asset drawer
    var bayM = ui.assetBay();
    var icLineM = h('p', { class: 'mono ic-line' });
    var mobileBay = h('details', { class: 'mobile-bay' },
      h('summary', { class: 'mono mobile-bay-sum', text: '▾ ASSET BAY & INCIDENT CARD' }),
      h('div', { class: 'mobile-bay-body' },
        bayM.el,
        h('div', { class: 'incident-card m' }, icLineM)));

    var main = h('main', { id: 'deck', class: 'deck-main' },
      h('div', { id: 'briefing', class: 'briefing-stack' }, briefing, core.el),
      grid,
      mobileBay);

    app.innerHTML = '';
    app.appendChild(header);
    app.appendChild(main);

    function update(st) {
      var m = st.mode;
      var tot = m === 'medium' ? 12 : 9;
      var passed = 0;
      for (var k in st.objectives) if (st.objectives[k].status === 'passed') passed++;
      counterVal.innerHTML = '';
      counterVal.appendChild(document.createTextNode(passed + '/' + tot + ' '));
      counterVal.appendChild(h('span', { class: 'counter-stars', text: '★' + LAB.computeStars(st).toFixed(1) }));
      clockText.textContent = 'SIM CLOCK · ' + (st.station === 'aar' ? 'DAY 2 · 10:00' : LAB.SIM_CLOCKS[st.station]);

      // phase track
      for (var t = 0; t < trackItems.length; t++) {
        var ti = trackItems[t];
        var id = ti.id;
        var unlocked = m === 'hard' ? true : LAB.STATION_ORDER.indexOf(id) <= LAB.STATION_ORDER.indexOf(st.maxStation);
        var isCurrent = st.station === id;
        var objs = LAB.objectivesForStation(id, m);
        var doneCount = 0;
        for (var o = 0; o < objs.length; o++) if (st.objectives[objs[o].id] && st.objectives[objs[o].id].status === 'passed') doneCount++;
        var allDone = objs.length > 0 && doneCount === objs.length;

        ti.btn.className = 'track-btn' + (isCurrent ? ' current' : unlocked ? ' open' : ' locked');
        if (isCurrent) ti.btn.setAttribute('aria-current', 'step');
        else ti.btn.removeAttribute('aria-current');
        ui.setDisabled(ti.btn, !unlocked);
        ti.iconSlot.innerHTML = '';
        if (unlocked) {
          var iconCls = 'h-4 w-4' + (allDone ? ' icon-emerald' : isCurrent ? ' icon-amber' : ' icon-slate');
          ti.iconSlot.appendChild(LAB.icon(PHASE_ICONS[id], iconCls));
        } else {
          ti.iconSlot.appendChild(LAB.icon('Lock', 'h-4 w-4 icon-dim'));
        }
        var meta = id === 'aar'
          ? { num: '07', name: 'AFTER-ACTION', simTime: 'Day 2 · 10:00' }
          : { num: ui.pad2(ti.idx + 1), name: id.toUpperCase(), simTime: LAB.SIM_CLOCKS[id] };
        ti.nameSpan.textContent = meta.num + ' · ' + meta.name;
        ti.timeSpan.textContent = meta.simTime;
        ti.countSpan.textContent = objs.length > 0 ? doneCount + '/' + objs.length : '';
        ti.countSpan.className = 'mono track-count' + (allDone ? ' done' : '');
      }

      bay.update(st);
      bayM.update(st);
      sevLine.textContent = 'SEV · ' + (st.severity || 'PENDING');
      icLineM.textContent = 'IR-2025-0141 · RANSOMWARE PRECURSOR · SEV ' + (st.severity || 'PENDING');
      core.update(st);
      deck.centerUpdate(st);
    }

    deck.update = update;
    update(LAB.getState());
  }

  function renderApp() {
    var s = LAB.getState();
    if (!s.mode) renderModeSelect();
    else renderDeck();
  }

  // ── state subscription → view reconciliation ─────────────────────────────
  function onStateChange(cur, prev) {
    if (cur.mode !== prev.mode) {
      renderApp();
      return;
    }
    if (cur.station !== prev.station) {
      // structural swap of the center column only (track/clock patch below)
      var centerCol = app.querySelector('.center-col');
      if (centerCol) {
        centerCol.innerHTML = '';
        var c = buildCenter(cur.station);
        centerCol.appendChild(c.el);
        deck.centerUpdate = c.update;
      }
    }
    deck.update(cur);
  }

  // ═══ boot ════════════════════════════════════════════════════════════════
  function boot() {
    app = document.getElementById('app');
    var saved = LAB.loadState();
    if (saved) LAB.setState(saved); // restore exactly (save skipped: setState saves when mode set — same value)
    renderApp();
    LAB.subscribe(onStateChange);
  }

  LAB.openGlossary = openGlossary;
  LAB.openReset = openReset;
  LAB.openCompletion = openCompletion;
  LAB.closeModal = closeModal;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window.LAB);
