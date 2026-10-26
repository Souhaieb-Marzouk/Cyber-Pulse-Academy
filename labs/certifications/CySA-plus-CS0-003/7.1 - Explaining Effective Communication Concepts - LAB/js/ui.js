// ── THE VULN BULLETIN ── rendering: components as template functions ─────────
// Static 1:1 port of the 14 React components in src/components/vuln-bulletin/.
// Every render function is pure: (state, …) → HTML string. Same structure, same
// copy, same states. Event wiring lives in app.js via data-action delegation.
// Color contract (quiz), lock states, aria attributes and 44px touch targets
// are preserved exactly.

// ── tiny helpers ─────────────────────────────────────────────────────────────
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

// severity badge — wire-story styling (bits.tsx SeverityBadge)
const SEV_STYLES = {
  Critical: 'sev-badge sev-critical',
  High: 'sev-badge sev-high',
  Medium: 'sev-badge sev-medium',
  Low: 'sev-badge sev-low',
}
function severityBadge(sev) {
  return `<span class="${SEV_STYLES[sev] || SEV_STYLES.Low}">${esc(sev)}</span>`
}

// pillar badge — CySA+-adapted naming (bits.tsx PillarBadge)
const PILLAR_META = {
  P1: { label: 'P1 · Understand', cls: 'pillar-badge pillar-p1' },
  P2: { label: 'P2 · Analyze', cls: 'pillar-badge pillar-p2' },
  P3: { label: 'P3 · Evaluate & Verify', cls: 'pillar-badge pillar-p3' },
  P4: { label: 'P4 · Plan & Mitigate', cls: 'pillar-badge pillar-p4' },
}
function pillarBadge(p) {
  const m = PILLAR_META[p]
  return `<span class="${m.cls}">${esc(m.label)}</span>`
}

// newspaper section header — double rule (bits.tsx SectionHead)
function sectionHead(kicker, title, note) {
  return `<header class="section-head">
    <div class="section-head-rule">
      <p class="kicker">${esc(kicker)}</p>
      ${note ? `<p class="section-note">${esc(note)}</p>` : ''}
    </div>
    <h2 class="section-title">${esc(title)}</h2>
  </header>`
}

// glossary tooltip term (bits.tsx Term) — CSS-only tooltip, keyboard reachable
function term(t, children) {
  const g = GLOSSARY.find(x => x.term === t)
  if (!g) return esc(children || t)
  return `<button type="button" class="term" data-tip="${esc(g.def)}" aria-label="Definition: ${esc(g.term)}">${esc(children || g.term)}<span class="term-tip" role="tooltip">${esc(g.def)}</span></button>`
}

// check feedback note (bits.tsx FeedbackNote)
function feedbackNote(ok, children) {
  return `<div role="status" class="feedback ${ok ? 'feedback-ok' : 'feedback-fail'}">
    ${ok ? icon('check-circle-2', 's4') : icon('x-circle', 's4')}<span>${children}</span>
  </div>`
}

// teaching note (bits.tsx TeachingNote)
function teachingNote(children) {
  return `<div class="teaching">${icon('triangle-alert', 's4')}<span>${children}</span></div>`
}

const BTN_INK = 'btn btn-ink'
const BTN_WIRE = 'btn btn-wire'

function selectHTML({ value, attrs, options, placeholder, cls }) {
  const opts = [`<option value="">${esc(placeholder)}</option>`]
    .concat(options.map(o => {
      const v = typeof o === 'string' ? o : o.value
      const l = typeof o === 'string' ? o : o.label
      return `<option value="${esc(v)}"${value === v ? ' selected' : ''}>${esc(l)}</option>`
    }))
    .join('')
  return `<select class="select ${cls || ''}" ${attrs}>${opts}</select>`
}

// ── splash (Lab.tsx Splash) ──────────────────────────────────────────────────
function splashHTML() {
  return `<div class="screen splash">
    <p class="mono splash-kicker">Synthetic training paper</p>
    <h1 class="nameplate splash-nameplate">THE VULN BULLETIN</h1>
    <p class="mono splash-note">Warming up the presses…</p>
  </div>`
}

// ── mode select (ModeSelect.tsx) ─────────────────────────────────────────────
function modeSelectHTML() {
  return `<div class="screen">
    <div class="wrap wrap-5xl">
      <div class="fade-in">
        <p class="mono nameplate-kicker">Synthetic training paper · Meridian Logistics (fictional)</p>
        <h1 class="nameplate">${esc(LAB_NAME)}</h1>
        <p class="nameplate-tag">The vulnerability management reporting desk of a mid-size logistics company — built from
          <span class="tag-strong"> CompTIA CySA+ CS0-003, Lesson 7.1: Explaining Effective Communication Concepts</span>.</p>
      </div>

      <div class="mode-grid">
        <section class="mode-card" aria-labelledby="mode-medium">
          <div class="mode-card-head">
            <p class="mono mode-card-kicker mode-kicker-morning">${icon('sun', 's4')} Morning Edition</p>
            <h2 class="mode-card-title" id="mode-medium">The Guided Desk</h2>
          </div>
          <div class="mode-card-body">
            <p><strong>12 assignments, in order.</strong> Each is one learning bite with a pointer to the right desk, up to three tiered hints, and forgiving checks that accept equivalent forms.</p>
            <p><strong>Educational tone:</strong> wrong answers produce teaching feedback — never a penalty beyond your star rating. Quiz after practice. First week on the job? Work this edition.</p>
            <p class="mono mode-card-bloom">${icon('graduation-cap', 's4')} Understand · Apply — Bloom’s first two rungs</p>
          </div>
          <div class="mode-card-foot">
            <button class="btn btn-cta" data-action="set-mode" data-mode="medium">Take the morning desk →</button>
          </div>
        </section>

        <section class="mode-card mode-card--hard" aria-labelledby="mode-hard">
          <div class="mode-card-head mode-card-head--hard">
            <p class="mono mode-card-kicker mode-kicker-night">${icon('moon-star', 's4')} Night Edition</p>
            <h2 class="mode-card-title mode-title-hard" id="mode-hard">The Field Desk</h2>
          </div>
          <div class="mode-card-body mode-body-hard">
            <p><strong>10 deep assignments, free-roam.</strong> The wire is noisy: red herrings, mitigated-forever stories, stale data and decoy procedures. Strict checks — exact values, exact order, near-misses rejected with a rationale.</p>
            <p><strong>No pointers.</strong> Hints disabled by default; one optional nudge that visibly costs score. The quiz demands analysis and justification. Exam week? Survive this edition.</p>
            <p class="mono mode-card-bloom mode-bloom-hard">${icon('shield-alert', 's4')} Analyze · Evaluate · Create — Bloom’s upper rungs</p>
          </div>
          <div class="mode-card-foot mode-foot-hard">
            <button class="btn btn-cta btn-cta-hard" data-action="set-mode" data-mode="hard">Work the night desk →</button>
          </div>
        </section>
      </div>

      <p class="mono mode-disclaimer">100% simulated · no real data · defensive education only</p>
    </div>
  </div>`
}

// ── briefing (Briefing.tsx) ──────────────────────────────────────────────────
function briefingHTML(state) {
  const modeCallout = state.mode === 'medium'
    ? `<p class="mode-callout mode-callout-medium">You are on the <strong>Morning Edition</strong>: your assignment slate lists twelve tasks in order, with hints on tap and pointers to the right desk. Follow the slate; check each task when you believe it is done.</p>`
    : `<p class="mode-callout mode-callout-hard">You are on the <strong>Night Edition</strong>: ten deep assignments, no pointers, a noisy wire with red herrings and decoy procedures. Strict checks. One nudge allowed — it costs score. Read everything before you act.</p>`
  return `<div class="screen" role="article" aria-label="Scenario briefing">
    <div class="wrap wrap-3xl fade-in">
      <div class="memo">
        <div class="memo-topbar">
          <p class="mono memo-top-label">Internal memo · Meridian Logistics (fictional)</p>
          <p class="mono memo-top-day">Program Day 1</p>
        </div>
        <div class="memo-body">
          <p class="mono memo-from">From: the Editor-in-Chief (CISO) · To: you, security analyst · Re: standing up vulnerability management reporting</p>
          <p>Welcome to the <strong>Program Office Desk</strong>. Last quarter’s external audit went badly — not because we lacked findings, but because nobody could say <em>who was informed, when, or what happened next</em>. Our reporting was a pile of scanner exports nobody read.</p>
          <p>As of today you own the desk. The wire — our vulnerability scanner — is filing stories right now: nine of them, ranging from an actively exploited critical to stale entries nobody has verified in months.</p>
          <p>Your job, in the paper’s own terms: <strong>assess the wire</strong> (severity, likelihood, impact), <strong>route the right content to the right desk</strong> (six stakeholder audiences), <strong>set edition deadlines</strong> (remediation SLAs), <strong>run the press schedule</strong> (the communication plan), and <strong>chair the editorial board</strong> (the quarterly control review). The board meets in thirty days; your first monthly brief is due before then.</p>
          ${modeCallout}
          <p class="mono memo-ps">P.S. — everything on this desk is synthetic training data. The CVE identifiers and CVSS scores are real NVD records; Meridian Logistics, its people and its incidents are fiction. — E.</p>
        </div>
        <div class="memo-foot">
          <p class="mono memo-foot-note">${icon('feather', 's4')} CySA+ Domain 5.1 — effective communication concepts</p>
          <button class="btn btn-cta memo-enter" data-action="enter-desk">Enter the newsroom →</button>
        </div>
      </div>
    </div>
  </div>`
}

