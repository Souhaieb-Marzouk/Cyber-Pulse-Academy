/**
 * App shell — vanilla ports of src/components/lab/irp-lab.tsx (LabSkeleton,
 * ModeSelect, BinderWorld), objectives.tsx (ObjectivesClipboard), quiz-view
 * wiring, debrief.tsx (FieldNotes) and dialogs.tsx/signoff.tsx (Briefing,
 * Knowledge Core, Glossary, Sign-Off) plus the reset confirmation dialog.
 *
 * Bootstrap: reads persisted state; renders ModeSelect or BinderWorld.
 * A store subscriber keeps the chrome (progress ring, rail badges, clipboard)
 * in sync without re-rendering form fields the user is working in.
 */

var LabApp = (function () {
  var U = LabUI;

  /* transient view state — module-level, exactly like the original's useState */
  var view = 'section'; /* 'section' | 'quiz' | 'notes' */
  var appEl = null;
  var world = null; /* refs into the mounted BinderWorld */

  /* ------------------------------------------------------------------ */
  /* Mode selection (irp-lab.tsx ModeSelect)                            */
  /* ------------------------------------------------------------------ */

  function renderModeSelect() {
    appEl.innerHTML =
      '<div class="mode-select">' +
        '<div class="mode-select-inner mode-anim">' +
          '<div class="mode-head">' +
            '<p class="mode-badge-eyebrow">' + labIcon('Stamp', 'mode-badge-icon') + ' CyberLab · CompTIA CySA+ CS0-003 · Lesson 8.1</p>' +
            '<h1 class="mode-title">The Incident Response Program Binder</h1>' +
            '<p class="mode-sub">Atlas Freight &amp; Logistics needs its IR program built before the quarterly tabletop and the cyber-insurance audit. You are the coordinator. Choose how much pressure you want in the room.</p>' +
          '</div>' +
          '<div class="mode-cards">' +
            '<button type="button" class="mode-card mode-card--light mode-anim-d1" data-mode="medium" aria-label="Choose the guided Field Drill mode">' +
              '<div class="mode-card-top">' +
                '<span class="mode-card-icon mode-card-icon--amber">' + labIcon('GraduationCap') + '</span>' +
                '<span class="badge badge--amber-solid">MEDIUM · GUIDED</span>' +
              '</div>' +
              '<h2 class="mode-card-title">Field Drill</h2>' +
              '<p class="mode-card-tag">Learn it properly, at your pace.</p>' +
              '<ul class="mode-card-list">' +
                '<li>· 12 guided objectives across 8 binder sections</li>' +
                '<li>· Tiered hints (3 levels) — always available, cost stars only</li>' +
                '<li>· Tolerant checking with teaching feedback on every attempt</li>' +
                '<li>· 6-question concept quiz, then CISO sign-off</li>' +
              '</ul>' +
              '<p class="mode-card-cta mode-card-cta--amber">Start the drill <span aria-hidden="true">→</span></p>' +
            '</button>' +
            '<button type="button" class="mode-card mode-card--dark mode-anim-d2" data-mode="hard" aria-label="Choose the Live Audit hard mode">' +
              '<div class="mode-card-top">' +
                '<span class="mode-card-icon mode-card-icon--dark">' + labIcon('FileBadge2') + '</span>' +
                '<span class="badge badge--rose-solid">HARD · UNDER PRESSURE</span>' +
              '</div>' +
              '<h2 class="mode-card-title">Live Audit</h2>' +
              '<p class="mode-card-tag mode-card-tag--dark">Prove it, with the noise turned on.</p>' +
              '<ul class="mode-card-list mode-card-list--dark">' +
                '<li>· 9 multi-step challenges across 10 sections</li>' +
                '<li>· Noisy evidence, red herrings, strict validation — near-misses rejected</li>' +
                '<li>· One optional nudge, and it visibly costs score</li>' +
                '<li>· 7-item scenario exam and a live-fire war-room tabletop</li>' +
              '</ul>' +
              '<p class="mode-card-cta mode-card-cta--dark">Enter the audit <span aria-hidden="true">→</span></p>' +
            '</button>' +
          '</div>' +
          '<p class="mode-footnote">Synthetic training environment · fictional organization · defensive/educational purpose only</p>' +
        '</div>' +
      '</div>';
    appEl.querySelectorAll('[data-mode]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        LabStore.setMode(btn.dataset.mode);
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Rail buttons (irp-lab.tsx railButton)                              */
  /* ------------------------------------------------------------------ */

  function railButtonHtml(kind, key, label, icon, badge, active, mono) {
    var badgeHtml = badge
      ? '<span class="rail-badge ' + (badge.done === badge.total ? 'rail-badge--done' : '') + '">' + badge.done + '/' + badge.total + '</span>'
      : '';
    return '<button type="button" class="rail-btn ' + (active ? 'rail-btn--active' : '') + '" data-rail-kind="' + kind + '" data-rail-key="' + key + '"' +
      (active ? ' aria-current="page"' : '') + '>' +
      labIcon(icon, 'rail-icon') +
      '<span class="rail-label">' + (mono ? '<span class="rail-mono">' + mono + '</span>' : '') + U.esc(label) + '</span>' +
      badgeHtml +
      '</button>';
  }

  function sectionsForMode(mode) {
    return SECTIONS.filter(function (s) {
      return s.serves.some(function (x) { return x.mode === mode; });
    });
  }

  function railBadge(sectionKey, mode) {
    var meta = null;
    for (var i = 0; i < SECTIONS.length; i++) if (SECTIONS[i].key === sectionKey) meta = SECTIONS[i];
    var ids = [];
    for (var j = 0; j < meta.serves.length; j++) if (meta.serves[j].mode === mode) ids = meta.serves[j].objectiveIds;
    if (ids.length === 0) return null;
    var st = LabStore.getState();
    var done = ids.filter(function (id) { return st.obj[id] && st.obj[id].done; }).length;
    return { done: done, total: ids.length };
  }

  function nextSectionFor(mode) {
    var st = LabStore.getState();
    var sections = sectionsForMode(mode);
    for (var i = 0; i < sections.length; i++) {
      var ids = [];
      for (var j = 0; j < sections[i].serves.length; j++) {
        if (sections[i].serves[j].mode === mode) ids = sections[i].serves[j].objectiveIds;
      }
      if (ids.some(function (id) { return !(st.obj[id] && st.obj[id].done); })) return sections[i];
    }
    return null;
  }

  /* ------------------------------------------------------------------ */
  /* Binder world (irp-lab.tsx BinderWorld)                             */
  /* ------------------------------------------------------------------ */

  function renderBinderWorld() {
    var state = LabStore.getState();
    var mode = state.mode;
    var objectives = objectivesByMode(mode);
    var doneCount = objectives.filter(function (o) { return state.obj[o.id] && state.obj[o.id].done; }).length;
    var sections = sectionsForMode(mode);

    appEl.innerHTML =
      '<div class="binder">' +
        '<header class="binder-header">' +
          '<div class="binder-header-inner">' +
            '<div class="binder-brand">' +
              '<span class="binder-logo" aria-hidden="true">' + labIcon('Stamp') + '</span>' +
              '<div class="binder-brand-text">' +
                '<p class="binder-title">Atlas IR Program Binder</p>' +
                '<p class="binder-subtitle">CySA+ CS0-003 · Lesson 8.1 · Incident Response Planning</p>' +
              '</div>' +
              '<span class="badge badge--outline ' + (mode === 'hard' ? 'badge--rose-outline' : 'badge--amber-outline') + ' badge--mode">' + (mode === 'hard' ? 'LIVE AUDIT' : 'FIELD DRILL') + '</span>' +
            '</div>' +
            '<div class="binder-actions">' +
              '<span data-slot="ring"></span>' +
              '<button type="button" class="btn btn--outline btn--sm" data-x="briefing">' + labIcon('Stamp', 'btn-icon icon-amber') + '<span class="hide-sm">Briefing</span></button>' +
              '<button type="button" class="btn btn--outline btn--sm" data-x="kc">' + labIcon('BookMarked', 'btn-icon icon-amber') + '<span class="hide-sm">Notes</span></button>' +
              '<button type="button" class="btn btn--outline btn--sm" data-x="glossary">' + labIcon('HelpCircle', 'btn-icon icon-amber') + '<span class="hide-sm">Glossary</span></button>' +
              '<button type="button" class="btn btn--dark btn--sm" data-x="signoff">' + labIcon('FileBadge2', 'btn-icon') + '<span class="hide-sm">Sign-off</span></button>' +
              '<button type="button" class="btn btn--outline btn--sm btn--clipboard" data-x="clipboard" aria-label="Open objectives clipboard">' + labIcon('ClipboardList', 'btn-icon icon-amber') + '<span class="mono-count" data-slot="clipcount">' + doneCount + '/' + objectives.length + '</span></button>' +
              '<button type="button" class="btn btn--ghost btn--sm" data-x="reset" aria-label="Reset the binder to pristine state">' + labIcon('RotateCcw', 'btn-icon') + '<span class="hide-md">Reset</span></button>' +
            '</div>' +
          '</div>' +
          '<nav aria-label="Binder sections" class="section-strip">' +
            '<div class="section-strip-scroll" data-slot="strip"></div>' +
          '</nav>' +
        '</header>' +
        '<div class="binder-desk">' +
          '<aside class="rail" aria-label="Binder tab rail"><nav class="rail-nav" data-slot="rail"></nav></aside>' +
          '<main class="workbench" aria-label="Binder workbench" data-slot="workbench"></main>' +
          '<aside class="clipboard-rail" aria-label="Objectives clipboard"><div class="clipboard-sticky" data-slot="clipboard"></div></aside>' +
        '</div>' +
        '<p class="sr-only" aria-live="polite" data-slot="announcer"></p>' +
      '</div>';

    world = {
      ring: appEl.querySelector('[data-slot="ring"]'),
      clipcount: appEl.querySelector('[data-slot="clipcount"]'),
      strip: appEl.querySelector('[data-slot="strip"]'),
      rail: appEl.querySelector('[data-slot="rail"]'),
      workbench: appEl.querySelector('[data-slot="workbench"]'),
      clipboard: appEl.querySelector('[data-slot="clipboard"]'),
      announcer: appEl.querySelector('[data-slot="announcer"]'),
    };

    /* header buttons */
    appEl.querySelector('[data-x="briefing"]').addEventListener('click', function () { openBriefing(); });
    appEl.querySelector('[data-x="kc"]').addEventListener('click', function () { view = 'section'; openKnowledgeCore(); });
    appEl.querySelector('[data-x="glossary"]').addEventListener('click', function () { openGlossary(); });
    appEl.querySelector('[data-x="signoff"]').addEventListener('click', function () { openSignOff(); });
    appEl.querySelector('[data-x="clipboard"]').addEventListener('click', function () { openClipboardSheet(); });
    appEl.querySelector('[data-x="reset"]').addEventListener('click', function () {
      U.confirmReset(function () { LabStore.resetAll(); });
    });

    renderChrome(mode);
    renderWorkbench();

    /* Day One memo opens automatically on first entry of a fresh session */
    if (!state.briefingSeen) openBriefing(true);
  }

  function renderChrome(mode) {
    var state = LabStore.getState();
    var objectives = objectivesByMode(mode);
    var doneCount = objectives.filter(function (o) { return state.obj[o.id] && state.obj[o.id].done; }).length;
    var sections = sectionsForMode(mode);

    world.ring.innerHTML = U.progressRing(
      objectives.length ? doneCount / objectives.length : 0,
      'Binder completeness: ' + doneCount + ' of ' + objectives.length + ' objectives');
    world.clipcount.textContent = doneCount + '/' + objectives.length;

    function railHtml() {
      var html = '';
      for (var i = 0; i < sections.length; i++) {
        var s = sections[i];
        var active = view === 'section' && state.activeSection === s.key;
        html += railButtonHtml('section', s.key, s.label, s.icon, railBadge(s.key, mode), active, s.code);
      }
      html += '<div class="rail-divider"></div>';
      html += railButtonHtml('quiz', 'quiz', 'Knowledge Check', 'GraduationCap', null, view === 'quiz', 'KC');
      html += railButtonHtml('notes', 'notes', 'Field Notes', 'BookOpen', null, view === 'notes', 'FN');
      if (mode === 'medium' && view === 'section') {
        var next = nextSectionFor(mode);
        if (next && next.key !== state.activeSection) {
          html += '<button type="button" class="btn btn--outline btn--suggested" data-x="suggested">Suggested next: ' + U.esc(next.code) + '</button>';
        }
      }
      return html;
    }

    world.strip.innerHTML = railHtml();
    world.rail.innerHTML = railHtml();

    /* wire rail buttons (both containers) */
    appEl.querySelectorAll('[data-rail-kind]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var kind = btn.dataset.railKind;
        var key = btn.dataset.railKey;
        if (kind === 'section') {
          LabStore.setActiveSection(key);
          view = 'section';
        } else {
          view = kind;
        }
        renderChrome(LabStore.getState().mode);
        renderWorkbench();
      });
    });
    var suggested = appEl.querySelector('[data-x="suggested"]');
    if (suggested) {
      suggested.addEventListener('click', function () {
        var next = nextSectionFor(LabStore.getState().mode);
        if (!next) return;
        LabStore.setActiveSection(next.key);
        view = 'section';
        renderChrome(LabStore.getState().mode);
        renderWorkbench();
      });
    }

    /* screen-reader announcer */
    if (view === 'section') {
      var meta = null;
      var active = LabStore.getState().activeSection;
      for (var i = 0; i < SECTIONS.length; i++) if (SECTIONS[i].key === active) meta = SECTIONS[i];
      if (meta) world.announcer.textContent = 'Binder section: ' + meta.label + '. ' + meta.intro;
    } else if (view === 'quiz') {
      world.announcer.textContent = 'Knowledge check annex.';
    } else {
      world.announcer.textContent = 'Field notes annex.';
    }
  }

  function renderWorkbench() {
    var state = LabStore.getState();
    var mode = state.mode;

    if (view === 'section') {
      LabSections.render(mode, state.activeSection, world.workbench);
      var next = mode === 'medium' ? nextSectionFor(mode) : null;
      if (next && next.key !== state.activeSection) {
        var btn = document.createElement('div');
        btn.className = 'file-continue';
        btn.innerHTML = '<button type="button" class="btn btn--outline btn--lg">File &amp; continue → ' + U.esc(next.code) + ' · ' + U.esc(next.label) + '</button>';
        btn.querySelector('button').addEventListener('click', function () {
          LabStore.setActiveSection(next.key);
          view = 'section';
          renderChrome(LabStore.getState().mode);
          renderWorkbench();
        });
        world.workbench.appendChild(btn);
      }
    } else if (view === 'quiz') {
      LabQuiz.render(mode, world.workbench);
    } else {
      renderFieldNotes(world.workbench);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Objectives clipboard (objectives.tsx ObjectivesClipboard)          */
  /* ------------------------------------------------------------------ */

  function renderClipboardInto(container) {
    var state = LabStore.getState();
    var mode = state.mode;
    var objectives = objectivesByMode(mode);
    var doneCount = objectives.filter(function (o) { return state.obj[o.id] && state.obj[o.id].done; }).length;
    var nextId = null;
    for (var i = 0; i < objectives.length; i++) {
      if (!(state.obj[objectives[i].id] && state.obj[objectives[i].id].done)) { nextId = objectives[i].id; break; }
    }
    var pillars = ['understand', 'recognize', 'detect', 'mitigate'];

    var el = document.createElement('div');
    el.className = 'clipboard';

    var barsHtml = '';
    pillars.forEach(function (p) {
      var set = objectives.filter(function (o) { return o.pillar === p; });
      var done = set.filter(function (o) { return state.obj[o.id] && state.obj[o.id].done; }).length;
      var pct = set.length ? (done / set.length) * 100 : 0;
      barsHtml += '<div class="pillar-row">' +
        '<span class="pillar-row-label">' + labIcon(PILLARS[p].icon) + U.esc(PILLARS[p].label) + '</span>' +
        '<div class="pillar-bar" aria-hidden="true"><div class="pillar-bar-fill pillar-bar-fill--' + p + '" style="width:' + pct + '%"></div></div>' +
        '<span class="pillar-row-count">' + done + '/' + set.length + '</span>' +
        '</div>';
    });

    var cardsHtml = '<div class="clipboard-list">';
    objectives.forEach(function (o, idx) {
      var st = state.obj[o.id];
      var isNext = o.id === nextId;
      var meta = null;
      for (var k = 0; k < SECTIONS.length; k++) if (SECTIONS[k].key === o.section) meta = SECTIONS[k];

      var stepsHtml = '';
      if (mode === 'medium' && st && !st.done) {
        for (var s = 0; s < o.steps.length; s++) stepsHtml += '<p class="obj-step">' + U.esc(o.steps[s]) + '</p>';
      }
      var hintsHtml = '';
      if (st && st.hints > 0) {
        hintsHtml += '<div class="hint-box">';
        for (var h = 0; h < Math.min(st.hints, o.hints.length); h++) {
          hintsHtml += '<p class="hint-line"><span class="hint-tag">Hint ' + (h + 1) + ':</span>' + U.esc(o.hints[h]) + '</p>';
        }
        hintsHtml += '</div>';
      }
      var resultHtml = st && st.lastResult
        ? U.resultLine(st.lastResult === 'pass', U.esc(st.lastResult === 'pass' ? o.feedbackPass : o.feedbackFail))
        : '';

      var hintBtn = '';
      if (o.hints.length > 0 && !(st && st.done)) {
        var hintsUsed = (st && st.hints) || 0;
        hintBtn = '<button type="button" class="btn btn--ghost btn--sm obj-btn"' +
          (hintsUsed >= o.hints.length ? ' disabled' : '') +
          ' data-x="hint" data-obj="' + o.id + '" aria-label="Reveal hint for ' + U.esc(o.fullId) + '">' +
          labIcon('Lightbulb', 'btn-icon') +
          (mode === 'hard' ? 'Nudge (costs score) · ' + hintsUsed + '/1' : 'Hint ' + (hintsUsed + 1) + '/' + o.hints.length) +
          '</button>';
      }

      cardsHtml += '<div class="obj-card ' + (isNext && mode === 'medium' ? 'obj-card--next' : '') + ' ' + (st && st.done ? 'obj-card--done' : '') + '" data-obj-card="' + o.id + '">' +
        '<p class="obj-card-tags">' +
          '<span class="mono-tag">' + U.esc(o.fullId) + '</span>' + U.pillarChip(o.pillar) +
          (st && st.done ? '<span class="filed-flag">✓ FILED</span>' : '') +
          (isNext && mode === 'medium' && !(st && st.done) ? '<span class="next-flag">← NEXT</span>' : '') +
        '</p>' +
        '<p class="obj-card-title">' + (idx + 1) + '. ' + U.esc(o.title) + '</p>' +
        (stepsHtml ? '<div class="obj-steps">' + stepsHtml + '</div>' : '') +
        '<p class="obj-anchor">Covers: ' + U.esc(o.anchor) + '</p>' +
        '<div class="obj-actions">' +
          '<button type="button" class="btn btn--outline btn--sm obj-btn" data-x="goto" data-obj="' + o.id + '">' +
            labIcon('Search', 'btn-icon btn-icon--xs') + U.esc(meta ? meta.label : o.section) + labIcon('ChevronRight', 'btn-icon btn-icon--xs') +
          '</button>' +
          '<button type="button" class="btn btn--dark btn--sm obj-btn" data-x="check" data-obj="' + o.id + '" aria-label="Check results for ' + U.esc(o.fullId) + '">Check results</button>' +
          hintBtn +
        '</div>' +
        hintsHtml + resultHtml +
        '</div>';
    });
    cardsHtml += '</div>';

    el.innerHTML =
      '<div class="clipboard-head">' +
        '<p class="mono-eyebrow">Coordinator’s clipboard</p>' +
        '<p class="clipboard-count">' + doneCount + '/' + objectives.length + ' objectives</p>' +
        '<div class="pillar-bars" aria-label="Progress by mastery pillar">' + barsHtml + '</div>' +
      '</div>' + cardsHtml;

    /* wiring */
    el.querySelectorAll('[data-x="goto"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var obj = null;
        for (var i = 0; i < OBJECTIVES.length; i++) if (OBJECTIVES[i].id === btn.dataset.obj) obj = OBJECTIVES[i];
        goToSection(obj.section, btn);
        /* from the mobile sheet: jump + close the sheet (original closes it) */
        if (el.closest('.dlg-card--sheet')) U.closeDialog();
      });
    });
    el.querySelectorAll('[data-x="check"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        LabStore.checkObjectives([btn.dataset.obj]);
        renderClipboard(); /* lastResult line appears in this card */
      });
    });
    el.querySelectorAll('[data-x="hint"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var objId = btn.dataset.obj;
        LabStore.revealHint(objId);
        renderClipboard(objId); /* hint box grows; button count updates */
      });
    });

    container.innerHTML = '';
    container.appendChild(el);
  }

  function renderClipboard(focusObjId) {
    renderClipboardInto(world.clipboard);
    /* when the mobile sheet is open it hosts the LIVE clipboard too —
       hint reveals / check results must update it exactly like the
       original's mounted <ObjectivesClipboard> component */
    var sheetBody = document.querySelector('.dlg-card--sheet .dlg-body');
    if (sheetBody) {
      renderClipboardInto(sheetBody);
      if (focusObjId) {
        var sheetCard = sheetBody.querySelector('[data-obj-card="' + focusObjId + '"]');
        if (sheetCard) {
          var sheetHintBtn = sheetCard.querySelector('[data-x="hint"]');
          if (sheetHintBtn) sheetHintBtn.focus();
        }
      }
    }
    if (focusObjId) {
      /* keep keyboard users anchored on the hint button they just pressed */
      var card = world.clipboard.querySelector('[data-obj-card="' + focusObjId + '"]');
      if (card) {
        var hintBtn = card.querySelector('[data-x="hint"]');
        if (hintBtn && !hintBtn.disabled) hintBtn.focus();
        else if (hintBtn) hintBtn.focus();
      }
    }
  }

  function goToSection(key, opener) {
    LabStore.setActiveSection(key);
    view = 'section';
    renderChrome(LabStore.getState().mode);
    renderWorkbench();
  }

  /* mobile clipboard sheet (< xl) — Radix Sheet replacement */
  function openClipboardSheet() {
    var overlay = U.openDialog({
      variant: 'sheet',
      labelledBy: 'sheet-title',
      titleHtml: '<span class="sr-only" id="sheet-title">Objectives clipboard</span>',
      descHtml: '',
      bodyHtml: '',
    });
    var body = overlay.querySelector('.dlg-body');
    body.className = 'dlg-body dlg-body--sheet';
    renderClipboardInto(body);
    overlay.__close = function () { U.closeDialog(); };
  }

  /* ------------------------------------------------------------------ */
  /* Field Notes (debrief.tsx FieldNotes)                               */
  /* ------------------------------------------------------------------ */

  function renderFieldNotes(root) {
    var el = document.createElement('section');
    el.className = 'section-shell view-anim';
    el.setAttribute('aria-labelledby', 'debrief-title');

    var detectionHtml = DETECTION_SOURCES.map(function (d) {
      return '<li class="hint-card"><p class="mono-label">' + U.esc(d.src) + '</p><p class="hint-card-text">' + U.esc(d.use) + '</p></li>';
    }).join('');

    var mitreHtml = MITRE_MAP.map(function (m) {
      return '<div class="mitre-card"><p class="mitre-id">' + U.esc(m.tid) + ' · ' + U.esc(m.name) + ' — <span class="mitre-tactic">' + U.esc(m.tactic) + '</span></p>' +
        '<p class="mitre-plan">' + U.esc(m.planAnswer) + '</p></div>';
    }).join('');

    var blueHtml = BLUE_TAKEAWAYS.map(function (t) { return '<li>' + U.esc(t) + '</li>'; }).join('');
    var redHtml = RED_TAKEAWAYS.map(function (t) { return '<li>' + U.esc(t) + '</li>'; }).join('');
    var casesHtml = CASE_FILES.map(function (c) {
      return '<div class="case-card"><p class="case-title">' + U.esc(c.title) + ' <span class="mono-tag">' + U.esc(c.year) + '</span></p>' +
        '<p class="case-fact">' + U.esc(c.fact) + '</p><p class="case-lesson">Lesson: ' + U.esc(c.lesson) + '</p></div>';
    }).join('');
    var linksHtml = REFERENCE_LINKS.map(function (r) {
      return '<a class="ref-link" href="' + U.esc(r.href) + '" target="_blank" rel="noopener noreferrer">' + U.esc(r.label) + labIcon('ExternalLink', 'ref-icon') + '<span class="ref-note">· ' + U.esc(r.note) + '</span></a>';
    }).join('');

    el.innerHTML =
      '<header class="sec-header">' +
        '<div class="sec-header-top">' +
          '<span class="sec-icon" aria-hidden="true">' + labIcon('BookOpen') + '</span>' +
          '<div class="sec-title-wrap">' +
            '<p class="sec-eyebrow">Binder annex · field notes</p>' +
            '<h2 id="debrief-title" class="sec-title">Debrief — what the finished binder teaches</h2>' +
          '</div>' + U.stamp({ tone: 'pass', label: 'Annex' }) +
        '</div>' +
        '<p class="sec-intro">Synthesis page: detection opportunities, mitigation mapping with official IDs, and the takeaways both sides of the house should carry out of Lesson 8.1. Everything here is defensive framing — tradecraft at the depth MITRE and CompTIA document it, nothing operational.</p>' +
      '</header>' +
      '<div class="grid-2">' +
        '<div class="card"><h3 class="card-title">' + labIcon('Radar', 'inline-icon icon-rose') + ' Detection opportunities the plan must guarantee</h3><ul class="stack-2 plain-list">' + detectionHtml + '</ul></div>' +
        '<div class="card"><h3 class="card-title">' + labIcon('ShieldCheck', 'inline-icon icon-lime') + ' Mitigation map — ATT&amp;CK verified IDs</h3><div class="stack-2">' + mitreHtml + '</div>' +
          '<p class="fineprint">Countermeasure mapping catalogued in MITRE D3FEND — the defensive mirror of ATT&amp;CK (link below). IDs verified against the official catalog.</p></div>' +
      '</div>' +
      '<div class="grid-2">' +
        '<div class="card"><h3 class="card-title">Blue-team takeaways</h3><ul class="bullet-list">' + blueHtml + '</ul></div>' +
        '<div class="card card--dark"><h3 class="card-title card-title--ondark">' + labIcon('Swords', 'inline-icon icon-amber') + ' Red-team mindset (defensive use)</h3><ul class="bullet-list bullet-list--ondark">' + redHtml + '</ul></div>' +
      '</div>' +
      '<div class="card"><h3 class="card-title">Case files from the wild <span class="mono-tag-tag">simplified · public reporting</span></h3><div class="grid-3">' + casesHtml + '</div></div>' +
      '<div class="card card--dashed"><h3 class="card-title">Official references</h3><div class="ref-links">' + linksHtml + '</div></div>';

    root.innerHTML = '';
    root.appendChild(el);
  }

  /* ------------------------------------------------------------------ */
  /* Dialogs (dialogs.tsx)                                              */
  /* ------------------------------------------------------------------ */

  function openBriefing(auto) {
    U.openDialog({
      labelledBy: 'dlg-briefing-title',
      cardClass: 'dlg-card--paper dlg-card--briefing',
      eyebrowHtml: labIcon('Mail', 'inline-icon') + ' Internal memo · Day One · fictional training scenario',
      titleHtml: 'From the desk of V. Okonkwo, CISO',
      descHtml: 'To: New IR Program Coordinator · Re: The binder on your desk',
      bodyHtml:
        '<div class="memo-body">' +
          '<p>Welcome to <strong>Atlas Freight &amp; Logistics</strong>. I’ll be direct: last quarter a single phishing email nearly became a company-ending ransomware event. Our response was improvised — two hours lost arguing about who decides what a “SEV-1” is, a customer support rep tweeting about “server problems” before containment, and a junior admin wiping a perfectly good disk image.</p>' +
          '<p>The board has mandated a formal incident response program before the quarterly ' + U.term('Tabletop', 'tabletop') + ' exercise and the cyber-insurance renewal audit. That program is this binder — and it is empty.</p>' +
          '<p>Your job, coordinator:</p>' +
          '<ul class="bullet-list">' +
            '<li>Work every section of the binder — lifecycle, team, triage, plans, comms, exercises, vault, playbooks (and the audit + war room, if you take the Hard track).</li>' +
            '<li>Earn the verification stamp on each section. Every check teaches; wrong answers cost nothing but stars.</li>' +
            '<li>Pass the knowledge check annex, then bring the binder to me for <strong>CISO sign-off</strong>.</li>' +
          '</ul>' +
          '<p>This maps to <strong>CompTIA CySA+ CS0-003 · Domain 4 · Lesson 8.1 — Exploring Incident Response Planning</strong>. Finish the binder and you can explain the process, recognize it in evidence, and defend your plan choices — exam and audit alike.</p>' +
          '<p class="memo-fineprint">All data in this binder is synthetic training data. Atlas Freight &amp; Logistics is fictional.</p>' +
        '</div>',
      footerHtml:
        '<p class="mono-note">Estimated session: 25–40 min per mode</p>' +
        '<button type="button" class="btn btn--primary btn--dialog" data-x="start">' + labIcon('FileBadge', 'btn-icon') + 'Open the binder</button>',
      onClose: function () {
        var st = LabStore.getState();
        if (!st.briefingSeen) LabStore.setBriefingSeen();
      },
    });
    var startBtn = document.querySelector('[data-x="start"]');
    if (startBtn) startBtn.addEventListener('click', function () {
      U.closeDialog();
      if (!LabStore.getState().briefingSeen) LabStore.setBriefingSeen();
    });
  }

  function openKnowledgeCore() {
    var phasesHtml = PHASES.map(function (p, i) {
      return '<li class="phase-li">' +
        '<span class="seq-num" aria-hidden="true">' + (i + 1) + '</span>' +
        '<div><p class="phase-name">' + U.esc(p.name) + ' <span class="phase-tagline">— ' + U.esc(p.tagline) + '</span></p>' +
        '<p class="phase-detail">' + U.esc(p.detail) + '</p></div></li>';
    }).join('');

    var ladderLabels = ['', 'talk', 'steps', 'act it', 'alt site', 'real failover'];
    var ladderHtml = EX_TYPES.map(function (t) {
      return '<div class="ladder-row"><span class="ladder-label">' + U.esc(t.label) + '</span>' +
        '<div class="ladder-bar" aria-hidden="true"><div class="ladder-bar-fill" style="width:' + (t.disruption * 20) + '%"></div></div>' +
        '<span class="ladder-note">' + ladderLabels[t.disruption] + '</span></div>';
    }).join('');

    var mitreHtml = MITRE_MAP.map(function (m) {
      return '<div class="mitre-card"><p class="mitre-id">' + U.esc(m.tid) + ' · ' + U.esc(m.name) + ' <span class="mitre-tactic">· ' + U.esc(m.tactic) + '</span></p>' +
        '<p class="mitre-plan">Plan answer: ' + U.esc(m.planAnswer) + '</p></div>';
    }).join('');

    var plansHtml = PLAN_BLURBS.map(function (b) {
      return '<p class="hint-card">' + U.esc(b.label) + '</p>';
    }).join('');

    var casesHtml = CASE_FILES.map(function (c) {
      return '<p class="hint-card"><strong>' + U.esc(c.title) + ' (' + U.esc(c.year) + ')</strong> — ' + U.esc(c.fact) + ' <em>Lesson: ' + U.esc(c.lesson) + '</em></p>';
    }).join('');

    var linksHtml = REFERENCE_LINKS.map(function (r) {
      return '<a href="' + U.esc(r.href) + '" target="_blank" rel="noopener noreferrer" class="kc-link">' + U.esc(r.label) + ' ↗</a>';
    }).join('');

    U.openDialog({
      labelledBy: 'dlg-kc-title',
      wide: true,
      cardClass: 'dlg-card--paper',
      titleHtml: labIcon('BookMarked', 'inline-icon icon-amber') + ' Chapter Notes — Incident Response Planning',
      descHtml: 'CySA+ CS0-003 · Domain 4 · Lesson 8.1 — the reference layer behind every binder section.',
      bodyHtml:
        '<div class="stack-4">' +
          '<div class="callout card--amber-inset"><h3 class="kc-h3">What it is, and why attackers make it necessary</h3>' +
            '<p>' + U.term('Incident Response Plan (IRP)', 'Incident response planning') + ' is preparing and developing a strategy to handle security incidents: identify potential threats, define the steps to mitigate risk, and resource the response. Organizations must have an action plan protecting data, resources, and systems <em>before</em> the incident — because during one, every minute of indecision is attacker time.</p></div>' +
          '<div><h3 class="kc-h3">The six-phase lifecycle</h3><ol class="stack-2 plain-list">' + phasesHtml + '</ol>' +
            '<p class="fineprint">The loop closes: Lessons Learned rewrites Preparation.</p></div>' +
          '<div><h3 class="kc-h3">The plan ecosystem</h3><div class="stack-2">' + plansHtml + '</div></div>' +
          '<div><h3 class="kc-h3">The exercise ladder</h3><div class="stack-2">' + ladderHtml + '</div>' +
            '<p class="fineprint">Disruption and realism grow together — pick the rung that answers the question you must prove.</p></div>' +
          '<div><h3 class="kc-h3">How attackers meet the plan <span class="mono-tag-tag">MITRE ATT&amp;CK verified</span></h3><div class="stack-2">' + mitreHtml + '</div></div>' +
          '<div><h3 class="kc-h3">Case files from the wild <span class="mono-tag-tag">simplified</span></h3><div class="stack-2">' + casesHtml + '</div></div>' +
          '<div class="kc-links">' + linksHtml + '</div>' +
        '</div>',
    });
  }

  function openGlossary() {
    var termsHtml = GLOSSARY.map(function (g) {
      return '<li class="gloss-item"><span class="badge badge--term">term</span>' +
        '<span class="gloss-term">' + U.esc(g.term) + '</span>' +
        '<p class="gloss-def">' + U.esc(g.def) + '</p></li>';
    }).join('');
    U.openDialog({
      labelledBy: 'dlg-gloss-title',
      cardClass: 'dlg-card--paper',
      titleHtml: 'Glossary — 15 terms',
      descHtml: 'Every jargon term used in the binder, one line each.',
      bodyHtml: '<ul class="stack-2 plain-list">' + termsHtml + '</ul>',
    });
  }

  /* ------------------------------------------------------------------ */
  /* Sign-off modal (signoff.tsx SignOffModal)                          */
  /* ------------------------------------------------------------------ */

  function openSignOff() {
    var state = LabStore.getState();
    var mode = state.mode;
    if (!mode) return;
    var ready = LabEngine.signOffReady(state);
    if (ready) LabStore.markCompletionSeen();

    var objectives = objectivesByMode(mode);
    var remaining = objectives.filter(function (o) { return !(state.obj[o.id] && state.obj[o.id].done); });
    var score = Math.round(LabEngine.readiness(state) * 100);
    var stars = LabEngine.starRating(state);
    var pillars = ['understand', 'recognize', 'detect', 'mitigate'];

    var bodyHtml = '';
    var footerHtml = '';

    if (ready) {
      var starsHtml = '';
      for (var i = 1; i <= 5; i++) {
        starsHtml += '<span class="star ' + (i <= stars ? 'star--lit' : 'star--dim') + '" style="--i:' + i + '" aria-hidden="true">' +
          '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" class="star-svg"><path d="M12 2l2.9 6.26 6.6.56-5 4.44 1.5 6.49L12 16.3 5.99 19.75l1.5-6.49-5-4.44 6.6-.56L12 2z"/></svg></span>';
      }
      var recapHtml = '';
      pillars.forEach(function (p) {
        var set = objectives.filter(function (o) { return o.pillar === p; });
        var rows = set.map(function (o) {
          var done = state.obj[o.id] && state.obj[o.id].done;
          return '<li class="recap-row"><span class="' + (done ? 'recap-check recap-check--ok' : 'recap-check recap-check--bad') + '">' + (done ? '✓' : '✗') + '</span>' + U.esc(o.title) + '</li>';
        }).join('');
        recapHtml += '<div class="recap-card"><p class="mono-label">' + U.esc(PILLARS[p].label) + ' · ' +
          set.filter(function (o) { return state.obj[o.id] && state.obj[o.id].done; }).length + '/' + set.length + '</p>' +
          '<ul class="stack-1">' + rows + '</ul></div>';
      });

      var linksHtml = REFERENCE_LINKS.map(function (r) {
        return '<a href="' + U.esc(r.href) + '" target="_blank" rel="noopener noreferrer" class="kc-link kc-link--inline">' + U.esc(r.label) + ' ↗</a>';
      }).join('');

      bodyHtml =
        '<div class="signoff-center">' + U.stamp({ tone: 'pass', label: 'Sign-off · Granted' }) +
          '<div class="stars" role="img" aria-label="' + stars + ' of 5 stars">' + starsHtml + '</div>' +
          '<p class="readiness">Program readiness score: ' + score + '%</p>' +
          '<p class="fineprint">Stars weigh first-attempt accuracy and hint usage (objectives) together with the knowledge-check score.</p>' +
        '</div>' +
        '<div class="card"><p class="mono-eyebrow">Objective recap by pillar</p><div class="grid-2 grid-2--tight">' + recapHtml + '</div></div>' +
        '<div class="callout card--amber-inset"><p class="mono-eyebrow">' + labIcon('BookOpen', 'inline-icon') + ' What to learn next</p>' +
          '<ul class="bullet-list">' +
            '<li>CS0-003 Objective 4.2 applied: incident response procedures in action (Lesson 8.2 territory).</li>' +
            '<li>Detection engineering for the Identification phase — turn the duty-log patterns into SIEM rules.</li>' +
            '<li>Map your playbooks against MITRE ATT&amp;CK and D3FEND end-to-end.</li>' +
            '<li>Official references: ' + linksHtml + '</li>' +
          '</ul></div>';
      footerHtml =
        '<button type="button" class="btn btn--outline btn--dialog" data-x="back">' + labIcon('ArrowRight', 'btn-icon') + 'Back to the binder</button>' +
        '<button type="button" class="btn btn--ghost btn--dialog btn--ghost-danger" data-x="fresh">Start a fresh binder</button>';
    } else {
      var remainingHtml = remaining.length > 0
        ? '<p class="notice-text">Next up: <strong>' + U.esc(remaining[0].fullId) + '</strong> — ' + U.esc(remaining[0].title) + ' (section: ' + U.esc(remaining[0].section) + ').</p>'
        : '';
      bodyHtml =
        '<div class="stack-3">' +
          '<div class="callout card--amber-inset"><p class="mono-eyebrow">Objectives remaining: ' + remaining.length + '</p>' + remainingHtml + '</div>' +
          '<div class="callout ' + (state.quizSubmitted ? 'callout--ok' : 'callout--bad') + '">' +
            '<p class="mono-eyebrow">Knowledge check annex</p>' +
            '<p class="notice-text">' + (state.quizSubmitted ? 'Filed — score recorded.' : 'Not yet submitted. Find it at the bottom of the tab rail.') + '</p>' +
          '</div>' +
        '</div>';
      footerHtml = '<button type="button" class="btn btn--dark btn--dialog" data-x="back">Back to work</button>';
    }

    U.openDialog({
      labelledBy: 'dlg-signoff-title',
      cardClass: 'dlg-card--paper',
      titleHtml: ready
        ? labIcon('BadgeCheck', 'inline-icon icon-emerald') + ' CISO Sign-Off granted'
        : 'The desk is not clear yet, coordinator',
      descHtml: ready
        ? 'Every section stamped, the annex filed. The binder goes to the board — and the mastery is yours.'
        : 'Sign-off requires every objective filed and the knowledge check submitted.',
      bodyHtml: bodyHtml,
      footerHtml: footerHtml,
    });

    var overlay = document.querySelector('.dlg-overlay:last-of-type');
    var back = overlay.querySelector('[data-x="back"]');
    back.addEventListener('click', function () { U.closeDialog(); });
    var fresh = overlay.querySelector('[data-x="fresh"]');
    if (fresh) fresh.addEventListener('click', function () { U.closeDialog(); LabStore.resetAll(); });
  }

  /* ------------------------------------------------------------------ */
  /* helpers                                                            */
  /* ------------------------------------------------------------------ */

  function objectivesByMode(mode) {
    return OBJECTIVES.filter(function (o) { return o.mode === mode; });
  }

  /* ------------------------------------------------------------------ */
  /* store subscription + bootstrap                                     */
  /* ------------------------------------------------------------------ */

  function bootstrap() {
    appEl = document.getElementById('app');
    var state = LabStore.getState();

    LabStore.subscribe(function (s, patch) {
      var mode = s.mode;
      if (!mode) {
        /* pristine (after RESET) → back to mode selection */
        world = null;
        view = 'section';
        renderModeSelect();
        return;
      }
      if (!world) {
        renderBinderWorld();
        return;
      }
      /* live chrome updates — form fields are never re-rendered mid-work */
      renderChrome(mode);
      if (patch && ('obj' in patch) && view !== 'quiz') renderClipboard();
    });

    if (!state.mode) renderModeSelect();
    else renderBinderWorld();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }

  return {
    renderModeSelect: renderModeSelect,
    renderBinderWorld: renderBinderWorld,
    renderWorkbench: renderWorkbench,
  };
})();
