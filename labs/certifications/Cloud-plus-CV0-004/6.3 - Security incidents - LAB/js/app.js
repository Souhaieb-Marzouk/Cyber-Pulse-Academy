// ── Exercise CLOUDBURST · app.js — bootstrap, regions, events, dialogs ──────
// Re-creates the original's React behavior with plain DOM:
//   useReducer + useEffect(save) → LabStore (js/state.js)
//   component-local useState     → UI (this file)
//   re-render                    → region diffing: only what changed re-renders

// ── component-local UI state (mirrors the original's useState hooks) ────────
const UI = {
  auditQuery: "",          // AuditTrailConsole search box
  auditSuspiciousOnly: false,
  auditOpen: null,         // expanded audit row id
  alertOpen: null,         // expanded alert id
  cardResults: {},         // per-objective last Check result (transient panel)
  resetArmed: false,
  resetTimer: null,
  manualOpen: false,       // After-Action Report opened via button
  kcOpen: false,           // Knowledge Core dialog
  dialogOpener: null,      // element to restore focus to on dialog close
};

let prevRootKey = "";

// ── boot ─────────────────────────────────────────────────────────────────────
function boot() {
  LabStore.init();
  LabStore.subscribe(onStateChange);
  const saved = loadState();
  // even with no saved state we must flip `hydrated`, or the lab never renders
  LabStore.dispatch({ type: "HYDRATE", state: saved ?? { ...initialState(), hydrated: true } });
}

// ── state → view (React's render + effect model, in one place) ──────────────
function onStateChange(state) {
  LabStore.persist(); // the original saves on every state change (useEffect)
  const key = `${state.hydrated ? 1 : 0}|${state.stage}|${state.mode ?? "-"}`;
  if (key !== prevRootKey) { renderRoot(state); return; }

  if (state.stage === "ops" && state.mode) updateOpsRegions(state);
}

// full-page render on stage/mode change (mount effects in the original)
function renderRoot(state) {
  const root = document.getElementById("lab-root");
  const key = `${state.hydrated ? 1 : 0}|${state.stage}|${state.mode ?? "-"}`;
  prevRootKey = key;

  if (!state.hydrated) {
    root.innerHTML = `<div class="boot-screen" role="status" aria-label="Loading lab"><p class="boot-chip">Opening IR-114…</p></div>`;
    return;
  }
  closeDialog(true); // stage changes unmount dialogs (React unmount semantics)

  if (state.stage === "select" || !state.mode) {
    // Reachable with a mode in flight via the briefing's "Choose mode again".
    const hasProgress = state.mode !== null;
    root.innerHTML = viewModeSelect(hasProgress);
    return;
  }
  if (state.stage === "briefing") {
    root.innerHTML = viewBriefing(state.mode);
    return;
  }

  // ops wall
  root.innerHTML = `
    <div class="stage-enter-slow" style="min-height:100vh;padding-bottom:64px;color:var(--ink)">
      <div id="band-region">${viewMissionBand(state)}</div>
      <div id="banner-region"></div>
      <main id="ops-floor" class="wrap ops-floor">
        <div id="nextup-region"></div>
        <div class="ops-grid">
          <div class="col-3" id="alerts-region">${viewAlertInbox(state)}</div>
          <div class="col-5" id="audit-region">${viewAuditConsole(state)}</div>
          <div class="col-4" id="identity-region">${viewIdentityConsole(state)}</div>
          <div class="col-7" id="repo-region">${viewRepoEvidence()}</div>
          <div class="col-5" id="harden-region">${viewHardeningBoard(state)}</div>
        </div>
      </main>
      <div id="record-region"></div>
      <section class="after-zone" aria-label="After-action zone">
        <div id="quiz-region"></div>
        ${viewDebrief()}
        <div id="reportbtn-region"></div>
      </section>
      <div id="dialog-region"></div>
      <div id="toast-region"></div>
    </div>`;
  updateOpsRegions(state, true);
}

