// ─────────────────────────────────────────────────────────────────────────────
// js/app.js — application shell: runtime UI state, handlers, header, dialogs,
// the render loop (full render on actions, partial render on transfer ticks,
// focus/scroll preservation, FLIP lane-change animation) and boot.
// Vanilla port of `src/components/lab/CyberLab.tsx`.
// ─────────────────────────────────────────────────────────────────────────────

// Runtime (non-persisted) UI state — mirrors the original component state.
const ui = {
  tab: "flight",
  selectedWorkload: null,
  mobileView: "board",
  feedbacks: {},
  focusedObjective: null,
  glossaryOpen: false,
  glossaryQuery: "",
  briefingOpen: false,
  resetOpen: false,
  reportOpen: false,
  openDoc: null,
  clearanceResult: null, // for the currently selected workload (FlightPlan local state in the original)
  hasSaved: false,
  lastFocusedRender: null,
  focusPending: null, // 'viewer' | 'report' | 'glossary' | 'reset' | 'briefing'
  viewerCloseBtn: null,
  viewerReturnSel: null,
  reportCloseBtn: null,
  reportReturnSel: null,
  glossaryCloseBtn: null,
  briefingCloseBtn: null,
  resetCancelBtn: null,
};

let booted = false;
let transferTimer = null;

// ── Handlers (1:1 with CyberLab.tsx) ────────────────────────────────────────

function selectMode(mode) {
  ui.hasSaved = false;
  const fresh = initialState();
  fresh.mode = mode;
  store.set(fresh);
  saveState(fresh);
  clearState(); // original clears storage on mode select (fresh start)
  resetRuntimeUi();
  renderApp();
}

function discardSaved() {
  clearState();
  ui.hasSaved = false;
  store.set(initialState());
  resetRuntimeUi();
  renderApp();
}

function resetRuntimeUi() {
  ui.tab = "flight";
  ui.selectedWorkload = null;
  ui.mobileView = "board";
  ui.feedbacks = {};
  ui.focusedObjective = null;
  ui.glossaryOpen = false;
  ui.glossaryQuery = "";
  ui.briefingOpen = false;
  ui.resetOpen = false;
  ui.reportOpen = false;
  ui.openDoc = null;
  ui.clearanceResult = null;
  ui.lastFocusedRender = null;
}

function patchWorkload(id, patch) {
  store.update((prev) => {
    const cur = prev.workloads[id] ?? { status: "hold", dispositions: {} };
    return { ...prev, workloads: { ...prev.workloads, [id]: { ...cur, ...patch } } };
  });
}

function executeTransfer(id) {
  store.update((prev) => {
    const w = prev.workloads[id];
    if (!w) return prev;
    const def = WORKLOAD_MAP[id];
    if (w.transfer === "none") {
      return withLog(
        { ...prev, workloads: { ...prev.workloads, [id]: { ...w, status: "arrived", progress: 100 } } },
        `✓ ${id} ${def?.name} — flight plan filed; no transfer required (strategy: ${w.strategy}).`,
      );
    }
    return withLog(
      { ...prev, workloads: { ...prev.workloads, [id]: { ...w, status: "enroute", progress: 2 } } },
      `▸ ${id} ${def?.name} — transfer stream opened (${w.transfer}). monitor on radar.`,
    );
  });
  ui.tab = "radar";
  ui.mobileView = "console";
  renderApp();
}

function runIntegrity() {
  store.update((prev) => {
    const workloads = { ...prev.workloads };
    for (const [id, w] of Object.entries(workloads)) {
      if (w.status === "arrived") workloads[id] = { ...w, integrityRun: true };
    }
    return withLog({ ...prev, workloads }, "Radar — integrity sweep complete: SHA-256 manifest compared per disk.");
  });
}

