// ── app.js — bootstrap, render orchestration, event wiring, dialogs ─────────
// Render policy (mirrors the original React tree):
//  • text inputs / checkboxes / selects dispatch SILENT state updates (no
//    re-render, no focus loss) with targeted micro-updates for dependents;
//  • structural actions (navigation, check, hint, dialogs) re-render the app
//    and restore focus via data-fkey keys — like React reconciliation.
"use strict";

var U = window.LabUI;
var D = window.LabData;
var Store = window.LabStore;
var V = U.viewState;
var Views = window.LabViews;
var Quiz = window.LabQuiz;

function sheetHtml(i) {
  switch (i) {
    case 0: return Views.sheetBrief();
    case 1: return Views.sheetReference();
    case 2: return Views.sheetBench();
    case 3: return Views.sheetChecklist();
    case 4: return Quiz.sheetExam();
    case 5: return Views.sheetAsBuilt();
    default: return "";
  }
}

function findFkey(root, fkey) {
  try {
    return root.querySelector('[data-fkey="' + (window.CSS && CSS.escape ? CSS.escape(fkey) : fkey) + '"]');
  } catch (e) {
    return null;
  }
}

function focusOpener(fkey) {
  var el = findFkey(document, fkey);
  if (el) el.focus();
}

function render() {
  var app = document.getElementById("app");
  var s = Store.state;

  // Detect remounts (sheet / bench tab / start screen change) — mirrors React
  // component lifecycle: per-mount view state resets, entrance animations run.
  var sheetKey = s.started ? s.mode + ":" + s.sheet + ":" + s.benchTab : "cover";
  var anim = sheetKey !== V.lastSheetKey;
  if (anim) {
    U.resetMountedViewState();
    V.animBench = false;
    V.animSheet = anim;
    V.lastSheetKey = sheetKey;
    if (s.started && s.sheet === 2 && V.lastBenchTab !== s.benchTab) {
      V.animBench = V.lastBenchTab != null;
      V.lastBenchTab = s.benchTab;
    } else if (s.sheet !== 2) {
      V.lastBenchTab = null;
    }
  } else {
    V.animSheet = false;
    V.animBench = false;
  }

  var html;
  if (!s.started) {
    html = '<div class="lab-paper lab-fill">' + Views.modeSelect() + "</div>";
  } else {
    html = '<div class="lab-paper lab-shell">' +
      Views.titleBlock() +
      '<main class="lab-main' + (V.animSheet ? " sheet-anim" : "") + '">' + sheetHtml(s.sheet) + "</main>" +
      Views.clipboardChip() +
      "</div>";
  }
  app.innerHTML = html;

  // Focus management: dialogs take focus; otherwise restore the focused control.
  var dialogCard = app.querySelector(".modal-card");
  if (dialogCard) {
    var target = dialogCard.querySelector("input, button, select, [href]") || dialogCard;
    target.focus();
    return;
  }
  var prev = V.pendingFkey || null;
  V.pendingFkey = null;
  if (!prev) {
    var act = document.activeElement;
    prev = act && act.getAttribute ? act.getAttribute("data-fkey") : null;
  }
  if (prev) {
    var el = findFkey(app, prev);
    if (el) el.focus();
  }
}

