// ── SIGNALWATCH · main orchestrator (js/app.js) ─────────────────────────────
// Single self-contained page: mode select → console (status bar + channel rail
// + stage). No site chrome, no footer — this is a monitoring "world".
// 1:1 static port of SignalWatchLab.tsx (+ the small transient-UI semantics of
// React useState, which are NOT persisted — same as the original).

// ── transient UI state (React useState equivalents; never persisted) ────────
const ui = {
  results: {},      // per-workset / per-card validation result
  ruleTest: null,   // rule bench replay result
  dnsFilter: 'all',
  epHost: 'all',
  confirmRestart: false,
  forceResults: false,  // RESULTS button → force completion modal
  resetOpen: false,     // reset confirm dialog
  modalFocused: false,  // close-button focus applied for this open
}
function resetTransient() {
  ui.results = {}
  ui.ruleTest = null
  ui.dnsFilter = 'all'
  ui.epHost = 'all'
  ui.confirmRestart = false
  ui.forceResults = false
  ui.resetOpen = false
  ui.modalFocused = false
}

// ── channels ────────────────────────────────────────────────────────────────
const CHANNELS = [
  { id: 'brief', label: 'BRIEF', icon: 'RadioTower' },
  { id: 'dispatch', label: 'DISPATCH', icon: 'ClipboardList' },
  { id: 'flow', label: 'FLOWSCOPE', icon: 'Network' },
  { id: 'dns', label: 'DNS WIRE', icon: 'Binary' },
  { id: 'mail', label: 'MAIL GATE', icon: 'Mail' },
  { id: 'endpoint', label: 'ENDPOINT', icon: 'Terminal' },
  { id: 'rules', label: 'RULE BENCH', icon: 'SlidersHorizontal' },
  { id: 'actions', label: 'ACTIONS', icon: 'Zap' },
  { id: 'attack', label: 'ATT&CK', icon: 'Crosshair' },
  { id: 'alerts', label: 'ALERT QUEUE', icon: 'Siren', hardOnly: true },
  { id: 'quiz', label: 'QUIZ', icon: 'GraduationCap' },
  { id: 'debrief', label: 'DEBRIEF', icon: 'BookOpenCheck' },
]

function Stage(channel) {
  switch (channel) {
    case 'brief': return BriefPanel()
    case 'dispatch': return DispatchPanel()
    case 'flow': return FlowscopePanel()
    case 'dns': return DnsWirePanel()
    case 'mail': return MailGatePanel()
    case 'endpoint': return EndpointPanel()
    case 'rules': return RuleBenchPanel()
    case 'actions': return ActionBoardPanel()
    case 'attack': return AttackMapPanel()
    case 'alerts': return AlertQueuePanel()
    case 'quiz': return QuizPanel()
    case 'debrief': return DebriefPanel()
    default: return BriefPanel()
  }
}

