// ORBIT static port — bootstrap, event wiring, overlays (app shell, F1-F23).
// One delegated click/change handler maps data-action attributes to store
// calls; a tiny render loop repaints only the affected regions. Focus and
// scroll positions survive re-renders (keyboard operability preserved).
//
// Depends on: ORBIT.DATA, ORBIT.ENGINE, ORBIT.STORE, ORBIT.UI.
var ORBIT = window.ORBIT || {};
window.ORBIT = ORBIT;

ORBIT.APP = (function () {
  "use strict";

  var D = ORBIT.DATA;
  var E = ORBIT.ENGINE;
  var UI = ORBIT.UI;
  var S = ORBIT.STORE;

  // Transient UI state (never persisted, mirrors React component state):
  // sheet/modal/dialog open flags + per-bay local selections that reset on
  // bay change exactly like the original component unmount/mount cycle.
  var ui = {
    manualOpen: false,
    resetOpen: false,
    completeOpen: false,
    manualSection: null, // open manual accordion section id
    glossaryOpen: null, // open glossary entry index
    dossierSel: "web-prod-04", // StationFleet useState default
    dossierChanged: false, // animate dossier only when the selection changes
    openTrigger: "p-cpu", // StationScale useState default
    lastBay: null,
    lastPhase: null,
    focusToRestore: null, // element focus to restore after an overlay closes
  };
  // (exposed on ORBIT.APP after the factory below returns)

  var appRoot = null;

  // ---------- focus & scroll helpers ----------
  function kbdOf(el) {
    return el && el.getAttribute ? el.getAttribute("data-kbd") : null;
  }

  function captureFocus() {
    var el = document.activeElement;
    return kbdOf(el);
  }

  function restoreFocus(kbd) {
    if (!kbd) return;
    var el = appRoot.querySelector('[data-kbd="' + kbd.replace(/"/g, '\\"') + '"]');
    if (el && typeof el.focus === "function") el.focus();
  }

  var SCROLLABLE_SEL = ".telemetry-list, .dir-list.scrollable, .modal-panel, .sheet";
  function captureScroll(region) {
    var marks = [];
    region.querySelectorAll(SCROLLABLE_SEL).forEach(function (el) {
      marks.push({ el: el, top: el.scrollTop, left: el.scrollLeft });
    });
    return marks;
  }
  function restoreScroll(marks) {
    marks.forEach(function (m) {
      m.el.scrollTop = m.top;
      m.el.scrollLeft = m.left;
    });
  }

  // ---------- region rendering ----------
  function setRegion(el, html) {
    if (el.__html === html) return; // avoid pointless DOM churn
    var kbd = captureFocus();
    var marks = captureScroll(el);
    el.innerHTML = html;
    el.__html = html;
    restoreScroll(marks);
    restoreFocus(kbd);
  }

  function renderGate() {
    appRoot.__html = null;
    appRoot.innerHTML = UI.Gate();
  }

  function renderShell() {
    appRoot.innerHTML =
      '<div>' +
      '<header class="hud"><div class="hud-in" id="hud-root"></div></header>' +
      '<div class="layout">' +
      '<div id="rail-root"></div>' +
      '<main class="stage" id="stage-root"></main>' +
      '<aside class="director-col" aria-label="mission director"><div class="director-box" id="director-root"></div></aside>' +
      "</div>" +
      '<div id="overlay-root"></div>' +
      "</div>";
  }

  function renderOps() {
    var s = S.get();
    var stats = E.labStats(s);

    // HUD
    var modeBadge =
      '<span class="badge ' + (s.mode === "HARD" ? "badge-mode-hard" : "badge-mode-medium") + '">' +
      (s.mode === "HARD" ? "night shift" : "day shift") + "</span>" +
      '<span class="badge badge-synthetic">synthetic training data</span>';
    var hudHtml =
      '<p class="hud-brand">' + ORBIT.icon("satellite", "ic16") + " ORBIT</p>" +
      '<p class="hud-sub">LumenStream Media · fleet lifecycle console</p>' +
      modeBadge +
      '<div class="hud-end">' + UI.HudRight(stats) + "</div>";
    setRegion(document.getElementById("hud-root"), hudHtml);

    // next unsolved objective → bay affordance (D5)
    var nextObj = null;
    D.OBJECTIVES[s.mode].forEach(function (o) {
      if (!nextObj && !s.passed[o.id]) nextObj = o;
    });
    setRegion(document.getElementById("rail-root"), UI.Rail(s.activeBay, nextObj ? nextObj.bay : null, stats.allDone));

    // stage
    var bayChanged = s.activeBay !== ui.lastBay;
    if (bayChanged) {
      // component-local selections reset on unmount, like the original React bay
      ui.dossierSel = "web-prod-04";
      ui.dossierChanged = false;
      ui.openTrigger = "p-cpu";
      ui.lastBay = s.activeBay;
    }
    var stageHtml = renderBay(s.activeBay, bayChanged);
    setRegion(document.getElementById("stage-root"), stageHtml);

    // director column (desktop)
    setRegion(document.getElementById("director-root"), UI.Director(false));

    // overlays
    renderOverlays();
  }

  function renderBay(bay, bayChanged) {
    var inner;
    switch (bay) {
      case "fleet": inner = UI.StationFleet(); break;
      case "launch": inner = UI.StationLaunch(); break;
      case "scale": inner = UI.StationScale(); break;
      case "patch": inner = UI.StationPatch(); break;
      case "deorbit": inner = UI.StationDeorbit(); break;
      case "telemetry": inner = UI.StationTelemetry(); break;
      case "quiz": inner = UI.QuizBay(); break;
      case "debrief": inner = UI.Debrief(); break;
      case "director": inner = UI.Director(true); break;
      default: inner = "";
    }
    // entrance animation only when the bay itself changes (original: framer
    // AnimatePresence keyed by activeBay, 0.18 s)
    return bayChanged ? '<div class="bay-anim">' + inner + "</div>" : inner;
  }

  function renderOverlays() {
    var s = S.get();
    var stats = E.labStats(s);
    var html = "";

    if (ui.resetOpen) {
      html += '<div data-overlay-kind="reset">' + UI.Overlay(UI.ResetDialog()) + "</div>";
    }
    var autoOpen = s.phase === "ops" && stats.allDone && !s.completedSeen;
    var modalOpen = ui.completeOpen || autoOpen;
    if (modalOpen) {
      html += '<div data-overlay-kind="complete">' + UI.Overlay(UI.CompleteModal()) + "</div>";
    }
    if (ui.manualOpen) {
      html += UI.ManualSheet();
    }
    setRegion(document.getElementById("overlay-root"), html);

    // focus hand-off for newly opened overlays
    if (ui.resetOpen && !ui._focusGivenReset) {
      focusKbd("reset-cancel");
      ui._focusGivenReset = true;
    } else if (!ui.resetOpen) {
      ui._focusGivenReset = false;
    }
    if (modalOpen && !ui._focusGivenModal) {
      focusKbd("modal-back");
      ui._focusGivenModal = true;
    } else if (!modalOpen) {
      ui._focusGivenModal = false;
    }
    if (ui.manualOpen && !ui._focusGivenManual) {
      focusKbd("sheet-close");
      ui._focusGivenManual = true;
    } else if (!ui.manualOpen) {
      ui._focusGivenManual = false;
    }
  }

  function focusKbd(kbd) {
    var el = appRoot.querySelector('[data-kbd="' + kbd + '"]');
    if (el && typeof el.focus === "function") el.focus();
  }

  // ---------- master render ----------
  function render() {
    var s = S.get();
    if (s.phase === "gate") {
      if (ui.lastPhase !== "gate") {
        ui.lastPhase = "gate";
        ui.lastBay = null;
        ui.manualOpen = false;
        ui.resetOpen = false;
        ui.completeOpen = false;
        renderGate();
      }
      return;
    }
    if (ui.lastPhase !== "ops") {
      ui.lastPhase = "ops";
      renderShell();
    }
    renderOps();
  }

  // ---------- path helpers (immutable updates, like the original set calls) ----------
  function cloneAt(path) {
    var parts = path.split(".");
    var s = S.get();
    var rootKey = parts[0];
    var rootVal = s[rootKey];
    if (parts.length === 1) {
      // top-level scalar/array field: replaced wholesale by setPath
      return { rootKey: rootKey, leaf: null, container: null };
    }
    if (parts.length === 2) {
      var clone = Object.assign({}, rootVal);
      return { container: clone, leaf: clone, key: parts[1], rootKey: rootKey };
    }
    // depth 3 (policyPack.<class>.<field>)
    var outer = Object.assign({}, rootVal);
    var inner = Object.assign({}, outer[parts[1]] || {});
    outer[parts[1]] = inner;
    return { container: outer, leaf: inner, key: parts[2], rootKey: rootKey };
  }

  function setPath(path, value) {
    var c = cloneAt(path);
    if (c.leaf) {
      c.leaf[c.key] = value;
      var partial = {};
      partial[c.rootKey] = c.container;
      S.set(partial);
    } else {
      var p2 = {};
      p2[c.rootKey] = value;
      S.set(p2);
    }
  }

  function getPath(path) {
    return path.split(".").reduce(function (acc, k) {
      return acc == null ? acc : acc[k];
    }, S.get());
  }

  function toggleList(path, id) {
    var cur = getPath(path) || [];
    var next = cur.indexOf(id) !== -1 ? cur.filter(function (x) { return x !== id; }) : cur.concat([id]);
    setPath(path, next);
  }

  // ---------- action dispatch ----------
  var ACTIONS = {
    "enter": function (el) {
      S.enter(el.getAttribute("data-mode"));
    },
    "set-bay": function (el) {
      S.setBay(el.getAttribute("data-bay"));
    },
    "toggle-obj": function (el) {
      var id = el.getAttribute("data-id");
      S.setActiveObj(S.get().activeObj === id ? null : id);
    },
    "check-obj": function (el) {
      var id = el.getAttribute("data-id");
      S.setActiveObj(id);
      S.check(id);
    },
    "hint": function (el) {
      S.hint(el.getAttribute("data-id"));
    },
    "open-manual": function () {
      ui.manualSection = null;
      ui.glossaryOpen = null;
      ui.manualOpen = true;
      renderOverlays();
    },
    "close-manual": function () {
      ui.manualOpen = false;
      renderOverlays();
      restoreOverlayFocus();
    },
    "toggle-manual-acc": function (el) {
      var key = el.getAttribute("data-key");
      ui.manualSection = ui.manualSection === key ? null : key;
      renderOverlays();
    },
    "toggle-glossary": function (el) {
      var key = el.getAttribute("data-key");
      ui.glossaryOpen = ui.glossaryOpen === key ? null : key;
      renderOverlays();
    },
    "open-reset": function () {
      ui.resetOpen = true;
      renderOverlays();
    },
    "close-reset": function () {
      ui.resetOpen = false;
      renderOverlays();
      restoreOverlayFocus();
    },
    "do-reset": function () {
      ui.resetOpen = false;
      S.reset(); // store change re-renders everything back to the gate
    },
    "open-complete": function () {
      ui.completeOpen = true;
      renderOverlays();
    },
    "close-complete": function () {
      closeModal();
    },
    "complete-open-debrief": function () {
      ui.completeOpen = false;
      S.set({ activeBay: "debrief" });
      closeModal(true);
    },
    "select-resource": function (el) {
      var id = el.getAttribute("data-id");
      ui.dossierChanged = ui.dossierSel !== id;
      ui.dossierSel = id;
      renderOps();
    },
    "set-prov": function (el) {
      var v = el.getAttribute("data-v");
      var s = S.get();
      S.set({ provision: Object.assign({}, s.provision, { method: v }) });
    },
    "set-opt": function (el) {
      setPath(el.getAttribute("data-path"), el.getAttribute("data-v"));
    },
    "set-switch": function (el) {
      var path = el.getAttribute("data-path");
      setPath(path, !getPath(path));
    },
    "set-asg": function (el) {
      var field = el.getAttribute("data-field");
      var delta = Number(el.getAttribute("data-delta"));
      var min = Number(el.getAttribute("data-min"));
      var max = Number(el.getAttribute("data-max"));
      var s = S.get();
      var v = Math.max(min, Math.min(max, s.asg[field] + delta));
      S.set({ asg: Object.assign({}, s.asg, (function () { var o = {}; o[field] = v; return o; })()) });
    },
    "set-finale": function (el) {
      var field = el.getAttribute("data-field");
      var delta = Number(el.getAttribute("data-delta"));
      var min = Number(el.getAttribute("data-min"));
      var max = Number(el.getAttribute("data-max"));
      var s = S.get();
      var v = Math.max(min, Math.min(max, s.finaleCfg[field] + delta));
      S.set({ finaleCfg: Object.assign({}, s.finaleCfg, (function () { var o = {}; o[field] = v; return o; })()) });
    },
    "toggle-list": function (el) {
      toggleList(el.getAttribute("data-path"), el.getAttribute("data-id"));
    },
    "toggle-triage": function (el) {
      var col = el.getAttribute("data-col");
      var id = el.getAttribute("data-id");
      var s = S.get();
      var cur = s.triage[col];
      var next = cur.indexOf(id) !== -1 ? cur.filter(function (x) { return x !== id; }) : cur.concat([id]);
      var clone = Object.assign({}, s.triage);
      clone[col] = next;
      S.set({ triage: clone });
    },
    "toggle-drift": function (el) {
      var id = el.getAttribute("data-id");
      var s = S.get();
      var on = s.flaggedDrift.indexOf(id) !== -1;
      S.set({ flaggedDrift: on ? s.flaggedDrift.filter(function (f) { return f !== id; }) : s.flaggedDrift.concat([id]) });
    },
    "toggle-trigger": function (el) {
      var id = el.getAttribute("data-id");
      ui.openTrigger = ui.openTrigger === id ? null : id;
      renderOps();
    },
    "seq-add": function (el) {
      var board = el.getAttribute("data-board");
      var id = el.getAttribute("data-id");
      var cur = getPath(board) || [];
      setPath(board, cur.concat([id]));
    },
    "seq-remove": function (el) {
      var board = el.getAttribute("data-board");
      var i = Number(el.getAttribute("data-i"));
      var cur = getPath(board) || [];
      setPath(board, cur.filter(function (_, j) { return j !== i; }));
    },
    "seq-clear": function (el) {
      setPath(el.getAttribute("data-board"), []);
    },
    "run-sim": function () {
      S.runSim();
    },
    "run-finale-sim": function () {
      S.runFinaleSim();
    },
    "quiz-pick": function (el) {
      var s = S.get();
      var q = D.QUIZ[s.mode][s.quizIdx];
      S.answerQuiz(q.id, Number(el.getAttribute("data-i")));
    },
    "quiz-next": function () {
      S.nextQuiz();
    },
    "quiz-finish": function () {
      S.finishQuiz();
    },
    "quiz-retake": function () {
      S.retakeQuiz();
    },
  };

  function closeModal(skipRestore) {
    var s = S.get();
    var stats = E.labStats(s);
    var autoOpen = s.phase === "ops" && stats.allDone && !s.completedSeen;
    ui.completeOpen = false;
    if (autoOpen) S.showComplete();
    renderOverlays();
    if (!skipRestore) restoreOverlayFocus();
  }

  function restoreOverlayFocus() {
    if (ui.focusToRestore) {
      var el = ui.focusToRestore;
      ui.focusToRestore = null;
      if (el && document.body.contains(el) && typeof el.focus === "function") {
        el.focus();
        return;
      }
    }
    // fall back to the HUD trigger buttons
    var kbd = kbdOf(document.activeElement);
    if (!kbd) focusKbd("hud-manual");
  }

  function rememberOverlayTrigger() {
    // called when an overlay is about to open, so ESC/close can restore focus
    var el = document.activeElement;
    if (el && el.closest && el.closest("#overlay-root")) return;
    ui.focusToRestore = el;
  }

  // ---------- event delegation ----------
  function findAction(target) {
    var el = target;
    while (el && el !== appRoot) {
      if (el.getAttribute && el.getAttribute("data-action")) return el;
      el = el.parentNode;
    }
    return null;
  }

  function onClick(e) {
    var el = findAction(e.target);
    if (!el) {
      // backdrop clicks on centered overlays close their dialog (original behavior)
      var kindEl = e.target.closest ? e.target.closest("[data-overlay-kind]") : null;
      if (kindEl && e.target === kindEl.querySelector(".overlay")) {
        var kind = kindEl.getAttribute("data-overlay-kind");
        if (kind === "reset") ACTIONS["close-reset"]();
        else if (kind === "complete") closeModal();
      }
      return;
    }
    var action = el.getAttribute("data-action");
    if (action === "open-manual" || action === "open-reset" || action === "open-complete") {
      rememberOverlayTrigger();
    }
    var fn = ACTIONS[action];
    if (fn) fn(el);
  }

  function onChange(e) {
    var el = e.target;
    if (!el.getAttribute || el.getAttribute("data-action") !== "set-select") return;
    var path = el.getAttribute("data-path");
    var v = el.value;
    if (el.getAttribute("data-num")) v = Number(v);
    setPath(path, v);
  }

  function onKeydown(e) {
    if (e.key !== "Escape") return;
    // mirror the original overlay stack: reset dialog > completion modal > sheet
    if (ui.resetOpen) {
      ACTIONS["close-reset"]();
    } else if (ui.completeOpen || (S.get().phase === "ops" && E.labStats(S.get()).allDone && !S.get().completedSeen)) {
      closeModal();
    } else if (ui.manualOpen) {
      ACTIONS["close-manual"]();
    }
  }

  // ---------- boot ----------
  function boot() {
    appRoot = document.getElementById("app");
    document.addEventListener("click", onClick);
    document.addEventListener("change", onChange);
    document.addEventListener("keydown", onKeydown);
    S.subscribe(render);

    // the original computes tablist orientation from window width at render
    var wasWide = window.matchMedia("(min-width: 1024px)").matches;
    window.matchMedia("(min-width: 1024px)").addEventListener("change", function (ev) {
      if (ev.matches !== wasWide) {
        wasWide = ev.matches;
        if (S.get().phase === "ops") renderOps();
      }
    });

    render();
  }

  // Bind the app handle BEFORE boot(): a resumed session can render the ops
  // shell on the first render, and the UI components read ORBIT.APP.ui.
  var APP_HANDLE = { ui: ui, render: render };
  ORBIT.APP = APP_HANDLE;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  return APP_HANDLE;
})();
