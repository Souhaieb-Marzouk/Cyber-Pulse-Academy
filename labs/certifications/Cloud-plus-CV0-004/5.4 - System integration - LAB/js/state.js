// ═══════════════════════════════════════════════════════════════════════════
// The Central Exchange — persistent store (static port)
// Recreates the original zustand store (src/lib/lab/store.ts) as a plain-JS
// state object with a tiny subscribe/notify mechanism:
//   • SAME storage key: "interchange-lab-v1"
//   • SAME persisted shape: { state: {…}, version: 0 } (zustand persist)
//   • SAME partialize semantics: `tape` / `tapeId` are transient, never saved
//   • SAME actions and side effects (tape pushes, fault injection chain…)
// Every mutating action notifies subscribers; the UI re-reads state and
// updates only what changed (see ui.js / app.js).
// ═══════════════════════════════════════════════════════════════════════════

const STORAGE_KEY = "interchange-lab-v1";

// Fresh, pristine lab state (mirrors `startState` in the original).
function freshState() {
  return {
    mode: null,
    briefingSeen: false,
    patched: {},
    cord: {},
    cfg: {},
    found: {},
    keyOrder: [],
    alertM: null,
    alertH: [],
    alertClass: {},
    controls: [],
    active: {},
    drills: false,
    actions: 0,
    obj: {},
    nudged: {},
    quiz: {},
    quizDone: false,
    completedSeen: false,
    // transient — never persisted (zustand partialize drops these)
    tape: [],
    tapeId: 0,
  };
}

// ── tiny pub/sub store ──
const Lab = {
  state: freshState(),
  _listeners: new Set(),
  subscribe(fn) {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  },
  notify() {
    persistState();
    this._listeners.forEach((fn) => {
      try { fn(this.state); } catch (err) { console.error("listener error", err); }
    });
  },
  // shallow merge of an arbitrary patch, then notify (mirrors zustand `set`)
  set(patch) {
    Object.assign(this.state, patch);
    this.notify();
  },
};

// ── persistence (localStorage; graceful when unavailable, e.g. file://) ──
function persistState() {
  try {
    const { tape, tapeId, ...rest } = Lab.state; // same partialize as original
    void tape; void tapeId;
    const payload = JSON.stringify({ state: rest, version: 0 });
    window.localStorage.setItem(STORAGE_KEY, payload);
  } catch {
    /* storage unavailable — the lab still works in-memory */
  }
}

function loadPersisted() {
  let saved = null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // zustand persist wraps the value as { state, version }
      saved = parsed && typeof parsed === "object" && "state" in parsed ? parsed.state : parsed;
    }
  } catch {
    saved = null; // corrupted or unavailable storage — start pristine
  }
  if (saved) {
    // zustand persist merges shallowly: persisted values replace defaults
    const base = freshState();
    delete base.tape; delete base.tapeId;
    Lab.state = Object.assign(base, saved);
    Lab.state.tape = [];
    Lab.state.tapeId = 0;
  }
}

