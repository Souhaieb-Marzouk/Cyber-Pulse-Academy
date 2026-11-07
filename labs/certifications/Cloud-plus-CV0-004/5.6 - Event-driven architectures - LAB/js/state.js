// ─── Lab engine: state, reducer, persistence, scoring ────────────────────────
// Ported 1:1 from the original framework lab (src/lib/lab/engine.ts).
// Same storage key, same reducer semantics, same scoring formula.
'use strict';

const STORAGE_KEY = 'eda-control-tower-lab-v1';

let LOG_ID = 10000;
const log = (level, src, msg, ts = '08:12:00') => ({ id: ++LOG_ID, ts, level, src, msg });

const FIXED_LOG_SEED = [
  log('info', 'tower', 'EventOps Control Tower attached to synthetic environment aerolink.example (TRAINING DATA).'),
  log('warn', 'orders-queue', 'depth=1240 oldest=47min — consumers starving behind a repeating rejection.'),
  log('error', 'payment-service', 'SchemaError evt-8841: "total" expected number, got string "NaN" (5/5 retries exhausted).'),
  log('warn', 'payment-service', 'DUPLICATE-CHARGE evt-9012 detected — redelivery without idempotency key.'),
  log('info', 'media-topic', 'fan-out OK: 3 subscribers (thumbnail, face-tag, notifier).'),
];

let PULSE_ID = 0;

function initialState() {
  return {
    v: LAB_META.version,
    screen: 'mode',
    mode: null,
    env: {
      roles: {},
      answers: {},
      wiring: {
        'checkout-api': ['orders-queue'],
        'photo-uploader': ['media-topic'],
        'fleet-telemetry': ['telemetry-stream'],
        'report-scheduler': ['report-generator'],
        'orders-queue': ['payment-service'],
        'media-topic': ['thumbnail-service', 'face-tag-service', 'notifier'],
        'telemetry-stream': ['fleet-dashboard', 'anomaly-detector'],
        notifier: ['notifications-topic'],
        'notifications-topic': ['analytics-ingest'],
      },
      directRest: true,
      triggers: {
        'payment-service': 'trigger-queue',
        'inventory-service': 'trigger-http',
        'thumbnail-service': 'trigger-topic',
        'face-tag-service': 'trigger-topic',
        notifier: 'trigger-topic',
        'fleet-dashboard': 'trigger-stream',
        'anomaly-detector': 'trigger-stream',
        'report-generator': 'trigger-schedule',
        'analytics-ingest': 'trigger-topic',
      },
      idempotency: {},
      dlqEnabled: {},
      poisonRouted: false,
      replayDone: false,
      alarms: [],
      iam: {
        notifier: ['perm-s3-all', 'perm-publish-notifications', 'perm-fn-admin', 'perm-sub-media', 'perm-publish-all-topics'],
        'thumbnail-service': ['perm-s3-all', 'perm-list-all-buckets', 'perm-publish-media-events', 'perm-fn-admin'],
      },
      schemaValidation: { 'photo-uploader': false },
      saga: { pattern: '', coordinator: false, comp: [], timeout: false },
      archive: { enabled: false, retention: '', target: '', sourcing: false, justification: '' },
      tracing: { pairs: {}, origin: '', propagation: '', enabled: false },
      stream: { partitionKey: 'k-random', ordering: false, buffer: '' },
      blueprint: {},
      injected: [],
      seq: [],
      metrics: {
        ordersDepth: 1240, oldestMin: 47, payErrorPct: 41, dupCount: 6, dupSuppressed: 0,
        throughputMsgs: 1890, thumbBatch: 1, coldStartMs: 2400, crossRegionHops: 2,
      },
    },
    objectives: {},
    quiz: { answers: {}, finished: false, idx: 0 },
    logs: FIXED_LOG_SEED,
    pulse: null,
    completionSeen: false,
  };
}

const answerFor = (env, obj) => env.answers[obj] ?? {};

function quizTotal(mode, quiz) {
  const qs = mode === 'medium' ? QUIZ_MEDIUM : QUIZ_HARD;
  const correct = qs.filter((q) => quiz.answers[q.id] === q.correct).length;
  return { correct, total: qs.length };
}

