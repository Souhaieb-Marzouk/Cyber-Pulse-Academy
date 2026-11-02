// ── SIGNALWATCH · state store (js/state.js) ─────────────────────────────────
// 1:1 static port of src/components/signal-watch/store.ts (zustand + persist
// → plain JS store with subscribe/notify). Same persistence key, same saved
// shape ({ state, version }), same partialize/migrate/RESET semantics.

const STORAGE_KEY = 'signalwatch-cysa102-v2'
const STORAGE_VERSION = 2

function storageGet(name) {
  try { return localStorage.getItem(name) } catch { return null }
}
function storageSet(name, value) {
  try { localStorage.setItem(name, value) } catch { /* storage unavailable — session-only mode */ }
}
function storageRemove(name) {
  try { localStorage.removeItem(name) } catch { /* noop */ }
}

function freshEnv() {
  return {
    answers: {},
    selects: {},
    mailFlags: [],
    dnsProps: [],
    flowTriage: {},
    ruleInterval: '',
    ruleMin: '',
    ruleHost: '',
    actionsOn: [],
    atkTyped: {},
    chainOrder: [...CHAIN_START],
    alertCls: {},
    summarySel: [],
  }
}

function freshObj() {
  return {}
}

function freshState() {
  return {
    started: false,
    mode: null,
    channel: 'brief',
    obj: freshObj(),
    env: freshEnv(),
    quizAnswers: {},
    quizChecked: {},
    quizStep: 0,
    quizDone: false,
    completionSeen: false,
    openedMail: null,
    highlight: null,
    storageAvailable: true,
  }
}

// ── persistence: same JSON envelope as zustand persist ──────────────────────
function loadPersisted() {
  const raw = storageGet(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    let version = typeof parsed?.version === 'number' ? parsed.version : 0
    let p = parsed?.state ?? {}
    if (version < STORAGE_VERSION) {
      // migrate: answers checked under the old single-submit quiz are invalid
      p = { ...p, quizChecked: {}, quizStep: 0, quizAnswers: {}, quizDone: false }
    }
    return p
  } catch {
    return null
  }
}

function persist(state) {
  // partialize — identical field set to the original
  const partial = {
    started: state.started,
    mode: state.mode,
    channel: state.channel,
    obj: state.obj,
    env: state.env,
    quizAnswers: state.quizAnswers,
    quizChecked: state.quizChecked,
    quizStep: state.quizStep,
    quizDone: state.quizDone,
    completionSeen: state.completionSeen,
    openedMail: state.openedMail,
  }
  storageSet(STORAGE_KEY, JSON.stringify({ state: partial, version: STORAGE_VERSION }))
}

// ── store ───────────────────────────────────────────────────────────────────
const listeners = new Set()

const lab = freshState()

// hydrate from localStorage (shallow merge, like zustand persist)
{
  const p = loadPersisted()
  if (p) Object.assign(lab, p)
  // probe storage availability once (parity with safeStorage behavior)
  try { localStorage.setItem(STORAGE_KEY + ':probe', '1'); localStorage.removeItem(STORAGE_KEY + ':probe') } catch { lab.storageAvailable = false }
}

function emit(silent = false) {
  persist(lab)
  if (silent) return
  for (const fn of listeners) fn()
}

/**
 * Subscribe to store changes. Returns an unsubscribe function.
 */
function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

