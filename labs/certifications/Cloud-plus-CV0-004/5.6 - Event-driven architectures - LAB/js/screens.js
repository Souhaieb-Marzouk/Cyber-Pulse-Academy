// ─── Screens: mode select, briefing, quiz, debrief ───────────────────────────
// Ported from ModeSelect.tsx / Briefing.tsx / Quiz.tsx / Debrief.tsx.
'use strict';

/* ══════════ Mode selection (ModeSelect.tsx) ══════════ */
const MODE_CARDS = [
  {
    mode: 'medium',
    title: 'GUIDED TOWER DUTY',
    tag: 'MEDIUM',
    iconName: 'GraduationCap', accent: 'accent-teal',
    points: [
      '12 guided objectives, introduced in order with “where to look” links',
      '3-tier hints on every objective — they cost stars, never progress',
      'Tolerant checks: wrong answers teach, never punish',
      'Concept quiz after practice, with an explanation on every answer',
    ],
    footer: 'You have read about EDA. This mode makes you fluent.',
    bulletIcon: 'CheckCircle2',
  },
  {
    mode: 'hard',
    title: 'INCIDENT COMMANDER',
    tag: 'HARD',
    iconName: 'Flame', accent: 'accent-amber',
    points: [
      '10 broad, multi-step challenges over noisy, realistic evidence',
      'At least two red herrings planted in the incident packs',
      'One optional nudge per objective — and it visibly costs score',
      'Strict checks: exact values, exact sets, sequenced runbook actions',
    ],
    footer: 'You claim you can run an event platform. Prove it at 03:00.',
    bulletIcon: 'Timer',
  },
];

function renderModeSelect(root, dispatch) {
  const main = h('main', { class: 'mode-main' });
  const header = h('header', { class: 'mode-header' });
  header.append(
    h('span', { class: 'badge badge-outline mode-cert-badge' }, 'COMPTIA CLOUD+ CV0-004 · LESSON 5.6 · DOMAIN 5.0 DEVOPS FUNDAMENTALS (10%)'),
    h('h1', { class: 'mode-title' }, icon('RadioTower', 'ic-36 teal'), LAB_META.title),
    h('p', { class: 'mode-sub' }, 'An interactive practice lab on ', h('span', { class: 'teal-text' }, 'event-driven architectures'),
      ' — the integration style Cloud+ tests under “exploring architectures for cloud applications”. Learn it, route it, break it, harden it.'));
  main.append(header);

  const grid = h('div', { class: 'mode-grid' });
  MODE_CARDS.forEach((c, i) => {
    const ul = h('ul', { class: 'mode-points' });
    for (const p of c.points) {
      ul.append(h('li', { class: 'mode-point' },
        icon(c.bulletIcon, 'ic-16 ' + (c.mode === 'medium' ? 'teal-bullet' : 'amber-bullet')),
        h('span', null, p)));
    }
    const card = h('div', { class: 'card mode-card', style: `animation-delay:${0.1 * i}s` },
      h('div', { class: 'card-pad mode-card-inner' },
        h('div', { class: 'mode-card-top' },
          icon(c.iconName, 'ic-28 ' + c.accent),
          h('span', { class: `badge badge-outline mode-tag ${c.accent}` }, c.tag)),
        h('h2', { class: `mode-card-title ${c.accent}` }, c.title),
        ul,
        h('p', { class: 'mode-card-footer' }, c.footer),
        h('button', {
          class: `btn btn-mode min-h-11 w-full font-mono tracking-wide ${c.mode === 'medium' ? 'btn-mode-medium' : 'btn-mode-hard'}`,
          'data-fk': 'mode:' + c.mode,
          onclick: () => dispatch({ type: 'SET_MODE', mode: c.mode }),
        }, icon('ListChecks', 'ic-16'), `Enter as ${c.mode === 'medium' ? 'Tower Duty' : 'Incident Commander'}`)));
    grid.append(card);
  });
  main.append(grid);

  main.append(h('p', { class: 'mode-footnote' },
    icon('Sparkles', 'ic-14'),
    ' Both modes share the same live environment. All data is synthetic training data for the fictional org “Aerolink Cargo”. Star rating reflects first-attempt accuracy and hint usage.'));
  root.append(h('div', { class: 'screen-mode' }, h('div', { class: 'mode-ambience', 'aria-hidden': 'true' }), main));
}

