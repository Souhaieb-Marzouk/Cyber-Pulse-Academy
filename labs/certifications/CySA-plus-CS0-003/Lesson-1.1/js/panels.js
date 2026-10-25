/**
 * CyberLab — "The Leadership Ledger" — PANELS
 *
 * Vanilla-JS port of panels.tsx: case cover (C1 + mode select), stakeholder
 * wall, risk appetite, reference shelf (C2 knowledge core + regulations +
 * glossary, as accessible tabs + accordion), field notes (C6), completion
 * modal (C7), progress ring & stars, and a small focus-trapping dialog system
 * that replaces the Radix Dialog/AlertDialog primitives.
 */
'use strict';

/* ------------------------------------------------------------------ */
/* Progress ring + stars                                               */
/* ------------------------------------------------------------------ */

var RING_SIZE = 46;
var RING_STROKE = 5;

function progressRing(percent) {
  var r = (RING_SIZE - RING_STROKE) / 2;
  var c = 2 * Math.PI * r;
  var filled = (Math.min(100, Math.max(0, percent)) / 100) * c;
  var box = el('div', 'progress-ring');
  box.style.width = RING_SIZE + 'px';
  box.style.height = RING_SIZE + 'px';
  box.setAttribute('role', 'progressbar');
  box.setAttribute('aria-valuenow', String(Math.round(percent)));
  box.setAttribute('aria-valuemin', '0');
  box.setAttribute('aria-valuemax', '100');
  box.setAttribute('aria-label', 'Lab progress');

  var svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('width', String(RING_SIZE));
  svg.setAttribute('height', String(RING_SIZE));
  var track = document.createElementNS(SVG_NS, 'circle');
  track.setAttribute('cx', String(RING_SIZE / 2));
  track.setAttribute('cy', String(RING_SIZE / 2));
  track.setAttribute('r', String(r));
  track.setAttribute('fill', 'none');
  track.setAttribute('stroke-width', String(RING_STROKE));
  track.setAttribute('class', 'track');
  var fill = document.createElementNS(SVG_NS, 'circle');
  fill.setAttribute('cx', String(RING_SIZE / 2));
  fill.setAttribute('cy', String(RING_SIZE / 2));
  fill.setAttribute('r', String(r));
  fill.setAttribute('fill', 'none');
  fill.setAttribute('stroke-width', String(RING_STROKE));
  fill.setAttribute('class', 'fill');
  fill.setAttribute('stroke-dasharray', filled + ' ' + c);
  svg.appendChild(track);
  svg.appendChild(fill);
  box.appendChild(svg);
  box.appendChild(el('span', 'pct', Math.round(percent) + '%'));
  return box;
}

function updateRing(box, percent) {
  var r = (RING_SIZE - RING_STROKE) / 2;
  var c = 2 * Math.PI * r;
  var filled = (Math.min(100, Math.max(0, percent)) / 100) * c;
  var fill = box.querySelector('.fill');
  if (fill) fill.setAttribute('stroke-dasharray', filled + ' ' + c);
  var pct = box.querySelector('.pct');
  if (pct) pct.textContent = Math.round(percent) + '%';
  box.setAttribute('aria-valuenow', String(Math.round(percent)));
}

function stars(count, px) {
  var span = el('span', 'stars');
  span.setAttribute('aria-label', count + ' of 5 stars');
  for (var i = 1; i <= 5; i++) {
    var star = icon('Star', { px: px });
    star.classList.add(i <= count ? 'star-filled' : 'star-empty');
    span.appendChild(star);
  }
  return span;
}

function updateStars(span, count) {
  span.setAttribute('aria-label', count + ' of 5 stars');
  var list = span.querySelectorAll('svg');
  for (var i = 0; i < list.length; i++) {
    list[i].classList.toggle('star-filled', i < count);
    list[i].classList.toggle('star-empty', i >= count);
  }
}

function pillarChipEl(pillar) {
  var p = PILLARS[pillar];
  var span = el('span', 'pillar-chip', pillar + ' ' + p.label);
  span.style.color = p.color;
  span.style.backgroundColor = p.bg;
  return span;
}

