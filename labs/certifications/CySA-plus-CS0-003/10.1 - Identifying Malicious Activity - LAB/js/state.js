/* ═══════════════════════════════════════════════════════════════════════════
   CyberLab 101 — js/state.js
   Central lab store: a single plain-JS state object with a tiny
   subscribe/notify mechanism, persisted to localStorage under the SAME key
   ('cy101-analyst-bench-v1') with the SAME partialize/save/restore/RESET
   semantics as the original zustand store.

   Owns: phase/mode, environment state, objective progress, quiz answers,
   and the CHECK RESULTS engine wiring. All feedback messages are educational.

   Notify scopes: 'route' (phase/mode changed), 'instrument', 'env',
   'objectives', 'quiz', 'completion'. Subscribers re-render only what
   changed.
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

const STORAGE_KEY = 'cy101-analyst-bench-v1';
const TERM_CAP = 140;

/* ------------------------------ initial state ----------------------------- */

function initialEnv() {
  return {
    edr: { activeAlert: 'E-701', detectionTypeAnswer: null, quarantined: false, isolated: false },
    siem: {
      activeAlert: null,
      dispositions: {
        'A-1042': null,
        'A-1047': null,
        'A-1051': null,
        'A-1055': null,
        'A-1058': null,
        'A-1061': null,
      },
      correlationSelected: [],
      causeAnswer: null,
      tuningChoice: null,
      residualChoice: null,
      firewallBlocks: [],
    },
    blocklist: { lastLookup: null, hashConfirmed: false },
    whois: { lastDomain: null },
    drills: { toolMatch: {}, siemDrill: {}, toolFit: {}, blockVerdict: null, timeline: [] },
    responseLog: [],
    terminal: { lines: INITIAL_TERMINAL.slice(), host: 'WS-ENG-014' },
  };
}

function emptyObjectives() {
  const rec = {};
  for (const o of OBJECTIVES) rec[o.id] = { passed: false, attempts: 0, hintsUsed: 0 };
  return rec;
}

function pristineState() {
  return {
    phase: 'mode-select',
    mode: null,
    instrument: 'primer',
    env: initialEnv(),
    objectives: emptyObjectives(),
    answers: {},
    quizAnswers: {},
    quizChecked: {},
    quizSubmitted: false,
    completionSeen: false,
    showCompletion: false, // transient — never persisted (same as original)
  };
}

/* --------------------------- computeStats (parity) ------------------------ */

function computeStats(objectives, mode) {
  const defs = OBJECTIVES.filter((o) => o.mode === mode);
  const total = defs.length;
  let passed = 0;
  let qualitySum = 0;
  for (const def of defs) {
    const p = objectives[def.id];
    if (p?.passed) {
      passed += 1;
      qualitySum += p.attempts <= 1 && p.hintsUsed === 0 ? 1 : 0.6;
    }
  }
  const quality = total > 0 ? qualitySum / total : 0;
  const stars = !passed || passed < total ? 0 : quality >= 0.9 ? 3 : quality >= 0.6 ? 2 : 1;
  const hintCount = defs.reduce((acc, d) => acc + (objectives[d.id]?.hintsUsed ?? 0), 0);
  return { passed, total, quality, stars, hintCount, complete: total > 0 && passed === total };
}

/* Ordered containment-action helpers: the log tracks actions that are
 * currently ACTIVE, in the order they were activated. Toggling an action off
 * removes it; re-activating re-appends it at the end. Prevents duplicate or
 * stale entries from corrupting sequence validation (H6). */
function withAction(log, action, on) {
  if (on) return log.includes(action) ? log : [...log, action];
  return log.filter((a) => a !== action);
}

/* --------------------------- store + pub/sub ------------------------------ */

const Lab = Object.assign(pristineState(), {
  _listeners: [],
});

function subscribe(fn) {
  Lab._listeners.push(fn);
}

function notify(scope) {
  persist();
  for (const fn of Lab._listeners) fn(scope);
}

