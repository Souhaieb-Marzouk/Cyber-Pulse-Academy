// Operation THAWLINE — static port: bootstrap, stage routing, event wiring,
// match-listbox behavior and the store subscription that keeps every region
// in sync (the React re-render graph of page.tsx, expressed imperatively).
// Depends on globals: LabData, LabObjectives, LabStore, LabUI, LabBoards,
// LabQuiz.

var LabApp = (function () {
  "use strict";

  let finishOpen = false; // "Finish" button intent (mirrors useState in LabRoot)

  /* ---------------- focus restoration across re-renders ---------------- */

  function captureFocusId() {
    const el = document.activeElement;
    if (el && el.dataset && el.dataset.focusId) return el.dataset.focusId;
    return null;
  }

  function restoreFocus(id) {
    if (!id) return;
    const el = document.querySelector('[data-focus-id="' + id + '"]');
    if (el) el.focus();
  }

  /* ---------------- stage rendering ---------------- */

  function boardHtml(mode) {
    const b = LabStore.state.activeBoard;
    switch (b) {
      case "briefing": return LabBoards.briefing(mode);
      case "manual": return LabBoards.manual(mode);
      case "records": return LabBoards.records(mode);
      case "drill": return LabBoards.drill(mode);
      case "ledger": return LabBoards.ledger(mode);
      case "planner": return LabBoards.planner(mode);
      case "review": return LabQuiz.render(mode);
      case "afteraction": return LabBoards.afteraction();
      case "wall": return LabUI.renderWall(mode);
      default: return "";
    }
  }

  function renderStageInto(stageEl, mode) {
    if (!stageEl) return;
    closeAllMatches();
    const focusId = captureFocusId();
    const b = LabStore.state.activeBoard;
    let html = "";
    if (b !== "wall") {
      const meta = LabData.BOARD_META.find((x) => x.id === b);
      html +=
        '<div class="stage-back-row">' +
        '<button type="button" class="btn btn-outline-dune" data-action="set-board" data-board="wall" ' +
        'data-focus-id="back-wall" aria-label="Back to the evidence wall">' +
        LabUI.icon("ChevronLeft") + "Evidence wall</button>" +
        '<span class="board-kicker">BOARD ' + (meta ? meta.no : "") + " — " + (meta ? LabUI.esc(meta.title) : "") + "</span>" +
        "</div>";
    }
    html += '<div class="board-enter">' + boardHtml(mode) + "</div>";
    stageEl.innerHTML = html;
    restoreFocus(focusId);
    if (b === "review") LabQuiz.afterRender();
  }

  /* ---------------- root render ---------------- */

  function renderGate() {
    const root = document.getElementById("root");
    root.innerHTML =
      '<main class="gate anim-gate">' +
      '<div class="stamp-row" style="margin-bottom:8px">' +
      LabUI.stamp("Training data — fictional", "red") +
      LabUI.stamp("Tabletop exercise", "ink") +
      "</div>" +
      '<h1>' + LabUI.esc(LabData.EXERCISE) + "</h1>" +
      '<p class="gate-lede">A disaster-recovery practice lab for <strong style="color:var(--ink)">CompTIA Network+ (N10-009)</strong> — RPO, RTO, MTTR, MTBF, cold/warm/hot sites, active-active/passive, and DR testing. Choose how you want to work:</p>' +
      '<div class="gate-grid">' +
      '<button type="button" class="gate-card medium" data-action="set-mode" data-mode="medium" ' +
      'aria-label="Choose guided mode: medium difficulty, 12 guided objectives with hints">' +
      '<div class="gate-card-kicker">' + LabUI.icon("ShieldCheck") + "<span>Guided drill</span></div>" +
      '<div class="gate-card-title">MEDIUM — learn it</div>' +
      "<ul>" +
      "<li>· 12 granular clipboard objectives, checked one by one</li>" +
      "<li>· Where-to-look guidance + two-tier hints (cost stars, never block)</li>" +
      "<li>· Coach feedback after every check; tolerant answer formats</li>" +
      "<li>· Concept quiz afterwards; supportive, exam-oriented</li>" +
      "</ul>" +
      '<div class="gate-card-foot">' + LabUI.icon("Timer") + " Suggested: first pass at the chapter</div>" +
      "</button>" +
      '<button type="button" class="gate-card hard" data-action="set-mode" data-mode="hard" ' +
      'aria-label="Choose audit mode: hard difficulty, 9 deep challenges with distractors">' +
      '<div class="gate-card-kicker">' + LabUI.icon("CloudRainWind") + "<span>Live audit</span></div>" +
      '<div class="gate-card-title">HARD — prove it</div>' +
      "<ul>" +
      "<li>· 9 broad multi-step challenges; strict, exact validation</li>" +
      "<li>· Noisy evidence with red herrings you must discount</li>" +
      "<li>· No where-to-look; a single optional nudge that costs stars</li>" +
      "<li>· Scenario quiz; efficiency and accuracy drive the score</li>" +
      "</ul>" +
      '<div class="gate-card-foot">' + LabUI.icon("Gauge") + " Suggested: after you have studied the chapter</div>" +
      "</button>" +
      "</div>" +
      '<p class="gate-how">How the desk works: the <strong>objectives clipboard</strong> (left) tracks your progress and validates every objective; the <strong>evidence wall</strong> (center) holds all boards — briefing, field manual, records room, storm drill, recovery ledger, continuity planner, board review and after-action notes. All data on this desk is synthetic training material for ' +
      LabUI.esc(LabData.ORG) + ". Nothing here touches real systems. Progress auto-saves in your browser.</p>" +
      "</main>";
  }

  function renderDesk(mode) {
    const root = document.getElementById("root");
    root.innerHTML =
      '<div id="strip"></div>' +
      '<div class="desk-wrap"><div class="desk">' +
      '<aside id="clipboard-rail" class="clip-rail" aria-label="Objectives clipboard"></aside>' +
      '<main class="stage"><div id="stage-content"></div></main>' +
      '<div id="quick-rail" class="quick-rail"></div>' +
      "</div></div>" +
      '<div id="clip-fab" class="fab-holder"></div>';

    LabUI.renderStrip();
    LabUI.renderClipboard();
    LabUI.renderFab();
    LabUI.renderQuickRail();
    renderStageInto(document.getElementById("stage-content"), mode);
  }

  function renderRoot() {
    const mode = LabStore.state.mode;
    closeAllMatches();
    if (!mode) {
      renderGate();
      return;
    }
    renderDesk(mode);
  }

  /* ---------------- completion modal + focus areas (R8) ---------------- */

  function deriveFocusAreas() {
    const mode = LabStore.state.mode;
    const objectiveState = LabStore.state.objectiveState;
    const answers = LabStore.state.answers;
    const areas = [];
    const objs = LabObjectives.objectivesForMode(mode);
    const bank = mode === "hard" ? LabData.QUIZ_HARD : LabData.QUIZ_MEDIUM;

    function answeredCount() {
      return bank.filter((q) => answers["quiz." + q.id] !== undefined).length;
    }

    // 1) wrong quiz answers — mapped to the concept each item tests
    const wrong = bank.filter((q) => {
      const a = answers["quiz." + q.id];
      return a !== undefined && a !== q.correct;
    });
    if (wrong.length > 0) {
      const topics = [];
      for (const q of wrong) if (topics.indexOf(q.topic) === -1) topics.push(q.topic);
      areas.push({
        title: "Board Review: " + topics.join("; "),
        detail: wrong.length + " of " + bank.length + " quiz items came out wrong (" +
          wrong.map((q) => "Q" + (bank.indexOf(q) + 1)).join(", ") + ").",
        action: "Re-read the referenced section, then replay the question in your own words.",
        board: "review",
      });
    } else if (answeredCount() < bank.length) {
      areas.push({
        title: "Board Review not finished",
        detail: "Only " + answeredCount() + " of " + bank.length + " quiz items answered — the quiz feeds 30% of the score.",
        action: "Open Board Review and complete the remaining items.",
        board: "review",
      });
    }

    // 2) unsolved objectives
    const unsolved = objs.filter((o) => !(objectiveState[o.id] && objectiveState[o.id].solved));
    if (unsolved.length > 0) {
      areas.push({
        title: "Unsolved objectives: " + unsolved.map((o) => o.id).join(", "),
        detail: "Still open on the clipboard: " + unsolved.map((o) => o.title).join(" · "),
        action: "Work them board by board — each has tiered hints that never block.",
      });
    }

    // 3) objectives that needed retries or hints
    const shaky = objs.filter((o) => {
      const st = objectiveState[o.id];
      return st && st.solved && (st.attempts > 1 || st.hintsUsed > 0);
    });
    if (shaky.length > 0) {
      areas.push({
        title: "Shaky first attempts: " + shaky.map((o) => o.id).join(", "),
        detail:
          "These were solved only after retries or hints: " +
          shaky
            .map((o) => {
              const st = objectiveState[o.id];
              return o.id + " (" + (st.attempts > 1 ? st.attempts + " attempts" : "first try missed") +
                (st.hintsUsed > 0 ? ", " + st.hintsUsed + " hint" + (st.hintsUsed > 1 ? "s" : "") : "") + ")";
            })
            .join("; ") + ".",
        action: "Re-derive each from the evidence once more — exam questions will not offer hints.",
      });
    }

    return areas;
  }

  function modalAutoOpen() {
    const p = LabStore.progress();
    return p.allSolved && !LabStore.state.completionSeen;
  }

  function syncModal() {
    const dlg = document.getElementById("dlg-modal");
    if (!dlg) return;
    const shouldOpen = finishOpen || modalAutoOpen();
    if (shouldOpen && !dlg.open) {
      dlg.innerHTML = LabUI.renderModalContent(deriveFocusAreas());
      dlg.showModal();
    } else if (!shouldOpen && dlg.open) {
      dlg.close();
    } else if (shouldOpen && dlg.open) {
      // keep content fresh while open
      dlg.innerHTML = LabUI.renderModalContent(deriveFocusAreas());
    }
  }

  function syncSheet() {
    const dlg = document.getElementById("dlg-sheet");
    if (!dlg || !dlg.open) return;
    dlg.innerHTML = sheetContent();
  }

  function sheetContent() {
    const p = LabStore.progress();
    return (
      '<div class="visually-hidden">Objectives clipboard</div>' +
      '<div class="visually-hidden">Your ' + p.total + " objectives with progress, checks and hints.</div>" +
      '<button type="button" class="sheet-close" data-action="close-clipboard" aria-label="Close clipboard">' +
      LabUI.icon("X") + "</button>" +
      '<div class="sheet-body">' + LabUI.clipboardInnerHtml() + "</div>"
    );
  }

  /* ---------------- store subscription ---------------- */

  function onState(state, changed) {
    const set = new Set(changed);

    if (set.has("mode")) {
      LabBoards.resetRecordsDoc();
      renderRoot();
      syncModal(); // reset closes the modal
      return;
    }

    const hasMode = !!state.mode;
    if (!hasMode) return;

    if (set.has("objectiveState")) {
      if (LabStore.state.activeBoard === "wall") {
        renderStageInto(document.getElementById("stage-content"), state.mode);
      } else {
        refreshTaskPanels();
      }
      LabUI.renderStrip();
      LabUI.renderClipboard();
      LabUI.renderFab();
      syncSheet();
      syncModal();
    }

    if (set.has("answers")) {
      const b = LabStore.state.activeBoard;
      if (b === "drill" || b === "review") {
        const stage = document.getElementById("stage-content");
        renderStageInto(stage, state.mode);
      }
      // manual/records/ledger/planner select + input edits manage their own
      // visual state in place — no re-render (protects typing focus)
    }

    if (set.has("remediation")) {
      const stage = document.getElementById("stage-content");
      if (LabStore.state.activeBoard === "planner" && stage) {
        const focusId = captureFocusId();
        const widget = stage.querySelector("#remediation-widget");
        if (widget) widget.outerHTML = LabBoards.remediationWidget();
        restoreFocus(focusId);
      }
    }

    if (set.has("activeBoard")) {
      if (LabStore.state.activeBoard !== "records") LabBoards.resetRecordsDoc();
      renderStageInto(document.getElementById("stage-content"), state.mode);
    }
  }

  function refreshTaskPanels() {
    const mode = LabStore.state.mode;
    const stage = document.getElementById("stage-content");
    if (!stage || !mode) return;
    const panels = stage.querySelectorAll("[data-task]");
    if (panels.length === 0) return;
    const focusId = captureFocusId();
    const hosted = LabObjectives.objectivesForMode(mode);
    panels.forEach((panel) => {
      const obj = hosted.find((o) => o.id === panel.dataset.task);
      if (!obj) return;
      // Rebuild the panel with its current body content preserved: the body
      // lives in .task-body and contains live form state, so we only replace
      // the panel's non-body parts.
      const body = panel.querySelector(".task-body");
      const bodyHtml = body ? body.innerHTML : "";
      const tmp = document.createElement("div");
      tmp.innerHTML = LabUI.taskPanel(obj, mode, "__BODY__");
      const fresh = tmp.firstElementChild;
      const freshBody = fresh.querySelector(".task-body");
      if (freshBody && bodyHtml && bodyHtml !== "__BODY__") freshBody.innerHTML = bodyHtml;
      panel.replaceWith(fresh);
    });
    restoreFocus(focusId);
  }

  /* ---------------- match listbox (Radix-Select-like) ---------------- */

  let currentOpen = null;

  function closeAllMatches() {
    if (!currentOpen) return;
    const { match, trigger, pop } = currentOpen;
    try {
      if (pop.parentNode !== match) match.appendChild(pop);
      pop.classList.remove("open");
      pop.style.position = "";
      pop.style.left = "";
      pop.style.top = "";
      pop.style.width = "";
      trigger.setAttribute("aria-expanded", "false");
    } catch (e) { /* detached during re-render */ }
    currentOpen = null;
  }

  function openMatch(match) {
    closeAllMatches();
    const trigger = match.querySelector(".match-trigger");
    const pop = match.querySelector(".match-pop");
    if (!trigger || !pop) return;
    const rect = trigger.getBoundingClientRect();
    pop.classList.add("open");
    pop.style.position = "fixed";
    pop.style.left = rect.left + "px";
    pop.style.top = rect.bottom + 4 + "px";
    pop.style.width = rect.width + "px";
    document.body.appendChild(pop); // escape overflow clipping (Radix portal parity)
    trigger.setAttribute("aria-expanded", "true");
    currentOpen = { match: match, trigger: trigger, pop: pop };
    const opts = Array.prototype.slice.call(pop.querySelectorAll(".match-option"));
    const sel = opts.find((o) => o.getAttribute("aria-selected") === "true") || opts[0];
    if (sel) {
      setActiveOption(sel);
      pop.focus();
    }
  }

  function setActiveOption(opt) {
    if (!currentOpen) return;
    currentOpen.pop.querySelectorAll(".match-option").forEach((o) => o.removeAttribute("data-active"));
    opt.setAttribute("data-active", "1");
    opt.focus();
  }

  function chooseOption(opt) {
    if (!currentOpen) return;
    const key = currentOpen.match.dataset.match;
    const value = opt.dataset.value;
    const trigger = currentOpen.trigger;
    LabStore.setAnswer(key, value);
    closeAllMatches();
    // refresh the control in place so the label + selection marker are correct
    const match = document.querySelector('.match[data-match="' + key + '"]');
    if (match) {
      const options = popOptionsFor(key, value);
      match.outerHTML = options;
      const freshTrigger = document.querySelector('.match[data-match="' + key + '"] .match-trigger');
      if (freshTrigger) freshTrigger.focus();
    } else if (trigger) {
      trigger.focus();
    }
  }

  function popOptionsFor(key, value) {
    // rebuild a single match control from its data by asking the current stage
    // HTML: simplest correct path is to re-render the whole stage region the
    // control lives in — but that would disturb focus mid-interaction, so we
    // patch label + selected markers locally instead.
    const match = document.querySelector('.match[data-match="' + key + '"]');
    if (!match) return "";
    const trigger = match.querySelector(".match-trigger");
    const pop = match.querySelector(".match-pop");
    const labelEl = trigger ? trigger.querySelector(".match-value") : null;
    const opts = pop ? Array.prototype.slice.call(pop.querySelectorAll(".match-option")) : [];
    const chosen = opts.find((o) => o.dataset.value === value);
    if (labelEl && chosen) labelEl.textContent = chosen.textContent;
    if (trigger) trigger.dataset.empty = "0";
    if (pop) {
      pop.querySelectorAll(".match-option").forEach((o) => {
        o.setAttribute("aria-selected", o.dataset.value === value ? "true" : "false");
      });
    }
    return match.outerHTML;
  }

  /* ---------------- delegated events ---------------- */

  function routeAction(el) {
    const action = el.dataset.action;
    const mode = LabStore.state.mode;
    switch (action) {
      case "set-mode":
        LabStore.setMode(el.dataset.mode);
        break;
      case "set-board":
        LabStore.setActiveBoard(el.dataset.board);
        break;
      case "check":
        LabStore.checkObjective(el.dataset.obj);
        break;
      case "hint":
        if (mode) {
          const obj = LabObjectives.objectivesForMode(mode).find((o) => o.id === el.dataset.obj);
          if (obj) LabStore.revealHint(obj.id, mode === "medium" ? Math.min(2, obj.hints.length) : 1);
        }
        break;
      case "finish":
        finishOpen = true;
        syncModal();
        break;
      case "open-reset": {
        const dlg = document.getElementById("dlg-reset");
        if (dlg && !dlg.open) dlg.showModal();
        break;
      }
      case "reset-cancel": {
        const dlg = document.getElementById("dlg-reset");
        if (dlg && dlg.open) dlg.close();
        break;
      }
      case "reset-confirm": {
        // Radix AlertDialogAction closes the dialog automatically on click
        const dlg = document.getElementById("dlg-reset");
        if (dlg && dlg.open) dlg.close();
        LabStore.reset(); // clears storage, returns to the pristine gate
        break;
      }
      case "open-clipboard": {
        const dlg = document.getElementById("dlg-sheet");
        if (dlg && !dlg.open) {
          dlg.innerHTML = sheetContent();
          dlg.showModal();
        }
        break;
      }
      case "close-clipboard": {
        const dlg = document.getElementById("dlg-sheet");
        if (dlg && dlg.open) dlg.close();
        break;
      }
      case "execute-drill":
        LabStore.setAnswer("drill.executed", "1");
        break;
      case "set-answer":
        LabStore.setAnswer(el.dataset.key, el.dataset.value);
        break;
      case "remediate":
        LabStore.pushRemediation(el.dataset.id);
        break;
      case "clear-remediation":
        LabStore.clearRemediation();
        break;
      case "quiz-pick":
        LabQuiz.pick(el.dataset.item, el.dataset.opt);
        break;
      case "quiz-check":
        LabQuiz.check(el.dataset.item);
        break;
      case "quiz-next":
        LabQuiz.next(parseInt(el.dataset.index, 10));
        break;
      case "set-doc": {
        LabBoards.resetRecordsDoc();
        // set the picked doc then re-render the records board
        recordsSetDoc(el.dataset.doc);
        break;
      }
      case "modal-board": {
        finishOpen = false;
        const dlg = document.getElementById("dlg-modal");
        if (dlg && dlg.open) dlg.close();
        if (!LabStore.state.completionSeen) LabStore.markCompletionSeen();
        LabStore.setActiveBoard(el.dataset.board);
        break;
      }
      case "modal-wall": {
        finishOpen = false;
        const dlgw = document.getElementById("dlg-modal");
        if (dlgw && dlgw.open) dlgw.close();
        if (!LabStore.state.completionSeen) LabStore.markCompletionSeen();
        LabStore.setActiveBoard("wall");
        break;
      }
      case "modal-restart":
        finishOpen = false;
        LabStore.reset();
        break;
      case "close-modal": {
        finishOpen = false;
        const dlgc = document.getElementById("dlg-modal");
        if (dlgc && dlgc.open) dlgc.close();
        break;
      }
      default:
        break;
    }
  }

  function recordsSetDoc(doc) {
    // module state lives in LabBoards; poke it via a click-driven re-render
    LabBoards.setDoc(doc);
    renderStageInto(document.getElementById("stage-content"), LabStore.state.mode);
  }

  function onDocumentClick(e) {
    // match popups first (they may sit anywhere, incl. document.body)
    const option = e.target.closest(".match-option");
    if (option && currentOpen) {
      e.preventDefault();
      chooseOption(option);
      return;
    }
    const trigger = e.target.closest(".match-trigger");
    if (trigger) {
      const match = trigger.closest(".match");
      if (currentOpen && currentOpen.match === match) closeAllMatches();
      else if (match) openMatch(match);
      return;
    }
    if (currentOpen && !e.target.closest(".match-pop")) closeAllMatches();

    const actionEl = e.target.closest("[data-action]");
    if (actionEl) {
      if (actionEl.disabled) return;
      routeAction(actionEl);
      return;
    }

    // completion modal: click on the backdrop dismisses (Radix Dialog parity)
    const dlgModal = document.getElementById("dlg-modal");
    if (dlgModal && dlgModal.open && e.target === dlgModal) {
      finishOpen = false;
      dlgModal.close();
    }
    const dlgSheet = document.getElementById("dlg-sheet");
    if (dlgSheet && dlgSheet.open && e.target === dlgSheet) dlgSheet.close();
  }

  function onDocumentKeydown(e) {
    // match listbox keyboard support (APG select-only combobox)
    if (currentOpen) {
      const opts = Array.prototype.slice.call(currentOpen.pop.querySelectorAll(".match-option"));
      const activeIdx = opts.findIndex((o) => o.getAttribute("data-active") === "1");
      if (e.key === "Escape") {
        e.stopPropagation();
        const t = currentOpen.trigger;
        closeAllMatches();
        if (t) t.focus();
        return;
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        let next = e.key === "ArrowDown" ? activeIdx + 1 : activeIdx - 1;
        if (next < 0) next = opts.length - 1;
        if (next >= opts.length) next = 0;
        if (opts[next]) setActiveOption(opts[next]);
        return;
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (opts[activeIdx]) chooseOption(opts[activeIdx]);
        return;
      }
      if (e.key === "Tab") {
        closeAllMatches();
        return;
      }
    }
    const trigger = e.target.closest ? e.target.closest(".match-trigger") : null;
    if (trigger && (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      const match = trigger.closest(".match");
      if (currentOpen && currentOpen.match === match) closeAllMatches();
      else if (match) openMatch(match);
    }
  }

  function onAnswerInput(e) {
    const key = e.target.dataset ? e.target.dataset.answerKey : null;
    if (key) LabStore.setAnswer(key, e.target.value);
  }

  function onAnswerChange(e) {
    const key = e.target.dataset ? e.target.dataset.answerKey : null;
    if (key && e.target.type === "radio") LabStore.setAnswer(key, e.target.value);
  }

  /* ---------------- dialog close bookkeeping ---------------- */

  function wireDialogs() {
    const dlgModal = document.getElementById("dlg-modal");
    dlgModal.addEventListener("close", () => {
      finishOpen = false;
      if (modalAutoOpen()) LabStore.markCompletionSeen();
    });
    const dlgSheet = document.getElementById("dlg-sheet");
    // no extra bookkeeping — sheet content re-syncs via syncSheet()
    const dlgReset = document.getElementById("dlg-reset");
    // Radix AlertDialog parity: no click-outside dismissal (default dialog
    // behavior here is backdrop click does nothing since we only dismiss the
    // modal/sheet explicitly).
  }

  /* ---------------- boot ---------------- */

  function init() {
    LabStore.persistLoad(); // resume exactly (zustand-persist parity)
    renderRoot();
    LabStore.subscribe(onState);
    document.addEventListener("click", onDocumentClick);
    document.addEventListener("keydown", onDocumentKeydown, true);
    document.addEventListener("input", onAnswerInput);
    document.addEventListener("change", onAnswerChange);
    // glossary accordion: Radix type="single" collapsible parity — opening one
    // item closes its siblings (capture: toggle fires before others run)
    document.addEventListener(
      "toggle",
      function (e) {
        const item = e.target;
        if (!(item instanceof HTMLDetailsElement) || !item.classList.contains("gloss-item") || !item.open) return;
        const siblings = item.parentNode.querySelectorAll("details.gloss-item[open]");
        siblings.forEach(function (d) {
          if (d !== item) d.open = false;
        });
      },
      true
    );
    document.addEventListener("scroll", function () { closeAllMatches(); }, { capture: true, passive: true });
    window.addEventListener("resize", function () { closeAllMatches(); });
    wireDialogs();
  }

  return {
    init: init,
    renderStageInto: renderStageInto,
    closeAllMatches: closeAllMatches,
  };
})();

LabApp.init();
