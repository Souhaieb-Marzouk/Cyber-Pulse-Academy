// ─── The Cascadia Clearance — UI components (vanilla JS render functions) ─
// Ported from shared.tsx, environment.tsx and panels.tsx. Icons are inline
// SVGs carrying the exact lucide paths used by the original.
'use strict';

// ── icons (lucide v0.525 paths, 24×24 stroke) ──
const ICON_PATHS = {
  'book-open': '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  radar: '<path d="M19.07 4.93A10 10 0 0 0 6.99 3.34"/><path d="M4 6h.01"/><path d="M2.29 9.62A10 10 0 1 0 21.31 8.35"/><path d="M16.24 7.76A6 6 0 1 0 8.23 16.67"/><path d="M12 18h.01"/><path d="M17.99 11.66A6 6 0 0 1 15.77 16.67"/><circle cx="12" cy="12" r="2"/><path d="m13.41 10.59 5.66-5.66"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  'circle-check': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  circle: '<circle cx="12" cy="12" r="10"/>',
  'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  'badge-check': '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>',
  compass: '<path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/><circle cx="12" cy="12" r="10"/>',
  'graduation-cap': '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
  'rotate-ccw': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  'shield-alert': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  stamp: '<path d="M14 13V8.5C14 7 15 7 15 5a3 3 0 0 0-6 0c0 2 1 2 1 3.5V13"/><path d="M20 15.5a2.5 2.5 0 0 0-2.5-2.5h-11A2.5 2.5 0 0 0 4 15.5V17a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1z"/><path d="M5 22h14"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/>',
  'file-text': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  lightbulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  'message-square-text': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M13 8H7"/><path d="M17 12H7"/>',
  'scroll-text': '<path d="M15 12h-5"/><path d="M15 8h-5"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/>',
  terminal: '<path d="M12 19h8"/><path d="m4 17 6-6-6-6"/>',
  landmark: '<path d="M10 18v-7"/><path d="M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z"/><path d="M14 18v-7"/><path d="M18 18v-7"/><path d="M3 22h18"/><path d="M6 18v-7"/>',
  mail: '<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/>',
  'file-warning': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  'locate-fixed': '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3"/><line x1="2" x2="5" y1="12" y2="12"/><line x1="19" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="5"/><line x1="12" x2="12" y1="19" y2="22"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
};

function icon(name, sizeCls) {
  return (
    '<svg class="icon ' + (sizeCls || 'i-16') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    ICON_PATHS[name] + '</svg>'
  );
}

const KIND_ICON = { chat: 'message-square-text', doc: 'file-text', log: 'terminal', message: 'message-square-text', pdf: 'scroll-text', listing: 'landmark', email: 'mail' };

const PILLAR_META = {
  understand: { label: 'Understand', cls: 'pillar-understand', icon: 'book-open' },
  recognize: { label: 'Recognize', cls: 'pillar-recognize', icon: 'eye' },
  detect: { label: 'Detect', cls: 'pillar-detect', icon: 'radar' },
  mitigate: { label: 'Mitigate', cls: 'pillar-mitigate', icon: 'wrench' },
};

function pillarBadge(pillar) {
  const m = PILLAR_META[pillar];
  return '<span class="pillar-badge ' + m.cls + '">' + icon(m.icon, 'i-12') + m.label + '</span>';
}

function objDot(done) {
  return done
    ? icon('circle-check', 'i-20 obj-dot-done')
    : icon('circle', 'i-20 obj-dot-open');
}

function sectionTitle(kicker, title) {
  return (
    '<div class="section-title">' +
    '<div class="kicker">' + kicker + '</div>' +
    '<h2 class="display-h2">' + title + '</h2>' +
    '</div>'
  );
}

function trainingTag() {
  return '<span class="training-tag">Training data · synthetic</span>';
}

function progressRing(value, total, size) {
  size = size || 52;
  const pct = total === 0 ? 0 : Math.round((value / total) * 100);
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  return (
    '<div class="progress-ring" style="width:' + size + 'px;height:' + size + 'px" role="status" aria-label="Progress: ' + value + ' of ' + total + ' (' + pct + ' percent)">' +
      '<svg width="' + size + '" height="' + size + '" class="ring-svg">' +
        '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="#d6d0c4" stroke-width="5"/>' +
        '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="#0f766e" stroke-width="5" stroke-linecap="round" ' +
          'stroke-dasharray="' + c + '" stroke-dashoffset="' + (c - (c * pct) / 100) + '" class="ring-arc"/>' +
      '</svg>' +
      '<span class="ring-label">' + pct + '%</span>' +
    '</div>'
  );
}

function stars(count, size) {
  size = size || 28;
  let out = '<div class="stars" aria-label="' + count + ' of 5 stars">';
  for (let i = 1; i <= 5; i++) {
    out += '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" aria-hidden>' +
      '<path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 16.9 5.9 20.4l1.5-6.8L2.2 9l6.9-.7z" ' +
      'fill="' + (i <= count ? '#b45309' : '#ddd6c8') + '" stroke="' + (i <= count ? '#92400e' : '#c9c2b2') + '" stroke-width="1"/></svg>';
  }
  return out + '</div>';
}

