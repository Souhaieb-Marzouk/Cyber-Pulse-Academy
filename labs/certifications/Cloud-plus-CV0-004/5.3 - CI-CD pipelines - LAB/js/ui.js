/**
 * The Deployment Factory — static port.
 * ui.js — shared visual primitives + control factories. Vanilla translations of
 * ui-bits.tsx and the Radix primitives the lab uses (Switch, Select, Dialog,
 * AlertDialog, Popover). Icons come from icons.js (exact lucide node data).
 */

/* ------------------------------- icons ------------------------------- */

const LUCIDE_ATTRS =
  'xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

/** Render a lucide icon as inline SVG. cls is a CSS class controlling size. */
function icon(name, cls) {
  const nodes = LUCIDE_NODES[name];
  if (!nodes) return "";
  const body = nodes.map(([tag, attrs]) => {
    const a = Object.entries(attrs)
      .map(([k, v]) => ` ${k}="${v}"`)
      .join("");
    return `<${tag}${a}></${tag}>`;
  });
  return `<svg ${LUCIDE_ATTRS} class="${cls || ""}" aria-hidden="true" focusable="false">${body.join("")}</svg>`;
}

/* ------------------------------- helpers ------------------------------ */

/** Escape text for HTML interpolation (all dynamic strings go through this). */
function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ------------------------- shared visual bits ------------------------- */

/** Status lamp with bezel (ui-bits.tsx Lamp). */
function lamp(status, size = "") {
  const cls = ["lamp", size, status].filter(Boolean).join(" ");
  return `<span class="${cls}" aria-hidden="true"></span>`;
}

/** Mastery-pillar badge (ui-bits.tsx PillarBadge). */
function pillarBadge(pillar) {
  return `<span class="badge badge-pillar" title="Mastery pillar: ${PILLAR_LABELS[pillar]}">${pillar} · ${PILLAR_LABELS[pillar].toUpperCase()}</span>`;
}

/** Hazard-stripe section header (ui-bits.tsx HazardHeader). */
function hazardHeader(title, iconName, iconSize = "i-4") {
  return `<div class="hazard-head">
    ${iconName ? `<span class="hh-icon">${icon(iconName, iconSize)}</span>` : ""}
    <h2>${title}</h2>
    <span class="hh-stripe" aria-hidden="true"></span>
  </div>`;
}

/** Training-note strip (ui-bits.tsx TrainingNote). */
function trainingNote() {
  return `<p class="training-note">${esc(TRAINING_NOTE)}</p>`;
}

/* --------------------------- controls -------------------------------- */

/** role="switch" button (Radix Switch → vanilla). */
function switchControl(checked, label, fkey, attrs = "") {
  return `<button type="button" role="switch" aria-checked="${checked}" aria-label="${esc(label)}" data-fk="${esc(fkey)}" class="switch" ${attrs}><span class="thumb"></span></button>`;
}

/** Native select styled like the Radix trigger (see Conversion Notes). */
function selectControl({ value, options, label, fkey, placeholder = "select…", disabled = false, cls = "", attrs = "", allowEmpty = false }) {
  const opts = [];
  if (placeholder && (allowEmpty || value === "")) {
    opts.push(`<option value="" ${value === "" ? "selected" : ""} ${allowEmpty ? "" : "disabled"}>${esc(placeholder)}</option>`);
  }
  for (const o of options) {
    const val = typeof o === "string" ? o : o.value;
    const lbl = typeof o === "string" ? o : o.label;
    opts.push(`<option value="${esc(val)}" ${String(val) === String(value) ? "selected" : ""}>${esc(lbl)}</option>`);
  }
  return `<select class="select ${value === "" ? "empty" : ""} ${cls}" aria-label="${esc(label)}" data-fk="${esc(fkey)}" ${disabled ? "disabled" : ""} ${attrs}>${opts.join("")}</select>`;
}

/** Text/number input (station controls). */
function inputControl({ value, label, fkey, type = "text", placeholder = "", cls = "", attrs = "" }) {
  return `<input type="${type}" class="input ${cls}" value="${esc(value)}" placeholder="${esc(placeholder)}" aria-label="${esc(label)}" data-fk="${esc(fkey)}" ${attrs} />`;
}

/* --------------------------- glossary popover ------------------------- */

const GLOSSARY_POPUP_ID = "glossary-popover";
let glossaryOpenFor = null;

function gterm(term) {
  const entry = GLOSSARY.find((g) => g.term.toLowerCase() === term.toLowerCase());
  if (!entry) return esc(term);
  return `<button type="button" class="gterm-btn" data-glossary="${esc(entry.term)}" aria-label="Glossary: ${esc(entry.term)}" aria-expanded="false">${esc(entry.term)}</button>`;
}

/** Inline monospace highlight for prose (ModeSelect Gterm). */
function gtermInline(text) {
  return `<span class="gterm-inline">${esc(text)}</span>`;
}

function closeGlossaryPopover() {
  const pop = document.getElementById(GLOSSARY_POPUP_ID);
  if (pop) pop.remove();
  glossaryOpenFor = null;
}

