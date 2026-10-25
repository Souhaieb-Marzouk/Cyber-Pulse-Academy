// ─────────────────────────────────────────────────────────────────────────────
// js/panels.js — panel renderers
// Faithful string-renderer ports of the original React panels:
// ModeSelect, BureauHeader, CaseFile, Desk, Grid (ShareGrid), Missions,
// RecordsRoom, Completion, ResetDialog. Interactions are declared with
// data-act / data-key / data-id / data-val attributes; app.js owns the
// delegation and the store. Load after ui.js.
// ─────────────────────────────────────────────────────────────────────────────

// ── Mode select ──────────────────────────────────────────────────────────────

function renderModeSelect() {
  function modeCard(o) {
    const bullets = o.points
      .map(function (p) {
        return '<li class="mode-li"><span aria-hidden="true" class="mode-dot" style="background:' + o.tone + '"></span>' + esc(p) + '</li>';
      })
      .join('');
    return (
      '<div class="mode-card">' +
      '<div class="mode-card-top"><span style="color:' + o.tone + '">' + o.icon + '</span>' +
      '<span class="mode-tag ' + o.tagCls + '">' + esc(o.tag) + '</span></div>' +
      '<h2 class="mode-card-title">' + esc(o.title) + '</h2>' +
      '<ul class="mode-ul">' + bullets + '</ul>' +
      '<button type="button" data-act="start-mode" data-val="' + o.mode + '" data-fid="start-' + o.mode + '" class="btn-mode" style="background:' + o.tone + '">' + esc(o.cta) + '</button>' +
      '</div>'
    );
  }

  return (
    '<div class="lab-paper-bg mode-screen">' +
    '<div class="mode-wrap">' +
    '<div class="mode-sheet">' +
    '<span aria-hidden="true" class="mode-sheet-tape"></span>' +
    '<div class="mode-hero">' +
    bureauMark('bmark bmark-lg') +
    '<p class="mode-kicker">CompTIA CySA+ CS0-003 · Lesson 2.1</p>' +
    '<h1 class="mode-title">The OSINT Bureau</h1>' +
    '<p class="mode-sub">Case 2.1 — <em>Identifying Active Threats</em>: collect open-source intelligence, work the sharing platform, track the campaign, and protect operations.</p>' +
    '</div>' +
    '<div class="mode-grid">' +
    modeCard({
      mode: 'medium',
      icon: icon('graduation-cap', 'ic-24'),
      tag: 'Medium · guided casework',
      tagCls: 'mode-tag-amber',
      title: 'Learn the trade',
      points: [
        '12 staged objectives, each one teaching bite',
        'Where-to-look pins + 3-tier hints (cost a few stars, never block you)',
        'Tolerant validation — wrong answers teach, never punish',
        'Concept quiz with explanations after practice',
      ],
      cta: 'Open the guided case',
      tone: PAPER.amber,
    }) +
    modeCard({
      mode: 'hard',
      icon: icon('mountain', 'ic-24'),
      tag: 'Hard · free investigation',
      tagCls: 'mode-tag-stone',
      title: 'Work the noise',
      points: [
        '9 broad multi-step objectives, no hand-holding',
        'A noisy 13-item feed with red herrings and false positives',
        'At most ONE nudge — it visibly costs score',
        'Strict validation: exact IDs, sequences, TLP and confidence calls',
      ],
      cta: 'Take the operational floor',
      tone: PAPER.red,
    }) +
    '</div>' +
    '<div class="mode-foot">' +
    '<span class="mode-foot-item">' + icon('fingerprint', 'ic-14') + ' All orgs, actors &amp; identifiers are fictional training data</span>' +
    '<span class="mode-foot-item">' + icon('eye', 'ic-14') + ' Defensive / educational framing only</span>' +
    '<span class="mode-foot-item">' + icon('scan-search', 'ic-14') + ' Progress auto-saves in your browser</span>' +
    '<span class="mode-foot-item">' + icon('compass', 'ic-14') + ' ~45–75 min per mode</span>' +
    '</div>' +
    '</div></div></div>'
  );
}

// ── Header ───────────────────────────────────────────────────────────────────

function renderHeader(s) {
  const mode = s.mode;
  const progress = progressOf(mode, s);
  const rating = ratingOf(mode, s);
  const quiz = quizScore(mode, s);
  const quizStatus = s.quizSubmitted && s.quizSubmitted[mode]
    ? quiz.correct + '/' + quiz.total + ' correct'
    : 'quiz pending';
  const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;

  const stars = [1, 2, 3, 4, 5]
    .map(function (i) { return starMarkup(i <= rating.stars); })
    .join('');

  // Up-next strip (medium only): first unverified objective
  let nextTask = null;
  if (mode === 'medium') {
    const list = objectivesForMode(mode);
    const next = list.find(function (o) { return !(s.objectives[o.id] && s.objectives[o.id].done); });
    if (next) nextTask = next.id.replace('OBJ-', '') + ' · ' + next.title + ' — ' + next.task;
  }

  return (
    '<header class="hdr">' +
    '<div class="hdr-in">' +
    '<div class="hdr-brand">' +
    bureauMark('bmark') +
    '<div class="hdr-brandtext">' +
    '<p class="hdr-title">The OSINT Bureau <span class="hdr-dot sm-only">·</span><span class="hdr-case sm-only">Case 2.1 — Identifying Active Threats</span></p>' +
    '<p class="hdr-sub">' + icon('shield-alert', 'ic-12') + ' Halvard Logistics CTI cell · fictional training data · CySA+ CS0-003</p>' +
    '</div></div>' +
    '<div class="hdr-tools">' +
    '<div role="group" aria-label="Difficulty mode" class="swgroup">' +
    '<button type="button" aria-pressed="' + (mode === 'medium') + '" data-act="switch-mode" data-val="medium" data-fid="mode-medium" class="swbtn ' + (mode === 'medium' ? 'swbtn-med' : '') + '">Medium</button>' +
    '<button type="button" aria-pressed="' + (mode === 'hard') + '" data-act="switch-mode" data-val="hard" data-fid="mode-hard" class="swbtn ' + (mode === 'hard' ? 'swbtn-hard' : '') + '">Hard</button>' +
    '</div>' +
    '<div class="prog-card">' +
    icon('clipboard-check', 'ic-16 muted') +
    '<span class="prog-label" aria-label="' + progress.done + ' of ' + progress.total + ' objectives verified">' +
    progress.done + '/' + progress.total + ' <span class="prog-word sm-only">stamped</span></span>' +
    '<span aria-hidden="true" class="prog-track"><span class="prog-fill" style="width:' + pct + '%"></span></span>' +
    '</div>' +
    '<div class="stars-card" title="Provisional clearance ' + Math.round(rating.pct * 100) + '% · ' + esc(quizStatus) + '">' + stars + '</div>' +
    '<button type="button" data-act="open-completion" data-fid="open-completion" class="btn btn-closeout">' + icon('award', 'ic-14') + ' Case close-out</button>' +
    '<button type="button" data-act="open-reset" data-fid="open-reset" aria-label="Reset the lab to pristine state" class="btn btn-resethdr">' + icon('rotate-ccw', 'ic-14') + ' Reset</button>' +
    '</div></div>' +
    (nextTask
      ? '<div class="upnext"><div class="upnext-in">' +
        '<span class="ping"><span class="ping-ring"></span><span class="ping-dot"></span></span>' +
        '<p class="upnext-text"><strong class="upnext-k">Up next · </strong>' + esc(nextTask) + '</p>' +
        '<button type="button" data-act="aim-next" data-fid="aim-next" class="btn btn-aimnext">Show me where</button>' +
        '</div></div>'
      : '') +
    '</header>'
  );
}

// ── Mobile section nav ───────────────────────────────────────────────────────

function renderMobileNav(s) {
  const progress = progressOf(s.mode, s);
  const tabs = [
    ['desk', 'Evidence'],
    ['grid', 'ShareGrid'],
    ['casefile', 'Case file'],
    ['missions', 'Missions'],
    ['records', 'Records'],
  ];
  return (
    '<nav aria-label="Bureau sections" class="mnav">' +
    '<div class="mnav-row">' +
    tabs
      .map(function (t) {
        const on = UISTATE.mobileTab === t[0];
        const badge = t[0] === 'missions' && progress.done < progress.total
          ? '<span class="mnav-badge">' + (progress.total - progress.done) + '</span>'
          : '';
        return (
          '<button type="button" aria-pressed="' + on + '" data-act="set-mobile-tab" data-val="' + t[0] + '"' +
          ' data-fid="mnav-' + t[0] + '" class="mnav-btn ' + (on ? 'mnav-on' : '') + '">' + t[1] + badge + '</button>'
        );
      })
      .join('') +
    '</div></nav>'
  );
}

// ── Case file (left column) ──────────────────────────────────────────────────

const LIFECYCLE_DISPLAY = ['lc-coll', 'lc-anal', 'lc-plan', 'lc-disse', 'lc-proc', 'lc-feed'];

