/**
 * state.js — Lab state store: single plain-JS state object + tiny
 * subscribe/notify mechanism + localStorage persistence.
 * ---------------------------------------------------------------------------
 * Persistence semantics are IDENTICAL to the original framework lab:
 *  - Same key: 'cysa143-lab-v1'
 *  - Restore on load (hydration-safe: state loads after first paint), sanitized
 *  - Save on every state change; degrade gracefully if storage is unavailable
 *  - RESET drops the stored run entirely and returns to mode selection
 */

/* ---------- persistence helpers ---------- */

function loadStoredState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return sanitize(JSON.parse(raw));
  } catch (e) {
    return null; // localStorage unavailable or corrupt — run ephemeral
  }
}

let saveTimer = null;
function persistState(state, debounceMs) {
  try {
    if (debounceMs) {
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(function () {
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store.state));
        } catch (e) { /* degrade gracefully */ }
      }, debounceMs);
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch (e) { /* degrade gracefully */ }
}

function clearStoredState() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (e) { /* ignore */ }
}

/* ---------- store ---------- */

const store = {
  state: null,   // LabState | null (null = mode-select screen)
  ready: false,  // false while the splash is showing (mirrors the original `ready` flag)
  listeners: [],

  /** Subscribe to state changes: fn(state, regions) */
  subscribe: function (fn) {
    this.listeners.push(fn);
  },

  /** Notify all subscribers which regions to re-render. */
  notify: function (regions) {
    for (const fn of this.listeners) fn(this.state, regions);
  },

  /** Boot: restore saved state (after first paint, like the original) then reveal. */
  init: function () {
    this.state = loadStoredState();
    this.ready = true;
    this.notify(['root']);
  },

  /** Replace the whole state object (mode select / switch / reset). */
  replace: function (nextState) {
    this.state = nextState;
    if (nextState) persistState(nextState);
    else clearStoredState();
    this.notify(['root']);
  },

  /**
   * Patch the state with an updater function.
   * Updaters may return the full state OR a partial object — partials are
   * shallow-merged into the current state (React setState semantics).
   * @param {function(object): object} fn - receives current state, returns new/partial state (or undefined to keep)
   * @param {string[]|null} [regions] - regions to re-render: 'masthead','nav','stage','ledger'; null = silent (save only)
   * @param {boolean} [debounceSave] - debounce the localStorage write (text input events)
   */
  patch: function (fn, regions, debounceSave) {
    if (!this.state) return;
    const next = fn(this.state);
    if (next === undefined) { if (debounceSave) persistState(this.state, debounceSave); return; }
    // Partial-update support: merge plain objects into the current state.
    this.state = (next && typeof next === 'object' && !Array.isArray(next))
      ? Object.assign({}, this.state, next)
      : next;
    persistState(this.state, debounceSave);
    if (regions && regions.length) this.notify(regions);
  },
};

/* ---------- shared state helpers (mirror the original handlers) ---------- */

/** True when the run holds any real progress (drives the mode-switch confirm). */
function progressExists(s) {
  if (!s) return false;
  const objTouched = Object.keys(s.objectives).some(function (k) {
    const o = s.objectives[k];
    return o && (o.done || o.attempts > 0 || o.hintsUsed > 0);
  });
  return objTouched || Object.keys(s.quizAnswers).length > 0 || s.completed;
}

/** Set a single env value (accepts dotted paths like 'matched.malware'). */
function envSet(path, value) {
  store.patch(function (s) {
    const env = s.env;
    const parts = path.split('.');
    if (parts.length === 1) env[path] = value;
    else {
      const key = parts[0];
      const inner = parts[1];
      const obj = Object.assign({}, env[key]);
      obj[inner] = value;
      env[key] = obj;
    }
    return { env: env };
  }, ['stage']);
}

/** Toggle a value inside an env array (incidents, budget, flagged, selected.*). */
function envToggleList(path, value) {
  store.patch(function (s) {
    const env = s.env;
    const parts = path.split('.');
    const list = parts.length === 1 ? env[path] : env[parts[0]][parts[1]];
    const idx = list.indexOf(value);
    const next = idx === -1 ? list.concat([value]) : list.filter(function (x) { return x !== value; });
    if (parts.length === 1) env[path] = next;
    else {
      const obj = Object.assign({}, env[parts[0]]);
      obj[parts[1]] = next;
      env[parts[0]] = obj;
    }
    return { env: env };
  }, ['stage']);
}