/* ══════════ Briefing (Briefing.tsx) ══════════ */
function renderBriefing(root, dispatch) {
  const main = h('main', { class: 'brief-main' });
  main.append(h('header', { class: 'brief-header' },
    h('span', { class: 'badge badge-outline brief-badge' }, 'SCENARIO BRIEFING · READ BEFORE ENTERING THE TOWER'),
    h('h1', { class: 'brief-title' }, icon('Building2', 'ic-28 teal'), `${BRIEFING.org} — modernization watch`)));

  const briefCard = h('div', { class: 'card bg-70 border-zinc-800' }, h('div', { class: 'card-pad brief-card-body' }));
  BRIEFING.lines.forEach((l, i) => {
    briefCard.firstChild.append(h('p', null, i === 1 ? h('span', { class: 'teal-200' }, l) : l));
  });
  briefCard.firstChild.append(h('div', { class: 'cert-box' },
    icon('ShieldCheck', 'ic-16 shrink'),
    h('span', null,
      'Certification relevance: CompTIA Cloud+ ', h('span', { class: 'mono' }, 'CV0-004'),
      ', Domain 5.0 “DevOps Fundamentals” (10%) — competency: ', h('em', null, 'Event-driven architectures: exploring architectures for cloud applications'),
      '. Every objective below maps to that scope.')));
  main.append(briefCard);

  // Knowledge core accordion (type="multiple", k0 open by default)
  const kc = h('div', { class: 'flex-col-gap-3' },
    h('h2', { class: 'brief-h2' }, icon('BookOpen', 'ic-20 teal'), ' Knowledge Core'),
    h('p', { class: 'brief-note' }, 'Nine short briefings cover the full lesson area. Dotted-underlined terms elsewhere in the lab show definitions on hover/focus.'));
  const acc = h('div', { class: 'accordion' });
  KNOWLEDGE_SECTIONS.forEach((s, i) => {
    const value = 'k' + String(i);
    const open = ui.coreOpen.has(value);
    const item = accordionItem({
      value, open,
      triggerClass: 'brief-acc-trigger',
      contentClass: 'brief-acc-content',
      onToggle: () => { open ? ui.coreOpen.delete(value) : ui.coreOpen.add(value); uiChanged(); },
    });
    item._btn.firstChild.append(...[`${String(i + 1).padStart(2, '0')} · ${s.title}`].map((t) => document.createTextNode(t)));
    const inner = h('div', { class: 'brief-acc-text' }, s.body);
    item._panel.append(h('div', { class: 'acc-pad' }, inner));
    item._panel.style.display = open ? '' : 'none';
    acc.append(item);
  });
  kc.append(acc);
  main.append(kc);

  // Glossary accordion (type="single collapsible")
  const gl = h('div', { class: 'flex-col-gap-3' },
    h('h2', { class: 'brief-h2' }, 'Glossary — 15 terms you must own'));
  const gacc = h('div', { class: 'accordion' });
  const gitem = accordionItem({
    value: 'g', open: ui.glossOpen, triggerClass: 'brief-acc-trigger gloss-trigger',
    onToggle: () => { ui.glossOpen = !ui.glossOpen; uiChanged(); },
  });
  gitem._btn.firstChild.append(document.createTextNode('Open glossary'));
  const dl = h('dl', { class: 'gloss-grid' });
  for (const g of GLOSSARY) {
    dl.append(h('div', { class: 'gloss-card' },
      h('dt', { class: 'gloss-term' }, g.term),
      h('dd', { class: 'gloss-def' }, g.def)));
  }
  gitem._panel.append(h('div', { class: 'acc-pad' }, dl));
  gitem._panel.style.display = ui.glossOpen ? '' : 'none';
  gacc.append(gitem);
  gl.append(gacc);
  main.append(gl);

  main.append(h('div', { class: 'separator' }));
  const footerRow = h('div', { class: 'brief-footer' },
    h('p', { class: 'brief-next' }, icon('GraduationCap', 'ic-16'), ' Next: the Control Tower — board, launch pad and telemetry, where all objectives live.'),
    h('button', {
      class: 'btn btn-primary min-h-11 font-mono tracking-wide', 'data-fk': 'brief-proceed',
      onclick: () => dispatch({ type: 'SET_SCREEN', screen: 'tower' }),
    }, 'Proceed to the Control Tower ', icon('ArrowRight', 'ic-16')));
  main.append(footerRow);
  root.append(h('div', { class: 'screen-brief' }, main));
}