function runPerf() {
  store.update((prev) => {
    const workloads = { ...prev.workloads };
    for (const [id, w] of Object.entries(workloads)) {
      if (w.status === "arrived") workloads[id] = { ...w, perfRun: true };
    }
    return withLog({ ...prev, workloads }, "Radar — performance comparison complete: probes vs pre-migration baselines.");
  });
}

function setDisposition(findingId, workloadId, value) {
  store.update((prev) => {
    const cur = prev.workloads[workloadId] ?? { status: "hold", dispositions: {} };
    return {
      ...prev,
      workloads: {
        ...prev.workloads,
        [workloadId]: { ...cur, dispositions: { ...cur.dispositions, [findingId]: value } },
      },
    };
  });
}

function patchCutover(patch) {
  store.update((prev) => ({ ...prev, cutover: { ...prev.cutover, ...patch } }));
}

function setWaveOrder(order) {
  store.update((prev) => ({ ...prev, waveOrder: order }));
}

function setAnswer(key, value) {
  store.update((prev) => {
    if (key === "TRIAGE-DOCS") {
      return { ...prev, triage: { ...prev.triage, docs: value.split(",").filter(Boolean) } };
    }
    if (key.startsWith("TRIAGE-CHANGE:")) {
      const doc = key.slice("TRIAGE-CHANGE:".length);
      return { ...prev, triage: { ...prev.triage, changes: { ...prev.triage.changes, [doc]: value } } };
    }
    if (key === "TP-PLAN") return { ...prev, transferPlan: { ...prev.transferPlan, plan: value } };
    if (key === "TP-HOURS") return { ...prev, transferPlan: { ...prev.transferPlan, totalHours: value } };
    if (key === "TP-FIRST") return { ...prev, transferPlan: { ...prev.transferPlan, first: value } };
    if (key === "AUDIT-DEP") return { ...prev, audit: { ...prev.audit, deps: value.split(",").filter(Boolean) } };
    if (key === "AUDIT-FIX") {
      const [dep, fix] = value.split(":");
      return { ...prev, audit: { ...prev.audit, fixes: { ...prev.audit.fixes, [dep]: fix } } };
    }
    if (key === "VIOLATION") return { ...prev, audit: { ...prev.audit, violations: value.split(",").filter(Boolean) } };
    if (key === "PROPOSAL") return { ...prev, audit: { ...prev.audit, proposal: value } };
    if (key === "EXITCOST") return { ...prev, audit: { ...prev.audit, exitCosts: value.split(",").filter(Boolean) } };
    // default: free-form answer key
    return { ...prev, triage: { ...prev.triage, changes: { ...prev.triage.changes, [key]: value } } };
  });
}

function runCheck(id) {
  const cur = store.get();
  if (!cur || !cur.mode) return;
  const def = OBJECTIVES_BY_ID[id];
  if (!def) return;
  const result = def.validate(cur);
  ui.feedbacks[id] = result;
  let next = recordAttempt(cur, id, result.pass);
  const modeDefs = objectivesForMode(cur.mode);
  const solvedNow = modeDefs.filter((o) => next.objectives[o.id]?.solved).length;
  if (solvedNow >= modeDefs.length && !next.completed) {
    next = { ...next, completed: true };
    ui.reportOpen = true;
    ui.reportReturnSel = '[aria-label="Open the flight report"]';
  }
  store.update(() => next);
}

function useHintFor(id) {
  store.update((prev) => (prev ? recordHint(prev, id) : prev));
}

function checkFocus(id) {
  ui.tab = "objectives";
  ui.mobileView = "console";
  ui.focusedObjective = id;
  runCheck(id);
  renderApp();
}

function goTo(nav) {
  ui.tab = nav.tab;
  if (nav.workloadId) ui.selectedWorkload = nav.workloadId;
  ui.mobileView = "console";
  renderApp();
}

