// ─── CyberLab "Drafting Room" — bootstrap & shell (js/app.js) ────────────────
// Vanilla port of LabRoot.tsx + ModeGate.tsx + TitleBlock.tsx: hydration-free
// load → mode gate → lab shell (title block, drawing-set tabs, survey
// checklist, sheets, completion modal). Single page; no nav, no footer.

const SHEETS = [
  { id: 'brief', label: '1 · Brief & Ref' },
  { id: 'blueprint', label: '2 · Blueprint' },
  { id: 'hosts', label: '3 · Host Evidence' },
  { id: 'defense', label: '4 · Defense & Access' },
  { id: 'quiz', label: '5 · Knowledge Check' },
  { id: 'notes', label: '6 · Field Notes' },
]

const RENDERERS = {
  brief: BriefSheet,
  blueprint: BlueprintSheet,
  hosts: HostSheet,
  defense: DefenseSheet,
  quiz: QuizSheet,
  notes: NotesSheet,
}

const APP = document.getElementById('app')
let currentSheet = null
let currentScope = null
let tabsApi = null

// ── shared chrome ─────────────────────────────────────────────────────────────
function GridBackdrop() {
  return h('div', { class: 'grid-backdrop', 'aria-hidden': 'true' })
}

// ── Mode gate ─────────────────────────────────────────────────────────────────
const MODES = [
  {
    id: 'medium',
    name: 'Guided Survey',
    tagline: 'Understand & learn',
    icon: 'draftingCompass',
    points: [
      '12 granular objectives, introduced in order',
      'Tiered hints (nudge → direction → demonstration) — free to use',
      'Tolerant validation with teaching feedback on every check',
      'Knowledge check: 7 concept questions with explanations',
    ],
    tone: 'tone-emerald',
    ring: 'ring-emerald',
  },
  {
    id: 'hard',
    name: 'Red-Team Audit',
    tagline: 'Test & stretch',
    icon: 'swords',
    points: [
      '9 broad, multi-step challenges — no hand-holding',
      'Noisy evidence with red herrings, plus a sabotaged telemetry rack',
      'Strict validation: exact IDs, sequences and state checks',
      'Efficiency & first-attempt accuracy drive the score',
    ],
    tone: 'tone-rose',
    ring: 'ring-rose',
  },
]

function renderModeGate() {
  // full teardown of any previous session
  if (currentScope) currentScope.dispose()
  currentScope = null
  currentSheet = null
  LabStore._subs.clear()
  LabStore.results = {}
  LabStore.completionOpen = false
  LabStore.pulse = null
  Floating.close()

  const gate = h(
    'div',
    { class: 'gate-root' },
    h('p', { class: 'gate-kicker' }, `${LAB_META.org} · ${LAB_META.drawingNo} · ${LAB_META.revision}`),
    h('h1', { class: 'gate-title' }, 'The Drafting Room — Network Security Architecture Survey'),
    h('p', { class: 'gate-sub' },
      'An interactive training lab for ', h('span', { class: 'txt-amber' }, 'CompTIA CySA+ CS0-003 · Objective 1.1'),
      ': system and network architecture concepts in security operations. Every byte is synthetic training data. Choose your experience:'),
    h('div', { class: 'gate-cards' },
      MODES.map((m) =>
        h(
          'button',
          {
            type: 'button',
            class: 'gate-card ' + m.ring,
            'aria-label': `Start ${m.name} mode: ${m.tagline}`,
          },
          h('div', { class: 'gate-card-head' },
            h('span', { class: 'gate-icon ' + m.tone, html: labIcon(m.icon) }),
            h('span', { class: 'gate-tagline' }, m.tagline),
          ),
          h('h2', { class: 'gate-card-title' }, m.name),
          h('ul', { class: 'gate-points' },
            m.points.map((p) => h('li', null, h('span', { class: 'gate-dot ' + m.tone, 'aria-hidden': 'true' }), p)),
          ),
          h('p', { class: 'gate-cta' }, 'Enter the Drafting Room →'),
        ),
      ),
    ),
    h('p', { class: 'gate-foot' },
      'Both modes share the same environment and data core — they differ in guidance, validation strictness and scoring. Progress auto-saves to this browser only.'),
  )
  gate.querySelectorAll('.gate-card').forEach((btn, i) =>
    btn.addEventListener('click', () => startLab(freshState(MODES[i].id))),
  )

  APP.replaceChildren(GridBackdrop(), gate)
}

