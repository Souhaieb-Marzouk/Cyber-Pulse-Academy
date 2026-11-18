/* =========================================================================
   Night Dispatch — js/ui.js
   Rendering helpers and shared components: inline SVG icons (lucide paths),
   HTML escaping, the deterministic seeded shuffle (identical algorithm to
   the original — display order never reveals answers), matcher/sequencer
   widgets, objective check blocks/cards, and the overlay layer (sheets +
   dialog) with the same dismissal and focus behavior as the Radix originals.
   ========================================================================= */

"use strict";

/* ---------- tiny DOM helpers ---------- */

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/* ---------- inline SVG icons (paths copied from lucide v0.525) ---------- */

const ICON_PATHS = {
  "rotate-ccw": '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  "circle-check": '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  "chevron-down": '<path d="m6 9 6 6 6-6"/>',
  lightbulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  "circle-x": '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
  "graduation-cap": '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
  "moon-star": '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9"/><path d="M20 3v4"/><path d="M22 5h-4"/>',
  radio: '<path d="M16.247 7.761a6 6 0 0 1 0 8.478"/><path d="M19.075 4.933a10 10 0 0 1 0 14.134"/><path d="M4.925 19.067a10 10 0 0 1 0-14.134"/><path d="M7.753 16.239a6 6 0 0 1 0-8.478"/><circle cx="12" cy="12" r="2"/>',
  "shield-alert": '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  "train-front": '<path d="M8 3.1V7a4 4 0 0 0 8 0V3.1"/><path d="m9 15-1-1"/><path d="m15 15 1-1"/><path d="M9 19c-2.8 0-5-2.2-5-5v-4a8 8 0 0 1 16 0v4c0 2.8-2.2 5-5 5Z"/><path d="m8 19-2 3"/><path d="m16 19 2 3"/>',
  bookmarked: '<path d="M10 2v8l3-3 3 3V2"/><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/>',
  "clipboard-list": '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
  star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  trophy: '<path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"/><path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"/><path d="M18 9h1.5a1 1 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"/><path d="M6 9H4.5a1 1 0 0 1 0-5H6"/>',
  "book-open-text": '<path d="M12 7v14"/><path d="M16 12h2"/><path d="M16 8h2"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/><path d="M6 12h2"/><path d="M6 8h2"/>',
  "door-open": '<path d="M11 20H2"/><path d="M11 4.562v16.157a1 1 0 0 0 1.242.97L19 20V5.562a2 2 0 0 0-1.515-1.94l-4-1A2 2 0 0 0 11 4.561z"/><path d="M11 4H8a2 2 0 0 0-2 2v14"/><path d="M14 12h.01"/><path d="M22 20h-3"/>',
  "file-badge": '<path d="M12 22h6a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3.072"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m6.69 16.479 1.29 4.88a.5.5 0 0 1-.698.591l-1.843-.849a1 1 0 0 0-.88.001l-1.846.85a.5.5 0 0 1-.693-.593l1.29-4.88"/><circle cx="5" cy="14" r="3"/>',
  radar: '<path d="M19.07 4.93A10 10 0 0 0 6.99 3.34"/><path d="M4 6h.01"/><path d="M2.29 9.62A10 10 0 1 0 21.31 8.35"/><path d="M16.24 7.76A6 6 0 1 0 8.23 16.67"/><path d="M12 18h.01"/><path d="M17.99 11.66A6 6 0 0 1 15.77 16.67"/><circle cx="12" cy="12" r="2"/><path d="m13.41 10.59 5.66-5.66"/>',
  "arrow-right": '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  ticket: '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>',
  building: '<rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>',
  "file-text": '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  siren: '<path d="M7 18v-6a5 5 0 1 1 10 0v6"/><path d="M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z"/><path d="M21 12h1"/><path d="M18.5 4.5 18 5"/><path d="M2 12h1"/><path d="M12 2v1"/><path d="m4.929 4.929.707.707"/><path d="M12 12v6"/>',
  "triangle-alert": '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  "circle-dashed": '<path d="M10.1 2.182a10 10 0 0 1 3.8 0"/><path d="M13.9 21.818a10 10 0 0 1-3.8 0"/><path d="M17.609 3.721a10 10 0 0 1 2.69 2.7"/><path d="M2.182 13.9a10 10 0 0 1 0-3.8"/><path d="M20.279 17.609a10 10 0 0 1-2.7 2.69"/><path d="M21.818 10.1a10 10 0 0 1 0 3.8"/><path d="M3.721 6.391a10 10 0 0 1 2.7-2.69"/><path d="M6.391 20.279a10 10 0 0 1-2.69-2.7"/>',
  "map-pin": '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  "scan-line": '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 12h10"/>',
  stamp: '<path d="M14 13V8.5C14 7 15 7 15 5a3 3 0 0 0-6 0c0 2 1 2 1 3.5V13"/><path d="M20 15.5a2.5 2.5 0 0 0-2.5-2.5h-11A2.5 2.5 0 0 0 4 15.5V17a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1z"/><path d="M5 22h14"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  "external-link": '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  "shield-check": '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  "table-2": '<path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>',
  "book-open": '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  crosshair: '<circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
};

