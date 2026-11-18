/* ═══════════════════════════════════════════════════════════════════════════
   state.js — environment state, persistence, pub/sub store.
   Mirrors src/lib/lab/state.ts from the original framework lab:
   same shape (PersistedState v1), same localStorage KEY, same defensive merge,
   same debounced save, same confirmed-reset semantics.
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";

// ── Environment state ────────────────────────────────────────────────────────
function initialEnv() {
  return {
    assets: Object.fromEntries(ASSETS.map((a) => [a.id, a.startZone])),
    links: structuredClone(DEFAULT_LINKS),
    flags: { ...DEFAULT_FLAGS },
    flows: {},
    lateral: "",
    zoneMatch: {},
    matrix: {},
    breach: { initial: "", hop: "", beacon: "", w1: "", w2: "" },
    review: {},
    surface: {},
    failctx: {},
  };
}

// ── Progress state ───────────────────────────────────────────────────────────
// obj: id -> { attempts, passed, hintsUsed, last? }
function initialProgress() {
  return {
    v: 1,
    mode: null,
    stage: "mode",
    briefingSeen: false,
    env: initialEnv(),
    obj: {},
    quiz: { answers: {}, checked: {}, graded: false },
    certSeen: false,
  };
}

// ── Persistence (localStorage, graceful degradation) ─────────────────────────
const STORAGE_KEY = "nw-lab-sy0801-32-v1"; // SAME key as the original lab

function loadPersisted() {
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return initialProgress();
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.v !== 1) return initialProgress();
    // merge defensively so older saves never crash new validators
    const base = initialProgress();
    return {
      ...base,
      ...parsed,
      env: {
        ...base.env,
        ...parsed.env,
        flags: { ...base.env.flags, ...(parsed.env?.flags ?? {}) },
        links: { ...base.env.links, ...(parsed.env?.links ?? {}) },
        assets: { ...base.env.assets, ...(parsed.env?.assets ?? {}) },
        breach: { ...base.env.breach, ...(parsed.env?.breach ?? {}) },
      },
      obj: parsed.obj ?? {},
      quiz: {
        answers: parsed.quiz?.answers ?? {},
        checked: parsed.quiz?.checked ?? {},
        graded: parsed.quiz?.graded ?? false,
      },
    };
  } catch {
    return initialProgress();
  }
}

function savePersisted(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable — lab still fully playable in-session */
  }
}

// ── Tiny pub/sub store (stands in for the original React useLab hook) ────────
function createLabStore() {
  let state = initialProgress();
  let hydrated = false;
  const listeners = new Set();
  let saveTimer = null;

  function emit() {
    for (const fn of listeners) fn();
  }

  function scheduleSave() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => savePersisted(store.state), 250); // same 250 ms debounce
  }

  const store = {
    get state() {
      return state;
    },
    get hydrated() {
      return hydrated;
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    /** one-time rehydration after first paint (mirrors the original's useEffect) */
    hydrate() {
      state = loadPersisted();
      hydrated = true;
      emit();
    },
    /** functional update, exactly like the original's patch(fn) */
    patch(fn) {
      state = fn(state);
      scheduleSave();
      emit();
    },
    /** update only the env slice (mirrors Workbench's update helper) */
    updateEnv(mutate) {
      state = { ...state, env: structuredClone(state.env) };
      mutate(state.env);
      scheduleSave();
      emit();
    },
    /** confirmed reset → remove key, back to pristine */
    reset() {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      state = initialProgress();
      emit();
    },
  };
  return store;
}

// ── Screen-reader announcements (same live region as the original) ───────────
function announce(msg) {
  if (typeof window === "undefined") return;
  const el = document.getElementById("lab-live-region");
  if (el) {
    el.textContent = "";
    window.setTimeout(() => {
      el.textContent = msg;
    }, 30);
  }
}
