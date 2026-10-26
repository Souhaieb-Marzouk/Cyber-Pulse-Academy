// ── THE VULN BULLETIN ── state + persistence + pub/sub ───────────────────────
// Static 1:1 port of src/lib/lab/store.ts (zustand + persist).
// - Same storage key: 'vuln-bulletin-lab-v1'
// - Same envelope format as zustand persist: { state: {...}, version: 0 }
//   (so saved progress is interchangeable with the original app on the same origin)
// - Same save / resume / reset semantics; graceful in-memory fallback when
//   localStorage is unavailable (private mode, blocked storage, file:// quirks).

const STORAGE_KEY = 'vuln-bulletin-lab-v1'

// safe storage wrapper — never throws
function storageGet(key) {
  try { return window.localStorage.getItem(key) } catch { return null }
}
function storageSet(key, value) {
  try { window.localStorage.setItem(key, value) } catch { /* degraded: in-memory only */ }
}

function defaultState() {
  return {
    // meta
    mode: null,
    phase: 'mode',          // 'mode' | 'briefing' | 'desk'
    section: 'front',
    // objective machinery
    checks: {},
    hintLevel: {},
    // environment state
    cycleOrder: [],
    openStory: null,
    triage: {},
    cardAssign: {},
    execCards: [],
    metricSort: { quantitative: [], qualitative: [] },
    reportTypeMatch: {},
    sla: { critical: null, high: null, medium: null, low: null },
    comms: Object.fromEntries(COMMS.map(c => [c.id, {}])),
    staleFlags: [],
    staleOrder: [],
    queue: [],
    queueReasons: [],
    reviewClass: Object.fromEntries(CONTROLS.map(c => [c.id, ''])),
    reviewUpdates: {},
    reviewVerified: false,
    participation: {},
    buyIn: [],
    framing: null,
    register: {},
    milestoneOrder: [],
    milestoneDays: {},
    escalation: [],
    critique: [],
    capstonePublished: false,
    // quiz
    quizAnswers: {},
    quizIndex: 0,
    quizDone: false,
    // ui
    completionSeen: false,
    lastEvent: 'Wire is quiet. Pick an assignment to begin.',
  }
}

// ── store core ───────────────────────────────────────────────────────────────
const store = {
  state: defaultState(),
  listeners: [],
  subscribe(fn) { this.listeners.push(fn) },
  notify() {
    this.save()
    this.listeners.forEach(fn => fn())
  },
  save() {
    const { /* hydrated not used in static */ ...rest } = this.state
    storageSet(STORAGE_KEY, JSON.stringify({ state: rest, version: 0 }))
  },
  load() {
    const raw = storageGet(STORAGE_KEY)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw)
      const persisted = parsed && typeof parsed === 'object' && parsed.state ? parsed.state : parsed
      if (!persisted || typeof persisted !== 'object') return
      const base = defaultState()
      // shallow merge, only known keys (same as zustand persist rehydrate)
      for (const k of Object.keys(base)) {
        if (k in persisted && persisted[k] !== undefined && persisted[k] !== null) {
          // restore objects/arrays wholesale; scalars directly
          base[k] = persisted[k]
        }
      }
      this.state = base
    } catch { /* corrupt save → pristine */ }
  },
  patch(partial) {
    this.state = { ...this.state, ...partial }
    this.notify()
  },
}