// ─── Stage 0: mode select ──────────────────────────────────────────────────
function renderModeSelect() {
  return (
    '<main class="mode-select">' +
      '<div class="mode-select-head">' +
        '<div class="kicker kicker-center">CompTIA Security+ SY0-801 · Objective 2.5 · Interactive lab</div>' +
        '<h1 class="display-hero">THE CASCADIA <span class="accent">CLEARANCE</span></h1>' +
        '<p class="mode-select-lede">Northwind Logistics wants to ship <strong>Cascadia</strong>, its new AI support assistant. ' +
        'You are the security analyst who stamps the go-live clearance — and every AI risk in the dossier ' +
        'is yours to catch: systems, models, prompts, privacy, and data exposure.</p>' +
      '</div>' +
      '<div class="mode-cards">' +
        '<button type="button" data-action="pick-mode" data-mode="medium" class="mode-card mode-medium" aria-label="Select Medium mode: guided review with hints">' +
          '<div class="mode-card-head">' + icon('graduation-cap', 'i-24 mode-med-icon') + '<span class="mode-card-title">MEDIUM</span>' +
            '<span class="mode-card-pill pill-teal">Guided review</span></div>' +
          '<p class="mode-card-lede">12 stepwise objectives walk the whole dossier. Every check teaches; three-tier hints are freely available (they cost stars, not progress). Quiz after practice.</p>' +
          '<ul class="mode-card-list"><li>· Ordered checklist, always know the next step</li><li>· Tolerant validation, teaching feedback on every answer</li><li>· Best first lab if the objective is new to you</li></ul>' +
        '</button>' +
        '<button type="button" data-action="pick-mode" data-mode="hard" class="mode-card mode-hard" aria-label="Select Hard mode: noisy intake, strict validation">' +
          '<div class="mode-card-head">' + icon('shield-alert', 'i-24 mode-hard-icon') + '<span class="mode-card-title">HARD</span>' +
            '<span class="mode-card-pill pill-orange">Intake queue</span></div>' +
          '<p class="mode-card-lede">9 broad challenges over a noisy dossier with two red herrings. Strict validation, exact extraction, sequence checks — one optional nudge, and it costs score.</p>' +
          '<ul class="mode-card-list"><li>· You triage: nothing is pre-flagged</li><li>· Near-misses rejected with the reason why</li><li>· For candidates ready to be tested, not taught</li></ul>' +
        '</button>' +
      '</div>' +
      '<p class="mode-select-foot">All artifacts are synthetic training data · defensive / educational use only</p>' +
    '</main>'
  );
}

// ─── Stage 1: briefing ─────────────────────────────────────────────────────
function renderBriefing(mode) {
  return (
    '<div class="stage-narrow">' +
      sectionTitle('Case briefing · read once', 'Northwind Logistics vs. the go-live date') +
      '<div class="card card-pad">' +
        trainingTag() +
        '<div class="briefing-body">' +
          '<p><strong>The situation.</strong> Northwind Logistics, a mid-size freight company, ran a six-week ' +
          'pilot of <strong>Cascadia</strong> — an AI support assistant wired into the orders database, the ' +
          'escalation API, and the HR intake mailbox. Customers love it. The board wants it live on Monday.</p>' +
          '<p><strong>Your role.</strong> You are the security analyst holding the <em>go-live clearance stamp</em>. ' +
          'The pilot dossier is on your desk: chat transcripts, Slack messages, a vendor model card, a ' +
          'marketplace listing, API logs, QA notes, and a résumé that should not be in the pile.</p>' +
          '<p><strong>Why it matters.</strong> This lab covers CompTIA Security+ (SY0-801) objective 2.5 — ' +
          '<em> explain the security risks associated with AI: risks to AI systems, models, prompts, privacy, ' +
          'and data exposure</em>. By the final stamp you will have identified every risk class in real-looking ' +
          'evidence, chosen detections for them, and assembled the control plan that answers the board.</p>' +
          (mode === 'hard'
            ? '<p class="hard-brief"><strong>Hard-mode briefing:</strong> the dossier arrived unsorted. Two artifacts are red herrings. Validation is strict; hints are off by default (one paid nudge if you must).</p>'
            : '') +
        '</div>' +
        '<div class="briefing-actions">' +
          '<button type="button" class="btn btn-primary btn-44 btn-wide" data-action="goto-chapter" data-chapter="2">Open the primer ' + icon('arrow-right', 'i-16') + '</button>' +
        '</div>' +
      '</div>' +
    '</div>'
  );
}

// ─── Stage 2: primer ───────────────────────────────────────────────────────
const FACET_BULLETS = {
  systems: '<li>· Shadow AI — unsanctioned tools</li><li>· Over-privileged integrations</li><li>· Third-party supply chain</li><li>· Overreliance / automation bias</li>',
  models: '<li>· Model theft / API abuse</li><li>· Data poisoning</li><li>· Hallucination &amp; explainability</li><li>· Bias</li>',
  prompts: '<li>· Direct &amp; indirect injection</li><li>· Jailbreaking</li><li>· Prompt / system-prompt leaking</li>',
  privacy: '<li>· PII absorbed into training data</li><li>· Sensitive input disclosure</li><li>· Retention beyond purpose</li>',
  exposure: '<li>· Secrets pasted into AI tools</li><li>· Improper data handling</li><li>· Missing DLP &amp; output filtering</li>',
};

function renderPrimer() {
  return '<div id="primer-area" class="stage-wide">' + renderPrimerInner() + '</div>';
}