// ── actions (same contracts as the original store) ─────────────────────────
const actions = {
  start(m) {
    if (lab.started && lab.mode === m) return
    Object.assign(lab, {
      started: true,
      mode: m,
      channel: 'brief',
      obj: freshObj(),
      env: freshEnv(),
      quizAnswers: {},
      quizChecked: {},
      quizStep: 0,
      quizDone: false,
      completionSeen: false,
    })
    emit()
  },
  setChannel(c) {
    lab.channel = c
    emit()
  },
  setHighlight(h) {
    lab.highlight = h
    emit()
  },
  openMail(id) {
    lab.openedMail = id
    emit()
  },

  /** silent=true persists without notifying (text inputs / selects keep focus,
   *  matching the original's granular React updates) */
  setAnswer(key, v, silent = false) {
    lab.env = { ...lab.env, answers: { ...lab.env.answers, [key]: v } }
    emit(silent)
  },
  setSelect(key, v, silent = false) {
    lab.env = { ...lab.env, selects: { ...lab.env.selects, [key]: v } }
    emit(silent)
  },
  toggleIn(list, id) {
    const cur = lab.env[list]
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
    lab.env = { ...lab.env, [list]: next }
    emit()
  },
  setFlowTriage(id, v) {
    lab.env = { ...lab.env, flowTriage: { ...lab.env.flowTriage, [id]: v } }
    emit()
  },
  setAlertCls(id, v) {
    lab.env = { ...lab.env, alertCls: { ...lab.env.alertCls, [id]: v } }
    emit()
  },
  setRule(k, v) {
    lab.env = { ...lab.env, [k]: v }
    emit()
  },

  toggleAction(id) {
    const on = lab.env.actionsOn
    const next = on.includes(id) ? on.filter((x) => x !== id) : [...on, id]
    lab.env = { ...lab.env, actionsOn: next }
    emit()
  },

  setAtkTyped(key, v, silent = false) {
    lab.env = { ...lab.env, atkTyped: { ...lab.env.atkTyped, [key]: v } }
    emit(silent)
  },
  toggleAttackChip(key, tid) {
    lab.env = { ...lab.env, atkTyped: { ...lab.env.atkTyped, [key]: lab.env.atkTyped[key] === tid ? '' : tid } }
    emit()
  },

  moveChain(id, dir) {
    const arr = [...lab.env.chainOrder]
    const i = arr.indexOf(id)
    const j = i + dir
    if (i < 0 || j < 0 || j >= arr.length) return
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
    lab.env = { ...lab.env, chainOrder: arr }
    emit()
  },

  requestHint(objId) {
    const cur = lab.obj[objId] ?? { attempts: 0, hints: 0, solved: false, lastPass: false }
    if (cur.hints >= 3) return
    lab.obj = { ...lab.obj, [objId]: { ...cur, hints: cur.hints + 1 } }
    emit()
  },

  check(objId) {
    const def = (lab.mode ? OBJECTIVES[lab.mode] : []).find((o) => o.id === objId)
    if (!def) return { pass: false, feedback: 'Unknown dispatch.' }
    const res = def.validate(lab.env)
    const cur = lab.obj[objId] ?? { attempts: 0, hints: 0, solved: false, lastPass: false }
    lab.obj = {
      ...lab.obj,
      [objId]: { attempts: cur.attempts + 1, hints: cur.hints, solved: cur.solved || res.pass, lastPass: res.pass },
    }
    emit()
    return res
  },

  setQuizAnswer(qid, idx) {
    if (lab.quizChecked[qid] || lab.quizDone) return
    lab.quizAnswers = { ...lab.quizAnswers, [qid]: idx }
    emit()
  },
  // validates the exercise for one question: locks the chosen answer (R2)
  checkQuiz(qid) {
    if (lab.quizAnswers[qid] === undefined || lab.quizDone) return
    lab.quizChecked = { ...lab.quizChecked, [qid]: true }
    emit()
  },
  // mandatory progression: only way to the next question (R2)
  nextQuiz() {
    lab.quizStep = lab.quizStep + 1
    emit()
  },
  finishQuiz() {
    lab.quizDone = true
    emit()
  },
  resetQuiz() {
    lab.quizAnswers = {}
    lab.quizChecked = {}
    lab.quizStep = 0
    lab.quizDone = false
    emit()
  },
  markCompletionSeen() {
    lab.completionSeen = true
    emit()
  },

  resetAll() {
    Object.assign(lab, freshState(), { storageAvailable: lab.storageAvailable })
    emit()
  },
}

// ── derived selectors/helpers (1:1 from store.ts) ───────────────────────────
function objectiveList(mode) {
  return mode ? OBJECTIVES[mode] : []
}