// ── masthead (Masthead.tsx) ──────────────────────────────────────────────────
function mastheadHTML(state) {
  const objs = state.mode ? OBJECTIVES_BY_MODE(state.mode) : []
  const passed = objs.filter(o => state.checks[o.id] && state.checks[o.id].passed).length
  const pct = objs.length ? Math.round((passed / objs.length) * 100) : 0
  return `<header class="masthead">
    <div class="masthead-inner">
      <div class="nameplate-block">
        <div class="nameplate-row">
          ${icon('radio', 's4 nameplate-radio')}
          <h1 class="masthead-title">${esc(LAB_NAME)}</h1>
          ${state.mode ? `<span class="mono edition-chip">${state.mode === 'medium' ? 'Morning Edition' : 'Night Edition'}</span>` : ''}
        </div>
        <p class="mono masthead-sub">${esc(LAB_SUB)}</p>
      </div>

      <div class="progress-block" data-progress aria-label="Objectives passed: ${passed} of ${objs.length}">
        <div class="mono progress-labels"><span>Edition progress</span><span data-progress-count>${passed}/${objs.length}</span></div>
        <div class="progress-track"><div class="progress-fill" data-progress-fill style="width:${pct}%"></div></div>
      </div>

      <div class="masthead-actions">
        <button class="btn btn-sm" data-action="open-stylebook" aria-label="Open the stylebook (glossary)">${icon('book-open', 's35')} Stylebook</button>
        <button class="btn btn-sm btn-reset" data-action="open-reset" aria-label="Reset the lab to its pristine state">${icon('rotate-ccw', 's35')} Reset</button>
      </div>
    </div>

    <div class="ticker" data-ticker-wrap aria-live="polite" aria-atomic="true">
      <p class="ticker-line" data-ticker><span class="ticker-tag">WIRE</span>${esc(state.lastEvent)}</p>
    </div>
  </header>`
}

// ── desk navigation (Lab.tsx rail + mobile chips) ────────────────────────────
const SECTIONS = [
  { id: 'front', label: 'Front Page', icon: 'newspaper' },
  { id: 'newsroom', label: 'Newsroom', icon: 'rss' },
  { id: 'compose', label: 'Compose Room', icon: 'pen-tool' },
  { id: 'press', label: 'Press Room', icon: 'calendar-clock' },
  { id: 'board', label: 'Board Room', icon: 'landmark' },
  { id: 'quiz', label: 'Standards Quiz', icon: 'graduation-cap' },
  { id: 'retro', label: 'Retrospective', icon: 'archive' },
]

function sectionLocks(state) {
  const mode = state.mode
  if (!mode) return {}
  const objs = OBJECTIVES_BY_MODE(mode)
  const passed = objs.filter(o => state.checks[o.id] && state.checks[o.id].passed).length
  const allPassed = passed === objs.length
  return {
    front: false, newsroom: false, compose: false, press: false, board: false,
    quiz: !allPassed,
    retro: !state.quizDone,
  }
}

function mobileNavHTML(state) {
  const locked = sectionLocks(state)
  return `<nav aria-label="Lab sections" class="mobile-nav">
    <div class="mobile-chips" role="tablist" aria-orientation="horizontal">
      ${SECTIONS.map(s => `
        <button role="tab" aria-selected="${state.section === s.id}" data-action="set-section" data-section="${s.id}"
          data-nav="${s.id}" class="chip-tab ${state.section === s.id ? 'chip-tab-active' : ''} ${locked[s.id] ? 'is-locked' : ''}"
          ${locked[s.id] ? 'disabled' : ''}>
          ${icon(s.icon, 's35')} ${s.label}${locked[s.id] ? icon('lock', 's3') : ''}
        </button>`).join('')}
    </div>
  </nav>`
}

function railHTML(state) {
  const locked = sectionLocks(state)
  return `<aside class="rail">
    <div class="rail-sticky">
      <p class="mono rail-label">Desks</p>
      <ul class="rail-list" role="tablist" aria-orientation="vertical">
        ${SECTIONS.map(s => `
          <li>
            <button role="tab" aria-selected="${state.section === s.id}" data-action="set-section" data-section="${s.id}"
              data-nav="${s.id}" class="rail-btn ${state.section === s.id ? 'rail-btn-active' : ''} ${locked[s.id] ? 'is-locked' : ''}"
              ${locked[s.id] ? 'disabled' : ''}>
              ${icon(s.icon, 's4 rail-ic')}<span class="rail-label-txt">${s.label}</span>${locked[s.id] ? icon('lock', 's3') : ''}
            </button>
          </li>`).join('')}
      </ul>
      <div class="rail-note">
        <p class="mono">Synthetic training environment. Fictional org; real CVE/CVSS reference data; defensive education only.</p>
      </div>
    </div>
  </aside>`
}

// ── assignment slate (Slate.tsx) ─────────────────────────────────────────────
function slateRailHeaderHTML(state) {
  const objs = OBJECTIVES_BY_MODE(state.mode)
  const passed = objs.filter(o => state.checks[o.id] && state.checks[o.id].passed).length
  return `<div class="slate-rail-header">
    <p class="mono slate-rail-title">Assignment slate</p>
    <p class="mono slate-rail-sub">${passed}/${objs.length} passed · ${state.mode === 'medium' ? 'morning desk' : 'field desk'}</p>
  </div>`
}

function slateItemHTML(o, index, state, compact) {
  const result = state.checks[o.id]
  const passed = !!(result && result.passed)
  const currentId = (OBJECTIVES_BY_MODE(state.mode).find(x => !(state.checks[x.id] && state.checks[x.id].passed)) || {}).id
  const isCurrent = o.id === currentId
  const hintLevel = state.hintLevel[o.id] || 0
  const hintMax = state.mode === 'medium' ? 3 : 1
  const hintsLeft = hintMax - hintLevel
  const hintsHTML = hintLevel > 0 ? `
    <div class="hint-box">
      ${o.hints.slice(0, hintLevel).map(h => `<p class="hint-line">${icon('lightbulb', 's3')}${esc(h)}</p>`).join('')}
    </div>` : ''
  const feedbackHTML = result && result.attempts > 0 ? `
    <p role="status" class="slate-feedback ${passed ? 'feedback-ok' : 'feedback-fail'}">${esc(passed ? o.passMsg : o.failMsg)}</p>` : ''
  const actionsHTML = `
    <div class="slate-actions">
      ${!passed ? `<button class="btn btn-ink" data-action="check-obj" data-obj="${o.id}" data-fk="check-${o.id}" aria-label="Check ${o.id}">Check results</button>` : ''}
      ${passed ? `<span class="mono passed-line">passed${result.firstTry ? ' · first try' : ''}${result.hintsUsed > 0 ? ` · ${result.hintsUsed} hint${result.hintsUsed > 1 ? 's' : ''}` : ''}</span>` : ''}
      ${!passed && hintsLeft > 0 && state.mode ? `<button class="btn btn-wire" data-action="hint" data-obj="${o.id}" data-fk="hint-${o.id}" aria-label="Reveal hint for ${o.id} (${hintsLeft} left)">${icon('lightbulb', 's3')} ${state.mode === 'medium' ? `Hint (${hintsLeft} left)` : 'Nudge (−score)'}</button>` : ''}
      ${!passed && isCurrent && !compact ? `<button class="btn btn-wire" data-action="set-section" data-section="${o.section}" data-fk="go-${o.id}">${icon('arrow-right', 's3')} Go to desk</button>` : ''}
    </div>`
  return `<li class="slate-item ${passed ? 'slate-item-passed' : isCurrent ? 'slate-item-current' : ''}">
    <div class="slate-item-inner">
      <span class="slate-num ${passed ? 'slate-num-passed' : ''}" aria-hidden>${passed ? icon('check', 's35') : index + 1}</span>
      <div class="slate-item-body">
        <div class="slate-tags">
          <span class="mono slate-id">${esc(o.id.replace('OBJ-', ''))}</span>
          ${pillarBadge(o.pillar)}
          ${isCurrent && !passed ? '<span class="nextup-tag">next up</span>' : ''}
          ${result && result.attempts > 0 && !passed ? `<span class="mono failed-count">${result.attempts} failed check${result.attempts > 1 ? 's' : ''}</span>` : ''}
        </div>
        <p class="slate-title">${esc(o.title)}</p>
        <p class="mono slate-anchor">covers: ${esc(o.anchor)}</p>
        ${hintsHTML}
        ${feedbackHTML}
        ${actionsHTML}
      </div>
    </div>
  </li>`
}

function slateListHTML(state, compact) {
  const objs = OBJECTIVES_BY_MODE(state.mode)
  return `<ol class="slate-list-root" aria-label="Assignment slate">
    ${objs.map((o, i) => slateItemHTML(o, i, state, compact)).join('')}
  </ol>`
}

// ── front page (FrontPage.tsx) ───────────────────────────────────────────────
const CYCLE_STEPS = [
  { id: 'identify', label: 'Identify', def: 'Collect findings: scans, advisories, pen tests.' },
  { id: 'assess', label: 'Assess', def: 'Rate likelihood × impact; score and prioritize.' },
  { id: 'communicate', label: 'Communicate', def: 'Report to the right audiences, on plan, with timelines.' },
  { id: 'review', label: 'Review & improve', def: 'Verify controls, implement updates, close the loop.' },
]