/* Persistence: same key + same partialized fields as the original store. */
function persist() {
  try {
    const snapshot = {
      phase: Lab.phase,
      mode: Lab.mode,
      instrument: Lab.instrument,
      env: Lab.env,
      objectives: Lab.objectives,
      answers: Lab.answers,
      quizAnswers: Lab.quizAnswers,
      quizChecked: Lab.quizChecked,
      quizSubmitted: Lab.quizSubmitted,
      completionSeen: Lab.completionSeen,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    /* storage unavailable — in-memory only */
  }
}

function hydrate() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (!saved || typeof saved !== 'object') return;
    for (const k of ['phase', 'mode', 'instrument', 'env', 'objectives', 'answers', 'quizAnswers', 'quizChecked', 'quizSubmitted', 'completionSeen']) {
      if (saved[k] !== undefined) Lab[k] = saved[k];
    }
    Lab.showCompletion = false;
  } catch {
    /* corrupt storage — start pristine */
  }
}

/* ------------------------------ markPassed -------------------------------- */

/** Mark objectives passed; toast educational feedback; open the completion
 * report automatically if this closes the last objective while the quiz gate
 * is already submitted (either finish order works). */
function markPassed(ids) {
  if (!ids.length) return;
  const next = { ...Lab.objectives };
  const newly = [];
  for (const id of ids) {
    if (next[id]?.passed) continue;
    next[id] = { ...(next[id] ?? { passed: false, attempts: 0, hintsUsed: 0 }), passed: true, attempts: 1 };
    newly.push(id);
    const def = OBJECTIVES.find((o) => o.id === id);
    const fb = validateStateObjective(id, Lab.env).feedback;
    UI.toastSuccess(`Objective ${id} — PASSED`, def ? def.title : undefined);
    UI.toastMessage('Why it matters', fb.length > 220 ? fb.slice(0, 217) + '…' : fb);
  }
  if (!newly.length) return;
  Lab.objectives = next;
  if (Lab.mode && Lab.quizSubmitted && !Lab.completionSeen) {
    const stats = computeStats(Lab.objectives, Lab.mode);
    if (stats.complete) {
      Lab.showCompletion = true;
      Lab.completionSeen = true;
    }
  }
  notify('objectives');
}

function revalidate() {
  if (!Lab.mode) return [];
  const newly = [];
  for (const def of OBJECTIVES.filter((o) => o.mode === Lab.mode && o.kind === 'state')) {
    if (Lab.objectives[def.id]?.passed) continue;
    const res = validateStateObjective(def.id, Lab.env);
    if (res.pass) newly.push(def.id);
  }
  markPassed(newly);
  return newly;
}

/* ------------------------------- actions ---------------------------------- */