// ── ops-page regions: re-render only what the new state actually changes ────
function sigOf(state) {
  const objs = objectivesFor(state.mode ?? "medium");
  const passed = objs.filter((o) => state.objectives[o.id]?.passed).length;
  const nextId = objs.find((o) => !state.objectives[o.id]?.passed)?.id ?? "-";
  // NOTE: answers are deliberately NOT part of the record signature — typing in
  // an answer field must never re-render the ledger (the original's React
  // reconciliation behaves the same way). Sequence pool edits re-render their
  // own card explicitly (see rerenderCardControls).
  const objSigs = objs.map((o) => {
    const st = state.objectives[o.id];
    return `${o.id}:${st ? `${st.attempts}.${st.passed ? 1 : 0}.${st.firstTry ? 1 : 0}.${st.hints}` : "-"}`;
  }).join(",");
  return {
    band: `${passed}|${progressOf(state, 0, 0).currentPhase}|${state.env.clock}|${state.env.contained}`,
    banner: `${state.env.contained}`,
    nextup: `${state.mode}-${nextId}`,
    audit: `${state.mode}|${state.env.liveRevealed}|${state.env.contained}|${state.env.clock}`,
    identity: `${JSON.stringify(state.env.keys)}${JSON.stringify(state.env.users)}${state.env.policyAttached}${state.env.actionLog.length}${state.env.actionLog[state.env.actionLog.length - 1] ?? ""}${state.env.contained}`,
    harden: `${JSON.stringify(state.env.hardening)}`,
    record: `${objSigs}|${state.nudgeUsed}`,
    quiz: `${state.quizIndex}|${JSON.stringify(state.quizAnswers)}|${JSON.stringify(state.quizChecked)}|${state.quizSubmitted}|${progressOf(state, 0, 0).quizUnlocked ? 1 : 0}`,
    reportbtn: `${progressOf(state, 0, 0).allPassed}|${state.quizSubmitted}`,
    completion: `${progressOf(state, 0, 0).allPassed}|${state.quizSubmitted}|${state.reportSeen}|${UI.manualOpen}|${JSON.stringify(state.objectives)}|${JSON.stringify(state.quizAnswers)}`,
  };
}

let prevSigs = null;
function updateOpsRegions(state, force) {
  const sig = sigOf(state);
  const set = (id, cond, html) => {
    if (!cond) return;
    const el = document.getElementById(id);
    if (!el) return;
    keepFocus(() => { el.innerHTML = html; });
  };
  const changed = (k) => force || prevSigs?.[k] !== sig[k];
  set("band-region", changed("band"), viewMissionBand(state));
  set("banner-region", changed("banner"), viewLiveBanner(state));
  set("nextup-region", changed("nextup"), viewNextUp(state));
  set("audit-region", changed("audit"), viewAuditConsole(state));
  set("identity-region", changed("identity"), viewIdentityConsole(state));
  set("harden-region", changed("harden"), viewHardeningBoard(state));
  set("record-region", changed("record"), viewRecord(state));
  set("quiz-region", changed("quiz"), viewQuiz(state));
  set("reportbtn-region", changed("reportbtn"), viewReportButton(state));
  updateCompletion(state);
  prevSigs = sig;
}

function viewLiveBanner(state) {
  if (!(state.mode === "hard" && !state.env.contained)) return "";
  return `<p class="live-banner" role="status">${ic("shield-ellipsis", "ic-16")}Live incident — every clock advance before containment may reveal new attacker activity</p>`;
}

function viewNextUp(state) {
  if (state.mode !== "medium") return "";
  const nextObj = objectivesFor("medium").find((o) => !state.objectives[o.id]?.passed);
  if (!nextObj) return "";
  return `<p class="next-up">${ic("play-circle", "ic-16")}Next up: ${esc(nextObj.id)} · ${esc(nextObj.title)}</p>`;
}

function viewReportButton(state) {
  const prog = progressOf(state, 0, 0);
  if (!(prog.allPassed && state.quizSubmitted)) return "";
  return `<button type="button" class="btn btn-lg btn-dark btn-center" data-action="report-open">File the After-Action Report</button>`;
}