function renderPrimerInner() {
  const s = store.state;
  const fb = uiState.feedback['OBJ-M1'];

  const facetCards = FACETS.map(function (f) {
    return (
      '<div class="card card-sm">' +
        '<div class="facet-head">' + icon('book-open', 'i-16 facet-icon') + '<h3 class="facet-title">' + f.label + '</h3></div>' +
        '<p class="facet-desc">' + f.desc + '</p>' +
        '<ul class="facet-list">' + FACET_BULLETS[f.id] + '</ul>' +
      '</div>'
    );
  }).join('');

  let foundation = '';
  if (s.mode === 'medium') {
    const rows = FACET_DEFS.map(function (d) {
      return (
        '<div class="match-row">' +
          '<p class="match-def">' + d.text + '</p>' +
          '<select aria-label="Facet for definition ' + d.defId + '" class="select-input" data-bind="primerMatch" data-key="' + d.defId + '">' +
            '<option value="">Choose facet…</option>' +
            FACETS.map(function (f) { return '<option value="' + f.id + '"' + (s.primerMatch[d.defId] === f.id ? ' selected' : '') + '>' + f.label + '</option>'; }).join('') +
          '</select>' +
        '</div>'
      );
    }).join('');
    foundation =
      '<div class="card card-pad primer-check">' +
        '<div class="primer-check-head">' +
          '<h3 class="card-h3">Foundation check — match facet to definition</h3>' +
          '<button type="button" class="btn btn-teal btn-sm" data-action="check" data-obj="OBJ-M1">Check results</button>' +
        '</div>' +
        '<div class="match-grid">' + rows + '</div>' +
        (fb
          ? '<div role="status" aria-live="polite" class="feedback-box ' + (fb.ok ? 'feedback-ok' : 'feedback-bad') + ' primer-feedback">' +
              '<span class="feedback-bold">' + (fb.ok ? 'PASS — ' : 'CHECK FAILED — ') + '</span>' + fb.msg + '</div>'
          : '') +
      '</div>';
  }

  const glossary = GLOSSARY.map(function (g) {
    return '<div class="gloss-item"><dt class="gloss-term">' + g.term + '</dt><dd class="gloss-def">' + g.def + '</dd></div>';
  }).join('');

  return (
    sectionTitle('The primer · knowledge core', 'Five facets of AI risk') +
      '<div class="facet-grid">' +
        facetCards +
        '<div class="card chain-card">' +
          '<div class="facet-head">' + icon('compass', 'i-16 chain-icon') + '<h3 class="facet-title">Chain position</h3></div>' +
          '<p class="chain-lede">AI risks are not one attack — they are a surface. Poisoning strikes <strong>before</strong> deployment; injection, leaking and pasted secrets strike <strong>during</strong> use; theft and hallucinated policies cash out <strong>after</strong> trust is earned. Defenders place controls at each stage.</p>' +
        '</div>' +
      '</div>' +
      foundation +
      '<div class="glossary-block">' +
        '<h3 class="card-h3">Field glossary</h3>' +
        '<dl class="gloss-grid">' + glossary + '</dl>' +
      '</div>'
  );
}

function rerenderPrimer() {
  const el = document.getElementById('primer-area');
  if (el) el.innerHTML = renderPrimerInner();
}

// ─── Objectives tracker (C4) ───────────────────────────────────────────────
function renderTrackerHTML() {
  const objectives = currentObjectives();
  const s = store.state;
  const doneCount = objectives.filter(function (o) { return s.obj[o.id] && s.obj[o.id].done; }).length;

  const items = objectives.map(function (o, i) {
    const p = s.obj[o.id] || { done: false, firstAttempt: true, hints: 0, attempts: 0 };
    const art = OBJ_ARTIFACT[o.id];
    const fb = uiState.feedback[o.id];

    let hints = '';
    for (let hi = 0; hi < p.hints; hi++) {
      hints += '<p class="hint-box"><span class="hint-label">Hint ' + (hi + 1) + ': </span>' + o.hints[hi] + '</p>';
    }

    let buttons =
      '<button type="button" class="btn btn-teal btn-sm" data-action="check" data-obj="' + o.id + '">Check results</button>';
    if (o.hints.length > p.hints) {
      buttons += '<button type="button" class="btn btn-hint btn-sm" data-action="hint" data-obj="' + o.id + '">' +
        icon('lightbulb', 'i-14') + ' Hint (' + p.hints + '/' + o.hints.length + ')</button>';
    }
    if (art && !p.done) {
      buttons += '<button type="button" class="btn btn-ghost btn-sm" data-action="locate" data-art="' + art + '">' +
        icon('locate-fixed', 'i-14') + ' Open ' + art + '</button>';
    }

    return (
      '<li class="tracker-item' + (p.done ? ' tracker-done' : '') + '">' +
        '<div class="tracker-flex">' +
          objDot(p.done) +
          '<div class="min-w-0">' +
            '<div class="tracker-tags"><span class="mono obj-id">' + o.id.replace('OBJ-', '') + '</span>' + pillarBadge(o.pillar) + '</div>' +
            '<p class="tracker-prompt">' + o.prompt + '</p>' +
            '<p class="tracker-context">' + o.context + '</p>' +
            '<div class="tracker-actions">' + buttons + '</div>' +
            hints +
            (fb
              ? '<div role="status" aria-live="polite" class="feedback-box ' + (fb.ok ? 'feedback-ok' : 'feedback-bad') + ' tracker-feedback">' +
                  '<span class="feedback-bold">' + (fb.ok ? 'PASS — ' : 'CHECK FAILED — ') + '</span>' + fb.msg + '</div>'
              : '') +
          '</div>' +
        '</div>' +
      '</li>'
    );
  }).join('');

  return (
    '<div class="tracker">' +
      '<div class="tracker-head">' +
        '<h3 class="tracker-title">Clearance objectives</h3>' +
        '<span class="mono tracker-count">' + doneCount + '/' + objectives.length + '</span>' +
      '</div>' +
      '<ol class="tracker-list" aria-label="List of objectives">' + items + '</ol>' +
    '</div>'
  );
}

function rerenderTracker() {
  document.querySelectorAll('.tracker-slot').forEach(function (el) { el.innerHTML = renderTrackerHTML(); });
}

// ─── Artifact block renderer ───────────────────────────────────────────────
function blockView(b, revealed) {
  switch (b.k) {
    case 'p':
      return '<p class="block-p">' + b.t + '</p>';
    case 'note':
      return '<p class="block-note">' + b.t + '</p>';
    case 'bubble': {
      if (b.role === 'sys') {
        return '<p class="bubble-sys">' + b.t + '</p>';
      }
      const mine = b.role === 'user';
      return (
        '<div class="bubble-row ' + (mine ? 'bubble-mine' : 'bubble-theirs') + '">' +
          '<span class="bubble-who">' + b.who + '</span>' +
          '<div class="' + (mine ? 'bubble bubble-user' : 'bubble bubble-bot') + '">' + b.t + '</div>' +
        '</div>'
      );
    }
    case 'log':
      return '<pre class="block-log">' + b.lines.join('\n') + '</pre>';
    case 'kv':
      return (
        '<dl class="block-kv">' +
        b.rows.map(function (row) {
          return '<div class="kv-row"><dt class="kv-key">' + row[0] + '</dt><dd class="kv-val">' + row[1] + '</dd></div>';
        }).join('') +
        '</dl>'
      );
    case 'hidden':
      return revealed
        ? '<p class="block-hidden-revealed">' + b.t + '</p>'
        : '<p class="block-hidden-masked">Hidden text layer present — 3.1% pixel coverage. Content withheld.</p>';
  }
  return '';
}

