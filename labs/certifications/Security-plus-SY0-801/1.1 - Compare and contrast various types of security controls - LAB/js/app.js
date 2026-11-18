/* ============================================================
 * CONTROLS BRIDGE — App Bootstrap & Event Wiring
 * Loads state, renders UI, wires all interactions via delegation.
 * ============================================================ */

var Lab = window.Lab || {};

Lab.app = (function() {
  "use strict";

  var ui = Lab.ui;
  var state = Lab.state;
  var data = Lab.data;
  var objs = Lab.objectives;
  var tutor = Lab.tutor;

  var root; // #app container

  // ---- Initialize ----
  function init() {
    root = document.getElementById("app");
    state.load();
    state.subscribe(render);
    render();
    wireGlobalEvents();
  }

  // ---- Main render ----
  function render() {
    var s = state.getState();

    if (!s.mode || !s.hasStarted) {
      root.innerHTML = ui.renderModeSelection();
      wireModeSelection();
      return;
    }

    // Lab screen
    var html = '' +
      '<div class="screen bp-grid-fine">' +
        ui.renderHeader(s) +
        '<main class="max-w-7xl px-3" style="padding-top:1.25rem;padding-bottom:6rem;display:flex;flex-direction:column;gap:1.75rem">' +
          ui.renderBriefing() +
          ui.renderKnowledgeCore() +
          ui.renderBridge(s.mode) +
          ui.renderObjectivesTracker(s.mode) +
          ui.renderQuiz(s.mode) +
          ui.renderDebrief() +
          '<div style="text-align:center;padding-top:1rem;padding-bottom:0.5rem">' +
            '<p class="text-xs mono" style="color:oklch(0.70 0.012 250 / 50%)">Controls Bridge · CompTIA Security+ SY0-801 · Lesson 1.1 · Synthetic training data</p>' +
          '</div>' +
        '</main>' +
        ui.renderGlossaryDrawer() +
        (s.mode === "medium" ? ui.renderTutorPanel() : "") +
      '</div>';

    root.innerHTML = html;

    // Check if completion modal should show
    var objectives = data.OBJECTIVES.filter(function(o) { return o.mode === s.mode; });
    var completed = objectives.filter(function(o) { return s.objectives[o.id] && s.objectives[o.id].status === "correct"; }).length;
    var allDone = objectives.length > 0 && completed === objectives.length;
    if (allDone && !s.completionDismissed) {
      var modalHtml = ui.renderCompletionModal(s.mode);
      var modalDiv = document.createElement("div");
      modalDiv.innerHTML = modalHtml;
      root.appendChild(modalDiv.firstElementChild);
    }

    wireLabEvents();
  }

  // ---- Wire mode selection ----
  function wireModeSelection() {
    root.querySelectorAll(".mode-card").forEach(function(card) {
      card.addEventListener("click", function() {
        var mode = card.getAttribute("data-mode");
        state.startLab(mode);
      });
    });
  }

  // ---- Wire lab events (via delegation) ----
  function wireLabEvents() {
    // Header buttons
    var btnReset = document.getElementById("btn-reset");
    if (btnReset) btnReset.addEventListener("click", confirmReset);
    var btnExit = document.getElementById("btn-exit");
    if (btnExit) btnExit.addEventListener("click", function() { state.exitToModeSelect(); });

    // Bridge: classification dropdowns
    root.querySelectorAll('[data-action="set-category"]').forEach(function(sel) {
      sel.addEventListener("change", function() {
        state.setClassification(sel.getAttribute("data-control"), "category", sel.value || null);
      });
    });
    root.querySelectorAll('[data-action="set-function"]').forEach(function(sel) {
      sel.addEventListener("change", function() {
        state.setClassification(sel.getAttribute("data-control"), "function", sel.value || null);
      });
    });

    // Bridge: artifact popovers
    root.querySelectorAll('[data-action="show-artifacts"]').forEach(function(btn) {
      btn.addEventListener("click", function(e) {
        e.stopPropagation();
        var controlId = btn.getAttribute("data-control");
        showArtifactPopover(controlId, btn);
      });
    });

    // Bridge: stress test toggles
    root.querySelectorAll('[data-action="toggle-stress"]').forEach(function(sw) {
      sw.addEventListener("click", function() { toggleStress(sw); });
      sw.addEventListener("keydown", function(e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleStress(sw); } });
    });

    // Objectives: select-one
    root.querySelectorAll('[data-action="select-one"]').forEach(function(inp) {
      inp.addEventListener("change", function() {
        state.setSelection(inp.getAttribute("data-obj"), [inp.value]);
      });
    });

    // Objectives: select-many
    root.querySelectorAll('[data-action="select-many"]').forEach(function(inp) {
      inp.addEventListener("change", function() {
        var objId = inp.getAttribute("data-obj");
        var cur = state.getState().selections[objId] || [];
        if (inp.checked) {
          if (cur.indexOf(inp.value) === -1) cur = cur.concat([inp.value]);
        } else {
          cur = cur.filter(function(v) { return v !== inp.value; });
        }
        state.setSelection(objId, cur);
      });
    });

    // Objectives: free-text
    root.querySelectorAll('[data-action="free-text"]').forEach(function(ta) {
      ta.addEventListener("input", function() {
        state.setFreeText(ta.getAttribute("data-obj"), ta.value);
      });
    });

    // Objectives: composite select
    root.querySelectorAll('[data-action="composite-select"]').forEach(function(inp) {
      inp.addEventListener("change", function() {
        state.setCompositeSelection(inp.getAttribute("data-subkey"), inp.value);
      });
    });

    // Objectives: composite free-text
    root.querySelectorAll('[data-action="composite-free-text"]').forEach(function(ta) {
      ta.addEventListener("input", function() {
        state.setCompositeFreeText(ta.getAttribute("data-subkey"), ta.value);
      });
    });

    // Objectives: sequence add
    root.querySelectorAll('[data-action="seq-add"]').forEach(function(btn) {
      btn.addEventListener("click", function() {
        var objId = btn.getAttribute("data-obj");
        var id = btn.getAttribute("data-id");
        var cur = state.getState().sequences[objId] || [];
        state.setSequence(objId, cur.concat([id]));
      });
    });

    // Objectives: sequence up
    root.querySelectorAll('[data-action="seq-up"]').forEach(function(btn) {
      btn.addEventListener("click", function() {
        var objId = btn.getAttribute("data-obj");
        var idx = parseInt(btn.getAttribute("data-idx"), 10);
        var cur = state.getState().sequences[objId] || [];
        if (idx === 0) return;
        var next = cur.slice();
        var tmp = next[idx-1]; next[idx-1] = next[idx]; next[idx] = tmp;
        state.setSequence(objId, next);
      });
    });

    // Objectives: sequence down
    root.querySelectorAll('[data-action="seq-down"]').forEach(function(btn) {
      btn.addEventListener("click", function() {
        var objId = btn.getAttribute("data-obj");
        var idx = parseInt(btn.getAttribute("data-idx"), 10);
        var cur = state.getState().sequences[objId] || [];
        if (idx === cur.length - 1) return;
        var next = cur.slice();
        var tmp = next[idx+1]; next[idx+1] = next[idx]; next[idx] = tmp;
        state.setSequence(objId, next);
      });
    });

    // Objectives: sequence remove
    root.querySelectorAll('[data-action="seq-remove"]').forEach(function(btn) {
      btn.addEventListener("click", function() {
        var objId = btn.getAttribute("data-obj");
        var id = btn.getAttribute("data-id");
        var cur = state.getState().sequences[objId] || [];
        state.setSequence(objId, cur.filter(function(x) { return x !== id; }));
      });
    });

    // Objectives: check
    root.querySelectorAll('[data-action="check-objective"]').forEach(function(btn) {
      btn.addEventListener("click", function() {
        var objId = btn.getAttribute("data-obj");
        var obj = data.OBJECTIVES.find(function(o) { return o.id === objId; });
        if (!obj) return;
        state.incrementAttempts(objId);
        var result = objs.checkObjective(obj);
        state.setObjectiveStatus(objId, result.passed ? "correct" : "incorrect");
      });
    });

    // Objectives: hints
    root.querySelectorAll('[data-action="use-hint"]').forEach(function(btn) {
      btn.addEventListener("click", function() {
        state.useHint(btn.getAttribute("data-obj"));
      });
    });

    // Objectives: hard nudge
    root.querySelectorAll('[data-action="use-nudge"]').forEach(function(btn) {
      btn.addEventListener("click", function() {
        state.useHardNudge(btn.getAttribute("data-obj"));
      });
    });

    // Quiz: select
    root.querySelectorAll('[data-action="quiz-select"]').forEach(function(inp) {
      inp.addEventListener("change", function() {
        state.setQuizAnswer(inp.getAttribute("data-qid"), parseInt(inp.value, 10));
      });
    });

    // Quiz: check
    root.querySelectorAll('[data-action="quiz-check"]').forEach(function(btn) {
      btn.addEventListener("click", function() {
        state.setQuizChecked(btn.getAttribute("data-qid"));
      });
    });

    // Quiz: next
    root.querySelectorAll('[data-action="quiz-next"]').forEach(function(btn) {
      btn.addEventListener("click", function() {
        var s = state.getState();
        state.setQuizCurrentIndex((s.quizCurrentIndex || 0) + 1);
      });
    });

    // Quiz: prev
    root.querySelectorAll('[data-action="quiz-prev"]').forEach(function(btn) {
      btn.addEventListener("click", function() {
        var s = state.getState();
        state.setQuizCurrentIndex(Math.max(0, (s.quizCurrentIndex || 0) - 1));
      });
    });

    // Quiz: goto
    root.querySelectorAll('[data-action="quiz-goto"]').forEach(function(btn) {
      btn.addEventListener("click", function() {
        state.setQuizCurrentIndex(parseInt(btn.getAttribute("data-idx"), 10));
      });
    });

    // Glossary
    var glossaryFab = document.querySelector(".fab-glossary");
    if (glossaryFab) glossaryFab.addEventListener("click", toggleGlossary);
    document.querySelectorAll('[data-action="close-glossary"]').forEach(function(el) {
      el.addEventListener("click", closeGlossary);
    });
    var glossarySearch = document.getElementById("glossary-search");
    if (glossarySearch) glossarySearch.addEventListener("input", filterGlossary);

    // Tutor (Medium only)
    var tutorFab = document.getElementById("tutor-fab");
    if (tutorFab) tutorFab.addEventListener("click", toggleTutor);
    var tutorSend = document.querySelector('[data-action="tutor-send"]');
    if (tutorSend) tutorSend.addEventListener("click", sendTutorMessage);
    var tutorInput = document.getElementById("tutor-input");
    if (tutorInput) {
      tutorInput.addEventListener("keydown", function(e) {
        if (e.key === "Enter") { e.preventDefault(); sendTutorMessage(); }
      });
      tutorInput.addEventListener("input", function() {
        var count = document.getElementById("tutor-char-count");
        if (count) count.textContent = tutorInput.value.length;
      });
    }

    // Completion modal
    document.querySelectorAll('[data-action="close-modal"]').forEach(function(btn) {
      btn.addEventListener("click", function() {
        state.dismissCompletion();
      });
    });
    document.querySelectorAll('[data-action="reset-lab"]').forEach(function(btn) {
      btn.addEventListener("click", function() {
        state.reset();
      });
    });

    // ESC key for popups
    document.addEventListener("keydown", handleEsc);
  }

  // ---- Global events ----
  function wireGlobalEvents() {
    // ESC key handler is wired per-render via handleEsc
  }

  // ---- ESC handler ----
  function handleEsc(e) {
    if (e.key !== "Escape") return;
    // Close artifact popover
    var popover = document.getElementById("artifact-popover");
    if (popover) { popover.remove(); return; }
    // Close glossary
    var drawer = document.getElementById("glossary-drawer");
    if (drawer && drawer.classList.contains("open")) { closeGlossary(); return; }
    // Close tutor
    var tutor = document.getElementById("tutor-panel");
    if (tutor && !tutor.classList.contains("hidden")) { toggleTutor(); return; }
    // Close completion modal
    var modal = document.getElementById("completion-overlay");
    if (modal) { state.dismissCompletion(); return; }
  }

  // ---- Artifact popover ----
  function showArtifactPopover(controlId, anchorEl) {
    // Remove any existing popover
    var existing = document.getElementById("artifact-popover");
    if (existing) existing.remove();

    var popoverDiv = document.createElement("div");
    popoverDiv.innerHTML = ui.renderArtifactPopover(controlId);
    var popover = popoverDiv.firstElementChild;
    document.body.appendChild(popover);

    // Position near anchor
    var rect = anchorEl.getBoundingClientRect();
    popover.style.position = "fixed";
    popover.style.top = (rect.bottom + 4) + "px";
    popover.style.left = Math.min(rect.left, window.innerWidth - 340) + "px";

    // Close on click outside
    setTimeout(function() {
      document.addEventListener("click", closePopoverOnOutside);
    }, 0);

    // Close button
    popover.querySelectorAll('[data-action="close-popover"]').forEach(function(btn) {
      btn.addEventListener("click", function() { popover.remove(); });
    });
  }

  function closePopoverOnOutside(e) {
    var popover = document.getElementById("artifact-popover");
    if (!popover) { document.removeEventListener("click", closePopoverOnOutside); return; }
    if (!popover.contains(e.target) && !e.target.closest('[data-action="show-artifacts"]')) {
      popover.remove();
      document.removeEventListener("click", closePopoverOnOutside);
    }
  }

  // ---- Stress toggle ----
  function toggleStress(sw) {
    var controlId = sw.getAttribute("data-control");
    var layer = sw.getAttribute("data-layer");
    var s = state.getState();
    var layerStress = s.stress[layer] || { disabledControls: [], running: false };
    var cur = layerStress.disabledControls;
    if (cur.indexOf(controlId) === -1) {
      state.setStressDisabled(layer, cur.concat([controlId]));
    } else {
      state.setStressDisabled(layer, cur.filter(function(id) { return id !== controlId; }));
    }
  }

  // ---- Glossary ----
  function toggleGlossary() {
    var drawer = document.getElementById("glossary-drawer");
    var overlay = document.getElementById("glossary-overlay");
    if (!drawer) return;
    if (drawer.classList.contains("open")) {
      closeGlossary();
    } else {
      drawer.classList.add("open");
      if (overlay) overlay.classList.remove("hidden");
    }
  }
  function closeGlossary() {
    var drawer = document.getElementById("glossary-drawer");
    var overlay = document.getElementById("glossary-overlay");
    if (drawer) drawer.classList.remove("open");
    if (overlay) overlay.classList.add("hidden");
  }
  function filterGlossary(e) {
    var q = e.target.value.toLowerCase();
    var list = document.getElementById("glossary-list");
    if (!list) return;
    data.GLOSSARY.forEach(function(g, i) {
      var item = list.children[i];
      if (!item) return;
      var match = g.term.toLowerCase().indexOf(q) !== -1 || g.definition.toLowerCase().indexOf(q) !== -1;
      item.style.display = match ? "" : "none";
    });
  }

  // ---- Tutor ----
  function toggleTutor() {
    var panel = document.getElementById("tutor-panel");
    var fab = document.getElementById("tutor-fab");
    if (!panel) return;
    if (panel.classList.contains("hidden")) {
      panel.classList.remove("hidden");
      if (fab) fab.setAttribute("aria-expanded", "true");
      var input = document.getElementById("tutor-input");
      if (input) input.focus();
    } else {
      panel.classList.add("hidden");
      if (fab) fab.setAttribute("aria-expanded", "false");
    }
  }

  function sendTutorMessage() {
    var input = document.getElementById("tutor-input");
    if (!input || !input.value.trim()) return;
    var q = input.value.trim();
    input.value = "";
    var count = document.getElementById("tutor-char-count");
    if (count) count.textContent = "0";

    // Add user message
    var messages = document.getElementById("tutor-messages");
    if (!messages) return;
    var userDiv = document.createElement("div");
    userDiv.style.cssText = "display:flex;flex-direction:row-reverse;gap:0.5rem";
    userDiv.innerHTML = '<div style="max-width:80%;padding:0.625rem;border-radius:8px;background:var(--primary);color:var(--primary-fg);font-size:0.75rem;line-height:1.5">' + ui.esc(q) + '</div>';
    messages.appendChild(userDiv);
    messages.scrollTop = messages.scrollHeight;

    // Show loading
    var loadingDiv = document.createElement("div");
    loadingDiv.style.cssText = "display:flex;gap:0.5rem";
    loadingDiv.innerHTML = '<div style="width:1.5rem;height:1.5rem;border-radius:50%;background:oklch(0.78 0.155 65 / 15%);border:1px solid oklch(0.78 0.155 65 / 30%);display:flex;align-items:center;justify-content:center;flex-shrink:0">' + ui.ICONS.loader.replace('currentColor','var(--primary)') + '</div><div style="padding:0.625rem;border-radius:8px;background:oklch(0.18 0.014 250 / 60%);border:1px solid var(--border);font-size:0.75rem;color:var(--muted-fg)">Thinking…</div>';
    messages.appendChild(loadingDiv);
    messages.scrollTop = messages.scrollHeight;

    // Call tutor
    var s = state.getState();
    var context = {};
    var currentObj = data.OBJECTIVES.find(function(o) {
      return o.mode === "medium" && s.objectives[o.id] && (s.objectives[o.id].status === "in-progress" || s.objectives[o.id].status === "incorrect");
    });
    if (currentObj) context = { currentObjective: currentObj.id, objectiveTitle: currentObj.title };

    tutor.ask(q, context).then(function(reply) {
      loadingDiv.remove();
      var replyDiv = document.createElement("div");
      replyDiv.style.cssText = "display:flex;gap:0.5rem";
      replyDiv.innerHTML = '<div style="width:1.5rem;height:1.5rem;border-radius:50%;background:oklch(0.78 0.155 65 / 15%);border:1px solid oklch(0.78 0.155 65 / 30%);display:flex;align-items:center;justify-content:center;flex-shrink:0">' + ui.ICONS.sparkle.replace('currentColor','var(--primary)').replace('width="12"','width="10"') + '</div><div style="max-width:80%;padding:0.625rem;border-radius:8px;background:oklch(0.18 0.014 250 / 60%);border:1px solid var(--border);font-size:0.75rem;line-height:1.5">' + ui.esc(reply) + '</div>';
      messages.appendChild(replyDiv);
      messages.scrollTop = messages.scrollHeight;
    });
  }

  // ---- Reset confirmation ----
  function confirmReset() {
    if (window.confirm("Reset the entire lab?\n\nThis wipes all progress — objective completions, classifications, quiz answers, and hints used — and returns you to mode selection. This cannot be undone.")) {
      state.reset();
    }
  }

  return { init: init };
})();

// ---- Bootstrap on DOM ready ----
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", Lab.app.init);
} else {
  Lab.app.init();
}
