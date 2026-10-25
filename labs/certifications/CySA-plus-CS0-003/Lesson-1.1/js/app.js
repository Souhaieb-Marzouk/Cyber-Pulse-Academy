/**
 * CyberLab — "The Leadership Ledger" — APP ORCHESTRATOR
 *
 * Vanilla-JS port of LeadershipLab.tsx. Boots the lab, mounts the cover or the
 * active desk, and maps store patches onto targeted re-renders:
 *   phase/mode   → full remount
 *   activeId     → memo grid + workspace + smooth scroll
 *   answers      → CHECK RESULTS gating in place
 *   progress     → toolbar + stamps (+ workspace remount when a check lands,
 *                  in-place hint updates when only a hint was revealed)
 *   quiz*        → verdict rendering + completion auto-open
 *   dialogs      → briefing / completion / reset modals
 */
'use strict';

(function boot() {
  /* same as the original's module-scope rehydrate: saved session present at
     first render — no pristine-cover flash on reload */
  rehydrateState();

  var root = document.getElementById('lab-root');
  var announcer = document.getElementById('lab-announcer');
  var MODE_LABEL = { medium: 'GUIDED ORIENTATION', hard: 'LIVE FIRE' };

  /* ------------------------------------------------------------------ */
  /* Shared refs                                                          */
  /* ------------------------------------------------------------------ */

  var tb = {}; /* toolbar stat refs */
  var ws = {}; /* active workspace refs */
  var desk = {}; /* desk region refs */
  var activeQuizSection = null;
  var mobilePane = 'desk';
  var currentView = null;
  var lastProgress = null; /* hint-vs-check change detection */
  var resetDialog = null;
  var briefingDialog = null;
  var completionDialog = null;

  function announce(text) {
    announcer.textContent = text;
  }

  function currentStats() {
    if (!labState.mode) return null;
    return computeScore(labState.mode, labState.progress, labState.quizAnswers, labState.quizSubmitted);
  }

  function allFiledNow() {
    var s = currentStats();
    return !!s && s.filed === s.total && labState.quizSubmitted;
  }

  /* ------------------------------------------------------------------ */
  /* Evidence box                                                         */
  /* ------------------------------------------------------------------ */

  function buildEvidenceBox(e) {
    var box = el('div', 'evidence-box');
    var head = el('div', 'evidence-head');
    var title = el('p', 'evidence-title');
    title.appendChild(icon('FileWarning', { px: 14, cls: 'icon-inline' }));
    title.appendChild(document.createTextNode(' ' + e.title));
    head.appendChild(title);
    head.appendChild(el('span', 'evidence-tag', 'Synthetic training data'));
    box.appendChild(head);
    var pre = el('pre', null, e.body);
    box.appendChild(pre);
    return box;
  }

  /* ------------------------------------------------------------------ */
  /* Objective workspace                                                  */
  /* ------------------------------------------------------------------ */

  function hintLabel(hi) {
    return 'Hint ' + (hi + 1) + (hi === 0 ? ' · nudge' : hi === 1 ? ' · direction' : ' · show me');
  }

  function buildObjectiveWorkspace(obj) {
    var mode = labState.mode;
    var progress = labState.progress[obj.id];
    var filed = !!(progress && progress.status === 'filed');
    var checked = !!(progress && progress.lastResult && progress.lastResult !== 'none');
    var answers = labState.answers[obj.id] || {};
    var touched = isObjectiveTouched(obj, answers);
    var hintsMax = obj.hints.length;
    var hintsUsed = progress ? progress.hintsUsed : 0;

    var section = el('section', 'workspace' + (filed ? ' filed-ring' : ''));
    section.setAttribute('aria-label', 'Workspace for ' + obj.code);

    /* memo header */
    var head = el('div', 'ws-head');
    var meta = el('div', 'ws-meta');
    meta.appendChild(el('p', 'ws-memono', 'MEMO ' + obj.code + ' · ' + (filed ? 'STATUS: FILED' : 'STATUS: ON DESK')));
    meta.appendChild(pillarChipEl(obj.pillar));
    head.appendChild(meta);
    head.appendChild(el('h2', null, obj.title));
    head.appendChild(el('p', 'ws-task', obj.task));
    head.appendChild(el('p', 'ws-anchor', 'Anchors: ' + obj.anchor));
    section.appendChild(head);

    /* evidence */
    if (obj.evidence && obj.evidence.length) {
      var evList = el('div', 'evidence-list');
      obj.evidence.forEach(function (e) {
        evList.appendChild(buildEvidenceBox(e));
      });
      section.appendChild(evList);
    }

    /* parts + widgets */
    var partsBox = el('div', 'ws-parts');
    obj.parts.forEach(function (spec, i) {
      var partBox = el('div');
      var widget = buildWidget(spec, {
        objId: obj.id,
        partIdx: i,
        value: answers[i],
        disabled: filed,
        onChange: function (v) {
          setAnswer(obj.id, i, v);
        },
      });
      partBox.appendChild(widget);
      if (checked) {
        var res = el('div', 'part-results');
        res.appendChild(el('p', 'part-results-title', 'Check result — part ' + (i + 1)));
        res.appendChild(renderResults(partResults(spec, answers[i])));
        partBox.appendChild(res);
      }
      partsBox.appendChild(partBox);
    });
    section.appendChild(partsBox);

    /* hints */
    if (!filed && hintsMax > 0) {
      var hintsBox = el('div', 'hints-box');
      var hTitle = el('p', 'hints-title');
      hTitle.appendChild(icon('Lightbulb', { px: 14, cls: 'icon-inline' }));
      hTitle.appendChild(
        document.createTextNode(
          mode === 'hard'
            ? 'One nudge (visibly costs score)'
            : 'Tiered hints (' + hintsUsed + '/' + hintsMax + ' used — hints reduce stars, never block)'
        )
      );
      hintsBox.appendChild(hTitle);
      var hintBtns = el('div', 'hint-btns');
      obj.hints.forEach(function (_, hi) {
        var revealed = hi < hintsUsed;
        var canReveal = hi === hintsUsed;
        var btn = el('button', 'btn btn-outline btn-sm btn-pill btn-touch hint-btn' + (revealed ? ' revealed' : ''));
        btn.type = 'button';
        btn.disabled = filed || !canReveal;
        btn.setAttribute('aria-label', 'Reveal hint ' + (hi + 1) + ' of ' + hintsMax);
        btn.textContent = revealed ? 'Revealed' : hintLabel(hi);
        btn.addEventListener('click', function () {
          revealHint(obj.id);
        });
        hintBtns.appendChild(btn);
      });
      hintsBox.appendChild(hintBtns);
      if (hintsUsed > 0) {
        var hintList = el('ul', 'hint-list');
        obj.hints.slice(0, hintsUsed).forEach(function (h, hi) {
          var li = el('li');
          var strong = el('span', 'hint-no', 'Hint ' + (hi + 1) + ':');
          li.appendChild(strong);
          li.appendChild(document.createTextNode(' ' + h));
          hintList.appendChild(li);
        });
        hintsBox.appendChild(hintList);
      }
      section.appendChild(hintsBox);
      ws.hintsBox = hintsBox;
      ws.hintsObj = obj;
    }

    /* actions */
    if (!filed) {
      var actions = el('div', 'ws-actions');
      var checkBtn = el('button', 'btn btn-primary btn-pill btn-touch');
      checkBtn.type = 'button';
      checkBtn.setAttribute('aria-label', 'Check results for ' + obj.code);
      checkBtn.appendChild(icon('Stamp', { px: 16, cls: 'icon-inline' }));
      checkBtn.appendChild(document.createTextNode(' CHECK RESULTS'));
      checkBtn.disabled = !touched;
      checkBtn.addEventListener('click', function () {
        checkObjective(obj.id);
      });
      actions.appendChild(checkBtn);
      var note = el('p', 'touched-note', 'Answer every part above to enable checking.');
      if (touched) note.style.display = 'none';
      actions.appendChild(note);
      section.appendChild(actions);
      ws.checkBtn = checkBtn;
      ws.touchedNote = note;
    }

    /* objective feedback */
    if (checked && progress) {
      var ok = progress.lastResult === 'filed';
      var fb = el('div', 'feedback ' + (ok ? 'filed' : 'returned'));
      fb.setAttribute('role', 'status');
      var fbTitle = el('p', 'fb-title');
      fbTitle.appendChild(icon(ok ? 'BadgeCheck' : 'AlertTriangle', { px: 16, cls: 'icon-inline' }));
      fbTitle.appendChild(document.createTextNode(ok ? ' MEMO FILED — why this matters' : ' MEMO RETURNED — what to fix'));
      fb.appendChild(fbTitle);
      fb.appendChild(el('p', 'fb-body', ok ? obj.feedbackCorrect : obj.feedbackWrong));
      if (ok) {
        var objs = objectivesForMode(mode);
        var nextTodo = null;
        for (var i = 0; i < objs.length; i++) {
          if (objs[i].id !== obj.id && !(labState.progress[objs[i].id] && labState.progress[objs[i].id].status === 'filed')) {
            nextTodo = objs[i];
            break;
          }
        }
        if (nextTodo) {
          var nextBtn = el('button', 'btn btn-green btn-pill btn-touch next-memo-btn');
          nextBtn.type = 'button';
          nextBtn.setAttribute('aria-label', 'Next memo: ' + nextTodo.code);
          nextBtn.appendChild(
            document.createTextNode('Next memo: ' + nextTodo.code + ' — ' + nextTodo.title + ' ')
          );
          nextBtn.appendChild(icon('ChevronRight', { px: 14, cls: 'icon-inline' }));
          nextBtn.addEventListener('click', function () {
            openObjective(nextTodo.id);
          });
          fb.appendChild(nextBtn);
          ws.nextBtn = nextBtn;
        }
      }
      section.appendChild(fb);
      ws.feedback = fb;
    }

    return section;
  }

  /* ------------------------------------------------------------------ */
  /* Desk regions                                                         */
  /* ------------------------------------------------------------------ */

  function buildMemoCard(obj) {
    var filed = !!(labState.progress[obj.id] && labState.progress[obj.id].status === 'filed');
    var isOpen = labState.activeId === obj.id;
    var card = el('article', 'memo-card' + (isOpen ? ' open' : ''));
    card.dataset.objId = obj.id;

    var head = el('div', 'memo-head');
    var left = el('div');
    left.style.minWidth = '0';
    var codeRow = el('div', 'memo-code-row');
    codeRow.appendChild(el('span', 'memo-code', obj.code));
    codeRow.appendChild(pillarChipEl(obj.pillar));
    left.appendChild(codeRow);
    left.appendChild(el('h3', null, obj.title));
    if (labState.mode === 'medium' && obj.where) {
      var where = el('p', 'memo-where');
      where.appendChild(icon('MapPin', { px: 12, cls: 'icon-inline' }));
      where.appendChild(document.createTextNode(' Where to look: ' + obj.where));
      left.appendChild(where);
    }
    head.appendChild(left);

    if (filed) {
      head.appendChild(el('span', 'stamp stamp-filed', 'Filed'));
    } else {
      head.appendChild(el('span', 'stamp stamp-open' + (isOpen ? ' is-open' : ''), 'Open'));
    }
    card.appendChild(head);

    var openBtn = el('button', 'btn btn-outline btn-sm btn-pill btn-touch memo-open-btn ' + (filed ? 'filed' : 'todo'));
    openBtn.type = 'button';
    openBtn.setAttribute('aria-label', (filed ? 'Reopen' : 'Open') + ' memo ' + obj.code + ': ' + obj.title);
    if (filed) {
      openBtn.appendChild(icon('Check', { px: 12, cls: 'icon-inline' }));
      openBtn.appendChild(document.createTextNode(' Reopen'));
    } else {
      openBtn.textContent = 'Open memo';
    }
    openBtn.appendChild(icon('ChevronRight', { px: 12, cls: 'icon-inline' }));
    openBtn.addEventListener('click', function () {
      openObjective(obj.id);
    });
    card.appendChild(openBtn);
    return card;
  }

  function renderMemoGrid() {
    if (!desk.memoGrid) return;
    desk.memoGrid.textContent = '';
    objectivesForMode(labState.mode).forEach(function (o) {
      desk.memoGrid.appendChild(buildMemoCard(o));
    });
  }

  function buildQuizMemo() {
    var s = currentStats();
    var btn = el('button', 'quiz-memo focus-strong');
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Open the exit interview knowledge check');
    var row = el('div', 'quiz-memo-row');
    var left = el('div');
    var tag = el('span', 'qm-tag' + (labState.quizSubmitted ? ' done' : ''));
    tag.textContent = labState.quizSubmitted
      ? 'EXIT INTERVIEW · DONE — ' + s.quizCorrect + '/' + s.quizTotal
      : 'EXIT INTERVIEW · KNOWLEDGE CHECK';
    left.appendChild(tag);
    left.appendChild(
      el('h3', null, labState.mode === 'medium' ? 'Seven concept questions' : 'Seven scenario judgments')
    );
    left.appendChild(
      el(
        'p',
        'qm-sub',
        labState.quizSubmitted ? 'Submitted — review the verdicts anytime.' : 'Available now, or after the memos — your call.'
      )
    );
    row.appendChild(left);
    row.appendChild(icon('ChevronRight', { px: 20, cls: 'icon-inline qm-chev' }));
    btn.appendChild(row);
    btn.addEventListener('click', function () {
      openObjective('QUIZ');
    });
    return btn;
  }

  function renderQuizMemo() {
    if (!desk.quizMemoBox) return;
    desk.quizMemoBox.textContent = '';
    desk.quizMemoBox.appendChild(buildQuizMemo());
  }

  function buildDecoyCard() {
    var card = el('article', 'decoy-card');
    var head = el('div', 'decoy-head');
    var left = el('div');
    left.appendChild(el('span', 'decoy-code', DECOY_MEMO.code + ' · UNVERIFIED SENDER'));
    left.appendChild(el('h3', null, DECOY_MEMO.title));
    head.appendChild(left);
    if (labState.decoyOpened) head.appendChild(el('span', 'stamp stamp-noise', 'Noise'));
    card.appendChild(head);
    card.appendChild(el('p', 'decoy-body', DECOY_MEMO.body));
    if (!labState.decoyOpened) {
      var btn = el('button', 'btn btn-outline btn-sm btn-pill decoy-btn');
      btn.type = 'button';
      btn.textContent = 'Open and assess';
      btn.addEventListener('click', function () {
        openDecoy();
      });
      card.appendChild(btn);
    } else {
      card.appendChild(el('p', 'decoy-payoff', DECOY_MEMO.payoff));
    }
    return card;
  }

  function renderDecoy() {
    if (!desk.decoyBox) return;
    desk.decoyBox.textContent = '';
    desk.decoyBox.appendChild(buildDecoyCard());
  }

  function mountWorkspace() {
    if (!desk.wsBox) return;
    desk.wsBox.textContent = '';
    activeQuizSection = null;
    ws = {};
    var obj = labState.activeId && labState.activeId !== 'QUIZ' ? findObjective(labState.activeId) : undefined;
    if (obj) {
      desk.wsBox.appendChild(buildObjectiveWorkspace(obj));
    } else if (labState.activeId === 'QUIZ') {
      activeQuizSection = buildQuizWorkspace(labState.mode);
      desk.wsBox.appendChild(activeQuizSection);
    } else {
      var empty = el('div', 'desk-empty');
      empty.appendChild(el('p', 'de-title', 'The desk is clear — pick a memo.'));
      empty.appendChild(
        el(
          'p',
          'de-sub',
          'Open any memo above to work it. ' +
            (labState.mode === 'medium'
              ? 'The agenda guides you top to bottom.'
              : 'Trust your triage instincts.')
        )
      );
      desk.wsBox.appendChild(empty);
    }
  }

  function scrollWorkspace() {
    if (labState.activeId && desk.wsBox) {
      desk.wsBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /* ------------------------------------------------------------------ */
  /* Toolbar                                                              */
  /* ------------------------------------------------------------------ */

  function buildToolbar() {
    var header = el('header', 'lab-toolbar');
    var inner = el('div', 'lab-toolbar-inner');

    var brand = el('div', 'tb-brand');
    brand.appendChild(el('span', 'tb-mono', 'LL'));
    var brandText = el('div');
    brandText.style.minWidth = '0';
    var title = el('p', 'tb-title');
    title.appendChild(document.createTextNode(BRIEFING.codename + ' '));
    title.appendChild(el('span', 'case-no', '· ' + BRIEFING.caseNo));
    brandText.appendChild(title);
    brandText.appendChild(el('p', 'tb-sub', MODE_LABEL[labState.mode] + ' · CYSA+ LESSON 1.1'));
    brand.appendChild(brandText);
    inner.appendChild(brand);

    var actions = el('div', 'tb-actions');

    var stats = el('div', 'tb-stats');
    var s = currentStats();
    tb.ring = progressRing(s.percent);
    stats.appendChild(tb.ring);
    var statsText = el('div', 'tb-stats-text');
    tb.filedP = el('p');
    var strong = el('span', 'strong', s.filed + '/' + s.total + ' ');
    strong.appendChild(el('span', 'soft', 'memos'));
    tb.filedP.appendChild(strong);
    statsText.appendChild(tb.filedP);
    tb.scoreP = el('p', 'muted', 'Score ' + s.score + '/' + s.max);
    statsText.appendChild(tb.scoreP);
    tb.stars = stars(s.stars, 11);
    statsText.appendChild(tb.stars);
    stats.appendChild(statsText);
    actions.appendChild(stats);

    function toolBtn(label, iconName, cls, ariaLabel) {
      var b = el('button', 'btn btn-outline btn-sm btn-pill btn-touch mono' + (cls ? ' ' + cls : ''));
      b.type = 'button';
      b.setAttribute('aria-label', ariaLabel);
      b.appendChild(icon(iconName, { px: 14, cls: 'icon-inline' }));
      b.appendChild(document.createTextNode(' ' + label));
      return b;
    }

    var caseFileBtn = toolBtn('Case file', 'Undo2', null, 'Return to the case file cover');
    caseFileBtn.addEventListener('click', goCover);
    actions.appendChild(caseFileBtn);

    var briefingBtn = toolBtn('Briefing', 'ScrollText', null, 'Reopen the case briefing');
    briefingBtn.addEventListener('click', function () {
      setBriefingOpen(true);
    });
    actions.appendChild(briefingBtn);

    var notesLink = el('a', 'tb-link');
    notesLink.href = '#field-notes';
    notesLink.setAttribute('aria-label', 'Jump to field notes');
    notesLink.appendChild(icon('BookMarked', { px: 14, cls: 'icon-inline' }));
    notesLink.appendChild(document.createTextNode(' Field notes'));
    actions.appendChild(notesLink);

    tb.caseClosedBtn = toolBtn('Case closed', 'BadgeCheck', 'tb-closed', 'Open the completion report');
    tb.caseClosedBtn.style.display = 'none';
    tb.caseClosedBtn.addEventListener('click', function () {
      setCompletionOpen(true);
    });
    actions.appendChild(tb.caseClosedBtn);

    var resetBtn = toolBtn('Reset', 'RotateCcw', 'tb-reset', 'Reset the lab to pristine state');
    resetBtn.addEventListener('click', function () {
      resetDialog.open();
    });
    actions.appendChild(resetBtn);

    inner.appendChild(actions);
    header.appendChild(inner);

    /* mobile pane switcher */
    var switcher = el('div', 'pane-switcher');
    switcher.setAttribute('role', 'tablist');
    switcher.setAttribute('aria-label', 'Lab panes');
    [
      ['wall', 'Wall'],
      ['desk', 'Desk'],
      ['shelf', 'Shelf'],
    ].forEach(function (pair) {
      var b = el('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', mobilePane === pair[0] ? 'true' : 'false');
      b.setAttribute('aria-controls', 'pane-' + pair[0]);
      b.textContent = pair[1];
      b.dataset.pane = pair[0];
      b.addEventListener('click', function () {
        setMobilePane(pair[0]);
      });
      switcher.appendChild(b);
    });
    header.appendChild(switcher);
    tb.switcher = switcher;
    return header;
  }

  function setMobilePane(pane) {
    mobilePane = pane;
    if (tb.switcher) {
      tb.switcher.querySelectorAll('button').forEach(function (b) {
        b.setAttribute('aria-selected', b.dataset.pane === pane ? 'true' : 'false');
      });
    }
    ['wall', 'desk', 'shelf'].forEach(function (id) {
      var paneEl = document.getElementById('pane-' + id);
      if (paneEl) paneEl.classList.toggle('active', id === pane);
    });
  }

  function updateToolbar() {
    var s = currentStats();
    if (!s || !tb.ring) return;
    updateRing(tb.ring, s.percent);
    tb.filedP.textContent = '';
    var strong = el('span', 'strong', s.filed + '/' + s.total + ' ');
    strong.appendChild(el('span', 'soft', 'memos'));
    tb.filedP.appendChild(strong);
    tb.scoreP.textContent = 'Score ' + s.score + '/' + s.max;
    updateStars(tb.stars, s.stars);
    tb.caseClosedBtn.style.display = allFiledNow() ? '' : 'none';
  }

  /* ------------------------------------------------------------------ */
  /* Lab shell                                                            */
  /* ------------------------------------------------------------------ */

  function mountLab() {
    root.textContent = '';
    var shell = el('div');
    shell.style.minHeight = '100vh';
    shell.style.paddingBottom = '40px';

    announce(labState.announcement);

    shell.appendChild(buildToolbar());

    var main = el('main', 'lab-main');
    var grid = el('div', 'desk-grid');

    /* left wing */
    var wallPane = el('div', 'pane' + (mobilePane === 'wall' ? ' active' : ''));
    wallPane.id = 'pane-wall';
    wallPane.setAttribute('role', 'tabpanel');
    wallPane.setAttribute('aria-label', 'Stakeholder wall pane');
    wallPane.appendChild(buildStakeholderWall());
    wallPane.appendChild(buildRiskAppetite());
    grid.appendChild(wallPane);

    /* center */
    var deskPane = el('div', 'pane pane-desk' + (mobilePane === 'desk' ? ' active' : ''));
    deskPane.id = 'pane-desk';
    deskPane.setAttribute('role', 'tabpanel');
    deskPane.setAttribute('aria-label', 'Memo desk pane');

    var agenda = el('div', 'paper-card agenda-card');
    var agendaH = el('h2');
    agendaH.appendChild(icon('ClipboardList', { px: 16, cls: 'icon-inline' }));
    agendaH.appendChild(
      document.createTextNode(
        ' ' + (labState.mode === 'medium' ? 'The agenda — memos in order' : 'The case file — your actions')
      )
    );
    agenda.appendChild(agendaH);
    agenda.appendChild(
      el(
        'p',
        null,
        labState.mode === 'medium'
          ? 'Work top to bottom. Each memo you file earns score; hints and retries only affect stars.'
          : 'Free roam: broad challenges, noisy evidence, exact validation. Order is yours to choose.'
      )
    );
    deskPane.appendChild(agenda);

    if (labState.mode === 'hard') {
      desk.decoyBox = el('div');
      deskPane.appendChild(desk.decoyBox);
      renderDecoy();
    }

    desk.memoGrid = el('div', 'memo-grid');
    deskPane.appendChild(desk.memoGrid);
    renderMemoGrid();

    desk.quizMemoBox = el('div');
    deskPane.appendChild(desk.quizMemoBox);
    renderQuizMemo();

    desk.wsBox = el('div');
    desk.wsBox.style.scrollMarginTop = '7rem';
    deskPane.appendChild(desk.wsBox);
    mountWorkspace();

    grid.appendChild(deskPane);

    /* right wing */
    var shelfPane = el('div', 'pane' + (mobilePane === 'shelf' ? ' active' : ''));
    shelfPane.id = 'pane-shelf';
    shelfPane.setAttribute('role', 'tabpanel');
    shelfPane.setAttribute('aria-label', 'Reference shelf pane');
    shelfPane.appendChild(buildReferenceShelf());
    grid.appendChild(shelfPane);

    main.appendChild(grid);
    main.appendChild(buildFieldNotes());
    shell.appendChild(main);

    /* dialogs */
    resetDialog = buildResetDialog();
    briefingDialog = buildBriefingDialog();
    completionDialog = buildCompletionDialog();
    shell.appendChild(resetDialog.root);
    shell.appendChild(briefingDialog.root);
    shell.appendChild(completionDialog.root);

    root.appendChild(shell);
    currentView = 'lab';
    lastProgress = labState.progress;
    updateToolbar();
  }

  /* ------------------------------------------------------------------ */
  /* Cover                                                                */
  /* ------------------------------------------------------------------ */

  function mountCover() {
    root.textContent = '';
    tb = {};
    ws = {};
    desk = {};
    activeQuizSection = null;
    announce(labState.announcement);
    var hasSave = Object.keys(labState.progress).length > 0 && labState.mode !== null;
    root.appendChild(
      buildCover(
        startMode,
        hasSave,
        function () {
          if (labState.mode) startMode(labState.mode);
        }
      )
    );
    currentView = 'cover';
  }

  /* ------------------------------------------------------------------ */
  /* Dialogs (reset / briefing / completion)                              */
  /* ------------------------------------------------------------------ */

  function buildResetDialog() {
    var dlg = createDialog({
      role: 'alertdialog',
      panelClass: 'alert',
      labelledby: 'reset-title',
      describedby: 'reset-desc',
      /* Radix AlertDialog does not close on outside interaction */
    });
    dlg.panel.textContent = '';
    var h = el('h2', 'dialog-title', 'Shred the case file?');
    h.id = 'reset-title';
    dlg.panel.appendChild(h);
    var desc = el(
      'p',
      'dialog-desc',
      'This wipes all progress — memos filed, answers, hints, exit interview and score — and returns the lab to pristine state. There is no undo.'
    );
    desc.id = 'reset-desc';
    dlg.panel.appendChild(desc);
    var actions = el('div', 'alert-actions');
    var cancel = el('button', 'btn btn-outline', 'Keep working');
    cancel.type = 'button';
    cancel.addEventListener('click', dlg.close);
    var confirm = el('button', 'btn btn-primary btn-pill', 'Shred & reset');
    confirm.type = 'button';
    confirm.addEventListener('click', function () {
      dlg.close();
      resetAll();
    });
    actions.appendChild(cancel);
    actions.appendChild(confirm);
    dlg.panel.appendChild(actions);
    /* Esc routes through the same cancel semantics */
    dlg.onRequestClose = dlg.close;
    return dlg;
  }

  function buildBriefingDialog() {
    var dlg = createDialog({
      role: 'dialog',
      panelClass: 'briefing',
      labelledby: 'briefing-title',
      describedby: 'briefing-desc',
      closeOnOverlay: true,
      onRequestClose: function () {
        setBriefingOpen(false);
      },
    });
    dlg.panel.textContent = '';
    var x = el('button', 'dialog-close-x');
    x.type = 'button';
    x.setAttribute('aria-label', 'Close');
    x.appendChild(icon('X', { px: 16 }));
    x.addEventListener('click', function () {
      setBriefingOpen(false);
    });
    dlg.panel.appendChild(x);

    var h = el('h2', 'dialog-title', 'Case file ' + BRIEFING.caseNo + ' — ' + BRIEFING.codename);
    h.id = 'briefing-title';
    dlg.panel.appendChild(h);
    var desc = el('p', 'dialog-desc', BRIEFING.org + ' — ' + BRIEFING.orgDesc);
    desc.id = 'briefing-desc';
    dlg.panel.appendChild(desc);
    var storyBox = el('div');
    storyBox.style.marginTop = '12px';
    BRIEFING.story.forEach(function (p) {
      storyBox.appendChild(el('p', 'dialog-story-p', p));
    });
    dlg.panel.appendChild(storyBox);
    var safety = el('div', 'safety-notice dialog-safety');
    safety.appendChild(el('p', 'sn-title', 'Safety notice'));
    safety.appendChild(el('p', 'sn-body', BRIEFING.disclaimer));
    dlg.panel.appendChild(safety);
    return dlg;
  }

  function buildCompletionDialog() {
    var dlg = createDialog({
      role: 'dialog',
      panelClass: '',
      labelledby: 'completion-title',
      describedby: 'completion-desc',
      closeOnOverlay: true,
      onRequestClose: function () {
        setCompletionOpen(false);
      },
    });
    return dlg;
  }

  function openCompletion() {
    var mode = labState.mode;
    var objectives = objectivesForMode(mode);
    var pillarCounts = objectives.reduce(
      function (acc, o) {
        acc[o.pillar].total += 1;
        if (labState.progress[o.id] && labState.progress[o.id].status === 'filed') acc[o.pillar].done += 1;
        return acc;
      },
      {
        P1: { done: 0, total: 0 },
        P2: { done: 0, total: 0 },
        P3: { done: 0, total: 0 },
        P4: { done: 0, total: 0 },
      }
    );
    var s = currentStats();
    renderCompletionContent(completionDialog.panel, {
      mode: mode,
      score: s.score,
      max: s.max,
      percent: s.percent,
      stars: s.stars,
      quizCorrect: s.quizCorrect,
      quizTotal: s.quizTotal,
      pillarCounts: pillarCounts,
    });
    /* close X (Radix DialogContent ships one) */
    if (!completionDialog.panel.querySelector('.dialog-close-x')) {
      var x = el('button', 'dialog-close-x');
      x.type = 'button';
      x.setAttribute('aria-label', 'Close');
      x.appendChild(icon('X', { px: 16 }));
      x.addEventListener('click', function () {
        setCompletionOpen(false);
      });
      completionDialog.panel.insertBefore(x, completionDialog.panel.firstChild);
    }
    completionDialog.open();
  }

  function maybeAutoOpenCompletion() {
    var s = currentStats();
    if (
      s &&
      labState.mode &&
      s.filed === s.total &&
      labState.quizSubmitted &&
      !labState.completionSeen &&
      !labState.completionOpen
    ) {
      setCompletionOpen(true);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Workspace partial updates                                            */
  /* ------------------------------------------------------------------ */

  function updateTouchedState() {
    if (!ws.checkBtn) return;
    var obj = findObjective(labState.activeId);
    if (!obj) return;
    var answers = labState.answers[obj.id] || {};
    var touched = isObjectiveTouched(obj, answers);
    ws.checkBtn.disabled = !touched;
    if (ws.touchedNote) ws.touchedNote.style.display = touched ? 'none' : '';
  }

  function progressChangeKind(prev, next) {
    /* returns 'check' if any status/result/attempts changed, 'hint' if only
       hintsUsed moved (including a first-ever progress entry created by a hint) */
    var kind = null;
    var ids = {};
    Object.keys(prev || {}).forEach(function (k) { ids[k] = true; });
    Object.keys(next || {}).forEach(function (k) { ids[k] = true; });
    Object.keys(ids).forEach(function (id) {
      var a = (prev || {})[id];
      var b = (next || {})[id];
      if (!a && !b) return;
      if (!a && b) {
        /* first entry for this objective */
        if (b.attempts === 0 && b.lastResult === 'none' && b.hintsUsed > 0) {
          if (kind !== 'check') kind = 'hint';
        } else {
          kind = 'check';
        }
        return;
      }
      if (a && !b) { kind = 'check'; return; }
      if (a.status !== b.status || a.lastResult !== b.lastResult || a.attempts !== b.attempts || a.solvedFirstAttempt !== b.solvedFirstAttempt) kind = 'check';
      else if (a.hintsUsed !== b.hintsUsed && kind !== 'check') kind = kind || 'hint';
    });
    return kind;
  }

  function updateHintsInPlace() {
    var obj = ws.hintsObj;
    var box = ws.hintsBox;
    if (!obj || !box) return;
    var progress = labState.progress[obj.id];
    var hintsUsed = progress ? progress.hintsUsed : 0;
    var mode = labState.mode;
    box.textContent = '';
    var hTitle = el('p', 'hints-title');
    hTitle.appendChild(icon('Lightbulb', { px: 14, cls: 'icon-inline' }));
    hTitle.appendChild(
      document.createTextNode(
        mode === 'hard'
          ? 'One nudge (visibly costs score)'
          : 'Tiered hints (' + hintsUsed + '/' + obj.hints.length + ' used — hints reduce stars, never block)'
      )
    );
    box.appendChild(hTitle);
    var hintBtns = el('div', 'hint-btns');
    var nextRevealBtn = null;
    obj.hints.forEach(function (_, hi) {
      var revealed = hi < hintsUsed;
      var canReveal = hi === hintsUsed;
      var btn = el('button', 'btn btn-outline btn-sm btn-pill btn-touch hint-btn' + (revealed ? ' revealed' : ''));
      btn.type = 'button';
      btn.disabled = !canReveal;
      btn.setAttribute('aria-label', 'Reveal hint ' + (hi + 1) + ' of ' + obj.hints.length);
      btn.textContent = revealed ? 'Revealed' : hintLabel(hi);
      btn.addEventListener('click', function () {
        revealHint(obj.id);
      });
      if (canReveal) nextRevealBtn = btn;
      hintBtns.appendChild(btn);
    });
    box.appendChild(hintBtns);
    if (hintsUsed > 0) {
      var hintList = el('ul', 'hint-list');
      obj.hints.slice(0, hintsUsed).forEach(function (h, hi) {
        var li = el('li');
        li.appendChild(el('span', 'hint-no', 'Hint ' + (hi + 1) + ':'));
        li.appendChild(document.createTextNode(' ' + h));
        hintList.appendChild(li);
      });
      box.appendChild(hintList);
    }
    /* the clicked button becomes disabled ('Revealed') — move focus to the
       now-active next hint so keyboard flow continues */
    if (nextRevealBtn) nextRevealBtn.focus();
  }

  /* ------------------------------------------------------------------ */
  /* State → render mapping                                               */
  /* ------------------------------------------------------------------ */

  subscribeState(function (patch) {
    if ('announcement' in patch) announce(labState.announcement);

    if ('phase' in patch || 'mode' in patch) {
      if (labState.phase === 'cover' || !labState.mode || !currentStats()) mountCover();
      else mountLab();
      return;
    }

    if ('briefingOpen' in patch) {
      if (patch.briefingOpen) briefingDialog.open();
      else briefingDialog.close();
    }
    if ('completionOpen' in patch) {
      if (patch.completionOpen) openCompletion();
      else completionDialog.close();
    }
    if ('decoyOpened' in patch) renderDecoy();

    if ('activeId' in patch) {
      renderMemoGrid();
      mountWorkspace();
      scrollWorkspace();
      return;
    }

    if ('answers' in patch) {
      updateTouchedState();
    }

    if ('progress' in patch) {
      var kind = progressChangeKind(lastProgress, labState.progress);
      lastProgress = labState.progress;
      updateToolbar();
      renderMemoGrid();
      if (kind === 'check') {
        /* re-render workspace; put focus where the student continues */
        var wasFiled = false;
        Object.keys(patch.progress || {}).forEach(function (id) {
          if (patch.progress[id] && patch.progress[id].status === 'filed') wasFiled = true;
        });
        mountWorkspace();
        if (wasFiled) {
          if (ws.nextBtn) ws.nextBtn.focus();
          else if (ws.feedback) {
            ws.feedback.tabIndex = -1;
            ws.feedback.focus();
          }
        } else if (ws.checkBtn) {
          ws.checkBtn.focus();
        }
      } else if (kind === 'hint') {
        updateHintsInPlace();
      }
      maybeAutoOpenCompletion();
    }

    if ('quizAnswers' in patch) {
      if (activeQuizSection && activeQuizSection.refreshSubmit) activeQuizSection.refreshSubmit();
    }

    if ('quizSubmitted' in patch) {
      if (activeQuizSection && activeQuizSection.refreshVerdict) activeQuizSection.refreshVerdict();
      updateToolbar();
      renderQuizMemo();
      maybeAutoOpenCompletion();
    }
  });

  /* ------------------------------------------------------------------ */
  /* Boot                                                                 */
  /* ------------------------------------------------------------------ */

  if (labState.phase === 'cover' || !labState.mode || !currentStats()) mountCover();
  else mountLab();
})();
