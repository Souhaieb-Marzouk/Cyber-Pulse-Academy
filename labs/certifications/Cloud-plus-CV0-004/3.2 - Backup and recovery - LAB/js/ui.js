// ── ui.js — shared UI helpers: icons, badges, feedback, dialogs, tooltips ─────
// Icons are inline SVGs with the EXACT Lucide v0.525.0 paths used by the
// original (no icon fonts, no CDNs). Styling helpers mirror the original's
// shared components (src/components/lab/bits.tsx).

// ── Icon set (Lucide paths, stroke = currentColor) ────────────────────────────
const ICON_PATHS = {
  "calendar-range": '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M3 10h18"/><path d="M8 2v4"/><path d="M17 14h-6"/><path d="M13 18H7"/><path d="M7 14h.01"/><path d="M17 18h.01"/>',
  "lock-keyhole": '<circle cx="12" cy="16" r="1"/><rect x="3" y="10" width="18" height="12" rx="2"/><path d="M7 10V7a5 5 0 0 1 10 0v3"/>',
  "alarm-clock": '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3 2 6"/><path d="m22 6-3-3"/><path d="M6.38 18.7 4 21"/><path d="M17.64 18.67 20 21"/>',
  "folder-search": '<path d="M10.7 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v4.1"/><path d="m21 21-1.9-1.9"/><circle cx="17" cy="17" r="3"/>',
  "clipboard-check": '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
  "book-open-text": '<path d="M12 7v14"/><path d="M16 12h2"/><path d="M16 8h2"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/><path d="M6 12h2"/><path d="M6 8h2"/>',
  "shield-check": '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  "graduation-cap": '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
  "shield-alert": '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  "list-checks": '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
  "rotate-ccw": '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  "check-circle-2": '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  "chevron-down": '<path d="m6 9 6 6 6-6"/>',
  "circle": '<circle cx="12" cy="12" r="10"/>',
  "lightbulb": '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  "external-link": '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  "star": '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  "x": '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
};

/** Render an inline Lucide-style SVG. */
function icon(name, size, cls) {
  const paths = ICON_PATHS[name] || "";
  const s = size || 16;
  const c = cls || "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="${c}">${paths}</svg>`;
}

// ── Small utilities ────────────────────────────────────────────────────────────
/** Escape dynamic strings before interpolating into HTML. */
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/** Restore focus to a matching element after a panel re-render (keyboard UX). */
function rerenderPreservingFocus(containerId, renderFn) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const active = document.activeElement;
  const focusKey = active && active.getAttribute ? active.getAttribute("data-focus-key") : null;
  renderFn();
  if (focusKey) {
    const again = container.querySelector(`[data-focus-key="${CSS.escape(focusKey)}"]`);
    if (again) again.focus();
  }
}

// ── Shared presentational components (bits.tsx equivalents) ───────────────────
const PILLARS = {
  P1: { label: "Understand", cls: "pillar-teal" },
  P2: { label: "Recognize", cls: "pillar-amber" },
  P3: { label: "Detect", cls: "pillar-rose" },
  P4: { label: "Mitigate", cls: "pillar-emerald" },
};

function pillarBadge(p) {
  const info = PILLARS[p];
  return `<span class="badge outline-pillar ${info.cls}">${p} · ${info.label}</span>`;
}

/** Inline per-objective CHECK button + feedback (F2). */
function checkRow(objId, label) {
  const result = state.results[objId];
  return `
    <div>
      <button type="button" class="btn btn-primary btn-check" data-action="check" data-obj="${objId}" data-focus-key="check-${objId}">${esc(label || "Check results")}</button>
      <div data-feedback-for="${objId}">${result ? feedbackBox(result) : ""}</div>
    </div>`;
}