function renderCaseFile(s) {
  const env = s.env;
  let html = '';

  // C1: Scenario briefing
  const briefingBody =
    '<button type="button" data-act="toggle-briefing" data-fid="toggle-briefing" aria-expanded="' + UISTATE.briefingOpen + '" class="btn btn-fold">' +
    (UISTATE.briefingOpen ? 'Fold away' : 'Unfold briefing') + '</button>' +
    (UISTATE.briefingOpen
      ? '<div class="brief-body">' +
        '<p><strong class="ink-strong">You are the new threat-intel analyst</strong> at the two-person CTI cell of <em>Halvard Logistics Group</em> — a fictional mid-size freight operator. On your first morning, the sector ISAC bulletin mentions your company&#39;s worst headache by name: <strong>Crimson Crate</strong>, an access broker that sells footholds into logistics firms.</p>' +
        '<p>The campaign <strong>evolved</strong>: v1 (November) was mass shipment-invoice phishing. The feeds now hint at a v2 — new lookalike portal domains, credential-harvest links, and attacks on unpatched file-transfer appliances. Your job covers the whole intelligence loop: <strong>collect</strong> from open sources, <strong>process</strong> the observables, <strong>analyze</strong> and correlate them on the ShareGrid sharing platform, and <strong>disseminate</strong> — detections, dispatches, and a board briefing.</p>' +
        note('warn', '', '<strong>Training fiction notice.</strong> Every organization, actor, domain, IP and identifier in this lab is synthetic. IPs use RFC 5737 documentation ranges; CVE-2025-44107 is an invented training ID. MITRE ATT&amp;CK references are real and used for defensive education.') +
        '</div>'
      : '') +
    '<div class="brief-meta">' +
    '<span>' + icon('calendar-range', 'ic-14') + ' v1 Nov 2025 · v2 now</span>' +
    '<span>' + icon('building-2', 'ic-14') + ' Target: logistics &amp; freight</span>' +
    '<span>' + icon('radio', 'ic-14') + ' Sources: 8 OSINT racks</span>' +
    '<span>' + icon('target', 'ic-14') + ' Platform: ShareGrid</span>' +
    '</div>';
  html += paperPanel({ title: 'Case file · 2.1-CRIMSON-CRATE', subtitle: 'Read once, refer often', icon: icon('folder-open', 'ic-16'), tape: true, body: briefingBody });

  // OBJ-M1: Intake tray
  const intakeItems = INTAKE_CARDS.map(function (card) {
    const chips = INTAKE_CLASSES.map(function (c) {
      return chipToggle({
        active: env.intake[card.id] === c.id,
        act: 'set-map', dataKey: 'intake', dataId: card.id, dataVal: c.id,
        ariaLabel: 'Classify "' + card.text + '" as ' + c.label,
        tone: c.id === 'active' ? 'red' : c.id === 'vuln' ? 'amber' : 'moss',
        fid: 'intake-' + card.id + '-' + c.id,
        inner: esc(c.label) + '<span class="chip-desc xl-only"> — ' + esc(c.desc) + '</span>',
      });
    }).join('');
    return '<li class="card-li"><p class="serif-li">' + esc(card.text) + '</p><div class="chip-row">' + chips + '</div></li>';
  }).join('');
  html += paperPanel({ title: 'Intake tray', subtitle: 'Classify each item — what is it? (OBJ-M1)', icon: icon('briefcase', 'ic-16'), body: '<ul class="ul-tight">' + intakeItems + '</ul>' });

  // OBJ-M2: Lifecycle board
  const remaining = LIFECYCLE_DISPLAY.filter(function (id) { return env.lifecycle.indexOf(id) === -1; });
  const labelOf = function (id) {
    const p = LIFECYCLE_PHASES.filter(function (x) { return x.id === id; })[0];
    return p ? p.label : id;
  };
  const remainBtns = remaining
    .map(function (id) {
      return '<button type="button" data-act="push-seq" data-key="lifecycle" data-id="' + id + '" data-fid="lc-' + id + '" class="btn phasebtn">' + esc(labelOf(id)) + '</button>';
    })
    .join('') + (remaining.length === 0 ? '<span class="hint-italic">All six placed — use the arrows to undo.</span>' : '');
  const seq = env.lifecycle.map(function (id, i) { return seqSlot(labelOf(id), i, 'lifecycle', id); }).join('');
  html += paperPanel({
    title: 'Lifecycle board', subtitle: 'Click the six phases in intelligence order (OBJ-M2)', icon: icon('list-ordered', 'ic-16'),
    body: '<div class="chip-row" aria-label="Available phases, click in order">' + remainBtns + '</div><ol class="seq-list" aria-label="Your ordering">' + seq + '</ol>',
  });

  // OBJ-M3: Field log
  const snippets = DISCIPLINE_SNIPPETS.map(function (sn, i) {
    return (
      '<li class="card-li row-li">' +
      '<p class="serif-li"><span class="sn-num">S' + (i + 1) + '</span>' + esc(sn.text) + '</p>' +
      miniSelect({
        value: env.discipline[sn.id] || '',
        ariaLabel: 'Discipline for snippet ' + (i + 1),
        placeholder: '— discipline —',
        options: DISCIPLINES,
        fid: 'disc-' + sn.id,
        cls: 'sel-white',
        attrs: ' data-act="set-map" data-key="discipline" data-id="' + sn.id + '"',
      }) +
      '</li>'
    );
  }).join('');
  html += paperPanel({ title: 'Field log', subtitle: 'Which collection discipline produced each snippet? (OBJ-M3)', icon: icon('landmark', 'ic-16'), body: '<ul class="ul-tight">' + snippets + '</ul>' });

  // OBJ-M11: Altitude shelf
  const altItems = ALTITUDE_PRODUCTS.map(function (p) {
    const chips = ALTITUDES.map(function (a) {
      return chipToggle({
        active: env.altitudes[p.id] === a.id,
        act: 'set-map', dataKey: 'altitudes', dataId: p.id, dataVal: a.id,
        ariaLabel: 'File "' + p.text + '" as ' + a.label,
        fid: 'alt-' + p.id + '-' + a.id,
        inner: esc(a.label),
      });
    }).join('');
    return '<li class="card-li row-li"><p class="serif-li">' + esc(p.text) + '</p><div class="chip-row">' + chips + '</div></li>';
  }).join('');
  html += paperPanel({
    title: 'Altitude shelf', subtitle: 'File each product by intelligence altitude (OBJ-M11)', icon: icon('scale', 'ic-16'),
    body: '<ul class="ul-tight">' + altItems + '</ul>' +
      note('info', '', 'Tactical = feeds the SOC&#39;s tools for days. Operational = explains a campaign for months. Strategic = shapes risk decisions for years. Same intel, three altitudes, three audiences.'),
  });

  // OBJ-M10 (medium) / OBJ-H8 (hard): response board
  if (s.mode === 'medium') {
    const picks = HARDENING_OPTIONS.map(function (o) {
      return '<li>' + chipToggle({
        active: env.hardening.indexOf(o.id) !== -1,
        act: 'toggle-arr', dataKey: 'hardening', dataId: o.id,
        ariaLabel: 'Toggle action: ' + o.text,
        tone: env.hardening.indexOf(o.id) !== -1 ? 'moss' : 'amber',
        fid: 'hard-' + o.id,
        inner: '<span class="sans">' + esc(o.text) + '</span>',
        cls: 'chip-wide',
      }) + '</li>';
    }).join('');
    html += paperPanel({ title: 'Response board', subtitle: 'Select the 4 proportionate protective actions (OBJ-M10)', icon: icon('shield-question', 'ic-16'), body: '<ul class="ul-tight">' + picks + '</ul>' });
  } else {
    // Shuffled display order — never render remaining buttons in the correct sequence
    const remainingR = RESPONSE_DISPLAY.filter(function (id) { return env.response.indexOf(id) === -1; })
      .map(function (id) { return RESPONSE_ACTIONS.filter(function (a) { return a.id === id; })[0]; });
    const remainBtnsR = remainingR
      .map(function (a) {
        return '<button type="button" data-act="push-seq" data-key="response" data-id="' + a.id + '" data-fid="resp-' + a.id + '" class="btn phasebtn phasebtn-left">' + esc(a.label) + '</button>';
      })
      .join('') + (remainingR.length === 0 ? '<span class="hint-italic">All six placed — remove to redo.</span>' : '');
    const seqR = env.response.map(function (id, i) {
      const a = RESPONSE_ACTIONS.filter(function (x) { return x.id === id; })[0];
      return seqSlot(a.label, i, 'response', id);
    }).join('');
    html += paperPanel({
      title: 'Response board', subtitle: 'Order all six actions — contain first, paperwork last (OBJ-H8)', icon: icon('shield-question', 'ic-16'),
      body: '<div class="chip-row">' + remainBtnsR + '</div><ol class="seq-list">' + seqR + '</ol>',
    });

    // OBJ-H9: Executive brief
    const briefOpts = BRIEF_OPTIONS.map(function (o) {
      const sel = env.h9Brief === o.id;
      return (
        '<label class="radio-card ' + (sel ? 'radio-on' : '') + '">' +
        '<input type="radio" name="h9-brief" value="' + o.id + '" ' + (sel ? 'checked' : '') + ' data-act="set-brief" data-val="' + o.id + '"' +
        ' data-fid="brief-' + o.id + '" aria-label="Select strategic line: ' + esc(o.label) + '" class="radio-green">' +
        '<span class="serif">' + esc(o.label) + '</span></label>'
      );
    }).join('');
    const riskChips = RISK_OPTIONS.map(function (r) {
      return '<li>' + chipToggle({
        active: env.h9Risks.indexOf(r.id) !== -1,
        act: 'toggle-arr', dataKey: 'h9Risks', dataId: r.id,
        ariaLabel: 'Toggle residual risk: ' + r.label,
        tone: 'red',
        fid: 'risk-' + r.id,
        inner: '<span class="sans">' + esc(r.label) + '</span>',
        cls: 'chip-wide',
      }) + '</li>';
    }).join('');
    html += paperPanel({
      title: 'Executive brief', subtitle: 'What does the BOARD need? (OBJ-H9)', icon: icon('briefcase', 'ic-16'),
      body:
        '<fieldset><legend class="mini-legend">Strategic line</legend><div class="radio-stack">' + briefOpts + '</div></fieldset>' +
        '<fieldset class="mt-fieldset"><legend class="mini-legend">Residual risks to state (pick 2)</legend><ul class="ul-tight">' + riskChips + '</ul></fieldset>',
    });
  }

  return html;
}