const Actions = {
  setPhase(p) {
    Lab.phase = p;
    notify('route');
  },

  setMode(m) {
    Lab.mode = m;
    Lab.phase = 'briefing';
    Lab.objectives = emptyObjectives();
    Lab.answers = {};
    Lab.quizAnswers = {};
    Lab.quizChecked = {};
    Lab.quizSubmitted = false;
    Lab.completionSeen = false;
    Lab.showCompletion = false;
    notify('route');
  },

  setInstrument(i) {
    Lab.instrument = i;
    notify('instrument');
  },

  resetLab() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable — proceed with in-memory reset */
    }
    const fresh = pristineState();
    for (const k of Object.keys(fresh)) Lab[k] = fresh[k];
    notify('route');
  },

  /* objective engine */
  setAnswer(objId, fieldId, value) {
    Lab.answers = { ...Lab.answers, [objId]: { ...(Lab.answers[objId] ?? {}), [fieldId]: value } };
    persist(); // no notify — nothing visual depends on raw answer text
  },

  checkAnswerObjective(objId) {
    const def = OBJECTIVES.find((o) => o.id === objId);
    if (!def || def.mode !== Lab.mode) return { pass: false, feedback: 'Objective unavailable.' };
    const res = validateObjective(objId, Lab.env, Lab.answers[objId] ?? {});
    const prev = Lab.objectives[objId] ?? { passed: false, attempts: 0, hintsUsed: 0 };
    const next = { ...Lab.objectives };
    if (res.pass && !prev.passed) {
      next[objId] = { ...prev, passed: true, attempts: prev.attempts + 1 };
      Lab.objectives = next;
      UI.toastSuccess(`Objective ${objId} — PASSED`, def.title);
    } else {
      next[objId] = { ...prev, attempts: prev.attempts + 1 };
      Lab.objectives = next;
    }
    persist(); // rail re-render is driven by the card's own check handler
    return res;
  },

  spendHint(objId, tiers) {
    const prev = Lab.objectives[objId] ?? { passed: false, attempts: 0, hintsUsed: 0 };
    Lab.objectives = {
      ...Lab.objectives,
      [objId]: { ...prev, hintsUsed: Math.min(tiers, prev.hintsUsed + 1) },
    };
    persist(); // caller re-renders the card
  },

  revalidateState: revalidate,

  /* EDR */
  edrSelectAlert(id) {
    Lab.env = { ...Lab.env, edr: { ...Lab.env.edr, activeAlert: id } };
    notify('env');
  },
  edrClassify(type) {
    Lab.env = { ...Lab.env, edr: { ...Lab.env.edr, detectionTypeAnswer: type } };
    notify('env');
    revalidate();
  },
  edrQuarantine(on) {
    Lab.env = {
      ...Lab.env,
      edr: { ...Lab.env.edr, quarantined: on },
      responseLog: withAction(Lab.env.responseLog, 'quarantine', on),
    };
    notify('env');
    revalidate();
  },
  edrIsolate(on) {
    Lab.env = {
      ...Lab.env,
      edr: { ...Lab.env.edr, isolated: on },
      responseLog: withAction(Lab.env.responseLog, 'isolate', on),
    };
    notify('env');
    revalidate();
  },

  /* SIEM */
  siemSelectAlert(id) {
    Lab.env = { ...Lab.env, siem: { ...Lab.env.siem, activeAlert: id } };
    notify('env');
  },
  siemDispose(id, kind) {
    const dispositions = { ...Lab.env.siem.dispositions, [id]: kind };
    /* 'escalate' tracks the CASE escalation (A-1047) — other alerts'
       dispositions must never toggle it. */
    const escalateActive = dispositions['A-1047'] === 'tp';
    Lab.env = {
      ...Lab.env,
      siem: { ...Lab.env.siem, dispositions },
      responseLog: withAction(Lab.env.responseLog, 'escalate', escalateActive),
    };
    notify('env');
    revalidate();
  },
  siemReopen(id) {
    const dispositions = { ...Lab.env.siem.dispositions, [id]: null };
    const escalateActive = dispositions['A-1047'] === 'tp';
    Lab.env = {
      ...Lab.env,
      siem: { ...Lab.env.siem, dispositions },
      responseLog: withAction(Lab.env.responseLog, 'escalate', escalateActive),
    };
    notify('env');
    revalidate();
  },
  siemToggleCorrelation(eventId) {
    const cur = Lab.env.siem.correlationSelected;
    const next = cur.includes(eventId) ? cur.filter((e) => e !== eventId) : [...cur, eventId];
    Lab.env = { ...Lab.env, siem: { ...Lab.env.siem, correlationSelected: next } };
    notify('env');
    revalidate();
  },
  siemSetCause(v) {
    Lab.env = { ...Lab.env, siem: { ...Lab.env.siem, causeAnswer: v } };
    notify('env');
    revalidate();
  },
  siemSetTuning(v) {
    Lab.env = { ...Lab.env, siem: { ...Lab.env.siem, tuningChoice: v } };
    notify('env');
    revalidate();
  },
  siemSetResidual(v) {
    Lab.env = { ...Lab.env, siem: { ...Lab.env.siem, residualChoice: v } };
    notify('env');
    revalidate();
  },

  /* Blocklist */
  blocklistLookup(type, value) {
    Lab.env = { ...Lab.env, blocklist: { ...Lab.env.blocklist, lastLookup: { type, value } } };
    notify('env');
  },
  blocklistConfirmHash() {
    Lab.env = { ...Lab.env, blocklist: { ...Lab.env.blocklist, hashConfirmed: true } };
    notify('env');
    revalidate();
  },
  blocklistBlockIp(ip) {
    Lab.env = {
      ...Lab.env,
      siem: {
        ...Lab.env.siem,
        firewallBlocks: Lab.env.siem.firewallBlocks.includes(ip) ? Lab.env.siem.firewallBlocks : [...Lab.env.siem.firewallBlocks, ip],
      },
      responseLog: withAction(Lab.env.responseLog, 'block', true),
    };
    notify('env');
    revalidate();
  },

  /* WHOIS */
  whoisLookup(domain) {
    Lab.env = { ...Lab.env, whois: { ...Lab.env.whois, lastDomain: domain } };
    notify('env');
  },

  /* Drills */
  setDrill(kind, slot, value) {
    if (kind === 'blockVerdict') {
      Lab.env = { ...Lab.env, drills: { ...Lab.env.drills, blockVerdict: value } };
    } else {
      Lab.env = {
        ...Lab.env,
        drills: {
          ...Lab.env.drills,
          [kind]: { ...(Lab.env.drills[kind] ?? {}), [slot]: value },
        },
      };
    }
    notify('env');
    revalidate();
  },

  timelinePush(eventId) {
    Lab.env = { ...Lab.env, drills: { ...Lab.env.drills, timeline: [...Lab.env.drills.timeline, eventId] } };
    notify('env');
    revalidate();
  },
  timelineReset() {
    Lab.env = { ...Lab.env, drills: { ...Lab.env.drills, timeline: [] } };
    notify('env');
  },

  restartSequence() {
    Lab.env = {
      ...Lab.env,
      edr: { ...Lab.env.edr, quarantined: false, isolated: false },
      siem: {
        ...Lab.env.siem,
        firewallBlocks: Lab.env.siem.firewallBlocks.filter((ip) => ip !== '185.199.72.44'),
        dispositions: { ...Lab.env.siem.dispositions, 'A-1047': null },
      },
      responseLog: [],
    };
    notify('env');
  },

  /* Terminal */
  termRun(input) {
    const host = Lab.env.terminal.host;
    const res = execute(input, host);
    if (res.clear) {
      Lab.env = { ...Lab.env, terminal: { ...Lab.env.terminal, lines: [] } };
      notify('env');
      return;
    }
    Lab.env = {
      ...Lab.env,
      terminal: {
        ...Lab.env.terminal,
        host: res.hostSwitch ?? Lab.env.terminal.host,
        lines: [...Lab.env.terminal.lines, `$ ${input}`, ...res.lines].slice(-TERM_CAP),
      },
    };
    notify('env');
  },
  termClear() {
    Lab.env = { ...Lab.env, terminal: { ...Lab.env.terminal, lines: [] } };
    notify('env');
  },

  /* Quiz */
  setQuizAnswer(qid, idx) {
    if (Lab.quizChecked[qid]) return;
    Lab.quizAnswers = { ...Lab.quizAnswers, [qid]: idx };
    persist();
  },

  checkQuizQuestion(qid) {
    if (Lab.quizSubmitted || Lab.quizAnswers[qid] === undefined) return false;
    Lab.quizChecked = { ...Lab.quizChecked, [qid]: true };
    persist();
    return true;
  },

  submitQuiz() {
    const quizSet = Lab.mode === 'hard' ? HARD_QUIZ : MEDIUM_QUIZ;
    /* every question must be individually checked before the set can close */
    if (!quizSet.every((q) => Lab.quizChecked[q.id])) return;
    Lab.quizSubmitted = true;
    const score = quizSet.filter((q) => Lab.quizAnswers[q.id] === q.answer).length;
    UI.toastSuccess(
      `Knowledge check submitted — ${score}/${quizSet.length} correct`,
      'Every question shows its rationale. Review, then close the shift.'
    );
    const stats = computeStats(Lab.objectives, Lab.mode ?? 'medium');
    if (stats.complete && !Lab.completionSeen) {
      Lab.showCompletion = true;
      Lab.completionSeen = true;
    }
    notify('quiz');
    if (Lab.showCompletion) notify('completion');
  },

  /* Completion */
  openCompletion() {
    Lab.showCompletion = true;
    notify('completion');
  },
  markCompletionSeen() {
    Lab.completionSeen = true;
    Lab.showCompletion = false;
    persist();
    notify('completion');
  },
};