function executeCutover() {
  store.update((prev) => {
    if (!prev || !prev.mode) return prev;
    let next = { ...prev, cutover: { ...prev.cutover, executed: true } };
    next = withLog(next, "02:36 — freeze active. final delta sync converging…");
    next = withLog(next, "02:36 — lag 00:00 · checksums verified. traffic switch armed.");
    if (prev.mode === "hard") {
      next = withLog(next, "02:39 — DNS switched to cloud endpoints. smoke test running…");
      next = withLog(next, "!INCIDENT 02:41 — error rate 8 %: app tier storming the OLD on-prem DB IP (cached DNS + missed connection-config change). decide now.");
    } else {
      next = withLog(next, "02:38 — DNS switch propagated (TTL 300 s). smoke tests green.");
      next = withLog(next, "02:44 — UAT sign-off recorded. hypercare started · rollback window open 14 days.");
    }
    return next;
  });
}

// Quiz handlers
function quizStart() {
  store.update((prev) => (prev ? { ...prev, quiz: { started: true, index: 0, answers: [], submitted: false, revealed: false } } : prev));
}
function quizAnswer(choice) {
  store.update((prev) => {
    if (!prev) return prev;
    if (prev.quiz.revealed || prev.quiz.submitted) return prev; // R2: locked answers cannot change
    const answers = [...prev.quiz.answers];
    answers[prev.quiz.index] = choice;
    return { ...prev, quiz: { ...prev.quiz, answers } };
  });
}
function quizReveal() {
  store.update((prev) => (prev ? { ...prev, quiz: { ...prev.quiz, revealed: true } } : prev));
}
function quizNext() {
  store.update((prev) => {
    if (!prev) return prev;
    const quiz = prev.mode === "hard" ? HARD_QUIZ : MEDIUM_QUIZ;
    const nextIndex = prev.quiz.index + 1;
    if (nextIndex >= quiz.length)
      return { ...prev, quiz: { ...prev.quiz, submitted: true, revealed: false } };
    return { ...prev, quiz: { ...prev.quiz, index: nextIndex, revealed: false } };
  });
}
function quizRetake() {
  quizStart();
}

function doReset() {
  clearState();
  resetRuntimeUi();
  ui.hasSaved = false; // the save no longer exists — never show a stale banner (QA-10)
  store.set(initialState());
  ui.resetOpen = false;
  renderApp();
}

// Evidence viewer (R7: X / click-outside / ESC; focus in + out).
// Focus return uses a stable selector — a stored node would be detached by the re-render.
function openDocViewer(id) {
  ui.viewerReturnSel = `[data-docid="${id}"]`;
  ui.openDoc = id;
  ui.focusPending = "viewer";
  renderApp();
}
function closeDocViewer() {
  const sel = ui.viewerReturnSel;
  ui.openDoc = null;
  ui.viewerReturnSel = null;
  renderApp();
  const n = sel && document.querySelector(sel);
  if (n) n.focus();
}

// ── Transfer simulation (420 ms tick, +12 %; keyed on en-route presence) ────

function tickTransfers() {
  store.update((prev) => {
    if (!prev) return prev;
    let changed = false;
    const workloads = { ...prev.workloads };
    const logs = [];
    for (const [id, w] of Object.entries(workloads)) {
      if (w.status !== "enroute") continue;
      const next = Math.min(100, (w.progress ?? 0) + 12);
      changed = true;
      if (next >= 100) {
        workloads[id] = { ...w, progress: 100, status: "arrived" };
        logs.push(`✓ ${id} ${WORKLOAD_MAP[id]?.name} — ARRIVED. run integrity + performance sweeps in Radar.`);
      } else {
        workloads[id] = { ...w, progress: next };
      }
    }
    if (!changed) return prev;
    let next = { ...prev, workloads };
    for (const l of logs) next = withLog(next, l);
    return next;
  }, "tick");
}

function syncTimer() {
  const has = store.get() ? Object.values(store.get().workloads).some((w) => w.status === "enroute") : false;
  if (has && !transferTimer) transferTimer = window.setInterval(tickTransfers, 420);
  if (!has && transferTimer) {
    window.clearInterval(transferTimer);
    transferTimer = null;
  }
}

