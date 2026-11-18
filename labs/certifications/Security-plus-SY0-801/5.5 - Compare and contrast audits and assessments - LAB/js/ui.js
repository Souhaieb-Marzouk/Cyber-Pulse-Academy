/* ============================================================
   The Assurance Bureau — js/ui.js
   Component library: paper-world primitives, documents, objective
   cards, interaction widgets, rigs, masthead, tabs, ledger, dialogs.
   Each widget owns its DOM: interactions update the widget locally
   (mirroring the React version's per-component re-renders).
   ============================================================ */

var UI = (function () {
  "use strict";

  // ---------- tiny dom helper ----------
  function el(tag, props, children) {
    var node = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function (k) {
        var v = props[k];
        if (v === null || v === undefined || v === false) return;
        if (k === "class") node.className = v;
        else if (k === "html") node.innerHTML = v; // trusted static content only (inline SVG)
        else if (k === "text") node.textContent = v;
        else if (k.slice(0, 2) === "on" && typeof v === "function") {
          node.addEventListener(k.slice(2).toLowerCase(), v);
        } else if (k === "style" && typeof v === "object") {
          Object.keys(v).forEach(function (sk) {
            node.style.setProperty(sk, v[sk]);
          });
        } else {
          node.setAttribute(k, v === true ? "" : v);
        }
      });
    }
    (children || []).forEach(function (c) {
      if (c === null || c === undefined || c === false) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  var ICON_X =
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
  var ICON_CHEV =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

  // widget registry — lets handlers refresh a single widget in place
  var widgetRegistry = {}; // key: "OBJ.part" -> { rerender: fn, partEl: Element }
  var rigTimers = new Set(); // staged-output timers, cleared on re-render

  function clearTransientState() {
    rigTimers.forEach(function (t) {
      clearTimeout(t);
    });
    rigTimers.clear();
    UI.tooltip.hide();
  }

  // ---------- primitives ----------
  function DocWatermark() {
    return el("div", { class: "doc-watermark", "aria-hidden": "true", text: "TRAINING DATA — SYNTHETIC" });
  }

  function Stamp(ok, label) {
    return el("span", { class: "lab-stamp " + (ok ? "ok" : "bad"), text: label });
  }

  function PillarBadge(pillar) {
    var s = LAB_DATA.PILLAR_STYLE[pillar];
    return el(
      "span",
      {
        class: "pillar-badge",
        "aria-label": "Mastery pillar: " + LAB_DATA.PILLAR_SHORT[pillar],
        style: { "background-color": s.bg, color: s.fg },
        text: pillar + " · " + LAB_DATA.PILLAR_SHORT[pillar],
      }
    );
  }

  function DeskSection(kicker, title, children) {
    return el("section", { class: "lab-card-paper desk-section" }, [
      kicker ? el("p", { class: "kicker", text: kicker }) : null,
      el("h2", { class: "ds-title", text: title }),
    ].concat(children));
  }

  function PaperDoc(doc) {
    var mono = doc.kind === "config" || doc.kind === "log" || doc.kind === "report";
    return el("article", { class: "lab-card-paper paper-doc" }, [
      DocWatermark(),
      el("header", { class: "doc-head" }, [
        el("h3", { class: "doc-title", text: doc.title }),
        el("p", { class: "doc-meta", text: doc.meta }),
      ]),
      el("div", {}, doc.sections.map(function (sec) {
        return el("section", { class: "doc-sec" }, [
          sec.heading ? el("h4", { text: sec.heading }) : null,
          el("ul", { class: "doc-lines" + (mono ? " mono-lines" : "") }, sec.lines.map(function (line) {
            return el("li", { class: "lab-ruled", text: line });
          })),
        ]);
      })),
    ]);
  }

  function MentorNote(children) {
    return el("div", { class: "mentor-note" }, [
      el("p", { class: "note-label", style: { color: "var(--amber)" }, text: "From " + LAB_DATA.CASE.mentor }),
    ].concat(children));
  }

  function ReferenceCards() {
    return el("div", { class: "ref-cards", "aria-label": "Reference sources" }, LAB_DATA.REFERENCE_SOURCES.map(function (r) {
      return el("div", { class: "ref-card" }, [
        el("h4", { text: r.name }),
        el("p", { text: r.blurb }),
      ]);
    }));
  }

  // ---------- glossary accordion (single-open, like the original) ----------
  function renderGlossary() {
    return el("div", { class: "acc" }, LAB_DATA.GLOSSARY.map(function (g) {
      var panel = el("div", { class: "acc-panel", id: "acc-" + slug(g.term), hidden: true }, [el("p", { text: g.def })]);
      var trigger = el("button", {
        type: "button",
        class: "acc-trigger",
        "aria-expanded": "false",
        "aria-controls": "acc-" + slug(g.term),
        "data-action": "acc-toggle",
      }, [el("span", { text: g.term }), el("span", { class: "acc-chev", html: ICON_CHEV })]);
      trigger._panel = panel;
      return el("div", { class: "acc-item" }, [trigger, panel]);
    }));
  }

  function slug(s) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  }

  // ---------- term tooltip (shared bubble) ----------
  var tooltip = {
    el: null,
    timer: null,
    ensure: function () {
      if (!tooltip.el) {
        tooltip.el = el("div", { class: "term-tip", role: "tooltip", hidden: true });
        document.body.appendChild(tooltip.el);
      }
      return tooltip.el;
    },
    show: function (target) {
      tooltip.hide();
      tooltip.timer = setTimeout(function () {
        var tip = tooltip.ensure();
        tip.textContent = "";
        tip.appendChild(el("p", { class: "tt-name", text: target._term }));
        tip.appendChild(el("p", { text: target._def }));
        tip.hidden = false;
        var r = target.getBoundingClientRect();
        var tr = tip.getBoundingClientRect();
        var left = Math.max(8, Math.min(window.innerWidth - tr.width - 8, r.left + window.scrollX));
        var top = r.top + window.scrollY - tr.height - 6;
        if (top < window.scrollY + 4) top = r.bottom + window.scrollY + 6;
        tip.style.left = left + "px";
        tip.style.top = top + "px";
      }, 150);
    },
    hide: function () {
      if (tooltip.timer) clearTimeout(tooltip.timer);
      tooltip.timer = null;
      if (tooltip.el) tooltip.el.hidden = true;
    },
  };

  function Term(t, textOverride) {
    var entry = LAB_DATA.GLOSSARY.find(function (g) {
      return g.term.toLowerCase() === t.toLowerCase();
    });
    var text = textOverride || t;
    if (!entry) return el("span", { text: text });
    var btn = el("button", {
      type: "button",
      class: "term",
      "aria-label": text + ": " + entry.def,
    });
    btn.textContent = text;
    btn._term = entry.term;
    btn._def = entry.def;
    return btn;
  }

  // ============================================================
  // WIDGETS (one per part kind) — each owns and refreshes its DOM
  // ============================================================

  var WIDGETS = {
    // ---------- choice (single radio) ----------
    choice: function (obj, part, locked) {
      var state = STORE.getState();
      var val = state.answers[obj.id + "." + part.id];
      var rec = state.checks[obj.id];
      var graded = !!(rec && rec.submitted);
      var rows = (part.options || []).map(function (opt, i) {
        var selected = val === opt;
        var isCorrect = selected && graded && opt === part.solution;
        var isWrong = selected && graded && opt !== part.solution;
        var cls = "radio-row";
        if (isCorrect) cls += " correct-sel";
        else if (isWrong) cls += " wrong-sel";
        else if (selected) cls += " selected";
        if (locked) cls += " locked";
        var row = el("label", { class: cls }, [
          el("input", {
            type: "radio",
            name: "rg-" + obj.id + "-" + part.id,
            value: opt,
            checked: selected,
            disabled: locked,
            "data-key": obj.id + "." + part.id,
            "data-opt": opt,
          }),
          el("span", { class: "opt-letter", text: String.fromCharCode(65 + i) + "." }),
          el("span", { class: "flex1", text: opt }),
          isCorrect ? el("span", { class: "mark-ok", "aria-hidden": "true", text: "✓" }) : null,
          isWrong ? el("span", { class: "mark-bad", "aria-hidden": "true", text: "✗" }) : null,
        ]);
        return row;
      });
      var group = el("div", { class: "radio-rows", role: "radiogroup", "aria-label": part.label }, rows);
      return group;
    },

    // ---------- choices (per-item assignment chips) ----------
    choices: function (obj, part, locked) {
      var state = STORE.getState();
      var key = obj.id + "." + part.id;
      var raw = state.answers[key];
      var val = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
      var rec = state.checks[obj.id];
      var graded = !!(rec && rec.submitted);
      return el("div", { class: "grid-rows" }, (part.items || []).map(function (item) {
        return el("div", { class: "grid-row" }, [
          el("p", { text: item.label }),
          el("div", { class: "chip-radios", role: "radiogroup", "aria-label": part.label + ": " + item.label }, (part.itemOptions || []).map(function (opt) {
            var selected = val[item.id] === opt;
            var isCorrect = selected && graded && part.itemSolution[item.id] === opt;
            var isWrong = selected && graded && part.itemSolution[item.id] !== opt;
            var cls = "chip-radio";
            if (isCorrect) cls += " correct-sel";
            else if (isWrong) cls += " wrong-sel";
            else if (selected) cls += " selected";
            if (locked) cls += " locked";
            return el("label", { class: cls }, [
              el("input", {
                type: "radio",
                name: "cr-" + obj.id + "-" + part.id + "-" + item.id,
                value: opt,
                checked: selected,
                disabled: locked,
                "data-key": key,
                "data-item": item.id,
                "data-opt": opt,
              }),
              opt,
              isCorrect ? el("span", { "aria-hidden": "true", style: { "margin-left": "6px" }, text: "✓" }) : null,
              isWrong ? el("span", { "aria-hidden": "true", style: { "margin-left": "6px" }, text: "✗" }) : null,
            ]);
          })),
        ]);
      }));
    },

    // ---------- order (click-to-build sequence; R6 seeded shuffle per attempt) ----------
    order: function (obj, part, locked) {
      var state = STORE.getState();
      var key = obj.id + "." + part.id;
      var raw = state.answers[key];
      var value = Array.isArray(raw) ? raw : [];
      var items = part.items || [];
      var attempt = (state.checks[obj.id] && state.checks[obj.id].attempts) || 0;
      var shuffled = seededShuffle(items, hashStr(obj.id + "." + part.id + ":" + attempt));
      var rec = state.checks[obj.id];
      var graded = !!(rec && rec.submitted);
      var seqOk =
        graded &&
        Array.isArray(value) &&
        (part.solutionOrder || []).length === value.length &&
        (part.solutionOrder || []).every(function (id, i) {
          return value[i] === id;
        });

      function labelOf(id) {
        var it = items.find(function (i) {
          return i.id === id;
        });
        return it ? it.label : id;
      }

      var seqItems = value.map(function (id, idx) {
        var cls = "seq-item";
        if (seqOk) cls += " correct-seq";
        else if (graded) cls += " wrong-seq";
        if (locked) cls += " locked";
        return el("li", {}, [
          el("button", {
            type: "button",
            class: cls,
            disabled: locked,
            "data-action": "order-remove",
            "data-key": key,
            "data-id": id,
            "aria-label": "Step " + (idx + 1) + ": " + labelOf(id) + " — activate to remove",
          }, [
            el("span", { class: "seq-num", text: String(idx + 1) }),
            el("span", { text: labelOf(id) }),
            locked ? null : el("span", { class: "seq-remove", "aria-hidden": "true", text: "✕ remove" }),
          ]),
        ]);
      });

      var remaining = shuffled.filter(function (i) {
        return value.indexOf(i.id) === -1;
      });
      var adds = el("div", { class: "chip-adds" }, remaining.map(function (i) {
        return el("button", {
          type: "button",
          class: "chip-add btn",
          disabled: locked,
          "data-action": "order-add",
          "data-key": key,
          "data-id": i.id,
          text: "+ " + i.label,
        });
      }));

      return el("div", { class: "order-widget" }, [
        value.length > 0 ? el("ol", { class: "seq-list", "aria-label": "Your sequence" }, seqItems) : null,
        remaining.length > 0 ? adds : null,
        value.length > 0 && !locked
          ? el("button", { type: "button", class: "seq-clear", "data-action": "order-clear", "data-key": key, text: "Clear sequence" })
          : null,
      ]);
    },

    // ---------- set (exact multi-select) ----------
    set: function (obj, part, locked) {
      var state = STORE.getState();
      var key = obj.id + "." + part.id;
      var raw = state.answers[key];
      var value = Array.isArray(raw) ? raw : [];
      var rec = state.checks[obj.id];
      var graded = !!(rec && rec.submitted);
      var rows;
      if (part.id === "sample") {
        rows = LAB_DATA.POPULATION.map(function (pr) {
          return { id: pr.id, title: pr.code + " · " + pr.name, sub: pr.type.toUpperCase() + " — " + pr.note, type: pr.type };
        });
      } else {
        rows = (part.items || []).map(function (i) {
          return { id: i.id, title: i.label, sub: "", type: "" };
        });
      }
      var count = el("p", { class: "set-count", "aria-live": "polite", text: "Selected: " + value.length });
      var list = el(
        "div",
        { class: "set-list" },
        rows.map(function (r) {
          var checked = value.indexOf(r.id) !== -1;
          var isCorrect = checked && graded && (part.solutionSet || []).indexOf(r.id) !== -1;
          var isWrong = checked && graded && (part.solutionSet || []).indexOf(r.id) === -1;
          var rowCls = "set-row";
          if (isCorrect) rowCls += " correct-sel";
          if (isWrong) rowCls += " wrong-sel";
          var subCls = "set-sub";
          if (r.type === "privileged") subCls += " privileged";
          if (r.type === "terminated" || r.type === "service") subCls += " quiet";
          var cb = el("input", {
            type: "checkbox",
            checked: checked,
            disabled: locked,
            "data-key": key,
            "data-id": r.id,
            "aria-label": r.title,
          });
          var label = el("label", { class: locked ? "locked" : "" }, [
            el("span", { class: "set-code" }, [
              r.title,
              isCorrect ? el("span", { "aria-hidden": "true", style: { "margin-left": "6px", color: "var(--green)" }, text: "✓" }) : null,
              isWrong ? el("span", { "aria-hidden": "true", style: { "margin-left": "6px", color: "var(--red)" }, text: "✗" }) : null,
            ]),
            r.sub ? el("span", { class: subCls, text: r.sub }) : null,
          ]);
          return el("div", { class: rowCls }, [cb, label]);
        })
      );
      return el("div", { class: "set-widget" }, [count, list]);
    },

    // ---------- text ----------
    text: function (obj, part, locked) {
      var state = STORE.getState();
      var key = obj.id + "." + part.id;
      var val = state.answers[key];
      var rec = state.checks[obj.id];
      var graded = !!(rec && rec.submitted);
      var ok = graded && rec.last && rec.last.parts[part.id] && rec.last.parts[part.id].ok;
      var cls = "text-field";
      if (graded && typeof val === "string" && val.length > 0) cls += ok ? " correct-sel" : " wrong-sel";
      return el("div", {}, [
        el("label", { class: "part-label", "for": "tf-" + key, text: part.label }),
        el("input", {
          type: "text",
          id: "tf-" + key,
          class: cls,
          value: typeof val === "string" ? val : "",
          placeholder: part.placeholder || "",
          disabled: locked,
          autocomplete: "off",
          "data-key": key,
        }),
      ]);
    },

    // ---------- state (rig runs / sign-off) ----------
    state: function (obj, part) {
      var state = STORE.getState();
      if (part.id === "signoff") {
        var gateDone =
          state.mode === "hard"
            ? !!(state.checks["H6"] && state.checks["H6"].done)
            : !!(state.checks["M8"] && state.checks["M8"].done && state.checks["M10"] && state.checks["M10"].done);
        var signed = !!state.signoff;
        return el("div", { class: "signoff-box" }, [
          el("p", {
            text: signed
              ? "Engagement signed — the close-out report is on the committee's desk."
              : gateDone
                ? "The ledger is clear. Sign below to close the engagement."
                : "Sign-off unlocks when every finding is remediated and validated (ledger on the right must be clear).",
          }),
          el("button", {
            type: "button",
            class: "btn btn-green",
            disabled: !gateDone || signed,
            "data-action": "signoff",
            text: signed ? "✓ Signed" : "Sign engagement close-out",
          }),
        ]);
      }
      return el("ul", { class: "state-list" }, (part.flags || []).map(function (f) {
        var done = !!state.flags[f];
        return el("li", { class: done ? "done" : "" }, [
          el("span", { class: "state-dot", "aria-hidden": "true", text: done ? "✓" : "·" }),
          el("span", { class: "txt", text: f === "rig-mfa-run" ? "MFA functional test executed in the rig" : "Backup behavioral drill executed in the rig" }),
          !done
            ? el("button", { type: "button", class: "btn-link", "data-action": "simulate", "data-flag": f, text: "(simulate now — see the rig cards above)" })
            : null,
        ]);
      }));
    },
  };

  // seeded shuffle helpers — IDENTICAL algorithm to the original (R6)
  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hashStr(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function seededShuffle(arr, seed) {
    var rand = mulberry32(seed);
    var out = arr.slice();
    for (var i = out.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1));
      var tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
    return out;
  }

  // ---------- control test rig ----------
  function RigConsole(rigKey) {
    var def = LAB_DATA.RIGS.find(function (r) {
      return rigKey === "mfa" ? r.flag === "rig-mfa-run" : r.flag === "rig-backup-run";
    });
    var state = STORE.getState();
    var shown = state.flags[def.flag] ? def.lines.length : 0;
    var log;
    var runBtn;
    var root = el("div", { class: "rig" });

    function draw() {
      root.textContent = "";
      var done = shown >= def.lines.length;
      root.appendChild(
        el("div", { class: "rig-head" }, [
          el("h3", { class: "rig-title" }, [
            def.title + " ",
            el("span", { class: "rig-kind", text: "· " + def.kind }),
          ]),
          done ? el("span", { class: "rig-done-mark", text: "executed ✓" }) : null,
        ])
      );
      root.appendChild(el("p", { class: "rig-intro", text: def.intro }));
      log = el("div", { role: "log", "aria-live": "polite", "aria-label": def.title + " output", class: "rig-log" });
      def.lines.slice(0, shown).forEach(function (l) {
        var cls = "rig-line";
        if (l.indexOf("DENIED") !== -1) cls += " bad";
        else if (l.indexOf("RESULT") !== -1 || l.indexOf("02:31") !== -1) cls += " good";
        log.appendChild(el("div", { class: cls, text: l }));
      });
      if (shown === 0) log.appendChild(el("div", { class: "rig-idle", text: "— instrument idle — press RUN to operate the control —" }));
      if (shown > 0 && shown < def.lines.length) log.appendChild(el("div", { class: "rig-running", text: "running…" }));
      root.appendChild(log);
      runBtn = el("button", { type: "button", class: "btn btn-amber", "data-rig": def.flag, text: done ? "Re-run test" : "▶ Run test" });
      runBtn.addEventListener("click", run);
      root.appendChild(runBtn);
    }

    function run() {
      if (shown > 0 && shown < def.lines.length) return; // already running
      shown = 0;
      draw();
      var i = 0;
      var step = function () {
        i += 1;
        shown = i;
        draw();
        if (i < def.lines.length) {
          var t = setTimeout(step, 320);
          rigTimers.add(t);
        } else {
          STORE.runRig(def.flag); // topic "flag": app refreshes state-part widgets
        }
      };
      var t0 = setTimeout(step, 320);
      rigTimers.add(t0);
    }

    draw();
    return root;
  }

  // ============================================================
  // OBJECTIVE CARD
  // ============================================================

  function objectiveCard(obj) {
    var state = STORE.getState();
    var rec = state.checks[obj.id];
    var done = !!(rec && rec.done);
    var result = rec && rec.last ? rec.last : null;
    // R2: a graded full submission locks the worksheet until a fresh attempt is started
    var locked = done || !!(rec && rec.submitted);
    var hintsShown = rec ? rec.hintsUsed : 0;
    var maxHints = obj.mode === "hard" ? 1 : obj.hints.length;

    // allAnswered: state-kind parts are satisfied by environment flags
    var allAnswered = obj.parts.every(function (p) {
      if (p.kind === "state") return true;
      var v = state.answers[obj.id + "." + p.id];
      if (v === undefined) return false;
      if (Array.isArray(v)) {
        return p.kind === "order" ? v.length === (p.solutionOrder || []).length : v.length > 0;
      }
      if (typeof v === "object") return Object.keys(v).length > 0;
      return typeof v === "string" && v.trim().length > 0;
    });

    var card = el("section", { class: "lab-card-paper obj-card" + (done ? " done" : ""), "aria-label": "Objective " + obj.id + ": " + obj.title });

    card.appendChild(el("header", { class: "obj-head" }, [
      el("span", { class: "obj-id", text: obj.id }),
      PillarBadge(obj.pillar),
      el("h3", { class: "obj-title", text: obj.title }),
    ]));
    card.appendChild(el("p", { class: "obj-prompt", text: obj.prompt }));
    if (obj.lookFor && !done && !locked) {
      card.appendChild(
        el("p", { class: "obj-lookfor" }, [
          el("span", { "aria-hidden": "true", text: "▸" }),
          el("span", {}, [el("strong", { text: "Where to look: " }), obj.lookFor]),
        ])
      );
    }

    var partsWrap = el("div", {});
    obj.parts.forEach(function (part) {
      var wrap = el("div", { class: "obj-part", "data-widget": obj.id + "." + part.id });
      renderPartInto(wrap, obj, part, locked);
      if (result && !result.ok && result.parts[part.id] && !result.parts[part.id].ok && result.parts[part.id].reason) {
        wrap.appendChild(el("p", { class: "part-reason", role: "status", text: result.parts[part.id].reason }));
      }
      partsWrap.appendChild(wrap);
    });
    card.appendChild(partsWrap);

    // toolbar
    var toolbar = el("div", { class: "obj-toolbar" });
    if (done) {
      toolbar.appendChild(el("p", { style: { margin: "0" } }, [Stamp(true, "DONE")]));
    } else if (locked) {
      toolbar.appendChild(
        el("p", { class: "lock-note-wrap", style: { display: "flex", alignItems: "center", gap: "8px", margin: "0" } }, [
          Stamp(false, "LOCKED"),
          el("span", { class: "lock-note", text: "Submission checked — answers are locked. Start a fresh attempt to answer again." }),
        ])
      );
      toolbar.appendChild(el("button", { type: "button", class: "btn btn-outline-amber", "data-action": "retry", "data-obj": obj.id, text: "Clear & retry (fresh attempt)" }));
    } else {
      toolbar.appendChild(el("button", { type: "button", class: "btn btn-ink", "data-action": "check-results", "data-obj": obj.id, text: "Check results" }));
      toolbar.appendChild(
        el("button", {
          type: "button",
          class: "btn btn-outline-amber",
          "data-action": "hint-toggle",
          "data-obj": obj.id,
          text: obj.mode === "hard" ? "Use the one nudge (−3)" : "Reveal hint",
        })
      );
      toolbar.appendChild(
        el("span", { class: "obj-counter", text: "attempts: " + (rec ? rec.attempts : 0) + (obj.mode === "medium" ? " · hints: " + hintsShown + "/" + maxHints : hintsShown > 0 ? " · nudge used" : "") })
      );
    }
    card.appendChild(toolbar);

    if (showHints[obj.id] && !done) {
      var shownCount = Math.max(hintsShown, 1);
      var hintsBox = el("div", { class: "obj-hints", "aria-label": "Hints" });
      obj.hints.slice(0, shownCount).forEach(function (h, i) {
        hintsBox.appendChild(el("p", {}, [el("span", { class: "hint-n", text: "hint " + (i + 1) + ": " }), h]));
      });
      if (obj.mode === "medium" && hintsShown < obj.hints.length) {
        hintsBox.appendChild(el("button", { type: "button", class: "btn-link", "data-action": "hint-deeper", "data-obj": obj.id, text: "Deeper hint (lowers stars)" }));
      }
      card.appendChild(hintsBox);
    }

    if (done && result && result.ok) {
      card.appendChild(
        el("div", { class: "obj-feedback", role: "status", "aria-live": "polite" }, [
          el("p", { class: "why-label", text: "Why this matters · pillar " + obj.pillar + " (" + LAB_DATA.PILLAR_LABEL[obj.pillar] + ")" }),
          el("p", { class: "body", text: obj.feedback }),
        ])
      );
    }
    if (!done && !locked && !allAnswered && rec && rec.last != null) {
      card.appendChild(
        el("p", {
          class: "incomplete-note",
          text: "The check needs every field on this worksheet answered before it grades the submission — answer them all, then check again.",
        })
      );
    }

    return card;
  }

  var showHints = {}; // objId -> hints panel visible (local UI state, like React useState)

  function renderPartInto(wrap, obj, part, locked) {
    wrap.textContent = "";
    if (part.kind !== "choices" && part.kind !== "set") {
      wrap.appendChild(el("span", { class: "part-label", text: part.label }));
    } else {
      wrap.appendChild(el("p", { class: "part-label", text: part.label }));
    }
    var widget = WIDGETS[part.kind](obj, part, locked);
    wrap.appendChild(widget);
    widgetRegistry[obj.id + "." + part.id] = {
      obj: obj,
      part: part,
      locked: locked,
      el: wrap,
      rerender: function () {
        renderPartInto(wrap, obj, part, locked);
      },
    };
  }

  // refresh a single widget in place (called after answers change)
  function refreshWidget(key) {
    var reg = widgetRegistry[key];
    if (!reg) return;
    var active = document.activeElement;
    var focusSel = null;
    if (active && active.getAttribute && active.getAttribute("data-key") === key) {
      focusSel = active.getAttribute("data-opt") || active.getAttribute("data-id") || null;
      if (active.tagName === "INPUT" && active.type === "text") focusSel = null; // typing: never rebuild
    }
    reg.rerender();
    if (focusSel) {
      var next = reg.el.querySelector('[data-key="' + cssEscape(key) + '"][data-opt="' + cssEscape(focusSel) + '"], [data-key="' + cssEscape(key) + '"][data-id="' + cssEscape(focusSel) + '"]');
      if (next) next.focus();
    }
  }

  function cssEscape(s) {
    return (window.CSS && CSS.escape) ? CSS.escape(s) : s.replace(/"/g, '\\"');
  }

  // ============================================================
  // PHASE CONTENT
  // ============================================================

  function ObjectiveStack(objs) {
    if (objs.length === 0) return null;
    return el("div", { class: "obj-stack" }, [
      el("h2", { class: "obj-stack-title", text: "── Fieldwork worksheets (" + objs.length + ") ──" }),
    ].concat(objs.map(objectiveCard)));
  }

  function BriefingPhase(objs, mode) {
    var body = [];
    body.push(
      DeskSection("01 · Briefing · case file", "The engagement on your desk", [
        el("div", { style: { display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px", lineHeight: "1.6" } }, [
          el("p", {}, [
            el("strong", { text: "Halcyon Credit Union" }),
            " (fictional — all documents in this lab are ",
            el("span", { class: "case-strong", style: { color: "var(--red)" }, text: "TRAINING DATA" }),
            ") is a mid-size community lender. Its external ",
            Term("PCI DSS", "PCI DSS"),
            " assessment lands in December, and the Audit Committee has ordered an internal IT general controls audit first — case ",
            el("span", { class: "case-strong", text: LAB_DATA.CASE.caseNo }),
            ", fieldwork " + LAB_DATA.CASE.fieldwork + ".",
          ]),
          el("p", {}, [
            "You are ",
            el("strong", { text: LAB_DATA.CASE.auditor }),
            ". Your job is to ",
            el("em", { text: "participate" }),
            " — exactly the verb the certification lesson uses: participate in ",
            el("strong", { text: "audits, reviews, testing, and assessments" }),
            ". The desk holds the audit charter, evidence from the teams, a control test rig, and a findings ledger that grows as you work.",
          ]),
          el("p", { class: "obj-5-5" }, [
            "SY0-801 objective 5.5 — ",
            el("strong", { text: "“Compare and contrast audits and assessments”" }),
            " — sub-bullet: “Participate in audits, reviews, testing, and assessments.” Domain 5 (Security Program Management and Oversight) weighs 14% of the exam. Reference sources named in the draft objectives: MITRE ATT&CK, the Cyber Kill Chain, the Diamond Model.",
          ]),
          mode === "medium"
            ? MentorNote([
                el("p", {
                  text: "Welcome aboard. Work the binder tabs left to right — every worksheet tells you where to look, and hints never block you, they only cost stars. When the ledger is clear and the quiz is done, we sign.",
                }),
              ])
            : el("div", { class: "solo-note" }, [
                el("p", { class: "note-label", style: { color: "var(--red)" }, text: "Solo engagement notice" }),
                el("p", {
                  text: "This season the committee wants a sober, unsupervised pass: the case file is deliberately noisy, at least two items are red herrings, and one “helpful” log was re-issued mid-fieldwork. One nudge per worksheet, if you must — it costs score. Validation is strict; near-misses are rejected with reasons.",
                }),
              ]),
        ]),
      ])
    );

    var core = DeskSection("Knowledge core · what / how / why", "Audit vs Assessment — and the other two verbs", [
      el("div", { class: "kc-grid" }, [
        el("div", { class: "kc-card kc-audit" }, [
          el("h3", { text: "Audit" }),
          el("ul", {}, [
            el("li", {}, ["Point-in-time check of ", el("strong", { text: "actual state vs a documented standard" }), " (policy, regulation, approved ticket)."]),
            el("li", {}, ["Answers: ", el("em", { text: "“did we do what we wrote down?”" })]),
            el("li", {}, ["Findings cite the rule; evidence is gathered by ", el("strong", { text: "sampling" }), " and ", el("strong", { text: "interviews" }), ", then corroborated with records."]),
            el("li", { text: "Internal (own staff) or external (independent firm; regulators & card brands mandate it)." }),
          ]),
        ]),
        el("div", { class: "kc-card kc-assess" }, [
          el("h3", { text: "Assessment" }),
          el("ul", {}, [
            el("li", {}, ["Broad evaluation of ", el("strong", { text: "controls, risks and posture" }), " — often against a framework."]),
            el("li", {}, ["Answers: ", el("em", { text: "“are protections working, and where could we fail next?”" })]),
            el("li", { text: "Risk-focused output that drives improvements; may be compliance-driven or best-practice-driven." }),
            el("li", { text: "Frame coverage with reference sources: ATT&CK (behaviors), Kill Chain (stages), Diamond (incident relationships)." }),
          ]),
        ]),
      ]),
      el("div", { class: "kc-duo" }, [
        el("div", {}, [
          el("h4", { text: "The other two verbs" }),
          el("p", {}, [
            el("strong", {}, [Term("Review", "Reviews")]),
            " read artifacts — code, design, configuration — for flaws. Testing operates a control and observes behavior: ",
            el("strong", { text: "functional" }),
            " (as designed?) and ",
            el("strong", { text: "behavioral" }),
            " (under realistic stress?). An audit compares evidence to a standard; an assessment evaluates broadly.",
          ]),
        ]),
        el("div", {}, [
          el("h4", { text: "Drivers & the lifecycle" }),
          el("p", {}, [
            el("strong", { text: "Compliance-driven" }),
            " = a law, regulator or contract forces it (PCI DSS, GLBA). ",
            el("strong", { text: "Best-practice-driven" }),
            " = voluntary frameworks (ISO 27001, NIST CSF, CIS). Every engagement runs the same arc: charter → sampling plan → evidence → testing → findings → remediation → validation → closing report / ",
            Term("Attestation", "attestation"),
            ".",
          ]),
        ]),
      ]),
      el("div", { style: { marginTop: "12px" } }, [
        el("h4", { class: "part-label", text: "Reference sources (per SY0-801 draft objectives)" }),
        ReferenceCards(),
        el("p", { class: "ref-note", text: "Boundary: penetration-test report review lives in objective 4.3 (vulnerability management), and red/blue team exercises are adjacent activities — legitimate, but not part of 5.5." }),
      ]),
    ]);
    body.push(core);

    body.push(DeskSection("Glossary", "Speak the bureau's language", [renderGlossary()]));
    var stack = ObjectiveStack(objs);
    if (stack) body.push(stack);
    return el("div", { style: { display: "flex", flexDirection: "column", gap: "20px" } }, body);
  }

  function CharterPhase(objs) {
    return el("div", { style: { display: "flex", flexDirection: "column", gap: "20px" } }, [
      PaperDoc(LAB_DATA.DOCS.charter),
      DeskSection("Reference sources", "Three maps for adversary coverage", [
        ReferenceCards(),
        el("p", { class: "ref-note", style: { marginTop: "8px" }, text: "Keep these beside the charter — assessment planning questions map to them, and to nothing else in this family. Hardening benchmarks (CIS) are configuration baselines, not adversary models." }),
      ]),
      ObjectiveStack(objs),
    ]);
  }

  function FieldworkPhase(objs, mode) {
    return el("div", { style: { display: "flex", flexDirection: "column", gap: "20px" } }, [
      DeskSection("03 · Fieldwork · evidence room", "The evidence room", [
        el("p", { style: { marginBottom: "12px", fontSize: "14px", lineHeight: "1.4" }, text: mode === "hard" ? "Everything the teams produced this season — including material that does not belong in this audit. Reading scope boundaries is fieldwork too." : "Interview transcripts and records from the control owners. Corroborate every claim with a record." }),
        el("div", { class: "docs-grid" }, LAB_DATA.FIELDWORK_DOCS[mode].map(function (id) {
          return PaperDoc(LAB_DATA.DOCS[id]);
        })),
      ]),
      ObjectiveStack(objs),
    ]);
  }

  function TestingPhase(objs) {
    return el("div", { style: { display: "flex", flexDirection: "column", gap: "20px" } }, [
      DeskSection("04 · Control tests · the rig", "Operate the controls yourself", [
        el("p", { style: { marginBottom: "12px", fontSize: "14px", lineHeight: "1.6" } }, [
          "Functional testing asks ",
          el("em", { text: "“does the control work as designed?”" }),
          " Behavioral testing asks ",
          el("em", { text: "“does it behave correctly under realistic stress?”" }),
          " Run both instruments, read the output, then record your verdicts on the worksheet.",
        ]),
        el("div", { class: "rig-grid" }, [RigConsole("mfa"), RigConsole("backup")]),
      ]),
      ObjectiveStack(objs),
    ]);
  }

  function CloseoutPhase(objs, mode) {
    return el("div", { style: { display: "flex", flexDirection: "column", gap: "20px" } }, [
      el("div", { class: "docs-grid" }, [
        PaperDoc(LAB_DATA.DOCS.attestation),
        el("div", { style: { display: "flex", flexDirection: "column", gap: "16px" } }, [
          PaperDoc(LAB_DATA.DOCS.independenceDecl),
          mode === "hard" ? PaperDoc(LAB_DATA.DOCS.exceptionMemo) : null,
        ]),
      ]),
      ObjectiveStack(objs),
    ]);
  }

  function DebriefPhase(mode) {
    return el("div", { style: { display: "flex", flexDirection: "column", gap: "20px" } }, [
      DeskSection("06 · Debrief · field notes", "What a defender carries out of this engagement", [
        el("div", { style: { display: "flex", flexDirection: "column", gap: "16px", fontSize: "14px", lineHeight: "1.6" } }, [
          el("div", { class: "kc-duo", style: { marginTop: "0" } }, [
            el("div", { style: { gridColumn: "1 / -1" } }, [
              el("h3", { class: "obj-title", style: { color: "var(--green)", marginBottom: "4px" }, text: "Detection opportunities — where the evidence lives" }),
              el("table", { class: "debrief-table" }, [
                el("thead", {}, [el("tr", {}, [el("th", { text: "Evidence source" }), el("th", { text: "What it signals" })])]),
                el("tbody", { style: { verticalAlign: "top" } }, [
                  [ "config vs approved ticket", "Change-control drift — the classic rule-based finding" ],
                  [ "MFA enrollment report", "Coverage % vs threshold, plus residual human gaps (results-based)" ],
                  [ "access review log + signatures", "Whether a governance control actually operated each period" ],
                  [ "interviews", "Leads and contradictions — always corroborate with records" ],
                  [ "rig runs (test outputs)", "Functional/behavioral verdicts with observations worth recording" ],
                ].map(function (r) {
                  return el("tr", {}, [el("td", { class: "src", text: r[0] }), el("td", { text: r[1] })]);
                })),
              ]),
            ]),
          ]),
          el("div", { class: "takeaway-grid" }, [
            el("div", { class: "takeaway-blue" }, [
              el("h3", { text: "Blue-team takeaways" }),
              el("ul", {}, [
                "Keep evidence signed, timestamped and immutable — an unsigned “updated copy” proves nothing.",
                "Fix drift back to the approved state; never re-write the approval to match drift.",
                "Closing a finding requires a validation re-test with recorded output.",
                "Report threshold passes AND residual gaps — 97.5% can still hide six unenrolled staff.",
              ].map(function (t) { return el("li", { text: t }); })),
            ]),
            el("div", { class: "takeaway-amber" }, [
              el("h3", { text: "Auditor-mindset takeaways" }),
              el("ul", {}, [
                "Fix sampling and scope in the charter — before fieldwork — and resist mid-course “amendments”.",
                "Know your boundary: pen-test report review → objective 4.3; vendor contracts → 5.3; exercises → adjacent.",
                "An attestation is a scoped opinion — read its limitations out loud to stakeholders.",
                "Escalate what smells like an incident; accept with documented exceptions what is truly constrained.",
              ].map(function (t) { return el("li", { text: t }); })),
            ]),
          ]),
          el("div", { class: "official-box" }, [
            el("h3", { text: "Official references" }),
            el("p", {}, [
              "CompTIA Security+ V8 (SY0-801) exam objectives — ",
              el("a", { class: "link", href: LAB_DATA.OFFICIAL_LINK, target: "_blank", rel: "noopener noreferrer", text: "comptia.org/en-us/certifications/security/v8" }),
              " (opens in a new tab). Draft-objective details in this lab (sampling, interviews, audit charters, functional/behavioral testing, reference sources) are labeled where they come from the v1.4 draft.",
            ]),
          ]),
          el("p", { class: "next-stops", text: "Next stops on the SY0-801 map: 5.4 compliance mechanics, 5.6 security awareness, and objective 4.3 for vulnerability management (where pen-test report review now lives)." }),
        ]),
      ]),
    ]);
  }

  function PhaseContent(phaseId, mode) {
    var objs = LAB_DATA.OBJECTIVES.filter(function (o) {
      return o.mode === mode && o.phase === phaseId;
    });
    switch (phaseId) {
      case "briefing": return BriefingPhase(objs, mode);
      case "charter": return CharterPhase(objs);
      case "fieldwork": return FieldworkPhase(objs, mode);
      case "testing": return TestingPhase(objs);
      case "closeout": return CloseoutPhase(objs, mode);
      case "debrief": return DebriefPhase(mode);
      default: return el("div", {});
    }
  }

  // ============================================================
  // CHROME: mode gate / masthead / tabs / ledger / rubric
  // ============================================================

  function ModeGate() {
    return el("main", { class: "lab-paper gate" }, [
      el("div", { class: "gate-inner" }, [
        el("header", { class: "gate-head" }, [
          el("p", { class: "kicker", style: { letterSpacing: "0.3em" }, text: "The Assurance Bureau · interactive practice lab" }),
          el("h1", { class: "gate-title", text: "Compare and Contrast Audits & Assessments" }),
          el("p", { class: "gate-sub" }, [
            "CompTIA Security+ SY0-801 · Lesson 5.5 · “Participate in audits, reviews, testing, and assessments”",
            el("br"),
            "A simulated engagement at " + LAB_DATA.CASE.org + " — every document is labeled training data.",
          ]),
        ]),
        el("div", { class: "gate-grid", role: "group", "aria-label": "Choose your difficulty mode" }, LAB_DATA.LETTERS.map(function (l) {
          return el("article", { class: "lab-card-paper gate-card", style: { "border-color": l.accent } }, [
            DocWatermark(),
            el("div", { class: "gate-stamp", style: { "border-color": l.accent, color: l.accent }, text: l.stamp }),
            el("h2", { text: l.title }),
            el("div", { class: "gate-body" }, [el("p", { text: l.body1 }), el("p", { style: { marginTop: "6px" }, text: l.body2 })]),
            el("p", { class: "gate-meta", text: l.meta }),
            el("button", { type: "button", class: "btn", style: { "background-color": l.accent, color: "#F5F0E6" }, "data-action": "accept-mode", "data-mode": l.mode, text: "Accept this engagement" }),
          ]);
        })),
        el("p", { class: "gate-foot", text: "Progress auto-saves in this browser (localStorage) · a RESET stamp is always on the masthead · no data leaves your device." }),
      ]),
    ]);
  }

  function phaseDone(phaseId, mode, checks, quizFinished) {
    if (phaseId === "debrief") return true;
    if (phaseId === "quiz") return quizFinished;
    var objs = LAB_DATA.OBJECTIVES.filter(function (o) {
      return o.mode === mode && o.phase === phaseId;
    });
    return objs.length > 0 && objs.every(function (o) {
      return checks[o.id] && checks[o.id].done;
    });
  }

  function Masthead() {
    var state = STORE.getState();
    var mode = state.mode;
    var objs = LAB_DATA.OBJECTIVES.filter(function (o) { return o.mode === mode; });
    var doneObjs = objs.filter(function (o) { return state.checks[o.id] && state.checks[o.id].done; }).length;
    var defs = mode === "hard" ? LAB_DATA.QUIZ_HARD : LAB_DATA.QUIZ_MEDIUM;
    var quizCorrect = defs.reduce(function (acc, d, i) {
      return acc + (state.quiz.picked[i] === d.answer ? 1 : 0);
    }, 0);
    return el("header", { class: "masthead" }, [
      el("div", { class: "masthead-inner" }, [
        el("div", { class: "masthead-brand" }, [
          el("p", { class: "kicker", text: "The Assurance Bureau" }),
          el("p", { class: "brand-title" }, [
            "Halcyon CU · ITGC Audit ",
            el("span", { class: "brand-case", text: "· AUD-2026-114" }),
          ]),
        ]),
        el("div", { class: "masthead-stats" }, [
          el("span", { class: "mode-badge " + (mode === "hard" ? "solo" : "guided"), text: mode === "hard" ? "Solo" : "Guided" }),
          el("span", {}, [ "worksheets ", el("strong", { text: doneObjs + "/" + objs.length }) ]),
          el("span", { class: "quiz-stat" }, ["quiz ", el("strong", { text: quizCorrect + "/" + defs.length })]),
          el("div", { class: "progress-track", "aria-hidden": "true" }, [
            el("div", { class: "progress-fill", style: { width: (doneObjs / objs.length) * 100 + "%" } }),
          ]),
          el("span", { class: "sr-only", "aria-live": "polite", text: doneObjs + " of " + objs.length + " worksheets verified" }),
        ]),
        el("button", { type: "button", class: "btn btn-outline-red", "data-action": "reset-open", text: "Reset" }),
      ]),
    ]);
  }

  function Tablist() {
    var state = STORE.getState();
    var mode = state.mode;
    return el("nav", { class: "tablist", role: "tablist", "aria-label": "Engagement binder" }, LAB_DATA.PHASES.map(function (ph) {
      var done = phaseDone(ph.id, mode, state.checks, state.quiz.finished);
      var active = state.phase === ph.id;
      return el("button", {
        type: "button",
        role: "tab",
        id: "tab-" + ph.id,
        "aria-selected": active ? "true" : "false",
        "aria-controls": "panel-" + ph.id,
        tabindex: active ? "0" : "-1",
        "data-action": "tab",
        "data-phase": ph.id,
        class: "tab" + (active ? " active" : "") + (done ? " done" : ""),
      }, [
        el("span", { class: "tab-num", "aria-hidden": "true", text: done ? "✓" : ph.num }),
        el("span", {}, [
          el("span", { class: "tab-title", text: ph.title }),
          el("span", { class: "tab-sub", text: ph.subtitle }),
        ]),
      ]);
    }));
  }

  // ---------- findings ledger (derived live state) ----------
  function statusFor(findingId, mode, checks, signoff) {
    if (findingId === "NOISE-1" || findingId === "NOISE-2") {
      return checks["H8"] && checks["H8"].done
        ? { label: "correctly excluded", cls: "status-closed" }
        : { label: "out-of-scope candidate", cls: "status-noise" };
    }
    var owner = mode === "hard" ? "H6" : "M10";
    var closer = mode === "hard" ? "H7" : "M12";
    if ((checks[closer] && checks[closer].done) || (mode === "medium" && signoff)) {
      return { label: "closed · validated", cls: "status-closed" };
    }
    if (checks[owner] && checks[owner].done) {
      return { label: mode === "hard" ? "adjudicated" : "remediated", cls: "status-remediated" };
    }
    return { label: "open", cls: "status-open" };
  }

  function Ledger() {
    var state = STORE.getState();
    var mode = state.mode || "medium";
    var rows = LAB_DATA.FINDINGS.filter(function (f) {
      return f.mode.indexOf(mode) !== -1;
    });
    var cleared = rows
      .filter(function (r) { return r.id.indexOf("F-") === 0; })
      .every(function (r) {
        return statusFor(r.id, mode, state.checks, state.signoff).label !== "open";
      });
    return el("aside", { class: "lab-card-paper ledger", "aria-label": "Findings ledger" }, [
      el("header", { class: "ledger-head" }, [
        el("h2", { text: "Findings Ledger" }),
        el("span", { text: "AUD-2026-114" }),
      ]),
      el("div", { "aria-live": "polite", "aria-label": "Ledger status updates" }, [
        el("table", {}, [
          el("caption", { class: "sr-only", text: "Findings and their current status" }),
          el("thead", {}, [
            el("tr", {}, [
              el("th", { scope: "col", class: "w-ref", text: "Ref" }),
              el("th", { scope: "col", text: "Item" }),
              el("th", { scope: "col", class: "w-status", text: "Status" }),
            ]),
          ]),
          el("tbody", {}, rows.map(function (f) {
            var s = statusFor(f.id, mode, state.checks, state.signoff);
            return el("tr", {}, [
              el("td", { class: "ref", text: f.id }),
              el("td", { class: "item" }, [f.title, el("span", { class: "rule", text: f.rule })]),
              el("td", { class: "status " + s.cls, text: s.label }),
            ]);
          })),
        ]),
      ]),
      el("footer", { class: "ledger-foot" }, [
        el("p", {
          text: cleared
            ? state.signoff
              ? "Ledger clear · signed off ✓"
              : "Ledger clear — the engagement may be signed off in Close-out."
            : "A finding is closed only after remediation and validation re-test.",
        }),
      ]),
    ]);
  }

  // ---------- mastery rubric + finish panel ----------
  function RubricCard() {
    var state = STORE.getState();
    var mode = state.mode;
    var objs = LAB_DATA.OBJECTIVES.filter(function (o) { return o.mode === mode; });
    var rubric = el("div", { class: "lab-card-paper rubric" }, [
      el("h2", { text: "Mastery rubric" }),
      el("ul", {}, ["P1", "P2", "P3", "P4"].map(function (p) {
        var items = objs.filter(function (o) { return o.pillar === p; });
        var d = items.filter(function (o) { return state.checks[o.id] && state.checks[o.id].done; }).length;
        return el("li", {}, [
          el("span", { class: "p-id", text: p }),
          el("span", { class: "p-name", text: LAB_DATA.PILLAR_LABEL[p] }),
          el("span", { class: "p-count", text: d + "/" + items.length }),
        ]);
      })),
      el("p", { class: "rubric-note", text: "P2 = Recognize & analyze evidence · P3 = sampling, interviews, testing · P4 = remediate, validate, close" }),
      el("div", { class: "rubric-finish" }, [QUIZ_UI.FinishPanel()]),
    ]);
    return rubric;
  }

  // ---------- reset confirmation dialog ----------
  function ResetDialog() {
    return el("div", { class: "dialog-overlay", "data-action": "reset-overlay" }, [
      el("div", { class: "dialog-box", role: "alertdialog", "aria-modal": "true", "aria-labelledby": "reset-title", "aria-describedby": "reset-desc", tabindex: "-1" }, [
        el("button", { type: "button", class: "dialog-close", "data-action": "reset-close", "aria-label": "Close", html: ICON_X }),
        el("p", { class: "alert-title", id: "reset-title", text: "Shred the file and start over?" }),
        el("p", { class: "dialog-desc", id: "reset-desc", text: "This clears all worksheet answers, the knowledge check, the ledger and the field report from this browser. The pristine lab will reload at the mode-selection screen." }),
        el("div", { class: "alert-actions" }, [
          el("button", { type: "button", class: "btn btn-cancel", "data-action": "reset-close", text: "Keep working" }),
          el("button", { type: "button", class: "btn btn-red", "data-action": "reset-confirm", text: "Shred & reset" }),
        ]),
      ]),
    ]);
  }

  return {
    el: el,
    ICON_X: ICON_X,
    Term: Term,
    Stamp: Stamp,
    PaperDoc: PaperDoc,
    DeskSection: DeskSection,
    ReferenceCards: ReferenceCards,
    ModeGate: ModeGate,
    Masthead: Masthead,
    Tablist: Tablist,
    Ledger: Ledger,
    RubricCard: RubricCard,
    PhaseContent: PhaseContent,
    ObjectiveCard: objectiveCard,
    ResetDialog: ResetDialog,
    refreshWidget: refreshWidget,
    clearTransientState: clearTransientState,
    tooltip: tooltip,
    showHints: showHints,
    cssEscape: cssEscape,
    phaseDone: phaseDone,
  };
})();
