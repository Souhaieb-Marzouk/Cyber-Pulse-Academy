/* ============================================================================
 * CyberLab — The Documentation Drafting Room (STATIC PORT)
 * js/ui.js — icons, shared UI primitives, app chrome and the three full-screen
 *   screens (mode select / briefing / archive+quiz+notes).
 *   1:1 port of src/components/lab/ui-bits.tsx, LabRoot.tsx and screens.tsx.
 * Rendering model: pure template-string renderers driven by js/app.js.
 * ========================================================================= */
(function () {
  "use strict";

  var D = window.LabData;
  var Store = window.LabStore;

  /* ================================================================ ICONS
   * Inline Lucide SVGs — exact geometry copied from lucide-static v0.462.0
   * (the same icon set the original imports from lucide-react).
   * ====================================================================== */

  var ICON_PATHS = {
    Map: '<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/>',
    Server: '<rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/>',
    Cable: '<path d="M17 21v-2a1 1 0 0 1-1-1v-1a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1"/><path d="M19 15V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V9"/><path d="M21 21v-2h-4"/><path d="M3 5h4V3"/><path d="M7 5a1 1 0 0 1 1 1v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1V3"/>',
    Network: '<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/>',
    ClipboardList: '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
    MapPin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    FileSignature: '<path d="M20 5V3a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h8"/><path d="M8 18h1"/><path d="M12 18h1"/><path d="M17.5 11.5a1.5 1.5 0 0 0-3 0v2a1.5 1.5 0 0 1-3 0V12a1.5 1.5 0 0 0-3 0v1"/><path d="M16 17h6"/><path d="M22 19h1"/><path d="M14 19h1"/><path d="M18 21h1"/><path d="M21 21h1"/>',
    Wifi: '<path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.859a10 10 0 0 1 14 0"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/>',
    BookMarked: '<path d="M10 2v8l3-3 3 3V2"/><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/>',
    Library: '<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>',
    HelpCircle: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    NotebookPen: '<path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"/><path d="M2 6h4"/><path d="M2 10h4"/><path d="M2 14h4"/><path d="M2 18h4"/><path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/>',
    Stamp: '<path d="M5 22h14"/><path d="M19.27 13.73A2.5 2.5 0 0 0 17.5 13h-11A2.5 2.5 0 0 0 4 15.5V17a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1.5c0-.66-.26-1.3-.73-1.77Z"/><path d="M14 13V8.5C14 7 15 7 15 5a3 3 0 0 0-3-3c-1.66 0-3 1-3 3s1 2 1 3.5V13"/>',
    Lightbulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
    CheckCheck: '<path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/>',
    RotateCcw: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    CheckCircle2: '<path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/>',
    Circle: '<circle cx="12" cy="12" r="10"/>',
    X: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    Trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
    Star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
    GraduationCap: '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
    Flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    ArrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    XCircle: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
    ExternalLink: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    ShieldAlert: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
    ShieldCheck: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  };

  /** Render a Lucide icon inline. opts: {cls, filled, label} */
  function icon(name, opts) {
    opts = opts || {};
    var body = ICON_PATHS[name] || ICON_PATHS.ClipboardList;
    var fill = opts.filled ? ' fill="currentColor"' : ' fill="none"';
    var cls = opts.cls ? ' class="' + opts.cls + '"' : "";
    var aria = opts.label
      ? ' role="img" aria-label="' + escAttr(opts.label) + '"'
      : ' aria-hidden="true"';
    return '<svg' + cls + ' viewBox="0 0 24 24"' + fill +
      ' stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"' +
      aria + ">" + body + "</svg>";
  }

  /* ============================================================== helpers */

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function escAttr(s) {
    return esc(s).replace(/"/g, "&quot;");
  }

  function pillarBadge(p) {
    var meta = D.PILLAR_META[p];
    return '<span class="mono-label pillar-badge ' + meta.cls + '" title="' + escAttr(meta.name) + '">' +
      meta.short + " · " + esc(meta.name) + "</span>";
  }

  /**
   * The ink-outline button. variant: default | accent | teal
   * html: inner markup; act: data-action; extra: extra attributes string
   */
  function inkButton(opts) {
    var cls = "btn btn-" + (opts.variant || "default") + (opts.cls ? " " + opts.cls : "");
    return '<button type="button" class="focus-ink ' + cls + '"' +
      (opts.act ? ' data-action="' + opts.act + '"' : "") +
      (opts.data || "") +
      (opts.ariaLabel ? ' aria-label="' + escAttr(opts.ariaLabel) + '"' : "") +
      (opts.disabled ? " disabled" : "") + ">" + (opts.html || "") + "</button>";
  }

  function passStamp(label) {
    return '<span class="stamp stamp-pass" role="img" aria-label="' + escAttr(label || "Verified") + ' stamp">' +
      icon("Stamp", { cls: "icon-12" }) + " " + esc(label || "Verified") + "</span>";
  }

  /* Shared small components ---------------------------------------------- */

  function discoveryNote(title, lines) {
    return '<div class="discovery-note" role="region" aria-label="' + escAttr(title) + '">' +
      '<p class="mono-label note-title">' + esc(title) + "</p>" +
      "<pre>" + esc(lines.join("\n")) + "</pre></div>";
  }

  function fieldLabel(label, hint) {
    return '<span class="mono-label field-label">' + esc(label) + "</span>" +
      (hint ? '<span class="field-hint">' + esc(hint) + "</span>" : "");
  }

  /** Select picker. path: state path for the generic set-field action. */
  function picker(opts) {
    var value = opts.value == null ? "" : opts.value;
    var field =
      '<div class="select-wrap"><select class="field-control focus-ink" data-action="set-field"' +
      ' data-path="' + escAttr(opts.path) + '" data-fkey="' + escAttr(opts.path) + '"' +
      (opts.ariaLabel ? ' aria-label="' + escAttr(opts.ariaLabel) + '"' : ' aria-label="' + escAttr(opts.label) + '"') +
      ">" +
      '<option value="" disabled' + (value === "" ? " selected" : "") + ">" +
      esc(opts.placeholder || "— select —") + "</option>" +
      opts.options
        .map(function (o) {
          var sel = o.value === value ? " selected" : "";
          return '<option value="' + escAttr(o.value) + '"' + sel + ">" + esc(o.label) + "</option>";
        })
        .join("") +
      "</select></div>";
    return '<label class="field">' + fieldLabel(opts.label, opts.hint) + field + "</label>";
  }

  /** Text input. Silent-save on keystroke (no visible state depends on it). */
  function textInput(opts) {
    return '<label class="field">' + fieldLabel(opts.label, opts.hint) +
      '<input type="text" class="field-control focus-ink" data-field="' + escAttr(opts.path) + '"' +
      ' data-fkey="' + escAttr(opts.path) + '" value="' + escAttr(opts.value == null ? "" : opts.value) + '"' +
      (opts.placeholder ? ' placeholder="' + escAttr(opts.placeholder) + '"' : "") +
      (opts.ariaLabel ? ' aria-label="' + escAttr(opts.ariaLabel) + '"' : "") +
      "></label>";
  }

  /** Tiered hint reveal (Medium: 3 levels; Hard: one costly nudge). */
  function hintBox(objectiveId, mode) {
    var set = D.HINTS[mode][objectiveId];
    if (!set) return "";
    var s = Store.state;
    var result = s.objectives[objectiveId];
    var level = result ? result.hintLevel : 0;
    var max = mode === "hard" ? 1 : 3;
    var label =
      mode === "hard"
        ? "One costly nudge · used this audit: " + s.hintsUsed
        : "Hint ledger (" + level + "/" + max + ")";
    var list =
      level > 0
        ? '<ul class="hint-list" aria-live="polite">' +
          set.slice(0, level)
            .map(function (h, i) {
              return '<li><span class="mono-label hint-level">L' + (i + 1) + "</span>" + esc(h) + "</li>";
            })
            .join("") + "</ul>"
        : "";
    var warn =
      mode === "hard" && level === 0
        ? '<p class="hint-warn">A nudge here is visible in your final rating (−0.5 star).</p>'
        : "";
    return (
      '<div class="hint-box">' +
      '<div class="hint-head"><p class="mono-label">' + esc(label) + "</p>" +
      '<button type="button" class="focus-ink hint-btn" data-action="hint" data-obj="' + objectiveId + '"' +
      (level >= max || (result && result.passed) ? " disabled" : "") + ">" +
      icon("Lightbulb", { cls: "icon-14" }) +
      (level >= max ? "None left" : "Reveal hint") + "</button></div>" +
      list + warn + "</div>"
    );
  }

  /** CHECK RESULTS row: button + stamp + attempt counter + feedback + hints. */
  function checkRow(objectiveId) {
    var s = Store.state;
    var mode = s.mode;
    if (!mode) return "";
    var result = s.objectives[objectiveId];
    var passed = !!(result && result.passed);
    var attemptLine =
      result && !passed
        ? '<span class="mono-label attempt-line">attempt ' + result.attempts + " · not yet</span>"
        : "";
    var feedback =
      result && result.lastFeedback
        ? '<p class="feedback ' + (passed ? "feedback-pass" : "feedback-fail") + '">' +
          esc(result.lastFeedback) + "</p>"
        : "";
    return (
      '<div><div class="check-row">' +
      inkButton({
        variant: passed ? "teal" : "accent",
        act: "check",
        data: ' data-obj="' + objectiveId + '"',
        ariaLabel: "Check results for objective " + objectiveId,
        html: '<span class="btn-inner">' + icon("CheckCheck", { cls: "icon-16" }) +
          (passed ? "Re-check" : "Check results") + "</span>",
      }) +
      (passed ? passStamp("Passed") : "") +
      attemptLine +
      "</div>" +
      '<div aria-live="polite">' + feedback + "</div>" +
      (!passed ? hintBox(objectiveId, mode) : "") +
      "</div>"
    );
  }

  /** Work order card: objective + pillar + context + interaction + CHECK engine. */
  function workOrder(objectiveId, opts) {
    opts = opts || {};
    var mode = Store.state.mode;
    var objs = Store.currentObjectives(Store.state);
    var def = null;
    for (var i = 0; i < objs.length; i++) if (objs[i].id === objectiveId) def = objs[i];
    if (!def || !mode) return "";
    return (
      '<article class="work-order" aria-label="Work order ' + def.id + '">' +
      '<div class="wo-head"><span class="mono-label wo-id">' + def.id + "</span>" +
      pillarBadge(def.pillar) +
      '<span class="mono-label wo-anchor">' + esc(def.anchor) + "</span></div>" +
      '<p class="serif-head wo-title">' + esc(def.title) + "</p>" +
      (opts.context ? '<div class="wo-context">' + opts.context + "</div>" : "") +
      (opts.children ? '<div class="wo-children">' + opts.children + "</div>" : "") +
      '<div class="wo-check">' + checkRow(objectiveId) + "</div>" +
      "</article>"
    );
  }

  /** Framed document sheet (Sheets 01–09). */
  function sheetFrame(sheetNo, title, purpose, iconName, body) {
    return (
      '<section class="sheet-card sheet-frame" aria-label="Sheet ' + sheetNo + ": " + escAttr(title) + '">' +
      '<header class="sheet-head"><div class="sheet-head-main">' +
      '<span class="sheet-icon" aria-hidden="true">' + icon(iconName, { cls: "icon-20" }) + "</span>" +
      "<div><p class=\"mono-label sheet-kicker\">Sheet " + sheetNo +
      " · Harborline Freight HQ · Rev A · TRAINING DATA</p>" +
      '<h2 class="serif-head sheet-title">' + esc(title) + "</h2>" +
      '<p class="sheet-purpose">' + esc(purpose) + "</p></div></div></header>" +
      '<div class="sheet-body">' + body + "</div></section>"
    );
  }

  /* ======================================================== CHROME (root) */

  var SHEET_LABEL = {};
  D.SHEETS.concat(D.AUX_SHEETS).forEach(function (s) {
    SHEET_LABEL[s.id] = s;
  });

  function sheetAllPassed(state, sheetId) {
    var objs = Store.currentObjectives(state).filter(function (o) { return o.sheet === sheetId; });
    return (
      objs.length > 0 &&
      objs.every(function (o) {
        return state.objectives[o.id] && state.objectives[o.id].passed;
      })
    );
  }

  function drawerTab(state, id) {
    var meta = SHEET_LABEL[id];
    var active = state.view === id;
    var allPassed = sheetAllPassed(state, id);
    return (
      '<button type="button" class="focus-ink tab-file' + (allPassed ? " tab-passed" : "") + '"' +
      ' data-action="set-view" data-view="' + id + '"' +
      ' data-active="' + active + '"' +
      (active ? ' aria-current="page"' : "") + ">" +
      icon(meta.icon, { cls: "icon-16 tab-icon" + (active ? " tab-icon-active" : "") }) +
      '<span class="tab-text">' + esc(meta.tabShort) + "</span>" +
      (allPassed
        ? icon("Stamp", { cls: "icon-14 tab-stamp", label: "sheet verified" })
        : "") +
      "</button>"
    );
  }

  function checklistContent(state, mobile) {
    var objs = Store.currentObjectives(state);
    var prog = Store.objectiveProgress(state);
    var qPass = Store.quizPassed(state);
    var quizTxt = state.quiz.submitted
      ? state.quiz.correct + "/" + state.quiz.total + (qPass ? " ✓" : " ✗")
      : "pending";
    var items = objs
      .map(function (o) {
        var res = state.objectives[o.id];
        var active = state.view === o.sheet;
        var cls = res && res.passed ? "obj-passed" : active ? "obj-active" : "obj-idle";
        return (
          '<li><button type="button" class="focus-ink obj-item ' + cls + '"' +
          ' data-action="set-view" data-view="' + o.sheet + '"' +
          (mobile ? ' data-close-checklist="1"' : "") +
          (active ? ' aria-current="true"' : "") + ">" +
          '<span class="obj-line">' +
          (res && res.passed
            ? icon("CheckCircle2", { cls: "icon-14 obj-check" })
            : icon("Circle", { cls: "icon-14 obj-circle" })) +
          '<span class="mono-label obj-id">' + o.id + "</span>" +
          pillarBadge(o.pillar) +
          "</span>" +
          '<span class="obj-title">' + esc(o.title) + "</span>" +
          "</button></li>"
        );
      })
      .join("");
    return (
      '<div class="checklist">' +
      '<div class="checklist-head">' +
      '<p class="mono-label text-muted">Inspector’s checklist</p>' +
      '<p class="serif-head checklist-count">' + prog.done + "/" + prog.total + " work orders verified</p>" +
      '<div class="progress" role="img" aria-label="Objective progress">' +
      '<div class="progress-fill" style="width:' + (prog.done / Math.max(prog.total, 1)) * 100 + '%"></div></div>' +
      '<p class="mono-label checklist-stats"><span>Hints used: ' + state.hintsUsed + "</span><span>Quiz: " + quizTxt + "</span></p>" +
      "</div>" +
      '<ol class="checklist-list slim-scroll" data-scroll-keep="checklist">' + items + "</ol>" +
      "</div>"
    );
  }

  function renderHeader(state) {
    var prog = Store.objectiveProgress(state);
    var activeLabel = SHEET_LABEL[state.view];
    return (
      '<header class="topbar" role="banner"><div class="topbar-row">' +
      '<div class="titleblock-cell"><p class="mono-label text-muted">Project</p>' +
      '<p class="serif-head tb-title">' + esc(D.LAB_TITLE) + "</p></div>" +
      '<div class="titleblock-cell hide-sm"><p class="mono-label text-muted">Objective</p>' +
      '<p class="tb-sub">' + esc(D.LAB_SUBTITLE) + "</p></div>" +
      '<div class="titleblock-cell hide-md"><p class="mono-label text-muted">Mode</p>' +
      '<p class="tb-mode">' + (state.mode === "hard" ? "HARD · AUDIT TRIAL" : "MEDIUM · APPRENTICESHIP") + "</p></div>" +
      '<div class="titleblock-cell"><p class="mono-label text-muted">Sheet</p>' +
      '<p class="tb-sub">' + esc(activeLabel ? activeLabel.tab : state.view) + "</p></div>" +
      '<div class="titleblock-cell"><p class="mono-label text-muted">Verified</p>' +
      '<p class="tb-sub tb-strong">' + prog.done + "/" + prog.total + " · " + Math.round(prog.ratio * 100) + "%</p></div>" +
      '<div class="titleblock-cell tb-actions">' +
      '<button type="button" class="focus-ink reset-btn" data-action="open-reset" data-source="header">' +
      icon("RotateCcw", { cls: "icon-12" }) + "Reset</button>" +
      inkButton({
        variant: "accent",
        cls: "btn-signoff",
        act: "signoff",
        ariaLabel: "Request audit sign-off",
        html: '<span class="mono-label btn-inner">' + icon("Stamp", { cls: "icon-12" }) + "Sign-off</span>",
      }) +
      "</div></div></header>"
    );
  }

  function renderWorkbench(state) {
    var nextSheet = Store.nextRecommendedSheet(state);
    var drawer = D.SHEETS.map(function (s) { return drawerTab(state, s.id); }).join("");
    var aux = D.AUX_SHEETS.map(function (s) { return drawerTab(state, s.id); }).join("");
    var mobileTabs = D.SHEETS.concat(D.AUX_SHEETS)
      .map(function (s) { return drawerTab(state, s.id); })
      .join("");
    var sheetHtml = window.LabSheets.render(state); // active station sheet
    var nextBtn =
      state.mode && nextSheet && nextSheet !== state.view && SHEET_LABEL[nextSheet]
        ? '<div class="next-wrap">' +
          inkButton({
            variant: "teal",
            act: "set-view",
            data: ' data-view="' + nextSheet + '"',
            html: '<span class="btn-inner">Next sheet → ' + esc(SHEET_LABEL[nextSheet].tabShort) + "</span>",
          }) +
          "</div>"
        : "";
    return (
      '<div class="shell">' +
      '<nav class="drawer" aria-label="Document drawer">' +
      '<p class="mono-label drawer-label">Document drawer</p>' +
      '<div class="drawer-group">' + drawer + "</div>" +
      '<p class="mono-label drawer-label drawer-label-2">Reference</p>' +
      '<div class="drawer-group">' + aux + "</div>" +
      (nextSheet && SHEET_LABEL[nextSheet]
        ? '<p class="mono-label next-hint">NEXT UP → ' + esc(SHEET_LABEL[nextSheet].tabShort) + "</p>"
        : "") +
      "</nav>" +
      '<main class="workbench" role="main" aria-label="Workbench">' +
      '<nav class="drawer-mobile slim-scroll" aria-label="Document drawer (mobile)" data-scroll-keep="drawer-mobile">' +
      mobileTabs + "</nav>" +
      '<div class="sheet-anim">' + sheetHtml + "</div>" +
      nextBtn +
      '<p class="mono-label training-footer">' + esc(D.TRAINING_NOTICE) + "</p>" +
      "</main>" +
      '<aside class="checklist-rail" aria-label="Objectives tracker"><div class="sheet-card rail-card">' +
      checklistContent(state, false) +
      "</div></aside>" +
      "</div>"
    );
  }

  /* ================================================== COMPLETION MODAL --- */

  function focusAreas(state) {
    var mode = state.mode;
    var objs = Store.currentObjectives(state);
    var ready = Store.allDone(state);
    var focus = [];
    if (state.quiz.submitted) {
      window.LabQuiz.itemsFor(mode).forEach(function (it) {
        var picked = state.quiz.answers[it.id];
        if (picked !== undefined && picked !== it.answer) {
          focus.push(
            "Quiz: “" + it.topic + "” — you missed this one. Re-read its explanation on the Quiz sheet, then the matching Archive card."
          );
        }
      });
    } else if (!ready) {
      focus.push("Quiz: not attempted yet — the sign-off needs a pass at 70%.");
    }
    objs.forEach(function (o) {
      var res = state.objectives[o.id];
      if (res && !res.passed) {
        focus.push(
          "Work order " + o.id + " is still open (" + res.attempts + " check" + (res.attempts === 1 ? "" : "s") +
            ") — it lives on the " + o.sheet + " sheet."
        );
      } else if (res && res.passed && !res.firstAttemptPass) {
        focus.push(
          "Work order " + o.id + " needed " + res.attempts + " checks before it passed — worth a re-read of the " +
            o.sheet + " sheet's " + o.anchor.toLowerCase() + "."
        );
      } else if (res && res.passed && res.hintLevel > 0) {
        focus.push(
          "Work order " + o.id + " was passed with a hint — try re-deriving it from the " + o.sheet +
            " sheet before the real exam."
        );
      }
    });
    if (focus.length === 0) {
      focus.push(
        "No weak spots recorded: every work order passed first-check without hints, and the quiz is clean. Next step is applying this to a real site."
      );
    }
    return focus;
  }

  function renderCompletionModal(state) {
    var mode = state.mode;
    var objs = Store.currentObjectives(state);
    var prog = Store.objectiveProgress(state);
    var stars = Store.starRating(state);
    var ready = Store.allDone(state);
    var focus = focusAreas(state);

    var starRow = [1, 2, 3, 4, 5]
      .map(function (i) {
        return icon("Star", { cls: "icon-20" + (i <= stars ? " star-on" : ""), filled: i <= stars });
      })
      .join("");

    var pillarSections = ["P1", "P2", "P3", "P4"]
      .map(function (p) {
        var items = objs.filter(function (o) { return o.pillar === p; });
        var lis = items
          .map(function (o) {
            var res = state.objectives[o.id];
            return (
              "<li>" +
              (res && res.passed
                ? icon("CheckCircle2", { cls: "icon-14 obj-check" })
                : icon("Circle", { cls: "icon-14 obj-circle" })) +
              '<span><span class="mono-label cm-objid">' + o.id + "</span>" + esc(o.title) + "</span></li>"
            );
          })
          .join("");
        return "<div>" + pillarBadge(p) + '<ul class="cm-pillar-list">' + lis + "</ul></div>";
      })
      .join("");

    var focusLis = focus.slice(0, 5).map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("");
    if (focus.length > 5) {
      focusLis +=
        "<li>…and " + (focus.length - 5) + " more — review the checklist rail and quiz explanations for the rest.</li>";
    }

    return (
      '<div class="overlay" data-overlay="signoff"><div class="modal-card sheet-card" role="dialog" aria-modal="true" aria-labelledby="cm-title">' +
      '<button type="button" class="focus-ink modal-x" data-action="close-signoff" aria-label="Close">' +
      icon("X", { cls: "icon-16" }) + "</button>" +
      '<div class="modal-head"><div class="modal-grip" aria-hidden="true">' + icon("Stamp", { cls: "icon-20" }) + "</div>" +
      '<div><h2 id="cm-title" class="serif-head modal-title">' + (ready ? "Audit sign-off" : "Interim audit report") + "</h2>" +
      '<p class="modal-desc">' +
      (ready
        ? "Every work order verified and the quiz passed. The drafting room is yours."
        : "The audit is still open — here is where you stand.") +
      "</p></div></div>" +
      '<div class="cm-body">' +
      '<div class="cm-score">' +
      "<div><p class=\"mono-label text-muted\">Rating (" +
      (mode === "hard" ? "strict: hints cost 0.5★" : "hints cost 0.25★") + ")</p>" +
      '<div class="star-row" role="img" aria-label="' + stars + ' of 5 stars">' + starRow + "</div></div>" +
      '<div class="cm-board"><p class="mono-label text-muted">Scoreboard</p>' +
      '<p class="cm-line">Work orders ' + prog.done + "/" + prog.total + "</p>" +
      '<p class="cm-line">Quiz ' + (state.quiz.submitted ? state.quiz.correct + "/" + state.quiz.total : "—") + "</p>" +
      '<p class="cm-line">Hints ' + state.hintsUsed + "</p></div></div>" +
      pillarSections +
      '<div class="cm-focus"><p class="cm-focus-head">' + icon("Trophy", { cls: "icon-16" }) +
      " Focus areas — from your own evidence</p><ul>" + focusLis + "</ul>" +
      '<p class="cm-focus-note">Official N10-009 3.1 continues into change control &amp; configuration management; then 3.2 monitoring (SNMP, flow data, logging).</p></div>' +
      '<div class="cm-actions">' +
      inkButton({
        act: "close-signoff",
        html: '<span class="btn-inner">' + icon("X", { cls: "icon-16" }) + " Keep working</span>",
      }) +
      inkButton({
        variant: "accent",
        act: "open-reset",
        data: ' data-source="modal"',
        html: '<span class="btn-inner">' + icon("RotateCcw", { cls: "icon-16" }) + " Reset lab</span>",
      }) +
      "</div></div></div></div>"
    );
  }

  function renderResetDialog(source) {
    var desc =
      source === "modal"
        ? "All progress, answers, quiz results and stars are wiped and the drafting room returns to its pristine state."
        : "This wipes all progress, answers, quiz results and stars, and returns the lab to its pristine state. It cannot be undone.";
    return (
      '<div class="overlay" data-overlay="reset"><div class="modal-card sheet-card modal-small" role="alertdialog" aria-modal="true" aria-labelledby="rd-title" aria-describedby="rd-desc">' +
      '<h2 id="rd-title" class="serif-head modal-title">Reset the whole lab?</h2>' +
      '<p id="rd-desc" class="modal-desc">' + desc + "</p>" +
      '<div class="rd-actions">' +
      '<button type="button" class="focus-ink btn btn-default" data-action="close-reset">Cancel</button>' +
      '<button type="button" class="focus-ink btn btn-accent" data-action="confirm-reset">Reset everything</button>' +
      "</div></div></div>"
    );
  }

  function renderMobileChecklist(state) {
    return (
      '<div class="overlay overlay-bottom" data-overlay="checklist">' +
      '<div class="bottom-sheet" role="dialog" aria-modal="true" aria-label="Inspector’s checklist">' +
      '<button type="button" class="focus-ink modal-x sheet-x" data-action="close-checklist" aria-label="Close">' +
      icon("X", { cls: "icon-16" }) + "</button>" +
      checklistContent(state, true) +
      "</div></div>"
    );
  }

  /* ====================================================== FULL SCREENS --- */

  function renderModeSelect() {
    var modeCard = function (mode, tagCls, iconCls, tag, heading, bullets, cta, extraCls, ariaLabel) {
      return (
        '<button type="button" class="focus-ink sheet-card mode-choice ' + extraCls + '"' +
        ' data-action="set-mode" data-mode="' + mode + '" aria-label="' + escAttr(ariaLabel) + '">' +
        '<span class="mode-tag ' + tagCls + '">' + icon(iconCls, { cls: "icon-16 " + iconCls }) +
        '<span class="mono-label">' + tag + "</span></span>" +
        '<h2 class="serif-head mode-choice-title">' + heading + "</h2>" +
        '<ul class="mode-bullets">' + bullets.map(function (b) { return "<li>· " + esc(b) + "</li>"; }).join("") + "</ul>" +
        '<span class="mode-cta">' + cta + " " + icon("ArrowRight", { cls: "icon-16" }) + "</span>" +
        "</button>"
      );
    };
    return (
      '<div class="drafting-bg page-screen"><div class="mode-wrap"><div class="sheet-card mode-card">' +
      '<p class="mono-label text-muted">CyberLab · Interactive practice environment · Synthetic training data</p>' +
      '<h1 class="serif-head mode-title">' + esc(D.LAB_TITLE) + "</h1>" +
      '<p class="mode-sub">' + esc(D.LAB_SUBTITLE) + "</p>" +
      '<div class="mode-intro">You are about to run the documentation audit of <strong>Harborline Freight HQ</strong>. Choose how you want to work — both modes share the same drafting room, the same evidence and the same eight document types.</div>' +
      '<div class="mode-grid">' +
      modeCard(
        "medium", "tag-teal", "GraduationCap", "MEDIUM · Guided Apprenticeship",
        "Learn the craft, sheet by sheet",
        [
          "12 guided work orders, in order, with “where to look” context",
          "Tiered hints (nudge → direction → demonstration)",
          "Tolerant checking — synonyms accepted, wrong tries teach",
          "7-question concept quiz with an explanation on every answer",
          "≈ 45–60 min · Understand / Apply (Bloom)",
        ],
        "Start apprenticeship", "", "Choose Medium mode: Guided Apprenticeship"
      ) +
      modeCard(
        "hard", "tag-amber", "Flame", "HARD · Audit Trial",
        "Audit under pressure",
        [
          "9 broad multi-part audits — you find what matters",
          "Noisy discovery data with two red herrings planted",
          "Strict validation — exact values, exact answers, order matters",
          "One optional nudge, and it visibly costs your rating",
          "7-question scenario quiz · ≈ 60–90 min · Analyze / Evaluate",
        ],
        "Start the trial", "mode-choice-hard", "Choose Hard mode: Audit Trial"
      ) +
      "</div>" +
      '<p class="mode-notice">' + esc(D.TRAINING_NOTICE) + "</p>" +
      "</div></div></div>"
    );
  }

  function renderBriefing() {
    var state = Store.state;
    var rows = D.SCENARIO.building
      .map(function (b) {
        return (
          '<li class="building-row"><span class="building-floor">' + esc(b.floor) + "</span>" +
          '<span class="building-rooms">' + esc(b.rooms) + "</span></li>"
        );
      })
      .join("");
    return (
      '<div class="drafting-bg page-screen"><div class="brief-wrap"><div class="sheet-card brief-card">' +
      '<p class="mono-label text-muted">Sheet 00 · Scenario briefing · ' +
      (state.mode === "hard" ? "Audit Trial" : "Guided Apprenticeship") + "</p>" +
      '<h1 class="serif-head brief-title">The audit starts Monday. The paperwork isn’t ready.</h1>' +
      '<p class="brief-story">' + esc(D.SCENARIO.story) + "</p>" +
      '<div class="brief-building"><p class="mono-label bb-label">THE BUILDING</p>' +
      '<ul class="building-list">' + rows + "</ul>" +
      '<p class="bb-topology">Fiber plant: ' + esc(D.SCENARIO.topology) + "</p></div>" +
      '<div class="brief-cards">' +
      '<div class="brief-box brief-box-amber"><p class="mono-label">What mastery feels like here</p>' +
      '<p class="brief-box-body">Explain every document type, read each artifact fluently, catch where the paper has drifted from reality, and know exactly which sheet manages which change — the four things N10-009 3.1 actually examines.</p></div>' +
      '<div class="brief-box brief-box-teal"><p class="mono-label">Why this matters beyond the exam</p>' +
      '<p class="brief-box-body">Documentation is a defensive control: inventories feed patching and incident response, diagrams cut outage time — and leaked network maps are a reconnaissance gift to attackers. Keep them true, keep them guarded.</p></div>' +
      "</div>" +
      '<p class="brief-notice">' + esc(D.TRAINING_NOTICE) + "</p>" +
      '<div class="brief-actions">' +
      inkButton({
        variant: "accent",
        act: "start-work",
        ariaLabel: "Enter the drafting room",
        html: '<span class="btn-inner">Enter the drafting room ' + icon("ArrowRight", { cls: "icon-16" }) + "</span>",
      }) +
      "</div></div></div></div>"
    );
  }

  /* ------------------------------------------------------- Archive ------ */

  function renderArchive() {
    var topics = D.TOPICS.map(function (t) {
      return (
        '<article class="topic-card">' +
        '<h3 class="serif-head topic-title">' + esc(t.title) + "</h3>" +
        '<p class="topic-body">' + esc(t.body) + "</p>" +
        '<p class="topic-tip">' + esc(t.examTip) + "</p></article>"
      );
    }).join("");
    var glossary = D.GLOSSARY.map(function (g) {
      return (
        '<div class="gloss-item"><dt class="gloss-term">' + esc(g.term) + "</dt>" +
        '<dd class="gloss-def">' + esc(g.def) + "</dd></div>"
      );
    }).join("");
    return (
      '<section class="sheet-card sheet-frame" aria-label="Archive: knowledge core">' +
      '<header class="sheet-head solo"><p class="mono-label sheet-kicker">Archive · Reference shelf · N10-009 3.1</p>' +
      '<h2 class="serif-head sheet-title">The Knowledge Core</h2>' +
      '<p class="sheet-purpose">Every document type in the audit, explained. Open it any time a work order references a term.</p></header>' +
      '<div class="archive-grid">' + topics + "</div>" +
      '<details class="glossary"><summary class="gloss-summary">Glossary — 15 terms (expand)</summary>' +
      '<dl class="gloss-grid">' + glossary + "</dl></details></section>"
    );
  }

  /* ---------------------------------------------------------- Quiz ------ */

  function quizItemCard(item, index, state) {
    var chosen = state.quiz.answers[item.id];
    var reveal = chosen !== undefined;
    var options = item.options
      .map(function (opt, i) {
        var isChosen = chosen === i;
        var chosenIsCorrect = reveal && isChosen && chosen === item.answer;
        var chosenIsWrong = reveal && isChosen && chosen !== item.answer;
        // R3 contract: ONLY the chosen option is colored — green when correct,
        // red when wrong. The correct answer is NEVER revealed in green on a
        // wrong submission (it lives in the feedback text).
        var cls = chosenIsCorrect
          ? "quiz-opt quiz-opt-correct"
          : chosenIsWrong
            ? "quiz-opt quiz-opt-wrong"
            : reveal
              ? "quiz-opt quiz-opt-dim"
              : "quiz-opt";
        var mark = chosenIsCorrect
          ? icon("CheckCircle2", { cls: "icon-16 quiz-mark-pass" })
          : chosenIsWrong
            ? icon("XCircle", { cls: "icon-16 quiz-mark-fail" })
            : '<span class="quiz-mark-empty" aria-hidden="true"></span>';
        return (
          '<button type="button" role="radio" aria-checked="' + !!isChosen + '"' +
          ' class="focus-ink ' + cls + '"' +
          ' data-action="answer-quiz" data-id="' + item.id + '" data-idx="' + i + '"' +
          (reveal ? " disabled" : "") + ">" +
          '<span class="quiz-mark" aria-hidden="true">' + mark + "</span><span>" + esc(opt) + "</span></button>"
        );
      })
      .join("");
    var explain =
      chosen !== undefined
        ? '<p aria-live="polite" class="quiz-explain ' +
          (chosen === item.answer ? "quiz-explain-pass" : "quiz-explain-fail") + '">' +
          (chosen === item.answer ? "Correct — " : "Not quite — ") + esc(item.explain) + "</p>"
        : "";
    return (
      '<fieldset class="quiz-item" aria-label="Question ' + (index + 1) + '">' +
      '<legend class="mono-label quiz-legend">Q' + (index + 1) + "</legend>" +
      '<p class="quiz-prompt">' + esc(item.prompt) + "</p>" +
      '<div class="quiz-options" role="radiogroup" aria-label="Options for question ' + (index + 1) + '">' +
      options + "</div>" + explain + "</fieldset>"
    );
  }

  function renderQuiz() {
    var state = Store.state;
    var mode = state.mode;
    var items = window.LabQuiz.itemsFor(mode);
    var answered = Object.keys(state.quiz.answers).length;
    var passed = state.quiz.submitted && Store.quizPassed(state);
    var pct = state.quiz.total ? Math.round((state.quiz.correct / state.quiz.total) * 100) : 0;

    var body;
    if (!state.quiz.submitted) {
      body =
        '<div class="quiz-actions">' +
        inkButton({
          variant: "accent",
          act: "submit-quiz",
          ariaLabel: "Submit quiz for grading",
          disabled: answered < items.length,
          html: "Submit for grading (" + answered + "/" + items.length + " answered)",
        }) +
        (answered < items.length
          ? '<p class="quiz-gate">Answer every question to unlock grading.</p>'
          : "") +
        "</div>";
    } else {
      body =
        '<div aria-live="polite" class="quiz-result ' + (passed ? "quiz-result-pass" : "quiz-result-fail") + '">' +
        '<p class="serif-head quiz-pct">' + pct + "% — " + (passed ? "Quiz passed." : "Below the 70% pass mark.") + "</p>" +
        "<p class=" + '"quiz-result-body">' +
        (passed
          ? "The inspector signs the sheets. Head to Field Notes for the synthesis, or request your audit sign-off."
          : "Re-read the flagged explanations and revisit the Archive, then retake the quiz below. The sign-off requires a pass; your verified work orders stay banked.") +
        "</p>" +
        (!passed
          ? '<div class="quiz-retake">' +
            inkButton({
              variant: "accent",
              act: "retake-quiz",
              ariaLabel: "Retake the quiz",
              html: '<span class="btn-inner">Retake the quiz (clears quiz answers only)</span>',
            }) +
            "</div>"
          : "") +
        "</div>";
    }

    return (
      '<section class="sheet-card sheet-frame" aria-label="Inspector\'s quiz">' +
      '<header class="sheet-head solo"><p class="mono-label sheet-kicker">Inspector’s quiz · ' +
      (mode === "hard" ? "scenario application" : "concept check") + "</p>" +
      '<h2 class="serif-head sheet-title">Knowledge Check</h2>' +
      '<p class="sheet-purpose">' + items.length +
      " questions · each answer locks as you go · an explanation follows every answer. Pass mark 70%. A failed quiz can be retaken — the objective work you already verified stays banked.</p></header>" +
      '<div class="quiz-body">' +
      items.map(function (it, i) { return quizItemCard(it, i, state); }).join("") +
      body +
      "</div></section>"
    );
  }

  /* ----------------------------------------------------- Field notes ---- */

  function renderNotes() {
    var auditRows = [
      ["Physical / logical diagrams", "Device configs, discovery sweeps, photos", "ALERT when a drawn subnet/gateway ≠ 'show ip interface brief', or a closet exists in photos but not on the sheet"],
      ["Rack diagrams", "Closet photos, power audit", "ALERT when device model/serial ≠ chassis label, or a U slot holds an undocumented device"],
      ["Cable maps", "Toner tests, switch MAC tables", "ALERT when tone lands on a different port than documented (label drift)"],
      ["Asset inventory", "nmap/MDM check-ins, chassis serials", "ALERT when a serial mismatches, a record's device is absent from discovery, or discovery finds an unrecorded device"],
      ["IPAM", "DHCP leases, ARP tables, SVI configs", "ALERT on duplicate statics, statics inside DHCP ranges, gateway cells contradicting device truth"],
      ["SLA", "Incident tickets, outage log", "COMPUTE (period − downtime)/period vs committed %; breach → credits"],
      ["Wireless survey", "Survey walk, heat map tool", "ALERT on cells ≤ −85 dBm (dead zone) or overlapping APs sharing a channel"],
    ]
      .map(function (r) {
        return (
          '<tr class="notes-row"><td class="notes-doc">' + esc(r[0]) + "</td>" +
          '<td class="notes-src">' + esc(r[1]) + "</td>" +
          '<td class="notes-logic">' + esc(r[2]) + "</td></tr>"
        );
      })
      .join("");
    return (
      '<section class="sheet-card sheet-frame" aria-label="Field notes and debrief">' +
      '<header class="sheet-head solo"><p class="mono-label sheet-kicker">Field notes · Debrief · Synthesis</p>' +
      '<h2 class="serif-head sheet-title">What the Audit Proved</h2>' +
      '<p class="sheet-purpose">Keep this page in your head, not just your notes.</p></header>' +
      '<div class="notes-body">' +
      "<div><h3 class=\"serif-head notes-h3\">Audit opportunities per document (detection logic)</h3>" +
      '<div class="table-scroll"><table class="data-table notes-table"><thead><tr class="notes-headrow">' +
      '<th class="notes-th"><span class="mono-label">Document</span></th>' +
      '<th class="notes-th"><span class="mono-label">Evidence source</span></th>' +
      '<th class="notes-th"><span class="mono-label">Example audit logic</span></th>' +
      "</tr></thead><tbody>" + auditRows + "</tbody></table></div></div>" +
      '<div class="mind-grid">' +
      '<div class="mind-card mind-blue"><p class="mind-head">' + icon("ShieldCheck", { cls: "icon-16" }) + " Blue-team takeaways</p>" +
      '<ul class="mind-list mind-list-blue">' +
      "<li>Reconcile documentation against discovery on a schedule — drift is inevitable, staleness is a choice.</li>" +
      "<li>Revision-control every sheet (REV letters, dates, author) so auditors and successors trust what they read.</li>" +
      "<li>Give every address, port and run exactly one job — block plans prevent whole classes of conflict.</li>" +
      "<li>Rehearse incidents from the physical map first: topology predicts blast radius faster than any dashboard.</li>" +
      "</ul></div>" +
      '<div class="mind-card mind-red"><p class="mind-head">' + icon("ShieldAlert", { cls: "icon-16" }) + " Red-team mindset (defensive awareness)</p>" +
      '<ul class="mind-list mind-list-red">' +
      "<li>A stolen network diagram is reconnaissance gold: subnets, gateways, closets, single points of failure — all pre-annotated.</li>" +
      "<li>Documentation is an asset: store it access-controlled and encrypted, exactly like credentials.</li>" +
      "<li>Ghost devices (undocumented, forgotten) are the ones nobody patches — inventory audits are attack-surface reduction.</li>" +
      "<li>Attackers read your SLA too: it tells them how long they can hold systems hostage before the defender’s vendor even responds.</li>" +
      "</ul></div></div>" +
      "<div><h3 class=\"serif-head notes-h3\">Keep going</h3>" +
      '<ul class="keep-list">' +
      "<li>Official N10-009 objective 3.1 continues into <strong>change control and configuration management</strong> — natural next study topics (not covered in this lab’s lesson detail).</li>" +
      "<li>Then move to Domain 3.2: monitoring (SNMP, flow data, logging) — your freshly built diagrams are the maps those tools draw on.</li>" +
      "</ul>" +
      '<div class="keep-links">' +
      '<a class="focus-ink keep-link" href="https://www.comptia.org/en-us/certifications/network" target="_blank" rel="noopener noreferrer">CompTIA Network+ official page ' +
      icon("ExternalLink", { cls: "icon-14" }) + "</a>" +
      '<a class="focus-ink keep-link" href="https://www.professormesser.com/network-plus/n10-009/n10-009-video/network-documentation-n10-009/" target="_blank" rel="noopener noreferrer">Professor Messer — N10-009 3.1 lesson ' +
      icon("ExternalLink", { cls: "icon-14" }) + "</a></div>" +
      '<p class="keep-note">Note: this lab maps a CompTIA exam objective, not a MITRE entity; the audit-logic table above is the documentation-world analogue of detection engineering.</p>' +
      "</div></div></section>"
    );
  }

  /* ----------------------------------------------------------- root ----- */

  /**
   * Full app render. uiState carries dialog/sheet visibility (component-local,
   * like React useState in the original LabRoot).
   */
  function render(state, uiState) {
    if (state.phase === "mode" || !state.mode) {
      return renderModeSelect();
    }
    if (state.phase === "brief") {
      return renderBriefing();
    }

    var done = Store.allDone(state);
    var autoOpen = done && !state.completedShown;
    var signOffOpen = uiState.signOffRequested || autoOpen;

    var html =
      '<div class="drafting-bg app-root">' +
      renderHeader(state) +
      renderWorkbench(state) +
      '<button type="button" class="focus-ink fab-checklist" data-action="open-checklist"' +
      ' aria-label="Open inspector\'s checklist, ' + prog(state).done + " of " + prog(state).total + ' verified">' +
      icon("ClipboardList", { cls: "icon-16" }) + " " + prog(state).done + "/" + prog(state).total +
      "</button>";

    if (signOffOpen) html += renderCompletionModal(state);
    if (uiState.resetOpen) html += renderResetDialog(uiState.resetSource);
    if (uiState.mobileChecklist) html += renderMobileChecklist(state);
    html += "</div>";
    return html;
  }

  function prog(state) {
    return Store.objectiveProgress(state);
  }

  window.LabUI = {
    render: render,
    icon: icon,
    esc: esc,
    escAttr: escAttr,
    inkButton: inkButton,
    pillarBadge: pillarBadge,
    passStamp: passStamp,
    discoveryNote: discoveryNote,
    picker: picker,
    textInput: textInput,
    workOrder: workOrder,
    sheetFrame: sheetFrame,
    SHEET_LABEL: SHEET_LABEL,
    renderArchive: renderArchive,
    renderQuiz: renderQuiz,
    renderNotes: renderNotes,
  };
})();
