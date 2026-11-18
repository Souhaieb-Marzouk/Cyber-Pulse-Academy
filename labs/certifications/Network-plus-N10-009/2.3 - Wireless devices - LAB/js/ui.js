// ── ui.js — rendering helpers, components, and all lab views ────────────────
// Vanilla re-implementation of the original React component tree:
// same structure, same copy, same ARIA, same interactions. Data in js/data.js,
// logic in js/state.js + js/objectives.js. Only what changes re-renders:
// text inputs dispatch "silent" state updates, structural actions re-render
// with focus restoration via data-fkey keys.
"use strict";

var D = window.LabData;
var OBJ = window.LabObjectives;
var Store = window.LabStore;
var Icons = window.LabIcons;

// ── Helpers ──────────────────────────────────────────────────────────────────
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function icon(name, size, cls, opts) { return Icons.icon(name, size, cls, opts); }

// Screen-reader announcement bus (identical to the original)
function announce(msg) {
  window.dispatchEvent(new CustomEvent("lab-announce", { detail: msg }));
}
function installLiveRegion() {
  var div = document.createElement("div");
  div.setAttribute("aria-live", "polite");
  div.setAttribute("aria-atomic", "true");
  div.className = "sr-only";
  div.id = "lab-live-region";
  document.body.appendChild(div);
  window.addEventListener("lab-announce", function (e) {
    div.textContent = e.detail;
  });
}

// ── Module (view) state — mirrors the original React component-local state ──
var viewState = {
  openSection: "why",        // Sheet 02 accordion (resets per mount, like useState("why"))
  openTickets: {},           // Air bay ticket cards
  modalOpen: false,          // Completion modal (TitleBlock state)
  resetOpen: false,          // Reset AlertDialog (TitleBlock state)
  hintConfirming: {},        // Hard-mode nudge confirm (HintBlock state)
  checkResults: {},          // ObjectiveCheck local results (per mount)
  lastSheetKey: null,        // "sheet:benchTab" — detects remounts
};

function resetMountedViewState() {
  viewState.openSection = "why";
  viewState.openTickets = {};
  viewState.hintConfirming = {};
  viewState.checkResults = {};
}

// ── Widget navigation targets (identical map) ───────────────────────────────
var WIDGET_TARGET = {
  "band-board": { sheet: 2, tab: "plan" },
  "rack": { sheet: 2, tab: "rack" },
  "plan": { sheet: 2, tab: "plan" },
  "analyzer": { sheet: 2, tab: "air" },
  "ticket-t101": { sheet: 2, tab: "air" },
  "ticket-t102": { sheet: 2, tab: "air" },
  "net-types": { sheet: 1, tab: "" },
  "standards-match": { sheet: 1, tab: "" },
  "legacy-desk": { sheet: 2, tab: "desk" },
  "incident-card": { sheet: 2, tab: "desk" },
  "bonding-desk": { sheet: 2, tab: "desk" },
  "response-planner": { sheet: 2, tab: "desk" },
  "tradeoff-desk": { sheet: 2, tab: "desk" },
};
function widgetTarget(objId) {
  var obj = OBJ.findObjective(objId);
  if (!obj || !obj.widget) return null;
  return WIDGET_TARGET[obj.widget] || null;
}

// Where-to-look button label (identical logic)
function targetLabel(t) {
  if (t.sheet === 1) return "Sheet 02";
  if (t.tab === "plan") return "Bay: RF PLAN";
  if (t.tab === "rack") return "Bay: CONFIG RACK";
  if (t.tab === "air") return "Bay: AIR ANALYZER";
  return "Bay: RESPONSE DESK";
}

// ── Small building blocks ────────────────────────────────────────────────────
function refLink(href, labelHtml) {
  return '<a href="' + esc(href) + '" target="_blank" rel="noopener noreferrer" class="ref-link">' +
    labelHtml + icon("external-link", 12) + "</a>";
}

function pillarBadge(pillar) {
  var meta = D.PILLAR_META[pillar];
  return '<span class="lab-mono pillar-badge ' + (meta ? meta.cls : "") + '">' + pillar + " · " +
    (meta ? meta.label : pillar) + "</span>";
}

// Inline jargon tooltip: dotted-underline button; tooltip shown on hover/focus
function term(t, childrenHtml) {
  var def = D.INLINE_TERMS[t];
  if (!def) return childrenHtml != null ? childrenHtml : esc(t);
  return '<button type="button" class="term-dot" aria-label="' + esc(t + ": " + def) + '">' +
    (childrenHtml != null ? childrenHtml : esc(t)) +
    '<span class="term-tip" role="tooltip"><span class="lab-mono term-tip-name">' + esc(t) + "</span> — " + esc(def) + "</span>" +
    "</button>";
}

