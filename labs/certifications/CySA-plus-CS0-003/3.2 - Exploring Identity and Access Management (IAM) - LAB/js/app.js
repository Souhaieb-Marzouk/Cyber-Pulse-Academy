// ─── The Access Bureau — bootstrap, chrome, tab router, dialogs ──────────────
// Ported from IAMLab.tsx (root orchestrator). No site nav, no footer (spec D4).

(function () {
  'use strict'

  var el = Bureau.el
  var icon = Bureau.icon

  var DESKS = [
    { id: 'manual', label: 'Field Manual', icon: 'BookOpen' },
    { id: 'identity', label: 'Identity Desk', icon: 'IdCard' },
    { id: 'auth', label: 'Authentication', icon: 'KeyRound' },
    { id: 'access', label: 'Access Desk', icon: 'ShieldCheck' },
    { id: 'audit', label: 'Audit Desk', icon: 'ScrollText' },
    { id: 'federation', label: 'Wire Room', icon: 'Cable' },
    { id: 'exam', label: 'Final Exam', icon: 'GraduationCap' },
    { id: 'debrief', label: 'Debrief', icon: 'ClipboardCheck' },
  ]

  var currentTab = 'manual'
  var prevMode = undefined
  var railQueue = null
  var sheet = null // open Sheet instance { close, queue }

  // ── renderers ────────────────────────────────────────────────────────────────
  function deskRenderer(id) {
    switch (id) {
      case 'manual': return BureauDesks.FieldManual()
      case 'identity': return BureauDesks.IdentityDesk()
      case 'auth': return BureauDesks.AuthDesk()
      case 'access': return BureauDesks.AccessDesk()
      case 'audit': return BureauDesks.AuditDesk()
      case 'federation': return BureauDesks.FederationDesk()
      case 'exam': return BureauQuiz.FinalExam()
      case 'debrief': return BureauSections.Debrief()
      default: return el('div', {})
    }
  }

  function goto(desk) {
    currentTab = desk
    if (sheet) { var s = sheet; sheet = null; s.close() }
    var lab = document.getElementById('bureau-lab')
    if (lab) {
      paintTabs()
      paintPanel()
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function setTab(id) {
    currentTab = id
    paintTabs()
    paintPanel()
  }

  function paintPanel() {
    var panel = document.getElementById('desk-panel')
    if (!panel) return
    panel.innerHTML = ''
    panel.appendChild(deskRenderer(currentTab))
  }

  function paintTabs() {
    var s = LabStore.getState()
    var mode = s.mode
    if (!mode) return
    var doneInfo = BureauChecks.ticketsDone(mode, s.tickets)
    var examUnlocked = doneInfo.done === doneInfo.total
    var debriefUnlocked = s.quizSubmitted
    var list = document.getElementById('desk-tablist')
    if (!list) return
    DESKS.forEach(function (d) {
      var btn = list.querySelector('[data-desk="' + d.id + '"]')
      if (!btn) return
      var locked = d.id === 'exam' ? !examUnlocked : d.id === 'debrief' ? !debriefUnlocked : false
      btn.disabled = locked
      btn.title = locked
        ? (d.id === 'exam' ? 'Stamp every ticket to unlock' : 'Stamp the exam to unlock')
        : d.label
      btn.setAttribute('aria-selected', currentTab === d.id ? 'true' : 'false')
      btn.classList.toggle('is-active', currentTab === d.id)
      btn.querySelector('.tab-icon').innerHTML = locked ? icon('Lock', 14) : icon(d.icon, 16)
      btn.tabIndex = currentTab === d.id ? 0 : -1
    })
  }

  function paintCounter() {
    var s = LabStore.getState()
    var mode = s.mode
    if (!mode) return
    var info = BureauChecks.ticketsDone(mode, s.tickets)
    var counter = document.getElementById('tickets-count')
    if (counter) {
      counter.innerHTML = 'TICKETS <span class="count-red">' + info.done + '/' + info.total + '</span>'
    }
    var resultsBtn = document.getElementById('results-btn')
    if (resultsBtn) resultsBtn.classList.toggle('hidden', !s.quizSubmitted)
  }

  // ── lab shell ────────────────────────────────────────────────────────────────
  function renderLab(root) {
    var s = LabStore.getState()
    var mode = s.mode

    // header
    var badge = el('span', { class: 'posting-badge font-mono', text: mode === 'medium' ? 'Posting: Analyst · Medium' : 'Posting: Lead Investigator · Hard' })

    var counter = el('p', { id: 'tickets-count', class: 'tickets-count font-mono', 'aria-live': 'polite' })

    var ticketsBtn = Bureau.btn('outline', 'sm', 'h44 header-btn lg-hidden',
      icon('LayoutList', 16, 'mr-icon') + '<span>Tickets</span>',
      { 'aria-label': 'Open ticket queue' })
    ticketsBtn.addEventListener('click', function () { openTicketsSheet() })

    var glossaryBtn = Bureau.btn('outline', 'sm', 'h44 header-btn',
      '<span>Glossary</span>', { 'aria-label': 'Open glossary' })
    glossaryBtn.addEventListener('click', function () { openGlossary() })

    var resultsBtn = Bureau.btn('outline', 'sm', 'h44 header-btn results-btn' + (s.quizSubmitted ? '' : ' hidden'),
      '<span>Results</span>')
    resultsBtn.id = 'results-btn'
    resultsBtn.addEventListener('click', function () {
      BureauQuiz.openResultsModal()
    })

    var resetBtn = Bureau.btn('outline', 'sm', 'h44 header-btn reset-btn',
      icon('RotateCcw', 14, 'mr-icon') + '<span>Reset</span>')
    resetBtn.addEventListener('click', function () { openResetAlert() })

    var header = el('header', { class: 'bureau-header' },
      el('div', { class: 'bureau-header-inner' },
        el('div', { class: 'brand' },
          el('span', { class: 'brand-seal', html: icon('Landmark', 20) }),
          el('div', { class: 'brand-text' },
            el('p', { class: 'brand-name font-serif', text: 'THE ACCESS BUREAU' }),
            el('p', { class: 'brand-sub font-mono', text: 'CySA+ CS0-003 · 3.2 IAM · ' + ORG.name }))),
        badge,
        el('div', { class: 'header-actions' },
          counter, ticketsBtn, glossaryBtn, resultsBtn, resetBtn)))

    // main grid
    var railInner = el('div', { class: 'rail-inner ledger-scroll' },
      el('h2', { class: 'rail-title font-serif', text: 'Ticket queue' }))
    railQueue = BureauSections.TicketQueue(goto)
    railInner.appendChild(railQueue)
    var rail = el('aside', { class: 'rail' }, railInner)

    var tablist = el('div', { id: 'desk-tablist', class: 'tabs-list ledger-scroll', role: 'tablist', 'aria-label': 'Bureau desks' })
    DESKS.forEach(function (d) {
      var t = el('button', {
        type: 'button', role: 'tab', 'data-desk': d.id,
        class: 'tab font-serif', id: 'tab-' + d.id,
        'aria-controls': 'desk-panel', tabindex: '-1',
      },
        el('span', { class: 'tab-icon', html: icon(d.icon, 16), 'aria-hidden': 'true' }),
        el('span', { class: 'tab-label', text: d.label }))
      t.addEventListener('click', function () { if (!t.disabled) setTab(d.id) })
      tablist.appendChild(t)
    })
    tablist.addEventListener('keydown', function (e) {
      var enabled = DESKS.filter(function (d) {
        var btn = tablist.querySelector('[data-desk="' + d.id + '"]')
        return btn && !btn.disabled
      })
      var cur = enabled.findIndex(function (d) { return d.id === currentTab })
      if (cur < 0) return
      var next = null
      if (e.key === 'ArrowRight') next = enabled[(cur + 1) % enabled.length]
      else if (e.key === 'ArrowLeft') next = enabled[(cur - 1 + enabled.length) % enabled.length]
      else if (e.key === 'Home') next = enabled[0]
      else if (e.key === 'End') next = enabled[enabled.length - 1]
      if (next) {
        e.preventDefault()
        setTab(next.id)
        var btn = tablist.querySelector('[data-desk="' + next.id + '"]')
        if (btn) btn.focus()
      }
    })

    var panel = el('div', { id: 'desk-panel', class: 'desk-panel', role: 'tabpanel', 'aria-live': 'off' })

    var lab = el('div', { id: 'bureau-lab', class: 'bureau-shell' },
      header,
      el('main', { class: 'bureau-main' },
        el('div', { class: 'bureau-grid' },
          rail,
          el('div', { class: 'desk-col' }, tablist, panel))))

    root.appendChild(lab)
    paintTabs()
    paintPanel()
    paintCounter()
  }

  function renderIntake(root) {
    root.appendChild(BureauSections.ModeSelect())
  }

  function renderApp() {
    Bureau.closeAllOverlays() // dialogs/sheets must not survive a structural re-render
    sheet = null
    var rootEl = document.getElementById('root')
    rootEl.innerHTML = ''
    railQueue = null
    var s = LabStore.getState()
    if (!s.mode) renderIntake(rootEl)
    else renderLab(rootEl)
    prevMode = s.mode
  }

  // ── dialogs ──────────────────────────────────────────────────────────────────
  function openGlossary() {
    var dl = el('dl', { class: 'glossary-dl' })
    GLOSSARY.forEach(function (g) {
      dl.appendChild(el('div', { class: 'g-item' },
        el('dt', { class: 'font-serif', text: g.term }),
        el('dd', { text: g.def })))
    })
    Bureau.openModal({
      variant: 'dialog',
      contentClass: 'glossary-modal',
      title: el('p', { class: 'glossary-title font-serif', text: 'Glossary of the Bureau' }),
      description: el('p', { class: 'glossary-desc', text: 'Fifteen terms, one line each.' }),
      content: el('div', { class: 'glossary-scroll ledger-scroll' }, dl),
    })
  }

  function openResetAlert() {
    var cancelBtn = Bureau.btn('outline', null, 'h44', '<span>Keep working</span>')
    var confirmBtn = Bureau.btn('default', null, 'h44 btn-reset', '<span>RESET THE BUREAU</span>')
    var footer = el('div', { class: 'modal-footer' }, cancelBtn, confirmBtn)
    cancelBtn.addEventListener('click', function () {
      // AlertDialog closes on Escape (no X button), like the original
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    })
    confirmBtn.addEventListener('click', function () {
      LabStore.resetLab() // mode → null → the subscriber re-renders the intake
    })
    Bureau.openModal({
      variant: 'alert',
      contentClass: 'reset-modal',
      title: el('p', { class: 'reset-title font-serif', text: 'Clear the Bureau and return to intake?' }),
      description: el('p', { class: 'reset-desc', text: 'This restores the pristine state: mode choice, ticket stamps, hints, quiz results and every desk setting will be wiped. This cannot be undone.' }),
      content: footer,
      onClose: function () { /* canceled or confirmed — nothing else to do */ },
    })
  }

  function closeTopModal() {
    var overlays = document.querySelectorAll('.modal-overlay')
    if (!overlays.length) return
    var overlay = overlays[overlays.length - 1]
    var x = overlay.querySelector('.modal-close')
    if (x) x.click()
    else {
      // AlertDialog has no X: simulate Escape
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    }
  }
  // (kept for parity tooling; the reset dialog closes via its own footer buttons)

  function openTicketsSheet() {
    var queue = BureauSections.TicketQueue(function (desk) {
      goto(desk) // goto closes the sheet
    })
    var title = el('p', { class: 'sheet-title font-serif', text: 'TICKET QUEUE' })
    var desc = el('p', { class: 'sr-only', text: 'Learning objectives for the current posting, with hints and desk navigation.' })
    var inst = Bureau.openSheet({ title: title, description: desc, content: queue, onClose: function () { sheet = null } })
    inst.queue = queue
    sheet = inst
  }

  // ── single subscriber: fine-grained updates (no focus loss) ─────────────────
  function updateFromState() {
    var s = LabStore.getState()
    if (s.mode !== prevMode) {
      // intake ↔ lab (mode set, or RESET) → structural re-render
      renderApp()
      prevQuizSubmitted = s.quizSubmitted
      return
    }
    if (!s.mode) return
    paintCounter()
    paintTabs()
    if (railQueue) railQueue.render()
    if (sheet && sheet.queue) sheet.queue.render()
    // exam submission swaps the form for the stamped review (React re-render parity)
    if (s.quizSubmitted !== prevQuizSubmitted) {
      prevQuizSubmitted = s.quizSubmitted
      if (currentTab === 'exam') paintPanel()
    }
    // auto-present the completion modal once when the exam is stamped (C7)
    if (s.quizSubmitted && !s.resultsSeen) {
      BureauQuiz.openResultsModal() // its onClose marks resultsSeen
    }
  }
  var prevQuizSubmitted = false

  // ── boot ─────────────────────────────────────────────────────────────────────
  function boot() {
    renderApp()
    LabStore.subscribe(updateFromState)
    updateFromState() // restored-run effects (e.g. un-seen results modal re-presents)
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot)
  } else {
    boot()
  }
})()