function frontPageHTML(state) {
  const mode = state.mode
  const cycleOrder = state.cycleOrder
  const m1 = state.checks['OBJ-M1']
  const done = !!(m1 && m1.passed)
  const modeObjs = mode ? OBJECTIVES_BY_MODE(mode) : []
  const current = modeObjs.find(o => !(state.checks[o.id] && state.checks[o.id].passed))

  const cycleWidget = mode === 'medium' ? `
    <div class="m1-block">
      <p class="assign-label">Assignment OBJ-M1 · Put the cycle in order</p>
      <p class="m1-hint-text">Click the four activities in the order the lesson teaches them.</p>
      <ol class="cycle-grid" aria-label="Your ordering of the four cycle steps">
        ${[0, 1, 2, 3].map(i => {
          const step = CYCLE_STEPS.find(s => s.id === cycleOrder[i])
          return `<li class="cycle-slot ${step ? 'cycle-slot-filled' : ''}">
            <span class="mono cycle-step-label">Step ${i + 1}</span>
            ${step
              ? `<span class="cycle-step-label-txt">${esc(step.label)}</span><span class="cycle-step-def">${esc(step.def)}</span>`
              : '<span class="cycle-empty">— empty —</span>'}
          </li>`
        }).join('')}
      </ol>
      <div class="chip-row">
        ${CYCLE_STEPS.filter(s => !cycleOrder.includes(s.id)).map(s =>
          `<button class="btn btn-wire" data-action="cycle-pick" data-step="${s.id}" data-fk="cycle-${s.id}">+ ${s.label}</button>`).join('')}
        <button class="btn btn-wire" data-action="cycle-clear" data-fk="cycle-clear" aria-label="Clear the ordering">${icon('rotate-ccw', 's3')} Clear</button>
        ${!done ? `<button class="btn btn-ink" data-action="check-obj" data-obj="OBJ-M1" data-fk="check-OBJ-M1" aria-label="Check assignment OBJ-M1">Check OBJ-M1</button>` : ''}
      </div>
      ${m1 ? `
        <p role="status" class="m1-feedback ${m1.passed ? 'feedback-ok' : 'feedback-fail'}">
          ${m1.passed
            ? 'Identify → Assess → Communicate → Review & improve. Every report is one rotation of this wheel.'
            : 'Not the lesson’s order yet. The scanner identifies; the desk assesses; the paper communicates; the board reviews.'}
        </p>` : ''}
      ${!(m1 && m1.passed) && cycleOrderCorrect(state) ? '<p class="looks-right">Looks right — hit Check to lock it in.</p>' : ''}
    </div>` : ''

  return `<section aria-label="Front page — knowledge core" class="front-grid">
    <article class="article">
      ${sectionHead('Front page · the explainer', 'Vulnerability management reporting, in the paper’s own terms', 'CySA+ CS0-003 · 5.1')}
      <div class="prose-serif">
        <p><strong>Vulnerability management reporting</strong> is the discipline of ${term('Vulnerability management', 'identifying, assessing and communicating')} the risks in an organization’s systems — so they can be remediated before a threat exploits them. A newsroom mapping: the wire files stories (identify), the desk weighs them (assess), and the paper publishes to its readers (communicate). A fourth activity closes the loop: <strong>regular review</strong> of the paper itself — and updated measures in response to what the review finds.</p>
        <p>Why does the ${term('Communication plan')} matter as much as the patching? Because an unreported critical is an unremediated critical. Leadership funds what it understands; engineers fix what is precisely assigned with a deadline; employees act on what is plainly explained. Every audience is a different printing plate.</p>

        <h3 class="h3-rule">Where it sits in the defensive program</h3>
        <p>In the defensive lifecycle, reporting is the <em>press room between detection and governance</em>: scanning feeds it (see <a class="ext-link" href="https://attack.mitre.org/mitigations/M1016/" target="_blank" rel="noreferrer">MITRE ATT&amp;CK M1016 — Vulnerability Scanning</a>), and its output drives remediation (<a class="ext-link" href="https://attack.mitre.org/mitigations/M1051/" target="_blank" rel="noreferrer">M1051 — Update Software</a>), training (<a class="ext-link" href="https://attack.mitre.org/mitigations/M1017/" target="_blank" rel="noreferrer">M1017 — User Training</a>) and control reviews. It is the CySA+’s Domain 5 skill: turning technical signal into stakeholder action.</p>

        <h3 class="h3-rule">When the press room fails — three public cases</h3>
        <div class="case-grid">
          ${REAL_CASES.map(c => `
            <div class="case-card">
              <p class="mono case-kicker">Case file</p>
              <p class="case-name">${esc(c.name)}</p>
              <p class="case-text">${esc(c.text)}</p>
            </div>`).join('')}
        </div>

        <h3 class="h3-rule">Variants &amp; pivots you will use today</h3>
        <ul class="list-disc">
          <li><strong>Scheduled vs ad hoc:</strong> the monthly brief vs the ${term('Escalation path')} that outruns every calendar.</li>
          <li><strong>Exec vs technical:</strong> ${term('Executive summary')}s carry impact and decisions; ops briefs carry hosts and KBs. Wrong plate, wasted ink.</li>
          <li><strong>Quant vs qual:</strong> numbers (${term('Quantitative metric', 'CVSS, MTTR, coverage')}) for rigor; judgments (${term('Qualitative metric', 'high, very likely')}) for meaning.</li>
          <li><strong>${term('Data freshness')}:</strong> a 214-day-old scan is not intelligence — it is rumor. Verify, then publish.</li>
        </ul>
      </div>
      ${cycleWidget}
    </article>

    <aside class="front-aside">
      <div class="aside-card">
        <h3 class="aside-h">How this desk works</h3>
        <ol class="how-list">
          <li><span class="how-num">1.</span> Work your assignment slate (right rail / bottom sheet): it names the desk to visit.</li>
          <li><span class="how-num">2.</span> Manipulate the environment — route copy, set deadlines, schedule the press.</li>
          <li><span class="how-num">3.</span> Hit <span class="mono how-mono">CHECK</span> on the slate; every check explains itself.</li>
          <li><span class="how-num">4.</span> When the slate is full: Standards Quiz → Retrospective → final edition.</li>
        </ol>
        <p class="how-note">Progress auto-saves to this browser. The masthead Reset restores the pristine desk.</p>
      </div>
      ${current ? `
        <div class="nextup-card">
          <p class="mono nextup-kicker">Next up</p>
          <p class="nextup-title">${esc(current.id.replace('OBJ-', ''))} — ${esc(current.title)}</p>
          <button class="btn btn-ink nextup-btn" data-action="set-section" data-section="${current.section}">Go to desk ${icon('arrow-right', 's35')}</button>
        </div>` : ''}
    </aside>
  </section>`
}

// ── newsroom (Newsroom.tsx) ──────────────────────────────────────────────────
const LIKELIHOODS = ['Unlikely', 'Possible', 'Likely', 'Very likely']
const IMPACTS = ['Minor', 'Moderate', 'Major', 'Severe']
const SEVERITIES = ['Low', 'Medium', 'High', 'Critical']

function wireCardHTML(st, state, isHard) {
  const open = state.openStory === st.id
  const triage = state.triage[st.id]
  const flagOn = state.staleFlags.includes(st.id)
  const inQueue = state.queue.includes(st.id)
  const triagePanel = st.id === 'W-01' ? `
    <div class="triage-panel">
      <p class="assign-label">Assignment OBJ-M2 · classify this story</p>
      <div class="triage-grid">
        ${selectHTML({ value: (triage && triage.severity) || '', options: SEVERITIES, placeholder: '— select —', attrs: `data-action="set-triage" data-field="severity" data-fk="triage-severity" aria-label="W-01 Severity"` })}
        ${selectHTML({ value: (triage && triage.likelihood) || '', options: LIKELIHOODS, placeholder: '— select —', attrs: `data-action="set-triage" data-field="likelihood" data-fk="triage-likelihood" aria-label="W-01 Likelihood"` })}
        ${selectHTML({ value: (triage && triage.impact) || '', options: IMPACTS, placeholder: '— select —', attrs: `data-action="set-triage" data-field="impact" data-fk="triage-impact" aria-label="W-01 Impact"` })}
      </div>
      <p class="triage-note">Then hit CHECK on the slate. Likelihood asks: how probable is an attempt? Impact asks: what does it cost the business?</p>
    </div>` : ''
  return `<article class="wire-card ${open ? 'wire-card-open' : ''}">
    <button class="wire-head" data-action="open-story" data-story="${st.id}" data-fk="wire-${st.id}" aria-expanded="${open}">
      <span class="mono wire-id">${st.id}</span>
      <span class="wire-headline">${esc(st.headline)}</span>
      ${st.cve ? `<span class="mono wire-cve">${esc(st.cve)}</span>` : ''}
      <span class="mono wire-cvss">CVSS ${st.cvss.toFixed(1)}</span>
      ${severityBadge(st.severity)}
      ${st.lastScannedDays > 90 ? `<span class="mono age-chip">${icon('triangle-alert', 's3')} ${st.lastScannedDays}d old</span>` : ''}
      ${st.unverified ? '<span class="mono unverified-chip">unverified</span>' : ''}
      ${inQueue ? '<span class="mono inqueue-chip">in queue</span>' : ''}
    </button>
    ${open ? `
      <div class="wire-body">
        <div class="wire-facts">
          <p><span class="mono fact-label">System</span> · ${esc(st.system)}</p>
          <p><span class="mono fact-label">Exposure</span> · ${esc(st.exposure)}</p>
          <p><span class="mono fact-label">Status</span> · ${esc(st.status)}</p>
          <p><span class="mono fact-label">Last scanned</span> · ${st.lastScannedDays} days ago</p>
        </div>
        <p class="wire-detail">${esc(st.detail)}</p>
        ${triagePanel}
        <div class="chip-row">
          <button class="btn btn-wire stale-btn ${flagOn ? 'stale-btn-on' : ''}" data-action="toggle-stale" data-story="${st.id}" data-fk="stale-${st.id}" aria-pressed="${flagOn}">
            ${icon('flag', 's35')} ${flagOn ? 'Flagged stale (tap to unflag)' : 'Flag stale data'}
          </button>
          ${isHard ? `
            <button class="btn btn-wire" data-action="add-queue" data-story="${st.id}" data-fk="queue-${st.id}"
              ${inQueue || state.queue.length >= 3 ? 'disabled' : ''}>+ Add to remediation queue</button>` : ''}
        </div>
        ${isHard ? '<p class="fielddesk-note">Field desk: the queue (top of page) takes exactly three stories, in action order. Flag stale data where you find it — the audit orders the rescans.</p>' : ''}
      </div>` : ''}
  </article>`
}

