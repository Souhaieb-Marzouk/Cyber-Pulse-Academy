// ============================================================================
// The Grand Exchange — js/ui.js
// DOM helpers, inline icon set (exact lucide paths), modal/drawer layer
// manager (radix-dialog / vaul-drawer behavior), payload viewer and the eight
// exercise widgets. Ported 1:1 from src/components/lab/{widgets,board}.tsx +
// the shadcn dialog/drawer primitives, including the R3 color contract.
// ============================================================================
"use strict";

// ---------- tiny DOM builder ----------
// h("div", { class: "x", onclick: fn, attrs: { "aria-label": "y" } }, ...children)
function h(tag, props, ...children) {
  const el = document.createElement(tag);
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v === undefined || v === null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "dataset") Object.assign(el.dataset, v);
      else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === "value") el.value = v;
      else if (k === "checked") el.checked = !!v;
      else if (k === "disabled") el.disabled = !!v;
      else el.setAttribute(k, v === true ? "" : String(v));
    }
  }
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue;
    el.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
  return el;
}

// ---------- inline lucide icons (exact path data from lucide-react) ----------
const ICON_PATHS = {
  "arrow-right": '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  "book-open": '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  "circle-check-big": '<path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/>',
  "clipboard-list": '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  play: '<polygon points="6 3 20 12 6 21 6 3"/>',
  "rotate-ccw": '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  "shield-check": '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  "circle-x": '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
};

/** Inline SVG icon — mirrors lucide-react rendering (stroke-based, 24px grid). */
function icon(name, sizeClass) {
  const span = h("span", {
    class: "icon " + (sizeClass || "i16"),
    "aria-hidden": "true",
    style: "display:inline-flex",
  });
  span.innerHTML =
    `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" ` +
    `fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">` +
    (ICON_PATHS[name] || "") +
    `</svg>`;
  return span;
}

