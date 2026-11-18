/* ============================================================
 * CONTROLS BRIDGE — UI Rendering
 * All rendering functions as template-string generators.
 * SVG icons are inline (no icon fonts/CDNs).
 * ============================================================ */

var Lab = window.Lab || {};

Lab.ui = (function() {
  "use strict";

  var data = Lab.data;
  var D = Lab.data;

  // ---- SVG icons (Lucide-style, inline) ----
  var ICONS = {
    shield: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1 7-2.5C14.5 4 17 5 19 5a1 1 0 0 1 1 1z"/></svg>',
    network: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/></svg>',
    server: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>',
    code: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    database: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>',
    shieldCheck: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1 7-2.5C14.5 4 17 5 19 5a1 1 0 0 1 1 1z"/><polyline points="9 12 11 14 15 10"/></svg>',
    fileText: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>',
    checkCircle: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    xCircle: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>',
    chevronUp: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>',
    chevronDown: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
    chevronRight: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
    chevronLeft: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
    lightbulb: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>',
    alertCircle: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>',
    circleDot: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1"/></svg>',
    listChecks: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/></svg>',
    eye: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>',
    boxes: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 1.42Z"/><path d="m7 16 5 3 5-3"/><path d="M21.03 12.92A2 2 0 0 1 22 14.63v3.24a2 2 0 0 1-.97 1.71l-3 1.8a2 2 0 0 1-2.06 0L12 19"/></svg>',
    clipboardCheck: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>',
    zap: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    bookOpen: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>',
    building: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"/></svg>',
    trophy: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
    star: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    lock: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    bookMarked: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/><path d="M9 3v5l3-2 3 2V3"/></svg>',
    bot: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2M20 14h2M15 13v2M9 13v2"/></svg>',
    send: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
    search: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
    rotateCcw: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',
    logout: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>',
    arrowRight: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
    weight: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><path d="M6.5 8a2 2 0 0 0-1.905 1.46L2.1 18.5A2 2 0 0 0 4 21h16a2 2 0 0 0 1.925-2.54L19.4 9.5A2 2 0 0 0 17.5 8Z"/></svg>',
    info: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
    helpCircle: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>',
    close: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    sparkle: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z"/></svg>',
    loader: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="6"/><line x1="12" x2="12" y1="18" y2="22"/><line x1="4.93" x2="7.76" y1="4.93" y2="7.76"/><line x1="16.24" x2="19.07" y1="16.24" y2="19.07"/><line x1="2" x2="6" y1="12" y2="12"/><line x1="18" x2="22" y1="12" y2="12"/><line x1="4.93" x2="7.76" y1="19.07" y2="16.24"/><line x1="16.24" x2="19.07" y1="7.76" y2="4.93"/></svg>',
  };

  // ---- Escape HTML ----
  function esc(s) {
    if (s == null) return "";
    return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
  }

  // ---- Seeded shuffle (R6) ----
  function seededShuffle(arr, seed) {
    var result = arr.slice();
    var hash = 0;
    for (var i = 0; i < seed.length; i++) { hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0; }
    var rng = Math.abs(hash) || 1;
    function next() { rng = (rng * 1103515245 + 12345) & 0x7fffffff; return rng / 0x7fffffff; }
    for (var j = result.length - 1; j > 0; j--) {
      var k = Math.floor(next() * (j + 1));
      var tmp = result[j]; result[j] = result[k]; result[k] = tmp;
    }
    return result;
  }

  function getSequencePool(objectiveId, steps) {
    var pool = steps.map(function(id) { return { id: id, label: D.SEQUENCE_LABELS[id] || id }; });
    if (objectiveId === "OBJ-H1") {
      pool.push({ id: "red-herring-photo", label: D.SEQUENCE_LABELS["red-herring-photo"] });
      pool.push({ id: "red-herring-vending", label: D.SEQUENCE_LABELS["red-herring-vending"] });
    } else if (objectiveId === "OBJ-H6") {
      pool.push({ id: "IDS-offline-decoy", label: D.SEQUENCE_LABELS["IDS-offline-decoy"] });
    }
    return seededShuffle(pool, objectiveId);
  }

  // ============================================================
  // MODE SELECTION SCREEN
  // ============================================================
  function renderModeSelection() {
    return '' +
      '<div class="screen bp-grid-fine">' +
        '<div class="sticky-header" style="border-bottom:1px solid oklch(0.32 0.012 250 / 40%);background:oklch(0.215 0.016 250 / 40%);backdrop-filter:blur(4px)">' +
          '<div class="max-w-6xl px-4" style="padding-top:1.25rem;padding-bottom:1.25rem;display:flex;align-items:center;gap:0.75rem">' +
            '<div style="width:2.5rem;height:2.5rem;border-radius:6px;background:oklch(0.78 0.155 65 / 15%);border:1px solid oklch(0.78 0.155 65 / 40%);display:flex;align-items:center;justify-content:center">' +
              ICONS.shieldCheck.replace('currentColor','var(--primary)') +
            '</div>' +
            '<div style="flex:1;min-width:0">' +
              '<h1 class="text-lg font-semibold tracking-tight">Controls Bridge</h1>' +
              '<p class="text-xs text-muted mono">CompTIA Security+ SY0-801 · Lesson 1.1</p>' +
            '</div>' +
            '<span class="badge badge-outline">Domain 1 · 16%</span>' +
          '</div>' +
        '</div>' +
        '<main class="max-w-6xl px-4 py-10">' +
          '<div class="max-w-3xl">' +
            '<p class="text-xs mono uppercase tracking-widest" style="color:oklch(0.78 0.155 65 / 80%);margin-bottom:0.75rem">Mode selection</p>' +
            '<h2 class="text-3xl font-bold tracking-tight mb-4">Compare and contrast various types of security controls.</h2>' +
            '<p class="text-muted text-sm" style="margin-bottom:0.5rem;line-height:1.6">' + esc(D.SCENARIO.why) + '</p>' +
            '<p class="text-sm" style="color:oklch(0.70 0.012 250 / 80%);font-style:italic">Scenario host: <span style="font-style:normal;font-weight:500;color:var(--fg)">' + esc(D.SCENARIO.org) + '</span> — ' + esc(D.SCENARIO.orgBlurb) + '</p>' +
          '</div>' +
          '<div class="mt-8 md:grid-cols-2" style="display:grid;gap:1.25rem;grid-template-columns:1fr">' +
            // Medium card
            '<button class="mode-card" data-mode="medium" style="text-align:left;border-radius:var(--radius);border:2px solid var(--border);background:var(--card);padding:1.5rem;cursor:pointer;transition:border-color 0.15s" ' +
              'onmouseover="this.style.borderColor=\'oklch(0.78 0.155 65 / 60%)\'" onmouseout="this.style.borderColor=\'var(--border)\'">' +
              '<div style="display:flex;justify-content:space-between;margin-bottom:1rem">' +
                '<div style="width:3rem;height:3rem;border-radius:8px;background:oklch(0.78 0.155 65 / 15%);border:1px solid oklch(0.78 0.155 65 / 30%);display:flex;align-items:center;justify-content:center">' +
                  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>' +
                '</div>' +
                '<span class="badge badge-primary">MEDIUM</span>' +
              '</div>' +
              '<h3 class="text-xl font-semibold mb-2">Learn the framework</h3>' +
              '<p class="text-sm text-muted" style="line-height:1.5;margin-bottom:1rem">12 guided objectives walk you through every category, every function, and the full defense-in-depth model. Tiered hints when you need them; a built-in offline tutor on call. Tolerant validation — wrong answers teach, they don\'t punish.</p>' +
              '<ul class="text-xs text-muted" style="list-style:none;margin-bottom:1.25rem">' +
                '<li style="margin-bottom:0.375rem">• 4 categories × 7 functions, drilled until automatic</li>' +
                '<li style="margin-bottom:0.375rem">• Interactive Controls Bridge with stress tests</li>' +
                '<li style="margin-bottom:0.375rem">• Hints (3 levels) + offline tutor — never stuck</li>' +
                '<li style="margin-bottom:0.375rem">• 6-question quiz with explanations</li>' +
                '<li>• Best for: first encounter with Lesson 1.1</li>' +
              '</ul>' +
              '<div style="display:flex;align-items:center;gap:0.5rem;color:var(--primary);font-size:0.75rem;font-weight:500">Start Medium ' + ICONS.arrowRight + '</div>' +
            '</button>' +
            // Hard card
            '<button class="mode-card" data-mode="hard" style="text-align:left;border-radius:var(--radius);border:2px solid var(--border);background:var(--card);padding:1.5rem;cursor:pointer;transition:border-color 0.15s" ' +
              'onmouseover="this.style.borderColor=\'oklch(0.65 0.21 25 / 60%)\'" onmouseout="this.style.borderColor=\'var(--border)\'">' +
              '<div style="display:flex;justify-content:space-between;margin-bottom:1rem">' +
                '<div style="width:3rem;height:3rem;border-radius:8px;background:oklch(0.65 0.21 25 / 15%);border:1px solid oklch(0.65 0.21 25 / 30%);display:flex;align-items:center;justify-content:center">' +
                  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--destructive)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.33 4 4 0 0 0 .556 6.887A4 4 0 0 0 12 18a4 4 0 0 0 7.967-1.658 4 4 0 0 0 .556-6.887A4 4 0 0 0 17.997 5.125 3 3 0 0 0 12 5Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/></svg>' +
                '</div>' +
                '<span class="badge badge-destructive">HARD</span>' +
              '</div>' +
              '<h3 class="text-xl font-semibold mb-2">Test and stretch</h3>' +
              '<p class="text-sm text-muted" style="line-height:1.5;margin-bottom:1rem">10 broad, multi-step challenges against a noisy case file. Red herrings, ambiguous categorizations, sequence-based checks, and a capstone redesign. No hints unless you pay for one nudge. Strict validation — near-misses are rejected with rationale.</p>' +
              '<ul class="text-xs text-muted" style="list-style:none;margin-bottom:1.25rem">' +
                '<li style="margin-bottom:0.375rem">• Raw evidence bag with 3+ red herrings</li>' +
                '<li style="margin-bottom:0.375rem">• Justify ambiguous categorizations in writing</li>' +
                '<li style="margin-bottom:0.375rem">• Sequence controls against an attack timeline</li>' +
                '<li style="margin-bottom:0.375rem">• Capstone: redesign a missing layer + residual risk</li>' +
                '<li>• Best for: exam-ready, want a real workout</li>' +
              '</ul>' +
              '<div style="display:flex;align-items:center;gap:0.5rem;color:var(--destructive);font-size:0.75rem;font-weight:500">Start Hard ' + ICONS.arrowRight + '</div>' +
            '</button>' +
          '</div>' +
          '<div class="mt-8" style="display:flex;gap:0.75rem;padding:1rem;border-radius:8px;border:1px solid oklch(0.32 0.012 250 / 50%);background:oklch(0.215 0.016 250 / 30%);max-width:48rem">' +
            ICONS.alertCircle.replace('currentColor','oklch(0.78 0.155 65 / 70%)') +
            '<p class="text-xs text-muted" style="line-height:1.5">Both modes cover the same ground — every category, every function, every layer. They differ in <span style="color:var(--fg)">how much guidance you get</span> and <span style="color:var(--fg)">how strictly answers are checked</span>. Switch modes anytime via the EXIT button. Progress saves automatically to your browser; RESET wipes it.</p>' +
          '</div>' +
          '<p class="mt-8 text-xs mono" style="color:oklch(0.70 0.012 250 / 60%)">Synthetic training data. Fictional organization. No real PII. No real infrastructure.</p>' +
        '</main>' +
      '</div>';
  }

  // ============================================================
  // LAB HEADER (sticky top bar)
  // ============================================================
  function renderHeader(s) {
    var objectives = D.OBJECTIVES.filter(function(o) { return o.mode === s.mode; });
    var completed = objectives.filter(function(o) {
      return s.objectives[o.id] && s.objectives[o.id].status === "correct";
    }).length;
    var total = objectives.length;
    var pct = total > 0 ? (completed / total) * 100 : 0;
    var quizQs = D.QUIZ.filter(function(q) { return q.mode === s.mode; });
    var quizCorrect = quizQs.filter(function(q) {
      var qs = s.quiz[q.id];
      return qs && qs.checked && qs.selectedIndex === q.correctIndex;
    }).length;

    return '' +
      '<header class="sticky-header">' +
        '<div class="max-w-7xl px-3" style="padding-top:0.625rem;padding-bottom:0.625rem;display:flex;align-items:center;gap:0.75rem">' +
          '<div style="width:2rem;height:2rem;border-radius:6px;background:oklch(0.78 0.155 65 / 15%);border:1px solid oklch(0.78 0.155 65 / 40%);display:flex;align-items:center;justify-content:center;flex-shrink:0">' +
            ICONS.shieldCheck.replace('currentColor','var(--primary)').replace('width="16"','width="16"') +
          '</div>' +
          '<div style="flex:1;min-width:0">' +
            '<h1 class="text-sm font-semibold tracking-tight truncate">Controls Bridge</h1>' +
            '<p class="text-xs mono text-muted truncate">SY0-801 · 1.1 · ' + (s.mode === "medium" ? "MEDIUM" : "HARD") + '</p>' +
          '</div>' +
          // Progress ring (desktop only)
          '<div class="progress-ring" style="display:none">@media(min-width:640px){.progress-ring{display:block!important}}</div>' +
          '<div style="display:none;flex-direction:column;font-size:0.625rem;color:var(--muted-fg);line-height:1.2" id="header-progress-text">' +
            '<span>' + completed + ' objectives</span>' +
            '<span>' + quizCorrect + '/' + quizQs.length + ' quiz</span>' +
          '</div>' +
          '<span class="badge badge-outline mono" id="header-progress-badge">' + completed + '/' + total + '</span>' +
          '<button class="btn btn-ghost btn-icon-sm" id="btn-reset" aria-label="Reset lab" title="Reset lab">' + ICONS.rotateCcw + '</button>' +
          '<button class="btn btn-ghost btn-icon-sm" id="btn-exit" aria-label="Exit to mode selection" title="Exit">' + ICONS.logout + '</button>' +
        '</div>' +
        '<div style="height:2px;background:var(--muted)"><div style="height:100%;background:var(--primary);width:' + pct + '%;transition:width 0.4s"></div></div>' +
      '</header>';
  }

  // ============================================================
  // SCENARIO BRIEFING (C1)
  // ============================================================
  function renderBriefing() {
    return '' +
      '<section id="briefing" class="card" aria-labelledby="briefing-heading">' +
        '<div class="section-heading">' + ICONS.building.replace('currentColor','var(--primary)') + 'C1 · Briefing</div>' +
        '<h3 class="text-2xl font-bold tracking-tight mb-3" id="briefing-heading">' + esc(D.SCENARIO.org) + '</h3>' +
        '<p class="text-sm text-muted italic mb-5" style="max-width:48rem">' + esc(D.SCENARIO.orgBlurb) + '</p>' +
        '<div style="display:grid;grid-template-columns:1fr auto;gap:1.25rem;align-items:start">' +
          '<div>' +
            '<div style="display:flex;gap:0.75rem;margin-bottom:1rem">' +
              ICONS.alertCircle.replace('currentColor','var(--destructive)') +
              '<div><p class="text-xs mono uppercase" style="color:oklch(0.65 0.21 25 / 80%);margin-bottom:0.25rem">The incident</p>' +
              '<p class="text-sm">' + esc(D.SCENARIO.incident) + '</p></div>' +
            '</div>' +
            '<div style="display:flex;gap:0.75rem">' +
              ICONS.bookOpen.replace('currentColor','var(--primary)') +
              '<div><p class="text-xs mono uppercase" style="color:oklch(0.78 0.155 65 / 80%);margin-bottom:0.25rem">Why this lab</p>' +
              '<p class="text-sm">' + esc(D.SCENARIO.why) + '</p></div>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex;flex-direction:column;gap:0.75rem;min-width:180px">' +
            '<div style="border-radius:8px;border:1px solid var(--border);background:oklch(0.18 0.014 250 / 40%);padding:0.75rem">' +
              '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.25rem">' +
                ICONS.weight.replace('currentColor','var(--primary)') +
                '<span class="text-xs mono uppercase" style="color:var(--muted-fg)">Exam weight</span>' +
              '</div>' +
              '<p class="text-sm font-medium">' + esc(D.SCENARIO.examWeight) + '</p>' +
            '</div>' +
            '<span class="badge badge-outline mono" style="justify-content:center">SY0-801 · Domain 1</span>' +
          '</div>' +
        '</div>' +
        '<p class="text-xs" style="color:oklch(0.70 0.012 250 / 70%);font-style:italic;margin-top:1.25rem;padding-top:1rem;border-top:1px solid oklch(0.32 0.012 250 / 50%)">All data in this lab is synthetic and clearly labeled as training material. No real patients, no real infrastructure, no real PII.</p>' +
      '</section>';
  }

  // ============================================================
  // KNOWLEDGE CORE (C2)
  // ============================================================
  function renderKnowledgeCore() {
    var cats = ["technical","managerial","operational","physical"];
    var fns = ["preventive","detective","corrective","deterrent","compensating","directive","mitigating"];
    var layers = ["perimeter","network","host","application","data"];
    var catBlurbs = {
      technical: "Implemented via hardware or software. Firewalls, encryption, EDR, MFA. Answers 'how is it built?'.",
      managerial: "Implemented via policies, procedures, governance. AUPs, IR plans, risk assessments. Provides authority.",
      operational: "Executed by people in day-to-day ops. Awareness training, pentesting, IR execution, background checks.",
      physical: "Implemented in the physical world. Locks, fences, CCTV, bollards, badge readers, HVAC.",
    };
    var fnBlurbs = {
      preventive: "Blocks the attack before it succeeds. Firewall, MFA, encryption at rest.",
      detective: "Identifies and alerts on activity in progress or after. IDS, EDR alerts, audit logs.",
      corrective: "Restores systems and data after an incident. Patching, backups, system rebuild.",
      deterrent: "Discourages an attacker from attempting. Warning signs, visible cameras, prosecution notices.",
      compensating: "Substitutes for a primary control that is unavailable or has failed. Backup ISP, VPN+jumpbox when MFA is down.",
      directive: "Directs behavior — mandates what people must do. AUP, mandatory training, posted instructions.",
      mitigating: "Limits the impact of an incident. Data retention limits, network segmentation.",
    };
    var layerBlurbs = {
      perimeter: "The boundary. First contact: NGFW, IDS, signage, failover link.",
      network: "Internal traffic. VLAN segmentation, NIDS, NAC, VPN.",
      host: "The machines. Hardening, EDR, patching, PAM, backups.",
      application: "The software. WAF, MFA, audit logging, input validation, SDLC.",
      data: "The asset. Encryption, DLP, 3-2-1 backups, classification, retention.",
    };

    var catHtml = cats.map(function(c) {
      return '<div style="display:flex;gap:0.75rem;padding:0.5rem;border-radius:4px">' +
        '<div style="width:10px;height:10px;border-radius:2px;background:' + D.CATEGORY_COLORS[c] + ';flex-shrink:0;margin-top:4px"></div>' +
        '<div><p class="text-sm font-medium">' + D.CATEGORY_LABELS[c] + '</p>' +
        '<p class="text-xs text-muted">' + esc(catBlurbs[c]) + '</p></div></div>';
    }).join("");

    var fnHtml = fns.map(function(f) {
      return '<div style="display:flex;gap:0.75rem;padding:0.5rem;border-radius:4px">' +
        '<div style="width:10px;height:10px;border-radius:2px;background:' + D.FUNCTION_COLORS[f] + ';flex-shrink:0;margin-top:4px"></div>' +
        '<div><p class="text-sm font-medium">' + D.FUNCTION_LABELS[f] + '</p>' +
        '<p class="text-xs text-muted">' + esc(fnBlurbs[f]) + '</p></div></div>';
    }).join("");

    var layerHtml = layers.map(function(l, i) {
      return '<div style="border-radius:6px;border:1px solid ' + D.LAYERS.find(function(x){return x.id===l}).color.replace(')', ' / 45%)') + ';padding:0.75rem;text-align:center">' +
        '<div class="text-xs mono text-muted">' + (i+1) + '</div>' +
        '<div style="width:24px;height:4px;border-radius:2px;margin:0 auto 0.5rem;background:' + D.LAYERS.find(function(x){return x.id===l}).color + '"></div>' +
        '<p class="text-xs font-semibold">' + D.LAYER_LABELS[l] + '</p>' +
        '<p class="text-xs text-muted" style="margin-top:0.25rem;line-height:1.4">' + esc(layerBlurbs[l]) + '</p></div>';
    }).join("");

    return '' +
      '<section id="knowledge-core" class="card" aria-labelledby="kc-heading">' +
        '<div class="section-heading">' + ICONS.bookOpen.replace('currentColor','var(--primary)') + 'C2 · Knowledge Core</div>' +
        '<p class="text-sm text-muted mb-6" style="max-width:48rem;line-height:1.5">Every security control sits on two independent axes. The <span style="color:var(--fg);font-weight:500">category</span> axis answers <em>how is it implemented?</em> The <span style="color:var(--fg);font-weight:500">function</span> axis answers <em>what does it do?</em> A single control has one category and one primary function. Layer them across five defense-in-depth layers, and you have the entire Lesson 1.1 model.</p>' +
        '<div class="md:grid-cols-2" style="display:grid;gap:1.25rem;grid-template-columns:1fr">' +
          '<div class="card-inner"><div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem">' + ICONS.shield.replace('currentColor','var(--primary)') + '<h3 class="text-sm font-semibold">Categories — <span class="text-muted font-normal">how is it implemented?</span></h3></div>' + catHtml + '</div>' +
          '<div class="card-inner"><div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem">' + '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/><path d="M15 3v6h6"/></svg>' + '<h3 class="text-sm font-semibold">Functions — <span class="text-muted font-normal">what does it do?</span></h3></div><div style="max-height:280px;overflow-y:auto">' + fnHtml + '</div></div>' +
          '<div class="card-inner" style="grid-column:1/-1"><div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem">' + '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h10v10H7z"/><path d="M5 5h14"/><path d="M5 19h14"/></svg>' + '<h3 class="text-sm font-semibold">Defense in depth — <span class="text-muted font-normal">5 layers, outside in</span></h3></div>' +
            '<p class="text-xs text-muted mb-4">Each layer assumes the layer outside it has failed. An attacker who breaches the perimeter still faces network controls; one who pivots through the network still faces host hardening — and so on, until the data layer is the last line.</p>' +
            '<div class="sm:grid-cols-5" style="display:grid;gap:0.5rem;grid-template-columns:repeat(2,1fr)">' + layerHtml + '</div>' +
          '</div>' +
          '<div class="card-inner" style="grid-column:1/-1"><div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem">' + '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>' + '<h3 class="text-sm font-semibold">CIA Triad — <span class="text-muted font-normal">what is the control protecting?</span></h3></div>' +
            '<div class="grid-cols-2 sm:grid-cols-2" style="display:grid;gap:0.75rem">' +
              '<div style="padding:0.75rem;border-radius:6px;border:1px solid oklch(0.32 0.012 250 / 60%)"><span class="badge badge-primary mb-2" style="margin-bottom:0.375rem;display:inline-flex">C</span><p class="text-xs font-medium">Confidentiality</p><p class="text-xs text-muted" style="margin-top:0.125rem">Secrecy. Encryption at rest, MFA, access lists.</p></div>' +
              '<div style="padding:0.75rem;border-radius:6px;border:1px solid oklch(0.32 0.012 250 / 60%)"><span class="badge badge-primary mb-2" style="margin-bottom:0.375rem;display:inline-flex">I</span><p class="text-xs font-medium">Integrity</p><p class="text-xs text-muted" style="margin-top:0.125rem">Unalterability. Hashing, digital signatures, audit logs.</p></div>' +
              '<div style="padding:0.75rem;border-radius:6px;border:1px solid oklch(0.32 0.012 250 / 60%)"><span class="badge badge-primary mb-2" style="margin-bottom:0.375rem;display:inline-flex">A</span><p class="text-xs font-medium">Availability</p><p class="text-xs text-muted" style="margin-top:0.125rem">Accessibility. Backups, failover, redundancy, DDoS protection.</p></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>';
  }

  // ============================================================
  // CONTROL PLATE
  // ============================================================
  function renderControlPlate(ctl, mode) {
    var s = Lab.state.getState();
    var cls = s.classifications[ctl.id] || { category: null, function: null };
    var layerStress = s.stress[ctl.layer] || { disabledControls: [], running: false };
    var isDisabled = layerStress.disabledControls.indexOf(ctl.id) !== -1;
    var isRedHerring = ctl.isRedHerring;
    var classified = cls.category && cls.function && !isRedHerring;

    var ciaBadges = "";
    if (ctl.cia.length > 0) {
      ciaBadges = ctl.cia.map(function(c) {
        var color = c === "C" ? "oklch(0.78 0.155 65)" : c === "I" ? "oklch(0.70 0.15 160)" : "oklch(0.66 0.10 235)";
        return '<span class="cia-badge" style="background:' + color + '25;color:' + color + ';border:1px solid ' + color + '50" title="Protects ' + D.CIA_LABELS[c] + '">' + c + '</span>';
      }).join("");
    } else {
      ciaBadges = '<span class="text-xs" style="color:oklch(0.70 0.012 250 / 50%);font-style:italic">no CIA mapping</span>';
    }

    var catOptions = ["technical","managerial","operational","physical"].map(function(c) {
      var sel = cls.category === c ? "selected" : "";
      return '<option value="' + c + '" ' + sel + '>' + D.CATEGORY_LABELS[c] + '</option>';
    }).join("");

    var fnOptions = ["preventive","detective","corrective","deterrent","compensating","directive","mitigating"].map(function(f) {
      var sel = cls.function === f ? "selected" : "";
      return '<option value="' + f + '" ' + sel + '>' + D.FUNCTION_LABELS[f] + '</option>';
    }).join("");

    var artifactHtml = ctl.artifacts.map(function(a, i) {
      return '<pre>' + esc(a) + '</pre>';
    }).join("");

    var stressToggle = "";
    if (mode === "medium" && !isRedHerring) {
      stressToggle = '<div style="margin-top:0.5rem;padding-top:0.5rem;border-top:1px solid oklch(0.32 0.012 250 / 40%);display:flex;align-items:center;justify-content:space-between">' +
        '<span class="text-xs mono" style="color:oklch(0.70 0.012 250 / 60%)">Stress test</span>' +
        '<div style="display:flex;align-items:center;gap:0.375rem">' +
          '<span class="text-xs mono ' + (isDisabled ? "text-destructive" : "text-emerald") + '">' + (isDisabled ? "OFFLINE" : "ONLINE") + '</span>' +
          '<div class="switch ' + (isDisabled ? "" : "on") + '" data-action="toggle-stress" data-control="' + ctl.id + '" data-layer="' + ctl.layer + '" role="switch" aria-checked="' + !isDisabled + '" aria-label="Toggle ' + esc(ctl.name) + ' online/offline for stress test" tabindex="0"></div>' +
        '</div></div>';
    }

    var redHerringNote = "";
    if (isRedHerring) {
      redHerringNote = '<div style="margin-top:0.5rem;padding-top:0.5rem;border-top:1px dashed oklch(0.70 0.012 250 / 20%)"><p class="text-xs" style="color:oklch(0.70 0.012 250 / 50%);font-style:italic">⚠ suspicious artifact — classify carefully</p></div>';
    }

    return '<div class="control-plate ' + (isDisabled ? "disabled" : "") + (isRedHerring ? " red-herring" : "") + '" data-control-id="' + ctl.id + '">' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:0.5rem">' +
        '<div style="flex:1;min-width:0">' +
          '<p class="mono text-xs" style="color:oklch(0.70 0.012 250 / 70%)">' + ctl.id + '</p>' +
          '<p class="text-sm font-semibold truncate" title="' + esc(ctl.name) + '">' + esc(ctl.name) + '</p>' +
        '</div>' +
        (ctl.artifacts.length > 0 ? '<button class="btn btn-ghost btn-icon-sm" data-action="show-artifacts" data-control="' + ctl.id + '" aria-label="View artifacts for ' + esc(ctl.name) + '">' + ICONS.fileText + '</button>' : '') +
      '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0.375rem;margin-bottom:0.5rem">' +
        '<div><label class="select-label">Category</label><select class="select" data-action="set-category" data-control="' + ctl.id + '"><option value="">—</option>' + catOptions + '</select></div>' +
        '<div><label class="select-label">Function</label><select class="select" data-action="set-function" data-control="' + ctl.id + '"><option value="">—</option>' + fnOptions + '</select></div>' +
      '</div>' +
      '<div style="display:flex;align-items:center;justify-content:space-between">' +
        '<div style="display:flex;gap:0.25rem">' + ciaBadges + '</div>' +
        (classified ? '<span class="text-emerald" style="color:var(--emerald)">' + ICONS.checkCircle.replace('width="16"','width="12"').replace('currentColor','var(--emerald)') + '</span>' : '') +
      '</div>' +
      stressToggle + redHerringNote +
    '</div>';
  }

  // ============================================================
  // CONTROLS BRIDGE (C3)
  // ============================================================
  function renderBridge(mode) {
    var layerIcons = {
      perimeter: ICONS.shield, network: ICONS.network, host: ICONS.server,
      application: ICONS.code, data: ICONS.database,
    };

    var spansHtml = D.LAYERS.map(function(layer) {
      var layerControls = D.CONTROLS.filter(function(c) { return c.layer === layer.id && !c.isRedHerring; });
      var redHerrings = D.CONTROLS.filter(function(c) { return c.layer === layer.id && c.isRedHerring; });
      var allControls = mode === "hard" ? layerControls.concat(redHerrings) : layerControls;

      var s = Lab.state.getState();
      var classified = layerControls.filter(function(c) {
        var cls = s.classifications[c.id];
        return cls && cls.category && cls.function;
      }).length;

      var platesHtml = allControls.map(function(ctl) {
        return renderControlPlate(ctl, mode);
      }).join("");

      return '<div class="layer-span" style="border-color:' + layer.color.replace(')', ' / 35%)') + '">' +
        '<div class="layer-header" style="background:' + layer.color.replace(')', ' / 12%)') + ';border-color:' + layer.color.replace(')', ' / 25%)') + '">' +
          '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.25rem">' +
            layerIcons[layer.id].replace('currentColor', layer.color) +
            '<h3 class="text-sm font-semibold">' + layer.name + '</h3>' +
            '<span class="text-xs mono text-muted" style="margin-left:auto">' + classified + '/' + layerControls.length + '</span>' +
          '</div>' +
          '<p class="text-xs text-muted">' + esc(layer.blurb) + '</p>' +
        '</div>' +
        '<div style="padding:0.5rem;display:flex;flex-direction:column;gap:0.5rem;min-height:120px">' + platesHtml + '</div>' +
      '</div>';
    }).join("");

    // Attacker path rail
    var stages = [
      {n:1,label:"Credential stuffing",layer:"perimeter"},
      {n:2,label:"Portal access attempt",layer:"application"},
      {n:3,label:"lsass dump",layer:"host"},
      {n:4,label:"Lateral movement",layer:"network"},
      {n:5,label:"PHI exfil attempt",layer:"data"},
    ];
    var stagesHtml = stages.map(function(s, i) {
      var color = D.LAYERS.find(function(l){return l.id===s.layer}).color;
      return '<div style="display:flex;align-items:center;gap:0.25rem;flex-shrink:0">' +
        '<div style="border-radius:6px;border:1px solid ' + color.replace(')', ' / 35%)') + ';padding:0.375rem;text-align:center;min-width:110px">' +
          '<div class="text-xs mono text-muted">Stage ' + s.n + '</div>' +
          '<div class="text-xs font-medium">' + s.label + '</div>' +
          '<div class="text-xs mono" style="color:' + color + '">' + s.layer.toUpperCase() + '</div>' +
        '</div>' +
        (i < stages.length - 1 ? '<span style="color:oklch(0.70 0.012 250 / 50%)">' + ICONS.chevronRight + '</span>' : '') +
      '</div>';
    }).join("");

    return '' +
      '<section id="controls-bridge" class="card" aria-labelledby="bridge-heading">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:0.75rem;margin-bottom:0.5rem;flex-wrap:wrap">' +
          '<div class="section-heading" style="margin-bottom:0">' + ICONS.boxes.replace('currentColor','var(--primary)') + '<span id="bridge-heading">C3 · Controls Bridge — Interactive Environment</span></div>' +
          '<span class="badge badge-outline mono">' + (mode === "medium" ? "Guided · stress tests enabled" : "Discovery · red herrings present") + '</span>' +
        '</div>' +
        '<p class="text-sm text-muted mb-5" style="max-width:48rem;line-height:1.5">Five spans — one per defense-in-depth layer. Each control plate has a Category and Function dropdown. ' + (mode === "medium" ? "Classify each control by reading its artifacts (the document icon). Use the stress-test switch to take a control offline and see what compensates." : "Read the evidence artifacts carefully — some plates are red herrings (dashed border), not real controls. Classify every real control; bin the red herrings by leaving them unclassified.") + '</p>' +
        '<div class="bp-grid" style="border-radius:8px;border:1px solid oklch(0.32 0.012 250 / 50%);padding:0.75rem;margin-bottom:1.25rem;overflow-x:auto">' +
          '<div class="bridge-grid">' + spansHtml + '</div>' +
        '</div>' +
        '<div style="border-radius:8px;border:1px solid var(--border);background:oklch(0.18 0.014 250 / 40%);padding:1rem">' +
          '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem">' + ICONS.zap.replace('currentColor','var(--primary)') + '<h3 class="text-sm font-semibold">Attacker Path — October 14 incident</h3><span class="text-xs mono text-muted" style="margin-left:auto">41 min · contained</span></div>' +
          '<div style="display:flex;align-items:center;gap:0.25rem;overflow-x:auto;padding-bottom:0.5rem">' + stagesHtml + '</div>' +
          '<p class="text-xs text-muted" style="margin-top:0.25rem;font-style:italic">The attacker crossed layers in this order. Each layer\'s controls either fired or failed — the stress test below lets you simulate failures.</p>' +
        '</div>' +
        '<div style="margin-top:1.25rem;padding:0.75rem;border-radius:8px;border:1px solid oklch(0.32 0.012 250 / 40%);background:oklch(0.18 0.014 250 / 30%);display:flex;gap:0.5rem">' +
          ICONS.info.replace('currentColor','oklch(0.78 0.155 65 / 70%)') +
          '<p class="text-xs text-muted" style="line-height:1.5">' + (mode === "medium" ? "Use the artifact (document) icon on each plate to inspect the evidence, then classify. The stress-test switch lets you take a control offline — for OBJ-M8, take CTL-001 (NGFW) offline and identify which control compensates." : "Three of the plates in this bridge are red herrings (dashed border, marked ⚠). They are NOT security controls. Leave them unclassified — the validation for OBJ-H3 counts only correctly-classified REAL controls.") + '</p>' +
        '</div>' +
      '</section>';
  }

  // ============================================================
  // OBJECTIVE INTERACTION RENDERING
  // ============================================================
  function renderInteraction(obj, locked) {
    var spec = obj.validation;
    var s = Lab.state.getState();

    if (spec.kind === "select-one") {
      var sel = (s.selections[obj.id] || [])[0] || "";
      var opts = spec.options.map(function(opt) {
        return '<label class="radio-row' + (sel === opt ? " selected" : "") + '"><input type="radio" name="obj-' + obj.id + '" value="' + esc(opt) + '" ' + (sel === opt ? "checked" : "") + ' ' + (locked ? "disabled" : "") + ' data-action="select-one" data-obj="' + obj.id + '"><span class="text-xs">' + esc(opt) + '</span></label>';
      }).join("");
      return '<div style="display:flex;flex-direction:column;gap:0.375rem">' + opts + '</div>';
    }

    if (spec.kind === "select-many") {
      var selArr = s.selections[obj.id] || [];
      var opts2 = spec.options.map(function(opt) {
        var checked = selArr.indexOf(opt) !== -1;
        return '<label class="checkbox-row' + (checked ? " selected" : "") + '"><input type="checkbox" value="' + esc(opt) + '" ' + (checked ? "checked" : "") + ' ' + (locked ? "disabled" : "") + ' data-action="select-many" data-obj="' + obj.id + '"><span class="text-xs">' + esc(opt) + '</span></label>';
      }).join("");
      return '<div style="display:flex;flex-direction:column;gap:0.375rem">' + opts2 + '</div>';
    }

    if (spec.kind === "free-text-regex") {
      var text = s.freeText[obj.id] || "";
      return '<textarea class="textarea" placeholder="Type your justification…" data-action="free-text" data-obj="' + obj.id + '" ' + (locked ? "disabled" : "") + '>' + esc(text) + '</textarea>';
    }

    if (spec.kind === "sequence") {
      var arranged = s.sequences[obj.id] || [];
      var pool = getSequencePool(obj.id, spec.steps);
      var unplaced = pool.filter(function(p) { return arranged.indexOf(p.id) === -1; });

      var arrangedHtml = arranged.map(function(id, idx) {
        var label = D.SEQUENCE_LABELS[id] || id;
        return '<div class="seq-item">' +
          '<span class="seq-num">' + (idx+1) + '</span>' +
          '<span class="text-xs" style="flex:1">' + esc(label) + '</span>' +
          '<div style="display:flex;gap:0.125rem">' +
            '<button class="btn btn-ghost btn-icon-sm" data-action="seq-up" data-obj="' + obj.id + '" data-idx="' + idx + '" ' + (locked || idx === 0 ? "disabled" : "") + ' aria-label="Move up">' + ICONS.chevronUp + '</button>' +
            '<button class="btn btn-ghost btn-icon-sm" data-action="seq-down" data-obj="' + obj.id + '" data-idx="' + idx + '" ' + (locked || idx === arranged.length - 1 ? "disabled" : "") + ' aria-label="Move down">' + ICONS.chevronDown + '</button>' +
            '<button class="btn btn-ghost btn-icon-sm" data-action="seq-remove" data-obj="' + obj.id + '" data-id="' + esc(id) + '" ' + (locked ? "disabled" : "") + ' aria-label="Remove">' + ICONS.xCircle.replace('currentColor','var(--muted-fg)') + '</button>' +
          '</div></div>';
      }).join("");

      var poolHtml = unplaced.map(function(p) {
        return '<button class="btn btn-outline btn-sm" data-action="seq-add" data-obj="' + obj.id + '" data-id="' + esc(p.id) + '" ' + (locked ? "disabled" : "") + '>+ ' + esc(p.label) + '</button>';
      }).join("");

      return '<div>' +
        '<div><p class="text-xs mono uppercase text-muted" style="margin-bottom:0.375rem">Arranged order (' + arranged.length + '/' + spec.steps.length + ')</p>' +
          '<div style="display:flex;flex-direction:column;gap:0.375rem;min-height:40px">' +
            (arranged.length === 0 ? '<p class="text-xs text-muted" style="font-style:italic;padding:0.5rem;border:1px dashed oklch(0.32 0.012 250 / 40%);border-radius:4px">Click items from the pool below to arrange them in order.</p>' : arrangedHtml) +
          '</div></div>' +
        (unplaced.length > 0 ? '<div style="margin-top:0.75rem"><p class="text-xs mono uppercase text-muted" style="margin-bottom:0.375rem">Pool (' + unplaced.length + ' remaining' + (unplaced.length > spec.steps.length ? ' — includes decoys' : '') + ')</p><div style="display:flex;flex-wrap:wrap;gap:0.375rem">' + poolHtml + '</div></div>' : '') +
      '</div>';
    }

    if (spec.kind === "classify" || spec.kind === "bridge-state") {
      return '<div style="padding:0.625rem;border-radius:6px;border:1px dashed oklch(0.32 0.012 250 / 50%);background:oklch(0.18 0.014 250 / 30%);font-size:0.75rem;color:var(--muted-fg);display:flex;gap:0.5rem">' + ICONS.boxes.replace('currentColor','oklch(0.78 0.155 65 / 60%)').replace('width="16"','width="14"') + '<span>Classify this control in the Controls Bridge above, then click CHECK.</span></div>';
    }

    if (spec.kind === "composite") {
      var parts = spec.specs.map(function(sub, i) {
        var subInteraction = renderCompositeChild(obj, sub, i, locked);
        return '<div style="padding:0.625rem;border-radius:6px;border:1px solid oklch(0.32 0.012 250 / 40%);background:oklch(0.18 0.014 250 / 20%)">' +
          '<p class="text-xs mono uppercase text-muted" style="margin-bottom:0.375rem">Part ' + (i+1) + ' of ' + spec.specs.length + '</p>' +
          subInteraction + '</div>';
      }).join("");
      return '<div style="display:flex;flex-direction:column;gap:0.75rem">' + parts + '</div>';
    }

    return '<p class="text-xs text-muted">Unknown interaction type.</p>';
  }

  function renderCompositeChild(obj, sub, specIndex, locked) {
    var s = Lab.state.getState();
    var subKey = obj.id + "--" + specIndex;

    if (sub.kind === "select-one") {
      var val = s.compositeSelections[subKey] || "";
      var opts = sub.options.map(function(opt) {
        return '<label class="radio-row' + (val === opt ? " selected" : "") + '"><input type="radio" name="comp-' + subKey + '" value="' + esc(opt) + '" ' + (val === opt ? "checked" : "") + ' ' + (locked ? "disabled" : "") + ' data-action="composite-select" data-subkey="' + subKey + '"><span class="text-xs">' + esc(opt) + '</span></label>';
      }).join("");
      return '<div style="display:flex;flex-direction:column;gap:0.375rem">' + opts + '</div>';
    }
    if (sub.kind === "select-many") {
      var selArr = s.selections[obj.id] || [];
      var opts2 = sub.options.map(function(opt) {
        var checked = selArr.indexOf(opt) !== -1;
        return '<label class="checkbox-row' + (checked ? " selected" : "") + '"><input type="checkbox" value="' + esc(opt) + '" ' + (checked ? "checked" : "") + ' ' + (locked ? "disabled" : "") + ' data-action="select-many" data-obj="' + obj.id + '"><span class="text-xs">' + esc(opt) + '</span></label>';
      }).join("");
      return '<div style="display:flex;flex-direction:column;gap:0.375rem">' + opts2 + '</div>';
    }
    if (sub.kind === "free-text-regex") {
      var text = s.compositeFreeText[subKey] || "";
      return '<textarea class="textarea" placeholder="Type your justification…" data-action="composite-free-text" data-subkey="' + subKey + '" ' + (locked ? "disabled" : "") + '>' + esc(text) + '</textarea>';
    }
    return '<p class="text-xs text-muted">Unknown sub-interaction.</p>';
  }

  // ============================================================
  // OBJECTIVE CARD
  // ============================================================
  function renderObjectiveCard(obj, index) {
    var s = Lab.state.getState();
    var st = s.objectives[obj.id] || { status:"untouched", attempts:0, hintsUsed:0, hardNudgeUsed:false };
    var isLocked = st.status === "correct";
    var pillarColor = D.PILLAR_COLORS[obj.pillar];
    var hints = [obj.hint, obj.hintDeep, obj.hintDemo].filter(Boolean);

    var statusIcon = "";
    if (st.status === "correct") {
      statusIcon = '<span class="text-emerald" style="color:var(--emerald)">' + ICONS.checkCircle.replace('currentColor','var(--emerald)') + '</span>';
    } else if (st.status === "incorrect") {
      statusIcon = '<span class="text-destructive">' + ICONS.xCircle.replace('currentColor','var(--destructive)') + '</span>';
    } else if (st.status === "in-progress") {
      statusIcon = '<span style="color:var(--primary)">' + ICONS.circleDot.replace('currentColor','var(--primary)') + '</span>';
    } else {
      statusIcon = '<div style="width:1.25rem;height:1.25rem;border-radius:50%;border:2px solid oklch(0.70 0.012 250 / 40%);display:flex;align-items:center;justify-content:center;font-size:0.625rem;font-family:var(--font-mono;color:var(--muted-fg)">' + (index+1) + '</div>';
    }

    // Hints (Medium only)
    var hintsHtml = "";
    if (obj.mode === "medium" && hints.length > 0) {
      var hintsItems = hints.map(function(h, i) {
        var unlocked = st.hintsUsed > i;
        return '<div>' +
          '<button class="btn btn-ghost btn-sm" style="height:1.5rem;font-size:0.6875rem;color:oklch(0.78 0.155 65 / 80%)" data-action="use-hint" data-obj="' + obj.id + '" ' + (unlocked || st.hintsUsed >= hints.length ? "disabled" : "") + '>' + ICONS.lightbulb + (unlocked ? ' Hint ' + (i+1) + ' revealed' : ' Reveal hint ' + (i+1) + ' of ' + hints.length) + '</button>' +
          (unlocked ? '<p class="hint-box">' + esc(h) + '</p>' : '') +
        '</div>';
      }).join("");
      hintsHtml = '<div style="margin-left:2rem;display:flex;flex-direction:column;gap:0.25rem">' + hintsItems + '</div>';
    }

    // Hard nudge
    var nudgeHtml = "";
    if (obj.mode === "hard" && obj.hardNudge) {
      if (!st.hardNudgeUsed) {
        nudgeHtml = '<div style="margin-left:2rem"><button class="btn btn-ghost btn-sm" style="color:oklch(0.65 0.21 25 / 80%)" data-action="use-nudge" data-obj="' + obj.id + '">' + ICONS.alertCircle + ' Reveal nudge (costs 1 star)</button></div>';
      } else {
        nudgeHtml = '<div style="margin-left:2rem"><p class="hint-box" style="background:oklch(0.65 0.21 25 / 5%);border-color:oklch(0.65 0.21 25 / 15%)">' + esc(obj.hardNudge) + '</p></div>';
      }
    }

    // Check button
    var checkBtn = "";
    if (isLocked) {
      checkBtn = '<span class="badge badge-emerald" style="padding:0.25rem 0.5rem">' + ICONS.lock + ' Locked · Correct</span>';
    } else {
      checkBtn = '<button class="btn btn-sm" data-action="check-objective" data-obj="' + obj.id + '">' + ICONS.checkCircle.replace('width="16"','width="14"') + ' Check</button>';
    }

    return '<div class="obj-card ' + (st.status === "correct" ? "correct" : st.status === "incorrect" ? "incorrect" : "") + '" data-obj-card="' + obj.id + '">' +
      '<div class="obj-card-body">' +
        '<div style="display:flex;align-items:flex-start;gap:0.75rem">' +
          '<div style="flex-shrink:0;margin-top:0.125rem">' + statusIcon + '</div>' +
          '<div style="flex:1;min-width:0">' +
            '<div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.25rem">' +
              '<span class="mono text-xs" style="color:oklch(0.70 0.012 250 / 70%)">' + obj.id + '</span>' +
              '<span class="badge badge-outline mono" style="color:' + pillarColor + ';border-color:' + pillarColor + '50">' + obj.pillar + ' · ' + D.PILLAR_LABELS[obj.pillar] + '</span>' +
              '<span class="text-xs text-muted">' + obj.points + ' pts</span>' +
            '</div>' +
            '<h3 class="text-sm font-semibold">' + esc(obj.title) + '</h3>' +
          '</div>' +
        '</div>' +
        '<div style="margin-top:0.75rem">' +
          '<p class="text-xs text-muted" style="margin-left:2rem;line-height:1.5">' + esc(obj.brief) + '</p>' +
          (obj.mode === "medium" && obj.whereToLook ? '<div style="margin-left:2rem;margin-top:0.375rem;display:flex;gap:0.375rem;align-items:flex-start"><span style="color:oklch(0.78 0.155 65 / 80%)">' + ICONS.eye + '</span><span class="text-xs" style="color:oklch(0.78 0.155 65 / 80%)"><span style="font-weight:500">Where to look:</span> ' + esc(obj.whereToLook) + '</span></div>' : '') +
          '<div style="margin-left:2rem;margin-top:0.75rem">' + renderInteraction(obj, isLocked) + '</div>' +
          hintsHtml + nudgeHtml +
          '<div style="margin-left:2rem;margin-top:0.75rem;display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap">' +
            checkBtn +
            '<span class="text-xs text-muted">Attempts: ' + (st.attempts || 0) + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  // ============================================================
  // OBJECTIVES TRACKER (C4)
  // ============================================================
  function renderObjectivesTracker(mode) {
    var objectives = D.OBJECTIVES.filter(function(o) { return o.mode === mode; });
    var s = Lab.state.getState();
    var completed = objectives.filter(function(o) { return s.objectives[o.id] && s.objectives[o.id].status === "correct"; }).length;

    // Pillar progress
    var pillars = ["P1","P2","P3","P4"];
    var pillarHtml = pillars.map(function(p) {
      var objs = objectives.filter(function(o) { return o.pillar === p; });
      var done = objs.filter(function(o) { return s.objectives[o.id] && s.objectives[o.id].status === "correct"; }).length;
      var pct = objs.length > 0 ? (done / objs.length) * 100 : 0;
      var color = D.PILLAR_COLORS[p];
      return '<div class="pillar-bar"><div style="display:flex;justify-content:space-between;margin-bottom:0.25rem"><span class="text-xs mono" style="color:' + color + '">' + D.PILLAR_LABELS[p] + '</span><span class="text-xs text-muted">' + done + '/' + objs.length + '</span></div><div class="pillar-bar-track"><div class="pillar-bar-fill" style="width:' + pct + '%;background:' + color + '"></div></div></div>';
    }).join("");

    var cardsHtml = objectives.map(function(obj, i) {
      return renderObjectiveCard(obj, i);
    }).join("");

    return '' +
      '<section id="objectives" class="card" aria-labelledby="obj-heading">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:0.75rem;margin-bottom:1rem;flex-wrap:wrap">' +
          '<div class="section-heading" style="margin-bottom:0">' + ICONS.listChecks.replace('currentColor','var(--primary)') + '<span id="obj-heading">C4 · Objectives Tracker</span></div>' +
          '<span class="badge badge-outline mono">' + completed + '/' + objectives.length + ' complete</span>' +
        '</div>' +
        '<div class="grid-cols-4" style="display:grid;gap:0.5rem;margin-bottom:1.25rem">' + pillarHtml + '</div>' +
        '<div style="display:flex;flex-direction:column;gap:0.75rem">' + cardsHtml + '</div>' +
      '</section>';
  }

  // ============================================================
  // QUIZ (C5) — sequential, one at a time
  // ============================================================
  function renderQuiz(mode) {
    var questions = D.QUIZ.filter(function(q) { return q.mode === mode; });
    var s = Lab.state.getState();
    var currentIdx = s.quizCurrentIndex || 0;
    if (currentIdx >= questions.length) currentIdx = questions.length - 1;
    var q = questions[currentIdx];
    if (!q) return "";

    var qs = s.quiz[q.id] || { selectedIndex: null, checked: false };
    var sel = qs.selectedIndex;
    var isChecked = qs.checked;
    var isCorrect = isChecked && sel === q.correctIndex;
    var isWrong = isChecked && sel !== q.correctIndex;
    var checkedCount = questions.filter(function(qq) { return s.quiz[qq.id] && s.quiz[qq.id].checked; }).length;
    var correctCount = questions.filter(function(qq) { var qqs = s.quiz[qq.id]; return qqs && qqs.checked && qqs.selectedIndex === qq.correctIndex; }).length;
    var allChecked = checkedCount === questions.length;
    var isLast = currentIdx === questions.length - 1;

    // Progress dots
    var dotsHtml = questions.map(function(qq, i) {
      var qqs = s.quiz[qq.id];
      var qCorrect = qqs && qqs.checked && qqs.selectedIndex === qq.correctIndex;
      var qWrong = qqs && qqs.checked && qqs.selectedIndex !== qq.correctIndex;
      var cls = "quiz-dot";
      if (i === currentIdx) cls += " current";
      else if (qCorrect) cls += " correct";
      else if (qWrong) cls += " wrong";
      var label = "Go to question " + (i+1);
      if (qqs && qqs.checked) label += qCorrect ? " (correct)" : " (incorrect)";
      return '<button class="' + cls + '" data-action="quiz-goto" data-idx="' + i + '" aria-label="' + label + '"' + (i === currentIdx ? ' aria-current="true"' : '') + '>' + (i+1) + '</button>';
    }).join("");

    // Options — R3: only selected answer colored after check
    var optsHtml = q.options.map(function(opt, idx) {
      var rowClass = "radio-row";
      if (!isChecked) {
        if (sel === idx) rowClass += " selected";
      } else {
        if (idx === sel) {
          rowClass += isCorrect ? " correct" : " wrong";
        } else {
          rowClass += " neutral";
        }
      }
      var icon = "";
      if (isChecked && idx === sel) {
        icon = isCorrect ? '<span class="text-emerald">' + ICONS.checkCircle.replace('width="16"','width="14"').replace('currentColor','var(--emerald)') + '</span>' : '<span class="text-destructive">' + ICONS.xCircle.replace('width="16"','width="14"').replace('currentColor','var(--destructive)') + '</span>';
      }
      return '<label class="' + rowClass + '"><input type="radio" name="quiz-' + q.id + '" value="' + idx + '" ' + (sel === idx ? "checked" : "") + ' ' + (isChecked ? "disabled" : "") + ' data-action="quiz-select" data-qid="' + q.id + '"><span class="text-xs" style="flex:1">' + esc(opt) + '</span>' + icon + '</label>';
    }).join("");

    // Check button / feedback
    var checkSection = "";
    if (!isChecked) {
      checkSection = '<div style="margin-top:1rem;display:flex;align-items:center;gap:0.75rem">' +
        '<button class="btn btn-sm" data-action="quiz-check" data-qid="' + q.id + '" ' + (sel === null || sel === undefined ? "disabled" : "") + '>' + ICONS.checkCircle.replace('width="16"','width="14"') + ' Check Answer</button>' +
        (sel === null || sel === undefined ? '<span class="text-xs text-muted">Select an answer to enable Check.</span>' : '<span class="text-xs text-muted" style="display:flex;gap:0.25rem">' + ICONS.lock + ' Answer locks after you check.</span>') +
      '</div>';
    } else {
      checkSection = '<div class="feedback-box ' + (isCorrect ? "feedback-correct" : "feedback-incorrect") + '" style="margin-top:1rem">' +
        '<div style="display:flex;gap:0.5rem"><span>' + (isCorrect ? ICONS.checkCircle : ICONS.xCircle) + '</span><div><p class="text-xs font-medium">' + (isCorrect ? "Correct" : "Incorrect") + ' — Explanation</p><p class="text-xs" style="margin-top:0.25rem;line-height:1.5">' + esc(q.explanation) + '</p></div></div>' +
      '</div>' +
      '<div style="margin-top:1rem;display:flex;align-items:center;justify-content:space-between;gap:0.5rem">' +
        '<button class="btn btn-ghost btn-sm" data-action="quiz-prev" ' + (currentIdx === 0 ? "disabled" : "") + '>' + ICONS.chevronLeft + ' Previous</button>' +
        (!isLast ? '<button class="btn btn-sm" data-action="quiz-next">Next Question ' + ICONS.chevronRight + '</button>' : '<span class="badge badge-outline mono">' + (allChecked ? "All questions checked" : checkedCount + '/' + questions.length + " checked") + '</span>') +
      '</div>';
    }

    // Summary
    var summaryHtml = "";
    if (allChecked) {
      var summaryItems = questions.map(function(qq, i) {
        var qqs = s.quiz[qq.id];
        var qCorrect = qqs && qqs.selectedIndex === qq.correctIndex;
        return '<button class="badge ' + (qCorrect ? "badge-emerald" : "badge-destructive") + ' mono" style="cursor:pointer;font-size:0.625rem;padding:0.25rem 0.5rem" data-action="quiz-goto" data-idx="' + i + '">' + qq.id + ': ' + (qCorrect ? "✓" : "✗") + '</button>';
      }).join("");
      summaryHtml = '<div style="margin-top:1.25rem;padding:1rem;border-radius:8px;border:1px solid oklch(0.78 0.155 65 / 30%);background:oklch(0.78 0.155 65 / 5%)">' +
        '<div style="display:flex;gap:0.5rem;margin-bottom:0.5rem">' + ICONS.clipboardCheck.replace('currentColor','var(--primary)') + '<p class="text-sm font-semibold">Quiz complete</p></div>' +
        '<p class="text-xs text-muted" style="margin-bottom:0.75rem">You scored <span style="color:var(--fg);font-weight:500">' + correctCount + '/' + questions.length + '</span> (' + Math.round((correctCount/questions.length)*100) + '%). Review any question by tapping its number above.</p>' +
        '<div style="display:flex;flex-wrap:wrap;gap:0.375rem">' + summaryItems + '</div>' +
      '</div>';
    }

    return '' +
      '<section id="knowledge-check" class="card" aria-labelledby="quiz-heading">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:0.75rem;margin-bottom:1rem;flex-wrap:wrap">' +
          '<div class="section-heading" style="margin-bottom:0">' + ICONS.clipboardCheck.replace('currentColor','var(--primary)') + '<span id="quiz-heading">C5 · Knowledge Check</span></div>' +
          '<span class="badge badge-outline mono">' + checkedCount + '/' + questions.length + ' checked · ' + correctCount + ' correct</span>' +
        '</div>' +
        '<p class="text-sm text-muted mb-5" style="max-width:48rem;line-height:1.5">' + (mode === "medium" ? "Six concept questions, one at a time. Select an answer, then press Check to lock it. After checking, you'll see whether your selection was right and an explanation — then move to the next question." : "Seven scenario-based items, one at a time. Select, press Check to lock, read the rationale, then advance. Your answer locks after checking — choose carefully.") + '</p>' +
        '<div style="display:flex;gap:0.375rem;margin-bottom:1.25rem;flex-wrap:wrap">' + dotsHtml + '</div>' +
        '<div class="' + (isChecked ? (isCorrect ? "feedback-correct" : "feedback-incorrect") : "") + '" style="border-radius:8px;border:1px solid ' + (isChecked ? (isCorrect ? "oklch(0.70 0.15 160 / 40%)" : "oklch(0.65 0.21 25 / 40%)") : "var(--border)") + ';background:' + (isChecked ? (isCorrect ? "oklch(0.70 0.15 160 / 5%)" : "oklch(0.65 0.21 25 / 5%)") : "transparent") + ';padding:1rem">' +
          '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem;flex-wrap:wrap">' +
            '<span class="mono text-xs text-muted">' + q.id + ' · Question ' + (currentIdx+1) + ' of ' + questions.length + '</span>' +
            '<span class="badge badge-outline mono" style="color:' + D.PILLAR_COLORS[q.pillar] + ';border-color:' + D.PILLAR_COLORS[q.pillar] + '50">' + D.PILLAR_LABELS[q.pillar] + '</span>' +
            (isChecked ? '<span class="badge ' + (isCorrect ? "badge-emerald" : "badge-destructive") + '" style="margin-left:auto">' + (isCorrect ? ICONS.checkCircle + " Correct" : ICONS.xCircle + " Incorrect") + '</span>' : '') +
          '</div>' +
          '<p class="text-xs text-muted italic mb-2">' + esc(q.scenario) + '</p>' +
          '<p class="text-sm font-medium mb-4">' + esc(q.prompt) + '</p>' +
          '<div style="display:flex;flex-direction:column;gap:0.5rem">' + optsHtml + '</div>' +
          checkSection +
        '</div>' +
        summaryHtml +
      '</section>';
  }

  // ============================================================
  // DEBRIEF (C6)
  // ============================================================
  function renderDebrief() {
    var detHtml = D.DEBRIEF.detectionOpportunities.map(function(d) {
      var sourcesHtml = d.sources.map(function(s) { return '<span class="text-xs mono text-muted" style="background:oklch(0.25 0.014 250 / 40%);padding:0.0625rem 0.375rem;border-radius:2px">' + esc(s) + '</span>'; }).join("");
      return '<div class="card-inner" style="padding:0.75rem"><div style="display:flex;justify-content:space-between;margin-bottom:0.5rem"><p class="text-xs font-semibold">' + d.layer + ' layer</p><span class="badge badge-outline mono">' + d.sources.length + ' sources</span></div><div style="display:flex;flex-wrap:wrap;gap:0.25rem;margin-bottom:0.5rem">' + sourcesHtml + '</div><p class="text-xs text-muted">' + esc(d.logic) + '</p></div>';
    }).join("");

    var mitHtml = D.DEBRIEF.mitigationRecommendations.map(function(m, i) {
      return '<div style="display:flex;gap:0.5rem;padding:0.625rem;border-radius:6px;border:1px solid oklch(0.32 0.012 250 / 50%);background:oklch(0.18 0.014 250 / 30%)"><span class="text-xs mono" style="color:oklch(0.78 0.155 65 / 70%)">' + (i+1) + '.</span><p class="text-xs">' + esc(m) + '</p></div>';
    }).join("");

    var blueHtml = D.DEBRIEF.blueTeamTakeaways.map(function(t) { return '<li class="text-xs text-muted" style="display:flex;gap:0.375rem;line-height:1.5"><span style="color:oklch(0.70 0.15 160 / 60%)">▸</span> ' + esc(t) + '</li>'; }).join("");
    var redHtml = D.DEBRIEF.redTeamTakeaways.map(function(t) { return '<li class="text-xs text-muted" style="display:flex;gap:0.375rem;line-height:1.5"><span style="color:oklch(0.65 0.21 25 / 60%)">▸</span> ' + esc(t) + '</li>'; }).join("");

    var linksHtml = D.DEBRIEF.officialLinks.map(function(l) {
      return '<a href="' + l.url + '" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:0.375rem;font-size:0.75rem;color:var(--primary);text-decoration:underline;text-underline-offset:2px">' + esc(l.label) + ' ' + ICONS.arrowRight.replace('width="12"','width="10"') + '</a>';
    }).join("");

    return '' +
      '<section id="debrief" class="card" aria-labelledby="debrief-heading">' +
        '<div class="section-heading">' + ICONS.fileText.replace('currentColor','var(--primary)') + '<span id="debrief-heading">C6 · Debrief — Field Notes</span></div>' +
        '<p class="text-sm text-muted mb-6" style="max-width:48rem;line-height:1.5">Synthesis of the lab. Read this after completing the objectives — it\'s the same material reorganized the way a working analyst would file it.</p>' +
        '<div style="margin-bottom:1.75rem"><div style="display:flex;gap:0.5rem;margin-bottom:0.75rem">' + ICONS.eye.replace('currentColor','var(--primary)') + '<h3 class="text-sm font-semibold">Detection opportunities per layer</h3></div><div class="sm:grid-cols-2" style="display:grid;gap:0.75rem;grid-template-columns:1fr">' + detHtml + '</div></div>' +
        '<div style="margin-bottom:1.75rem"><div style="display:flex;gap:0.5rem;margin-bottom:0.75rem">' + '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1 7-2.5C14.5 4 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>' + '<h3 class="text-sm font-semibold">Mitigation recommendations (with control IDs)</h3></div><div style="display:flex;flex-direction:column;gap:0.5rem">' + mitHtml + '</div></div>' +
        '<div class="sm:grid-cols-2" style="display:grid;gap:1rem;margin-bottom:1.75rem;grid-template-columns:1fr">' +
          '<div style="border-radius:8px;border:1px solid oklch(0.70 0.15 160 / 30%);background:oklch(0.70 0.15 160 / 5%);padding:1rem"><div style="display:flex;gap:0.5rem;margin-bottom:0.5rem">' + '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1 7-2.5C14.5 4 17 5 19 5a1 1 0 0 1 1 1z"/></svg>' + '<h3 class="text-sm font-semibold text-emerald">Blue-team takeaways</h3></div><ul style="list-style:none;display:flex;flex-direction:column;gap:0.375rem">' + blueHtml + '</ul></div>' +
          '<div style="border-radius:8px;border:1px solid oklch(0.65 0.21 25 / 30%);background:oklch(0.65 0.21 25 / 5%);padding:1rem"><div style="display:flex;gap:0.5rem;margin-bottom:0.5rem">' + '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--destructive)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="14.5 17.5 3 6 V3a1 1 0 0 1 1-1h17a1 1 0 0 1 1 1v3"/><path d="M3 6l7 7"/></svg>' + '<h3 class="text-sm font-semibold text-destructive">Red-team takeaways</h3></div><ul style="list-style:none;display:flex;flex-direction:column;gap:0.375rem">' + redHtml + '</ul></div>' +
        '</div>' +
        '<div><div style="display:flex;gap:0.5rem;margin-bottom:0.75rem">' + ICONS.bookOpen.replace('currentColor','var(--primary)') + '<h3 class="text-sm font-semibold">Official references</h3></div><div style="display:flex;flex-wrap:wrap;gap:0.5rem">' + linksHtml + '</div></div>' +
      '</section>';
  }

  // ============================================================
  // COMPLETION MODAL (C7) — with R8 focus areas
  // ============================================================
  function renderCompletionModal(mode) {
    var objectives = D.OBJECTIVES.filter(function(o) { return o.mode === mode; });
    var quizQuestions = D.QUIZ.filter(function(q) { return q.mode === mode; });
    var s = Lab.state.getState();

    var completedObjs = objectives.filter(function(o) { return s.objectives[o.id] && s.objectives[o.id].status === "correct"; });
    var incompleteObjs = objectives.filter(function(o) { return !s.objectives[o.id] || s.objectives[o.id].status !== "correct"; });
    var quizCorrect = quizQuestions.filter(function(q) { var qs = s.quiz[q.id]; return qs && qs.selectedIndex === q.correctIndex; }).length;
    var quizWrong = quizQuestions.filter(function(q) { var qs = s.quiz[q.id]; return qs && qs.selectedIndex !== null && qs.selectedIndex !== q.correctIndex; });
    var totalPossible = objectives.reduce(function(sum, o) { return sum + o.points; }, 0) + quizQuestions.length * 5;
    var earned = completedObjs.reduce(function(sum, o) { return sum + o.points; }, 0) + quizCorrect * 5;
    var pct = totalPossible > 0 ? Math.round((earned / totalPossible) * 100) : 0;
    var stars = Lab.objectives.computeStars(objectives, s.objectives, s.hintsUsedTotal, quizCorrect, quizQuestions.length);

    // Focus areas (R8)
    var focusAreas = [];
    var pillarMisses = {};
    incompleteObjs.forEach(function(o) { pillarMisses[o.pillar] = (pillarMisses[o.pillar] || 0) + 1; });
    var pillarNames = { P1:"Understand (vocabulary & framework)", P2:"Recognize (control classification)", P3:"Detect (coverage & failure analysis)", P4:"Mitigate (control design & sequencing)" };
    Object.keys(pillarMisses).forEach(function(p) {
      var count = pillarMisses[p];
      focusAreas.push({ area: pillarNames[p] + " — " + count + " objective" + (count > 1 ? "s" : "") + " not completed", detail: "You missed " + count + " objective" + (count > 1 ? "s" : "") + " in the " + pillarNames[p] + " pillar.", action: "Revisit the " + pillarNames[p] + " objectives and the related Knowledge Core card." });
    });
    if (quizWrong.length > 0) {
      var topics = quizWrong.map(function(q) {
        if (q.id === "Q-M1" || q.id === "Q-H7") return "category × function pairing";
        if (q.id === "Q-M2" || q.id === "Q-H1") return "function identification";
        if (q.id === "Q-M3" || q.id === "Q-H3") return "compensating control recognition";
        if (q.id === "Q-M4") return "CIA triad mapping";
        if (q.id === "Q-M5") return "deterrent vs preventive";
        if (q.id === "Q-M6") return "defense-in-depth rationale";
        if (q.id === "Q-H2") return "multi-control event analysis";
        if (q.id === "Q-H4") return "deterrent controls at data layer";
        if (q.id === "Q-H5") return "triage discipline";
        if (q.id === "Q-H6") return "control lifecycle sequencing";
        return "this topic";
      });
      focusAreas.push({ area: "Quiz gaps — " + quizWrong.length + " question" + (quizWrong.length > 1 ? "s" : "") + " answered wrong", detail: "You missed questions on: " + Array.from(new Set(topics)).join(", ") + ".", action: "Review the quiz explanations for " + quizWrong.map(function(q){return q.id;}).join(", ") + " in the Knowledge Check section." });
    }
    if (s.hintsUsedTotal > 6) {
      focusAreas.push({ area: "Hint dependency — heavy hint usage", detail: "You used " + s.hintsUsedTotal + " hints total.", action: "Try replaying objectives without hints to build recall speed." });
    }
    if (focusAreas.length === 0) {
      focusAreas.push({ area: "Mastery achieved — no gaps detected", detail: "You completed all " + objectives.length + " objectives and answered all " + quizQuestions.length + " quiz questions correctly.", action: "Move to Hard mode or advance to Lesson 1.2." });
    }

    var focusHtml = focusAreas.map(function(fa) {
      return '<div style="padding:0.625rem;border-radius:6px;border:1px solid oklch(0.32 0.012 250 / 40%);background:oklch(0.18 0.014 250 / 30%)"><p class="text-xs font-semibold">' + esc(fa.area) + '</p><p class="text-xs text-muted" style="margin-bottom:0.25rem">' + esc(fa.detail) + '</p><p class="text-xs" style="color:oklch(0.78 0.155 65 / 80%);display:flex;gap:0.25rem">' + ICONS.arrowRight + esc(fa.action) + '</p></div>';
    }).join("");

    // Pillar recap
    var recapHtml = ["P1","P2","P3","P4"].map(function(p) {
      var totalP = objectives.filter(function(o){return o.pillar===p;}).length;
      var doneP = objectives.filter(function(o){return o.pillar===p && s.objectives[o.id] && s.objectives[o.id].status==="correct";}).length;
      var pctP = totalP > 0 ? (doneP/totalP)*100 : 0;
      return '<div style="display:flex;align-items:center;gap:0.5rem"><span class="badge badge-outline mono" style="color:' + D.PILLAR_COLORS[p] + ';border-color:' + D.PILLAR_COLORS[p] + '50">' + D.PILLAR_LABELS[p] + '</span><div style="flex:1;height:6px;border-radius:3px;background:var(--muted);overflow:hidden"><div style="height:100%;border-radius:3px;width:' + pctP + '%;background:' + D.PILLAR_COLORS[p] + '"></div></div><span class="text-xs mono text-muted" style="width:2rem;text-align:right">' + doneP + '/' + totalP + '</span></div>';
    }).join("");

    var starsHtml = [1,2,3].map(function(s) {
      return '<span style="color:' + (s <= stars ? 'var(--primary)' : 'oklch(0.70 0.012 250 / 30%)') + '" ' + (s <= stars ? 'fill="currentColor"' : '') + '>' + ICONS.star.replace('fill="none"','fill="' + (s <= stars ? 'currentColor' : 'none') + '"').replace('stroke="currentColor"','stroke="' + (s <= stars ? 'var(--primary)' : 'oklch(0.70 0.012 250 / 30%)') + '"') + '</span>';
    }).join("");

    return '<div class="modal-overlay" id="completion-overlay">' +
      '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">' +
        '<div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.25rem">' +
          '<div style="width:2.5rem;height:2.5rem;border-radius:8px;background:oklch(0.78 0.155 65 / 15%);border:1px solid oklch(0.78 0.155 65 / 30%);display:flex;align-items:center;justify-content:center">' + ICONS.trophy.replace('currentColor','var(--primary)').replace('width="20"','width="20"') + '</div>' +
          '<div><h2 class="text-xl font-bold" id="modal-title">Lab complete</h2><p class="text-xs text-muted">' + (mode === "medium" ? "Medium mode" : "Hard mode") + ' · Controls Bridge · SY0-801 Lesson 1.1</p></div>' +
        '</div>' +
        '<div class="sm:grid-cols-2" style="display:grid;gap:0.75rem;margin:0.75rem 0;grid-template-columns:1fr">' +
          '<div style="border-radius:8px;border:1px solid var(--border);background:oklch(0.18 0.014 250 / 40%);padding:1rem"><p class="text-xs mono uppercase text-muted" style="margin-bottom:0.25rem">Score</p><p class="text-2xl font-bold">' + earned + '<span class="text-sm text-muted">/' + totalPossible + '</span></p><p class="text-xs text-muted" style="margin-top:0.25rem">' + pct + '% · ' + completedObjs.length + '/' + objectives.length + ' objectives · ' + quizCorrect + '/' + quizQuestions.length + ' quiz</p></div>' +
          '<div style="border-radius:8px;border:1px solid var(--border);background:oklch(0.18 0.014 250 / 40%);padding:1rem"><p class="text-xs mono uppercase text-muted" style="margin-bottom:0.25rem">Star rating</p><div style="display:flex;gap:0.25rem;margin-top:0.25rem">' + starsHtml + '<span class="text-xs text-muted" style="margin-left:0.5rem">' + (stars === 3 ? "Mastery" : stars === 2 ? "Solid" : "Keep practicing") + '</span></div><p class="text-xs text-muted" style="margin-top:0.375rem">Based on accuracy (' + Math.round((completedObjs.length/objectives.length)*100) + '% objs, ' + Math.round((quizCorrect/quizQuestions.length)*100) + '% quiz) and hint usage (' + s.hintsUsedTotal + ').</p></div>' +
        '</div>' +
        '<div style="border-radius:8px;border:1px solid var(--border);background:oklch(0.18 0.014 250 / 30%);padding:1rem;margin-bottom:0.75rem"><p class="text-xs mono uppercase text-muted" style="margin-bottom:0.5rem">Objective recap by pillar</p><div style="display:flex;flex-direction:column;gap:0.5rem">' + recapHtml + '</div></div>' +
        '<div style="border-radius:8px;border:1px solid oklch(0.78 0.155 65 / 30%);background:oklch(0.78 0.155 65 / 5%);padding:1rem;margin-bottom:0.75rem"><p class="text-xs mono uppercase" style="color:oklch(0.78 0.155 65 / 80%);margin-bottom:0.5rem">Focus areas — where to study more</p><div style="display:flex;flex-direction:column;gap:0.625rem">' + focusHtml + '</div></div>' +
        '<div style="display:flex;gap:0.5rem;justify-content:flex-end;padding-top:0.5rem;border-top:1px solid oklch(0.32 0.012 250 / 50%)">' +
          '<button class="btn btn-outline btn-sm" data-action="reset-lab">' + ICONS.rotateCcw + ' Reset lab</button>' +
          '<button class="btn btn-sm" data-action="close-modal">' + ICONS.close + ' Close</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  // ============================================================
  // GLOSSARY DRAWER
  // ============================================================
  function renderGlossaryDrawer() {
    var termsHtml = D.GLOSSARY.map(function(g) {
      var relatedHtml = (g.related || []).map(function(r) { return '<span class="badge badge-outline mono">' + esc(r) + '</span>'; }).join("");
      return '<div style="padding:0.75rem;border-radius:6px;border:1px solid var(--border);background:oklch(0.215 0.016 250 / 40%)"><p class="text-sm font-semibold">' + esc(g.term) + '</p><p class="text-xs text-muted" style="line-height:1.5">' + esc(g.definition) + '</p>' + (relatedHtml ? '<div style="display:flex;flex-wrap:wrap;gap:0.25rem;margin-top:0.5rem">' + relatedHtml + '</div>' : '') + '</div>';
    }).join("");

    return '<div class="overlay hidden" id="glossary-overlay" data-action="close-glossary"></div>' +
      '<div class="glossary-drawer" id="glossary-drawer" role="dialog" aria-modal="true" aria-labelledby="glossary-title">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:1rem;border-bottom:1px solid var(--border)">' +
          '<h2 class="text-sm font-semibold" id="glossary-title" style="display:flex;align-items:center;gap:0.5rem">' + ICONS.bookMarked.replace('currentColor','var(--primary)') + ' Glossary — ' + D.GLOSSARY.length + ' terms</h2>' +
          '<button class="btn btn-ghost btn-icon-sm" data-action="close-glossary" aria-label="Close glossary">' + ICONS.close + '</button>' +
        '</div>' +
        '<div style="padding:1rem">' +
          '<div style="position:relative;margin-bottom:1rem"><span style="position:absolute;left:0.625rem;top:50%;transform:translateY(-50%);color:var(--muted-fg)">' + ICONS.search + '</span><input type="text" id="glossary-search" placeholder="Search terms…" class="textarea" style="height:2.25rem;padding-left:2rem;font-size:0.75rem" aria-label="Search glossary"></div>' +
          '<div id="glossary-list" style="display:flex;flex-direction:column;gap:0.75rem">' + termsHtml + '</div>' +
        '</div>' +
      '</div>';
  }

  // ============================================================
  // TUTOR PANEL (Medium only)
  // ============================================================
  function renderTutorPanel() {
    return '<div class="fab fab-tutor" id="tutor-fab" data-action="toggle-tutor" aria-label="Open offline tutor" aria-expanded="false">' +
      ICONS.bot +
      '<span class="fab-tutor-text">Offline Tutor</span>' +
    '</div>' +
    '<div class="tutor-panel hidden" id="tutor-panel" role="dialog" aria-label="Offline Tutor chat">' +
      '<div style="display:flex;align-items:center;gap:0.5rem;padding:0.75rem;border-bottom:1px solid var(--border);background:oklch(0.18 0.014 250 / 40%)">' +
        '<div style="width:1.75rem;height:1.75rem;border-radius:50%;background:oklch(0.78 0.155 65 / 15%);border:1px solid oklch(0.78 0.155 65 / 30%);display:flex;align-items:center;justify-content:center">' + ICONS.bot.replace('currentColor','var(--primary)').replace('width="20"','width="16"') + '</div>' +
        '<div style="flex:1;min-width:0"><p class="text-xs font-semibold">Offline Tutor</p><p class="text-xs text-muted">Built-in helper · never gives direct answers</p></div>' +
        '<button class="btn btn-ghost btn-icon-sm" data-action="toggle-tutor" aria-label="Close tutor">' + ICONS.close + '</button>' +
      '</div>' +
      '<div id="tutor-messages" style="flex:1;overflow-y:auto;padding:0.75rem;display:flex;flex-direction:column;gap:0.625rem" aria-live="polite">' +
        '<div style="display:flex;gap:0.5rem"><div style="width:1.5rem;height:1.5rem;border-radius:50%;background:oklch(0.78 0.155 65 / 15%);border:1px solid oklch(0.78 0.155 65 / 30%);display:flex;align-items:center;justify-content:center;flex-shrink:0">' + ICONS.sparkle.replace('currentColor','var(--primary)').replace('width="12"','width="10"') + '</div><div style="max-width:80%;padding:0.625rem;border-radius:8px;background:oklch(0.18 0.014 250 / 60%);border:1px solid var(--border);font-size:0.75rem;line-height:1.5">Hi — I\'m your built-in offline tutor for Medium mode. I can give definitions, walk through analogous examples, or ask you a guiding question. I won\'t give direct answers — that would defeat the practice. What are you stuck on?</div></div>' +
      '</div>' +
      '<div style="padding:0.625rem;border-top:1px solid var(--border);background:oklch(0.18 0.014 250 / 40%)">' +
        '<div style="display:flex;gap:0.375rem"><input type="text" id="tutor-input" class="textarea" style="height:2rem;flex:1;font-size:0.75rem" placeholder="Ask a guiding question…" maxlength="500" aria-label="Type your question"><button class="btn btn-icon-sm" data-action="tutor-send" aria-label="Send question">' + ICONS.send + '</button></div>' +
        '<p class="text-xs text-muted" style="margin-top:0.375rem;text-align:center">Educational guidance only · won\'t give direct answers · <span id="tutor-char-count">0</span>/500</p>' +
      '</div>' +
    '</div>';
  }

  // ============================================================
  // ARTIFACT POPOVER
  // ============================================================
  function renderArtifactPopover(controlId) {
    var ctl = D.CONTROLS.find(function(c) { return c.id === controlId; });
    if (!ctl) return "";
    var artifactsHtml = ctl.artifacts.map(function(a) { return '<pre>' + esc(a) + '</pre>'; }).join("");
    return '<div class="popover" id="artifact-popover" role="dialog" aria-label="Artifacts for ' + esc(ctl.name) + '">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem"><p class="text-xs mono uppercase" style="color:oklch(0.78 0.155 65 / 80%)">Evidence · ' + ctl.id + '</p><button class="btn btn-ghost btn-icon-sm" data-action="close-popover" aria-label="Close">' + ICONS.close + '</button></div>' +
      '<p class="text-xs text-muted italic" style="margin-bottom:0.5rem">' + esc(ctl.meridianExample) + '</p>' +
      '<div style="display:flex;flex-direction:column;gap:0.375rem">' + artifactsHtml + '</div>' +
      '<p class="text-xs text-muted" style="padding-top:0.25rem;margin-top:0.25rem;border-top:1px solid oklch(0.32 0.012 250 / 40%)">' + esc(ctl.fullDesc) + '</p>' +
    '</div>';
  }

  return {
    renderModeSelection: renderModeSelection,
    renderHeader: renderHeader,
    renderBriefing: renderBriefing,
    renderKnowledgeCore: renderKnowledgeCore,
    renderBridge: renderBridge,
    renderObjectivesTracker: renderObjectivesTracker,
    renderQuiz: renderQuiz,
    renderDebrief: renderDebrief,
    renderCompletionModal: renderCompletionModal,
    renderGlossaryDrawer: renderGlossaryDrawer,
    renderTutorPanel: renderTutorPanel,
    renderArtifactPopover: renderArtifactPopover,
    ICONS: ICONS,
    esc: esc,
  };
})();