/* ------------------------------------------------------------------ */
/* C1 — Case cover: briefing + mode selection                          */
/* ------------------------------------------------------------------ */

/* dark flag intentionally absent on both cards — the original never sets it */
var MODE_CARDS = [
  {
    mode: 'medium',
    name: 'Guided Orientation',
    tagline: 'Learn the craft, memo by memo',
    points: [
      '12 guided objectives, introduced in order',
      '"Where to look" on every memo + 3-tier hints',
      'Tolerant checking: teaching feedback, never penalties beyond stars',
      'Exit interview: 7 concept questions with explanations',
    ],
  },
  {
    mode: 'hard',
    name: 'Live Fire',
    tagline: 'Prove it under realistic noise',
    points: [
      '9 broad multi-step challenges, free-roam case file',
      'Noisy evidence with red herrings; strict exact validation — near-misses rejected',
      'One optional nudge, and it costs score',
      'Exit interview: 7 scenario judgments requiring analysis',
    ],
  },
];

function buildCover(onStart, hasSave, onResume) {
  var cover = el('div', 'cover');
  var inner = el('div', 'cover-inner');

  var badges = el('div', 'cover-badges');
  badges.appendChild(el('span', 'badge badge-solid', 'CYBERLAB · TRAINING SIMULATION · FICTIONAL DATA'));
  badges.appendChild(el('span', 'badge badge-outline-mono', 'CERT: CompTIA CySA+ CS0-003 · DOMAIN 4 (17%)'));
  inner.appendChild(badges);

  var file = el('div', 'case-file');

  var header = el('div', 'case-file-header');
  header.appendChild(el('p', 'case-no', 'CASE FILE Nº ' + BRIEFING.caseNo));
  header.appendChild(el('h1', null, BRIEFING.codename));
  header.appendChild(el('p', 'case-sub', 'Lesson 1.1 — Understanding Cybersecurity Leadership Concepts'));
  file.appendChild(header);

  var body = el('div', 'case-file-body');

  /* org */
  var org = el('section', 'cover-section');
  org.setAttribute('aria-labelledby', 'brief-org');
  var orgH = el('h2');
  orgH.id = 'brief-org';
  orgH.appendChild(icon('Landmark', { px: 18, cls: 'icon-inline' }));
  orgH.appendChild(document.createTextNode(' The organization — ' + BRIEFING.org));
  org.appendChild(orgH);
  org.appendChild(el('p', 'body', BRIEFING.orgDesc));
  body.appendChild(org);

  /* story */
  var story = el('section', 'cover-section');
  story.setAttribute('aria-labelledby', 'brief-story');
  var storyH = el('h2');
  storyH.id = 'brief-story';
  storyH.appendChild(icon('ScrollText', { px: 18, cls: 'icon-inline' }));
  storyH.appendChild(document.createTextNode(' Your briefing'));
  story.appendChild(storyH);
  var storyBox = el('div');
  storyBox.style.marginTop = '4px';
  BRIEFING.story.forEach(function (p) {
    storyBox.appendChild(el('p', 'story-p', p));
  });
  story.appendChild(storyBox);
  body.appendChild(story);

  /* mastery */
  var mastery = el('section', 'cover-section');
  mastery.setAttribute('aria-labelledby', 'brief-mastery');
  var masteryH = el('h2');
  masteryH.id = 'brief-mastery';
  masteryH.appendChild(icon('Target', { px: 18, cls: 'icon-inline' }));
  masteryH.appendChild(document.createTextNode(' What mastery looks like here'));
  mastery.appendChild(masteryH);
  var mList = el('ul', 'mastery-list');
  BRIEFING.mastery.forEach(function (m) {
    var li = el('li');
    li.appendChild(icon('CheckCircle2', { px: 16, cls: 'icon-inline' }));
    li.appendChild(document.createTextNode(m));
    mList.appendChild(li);
  });
  mastery.appendChild(mList);
  body.appendChild(mastery);

  /* safety notice */
  var safety = el('div', 'safety-notice');
  safety.appendChild(el('p', 'sn-title', 'Safety notice'));
  safety.appendChild(el('p', 'sn-body', BRIEFING.disclaimer));
  body.appendChild(safety);

  /* mode selection */
  var modes = el('section', 'cover-section');
  modes.setAttribute('aria-labelledby', 'brief-modes');
  var modesH = el('h2', null, 'Choose your path');
  modesH.id = 'brief-modes';
  modesH.style.fontFamily = 'var(--font-serif)';
  modes.appendChild(modesH);
  var cards = el('div', 'mode-cards');
  MODE_CARDS.forEach(function (m) {
    var card = el('button', 'mode-card focus-strong');
    card.type = 'button';
    card.setAttribute('aria-label', 'Start ' + m.name + ' mode: ' + m.tagline);
    var head = el('div', 'mode-card-head');
    head.appendChild(el('h3', null, m.name));
    head.appendChild(icon(m.mode === 'hard' ? 'Shield' : 'Compass', { px: 20, cls: 'icon-inline' }));
    card.appendChild(head);
    card.appendChild(el('p', 'mode-card-tagline', m.tagline));
    var points = el('ul', 'mode-card-points');
    m.points.forEach(function (p) {
      var li = el('li');
      li.appendChild(el('span', 'dot'));
      li.appendChild(document.createTextNode(p));
      points.appendChild(li);
    });
    card.appendChild(points);
    card.appendChild(el('p', 'mode-card-cta', 'Open the desk →'));
    card.addEventListener('click', function () { onStart(m.mode); });
    cards.appendChild(card);
  });
  modes.appendChild(cards);

  if (hasSave) {
    var row = el('div', 'resume-row');
    var resumeBtn = el('button', 'btn btn-outline btn-pill mono');
    resumeBtn.type = 'button';
    resumeBtn.appendChild(icon('FolderOpen', { px: 14, cls: 'icon-inline' }));
    resumeBtn.appendChild(document.createTextNode(' A saved session exists — resume it instead'));
    resumeBtn.addEventListener('click', onResume);
    row.appendChild(resumeBtn);
    row.appendChild(
      el(
        'p',
        'resume-note',
        'Starting a different path files the current session and begins that mode fresh.'
      )
    );
    modes.appendChild(row);
  }
  body.appendChild(modes);

  file.appendChild(body);
  inner.appendChild(file);
  cover.appendChild(inner);
  return cover;
}

