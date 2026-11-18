// ── Shared UI primitives for The Octet Works ───────────────────────────────
// Vanilla ports of ui-bits.tsx + the Radix dialog/popover behaviors used by
// the original (modal dialogs with focus trap & Escape/outside close, and the
// anchored glossary Tip popover).
"use strict";

var UI = (function () {
  // ── icons ──────────────────────────────────────────────────────────────────
  const esc = (s) =>
    String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  /** Render a lucide icon by lab-source name with the same default styling. */
  function icon(name, cls = "", ariaHidden = true, label = null) {
    const node = LAB_ICONS[name];
    if (!node) return "";
    const inner = node
      .map(([tag, attrs]) => {
        const a = Object.entries(attrs).map(([k, v]) => `${k}="${esc(v)}"`).join(" ");
        return `<${tag} ${a}></${tag}>`;
      })
      .join("");
    const aria = ariaHidden ? ' aria-hidden="true"' : ` aria-label="${esc(label || name)}" role="img"`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon ${cls}"${aria}>${inner}</svg>`;
  }

  // ── small component builders (return HTML strings) ────────────────────────
  const PILLAR_META = {
    P1: { label: "UNDERSTAND", cls: "pillar-p1" },
    P2: { label: "RECOGNIZE", cls: "pillar-p2" },
    P3: { label: "DIAGNOSE", cls: "pillar-p3" },
    P4: { label: "CONFIGURE", cls: "pillar-p4" },
  };

  const pillarBadge = (p, cls = "") =>
    `<span class="pillar-badge ${PILLAR_META[p].cls} ${cls}">${p} · ${PILLAR_META[p].label}</span>`;

  const stamped = (done) =>
    done
      ? `<span class="stamped-badge">${icon("Stamp", "icon-12")} STAMPED</span>`
      : "";

  const machineHeader = (title, tag, right = "") => `
    <div class="machine-header">
      <div class="machine-header-left">
        <span aria-hidden="true" class="hazard-band"></span>
        <h3 class="machine-title">${esc(title)}</h3>
        ${tag ? `<span class="machine-tag">${esc(tag)}</span>` : ""}
      </div>
      ${right}
    </div>`;

  const syntheticTag = () => `<span class="synthetic-tag">synthetic training data</span>`;

  const paper = (content, cls = "") => `<div class="paper ${cls}">${content}</div>`;

  /** Radio-style list of choice buttons (ChoiceRow in the original). */
  function choiceRow(options, value, group, label) {
    return `
      <fieldset class="choice-row" data-choice-group="${group}">
        <legend class="choice-legend">${esc(label)}</legend>
        ${options
          .map(
            (o) => `
          <button type="button" data-action="pick-choice" data-group="${group}" data-key="${o.key}"
            aria-pressed="${value === o.key}"
            class="choice-btn ${value === o.key ? "is-selected" : ""}">${esc(o.label)}</button>`
          )
          .join("")}
      </fieldset>`;
  }

  function selectField({ label, value, onChangeAttr, options, placeholder, ariaLabel, id, cls = "" }) {
    return `
      <div class="select-field ${cls}">
        ${label ? `<label class="select-label" ${id ? `for="${id}"` : ""}>${esc(label)}</label>` : ""}
        <select ${id ? `id="${id}"` : ""} ${onChangeAttr} ${ariaLabel ? `aria-label="${esc(ariaLabel)}"` : ""}
          class="select-input">
          <option value="">${esc(placeholder ?? "— select —")}</option>
          ${options.map((o) => `<option value="${esc(o.value)}"${String(value) === String(o.value) ? " selected" : ""}>${esc(o.label)}</option>`).join("")}
        </select>
      </div>`;
  }

  /** The signature 32-bit rail (BitRail in the original). */
  function bitRail(ip, prefix, caption = "") {
    const long = NET.ipToLong(ip);
    const bits = long === null ? null : NET.octetBits(long);
    const mask = NET.maskFromPrefix(prefix);
    const octets = [0, 1, 2, 3]
      .map((oct) => {
        const cells = bits
          ? Array.from({ length: 8 }, (_, i) => {
              const idx = oct * 8 + i;
              const isNet = idx < prefix;
              return `<span class="bit-cell ${isNet ? "bit-net" : "bit-host"}">${bits[oct][i]}</span>`;
            })
          : Array.from({ length: 8 }, () => `<span class="bit-cell bit-empty"></span>`).join("");
        return `<div class="bit-octet"><div class="bit-row" aria-hidden="true">${cells}</div><div class="bit-dec">${bits ? ip.split(".")[oct] : "·"}</div></div>`;
      })
      .join("");
    const usable = Math.max(0, Math.pow(2, 32 - prefix) - 2);
    return `
      <figure class="bitrail">
        <figcaption class="bitrail-cap">
          <span class="bitrail-ip">${esc(ip)}<span class="amber">/${prefix}</span>${
            caption ? `<span class="bitrail-caption">${esc(caption)}</span>` : ""
          }</span>
          <span class="bitrail-mask">mask ${mask ?? "—"}</span>
        </figcaption>
        <div class="bitrail-scroll"><div class="bitrail-track">${octets}</div></div>
        <figcaption class="bitrail-legend">
          <span class="bitrail-legend-item"><span class="swatch swatch-net"></span> network bits (${prefix})</span>
          <span class="bitrail-legend-item"><span class="swatch swatch-host"></span> host bits (${32 - prefix})</span>
          <span>2^${32 - prefix} addresses · ${usable} usable</span>
        </figcaption>
      </figure>`;
  }

  // ── glossary Tip popover ──────────────────────────────────────────────────
  let tipEl = null;
  let tipAnchor = null;

  function tipKeydown(e) {
    if (e.key === "Escape") {
      e.stopPropagation();
      closeTip();
    }
  }

  function closeTip() {
    if (tipEl) { tipEl.remove(); tipEl = null; }
    if (tipAnchor) { tipAnchor.setAttribute("aria-expanded", "false"); tipAnchor = null; }
    document.removeEventListener("scroll", repositionOrClose, true);
    window.removeEventListener("resize", repositionOrClose);
    document.removeEventListener("keydown", tipKeydown, true);
  }

  function repositionOrClose() {
    if (!tipEl || !tipAnchor) return closeTip();
    positionTip();
  }

  function positionTip() {
    if (!tipEl || !tipAnchor) return;
    const r = tipAnchor.getBoundingClientRect();
    const tw = tipEl.offsetWidth;
    const th = tipEl.offsetHeight;
    let top = r.bottom + 8;
    if (top + th > window.innerHeight - 8) top = Math.max(8, r.top - th - 8);
    let left = r.left + r.width / 2 - tw / 2;
    left = Math.min(Math.max(8, left), window.innerWidth - tw - 8);
    tipEl.style.top = `${top}px`;
    tipEl.style.left = `${left}px`;
  }

  function openTip(anchor) {
    const term = anchor.getAttribute("data-term");
    const entry = GLOSSARY.find((g) => g.term.toLowerCase() === term.toLowerCase());
    closeTip();
    if (!entry) return;
    tipAnchor = anchor;
    anchor.setAttribute("aria-expanded", "true");
    tipEl = document.createElement("div");
    tipEl.className = "tip-popover";
    tipEl.setAttribute("role", "dialog");
    tipEl.setAttribute("aria-label", `Definition of ${entry.term}`);
    tipEl.innerHTML = `<p class="tip-term">${esc(entry.term)}</p>${esc(entry.def)}`;
    document.body.appendChild(tipEl);
    positionTip();
    // keep anchored while scrolling (capture: scroll containers too); Escape closes
    document.addEventListener("scroll", repositionOrClose, true);
    window.addEventListener("resize", repositionOrClose);
    document.addEventListener("keydown", tipKeydown, true);
  }

  const tip = (term, children = null) =>
    `<button type="button" class="tip-trigger" data-action="toggle-tip" data-term="${esc(term)}" aria-expanded="false" aria-label="Definition of ${esc(term)}">${children ?? esc(term)} ${icon("HelpCircle", "icon-12 tip-icon")}</button>`;

  // ── modal dialogs (Dialog / AlertDialog equivalents) ──────────────────────
  let openDialogEl = null;
  let dialogReturnFocus = null;

  function closeDialog() {
    if (!openDialogEl) return;
    const d = openDialogEl;
    openDialogEl = null;
    d.remove();
    document.removeEventListener("keydown", dialogKeydown, true);
    if (dialogReturnFocus && document.contains(dialogReturnFocus)) {
      try { dialogReturnFocus.focus(); } catch (e) { /* noop */ }
    }
    dialogReturnFocus = null;
  }

  function dialogKeydown(e) {
    if (!openDialogEl) return;
    if (e.key === "Escape") {
      e.stopPropagation();
      closeDialog();
    } else if (e.key === "Tab") {
      // simple focus trap
      const focusables = openDialogEl.querySelectorAll(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  /**
   * Open a modal dialog. opts: { labelledBy, content, onDismiss (optional) }
   * Close paths: Escape, overlay click, [data-close-dialog] buttons.
   */
  function openDialog(opts) {
    closeDialog();
    closeTip();
    dialogReturnFocus = document.activeElement;
    const overlay = document.createElement("div");
    overlay.className = "dialog-overlay";
    overlay.innerHTML = `
      <div class="dialog-panel" role="dialog" aria-modal="true" ${opts.labelledBy ? `aria-labelledby="${opts.labelledBy}"` : ""}>
        ${opts.content}
      </div>`;
    overlay.addEventListener("mousedown", (e) => {
      if (e.target === overlay) closeDialog(); // click on overlay (outside panel) dismisses
    });
    document.body.appendChild(overlay);
    openDialogEl = overlay;
    document.addEventListener("keydown", dialogKeydown, true);
    const auto = overlay.querySelector("[data-autofocus]") || overlay.querySelector('button, a[href], input, select, textarea');
    if (auto) auto.focus();
  }

  const isDialogOpen = () => !!openDialogEl;

  // ── focus preservation across region re-renders ───────────────────────────
  function captureFocus(root) {
    const el = document.activeElement;
    if (el && root && root.contains(el) && el.hasAttribute("data-fid")) return el.getAttribute("data-fid");
    return null;
  }

  function restoreFocus(root, fid) {
    if (!fid) return;
    const el = root.querySelector(`[data-fid="${CSS.escape(fid)}"]`);
    if (el && !el.disabled) { try { el.focus(); } catch (e) { /* noop */ } }
  }

  return {
    esc, icon, pillarBadge, stamped, machineHeader, syntheticTag, paper,
    choiceRow, selectField, bitRail, tip, openTip, closeTip,
    openDialog, closeDialog, isDialogOpen, captureFocus, restoreFocus,
    PILLAR_META,
  };
})();
