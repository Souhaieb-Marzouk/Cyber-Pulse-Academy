/**
 * app.js — Bootstrap, routing, section renderers, event wiring.
 * ---------------------------------------------------------------------------
 * Rebuilds the original single-page lab (page.tsx + all section components):
 * splash → mode select → masthead + sticky section nav + stage/ledger grid.
 * All interactions run through data-action event delegation; re-renders are
 * scoped to the regions that changed (masthead / nav / stage / ledger).
 */

/* ================================ constants ================================ */

const SECTIONS = [
  { id: 'briefing', label: 'Briefing', icon: 'file-text' },
  { id: 'core', label: 'Knowledge Core', icon: 'book-open' },
  { id: 'desk', label: 'Audit Desk', icon: 'scan-search' },
  { id: 'exam', label: 'Examination', icon: 'graduation-cap' },
  { id: 'notes', label: 'Field Notes', icon: 'scroll-text' },
];

const DESK_TABS = [
  { id: 'register', label: 'Register' },
  { id: 'matrix', label: 'Checklist Matrix' },
  { id: 'estate', label: 'Estate' },
];

const HINT_LABELS = ['Nudge', 'Direction', 'Demonstration'];

/* Motion-diff snapshots (see Phase notes in README): the original relied on
   React reconciliation to animate value changes; we diff previous values. */
const lastSnap = { scorePct: 0, mastheadDone: 0, ledgerDone: 0, estatePcts: {}, stageKey: '' };

/* ================================ boot ================================ */

function boot() {
  store.subscribe(onStoreChange);

  // Global event delegation
  document.addEventListener('click', onDocClick);
  document.addEventListener('change', onDocChange);
  document.addEventListener('input', onDocInput);

  // Glossary tooltip delegation
  document.addEventListener('mouseover', function (e) {
    const t = e.target.closest ? e.target.closest('.term-btn') : null;
    if (t) Tooltip.show(t);
  });
  document.addEventListener('mouseout', function (e) {
    if (e.target.closest && e.target.closest('.term-btn')) Tooltip.hide();
  });
  document.addEventListener('focusin', function (e) {
    if (e.target.classList && e.target.classList.contains('term-btn')) Tooltip.show(e.target);
  });
  document.addEventListener('focusout', function (e) {
    if (e.target.classList && e.target.classList.contains('term-btn')) Tooltip.hide();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') Tooltip.hide();
  });

  store.init();
}

function onStoreChange(state, regions) {
  if (regions.indexOf('root') !== -1) {
    QuizView.reset();
    renderRoot();
    return;
  }
  if (!state) return;
  if (regions.indexOf('masthead') !== -1) renderMasthead();
  if (regions.indexOf('nav') !== -1) renderNav();
  if (regions.indexOf('stage') !== -1) withFocusPreserved(renderStage);
  if (regions.indexOf('ledger') !== -1) renderLedger();
}

/* ================================ root render ================================ */

function renderRoot() {
  Modal.close(true);
  const app = $('#app');
  if (!store.ready) {
    app.innerHTML = splashHTML();
    return;
  }
  if (!store.state) {
    app.innerHTML = modeSelectHTML();
    return;
  }
  app.innerHTML =
    '<div class="lab-root">' +
      '<div id="masthead-slot"></div>' +
      '<div id="nav-slot"></div>' +
      '<main class="lab-main" id="main-content">' +
        '<div class="lab-grid">' +
          '<div class="lab-stage" id="stage-slot"></div>' +
          '<div class="lab-rail" id="rail-slot"><div id="ledger-slot"></div></div>' +
        '</div>' +
      '</main>' +
    '</div>';
  renderMasthead();
  renderNav();
  renderStage();
  renderLedger();
  // Resume view: mirror the original scroll behavior (fresh mount starts at top)
  window.scrollTo(0, 0);
}

function splashHTML() {
  return (
    '<div class="splash">' +
      '<div class="splash-crest pulse">' + ic('shield-check', 'splash-icon') + '</div>' +
      '<p class="splash-bureau">Aegis Assurance Bureau</p>' +
      '<p class="splash-note">Opening the case file…</p>' +
    '</div>'
  );
}

/* ================================ mode select ================================ */

const MODES = [
  {
    id: 'medium',
    icon: 'book-open',
    title: 'Guided Audit',
    tagline: 'Medium — learn the method',
    bullets: [
      '12 granular objectives, taken in order',
      '"Where to look" pointers on every step',
      'Three-tier hints, freely available',
      'Tolerant checking: wrong answers teach, never punish',
    ],
    tone: 'mode-green',
  },
  {
    id: 'hard',
    icon: 'flame',
    title: 'Blank-Page Audit',
    tagline: 'Hard — prove the mastery',
    bullets: [
      '9 broad multi-step challenges, discovery-first',
      'Noisy evidence with three red herrings planted',
      'Phantom controls hidden in the live estate',
      'Strict validation, exact MITRE IDs, one scored nudge',
    ],
    tone: 'mode-red',
  },
];

function modeSelectHTML() {
  const cards = MODES.map(function (m, i) {
    return '' +
      '<button type="button" role="radio" aria-checked="false" data-action="select-mode" data-mode="' + m.id + '"' +
        ' class="mode-card ' + m.tone + '" style="animation-delay:' + (0.12 + i * 0.1) + 's"' +
        ' aria-label="' + esc(m.title + ' — ' + m.tagline) + '">' +
        '<div class="mode-card-top">' +
          ic(m.icon, 'mode-card-icon') +
          '<span class="mode-card-opt">Option ' + (i + 1) + '</span>' +
        '</div>' +
        '<h2 class="mode-card-title">' + m.title + '</h2>' +
        '<p class="mode-card-tagline">' + m.tagline + '</p>' +
        '<ul class="mode-card-list">' +
          m.bullets.map(function (b) {
            return '<li class="mode-card-bullet"><span class="mode-card-dot" aria-hidden="true"></span>' + esc(b) + '</li>';
          }).join('') +
        '</ul>' +
      '</button>';
  }).join('');

  return (
    '<div class="mode-screen">' +
      '<div class="mode-wrap">' +
        '<div class="mode-crest-block">' +
          '<div class="splash-crest">' + ic('shield-check', 'splash-icon') + '</div>' +
          '<div class="mode-bureau">' + BUREAU_NAME + '</div>' +
          '<h1 class="mode-title">Defense Controls Audit</h1>' +
          '<p class="mode-sub">CompTIA CySA+ CS0-003 · Lesson 14.3 — <span class="mode-sub-strong">Implementing Controls to Prevent Attacks</span></p>' +
          '<p class="mode-case">Case ' + CASE_NO + ' · Client: ' + CLIENT_NAME + ' (synthetic)</p>' +
        '</div>' +
        '<div class="mode-grid" role="radiogroup" aria-label="Choose difficulty mode">' + cards + '</div>' +
        '<div class="mode-footer">' +
          '<span class="mode-foot-item">' + ic('scale', 'h-3.5 w-3.5') + ' Same estate, same data — radically different scrutiny</span>' +
          '<span class="mode-foot-item">' + ic('scan-search', 'h-3.5 w-3.5') + ' Progress auto-saves in this browser</span>' +
        '</div>' +
        '<p class="mode-disclaimer">Synthetic training environment · Defensive/educational use only</p>' +
      '</div>' +
    '</div>'
  );
}

/* ================================ masthead ================================ */

function renderMasthead() {
  const s = store.state;
  if (!s) return;
  const slot = $('#masthead-slot');
  if (!slot) return;
  const ids = objectiveIds(s.mode);
  const doneCount = ids.filter(function (id) { return s.objectives[id] && s.objectives[id].done; }).length;
  const score = computeScore(s);
  const progressPct = ids.length > 0 ? Math.round((doneCount / ids.length) * 100) : 0;

  slot.innerHTML =
    '<header class="masthead" role="banner">' +
      '<div class="masthead-inner">' +
        '<div class="masthead-id">' +
          '<div class="masthead-crest" aria-hidden="true">' + ic('shield-check', 'masthead-crest-icon') + '</div>' +
          '<div class="masthead-titles">' +
            '<div class="masthead-bureau">' + BUREAU_NAME + '</div>' +
            '<div class="masthead-case">Case ' + CASE_NO + ' · ' + CLIENT_NAME + ' · CySA+ 14.3</div>' +
          '</div>' +
        '</div>' +
        '<div class="masthead-status">' +
          '<span class="masthead-mode-badge">' + (s.mode === 'medium' ? 'Guided Audit' : 'Blank-Page Audit') + '</span>' +
          '<span class="masthead-mode-short">' + (s.mode === 'medium' ? 'Guided' : 'Blank-page') + '</span>' +
          '<div class="masthead-count" aria-live="polite">' +
            '<div class="masthead-count-num">' + doneCount + '/' + ids.length + '</div>' +
            '<div class="masthead-count-cap">objectives</div>' +
          '</div>' +
          scoreRingHTML(score.pct, 'score') +
          (s.completed ? stampHTML('Audit complete', 'green', 'sm') : '') +
        '</div>' +
        '<div class="masthead-actions">' +
          (s.completed
            ? '<button type="button" class="btn btn-headline" data-action="open-report">' + ic('file-check-2', 'h-4 w-4') + ' Report</button>'
            : '') +
          '<button type="button" class="btn btn-headline" data-action="switch-request">' + ic('repeat', 'h-4 w-4') +
            ' <span class="hide-sm">Switch mode</span><span class="show-sm-inline">Mode</span></button>' +
          '<button type="button" class="btn btn-headline" data-action="reset-request">' + ic('rotate-ccw', 'h-4 w-4') +
            ' <span class="hide-sm">Reset</span></button>' +
        '</div>' +
      '</div>' +
      '<div class="masthead-strip" aria-hidden="true"><div class="masthead-strip-fill" id="masthead-strip-fill" style="width:' + progressPct + '%"></div></div>' +
    '</header>';

  // Animate the progress strip + ring from their previous values (React did this via transitions)
  const strip = $('#masthead-strip-fill');
  if (lastSnap.mastheadDone !== doneCount && strip) {
    const prevPct = ids.length > 0 ? Math.round((lastSnap.mastheadDone / ids.length) * 100) : 0;
    strip.style.width = prevPct + '%';
    forceReflow(strip);
    strip.style.width = progressPct + '%';
  }
  lastSnap.mastheadDone = doneCount;

  const ring = $('.score-ring-fg', slot);
  if (ring && lastSnap.scorePct !== score.pct) {
    const C = parseFloat(ring.getAttribute('data-ring-c'));
    ring.style.strokeDashoffset = C * (1 - lastSnap.scorePct / 100);
    forceReflow(ring);
    ring.style.strokeDashoffset = C * (1 - score.pct / 100);
  }
  lastSnap.scorePct = score.pct;
}

