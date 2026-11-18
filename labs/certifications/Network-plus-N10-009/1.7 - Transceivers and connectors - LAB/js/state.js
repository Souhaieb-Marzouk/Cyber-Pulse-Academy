// ─────────────────────────────────────────────────────────────────────────────
// THE PATCH BENCH — js/state.js
// Lab store: initial state, reducer (all actions), derived helpers, star
// rating, localStorage persistence and the per-session shuffle.
// Ported 1:1 from src/lib/lab17/engine.ts + shuffle.ts.
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "patchbench-n10009-obj17-v1";

const objectivesFor = (mode) => (mode === "medium" ? LAB_OBJECTIVES.MEDIUM : LAB_OBJECTIVES.HARD);
const quizFor = (mode) => (mode === "medium" ? "medium" : "hard");

let toastId = 1;
let logSeq = 1;

const initialState = {
  phase: "boot",
  mode: "medium",
  selected: null,
  seated: {},
  lcCordA: null,
  lcCordB: null,
  lcCordKind: null,
  mpoTrunk: false,
  verifyCount: 0,
  links: {},
  answers: {},
  progress: {},
  results: {},
  quiz: {},
  quizSubmitted: false,
  benchLog: [],
  toast: null,
  announce: "",
  signOffOpen: false,
  inspector: null,
};

const withToast = (s, kind, text, announce) => ({
  ...s,
  toast: { id: toastId++, kind, text },
  announce: announce === undefined ? text : announce,
});

const logEvent = (s, ev) => ({
  ...s,
  benchLog: [...s.benchLog.slice(-60), { ...ev, seq: logSeq++ }],
});

const prog = (s, objId) =>
  s.progress[objId] || { done: false, attempts: 0, hints: 0, firstTry: false };

