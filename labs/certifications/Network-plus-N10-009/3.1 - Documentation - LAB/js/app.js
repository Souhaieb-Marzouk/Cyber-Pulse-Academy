/* ============================================================================
 * CyberLab — The Documentation Drafting Room (STATIC PORT)
 * js/app.js — bootstrap, delegated events, focus/scroll restoration.
 *   1:1 port of the wiring inside LabRoot.tsx: one render root, dialogs
 *   (completion modal / reset confirms / mobile checklist) driven by a tiny
 *   component-local uiState, and a global aria-live region mirroring the
 *   original's inline aria-live feedback.
 * ========================================================================= */
(function () {
  "use strict";

  var Store = window.LabStore;
  var root = document.getElementById("app");

  /* Component-local UI state (React useState equivalents in LabRoot):
     signOffRequested / reset dialog source / mobile checklist visibility. */
  var uiState = { signOffRequested: false, resetOpen: false, resetSource: "header", mobileChecklist: false };

  /* ------------------------------------------------------- path setter --- */

  function setPath(obj, path, value) {
    var parts = path.split(".");
    var cur = obj;
    for (var i = 0; i < parts.length - 1; i++) {
      if (typeof cur[parts[i]] !== "object" || cur[parts[i]] === null) cur[parts[i]] = {};
      cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = value;
  }

  /* ------------------------------------------------------------ render --- */

  var lastFeedbackKey = "";

  function render() {
    // Preserve focus (with caret) and scroll positions across re-render.
    var active = document.activeElement;
    var fkey = active && active.getAttribute ? active.getAttribute("data-fkey") : null;
    var selStart = active && typeof active.selectionStart === "number" ? active.selectionStart : null;
    var selEnd = active && typeof active.selectionEnd === "number" ? active.selectionEnd : null;

    var scrolls = [];
    Array.prototype.forEach.call(root.querySelectorAll("[data-scroll-keep]"), function (el) {
      scrolls.push({ el: el, left: el.scrollLeft, top: el.scrollTop });
    });

    root.innerHTML = window.LabUI.render(Store.state, uiState);

    scrolls.forEach(function (s) {
      if (s.el.isConnected) {
        s.el.scrollLeft = s.left;
        s.el.scrollTop = s.top;
      }
    });

    if (fkey) {
      var next = root.querySelector('[data-fkey="' + cssEscape(fkey) + '"]');
      if (next) {
        next.focus();
        if (selStart !== null && typeof next.setSelectionRange === "function") {
          try {
            next.setSelectionRange(selStart, selEnd);
          } catch (e) {
            /* non-text control — ignore */
          }
        }
      }
    }

    announceFeedback();
  }

  function cssEscape(s) {
    if (window.CSS && CSS.escape) return CSS.escape(s);
    return s.replace(/["\\\]]/g, "\\$&");
  }

  /** Mirror the original's aria-live regions (check feedback, quiz results). */
  function announceFeedback() {
    var live = document.getElementById("sr-live");
    if (!live) return;
    var s = Store.state;
    var msg = "";
    if (s.phase === "work" && s.view === "quiz" && s.quiz.submitted) {
      var pct = s.quiz.total ? Math.round((s.quiz.correct / s.quiz.total) * 100) : 0;
      msg = "Quiz result: " + pct + " percent. " + (Store.quizPassed(s) ? "Quiz passed." : "Below the 70% pass mark.");
    }
    var key = s.phase + "|" + s.view + "|" + msg + "|" + JSON.stringify(s.quiz.answers);
    if (key !== lastFeedbackKey) {
      lastFeedbackKey = key;
      if (msg) live.textContent = msg;
    }
  }

  /* ------------------------------------------------------------ actions - */

  var A = Store.actions;

  var ACTIONS = {
    "set-mode": function (el) {
      A.setMode(el.getAttribute("data-mode"));
    },
    "start-work": function () {
      A.startWork();
    },
    "set-view": function (el) {
      // Close the mobile checklist BEFORE navigating: the store action renders
      // synchronously (same batching React did for setView + setMobileChecklist).
      if (uiState.mobileChecklist) uiState.mobileChecklist = false;
      A.setView(el.getAttribute("data-view"));
      window.scrollTo(0, 0);
    },
    "file-chip": function (el) {
      var id = el.getAttribute("data-id");
      var bin = el.getAttribute("data-bin");
      A.mutate(function (s) {
        s.diagrams.sort = Object.assign({}, s.diagrams.sort);
        s.diagrams.sort[id] = bin;
      });
    },
    "unfile-chip": function (el) {
      var id = el.getAttribute("data-id");
      A.mutate(function (s) {
        s.diagrams.sort = Object.assign({}, s.diagrams.sort);
        s.diagrams.sort[id] = null;
      });
    },
    "set-field": function (el) {
      var path = el.getAttribute("data-path");
      var value = el.value;
      if (el.tagName === "SELECT") {
        // Selects feed live UI (e.g. the rack elevation) → full re-render.
        A.mutate(function (s) {
          setPath(s, path, value);
        });
      } else {
        // Text fields: nothing on screen depends on the keystroke → silent save.
        A.mutate(function (s) {
          setPath(s, path, value);
        });
      }
    },
    "set-cable": function (el) {
      var col = el.getAttribute("data-col");
      var id = el.getAttribute("data-id");
      A.mutate(function (s) {
        s.cable[col] = id;
      });
    },
    "clear-chain": function () {
      A.mutate(function (s) {
        s.cable.wall = null;
        s.cable.panel = null;
        s.cable.port = null;
      });
    },
    "flag-element": function (el) {
      var id = el.getAttribute("data-id");
      A.mutate(function (s) {
        s.netdiagram.flagged = s.netdiagram.flagged === id ? null : id;
      });
    },
    "toggle-closet": function (el) {
      var opt = el.getAttribute("data-opt");
      A.mutate(function (s) {
        var set = s.netdiagram.blast.closets.slice();
        var i = set.indexOf(opt);
        if (i >= 0) set.splice(i, 1);
        else set.push(opt);
        s.netdiagram.blast.closets = set;
      });
    },
    "toggle-issue": function (el) {
      var id = el.getAttribute("data-id");
      A.mutate(function (s) {
        var set = s.ipam.issues.slice();
        var i = set.indexOf(id);
        if (i >= 0) set.splice(i, 1);
        else set.push(id);
        s.ipam.issues = set;
      });
    },
    "toggle-asset": function (el) {
      var id = el.getAttribute("data-id");
      var checked = el.checked;
      A.mutate(function (s) {
        s.inventory.flags = Object.assign({}, s.inventory.flags);
        s.inventory.flags[id] = checked;
      });
    },
    "set-dead-cell": function (el) {
      var id = el.getAttribute("data-id");
      A.mutate(function (s) {
        s.wireless.deadCell = s.wireless.deadCell === id ? null : id;
      });
    },
    check: function (el) {
      A.checkObjective(el.getAttribute("data-obj"));
    },
    hint: function (el) {
      A.useHint(el.getAttribute("data-obj"));
    },
    "answer-quiz": function (el) {
      A.answerQuiz(el.getAttribute("data-id"), parseInt(el.getAttribute("data-idx"), 10));
    },
    "submit-quiz": function () {
      A.submitQuiz();
    },
    "retake-quiz": function () {
      A.retakeQuiz();
    },
    signoff: function () {
      uiState.signOffRequested = true;
      render();
    },
    "close-signoff": function () {
      uiState.signOffRequested = false;
      if (Store.allDone(Store.state) && !Store.state.completedShown) A.markCompletedShown();
      render();
    },
    "open-reset": function (el) {
      uiState.resetOpen = true;
      uiState.resetSource = el.getAttribute("data-source") || "header";
      render();
    },
    "close-reset": function () {
      uiState.resetOpen = false;
      render();
    },
    "confirm-reset": function () {
      uiState.resetOpen = false;
      uiState.signOffRequested = false;
      uiState.mobileChecklist = false;
      A.reset();
      window.scrollTo(0, 0);
    },
    "open-checklist": function () {
      uiState.mobileChecklist = true;
      render();
    },
    "close-checklist": function () {
      uiState.mobileChecklist = false;
      render();
    },
  };

  /* -------------------------------------------------- event delegation -- */

  root.addEventListener("click", function (e) {
    var el = e.target.closest("[data-action]");
    if (!el || el.disabled) return;
    var act = el.getAttribute("data-action");
    // selects also carry data-action for change events; ignore click dispatch
    if (el.tagName === "SELECT" || el.tagName === "INPUT") return;
    var fn = ACTIONS[act];
    if (fn) fn(el);
  });

  root.addEventListener("change", function (e) {
    var el = e.target.closest("[data-action]");
    if (!el) return;
    if (el.tagName === "SELECT") {
      ACTIONS["set-field"](el);
      return;
    }
    if (el.type === "checkbox") {
      ACTIONS[el.getAttribute("data-action")](el);
    }
  });

  root.addEventListener("input", function (e) {
    var el = e.target;
    if (el.tagName === "INPUT" && el.type === "text" && el.getAttribute("data-field")) {
      var path = el.getAttribute("data-field");
      A.mutate(function (s) {
        setPath(s, path, el.value);
      });
    }
  });

  // Keyboard: Escape closes the topmost dialog (parity with Radix Dialog).
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (uiState.resetOpen) {
      uiState.resetOpen = false;
      render();
    } else if (uiState.mobileChecklist) {
      uiState.mobileChecklist = false;
      render();
    } else if (uiState.signOffRequested || autoSignOffOpen()) {
      ACTIONS["close-signoff"]();
    }
  });

  // Overlay click closes (Radix parity): click on the dimmed backdrop.
  root.addEventListener("mousedown", function (e) {
    if (!e.target.classList || !e.target.classList.contains("overlay")) return;
    var overlay = e.target.getAttribute("data-overlay");
    if (overlay === "reset") ACTIONS["close-reset"]();
    else if (overlay === "checklist") ACTIONS["close-checklist"]();
    else if (overlay === "signoff") ACTIONS["close-signoff"]();
  });

  function autoSignOffOpen() {
    var s = Store.state;
    return s.phase === "work" && Store.allDone(s) && !s.completedShown;
  }

  /* --------------------------------------------------------------- boot - */

  Store.subscribe(render);
  render();
})();