function forceReflow(el) {
  void el.getBoundingClientRect();
}

/* ================================ section nav ================================ */

function renderNav() {
  const s = store.state;
  if (!s) return;
  const slot = $('#nav-slot');
  if (!slot) return;
  const ids = objectiveIds(s.mode);
  const doneCount = ids.filter(function (id) { return s.objectives[id] && s.objectives[id].done; }).length;
  const examUnlocked = s.mode === 'hard' || allObjectivesDone(s);

  const tabs = SECTIONS.map(function (sec, i) {
    const active = s.section === sec.id;
    const locked = sec.id === 'exam' && !examUnlocked;
    return '' +
      '<button type="button" data-action="nav-section" data-section="' + sec.id + '"' +
        ' class="nav-tab' + (active ? ' nav-tab-active' : '') + '"' +
        (active ? ' aria-current="page"' : '') +
        ' aria-label="' + esc(sec.label + (locked ? ' (locked until objectives complete)' : '')) + '">' +
        ic(sec.icon, 'h-4 w-4') +
        '<span class="nav-tab-num">' + String(i + 1).padStart(2, '0') + '</span>' +
        sec.label +
        (locked ? ic('lock', 'nav-lock') : '') +
      '</button>';
  }).join('');

  slot.innerHTML =
    '<nav class="section-nav" aria-label="Lab sections">' +
      '<div class="section-nav-inner">' + tabs +
        '<button type="button" data-action="scroll-ledger" class="nav-ledger-shortcut" aria-label="Scroll to audit checklist">' +
          'Checklist ' + doneCount + '/' + ids.length +
        '</button>' +
      '</div>' +
    '</nav>';
}

/* ================================ stage router ================================ */

function renderStage() {
  const s = store.state;
  if (!s) return;
  const slot = $('#stage-slot');
  if (!slot) return;

  const stageKey = s.section + ':' + s.deskTab;
  const fresh = lastSnap.stageKey !== stageKey;
  lastSnap.stageKey = stageKey;

  if (s.section === 'exam') {
    if (fresh) QuizView.mount();
    QuizView.render(fresh);
    return;
  }

  let inner = '';
  if (s.section === 'briefing') inner = briefingHTML();
  else if (s.section === 'core') inner = knowledgeCoreHTML();
  else if (s.section === 'notes') inner = debriefHTML();
  else if (s.section === 'desk') inner = deskHTML(fresh);

  slot.innerHTML = '<div class="' + (fresh ? 'stage-anim' : '') + '">' + inner + '</div>';

  if (s.section === 'desk' && s.deskTab === 'estate') animateCoverageBars(fresh);
}

/* ================================ briefing ================================ */

function briefingHTML() {
  const terms = ['Mitigation', 'Coverage gap', 'Compensating control', 'Residual risk'].map(function (t) {
    const g = glossaryTerm(t);
    return termHTML(g.term, g.def);
  }).join(' · ');

  return '' +
    '<div class="doc-heading">' +
      '<div class="doc-heading-code">Section 01 · Case File</div>' +
      '<h2 class="doc-heading-title">' + esc(BRIEFING.title) + '</h2>' +
      '<p class="doc-heading-sub">Defense Controls Audit — engagement briefing</p>' +
    '</div>' +
    '<article class="doc-card">' +
      '<div class="doc-banner">' +
        '<span class="doc-banner-label">' + ic('shield-alert', 'h-3.5 w-3.5') + ' ' + esc(BRIEFING.classification) + '</span>' +
        stampHTML('Opened', 'amber', 'sm') +
      '</div>' +
      '<div class="doc-body">' +
        BRIEFING.narrative.map(function (p) {
          return '<p class="briefing-narrative">' + esc(p) + '</p>';
        }).join('') +
        '<div class="client-card">' +
          '<div class="client-card-label">' + ic('building-2', 'h-3.5 w-3.5') + ' The client</div>' +
          '<p class="client-card-body"><span class="client-card-name">' + CLIENT_NAME + '</span> — mid-size freight operator: 14 sites, a flat routed network, an internet-facing quoting portal built a decade ago, WPA2-PSK wireless, and a security stack assembled one purchase order at a time. No security staff; IT generalists run the estate. <span class="client-card-note">Fictional organization — any resemblance to a real company is coincidental.</span></p>' +
        '</div>' +
        '<div>' +
          '<div class="mini-label">' + ic('list-checks', 'h-3.5 w-3.5') + ' Engagement scope</div>' +
          '<ol class="scope-grid">' +
            BRIEFING.scope.map(function (sc, i) {
              return '<li class="scope-item"><span class="scope-num">' + String(i + 1).padStart(2, '0') + '</span>' + esc(sc) + '</li>';
            }).join('') +
          '</ol>' +
        '</div>' +
        '<div class="exam-note">' +
          '<div class="exam-note-label">' + ic('graduation-cap', 'h-3.5 w-3.5') + ' Certification relevance</div>' +
          '<p class="exam-note-body">' + esc(BRIEFING.examRelevance) + '</p>' +
        '</div>' +
        '<p class="briefing-terms">Key terms you will use today: ' + terms + ' — the full 14-term glossary lives in the Knowledge Core.</p>' +
        '<div class="doc-footer-row">' +
          '<button type="button" class="btn btn-primary" data-action="goto-section" data-section="core">Review the method ' + ic('arrow-right', 'h-4 w-4') + '</button>' +
        '</div>' +
      '</div>' +
    '</article>';
}

/* ================================ knowledge core ================================ */

function knowledgeCoreHTML() {
  const gDepth = glossaryTerm('Defense in depth');
  const gGap = glossaryTerm('Coverage gap');
  const gComp = glossaryTerm('Compensating control');

  const methodCards = METHOD_STEPS.map(function (st) {
    return '' +
      '<div class="method-card">' +
        '<div class="method-card-head"><span class="method-num">' + st.n + '</span>' +
        '<h3 class="method-title">' + esc(st.title) + '</h3></div>' +
        '<p class="method-body">' + esc(st.body) + '</p>' +
      '</div>';
  }).join('');

  const principleCard =
    '<div class="principle-card">' +
      '<div class="principle-head">' + ic('shield-half', 'h-4 w-4') + '<h3 class="method-title">The one principle</h3></div>' +
      '<p class="method-body">' + termHTML(gDepth.term, gDepth.def) + ' + verification: layers overlap, and each layer is proven with evidence. A control you cannot verify is a ' + termHTML(gGap.term, gGap.def) + ' wearing a green badge.</p>' +
    '</div>';

  const mitreCells = MITRE_TABLE.map(function (m) {
    return '<div class="mitre-cell"><span class="mitre-mid">' + m.mid + '</span><span class="mitre-name">' + esc(m.name) + '</span></div>';
  }).join('');

  const examples = REAL_EXAMPLES.map(function (e) {
    return '' +
      '<div class="example-card">' +
        '<div class="example-head"><h3 class="method-title">' + esc(e.title) + '</h3>' +
        '<span class="example-classes">' + esc(e.classes) + '</span></div>' +
        '<p class="method-body">' + esc(e.body) + '</p>' +
      '</div>';
  }).join('');

  const glossary = GLOSSARY.map(function (g) {
    return '' +
      '<details class="glossary-item">' +
        '<summary class="glossary-term">' + esc(g.term) + ic('chevron-down', 'glossary-chevron') + '</summary>' +
        '<p class="glossary-def">' + esc(g.def) + '</p>' +
      '</details>';
  }).join('');

  return '' +
    '<div class="doc-heading">' +
      '<div class="doc-heading-code">Section 02 · Knowledge Core</div>' +
      '<h2 class="doc-heading-title">The Mitigation→Attack Checklist Method</h2>' +
      '<p class="doc-heading-sub">What Lesson 14.3 teaches, how the mapping works mechanically, and why it beats ad-hoc security spending</p>' +
    '</div>' +
    '<div class="core-stack">' +
      '<section class="doc-card card-pad" aria-label="The five-step method">' +
        '<div class="mini-label">' + ic('book-marked', 'h-3.5 w-3.5') + ' The method in five moves</div>' +
        '<div class="method-grid">' + methodCards + principleCard + '</div>' +
      '</section>' +
      '<section class="doc-card card-pad" aria-label="Worked example of mapping logic">' +
        '<div class="mini-label">How to think about a mapping row</div>' +
        '<p class="core-para">Take <span class="core-strong">credential attacks</span> (T1110): the attacker&apos;s goal is a valid login. So the checklist answers three questions — <em>make the guess worthless</em> (MFA, M1032), <em>shrink the guessable space</em> (password policy, M1027), <em>throttle the guessing</em> (lockout, M1036), and <em>stop hash reuse</em> (credential protection, M1043). Every correct mapping row reads like this: control ↔ the specific mechanic of the attack it breaks.</p>' +
        '<p class="core-para">The two classic mistakes the exam loves: <span class="core-strong">over-mapping</span> — &quot;DLP defends against SQLi&quot; (it limits exfiltration, it does not prevent the injection), and <span class="core-strong">under-mapping</span> — forgetting that ' + termHTML(gComp.term, gComp.def) + 's like a WAF belong on the map even though they are not the root-cause fix.</p>' +
      '</section>' +
      '<section class="doc-card card-pad" aria-label="MITRE mitigation ID reference">' +
        '<div class="mini-label">' + ic('landmark', 'h-3.5 w-3.5') + ' ATT&amp;CK mitigation IDs you will meet today</div>' +
        '<p class="core-small">Controls that are secure-SDLC practices (input validation, parameterized queries, output encoding) have no formal M-ID — ATT&amp;CK mitigations live in the operational layer. They are labeled &quot;SDLC practice&quot; or &quot;cf. M-xxxx&quot; in this lab (simplified mapping, per the official source).</p>' +
        '<div class="mitre-grid">' + mitreCells + '</div>' +
      '</section>' +
      '<section class="doc-card card-pad" aria-label="Real-world examples">' +
        '<div class="mini-label">When the checklist was ignored</div>' +
        '<div class="example-grid">' + examples + '</div>' +
      '</section>' +
      '<section class="doc-card card-pad" aria-label="Glossary">' +
        '<div class="mini-label">Glossary — 14 terms</div>' +
        '<div class="glossary-list">' + glossary + '</div>' +
      '</section>' +
      '<div class="doc-footer-row">' +
        '<button type="button" class="btn btn-primary" data-action="goto-section" data-section="desk">Open the Audit Desk ' + ic('arrow-right', 'h-4 w-4') + '</button>' +
      '</div>' +
    '</div>';
}