// ── Focus / scroll preservation across re-renders ───────────────────────────

function pathOf(node, root) {
  const path = [];
  let n = node;
  while (n && n !== root) {
    const parent = n.parentElement;
    if (!parent) return null;
    path.unshift(Array.prototype.indexOf.call(parent.children, n));
    n = parent;
  }
  return n === root ? path : null;
}

function nodeAt(path, root) {
  let n = root;
  for (const i of path) {
    if (!n || !n.children || !n.children[i]) return null;
    n = n.children[i];
  }
  return n;
}

function captureFocusState(root) {
  const a = document.activeElement;
  if (!a || !root.contains(a) || a === document.body) return null;
  const sel = a.selectionStart !== undefined && a.selectionEnd !== undefined
    ? { start: a.selectionStart, end: a.selectionEnd } : null;
  return { path: pathOf(a, root), tag: a.tagName, type: a.type ?? null, sel };
}

function restoreFocusState(root, cap) {
  if (!cap || !cap.path) return;
  const n = nodeAt(cap.path, root);
  if (!n || n.tagName !== cap.tag) return;
  if (cap.type && n.type !== undefined && n.type !== cap.type) return;
  try {
    n.focus({ preventScroll: true });
    if (cap.sel && n.setSelectionRange) n.setSelectionRange(cap.sel.start, cap.sel.end);
  } catch {
    /* non-focusable after structure change — fine */
  }
}

function captureScrollState(root) {
  const map = new Map();
  root.querySelectorAll("[data-scrollkey]").forEach((el) => {
    map.set(el.getAttribute("data-scrollkey"), el.scrollTop);
  });
  return map;
}

function restoreScrollState(root, map) {
  if (!map) return;
  root.querySelectorAll("[data-scrollkey]").forEach((el) => {
    const k = el.getAttribute("data-scrollkey");
    if (map.has(k)) el.scrollTop = map.get(k);
  });
}

// ── FLIP animation for departure-board lane changes ─────────────────────────

function captureFlipRects() {
  const rects = new Map();
  document.querySelectorAll("[data-flip]").forEach((el) => {
    rects.set(el.getAttribute("data-flip"), el.getBoundingClientRect().top);
  });
  return rects;
}

function playFlip(rectsBefore) {
  if (!rectsBefore || rectsBefore.size === 0) return;
  document.querySelectorAll("[data-flip]").forEach((el) => {
    const key = el.getAttribute("data-flip");
    const before = rectsBefore.get(key);
    if (before === undefined) {
      el.classList.add("flip-enter"); // newly rendered card
      return;
    }
    const dy = before - el.getBoundingClientRect().top;
    if (Math.abs(dy) < 2) return;
    el.style.transition = "none";
    el.style.transform = `translateY(${dy}px)`;
    requestAnimationFrame(() => {
      el.style.transition = "transform 260ms cubic-bezier(0.22, 1, 0.36, 1)";
      el.style.transform = "";
    });
  });
}

// ── Header / shell ──────────────────────────────────────────────────────────

