// ===================================================================
// Building B — Service Riser · state store
// (js/state.js — plain-JS port of the original reducer + persistence)
//
// Same storage key, same version, same save/restore/RESET semantics
// as the framework lab. A tiny subscribe/notify mechanism replaces
// React's useReducer; components re-render on notify.
// ===================================================================
(function () {
  'use strict'

  const Engine = window.LabEngine

  const STORAGE_KEY = 'mcc-lab-n10009-3.7-v1'
  const STATE_VERSION = 1

  // ---------------- initial state ----------------
  function initialEnv() {
    return {
      map: {},
      recordTasks: {},
      symptoms: {},
      dhcp: {
        order: [], serverPort: '', clientPort: '',
        poolStart: '10.20.40.250', poolEnd: '10.20.40.254', gateway: '10.20.44.1', dnsServer: '10.20.40.1', domain: '',
        leaseIssued: false, leaseMsg: '',
        rogueIp: '', snooping: false, trustedPort: '',
        plan: {
          v10start: '', v10end: '', v40start: '', v40end: '',
          v10gw: '', v40gw: '', relayOn: false, relayServer: '',
          resvMac: '9c:b6:d0:11:22:33', resvIp: '', exclStart: '', exclEnd: '',
        },
      },
      slaac: { ifaceId: '', linkLocal: '', privacy: '', raOutcomes: {}, brokenRa: '' },
      dns: { records: [], walk: [], walkMode1: '', walkMode2: '', ttl: '', hardMatch: {}, tDnssec: false, tDot: false, tEgress: false },
      ntp: { server: '', aclOpen: false, stratum: '', restarted: false, syncMsg: '', strata: {}, tech: {} },
      ptp: { roles: {}, hwts: false },
      nts: { order: [], enabled: false, kePort: '', keProto: '', ntpPort: '', protects: [], notProtects: '' },
      night: { triage: {}, attackSel: {}, attackCtrl: {}, order: [], reason: '' },
    }
  }

  function initialState() {
    return {
      version: STATE_VERSION,
      mode: null,
      env: initialEnv(),
      results: {},
      quiz: {},          // quizItem id → LOCKED answer
      quizPicks: {},     // quizItem id → transient selection until locked
      quizDone: {},
      activeCircuit: 'pinboard',
      completionSeen: false,
      startedAt: Date.now(),
    }
  }

  // ---------------- store ----------------
  let state = initialState()
  let hydrated = false
  const subscribers = new Set()

  function notify() {
    subscribers.forEach((fn) => {
      try { fn(state) } catch (err) { console.error(err) }
    })
  }

  // commit(next): replace state, autosave (post-hydration), notify.
  // commit(next, { silent: true }): replace + autosave but skip notify —
  // used by text-field keystrokes (the original re-renders controlled
  // inputs without losing focus; we keep focus by simply not re-rendering).
  function commit(next, opts) {
    state = next
    if (hydrated) save()
    if (!(opts && opts.silent)) notify()
  }

  function cloneEnv(env) {
    return JSON.parse(JSON.stringify(env))
  }

  // ---------------- actions (reducer semantics, 1:1) ----------------
  function setMode(mode) {
    commit(Object.assign({}, state, { mode, activeCircuit: 'pinboard', completionSeen: false }))
  }

  function patchEnv(fn, silent) {
    const env = fn(cloneEnv(state.env))
    commit(Object.assign({}, state, { env }), { silent: silent === true })
  }

  function check(id) {
    const prev = state.results[id]
    if (prev && prev.done) return
    // double-click guard: a rapid second press must not inflate attempts (QA fix)
    if (prev && Date.now() - prev.lastCheckAt < 300) return
    const pass = Engine.checkObjective(id, state.env).pass
    const results = Object.assign({}, state.results)
    results[id] = {
      pass,
      done: pass,
      attempts: (prev && prev.attempts ? prev.attempts : 0) + 1,
      firstAttempt: prev ? prev.firstAttempt : pass,
      hints: prev ? prev.hints : 0,
      lastCheckAt: Date.now(),
    }
    commit(Object.assign({}, state, { results }))
  }

  function hint(id) {
    const prev = state.results[id]
    if (prev && prev.done) return
    let def = null
    for (const o of window.LabData.OBJECTIVES) if (o.id === id) { def = o; break }
    if (!def || def.hints.length === 0) return
    const hints = Math.min((prev && prev.hints ? prev.hints : 0) + 1, def.hints.length)
    const results = Object.assign({}, state.results)
    results[id] = {
      pass: prev ? prev.pass : false,
      done: false,
      attempts: prev ? prev.attempts : 0,
      firstAttempt: prev ? prev.firstAttempt : true,
      hints,
      lastCheckAt: Date.now(),
    }
    commit(Object.assign({}, state, { results }))
  }

  function pick(qid, choice) {
    const mode = state.mode || 'medium'
    if (state.quizDone && state.quizDone[mode]) return
    if (state.quiz[qid] !== undefined) return // already locked
    const quizPicks = Object.assign({}, state.quizPicks)
    quizPicks[qid] = choice
    commit(Object.assign({}, state, { quizPicks }))
  }

  function lock(qid) {
    const mode = state.mode || 'medium'
    if (state.quizDone && state.quizDone[mode]) return
    if (state.quiz[qid] !== undefined) return // already locked
    const pickVal = state.quizPicks[qid]
    if (pickVal === undefined) return // nothing selected — no validation may fire
    const quiz = Object.assign({}, state.quiz)
    quiz[qid] = pickVal
    commit(Object.assign({}, state, { quiz }))
  }

  function submitQuiz() {
    const mode = state.mode || 'medium'
    const allLocked = window.LabData.QUIZ
      .filter((q) => q.mode === mode)
      .every((q) => state.quiz[q.id] !== undefined)
    if (!allLocked || (state.quizDone && state.quizDone[mode])) return
    const quizDone = Object.assign({}, state.quizDone)
    quizDone[mode] = true
    commit(Object.assign({}, state, { quizDone }))
  }

  function navigate(circuit) {
    commit(Object.assign({}, state, { activeCircuit: circuit }))
  }

  function seenCompletion() {
    commit(Object.assign({}, state, { completionSeen: true }))
  }

  function reset() {
    clearStorage()
    state = initialState()
    if (hydrated) save()
    notify()
  }

  // ---------------- persistence (same key, same normalizers) ----------------
  function normalizeResults(raw) {
    const out = {}
    if (raw && typeof raw === 'object') {
      for (const id of Object.keys(raw)) {
        const o = raw[id] || {}
        out[id] = {
          pass: o.pass === true,
          done: o.done === true,
          attempts: typeof o.attempts === 'number' ? o.attempts : 0,
          hints: typeof o.hints === 'number' ? o.hints : 0,
          firstAttempt: o.firstAttempt === true,
          lastCheckAt: typeof o.lastCheckAt === 'number' ? o.lastCheckAt : 0,
        }
      }
    }
    return out
  }

  function load() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      if (parsed.version !== STATE_VERSION) return null
      // shallow-merge env so newly added fields always exist
      const base = initialState()
      return Object.assign({}, base, parsed, {
        env: Object.assign({}, base.env, parsed.env),
        results: normalizeResults(parsed.results),
        quiz: parsed.quiz || {},
        quizPicks: parsed.quizPicks || {},
        quizDone: typeof parsed.quizDone === 'boolean'
          ? { [parsed.mode || 'medium']: parsed.quizDone }
          : parsed.quizDone || {},
      })
    } catch (err) {
      return null
    }
  }

  function hydrate(saved) {
    state = saved
    hydrated = true
    notify()
  }

  function save() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (err) {
      // localStorage unavailable — degrade gracefully (in-memory only)
    }
  }

  function clearStorage() {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch (err) {
      // ignore
    }
  }

  function markHydrated() {
    hydrated = true
  }

  window.LabStore = {
    STORAGE_KEY,
    get state() { return state },
    isHydrated: () => hydrated,
    subscribe: (fn) => subscribers.add(fn),
    load, hydrate, markHydrated, save, clearStorage,
    setMode, patchEnv, check, hint, pick, lock, submitQuiz,
    navigate, seenCompletion, reset,
  }
})()