// ─── Inspector task forms ──────────────────────────────────────────────────
function classifyFormHTML(art) {
  const cur = store.state.cls[art] || { facet: '', term: '' };
  const facetOpts = FACETS.map(function (f) {
    return '<option value="' + f.id + '"' + (cur.facet === f.id ? ' selected' : '') + '>' + f.label + '</option>';
  }).join('');
  const termGroups = FACETS.map(function (f) {
    return '<optgroup label="' + f.label + '">' +
      TERMS.filter(function (t) { return t.facet === f.id; }).map(function (t) {
        return '<option value="' + t.id + '"' + (cur.term === t.id ? ' selected' : '') + '>' + t.label + '</option>';
      }).join('') +
      '</optgroup>';
  }).join('');
  return (
    '<div class="classify-form">' +
      '<div class="form-kicker">Analyst classification</div>' +
      '<div class="classify-grid">' +
        '<div>' +
          '<label class="form-label" for="' + art + '-facet">Risk facet</label>' +
          '<select id="' + art + '-facet" class="select-input" data-bind="cls-facet" data-key="' + art + '">' +
            '<option value="">Select facet…</option>' + facetOpts + '</select>' +
        '</div>' +
        '<div>' +
          '<label class="form-label" for="' + art + '-term">Risk term</label>' +
          '<select id="' + art + '-term" class="select-input" data-bind="cls-term" data-key="' + art + '">' +
            '<option value="">Select term…</option>' + termGroups + '</select>' +
        '</div>' +
      '</div>' +
    '</div>'
  );
}

function multiFormHTML(k, options, note, max) {
  const sel = store.state.multi[k] || [];
  const rows = options.map(function (o) {
    const checked = sel.includes(o.id);
    return (
      '<label class="check-row">' +
        '<input type="checkbox" class="ui-checkbox" data-bind="multi" data-key="' + k + '" data-id="' + o.id + '"' +
        (max ? ' data-max="' + max + '"' : '') +
        (checked ? ' checked' : '') + ' aria-label="' + o.label + '" />' +
        '<span class="check-label">' + o.label + '</span>' +
      '</label>'
    );
  }).join('');
  return (
    '<div class="classify-form">' +
      '<div class="form-kicker">Select ' + (max || 'all that apply') + (note ? ' <span class="form-note">— ' + note + '</span>' : '') + '</div>' +
      '<div class="check-grid">' + rows + '</div>' +
    '</div>'
  );
}

function renderInspector(art) {
  const s = store.state;
  const hasHidden = art.blocks.some(function (b) { return b.k === 'hidden'; });

  let mediumForms = '';
  if (s.mode === 'medium') {
    if (['A1', 'A2', 'A4', 'A5', 'A7'].includes(art.id)) {
      mediumForms = classifyFormHTML(art.id);
    } else if (art.id === 'A3') {
      mediumForms = multiFormHTML('m4', A3_OPTIONS.map(function (id) {
        return { id: id, label: TERMS.find(function (t) { return t.id === id; }).label };
      }), 'exactly two risks', 2);
    } else if (art.id === 'A6') {
      mediumForms =
        classifyFormHTML('A6') +
        '<div class="m6-grid">' +
          '<div>' +
            '<label class="form-label" for="m6c">Best control</label>' +
            '<select id="m6c" class="select-input" data-bind="map" data-key="m6c">' +
              '<option value="">Select control…</option>' +
              M10_CONTROLS.map(function (c) { return '<option value="' + c.id + '"' + (s.maps['m6c'] === c.id ? ' selected' : '') + '>' + c.label + '</option>'; }).join('') +
            '</select>' +
          '</div>' +
          '<div>' +
            '<label class="form-label" for="m6src">Detection source that catches it first</label>' +
            '<select id="m6src" class="select-input" data-bind="map" data-key="m6src">' +
              '<option value="">Select source…</option>' +
              A6_SOURCES.map(function (c) { return '<option value="' + c.id + '"' + (s.maps['m6src'] === c.id ? ' selected' : '') + '>' + c.label + '</option>'; }).join('') +
            '</select>' +
          '</div>' +
        '</div>';
    }
  }

  let hardForm = '';
  if (s.mode === 'hard' && art.id === 'A7') {
    hardForm =
      '<div class="inspector-task">' +
        '<label class="form-label" for="h3">OBJ-H3 — transcribe the hidden instruction verbatim</label>' +
        '<textarea id="h3" class="textarea-input mono-text" placeholder="Type the hidden instruction exactly as written…" ' +
          'data-bind="text" data-key="h3">' + (s.textIn['h3'] || '') + '</textarea>' +
      '</div>';
  }

  return (
    '<article class="card inspector" aria-label="Evidence ' + art.id + ': ' + art.title + '">' +
      '<header class="inspector-head">' +
        '<div>' +
          '<div class="inspector-title-row">' +
            icon(KIND_ICON[art.kind], 'i-16 inspector-icon') +
            '<span class="mono art-id">' + art.id + '</span>' +
            '<h4 class="inspector-title">' + art.title + '</h4>' +
          '</div>' +
          '<p class="inspector-sub">' + art.from + ' · ' + art.date + '</p>' +
        '</div>' +
        trainingTag() +
      '</header>' +
      '<div class="inspector-body">' + art.blocks.map(function (b) { return blockView(b, s.hiddenRevealed); }).join('') + '</div>' +
      (hasHidden
        ? '<div class="reveal-bar">' +
            '<input type="checkbox" id="reveal-hidden" class="ui-switch" role="switch" data-bind="reveal" aria-label="Reveal hidden text layers"' + (s.hiddenRevealed ? ' checked' : '') + ' />' +
            '<label for="reveal-hidden" class="reveal-label">Reveal hidden layers (forensic visual inspection)</label>' +
          '</div>'
        : '') +
      (mediumForms ? '<div class="inspector-task">' + mediumForms + '</div>' : '') +
      (hardForm ? '<div class="inspector-task">' + hardForm + '</div>' : '') +
    '</article>'
  );
}