function objectivesStats(state) {
  if (!state.mode) return { passed: 0, total: 0, firstAttemptRate: 0, hintsUsed: 0 };
  const defs = objectivesFor(state.mode);
  const objs = defs.map((d) => state.objectives[d.id] ?? { passed: false, attempts: 0, hintLevel: 0, firstAttempt: false });
  const passed = objs.filter((o) => o.passed).length;
  const hintsUsed = objs.reduce((acc, o) => acc + o.hintLevel, 0);
  const graded = objs.filter((o) => o.passed);
  const firstAttemptRate = graded.length ? graded.filter((o) => o.firstAttempt).length / graded.length : 0;
  return { passed, total: defs.length, firstAttemptRate, hintsUsed };
}

function computeScore(state) {
  const { passed, total, firstAttemptRate, hintsUsed } = objectivesStats(state);
  let quizCorrect = 0;
  let quizTotalN = 0;
  if (state.mode) {
    const q = quizTotal(state.mode, state.quiz);
    quizCorrect = q.correct;
    quizTotalN = q.total;
  }
  const qRate = quizTotalN ? quizCorrect / quizTotalN : 0;
  let stars = Math.round(1 + firstAttemptRate * 2 + qRate * 2);
  const hintThreshold = state.mode === 'medium' ? 6 : 2;
  if (hintsUsed > hintThreshold) stars -= 1;
  stars = Math.max(1, Math.min(5, stars));
  return { stars, passed, total, firstAttemptRate, hintsUsed, quizCorrect, quizTotalN };
}

function allDone(state) {
  if (!state.mode) return false;
  const { passed, total } = objectivesStats(state);
  return passed === total && state.quiz.finished;
}

