// HARBOR-7 — bootstrap, action wiring, overlays and focus management.
// Static port note: replaces React's event system with a single delegated click
// handler; all actions mirror the original reducer semantics (see state.js).
// React component state → ui.* (ui.js); provider runtime state → App.lastCheck.

const App = {
  lastCheck: null, // { result, objectiveId } — runtime-only, like the original provider state
  screenKey: null,
  scrollTarget: null, // quiz "next question" scroll+focus, applied after paint
  focusTarget: null,
  scrollReset: false, // scroll to top after retake/reset
  focusFid: null, // explicit focus target for the next paint (e.g. overlay trigger)
  overlayReturnFid: null, // where focus returns after an overlay closes
};

const OVERLAY_OPENERS = new Set(["completion-open", "manifest-open", "reset-open"]);

/* ------------------------------ actions ------------------------------ */

const ACTIONS = {
  stage(d) {
    Lab.dispatch({ type: "STAGE", stage: d.stage });
  },
  zone(d) {
    Lab.dispatch({ type: "ZONE", zone: d.zone || null, tab: d.tab });
  },
  mode(d) {
    Lab.dispatch({ type: "MODE", mode: d.mode });
  },
  "brief-ack"() {
    Lab.dispatch({ type: "BRIEF_SEEN" });
    Lab.dispatch({ type: "STAGE", stage: "mode" });
  },

  /* --- environment widgets --- */
  "seq-add"(d) {
    Lab.dispatch({
      type: "ENV_UPD",
      fn: (env) => ({ [d.path]: [...env[d.path], d.id] }),
    });
  },
  "seq-remove"(d) {
    Lab.dispatch({
      type: "ENV_UPD",
      fn: (env) => ({ [d.path]: env[d.path].filter((_, idx) => idx !== Number(d.pos)) }),
    });
  },
  "seq-clear"(d) {
    Lab.dispatch({ type: "ENV_UPD", fn: () => ({ [d.path]: [] }) });
  },
  iso(d) {
    Lab.dispatch({ type: "ENV_UPD", fn: (env) => ({ isolation: { ...env.isolation, [d.sid]: d.val === "true" } }) });
  },
  "kernel-why"(d) {
    Lab.dispatch({ type: "ENV_UPD", fn: () => ({ kernelWhy: d.val }) });
  },
  glossary(d) {
    ui.glossaryOpen = ui.glossaryOpen === d.term ? null : d.term;
  },
  "docker-select"(d) {
    ui.dockerSelected = ui.dockerSelected === d.id ? null : d.id;
  },
  "docker-flag"(d) {
    Lab.dispatch({
      type: "ENV_UPD",
      fn: (env) => {
        const next = { ...env.dockerFlags };
        if (next[d.line] === d.cat) delete next[d.line];
        else next[d.line] = d.cat;
        return { dockerFlags: next };
      },
    });
  },
  "docker-nofinding"(d) {
    const next = { ...Lab.state.env.dockerFlags };
    delete next[d.line];
    Lab.dispatch({ type: "ENV", patch: { dockerFlags: next } });
    ui.dockerSelected = null;
  },
  "docker-clear-all"() {
    Lab.dispatch({ type: "ENV", patch: { dockerFlags: {} } });
  },
  "xray-inspect"(d) {
    ui.xrayInspect = ui.xrayInspect === Number(d.idx) ? null : Number(d.idx);
  },
  "xray-set"(d) {
    Lab.dispatch({
      type: "ENV_UPD",
      fn: () => ({ [d.field]: d.field === "xrayLayer" ? Number(d.val) : d.val }),
    });
  },
  "token-toggle"(d) {
    Lab.dispatch({
      type: "ENV_UPD",
      fn: (env) => ({
        tokenRemediation: env.tokenRemediation.includes(d.id) ? env.tokenRemediation.filter((x) => x !== d.id) : [...env.tokenRemediation, d.id],
      }),
    });
  },
  "registry-stamp"(d) {
    Lab.dispatch({ type: "ENV_UPD", fn: (env) => ({ registryVerdicts: { ...env.registryVerdicts, [d.id]: d.verdict } }) });
  },
  "registry-tag"(d) {
    Lab.dispatch({
      type: "ENV_UPD",
      fn: (env) => ({
        registryTags: env.registryTags.includes(d.id) ? env.registryTags.filter((x) => x !== d.id) : [...env.registryTags, d.id],
      }),
    });
  },
  "reject-reason"(d) {
    Lab.dispatch({ type: "ENV_UPD", fn: () => ({ registryRejectReason: d.val }) });
  },
  "berth-open"(d) {
    ui.berthOpenId = ui.berthOpenId === d.id ? null : d.id;
  },
  "berth-class"(d) {
    Lab.dispatch({ type: "ENV_UPD", fn: (env) => ({ berthStatus: { ...env.berthStatus, [d.id]: d.status } }) });
  },
  "berth-tag"(d) {
    Lab.dispatch({
      type: "ENV_UPD",
      fn: (env) => ({ berthTags: env.berthTags.includes(d.id) ? env.berthTags.filter((x) => x !== d.id) : [...env.berthTags, d.id] }),
    });
  },
  "event-stamp"(d) {
    Lab.dispatch({ type: "ENV_UPD", fn: (env) => ({ eventVerdicts: { ...env.eventVerdicts, [d.id]: d.verdict } }) });
  },
  alibi(d) {
    Lab.dispatch({ type: "ENV_UPD", fn: (env) => ({ benignReasons: { ...env.benignReasons, [d.eid]: d.val } }) });
  },
  "mitre-map"(d) {
    Lab.dispatch({ type: "ENV_UPD", fn: (env) => ({ mitreMap: { ...env.mitreMap, [d.sid]: d.tid } }) });
  },
  "ds-match"(d) {
    Lab.dispatch({ type: "ENV_UPD", fn: (env) => ({ datasourceMatch: { ...env.datasourceMatch, [d.rid]: d.val } }) });
  },
  "pod-flag"(d) {
    Lab.dispatch({
      type: "ENV_UPD",
      fn: (env) => ({ podFlags: env.podFlags.includes(d.id) ? env.podFlags.filter((f) => f !== d.id) : [...env.podFlags, d.id] }),
    });
  },
  "pod-patch"(d) {
    Lab.dispatch({ type: "ENV_UPD", fn: (env) => ({ podPatch: { ...env.podPatch, [d.field]: d.val } }) });
  },
  "board-toggle"(d) {
    Lab.dispatch({ type: "ENV_UPD", fn: (env) => ({ boardState: { ...env.boardState, [d.id]: !env.boardState[d.id] } }) });
  },
  "board-off"() {
    Lab.dispatch({
      type: "ENV",
      patch: { boardState: Object.fromEntries(BOARD_CONTROLS.map((c) => [c.id, false])), boardMapping: {} },
    });
  },
  "risk-map"(d) {
    Lab.dispatch({ type: "ENV_UPD", fn: (env) => ({ boardMapping: { ...env.boardMapping, [d.rid]: d.cid } }) });
  },
  "berth-tab"(d) {
    Lab.dispatch({ type: "ZONE", zone: "berths", tab: d.tab });
  },

  /* --- objective engine --- */
  check(d) {
    const o = Lab.objectives().find((x) => x.id === d.oid);
    if (!o) return;
    const result = Lab.checkObjective(o); // 400 ms cooldown lives here (QA-17)
    App.lastCheck = { result, objectiveId: o.id };
  },
  hint(d) {
    Lab.dispatch({ type: "HINT", objectiveId: d.oid });
  },
  "fb-toggle"(d) {
    ui.fbOpen[d.oid] = ui.fbOpen[d.oid] === false ? true : false;
  },

  /* --- quiz --- */
  "quiz-answer"(d) {
    Lab.dispatch({ type: "QUIZ_ANSWER", qid: d.qid, idx: Number(d.idx) });
  },
  "quiz-check"(d) {
    Lab.dispatch({ type: "QUIZ_CHECK", qid: d.qid });
  },
  "quiz-next"(d) {
    const questions = quizFor(Lab.mode());
    const qi = Number(d.qi);
    App.scrollTarget = qi < questions.length ? `q-${questions[qi].id}` : "quiz-result";
    App.focusTarget = qi < questions.length; // focus the first control of the next question
  },
  "quiz-retake"() {
    Lab.dispatch({ type: "RETAKE_QUIZ" });
    App.scrollReset = true;
  },

  /* --- overlays --- */
  "completion-open"() {
    ui.completionOpen = true;
  },
  "completion-close"() {
    ui.completionOpen = false;
    App.focusFid = App.overlayReturnFid;
    App.overlayReturnFid = null;
    if (!Lab.state.completedShown[Lab.mode()]) Lab.dispatch({ type: "COMPLETION_SHOWN" });
  },
  "completion-close-overlay"(el, e) {
    if (e.target !== el) return; // only a true backdrop click
    ACTIONS["completion-close"]();
  },
  "completion-reset"() {
    ui.completionOpen = false;
    App.focusFid = null;
    App.overlayReturnFid = null;
    if (!Lab.state.completedShown[Lab.mode()]) Lab.dispatch({ type: "COMPLETION_SHOWN" });
    Lab.dispatch({ type: "RESET" });
    App.scrollReset = true;
  },
  "manifest-open"() {
    ui.manifestOpen = true;
  },
  "manifest-close"() {
    ui.manifestOpen = false;
    App.focusFid = App.overlayReturnFid;
    App.overlayReturnFid = null;
  },
  "manifest-close-overlay"(el, e) {
    if (e.target !== el) return;
    ACTIONS["manifest-close"]();
  },
  "reset-open"() {
    ui.resetOpen = true;
  },
  "reset-cancel"() {
    ui.resetOpen = false;
    App.focusFid = App.overlayReturnFid;
    App.overlayReturnFid = null;
  },
  "reset-confirm"() {
    ui.resetOpen = false;
    App.focusFid = null;
    App.overlayReturnFid = null;
    Lab.dispatch({ type: "RESET" });
    App.scrollReset = true;
  },
};