// ── Evidence desk (center) ───────────────────────────────────────────────────

const SOURCE_ICONS = {
  social: 'at-sign', news: 'newspaper', blogs: 'book-open', forums: 'messages-square',
  paste: 'clipboard-list', repos: 'github', dns: 'globe', advisory: 'shield-alert',
};
const CORE_ITEMS = ['e1', 'e3', 'e5', 'e7', 'e9', 'e11', 'e12', 'e13'];

function renderDesk(s) {
  const env = s.env;
  const openItemId = env.openItem || null;
  const browseSource = openItemId && openItemId.indexOf('s:') === 0 ? openItemId.slice(2) : null;
  const sheetItem = openItemId && openItemId.indexOf('s:') !== 0 ? openItemId : null;
  let html = '';

  // Source rack
  const rackBtns = SOURCES.map(function (src) {
    const active = browseSource === src.id;
    return (
      '<button type="button" data-act="set-open-item" data-val="s:' + src.id + '" aria-pressed="' + active + '"' +
      ' title="' + esc(src.desc) + '" data-fid="rack-' + src.id + '" class="rackbtn ' + (active ? 'rackbtn-on' : '') + '">' +
      icon(SOURCE_ICONS[src.id] || 'file-text', 'ic-16') + esc(src.name) +
      '<span class="rack-kind ' + (active ? 'rack-kind-on' : '') + '">' + esc(src.kind) + '</span></button>'
    );
  }).join('');
  const rackDesc = browseSource
    ? (SOURCES.filter(function (x) { return x.id === browseSource; })[0] || {}).desc || ''
    : 'Pick a rack to browse its items.';
  let rackBody = '<div class="chip-row">' + rackBtns + '</div><p class="rack-desc">' + esc(rackDesc) + '</p>';
  if (browseSource) {
    const items = EVIDENCE.filter(function (e) { return e.sourceId === browseSource; })
      .map(function (e) {
        const isSheet = sheetItem === e.id;
        const cased = s.mode === 'hard' && env.h1Select.indexOf(e.id) !== -1;
        return (
          '<li><button type="button" data-act="set-open-item" data-val="' + e.id + '" data-fid="item-' + e.id + '"' +
          ' class="itembtn ' + (isSheet ? 'itembtn-on' : '') + '">' +
          icon('file-text', 'ic-14 muted2') +
          '<span class="itemtext"><span class="item-title">' + esc(e.title) + '</span>' +
          '<span class="item-meta">' + esc(e.author) + ' · ' + esc(e.date) + '</span></span>' +
          (CORE_ITEMS.indexOf(e.id) !== -1
            ? '<span aria-hidden="true" class="core-dot" title="' + esc(s.mode === 'medium' ? 'Core item — tag it for OBJ-M4' : 'Core case item') + '"></span>'
            : '') +
          (cased ? '<span class="cased-badge">cased</span>' : '') +
          '</button></li>'
        );
      })
      .join('');
    rackBody += '<ul class="lab-scroll rack-list" data-scroll="rack-list">' + items + '</ul>';
  }
  html += paperPanel({ title: 'Source rack', subtitle: '8 open-source racks — browse the incoming material (OBJ-M4)', icon: icon('scan-line', 'ic-16'), body: rackBody });

  // Evidence sheet
  if (sheetItem) {
    const item = EVIDENCE.filter(function (e) { return e.id === sheetItem; })[0];
    if (item) {
      const source = SOURCES.filter(function (x) { return x.id === item.sourceId; })[0];
      const flagged = env.h1Select.indexOf(item.id) !== -1;
      const body =
        '<div class="filing-box">' +
        '<label class="filing-label">File to rack ' +
        miniSelect({
          value: env.itemTags[item.id] || '',
          ariaLabel: 'File ' + item.title + ' to a source rack',
          placeholder: '— rack —',
          options: SOURCES.map(function (x) { return { id: x.id, label: x.kind }; }),
          fid: 'file-' + item.id,
          cls: 'w-44',
          attrs: ' data-act="set-map" data-key="itemTags" data-id="' + item.id + '"',
        }) +
        '</label>' +
        (s.mode === 'hard'
          ? chipToggle({
              active: flagged,
              act: 'toggle-arr', dataKey: 'h1Select', dataId: item.id,
              ariaLabel: 'Flag ' + item.title + ' as belonging to the Crimson Crate v2 case',
              tone: 'red',
              fid: 'flag-' + item.id,
              inner: '<span class="sans">' + (flagged ? 'Flagged: part of the case' : 'Flag: part of Crimson Crate v2 case') + '</span>',
            }) +
            miniSelect({
              value: env.h1Tags[item.id] || '',
              ariaLabel: 'Decisive-evidence token for ' + item.title,
              placeholder: '— evidence token —',
              options: H1_TOKENS.map(function (t) { return { id: t.id, label: t.label }; }),
              fid: 'token-' + item.id,
              cls: 'w-52',
              disabled: !flagged,
              attrs: ' data-act="set-map" data-key="h1Tags" data-id="' + item.id + '"',
            })
          : '') +
        '</div>' +
        '<blockquote class="sheet-quote">' +
        item.segments
          .map(function (seg) {
            if (typeof seg === 'string') return '<span>' + esc(seg) + '</span>';
            const clip = CLIPS[seg.c];
            if (!clip) return '';
            return clipSpan(clip, env.clips.indexOf(clip.id) !== -1);
          })
          .join('') +
        '</blockquote>' +
        (item.credibility
          ? '<div class="mt-gap">' + note(item.caseRelevant ? 'info' : 'warn', 'Credibility note · ', esc(item.credibility)) + '</div>'
          : '') +
        env.clips
          .filter(function (c) { return CLIPS[c] && CLIPS[c].benign; })
          .map(function (c) {
            return note('warn', 'Distractor in basket · ' + CLIPS[c].label + ' · ', esc(CLIPS[c].benignWhy));
          })
          .join('');
      html += paperPanel({ title: 'Evidence · ' + item.title, subtitle: (source ? source.name : item.sourceId) + ' · ' + item.author + ' · ' + item.date, icon: icon('file-text', 'ic-16'), tape: true, body: body });
    }
  }

  // Evidence basket
  let basketBody;
  if (env.clips.length === 0) {
    basketBody = '<p class="basket-empty">Nothing clipped yet. Open an evidence sheet and click any <span class="mono">dotted-underline</span> observable to clip it.</p>';
  } else {
    basketBody =
      '<ul class="chip-row">' +
      env.clips
        .map(function (c) {
          const clip = CLIPS[c];
          return (
            '<li class="basket-chip ' + (clip && clip.benign ? 'basket-benign' : '') + '">' +
            '<span class="basket-label">' + esc(clip ? clip.label : c) + '</span>' +
            '<button type="button" aria-label="Remove ' + esc(clip ? clip.label : c) + ' from basket"' +
            ' data-act="remove-clip" data-id="' + esc(c) + '" data-fid="bkt-' + esc(c) + '" class="basket-x">×</button>' +
            '</li>'
          );
        })
        .join('') +
      '</ul>';
  }
  html += paperPanel({ title: 'Evidence basket', subtitle: 'Clipped observables — they flow to ShareGrid → Intake automatically', icon: icon('paperclip', 'ic-16'), body: basketBody });

  return html;
}

// ── ShareGrid platform (center) ──────────────────────────────────────────────

