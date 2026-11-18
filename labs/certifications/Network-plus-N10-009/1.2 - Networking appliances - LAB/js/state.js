// ── The Staging Bay · state, reducer, persistence, store ────────────────────
// Static port of src/lib/lab/engine.ts (state half) — logic is 1:1, only the
// TypeScript types are stripped. Data comes from window.LAB (js/data.js).
(function () {
'use strict';
const LAB = window.LAB;

// Same persistence key as the original build (v2 = per-question quiz state; v1 saves safely ignored)
const STORAGE_KEY = 'staging-bay-n10009-v2';

function initialState() {
  return {
    v: 1,
    mode: null,
    hydrated: false,
    resumed: false,       // a previous build was found in localStorage
    selectedDevice: null,
    placements: Object.fromEntries(LAB.SLOTS.map((s) => [s.id, null])),
    accessSwitch: { poe: false, stp: false, portSecurity: false, vlanStaff: false, vlanVoice: false, vlanCamera: false, trunkTagging: false, portMirror: false },
    firewall: { mode: 'stateless', dmzZone: false, proxyOnlyEgress: false, rules: [] },
    sensors: { idsMode: 'signature', ipsMode: 'signature' },
    lb: { algorithm: 'round-robin', w1: 1, w2: 1, w3: 1, healthChecks: false, persistence: false, web3Drained: false },
    proxies: { fEnabled: false, fCaching: false, fFilter: false, rTls: false, rWaf: false, denyList: false },
    storage: { nasProto: 'none', sanProto: 'none' },
    wireless: { roaming: false, autoProvision: false },
    match: {},
    path: [],
    wlPlan: {},
    storagePlan: {},
    mc: {},
    loopPulled: false,
    sigTuned: false,
    fwEgressBlock: false,
    alertVerdicts: Object.fromEntries(LAB.ALERTS.map((a) => [a.id, ''])),
    chain: { q1: '', q2: '', q3: '' },
    objectives: Object.fromEntries(LAB.OBJECTIVES.map((o) => [o.id, { passed: false, attempts: 0, hintLevel: 0 }])),
    quiz: {},
    quizIdx: 0,
    quizSubmitted: false,
    completedShown: false,
  };
}

// ── reducer (verbatim port) ──
function reducer(s, a) {
  switch (a.type) {
    case 'HYDRATE': return Object.assign({}, a.state, { hydrated: true, resumed: true });
    case 'MARK_HYDRATED': return Object.assign({}, s, { hydrated: true });
    case 'RESET': return Object.assign(initialState(), { hydrated: true });
    case 'SET_MODE': return Object.assign({}, s, {
      mode: a.mode,
      // hard shift arrives with the rotten rule base the audit objective (OBJ-H7) must fix
      firewall: a.mode === 'hard' && s.firewall.rules.length === 0
        ? Object.assign({}, s.firewall, { rules: ['R-ANYANY', 'R-STAFF-DMZDB', 'R-EST', 'R-DMZ-WEB'] })
        : s.firewall,
    });
    case 'SELECT_DEVICE': return Object.assign({}, s, { selectedDevice: a.id });
    case 'PLACE': {
      const slot = LAB.SLOTS.find((sl) => sl.id === a.slotId && sl.accepts === a.deviceId);
      if (!slot) return s;
      const placements = Object.assign({}, s.placements);
      const multi = LAB.DEVICES.find((d) => d.id === a.deviceId)?.multi === true;
      if (!multi) for (const k of Object.keys(placements)) if (placements[k] === a.deviceId) placements[k] = null;
      placements[a.slotId] = a.deviceId;
      return Object.assign({}, s, { placements, selectedDevice: null });
    }
    case 'UNRACK': {
      if (!s.placements[a.slotId]) return s;
      return Object.assign({}, s, { placements: Object.assign({}, s.placements, { [a.slotId]: null }) });
    }
    case 'SET_SWITCH': return Object.assign({}, s, { accessSwitch: Object.assign({}, s.accessSwitch, { [a.key]: a.value }) });
    case 'SET_FW': return Object.assign({}, s, { firewall: Object.assign({}, s.firewall, { [a.key]: a.value }) });
    case 'FW_ADD': {
      if (s.firewall.rules.includes(a.rule)) return s;
      return Object.assign({}, s, { firewall: Object.assign({}, s.firewall, { rules: s.firewall.rules.concat([a.rule]) }) });
    }
    case 'FW_DEL': return Object.assign({}, s, { firewall: Object.assign({}, s.firewall, { rules: s.firewall.rules.filter((r) => r !== a.rule) }) });
    case 'FW_MOVE': {
      const rules = s.firewall.rules.slice();
      const i = rules.indexOf(a.rule);
      const j = i + a.dir;
      if (i < 0 || j < 0 || j >= rules.length) return s;
      const tmp = rules[i]; rules[i] = rules[j]; rules[j] = tmp;
      return Object.assign({}, s, { firewall: Object.assign({}, s.firewall, { rules }) });
    }
    case 'SET_SENSOR': return Object.assign({}, s, { sensors: Object.assign({}, s.sensors, { [a.which]: a.value }) });
    case 'SET_LB_ALGO': return Object.assign({}, s, { lb: Object.assign({}, s.lb, { algorithm: a.value }) });
    case 'SET_LB': return Object.assign({}, s, { lb: Object.assign({}, s.lb, { [a.key]: a.value }) });
    case 'SET_LB_W': return Object.assign({}, s, { lb: Object.assign({}, s.lb, { [a.which]: a.value }) });
    case 'SET_PROXY': return Object.assign({}, s, { proxies: Object.assign({}, s.proxies, { [a.key]: a.value }) });
    case 'SET_STORAGE': return Object.assign({}, s, { storage: Object.assign({}, s.storage, { [a.key]: a.value }) });
    case 'SET_WIRELESS': return Object.assign({}, s, { wireless: Object.assign({}, s.wireless, { [a.key]: a.value }) });
    case 'SET_MATCH': return Object.assign({}, s, { match: Object.assign({}, s.match, { [a.device]: a.role }) });
    case 'PATH_PUSH': return s.path.includes(a.step) ? s : Object.assign({}, s, { path: s.path.concat([a.step]) });
    case 'PATH_POP': return Object.assign({}, s, { path: s.path.slice(0, -1) });
    case 'PATH_CLEAR': return Object.assign({}, s, { path: [] });
    case 'SET_PLAN': {
      const cur = a.board === 'wlPlan' ? s.wlPlan : s.storagePlan;
      const next = Object.assign({}, cur, { [a.key]: a.value });
      return a.board === 'wlPlan' ? Object.assign({}, s, { wlPlan: next }) : Object.assign({}, s, { storagePlan: next });
    }
    case 'SET_MC': return Object.assign({}, s, { mc: Object.assign({}, s.mc, { [a.key]: a.value }) });
    case 'ACT':
      if (a.key === 'loopPulled') return Object.assign({}, s, { loopPulled: true });
      if (a.key === 'sigTuned') return Object.assign({}, s, { sigTuned: true });
      return Object.assign({}, s, { fwEgressBlock: true });
    case 'SET_ALERT_VERDICT': return Object.assign({}, s, { alertVerdicts: Object.assign({}, s.alertVerdicts, { [a.id]: a.value }) });
    case 'SET_CHAIN':
      if (a.q === 1) return Object.assign({}, s, { chain: Object.assign({}, s.chain, { q1: a.value }) });
      if (a.q === 2) return Object.assign({}, s, { chain: Object.assign({}, s.chain, { q2: a.value }) });
      return Object.assign({}, s, { chain: Object.assign({}, s.chain, { q3: a.value }) });
    case 'VERIFY': {
      const def = LAB.OBJECTIVES.find((o) => o.id === a.id);
      if (!def) return s;
      const res = window.evaluate(a.id, s);
      const prev = s.objectives[a.id] || { passed: false, attempts: 0, hintLevel: 0 };
      if (res.pass && prev.passed) {
        return Object.assign({}, s, { objectives: Object.assign({}, s.objectives, { [a.id]: Object.assign({}, prev, { lastFeedback: res.feedback }) }) });
      }
      const attempts = prev.attempts + (res.pass && prev.passed ? 0 : 1);
      return Object.assign({}, s, { objectives: Object.assign({}, s.objectives, { [a.id]: Object.assign({}, prev, { passed: res.pass, attempts, lastFeedback: res.feedback }) }) });
    }
    case 'HINT': {
      const prev = s.objectives[a.id] || { passed: false, attempts: 0, hintLevel: 0 };
      const max = a.id.startsWith('OBJ-H') ? 1 : 3;
      return Object.assign({}, s, { objectives: Object.assign({}, s.objectives, { [a.id]: Object.assign({}, prev, { hintLevel: Math.min(max, prev.hintLevel + 1) }) }) });
    }
    case 'QUIZ_PICK': {
      // R2 answer lock: once a question is checked, its answer can never change
      const cur = s.quiz[a.qid];
      if (cur && cur.checked) return s;
      return Object.assign({}, s, { quiz: Object.assign({}, s.quiz, { [a.qid]: { pick: a.idx, checked: false } }) });
    }
    case 'QUIZ_CHECK': {
      // the validating button: locks the chosen answer and reveals contract-compliant feedback
      const cur = s.quiz[a.qid];
      if (!cur || cur.checked) return s;
      const quiz = Object.assign({}, s.quiz, { [a.qid]: { pick: cur.pick, checked: true } });
      const mode = s.mode || 'medium';
      const total = (mode === 'hard' ? LAB.QUIZ_HARD : LAB.QUIZ_MEDIUM).length;
      const allChecked = Object.keys(quiz).length >= total && Object.keys(quiz).every((k) => quiz[k].checked);
      return Object.assign({}, s, { quiz, quizSubmitted: allChecked });
    }
    case 'QUIZ_NEXT': {
      // enforced progression: only advances, never revisits a checked answer
      const mode = s.mode || 'medium';
      const total = (mode === 'hard' ? LAB.QUIZ_HARD : LAB.QUIZ_MEDIUM).length;
      return Object.assign({}, s, { quizIdx: Math.min(total - 1, s.quizIdx + 1) });
    }
    case 'SHOW_COMPLETION': return Object.assign({}, s, { completedShown: true });
    case 'CLOSE_COMPLETION': return Object.assign({}, s, { completedShown: false });
    default: return s;
  }
}

// ── persistence (verbatim semantics) ──
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.v !== 1 || !parsed.placements || !parsed.objectives) return null;
    // v2 save format: quiz entries are {pick, checked}; anything else (e.g. stale numeric map) is discarded
    const quiz = {};
    if (parsed.quiz && typeof parsed.quiz === 'object') {
      for (const [k, e] of Object.entries(parsed.quiz)) {
        if (e && typeof e === 'object' && typeof e.pick === 'number') {
          quiz[k] = { pick: e.pick, checked: !!e.checked };
        }
      }
    }
    return Object.assign(initialState(), parsed, {
      quiz,
      quizIdx: typeof parsed.quizIdx === 'number' ? parsed.quizIdx : 0,
    });
  } catch (e) {
    return null;
  }
}

function saveState(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch (e) {
    // localStorage unavailable (private mode etc.) — degrade gracefully, lab stays in-memory
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) { /* ignore */ }
}

// ── store: plain state + subscribe/notify; saves after every dispatched change ──
function createStore() {
  const saved = loadState();
  let state;
  if (saved) {
    state = Object.assign({}, saved, { hydrated: true, resumed: true });
  } else {
    state = Object.assign(initialState(), { hydrated: true });
  }
  const listeners = [];
  function subscribe(fn) { listeners.push(fn); }
  function dispatch(action) {
    const prev = state;
    state = reducer(state, action);
    if (state !== prev) {
      if (state.hydrated) saveState(state);
      for (const fn of listeners) fn(prev, state, action);
    }
  }
  return {
    dispatch,
    subscribe,
    get state() { return state; },
  };
}

window.LAB_STORE_KEY = STORAGE_KEY;
window.initialState = initialState;
window.reducer = reducer;
window.createStore = createStore;
window.loadState = loadState;
window.saveState = saveState;
window.clearState = clearState;
})();