// ── Title block (engineering-drawing header — fiction chrome, not a nav bar) ─
function TitleBlock() {
  const mode = LabStore.state.mode ?? 'medium'
  const sum0 = scoreSummary(LabStore.state)

  const doneTxt = h('span', { class: 'stat-num' }, `${sum0.objectivesDone}/${sum0.objectivesTotal}`)
  const progress = ProgressBar((sum0.objectivesDone / sum0.objectivesTotal) * 100, true)
  const quizTxt = h('span', { class: 'stat-num' }, `${sum0.quizCorrect}/${sum0.quizTotal}`)

  const signoff = h('button', { type: 'button', class: 'btn-amber' },
    h('span', { class: 'chip-icon', html: labIcon('award') }), 'Sign-off')
  signoff.addEventListener('click', () => LabStore.setCompletionOpen(true))

  const resetBtn = h('button', { type: 'button', class: 'btn-reset' },
    h('span', { class: 'chip-icon', html: labIcon('rotateCcw') }), 'Reset')
  resetBtn.addEventListener('click', openResetDialog)

  const legend = h('div', { class: 'legend-strip' },
    h('span', { class: 'legend-label' }, 'Mastery pillars:'),
    Object.entries(PILLAR_META).map(([k, v]) =>
      h('span', { class: 'legend-pillar ' + PILLAR_CLASS[k] }, `${k} ${v.label}`)),
    h('span', { class: 'legend-note' }, 'All data synthetic · progress saved locally'),
  )

  LabStore.subscribe(() => {
    const sum = scoreSummary(LabStore.state)
    doneTxt.textContent = `${sum.objectivesDone}/${sum.objectivesTotal}`
    progress.set((sum.objectivesDone / sum.objectivesTotal) * 100)
    quizTxt.textContent = `${sum.quizCorrect}/${sum.quizTotal}`
  })

  return h(
    'header',
    { class: 'top-bar' },
    h(
      'div',
      { class: 'top-bar-inner' },
      h('div', { class: 'brand' },
        h('div', { class: 'brand-mark', 'aria-hidden': 'true' }, '⌖'),
        h('div', { class: 'brand-text' },
          h('p', { class: 'brand-kicker' }, `${LAB_META.org} · ${LAB_META.drawingNo}`),
          h('h1', { class: 'brand-title' }, LAB_META.title, ' ', h('span', { class: 'brand-obj' }, `(${LAB_META.objective})`)),
        ),
      ),
      h('div', { class: 'top-stats' },
        h('span', { class: 'mode-badge ' + (mode === 'hard' ? 'mode-hard' : 'mode-medium') },
          mode === 'hard' ? 'Red-Team Audit' : 'Guided Survey'),
        h('div', { class: 'stat-progress', 'aria-label': `Objectives completed: ${sum0.objectivesDone} of ${sum0.objectivesTotal}` },
          h('div', { class: 'stat-progress-labels' }, h('span', null, 'Survey checklist'), doneTxt),
          progress.el,
        ),
        h('p', { class: 'stat-quiz' }, 'quiz ', quizTxt),
        signoff,
        resetBtn,
      ),
    ),
    legend,
  )
}

function openResetDialog() {
  const m = Modal({ boxClass: 'confirm-box' })
  const cancel = h('button', { type: 'button', class: 'btn-ghost', 'data-autofocus': true }, 'Keep working')
  const danger = h('button', { type: 'button', class: 'btn-danger' }, 'Reset everything')
  cancel.addEventListener('click', () => m.close())
  danger.addEventListener('click', () => {
    m.close()
    LabStore.resetLab()
  })
  m.box.append(
    h('h2', { class: 'modal-title' }, 'Reset the survey?'),
    h('p', { class: 'modal-desc' },
      'This wipes all progress, answers and saved state from this browser and returns the lab to its pristine mode-selection screen. This cannot be undone.'),
    h('div', { class: 'modal-actions' }, cancel, danger),
  )
}

// ── Lab shell ─────────────────────────────────────────────────────────────────
function startLab(state) {
  LabStore.init(state, () => renderModeGate())
  currentSheet = null
  currentScope = null

  // screen-reader announcements (aria-live)
  const live = h('div', { role: 'status', 'aria-live': 'polite', class: 'sr-only' })
  LabStore._announceEl = live

  const sheetContainer = h('div', { id: 'sheet-container' })
  tabsApi = TabsNav({
    items: SHEETS,
    value: LabStore.state.activeSheet,
    ariaLabel: 'Drawing set — lab sheets',
    listClass: 'sheet-tabs',
    tabClass: 'sheet-tab',
    onChange: (id) => LabStore.setSheet(id),
  })

  function mountSheet(id) {
    if (currentScope) currentScope.dispose()
    sheetContainer.replaceChildren()
    const { el, scope } = RENDERERS[id]()
    el.classList.add('sheet-enter')
    sheetContainer.append(el)
    currentScope = scope
    currentSheet = id
  }

  LabStore.subscribe(() => {
    const sheet = LabStore.state.activeSheet
    if (sheet !== currentSheet) {
      mountSheet(sheet)
      tabsApi.set(sheet)
    }
  })
  // pulse rings on [data-pulse] panels (usePulseClass parity)
  LabStore.subscribe(() => {
    document.querySelectorAll('[data-pulse]').forEach((el) => {
      el.classList.toggle('pulse-active', LabStore.pulse === el.dataset.pulse)
    })
  })

  mountSheet(LabStore.state.activeSheet)

  const shell = h(
    'div',
    { class: 'lab-root' },
    GridBackdrop(),
    TitleBlock(),
    h(
      'main',
      { class: 'lab-main' },
      h(
        'div',
        { class: 'lab-grid' },
        ObjectivesRail(),
        h('div', { class: 'lab-content' },
          tabsApi.el,
          sheetContainer,
        ),
      ),
    ),
    live,
  )
  APP.replaceChildren(shell)
  CompletionModal()
}

// ── boot ──────────────────────────────────────────────────────────────────────
;(function boot() {
  const saved = loadState()
  if (saved) startLab(saved)
  else renderModeGate()
})()