// ── actions (mirror LabActions 1:1) ─────────────────────────────────────────
const actions = {
  setMode(m) { store.patch({ mode: m, phase: 'briefing', section: 'front' }) },
  setPhase(p) { store.patch({ phase: p }) },
  setSection(s) { store.patch({ section: s }) },

  setCycleOrder(v) { store.patch({ cycleOrder: v }) },
  setOpenStory(v) { store.patch({ openStory: v }) },
  setTriage(story, field, v) {
    const t = { ...store.state.triage }
    t[story] = { ...t[story], [field]: v }
    store.patch({ triage: t })
  },
  setCardAssign(card, stakeholder) {
    store.patch({ cardAssign: { ...store.state.cardAssign, [card]: stakeholder } })
  },
  toggleExecCard(card) {
    const cur = store.state.execCards
    const next = cur.includes(card)
      ? cur.filter(c => c !== card)
      : cur.length >= 3 ? cur : [...cur, card]
    store.patch({ execCards: next })
  },
  setMetricBin(chip, bin) {
    const cur = {
      quantitative: store.state.metricSort.quantitative.filter(c => c !== chip),
      qualitative: store.state.metricSort.qualitative.filter(c => c !== chip),
    }
    cur[bin] = [...cur[bin], chip]
    store.patch({ metricSort: cur })
  },
  clearMetricBin(chip) {
    store.patch({
      metricSort: {
        quantitative: store.state.metricSort.quantitative.filter(c => c !== chip),
        qualitative: store.state.metricSort.qualitative.filter(c => c !== chip),
      },
    })
  },
  setReportType(purpose, report) {
    store.patch({ reportTypeMatch: { ...store.state.reportTypeMatch, [purpose]: report } })
  },
  setSla(tier, days) { store.patch({ sla: { ...store.state.sla, [tier]: days } }) },
  setComm(id, field, v) {
    const comms = { ...store.state.comms }
    comms[id] = { ...comms[id], [field]: v }
    store.patch({ comms })
  },
  toggleStaleFlag(story) {
    const f = store.state.staleFlags
    store.patch({ staleFlags: f.includes(story) ? f.filter(x => x !== story) : [...f, story] })
  },
  setStaleOrder(v) { store.patch({ staleOrder: v }) },
  addToQueue(story) {
    const q = store.state.queue
    if (q.includes(story) || q.length >= 3) return store.notify() // no-op state change, still persist-safe
    store.patch({ queue: [...q, story] })
  },
  removeFromQueue(story) { store.patch({ queue: store.state.queue.filter(q => q !== story) }) },
  moveQueue(story, dir) {
    const q = [...store.state.queue]
    const i = q.indexOf(story)
    const j = i + dir
    if (i < 0 || j < 0 || j >= q.length) return
    ;[q[i], q[j]] = [q[j], q[i]]
    store.patch({ queue: q })
  },
  toggleQueueReason(reason) {
    const r = store.state.queueReasons
    store.patch({
      queueReasons: r.includes(reason) ? r.filter(x => x !== reason) : r.length >= 2 ? r : [...r, reason],
    })
  },
  setReviewClass(ctl, v) { store.patch({ reviewClass: { ...store.state.reviewClass, [ctl]: v } }) },
  setReviewUpdate(ctl, v) { store.patch({ reviewUpdates: { ...store.state.reviewUpdates, [ctl]: v } }) },
  runVerification() {
    store.patch({ reviewVerified: true, lastEvent: 'Simulated verification run complete — see the Board Room result card.' })
  },
  setParticipation(role, v) { store.patch({ participation: { ...store.state.participation, [role]: v } }) },
  toggleBuyIn(id) {
    const b = store.state.buyIn
    store.patch({ buyIn: b.includes(id) ? b.filter(x => x !== id) : b.length >= 3 ? b : [...b, id] })
  },
  setFraming(v) { store.patch({ framing: v }) },
  setRegister(risk, band) { store.patch({ register: { ...store.state.register, [risk]: band } }) },
  addToMilestones(m) {
    const o = store.state.milestoneOrder
    if (o.includes(m)) return
    store.patch({ milestoneOrder: [...o, m] })
  },
  removeFromMilestones(m) { store.patch({ milestoneOrder: store.state.milestoneOrder.filter(x => x !== m) }) },
  moveMilestone(m, dir) {
    const q = [...store.state.milestoneOrder]
    const i = q.indexOf(m)
    const j = i + dir
    if (i < 0 || j < 0 || j >= q.length) return
    ;[q[i], q[j]] = [q[j], q[i]]
    store.patch({ milestoneOrder: q })
  },
  setMilestoneDay(m, day) { store.patch({ milestoneDays: { ...store.state.milestoneDays, [m]: day } }) },
  addEscalation(step) {
    const e = store.state.escalation
    if (e.includes(step)) return
    store.patch({ escalation: [...e, step] })
  },
  resetEscalation() { store.patch({ escalation: [] }) },
  toggleCritique(sentence) {
    const c = store.state.critique
    store.patch({ critique: c.includes(sentence) ? c.filter(x => x !== sentence) : [...c, sentence] })
  },
  publishCapstone() { store.patch({ capstonePublished: true }) },

  checkObjective(id) {
    const st = store.state
    const o = OBJECTIVES_BY_MODE(st.mode || 'medium').find(x => x.id === id)
    if (!o || st.mode === null) return
    const passed = objectiveValid(o, st)
    const prev = st.checks[id]
    const result = {
      passed,
      attempts: (prev ? prev.attempts : 0) + 1,
      firstTry: prev ? prev.firstTry : passed,
      hintsUsed: prev ? prev.hintsUsed : 0,
      lastChecked: Date.now(),
    }
    store.patch({
      checks: { ...st.checks, [id]: result },
      lastEvent: passed
        ? `✔ ${o.id.replace('OBJ-', '')} passed — ${o.title.slice(0, 60)}…`
        : `✘ ${o.id.replace('OBJ-', '')} needs another look — read the feedback note.`,
    })
  },
  useHint(id) {
    const st = store.state
    const lvl = st.hintLevel[id] || 0
    const o = OBJECTIVES_BY_MODE(st.mode || 'medium').find(x => x.id === id)
    const max = st.mode === 'medium' ? 3 : 1
    if (!o || lvl >= max) return
    // a hint consumed before first success counts against stars (same as original)
    const passed = st.checks[id] && st.checks[id].passed
    const checks = { ...st.checks }
    if (!passed) {
      const prev = st.checks[id]
      checks[id] = {
        passed: false, attempts: prev ? prev.attempts : 0, firstTry: prev ? prev.firstTry : true,
        hintsUsed: (prev ? prev.hintsUsed : 0) + 1, lastChecked: prev ? prev.lastChecked : 0,
      }
    }
    store.patch({ hintLevel: { ...st.hintLevel, [id]: lvl + 1 }, checks })
  },
  setQuizAnswer(qid, ans) { store.patch({ quizAnswers: { ...store.state.quizAnswers, [qid]: ans } }) },
  nextQuiz() {
    const st = store.state
    const total = st.mode === 'medium' ? 6 : 7
    if (st.quizIndex + 1 >= total) return store.patch({ quizDone: true })
    store.patch({ quizIndex: st.quizIndex + 1 })
  },
  setCompletionSeen() { store.patch({ completionSeen: true }) },
  note(msg) { store.patch({ lastEvent: msg }) },

  resetLab() {
    store.state = defaultState()
    store.notify()
  },
}