// re-render a DOM node while keeping focus/caret on the same logical control
function keepFocus(mutate, focusSel) {
  const active = document.activeElement;
  const fk = active && active.getAttribute ? active.getAttribute("data-fk") : null;
  const caret = active && active.selectionStart != null ? { s: active.selectionStart, e: active.selectionEnd } : null;
  mutate();
  if (fk) {
    const next = document.querySelector(`[data-fk="${CSS.escape(fk)}"]`);
    if (next) { next.focus(); if (caret && next.selectionStart != null) { try { next.setSelectionRange(caret.s, caret.e); } catch {} } }
  }
}

// ── completion dialog (auto-open latch + manual reopen) ─────────────────────
let completionShown = false;
function updateCompletion(state) {
  const prog = progressOf(state, 0, 0);
  const autoOpen = prog.allPassed && state.quizSubmitted && !state.reportSeen;
  const open = UI.manualOpen || autoOpen;
  const region = document.getElementById("dialog-region");
  if (!region) return;
  if (open) {
    const wasOpen = document.getElementById("aar-panel");
    region.innerHTML = viewCompletionDialog(state);
    if (!wasOpen || !completionShown) {
      openDialog("aar-panel", "report-close");
      if (!state.completed) LabStore.dispatch({ type: "COMPLETE" }); // the original's useEffect
      completionShown = true;
    }
  } else {
    if (document.getElementById("aar-panel")) closeDialog();
    completionShown = false;
  }
}