// ─── Evidence locker + inspector container (C3) ────────────────────────────
function renderEvidenceInner() {
  const s = store.state;
  const artifacts = ARTIFACTS.filter(function (a) { return s.mode === 'hard' || !a.hardOnly; });
  const sel = artifacts.find(function (a) { return a.id === uiState.selected; }) || null;

  const cards = artifacts.map(function (a) {
    const read = s.read.includes(a.id);
    const stamp = s.stamps[a.id];
    return (
      '<button type="button" data-action="select-artifact" data-art="' + a.id + '" aria-pressed="' + (uiState.selected === a.id) + '" ' +
        'class="artifact-card' + (uiState.selected === a.id ? ' artifact-selected' : '') + '">' +
        '<div class="artifact-top">' +
          icon(KIND_ICON[a.kind], 'i-14 artifact-icon') +
          '<span class="mono artifact-id">' + a.id + '</span>' +
          (read ? '<span class="artifact-read">read</span>' : '') +
        '</div>' +
        '<span class="artifact-title">' + a.title + '</span>' +
        (s.mode === 'hard'
          ? '<span class="stamp ' + (stamp === 'risky' ? 'stamp-risky' : stamp === 'clear' ? 'stamp-clear' : 'stamp-none') + '">' +
              (stamp === 'risky' ? 'Risky' : stamp === 'clear' ? 'Clear' : 'Unstamped') + '</span>'
          : '') +
      '</button>'
    );
  }).join('');

  let inspector = '';
  let stampBar = '';
  if (sel) {
    inspector = '<div class="inspector-wrap">' + renderInspector(sel);
    if (s.mode === 'hard') {
      stampBar =
        '<div class="stamp-bar" role="group" aria-label="Triage stamp for ' + sel.id + '">' +
          '<button type="button" class="btn btn-stamp ' + (s.stamps[sel.id] === 'risky' ? 'stamp-risky-active' : '') + '" data-action="stamp" data-art="' + sel.id + '" data-value="risky">' +
            icon('file-warning', 'i-16') + ' Stamp RISKY</button>' +
          '<button type="button" class="btn btn-stamp ' + (s.stamps[sel.id] === 'clear' ? 'stamp-clear-active' : '') + '" data-action="stamp" data-art="' + sel.id + '" data-value="clear">' +
            ' Stamp CLEAR</button>' +
        '</div>';
    }
    inspector += stampBar + '</div>';
  } else {
    inspector = '<div class="empty-inspector"><p>Select an artifact above to open the inspector.</p></div>';
  }

  return (
    '<div class="artifact-grid" aria-label="Evidence locker">' + cards + '</div>' +
    (s.mode === 'hard'
      ? '<p class="mono intake-note">Intake queue — stamp each card RISKY or CLEAR (OBJ-H1). Click a card to inspect, then stamp below.</p>'
      : '') +
    inspector
  );
}

function rerenderEvidence() {
  const el = document.getElementById('evidence-area');
  if (el) el.innerHTML = renderEvidenceInner();
}

// ─── Analyst worksheet (C3) ────────────────────────────────────────────────
function worksheetCard(title, forObj, onCheckObj, body) {
  return (
    '<section class="card card-sm wcard" aria-label="' + title + '">' +
      '<div class="wcard-head">' +
        '<h4 class="wcard-title">' + title + '</h4>' +
        (forObj && onCheckObj
          ? '<div class="wcard-check"><span class="mono obj-id">' + forObj.replace('OBJ-', '') + '</span>' +
            '<button type="button" class="btn btn-teal btn-sm" data-action="check" data-obj="' + onCheckObj + '">Check</button></div>'
          : '') +
      '</div>' +
      '<div class="wcard-body">' + body + '</div>' +
    '</section>'
  );
}