function queueBuilderHTML(state) {
  return `<div class="panel panel-bordered">
    <p class="assign-label">Assignment OBJ-H1 · remediation queue</p>
    <p class="panel-sub">Exactly three stories, in the order ops must action them. Click a story on the wire to add it here.</p>
    <ol class="queue-list">
      ${[0, 1, 2].map(i => {
        const id = state.queue[i]
        const story = STORIES.find(s => s.id === id)
        return `<li class="queue-row">
          <span class="mono queue-num">#${i + 1}</span>
          ${story ? `
            <span class="queue-story">${story.id} — ${esc(story.headline)}</span>
            <button class="icon-btn" data-action="move-queue" data-story="${story.id}" data-dir="-1" data-fk="qu-${story.id}" aria-label="Move ${story.id} up" ${i === 0 ? 'disabled' : ''}>${icon('chevron-up', 's4')}</button>
            <button class="icon-btn" data-action="move-queue" data-story="${story.id}" data-dir="1" data-fk="qd-${story.id}" aria-label="Move ${story.id} down" ${i === state.queue.length - 1 ? 'disabled' : ''}>${icon('chevron-down', 's4')}</button>
            <button class="icon-btn icon-btn-danger" data-action="remove-queue" data-story="${story.id}" data-fk="qx-${story.id}" aria-label="Remove ${story.id} from queue">${icon('x', 's4')}</button>`
          : '<span class="slot-empty">— empty slot —</span>'}
        </li>`
      }).join('')}
    </ol>
    <p class="mono justify-label">Justify the #1 (pick exactly two):</p>
    <div class="chip-row reason-chips">
      ${QUEUE_REASONS.map(r => `
        <button class="btn btn-wire chip-toggle ${state.queueReasons.includes(r.id) ? 'chip-on-lime' : ''}"
          data-action="toggle-reason" data-reason="${r.id}" data-fk="qr-${r.id}" aria-pressed="${state.queueReasons.includes(r.id)}">${esc(r.label)}</button>`).join('')}
    </div>
  </div>`
}

function rescanOrderHTML(state) {
  const flags = state.staleFlags
  const order = state.staleOrder
  const clickStale = id => !order.includes(id)
  return `<div class="panel panel-bordered">
    <p class="assign-label">Assignment OBJ-H9 · freshness audit</p>
    <p class="panel-sub">1) Open wire stories and flag every freshness-defective one with the flag button.
      2) Below, click your flagged stories in re-scan priority order (most at-risk unknown first).</p>
    <div class="chip-row rescan-chips">
      ${icon('scan-search', 's4 rescan-ic')}
      ${flags.length === 0 ? '<span class="slot-empty">Flag stories on the wire first.</span>' : ''}
      ${flags.map(f => `
        <button class="btn btn-wire ${order.includes(f) ? 'rescan-btn-placed' : ''}" data-action="click-stale" data-story="${f}"
          data-fk="rs-${f}" ${order.includes(f) ? 'disabled' : ''}>${order.includes(f) ? `${order.indexOf(f) + 1}. ` : ''}${f}</button>`).join('')}
    </div>
    <ol class="rescan-grid" aria-label="Re-scan priority order">
      ${[0, 1, 2].map(i => {
        const st = STORIES.find(s => s.id === order[i])
        return `<li class="rescan-slot">
          <span class="mono rescan-slot-label">Rescan #${i + 1}</span>
          <p class="rescan-slot-title">${st ? `${st.id} — ${st.severity}` : '— empty —'}</p>
          ${st ? `<p class="rescan-slot-meta">${st.lastScannedDays}d old · ${esc(st.exposure)}</p>` : ''}
        </li>`
      }).join('')}
    </ol>
    ${order.length > 0 ? '<button class="btn btn-wire rescan-clear" data-action="clear-order">Clear order</button>' : ''}
  </div>`
}

function riskRegisterHTML(state) {
  const register = state.register
  const filled = Object.keys(register).length === 5
  return `<div>
    <p class="assign-label">Assignment OBJ-H5 · risk register banding</p>
    <p class="panel-sub">Place each risk in its band. Read exposure, exploitability and unknowns.</p>
    <div class="register-grid">
      <div class="risk-col">
        ${RISK_ITEMS.map(r => `
          <div class="risk-card">
            <p class="risk-card-id">${r.id}</p>
            <p class="risk-card-text">${esc(r.label)}</p>
            ${selectHTML({ value: register[r.id] || '', options: RISK_BANDS, placeholder: '— band —', attrs: `data-action="set-register" data-risk="${r.id}" data-fk="reg-${r.id}" aria-label="Band for ${r.id}"` })}
          </div>`).join('')}
      </div>
      <div class="band-grid">
        ${RISK_BANDS.map(b => `
          <div class="band-box">
            <p class="mono ${b === 'Critical' ? 'band-critical' : b === 'High' ? 'band-high' : 'band-plain'}">${b}</p>
            <ul class="band-list">
              ${RISK_ITEMS.filter(r => register[r.id] === b).map(r => `<li class="band-item">${r.id}</li>`).join('')}
            </ul>
          </div>`).join('')}
      </div>
    </div>
    ${filled ? teachingNote('Register looks filled — run CHECK on the slate to validate the banding.') : ''}
  </div>`
}

function newsroomHTML(state) {
  const mode = state.mode
  const isHard = mode === 'hard'
  const modeObjs = OBJECTIVES_BY_MODE(mode || 'medium')
  const active = id => modeObjs.some(o => o.id === id)
  return `<section aria-label="Newsroom — the scanner wire" class="stack-6">
    ${sectionHead('Newsroom · the wire', 'Incoming stories from the vulnerability scanner', `${STORIES.length} stories on the wire`)}
    ${active('OBJ-H1') ? queueBuilderHTML(state) : ''}
    <div class="stack-3">
      ${STORIES.map(st => wireCardHTML(st, state, isHard)).join('')}
    </div>
    ${active('OBJ-H9') ? rescanOrderHTML(state) : ''}
    ${active('OBJ-H5') ? `<div class="panel">${riskRegisterHTML(state)}</div>` : ''}
  </section>`
}

// ── compose room (ComposeRoom.tsx) ───────────────────────────────────────────
function routingDeskHTML(state) {
  return `<div class="panel">
    <p class="assign-label">Assignment OBJ-M3 · route all 10 content cards</p>
    <p class="panel-sub">Each card carries one piece of the monthly report. Send it to the desk that needs it — check each stakeholder’s “needs / avoids” line.</p>
    <div class="stack-2">
      ${CONTENT_CARDS.map(c => {
        const assigned = state.cardAssign[c.id] || ''
        const st = STAKEHOLDERS.find(s => s.id === assigned)
        return `<div class="routing-row">
          <span class="mono routing-id">${c.id}</span>
          <span class="routing-label">${esc(c.label)}</span>
          ${selectHTML({ value: assigned, options: STAKEHOLDERS.map(s => ({ value: s.id, label: s.name })), placeholder: '— route to desk —', attrs: `data-action="set-card" data-card="${c.id}" data-fk="card-${c.id}" aria-label="Route ${c.id}"`, cls: 'route-select' })}
          ${st ? '<span class="route-check" aria-hidden>✔</span>' : ''}
        </div>`
      }).join('')}
    </div>
    <div class="stake-grid">
      ${STAKEHOLDERS.map(s => `
        <div class="stake-card">
          <p class="stake-name">${esc(s.name)}</p>
          <p class="stake-needs">Needs: ${s.needs.map(esc).join('; ')}</p>
          <p class="stake-avoids">Avoids: ${esc(s.avoids)}</p>
        </div>`).join('')}
    </div>
  </div>`
}