// ── mode selection ──────────────────────────────────────────────────────────
function ModeSelect() {
  return h('div', { class: 'sw-root mode-root' },
    h('div', { class: 'mode-wrap' },
      h('header', { class: 'mode-header' },
        h('div', { class: 'mode-badge-ring' },
          h('span', { class: 'mode-badge-inner' },
            h('span', { class: 'sw-radar-sweep mode-radar' }),
            icon('Radar', 'ic-5 c-emerald-300'),
          ),
        ),
        h('p', { class: 'mode-kicker' }, `${LAB_META.console} · TRAINING CONSOLE`),
        h('h1', { class: 'mode-title' }, 'SIGNALWATCH'),
        h('p', { class: 'mode-sub' },
          'Techniques for identifying malicious activity — a night-shift lab for ',
          h('b', { class: 'c-emerald-300' }, LAB_META.cert), `, ${LAB_META.domain}. Monitor network + email activity, recognize unusual traffic patterns, protocol behavior and indicator events, then detect and mitigate. One incident is hiding in tonight's noise.`),
      ),

      h('div', { class: 'mode-grid' },
        h('button', {
          type: 'button', class: 'mode-card mode-card-medium', 'data-fid': 'mode-medium',
          onclick: () => { resetTransient(); actions.start('medium') },
        },
          h('span', { class: 'mode-card-label c-emerald-300' }, icon('ShieldCheck', 'ic-5 c-emerald-400'), h('span', { class: 'font-mono' }, 'MEDIUM · GUIDED WATCH')),
          h('span', { class: 'mode-card-text' },
            h('b', { class: 'c-emerald-200' }, '12 dispatches'), ' in order, each a single learning bite. Free tiered hints, tolerant checks, teaching feedback on every answer. Quiz after practice.'),
          h('span', { class: 'mode-card-foot' }, '→ for first contact with the lesson'),
        ),
        h('button', {
          type: 'button', class: 'mode-card mode-card-hard', 'data-fid': 'mode-hard',
          onclick: () => { resetTransient(); actions.start('hard') },
        },
          h('span', { class: 'mode-card-label c-rose-300' }, icon('Gauge', 'ic-5 c-rose-400'), h('span', { class: 'font-mono' }, 'HARD · FREE-ROAM TRIAGE')),
          h('span', { class: 'mode-card-text' },
            h('b', { class: 'c-rose-200' }, '8 deep dispatches'), ' over the same noisy evidence floor — with red herrings. Minimal guidance, strict exact-value checks, sequence and state checks. One optional nudge, and it costs score.'),
          h('span', { class: 'mode-card-foot' }, '→ to test the watch you already keep'),
        ),
      ),

      h('p', { class: 'mode-disclaimer' },
        'TRAINING SIMULATION — SYNTHETIC DATA ONLY · RFC 5737 TEST-NET IPs · .example DOMAINS · DEFENSIVE FRAMING'),
    ),
  )
}

// ── console shell pieces ────────────────────────────────────────────────────
function LockMini() {
  return h('span', { class: 'lock-mini', 'aria-label': 'locked — requirements pending' }, '⌁')
}

function HeaderStats(p, stars, eligible) {
  return h('div', { class: 'header-stats' },
    h('span', { class: 'stat-clears' },
      LED(p.solved === p.total ? 'ok' : 'warn', p.solved !== p.total),
      ` ${p.solved}/${p.total} CLEARED`),
    h('span', { class: 'stat-acc' }, `ACC ${p.accuracy}% · HINTS ${p.hintsUsed}`),
    stars > 0 ? h('span', { class: 'stat-stars' }, icon('Trophy', 'ic-3'), ` ${stars}★`) : null,
    eligible
      ? h('button', {
          type: 'button', class: 'btn btn-results', 'data-fid': 'btn-results',
          onclick: () => { ui.forceResults = true; renderCompletion() },
        }, icon('Trophy', 'ic-35'), ' RESULTS')
      : null,
    h('button', {
      type: 'button', class: 'btn btn-reset', 'data-fid': 'btn-reset',
      onclick: () => { ui.resetOpen = true; renderReset() },
    }, icon('RotateCcw', 'ic-35'), ' RESET'),
  )
}

