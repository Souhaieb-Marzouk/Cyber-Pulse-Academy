/* ═══════════════════════════════════════════════════════════════════════════
   app.js — bootstrap, render loop and event wiring.
   Stands in for LabRoot.tsx + Workbench.tsx: stage routing (mode → briefing →
   workbench), the workbench's stage tabs + mobile regions, the selection state
   for the detail sheet, dialog focus handling, and ONE delegated event system
   (click / change / keydown via data-action / data-field attributes).
   Focus and scroll position are restored after every re-render.
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";

const store = createLabStore();

// local (non-persisted) UI state — mirrors the React useState values in
// Workbench/Schematic/QuizBoard/EvidenceBinder, which reset on unmount
const app = {
  local: {
    sel: null, // { kind, id } | null — schematic selection
    tab: "design", // design | exam | debrief
    region: "drawing", // drawing | binder | tracker (mobile only)
    certManual: false,
    binderTab: "manual",
    resetOpen: false,
    prevDetailKey: null, // for detail-sheet enter animation
    prevTab: null, // for tab content enter animation
    stampAnim: {}, // objId -> true when a fresh stamp should animate
    _lastRendered: "", // cheap render signature for local-only rerenders
  },

  resetLocal() {
    const l = this.local;
    l.sel = null;
    l.tab = "design";
    l.region = "drawing";
    l.certManual = false;
    l.binderTab = "manual";
    l.resetOpen = false;
    l.prevDetailKey = null;
    l.prevTab = null;
    l.stampAnim = {};
  },
};

const $app = () => document.getElementById("app");

// ── focus + scroll preservation across re-renders ────────────────────────────
let focusedKey = null;
let scrollTopMap = [];

function captureFocus() {
  const el = document.activeElement;
  focusedKey = el && el.getAttribute && el.getAttribute("data-fk") ? el.getAttribute("data-fk") : null;
  scrollTopMap = [];
  document.querySelectorAll(".scroll-thin").forEach((c, i) => {
    scrollTopMap.push([i, c.scrollTop]);
  });
}

function restoreFocus() {
  if (focusedKey) {
    const el = document.querySelector(`[data-fk="${CSS.escape(focusedKey)}"]`);
    if (el) el.focus({ preventScroll: true });
  }
  document.querySelectorAll(".scroll-thin").forEach((c, i) => {
    const pair = scrollTopMap.find(([idx]) => idx === i);
    if (pair) c.scrollTop = pair[1];
  });
  focusedKey = null;
  scrollTopMap = [];
}

// ── top-level stage rendering (LabRoot equivalent) ───────────────────────────
function renderApp() {
  const l = app.local;
  const state = store.state;
  const mode = state.mode;
  const objectives = mode ? objectivesFor(mode) : [];
  const score = mode ? computeScore(state, objectives) : null;
  const certOpen = l.certManual || (score && score.complete && !state.certSeen);

  captureFocus();
  let html = "";
  if (!store.hydrated) {
    html = `<div class="boot" role="status" aria-label="Loading the lab">
      <div class="boot-card">
        <span class="mono-label">unrolling the drawing…</span>
        <div class="boot-bar"><div class="boot-fill"></div></div>
      </div>
    </div>`;
  } else if (state.stage === "mode") {
    html = modeSelectHTML();
  } else if (state.stage === "briefing" && mode) {
    html = briefingHTML(mode);
  } else if (state.stage === "workbench" && mode) {
    html = workbenchHTML(state, mode, objectives, score, certOpen);
  }

  $app().innerHTML = html;
  assignFocusKeys($app());
  restoreFocus();

  // dialog focus hand-off (parity with Radix Dialog/AlertDialog)
  const dlg = $app().querySelector(".modal-card");
  if (dlg) {
    const target = dlg.querySelector("button:not([disabled])");
    if (target) target.focus({ preventScroll: true });
  } else if (certJustClosed) {
    const el = document.querySelector('[data-action="open-cert"], [data-action="claim-cert"]');
    if (el) el.focus({ preventScroll: true });
    certJustClosed = false;
  }
}

let certJustClosed = false;

// ── workbench (TitleBlock + stage tabs + tab content + footer) ───────────────
function workbenchHTML(state, mode, objectives, score, certOpen) {
  const l = app.local;
  const detailKey = l.sel ? `${l.sel.kind}:${l.sel.id}` : "empty";

  const tabs = [
    { id: "design", label: "Design", hint: "schematic · evidence · checklist" },
    { id: "exam", label: "Board exam", hint: `${score.correct}/${score.quizTotal} graded` },
    { id: "debrief", label: "Debrief", hint: "as-built package" },
  ];

  const tabAnim = l.prevTab !== null && l.prevTab !== l.tab ? "anim-tab" : "";
  const sheetAnim = l.prevDetailKey !== null && l.prevDetailKey !== detailKey ? "anim-sheet" : "";
  l.prevTab = l.tab;
  l.prevDetailKey = detailKey;

  const regionCls = (r) => `region region-${r} ${l.region === r ? "region-active" : ""}`;

  let tabContent = "";
  if (l.tab === "design") {
    const regionBtns = [
      ["drawing", "Drawing"],
      ["binder", "Binder"],
      ["tracker", "Checklist"],
    ]
      .map(
        ([id, label]) =>
          `<button type="button" role="tab" aria-selected="${l.region === id}" class="region-btn ${l.region === id ? "active" : ""}" data-action="region-tab" data-region="${id}">${label}</button>`,
      )
      .join("");
    tabContent = `
      <div class="region-switch" role="tablist" aria-label="Workbench regions">${regionBtns}</div>
      <div class="wb-grid">
        <div class="${regionCls("binder")}" ${l.region !== "binder" ? 'aria-hidden="true"' : ""}>
          ${evidenceBinderHTML(l.binderTab)}
        </div>
        <div class="region region-drawing stack-3 ${l.region === "drawing" ? "region-active" : ""}" ${l.region !== "drawing" ? 'aria-hidden="true"' : ""}>
          ${schematicHTML(state.env, l.sel)}
          ${
            l.sel
              ? `<div class="${sheetAnim}" data-fk="detail-anchor">${detailSheetHTML(l.sel, state.env, mode) || ""}</div>`
              : `<p class="empty-sheet">Select a <strong>zone, asset, link chip or the Control Register</strong> on the drawing to open its decision sheet.</p>`
          }
        </div>
        <div class="${regionCls("tracker")}" ${l.region !== "tracker" ? 'aria-hidden="true"' : ""}>
          ${trackerRailHTML(state, objectives, mode)}
        </div>
      </div>`;
  } else if (l.tab === "exam") {
    tabContent = `<div class="${tabAnim}">${QuizBoard.render(state, mode)}</div>`;
  } else {
    tabContent = `<div class="${tabAnim}">${debriefHTML(mode)}</div>`;
  }

  const stageTabs = tabs
    .map(
      (t) =>
        `<button type="button" role="tab" aria-selected="${l.tab === t.id}" class="stage-tab ${l.tab === t.id ? "active" : ""}" data-action="stage-tab" data-tab="${t.id}">
          <span class="st-label">${t.label}</span>
          <span class="st-hint">${t.hint}</span>
        </button>`,
    )
    .join("");

  return `
    ${titleBlockHTML(mode, score.score, score.complete)}
    <div role="tablist" aria-label="Workbench stages" class="stage-tabs">${stageTabs}</div>
    ${tabContent}
    <p class="wb-foot"><span class="mono-label">sheet 1/1 · northwind freight (fictional training environment) · progress autosaves to this browser</span></p>
    ${certOpen ? completionModalHTML(state, objectives, mode) : ""}
    ${l.resetOpen ? resetDialogHTML() : ""}`;
}

// ── data-fk assignment: give interactive elements stable focus keys ──────────
// (delegated: any element with data-action / data-field / data-fk-src gets a
// data-fk equal to action+args, so focus survives full re-renders)
function assignFocusKeys(root) {
  root.querySelectorAll("[data-action], [data-field]").forEach((el) => {
    if (el.hasAttribute("data-fk")) return;
    // only focusable elements need a focus key; non-focusable helpers (e.g. the
    // schematic's wide mouse hit-<line>) are skipped so they can never shadow
    // their focusable wrapper's key
    if (!el.matches("button, select, input, a, textarea, [tabindex]")) return;
    const a = el.getAttribute("data-action") || "";
    const parts = [a, el.getAttribute("data-kind") || "", el.getAttribute("data-id") || "", el.getAttribute("data-mode") || "", el.getAttribute("data-flag") || "", el.getAttribute("data-link") || "", el.getAttribute("data-key") || "", el.getAttribute("data-zone") || "", el.getAttribute("data-asset") || "", el.getAttribute("data-tab") || "", el.getAttribute("data-region") || "", el.getAttribute("data-verdict") || "", el.getAttribute("data-oi") || "", el.getAttribute("data-field") || ""];
    el.setAttribute("data-fk", parts.join("|"));
  });
}

// ── action dispatch ──────────────────────────────────────────────────────────
function findActionTarget(el) {
  while (el && el !== document) {
    if (el.getAttribute && (el.getAttribute("data-action") || el.getAttribute("data-field"))) return el;
    el = el.parentNode;
  }
  return null;
}

function dispatch(el, eventType) {
  const state = store.state;
  const mode = state.mode;
  const l = app.local;

  // change events on form fields (selects / checkboxes)
  const field = el.getAttribute("data-field");
  if (field && eventType === "change") {
    const val = el.type === "checkbox" ? el.checked : el.value;
    switch (field) {
      case "link-policy":
      case "link-vpn":
      case "link-tunnel": {
        const key = field === "link-policy" ? "policy" : field === "link-vpn" ? "vpn" : "tunnel";
        const linkId = el.getAttribute("data-link");
        store.updateEnv((e) => {
          e.links[linkId][key] = val;
        });
        return;
      }
      case "asset-zone": {
        const assetId = el.getAttribute("data-asset");
        store.updateEnv((e) => {
          e.assets[assetId] = val;
        });
        return;
      }
      case "flag-select": {
        const flag = el.getAttribute("data-flag");
        store.updateEnv((e) => {
          e.flags[flag] = val;
        });
        return;
      }
      case "flow": {
        const id = el.getAttribute("data-id");
        store.updateEnv((e) => {
          e.flows[id] = val;
        });
        return;
      }
      case "lateral": {
        store.updateEnv((e) => {
          e.lateral = val;
        });
        return;
      }
      case "zonematch": {
        const zone = el.getAttribute("data-zone");
        store.updateEnv((e) => {
          e.zoneMatch[zone] = val;
        });
        return;
      }
      case "matrix": {
        const id = el.getAttribute("data-id");
        store.updateEnv((e) => {
          e.matrix[id] = val;
        });
        return;
      }
      case "breach": {
        const key = el.getAttribute("data-key");
        store.updateEnv((e) => {
          e.breach[key] = val;
        });
        return;
      }
      case "failctx": {
        const id = el.getAttribute("data-id");
        store.updateEnv((e) => {
          e.failctx[id] = val;
        });
        return;
      }
      case "surface": {
        const id = el.getAttribute("data-id");
        store.updateEnv((e) => {
          e.surface[id] = val;
        });
        return;
      }
    }
    return;
  }

  if (eventType !== "click" && eventType !== "keydown") return;
  const action = el.getAttribute("data-action");
  if (!action) return;

  // schematic node selection (click or Enter/Space keydown)
  if (action === "select-node") {
    // asset nodes stop propagation in the original (asset inside zone) —
    // walk-up semantics here: the FIRST action target from the event already wins
    l.sel = { kind: el.getAttribute("data-kind"), id: el.getAttribute("data-id") };
    if (typeof window !== "undefined" && window.innerWidth < 1024) l.region = "drawing";
    renderApp();
    return;
  }

  switch (action) {
    case "select-mode":
      store.patch((s) => ({ ...s, mode: el.getAttribute("data-mode"), stage: "briefing" }));
      QuizBoard.reset();
      break;
    case "begin-lab":
      store.patch((s) => ({ ...s, stage: "workbench", briefingSeen: true }));
      app.resetLocal();
      renderApp();
      break;
    case "back-to-modes":
      store.patch((s) => ({ ...s, stage: "mode" }));
      break;
    case "switch-revision":
      store.patch((s) => ({ ...s, stage: "mode" }));
      app.resetLocal();
      break;
    case "reset-lab":
      l.resetOpen = true;
      renderApp();
      break;
    case "reset-cancel":
      l.resetOpen = false;
      renderApp();
      break;
    case "reset-confirm":
      l.resetOpen = false;
      QuizBoard.reset();
      app.resetLocal();
      store.reset();
      break;
    case "stage-tab":
      l.tab = el.getAttribute("data-tab");
      if (l.tab === "exam") QuizBoard.idx = null; // re-derive stepper position on board entry
      renderApp();
      break;
    case "region-tab":
      l.region = el.getAttribute("data-region");
      renderApp();
      break;
    case "binder-tab":
      l.binderTab = el.getAttribute("data-tab");
      renderApp();
      break;
    case "close-sheet":
      l.sel = null;
      renderApp();
      break;
    case "go-schematic":
      l.region = "drawing";
      renderApp();
      break;
    case "open-cert":
      l.certManual = true;
      store.patch((s) => ({ ...s, certSeen: true }));
      break;
    case "claim-cert":
      l.certManual = true;
      store.patch((s) => ({ ...s, certSeen: true }));
      break;
    case "close-cert":
      certJustClosed = true;
      l.certManual = false;
      store.patch((s) => ({ ...s, certSeen: true }));
      break;
    case "check-obj": {
      const objectives = objectivesFor(mode);
      const obj = objectives.find((o) => o.id === el.getAttribute("data-id"));
      if (!obj) return;
      const result = obj.validate(state.env);
      l.stampAnim[obj.id] = true; // animate the fresh stamp
      store.patch((s) => ({
        ...s,
        obj: {
          ...s.obj,
          [obj.id]: {
            ...(s.obj[obj.id] ?? { attempts: 0, passed: false, hintsUsed: 0 }),
            attempts: (s.obj[obj.id]?.attempts ?? 0) + 1,
            passed: (s.obj[obj.id]?.passed ?? false) || result,
            last: result,
          },
        },
      }));
      announce(result ? `${obj.id} approved. ${obj.passFeedback.slice(0, 120)}` : `${obj.id} needs revision. ${obj.failFeedback.slice(0, 120)}`);
      break;
    }
    case "hint-obj": {
      const objectives = objectivesFor(mode);
      const obj = objectives.find((o) => o.id === el.getAttribute("data-id"));
      if (!obj) return;
      store.patch((s) => ({
        ...s,
        obj: {
          ...s.obj,
          [obj.id]: {
            ...(s.obj[obj.id] ?? { attempts: 0, passed: false, hintsUsed: 0 }),
            hintsUsed: Math.min((s.obj[obj.id]?.hintsUsed ?? 0) + 1, obj.hints.length),
          },
        },
      }));
      announce(`Hint revealed for ${obj.id}.`);
      break;
    }
    case "review": {
      const id = el.getAttribute("data-id");
      const verdict = el.getAttribute("data-verdict");
      store.updateEnv((e) => {
        e.review[id] = verdict;
      });
      break;
    }
    case "link-toggle": {
      const linkId = el.getAttribute("data-link");
      const key = el.getAttribute("data-key");
      store.updateEnv((e) => {
        e.links[linkId][key] = !e.links[linkId][key];
      });
      break;
    }
    case "flag-toggle": {
      const flag = el.getAttribute("data-flag");
      store.updateEnv((e) => {
        e.flags[flag] = !e.flags[flag];
      });
      break;
    }
    case "quiz-pick":
      QuizBoard.pick(state, Number(el.getAttribute("data-oi")));
      break;
    case "quiz-check":
      QuizBoard.check(state);
      break;
    case "quiz-next":
      QuizBoard.next();
      renderApp();
      break;
    case "quiz-prev":
      QuizBoard.prev();
      renderApp();
      break;
  }
}

// ── global event delegation ──────────────────────────────────────────────────
document.addEventListener("click", (e) => {
  // overlay click-to-close (both dialogs close like the Radix originals)
  if (e.target.classList && e.target.classList.contains("overlay")) {
    const which = e.target.getAttribute("data-overlay");
    if (which === "reset") {
      app.local.resetOpen = false;
      renderApp();
    } else if (which === "cert") {
      certJustClosed = true;
      app.local.certManual = false;
      store.patch((s) => ({ ...s, certSeen: true }));
    }
    return;
  }
  const el = findActionTarget(e.target);
  if (el) dispatch(el, "click");
});

document.addEventListener("change", (e) => {
  const el = findActionTarget(e.target);
  if (el) dispatch(el, "change");
});

document.addEventListener("keydown", (e) => {
  // ESC closes dialogs (parity with Radix)
  if (e.key === "Escape") {
    const state = store.state;
    const objectives = state.mode ? objectivesFor(state.mode) : [];
    const score = state.mode ? computeScore(state, objectives) : null;
    const certOpen = app.local.certManual || (score && score.complete && !state.certSeen);
    if (app.local.resetOpen) {
      app.local.resetOpen = false;
      renderApp();
      return;
    }
    if (certOpen) {
      certJustClosed = true;
      app.local.certManual = false;
      store.patch((s) => ({ ...s, certSeen: true }));
      return;
    }
  }
  // Enter / Space activate role=button schematic nodes (same as the original)
  if ((e.key === "Enter" || e.key === " ") && e.target.getAttribute && e.target.getAttribute("data-action") === "select-node") {
    e.preventDefault();
    dispatch(e.target, "keydown");
  }
});

// ── store subscription → rerender ────────────────────────────────────────────
store.subscribe(() => {
  // clear one-shot stamp animations once rendered
  renderApp();
  app.local.stampAnim = {};
});

// ── boot: paint loading shell, then hydrate (mirrors the original's mount
//    effect; avoids any SSR/CSR-style mismatch by construction) ───────────────
renderApp();
window.requestAnimationFrame(() => {
  store.hydrate();
});