// ── Micro-updates for silent dispatches ──────────────────────────────────────
function updateFloorPlan() {
  var wrap = document.getElementById("floorplan-wrap");
  if (wrap) wrap.innerHTML = U.floorPlanSvg();
}
function updatePowerLabel(apId) {
  var ap = null;
  Store.state.env.aps.forEach(function (a) { if (a.id === apId) ap = a; });
  var label = document.getElementById("pow-label-" + apId);
  if (ap && label) label.innerHTML = U.icon("signal", 12) + " " + ap.id + " transmit power: " + ap.powerMw + " mW";
}
function updateSecurityNote(ssidId) {
  var ssid = null;
  Store.state.env.ssids.forEach(function (x) { if (x.id === ssidId) ssid = x; });
  if (!ssid) return;
  var note = "";
  D.SECURITY_OPTIONS.forEach(function (o) { if (o.value === ssid.security) note = o.note; });
  var el = document.getElementById("secnote-" + ssidId);
  if (el) el.textContent = note;
}
function updateVlanBadge(ssidId) {
  var ssid = null;
  Store.state.env.ssids.forEach(function (x) { if (x.id === ssidId) ssid = x; });
  if (!ssid) return;
  var el = document.getElementById("vlan-badge-" + ssidId);
  if (el) el.textContent = "VLAN: " + (ssid.vlan || "untagged") + " (editable below)";
}
function updateWpsStatus() {
  var el = document.getElementById("wps-status");
  if (el) {
    el.innerHTML = "WPS " + (Store.state.env.wpsEnabled
      ? '<span class="text-brick">ENABLED — vulnerable</span>'
      : '<span class="text-pine">DISABLED</span>');
  }
}
function updateTagRow(beaconId, tag) {
  var row = document.getElementById("beacon-row-" + beaconId);
  if (!row) return;
  var cls = "beacon-row";
  if (tag === "authorized") cls += " tag-authorized";
  else if (tag === "unauthorized") cls += " tag-unauthorized";
  else if (tag === "neighbor") cls += " tag-neighbor";
  row.className = cls;
  var cell = row.querySelector(".tag-cell");
  if (cell) {
    cell.className = "tag-cell" + (tag === "authorized" ? " tag-authorized" : tag === "unauthorized" ? " tag-unauthorized" : tag === "neighbor" ? " tag-neighbor" : "");
  }
}
function updateExamSubmit() {
  var selections = Store.state.answers["QUIZ"] || {};
  var questions = Store.state.mode === "hard" ? D.QUIZ_HARD : D.QUIZ_MEDIUM;
  var ready = questions.every(function (q) { return selections[q.id] !== undefined; });
  var btn = document.getElementById("exam-submit");
  var hint = document.getElementById("exam-hint");
  if (btn) btn.disabled = !ready;
  if (hint) hint.hidden = ready;
}
function updateRadioCardSelection(input) {
  var wrap = input.closest(".radio-cards");
  if (!wrap) return;
  var labels = wrap.querySelectorAll(".radio-card");
  labels.forEach(function (l) { l.classList.remove("selected"); });
  var label = input.closest(".radio-card");
  if (label) label.classList.add("selected");
}

// ── Order list move (targeted re-render + focus restore + announcement) ─────
function orderMove(obj, field, key, dir) {
  var items = U.ORDERLIST_ITEMS_H7;
  var order = U.orderListItems(obj, field, items);
  var i = order.indexOf(key);
  var j = i + dir;
  if (i < 0 || j < 0 || j >= order.length) return;
  var tmp = order[i]; order[i] = order[j]; order[j] = tmp;
  Store.dispatch({ type: "SET_ANSWER", obj: obj, field: field, value: order.join(">") }, { silent: true });
  // Replace the fieldset in place, then keep focus on the same logical button
  // (same item, same direction) when it is still enabled.
  var fieldset = document.querySelector('[data-act="order-move"][data-obj="' + obj + '"]');
  var container = fieldset ? fieldset.closest("fieldset") : null;
  if (container) {
    var tmpDiv = document.createElement("div");
    tmpDiv.innerHTML = U.orderListHtml(obj, field, "Response sequence (use ▲▼ — the sheet arrives genuinely shuffled)", items);
    container.outerHTML = tmpDiv.innerHTML;
  }
  var btn = findFkey(document, "omove-" + key + "-" + (dir === -1 ? "up" : "down"));
  if (btn && btn.disabled) btn = null;
  if (!btn) {
    var fallbackKey = "omove-" + order[Math.max(0, Math.min(order.length - 1, i))] + "-up";
    btn = findFkey(document, fallbackKey);
  }
  if (btn && !btn.disabled) btn.focus();
  var announceLabels = order.map(function (k) {
    var it = null;
    items.forEach(function (x) { if (x.key === k) it = x; });
    return it.label;
  });
  U.announce("Step moved. New order: " + announceLabels.join(", then "));
}

// ── Dialogs: focus trap + escape ─────────────────────────────────────────────
var dialogKeydownInstalled = false;
function installDialogKeydown() {
  if (dialogKeydownInstalled) return;
  dialogKeydownInstalled = true;
  document.addEventListener("keydown", function (e) {
    var open = V.modalOpen || V.resetOpen;
    if (!open) return;
    if (e.key === "Escape") {
      e.preventDefault();
      var openedModal = V.modalOpen;
      var openedReset = V.resetOpen;
      V.modalOpen = false;
      V.resetOpen = false;
      render();
      focusOpener(openedReset ? "reset" : "signoff");
      return;
    }
    if (e.key === "Tab") {
      var card = document.querySelector(".modal-card");
      if (!card) return;
      var focusables = card.querySelectorAll('button, input, select, a[href], [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      } else if (!card.contains(document.activeElement)) {
        e.preventDefault(); first.focus();
      }
    }
  });
}