function ConsoleShell() {
  const mode = lab.mode
  const channel = lab.channel
  const safeChannel = channel === 'alerts' && mode !== 'hard' ? 'dispatch' : channel
  const p = progress(mode, lab.obj)
  const { stars } = starRating(mode, lab.obj)
  const eligible = mode !== null && p.total > 0 && p.solved === p.total && lab.quizDone
  const visible = CHANNELS.filter((c) => !c.hardOnly || mode === 'hard')

  return [
    // status strip
    h('header', { class: 'statusbar', id: 'sw-statusbar' },
      h('div', { class: 'statusbar-inner' },
        h('div', { class: 'brand' },
          h('span', { class: 'brand-ring' },
            h('span', { class: 'sw-radar-sweep brand-radar' }),
            icon('Radar', 'ic-35 c-emerald-300'),
          ),
          h('div', { class: 'brand-text' },
            h('div', { class: 'brand-name' }, 'SIGNALWATCH'),
            h('div', { class: 'brand-sub' }, `${LAB_META.shift} · ${LAB_META.org}`),
          ),
        ),
        h('span', { class: 'mode-flag ' + (mode === 'hard' ? 'mode-flag-hard' : 'mode-flag-medium') },
          mode === 'hard' ? 'HARD TRIAGE' : 'MEDIUM GUIDED'),
        HeaderStats(p, stars, eligible),
      ),
    ),

    h('div', { class: 'console-body' },
      // channel rail — desktop
      h('nav', { class: 'rail', 'aria-label': 'Console channels' },
        visible.map((c) =>
          h('button', {
            type: 'button', class: 'rail-btn ' + (safeChannel === c.id ? 'rail-on' : ''),
            'data-fid': 'rail-' + c.id, 'aria-current': safeChannel === c.id ? 'true' : null,
            onclick: () => actions.setChannel(c.id),
          },
            icon(c.icon, 'ic-4'), c.label,
            c.id === 'quiz' && !quizGateOpen(mode, lab.obj) ? LockMini() : null,
            c.id === 'debrief' && !debriefOpen(mode, lab.obj, lab.quizDone) ? LockMini() : null,
          )),
        h('div', { class: 'rail-status' },
          h('div', { class: 'section-label mb-1' }, 'Status'),
          h('p', { class: 'rail-status-text' }, 'auto-save: localStorage', h('br'), 'progress survives reload'),
        ),
      ),

      // stage
      h('main', { class: 'stage-main' },
        h('div', { id: 'stage', class: 'stage-anim' }),
      ),
    ),

    // channel dock — mobile
    h('nav', { class: 'dock', 'aria-label': 'Console channels' },
      h('div', { class: 'sw-scroll dock-inner' },
        visible.map((c) =>
          h('button', {
            type: 'button', class: 'dock-btn ' + (safeChannel === c.id ? 'rail-on' : ''),
            'data-fid': 'dock-' + c.id, 'aria-current': safeChannel === c.id ? 'true' : null,
            onclick: () => actions.setChannel(c.id),
          },
            icon(c.icon, 'ic-4'), c.label,
          )),
      ),
    ),
  ]
}

// ── completion modal (C7) ───────────────────────────────────────────────────
let modalWasOpen = false

function completionOpen() {
  const mode = lab.mode
  const list = mode ? OBJECTIVES[mode] : []
  const allSolved = list.length > 0 && list.every((d) => lab.obj[d.id]?.solved)
  const eligible = allSolved && lab.quizDone && !!mode
  return eligible && (!lab.completionSeen || ui.forceResults)
}

function renderCompletion() {
  const root = document.getElementById('sw-modal')
  if (!root) return
  const open = completionOpen()
  if (!open) {
    root.hidden = true
    root.replaceChildren()
    modalWasOpen = false
    ui.confirmRestart = false
    return
  }
  root.hidden = false
  root.replaceChildren(
    h('div', { class: 'modal-backdrop', onclick: () => dismissCompletion(), 'aria-hidden': true }),
    CompletionModalContent({}),
  )
  // R7: focus moves to the close button on open
  if (!modalWasOpen) {
    modalWasOpen = true
    window.setTimeout(() => {
      const btn = root.querySelector('[data-fid="modal-close"]')
      if (btn && document.activeElement !== btn) btn.focus({ preventScroll: true })
    }, 60)
  }
  restoreFocusIn(root)
}

function dismissCompletion() {
  ui.forceResults = false
  ui.confirmRestart = false
  actions.markCompletionSeen()
}