// ---------- layer manager (dialogs + bottom-sheet drawers) ----------
// Reproduces radix Dialog + vaul Drawer behavior: overlay click and ESC close,
// focus is moved into the layer and restored on close, Tab is trapped inside,
// background scroll locks while open.
const LayerManager = {
  stack: [],
  open(build, opts) {
    const opener = document.activeElement;
    const overlay = h("div", { class: "overlay" });
    const panel = h("div", {
      class: opts.panelClass,
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": opts.labelId || undefined,
      "aria-describedby": opts.descId || undefined,
      tabindex: "-1",
    });
    const entry = { overlay, panel, opener };
    const close = () => {
      const i = this.stack.indexOf(entry);
      if (i === -1) return;
      this.stack.splice(i, 1);
      overlay.remove();
      panel.remove();
      if (this.stack.length === 0) document.body.style.overflow = "";
      if (opener && opener.isConnected && opener.focus) opener.focus();
      if (opts.onClose) opts.onClose();
    };
    entry.close = close;
    overlay.addEventListener("mousedown", (e) => { if (e.target === overlay) close(); });
    panel.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { e.stopPropagation(); close(); }
      if (e.key === "Tab") {
        const focusables = panel.querySelectorAll(
          'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    document.getElementById("layer").append(overlay, panel);
    this.stack.push(entry);
    document.body.style.overflow = "hidden";
    build(panel, close);
    panel.focus();
    return close;
  },
  closeAll() {
    while (this.stack.length) this.stack[this.stack.length - 1].close();
  },
};

/** Centered modal dialog (radix DialogContent + built-in 44px close button). */
function openDialog({ wide, md, title, titleClass, desc, descClass, render, onClose }) {
  const labelId = "dlg-l-" + Math.random().toString(36).slice(2, 8);
  const descId = "dlg-d-" + Math.random().toString(36).slice(2, 8);
  return LayerManager.open(
    (panel, close) => {
      panel.append(
        h("button", { class: "dialog-close", "aria-label": "Close", onclick: close }, icon("x", "i16"), h("span", { class: "sr-only" }, "Close")),
        h("div", { id: labelId, class: "dialog-title " + (titleClass || "") }, title),
        desc !== undefined && h("div", { id: descId, class: "dialog-desc " + (descClass || "") }, desc),
      );
      render(panel, close);
    },
    {
      panelClass: "dialog" + (wide ? " dialog--lg" : "") + (md ? " dialog--md" : ""),
      labelId, descId, onClose,
    }
  );
}

/** Bottom-sheet drawer (vaul DrawerContent: handle + centered header). */
function openDrawer({ title, desc, renderBody }) {
  const labelId = "drw-l-" + Math.random().toString(36).slice(2, 8);
  const descId = "drw-d-" + Math.random().toString(36).slice(2, 8);
  return LayerManager.open(
    (panel, close) => {
      panel.append(
        h("div", { class: "sheet-handle", "aria-hidden": "true" }),
        h("div", { class: "sheet-header" },
          h("div", { id: labelId, class: "sheet-title" }, title),
          h("div", { id: descId, class: "sheet-desc" }, desc),
        ),
      );
      renderBody(panel, close);
    },
    { panelClass: "sheet", labelId, descId }
  );
}

// ---------- shared components ----------
const VERDICT_OK = "verdict--ok";
const VERDICT_BAD = "verdict--bad";

/** R3 verdict resolution — from the frozen check-time snapshot only. */
function vOf(c, right) {
  if (!c) return null;
  if (c.ok) return right ? "ok" : null; // success: selections green
  return right ? null : "bad";         // failure: wrong selections red, others neutral
}
function snap(c) {
  return c && typeof c === "object" ? c : undefined;
}
function snapAnswer(c) {
  const s = snap(c);
  return s && s.answer && typeof s.answer === "object" ? s.answer : undefined;
}

function VerdictIcon(v) {
  if (!v) return null;
  return icon(v === "ok" ? "check" : "x", "i14");
}

/** PayloadViewer — the dark "line tap" terminal block. */
function PayloadViewer({ title, label, lines, note, compact }) {
  const fig = h("figure", { class: "gex-card payload" });
  if (title) fig.append(h("figcaption", { class: "payload-title" }, title));
  fig.append(
    h("div", { class: "payload-screen" },
      h("div", { class: "payload-label" }, label),
      h("pre", { class: "payload-pre" + (compact ? " payload-pre--compact" : ""), "aria-label": label },
        lines.join("\n")),
    ),
  );
  if (note) fig.append(h("div", { class: "payload-note" }, note));
  return fig;
}

/** SecureChip — CLEAR LINE / SEALED LINE / CONDITIONAL. */
function SecureChip(secure) {
  const map = {
    insecure: ["CLEAR LINE", "secure-chip--insecure"],
    secure: ["SEALED LINE", "secure-chip--secure"],
    conditional: ["CONDITIONAL", "secure-chip--conditional"],
  };
  const [label, cls] = map[secure];
  return h("span", { class: "secure-chip " + cls }, label);
}

/** Single-choice list with in-place updates (focus-preserving, like React). */
function ChoiceList({ name, choices, value, onChange, cols, verdict }) {
  const wrap = h("div", { role: "radiogroup", "aria-label": name, class: "choices" + (cols ? " choices--cols" : "") });
  const buttons = choices.map((c, i) => {
    const b = h("button", {
      type: "button", role: "radio", "aria-checked": value === i, "data-fkey": `choice-${name}-${i}`,
      class: "choice-btn",
      onclick: () => { onChange(i); paint(i); },
    });
    b.append(h("span", { class: "radio-dot", "aria-hidden": "true" }));
    b.append(h("span", null, c));
    wrap.append(b);
    return b;
  });
  function paint(sel) {
    buttons.forEach((b, i) => {
      const isSel = i === sel;
      const v = isSel ? verdict ?? null : null;
      b.setAttribute("aria-checked", String(isSel));
      b.className =
        "choice-btn" +
        (v === "ok" ? " verdict--ok" : v === "bad" ? " verdict--bad" : isSel ? " choice-btn--selected" : "");
      // rebuild inner: dot (+ inner dot when selected & uncolored) + label
      b.replaceChildren();
      b.append(h("span", { class: "radio-dot", "aria-hidden": "true" }));
      if (v) b.append(VerdictIcon(v));
      b.append(h("span", null, choices[i]));
      const dot = b.querySelector(".radio-dot");
      if (isSel && !v) dot.append(h("span", { class: "radio-dot-inner" }));
    });
  }
  paint(value === undefined ? -1 : value);
  return wrap;
}

/** Multi-select list with per-index R3 verdicts (in-place updates). */
function MultiList({ name, choices, value, onChange, verdicts }) {
  const wrap = h("div", { role: "group", "aria-label": name, class: "multi-grid" });
  const buttons = choices.map((c, i) => {
    const b = h("button", {
      type: "button", "aria-pressed": value.includes(i), "data-fkey": `multi-${name}-${i}`,
      class: "choice-btn",
      onclick: () => {
        const next = value.includes(i) ? value.filter((x) => x !== i) : [...value, i];
        value.length = 0; value.push(...next);
        onChange(next);
        paint();
      },
    });
    b.append(h("span", { class: "checkbox-box", "aria-hidden": "true" }));
    b.append(h("span", null, c));
    wrap.append(b);
    return b;
  });
  function paint() {
    buttons.forEach((b, i) => {
      const on = value.includes(i);
      const v = verdicts ? verdicts[i] ?? null : null;
      b.setAttribute("aria-pressed", String(on));
      b.className =
        "choice-btn" +
        (v === "ok" ? " verdict--ok" : v === "bad" ? " verdict--bad" : on ? " multi-btn--on" : "");
      b.replaceChildren();
      const box = h("span", { class: "checkbox-box", "aria-hidden": "true" });
      if (on || v) box.append("✓");
      b.append(box);
      if (v) b.append(VerdictIcon(v));
      b.append(h("span", null, choices[i]));
    });
  }
  paint();
  return wrap;
}

// ============================================================================
// Widgets — each renderer mounts into a container and manages its own
// interactions. ctx = { obj, mode, checkedAnswer, onAnswer, onFw, onService,
// ws, live } where ws is per-objective widget state (survives re-renders
// within the same work order, like React useState) and live() returns the
// current store state — so every rebuild reads FRESH answers/fw/services,
// exactly like a React re-render receives fresh props.
// ============================================================================

// ---------- 1. Sort ----------
function renderSortWidget(box, ctx) {
  const cfg = ctx.obj.config.sort;
  const ws = ctx.ws;
  ws.sel = ws.sel ?? null;
  const csA = snapAnswer(ctx.checkedAnswer);

  function rebuild() {
    box.replaceChildren();
    const placedNow = ctx.live().answers[ctx.obj.id] ?? {};
    const tray = cfg.items.filter((i) => !placedNow[i.id]);

    const trayWrap = h("div", null,
      h("div", { class: "widget-label" }, cfg.trayLabel),
      h("div", { class: "sort-tray" },
        tray.length === 0 && h("span", { class: "sort-tray-empty" }, "Tray empty — every tag is on the board."),
        tray.map((i) =>
          h("button", {
            type: "button", "aria-pressed": ws.sel === i.id, "data-fkey": `tag-${i.id}`,
            class: "sort-tag" + (ws.sel === i.id ? " sort-tag--held" : ""),
            onclick: () => { ws.sel = ws.sel === i.id ? null : i.id; rebuild(); },
          },
            i.label,
            i.sub && h("span", { class: "sort-tag-sub" }, i.sub),
          ),
        ),
      ),
      ws.sel && h("p", { class: "sort-hint" }, `Tag ${cfg.items.find((i) => i.id === ws.sel)?.label} in hand — tap a bucket below to place it.`),
    );
    box.append(trayWrap);

    const buckets = h("div", { class: "sort-buckets" });
    for (const b of cfg.buckets) {
      const list = h("div", {
        role: "listbox", "aria-label": `Bucket ${b.label}`,
        class: "sort-bucket-list",
        onclick: () => { if (ws.sel) place(ws.sel, b.id); },
      });
      for (const i of cfg.items.filter((x) => placedNow[x.id] === b.id)) {
        const v = ctx.checkedAnswer && csA ? vOf(ctx.checkedAnswer, csA[i.id] === cfg.solution[i.id]) : null;
        list.append(h("div", { role: "option", "aria-selected": "true", class: "placed-item" + (v ? " " + (v === "ok" ? VERDICT_OK : VERDICT_BAD) : "") },
          h("span", { class: "placed-item-label" }, i.label, i.sub && h("span", { class: "placed-item-sub" }, i.sub)),
          h("span", { style: "display:flex;align-items:center;gap:4px" },
            v && VerdictIcon(v),
            h("button", {
              type: "button", "aria-label": `Return ${i.label} to tray`, "data-fkey": `lift-${i.id}`,
              class: "lift-btn",
              onclick: (e) => { e.stopPropagation(); lift(i.id); },
            }, "×"),
          ),
        ));
      }
      if (ws.sel) {
        list.append(h("button", {
          type: "button", class: "place-btn", "data-fkey": `place-${b.id}`,
          onclick: () => place(ws.sel, b.id),
        }, `Place ${cfg.items.find((x) => x.id === ws.sel)?.label} here`));
      }
      buckets.append(h("div", { class: "gex-card sort-bucket" },
        h("div", { class: "sort-bucket-head" },
          h("div", { class: "sort-bucket-name" }, b.label),
          h("div", { class: "sort-bucket-hint" }, b.hint),
        ),
        list,
      ));
    }
    box.append(buckets);
  }

  function place(item, bucket) {
    const cur = ctx.live().answers[ctx.obj.id] ?? {};
    ctx.onAnswer(Object.assign({}, cur, { [item]: bucket }));
    ws.sel = null;
    rebuild();
  }
  function lift(item) {
    const cur = ctx.live().answers[ctx.obj.id] ?? {};
    const n = Object.assign({}, cur);
    delete n[item];
    ctx.onAnswer(n);
    rebuild();
  }
  rebuild();
}

// ---------- 2. Match ----------
function renderMatchWidget(box, ctx) {
  const cfg = ctx.obj.config.match;
  const csA = snapAnswer(ctx.checkedAnswer);

  function rebuild(focusLeftId) {
    box.replaceChildren();
    const paired = ctx.live().answers[ctx.obj.id] ?? {};
    box.append(h("div", { class: "match-header" }, h("span", null, cfg.leftTitle), h("span"), h("span", null, cfg.rightTitle)));
    for (const l of cfg.left) {
      const rightId = paired[l.id] ?? "";
      // NO live correctness leak: the cord stays neutral until CHECK RESULTS.
      const v = ctx.checkedAnswer && csA ? vOf(ctx.checkedAnswer, csA[l.id] === cfg.solution[l.id]) : null;
      const sel = h("select", {
        class: "gex-select", "data-fkey": `match-${l.id}`,
        "aria-label": `Connect ${l.label} to a description`,
        onchange: (e) => {
          const cur = ctx.live().answers[ctx.obj.id] ?? {};
          ctx.onAnswer(Object.assign({}, cur, { [l.id]: e.target.value }));
          rebuild(l.id); // restore focus to the same row's select (React parity)
        },
      },
        h("option", { value: "" }, "— choose the line —"),
        cfg.right.map((r) => h("option", { value: r.id, selected: rightId === r.id }, r.label)),
      );
      box.append(h("div", { class: "match-row" },
        h("div", { class: "match-left" + (rightId ? " match-left--paired" : "") + (v ? " " + (v === "ok" ? VERDICT_OK : VERDICT_BAD) : "") },
          h("span", { class: "match-name" }, l.label),
          l.sub && h("span", { class: "match-sub" }, l.sub),
        ),
        h("span", { class: "match-cord", "aria-hidden": "true" },
          v && VerdictIcon(v),
          rightId ? "—●—" : "—○—",
        ),
        sel,
      ));
    }
    if (focusLeftId) {
      const sel = box.querySelector(`select[data-fkey="match-${focusLeftId}"]`);
      if (sel) sel.focus();
    }
  }
  rebuild();
}

// ---------- 3. Sequence ----------
function renderSequenceWidget(box, ctx) {
  const cfg = ctx.obj.config.sequence;

  function rebuild() {
    box.replaceChildren();
    const a = ctx.live().answers[ctx.obj.id] ?? {};
    const order = a.order ?? [];
    const fu = a.followUp ?? {};
    const rest = cfg.items.filter((i) => !order.includes(i.id));

    const left = h("div", null,
      h("div", { class: "widget-label" }, "Tap in order"),
      h("div", { class: "seq-rest" },
        rest.map((i) => h("button", {
          type: "button", class: "seq-btn", "data-fkey": `seq-${i.id}`,
          onclick: () => push(i.id),
        }, h("span", { class: "seq-btn-name" }, i.label), i.sub && h("span", { class: "seq-btn-sub" }, i.sub))),
        rest.length === 0 && h("span", { class: "seq-done-note" }, "All four messages are on the wire."),
      ),
    );
    const ordered = h("ol", { class: "seq-order", "aria-label": "Sequence so far" });
    order.forEach((id, idx) => {
      const item = cfg.items.find((i) => i.id === id);
      const v = ctx.checkedAnswer && snapAnswer(ctx.checkedAnswer)?.order
        ? vOf(ctx.checkedAnswer, snapAnswer(ctx.checkedAnswer).order[idx] === cfg.solution[idx]) : null;
      ordered.append(h("li", { class: "placed-item" + (v ? " " + (v === "ok" ? VERDICT_OK : VERDICT_BAD) : "") },
        h("span", null, h("span", { class: "seq-item-num" }, String(idx + 1)), h("span", { class: "seq-item-name" }, item.label)),
        h("span", { style: "display:flex;align-items:center;gap:4px" },
          v && VerdictIcon(v),
          h("button", {
            type: "button", "aria-label": `Remove ${item.label} from sequence`, "data-fkey": `seqpull-${id}`,
            class: "lift-btn", onclick: () => pull(id),
          }, "×"),
        ),
      ));
    });
    if (order.length === 0) ordered.append(h("li", { class: "seq-empty" }, "Nothing patched yet — the client speaks first."));

    const right = h("div", null,
      h("div", { class: "widget-label" }, "The exchange, in order"),
      ordered,
    );
    box.append(h("div", { class: "seq-cols" }, left, right));

    if (cfg.followUp) {
      const fuBox = h("div", { class: "seq-followups" });
      for (const f of cfg.followUp) {
        fuBox.append(h("label", { class: "seq-followup-label" },
          f.prompt,
          h("input", {
            class: "gex-input font-mono", value: fu[f.id] ?? "", inputmode: "numeric",
            placeholder: "port number", "data-fkey": `seqfu-${f.id}`,
            oninput: (e) => {
              const cur = ctx.live().answers[ctx.obj.id] ?? {};
              ctx.onAnswer(Object.assign({}, cur, { followUp: Object.assign({}, (cur.followUp ?? {}), { [f.id]: e.target.value }) }));
            },
          }),
        ));
      }
      box.append(fuBox);
    }
  }
  function push(id) {
    const a = ctx.live().answers[ctx.obj.id] ?? {};
    ctx.onAnswer(Object.assign({}, a, { order: [...(a.order ?? []), id] }));
    rebuild();
  }
  function pull(id) {
    const a = ctx.live().answers[ctx.obj.id] ?? {};
    ctx.onAnswer(Object.assign({}, a, { order: (a.order ?? []).filter((x) => x !== id) }));
    rebuild();
  }
  rebuild();
}

// ---------- 4. Recall ----------
function renderRecallWidget(box, ctx) {
  const cfg = ctx.obj.config.recall;
  const a = ctx.live().answers[ctx.obj.id] ?? {};
  const grid = h("div", { class: "recall-grid" });
  for (const f of cfg.fields) {
    grid.append(h("label", { class: "gex-card recall-field" },
      h("span", null, f.label),
      h("input", {
        class: "gex-input font-mono", value: a[f.id] ?? "", inputmode: "numeric",
        placeholder: "port", "aria-label": `Port for ${f.label}`, "data-fkey": `recall-${f.id}`,
        oninput: (e) => ctx.onAnswer(Object.assign({}, ctx.live().answers[ctx.obj.id] ?? {}, { [f.id]: e.target.value })),
      }),
    ));
  }
  box.replaceChildren(grid);
}

// ---------- 5. Triage ----------
function renderTriageWidget(box, ctx) {
  const cfg = ctx.obj.config.triage;

  function rebuild() {
    box.replaceChildren();
    const a = ctx.live().answers[ctx.obj.id] ?? {};
    const rows = a.rows ?? [];
    const csA = snapAnswer(ctx.checkedAnswer);
    box.append(h("p", { class: "triage-criterion" }, "⚑ " + cfg.criterion));

    const table = h("table", { class: "ltable" });
    table.append(h("thead", null, h("tr", null,
      h("th", { scope: "col" }, cfg.selectLabel),
      cfg.columns.map((c) => h("th", { scope: "col" }, c)),
    )));
    const tbody = h("tbody");
    cfg.rows.forEach((r, idx) => {
      const on = rows.includes(r.id);
      // verdict from the frozen snapshot, ONLY for rows the student flagged:
      // flagged & belongs → green on success; flagged & doesn't → red; else neutral.
      const wasFlagged = csA && csA.rows ? csA.rows.includes(r.id) : null;
      const v = wasFlagged === null || !ctx.checkedAnswer ? null : vOf(ctx.checkedAnswer, cfg.solution.includes(r.id));
      tbody.append(h("tr", null,
        h("td", null, h("button", {
          type: "button", "aria-pressed": on, "aria-label": `Flag row ${r.cells[0]}`,
          "data-fkey": `flag-${r.id}`,
          class: "flag-btn" + (v === "ok" ? " verdict--ok" : v === "bad" ? " verdict--bad" : on ? " flag-btn--on" : ""),
          onclick: () => toggle(r.id),
        }, on ? "⚑" : "·")),
        r.cells.map((c, i) => h("td", { class: i === 0 ? "rownum" : "" }, c)),
      ));
    });
    table.append(tbody);
    box.append(h("div", { class: "table-wrap" }, table));

    if (cfg.followUp) {
      box.append(h("label", { class: "triage-followup" },
        cfg.followUp.prompt,
        h("input", {
          class: "gex-input font-mono", value: (a.followUp ?? {})[cfg.followUp.id] ?? "",
          placeholder: "your answer", "data-fkey": `trifu-${cfg.followUp.id}`,
          oninput: (e) => {
            const cur = ctx.live().answers[ctx.obj.id] ?? {};
            ctx.onAnswer(Object.assign({}, cur, { followUp: Object.assign({}, (cur.followUp ?? {}), { [cfg.followUp.id]: e.target.value }) }));
          },
        }),
      ));
    }
  }
  function toggle(id) {
    const a = ctx.live().answers[ctx.obj.id] ?? {};
    const rows = a.rows ?? [];
    ctx.onAnswer(Object.assign({}, a, { rows: rows.includes(id) ? rows.filter((x) => x !== id) : [...rows, id] }));
    rebuild();
  }
  rebuild();
}

// ---------- 6. Inspect ----------
function renderInspectWidget(box, ctx) {
  const cfg = ctx.obj.config.inspect;
  const csA = snapAnswer(ctx.checkedAnswer);

  function set(id, v) {
    const cur = ctx.live().answers[ctx.obj.id] ?? {};
    ctx.onAnswer(Object.assign({}, cur, { [id]: v }));
  }

  box.replaceChildren();
  if (cfg.blocks.length > 0) {
    box.append(h("div", { class: "inspect-blocks" + (cfg.blocks.length > 1 ? " inspect-blocks--multi" : "") },
      cfg.blocks.map((b) => PayloadViewer({ title: b.title, label: b.payload.label, lines: b.payload.lines, note: b.payload.note })),
    ));
  }
  const parts = h("div", { class: "inspect-parts" });
  for (const part of cfg.parts) {
    const fs = h("fieldset", { class: "gex-card inspect-part" });
    fs.append(h("legend", null, part.prompt));
    // R3 verdicts per part, from the frozen check-time snapshot only
    let verdict;
    const checkedSel = csA ? csA[part.id] : undefined;
    if (checkedSel !== undefined && part.kind === "choice") verdict = Number(checkedSel) === part.solution ? "ok" : "bad";
    if (checkedSel !== undefined && part.kind === "multi") {
      const selArr = Array.isArray(checkedSel) ? checkedSel.map(Number) : [];
      verdict = selArr.length === part.solution.length && selArr.every((n) => part.solution.includes(n)) ? "ok" : "bad";
    }
    // per-index verdicts for multi-select (R3 strict): on success flagged items go
    // green; on failure only flagged-but-wrong items go red — the solution is never revealed.
    let multiVerdicts;
    if (checkedSel !== undefined && part.kind === "multi" && ctx.checkedAnswer) {
      const selArr = Array.isArray(checkedSel) ? checkedSel.map(Number) : [];
      multiVerdicts = part.choices.map((_, i) => (selArr.includes(i) ? vOf(ctx.checkedAnswer, part.solution.includes(i)) : null));
    }
    if (part.kind === "text") {
      fs.append(h("input", {
        class: "gex-input inspect-text font-mono" + (part.width === "wide" ? " inspect-text--wide" : ""),
        value: String((ctx.live().answers[ctx.obj.id] ?? {})[part.id] ?? ""),
        "aria-label": part.prompt, placeholder: "type your answer", "data-fkey": `insp-${part.id}`,
        oninput: (e) => set(part.id, e.target.value),
      }));
    } else if (part.kind === "choice") {
      fs.append(ChoiceList({
        name: part.prompt, choices: part.choices,
        value: (ctx.live().answers[ctx.obj.id] ?? {})[part.id],
        onChange: (n) => set(part.id, n),
        verdict: verdict ?? null,
      }));
    } else if (part.kind === "multi") {
      const raw = (ctx.live().answers[ctx.obj.id] ?? {})[part.id];
      const val = Array.isArray(raw) ? [...raw] : [];
      fs.append(MultiList({
        name: part.prompt, choices: part.choices, value: val,
        onChange: (n) => set(part.id, [...n]),
        verdicts: multiVerdicts,
      }));
    }
    parts.append(fs);
  }
  box.append(parts);
}

// ---------- 7. Firewall ----------
function renderFirewallWidget(box, ctx) {
  const cfg = ctx.obj.config.firewall;
  const c = snap(ctx.checkedAnswer);
  const cFw = c && c.fw;
  const csa = snapAnswer(ctx.checkedAnswer);
  const cExtras = csa ? (csa.extras ?? {}) : {};

  function rebuild() {
    box.replaceChildren();
    const liveFw = ctx.live().fw;
    const liveAnswer = ctx.live().answers[ctx.obj.id] ?? {};
    const extras = liveAnswer.extras ?? {};
    const card = h("div", { class: "gex-card", style: "overflow:hidden" },
      h("div", { class: "fw-head" },
        h("div", { class: "fw-title" }, cfg.title),
        h("div", { class: "fw-policy" }, cfg.policy),
      ),
    );
    const rowsWrap = h("div", { class: "fw-rows", role: "table" });
    for (const row of cfg.ports) {
      const cur = liveFw[row.port] ?? "allow";
      // verdict from the frozen snapshot for THIS port's ALLOW/DENY selection
      const v = ctx.checkedAnswer && cFw ? vOf(ctx.checkedAnswer, cFw[row.port] === cfg.solution[row.port]) : null;
      rowsWrap.append(h("div", { role: "row", class: "fw-row" },
        h("span", { class: "fw-port" + (v === "ok" ? " text--ok" : v === "bad" ? " text--bad" : "") },
          String(row.port), v && VerdictIcon(v)),
        h("span", { class: "fw-service" }, row.service),
        h("div", { role: "radiogroup", "aria-label": `Jack ${row.port} — ${row.service}`, class: "fw-toggle" },
          h("button", {
            type: "button", role: "radio", "aria-checked": cur === "allow", "data-fkey": `fw-${row.port}-allow`,
            class: cur === "allow" ? "fw-allow--on" : "",
            onclick: () => ctx.onFw(row.port, "allow"),
          }, "ALLOW"),
          h("button", {
            type: "button", role: "radio", "aria-checked": cur === "deny", "data-fkey": `fw-${row.port}-deny`,
            class: cur === "deny" ? "fw-deny--on" : "",
            onclick: () => ctx.onFw(row.port, "deny"),
          }, "DENY"),
        ),
      ));
    }
    card.append(rowsWrap);
    box.append(card);

    for (const e of cfg.extras ?? []) {
      const verdict = c ? (Number(cExtras[e.id]) === e.solution ? "ok" : "bad") : undefined;
      const fs = h("fieldset", { class: "gex-card inspect-part" });
      fs.append(h("legend", null, e.prompt));
      fs.append(ChoiceList({
        name: e.prompt, choices: e.choices, value: extras[e.id], cols: true,
        onChange: (n) => {
          // merge over LIVE state — fresh base on every click (React fresh-props parity)
          const cur = ctx.live().answers[ctx.obj.id] ?? {};
          ctx.onAnswer(Object.assign({}, cur, { extras: Object.assign({}, cur.extras ?? {}, { [e.id]: n }) }));
        },
        verdict: verdict ?? null,
      }));
      box.append(fs);
    }
  }
  rebuild();
}
// live fw toggle (called by app between CHECKS — mirrors React re-render)
function refreshFirewallRow(box, port, fwState) {
  const allow = box.querySelector(`[data-fkey="fw-${port}-allow"]`);
  const deny = box.querySelector(`[data-fkey="fw-${port}-deny"]`);
  if (!allow || !deny) return;
  allow.setAttribute("aria-checked", String(fwState === "allow"));
  allow.className = fwState === "allow" ? "fw-allow--on" : "";
  deny.setAttribute("aria-checked", String(fwState === "deny"));
  deny.className = fwState === "deny" ? "fw-deny--on" : "";
}

// ---------- 8. Hardening ----------
function renderHardeningWidget(box, ctx) {
  const cfg = ctx.obj.config.hardening;
  const c = snap(ctx.checkedAnswer);
  const cSvc = c && c.services;
  const csa = snapAnswer(ctx.checkedAnswer);
  const cReasons = csa ? (csa.reasons ?? {}) : {};

  function rebuild() {
    box.replaceChildren();
    const liveServices = ctx.live().services;
    const liveAnswer = ctx.live().answers[ctx.obj.id] ?? {};
    const reasons = liveAnswer.reasons ?? {};
    const card = h("div", { class: "gex-card", style: "overflow:hidden" },
      h("div", { class: "hard-title" }, "Re-patch board — clear lines to sealed lines"),
    );
    const rowsWrap = h("div", { class: "hard-rows" });
    for (const s of cfg.services) {
      const cur = liveServices[s.key];
      // verdict from the frozen snapshot: was this line re-patched at check time?
      const v = ctx.checkedAnswer && cSvc ? vOf(ctx.checkedAnswer, cSvc[s.key] === "secure") : null;
      rowsWrap.append(h("div", { class: "hard-row" },
        h("span", { class: "hard-legacy" + (cur === "legacy" ? " hard-legacy--clear" : "") }, s.legacy),
        h("button", {
          type: "button", "aria-label": `Re-patch ${s.legacy}`, "aria-pressed": cur === "secure",
          "data-fkey": `svc-${s.key}`, class: "hard-toggle",
          onclick: () => ctx.onService(s.key, cur === "legacy" ? "secure" : "legacy"),
        }, cur === "legacy" ? "→" : "↩"),
        h("span", { class: "hard-secure" + (cur === "secure" ? " hard-secure--patched" : "") },
          cur === "secure" ? s.secure : "— not patched —"),
        h("span", { class: "hard-note" + (v === "ok" ? " text--ok" : v === "bad" ? " text--bad" : "") },
          v && VerdictIcon(v), s.portNote),
      ));
    }
    card.append(rowsWrap);
    box.append(card);

    for (const r of cfg.reasons) {
      const verdict = c ? (Number(cReasons[r.key]) === r.solution ? "ok" : "bad") : undefined;
      const fs = h("fieldset", { class: "gex-card inspect-part" });
      fs.append(h("legend", null, r.prompt));
      fs.append(ChoiceList({
        name: r.prompt, choices: r.choices, value: reasons[r.key],
        onChange: (n) => {
          // merge over LIVE state — fresh base on every click (React fresh-props parity)
          const cur = ctx.live().answers[ctx.obj.id] ?? {};
          ctx.onAnswer(Object.assign({}, cur, { reasons: Object.assign({}, cur.reasons ?? {}, { [r.key]: n }) }));
        },
        verdict: verdict ?? null,
      }));
      box.append(fs);
    }
  }
  rebuild();
}
// live hardening row refresh (between CHECKS)
function refreshHardeningRow(box, key, state, cfg) {
  const row = box.querySelector(`[data-fkey="svc-${key}"]`);
  if (!row || !cfg) return;
  const s = cfg.services.find((x) => x.key === key);
  row.setAttribute("aria-pressed", String(state === "secure"));
  row.textContent = state === "legacy" ? "→" : "↩";
  const legacyChip = row.parentElement.querySelector(".hard-legacy");
  const secureChip = row.parentElement.querySelector(".hard-secure");
  legacyChip.className = "hard-legacy" + (state === "legacy" ? " hard-legacy--clear" : "");
  secureChip.className = "hard-secure" + (state === "secure" ? " hard-secure--patched" : "");
  secureChip.textContent = state === "secure" ? s.secure : "— not patched —";
}

/** Widget dispatcher — same table as the original Widget component. */
function renderWidget(box, ctx) {
  switch (ctx.obj.config.kind) {
    case "sort": return renderSortWidget(box, ctx);
    case "match": return renderMatchWidget(box, ctx);
    case "sequence": return renderSequenceWidget(box, ctx);
    case "recall": return renderRecallWidget(box, ctx);
    case "triage": return renderTriageWidget(box, ctx);
    case "inspect": return renderInspectWidget(box, ctx);
    case "firewall": return renderFirewallWidget(box, ctx);
    case "hardening": return renderHardeningWidget(box, ctx);
  }
}