/* ================================ audit desk ================================ */

function deskHTML(fresh) {
  const s = store.state;
  const deskTabs = DESK_TABS.map(function (t) {
    const active = s.deskTab === t.id;
    return '' +
      '<button type="button" role="tab" aria-selected="' + (active ? 'true' : 'false') + '" data-action="desk-tab" data-tab="' + t.id + '"' +
        ' class="desk-tab' + (active ? ' desk-tab-active' : '') + '">' + t.label + '</button>';
  }).join('');

  let panel = '';
  if (s.deskTab === 'register') panel = registerHTML(fresh);
  else if (s.deskTab === 'matrix') panel = matrixHTML(fresh);
  else panel = estateHTML(fresh);

  return '' +
    '<div class="desk-tabs" role="tablist" aria-label="Audit desk workspaces">' + deskTabs + '</div>' +
    panel;
}

/* ---------- Register ---------- */

function attackClassCardsHTML() {
  const s = store.state;
  return '<section aria-label="Attack class register"><div class="attack-grid">' +
    ATTACK_CLASSES.map(function (c, i) {
      const mapped = (s.env.selected[c.id] || []).length;
      return '' +
        '<div class="attack-card' + (s.env.focusedClass === c.id ? ' attack-card-focused' : '') + '" style="animation-delay:' + (i * 0.03) + 's">' +
          '<div class="attack-card-head">' +
            '<div class="attack-card-title">' +
              '<span class="attack-card-icon">' + ic(c.icon, 'attack-icon') + '</span>' +
              '<h3 class="attack-card-name">' + esc(c.name) + '</h3>' +
            '</div>' +
            badge(mapped + ' marked', 'badge-line') +
          '</div>' +
          '<p class="attack-card-def">' + esc(c.definition) + '</p>' +
          '<div class="attack-card-variants">' +
            c.variants.map(function (v) { return badge(esc(v), 'badge-soft'); }).join('') +
          '</div>' +
          '<div class="attack-card-variants">' +
            c.techniques.map(function (t) { return badge(esc(t), 'badge-purple'); }).join('') +
          '</div>' +
          '<p class="attack-card-chain">' + ic('triangle-alert', 'chain-icon') +
            '<span><span class="chain-strong">Chain position:</span> ' + esc(c.chainNote) + '</span></p>' +
          '<div class="attack-card-foot">' +
            '<button type="button" class="btn btn-outline btn-sm attack-focus-btn" data-action="focus-class" data-class="' + c.id + '">' +
              ic('target', 'h-3.5 w-3.5') + ' Map its checklist in the Matrix</button>' +
          '</div>' +
        '</div>';
    }).join('') +
  '</div></section>';
}

function registerHTML(fresh) {
  const s = store.state;
  const isHard = s.mode === 'hard';
  let html = '' +
    '<div class="doc-heading">' +
      '<div class="doc-heading-code">Section 03 · Audit Desk — Register</div>' +
      '<h2 class="doc-heading-title">Client Attack Register</h2>' +
      '<p class="doc-heading-sub">' +
        (isHard
          ? 'Hard mode: the register carries live evidence. Triage before you map.'
          : 'The eight attack classes at Meridian, with their MITRE chain positions.') +
      '</p>' +
    '</div>';

  const blocks = [];

  if (isHard) {
    // Workbench 1 · Incident feed (OBJ-H1)
    const incidentRows = INCIDENTS.map(function (inc) {
      const checked = s.env.incidents.indexOf(inc.id) !== -1;
      const sevCls = inc.sev === 'high' ? 'sev-high' : inc.sev === 'medium' ? 'sev-medium' : 'sev-info';
      return '' +
        '<div class="incident-row' + (checked ? ' incident-row-flagged' : '') + '">' +
          '<div class="incident-flex">' +
            checkboxHTML('inc-' + inc.id, checked, 'Flag brief ' + inc.id + ' as active hostile activity',
              'data-action-change="env-list" data-path="incidents" data-value="' + inc.id + '"') +
            '<div class="incident-main">' +
              '<label for="inc-' + inc.id + '" class="incident-text">' + esc(inc.text) + '</label>' +
              '<div class="incident-meta">' +
                badge('sev ' + inc.sev, 'badge-outline ' + sevCls) +
                '<span class="incident-id">' + inc.id.toUpperCase() + '</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>';
    }).join('');

    blocks.push(workbenchHTML('radio', 'Workbench 1 · Incident Feed — last 30 days',
      'Six briefs from the client&apos;s monitoring stack. Flag exactly the briefs showing <span class="text-strong">confirmed current hostile activity</span> — successes, live exploitation, or active C2. (OBJ-H1)',
      '<div class="stack-2half">' + incidentRows + '</div>'));
  } else {
    // Match-up tray (OBJ-M1)
    const trayRows = ATTACK_CLASSES.map(function (c) {
      return '' +
        '<div class="matchup-card">' +
          '<div class="matchup-head">' + ic(c.icon, 'h-4 w-4 matchup-icon') + '<span class="matchup-name">' + esc(c.name) + '</span></div>' +
          selectHTML({
            fid: 'matchup-' + c.id,
            value: s.env.matched[c.id] || '',
            placeholder: 'Select the matching definition…',
            ariaLabel: 'Definition for ' + c.name,
            options: DEF_OPTION_ORDER.map(function (optId) {
              const oc = ATTACK_CLASSES.find(function (x) { return x.id === optId; });
              return { value: optId, label: oc.definition };
            }),
            dataAttrs: 'data-action-change="env-set" data-path="matched.' + c.id + '"',
          }) +
        '</div>';
    }).join('');

    blocks.push('' +
      '<div class="card">' +
        '<div class="card-pad">' +
          '<div class="mini-label">' + ic('clipboard-list', 'h-3.5 w-3.5') + ' Match-up Tray · OBJ-M1</div>' +
          '<p class="workbench-task">Pick the correct definition for each attack class. The tray holds all eight, shuffled.</p>' +
          '<div class="matchup-grid">' + trayRows + '</div>' +
        '</div>' +
      '</div>');
  }

  blocks.push(attackClassCardsHTML());

  if (isHard) {
    // Workbench 2 · Claims Review (OBJ-H3)
    const claims = CLAIMS.map(function (cl) {
      const cur = s.env.claims[cl.id] || '';
      return '' +
        '<div class="wb-row">' +
          '<p class="wb-row-text">&ldquo;' + esc(cl.text) + '&rdquo;</p>' +
          '<div class="radio-group-inline" role="radiogroup" aria-label="Verdict for claim: ' + esc(cl.text) + '">' +
            radioHTML('claim-' + cl.id, 'accept', cur, 'Accept as true', cl.id + '-a', 'radio-accept', 'data-action-change="env-set" data-path="claims.' + cl.id + '"') +
            radioHTML('claim-' + cl.id, 'reject', cur, 'Reject', cl.id + '-r', 'radio-reject', 'data-action-change="env-set" data-path="claims.' + cl.id + '"') +
          '</div>' +
        '</div>';
    }).join('');
    blocks.push(workbenchHTML('gavel', 'Workbench 2 · Claims Review',
      'IT management defends its malware posture. Accept the true claims, reject the two overstatements. (OBJ-H3)',
      '<div class="stack-2half">' + claims + '</div>'));

    // Workbench 3 · Remediation Board (OBJ-H4)
    const phaseRows = PHASE_ITEMS.map(function (p) {
      return '' +
        '<div class="wb-row wb-row-split">' +
          '<p class="wb-row-text">' + esc(p.text) + '</p>' +
          selectHTML({
            fid: 'phase-' + p.id,
            value: s.env.phases[p.id] || '',
            placeholder: 'Assign phase…',
            ariaLabel: 'Phase for: ' + p.text,
            className: 'select-w56',
            options: PHASES.map(function (ph) { return { value: ph.id, label: ph.label }; }),
            dataAttrs: 'data-action-change="env-set" data-path="phases.' + p.id + '"',
          }) +
        '</div>';
    }).join('');
    const phaseHints = PHASES.map(function (ph) {
      return '<p class="phase-hint"><span class="phase-hint-label">' + esc(ph.label.split(' (')[0]) + ':</span> ' + esc(ph.hint) + '</p>';
    }).join('');
    blocks.push(workbenchHTML('workflow', 'Workbench 3 · Remediation Board',
      'Six approved work orders. Assign each to its phase: configuration-only fixes stop bleeding immediately; code and procurement are sprints; architecture is a program. (OBJ-H4)',
      '<div class="stack-2half">' + phaseRows + '<div class="phase-hints">' + phaseHints + '</div></div>'));

    // Workbench 4 · Verification Matrix (OBJ-H5)
    const verifyRows = VERIFY_CONTROLS.map(function (cid) {
      const c = CONTROL_MAP[cid];
      return '' +
        '<div class="wb-row wb-row-split">' +
          '<div class="wb-row-main">' +
            '<p class="verify-name">' + esc(c.name) + '</p>' +
            '<p class="verify-mid">' + esc(c.mid) + '</p>' +
          '</div>' +
          selectHTML({
            fid: 'verify-' + cid,
            value: s.env.verify[cid] || '',
            placeholder: 'Select the proving evidence…',
            ariaLabel: 'Verification evidence for ' + c.name,
            className: 'select-w26',
            options: VERIFY_EVIDENCE.map(function (e) { return { value: e.id, label: e.text }; }),
            dataAttrs: 'data-action-change="env-set" data-path="verify.' + cid + '"',
          }) +
        '</div>';
    }).join('');
    blocks.push(workbenchHTML('eye', 'Workbench 4 · Verification Matrix',
      'Match each deployed control to the evidence that proves it works — the log or report that would visibly change if the control silently failed. (OBJ-H5)',
      '<div class="stack-2half">' + verifyRows + '</div>'));

    // Workbench 5 · Budget Triage (OBJ-H6)
    const activeNames = BUDGET_ACTIVE_CLASSES.map(function (a) {
      const c = ATTACK_CLASSES.find(function (x) { return x.id === a; });
      return c ? c.short : a;
    }).join(' · ');
    const budgetRows = BUDGET_CANDIDATES.map(function (b) {
      const c = CONTROL_MAP[b.id];
      const checked = s.env.budget.indexOf(b.id) !== -1;
      const full = s.env.budget.length >= 3 && !checked;
      return '' +
        '<div class="budget-row' + (checked ? ' budget-row-checked' : '') + '">' +
          checkboxHTML('bud-' + b.id, checked, 'Fund ' + c.name,
            'data-action-change="env-list" data-path="budget" data-value="' + b.id + '"', full) +
          '<div>' +
            '<label for="bud-' + b.id + '" class="budget-label' + (full ? ' budget-label-full' : '') + '">' + esc(c.name) +
              (checked ? ' <span class="budget-count">· funded ' + s.env.budget.length + '/3</span>' : '') + '</label>' +
            '<p class="budget-note">' + esc(b.note) + '</p>' +
          '</div>' +
        '</div>';
    }).join('');
    const rationales = BUDGET_RATIONALES.map(function (r) {
      return radioHTML('budget-why', r.id, s.env.budgetWhy || '', esc(r.text), 'why-' + r.id, 'radio-block', 'data-action-change="env-set" data-path="budgetWhy"');
    }).join('');
    blocks.push(workbenchHTML('flag', 'Workbench 5 · Budget Triage',
      'Only three of six candidates get funded this quarter. Cover the classes under active attack (' + activeNames + ') — root-cause fixes beat compensating layers. (OBJ-H6)',
      '<div class="budget-grid">' + budgetRows + '</div>' +
      '<div class="wb-sep"></div>' +
      '<p class="mini-label">Justification (select one)</p>' +
      '<div class="radio-group-stack" role="radiogroup" aria-label="Budget justification">' + rationales + '</div>'));

    // Workbench 6 · MITRE Crosswalk (OBJ-H8)
    const crosswalkRows = CROSSWALK_ITEMS.map(function (x) {
      return '' +
        '<div class="wb-row wb-row-split">' +
          '<p class="wb-row-text">' + esc(x.text) + '</p>' +
          selectHTML({
            fid: 'xwalk-' + x.id,
            value: s.env.crosswalk[x.id] || '',
            placeholder: 'T-…',
            ariaLabel: 'Technique ID for: ' + x.text,
            className: 'select-w44',
            mono: true,
            options: CROSSWALK_OPTIONS.map(function (t) { return { value: t, label: t }; }),
            dataAttrs: 'data-action-change="env-set" data-path="crosswalk.' + x.id + '"',
          }) +
        '</div>';
    }).join('');
    blocks.push(workbenchHTML('landmark', 'Workbench 6 · MITRE Crosswalk',
      'Translate each artifact into its ATT&amp;CK technique ID — the language your detections and threat intel will use. (OBJ-H8)',
      '<div class="stack-2half">' + crosswalkRows + '</div>'));

    // Workbench 7 · Audit Sign-off (OBJ-H9)
    const riskRadios = RESIDUAL_OPTIONS.map(function (r) {
      return radioHTML('sign-risk', r.id, s.env.signRisk || '', esc(r.text), 'sr-' + r.id, 'radio-block', 'data-action-change="env-set" data-path="signRisk"');
    }).join('');
    blocks.push(workbenchHTML('scroll-text', 'Workbench 7 · Audit Sign-off',
      'Three parts: the residual-risk statement, the first verification you will run, and the segmentation M-ID from memory. (OBJ-H9)',
      '<div class="stack-4">' +
        '<div>' +
          '<p class="mini-label">Part 1 — Residual risk statement</p>' +
          '<div class="radio-group-stack" role="radiogroup" aria-label="Residual risk statement">' + riskRadios + '</div>' +
        '</div>' +
        '<div>' +
          '<p class="mini-label">Part 2 — First verification to run</p>' +
          selectHTML({
            fid: 'sign-verify',
            value: s.env.signVerify || '',
            placeholder: 'Select the first verification…',
            ariaLabel: 'First verification to run',
            options: SIGNOFF_VERIFY_OPTIONS.map(function (o) { return { value: o.id, label: o.text }; }),
            dataAttrs: 'data-action-change="env-set" data-path="signVerify"',
          }) +
        '</div>' +
        '<div>' +
          '<p class="mini-label">Part 3 — MITRE mitigation ID for Network Segmentation</p>' +
          '<input type="text" id="sign-mid" class="input input-mono input-mid" data-fid="sign-mid" value="' + esc(s.env.signMid) + '"' +
            ' placeholder="M-…" aria-label="MITRE mitigation ID for Network Segmentation" data-env-path="signMid" data-silent="1" />' +
        '</div>' +
      '</div>'));
  }

  html += blocks.map(function (b, i) { return '<div class="stack-block' + (fresh ? ' fade-up" style="animation-delay:' + (i * 0.05) + 's"' : '"') + '>' + b + '</div>'; }).join('');
  return html;
}