/* ══════════ Quiz (Quiz.tsx) ══════════ */
const LETTERS = ['A', 'B', 'C', 'D'];

function renderQuiz(root, state, dispatch) {
  const qs = state.mode === 'hard' ? QUIZ_HARD : QUIZ_MEDIUM;
  const answeredCount = qs.filter((q) => state.quiz.answers[q.id] !== undefined).length;
  const finished = state.quiz.finished;
  const correct = qs.filter((q) => state.quiz.answers[q.id] === q.correct).length;
  const objStats = objectivesStats(state);
  const isMedium = state.mode === 'medium';

  const idx = Math.min(state.quiz.idx ?? 0, qs.length - 1);
  const q = qs[idx];
  const chosen = state.quiz.answers[q.id];
  const validated = chosen !== undefined; // medium: click validates · hard: Lock answer validates
  // Hard mode: pre-validation selection (changeable) — cleared when the question advances.
  const pending = (ui.pendingFor === q.id) ? ui.pendingIdx : null;

  const main = h('main', { class: 'quiz-main' });
  const header = h('header', { class: 'quiz-header' });
  header.append(
    h('span', { class: 'badge badge-outline brief-badge' }, isMedium ? 'KNOWLEDGE CHECK · CONCEPT RECALL' : 'KNOWLEDGE CHECK · SCENARIO APPLICATION'),
    h('div', { class: 'quiz-title-row' },
      h('h1', { class: 'quiz-title' }, icon('ClipboardCheck', 'ic-24 teal'), ' Tower Certification Check'),
      h('button', {
        class: 'btn btn-nav-dark btn-sm-9', 'data-fk': 'quiz-back',
        onclick: () => dispatch({ type: 'SET_SCREEN', screen: 'tower' }),
      }, icon('TerminalSquare', 'ic-14'), ' Back to the tower')),
    h('p', { class: 'quiz-sub' },
      isMedium
        ? 'Answer each question — your choice validates immediately, locks, and the explanation appears before you move on.'
        : 'Scenario items: pick an answer, press “Lock answer”, read the explanation, then move on — answers cannot change after locking.'));
  if (!finished) {
    header.append(h('div', { class: 'quiz-progress-row' },
      progressBar(answeredCount * (100 / qs.length), 'quiz progress'),
      h('span', { class: 'quiz-progress-num' }, `Question ${idx + 1}/${qs.length} · ${answeredCount} answered`)));
  }
  if (objStats.passed < objStats.total) {
    header.append(h('p', { class: 'quiz-open-note' }, `note: ${objStats.total - objStats.passed} tower objective(s) still open — the quiz counts toward your star rating either way.`));
  }
  main.append(header);

  if (!finished) {
    const card = h('div', { class: 'card bg-70 border-zinc-800' });
    const body = h('div', { class: 'card-pad quiz-card-body' });
    body.append(h('div', { class: 'quiz-q-row' },
      h('span', { class: 'quiz-q-num' }, `Q${idx + 1}`),
      h('div', { class: 'quiz-q-text' },
        q.scenario ? h('p', { class: 'quiz-scenario' }, q.scenario) : null,
        h('h2', { class: 'quiz-prompt' }, q.prompt))));

    const group = h('div', { role: 'radiogroup', 'aria-label': `Question ${idx + 1} options`, class: 'quiz-options' });
    q.options.forEach((opt, oi) => {
      const isChosen = chosen === oi;
      if (!validated) {
        const isPending = !isMedium && pending === oi;
        group.append(h('button', {
          type: 'button', role: 'radio', 'aria-checked': String(isPending),
          'data-fk': 'quiz:' + q.id + ':' + oi,
          class: 'quiz-option' + (isPending ? ' pending' : isMedium ? ' medium' : ''),
          onclick: () => { if (isMedium) dispatch({ type: 'QUIZ_ANSWER', qid: q.id, idx: oi }); else { ui.pendingFor = q.id; ui.pendingIdx = oi; uiChanged(); } },
        }, h('span', { class: 'quiz-letter' }, `${LETTERS[oi]}.`), opt));
      } else {
        // validated — LOCKED (no onClick). R3: only the chosen answer gets color.
        const chosenWasRight = isChosen && oi === q.correct;
        const chosenWasWrong = isChosen && oi !== q.correct;
        group.append(h('div', {
          class: 'quiz-option locked' + (chosenWasRight ? ' right' : chosenWasWrong ? ' wrong' : ''),
          ...(isChosen ? { 'aria-current': 'true' } : {}),
        },
          chosenWasRight ? icon('CheckCircle2', 'ic-16 quiz-ico-ok') : chosenWasWrong ? icon('XCircle', 'ic-16 quiz-ico-bad') : h('span', { class: 'quiz-letter dim' }, `${LETTERS[oi]}.`),
          h('span', null, opt)));
      }
    });
    body.append(group);

    if (!validated && !isMedium) {
      body.append(h('button', {
        class: 'btn btn-primary min-h-11 font-mono tracking-wide', disabled: pending === null,
        'data-fk': 'quiz-lock',
        onclick: () => { if (pending !== null) { ui.pendingFor = q.id; dispatch({ type: 'QUIZ_ANSWER', qid: q.id, idx: pending }); } },
      }, icon('Lock', 'ic-16'), ' Lock answer'));
      if (pending === null) body.append(h('p', { class: 'quiz-lock-hint' }, 'select an option to enable locking'));
    }

    if (validated) {
      body.append(h('p', { class: 'quiz-why', role: 'note', 'aria-live': 'polite' },
        h('span', { class: 'quiz-why-label' }, 'WHY: '),
        q.explanation,
        chosen !== q.correct ? h('span', { class: 'quiz-correct-line' }, `correct answer: ${LETTERS[q.correct]}`) : null));
      body.append(h('button', {
        class: 'btn btn-primary min-h-11 font-mono tracking-wide', 'data-fk': 'quiz-next',
        onclick: () => { if (idx < qs.length - 1) dispatch({ type: 'QUIZ_NEXT' }); else dispatch({ type: 'QUIZ_FINISH' }); },
      }, idx < qs.length - 1 ? 'Next question' : 'Finish & see score', icon('ArrowRight', 'ic-16')));
      body.append(h('p', { class: 'quiz-locked-note' }, icon('Lock', 'ic-12'), ' answer locked — it cannot be changed.'));
    }
    card.append(body);
    main.append(card);
  } else {
    const banner = h('div', { class: 'quiz-result' },
      h('p', { class: 'quiz-result-line' }, `QUIZ RESULT: ${correct}/${qs.length} correct`),
      h('p', { class: 'quiz-result-sub' }, 'This result feeds your final star rating (with first-attempt objective accuracy and hint usage).'),
      h('div', { class: 'quiz-result-actions' },
        h('button', { class: 'btn btn-dark btn-sm-9 font-mono text-xs', 'data-fk': 'quiz-tower', onclick: () => dispatch({ type: 'SET_SCREEN', screen: 'tower' }) }, icon('TerminalSquare', 'ic-14'), ' Tower'),
        h('button', { class: 'btn btn-primary btn-sm-9 font-mono text-xs', 'data-fk': 'quiz-debrief', onclick: () => dispatch({ type: 'SET_SCREEN', screen: 'debrief' }) }, 'Debrief ', icon('ArrowRight', 'ic-14'))));
    main.append(banner);

    qs.forEach((r, qi) => {
      const ch = state.quiz.answers[r.id];
      const ok = ch === r.correct;
      const card = h('div', { class: 'card bg-70 border-zinc-800' }, h('div', { class: 'card-pad flex-col-gap-2' }));
      card.firstChild.append(h('div', { class: 'quiz-q-row' },
        h('span', { class: 'quiz-q-num' }, `Q${qi + 1}`),
        h('h2', { class: 'quiz-prompt' }, r.prompt)));
      const opts = h('div', { class: 'quiz-options' });
      r.options.forEach((opt, oi) => {
        const isChosen = ch === oi;
        opts.append(h('div', { class: 'quiz-option locked' + (isChosen ? (ok ? ' right' : ' wrong') : ' muted') },
          isChosen
            ? (ok ? icon('CheckCircle2', 'ic-16 quiz-ico-ok') : icon('XCircle', 'ic-16 quiz-ico-bad'))
            : h('span', { class: 'quiz-letter dim' }, `${LETTERS[oi]}.`),
          h('span', null, opt)));
      });
      card.firstChild.append(opts);
      card.firstChild.append(h('p', { class: 'quiz-why' },
        h('span', { class: 'quiz-why-label' }, 'WHY: '),
        r.explanation,
        h('span', { class: 'quiz-correct-line' }, `correct answer: ${LETTERS[r.correct]}${ok ? ' — you chose it' : ''}`)));
      main.append(card);
    });
  }
  root.append(h('div', { class: 'screen-quiz' }, main));
}