/**
 * Build a lucide-style inline SVG. Default presentation matches lucide-react:
 * 24×24 viewBox (with width/height attributes as fallback), stroke =
 * currentColor, stroke-width 2, no fill. The size-* CSS classes scale it.
 */
function icon(name, cls = "", extra = "") {
  const paths = ICON_PATHS[name] || "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon ${cls}" aria-hidden="true" ${extra}>${paths}</svg>`;
}

/* ---------- deterministic seeded shuffle (identical to the original) ---------- */

function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * R6: display order of pairing rows/options and sequencer pools must never
 * reveal the correct pairs or the correct sequence. A pure function of the
 * widget key keeps the render deterministic (same order as the original).
 */
function seededShuffle(arr, seed) {
  const rand = mulberry32(hashSeed(seed));
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  /* identity-result guard: an (unlucky) identity shuffle would re-reveal an
     authored-in-order answer — rotate deterministically instead. */
  if (a.length > 1 && a.every((v, i) => v === arr[i])) {
    a.push(a.shift());
  }
  return a;
}

/* ---------- shared component templates ---------- */

const PILLAR_COLORS = {
  P1: "pillar-p1",
  P2: "pillar-p2",
  P3: "pillar-p3",
  P4: "pillar-p4",
};

function pillarBadge(pillar) {
  return `<span class="badge badge-outline pillar-badge ${PILLAR_COLORS[pillar] ?? ""}">${esc(pillar)} · ${esc(PILLAR_LABEL[pillar] ?? pillar)}</span>`;
}

/**
 * The CHECK RESULTS block shared by every objective surface (floor, annex,
 * binder bench, objectives pad, exposure board, cabinet).
 */
function objectiveCheckHTML(objective, state, { showHints = true } = {}) {
  const res = state.results[objective.id];
  const os = state.objectives[objective.id];
  const used = os?.hintsUsed ?? 0;
  const maxHints = objective.mode === "medium" ? 3 : 1;
  const visibleHints = Math.min(used, objective.hints.length);

  const status = os?.solved
    ? `<span class="obj-status obj-status-cleared">${icon("circle-check", "size-4")} Objective cleared</span>`
    : os?.attempts
      ? `<span class="obj-status obj-status-attempt">${icon("circle-x", "size-4")} Attempt ${os.attempts} — not yet</span>`
      : "";

  const hintsHTML = showHints
    ? `<div class="obj-hints">
        ${objective.hints.slice(0, visibleHints).map((h, i) => `
          <p class="hint-line">
            ${icon("lightbulb", "size-3.5")}
            <span><span class="hint-tag">HINT ${i + 1}</span> ${esc(h)}</span>
          </p>`).join("")}
        ${used < maxHints ? `
          <button type="button" class="btn btn-ghost btn-hint" data-action="use-hint" data-oid="${esc(objective.id)}" data-fk="hint-${esc(objective.id)}">
            ${icon("lightbulb", "size-4")}
            ${objective.mode === "medium"
              ? `Radio the control room (hint ${used + 1}/${maxHints} — free)`
              : "Radio the control room (the one allowed call — costs score)"}
          </button>` : ""}
      </div>`
    : "";

  return `
    <div class="obj-check" data-objective="${esc(objective.id)}">
      <div class="obj-check-row">
        <button type="button" class="btn btn-sm ${os?.solved ? "btn-outline" : "btn-default"}" data-action="check-objective" data-oid="${esc(objective.id)}" data-fk="chk-${esc(objective.id)}">
          ${os?.solved ? "Re-check results" : "Check results"}
        </button>
        ${status}
        <span class="obj-check-id">${esc(objective.id)}</span>
      </div>
      ${res ? `
        <div role="status" aria-live="polite" class="feedback ${res.pass ? "feedback-ok" : "feedback-warn"}">
          ${esc(res.feedback)}
        </div>` : ""}
      ${hintsHTML}
    </div>`;
}

/** Collapsible objective card used on the objectives desk pad. */
function objectiveCardHTML(objective, state) {
  const os = state.objectives[objective.id];
  const open = UIState.padOpen[objective.id] ?? (os?.solved ?? false);
  UIState.padOpen[objective.id] = open;
  return `
    <div class="obj-card ${os?.solved ? "obj-card-solved" : ""}">
      <button type="button" aria-expanded="${open}" data-action="toggle-obj-card" data-oid="${esc(objective.id)}" data-fk="card-${esc(objective.id)}" class="obj-card-toggle">
        <span class="obj-card-marker">${os?.solved ? icon("circle-check", "size-5 text-emerald") : `<span class="obj-dot" aria-hidden="true"></span>`}</span>
        <span class="obj-card-body">
          <span class="obj-card-tags">${pillarBadge(objective.pillar)}<span class="mono obj-card-id">${esc(objective.id)}</span></span>
          <span class="obj-card-title">${esc(objective.title)}</span>
        </span>
        ${icon("chevron-down", `size-4 chev ${open ? "chev-open" : ""}`)}
      </button>
      ${open ? `
        <div class="obj-card-panel">
          <p class="obj-card-context">${esc(objective.context)}</p>
          <p class="obj-card-anchor mono">ANCHOR · ${esc(objective.anchor)}</p>
          ${objectiveCheckHTML(objective, state)}
        </div>` : ""}
    </div>`;
}

/* ---------- matcher + sequencer widgets ---------- */

function matcherHTML(def, state) {
  const m = state.matchers[def.key] ?? {};
  const rows = seededShuffle(def.rows, `${def.key}:rows`);
  const options = seededShuffle(def.options, `${def.key}:opts`);
  return `
    <div class="panel matcher" aria-label="${esc(def.title)}" data-matcher="${esc(def.key)}">
      <h4 class="matcher-title">${esc(def.title)}</h4>
      <p class="matcher-help">${esc(def.help)}</p>
      <div class="matcher-rows">
        ${rows.map((row) => {
          const chosen = m[row.id];
          return `
            <div class="matcher-row">
              <p class="matcher-row-label">${esc(row.label)}</p>
              <div class="chip-row" role="radiogroup" aria-label="Assign a match for: ${esc(row.label)}">
                ${options.map((o) => {
                  const sel = chosen === o.id;
                  return `
                    <button type="button" role="radio" aria-checked="${sel}" data-action="set-match" data-mkey="${esc(def.key)}" data-mrow="${esc(row.id)}" data-mopt="${esc(o.id)}" data-fk="match-${esc(def.key)}-${esc(row.id)}-${esc(o.id)}"
                      class="chip ${sel ? "chip-on lamp-glow" : ""}">
                      ${sel ? icon("check", "size-3") : ""}<span class="fx">${esc(o.label)}</span>
                    </button>`;
                }).join("")}
              </div>
            </div>`;
        }).join("")}
      </div>
    </div>`;
}

function sequencerHTML(def, state) {
  const seq = state.sequences[def.key] ?? [];
  const pool = seededShuffle(def.pool, `${def.key}:pool`);
  const remaining = pool.filter((p) => !seq.includes(p.id));
  return `
    <div class="panel sequencer" aria-label="${esc(def.title)}" data-sequencer="${esc(def.key)}">
      <h4 class="matcher-title">${esc(def.title)}</h4>
      <p class="matcher-help">${esc(def.help)}</p>
      <ol class="seq-list" aria-label="Current order for ${esc(def.title)}">
        ${seq.map((id, i) => {
          const step = def.pool.find((p) => p.id === id);
          return `
            <li>
              <button type="button" data-action="seq-remove" data-skey="${esc(def.key)}" data-sidx="${i}" data-fk="seqs-${esc(def.key)}-${i}"
                class="seq-step" aria-label="Step ${i + 1}: ${esc(step?.label ?? "")}. Select to remove.">
                <span class="seq-num mono">${i + 1}</span>
                <span class="seq-label">${esc(step?.label ?? "")}</span>
                <span aria-hidden="true" class="seq-remove">remove</span>
              </button>
            </li>`;
        }).join("")}
        ${seq.length === 0 ? `
          <li class="seq-empty">Order is empty — tap candidates below to build the sequence.</li>` : ""}
      </ol>
      ${remaining.length > 0 ? `
        <div class="chip-row seq-pool">
          ${remaining.map((p) => `
            <button type="button" data-action="seq-push" data-skey="${esc(def.key)}" data-spid="${esc(p.id)}" data-fk="seqp-${esc(def.key)}-${esc(p.id)}" class="chip">
              <span class="fx">+ ${esc(p.label)}</span>
            </button>`).join("")}
        </div>` : ""}
      ${seq.length > 0 ? `
        <button type="button" class="btn btn-ghost btn-sm seq-clear" data-action="seq-clear" data-skey="${esc(def.key)}" data-fk="seqc-${esc(def.key)}">Clear order</button>` : ""}
    </div>`;
}

/* ---------- overlay layer (sheets + dialog) ----------
   Reimplements the Radix behaviors the lab relies on:
   - slide-in sheets (left/right) and a centered zoom dialog
   - close via X, ESC, backdrop click, secondary action
   - body scroll lock while open, focus trap inside the panel
   - focus restored to the opener 420 ms after close (same timing), with an
     optional CSS-selector fallback (used by the completion modal).        */

const Overlay = {
  el: null,
  panel: null,
  opener: null,
  kind: null, // "sheet-left" | "sheet-right" | "dialog"
  onCloseCb: null,
  fallbackSel: null,
  closeTimer: null,
  prevFocus: null,

  ensure() {
    if (this.el) return this.el;
    const root = document.createElement("div");
    root.className = "overlay-root";
    root.hidden = true;
    root.innerHTML = `
      <div class="overlay-backdrop" data-overlay-close></div>
      <div class="overlay-panel" role="dialog" aria-modal="true" tabindex="-1">
        <button type="button" class="overlay-close" data-overlay-close aria-label="Close">
          ${icon("x", "size-4")}<span class="sr-only">Close</span>
        </button>
        <div class="overlay-content"></div>
      </div>`;
    document.body.appendChild(root);
    this.el = root;
    this.panel = root.querySelector(".overlay-panel");
    this.contentEl = root.querySelector(".overlay-content");

    root.addEventListener("click", (e) => {
      if (e.target.closest("[data-overlay-close]")) {
        e.preventDefault();
        this.requestClose();
      }
    });
    document.addEventListener("keydown", (e) => {
      if (this.el.hidden) return;
      if (e.key === "Escape") {
        e.preventDefault();
        this.requestClose();
      } else if (e.key === "Tab") {
        this.trapTab(e);
      }
    });
    return this.el;
  },

  open(kind, titleHTML, bodyHTML, { describedBy = "", onClose = null, fallbackSel = null } = {}) {
    this.ensure();
    this.opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.kind = kind;
    this.onCloseCb = onClose; // never carry a previous layer's close callback
    this.fallbackSel = fallbackSel;
    clearTimeout(this.closeTimer);

    this.panel.className = `overlay-panel overlay-${kind}`;
    this.panel.setAttribute("aria-label", "");
    this.contentEl.innerHTML = `${titleHTML}${bodyHTML}`;
    const labeled = this.contentEl.querySelector("[data-overlay-title]");
    if (labeled) this.panel.setAttribute("aria-labelledby", labeled.id || "");
    if (describedBy) this.panel.setAttribute("aria-describedby", describedBy);

    this.el.hidden = false;
    // force a reflow so the entrance animation plays reliably
    void this.panel.offsetWidth;
    this.panel.classList.add("overlay-open");
    document.body.style.overflow = "hidden";
    this.panel.focus();
  },

  requestClose() {
    if (this.el.hidden || this.panel.classList.contains("overlay-closing")) return;
    this.panel.classList.add("overlay-closing");
    this.panel.classList.remove("overlay-open");
    const kind = this.kind;
    const duration = kind === "dialog" ? 200 : 300; // matches the original exit animations
    setTimeout(() => {
      this.el.hidden = true;
      this.panel.classList.remove("overlay-closing");
      this.contentEl.innerHTML = ""; // Radix unmounts content on close — same here
      document.body.style.overflow = "";
      if (typeof this.onCloseCb === "function") this.onCloseCb();
    }, duration);
    // focus restoration timing identical to the original lab (420 ms)
    setTimeout(() => this.restoreFocus(), 420);
  },

  restoreFocus() {
    const target =
      (this.opener && document.contains(this.opener) ? this.opener : null) ??
      (this.fallbackSel ? document.querySelector(this.fallbackSel) : null);
    target?.focus?.();
  },

  trapTab(e) {
    const focusables = this.panel.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  },
};

/* ---------- per-view UI state (equivalents of component-local useState) ---------- */

const UIState = {
  padOpen: {},        // objectives-pad card open/closed (useState per card)
  binderOpen: null,   // line-gallery accordion value (Radix single-collapsible)
  floorSelected: null // ledger selection (useState in Floor)
};
