/* ============================================================
   The Assurance Bureau — js/app.js
   Bootstrap: restores state, subscribes the store, renders the
   shell, and wires delegated events (keyboard + pointer).
   ============================================================ */

(function () {
  "use strict";

  var root = document.getElementById("app");

  // ---------- store restore ----------
  STORE.restore();
  STORE.subscribe(function (_state, topic) {
    onStateChange(topic);
  });
  STORE.save(); // persist restored normalization (old saves get migrated fields)

  // ---------- render orchestration ----------
  // Full shell re-render on structural topics. "answer" and "flag"
  // topics update widgets in place (the widgets own their DOM), so
  // typing / running a rig never steals focus — matching the React
  // version's per-component updates.
  var autoCompleteTimer = null;

  function onStateChange(topic) {
    if (topic === "answer") return; // widgets refresh themselves
    if (topic === "flag") {
      // refresh rig-dependent widgets (state parts) without a full rebuild
      refreshStateWidgets();
      return;
    }
    if (topic === "reset" && autoCompleteTimer) {
      clearTimeout(autoCompleteTimer);
      autoCompleteTimer = null;
    }
    render();
  }

  // The original auto-opens the field report 400ms after eligibility.
  function scheduleAutoComplete() {
    var state = STORE.getState();
    if (!state.mode || state.completed) return;
    var objs = LAB_DATA.OBJECTIVES.filter(function (o) { return o.mode === state.mode; });
    var allDone = objs.every(function (o) {
      return state.checks[o.id] && state.checks[o.id].done;
    });
    if (allDone && state.quiz.finished) {
      if (autoCompleteTimer) clearTimeout(autoCompleteTimer);
      autoCompleteTimer = setTimeout(function () {
        autoCompleteTimer = null;
        STORE.completeEngagement();
      }, 400);
    }
  }

  function refreshStateWidgets() {
    var state = STORE.getState();
    var mode = state.mode;
    if (!mode) return;
    LAB_DATA.OBJECTIVES.filter(function (o) { return o.mode === mode; }).forEach(function (o) {
      o.parts.forEach(function (p) {
        if (p.kind === "state") {
          UI.refreshWidget(o.id + "." + p.id);
        }
      });
    });
  }

  function render() {
    UI.clearTransientState();
    var state = STORE.getState();

    if (!STORE.isRestored()) {
      root.textContent = "";
      root.appendChild(UI.el("div", { class: "lab-paper splash" }, [UI.el("p", { text: "opening the case file…" })]));
      return;
    }

    if (!state.mode) {
      root.textContent = "";
      root.appendChild(UI.ModeGate());
      return;
    }

    var mode = state.mode;
    root.textContent = "";
    root.appendChild(UI.Masthead());

    var desk = UI.el("div", { class: "desk" });
    desk.appendChild(UI.el("div", { class: "tablist-col" }, [UI.Tablist()]));

    var main = UI.el("main", { role: "tabpanel", id: "panel-" + state.phase, "aria-labelledby": "tab-" + state.phase, class: "tabpanel-col" });
    main.appendChild(state.phase === "quiz" ? QUIZ_UI.QuizPanel() : UI.PhaseContent(state.phase, mode));
    desk.appendChild(main);

    var aside = UI.el("aside", { class: "aside-col", "aria-label": "Progress and findings" });
    aside.appendChild(UI.Ledger());
    aside.appendChild(UI.RubricCard());
    desk.appendChild(aside);

    root.appendChild(desk);

    // completion modal opens automatically 400ms after eligibility, as in the original
    scheduleAutoComplete();
    if (state.completed && !state.completionDismissed && !QUIZ_UI.hasOpenDialog()) {
      QUIZ_UI.openDialog(QUIZ_UI.CompletionModal());
    }
  }

  // ---------- event wiring (delegation) ----------
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-action]");
    if (!t) return;
    var action = t.getAttribute("data-action");
    var state = STORE.getState();

    switch (action) {
      case "accept-mode":
        STORE.setMode(t.getAttribute("data-mode"));
        break;
      case "tab":
        STORE.setPhase(t.getAttribute("data-phase"));
        break;
      case "reset-open":
        QUIZ_UI.openDialog(UI.ResetDialog());
        break;
      case "reset-confirm":
        STORE.reset(); // re-render clears dialogs
        break;
      case "reset-close":
      case "reset-overlay": {
        // only close when the click was on the overlay itself, not bubbling from content
        if (action === "reset-overlay" && e.target.closest(".dialog-box")) return;
        QUIZ_UI.closeDialogs();
        render(); // overlay removal + focus restore
        break;
      }
      case "report-close":
      case "report-review":
        STORE.dismissCompletion();
        break;
      case "report-overlay": {
        if (e.target.closest(".dialog-box")) return; // R7: click-outside closes, clicks inside don't
        STORE.dismissCompletion();
        break;
      }
      case "report-reset":
        STORE.reset();
        break;
      case "show-report":
        STORE.openCompletion();
        break;
      case "close-engagement":
        if (!t.disabled) STORE.completeEngagement();
        break;
      case "check-results": {
        var objId = t.getAttribute("data-obj");
        var obj = LAB_DATA.OBJECTIVES.find(function (o) { return o.id === objId; });
        var s = STORE.getState();
        var flags = s.flags;
        var answers = s.answers;
        var result = ENGINE.validateObjective(obj, answers, flags);
        var submitted = obj.parts.every(function (p) {
          if (p.kind === "state") return true;
          var v = s.answers[obj.id + "." + p.id];
          if (v === undefined) return false;
          if (Array.isArray(v)) {
            return p.kind === "order" ? v.length === (p.solutionOrder || []).length : v.length > 0;
          }
          if (typeof v === "object") return Object.keys(v).length > 0;
          return typeof v === "string" && v.trim().length > 0;
        });
        STORE.checkObjective(objId, result, submitted);
        break;
      }
      case "retry":
        STORE.retryObjective(t.getAttribute("data-obj"));
        break;
      case "hint-toggle": {
        var oid = t.getAttribute("data-obj");
        UI.showHints[oid] = true;
        var rec = STORE.getState().checks[oid];
        var maxHints = STORE.getState().mode === "hard" ? 1 : LAB_DATA.OBJECTIVES.find(function (o) { return o.id === oid; }).hints.length;
        if ((rec ? rec.hintsUsed : 0) < maxHints) STORE.addHint(oid);
        else render();
        break;
      }
      case "hint-deeper":
        STORE.addHint(t.getAttribute("data-obj"));
        break;
      case "order-add": {
        var key = t.getAttribute("data-key");
        STORE.setAnswer(key, function (prev) {
          var arr = Array.isArray(prev) ? prev : [];
          if (arr.indexOf(t.getAttribute("data-id")) !== -1) return arr; // double-click guard
          return arr.concat([t.getAttribute("data-id")]);
        });
        UI.refreshWidget(key);
        break;
      }
      case "order-remove": {
        var key2 = t.getAttribute("data-key");
        var rid = t.getAttribute("data-id");
        STORE.setAnswer(key2, function (prev) {
          var arr = Array.isArray(prev) ? prev : [];
          return arr.filter(function (v) { return v !== rid; });
        });
        UI.refreshWidget(key2);
        break;
      }
      case "order-clear": {
        var key3 = t.getAttribute("data-key");
        STORE.setAnswer(key3, []);
        UI.refreshWidget(key3);
        break;
      }
      case "quiz-pick":
        STORE.answerQuiz(parseInt(t.getAttribute("data-idx"), 10), parseInt(t.getAttribute("data-opt"), 10));
        break;
      case "quiz-next":
        STORE.quizNext();
        break;
      case "quiz-finish":
        STORE.finishQuiz();
        break;
      case "simulate":
        // scrolling affordance: jump to the rig card, the student runs it there
        var flagBtn = document.querySelector('[data-rig="' + t.getAttribute("data-flag") + '"]');
        if (flagBtn) {
          flagBtn.scrollIntoView({ behavior: "smooth", block: "center" });
          flagBtn.focus();
        }
        break;
      case "signoff":
        STORE.signEngagement();
        break;
      case "acc-toggle": {
        var panel = t._panel;
        var expanded = t.getAttribute("aria-expanded") === "true";
        // single-open accordion, like the original Radix type="single"
        document.querySelectorAll(".acc-trigger").forEach(function (other) {
          other.setAttribute("aria-expanded", "false");
          other._panel.hidden = true;
        });
        if (!expanded) {
          t.setAttribute("aria-expanded", "true");
          panel.hidden = false;
        }
        break;
      }
      default:
        break;
    }
  });

  // radios (choice + choices) and checkboxes (set) — update state, refresh widget locally
  document.addEventListener("change", function (e) {
    var input = e.target;
    if (input.type !== "radio" && input.type !== "checkbox") return;
    var key = input.getAttribute("data-key");
    if (!key) return;
    if (input.type === "radio") {
      if (input.hasAttribute("data-item")) {
        var itemId = input.getAttribute("data-item");
        var opt = input.getAttribute("data-opt");
        STORE.setAnswer(key, function (prev) {
          var cur = prev && typeof prev === "object" && !Array.isArray(prev) ? prev : {};
          var next = Object.assign({}, cur);
          next[itemId] = opt;
          return next;
        });
      } else {
        STORE.setAnswer(key, input.getAttribute("data-opt"));
      }
    } else if (input.type === "checkbox") {
      var id = input.getAttribute("data-id");
      STORE.setAnswer(key, function (prev) {
        var arr = Array.isArray(prev) ? prev : [];
        return arr.indexOf(id) !== -1 ? arr.filter(function (v) { return v !== id; }) : arr.concat([id]);
      });
    }
    UI.refreshWidget(key);
  });

  // text parts — persist every keystroke (the widget is NOT rebuilt on "answer")
  document.addEventListener("input", function (e) {
    var input = e.target;
    if (input.type !== "text") return;
    var key = input.getAttribute("data-key");
    if (!key) return;
    STORE.setAnswer(key, input.value);
  });

  // term tooltips — hover + keyboard focus
  document.addEventListener("mouseover", function (e) {
    var t = e.target.closest(".term");
    if (t) UI.tooltip.show(t);
  });
  document.addEventListener("mouseout", function (e) {
    var t = e.target.closest(".term");
    if (t) UI.tooltip.hide();
  });
  document.addEventListener("focusin", function (e) {
    var t = e.target.closest(".term");
    if (t) UI.tooltip.show(t);
  });
  document.addEventListener("focusout", function (e) {
    var t = e.target.closest(".term");
    if (t) UI.tooltip.hide();
  });

  // R7: ESC closes the open dialog; click-outside handled per-dialog
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && QUIZ_UI.hasOpenDialog()) {
      var overlay = document.querySelector(".dialog-overlay");
      if (overlay && overlay.querySelector('[role="alertdialog"]')) {
        QUIZ_UI.closeDialogs();
        render();
      } else {
        STORE.dismissCompletion();
      }
    }
  });

  // binder tabs: ArrowLeft / ArrowRight roving focus (as in the original)
  document.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    var tab = e.target.closest && e.target.closest('[role="tab"]');
    if (!tab) return;
    e.preventDefault();
    var state = STORE.getState();
    var ids = LAB_DATA.PHASES.map(function (p) { return p.id; });
    var cur = ids.indexOf(state.phase);
    var next = e.key === "ArrowRight" ? (cur + 1) % ids.length : (cur - 1 + ids.length) % ids.length;
    STORE.setPhase(ids[next]);
    requestAnimationFrame(function () {
      var t = document.getElementById("tab-" + ids[next]);
      if (t) t.focus();
    });
  });

  // ---------- go ----------
  render();
})();