/* ── reducer (identical semantics to the original) ── */
function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE': {
      const maxLog = (action.state.logs ?? []).reduce((mx, l) => Math.max(mx, l.id), 0) ?? 0;
      if (maxLog > LOG_ID) LOG_ID = maxLog;
      return action.state;
    }
    case 'RESET':
      return initialState();
    case 'SET_SCREEN':
      return { ...state, screen: action.screen };
    case 'SET_MODE': {
      const fresh = initialState();
      return { ...fresh, mode: action.mode, screen: 'brief' };
    }
    case 'CLASSIFY': {
      const roles = { ...state.env.roles, [action.node]: action.role };
      return { ...state, env: { ...state.env, roles } };
    }
    case 'ANSWER': {
      const objAnswers = { ...answerFor(state.env, action.obj), [action.field]: action.values };
      const answers = { ...state.env.answers, [action.obj]: objAnswers };
      return { ...state, env: { ...state.env, answers } };
    }
    case 'ANSWER_APPEND': {
      const cur = answerFor(state.env, action.obj)[action.field] ?? [];
      if (cur.includes(action.value)) return state;
      const objAnswers = { ...answerFor(state.env, action.obj), [action.field]: [...cur, action.value] };
      const answers = { ...state.env.answers, [action.obj]: objAnswers };
      return { ...state, env: { ...state.env, answers } };
    }
    case 'DECOUPLE': {
      if (!state.env.directRest) return state;
      const wiring = {
        ...state.env.wiring,
        'checkout-api': [...(state.env.wiring['checkout-api'] ?? []).filter((t) => t !== 'inventory-service'), 'inventory-jobs'],
        'inventory-jobs': ['inventory-service'],
      };
      return {
        ...state,
        env: {
          ...state.env,
          wiring,
          directRest: false,
          triggers: { ...state.env.triggers, 'inventory-service': 'trigger-queue' },
          seq: [...state.env.seq, 'decouple:' + action.channel],
        },
        logs: [
          ...state.logs,
          log('warn', 'checkout-api', `rewriting integration: REST → ${action.channel} (event-driven decoupling)`),
          log('info', 'inventory-jobs', 'queue created; Inventory Service now consumes from the queue.'),
        ].slice(-80),
      };
    }
    case 'TOGGLE_IDEM': {
      const seq = action.on ? [...state.env.seq, 'idem:' + action.consumer] : state.env.seq;
      const lines = action.on
        ? [log('info', action.consumer, 'idempotency enabled — duplicate event IDs will be suppressed.')]
        : [log('warn', action.consumer, 'idempotency disabled — redeliveries may cause duplicate effects.')];
      return {
        ...state,
        env: { ...state.env, idempotency: { ...state.env.idempotency, [action.consumer]: action.on }, seq },
        logs: [...state.logs, ...lines].slice(-80),
      };
    }
    case 'TOGGLE_DLQ': {
      const seq = action.on ? [...state.env.seq, 'dlq:' + action.broker] : state.env.seq;
      const lines = action.on
        ? [log('info', action.broker, 'dead-letter queue attached — failed messages will divert after retry cap.')]
        : [log('warn', action.broker, 'dead-letter queue detached — poison messages will loop again.')];
      return {
        ...state,
        env: { ...state.env, dlqEnabled: { ...state.env.dlqEnabled, [action.broker]: action.on }, seq },
        logs: [...state.logs, ...lines].slice(-80),
      };
    }
    case 'ROUTE_POISON': {
      if (!state.env.dlqEnabled['orders-queue'] || state.env.poisonRouted) return state;
      return {
        ...state,
        env: {
          ...state.env,
          poisonRouted: true,
          seq: [...state.env.seq, 'poison-route'],
          metrics: { ...state.env.metrics, ordersDepth: 12, oldestMin: 0, payErrorPct: 0.3 },
        },
        logs: [
          ...state.logs,
          log('warn', 'orders-queue', 'evt-8841 diverted to orders-dlq (poison message).'),
          log('ok', 'orders-queue', 'head-of-line cleared — depth falling, consumers resuming.'),
          log('info', 'payment-service', 'processing backlog… error rate dropping to 0.3%.'),
        ].slice(-80),
      };
    }
    case 'REPLAY_DUP': {
      const idemOn = !!state.env.idempotency['payment-service'];
      const m = state.env.metrics;
      const lines = idemOn
        ? [log('ok', 'payment-service', 'evt-9012 redelivery suppressed by idempotency key — no second charge.')]
        : [log('error', 'payment-service', 'evt-9012 redelivery processed AGAIN — duplicate charge recorded!')];
      return {
        ...state,
        env: {
          ...state.env,
          replayDone: true,
          seq: [...state.env.seq, 'replay-dup'],
          metrics: idemOn ? { ...m, dupSuppressed: m.dupSuppressed + 1 } : { ...m, dupCount: m.dupCount + 1 },
        },
        logs: [...state.logs, ...lines].slice(-80),
      };
    }
    case 'SET_ALARMS':
      return { ...state, env: { ...state.env, alarms: action.ids } };
    case 'SET_IAM': {
      const cur = state.env.iam[action.consumer] ?? [];
      const next = action.on ? [...new Set([...cur, action.permId])] : cur.filter((p) => p !== action.permId);
      return {
        ...state,
        env: { ...state.env, iam: { ...state.env.iam, [action.consumer]: next } },
        logs: [...state.logs, log(action.on ? 'warn' : 'info', action.consumer, `IAM ${action.on ? 'granted' : 'revoked'}: ${action.permId}`)].slice(-80),
      };
    }
    case 'SET_SCHEMA':
      return {
        ...state,
        env: {
          ...state.env,
          schemaValidation: { ...state.env.schemaValidation, [action.producer]: action.on },
          seq: action.on ? [...state.env.seq, 'schema:' + action.producer] : state.env.seq,
        },
        logs: [...state.logs, log(action.on ? 'info' : 'warn', action.producer, `payload schema validation ${action.on ? 'ENABLED — malformed/forged events rejected at the edge' : 'disabled'}`)].slice(-80),
      };
    case 'SET_SAGA':
      return { ...state, env: { ...state.env, saga: { ...state.env.saga, ...action.patch } } };
    case 'SET_ARCHIVE':
      return { ...state, env: { ...state.env, archive: { ...state.env.archive, ...action.patch } } };
    case 'SET_TRACING':
      return { ...state, env: { ...state.env, tracing: { ...state.env.tracing, ...action.patch } } };
    case 'SET_STREAM':
      return { ...state, env: { ...state.env, stream: { ...state.env.stream, ...action.patch } } };
    case 'SET_BLUEPRINT':
      return { ...state, env: { ...state.env, blueprint: { ...state.env.blueprint, [action.slot]: action.value } } };
    case 'INJECT': {
      const ev = INJECT_EVENTS[action.source];
      if (!ev) return state;
      const targets = state.env.wiring[action.source] ?? [];
      const subs = targets.flatMap((ch) => state.env.wiring[ch] ?? []);
      const ts = new Date().toISOString().slice(11, 19);
      const lines = [
        log('info', action.source, `published ${ev.type} ${ev.payload}`, ts),
        ...subs.map((s2) => log('ok', s2, `consumed ${ev.type} — processed OK`, ts)),
      ];
      if (subs.length === 0) lines.push(log('warn', action.source, `${ev.type} routed to ${targets.join(', ') || 'nowhere'} — no subscribers found.`, ts));
      const path = [action.source, ...targets, ...subs];
      return {
        ...state,
        env: { ...state.env, injected: [...new Set([...state.env.injected, action.source])] },
        logs: [...state.logs, ...lines].slice(-80),
        pulse: { id: ++PULSE_ID, path },
      };
    }
    case 'CHECK': {
      const def = objectivesFor(state.mode === 'hard' ? 'hard' : 'medium').find((d) => d.id === action.objId);
      if (!def || !state.mode) return state;
      const res = def.validate(state);
      const prev = state.objectives[action.objId] ?? { passed: false, attempts: 0, hintLevel: 0, firstAttempt: false };
      if (prev.passed) return { ...state, lastCheck: { objId: action.objId, ...res } };
      const next = {
        passed: res.pass,
        attempts: prev.attempts + 1,
        hintLevel: prev.hintLevel,
        firstAttempt: prev.attempts === 0 && res.pass,
      };
      return {
        ...state,
        objectives: { ...state.objectives, [action.objId]: next },
        lastCheck: { objId: action.objId, ...res },
        logs: res.pass
          ? [...state.logs, log('ok', 'tower', `objective ${action.objId} verified ✓`)].slice(-80)
          : [...state.logs, log('warn', 'tower', `objective ${action.objId} not yet satisfied — feedback issued.`)].slice(-80),
      };
    }
    case 'USE_HINT': {
      const prev = state.objectives[action.objId] ?? { passed: false, attempts: 0, hintLevel: 0, firstAttempt: false };
      const maxHints = state.mode === 'medium' ? 3 : 1;
      return { ...state, objectives: { ...state.objectives, [action.objId]: { ...prev, hintLevel: Math.min(prev.hintLevel + 1, maxHints) } } };
    }
    case 'QUIZ_ANSWER':
      return { ...state, quiz: { ...state.quiz, answers: { ...state.quiz.answers, [action.qid]: action.idx } } };
    case 'QUIZ_NEXT': {
      const total = (state.mode === 'hard' ? QUIZ_HARD : QUIZ_MEDIUM).length;
      return { ...state, quiz: { ...state.quiz, idx: Math.min(state.quiz.idx + 1, total - 1) } };
    }
    case 'QUIZ_FINISH':
      return { ...state, quiz: { ...state.quiz, finished: true } };
    case 'SEE_COMPLETION':
      return { ...state, completionSeen: true };
    default:
      return state;
  }
}

/* ── tiny store: subscribe/notify (replaces React useReducer) ── */
const store = {
  state: initialState(),
  listeners: new Set(),
  dispatch(action) {
    this.state = reducer(this.state, action);
    persist(this.state);
    this.listeners.forEach((fn) => fn(this.state, action));
  },
  subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); },
};

function persist(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage full/blocked — the lab still works in-memory (same as original) */
  }
}

/** restore session — same validation rules as the original (version + shape).
 *  Returns the saved LabState (or null) WITHOUT applying it; the caller dispatches
 *  HYDRATE through the reducer so LOG_ID resyncs exactly like the original. */
function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.v === LAB_META.version && parsed.screen && parsed.env) {
        return parsed;
      }
    }
  } catch {
    /* localStorage unavailable — degrade gracefully (same as original) */
  }
  return null;
}
