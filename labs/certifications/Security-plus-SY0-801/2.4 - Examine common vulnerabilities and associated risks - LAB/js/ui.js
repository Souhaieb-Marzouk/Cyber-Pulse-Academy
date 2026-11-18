/**
 * Vulnerability Council — UI rendering helpers (static port).
 *
 * Source: src/components/lab/*.tsx (ModeSelect, ScenarioBanner, EvidenceVault,
 * CaseFileViewer, CVSSCalculator, PriorityQueue, ObjectivesTracker,
 * ObjectiveInteraction, Glossary, DebriefNotes, CompletionModal) +
 * src/app/page.tsx (3-zone workbench, mobile tabs).
 *
 * Each render function returns an HTML string. Event wiring happens in
 * app.js via data-action attributes + event delegation.
 *
 * Exposed on the global Lab namespace as Lab.UI.
 *
 * Audit-fix behaviors implemented here:
 *   R2 (answer lock): objective controls render inside a disabled <fieldset>
 *     after Check (ObjectivesTracker passes `locked = p.status !== "idle"`).
 *   R3 (only-selected highlighting): handled in quiz.js.
 *   R6 (seeded shuffle): the seededShuffle() function ports ObjectiveInteraction.tsx
 *     1:1 and is used for OBJ-M1 / OBJ-M2 items.
 *   R7 (popup close): every modal closes via X button, ESC, and click-outside
 *     overlay. Close affordances are ≥44px (modal-close CSS class).
 *   R8 (focus areas): CompletionModal computes focus items from real attempts,
 *     hints, and quiz answers.
 */