function progress(mode, obj) {
  const list = objectiveList(mode)
  const solvedIds = list.filter((o) => obj[o.id]?.solved).map((o) => o.id)
  const firstAttempt = solvedIds.filter((id) => (obj[id]?.attempts ?? 0) <= 1 && (obj[id]?.hints ?? 0) === 0).length
  const hintsUsed = solvedIds.reduce((acc, id) => acc + (obj[id]?.hints ?? 0), 0)
  const retried = solvedIds.filter((id) => (obj[id]?.attempts ?? 0) > 1).length
  return {
    total: list.length,
    solved: solvedIds.length,
    accuracy: solvedIds.length ? Math.round((firstAttempt / solvedIds.length) * 100) : 100,
    hintsUsed,
    retried,
    solvedIds,
  }
}

function starRating(mode, obj) {
  const p = progress(mode, obj)
  if (p.total === 0 || p.solved !== p.total) return { stars: 0, note: '' }
  const penalty = 0.5 * p.retried + 0.5 * (p.hintsUsed > 0 ? 1 : 0)
  const raw = Math.max(1, 5 - penalty)
  const stars = Math.round(raw * 2) / 2
  const note =
    stars >= 5
      ? 'Flawless watch: every dispatch cleared first try, no hints.'
      : stars >= 4
        ? 'Excellent watch — minor retries or a single hint.'
        : stars >= 3
          ? 'Solid watch — several dispatches needed a second pass.'
          : 'Watch completed — revisit the debrief to lock the concepts in.'
  return { stars, note }
}

function ruleSignature(env) {
  return evaluateRule(env.ruleInterval, env.ruleMin, env.ruleHost)
}

// focus-area derivation for the completion report (R8): uses real evidence
function focusAreas(mode, obj, quizAnswers) {
  const list = objectiveList(mode)
  const areas = []
  const retried = list.filter((o) => (obj[o.id]?.attempts ?? 0) > 1 && obj[o.id]?.solved)
  const hinted = list.filter((o) => (obj[o.id]?.hints ?? 0) > 0 && obj[o.id]?.solved)
  for (const o of retried) {
    areas.push({
      label: o.title,
      detail: `Cleared on attempt ${(obj[o.id]?.attempts ?? 0)} — re-run this workset once from scratch (module: ${o.pointTo.toUpperCase()}) until the first cross-check passes.`,
    })
  }
  for (const o of hinted) {
    if (!retried.includes(o))
      areas.push({
        label: o.title,
        detail: `Needed a hint — re-read the anchor "${o.anchor}" and redo the module (${o.pointTo.toUpperCase()}) without hints.`,
      })
  }
  const quiz = mode ? QUIZ[mode] : []
  const wrong = quiz.filter((q) => quizAnswers[q.id] !== undefined && quizAnswers[q.id] !== q.answer)
  const QUIZ_TOPIC = {
    q1: 'beaconing vs benign periodic traffic (T1071.001)',
    q2: 'email header analysis — envelope vs display sender',
    q3: 'DNS tunneling signature (T1071.004)',
    q4: 'administrative CLI dual-use and context',
    q5: 'data-source selection per indicator (obj 1.3)',
    q6: 'baseline judgment / true vs false positives',
    hq1: 'flow-triage interpretation with stacked indicators',
    hq2: 'email header evidence ranking',
    hq3: 'detection logic precision for DNS tunneling',
    hq4: 'containment that preserves forensic evidence',
    hq5: 'baseline adjudication of interval alerts',
    hq6: 'disruption vs evidence preservation trade-offs',
    hq7: 'what proves exfiltration vs compromise',
  }
  for (const q of wrong) {
    areas.push({
      label: `Knowledge check: ${QUIZ_TOPIC[q.id] ?? q.id}`,
      detail: 'Retake the knowledge check and re-read the debrief detection notes for this topic.',
    })
  }
  return areas.slice(0, 5)
}

function quizGateOpen(mode, obj) {
  const p = progress(mode, obj)
  if (!mode) return false
  return mode === 'medium' ? p.solved >= 7 : p.solved >= 5
}

function debriefOpen(mode, obj, quizDone) {
  const p = progress(mode, obj)
  return (p.total > 0 && p.solved === p.total) || quizDone
}