function reducer(s, a) {
  switch (a.type) {
    case "BOOT": {
      if (!a.saved) return { ...s, phase: "clockin" };
      const restored = {
        ...initialState,
        ...a.saved,
        phase: a.saved.phase === "boot" ? "clockin" : a.saved.phase,
        selected: null,
        toast: null,
        announce: "",
        signOffOpen: false,
        inspector: null,
        links: {},
      };
      return restored;
    }
    case "CLOCKIN":
      return {
        ...initialState,
        phase: "floor",
        mode: a.mode,
      };
    case "SELECT": {
      const next = { ...s, selected: a.part };
      if (a.part) {
        const p = a.part;
        return withToast(next, "info", `${p} selected — click a port on the panel.`, "");
      }
      return next;
    }
    case "SEAT": {
      const port = PORT_BY_ID[a.port];
      if (!port) return s;
      const part = s.selected;
      if (!part) return withToast(s, "info", "Pick a part from the tray first — then click the port.", "");
      if (s.seated[a.port] === part) return { ...s, selected: null };
      if (!port.accepts.includes(part)) {
        const reason = port.reject[part] || `A ${part} does not seat in ${port.label}.`;
        return withToast({ ...s, selected: null }, "bad", reason);
      }
      const seated = { ...s.seated, [a.port]: part };
      const next = { ...s, seated, selected: null };
      return withToast(
        logEvent(next, { kind: "seat", target: a.port, part }),
        "ok",
        `${part} seated in ${port.label}. Click the seated part to eject.`,
        `${part} seated in ${port.label}.`
      );
    }
    case "EJECT": {
      if (!s.seated[a.port]) return s;
      const seated = { ...s.seated };
      const removed = seated[a.port];
      delete seated[a.port];
      let next = { ...s, seated };
      // Pulling a module physically pops whatever was landed on its face.
      const popped = [];
      if (next.lcCordA === a.port || next.lcCordB === a.port) {
        popped.push("the LC cord end");
        next = {
          ...next,
          lcCordA: next.lcCordA === a.port ? null : next.lcCordA,
          lcCordB: next.lcCordB === a.port ? null : next.lcCordB,
        };
        if (next.lcCordA === null && next.lcCordB === null) next = { ...next, lcCordKind: null };
      }
      if (a.port === "CAGEQ" && next.mpoTrunk) {
        popped.push("the MPO trunk");
        next = { ...next, mpoTrunk: false };
      }
      const extra = popped.length ? ` ${popped.join(" and ")} popped off with it — land it again after re-seating.` : "";
      return withToast(
        logEvent(next, { kind: "eject", target: a.port, part: removed }),
        "info",
        `${removed} ejected from ${PORT_BY_ID[a.port].label}.${extra}`
      );
    }
    case "CORD_END": {
      const cord = s.selected;
      if (!cord || (cord !== "LC_CORD" && cord !== "LC_CORD_SM"))
        return withToast(s, "info", "Select an LC patch cord from the CORDS section first.", "");
      const cage = a.target;
      const seatedModule = s.seated[cage];
      if (!seatedModule || ["SFP", "SFPPLUS", "SFP28"].indexOf(seatedModule) === -1)
        return withToast(s, "bad", `No LC jack there — seat an SFP-family module in ${cage === "CAGEA" ? "CAGE-A" : "CAGE-B"} first.`);
      if (s.lcCordA && s.lcCordB)
        return withToast(s, "info", "The LC cord is already landed on both ends. Eject a module to reset.");
      if (s.lcCordA === cage)
        return withToast(s, "info", "That end already holds the cord — click the other cage.");
      // keep the cord in hand until BOTH ends are landed
      const next = { ...s, lcCordKind: cord };
      if (!s.lcCordA) {
        return withToast(
          logEvent({ ...next, lcCordA: cage }, { kind: "cordA", target: cage, part: cord }),
          "ok",
          `LC cord end A landed in ${cage === "CAGEA" ? "CAGE-A" : "CAGE-B"} — now land end B.`
        );
      }
      return withToast(
        logEvent({ ...next, lcCordB: cage, selected: null }, { kind: "cordB", target: cage, part: cord }),
        "ok",
        `LC cord landed on both jacks. Press VERIFY LINKS to prove the link.`
      );
    }
    case "TRUNK": {
      const cord = s.selected;
      if (cord !== "MPO_CORD") return withToast(s, "info", "Select the MPO trunk from CORDS, then click CAGE-Q.");
      if (s.seated["CAGEQ"] !== "QSFP28" && s.seated["CAGEQ"] !== "QSFPPLUS")
        return withToast(s, "bad", "CAGE-Q needs a QSFP-family module first — the trunk lands on the module's face.");
      return withToast(
        logEvent({ ...s, mpoTrunk: true, selected: null }, { kind: "trunk", target: "CAGEQ", part: "MPO_CORD" }),
        "ok",
        "MPO-12 trunk landed on the QSFP module. VERIFY LINKS to prove it."
      );
    }
    case "VERIFY": {
      const links = computeLinks(s);
      const next = { ...s, links, verifyCount: s.verifyCount + 1, selected: null };
      const upCount = Object.values(links).filter((l) => l.state === "up").length;
      return withToast(
        logEvent(next, { kind: "verify" }),
        upCount === Object.keys(links).length ? "ok" : "info",
        `Link check: ${upCount}/${Object.keys(links).length} up. ${Object.entries(links)
          .map(([id, l]) => `${id}: ${l.state === "up" ? "green" : "down"}`)
          .join(" · ")}`
      );
    }
    case "ANSWER":
      return { ...s, answers: { ...s.answers, [a.key]: a.value } };
    case "CHECK": {
      const obj = objectivesFor(s.mode).find((o) => o.id === a.objId);
      if (!obj) return s;
      const ok = obj.validate(s);
      const p = prog(s, a.objId);
      if (ok) {
        const firstTry = p.attempts === 0;
        const note = obj.success;
        return withToast(
          {
            ...s,
            progress: { ...s.progress, [a.objId]: { ...p, done: true, firstTry } },
            results: { ...s.results, [a.objId]: { ok, note } },
          },
          "ok",
          `${obj.wo} signed off — ${obj.title}.`,
          `${obj.wo} signed off.`
        );
      }
      const note = obj.explainFail(s);
      return withToast(
        {
          ...s,
          progress: { ...s.progress, [a.objId]: { ...p, attempts: p.attempts + 1 } },
          results: { ...s.results, [a.objId]: { ok, note } },
        },
        "bad",
        note.length > 180 ? `${obj.wo} not complete yet — see the ticket for coaching.` : note
      );
    }
    case "HINT": {
      const p = prog(s, a.objId);
      return {
        ...s,
        progress: { ...s.progress, [a.objId]: { ...p, hints: p.hints + 1 } },
      };
    }
    case "QUIZ_PICK":
      return { ...s, quiz: { ...s.quiz, [a.qid]: a.optionId } };
    case "QUIZ_SUBMIT":
      return withToast({ ...s, quizSubmitted: true }, "ok", "Counter exam submitted — review the explanations.");
    case "OPEN_SIGNOFF":
      return { ...s, signOffOpen: true };
    case "CLOSE_SIGNOFF":
      return { ...s, signOffOpen: false };
    case "INSPECT":
      return { ...s, inspector: a.part };
    case "TOAST":
      return withToast(s, a.kind, a.text);
    case "DISMISS_TOAST":
      return { ...s, toast: null };
    case "RESET":
      return { ...initialState, phase: "clockin" };
    default:
      return s;
  }
}

