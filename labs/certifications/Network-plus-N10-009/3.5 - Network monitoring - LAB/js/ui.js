// SIGNALPATH lab — UI helpers: element builder, inline SVG icons, modal machinery,
// focus/scroll preservation across re-renders, shared form atoms.
// No framework: functions return real DOM nodes; app.js assembles and mounts them.
window.SP_UI = (function () {
  "use strict";

  // ---------- tiny hyperscript-style builder ----------
  // el("div", { class: "...", attrs: {...}, on: { click: fn } }, child, child, ...)
  function el(tag, props) {
    var node = document.createElement(tag);
    if (props) {
      if (props.class) node.className = props.class;
      if (props.attrs) {
        Object.keys(props.attrs).forEach(function (k) {
          if (props.attrs[k] !== undefined && props.attrs[k] !== null && props.attrs[k] !== false) {
            node.setAttribute(k, props.attrs[k] === true ? "" : String(props.attrs[k]));
          }
        });
      }
      if (props.on) {
        Object.keys(props.on).forEach(function (evt) {
          node.addEventListener(evt, props.on[evt]);
        });
      }
      if (props.style) {
        Object.keys(props.style).forEach(function (k) {
          node.style[k] = props.style[k];
        });
      }
    }
    for (var i = 2; i < arguments.length; i++) appendChild(node, arguments[i]);
    return node;
  }

  function appendChild(node, child) {
    if (child === null || child === undefined || child === false) return;
    if (Array.isArray(child)) {
      child.forEach(function (c) { appendChild(node, c); });
      return;
    }
    if (typeof child === "string" || typeof child === "number") {
      node.appendChild(document.createTextNode(String(child)));
    } else if (child.nodeType) {
      node.appendChild(child);
    }
  }

  // svg for inline icons and inline SVG scenes (network map)
  function svgEl(tag, attrs, children) {
    var node = document.createElementNS("http://www.w3.org/2000/svg", tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (attrs[k] !== undefined && attrs[k] !== null) node.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(function (c) { node.appendChild(c); });
    return node;
  }

  // ---------- lucide icons (exact paths from node_modules/lucide-react) ----------
  function icon(name, cls) {
    var def = window.SP_ICONS[name];
    var svg = svgEl("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      width: 24, height: 24, viewBox: "0 0 24 24",
      fill: "none", stroke: "currentColor", "stroke-width": 2,
      "stroke-linecap": "round", "stroke-linejoin": "round",
      "aria-hidden": "true",
    });
    if (cls) svg.setAttribute("class", cls);
    (def || []).forEach(function (pair) {
      var tag = pair[0], attrs = pair[1];
      attrs = attrs || {};
      if (tag === "circle") {
        svg.appendChild(svgEl("circle", attrs));
      } else if (tag === "line") {
        svg.appendChild(svgEl("line", attrs));
      } else if (tag === "rect") {
        svg.appendChild(svgEl("rect", attrs));
      } else {
        svg.appendChild(svgEl("path", attrs));
      }
    });
    return svg;
  }

  // class joiner (cn equivalent)
  function cn() {
    return Array.prototype.slice.call(arguments).filter(Boolean).join(" ");
  }

  // ---------- shared form atoms ----------
  // Native <select> styled like the original Radix trigger; keyboard a11y is native.
  function select(opts) {
    // opts: { value, options: [{value,label}], onChange, disabled, ariaLabel, ariaLabelledBy }
    var wrap = el("div", { class: "select-wrap" });
    var sel = el("select", {
      class: "select",
      attrs: { "aria-label": opts.ariaLabel || null },
      on: { change: function (e) { opts.onChange(e.target.value); } },
    });
    if (opts.ariaLabelledBy) sel.removeAttribute("aria-label");
    if (opts.disabled) sel.disabled = true;
    var found = false;
    (opts.options || []).forEach(function (o) {
      var opt = document.createElement("option");
      opt.value = o.value;
      opt.textContent = o.label;
      if (o.value === (opts.value || "")) { opt.selected = true; found = true; }
      sel.appendChild(opt);
    });
    if (!found && (opts.value || "") !== "") {
      // value persisted but not in list (shouldn't happen) — still show it
      var extra = document.createElement("option");
      extra.value = opts.value; extra.textContent = opts.value; extra.selected = true;
      sel.appendChild(extra);
    }
    if ((opts.value || "") === "") {
      var ph = document.createElement("option");
      ph.value = ""; ph.textContent = opts.placeholder || "select…";
      ph.disabled = true; ph.selected = true;
      sel.insertBefore(ph, sel.firstChild);
    }
    wrap.appendChild(sel);
    return wrap;
  }

  function field(labelText, inputAttrs) {
    var lab = el("label", { class: "" }, labelText);
    var input = el("input", {
      class: "input",
      attrs: Object.assign({ type: "text", "aria-label": labelText }, inputAttrs || {}),
    });
    var wrap = el("div", { class: "field" }, lab, input);
    return { wrap: wrap, input: input, label: lab };
  }

  function switchInput(opts) {
    // opts: { id, checked, onChange, ariaLabel, labelId }
    var sw = el("input", {
      class: "switch",
      attrs: { type: "checkbox", role: "switch", id: opts.id || null },
      on: { change: function (e) { opts.onChange(e.target.checked); } },
    });
    sw.checked = !!opts.checked;
    if (opts.ariaLabel) sw.setAttribute("aria-label", opts.ariaLabel);
    if (opts.labelId) sw.setAttribute("aria-labelledby", opts.labelId);
    return sw;
  }

  // ---------- modal machinery (Radix Dialog equivalent) ----------
  // openModal({ title, description, content, wide, isAlertDialog, onClose, onCloseIntent })
  // - Escape closes (all dialogs); outside pointer-down closes non-alertdialogs
  // - focus moves into the dialog on open and back to the trigger on close
  var activeModal = null;

  function openModal(opts) {
    closeModal(true);
    var overlay = el("div", { class: "modal-overlay", attrs: { role: "presentation" } });
    var modal = el("div", {
      class: cn("modal", opts.wide && "modal-wide", opts.glossary && "modal-glossary"),
      attrs: { role: opts.isAlertDialog ? "alertdialog" : "dialog", "aria-modal": "true" },
    });
    var lastFocus = document.activeElement;

    function requestClose() {
      if (opts.onCloseIntent) opts.onCloseIntent();
      closeModal();
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    if (opts.title) modal.appendChild(el("h2", { class: cn("modal-title", opts.largeTitle && "lg") }, opts.title));
    if (opts.description) modal.appendChild(el("p", { class: "modal-desc" }, opts.description));
    if (!opts.isAlertDialog) {
      var x = el("button", {
        class: "modal-x",
        attrs: { "aria-label": "Close" },
        on: { click: requestClose },
      }, icon("x", "w-4 h-4"));
      modal.appendChild(x);
    }
    var body = el("div", { class: "modal-body" });
    modal.appendChild(body);
    overlay.appendChild(modal);

    overlay.addEventListener("pointerdown", function (e) {
      if (e.target === overlay && !opts.isAlertDialog) requestClose();
    });

    function onKey(e) {
      if (e.key === "Escape") requestClose();
    }
    document.addEventListener("keydown", onKey);

    activeModal = { overlay: overlay, onKey: onKey, lastFocus: lastFocus };
    document.body.appendChild(overlay);
    document.body.classList.add("modal-open");
    if (opts.mount) opts.mount(body, requestClose);
    // focus the dialog itself so Escape/focus is predictable
    modal.setAttribute("tabindex", "-1");
    modal.focus({ preventScroll: true });
    return { close: requestClose, body: body };
  }

  function closeModal(skipIntent) {
    if (!activeModal) return;
    document.removeEventListener("keydown", activeModal.onKey);
    activeModal.overlay.remove();
    document.body.classList.remove("modal-open");
    activeModal = null;
  }

  function isModalOpen() {
    return !!activeModal;
  }

  // ---------- re-render aids: focus + scroll preservation ----------
  function captureFocus() {
    var a = document.activeElement;
    if (!a || a === document.body) return null;
    if (!a.hasAttribute || !a.hasAttribute("data-fkey")) return null;
    var info = { key: a.getAttribute("data-fkey"), start: null, end: null };
    try {
      if (typeof a.selectionStart === "number") {
        info.start = a.selectionStart;
        info.end = a.selectionEnd;
      }
    } catch (e) { /* not a text field */ }
    return info;
  }

  function restoreFocus(info) {
    if (!info) return;
    var target = document.querySelector('[data-fkey="' + cssEscape(info.key) + '"]');
    if (!target) return;
    target.focus({ preventScroll: true });
    try {
      if (info.start !== null && typeof target.selectionStart === "number") {
        target.setSelectionRange(info.start, info.end);
      }
    } catch (e) { /* ignore */ }
  }

  function cssEscape(s) {
    return (window.CSS && CSS.escape) ? CSS.escape(s) : String(s).replace(/"/g, '\\"');
  }

  function captureScrolls() {
    var out = { window: window.scrollY, items: [] };
    document.querySelectorAll("[data-scrollkey]").forEach(function (n) {
      out.items.push({ key: n.getAttribute("data-scrollkey"), top: n.scrollTop, left: n.scrollLeft });
    });
    return out;
  }

  function restoreScrolls(cap) {
    if (!cap) return;
    window.scrollTo(0, cap.window || 0);
    cap.items.forEach(function (it) {
      var n = document.querySelector('[data-scrollkey="' + cssEscape(it.key) + '"]');
      if (n) { n.scrollTop = it.top; n.scrollLeft = it.left; }
    });
  }

  return {
    el: el,
    svgEl: svgEl,
    icon: icon,
    cn: cn,
    select: select,
    field: field,
    switchInput: switchInput,
    openModal: openModal,
    closeModal: closeModal,
    isModalOpen: isModalOpen,
    captureFocus: captureFocus,
    restoreFocus: restoreFocus,
    captureScrolls: captureScrolls,
    restoreScrolls: restoreScrolls,
  };
})();