function HeaderView(state) {
  const mode = state.mode;
  const objectives = objectivesForMode(mode);
  const solved = objectives.filter((o) => (state.objectives[o.id] ?? {}).solved).length;
  const total = objectives.length;
  const pillarCounts = {};
  for (const p of ["P1", "P2", "P3", "P4"]) {
    pillarCounts[p] = {
      done: objectives.filter((o) => o.pillar === p && (state.objectives[o.id] ?? {}).solved).length,
      all: objectives.filter((o) => o.pillar === p).length,
    };
  }
  const nextObj = objectives.find((o) => !(state.objectives[o.id] ?? {}).solved);
  const quiz = mode === "hard" ? HARD_QUIZ : MEDIUM_QUIZ;
  const quizCorrect = state.quiz.answers.filter((a, i) => a !== null && a === quiz[i]?.answer).length;

  return h("header", { class: "tower-header" },
    h("div", { class: "header-row" },
      h("div", { class: "ident" },
        icon(I.RadioTower, 20, "c-runway"),
        h("div", { class: "ident__text" },
          h("p", { class: "ident__title" }, "MIGRATION CONTROL TOWER"),
          h("p", { class: "ident__sub" }, "MERIDIAN FREIGHT · CV0-004 2.3 · TRAINING DATA"),
        ),
        ModeBadge(mode),
      ),
      h("div", { class: "header-actions" },
        ProgressMeter(solved, total, pillarCounts),
        TowerButton({ size: "sm", variant: "ghost", onClick: () => { ui.briefingOpen = true; ui.focusPending = "briefing"; renderApp(); }, ariaLabel: "Re-open the pre-flight briefing" },
          icon(I.BookOpen, 16), h("span", { class: "hide-sm" }, " Briefing")),
        TowerButton({ size: "sm", variant: "ghost", onClick: () => { ui.glossaryOpen = true; ui.glossaryQuery = ""; ui.focusPending = "glossary"; renderApp(); }, ariaLabel: "Open the glossary" },
          "Glossary"),
        state.completed
          ? TowerButton({ size: "sm", variant: "success", onClick: () => { ui.reportOpen = true; ui.reportReturnSel = '[aria-label="Open the flight report"]'; ui.focusPending = "report"; renderApp(); }, ariaLabel: "Open the flight report" },
              icon(I.Trophy, 16), h("span", { class: "hide-sm" }, " Flight report"))
          : null,
        TowerButton({ size: "sm", variant: "ghost", onClick: () => { ui.resetOpen = true; ui.focusPending = "reset"; renderApp(); }, ariaLabel: "Reset the lab to pristine state" },
          icon(I.RotateCcw, 16), h("span", { class: "hide-sm" }, " Reset")),
      ),
    ),
    mode === "medium" && nextObj
      ? h("div", { class: "now-chip" },
          h("span", { class: "now-chip__label tower-blink" }, "▶ NOW"),
          h("span", { class: "now-chip__text" }, `${nextObj.id} · ${nextObj.title}`),
          h("button", {
            onClick: () => goTo(NAV[nextObj.id] ?? { tab: "objectives" }),
            class: "go-chip", "aria-label": `Go to ${nextObj.id}`,
          }, "Go →"),
        )
      : null,
    h("div", { class: "mobile-switch", role: "tablist", "aria-label": "Mobile view switch" },
      [
        { key: "board", label: "Departure board", ic: I.LayoutGrid },
        { key: "console", label: "Consoles", ic: I.MonitorPlay },
      ].map((v) =>
        h("button", {
          key: v.key, role: "tab", "aria-selected": ui.mobileView === v.key,
          onClick: () => { ui.mobileView = v.key; renderApp(); },
          class: `mswitch-btn ${ui.mobileView === v.key ? "mswitch-btn--active" : ""}`,
        }, icon(v.ic, 16), ` ${v.label.toUpperCase()}`)),
    ),
  );
}

// ── Overlays ────────────────────────────────────────────────────────────────

function BriefingDialogView() {
  if (!ui.briefingOpen) return null;
  return h("div", {
    class: "overlay-center", role: "dialog", "aria-modal": "true",
    "aria-label": "Pre-flight briefing", onClick: () => { ui.briefingOpen = false; renderOverlays(); },
  },
    h("div", { class: "dialog-card anim-pop", onClick: (e) => e.stopPropagation() },
      h("div", { class: "report-head" },
        h("div", null,
          h("h2", { class: "dialog-title" }, icon(I.RadioTower, 20, "c-runway"), " Pre-flight briefing — programme HELVETICA"),
          h("p", { class: "dialog-sub" }, `${BRIEFING.org} · ${BRIEFING.tagline}`),
        ),
        h("button", { ref: (n) => { ui.briefingCloseBtn = n; }, onClick: () => { ui.briefingOpen = false; renderOverlays(); }, "aria-label": "Close briefing", class: "overlay-close" }, icon(I.X, 20)),
      ),
      h("div", { class: "dialog-body" },
        BRIEFING.lines.map((l, i) => h("p", { key: i }, l)),
        h("p", { class: "cert-note cert-note--dialog" }, BRIEFING.certNote),
      ),
    ));
}

