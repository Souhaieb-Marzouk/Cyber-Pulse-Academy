/* ==========================================================================
   GATEHOUSE lab — js/ui.js
   Shared UI primitives and rendering helpers: hyperscript-style DOM builder,
   inline Lucide SVG icon renderer, pillar badges, segmented radio groups,
   objective cards, sequence builder, attack matcher, log viewer and the
   modal/sheet framework. Ported 1:1 from the original framework lab's
   ui-bits.tsx / rails.tsx presentation logic.
   ========================================================================== */
(function () {
  "use strict";
  var GH = (window.GH = window.GH || {});

  /* ------------------------------ DOM builder ------------------------------ */

  /**
   * el(tag, attrs, ...children) — tiny hyperscript-style element builder.
   * children: strings become text nodes; null/undefined/false are skipped;
   * arrays are flattened. Event handlers use `onXxx` attribute names.
   */
  function el(tag, attrs) {
    var node = document.createElement(tag);
    if (attrs) {
      for (var key in attrs) {
        if (!Object.prototype.hasOwnProperty.call(attrs, key)) continue;
        var v = attrs[key];
        if (v === null || v === undefined || v === false) continue;
        if (key === "class") node.className = v;
        else if (key === "htmlFor") node.setAttribute("for", v);
        else if (key === "value") node.value = v;
        else if (key === "checked" || key === "disabled" || key === "selected")
          node[key] = true;
        else if (key.indexOf("on") === 0 && typeof v === "function")
          node.addEventListener(key.slice(2).toLowerCase(), v);
        else node.setAttribute(key, v === true ? "" : String(v));
      }
    }
    for (var i = 2; i < arguments.length; i++) appendChild(node, arguments[i]);
    return node;
  }

  function appendChild(node, child) {
    if (child === null || child === undefined || child === false) return;
    if (Array.isArray(child)) {
      child.forEach(function (c) {
        appendChild(node, c);
      });
      return;
    }
    if (child instanceof Node) {
      node.appendChild(child);
    } else {
      node.appendChild(document.createTextNode(String(child)));
    }
  }

  GH.el = el;

  /* ------------------------------ icon renderer ---------------------------- */

  var SVG_NS = "http://www.w3.org/2000/svg";

  /**
   * icon(name, cls, opts) — inline Lucide SVG (24x24, stroke currentColor,
   * stroke-width 2, round caps/joins). opts.filled sets fill=currentColor
   * (completion-modal stars); opts.label gives an accessible name (the SVG is
   * then announced instead of hidden).
   */
  function icon(name, cls, opts) {
    var svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", opts && opts.filled ? "currentColor" : "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("class", "icon" + (cls ? " " + cls : ""));
    if (opts && opts.label) {
      svg.setAttribute("role", "img");
      svg.setAttribute("aria-label", opts.label);
    } else {
      svg.setAttribute("aria-hidden", "true");
    }
    var nodes = GH.ICONS[name] || [];
    nodes.forEach(function (pair) {
      var child = document.createElementNS(SVG_NS, pair[0]);
      var attrs = pair[1] || {};
      for (var k in attrs) {
        if (Object.prototype.hasOwnProperty.call(attrs, k)) child.setAttribute(k, attrs[k]);
      }
      svg.appendChild(child);
    });
    return svg;
  }

  GH.icon = icon;

  /* ------------------------------- primitives ------------------------------ */

  function pillarBadge(pillar) {
    var meta = GH.PILLAR_META[pillar];
    return el("span", { class: "pillar-badge " + meta.cls }, meta.label);
  }

  function sectionLabel(text) {
    return el(
      "div",
      { class: "section-label" },
      el("span", { class: "section-label__square", "aria-hidden": "true" }),
      el("span", { class: "section-label__text" }, text)
    );
  }

  /**
   * SegGroup — segmented radio group (role=radiogroup / role=radio buttons).
   * Self-updates its active state on click; parent regions refresh via the
   * state listener registry.
   */
  function segGroup(opts) {
    var group = el("div", {
      class: "seg-group" + (opts.compact ? " seg-group--compact" : ""),
      role: "radiogroup",
      "aria-label": opts.ariaLabel,
    });
    var buttons = [];
    function paint(value) {
      buttons.forEach(function (b) {
        var active = b.__id === value;
        b.setAttribute("aria-checked", active ? "true" : "false");
        b.classList.toggle("seg--active", active);
      });
    }
    opts.options.forEach(function (o) {
      var b = el(
        "button",
        {
          type: "button",
          role: "radio",
          "aria-checked": "false",
          class: "seg",
          onclick: function () {
            paint(o.id);
            opts.onChange(o.id);
          },
        },
        o.label
      );
      b.__id = o.id;
      buttons.push(b);
      group.appendChild(b);
    });
    paint(opts.value);
    group.__setValue = paint;
    return group;
  }

  /**
   * CheckFeedback — pass/fail feedback box (aria-live). Returns a node, or
   * an empty span when there is no result yet.
   */
  function checkFeedback(result) {
    if (!result) return el("span");
    return el(
      "div",
      {
        class:
          "check-feedback " +
          (result.pass ? "check-feedback--pass" : "check-feedback--fail"),
        role: "status",
        "aria-live": "polite",
      },
      el("span", { class: "check-feedback__icon" }, icon(result.pass ? "CheckCircle2" : "XCircle")),
      el("span", null, result.message)
    );
  }

  /* ----------------------------- objective card ---------------------------- */

  /**
   * ObjectiveCard — inline objective workbench card (chip, context, body,
   * check/hint buttons, hints, feedback, pass feedback). The `body` nodes are
   * rendered once (they hold the widget inputs); every dynamic region is
   * rebuilt by refresh() on objState/checkResults changes so focus is never
   * stolen from an input while typing.
   */
  function objectiveCard(objId, bodyNodes, scope) {
    var state = GH.state;
    var mode = state.mode;
    var def = null;
    var defs = GH.OBJECTIVES[mode] || [];
    for (var i = 0; i < defs.length; i++) {
      if (defs[i].id === objId) {
        def = defs[i];
        break;
      }
    }
    if (!def) return el("span");

    var root = el("section", { class: "obj-card", "aria-label": def.title });
    var chip = el("span", { class: "obj-card__chip" }, def.id);
    var doneSlot = el("span");
    var head = el(
      "header",
      { class: "obj-card__head" },
      chip,
      pillarBadge(def.pillar),
      el("h3", { class: "obj-card__title" }, def.title),
      doneSlot
    );
    root.appendChild(head);
    if (def.context && mode === "medium") {
      root.appendChild(el("p", { class: "obj-card__ctx" }, def.context));
    }
    var body = el("div", { class: "obj-card__body" });
    (bodyNodes || []).forEach(function (n) {
      body.appendChild(n);
    });
    root.appendChild(body);
    var actionsWrap = el("div", { class: "obj-card__actions" });
    var hintsWrap = el("div");
    var fbWrap = el("div");
    var passWrap = el("div");
    root.appendChild(actionsWrap);
    root.appendChild(hintsWrap);
    root.appendChild(fbWrap);
    root.appendChild(passWrap);

    function stageGoto() {
      var stage = GH.stageForObjective(objId, mode);
      if (!stage) return null;
      return el(
        "button",
        {
          type: "button",
          class: "obj-card__goto",
          onclick: function () {
            GH.app.goStage(stage);
          },
        },
        "open " + stage,
        icon("ChevronRight", "icon--tiny")
      );
    }

    function refresh() {
      var st = GH.state.objState[objId];
      var res = GH.state.checkResults[objId];
      var hintsShown = (st && st.hints) || 0;
      var maxHints = GH.state.mode === "medium" ? 3 : 1;
      var done = !!(st && st.done);

      root.classList.toggle("obj-card--done", done);
      chip.classList.toggle("obj-card__chip--done", done);
      doneSlot.textContent = "";
      if (done) doneSlot.appendChild(icon("CheckCircle2", "obj-card__doneicon", { label: "completed" }));

      actionsWrap.textContent = "";
      var checkBtn = el(
        "button",
        {
          type: "button",
          class: "btn btn--outline-amber btn--sm",
          onclick: function () {
            GH.actions.check(objId);
          },
        },
        "Check results"
      );
      actionsWrap.appendChild(checkBtn);
      if (hintsShown < maxHints) {
        actionsWrap.appendChild(
          el(
            "button",
            {
              type: "button",
              class: "btn btn--ghost btn--sm",
              onclick: function () {
                GH.actions.revealHint(objId);
              },
            },
            icon("Lightbulb", "icon--tiny obj-card__bulb"),
            " ",
            GH.state.mode === "medium"
              ? "Hint " + (hintsShown + 1) + "/" + maxHints
              : "Reveal nudge (costs stars)"
          )
        );
      }
      var gotoBtn = stageGoto();
      if (gotoBtn) actionsWrap.appendChild(gotoBtn);

      hintsWrap.textContent = "";
      if (hintsShown > 0) {
        var box = el("div", { class: "hint-box" });
        def.hints.slice(0, hintsShown).forEach(function (h) {
          box.appendChild(el("p", { class: "hint-box__line" }, h));
        });
        hintsWrap.appendChild(box);
      }

      fbWrap.textContent = "";
      fbWrap.appendChild(checkFeedback(res));

      passWrap.textContent = "";
      if (res && res.pass) {
        passWrap.appendChild(el("p", { class: "obj-card__pass" }, def.passFeedback));
      }
    }

    refresh();
    GH.on(["objState", "checkResults"], refresh, scope || "stage");
    return root;
  }

  /* ----------------------------- widgets ----------------------------------- */

  /**
   * MatchPairs — click an attack, then its mechanism (Doctrine stage, OBJ-M1).
   * Rebuilds on matchPairs changes; refocuses the last-clicked control so
   * keyboard pairing survives re-renders.
   */
  function matchPairs(attacks, mechs, scope) {
    var picked = null;
    var refocus = null;
    var mechById = {};
    mechs.forEach(function (m) {
      mechById[m.id] = m;
    });

    var root = el("div", {
      class: "match-grid",
      "aria-label": "Attack matching exercise",
    });
    var atkCol = el("div", { class: "stack-sm" });
    var mechCol = el("div", { class: "stack-sm" });
    root.appendChild(atkCol);
    root.appendChild(mechCol);

    function render() {
      var pairs = GH.state.matchPairs;
      atkCol.textContent = "";
      mechCol.textContent = "";
      atkCol.appendChild(el("p", { class: "col-label" }, "Attack"));
      attacks.forEach(function (a) {
        var linked = pairs[a.id];
        var active = picked === a.id;
        var b = el(
          "button",
          {
            type: "button",
            class:
              "match-btn" +
              (active ? " match-btn--picked" : linked ? " match-btn--linked" : ""),
            onclick: function () {
              picked = picked === a.id ? null : a.id;
              refocus = { col: "atk", id: a.id };
              render();
            },
          },
          el("span", { class: "match-btn__label" }, a.label),
          linked
            ? el("span", { class: "match-btn__link" }, "→ " + mechById[linked].text.slice(0, 58) + "…")
            : null
        );
        b.__matchId = a.id;
        b.setAttribute("data-mid", a.id);
        atkCol.appendChild(b);
      });
      mechCol.appendChild(el("p", { class: "col-label" }, "Mechanism"));
      mechs.forEach(function (m) {
        var used = attacks.some(function (a) {
          return pairs[a.id] === m.id;
        });
        var b = el(
          "button",
          {
            type: "button",
            class:
              "match-btn" +
              (picked ? " match-btn--await" : used ? " match-btn--linked" : " match-btn--idle"),
            onclick: function () {
              if (picked) {
                GH.actions.setPair(picked, m.id);
                picked = null;
                refocus = { col: "mech", id: m.id };
                render();
              }
            },
          },
          m.text
        );
        b.__matchId = m.id;
        b.setAttribute("data-mid", m.id);
        mechCol.appendChild(b);
      });
      if (refocus) {
        var target = (refocus.col === "atk" ? atkCol : mechCol).querySelector(
          '[data-mid="' + refocus.id + '"]'
        );
        if (target) target.focus();
        refocus = null;
      }
    }
    render();
    GH.on(["matchPairs"], render, scope || "stage");
    return root;
  }

  /**
   * OrderList — sequence builder: click to append, arrows to reorder, X to
   * remove. Rebuilds on seq changes and restores focus to the moved control.
   */
  function orderList(items, hint, scope) {
    var refocus = null; // {id, kind}
    var root = el("div", { class: "stack-sm", "aria-label": "Sequence builder" });
    root.appendChild(el("p", { class: "muted-note" }, hint));
    var list = el("ol", { class: "seq-list" });
    var remainingWrap = el("div", { class: "stack-sm" });
    root.appendChild(list);
    root.appendChild(remainingWrap);

    function render() {
      var seq = GH.state.seq;
      list.textContent = "";
      remainingWrap.textContent = "";
      var ordered = seq
        .map(function (id) {
          for (var i = 0; i < items.length; i++) if (items[i].id === id) return items[i];
          return null;
        })
        .filter(Boolean);
      ordered.forEach(function (item, idx) {
        var li = el(
          "li",
          { class: "seq-item" },
          el("span", { class: "seq-item__num" }, String(idx + 1)),
          el("span", { class: "seq-item__label" }, item.label),
          el(
            "span",
            { class: "seq-item__btns" },
            el(
              "button",
              {
                type: "button",
                "aria-label": "Move " + (idx + 1) + " up",
                disabled: idx === 0 ? true : null,
                "data-seq": item.id,
                "data-kind": "up",
                class: "icon-btn",
                onclick: function () {
                  refocus = { id: item.id, kind: "up" };
                  GH.actions.moveSeq(item.id, -1);
                },
              },
              icon("ArrowUp")
            ),
            el(
              "button",
              {
                type: "button",
                "aria-label": "Move " + (idx + 1) + " down",
                disabled: idx === ordered.length - 1 ? true : null,
                "data-seq": item.id,
                "data-kind": "down",
                class: "icon-btn",
                onclick: function () {
                  refocus = { id: item.id, kind: "down" };
                  GH.actions.moveSeq(item.id, 1);
                },
              },
              icon("ArrowDown")
            ),
            el(
              "button",
              {
                type: "button",
                "aria-label": "Remove step " + (idx + 1) + ": " + item.label,
                "data-seq": item.id,
                "data-kind": "remove",
                class: "icon-btn icon-btn--danger",
                onclick: function () {
                  refocus = { id: item.id, kind: "add" };
                  GH.actions.removeSeq(item.id);
                },
              },
              icon("XCircle")
            )
          )
        );
        list.appendChild(li);
      });
      var remaining = items.filter(function (i) {
        return !seq.includes(i.id);
      });
      remaining.forEach(function (item) {
        remainingWrap.appendChild(
          el(
            "button",
            {
              type: "button",
              "data-seq": item.id,
              "data-kind": "add",
              class: "seq-add",
              onclick: function () {
                /* Dedupe guard lives in the action (rapid double-click safe). */
                refocus = { id: item.id, kind: "row" };
                GH.actions.addSeq(item.id);
              },
            },
            icon("Plus", "icon--tiny"),
            item.label
          )
        );
      });
      if (refocus) {
        var sel = '[data-seq="' + refocus.id + '"][data-kind="' + refocus.kind + '"]';
        var target =
          root.querySelector(sel) ||
          root.querySelector('[data-seq="' + refocus.id + '"]');
        if (target && !target.disabled) target.focus();
        refocus = null;
      }
    }
    render();
    GH.on(["seq"], render, scope || "stage");
    return root;
  }

  /**
   * LogView — filterable log with RAW / URL-DECODED toggle (Evidence stage).
   * The filter input is stable DOM; only the line container re-renders.
   */
  function logView(lines, scope) {
    var q = "";
    var decoded = false;

    function decode(s) {
      return s.replace(/%([0-9A-Fa-f]{2})/g, function (_, h) {
        return String.fromCharCode(parseInt(h, 16));
      });
    }

    var root = el("div", { class: "stack-sm" });
    var searchInput = el("input", {
      type: "text",
      class: "input input--logsearch",
      placeholder: "Filter lines…",
      "aria-label": "Filter log lines",
      oninput: function (e) {
        q = e.target.value;
        renderLines();
      },
    });
    var decodeBtn = el(
      "button",
      {
        type: "button",
        class: "log-decode-btn",
        "aria-pressed": "false",
        onclick: function () {
          decoded = !decoded;
          decodeBtn.classList.toggle("log-decode-btn--on", decoded);
          decodeBtn.setAttribute("aria-pressed", decoded ? "true" : "false");
          decodeBtn.textContent = decoded ? "URL-DECODED" : "RAW";
          renderLines();
        },
      },
      "RAW"
    );
    var countSpan = el("span", { class: "log-count" });
    var searchWrap = el(
      "div",
      { class: "log-search" },
      icon("Search", "log-search__icon"),
      searchInput
    );
    var toolbar = el(
      "div",
      { class: "log-toolbar" },
      searchWrap,
      decodeBtn,
      countSpan
    );
    var linesBox = el("div", {
      class: "log-box",
      role: "log",
      "aria-label": "Log lines",
    });
    root.appendChild(toolbar);
    root.appendChild(linesBox);

    function renderLines() {
      var filtered = lines.filter(function (l) {
        return (
          !q ||
          l.msg.toLowerCase().includes(q.toLowerCase()) ||
          l.id.toLowerCase().includes(q.toLowerCase())
        );
      });
      linesBox.textContent = "";
      filtered.forEach(function (l) {
        linesBox.appendChild(
          el(
            "div",
            { class: "log-line" },
            el("span", { class: "log-line__id" }, l.id),
            el("span", { class: "log-line__ts" }, l.ts),
            el(
              "span",
              {
                class:
                  "log-line__level log-line__level--" + l.level,
              },
              l.level.toUpperCase()
            ),
            el("span", { class: "log-line__msg" }, decoded ? decode(l.msg) : l.msg)
          )
        );
      });
      if (filtered.length === 0) {
        linesBox.appendChild(el("p", { class: "log-empty" }, "No lines match the filter."));
      }
      countSpan.textContent = filtered.length + "/" + lines.length + " lines";
    }
    renderLines();
    return root;
  }

  /* --------------------------- modal / sheet ------------------------------- */

  /**
   * mountModal — accessible modal: overlay, ESC to close, optional backdrop
   * close, optional X button, focus capture + restore, body scroll lock.
   * Returns a close() function.
   */
  function mountModal(opts) {
    var prevFocus = document.activeElement;
    var overlay = el("div", { class: "modal-overlay" });
    var panel = el("div", {
      class: "modal-panel " + (opts.panelClass || ""),
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": opts.labelledBy || undefined,
      tabindex: "-1",
    });
    overlay.appendChild(panel);

    function close() {
      document.removeEventListener("keydown", onKey, true);
      overlay.remove();
      document.body.classList.remove("no-scroll");
      if (prevFocus && prevFocus.focus) prevFocus.focus();
      if (opts.onClose) opts.onClose();
    }
    function onKey(e) {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
    }

    if (opts.showClose !== false) {
      panel.appendChild(
        el(
          "button",
          { type: "button", class: "modal-close", "aria-label": "Close", onclick: close },
          icon("X")
        )
      );
    }
    if (opts.build) opts.build(panel, close);
    overlay.addEventListener("mousedown", function (e) {
      if (e.target === overlay && opts.closeOnBackdrop !== false) close();
    });
    document.addEventListener("keydown", onKey, true);
    document.body.classList.add("no-scroll");
    document.body.appendChild(overlay);
    panel.focus();
    return close;
  }

  /** Sheet variant — slides in from the right (objectives tracker on <xl). */
  function mountSheet(opts) {
    return mountModal(
      Object.assign({}, opts, { panelClass: "modal-panel--sheet " + (opts.panelClass || "") })
    );
  }

  GH.el = el;
  GH.icon = icon;
  GH.pillarBadge = pillarBadge;
  GH.sectionLabel = sectionLabel;
  GH.segGroup = segGroup;
  GH.checkFeedback = checkFeedback;
  GH.objectiveCard = objectiveCard;
  GH.matchPairs = matchPairs;
  GH.orderList = orderList;
  GH.logView = logView;
  GH.mountModal = mountModal;
  GH.mountSheet = mountSheet;
})();