// ── synthetic teleprinter clock: advances with each event, no wall-clock
//    dependency (identical formula to the original) ──
function clock(n) {
  const base = 10 * 3600 + 41 * 60; // 10:41:00 shift time
  const step = 3 + (n % 5);
  const t = base + n * step;
  const hh = String(Math.floor(t / 3600) % 24).padStart(2, "0");
  const mm = String(Math.floor((t % 3600) / 60)).padStart(2, "0");
  const ss = String(t % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

// ── actions (1:1 with the original store) ──
const Actions = {
  setMode(m) {
    const s = Lab.state;
    if (m === "hard") {
      Lab.set({ mode: m, active: { inc1: true, inc2: true, inc3: true, inc4: true, inc5: true } });
      Actions.pushTape("UNATTENDED CHANGE WINDOW OPEN — five faults live on the board", "bad");
      Object.keys(TAPE_FAULT).forEach((inc) => {
        const ev = TAPE_FAULT[inc][0];
        Actions.pushTape(ev.text, ev.level);
      });
    } else {
      Lab.set({ mode: m, active: {} });
      Actions.pushTape("SUPERVISED COMMISSIONING — board powered up, all circuits cold", "info");
    }
    Actions.pushTape("Shift brief stamped. You have the board, engineer.", "info");
    void s;
  },

  setBriefingSeen() {
    Lab.set({ briefingSeen: true });
  },

  togglePatch(ch) {
    const s = Lab.state;
    const was = s.patched[ch] === true;
    Lab.set({
      patched: { ...s.patched, [ch]: !was },
      actions: s.mode === "hard" ? s.actions + 1 : s.actions,
    });
    Actions.pushTape(was ? `cord pulled on ${ch.toUpperCase()}` : `cord patched on ${ch.toUpperCase()}`, was ? "warn" : "ok");
    return !was;
  },

  setCfg(key, val) {
    const s = Lab.state;
    const changed = s.cfg[key] !== val;
    const patch = { cfg: { ...s.cfg, [key]: val } };
    // cord-type selects (e.g. "ch1.cord") also drive the crossbar cord map
    if (key.endsWith(".cord") && (val === "api" || val === "webhook" || val === "queue")) {
      const ch = key.slice(0, key.indexOf("."));
      patch.cord = { ...s.cord, [ch]: val };
    }
    patch.actions = s.mode === "hard" && changed ? s.actions + 1 : s.actions;
    Lab.set(patch);
  },

  setFound(inc, cause) {
    Lab.set({ found: { ...Lab.state.found, [inc]: cause } });
  },

  pushKeyStep(step) {
    const s = Lab.state;
    const expected = KEY_ORDER_CORRECT[s.keyOrder.length];
    if (step === expected) {
      Lab.set({ keyOrder: [...s.keyOrder, step] });
      Actions.pushTape(`response step logged: ${step}`, "ok");
    } else {
      Lab.set({ keyOrder: [] });
      Actions.pushTape("sequence broken — order reset, start again", "warn");
    }
  },

  resetKeyOrder() {
    Lab.set({ keyOrder: [] });
  },

  setAlertM(id) {
    Lab.set({ alertM: id });
  },

  toggleAlertH(id) {
    const s = Lab.state;
    Lab.set({
      alertH: s.alertH.includes(id) ? s.alertH.filter((x) => x !== id) : [...s.alertH, id],
    });
  },

  setAlertClass(id, cls) {
    Lab.set({ alertClass: { ...Lab.state.alertClass, [id]: cls } });
  },

  toggleControl(id) {
    const s = Lab.state;
    Lab.set({
      controls: s.controls.includes(id) ? s.controls.filter((x) => x !== id) : [...s.controls, id],
    });
  },

  checkObjective(id) {
    const s = Lab.state;
    const pass = validate(id, s);
    const prev = s.obj[id] || { done: false, attempts: 0, hints: 0 };
    if (pass) {
      const patch = {
        obj: { ...s.obj, [id]: { done: true, attempts: prev.attempts, hints: prev.hints } },
      };
      // inject next incident in Medium mode
      if (s.mode === "medium") {
        const chain = { "OBJ-M3": "inc1", "OBJ-M5": "inc2", "OBJ-M8": "inc4", "OBJ-M9": "inc5" };
        const inc = chain[id];
        if (inc && !s.active[inc]) {
          patch.active = { ...s.active, [inc]: true };
          const evs = TAPE_FAULT[inc];
          if (evs) {
            patch.tapeId = s.tapeId + evs.length;
            patch.tape = [
              ...s.tape,
              ...evs.map((e, i) => ({ id: s.tapeId + i, t: clock(s.tapeId + i), text: e.text, level: e.level })),
            ];
          }
        }
      }
      Lab.set(patch);
      Actions.pushTape(`RUN SHEET: ${id} signed off`, "ok");
    } else {
      Lab.set({
        obj: { ...s.obj, [id]: { done: prev.done, attempts: prev.attempts + 1, hints: prev.hints } },
      });
      Actions.pushTape(`RUN SHEET: ${id} check failed — re-read the evidence`, "warn");
    }
    return pass;
  },

  useHint(id) {
    const s = Lab.state;
    const prev = s.obj[id] || { done: false, attempts: 0, hints: 0 };
    Lab.set({ obj: { ...s.obj, [id]: { ...prev, hints: Math.min(3, prev.hints + 1) } } });
  },

  useNudge(id) {
    Lab.set({ nudged: { ...Lab.state.nudged, [id]: true } });
  },

  setQuiz(qid, answer) {
    Lab.set({ quiz: { ...Lab.state.quiz, [qid]: answer } });
  },

  submitQuiz() {
    Lab.set({ quizDone: true });
    Actions.pushTape("QA GATE: knowledge check submitted", "info");
  },

  fireDrills() {
    Lab.set({ drills: true });
    Actions.pushTape("SIGN-OFF SWEEP: test order via API → 201", "ok");
    Actions.pushTape("SIGN-OFF SWEEP: test webhook delivered + deduped", "ok");
    Actions.pushTape("SIGN-OFF SWEEP: test billing event acked", "ok");
  },

  pushTape(text, level) {
    const s = Lab.state;
    const ev = { id: s.tapeId, t: clock(s.tapeId), text, level };
    const tape = [...s.tape, ev].slice(-40);
    Lab.set({ tape, tapeId: s.tapeId + 1 });
  },

  markCompletedSeen() {
    Lab.set({ completedSeen: true });
  },

  resetAll() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable — still reset memory */
    }
    Lab.state = freshState();
    Lab.notify();
  },
};

// Fisher–Yates shuffle (key-breach response order — per-mount, re-shuffled on
// retry; identical to TapeRoom.tsx).
function fisherYates(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