function feedbackBox(result) {
  return `
    <div role="status" aria-live="polite" class="feedback ${result.ok ? "feedback-ok" : "feedback-no"}">
      <div class="feedback-title">${result.ok ? "✓" : "✗"} ${esc(result.title)}</div>
      <p class="feedback-msg">${esc(result.message)}</p>
    </div>`;
}

function stationHeader(index, title, sub) {
  return `
    <div class="station-header">
      <div class="micro-label teal-dim">Station ${esc(index)}</div>
      <h2 class="station-title">${esc(title)}</h2>
      ${sub ? `<p class="station-sub">${esc(sub)}</p>` : ""}
    </div>`;
}

function synthTag(cls) {
  return `<span class="synth-tag ${cls || ""}">synthetic training data</span>`;
}

function panelCard(inner, cls, id) {
  return `<section ${id ? `id="${id}" aria-label="${esc(id)}"` : ""} class="panel ${cls || ""}">${inner}</section>`;
}

function panelTitle(tag, title, right) {
  return `
    <div class="panel-title-row">
      <div class="panel-title-left">
        <span class="tag-chip">${esc(tag)}</span>
        <h3 class="panel-heading">${title}</h3>
      </div>
      ${right || ""}
    </div>`;
}

/** Integrity seal — amber when locked, dashed slate when open. */
function seal(locked, label) {
  return `
    <span role="img" aria-label="${esc(label)}: ${locked ? "sealed (immutable)" : "unsealed (mutable)"}"
          class="seal ${locked ? "seal-locked" : "seal-open"}">${locked ? "🔒 sealed" : "△ mutable"}</span>`;
}

// ── Term tooltips (glossary lookups; Radix Tooltip equivalent) ─────────────────
// Same lookup logic as the original Term component: startsWith OR includes,
// case-insensitive. One singleton tooltip element, ~200 ms delay, hover + focus.
let tooltipTimer = null;

function findGlossaryEntry(t) {
  const needle = t.toLowerCase();
  return GLOSSARY.find((g) => {
    const term = g.term.toLowerCase();
    return term.startsWith(needle) || term.includes(needle);
  });
}

function term(t, children) {
  const entry = findGlossaryEntry(t);
  return `<button type="button" class="term" data-term="${esc(t)}" aria-label="Definition of ${esc(entry ? entry.term : t)}">${esc(children || (entry ? entry.term : t))}</button>`;
}

function ensureTooltipEl() {
  let el = document.getElementById("term-tooltip");
  if (!el) {
    el = document.createElement("div");
    el.id = "term-tooltip";
    el.className = "term-tooltip";
    el.setAttribute("role", "tooltip");
    document.body.appendChild(el);
  }
  return el;
}

function showTermTooltip(trigger) {
  const t = trigger.getAttribute("data-term");
  const entry = findGlossaryEntry(t);
  const el = ensureTooltipEl();
  el.innerHTML = `<span class="term-tooltip-term">${esc(entry ? entry.term : t)}</span><span class="term-tooltip-def">${esc(entry ? entry.def : "See the glossary.")}</span>`;
  el.classList.add("show");
  // Position above the trigger, clamped to the viewport.
  const r = trigger.getBoundingClientRect();
  const width = Math.min(288, window.innerWidth - 16);
  let left = r.left + window.scrollX + r.width / 2 - width / 2;
  left = Math.max(8 + window.scrollX, Math.min(left, window.scrollX + window.innerWidth - width - 8));
  el.style.left = `${left}px`;
  el.style.width = `${width}px`;
  el.style.top = "0px"; // measure first
  const height = el.offsetHeight;
  let top = r.top + window.scrollY - height - 8;
  if (top < window.scrollY + 4) top = r.bottom + window.scrollY + 8; // flip below when clipped
  el.style.top = `${top}px`;
}

function hideTermTooltip() {
  const el = document.getElementById("term-tooltip");
  if (el) el.classList.remove("show");
}

