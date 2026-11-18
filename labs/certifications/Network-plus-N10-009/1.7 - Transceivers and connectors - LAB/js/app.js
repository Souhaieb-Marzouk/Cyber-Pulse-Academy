// ─────────────────────────────────────────────────────────────────────────────
// THE PATCH BENCH — js/app.js
// Bootstrap and event wiring: store dispatch → full region re-render, focus +
// scroll preservation, toast timer, dialogs (ESC / overlay / Tab loop),
// clipboard tablist arrows, persistence hooks.
// ─────────────────────────────────────────────────────────────────────────────

(function () {
  "use strict";

  const U = window.LAB_UI;
  const { initialState, reducer, saveState } = window.LAB_STORE;

  // ── UI-only state (mirrors the original's local component state) ───────────
  // stack/expanded: Clipboard useState; sortPicked: SortWidget useState;
  // resetOpen: uncontrolled AlertDialog open state. None are persisted.
  const ui = { stack: "orders", expanded: null, sortPicked: null, resetOpen: false };

  let state = initialState; // phase "boot" until boot() runs

  // ── Render ─────────────────────────────────────────────────────────────────

  function floorHtml() {
    return `
    <a href="#bench" class="skip-link">Skip to the bench</a>
    ${U.viewJobBoard(state)}
    <main class="floor-grid" id="main">
      <div class="clipboard-col" data-ps="clip">${U.viewClipboard(state, ui)}</div>
      <div id="bench" class="bench-col">${U.viewBench(state)}</div>
    </main>
    ${U.viewInspector(state)}
    ${U.viewSignOff(state)}
    ${ui.resetOpen ? U.viewResetDialog() : ""}
    ${U.viewToasts(state)}
    ${U.viewAnnouncer(state)}`;
  }

  function appHtml() {
    if (state.phase === "boot") {
      return `<main class="boot-screen" aria-label="Loading the bench"><p class="boot-note">Unlocking the shop…</p></main>`;
    }
    if (state.phase === "clockin") {
      return `${U.viewClockIn()}${U.viewToasts(state)}${U.viewAnnouncer(state)}`;
    }
    return floorHtml();
  }

  function focusKeyOf(el) {
    let node = el;
    while (node && node !== document.body) {
      if (node.getAttribute && node.getAttribute("data-fk")) return node.getAttribute("data-fk");
      node = node.parentNode;
    }
    return null;
  }

  function render() {
    const root = document.getElementById("app");

    // Preserve focus (via data-fk), window scroll and named scroll containers.
    const fk = document.activeElement ? focusKeyOf(document.activeElement) : null;
    const winY = window.scrollY;
    const scrolls = [];
    document.querySelectorAll("[data-ps]").forEach((el) => {
      scrolls.push([el.getAttribute("data-ps"), el.scrollTop, el.scrollLeft]);
    });

    root.innerHTML = appHtml();

    // Restore scroll containers.
    scrolls.forEach(([ps, top, left]) => {
      const el = document.querySelector(`[data-ps="${cssEscape(ps)}"]`);
      if (el) {
        el.scrollTop = top;
        el.scrollLeft = left;
      }
    });
    window.scrollTo(0, winY);

    // Restore focus.
    if (fk) {
      const target = document.querySelector(`[data-fk="${cssEscape(fk)}"]`);
      if (target && !target.disabled) {
        try {
          target.focus({ preventScroll: true });
        } catch {
          /* non-focusable after state change (e.g. now disabled) — fine */
        }
      }
    }

    // Autofocus into freshly opened dialogs/sheets (matches Radix + original).
    if (state.signOffOpen || ui.resetOpen || state.inspector) {
      const af = root.querySelector("[data-autofocus]");
      if (af) af.focus({ preventScroll: true });
    }
  }

  function cssEscape(v) {
    return (window.CSS && CSS.escape) ? CSS.escape(v) : v.replace(/["\\]/g, "\\$&");
  }

  // ── Toast auto-dismiss (6.5 s, keyed per toast like the original) ──────────

  let toastTimer = null;
  let lastToastId = null;

  function armToastTimer(prevId) {
    const id = state.toast ? state.toast.id : null;
    if (id === prevId) return;
    lastToastId = id;
    if (toastTimer) clearTimeout(toastTimer);
    if (id !== null) {
      toastTimer = setTimeout(() => {
        if (state.toast && state.toast.id === id) dispatch({ type: "DISMISS_TOAST" });
      }, 6500);
    }
  }

  // ── Dispatch pipeline ──────────────────────────────────────────────────────

  function dispatch(action) {
    const prevToastId = state.toast ? state.toast.id : null;
    state = reducer(state, action);
    render();
    saveState(state); // same persistence semantics: skipped during boot
    armToastTimer(prevToastId);
  }

  // ── Action routing (event delegation) ──────────────────────────────────────

  function actFrom(el) {
    while (el && el !== document.body) {
      if (el.getAttribute && el.getAttribute("data-act")) return el;
      el = el.parentNode;
    }
    return null;
  }

  function handleAction(el) {
    const act = el.getAttribute("data-act");
    switch (act) {
      case "clockin":
        ui.sortPicked = null;
        ui.expanded = null;
        dispatch({ type: "CLOCKIN", mode: el.getAttribute("data-mode") });
        break;
      case "tray":
        // Selecting a part both selects it and opens the inspector (original TrayCard).
        if (state.selected === el.getAttribute("data-part")) {
          dispatch({ type: "SELECT", part: null });
          dispatch({ type: "INSPECT", part: el.getAttribute("data-part") });
        } else {
          dispatch({ type: "SELECT", part: el.getAttribute("data-part") });
          dispatch({ type: "INSPECT", part: el.getAttribute("data-part") });
        }
        break;
      case "putback":
        dispatch({ type: "SELECT", part: null });
        break;
      case "port":
        if (state.selected) {
          dispatch({ type: "SEAT", port: el.getAttribute("data-port") });
        } else if (state.seated[el.getAttribute("data-port")]) {
          dispatch({ type: "INSPECT", part: state.seated[el.getAttribute("data-port")] });
        } else {
          dispatch({ type: "SEAT", port: el.getAttribute("data-port") }); // coaching toast
        }
        break;
      case "eject":
        dispatch({ type: "EJECT", port: el.getAttribute("data-port") });
        break;
      case "face":
        if (state.selected === "LC_CORD" || state.selected === "LC_CORD_SM") {
          dispatch({ type: "CORD_END", target: el.getAttribute("data-cage") });
        } else {
          dispatch({ type: "INSPECT", part: state.seated[el.getAttribute("data-cage")] });
        }
        break;
      case "faceq":
        if (state.selected === "MPO_CORD") {
          dispatch({ type: "TRUNK" });
        } else {
          dispatch({ type: "INSPECT", part: state.seated["CAGEQ"] });
        }
        break;
      case "verify":
        dispatch({ type: "VERIFY" });
        break;
      case "sort-pick":
        ui.sortPicked =
          ui.sortPicked &&
          ui.sortPicked.objId === el.getAttribute("data-obj") &&
          ui.sortPicked.itemId === el.getAttribute("data-item")
            ? null
            : { objId: el.getAttribute("data-obj"), itemId: el.getAttribute("data-item") };
        render();
        break;
      case "sort-bin": {
        const objId = ui.sortPicked ? ui.sortPicked.objId : null;
        const itemId = ui.sortPicked ? ui.sortPicked.itemId : null;
        ui.sortPicked = null;
        if (objId && itemId) {
          dispatch({ type: "ANSWER", key: `${objId}:bin:${itemId}`, value: el.getAttribute("data-bin") });
        }
        break;
      }
      case "matrix": {
        const key = `${el.getAttribute("data-obj")}:${el.getAttribute("data-r")}:${el.getAttribute("data-c")}`;
        const cur = state.answers[key];
        const next = cur === "works" ? "fails" : cur === "fails" ? "" : "works";
        dispatch({ type: "ANSWER", key, value: next });
        break;
      }
      case "order": {
        const objId = el.getAttribute("data-obj") || orderObjId();
        const obj = objectivesFor(state.mode).find((o) => o.id === objId);
        const key = `${objId}:order`;
        const saved = state.answers[key];
        const steps = obj.widget.steps;
        const current =
          Array.isArray(saved) && saved.length === steps.length
            ? [...saved]
            : H6_PRESENTATION.filter((id) => steps.some((st) => st.id === id));
        const idx = Number(el.getAttribute("data-idx"));
        const j = idx + Number(el.getAttribute("data-dir"));
        if (j < 0 || j >= current.length) return;
        [current[idx], current[j]] = [current[j], current[idx]];
        dispatch({ type: "ANSWER", key, value: current });
        break;
      }

      case "answer-check": {
        // native checkbox change → already reflected in the DOM input
        const value = el.checked ? "1" : "";
        dispatch({ type: "ANSWER", key: el.getAttribute("data-key"), value });
        break;
      }
      case "toggle":
        ui.expanded = ui.expanded === el.getAttribute("data-obj") ? null : el.getAttribute("data-obj");
        if (ui.sortPicked && ui.sortPicked.objId !== ui.expanded) ui.sortPicked = null;
        render();
        break;
      case "toast-locked":
        dispatch({
          type: "TOAST",
          kind: "info",
          text: `Finish the earlier work orders first — ${objectivesFor(state.mode).find((o) => o.id === el.getAttribute("data-obj")).wo} unlocks when the one before it is signed off.`,
        });
        break;
      case "hint":
        dispatch({ type: "HINT", objId: el.getAttribute("data-obj") });
        break;
      case "check":
        dispatch({ type: "CHECK", objId: el.getAttribute("data-obj") });
        break;
      case "stack":
        ui.stack = el.getAttribute("data-stack");
        render();
        break;
      case "quiz-pick":
        dispatch({ type: "QUIZ_PICK", qid: el.getAttribute("data-q"), optionId: el.getAttribute("data-o") });
        break;
      case "quiz-submit":
        dispatch({ type: "QUIZ_SUBMIT" });
        break;
      case "reset-open":
        ui.resetOpen = true;
        render();
        break;
      case "reset-close":
      case "reset-overlay":
        ui.resetOpen = false;
        render();
        break;
      case "reset-confirm":
        window.LAB_STORE.clearState();
        ui.resetOpen = false;
        ui.sortPicked = null;
        ui.expanded = null;
        ui.stack = "orders";
        dispatch({ type: "RESET" });
        break;
      case "signoff-open":
        dispatch({ type: "OPEN_SIGNOFF" });
        break;
      case "signoff-close":
      case "signoff-overlay":
        dispatch({ type: "CLOSE_SIGNOFF" });
        break;
      case "signoff-reset":
        window.LAB_STORE.clearState();
        ui.sortPicked = null;
        ui.expanded = null;
        ui.stack = "orders";
        dispatch({ type: "RESET" });
        break;
      case "inspect-close":
        dispatch({ type: "INSPECT", part: null });
        break;
      case "toast-dismiss":
        dispatch({ type: "DISMISS_TOAST" });
        break;
      default:
        break;
    }
  }

  // The order widget has one objective per mode (OBJ-H6); find it from state.
  function orderObjId() {
    const obj = objectivesFor(state.mode).find((o) => o.widget.type === "order");
    return obj ? obj.id : "";
  }

  // ── Global listeners (delegated events) ────────────────────────────────────

  // Clicks: route elements carrying data-act (native checkboxes excluded —
  // their 'change' event is the single source of truth).
  document.addEventListener("click", (e) => {
    const el = actFrom(e.target);
    if (!el) return;
    if (el.disabled || el.getAttribute("aria-disabled") === "true") return;
    if (el.getAttribute("data-act") === "answer-check") return;
    handleAction(el);
  });

  // Native select + checkbox changes → ANSWER.
  document.addEventListener("change", (e) => {
    const el = actFrom(e.target);
    if (!el) return;
    const act = el.getAttribute("data-act");
    if (act === "answer") {
      dispatch({ type: "ANSWER", key: el.getAttribute("data-key"), value: e.target.value });
    } else if (act === "answer-check") {
      dispatch({ type: "ANSWER", key: el.getAttribute("data-key"), value: e.target.checked ? "1" : "" });
    }
  });

  // ── Keyboard: tablist arrows, dialog ESC + focus trap ──────────────────────

  document.addEventListener("keydown", (e) => {
    // Roving-tabindex tablist (clipboard stacks)
    const tab = e.target && e.target.closest && e.target.closest('[role="tablist"]');
    if (tab && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
      e.preventDefault();
      const ids = ["orders", "manual", "debrief", "exam"];
      const idx = ids.indexOf(ui.stack);
      ui.stack = ids[e.key === "ArrowRight" ? (idx + 1) % ids.length : (idx + ids.length - 1) % ids.length];
      render();
      const active = document.querySelector(`[role="tab"][aria-selected="true"]`);
      if (active) active.focus();
      return;
    }

    // ESC closes sheets/dialogs (inspector already listens globally below).
    if (e.key === "Escape") {
      if (ui.resetOpen) {
        ui.resetOpen = false;
        render();
      } else if (state.signOffOpen) {
        dispatch({ type: "CLOSE_SIGNOFF" });
      } else if (state.inspector) {
        dispatch({ type: "INSPECT", part: null });
      }
      return;
    }

    // Focus trap while a modal is open.
    if (e.key === "Tab") {
      let modal = null;
      if (ui.resetOpen) modal = document.querySelector('[data-testid="reset-dialog"]');
      else if (state.signOffOpen) modal = document.querySelector('[data-testid="signoff-modal"]');
      if (modal) {
        const focusables = modal.querySelectorAll("button, a[href], select, input, [tabindex]:not([tabindex='-1'])");
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (!modal.contains(document.activeElement)) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  });

  // ── Boot ───────────────────────────────────────────────────────────────────

  render(); // paint the boot screen synchronously (parity with phase machine)
  dispatch({ type: "BOOT", saved: window.LAB_STORE.loadState() });
})();