(function (global) {
  "use strict";

  var Lab = global.Lab || (global.Lab = {});
  var Data = Lab.Data;
  var CVSS = Lab.CVSS;
  var Store = Lab.Store;
  var UI = (Lab.UI = {});

  // --------------------------------------------------------------------------
  // Inline SVG icons (replaces lucide-react). Paths copied from lucide source.
  // Each function returns an SVG string sized via the `size` argument.
  // --------------------------------------------------------------------------

  var ICON_PATHS = {
    brain: '<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.707-.293"/><path d="M18 18a4 4 0 0 1 1.707-.293"/>',
    trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    file_search: '<path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M19.408 11.5A6.5 6.5 0 1 1 12.5 4.6"/><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h5"/><circle cx="12.5" cy="12.5" r="2.5"/>',
    folder_open: '<path d="m 6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/>',
    list_ordered: '<path d="M10 6h11"/><path d="M10 12h11"/><path d="M10 18h11"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-5"/><path d="M6 14H4"/>',
    rotate_ccw: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    check_circle: '<path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/>',
    x_circle: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
    lightbulb: '<path d="M15 14c.2-1 .7-2 1-3a5 5 0 0 0-7.6-6.3A5 5 0 0 0 8 11c.3 1 .8 2 1 3"/><path d="M9 18h6"/><path d="M10 22h4"/>',
    eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
    star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
    alert_triangle: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    clipboard_list: '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
    book_open: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    chevron_down: '<path d="m6 9 6 6 6-6"/>',
    chevron_right: '<path d="m9 18 6-6-6-6"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>',
    gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
    boxes: '<path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-4-2.4-3.03 1.82Z"/><path d="m7.5 4.27 9 5.15"/><path d="M6.49 8.93 12 12.27l5.51-3.34"/><path d="M12 22V16"/><path d="m12 14 4-4"/><path d="M21.03 12.92A2 2 0 0 1 22 14.63v3.24a2 2 0 0 1-.97 1.71l-3 1.8a2 2 0 0 1-2.06 0L12 19"/><path d="M16.5 4.27 7.5 9.42"/>',
    activity: '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
    shield_check: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    key_round: '<path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>',
    arrow_up: '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
    arrow_down: '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    circle_dot: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
    beaker: '<path d="M4.5 3h15"/><path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3"/><path d="M6 14h12"/>',
    flask_conical: '<path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/>',
    book_text: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/>',
    hospital: '<path d="M12 6v4"/><path d="M14 14h-4"/><path d="M14 18h-4"/><path d="M14 8h-4"/><path d="M18 12h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h2"/><path d="M19 5a3 3 0 1 1-6 0c0-1.5 1.5-3 3-3s3 1.5 3 3z"/><path d="M10 5a3 3 0 1 1-6 0c0-1.5 1.5-3 3-3s3 1.5 3 3z"/>',
    cpu: '<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/>',
    cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
    radio: '<path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1"/>',
    calculator: '<rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    swords: '<polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" x2="19" y1="19" y2="13"/><line x1="16" x2="20" y1="16" y2="20"/><line x1="19" x2="21" y1="21" y2="19"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/><line x1="5" x2="9" y1="14" y2="18"/><line x1="7" x2="4" y1="16" y2="19"/><line x1="3" x2="5" y1="21" y2="21"/>',
    radar: '<path d="M19.7 14a8.5 8.5 0 1 0-9.7 9.7"/><path d="M22 12a10 10 0 0 0-10-10"/><path d="M16.5 7.5 12 12"/><path d="M12 12 8 8"/><circle cx="12" cy="12" r="1"/>',
  };

  function icon(name, size, attrs) {
    var s = size != null ? size : 16;
    var extra = "";
    if (attrs) {
      for (var k in attrs) {
        if (Object.prototype.hasOwnProperty.call(attrs, k)) {
          extra += " " + k + '="' + UI.escapeHtml(String(attrs[k])) + '"';
        }
      }
    }
    var body = ICON_PATHS[name] || "";
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + s + '" height="' + s +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"' +
      extra + ">" + body + "</svg>"
    );
  }

  // --------------------------------------------------------------------------
  // HTML escaping + small DOM helpers
  // --------------------------------------------------------------------------

  function escapeHtml(s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function attr(name, value) {
    if (value == null || value === false) return "";
    if (value === true) return " " + name;
    return " " + name + '="' + escapeHtml(String(value)) + '"';
  }

  UI.escapeHtml = escapeHtml;
  UI.icon = icon;
  UI.attr = attr;

  // --------------------------------------------------------------------------
  // Severity helpers
  // --------------------------------------------------------------------------

  function severityColor(score) {
    if (score == null) return "#9fb3aa";
    if (score >= 9) return "#fb7185";
    if (score >= 7) return "#f5a524";
    if (score >= 4) return "#34d399";
    return "#9fb3aa";
  }

  // Pillar colors (mirrors ObjectivesTracker.tsx PILLAR_COLORS).
  var PILLAR_COLORS = { P1: "#34d399", P2: "#22d3ee", P3: "#f5a524", P4: "#fb7185" };

  // --------------------------------------------------------------------------
  // R6 — deterministic seeded shuffle (Fisher-Yates with mulberry32 PRNG).
  // Ports ObjectiveInteraction.tsx seededShuffle 1:1 — same algorithm, same
  // guard against identity permutation.
  // --------------------------------------------------------------------------

  function seededShuffle(arr, seed) {
    var input = arr.slice();
    // mulberry32 PRNG — seed hashing identical to the TS original.
    var h = 1779033703 ^ seed.length;
    for (var i = 0; i < seed.length; i++) {
      h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    function rng() {
      h = Math.imul(h ^ (h >>> 15), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      h ^= h >>> 16;
      return (h >>> 0) / 4294967296;
    }
    var out = input.slice();
    for (var j = out.length - 1; j > 0; j--) {
      var k = Math.floor(rng() * (j + 1));
      var tmp = out[j];
      out[j] = out[k];
      out[k] = tmp;
    }
    // Guard against the astronomically rare case where the shuffle produces
    // the identity permutation — rotate by one if so.
    var same = out.every(function (v, idx) { return v === input[idx]; });
    if (same && out.length > 1) {
      var first = out.shift();
      out.push(first);
    }
    return out;
  }

  UI.seededShuffle = seededShuffle;
  UI.PILLAR_COLORS = PILLAR_COLORS;
  UI.severityColor = severityColor;

  // --------------------------------------------------------------------------
  // Component renders. Each returns an HTML string.
  // --------------------------------------------------------------------------

  UI.renderModeSelect = function () {
    var modes = [
      {
        value: "medium",
        title: "Medium",
        subtitle: "Tiered hints · tolerant validation · 12 objectives",
        bullets: [
          "4-way matching, sorting, classification chips",
          "CVSS calculator with live bands",
          "3 hint levels: nudge → direction → demonstration",
        ],
        icon: "beaker",
        accent: "#34d399",
      },
      {
        value: "hard",
        title: "Hard",
        subtitle: "Hints cost points · strict validation · 9 objectives",
        bullets: [
          "Full 14-card triage + red herrings",
          "Environmental CVSS + signed-update reasoning",
          "Peer-review of a flawed mitigation plan",
        ],
        icon: "flask_conical",
        accent: "#fb7185",
      },
    ];

    var cards = modes
      .map(function (m) {
        var bullets = m.bullets
          .map(function (b) {
            return (
              '<li class="mode-bullet"><span style="color:' + m.accent + '">•</span><span>' +
              escapeHtml(b) + "</span></li>"
            );
          })
          .join("");
        return (
          '<button type="button" class="mode-card lab-pop" data-action="set-mode" data-mode="' +
          m.value + '" style="--accent:' + m.accent + '">' +
          '<span class="mode-icon" style="color:' + m.accent + '">' + icon(m.icon, 24) + "</span>" +
          '<div><h2 class="mode-title">' + escapeHtml(m.title) + "</h2>" +
          '<p class="mode-subtitle">' + escapeHtml(m.subtitle) + "</p></div>" +
          '<ul class="mode-bullets">' + bullets + "</ul>" +
          '<span class="mode-start" style="border-color:' + m.accent + "66;color:" + m.accent + '">' +
          "Start " + escapeHtml(m.title) + " →</span>" +
          "</button>"
        );
      })
      .join("");

    return (
      '<div class="mode-select lab-pop">' +
        '<div class="mode-header">' +
          '<div class="mode-pill-header"><span class="mode-pill-icon" style="color:#34d399">' +
          icon("shield_check", 14) + "</span>CompTIA Security+ SY0-801 · Objective 2.4</div>" +
          '<h1 class="mode-h1">Vulnerability Council</h1>' +
          '<p class="mode-blurb">Examine common vulnerabilities and associated risks. You are the Risk ' +
          "Officer at Meridian Health Systems — classify the findings, score them " +
          "with CVSS, and route the right ones into the weekly Patch Council queue.</p>" +
          '<p class="mode-disclaimer">All evidence is synthetic and labelled “Training data — fictional.”</p>' +
        "</div>" +
        '<div class="mode-grid">' + cards + "</div>" +
        '<div class="mode-footer"><span class="mode-footer-icon">' + icon("book_text", 14) +
        "</span>Progress saves to this browser. Switch modes anytime — your work in each mode is preserved.</div>" +
      "</div>"
    );
  };

  UI.renderScenarioBanner = function (kevCount) {
    var realCount = Data.EVIDENCE.filter(function (e) { return !e.redHerring; }).length;
    return (
      '<header class="scenario-banner" aria-label="Scenario briefing">' +
        '<div class="scenario-row">' +
          '<div class="scenario-org">' +
            '<span class="scenario-org-icon">' + icon("hospital", 18) + "</span>" +
            '<div><h1 class="scenario-org-name">Meridian Health Systems</h1>' +
            '<p class="scenario-org-sub">Regional healthcare · hybrid environment</p></div>' +
          "</div>" +
          '<div class="scenario-tags">' +
            '<span class="scenario-tag">' + icon("cpu", 12) + " on-prem AD</span>" +
            '<span class="scenario-tag">' + icon("cloud", 12) + " Azure cloud</span>" +
            '<span class="scenario-tag">' + icon("radio", 12) + " OT / IoT medical</span>" +
          "</div>" +
          '<div class="scenario-stats">' +
            '<span class="scenario-stat">' + realCount + " findings</span>" +
            (kevCount > 0
              ? '<span class="scenario-stat kev">' + icon("activity", 12) + " " + kevCount + " in KEV</span>"
              : "") +
            '<span class="scenario-stat accent">SY0-801 · 2.4</span>' +
          "</div>" +
        "</div>" +
        '<p class="scenario-desc">The SOC ran a quarterly vulnerability scan, a code-review sprint, and a ' +
        "cloud configuration audit. You are the Risk Officer who must triage the " +
        "findings into the weekly Patch Council queue. Training data — fictional.</p>" +
      "</header>"
    );
  };

  UI.renderToolbar = function (mode, allDone) {
    function modePill(m) {
      var active = mode === m;
      return (
        '<button type="button" class="mode-pill' + (active ? " active" : "") +
        '" data-action="set-mode" data-mode="' + m + '" aria-pressed="' + active + '">' + m + "</button>"
      );
    }

    return (
      '<div class="toolbar">' +
        '<span class="toolbar-title">Vulnerability Council</span>' +
        '<span class="toolbar-sub">SY0-801 · 2.4</span>' +
        '<div class="toolbar-modes">' + modePill("medium") + modePill("hard") + "</div>" +
        '<div class="toolbar-actions">' +
          '<button type="button" class="tb-btn accent" data-action="open-quiz">' +
          icon("brain", 14) + " Knowledge Check</button>" +
          '<button type="button" class="tb-btn" data-action="open-debrief">' +
          icon("clipboard_list", 14) + " Debrief</button>" +
          (allDone
            ? '<button type="button" class="tb-btn warning" data-action="open-completion">' +
              icon("trophy", 14) + " Results</button>"
            : "") +
          '<button type="button" class="tb-btn danger" data-action="confirm-reset">' +
          icon("rotate_ccw", 14) + " Reset</button>" +
        "</div>" +
      "</div>"
    );
  };

  UI.renderEvidenceVault = function (hardMode) {
    var cards = hardMode ? Data.EVIDENCE : Data.EVIDENCE.filter(function (e) { return !e.redHerring; });

    var html = cards
      .map(function (e) {
        var active = Store.state.activeEvidenceId === e.id;
        var cls = Store.state.classifications[e.id];
        var classified = cls && (cls.category !== "none" || cls.surface !== "none");
        var sev = severityColor(e.cvssExpected);

        var cvssBadge = e.cvssExpected != null
          ? '<span class="ev-cvss" style="color:' + sev + ";border-color:" + sev + '66">CVSS ' +
            e.cvssExpected.toFixed(1) + "</span>"
          : '<span class="ev-cvss na">N/A</span>';

        var epssBadge = e.epss != null
          ? '<span class="ev-epss">EPSS ' + e.epss.toFixed(2) + "</span>"
          : "";

        var burnedBadge =
          e.id === "e5"
            ? '<span class="ev-burned">' + icon("key_round", 10) + " burned</span>"
            : "";

        var classBadge =
          classified && !e.redHerring && cls && cls.category
            ? '<span class="ev-classified">' + escapeHtml(Data.CATEGORY_LABEL[cls.category]) + "</span>"
            : "";

        var flaggedBadge = Store.state.redHerringFlags[e.id]
          ? '<span class="ev-flagged">flagged</span>'
          : "";

        return (
          '<button type="button" class="ev-card lab-pop' + (active ? " active" : "") +
          '" data-action="set-evidence" data-id="' + e.id + '" aria-pressed="' + active + '">' +
            '<div class="ev-card-head">' +
              '<span class="ev-code">' + escapeHtml(e.code) + "</span>" +
              '<span class="ev-title">' + escapeHtml(e.title) + "</span>" +
              (e.kev ? '<span class="ev-kev" title="In CISA KEV catalog" aria-label="KEV">' + icon("flame", 14) + "</span>" : "") +
              (e.redHerring ? '<span class="ev-control" aria-label="Control review">' + icon("shield_check", 14) + "</span>" : "") +
            "</div>" +
            '<div class="ev-card-meta">' +
              cvssBadge + epssBadge + burnedBadge + classBadge + flaggedBadge +
            "</div>" +
          "</button>"
        );
      })
      .join("");

    return (
      '<aside class="panel vault" aria-label="Evidence vault">' +
        '<header class="panel-head">' +
          '<span class="panel-head-icon accent">' + icon("file_search", 16) + "</span>" +
          '<h2 class="panel-title">Evidence Vault</h2>' +
          '<span class="panel-count">' + cards.length + " cases</span>" +
        "</header>" +
        '<div class="lab-scroll panel-body vault-list">' + html + "</div>" +
        '<p class="panel-foot">Training data — fictional. Synthetic findings for SY0-801 2.4.</p>' +
      "</aside>"
    );
  };

  UI.renderCaseFileViewer = function () {
    var active = Store.state.activeEvidenceId ? Data.EVIDENCE_BY_ID[Store.state.activeEvidenceId] : null;

    var body;
    if (active) {
      var sev = active.cvssExpected && active.cvssExpected >= 9 ? "#fb7185" : "#e6f2ec";
      var cvssVal = active.cvssExpected != null ? active.cvssExpected.toFixed(1) : "N/A";
      var epssVal = active.epss != null ? active.epss.toFixed(2) : "N/A";
      var kevVal = active.kev ? "YES" : "no";
      var kevColor = active.kev ? "#fb7185" : "#9fb3aa";

      var classifyOrFlag;
      if (active.redHerring) {
        var flagged = !!Store.state.redHerringFlags[active.id];
        classifyOrFlag =
          '<div class="case-control">' +
            '<div class="case-control-row">' +
              '<div class="case-control-label">' +
                '<span class="case-control-icon">' + icon("shield_check", 16) + "</span>" +
                '<span class="case-control-text">Control review case</span>' +
              "</div>" +
              '<button type="button" class="case-flag-btn' + (flagged ? " flagged" : "") +
              '" data-action="toggle-redherring" data-id="' + active.id + '" aria-pressed="' + flagged + '">' +
              (flagged ? "Flagged: No vulnerability — control verified" : "Flag as red herring") +
              "</button>" +
            "</div>" +
            '<p class="case-control-note">Expected classification: “No vulnerability — control verified.”</p>' +
          "</div>";
      } else {
        classifyOrFlag = renderClassificationChips(active.id);
      }

      var councilToggle = !active.redHerring ? renderCouncilToggle(active.id) : "";

      body =
        '<article class="case-file lab-pop">' +
          '<header class="case-file-head">' +
            '<div><div class="case-file-title-row">' +
              '<span class="ev-code">' + escapeHtml(active.code) + "</span>" +
              '<h2 class="case-file-title">' + escapeHtml(active.title) + "</h2>" +
            "</div>" +
            '<p class="case-file-sub">' + escapeHtml(Data.CATEGORY_LABEL[active.category]) +
            " · " + escapeHtml(Data.SURFACE_LABEL[active.surface]) +
            (active.altSurface ? " · also " + escapeHtml(Data.SURFACE_LABEL[active.altSurface]) : "") +
            "</p></div>" +
            '<button type="button" class="case-close-btn" data-action="set-evidence" data-id="">close</button>' +
          "</header>" +
          '<div class="case-stats">' +
            '<div class="stat"><div class="stat-label">CVSS</div><div class="stat-val" style="color:' + sev + '">' + cvssVal + "</div></div>" +
            '<div class="stat"><div class="stat-label">EPSS</div><div class="stat-val">' + epssVal + "</div></div>" +
            '<div class="stat"><div class="stat-label">KEV</div><div class="stat-val" style="color:' + kevColor + '">' + kevVal + "</div></div>" +
            '<div class="stat"><div class="stat-label">Asset / Exposure</div><div class="stat-val">' + active.assetValue + " / " + active.exposure + "</div></div>" +
          "</div>" +
          '<pre class="case-body lab-scroll">' + escapeHtml(active.body) + "</pre>" +
          classifyOrFlag + councilToggle +
        "</article>";
    } else {
      body =
        '<div class="case-empty">' +
          icon("chevron_right", 24) +
          '<p>Select a case from the Evidence Vault to examine it here.</p>' +
        "</div>";
    }

    return (
      '<section class="panel case-panel" aria-label="Case file viewer">' +
        body +
        UI.renderCVSSCalculator(active ? active.cvssExpected : undefined) +
        '<div class="case-priority-key">' +
          '<span class="case-priority-key-item">' + icon("gauge", 12) + " composite priority</span>" +
          '<span class="case-priority-key-item">' + icon("boxes", 12) + " CVSS × EPSS × KEV</span>" +
          '<span class="case-priority-key-item">' + icon("activity", 12) + " × exposure × asset</span>" +
        "</div>" +
      "</section>"
    );
  };

  function renderClassificationChips(evidenceId) {
    var cur = Store.state.classifications[evidenceId] || { category: "none", surface: "none" };

    var catOptions = Data.VULN_CATEGORIES.map(function (c) {
      return '<option value="' + c.value + '"' + (cur.category === c.value ? " selected" : "") + ">" + escapeHtml(c.label) + "</option>";
    }).join("");

    var surfOptions = Data.ATTACK_SURFACES.map(function (s) {
      return '<option value="' + s.value + '"' + (cur.surface === s.value ? " selected" : "") + ">" + escapeHtml(s.label) + "</option>";
    }).join("");

    var summary = cur.category !== "none" || cur.surface !== "none"
      ? '<p class="chips-summary">Current: <span class="chips-cat">' + escapeHtml(Data.CATEGORY_LABEL[cur.category]) +
        '</span> · <span class="chips-surf">' + escapeHtml(Data.SURFACE_LABEL[cur.surface]) + "</span></p>"
      : "";

    return (
      '<div class="chips">' +
        '<div class="chips-head">' +
          '<span class="chips-head-icon">' + icon("flag", 14) + "</span>" +
          '<h4 class="chips-title">Classify this case</h4>' +
        "</div>" +
        '<div class="chips-grid">' +
          '<label class="chips-label"><span>Vulnerability type</span>' +
          '<select aria-label="Vulnerability type" data-action="set-classification" data-id="' + evidenceId + '" data-field="category">' +
          '<option value="none"' + (cur.category === "none" ? " selected" : "") + ">— select —</option>" +
          catOptions + "</select></label>" +
          '<label class="chips-label"><span>Attack surface</span>' +
          '<select aria-label="Attack surface" data-action="set-classification" data-id="' + evidenceId + '" data-field="surface">' +
          '<option value="none"' + (cur.surface === "none" ? " selected" : "") + ">— select —</option>" +
          surfOptions + "</select></label>" +
        "</div>" +
        summary +
      "</div>"
    );
  }

  function renderCouncilToggle(evidenceId) {
    var selected = Store.state.councilSelection.indexOf(evidenceId) !== -1;
    return (
      '<label class="council-toggle">' +
        '<input type="checkbox"' + (selected ? " checked" : "") +
        ' data-action="toggle-council" data-id="' + evidenceId + '" />' +
        '<span>Send this case to the weekly Council queue (Hard mode)</span>' +
      "</label>"
    );
  }

  // --------------------------------------------------------------------------
  // CVSS Calculator — base score + optional environmental, vector string.
  // --------------------------------------------------------------------------

  function metricSelect(metric, value, action, dataId) {
    var optsHtml = '<option value="">—</option>';
    for (var i = 0; i < metric.options.length; i++) {
      var pair = metric.options[i];
      optsHtml +=
        '<option value="' + pair[0] + '"' + (value === pair[0] ? " selected" : "") + ">" +
        pair[0] + " — " + pair[1] + "</option>";
    }
    return (
      '<label class="cvss-metric">' +
        "<span>" + escapeHtml(metric.label) + "</span>" +
        '<select aria-label="' + escapeHtml(metric.label) + '" data-action="' + action + '"' +
        (dataId ? ' data-id="' + dataId + '"' : "") + ' data-key="' + metric.key + '">' +
        optsHtml + "</select>" +
      "</label>"
    );
  }

  UI.renderCVSSCalculator = function (expected) {
    var base = Store.state.cvss;
    var env = Store.state.cvssEnv;
    var showEnv = Store.state.showEnv;
    // Merge env overrides onto base WITHOUT letting env's empty base keys wipe
    // the real base values (env carries base keys as "").
    var merged = Object.assign({}, env, base);
    var result = CVSS.computeEnvironmental(merged);
    var scoreShown = showEnv ? result.environmentalScore : result.baseScore;
    var band = CVSS.bandForScore(scoreShown);
    var vector = CVSS.buildVectorString(merged);
    var matchesExpected = expected != null && Math.abs(result.baseScore - expected) < 0.05;

    var bandClass = "band-" + band.toLowerCase();

    var baseSelects = CVSS.BASE_METRICS.map(function (m) {
      return metricSelect(m, base[m.key] || "", "set-cvss-base");
    }).join("");

    var envSection = "";
    if (showEnv) {
      var envSelects = CVSS.ENV_METRICS.map(function (m) {
        return metricSelect(m, env[m.key] || "X", "set-cvss-env");
      }).join("");
      envSection =
        '<div class="cvss-env">' +
          '<p class="cvss-env-label">Environmental metrics</p>' +
          '<div class="cvss-grid">' + envSelects + "</div>" +
          '<div class="cvss-env-summary">Base: <span class="mono">' + result.baseScore.toFixed(1) +
          '</span> · Environmental: <span class="mono">' + result.environmentalScore.toFixed(1) + "</span></div>" +
        "</div>";
    }

    return (
      '<section class="cvss-calculator" aria-label="CVSS v3.1 calculator">' +
        '<header class="cvss-head">' +
          '<div class="cvss-head-title">' +
            '<span class="cvss-head-icon">' + icon("calculator", 16) + "</span>" +
            "<h3>CVSS v3.1 Calculator</h3>" +
          "</div>" +
          '<button type="button" class="cvss-env-toggle' + (showEnv ? " active" : "") +
          '" data-action="toggle-env" aria-pressed="' + showEnv + '">' +
          (showEnv ? "Environmental: ON" : "+ Environmental metrics") + "</button>" +
        "</header>" +
        '<div class="cvss-score-row">' +
          '<div class="cvss-score"><span class="cvss-score-val">' + scoreShown.toFixed(1) +
          '</span><span class="cvss-score-label">' + (showEnv ? "Env score" : "Base score") + "</span></div>" +
          '<div class="cvss-badges">' +
            '<span class="band ' + bandClass + '">' + band + "</span>" +
            (expected != null
              ? '<span class="band ' + (matchesExpected ? "match" : "nomatch") + '">' +
                (matchesExpected ? "Matches expected" : "Expected " + expected.toFixed(1)) + "</span>"
              : "") +
          "</div>" +
        "</div>" +
        '<div class="cvss-grid">' + baseSelects + "</div>" +
        envSection +
        '<div class="cvss-vector">' +
          "<span>Vector</span>" +
          '<code class="cvss-vector-code">' + escapeHtml(vector) + "</code>" +
        "</div>" +
        '<p class="cvss-warn">' + icon("alert_triangle", 12) +
        " v3.1 and v4.0 scores are NOT interchangeable — confirm which version a CVE uses before comparing.</p>" +
      "</section>"
    );
  };

  // --------------------------------------------------------------------------
  // Priority queue — rank council cases.
  // --------------------------------------------------------------------------

  var QUEUE_POOL = Data.EVIDENCE.filter(function (e) {
    return !e.redHerring && e.cvssExpected != null;
  });

  UI.renderPriorityQueue = function () {
    var ordered = Store.state.queueOrder;
    var pool = QUEUE_POOL.filter(function (e) { return ordered.indexOf(e.id) === -1; });

    var rankedHtml = ordered
      .map(function (id, i) {
        var e = Data.EVIDENCE_BY_ID[id];
        if (!e) return "";
        var score = Data.EVIDENCE_PRIORITY_SCORE[id];
        return (
          '<div class="queue-item lab-pop">' +
            '<div class="queue-item-head">' +
              '<span class="queue-rank">' + (i + 1) + "</span>" +
              '<span class="queue-code">' + escapeHtml(e.code) + "</span>" +
              '<span class="queue-title">' + escapeHtml(e.title) + "</span>" +
              '<div class="queue-item-btns">' +
                '<button type="button" class="queue-btn" aria-label="Move up" data-action="queue-move" data-id="' + id + '" data-dir="-1"' + (i === 0 ? " disabled" : "") + ">" + icon("arrow_up", 14) + "</button>" +
                '<button type="button" class="queue-btn" aria-label="Move down" data-action="queue-move" data-id="' + id + '" data-dir="1"' + (i === ordered.length - 1 ? " disabled" : "") + ">" + icon("arrow_down", 14) + "</button>" +
                '<button type="button" class="queue-btn danger" aria-label="Remove from queue" data-action="queue-remove" data-id="' + id + '">' + icon("x", 14) + "</button>" +
              "</div>" +
            "</div>" +
            '<div class="queue-item-meta">' +
              '<span class="mono">CVSS ' + e.cvssExpected.toFixed(1) + "</span><span>·</span>" +
              '<span class="mono">EPSS ' + (e.epss != null ? e.epss.toFixed(2) : "—") + "</span>" +
              (e.kev ? '<span class="kev">· KEV</span>' : "") +
              "<span>·</span>" +
              '<span class="success">priority ' + score.toFixed(2) + "</span>" +
            "</div>" +
          "</div>"
        );
      })
      .join("");

    var poolHtml = "";
    if (pool.length > 0) {
      poolHtml =
        '<div class="queue-pool">' +
          '<p class="queue-pool-label">Unranked pool</p>' +
          pool
            .map(function (e) {
              return (
                '<button type="button" class="queue-pool-item" data-action="queue-add" data-id="' + e.id + '">' +
                  icon("plus", 12) +
                  '<span class="mono">' + escapeHtml(e.code) + "</span>" +
                  '<span class="queue-title">' + escapeHtml(e.title) + "</span>" +
                  '<span class="mono queue-pool-score">' + Data.EVIDENCE_PRIORITY_SCORE[e.id].toFixed(2) + "</span>" +
                "</button>"
              );
            })
            .join("") +
        "</div>";
    }

    return (
      '<aside class="panel queue" aria-label="Priority queue">' +
        '<header class="panel-head">' +
          '<span class="panel-head-icon accent">' + icon("list_ordered", 16) + "</span>" +
          '<h2 class="panel-title">Council Queue</h2>' +
          '<span class="panel-count">' + ordered.length + " ranked</span>" +
        "</header>" +
        '<div class="lab-scroll panel-body queue-body">' +
          (ordered.length === 0
            ? '<p class="queue-empty">Click cases below to rank them into the weekly queue.</p>'
            : "") +
          rankedHtml + poolHtml +
        "</div>" +
      "</aside>"
    );
  };

  // --------------------------------------------------------------------------
  // Objectives tracker — pillar rings + per-objective cards with interactions.
  // --------------------------------------------------------------------------

  function renderPillarRing(pillar, done, total) {
    var color = PILLAR_COLORS[pillar];
    var r = 16;
    var c = 2 * Math.PI * r;
    var pct = total === 0 ? 0 : done / total;
    var dash = c * pct;
    return (
      '<div class="pillar-ring">' +
        '<svg width="44" height="44" viewBox="0 0 44 44" aria-hidden>' +
          '<circle cx="22" cy="22" r="' + r + '" fill="none" stroke="#243832" stroke-width="4" />' +
          '<circle cx="22" cy="22" r="' + r + '" fill="none" stroke="' + color +
          '" stroke-width="4" stroke-dasharray="' + dash + " " + (c - dash) +
          '" stroke-dashoffset="' + c / 4 + '" stroke-linecap="round" transform="rotate(-90 22 22)"' +
          ' style="transition:stroke-dasharray 300ms ease" />' +
          '<text x="22" y="26" text-anchor="middle" font-size="11" font-weight="700" fill="' + color +
          '" font-family="\'Oswald\', \'Arial Narrow\', sans-serif">' + pillar.replace("P", "") + "</text>" +
        "</svg>" +
        '<span class="pillar-ring-label">' + escapeHtml(Data.PILLAR_LABEL[pillar]) + "</span>" +
        '<span class="pillar-ring-count mono">' + done + "/" + total + "</span>" +
      "</div>"
    );
  }

  UI.renderObjectivesTracker = function (mode) {
    var objs = mode === "medium" ? Data.MEDIUM_OBJECTIVES : Data.HARD_OBJECTIVES;
    var pillars = ["P1", "P2", "P3", "P4"];

    var totalDone = objs.filter(function (o) {
      return Store.progress[o.id] && Store.progress[o.id].status === "correct";
    }).length;
    var totalPct = Math.round((totalDone / objs.length) * 100);

    var rings = pillars
      .map(function (pl) {
        var list = Data.OBJECTIVES.filter(function (o) { return o.mode === mode && o.pillar === pl; });
        var done = list.filter(function (o) {
          return Store.progress[o.id] && Store.progress[o.id].status === "correct";
        }).length;
        return renderPillarRing(pl, done, list.length);
      })
      .join("");

    var cards = objs.map(function (obj) { return UI.renderObjectiveCard(obj); }).join("");

    return (
      '<section class="objectives-tracker panel" aria-label="Objectives tracker">' +
        '<header class="ot-head">' +
          '<div class="ot-head-title">' +
            '<span class="ot-head-icon accent">' + icon("target", 16) + "</span>" +
            '<h2 class="panel-title">Objectives</h2>' +
          "</div>" +
          '<div class="ot-rings">' + rings + "</div>" +
          '<div class="ot-progress">' +
            '<div class="ot-progress-bar"><div class="ot-progress-fill" style="width:' + totalPct + '%"></div></div>' +
            '<span class="mono ot-progress-text">' + totalDone + "/" + objs.length + "</span>" +
          "</div>" +
        "</header>" +
        '<div class="lab-scroll ot-list">' + cards + "</div>" +
      "</section>"
    );
  };

  UI.renderObjectiveCard = function (obj) {
    var p = Store.progress[obj.id] || { status: "idle", attempts: 0, hintsUsed: 0 };
    var locked = p.status !== "idle";
    var hintsRevealed = Math.min(p.hintsUsed || 0, obj.hints.length);
    var canHint = hintsRevealed < obj.hints.length;
    var color = PILLAR_COLORS[obj.pillar];

    var statusIcon = "";
    if (p.status === "correct") statusIcon = '<span class="obj-status-icon success" aria-label="Correct">' + icon("check_circle", 16) + "</span>";
    else if (p.status === "incorrect") statusIcon = '<span class="obj-status-icon danger" aria-label="Incorrect">' + icon("x_circle", 16) + "</span>";

    var hintsHtml = "";
    if (hintsRevealed > 0) {
      var hints = obj.hints.slice(0, hintsRevealed)
        .map(function (h, i) {
          return (
            '<p class="hint-item">' + icon("lightbulb", 12) +
            '<span><span class="hint-label">Hint ' + (i + 1) + ':</span> ' + escapeHtml(h) + "</span></p>"
          );
        })
        .join("");
      hintsHtml = '<div class="hints-box">' + hints + "</div>";
    }

    var feedbackHtml = "";
    if (p.lastFeedback) {
      var cls = p.status === "correct" ? "success" : "danger";
      feedbackHtml = '<div class="feedback ' + cls + '" role="status">' + escapeHtml(p.lastFeedback) + "</div>";
    }

    var interaction = UI.renderObjectiveInteraction(obj, locked);

    var hintBtn = "";
    if (canHint) {
      var hintLabel = obj.mode === "hard" ? "Nudge (-10)" : "Hint " + (hintsRevealed + 1);
      var hintTitle = obj.mode === "hard" ? "Nudge — costs 10 score points" : "Hint " + (hintsRevealed + 1) + " of 3";
      hintBtn =
        '<button type="button" class="btn-hint" data-action="request-hint" data-id="' + obj.id + '"' +
        (locked ? " disabled" : "") + ' title="' + escapeHtml(hintTitle) + '">' +
        icon("lightbulb", 14) + " " + escapeHtml(hintLabel) + "</button>";
    }

    return (
      '<article class="obj-card lab-pop ' + p.status + '" aria-labelledby="obj-' + obj.id + '-title">' +
        '<header class="obj-head">' +
          '<span class="obj-pillar" style="color:' + color + ";border-color:" + color + '66">' + obj.pillar + "</span>" +
          '<h3 class="obj-title" id="obj-' + obj.id + '-title">' + escapeHtml(obj.title) + "</h3>" +
          statusIcon +
        "</header>" +
        '<div class="obj-interaction">' + interaction + "</div>" +
        hintsHtml +
        feedbackHtml +
        '<div class="obj-actions">' +
          '<button type="button" class="btn-check" data-action="check-obj" data-id="' + obj.id + '"' +
          (locked ? " disabled" : "") +
          ' aria-label="' + (locked ? "Locked — press Reset to retry" : "Check your answer") + '">Check</button>' +
          hintBtn +
          '<button type="button" class="btn-reset" data-action="reset-obj" data-id="' + obj.id + '">' +
          icon("rotate_ccw", 14) + " Reset</button>" +
          (p.attempts && p.attempts > 0
            ? '<span class="obj-attempts mono">attempts: ' + p.attempts + "</span>"
            : "") +
        "</div>" +
      "</article>"
    );
  };

  // --------------------------------------------------------------------------
  // Glossary — collapsible knowledge core + term list.
  // --------------------------------------------------------------------------

  UI.renderGlossary = function (open) {
    var isOpen = !!open;
    var core = Data.KNOWLEDGE_CORE
      .map(function (k) {
        return (
          '<div class="kc-card"><h4 class="kc-heading">' + escapeHtml(k.heading) + "</h4>" +
          '<p class="kc-body">' + escapeHtml(k.body) + "</p></div>"
        );
      })
      .join("");

    var terms = Data.GLOSSARY
      .map(function (g) {
        return (
          '<div class="glossary-term"><dt>' + escapeHtml(g.term) + "</dt>" +
          '<dd>' + escapeHtml(g.definition) + "</dd></div>"
        );
      })
      .join("");

    return (
      '<section class="glossary panel' + (isOpen ? " open" : "") + '">' +
        '<button type="button" class="glossary-trigger" data-action="toggle-glossary" aria-expanded="' + isOpen + '">' +
          '<span class="glossary-trigger-icon accent">' + icon("book_open", 16) + "</span>" +
          '<span class="glossary-trigger-title">Knowledge Core & Glossary</span>' +
          '<span class="glossary-chevron' + (isOpen ? " open" : "") + '">' + icon("chevron_down", 16) + "</span>" +
        "</button>" +
        (isOpen
          ? '<div class="glossary-body">' +
              '<div class="kc-grid">' + core + "</div>" +
              '<h4 class="glossary-list-title">Glossary (' + Data.GLOSSARY.length + " terms)</h4>" +
              '<div class="lab-scroll glossary-list"><dl class="glossary-dl">' + terms + "</dl></div>" +
            "</div>"
          : "") +
      "</section>"
    );
  };

  // --------------------------------------------------------------------------
  // Debrief modal
  // --------------------------------------------------------------------------

  UI.renderDebriefModal = function () {
    var detection = Data.DEBRIEF.detection
      .map(function (d) {
        return '<li class="debrief-li"><span class="debrief-bullet">•</span><span>' + escapeHtml(d) + "</span></li>";
      })
      .join("");

    var mitigation = Data.DEBRIEF.mitigation
      .map(function (m) {
        return (
          '<a class="debrief-link" href="' + escapeHtml(m.url) + '" target="_blank" rel="noopener noreferrer">' +
          '<span class="mono debrief-link-id">' + escapeHtml(m.id) + "</span>" +
          '<span class="debrief-link-label">' + escapeHtml(m.label) + "</span>" +
          icon("link", 12) + "</a>"
        );
      })
      .join("");

    var blue = Data.DEBRIEF.blueTeam
      .map(function (d) { return '<li>• ' + escapeHtml(d) + "</li>"; })
      .join("");

    var red = Data.DEBRIEF.redTeam
      .map(function (d) { return '<li>• ' + escapeHtml(d) + "</li>"; })
      .join("");

    var links = Data.DEBRIEF.links
      .map(function (l) {
        return (
          '<a class="debrief-link" href="' + escapeHtml(l.url) + '" target="_blank" rel="noopener noreferrer">' +
          escapeHtml(l.label) + " " + icon("link", 12) + "</a>"
        );
      })
      .join("");

    return (
      '<div class="modal-overlay" data-action="close-debrief"></div>' +
      '<div class="modal lab-scroll debrief-modal" role="dialog" aria-modal="true" aria-labelledby="debrief-title">' +
        '<button type="button" class="modal-close" data-action="close-debrief" aria-label="Close debrief">' + icon("x", 20) + "</button>" +
        '<div class="modal-head">' +
          '<h2 class="modal-title" id="debrief-title"><span class="accent">' + icon("clipboard_list", 16) +
          "</span> Debrief — synthesis & takeaways</h2>" +
          '<p class="modal-sub">Detection opportunities, mitigation IDs, and red/blue-team notes for the ' +
          "Meridian Health Systems scenario.</p>" +
        "</div>" +
        '<div class="modal-body debrief-body">' +
          '<section><h3 class="debrief-section-h accent">' + icon("radar", 14) + " Detection opportunities</h3>" +
          '<ul class="debrief-list">' + detection + "</ul></section>" +
          '<section><h3 class="debrief-section-h accent">' + icon("shield", 14) + " Mitigation recommendations (MITRE CWE)</h3>" +
          '<div class="debrief-links">' + mitigation + "</div></section>" +
          '<div class="debrief-twocol">' +
            '<section class="debrief-blue"><h3 class="debrief-section-h success">' + icon("shield", 14) + " Blue-team takeaways</h3>" +
            '<ul class="debrief-list">' + blue + "</ul></section>" +
            '<section class="debrief-red"><h3 class="debrief-section-h danger">' + icon("swords", 14) + " Red-team takeaways</h3>" +
            '<ul class="debrief-list">' + red + "</ul></section>" +
          "</div>" +
          '<section><h3 class="debrief-section-h accent">What to learn next</h3>' +
          '<div class="debrief-links">' + links + "</div></section>" +
        "</div>" +
      "</div>"
    );
  };

  // --------------------------------------------------------------------------
  // Completion modal — score, stars, R8 focus areas, recap, links, restart
  // --------------------------------------------------------------------------

  function computeStars(score, totalHints) {
    if (totalHints <= 0 && score >= 90) return 5;
    if (totalHints <= 1 && score >= 80) return 4;
    if (totalHints <= 2 && score >= 70) return 3;
    if (totalHints <= 3 && score >= 60) return 2;
    return 1;
  }

  /**
   * R8 — derive focus areas from the student's actual performance evidence.
   * An objective becomes a focus area if any of:
   *   - status !== "correct" (still wrong or never completed)
   *   - attempts > 1 (struggled — needed multiple tries)
   *   - hintsUsed > 0 (needed help)
   * Quiz items answered wrong also become focus areas.
   */
  function computeFocusAreas(mode) {
    var objs = Data.OBJECTIVES.filter(function (o) { return o.mode === mode; });
    var byPillar = { P1: [], P2: [], P3: [], P4: [] };
    for (var i = 0; i < objs.length; i++) {
      var o = objs[i];
      var p = Store.progress[o.id];
      if (!p || p.status !== "correct" || (p.attempts || 0) > 1 || (p.hintsUsed || 0) > 0) {
        var reasons = [];
        if (!p || p.status === "idle") reasons.push("not yet completed");
        else if (p.status === "incorrect") reasons.push("answered incorrectly");
        if (p && (p.attempts || 0) > 1) reasons.push("took " + p.attempts + " attempts");
        if (p && (p.hintsUsed || 0) > 0)
          reasons.push("used " + p.hintsUsed + " hint" + (p.hintsUsed > 1 ? "s" : ""));
        byPillar[o.pillar].push({ objId: o.id, title: o.title, pillar: o.pillar, reason: reasons.join(", ") });
      }
    }
    var quizQuestions = Data.quizForMode(mode);
    var quizMissed = quizQuestions
      .filter(function (q) {
        return Store.quiz.answers[q.id] !== undefined && Store.quiz.answers[q.id] !== q.answer;
      })
      .map(function (q) { return { prompt: q.prompt, pillar: "P3" }; });
    return { byPillar: byPillar, quizMissed: quizMissed };
  }

  UI.renderCompletionModal = function (mode) {
    var objs = Data.OBJECTIVES.filter(function (o) { return o.mode === mode; });

    var firstAttemptCorrect = objs.filter(function (o) {
      var p = Store.progress[o.id];
      return p && p.attempts === 1 && p.status === "correct";
    }).length;
    var totalHints = objs.reduce(function (sum, o) {
      return sum + ((Store.progress[o.id] && Store.progress[o.id].hintsUsed) || 0);
    }, 0);
    var score = Math.round((firstAttemptCorrect / objs.length) * 100);
    var stars = computeStars(score, totalHints);
    var pillars = ["P1", "P2", "P3", "P4"];

    var focus = computeFocusAreas(mode);
    var totalFocus = pillars.reduce(function (s, p) { return s + focus.byPillar[p].length; }, 0) + focus.quizMissed.length;

    var starsHtml = [1, 2, 3, 4, 5]
      .map(function (i) {
        return '<span class="cm-star' + (i <= stars ? " on" : "") + '">' + icon("star", 24) + "</span>";
      })
      .join("");

    var focusHtml;
    if (totalFocus === 0) {
      focusHtml = '<p class="cm-focus-empty">No focus areas flagged — you completed every objective on the first attempt with no hints. Review the debrief notes to deepen mastery.</p>';
    } else {
      var focusByPillar = pillars
        .map(function (pl) {
          var items = focus.byPillar[pl];
          if (items.length === 0) return "";
          var lis = items
            .map(function (f) {
              return '<li class="cm-focus-li"><span class="cm-focus-title">' + escapeHtml(f.title) +
                '</span><span class="cm-focus-reason"> — ' + escapeHtml(f.reason) + "</span></li>";
            })
            .join("");
          return (
            '<div class="cm-focus-pillar"><p class="cm-focus-pillar-h">' + pl + " · " +
            escapeHtml(Data.PILLAR_LABEL[pl]) + "</p><ul>" + lis + "</ul></div>"
          );
        })
        .join("");

      var quizMissedHtml = "";
      if (focus.quizMissed.length > 0) {
        var qLis = focus.quizMissed
          .map(function (q) { return '<li class="cm-focus-li">' + escapeHtml(q.prompt) + "</li>"; })
          .join("");
        quizMissedHtml =
          '<div class="cm-focus-pillar"><p class="cm-focus-pillar-h">Quiz — missed questions</p><ul>' +
          qLis + "</ul></div>";
      }

      focusHtml =
        '<p class="cm-focus-blurb">' + totalFocus + " item" + (totalFocus > 1 ? "s" : "") +
        " below need attention. These are derived from your actual attempts, hints, and quiz answers — not generic advice.</p>" +
        focusByPillar + quizMissedHtml;
    }

    var recapHtml = pillars
      .map(function (pl) {
        var list = objs.filter(function (o) { return o.pillar === pl; });
        if (list.length === 0) return "";
        var lis = list
          .map(function (o) {
            var ok = Store.progress[o.id] && Store.progress[o.id].status === "correct";
            return (
              '<li class="cm-recap-li">' +
              (ok
                ? '<span class="cm-recap-icon success">' + icon("check_circle", 14) + "</span>"
                : '<span class="cm-recap-icon danger">' + icon("x_circle", 14) + "</span>") +
              "<span>" + escapeHtml(o.title) + "</span></li>"
            );
          })
          .join("");
        return (
          '<section class="cm-recap"><h4 class="cm-recap-h">' + pl + " · " +
          escapeHtml(Data.PILLAR_LABEL[pl]) + "</h4><ul>" + lis + "</ul></section>"
        );
      })
      .join("");

    var linksHtml = Data.DEBRIEF.links
      .map(function (l) {
        return (
          '<a class="debrief-link" href="' + escapeHtml(l.url) + '" target="_blank" rel="noopener noreferrer">' +
          escapeHtml(l.label) + " " + icon("link", 12) + "</a>"
        );
      })
      .join("");

    return (
      '<div class="modal-overlay" data-action="close-completion"></div>' +
      '<div class="modal lab-scroll completion-modal" role="dialog" aria-modal="true" aria-labelledby="cm-title">' +
        '<button type="button" class="modal-close" data-action="close-completion" aria-label="Close results">' + icon("x", 20) + "</button>" +
        '<div class="modal-head">' +
          '<h2 class="modal-title" id="cm-title"><span class="warning">' + icon("trophy", 20) +
          "</span> Council Debrief — Lesson 2.4 complete</h2>" +
          '<p class="modal-sub">Vulnerability Council — SY0-801 Lesson 2.4 (' + mode + " mode)</p>" +
        "</div>" +
        '<div class="modal-body cm-body">' +
          '<div class="cm-score-box">' +
            '<div class="cm-score-val mono">' + score + "%</div>" +
            '<div class="cm-score-sub">First-attempt correct: ' + firstAttemptCorrect + "/" + objs.length +
            " · hints used: " + totalHints + "</div>" +
            '<div class="cm-stars" aria-label="' + stars + ' of 5 stars">' + starsHtml + "</div>" +
          "</div>" +
          '<section class="cm-focus">' +
            '<h4 class="cm-focus-h"><span class="warning">' + icon("alert_triangle", 14) +
            "</span> Focus areas — where to study more</h4>" +
            focusHtml +
          "</section>" +
          '<div class="cm-recaps">' + recapHtml + "</div>" +
          '<section class="cm-next"><h4 class="cm-next-h">What to learn next</h4>' +
          '<div class="debrief-links">' + linksHtml + "</div></section>" +
        "</div>" +
        '<div class="modal-footer">' +
          '<button type="button" class="btn-outline" data-action="close-completion">Back to lab</button>' +
          '<button type="button" class="btn-restart danger" data-action="confirm-restart">' +
          icon("rotate_ccw", 16) + " Restart</button>" +
        "</div>" +
      "</div>"
    );
  };

  // --------------------------------------------------------------------------
  // Confirm dialog (replaces shadcn AlertDialog)
  // --------------------------------------------------------------------------

  UI.renderConfirmDialog = function (opts) {
    return (
      '<div class="modal-overlay" data-action="' + opts.cancelAction + '"></div>' +
      '<div class="modal confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="' + opts.titleId + '">' +
        '<button type="button" class="modal-close" data-action="' + opts.cancelAction + '" aria-label="Close">' + icon("x", 20) + "</button>" +
        '<h2 class="confirm-title" id="' + opts.titleId + '">' + escapeHtml(opts.title) + "</h2>" +
        '<p class="confirm-desc">' + escapeHtml(opts.description) + "</p>" +
        '<div class="modal-footer">' +
          '<button type="button" class="btn-outline" data-action="' + opts.cancelAction + '">Cancel</button>' +
          '<button type="button" class="btn-restart ' + (opts.confirmClass || "danger") +
          '" data-action="' + opts.confirmAction + '">' + escapeHtml(opts.confirmLabel) + "</button>" +
        "</div>" +
      "</div>"
    );
  };

  // Exposed for quiz.js (which builds on the same icon/UI helpers).
  UI.PILLAR_COLORS = PILLAR_COLORS;

  // ==========================================================================
  // Objective interactions — one render function per ObjectiveKind.
  //
  // Source: src/components/lab/ObjectiveInteraction.tsx (919 lines).
  //
  // Behavior notes:
  //   * R2 (answer lock): all interactions are wrapped in a <fieldset disabled>
  //     when locked=true. The native disabled behavior prevents further input
  //     until Reset is pressed.
  //   * R6 (seeded shuffle): fix-availability-match items + definitions and
  //     type-surface-sort items are shuffled via seededShuffle(obj.id + suffix)
  //     — stable per objective, not identity order.
  //   * Form inputs use data-action="patch-answer" or "patch-answer-silent".
  //     Textareas/text inputs use the silent variant to avoid focus loss on
  //     re-render; selects/buttons/radios/checkboxes use the notify variant
  //     so dependent UI (e.g., live CVSS score, classification badges) updates.
  // ==========================================================================

  // Shared atom: a labeled <select>.
  function oiSelect(label, value, options, action, dataId, extra) {
    var optsHtml = '<option value="">— select —</option>';
    for (var i = 0; i < options.length; i++) {
      var o = options[i];
      var val, lbl;
      if (Array.isArray(o)) { val = o[0]; lbl = o[1]; }
      else { val = o.value; lbl = o.label; }
      optsHtml += '<option value="' + escapeHtml(val) + '"' + (value === val ? " selected" : "") + ">" + escapeHtml(lbl) + "</option>";
    }
    var extraStr = extra || "";
    return (
      '<label class="oi-select">' +
        (label ? '<span class="oi-select-label">' + escapeHtml(label) + "</span>" : "") +
        '<select data-action="' + action + '"' + (dataId ? ' data-id="' + dataId + '"' : "") + " " + extraStr + ">" +
        optsHtml + "</select>" +
      "</label>"
    );
  }

  // Shared atom: a labeled <textarea>.
  function oiTextArea(label, value, action, dataId, rows, placeholder) {
    return (
      '<label class="oi-textarea">' +
        '<span class="oi-select-label">' + escapeHtml(label) + "</span>" +
        '<textarea rows="' + (rows || 2) + '" data-action="' + action + '"' +
        (dataId ? ' data-id="' + dataId + '"' : "") +
        (placeholder ? ' placeholder="' + escapeHtml(placeholder) + '"' : "") + ">" +
        escapeHtml(value || "") + "</textarea>" +
      "</label>"
    );
  }

  // Shared atom: "Open evidence card" button.
  function openCardButton(id) {
    var e = Data.EVIDENCE_BY_ID[id];
    if (!e) return "";
    return (
      '<button type="button" class="oi-open-btn" data-action="set-evidence" data-id="' + id + '">' +
      icon("eye", 12) + " Open " + escapeHtml(e.code) + "</button>"
    );
  }

  // Helper: read an objective's current answer object.
  function getAns(objId) {
    var v = Store.state.answers[objId];
    return v && typeof v === "object" ? v : {};
  }

  UI.renderObjectiveInteraction = function (obj, locked) {
    var a = getAns(obj.id);
    var inner = renderInteractionInner(obj, a);
    // R2: lock controls via a disabled fieldset.
    return (
      '<fieldset class="oi-fieldset"' + (locked ? " disabled" : "") +
      ' aria-label="' + (locked ? "Locked — press Reset to retry" : "") + '">' +
      inner +
      "</fieldset>"
    );
  };

  function renderInteractionInner(obj, a) {
    switch (obj.kind) {
      // ---------- MEDIUM ----------
      case "fix-availability-match": {
        // R6: shuffle both the items and the definitions (separate seeds).
        var items = seededShuffle(Data.FIX_AVAILABILITY_MATCH.items, obj.id + "-items");
        var defs = seededShuffle(Data.FIX_AVAILABILITY_MATCH.definitions, obj.id + "-defs");
        var matches = a.matches || {};
        var rows = items.map(function (it) {
          return (
            '<div class="oi-row-2col">' +
              '<div class="oi-label">' + escapeHtml(it.label) + "</div>" +
              oiSelect("", matches[it.value] || "", defs, "patch-answer", obj.id, 'data-patch="matches" data-key="' + escapeHtml(it.value) + '"') +
            "</div>"
          );
        }).join("");
        return '<div class="oi-stack">' + rows + "</div>";
      }

      case "type-surface-sort": {
        // R6: shuffle the items.
        var shuffledItems = seededShuffle(Data.TYPE_SURFACE_SORT.items, obj.id + "-sort");
        var buckets = a.buckets || {};
        var rows = shuffledItems.map(function (item) {
          var cur = buckets[item];
          var typeActive = cur === "type";
          var surfActive = cur === "surface";
          return (
            '<div class="oi-sort-row">' +
              '<span class="oi-sort-label">' + escapeHtml(item) + "</span>" +
              '<div class="oi-sort-btns">' +
                '<button type="button" class="oi-toggle' + (typeActive ? " active type" : "") +
                '" data-action="patch-answer" data-id="' + obj.id + '" data-patch="buckets" data-key="' + escapeHtml(item) + '" data-value="type" aria-pressed="' + typeActive + '">Vuln type</button>' +
                '<button type="button" class="oi-toggle' + (surfActive ? " active surface" : "") +
                '" data-action="patch-answer" data-id="' + obj.id + '" data-patch="buckets" data-key="' + escapeHtml(item) + '" data-value="surface" aria-pressed="' + surfActive + '">Attack surface</button>' +
              "</div>" +
            "</div>"
          );
        }).join("");
        return '<div class="oi-sort-grid">' + rows + "</div>";
      }

      case "classify-cards": {
        var cardIds = obj.id === "OBJ-M3" ? ["e1", "e11", "e12"] : ["e2", "e3", "e5", "e9"];
        var rows = cardIds.map(function (id) {
          var e = Data.EVIDENCE_BY_ID[id];
          var c = Store.state.classifications[id];
          var ok = c && c.category === e.category;
          var badgeCls = ok ? "ok" : c && c.category && c.category !== "none" ? "bad" : "none";
          var badgeText = c && c.category && c.category !== "none" ? c.category : "unclassified";
          return (
            '<div class="oi-classify-row">' +
              '<div class="oi-classify-left">' +
                '<button type="button" class="oi-open-btn" data-action="set-evidence" data-id="' + id + '">' + icon("eye", 12) + " " + escapeHtml(e.code) + "</button>" +
                '<span class="oi-classify-title">' + escapeHtml(e.title) + "</span>" +
              "</div>" +
              '<span class="oi-classify-badge ' + badgeCls + '">' + escapeHtml(badgeText) + "</span>" +
            "</div>"
          );
        }).join("");
        return (
          '<div class="oi-stack">' + rows +
          '<p class="oi-hint-text">Classify each card via the chips in the Case File (center).</p></div>'
        );
      }

      case "crypto-multiselect": {
        var selected = a.selected || [];
        var boxes = Data.CRYPTO_OPTIONS.map(function (opt) {
          var on = selected.indexOf(opt) !== -1;
          return (
            '<label class="oi-check">' +
              '<input type="checkbox"' + (on ? " checked" : "") +
              ' data-action="toggle-crypto" data-id="' + obj.id + '" data-value="' + escapeHtml(opt) + '" />' +
              escapeHtml(opt) + "</label>"
          );
        }).join("");
        return (
          '<div class="oi-stack">' + openCardButton("e6") +
          '<p class="oi-hint-text">Select all that apply (exactly three are correct):</p>' +
          '<div class="oi-check-grid">' + boxes + "</div></div>"
        );
      }

      case "fix-match": {
        var picks = a.picks || {};
        var rows = Data.FIX_MATCH.cards.map(function (cid) {
          var e = Data.EVIDENCE_BY_ID[cid];
          return (
            '<div class="oi-stack">' +
              '<div class="oi-classify-left">' +
                '<button type="button" class="oi-open-btn" data-action="set-evidence" data-id="' + cid + '">' + icon("eye", 12) + " " + escapeHtml(e.code) + "</button>" +
                '<span class="oi-classify-title">' + escapeHtml(e.title) + "</span>" +
              "</div>" +
              oiSelect("", picks[cid] || "", Data.FIX_MATCH.options, "patch-answer", obj.id, 'data-patch="picks" data-key="' + escapeHtml(cid) + '"') +
            "</div>"
          );
        }).join("");
        return '<div class="oi-stack">' + rows + "</div>";
      }

      case "cwe-select": {
        return (
          '<div class="oi-stack">' +
            oiSelect("CWE class", String(a.cwe || ""), Data.CWE_OPTIONS, "patch-answer", obj.id, 'data-patch="cwe"') +
            '<p class="oi-hint-text">Tip: the canonical SQL-injection CWE. Type the ID if you prefer.</p>' +
          "</div>"
        );
      }

      case "cvss-band": {
        var r = CVSS.computeEnvironmental(Store.state.cvss);
        var band = CVSS.bandForScore(r.baseScore);
        return (
          '<div class="oi-stack">' +
            '<div class="oi-inline-row">' + openCardButton("e2") +
              '<span class="oi-live-score">Live: <span class="mono">' + r.baseScore.toFixed(1) +
              '</span> · <span class="accent">' + escapeHtml(band) + "</span></span>" +
            "</div>" +
            '<p class="oi-hint-text">Open E2 to load its vector into the calculator (center), then verify the score reads 9.8 / Critical.</p>' +
          "</div>"
        );
      }

      case "radio-why": {
        var radios = ["CVE-A", "CVE-B"].map(function (c) {
          var on = a.choice === c;
          return (
            '<label class="oi-check">' +
              '<input type="radio" name="m9-choice-' + obj.id + '"' + (on ? " checked" : "") +
              ' data-action="patch-answer" data-id="' + obj.id + '" data-patch="choice" data-value="' + c + '" />' +
              escapeHtml(c) + "</label>"
          );
        }).join("");
        return (
          '<div class="oi-stack">' +
            '<div class="oi-radio-col">' + radios + "</div>" +
            oiTextArea("Why? (mention likelihood / KEV / EPSS / exploited)", String(a.why || ""), "patch-answer-silent", obj.id, 2, 'data-patch="why"') +
          "</div>"
        );
      }

      case "sequence-bucket": {
        var seq = a.sequence || [];
        var steps = ["Revoke/rotate the secret", "Remove from history", "Audit access logs", "Monitor for misuse"];
        var stepOptions = steps.map(function (s) { return { value: s, label: s }; });
        var seqSelects = steps.map(function (_, i) {
          return oiSelect("Step " + (i + 1), seq[i] || "", stepOptions, "patch-answer", obj.id, 'data-patch="sequence" data-index="' + i + '"');
        }).join("");
        return (
          '<div class="oi-stack">' + openCardButton("e5") + openCardButton("e4") +
            '<div><p class="oi-section-label">E5 — sequence the public-repo secret mitigation</p>' +
            '<div class="oi-stack">' + seqSelects + "</div></div>" +
            '<div class="oi-row-2col">' +
              oiSelect("E4 — read (leak) control", String(a.readControl || ""), Data.MITIGATION_CONTROLS.read, "patch-answer", obj.id, 'data-patch="readControl"') +
              oiSelect("E4 — write (tampering) control", String(a.writeControl || ""), Data.MITIGATION_CONTROLS.write, "patch-answer", obj.id, 'data-patch="writeControl"') +
            "</div>" +
          "</div>"
        );
      }

      case "control-match": {
        var picks11 = a.picks || {};
        var rows = Data.CONTROL_MATCH.scenarios.map(function (s) {
          return (
            '<div class="oi-stack">' +
              '<span class="oi-label">' + escapeHtml(s.label) + "</span>" +
              oiSelect("", picks11[s.value] || "", Data.CONTROL_MATCH.controls, "patch-answer", obj.id, 'data-patch="picks" data-key="' + escapeHtml(s.value) + '"') +
            "</div>"
          );
        }).join("");
        return '<div class="oi-stack">' + rows + "</div>";
      }

      case "queue-rank": {
        var top = Store.state.queueOrder.slice(0, 3);
        var items = top.length === 0
          ? '<p class="oi-empty">Queue is empty.</p>'
          : top.map(function (id, i) {
              var e = Data.EVIDENCE_BY_ID[id];
              if (!e) return "";
              return (
                '<div class="oi-queue-row">' +
                  '<span class="oi-queue-rank">' + (i + 1) + "</span>" +
                  '<span class="oi-queue-code mono">' + escapeHtml(e.code) + "</span>" +
                  '<span class="oi-queue-title">' + escapeHtml(e.title) + "</span>" +
                "</div>"
              );
            }).join("");
        return (
          '<div class="oi-stack">' +
            '<p class="oi-hint-text">Rank the top 3 in the Council Queue (right rail / Queue tab on mobile). Required set: E9, E2, E5 — with E9 in slot 1 or 2.</p>' +
            '<div class="oi-stack">' + items + "</div>" +
          "</div>"
        );
      }

      // ---------- HARD ----------
      case "full-triage": {
        var real = Object.keys(Data.EVIDENCE_BY_ID)
          .map(function (k) { return Data.EVIDENCE_BY_ID[k]; })
          .filter(function (e) { return !e.redHerring; });
        var done = real.filter(function (e) {
          var c = Store.state.classifications[e.id];
          return c && c.category === e.category && c.surface === e.surface;
        }).length;
        var herringsDone = Store.state.redHerringFlags["rh1"] && Store.state.redHerringFlags["rh2"];
        var sel = Store.state.councilSelection;
        var selOk = sel.length === 4 && ["e9", "e2", "e5", "e10"].every(function (x) { return sel.indexOf(x) !== -1; });
        var selText = sel.length ? sel.map(function (x) { return Data.EVIDENCE_BY_ID[x] ? Data.EVIDENCE_BY_ID[x].code : ""; }).join(", ") : "none";
        return (
          '<div class="oi-stack oi-tight">' +
            '<div class="oi-stat-box">Classifications correct: <span class="mono success">' + done + "</span> / " + real.length + "</div>" +
            '<div class="oi-stat-box">Red herrings flagged: <span class="' + (herringsDone ? "success" : "danger") + '">' +
              (herringsDone ? "RH1 + RH2" : "not yet") + "</span></div>" +
            '<div class="oi-stat-box">Council selection (4): <span class="' + (selOk ? "success" : "danger") + '">' + escapeHtml(selText) + "</span></div>" +
            '<p class="oi-hint-text">Classify every card in the Case File (type + surface), flag RH1 & RH2, and tick “Send to Council” for E9, E2, E5, E10.</p>' +
          "</div>"
        );
      }

      case "cvss-env-why": {
        var merged2 = Object.assign({}, Store.state.cvssEnv, Store.state.cvss);
        var r2 = CVSS.computeEnvironmental(merged2);
        var band2 = CVSS.bandForScore(r2.baseScore);
        return (
          '<div class="oi-stack">' +
            '<div class="oi-inline-row">' +
              '<button type="button" class="oi-load-btn" data-action="load-cve-vector">Load CVE-2026-44217 vector</button>' +
              '<button type="button" class="oi-enable-env-btn" data-action="enable-env">Enable Environmental</button>' +
              '<span class="oi-live-score">Base <span class="mono">' + r2.baseScore.toFixed(1) +
              '</span> · Env <span class="mono">' + r2.environmentalScore.toFixed(1) +
              '</span> · <span class="accent">' + escapeHtml(band2) + "</span></span>" +
            "</div>" +
            '<p class="oi-hint-text">Load the vector, enable Environmental metrics, set CR:H / IR:H / AR:H in the calculator (center), then explain the v3.1 vs v4.0 caveat.</p>' +
            oiTextArea("Why? Must mention v4.0, 'not interchangeable', and 'Environmental'.", String(a.why || ""), "patch-answer-silent", obj.id, 3, 'data-patch="why"') +
          "</div>"
        );
      }

      case "llm-plan": {
        var tools = a.tools || [];
        var seq3 = a.sequence || [];
        var seqOptions = Data.LLM_SEQUENCE_STEPS.map(function (s) { return { value: s, label: s }; });
        var toolBoxes = ["read_customer_db", "send_email", "run_sql_query"].map(function (t) {
          var on = tools.indexOf(t) !== -1;
          return (
            '<label class="oi-check oi-tool-check">' +
              '<input type="checkbox"' + (on ? " checked" : "") +
              ' data-action="toggle-tool" data-id="' + obj.id + '" data-value="' + escapeHtml(t) + '" />' +
              '<span class="mono">' + escapeHtml(t) + "</span></label>"
          );
        }).join("");
        var seqSelects = Data.LLM_SEQUENCE_STEPS.map(function (_, i) {
          return oiSelect("Step " + (i + 1), seq3[i] || "", seqOptions, "patch-answer", obj.id, 'data-patch="sequence" data-index="' + i + '"');
        }).join("");
        return (
          '<div class="oi-stack">' + openCardButton("e10") +
            oiSelect("Attack surface", String(a.surface || ""), Data.ATTACK_SURFACES, "patch-answer", obj.id, 'data-patch="surface"') +
            oiTextArea("Data exposure — mention BOTH PII and PHI", String(a.exposure || ""), "patch-answer-silent", obj.id, 2, 'data-patch="exposure"') +
            '<div><p class="oi-section-label">Connected tools (select all 3)</p>' +
            '<div class="oi-tool-grid">' + toolBoxes + "</div></div>" +
            '<div><p class="oi-section-label">Mitigation sequence (5 steps in order)</p>' +
            '<div class="oi-stack">' + seqSelects + "</div></div>" +
          "</div>"
        );
      }

      case "signed-update": {
        return (
          '<div class="oi-stack">' +
            oiTextArea("Why is signature necessary but not sufficient? Mention origin AND 'not safe'.", String(a.why || ""), "patch-answer-silent", obj.id, 3, 'data-patch="why"') +
            oiSelect("OT medical device — compensating control", String(a.otControl || ""), Data.SIGNED_UPDATE_CONTROLS.ot, "patch-answer", obj.id, 'data-patch="otControl"') +
            oiSelect("Ordinary Linux server — compensating control", String(a.serverControl || ""), Data.SIGNED_UPDATE_CONTROLS.server, "patch-answer", obj.id, 'data-patch="serverControl"') +
          "</div>"
        );
      }

      case "idp-sequence": {
        var seq5 = a.sequence || [];
        var just5 = a.justifications || {};
        var seqOptions5 = Data.IDP_SEQUENCE_STEPS.map(function (s) { return { value: s, label: s }; });
        var rows = Data.IDP_SEQUENCE_STEPS.map(function (_, i) {
          return (
            '<div class="oi-stack">' +
              oiSelect("Step " + (i + 1), seq5[i] || "", seqOptions5, "patch-answer", obj.id, 'data-patch="sequence" data-index="' + i + '"') +
              oiTextArea("Justification for step " + (i + 1) + " (≥ 20 chars)", just5["s" + i] || "", "patch-answer-silent", obj.id, 1, 'data-patch="justifications" data-key="s' + i + '"') +
            "</div>"
          );
        }).join("");
        return '<div class="oi-stack">' + openCardButton("e9") + rows + "</div>";
      }

      case "bucket-review": {
        return (
          '<div class="oi-stack">' + openCardButton("e4") +
            '<div class="oi-row-2col">' +
              oiTextArea("Read exposure (download / leak)", String(a.readExposure || ""), "patch-answer-silent", obj.id, 2, 'data-patch="readExposure"') +
              oiTextArea("Write exposure (upload / overwrite / tamper)", String(a.writeExposure || ""), "patch-answer-silent", obj.id, 2, 'data-patch="writeExposure"') +
            "</div>" +
            oiSelect("Read control", String(a.readControl || ""), Data.MITIGATION_CONTROLS.read, "patch-answer", obj.id, 'data-patch="readControl"') +
            oiSelect("Write control", String(a.writeControl || ""), Data.MITIGATION_CONTROLS.write, "patch-answer", obj.id, 'data-patch="writeControl"') +
            oiTextArea("Why is E4 worse than a bucket with only public GetObject? (tampering / integrity)", String(a.whyWorse || ""), "patch-answer-silent", obj.id, 2, 'data-patch="whyWorse"') +
          "</div>"
        );
      }

      case "lifecycle-table": {
        var picks7 = a.picks || {};
        var rows = Data.LIFECYCLE_STAGES.map(function (st) {
          var cur = picks7[st.id] || {};
          return (
            '<div class="oi-stage">' +
              '<p class="oi-stage-label">' + escapeHtml(st.label) + "</p>" +
              '<div class="oi-row-2col">' +
                oiSelect("Vulnerability class", cur.cls || "", Data.LIFECYCLE_CLASS_OPTIONS, "patch-answer", obj.id, 'data-patch="picks" data-key="' + escapeHtml(st.id) + '" data-subkey="cls"') +
                oiSelect("Mitigation", cur.mit || "", st.mitigationOptions, "patch-answer", obj.id, 'data-patch="picks" data-key="' + escapeHtml(st.id) + '" data-subkey="mit"') +
              "</div>" +
            "</div>"
          );
        }).join("");
        return '<div class="oi-stack">' + rows + "</div>";
      }

      case "queue-rank5": {
        var top5 = Store.state.queueOrder.slice(0, 5);
        var just8 = a.justifications || {};
        var rows;
        if (top5.length === 0) {
          rows = '<p class="oi-empty">Queue is empty.</p>';
        } else {
          rows = top5.map(function (id, i) {
            var e = Data.EVIDENCE_BY_ID[id];
            if (!e) return "";
            return (
              '<div class="oi-queue5-row">' +
                '<div class="oi-queue5-head">' +
                  '<span class="oi-queue-rank">' + (i + 1) + "</span>" +
                  '<span class="oi-queue-code mono">' + escapeHtml(e.code) + "</span>" +
                  '<span class="oi-queue-title">' + escapeHtml(e.title) + "</span>" +
                "</div>" +
                oiTextArea("Justification (mention a priority signal)", just8[id] || "", "patch-answer-silent", obj.id, 1, 'data-patch="justifications" data-key="' + escapeHtml(id) + '"') +
              "</div>"
            );
          }).join("");
        }
        return (
          '<div class="oi-stack">' +
            '<p class="oi-hint-text">Rank the top 5 in the Council Queue (E9, E2, E5, E4, E10). Justify each slot — mention CVSS / EPSS / KEV / asset / exposure.</p>' +
            rows +
          "</div>"
        );
      }

      case "peer-review": {
        var errors = a.errors || {};
        var rewrites = a.rewrites || {};
        var rows = Data.PEER_REVIEW_ITEMS.map(function (item) {
          var cls = item.required ? " required" : "";
          var errLbl = item.required ? "Error identified (required)" : "Error identified (bonus)";
          return (
            '<div class="oi-peer' + cls + '">' +
              '<p class="oi-peer-text"><span class="mono muted">' + escapeHtml(item.id.toUpperCase()) + "</span> " + escapeHtml(item.text) + "</p>" +
              '<div class="oi-row-2col">' +
                oiTextArea(errLbl, errors[item.id] || "", "patch-answer-silent", obj.id, 2, 'data-patch="errors" data-key="' + escapeHtml(item.id) + '"') +
                oiTextArea("Correct rewrite", rewrites[item.id] || "", "patch-answer-silent", obj.id, 2, 'data-patch="rewrites" data-key="' + escapeHtml(item.id) + '"') +
              "</div>" +
            "</div>"
          );
        }).join("");
        return (
          '<div class="oi-stack">' + rows +
          '<p class="oi-hint-text">Errors 1 and 2 are required (3 and 4 are bonus).</p></div>'
        );
      }

      default:
        return (
          '<p class="oi-hint-text">This objective uses the Case File and Council Queue above — make your selections, then press CHECK.</p>'
        );
    }
  }

  // Expose the interaction renderer for app.js / external callers.
  UI.renderInteractionInner = renderInteractionInner;
})(typeof window !== "undefined" ? window : globalThis);