// ── reset confirm dialog (AlertDialog equivalent) ───────────────────────────
function renderReset() {
  const root = document.getElementById('sw-reset')
  if (!root) return
  if (!ui.resetOpen) {
    root.hidden = true
    root.replaceChildren()
    return
  }
  root.hidden = false
  root.replaceChildren(
    h('div', { class: 'modal-backdrop', onclick: () => closeReset(), 'aria-hidden': true }),
    h('div', { class: 'reset-panel sw-scan', role: 'alertdialog', 'aria-modal': 'true', 'aria-labelledby': 'reset-title', 'aria-describedby': 'reset-desc' },
      h('h2', { id: 'reset-title', class: 'reset-title' }, 'RESET THE CONSOLE?'),
      h('p', { id: 'reset-desc', class: 'reset-desc' },
        'This wipes all saved progress — mode, dispatches, evidence annotations, quiz results and stars — and returns to mode selection. The lab auto-saves locally; this cannot be undone.'),
      h('div', { class: 'reset-actions' },
        h('button', { type: 'button', class: 'btn btn-ghost', 'data-fid': 'reset-cancel', onclick: () => closeReset() }, 'Keep my watch'),
        h('button', { type: 'button', class: 'btn btn-danger', 'data-fid': 'reset-confirm', onclick: () => confirmReset() }, 'Reset everything'),
      ),
    ),
  )
  const cancel = root.querySelector('[data-fid="reset-cancel"]')
  if (cancel) cancel.focus({ preventScroll: true })
}

function closeReset() {
  ui.resetOpen = false
  renderReset()
  const btn = document.querySelector('[data-fid="btn-reset"]')
  if (btn) btn.focus({ preventScroll: true })
}

function confirmReset() {
  ui.resetOpen = false
  renderReset()
  resetTransient()
  actions.resetAll()
}

// simple focus trap for the reset dialog (Radix AlertDialog parity)
document.addEventListener('keydown', (e) => {
  if (!ui.resetOpen || e.key !== 'Tab') return
  const root = document.getElementById('sw-reset')
  if (!root) return
  const focusables = [...root.querySelectorAll('button')].filter((b) => !b.disabled)
  if (focusables.length === 0) return
  const first = focusables[0]
  const last = focusables[focusables.length - 1]
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
})

// ── focus restore across re-renders ─────────────────────────────────────────
function restoreFocusIn(scope) {
  const fid = restoreFocusIn._pending
  restoreFocusIn._pending = null
  if (!fid) return
  const target = (scope || document).querySelector(`[data-fid="${CSS.escape(fid)}"]`)
  if (target) target.focus({ preventScroll: true })
}

function captureFocus() {
  const ae = document.activeElement
  if (ae && ae.getAttribute && ae.closest('#stage, #sw-modal')) {
    restoreFocusIn._pending = ae.getAttribute('data-fid')
  } else {
    restoreFocusIn._pending = null
  }
}

// ── stage rendering + animated channel switch (AnimatePresence parity) ──────
let renderedChannel = null
let switchTimer = null

function renderStageContent(channel, animate) {
  const stage = document.getElementById('stage')
  if (!stage) return
  captureFocus()
  stage.replaceChildren(Stage(channel))
  renderedChannel = channel
  restoreFocusIn(stage)
  if (animate) {
    stage.classList.remove('stage-enter')
    void stage.offsetWidth // restart the animation
    stage.classList.add('stage-enter')
  }
}

// full re-render of the current channel (used by panel event handlers)
function renderStage(animate = false) {
  const safeChannel = lab.channel === 'alerts' && lab.mode !== 'hard' ? 'dispatch' : lab.channel
  renderStageContent(safeChannel, animate)
}