function execBriefHTML(state, hard) {
  return `<div class="panel">
    <p class="assign-label">${hard ? 'Capstone input · the one-page executive brief' : 'Assignment OBJ-M4 · the one-page executive brief'}</p>
    <p class="panel-sub">Pick exactly the three items leadership needs. The page holds three — no more.</p>
    <div class="chip-row">
      ${EXEC_POOL.map(id => {
        const card = CONTENT_CARDS.find(c => c.id === id)
        const on = state.execCards.includes(id)
        return `<button class="btn btn-wire chip-toggle ${on ? 'chip-on-red' : ''}" data-action="toggle-exec" data-card="${id}" data-fk="exec-${id}" aria-pressed="${on}">
          <span class="mono chip-id">${id}</span>${esc(card.label)}</button>`
      }).join('')}
    </div>
    <p class="mono counter">Selected: ${state.execCards.length}/3</p>
  </div>`
}

function metricsSorterHTML(state) {
  const placed = [...state.metricSort.quantitative, ...state.metricSort.qualitative]
  return `<div class="panel">
    <p class="assign-label">Assignment OBJ-M5 · sort the metrics</p>
    <p class="panel-sub">Numbers are quantitative; judgments are qualitative. Sort all eight.</p>
    <div class="stack-15">
      ${METRIC_CHIPS.map(m => {
        const bin = state.metricSort.quantitative.includes(m.id) ? 'Quant' : state.metricSort.qualitative.includes(m.id) ? 'Qual' : null
        return `<div class="metric-row">
          <span class="mono ${bin === 'Quant' ? 'bin-quant' : bin === 'Qual' ? 'bin-qual' : 'bin-none'}">${bin || 'unsorted'}</span>
          <span class="metric-label">${esc(m.label)}</span>
          <div class="bin-btns">
            <button class="btn btn-wire bin-btn" data-action="set-metric-bin" data-chip="${m.id}" data-bin="quantitative" data-fk="mq-${m.id}" aria-label='Sort "${esc(m.label)}" as quantitative'>Quant</button>
            <button class="btn btn-wire bin-btn" data-action="set-metric-bin" data-chip="${m.id}" data-bin="qualitative" data-fk="ml-${m.id}" aria-label='Sort "${esc(m.label)}" as qualitative'>Qual</button>
            <button class="btn btn-wire bin-btn" data-action="clear-metric" data-chip="${m.id}" data-fk="mc-${m.id}" aria-label='Clear sorting for "${esc(m.label)}"'>✕</button>
          </div>
        </div>`
      }).join('')}
    </div>
    <p class="mono counter">Sorted: ${placed.length}/8</p>
  </div>`
}

function reportTypeMatchHTML(state) {
  return `<div class="panel">
    <p class="assign-label">Assignment OBJ-M7 · name that report</p>
    <p class="panel-sub">Four purposes, four canonical report types. Match them.</p>
    <div class="stack-2">
      ${REPORT_PURPOSES.map(p => `
        <div class="routing-row">
          <span class="routing-label">“${esc(p.text)}”</span>
          ${selectHTML({ value: state.reportTypeMatch[p.id] || '', options: REPORT_TYPES.map(r => ({ value: r.id, label: r.name })), placeholder: '— report type —', attrs: `data-action="set-report-type" data-purpose="${p.id}" data-fk="rt-${p.id}" aria-label="Report type for: ${esc(p.text)}"`, cls: 'report-select' })}
        </div>`).join('')}
    </div>
  </div>`
}

function critiqueDeskHTML(state) {
  return `<div class="panel">
    <p class="assign-label">Assignment OBJ-H2 · audit the draft board report</p>
    <p class="panel-sub">A junior analyst filed this draft. Click the <strong>four defective sentences</strong> — click again to unmark. Sound copy must stay clean.</p>
    <div class="stack-1">
      ${CRITIQUE_SENTENCES.map((s, i) => {
        const marked = state.critique.includes(s.id)
        return `<button class="critique-btn ${marked ? 'critique-marked' : ''}" data-action="toggle-critique" data-sentence="${s.id}" data-fk="cr-${s.id}" aria-pressed="${marked}">
          <span class="mono critique-num">${String(i + 1).padStart(2, '0')}</span>${esc(s.text)}
          ${marked ? '<span class="mono critique-mark">marked</span>' : ''}
        </button>`
      }).join('')}
    </div>
    <p class="mono counter">Marked: ${state.critique.length} · target: exactly 4</p>
  </div>`
}

function capstoneHTML(state) {
  const status = capstoneStatus(state)
  const parts = [
    { key: 'exec', label: 'Executive brief (3 cards)', ok: status.execOk, where: 'the executive brief block above' },
    { key: 'sla', label: 'Remediation timeline (deadline board)', ok: status.slaOk, where: 'Press Room — deadline board' },
    { key: 'review', label: 'Review outcome (control updates)', ok: status.reviewOk, where: 'Board Room — control review' },
  ]
  const allOk = status.execOk && status.slaOk && status.reviewOk
  return `<div class="panel panel-bordered">
    <p class="assign-label">Assignment OBJ-H10 · capstone — publish the monthly package</p>
    <p class="panel-sub">Assemble the three parts (each is built at its own desk), then publish the edition.</p>
    <ul class="capstone-list">
      ${parts.map(p => `
        <li class="capstone-row">
          ${p.ok ? icon('check-circle-2', 's4 cap-ok') : icon('circle-dashed', 's4 cap-miss')}
          <span class="capstone-label">${esc(p.label)}</span>
          <span class="mono capstone-where">${p.ok ? 'ready' : `missing — ${esc(p.where)}`}</span>
        </li>`).join('')}
    </ul>
    <button class="btn btn-ink capstone-publish" data-action="publish-capstone" aria-label="Publish the monthly report package">Publish the edition</button>
    ${state.capstonePublished ? feedbackNote(allOk,
      allOk
        ? 'Edition published with all three parts correct. Run CHECK on the slate to close OBJ-H10.'
        : 'Published — but the slate check will fail until all three parts are correct. Fix the missing part, publish again.') : ''}
  </div>`
}

function composeRoomHTML(state) {
  const mode = state.mode
  const isHard = mode === 'hard'
  const modeObjs = OBJECTIVES_BY_MODE(mode || 'medium')
  const has = id => modeObjs.some(o => o.id === id)
  return `<section aria-label="Compose room — report production" class="stack-6">
    ${sectionHead('Compose room · plates & sections', 'Route the copy — every audience is a different printing plate', 'Stakeholders × content')}
    ${has('OBJ-M3') ? routingDeskHTML(state) : ''}
    ${(has('OBJ-M4') || isHard) ? execBriefHTML(state, isHard) : ''}
    ${has('OBJ-M5') ? metricsSorterHTML(state) : ''}
    ${has('OBJ-M7') ? reportTypeMatchHTML(state) : ''}
    ${has('OBJ-H2') ? critiqueDeskHTML(state) : ''}
    ${isHard ? capstoneHTML(state) : ''}
  </section>`
}

// ── press room (PressRoom.tsx) ───────────────────────────────────────────────
function deadlineBoardHTML(state) {
  return `<div class="panel">
    <p class="assign-label">Assignment OBJ-M6 · edition deadlines (remediation SLAs)</p>
    <p class="panel-sub">Set the committed remediation window per severity tier. Higher severity → shorter window. (Shown: an <strong>example internal policy</strong> — CySA+ tests the concept, not magic numbers. Simplified.)</p>
    <div class="stack-3">
      ${SEVERITY_TIERS.map(t => `
        <div class="tier-card">
          <div class="tier-head">
            <span class="tier-name">${esc(t.label)}</span>
            <span class="mono tier-band">${state.sla[t.id] ? `${state.sla[t.id]} days` : 'not set'} · band ${t.min}–${t.max}d</span>
          </div>
          <div class="chip-row" role="group" aria-label="Remediation window for ${t.id}">
            ${SLA_CHIPS.map(d => `
              <button class="btn btn-wire sla-chip ${state.sla[t.id] === d ? 'sla-chip-on' : ''}" data-action="set-sla" data-tier="${t.id}" data-days="${d}" data-fk="sla-${t.id}-${d}" aria-pressed="${state.sla[t.id] === d}">${d}</button>`).join('')}
          </div>
        </div>`).join('')}
    </div>
  </div>`
}

function planSelectHTML(label, value, options, attrs) {
  return `<label class="plan-field">
    <span class="mono plan-field-label">${esc(label)}</span>
    ${selectHTML({ value, options, placeholder: '— choose —', attrs })}
  </label>`
}

function commPlanHTML(state, hard) {
  const rows = hard ? COMMS : COMMS.filter(c => !c.hardOnly)
  return `<div class="panel">
    <p class="assign-label">${hard ? 'Assignment OBJ-H3 · full communication plan (5 rows)' : 'Assignment OBJ-M8 · the communication plan (4 rows)'}</p>
    <p class="panel-sub">Audience × cadence × method — including the ad-hoc emergency channel. ${hard ? 'Five rows today: the annual refresher joins the schedule.' : ''}</p>
    <div class="stack-3">
      ${rows.map(c => {
        const st = state.comms[c.id] || {}
        return `<div class="comm-card">
          <p class="comm-name">${esc(c.name)}</p>
          <div class="plan-grid">
            ${planSelectHTML('Audience', st.audience || '', AUDIENCES, `data-action="set-comm" data-comm="${c.id}" data-field="audience" data-fk="ca-${c.id}"`)}
            ${planSelectHTML('Cadence', st.cadence || '', CADENCES, `data-action="set-comm" data-comm="${c.id}" data-field="cadence" data-fk="cc-${c.id}"`)}
            ${planSelectHTML('Method', st.method || '', METHODS, `data-action="set-comm" data-comm="${c.id}" data-field="method" data-fk="cm-${c.id}"`)}
          </div>
        </div>`
      }).join('')}
    </div>
  </div>`
}