function ResetDialogView() {
  if (!ui.resetOpen) return null;
  return h("div", { class: "overlay-center", role: "dialog", "aria-modal": "true", "aria-label": "Reset the tower?" },
    h("div", { class: "dialog-card anim-pop" },
      h("h2", { class: "dialog-title" }, icon(I.AlertTriangle, 20, "c-signal"), " Reset the tower?"),
      h("p", { class: "dialog-sub dialog-sub--wrap" },
        "This wipes the saved session — mode, flight plans, waves, cutover, quiz and every objective result — and returns the lab to pristine state. This cannot be undone."),
      h("div", { class: "reset-actions" },
        h("button", { ref: (n) => { ui.resetCancelBtn = n; }, onClick: () => { ui.resetOpen = false; renderOverlays(); }, class: "btn btn--default" }, "Keep flying"),
        h("button", { onClick: doReset, class: "btn btn--reset-confirm" }, "Reset everything"),
      ),
    ));
}

function renderOverlays() {
  const root = document.getElementById("overlay-root");
  if (!root) return;
  const state = store.get();
  const children = [];
  if (!state || !state.mode || !state.briefingSeen) {
    root.replaceChildren();
    return;
  }
  children.push(GlossarySheetView({ open: ui.glossaryOpen, onOpenChange: (v) => { ui.glossaryOpen = v; if (!v) ui.glossaryQuery = ""; renderOverlays(); } }));
  children.push(BriefingDialogView());
  children.push(ResetDialogView());
  if (ui.reportOpen && state.completed) {
    const objectives = objectivesForMode(state.mode);
    children.push(CompletionModalView({ state, objectives, onClose: () => { ui.reportOpen = false; renderOverlays(); restoreReportFocus(); } }));
  }
  root.replaceChildren(...children.filter(Boolean));
}

/** Refocus the glossary filter after its list re-renders, preserving the caret. */
function refocusGlossary(caret) {
  const input = document.querySelector(".glossary-input");
  if (!input) return;
  input.focus();
  if (caret !== undefined && input.setSelectionRange) {
    try { input.setSelectionRange(caret, caret); } catch { /* non-numeric caret — ignore */ }
  }
}

function restoreReportFocus() {
  const n = ui.reportReturnSel && document.querySelector(ui.reportReturnSel);
  if (n) n.focus();
  ui.reportReturnSel = null;
}

// Global ESC handling for overlays (R7)
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (ui.openDoc) { closeDocViewer(); return; }
  if (ui.reportOpen) { ui.reportOpen = false; renderOverlays(); restoreReportFocus(); return; }
  if (ui.glossaryOpen) { ui.glossaryOpen = false; ui.glossaryQuery = ""; renderOverlays(); return; }
  if (ui.briefingOpen) { ui.briefingOpen = false; renderOverlays(); return; }
  if (ui.resetOpen) { ui.resetOpen = false; renderOverlays(); return; }
});

// ── Render loop ─────────────────────────────────────────────────────────────

