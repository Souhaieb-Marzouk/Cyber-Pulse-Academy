/* ============================================================================
   The Blueprint Room — js/state.js
   State store: single plain object + reducer + subscribe/notify + localStorage
   persistence. Ported 1:1 from the original store.tsx — same default state,
   same action semantics, same persistence key, same scoring math.
   ============================================================================ */

"use strict";

window.LAB_STORE = (function () {

  const STORAGE_KEY = "blueprint-room-v1"; // identical to the original

  const DEFAULT_STATE = {
    mode: null,
    site: "branch",
    tool: "inspector",
    selNode: null,
    selEdge: null,
    failedNodes: [],
    failedEdges: [],
    failureTried: [],
    pathRuns: [],
    metroAdded: [],   // edge keys "a|b" added on the metro build board
    annexNodes: [],
    annexEdges: [],
    answers: {},      // { objId: { fieldKey: value } }
    obj: {},          // { objId: { done, attempts, firstTry, hints } }
    quizAnswers: {},  // { qid: [values] }
    quizChecked: {},  // R2: questions lock at their per-question CHECK
    quizIndex: 0,     // R2: enforced one-at-a-time progression
    quizSubmitted: false,
    completed: false,
    startedAt: null,
  };

  const E = window.LAB_ENGINE;
  const D = window.LAB_DATA;

  /* --------------------------------- reducer -------------------------------- */

  function reducer(s, a) {
    switch (a.type) {
      case "START":
        return Object.assign({}, DEFAULT_STATE, { mode: a.mode, startedAt: Date.now(), site: "branch" });
      case "RESET":
        return Object.assign({}, DEFAULT_STATE);
      case "SET_SITE":
        return Object.assign({}, s, { site: a.site, selNode: null, selEdge: null, failedNodes: [], failedEdges: [], tool: "inspector" });
      case "SET_TOOL":
        return Object.assign({}, s, { tool: a.tool, selNode: null, selEdge: null });
      case "SELECT_NODE":
        return Object.assign({}, s, { selNode: a.id, selEdge: null });
      case "SELECT_EDGE":
        return Object.assign({}, s, { selEdge: a.id, selNode: null });
      case "TOGGLE_FAIL_NODE": {
        const has = s.failedNodes.indexOf(a.id) !== -1;
        return Object.assign({}, s, {
          failedNodes: has ? s.failedNodes.filter(function (n) { return n !== a.id; }) : s.failedNodes.concat([a.id]),
          failureTried: s.failureTried.indexOf(a.id) !== -1 ? s.failureTried : s.failureTried.concat([a.id]),
          selNode: a.id,
        });
      }
      case "TOGGLE_FAIL_EDGE":
        return Object.assign({}, s, {
          failedEdges: s.failedEdges.indexOf(a.id) !== -1 ? s.failedEdges.filter(function (n) { return n !== a.id; }) : s.failedEdges.concat([a.id]),
          selEdge: a.id,
        });
      case "CLEAR_FAILURES":
        return Object.assign({}, s, { failedNodes: [], failedEdges: [] });
      case "ADD_PATH_RUN":
        return Object.assign({}, s, { pathRuns: s.pathRuns.concat([a.run]) });
      case "ADD_METRO_LINK":
        return s.metroAdded.indexOf(a.key) !== -1 ? s : Object.assign({}, s, { metroAdded: s.metroAdded.concat([a.key]) });
      case "REMOVE_METRO_LINK":
        return Object.assign({}, s, { metroAdded: s.metroAdded.filter(function (k) { return k !== a.key; }) });
      case "CLEAR_METRO_LINKS":
        return Object.assign({}, s, { metroAdded: [] });
      case "PLACE_ANNEX_PART": {
        const kind = a.kind;
        const existing = s.annexNodes.filter(function (n) { return n.layer === kind || (kind === "host" && n.isHost); }).length;
        const slots = D.ANNEX_PART_SLOTS[kind];
        if (!slots || existing >= slots.length) return s;
        const slot = slots[existing];
        const id = kind + "-" + (existing + 1);
        let node;
        if (kind === "host") node = { id: id, label: "H-" + (existing + 1), kind: "host", isHost: true, x: slot.x, y: slot.y };
        else if (kind === "collapsed") node = { id: id, label: "CORE-" + (existing + 1), kind: "switch", layer: "collapsed", x: slot.x, y: slot.y };
        else node = { id: id, label: "ACC-" + (existing + 1), kind: "switch", layer: "access", x: slot.x, y: slot.y };
        return Object.assign({}, s, { annexNodes: s.annexNodes.concat([node]) });
      }
      case "ADD_ANNEX_LINK": {
        if (a.a === a.b) return s;
        const key = E.edgeKey(a.a, a.b);
        const dup = s.annexEdges.some(function (e) { return e.id === "bx-" + key || E.edgeKey(e.a, e.b) === key; });
        if (dup) return s;
        const edge = { id: "bx-" + key, a: a.a, b: a.b, media: "copper", bw: "proposed" };
        return Object.assign({}, s, { annexEdges: s.annexEdges.concat([edge]) });
      }
      case "REMOVE_ANNEX_NODE":
        return Object.assign({}, s, {
          annexNodes: s.annexNodes.filter(function (n) { return n.id !== a.id; }),
          annexEdges: s.annexEdges.filter(function (e) { return e.a !== a.id && e.b !== a.id; }),
          selNode: null,
        });
      case "REMOVE_ANNEX_EDGE":
        return Object.assign({}, s, { annexEdges: s.annexEdges.filter(function (e) { return e.id !== a.id; }), selEdge: null });
      case "CLEAR_ANNEX_BUILD":
        return Object.assign({}, s, { annexNodes: [], annexEdges: [], selNode: null, selEdge: null });
      case "SET_ANSWER": {
        const objAnswers = Object.assign({}, s.answers[a.objId] || {}, (function (o) { o[a.key] = a.value; return o; })({}));
        return Object.assign({}, s, { answers: Object.assign({}, s.answers, (function (o) { o[a.objId] = objAnswers; return o; })({})) });
      }
      case "RECORD_CHECK": {
        const prev = s.obj[a.objId] || { done: false, attempts: 0, firstTry: false, hints: 0 };
        const next = {
          done: prev.done || a.pass,
          attempts: prev.attempts + 1,
          firstTry: prev.firstTry || (a.pass && prev.attempts === 0),
          hints: prev.hints,
        };
        return Object.assign({}, s, { obj: Object.assign({}, s.obj, (function (o) { o[a.objId] = next; return o; })({})) });
      }
      case "USE_HINT": {
        const prev = s.obj[a.objId] || { done: false, attempts: 0, firstTry: false, hints: 0 };
        const next = Object.assign({}, prev, { hints: Math.min(prev.hints + 1, 3) });
        return Object.assign({}, s, { obj: Object.assign({}, s.obj, (function (o) { o[a.objId] = next; return o; })({})) });
      }
      case "QUIZ_ANSWER":
        if (s.quizChecked[a.qid]) return s; // R2: answer already validated — locked
        return Object.assign({}, s, { quizAnswers: Object.assign({}, s.quizAnswers, (function (o) { o[a.qid] = a.values; return o; })({})) });
      case "QUIZ_CHECK":
        if (!((s.quizAnswers[a.qid] || []).length > 0)) return s; // nothing selected → no validation
        return Object.assign({}, s, { quizChecked: Object.assign({}, s.quizChecked, (function (o) { o[a.qid] = true; return o; })({})) });
      case "QUIZ_NEXT": {
        const quiz = window.LAB_QUIZ.quizFor(s.mode || "medium");
        const cur = quiz[Math.min(s.quizIndex, quiz.length - 1)];
        if (!cur || !s.quizChecked[cur.id]) return s; // must check before advancing
        const next = s.quizIndex + 1;
        return Object.assign({}, s, { quizIndex: next, quizSubmitted: s.quizSubmitted || next >= quiz.length });
      }
      case "QUIZ_SUBMIT":
        return Object.assign({}, s, { quizSubmitted: true });
      case "COMPLETE":
        return Object.assign({}, s, { completed: true });
      default:
        return s;
    }
  }

  /* ------------------------------ persistence ------------------------------- */

  function loadInitialState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) return Object.assign({}, DEFAULT_STATE, JSON.parse(raw));
    } catch (e) {
      /* degrade gracefully */
    }
    return Object.assign({}, DEFAULT_STATE);
  }

  function persist(state) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* degrade gracefully */
    }
  }

  /* -------------------------- store (pub/sub) ------------------------------- */

  const listeners = new Set();

  const store = {
    state: null,
    dispatch: function (action) {
      const next = reducer(this.state, action);
      if (next !== this.state) {
        this.state = next;
        persist(next);
        listeners.forEach(function (fn) { fn(); });
      }
    },
    subscribe: function (fn) {
      listeners.add(fn);
      return function () { listeners.delete(fn); };
    },
  };

  /* --------------------- graph accessors (per state) ------------------------ */

  function annexGraph(state) {
    return {
      id: "build-annex",
      name: "Annex Build Board",
      sheet: "BLD-02",
      blurb: "Construction desk — place parts and link them.",
      anchor: (state.annexNodes.find(function (n) { return n.layer === "collapsed"; }) || {}).id || "",
      hosts: state.annexNodes.filter(function (n) { return n.isHost; }).map(function (n) { return n.id; }),
      nodes: state.annexNodes,
      edges: state.annexEdges,
      truth: "collapsed core (two-tier) — under construction",
      viewBox: D.BUILD_ANNEX_VIEWBOX,
      isBuild: true,
    };
  }

  function graph(state, siteId) {
    if (siteId === "metro" || siteId === "build-metro") return E.metroBuildGraph(state.metroAdded);
    if (siteId === "build-annex") return annexGraph(state);
    return D.SITES.find(function (s) { return s.id === siteId; }) || D.SITES[0];
  }

  function downHostsFor(state, siteId) {
    return E.downHosts(graph(state, siteId), state.failedNodes, state.failedEdges);
  }

  /** Check context handed to objective validators (same shape as makeCheckCtx). */
  function makeCheckCtx(state) {
    return {
      s: state,
      graph: function (siteId) { return graph(state, siteId); },
      downHosts: function (siteId) { return downHostsFor(state, siteId); },
      metroEdges: function () { return graph(state, "metro").edges; },
      annexGraph: function () { return annexGraph(state); },
    };
  }

  /* --------------------------- evidence groups ------------------------------ */
  /* The original serves one evidence file per site. Static-port fix: in HARD
     mode the Branch sheet also serves the 14:03 incident file (needed by H10;
     see Conversion Notes). Medium behavior is identical to the original. */

  function evidenceGroups(state, siteId) {
    const site = graph(state, siteId);
    const groups = (site.evidenceGroups || []).slice();
    if (siteId === "branch" && state.mode === "hard") groups.push(D.BRANCH_EVIDENCE_2);
    return groups;
  }

  /* ------------------------------- scoring ---------------------------------- */

  function allDone(state, objs) {
    return objs.every(function (o) { return state.obj[o.id] && state.obj[o.id].done; });
  }

  function scoreQuiz(state, quiz) {
    let correct = 0;
    for (const q of quiz) {
      const got = state.quizAnswers[q.id] || [];
      if (got.length === q.correct.length && got.slice().sort().join(",") === q.correct.slice().sort().join(",")) correct += 1;
    }
    return { correct: correct, total: quiz.length };
  }

  function computeStars(state, objs, quiz) {
    const total = objs.length;
    const done = objs.filter(function (o) { return state.obj[o.id] && state.obj[o.id].done; }).length;
    const firstTry = objs.filter(function (o) { return state.obj[o.id] && state.obj[o.id].firstTry; }).length;
    const hints = objs.reduce(function (acc, o) { return acc + ((state.obj[o.id] && state.obj[o.id].hints) || 0); }, 0);
    const q = scoreQuiz(state, quiz);
    const objRatio = total ? firstTry / total : 0;
    const doneRatio = total ? done / total : 0;
    const quizRatio = q.total ? q.correct / q.total : 0;
    const raw = 0.55 * objRatio + 0.15 * doneRatio + 0.3 * quizRatio;
    const penalty = Math.min(0.25, hints * 0.03);
    const finalScore = Math.max(0, raw - penalty);
    const stars = Math.max(1, Math.min(5, Math.round(finalScore * 5)));
    return { stars: stars, finalScore: finalScore, objRatio: objRatio, doneRatio: doneRatio, quizRatio: quizRatio, penalty: penalty, hints: hints, firstTry: firstTry, done: done, total: total, quiz: q };
  }

  store.state = loadInitialState();

  return {
    STORAGE_KEY: STORAGE_KEY,
    DEFAULT_STATE: DEFAULT_STATE,
    store: store,
    reducer: reducer,
    graph: graph,
    annexGraph: annexGraph,
    downHostsFor: downHostsFor,
    evidenceGroups: evidenceGroups,
    makeCheckCtx: makeCheckCtx,
    allDone: allDone,
    scoreQuiz: scoreQuiz,
    computeStars: computeStars,
  };
})();