function milestonePlannerHTML(state) {
  const order = state.milestoneOrder
  const days = state.milestoneDays
  return `<div class="panel">
    <p class="assign-label">Assignment OBJ-H7 · W-01 milestone chain</p>
    <p class="panel-sub">Order the four milestones (click to add, arrows to reorder) and set each deadline — from containment to verified closure.</p>
    <div class="chip-row">
      ${MILESTONES.filter(m => !order.includes(m.id)).map(m =>
        `<button class="btn btn-wire chip-toggle" data-action="add-milestone" data-milestone="${m.id}" data-fk="ma-${m.id}">+ ${esc(m.label)}</button>`).join('')}
      ${order.length > 0 ? `<span class="mono placed-left">${4 - order.length} left to place</span>` : ''}
    </div>
    <ol class="stack-2 milestone-list">
      ${[0, 1, 2, 3].map(i => {
        const id = order[i]
        const m = MILESTONES.find(x => x.id === id)
        return `<li class="queue-row milestone-row">
          <span class="mono queue-num">${m && days[m.id] ? `Day ${days[m.id]}` : 'Day ?'}</span>
          ${m ? `
            <span class="milestone-label">${esc(m.label)}</span>
            ${selectHTML({ value: days[m.id] !== undefined && days[m.id] !== null ? String(days[m.id]) : '', options: MILESTONE_DAYS.map(d => ({ value: String(d), label: `day ${d}` })), placeholder: 'day ?', attrs: `data-action="set-milestone-day" data-milestone="${m.id}" data-fk="md-${m.id}" aria-label="Deadline for ${esc(m.label)}"`, cls: 'day-select' })}
            <button class="icon-btn" data-action="move-milestone" data-milestone="${m.id}" data-dir="-1" data-fk="mu-${m.id}" aria-label="Move milestone up" ${i === 0 ? 'disabled' : ''}>${icon('chevron-up', 's4')}</button>
            <button class="icon-btn" data-action="move-milestone" data-milestone="${m.id}" data-dir="1" data-fk="mn-${m.id}" aria-label="Move milestone down" ${i === order.length - 1 ? 'disabled' : ''}>${icon('chevron-down', 's4')}</button>
            <button class="icon-btn icon-btn-danger" data-action="remove-milestone" data-milestone="${m.id}" data-fk="mx-${m.id}" aria-label="Remove milestone">${icon('x', 's4')}</button>`
          : '<span class="slot-empty">— empty slot —</span>'}
        </li>`
      }).join('')}
    </ol>
  </div>`
}

function escalationDrillHTML(state) {
  const escalation = state.escalation
  return `<div class="panel panel-drill">
    <p class="assign-label">${icon('siren', 's4')} Assignment OBJ-H4 · flash drill — VPN zero-day, actively exploited</p>
    <div class="flash-box"><strong>FLASH 06:12 —</strong> Vendor advisory + CISA alert: zero-day RCE on our VPN appliance model, exploited in the wild. The appliance is internet-facing. The monthly brief is 26 days away. The plan’s escalation path is on the wall — execute it.</div>
    <p class="panel-sub">Click response actions in the order you would execute them. Wrong picks teach — but the drill grades the exact sequence of the three correct steps.</p>
    <div class="chip-row">
      ${ESCALATION_STEPS.filter(st => !escalation.includes(st.id)).map(st => `
        <button class="btn btn-wire chip-toggle step-btn ${st.decoy ? 'step-decoy' : ''}" data-action="add-escalation" data-step="${st.id}" data-fk="es-${st.id}">
          ${st.id === 'ES-1' ? icon('phone-call', 's35') : ''}${st.id === 'ES-3' ? icon('megaphone', 's35') : ''}${esc(st.label)}
        </button>`).join('')}
    </div>
    ${escalation.length > 0 ? `
      <ol class="executed-list" aria-label="Executed response sequence">
        ${escalation.map((id, i) => {
          const st = ESCALATION_STEPS.find(x => x.id === id)
          return `<li class="executed-row ${st.decoy ? 'executed-decoy' : ''}">
            <span class="mono executed-num">${i + 1}.</span>${esc(st.label)}
            ${st.decoy ? '<span class="mono executed-decoy-tag">decoy — during active exploitation, minutes matter; this can wait</span>' : ''}
          </li>`
        }).join('')}
      </ol>` : ''}
    <button class="btn btn-wire drill-restart" data-action="reset-escalation">Restart drill</button>
  </div>`
}

function pressRoomHTML(state) {
  const modeObjs = OBJECTIVES_BY_MODE(state.mode || 'medium')
  const has = id => modeObjs.some(o => o.id === id)
  return `<section aria-label="Press room — schedule and deadlines" class="stack-6">
    ${sectionHead('Press room · schedule & deadlines', 'The press schedule — risk on a calendar', 'Cadence · SLAs · escalation')}
    ${deadlineBoardHTML(state)}
    ${commPlanHTML(state, has('OBJ-H3'))}
    ${has('OBJ-H7') ? milestonePlannerHTML(state) : ''}
    ${has('OBJ-H4') ? escalationDrillHTML(state) : ''}
  </section>`
}

// ── board room (BoardRoom.tsx) ───────────────────────────────────────────────
function controlReviewHTML(state, hard) {
  const rows = hard ? CONTROLS : CONTROLS.filter(c => !c.hardOnly)
  const allClassified = rows.every(c => state.reviewClass[c.id])
  return `<div class="panel">
    <p class="assign-label">${icon('clipboard-check', 's4')} ${hard ? 'Assignment OBJ-H6 · full quarterly control review (5 controls + verification)' : 'Assignment OBJ-M10 · quarterly control review (4 controls)'}</p>
    <p class="panel-sub">The lesson’s management process: <strong>regular reviews of existing measures</strong> → verdict on the evidence → <strong>implementation of updated ones</strong>.
      ${hard ? ' Then verify the updates with a simulated re-run.' : ''}</p>
    <div class="stack-3">
      ${rows.map(c => {
        const verdict = state.reviewClass[c.id] || ''
        const needsUpdate = verdict === 'update'
        const isFail = c.verdict === 'update'
        return `<div class="control-card ${needsUpdate && !isFail ? 'control-dashed' : ''}">
          <div class="control-top">
            <div class="control-desc">
              <p class="control-name">${c.id} — ${esc(c.name)}</p>
              <p class="control-evidence">Evidence: ${esc(c.evidence)}</p>
            </div>
            ${selectHTML({ value: verdict, options: [{ value: 'effective', label: 'Effective — keep' }, { value: 'update', label: 'Needs update' }], placeholder: '— verdict —', attrs: `data-action="set-review-class" data-ctl="${c.id}" data-fk="rv-${c.id}" aria-label="Verdict for ${c.id}"`, cls: 'verdict-select' })}
          </div>
          ${needsUpdate && c.updateOptions ? `
            <div class="update-box">
              <p class="mono update-label">Choose the updated measure:</p>
              <div class="stack-15">
                ${c.updateOptions.map(u => `
                  <button class="btn btn-wire chip-toggle ${state.reviewUpdates[c.id] === u.id ? 'chip-on-lime' : ''}" data-action="set-review-update" data-ctl="${c.id}" data-update="${u.id}" data-fk="ru-${c.id}-${u.id}" aria-pressed="${state.reviewUpdates[c.id] === u.id}">${esc(u.label)}</button>`).join('')}
              </div>
            </div>` : ''}
        </div>`
      }).join('')}
    </div>
    ${hard ? `
      <div class="verify-block">
        ${allClassified
          ? (state.reviewVerified
            ? teachingNote('Simulated re-run: WAF virtual patch blocks the Log4j callback path; phishing simulation pilot returns a 19% → 9% click-rate projection. Verification recorded — run CHECK on the slate.')
            : `<button class="btn btn-ink" data-action="run-verification">Run verification (simulated re-scan &amp; sim-phish)</button>`)
          : '<p class="mono verify-wait">Classify all five controls to unlock verification.</p>'}
      </div>` : ''}
  </div>`
}

function participationDeskHTML(state) {
  return `<div class="panel">
    <p class="assign-label">${icon('users', 's4')} Assignment OBJ-M11 · participation to varying degrees</p>
    <p class="panel-sub">“All employees should participate to varying degrees.” Match each role to its designed degree — one option belongs to nobody here.</p>
    <div class="stack-2">
      ${PARTICIPATION_ROWS.map(r => `
        <div class="routing-row">
          <span class="particip-label">${esc(r.label)}</span>
          ${selectHTML({ value: state.participation[r.id] || '', options: PARTICIPATION_OPTIONS.map(o => ({ value: o.id, label: o.label })), placeholder: '— degree —', attrs: `data-action="set-participation" data-role="${r.id}" data-fk="pt-${r.id}" aria-label="Participation degree for ${esc(r.label)}"`, cls: 'particip-select' })}
        </div>`).join('')}
    </div>
  </div>`
}

