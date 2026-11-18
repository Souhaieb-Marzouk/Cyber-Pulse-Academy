/* ============================================================================
   The Blueprint Room — js/app.js
   Bootstrap + event wiring. A single delegated listener dispatches lab actions
   into the store; every store change re-renders the app with focus and scroll
   positions preserved (mirroring React's reconciliation behavior).
   ============================================================================ */

"use strict";

(function () {

  const S = window.LAB_STORE;
  const O = window.LAB_OBJECTIVES;
  const Q = window.LAB_QUIZ;
  const D = window.LAB_DATA;
  const E = window.LAB_ENGINE;
  const UI = window.LAB_UI;

  const store = S.store;

  /* Ephemeral UI state (never persisted) — mirrors the original React
     useState hooks: drawer, dialogs, completion modal, link-from hand,
     path tester working state, spec outcomes, guide accordion. */
  const ui = {
    drawer: null,          // null | spec | guide | quiz | handover
    dialog: null,          // null | reset | mode
    completionOpen: false,
    linkFrom: null,        // build-mode "link in hand"
    pathFrom: "",
    pathTo: "",
    lastRun: null,         // node id array of the last trace
    outcomes: {},          // { objId: { pass, text } } — check feedback
    guideOpen: D.GUIDE[0] ? D.GUIDE[0].id : null,
    dd: null,              // open dropdown id
    ddActive: 0,           // active option index in the open dropdown
  };
  window.__ui = ui;

  /* ------------------------- focus / scroll preservation -------------------- */

  function snapshot() {
    const snap = { scrollY: window.scrollY, scrolls: [], focus: null, caret: null };
    document.querySelectorAll("[data-skey]").forEach(function (el) {
      snap.scrolls.push({ key: el.getAttribute("data-skey"), top: el.scrollTop });
    });
    const ae = document.activeElement;
    if (ae && ae.closest("#app")) {
      const fk = ae.getAttribute("data-fkey");
      if (fk) {
        snap.focus = fk;
        try { snap.caret = ae.selectionStart; } catch (e) { /* not an input */ }
      }
    }
    return snap;
  }

  function restore(snap) {
    snap.scrolls.forEach(function (s) {
      const el = document.querySelector('[data-skey="' + s.key + '"]');
      if (el) el.scrollTop = s.top;
    });
    window.scrollTo(0, snap.scrollY);
    if (snap.focus) {
      const el = document.querySelector('[data-fkey="' + snap.focus + '"]');
      if (el) {
        el.focus({ preventScroll: true });
        if (snap.caret !== null && snap.caret !== undefined && el.setSelectionRange) {
          try { el.setSelectionRange(snap.caret, snap.caret); } catch (e) { /* number input quirks */ }
        }
      }
    }
  }

  let renderQueued = false;
  function render() {
    renderQueued = false;
    const snap = snapshot();
    document.getElementById("app").innerHTML = UI.render(store.state, ui);
    restore(snap);
  }

  function scheduleRender() {
    if (!renderQueued) {
      renderQueued = true;
      requestAnimationFrame(render);
    }
  }

  store.subscribe(scheduleRender);

  /* ------------------------------ option lookup ----------------------------- */

  function dropdownOptions(ddId) {
    const state = store.state;
    if (ddId.indexOf("f:") === 0) {
      const parts = ddId.split(":");
      const obj = O.OBJECTIVES.find(function (o) { return o.id === parts[1]; });
      if (!obj) return [];
      const field = obj.fields.find(function (f) { return f.key === parts[2]; });
      return field && field.options ? field.options : [];
    }
    if (ddId === "path-from" || ddId === "path-to") {
      const mode = state.mode || "medium";
      const isAnnexBuild = state.site === "annex" && state.tool === "build";
      const g = isAnnexBuild ? S.annexGraph(state) : S.graph(state, state.site);
      return g.hosts.map(function (h) {
        return { value: h, label: UI.labelOf(g, h) };
      });
    }
    return [];
  }

  function dropdownDisabled(ddId) {
    if (ddId.indexOf("f:") === 0) {
      const parts = ddId.split(":");
      const prog = store.state.obj[parts[1]];
      return !!(prog && prog.done);
    }
    return false;
  }

  function openDropdown(ddId) {
    if (dropdownDisabled(ddId)) return;
    ui.dd = ddId;
    const opts = dropdownOptions(ddId);
    const state = store.state;
    let current = "";
    if (ddId.indexOf("f:") === 0) {
      current = ((state.answers[ddId.split(":")[1]] || {})[ddId.split(":")[2]] || "");
    } else if (ddId === "path-from") current = ui.pathFrom;
    else if (ddId === "path-to") current = ui.pathTo;
    const idx = opts.findIndex(function (o) { return o.value === current; });
    ui.ddActive = idx >= 0 ? idx : 0;
    render();
  }

  function closeDropdown() {
    if (ui.dd !== null) {
      ui.dd = null;
      render();
    }
  }

  function pickDropdown(ddId, val) {
    if (ddId.indexOf("f:") === 0) {
      const parts = ddId.split(":");
      store.dispatch({ type: "SET_ANSWER", objId: parts[1], key: parts[2], value: val });
    } else if (ddId === "path-from") ui.pathFrom = val;
    else if (ddId === "path-to") ui.pathTo = val;
    ui.dd = null;
    render();
  }

  /* ------------------------------ lab actions ------------------------------- */

  function runCheck(obj) {
    const ctx = S.makeCheckCtx(store.state);
    const res = obj.check(ctx);
    store.dispatch({ type: "RECORD_CHECK", objId: obj.id, pass: res.pass });
    const text = res.pass
      ? (res.msg ? res.msg + " " : "") + obj.success
      : (res.msg ? res.msg + " " : "") + obj.fail;
    ui.outcomes[obj.id] = { pass: res.pass, text: text };
    scheduleRender();
  }

  function goTo(obj) {
    if (!obj.site) return;
    if (obj.site.indexOf("build-") === 0) {
      store.dispatch({ type: "SET_SITE", site: obj.site.replace("build-", "") });
      store.dispatch({ type: "SET_TOOL", tool: "build" });
    } else {
      store.dispatch({ type: "SET_SITE", site: obj.site });
      store.dispatch({ type: "SET_TOOL", tool: "inspector" });
    }
  }

  function signOff() {
    store.dispatch({ type: "COMPLETE" });
    ui.drawer = null;
    ui.completionOpen = true;
    render();
  }

  function startRun(mode) {
    store.dispatch({ type: "START", mode: mode });
    ui.drawer = null;
    ui.dialog = null;
    ui.completionOpen = false;
    ui.linkFrom = null;
    ui.pathFrom = "";
    ui.pathTo = "";
    ui.lastRun = null;
    ui.outcomes = {};
    ui.dd = null;
    render();
  }

  /* --------------------------- delegated click handler ---------------------- */

  document.getElementById("app").addEventListener("click", function (ev) {
    const el = ev.target.closest("[data-act]");

    // click-away closes an open dropdown
    if (ui.dd !== null && !ev.target.closest(".dd")) closeDropdown();

    if (!el) return;
    const act = el.getAttribute("data-act");
    const state = store.state;
    const mode = state.mode || "medium";
    const objs = O.objectivesFor(mode);

    switch (act) {
      case "start":
        startRun(el.getAttribute("data-mode"));
        break;
      case "drawer": {
        const id = el.getAttribute("data-drawer");
        ui.dd = null;
        ui.drawer = ui.drawer === id ? null : id;
        if (ui.drawer === "guide") ui.guideOpen = D.GUIDE[0] ? D.GUIDE[0].id : null; // guide resets on open (as the original remounts it)
        render();
        break;
      }
      case "dialog":
        ui.dd = null;
        ui.dialog = el.getAttribute("data-dialog");
        render();
        break;
      case "close-dialog":
        ui.dialog = null;
        render();
        break;
      case "reset-confirm":
        startRunReset();
        break;
      case "mode-switch":
        startRun(el.getAttribute("data-mode"));
        break;
      case "site":
        store.dispatch({ type: "SET_SITE", site: el.getAttribute("data-site") });
        ui.linkFrom = null;
        ui.dd = null;
        break;
      case "tool":
        store.dispatch({ type: "SET_TOOL", tool: el.getAttribute("data-tool") });
        ui.linkFrom = null;
        ui.dd = null;
        break;
      case "node": {
        const id = el.getAttribute("data-id");
        if (state.tool === "failure") { store.dispatch({ type: "TOGGLE_FAIL_NODE", id: id }); break; }
        if (state.tool === "build") {
          const isBuildSite = state.site === "metro" || state.site === "annex";
          if (!isBuildSite) { store.dispatch({ type: "SELECT_NODE", id: id }); break; }
          if (!ui.linkFrom) {
            ui.linkFrom = id;
            store.dispatch({ type: "SELECT_NODE", id: id });
            break;
          }
          if (ui.linkFrom === id) { ui.linkFrom = null; render(); break; }
          if (state.site === "metro") store.dispatch({ type: "ADD_METRO_LINK", key: [ui.linkFrom, id].sort().join("|") });
          else store.dispatch({ type: "ADD_ANNEX_LINK", a: ui.linkFrom, b: id });
          ui.linkFrom = null;
          break;
        }
        store.dispatch({ type: "SELECT_NODE", id: id });
        break;
      }
      case "edge": {
        const id = el.getAttribute("data-id");
        if (state.tool === "failure") store.dispatch({ type: "TOGGLE_FAIL_EDGE", id: id });
        else store.dispatch({ type: "SELECT_EDGE", id: id });
        break;
      }
      case "rig-device": {
        const id = el.getAttribute("data-id");
        store.dispatch({ type: "TOGGLE_FAIL_NODE", id: id });
        break;
      }
      case "clear-failures":
        store.dispatch({ type: "CLEAR_FAILURES" });
        break;
      case "path-run": {
        if (!ui.pathFrom || !ui.pathTo || ui.pathFrom === ui.pathTo) break;
        const isAnnexBuild = state.site === "annex" && state.tool === "build";
        const g = isAnnexBuild ? S.annexGraph(state) : S.graph(state, state.site);
        const path = shortestPathLocal(g, ui.pathFrom, ui.pathTo, state.failedNodes, state.failedEdges);
        if (!path) { ui.lastRun = null; render(); break; }
        ui.lastRun = path;
        store.dispatch({ type: "ADD_PATH_RUN", run: { site: state.site, pair: [ui.pathFrom, ui.pathTo].sort().join("|"), hops: path.length - 1 } });
        break;
      }
      case "metro-remove":
        store.dispatch({ type: "REMOVE_METRO_LINK", key: el.getAttribute("data-key") });
        break;
      case "metro-clear":
        store.dispatch({ type: "CLEAR_METRO_LINKS" });
        ui.linkFrom = null;
        break;
      case "annex-place":
        store.dispatch({ type: "PLACE_ANNEX_PART", kind: el.getAttribute("data-kind") });
        break;
      case "annex-remove-node":
        if (state.selNode) store.dispatch({ type: "REMOVE_ANNEX_NODE", id: state.selNode });
        break;
      case "annex-remove-edge":
        if (state.selEdge) store.dispatch({ type: "REMOVE_ANNEX_EDGE", id: state.selEdge });
        break;
      case "annex-clear":
        store.dispatch({ type: "CLEAR_ANNEX_BUILD" });
        ui.linkFrom = null;
        break;
      case "goto": {
        const obj = objs.find(function (o) { return o.id === el.getAttribute("data-obj"); });
        if (obj) goTo(obj);
        break;
      }
      case "check": {
        const obj = objs.find(function (o) { return o.id === el.getAttribute("data-obj"); });
        if (obj) runCheck(obj);
        break;
      }
      case "hint":
        store.dispatch({ type: "USE_HINT", objId: el.getAttribute("data-obj") });
        break;
      case "multi": {
        const objId = el.getAttribute("data-obj");
        const key = el.getAttribute("data-key");
        const val = el.getAttribute("data-val");
        const prog = state.obj[objId];
        if (prog && prog.done) break;
        const cur = ((state.answers[objId] || {})[key] || "").split(",").filter(Boolean);
        const next = cur.indexOf(val) !== -1 ? cur.filter(function (v) { return v !== val; }) : cur.concat([val]);
        store.dispatch({ type: "SET_ANSWER", objId: objId, key: key, value: next.join(",") });
        break;
      }
      case "dd-toggle": {
        const ddId = el.getAttribute("data-dd");
        if (ui.dd === ddId) closeDropdown();
        else openDropdown(ddId);
        break;
      }
      case "dd-pick":
        pickDropdown(el.getAttribute("data-dd"), el.getAttribute("data-val"));
        break;
      case "guide":
        ui.guideOpen = ui.guideOpen === el.getAttribute("data-guide") ? null : el.getAttribute("data-guide");
        render();
        break;
      case "quiz-toggle": {
        const qid = el.getAttribute("data-qid");
        const val = el.getAttribute("data-val");
        const multi = el.getAttribute("data-multi") === "true";
        if (state.quizSubmitted || state.quizChecked[qid]) break; // R2 lock (defense in depth)
        const quiz = Q.quizFor(mode);
        const q = quiz[state.quizIndex];
        if (!q || q.id !== qid) break; // only the active question accepts answers
        if (!multi) {
          store.dispatch({ type: "QUIZ_ANSWER", qid: qid, values: [val] });
          break;
        }
        const cur = state.quizAnswers[qid] || [];
        store.dispatch({ type: "QUIZ_ANSWER", qid: qid, values: cur.indexOf(val) !== -1 ? cur.filter(function (v) { return v !== val; }) : cur.concat([val]) });
        break;
      }
      case "quiz-check": {
        const qid = el.getAttribute("data-qid");
        store.dispatch({ type: "QUIZ_CHECK", qid: qid });
        break;
      }
      case "quiz-next":
        store.dispatch({ type: "QUIZ_NEXT" });
        break;
      case "signoff":
        signOff();
        break;
      case "completion-close":
        ui.completionOpen = false;
        render();
        break;
      case "completion-review":
        ui.completionOpen = false;
        ui.drawer = "handover";
        render();
        break;
      case "completion-fresh":
        ui.completionOpen = false;
        startRunReset();
        break;
      case "overlay-close": {
        if (ev.target !== el) break; // click landed inside the dialog panel
        const which = el.getAttribute("data-overlay");
        if (which === "reset" || which === "mode") ui.dialog = null;
        if (which === "completion") ui.completionOpen = false;
        render();
        break;
      }
    }
  });

  function startRunReset() {
    store.dispatch({ type: "RESET" });
    ui.drawer = null;
    ui.dialog = null;
    ui.completionOpen = false;
    ui.linkFrom = null;
    ui.pathFrom = "";
    ui.pathTo = "";
    ui.lastRun = null;
    ui.outcomes = {};
    ui.dd = null;
    render();
  }

  function shortestPathLocal(g, a, b, failedNodes, failedEdges) {
    return E.shortestPath(g, a, b, failedNodes, failedEdges);
  }

  /* --------------------------- input (typing) handler ----------------------- */

  document.getElementById("app").addEventListener("input", function (ev) {
    const el = ev.target.closest("[data-act='ans-input']");
    if (!el) return;
    store.dispatch({ type: "SET_ANSWER", objId: el.getAttribute("data-obj"), key: el.getAttribute("data-key"), value: ev.target.value });
  });

  /* ------------------------------ keyboard paths ---------------------------- */

  document.addEventListener("keydown", function (ev) {
    // ESC layering: dropdown > dialog > completion > drawer
    if (ev.key === "Escape") {
      if (ui.dd !== null) { closeDropdown(); return; }
      if (ui.dialog !== null) { ui.dialog = null; render(); return; }
      if (ui.completionOpen) { ui.completionOpen = false; render(); return; }
      if (ui.drawer !== null) { ui.drawer = null; render(); return; }
      return;
    }

    const ae = document.activeElement;

    // dropdown keyboard navigation (listbox pattern with aria-activedescendant)
    if (ui.dd !== null) {
      const opts = dropdownOptions(ui.dd);
      if (ev.key === "ArrowDown") {
        ev.preventDefault();
        ui.ddActive = Math.min(ui.ddActive + 1, opts.length - 1);
        render();
        return;
      }
      if (ev.key === "ArrowUp") {
        ev.preventDefault();
        ui.ddActive = Math.max(ui.ddActive - 1, 0);
        render();
        return;
      }
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        if (opts[ui.ddActive]) pickDropdown(ui.dd, opts[ui.ddActive].value);
        return;
      }
      if (ev.key === "Tab") { closeDropdown(); return; }
      return;
    }

    // open dropdown from a focused combobox trigger
    if (ae && ae.getAttribute && ae.getAttribute("data-act") === "dd-toggle" && (ev.key === "Enter" || ev.key === " " || ev.key === "ArrowDown")) {
      ev.preventDefault();
      openDropdown(ae.getAttribute("data-dd"));
      return;
    }

    // activate SVG node/edge "buttons" and any element with data-act on Enter/Space
    if ((ev.key === "Enter" || ev.key === " ") && ae) {
      const t = ae.closest ? ae.closest("[data-act]") : null;
      if (t && t.tagName && (t.tagName.toLowerCase() === "g" || t.getAttribute("role") === "button")) {
        ev.preventDefault();
        // SVG elements have no .click() — dispatch a real bubbling click event
        t.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      }
    }

  });

  // R2: after the quiz index advances, scroll the newly active question into view
  let lastQuizIndex = store.state.quizIndex;
  store.subscribe(function () {
    const state = store.state;
    if (state.mode && state.quizIndex !== lastQuizIndex) {
      lastQuizIndex = store.state.quizIndex;
      const mode = state.mode || "medium";
      const quiz = Q.quizFor(mode);
      if (state.quizIndex > 0 && state.quizIndex < quiz.length) {
        requestAnimationFrame(function () {
          const node = document.querySelector('[data-qidx="' + state.quizIndex + '"]');
          if (node) node.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      }
    }
  });

  /* --------------------------------- boot ----------------------------------- */

  render();
})();
