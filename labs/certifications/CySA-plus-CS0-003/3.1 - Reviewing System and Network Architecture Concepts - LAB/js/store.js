// ─── CyberLab "Drafting Room" — reactive store (js/store.js) ─────────────────
// Hand port of the original lab-context.tsx: single mutable lab state,
// debounced persistence, CHECK RESULTS action, hints, pulse targeting,
// announcements (aria-live) and toasts — identical semantics and strings.

var LabStore = {
  state: null,
  results: {}, // objectiveId -> { id, pass, msg } (last check per objective)
  announcement: '',
  pulse: null, // active "where to look" pulse key
  completionOpen: false,

  _subs: new Set(),
  _pulseTimer: null,
  _saveTimer: null,
  _onExit: null, // set by app.js — returns to the mode gate

  init(state, onExit) {
    this.state = state
    this._onExit = onExit
    this.results = {}
    this.announcement = ''
    this.pulse = null
    this.completionOpen = false
  },

  subscribe(fn) {
    this._subs.add(fn)
    return () => this._subs.delete(fn)
  },

  _notify() {
    this._subs.forEach((fn) => fn(this.state))
  },

  _persistSoon() {
    clearTimeout(this._saveTimer)
    this._saveTimer = setTimeout(() => saveState(this.state), 350)
  },

  /** Core state mutation: run reducer, schedule save, notify subscribers. */
  update(fn) {
    this.state = fn(this.state)
    this._persistSoon()
    this._notify()
  },

  setAnswer(key, value) {
    this.update((s) => ({ ...s, answers: { ...s.answers, [key]: value } }))
  },

  setMulti(key, value) {
    this.update((s) => ({ ...s, multi: { ...s.multi, [key]: value } }))
  },

  openZone(zoneId) {
    this.update((s) =>
      s.zonesOpened.includes(zoneId) ? s : { ...s, zonesOpened: [...s.zonesOpened, zoneId] },
    )
  },

  setSheet(sheet) {
    this.update((s) => ({ ...s, activeSheet: sheet }))
  },

  announce(msg) {
    this.announcement = msg
    if (this._announceEl) this._announceEl.textContent = msg
  },

  /** "Where to look": ring-pulse every [data-pulse=key] panel for 2.8 s. */
  pulseTarget(key) {
    this.pulse = key
    this._notify()
    clearTimeout(this._pulseTimer)
    this._pulseTimer = setTimeout(() => {
      this.pulse = null
      this._notify()
    }, 2800)
  },

  /** CHECK RESULTS for one objective — exact port of the original semantics. */
  checkObjective(id) {
    const s = this.state
    const outcome = validateObjective(id, s)
    const prevRun = s.obj[id] ?? { done: false, attempts: 0, hintsUsed: 0, firstAttemptPass: false }
    const nextRun = {
      ...prevRun,
      attempts: prevRun.done ? prevRun.attempts : prevRun.attempts + 1,
      done: prevRun.done || outcome.pass,
      firstAttemptPass: prevRun.firstAttemptPass || (outcome.pass && prevRun.attempts === 0),
    }
    const next = { ...s, obj: { ...s.obj, [id]: nextRun } }
    this.state = next
    this.results = { ...this.results, [id]: { id, pass: outcome.pass, msg: outcome.msg } }
    this.announce(`Check result for objective ${id}: ${outcome.pass ? 'passed' : 'not yet'}. ${outcome.msg}`)
    if (outcome.pass && !prevRun.done) {
      toast({ title: `Objective ${id} complete`, description: 'Feedback recorded in the survey checklist.' })
    }
    // completion check — auto-open the sign-off modal once
    const mode = next.mode ?? 'medium'
    const allDone = objectivesFor(mode).every((o) => (next.obj[o.id] ?? { done: false }).done)
    if (allDone && !next.completionSeen) {
      this.state = { ...next, completionSeen: true }
      setTimeout(() => this.setCompletionOpen(true), 600)
    }
    this._persistSoon()
    this._notify()
  },

  /** Reveal the next hint tier (hard mode: one nudge only). */
  revealHint(id) {
    const s = this.state
    const run = s.obj[id] ?? { done: false, attempts: 0, hintsUsed: 0, firstAttemptPass: false }
    const cap = s.mode === 'hard' ? 1 : 3
    if (run.hintsUsed >= cap) return
    this.update((cur) => ({
      ...cur,
      obj: {
        ...cur.obj,
        [id]: {
          ...(cur.obj[id] ?? { done: false, attempts: 0, firstAttemptPass: false }),
          hintsUsed: run.hintsUsed + 1,
        },
      },
    }))
    this.announce(`Hint revealed for objective ${id}.`)
  },

  resetLab() {
    clearState()
    this.setCompletionOpen(false)
    if (this._onExit) this._onExit()
  },

  setCompletionOpen(open) {
    this.completionOpen = open
    this._notify()
  },
}

Object.assign(globalThis, { LabStore })