/* ------------------------------------------------------------------ */
/* Stakeholder wall                                                    */
/* ------------------------------------------------------------------ */

function buildStakeholderWall() {
  var section = el('section', 'paper-card');
  section.setAttribute('aria-labelledby', 'wall-title');
  var h = el('h2', 'wall-title');
  h.id = 'wall-title';
  h.appendChild(icon('Users', { px: 16, cls: 'icon-inline' }));
  h.appendChild(document.createTextNode(' Stakeholder Wall'));
  section.appendChild(h);
  section.appendChild(el('p', 'wall-sub', 'Seven people. One incident. Seven different headlines. Read the quotes.'));
  var list = el('div', 'wall-list');
  STAKEHOLDERS.forEach(function (s) {
    var art = el('article', 'stakeholder');
    var head = el('div', 'sh-head');
    head.appendChild(el('span', 'sh-initials', s.initials));
    var who = el('div');
    who.style.minWidth = '0';
    who.appendChild(el('h3', 'sh-name', s.name));
    who.appendChild(el('p', 'sh-role', s.role));
    who.appendChild(el('span', 'badge badge-tech', s.tech));
    head.appendChild(who);
    art.appendChild(head);
    var cares = el('p', 'sh-line sh-cares');
    var cb = el('span');
    cb.style.fontWeight = '600';
    cb.textContent = 'Cares about: ';
    cares.appendChild(cb);
    cares.appendChild(document.createTextNode(s.cares));
    art.appendChild(cares);
    var chan = el('p', 'sh-line sh-channel');
    var chb = el('span');
    chb.style.fontWeight = '600';
    chb.textContent = 'Best channel: ';
    chan.appendChild(chb);
    chan.appendChild(document.createTextNode(s.channel));
    art.appendChild(chan);
    art.appendChild(el('blockquote', 'sh-quote', s.quote));
    list.appendChild(art);
  });
  section.appendChild(list);
  return section;
}