/* ══════════ Debrief (Debrief.tsx) ══════════ */
function renderDebrief(root, state, dispatch) {
  const stats = objectivesStats(state);
  const main = h('main', { class: 'debrief-main' });

  main.append(h('header', { class: 'brief-header' },
    h('span', { class: 'badge badge-outline brief-badge' }, 'DEBRIEF · FIELD NOTES'),
    h('h1', { class: 'brief-title' }, 'What the Tower taught you'),
    h('p', { class: 'debrief-sub' },
      'Synthesis of Lesson 5.6 (event-driven architectures): the signals worth watching, the controls worth applying, and both sides of the fence. Objectives so far: ',
      h('span', { class: 'mono teal-text' }, `${stats.passed}/${stats.total}`), '.')));

  // Detection table
  const det = h('div', { class: 'card bg-70 border-zinc-800' }, h('div', { class: 'card-pad flex-col-gap-3' }));
  det.firstChild.append(h('h2', { class: 'debrief-h2' }, icon('Activity', 'ic-18 rose'), ' Detection opportunities — data sources & example logic'));
  const dtable = h('div', { class: 'queue-table-wrap' });
  const table = h('table', { class: 'debrief-table' });
  table.append(h('thead', null, h('tr', { class: 'debrief-thead' },
    h('th', null, 'signal (data source)'), h('th', null, 'what it detects'))));
  const tbody = h('tbody', null);
  for (const d of DEBRIEF.detection) {
    tbody.append(h('tr', { class: 'debrief-row' },
      h('td', { class: 'debrief-sig' }, d.sig),
      h('td', { class: 'debrief-why' }, d.why)));
  }
  table.append(tbody);
  dtable.append(table);
  det.firstChild.append(dtable);
  det.firstChild.append(h('p', { class: 'alarm-logic' },
    'example alarm logic — page if: dlq_depth &gt; 0 OR queue_oldest_age &gt; 15m OR consumer_error_rate &gt; 5% · auto-scale if: throttle_rate &gt; 0 sustained 5m'));
  main.append(det);

  // Mitigations
  const mit = h('div', { class: 'card bg-70 border-zinc-800' }, h('div', { class: 'card-pad flex-col-gap-3' }));
  mit.firstChild.append(h('h2', { class: 'debrief-h2' }, icon('Wrench', 'ic-18 emerald'), ' Mitigation recommendations (official IDs)'));
  const mul = h('ul', { class: 'mit-list' });
  for (const m of DEBRIEF.mitigations) {
    mul.append(h('li', { class: 'mit-item' },
      h('p', { class: 'mit-id' }, `${m.id} · ${m.name}`),
      h('p', { class: 'mit-how' }, m.how)));
  }
  mit.firstChild.append(mul);
  main.append(mit);

  // Blue / red team
  const grid = h('div', { class: 'debrief-grid' });
  const blue = h('div', { class: 'card team-card-blue' }, h('div', { class: 'card-pad flex-col-gap-3' }));
  blue.firstChild.append(h('h2', { class: 'team-title-blue' }, icon('ShieldCheck', 'ic-18'), ' Blue-team takeaways'));
  const bul = h('ul', { class: 'team-list' });
  DEBRIEF.blueTeam.forEach((t, i) => bul.append(h('li', { class: 'team-item' }, h('span', { class: 'team-num blue' }, String(i + 1).padStart(2, '0')), t)));
  blue.firstChild.append(bul);
  const red = h('div', { class: 'card team-card-red' }, h('div', { class: 'card-pad flex-col-gap-3' }));
  red.firstChild.append(h('h2', { class: 'team-title-red' }, icon('Swords', 'ic-18'), ' Red-team mindset (defensive)'));
  const rul = h('ul', { class: 'team-list' });
  DEBRIEF.redTeam.forEach((t, i) => rul.append(h('li', { class: 'team-item' }, h('span', { class: 'team-num red' }, String(i + 1).padStart(2, '0')), t)));
  red.firstChild.append(rul);
  grid.append(blue, red);
  main.append(grid);

  // References
  const refs = h('div', { class: 'card bg-70 border-zinc-800' }, h('div', { class: 'card-pad flex-col-gap-3' }));
  refs.firstChild.append(h('h2', { class: 'section-title' }, 'Official references (open in a new tab)'));
  const rlinks = h('ul', { class: 'ref-list' });
  for (const l of DEBRIEF.links) {
    rlinks.append(h('li', null,
      h('a', { href: l.url, target: '_blank', rel: 'noopener noreferrer', class: 'ref-link' },
        icon('ExternalLink', 'ic-14 shrink'), ` ${l.label}`)));
  }
  refs.firstChild.append(rlinks);
  refs.firstChild.append(h('div', { class: 'separator' }));
  refs.firstChild.append(h('p', { class: 'mitre-note' },
    'MITRE technique/mitigation names cited above were verified against attack.mitre.org on 2026-11-07. All lab data is synthetic; Aerolink Cargo is fictional.'));
  main.append(refs);

  // Footer actions
  const done = stats.passed === stats.total && state.quiz.finished;
  const actions = h('div', { class: 'debrief-actions' });
  actions.append(
    h('button', { class: 'btn btn-dark min-h-11 font-mono', 'data-fk': 'debrief-tower', onclick: () => dispatch({ type: 'SET_SCREEN', screen: 'tower' }) }, icon('TerminalSquare', 'ic-16'), ' Back to the tower'),
    h('button', { class: 'btn btn-dark min-h-11 font-mono', 'data-fk': 'debrief-quiz', onclick: () => dispatch({ type: 'SET_SCREEN', screen: 'quiz' }) }, icon('ListChecks', 'ic-16'), ' Quiz'),
    h('button', {
      class: 'btn btn-emerald min-h-11 font-mono', disabled: !done, 'data-fk': 'debrief-finish',
      onclick: () => dispatch({ type: 'SET_SCREEN', screen: 'tower' }),
    }, icon('Trophy', 'ic-16'), done ? 'See final score' : `Finish (${stats.passed}/${stats.total} objectives + quiz)`));
  main.append(actions);

  root.append(h('div', { class: 'screen-debrief' }, main));
}
