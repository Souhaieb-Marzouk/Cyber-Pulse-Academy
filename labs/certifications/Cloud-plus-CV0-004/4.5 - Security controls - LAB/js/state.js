/* ─────────────────────────────────────────────────────────────────────────────
 * state.js — lab state, persistence, tiny pub/sub store and seeded shuffle.
 * Ported 1:1 from the original framework lab (src/lib/lab/engine.ts useLabState
 * + src/lib/lab/shuffle.ts). The SAME persistence key, state shape, save /
 * restore / RESET semantics are preserved.
 * ───────────────────────────────────────────────────────────────────────────── */

var STORAGE_KEY = "cv0004-l45-cutaway-v1";
var STATE_VERSION = 1;

/** Detect storage availability once (mirrors the original storageOk flag). */
var storageOk = (function () {
  try {
    var k = STORAGE_KEY + ":probe";
    window.localStorage.setItem(k, "1");
    window.localStorage.removeItem(k);
    return true;
  } catch (e) {
    return false;
  }
})();

/** Pristine lab state (same shape and defaults as the original). */
function pristineState() {
  return {
    version: STATE_VERSION,
    mode: null,
    shuffleSeed: Math.floor(Math.random() * Math.pow(2, 31)),
    deployed: {},
    sgRules: LAB.SG_RULES_INITIAL.map(function (r) {
      return Object.assign({}, r);
    }),
    runs: {},
    answers: {},
    results: {},
    hintsUsed: {},
    quizAnswers: {},
    quizChecked: {},
    quizAdvanced: {},
    alertsHandled: {},
    completedSeen: false,
  };
}

/* ─── tiny pub/sub store ──────────────────────────────────────────────────── */

var store = (function () {
  var state = null; // loaded at boot
  var listeners = [];

  function publish() {
    listeners.forEach(function (fn) {
      fn(state);
    });
  }

  return {
    get: function () {
      return state;
    },
    /** Subscribe; returns an unsubscribe function. */
    subscribe: function (fn) {
      listeners.push(fn);
      return function () {
        var i = listeners.indexOf(fn);
        if (i > -1) listeners.splice(i, 1);
      };
    },
    /** Load persisted state (or pristine). Returns the state. */
    load: function () {
      var loaded = pristineState();
      try {
        var raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          var parsed = JSON.parse(raw);
          if (parsed && parsed.version === STATE_VERSION) loaded = parsed;
        }
      } catch (e) {
        // corrupted payload → fall back to pristine (storageOk unchanged;
        // a read failure on a populated key is treated like missing data)
      }
      state = loaded;
      return state;
    },
    /**
     * Apply a mutation. `silent` updates state + persists WITHOUT publishing —
     * used for continuous text input so focus/caret are never disturbed.
     */
    update: function (fn, silent) {
      state = fn(state || pristineState());
      if (storageOk) {
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
          /* keep running even if persistence fails mid-session */
        }
      }
      if (!silent) publish();
      return state;
    },
    /** Confirmed reset to pristine; storage cleared (same as original reset). */
    reset: function () {
      state = pristineState();
      if (storageOk) {
        try {
          window.localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
          /* ignore */
        }
      }
      publish();
      return state;
    },
  };
})();

/* ─── answer helpers (ported from ledger-widgets.tsx) ─────────────────────── */

function getAnswer(state, oid) {
  var a = state.answers[oid];
  return a === undefined || a === null ? {} : a;
}

/** Set/merge an objective answer. value may be a function of the previous value. */
function setAnswer(oid, value) {
  store.update(function (s) {
    var prev = s.answers[oid];
    var next = typeof value === "function" ? value(prev) : value;
    var answers = Object.assign({}, s.answers);
    answers[oid] = next;
    return Object.assign({}, s, { answers: answers });
  });
}

/* ─── seeded shuffle (R6, audit fix QA-2) ──────────────────────────────────── */
/* Deterministic, SSR-safe item shuffling for matching/classification widgets.
 * Display order must never reveal the correct pairs. A seeded Fisher-Yates
 * keeps the order stable across reloads (answers are keyed by id, so
 * persistence is unaffected) while breaking answer-cluster ordering. The seed
 * lives in LabState and is regenerated on RESET. Identical algorithm to the
 * original (FNV-1a hash + mulberry32). */

function hash32(str) {
  var h = 2166136261 >>> 0;
  for (var i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  var a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    var t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleSeeded(items, seed, salt) {
  var rand = mulberry32(hash32(salt) ^ (seed >>> 0));
  var out = items.slice();
  for (var i = out.length - 1; i > 0; i--) {
    var j = Math.floor(rand() * (i + 1));
    var tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}
