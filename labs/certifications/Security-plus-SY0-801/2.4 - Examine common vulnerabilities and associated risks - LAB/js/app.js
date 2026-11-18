/**
 * Vulnerability Council — app bootstrap (static port).
 *
 * Source: src/app/page.tsx (257 lines) — 3-zone workbench, mobile tabs,
 * toolbar, modals.
 *
 * Responsibilities:
 *   1. Hydrate the store from localStorage.
 *   2. Render the entire app shell into #app, re-rendering on every notify().
 *   3. Wire up events via data-action attributes + delegated listener.
 *   4. Manage modal lifecycle (R7: X button, ESC, click-outside).
 *   5. Track transient UI state (which modal is open, which mobile tab is
 *      active, whether the glossary is expanded, whether the completion modal
 *      has auto-opened once).
 *
 * Exposed on the global Lab namespace as Lab.App.
 */
(function (global) {
  "use strict";

  var Lab = global.Lab || (global.Lab = {});
  var Data = Lab.Data;
  var Store = Lab.Store;
  var UI = Lab.UI;
  var Quiz = Lab.Quiz;
  var Validators = Lab.Validators;
  var CVSS = Lab.CVSS;

  var App = (Lab.App = {});

  // --- Transient UI state (NOT persisted) -----------------------------------
  var uiState = {
    quizOpen: false,
    debriefOpen: false,
    completionOpen: false,
    confirmDialog: null, // { type: "reset" | "restart" }
    mobileTab: "case",
    glossaryOpen: false,
    completionAutoOpened: false,
  };

  // --- Bootstrap ------------------------------------------------------------

  function init() {
    Store.hydrate();
    Store.subscribe(render);
    // ESC closes whatever modal is open (R7).
    document.addEventListener("keydown", handleKeydown);
    // Delegated click handler — every data-action flows through here.
    document.addEventListener("click", handleClick);
    // Delegated change handler for selects/inputs.
    document.addEventListener("change", handleChange);
    // Delegated input handler for textareas (silent-set on every keystroke).
    document.addEventListener("input", handleInput);
    render();
  }

  // --- Render ----------------------------------------------------------------

  function render() {
    var root = document.getElementById("app");
    if (!root) return;

    if (!Store.hydrated) {
      root.innerHTML =
        '<div class="app-loading"><div class="app-loading-inner">' +
        '<div class="app-loading-spinner"></div>' +
        '<p style="font-size: 12px; margin: 0;">Loading council workbench…</p>' +
        "</div></div>";
      return;
    }

    if (!Store.mode) {
      root.innerHTML = UI.renderModeSelect();
      return;
    }

    root.innerHTML = renderLabShell();

    // If any modal is open, render it on top.
    var modalHtml = "";
    if (uiState.quizOpen) modalHtml += Quiz.renderQuizModal(Store.mode);
    if (uiState.debriefOpen) modalHtml += UI.renderDebriefModal();
    if (uiState.completionOpen) modalHtml += UI.renderCompletionModal(Store.mode);
    if (uiState.confirmDialog) modalHtml += renderConfirmFor(uiState.confirmDialog);
    if (modalHtml) {
      var modalHost = document.createElement("div");
      modalHost.id = "modal-host";
      modalHost.innerHTML = modalHtml;
      root.appendChild(modalHost);
    }

    // R8: auto-open completion modal once when everything is done.
    if (allDone() && !uiState.completionAutoOpened) {
      uiState.completionAutoOpened = true;
      uiState.completionOpen = true;
      // Defer to next frame so the DOM has settled.
      requestAnimationFrame(render);
    }
  }

  function renderLabShell() {
    var mode = Store.mode;
    var kevCount = Data.EVIDENCE.filter(function (e) { return e.kev; }).length;
    var done = allDone();

    var workbenchDesktop =
      '<div class="workbench-desktop">' +
        UI.renderEvidenceVault(mode === "hard") +
        UI.renderCaseFileViewer() +
        UI.renderPriorityQueue() +
      "</div>";

    var workbenchMobile =
      '<div class="workbench-mobile">' +
        '<div class="tab-list">' +
          tabTrigger("vault", "file_search", "Vault") +
          tabTrigger("case", "folder_open", "Case") +
          tabTrigger("queue", "list_ordered", "Queue") +
          tabTrigger("objectives", "target", "Goals") +
        "</div>" +
        '<div class="mobile-tabs">' +
          (uiState.mobileTab === "vault" ? UI.renderEvidenceVault(mode === "hard") : "") +
          (uiState.mobileTab === "case" ? UI.renderCaseFileViewer() : "") +
          (uiState.mobileTab === "queue" ? UI.renderPriorityQueue() : "") +
          (uiState.mobileTab === "objectives" ? UI.renderObjectivesTracker(mode) : "") +
        "</div>" +
      "</div>";

    var objectivesDesktop =
      '<div class="objectives-desktop">' + UI.renderObjectivesTracker(mode) + "</div>";

    var objectivesMobile =
      '<div class="objectives-mobile">' +
        (uiState.mobileTab === "objectives" ? "" : "") +
      "</div>";

    var glossary = UI.renderGlossary(uiState.glossaryOpen);

    var doneCount = Data.OBJECTIVES.filter(function (o) {
      return o.mode === mode && Store.progress[o.id] && Store.progress[o.id].status === "correct";
    }).length;
    var totalForMode = Data.OBJECTIVES.filter(function (o) { return o.mode === mode; }).length;

    return (
      '<div class="app-root">' +
        '<div class="sr-live" role="status" aria-live="polite">' + doneCount + " of " + totalForMode + " " + mode + " objectives complete.</div>" +
        UI.renderToolbar(mode, done) +
        UI.renderScenarioBanner(kevCount) +
        workbenchDesktop +
        workbenchMobile +
        objectivesDesktop +
        glossary +
      "</div>"
    );
  }

  function tabTrigger(value, iconName, label) {
    var active = uiState.mobileTab === value;
    return (
      '<button type="button" class="tab-trigger' + (active ? " active" : "") +
      '" data-action="set-tab" data-tab="' + value + '">' + UI.icon(iconName, 14) + " " + label + "</button>"
    );
  }

  function allDone() {
    if (!Store.mode) return false;
    var objs = Data.OBJECTIVES.filter(function (o) { return o.mode === Store.mode; });
    var objsDone = objs.every(function (o) {
      return Store.progress[o.id] && Store.progress[o.id].status === "correct";
    });
    return objsDone && Store.quiz.completed;
  }

  // --- Confirm dialog (replaces shadcn AlertDialog) -------------------------

  function renderConfirmFor(dialog) {
    if (dialog.type === "reset") {
      return UI.renderConfirmDialog({
        titleId: "confirm-reset-title",
        title: "Reset the lab?",
        description: "Clears your mode, progress, case-file state, and quiz from this browser. This cannot be undone.",
        confirmLabel: "Reset everything",
        confirmAction: "do-reset",
        cancelAction: "cancel-confirm",
        confirmClass: "danger",
      });
    }
    if (dialog.type === "restart") {
      return UI.renderConfirmDialog({
        titleId: "confirm-restart-title",
        title: "Restart the lab?",
        description: "This clears your mode, progress, case-file state, and quiz from this browser. This cannot be undone.",
        confirmLabel: "Restart",
        confirmAction: "do-restart",
        cancelAction: "cancel-confirm",
        confirmClass: "danger",
      });
    }
    return "";
  }

  // --- Event handlers (delegated) -------------------------------------------

  function handleKeydown(e) {
    if (e.key === "Escape") {
      if (uiState.confirmDialog) {
        uiState.confirmDialog = null;
        render();
      } else if (uiState.completionOpen) {
        uiState.completionOpen = false;
        render();
      } else if (uiState.quizOpen) {
        uiState.quizOpen = false;
        render();
      } else if (uiState.debriefOpen) {
        uiState.debriefOpen = false;
        render();
      }
    }
  }

  function closestAction(target) {
    var el = target;
    while (el && el !== document) {
      if (el.dataset && el.dataset.action) return el;
      el = el.parentElement;
    }
    return null;
  }

  function handleClick(e) {
    var target = e.target;
    // Click on overlay → close modal (R7: click-outside).
    if (target.classList && target.classList.contains("modal-overlay")) {
      var action = target.dataset.action;
      if (action) {
        closeAction(action);
      }
      return;
    }

    var el = closestAction(target);
    if (!el) return;
    var action = el.dataset.action;

    switch (action) {
      case "set-mode":
        Store.setMode(el.dataset.mode);
        uiState.completionAutoOpened = false;
        uiState.mobileTab = "case";
        break;

      case "set-evidence": {
        var id = el.dataset.id;
        Store.setActiveEvidence(id || null);
        // Pre-populate the CVSS calculator when an evidence card with a
        // vector is opened (mirrors CaseFileViewer's useEffect on active.cvssVector).
        if (id) {
          var ev = Data.EVIDENCE_BY_ID[id];
          if (ev && ev.cvssVector) {
            Store.setCvssBase(CVSS.parseVectorString(ev.cvssVector));
          }
        }
        // On mobile, switch to the Case tab so the user sees what they opened.
        if (window.matchMedia("(max-width: 1023px)").matches) {
          uiState.mobileTab = "case";
        }
        break;
      }

      case "set-tab":
        uiState.mobileTab = el.dataset.tab;
        render();
        break;

      case "set-classification": {
        var eid = el.dataset.id;
        var field = el.dataset.field;
        var partial = {};
        partial[field] = el.value;
        Store.setClassification(eid, partial);
        return; // no need to re-render via notify? Actually setClassification notifies.
      }

      case "toggle-redherring":
        Store.toggleRedHerring(el.dataset.id);
        break;

      case "toggle-council": {
        var cid = el.dataset.id;
        var sel = Store.state.councilSelection.slice();
        if (el.checked) {
          if (sel.indexOf(cid) === -1) sel.push(cid);
        } else {
          sel = sel.filter(function (x) { return x !== cid; });
        }
        Store.setCouncilSelection(sel);
        break;
      }

      case "set-cvss-base": {
        var key = el.dataset.key;
        var next = Object.assign({}, Store.state.cvss);
        next[key] = el.value;
        Store.setCvssBase(next);
        return;
      }

      case "set-cvss-env": {
        var ekey = el.dataset.key;
        var enext = Object.assign({}, Store.state.cvssEnv);
        enext[ekey] = el.value;
        Store.setCvssEnv(enext);
        return;
      }

      case "toggle-env":
        Store.toggleEnv(!Store.state.showEnv);
        break;

      case "load-cve-vector":
        Store.setCvssBase(CVSS.parseVectorString("AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:N"));
        break;

      case "enable-env":
        Store.toggleEnv(true);
        break;

      case "queue-add":
        Store.setQueueOrder(Store.state.queueOrder.concat([el.dataset.id]));
        break;

      case "queue-remove":
        Store.setQueueOrder(Store.state.queueOrder.filter(function (x) { return x !== el.dataset.id; }));
        break;

      case "queue-move": {
        var dir = parseInt(el.dataset.dir, 10);
        var qid = el.dataset.id;
        var order = Store.state.queueOrder.slice();
        var idx = order.indexOf(qid);
        var target2 = idx + dir;
        if (target2 < 0 || target2 >= order.length) return;
        var tmp = order[idx];
        order[idx] = order[target2];
        order[target2] = tmp;
        Store.setQueueOrder(order);
        break;
      }

      case "patch-answer": {
        var objId = el.dataset.id;
        var patch = el.dataset.patch;
        var key = el.dataset.key;
        var subkey = el.dataset.subkey;
        var indexAttr = el.dataset.index;
        var value = el.dataset.value;

        var cur = Store.state.answers[objId] || {};
        if (typeof cur !== "object" || cur === null) cur = {};
        var nextPatch = Object.assign({}, cur);

        if (patch === "matches" || patch === "buckets" || patch === "picks") {
          // key + value (string)
          var sub = Object.assign({}, nextPatch[patch] || {});
          sub[key] = value;
          nextPatch[patch] = sub;
        } else if (patch === "sequence") {
          // index + value (from select)
          var seq = (nextPatch.sequence || []).slice();
          var idxVal = parseInt(indexAttr, 10);
          seq[idxVal] = el.value;
          nextPatch.sequence = seq;
        } else if (patch === "choice" || patch === "cwe" || patch === "surface" ||
                   patch === "readControl" || patch === "writeControl" ||
                   patch === "otControl" || patch === "serverControl") {
          nextPatch[patch] = el.value || value;
        } else if (patch === "picks" && subkey) {
          // lifecycle-table picks[stageId] = { cls, mit }
          var stagePicks = Object.assign({}, nextPatch.picks || {});
          var stageCur = Object.assign({}, stagePicks[key] || {});
          stageCur[subkey] = el.value;
          stagePicks[key] = stageCur;
          nextPatch.picks = stagePicks;
        } else {
          // Fallback: assign by key
          if (key) {
            nextPatch[patch] = nextPatch[patch] || {};
            nextPatch[patch][key] = el.value || value;
          } else {
            nextPatch[patch] = el.value || value;
          }
        }

        Store.patchAnswer(objId, nextPatch);
        return;
      }

      case "toggle-crypto": {
        var coId = el.dataset.id;
        var opt = el.dataset.value;
        var coCur = Store.state.answers[coId] || {};
        if (typeof coCur !== "object" || coCur === null) coCur = {};
        var selected = (coCur.selected || []).slice();
        var i = selected.indexOf(opt);
        if (i === -1) selected.push(opt);
        else selected.splice(i, 1);
        // Silent-set: the checkbox handles its own visual state natively, and
        // re-rendering on every toggle would detach sibling inputs the user
        // is about to click next (race when clicking multiple boxes in
        // succession). State is read fresh when Check is pressed.
        Store.patchAnswerSilent(coId, { selected: selected });
        return;
      }

      case "toggle-tool": {
        var tId = el.dataset.id;
        var tool = el.dataset.value;
        var tCur = Store.state.answers[tId] || {};
        if (typeof tCur !== "object" || tCur === null) tCur = {};
        var tools = (tCur.tools || []).slice();
        var ti = tools.indexOf(tool);
        if (ti === -1) tools.push(tool);
        else tools.splice(ti, 1);
        Store.patchAnswerSilent(tId, { tools: tools });
        return;
      }

      case "check-obj": {
        var checkId = el.dataset.id;
        var obj = Data.OBJECTIVES.filter(function (o) { return o.id === checkId; })[0];
        if (!obj) return;
        var res = Validators.validateObjective(checkId, Store.state, obj.feedback);
        Store.markObjective(checkId, res.correct, res.message);
        return;
      }

      case "request-hint":
        Store.requestHint(el.dataset.id);
        return;

      case "reset-obj":
        Store.resetObjective(el.dataset.id);
        return;

      case "open-quiz":
        uiState.quizOpen = true;
        render();
        break;

      case "close-quiz":
        uiState.quizOpen = false;
        render();
        break;

      case "pick-quiz": {
        var qid = el.dataset.qid;
        var qidx = parseInt(el.dataset.idx, 10);
        // R2: Store.setQuizAnswer locks after first pick.
        Store.setQuizAnswer(qid, qidx);
        return;
      }

      case "retry-quiz":
        Store.resetQuizAnswer(el.dataset.qid);
        return;

      case "finish-quiz":
        Store.completeQuiz();
        return;

      case "open-debrief":
        uiState.debriefOpen = true;
        render();
        break;

      case "close-debrief":
        uiState.debriefOpen = false;
        render();
        break;

      case "open-completion":
        uiState.completionOpen = true;
        render();
        break;

      case "close-completion":
        uiState.completionOpen = false;
        render();
        break;

      case "confirm-reset":
        uiState.confirmDialog = { type: "reset" };
        render();
        break;

      case "confirm-restart":
        uiState.confirmDialog = { type: "restart" };
        render();
        break;

      case "cancel-confirm":
        uiState.confirmDialog = null;
        render();
        break;

      case "do-reset":
        Store.resetEverything();
        uiState.confirmDialog = null;
        uiState.completionAutoOpened = false;
        uiState.quizOpen = false;
        uiState.debriefOpen = false;
        uiState.completionOpen = false;
        break;

      case "do-restart":
        Store.resetEverything();
        uiState.confirmDialog = null;
        uiState.completionAutoOpened = false;
        uiState.completionOpen = false;
        break;

      case "toggle-glossary":
        uiState.glossaryOpen = !uiState.glossaryOpen;
        render();
        break;

      default:
        return;
    }
  }

  function handleChange(e) {
    // Only dispatch change events for <select> elements to handleClick.
    // Checkboxes/radios fire BOTH click and change; the click handler already
    // updated state, so re-dispatching via change would re-toggle (BUG).
    // Selects fire change when the user picks an option — at that point
    // el.value is the new value, which is what patch-answer reads.
    var el = e.target;
    if (!el || el.tagName !== "SELECT") return;
    if (!el.dataset || !el.dataset.action) return;
    handleClick({ target: el });
  }

  function handleInput(e) {
    // Silent-set for textareas (data-action="patch-answer-silent").
    var el = e.target;
    if (!el.dataset || !el.dataset.action) return;
    if (el.dataset.action !== "patch-answer-silent") return;

    var objId = el.dataset.id;
    var patch = el.dataset.patch;
    var key = el.dataset.key;
    var subkey = el.dataset.subkey;

    var cur = Store.state.answers[objId] || {};
    if (typeof cur !== "object" || cur === null) cur = {};
    var nextPatch = Object.assign({}, cur);

    if (patch === "justifications" || patch === "errors" || patch === "rewrites") {
      var sub = Object.assign({}, nextPatch[patch] || {});
      sub[key] = el.value;
      nextPatch[patch] = sub;
    } else if (key) {
      var inner = Object.assign({}, nextPatch[patch] || {});
      inner[key] = el.value;
      nextPatch[patch] = inner;
    } else {
      nextPatch[patch] = el.value;
    }

    Store.patchAnswerSilent(objId, nextPatch);
  }

  function closeAction(action) {
    switch (action) {
      case "close-quiz": uiState.quizOpen = false; break;
      case "close-debrief": uiState.debriefOpen = false; break;
      case "close-completion": uiState.completionOpen = false; break;
      case "cancel-confirm": uiState.confirmDialog = null; break;
    }
    render();
  }

  // --- Boot -----------------------------------------------------------------

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  App.uiState = uiState;
  App.render = render;
})(typeof window !== "undefined" ? window : globalThis);