function buyInDeskHTML(state, hard) {
  return `<div class="panel">
    <p class="assign-label">${icon('handshake', 's4')} ${hard ? 'Assignment OBJ-H8 · the CFO meeting' : 'Assignment OBJ-M12 · drivers of consensus & buy-in'}</p>
    ${hard
      ? '<div class="flash-box"><strong>CFO:</strong> “Patch windows cost money and downtime. Why should I sign this? Make it quick.” Assemble your three-item response package and choose the one framing line you open with.</div>'
      : '<p class="panel-sub">Pick the three drivers that genuinely earn leadership buy-in.</p>'}
    <div class="buyin-grid">
      ${BUYIN_OPTIONS.map(b => {
        const on = state.buyIn.includes(b.id)
        return `<button class="btn btn-wire chip-toggle ${on ? 'chip-on-lime' : ''}" data-action="toggle-buyin" data-buyin="${b.id}" data-fk="bi-${b.id}" aria-pressed="${on}">
          <span class="mono chip-id">${b.id}</span>${esc(b.label)}</button>`
      }).join('')}
    </div>
    <p class="mono counter">Selected: ${state.buyIn.length}/3</p>
    ${hard ? `
      <div class="framing-block">
        <p class="mono framing-label">Your opening line:</p>
        <div class="stack-15">
          ${FRAMING_LINES.map(f => `
            <button class="btn btn-wire chip-toggle framing-btn ${state.framing === f.id ? 'chip-on-red' : ''}" data-action="set-framing" data-framing="${f.id}" data-fk="fr-${f.id}" aria-pressed="${state.framing === f.id}">${esc(f.label)}</button>`).join('')}
        </div>
      </div>` : ''}
  </div>`
}

function boardRoomHTML(state) {
  const mode = state.mode
  const modeObjs = OBJECTIVES_BY_MODE(mode || 'medium')
  const has = id => modeObjs.some(o => o.id === id)
  const isHard = mode === 'hard'
  return `<section aria-label="Board room — reviews and buy-in" class="stack-6">
    ${sectionHead('Board room · governance', 'The editorial board — where the program reviews itself', 'Regular reviews · participation · buy-in')}
    ${controlReviewHTML(state, isHard)}
    ${has('OBJ-M11') ? participationDeskHTML(state) : ''}
    ${(has('OBJ-M12') || has('OBJ-H8')) ? buyInDeskHTML(state, isHard) : ''}
  </section>`
}

// ── quiz (Quiz.tsx) — color contract enforced here ───────────────────────────
function quizHTML(state) {
  const mode = state.mode
  if (!mode) return ''
  const bank = quizBank(mode)
  const q = bank[state.quizIndex]

  if (state.quizDone) {
    const correctCount = quizCorrectCount(state, mode)
    const verdict = correctCount === bank.length
      ? 'A clean proof — the desk would hire you.'
      : correctCount >= bank.length - 2
        ? 'Solid subbing. Re-read the debrief for the ones that got away.'
        : 'Worth a re-read of the Front Page — then the Retrospective below pulls it together.'
    return `<section aria-label="Quiz results" class="wrap wrap-3xl">
      ${sectionHead('Standards desk · graded', 'Editorial standards quiz — result', `${correctCount}/${bank.length}`)}
      <div class="panel quiz-result">
        ${icon('graduation-cap', 's10 quiz-cap')}
        <p class="score-big">${correctCount}/${bank.length}</p>
        <p class="quiz-verdict">${verdict}</p>
        <button class="btn btn-ink quiz-retro-btn" data-action="set-section" data-section="retro">To the retrospective ${icon('arrow-right', 's4')}</button>
      </div>
      <div class="stack-2 recap-list">
        ${bank.map(x => {
          const ok = state.quizAnswers[x.id] === x.correct
          return `<div class="recap-card ${ok ? 'recap-ok' : 'recap-no'}">
            <p class="recap-prompt">${esc(x.prompt)}</p>
            <p class="recap-line ${ok ? 'recap-line-ok' : 'recap-line-no'}">
              ${ok ? 'Correct. ' : `You picked “${esc(x.options[state.quizAnswers[x.id]])}”. Correct: “${esc(x.options[x.correct])}”. `}
            </p>
            <p class="recap-explain">${esc(x.explanation)}</p>
          </div>`
        }).join('')}
      </div>
    </section>`
  }

  const answered = state.quizAnswers[q.id] !== undefined
  const picked = state.quizAnswers[q.id]
  const optionBtns = q.options.map((opt, i) => {
    const isPicked = picked === i
    const reveal = answered
    const isCorrect = i === q.correct
    // Color contract: picked-correct → green only; picked-wrong → red ONLY.
    // The correct option is annotated neutrally (dashed ink), never green,
    // on a wrong pick. Icons + text tags so color is never the sole carrier.
    const cls = !reveal
      ? 'quiz-opt'
      : isPicked && isCorrect ? 'quiz-opt quiz-opt-pick-correct'
      : isPicked && !isCorrect ? 'quiz-opt quiz-opt-pick-wrong'
      : !isPicked && isCorrect ? 'quiz-opt quiz-opt-neutral-correct'
      : 'quiz-opt quiz-opt-dim'
    const tag = reveal && isPicked && isCorrect
      ? `<span class="mono opt-tag opt-tag-ok">${icon('check-circle-2', 's35')} your pick — correct</span>`
      : reveal && isPicked && !isCorrect
        ? `<span class="mono opt-tag opt-tag-no">${icon('x-circle', 's35')} your pick — not this one</span>`
        : reveal && !isPicked && isCorrect
          ? '<span class="mono opt-tag opt-tag-info">correct answer — see note below</span>'
          : ''
    return `<button class="${cls}" data-quiz-option data-action="quiz-pick" data-index="${i}" data-fk="qopt-${i}"
      role="radio" aria-checked="${isPicked}" ${answered ? 'disabled' : ''}>
      <span class="mono opt-letter">${String.fromCharCode(65 + i)}.</span>${esc(opt)}${tag}
    </button>`
  }).join('')

  const explainHTML = answered ? `
    <div class="quiz-explain ${picked === q.correct ? 'feedback-ok' : 'feedback-fail'}">
      <p class="mono explain-label">${picked === q.correct ? 'Correct — why it matters' : 'Not this time — why'}</p>
      <p class="explain-text">${esc(q.explanation)}</p>
      <button class="btn btn-ink quiz-next-btn" data-action="quiz-next">
        ${state.quizIndex + 1 >= bank.length ? 'See the graded result' : 'Next question'}
      </button>
    </div>` : ''

  return `<section aria-label="Standards quiz" class="wrap wrap-3xl">
    ${sectionHead('Standards desk', mode === 'medium' ? 'Editorial standards quiz' : 'Field examination', `Question ${state.quizIndex + 1} of ${bank.length}`)}
    <div class="panel quiz-card">
      <p class="quiz-q">${esc(q.prompt)}</p>
      <div class="quiz-options" role="radiogroup" aria-label="Answer options" data-quiz-options data-answered="${answered}">
        ${optionBtns}
      </div>
      ${explainHTML}
    </div>
  </section>`
}

// ── retro (Retro.tsx) ────────────────────────────────────────────────────────
const MITRE_LINKS = [
  { id: 'M1016', name: 'Vulnerability Scanning', url: 'https://attack.mitre.org/mitigations/M1016/' },
  { id: 'M1051', name: 'Update Software', url: 'https://attack.mitre.org/mitigations/M1051/' },
  { id: 'M1017', name: 'User Training', url: 'https://attack.mitre.org/mitigations/M1017/' },
  { id: 'M1030', name: 'Network Segmentation', url: 'https://attack.mitre.org/mitigations/M1030/' },
]

function retroHTML(state) {
  const mode = state.mode
  const objs = OBJECTIVES_BY_MODE(mode)
  const allPassed = objs.every(o => state.checks[o.id] && state.checks[o.id].passed)
  const canFinish = allPassed && state.quizDone
  const stats = computeStars(state, mode)
  const remaining = objs.filter(o => !(state.checks[o.id] && state.checks[o.id].passed)).length
  return `<section aria-label="Retrospective and debrief" class="wrap wrap-5xl stack-6">
    ${sectionHead('Retrospective · field notes', 'What the desk taught you — pinned for the wall', 'Detection · mitigation · both mindsets')}
    <div class="retro-grid">
      <div class="retro-card">
        <h3 class="retro-h">${icon('newspaper', 's4 retro-ic-red')} Reporting &amp; detection opportunities</h3>
        <ul class="list-disc">${DEBRIEF.detection.map(d => `<li>${esc(d)}</li>`).join('')}</ul>
        <p class="mono retro-src">Data sources: scanner output · remediation tickets · asset inventory · training/LMS records</p>
      </div>
      <div class="retro-card">
        <h3 class="retro-h">${icon('shield-check', 's4 retro-ic-lime')} Mitigation map (official IDs)</h3>
        <ul class="mitig-list">
          ${DEBRIEF.mitigations.map(m => `
            <li>
              <a href="https://attack.mitre.org/mitigations/${m.id}/" target="_blank" rel="noreferrer" class="ext-link mitig-link">${m.id} — ${esc(m.name)} ${icon('external-link', 's3')}</a>
              <span class="mitig-text">${esc(m.text)}</span>
            </li>`).join('')}
        </ul>
      </div>
      <div class="retro-card">
        <h3 class="retro-h">Blue-team takeaways</h3>
        <ul class="list-disc">${DEBRIEF.blue.map(d => `<li>${esc(d)}</li>`).join('')}</ul>
      </div>
      <div class="retro-card">
        <h3 class="retro-h">${icon('swords', 's4 retro-ic-amber')} Red-team mindset (know the adversary)</h3>
        <ul class="list-disc">${DEBRIEF.red.map(d => `<li>${esc(d)}</li>`).join('')}</ul>
      </div>
    </div>

    <div class="panel">
      <h3 class="retro-h">Official references (open in a new tab)</h3>
      <div class="ref-row">
        ${MITRE_LINKS.map(l => `<a href="${l.url}" target="_blank" rel="noreferrer" class="ext-link">${l.id} ${esc(l.name)} ${icon('external-link', 's3')}</a>`).join('')}
        <a href="https://www.comptia.org/training/certification/cysa-plus" target="_blank" rel="noreferrer" class="ext-link">CompTIA CySA+ (CS0-003) ${icon('external-link', 's3')}</a>
        <a href="https://csrc.nist.gov/pubs/sp/800/40/r4/final" target="_blank" rel="noreferrer" class="ext-link">NIST SP 800-40r4 (patch management) ${icon('external-link', 's3')}</a>
      </div>
      <p class="mono retro-src">Simplified where noted · IDs, names and mappings verified against attack.mitre.org</p>
    </div>

    <div class="final-card">
      <p class="mono final-kicker">Final edition</p>
      <p class="final-status">${canFinish
        ? 'Slate complete · quiz graded. Run the final edition.'
        : !allPassed
          ? `Assignments remaining: ${remaining}. Finish the slate first.`
          : 'Quiz not yet graded — take the standards quiz first.'}</p>
      <div class="final-actions">
        ${!state.quizDone ? `<button class="btn btn-ghost-cream" data-action="set-section" data-section="quiz">To the quiz</button>` : ''}
        ${canFinish ? finishButtonHTML(stats) : '<button class="btn" disabled>Final edition locked</button>'}
      </div>
    </div>
  </section>`
}