function selectHtml(opts) {
  // opts: {id, aria, value, options:[{v,l}], dataChg, cls, fkey}
  var cls = "lab-select" + (opts.cls ? " " + opts.cls : "");
  var html = '<select id="' + esc(opts.id || "") + '" class="' + cls + '"' +
    (opts.aria ? ' aria-label="' + esc(opts.aria) + '"' : "") +
    (opts.dataChg ? ' data-chg="' + esc(opts.dataChg) + '"' : "") +
    (opts.fkey ? ' data-fkey="' + esc(opts.fkey) + '"' : "") + ">";
  for (var i = 0; i < opts.options.length; i++) {
    var o = opts.options[i];
    html += '<option value="' + esc(o.v) + '"' + (String(opts.value) === String(o.v) ? " selected" : "") + ">" + o.l + "</option>";
  }
  html += "</select>";
  return html;
}

// ── Answer widgets (state-backed) ────────────────────────────────────────────
function matchBoard(obj, items, options, label) {
  var answers = Store.state.answers[obj] || {};
  var rows = items.map(function (it) {
    var val = answers[it.key] || "";
    return '<div class="match-row">' +
      '<label for="' + esc(obj + "-" + it.key) + '" class="match-label">' + esc(it.label) + "</label>" +
      selectHtml({
        id: obj + "-" + it.key, aria: obj + " " + it.key, value: val,
        options: [{ v: "", l: "Choose…" }].concat(options.map(function (o) { return { v: o.value, l: o.label }; })),
        dataChg: "answer:" + obj + ":" + it.key,
      }) +
      "</div>";
  }).join("");
  return '<fieldset class="match-board"><legend class="lab-kicker mb-1">' + esc(label) + "</legend>" + rows + "</fieldset>";
}

function checkGroup(obj, field, label, options) {
  var selected = ((Store.state.answers[obj] || {})[field] || "").split("|").filter(Boolean);
  var rows = options.map(function (o) {
    return '<label class="check-row">' +
      '<input type="checkbox" data-chg="toggle:' + esc(obj) + ":" + esc(field) + ":" + esc(o.value) + '"' +
      (selected.indexOf(o.value) !== -1 ? " checked" : "") +
      ' aria-label="' + esc(obj + " " + field + " " + o.value) + '">' +
      "<span>" + esc(o.label) + "</span></label>";
  }).join("");
  return '<fieldset><legend class="lab-kicker mb-2">' + esc(label) + "</legend>" +
    '<div class="check-list">' + rows + "</div></fieldset>";
}

function radioCards(obj, field, label, options, columns) {
  var current = (Store.state.answers[obj] || {})[field] || "";
  var cards = options.map(function (o) {
    var sel = current === o.value;
    return '<label class="radio-card' + (sel ? " selected" : "") + (columns ? " col" : "") + '">' +
      '<input type="radio" name="' + esc(obj + "-" + field) + '" value="' + esc(o.value) + '"' +
      (sel ? " checked" : "") + ' data-chg="answer:' + esc(obj) + ":" + esc(field) + '"' +
      ' aria-label="' + esc(obj + " " + field + " " + o.value) + '">' +
      "<span><span class=\"radio-card-label\">" + esc(o.label) + "</span>" +
      (o.note ? '<span class="radio-card-note">' + esc(o.note) + "</span>" : "") +
      "</span></label>";
  }).join("");
  return '<fieldset><legend class="lab-kicker mb-2">' + esc(label) + "</legend>" +
    '<div class="radio-cards' + (columns ? " cols" : "") + '">' + cards + "</div></fieldset>";
}

var ORDERLIST_ITEMS_H7 = [
  { key: "diff", label: "Diff beacons against the controller inventory" },
  { key: "remove", label: "Remove / block the device" },
  { key: "survey", label: "Survey the spectrum for the transmitter" },
  { key: "validate", label: "Validate the air is clean afterwards" },
  { key: "triangulate", label: "Triangulate its position by RSSI" },
];

function orderListItems(obj, field, items) {
  var savedRaw = (Store.state.answers[obj] || {})[field] || "";
  var base = items.map(function (i) { return i.key; });
  var saved = savedRaw.split(">").filter(Boolean);
  var seen = {};
  var order = [];
  saved.concat(base).forEach(function (k) {
    if (base.indexOf(k) !== -1 && !seen[k]) { seen[k] = true; order.push(k); }
  });
  return order;
}

