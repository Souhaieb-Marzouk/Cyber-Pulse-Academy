// ---------------------------------------------------------------------------
// app.js — bootstrap, screen router and lab chrome.
// Vanilla ports of LabShell.tsx, ModeSelect.tsx, TitleBlock.tsx,
// ReviewRail.tsx and MarginColumn.tsx (+ GlossaryDialog).
// ---------------------------------------------------------------------------

// eslint-disable-next-line no-undef
var LabApp = (function () {
  'use strict';

  var U = LabUI;
  var icon = U.icon;
  var esc = U.esc;
  var root = document.getElementById('lab-root');
  var liveRegion = null;
  var current = { screen: null, sheet: null, sheetInstance: null, railInstance: null, drawerRail: null };

  var SHEET_FACTORIES = {
    briefing: SheetsA.BriefingSheet,
    core: SheetsA.CoreSheet,
    matcher: SheetsA.MatcherSheet,
    sandbox: SheetsA.SandboxSheet,
    scale: SheetsA.ScaleSheet,
    ops: SheetsB.OpsSheet,
    resilience: SheetsB.ResilienceSheet,
    security: SheetsB.SecuritySheet,
    studio: SheetsB.StudioSheet,
    signoff: SheetsQuiz.SignoffSheet,
  };

  // ======================================================================
  // Live region (aria-live announcements, identical texts)
  // ======================================================================
  function ensureLiveRegion() {
    if (liveRegion) return;
    liveRegion = U.el('div', 'sr-only');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('role', 'status');
    document.body.insertBefore(liveRegion, document.body.firstChild);
  }

  // ======================================================================
  // Review rail (used on desktop AND inside the mobile drawer)
  // ======================================================================
  function buildRail() {
    var nav = U.el('nav', 'rail');
    nav.setAttribute('aria-label', 'Review items tracker');
    nav.innerHTML =
      '<p class="rail-heading">' +
      icon('ListChecks') +
      ' Drawing set — review items</p>' +
      '<div data-role="groups"></div>' +
      '<button type="button" class="rail-quiz-btn" data-testid="rail-quiz">' +
      '<span class="quiz-lead" data-role="quiz-lead">' +
      icon('CheckCircle2') +
      '</span><span data-role="quiz-text"></span></button>';

    var groups = nav.querySelector('[data-role="groups"]');
    var quizBtn = nav.querySelector('[data-testid="rail-quiz"]');
    quizBtn.addEventListener('click', function () {
      LabStore.actions.setActiveSheet('signoff');
    });
    var itemBtns = {};

    function build(state) {
      groups.innerHTML = '';
      itemBtns = {};
      var defs = objectivesForMode(state.mode);
      var pillars = ['P1', 'P2', 'P3', 'P4'];
      pillars.forEach(function (p) {
        var items = defs.filter(function (d) {
          return d.pillar === p;
        });
        if (!items.length) return;
        var m = U.PILLAR_META[p];
        var block = U.el('div', 'rail-pillar');
        block.innerHTML =
          '<p class="rail-pillar-name" style="color:' +
          m.color +
          '">' +
          m.label.toUpperCase() +
          ' <span class="count">(' +
          items.length +
          ')</span></p>' +
          '<ul class="rail-list"></ul>';
        var list = block.querySelector('.rail-list');
        items.forEach(function (d) {
          var li = U.el('li');
          var btn = U.el(
            'button',
            'rail-item',
            '<span data-role="lead"></span><span style="min-width:0">' +
              '<span class="rail-item-title">' +
              esc(d.title) +
              '</span>' +
              '<span class="rail-item-id">' +
              esc(d.id) +
              '</span></span>',
          );
          btn.type = 'button';
          btn.setAttribute('data-testid', 'rail-' + d.id);
          btn.addEventListener('click', function () {
            LabStore.actions.setActiveSheet(d.sheet);
          });
          li.appendChild(btn);
          list.appendChild(li);
          itemBtns[d.id] = btn;
        });
        groups.appendChild(block);
      });
    }

    function update(state) {
      var defs = objectivesForMode(state.mode);
      var rebuilt = !groups.firstChild;
      // Rebuild when the mode changed the objective set (rail size differs).
      if (
        !rebuilt &&
        groups.querySelectorAll('.rail-item').length !== defs.length
      ) {
        build(state);
      }
      var quizBank = state.mode === 'medium' ? QUIZ_MEDIUM : QUIZ_HARD;
      var quizDone = state.quiz.submitted.filter(Boolean).length;
      defs.forEach(function (d) {
        var btn = itemBtns[d.id];
        if (!btn) return;
        var r = state.results[d.id];
        var passed = r && r.passed;
        var active = d.sheet === state.activeSheet;
        btn.className = 'rail-item' + (active ? ' active' : '') + (passed ? ' passed' : '');
        btn.setAttribute('aria-current', active ? 'true' : 'false');
        btn.querySelector('[data-role="lead"]').innerHTML = passed
          ? icon('CheckCircle2', 'ok')
          : icon('CircleDashed', 'pending');
      });
      var quizLead = nav.querySelector('[data-role="quiz-lead"]');
      quizLead.innerHTML = icon('CheckCircle2');
      quizLead.querySelector('svg').style.color = state.quiz.finished
        ? 'var(--verified)'
        : 'var(--ink-muted)';
      nav.querySelector('[data-role="quiz-text"]').textContent =
        'Knowledge check — ' + quizDone + '/' + quizBank.length + ' answered';
      quizBtn.className =
        'rail-quiz-btn' +
        (state.activeSheet === 'signoff' ? ' active' : '') +
        (state.quiz.finished ? ' finished' : '');
    }

    build(LabStore.getState());
    update(LabStore.getState());
    return { el: nav, update: update };
  }

  // ======================================================================
  // Margin column (xl screens) + glossary dialog content
  // ======================================================================
  function buildMargin() {
    var aside = U.el('aside', 'margin-col');
    aside.setAttribute('aria-label', 'Reference margin');
    aside.innerHTML =
      '<div class="sheet-card margin-card">' +
      '<h2 class="margin-title">Mode notes</h2>' +
      '<p class="margin-text" data-role="mode-note"></p>' +
      '<p class="margin-text">Progress auto-saves to this browser. RESET in the title block restores the pristine lab.</p>' +
      '</div>' +
      '<div class="sheet-card margin-card">' +
      '<h2 class="margin-title">Glossary (15)</h2>' +
      '<div style="margin-top:0.25rem" data-role="gloss"></div>' +
      '</div>' +
      '<div class="sheet-card margin-card">' +
      '<h2 class="margin-title">Threat references</h2>' +
      '<ul style="margin-top:0.5rem;display:flex;flex-direction:column;gap:0.375rem;list-style:none">' +
      MITRE_LINKS.map(function (m) {
        return (
          '<li><a class="threat-link" href="' +
          esc(m.url) +
          '" target="_blank" rel="noopener noreferrer">' +
          esc(m.label) +
          ' ↗</a></li>'
        );
      }).join('') +
      '</ul>' +
      '<p class="margin-text" style="font-size:10px;margin-top:0.5rem">Official ATT&amp;CK records — open in a new tab.</p>' +
      '</div>';
    aside.querySelector('[data-role="gloss"]').appendChild(
      U.accordion(U.glossaryAccordionHtml('g')),
    );
    function update(state) {
      aside.querySelector('[data-role="mode-note"]').textContent = HINTS_NOTE[state.mode];
    }
    update(LabStore.getState());
    return { el: aside, update: update };
  }

  function openGlossaryDialog() {
    var state = LabStore.getState();
    U.openLayer({
      kind: 'dialog',
      testid: 'glossary-dialog',
      title: 'Glossary & notes',
      desc: '<span class="dialog-desc">' + esc(HINTS_NOTE[state.mode]) + '</span>',
      build: function (body) {
        body.style.marginTop = '0.25rem';
        body.appendChild(U.accordion(U.glossaryAccordionHtml('m')));
      },
    });
  }

  function openReviewDrawer() {
    var rail = buildRail();
    current.drawerRail = rail;
    var layer = U.openLayer({
      kind: 'drawer',
      title: 'Review items',
      titleClass: 'dialog-title serif',
      build: function (body) {
        body.style.marginTop = '0.75rem';
        body.appendChild(rail.el);
      },
      onClose: function () {
        current.drawerRail = null;
      },
    });
    return layer;
  }

  // ======================================================================
  // Title block
  // ======================================================================
  function buildTitleBlock() {
    var wrap = U.el('div', 'titleblock');
    wrap.innerHTML =
      '<div class="titleblock-inner">' +
      '<div style="min-width:0;flex:1">' +
      '<div class="titleblock-baseline">' +
      '<h1 class="titleblock-title">' +
      esc(LAB_TITLE) +
      '</h1>' +
      '<span class="titleblock-project">' +
      esc(LAB_PROJECT) +
      '</span>' +
      '</div>' +
      '<p class="titleblock-cert">' +
      esc(LAB_CERT) +
      '</p>' +
      '</div>' +
      '<div class="titleblock-actions">' +
      '<span class="mode-badge" data-testid="mode-badge"></span>' +
      '<span class="approvals-counter" data-testid="approvals-counter" aria-label="Approvals">' +
      icon('Scale') +
      '<span data-role="count"></span></span>' +
      '<span class="signedoff-chip">SIGNED OFF</span>' +
      '</div>' +
      '<div class="titleblock-actions">' +
      '<button type="button" class="btn btn-outline btn-icon lg-hide" aria-label="Open review items tracker" data-role="drawer-btn">' +
      icon('ListChecks') +
      '<span class="sr-only">Review items</span></button>' +
      '<button type="button" class="btn btn-outline btn-icon xl-hide" aria-label="Open glossary" data-role="gloss-btn">' +
      icon('BookMarked') +
      '<span class="sr-only">Glossary</span></button>' +
      '<button type="button" class="btn btn-outline btn-icon btn-reset" aria-label="Reset the lab to pristine state" data-role="reset-btn">' +
      icon('RotateCcw') +
      '<span class="sr-only">Reset lab</span></button>' +
      '</div>' +
      '</div>';

    wrap.querySelector('[data-role="drawer-btn"]').addEventListener('click', openReviewDrawer);
    wrap.querySelector('[data-role="gloss-btn"]').addEventListener('click', openGlossaryDialog);
    wrap.querySelector('[data-role="reset-btn"]').addEventListener('click', openResetDialog);

    function update(state) {
      wrap.querySelector('[data-testid="mode-badge"]').textContent =
        state.mode === 'medium' ? 'Draftsman · Medium' : 'Lead Architect · Hard';
      var total = objectivesForMode(state.mode).length;
      var approved = LabStore.approvalsCount(state.results, state.mode);
      var count = wrap.querySelector('[data-role="count"]');
      count.textContent = approved + '/' + total + ' approved';
      wrap
        .querySelector('[data-testid="approvals-counter"]')
        .setAttribute('aria-label', 'Approvals ' + approved + ' of ' + total);
      wrap.querySelector('.signedoff-chip').style.display = state.completedAt ? '' : 'none';
    }
    update(LabStore.getState());
    return { el: wrap, update: update };
  }

  function openResetDialog() {
    U.openLayer({
      kind: 'alert',
      title: 'Reset the drafting room?',
      descClass: 'alert-desc',
      desc:
        'This clears every approval, hint, environment setting and quiz answer, and returns to the mode selection. Your progress in ' +
        SHEETS.length +
        ' sheets will be lost. This cannot be undone.',
      build: function (body, close) {
        var actions = U.el('div', 'alert-actions');
        var cancel = U.el('button', 'btn btn-outline', 'Keep working');
        var confirm = U.el('button', 'btn btn-wax', 'Reset everything');
        confirm.type = 'button';
        confirm.setAttribute('data-testid', 'reset-confirm');
        cancel.addEventListener('click', close);
        confirm.addEventListener('click', function () {
          close();
          LabStore.actions.resetAll();
        });
        actions.appendChild(cancel);
        actions.appendChild(confirm);
        body.appendChild(actions);
      },
    });
  }

  // ======================================================================
  // Mode select screen
  // ======================================================================
  var MODES = [
    {
      id: 'medium',
      name: 'Draftsman',
      subtitle: 'Medium — understand & learn',
      icon: 'BookOpen',
      points: [
        '12 guided review items, introduced in order',
        'Where-to-look chips on every item',
        'Up to 3 hint tiers per item — hints lower the rating but never block you',
        'Tolerant checking: wrong answers teach, they do not punish',
        'Knowledge check (7 items) after practice',
      ],
      tone: 'New to database concepts or first pass at CV0-004? Start here.',
    },
    {
      id: 'hard',
      name: 'Lead Architect',
      subtitle: 'Hard — test & stretch',
      icon: 'Compass',
      points: [
        '10 broad multi-step challenges across a noisy estate',
        'Realistic evidence with red herrings you must dismiss',
        'Strict validation: exact values, exact ATT&CK IDs, ordered sequences',
        'Near-misses are rejected — with the reason why',
        'At most one optional nudge per item, and it costs rating',
      ],
      tone: 'Already read the lesson? Prove you can run the design review.',
    },
  ];

  function renderModeSelect() {
    var main = U.el('main', 'drafting-grid min-h-screen');
    main.style.padding = '2.5rem 1rem';
    var wrap = U.el('div', 'mode-wrap');
    var card = U.el('div', 'sheet-card mode-card');
    card.innerHTML =
      '<p class="mode-eyebrow">Interactive practice lab · training data only</p>' +
      '<h1 class="mode-h1">' +
      esc(LAB_TITLE) +
      '</h1>' +
      '<p class="mode-project">' +
      esc(LAB_PROJECT) +
      '</p>' +
      '<p class="mode-cert">' +
      esc(LAB_CERT) +
      '</p>' +
      '<p class="mode-intro">You are the junior cloud architect preparing Meridian Retail’s database estate for design sign-off. Every sheet of the drawing set is a decision the exam expects you to make: which store fits which access pattern, what a managed service takes over, how replication changes consistency, and what the recovery guarantees really are. Finish the review, collect your stamps, sign the memo.</p>' +
      '<div class="mode-grid" data-role="modes"></div>' +
      '<div class="mode-safety">' +
      icon('ShieldCheck') +
      '<p>All organisations, metrics and logs are synthetic training data. Defensive, exam-oriented framing: nothing here enables real attacks. ' +
      esc(HINTS_NOTE.medium) +
      '</p>' +
      '</div>';
    var grid = card.querySelector('[data-role="modes"]');
    MODES.forEach(function (m, i) {
      var btn = U.el(
        'button',
        'mode-choice anim-rise',
        '<div style="display:flex;align-items:center;gap:0.5rem">' +
          icon(m.icon, 'mode-choice-icon') +
          '<h2 class="mode-choice-name">' +
          esc(m.name) +
          '</h2></div>' +
          '<p class="mode-choice-sub">' +
          esc(m.subtitle) +
          '</p>' +
          '<ul>' +
          m.points
            .map(function (p) {
              return '<li>' + esc(p) + '</li>';
            })
            .join('') +
          '</ul>' +
          '<p class="mode-choice-tone">' +
          esc(m.tone) +
          '</p>' +
          '<p class="mode-choice-cta">Open this mode →</p>',
      );
      btn.type = 'button';
      btn.setAttribute('data-testid', 'mode-' + m.id);
      btn.setAttribute('aria-label', 'Start ' + m.name + ' mode. ' + m.subtitle);
      btn.style.animationDelay = (0.08 * i).toFixed(2) + 's';
      btn.addEventListener('click', function () {
        LabStore.actions.startMode(m.id);
      });
      grid.appendChild(btn);
    });
    wrap.appendChild(card);
    main.appendChild(wrap);
    root.innerHTML = '';
    root.appendChild(main);
  }

  // ======================================================================
  // Lab screen
  // ======================================================================
  function renderLab() {
    var state = LabStore.getState();
    root.innerHTML = '';

    var title = buildTitleBlock();
    var shell = U.el('div', 'shell-grid');

    // left rail (desktop)
    var railHolder = U.el('div', 'desktop-rail');
    var railScroll = U.el('div', 'rail-scroll');
    current.railInstance = buildRail();
    railScroll.appendChild(current.railInstance.el);
    railHolder.appendChild(railScroll);

    // center: tabs + active sheet
    var mainArea = U.el('main');
    mainArea.setAttribute('aria-label', 'Active drafting sheet');
    mainArea.style.minWidth = '0';
    var tabs = U.el('nav', 'sheet-tabs');
    tabs.setAttribute('aria-label', 'Drawing set sheets');
    var tabBtns = {};
    SHEETS.forEach(function (s) {
      var btn = U.el(
        'button',
        'tab-btn',
        '<span class="tab-code">' +
          esc(s.code) +
          '</span><span class="tab-label">' +
          esc(s.label) +
          '</span>',
      );
      btn.type = 'button';
      btn.setAttribute('data-testid', 'tab-' + s.id);
      btn.addEventListener(
        'click',
        function () {
          LabStore.actions.setActiveSheet(s.id);
        },
      );
      tabs.appendChild(btn);
      tabBtns[s.id] = btn;
    });
    mainArea.appendChild(tabs);
    var sheetHolder = U.el('div', 'sheet-card sheet-body');
    sheetHolder.setAttribute('data-role', 'sheet-holder');
    mainArea.appendChild(sheetHolder);

    // right margin (xl)
    var marginHolder = U.el('div', 'desktop-margin');
    var marginScroll = U.el('div', 'margin-scroll');
    current.marginInstance = buildMargin();
    marginScroll.appendChild(current.marginInstance.el);
    marginHolder.appendChild(marginScroll);

    shell.appendChild(railHolder);
    shell.appendChild(mainArea);
    shell.appendChild(marginHolder);

    var shellWrap = U.el('div', 'drafting-grid min-h-screen');
    shellWrap.appendChild(title.el);
    shellWrap.appendChild(shell);
    root.innerHTML = '';
    root.appendChild(shellWrap);

    function mountSheet(sheetId) {
      current.sheet = sheetId;
      var factory = SHEET_FACTORIES[sheetId];
      current.sheetInstance = factory();
      sheetHolder.innerHTML = '';
      sheetHolder.appendChild(current.sheetInstance.el);
    }

    current.tabBtns = tabBtns;
    current.titleInstance = title;
    current.mountSheet = mountSheet;

    // sync tab active state
    SHEETS.forEach(function (s) {
      var active = state.activeSheet === s.id;
      tabBtns[s.id].className = 'tab-btn' + (active ? ' active' : '');
      if (active) tabBtns[s.id].setAttribute('aria-current', 'page');
      else tabBtns[s.id].removeAttribute('aria-current');
    });
    mountSheet(state.activeSheet);
  }

  // ======================================================================
  // Screen router + store subscription
  // ======================================================================
  function render() {
    var state = LabStore.getState();
    ensureLiveRegion();
    if (state.screen !== current.screen) {
      current.screen = state.screen;
      if (state.screen === 'mode-select') {
        current.sheetInstance = null;
        current.railInstance = null;
        current.marginInstance = null;
        renderModeSelect();
      } else {
        renderLab();
      }
      return;
    }
    if (state.screen === 'lab') {
      // sheet switch?
      if (state.activeSheet !== current.sheet) {
        SHEETS.forEach(function (s) {
          var active = state.activeSheet === s.id;
          current.tabBtns[s.id].className = 'tab-btn' + (active ? ' active' : '');
          if (active) current.tabBtns[s.id].setAttribute('aria-current', 'page');
          else current.tabBtns[s.id].removeAttribute('aria-current');
        });
        current.mountSheet(state.activeSheet);
      } else if (current.sheetInstance) {
        current.sheetInstance.update(state);
      }
      if (current.railInstance) current.railInstance.update(state);
      if (current.marginInstance) current.marginInstance.update(state);
      if (current.titleInstance) current.titleInstance.update(state);
      if (current.drawerRail) current.drawerRail.update(state);
    }
  }

  function boot() {
    LabStore.restore();
    LabStore.actions.setHydrated();
    LabStore.subscribe(function (state) {
      if (liveRegion) liveRegion.textContent = state.announcement;
      render();
    });
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  return { render: render };
})();