function workbenchHTML(iconName, code, task, body) {
  return '' +
    '<div class="card">' +
      '<div class="card-pad">' +
        '<div class="workbench-code">' + ic(iconName, 'h-3.5 w-3.5') + ' ' + code + '</div>' +
        '<p class="workbench-task">' + task + '</p>' +
        body +
      '</div>' +
    '</div>';
}

/* ---------- Checklist Matrix ---------- */

function matrixHTML(fresh) {
  const s = store.state;
  const isMedium = s.mode === 'medium';
  const focused = ATTACK_CLASSES.find(function (c) { return c.id === s.env.focusedClass; }) || ATTACK_CLASSES[0];
  const selected = s.env.selected[focused.id] || [];
  const grid = mappingGrid(s.env.selected);

  // Focus tabs
  const focusTabs = ATTACK_CLASSES.map(function (c) {
    const active = s.env.focusedClass === c.id;
    const marked = (s.env.selected[c.id] || []).length;
    return '' +
      '<button type="button" role="tab" aria-selected="' + (active ? 'true' : 'false') + '" data-action="focus-class" data-class="' + c.id + '"' +
        ' class="focus-tab' + (active ? ' focus-tab-active' : '') + '">' +
        ic(c.icon, 'h-4 w-4') + c.short +
        (marked > 0 ? '<span class="focus-tab-count' + (active ? ' focus-tab-count-active' : '') + '">' + marked + '</span>' : '') +
      '</button>';
  }).join('');

  // Checklist panel grouped by family
  const familyBlocks = FAMILIES.map(function (fam) {
    const famControls = CONTROLS.filter(function (c) { return c.family === fam; });
    return '' +
      '<div>' +
        '<div class="fam-label">' + ic(familyIcon(fam), 'h-3.5 w-3.5') + ' ' + fam + '</div>' +
        '<div class="fam-grid">' +
          famControls.map(function (c) {
            const on = selected.indexOf(c.id) !== -1;
            return '' +
              '<button type="button" aria-pressed="' + (on ? 'true' : 'false') + '" title="' + esc(c.desc) + '"' +
                ' data-fid="ctl-' + focused.id + '-' + c.id + '"' +
                ' data-action="toggle-control" data-class="' + focused.id + '" data-control="' + c.id + '"' +
                ' class="control-toggle' + (on ? ' control-toggle-on' : '') + '">' +
                '<span class="control-toggle-name' + (on ? ' control-toggle-name-on' : '') + '">' + esc(c.name) + '</span>' +
                '<span class="control-toggle-mid' + (on ? ' control-toggle-mid-on' : '') + '">' + esc(c.mid) + '</span>' +
              '</button>';
          }).join('') +
        '</div>' +
      '</div>';
  }).join('');

  // Completeness grid
  const gridRows = ATTACK_CLASSES.map(function (c) {
    const row = grid[c.id];
    const marked = (s.env.selected[c.id] || []).length;
    return '' +
      '<tr class="' + (s.env.focusedClass === c.id ? 'grid-row-focused' : '') + '">' +
        '<th scope="row" class="grid-row-head"><span class="grid-row-name">' + ic(c.icon, 'h-3.5 w-3.5 grid-row-icon') + c.short + '</span></th>' +
        FAMILIES.map(function (f) {
          return '<td class="grid-cell"><span class="grid-dot' + (row[f] ? ' grid-dot-on' : '') + '" aria-label="' + (row[f] ? 'mapped' : 'not mapped') + '"></span></td>';
        }).join('') +
        '<td class="grid-cell grid-cell-count">' + marked + '</td>' +
      '</tr>';
  }).join('');

  const famHeads = FAMILIES.map(function (f) {
    return '<th scope="col" class="grid-th">' + f + '</th>';
  }).join('');

  let html = '' +
    '<div class="doc-heading">' +
      '<div class="doc-heading-code">Section 03 · Audit Desk — Checklist Matrix</div>' +
      '<h2 class="doc-heading-title">Mitigation → Attack Mapping</h2>' +
      '<p class="doc-heading-sub">' +
        (isMedium
          ? 'Mark every control that defends the focused class — and nothing that doesn’t. Expected counts are shown in Guided mode.'
          : 'No counts, no pointers. You know the method — build the full map. The CHECK in your Ledger audits all eight classes at once.') +
      '</p>' +
    '</div>' +
    '<div class="focus-tabs" role="tablist" aria-label="Focus an attack class">' + focusTabs + '</div>' +

    '<div class="card"><div class="card-pad">' +
      '<div class="dossier-head">' +
        '<span class="dossier-icon">' + ic(focused.icon, 'dossier-icon-svg') + '</span>' +
        '<div>' +
          '<h2 class="dossier-title">' + esc(focused.name) + '</h2>' +
          '<div class="dossier-techniques">' + focused.techniques.map(function (t) { return badge(esc(t), 'badge-purple'); }).join('') + '</div>' +
        '</div>' +
      '</div>' +
      '<p class="dossier-chain"><span class="chain-strong">Chain position:</span> ' + esc(focused.chainNote) + '</p>' +
      '<p class="dossier-variants">Variants: ' + esc(focused.variants.join(' · ')) + '</p>' +
    '</div></div>' +

    '<div class="card"><div class="card-pad">' +
      '<div class="checklist-head">' +
        '<div class="mini-label">' + ic('scan-search', 'h-3.5 w-3.5') + ' Prevention checklist — ' + esc(focused.short) + '</div>' +
        '<div class="checklist-count"><span class="checklist-count-num">' + selected.length + '</span> marked' +
          (isMedium ? '<span class="checklist-count-hint">(primary set: ' + focused.primary.length + ')</span>' : '') + '</div>' +
      '</div>' +
      '<p class="workbench-task">Toggle every control whose mechanism defends against this class. A control on the wrong row is false comfort — the audit checks both directions.</p>' +
      '<div class="stack-4">' + familyBlocks + '</div>' +
      (isMedium && focused.id === 'password'
        ? '<div class="mid-recall">' +
            '<label for="mfa-mid" class="mid-recall-label">M-ID recall — enter the ATT&amp;CK mitigation ID for Multi-Factor Authentication (OBJ-M3, part 2)</label>' +
            '<input type="text" id="mfa-mid" class="input input-mono input-mid" data-fid="mfa-mid" value="' + esc(s.env.mfaMid) + '"' +
              ' placeholder="M-…" data-env-path="mfaMid" data-silent="1" />' +
          '</div>'
        : '') +
    '</div></div>';

  // Medium drills
  if (isMedium && focused.id === 'application') {
    html += drillHTML('Variant Drill · OBJ-M4', 'Each application variant is broken by a specific control. Pair them.',
      APP_DRILL, s.env.variantApp, 'variantApp');
  } else if (isMedium && focused.id === 'crypto') {
    html += drillHTML('Variant Drill · OBJ-M6', 'Each cryptographic variant has its own fix. Pair them.',
      CRYPTO_DRILL, s.env.variantCrypto, 'variantCrypto');
  } else if (isMedium && focused.id === 'protocol') {
    html += '' +
      '<div class="card"><div class="card-pad">' +
        '<div class="analyst-label">' + ic('flask-conical', 'h-3.5 w-3.5') + ' Analyst Note · OBJ-M8 (part 2)</div>' +
        '<p class="workbench-task">A workstation shows 4 MB/day of TXT-record queries to ever-changing long subdomains. Which data source exposes this DNS tunneling?</p>' +
        selectHTML({
          fid: 'dns-source',
          value: s.env.dnsSource || '',
          placeholder: 'Select the evidence source…',
          ariaLabel: 'Data source that exposes DNS tunneling',
          options: DNS_SOURCE_OPTIONS.map(function (o) { return { value: o.id, label: o.text }; }),
          dataAttrs: 'data-action-change="env-set" data-path="dnsSource"',
        }) +
      '</div></div>';
  }

  html += '' +
    '<div class="card"><div class="card-pad">' +
      '<div class="mini-label">' + ic('scan-search', 'h-3.5 w-3.5') + ' Mapping completeness — your checklist at a glance</div>' +
      '<p class="core-small">A lit cell means you mapped at least one control of that family against that class. Rows that stay dark across the board are classes you haven&apos;t mapped at all.</p>' +
      '<div class="table-scroll">' +
        '<table class="grid-table" aria-label="Mapping completeness grid">' +
          '<caption class="sr-only">Mapping completeness: attack classes by control family</caption>' +
          '<thead><tr>' +
            '<th scope="col" class="grid-th grid-th-class">Class</th>' + famHeads +
            '<th scope="col" class="grid-th">Marked</th>' +
          '</tr></thead>' +
          '<tbody>' + gridRows + '</tbody>' +
        '</table>' +
      '</div>' +
      '<div class="grid-legend">' +
        '<span class="grid-legend-item"><span class="grid-dot grid-dot-on" aria-hidden="true"></span> mapped</span>' +
        '<span class="grid-legend-item"><span class="grid-dot" aria-hidden="true"></span> not mapped</span>' +
      '</div>' +
    '</div></div>';

  if (isMedium) {
    html += '' +
      '<details class="definition-ref">' +
        '<summary class="definition-ref-summary">Need the definition of the focused class? (reference)</summary>' +
        '<p class="definition-ref-body">' + esc(focused.definition) + '</p>' +
        '<p class="definition-ref-order">Register order: ' +
          DEF_OPTION_ORDER.map(function (id) {
            const c = ATTACK_CLASSES.find(function (x) { return x.id === id; });
            return c ? c.short : id;
          }).join(' → ') + '</p>' +
      '</details>';
  }

  return html;
}