// ── Derived helpers ──────────────────────────────────────────────────────────

const objectiveList = (s) => objectivesFor(s.mode);

const doneCount = (s) => objectiveList(s).filter((o) => prog(s, o.id).done).length;

const allObjectivesDone = (s) => doneCount(s) === objectiveList(s).length;

const pillarStats = (s) => {
  const list = objectiveList(s);
  const pillars = ["P1", "P2", "P3", "P4"];
  return pillars.map((p) => {
    const items = list.filter((o) => o.pillar === p);
    const done = items.filter((o) => prog(s, o.id).done).length;
    return { pillar: p, done, total: items.length };
  });
};

const quizQuestions = (s) => (s.mode === "medium" ? QUIZ_MEDIUM : QUIZ_HARD);

const quizScore = (s) => {
  const qs = quizQuestions(s);
  const correct = qs.filter((q) => s.quiz[q.id] === q.correct).length;
  return { correct, total: qs.length };
};

function starRating(s) {
  const list = objectiveList(s);
  if (!allObjectivesDone(s)) return 0;
  const firstTry = list.filter((o) => prog(s, o.id).firstTry).length / list.length;
  const hints = list.reduce((acc, o) => acc + prog(s, o.id).hints, 0);
  const hintCap = s.mode === "medium" ? 3 : 1;
  if (firstTry >= 0.9 && hints === 0) return 3;
  if (firstTry >= 0.6 && hints <= hintCap) return 2;
  return 1;
}

// ── Persistence ──────────────────────────────────────────────────────────────
// Snapshot excludes transient fields (toast/announce/selected/signOffOpen/
// inspector/links) — identical to the original saveState().

function saveState(s) {
  try {
    if (s.phase === "boot") return;
    const snapshot = {
      phase: s.phase,
      mode: s.mode,
      seated: s.seated,
      lcCordA: s.lcCordA,
      lcCordB: s.lcCordB,
      lcCordKind: s.lcCordKind,
      mpoTrunk: s.mpoTrunk,
      verifyCount: s.verifyCount,
      answers: s.answers,
      progress: s.progress,
      results: s.results,
      quiz: s.quiz,
      quizSubmitted: s.quizSubmitted,
      benchLog: s.benchLog.slice(-60),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // storage unavailable (private mode etc.) — degrade gracefully
  }
}

function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { ...initialState, ...parsed };
  } catch {
    return null;
  }
}

function clearState() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

// ── Deterministic per-session option shuffle ─────────────────────────────────
// Order varies per page load and per item, but stays stable across re-renders
// within the same session (mulberry32 PRNG + stable keys — same as original).

let sessionSeed = null;

function seed() {
  if (sessionSeed === null) {
    try {
      sessionSeed = Math.floor(Math.random() * 2147483647);
    } catch {
      sessionSeed = 42;
    }
  }
  return sessionSeed;
}

function prng(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Fisher-Yates shuffle keyed by the session seed + a stable item key. */
function sessionShuffle(items, key) {
  const rand = prng((seed() ^ hashStr(key)) >>> 0);
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Expose
window.LAB_STORE = {
  STORAGE_KEY,
  initialState,
  reducer,
  prog,
  objectivesFor,
  objectiveList,
  doneCount,
  allObjectivesDone,
  pillarStats,
  quizQuestions,
  quizScore,
  starRating,
  saveState,
  loadState,
  clearState,
  sessionShuffle,
};