// ── Bench tabs: arrow-key navigation (parity with Radix Tabs) ────────────────
function installTablistKeys() {
  document.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    var tab = e.target.closest ? e.target.closest(".bench-tab") : null;
    if (!tab) return;
    var tabs = Array.prototype.slice.call(document.querySelectorAll(".bench-tab"));
    var i = tabs.indexOf(tab);
    if (i < 0) return;
    var j = e.key === "ArrowRight" ? (i + 1) % tabs.length : (i - 1 + tabs.length) % tabs.length;
    e.preventDefault();
    tabs[j].focus();
    tabs[j].click();
  });
}

// ── Event delegation ─────────────────────────────────────────────────────────
function onClick(e) {
  var el = e.target.closest ? e.target.closest("[data-act]") : null;
  if (!el) return;
  var act = el.getAttribute("data-act");
  switch (act) {
    case "goto-sheet":
      Store.dispatch({ type: "GOTO", sheet: Number(el.getAttribute("data-i")) });
      render();
      break;
    case "goto-widget":
      Store.dispatch({ type: "GOTO_WIDGET", sheet: Number(el.getAttribute("data-sheet")), tab: el.getAttribute("data-tab") });
      render();
      window.scrollTo(0, 0);
      break;
    case "start":
      Store.start(el.getAttribute("data-mode"));
      render();
      window.scrollTo(0, 0);
      break;
    case "check": {
      var objId = el.getAttribute("data-obj");
      var r = Store.checkObjective(objId);
      V.checkResults[objId] = r;
      U.announce(r.pass ? "Objective " + objId + " passed. " + r.okMsg : "Objective " + objId + " needs review. " + r.failMsg);
      V.pendingFkey = "check-" + objId;
      render();
      break;
    }
    case "hint":
      Store.dispatch({ type: "HINT", obj: el.getAttribute("data-obj") });
      render();
      break;
    case "hint-confirm":
      V.hintConfirming[el.getAttribute("data-obj")] = true;
      render();
      break;
    case "hint-confirm-cancel":
      V.hintConfirming[el.getAttribute("data-obj")] = false;
      render();
      break;
    case "run-guest-test":
      Store.dispatch({ type: "RUN_GUEST_TEST" });
      render();
      break;
    case "factory-guest":
      Store.dispatch({ type: "FACTORY_GUEST" });
      render();
      break;
    case "ref-toggle": {
      var id = el.getAttribute("data-id");
      V.openSection = V.openSection === id ? "" : id;
      render();
      break;
    }
    case "ticket-toggle": {
      var tid = el.getAttribute("data-id");
      V.openTickets[tid] = !V.openTickets[tid];
      render();
      break;
    }
    case "bench-tab":
      Store.dispatch({ type: "GOTO_WIDGET", sheet: 2, tab: el.getAttribute("data-v") });
      render();
      break;
    case "signoff-open":
      V.modalOpen = true;
      render();
      break;
    case "reset-open":
      V.resetOpen = true;
      render();
      break;
    case "reset-cancel":
      V.resetOpen = false;
      render();
      focusOpener("reset");
      break;
    case "reset-confirm":
      V.resetOpen = false;
      V.modalOpen = false;
      Store.dispatch({ type: "RESET" });
      U.announce("Lab reset. Every stamp, answer and configuration has been returned to the pristine state.");
      render();
      break;
    case "modal-close":
      V.modalOpen = false;
      render();
      focusOpener("signoff");
      break;
    case "modal-asbuilt":
      V.modalOpen = false;
      Store.dispatch({ type: "GOTO", sheet: 5 });
      render();
      focusOpener("signoff");
      window.scrollTo(0, 0);
      break;
    case "modal-overlay":
      // Radix Dialog closes on pointer-down outside the card; AlertDialog does
      // not close at all. Clicks inside the card never close either.
      if (el.hasAttribute("data-overlay-alert")) return;
      if (e.target.closest(".modal-card")) return;
      V.modalOpen = false;
      render();
      focusOpener("signoff");
      break;
    case "exam-submit":
      Quiz.submitExam(); // dispatches internally
      render();
      break;
    case "t103-goto":
      Store.dispatch({ type: "GOTO_WIDGET", sheet: 2, tab: Store.state.mode === "hard" ? "desk" : "air" });
      render();
      break;
    case "order-move":
      orderMove(
        el.getAttribute("data-obj"),
        el.getAttribute("data-field"),
        el.getAttribute("data-key"),
        Number(el.getAttribute("data-dir"))
      );
      break;
    default:
      break;
  }
}

