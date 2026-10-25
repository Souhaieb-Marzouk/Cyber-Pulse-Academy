/* ═══════════════════════════════════════════════════════════════════════════
   THE CONTROL GRID — js/state.js
   State object, pub/sub, persistence, objective helpers, star scoring.
   Same state shape, same persistence key, same save/restore/RESET semantics
   as the original lab.
   ═══════════════════════════════════════════════════════════════════════════ */

"use strict";

(function () {
  var STATE_VERSION = 1;

  function initialState() {
    return {
      v: STATE_VERSION,
      mode: null,
      phase: "mode",
      briefSeen: false,
      coreSeen: false,
      currentObj: null,
      progress: {},
      answers: {},
      results: {},
      quiz: { idx: 0, answers: {}, revealed: {}, done: false },
      completionSeen: false,
    };
  }

  /* ─── Pub/sub ─────────────────────────────────────────────────────────────
     The whole lab re-renders from a single state object; listeners fire after
     every committed change. Persist-on-change lives in the subscription. */

  var listeners = [];
  var state = initialState();

  function subscribe(fn) {
    listeners.push(fn);
  }

  /** Replace state and notify. Pass silent=true to skip notification. */
  function setState(next, silent) {
    state = next;
    if (!silent) notify();
  }

  /** Mutate via updater function, then notify. */
  function update(fn) {
    state = fn(state) || state;
    notify();
  }

  function getState() {
    return state;
  }

  function notify() {
    for (var i = 0; i < listeners.length; i++) listeners[i](state);
  }

  /* ─── Persistence (same key + version gate as the original) ────────────── */

  function loadState() {
    try {
      var raw = localStorage.getItem(CG.LAB_META.storageKey);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (parsed && parsed.v === STATE_VERSION) return parsed;
      return null;
    } catch (e) {
      return null; // localStorage failures degrade gracefully
    }
  }

  function saveState(s) {
    try {
      localStorage.setItem(CG.LAB_META.storageKey, JSON.stringify(s));
    } catch (e) {
      /* storage full or unavailable — lab keeps working in memory */
    }
  }

  function clearState() {
    try {
      localStorage.removeItem(CG.LAB_META.storageKey);
    } catch (e) {
      /* noop */
    }
  }

  function storageAvailable() {
    try {
      localStorage.setItem("__cg_probe", "1");
      localStorage.removeItem("__cg_probe");
      return true;
    } catch (e) {
      return false;
    }
  }

  /* ─── Objectives helpers (same semantics as the original) ──────────────── */

  function objectivesForMode(mode) {
    var list = mode === "medium" ? CG.MEDIUM_OBJECTIVES : CG.HARD_OBJECTIVES;
    return list.slice().sort(function (a, b) {
      return a.order - b.order;
    });
  }

  function isObjectiveUnlocked(obj, mode, s) {
    if (mode === "hard") return true;
    var list = objectivesForMode(mode);
    var idx = -1;
    for (var i = 0; i < list.length; i++) if (list[i].id === obj.id) { idx = i; break; }
    if (idx <= 0) return true;
    for (var j = 0; j < idx; j++) {
      if (!(s.progress[list[j].id] && s.progress[list[j].id].done)) return false;
    }
    return true;
  }

  function firstIncompleteUnlocked(mode, s) {
    var list = objectivesForMode(mode);
    for (var i = 0; i < list.length; i++) {
      var o = list[i];
      var done = s.progress[o.id] && s.progress[o.id].done;
      if (!done && isObjectiveUnlocked(o, mode, s)) return o.id;
    }
    return null;
  }

  function initialAnswer(obj) {
    var p = obj.payload;
    switch (p.kind) {
      case "choose":
        return [];
      case "sort":
        var s = {};
        p.tiles.forEach(function (t) { s[t.id] = null; });
        return s;
      case "match":
        var m = {};
        p.lefts.forEach(function (l) { m[l.id] = null; });
        return m;
      case "classify":
        var c = {};
        p.cards.forEach(function (card) { c[card.id] = { cat: "", type: "" }; });
        return c;
      case "evidence":
        var e = {};
        p.items.forEach(function (it) { e[it.id] = null; });
        return e;
      case "register":
        var r = {};
        p.findings.forEach(function (f) { r[f.id] = null; });
        return r;
      case "depth":
        return [];
      case "order":
        return p.presented.slice();
    }
    return null;
  }

  function ensureAnswers(s, mode) {
    var list = objectivesForMode(mode);
    var answers = Object.assign({}, s.answers);
    list.forEach(function (o) {
      if (answers[o.id] === undefined) answers[o.id] = initialAnswer(o);
    });
    return Object.assign({}, s, { answers: answers });
  }

  function resumePhase(s) {
    if (s.phase !== "mode") return s.phase;
    if (!s.briefSeen) return "brief";
    if (!s.coreSeen) return "core";
    return "work";
  }

  function readInitialState() {
    var loaded = loadState();
    if (loaded) return loaded.mode ? ensureAnswers(loaded, loaded.mode) : loaded;
    return initialState();
  }

  /* ─── Stars & scoring (C7 — same formula) ──────────────────────────────── */

  function computeStars(mode, s) {
    var list = objectivesForMode(mode);
    var done = list.filter(function (o) { return s.progress[o.id] && s.progress[o.id].done; });
    if (done.length === 0) return { stars: 0, firstTryRate: 0, hints: 0 };
    var firstTryCount = done.filter(function (o) { return s.progress[o.id].firstTry; }).length;
    var firstTry = firstTryCount / done.length;
    var hints = done.reduce(function (acc, o) { return acc + (s.progress[o.id].hints || 0); }, 0);
    var hintCap = mode === "hard" ? 0 : 3; // hard: the single nudge always costs a star tier
    var stars = 1;
    if (firstTry >= 0.65) stars = 2;
    if (firstTry >= 0.9 && hints <= hintCap) stars = 3;
    return { stars: stars, firstTryRate: firstTry, hints: hints };
  }

  /* ─── Export ───────────────────────────────────────────────────────────── */

  CG.state = {
    STATE_VERSION: STATE_VERSION,
    initialState: initialState,
    readInitialState: readInitialState,
    subscribe: subscribe,
    getState: getState,
    setState: setState,
    update: update,
    loadState: loadState,
    saveState: saveState,
    clearState: clearState,
    storageAvailable: storageAvailable,
    objectivesForMode: objectivesForMode,
    isObjectiveUnlocked: isObjectiveUnlocked,
    firstIncompleteUnlocked: firstIncompleteUnlocked,
    initialAnswer: initialAnswer,
    ensureAnswers: ensureAnswers,
    resumePhase: resumePhase,
    computeStars: computeStars,
  };
})();
