// ─────────────────────────────────────────────────────────────────────────────
// state.js — lab state store, localStorage persistence, pub/sub, derived metrics.
// 1:1 port of the original Zustand store (src/lib/lab/store.ts + env.ts):
//   • same persistence key, version and partialize key set
//   • same action semantics (incl. attempts/firstAttempt bookkeeping and the
//     Hard-mode single-hint cap)
//   • same star/quiz scoring formulas
// Rendering hook-up: regions subscribe to state keys and re-render on change;
// DOM focus is restored after rebuilds so keyboard users keep their place.
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "cyberlab-cascade-access-mgmt-v1";
const STORAGE_VERSION = 1;

// Exactly the keys the original persist() partialize writes (nothing more).
const STATE_KEYS = [
  "phase", "mode", "storm", "stormSeen", "shiftStartedAt", "bay",
  "sshTarget", "sshLoggedIn", "telnetTried", "consolePort", "consolePatched", "consoleDevice",
  "vpn", "hardening", "configFlags", "logFlags", "judge", "answers", "matrix", "matrixH",
  "h3Order", "h3Reach", "api", "detection", "quizOpen", "quizPicked", "quizDone",
  "objectives", "hints", "completedShown", "lastCheckedId", "lastCheckedOk", "notes",
];

// ── Initial state (env.ts 1:1) ──────────────────────────────────────────────
function initialVpn() {
  return { clsA: null, clsB: null, persona: "field", mode: "split", acl: ["hq"], tech: "tls", mfa: false, lastSim: null };
}
function initialHardening() {
  return { transport: "telnet", sshVersion: "1", keySize: 768, httpServer: true, credsChanged: false, mgmtAcl: false, execTimeout: false, applied: false };
}
function initialMatrixH() {
  return { P1: { method: null, control: null }, P2: { method: null, control: null }, P3: { method: null, control: null }, P4: { method: null, control: null } };
}
function initialLabState() {
  return {
    phase: "intro",
    mode: null,
    storm: false,
    stormSeen: false,
    shiftStartedAt: null,
    bay: null,
    sshTarget: null,
    sshLoggedIn: false,
    telnetTried: false,
    consolePort: null,
    consolePatched: false,
    consoleDevice: null,
    vpn: initialVpn(),
    hardening: initialHardening(),
    configFlags: [],
    logFlags: [],
    judge: { A1: null, A2: null, A3: null },
    answers: {},
    matrix: {},
    matrixH: initialMatrixH(),
    h3Order: [],
    h3Reach: [],
    api: { endpoint: "/devices", token: "", status: null, body: null },
    detection: { source: null, condition: null, action: null },
    quizOpen: false,
    quizPicked: {},
    quizDone: false,
    notes: "",
    objectives: {},
    hints: {},
    completedShown: false,
    lastCheckedId: null,
    lastCheckedOk: null,
  };
}

// Deterministic "sorted equal" helper for flag sets (env.ts 1:1)
function sameSet(a, b) {
  return a.length === b.length && [...a].sort().join("|") === [...b].sort().join("|");
}

