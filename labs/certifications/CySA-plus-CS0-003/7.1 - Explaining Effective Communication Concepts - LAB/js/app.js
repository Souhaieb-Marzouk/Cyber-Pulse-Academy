// ── THE VULN BULLETIN ── bootstrap, event wiring, overlays ───────────────────
// Static port of Lab.tsx (root, rail, sheet) + Radix dialog behaviors.
// Overlays (stylebook / reset / completion / mobile sheet) all support the full
// close matrix: X button, Cancel, ESC, and click on the overlay backdrop.

// eslint-disable-next-line no-unused-vars
const app = document.getElementById('app')

// ephemeral UI state (never persisted — same as Radix dialog open state)
let openOverlay = null // 'stylebook' | 'reset' | 'completion' | 'sheet' | null
let lastSeenEvent = null
let lastOpenerFk = null

// ── render loop ──────────────────────────────────────────────────────────────
function captureFocus() {
  const el = document.activeElement
  if (!el || !app.contains(el)) return null
  const fkEl = el.closest('[data-fk]') || el
  return fkEl.getAttribute('data-fk')
}

function restoreFocus(fk) {
  if (!fk) return
  const el = app.querySelector(`[data-fk="${CSS.escape(fk)}"]`)
  if (el) { try { el.focus({ preventScroll: true }) } catch { el.focus() } }
}

function overlayHTML() {
  const state = store.state
  switch (openOverlay) {
    case 'stylebook': return stylebookHTML()
    case 'reset': return resetDialogHTML()
    case 'completion': return completionModalHTML(state)
    case 'sheet': return sheetOpenHTML(state)
    default: return ''
  }
}

function render() {
  const state = store.state
  const fk = captureFocus()
  app.innerHTML = appHTML(state)
  if (openOverlay) {
    const slot = document.getElementById('modal-slot') || app
    slot.innerHTML = overlayHTML()
    // focus the close affordance (Radix focuses the dialog; we focus its X)
    const closeBtn = slot.querySelector('.modal-close, .sheet-close')
    if (closeBtn && !fk) closeBtn.focus()
  }
  document.body.classList.toggle('no-scroll', !!openOverlay)
  restoreFocus(fk)

  // wire ticker flash — only when the message actually changed (mirrors the
  // original's effect keyed on lastEvent, 900 ms red flash)
  if (state.lastEvent !== lastSeenEvent) {
    lastSeenEvent = state.lastEvent
    const ticker = document.querySelector('[data-ticker]')
    if (ticker) {
      requestAnimationFrame(() => {
        ticker.classList.add('ticker-flash')
        setTimeout(() => ticker.classList.remove('ticker-flash'), 900)
      })
    }
    const live = document.getElementById('live-region')
    if (live && state.phase === 'desk') live.textContent = state.lastEvent
  }
}

function openModal(name) {
  lastOpenerFk = captureFocus()
  openOverlay = name
  render()
  const slot = document.getElementById('modal-slot') || app
  const closeBtn = slot.querySelector('.modal-close, .sheet-close')
  if (closeBtn) closeBtn.focus()
}
function closeModal() {
  openOverlay = null
  render()
  if (lastOpenerFk) {
    const el = app.querySelector(`[data-fk="${CSS.escape(lastOpenerFk)}"]`)
    if (el) el.focus()
    lastOpenerFk = null
  }
}

