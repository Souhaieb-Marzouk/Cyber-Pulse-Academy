/* ─────────────────────────────────────────────────────────────────────────────
 * ui.js — rendering layer for the static lab. Ported from the original React
 * components (MissionBar, ModeGate, Briefing, Codex, Cutaway, Ledger,
 * QuizSection, Debrief, CompletionModal) with identical content, states and
 * visual treatment. Rendering is string-based; zones re-render on state
 * changes; focus is preserved via data-fkey attributes.
 * ───────────────────────────────────────────────────────────────────────────── */

/* ─── helpers ──────────────────────────────────────────────────────────────── */

function esc(s) {
  return String(s === undefined || s === null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* Lucide-style inline SVG icons (exact 24×24 stroke path data). */
var ICON_PATHS = {
  "alert-triangle": '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  "arrow-down": '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
  "arrow-up": '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
  award: '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
  "book-marked": '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="M10 7v8"/><path d="m13 11 3-3 3 3"/>',
  "book-open-check": '<path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z"/><path d="m9.5 8.5 2 2 4-4"/>',
  bug: '<path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/>',
  "check-circle": '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>',
  "chevron-down": '<path d="m6 9 6 6 6-6"/>',
  "chevron-right": '<path d="m9 18 6-6-6-6"/>',
  "chevron-up": '<path d="m18 15-6-6-6 6"/>',
  circle: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1"/>',
  compass: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
  "external-link": '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  "file-text": '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  "flask-conical": '<path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/>',
  "graduation-cap": '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  lightbulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  play: '<polygon points="6 3 20 12 6 21 6 3"/>',
  radar: '<path d="M19.07 4.93A10 10 0 0 0 6.99 3.34"/><path d="M4 6h.01"/><path d="M2.29 9.62a10 10 0 1 0 19.02-1.27"/><path d="M16.24 7.76a6 6 0 1 0-8.01 8.91"/><path d="M12 18h.01"/><path d="M17.99 11.66a6 6 0 0 1-2.22 4.75"/><circle cx="12" cy="12" r="2"/><path d="m13.41 10.59 5.66-5.66"/>',
  "radio-tower": '<path d="M4.9 16.1C1 12.2 1 5.8 4.9 1.9"/><path d="M7.8 4.7a6.14 6.14 0 0 0-.8 7.5"/><circle cx="12" cy="9" r="2"/><path d="M16.2 4.8c2 2 2.26 5.11.8 7.47"/><path d="M19.1 1.9a10 10 0 0 1 0 14.1"/><path d="M9.5 18h5"/><path d="m8 22 4-11 4 11"/>',
  "rotate-ccw": '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  "shield-check": '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  "x-circle": '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
};

function icon(name, cls) {
  return (
    '<svg class="ic' + (cls ? " " + cls : "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor"' +
    ' stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    (ICON_PATHS[name] || "") +
    "</svg>"
  );
}

function term(t) {
  return termLabel(t, null);
}

/* Glossary trigger with an explicit display label (the original <Term t=…>children</Term>). */
function termLabel(t, display) {
  var g = LAB.GLOSSARY.find(function (x) {
    return x.term.toLowerCase() === t.toLowerCase();
  });
  if (!g) return esc(display || t);
  return (
    '<button type="button" class="term" data-action="term" data-term="' + esc(g.term) + '"' +
    ' aria-label="Definition of ' + esc(g.term) + '">' + esc(display || g.term) + icon("info") + "</button>"
  );
}

function pillarBadge(pillar) {
  var m = LAB.PILLAR_META[pillar];
  return (
    '<span class="pillar ' + m.css + '" title="Mastery pillar: ' + m.label + '">' + m.label + "</span>"
  );
}

function verdictChip(verdict, deck) {
  var cls =
    verdict === "blocked" ? "verdict-blocked" : verdict === "detected" ? "verdict-detected" : "verdict-passed";
  var label =
    verdict === "blocked"
      ? "BLOCKED" + (deck ? " · deck " + deck : "")
      : verdict === "detected"
        ? "DETECTED"
        : "PASSED";
  return '<span class="verdict ' + cls + '">' + label + "</span>";
}

function dots(label, level) {
  var d = [1, 2, 3]
    .map(function (i) {
      return '<span class="dot' + (i <= level ? " dot-on" : "") + '"></span>';
    })
    .join("");
  return (
    '<span class="dots" title="' + label + ": " + level + '/3"><span class="dots-label">' + label +
    "</span>" + d + '<span class="sr-only">' + label + " " + level + " of 3</span></span>"
  );
}

function sectionHeader(id, kicker, title, sub) {
  return (
    '<div class="section-header">' +
    '<p class="kicker">' + kicker + "</p>" +
    '<h2 id="' + id + '" class="section-title">' + title + "</h2>" +
    (sub ? '<p class="section-sub">' + sub + "</p>" : "") +
    "</div>"
  );
}

/* ─── mission bar ──────────────────────────────────────────────────────────── */

function renderMissionBar(s) {
  var total = objectivesFor(s.mode).length;
  var passed = passedCount(s);
  var score = postureScore(s);
  var done = passed >= total;
  return (
    '<div class="missionbar-inner">' +
    '<div class="mb-brand">' +
    '<span class="mb-logo" aria-hidden="true">NC</span>' +
    "<div>" +
    '<p class="mb-title">' + esc(LAB.ORG.name) + " · Control Cutaway</p>" +
    '<p class="mb-sub">CV0-004 · 4.5 · synthetic training estate</p>' +
    "</div></div>" +
    '<div class="mb-stats">' +
    '<div class="mb-stat" title="Posture score — rises as you close control gaps">' +
    '<span class="mb-stat-label">Posture</span>' +
    '<div class="mb-bar"><div class="mb-bar-fill" style="width:' + score + '%"></div></div>' +
    '<span class="mb-score">' + score + "</span></div>" +
    '<div class="mb-stat" title="Objectives passed">' +
    '<span class="mb-stat-label">Ledger</span>' +
    '<span class="mb-count">' + passed + "/" + total + "</span>" +
    '<span class="led ' + (done ? "led-good" : "led-warn") + '" aria-hidden="true"></span></div>' +
    '<span class="badge-mode ' + (s.mode === "hard" ? "badge-hard" : "badge-medium") + '">' +
    (s.mode === "hard" ? "Field test" : "Guided") + "</span>" +
    '<button type="button" class="btn ' + (done ? "btn-finish pulse" : "btn-dim") + '" data-action="finish"' +
    (done ? "" : " disabled") +
    ' aria-label="' + (done ? "Open completion results" : "Complete all objectives to unlock results") + '">' +
    icon("award") + "Finish</button>" +
    '<button type="button" class="btn btn-outline btn-dim-text" data-action="open-reset">' +
    icon("rotate-ccw") + "Reset</button>" +
    "</div></div>"
  );
}

/* ─── mode gate ────────────────────────────────────────────────────────────── */

function renderModeGate() {
  return (
    '<div class="modegate">' +
    '<p class="modegate-kicker">CompTIA Cloud+ CV0-004 · Domain 4.0 · Objective 4.5</p>' +
    '<h1 class="modegate-title">Lesson 4.5 · Security Controls</h1>' +
    '<p class="modegate-sub">Northwind Cargo Systems goes live in nine days. The estate is missing controls on every deck of the cutaway below your feet. Choose how you want to work — both modes share the same environment; the difference is how much hand-holding you get.</p>' +
    '<div class="modegate-cards">' +
    '<div class="panel mode-card">' +
    '<div class="mode-card-head">' +
    '<span class="mode-icon mode-icon-medium">' + icon("compass") + "</span>" +
    "<div><h2 class=\"mode-name\">Guided Retrofit</h2>" +
    '<p class="mode-tag mode-tag-medium">Medium · understand &amp; learn</p></div></div>' +
    '<ul class="mode-list">' +
    "<li>" + icon("shield-check") + "<span>12 guided objectives introduced in order, each with a “where to look” pointer.</span></li>" +
    "<li>" + icon("shield-check") + "<span>Three-tier hints, freely available — they only cost stars.</span></li>" +
    "<li>" + icon("shield-check") + "<span>Every wrong answer teaches before it scores.</span></li>" +
    "</ul>" +
    '<button type="button" class="btn btn-primary btn-block" data-action="pick-mode" data-mode="medium">' +
    icon("book-open-check") + "Enter guided mode</button></div>" +
    '<div class="panel mode-card">' +
    '<div class="mode-card-head">' +
    '<span class="mode-icon mode-icon-hard">' + icon("flask-conical") + "</span>" +
    "<div><h2 class=\"mode-name\">Field Test</h2>" +
    '<p class="mode-tag mode-tag-hard">Hard · analyze &amp; prove</p></div></div>' +
    '<ul class="mode-list">' +
    "<li>" + icon("shield-check") + "<span>9 broad challenges over noisy evidence with three red herrings planted.</span></li>" +
    "<li>" + icon("shield-check") + "<span>Strict validation: exact values, exact decks, sequence checks. Near-misses are rejected with reasons.</span></li>" +
    "<li>" + icon("shield-check") + "<span>At most one nudge, and it visibly costs score.</span></li>" +
    "</ul>" +
    '<button type="button" class="btn btn-hard btn-block" data-action="pick-mode" data-mode="hard">' +
    icon("flask-conical") + "Enter field test</button></div>" +
    "</div>" +
    '<p class="modegate-notice">TRAINING DATA NOTICE — every asset, log, CVE and hostname in this lab is synthetic and fictional (Northwind Cargo Systems). Nothing here is operational tradecraft; the framing is defensive.</p>' +
    "</div>"
  );
}

/* ─── briefing + codex (static sections) ───────────────────────────────────── */

function renderBriefing() {
  return (
    '<section aria-labelledby="briefing-h" class="section">' +
    sectionHeader("briefing-h", "01 · Scenario briefing", "The go-live gate", "A fictional but realistic incident-prevention scenario. Everything you see is synthetic training data.") +
    '<div class="panel brief-panel">' +
    '<div class="chip-row">' +
    '<span class="chip chip-teal">' + icon("file-text") + "internal memo · SEC-118</span>" +
    '<span class="chip">audience: cloud ops + security</span>' +
    '<span class="chip">classification: internal</span>' +
    "</div>" +
    '<div class="brief-body">' +
    "<p><strong>From:</strong> R. Okafor, Head of Platform &nbsp;·&nbsp; <strong>To:</strong> the Cloud+ candidate on rotation (you)</p>" +
    "<p>" + esc(LAB.ORG.name) + " moved its freight-booking product <em>" + esc(LAB.ORG.product) + "</em> from a colocation cage into " + esc(LAB.ORG.cloud) + " this quarter. The migration team was rewarded for speed, and speed won: workloads are live but barely defended. Our CSPM swept the tenancy and found gaps on every layer — an open management port, no endpoint agent on the web tier, an unencrypted order database, no loss-prevention, MFA missing on privileged accounts.</p>" +
    "<p>You have nine days before production traffic cutover. Your mandate is exactly the skill this lesson certifies — <strong class=\"accent-text\">“given a scenario, apply security controls in the cloud”</strong> (CV0-004, Domain 4.0 — 19% of the exam). That means: choose the right control for each gap, deploy it correctly, and then <em>prove it works</em> before the red team’s adversary replay hits the estate on go-live day.</p>" +
    "<p>The engineering floor below is drawn as a cutaway of the tenancy: five decks, edge to identity. Work deck by deck. The Shield Ledger section keeps score of every control you owe the change board.</p>" +
    "</div></div></section>"
  );
}

function renderCodex() {
  var catalog = LAB.CONTROLS.map(function (c) {
    return (
      '<li class="catalog-item">' +
      '<p class="catalog-name">' + esc(c.name) + "</p>" +
      '<p class="catalog-blurb">' + esc(c.blurb) + "</p>" +
      '<div class="chip-row">' +
      '<span class="chip chip-teal">' + c.category + "</span>" +
      c.types.map(function (t) {
        return '<span class="chip chip-amber">' + t + "</span>";
      }).join("") +
      '<span class="chip">' + c.deck + "</span>" +
      "</div></li>"
    );
  }).join("");
  return (
    '<section aria-labelledby="codex-h" class="section">' +
    sectionHeader("codex-h", "02 · Doctrine codex", "How controls are classified — and why it matters", "Two minutes of doctrine that the whole cutaway depends on. Glossary terms are dotted — tap any of them.") +
    '<div class="codex-grid">' +
    '<div class="panel codex-panel">' +
    '<h3 class="panel-title">Categories — the <span class="accent-text">nature</span> of a control</h3>' +
    '<ul class="dotlist dotlist-teal">' +
    LAB.CATEGORIES.map(function (c) {
      return "<li><span class=\"bullet\" aria-hidden=\"true\"></span><span><strong>" + c.label + ":</strong> " + c.desc + "</span></li>";
    }).join("") +
    "</ul>" +
    '<h3 class="panel-title mt-5">Types — the <span class="warn-text">timing</span> of a control</h3>' +
    '<ul class="dotlist dotlist-amber">' +
    LAB.TYPES.map(function (t) {
      return "<li><span class=\"bullet bullet-amber\" aria-hidden=\"true\"></span><span><strong>" + t.label + ":</strong> " + t.desc + "</span></li>";
    }).join("") +
    "</ul>" +
    '<p class="scope-note">Scope note: the official CV0-004 4.5 bullets verified for this lesson are endpoint protection, data loss prevention (DLP) and IPS/IDS; the remaining controls below are ' + termLabel("security control", "expanded") + " from CompTIA’s Domain 4 study topics (WAF, security groups, segmentation, encryption, MFA, patching, monitoring, CSPM, shared responsibility, zero trust).</p>" +
    "</div>" +
    '<div class="codex-side">' +
    '<div class="panel codex-panel">' +
    '<h3 class="panel-title">The estate you are defending</h3>' +
    '<p class="codex-p">' + termLabel("defense in depth", "Defense in depth") + " is the operating principle: five decks, each holding independent controls. Attack traffic flows north–south from the internet down the decks; the risk you must also plan for is east–west movement between workloads, which perimeter controls barely see. Ownership is split by the " + termLabel("shared responsibility", "shared responsibility") + " model — the provider secures the cloud, you secure everything in it.</p>" +
    '<p class="codex-p">Every deployment follows the same lifecycle: assess the gap → select the control → configure → deploy → <strong>verify it works</strong> → tune → document. The <strong class="accent-text">Replay Bay</strong> exists for that verification step: it flies synthetic attacks through the cutaway and shows you exactly which deck stopped them.</p>' +
    "</div>" +
    '<div class="panel codex-panel">' +
    '<h3 class="panel-title">' + icon("graduation-cap") + "Control catalog (" + LAB.CONTROLS.length + " deployable)</h3>" +
    '<details class="catalog"><summary class="catalog-summary">Open full catalog with category, type &amp; trade-off notes</summary>' +
    '<ul class="catalog-list">' + catalog + "</ul>" +
    "</details>" +
    "</div></div></div></section>"
  );
}

/* ─── cutaway: deck rail ───────────────────────────────────────────────────── */

function deckGaps(id, s) {
  var dep = s.deployed;
  switch (id) {
    case "edge":
      return dep["waf"] ? 0 : 1;
    case "network":
      return (_sgOpenClosed(s) ? 0 : 1) + (dep["ips"] ? 0 : 1);
    case "compute":
      return (_edrCoversApp(s) ? 0 : 1) + (dep["patch"] ? 0 : 1);
    case "data":
      return (dep["kms"] ? 0 : 1) + (dep["backups"] ? 0 : 1) + (dep["dlp"] ? 0 : 1);
    case "identity":
      return (dep["mfa"] ? 0 : 1) + (dep["siem"] ? 0 : 1);
  }
  return 0;
}

function renderDeckRail(s, active) {
  return (
    '<nav aria-label="Cutaway decks — select a deck to open its console" class="deck-rail">' +
    LAB.DECKS.map(function (d, i) {
      var gaps = deckGaps(d.id, s);
      var isActive = active === d.id;
      return (
        '<button type="button" class="deck-btn' + (isActive ? " deck-btn-active" : "") + '"' +
        ' style="margin-left:' + i * 6 + 'px"' +
        (isActive ? ' aria-current="true"' : "") +
        ' data-action="deck-jump" data-deck="' + d.id + '" data-fkey="deck:' + d.id + '">' +
        '<span class="deck-btn-top"><span class="deck-name mono10' + (isActive ? " accent-text" : "") + '">' + d.name + "</span>" +
        '<span class="deck-led ' + (gaps > 0 ? "deck-led-bad" : "deck-led-good") + '" title="' + (gaps > 0 ? gaps + " open gap(s)" : "no open gaps") + '">' + (gaps > 0 ? gaps : "✓") + "</span></span>" +
        '<span class="deck-sub">' + d.sub + "</span>" +
        "</button>"
      );
    }).join("") +
    "</nav>"
  );
}

/* ─── cutaway: control cards ───────────────────────────────────────────────── */

function renderControlCard(def, s, ui) {
  var deployed = s.deployed[def.id];
  var open = !!ui.drawers[def.id];
  var pending = ui.pending[def.id] || {};
  var warn = ui.warnings[def.id] || null;
  var fkey = "control:" + def.id;

  var drawer = "";
  if (open) {
    var cfgHtml = "";
    (def.configs || []).forEach(function (cfg) {
      if (cfg.key === "mode") {
        var val = pending.mode !== undefined ? pending.mode : (deployed && deployed.mode) || cfg.options[0].value;
        cfgHtml +=
          "<div>" +
          '<label class="field-label">' + cfg.label + "</label>" +
          '<select class="select select-block" data-action="drawer-mode" data-cid="' + def.id + '"' +
          ' aria-label="' + esc(def.name + " — " + cfg.label) + '">' +
          cfg.options.map(function (o) {
            return '<option value="' + o.value + '"' + (val === o.value ? " selected" : "") + ">" + o.label + "</option>";
          }).join("") +
          "</select>" +
          (def.id === "ips" || def.id === "waf"
            ? '<p class="hint-dim">Safe cutover: detect first, tune, then block.</p>'
            : "") +
          "</div>";
      } else {
        var targets = pending.targets !== undefined ? pending.targets : (deployed && deployed.targets) || [];
        cfgHtml +=
          "<div><span class=\"field-label\">" + cfg.label + "</span>" +
          '<div class="check-stack">' +
          cfg.options.map(function (o) {
            var on = targets.indexOf(o.value) > -1;
            return (
              '<label class="check-row check-plain">' +
              '<input type="checkbox" data-action="drawer-target" data-cid="' + def.id + '" data-value="' + o.value + '"' +
              (on ? " checked" : "") +
              ' aria-label="Target ' + esc(o.label) + '">' +
              "<span>" + o.label + "</span></label>"
            );
          }).join("") +
          "</div></div>";
      }
    });
    drawer =
      '<div class="drawer open"><div class="drawer-inner">' +
      '<div class="drawer-box">' +
      cfgHtml +
      (warn ? '<p class="alert-warn" role="alert">' + esc(warn) + "</p>" : "") +
      '<button type="button" class="btn btn-primary btn-sm" data-action="control-deploy" data-cid="' + def.id + '" data-fkey="deploy:' + def.id + '">Confirm deployment</button>' +
      "</div></div></div>";
  }

  var statusBadge = deployed
    ? '<span class="deployed-badge">' + icon("shield-check") + "deployed" + (deployed.mode ? " · " + deployed.mode : "") + "</span>"
    : '<span class="gap-badge">' + icon("circle") + "gap</span>";

  var actions = deployed
    ? '<button type="button" class="btn btn-outline btn-sm" data-action="control-toggle" data-cid="' + def.id + '" aria-expanded="' + open + '" data-fkey="' + fkey + '">' + icon("wrench") + "Reconfigure</button>" +
      '<button type="button" class="btn btn-outline btn-sm btn-remove" data-action="control-remove" data-cid="' + def.id + '">Remove</button>'
    : '<button type="button" class="btn btn-primary btn-sm" data-action="control-toggle" data-cid="' + def.id + '" aria-expanded="' + open + '" data-fkey="' + fkey + '">' + def.deployLabel + "</button>";

  return (
    '<div class="panel control-card">' +
    '<div class="control-head">' +
    "<div><p class=\"control-name\">" + esc(def.name) + "</p>" +
    '<div class="chip-row chip-row-tight">' +
    '<span class="chip chip-teal">' + def.category + "</span>" +
    def.types.map(function (t) {
      return '<span class="chip chip-amber">' + t + "</span>";
    }).join("") +
    "</div></div>" +
    statusBadge +
    "</div>" +
    '<p class="control-blurb">' + esc(def.blurb) + "</p>" +
    '<div class="dots-row">' +
    dots("cost", def.cost) +
    dots("latency", def.latency) +
    dots("friction", def.friction) +
    "</div>" +
    '<div class="control-actions">' + actions + "</div>" +
    drawer +
    "</div>"
  );
}

/* ─── cutaway: security group editor ───────────────────────────────────────── */

function renderSgEditor(s) {
  var rows = s.sgRules
    .map(function (r) {
      var isSsh = r.port === "22" && r.proto === "tcp";
      var fixed = r.src === LAB.SG_MGMT_CIDR;
      var srcCls = fixed ? "good-text" : isSsh ? "bad-text" : "";
      var action;
      if (isSsh && !fixed) {
        action =
          '<button type="button" class="btn btn-primary btn-xs" data-action="sg-restrict" data-rid="' + r.id + '" data-fkey="sg:' + r.id + '">' +
          icon("lock") + "Restrict to " + LAB.SG_MGMT_CIDR + "</button>";
      } else if (isSsh && fixed) {
        action =
          '<button type="button" class="link-dim" data-action="sg-revert" data-rid="' + r.id + '" data-fkey="sg:' + r.id + '" aria-label="Revert rule to world-open (for practice)">revert (practice)</button>';
      } else {
        action = '<span class="mono10 dim">business rule</span>';
      }
      return (
        "<tr>" +
        '<td class="' + srcCls + '">' + esc(r.src) + "</td>" +
        "<td>" + r.proto + "/" + r.port + "</td>" +
        '<td class="dim">' + (fixed ? "SSH — management subnet only" : esc(r.note)) + "</td>" +
        "<td>" + action + "</td>" +
        "</tr>"
      );
    })
    .join("");
  return (
    '<div class="panel control-card">' +
    '<p class="control-name">Security groups — sg-app (rule editor)</p>' +
    '<p class="control-blurb">Stateless-permit firewall at the subnet/workload boundary. Least privilege means every rule exists for a named reason.</p>' +
    '<div class="table-wrap"><table class="data-table sg-table">' +
    '<caption class="sr-only">Security group rules for sg-app; restrict world-open management rules to the management CIDR</caption>' +
    "<thead><tr><th scope=\"col\">source</th><th scope=\"col\">port</th><th scope=\"col\">note</th><th scope=\"col\">action</th></tr></thead>" +
    "<tbody>" + rows + "</tbody></table></div></div>"
  );
}

/* ─── cutaway: legacy exception card (OBJ-M11) ─────────────────────────────── */

function renderLegacyCard(s) {
  var choice = typeof s.answers["OBJ-M11"] === "string" ? s.answers["OBJ-M11"] : "";
  var jumphost = !!s.deployed["jumphost"];
  var locked = !!(s.results["OBJ-M11"] && s.results["OBJ-M11"].pass);
  var opts = [
    { v: "accept", t: "Accept and document the risk until replacement" },
    { v: "jump-allowlist", t: "Isolate it behind a hardened jump host with an allowlist" },
    { v: "backup", t: "Schedule weekly backups for the VM" },
  ];
  var note = "";
  if (choice === "accept") {
    note = '<p class="alert-warn">Documenting is honest — but the risk (malware execution / lateral movement) remains fully open. Look for a control that reduces the SAME risk a different way.</p>';
  } else if (choice === "backup") {
    note = '<p class="alert-warn">Backups are corrective — they help AFTER compromise. They do not compensate for a missing preventive control.</p>';
  } else if (choice === "jump-allowlist") {
    note = jumphost
      ? '<p class="alert-good">Jump host path live: admin access choke-pointed, allowlist governing execution, segment isolated. Equivalent risk reduction by different means — that is what makes it compensating.</p>'
      : '<button type="button" class="btn btn-primary btn-sm" data-action="legacy-build" data-fkey="legacy-build">Build jump host path</button>';
  }
  return (
    '<div class="panel control-card">' +
    '<p class="control-name">Legacy exception — pricing-vm</p>' +
    '<p class="control-blurb">2019 appliance OS. The vendor contract forbids installing any agent. Endpoint protection is impossible here — what now?</p>' +
    '<div class="radio-stack" role="radiogroup" aria-label="Choose an approach for pricing-vm">' +
    opts
      .map(function (o) {
        return (
          '<label class="radio-row boxed">' +
          '<input type="radio" name="legacy-choice" value="' + o.v + '"' +
          (choice === o.v ? " checked" : "") + (locked ? " disabled" : "") +
          ' data-action="legacy-pick" data-value="' + o.v + '" data-fkey="legacy:' + o.v + '"' +
          ' aria-label="' + esc(o.t) + '">' +
          "<span>" + o.t + "</span></label>"
        );
      })
      .join("") +
    "</div>" +
    note +
    "</div>"
  );
}

/* ─── cutaway: SIEM feed (OBJ-M8 / OBJ-H6) ─────────────────────────────────── */

function renderSiemFeed(s) {
  var hard = s.mode === "hard";
  var events = hard ? LAB.SIEM_EVENTS_HARD : LAB.SIEM_EVENTS_MEDIUM;
  var oid = hard ? "OBJ-H6" : "OBJ-M8";
  var marks = asRec(s.answers[oid]);
  var locked = !!(s.results[oid] && s.results[oid].pass);

  var body;
  if (!s.deployed["siem"]) {
    body =
      '<p class="control-blurb">Pipeline offline. Start the SIEM (card above) to stream WAF, auth, flow and endpoint events into one place — then classify what comes.</p>';
  } else {
    body =
      '<p class="control-blurb">Classify each event (true / false positive), then record the disposition. Your marks are checked by the ledger.</p>' +
      '<div class="siem-list">' +
      events
        .map(function (e) {
          var m = marks[e.id] || "";
          var mark = m.split("-")[0];
          var action = m.split("-")[1] || "";
          var acted = action !== "";
          var actedLabel = action === "none" ? "acknowledged — no action needed" : m;
          var buttons;
          if (e.action === "none") {
            buttons =
              '<button type="button" class="btn btn-outline btn-xs" data-action="siem-act" data-eid="' + e.id + '" data-value="none" data-fkey="siemact:' + e.id + ':none"' + (locked ? " disabled" : "") + ">Acknowledge</button>";
          } else {
            buttons = ["contain", "escalate", "suppress"]
              .map(function (a) {
                return (
                  '<button type="button" class="btn btn-outline btn-xs siem-' + a + '" data-action="siem-act" data-eid="' + e.id + '" data-value="' + a + '" data-fkey="siemact:' + e.id + ':' + a + '"' +
                  (locked ? " disabled" : "") + ">" + (a === "suppress" ? "Tune / suppress" : a) + "</button>"
                );
              })
              .join("");
          }
          return (
            '<div class="siem-event">' +
            '<p class="mono10 dim">' + e.ts + " · " + esc(e.source) + "</p>" +
            '<p class="siem-text">' + esc(e.text) + "</p>" +
            '<div class="siem-controls">' +
            '<div class="seg-group" role="radiogroup" aria-label="Classify event ' + e.id + ' as true or false positive">' +
            '<label class="seg-opt' + (mark === "tp" ? " seg-opt-on" : "") + '"><input type="radio" name="siem-' + e.id + '" value="tp"' + (mark === "tp" ? " checked" : "") + (locked ? " disabled" : "") +
            ' data-action="siem-mark" data-eid="' + e.id + '" data-value="tp" data-fkey="siem:' + e.id + ':tp" aria-label="' + e.id + ': true positive"><span>True positive</span></label>' +
            '<label class="seg-opt' + (mark === "fp" ? " seg-opt-on" : "") + '"><input type="radio" name="siem-' + e.id + '" value="fp"' + (mark === "fp" ? " checked" : "") + (locked ? " disabled" : "") +
            ' data-action="siem-mark" data-eid="' + e.id + '" data-value="fp" data-fkey="siem:' + e.id + ':fp" aria-label="' + e.id + ': false positive"><span>False positive</span></label>' +
            "</div>" +
            '<div class="siem-btns">' + buttons + "</div></div>" +
            (acted
              ? '<p class="disposition" aria-live="polite">disposition recorded: ' + esc(actedLabel) + "</p>"
              : "") +
            "</div>"
          );
        })
        .join("") +
      "</div>";
  }
  return (
    '<div class="panel control-card">' +
    '<p class="control-name siem-title">' + icon("radio-tower") + "SIEM feed — correlation stream</p>" +
    body +
    "</div>"
  );
}

/* ─── cutaway: replay bay ──────────────────────────────────────────────────── */

function renderReplayBay(s, ui) {
  return (
    '<div class="panel replay-panel">' +
    '<div class="replay-head">' +
    '<p class="replay-title">Replay Bay — adversary verification</p>' +
    '<span class="chip chip-amber">synthetic attacks · training only</span>' +
    "</div>" +
    '<p class="control-blurb">Each replay is computed from the <strong>current</strong> estate state. Deploy or change a control, then re-run — the trace shows the exact deck where the attack was stopped, detected, or slipped through.</p>' +
    '<div class="replay-grid">' +
    LAB.REPLAYS.map(function (r) {
      var res = s.runs[r.id];
      var openLog = ui.openLog === r.id;
      return (
        '<div class="replay-card">' +
        '<div class="replay-card-head">' +
        '<p class="control-name">' + r.name + "</p>" +
        (res ? '<span aria-live="polite">' + verdictChip(res.verdict, res.deck) + "</span>" : "") +
        "</div>" +
        '<p class="control-blurb">' + r.story + "</p>" +
        '<button type="button" class="btn btn-replay btn-sm" data-action="replay-run" data-rid="' + r.id + '" data-fkey="replay:' + r.id + '" aria-label="Run ' + esc(r.name) + '">' +
        icon("play") + (res ? "Re-run replay" : "Run replay") + "</button>" +
        (res
          ? '<div class="replay-trace">' +
            '<button type="button" class="link-dim trace-toggle" data-action="replay-log" data-rid="' + r.id + '" data-fkey="tracelog:' + r.id + '" aria-expanded="' + openLog + '">' +
            icon(openLog ? "chevron-up" : "chevron-down") + "trace log</button>" +
            (openLog
              ? '<pre class="trace-log" aria-live="polite">' + esc(res.log.join("\n")) + "</pre>"
              : "") +
            "</div>"
          : "") +
        "</div>"
      );
    }).join("") +
    "</div></div>"
  );
}

/* ─── cutaway section ──────────────────────────────────────────────────────── */

function renderCutaway(s, ui) {
  var deck = ui.deck;
  var d = LAB.DECKS.find(function (x) {
    return x.id === deck;
  });
  var controls = LAB.CONTROLS.filter(function (c) {
    return c.deck === deck && c.id !== "jumphost";
  });
  return (
    '<section aria-labelledby="cutaway-h" class="section" id="cutaway">' +
    sectionHeader("cutaway-h", "03 · The cutaway — interactive environment", "Engineering floor: five decks, deploy and verify", "Pick a deck, open a control, configure and deploy it. Then make the Replay Bay prove it works. All evidence is synthetic.") +
    '<div class="cutaway-grid">' +
    '<div class="rail-wrap lab-blueprint">' +
    renderDeckRail(s, deck) +
    '<p class="rail-note mono10 dim">LEDs show open gaps per deck. Numbers close as you deploy verified controls.</p>' +
    "</div>" +
    '<div class="console-col">' +
    '<div class="fade-in">' +
    '<div class="panel deck-head lab-blueprint">' +
    '<p class="kicker">' + d.name + "</p>" +
    '<p class="deck-blurb">' + d.blurb + "</p>" +
    '<ul class="asset-list">' +
    LAB.DECK_ASSETS[deck]
      .map(function (a) {
        return '<li><span class="asset-marker" aria-hidden="true">▸</span>' + a + "</li>";
      })
      .join("") +
    "</ul></div>" +
    (deck === "network" ? renderSgEditor(s) : "") +
    (deck === "compute" ? renderLegacyCard(s) : "") +
    '<div class="cards-grid">' +
    controls
      .map(function (c) {
        return renderControlCard(c, s, ui);
      })
      .join("") +
    "</div>" +
    (deck === "identity" ? renderSiemFeed(s) : "") +
    "</div>" +
    renderReplayBay(s, ui) +
    "</div></div></section>"
  );
}

/* ─── ledger section ───────────────────────────────────────────────────────── */

var CUTAWAY_TARGET = {
  "OBJ-M6": "network",
  "OBJ-M7": "network",
  "OBJ-M8": "identity",
  "OBJ-M9": "compute",
  "OBJ-M10": "data",
  "OBJ-H6": "identity",
};

function renderObjectiveCard(o, s, ui) {
  var hard = s.mode === "hard";
  var result = s.results[o.id];
  var hintsShown = s.hintsUsed[o.id] || 0;
  var locked = !!(result && result.pass);
  var jumpDeck = CUTAWAY_TARGET[o.id];

  var widgetHtml = "";
  if (o.zone === "ledger") {
    widgetHtml = '<div class="obj-widget">' + widgetFor(o, s) + "</div>";
    if (locked) {
      /* QA-4: a verified objective's checked answer is locked — a disabled
       * fieldset natively disables every control inside the widget. */
      widgetHtml =
        '<fieldset disabled title="Verified — this answer is locked" class="lock-fieldset">' +
        widgetHtml +
        "</fieldset>";
    }
  } else if (jumpDeck) {
    widgetHtml =
      '<button type="button" class="btn btn-outline btn-sm btn-jump" data-action="deck-jump" data-deck="' + jumpDeck + '" data-scroll="1">Open the ' + jumpDeck + " deck" + icon("chevron-right") + "</button>";
  }

  var hintBtn = "";
  var hintMax = hard ? 1 : o.hints.length;
  if (hintsShown < hintMax) {
    hintBtn =
      '<button type="button" class="btn btn-outline btn-sm btn-hint" data-action="obj-hint" data-oid="' + o.id + '" data-fkey="hint:' + o.id + '" aria-label="Reveal hint ' + (hintsShown + 1) + " for " + esc(o.title) + '">' +
      icon("lightbulb") + (hard ? "Reveal nudge (costs score)" : "Hint (" + (hintsShown + 1) + "/" + o.hints.length + ")") + "</button>";
  }

  var hintsHtml = "";
  if (hintsShown > 0) {
    hintsHtml =
      '<div class="obj-hints" aria-live="polite">' +
      o.hints
        .slice(0, hard ? 1 : hintsShown)
        .map(function (h, i) {
          return (
            '<p class="hint-box"><strong>' + (hard ? "Nudge" : "Hint " + (i + 1)) + ":</strong> " + h + "</p>"
          );
        })
        .join("") +
      "</div>";
  }

  var fb = "";
  if (result) {
    var msg = result.pass ? o.feedbackPass : o.feedbackFail + (hard ? "" : " Re-check and try again.");
    fb =
      '<div class="obj-feedback ' + (result.pass ? "fb-pass" : "fb-fail") + '" role="status">' +
      icon(result.pass ? "check-circle" : "x-circle") +
      "<span><strong>" + (result.pass ? "Verified — " : "Not yet — ") + "</strong>" + msg + "</span></div>";
  }

  return (
    '<div class="panel obj-card' + (locked ? " obj-pass" : "") + '" aria-labelledby="' + o.id + '-t">' +
    '<div class="obj-tags">' +
    pillarBadge(o.pillar) +
    '<span class="bloom-chip">bloom · ' + o.bloom + "</span>" +
    '<span class="obj-id mono10 dim">' + o.id + "</span>" +
    "</div>" +
    '<h3 id="' + o.id + '-t" class="obj-title">' + (locked ? "✓ " : "") + o.title + "</h3>" +
    '<p class="obj-prompt">' + o.prompt + "</p>" +
    (!hard && o.where
      ? '<p class="where-line"><span aria-hidden="true">↳ </span>where to look: ' + o.where + "</p>"
      : "") +
    widgetHtml +
    '<div class="obj-actions">' +
    '<button type="button" class="btn btn-primary btn-sm" data-action="obj-check" data-oid="' + o.id + '" data-fkey="check:' + o.id + '"' +
    (locked ? " disabled" : "") +
    ' aria-label="' + (locked ? esc(o.title) + " is verified and locked" : "Check results for " + esc(o.title)) + '">' +
    (locked ? "Verified" : "Check results") + "</button>" +
    hintBtn +
    (result
      ? '<span class="mono10 dim">attempts: ' + result.attempts + (result.firstAttempt && result.pass ? " · first-try" : "") + "</span>"
      : "") +
    "</div>" +
    hintsHtml +
    fb +
    "</div>"
  );
}

function renderLedger(s, ui) {
  var objs = objectivesFor(s.mode);
  var passed = objs.filter(function (o) {
    return s.results[o.id] && s.results[o.id].pass;
  }).length;
  var pct = Math.round((passed / objs.length) * 100);
  var hintsTotal = Object.keys(s.hintsUsed).reduce(function (a, k) {
    return a + s.hintsUsed[k];
  }, 0);
  return (
    '<section aria-labelledby="ledger-h" class="section" id="ledger">' +
    sectionHeader("ledger-h", "04 · Shield ledger",
      s.mode === "hard" ? "Field-test objectives — prove it, precisely" : "Guided objectives — one control debt at a time",
      s.mode === "hard"
        ? "Nine broad challenges. Strict validation: exact values, exact decks, exact sequences. One optional nudge, at a score cost."
        : "Twelve granular objectives in a suggested order. Every check explains itself; hints cost stars, never progress.") +
    '<div class="panel ledger-progress">' +
    '<div class="lp-track">' +
    '<div class="lp-labels"><span>Ledger progress</span><span class="accent-text">' + passed + "/" + objs.length + " verified</span></div>" +
    '<div class="progress" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100" aria-label="' + pct + '% of objectives verified">' +
    '<div class="progress-fill" style="width:' + pct + '%"></div></div>' +
    "</div>" +
    '<p class="mono11 dim">hints used: ' + hintsTotal + "</p>" +
    "</div>" +
    '<div class="ledger-grid">' +
    objs
      .map(function (o) {
        return renderObjectiveCard(o, s, ui);
      })
      .join("") +
    "</div></section>"
  );
}

/* ─── quiz section ─────────────────────────────────────────────────────────── */

function renderActiveQuestion(q, idx, total, s) {
  var picked = s.quizAnswers[q.id];
  var checked = !!s.quizChecked[q.id];
  var isRight = picked === q.correct;
  var options = q.options
    .map(function (opt, i) {
      var isPicked = picked === i;
      var showGreen = checked && isPicked && i === q.correct;
      var showRed = checked && isPicked && i !== q.correct;
      var cls =
        "quiz-opt" +
        (showGreen ? " quiz-opt-good" : showRed ? " quiz-opt-bad" : isPicked ? " quiz-opt-picked" : "");
      return (
        '<label class="' + cls + '">' +
        '<input type="radio" name="quiz-' + q.id + '" value="' + i + '"' + (isPicked ? " checked" : "") + (checked ? " disabled" : "") +
        ' data-action="quiz-pick" data-qid="' + q.id + '" data-idx="' + i + '" data-fkey="quiz:' + q.id + ':' + i + '" aria-label="' + esc(opt) + '">' +
        "<span class=\"quiz-opt-text\">" + opt + "</span>" +
        (showGreen ? icon("check-circle") : showRed ? icon("x-circle") : "") +
        "</label>"
      );
    })
    .join("");
  return (
    '<div class="panel quiz-card">' +
    '<div class="quiz-meta"><p class="mono10 dim">question ' + (idx + 1) + " of " + total + "</p>" +
    '<p class="mono10 dim">one answer · locks on check</p></div>' +
    (q.scenario ? '<p class="quiz-scenario">' + q.scenario + "</p>" : "") +
    '<h3 class="quiz-q">' + q.q + "</h3>" +
    '<div class="quiz-opts" role="radiogroup" aria-label="Options for question ' + (idx + 1) + '">' + options + "</div>" +
    (!checked
      ? '<button type="button" class="btn btn-primary btn-block-sm" data-action="quiz-lock" data-qid="' + q.id + '"' + (picked === undefined ? " disabled" : "") + ' data-fkey="quiz-lock:' + q.id + '">Lock answer</button>'
      : '<div class="quiz-verdict ' + (isRight ? "fb-pass" : "quiz-wrong") + '" role="status"><strong>' + (isRight ? "Correct — " : "Not quite — ") + "</strong>" + q.explain + "</div>" +
        '<button type="button" class="btn btn-replay btn-block-sm" data-action="quiz-next" data-qid="' + q.id + '" data-fkey="quiz-next:' + q.id + '">' +
        (idx === total - 1 ? "Finish the probe" : "Next question") + icon("chevron-right") + "</button>") +
    "</div>"
  );
}

function renderLockedRecap(q, s, idx) {
  var picked = s.quizAnswers[q.id];
  var isRight = picked === q.correct;
  return (
    '<div class="panel quiz-recap">' +
    '<p class="mono10 dim">question ' + (idx + 1) + " · locked</p>" +
    '<p class="recap-q">' + q.q + "</p>" +
    '<p class="recap-answer ' + (isRight ? "good-text" : "bad-text") + '">' +
    icon(isRight ? "check-circle" : "x-circle") +
    "your answer: " + (picked !== undefined ? q.options[picked] : "—") +
    (!isRight && picked !== undefined ? " · correct: " + q.options[q.correct] : "") +
    "</p>" +
    '<p class="recap-explain">' + q.explain + "</p>" +
    "</div>"
  );
}

function renderQuiz(s) {
  var hard = s.mode === "hard";
  var qs = hard ? QUIZ_HARD : QUIZ_MEDIUM;
  var answered = qs.filter(function (q) {
    return s.quizChecked[q.id];
  }).length;
  var correct = qs.filter(function (q) {
    return s.quizChecked[q.id] && s.quizAnswers[q.id] === q.correct;
  }).length;
  var activeIdx = qs.findIndex(function (q) {
    return !s.quizChecked[q.id] || !s.quizAdvanced[q.id];
  });

  var cards = "";
  if (activeIdx === -1) {
    cards +=
      '<div class="panel quiz-done"><p class="quiz-done-title">Probe complete — ' + correct + "/" + qs.length + " correct</p>" +
      '<p class="quiz-done-sub">Every answer is locked and shown below. Retake the probe via RESET if you want a clean run.</p></div>';
  }
  qs.forEach(function (q, i) {
    if (i === activeIdx) {
      cards += renderActiveQuestion(q, i, qs.length, s);
    } else if (s.quizChecked[q.id] && s.quizAdvanced[q.id]) {
      cards += renderLockedRecap(q, s, i);
    }
  });
  if (activeIdx !== -1 && answered > 0) {
    cards +=
      '<p class="quiz-hintline">' + icon("rotate-ccw") + "press Next to move on — answered questions stay locked and recapped below" + icon("chevron-right") + "</p>";
  }

  return (
    '<section aria-labelledby="quiz-h" class="section" id="quiz">' +
    sectionHeader("quiz-h", "05 · Certification probe",
      hard ? "Scenario probe — apply, don't recall" : "Concept probe — know the why, not just the what",
      hard
        ? "Seven scenario items, one at a time. Each answer locks on check and the probe moves forward — accuracy drives your score."
        : "Six concept questions, one at a time. Each answer locks on check; an explanation follows every answer.") +
    '<div class="panel quiz-status">' +
    '<p class="mono11 dim">probe status: <span class="accent-text">' + answered + "/" + qs.length + " answered · " + correct + " correct</span></p>" +
    '<p class="quiz-status-note">The probe is practice, not a gate — objectives drive completion.</p>' +
    "</div>" +
    '<div class="quiz-col">' + cards + "</div></section>"
  );
}

/* ─── debrief section (static) ─────────────────────────────────────────────── */

function renderDebrief() {
  return (
    '<section aria-labelledby="debrief-h" class="section">' +
    sectionHeader("debrief-h", "06 · Debrief — field notes", "What you now own: the 4.5 playbook", "Synthesis for the exam and the job: where detection lives, which mitigations to demand, and how both sides think.") +
    '<div class="codex-grid">' +
    '<div class="panel codex-panel">' +
    '<h3 class="panel-title">' + icon("radar") + "Detection opportunities (data source → example logic)</h3>" +
    '<ul class="detect-list">' +
    LAB.DETECTION.map(function (d) {
      return (
        '<li class="detect-item"><p class="detect-source">' + d.source + "</p>" +
        '<p class="detect-logic">' + d.logic + "</p></li>"
      );
    }).join("") +
    "</ul>" +
    '<p class="codex-p dim">Every detection line above maps to a deck in the cutaway — detection engineering is just deploying ' + termLabel("detective control", "detective") + " controls with intent.</p>" +
    "</div>" +
    '<div class="codex-side">' +
    '<div class="panel codex-panel">' +
    '<h3 class="panel-title">' + icon("wrench", "good-ic") + "Mitigation recommendations (with anchors)</h3>" +
    '<ul class="mit-list">' +
    LAB.MITIGATIONS.map(function (m) {
      return (
        "<li>" + icon("shield-check", "good-ic") + "<span>" + m.rec +
        ' <span class="anchor">— ' + m.anchor + "</span></span></li>"
      );
    }).join("") +
    "</ul></div>" +
    '<div class="takeaway-grid">' +
    '<div class="panel takeaway">' +
    '<h3 class="panel-title">Blue-team takeaways</h3>' +
    '<ul class="plainlist"><li>Classify every control (category × type) before buying it — gaps show up as missing types, not missing products.</li>' +
    "<li>Deploy in detect mode first; a control that blocks the business gets switched off.</li>" +
    "<li>Verify with replays and restore drills, never with installation screenshots.</li>" +
    "<li>Tune with evidence: suppress events, not rule classes.</li></ul></div>" +
    '<div class="panel takeaway">' +
    '<h3 class="panel-title">' + icon("bug", "bad-ic") + "Red-team mindset</h3>" +
    '<ul class="plainlist"><li>Replay D is the attacker’s favorite: legitimate tooling, trusted protocol, no malware — content-aware controls are the only net.</li>' +
    "<li>Open management ports (SSH/RDP to the world) remain the fastest cloud win.</li>" +
    "<li>Password-only privileged accounts are a replay waiting to happen; MFA is the cheapest wall.</li>" +
    "<li>Every layer you skip is an attack path you funded.</li></ul></div>" +
    "</div>" +
    '<div class="panel takeaway">' +
    '<h3 class="panel-title">' + icon("book-marked") + "Official references</h3>" +
    '<ul class="reflist"><li><a href="https://www.comptia.org/en-us/certifications/cloud" target="_blank" rel="noopener noreferrer" class="ext-link">CompTIA Cloud+ (CV0-004) — official certification page' + icon("external-link") + "</a></li>" +
    '<li><a href="https://www.comptia.org/training/resources/exam-objectives" target="_blank" rel="noopener noreferrer" class="ext-link">CompTIA — official exam objectives library (download CV0-004)' + icon("external-link") + "</a></li></ul>" +
    '<div class="chip-row"><span class="chip chip-teal">Domain 4.0 · 19%</span><span class="chip">objective 4.5</span><span class="chip">all data synthetic</span></div>' +
    "</div></div></div></section>"
  );
}

/* ─── completion modal content ─────────────────────────────────────────────── */

function renderCompletionContent(s) {
  var objs = objectivesFor(s.mode);
  var passed = passedCount(s);
  var stars = starRating(s);
  var quiz = quizStats(s);
  var hard = s.mode === "hard";
  var areas = focusAreas(s);

  function count(p) {
    return {
      done: objs.filter(function (o) {
        return o.pillar === p && s.results[o.id] && s.results[o.id].pass;
      }).length,
      total: objs.filter(function (o) {
        return o.pillar === p;
      }).length,
    };
  }

  var starsHtml = [1, 2, 3, 4, 5]
    .map(function (i) {
      return '<span class="star' + (i <= stars ? " star-on" : "") + '">' + icon("star") + "</span>";
    })
    .join("");

  var areasHtml =
    areas.length === 0
      ? '<p class="focus-empty">Clean first-pass run — no weak spots in the evidence. Consolidate by taking the other mode, or teach one control to a colleague.</p>'
      : '<p class="focus-sub">Derived from your actual run — retries, hints and probe misses:</p>' +
        '<ul class="focus-list">' +
        areas
          .map(function (a) {
            return (
              '<li class="focus-item"><p class="focus-topic">' + a.topic + "</p>" +
              '<p class="focus-evidence">evidence: ' + a.evidence + "</p>" +
              '<p class="focus-action">→ ' + a.action + "</p></li>"
            );
          })
          .join("") +
        "</ul>";

  return (
    '<div class="completion-head">' +
    '<h2 class="completion-title">' + icon("award", "warn-ic") + "Go-live gate cleared</h2>" +
    '<p class="completion-sub">Every objective on the ledger is verified. LoadBoard ships with a defense that has been attacked and proven — not assumed.</p>' +
    "</div>" +
    '<div class="stars-row" aria-label="Star rating: ' + stars + " of 5" + '">' + starsHtml + '<span class="mono dim11">' + stars + " / 5</span></div>" +
    '<p class="stars-note">stars reflect first-attempt accuracy and hint discipline — retries (' + (hard ? "and the nudge" : "and hints") + ") cost stars</p>" +
    '<dl class="stat-grid">' +
    '<div class="stat-box"><dt>Objectives</dt><dd>' + passed + "/" + objs.length + "</dd></div>" +
    '<div class="stat-box"><dt>Probe</dt><dd>' + quiz.correct + "/" + quiz.total + "</dd></div>" +
    '<div class="stat-box"><dt>Mode</dt><dd>' + (hard ? "Field test" : "Guided") + "</dd></div>" +
    "</dl>" +
    '<div class="pillar-recap"><h3 class="panel-title">Mastery recap by pillar</h3>' +
    '<ul class="pillar-list">' +
    ["understand", "recognize", "detect", "mitigate"]
      .map(function (p) {
        var c = count(p);
        return (
          '<li class="pillar-row">' + pillarBadge(p) +
          '<span class="mono11 dim">' + c.done + "/" + c.total + " verified</span></li>"
        );
      })
      .join("") +
    "</ul></div>" +
    '<div class="focus-box">' +
    '<h3 class="focus-title">' + icon("compass") + "Focus areas for your next pass</h3>" +
    areasHtml +
    "</div>" +
    '<div class="next-box"><h3 class="next-title">Where to go next</h3>' +
    '<ul class="plainlist"><li><strong>CV0-004 4.1–4.4:</strong> IAM configuration, network &amp; transmission security, data security techniques — the sibling objectives of Domain 4.0 (19% of the exam).</li>' +
    "<li><strong>Try the other mode:</strong> " +
    (hard
      ? "the guided retrofit walks the same estate with teaching hints — ideal for consolidating."
      : "the field test replays this estate with noisy evidence, red herrings and strict grading — ideal for exam simulation.") +
    " Use RESET (top bar) to switch modes.</li>" +
    "<li><strong>Domain 6 troubleshooting:</strong> certificate, key and encryption problems build directly on what you deployed here.</li></ul></div>" +
    '<div class="completion-foot">' +
    '<button type="button" class="btn btn-primary" data-action="completion-close">' +
    (hard ? icon("flask-conical") : icon("compass")) + "Back to the floor</button></div>"
  );
}