function drillHTML(code, task, drill, envMap, envKey) {
  const s = store.state;
  const rows = drill.variants.map(function (v) {
    return '' +
      '<div class="wb-row wb-row-split">' +
        '<p class="wb-row-text">' + esc(v.text) + '</p>' +
        selectHTML({
          fid: 'drill-' + v.id,
          value: envMap[v.id] || '',
          placeholder: 'Select the control…',
          ariaLabel: 'Control for: ' + v.text,
          className: 'select-w64',
          options: drill.options.map(function (o) {
            const ctl = CONTROL_MAP[o];
            return { value: o, label: ctl ? ctl.name : o };
          }),
          dataAttrs: 'data-action-change="env-set" data-path="' + envKey + '.' + v.id + '"',
        }) +
      '</div>';
  }).join('');
  return (
    '<div class="card"><div class="card-pad">' +
      '<div class="drill-label">' + ic('flask-conical', 'h-3.5 w-3.5') + ' ' + code + '</div>' +
      '<p class="workbench-task">' + task + '</p>' +
      '<div class="stack-2half">' + rows + '</div>' +
    '</div></div>'
  );
}

/* ---------- Estate ---------- */

function estateHTML(fresh) {
  const s = store.state;
  const isHard = s.mode === 'hard';
  const cov = allCoverage(s.env.estate);
  const worst = worstClassOf(s.env.estate);

  function stampFor(pct) {
    if (pct >= 75) return stampHTML('Satisfactory', 'green', 'sm');
    if (pct >= 40) return stampHTML('Partial', 'amber', 'sm');
    return stampHTML('Gap found', 'red', 'sm');
  }

  let html = '' +
    '<div class="doc-heading">' +
      '<div class="doc-heading-code">Section 03 · Audit Desk — Estate</div>' +
      '<h2 class="doc-heading-title">Meridian Live Control Estate</h2>' +
      '<p class="doc-heading-sub">' +
        (isHard
          ? 'Deployed controls with real configuration. Trust nothing — inspect everything. (OBJ-H7)'
          : 'What the client actually runs today. Score it, find the gap, fix it, verify.') +
      '</p>' +
    '</div>';

  // Scan card
  html += '' +
    '<div class="card card-accent"><div class="scan-row">' +
      '<div>' +
        '<h2 class="scan-title">Coverage Scan</h2>' +
        '<p class="scan-sub">Scores every class: deployed controls ÷ its prevention checklist. ' +
          (s.env.scanRun > 0 ? '<span class="scan-runs">runs: ' + s.env.scanRun + '</span>' : '') + '</p>' +
      '</div>' +
      '<button type="button" class="btn btn-primary" data-action="run-scan">' + ic('scan-search', 'h-4 w-4') +
        (s.env.scanRun === 0 ? ' Run Coverage Scan' : ' Re-run Coverage Scan') + '</button>' +
    '</div></div>';

  // Coverage results
  if (s.env.scanRun > 0) {
    const worstPct = classCoverage(worst, s.env.estate).pct;
    const rows = ATTACK_CLASSES.map(function (c) {
      const r = cov[c.id];
      return '' +
        '<div class="cov-row' + (c.id === worst ? ' cov-row-worst' : '') + '">' +
          '<div class="cov-row-head">' +
            '<span class="cov-row-name">' + esc(c.name) +
              (c.id === worst ? badge('worst', 'badge-worst') : '') + '</span>' +
            '<span class="cov-row-right"><span class="cov-row-pct">' + r.pct + '%</span>' + stampFor(r.pct) + '</span>' +
          '</div>' +
          coverageBarHTML(r.pct) +
          '<p class="cov-row-detail">' +
            (r.missing.length === 0
              ? '<span class="cov-full">Full primary checklist deployed' + (r.have.length ? '' : ' (acceptable layers only)') + '</span>'
              : 'Missing: ' + r.missing.map(function (m) { return esc(CONTROL_MAP[m] ? CONTROL_MAP[m].name : m); }).join(' · ') +
                (r.have.length > 0 ? ' — deployed: ' + r.have.map(function (h) { return esc(CONTROL_MAP[h] ? CONTROL_MAP[h].name : h); }).join(' · ') : '')) +
          '</p>' +
        '</div>';
    }).join('');

    html += '' +
      '<div class="fade-up"><div class="card"><div class="card-pad">' +
        '<div class="cov-head">' +
          '<h2 class="scan-title">Coverage by attack class</h2>' +
          (worstPct < 75 ? stampHTML('Gaps found', 'red', 'md') : stampHTML('Satisfactory', 'green', 'md')) +
        '</div>' +
        '<div class="stack-3">' + rows + '</div>' +
        (!isHard
          ? '<div class="audit-finding">' +
              '<p class="mini-label gold">Audit finding · OBJ-M10 — name the worst-covered attack class</p>' +
              selectHTML({
                fid: 'worst-class',
                value: s.env.worstClass || '',
                placeholder: 'Select the class with the lowest coverage…',
                ariaLabel: 'Worst-covered attack class',
                options: ATTACK_CLASSES.map(function (c) { return { value: c.id, label: c.name }; }),
                dataAttrs: 'data-action-change="env-set" data-path="worstClass"',
              }) +
            '</div>'
          : '') +
      '</div></div></div>';
  }

  // Deployed controls
  const familyRows = FAMILIES.map(function (fam) {
    const rows = CONTROLS.filter(function (c) { return c.family === fam; });
    return '' +
      '<div>' +
        '<div class="fam-label">' + fam + '</div>' +
        '<div class="stack-1half">' +
          rows.map(function (c) {
            const enabled = !!s.env.estate[c.id];
            const flagged = s.env.flagged.indexOf(c.id) !== -1;
            return '' +
              '<div class="estate-row' + (flagged ? ' estate-row-flagged' : enabled ? ' estate-row-enabled' : '') + '">' +
                '<div class="estate-row-top">' +
                  '<div>' +
                    '<p class="estate-row-name">' + esc(c.name) +
                      (flagged ? '<span class="estate-flagged-tag">' + ic('shield-alert', 'h-3 w-3') + ' flagged</span>' : '') + '</p>' +
                    '<p class="estate-row-mid">' + esc(c.mid) + '</p>' +
                  '</div>' +
                  '<div class="estate-row-actions">' +
                    (isHard && enabled
                      ? '<button type="button" class="btn btn-sm ' + (flagged ? 'btn-danger' : 'btn-flag') + '" data-action="flag-toggle" data-control="' + c.id + '"' +
                          ' aria-pressed="' + (flagged ? 'true' : 'false') + '" aria-label="Flag ' + esc(c.name) + ' as not functioning">' +
                          ic('shield-alert', 'h-3.5 w-3.5') + (flagged ? ' Unflag' : ' Flag') + '</button>'
                      : '') +
                    '<span class="estate-status' + (enabled ? ' estate-status-on' : '') + '" aria-hidden="true">' + (enabled ? 'Enabled' : 'Disabled') + '</span>' +
                    switchHTML(enabled, (enabled ? 'Disable ' : 'Enable ') + c.name,
                      'data-action="estate-toggle" data-control="' + c.id + '"') +
                  '</div>' +
                '</div>' +
                '<details class="estate-config">' +
                  '<summary class="estate-config-summary">' + ic('chevron-down', 'h-3.5 w-3.5') + ' Inspect configuration</summary>' +
                  '<p class="estate-config-note">' + esc(c.configNote) + '</p>' +
                  (c.hardBroken === true && isHard
                    ? '<p class="estate-config-judge">(Config shown exactly as the client runs it — judging it is your job, not the panel’s.)</p>'
                    : '') +
                '</details>' +
              '</div>';
          }).join('') +
        '</div>' +
      '</div>';
  }).join('');

  html += '' +
    '<div class="card"><div class="card-pad">' +
      '<div class="mini-label">' + ic('toggle-left', 'h-3.5 w-3.5') + ' Deployed controls</div>' +
      '<p class="workbench-task">' +
        (isHard
          ? 'Every enabled control must be inspected and — if its configuration shows it is not functioning as intended — flagged. Exactly two are broken.'
          : 'Toggle a control to enable it for the client (your approved work orders), then re-run the scan to verify the improvement.') +
      '</p>' +
      '<div class="stack-5">' + familyRows + '</div>' +
    '</div></div>';

  // Medium: residual risk (M12)
  if (!isHard) {
    const residualRadios = RESIDUAL_OPTIONS.map(function (r) {
      return '<div class="residual-row">' +
        radioHTML('residual', r.id, s.env.residual || '', esc(r.text), 'res-' + r.id, '', 'data-action-change="env-set" data-path="residual"') + '</div>';
    }).join('');
    html += '' +
      '<div class="card"><div class="card-pad">' +
        '<div class="mini-label gold">Final audit statement · OBJ-M12</div>' +
        '<p class="workbench-task">Even with every checklist row deployed, the audit report must state the residual risk. Choose the correct statement.</p>' +
        '<div class="radio-group-stack" role="radiogroup" aria-label="Residual risk statement">' + residualRadios + '</div>' +
      '</div></div>';
  }

  return html;
}

