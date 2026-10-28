// ─── Threat Hunt Expedition — shared UI primitives & widgets ─────────────────
// Static port of ui-bits.tsx + stations/kit.tsx primitives + modal plumbing.
// Visual language: deep pine field-station, amber signals, parchment documents.

window.HuntUI = (function () {
  "use strict";

  // ── Lab metadata (from types.ts) ───────────────────────────────────────────
  var PILLAR_META = {
    P1: { label: "Understand", short: "P1", color: "amber" },
    P2: { label: "Recognize / Analyze", short: "P2", color: "lime" },
    P3: { label: "Detect", short: "P3", color: "orange" },
    P4: { label: "Mitigate", short: "P4", color: "rose" },
  };
  var PILLAR_LABEL = {
    P1: "P1 · Understand",
    P2: "P2 · Recognize",
    P3: "P3 · Detect",
    P4: "P4 · Mitigate",
  };
  var STATION_META = {
    satchel: { label: "Intel Satchel", sub: "Bulletins & the intelligence cycle", waypoint: "WP-01" },
    slate: { label: "Tracker's Slate", sub: "Hunt types & hypothesis", waypoint: "WP-02" },
    scanner: { label: "Track Scanner", sub: "Query the telemetry", waypoint: "WP-03" },
    instruments: { label: "Instruments", sub: "ATT&CK · Kill Chain · Diamond", waypoint: "WP-04" },
    ledger: { label: "Specimen Ledger", sub: "Threat actors & profiling", waypoint: "WP-05" },
    dispatch: { label: "Dispatch Radio", sub: "Share intel · close the loop", waypoint: "WP-06" },
  };
  var PHASE_STEPS = [
    { id: "briefing", label: "SITREP" },
    { id: "manual", label: "MANUAL" },
    { id: "ops", label: "TRAIL" },
    { id: "quiz", label: "EXAM" },
    { id: "debrief", label: "DEBRIEF" },
  ];
  var PHASE_LABEL = {
    basecamp: "Basecamp",
    briefing: "Situation report",
    manual: "Field manual",
    ops: "The trail",
    quiz: "Field exam",
    debrief: "Debrief",
    complete: "Complete",
  };
  var STATION_ICONS = {
    satchel: "inbox",
    slate: "notebook-pen",
    scanner: "radar",
    instruments: "compass",
    ledger: "book-user",
    dispatch: "radio-tower",
  };

  // ── DOM helpers ────────────────────────────────────────────────────────────
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /** Build an element from an HTML string. */
  function h(html) {
    var t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function icon(name, cls) {
    return window.HuntIcon(name, cls);
  }

  // ── Glossary term tooltip (hover + keyboard focus) ─────────────────────────
  var tipEl = null;
  var tipAnchor = null;

  function ensureTip() {
    if (!tipEl) {
      tipEl = h('<div class="term-tip" role="tooltip" hidden></div>');
      document.body.appendChild(tipEl);
    }
    return tipEl;
  }

  function showTip(btn) {
    var entry = (window.HuntData.glossary.filter(function (g) { return g.id === btn.getAttribute("data-term"); })[0]) || null;
    if (!entry) return;
    var tip = ensureTip();
    tipAnchor = btn;
    tip.innerHTML =
      '<p class="term-tip-title">' + esc(entry.term) + "</p>" +
      '<p class="term-tip-body">' + esc(entry.def) + "</p>";
    tip.hidden = false;
    // position above the anchor, clamped to the viewport
    var r = btn.getBoundingClientRect();
    tip.style.left = "0px";
    tip.style.top = "0px";
    var tw = tip.offsetWidth;
    var th = tip.offsetHeight;
    var left = Math.max(8, Math.min(r.left + r.width / 2 - tw / 2, window.innerWidth - tw - 8));
    var top = r.top - th - 8;
    if (top < 8) top = r.bottom + 8;
    tip.style.left = left + window.scrollX + "px";
    tip.style.top = top + window.scrollY + "px";
  }

  function hideTip() {
    if (tipEl) tipEl.hidden = true;
    tipAnchor = null;
  }

  /** Inline glossary term button — full definition lives in the aria-label. */
  function term(id) {
    var entry = window.HuntData.glossary.filter(function (g) { return g.id === id; })[0];
    if (!entry) return "";
    return (
      '<button type="button" class="term" data-term="' + esc(id) + '" aria-label="' +
      esc(entry.term + ": " + entry.def) + '">' + esc(entry.term) + "</button>"
    );
  }

  // ── Modal (alert-dialog / dialog) ──────────────────────────────────────────
  // opts: { role: "alertdialog"|"dialog", labelledBy, escCloses, backdropCloses }
  var modalState = null; // { el, lastFocus, escCloses, backdropCloses }

  function openModal(innerHtml, opts) {
    opts = opts || {};
    closeModal();
    var lastFocus = document.activeElement;
    // R7: dialogs (non-blocking) get a visible, keyboard-accessible 44px X;
    // alert-dialogs keep their explicit Cancel/Action pair instead.
    var closeX = opts.role !== "alertdialog"
      ? '<button type="button" class="modal-x" data-action="modal-close" aria-label="Close">' +
        icon("x", "h-4 w-4") + "</button>"
      : "";
    var overlay = h(
      '<div class="modal-overlay"><div class="modal" role="' + (opts.role || "dialog") + '" aria-modal="true"' +
      (opts.labelledBy ? ' aria-labelledby="' + opts.labelledBy + '"' : "") + ">" + closeX + "</div></div>"
    );
    var box = overlay.firstElementChild;
    box.insertAdjacentHTML("beforeend", innerHtml);
    document.body.appendChild(overlay);
    modalState = { overlay: overlay, lastFocus: lastFocus, escCloses: opts.escCloses !== false, backdropCloses: !!opts.backdropCloses };

    if (modalState.backdropCloses) {
      overlay.addEventListener("pointerdown", function (e) {
        if (e.target === overlay) {
          closeModal();
          if (window.App) App.onModalClose();
        }
      });
    }
    // R7: the visible X closes the dialog directly (same path as ESC)
    var xBtn = box.querySelector(".modal-x");
    if (xBtn) {
      xBtn.addEventListener("click", function () {
        closeModal();
        if (window.App) App.onModalClose();
      });
    }
    // focus the first focusable element inside the dialog
    var focusables = box.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusables.length) focusables[0].focus();
    return overlay;
  }

  function closeModal() {
    if (!modalState) return;
    var m = modalState;
    modalState = null;
    m.overlay.remove();
    if (m.lastFocus && m.lastFocus.isConnected && document.contains(m.lastFocus)) {
      try { m.lastFocus.focus(); } catch (e) { /* noop */ }
    }
  }

  function modalIsOpen() {
    return !!modalState;
  }

  function trapTab(e) {
    if (!modalState) return;
    var box = modalState.overlay.querySelector(".modal");
    var focusables = box.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
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
    if (!modalState) return;
    if (e.key === "Escape") {
      e.preventDefault();
      if (modalState.escCloses) {
        closeModal();
        if (window.App) App.onModalClose();
      }
      // non-closable modals stay open until their own buttons fire
    } else if (e.key === "Tab") {
      trapTab(e);
    }
  });

  // hide any open glossary tooltip on Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modalState) hideTip();
  });

  // ── Shared primitives (ui-bits) ────────────────────────────────────────────

  function pillarBadge(pillar) {
    return '<span class="pillar-badge pillar-' + pillar + '">' + PILLAR_LABEL[pillar] + "</span>";
  }

  function progressRing(done, total, size) {
    size = size || 40;
    var pct = total > 0 ? done / total : 0;
    var r = (size - 6) / 2;
    var c = 2 * Math.PI * r;
    return (
      '<div class="progress-ring" role="img" aria-label="Objectives: ' + done + " of " + total + ' objectives complete">' +
      '<svg width="' + size + '" height="' + size + '" style="transform:rotate(-90deg)">' +
      '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="#2e4433" stroke-width="4"></circle>' +
      '<circle class="ring-fg" cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="#fbbf24" stroke-width="4" stroke-linecap="round" stroke-dasharray="' + c + '" stroke-dashoffset="' + c * (1 - pct) + '"></circle>' +
      "</svg>" +
      '<span class="ring-text">' + done + "/" + total + "</span>" +
      "</div>"
    );
  }

  /** Refresh any progress ring in place (keeps the stroke transition). */
  function refreshRings(done, total) {
    var rings = document.querySelectorAll(".progress-ring");
    for (var i = 0; i < rings.length; i++) {
      var ring = rings[i];
      var size = ring.querySelector("svg").getAttribute("width") * 1;
      var r = (size - 6) / 2;
      var c = 2 * Math.PI * r;
      var pct = total > 0 ? done / total : 0;
      ring.setAttribute("aria-label", "Objectives: " + done + " of " + total + " objectives complete");
      ring.querySelector(".ring-fg").setAttribute("stroke-dashoffset", c * (1 - pct));
      ring.querySelector(".ring-text").textContent = done + "/" + total;
    }
  }

  function dataLabel(text, cls) {
    return '<span class="data-label' + (cls ? " " + cls : "") + '">' + text + "</span>";
  }

  function benchTitle(iconName, title, sub) {
    return (
      '<div class="bench-title">' +
      (iconName ? '<span class="bench-icon">' + icon(iconName, "h-5 w-5") + "</span>" : "") +
      "<div><h3>" + title + "</h3>" +
      (sub ? '<p class="bench-sub">' + sub + "</p>" : "") +
      "</div></div>"
    );
  }

  function syntheticTag() {
    return (
      '<span class="synthetic-tag"><span class="synthetic-dot" aria-hidden="true"></span>Synthetic training data</span>'
    );
  }

  // ── Station widgets (kit.tsx) ──────────────────────────────────────────────

  function widgetCard(title, sub, badge, bodyHtml) {
    return (
      '<section class="widget-card" aria-label="' + esc(title) + '">' +
      '<div class="widget-head"><div><h4>' + title + "</h4>" +
      (sub ? '<p class="widget-sub">' + sub + "</p>" : "") +
      "</div>" +
      (badge ? '<span class="widget-badge">' + esc(badge) + "</span>" : "") +
      "</div>" + bodyHtml + "</section>"
    );
  }

  /**
   * Labeled dropdown. data-select holds the env field, data-key the record key
   * (empty for scalar fields).
   */
  function choiceRow(label, envField, keyValue, value, options, opts) {
    opts = opts || {};
    var aria = opts.ariaLabel || label;
    var cls = "choice-row" + (opts.compact ? " compact" : "");
    var optsHtml = options
      .map(function (o) {
        return '<option value="' + esc(o.id) + '"' + (value === o.id ? " selected" : "") + ">" + esc(o.label) + "</option>";
      })
      .join("");
    return (
      '<div class="' + cls + '">' +
      '<span class="choice-label">' + esc(label) + "</span>" +
      '<select class="select" data-select="' + esc(envField) + '" data-key="' + esc(keyValue || "") + '" aria-label="' + esc(aria) + '">' +
      '<option value="" disabled' + (value ? "" : " selected") + ">— assign —</option>" +
      optsHtml +
      "</select></div>"
    );
  }

  /** Toggleable checklist (multi-select buttons, 44px targets). */
  function checkList(items, selected, envField, groupLabel) {
    var body = items
      .map(function (it) {
        var on = selected.indexOf(it.id) !== -1;
        return (
          '<button type="button" class="check-btn' + (on ? " on" : "") + '" data-action="toggle-check"' +
          ' data-env="' + esc(envField) + '" data-key="' + esc(it.id) + '" aria-pressed="' + on + '">' +
          '<span class="check-box" aria-hidden="true">' + (on ? icon("check", "check-mark") : "") + "</span>" +
          "<span>" + esc(it.label) + "</span></button>"
        );
      })
      .join("");
    return '<div class="check-list" role="group" aria-label="' + esc(groupLabel) + '">' + body + "</div>";
  }

  /** Segmented binary/ternary control for classifications. */
  var SEG_TONE = { good: "seg-good", bad: "seg-bad", unknown: "seg-unknown" };

  function segButtons(label, envField, keyValue, value, options, opts) {
    opts = opts || {};
    var groupAria = opts.groupLabel || label || "";
    var body = options
      .map(function (o) {
        var on = value === o.id;
        var onCls = on ? (opts.tone && o.tone ? SEG_TONE[o.tone] : " seg-active-plain") : "";
        return (
          '<button type="button" class="seg-btn' + (on ? " on" + onCls : "") + '" data-action="seg"' +
          ' data-env="' + esc(envField) + '" data-key="' + esc(keyValue || "") + '" data-val="' + esc(o.id) + '"' +
          (o.tone ? ' data-tone="' + o.tone + '"' : "") + ' aria-pressed="' + on + '">' +
          esc(o.label) + "</button>"
        );
      })
      .join("");
    return (
      '<div class="seg-wrap">' +
      (label ? '<span class="seg-label">' + esc(label) + "</span>" : "") +
      '<div class="seg-group" role="group" aria-label="' + esc(groupAria) + '">' + body + "</div></div>"
    );
  }

  /** Sync a seg group's pressed state in place (no re-render). */
  function syncSegGroup(group, value) {
    var btns = group.querySelectorAll(".seg-btn");
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      var on = b.getAttribute("data-val") === value;
      b.classList.toggle("on", on);
      if (on) {
        var tone = b.getAttribute("data-tone");
        b.classList.remove("seg-good", "seg-bad", "seg-unknown", "seg-active-plain");
        b.classList.add(tone ? SEG_TONE[tone] : "seg-active-plain");
      } else {
        b.classList.remove("seg-good", "seg-bad", "seg-unknown", "seg-active-plain");
      }
      b.setAttribute("aria-pressed", String(on));
    }
  }

  /** Radio card list for statement choices. */
  function radioCards(label, envField, value, options, name) {
    var body = options
      .map(function (o) {
        var on = value === o.id;
        return (
          '<button type="button" class="radio-card' + (on ? " on" : "") + '" role="radio" aria-checked="' + on + '"' +
          ' aria-label="' + esc(o.label) + '" data-action="radio" data-env="' + esc(envField) +
          '" data-val="' + esc(o.id) + '">' +
          '<span class="radio-dot" aria-hidden="true">' + (on ? '<span class="radio-dot-inner"></span>' : "") + "</span>" +
          "<span>" + esc(o.label) + "</span></button>"
        );
      })
      .join("");
    return (
      '<fieldset class="radio-cards"><legend class="radio-legend">' + esc(label) + "</legend>" +
      body +
      '<input type="radio" name="' + esc(name) + '" value="' + esc(value) + '" class="sr-only" tabindex="-1" aria-hidden="true" readonly></fieldset>'
    );
  }

  /** Sync a radio-cards group in place. */
  function syncRadioGroup(group, value) {
    var cards = group.querySelectorAll(".radio-card");
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      var on = c.getAttribute("data-val") === value;
      c.classList.toggle("on", on);
      c.setAttribute("aria-checked", String(on));
      var dot = c.querySelector(".radio-dot");
      dot.innerHTML = on ? '<span class="radio-dot-inner"></span>' : "";
    }
  }

  /**
   * Ordering bench: pool chips + ordered slots (click-to-add / click-to-remove).
   * Returns HTML; re-render the [data-bench] container after each change.
   */
  function orderBench(label, benchId, pool, slots) {
    var remaining = pool.filter(function (p) { return slots.indexOf(p.id) === -1; });
    var slotsHtml = slots
      .map(function (id, i) {
        var item = pool.filter(function (p) { return p.id === id; })[0];
        return (
          '<li class="slot-row"><span class="slot-num">' + (i + 1) + '.</span>' +
          '<span class="slot-chip">' + esc(item ? item.label : id) + "</span>" +
          '<button type="button" class="slot-remove" data-action="bench-remove" data-bench="' + esc(benchId) +
          '" data-index="' + i + '" aria-label="Remove ' + esc(item ? item.label : id) + " from position " + (i + 1) + '">' +
          icon("x", "h-3.5 w-3.5") + "</button></li>"
        );
      })
      .join("");
    if (slots.length === 0) {
      slotsHtml = '<li class="slot-empty">Empty trail — pick phases from the pool below, in order.</li>';
    }
    var poolHtml = remaining
      .map(function (p) {
        return (
          '<button type="button" class="pool-chip" data-action="bench-add" data-bench="' + esc(benchId) +
          '" data-id="' + esc(p.id) + '" title="' + esc(p.blurb || "") + '" aria-label="Add ' + esc(p.label) + ' to the sequence">' +
          esc(p.label) + '<span class="pool-chevron" aria-hidden="true">' + icon("chevron-down", "h-3 w-3") + "</span></button>"
        );
      })
      .join("");
    if (remaining.length === 0) {
      poolHtml = '<span class="pool-empty">pool empty — all slotted</span>';
    }
    return (
      '<div data-bench="' + esc(benchId) + '"><div class="bench-bar"><span class="bench-label">' + esc(label) + "</span>" +
      (slots.length > 0
        ? '<button type="button" class="bench-clear" data-action="bench-clear" data-bench="' + esc(benchId) + '">' +
          icon("x", "h-3 w-3 inline") + " Clear</button>"
        : "") +
      "</div>" +
      '<ol class="slot-list" aria-label="' + esc(label) + " — ordered slots" + '">' + slotsHtml + "</ol>" +
      '<div class="pool-row" aria-label="' + esc(label) + " — pool" + '">' + poolHtml + "</div></div>"
    );
  }

  /** Amber explainer note. */
  function infoNote(html) {
    return '<p class="info-note">' + html + "</p>";
  }

  return {
    PILLAR_META: PILLAR_META,
    PILLAR_LABEL: PILLAR_LABEL,
    STATION_META: STATION_META,
    STATION_ICONS: STATION_ICONS,
    PHASE_STEPS: PHASE_STEPS,
    PHASE_LABEL: PHASE_LABEL,
    esc: esc,
    h: h,
    icon: icon,
    term: term,
    showTip: showTip,
    hideTip: hideTip,
    openModal: openModal,
    closeModal: closeModal,
    modalIsOpen: modalIsOpen,
    pillarBadge: pillarBadge,
    progressRing: progressRing,
    refreshRings: refreshRings,
    dataLabel: dataLabel,
    benchTitle: benchTitle,
    syntheticTag: syntheticTag,
    widgetCard: widgetCard,
    choiceRow: choiceRow,
    checkList: checkList,
    segButtons: segButtons,
    syncSegGroup: syncSegGroup,
    radioCards: radioCards,
    syncRadioGroup: syncRadioGroup,
    orderBench: orderBench,
    infoNote: infoNote,
  };
})();