function ConsolePanelFor(state) {
  const mode = state.mode;
  const objectives = objectivesForMode(mode);
  const solved = objectives.filter((o) => (state.objectives[o.id] ?? {}).solved).length;
  const total = objectives.length;
  const quiz = mode === "hard" ? HARD_QUIZ : MEDIUM_QUIZ;
  const quizCorrect = state.quiz.answers.filter((a, i) => a !== null && a === quiz[i]?.answer).length;

  const nav = h("nav", { class: "console-nav tower-scroll", role: "tablist", "aria-label": "Console tabs" },
    TAB_DEFS.map((t) =>
      h("button", {
        key: t.key, role: "tab", "aria-selected": ui.tab === t.key,
        onClick: () => { ui.tab = t.key; renderApp(); },
        class: `tab-btn ${ui.tab === t.key ? "tab-btn--active" : ""}`,
      },
        t.label.toUpperCase(),
        t.key === "objectives" ? h("span", { class: "tab-badge" }, `${solved}/${total}`) : null,
        t.key === "quiz" && state.quiz.submitted ? h("span", { class: "tab-badge tab-badge--quiz" }, `${quizCorrect}/${quiz.length}`) : null,
      )),
  );

  let panel = null;
  if (ui.tab === "flight") {
    panel = FlightPlanView({
      state, mode, selectedId: ui.selectedWorkload,
      onSelect: (id) => { ui.selectedWorkload = id; ui.clearanceResult = null; renderApp(); },
      onPatch: patchWorkload,
      onExecute: executeTransfer,
      onFocusObjective: checkFocus,
      clearClearance: () => { ui.clearanceResult = null; },
    });
  } else if (ui.tab === "radar") {
    panel = RadarConsoleView({ state, mode, onRunIntegrity: runIntegrity, onRunPerf: runPerf, onDisposition: setDisposition, onFocusObjective: checkFocus });
  } else if (ui.tab === "clearance") {
    panel = ClearancePanelView({ state, mode, onPatchCutover: patchCutover, onSetWaveOrder: setWaveOrder, onExecuteCutover: executeCutover, onSetAnswer: setAnswer, onFocusObjective: checkFocus });
  } else if (ui.tab === "evidence") {
    panel = EvidenceLockerView({ state, mode, onSetAnswer: setAnswer, onFocusObjective: checkFocus });
  } else if (ui.tab === "learn") {
    panel = LearnPanelView();
  } else if (ui.tab === "debrief") {
    panel = DebriefPanelView();
  } else if (ui.tab === "objectives") {
    panel = ObjectivesPanelView({ state, mode, objectives, onCheck: runCheck, onHint: useHintFor, onSetAnswer: setAnswer, onGoTo: goTo });
  } else if (ui.tab === "quiz") {
    panel = QuizPanelView({
      state, mode, solvedCount: solved, totalObjectives: total,
      onAnswer: quizAnswer, onReveal: quizReveal, onNext: quizNext, onStart: quizStart, onRetake: quizRetake,
    });
  }
  return { nav, panel };
}

function renderConsoleInto() {
  const root = document.getElementById("console-root");
  const state = store.get();
  if (!root || !state) return;
  const { nav, panel } = ConsolePanelFor(state);
  const pane = h("div", { class: "console-pane-inner" }, nav, h("div", { class: "console-panel", id: "console-panel" }, panel));
  root.replaceChildren(pane);
}