/** Animate coverage bars whose pct changed since the previous estate render. */
function animateCoverageBars(fresh) {
  const s = store.state;
  const cov = allCoverage(s.env.estate);
  const bars = $all('#stage-slot .coverage-bar-fill');
  let idx = 0;
  ATTACK_CLASSES.forEach(function (c) {
    const pct = cov[c.id].pct;
    const bar = bars[idx++];
    if (!bar) return;
    const prev = lastSnap.estatePcts[c.id];
    lastSnap.estatePcts[c.id] = pct;
    if (!fresh && prev !== undefined && prev !== pct) {
      bar.style.width = prev + '%';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { bar.style.width = pct + '%'; });
      });
    }
  });
}

/* ================================ field notes (debrief) ================================ */

function debriefHTML() {
  const gMit = glossaryTerm('Mitigation');
  const gRes = glossaryTerm('Residual risk');

  const detectionRows = DETECTION_OPPORTUNITIES.map(function (d) {
    return '' +
      '<tr class="detect-row">' +
        '<td class="detect-src">' + esc(d.source) + '</td>' +
        '<td class="detect-look">' + esc(d.look) + '</td>' +
        '<td class="detect-logic"><code class="detect-code">' + esc(d.example) + '</code></td>' +
      '</tr>';
  }).join('');

  const mitigations = ATTACK_CLASSES.map(function (c) {
    return '' +
      '<div class="reco-card">' +
        '<h3 class="reco-title">' + esc(c.name) + '</h3>' +
        '<ul class="reco-list">' +
          c.primary.map(function (pid) {
            const ctl = CONTROL_MAP[pid];
            return '<li class="reco-item"><span>' + esc(ctl ? ctl.name : pid) + '</span>' +
              badge(esc(ctl ? ctl.mid.split('·')[0].trim() : ''), 'badge-purple badge-sm') + '</li>';
          }).join('') +
        '</ul>' +
      '</div>';
  }).join('');

  const links = LINKS.map(function (l) {
    return '<li><a class="ref-link" href="' + esc(l.href) + '" target="_blank" rel="noopener noreferrer">' + esc(l.label) + ic('arrow-up-right', 'h-4 w-4') + '</a></li>';
  }).join('');

  return '' +
    '<div class="doc-heading">' +
      '<div class="doc-heading-code">Section 05 · Field Notes</div>' +
      '<h2 class="doc-heading-title">Debrief — What You Can Now Do</h2>' +
      '<p class="doc-heading-sub">Detection opportunities, mitigation recommendations with official IDs, and the takeaways both sides of the house want you to keep.</p>' +
    '</div>' +
    '<div class="core-stack">' +
      '<section class="doc-card card-pad" aria-label="Detection opportunities">' +
        '<div class="mini-label teal">' + ic('binoculars', 'h-3.5 w-3.5') + ' Detection opportunities — data sources &amp; example logic</div>' +
        '<div class="table-scroll">' +
          '<table class="detect-table" aria-label="Detection opportunities table">' +
            '<thead><tr>' +
              '<th scope="col" class="detect-th">Data source</th>' +
              '<th scope="col" class="detect-th">What to look for</th>' +
              '<th scope="col" class="detect-th">Example logic (illustrative)</th>' +
            '</tr></thead>' +
            '<tbody>' + detectionRows + '</tbody>' +
          '</table>' +
        '</div>' +
      '</section>' +
      '<section class="doc-card card-pad" aria-label="Mitigation recommendations">' +
        '<div class="mini-label green">' + ic('layers', 'h-3.5 w-3.5') + ' Mitigation recommendations — official ATT&amp;CK IDs</div>' +
        '<div class="reco-grid">' + mitigations + '</div>' +
        '<p class="core-small reco-footnote">IDs are MITRE ATT&amp;CK Enterprise mitigations. &quot;SDLC practice&quot; and &quot;cf.&quot; entries are explicitly labeled simplified mappings (the practice itself has no formal M-ID in ATT&amp;CK).</p>' +
      '</section>' +
      '<div class="takeaway-grid">' +
        '<section class="takeaway takeaway-blue" aria-label="Blue team takeaways">' +
          '<h2 class="takeaway-title">Blue-team takeaways</h2>' +
          '<ul class="takeaway-list">' +
            BLUE_TAKEAWAYS.map(function (t) {
              return '<li class="takeaway-item"><span class="takeaway-dot takeaway-dot-blue" aria-hidden="true"></span>' + esc(t) + '</li>';
            }).join('') +
          '</ul>' +
        '</section>' +
        '<section class="takeaway takeaway-red" aria-label="Red-team mindset takeaways">' +
          '<h2 class="takeaway-title">' + ic('skull', 'h-4 w-4') + ' Red-team mindset</h2>' +
          '<ul class="takeaway-list">' +
            RED_TAKEAWAYS.map(function (t) {
              return '<li class="takeaway-item"><span class="takeaway-dot takeaway-dot-red" aria-hidden="true"></span>' + esc(t) + '</li>';
            }).join('') +
          '</ul>' +
        '</section>' +
      '</div>' +
      '<section class="doc-card card-pad" aria-label="Official references">' +
        '<div class="mini-label">' + ic('scroll-text', 'h-3.5 w-3.5') + ' Official references</div>' +
        '<ul class="ref-grid">' + links + '</ul>' +
        '<p class="core-small">Reminders: ' + termHTML(gMit.term, gMit.def) + ' reduces risk — it never reaches zero, which is why your final report names ' + termHTML(gRes.term, gRes.def) + ' explicitly. All client data in this lab was synthetic.</p>' +
      '</section>' +
    '</div>';
}

/* ================================ ledger (objectives rail) ================================ */