const GRID_TYPE_GROUPS = [
  {
    label: 'Atomic — plain observable values',
    options: [
      { id: 'domain', label: 'domain name' },
      { id: 'ipv4', label: 'IPv4 address' },
      { id: 'url', label: 'full URL' },
      { id: 'email', label: 'email address' },
      { id: 'tool', label: 'tool / software name' },
      { id: 'cve', label: 'CVE identifier' },
    ],
  },
  { label: 'Computed — derived by an algorithm', options: [{ id: 'hash', label: 'hash / regex (computed)' }] },
  { label: 'Behavioral — multi-step pattern', options: [{ id: 'behavior', label: 'behavior pattern' }] },
];
const WATCH_ITEMS = ['c-hps', 'c-ip77', 'c-hash', 'c-mercer'];
const TRUE_TIMELINE = ['t1', 't2', 't3', 't4'];

function gridTabs(s) {
  const tabs = [
    { id: 'records', label: 'Records', icon: 'archive' },
    { id: 'intake', label: 'Intake', icon: 'inbox' },
    { id: 'watch', label: 'Watchdesk', icon: 'activity' },
    { id: 'timeline', label: 'Timeline', icon: 'git-branch' },
    { id: 'attack', label: 'ATT&CK Board', icon: 'binary' },
    { id: 'dispatch', label: 'Dispatch', icon: 'route' },
  ];
  if (s.mode === 'hard') tabs.push({ id: 'tripwire', label: 'Tripwire', icon: 'waves' });
  return tabs;
}

function renderGrid(s) {
  const env = s.env;
  const mode = s.mode;
  const tabs = gridTabs(s);
  const active = tabs.some(function (t) { return t.id === UISTATE.gridTab; }) ? UISTATE.gridTab : 'records';

  const tabBtns = tabs
    .map(function (t) {
      const on = active === t.id;
      return (
        '<button type="button" data-act="set-grid-tab" data-val="' + t.id + '" aria-pressed="' + on + '"' +
        ' data-fid="gtab-' + t.id + '" class="term-tab ' + (on ? 'term-tab-on' : '') + '">' + icon(t.icon, 'ic-14') + ' ' + esc(t.label) + '</button>'
      );
    })
    .join('');

  let body = '';
  if (active === 'records') body = gridRecords();
  else if (active === 'intake') body = gridIntake(s);
  else if (active === 'watch') body = gridWatchdesk(s);
  else if (active === 'timeline') body = gridTimeline(s);
  else if (active === 'attack') body = gridAttack(s);
  else if (active === 'dispatch') body = gridDispatch(s);
  else if (active === 'tripwire' && mode === 'hard') body = gridTripwire(s);

  return (
    '<div class="term" aria-label="ShareGrid threat-intelligence sharing platform">' +
    '<header class="term-head">' +
    '<span class="term-brand">' + icon('radio-tower', 'ic-16') + ' ShareGrid</span>' +
    '<span class="term-sub">threat-intelligence sharing platform · TAXII 2.1 connected · MISP community synced</span>' +
    '<span class="term-live"><span class="live-dot" aria-hidden="true"></span> live feed</span>' +
    '</header>' +
    '<nav class="term-tabs" aria-label="ShareGrid sections">' + tabBtns + '</nav>' +
    '<div class="term-body">' + body + '</div>' +
    '</div>'
  );
}

function gridRecords() {
  const g = GRID_RECORD;
  const row = function (k, v) {
    return '<div><dt class="term-dt">' + esc(k) + ': </dt><dd class="term-dd">' + esc(v) + '</dd></div>';
  };
  return (
    '<div class="term-stack">' +
    '<section class="term-card"><h3 class="term-h">Record ' + esc(g.recordId) + ' — ' + esc(g.name) + ' <span class="term-dim">(corroborated partner record)</span></h3>' +
    '<dl class="term-dl">' +
    row('First seen', g.firstSeen) + row('Actor', g.actor) + row('Motivation', g.motivation) +
    row('Targets', g.targets) + row('Confidence', g.confidence) +
    '</dl>' +
    '<p class="term-p">' + esc(g.v1Summary) + '</p>' +
    '<p class="term-k">v1 IOC list</p>' +
    '<ul class="term-ul">' + g.v1Iocs.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul>' +
    '<p class="term-k">v1 TTPs</p>' +
    '<ul class="term-ul">' + g.v1Ttps.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
    '</section>' +
    '<section class="term-card"><h3 class="term-h">STIX 2.1 payload preview <span class="term-dim">(simplified for training)</span></h3>' +
    '<pre class="term-pre" aria-label="Simplified STIX payload example">' +
    '{\n' +
    '  "type": "indicator",\n' +
    '  "spec_version": "2.1",\n' +
    '  "pattern": "[domain-name:value = \'halvard-portal-secure[.]com\']",\n' +
    '  "labels": ["malicious-activity"],\n' +
    '  "confidence": 80,\n' +
    '  "valid_from": "2026-01-09T00:00:00Z"\n' +
    '}\n' +
    '// relationships: campaign "Crimson Crate" → uses → intrusion-set "CRATE-BROKER"\n' +
    '//                intrusion-set → uses → attack-pattern (ATT&amp;CK technique)' +
    '</pre>' +
    '<p class="term-p term-p-dim">STIX formats the intelligence (indicators, campaigns, intrusion-sets, relationships); TAXII transports it between partners. Origin, methods and targets all live here — which is why your typed, confident, correctly labelled intake matters downstream.</p>' +
    '</section></div>'
  );
}

function gridIntake(s) {
  const env = s.env;
  const mode = s.mode;
  if (env.clips.length === 0) {
    return '<p class="term-p">Intake tray empty. Open the Evidence Desk, clip observables, and they will queue here for typing.</p>';
  }
  const rows = env.clips
    .map(function (c) {
      const clip = CLIPS[c];
      if (!clip) return '';
      let extra = '';
      if (mode === 'hard') {
        extra =
          miniSelect({
            value: env.confidence[c] || '',
            ariaLabel: 'Confidence for ' + clip.label,
            placeholder: '— confidence —',
            fid: 'conf-' + c,
            cls: 'sel-dark sel-flat',
            attrs: ' data-act="set-map" data-key="confidence" data-id="' + esc(c) + '"',
            options: [
              { id: 'high', label: 'high' },
              { id: 'medium', label: 'medium' },
              { id: 'low', label: 'low' },
            ],
          }) +
          chipToggle({
            active: env.fpFlag.indexOf(c) !== -1,
            act: 'toggle-arr', dataKey: 'fpFlag', dataId: c,
            ariaLabel: 'Toggle likely-false-positive flag for ' + clip.label,
            tone: 'red',
            fid: 'fp-' + c,
            inner: 'FP',
          });
      }
      return (
        '<li class="term-row">' +
        '<span class="term-obs' + (clip.benign ? ' term-obs-benign' : '') + '">' + esc(clip.label) +
        (clip.benign ? '<span class="term-flagged">· flagged distractor</span>' : '') + '</span>' +
        '<span class="term-controls">' +
        miniSelect({
          value: env.typing[c] || '',
          ariaLabel: 'Observation class for ' + clip.label,
          placeholder: '— class —',
          groups: GRID_TYPE_GROUPS,
          fid: 'type-' + c,
          cls: 'sel-dark sel-flat',
          attrs: ' data-act="set-map" data-key="typing" data-id="' + esc(c) + '"',
        }) +
        extra +
        '</span></li>'
      );
    })
    .join('');
  return (
    '<div class="term-stack-tight">' +
    '<p class="term-note">Class every clipped observable. Machine correlation downstream depends on correct classes' +
    (mode === 'hard' ? ', a confidence rating, and honest false-positive flags.' : '.') + '</p>' +
    '<ul class="ul-tight">' + rows + '</ul>' +
    (mode === 'hard'
      ? '<p class="term-note">Remember: confidence follows corroboration (multi-source = high, single-source = medium), and the shared newsletter CDN plus the documentation-range scanner deserve FP flags — not blocklists.</p>'
      : '') +
    '</div>'
  );
}

function gridWatchdesk(s) {
  const env = s.env;
  const rows = WATCH_ITEMS.map(function (c) {
    const clip = CLIPS[c];
    const isNew = env.known[c] === 'new';
    return (
      '<li class="term-row">' +
      '<span class="term-obs">' + esc(clip.label) + '</span>' +
      '<span class="term-controls">' +
      chipToggle({
        active: env.known[c] === 'known',
        act: 'set-map', dataKey: 'known', dataId: c, dataVal: 'known',
        ariaLabel: 'Mark ' + clip.label + ' as known',
        tone: 'moss',
        fid: 'known-' + c,
        inner: 'known',
      }) +
      chipToggle({
        active: isNew,
        act: 'set-map', dataKey: 'known', dataId: c, dataVal: 'new',
        ariaLabel: 'Mark ' + clip.label + ' as new',
        fid: 'new-' + c,
        inner: 'new',
      }) +
      miniSelect({
        value: env.watch[c] || '',
        ariaLabel: 'Watch action for ' + clip.label,
        placeholder: '— action —',
        disabled: !isNew,
        fid: 'watch-' + c,
        cls: 'sel-dark sel-flat',
        attrs: ' data-act="set-map" data-key="watch" data-id="' + esc(c) + '"',
        options: [
          { id: 'block', label: 'block (perimeter)' },
          { id: 'monitor', label: 'monitor (watchlist)' },
          { id: 'escalate', label: 'escalate (IR)' },
        ],
      }) +
      '</span></li>'
    );
  }).join('');
  return (
    '<div class="term-stack-tight"><p class="term-note">Correlate against the v1 record: is each indicator already KNOWN, or NEW? Then route new ones — block at the perimeter, monitor on the watchlist, or escalate to IR.</p>' +
    '<ul class="ul-tight">' + rows + '</ul></div>'
  );
}