// ── Store ───────────────────────────────────────────────────────────────────
const Store = {
  s: initialLabState(),
  hydrated: false,
  _regions: new Map(), // id -> { keys:Set, fn }

  region(id, keys, fn) {
    this._regions.set(id, { keys: new Set(keys), fn });
  },
  unregionAll() {
    this._regions.clear();
  },

  /** Shallow-merge patch; notify subscribers of changed top-level keys
   *  (object-valued keys also emit "key.subkey" events). opts.silent skips notify. */
  set(patch, opts = {}) {
    const changed = new Set();
    for (const k of Object.keys(patch)) {
      const before = this.s[k];
      const after = patch[k];
      if (before === after) continue;
      changed.add(k);
      if (before && after && typeof before === "object" && typeof after === "object" && !Array.isArray(before)) {
        const bk = new Set(Object.keys(before));
        for (const sk of Object.keys(after)) {
          if (before[sk] !== after[sk] || !bk.has(sk)) changed.add(`${k}.${sk}`);
        }
      }
    }
    Object.assign(this.s, patch);
    this.persist();
    if (!opts.silent && changed.size) this.notify(changed);
    return changed;
  },

  notify(changed) {
    // focus restoration bookkeeping (rebuilds can blur the focused control)
    const active = document.activeElement;
    const fid = active && active.getAttribute ? active.getAttribute("data-fid") : null;
    for (const { keys, fn } of this._regions.values()) {
      let hit = false;
      for (const c of changed) { if (keys.has(c) || [...keys].some((k) => c.startsWith(k + "."))) { hit = true; break; } }
      if (hit) fn();
    }
    if (fid && document.activeElement === document.body) {
      const el = document.querySelector(`[data-fid="${CSS.escape(fid)}"]`);
      if (el) { try { el.focus({ preventScroll: true }); } catch (_) { el.focus(); } }
    }
  },

  persist() {
    if (!this.hydrated) return; // don't clobber saved state during boot
    try {
      const picked = {};
      for (const k of STATE_KEYS) picked[k] = this.s[k];
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: picked, version: STORAGE_VERSION }));
    } catch (_) { /* storage full/blocked — lab keeps working in-memory */ }
  },

  /** Load saved state (zustand persist format: {state, version}). */
  hydrate() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || !parsed.state) return;
      const saved = parsed.state;
      for (const k of STATE_KEYS) if (k in saved) this.s[k] = saved[k];
    } catch (_) { /* corrupt save → pristine */ }
  },

  // ── Actions (store.ts 1:1) ────────────────────────────────────────────────
  setPhase(p) { this.set({ phase: p }); },
  chooseMode(m) { this.set({ mode: m, phase: "briefing" }); },
  enterLab() {
    this.set((() => {
      const s = this.s;
      return { phase: "lab", shiftStartedAt: s.shiftStartedAt ?? Date.now(), storm: s.mode === "hard" ? true : s.storm };
    })());
  },
  patch(p) { this.set(p); },
  updateVpn(p) { this.set({ vpn: { ...this.s.vpn, ...p } }); },
  updateHardening(p) { this.set({ hardening: { ...this.s.hardening, ...p, applied: false } }); },
  setBay(c) { this.set({ bay: c }); },
  setAnswer(k, v) {
    this.set({ answers: { ...this.s.answers, [k]: v } }, { silent: true });
  },
  toggleArrayItem(key, id) {
    const arr = this.s[key];
    const next = arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];
    // NOT silent — the original React components re-render on flag changes
    // (row highlight / chip colors). Only per-keystroke answer writes are silent.
    if (key === "configFlags") this.set({ configFlags: next });
    else if (key === "logFlags") this.set({ logFlags: next });
    else this.set({ h3Reach: next });
  },
  pushH3Step(id) {
    const h3Order = this.s.h3Order.includes(id)
      ? this.s.h3Order.filter((x) => x !== id)
      : [...this.s.h3Order, id];
    this.set({ h3Order });
  },
  clearH3() { this.set({ h3Order: [] }); },
  // NOT silent — selected tp/fp buttons re-render with their state colors.
  judgeEvent(id, v) { this.set({ judge: { ...this.s.judge, [id]: v } }); },
  runStorm() { this.set({ storm: true, stormSeen: true }); },
  sendApi() {
    const { api, storm } = this.s;
    const res = apiRespond(api.endpoint, api.token, storm);
    // NOT silent — the response panel and HTTP status chip must re-render.
    this.set({ api: { ...api, status: res.status, body: JSON.stringify(res.body, null, 2) } });
  },
  telnetAttempt() { this.set({ telnetTried: true }); },
  consolePatch(port) {
    this.set({
      consolePort: port,
      consolePatched: true,
      consoleDevice: port === "S1" ? "HQ-CORE-SW01" : "BR1-RTR01",
      bay: "console",
    });
  },
  consoleUnpatch() { this.set({ consolePatched: false, consolePort: null, consoleDevice: null }); },
  applyHardening() { this.set({ hardening: { ...this.s.hardening, applied: true } }); },

  checkObjective(id) {
    const def = OBJECTIVES.find((o) => o.id === id);
    if (!def) return;
    const s = this.s;
    const ok = def.validate(s);
    const prev = s.objectives[id] ?? { done: false, attempts: 0, firstAttempt: true, feedback: null };
    const wasDone = prev.done;
    const next = {
      done: wasDone || ok,
      attempts: wasDone ? prev.attempts : prev.attempts + 1,
      firstAttempt: wasDone ? prev.firstAttempt : prev.firstAttempt && ok && prev.attempts === 0,
      feedback: ok ? def.success : def.fail,
    };
    this.set({ objectives: { ...s.objectives, [id]: next }, lastCheckedId: id, lastCheckedOk: ok });
  },

  revealHint(id) {
    const s = this.s;
    const used = s.hints[id] ?? 0;
    const def = OBJECTIVES.find((o) => o.id === id);
    // Hard-mode contract: exactly ONE optional nudge (ModeSelect). Medium: full tiers.
    const max = def ? (s.mode === "hard" ? Math.min(def.hints.length, 1) : def.hints.length) : 0;
    if (used >= max) return;
    this.set({ hints: { ...s.hints, [id]: used + 1 } });
  },

  // NOT silent — the picked option must recolor (R3 color contract) immediately.
  quizPick(itemId, opt) { this.set({ quizPicked: { ...this.s.quizPicked, [itemId]: opt } }); },
  // quizDone only flips true when EVERY item was answered (R2: progression enforced).
  quizClose() {
    const bank = this.s.mode === "hard" ? QUIZ_HARD : QUIZ_MEDIUM;
    const allAnswered = bank.every((q) => this.s.quizPicked[q.id] !== undefined);
    this.set({ quizOpen: false, quizDone: allAnswered });
  },
  setNotes(v) { this.set({ notes: v }, { silent: true }); },
  finishShift() { this.set({ completedShown: true }); },
  // R7: closing the report is the OPPOSITE of finishShift — a dedicated action, so the
  // close button / ESC / backdrop can never re-open the report they are closing.
  closeReport() { this.set({ completedShown: false }); },

  resetAll() {
    this.set({
      ...initialLabState(),
      vpn: initialVpn(),
      hardening: initialHardening(),
      matrixH: initialMatrixH(),
    });
  },

  // ── Derived (LabRoot C7): auto-debrief on TRANSITION to all-complete (not on resume)
  allDone() {
    const defs = objectivesFor(this.s.mode ?? "medium");
    return defs.length > 0 && defs.every((d) => this.s.objectives[d.id]?.done);
  },
};

// ── Derived metrics (stars: first-attempt accuracy + hint usage, C7) — 1:1 ──
function metricsFor(mode, runs, defs) {
  const total = defs.length;
  const done = defs.filter((d) => runs.objectives[d.id]?.done).length;
  const firstAttempt = defs.filter((d) => {
    const o = runs.objectives[d.id];
    return o?.done && o.firstAttempt;
  }).length;
  const hintsUsed = defs.reduce((acc, d) => acc + (runs.hints[d.id] ?? 0), 0);
  const completion = total ? done / total : 0;
  const faRatio = done ? firstAttempt / done : 0;
  const budget = mode === "hard" ? Math.max(1, total * 0.6) : Math.max(1, total * 1.5);
  const hintCredit = Math.max(0, 1 - hintsUsed / budget);
  const credit = 0.7 * faRatio + 0.3 * hintCredit;
  const stars = Math.max(1, Math.min(5, Math.round(credit * 4) + 1));
  return { total, done, completion, hintsUsed, stars, credit, firstAttemptRate: faRatio };
}

function quizScore(picked, bank) {
  if (!bank.length) return 0;
  const correct = bank.filter((q) => picked[q.id] === q.correct).length;
  return Math.round((correct / bank.length) * 100);
}