function orderListHtml(obj, field, label, items) {
  var order = orderListItems(obj, field, items);
  var rows = order.map(function (k, i) {
    var it = null;
    items.forEach(function (x) { if (x.key === k) it = x; });
    return '<li class="order-item" data-okey="' + esc(k) + '">' +
      '<span class="order-num lab-mono">' + (i + 1) + "</span>" +
      '<span class="order-label">' + esc(it.label) + "</span>" +
      '<span class="order-btns">' +
      '<button type="button" class="btn btn-ghost btn-icon" data-act="order-move" data-obj="' + esc(obj) + '" data-field="' + esc(field) + '" data-key="' + esc(k) + '" data-dir="-1"' +
      (i === 0 ? " disabled" : "") + ' data-fkey="omove-' + esc(k) + '-up" aria-label="Move up: ' + esc(it.label) + '">' + icon("chevron-up", 16) + "</button>" +
      '<button type="button" class="btn btn-ghost btn-icon" data-act="order-move" data-obj="' + esc(obj) + '" data-field="' + esc(field) + '" data-key="' + esc(k) + '" data-dir="1"' +
      (i === order.length - 1 ? " disabled" : "") + ' data-fkey="omove-' + esc(k) + '-down" aria-label="Move down: ' + esc(it.label) + '">' + icon("chevron-down", 16) + "</button>" +
      "</span></li>";
  }).join("");
  return '<fieldset><legend class="lab-kicker mb-2">' + esc(label) + "</legend>" +
    '<ol class="order-list">' + rows + "</ol></fieldset>";
}

// Genuinely shuffle the order list once per mount if no saved answer (R6)
function ensureOrderShuffled(obj, field, items) {
  var savedRaw = (Store.state.answers[obj] || {})[field] || "";
  if (savedRaw) return;
  var base = items.map(function (i) { return i.key; });
  var shuffled = base.slice();
  var identity;
  do {
    for (var i = shuffled.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = tmp;
    }
    identity = shuffled.every(function (k, i2) { return k === base[i2]; });
  } while (identity);
  Store.dispatch({ type: "SET_ANSWER", obj: obj, field: field, value: shuffled.join(">") }, { silent: true });
}

// ── ObjectiveCheck: inline rubber stamp (identical behavior) ─────────────────
function objectiveCheck(objId) {
  var s = Store.state;
  var obj = OBJ.findObjective(objId);
  if (!obj || obj.mode !== s.mode) return "";
  var prog = s.objectives[objId];
  var target = obj.widget ? WIDGET_TARGET[obj.widget] : null;
  var result = viewState.checkResults[objId] || null;

  var html = '<div class="objcheck">' +
    '<div class="objcheck-head">' +
    '<span class="lab-mono inspect-label">INSPECT · ' + esc(objId) + "</span>";
  if (target) {
    html += '<button type="button" class="btn btn-ghost btn-xs text-signal" data-act="goto-widget" data-sheet="' + target.sheet + '" data-tab="' + esc(target.tab) + '" data-fkey="where-' + esc(objId) + '" aria-label="WHERE ' + esc(objId) + '">' +
      icon("map-pin", 12) + " Where to look</button>";
  }
  html += '<span class="grow"></span>' +
    '<button type="button" class="btn btn-ink btn-check" data-act="check" data-obj="' + esc(objId) + '" data-fkey="check-' + esc(objId) + '" aria-label="CHECK ' + esc(objId) + ' RESULTS">' +
    icon("send", 14) + " CHECK RESULTS</button>" +
    "</div>";
  if (prog && prog.passed) {
    html += '<p class="lab-mono stamped-line">✓ STAMPED PASS' + (prog.attempts > 1 ? " · attempts: " + prog.attempts : " · first attempt") + "</p>";
  }
  if (result) {
    html += '<div class="' + (result.pass ? "result-pass" : "result-fail") + '">' +
      '<span class="lab-mono result-stamp ' + (result.pass ? "lab-stamp-pass" : "lab-stamp-review") + '">' + (result.pass ? "PASS" : "REVIEW") + "</span>" +
      esc(result.pass ? result.okMsg : result.failMsg) +
      "</div>";
  }
  html += "</div>";
  return html;
}