function bindTermTooltips(root) {
  (root || document).querySelectorAll(".term").forEach((trigger) => {
    trigger.addEventListener("mouseenter", () => {
      clearTimeout(tooltipTimer);
      tooltipTimer = setTimeout(() => showTermTooltip(trigger), 200);
    });
    trigger.addEventListener("mouseleave", () => { clearTimeout(tooltipTimer); hideTermTooltip(); });
    trigger.addEventListener("focus", () => {
      clearTimeout(tooltipTimer);
      tooltipTimer = setTimeout(() => showTermTooltip(trigger), 200);
    });
    trigger.addEventListener("blur", () => { clearTimeout(tooltipTimer); hideTermTooltip(); });
    trigger.addEventListener("click", (e) => { e.preventDefault(); showTermTooltip(trigger); });
  });
  // ESC closes any open tooltip.
  if (!window.__termEscBound) {
    window.__termEscBound = true;
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") hideTermTooltip(); });
  }
}

// ── Dialog manager (Radix Dialog / AlertDialog / Sheet equivalents) ────────────
// Focus is trapped while open, ESC + overlay click close, focus returns to the
// trigger. variant "sheet" renders a bottom drawer; "alert" blocks overlay-close
// is NOT enabled (the original AlertDialog also closes on overlay click/ESC).
const dialogStack = [];

function openDialog(opts) {
  // opts: { id, title, description, content, variant: "dialog"|"sheet", labelledBy, onclose }
  const overlay = document.createElement("div");
  overlay.className = `overlay ${opts.variant === "sheet" ? "overlay-sheet" : ""}`;
  overlay.setAttribute("data-dialog-overlay", opts.id || "dialog");

  const panel = document.createElement("div");
  panel.className = `${opts.variant === "sheet" ? "sheet-panel" : "dialog-panel"}`;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  if (opts.title) {
    panel.setAttribute("aria-labelledby", `dlg-title-${opts.id || "x"}`);
  }

  let headerHtml = "";
  if (opts.title) {
    headerHtml = `
      <div class="dialog-header">
        <div>
          <h2 class="dialog-title" id="dlg-title-${opts.id || "x"}">${esc(opts.title)}</h2>
          ${opts.description ? `<p class="${opts.srOnlyDescription ? "sr-only" : "dialog-description"}">${esc(opts.description)}</p>` : ""}
        </div>
        <button type="button" class="dialog-close" data-dialog-close aria-label="Close">${icon("x", 16)}</button>
      </div>`;
  }

  panel.innerHTML = `${headerHtml}<div class="dialog-body">${opts.content || ""}</div>`;
  overlay.appendChild(panel);
  document.body.appendChild(overlay);
  document.body.classList.add("no-scroll");

  function close() {
    overlay.remove();
    document.body.classList.remove("no-scroll");
    const idx = dialogStack.indexOf(entry);
    if (idx >= 0) dialogStack.splice(idx, 1);
    document.removeEventListener("keydown", onKey, true);
    if (opts.onclose) opts.onclose();
    if (entry.trigger && document.contains(entry.trigger)) entry.trigger.focus();
  }

  function onKey(e) {
    if (e.key === "Escape") { e.stopPropagation(); close(); return; }
    if (e.key === "Tab") {
      // Light focus trap: cycle among focusable elements inside the panel.
      const focusables = panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  overlay.addEventListener("mousedown", (e) => { if (e.target === overlay) close(); });
  overlay.addEventListener("click", (e) => {
    const t = e.target.closest("[data-dialog-close]");
    if (t) close();
  });
  document.addEventListener("keydown", onKey, true);

  const entry = { overlay, close, trigger: document.activeElement };
  dialogStack.push(entry);

  // Focus the first focusable element.
  requestAnimationFrame(() => {
    const target = panel.querySelector("[data-autofocus]") || panel.querySelector('input, button, select, [href], [tabindex]:not([tabindex="-1"])');
    if (target) target.focus();
  });

  if (opts.afterOpen) opts.afterOpen(panel, close);
  return entry;
}