function renderWorksheetHTML() {
  const s = store.state;
  const m = s.mode === 'medium';
  const sel = function (k) { return s.multi[k] || []; };
  const checkRow = function (k, o, extra) {
    return (
      '<label class="check-row">' +
        '<input type="checkbox" class="ui-checkbox" data-bind="multi" data-key="' + k + '" data-id="' + o.id + '"' +
        (extra || '') + (sel(k).includes(o.id) ? ' checked' : '') + ' aria-label="' + o.label + '" />' +
        '<span class="check-label">' + o.label + '</span>' +
      '</label>'
    );
  };
  const radioRow = function (group, key, o, extraCls) {
    return (
      '<label class="radio-row ' + (extraCls || '') + '">' +
        '<input type="radio" name="' + group + '" value="' + o.id + '" class="ui-radio" data-bind="decision" data-key="' + key + '"' +
        (s.decision[key] === o.id ? ' checked' : '') + ' />' +
        '<span class="check-label">' + o.label + '</span>' +
      '</label>'
    );
  };

  const parts = [];

  // Detection worksheet (both modes, different question + extra logic in hard)
  let detectBody =
    '<p class="wcard-lede">' +
      (m ? 'Prompt-injection detection on Cascadia: which THREE data sources feed the detection?'
         : 'Indirect-injection detection: which THREE data sources see the whole picture?') +
    '</p>' +
    '<div class="check-grid">' +
      DETECT_SOURCES.map(function (o) { return checkRow(m ? 'm9' : 'h4', o); }).join('') +
    '</div>';
  if (!m) {
    detectBody +=
      '<fieldset class="logic-fieldset">' +
        '<legend class="logic-legend">Detection logic (OBJ-H4) — pick the one rule that works</legend>' +
        '<div class="radio-grid">' +
          H4_LOGIC.map(function (l) { return radioRow('decision-h4', 'h4', l, 'radio-boxed'); }).join('') +
        '</div>' +
      '</fieldset>';
  }
  parts.push(worksheetCard('Detection worksheet — data sources', m ? 'OBJ-M9' : 'OBJ-H4', m ? 'OBJ-M9' : 'OBJ-H4', detectBody));

  if (m) {
    // Control mapping board (medium) — row order deliberately shuffled (R6)
    const controlRows = [
      { r: 'r3', risk: 'The assistant can read the entire order database' },
      { r: 'r1', risk: 'An employee pastes a secret into an AI tool' },
      { r: 'r4', risk: 'The assistant invents a policy that staff act on' },
      { r: 'r2', risk: 'Attackers manipulate prompts to abuse the assistant' },
    ].map(function (row) {
      return (
        '<div class="match-row">' +
          '<span class="match-risk">' + row.risk + '</span>' +
          '<select aria-label="Control for: ' + row.risk + '" class="select-input" data-bind="map" data-key="' + row.r + '">' +
            '<option value="">Assign control…</option>' +
            M10_CONTROLS.map(function (c) { return '<option value="' + c.id + '"' + (s.maps[row.r] === c.id ? ' selected' : '') + '>' + c.label + '</option>'; }).join('') +
          '</select>' +
        '</div>'
      );
    }).join('');
    parts.push(worksheetCard('Control mapping board', 'OBJ-M10', 'OBJ-M10', '<div class="match-grid">' + controlRows + '</div>'));

    // Privacy control board (medium)
    const toggleRows = M11_TOGGLES.map(function (t) {
      const on = !!s.toggles[t.id];
      return (
        '<div class="toggle-row">' +
          '<span class="match-risk">' + t.label + '</span>' +
          '<div class="toggle-right">' +
            '<span class="mono toggle-state" data-state-for="' + t.id + '">' + (on ? 'on' : 'off') + '</span>' +
            '<input type="checkbox" class="ui-switch" role="switch" data-bind="toggle" data-key="' + t.id + '" aria-label="' + t.label + '"' + (on ? ' checked' : '') + ' />' +
          '</div>' +
        '</div>'
      );
    }).join('');
    parts.push(worksheetCard('Privacy control board', 'OBJ-M11', 'OBJ-M11',
      '<p class="wcard-lede">Set every switch to its secure position.</p><div class="toggle-grid">' + toggleRows + '</div>'));
  } else {
    // Attack chain reconstruction (hard)
    const chainRows = CHAIN_ORDER.map(function (id) {
      const item = CHAIN_ITEMS.find(function (c) { return c.id === id; });
      return (
        '<div class="chain-row">' +
          '<select aria-label="Order position" class="select-input chain-select" data-bind="seq" data-key="' + id + '">' +
            '<option value="">#</option>' +
            [1, 2, 3, 4, 5].map(function (n) { return '<option value="' + n + '"' + (s.seq[id] === n ? ' selected' : '') + '>' + n + '</option>'; }).join('') +
          '</select>' +
          '<span class="check-label">' + item.text + '</span>' +
        '</div>'
      );
    }).join('');
    parts.push(worksheetCard('Attack chain reconstruction', 'OBJ-H2', 'OBJ-H2',
      '<p class="wcard-lede">Number each event 1–5 in the order it occurred across the pilot.</p><div class="chain-grid">' + chainRows + '</div>'));

    // Classification drill (hard)
    const drillRows = DRILL_ITEMS.map(function (d) {
      return (
        '<div class="match-row">' +
          '<p class="drill-text">' + d.text + '</p>' +
          '<select aria-label="Classification" class="select-input" data-bind="drill" data-key="' + d.id + '">' +
            '<option value="">Label…</option>' +
            DRILL_LABELS.map(function (l) { return '<option value="' + l.id + '"' + (s.drill[d.id] === l.id ? ' selected' : '') + '>' + l.label + '</option>'; }).join('') +
          '</select>' +
        '</div>'
      );
    }).join('');
    parts.push(worksheetCard('Classification drill — four live prompts', 'OBJ-H5', 'OBJ-H5', '<div class="match-grid">' + drillRows + '</div>'));

    // Root-cause panel (hard)
    const h6Body =
      '<fieldset><legend class="logic-legend">Incident type</legend>' +
        '<div class="radio-grid two-col">' +
          H6_TYPES.map(function (t) { return radioRow('decision-h6', 'h6', t, 'radio-boxed'); }).join('') +
        '</div>' +
      '</fieldset>' +
      '<p class="wcard-strong">Proving log fields — select exactly TWO:</p>' +
      '<div class="check-grid">' +
        H6_FIELDS.map(function (f) { return checkRow('h6', f); }).join('') +
      '</div>';
    parts.push(worksheetCard('Root-cause panel — the 03:00 session', 'OBJ-H6', 'OBJ-H6', h6Body));

    // Privacy impact review (hard)
    const h7Body =
      '<p class="wcard-lede">Which corpus data types are regulated personal data?</p>' +
      '<div class="check-grid">' + H7_PII.map(function (f) { return checkRow('h7', f); }).join('') + '</div>' +
      '<div class="mt-3">' +
        '<label class="form-label" for="h7-handle">Required handling</label>' +
        '<select id="h7-handle" class="select-input" data-bind="map" data-key="h7">' +
          '<option value="">Select handling…</option>' +
          H7_HANDLING.map(function (h) { return '<option value="' + h.id + '"' + (s.maps['h7'] === h.id ? ' selected' : '') + '>' + h.label + '</option>'; }).join('') +
        '</select>' +
      '</div>';
    parts.push(worksheetCard('Privacy impact review — model card corpus', 'OBJ-H7', 'OBJ-H7', h7Body));

    // Go-live control plan (hard)
    const h8Body =
      '<div class="check-grid">' + H8_CONTROLS.map(function (c) { return checkRow('h8', c); }).join('') + '</div>' +
      '<p class="mono h8-count">Selected: <span id="h8-count">' + sel('h8').length + '</span>/5</p>';
    parts.push(worksheetCard('Go-live control plan — select exactly FIVE', 'OBJ-H8', 'OBJ-H8', h8Body));
  }

  // Final clearance stamp (both modes)
  let decisionBody =
    '<div class="radio-grid three-col" role="radiogroup" aria-label="Go-live decision">' +
      [
        { id: 'approve', label: 'Approve unconditionally' },
        { id: 'cond', label: 'Approve with conditions' },
        { id: 'block', label: 'Block go-live' },
      ].map(function (d) { return radioRow(m ? 'decision-m12' : 'decision-h9', m ? 'm12' : 'h9', d, 'radio-decision'); }).join('') +
    '</div>';
  if (m) {
    decisionBody +=
      '<div class="mt-3">' +
        '<p class="wcard-strong">Conditions attached to the approval:</p>' +
        '<div class="check-grid">' + M12_CONDITIONS.map(function (c) { return checkRow('m12c', c); }).join('') + '</div>' +
      '</div>';
  } else {
    decisionBody +=
      '<div class="mt-3">' +
        '<label class="form-label" for="h9">Board justification — name at least two core defense concepts (redaction, least privilege, filtering, human review, monitoring, DLP, policy, training)</label>' +
        '<textarea id="h9" class="textarea-input" placeholder="To the review board: …" data-bind="text" data-key="h9">' + (s.textIn['h9'] || '') + '</textarea>' +
      '</div>';
  }
  parts.push(worksheetCard('Final clearance stamp', m ? 'OBJ-M12' : 'OBJ-H9', m ? 'OBJ-M12' : 'OBJ-H9', decisionBody));

  return parts.join('');
}