function finishButtonHTML(stats) {
  return `<button class="btn btn-final" data-action="open-completion">Run the final edition</button>`
}

// ── overlays: stylebook, reset, completion, mobile sheet ─────────────────────
function stylebookHTML() {
  return `<div class="modal-overlay" data-overlay="stylebook">
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="stylebook-title">
      <button class="modal-close" data-action="close-overlay" data-overlay="stylebook" aria-label="Close the stylebook">✕</button>
      <div class="modal-head">
        <h2 class="modal-title" id="stylebook-title">The Stylebook — glossary</h2>
        <p class="mono modal-desc">Every term the desk expects you to know.</p>
      </div>
      <dl class="glossary-grid">
        ${GLOSSARY.map(g => `
          <div class="glossary-item">
            <dt class="glossary-term">${esc(g.term)}</dt>
            <dd class="glossary-def">${esc(g.def)}</dd>
          </div>`).join('')}
      </dl>
    </div>
  </div>`
}

function resetDialogHTML() {
  return `<div class="modal-overlay" data-overlay="reset">
    <div class="modal modal-narrow" role="alertdialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-desc">
      <button class="modal-close" data-action="close-overlay" data-overlay="reset" aria-label="Cancel the reset">✕</button>
      <div class="modal-head">
        <h2 class="modal-title modal-title-lg" id="reset-title">Pulldown the whole edition?</h2>
        <p class="modal-desc-plain" id="reset-desc">This wipes all progress — objectives, checks, quiz answers and the environment — and returns the desk to its pristine state.</p>
      </div>
      <div class="modal-actions">
        <button class="btn btn-sm" data-action="close-overlay" data-overlay="reset">Keep working</button>
        <button class="btn btn-sm btn-danger" data-action="confirm-reset">Reset everything</button>
      </div>
    </div>
  </div>`
}

const PILLAR_LABEL = { P1: 'Understand', P2: 'Analyze', P3: 'Evaluate & Verify', P4: 'Plan & Mitigate' }

function completionModalHTML(state) {
  const mode = state.mode
  if (!mode) return ''
  const objs = OBJECTIVES_BY_MODE(mode)
  const passedObjs = objs.filter(o => state.checks[o.id] && state.checks[o.id].passed)
  const stats = computeStars(state, mode)
  const recap = ['P1', 'P2', 'P3', 'P4'].map(p => ({ p, items: passedObjs.filter(o => o.pillar === p) }))
  return `<div class="modal-overlay" data-overlay="completion">
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="completion-title">
      <button class="modal-close" data-action="close-overlay" data-overlay="completion" aria-label="Close the final edition">✕</button>
      <div class="modal-head center">
        <p class="mono comp-kicker">Extra! · edition published</p>
        <h2 class="comp-title" id="completion-title">You own the desk now.</h2>
        <p class="comp-desc">You can explain vulnerability management reporting, recognize it in raw evidence, verify it, and plan it — the full Lesson 7.1 loop.</p>
      </div>

      <div class="score-band">
        <p class="mono score-label">Final score</p>
        <p class="score-num">${stats.score}<span class="score-denom">/100</span></p>
        <div class="stars" role="img" aria-label="${stats.stars} of 5 stars">
          ${[1, 2, 3, 4, 5].map(i => `<span class="star ${i <= stats.stars ? 'star-on' : ''}">${icon('star', 's7')}</span>`).join('')}
        </div>
        <p class="stars-note">${stats.stars === 5 ? 'Flawless edition.' : 'Stars reward first-attempt accuracy and frugal hint use. Reset and chase the clean proof if you like.'}</p>
      </div>

      <div>
        <p class="mono recap-kicker">Objective recap by pillar</p>
        <div class="pillar-recap">
          ${recap.map(({ p, items }) => `
            <div class="recap-box">
              ${pillarBadge(p)}
              <p class="recap-count">${PILLAR_LABEL[p]} · ${items.length}</p>
              <ul class="recap-ul">${items.map(o => `<li class="mono recap-li">✔ ${o.id.replace('OBJ-', '')}</li>`).join('')}</ul>
            </div>`).join('')}
        </div>
      </div>

      <div class="next-steps">
        <p class="next-steps-h">${icon('library', 's4 next-steps-ic')} What to learn next</p>
        <ul class="list-disc">
          <li>CySA+ CS0-003 Domain 5.2 — incident response communication: playbooks, communiqués, drills.</li>
          <li>NIST SP 800-40r4 — enterprise patch management planning (the SLA concepts in policy form).</li>
          <li>MITRE ATT&amp;CK mitigations M1016 / M1051 / M1017 — link the program to adversary behavior.</li>
          <li>Try the other edition — the Night Desk grades the same knowledge under pressure.</li>
        </ul>
      </div>

      <div class="modal-actions center">
        <button class="btn btn-ghost" data-action="set-section" data-section="retro">Re-read the retrospective</button>
        <button class="btn btn-ink" data-action="confirm-reset">${icon('rotate-ccw', 's35')} Reset the lab</button>
      </div>
    </div>
  </div>`
}

function sheetHTML(state) {
  const objs = OBJECTIVES_BY_MODE(state.mode)
  const passed = objs.filter(o => state.checks[o.id] && state.checks[o.id].passed).length
  const allPassed = passed === objs.length
  return `
    <div class="sheet-bar">
      <button class="sheet-bar-btn" data-action="open-sheet" aria-label="Open assignment slate, ${passed} of ${objs.length} passed">
        <span class="sheet-bar-left">${icon('clipboard-list', 's4')} Assignments</span>
        <span class="mono sheet-badge ${allPassed ? 'sheet-badge-pass' : 'sheet-badge-open'}">${passed}/${objs.length}${allPassed ? ' · quiz next' : ''}</span>
      </button>
    </div>`
}

function sheetOpenHTML(state) {
  return `
    <div class="sheet-overlay" data-overlay="sheet"></div>
    <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
      <div class="sheet-head">
        <div>
          <p class="mono sheet-title" id="sheet-title">Assignment slate</p>
          <p class="mono sheet-sub">All assignments for this edition, with checks, hints and feedback.</p>
        </div>
        <button class="sheet-close" data-action="close-overlay" data-overlay="sheet" aria-label="Close the assignment slate">✕</button>
      </div>
      <div class="sheet-body">${slateListHTML(state, true)}</div>
    </div>`
}

// ── main section router (Lab.tsx DeskWorld) ──────────────────────────────────
function sectionHTML(state) {
  switch (state.section) {
    case 'front': return frontPageHTML(state)
    case 'newsroom': return newsroomHTML(state)
    case 'compose': return composeRoomHTML(state)
    case 'press': return pressRoomHTML(state)
    case 'board': return boardRoomHTML(state)
    case 'quiz': return quizHTML(state)
    case 'retro': return retroHTML(state)
    default: return ''
  }
}

// ── phase roots ──────────────────────────────────────────────────────────────
function deskHTML(state) {
  return `
    <div class="desk">
      <div id="masthead-slot">${mastheadHTML(state)}</div>
      ${mobileNavHTML(state)}
      <div class="desk-grid">
        ${railHTML(state)}
        <main class="desk-main" id="main-desk">
          <div class="fade-in" id="section-slot">${sectionHTML(state)}</div>
        </main>
        <aside class="slate-rail" aria-label="Assignment slate">
          <div class="slate-rail-inner">
            <div id="slate-header-slot">${slateRailHeaderHTML(state)}</div>
            <div class="slate-rail-list" id="slate-list-slot">${slateListHTML(state, false)}</div>
          </div>
        </aside>
      </div>
      ${sheetHTML(state)}
      <div id="sheet-slot"></div>
      <div id="modal-slot"></div>
    </div>`
}

function appHTML(state) {
  if (state.phase === 'mode') return modeSelectHTML()
  if (state.phase === 'briefing') return briefingHTML(state)
  return deskHTML(state)
}