function toggleGlossaryPopover(btn) {
  const term = btn.getAttribute("data-glossary");
  const entry = GLOSSARY.find((g) => g.term === term);
  if (!entry) return;
  if (glossaryOpenFor === term) {
    closeGlossaryPopover();
    return;
  }
  closeGlossaryPopover();
  glossaryOpenFor = term;
  btn.setAttribute("aria-expanded", "true");
  const pop = document.createElement("div");
  pop.id = GLOSSARY_POPUP_ID;
  pop.className = "glossary-pop";
  pop.setAttribute("role", "dialog");
  pop.innerHTML = `<p class="gp-term">${esc(entry.term)}</p><p class="gp-def">${esc(entry.def)}</p>`;
  document.body.appendChild(pop);
  const r = btn.getBoundingClientRect();
  const popH = pop.offsetHeight;
  const below = r.bottom + 8 + popH <= window.innerHeight - 8;
  pop.style.left = Math.max(12, Math.min(r.left, window.innerWidth - pop.offsetWidth - 12)) + "px";
  pop.style.top = (below ? r.bottom + 8 : r.top - popH - 8) + "px";
  pop.focus?.();
  pop.setAttribute("tabindex", "-1");
}

/* ------------------------------ modals -------------------------------- */

function isFocusable(el) {
  return (
    !el.disabled &&
    el.getAttribute("aria-disabled") !== "true" &&
    (el.tagName === "BUTTON" || el.tagName === "A" || el.tagName === "INPUT" || el.tagName === "SELECT" || el.tagName === "TEXTAREA") &&
    el.tabIndex >= 0
  );
}

/**
 * Dialog factory (Radix Dialog/AlertDialog → vanilla).
 * - Escape and overlay click close (alert dialogs route through onCancel).
 * - Focus is trapped inside the panel and restored to the opener on close.
 * opts: { labelId, descId, onClose, onCancel, showClose, panelClass, initialFocus }
 */
function openModal(opts) {
  const { labelId, descId, onClose, onCancel, showClose = true, panelClass = "", initialFocus } = opts;
  const closeFn = onCancel || onClose;
  const opener = document.activeElement;
  let closed = false;

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal-panel factory-scroll ${panelClass}" role="dialog" aria-modal="true" aria-labelledby="${labelId}" ${descId ? `aria-describedby="${descId}"` : ""} tabindex="-1">
      ${showClose ? `<button type="button" class="modal-close" aria-label="Close">${icon("x")}</button>` : ""}
      <div class="modal-slot"></div>
    </div>`;
  document.body.appendChild(overlay);
  const panel = overlay.querySelector(".modal-panel");
  const slot = overlay.querySelector(".modal-slot");

  function close(skipCallback) {
    if (closed) return;
    closed = true;
    document.removeEventListener("keydown", onKey, true);
    overlay.remove();
    if (opener && document.contains(opener)) opener.focus();
    if (!skipCallback && typeof closeFn === "function") closeFn();
  }
  function onKey(e) {
    if (e.key === "Escape") {
      e.stopPropagation();
      close();
    } else if (e.key === "Tab") {
      const focusables = Array.from(panel.querySelectorAll("button, a[href], input, select, textarea")).filter(isFocusable);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }
  document.addEventListener("keydown", onKey, true);
  overlay.addEventListener("mousedown", (e) => {
    if (e.target === overlay) close();
  });
  const closeBtn = overlay.querySelector(".modal-close");
  if (closeBtn) closeBtn.addEventListener("click", close);

  requestAnimationFrame(() => {
    if (initialFocus && panel.contains(initialFocus())) initialFocus().focus();
    else panel.focus();
  });

  return { overlay, panel, slot, close };
}

/* --------------------- render helpers (focus + scroll) ----------------- */

/**
 * Replace a region's innerHTML while preserving focus (via data-fk keys) and
 * scroll positions of marked scroll containers ([data-ks]) — this keeps the
 * re-render visually equivalent to React's diff-based re-render.
 */
function rerenderRegion(regionEl, buildFn) {
  const active = document.activeElement;
  const fk = active && active.getAttribute ? active.getAttribute("data-fk") : null;
  const caret = active && typeof active.selectionStart === "number" ? active.selectionStart : null;
  const scrolls = regionEl.querySelectorAll("[data-ks]").length ? Array.from(regionEl.querySelectorAll("[data-ks]")).map((el) => el.scrollTop) : null;
  regionEl.innerHTML = buildFn();
  if (scrolls) {
    Array.from(regionEl.querySelectorAll("[data-ks]")).forEach((el, i) => {
      if (scrolls[i]) el.scrollTop = scrolls[i];
    });
  }
  if (fk) {
    const next = regionEl.querySelector(`[data-fk="${CSS.escape(fk)}"]`);
    if (next) {
      next.focus({ preventScroll: true });
      if (caret !== null && typeof next.setSelectionRange === "function") {
        try {
          next.setSelectionRange(caret, caret);
        } catch {
          /* not a text input */
        }
      }
    }
  }
}