function renderLedger() {
  const s = store.state;
  if (!s) return;
  const slot = $('#ledger-slot');
  if (!slot) return;

  const objectives = OBJECTIVES[s.mode];
  const isMedium = s.mode === 'medium';
  const total = objectives.length;
  const doneCount = objectives.filter(function (o) { return s.objectives[o.id] && s.objectives[o.id].done; }).length;
  const currentIdx = objectives.findIndex(function (o) { return !(s.objectives[o.id] && s.objectives[o.id].done); });
  const score = computeScore(s);
  const canFile = allObjectivesDone(s) && quizComplete(s);

  const items = objectives.map(function (o, idx) {
    const os = s.objectives[o.id];
    if (!os) return '';
    const isCurrent = isMedium && idx === currentIdx;
    let cls = 'obj-item';
    if (os.done) cls += ' obj-done';
    else if (isCurrent) cls += ' obj-current';

    let html = '<li class="' + cls + '"><div class="obj-flex">';
    // Status icon
    if (os.done) html += '<span class="obj-icon" aria-hidden="true">' + ic('circle-check', 'obj-icon-done') + '</span>';
    else if (isCurrent) html += '<span class="obj-icon" aria-hidden="true"><span class="obj-pulse"><span class="obj-dot-current"></span></span></span>';
    else html += '<span class="obj-icon" aria-hidden="true">' + ic('circle', 'obj-icon-todo') + '</span>';

    html += '<div class="obj-main">';
    html += '<div class="obj-tags"><span class="obj-id">' + o.id.replace('OBJ-', '') + '</span>' + pillarBadge(o.pillar) + '</div>';
    html += '<p class="obj-text' + (os.done ? ' obj-text-done' : '') + '">' + esc(o.text) + '</p>';

    if (isMedium && !os.done) {
      html += '<p class="obj-where">' + ic('map-pin', 'h-3 w-3 obj-where-icon') + ' ' + esc(o.where) + '</p>';
    }

    // Result feedback
    if (os.result) {
      html += '' +
        '<div class="obj-result ' + (os.result.pass ? 'obj-result-pass' : 'obj-result-fail') + '">' +
          '<p class="obj-result-title">' + ic(os.result.pass ? 'circle-check' : 'circle-help', 'h-3 w-3') + ' ' + esc(os.result.title) + '</p>' +
          esc(os.result.body) +
        '</div>';
    }

    // Hints
    if (!os.done) {
      const maxHints = isMedium ? 3 : 1;
      const hintRows = o.hints.map(function (h, hi) {
        const unlocked = hi < (isMedium ? os.hintsUsed : Math.min(os.hintsUsed, 1));
        if (isMedium) {
          return unlocked
            ? '<p class="hint-text"><span class="hint-tier">Tier ' + (hi + 1) + ' · ' + HINT_LABELS[hi] + ':</span> ' + esc(h) + '</p>'
            : '<button type="button" class="btn btn-outline btn-sm hint-reveal-btn"' + (hi > os.hintsUsed ? ' disabled' : '') +
                ' data-action="hint-obj" data-obj="' + o.id + '">Reveal tier ' + (hi + 1) + ' (' + HINT_LABELS[hi] + ') — costs 1 pt</button>';
        }
        return unlocked
          ? '<p class="hint-text"><span class="hint-tier">Nudge:</span> ' + esc(h) + '</p>'
          : '<button type="button" class="btn btn-outline btn-sm hint-reveal-btn" data-action="hint-obj" data-obj="' + o.id + '">Reveal the single nudge — costs 1 pt</button>';
      }).join('');

      html += '' +
        '<details class="hints-details">' +
          '<summary class="hints-summary">' + ic('lightbulb', 'h-3.5 w-3.5') +
            (isMedium ? 'Hints' : 'Nudge (−1 pt)') + ic('chevron-down', 'h-3 w-3') + '</summary>' +
          '<div class="hints-box">' + hintRows + '</div>' +
        '</details>';

      html += '<div class="obj-actions">' +
        '<button type="button" class="btn btn-sm btn-check" data-action="check-obj" data-obj="' + o.id + '"' +
          ' aria-label="Check results for ' + o.id + '">' + ic('check', 'h-3.5 w-3.5') + ' Check results</button>' +
        '</div>';
    }

    html += '</div></div></li>';
    return html;
  }).join('');

  slot.innerHTML =
    '<div class="ledger-card" aria-label="Audit checklist — objectives tracker">' +
      '<div class="ledger-pad">' +
        '<div class="ledger-head">' +
          '<h2 class="ledger-title">' + ic('file-check-2', 'h-4 w-4') + ' Audit Checklist</h2>' +
          '<span class="ledger-count">' + doneCount + '/' + total + '</span>' +
        '</div>' +
        '<div class="ledger-bar"><div class="ledger-bar-fill" id="ledger-bar-fill" style="width:' + (total ? (doneCount / total) * 100 : 0) + '%"></div></div>' +
        '<p class="ledger-scoreline">' + score.score + '/' + score.max + ' pts · first-try ' + score.firstTry + '/' + total + ' · hints −' + score.hintPenalty + '</p>' +
        '<ol class="obj-list" aria-label="Objectives">' + items + '</ol>' +
        '<div class="ledger-foot">' +
          (canFile
            ? '<button type="button" class="btn btn-green btn-block" data-action="file-report">' + stampHTML('Ready', 'green', 'sm') + ' File the Final Audit Report</button>'
            : '<button type="button" class="btn btn-outline-green btn-block" data-action="goto-section" data-section="exam">Go to Examination (' + score.quizCorrect + '/' + score.quizCount + ' correct)</button>') +
        '</div>' +
      '</div>' +
    '</div>' +
    (s.mode === 'medium' && !(s.mode === 'hard' || allObjectivesDone(s))
      ? '<p class="exam-unlock-note">Examination unlocks at ' + total + '/' + total + ' objectives — ' + quizQuestions('medium').length + ' questions waiting.</p>'
      : '');

  // Animate the ledger progress bar from its previous value
  const bar = $('#ledger-bar-fill');
  if (bar && lastSnap.ledgerDone !== doneCount) {
    bar.style.width = (total ? (lastSnap.ledgerDone / total) * 100 : 0) + '%';
    forceReflow(bar);
    bar.style.width = (total ? (doneCount / total) * 100 : 0) + '%';
  }
  lastSnap.ledgerDone = doneCount;
}

/* ================================ completion modal ================================ */

/** R8 — Focus areas derived from the student's ACTUAL performance evidence. */
function buildFocusAreas(s) {
  const items = [];
  for (const o of OBJECTIVES[s.mode]) {
    const os = s.objectives[o.id];
    if (!os) continue;
    if (os.attempts > 1) {
      items.push({ topic: o.text, evidence: 'needed ' + os.attempts + ' checks', review: o.where });
    } else if (os.hintsUsed > 0) {
      items.push({ topic: o.text, evidence: 'used ' + os.hintsUsed + ' nudge' + (os.hintsUsed > 1 ? 's' : ''), review: o.where });
    }
  }
  for (const q of quizQuestions(s.mode)) {
    if (s.quizAnswers[q.id] !== undefined && s.quizAnswers[q.id] !== q.answer) {
      const f = QUIZ_FOCUS_MAP[q.id];
      items.push({
        topic: f ? f.topic : q.q.slice(0, 80),
        evidence: 'quiz missed',
        review: f ? f.review : 'Field Notes',
      });
    }
  }
  return items;
}

const PILLARS_ALL = ['Understand', 'Analyze', 'Detect', 'Mitigate'];

function completionModalHTML(s, score) {
  const objectives = OBJECTIVES[s.mode];
  const focusAreas = buildFocusAreas(s);

  const stars = [1, 2, 3, 4, 5].map(function (n) {
    return '<span class="star' + (n <= score.stars ? ' star-on' : '') + '" aria-hidden="true">' + ic('star', 'h-7 w-7', n <= score.stars) + '</span>';
  }).join('');

  const trophyLine =
    score.stars === 5 ? 'Exceptional audit — near-flawless precision, minimal hints.'
    : score.stars >= 4 ? 'Strong audit — the checklist method is yours.'
    : score.stars >= 3 ? 'Solid audit — review the focus areas below.'
    : 'Audit filed — re-run to sharpen accuracy and reduce hints.';

  const focusHTML = focusAreas.length === 0
    ? '<p class="focus-empty">No weak spots recorded: every objective closed on the first check, no nudges were needed, and the quiz was answered cleanly. If you re-run the audit, raise the bar instead — fewer checks, faster recall of the MITRE IDs.</p>'
    : '<ul class="focus-list">' + focusAreas.map(function (f, i) {
        return '' +
          '<li class="focus-item">' +
            '<p class="focus-topic">' + esc(f.topic) + '</p>' +
            '<p class="focus-meta">' + badge(esc(f.evidence), 'badge-focus') +
            ' Review: <span class="focus-review">' + esc(f.review) + '</span></p>' +
          '</li>';
      }).join('') + '</ul>';

  const pillarRecap = PILLARS_ALL.map(function (p) {
    const rows = objectives.filter(function (o) { return o.pillar === p; });
    if (!rows.length) return '';
    return '' +
      '<div class="pillar-recap-card">' +
        '<div class="pillar-recap-head">' + pillarBadge(p) +
        '<span class="pillar-recap-count">' + rows.filter(function (o) { return s.objectives[o.id] && s.objectives[o.id].done; }).length + '/' + rows.length + ' complete</span></div>' +
        '<ul class="pillar-recap-list">' +
          rows.map(function (o) {
            const os = s.objectives[o.id];
            return '<li class="pillar-recap-item">' +
              badge(os && os.done ? 'PASS' : 'OPEN', os && os.done ? 'badge-pass' : 'badge-open') +
              '<span>' + esc(o.text) + '</span></li>';
          }).join('') +
        '</ul>' +
      '</div>';
  }).join('');

  const nextSteps = [
    s.mode === 'medium' ? 'Re-run in Blank-Page Audit (Hard) — the estate hides phantom controls.' : 'Re-run Guided Audit (Medium) to lock the method into muscle memory.',
    'CS0-003 Lesson 14 series: attack indicators and detection concepts.',
    'Read the ATT&CK Mitigations index end-to-end once.',
    'Pick one attack class and map its sub-variants to D3FEND countermeasures.',
  ].map(function (n) {
    return '<li class="next-step-item">' + ic('arrow-right', 'h-3.5 w-3.5 next-step-icon') + esc(n) + '</li>';
  }).join('');

  return '' +
    '<button type="button" class="modal-x" data-action="close-modal" aria-label="Close">' + ic('x', 'h-4 w-4') + '</button>' +
    '<div class="modal-head">' +
      '<div class="modal-stamp-wrap"><span class="stamp stamp-green stamp-lg stamp-spring" aria-label="Stamp: Audit complete">Audit complete</span></div>' +
      '<h2 id="completion-title" class="modal-title">Final Audit Report — Filed</h2>' +
      '<p class="modal-sub">Case CYSA-14.3-001 · CySA+ Lesson 14.3 — Implementing Controls to Prevent Attacks</p>' +
    '</div>' +
    '<div class="score-box">' +
      '<div class="stars" aria-label="' + score.stars + ' of 5 stars">' + stars + '</div>' +
      '<p class="score-pct">' + score.pct + '<span class="score-pct-sign">%</span></p>' +
      '<p class="score-line">' + score.score + '/' + score.max + ' pts · first-try ' + score.firstTry + '/' + objectives.length +
        ' · hints −' + score.hintPenalty + ' · quiz ' + score.quizCorrect + '/' + score.quizCount + '</p>' +
      '<p class="score-verdict">' + ic('trophy', 'h-4 w-4') + ' ' + trophyLine + '</p>' +
    '</div>' +
    '<div class="focus-box">' +
      '<p class="mini-label red" id="focus-areas-heading">' + ic('crosshair', 'h-3.5 w-3.5') + ' Focus areas — where to sharpen next</p>' +
      focusHTML +
    '</div>' +
    '<div class="pillar-recap">' +
      '<p class="mini-label">Objective recap by mastery pillar</p>' +
      pillarRecap +
    '</div>' +
    '<div class="next-steps-box">' +
      '<p class="mini-label gold">Where to go next</p>' +
      '<ul class="next-steps-list">' + nextSteps + '</ul>' +
    '</div>' +
    '<div class="modal-actions">' +
      '<button type="button" class="btn btn-outline-green" data-action="switch-from-modal">Switch mode</button>' +
      '<button type="button" class="btn btn-primary" data-action="restart-from-modal">Run the audit again</button>' +
    '</div>';
}

