// ─── CyberLab "Drafting Room" — state core (js/state.js) ───
// State factory, localStorage persistence (same key & semantics as the
// original), mode/objective/quiz lookups.
// Ported 1:1 from src/components/archlab/state.ts.

const ZONE_IDS = ["edge", "dmz", "core", "corporate", "servers", "mgmt", "lab"];
const STORAGE_KEY = "cyberlab-cs0003-3-1-arch-v1";
function initialTelemetry(mode) {
  const t = {};
  for (const l of LOG_TYPES) {
    if (mode === "hard") {
      t[l.id] = HARD_PREWIRED_ERRORS[l.id] ?? l.canonicalZone;
    } else {
      t[l.id] = null;
    }
  }
  return t;
}
function freshState(mode) {
  const segmentation = {};
  for (const r of SEG_RULES)
    segmentation[r.id] = r.defaultOn;
  return {
    version: 1,
    mode,
    zonesOpened: [],
    telemetry: initialTelemetry(mode),
    segmentation,
    stack: {},
    judgment: {},
    selinux: "permissive",
    moduleFlagged: null,
    answers: {},
    multi: {},
    sequence: [],
    rule: { dataset: null, domain: null, host: null, cadence: null, severity: null },
    quiz: {},
    obj: {},
    activeSheet: "brief",
    completionSeen: false,
    hardPrewired: mode === "hard"
  };
}
function loadState() {
  if (typeof window === "undefined")
    return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw)
      return null;
    const parsed = JSON.parse(raw);
    if (parsed?.version !== 1 || !parsed.mode)
      return null;
    const base = freshState(parsed.mode);
    return {
      ...base,
      ...parsed,
      rule: { ...base.rule, ...parsed.rule ?? {} },
      telemetry: { ...base.telemetry, ...parsed.telemetry ?? {} }
    };
  } catch {
    return null;
  }
}
function saveState(s) {
  if (typeof window === "undefined")
    return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {}
}
function clearState() {
  if (typeof window === "undefined")
    return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
function objectivesFor(mode) {
  return mode === "medium" ? OBJECTIVES_MEDIUM : OBJECTIVES_HARD;
}
function quizFor(mode) {
  return mode === "medium" ? QUIZ_MEDIUM : QUIZ_HARD;
}

// Expose state helpers.
Object.assign(globalThis, { STORAGE_KEY, initialTelemetry, freshState, loadState, saveState, clearState, objectivesFor, quizFor });
