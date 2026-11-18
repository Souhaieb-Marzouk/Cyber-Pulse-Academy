// ── The Staging Bay · app bootstrap, regions, event wiring ──────────────────
// Static port of StagingBayLab.tsx + every child component. View regions are
// built once and surgically updated on state changes; overlays (dialogs,
// sheets, completion modal) are built fresh on open, exactly like Radix mounts.
(function () {
'use strict';
const { h, icon, C, PILLAR_META, Term } = window;
const LAB = window.LAB;
const store = window.createStore();
window.APP = { store };
const dispatch = store.dispatch;
const notify = (msg) => window.toast(msg, { duration: 4200 });

const root = document.getElementById('root');
let view = null;            // 'gate' | 'lab'
let labRegions = null;      // region registry for the lab view
let completionApi = null;   // open completion overlay handle
const passedRef = new Set();// celebration dedup (mirrors the original passedRef)

// seed celebrations from a resumed build (same as the original hydrate effect)
if (store.state.mode) {
  Object.entries(store.state.objectives).forEach(([id, pr]) => { if (pr.passed) passedRef.add(id); });
}

// ── celebrate newly passed objectives (educational toast) ──
function celebrate(prev, s) {
  for (const [id, pr] of Object.entries(s.objectives)) {
    if (pr.passed && !passedRef.has(id)) {
      passedRef.add(id);
      window.toast.success(`${id.replace('OBJ-', '')} PASSED`, { description: 'Objective complete — feedback is on the work order card.', duration: 3500 });
    }
    if (!pr.passed) passedRef.delete(id);
  }
}

// ══════════════════════════════ MODE GATE ══════════════════════════════
let gateEls = null;
function buildGate() {
  root.innerHTML = '';
  const main = h('main', { class: 'gate-main' });
  const inner = h('div', { class: 'gate-inner' });
  const header = h('header', { class: 'gate-header' },
    h('div', { class: 'gate-kicker mono', text: 'CompTIA Network+ N10-009 · Objective 1.2 · Networking appliances' }),
    h('h1', { class: 'gate-title display', text: 'The Staging Bay' }),
    h('p', { class: 'gate-sub', text: 'Rack the appliances. Commission the features. Survive the incidents. Sign off the site. One build order, two ways to run it — pick your shift below.' }),
    h('div', { class: 'hatch hatch-w32', 'aria-hidden': 'true' }));

  const cardList = [
    {
      mode: 'medium', icon: 'compass', tone: 'amber', chip: 'guided build', title: 'Medium', sub: 'learn the floor',
      aria: 'Medium mode: guided build. 11 objectives with hints and teaching feedback.',
      items: [
        '11 guided objectives — placement, commissioning, triage, policy',
        '“Where to look” affordances + 3-tier hints on every objective',
        'Tolerant checking — wrong answers teach, they don’t punish',
        '6-question concept exam after practice',
      ],
      cta: '▶ start guided shift',
    },
    {
      mode: 'hard', icon: 'skull', tone: 'red', chip: 'cold site', title: 'Hard', sub: 'test the engineer',
      aria: 'Hard mode: cold site. 9 deep objectives, noisy evidence, strict checking.',
      items: [
        '9 deep, multi-step challenges across five evidence boards',
        'No spotlights, no where-to-look — noisy logs with red herrings',
        'Strict checks: exact rulesets, exact verdicts; near-misses rejected with rationale',
        'One optional nudge total — and it costs stars',
      ],
      cta: '▶ start cold-site shift',
    },
  ];

  const grid = h('div', { class: 'gate-grid' });
  for (const cdef of cardList) {
    const card = h('button', {
      type: 'button', class: 'gate-card ' + cdef.tone, 'aria-label': cdef.aria,
      onclick: () => { window.clearState(); dispatch({ type: 'SET_MODE', mode: cdef.mode }); },
    });
    const top = h('div', { class: 'gate-card-top' });
    top.appendChild(icon(cdef.icon, 'ic-32 ' + cdef.tone));
    top.appendChild(h('span', { class: 'gate-chip ' + cdef.tone + ' mono', text: cdef.chip }));
    card.appendChild(top);
    card.appendChild(h('div', { class: 'gate-card-title display', text: cdef.title }));
    card.appendChild(h('div', { class: 'gate-card-sub mono', text: cdef.sub }));
    const ul = h('ul', { class: 'gate-list' });
    for (const it of cdef.items) {
      ul.appendChild(h('li', null, icon('clipboard-list', 'ic-16 ' + cdef.tone), h('span', { text: it })));
    }
    card.appendChild(ul);
    card.appendChild(h('div', { class: 'gate-cta mono', text: cdef.cta }));
    grid.appendChild(card);
  }

  inner.appendChild(header);
  inner.appendChild(grid);

  const discardWrap = h('div', { class: 'gate-discard-wrap', style: { display: store.state.resumed ? '' : 'none' } });
  const discardBtn = h('button', {
    type: 'button', class: 'btn-outline gate-discard mono',
    onclick: () => { window.clearState(); dispatch({ type: 'RESET' }); },
  }, icon('rotate-ccw', 'ic-14'), ' discard previous build & start clean');
  discardWrap.appendChild(discardBtn);
  inner.appendChild(discardWrap);

  inner.appendChild(h('p', { class: 'gate-foot mono', text: 'training simulation · synthetic data only · fictional org “meridian components group”' }));
  main.appendChild(inner);
  root.appendChild(main);
  gateEls = { discardWrap };
  view = 'gate';
}

function updateGate(s) {
  if (gateEls) gateEls.discardWrap.style.display = s.resumed ? '' : 'none';
}

// ══════════════════════════════ LAB SHELL ══════════════════════════════
function buildLab(s) {
  root.innerHTML = '';
  const shell = h('div', { class: 'gridbg' });

  // ── sticky unit: HUD + mobile work-order bar ──
  const sticky = h('div', { class: 'sticky-top' });
  const hud = buildHud(s);
  const mobileBar = buildMobileBar(s);
  sticky.appendChild(hud.el);
  sticky.appendChild(mobileBar.el);
  shell.appendChild(sticky);

  const main = h('main', { class: 'lab-main' });

  // ── spotlight (medium only) ──
  const spotlight = h('div', { class: 'spotlight', role: 'status', style: { display: 'none' } });
  main.appendChild(spotlight);

  // ── mid-width objectives board (lg only, under spotlight) ──
  const trackerBoardCol = h('div', { class: 'tracker-board' });
  const trackerBoard = buildTracker(s, true);
  trackerBoardCol.appendChild(trackerBoard.el);
  main.appendChild(trackerBoardCol);

  // ── 2/3-rail grid ──
  const grid = h('div', { class: 'lab-grid' });

  const depotCol = h('div', { class: 'col-depot' });
  const depot = buildDepot(s);
  depotCol.appendChild(depot.el);

  const centerCol = h('div', { class: 'col-center' });
  const brief = buildBrief();
  const manual = buildManual(s);
  const floor = buildFloor(s);
  const console_ = buildConsole(s);
  const evidence = buildEvidence(s);
  const quiz = window.createQuizRegion(store, signOff);
  const debrief = buildDebrief(s);
  centerCol.appendChild(brief.el);
  centerCol.appendChild(manual.el);
  centerCol.appendChild(floor.el);
  centerCol.appendChild(console_.el);
  centerCol.appendChild(evidence.el);
  centerCol.appendChild(quiz.el);
  centerCol.appendChild(debrief.el);

  const railCol = h('div', { class: 'col-rail' });
  const trackerRail = buildTracker(s, false);
  railCol.appendChild(trackerRail.el);

  grid.appendChild(depotCol);
  grid.appendChild(centerCol);
  grid.appendChild(railCol);
  main.appendChild(grid);
  shell.appendChild(main);
  root.appendChild(shell);

  labRegions = {
    hud, mobileBar, spotlight, trackerBoard, depot, manual, floor,
    console: console_, evidence, quiz, trackerRail,
  };
  view = 'lab';
  updateLab(undefined, store.state);
  updateSpotlight(store.state);
}

function signOff() { dispatch({ type: 'SHOW_COMPLETION' }); }

function resetAll() {
  window.clearState();
  passedRef.clear();
  dispatch({ type: 'RESET' });
  window.toast('Site torn down', { description: 'The bay is back to pristine state.' });
}

function updateLab(prev, s) {
  for (const r of Object.values(labRegions)) {
    if (r && typeof r.update === 'function') r.update(prev, s);
  }
}

// ══════════════════════════════ SITE HUD ══════════════════════════════
const ACTS = [
  { id: 'sec-brief', label: 'BRIEF' },
  { id: 'sec-manual', label: 'MANUAL' },
  { id: 'sec-floor', label: 'RACK' },
  { id: 'sec-console', label: 'COMMISSION' },
  { id: 'sec-evidence', label: 'TRIAGE' },
  { id: 'sec-quiz', label: 'EXAM' },
  { id: 'sec-debrief', label: 'SIGN-OFF' },
];

function jump(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function buildHud(s) {
  const sc = window.score(s);
  const mode = s.mode;
  const bar = h('div', { class: 'hud' });
  const inner = h('div', { class: 'hud-inner' });

  const brand = h('div', { class: 'hud-brand' },
    h('div', { class: 'hud-logo display', text: 'SB', 'aria-hidden': 'true' }),
    h('div', { class: 'hud-brandtext' },
      h('div', { class: 'hud-name display', text: 'The Staging Bay' }),
      h('div', { class: 'hud-build mono', text: 'MERIDIAN-DC01 · build order 2026-117' })));
  inner.appendChild(brand);

  inner.appendChild(h('span', { class: 'mode-chip mono ' + (mode === 'hard' ? 'red' : 'amber'), text: mode === 'hard' ? 'COLD SITE' : 'GUIDED BUILD' }));

  const nav = h('nav', { class: 'hud-nav', 'aria-label': 'Build phases' });
  ACTS.forEach((a, i) => {
    nav.appendChild(h('button', {
      type: 'button', class: 'hud-act mono', onclick: () => jump(a.id),
    }, h('span', { class: 'hud-act-num', text: String(i + 1).padStart(2, '0') + ' ' }), ' ' + a.label));
  });
  inner.appendChild(nav);

  const right = h('div', { class: 'hud-right' });
  const progress = window.ProgressBar('hud-progress');
  right.appendChild(progress);
  const ring = window.ProgressRing(0, 44, '0%');
  right.appendChild(ring);
  const stars = window.Stars(sc.stars, 16);
  right.appendChild(stars);

  right.appendChild(h('button', {
    type: 'button', class: 'btn-outline hud-btn mono', 'aria-label': 'Open glossary',
    onclick: openGlossary,
  }, icon('book-open-text', 'ic-14'), h('span', { class: 'hide-sm', text: ' glossary' })));

  right.appendChild(h('button', {
    type: 'button', class: 'btn-amber hud-btn mono', onclick: signOff, text: 'sign-off',
  }));

  right.appendChild(h('button', {
    type: 'button', class: 'btn-outline hud-btn reset-hover mono', 'aria-label': 'Reset the lab',
    onclick: openResetDialog,
  }, icon('rotate-ccw', 'ic-14'), h('span', { class: 'hide-sm', text: ' reset' })));

  inner.appendChild(right);
  bar.appendChild(inner);

  return {
    el: bar,
    update(prev, s2) {
      const sc2 = window.score(s2);
      const pct = sc2.objTotal ? Math.round((sc2.objPassed / sc2.objTotal) * 100) : 0;
      progress._update(pct, `Objectives ${sc2.objPassed} of ${sc2.objTotal}`);
      ring._update(pct, `${sc2.objPassed}/${sc2.objTotal}`);
      stars._update(sc2.stars);
    },
  };
}

// ── reset confirm (AlertDialog; overlay-strict like the original) ──
function openResetDialog() {
  const content = h('div', { class: 'dlg' });
  const head = h('div', { class: 'dlg-head' });
  const titleId = 'dlg-reset-title';
  const descId = 'dlg-reset-desc';
  head.appendChild(h('h2', { class: 'dlg-title display', id: titleId, text: 'Tear down the site?' }));
  head.appendChild(h('p', { class: 'dlg-desc', id: descId, text: 'This wipes mode, placements, console configs, objectives and quiz results from this browser, and returns the bay to pristine state. There is no undo.' }));
  content.appendChild(head);
  const foot = h('div', { class: 'dlg-foot' });
  foot.appendChild(h('button', { type: 'button', class: 'btn-outline dlg-btn', 'data-autofocus': '', text: 'keep building' }));
  foot.appendChild(h('button', {
    type: 'button', class: 'btn-red dlg-btn', text: 'reset everything',
    onclick: () => { api.close(); resetAll(); },
  }));
  content.appendChild(foot);
  const api = window.openOverlay({
    content, kind: 'dialog', labelId: titleId, descId, overlayCloses: false, closeX: false,
  });
  content.querySelector('.btn-outline').addEventListener('click', () => api.close());
}

// ── glossary sheet (right) ──
function openGlossary() {
  const content = h('div', { class: 'glossary' });
  const head = h('div', { class: 'sheet-head' });
  head.appendChild(h('h2', { class: 'sheet-title display', id: 'glossary-title', text: 'Bay glossary' }));
  head.appendChild(h('button', {
    type: 'button', class: 'ovl-close', 'aria-label': 'Close',
    html: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  }));
  content.appendChild(head);
  content.appendChild(h('p', { class: 'sr-only', text: 'Definitions of every jargon term used in the lab.' }));
  const dl = h('dl', { class: 'glossary-list' });
  for (const g of LAB.GLOSSARY) {
    dl.appendChild(h('div', { class: 'glossary-item' },
      h('dt', { class: 'glossary-term display', text: g.term }),
      h('dd', { class: 'glossary-def', text: g.def })));
  }
  content.appendChild(dl);
  const api = window.openOverlay({ content, kind: 'sheet-right', labelId: 'glossary-title' });
  head.querySelector('.ovl-close').addEventListener('click', () => api.close());
}

// ── mobile work-order bar + bottom sheet ──
function buildMobileBar(s) {
  const sc = window.score(s);
  const mode = s.mode || 'medium';
  const objs = window.objectivesFor(mode);
  const spotlightObj = mode === 'medium' ? objs.find((o) => !(s.objectives[o.id] || {}).passed) : undefined;
  const bar = h('div', { class: 'mobile-bar' });
  const btn = h('button', {
    type: 'button', class: 'mobile-bar-btn', 'aria-label': `Open work order: ${sc.objPassed} of ${sc.objTotal} objectives passed`,
    onclick: openMobileSheet,
  });
  btn.appendChild(h('span', { class: 'display amber-label', text: 'Work order' }));
  btn.appendChild(h('span', { class: 'mono mobile-counts', text: `${sc.objPassed}/${sc.objTotal} · ★${sc.stars}` }));
  const nowEl = h('span', { class: 'mobile-now', text: spotlightObj ? `now: ${spotlightObj.title}` : '' });
  const clearEl = h('span', { class: 'mono mobile-clear', text: 'all clear', style: { display: spotlightObj ? 'none' : '' } });
  btn.appendChild(nowEl);
  btn.appendChild(clearEl);
  bar.appendChild(btn);
  return {
    el: bar,
    update(prev, s2) {
      const sc2 = window.score(s2);
      const m2 = s2.mode || 'medium';
      const objs2 = window.objectivesFor(m2);
      const sp = m2 === 'medium' ? objs2.find((o) => !(s2.objectives[o.id] || {}).passed) : undefined;
      btn.setAttribute('aria-label', `Open work order: ${sc2.objPassed} of ${sc2.objTotal} objectives passed`);
      btn.querySelector('.mobile-counts').textContent = `${sc2.objPassed}/${sc2.objTotal} · ★${sc2.stars}`;
      nowEl.textContent = sp ? `now: ${sp.title}` : '';
      clearEl.style.display = sp ? 'none' : '';
    },
  };
}

function openMobileSheet() {
  const content = h('div', { class: 'mobile-sheet' });
  const head = h('div', { class: 'sheet-head padded' });
  head.appendChild(h('h2', { class: 'sheet-title display', id: 'mobile-wo-title', text: 'Work order' }));
  head.appendChild(h('button', {
    type: 'button', class: 'ovl-close', 'aria-label': 'Close',
    html: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  }));
  content.appendChild(head);
  content.appendChild(h('p', { class: 'sr-only', text: 'Your objective list with checks, hints and feedback.' }));
  const bodyWrap = h('div', { class: 'mobile-sheet-body' });
  content.appendChild(bodyWrap);
  const api = window.openOverlay({ content, kind: 'sheet-bottom', labelId: 'mobile-wo-title' });
  head.querySelector('.ovl-close').addEventListener('click', () => api.close());
  // fresh tracker instance on every open (Radix remounts sheet content the same way)
  const tracker = buildTracker(store.state, true);
  bodyWrap.appendChild(tracker.el);
  tracker.update(undefined, store.state);
}

// ══════════════════════════════ SPOTLIGHT ══════════════════════════════
function updateSpotlight(s) {
  const el = labRegions.spotlight;
  const mode = s.mode;
  const objs = window.objectivesFor(mode);
  const spot = mode === 'medium' ? objs.find((o) => !(s.objectives[o.id] || {}).passed) : undefined;
  if (!spot) { el.style.display = 'none'; el.innerHTML = ''; return; }
  el.style.display = '';
  el.innerHTML = '';
  el.className = 'spotlight';
  el.setAttribute('role', 'status');
  el.appendChild(h('span', { class: 'mono spotlight-kicker', text: 'now →' }));
  el.appendChild(h('span', { class: 'mono spotlight-id', text: spot.id }));
  el.appendChild(h('span', { class: 'spotlight-text' },
    `${spot.title} — `, h('span', { class: 'spotlight-where', text: spot.where })));
  const swatches = h('span', { class: 'spotlight-swatches hide-sm', 'aria-hidden': 'true' });
  for (const m of Object.values(PILLAR_META)) {
    swatches.appendChild(h('span', { class: 'swatch', style: { background: m.color, opacity: 0.7 } }));
  }
  el.appendChild(swatches);
}

// ══════════════════════════════ WORK-ORDER TRACKER (C4) ══════════════════════════════
function buildTracker(s, compact) {
  const panel = h('div', { class: 'tracker', 'aria-label': 'Objectives tracker' });
  const head = h('div', { class: 'tracker-head' });
  const topRow = h('div', { class: 'tracker-toprow' });
  topRow.appendChild(icon('target', 'ic-16 amber'));
  topRow.appendChild(h('h2', { class: 'tracker-title display', text: 'Work order' }));
  const countEl = h('span', { class: 'mono tracker-count' });
  topRow.appendChild(countEl);
  head.appendChild(topRow);
  const progress = window.ProgressBar('tracker-progress');
  head.appendChild(progress);
  const chips = h('div', { class: 'pillar-chips' });
  head.appendChild(chips);
  panel.appendChild(head);

  const list = h('ol', { class: 'tracker-list lab-scroll' + (compact ? ' compact' : ''), 'aria-label': 'Objective list' });
  const mode = s.mode || 'medium';
  const objs = window.objectivesFor(mode);
  let openId = null;
  const items = objs.map((o) => {
    const li = h('li', { class: 'obj' });
    const toggleBtn = h('button', {
      type: 'button', class: 'obj-toggle', 'aria-expanded': 'false',
    });
    const iconBadgeCheck = icon('badge-check', 'ic-16 green obj-icon passed-icon');
    const iconDashed = icon('circle-dashed', 'ic-16 obj-icon dim-icon');
    toggleBtn.appendChild(iconBadgeCheck);
    toggleBtn.appendChild(iconDashed);
    const textWrap = h('span', { class: 'obj-text' });
    const metaRow = h('span', { class: 'obj-meta' });
    const idEl = h('span', { class: 'mono obj-id' });
    const pillarEl = h('span', { class: 'mono obj-pillar' });
    const attEl = h('span', { class: 'mono obj-att' });
    metaRow.appendChild(idEl);
    metaRow.appendChild(pillarEl);
    metaRow.appendChild(attEl);
    const titleEl = h('span', { class: 'obj-title' });
    const lineEl = h('span', { class: 'obj-line' });
    textWrap.appendChild(metaRow);
    textWrap.appendChild(titleEl);
    textWrap.appendChild(lineEl);
    toggleBtn.appendChild(textWrap);
    li.appendChild(toggleBtn);

    const body = h('div', { class: 'obj-body-clip' });
    const bodyInner = h('div', { class: 'obj-body' });
    const briefEl = h('p', { class: 'obj-brief' });
    bodyInner.appendChild(briefEl);
    let whereEl = null;
    if (mode === 'medium' && o.where) {
      whereEl = h('p', { class: 'obj-where' }, h('span', { class: 'mono', text: 'where → ' }), o.where);
      bodyInner.appendChild(whereEl);
    }
    const hintsWrap = h('div', { class: 'obj-hints', 'aria-live': 'polite' });
    bodyInner.appendChild(hintsWrap);
    const fbWrap = h('div', { class: 'obj-feedback', role: 'status', 'aria-live': 'polite', style: { display: 'none' } });
    bodyInner.appendChild(fbWrap);
    const btnRow = h('div', { class: 'obj-btnrow' });
    const verifyBtn = h('button', { type: 'button', class: 'btn-amber obj-verify', text: 'check results' });
    verifyBtn.addEventListener('click', () => dispatch({ type: 'VERIFY', id: o.id }));
    const hintMax = o.mode === 'hard' ? 1 : 3;
    const hintBtn = h('button', { type: 'button', class: 'btn-outline obj-hint' });
    hintBtn.appendChild(icon('lightbulb', 'ic-14'));
    hintBtn.addEventListener('click', () => dispatch({ type: 'HINT', id: o.id }));
    btnRow.appendChild(verifyBtn);
    btnRow.appendChild(hintBtn);
    bodyInner.appendChild(btnRow);
    bodyInner.appendChild(h('p', { class: 'mono obj-anchor', text: `anchor: ${o.anchor}` }));
    body.appendChild(bodyInner);
    li.appendChild(body);

    toggleBtn.addEventListener('click', () => {
      openId = openId === o.id ? null : o.id;
      syncOpen();
    });

    function syncOpen() {
      const open = openId === o.id;
      li.classList.toggle('open', open);
      toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    const refs = { li, idEl, pillarEl, attEl, titleEl, lineEl, hintsWrap, fbWrap, hintBtn, hintMax, iconBadgeCheck, iconDashed, o };
    syncOpen();
    return refs;
  });
  items.forEach((r) => list.appendChild(r.li));
  panel.appendChild(list);

  function update(prev, s2) {
    const m2 = s2.mode || 'medium';
    const objs2 = window.objectivesFor(m2);
    const passed = objs2.filter((o) => (s2.objectives[o.id] || {}).passed).length;
    countEl.textContent = `${passed}/${objs2.length}`;
    progress._update(objs2.length ? (passed / objs2.length) * 100 : 0, `${passed} of ${objs2.length} objectives passed`);
    // pillar chips
    chips.innerHTML = '';
    for (const [pKey, m] of Object.entries(PILLAR_META)) {
      const tot = objs2.filter((o) => o.pillar === pKey).length;
      const ok = objs2.filter((o) => o.pillar === pKey && (s2.objectives[o.id] || {}).passed).length;
      chips.appendChild(h('span', {
        class: 'pillar-chip mono', style: { color: m.color, borderColor: m.color + '55', background: m.color + '0d' },
        'aria-label': `${m.label}: ${ok} of ${tot}`,
        text: `${m.label} ${ok}/${tot}`,
      }));
    }
    // items
    for (const r of items) {
      const pr = s2.objectives[r.o.id] || { passed: false, attempts: 0, hintLevel: 0 };
      const pm = PILLAR_META[r.o.pillar];
      r.li.classList.toggle('passed', pr.passed);
      r.iconBadgeCheck.style.display = pr.passed ? '' : 'none';
      r.iconDashed.style.display = pr.passed ? 'none' : '';
      r.idEl.textContent = `${String(objs2.indexOf(r.o) + 1).padStart(2, '0')} · ${r.o.id}`;
      r.pillarEl.textContent = pm.label;
      r.pillarEl.style.color = pm.color;
      r.pillarEl.style.border = `1px solid ${pm.color}44`;
      r.attEl.textContent = pr.attempts > 0 && !pr.passed ? `×${pr.attempts}` : '';
      r.titleEl.textContent = r.o.title;
      r.lineEl.textContent = r.o.line;
      // hints
      r.hintsWrap.innerHTML = '';
      r.o.hints.slice(0, pr.hintLevel).forEach((hintText, i) => {
        r.hintsWrap.appendChild(h('p', { class: 'obj-hintline mono-hint' },
          h('span', { class: 'mono hint-label', text: `hint ${i + 1}/${r.hintMax} · ` }), hintText));
      });
      // feedback
      r.fbWrap.innerHTML = '';
      if (pr.lastFeedback) {
        r.fbWrap.style.display = '';
        r.fbWrap.className = 'obj-feedback ' + (pr.passed ? 'fb-pass' : 'fb-fail');
        const mark = h('span', { class: 'fb-mark' });
        if (pr.passed) mark.textContent = '✅';
        else {
          mark.appendChild(icon('x-circle', 'ic-14 red fb-icon'));
          mark.setAttribute('aria-label', 'not yet');
        }
        r.fbWrap.appendChild(mark);
        r.fbWrap.appendChild(document.createTextNode(' ' + pr.lastFeedback));
      } else {
        r.fbWrap.style.display = 'none';
      }
      // hint button
      if (pr.hintLevel >= r.hintMax) {
        r.hintBtn.setAttribute('disabled', '');
        r.hintBtn.appendChild(document.createTextNode(pr.hintLevel >= r.hintMax && m2 === 'hard' ? ' spend nudge (−stars)' : ' no more hints'));
        // original hard label is "spend nudge (−stars)" until maxed; then "no more hints"
        r.hintBtn.textContent = '';
        r.hintBtn.appendChild(icon('lightbulb', 'ic-14'));
        r.hintBtn.appendChild(document.createTextNode(' no more hints'));
      } else {
        r.hintBtn.removeAttribute('disabled');
        r.hintBtn.textContent = '';
        r.hintBtn.appendChild(icon('lightbulb', 'ic-14'));
        r.hintBtn.appendChild(document.createTextNode(m2 === 'hard' ? ' spend nudge (−stars)' : ` hint (${pr.hintLevel}/${r.hintMax})`));
      }
    }
  }
  return { el: panel, update };
}

// ══════════════════════════════ DEPOT ══════════════════════════════
const CAT_LABEL = {
  router: 'routing', switch: 'switching', firewall: 'perimeter', sensor: 'intrusion sensors',
  loadbalancer: 'traffic steering', proxy: 'proxies', storage: 'storage', wireless: 'wireless', legacy: 'legacy crates',
};
const CAT_ORDER = ['router', 'switch', 'firewall', 'sensor', 'loadbalancer', 'proxy', 'storage', 'wireless', 'legacy'];

function buildDepot(s) {
  const aside = h('aside', { class: 'panel depot', 'aria-label': 'Device depot' });
  const head = h('div', { class: 'depot-head' });
  head.appendChild(icon('package-open', 'ic-16 amber'));
  head.appendChild(h('h2', { class: 'depot-title display', text: 'Device depot' }));
  const rackedEl = h('span', { class: 'mono depot-racked' });
  head.appendChild(rackedEl);
  aside.appendChild(head);
  const scroll = h('div', { class: 'depot-scroll lab-scroll' });

  const banner = h('div', { class: 'depot-banner', role: 'status', style: { display: 'none' } });
  scroll.appendChild(banner);

  const crateRefs = [];
  for (const cat of CAT_ORDER) {
    const devs = LAB.DEVICES.filter((d) => d.category === cat);
    if (!devs.length) continue;
    const group = h('div', { class: 'depot-group' });
    group.appendChild(h('div', { class: 'mono depot-cat', text: CAT_LABEL[cat] }));
    const listWrap = h('div', { class: 'depot-list' });
    for (const d of devs) {
      const btn = h('button', {
        type: 'button', class: 'crate', 'data-dev': d.id,
        'aria-pressed': 'false',
        'aria-label': `${d.name} — ${d.blurb}${d.placeable ? '' : `. Not placeable: ${d.whyNot || ''}`}`,
      });
      if (!d.placeable) btn.setAttribute('disabled', '');
      const topRow = h('span', { class: 'crate-top' });
      const codeEl = h('span', { class: 'mono crate-code', text: d.code });
      const nameEl = h('span', { class: 'crate-name', text: d.name });
      const rackedChip = h('span', { class: 'mono crate-racked', text: 'racked', style: { display: 'none' } });
      topRow.appendChild(codeEl);
      topRow.appendChild(nameEl);
      topRow.appendChild(rackedChip);
      btn.appendChild(topRow);
      btn.appendChild(h('span', { class: 'crate-blurb', text: d.blurb }));
      btn.appendChild(h('span', { class: 'mono crate-layer', text: `layer ${d.layer}` }));
      btn.addEventListener('click', () => {
        const cur = store.state.selectedDevice;
        dispatch({ type: 'SELECT_DEVICE', id: cur === d.id ? null : d.id });
      });
      listWrap.appendChild(btn);
      crateRefs.push({ d, btn, codeEl, nameEl, rackedChip });
    }
    group.appendChild(listWrap);
    scroll.appendChild(group);
  }
  aside.appendChild(scroll);

  function update(prev, s2) {
    const placedIds = new Set(Object.values(s2.placements).filter(Boolean));
    rackedEl.textContent = `${placedIds.size} racked`;
    const sel = s2.selectedDevice;
    const accepts = new Set(LAB.SLOTS.filter((sl) => sel && sl.accepts === sel).map((sl) => sl.id));
    banner.style.display = sel ? '' : 'none';
    if (sel) {
      const dev = LAB.DEVICES.find((d) => d.id === sel);
      banner.innerHTML = '';
      banner.appendChild(h('strong', { class: 'mono', text: dev.code }));
      banner.appendChild(document.createTextNode(' selected — tap a highlighted empty slot to install.'));
    }
    for (const r of crateRefs) {
      const selected = sel === r.d.id;
      const placed = placedIds.has(r.d.id);
      r.btn.setAttribute('aria-pressed', selected ? 'true' : 'false');
      r.btn.className = 'crate' + (!r.d.placeable ? ' disabled' : selected ? ' selected' : placed ? ' placed' : '');
      r.codeEl.className = 'mono crate-code' + (selected ? ' amber' : '');
      r.rackedChip.style.display = placed ? '' : 'none';
    }
  }
  return { el: aside, update };
}

// ══════════════════════════════ WORK ORDER / BRIEFING (C1) ══════════════════════════════
function buildBrief() {
  const section = h('section', { id: 'sec-brief', 'aria-labelledby': 'h-brief', class: 'scroll-mt' });
  const head = window.SectionHead('act 01 · work order', 'The briefing', 'Read the build order before you touch the floor. Everything below shapes what you rack and why.');
  head.querySelector('.section-title').setAttribute('id', 'h-brief');
  section.appendChild(head);

  const grid = h('div', { class: 'brief-grid' });
  const mainPanel = h('div', { class: 'panel brief-main' });
  mainPanel.appendChild(h('div', { class: 'mono build-order', text: LAB.SITE.build }));
  mainPanel.appendChild(h('h3', { class: 'brief-client display', id: 'h-brief2', text: `${LAB.SITE.client} — HQ network refit` }));
  const copy = h('div', { class: 'brief-copy' });
  const p1 = h('p');
  p1.appendChild(document.createTextNode('Meridian Components Group runs a production hall, a busy mezzanine office, a loading dock and a warehouse across the yard. The old network — a tangle of unmanaged switches, one flat subnet and a “the IT kid set it up” firewall rule — survived on luck. This quarter the company moved its order system in-house, published a customer web shop, and immediately started receiving alerts it cannot explain.'));
  const p2 = h('p');
  p2.appendChild(document.createTextNode('You are the staging engineer. The cages have arrived: '));
  p2.appendChild(h('strong', { class: 'strong-light', text: '15 appliances, 6 zone bays, 17 rack slots' }));
  p2.appendChild(document.createTextNode('. Your job is to place every appliance where it belongs in the traffic chain, commission the features the brief demands — '));
  p2.appendChild(Term('VLAN')); p2.appendChild(document.createTextNode(', '));
  p2.appendChild(Term('PoE (802.3af/at/bt)')); p2.appendChild(document.createTextNode(', '));
  p2.appendChild(Term('STP')); p2.appendChild(document.createTextNode(', load-balancer health checks, proxy filtering — then read the site’s logs, triage what fired overnight, and sign the build off.'));
  const p3 = h('p');
  p3.appendChild(document.createTextNode('Once the floor is live, three overnight incidents are waiting in the evidence wall: a scan that died at the perimeter, a probe that should not have survived it, and a host calling home on the hour, every hour. Your placements and policies decide how much of that you catch.'));
  copy.appendChild(p1); copy.appendChild(p2); copy.appendChild(p3);
  mainPanel.appendChild(copy);

  const stats = h('div', { class: 'brief-stats', role: 'list', 'aria-label': 'Build numbers' });
  for (const [n, l] of [['15', 'appliance crates'], ['6', 'zone bays'], ['17', 'rack slots'], ['3', 'overnight incidents']]) {
    stats.appendChild(h('div', { class: 'brief-stat', role: 'listitem' },
      h('div', { class: 'brief-stat-n display', text: n }),
      h('div', { class: 'mono brief-stat-l', text: l })));
  }
  mainPanel.appendChild(stats);
  grid.appendChild(mainPanel);

  const side = h('div', { class: 'brief-side' });

  const why = h('div', { class: 'panel' });
  why.appendChild(h('div', { class: 'panel-cap display' }, icon('graduation-cap', 'ic-16 amber'), ' why this matters for N10-009'));
  const whyP = h('p', { class: 'panel-body' });
  whyP.appendChild(document.createTextNode('Exam objective '));
  whyP.appendChild(h('strong', { class: 'strong-light', text: '1.2 — “Compare and contrast networking appliances, applications, and functions”' }));
  whyP.appendChild(document.createTextNode(' is exactly this skill: given a scenario, pick the right appliance (router vs switch vs firewall vs proxy…), know its layer, its features and its placement. Every objective in this lab maps to a detail of that appliances bullet — routers, switches, firewalls, IDS/IPS, load balancers, proxies, NAS, SAN and wireless devices.'));
  why.appendChild(whyP);
  side.appendChild(why);

  const rules = h('div', { class: 'panel' });
  rules.appendChild(h('div', { class: 'panel-cap display' }, icon('shield-check', 'ic-16 lime'), ' ground rules'));
  const ul = h('ul', { class: 'rules-list' });
  const li1 = h('li'); li1.appendChild(document.createTextNode('· Everything is a training simulation — fictional company, synthetic logs, '));
  li1.appendChild(Term('training data')); li1.appendChild(document.createTextNode(' documentation IPs.')); ul.appendChild(li1);
  const li2 = h('li', { text: '· No real tools, no real networks — you commission a model of a site, purely to learn it.' }); ul.appendChild(li2);
  const li3 = h('li'); li3.appendChild(document.createTextNode('· Jargon under the dotted amber underline opens a one-line definition. The full glossary lives in the HUD.')); ul.appendChild(li3);
  rules.appendChild(ul);
  side.appendChild(rules);

  const scoring = h('div', { class: 'panel amber-left' });
  scoring.appendChild(h('div', { class: 'panel-cap display' }, icon('triangle-alert', 'ic-16 amber'), ' how scoring works'));
  scoring.appendChild(h('p', { class: 'panel-body', text: 'Objectives are 60%, exam 40%. First-attempt passes and unused hints raise your star rating — hints never block progress, they just cost shine. Your build auto-saves in this browser.' }));
  side.appendChild(scoring);

  grid.appendChild(side);
  section.appendChild(grid);
  return { el: section, update() {} };
}

// ══════════════════════════════ FIELD MANUAL (C2) + M1/M2 boards ══════════════════════════════
function buildManual(s) {
  const section = h('section', { id: 'sec-manual', 'aria-labelledby': 'h-manual', class: 'scroll-mt' });
  const head = window.SectionHead('act 02 · field manual', 'Know the crew', 'Nine appliance families, one page each. Read them here or crack them open on the floor — then prove it on the two boards below.');
  head.querySelector('.section-title').setAttribute('id', 'h-manual');
  section.appendChild(head);

  // R6/B7.6 pairing shuffle: re-rolled every mount (fresh session, after RESET/reload)
  const shuffledRoles = LAB.MATCH_ROLES.slice();
  for (let i = shuffledRoles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledRoles[i], shuffledRoles[j]] = [shuffledRoles[j], shuffledRoles[i]];
  }

  const accGrid = h('div', { class: 'manual-grid' });
  for (const m of LAB.MANUAL) {
    const headContent = h('span', { class: 'acc-head' },
      h('span', { class: 'acc-title display', text: m.title }),
      h('span', { class: 'mono acc-layer', text: m.layer }));
    const body = h('div', null,
      h('p', { class: 'acc-role', text: m.role }),
      (() => {
        const ul = h('ul', { class: 'acc-points' });
        m.points.forEach((pt) => ul.appendChild(h('li', null, icon('chevron-down', 'ic-12 amber acc-bullet'), h('span', { text: pt }))));
        return ul;
      })(),
      h('p', { class: 'acc-trap', text: m.trap }));
    const item = window.AccordionItem(m.key === 'router' || m.key === 'switch', headContent, body);
    accGrid.appendChild(item);
  }
  section.appendChild(accGrid);

  // ── OBJ-M1 role-match board ──
  const m1 = h('div', { class: 'panel board' });
  const m1head = h('div', { class: 'board-head' });
  m1head.appendChild(h('h3', { class: 'board-title display', text: 'Role-match board' }));
  m1head.appendChild(h('span', { class: 'mono board-note', text: 'objective OBJ-M1 · 10 devices · 2 decoy roles stay unused' }));
  m1.appendChild(m1head);
  m1.appendChild(h('p', { class: 'board-sub', text: 'Assign each appliance its one-line job. Two roles describe gear that is not on this floor — leave them unassigned.' }));
  const m1grid = h('div', { class: 'role-grid' });
  const displayName = { ids: 'IDS', fproxy: 'Forward proxy', rproxy: 'Reverse proxy', ap: 'Access point' };
  const alias = { ids: 'idsips', fproxy: 'proxy', rproxy: 'proxy', ap: 'wireless', nas: 'nas', san: 'san' };
  const roleOptions = [{ v: '', t: 'pick its role…', disabled: true }].concat(shuffledRoles.map((r) => ({ v: r.id, t: r.text })));
  const roleSelects = {};
  for (const dev of LAB.MATCH_ITEMS) {
    const manual_ = LAB.MANUAL.find((mm) => mm.key === (alias[dev] || dev));
    const label = displayName[dev] || (manual_ && manual_.title) || dev;
    const row = h('div', { class: 'role-row' });
    row.appendChild(h('span', { class: 'mono role-name', text: label }));
    const sel = window.LabSelect(roleOptions, s.match[dev] || '', `Select the role of the ${label}`, (v) => dispatch({ type: 'SET_MATCH', device: dev, role: v }));
    sel.classList.add('role-select');
    row.appendChild(sel);
    roleSelects[dev] = sel;
    m1grid.appendChild(row);
  }
  m1.appendChild(m1grid);
  const assigned = h('div', { class: 'assigned-row' });
  const assignedEl = h('span', { class: 'mono assigned-count' });
  assigned.appendChild(assignedEl);
  m1.appendChild(assigned);
  section.appendChild(m1);

  // ── OBJ-M2 path-sequence board ──
  const m2 = h('div', { class: 'panel board' });
  const m2head = h('div', { class: 'board-head' });
  m2head.appendChild(h('h3', { class: 'board-title display', text: 'Path-sequence board' }));
  m2head.appendChild(h('span', { class: 'mono board-note', text: 'objective OBJ-M2 · outside-in request' }));
  m2.appendChild(m2head);
  const m2sub = h('p', { class: 'board-sub' });
  m2sub.appendChild(document.createTextNode('A customer opens '));
  m2sub.appendChild(h('span', { class: 'mono url', text: 'https://shop.meridian.example' }));
  m2sub.appendChild(document.createTextNode('. Tap the chips in the order the request passes through them — the chain is the lesson.'));
  m2.appendChild(m2sub);
  const seq = h('div', { class: 'seq-zone', 'aria-label': 'Your sequence', 'aria-live': 'polite' });
  m2.appendChild(seq);
  const chipRow = h('div', { class: 'chip-row' });
  m2.appendChild(chipRow);
  const whyP = h('p', { class: 'why-line' });
  whyP.appendChild(document.createTextNode('Why the order holds: the '));
  whyP.appendChild(Term('DMZ'));
  whyP.appendChild(document.createTextNode(' must see outsiders before any raw server does; the load balancer only exists behind it; the firewall never routes around itself.'));
  m2.appendChild(whyP);
  section.appendChild(m2);

  function renderSeq(s2) {
    seq.innerHTML = '';
    if (!s2.path.length) {
      seq.appendChild(h('span', { class: 'mono seq-empty', text: 'sequence empty — tap chips below in order' }));
    } else {
      const ol = h('ol', { class: 'seq-list' });
      s2.path.forEach((id, i) => {
        const step = LAB.PATH_STEPS.find((p) => p.id === id);
        const li = h('li', { class: 'seq-item' });
        li.appendChild(h('span', { class: 'seq-chip mono', text: `${i + 1}. ${step.label}` }));
        if (i < s2.path.length - 1) li.appendChild(h('span', { class: 'seq-arrow', 'aria-hidden': 'true', text: '→' }));
        ol.appendChild(li);
      });
      seq.appendChild(ol);
    }
    // remaining chips + undo/clear
    chipRow.innerHTML = '';
    const remaining = LAB.PATH_STEPS.filter((p) => !s2.path.includes(p.id));
    for (const p of remaining) {
      chipRow.appendChild(h('button', {
        type: 'button', class: 'chip mono', text: p.label,
        onclick: () => dispatch({ type: 'PATH_PUSH', step: p.id }),
      }));
    }
    chipRow.appendChild(h('button', {
      type: 'button', class: 'chip-mini mono', 'aria-label': 'Undo last chip',
      onclick: () => dispatch({ type: 'PATH_POP' }),
    }, icon('rotate-ccw', 'ic-12'), ' undo'));
    chipRow.appendChild(h('button', {
      type: 'button', class: 'chip-mini mono', 'aria-label': 'Clear sequence',
      onclick: () => dispatch({ type: 'PATH_CLEAR' }),
    }, icon('x', 'ic-12'), ' clear'));
  }

  function update(prev, s2) {
    for (const dev of LAB.MATCH_ITEMS) roleSelects[dev]._setValue(s2.match[dev] || '');
    const n = Object.values(s2.match).filter(Boolean).length;
    assignedEl.textContent = n > 0 ? `${n}/10 assigned` : '';
    assignedEl.style.display = n > 0 ? '' : 'none';
    renderSeq(s2);
  }
  return { el: section, update };
}

// ══════════════════════════════ STAGING FLOOR (C3) ══════════════════════════════
const BAY_ICON = { edge: 'globe', dmz: 'lock', core: 'network', access: 'server', storage: 'hard-drive', wireless: 'radio' };
const CHAIN = ['WAN', 'EDGE', 'DMZ', 'CORE', 'ACCESS', 'STORAGE·WIRELESS'];

function fixedArt(bayId) {
  if (bayId === 'dmz') {
    const grid = h('div', { class: 'art-grid' });
    grid.appendChild(h('div', { class: 'art-box' },
      h('div', { class: 'mono art-label', text: 'web farm' }),
      h('div', { class: 'mono art-main', text: 'WEB-01 · WEB-02 · WEB-03' }),
      h('div', { class: 'mono art-sub', text: '198.51.100.10-12' })));
    grid.appendChild(h('div', { class: 'art-box' },
      h('div', { class: 'mono art-label', text: 'db host' }),
      h('div', { class: 'mono art-main', text: 'SVR-DB (order db)' }),
      h('div', { class: 'mono art-sub', text: '198.51.100.20' })));
    return grid;
  }
  if (bayId === 'access') {
    return h('div', { class: 'art-box art-single' },
      h('div', { class: 'mono art-label', text: 'downlink devices (need PoE + VLANs)' }),
      h('div', { class: 'mono art-main', text: 'STAFF PCs · VOIP PHONES (VLAN 20) · CAMERAS (VLAN 30)' }),
      h('div', { class: 'mono art-sub', text: '192.0.2.0/24 · guest Wi-Fi untrusted' }));
  }
  return null;
}

function buildFloor(s) {
  const section = h('section', { id: 'sec-floor', 'aria-labelledby': 'h-floor', class: 'scroll-mt' });
  const head = window.SectionHead('act 03 · staging floor', 'Rack the floor', '');
  head.querySelector('.section-title').setAttribute('id', 'h-floor');
  section.appendChild(head);
  const subEl = head.querySelector('.section-sub');
  subEl.textContent = '';

  const chain = h('div', { class: 'chain-strip', 'aria-label': 'Traffic chain order' });
  chain.appendChild(h('span', { class: 'mono chain-label', text: 'chain' }));
  CHAIN.forEach((c, i) => {
    const seg = h('span', { class: 'chain-seg' });
    seg.appendChild(h('span', { class: 'mono chain-chip', text: c }));
    if (i < CHAIN.length - 1) seg.appendChild(icon('chevron-right', 'ic-12 chain-arrow'));
    chain.appendChild(seg);
  });
  section.appendChild(chain);

  const grid = h('div', { class: 'bay-grid' });
  const slotRefs = [];
  for (const bay of LAB.BAYS) {
    const slots = LAB.SLOTS.filter((sl) => sl.bay === bay.id);
    const panel = h('div', { class: 'panel bay' });
    const bhead = h('div', { class: 'bay-head' });
    bhead.appendChild(h('span', { class: 'bay-ic' }, icon(BAY_ICON[bay.id], 'ic-16')));
    bhead.appendChild(h('h3', { class: 'bay-title display', text: bay.title }));
    const doneEl = h('span', { class: 'mono bay-count' });
    bhead.appendChild(doneEl);
    panel.appendChild(bhead);
    panel.appendChild(h('p', { class: 'mono bay-subtext', text: bay.sub }));
    panel.appendChild(h('p', { class: 'bay-note', text: bay.chainNote }));
    const list = h('div', { class: 'slot-list', role: 'list' });
    for (const slot of slots) {
      const btn = h('button', { type: 'button', class: 'slot', role: 'listitem', 'data-slot': slot.id });
      const labelEl = h('span', { class: 'mono slot-label' });
      const infoWrap = h('span', { class: 'slot-info' });
      const nameEl = h('span', { class: 'slot-name' });
      const codeEl = h('span', { class: 'mono slot-code' });
      infoWrap.appendChild(nameEl);
      infoWrap.appendChild(codeEl);
      btn.appendChild(labelEl);
      btn.appendChild(infoWrap);
      btn.addEventListener('click', () => onSlotClick(slot, btn));
      list.appendChild(btn);
      slotRefs.push({ slot, btn, labelEl, nameEl, codeEl });
    }
    panel.appendChild(list);
    const art = fixedArt(bay.id);
    if (art) panel.appendChild(art);
    grid.appendChild(panel);
  }
  section.appendChild(grid);

  const inHand = h('p', { class: 'mono in-hand', role: 'status', style: { display: 'none' } });
  section.appendChild(inHand);

  function onSlotClick(slot) {
    const s2 = store.state;
    const cur = s2.placements[slot.id];
    if (s2.selectedDevice) {
      const sel = LAB.DEVICES.find((d) => d.id === s2.selectedDevice);
      if (s2.selectedDevice === slot.accepts) {
        dispatch({ type: 'PLACE', slotId: slot.id, deviceId: s2.selectedDevice });
      } else if (cur) {
        notify(`${sel.name} doesn’t fit an occupied slot taking the ${LAB.DEVICES.find((d) => d.id === slot.accepts).name}. Wrong appliance in the wrong bay is exactly what the objective checks catch.`);
        dispatch({ type: 'SELECT_DEVICE', id: null });
      } else {
        notify(`${sel.name} doesn’t belong in that slot — it takes the ${LAB.DEVICES.find((d) => d.id === slot.accepts).name}. Ask yourself WHERE in the chain this appliance operates.`);
        dispatch({ type: 'SELECT_DEVICE', id: null });
      }
      return;
    }
    if (cur) {
      dispatch({ type: 'UNRACK', slotId: slot.id });
      notify('Unracked — the crate is back in the depot.');
    } else {
      notify('Pick a crate from the DEPOT first, then tap the slot.');
    }
  }

  function update(prev, s2) {
    const filled = LAB.SLOTS.filter((sl) => s2.placements[sl.id]).length;
    subEl.textContent = `Traffic flows left to right through the chain. ${filled}/17 slots filled. Select a crate in the depot, then tap its slot; tap a filled slot to unrack it.`;
    const selected = s2.selectedDevice ? LAB.DEVICES.find((d) => d.id === s2.selectedDevice) : null;
    const highlightedBays = new Set(LAB.SLOTS.filter((sl) => s2.selectedDevice && sl.accepts === s2.selectedDevice && !s2.placements[sl.id]).map((sl) => sl.bay));
    for (const r of slotRefs) {
      const devId = s2.placements[r.slot.id];
      const dev = devId ? LAB.DEVICES.find((d) => d.id === devId) : null;
      const ready = s2.selectedDevice === r.slot.accepts;
      const hi = highlightedBays.has(r.slot.bay);
      r.btn.className = 'slot' + (dev ? ' filled' : ready ? ' ready' : hi ? ' hi' : '');
      r.labelEl.textContent = r.slot.label;
      r.labelEl.className = 'mono slot-label' + (dev ? ' lime' : '');
      r.nameEl.textContent = dev ? dev.name : `${r.slot.caption} — empty`;
      r.nameEl.className = 'slot-name' + (dev ? '' : ' empty');
      r.codeEl.textContent = dev ? `${dev.code} · tap to unrack` : (ready ? 'tap to install selected crate' : '');
      r.codeEl.className = 'mono slot-code' + (dev ? '' : ready ? ' ready-note' : '');
      r.btn.setAttribute('aria-label', dev
        ? `${r.slot.label}: ${dev.name} installed. Tap to unrack.`
        : `${r.slot.label} — empty slot for ${LAB.DEVICES.find((d) => d.id === r.slot.accepts).name}.${ready ? ' Ready to install.' : ''}`);
    }
    // bay panel ring + counts
    grid.querySelectorAll('.bay').forEach((panel, i) => {
      const bay = LAB.BAYS[i];
      const slots = LAB.SLOTS.filter((sl) => sl.bay === bay.id);
      const done = slots.filter((sl) => s2.placements[sl.id]).length;
      panel.classList.toggle('hi-bay', highlightedBays.has(bay.id));
      panel.setAttribute('aria-label', `${bay.title} — ${bay.sub} — ${done} of ${slots.length} slots filled`);
      const countEl = panel.querySelector('.bay-count');
      countEl.textContent = `${done}/${slots.length}`;
    });
    inHand.style.display = selected ? '' : 'none';
    inHand.textContent = selected ? `${selected.code} in hand — highlighted bays accept it.` : '';
  }
  return { el: section, update };
}

// ══════════════════════════════ COMMISSIONING CONSOLES (C3b) ══════════════════════════════
function buildConsole(s) {
  const section = h('section', { id: 'sec-console', 'aria-labelledby': 'h-console', class: 'scroll-mt' });
  const head = window.SectionHead('act 04 · commissioning', 'Commission the appliances', 'Placement is half the job — features are the other half. Every console writes to the same site state the objectives check.');
  head.querySelector('.section-title').setAttribute('id', 'h-console');
  section.appendChild(head);

  const tabs = window.Tabs(['switch', 'firewall', 'sensors', 'loadbalancer', 'proxy', 'storage', 'wireless'], 'switch');
  const root = h('div', { class: 'console-panel panel' });
  root.appendChild(tabs);
  section.appendChild(root);
  const sw = s.accessSwitch, fw = s.firewall;
  let switchRows = {}; // hoisted for update()

  // ── SWITCH ──
  {
    const p = tabs._panel('switch');
    p.className = 'tab-panel console-tab';
    p.appendChild(h('div', { class: 'mono console-context', text: 'SW-A1 · managed PoE access switch — downlinks to PCs, VoIP phones, cameras, APs' }));
    const grid = h('div', { class: 'toggle-grid' });
    switchRows = {
      poe: window.ToggleRow('PoE on access ports', '802.3at budget — powers APs, phones, cameras over the cable', sw.poe, (v) => dispatch({ type: 'SET_SWITCH', key: 'poe', value: v })),
      vlanStaff: window.ToggleRow('VLAN 10 — staff', 'user segment 192.0.2.0/24', sw.vlanStaff, (v) => dispatch({ type: 'SET_SWITCH', key: 'vlanStaff', value: v })),
      vlanVoice: window.ToggleRow('VLAN 20 — voice', 'VoIP phones isolated from staff data', sw.vlanVoice, (v) => dispatch({ type: 'SET_SWITCH', key: 'vlanVoice', value: v })),
      vlanCamera: window.ToggleRow('VLAN 30 — cameras', 'IoT video segment, no LAN reach', sw.vlanCamera, (v) => dispatch({ type: 'SET_SWITCH', key: 'vlanCamera', value: v })),
      stp: window.ToggleRow('Spanning tree (STP)', 'blocks redundant paths — kills broadcast storms', sw.stp, (v) => dispatch({ type: 'SET_SWITCH', key: 'stp', value: v })),
      portSecurity: window.ToggleRow('Port security', 'max 2 sticky MACs per user port — rogue devices bounce', sw.portSecurity, (v) => dispatch({ type: 'SET_SWITCH', key: 'portSecurity', value: v })),
      trunkTagging: window.ToggleRow('802.1Q trunk tagging (uplink)', 'carry VLANs 10/20/30 to the core over one link', sw.trunkTagging, (v) => dispatch({ type: 'SET_SWITCH', key: 'trunkTagging', value: v })),
      portMirror: window.ToggleRow('Port mirroring (SPAN → IDS)', 'copy core traffic to the passive IDS tap', sw.portMirror, (v) => dispatch({ type: 'SET_SWITCH', key: 'portMirror', value: v })),
    };
    Object.values(switchRows).forEach((r) => grid.appendChild(r));
    p.appendChild(grid);
    p.appendChild(h('p', { class: 'console-foot', text: 'Unmanaged switches offer none of this — that is the whole point of “managed” on the exam.' }));
  }

  // ── FIREWALL ──
  let ruleList, paletteWrap, fwModeSel, fwDmzSw, fwEgressSw;
  {
    const p = tabs._panel('firewall');
    p.className = 'tab-panel console-tab';
    const grid = h('div', { class: 'fw-grid' });
    const left = h('div', { class: 'stack' });
    const modeBox = h('div', { class: 'box' });
    modeBox.appendChild(h('div', { class: 'box-label', text: 'Inspection mode' }));
    fwModeSel = window.LabSelect([
      { v: 'stateless', t: 'STATELESS — per-packet ACL, no connection memory' },
      { v: 'stateful', t: 'STATEFUL — tracks sessions, auto-allows established/related' },
    ], fw.mode, 'Firewall inspection mode', (v) => dispatch({ type: 'SET_FW', key: 'mode', value: v }));
    fwModeSel.classList.add('lg-select');
    modeBox.appendChild(fwModeSel);
    left.appendChild(modeBox);
    fwDmzSw = window.ToggleRow('DMZ zone enabled', 'published servers get their own half-trusted segment', fw.dmzZone, (v) => dispatch({ type: 'SET_FW', key: 'dmzZone', value: v }));
    left.appendChild(fwDmzSw);
    fwEgressSw = window.ToggleRow('WAN egress only via proxy', 'staff web must leave through the forward proxy', fw.proxyOnlyEgress, (v) => dispatch({ type: 'SET_FW', key: 'proxyOnlyEgress', value: v }));
    left.appendChild(fwEgressSw);
    left.appendChild(h('div', { class: 'implicit-deny' },
      h('span', { class: 'mono implicit-label', text: 'rule 0 / implicit: ' }),
      h('span', { class: 'implicit-deny-text', text: 'DENY ip any any' }),
      document.createTextNode(' — always last, never listed. Unlisted traffic dies here.')));
    grid.appendChild(left);

    const right = h('div', null);
    right.appendChild(h('div', { class: 'mono rulebase-label', text: 'Rule base — top-down, first match wins' }));
    ruleList = h('ol', { class: 'rule-list' });
    right.appendChild(ruleList);
    paletteWrap = h('div', { class: 'palette-wrap' });
    right.appendChild(paletteWrap);
    grid.appendChild(right);
    p.appendChild(grid);
  }

  function renderRules(s2) {
    const fw2 = s2.firewall;
    ruleList.innerHTML = '';
    if (!fw2.rules.length) {
      ruleList.appendChild(h('li', { class: 'rule-empty', text: 'empty rule base — everything hits the implicit deny' }));
    }
    fw2.rules.forEach((r, i) => {
      const def = LAB.FW_RULES[r];
      const li = h('li', { class: 'rule-item' + (def.good ? '' : ' toxic') });
      li.appendChild(h('span', { class: 'mono rule-num', text: String(i + 1) }));
      li.appendChild(h('span', { class: 'rule-text', text: def.text }));
      const up = h('button', {
        type: 'button', class: 'icon-btn', 'aria-label': `Move rule ${i + 1} up`,
        disabled: i === 0 ? '' : undefined,
        onclick: () => dispatch({ type: 'FW_MOVE', rule: r, dir: -1 }),
      }, icon('arrow-up', 'ic-14'));
      const down = h('button', {
        type: 'button', class: 'icon-btn', 'aria-label': `Move rule ${i + 1} down`,
        disabled: i === fw2.rules.length - 1 ? '' : undefined,
        onclick: () => dispatch({ type: 'FW_MOVE', rule: r, dir: 1 }),
      }, icon('arrow-down', 'ic-14'));
      const del = h('button', {
        type: 'button', class: 'icon-btn del', 'aria-label': `Delete rule ${i + 1}`,
        onclick: () => dispatch({ type: 'FW_DEL', rule: r }),
      }, icon('x', 'ic-14'));
      li.appendChild(up); li.appendChild(down); li.appendChild(del);
      ruleList.appendChild(li);
    });
    paletteWrap.innerHTML = '';
    const palette = Object.keys(LAB.FW_RULES).filter((r) => !fw2.rules.includes(r));
    if (palette.length) {
      paletteWrap.appendChild(h('div', { class: 'mono palette-label', text: 'rule palette — add in the right ORDER' }));
      const list = h('div', { class: 'palette-list' });
      for (const r of palette) {
        list.appendChild(h('button', {
          type: 'button', class: 'palette-btn', 'aria-label': `Add rule: ${LAB.FW_RULES[r].text}`,
          onclick: () => dispatch({ type: 'FW_ADD', rule: r }),
          text: '+ ' + LAB.FW_RULES[r].text,
        }));
      }
      paletteWrap.appendChild(list);
    }
  }

  // ── SENSORS ──
  let idsSel, ipsSel;
  {
    const p = tabs._panel('sensors');
    p.className = 'tab-panel console-tab';
    const grid = h('div', { class: 'sensor-grid' });
    const modeOptions = [
      { v: 'signature', t: 'SIGNATURE — known-bad patterns, precise' },
      { v: 'anomaly', t: 'ANOMALY — learned baseline, catches the unknown' },
    ];
    const boxA = h('div', { class: 'box sensor-box' });
    boxA.appendChild(h('div', { class: 'mono sensor-name' }, icon('power', 'ic-12'), ' SNS-P · passive IDS · core bay · SPAN tap'));
    boxA.appendChild(h('p', { class: 'sensor-desc', text: 'Sees a COPY of core traffic. Alerts but cannot block. Needs SPAN enabled on the switch console.' }));
    boxA.appendChild(h('div', { class: 'box-label', text: 'Detection mode' }));
    idsSel = window.LabSelect(modeOptions, s.sensors.idsMode, 'IDS detection mode', (v) => dispatch({ type: 'SET_SENSOR', which: 'idsMode', value: v }));
    idsSel.classList.add('lg-select');
    boxA.appendChild(idsSel);
    const boxB = h('div', { class: 'box sensor-box' });
    boxB.appendChild(h('div', { class: 'mono sensor-name' }, icon('power', 'ic-12'), ' SNS-I · inline IPS · edge bay · on the path'));
    boxB.appendChild(h('p', { class: 'sensor-desc', text: 'Stands INSIDE the traffic path — can reset/drop malicious flows in real time.' }));
    boxB.appendChild(h('div', { class: 'box-label', text: 'Detection mode' }));
    ipsSel = window.LabSelect(modeOptions, s.sensors.ipsMode, 'IPS detection mode', (v) => dispatch({ type: 'SET_SENSOR', which: 'ipsMode', value: v }));
    ipsSel.classList.add('lg-select');
    boxB.appendChild(ipsSel);
    grid.appendChild(boxA); grid.appendChild(boxB);
    p.appendChild(grid);
    p.appendChild(h('p', { class: 'console-foot', text: 'Placement = capability: a mirror can shout, an inline box can shove. Signature = certainty about the past; anomaly = suspicion about the new.' }));
  }

  // ── LOAD BALANCER ──
  let lbAlgoSel, lbHealth, lbPersist, drainBtn, sliders = {};
  {
    const p = tabs._panel('loadbalancer');
    p.className = 'tab-panel console-tab';
    const grid = h('div', { class: 'fw-grid' });
    const left = h('div', { class: 'stack' });
    const algoBox = h('div', { class: 'box' });
    algoBox.appendChild(h('div', { class: 'box-label', text: 'Scheduling algorithm (VIP 198.51.100.30)' }));
    lbAlgoSel = window.LabSelect([
      { v: 'round-robin', t: 'ROUND ROBIN — equal turns' },
      { v: 'weighted-rr', t: 'WEIGHTED ROUND ROBIN — proportional to capacity' },
      { v: 'least-conn', t: 'LEAST CONNECTIONS — to the least busy node' },
      { v: 'src-ip', t: 'SOURCE-IP HASH — same client, same node' },
    ], s.lb.algorithm, 'Load balancer algorithm', (v) => dispatch({ type: 'SET_LB_ALGO', value: v }));
    lbAlgoSel.classList.add('lg-select');
    algoBox.appendChild(lbAlgoSel);
    left.appendChild(algoBox);
    lbHealth = window.ToggleRow('Health checks', 'probe /health every 5s — dead members stop receiving clients', s.lb.healthChecks, (v) => dispatch({ type: 'SET_LB', key: 'healthChecks', value: v }));
    left.appendChild(lbHealth);
    lbPersist = window.ToggleRow('Session persistence', 'pin each client to its node — in-memory cart sessions', s.lb.persistence, (v) => dispatch({ type: 'SET_LB', key: 'persistence', value: v }));
    left.appendChild(lbPersist);
    const drainBox = h('div', { class: 'box' });
    const drainRow = h('div', { class: 'drain-row' });
    drainRow.appendChild(h('span', { class: 'drain-name', text: 'WEB-03 · drain from rotation' }));
    drainBtn = h('button', {
      type: 'button', class: 'btn-outline-red drain-btn mono',
      onclick: () => {
        dispatch({ type: 'SET_LB', key: 'web3Drained', value: true });
        notify('WEB-03 drained — it no longer receives new sessions.');
      },
    });
    drainRow.appendChild(drainBtn);
    drainBox.appendChild(drainRow);
    drainBox.appendChild(h('div', { class: 'drain-sub', text: 'Probe failures ×5 — fail it manually or wait for the health check to do it.' }));
    left.appendChild(drainBox);
    grid.appendChild(left);

    const right = h('div', { class: 'box weights-box' });
    right.appendChild(h('div', { class: 'mono weights-label', text: 'Pool capacity (weights)' }));
    [['w1', 'WEB-01', ''], ['w2', 'WEB-02', '· 2× CPU'], ['w3', 'WEB-03', '']].forEach(([k, name, tag], i) => {
      const rowEl = h('div', { class: 'weight-row' });
      const topRow = h('div', { class: 'weight-top' });
      const nameSpan = h('span', null, `${name}${i === 1 ? ' ' : ''}`);
      if (i === 1) nameSpan.appendChild(h('span', { class: 'cpu-tag', text: '· 2× CPU' }));
      const wLabel = h('span', { class: 'mono weight-val' });
      topRow.appendChild(nameSpan);
      topRow.appendChild(wLabel);
      rowEl.appendChild(topRow);
      const slider = window.LabSlider(1, 4, 1, s.lb[k], `WEB-0${i + 1} weight`, (v) => dispatch({ type: 'SET_LB_W', which: k, value: v }));
      rowEl.appendChild(slider);
      right.appendChild(rowEl);
      sliders[k] = { slider, wLabel };
    });
    right.appendChild(h('p', { class: 'weights-note', text: 'Weighted RR sends share ∝ weight. Least-connections instead counts live sessions — better when request durations vary. Source-IP hash is persistence by another name.' }));
    grid.appendChild(right);
    p.appendChild(grid);
  }

  // ── PROXY ──
  let pxF, pxC, pxFilter, pxTls, pxWaf, denyLine;
  {
    const p = tabs._panel('proxy');
    p.className = 'tab-panel console-tab';
    const grid = h('div', { class: 'sensor-grid' });
    const left = h('div', { class: 'stack' });
    left.appendChild(h('div', { class: 'mono console-col-label amber', text: 'PXY-F · forward proxy · egress (outbound)' }));
    pxF = window.ToggleRow('Forward proxy enabled', 'staff browsing exits here — logged, filtered, cached', s.proxies.fEnabled, (v) => dispatch({ type: 'SET_PROXY', key: 'fEnabled', value: v }));
    pxC = window.ToggleRow('Object caching', 'serve repeated downloads locally, save the WAN', s.proxies.fCaching, (v) => dispatch({ type: 'SET_PROXY', key: 'fCaching', value: v }));
    pxFilter = window.ToggleRow('Category filtering', 'block malware/phishing/gambling categories by policy', s.proxies.fFilter, (v) => dispatch({ type: 'SET_PROXY', key: 'fFilter', value: v }));
    left.appendChild(pxF); left.appendChild(pxC); left.appendChild(pxFilter);
    denyLine = h('div', { class: 'box deny-line' });
    left.appendChild(denyLine);
    const right = h('div', { class: 'stack' });
    right.appendChild(h('div', { class: 'mono console-col-label lime', text: 'PXY-R · reverse proxy · ingress (inbound)' }));
    pxTls = window.ToggleRow('TLS offload', 'terminate https at the door; farm speaks plain http inside', s.proxies.rTls, (v) => dispatch({ type: 'SET_PROXY', key: 'rTls', value: v }));
    pxWaf = window.ToggleRow('WAF rules', 'inspect requests for injection/header abuse before the farm sees them', s.proxies.rWaf, (v) => dispatch({ type: 'SET_PROXY', key: 'rWaf', value: v }));
    right.appendChild(pxTls); right.appendChild(pxWaf);
    right.appendChild(h('p', { class: 'mnemonic' }, 'Mnemonic: ', h('strong', { class: 'strong-mid', text: 'forward follows the clients out' }), '; reverse receives the visitors in.'));
    grid.appendChild(left); grid.appendChild(right);
    p.appendChild(grid);
  }

  // ── STORAGE ──
  let nasSel, sanSel;
  {
    const p = tabs._panel('storage');
    p.className = 'tab-panel console-tab';
    const grid = h('div', { class: 'sensor-grid' });
    const boxA = h('div', { class: 'box sensor-box' });
    boxA.appendChild(h('div', { class: 'mono console-col-label amber', text: 'NAS-1 · file-level · LAN attached' }));
    boxA.appendChild(h('p', { class: 'sensor-desc', text: 'Clients mount shares and see files & folders. Office shares, media, private cloud.' }));
    boxA.appendChild(h('div', { class: 'box-label', text: 'Share protocol' }));
    nasSel = window.LabSelect([
      { v: 'none', t: '— not configured —' },
      { v: 'smb', t: 'SMB / CIFS — Windows file shares' },
      { v: 'nfs', t: 'NFS — Unix/Linux shares' },
    ], s.storage.nasProto, 'NAS protocol', (v) => dispatch({ type: 'SET_STORAGE', key: 'nasProto', value: v }));
    nasSel.classList.add('lg-select');
    boxA.appendChild(nasSel);
    const boxB = h('div', { class: 'box sensor-box' });
    boxB.appendChild(h('div', { class: 'mono console-col-label lime', text: 'SAN-1 · block-level · dedicated fabric' }));
    boxB.appendChild(h('p', { class: 'sensor-desc', text: 'Hosts receive raw LUNs they format as local disks. Databases, hypervisor datastores.' }));
    boxB.appendChild(h('div', { class: 'box-label', text: 'Fabric protocol' }));
    sanSel = window.LabSelect([
      { v: 'none', t: '— not configured —' },
      { v: 'iscsi', t: 'iSCSI — SCSI over Ethernet/IP, cost-effective' },
      { v: 'fc', t: 'Fibre Channel — dedicated fabric, lowest latency' },
      { v: 'fcoe', t: 'FCoE — FC frames over Ethernet' },
    ], s.storage.sanProto, 'SAN protocol', (v) => dispatch({ type: 'SET_STORAGE', key: 'sanProto', value: v }));
    sanSel.classList.add('lg-select');
    boxB.appendChild(sanSel);
    grid.appendChild(boxA); grid.appendChild(boxB);
    p.appendChild(grid);
    p.appendChild(h('p', { class: 'console-foot', text: 'One rule: SHARE files → NAS · FEED disks → SAN.' }));
  }

  // ── WIRELESS ──
  let apAuto, roam, extCostField;
  const planSelects = {};
  {
    const p = tabs._panel('wireless');
    p.className = 'tab-panel console-tab';
    const grid = h('div', { class: 'fw-grid' });
    const left = h('div', { class: 'stack' });
    left.appendChild(h('div', { class: 'mono console-col-label amber', text: 'WLC-1 · wireless controller · AP brain' }));
    apAuto = window.ToggleRow('AP auto-provision', 'rack-mount an AP anywhere — it pulls config from the controller', s.wireless.autoProvision, (v) => dispatch({ type: 'SET_WIRELESS', key: 'autoProvision', value: v }));
    roam = window.ToggleRow('Fast/secure roaming', 'client context rides AP-to-AP handoffs — calls survive', s.wireless.roaming, (v) => dispatch({ type: 'SET_WIRELESS', key: 'roaming', value: v }));
    left.appendChild(apAuto); left.appendChild(roam);
    extCostField = window.McField({
      question: 'What does a range extender cost you?',
      options: [
        { v: 'nothing', t: 'Nothing — it repeats at full rate' },
        { v: 'half', t: 'About half the throughput — the same radio must receive then re-transmit' },
        { v: 'double', t: 'It doubles throughput with two channels' },
        { v: 'latency-only', t: 'Only adds latency, no throughput cost' },
      ],
      value: s.mc['extCost'] || '', name: 'mc-extCost',
      onChange: (v) => dispatch({ type: 'SET_MC', key: 'extCost', value: v }),
    });
    left.appendChild(extCostField);
    const right = h('div', { class: 'stack' });
    right.appendChild(h('div', { class: 'mono console-col-label lime', text: 'Link & coverage planner' }));
    [
      { key: 'warehouse', q: 'Warehouse B — 20 wired PCs, no cable path across the yard', hint: 'link two WIRED segments' },
      { key: 'dock', q: 'Loading dock — one client-coverage dead zone', hint: 'repeat radio for clients' },
      { key: 'mezzanine', q: 'Mezzanine office — 30 new desks, capacity needed', hint: 'a real AP on the controller' },
    ].forEach((row) => {
      const boxEl = h('div', { class: 'box plan-box' });
      boxEl.appendChild(h('div', { class: 'plan-q', text: row.q }));
      boxEl.appendChild(h('div', { class: 'plan-hint', text: `tool needed: ${row.hint}` }));
      const sel = window.LabSelect([
        { v: '', t: 'choose the right tool…', disabled: true },
        { v: 'ap', t: 'Access point (+ controller)' },
        { v: 'extender', t: 'Range extender' },
        { v: 'bridge', t: 'Wireless bridge' },
      ], s.wlPlan[row.key] || '', `Device for ${row.key}`, (v) => dispatch({ type: 'SET_PLAN', board: 'wlPlan', key: row.key, value: v }));
      sel.classList.add('sm-select');
      boxEl.appendChild(sel);
      right.appendChild(boxEl);
      planSelects[row.key] = sel;
    });
    grid.appendChild(left); grid.appendChild(right);
    p.appendChild(grid);
  }

  function update(prev, s2) {
    const sw2 = s2.accessSwitch, fw2 = s2.firewall;
    for (const k of Object.keys(switchRows)) switchRows[k]._sw._setChecked(sw2[k]);
    fwModeSel._setValue(fw2.mode);
    fwDmzSw._sw._setChecked(fw2.dmzZone);
    fwEgressSw._sw._setChecked(fw2.proxyOnlyEgress);
    renderRules(s2);
    idsSel._setValue(s2.sensors.idsMode);
    ipsSel._setValue(s2.sensors.ipsMode);
    lbAlgoSel._setValue(s2.lb.algorithm);
    lbHealth._sw._setChecked(s2.lb.healthChecks);
    lbPersist._sw._setChecked(s2.lb.persistence);
    if (s2.lb.web3Drained) { drainBtn.setAttribute('disabled', ''); drainBtn.textContent = 'drained ✓'; }
    else { drainBtn.removeAttribute('disabled'); drainBtn.textContent = 'drain node'; }
    for (const k of ['w1', 'w2', 'w3']) {
      sliders[k].slider._setValue(s2.lb[k]);
      sliders[k].wLabel.textContent = `weight ${s2.lb[k]}`;
    }
    pxF._sw._setChecked(s2.proxies.fEnabled);
    pxC._sw._setChecked(s2.proxies.fCaching);
    pxFilter._sw._setChecked(s2.proxies.fFilter);
    pxTls._sw._setChecked(s2.proxies.rTls);
    pxWaf._sw._setChecked(s2.proxies.rWaf);
    denyLine.innerHTML = '';
    denyLine.appendChild(document.createTextNode('Domain deny-list: '));
    if (s2.proxies.denyList) denyLine.appendChild(h('span', { class: 'mono deny-on', text: 'cdn-updates.example.tk ✕ added' }));
    else denyLine.appendChild(h('span', { class: 'deny-off', text: 'empty — add domains from the evidence wall when an incident demands it' }));
    nasSel._setValue(s2.storage.nasProto);
    sanSel._setValue(s2.storage.sanProto);
    apAuto._sw._setChecked(s2.wireless.autoProvision);
    roam._sw._setChecked(s2.wireless.roaming);
    extCostField._setValue(s2.mc['extCost'] || '');
    for (const k of Object.keys(planSelects)) planSelects[k]._setValue(s2.wlPlan[k] || '');
  }
  return { el: section, update };
}

// ══════════════════════════════ EVIDENCE WALL (C3c) ══════════════════════════════
function ActButton(done, label, doneLabel, onClick, tone) {
  const color = tone === 'red' ? C.red : C.amber;
  const btn = h('button', { type: 'button', class: 'act-btn mono' });
  btn.style.color = color;
  btn.style.borderColor = color + '66';
  btn.addEventListener('click', onClick);
  const api = { btn };
  api.set = (isDone) => {
    btn.disabled = isDone;
    btn.style.background = isDone ? 'transparent' : color + '14';
    btn.textContent = isDone ? `✓ ${doneLabel}` : label;
    btn.setAttribute('aria-label', isDone ? `${doneLabel} (done)` : label);
  };
  api.set(done);
  return api;
}

function buildEvidence(s) {
  const section = h('section', { id: 'sec-evidence', 'aria-labelledby': 'h-evidence', class: 'scroll-mt' });
  const head = window.SectionHead('act 05 · evidence wall', 'Overnight triage', 'The floor went live at 18:00. This is what the logs caught before you clocked in. Everything is synthetic training data.');
  head.querySelector('.section-title').setAttribute('id', 'h-evidence');
  section.appendChild(head);
  const stack = h('div', { class: 'stack' });
  section.appendChild(stack);

  // ── BOARD A (always) ──
  const boardA = h('div', { class: 'panel board' });
  const aHead = h('div', { class: 'board-head' });
  aHead.appendChild(h('h3', { class: 'board-btitle display', text: 'Board A · alert stream' }));
  aHead.appendChild(window.StatusChip(false, 'classify TP / FP'));
  boardA.appendChild(aHead);
  boardA.appendChild(h('p', { class: 'board-sub', text: 'SNS-P + SNS-I feeds, 02:00–06:00. True positive = real hostility. False positive = the sensor crying wolf.' }));
  const aList = h('div', { class: 'alert-list' });
  const alertRefs = [];
  for (const a of LAB.ALERTS) {
    const card = h('div', { class: 'alert-card' });
    const top = h('div', { class: 'alert-top' });
    top.appendChild(h('span', { class: 'mono alert-id', text: a.id }));
    top.appendChild(h('span', { class: 'mono alert-sig', text: a.sig }));
    top.appendChild(h('span', { class: 'mono alert-meta', text: a.meta }));
    const fs = h('fieldset', { class: 'alert-fs' });
    fs.appendChild(h('legend', { class: 'sr-only', text: `Classify ${a.id}` }));
    const group = h('div', { class: 'verdict-group', role: 'radiogroup', 'aria-label': `Verdict for ${a.id}` });
    const radios = {};
    for (const v of ['tp', 'fp']) {
      const id = `alert-${a.id}-${v}`;
      const lab = h('label', { class: 'verdict-label', for: id });
      const radio = h('input', { type: 'radio', id, name: `alert-${a.id}`, value: v, 'aria-label': `${a.id} ${v === 'tp' ? 'true positive' : 'false positive'}` });
      radio.addEventListener('change', () => { if (radio.checked) dispatch({ type: 'SET_ALERT_VERDICT', id: a.id, value: v }); });
      lab.appendChild(radio);
      lab.appendChild(h('span', { class: 'mono', text: v === 'tp' ? 'TP' : 'FP' }));
      group.appendChild(lab);
      radios[v] = radio;
    }
    fs.appendChild(group);
    top.appendChild(fs);
    card.appendChild(top);
    card.appendChild(h('div', { class: 'mono alert-msg', text: a.msg }));
    aList.appendChild(card);
    alertRefs.push({ a, radios });
  }
  boardA.appendChild(aList);
  stack.appendChild(boardA);

  // hard-only boards
  const hardRefs = {};
  if (s.mode === 'hard') {
    // BOARD B — storm
    const b = h('div', { class: 'panel board' });
    const bHead = h('div', { class: 'board-head' });
    bHead.appendChild(h('h3', { class: 'board-btitle display', text: 'Board B · the storm' }));
    bHead.appendChild(window.StatusChip(false, 'incident 01 · layer-2 loop'));
    b.appendChild(bHead);
    b.appendChild(h('p', { class: 'board-sub', text: '“Network died after the interns ‘helped’.” Read SW-A1’s log, find the loop, break it, then answer the referee question.' }));
    const bGrid = h('div', { class: 'board-grid2' });
    bGrid.appendChild(window.LogBox('SW-A1 console log', LAB.STP_LOG, 'alarm'));
    const bRight = h('div', { class: 'stack' });
    const stpAct = ActButton(s.accessSwitch.stp, 're-enable STP on SW-A1 (switch console)', 'STP re-enabled', () => dispatch({ type: 'SET_SWITCH', key: 'stp', value: true }), 'amber');
    const pullAct = ActButton(s.loopPulled, 'pull rogue patch link Gi0/3 ↔ Gi0/4', 'rogue link pulled', () => dispatch({ type: 'ACT', key: 'loopPulled' }), 'red');
    bRight.appendChild(stpAct.btn);
    bRight.appendChild(pullAct.btn);
    const rootFs = window.McField({
      legend: 'referee question',
      question: 'The root bridge — the switch all STP loop decisions hang off — is elected by…',
      options: [
        { v: 'lowest', t: 'Lowest bridge ID (priority + MAC)' },
        { v: 'highest', t: 'Highest MAC address' },
        { v: 'newest', t: 'Newest switch model' },
        { v: 'mgmt', t: 'Whatever the DHCP server picks' },
      ],
      value: s.mc['stpRoot'] || '', name: 'mc-stpRoot',
      onChange: (v) => dispatch({ type: 'SET_MC', key: 'stpRoot', value: v }),
    });
    bRight.appendChild(rootFs);
    bGrid.appendChild(bRight);
    b.appendChild(bGrid);
    stack.appendChild(b);
    hardRefs.stpAct = stpAct; hardRefs.pullAct = pullAct; hardRefs.rootFs = rootFs;

    // BOARD B2 — storage audit
    const b2 = h('div', { class: 'panel board' });
    const b2Head = h('div', { class: 'board-head' });
    b2Head.appendChild(h('h3', { class: 'board-btitle display', text: 'Board B2 · the storage audit' }));
    b2Head.appendChild(window.StatusChip(false, 'capacity planning · 3 workloads'));
    b2.appendChild(b2Head);
    b2.appendChild(h('p', { class: 'board-sub', text: 'Growth team wants three very different things. Pick class AND protocol per workload — one wrong pick fails the audit.' }));
    const b2Grid = h('div', { class: 'storage-plan-grid' });
    const planRefs = {};
    [
      { key: 'w1', q: 'W1 · 14 video editors', d: 'shared project files over the LAN, Windows + Mac mix', aria: 'storage plan for editors' },
      { key: 'w2', q: 'W2 · vSphere cluster', d: 'raw disks for 60 VMs, steady sequential I/O, budget-conscious', aria: 'storage plan for virtualization' },
      { key: 'w3', q: 'W3 · analytics database', d: 'hot data warehouse, latency-sensitive, money is no object', aria: 'storage plan for analytics database' },
    ].forEach((w) => {
      const boxEl = h('div', { class: 'box plan-box' });
      boxEl.appendChild(h('div', { class: 'plan-q', text: w.q }));
      boxEl.appendChild(h('div', { class: 'plan-hint', text: w.d }));
      const sel = window.LabSelect([
        { v: '', t: 'class + protocol…', disabled: true },
        { v: 'nas-smb', t: 'NAS + SMB (file shares)' },
        { v: 'nas-nfs', t: 'NAS + NFS (file shares)' },
        { v: 'san-iscsi', t: 'SAN + iSCSI (block)' },
        { v: 'san-fc', t: 'SAN + Fibre Channel (block)' },
      ], s.storagePlan[w.key] || '', w.aria, (v) => dispatch({ type: 'SET_PLAN', board: 'storagePlan', key: w.key, value: v }));
      sel.classList.add('sm-select');
      boxEl.appendChild(sel);
      b2Grid.appendChild(boxEl);
      planRefs[w.key] = sel;
    });
    b2.appendChild(b2Grid);
    b2.appendChild(h('p', { class: 'console-foot', text: 'Rule of thumb being tested: SHARE files → NAS · FEED disks → SAN · then pick the fabric the latency budget can afford.' }));
    stack.appendChild(b2);
    hardRefs.planRefs = planRefs;

    // BOARD C — intrusion chain
    const c = h('div', { class: 'panel board' });
    const cHead = h('div', { class: 'board-head' });
    cHead.appendChild(h('h3', { class: 'board-btitle display', text: 'Board C · the one that got in (almost)' }));
    cHead.appendChild(window.StatusChip(false, 'incident 02 · correlate three logs'));
    c.appendChild(cHead);
    c.appendChild(h('p', { class: 'board-sub', text: 'Two external sources, two outcomes. Assign each event to the control that actually handled it — then silence the noise properly.' }));
    const logs = h('div', { class: 'board-grid3' });
    logs.appendChild(window.LogBox('FW-01 log', LAB.CHAIN_FW_LOG));
    logs.appendChild(window.LogBox('sensor log', LAB.CHAIN_SENSOR_LOG));
    logs.appendChild(window.LogBox('PXY-F log', LAB.CHAIN_PROXY_LOG));
    c.appendChild(logs);
    const cGrid = h('div', { class: 'chain-q-grid' });
    const chainSels = {};
    const chainQ = [
      { q: 1, title: 'Q1 · Who BLOCKED the 3389/445 scan?', aria: 'Which control blocked the port scan', ph: 'pick control…', options: [
        { v: 'router', t: 'edge router' }, { v: 'firewall', t: 'firewall (implicit deny)' }, { v: 'lb', t: 'load balancer' }, { v: 'switch', t: 'core switch' }] },
      { q: 2, title: 'Q2 · Who DETECTED + DROPPED the SQLi?', aria: 'Which sensor detected the SQL injection', ph: 'pick sensor…', options: [
        { v: 'ids', t: 'core IDS (passive)' }, { v: 'ips', t: 'inline IPS' }, { v: 'proxy', t: 'forward proxy' }, { v: 'none', t: 'nothing detected it' }] },
      { q: 3, title: 'Q3 · Which placement can BLOCK?', aria: 'Which sensor placement can block traffic', ph: 'pick placement…', options: [
        { v: 'passive', t: 'passive, on a SPAN tap' }, { v: 'inline', t: 'inline, on the path' }, { v: 'either', t: 'either works the same' }, { v: 'dmz', t: 'only if moved to the DMZ' }] },
    ];
    chainQ.forEach((cq) => {
      const boxEl = h('div', { class: 'box plan-box' });
      boxEl.appendChild(h('div', { class: 'plan-q sm', text: cq.title }));
      const sel = window.LabSelect([{ v: '', t: cq.ph, disabled: true }].concat(cq.options), s.chain['q' + cq.q] || '', cq.aria, (v) => dispatch({ type: 'SET_CHAIN', q: cq.q, value: v }));
      sel.classList.add('sm-select');
      boxEl.appendChild(sel);
      cGrid.appendChild(boxEl);
      chainSels[cq.q] = sel;
    });
    c.appendChild(cGrid);
    const tuneWrap = h('div', { class: 'stack' });
    const tuneAct = ActButton(s.sigTuned, 'tune noisy signature (Apache banner) — leave the sensor, fix the sig', 'signature tuned', () => dispatch({ type: 'ACT', key: 'sigTuned' }), 'amber');
    tuneWrap.appendChild(tuneAct.btn);
    c.appendChild(tuneWrap);
    stack.appendChild(c);
    hardRefs.chainSels = chainSels; hardRefs.tuneAct = tuneAct;

    // BOARD D — pool failure
    const d = h('div', { class: 'panel board' });
    const dHead = h('div', { class: 'board-head' });
    dHead.appendChild(h('h3', { class: 'board-btitle display', text: 'Board D · the pool is limping' }));
    dHead.appendChild(window.StatusChip(false, 'incident 03 · node failure'));
    d.appendChild(dHead);
    d.appendChild(h('p', { class: 'board-sub', text: 'The web farm at 07:12. WEB-03 is failing probes; the order app keeps cart sessions in node memory. Stabilize the pool.' }));
    const tableWrap = h('div', { class: 'pool-table-wrap' });
    const table = h('table', { class: 'pool-table mono', 'aria-label': 'Load balancer pool status' });
    table.appendChild(h('thead', null, h('tr', { class: 'pool-thead' },
      h('th', { class: 'mono', text: 'node' }), h('th', { class: 'mono', text: 'ip' }), h('th', { class: 'mono', text: 'state' }),
      h('th', { class: 'mono hide-sm', text: 'rtt' }), h('th', { class: 'mono hide-sm', text: 'conns' }))));
    const tbody = h('tbody');
    const poolCells = {};
    for (const n of LAB.LB_POOL) {
      const tr = h('tr');
      const nodeTd = h('td', { class: 'pool-node', text: n.node });
      const ipTd = h('td', { text: n.ip });
      const stateTd = h('td');
      const rttTd = h('td', { class: 'hide-sm', text: n.rtt });
      const connsTd = h('td', { class: 'hide-sm', text: String(n.conns) });
      tr.appendChild(nodeTd); tr.appendChild(ipTd); tr.appendChild(stateTd); tr.appendChild(rttTd); tr.appendChild(connsTd);
      tbody.appendChild(tr);
      poolCells[n.node] = { stateTd };
    }
    table.appendChild(tbody);
    tableWrap.appendChild(table);
    d.appendChild(tableWrap);
    const dGrid = h('div', { class: 'board-grid2' });
    const dLeft = h('div', { class: 'stack' });
    const drainAct = ActButton(s.lb.web3Drained, 'drain WEB-03 (also in LB console)', 'WEB-03 drained', () => dispatch({ type: 'SET_LB', key: 'web3Drained', value: true }), 'red');
    dLeft.appendChild(drainAct.btn);
    const algoBox = h('div', { class: 'box' });
    algoBox.appendChild(h('div', { class: 'pool-q', text: 'Re-algorithm for long, uneven requests (checkout uploads):' }));
    const poolAlgoSel = window.LabSelect([
      { v: 'round-robin', t: 'round robin' },
      { v: 'weighted-rr', t: 'weighted round robin' },
      { v: 'least-conn', t: 'least connections' },
      { v: 'src-ip', t: 'source-IP hash' },
    ], s.lb.algorithm, 'Pool algorithm', (v) => dispatch({ type: 'SET_LB_ALGO', value: v }));
    poolAlgoSel.classList.add('sm-select', 'mt');
    algoBox.appendChild(poolAlgoSel);
    const persistLab = h('label', { class: 'persist-label' });
    const persistCheck = h('input', { type: 'checkbox', class: 'persist-check', 'aria-label': 'Enable session persistence' });
    persistCheck.checked = s.lb.persistence;
    persistCheck.addEventListener('change', () => dispatch({ type: 'SET_LB', key: 'persistence', value: persistCheck.checked }));
    persistLab.appendChild(persistCheck);
    persistLab.appendChild(document.createTextNode(' Enable session persistence (pin clients to their node)'));
    algoBox.appendChild(persistLab);
    dLeft.appendChild(algoBox);
    const dRight = window.McField({
      legend: 'justify it',
      question: 'Why would plain round robin hurt this app right now?',
      options: [
        { v: 'session-bounce', t: 'Equal turns ignore connection counts — sessions bounce between nodes, and in-memory carts die' },
        { v: 'slow', t: 'Round robin is slower than least-connections by definition' },
        { v: 'weights', t: 'Round robin cannot use node weights' },
        { v: 'probes', t: 'Round robin disables health checks' },
      ],
      value: s.mc['lbWhy'] || '', name: 'mc-lbWhy',
      onChange: (v) => dispatch({ type: 'SET_MC', key: 'lbWhy', value: v }),
    });
    dGrid.appendChild(dLeft);
    dGrid.appendChild(dRight);
    d.appendChild(dGrid);
    stack.appendChild(d);
    hardRefs.drainAct = drainAct; hardRefs.poolAlgoSel = poolAlgoSel; hardRefs.persistCheck = persistCheck; hardRefs.poolCells = poolCells; hardRefs.lbWhyFs = dRight;

    // BOARD E — beacon
    const e = h('div', { class: 'panel board' });
    const eHead = h('div', { class: 'board-head' });
    eHead.appendChild(h('h3', { class: 'board-btitle display', text: 'Board E · calling home' }));
    eHead.appendChild(window.StatusChip(false, 'incident 04 · suspected C2 beacon'));
    e.appendChild(eHead);
    e.appendChild(h('p', { class: 'board-sub', text: 'PXY-F egress log, host 192.0.2.77. Machine-cadence GETs to an “update CDN” nobody installed. Cut it on three layers.' }));
    const eGrid = h('div', { class: 'board-grid2' });
    eGrid.appendChild(window.LogBox('PXY-F egress log', LAB.BEACON_LOG, 'alarm'));
    const eRight = h('div', { class: 'stack' });
    const denyAct = ActButton(s.proxies.denyList, 'deny cdn-updates.example.tk on the proxy', 'proxy deny-list updated', () => dispatch({ type: 'SET_PROXY', key: 'denyList', value: true }), 'amber');
    const blockAct = ActButton(s.fwEgressBlock, 'firewall: block egress to 203.0.113.66', 'FW egress block live', () => dispatch({ type: 'ACT', key: 'fwEgressBlock' }), 'red');
    const anomalyAct = ActButton(s.sensors.idsMode === 'anomaly', 'flip IDS to anomaly mode (sensors console)', 'IDS in anomaly mode', () => dispatch({ type: 'SET_SENSOR', which: 'idsMode', value: 'anomaly' }), 'amber');
    eRight.appendChild(denyAct.btn); eRight.appendChild(blockAct.btn); eRight.appendChild(anomalyAct.btn);
    const beaconFs = window.McField({
      legend: 'detection question',
      question: 'Which mode flags callouts no signature has ever seen?',
      options: [
        { v: 'signature', t: 'Signature mode — it matches known patterns' },
        { v: 'anomaly', t: 'Anomaly mode — it flags deviations from the learned baseline' },
        { v: 'span', t: 'SPAN mode' },
        { v: 'none', t: 'Neither — only humans find beacons' },
      ],
      value: s.mc['beacon'] || '', name: 'mc-beacon',
      onChange: (v) => dispatch({ type: 'SET_MC', key: 'beacon', value: v }),
    });
    eRight.appendChild(beaconFs);
    eGrid.appendChild(eRight);
    e.appendChild(eGrid);
    stack.appendChild(e);
    hardRefs.denyAct = denyAct; hardRefs.blockAct = blockAct; hardRefs.anomalyAct = anomalyAct; hardRefs.beaconFs = beaconFs;
  } else {
    const lock = h('div', { class: 'panel lock-panel' });
    lock.appendChild(icon('lock', 'ic-16'));
    const p = h('p', { class: 'lock-text' });
    p.appendChild(document.createTextNode('Boards B–E (storm, intrusion chain, pool failure, beacon) are the '));
    p.appendChild(h('strong', { class: 'strong-mid', text: 'COLD SITE' }));
    p.appendChild(document.createTextNode(' dossier. Finish the guided build — then take the hard shift to unlock them.'));
    lock.appendChild(p);
    stack.appendChild(lock);
  }

  function update(prev, s2) {
    for (const r of alertRefs) {
      const val = s2.alertVerdicts[r.a.id] || '';
      for (const v of ['tp', 'fp']) r.radios[v].checked = val === v;
    }
    if (s2.mode === 'hard' && hardRefs.stpAct) {
      hardRefs.stpAct.set(s2.accessSwitch.stp);
      hardRefs.pullAct.set(s2.loopPulled);
      hardRefs.rootFs._setValue(s2.mc['stpRoot'] || '');
      for (const k of Object.keys(hardRefs.planRefs)) hardRefs.planRefs[k]._setValue(s2.storagePlan[k] || '');
      for (const q of [1, 2, 3]) hardRefs.chainSels[q]._setValue(s2.chain['q' + q] || '');
      hardRefs.tuneAct.set(s2.sigTuned);
      hardRefs.drainAct.set(s2.lb.web3Drained);
      hardRefs.poolAlgoSel._setValue(s2.lb.algorithm);
      if (hardRefs.persistCheck.checked !== s2.lb.persistence) hardRefs.persistCheck.checked = s2.lb.persistence;
      hardRefs.lbWhyFs._setValue(s2.mc['lbWhy'] || '');
      hardRefs.denyAct.set(s2.proxies.denyList);
      hardRefs.blockAct.set(s2.fwEgressBlock);
      hardRefs.anomalyAct.set(s2.sensors.idsMode === 'anomaly');
      hardRefs.beaconFs._setValue(s2.mc['beacon'] || '');
      const cell = hardRefs.poolCells['WEB-03'].stateTd;
      cell.textContent = s2.lb.web3Drained ? 'DRAINED (by you)' : 'PROBE FAIL ×5';
      cell.className = s2.lb.web3Drained ? 'pool-dim' : 'pool-bad';
    }
  }
  return { el: section, update };
}

// ══════════════════════════════ DEBRIEF (C6) ══════════════════════════════
const DETECTION_OPS = [
  { src: 'FW-01 log', look: 'Spikes in implicit-deny hits from one external IP', logic: 'count denies by src where rule = "implicit deny" > 50/min → recon' },
  { src: 'SPAN-fed IDS', look: 'Signature hits with external source + DMZ target', logic: 'alert.severity ≥ high AND src not in RFC1918 → escalate (check A-104-style context first!)' },
  { src: 'Inline IPS log', look: 'RESET-DROP actions on allowed ports (80/443)', logic: 'action = drop GROUP BY signature, src — success rate of the blocking layer' },
  { src: 'SW-A1 (SPAN/STP)', look: 'MAC flapping between two ports + broadcast pps surge', logic: 'mac_moves/port > 5/s AND bcast_pps > 1M → layer-2 loop' },
  { src: 'LB pool stats', look: 'Probe failures, uneven conn counts, drained members', logic: 'health = fail ×3 → drain + page; conn skew > 2× → check persistence' },
  { src: 'PXY-F egress log', look: 'Fixed-cadence requests to one domain (60.0s ±0)', logic: 'stddev(interval) ≈ 0 AND same UA/size ×24h → beacon hunt' },
];
const MITIGATIONS = [
  { id: 'SW hardening', what: 'Managed switches only: VLAN segmentation per function, STP on every port, port security (2 sticky MACs), SPAN for sensors.' },
  { id: 'FW policy', what: 'Stateful at the choke point; DMZ for published services; established-first ordering; explicit deny for staff→DB; egress pinned to the proxy.' },
  { id: 'Sensor layers', what: 'Inline IPS where blocking matters (edge); passive IDS on SPAN for eyes without risk; signature baseline + anomaly once tuned; tune signatures, don\'t disable them.' },
  { id: 'Egress control', what: 'Forward proxy with category filtering + caching; deny-lists for known C2 domains; FW blocks the destination IP behind the domain.' },
  { id: 'LB resilience', what: 'Health checks on (5s probes), drained failed nodes, least-connections for uneven request profiles, persistence for in-memory sessions.' },
  { id: 'Wireless ops', what: 'Controller-managed APs with fast roaming; bridges for building links; extenders only as last-resort client coverage (accept the ~50% tax).' },
];

function buildDebrief(s) {
  const mode = s.mode || 'medium';
  const section = h('section', { id: 'sec-debrief', 'aria-labelledby': 'h-debrief', class: 'scroll-mt' });
  const head = window.SectionHead('act 07 · debrief', 'Field notes & sign-off', 'What a defender wires, watches and assumes — condensed from everything the floor just taught you.');
  head.querySelector('.section-title').setAttribute('id', 'h-debrief');
  section.appendChild(head);

  const grid = h('div', { class: 'debrief-grid' });
  const detectPanel = h('div', { class: 'panel' });
  detectPanel.appendChild(h('div', { class: 'panel-cap lg display' }, icon('shield-alert', 'ic-16 teal'), ' detection opportunities'));
  const tableWrap = h('div', { class: 'detect-table-wrap' });
  const table = h('table', { class: 'detect-table', 'aria-label': 'Detection opportunities' });
  table.appendChild(h('thead', null, h('tr',
    h('th', { class: 'mono', text: 'data source' }), h('th', { class: 'mono', text: 'what to watch' }), h('th', { class: 'mono', text: 'example logic' }))));
  const tbody = h('tbody');
  for (const dOp of DETECTION_OPS) {
    tbody.appendChild(h('tr', null,
      h('td', { class: 'mono detect-src', text: dOp.src }),
      h('td', { class: 'detect-look', text: dOp.look }),
      h('td', { class: 'mono detect-logic', text: dOp.logic })));
  }
  table.appendChild(tbody);
  tableWrap.appendChild(table);
  detectPanel.appendChild(tableWrap);
  grid.appendChild(detectPanel);

  const side = h('div', { class: 'stack' });
  const mit = h('div', { class: 'panel' });
  mit.appendChild(h('div', { class: 'panel-cap lg display' }, icon('hard-hat', 'ic-16 amber'), ' mitigation playbook'));
  const mitList = h('ul', { class: 'mit-list' });
  for (const m of MITIGATIONS) {
    mitList.appendChild(h('li', null, h('span', { class: 'mono mit-id', text: `${m.id} · ` }), m.what));
  }
  mit.appendChild(mitList);
  side.appendChild(mit);

  const minds = h('div', { class: 'panel' });
  minds.appendChild(h('div', { class: 'panel-cap lg display' }, icon('swords', 'ic-16 red'), ' two mindsets'));
  const mindsGrid = h('div', { class: 'mind-grid' });
  const blue = h('div');
  blue.appendChild(h('div', { class: 'mono mind-label teal', text: 'blue team' }));
  const blueP = h('p', { class: 'mind-text' });
  blueP.appendChild(document.createTextNode('Appliances are your sensors AND your controls. Placement decides capability ('));
  blueP.appendChild(Term('SPAN / port mirroring'));
  blueP.appendChild(document.createTextNode(' vs inline), configuration decides coverage, and logs decide everything. A feature that is off might as well not exist.'));
  blue.appendChild(blueP);
  const red = h('div');
  red.appendChild(h('div', { class: 'mono mind-label red', text: 'red mindset (defensive)' }));
  const redP = h('p', { class: 'mind-text' });
  redP.appendChild(document.createTextNode('Attackers inventory your appliances before touching them: they fingerprint the LB to find the farm, test what the proxy lets OUT, and love a disabled '));
  redP.appendChild(Term('STP'));
  redP.appendChild(document.createTextNode(' or an '));
  redP.appendChild(h('em', { text: 'any-any' }));
  redP.appendChild(document.createTextNode(' rule left by a tired admin. Know which boxes you expose and which rules you regret.'));
  red.appendChild(redP);
  mindsGrid.appendChild(blue); mindsGrid.appendChild(red);
  minds.appendChild(mindsGrid);
  side.appendChild(minds);

  const keep = h('div', { class: 'panel' });
  keep.appendChild(h('div', { class: 'panel-cap lg display', text: 'keep going' }));
  const keepList = h('ul', { class: 'keep-list' });
  keepList.appendChild(h('li', { text: '· N10-009 objective 1.2 continues with media converters, VoIP endpoints, DNS/DHCP servers — same selection logic, new hardware.' }));
  keepList.appendChild(h('li', { text: '· Then 1.3 (cables & connectors) and 1.4 (transceivers) — what physically plugs into everything you just racked.' }));
  keepList.appendChild(h('li', { text: '· Domain 4 (security) goes deeper on the firewall/IDS concepts you commissioned here.' }));
  const extLi = h('li');
  extLi.appendChild(document.createTextNode('· Official objectives: '));
  extLi.appendChild(h('a', {
    href: 'https://www.comptia.org/certifications/network', target: '_blank', rel: 'noopener noreferrer',
    class: 'ext-link',
  }, 'comptia.org/certifications/network ', icon('external-link', 'ic-12')));
  extLi.appendChild(document.createTextNode(' '));
  extLi.appendChild(h('span', { class: 'mono dim-note', text: '(opens in new tab)' }));
  keepList.appendChild(extLi);
  keep.appendChild(keepList);
  keep.appendChild(h('button', {
    type: 'button', class: 'btn-amber signoff-btn display', onclick: signOff, text: 'sign off the build →',
  }));
  keep.appendChild(h('p', { class: 'mono signoff-note', text: mode === 'hard' ? 'cold-site report · pass everything for ★★★' : 'guided-build report · then take the cold-site shift' }));
  side.appendChild(keep);

  grid.appendChild(side);
  section.appendChild(grid);
  return { el: section, update() {} };
}

// ══════════════════════════════ COMPLETION MODAL (C7) ══════════════════════════════
function openCompletion(s) {
  const mode = s.mode || 'medium';
  const sc = window.score(s);
  const objs = mode === 'hard' ? '9 hard objectives' : '11 guided objectives';
  const quizBank = mode === 'hard' ? LAB.QUIZ_HARD : LAB.QUIZ_MEDIUM;

  const nextTip = mode === 'medium'
    ? 'Take the COLD SITE shift next — same bay, no guardrails. If you scored ★★★ here, the hard shift is where the real exam pressure lives.'
    : 'Replay any shaky objective in the guided shift to lock it in, then move to N10-009 1.3/1.4 (cabling & transceivers) — the physical layer your appliances ride on.';

  // R8/B7.8 — focus areas derived from THIS student's actual evidence
  const focus = [];
  for (const o of window.objectivesFor(mode)) {
    if (!(s.objectives[o.id] || {}).passed) {
      focus.push({
        title: `${o.id} — ${o.title}`,
        detail: `Still unpassed (${o.pillar}). ${o.line} Open it on the work order, re-read its feedback, and CHECK RESULTS again.`,
      });
    }
  }
  quizBank.forEach((q, i) => {
    const e = s.quiz[q.id];
    if (e && e.checked && e.pick !== q.answer) {
      focus.push({
        title: `Exam Q${i + 1} — ${q.topic}`,
        detail: `Answered wrong. Re-read the justification on the exam card, then review the Field Manual section on ${q.topic.toLowerCase()} before retrying the shift.`,
      });
    }
  });

  const content = h('div', { class: 'completion' });
  const titleId = 'completion-title';
  const descId = 'completion-desc';
  const titleText = sc.objPassed === sc.objTotal ? 'Site signed off' : 'Shift report';
  content.appendChild(h('h2', { class: 'completion-title display', id: titleId, text: titleText }));
  content.appendChild(h('p', { class: 'completion-desc', id: descId, text: `MERIDIAN-DC01 · ${mode === 'hard' ? 'COLD SITE' : 'GUIDED BUILD'} · ${objs}` }));

  const heroRow = h('div', { class: 'completion-hero' });
  heroRow.appendChild(h('div', { class: 'hero-score' },
    h('div', { class: 'display hero-pct' }, `${sc.overall}`, h('span', { class: 'hero-pct-sign', text: '%' })),
    h('div', { class: 'mono hero-caption', text: 'overall · 60% floor / 40% exam' })));
  const starsWrap = h('div', { class: 'hero-stars' });
  const starsEl = window.Stars(sc.stars, 28);
  starsEl.classList.add('stars-spring');
  starsWrap.appendChild(starsEl);
  starsWrap.appendChild(h('div', { class: 'mono hero-caption', text: sc.stars === 3 ? 'flawless commissioning' : sc.stars === 2 ? 'solid engineering' : 'build complete' }));
  heroRow.appendChild(starsWrap);
  content.appendChild(heroRow);

  const tiles = h('div', { class: 'completion-tiles' });
  [[`${sc.objPassed}/${sc.objTotal}`, 'objectives passed'], [`${sc.firstTry}/${sc.objTotal}`, 'first-attempt passes'], [`${sc.quizCorrect}/${sc.quizTotal}`, 'exam correct']].forEach(([n, l]) => {
    tiles.appendChild(h('div', { class: 'tile' },
      h('div', { class: 'tile-n display', text: n }),
      h('div', { class: 'mono tile-l', text: l })));
  });
  content.appendChild(tiles);
  content.appendChild(h('p', { class: 'mono hints-line', text: `hints used: ${sc.hintsTotal} · stars reward first-attempt accuracy & hint frugality` }));

  const mastery = h('div', { class: 'mastery' });
  mastery.appendChild(h('div', { class: 'mono mastery-label', text: 'mastery by pillar' }));
  const rows = h('div', { class: 'mastery-rows' });
  const ids = mode === 'hard'
    ? { understand: ['OBJ-H4'], recognize: ['OBJ-H1', 'OBJ-H5'], detect: ['OBJ-H2', 'OBJ-H3', 'OBJ-H6'], mitigate: ['OBJ-H7', 'OBJ-H8', 'OBJ-H9'] }
    : { understand: ['OBJ-M1', 'OBJ-M2', 'OBJ-M5'], recognize: ['OBJ-M3', 'OBJ-M4', 'OBJ-M6'], detect: ['OBJ-M9', 'OBJ-M10'], mitigate: ['OBJ-M7', 'OBJ-M8', 'OBJ-M11'] };
  for (const [pKey, m] of Object.entries(PILLAR_META)) {
    const list = ids[pKey];
    const ok = list.filter((id) => (s.objectives[id] || {}).passed).length;
    const row = h('div', { class: 'mastery-row' });
    row.appendChild(h('span', { class: 'dot', style: { background: m.color }, 'aria-hidden': 'true' }));
    row.appendChild(h('span', { class: 'mono mastery-pillar', style: { color: m.color }, text: m.label }));
    row.appendChild(h('span', { class: 'mono mastery-count', text: `${ok}/${list.length}` }));
    const segs = h('div', { class: 'mastery-segs', 'aria-hidden': 'true' });
    list.forEach((id) => segs.appendChild(h('span', { class: 'seg', style: { background: (s.objectives[id] || {}).passed ? m.color : '#2a3140' } })));
    row.appendChild(segs);
    rows.appendChild(row);
  }
  mastery.appendChild(rows);
  content.appendChild(mastery);

  const focusBox = h('div', { class: 'focus-box' });
  focusBox.appendChild(h('div', { class: 'panel-cap display red-cap' }, icon('crosshair', 'ic-16 red'), ' focus areas — study these next'));
  if (!focus.length) {
    focusBox.appendChild(h('p', { class: 'focus-none', text: 'None — every objective passed and every exam call was correct on this run. Your weak spots are speed and depth, not accuracy: replay the hard shift and target ★★★ without hints.' }));
  } else {
    const ul = h('ul', { class: 'focus-list' });
    for (const f of focus) {
      ul.appendChild(h('li', { class: 'focus-item' },
        h('div', { class: 'mono focus-title', text: f.title }),
        h('p', { class: 'focus-detail', text: f.detail })));
    }
    focusBox.appendChild(ul);
  }
  content.appendChild(focusBox);

  const nextBox = h('div', { class: 'next-box' });
  nextBox.appendChild(h('div', { class: 'panel-cap display amber-cap' }, icon('trophy', 'ic-16 amber'), ' what next'));
  nextBox.appendChild(h('p', { class: 'next-tip', text: nextTip }));
  content.appendChild(nextBox);

  const btns = h('div', { class: 'completion-btns' });
  const backBtn = h('button', { type: 'button', class: 'btn-outline completion-btn', 'data-autofocus': '' }, 'back to the floor ', icon('arrow-right', 'ic-14'));
  const restartBtn = h('button', { type: 'button', class: 'btn-outline completion-btn restart' }, icon('rotate-ccw', 'ic-14'), ' restart fresh');
  btns.appendChild(backBtn);
  btns.appendChild(restartBtn);
  content.appendChild(btns);

  const api = window.openOverlay({
    content, kind: 'dialog', labelId: titleId, descId,
    onClose: () => {
      completionApi = null;
      if (store.state.completedShown) dispatch({ type: 'CLOSE_COMPLETION' });
    },
  });
  backBtn.addEventListener('click', () => api.close());
  restartBtn.addEventListener('click', () => { api.close(); resetAll(); });
  return api;
}

// ══════════════════════════════ ROUTER ══════════════════════════════
function route(prev, s) {
  const want = s.mode ? 'lab' : 'gate';
  if (view !== want) {
    if (want === 'gate') buildGate();
    else buildLab(s);
  } else if (want === 'lab') {
    updateLab(prev, s);
    updateSpotlight(s);
  } else {
    updateGate(s);
  }
  // completion modal lifecycle
  if (s.completedShown && !completionApi) {
    completionApi = openCompletion(s);
  } else if (!s.completedShown && completionApi) {
    const api = completionApi;
    completionApi = null;
    api.close();
  }
}

store.subscribe((prev, s) => {
  celebrate(prev, s);
  route(prev, s);
});

// initial paint (static build boots synchronously — no splash, no hydration gap)
route(undefined, store.state);
})();