// ── Floor plan SVG (exact geometry) ──────────────────────────────────────────
function ringRadius(powerMw, band) {
  return Math.min(132, Math.round((28 + (powerMw / 500) * 64) * D.BAND_FACTOR[band]));
}
function floorPlanSvg() {
  var aps = Store.state.env.aps;
  var zones = D.PLAN_ZONES.map(function (z) {
    return '<g><rect x="' + z.x + '" y="' + z.y + '" width="' + z.w + '" height="' + z.h + '" fill="#F4EFE2" stroke="#2A2A24" stroke-width="1" stroke-opacity="0.5"></rect>' +
      '<text x="' + (z.x + 10) + '" y="' + (z.y + 18) + '" font-size="11" fill="#6B675C" class="lab-mono" style="letter-spacing:0.12em">' + esc(z.label) + "</text></g>";
  }).join("");
  var shelves = [330, 355, 380, 405, 430].map(function (y) {
    return '<line x1="60" y1="' + y + '" x2="250" y2="' + y + '" stroke="#2A2A24" stroke-opacity="0.35" stroke-width="5" stroke-linecap="round"></line>';
  }).join("");
  var slots = D.PLAN_SLOTS.map(function (s) {
    return '<g><circle cx="' + s.x + '" cy="' + s.y + '" r="9" fill="none" stroke="#2A2A24" stroke-width="1.4"></circle>' +
      '<line x1="' + (s.x - 14) + '" y1="' + s.y + '" x2="' + (s.x + 14) + '" y2="' + s.y + '" stroke="#2A2A24" stroke-width="0.8" stroke-opacity="0.5"></line>' +
      '<line x1="' + s.x + '" y1="' + (s.y - 14) + '" x2="' + s.x + '" y2="' + (s.y + 14) + '" stroke="#2A2A24" stroke-width="0.8" stroke-opacity="0.5"></line>' +
      '<text x="' + (s.x + 12) + '" y="' + (s.y - 12) + '" font-size="10.5" fill="#2A2A24" class="lab-mono" font-weight="700">' + s.id + "</text></g>";
  }).join("");
  var markers = aps.filter(function (a) { return a.slotId; }).map(function (a) {
    var slot = null;
    D.PLAN_SLOTS.forEach(function (s) { if (s.id === a.slotId) slot = s; });
    var rings = a.bands.map(function (b) {
      var radio = a.radios[b];
      if (!radio) return "";
      return '<circle cx="' + slot.x + '" cy="' + slot.y + '" r="' + ringRadius(a.powerMw, b) +
        '" fill="' + D.BAND_COLOR[b] + '" fill-opacity="0.05" stroke="' + D.BAND_COLOR[b] +
        '" stroke-opacity="0.55" stroke-width="1.6"' +
        (radio.channel === null ? ' stroke-dasharray="3 4"' : "") + "></circle>";
    }).join("");
    return "<g>" + rings +
      '<rect x="' + (slot.x - 17) + '" y="' + (slot.y - 8) + '" width="34" height="16" rx="2" fill="#2A2A24"></rect>' +
      '<text x="' + slot.x + '" y="' + (slot.y + 3.5) + '" font-size="9.5" fill="#F7F3E8" text-anchor="middle" class="lab-mono">' + a.id + "</text></g>";
  }).join("");
  return '<svg viewBox="0 0 820 570" role="img" aria-label="Floor plan of Northwind Regional Library with access point placement and coverage rings" class="floor-plan">' +
    '<rect x="20" y="20" width="760" height="450" fill="none" stroke="#2A2A24" stroke-width="2.5"></rect>' +
    zones + shelves +
    '<line x1="560" y1="450" x2="760" y2="450" stroke="#0F766E" stroke-width="5"></line>' +
    '<text x="576" y="442" font-size="10" fill="#0F766E" class="lab-mono">GLASS · TERRACE SIDE</text>' +
    '<line x1="660" y1="150" x2="660" y2="200" stroke="#2A2A24" stroke-width="2" stroke-dasharray="6 5"></line>' +
    '<rect x="20" y="490" width="760" height="60" fill="#EFE9D8" stroke="#2A2A24" stroke-opacity="0.3" stroke-dasharray="4 4"></rect>' +
    '<text x="34" y="525" font-size="12" fill="#6B675C" class="lab-mono" style="letter-spacing:0.14em">PARKING LOT B</text>' +
    slots + markers + "</svg>";
}

window.LabUI = {
  esc: esc, icon: icon, announce: announce, installLiveRegion: installLiveRegion,
  refLink: refLink, pillarBadge: pillarBadge, term: term, selectHtml: selectHtml,
  matchBoard: matchBoard, checkGroup: checkGroup, radioCards: radioCards,
  objectiveCheck: objectiveCheck, floorPlanSvg: floorPlanSvg, widgetTarget: widgetTarget,
  targetLabel: targetLabel, ringRadius: ringRadius, viewState: viewState,
  resetMountedViewState: resetMountedViewState,
  ORDERLIST_ITEMS_H7: ORDERLIST_ITEMS_H7,
  orderListHtml: orderListHtml, ensureOrderShuffled: ensureOrderShuffled,
  orderListItems: orderListItems,
};