function rerenderWorksheet() {
  const el = document.getElementById('worksheet-area');
  if (el) el.innerHTML = renderWorksheetHTML();
}

// ─── Stage 5: debrief (C6) ─────────────────────────────────────────────────
function renderDebrief() {
  const s = store.state;
  const objectives = currentObjectives();
  const quiz = currentQuiz();
  const allObj = objectives.every(function (o) { return s.obj[o.id] && s.obj[o.id].done; });
  const allQuiz = quiz.every(function (q) { return s.quiz[q.id] !== undefined; });
  const canSign = objectives.every(function (o) { return s.obj[o.id] && s.obj[o.id].done; }) && allQuiz;
  const remaining = objectives.filter(function (o) { return !(s.obj[o.id] && s.obj[o.id].done); }).length;

  const detections = DEBRIEF.detections.map(function (d) {
    return '<div class="detection-item"><div class="detection-name">' + d.ds + '</div><p class="detection-logic">' + d.logic + '</p></div>';
  }).join('');
  const mitigations = DEBRIEF.mitigations.map(function (m) {
    return '<li class="mitigation-item"><span class="mitigation-tag">' + m.id + '</span>' + m.text + '</li>';
  }).join('');
  const blue = DEBRIEF.blue.map(function (b) { return '<li>' + b + '</li>'; }).join('');
  const red = DEBRIEF.red.map(function (b) { return '<li>' + b + '</li>'; }).join('');
  const links = DEBRIEF.links.map(function (l) {
    return '<li><a href="' + l.url + '" target="_blank" rel="noopener noreferrer" class="ext-link">' + l.label + ' ↗</a></li>';
  }).join('');

  return (
    '<div class="stage-mid">' +
      sectionTitle('Debrief · field notes', 'What the clearance taught you') +
      '<div class="debrief-grid">' +
        '<div class="card card-pad span-2">' +
          '<h3 class="card-h3 with-icon">' + icon('target', 'i-16 orange-icon') + ' Detection opportunities</h3>' +
          '<div class="detection-grid">' + detections + '</div>' +
        '</div>' +
        '<div class="card card-pad">' +
          '<h3 class="card-h3 with-icon">' + icon('badge-check', 'i-16 teal-icon') + ' Mitigation recommendations</h3>' +
          '<ul class="mitigation-list">' + mitigations + '</ul>' +
        '</div>' +
        '<div class="stack">' +
          '<div class="card card-pad">' +
            '<h3 class="card-h3 with-icon">' + icon('users', 'i-16 orange-icon') + ' Blue-team takeaways</h3>' +
            '<ul class="takeaway-list">' + blue + '</ul>' +
          '</div>' +
          '<div class="card card-pad red-card">' +
            '<h3 class="card-h3 with-icon">' + icon('shield-alert', 'i-16 mode-hard-icon') + ' Red-team mindset</h3>' +
            '<ul class="takeaway-list red-list">' + red + '</ul>' +
          '</div>' +
        '</div>' +
        '<div class="card card-pad span-2">' +
          '<h3 class="card-h3">Keep studying</h3>' +
          '<ul class="study-links">' + links + '</ul>' +
          '<p class="residual-note">Next on the blueprint: deepfakes and social engineering (objective 2.4/2.5 cross-over), and ' +
          'Security Operations automation with AI (4.x). Residual risk to accept explicitly: no lab covers ' +
          'every real tool or model — repeat this scenario with a different AI integration you actually use.</p>' +
        '</div>' +
      '</div>' +
      '<div class="sign-block">' +
        icon('stamp', 'i-24 sign-icon') +
        '<p class="sign-text">' +
          (canSign
            ? 'All objectives passed and the knowledge check is complete. Sign the clearance.'
            : 'To sign: finish the remaining objectives (' + remaining + ') and answer all ' + quiz.length + ' knowledge-check questions.') +
        '</p>' +
        '<div class="sign-actions">' +
          '<button type="button" id="sign-clearance" class="btn btn-primary btn-44 btn-wide" data-action="sign"' +
            ((!canSign || !allObj || !allQuiz) ? ' disabled' : '') + '>Sign the clearance</button>' +
          '<button type="button" class="btn btn-outline btn-44" data-action="open-reset">' + icon('rotate-ccw', 'i-16') + ' Reset lab</button>' +
        '</div>' +
      '</div>' +
    '</div>'
  );
}

