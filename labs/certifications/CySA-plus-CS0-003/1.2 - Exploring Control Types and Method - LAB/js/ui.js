/* ═══════════════════════════════════════════════════════════════════════════
   THE CONTROL GRID — js/ui.js
   Shared rendering helpers: inline SVG icons (Lucide paths), small template
   components, dialog + tooltip managers, focus-safe re-render support.
   ═══════════════════════════════════════════════════════════════════════════ */

"use strict";

(function () {
  /* ─── Escaping ─────────────────────────────────────────────────────────── */

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /* ─── Icons (inline SVG, Lucide path data, 24×24 viewBox) ──────────────── */

  var ICON_PATHS = {
    "shield-check": '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    "folder-open": '<path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/>',
    "book-open": '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    "grid-3x3": '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/>',
    layers: '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/>',
    crosshair: '<circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/>',
    "scan-search": '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/><path d="m16 16-1.9-1.9"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
    siren: '<path d="M7 18v-6a5 5 0 1 1 10 0v6"/><path d="M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z"/><path d="M21 12h1"/><path d="M18.5 4.5 18 5"/><path d="M2 12h1"/><path d="M12 2v1"/><path d="m4.929 4.929.707.707"/><path d="M12 12v6"/>',
    wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    "circle-check-big": '<path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/>',
    "circle-x": '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    "chevron-right": '<path d="m9 18 6-6-6-6"/>',
    "chevron-up": '<path d="m18 15-6-6-6 6"/>',
    "chevron-down": '<path d="m6 9 6 6 6-6"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    lightbulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    "rotate-ccw": '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',
    search: '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
    star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
    "external-link": '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    "scroll-text": '<path d="M15 12h-5"/><path d="M15 8h-5"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/>',
    "graduation-cap": '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
  };

  var STATION_ICON_MAP = {
    folder: "folder-open",
    book: "book-open",
    grid: "grid-3x3",
    layers: "layers",
    crosshair: "crosshair",
    scan: "scan-search",
    target: "target",
    wallet: "wallet",
    siren: "siren",
    wrench: "wrench",
  };

  /** icon("name", cls) → inline SVG string. */
  function icon(name, cls, filled) {
    var paths = ICON_PATHS[name] || ICON_PATHS["grid-3x3"];
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="' +
      (filled ? "currentColor" : "none") +
      '" stroke="' +
      (filled ? "none" : "currentColor") +
      '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon ' +
      (cls || "") +
      '" aria-hidden="true">' +
      paths +
      "</svg>"
    );
  }

  function stationIcon(key, cls) {
    return icon(STATION_ICON_MAP[key] || "grid-3x3", cls);
  }

  /* ─── Small template components ────────────────────────────────────────── */

  function consoleLabel(text, cls) {
    return '<span class="console-label ' + (cls || "") + '">' + esc(text) + "</span>";
  }

  function pillarBadge(pillar, cls) {
    var pclass = { UNDERSTAND: "pillar-u", RECOGNIZE: "pillar-r", DETECT: "pillar-d", MITIGATE: "pillar-m" }[pillar] || "";
    return (
      '<span class="pillar-badge ' + pclass + " " + (cls || "") + '">' + esc(pillar) + "</span>"
    );
  }

  function pillarBarClass(pillar) {
    return { UNDERSTAND: "pillar-bar-u", RECOGNIZE: "pillar-bar-r", DETECT: "pillar-bar-d", MITIGATE: "pillar-bar-m" }[pillar] || "";
  }

  function stationBadge(station) {
    return (
      '<span class="station-badge">' +
      stationIcon(station.icon, "icon-sm text-primary") +
      esc(station.name) +
      "</span>"
    );
  }

  function gridSigil(cls) {
    return icon("shield-check", cls || "icon-lg text-primary");
  }

  function progressRing(value, max, label) {
    var size = 40;
    var pct = max === 0 ? 0 : value / max;
    var r = (size - 6) / 2;
    var c = 2 * Math.PI * r;
    return (
      '<div class="progress-ring" role="img" aria-label="' +
      esc(label) +
      '" style="width:' +
      size +
      "px;height:" +
      size +
      'px">' +
      '<svg width="' +
      size +
      '" height="' +
      size +
      '" style="transform:rotate(-90deg)">' +
      '<circle cx="' +
      size / 2 +
      '" cy="' +
      size / 2 +
      '" r="' +
      r +
      '" fill="none" stroke="oklch(0.3 0.015 75)" stroke-width="3.5"/>' +
      '<circle cx="' +
      size / 2 +
      '" cy="' +
      size / 2 +
      '" r="' +
      r +
      '" fill="none" stroke="oklch(0.8 0.13 80)" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="' +
      c +
      '" stroke-dashoffset="' +
      c * (1 - pct) +
      '" style="transition:stroke-dashoffset .5s"/>' +
      "</svg>" +
      '<span class="ring-text">' +
      (max === 0 ? "–" : value + "/" + max) +
      "</span>" +
      "</div>"
    );
  }

  /** The 3×6 Control Grid board. filled = { "Cat|Type": true } */
  function matrixBoard(filled, legend) {
    if (legend === undefined) legend = true;
    var out =
      '<div class="matrix-board" role="img" aria-label="The Control Grid: three categories by six types"><div class="matrix-grid">';
    out += "<div></div>";
    CG.CONTROL_TYPES.forEach(function (t) {
      out += '<div class="matrix-col-label" title="' + esc(t) + '">' + CG.TYPE_ABBR[t] + "</div>";
    });
    CG.CATEGORIES.forEach(function (cat) {
      out += '<div class="matrix-row-label" title="' + esc(cat) + '">' + CG.CAT_ABBR[cat] + "</div>";
      CG.CONTROL_TYPES.forEach(function (t) {
        var on = filled && filled[cat + "|" + t];
        out +=
          '<div class="matrix-cell' +
          (on ? " on" : "") +
          '">' +
          (on ? '<span class="dot-on"></span>' : '<span class="dot-off"></span>') +
          "</div>";
      });
    });
    out += "</div>";
    if (legend) {
      out +=
        '<div class="matrix-legend">' +
        consoleLabel("MGR managerial · OPS operational · TEC technical", "text-[9px]") +
        consoleLabel("rows = who · cols = method", "text-[9px]") +
        "</div>";
    }
    out += "</div>";
    return out;
  }

  function safetyStrip(cls) {
    return (
      '<div class="safety-strip ' +
      (cls || "") +
      '"><span class="pulse-dot" aria-hidden="true"></span>' +
      consoleLabel("Training simulation · all data synthetic · defensive framing", "text-[9px]") +
      "</div>"
    );
  }

  /** Glossary tooltip trigger (dotted underline term): shows `visible`, tips with `def`. */
  function tip(visible, def, key) {
    return (
      '<span class="term-tip" tabindex="0" data-tip="' +
      esc(def) +
      '" data-tipkey="' +
      esc(key || "") +
      '">' +
      "<span>" +
      esc(visible) +
      "</span></span>"
    );
  }

  /* ─── Feedback block (attempt-gated items come from the check engine) ──── */

  function feedbackBlock(outcome) {
    var itemsHtml = "";
    if (outcome.items.length > 0) {
      itemsHtml =
        '<ul class="feedback-items">' +
        outcome.items
          .map(function (it) {
            return (
              "<li>" +
              icon(it.ok ? "circle-check-big" : "circle-x", it.ok ? "icon-xs ok-icon" : "icon-xs bad-icon") +
              "<span><span class='feedback-item-label'>" +
              esc(it.label) +
              "</span>" +
              "<span class='feedback-item-why'>" +
              esc(it.why) +
              "</span></span></li>"
            );
          })
          .join("") +
        "</ul>";
    }
    return (
      '<div class="feedback-block ' +
      (outcome.pass ? "is-pass" : "is-fail") +
      '" role="status" aria-live="polite">' +
      '<div class="feedback-head">' +
      icon(outcome.pass ? "circle-check-big" : "circle-x", outcome.pass ? "icon-sm ok-icon" : "icon-sm bad-icon") +
      "<div>" +
      '<p class="feedback-summary">' +
      esc(outcome.summary) +
      "</p>" +
      itemsHtml +
      '<p class="feedback-teach"><span class="teach-label">why it matters — </span>' +
      esc(outcome.teach) +
      "</p>" +
      "</div></div></div>"
    );
  }

  /* ─── Verdict styling helpers (same color semantics as the original) ───── */

  function verdictCls(revealed, ok, selected) {
    if (revealed && ok) return "v-ok";
    if (revealed && ok === false && selected) return "v-bad";
    if (selected) return "v-sel";
    return "v-idle";
  }

  function segmentedCls(revealed, ok, selected) {
    if (revealed && ok) return "sg-ok";
    if (revealed && ok === false && selected) return "sg-bad";
    if (selected) return "sg-sel";
    return "sg-idle";
  }

  /* ─── Dialog manager (Radix-equivalent behavior, minimal) ────────────────
     - AlertDialog-style: Escape closes, overlay click does NOT close.
     - Dialog-style: Escape and overlay click both close.
     - Focus moves into the dialog on open and returns to the opener on close.
     - Tab is trapped inside while open. */

  var openDialog = null; // { el, opener, dismissable }

  function buildOverlay(opts) {
    var overlay = document.createElement("div");
    overlay.className = "dialog-overlay";
    overlay.setAttribute("data-dialog", opts.name || "");
    var content = document.createElement("div");
    content.className = "dialog-content lab-scope " + (opts.cls || "");
    content.setAttribute("role", opts.role === "dialog" ? "dialog" : "alertdialog");
    content.setAttribute("aria-modal", "true");
    if (opts.labelledBy) content.setAttribute("aria-labelledby", opts.labelledBy);
    if (opts.describedBy) content.setAttribute("aria-describedby", opts.describedBy);
    content.innerHTML = opts.html;
    overlay.appendChild(content);
    return overlay;
  }

  function showDialog(opts) {
    closeDialog(false);
    var overlay = buildOverlay(opts);
    document.body.appendChild(overlay);
    openDialog = { el: overlay, opener: document.activeElement, dismissable: !!opts.dismissable };
    // Dialog-style (dismissable) dialogs close on an overlay self-click —
    // i.e. a click that lands on the overlay OUTSIDE the dialog panel.
    // AlertDialog-style dialogs (reset/nudge) are click-proof by design.
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay && openDialog && openDialog.dismissable) closeDialog(true);
    });
    // Focus the first focusable inside (prefer [data-autofocus])
    var target = overlay.querySelector("[data-autofocus]") || overlay.querySelector("button, input, [tabindex]");
    if (target) target.focus();
    return overlay;
  }

  function closeDialog(restoreFocus) {
    if (!openDialog) return;
    var el = openDialog.el;
    var opener = openDialog.opener;
    el.parentNode.removeChild(el);
    openDialog = null;
    if (CG.app) CG.app.dialogClosed(el.getAttribute("data-dialog"));
    if (restoreFocus !== false && opener && opener.isConnected) opener.focus();
  }

  function dialogIsOpen(name) {
    return openDialog && openDialog.el.getAttribute("data-dialog") === name;
  }

  function trapTab(e) {
    if (!openDialog) return;
    var focusables = openDialog.el.querySelectorAll(
      'button, input, [href], [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  document.addEventListener("keydown", function (e) {
    if (!openDialog) return;
    if (e.key === "Escape") {
      e.preventDefault();
      closeDialog(true);
    } else if (e.key === "Tab") {
      trapTab(e);
    }
  });

  /* ─── Tooltip manager (glossary term tips) ─────────────────────────────── */

  var tipEl = null;

  function showTip(trigger) {
    hideTip();
    tipEl = document.createElement("div");
    tipEl.className = "term-popover";
    tipEl.setAttribute("role", "tooltip");
    tipEl.textContent = trigger.getAttribute("data-tip");
    document.body.appendChild(tipEl);
    var r = trigger.getBoundingClientRect();
    var tr = tipEl.getBoundingClientRect();
    var left = Math.max(8, Math.min(r.left + r.width / 2 - tr.width / 2, window.innerWidth - tr.width - 8));
    var top = r.top - tr.height - 8;
    if (top < 8) top = r.bottom + 8;
    tipEl.style.left = left + window.scrollX + "px";
    tipEl.style.top = top + window.scrollY + "px";
  }

  function hideTip() {
    if (tipEl) {
      tipEl.parentNode.removeChild(tipEl);
      tipEl = null;
    }
  }

  // Delegated hover/focus handling for term tips
  document.addEventListener("mouseover", function (e) {
    var t = e.target.closest ? e.target.closest(".term-tip") : null;
    if (t) showTip(t);
  });
  document.addEventListener("mouseout", function (e) {
    var t = e.target.closest ? e.target.closest(".term-tip") : null;
    if (t) hideTip();
  });
  document.addEventListener("focusin", function (e) {
    var t = e.target.closest ? e.target.closest(".term-tip") : null;
    if (t) showTip(t);
  });
  document.addEventListener("focusout", function (e) {
    var t = e.target.closest ? e.target.closest(".term-tip") : null;
    if (t) hideTip();
  });

  /* ─── Focus-preserving render helper ─────────────────────────────────────
     Re-rendering loses focus; we remember the focused element by a stable
     data-fk key and restore it after the swap. */

  function focusKey(el) {
    if (!el || el === document.body) return null;
    if (el.getAttribute && el.getAttribute("data-fk")) return el.getAttribute("data-fk");
    // Walk up to the nearest element carrying a data-fk
    var node = el;
    while (node && node !== document.body) {
      if (node.getAttribute && node.getAttribute("data-fk")) return node.getAttribute("data-fk");
      node = node.parentNode;
    }
    return null;
  }

  function renderWithFocus(container, html) {
    var active = document.activeElement;
    var fk = focusKey(active);
    var selStart = active && active.selectionStart !== undefined ? active.selectionStart : null;
    var selEnd = active && active.selectionEnd !== undefined ? active.selectionEnd : null;
    container.innerHTML = html;
    if (fk) {
      var next = container.querySelector('[data-fk="' + fk.replace(/"/g, '\\"') + '"]');
      if (next) {
        next.focus();
        if (selStart !== null && next.setSelectionRange) {
          try {
            next.setSelectionRange(selStart, selEnd);
          } catch (e) {
            /* not a text input */
          }
        }
      }
    }
  }

  /* ─── Export ───────────────────────────────────────────────────────────── */

  CG.ui = {
    esc: esc,
    icon: icon,
    stationIcon: stationIcon,
    consoleLabel: consoleLabel,
    pillarBadge: pillarBadge,
    pillarBarClass: pillarBarClass,
    stationBadge: stationBadge,
    gridSigil: gridSigil,
    progressRing: progressRing,
    matrixBoard: matrixBoard,
    safetyStrip: safetyStrip,
    tip: tip,
    feedbackBlock: feedbackBlock,
    verdictCls: verdictCls,
    segmentedCls: segmentedCls,
    showDialog: showDialog,
    closeDialog: closeDialog,
    dialogIsOpen: dialogIsOpen,
    renderWithFocus: renderWithFocus,
  };
})();