// ── dialogs: focus, trap, ESC, click-outside, scroll-lock ────────────────────
function openDialog(panelId, closeAction) {
  const panel = document.getElementById(panelId);
  if (!panel) return;
  UI.dialogOpener = document.activeElement instanceof Element ? document.activeElement : null;
  document.body.style.overflow = "hidden"; // scroll lock (cleared on every close path)
  panel.focus();
  panel.addEventListener("keydown", trapFocus);
  UI._trapPanel = panel;
  UI._closeAction = closeAction;
}
function trapFocus(e) {
  if (e.key !== "Tab" || !UI._trapPanel) return;
  const focusables = UI._trapPanel.querySelectorAll(
    'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  if (focusables.length === 0) return;
  const first = focusables[0], last = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}
function closeDialog(silent) {
  document.body.style.overflow = ""; // scroll-lock cleared on every close path
  if (UI._trapPanel) { UI._trapPanel.removeEventListener("keydown", trapFocus); UI._trapPanel = null; }
  const region = document.getElementById("dialog-region");
  if (region && region.innerHTML !== "") region.innerHTML = "";
  UI.kcOpen = false;
  if (!silent && UI.dialogOpener && document.contains(UI.dialogOpener)) { UI.dialogOpener.focus(); }
  UI.dialogOpener = null;
}
function knowledgeOpen() {
  const region = document.getElementById("dialog-region");
  if (!region) return;
  region.innerHTML = viewKnowledgeDialog();
  openDialog("kc-panel", "kc-close");
  UI.kcOpen = true;
}

// ── RESET (armed double-click consent) ───────────────────────────────────────
function handleReset() {
  if (!UI.resetArmed) {
    UI.resetArmed = true;
    const toast = document.getElementById("toast-region");
    if (toast) toast.innerHTML = `<p class="reset-toast" role="alert">Click RESET again to wipe ALL progress and return to mode select.</p>`;
    UI.resetTimer = window.setTimeout(() => {
      UI.resetArmed = false;
      const t = document.getElementById("toast-region");
      if (t) t.innerHTML = "";
    }, 4000);
    return;
  }
  window.clearTimeout(UI.resetTimer);
  UI.resetArmed = false;
  clearState();
  UI.cardResults = {};
  UI.manualOpen = false;
  UI.auditQuery = ""; UI.auditSuspiciousOnly = false; UI.auditOpen = null; UI.alertOpen = null;
  prevSigs = null;
  LabStore.dispatch({ type: "RESET" });
}

// ── event wiring (delegated: one set of listeners for the whole lab) ─────────
function actions(state) {
  return {
    "pick-mode": (el) => LabStore.dispatch({ type: "SET_MODE", mode: el.dataset.mode }),
    "goto": (el) => LabStore.dispatch({ type: "GOTO", stage: el.dataset.stage }),
    "advance-clock": () => LabStore.dispatch({ type: "ADVANCE_CLOCK" }),
    "reset": () => handleReset(),
    "kc-open": () => knowledgeOpen(),
    "kc-close": () => closeDialog(),
    "report-open": () => { UI.manualOpen = true; updateCompletion(LabStore.state); },
    "report-close": () => { UI.manualOpen = false; closeDialog(); if (!LabStore.state.reportSeen) LabStore.dispatch({ type: "REPORT_SEEN" }); },
    "report-reset": () => { UI.manualOpen = false; closeDialog(); LabStore.dispatch({ type: "RESET" }); },
    "alert-toggle": (el) => { UI.alertOpen = UI.alertOpen === el.dataset.id ? null : el.dataset.id; rerender("alerts-region", viewAlertInbox(LabStore.state)); },
    "audit-suspicious": () => { UI.auditSuspiciousOnly = !UI.auditSuspiciousOnly; rerender("audit-region", viewAuditConsole(LabStore.state)); },
    "audit-toggle": (el) => { UI.auditOpen = UI.auditOpen === el.dataset.id ? null : el.dataset.id; updateAuditList(LabStore.state); },
    "key-deactivate": (el) => LabStore.dispatch({ type: "KEY_DEACTIVATE", id: el.dataset.id }),
    "key-delete": (el) => LabStore.dispatch({ type: "KEY_DELETE", id: el.dataset.id }),
    "user-quarantine": (el) => LabStore.dispatch({ type: "USER_QUARANTINE", id: el.dataset.id }),
    "user-delete": (el) => {
      // original: keys: allKeys.filter(k => k.of === u.id).map(k => k.id)
      // (allKeys includes the support-bot key when it has been planted)
      const botKeyEntry = LabStore.state.env.keys[KEY_BOT_ID]
        ? [{ id: KEY_BOT_ID, of: INCIDENT.supportBot }] : [];
      const allKeys = KEYS.concat(botKeyEntry);
      const keys = allKeys.filter((k) => k.of === el.dataset.id).map((k) => k.id);
      LabStore.dispatch({ type: "USER_DELETE", id: el.dataset.id, keys });
    },
    "policy-detach": () => LabStore.dispatch({ type: "POLICY_DETACH" }),
    "toggle-hardening": (el) => LabStore.dispatch({ type: "TOGGLE_HARDENING", id: el.dataset.id }),
    "check": (el) => {
      const obj = objectivesFor(LabStore.state.mode ?? "medium").find((o) => o.id === el.dataset.obj);
      if (!obj) return;
      const r = checkObjective(obj, LabStore.state); // instant validation (F2)
      UI.cardResults[obj.id] = r;
      LabStore.dispatch({ type: "CHECK", id: obj.id, result: r });
    },
    "hint": (el) => {
      const st = LabStore.state.objectives[el.dataset.obj];
      const obj = objectivesFor(LabStore.state.mode ?? "medium").find((o) => o.id === el.dataset.obj);
      if (obj && Math.min(st?.hints ?? 0, obj.hints.length) < obj.hints.length) { // QA-10 guard
        LabStore.dispatch({ type: "HINT", id: el.dataset.obj });
      }
    },
    "nudge": (el) => LabStore.dispatch({ type: "NUDGE", id: el.dataset.obj }),
    "seq-add": (el) => {
      const cur = LabStore.state.answers[el.dataset.key];
      const chosen = Array.isArray(cur) ? cur : [];
      LabStore.dispatch({ type: "SET_ANSWER", key: el.dataset.key, value: [...chosen, el.dataset.opt] });
      rerenderCardControls(el);
    },
    "seq-remove": (el) => {
      const cur = LabStore.state.answers[el.dataset.key];
      const chosen = Array.isArray(cur) ? cur : [];
      LabStore.dispatch({ type: "SET_ANSWER", key: el.dataset.key, value: chosen.filter((v) => v !== el.dataset.opt) });
      rerenderCardControls(el);
    },
    "quiz-answer": (el) => LabStore.dispatch({ type: "QUIZ_ANSWER", value: Number(el.dataset.index) }),
    "quiz-check": () => LabStore.dispatch({ type: "QUIZ_CHECK" }),
    "quiz-nav": (el) => LabStore.dispatch({ type: "QUIZ_NAV", delta: Number(el.dataset.delta) }),
    "quiz-submit": () => LabStore.dispatch({ type: "QUIZ_SUBMIT", correct: 0 }),
    "overlay-close": () => {
      // click-outside (radix onOpenChange(false)) — same contract as X/ESC
      if (document.getElementById("aar-panel")) actions(LabStore.state)["report-close"]();
      else closeDialog();
    },
  };
}

function rerender(id, html) {
  const el = document.getElementById(id);
  if (el) keepFocus(() => { el.innerHTML = html; });
}
function rerenderCardControls(el) {
  const card = el.closest(".obj-card");
  if (!card) return;
  const obj = objectivesFor(LabStore.state.mode ?? "medium").find((o) => card.id === `card-${o.id}`);
  if (!obj) return;
  keepFocus(() => {
    card.outerHTML = objectiveCard(obj, LabStore.state, false);
  });
}
function updateAuditList(state) {
  const wrap = document.getElementById("audit-events-wrap");
  const foot = document.getElementById("audit-foot");
  keepFocus(() => {
    if (wrap) wrap.innerHTML = auditListHTML(state);
    if (foot) foot.innerHTML = auditFootHTML(state);
  });
}

document.addEventListener("click", (e) => {
  const el = e.target instanceof Element ? e.target.closest("[data-action]") : null;
  if (!el || el.disabled) return;
  const type = el.dataset.action;
  if (type === "set-answer") return; // handled by change/input below
  const fn = actions(LabStore.state)[type];
  if (fn) fn(el);
});

// answers: text/select/order changes fire "change"; text typing fires "input"
function setAnswer(el, value) {
  LabStore.dispatch({ type: "SET_ANSWER", key: el.dataset.key, value });
}
document.addEventListener("input", (e) => {
  const el = e.target;
  if (!(el instanceof Element)) return;
  if (el.id === "audit-search") { // local filter — mirrors component useState, no store write
    UI.auditQuery = el.value;
    updateAuditList(LabStore.state);
    return;
  }
  if (el.matches("input[type=text][data-action=set-answer]")) setAnswer(el, el.value);
});
document.addEventListener("change", (e) => {
  const el = e.target;
  if (!(el instanceof Element)) return;
  if (el.matches("select[data-action=set-answer]")) {
    if (el.dataset.pos !== undefined) {
      const cur = LabStore.state.answers[el.dataset.key];
      const chosen = Array.isArray(cur) ? [...cur] : [];
      chosen[Number(el.dataset.pos)] = el.value;
      setAnswer(el, chosen);
    } else setAnswer(el, el.value);
  }
  if (el.matches("input[type=checkbox][data-action=set-answer]")) {
    const cur = LabStore.state.answers[el.dataset.key];
    const selected = Array.isArray(cur) ? cur : [];
    const next = selected.includes(el.dataset.opt)
      ? selected.filter((v) => v !== el.dataset.opt)
      : [...selected, el.dataset.opt];
    setAnswer(el, next);
  }
});

// ESC closes the open dialog (radix behavior)
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && (document.getElementById("kc-panel") || document.getElementById("aar-panel"))) {
    if (document.getElementById("aar-panel")) actions(LabStore.state)["report-close"]();
    else closeDialog();
  }
});

// boot
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