function onChange(e) {
  var t = e.target;
  var chg = t.getAttribute && t.getAttribute("data-chg");
  if (!chg) return;
  var parts = chg.split(":");
  var kind = parts[0];

  if (kind === "answer") { // SET_ANSWER (match boards + radio cards)
    var obj = parts[1], field = parts[2], value = t.value;
    Store.dispatch({ type: "SET_ANSWER", obj: obj, field: field, value: value }, { silent: true });
    if (t.type === "radio") updateRadioCardSelection(t);
    return;
  }
  if (kind === "toggle") { // TOGGLE_ANSWER_VALUE (check groups)
    Store.dispatch({
      type: "TOGGLE_ANSWER_VALUE",
      obj: parts[1], field: parts[2], value: parts[3], on: t.checked,
    }, { silent: true });
    return;
  }
  if (kind === "ssid") { // PATCH_SSID
    var ssidId = parts[1], ssidField = parts[2];
    var patch = {};
    if (ssidField === "hidden" || ssidField === "isolation" || ssidField === "portal") patch[ssidField] = t.checked;
    else if (ssidField === "rateLimitMbps") patch[ssidField] = Number(t.value);
    else patch[ssidField] = t.value;
    Store.dispatch({ type: "PATCH_SSID", id: ssidId, patch: patch }, { silent: true });
    if (ssidField === "security") updateSecurityNote(ssidId);
    if (ssidField === "vlan") updateVlanBadge(ssidId);
    if (ssidField === "authType") { render(); } // RADIUS fields appear/disappear
    return;
  }
  if (kind === "wps") {
    Store.dispatch({ type: "SET_WPS", enabled: t.checked }, { silent: true });
    updateWpsStatus();
    return;
  }
  if (kind === "ap") { // PATCH_AP: slotId / kind / antenna
    var apId = parts[1], apField = parts[2];
    var apPatch = {};
    if (apField === "slotId") apPatch.slotId = t.value === "none" ? null : t.value;
    else apPatch[apField] = t.value;
    Store.dispatch({ type: "PATCH_AP", id: apId, patch: apPatch }, { silent: true });
    updateFloorPlan();
    return;
  }
  if (kind === "radio") { // PATCH_RADIO: channel / widthMhz
    var rAp = parts[1], band = parts[2], rField = parts[3];
    var rPatch = {};
    if (rField === "channel") rPatch.channel = t.value === "none" ? null : Number(t.value);
    else rPatch[rField] = Number(t.value);
    Store.dispatch({ type: "PATCH_RADIO", id: rAp, band: band, patch: rPatch }, { silent: true });
    updateFloorPlan();
    return;
  }
  if (kind === "tag") { // TAG_BEACON — 'none' also dispatched, exactly like the original
    Store.dispatch({ type: "TAG_BEACON", id: parts[1], tag: t.value }, { silent: true });
    updateTagRow(parts[1], t.value === "none" ? undefined : t.value);
    return;
  }
  if (kind === "quiz") { // exam radio
    Store.dispatch({ type: "SET_ANSWER", obj: "QUIZ", field: parts[1], value: t.value }, { silent: true });
    updateExamSubmit();
    return;
  }
}

function onInput(e) {
  var t = e.target;
  var inp = t.getAttribute && t.getAttribute("data-input");
  if (!inp) return;
  var parts = inp.split(":");
  if (parts[0] === "ssid") { // PATCH_SSID text fields (name, radiusHost, radiusPort, vlan)
    var patch = {};
    patch[parts[2]] = t.value;
    Store.dispatch({ type: "PATCH_SSID", id: parts[1], patch: patch }, { silent: true });
    if (parts[2] === "vlan") updateVlanBadge(parts[1]);
    return;
  }
  if (parts[0] === "power") { // PATCH_AP transmit power slider
    Store.dispatch({ type: "PATCH_AP", id: parts[1], patch: { powerMw: Number(t.value) } }, { silent: true });
    updatePowerLabel(parts[1]);
    updateFloorPlan();
    return;
  }
  if (parts[0] === "answer") { // SET_ANSWER text input (BSSID card)
    Store.dispatch({ type: "SET_ANSWER", obj: parts[1], field: parts[2], value: t.value }, { silent: true });
    return;
  }
}

// ── Bootstrap ────────────────────────────────────────────────────────────────
function boot() {
  U.installLiveRegion();
  document.addEventListener("click", onClick);
  document.addEventListener("change", onChange);
  document.addEventListener("input", onInput);
  installDialogKeydown();
  installTablistKeys();
  Store.hydrate();
  render();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
