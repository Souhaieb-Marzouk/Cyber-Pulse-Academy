// ── Cloud Ward · app shell: mode gate, status strip, binder, bays, bootstrap ──
// Faithful port of src/app/page.tsx + shell.tsx (ModeGate/StatusStrip/ChartBinder/
// BinderFooter/TaskCard/KnowledgeCore) + the store-driven refresh loop.
(function (global) {
  'use strict';

  const D = global.CW_DATA;
  const U = global.CW_UI;
  const store = global.CW_store;
  const act = global.CW_actions;
  const derived = global.CW_derived;
  const assess = global.CW_ASSESS;
  const el = U.el;
  const icon = U.icon;

  // module-level view state (mirrors LabPage useState semantics)
  let bay = 'ward';            // persists across mode switches; resets on gate
  let currentView = '';        // view key: 'gate:' | 'lab:medium' | 'lab:hard'
  let drawer = null;           // 'core' | 'quiz' | 'debrief' | null
  let binderOpen = false;
  let lastAnnouncedTs = 0;
  let coreDrawerHandle = null;

  function viewKey() {
    const s = store.get();
    return (s.started ? 'lab' : 'gate') + ':' + (s.mode || '');
  }

  function esc(s) { return U.esc(s); }

  // ══ MODE GATE ═════════════════════════════════════════════════════════════
  function renderModeGate(root) {
    const g = D.MODE_GATE;
    const wrap = el('div', { class: 'mode-gate' });
    const head = el('div', { class: 'gate-head fade-up' }, [
      el('div', {}, [U.wardLabel(g.kicker)]),
      el('h1', { class: 'serif gate-title', text: g.title }),
      el('p', { class: 'gate-intro', html: g.intro }),
    ]);
    wrap.appendChild(head);

    const grid = el('div', { class: 'mode-grid' });
    g.modes.forEach(function (m) {
      const cardBtn = el('button', {
        type: 'button',
        class: 'mode-card mode-' + m.tone,
        onclick: function () { act.setMode(m.mode); },
      }, [
        el('div', { class: 'mode-icon mode-icon-' + m.tone, html: icon(m.icon === 'sun' ? 'Sun' : 'Moon', 24) }),
        el('div', { class: 'serif mode-title mode-title-' + m.tone, text: m.title }),
        el('div', { class: 'mode-sub mode-sub-' + m.tone, text: m.subtitle }),
        el('ul', { class: 'mode-bullets mode-bullets-' + m.tone }, m.bullets.map(function (b) {
          return el('li', { html: icon('ChevronRight', 14, 'bullet-' + m.tone) + '<span>' + b + '</span>' });
        })),
        el('div', { class: 'mode-enter mode-enter-' + m.tone, text: 'Enter the ward' }),
      ]);
      grid.appendChild(cardBtn);
    });
    wrap.appendChild(grid);
    wrap.appendChild(el('p', { class: 'gate-footnote', text: g.footnote }));
    root.appendChild(wrap);
  }

  // ══ STATUS STRIP ═══════════════════════════════════════════════════════════
  function buildStrip(root) {
    const header = el('header', { class: 'strip', id: 'strip' });
    const left = el('div', { class: 'strip-left' }, [
      el('div', { class: 'strip-mark', html: icon('Stethoscope', 18) }),
      el('div', {}, [
        el('div', { class: 'serif strip-title', text: 'Cloud Ward' }),
        el('div', { class: 'strip-sub', id: 'stripSub' }),
      ]),
    ]);
    const progWrap = el('div', { class: 'strip-progress' }, [
      el('div', { class: 'strip-track', id: 'stripTrack', role: 'progressbar' }, [el('div', { class: 'strip-fill', id: 'stripFill' })]),
      el('span', { class: 'mono strip-count', id: 'stripCount' }),
      el('span', { class: 'strip-stars', id: 'stripStars' }),
    ]);
    const btns = el('div', { class: 'strip-btns' }, [
      el('button', { type: 'button', class: 'strip-btn', id: 'stripCore', html: icon('BookOpenText', 14) + '<span>Reference</span>', onclick: function () { openCore(); } }),
      el('button', { type: 'button', class: 'strip-btn', id: 'stripQuiz', onclick: function () { assess.openQuizDrawer(); } }),
      el('button', { type: 'button', class: 'strip-btn', id: 'stripDebrief', html: icon('Award', 14) + '<span>Discharge</span>', onclick: function () { assess.openDebriefDrawer(); } }),
      el('button', { type: 'button', class: 'discharge-btn', id: 'stripFinish', text: 'Discharge patient →', onclick: function () { assess.openCompletionModal(); } }),
    ]);
    header.appendChild(left);
    header.appendChild(progWrap);
    header.appendChild(btns);
    root.appendChild(header);
    refreshStrip();
  }

  function refreshStrip() {
    const s = store.get();
    const mode = s.mode || 'medium';
    const prog = derived.progressOf(s);
    const quizCount = mode === 'hard' ? 7 : 6;
    const quizDone = Object.keys(s.quizSubmitted).length >= quizCount;
    const ready = prog.passed === prog.total && quizDone;

    const sub = document.getElementById('stripSub');
    if (sub) sub.textContent = 'CV0-004 · L3.3 Observability · ' + (mode === 'hard' ? 'Night shift' : 'Day rounds') + ' · synthetic data';

    const track = document.getElementById('stripTrack');
    if (track) {
      track.setAttribute('aria-valuenow', String(prog.passed));
      track.setAttribute('aria-valuemin', '0');
      track.setAttribute('aria-valuemax', String(prog.total));
      track.setAttribute('aria-label', 'Objectives passed ' + prog.passed + ' of ' + prog.total);
    }
    const fill = document.getElementById('stripFill');
    if (fill) fill.style.width = (prog.total ? (prog.passed / prog.total) * 100 : 0) + '%';
    const count = document.getElementById('stripCount');
    if (count) count.textContent = prog.passed + '/' + prog.total;
    const starsEl = document.getElementById('stripStars');
    if (starsEl) starsEl.innerHTML = U.stars(derived.starsOf(s), 14);

    const quizBtn = document.getElementById('stripQuiz');
    if (quizBtn) quizBtn.innerHTML = icon('ClipboardCheck', 14) + '<span>Quiz (' + Object.keys(s.quizSubmitted).length + '/' + quizCount + ')</span>';

    const finish = document.getElementById('stripFinish');
    if (finish) finish.hidden = !ready;
  }

  // ══ CHART BINDER ═══════════════════════════════════════════════════════════
  function buildBinder(container, opts) {
    opts = opts || {};
    const s = store.get();
    const mode = s.mode || 'medium';
    const objs = D.ALL_OBJECTIVES[mode];
    const prog = derived.progressOf(s);

    const head = el('div', { class: 'binder-head' }, [
      el('div', {}, [
        el('div', { class: 'serif binder-title', text: 'Chart binder' }),
        el('div', { class: 'binder-sub', id: opts.subId || null, text: prog.passed + '/' + prog.total + ' objectives · shift ' + (mode === 'hard' ? 'Night' : 'Day') }),
      ]),
      opts.onClose ? el('button', { type: 'button', class: 'icon-btn binder-close lg-hidden', 'aria-label': 'Close chart binder', html: icon('X', 18), onclick: opts.onClose }) : null,
    ]);
    container.appendChild(head);

    const nav = el('nav', { class: 'binder-nav', 'aria-label': 'Objectives by ward bay' });
    D.BAY_ORDER.filter(function (b) { return mode === 'hard' ? true : b !== 'ledger'; }).forEach(function (b) {
      const bayObjs = objs.filter(function (o) { return o.bay === b; });
      if (!bayObjs.length) return;
      const done = bayObjs.filter(function (o) { return s.checks[o.id] && s.checks[o.id].everPassed; }).length;
      const group = el('div', { class: 'binder-group' });
      group.appendChild(el('button', {
        type: 'button',
        class: 'binder-bay-btn' + (activeBay() === b ? ' binder-bay-active' : ''),
        'aria-current': activeBay() === b ? 'true' : null,
        'data-bay-group': b,
        onclick: function () { if (opts.onNavigate) opts.onNavigate(b); },
      }, [
        el('span', { class: 'binder-bay-name', text: D.BAY_LABELS[b] }),
        el('span', { class: 'mono binder-bay-count', text: done + '/' + bayObjs.length }),
      ]));
      const ul = el('ul', { class: 'binder-objs' });
      bayObjs.forEach(function (o, i) {
        const st = s.checks[o.id];
        const dotCls = st && st.everPassed ? 'obj-dot obj-passed' : st && st.status === 'failed' ? 'obj-dot obj-failed' : 'obj-dot obj-idle';
        ul.appendChild(el('li', {}, [
          el('button', { type: 'button', class: 'binder-obj-btn', onclick: function () { if (opts.onNavigate) opts.onNavigate(b); } }, [
            el('span', { class: dotCls, text: st && st.everPassed ? '✓' : String(i + 1), 'data-obj-dot': o.id, 'data-obj-n': String(i + 1) }),
            el('span', { class: 'binder-obj-title', text: o.title }),
          ]),
        ]));
      });
      group.appendChild(ul);
      nav.appendChild(group);
    });
    container.appendChild(nav);
    return { nav: nav };
  }

  function refreshBinder() {
    // targeted refresh: counts + dots (DOM preserved so focus survives)
    const s = store.get();
    const mode = s.mode || 'medium';
    const objs = D.ALL_OBJECTIVES[mode];
    const prog = derived.progressOf(s);
    const rail = document.getElementById('rail');
    if (!rail) return;
    const sub = rail.querySelector('.binder-sub');
    if (sub) sub.textContent = prog.passed + '/' + prog.total + ' objectives · shift ' + (mode === 'hard' ? 'Night' : 'Day');

    D.BAY_ORDER.filter(function (b) { return mode === 'hard' ? true : b !== 'ledger'; }).forEach(function (b) {
      const bayObjs = objs.filter(function (o) { return o.bay === b; });
      const done = bayObjs.filter(function (o) { return s.checks[o.id] && s.checks[o.id].everPassed; }).length;
      const btns = rail.querySelectorAll('[data-bay-group="' + b + '"]');
      btns.forEach(function (btn) {
        const cnt = btn.querySelector('.binder-bay-count');
        if (cnt) cnt.textContent = done + '/' + bayObjs.length;
      });
      bayObjs.forEach(function (o) {
        const st = s.checks[o.id];
        const dot = rail.querySelector('[data-obj-dot="' + o.id + '"]');
        if (dot) {
          dot.className = st && st.everPassed ? 'obj-dot obj-passed' : st && st.status === 'failed' ? 'obj-dot obj-failed' : 'obj-dot obj-idle';
          dot.textContent = st && st.everPassed ? '✓' : dot.getAttribute('data-obj-n') || '';
        }
      });
    });
  }

  function buildBinderFooter(container) {
    let confirm = null; // 'reset' | 'switch' | null
    const mode = store.get().mode || 'medium';
    const footer = el('div', { class: 'binder-footer' });
    const switchBtn = el('button', {
      type: 'button',
      class: 'switch-btn',
      text: 'Shift change → switch to ' + (mode === 'hard' ? 'Day Rounds (Medium)' : 'Night Shift (Hard)'),
      onclick: function () { confirm = 'switch'; refresh(); },
    });
    const resetBtn = el('button', {
      type: 'button',
      class: 'reset-btn',
      html: icon('RotateCcw', 13) + '<span> Reset ward (pristine state)</span>',
      onclick: function () { confirm = 'reset'; refresh(); },
    });
    const confirmBox = el('div', { class: 'confirm-box', role: 'alertdialog', 'aria-label': 'Confirm action', hidden: true });
    confirmBox.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { confirm = null; refresh(); } // ESC closes when focus inside (parity)
    });

    function refresh() {
      const m = store.get().mode || 'medium';
      switchBtn.textContent = 'Shift change → switch to ' + (m === 'hard' ? 'Day Rounds (Medium)' : 'Night Shift (Hard)');
      confirmBox.hidden = !confirm;
      if (confirm) {
        confirmBox.innerHTML =
          '<p class="confirm-text">' + (confirm === 'reset'
            ? 'Reset the entire ward? All progress, answers and quiz results will be erased.'
            : 'Switch to ' + (m === 'hard' ? 'Day Rounds (Medium)' : 'Night Shift (Hard)') + '? Current shift progress will be erased.') + '</p>' +
          '<div class="confirm-btns">' +
          '<button type="button" class="confirm-yes">' + (confirm === 'reset' ? 'Yes, reset' : 'Yes, switch') + '</button>' +
          '<button type="button" class="confirm-no">Cancel</button></div>';
        const yes = confirmBox.querySelector('.confirm-yes');
        const no = confirmBox.querySelector('.confirm-no');
        yes.addEventListener('click', function () {
          if (confirm === 'reset') act.reset(); else act.switchMode(m === 'hard' ? 'medium' : 'hard');
          confirm = null;
        });
        no.addEventListener('click', function () { confirm = null; refresh(); });
        yes.focus();
      }
    }
    footer.appendChild(switchBtn);
    footer.appendChild(resetBtn);
    footer.appendChild(confirmBox);
    container.appendChild(footer);
  }

  // ══ TASK CARD (objective w/ CHECK engine) ═════════════════════════════════
  function buildTaskCard(host, obj, n) {
    const mode = store.get().mode || 'medium';
    let open = true;
    let flash = null;

    const numChip = el('span', { class: 'task-num', text: String(n) });
    const checkBtn = el('button', { type: 'button', class: 'check-btn', onclick: onCheck });
    const hintBtn = el('button', {
      type: 'button',
      class: 'hint-btn',
      onclick: function () { act.revealHint(obj.id); refreshButtons(); },
    });
    const hintList = el('div', { class: 'hint-list' });
    const flashBox = el('div', { class: 'task-flash', hidden: true });
    const bodyWrap = el('div', { class: 'task-body' });

    function maxHints() { return mode === 'medium' ? obj.hints.length : Math.min(1, obj.hints.length); }
    function hintLv() { return store.get().hints[obj.id] || 0; }
    function passed() { const c = store.get().checks[obj.id]; return !!(c && c.everPassed); }

    function refreshButtons() {
      const s = store.get();
      const lv = s.hints[obj.id] || 0;
      const isPassed = passed();
      numChip.textContent = isPassed ? '✓' : String(n);
      numChip.className = 'task-num' + (isPassed ? ' task-num-passed' : '');
      cardEl.classList.toggle('task-passed', isPassed);
      checkBtn.className = 'check-btn' + (isPassed ? ' check-btn-passed' : '');
      checkBtn.textContent = isPassed ? '✓ Checked — re-run check' : 'Check results';
      if (!isPassed && lv < maxHints()) {
        hintBtn.hidden = false;
        hintBtn.innerHTML = icon('Lightbulb', 15) + '<span>' + (mode === 'medium' ? 'Hint (' + lv + '/' + maxHints() + ')' : 'Take the one nudge (−score)') + '</span>';
      } else {
        hintBtn.hidden = true;
      }
      hintList.innerHTML = '';
      for (let i = 0; i < lv; i++) {
        hintList.appendChild(el('div', { class: 'hint-item fade-in', html: '<strong>Hint ' + (i + 1) + ':</strong> ' + esc(obj.hints[i]) }));
      }
    }

    function refreshFlash() {
      flashBox.hidden = !flash;
      if (flash) {
        flashBox.className = 'task-flash ' + (flash.pass ? 'fb-right' : 'fb-wrong');
        flashBox.innerHTML =
          '<span class="flash-head">' + (flash.pass ? icon('CheckCircle2', 14) : icon('XCircle', 14)) + ' ' + (flash.pass ? 'Objective complete' : 'Not yet') + '</span>' + esc(flash.msg);
      }
    }

    function onCheck() {
      const r = act.checkObjective(obj.id);
      flash = { pass: r.pass, msg: r.msg };
      refreshButtons();
      refreshFlash();
      refreshPrevNote();
    }

    const prevNote = el('div', { class: 'prev-note', hidden: true });
    function refreshPrevNote() {
      const isPassed = passed();
      prevNote.hidden = !(isPassed && !flash);
    }

    const headBtn = el('button', {
      type: 'button',
      class: 'task-head',
      'aria-expanded': 'true',
      onclick: function () {
        open = !open;
        bodyWrap.hidden = !open;
        headBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        chev.classList.toggle('rot-180', open);
      },
    }, [
      el('div', { class: 'task-head-left' }, [
        numChip,
        el('div', { class: 'task-head-meta' }, [
          el('div', { class: 'task-id-row', html: '<span class="mono task-id">' + esc(obj.id) + '</span>' + U.pillarBadge(obj.pillar) }),
          el('div', { class: 'serif task-title', text: obj.title }),
        ]),
      ]),
    ]);
    const chev = el('span', { class: 'task-chevron', html: icon('ChevronDown', 16) });
    headBtn.appendChild(chev);

    const cardEl = el('section', { class: 'card task-card' }, [headBtn, bodyWrap]);
    bodyWrap.appendChild(el('div', { class: 'task-brief-wrap' }, [
      el('p', { class: 'task-brief', text: obj.brief }),
      mode === 'medium'
        ? el('div', { class: 'where-chip', html: icon('Stethoscope', 12) + '<span> Where to look: ' + esc(obj.where) + '</span>' })
        : null,
      el('div', { class: 'task-btns' }, [checkBtn, hintBtn]),
      hintList,
      flashBox,
      prevNote,
    ]));
    refreshButtons();
    refreshFlash();
    refreshPrevNote();
    prevNote.innerHTML = '✓ Previously passed. Re-run the check any time.';
    host.appendChild(cardEl);
  }

  // ══ BAY AREA ═══════════════════════════════════════════════════════════════
  function activeBay() {
    const mode = store.get().mode;
    return mode === 'medium' && bay === 'ledger' ? 'ward' : bay;
  }

  function buildTabs(root) {
    const mode = store.get().mode;
    const objs = D.ALL_OBJECTIVES[mode];
    const bays = D.BAY_ORDER.filter(function (b) { return mode === 'hard' ? true : b !== 'ledger'; });
    const row = el('div', { class: 'bay-tabs', role: 'tablist', 'aria-label': 'Examination bays', id: 'bayTabs' });
    const checks = store.get().checks;
    bays.forEach(function (b) {
      const openCount = objs.filter(function (o) { return o.bay === b && !(checks[o.id] && checks[o.id].everPassed); }).length;
      const tab = el('button', {
        type: 'button',
        role: 'tab',
        'aria-selected': activeBay() === b ? 'true' : 'false',
        class: 'bay-tab' + (activeBay() === b ? ' bay-tab-active' : ''),
        onclick: function () { setBay(b); },
      }, [D.BAY_TITLES[b].name]);
      if (openCount > 0) {
        tab.appendChild(el('span', { class: 'tab-badge', text: String(openCount) }));
      }
      row.appendChild(tab);
    });
    root.appendChild(row);
  }

  function setBay(b) {
    bay = b;
    renderBayArea();
    refreshBinder(); // keep rail highlight in sync
  }

  function renderBayArea() {
    const host = document.getElementById('bayArea');
    if (!host) return;
    const mode = store.get().mode || 'medium';
    const objs = D.ALL_OBJECTIVES[mode];
    const ab = activeBay();

    host.innerHTML = '';
    const motion = el('div', { class: 'bay-motion' });
    motion.appendChild(el('div', { class: 'bay-heading' }, [
      el('h2', { class: 'serif bay-name', text: D.BAY_TITLES[ab].name }),
      el('p', { class: 'bay-blurb', text: D.BAY_TITLES[ab].blurb + ' · all data synthetic (training simulation)' }),
    ]));

    const grid = el('div', { class: 'bay-grid' });
    const bayCol = el('div', {});
    (global.CW_BAYS[ab] || global.CW_BAYS.ward)(bayCol);
    grid.appendChild(bayCol);

    const tasksCol = el('div', { class: 'tasks-col' }, [
      el('div', { class: 'tasks-head' }, [
        el('span', { class: 'teal-text', html: icon('ListChecks', 15) }),
        el('span', { class: 'serif tasks-title', text: 'Round tasks in this bay' }),
      ]),
    ]);
    const bayObjs = objs.filter(function (o) { return o.bay === ab; });
    bayObjs.forEach(function (o, i) { buildTaskCard(tasksCol, o, i + 1); });
    if (bayObjs.length === 0) {
      tasksCol.appendChild(el('p', { class: 'no-tasks', text: 'No round tasks in this bay — explore freely, then check the chart binder for open objectives.' }));
    }
    grid.appendChild(tasksCol);
    motion.appendChild(grid);
    host.appendChild(motion);
  }

  // ══ KNOWLEDGE CORE (attending's reference) ═════════════════════════════════
  function openCore() {
    act.markSeen('seenCore');
    coreDrawerHandle = U.openDrawer({
      title: 'Attending’s reference — observability',
      onClose: function () { coreDrawerHandle = null; },
      build: function (body) {
        const wrap = el('div', { class: 'core-wrap' });
        D.REFERENCE_SECTIONS.forEach(function (sec) {
          wrap.appendChild(el('section', {}, [
            el('h3', { class: 'serif sec-title', text: sec.title }),
            el('div', { class: 'sec-body', html: U.rich(sec.html) }),
          ]));
        });
        // glossary accordion
        let glossOpen = false;
        const glossList = el('dl', { class: 'gloss-list', hidden: true });
        D.GLOSSARY.forEach(function (g) {
          glossList.appendChild(el('div', { class: 'gloss-item' }, [
            el('dt', { class: 'gloss-term', text: g.term }),
            el('dd', { class: 'gloss-def', text: g.def }),
          ]));
        });
        const glossBtn = el('button', {
          type: 'button',
          class: 'gloss-btn serif',
          'aria-expanded': 'false',
          onclick: function () {
            glossOpen = !glossOpen;
            glossList.hidden = !glossOpen;
            glossBtn.setAttribute('aria-expanded', glossOpen ? 'true' : 'false');
            glossChev.classList.toggle('rot-180', glossOpen);
          },
        }, [
          el('span', { text: 'Ward glossary (' + D.GLOSSARY.length + ' terms)' }),
        ]);
        const glossChev = el('span', { class: 'gloss-chevron', html: icon('ChevronDown', 15) });
        glossBtn.appendChild(glossChev);
        wrap.appendChild(el('div', { class: 'gloss-box' }, [glossBtn, glossList]));
        body.appendChild(wrap);
      },
    });
  }

  // ══ APP SHELL ══════════════════════════════════════════════════════════════
  function renderApp() {
    const s = store.get();
    const app = document.getElementById('app');
    app.innerHTML = '';
    document.body.classList.toggle('lab-open', !!s.started && !!s.mode);

    if (!s.started || !s.mode) {
      currentView = viewKey();
      renderModeGate(app);
      return;
    }

    currentView = viewKey();
    // bay resets only when re-entering from the gate (React: LabPage remounts)
    bay = 'ward';

    buildStrip(app);

    const layout = el('div', { class: 'layout' });
    const rail = el('aside', { class: 'rail', id: 'rail' });
    buildBinder(rail, {});
    buildBinderFooter(rail);
    layout.appendChild(rail);

    const bayArea = el('div', { class: 'bay-area' }, [el('div', { id: 'bayTabsHost' })]);
    layout.appendChild(bayArea);
    app.appendChild(layout);

    const tabsHost = document.getElementById('bayTabsHost');
    buildTabs(tabsHost);
    const bayMount = el('div', { id: 'bayArea' });
    bayArea.appendChild(bayMount);
    renderBayArea();

    // mobile binder sheet
    const fab = el('button', {
      type: 'button',
      class: 'binder-fab',
      html: icon('Menu', 16) + '<span> Chart binder</span>',
      onclick: function () { openBinderSheet(); },
    });
    app.appendChild(fab);

    // screen-reader live region
    app.appendChild(el('div', { class: 'sr-only', role: 'status', 'aria-live': 'polite', id: 'srLive' }));
  }

  function openBinderSheet() {
    binderOpen = true;
    const overlay = el('div', { class: 'sheet-overlay', id: 'sheetOverlay' });
    const backdrop = el('button', { type: 'button', class: 'sheet-backdrop', 'aria-label': 'Close binder' });
    const sheet = el('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Chart binder' });
    const sheetInner = el('div', { class: 'sheet-inner' });
    buildBinder(sheetInner, { onClose: closeSheet, onNavigate: function (b) { setBay(b); closeSheet(); } });
    buildBinderFooter(sheetInner);
    sheet.appendChild(sheetInner);
    overlay.appendChild(backdrop);
    overlay.appendChild(sheet);
    document.body.appendChild(overlay);
    document.body.classList.add('no-scroll');

    function onKey(e) { if (e.key === 'Escape') closeSheet(); }
    document.addEventListener('keydown', onKey);
    backdrop.addEventListener('click', closeSheet);
    function closeSheet() {
      binderOpen = false;
      document.removeEventListener('keydown', onKey);
      overlay.remove();
      document.body.classList.remove('no-scroll');
    }
  }

  // ══ store-driven refresh loop ══════════════════════════════════════════════
  store.subscribe(function (s) {
    // view-level changes re-render everything (gate ↔ lab, mode switches, reset)
    if (viewKey() !== currentView) {
      renderApp();
      lastAnnouncedTs = 0;
      return;
    }
    if (!s.started || !s.mode) return; // gate view: nothing to refresh
    refreshStrip();
    refreshBinder();
    refreshTabs();
    // announce check results for screen readers
    if (s.lastCheck && s.lastCheck.ts !== lastAnnouncedTs) {
      lastAnnouncedTs = s.lastCheck.ts;
      const live = document.getElementById('srLive');
      if (live) live.textContent = (s.lastCheck.pass ? 'Check passed' : 'Check failed') + ': ' + s.lastCheck.msg;
    }
  });

  function refreshTabs() {
    const host = document.getElementById('bayTabsHost');
    if (!host) return;
    host.innerHTML = '';
    buildTabs(host);
  }

  // ══ bootstrap ══════════════════════════════════════════════════════════════
  global.CW_boot = function () {
    // synchronous hydration → no “Preparing the ward…” flash in the static port
    global.CW_hydrate();
    store.state.hydrated = true;
    renderApp();
  };
})(this);
