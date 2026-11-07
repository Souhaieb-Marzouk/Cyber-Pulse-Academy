// THE ISOLATION FOUNDRY — js/ui.js
// Foundry UI primitives: the shared visual language of the lab, rebuilt as
// small readable component functions over a tiny DOM builder. Each component
// mirrors one element of the original React/shadcn lab (same markup contract:
// same classes of behavior, same ARIA, same states).
(function (F) {
  "use strict";

  /* ---------------- tiny DOM builder ----------------
     h(tag, attrs, ...children)
     attrs: { class, fk (focus-preservation key), aria / data attributes,
              on<Event> handlers, html (trusted internal markup only, e.g.
              generated icons), ...dom props }
     children: strings, Nodes, arrays, null/undefined (skipped)               */

  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (!Object.prototype.hasOwnProperty.call(attrs, k)) continue;
        var v = attrs[k];
        if (v === null || v === undefined || v === false) continue;
        if (k === "class") el.className = v;
        else if (k === "fk") el.setAttribute("data-fk", v);
        else if (k === "html") el.innerHTML = v; // internal use: generated SVG only
        else if (k.slice(0, 2) === "on" && typeof v === "function") el.addEventListener(k.slice(2).toLowerCase(), v);
        else if (k === "value") el.value = v;
        else if (k === "checked" || k === "disabled" || k === "selected") el[k] = !!v;
        else el.setAttribute(k, v === true ? "" : String(v));
      }
    }
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }

  function append(el, child) {
    if (child === null || child === undefined || child === false || child === "") return;
    if (Array.isArray(child)) { for (var i = 0; i < child.length; i++) append(el, child[i]); return; }
    el.appendChild(typeof child === "object" ? child : document.createTextNode(String(child)));
  }

  function cn() {
    var out = [];
    for (var i = 0; i < arguments.length; i++) if (arguments[i]) out.push(arguments[i]);
    return out.join(" ");
  }

  F.h = h;
  F.cn = cn;
  var iconSvg = F.icon; // svg-string generator from js/icons.js (loaded first)

  /* ---------------- icons as live elements ---------------- */

  function iconEl(name, size, extraClass) {
    var span = h("span", { class: cn("icon-wrap", extraClass), html: iconSvg(name, size), "aria-hidden": "true" });
    span.style.display = "inline-flex";
    span.style.flexShrink = "0";
    return span;
  }
  F.iconEl = iconEl;

  /* ---------------- Panel ----------------
     <section> with mono uppercase ember header, optional sub + right slot. */

  F.panel = function (opts) {
    var section = h("section", { class: cn("panel", opts.className), "aria-label": opts.title || null });
    if (opts.title) {
      section.appendChild(
        h("header", { class: "panel-head" },
          h("div", { class: "panel-head-main" },
            h("h3", { class: "panel-title", style: opts.tone ? "color:" + opts.tone : null }, opts.title),
            opts.sub ? h("p", { class: "panel-sub" }, opts.sub) : null),
          opts.right ? h("div", { class: "panel-right" }, opts.right) : null)
      );
    }
    var body = h("div", { class: "panel-body" });
    append(body, opts.children);
    section.appendChild(body);
    return section;
  };

  /* ---------------- Button ----------------
     variants: primary (default) | outline | destructive | secondary; sizes: sm | default | lg. */

  F.button = function (opts) {
    return h("button",
      {
        class: cn("btn",
          "btn-" + (opts.variant || "primary"),
          opts.size === "sm" ? "btn-sm" : opts.size === "lg" ? "btn-lg" : "",
          opts.className || null),
        onClick: opts.onClick,
        disabled: opts.disabled,
        type: opts.type || "button",
        "aria-pressed": opts.ariaPressed,
        "aria-label": opts.ariaLabel,
        "aria-expanded": opts.ariaExpanded,
        "aria-live": opts.ariaLive,
        "aria-current": opts.ariaCurrent,
        title: opts.title,
        fk: opts.fk,
      },
      opts.children);
  };

  /* ---------------- PillarBadge ---------------- */

  F.pillarBadge = function (pillar, small) {
    var p = F.PILLARS[pillar];
    return h("span", {
      class: cn("pbadge", small ? "pbadge-sm" : ""),
      style: "color:" + p.color + ";border-color:" + p.color + "55;background:" + p.color + "14",
      title: "Pillar " + p.short + ": " + p.label,
    }, iconEl("Flame", small ? 9 : 11), p.short);
  };

  /* ---------------- Gauge (role=meter) ---------------- */

  F.gauge = function (opts) {
    var max = opts.max, value = opts.value;
    var pct = max <= 0 ? 0 : Math.min(100, (value / max) * 100);
    var hot = pct >= 85;
    var color = hot ? "#F87171" : (opts.color || "#F1A33C");
    return h("div", null,
      h("div", { class: "gauge-labels" },
        h("span", null, opts.label),
        h("span", { class: hot ? "text-destructive" : "text-foreground" },
          value.toFixed(opts.digits === undefined ? 0 : opts.digits) + "/" + max + (opts.unit || ""))),
      h("div", {
        class: "gauge-track", role: "meter", "aria-label": opts.label,
        "aria-valuenow": value, "aria-valuemin": 0, "aria-valuemax": max,
      }, h("div", { class: "gauge-fill", style: "width:" + pct + "%;background:" + color })));
  };

  /* ---------------- FoundrySelect (native select, dark scheme) ---------------- */

  F.foundrySelect = function (opts) {
    var sel = h("select", {
      class: "fselect", value: opts.value || "", disabled: opts.disabled,
      "aria-label": opts.label, onChange: function (e) { opts.onChange(e.target.value); },
    },
      h("option", { value: "", disabled: true }, opts.placeholder || "— select —"),
      (opts.choices || []).map(function (c) { return h("option", { value: c.id }, c.text); }));
    var wrap = h("div", { class: opts.compact ? "fsel-compact" : "fsel-block" },
      h("label", { class: "fsel-label" }, opts.label),
      h("div", { class: "fsel-wrap" }, sel, iconEl("ChevronDown", 14, "fsel-chevron")));
    sel.value = opts.value || "";
    return wrap;
  };

  /* ---------------- IsoMeter (isolation strength 1–5) ---------------- */

  F.isoMeter = function (level) {
    var segs = [];
    for (var i = 1; i <= 5; i++) {
      segs.push(h("span", { class: "iso-seg" + (i <= level ? " iso-on" : "") }));
    }
    return h("span", { class: "iso-meter", role: "img", "aria-label": "Isolation strength " + level + " of 5" }, segs);
  };

  /* ---------------- Stars (full/half/empty) ---------------- */

  F.stars = function (value, size) {
    size = size || 18;
    var full = Math.floor(value);
    var half = value - full >= 0.5;
    var out = [];
    for (var i = 0; i < 5; i++) {
      if (i < full) out.push(h("span", { class: "star star-full", html: iconSvg("Star", size) }));
      else if (i === full && half) out.push(h("span", { class: "star star-full", html: iconSvg("StarHalf", size) }));
      else out.push(h("span", { class: "star star-empty", html: iconSvg("Star", size) }));
    }
    return h("span", { class: "stars", role: "img", "aria-label": value + " of 5 stars" }, out);
  };

  /* ---------------- RuntimeChip ---------------- */

  F.runtimeChip = function (opts) {
    var spec = F.RUNTIMES[opts.runtime];
    var flags = (opts.opsFlags && opts.opsFlags.length)
      ? h("span", { class: "chip-flags", "aria-hidden": "true" },
          opts.opsFlags.map(function (f) { return h("span", { class: "chip-flag" }, f); }))
      : null;
    var inner = [
      h("span", { class: "chip-dot", style: "background:" + spec.color, "aria-hidden": "true" }),
      h("span", { class: "chip-name", style: "color:" + spec.color }, opts.name),
      flags,
    ];
    if (opts.onClick) {
      return h("button", {
        class: cn("chip chip-btn", opts.selected && "chip-selected", opts.className),
        style: "border-color:" + spec.color + "66;background:" + spec.color + "14",
        onClick: opts.onClick, "aria-pressed": !!opts.selected, fk: opts.fk,
      }, inner);
    }
    return h("div", { class: cn("chip", opts.className), style: "border-color:" + spec.color + "66;background:" + spec.color + "14" }, inner);
  };

  /* ---------------- CheckFeedback (role=status) ---------------- */

  F.checkFeedback = function (res) {
    return h("div", { class: "feedback " + (res.pass ? "feedback-good" : "feedback-bad"), role: "status" },
      h("div", { class: "feedback-head" },
        iconEl(res.pass ? "CheckCircle2" : "XCircle", 13, res.pass ? "text-container" : "text-destructive"),
        res.pass ? "Accepted — why it matters" : "Rejected — teaching moment"),
      h("p", { class: "feedback-msg" }, res.msg));
  };

  /* ---------------- SyntheticNote ---------------- */

  F.syntheticNote = function (className) {
    return h("span", { class: cn("synthetic-note", className || "") }, "synthetic training data");
  };

  /* ---------------- SeqPill ---------------- */

  F.seqPill = function (index, label) {
    return h("span", { class: "seq-pill" },
      h("span", { class: "seq-pill-num" }, index),
      h("span", { class: "seq-pill-label" }, label));
  };

  /* ---------------- BenchHead ---------------- */

  F.benchHead = function (n, text) {
    return h("div", { class: "bench-head" },
      h("span", { class: "bench-head-n" }, n),
      h("span", { class: "bench-head-text" }, text));
  };

  /* ---------------- Tabs (Radix-style: tablist/tab/tabpanel + arrow keys) ----------------
     items: [{ id, label, icon, content }] · controlled via value + onChange. */

  F.tabs = function (opts) {
    var list = h("div", { class: cn("tabs-list", opts.wrap ? "tabs-list-wrap" : ""), role: "tablist", "aria-label": opts.ariaLabel || null });
    var panels = [];
    var tabEls = [];

    function activate(id, focus) {
      opts.onChange(id);
      tabEls.forEach(function (t) {
        var on = t.getAttribute("data-tab") === id;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        if (on && focus) t.focus();
      });
      panels.forEach(function (p) { p.hidden = p.getAttribute("data-panel") !== id; });
    }

    opts.items.forEach(function (item) {
      var active = item.id === opts.value;
      var tab = h("button", {
        class: "tab", role: "tab", "data-tab": item.id,
        "aria-selected": active ? "true" : "false", tabIndex: active ? 0 : -1,
        onClick: function () { activate(item.id, false); },
      }, item.icon ? iconEl(item.icon, 12) : null, item.label);
      tab.addEventListener("keydown", function (e) {
        var idx = tabEls.indexOf(tab);
        var next = null;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") next = tabEls[(idx + 1) % tabEls.length];
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = tabEls[(idx - 1 + tabEls.length) % tabEls.length];
        else if (e.key === "Home") next = tabEls[0];
        else if (e.key === "End") next = tabEls[tabEls.length - 1];
        if (next) { e.preventDefault(); activate(next.getAttribute("data-tab"), true); }
      });
      tabEls.push(tab);
      list.appendChild(tab);

      var panel = h("div", { class: "tabpanel", role: "tabpanel", "data-panel": item.id, hidden: !active });
      append(panel, item.content);
      panels.push(panel);
    });

    return h("div", { class: "tabs" }, list, panels);
  };

  /* ---------------- Accordion (multiple open, animated via grid rows) ---------------- */

  F.accordion = function (opts) {
    // items: [{ id, title, content }]; openIds: array of open ids
    var root = h("div", { class: "accordion" });
    opts.items.forEach(function (item) {
      var open = opts.openIds.indexOf(item.id) !== -1;
      var trigger = h("button", {
        class: "accordion-trigger", "aria-expanded": open ? "true" : "false",
        fk: "acc-" + item.id,
        onClick: function () { opts.onToggle(item.id); },
      },
        h("span", { class: "accordion-title" }, item.title),
        iconEl("ChevronDown", 14, "accordion-chevron" + (open ? " chevron-open" : "")));
      var content = h("div", { class: "accordion-content" + (open ? " accordion-open" : ""), "aria-hidden": open ? "false" : "true" },
        h("div", { class: "accordion-inner" }, item.content));
      root.appendChild(h("div", { class: "accordion-item" }, trigger, content));
    });
    return root;
  };

  /* ---------------- Modal dialogs ----------------
     variant "dialog"  → X button, ESC + outside-click close (completion forge)
     variant "alert"   → no X, ESC close, outside click blocked (reset confirm)
     Both trap focus while open and restore focus to the opener on close.     */

  var openDialog = null; // { root, opener, onclose }

  function trapFocus(e) {
    if (!openDialog || e.key !== "Tab") return;
    var focusables = openDialog.root.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusables.length) return;
    var first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  document.addEventListener("keydown", function (e) {
    if (!openDialog) return;
    if (e.key === "Escape") { e.preventDefault(); closeDialog(); }
    else trapFocus(e);
  });

  function closeDialog() {
    if (!openDialog) return;
    var d = openDialog;
    openDialog = null;
    d.root.remove();
    document.body.classList.remove("dialog-open");
    if (d.opener && document.contains(d.opener)) d.opener.focus();
    if (d.onclose) d.onclose();
  }
  F.closeDialog = closeDialog;

  F.dialog = function (opts) {
    var opener = document.activeElement;
    var isAlert = opts.variant === "alert";
    var card = h("div", { class: cn("dialog-card", isAlert ? "dialog-alert" : "dialog-forge"), role: "alertdialog", "aria-modal": "true", "aria-label": opts.title || null });
    card.appendChild(h("div", { class: "dialog-head" },
      h("h2", { class: "dialog-title" }, opts.titleNode || opts.title),
      !isAlert ? h("button", { class: "dialog-x", "aria-label": "Close", onClick: function () { closeDialog(); }, html: iconSvg("X", 16) }) : null));
    if (opts.description) card.appendChild(h("p", { class: "dialog-desc" }, opts.description));
    if (opts.content) append(card, opts.content);
    if (opts.actions) card.appendChild(h("div", { class: "dialog-actions" }, opts.actions));

    var overlay = h("div", { class: "dialog-overlay" }, card);
    if (!isAlert) {
      overlay.addEventListener("mousedown", function (e) { if (e.target === overlay) closeDialog(); });
    }
    document.body.appendChild(overlay);
    document.body.classList.add("dialog-open");
    var firstFocus = card.querySelector("button, [href], input, select, textarea");
    (firstFocus || card).focus();
    openDialog = { root: overlay, opener: opener, onclose: opts.onclose };
    return { close: closeDialog };
  };

  /* ---------------- confirm reset (AlertDialog parity) ---------------- */

  F.confirmReset = function (onConfirm) {
    F.dialog({
      variant: "alert",
      title: "Reset the foundry?",
      description: "This clears your mode, every work order, the audit and the floor state — back to a pristine intake deck. There is no undo.",
      actions: [
        F.button({ variant: "outline", className: "btn-cancel", children: "Keep my shift" }),
        F.button({ variant: "destructive", children: "Reset everything", onClick: function () { closeDialog(); onConfirm(); } }),
      ],
    });
    // wire the cancel button after mount (it must close without confirming)
    var cancel = document.querySelector(".dialog-alert .btn-cancel");
    if (cancel) cancel.addEventListener("click", function () { closeDialog(); });
  };
})(window.Foundry = window.Foundry || {});