function gridTimeline(s) {
  const env = s.env;
  const mode = s.mode;
  const changes = TIMELINE_CHANGES.map(function (t) {
    const on = env.timeline.indexOf(t.id) !== -1;
    let evolve = '';
    if (mode === 'hard' && on && TRUE_TIMELINE.indexOf(t.id) !== -1) {
      evolve =
        '<div class="evolve-wrap"><label class="evolve-label">forced adjustment:' +
        miniSelect({
          value: env.evolve[t.id] || '',
          ariaLabel: 'Telemetry adjustment for ' + t.label,
          placeholder: '— pick the monitoring change —',
          options: EVOLVE_OPTIONS,
          fid: 'evolve-' + t.id,
          cls: 'sel-dark',
          attrs: ' data-act="set-map" data-key="evolve" data-id="' + t.id + '"',
        }) +
        '</label></div>';
    }
    return (
      '<li class="evolve-item">' +
      chipToggle({
        active: on,
        act: 'toggle-arr', dataKey: 'timeline', dataId: t.id,
        ariaLabel: 'Toggle change: ' + t.label,
        tone: on ? 'moss' : 'amber',
        fid: 'tl-' + t.id,
        inner: '<span class="sans term-chip-text">' + esc(t.label) + '</span>',
        cls: 'chip-wide',
      }) +
      evolve +
      '</li>'
    );
  }).join('');
  return (
    '<div class="term-stack">' +
    '<div class="snap-grid">' +
    '<div class="term-card"><h3 class="term-h term-h-dim">Snapshot v1 · November</h3><p class="term-p">' + esc(GRID_RECORD.v1Summary) + '</p></div>' +
    '<div class="term-card term-card-v2"><h3 class="term-h" style="color:#e4f0b8">Snapshot v2 · now</h3><p class="term-p">Built from the current rack: lookalike portal domain registered days before lures, kit v2 hash, staff address dump in circulation, access-for-sale chatter, kit commit with a harvest page, and the CERT bulletin naming appliance exploitation.</p></div>' +
    '</div>' +
    '<fieldset><legend class="term-legend">Select every change that v2 actually introduces</legend>' +
    '<ul class="evolve-list">' + changes + '</ul></fieldset>' +
    '</div>'
  );
}

function gridAttack(s) {
  const env = s.env;
  const mode = s.mode;
  const rows = BEHAVIORS.map(function (b, i) {
    return (
      '<li class="term-card">' +
      '<p class="term-beh"><span class="b-badge">b' + (i + 1) + '</span><strong>' + esc(b.label) + '.</strong> <span class="term-dim2">' + esc(b.detail) + '</span></p>' +
      '<div class="chip-row mt6">' +
      miniSelect({
        value: env.techMap[b.id] || '',
        ariaLabel: 'ATT&CK technique for ' + b.label,
        placeholder: '— technique —',
        fid: 'tech-' + b.id,
        cls: 'sel-dark',
        attrs: ' data-act="set-map" data-key="techMap" data-id="' + b.id + '"',
        options: ATTACK_OPTIONS.map(function (o) { return { id: o.id, label: o.id + ' · ' + o.name }; }),
      }) +
      miniSelect({
        value: env.telemetry[b.id] || '',
        ariaLabel: 'Telemetry source for ' + b.label,
        placeholder: '— telemetry —',
        fid: 'tele-' + b.id,
        cls: 'sel-dark',
        attrs: ' data-act="set-map" data-key="telemetry" data-id="' + b.id + '"',
        options: TELEMETRY_OPTIONS,
      }) +
      '</div></li>'
    );
  }).join('');

  let chain = '';
  if (mode === 'hard') {
    const chainRemaining = CHAIN_DISPLAY.filter(function (b) { return env.chain.indexOf(b) === -1; });
    const btns = chainRemaining
      .map(function (id) {
        const b = BEHAVIORS.filter(function (x) { return x.id === id; })[0];
        const idx = BEHAVIORS.findIndex(function (x) { return x.id === id; }) + 1;
        return (
          '<button type="button" data-act="push-seq" data-key="chain" data-id="' + id + '" data-fid="chain-' + id + '" class="btn phasebtn phasebtn-dark">b' + idx + ' · ' + esc(b.label) + '</button>'
        );
      })
      .join('') + (chainRemaining.length === 0 ? '<span class="term-dim2">All placed — remove to redo.</span>' : '');
    const seq = env.chain.map(function (id, i) {
      const b = BEHAVIORS.filter(function (x) { return x.id === id; })[0];
      const idx = BEHAVIORS.findIndex(function (x) { return x.id === id; }) + 1;
      return seqSlot('b' + idx + ' · ' + b.label, i, 'chain', id);
    }).join('');
    chain =
      '<div class="term-card chain-card"><p class="term-legend">Chain order — click the four v2 behaviors in attack-chain sequence</p>' +
      '<div class="chip-row mt6">' + btns + '</div>' +
      '<ol class="seq-list mt6">' + seq + '</ol></div>';
  }

  return (
    '<div class="term-stack-tight"><p class="term-note">Map each observed behavior to its ATT&amp;CK technique, then choose the telemetry that would actually see it.' +
    (mode === 'hard' ? ' Then order the v2 chain along the attack lifecycle.' : '') + '</p>' +
    '<ul class="ul-tight">' + rows + '</ul>' + chain + '</div>'
  );
}

function gridDispatch(s) {
  const env = s.env;
  const mode = s.mode;
  const rows = DISPATCH_PACKAGES.map(function (p) {
    return (
      '<li class="term-row">' +
      '<span class="term-obs sans">' + esc(p.label) + '</span>' +
      '<span class="term-controls">' +
      miniSelect({
        value: env.dispatch[p.id] || '',
        ariaLabel: 'Destination for ' + p.label,
        placeholder: '— destination —',
        options: DISPATCH_DESTINATIONS,
        fid: 'disp-' + p.id,
        cls: 'sel-dark',
        attrs: ' data-act="set-map" data-key="dispatch" data-id="' + p.id + '"',
      }) +
      '</span></li>'
    );
  }).join('');

  let tlp = '';
  if (mode === 'hard') {
    const legend = TLP_LEVELS.map(function (t) {
      return '<li><strong>' + esc(t.label) + '</strong> — ' + esc(t.desc) + '</li>';
    }).join('');
    const arts = TLP_ARTIFACTS.map(function (a) {
      return (
        '<li class="term-row">' +
        '<span class="term-obs sans">' + esc(a.label) + '</span>' +
        '<span class="term-controls">' +
        miniSelect({
          value: env.tlp[a.id] || '',
          ariaLabel: 'TLP tag for ' + a.label,
          placeholder: '— TLP —',
          options: TLP_LEVELS.map(function (t) { return { id: t.id, label: t.label }; }),
          fid: 'tlp-' + a.id,
          cls: 'sel-dark',
          attrs: ' data-act="set-map" data-key="tlp" data-id="' + a.id + '"',
        }) +
        '</span></li>'
      );
    }).join('');
    tlp =
      '<div class="term-card tlp-card"><h3 class="term-h">TLP 2.0 stamps — tag every outgoing artifact</h3>' +
      '<ul class="tlp-legend">' + legend + '</ul>' +
      '<ul class="ul-tight">' + arts + '</ul></div>';
  }

  return (
    '<div class="term-stack"><p class="term-note">Routing discipline keeps the sharing community alive: clean observables travel, personal data stays home, unverified claims get watched — never amplified.</p>' +
    '<ul class="ul-tight">' + rows + '</ul>' + tlp + '</div>'
  );
}

