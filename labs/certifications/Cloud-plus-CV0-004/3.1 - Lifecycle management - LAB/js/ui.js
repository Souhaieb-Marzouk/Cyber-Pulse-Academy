// ORBIT static port — rendering layer (F5, F8-F16, F19, F20).
// Component functions return HTML strings; app.js wires the event delegation.
// Every class name maps to the translated CSS in css/styles.css; every user-
// facing string, icon and ARIA attribute mirrors the original React lab.
//
// Depends on: ORBIT.DATA, ORBIT.ENGINE, ORBIT.STORE, ORBIT.icon.
var ORBIT = window.ORBIT || {};
window.ORBIT = ORBIT;

ORBIT.UI = (function () {
  "use strict";

  var D = ORBIT.DATA;
  var E = ORBIT.ENGINE;
  var icon = ORBIT.icon;

  // ---------- tiny helpers ----------
  function esc(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function money(n) {
    return "$" + n.toFixed(2);
  }

  // Deterministic shuffle for the pool display: seeded from the FULL step list so
  // the order is stable across re-renders/reloads and never reveals the answer (R6).
  // Exact port of the original djb2 + mulberry32 implementation.
  function shuffledPool(steps) {
    var key = steps.map(function (s) { return s.id; }).join("|");
    var h = 5381;
    for (var i = 0; i < key.length; i++) h = ((h << 5) + h + key.charCodeAt(i)) >>> 0;
    var seed = h || 1;
    var rand = function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    var arr = steps.slice();
    for (var j = arr.length - 1; j > 0; j--) {
      var k = Math.floor(rand() * (j + 1));
      var tmp = arr[j]; arr[j] = arr[k]; arr[k] = tmp;
    }
    return arr;
  }

  // ---------- shared widgets ----------

  function PillarBadge(pillar, extraClass) {
    return '<span class="pillar ' + D.PILLAR_COLOR[pillar] + (extraClass ? " " + extraClass : "") + '">' +
      esc(pillar) + " · " + esc(D.PILLAR_LABELS[pillar]) + "</span>";
  }

  function StateChip(state) {
    var dot = state === "PROVISIONING" ? '<span class="pulse-dot"></span>' : "";
    return '<span class="state-chip state-' + esc(state) + '">' + dot + esc(state) + "</span>";
  }

  function SectionCard(opts, inner) {
    return (
      '<section class="section-card"' + (opts.id ? ' id="' + esc(opts.id) + '"' : "") +
      ' aria-label="' + esc(opts.title) + '">' +
      "<header>" +
      (opts.kicker ? '<p class="kicker">' + esc(opts.kicker) + "</p>" : "") +
      "<h3>" + esc(opts.title) + "</h3>" +
      "</header>" +
      inner +
      "</section>"
    );
  }

  function ChipToggle(opts) {
    var on = opts.selected;
    var cls = "chip" + (on ? " is-on" : "") + (opts.tone === "danger" ? " danger" : "");
    return (
      '<button type="button" class="' + cls + '" aria-pressed="' + (on ? "true" : "false") + '"' +
      (opts.kbd ? ' data-kbd="' + esc(opts.kbd) + '"' : "") +
      ' data-action="' + esc(opts.action) + '"' +
      Object.keys(opts.params || {}).map(function (k) {
        return " data-" + k + '="' + esc(opts.params[k]) + '"';
      }).join("") +
      ">" +
      '<span class="chip-box"><span class="box">' +
      (on ? icon("check", "ic12") : "") +
      "</span><span>" + opts.label + "</span></span>" +
      "</button>"
    );
  }

  function NumField(opts) {
    return (
      '<div class="num-field">' +
      '<div class="row">' +
      '<span class="lbl">' + esc(opts.label) + "</span>" +
      '<span class="ctrls">' +
      '<button type="button" class="step-btn" aria-label="decrease ' + esc(opts.label) + '"' +
      ' data-kbd="' + esc(opts.kbd + "-dec") + '" data-action="' + esc(opts.action) + '" data-field="' + esc(opts.field) + '" data-delta="' + -opts.step + '"' +
      ' data-min="' + opts.min + '" data-max="' + opts.max + '">' + icon("minus", "ic16") + "</button>" +
      '<span class="val" aria-live="polite">' + opts.value + "</span>" +
      '<button type="button" class="step-btn" aria-label="increase ' + esc(opts.label) + '"' +
      ' data-kbd="' + esc(opts.kbd + "-inc") + '" data-action="' + esc(opts.action) + '" data-field="' + esc(opts.field) + '" data-delta="' + opts.step + '"' +
      ' data-min="' + opts.min + '" data-max="' + opts.max + '">' + icon("plus", "ic16") + "</button>" +
      "</span></div>" +
      (opts.hint ? '<p class="hint">' + esc(opts.hint) + "</p>" : "") +
      "</div>"
    );
  }

  function OptRow(opts) {
    return (
      '<div role="radiogroup" aria-label="' + esc(opts.name) + '" class="opt-row">' +
      opts.options.map(function (o) {
        var on = opts.value === o.id;
        return (
          '<button type="button" role="radio" aria-checked="' + (on ? "true" : "false") + '"' +
          ' class="opt' + (on ? " is-on" : "") + '"' +
          ' data-kbd="' + esc(opts.kbd + "-" + o.id) + '"' +
          ' data-action="set-opt" data-path="' + esc(opts.path) + '" data-v="' + esc(o.id) + '">' +
          '<span class="opt-in"><span class="dot"></span><span>' + esc(o.label) + "</span></span>" +
          "</button>"
        );
      }).join("") +
      "</div>"
    );
  }

  function ToggleRow(opts) {
    return (
      '<button type="button" role="switch" aria-checked="' + (opts.checked ? "true" : "false") + '"' +
      ' class="switch-row" data-kbd="' + esc(opts.kbd) + '" data-action="set-switch" data-path="' + esc(opts.path) + '">' +
      "<span>" +
      '<span class="t">' + esc(opts.label) + "</span>" +
      (opts.desc ? '<span class="d">' + esc(opts.desc) + "</span>" : "") +
      "</span>" +
      '<span class="track"></span>' +
      "</button>"
    );
  }

  function Field(opts) {
    return (
      '<div class="field">' +
      '<p class="lbl">' + esc(opts.label) + "</p>" +
      '<select class="select" aria-label="' + esc(opts.label) + '"' +
      ' data-kbd="' + esc(opts.kbd) + '" data-action="set-select" data-path="' + esc(opts.path) + '"' +
      (opts.num ? " data-num=\"1\"" : "") + ">" +
      '<option value="">choose…</option>' +
      opts.options.map(function (o) {
        return '<option value="' + esc(o.id) + '"' + (String(opts.value) === String(o.id) ? " selected" : "") + ">" + esc(o.label) + "</option>";
      }).join("") +
      "</select></div>"
    );
  }

  function SequenceBoard(opts) {
    var s = ORBIT.STORE.get();
    var attempts = opts.objId ? (s.attempts[opts.objId] ?? 0) : 0;
    var revealed = !opts.objId || attempts > 0;
    var byId = {};
    opts.steps.forEach(function (st) { byId[st.id] = st; });
    var chosen = opts.value.map(function (id) { return byId[id]; }).filter(Boolean);
    var pool = shuffledPool(opts.steps).filter(function (st) { return opts.value.indexOf(st.id) === -1; });
    var lastId = opts.value.length > 0 ? opts.value[opts.value.length - 1] : undefined;
    var lastIsCorrect = opts.value.length > 0 && opts.steps[opts.value.length - 1] && opts.steps[opts.value.length - 1].id === lastId;
    var lastWarning = revealed && !lastIsCorrect && opts.value.length > 0 ? (opts.warnings || {})[lastId] : undefined;
    function correctPos(i) {
      return revealed && opts.steps[i] && opts.steps[i].id === opts.value[i];
    }

    var listHtml = '<ol class="seq-list" aria-label="execution order">';
    if (chosen.length === 0) {
      listHtml += '<li><span class="seq-empty">Click steps below in the order you would execute them.</span></li>';
    }
    chosen.forEach(function (st, i) {
      var numCls = "seq-num" + (revealed ? (correctPos(i) ? " ok" : " bad") : "");
      listHtml +=
        "<li>" +
        '<span class="' + numCls + '">' + (i + 1) + "</span>" +
        '<button type="button" class="seq-step" data-kbd="' + esc(opts.board + "-step-" + st.id) + '"' +
        ' data-action="seq-remove" data-board="' + esc(opts.board) + '" data-i="' + i + '">' +
        esc(st.label) + '<span class="tap">(tap to remove)</span></button>' +
        "</li>";
    });
    listHtml += "</ol>";

    var warnHtml = "";
    if (lastWarning) {
      warnHtml =
        '<p class="seq-warning" role="alert">' + icon("triangle-alert", "ic14 warn-ic") +
        "<span>" + esc(lastWarning) + "</span></p>";
    }

    var poolHtml =
      '<div class="seq-pool">' +
      pool.map(function (st) {
        return (
          '<button type="button" class="pool-btn" data-kbd="' + esc(opts.board + "-pool-" + st.id) + '"' +
          ' data-action="seq-add" data-board="' + esc(opts.board) + '" data-id="' + esc(st.id) + '">' +
          esc(st.label) + "</button>"
        );
      }).join("") +
      "</div>";

    var clearHtml = "";
    if (opts.value.length > 0) {
      clearHtml = '<button type="button" class="link-clear" data-kbd="' + esc(opts.board + "-clear") + '" data-action="seq-clear" data-board="' + esc(opts.board) + '">Clear order</button>';
    }
    var toneNote = opts.tone === "danger" ? '<p class="seq-danger-note">Wrong order is rejected with an explanation — think before you click.</p>' : "";

    return listHtml + warnHtml + poolHtml + clearHtml + toneNote;
  }

  function SimConsole(lines, simState, outcome) {
    var inner = '<div aria-live="polite" aria-atomic="false">';
    if (lines.length === 0) {
      inner += '<p class="ready">console ready — press RUN to engage the simulator</p>';
    }
    lines.forEach(function (l, i) {
      var cls;
      var isResult = l.indexOf("RESULT") !== -1;
      if (isResult && outcome === "ok") cls = "res-ok";
      else if (isResult && outcome === "saturation") cls = "res-bad";
      else if (isResult && outcome === "costblow") cls = "res-cost";
      else cls = "plain";
      // fade animation only on the newest line (matches the original per-line entrance)
      var anim = i === lines.length - 1 ? " anim-line" : "";
      inner += '<p class="' + cls + anim + '">' + esc(l) + "</p>";
    });
    if (simState === "running") {
      inner += '<p class="caret">▍working…</p>';
    }
    inner += "</div>";
    return '<div class="sim">' + inner + "</div>";
  }

  function CheckResult(objId) {
    var s = ORBIT.STORE.get();
    var fb = s.feedback[objId];
    if (!fb) return "";
    var passed = !!s.passed[objId];
    return (
      '<div aria-live="polite" role="status">' +
      '<div class="check-result ' + (passed ? "pass" : "fail") + '">' +
      (passed ? icon("circle-check", "ic16 icon-check-pass") : icon("x", "ic16 check-x")) +
      "<span>" + esc(fb.text) + "</span>" +
      "</div></div>"
    );
  }

  function HintStack(obj) {
    var s = ORBIT.STORE.get();
    var used = s.hintsUsed[obj.id] ?? 0;
    if (used === 0) {
      var tiers = obj.hints.length;
      var suffix = tiers > 1 ? "" : " · costs score";
      return (
        '<div class="hint-stack">' +
        '<button type="button" class="hint-btn" data-kbd="hint-' + esc(obj.id) + '" data-action="hint" data-id="' + esc(obj.id) + '">' +
        icon("lightbulb", "ic14") + " Reveal hint (" + tiers + " tier" + (tiers > 1 ? "s" : "") + " available" + suffix + ")" +
        "</button></div>"
      );
    }
    var html = '<div class="hint-stack">';
    obj.hints.slice(0, used).forEach(function (h, i) {
      var anim = i === used - 1 ? " anim-line" : "";
      html += '<p class="hint-line' + anim + '"><span class="n">hint ' + (i + 1) + "</span>" + esc(h) + "</p>";
    });
    if (used < obj.hints.length) {
      html +=
        '<button type="button" class="hint-btn" data-kbd="hint-' + esc(obj.id) + '" data-action="hint" data-id="' + esc(obj.id) + '">' +
        icon("chevron-up", "ic14") + " Deeper hint (" + (obj.hints.length - used) + " left)</button>";
    }
    html += "</div>";
    return html;
  }

  // ---------- gate (C1 mode selection) ----------
  function Gate() {
    return (
      '<div class="gate">' +
      '<div class="gate-in">' +
      '<p class="gate-kicker">' + icon("satellite", "ic16") + " ORBIT · fleet lifecycle console</p>" +
      '<h1>CompTIA Cloud+ <span class="cv">CV0-004</span> · Lesson 3.1 — Lifecycle management</h1>' +
      '<p class="gate-brief"><b>Mission briefing.</b> You are the on-call cloud operations engineer at LumenStream Media (a fictional streaming company). Three problems landed on your console at once: the season finale hits Friday 20:00 with 6× traffic; a kernel vulnerability must be patched across the fleet with zero downtime; and a project closed in 2024 left resources behind that still bill, still hold data, and still hold credentials. Managing the lifecycle of cloud resources — provisioning, scaling, updates, and clean retirement — is the whole lesson. It maps to CV0-004 Domain 3.0 (Operations): scaling approaches, resource life-cycle management, and the update process.</p>' +
      '<div class="gate-cards">' +
      '<button type="button" class="gate-card medium" data-kbd="gate-medium" data-action="enter" data-mode="MEDIUM">' +
      '<p class="k">' + icon("eye", "ic16") + " Day shift</p>" +
      "<h2>Medium — understand &amp; learn</h2>" +
      "<ul>" +
      "<li>· 12 guided objectives, introduced in lifecycle order</li>" +
      "<li>· 3-tier hints on every objective; “where to look” pointers</li>" +
      "<li>· Tolerant checks — near-forms accepted, teaching feedback always</li>" +
      "<li>· 7-question concept quiz with explanations</li>" +
      "</ul>" +
      '<p class="go">Start the shift →</p>' +
      "</button>" +
      '<button type="button" class="gate-card hard" data-kbd="gate-hard" data-action="enter" data-mode="HARD">' +
      '<p class="k">' + icon("eye-off", "ic16") + " Night shift</p>" +
      "<h2>Hard — test &amp; stretch</h2>" +
      "<ul>" +
      "<li>· 9 broad multi-step objectives; no pointers</li>" +
      "<li>· Noisy evidence with planted red herrings &amp; traps</li>" +
      "<li>· Strict checks: exact sets, exact orders, near-misses rejected with rationale</li>" +
      "<li>· One nudge per objective, and it visibly costs score</li>" +
      "<li>· 7 scenario-based quiz items</li>" +
      "</ul>" +
      '<p class="go">Clock in →</p>' +
      "</button>" +
      "</div>" +
      '<p class="gate-foot">' +
      "<span>" + icon("shield-check", "ic12") + " synthetic training environment</span>" +
      "<span>" + icon("brain-circuit", "ic12") + " single source: CV0-004 lesson 3.1</span>" +
      "<span>" + icon("award", "ic12") + " progress auto-saves locally</span>" +
      "</p>" +
      "</div></div>"
    );
  }

  // ---------- HUD ----------
  function HudRight(stats) {
    var s = ORBIT.STORE.get();
    var html = "";
    if (stats.allDone) {
      html += '<button type="button" class="btn-complete" data-kbd="hud-complete" data-action="open-complete">★ mission complete</button>';
    } else {
      html += '<p class="hud-counter" aria-live="polite"><b>' + stats.solved + "</b>/" + stats.total + " validated</p>";
    }
    html += '<button type="button" class="btn-hud" data-kbd="hud-manual" data-action="open-manual">' + icon("book-open", "ic14") + " Flight manual</button>";
    html += '<button type="button" class="btn-hud btn-reset" data-kbd="hud-reset" data-action="open-reset">' + icon("rotate-ccw", "ic14") + " Reset</button>";
    return html;
  }

  // ---------- bay rail ----------
  function Rail(activeBay, nextBay, allDone) {
    var wide = window.matchMedia("(min-width: 1024px)").matches;
    var html = '<nav aria-label="console stations" class="rail"><div class="rail-tabs" role="tablist" aria-orientation="' + (wide ? "vertical" : "horizontal") + '">';
    D.BAYS.forEach(function (b) {
      var active = activeBay === b.id;
      var isNext = nextBay === b.id && !allDone;
      html +=
        '<button type="button" role="tab" aria-selected="' + (active ? "true" : "false") + '"' +
        ' class="rail-tab' + (active ? " is-active" : "") + '" data-kbd="tab-' + esc(b.id) + '"' +
        ' data-action="set-bay" data-bay="' + esc(b.id) + '">' +
        icon(b.icon, "ic14") +
        "<span>" + esc(b.label) + "</span>" +
        (isNext ? '<span class="next-dot" aria-label="next objective lives here"></span>' : "") +
        "</button>";
    });
    // mobile-only director bay
    html +=
      '<button type="button" role="tab" aria-selected="' + (activeBay === "director" ? "true" : "false") + '"' +
      ' class="rail-tab tab-director' + (activeBay === "director" ? " is-active" : "") + '" data-kbd="tab-director"' +
      ' data-action="set-bay" data-bay="director">' +
      icon("list-checks", "ic14") + "<span>Director</span></button>";
    html += "</div></nav>";
    return html;
  }

  // ---------- mission director (C4) ----------
  function ObjRow(id) {
    var s = ORBIT.STORE.get();
    var obj = null;
    D.OBJECTIVES[s.mode].forEach(function (o) { if (o.id === id) obj = o; });
    var passed = !!s.passed[id];
    var active = s.activeObj === id;
    var rowCls = "obj-row" + (passed ? " passed" : "") + (active ? " active" : "");
    var open = active;
    var whereLine = s.mode === "MEDIUM"
      ? '<p class="where">' + icon("crosshair", "ic12") + " where to look: " + esc(obj.where) + "</p>"
      : "";
    return (
      '<div class="' + rowCls + '">' +
      '<button type="button" aria-expanded="' + (open ? "true" : "false") + '" data-kbd="obj-' + esc(id) + '"' +
      ' data-action="toggle-obj" data-id="' + esc(id) + '">' +
      (passed ? icon("circle-check", "ic16 icon-check-pass") : icon("circle-dashed", "ic16 icon-check-dash")) +
      "<span>" +
      '<span class="ohead"><span class="oid">' + esc(obj.id) + "</span>" + PillarBadge(obj.pillar) + "</span>" +
      '<span class="otitle">' + esc(obj.title) + "</span>" +
      "</span></button>" +
      '<div class="obj-expand' + (open ? " open" : "") + '"><div><div class="inner">' +
      '<p class="ctx">' + esc(obj.context) + "</p>" +
      whereLine +
      '<div class="actions">' +
      '<button type="button" class="obj-check-btn"' + (passed ? " disabled" : "") +
      ' data-kbd="check-' + esc(id) + '" data-action="check-obj" data-id="' + esc(id) + '">' +
      (passed ? "validated ✓" : "Check results") +
      "</button>" +
      HintStack(obj) +
      "</div>" +
      CheckResult(id) +
      "</div></div></div>" +
      "</div>"
    );
  }

  function Director(compact) {
    var s = ORBIT.STORE.get();
    var stats = E.labStats(s);
    var allSolved = stats.ids.every(function (i) { return s.passed[i]; });
    var html =
      '<div class="director-inner">' +
      '<div class="director-head"><p class="t">Mission director</p><p class="c">' + stats.solved + "/" + stats.total + " validated</p></div>";
    if (!compact) {
      html +=
        '<div class="dir-progress" role="progressbar" aria-valuenow="' + stats.solved + '" aria-valuemin="0" aria-valuemax="' + stats.total + '">' +
        '<div style="width:' + (stats.solved / stats.total) * 100 + '%"></div></div>';
    }
    html += '<div class="dir-list' + (compact ? "" : " scrollable") + '">';
    stats.ids.forEach(function (id) { html += ObjRow(id); });
    html += "</div>";
    if (allSolved) {
      html += '<p class="dir-done">All objectives validated — open MISSION DEBRIEF, run the CERT CHECK, and collect your rating.</p>';
    }
    html += "</div>";
    return html;
  }

  // ---------- flight manual (C2, rendered inside the sheet) ----------
  function Manual() {
    var ui = ORBIT.APP.ui;
    var html = '<div class="manual-intro"><p class="manual-intro">Flight manual for <b>CV0-004 Lesson 3.1 — Lifecycle management</b> (scaling &amp; updates). Everything the objectives test, in six short chapters. Vendor-neutral per CompTIA style.</p></div>';
    html += '<div class="accordion">';
    D.MANUAL_SECTIONS.forEach(function (sec) {
      var open = ui.manualSection === sec.id;
      html +=
        '<div class="acc-item' + (open ? " open" : "") + '">' +
        '<button type="button" class="acc-trigger" aria-expanded="' + (open ? "true" : "false") + '"' +
        ' data-kbd="man-' + esc(sec.id) + '" data-action="toggle-manual-acc" data-key="' + esc(sec.id) + '">' +
        icon("book-marked", "ic14") + esc(sec.title) +
        '<span class="acc-chev">' + icon("chevron-up", "ic14") + "</span></button>" +
        '<div class="acc-body"><div>' +
        sec.body.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") +
        "</div></div></div>";
    });
    html += "</div>";
    html += '<div class="glossary-box"><p class="gt">Glossary — ' + D.GLOSSARY.length + ' terms</p>';
    html += '<div class="accordion glossary-acc">';
    D.GLOSSARY.forEach(function (g, i) {
      var open = ui.glossaryOpen === i;
      html +=
        '<div class="acc-item' + (open ? " open" : "") + '">' +
        '<button type="button" class="acc-trigger" aria-expanded="' + (open ? "true" : "false") + '"' +
        ' data-kbd="glo-' + i + '" data-action="toggle-glossary" data-key="' + i + '">' +
        esc(g.term) +
        '<span class="acc-chev">' + icon("chevron-up", "ic14") + "</span></button>" +
        '<div class="acc-body"><div><p class="gdef">' + esc(g.def) + "</p></div></div></div>";
    });
    html += "</div></div>";
    return html;
  }

  // ---------- FLEET DECK ----------
  function KindIcon(kind) {
    return icon(D.KIND_ICON[kind] || "server", "ic16 kind-icon");
  }

  function Dossier(r, animate) {
    var s = ORBIT.STORE.get();
    var isFlagged = s.flaggedDrift.indexOf(r.id) !== -1;
    var provLabel = r.provMethod === "iac" ? "IaC pipeline" : r.provMethod === "manual" ? "MANUAL (console)" : "provider-managed";
    var driftBtn = "";
    if (r.kind === "compute" && r.state === "ACTIVE") {
      driftBtn =
        '<button type="button" class="btn-drift' + (isFlagged ? " is-on" : "") + '" aria-pressed="' + (isFlagged ? "true" : "false") + '"' +
        ' data-kbd="drift-' + esc(r.id) + '" data-action="toggle-drift" data-id="' + esc(r.id) + '">' +
        icon("flag", "ic14") + " " + (isFlagged ? "Drift flagged (tap to unflag)" : "Flag drift / out-of-pipeline") +
        "</button>";
    }
    return (
      '<aside class="dossier' + (animate ? " anim-line" : "") + '" aria-label="dossier ' + esc(r.id) + '">' +
      '<div class="head">' + KindIcon(r.kind) +
      '<h4 class="hlabel">' + esc(r.label) + "</h4>" +
      StateChip(r.state) +
      '<span class="cost">' + money(r.costPerDay) + "/day</span></div>" +
      "<dl>" +
      "<div><dt>provisioned</dt><dd>" + provLabel + "</dd></div>" +
      "<div><dt>patch level</dt><dd>" + esc(r.patch) + "</dd></div>" +
      "<div><dt>launched</dt><dd>" + esc(r.launched) + "</dd></div>" +
      "<div><dt>environment</dt><dd>" + esc(r.env) + "</dd></div>" +
      "<div><dt>project</dt><dd>" + esc(r.project) + "</dd></div>" +
      "<div><dt>AZ / group</dt><dd>" + esc(r.az || "—") + (r.asg ? " · " + esc(r.asg) : "") + "</dd></div>" +
      "</dl>" +
      '<p class="note">' + esc(r.note) + "</p>" +
      (r.deps ? '<p class="deps">' + icon("archive", "ic12") + esc(r.deps) + "</p>" : "") +
      driftBtn +
      "</aside>"
    );
  }

  function TriageBoard() {
    var s = ORBIT.STORE.get();
    var html = SectionCard(
      { kicker: "night-shift audit", title: "Triage board — three exact sets" },
      '<div class="triage-grid">' +
      D.TRIAGE_COLS.map(function (c) {
        return (
          '<div class="triage-col" aria-label="triage ' + esc(c.key) + '">' +
          '<p class="t">' + esc(c.title) + "</p>" +
          '<p class="h">' + esc(c.hint) + "</p>" +
          '<div class="triage-chips">' +
          D.FLEET.map(function (r) {
            return ChipToggle({
              selected: s.triage[c.key].indexOf(r.id) !== -1,
              tone: "default",
              action: "toggle-triage",
              params: { col: c.key, id: r.id },
              kbd: "triage-" + c.key + "-" + r.id,
              label: '<span class="mono" style="font-size:10px">' + esc(r.label) + "</span>",
            });
          }).join("") +
          "</div></div>"
        );
      }).join("") +
      "</div>" +
      '<p class="triage-note">17 chips × 3 boards — read dossiers and telemetry before trusting anything that merely looks idle or old. Traps are planted.</p>'
    );
    return html;
  }

  function StationFleet() {
    var s = ORBIT.STORE.get();
    var ui = ORBIT.APP.ui;
    var sel = ui.dossierSel;
    var selected = null;
    D.FLEET.forEach(function (r) { if (r.id === sel) selected = r; });

    var cards = D.FLEET.map(function (r) {
      var isM2 = D.M2_TARGETS.indexOf(r.id) !== -1;
      var selCls = ui.dossierSel === r.id ? " is-sel" : "";
      var classify = "";
      if (isM2) {
        var cur = s.classified[r.id] || "";
        classify =
          '<select class="select select-sm" aria-label="classify ' + esc(r.label) + '"' +
          ' data-kbd="classify-' + esc(r.id) + '" data-action="set-select" data-path="classified.' + esc(r.id) + '">' +
          '<option value="">classify…</option>' +
          D.STATE_OPTIONS.map(function (o) {
            return '<option value="' + o + '"' + (cur === o ? " selected" : "") + ">" + o + "</option>";
          }).join("") +
          "</select>";
      }
      return (
        '<div class="fleet-card' + selCls + '">' +
        '<button type="button" class="card-btn" aria-pressed="' + (ui.dossierSel === r.id ? "true" : "false") + '"' +
        ' data-kbd="res-' + esc(r.id) + '" data-action="select-resource" data-id="' + esc(r.id) + '">' +
        '<span class="name">' + KindIcon(r.kind) + "<span>" + esc(r.label) + "</span></span>" +
        '<span class="chips">' + StateChip(r.state) +
        (r.project !== "aurora" && r.project !== "—" ? '<span class="proj">' + esc(r.project) + "</span>" : "") +
        "</span>" +
        '<span class="meta">' + money(r.costPerDay) + "/d · " + esc(r.provMethod) + "</span>" +
        "</button>" +
        classify +
        "</div>"
      );
    }).join("");

    var html = SectionCard(
      { kicker: "station 01", title: "Fleet Deck — every resource, one lifecycle truth" },
      '<p class="muted-p" style="margin-bottom:0.75rem">Click a resource to open its dossier. The four cards with a <span class="mono" style="color:var(--teal-300)">?</span> selector are waiting for your lifecycle-state classification (objective M2).</p>' +
      '<div class="fleet-grid">' + cards + "</div>"
    );
    if (selected) html += Dossier(selected, ui.dossierChanged);
    if (s.mode === "HARD") html += TriageBoard();
    return html;
  }

  // ---------- LAUNCH ----------
  function StationLaunch() {
    var s = ORBIT.STORE.get();
    var lifecycleBoard = SectionCard(
      { kicker: "lifecycle board", title: "The four phases of a cloud resource's life", id: "lifecycle-board" },
      '<p class="muted-p" style="margin-bottom:0.75rem">Objective M1 · Every resource in the Fleet Deck is somewhere on this board. Put the phases in the order the lesson teaches them.</p>' +
      SequenceBoard({
        steps: D.LIFECYCLE_STEPS,
        value: s.lifecycleSeq,
        board: "lifecycleSeq",
        objId: "M1",
        warnings: { deprov: "Nothing gets retired before it exists, runs, and is maintained — the retirement card cannot come first." },
      }) +
      '<p class="seq-count">target order hidden · ' + s.lifecycleSeq.length + "/" + E.SEQ_LIFECYCLE.length + " placed</p>"
    );

    var provCards =
      '<div class="prov-grid">' +
      '<button type="button" role="radio" aria-checked="' + (s.provision.method === "console" ? "true" : "false") + '"' +
      ' class="prov-card' + (s.provision.method === "console" ? " is-on" : "") + '" data-kbd="prov-console"' +
      ' data-action="set-prov" data-v="console">' +
      '<span class="t">' + icon("terminal-square", "ic16") + " Manual console provisioning</span>" +
      '<span class="d">An engineer clicks through the wizard. Fast for a one-off; every build differs slightly; nothing is written down.</span>' +
      "</button>" +
      '<button type="button" role="radio" aria-checked="' + (s.provision.method === "iac" ? "true" : "false") + '"' +
      ' class="prov-card' + (s.provision.method === "iac" ? " is-on" : "") + '" data-kbd="prov-iac"' +
      ' data-action="set-prov" data-v="iac">' +
      '<span class="t">' + icon("file-code-2", "ic16 iac") + " IaC template (pipeline)</span>" +
      '<span class="d">A versioned template builds the tier identically anywhere, with tags attached at birth.</span>' +
      "</button></div>";

    var iacBlock =
      '<div class="iac-block" style="opacity:' + (s.provision.method === "iac" ? "1" : "0.45") + '">' +
      '<p class="lbl">Why IaC — tick at least three reasons</p>' +
      '<div class="iac-reasons">' +
      D.IAC_REASONS.map(function (r) {
        return ChipToggle({
          selected: s.provision.reasons.indexOf(r.id) !== -1,
          action: "toggle-list",
          params: { path: "provision.reasons", id: r.id },
          kbd: "iac-" + r.id,
          label: esc(r.label),
        });
      }).join("") +
      "</div>" +
      '<pre class="template-pre" aria-label="IaC template preview">' + esc(D.TEMPLATE_SNIPPET.join("\n")) + "</pre>" +
      '<p class="template-note">Template preview — note the tags block and the scaling block. Golden image GI-2026.09 carries the CVE fix.</p>' +
      "</div>";

    var provCard = SectionCard(
      { kicker: "provisioning decision", title: "The finale tier must be rebuilt in 3 regions next month. How do you build it?" },
      provCards + iacBlock
    );

    var html = lifecycleBoard + provCard;

    if (s.mode === "HARD") {
      html += SectionCard(
        { kicker: "rollout sequencer", title: "Order the eight steps: from template to clean fleet", id: "rollout-seq" },
        '<p class="muted-p" style="margin-bottom:0.75rem">Objective H2 · The new tier goes live before the premiere. Governance bookends included — sequence all eight.</p>' +
        SequenceBoard({ steps: D.LAUNCH_STEPS, value: s.launchSeq, board: "launchSeq", tone: "danger", objId: "H2" }) +
        '<p class="seq-count">' + s.launchSeq.length + "/" + E.SEQ_LAUNCH.length + " placed</p>"
      );
    }

    html += '<p class="footnote">' + icon("rocket", "ic12") + " Provisioning is the only lifecycle phase where prevention is free — everything later is repair.</p>";
    return html;
  }

  // ---------- SCALE ----------
  function StationScale() {
    var s = ORBIT.STORE.get();
    var ui = ORBIT.APP.ui;

    var asgGrid =
      '<div class="asg-grid">' +
      NumField({ label: "min nodes", value: s.asg.min, min: 0, max: 8, step: 1, field: "min", kbd: "asg-min", action: "set-asg", hint: "always-on floor (HA)" }) +
      NumField({ label: "desired nodes", value: s.asg.desired, min: 0, max: 12, step: 1, field: "desired", kbd: "asg-desired", action: "set-asg", hint: "steady-state fleet" }) +
      NumField({ label: "max nodes", value: s.asg.max, min: 1, max: 50, step: 1, field: "max", kbd: "asg-max", action: "set-asg", hint: "ceiling — cost guardrail" }) +
      NumField({ label: "CPU trigger %", value: s.asg.threshold, min: 20, max: 95, step: 5, field: "threshold", kbd: "asg-threshold", action: "set-asg", hint: "fire BEFORE users hurt" }) +
      NumField({ label: "eval window min", value: s.asg.windowMin, min: 1, max: 20, step: 1, field: "windowMin", kbd: "asg-window", action: "set-asg", hint: "sustained before firing" }) +
      NumField({ label: "cooldown min", value: s.asg.cooldown, min: 1, max: 30, step: 1, field: "cooldown", kbd: "asg-cooldown", action: "set-asg", hint: "quiet period after action" }) +
      "</div>";

    var runBtn =
      '<div class="sim-row">' +
      '<button type="button" class="btn-run"' + (s.simState === "running" ? " disabled" : "") +
      ' data-kbd="run-sim" data-action="run-sim">' + icon("play", "ic16") + " " +
      (s.simState === "running" ? "Simulating…" : "RUN finale load simulation (6×)") + "</button>" +
      '<p class="note">Opt-in simulator — runs a scripted 6× ramp against your working copy.</p>' +
      "</div>" +
      '<div style="margin-top:0.75rem">' + SimConsole(s.simLog, s.simState, s.simOutcome) + "</div>";

    var m6 = "";
    if (s.simState === "done") {
      m6 =
        '<div class="m6-block">' +
        '<p class="lbl">Objective M6 · What scaling approach did the console just perform?</p>' +
        OptRow({
          name: "scaling approach",
          value: s.scaleApproach,
          path: "scaleApproach",
          kbd: "m6",
          options: [
            { id: "horizontal", label: "Horizontal — added interchangeable nodes behind edge-lb (scale-out)" },
            { id: "vertical", label: "Vertical — resized the existing node bigger (scale-up)" },
          ],
        }) +
        "</div>";
    }

    var asgCard = SectionCard(
      { kicker: "auto-scaler console · asg-web-prod", title: "Repair the scaling policy for finale traffic" },
      '<p class="muted-p" style="margin-bottom:0.75rem">Objective M5 · Deployed policy (from TL-02): min 1 / max 2 / CPU&gt;90% for 15 min / cooldown 30 min — it saturated at 3.1× in load testing. The finale is 6×. Adjust the working copy below.</p>' +
      asgGrid + runBtn + m6
    );

    var html = asgCard;

    if (s.mode === "HARD") {
      var finaleGrid =
        '<div class="finale-grid">' +
        ToggleRow({ label: "Scheduled pre-scale", desc: "pre-warm the fleet before the ramp", checked: s.finaleCfg.scheduled, path: "finaleCfg.scheduled", kbd: "fin-scheduled" }) +
        '<div class="field"><p class="lbl" style="margin-bottom:0.375rem;font-size:11px;color:var(--stone-300)">Pre-scale time</p>' +
        '<select class="select" aria-label="pre-scale time" data-kbd="fin-pretime" data-action="set-select" data-path="finaleCfg.preTime">' +
        '<option value="none"' + (s.finaleCfg.preTime === "none" ? " selected" : "") + ">none</option>" +
        '<option value="1930"' + (s.finaleCfg.preTime === "1930" ? " selected" : "") + ">19:30 (forecast ramp start)</option>" +
        '<option value="2000"' + (s.finaleCfg.preTime === "2000" ? " selected" : "") + ">20:00 (event start)</option>" +
        "</select></div>" +
        ToggleRow({ label: "Dynamic CPU trigger armed", desc: "react to real noise mid-event", checked: s.finaleCfg.dynamic, path: "finaleCfg.dynamic", kbd: "fin-dynamic" }) +
        NumField({ label: "finale trigger %", value: s.finaleCfg.threshold, min: 20, max: 95, step: 5, field: "threshold", kbd: "fin-threshold", action: "set-finale" }) +
        NumField({ label: "finale max nodes", value: s.finaleCfg.max, min: 1, max: 50, step: 1, field: "max", kbd: "fin-max", action: "set-finale", hint: "what can the anomaly buy?" }) +
        NumField({ label: "finale cooldown min", value: s.finaleCfg.cooldown, min: 1, max: 30, step: 1, field: "cooldown", kbd: "fin-cooldown", action: "set-finale" }) +
        "</div>";
      html += SectionCard(
        { kicker: "finale-night console", title: "Scheduled + dynamic + a ceiling the anomaly cannot weaponize" },
        '<p class="muted-p" style="margin-bottom:0.75rem">Objective H3 · Two scripted hazards: the 20:00 premiere ramp (6×) and a 22:40 anomaly — one node fabricates CPU load (no traffic). Configure, then run the full-night simulation.</p>' +
        finaleGrid +
        '<div class="sim-row"><button type="button" class="btn-run"' + (s.finaleState === "running" ? " disabled" : "") +
        ' data-kbd="run-finale" data-action="run-finale-sim">' + icon("play", "ic16") + " " +
        (s.finaleState === "running" ? "Simulating…" : "RUN finale night (spike + anomaly)") + "</button></div>" +
        '<div style="margin-top:0.75rem">' + SimConsole(s.finaleLog, s.finaleState, s.finaleOutcome) + "</div>"
      );
    }

    var triggers =
      '<div class="triggers">' +
      D.TRIGGER_PATTERNS.map(function (p) {
        var open = ui.openTrigger === p.id;
        var ic = p.id === "p-premiere" ? "calendar-clock" : p.id === "p-cpu" ? "gauge" : p.id === "p-forecast" ? "trending-up" : "user";
        var match = s.triggerMatch[p.id]
          ? '<span class="match">→ ' + esc(s.triggerMatch[p.id]) + "</span>"
          : "";
        return (
          '<div class="trigger-item' + (open ? " open" : "") + '">' +
          '<button type="button" aria-expanded="' + (open ? "true" : "false") + '" data-kbd="trig-' + esc(p.id) + '"' +
          ' data-action="toggle-trigger" data-id="' + esc(p.id) + '">' +
          icon(ic, "ic16") +
          '<span class="ptext">' + esc(p.text) + "</span>" +
          match +
          '<span class="chev">' + icon("chevron-up", "ic14") + "</span>" +
          "</button>" +
          (open
            ? '<div class="trigger-panel">' +
              OptRow({
                name: "trigger for " + p.id,
                value: s.triggerMatch[p.id] || "",
                path: "triggerMatch." + p.id,
                kbd: "trig-" + p.id,
                options: D.TRIGGER_TYPES.map(function (t) {
                  return { id: t.id, label: t.label + " — " + t.desc };
                }),
              }) +
              "</div>"
            : "") +
          "</div>"
        );
      }).join("") +
      "</div>";

    html += SectionCard(
      { kicker: "trigger matching", title: "Four patterns, four trigger types" },
      '<p class="muted-p" style="margin-bottom:0.75rem">Objective M7 · Open a pattern, then pick the trigger type that belongs to it.</p>' + triggers
    );
    return html;
  }

  // ---------- PATCH BAY ----------
  function StationPatch() {
    var s = ORBIT.STORE.get();
    var bulletin =
      '<div class="bulletin note-card" role="note">' +
      '<p class="t">' + icon("shield-check", "ic16") + " " + esc(D.VULN_BULLETIN.cve) + " · CVSS " + esc(D.VULN_BULLETIN.cvss) + "</p>" +
      '<p class="d">' + esc(D.VULN_BULLETIN.detail) + "</p>" +
      '<p class="tl">TL-12: web-prod-04 and staging-02 affected · golden image GI-2026.09 carries the fix.</p>' +
      "</div>";

    var updateCard = SectionCard(
      { kicker: "update decision", title: "The fleet runs app-OS 3.2. The vendor offers 3.7 and 4.1. Finale is Friday." },
      '<p class="muted-p" style="margin-bottom:0.75rem">Objective M8 · 3.7 = same major version (security &amp; stability fixes). 4.1 = new major version (breaking changes, needs a full staging cycle). Choose what ships now — and when.</p>' +
      OptRow({
        name: "OS update to deploy",
        value: s.updateChoice.version,
        path: "updateChoice.version",
        kbd: "m8-ver",
        options: [
          { id: "v3.7", label: "3.7 — minor update within the same major version" },
          { id: "v4.1", label: "4.1 — major version jump (breaking changes)" },
        ],
      }) +
      '<p class="opt-label">Maintenance window</p>' +
      OptRow({
        name: "maintenance window",
        value: s.updateChoice.window,
        path: "updateChoice.window",
        kbd: "m8-win",
        options: [
          { id: "fri-1900", label: "Friday 19:00 — one hour before the premiere" },
          { id: "sun-0200", label: "Sunday 02:00 — quietest weekly slot" },
          { id: "none", label: "No window — deploy when ready" },
        ],
      })
    );

    var campaignCard = SectionCard(
      { kicker: "patch campaign planner · web tier", title: "Get GI-2026.09 onto the web tier with zero downtime" },
      '<p class="muted-p" style="margin-bottom:0.75rem">Objective M9 · web nodes are interchangeable and sit behind edge-lb. Choose the strategy and the safety rails.</p>' +
      OptRow({
        name: "update strategy",
        value: s.patch.strategy,
        path: "patch.strategy",
        kbd: "m9-strat",
        options: [
          { id: "inplace", label: "In-place — patch all nodes where they stand" },
          { id: "rolling", label: "Rolling — replace nodes in small batches behind the LB" },
          { id: "canary", label: "Canary — small traffic slice first, then full rollout" },
          { id: "bluegreen", label: "Blue-green — full parallel environment, one traffic switch" },
        ],
      }) +
      '<p class="opt-label">Batch size</p>' +
      OptRow({
        name: "batch size",
        value: s.patch.batch,
        path: "patch.batch",
        kbd: "m9-batch",
        options: [
          { id: "all", label: "All nodes at once" },
          { id: "half", label: "Half the fleet per batch" },
          { id: "one", label: "One node at a time" },
        ],
      }) +
      '<div class="patch-rails">' +
      ToggleRow({ label: "Health checks", desc: "failed node never rejoins the LB", checked: s.patch.healthCheck, path: "patch.healthCheck", kbd: "m9-health" }) +
      ToggleRow({ label: "Auto-rollback", desc: "bad batch is pulled automatically", checked: s.patch.rollback, path: "patch.rollback", kbd: "m9-rollback" }) +
      '<div class="field"><p class="lbl" style="margin-bottom:0.375rem;font-size:11px;color:var(--stone-300)">Window</p>' +
      '<select class="select" aria-label="campaign window" data-kbd="m9-window" data-action="set-select" data-path="patch.window">' +
      '<option value=""' + (s.patch.window === "" ? " selected" : "") + ">choose…</option>" +
      '<option value="sun-0200"' + (s.patch.window === "sun-0200" ? " selected" : "") + ">Sun 02:00</option>" +
      '<option value="fri-1900"' + (s.patch.window === "fri-1900" ? " selected" : "") + ">Fri 19:00</option>" +
      '<option value="none"' + (s.patch.window === "none" ? " selected" : "") + ">no window</option>" +
      "</select></div></div>"
    );

    var html = bulletin + updateCard + campaignCard;

    if (s.mode === "HARD") {
      var webCard =
        '<div class="tier-card"><p class="t">Web tier (stateless)</p>' +
        OptRow({
          name: "web strategy", value: s.tierStrategy.web, path: "tierStrategy.web", kbd: "h4-web",
          options: [{ id: "rolling", label: "Rolling" }, { id: "bluegreen", label: "Blue-green" }, { id: "inplace", label: "In-place" }],
        }) +
        '<p class="why">Justification (both required)</p>' +
        '<div class="reasons">' +
        ChipToggle({ selected: s.tierReasons.web.indexOf("stateless") !== -1, action: "toggle-list", params: { path: "tierReasons.web", id: "stateless" }, kbd: "h4-web-stateless", label: "Nodes are interchangeable (stateless)" }) +
        ChipToggle({ selected: s.tierReasons.web.indexOf("zerodowntime") !== -1, action: "toggle-list", params: { path: "tierReasons.web", id: "zerodowntime" }, kbd: "h4-web-zd", label: "LB keeps serving while batches swap" }) +
        "</div></div>";
      var dbCard =
        '<div class="tier-card"><p class="t">Orders DB (stateful)</p>' +
        OptRow({
          name: "db strategy", value: s.tierStrategy.db, path: "tierStrategy.db", kbd: "h4-db",
          options: [{ id: "rolling", label: "Rolling" }, { id: "bluegreen", label: "Blue-green (replica promotion)" }, { id: "inplace", label: "In-place" }],
        }) +
        '<p class="why">Justification (both required)</p>' +
        '<div class="reasons">' +
        ChipToggle({ selected: s.tierReasons.db.indexOf("stateful") !== -1, action: "toggle-list", params: { path: "tierReasons.db", id: "stateful" }, kbd: "h4-db-stateful", label: "Data must move intact — parallel world needed" }) +
        ChipToggle({ selected: s.tierReasons.db.indexOf("instantrollback") !== -1, action: "toggle-list", params: { path: "tierReasons.db", id: "instantrollback" }, kbd: "h4-db-ir", label: "Warm replica = instant switch-back" }) +
        "</div></div>";

      html += SectionCard(
        { kicker: "strategy per tier", title: "Two tiers, two very different bodies — choose and justify" },
        '<p class="muted-p" style="margin-bottom:0.75rem">Objective H4 · Constraints: zero downtime, rollback mandatory. Web = stateless pool behind edge-lb. Orders DB = stateful single writer with a warm replica.</p>' +
        '<div class="tier-grid">' + webCard + dbCard + "</div>"
      );

      html += SectionCard(
        { kicker: "blue-green cutover", title: "Execute the DB cutover: order the six steps" },
        '<p class="muted-p" style="margin-bottom:0.75rem">Objective H5 · Blue = live patched-before DB. Green = new GI-2026.09 world. Traffic moves exactly once.</p>' +
        SequenceBoard({ steps: D.H5_STEPS, value: s.cutoverSeq, board: "cutoverSeq", tone: "danger", objId: "H5", warnings: D.H5_WARNINGS }) +
        '<p class="seq-count">' + s.cutoverSeq.length + "/" + E.SEQ_CUTOVER.length + " placed</p>"
      );
    }
    return html;
  }

  // ---------- DEORBIT ----------
  function StationDeorbit() {
    var s = ORBIT.STORE.get();

    function findResource(id) {
      var r = null;
      D.FLEET.forEach(function (f) { if (f.id === id) r = f; });
      return r;
    }

    var halcyonChips = D.FLEET.map(function (r) {
      return ChipToggle({
        selected: s.halcyonSel.indexOf(r.id) !== -1,
        tone: r.project === "halcyon" ? "danger" : "default",
        action: "toggle-list",
        params: { path: "halcyonSel", id: r.id },
        kbd: "hlcy-" + r.id,
        label: '<span class="l1">' + esc(r.label) + '</span><span class="l2">project: ' + esc(r.project) + " · " + money(r.costPerDay) + "/d · " + esc(r.state) + "</span>",
      });
    }).join("");

    var orphanCard = SectionCard(
      { kicker: "decommission backlog", title: "Select every Project Halcyon resource still burning budget" },
      '<p class="muted-p" style="margin-bottom:0.75rem">Objective M10 · Halcyon closed in 2024 (TL-11: shutdown “partially complete”). TL-07 measured the damage. Select all that still bill.</p>' +
      '<div class="sel-grid">' + halcyonChips + "</div>" +
      '<p class="sel-count">selected ' + s.halcyonSel.length + " · halcyon-tagged burn: " + money(E.HALCYON_COST) + "/day of " + money(E.FLEET_TOTAL_COST) + "/day fleet total</p>"
    );

    var decomCard = SectionCard(
      { kicker: "decommission sequencer", title: "Safe decommission of hlcy-encoder — order the five steps" },
      '<p class="muted-p" style="margin-bottom:0.75rem">Objective M11 · Termination is irreversible. The order is the whole skill.</p>' +
      SequenceBoard({ steps: D.M11_STEPS, value: s.decomSeq, board: "decomSeq", objId: "M11", warnings: D.M11_WARNINGS }) +
      '<p class="seq-count">' + s.decomSeq.length + "/" + E.SEQ_DECOM.length + " placed</p>"
    );

    var storageCard = SectionCard(
      { kicker: "storage lifecycle policy · aurora-bucket", title: "Age the media assets: hot → archive → delete, and enforce tags" },
      '<p class="muted-p" style="margin-bottom:0.75rem">Objective M12 · 3.4 TB sits in hot tier with zero rules (TL-06: ~$360/mo). Retention contract: one year, rarely accessed after month one.</p>' +
      '<div class="patch-rails">' +
      Field({
        label: "archive transition (days)", value: String(s.storagePolicy.archiveAfter), path: "storagePolicy.archiveAfter",
        num: true, kbd: "m12-archive",
        options: [{ id: "30", label: "30 days" }, { id: "60", label: "60 days" }, { id: "90", label: "90 days" }, { id: "180", label: "180 days" }],
      }) +
      Field({
        label: "delete threshold (days)", value: String(s.storagePolicy.deleteAfter), path: "storagePolicy.deleteAfter",
        num: true, kbd: "m12-delete",
        options: [{ id: "90", label: "90 days" }, { id: "180", label: "180 days" }, { id: "365", label: "365 days" }, { id: "730", label: "730 days" }],
      }) +
      '<button type="button" role="switch" aria-checked="' + (s.storagePolicy.tagEnforce ? "true" : "false") + '"' +
      ' class="switch-inline' + (s.storagePolicy.tagEnforce ? " is-on" : "") + '" data-kbd="m12-tags" data-action="set-switch" data-path="storagePolicy.tagEnforce">' +
      "<span>Tag enforcement at provisioning<span class=\"sub\">team + env + cost-center required</span></span>" +
      '<span class="track"></span></button>' +
      "</div>"
    );

    var html = orphanCard + decomCard + storageCard;

    if (s.mode === "HARD") {
      var bucketCard = SectionCard(
        { kicker: "dependency trap · hlcy-bucket", title: "Decommission the 1.2 TB bucket WITHOUT breaking the monthly archive job" },
        '<p class="muted-p" style="margin-bottom:0.75rem">Objective H6 · TL-05: a job still reads this bucket monthly. TL-10: its deploy key was used 2 days ago. Sequence all six steps — wrong orders are rejected.</p>' +
        SequenceBoard({ steps: D.H6_STEPS, value: s.bucketSeq, board: "bucketSeq", tone: "danger", objId: "H6", warnings: D.H6_WARNINGS }) +
        '<p class="seq-count">' + s.bucketSeq.length + "/" + E.SEQ_BUCKET.length + " placed</p>"
      );

      function cls(name, title, fields) {
        return (
          '<div class="cls"><p class="t">' + esc(title) + "</p>" +
          fields.map(function (f) {
            return Field({
              label: f.label,
              value: (s.policyPack[name] || {})[f.key] || "",
              path: "policyPack." + name + "." + f.key,
              kbd: "h7-" + name + "-" + f.key,
              options: f.options,
            });
          }).join("") +
          "</div>"
        );
      }

      var policyCard = SectionCard(
        { kicker: "policy pack builder", title: "Author the lifecycle policy pack for three resource classes" },
        '<p class="muted-p" style="margin-bottom:0.75rem">Objective H7 · Prod stays conservative; staging gets cheap; data ages on rules. Configure all three classes exactly.</p>' +
        '<div class="policy-grid">' +
        cls("prod", "Prod VM", [
          { key: "cadence", label: "prod patch cadence", options: [{ id: "monthly+critical", label: "Monthly + critical within 72h" }, { id: "critical-only", label: "Critical only" }, { id: "weekly", label: "Weekly" }, { id: "never", label: "Never (golden image only)" }] },
          { key: "stop", label: "prod off-hours", options: [{ id: "none", label: "Runs 24/7" }, { id: "nights", label: "Auto-stop at night" }] },
          { key: "ttl", label: "prod TTL", options: [{ id: "none", label: "No TTL" }, { id: "90d", label: "Expire after 90 days" }] },
        ]) +
        cls("staging", "Staging VM", [
          { key: "cadence", label: "staging patch cadence", options: [{ id: "weekly", label: "Weekly" }, { id: "monthly+critical", label: "Monthly + critical" }, { id: "critical-only", label: "Critical only" }] },
          { key: "stop", label: "staging off-hours", options: [{ id: "none", label: "Runs 24/7" }, { id: "nights", label: "Auto-stop 20:00–07:00" }] },
          { key: "ttl", label: "staging TTL", options: [{ id: "none", label: "No TTL" }, { id: "30d", label: "Expire after 30 days" }, { id: "90d", label: "Expire after 90 days" }] },
        ]) +
        cls("bucket", "Media bucket", [
          { key: "hot", label: "bucket hot tier", options: [{ id: "0", label: "0 days" }, { id: "30", label: "30 days" }, { id: "90", label: "90 days" }] },
          { key: "archive", label: "bucket archive after", options: [{ id: "30", label: "30 days" }, { id: "90", label: "90 days" }, { id: "365", label: "365 days" }] },
          { key: "del", label: "bucket delete after", options: [{ id: "90", label: "90 days" }, { id: "365", label: "365 days" }, { id: "730", label: "730 days" }] },
          { key: "eol", label: "bucket EOL action", options: [{ id: "delete", label: "Delete" }, { id: "archive-only", label: "Archive only, never delete" }] },
        ]) +
        "</div>"
      );

      var cutChips = D.COST_CUT_IDS.map(function (id) {
        var r = findResource(id);
        return ChipToggle({
          selected: s.costCut.indexOf(id) !== -1, tone: "danger", action: "toggle-list",
          params: { path: "costCut", id: id }, kbd: "cut-" + id,
          label: '<span class="mono" style="font-size:10px">' + esc(r.label) + " · " + money(r.costPerDay) + "/d</span>",
        });
      }).join("");
      var protectChips = D.COST_PROTECT_IDS.map(function (id) {
        return ChipToggle({
          selected: s.costProtect.indexOf(id) !== -1, action: "toggle-list",
          params: { path: "costProtect", id: id }, kbd: "protect-" + id,
          label: '<span class="mono" style="font-size:10px">' + esc(id) + "</span>",
        });
      }).join("");

      var costCard = SectionCard(
        { kicker: "cost triage · CTO memo TL-14", title: "Cut 40% of ops spend — protect the finale SLA and DR posture" },
        '<p class="cost-memo">' + icon("banknote", "ic16") + "<span>Fleet burn: " + money(E.FLEET_TOTAL_COST) + "/day (TL-07). Halcyon remnants: " + money(E.HALCYON_COST) + "/day. The memo: “no impact to the finale SLA or the DR posture” — and DR-07 protects the replica.</span></p>" +
        '<div class="cost-grid">' +
        '<div class="cost-col cut"><p class="t">' + icon("trash-2", "ic14") + " CUT — deprovision these</p><div class=\"list\">" + cutChips + "</div></div>" +
        '<div class="cost-col protect"><p class="t">' + icon("shield-off", "ic14") + " PROTECT — explicitly off-limits</p><div class=\"list\">" + protectChips + "</div></div>" +
        "</div>"
      );

      html += bucketCard + policyCard + costCard;
    }

    html += '<p class="footnote">' + icon("rocket", "ic12") + " Deprovisioning is the phase everyone skips — and the one that pays the bonus: cost, patch surface, credential risk all end here.</p>";
    return html;
  }

  // ---------- TELEMETRY ----------
  function StationTelemetry() {
    var s = ORBIT.STORE.get();
    var log =
      '<ol class="telemetry-list" aria-live="polite" aria-label="telemetry log">' +
      D.TELEMETRY.map(function (t) {
        return (
          "<li><span class=\"tid\">" + esc(t.id) + "</span>" +
          '<span class="ttime">' + esc(t.day) + " " + esc(t.time) + "</span>" +
          '<span class="ttag tag-' + esc(t.tag) + '">' + esc(t.tag) + "</span>" +
          '<span class="ttext">' + esc(t.text) + "</span></li>"
        );
      }).join("") +
      "</ol>";

    var html = SectionCard(
      { kicker: "event stream · D-6 → now", title: "Fleet telemetry — the lifecycle's paper trail" },
      '<p class="muted-p" style="margin-bottom:0.75rem;display:flex;align-items:center;gap:0.5rem">' + icon("radio", "ic14") + " Every provisioning, scaling, patch and deletion event lands here. Objectives quote these line IDs as evidence.</p>" + log
    );

    if (s.mode === "HARD") {
      var anomalyChips = D.ANOMALY_LINES.map(function (l) {
        return ChipToggle({
          selected: s.anomalyLines.indexOf(l.id) !== -1,
          action: "toggle-list",
          params: { path: "anomalyLines", id: l.id },
          kbd: "ta-" + l.id,
          label: '<span class="txt">' + esc(l.text) + "</span>",
        });
      }).join("");

      html += SectionCard(
        { kicker: "incident replay · D-2 03:xx", title: "Prove the hijack, then order the containment" },
        '<p class="replay-intro">' + icon("scroll-text", "ic16") + "<span>Objective H9 · Last night one web node went to 97% CPU with <em>no matching traffic</em> and the autoscaler cheered it on. Select the three lines that PROVE the node was compromised — consequences are not proof.</span></p>" +
        '<div class="anomaly-list">' + anomalyChips + "</div>" +
        '<p class="opt-label" style="margin-top:0.75rem">Containment — order the four actions</p>' +
        SequenceBoard({ steps: D.CONTAIN_STEPS, value: s.containmentSeq, board: "containmentSeq", tone: "danger", objId: "H9" }) +
        '<p class="seq-count">' + s.containmentSeq.length + "/" + E.SEQ_CONTAIN.length + " placed</p>"
      );
    }
    return html;
  }

  // ---------- CERT CHECK (C5 quiz) ----------
  function QuizBay() {
    var s = ORBIT.STORE.get();
    var qs = D.QUIZ[s.mode];
    var stats = E.quizStats(s);

    if (s.quizDone) {
      var perfect = stats.correct === stats.total;
      return (
        '<div class="quiz-done">' +
        icon("award", "ic32 award") +
        "<h3>Cert check complete</h3>" +
        '<p class="score">' + stats.correct + "/" + stats.total + " correct</p>" +
        '<p class="msg">' + (perfect
          ? "Flawless. You are exam-ready on lifecycle management — go take the Debrief victory lap."
          : "Review the explanations above, then retake if you want a clean sweep — the tracker accepts retakes.") + "</p>" +
        '<div class="retake"><button type="button" class="btn" data-kbd="quiz-retake" data-action="quiz-retake">' +
        icon("rotate-ccw", "ic14") + " Retake</button></div>" +
        "</div>"
      );
    }

    var q = qs[s.quizIdx];
    var picked = s.quizAnswers[q.id];
    var show = picked !== undefined;

    var opts = q.options.map(function (o, i) {
      var isPicked = picked === i;
      var pickedCorrect = show && isPicked && i === q.answer;
      var pickedWrong = show && isPicked && i !== q.answer;
      var cls = "quiz-opt" +
        (pickedCorrect ? " picked-correct" : "") +
        (pickedWrong ? " picked-wrong" : "") +
        (show && !isPicked ? " dim" : "");
      return (
        '<button type="button" role="radio" aria-checked="' + (isPicked ? "true" : "false") + '"' +
        (show ? " disabled" : "") +
        ' class="' + cls + '" data-kbd="quiz-' + esc(q.id) + "-" + i + '"' +
        ' data-action="quiz-pick" data-i="' + i + '">' +
        '<span class="abc">' + "ABCD"[i] + ".</span>" + esc(o) +
        (pickedCorrect ? '<span class="mark">✓ correct</span>' : "") +
        (pickedWrong ? '<span class="mark">✗ incorrect</span>' : "") +
        "</button>"
      );
    }).join("");

    var explain = "";
    if (picked !== undefined) {
      explain =
        '<div class="quiz-explain" aria-live="polite"><span class="why">why</span>' +
        esc(q.explain) + "</div>";
    }

    var isLast = s.quizIdx + 1 === qs.length;
    return (
      '<div class="quiz-card">' +
      '<div class="quiz-head"><p class="l">Cert check · question ' + (s.quizIdx + 1) + "/" + qs.length + '</p>' +
      '<p class="r">' + (s.mode === "HARD" ? "scenario-based" : "concept check") + "</p></div>" +
      '<h3 class="quiz-q">' + esc(q.q) + "</h3>" +
      '<div class="quiz-opts" role="radiogroup" aria-label="' + esc(q.q) + '">' + opts + "</div>" +
      explain +
      '<div class="quiz-foot">' +
      '<button type="button" class="btn btn-primary"' + (picked === undefined ? " disabled" : "") +
      ' data-kbd="quiz-next" data-action="' + (isLast ? "quiz-finish" : "quiz-next") + '">' +
      (isLast ? "Finish check" : "Next question") + "</button>" +
      "</div></div>"
    );
  }

  // ---------- DEBRIEF (C6) ----------
  function Debrief() {
    var s = ORBIT.STORE.get();

    var detection =
      '<ul class="debrief-list">' +
      D.DETECTION_OPS.map(function (d) {
        return (
          '<li><div class="debrief-item-card">' +
          '<p class="src">' + esc(d.src) + "</p>" +
          '<p class="logic">' + esc(d.logic) + "</p>" +
          "</div></li>"
        );
      }).join("") +
      "</ul>";

    var mitigation =
      '<ul class="mit-list">' +
      '<li>' + icon("wrench", "ic14") + "<span><span class=\"mid\">M1051 Update Software</span> — keep golden images current; re-deploy via rolling/canary/blue-green rather than hand-patching. The lifecycle’s “maintain” phase, weaponized for defenders.</span></li>" +
      '<li>' + icon("wrench", "ic14") + "<span><span class=\"mid\">Lifecycle governance controls</span> — tagging at birth, drift detection, TTLs &amp; storage tiering policies, auto-stop for non-prod, mandatory decommission runbooks (deps → snapshot → revoke → delete → CMDB). These are the compounding controls that shrink attack surface every single day.</span></li>" +
      '<li>' + icon("wrench", "ic14") + "<span><span class=\"mid\">Bounding the amplifiers</span> — autoscaler max ceilings and cooldowns are security controls: they cap how hard fabricated load (T1496) can hurt you.</span></li>" +
      "</ul>";

    var blueTakeaways =
      "<ul class=\"bullets\">" +
      "<li>Inventory is destiny: you cannot patch, scale or retire what you have not noticed. Drift scans and orphan hunts are detection work.</li>" +
      "<li>Evidence beats vibes: CPU without traffic, credentials moving after their project died, cost without a change record.</li>" +
      "<li>Sequences are controls: dependencies → snapshot → revoke → delete → records. Skip a step and you have bought an outage or a foothold.</li>" +
      "<li>Observability is a lifecycle feature — triggers, budgets and compliance reports are how the fleet talks to you.</li>" +
      "</ul>";

    var redTakeaways =
      "<ul class=\"bullets\">" +
      "<li>Untagged, out-of-pipeline resources are the softest target: no owner, no patch cadence, no one watching (T1580 discovery finds them first).</li>" +
      "<li>Orphaned storage and stale keys outlive everyone’s memory — forgotten data (T1530) and forgotten credentials (T1078.004) are gifts that keep giving.</li>" +
      "<li>Compromise + auto-scaling = your budget pays for the attacker’s workload (T1496). The cap is the tripwire.</li>" +
      "<li>Every resource you retire cleanly removes a chapter from the next attacker’s playbook.</li>" +
      "</ul>";

    function section(title, inner) {
      return (
        '<section class="section-card debrief-section" aria-label="' + esc(title) + '">' +
        "<h3>" + icon("radar", "ic16") + esc(title) + "</h3>" + inner + "</section>"
      );
    }

    var refs =
      '<ul class="refs">' +
      D.REFS.map(function (l) {
        return '<li><a href="' + esc(l.href) + '" target="_blank" rel="noopener noreferrer">' + icon("external-link", "ic12") + esc(l.label) + "</a></li>";
      }).join("") +
      "</ul>" +
      '<p class="refs-note">' + (s.mode === "HARD" ? "Night shift cleared." : "Day shift cleared.") + " Lesson 3.1 covered end-to-end: provisioning → scaling → updates → deprovisioning → governance.</p>";

    return (
      '<div class="stack-4">' +
      section("Detection opportunities — what to watch after this lesson", detection) +
      section("Mitigation recommendations — with official IDs", mitigation) +
      '<div class="takeaways">' +
      section("Blue-team takeaways", blueTakeaways) +
      section("Red-team mindset (defensive use)", redTakeaways) +
      "</div>" +
      section("Reference links (open in a new tab)", refs) +
      "</div>"
    );
  }

  // ---------- MISSION COMPLETE (C7) ----------
  function CompleteModal() {
    var s = ORBIT.STORE.get();
    var stats = E.labStats(s);
    var pillars = E.pillarStats(s);
    var quizTotal = D.QUIZ[s.mode].length;
    var quizCorrect = D.QUIZ[s.mode].filter(function (q) { return s.quizAnswers[q.id] === q.answer; }).length;

    // R8: focus areas from the student's own evidence — quiz misses first,
    // then objectives that took retries or hints.
    var focus = [];
    if (s.quizDone) {
      D.QUIZ[s.mode].forEach(function (q) {
        var picked = s.quizAnswers[q.id];
        if (picked !== undefined && picked !== q.answer) {
          var f = D.QUIZ_FOCUS[q.id];
          if (f) focus.push({ key: q.id, area: f.area, detail: "Cert check: " + q.id + " answered incorrectly", review: f.review });
        }
      });
    }
    stats.ids.forEach(function (id) {
      var a = s.attempts[id] ?? 0;
      var h = s.hintsUsed[id] ?? 0;
      if (a > 1 || h > 0) {
        var obj = null;
        D.OBJECTIVES[s.mode].forEach(function (o) { if (o.id === id) obj = o; });
        if (obj) {
          focus.push({
            key: id,
            area: id + " · " + (obj.title.length > 58 ? obj.title.slice(0, 55) + "…" : obj.title),
            detail: a + " attempt" + (a > 1 ? "s" : "") + (h ? " · " + h + " hint" + (h > 1 ? "s" : "") + " used" : ""),
            review: D.BAY_REVIEW[obj.bay] || "Flight manual",
          });
        }
      }
    });
    var focusTop = focus.slice(0, 6);

    var starsHtml = "";
    for (var i = 1; i <= 5; i++) {
      starsHtml += icon("star", i <= stats.stars ? "ic24 star-on" : "ic24");
    }

    var focusHtml;
    if (focusTop.length === 0) {
      focusHtml =
        '<p class="none">No weak spots in the evidence: first-attempt validations, no hints, and a clean cert check. To push mastery further, re-run the other shift — the Night shift audits the same lifecycle with stricter sets and traps.</p>';
    } else {
      focusHtml =
        '<ul class="focus-list">' +
        focusTop.map(function (f) {
          return (
            "<li><p class=\"area\">" + esc(f.area) + "</p>" +
            '<p class="detail">' + esc(f.detail) + "</p>" +
            '<p class="review">Review: ' + esc(f.review) + "</p></li>"
          );
        }).join("") +
        "</ul>";
    }

    var pillarRows = ["P1", "P2", "P3", "P4"].map(function (p) {
      return (
        '<div class="pillar-row">' +
        PillarBadge(p) +
        '<div class="bar"><div style="width:' + (pillars[p].done / pillars[p].total) * 100 + '%"></div></div>' +
        '<span class="cnt">' + pillars[p].done + "/" + pillars[p].total + " " + esc(D.PILLAR_LABELS[p]) + "</span>" +
        "</div>"
      );
    }).join("");

    return (
      '<div class="modal-panel" role="dialog" aria-modal="true" aria-label="mission complete">' +
      '<button type="button" class="modal-close" aria-label="Close completion report" data-kbd="modal-close" data-action="close-complete">' + icon("x", "ic20") + "</button>" +
      '<p class="modal-kicker">Mission complete</p>' +
      '<h2 class="modal-title">Lifecycle management — mastered.</h2>' +
      '<p class="modal-sub">CV0-004 Lesson 3.1 · ' + (s.mode === "HARD" ? "Night shift" : "Day shift") + " · all " + stats.total + " objectives validated</p>" +
      '<div class="score-box">' +
      "<div><p class=\"pct\">" + stats.pct + "<small>%</small></p><p class=\"lbl\">mastery score</p></div>" +
      '<div class="stars" role="img" aria-label="' + stats.stars + ' of 5 stars">' + starsHtml + "</div>" +
      "</div>" +
      '<p class="score-note">Stars reflect first-attempt accuracy and hint usage. Quiz: ' + quizCorrect + "/" + quizTotal + ". " +
      (stats.pct < 90
        ? "Retake check results (RESET in the HUD) for a cleaner run — or wear the hints proudly."
        : "Clinical work.") + "</p>" +
      '<div class="pillar-rows">' + pillarRows + "</div>" +
      '<div class="focus-box"><p class="t">' + icon("crosshair", "ic14") + " Focus areas — drill these next</p>" + focusHtml + "</div>" +
      '<div class="next-box"><p class="t">' + icon("book-marked", "ic14") + " What next</p>" +
      "<ul>" +
      "<li>· CV0-004 3.x next: backup &amp; recovery, DR strategies — the other half of Operations.</li>" +
      "<li>· DevOps domain: CI/CD pipelines and IaC deep-dive (you have the “why”, get the “how”).</li>" +
      "<li>· Re-run the DEBRIEF detection ideas on a real (or home-lab) fleet — inventory first, always.</li>" +
      "</ul></div>" +
      '<div class="modal-foot">' +
      '<button type="button" class="btn btn-primary" data-kbd="modal-back" data-action="close-complete">Back to console</button>' +
      '<button type="button" class="btn" data-kbd="modal-debrief" data-action="complete-open-debrief">Open debrief</button>' +
      "</div></div>"
    );
  }

  // ---------- reset dialog ----------
  function ResetDialog() {
    return (
      '<div class="dialog" role="alertdialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-desc">' +
      '<h2 id="reset-title">Reset the console?</h2>' +
      '<p class="d" id="reset-desc">Wipes saved progress, objective results and the quiz for BOTH shifts, and returns to mission select. This cannot be undone.</p>' +
      '<div class="foot">' +
      '<button type="button" class="btn-dialog" data-kbd="reset-cancel" data-action="close-reset">Keep my shift</button>' +
      '<button type="button" class="btn-dialog danger" data-kbd="reset-do" data-action="do-reset">Reset everything</button>' +
      "</div></div>"
    );
  }

  // ---------- flight manual sheet wrapper ----------
  function ManualSheet() {
    return (
      '<div class="sheet-overlay" data-action="close-manual"></div>' +
      '<div class="sheet" role="dialog" aria-modal="true" aria-label="Flight manual">' +
      '<div class="sheet-head"><p class="t">Flight manual</p>' +
      '<p class="d">Knowledge core — lifecycle, scaling, updates, deprovisioning + glossary.</p></div>' +
      '<button type="button" class="sheet-close" aria-label="Close flight manual" data-kbd="sheet-close" data-action="close-manual">' + icon("x", "ic20") + "</button>" +
      Manual() +
      "</div>"
    );
  }

  function Overlay(inner) {
    return '<div class="overlay" data-overlay-backdrop="1">' + inner + "</div>";
  }

  return {
    esc: esc,
    Gate: Gate,
    HudRight: HudRight,
    Rail: Rail,
    Director: Director,
    ManualSheet: ManualSheet,
    Overlay: Overlay,
    CompleteModal: CompleteModal,
    ResetDialog: ResetDialog,
    StationFleet: StationFleet,
    StationLaunch: StationLaunch,
    StationScale: StationScale,
    StationPatch: StationPatch,
    StationDeorbit: StationDeorbit,
    StationTelemetry: StationTelemetry,
    QuizBay: QuizBay,
    Debrief: Debrief,
    SequenceBoard: SequenceBoard,
  };
})();