/* ------------------------------------------------------------------ */
/* Risk appetite card                                                  */
/* ------------------------------------------------------------------ */

function buildRiskAppetite() {
  var section = el('section', 'appetite-card');
  section.setAttribute('aria-labelledby', 'appetite-title');
  var h = el('h2');
  h.id = 'appetite-title';
  h.appendChild(icon('Scale', { px: 16, cls: 'icon-inline' }));
  h.appendChild(document.createTextNode(' ' + RISK_APPETITE.title));
  section.appendChild(h);
  var list = el('ul');
  RISK_APPETITE.lines.forEach(function (l) {
    var li = el('li');
    li.appendChild(el('span', 'dot'));
    li.appendChild(document.createTextNode(l));
    list.appendChild(li);
  });
  section.appendChild(list);
  return section;
}

/* ------------------------------------------------------------------ */
/* Reference shelf — tabs + accordion + regulations + glossary         */
/* ------------------------------------------------------------------ */

var REG_ICON = { gdpr: 'Gavel', hipaa: 'Landmark', pci: 'Scale', sox: 'Landmark', glba: 'Scale', ferpa: 'BookOpen' };

function buildTabsHeader(tabIdPrefix, tabs) {
  var list = el('div', 'tabs-list');
  list.setAttribute('role', 'tablist');
  tabs.forEach(function (t, i) {
    var tab = el('button');
    tab.type = 'button';
    tab.id = tabIdPrefix + '-tab-' + t.id;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', t.selected ? 'true' : 'false');
    tab.setAttribute('aria-controls', tabIdPrefix + '-panel-' + t.id);
    tab.tabIndex = t.selected ? 0 : -1;
    tab.textContent = t.label;
    tab.addEventListener('click', function () { t.onSelect(t.id); });
    list.appendChild(tab);
  });
  /* Radix parity: roving tabindex + arrow/Home/End keys, selection follows focus */
  list.addEventListener('keydown', function (e) {
    var keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
    if (keys.indexOf(e.key) < 0) return;
    e.preventDefault();
    var idx = tabs.findIndex(function (t) { return t.selected; });
    var next;
    if (e.key === 'ArrowRight') next = (idx + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (idx - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else next = tabs.length - 1;
    t_onSelect(tabs, next);
    var target = list.querySelectorAll('[role="tab"]')[next];
    if (target) target.focus();
  });
  function t_onSelect(tabsArr, i) {
    tabsArr[i].onSelect(tabsArr[i].id);
  }
  return list;
}

function buildBookPanel() {
  var panel = el('div', 'tab-panel');
  var acc = el('div');
  acc.setAttribute('role', 'presentation');
  var openId = null; /* single-collapsible, like the original */
  var triggers = [];
  KNOWLEDGE.forEach(function (k) {
    var item = el('div', 'accordion-item');
    var trigger = el('button', 'accordion-trigger');
    trigger.type = 'button';
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', 'acc-content-' + k.id);
    trigger.appendChild(document.createTextNode(k.label));
    trigger.appendChild(icon('ChevronDown', { px: 16, cls: 'icon-inline chev' }));
    var content = el('div', 'accordion-content');
    content.id = 'acc-content-' + k.id;
    content.setAttribute('role', 'region');
    content.setAttribute('aria-labelledby', 'acc-trigger-' + k.id);
    trigger.id = 'acc-trigger-' + k.id;
    var innerWrap = el('div');
    var inner = el('div', 'acc-inner');
    var points = el('ul', 'acc-points');
    k.points.forEach(function (p) {
      var li = el('li');
      li.appendChild(icon('CheckCircle2', { px: 14, cls: 'icon-inline' }));
      li.appendChild(document.createTextNode(p));
      points.appendChild(li);
    });
    inner.appendChild(points);
    inner.appendChild(el('p', 'acc-example', k.example));
    innerWrap.appendChild(inner);
    content.appendChild(innerWrap);

    function setOpen(open) {
      openId = open ? k.id : null;
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
      content.classList.toggle('open', open);
    }
    trigger.addEventListener('click', function () {
      var closing = openId === k.id;
      /* close whichever is open, then toggle this one */
      triggers.forEach(function (t) { t.setOpen(false); });
      if (!closing) setOpen(true);
    });
    triggers.push({ setOpen: setOpen });
    item.appendChild(trigger);
    item.appendChild(content);
    acc.appendChild(item);
  });
  panel.appendChild(acc);
  return panel;
}

function buildRegsPanel() {
  var panel = el('div', 'tab-panel');
  panel.appendChild(
    el('p', 'regs-note', 'Simplified training summaries — always verify against primary sources')
  );
  var area = el('div', 'scroll-area');
  REGULATIONS.forEach(function (r) {
    var art = el('article', 'reg-card');
    var h = el('h3');
    h.appendChild(icon(REG_ICON[r.id] || 'Scale', { px: 14, cls: 'icon-inline' }));
    h.appendChild(document.createTextNode(' ' + r.name));
    art.appendChild(h);
    var scope = el('p', 'scope');
    var sb = el('span');
    sb.style.fontWeight = '600';
    sb.textContent = 'Scope: ';
    scope.appendChild(sb);
    scope.appendChild(document.createTextNode(r.scope));
    art.appendChild(scope);
    art.appendChild(el('p', 'duty', r.duty));
    art.appendChild(el('p', 'watch', 'Watch: ' + r.watch));
    area.appendChild(art);
  });
  panel.appendChild(area);
  return panel;
}

function buildGlossaryPanel() {
  var panel = el('div', 'tab-panel');
  var area = el('div', 'scroll-area gloss-list');
  GLOSSARY.forEach(function (g) {
    var card = el('div', 'gloss-card');
    card.appendChild(el('p', 'term', g.term));
    card.appendChild(el('p', 'def', g.def));
    area.appendChild(card);
  });
  panel.appendChild(area);
  return panel;
}

function buildReferenceShelf() {
  var section = el('section', 'paper-card');
  section.setAttribute('aria-labelledby', 'shelf-title');
  var h = el('h2', 'shelf-title');
  h.id = 'shelf-title';
  h.appendChild(icon('BookOpen', { px: 16, cls: 'icon-inline' }));
  h.appendChild(document.createTextNode(' Reference Shelf'));
  section.appendChild(h);

  var tabs = [
    { id: 'book', label: 'Briefing book', selected: true },
    { id: 'regs', label: 'Regulations', selected: false },
    { id: 'gloss', label: 'Glossary', selected: false },
  ];
  var panels = {
    book: buildBookPanel(),
    regs: buildRegsPanel(),
    gloss: buildGlossaryPanel(),
  };

  function select(id) {
    tabs.forEach(function (t) { t.selected = t.id === id; });
    /* rebuild tablist selection state */
    var tabButtons = tablist.querySelectorAll('[role="tab"]');
    tabs.forEach(function (t, i) {
      tabButtons[i].setAttribute('aria-selected', t.selected ? 'true' : 'false');
      tabButtons[i].tabIndex = t.selected ? 0 : -1;
    });
    Object.keys(panels).forEach(function (k) {
      panels[k].hidden = k !== id;
    });
  }
  tabs.forEach(function (t) {
    t.onSelect = select; /* resolved at click/arrow time by the tablist */
  });

  var tablist = buildTabsHeader('shelf', tabs);
  section.appendChild(tablist);
  Object.keys(panels).forEach(function (k) {
    panels[k].id = 'shelf-panel-' + k;
    panels[k].setAttribute('role', 'tabpanel');
    panels[k].setAttribute('aria-labelledby', 'shelf-tab-' + k);
    panels[k].hidden = k !== 'book';
    section.appendChild(panels[k]);
  });
  return section;
}

/* ------------------------------------------------------------------ */
/* C6 — Field notes                                                    */
/* ------------------------------------------------------------------ */

function noteListEl(items, tone) {
  var ul = el('ul', 'note-list');
  items.forEach(function (t) {
    var li = el('li');
    li.appendChild(el('span', 'dot ' + tone));
    li.appendChild(document.createTextNode(t));
    ul.appendChild(li);
  });
  return ul;
}

function buildFieldNotes() {
  var section = el('section', 'field-notes');
  section.id = 'field-notes';
  section.setAttribute('aria-labelledby', 'notes-title');
  var h = el('h2');
  h.id = 'notes-title';
  h.appendChild(icon('Eye', { px: 20, cls: 'icon-inline' }));
  h.appendChild(document.createTextNode(' Field Notes — the debrief'));
  section.appendChild(h);
  section.appendChild(
    el('p', 'fn-sub', 'What a leader watches for, what a leader builds, and what the adversary hopes you never rehearse.')
  );
  var grid = el('div', 'fn-grid');

  function card(hCls, iconCls, iconName, title, sub, items, tone) {
    var c = el('div', 'fn-card');
    var t = el('h3', hCls);
    t.appendChild(icon(iconName, { px: 16, cls: 'icon-inline ' + iconCls }));
    t.appendChild(document.createTextNode(' ' + title));
    c.appendChild(t);
    if (sub) c.appendChild(el('p', 'fn-card-sub', sub));
    c.appendChild(noteListEl(items, tone));
    return c;
  }

  grid.appendChild(
    card(
      'c-green',
      'c-green',
      'Eye',
      'Leadership early-warning indicators',
      'The "detection layer" for leadership — spot these before the incident does.',
      FIELD_NOTES.earlyWarning,
      'g'
    )
  );
  grid.appendChild(
    card(
      'c-red',
      'c-red',
      'Shield',
      'Mitigation & improvement plan',
      'Recommendations the board can fund — with official control IDs where relevant.',
      FIELD_NOTES.recommendations,
      'r'
    )
  );
  grid.appendChild(card('c-ink', 'c-green', 'Shield', 'Blue-team takeaways', null, FIELD_NOTES.blueTeam, 'g'));
  grid.appendChild(card('c-ink', 'c-redalert', 'Eye', 'Red-team mindset (defensive)', null, FIELD_NOTES.redTeamMindset, 'r'));
  section.appendChild(grid);

  var links = el('div', 'fn-links');
  FIELD_NOTES.links.forEach(function (l) {
    var a = el('a', 'fn-link');
    a.href = l.href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.appendChild(icon('ExternalLink', { px: 12, cls: 'icon-inline' }));
    a.appendChild(document.createTextNode(' ' + l.label));
    links.appendChild(a);
  });
  section.appendChild(links);
  return section;
}

/* ------------------------------------------------------------------ */
/* Dialog system (replaces Radix Dialog / AlertDialog)                 */
/* ------------------------------------------------------------------ */

/**
 * Create a modal dialog.
 * @param {{role: ('dialog'|'alertdialog'), panelClass?: string, labelledby: string,
 *          describedby?: string, closeOnOverlay?: boolean}} opts
 * Returns { root, panel, open, close, isOpen }.
 */
function createDialog(opts) {
  var overlay = el('div', 'dialog-overlay');
  overlay.hidden = true;
  var panel = el('div', 'dialog-panel' + (opts.panelClass ? ' ' + opts.panelClass : ''));
  panel.setAttribute('role', opts.role || 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-labelledby', opts.labelledby);
  if (opts.describedby) panel.setAttribute('aria-describedby', opts.describedby);
  overlay.appendChild(panel);

  var lastFocused = null;
  var open = false;

  /* Esc / outside-click must flow through app state (not silently hide) */
  function requestClose() {
    if (opts.onRequestClose) opts.onRequestClose();
    else close();
  }

  function focusables() {
    return panel.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
  }

  function onKeydown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      requestClose();
      return;
    }
    if (e.key === 'Tab') {
      var f = focusables();
      if (f.length === 0) return;
      var first = f[0];
      var last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function openDialog() {
    if (open) return;
    open = true;
    lastFocused = document.activeElement;
    overlay.hidden = false;
    document.addEventListener('keydown', onKeydown, true);
    var f = focusables();
    if (f.length) f[0].focus();
    else panel.focus();
    panel.tabIndex = -1;
  }

  function close() {
    if (!open) return;
    open = false;
    overlay.hidden = true;
    document.removeEventListener('keydown', onKeydown, true);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  if (opts.closeOnOverlay) {
    overlay.addEventListener('mousedown', function (e) {
      if (e.target === overlay) requestClose();
    });
  }

  return { root: overlay, panel: panel, open: openDialog, close: close, get isOpen() { return open; } };
}

/* ------------------------------------------------------------------ */
/* C7 — Completion modal                                               */
/* ------------------------------------------------------------------ */

function nextStepsFor(mode) {
  return mode === 'medium'
    ? [
        'Re-run this case in Live Fire mode — no guides, real noise.',
        'Study CS0-003 Domain 4 (Reporting and Communication) — reporting formats, incident communication, stakeholder analysis.',
        'Write a vision + three SMART goals for a team you actually know.',
      ]
    : [
        'Write the one-page board brief for your own organization\u2019s top risk.',
        'Rehearse a 72-hour notification drill with a stopwatch.',
        'Study CS0-003 Domain 4 (Reporting and Communication) next, then revisit the ATT&CK mitigations M1032/M1051/M1053.',
      ];
}

function renderCompletionContent(panel, data) {
  panel.textContent = '';

  var head = el('div', 'completion-head');
  head.id = 'completion-title';
  head.appendChild(el('span', 'case-closed-stamp', 'Case closed'));
  head.appendChild(
    el('span', 'completion-mode', 'The Leadership Ledger — ' + (data.mode === 'medium' ? 'Guided Orientation' : 'Live Fire'))
  );
  panel.appendChild(head);

  var desc = el('p', 'dialog-desc');
  desc.id = 'completion-desc';
  desc.style.textAlign = 'center';
  desc.textContent =
    'You walked the full mandate: vision, goals, protection levels, legal duties, decisions, people. That feeling of coherence? That is the mastery Lesson 1.1 asks for.';
  panel.appendChild(desc);

  var box = el('div', 'completion-score-box');
  box.appendChild(stars(data.stars, 26));
  var score = el('p', 'completion-score');
  score.appendChild(document.createTextNode(String(data.score)));
  score.appendChild(el('span', 'of', ' / ' + data.max));
  box.appendChild(score);
  var filedTotal =
    data.pillarCounts.P1.done + data.pillarCounts.P2.done + data.pillarCounts.P3.done + data.pillarCounts.P4.done;
  box.appendChild(
    el(
      'p',
      'completion-line',
      'Objectives ' + filedTotal + ' filed · Exit interview ' + data.quizCorrect + '/' + data.quizTotal + ' correct'
    )
  );
  panel.appendChild(box);

  var recap = el('div', 'completion-section');
  var recapH = el('h3');
  recapH.appendChild(icon('Award', { px: 16, cls: 'icon-inline' }));
  recapH.appendChild(document.createTextNode(' Objective recap by pillar'));
  recap.appendChild(recapH);
  var ul = el('ul', 'pillar-recap');
  ['P1', 'P2', 'P3', 'P4'].forEach(function (p) {
    var c = data.pillarCounts[p];
    var li = el('li');
    var left = el('span', 'pr-left');
    left.appendChild(pillarChipEl(p));
    left.appendChild(el('span', 'pr-desc', PILLARS[p].desc));
    li.appendChild(left);
    var count = el('span', 'pr-count' + (c.done === c.total ? ' complete' : ''), c.done + '/' + c.total);
    li.appendChild(count);
    ul.appendChild(li);
  });
  recap.appendChild(ul);
  panel.appendChild(recap);

  var next = el('div', 'completion-section');
  var nextH = el('h3');
  nextH.appendChild(icon('Compass', { px: 16, cls: 'icon-inline' }));
  nextH.appendChild(document.createTextNode(' What to learn next'));
  next.appendChild(nextH);
  var nextList = noteListEl(nextStepsFor(data.mode), 'i');
  nextList.classList.add('next-steps');
  next.appendChild(nextList);
  panel.appendChild(next);

  var footer = el('div', 'completion-footer');
  var back = el('button', 'btn btn-primary btn-pill');
  back.type = 'button';
  back.textContent = 'Back to the desk';
  back.addEventListener('click', function () {
    setCompletionOpen(false);
  });
  footer.appendChild(back);
  panel.appendChild(footer);
}