function gridTripwire(s) {
  const env = s.env;
  const ruleRows = [0, 1]
    .map(function (row) {
      const r = env.rule[row] || { field: '', op: '', value: '' };
      return (
        '<div class="term-card rule-row">' +
        '<span class="rule-clause">clause ' + (row + 1) + '</span>' +
        miniSelect({
          value: r.field, ariaLabel: 'Rule ' + (row + 1) + ' field', placeholder: '— field —',
          options: RULE_FIELDS, fid: 'rule-' + row + '-field', cls: 'sel-dark',
          attrs: ' data-act="set-rule" data-row="' + row + '" data-part="field"',
        }) +
        miniSelect({
          value: r.op, ariaLabel: 'Rule ' + (row + 1) + ' operator', placeholder: '— operator —',
          options: RULE_OPS, fid: 'rule-' + row + '-op', cls: 'sel-dark',
          attrs: ' data-act="set-rule" data-row="' + row + '" data-part="op"',
        }) +
        miniSelect({
          value: r.value, ariaLabel: 'Rule ' + (row + 1) + ' value', placeholder: '— value —',
          options: RULE_VALUES, fid: 'rule-' + row + '-value', cls: 'sel-dark',
          attrs: ' data-act="set-rule" data-row="' + row + '" data-part="value"',
        }) +
        '</div>'
      );
    })
    .join('');
  const logs = LOG_LINES.map(function (l) {
    const on = env.logCalls.indexOf(l.id) !== -1;
    return (
      '<li class="term-row">' +
      '<span class="term-logline"><span class="term-time">' + esc(l.time) + '</span>' + esc(l.text) + '</span>' +
      '<span class="term-controls">' +
      chipToggle({
        active: on,
        act: 'toggle-arr', dataKey: 'logCalls', dataId: l.id,
        ariaLabel: 'Mark line ' + l.time + ' as true positive',
        tone: 'moss',
        fid: 'log-' + l.id,
        inner: 'true positive',
      }) +
      chipToggle({
        active: !on,
        act: 'log-noise', dataId: l.id,
        ariaLabel: 'Mark line ' + l.time + ' as noise',
        fid: 'noise-' + l.id,
        inner: 'noise',
      }) +
      '</span></li>'
    );
  }).join('');
  return (
    '<div class="term-stack"><p class="term-note">Build a precise two-clause detection, then make the truth call on each sample log line. Broad operators print false positives; exact operators print trust.</p>' +
    '<div class="ul-tight">' + ruleRows + '</div>' +
    '<div><p class="term-legend mb6">Sample telemetry — mark TRUE campaign positives</p>' +
    '<ul class="ul-tight">' + logs + '</ul></div>' +
    '<p class="term-note term-note-dim">Why it matters: a rule like <em>contains "shipment"</em> would swallow every legitimate parcel mail (indicator fatigue). Exact fields + exact operators + honest triage = a detection your SOC can trust at 3 a.m.</p>' +
    '</div>'
  );
}

// ── Mission board (right column) ─────────────────────────────────────────────

function renderMissions(s) {
  const mode = s.mode;
  const list = objectivesForMode(mode);
  if (UISTATE.missionsOpenId === null && list.length) UISTATE.missionsOpenId = list[0].id;
  const doneCount = list.filter(function (o) { return s.objectives[o.id] && s.objectives[o.id].done; }).length;

  const dots = list
    .map(function (o) {
      const done = s.objectives[o.id] && s.objectives[o.id].done;
      return (
        '<span title="' + esc(o.id + (done ? ' · verified' : '')) + '" class="mdot ' + (done ? 'mdot-on' : '') + '"></span>'
      );
    })
    .join('');

  const cards = list
    .map(function (o, i) {
      const st = s.objectives[o.id] || { done: false, attempts: 0, hints: 0, firstTry: false, lastResult: null };
      const open = UISTATE.missionsOpenId === o.id;
      const stateCls = st.done ? ' obj-done' : st.lastResult === 'fail' ? ' obj-fail' : '';

      const chips = o.pillar.map(pillarChip).join('');
      const hintsShown = o.hints
        .slice(0, st.hints)
        .map(function (h, hi) {
          return note('warn', 'Hint ' + (hi + 1) + ' · ', esc(h));
        })
        .join('');
      let hintCtl = '';
      if (st.hints < o.hints.length) {
        hintCtl =
          '<button type="button" data-act="hint" data-id="' + o.id + '" data-fid="hint-' + o.id + '" class="btn btn-hint">' +
          icon('lightbulb', 'ic-14') + ' ' + (mode === 'hard' ? 'Use the one nudge (−stars)' : 'Hint ' + (st.hints + 1) + '/' + o.hints.length) + '</button>';
      } else if (st.hints > 0) {
        hintCtl = '<span class="hints-done">' + icon('lock', 'ic-12') + ' all hints used</span>';
      }

      const failNote = st.lastResult === 'fail' && !st.done
        ? note('warn', 'Returned · ', esc(UISTATE.failWhys[o.id] || 'Not yet — re-check the mission instructions.'))
        : '';
      const okNote = st.done ? note('ok', 'Why it matters · ', esc(o.feedback)) : '';

      const stamps =
        st.lastResult === 'fail' && !st.done ? stamp('fail') : st.done ? stamp('pass') : '';

      return (
        '<li class="obj-card' + stateCls + '">' + stamps +
        '<button type="button" data-act="toggle-open" data-id="' + o.id + '" aria-expanded="' + open + '" data-fid="obj-' + o.id + '" class="obj-head">' +
        '<span class="obj-id ' + (st.done ? 'obj-id-on' : '') + '">' + esc(o.id.replace('OBJ-', '')) + '</span>' +
        '<span class="obj-headtext"><span class="obj-title">' + esc(o.title) + '</span>' +
        '<span class="obj-chips">' + chips + '</span></span>' +
        (st.done
          ? icon('check-circle-2', 'ic-20 obj-check')
          : icon('chevron-down', 'ic-16 obj-chevron' + (open ? ' obj-chevron-open' : ''))) +
        '</button>' +
        (open
          ? '<div class="obj-body">' +
            '<p class="serif-li">' + esc(o.task) + '</p>' +
            '<details class="anchor-box"><summary class="anchor-sum">' + icon('info', 'ic-12') + ' objective anchor</summary>' +
            '<p class="anchor-text">' + esc(o.anchor) + '</p></details>' +
            '<div class="chip-row">' +
            checkButton({ act: 'check', fid: 'chk-' + o.id, dataId: o.id, label: 'Check' }) +
            '<button type="button" data-act="aim" data-id="' + o.id + '" data-fid="aim-' + o.id + '" class="btn btn-aim">' + icon('crosshair', 'ic-14') + ' Aim</button>' +
            hintCtl +
            '</div>' +
            (st.hints > 0 ? '<div class="hint-stack">' + hintsShown + '</div>' : '') +
            failNote + okNote +
            '<p class="obj-foot">Pillar: ' + o.pillar.map(function (p) { return PILLAR_META[p].name; }).join(' + ') + ' · Objective ' + (i + 1) + ' of ' + list.length + '</p>' +
            '</div>'
          : '') +
        '</li>'
      );
    })
    .join('');

  return paperPanel({
    title: 'Mission board',
    subtitle: mode === 'medium' ? '12 guided objectives — in order' : '9 broad objectives — free order',
    icon: icon('check-circle-2', 'ic-16'),
    body:
      '<div class="mdots" aria-hidden="true">' + dots + '</div>' +
      '<p class="sr-only">' + doneCount + ' of ' + list.length + ' objectives verified.</p>' +
      '<ul class="lab-scroll missions-scroll" data-scroll="missions" aria-label="Objective list">' + cards + '</ul>',
  });
}

// ── Records room (center) ────────────────────────────────────────────────────

const GUIDE_CARDS = [
  {
    title: 'Active threats need identifying — and monitoring',
    body: 'An active threat is a risk to business operations that is already in motion: observed against your organization or your sector, not hypothetical. It is neither a vulnerability (your own weakness) nor a trend (background direction). Because it is live, the duty it creates is continuous identification and monitoring.',
    inCase: 'The intake tray exercise: the forum access-sale thread and the staff-address dump are active; the unpatched appliance is a vulnerability; the unproven breach claim is context.',
  },
  {
    title: 'OSINT — diverse public sources, free but noisy',
    body: 'Open-Source Intelligence is collected from publicly available information. The sources are diverse: social media, blogs, news articles, chat forums — and many others, from paste sites and code repositories to domain registries and official advisories. Open sources are free and fast, but everything must be validated: noise, scams and unverified claims are part of the deal.',
    inCase: 'The eight racks mirror the lesson&#39;s source list; the feed sweep shows the cost — 8 of 13 items survived validation for the case.',
  },
  {
    title: 'Threat-intelligence sharing platforms',
    body: 'Sharing platforms (sector ISACs over TAXII, MISP communities, vendor exchanges) let defenders pool what they see. Correlating against shared records reveals a threat&#39;s origin, its methods (TTPs — ATT&amp;CK is the shared language), and its potential targets — including you, before the first lure arrives.',
    inCase: 'ShareGrid: the v1 record correlates the staging IP; the dispatch desk routes clean intel out (ISAC/MISP) and keeps PII home, under TLP 2.0 handling rules.',
  },
  {
    title: 'Track how threats evolve — then stay ahead',
    body: 'Threats change: new infrastructure, new lure formats, new exploit paths. Platforms let you track that evolution between snapshots and translate each change into a monitoring or protection adjustment. The goal of the whole loop is to preempt active threats and protect operations — intelligence that changes nothing is trivia.',
    inCase: 'The v1→v2 timeline diff forces four concrete adjustments; the response board orders contain → patch → hunt → monitor → share → debrief.',
  },
];

