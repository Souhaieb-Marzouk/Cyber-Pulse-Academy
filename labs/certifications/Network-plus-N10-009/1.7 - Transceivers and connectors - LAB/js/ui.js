// ─────────────────────────────────────────────────────────────────────────────
// THE PATCH BENCH — js/ui.js
// Rendering layer: connector glyphs (inline SVG), Lucide icon paths (inline
// SVG), and one template function per view region. Ported from
// src/components/lab17/{Glyphs,Chrome,Clipboard,widgets,Bench}.tsx.
// All templates return HTML strings; app.js mounts them and owns events.
// ─────────────────────────────────────────────────────────────────────────────

// ── Utilities ────────────────────────────────────────────────────────────────

/** Escape a dynamic string for safe interpolation into HTML. */
function esc(v) {
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ── Connector glyphs (48×48 viewBox, stroke = currentColor) ─────────────────

const GLYPH_PATHS = {
  SC: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="10" y="14" width="24" height="22" rx="2"/><rect x="14" y="20" width="7" height="10" rx="1"/><path d="M34 16 h6 v8 h-6"/><path d="M17 14 v-3 h6 v3"/><path d="M38 24 v8 h-4"/></g>',
  LC: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="16" width="18" height="16" rx="2"/><rect x="18" y="21" width="5" height="7" rx="1"/><path d="M32 30 l8 4"/><path d="M20 16 v-3 h5 v3"/></g>',
  ST: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="24" r="12"/><circle cx="24" cy="24" r="4"/><path d="M12 19 l-4 -2 M12 29 l-4 2 M36 19 l4 -2 M36 29 l4 2"/><path d="M24 12 v-4"/></g>',
  MPO: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="16" width="36" height="18" rx="2"/><path d="M6 16 v-5 h6"/><circle cx="10" cy="25" r="1.6" fill="currentColor" stroke="none"/><circle cx="14" cy="25" r="1.6" fill="currentColor" stroke="none"/><circle cx="18" cy="25" r="1.6" fill="currentColor" stroke="none"/><circle cx="22" cy="25" r="1.6" fill="currentColor" stroke="none"/><circle cx="26" cy="25" r="1.6" fill="currentColor" stroke="none"/><circle cx="30" cy="25" r="1.6" fill="currentColor" stroke="none"/><circle cx="34" cy="25" r="1.6" fill="currentColor" stroke="none"/><circle cx="38" cy="25" r="1.6" fill="currentColor" stroke="none"/><circle cx="10" cy="20" r="1.6" fill="currentColor" stroke="none"/><circle cx="14" cy="20" r="1.6" fill="currentColor" stroke="none"/><circle cx="18" cy="20" r="1.6" fill="currentColor" stroke="none"/><circle cx="22" cy="20" r="1.6" fill="currentColor" stroke="none"/><circle cx="26" cy="20" r="1.6" fill="currentColor" stroke="none"/><circle cx="30" cy="20" r="1.6" fill="currentColor" stroke="none"/><circle cx="34" cy="20" r="1.6" fill="currentColor" stroke="none"/><circle cx="38" cy="20" r="1.6" fill="currentColor" stroke="none"/></g>',
  RJ45: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="10" y="18" width="28" height="18" rx="2"/><path d="M16 18 v-5 h4 v5 M24 18 v-5 h4 v5"/><path d="M14 24 v4"/><path d="M18 24 v4"/><path d="M22 24 v4"/><path d="M26 24 v4"/><path d="M30 24 v4"/><path d="M34 24 v4"/></g>',
  RJ11: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="16" y="18" width="16" height="18" rx="2"/><path d="M21 18 v-5 h3 v5"/><path d="M22 24 v4"/><path d="M26 24 v4"/></g>',
  FTYPE: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 22 l4 -6 h12 l4 6 z"/><rect x="12" y="22" width="24" height="6" rx="1"/><path d="M18 28 v3 M22 28 v3 M26 28 v3 M30 28 v3"/><circle cx="24" cy="18" r="1.5" fill="currentColor" stroke="none"/></g>',
  BNC: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="24" r="12"/><circle cx="24" cy="24" r="2.5" fill="currentColor" stroke="none"/><path d="M13 18 l-4 -3 M35 18 l4 -3"/><path d="M24 36 v4"/></g>',
  GBIC: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="14" width="36" height="22" rx="2"/><rect x="10" y="19" width="8" height="12" rx="1"/><rect x="30" y="19" width="8" height="12" rx="1"/><path d="M22 19 h6 M22 24 h6 M22 29 h6"/></g>',
  SFP: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="16" width="32" height="18" rx="2"/><rect x="11" y="20" width="6" height="10" rx="1"/><rect x="31" y="20" width="6" height="10" rx="1"/><path d="M21 21 h6 M21 26 h6 M21 31 h6"/></g>',
  SFPPLUS: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="16" width="32" height="18" rx="2"/><rect x="11" y="20" width="6" height="10" rx="1"/><rect x="31" y="20" width="6" height="10" rx="1"/><path d="M21 21 h6 M21 26 h6 M21 31 h6"/><path d="M25 10 v6 M22 13 h6"/></g>',
  SFP28: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="16" width="32" height="18" rx="2"/><rect x="11" y="20" width="6" height="10" rx="1"/><rect x="31" y="20" width="6" height="10" rx="1"/><path d="M21 21 h6 M21 26 h6 M21 31 h6"/><text x="24" y="13" text-anchor="middle" font-size="8" fill="currentColor" stroke="none" font-family="monospace">25G</text></g>',
  QSFPPLUS: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="16" width="40" height="18" rx="2"/><rect x="8" y="20" width="7" height="10" rx="1"/><rect x="33" y="20" width="7" height="10" rx="1"/><path d="M20 21 h3 M20 26 h3 M25 21 h3 M25 26 h3"/><path d="M25 10 v6 M22 13 h6"/></g>',
  QSFP28: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="16" width="40" height="18" rx="2"/><rect x="8" y="20" width="7" height="10" rx="1"/><rect x="33" y="20" width="7" height="10" rx="1"/><path d="M20 21 h3 M20 26 h3 M25 21 h3 M25 26 h3"/><text x="24" y="13" text-anchor="middle" font-size="8" fill="currentColor" stroke="none" font-family="monospace">100G</text></g>',
  LC_CORD: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 34 C 14 26, 34 26, 44 34" stroke-dasharray="4 3"/><rect x="6" y="16" width="12" height="10" rx="1.5"/><rect x="30" y="16" width="12" height="10" rx="1.5"/><path d="M9 26 v3 M36 26 v3"/></g>',
  LC_CORD_SM: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 34 C 14 26, 34 26, 44 34" stroke-dasharray="4 3"/><rect x="6" y="16" width="12" height="10" rx="1.5"/><rect x="30" y="16" width="12" height="10" rx="1.5"/><path d="M9 26 v3 M36 26 v3"/><text x="24" y="14" text-anchor="middle" font-size="8" fill="currentColor" stroke="none" font-family="monospace">SM</text></g>',
  MPO_CORD: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 36 C 14 30, 34 30, 44 36" stroke-dasharray="4 3"/><rect x="4" y="16" width="16" height="11" rx="1.5"/><rect x="28" y="16" width="16" height="11" rx="1.5"/><circle cx="8" cy="21" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="21" r="1" fill="currentColor" stroke="none"/><circle cx="16" cy="21" r="1" fill="currentColor" stroke="none"/><circle cx="32" cy="21" r="1" fill="currentColor" stroke="none"/><circle cx="36" cy="21" r="1" fill="currentColor" stroke="none"/><circle cx="40" cy="21" r="1" fill="currentColor" stroke="none"/></g>',
  jack8: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 3"><rect x="14" y="16" width="20" height="18" rx="2"/><path d="M17 26 h14"/></g>',
  jack6: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 3"><rect x="18" y="16" width="12" height="18" rx="2"/><path d="M20 26 h8"/></g>',
  coaxThread: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 3"><circle cx="24" cy="24" r="10"/><path d="M18 24 h12"/></g>',
  coaxBayonet: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 3"><circle cx="24" cy="24" r="10"/><path d="M15 18 l-3 -2 M33 18 l3 -2"/></g>',
  scAdapter: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 3"><rect x="14" y="16" width="20" height="16" rx="2"/></g>',
  lcAdapter: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 3"><rect x="17" y="18" width="14" height="12" rx="2"/></g>',
  stAdapter: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 3"><circle cx="24" cy="24" r="9"/></g>',
  mpoAdapter: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 3"><rect x="8" y="18" width="32" height="12" rx="2"/></g>',
  cageSfp: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 3"><rect x="8" y="17" width="32" height="14" rx="2"/><path d="M36 20 h4 M36 28 h4"/></g>',
  cageQsfp: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 3"><rect x="5" y="17" width="38" height="14" rx="2"/><path d="M39 20 h3 M39 28 h3"/></g>',
};

function glyph(name, cls) {
  const node = GLYPH_PATHS[name] || "";
  return `<svg viewBox="0 0 48 48" class="${cls || "glyph-32"}" role="img" aria-hidden="true" focusable="false">${node}</svg>`;
}

// ── Lucide icons (exact path data from lucide-react v0.525.0, ISC) ──────────

const ICON_PATHS = {
  "badge-check": '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>',
  "circle-check": '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  "circle-x": '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
  clock: '<path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10"/>',
  crosshair: '<circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/>',
  "graduation-cap": '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
  "hard-hat": '<path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/><path d="M14 6a6 6 0 0 1 6 6v3"/><path d="M4 15v-3a6 6 0 0 1 6-6"/><rect x="2" y="15" width="20" height="4" rx="1"/>',
  "rotate-ccw": '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 1 1.597-1.16z"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  "book-open": '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  "chevron-down": '<path d="m6 9 6 6 6-6"/>',
  "clipboard-list": '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
  "external-link": '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  lightbulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  "scroll-text": '<path d="M15 12h-5"/><path d="M15 8h-5"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/>',
  hand: '<path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  "arrow-down": '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
  "arrow-up": '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  flag: '<path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528"/>',
};

/**
 * Inline Lucide icon. size = px (lucide default 24); extra classes travel in cls.
 * fillOpt: optional fill override (used by the Star rating).
 */
function icon(name, size, cls, opts) {
  const s = size || 16;
  const o = opts || {};
  const fill = o.fill !== undefined ? o.fill : "none";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="${fill}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls || ""}" aria-hidden="true" focusable="false">${ICON_PATHS[name] || ""}</svg>`;
}

// ── Clock-in (mode select + C1 scenario) ─────────────────────────────────────

function viewClockIn() {
  const modes = [
    {
      mode: "medium",
      name: "APPRENTICE",
      icon: icon("graduation-cap", 24),
      lines: [
        "12 guided work orders, one at a time",
        "\u201cWhere to look\u201d on every order · 3-tier hints",
        "Tolerant checks with full teaching feedback",
        "6-question concept exam afterward",
      ],
      cta: "Clock in as apprentice",
    },
    {
      mode: "hard",
      name: "JOURNEYMAN",
      icon: icon("hard-hat", 24),
      lines: [
        "10 broad orders, all open at once",
        "Noisy evidence with planted red herrings",
        "Strict checks: exact specs, sets and sequences",
        "7-question scenario board · 1 nudge total",
      ],
      cta: "Clock in as journeyman",
    },
  ];
  return `
  <main class="clockin" data-testid="clockin">
    <header class="clockin-header">
      <p class="clockin-kicker">Northgate Cabling Co. — Training Bench 7</p>
      <h1 class="clockin-title">THE PATCH BENCH</h1>
      <p class="clockin-sub">CompTIA Network+ N10-009 · Domain 1 · Objective 1.7 — Transceivers and connectors: SC, LC, ST, MPO, RJ11, RJ45, F-type, BNC</p>
    </header>

    <div class="alert alert-clockin" role="alert">
      ${icon("clock", 16, "alert-icon")}
      <div class="alert-title" role="heading" aria-level="3">Monday, 06:45 — the foreman pins three tickets to your clipboard</div>
      <div class="alert-desc">
        You're the new bench tech at Northgate Cabling Co. (a fictional training employer). Today's board is a
        full comms room: copper service drops, a fiber patch panel, switch uplinks and a 100G spine trunk — and
        every ticket wants the <strong>right connector or transceiver</strong>. Seat them, cord them, verify the
        links, and you'll leave able to name, recognize, choose and troubleshoot every part of objective 1.7 —
        the exact skills the N10-009 exam tests.
      </div>
    </div>

    <div class="mode-grid">
      ${modes
        .map(
          (m) => `
      <button type="button" class="mode-card" data-testid="mode-${m.mode}" data-act="clockin" data-mode="${m.mode}" data-fk="mode-${m.mode}" aria-label="${m.name} mode: ${m.cta}">
        <span class="mode-head">${m.icon}
          <span class="mode-name">${m.name}</span>
          <span class="mode-badge">${m.mode === "medium" ? "MEDIUM" : "HARD"}</span>
        </span>
        <ul class="mode-lines">
          ${m.lines.map((l) => `<li>${icon("circle-check", 16, "mode-li-icon")}<span>${esc(l)}</span></li>`).join("")}
        </ul>
        <span class="mode-cta">${m.cta.toUpperCase()}</span>
      </button>`
        )
        .join("")}
    </div>
    <p class="clockin-foot">100% educational · synthetic training data only · progress auto-saves to this browser · RESET available on the job board</p>
  </main>`;
}

// ── Job board strip ──────────────────────────────────────────────────────────

function firstUndoneId(s) {
  const list = objectiveList(s);
  for (const o of list) if (!prog(s, o.id).done) return o.id;
  return null;
}

function viewJobBoard(s) {
  const list = objectiveList(s);
  const done = doneCount(s);
  const pillars = pillarStats(s);
  const ready = allObjectivesDone(s) && s.quizSubmitted;
  const firstUndone = firstUndoneId(s);
  return `
  <header class="jobboard" data-testid="jobboard">
    <div class="jobboard-inner">
      <div class="jobboard-brand">
        <p class="jobboard-name">NORTHGATE CABLING CO. <span class="jobboard-bench">· bench 7</span></p>
        <p class="jobboard-meta">N10-009 Obj 1.7 · transceivers &amp; connectors · ${s.mode === "medium" ? "APPRENTICE" : "JOURNEYMAN"} shift</p>
      </div>
      <div class="jobboard-perfos" aria-label="Work orders: ${done} of ${list.length} signed off">
        ${list
          .map((o) => {
            const st = prog(s, o.id);
            const cls = st.done ? "perfo done" : firstUndone === o.id ? "perfo next" : "perfo";
            return `<span class="${cls}" title="${esc(o.wo + " " + o.title + (st.done ? " — signed off" : ""))}" data-testid="perfo-${o.id}"></span>`;
          })
          .join("")}
        <span class="jobboard-count" data-testid="progress-count">${done}/${list.length}</span>
      </div>
      <div class="jobboard-pillars" aria-label="Pillar progress">
        ${pillars.map((p) => `<span class="pillar-chip">${p.pillar} ${p.done}/${p.total}</span>`).join("")}
      </div>
      <div class="jobboard-actions">
        ${ready ? `<button type="button" class="btn btn-signoff" data-testid="request-signoff" data-act="signoff-open" data-fk="request-signoff">${icon("badge-check", 16, "mr-4")} REQUEST SIGN-OFF</button>` : ""}
        <button type="button" class="btn btn-reset" data-testid="reset-button" data-act="reset-open" data-fk="reset-button">${icon("rotate-ccw", 14, "mr-4")} RESET</button>
      </div>
    </div>
  </header>`;
}

// ── Reset confirmation dialog ────────────────────────────────────────────────

function viewResetDialog() {
  return `
  <div class="overlay overlay-reset" data-act="reset-overlay"></div>
  <div class="dialog" role="alertdialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-desc" data-testid="reset-dialog">
    <div class="dialog-head">
      <h2 class="dialog-title" id="reset-title">Punch out and clear the bench?</h2>
      <p class="dialog-desc" id="reset-desc">This wipes all progress, seatings, answers and the exam — back to the clock-in screen. There is no undo.</p>
    </div>
    <div class="dialog-foot">
      <button type="button" class="btn btn-outline" data-testid="reset-cancel" data-act="reset-close" data-fk="reset-cancel" data-autofocus>Keep working</button>
      <button type="button" class="btn btn-destructive" data-testid="reset-confirm" data-act="reset-confirm" data-fk="reset-confirm">Reset everything</button>
    </div>
  </div>`;
}

// ── Inspector spec sheet ─────────────────────────────────────────────────────

function viewInspector(s) {
  const part = s.inspector ? PART_BY_ID[s.inspector] : null;
  if (!part) return "";
  return `
  <div class="inspector-overlay" aria-hidden="true" data-act="inspect-close" data-testid="inspector-overlay"></div>
  <div class="sheet" role="dialog" aria-label="Spec sheet: ${esc(part.code)}" data-ps="sheet" data-testid="inspector">
    <div class="sheet-head">
      <div class="sheet-id">
        <span class="sheet-glyphbox">${glyph(part.id, "glyph-40")}</span>
        <div>
          <p class="sheet-code">${esc(part.code)}</p>
          <p class="sheet-name">${esc(part.name)}</p>
        </div>
      </div>
      <button type="button" class="btn btn-sheet-close" data-testid="inspector-close" data-act="inspect-close" data-fk="inspector-close" data-autofocus aria-label="Close spec sheet">close</button>
    </div>
    <p class="sheet-tagline">${esc(part.tagline)}</p>
    <table class="sheet-specs">
      <tbody>
        ${part.specs
          .map(
            ([k, v]) =>
              `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`
          )
          .join("")}
      </tbody>
    </table>
    <div class="sheet-meta">
      <p><span class="sheet-label">Typical use:</span>${esc(part.use)}</p>
      <p><span class="sheet-label">Field status:</span>${esc(part.status)}</p>
      <p class="sheet-tip">${icon("info", 14, "tip-icon")}${esc(part.tip)}</p>
    </div>
  </div>`;
}

// ── Sign-off modal (C7) ──────────────────────────────────────────────────────

function focusAreas(s) {
  const out = [];
  const list = objectiveList(s);
  const retried = list.filter((o) => (prog(s, o.id).attempts || 0) > 0 && prog(s, o.id).done);
  for (const o of retried) {
    out.push({
      area: `${o.wo} · ${o.title}`,
      detail: `needed ${prog(s, o.id).attempts + 1} checks — re-walk this one once more before exam day.`,
    });
  }
  const hinted = list.filter((o) => prog(s, o.id).hints > 0 && prog(s, o.id).done);
  for (const o of hinted) {
    out.push({ area: `${o.wo} · ${o.title}`, detail: "used a hint — try the next similar call-out without one." });
  }
  if (s.quizSubmitted) {
    const missed = quizQuestions(s).filter((q) => s.quiz[q.id] !== q.correct);
    for (const q of missed) {
      out.push({ area: q.topic, detail: "exam question missed here — re-read its explanation, then the matching site-manual section." });
    }
  }
  return out;
}

function viewSignOff(s) {
  if (!s.signOffOpen) return "";
  const stars = starRating(s);
  const score = quizScore(s);
  const pillars = pillarStats(s);
  const areas = focusAreas(s);
  const areasHtml =
    areas.length === 0
      ? `<p class="focus-clean">Clean sheet: every order first-check, no hints, no exam misses. To stay sharp, drill connector recognition from real hardware photos — shape recognition decays fastest.</p>`
      : `<ul class="focus-list">${areas
          .map(
            (a, i) =>
              `<li><span class="focus-key">▸ ${esc(a.area)}:</span> ${esc(a.detail)}</li>`
          )
          .join("")}</ul>`;
  return `
  <div class="overlay overlay-modal" data-act="signoff-overlay"></div>
  <div class="dialog dialog-signoff" role="dialog" aria-modal="true" aria-labelledby="signoff-title" aria-describedby="signoff-desc" data-testid="signoff-modal" data-ps="signoff">
    <div class="dialog-head">
      <h2 class="signoff-title" id="signoff-title">Foreman's sign-off</h2>
      <p class="dialog-desc" id="signoff-desc">${s.mode === "medium" ? "Apprentice shift" : "Journeyman shift"} — Northgate Cabling Co., objective 1.7</p>
    </div>

    <div class="stamp" aria-hidden="true">
      <p class="stamp-big">SIGNED OFF</p>
      <p class="stamp-small">every order · exam filed</p>
    </div>

    <div class="stars" role="img" aria-label="${stars} of 3 stars" data-testid="stars">
      ${[1, 2, 3]
        .map((n) => icon("star", 32, n <= stars ? "star-icon lit" : "star-icon", { fill: n <= stars ? "#F0B429" : "none" }))
        .join("")}
    </div>
    <p class="stars-caption">stars = first-attempt accuracy + hint discipline · exam ${score.correct}/${score.total}</p>

    <div class="recap">
      <p class="recap-label">Order recap by pillar</p>
      ${pillars
        .map(
          (p) => `
      <div class="recap-box">
        <p class="recap-pillar">${p.pillar} · ${p.done}/${p.total} signed</p>
        <ul class="recap-list">
          ${objectiveList(s)
            .filter((o) => o.pillar === p.pillar)
            .map((o) => {
              const d = prog(s, o.id).done;
              return `<li>${icon("circle-check", 14, d ? "recap-check done" : "recap-check")}<span class="${d ? "" : "dim"}">${esc(o.wo)} — ${esc(o.title)}</span></li>`;
            })
            .join("")}
        </ul>
      </div>`
        )
        .join("")}
    </div>

    <div class="focus-box" data-testid="focus-areas">
      <p class="focus-label">${icon("crosshair", 14)} Focus areas — from your own sheet</p>
      ${areasHtml}
    </div>

    <div class="next-box">
      <p class="next-label">Where to go next</p>
      <ul class="next-list">
        ${NEXT_STEPS.slice(0, 3)
          .map((n) => `<li>▸ ${esc(n)}</li>`)
          .join("")}
      </ul>
    </div>

    <div class="signoff-actions">
      <button type="button" class="btn btn-outline btn-44" data-testid="signoff-close" data-act="signoff-close" data-fk="signoff-close" data-autofocus>Keep exploring the bench</button>
      <button type="button" class="btn btn-dark btn-44" data-testid="signoff-reset" data-act="signoff-reset" data-fk="signoff-reset">${icon("rotate-ccw", 14, "mr-4")} New work day</button>
    </div>
    <button type="button" class="dialog-x" data-act="signoff-close" aria-label="Close">${icon("x", 16)}<span class="sr-only">Close</span></button>
  </div>`;
}

// ── Toast + announcer ────────────────────────────────────────────────────────

function viewToasts(s) {
  if (!s.toast) return "";
  const tone = s.toast.kind === "ok" ? "toast-ok" : s.toast.kind === "bad" ? "toast-bad" : "toast-info";
  return `
  <div class="toast ${tone}" role="${s.toast.kind === "bad" ? "alert" : "status"}" data-testid="toast">
    <div class="toast-row">
      <span class="toast-text">${esc(s.toast.text)}</span>
      <button type="button" data-act="toast-dismiss" data-fk="toast-dismiss" aria-label="Dismiss message" class="toast-x">${icon("x", 16)}</button>
    </div>
  </div>`;
}

function viewAnnouncer(s) {
  return `<div aria-live="polite" role="status" class="sr-only">${esc(s.announce)}</div>`;
}

// ── Clipboard constants ──────────────────────────────────────────────────────

const PILLAR_LABEL = {
  P1: "P1 · Understand",
  P2: "P2 · Recognize",
  P3: "P3 · Verify & troubleshoot",
  P4: "P4 · Select & care",
};

const H6_PRESENTATION = ["h6c", "h6a", "h6e", "h6b", "h6d"]; // fixed scrambled presentation order

// Live checklist state for bench objectives (same formulas as the original)
function benchChecklistStates(obj, s) {
  const seat = (port, part) => s.seated[port] === part;
  switch (obj.id) {
    case "OBJ-M4":
      return [seat("DATA1", "RJ45"), seat("VOICE1", "RJ11"), seat("CATV1", "FTYPE"), seat("CAM1", "BNC")];
    case "OBJ-M5":
      return [seat("BBSC", "SC"), seat("LEGST", "ST"), seat("UPLKLC", "LC"), seat("TRKMPO", "MPO")];
    case "OBJ-M9":
      return [
        seat("CAGEA", "SFPPLUS"),
        seat("CAGEB", "SFPPLUS"),
        s.lcCordA !== null && s.lcCordB !== null && s.lcCordKind === "LC_CORD",
        s.links["10G-A↔B"] && s.links["10G-A↔B"].state === "up",
      ];
    case "OBJ-H10":
      return [
        seat("DATA1", "RJ45") && seat("VOICE1", "RJ11") && seat("CATV1", "FTYPE") && seat("CAM1", "BNC"),
        seat("BBSC", "SC") && seat("LEGST", "ST") && seat("UPLKLC", "LC") && seat("TRKMPO", "MPO"),
        seat("CAGEA", "SFPPLUS") && seat("CAGEB", "SFPPLUS") && s.lcCordA !== null && s.lcCordB !== null && s.lcCordKind === "LC_CORD",
        seat("CAGEQ", "QSFP28") && s.mpoTrunk,
        s.links["10G-A↔B"] && s.links["10G-A↔B"].state === "up" && s.links["100G-Q"] && s.links["100G-Q"].state === "up",
      ];
    default:
      return [];
  }
}

// ── Select control (native, styled like the Radix trigger) ───────────────────

function selectControl(key, value, options, ariaLabel, disabled, extraClass) {
  const opts = options
    .map((o) => `<option value="${esc(o.id)}" ${value === o.id ? "selected" : ""}>${esc(o.label)}</option>`)
    .join("");
  return `
  <span class="select-wrap ${extraClass || ""}">
    <select class="select" data-act="answer" data-key="${esc(key)}" data-fk="sel:${esc(key)}" data-empty="${value ? "0" : "1"}" aria-label="${esc(ariaLabel)}" ${disabled ? "disabled" : ""}>
      <option value="" disabled hidden ${value ? "" : "selected"}>Choose…</option>
      ${opts}
    </select>
    ${icon("chevron-down", 16, "select-chevron")}
  </span>`;
}

// ── Ticket widgets ───────────────────────────────────────────────────────────

function viewWidget(obj, s, ui, locked) {
  const w = obj.widget;
  if (w.type === "bench") {
    const checks = benchChecklistStates(obj, s);
    return `
    <ul class="bench-checks" aria-label="Work order ${obj.wo} live checklist">
      ${w.checklist
        .map(
          (label, i) => `
      <li class="bench-check">
        <span class="bench-check-box ${checks[i] ? "on" : ""}" aria-hidden="true">${icon("check", 14)}</span>
        <span data-testid="bench-check-${obj.id}-${i}" class="${checks[i] ? "" : "dim"}">${esc(label)}</span>
      </li>`
        )
        .join("")}
    </ul>`;
  }
  if (w.type === "sort") {
    const items = sessionShuffle(w.items, `${obj.id}:sort`);
    const picked = ui.sortPicked && ui.sortPicked.objId === obj.id ? ui.sortPicked.itemId : null;
    return `
    <div role="group" aria-label="Work order ${obj.wo} sorting task">
      <div class="sort-items">
        ${items
          .map((item) => {
            const assigned = s.answers[`${obj.id}:bin:${item.id}`];
            return `
          <button type="button" data-testid="sort-item-${item.id}" data-act="sort-pick" data-obj="${obj.id}" data-item="${item.id}" data-fk="sort-item-${item.id}"
            ${locked ? "disabled" : ""} aria-pressed="${picked === item.id}"
            class="sort-item ${picked === item.id ? "picked" : ""}">
            ${esc(item.label)}
            ${assigned ? `<span class="sort-badge ${assigned === "fiber" ? "fiber" : "copper"}">${esc(assigned)}</span>` : ""}
          </button>`;
          })
          .join("")}
      </div>
      <p class="sort-hint">${picked ? `Now click a bin to file \u201c${esc(picked)}\u201d — or click it again to cancel.` : esc(w.hint)}</p>
      <div class="sort-bins">
        ${w.bins
          .map(
            (bin) => `
        <button type="button" data-testid="sort-bin-${bin.id}" data-act="sort-bin" data-obj="${obj.id}" data-bin="${bin.id}" data-fk="sort-bin-${bin.id}"
          ${!picked || locked ? "disabled" : ""}
          class="sort-bin ${picked && !locked ? "armed" : ""}">${esc(bin.label)}</button>`
          )
          .join("")}
      </div>
    </div>`;
  }
  if (w.type === "match") {
    const rights = sessionShuffle(w.rights, `${obj.id}:match`);
    return `
    <div role="group" aria-label="Work order ${obj.wo} matching task" class="match-list">
      ${w.lefts
        .map((left) => {
          const val = typeof s.answers[`${obj.id}:${left.id}`] === "string" ? s.answers[`${obj.id}:${left.id}`] : "";
          return `
        <div class="match-row">
          <span class="match-left" data-testid="match-left-${left.id}">${esc(left.label)}</span>
          ${selectControl(`${obj.id}:${left.id}`, val, rights, `Match ${left.label}`, locked)}
        </div>`;
        })
        .join("")}
    </div>`;
  }
  if (w.type === "decision") {
    return `
    <div role="group" aria-label="Work order ${obj.wo} decisions" class="decision-list">
      ${w.items
        .map((item, idx) => {
          const opts = sessionShuffle(item.options, `${obj.id}:${item.id}`);
          const val = typeof s.answers[`${obj.id}:${item.id}`] === "string" ? s.answers[`${obj.id}:${item.id}`] : "";
          const secondary = item.secondary
            ? selectControl(
                `${obj.id}:${item.id}#2`,
                typeof s.answers[`${obj.id}:${item.id}#2`] === "string" ? s.answers[`${obj.id}:${item.id}#2`] : "",
                sessionShuffle(item.secondary.options, `${obj.id}:${item.id}#2`),
                `Medium choice for ${item.id}`,
                locked
              )
            : "";
          return `
        <div class="decision-item">
          <p class="decision-prompt"><span class="decision-num">${String(idx + 1).padStart(2, "0")}</span>${esc(item.prompt)}</p>
          ${item.evidence ? `<p class="decision-evidence">${esc(item.evidence)}</p>` : ""}
          <div class="decision-picks ${item.secondary ? "two" : ""}">
            ${selectControl(`${obj.id}:${item.id}`, val, opts, `Decision for ${item.id}`, locked)}
            ${secondary}
          </div>
        </div>`;
        })
        .join("")}
    </div>`;
  }
  if (w.type === "audit") {
    return `
    <div role="group" aria-label="Work order ${obj.wo} audit table" class="audit-wrap">
      <table class="audit-table">
        <thead>
          <tr>
            <th class="audit-flagcol"></th>
            <th>BOM line</th>
            <th class="audit-fixcol">Fix</th>
          </tr>
        </thead>
        <tbody>
          ${w.rows
            .map((row) => {
              const flagged = s.answers[`${obj.id}:flag:${row.id}`] === "1";
              const fixOpts = row.fix ? sessionShuffle(row.fix, `${obj.id}:${row.id}:fix`) : null;
              const fixVal = typeof s.answers[`${obj.id}:fix:${row.id}`] === "string" ? s.answers[`${obj.id}:fix:${row.id}`] : "";
              return `
              <tr class="${flagged ? "flagged" : ""}">
                <td class="audit-flagcol"><span class="audit-check"><input type="checkbox" data-testid="flag-${row.id}" data-act="answer-check" data-key="${obj.id}:flag:${row.id}" data-fk="flag-${row.id}" ${flagged ? "checked" : ""} ${locked ? "disabled" : ""} aria-label="${esc(w.flagLabel)}: ${esc(row.line)}" class="checkbox"></span></td>
                <td class="audit-line">${icon("flag", 12, flagged ? "audit-flag on" : "audit-flag")} ${esc(row.line)}</td>
                <td class="audit-fixcol">${fixOpts && flagged ? selectControl(`${obj.id}:fix:${row.id}`, fixVal, fixOpts, `Correction for line ${row.id}`, locked, "audit-fix-select") : ""}</td>
              </tr>`;
            })
            .join("")}
        </tbody>
      </table>
    </div>`;
  }
  if (w.type === "matrix") {
    const cellValue = (r, c) => s.answers[`${obj.id}:${r}:${c}`];
    return `
    <div role="group" aria-label="Work order ${obj.wo} compatibility matrix" class="matrix-wrap">
      <table class="matrix-table">
        <thead>
          <tr>
            <th class="matrix-corner">module ↓ · cage →</th>
            ${w.cols.map((c) => `<th class="matrix-col">${esc(c.label)}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${w.rows
            .map((r) => {
              return `
            <tr>
              <th class="matrix-row">${esc(r.label)}</th>
              ${w.cols
                .map((c) => {
                  const v = cellValue(r.id, c.id);
                  return `
                  <td class="matrix-cell">
                    <button type="button" data-testid="cell-${r.id}-${c.id}" data-act="matrix" data-obj="${obj.id}" data-r="${r.id}" data-c="${c.id}" data-fk="cell-${r.id}-${c.id}" ${locked ? "disabled" : ""}
                      class="matrix-btn ${v === "works" ? "works" : v === "fails" ? "fails" : ""}"
                      aria-label="${esc(r.label)} in ${esc(c.label)}: ${v === "works" ? "works" : v === "fails" ? "fails" : "unset"}">
                      ${v === "works" ? icon("check", 16) : v === "fails" ? icon("circle-x", 16) : "—"}
                    </button>
                  </td>`;
                })
                .join("")}
            </tr>`;
            })
            .join("")}
        </tbody>
      </table>
    </div>`;
  }
  if (w.type === "order") {
    const saved = s.answers[`${obj.id}:order`];
    const current =
      Array.isArray(saved) && saved.length === w.steps.length
        ? saved
        : H6_PRESENTATION.filter((id) => w.steps.some((st) => st.id === id));
    return `
    <div role="group" aria-label="Work order ${obj.wo} sequencing task" class="order-list">
      ${current
        .map((stepId, idx) => {
          const step = w.steps.find((st) => st.id === stepId);
          if (!step) return "";
          return `
        <div class="order-row">
          <span class="order-chip">${idx + 1}</span>
          <span class="order-label">${esc(step.label)}</span>
          <span class="order-arrows">
            <button type="button" data-testid="order-up-${stepId}" data-act="order" data-dir="-1" data-idx="${idx}" data-fk="order-up-${stepId}" ${idx === 0 || locked ? "disabled" : ""} class="order-btn" aria-label="Move step ${idx + 1} up">${icon("arrow-up", 16)}</button>
            <button type="button" data-testid="order-down-${stepId}" data-act="order" data-dir="1" data-idx="${idx}" data-fk="order-down-${stepId}" ${idx === current.length - 1 || locked ? "disabled" : ""} class="order-btn" aria-label="Move step ${idx + 1} down">${icon("arrow-down", 16)}</button>
          </span>
        </div>`;
        })
        .join("")}
    </div>`;
  }
  return "";
}

// ── Ticket ───────────────────────────────────────────────────────────────────

function viewTicket(obj, s, ui, locked, active) {
  const p = prog(s, obj.id);
  const result = s.results[obj.id];
  const hintText = s.mode === "medium" ? (obj.hints ? obj.hints[Math.min(p.hints, obj.hints.length - 1)] : undefined) : obj.nudge;
  const headerIcon = locked
    ? icon("lock", 16, "ticket-ico lock")
    : p.done
      ? `<span aria-label="Completed">${icon("circle-check", 16, "ticket-ico done")}</span>`
      : icon("clipboard-list", 16, "ticket-ico open");
  return `
  <article class="ticket ${p.done ? "done" : locked ? "locked" : active ? "active" : ""}" data-testid="ticket-${obj.id}">
    <button type="button" class="ticket-head" data-act="${locked ? "toast-locked" : "toggle"}" data-obj="${obj.id}" data-fk="ticket-${obj.id}" aria-expanded="${active}">
      ${headerIcon}
      <span class="ticket-wo">${obj.wo}</span>
      <span class="ticket-title ${p.done ? "dim" : ""}">${esc(obj.title)}</span>
      <span class="ticket-pillar">${obj.pillar}</span>
      ${icon("chevron-down", 16, `ticket-chevron ${active ? "up" : ""}`)}
    </button>
    ${active && !locked ? `
    <div class="ticket-body-clip"><div class="ticket-body">
      <p class="ticket-brief">${esc(obj.brief)}</p>
      ${s.mode === "medium" && obj.look ? `<p class="ticket-look"><strong class="look-label">Where to look · </strong>${esc(obj.look)}</p>` : ""}
      ${obj.evidence ? `<ul class="ticket-evidence" aria-label="Evidence items">${obj.evidence.map((e) => `<li>${esc(e)}</li>`).join("")}</ul>` : ""}
      <div class="ticket-widget">${viewWidget(obj, s, ui, p.done)}</div>

      <div class="hint-box">
        <div class="hint-row">
          ${icon("lightbulb", 16, "hint-bulb")}
          ${p.hints === 0
            ? `<button type="button" class="btn btn-outline btn-44 btn-hint" data-testid="hint-${obj.id}" data-act="hint" data-obj="${obj.id}" data-fk="hint-${obj.id}">${s.mode === "medium" ? "Reveal hint 1 (costs stars)" : "Spend the one nudge (costs stars)"}</button>`
            : `<span class="hint-count">${s.mode === "medium" ? `hint ${p.hints} of 3 revealed` : "nudge spent"}</span>`}
        </div>
        ${p.hints > 0 && hintText ? `
        <ul class="hint-list">
          ${(s.mode === "medium" ? (obj.hints || []).slice(0, p.hints) : [obj.nudge || ""])
            .filter(Boolean)
            .map((h) => `<li><span class="hint-mark">›</span>${esc(h)}</li>`)
            .join("")}
        </ul>` : ""}
      </div>

      <div class="ticket-actions">
        <button type="button" class="btn btn-check" data-testid="check-${obj.id}" data-act="check" data-obj="${obj.id}" data-fk="check-${obj.id}" ${p.done ? "disabled" : ""}>${p.done ? "SIGNED OFF" : "CHECK RESULTS"}</button>
        <span class="ticket-anchor" data-testid="anchor-${obj.id}">covers ${esc(obj.anchor)} · ${PILLAR_LABEL[obj.pillar]}</span>
      </div>
      ${result ? `
      <div class="ticket-result ${result.ok ? "ok" : "bad"}" role="status" data-testid="result-${obj.id}">
        ${result.ok ? icon("badge-check", 16, "result-ico") : icon("circle-x", 16, "result-ico")}
        <span>${esc(result.note)}</span>
      </div>` : ""}
    </div></div>` : ""}
    ${locked && active ? `<p class="ticket-locked-note">Finish the earlier work orders first — one ticket at a time, apprentice.</p>` : ""}
  </article>`;
}

// ── Site manual (C2) ─────────────────────────────────────────────────────────

function viewManual() {
  const connectors = PARTS.filter((p) => p.kind === "connector");
  const modules = PARTS.filter((p) => p.kind === "module");
  return `
  <div class="stack-body" data-testid="manual">
    ${MANUAL.map(
      (sec) => `
    <section class="card">
      <h3 class="card-title">${esc(sec.title)}</h3>
      ${sec.body.map((para) => `<p class="card-para">${esc(para)}</p>`).join("")}
    </section>`
    ).join("")}
    <section class="card">
      <h3 class="card-title">Connector library</h3>
      <div class="lib-grid">
        ${connectors
          .map(
            (c) => `
          <div class="lib-card" style="border-left:6px solid ${c.color || "#CFC7B4"}">
            <div class="lib-head">
              ${glyph(c.id, "glyph-28")}
              <div>
                <p class="lib-code">${esc(c.code)}</p>
                <p class="lib-name">${esc(c.name)}</p>
              </div>
            </div>
            <p class="lib-tagline">${esc(c.tagline)}</p>
            <p class="lib-specs">${esc(c.specs[1] ? c.specs[1][1] : "")} · ${esc(c.specs[2] ? c.specs[2][1] : "")}</p>
          </div>`
          )
          .join("")}
      </div>
    </section>
    <section class="card">
      <h3 class="card-title">Pluggable family</h3>
      <div class="lib-grid">
        ${modules
          .map(
            (m) => `
          <div class="lib-card row">
            ${glyph(m.id, "glyph-28")}
            <div class="min-w-0">
              <p class="lib-code">${esc(m.code)}</p>
              <p class="lib-line">${esc(m.specs[0][1])} · ${esc(m.specs[1][1])}</p>
            </div>
          </div>`
          )
          .join("")}
      </div>
    </section>
    <section class="card">
      <h3 class="card-title">Glossary</h3>
      <dl class="glossary">
        ${GLOSSARY.map((g) => `<div class="gloss-item"><dt>${esc(g.term)}: </dt><dd>${esc(g.def)}</dd></div>`).join("")}
      </dl>
    </section>
  </div>`;
}

// ── Debrief (C6) ─────────────────────────────────────────────────────────────

function viewDebrief() {
  return `
  <div class="stack-body" data-testid="debrief">
    <section class="card">
      <h3 class="card-title">Quick-reference matrix</h3>
      <div class="table-scroll">
        <table class="matrix-ref">
          <thead>
            <tr class="matrix-ref-head">
              <th>Part</th><th>Full name</th><th>Medium</th><th>Latch</th><th>Business end</th><th>Use</th>
            </tr>
          </thead>
          <tbody>
            ${DEBRIEF_MATRIX.map(
              (r) => `
            <tr>
              <td class="mono-bold">${esc(r.part)}</td>
              <td>${esc(r.full)}</td>
              <td>${esc(r.medium)}</td>
              <td>${esc(r.latch)}</td>
              <td>${esc(r.end)}</td>
              <td>${esc(r.use)}</td>
            </tr>`
            ).join("")}
          </tbody>
        </table>
      </div>
    </section>
    <section class="card">
      <h3 class="card-title">Dead-link troubleshooting ladder</h3>
      <ol class="ladder">
        ${TROUBLESHOOT_LADDER.map((step) => `<li>${esc(step)}</li>`).join("")}
      </ol>
    </section>
    <section class="card">
      <h3 class="card-title">Selection cheat sheet</h3>
      <ul class="cheats">
        ${SELECTION_CHEATS.map((c) => `<li><span class="mark orange" aria-hidden="true">▸</span>${esc(c)}</li>`).join("")}
      </ul>
    </section>
    ${TAKEAWAYS.map(
      (t) => `
    <section class="card">
      <h3 class="card-title">${esc(t.title)}</h3>
      <ul class="cheats">
        ${t.points.map((pt) => `<li><span class="mark gold" aria-hidden="true">▸</span>${esc(pt)}</li>`).join("")}
      </ul>
    </section>`
    ).join("")}
    <section class="card">
      <h3 class="card-title">What to learn next</h3>
      <ul class="cheats next-steps">
        ${NEXT_STEPS.map((n) => {
          if (n.startsWith("Official")) {
            return `<li>${icon("book-open", 16, "cheat-book")}<span>${esc(n.replace("Official reference: CompTIA N10-009 exam objectives (comptia.org)", ""))}<a href="https://www.comptia.org/en-us/certifications/network" target="_blank" rel="noopener noreferrer" class="ext-link">CompTIA N10-009 exam objectives ${icon("external-link", 12)}</a></span></li>`;
          }
          return `<li>${icon("book-open", 16, "cheat-book")}<span>${esc(n)}</span></li>`;
        }).join("")}
      </ul>
      <p class="training-note">Training note: MITRE ATT&amp;CK mapping is intentionally absent — this objective is physical-layer hardware; ATT&amp;CK catalogs adversary behavior, not connectors.</p>
    </section>
  </div>`;
}

// ── Exam (C5) ────────────────────────────────────────────────────────────────
// Picking an option IS the per-question validation — the question locks
// immediately. Only the picked option turns green/red; the correct one is NOT
// revealed on a miss. Options are shuffled per session with position letters.

function viewExam(s) {
  const qs = quizQuestions(s);
  const score = quizScore(s);
  const answeredAll = qs.every((q) => s.quiz[q.id]);
  return `
  <div class="stack-body" data-testid="exam">
    <div class="exam-intro">
      <p>${s.mode === "medium"
        ? "The counter exam: 6 concept questions. Each answer locks when you pick it — read the why, then move to the next."
        : "The journeyman board: 7 scenario questions. Each pick locks the answer — justification follows immediately."}</p>
    </div>
    ${qs
      .map((q, qi) => {
        const picked = s.quiz[q.id];
        const locked = s.quizSubmitted || Boolean(picked);
        const shuffled = sessionShuffle(q.options, `exam:${q.id}`);
        return `
      <fieldset class="quiz-q" data-testid="quiz-q-${q.id}" ${locked ? "disabled" : ""}>
        <legend class="quiz-legend"><span class="quiz-num">Q${qi + 1}.</span>${esc(q.prompt)}</legend>
        <div class="quiz-opts">
          ${shuffled
            .map((o, oi) => {
              const isPicked = picked === o.id;
              const revealed = Boolean(picked);
              const correct = o.id === q.correct;
              return `
            <button type="button" data-testid="quiz-${q.id}-${o.id}" ${locked ? "disabled" : ""} data-act="quiz-pick" data-q="${q.id}" data-o="${o.id}" data-fk="quiz-${q.id}-${o.id}" aria-pressed="${isPicked}"
              class="quiz-opt ${revealed && isPicked && correct ? "right" : revealed && isPicked && !correct ? "wrong" : isPicked ? "picked" : ""}">
              <span class="quiz-letter">${String.fromCharCode(65 + oi)})</span>
              <span class="grow">${esc(o.label)}</span>
              ${revealed && isPicked ? (correct ? `<span class="quiz-verdict ok">correct</span>` : `<span class="quiz-verdict no">not it</span>`) : ""}
            </button>`;
            })
            .join("")}
        </div>
        ${picked ? `
        <p class="quiz-why ${picked === q.correct ? "right" : ""}" data-testid="quiz-why-${q.id}">
          <strong>${picked === q.correct ? "Correct — " : "Why not — "}</strong>${esc(q.options.find((o) => o.id === picked)?.why || "")}
        </p>` : ""}
      </fieldset>`;
      })
      .join("")}
    ${!s.quizSubmitted
      ? `<button type="button" class="btn btn-check quiz-submit" data-testid="quiz-submit" data-act="quiz-submit" data-fk="quiz-submit" ${answeredAll ? "" : "disabled"}>${answeredAll ? "SUBMIT EXAM" : `Answer all ${qs.length} questions to submit`}</button>`
      : `<div class="quiz-score" data-testid="quiz-score">
          <p class="quiz-score-num" role="status">Counter exam: ${score.correct}/${score.total}</p>
          <p class="quiz-score-note">${score.correct === score.total
            ? "Perfect sheet — the foreman is impressed."
            : score.correct >= Math.ceil(score.total * 0.7)
              ? "Solid pass. Re-read the explanations you missed and the debrief matrix."
              : "Review the site manual and try the exam again after another pass through the work orders."}</p>
        </div>`}
  </div>`;
}

// ── Clipboard shell ──────────────────────────────────────────────────────────

function viewClipboard(s, ui) {
  const list = objectiveList(s);
  const firstUndone = list.find((o) => !prog(s, o.id).done)?.id || null;
  const activeId = ui.expanded ?? firstUndone ?? null;
  const readyForSignoff = allObjectivesDone(s) && s.quizSubmitted;

  const stacks = [
    { id: "orders", label: "WORK ORDERS" },
    { id: "manual", label: "SITE MANUAL" },
    { id: "debrief", label: "DEBRIEF" },
    { id: "exam", label: `COUNTER EXAM${s.quizSubmitted ? " ✓" : ""}` },
  ];

  let panel = "";
  if (ui.stack === "orders") {
    panel = `
      <div class="stack-body">
        ${s.mode === "medium"
          ? `<p class="mode-note" data-testid="mode-note">APPRENTICE: orders unlock in sequence — finish one, sign it off, the next opens. Hints are free to reveal (they cost stars, never progress).</p>`
          : `<p class="mode-note" data-testid="mode-note">JOURNEYMAN: every order is open at once. Evidence is noisy — at least two items in this stack are red herrings. One nudge total, strict checks.</p>`}
        ${list.map((obj) => {
          const idx = list.indexOf(obj);
          const prevDone = idx === 0 || prog(s, list[idx - 1].id).done;
          const locked = s.mode === "medium" && !prevDone;
          return viewTicket(obj, s, ui, locked, activeId === obj.id);
        }).join("")}
      </div>`;
  } else if (ui.stack === "manual") {
    panel = viewManual();
  } else if (ui.stack === "debrief") {
    panel = viewDebrief();
  } else {
    panel = viewExam(s);
  }

  return `
  <section class="clipboard" aria-label="Job clipboard">
    <div class="stack-tabs" role="tablist" aria-label="Clipboard stacks">
      ${stacks
        .map(
          (st) => `
        <button type="button" role="tab" id="tab-${st.id}" aria-selected="${ui.stack === st.id}" aria-controls="panel-${st.id}" tabindex="${ui.stack === st.id ? 0 : -1}"
          data-testid="stack-${st.id}" data-act="stack" data-stack="${st.id}" data-fk="stack-${st.id}"
          class="stack-tab ${ui.stack === st.id ? "active" : ""}">${esc(st.label)}</button>`
        )
        .join("")}
    </div>
    <div class="stack-panel" id="panel-${ui.stack}" role="tabpanel" aria-labelledby="tab-${ui.stack}">
      ${panel}
      ${ui.stack === "orders" && readyForSignoff ? `<p class="ready-signoff" data-testid="ready-signoff">All work orders signed and the exam is in — request the foreman's sign-off from the job board.</p>` : ""}
      <p class="clipboard-foot">${icon("scroll-text", 12)}Synthetic training data · fictional employer \u201cNorthgate Cabling Co.\u201d · N10-009 Obj 1.7</p>
    </div>
  </section>`;
}

// ── The bench: ports, switch face, parts tray ────────────────────────────────

function viewPort(port, s) {
  const seatedPart = s.seated[port.id];
  const def = seatedPart ? PART_BY_ID[seatedPart] : null;
  const holding = s.selected;
  const state = holding && !seatedPart ? "holding" : seatedPart ? "seated" : "empty";
  return `
  <div class="port-unit">
    <div class="port-wrap">
      <button type="button" data-testid="port-${port.id}" data-act="port" data-port="${port.id}" data-fk="port-${port.id}"
        aria-label="${seatedPart ? `${esc(port.label)}, holding ${seatedPart}. Click to inspect.` : `${esc(port.label)} — ${esc(port.caption)}. Empty.`}"
        class="port ${state}">
        ${def ? `<span class="seat-pop">${glyph(def.id, "glyph-36")}</span>` : `<span class="ghost">${glyph(port.ghost, "glyph-36")}</span>`}
      </button>
      ${seatedPart ? `
      <button type="button" data-testid="eject-${port.id}" data-act="eject" data-port="${port.id}" data-fk="eject-${port.id}"
        aria-label="Eject ${esc(seatedPart)} from ${esc(port.label)}" class="eject">${icon("zap", 16)}</button>` : ""}
    </div>
    <span class="port-label">${esc(port.label)}</span>
    <span class="port-caption">${esc(port.caption)}</span>
  </div>`;
}

function viewSwitchFace(s) {
  const cagePorts = PORTS.filter((p) => p.bay === "switch");
  const link10 = s.links["10G-A↔B"];
  const link100 = s.links["100G-Q"];
  const led = (id, label, link, testid) => `
    <div class="led-row" title="${link ? esc(link.detail) : "Not verified yet"}">
      <span class="led ${link ? (link.state === "up" ? "up" : "down") : ""}" data-testid="${testid}" role="status"
        aria-label="${label}: ${link ? (link.state === "up" ? "link up" : "link down") : "not verified"}"></span>
      <span class="led-label">${esc(label)}</span>
      <span class="led-detail">${link ? esc(link.detail) : "Press VERIFY to test"}</span>
    </div>`;
  const faces = ["CAGEA", "CAGEB", "CAGEQ"]
    .map((cage) => {
      const mod = s.seated[cage];
      const portLabel = cagePorts.find((p) => p.id === cage)?.label || cage;
      if (!mod) {
        return `<div class="face-empty">${esc(portLabel)} · no module</div>`;
      }
      if (cage === "CAGEQ") {
        return `
        <button type="button" data-testid="face-${cage}" data-act="faceq" data-fk="face-${cage}"
          class="face ${s.mpoTrunk ? "landed" : "open"}"
          aria-label="${esc(portLabel)} module face (${mod}) — ${s.mpoTrunk ? "MPO trunk landed" : "MPO adapter, land the trunk here"}">
          ${glyph(s.mpoTrunk ? "MPO_CORD" : "mpoAdapter", "glyph-20")}
          <span class="face-label">${mod}${s.mpoTrunk ? " · trunk" : " · MPO face"}</span>
        </button>`;
      }
      const cordHere = s.lcCordA === cage || s.lcCordB === cage;
      return `
      <button type="button" data-testid="face-${cage}" data-act="face" data-cage="${cage}" data-fk="face-${cage}"
        class="face ${cordHere ? "landed" : "open"}"
        aria-label="${esc(portLabel)} module face (${mod}) — ${cordHere ? "LC cord landed" : "LC jack, land the cord here"}">
        ${glyph(s.lcCordKind === "LC_CORD_SM" && cordHere ? "LC_CORD_SM" : cordHere ? "LC_CORD" : "lcAdapter", "glyph-20")}
        <span class="face-label">${mod}${cordHere ? ` · cord ${s.lcCordA === cage ? "A" : "B"}` : " · LC jack"}</span>
      </button>`;
    })
    .join("");
  return `
  <div class="switchface">
    <div class="switchface-head">
      <span class="switchface-title">Link verification</span>
      <button type="button" data-testid="verify-links" data-act="verify" data-fk="verify-links" class="btn btn-verify">${icon("zap", 14)} VERIFY LINKS</button>
    </div>
    <div class="led-grid">
      ${led("10G-A↔B", "10G A↔B", link10, "led-10g")}
      ${led("100G-Q", "100G Q", link100, "led-100g")}
    </div>
    <div class="face-grid">${faces}</div>
  </div>`;
}

function viewTrayCard(id, s) {
  const part = PART_BY_ID[id];
  const selected = s.selected === id;
  return `
  <button type="button" data-testid="tray-${id}" data-act="tray" data-part="${id}" data-fk="tray-${id}" aria-pressed="${selected}"
    aria-label="${esc(part.code)} — ${esc(part.name)}. ${selected ? "In hand" : "Select to pick up"}"
    class="tray-card ${selected ? "picked" : ""}"
    ${part.color && !selected ? `style="border-left-width:6px;border-left-color:${part.color}"` : part.color ? `style="border-left-color:${part.color}"` : ""}>
    <span class="tray-glyph">${glyph(id, "glyph-32")}</span>
    <span class="tray-code">${esc(part.code)}</span>
    <span class="tray-name">${esc(part.name)}</span>
  </button>`;
}

function viewBench(s) {
  const copper = PORTS.filter((p) => p.bay === "copper");
  const fiber = PORTS.filter((p) => p.bay === "fiber");
  const connectors = PARTS.filter((p) => p.kind === "connector");
  const modules = PARTS.filter((p) => p.kind === "module");
  const cords = PARTS.filter((p) => p.kind === "cord");
  const bayCard = (bayPorts, showSwitch) => {
    const bay = bayPorts[0].bay;
    return `
    <div class="bay">
      <h3 class="bay-title">${BAY_STYLES[bay].title}</h3>
      <p class="bay-sub">${esc(BAY_STYLES[bay].sub)}</p>
      <div class="bay-ports">${bayPorts.map((p) => viewPort(p, s)).join("")}</div>
      ${showSwitch ? viewSwitchFace(s) : ""}
    </div>`;
  };
  return `
  <section class="bench" aria-label="The workbench">
    <div class="inhand" aria-live="polite">
      ${s.selected
        ? `
        <span class="inhand-text">${icon("hand", 16, "hand-ico")} In hand: <strong class="mono">${esc(PART_BY_ID[s.selected].code)}</strong> — click a matching port on the panel.</span>
        <button type="button" data-testid="cancel-select" data-act="putback" data-fk="cancel-select" class="btn btn-putback">put back</button>`
        : `<span class="inhand-empty">Pick a part from the tray to begin — or click any seated part to read its spec sheet.</span>`}
    </div>

    <div class="panel">
      <div class="panel-grid">
        ${bayCard(copper, false)}
        ${bayCard(fiber, false)}
        <div class="bay">
          <h3 class="bay-title">${BAY_STYLES.switch.title}</h3>
          <p class="bay-sub">${esc(BAY_STYLES.switch.sub)}</p>
          <div class="bay-ports switch-ports">${PORTS.filter((p) => p.bay === "switch").map((p) => viewPort(p, s)).join("")}</div>
          ${viewSwitchFace(s)}
        </div>
      </div>
    </div>

    <div class="tray">
      <div class="tray-head">
        <h3 class="bay-title">PARTS TRAY</h3>
        <span class="tray-sub">training stock — unlimited · click a card to pick it up</span>
      </div>
      <div class="tray-groups">
        ${[
          { label: "CONNECTORS", items: connectors },
          { label: "MODULES", items: modules },
          { label: "CORDS", items: cords },
        ]
          .map(
            (group) => `
          <div>
            <p class="tray-group-label">${group.label}</p>
            <div class="tray-row" role="list" aria-label="${group.label}" data-ps="tray-${group.label}">
              ${group.items.map((p) => `<div role="listitem">${viewTrayCard(p.id, s)}</div>`).join("")}
            </div>
          </div>`
          )
          .join("")}
      </div>
    </div>
  </section>`;
}

// Expose
window.LAB_UI = {
  esc,
  glyph,
  icon,
  viewClockIn,
  viewJobBoard,
  viewResetDialog,
  viewInspector,
  viewSignOff,
  viewToasts,
  viewAnnouncer,
  viewClipboard,
  viewBench,
};