/* ------------------------------ focus ids ------------------------------ */

/** Stable per-logical-control id derived from action + params (for focus restore). */
function fidFor(el) {
  const parts = [];
  for (const [k, v] of Object.entries(el.dataset)) {
    if (k === "act" || k === "fid") continue;
    parts.push(`${k}=${v}`);
  }
  return parts.length ? `${el.dataset.act}·${parts.sort().join("&")}` : el.dataset.act || null;
}

/** Stamp every interactive element with its focus id (after each render). */
function hydrateFids(root) {
  root.querySelectorAll("[data-act]").forEach((el) => {
    if (!el.getAttribute("data-fid")) el.setAttribute("data-fid", fidFor(el));
  });
}

/* ------------------------------ paint ------------------------------ */

function paint() {
  const root = document.getElementById("lab-root");

  // Completion modal auto-open (root.tsx useEffect): fires whenever the lab is
  // completion-ready and this mode's clearance has not been shown yet.
  if (Lab.hydrated && Lab.completionReady() && !Lab.state.completedShown[Lab.mode()]) {
    ui.completionOpen = true;
  }

  const active = document.activeElement;
  const capturedFid = active && active.getAttribute ? active.getAttribute("data-fid") : null;
  const scrollY = window.scrollY;

  root.innerHTML = renderApp();
  hydrateFids(root);

  if (App.scrollReset) {
    window.scrollTo({ top: 0 });
    App.scrollReset = false;
  } else {
    window.scrollTo({ top: scrollY });
  }

  if (App.scrollTarget) {
    const el = document.getElementById(App.scrollTarget);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      if (App.focusTarget) {
        const focusable = el.querySelector("[role=radio]:not([disabled]), button:not([disabled])");
        if (focusable) focusable.focus({ preventScroll: true });
      }
    }
    App.scrollTarget = null;
    App.focusTarget = null;
  } else if (App.focusFid) {
    const next = root.querySelector(`[data-fid="${App.focusFid}"]`);
    if (next) next.focus({ preventScroll: true });
    App.focusFid = null;
  } else if (capturedFid) {
    const next = root.querySelector(`[data-fid="${capturedFid}"]`);
    if (next && !next.disabled) next.focus({ preventScroll: true });
  }

  focusDialog();
}