const OFFICIAL_REFS = [
  ['ATT&CK — Phishing (T1566)', 'https://attack.mitre.org/techniques/T1566/'],
  ['ATT&CK — Acquire Infrastructure (T1583)', 'https://attack.mitre.org/techniques/T1583/'],
  ['ATT&CK — Exploit Public-Facing Application (T1190)', 'https://attack.mitre.org/techniques/T1190/'],
  ['ATT&CK — Application Layer Protocol (T1071)', 'https://attack.mitre.org/techniques/T1071/'],
  ['FIRST — TLP 2.0', 'https://www.first.org/tlp/'],
  ['OASIS — STIX/TAXII docs', 'https://oasis-open.github.io/cti-documentation/'],
  ['MISP project', 'https://www.misp-project.org/'],
  ['CompTIA CySA+ CS0-003 objectives', 'https://www.comptia.org/certifications/cybersecurity-analyst'],
];

function renderRecords(s) {
  const mode = s.mode;
  const items = mode === 'hard' ? QUIZ_HARD : QUIZ_MEDIUM;
  const submitted = Boolean(s.quizSubmitted && s.quizSubmitted[mode]);
  const answered = items.filter(function (q) { return s.quizAnswers[q.id] !== undefined; }).length;
  const allAnswered = answered === items.length;

  const tabBtns = [
    ['guide', 'Field guide', 'book-open'],
    ['quiz', 'Knowledge check', 'list-checks'],
    ['debrief', 'Debrief dossier', 'scroll-text'],
    ['glossary', 'Glossary', 'book-marked'],
  ]
    .map(function (t) {
      const on = UISTATE.recordsTab === t[0];
      return (
        '<button type="button" role="tab" aria-selected="' + on + '" data-act="set-records-tab" data-val="' + t[0] + '"' +
        ' data-fid="rtab-' + t[0] + '" class="rtab ' + (on ? 'rtab-on' : '') + '">' + icon(t[2], 'ic-14') + ' ' + t[1] + '</button>'
      );
    })
    .join('');

  let body = '';
  if (UISTATE.recordsTab === 'guide') body = recordsGuide();
  else if (UISTATE.recordsTab === 'quiz') body = recordsQuiz(s, items, submitted, answered, allAnswered, mode);
  else if (UISTATE.recordsTab === 'debrief') body = recordsDebrief();
  else if (UISTATE.recordsTab === 'glossary') body = recordsGlossary();

  return (
    '<div class="records-wrap">' +
    '<div class="rtabs" role="tablist" aria-label="Records room sections">' + tabBtns + '</div>' +
    body +
    '</div>'
  );
}

function recordsGuide() {
  const cards = GUIDE_CARDS.map(function (c, i) {
    return (
      '<li class="card-li">' +
      '<p class="guide-k">Concept ' + (i + 1) + ' · ' + c.title + '</p>' +
      '<p class="serif-li">' + c.body + '</p>' +
      '<p class="guide-incase"><strong class="guide-incase-k">In this case · </strong>' + c.inCase + '</p>' +
      '</li>'
    );
  }).join('');
  return paperPanel({
    title: 'Field guide — Lesson 2.1 core concepts',
    subtitle: 'What the chapter teaches, mapped to this case',
    icon: icon('book-open', 'ic-16'),
    body: '<ul class="guide-list">' + cards + '</ul>' +
      '<div class="mt-gap">' + note('info', '', 'Lesson 2.1 in one line: open sources tell you what is happening; sharing platforms tell you what it means; tracking the evolution tells you what to do next — identify, monitor, stay ahead.') + '</div>',
  });
}

function recordsQuiz(s, items, submitted, answered, allAnswered, mode) {
  const qs = items
    .map(function (q, qi) {
      const picked = s.quizAnswers[q.id];
      const opts = q.options
        .map(function (opt, oi) {
          const isPicked = picked === oi;
          const isCorrect = q.correct === oi;
          let cls = 'quiz-opt';
          if (submitted && isCorrect) cls += ' q-correct';
          else if (submitted && isPicked && !isCorrect) cls += ' q-wrong';
          else if (isPicked) cls += ' q-picked';
          return (
            '<label class="' + cls + '">' +
            '<input type="radio" name="quiz-' + q.id + '" value="' + oi + '" ' + (isPicked ? 'checked' : '') +
            ' data-act="quiz-answer" data-id="' + q.id + '" data-val="' + oi + '"' +
            ' data-fid="quiz-' + q.id + '-' + oi + '"' +
            ' aria-label="Answer option ' + (oi + 1) + ': ' + esc(opt) + '" class="radio-amber">' +
            '<span class="sans">' + esc(opt) + '</span></label>'
          );
        })
        .join('');
      const explain = submitted
        ? note(picked === q.correct ? 'ok' : 'warn', picked === q.correct ? 'Correct · ' : 'Review · ', esc(q.explain))
        : '';
      return (
        '<li class="quiz-q">' +
        '<p class="quiz-qt"><span class="quiz-qnum">Q' + (qi + 1) + '.</span>' + esc(q.q) +
        '<span class="quiz-anchor" title="This item tests the objective it is anchored to">→ ' + esc(q.anchor.replace('OBJ-', '')) + '</span></p>' +
        '<fieldset class="quiz-fieldset"' + (submitted ? ' disabled' : '') + '>' +
        '<legend class="sr-only">' + esc(q.q) + '</legend>' +
        opts +
        '</fieldset>' +
        (explain ? '<div class="mt6">' + explain + '</div>' : '') +
        '</li>'
      );
    })
    .join('');

  const foot = submitted
    ? '<div class="mt-gap">' +
      note(
        'ok',
        'Submitted · ',
        items.filter(function (q) { return s.quizAnswers[q.id] === q.correct; }).length + '/' + items.length + ' correct.' +
          (mode === 'hard'
            ? ' Application beats recall — reread any item you missed and find the matching evidence in the rack.'
            : ' Re-read the explanations for anything missed — every one maps back to a mission objective.'),
      ) +
      '</div>'
    : '<div class="quiz-foot">' +
      '<button type="button" data-act="quiz-submit" data-fid="quiz-submit" ' + (allAnswered ? '' : 'disabled') + ' class="btn btn-submit">' +
      icon('send', 'ic-16') + ' Submit answers (' + answered + '/' + items.length + ')</button>' +
      '<span class="quiz-footnote">Your quiz feeds the clearance rating — 35% of it.</span>' +
      '</div>';

  return paperPanel({
    title: 'Knowledge check — ' + (mode === 'hard' ? 'scenario application' : 'concepts'),
    subtitle: mode === 'hard' ? '7 applied items — justify like an analyst' : '6 concept items — explanations after submission',
    icon: icon('graduation-cap', 'ic-16'),
    body: '<ol class="quiz-list">' + qs + '</ol>' + foot,
  });
}