// ── event dispatch ───────────────────────────────────────────────────────────
function dispatch(ds) {
  const st = store.state
  const A = actions
  switch (ds.action) {
    case 'set-mode': return A.setMode(ds.mode)
    case 'enter-desk': return A.setPhase('desk')
    case 'set-section': return A.setSection(ds.section)

    case 'open-stylebook': return openModal('stylebook')
    case 'open-reset': return openModal('reset')
    case 'open-completion': A.setCompletionSeen(); return openModal('completion')
    case 'close-overlay': return closeModal()
    case 'confirm-reset': A.resetLab(); openOverlay = null; return render()
    case 'open-sheet': return openModal('sheet')

    case 'check-obj': return A.checkObjective(ds.obj)
    case 'hint': return A.useHint(ds.obj)

    case 'cycle-pick': {
      if (!st.cycleOrder.includes(ds.step)) A.setCycleOrder([...st.cycleOrder, ds.step])
      return
    }
    case 'cycle-clear': return A.setCycleOrder([])
    case 'open-story': return A.setOpenStory(st.openStory === ds.story ? null : ds.story)
    case 'toggle-stale': return A.toggleStaleFlag(ds.story)
    case 'add-queue': return A.addToQueue(ds.story)
    case 'remove-queue': return A.removeFromQueue(ds.story)
    case 'move-queue': return A.moveQueue(ds.story, Number(ds.dir))
    case 'toggle-reason': return A.toggleQueueReason(ds.reason)
    case 'click-stale': {
      if (!st.staleOrder.includes(ds.story)) A.setStaleOrder([...st.staleOrder, ds.story])
      return
    }
    case 'clear-order': return A.setStaleOrder([])

    case 'toggle-exec': return A.toggleExecCard(ds.card)
    case 'set-metric-bin': return A.setMetricBin(ds.chip, ds.bin)
    case 'clear-metric': return A.clearMetricBin(ds.chip)
    case 'toggle-critique': return A.toggleCritique(ds.sentence)
    case 'publish-capstone': return A.publishCapstone()

    case 'set-sla': return A.setSla(ds.tier, Number(ds.days))
    case 'add-milestone': return A.addToMilestones(ds.milestone)
    case 'remove-milestone': return A.removeFromMilestones(ds.milestone)
    case 'move-milestone': return A.moveMilestone(ds.milestone, Number(ds.dir))
    case 'add-escalation': return A.addEscalation(ds.step)
    case 'reset-escalation': return A.resetEscalation()

    case 'set-review-update': return A.setReviewUpdate(ds.ctl, ds.update)
    case 'run-verification': return A.runVerification()
    case 'toggle-buyin': return A.toggleBuyIn(ds.buyin)
    case 'set-framing': return A.setFraming(ds.framing)

    case 'quiz-pick': {
      if (!st.mode) return
      const bank = quizBank(st.mode)
      const q = bank[st.quizIndex]
      if (!q || st.quizAnswers[q.id] !== undefined) return
      return A.setQuizAnswer(q.id, Number(ds.index))
    }
    case 'quiz-next': return A.nextQuiz()
    default: return
  }
}

// select change events (native <select> keeps keyboard & mobile UX identical)
const CHANGE_HANDLERS = {
  'set-triage': ds => actions.setTriage('W-01', ds.field, ds.value),
  'set-card': ds => actions.setCardAssign(ds.card, ds.value),
  'set-report-type': ds => actions.setReportType(ds.purpose, ds.value),
  'set-comm': ds => actions.setComm(ds.comm, ds.field, ds.value),
  'set-milestone-day': ds => actions.setMilestoneDay(ds.milestone, Number(ds.value)),
  'set-review-class': ds => actions.setReviewClass(ds.ctl, ds.value),
  'set-participation': ds => actions.setParticipation(ds.role, ds.value),
  'set-register': ds => actions.setRegister(ds.risk, ds.value),
}

function onClick(e) {
  // overlay backdrop click closes (click on the overlay itself, not children)
  if (e.target.dataset && e.target.dataset.overlay && openOverlay) { closeModal(); return }
  const el = e.target.closest('[data-action]')
  if (!el || el.disabled) return
  const ds = { ...el.dataset, action: el.dataset.action }
  dispatch(ds)
}

function onChange(e) {
  const el = e.target
  if (!el || !el.dataset || !el.dataset.action) return
  const handler = CHANGE_HANDLERS[el.dataset.action]
  if (handler) handler({ ...el.dataset, value: el.value })
}

function onKeydown(e) {
  if (e.key === 'Escape' && openOverlay) { closeModal(); return }
  quizOptionKeyHandler(e)
}

// ── boot ─────────────────────────────────────────────────────────────────────
function boot() {
  document.addEventListener('click', onClick)
  document.addEventListener('change', onChange)
  document.addEventListener('keydown', onKeydown)
  store.subscribe(render)

  // splash first (like the original's hydration screen), then load + render
  app.innerHTML = splashHTML()
  requestAnimationFrame(() => {
    store.load()
    render()
  })
}

boot()