/** Move focus into a freshly opened dialog / sheet (Radix-like focus management). */
function focusDialog() {
  const dlg = document.querySelector(".dialog, .sheet");
  if (dlg && !dlg.contains(document.activeElement)) {
    const target = dlg.querySelector("button:not([disabled])");
    if (target) target.focus({ preventScroll: true });
  }
}

/** Screen key — when it changes, ephemeral component state resets (React unmount semantics). */
function screenKeyOf(state) {
  return `${state.stage}|${state.zone ?? ""}|${state.mode ?? ""}`;
}

/* ------------------------------ event wiring ------------------------------ */

function onClick(e) {
  const el = e.target.closest("[data-act]");
  if (!el) return;
  const act = el.getAttribute("data-act");
  const handler = ACTIONS[act];
  if (!handler || el.disabled) return;

  const fid = el.getAttribute("data-fid") || fidFor(el);
  if (OVERLAY_OPENERS.has(act)) App.overlayReturnFid = fid;

  handler(el.dataset, e, el);
  paint();
}

function onKeyDown(e) {
  // Escape closes the topmost overlay (Radix behavior); accordion too.
  if (e.key === "Escape") {
    if (ui.completionOpen) {
      ACTIONS["completion-close"]();
      paint();
      return;
    }
    if (ui.manifestOpen) {
      ACTIONS["manifest-close"]();
      paint();
      return;
    }
    if (ui.resetOpen) {
      ACTIONS["reset-cancel"]();
      paint();
      return;
    }
    if (ui.glossaryOpen) {
      ui.glossaryOpen = null;
      paint();
      return;
    }
  }

  // Tab cycling inside dialogs / sheet (light focus trap)
  if (e.key === "Tab") {
    const dlg = document.querySelector(".dialog, .sheet");
    if (dlg) {
      const focusables = [...dlg.querySelectorAll("button:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])")].filter(
        (el) => el.offsetParent !== null,
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!dlg.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
      return;
    }
  }

  // Berths tabs: arrow-key navigation (Radix Tabs behavior)
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    const tab = e.target.closest("[role=tab]");
    if (tab) {
      const tabs = [...tab.parentElement.querySelectorAll("[role=tab]")];
      const i = tabs.indexOf(tab);
      const dir = e.key === "ArrowRight" ? 1 : -1;
      const next = tabs[(i + dir + tabs.length) % tabs.length];
      next.focus();
      next.click();
    }
  }
}

/* ------------------------------ bootstrap ------------------------------ */

function boot() {
  Lab.init(); // loads localStorage + hydrates (synchronous — no network, no SSR)

  App.screenKey = screenKeyOf(Lab.state);
  paint();

  document.addEventListener("click", onClick);
  document.addEventListener("keydown", onKeyDown);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
