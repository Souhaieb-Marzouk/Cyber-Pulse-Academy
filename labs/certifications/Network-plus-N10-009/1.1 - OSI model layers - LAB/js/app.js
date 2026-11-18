// ─── Bootstrap + event wiring (delegated handlers for every control) ────────
(function () {
  "use strict";

  const Store = window.LabStore;
  const UI = window.LabUI;
  const Engine = window.LabEngine;

  // ── state events → granular re-renders ───────────────────────────────────
  Store.subscribe((evt) => {
    switch (evt.type) {
      case "mode":
      case "reset":
        UI.renderApp();
        break;
      case "answer":
        UI.updateWidget(evt.detail);
        break;
      case "check":
        UI.updateStationAfterCheck(evt.detail);
        UI.updateZoneHeading();
        UI.maybeAutoBell();
        break;
      case "hint":
        UI.updateHints(evt.detail);
        break;
      case "quiz":
        window.LabQuiz.patchQuizQuestion(evt.detail);
        UI.updateCounters();
        UI.updateZoneHeading();
        UI.maybeAutoBell();
        break;
      case "completed":
        // bell already opened by maybeAutoBell; nothing further
        break;
      default:
        break;
    }
  });

  // ── actions ──────────────────────────────────────────────────────────────
  const actions = {
    "pick-mode": (t) => Store.setMode(t.dataset.mode),
    "scroll-to": (t) => UI.scrollToId(t.dataset.target),
    "accordion": (t) => {
      const floor = Number(t.dataset.floor);
      toggleAccordion(floor);
    },
    "term": (t) => UI.openGlossary(t.dataset.term),
    "open-glossary": () => UI.openGlossary(null),
    "overlay-close": () => UI.Overlay.close(),
    "reset-open": () => UI.openResetDialog(),
    "reset-cancel": () => UI.Overlay.close(),
    "reset-confirm": () => {
      UI.Overlay.close(true);
      Store.resetAll();
    },
    "open-orders": () => UI.openOrdersSheet(),
    "locate-order": (t) => {
      if (t.dataset.locate) UI.Overlay.close(true);
      UI.scrollToId(t.dataset.target);
    },
    "place-card": (t) => {
      const id = t.dataset.obj;
      const card = t.dataset.card;
      Store.setAnswer(id, (prev) => {
        const cur = Array.isArray(prev) ? prev.slice() : [];
        return cur.includes(card) ? cur : [...cur, card];
      });
    },
    "remove-card": (t) => {
      const id = t.dataset.obj;
      const card = t.dataset.card;
      Store.setAnswer(id, (prev) => (Array.isArray(prev) ? prev.filter((x) => x !== card) : []));
    },
    "move-card": (t) => {
      const id = t.dataset.obj;
      const idx = Number(t.dataset.idx);
      const dir = Number(t.dataset.dir);
      Store.setAnswer(id, (prev) => {
        const next = Array.isArray(prev) ? prev.slice() : [];
        const j = idx + dir;
        if (j < 0 || j >= next.length) return next;
        [next[idx], next[j]] = [next[j], next[idx]];
        return next;
      });
    },
    "clear-timeline": (t) => Store.setAnswer(t.dataset.obj, []),
    "check": (t) => {
      const obj = Engine.objectivesFor(Store.state.mode).find((o) => o.id === t.dataset.obj);
      if (obj) Store.runCheck(obj);
    },
    "hint": (t) => Store.useHint(t.dataset.obj),
    "select-option": (t) => {
      const sel = t.closest("[data-select]");
      if (sel) UI.selectOption(sel, t.dataset.optId);
    },
    "pick-chip": (t) => {
      const id = t.dataset.obj;
      const row = t.dataset.row;
      const chip = t.dataset.chip;
      Store.setAnswer(id, (prev) => ({ ...Engine.asRec(prev), [row]: chip }));
    },
    "pick-single": (t) => Store.setAnswer(t.dataset.obj, t.dataset.value),
    "quiz-answer": (t) => {
      const qid = t.dataset.qid;
      if (Store.state.quizLocked[qid]) return;
      Store.answerQuiz(qid, t.dataset.oid);
    },
    "open-completion": () => {
      const mode = Store.state.mode;
      if (Store.isComplete(mode)) {
        Store.state.completedShown = true;
        Store.persist();
        UI.openCompletionBell();
      }
    },
    "back-to-orders": () => UI.scrollToId("orders"),
    "close-completion": () => UI.Overlay.close(),
    "switch-shift": () => {
      UI.Overlay.close(true);
      Store.resetAll();
    },
  };

  function toggleAccordion(floor) {
    // single-open collapsible (Radix Accordion type="single" semantics)
    const container = document.querySelector(".manual-floors");
    if (!container) return;
    const current = container.querySelector(".floor-acc-content.open");
    const currentFloor = current ? Number(current.closest(".floor-acc").querySelector(".floor-acc-trigger").dataset.floor) : null;
    if (currentFloor === floor) {
      setAccordion(current.closest(".floor-acc"), false);
      return;
    }
    if (current) setAccordion(current.closest(".floor-acc"), false);
    const next = container.querySelector(`.floor-acc-trigger[data-floor="${floor}"]`);
    if (next) setAccordion(next.closest(".floor-acc"), true);
  }

  function setAccordion(accEl, open) {
    const trigger = accEl.querySelector(".floor-acc-trigger");
    const content = accEl.querySelector(".floor-acc-content");
    trigger.setAttribute("aria-expanded", String(open));
    if (open) {
      content.hidden = false;
      requestAnimationFrame(() => content.classList.add("open"));
    } else {
      content.classList.remove("open");
      // let the collapse transition play before hiding (matches original ~200ms)
      setTimeout(() => {
        if (!content.classList.contains("open")) content.hidden = true;
      }, 220);
    }
  }

  // ── delegated listeners ──────────────────────────────────────────────────
  document.addEventListener("click", (e) => {
    // select interactions first (options, triggers, outside-click close)
    const option = e.target.closest(".select-option");
    if (option) {
      const sel = option.closest("[data-select]");
      UI.selectOption(sel, option.dataset.optId);
      return;
    }
    const trigger = e.target.closest(".select-trigger");
    if (trigger) {
      UI.toggleSelect(trigger.closest("[data-select]"));
      return;
    }
    if (UI.closeOpenSelect && document.querySelector(".select-open") && !e.target.closest("[data-select]")) {
      UI.closeOpenSelect();
    }
    if (UI.Overlay.onBackdropTarget && UI.Overlay.activeRoot && !UI.Overlay.activeRoot.contains(e.target)) {
      // handled by backdrop listener; nothing here
    }

    const t = e.target.closest("[data-action]");
    if (!t) return;
    const fn = actions[t.dataset.action];
    if (fn) fn(t);
  });

  document.addEventListener("keydown", (e) => {
    if (UI.Overlay.onKeydown(e)) return;
    const trigger = e.target.closest && e.target.closest(".select-trigger");
    if (trigger) {
      UI.selectKeydown(e, trigger.closest("[data-select]"));
      return;
    }
    // accordion arrow navigation (Radix-like)
    const accTrigger = e.target.closest && e.target.closest(".floor-acc-trigger");
    if (accTrigger && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      const triggers = Array.from(document.querySelectorAll(".floor-acc-trigger"));
      const i = triggers.indexOf(accTrigger);
      const next = triggers[(i + (e.key === "ArrowDown" ? 1 : triggers.length - 1)) % triggers.length];
      next.focus();
    }
  });

  // evidence text inputs: update state silently (no re-render → focus stays)
  document.addEventListener("input", (e) => {
    const input = e.target.closest && e.target.closest("input.evidence-input");
    if (!input) return;
    const id = input.dataset.obj;
    const field = input.dataset.field;
    Store.state.answers = { ...Store.state.answers, [id]: { ...Engine.asRec(Store.state.answers[id]), [field]: input.value } };
    Store.persist();
  });

  // ── boot ─────────────────────────────────────────────────────────────────
  function boot() {
    Store.hydrate();
    UI.renderApp();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