function renderApp() {
  const root = document.getElementById("app-root");
  const state = store.get();
  if (!root) return;

  if (!booted || !state) {
    root.replaceChildren(BootView());
    return;
  }
  if (!state.mode) {
    document.getElementById("overlay-root")?.replaceChildren();
    root.replaceChildren(ModeGateView({ onSelect: selectMode, hasSaved: ui.hasSaved, onDiscardSaved: discardSaved }));
    syncTimer();
    return;
  }
  if (!state.briefingSeen) {
    document.getElementById("overlay-root")?.replaceChildren();
    root.replaceChildren(BriefingView({ mode: state.mode, onBegin: () => store.update((prev) => ({ ...prev, briefingSeen: true })) }));
    syncTimer();
    return;
  }

  // Full tower render — preserve focus + scroll across the replacement.
  const focusCap = captureFocusState(root);
  const scrollMap = captureScrollState(root);
  const flipRects = captureFlipRects();

  const overlayRoot = document.getElementById("overlay-root");
  if (overlayRoot) overlayRoot.replaceChildren(); // rebuilt below

  const boardVisible = ui.mobileView === "board";
  const consoleVisible = ui.mobileView === "console";
  const header = HeaderView(state);
  const boardPane = h("div", { class: `board-pane ${boardVisible ? "" : "pane--hidden-mobile"}`, id: "board-root" },
    DepartureBoardView({ state, onSelectWorkload: (id) => { ui.selectedWorkload = id; ui.tab = "flight"; ui.mobileView = "console"; renderApp(); } }));
  const consoleWrap = h("div", { class: `console-wrap ${consoleVisible ? "" : "pane--hidden-mobile"}`, id: "console-root" });
  root.replaceChildren(header, h("div", { class: "main-grid" }, boardPane, consoleWrap));
  renderConsoleInto();
  renderOverlays();

  restoreScrollState(root, scrollMap);
  restoreFocusState(root, focusCap);
  playFlip(flipRects);
  syncTimer();

  // pending overlay focus (R7: focus moves to the close affordance on open)
  if (ui.focusPending === "viewer" && ui.viewerCloseBtn) { ui.viewerCloseBtn.focus(); ui.focusPending = null; }
  else if (ui.focusPending === "report" && ui.reportCloseBtn) { ui.reportCloseBtn.focus(); ui.focusPending = null; }
  else if (ui.focusPending === "glossary" && ui.glossaryCloseBtn) { ui.glossaryCloseBtn.focus(); ui.focusPending = null; }
  else if (ui.focusPending === "reset" && ui.resetCancelBtn) { ui.resetCancelBtn.focus(); ui.focusPending = null; }
  else if (ui.focusPending === "briefing" && ui.briefingCloseBtn) { ui.briefingCloseBtn.focus(); ui.focusPending = null; }

  // deep-link scroll for focused objective cards
  if (ui.focusedObjective && ui.focusedObjective !== ui.lastFocusedRender) {
    ui.lastFocusedRender = ui.focusedObjective;
    requestAnimationFrame(() => {
      const el = root.querySelector(`[data-obj="${ui.focusedObjective}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}

// Partial render for the 420 ms transfer tick: only the board and, when
// visible, the radar/flight console (neither contains text inputs/selects).
function renderTick() {
  const root = document.getElementById("app-root");
  const state = store.get();
  if (!root || !state || !state.mode || !state.briefingSeen) { renderApp(); return; }
  const flipRects = captureFlipRects();
  const boardRoot = document.getElementById("board-root");
  if (boardRoot) {
    const scrollMap = captureScrollState(boardRoot);
    boardRoot.replaceChildren(DepartureBoardView({ state, onSelectWorkload: (id) => { ui.selectedWorkload = id; ui.tab = "flight"; ui.mobileView = "console"; renderApp(); } }));
    restoreScrollState(boardRoot, scrollMap);
    playFlip(flipRects);
  }
  if (ui.tab === "radar" || ui.tab === "flight") {
    const consoleRoot = document.getElementById("console-root");
    if (consoleRoot) {
      const scrollMap = captureScrollState(consoleRoot);
      const focusCap = captureFocusState(consoleRoot);
      renderConsoleInto();
      restoreScrollState(consoleRoot, scrollMap);
      restoreFocusState(consoleRoot, focusCap);
    }
  }
  syncTimer();
}

store.subscribe((tag) => {
  if (tag === "tick") renderTick();
  else renderApp();
});

// ── Boot ────────────────────────────────────────────────────────────────────

function boot() {
  const saved = loadState();
  store.set(saved ?? initialState());
  if (saved) ui.hasSaved = true;
  booted = true;
  saveState(store.get()); // original persists right after hydration too
  renderApp();
}

boot();