function recordsDebrief() {
  const detect = [
    '<strong class="deb-k">Email gateway logs · </strong>Subjects matching <code class="code-chip">^shipment[ _-]?#?\\d{4}</code>, spoofed carrier senders, links to<code class="code-chip code-gap">halvard-portal-secure[.]com</code>(T1566.001/.002).',
    '<strong class="deb-k">Registrar &amp; CT-log monitoring · </strong>Newly registered lookalike domains imitating carrier brands (T1583.001) — earliest possible warning.',
    '<strong class="deb-k">Web/WAF logs of the file-transfer appliance · </strong>Exploitation attempts against the appliance path (T1190); alert on anomalous POSTs and new accounts.',
    '<strong class="deb-k">Proxy &amp; DNS logs · </strong>Connections to staging/clone infrastructure, periodic HTTPS beaconing with sleep-24h pattern (T1071.001).',
  ]
    .map(function (t) { return '<li class="deb-li">' + t + '</li>'; })
    .join('');
  const mitig = [
    '<strong>M1051 — Update Software / M1050 — Exploit Protection:</strong> emergency-patch the file-transfer appliance (M1051); virtual-patch via WAF rules (M1050) until the change window.',
    '<strong>M1049 — Antivirus/Antimalware + M1054 — Software Configuration:</strong> block known kit hashes; deny execution of unsanctioned RMM (FleetNode-type) tools.',
    '<strong>M1021 — Restrict Web-Based Content / DNS filtering:</strong> sinkhole the lookalike domains; rewrite links in mail.',
    '<strong>M1017 — User Training:</strong> targeted awareness for freight-ops staff using the actual v2 lure.',
    '<strong>M1019 — Threat Intelligence Program:</strong> ISAC membership + TAXII feed ingestion with confidence scoring and aging (anti-fatigue).',
  ]
    .map(function (t) { return '<li class="deb-li">' + t + '</li>'; })
    .join('');
  const refs = OFFICIAL_REFS.map(function (r) {
    return (
      '<li><a href="' + r[1] + '" target="_blank" rel="noopener noreferrer" class="ref-link">' + esc(r[0]) + ' ' + icon('external-link', 'ic-12') +
      '<span class="sr-only">(opens in a new tab)</span></a></li>'
    );
  }).join('');

  return (
    '<div class="records-stack">' +
    paperPanel({
      title: 'Debrief · detection opportunities', subtitle: 'Where this campaign leaves traces', icon: icon('eye', 'ic-16'),
      body: '<ul class="deb-list">' + detect + '</ul>',
    }) +
    paperPanel({
      title: 'Debrief · mitigation recommendations', subtitle: 'Mapped controls with IDs', icon: icon('shield-check', 'ic-16'),
      body: '<ul class="deb-list">' + mitig + '</ul>' +
        '<p class="deb-foot">MITRE mitigations referenced by ID and official name (simplified mappings for training — M1051 Update Software, M1050 Exploit Protection, M1049 Antivirus/Antimalware, M1054 Software Configuration, M1021 Restrict Web-Based Content, M1017 User Training, M1019 Threat Intelligence Program).</p>',
    }) +
    '<div class="two-col">' +
    paperPanel({
      title: 'Blue-team takeaways', icon: icon('landmark', 'ic-16'),
      body: '<ul class="disc-list">' +
        '<li>Validate before you block: shared infrastructure and documentation ranges are FP factories.</li>' +
        '<li>Correlate new intel against existing records — known indicators deserve retro-hunts, not re-blocks.</li>' +
        '<li>Route by sensitivity: PII stays home; TLP tags are contracts, not suggestions.</li>' +
        '<li>Convert every campaign diff into concrete telemetry changes, or drift wins.</li></ul>',
    }) +
    paperPanel({
      title: 'Red-team mindset', icon: icon('swords', 'ic-16'),
      body: '<ul class="disc-list">' +
        '<li>Access brokers industrialize entry: your sector being &quot;boring&quot; does not exempt you.</li>' +
        '<li>Infrastructure is prepared days ahead (T1583.001) — defenders can see it coming in CT logs.</li>' +
        '<li>Kit templates (v1 → v2) change lures fast; static blocklists age in weeks.</li>' +
        '<li>The appliance is the softest door: internet-exposed + unpatched beats any phishing filter.</li></ul>',
    }) +
    '</div>' +
    paperPanel({
      title: 'Official references', subtitle: 'Open in a new tab — verify every ID yourself', icon: icon('briefcase-business', 'ic-16'),
      body: '<ul class="ref-grid">' + refs + '</ul>',
    }) +
    '</div>'
  );
}

function recordsGlossary() {
  const rows = GLOSSARY.map(function (g) {
    return (
      '<div class="gloss-row"><dt class="gloss-term">' + esc(g.term) + '</dt>' +
      '<dd class="gloss-def">' + esc(g.def) + '</dd></div>'
    );
  }).join('');
  return paperPanel({
    title: 'Glossary — ' + GLOSSARY.length + ' terms',
    subtitle: 'Every jargon term in the case file',
    icon: icon('book-marked', 'ic-16'),
    body: '<dl class="gloss-list">' + rows + '</dl>',
  });
}

// ── Completion (close-out certificate) ───────────────────────────────────────

function pillarColor(p) {
  return { P1: '#92510e', P2: '#4d6b1f', P3: '#a4530b', P4: '#57534e' }[p];
}

function renderCompletion(s) {
  const mode = s.mode;
  const rating = ratingOf(mode, s);
  const objectives = objectivesForMode(mode);
  const allDone = objectives.every(function (o) { return s.objectives[o.id] && s.objectives[o.id].done; });
  const quizSubmitted = Boolean(s.quizSubmitted && s.quizSubmitted[mode]);

  const stars = [1, 2, 3, 4, 5].map(function (i) { return starMarkup(i <= rating.stars); }).join('');

  const recap = ['P1', 'P2', 'P3', 'P4']
    .map(function (p) {
      const items = objectives.filter(function (o) { return o.pillar.indexOf(p) !== -1; });
      if (!items.length) return '';
      const rows = items
        .map(function (o) {
          const done = s.objectives[o.id] && s.objectives[o.id].done;
          return (
            '<li class="recap-li' + (done ? '' : ' recap-li-off') + '">' +
            '<span aria-hidden="true" class="recap-dot ' + (done ? 'recap-dot-on' : '') + '"></span>' +
            '<span class="recap-id">' + esc(o.id.replace('OBJ-', '')) + '</span>' +
            '<span class="recap-title">' + esc(o.title) + '</span>' +
            '<span class="sr-only">' + (done ? 'verified' : 'not yet verified') + '</span>' +
            '</li>'
          );
        })
        .join('');
      return (
        '<div class="recap-card"><p class="recap-k" style="color:' + pillarColor(p) + '">' + p + ' · ' + esc(PILLAR_META[p].name) + '</p>' +
        '<ul>' + rows + '</ul></div>'
      );
    })
    .join('');

  const stat = function (k, v) {
    return '<div class="stat-card"><p class="stat-v">' + esc(v) + '</p><p class="stat-k">' + esc(k) + '</p></div>';
  };

  return (
    '<div role="dialog" aria-modal="true" aria-label="Case close-out report" class="modal-bg modal-bg-anim" id="completion-dialog">' +
    '<div class="cert pop-in">' +
    '<button type="button" data-act="close-completion" data-fid="close-completion" aria-label="Close the case close-out report" class="modal-x">' + icon('x', 'ic-16') + '</button>' +
    '<div class="cert-hero">' +
    icon('award', 'cert-award') +
    '<p class="cert-kicker">The OSINT Bureau · clearance report</p>' +
    '<h2 class="cert-stamp">' + (mode === 'hard' ? 'Case closed · hard' : 'Case closed · medium') + '</h2>' +
    '<div class="cert-stars" aria-label="Rating: ' + rating.stars + ' of 5 stars">' + stars + '</div>' +
    '<p class="cert-sub">Provisional clearance ' + Math.round(rating.pct * 100) + '% — missions 65% · quiz 35%</p>' +
    '</div>' +
    (!allDone
      ? '<p class="cert-warn">The case is not fully stamped yet — finish all objectives to earn your final rating.</p>'
      : '') +
    (!quizSubmitted
      ? '<p class="cert-warn cert-warn2">The knowledge check is still unsubmitted — completing it raises your clearance (Records room → Knowledge check).</p>'
      : '') +
    '<div class="stat-grid">' +
    stat('Missions', objectives.filter(function (o) { return s.objectives[o.id] && s.objectives[o.id].done; }).length + '/' + objectives.length) +
    stat('First-attempt', Math.round(rating.firstTryPct * 100) + '%') +
    stat('Quiz', quizSubmitted ? Math.round(rating.quizPct * 100) + '%' : 'pending') +
    stat('Hints used', String(rating.hintPenalty)) +
    '</div>' +
    '<div class="recap-wrap"><h3 class="mini-legend">Mastery recap by pillar</h3>' + recap + '</div>' +
    '<div class="next-box"><h3 class="mini-legend">Where to go next</h3>' +
    '<ul class="next-list">' +
    '<li class="next-li">' + icon('arrow-right', 'ic-14 next-arrow') + ' Next lesson: turn intelligence into hunts — proactively search for the v2 indicators across 90 days of telemetry.</li>' +
    '<li class="next-li">' + icon('arrow-right', 'ic-14 next-arrow') + ' Deep-dive STIX 2.1 object types and write a real TAXII collection request.</li>' +
    '<li class="next-li">' + icon('arrow-right', 'ic-14 next-arrow') + ' Re-run the other difficulty mode for the stricter, noisy-feed experience.</li>' +
    '<li class="next-li">' + icon('arrow-right', 'ic-14 next-arrow') + ' Read the official ATT&amp;CK pages for every technique you mapped (Debrief → Official references).</li>' +
    '</ul></div>' +
    '<div class="cert-foot">' +
    '<button type="button" data-act="close-completion" data-fid="cert-back" class="btn btn-certificate">Back to the bureau</button>' +
    '</div>' +
    '</div></div>'
  );
}

// ── Reset confirmation dialog ────────────────────────────────────────────────

function renderResetDialog() {
  return (
    '<div role="alertdialog" aria-modal="true" aria-label="Confirm lab reset" class="modal-bg modal-bg-anim" id="reset-dialog">' +
    '<div class="reset-card pop-in">' +
    '<h2 class="reset-title">Burn the case file?</h2>' +
    '<p class="reset-text">This wipes every stamp, clip, dispatch and quiz answer in this browser and restores the pristine lab. There is no undo.</p>' +
    '<div class="reset-actions">' +
    '<button type="button" data-act="reset-cancel" data-fid="reset-cancel" class="btn btn-keep">Keep working</button>' +
    '<button type="button" data-act="reset-confirm" data-fid="reset-confirm" class="btn btn-burn">Reset the lab</button>' +
    '</div>' +
    '</div></div>'
  );
}