function openCompletionModal() {
  const s = store.state;
  if (!s) return;
  const score = computeScore(s);
  Modal.open({
    body: completionModalHTML(s, score),
    labelledId: 'completion-title',
    cls: 'modal-completion',
    overlayClose: true,
    onClose: null,
  });
}

/* ================================ confirm dialogs ================================ */

function openResetConfirm() {
  Modal.open({
    body:
      '<div class="dialog-head">' +
        '<h2 id="reset-title" class="modal-title">Reset this audit?</h2>' +
        '<p class="modal-sub-left">This clears all objectives, checklist markings, estate changes, quiz answers and saved progress from this browser. The lab returns to its pristine state.</p>' +
      '</div>' +
      '<div class="dialog-actions">' +
        '<button type="button" class="btn btn-outline" data-action="close-modal">Cancel</button>' +
        '<button type="button" class="btn btn-danger" data-action="reset-confirm" data-autofocus>Reset everything</button>' +
      '</div>',
    labelledId: 'reset-title',
    overlayClose: false,
  });
}

function openSwitchConfirm() {
  const s = store.state;
  if (!s) return;
  const target = s.mode === 'medium' ? 'Blank-Page (Hard)' : 'Guided (Medium)';
  const stayMode = s.mode === 'medium' ? 'Guided' : 'Blank-Page';
  Modal.open({
    body:
      '<div class="dialog-head">' +
        '<h2 id="switch-title" class="modal-title">Switch to ' + target + ' mode?</h2>' +
        '<p class="modal-sub-left">Switching starts a fresh run in the other mode and clears this run\'s objectives, checklist markings, estate changes and quiz answers from this browser. Use Reset instead if you want to stay in ' + stayMode + ' mode.</p>' +
      '</div>' +
      '<div class="dialog-actions">' +
        '<button type="button" class="btn btn-outline" data-action="close-modal">Keep this run</button>' +
        '<button type="button" class="btn btn-danger" data-action="switch-confirm" data-autofocus>Switch and start fresh</button>' +
      '</div>',
    labelledId: 'switch-title',
    overlayClose: false,
  });
}

/* ================================ event handlers ================================ */

function onDocClick(e) {
  const el = e.target.closest ? e.target.closest('[data-action]') : null;
  if (!el) return;
  const action = el.getAttribute('data-action');
  const s = store.state;

  switch (action) {
    case 'select-mode':
      store.replace(freshState(el.getAttribute('data-mode')));
      break;

    case 'nav-section':
    case 'goto-section': {
      const section = el.getAttribute('data-section');
      store.patch(function (st) { st.section = section; return st; }, ['nav', 'stage']);
      if (action === 'goto-section') window.scrollTo({ top: 0, behavior: 'auto' });
      break;
    }

    case 'desk-tab':
      store.patch(function (st) { st.deskTab = el.getAttribute('data-tab'); return st; }, ['stage']);
      break;

    case 'focus-class':
      store.patch(function (st) { st.env.focusedClass = el.getAttribute('data-class'); return st; }, ['stage']);
      break;

    case 'toggle-control': {
      const classId = el.getAttribute('data-class');
      const controlId = el.getAttribute('data-control');
      store.patch(function (st) {
        const cur = st.env.selected[classId] || [];
        const next = cur.indexOf(controlId) === -1 ? cur.concat([controlId]) : cur.filter(function (x) { return x !== controlId; });
        const sel = Object.assign({}, st.env.selected);
        sel[classId] = next;
        return { env: Object.assign({}, st.env, { selected: sel }) };
      }, ['stage']);
      break;
    }

    case 'check-obj':
      handleCheck(el.getAttribute('data-obj'));
      break;

    case 'hint-obj':
      handleHint(el.getAttribute('data-obj'));
      break;

    case 'run-scan':
      store.patch(function (st) { st.env.scanRun = st.env.scanRun + 1; return st; }, ['stage']);
      break;

    case 'estate-toggle': {
      const cid = el.getAttribute('data-control');
      store.patch(function (st) {
        const estate = Object.assign({}, st.env.estate);
        estate[cid] = !estate[cid];
        return { env: Object.assign({}, st.env, { estate: estate }) };
      }, ['stage']);
      break;
    }

    case 'flag-toggle': {
      const cid = el.getAttribute('data-control');
      store.patch(function (st) {
        const flagged = st.env.flagged.indexOf(cid) === -1
          ? st.env.flagged.concat([cid])
          : st.env.flagged.filter(function (x) { return x !== cid; });
        return { env: Object.assign({}, st.env, { flagged: flagged }) };
      }, ['stage']);
      break;
    }

    case 'quiz-pick':
      QuizView.pending = parseInt(el.getAttribute('data-idx'), 10);
      QuizView.cardAnim = false;
      QuizView.render(false);
      break;

    case 'quiz-confirm': {
      if (QuizView.pending === null) break;
      const qs = quizQuestions(s.mode);
      const q = qs[QuizView.idx];
      const chosen = QuizView.pending;
      store.patch(function (st) {
        const qa = Object.assign({}, st.quizAnswers);
        qa[q.id] = chosen;
        return { quizAnswers: qa };
      }, ['masthead', 'ledger']);
      QuizView.pending = null;
      QuizView.cardAnim = false;
      QuizView.render(false);
      break;
    }

    case 'quiz-next':
      QuizView.idx = QuizView.idx + 1;
      QuizView.pending = null;
      QuizView.cardAnim = true;
      QuizView.render(false);
      break;

    case 'quiz-goto':
      QuizView.idx = parseInt(el.getAttribute('data-idx'), 10);
      QuizView.pending = null;
      QuizView.cardAnim = true;
      QuizView.render(false);
      break;

    case 'file-report':
      store.patch(function (st) { st.completed = true; return st; }, ['masthead']);
      openCompletionModal();
      break;

    case 'open-report':
      openCompletionModal();
      break;

    case 'close-modal':
      Modal.close();
      break;

    case 'reset-request':
      openResetConfirm();
      break;

    case 'reset-confirm':
      store.replace(null); // pristine: drop the run + clear storage
      break;

    case 'switch-request':
      if (progressExists(s)) openSwitchConfirm();
      else doSwitchMode();
      break;

    case 'switch-confirm':
      doSwitchMode();
      break;

    case 'switch-from-modal':
      Modal.close(true);
      if (progressExists(store.state)) openSwitchConfirm();
      else doSwitchMode();
      break;

    case 'restart-from-modal':
      store.replace(null);
      break;

    case 'scroll-ledger': {
      const rail = $('#rail-slot');
      if (rail) rail.scrollIntoView({ behavior: 'smooth', block: 'start' });
      break;
    }
  }
}

function doSwitchMode() {
  const s = store.state;
  if (!s) return;
  QuizView.reset();
  store.replace(freshState(s.mode === 'medium' ? 'hard' : 'medium'));
}

/** CHECK RESULTS handler — mirrors the original handleCheck exactly. */
function handleCheck(id) {
  const s = store.state;
  if (!s) return;
  const result = checkObjective(id, s.env, s.mode);
  const prev = s.objectives[id] || { attempts: 0, hintsUsed: 0, done: false, result: null };
  const willPass = result.pass && !prev.done;
  store.patch(function (cur) {
    const objectives = Object.assign({}, cur.objectives);
    objectives[id] = {
      attempts: prev.attempts + 1,
      hintsUsed: prev.hintsUsed,
      done: prev.done || result.pass,
      result: result,
    };
    return { objectives: objectives };
  }, ['masthead', 'nav', 'stage', 'ledger']);
  if (willPass) {
    const shortId = id.replace('OBJ-', '');
    toast('✓ ' + shortId + ' — ' + esc(result.title), result.body.slice(0, 140) + (result.body.length > 140 ? '…' : ''));
  }
}

/** Hint handler — mirrors the original handleHint exactly. */
function handleHint(id) {
  store.patch(function (s) {
    if (!s) return s;
    const prev = s.objectives[id] || { attempts: 0, hintsUsed: 0, done: false, result: null };
    const maxHints = s.mode === 'medium' ? 3 : 1;
    if (prev.hintsUsed >= maxHints) return s;
    const objectives = Object.assign({}, s.objectives);
    objectives[id] = Object.assign({}, prev, { hintsUsed: prev.hintsUsed + 1 });
    return { objectives: objectives };
  }, ['ledger']);
}

function onDocChange(e) {
  const t = e.target;
  if (!t || !t.getAttribute) return;
  const action = t.getAttribute('data-action-change');
  if (!action) return;
  const path = t.getAttribute('data-path');

  if (action === 'env-set') {
    envSet(path, t.value);
  } else if (action === 'env-list') {
    envToggleList(path, t.getAttribute('data-value'));
  }
}

function onDocInput(e) {
  const t = e.target;
  if (!t || !t.getAttribute) return;
  const path = t.getAttribute('data-env-path');
  if (!path) return;
  // Silent update: persist (debounced) without re-render, so typing focus is preserved.
  store.patch(function (s) {
    s.env[path] = t.value;
    return s;
  }, null, 250);
}

/* ================================ helpers ================================ */

function familyIcon(fam) {
  const map = {
    'Endpoint': 'monitor-smartphone',
    'Identity': 'fingerprint',
    'AppSec': 'braces',
    'Network': 'route',
    'Data & Crypto': 'database',
    'Wireless': 'radio-tower',
  };
  return map[fam] || 'shield-check';
}

/* Go. */
boot();