// ─── Completion modal (C7) ─────────────────────────────────────────────────
function renderCompletionModal() {
  const s = store.state;
  const objectives = currentObjectives();
  const quiz = currentQuiz();
  const mode = s.mode;

  const firstAttemptFrac = objectives.length === 0 ? 0 :
    objectives.filter(function (o) { return s.obj[o.id] && s.obj[o.id].done && s.obj[o.id].firstAttempt; }).length / objectives.length;
  const quizAcc = quiz.length === 0 ? 0 : quiz.filter(function (q) { return s.quiz[q.id] === q.correct; }).length / quiz.length;
  const hintsTotal = objectives.reduce(function (n, o) { return n + ((s.obj[o.id] && s.obj[o.id].hints) || 0); }, 0);
  const hintPenalty = Math.min(1, hintsTotal / Math.max(1, objectives.length));
  const mastery = 0.6 * firstAttemptFrac + 0.25 * quizAcc + 0.15 * (1 - hintPenalty);
  const starCount = Math.max(1, Math.min(5, Math.ceil(mastery * 5)));
  const scorePct = Math.round(firstAttemptFrac * 100);
  const quizPct = Math.round(quizAcc * 100);

  // R8: focus areas derived from the student's actual evidence — objectives
  // that took more than one attempt or hints, plus every missed quiz concept.
  const focusAreas = [];
  objectives.forEach(function (o) {
    const p = s.obj[o.id];
    if (p && p.done && (!p.firstAttempt || p.hints > 0)) {
      const why = [
        !p.firstAttempt ? 'needed more than one attempt' : null,
        p.hints > 0 ? 'used ' + p.hints + ' hint' + (p.hints > 1 ? 's' : '') : null,
      ].filter(Boolean).join(' · ');
      focusAreas.push({ title: o.id.replace('OBJ-', '') + ' (' + why + ')', detail: o.prompt });
    }
  });
  quiz.forEach(function (q) {
    const picked = s.quiz[q.id];
    if (picked !== undefined && picked !== q.correct) {
      focusAreas.push({
        title: 'Knowledge check: ' + q.tag,
        detail: 'Your answer was not the defensible one. Study this: ' + q.explain,
      });
    }
  });

  const pillarList = ['understand', 'recognize', 'detect', 'mitigate'].map(function (p) {
    const list = objectives.filter(function (o) { return o.pillar === p; });
    const done = list.filter(function (o) { return s.obj[o.id] && s.obj[o.id].done; }).length;
    return (
      '<li class="pillar-line">' + pillarBadge(p) +
      '<span class="pillar-count">' + done + '/' + list.length + ' completed</span>' +
      (done === list.length ? '<span class="mono pillar-mastered">mastered</span>' : '') +
      '</li>'
    );
  }).join('');

  const focusBlock = focusAreas.length === 0
    ? '<p class="focus-clear">No weak areas detected: every objective passed first-try with no hints and a clean knowledge check. Stretch yourself — repeat this triage on a different AI integration you actually use, and write the detection rule for its tool logs.</p>'
    : '<ul class="focus-list">' + focusAreas.map(function (f) {
        return '<li class="focus-item"><div class="focus-title">' + f.title + '</div><p class="focus-detail">' + f.detail + '</p></li>';
      }).join('') + '</ul>';

  return (
    '<div class="overlay" data-overlay="completion">' +
      '<div class="dialog modal-dialog" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1">' +
        '<button type="button" class="dialog-x" data-action="close-modal" aria-label="Close">' + icon('x', 'i-16') + '</button>' +
        '<div class="modal-head">' +
          '<div class="modal-stars">' + stars(starCount) + '</div>' +
          '<h2 id="modal-title" class="modal-title">CLEARANCE ' + (starCount >= 4 ? 'GRANTED' : starCount >= 3 ? 'SIGNED' : 'SIGNED — WITH NOTES') + '</h2>' +
          '<p class="modal-desc">You took Cascadia from “I read about AI risks” to “I found every one of them in the evidence and stamped the fix.” That is objective 2.5, demonstrated.</p>' +
        '</div>' +
        '<div class="modal-body">' +
          '<div class="stat-grid">' +
            '<div class="stat-box"><div class="stat-num">' + scorePct + '%</div><div class="stat-label">Objectives first-try</div></div>' +
            '<div class="stat-box"><div class="stat-num">' + quizPct + '%</div><div class="stat-label">Knowledge check</div></div>' +
            '<div class="stat-box"><div class="stat-num">' + objectives.length + '</div><div class="stat-label">Objectives (' + mode + ')</div></div>' +
          '</div>' +
          '<h4 class="modal-subhead">Mastery recap by pillar</h4>' +
          '<ul class="pillar-recap">' + pillarList + '</ul>' +
          // R8: focus areas derived from the student's actual performance —
          // re-attempted objectives, hints used and missed quiz items.
          '<h4 class="modal-subhead">Focus areas — study these next</h4>' +
          focusBlock +
        '</div>' +
        '<div class="modal-foot">' +
          '<button type="button" class="btn btn-teal btn-44" data-action="close-modal">Back to debrief</button>' +
          '<button type="button" class="btn btn-outline btn-44" data-action="modal-reset">Reset lab</button>' +
        '</div>' +
      '</div>' +
    '</div>'
  );
}

function renderResetDialog() {
  return (
    '<div class="overlay" data-overlay="reset">' +
      '<div class="dialog reset-dialog" role="alertdialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-desc" tabindex="-1">' +
        '<h2 id="reset-title" class="reset-title">Reset the lab?</h2>' +
        '<p id="reset-desc" class="reset-desc">This wipes all progress, answers and stamps, and returns you to mode selection. It cannot be undone.</p>' +
        '<div class="reset-foot">' +
          '<button type="button" class="btn btn-outline btn-44" data-action="cancel-reset">Keep my progress</button>' +
          '<button type="button" class="btn btn-danger btn-44" data-action="confirm-reset">Reset everything</button>' +
        '</div>' +
      '</div>' +
    '</div>'
  );
}
