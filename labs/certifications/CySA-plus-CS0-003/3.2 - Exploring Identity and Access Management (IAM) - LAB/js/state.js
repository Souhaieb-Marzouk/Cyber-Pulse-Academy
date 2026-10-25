// ─── The Access Bureau — state store + persistence ───────────────────────────
// Plain-JS recreation of the original zustand store (src/lib/iam-lab/store.ts).
// Same persistence key, same JSON envelope (zustand/persist shape), same
// save/restore/RESET semantics. Gracefully degrades to in-memory when
// localStorage is unavailable (file:// in restrictive profiles, private mode).

(function () {
  'use strict'

  var STORAGE_KEY = 'access-bureau-v1'

  // ── initial environment (identical to store.ts initialEnv) ──────────────────
  var initialEnv = {
    terms: {},
    factors: {},
    policy: { minLength: 8, complexity: false, lockout: 20, history: 0 },
    mfa: {},
    accountTypes: {},
    lifecycle: {},
    containment: [],
    review: { disabled: [], scheduled: false },
    clerkPerms: [],
    sodFlag: '',
    mitreMap: {},
    pam: { jit: false, removed: [], addSvc: false },
    pushCount: '',
    pushOutcome: '',
    sprayPattern: '',
    sprayIp: '',
    sprayCount: '',
    patternMatch: {},
    aaaTags: {},
    intrusion: { account: '', entry: '', inside: '' },
    rule: { source: '', aggregation: '', threshold: '', window: '', exclusions: [] },
    tpfp: {},
    ssoStatement: '',
    ssoRoles: {},
    fedFlags: [],
  }

  var initialState = {
    version: 1,
    mode: null,
    tickets: {},
    env: initialEnv,
    quiz: {},
    quizSubmitted: false,
    resultsSeen: false,
    lastCheck: null,
    completedAt: null,
  }

  function clone(o) { return JSON.parse(JSON.stringify(o)) }

  // ── persistence ─────────────────────────────────────────────────────────────
  var storageOk = true
  try {
    var probe = '__bureau_probe__'
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
  } catch (e) {
    storageOk = false
  }

  function loadPersisted() {
    if (!storageOk) return null
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      var parsed = JSON.parse(raw)
      // zustand persist envelope: { state: {...partialized...}, version: 0 }
      var s = parsed && typeof parsed === 'object' ? parsed.state : null
      if (!s || typeof s !== 'object') return null
      return s
    } catch (e) {
      return null // corrupt storage → pristine start (same recovery as original)
    }
  }

  function mergeEnv(saved) {
    // Defensive union over defaults so an incomplete/partial env can never
    // crash a check. For well-formed saves this equals the original's
    // wholesale env replacement.
    var env = clone(initialEnv)
    if (!saved || typeof saved !== 'object') return env
    Object.keys(env).forEach(function (k) {
      var v = saved[k]
      if (v === undefined || v === null) return
      if (Array.isArray(env[k])) {
        if (Array.isArray(v)) env[k] = v.slice()
      } else if (typeof env[k] === 'object') {
        Object.keys(env[k]).forEach(function (k2) {
          if (v[k2] !== undefined && v[k2] !== null) env[k][k2] = v[k2]
        })
      } else {
        env[k] = v
      }
    })
    return env
  }

  // ── store ───────────────────────────────────────────────────────────────────
  var state = (function () {
    var s = clone(initialState)
    var saved = loadPersisted()
    if (saved) {
      if (saved.mode === 'medium' || saved.mode === 'hard') s.mode = saved.mode
      if (saved.tickets && typeof saved.tickets === 'object') s.tickets = saved.tickets
      s.env = mergeEnv(saved.env)
      if (saved.quiz && typeof saved.quiz === 'object') s.quiz = saved.quiz
      s.quizSubmitted = !!saved.quizSubmitted
      s.resultsSeen = !!saved.resultsSeen
      s.completedAt = typeof saved.completedAt === 'string' ? saved.completedAt : null
    }
    return s
  })()

  var subscribers = new Set()

  function notify() {
    save()
    subscribers.forEach(function (fn) {
      try { fn(state) } catch (e) { /* a bad subscriber must not break the rest */ }
    })
  }

  function save() {
    if (!storageOk) return
    try {
      // identical shape to the original partialize + zustand envelope
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        state: {
          version: state.version,
          mode: state.mode,
          tickets: state.tickets,
          env: state.env,
          quiz: state.quiz,
          quizSubmitted: state.quizSubmitted,
          resultsSeen: state.resultsSeen,
          completedAt: state.completedAt,
        },
        version: 0,
      }))
    } catch (e) { /* quota/private mode — keep running in memory */ }
  }

  var store = {
    getState: function () { return state },
    subscribe: function (fn) {
      subscribers.add(fn)
      return function () { subscribers.delete(fn) }
    },
    // ── actions (same semantics as store.ts) ─────────────────────────────────
    setMode: function (mode) {
      var tickets = state.mode === mode ? state.tickets : {}
      state = Object.assign({}, state, { mode: mode, tickets: tickets })
      notify()
    },
    patchEnv: function (partial) {
      state = Object.assign({}, state, { env: Object.assign({}, state.env, partial) })
      notify()
    },
    setEnvPolicy: function (p) {
      state = Object.assign({}, state, {
        env: Object.assign({}, state.env, { policy: Object.assign({}, state.env.policy, p) }),
      })
      notify()
    },
    setEnvRule: function (r) {
      state = Object.assign({}, state, {
        env: Object.assign({}, state.env, { rule: Object.assign({}, state.env.rule, r) }),
      })
      notify()
    },
    setEnvPam: function (p) {
      state = Object.assign({}, state, {
        env: Object.assign({}, state.env, { pam: Object.assign({}, state.env.pam, p) }),
      })
      notify()
    },
    setEnvReview: function (r) {
      state = Object.assign({}, state, {
        env: Object.assign({}, state.env, { review: Object.assign({}, state.env.review, r) }),
      })
      notify()
    },
    setEnvIntrusion: function (i) {
      state = Object.assign({}, state, {
        env: Object.assign({}, state.env, { intrusion: Object.assign({}, state.env.intrusion, i) }),
      })
      notify()
    },
    recordCheck: function (ticketId, pass) {
      var t = state.tickets[ticketId] || { completed: false, attempts: 0, hintsUsed: 0 }
      if (t.completed) return // idempotent — a stamped ticket can never be re-stamped
      var next = Object.assign({}, state.tickets)
      next[ticketId] = {
        completed: pass ? true : t.completed,
        attempts: t.attempts + 1,
        hintsUsed: t.hintsUsed,
      }
      state = Object.assign({}, state, {
        tickets: next,
        lastCheck: { ticket: ticketId, pass: pass, at: Date.now() },
      })
      notify()
    },
    openHint: function (ticketId) {
      var t = state.tickets[ticketId] || { completed: false, attempts: 0, hintsUsed: 0 }
      var maxHints = state.mode === 'hard' ? 1 : 3 // hard mode allows exactly one nudge
      if (t.hintsUsed >= maxHints) return
      var next = Object.assign({}, state.tickets)
      next[ticketId] = {
        completed: t.completed,
        attempts: t.attempts,
        hintsUsed: Math.min(t.hintsUsed + 1, maxHints),
      }
      state = Object.assign({}, state, { tickets: next })
      notify()
    },
    setQuizAnswer: function (quizId, optionId) {
      var quiz = Object.assign({}, state.quiz)
      quiz[quizId] = optionId
      state = Object.assign({}, state, { quiz: quiz })
      notify()
    },
    submitQuiz: function () {
      state = Object.assign({}, state, {
        quizSubmitted: true,
        completedAt: new Date().toISOString(),
      })
      notify()
    },
    markResultsSeen: function () {
      state = Object.assign({}, state, { resultsSeen: true })
      notify()
    },
    resetLab: function () {
      state = clone(initialState)
      notify()
    },
  }

  window.LabStore = store
})()