function syncStage() {
  const mode = lab.mode
  const channel = lab.channel
  const safeChannel = channel === 'alerts' && mode !== 'hard' ? 'dispatch' : channel
  if (safeChannel === renderedChannel) {
    renderStageContent(safeChannel, false)
    return
  }
  // channel switch: exit (0.18s) → swap → enter (AnimatePresence mode="wait")
  const stage = document.getElementById('stage')
  if (!stage) return
  window.clearTimeout(switchTimer)
  if (renderedChannel === null || !stage.childNodes.length) {
    renderStageContent(safeChannel, true)
    return
  }
  // per-mount transient state clears on unmount — same as React useState
  ui.results = {}
  ui.ruleTest = null
  stage.classList.add('stage-exit')
  switchTimer = window.setTimeout(() => {
    stage.classList.remove('stage-exit')
    renderStageContent(safeChannel, true)
  }, 180)
}

// update only the dynamic statusbar numbers + rail locks without a full shell rebuild
function refreshHeader() {
  const shell = document.getElementById('sw-statusbar')
  if (!shell) return
  const mode = lab.mode
  const p = progress(mode, lab.obj)
  const { stars } = starRating(mode, lab.obj)
  const eligible = mode !== null && p.total > 0 && p.solved === p.total && lab.quizDone
  captureFocus()
  const stats = HeaderStats(p, stars, eligible)
  const old = shell.querySelector('.header-stats')
  if (old) old.replaceWith(stats)
  restoreFocusIn(shell)
}

function refreshRail() {
  const mode = lab.mode
  const safeChannel = lab.channel === 'alerts' && mode !== 'hard' ? 'dispatch' : lab.channel
  const rail = document.querySelector('.rail')
  const dock = document.querySelector('.dock')
  const apply = (nav) => {
    if (!nav) return
    for (const btn of nav.querySelectorAll('button')) {
      const id = (btn.getAttribute('data-fid') || '').replace(/^(rail|dock)-/, '')
      if (!id) continue
      // active state (channel switch)
      const on = id === safeChannel
      btn.classList.toggle('rail-on', on)
      if (on) btn.setAttribute('aria-current', 'true')
      else btn.removeAttribute('aria-current')
      // lock glyphs (gate changes)
      if (id === 'quiz') {
        const lock = btn.querySelector('.lock-mini')
        const need = !quizGateOpen(mode, lab.obj)
        if (need && !lock) btn.appendChild(LockMini())
        if (!need && lock) lock.remove()
      }
      if (id === 'debrief') {
        const lock = btn.querySelector('.lock-mini')
        const need = !debriefOpen(mode, lab.obj, lab.quizDone)
        if (need && !lock) btn.appendChild(LockMini())
        if (!need && lock) lock.remove()
      }
    }
  }
  apply(rail)
  apply(dock)
}

// ── root render + store wiring ──────────────────────────────────────────────
let shellRendered = false

function renderRoot() {
  const rootEl = document.getElementById('app')
  if (!lab.started) {
    shellRendered = false
    renderedChannel = null
    rootEl.replaceChildren(ModeSelect())
    return
  }
  if (!shellRendered) {
    shellRendered = true
    rootEl.replaceChildren(h('div', { class: 'sw-root console-root' }, ConsoleShell()))
  } else {
    // keep shell; refresh mode flag + stats + locks
    const flag = rootEl.querySelector('.mode-flag')
    if (flag) {
      const hard = lab.mode === 'hard'
      flag.textContent = hard ? 'HARD TRIAGE' : 'MEDIUM GUIDED'
      flag.className = 'mode-flag ' + (hard ? 'mode-flag-hard' : 'mode-flag-medium')
    }
    refreshHeader()
    refreshRail()
  }
}

function fire() {
  renderRoot()
  if (lab.started) {
    syncStage()
    renderCompletion()
  }
  if (ui.resetOpen && !lab.started) renderReset()
}

// R7: ESC closes the completion report (and the reset dialog)
window.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return
  const modalOpen = completionOpen()
  if (modalOpen) {
    e.stopPropagation()
    dismissCompletion()
    return
  }
  if (ui.resetOpen) closeReset()
})

// ── bootstrap ───────────────────────────────────────────────────────────────
function boot() {
  subscribe(fire)
  if (lab.started) resetTransient()
  fire()
}

boot()
