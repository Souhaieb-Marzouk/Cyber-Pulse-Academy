/* ======================================================================
   GATEHOUSE lab — shared UI widgets + interactive primitives
   Vanilla-DOM ports of the lab's React widgets (bits.tsx) plus accessible
   replacements for the Radix primitives used by the original:
   SelectCell (Select), dialog/sheet (Dialog/AlertDialog/Sheet), tabs (Tabs).
   Widgets are self-updating: they read the freshest store state through a
   getValue() callback at event time and re-render only themselves, so
   burst clicks can never duplicate/drop state and focus is never lost.
   ====================================================================== */

/* ---------- tiny DOM helper ---------- */
function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === undefined || v === false) continue;
      if (k === "class") el.className = v;
      else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
      else if (k === "text") el.textContent = v;
      else el.setAttribute(k, String(v));
    }
  }
  for (const c of children.flat(Infinity)) {
    if (c === null || c === undefined || c === false) continue;
    el.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return el;
}

/* ---------- Lucide icons (exact SVG node data from icons.js) ---------- */
const SVG_NS = "http://www.w3.org/2000/svg";
function icon(name, cls) {
  const node = (typeof ICONS !== "undefined" && ICONS[name]) || null;
  const svg = document.createElementNS(SVG_NS, "svg");
  if (!node) {
    svg.setAttribute("class", cls || "");
    return svg;
  }
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  if (cls) svg.setAttribute("class", cls);
  for (const [tag, attrs] of node) {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
    svg.appendChild(el);
  }
  return svg;
}

/* ---------- pillar badge ---------- */
const PILLAR_META = {
  understand: { label: "UNDERSTAND", cls: "badge pillar-sky", ic: "book-open" },
  recognize: { label: "RECOGNIZE", cls: "badge pillar-lav", ic: "scan-search" },
  detect: { label: "DETECT", cls: "badge pillar-amber", ic: "radar" },
  mitigate: { label: "MITIGATE", cls: "badge pillar-mint", ic: "shield-check" },
};
function PillarBadge(pillar) {
  const m = PILLAR_META[pillar];
  return h("span", { class: m.cls }, icon(m.ic, "ic-xs"), m.label);
}

/* ---------- section heading inside stations ---------- */
function WidgetTitle(children, note, iconName, accentCls) {
  const head = iconName
    ? h("h3", { class: "widget-title" },
        h("span", { class: `inline-flex items-center gap-1-5 align-middle ${accentCls || "text-mint"}` },
          icon(iconName, "ic"), " ", children))
    : h("h3", { class: "widget-title" }, children);
  const wrap = h("div", { class: "mb-3" }, head);
  if (note) wrap.append(h("p", { class: "mt-1 text-xs leading-relaxed text-dim" }, note));
  return wrap;
}

/* ---------- multi-select chips (toggle-intent semantics) ---------- */
const ACCENT_ON = {
  "gh-mint": "chip-on-mint",
  "gh-lav": "chip-on-lav",
  "gh-amber": "chip-on-amber",
  "gh-sky": "chip-on-sky",
  "gh-coral": "chip-on-coral",
};
function ChipToggle({ items, getValue, onChange, accent = "gh-mint", label }) {
  const root = h("div", { role: "group", "aria-label": label, class: "flex flex-wrap gap-2" });
  function render() {
    root.textContent = "";
    const value = getValue();
    for (const it of items) {
      const on = value.includes(it.id);
      const btn = h("button", {
        type: "button",
        "aria-pressed": String(on),
        class: `chip ${on ? (ACCENT_ON[accent] || ACCENT_ON["gh-mint"]) : "chip-off"}`,
        onclick: () => { onChange(it.id); render(); },
      });
      btn.append(h("span", { class: "block leading-tight", text: it.label }));
      if (it.sub) btn.append(h("span", { class: "mt-0-5 block text-10 uppercase tracking-wider text-dim", text: it.sub }));
      root.append(btn);
    }
  }
  render();
  return root;
}

/* ---------- ordered sequence builder ---------- */
function OrderList({ steps, getValue, onOp, accent = "gh-mint", label }) {
  /* anti-leak: the pool must NOT display steps in their correct order —
     shuffle the full list deterministically once, then filter placed steps. */
  const displayOrder = shuffled(steps, "ol-" + steps.map((s) => s.id).join(""));
  const root = h("div", { "aria-label": label });
  function render() {
    root.textContent = "";
    const value = getValue();
    if (value.length > 0) {
      const ol = h("ol", { class: "mb-3 space-y-1-5" });
      value.forEach((id, i) => {
        const st = steps.find((s) => s.id === id);
        ol.append(h("li", {
          class: `flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${accent === "gh-amber" ? "seq-amber" : "seq-mint"}`,
        },
          h("span", { class: `grid h-6 w-6 shrink-0 place-items-center rounded-full font-display text-xs font-bold ${accent === "gh-amber" ? "seqnum-amber" : "seqnum-mint"}`, text: String(i + 1) }),
          h("span", { class: "flex-1", text: st ? st.label : id }),
          h("button", {
            type: "button",
            "aria-label": `Remove step ${i + 1}`,
            onclick: () => { onOp({ t: "remove", id }); render(); },
            class: "grid h-8 w-8 place-items-center rounded-md text-dim hover-row",
          }, icon("x", "ic"))
        ));
      });
      root.append(ol);
    }
    const value2 = getValue();
    const pool = displayOrder.filter((s) => !value2.includes(s.id));
    if (pool.length > 0) {
      const box = h("div", { class: "flex flex-col gap-2" });
      for (const s of pool) {
        box.append(h("button", {
          type: "button",
          onclick: () => { onOp({ t: "add", id: s.id }); render(); },
          class: "chip-dashed",
        }, "+ " + s.label));
      }
      root.append(box);
    }
    if (value2.length > 0) {
      root.append(h("button", {
        type: "button",
        onclick: () => { onOp({ t: "clear" }); render(); },
        class: "btn-ghost mt-2 min-h-44",
      }, icon("rotate-ccw", "ic-sm"), " Clear sequence"));
    }
  }
  render();
  return root;
}

/* ---------- select cell (accessible dropdown, Radix Select equivalent) ---------- */
let openListbox = null; /* only one open at a time */
function closeOpenListbox() {
  if (openListbox) { openListbox.close(false); openListbox = null; }
}
document.addEventListener("pointerdown", (e) => {
  if (openListbox && !openListbox.root.contains(e.target)) closeOpenListbox();
});

function SelectCell({ options, getValue, onChange, placeholder = "choose…", ariaLabel }) {
  const root = h("div", { class: "select-root" });
  const trigger = h("button", {
    type: "button",
    class: "select-trigger",
    "aria-haspopup": "listbox",
    "aria-expanded": "false",
    "aria-label": ariaLabel || null,
  });
  const labelSpan = h("span", { class: "select-value" });
  const chev = icon("chevron-down", "ic-sm select-chev");
  trigger.append(labelSpan, chev);
  root.append(trigger);

  function labelFor(value) {
    if (!value) return placeholder;
    const o = options.find((x) => x.id === value);
    return o ? o.label : placeholder;
  }
  function sync() {
    const v = getValue();
    labelSpan.textContent = labelFor(v);
    labelSpan.classList.toggle("placeholder", !v);
  }
  sync();

  let listEl = null;
  let activeIdx = -1;
  let restoreFocusTo = null;

  function buildList() {
    const v = getValue();
    listEl = h("ul", { role: "listbox", class: "select-list gh-scroll", "aria-label": ariaLabel || null });
    options.forEach((o, idx) => {
      const li = h("li", {
        role: "option",
        "aria-selected": String(o.id === v),
        class: `select-option ${o.id === v ? "selected" : ""}`,
        dataset: { idx: String(idx) },
      },
        h("span", { class: "select-option-label", text: o.label }),
        o.id === v ? icon("check", "ic-sm select-check") : null
      );
      li.addEventListener("pointermove", () => setActive(idx));
      li.addEventListener("click", () => commit(o.id));
      listEl.append(li);
    });
    return listEl;
  }
  function setActive(idx) {
    activeIdx = idx;
    [...listEl.children].forEach((li, i) => li.classList.toggle("active", i === idx));
    const el = listEl.children[idx];
    if (el) el.scrollIntoView({ block: "nearest" });
  }
  function commit(id) {
    close();
    onChange(id);
    sync();
  }
  function close(refocus = true) {
    if (listEl) { listEl.remove(); listEl = null; }
    trigger.setAttribute("aria-expanded", "false");
    if (openListbox === api) openListbox = null;
    if (refocus && restoreFocusTo) restoreFocusTo.focus();
  }
  function open() {
    if (listEl) return;
    closeOpenListbox();
    restoreFocusTo = document.activeElement;
    listEl = buildList();
    root.append(listEl);
    trigger.setAttribute("aria-expanded", "true");
    /* flip above when cramped below */
    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    if (spaceBelow < Math.min(288, listEl.scrollHeight + 16)) root.classList.add("flip");
    else root.classList.remove("flip");
    const v = getValue();
    const cur = options.findIndex((o) => o.id === v);
    setActive(cur >= 0 ? cur : 0);
    openListbox = api;
  }
  function toggle() { listEl ? close() : open(); }

  trigger.addEventListener("click", toggle);
  trigger.addEventListener("keydown", (e) => {
    if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(e.key)) {
      e.preventDefault();
      open();
      return;
    }
    /* type-ahead on the closed trigger */
    if (e.key.length === 1 && /[a-z0-9]/i.test(e.key)) {
      const lower = e.key.toLowerCase();
      const found = options.findIndex((o) => o.label.toLowerCase().startsWith(lower));
      if (found >= 0) commit(options[found].id);
    }
  });
  function listKeydown(e) {
    if (!listEl) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(Math.min(activeIdx + 1, options.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(Math.max(activeIdx - 1, 0)); }
    else if (e.key === "Home") { e.preventDefault(); setActive(0); }
    else if (e.key === "End") { e.preventDefault(); setActive(options.length - 1); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (activeIdx >= 0) commit(options[activeIdx].id); }
    else if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "Tab") { close(false); }
    else if (e.key.length === 1 && /[a-z0-9]/i.test(e.key)) {
      const lower = e.key.toLowerCase();
      const start = activeIdx + 1;
      const order = options.map((_, i) => (start + i) % options.length);
      const found = order.findIndex((i) => options[i].label.toLowerCase().startsWith(lower));
      if (found >= 0) setActive(order[found]);
    }
  }
  root.addEventListener("keydown", (e) => { if (listEl) listKeydown(e); });

  const api = { root, close };
  return root;
}

/* ---------- boolean matrix (RBAC / geofence) ---------- */
function MatrixToggle({ rows, cols, getValue, onToggle, accent = "grant" }) {
  const wrap = h("div", { class: "gh-scroll overflow-x-auto" });
  const table = h("table", { class: "matrix-table" });
  const thead = h("thead");
  const hrow = h("tr");
  hrow.append(h("th", { class: "matrix-rowhead", text: "Role" }));
  for (const c of cols) hrow.append(h("th", { class: "matrix-colhead", text: c.label }));
  thead.append(hrow);
  table.append(thead);
  const tbody = h("tbody");
  const cellBtns = {};
  for (const r of rows) {
    const tr = h("tr");
    tr.append(h("td", { class: "matrix-rowlabel", text: r.label }));
    for (const c of cols) {
      const key = `${r.id}:${c.id}`;
      const btn = h("button", {
        type: "button",
        role: "checkbox",
        "aria-label": `${r.label} — ${c.label}: denied`,
        onclick: () => { onToggle(key); syncCell(key); },
      });
      cellBtns[key] = btn;
      tr.append(h("td", { class: "matrix-cell" }, btn));
    }
    tbody.append(tr);
  }
  table.append(tbody);
  wrap.append(table);

  function syncCell(key) {
    const btn = cellBtns[key];
    if (!btn) return;
    const on = !!getValue()[key];
    btn.setAttribute("aria-checked", String(on));
    btn.classList.toggle("cell-on", on);
    btn.classList.toggle(accent === "grant" ? "cell-grant" : "cell-allow", on);
    btn.textContent = on ? (accent === "grant" ? "GRANTED" : "ALLOW") : "deny";
  }
  function syncAll() {
    for (const r of rows) for (const c of cols) {
      const key = `${r.id}:${c.id}`;
      const on = !!getValue()[key];
      const btn = cellBtns[key];
      btn.setAttribute("aria-checked", String(on));
      btn.setAttribute("aria-label", `${r.label} — ${c.label}: ${on ? (accent === "grant" ? "granted" : "allowed") : "denied"}`);
      syncCell(key);
    }
  }
  syncAll();
  return wrap;
}

/* ---------- evidence box ---------- */
function EvidenceBox(name, className) {
  return h("figure", { class: `evidence-box ${className || ""}` },
    h("figcaption", { class: "evidence-cap" },
      icon("file-text", "ic-sm text-mint"),
      h("span", { class: "gh-term", text: name }),
      h("span", { class: "badge badge-training", text: "TRAINING DATA — synthetic" })
    ),
    h("pre", { class: "gh-scroll gh-term evidence-pre", text: EVIDENCE[name] })
  );
}

/* ---------- choice row (radio-like) ---------- */
function ChoiceRow({ question, options, getValue, onChange }) {
  const fs = h("fieldset", { class: "choice-row" });
  fs.append(h("legend", { class: "choice-legend", text: question }));
  const box = h("div", { class: "mt-2 grid gap-2" });
  fs.append(box);
  function render() {
    box.textContent = "";
    const value = getValue();
    for (const o of options) {
      const on = value === o.id;
      box.append(h("button", {
        type: "button",
        role: "radio",
        "aria-checked": String(on),
        onclick: () => { onChange(o.id); render(); },
        class: `choice-opt ${on ? "choice-on" : "choice-off"}`,
        text: o.label,
      }));
    }
  }
  render();
  return fs;
}

/* ======================================================================
   Overlay primitives: dialog (modal) + sheet (right/bottom drawer)
   Radix-equivalent behavior: overlay click + ESC close, aria-modal,
   focus moved into panel on open, Tab trapped, focus restored on close.
   ====================================================================== */
const dialogStack = [];
const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

function trapTab(container, e) {
  if (e.key !== "Tab") return;
  const focusables = [...container.querySelectorAll(FOCUSABLE)]
    .filter((el) => el.offsetParent !== null || el === document.activeElement);
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && dialogStack.length) {
    const top = dialogStack[dialogStack.length - 1];
    e.preventDefault();
    top.close();
  } else if (e.key === "Tab" && dialogStack.length) {
    trapTab(dialogStack[dialogStack.length - 1].panel, e);
  }
});

function openOverlay({ kind, side, title, titleNode, subtitle, body, width, onClose, labelId }) {
  const opener = document.activeElement;
  const overlay = h("div", { class: `overlay overlay-${kind}` });
  const panel = h("div", {
    class: `${kind === "dialog" ? "dialog-panel" : `sheet-panel sheet-${side}`} ${width || ""}`,
    role: kind === "dialog" ? "dialog" : "dialog",
    "aria-modal": "true",
    "aria-labelledby": labelId,
  });
  const closeBtn = h("button", {
    type: "button",
    class: "dialog-close",
    "aria-label": "Close",
    onclick: () => api.close(),
  }, icon("x", "ic"));
  const head = h("div", { class: "dialog-head" });
  const titleEl = h("h2", { id: labelId, class: "dialog-title" });
  if (titleNode) titleEl.append(...(Array.isArray(titleNode) ? titleNode : [titleNode]));
  else titleEl.textContent = title || "";
  head.append(titleEl, closeBtn);
  panel.append(head);
  if (subtitle) panel.append(h("p", { class: "dialog-subtitle", text: subtitle }));
  const bodyWrap = h("div", { class: "dialog-body gh-scroll" });
  if (body) bodyWrap.append(body);
  panel.append(bodyWrap);
  overlay.append(panel);

  const api = {
    panel,
    el: overlay,
    close() {
      const idx = dialogStack.indexOf(api);
      if (idx >= 0) dialogStack.splice(idx, 1);
      overlay.classList.add("closing");
      setTimeout(() => overlay.remove(), 140);
      if (opener && document.body.contains(opener)) opener.focus();
      if (onClose) onClose();
    },
  };
  overlay.addEventListener("pointerdown", (e) => {
    if (e.target === overlay) api.close();
  });
  document.body.append(overlay);
  dialogStack.push(api);
  const first = panel.querySelector(FOCUSABLE);
  if (first) first.focus();
  return api;
}

function openDialog(opts) { return openOverlay({ kind: "dialog", ...opts }); }
function openSheet(opts) { return openOverlay({ kind: "sheet", ...opts }); }

/* ---------- tabs (Radix Tabs equivalent) ---------- */
function makeTabs({ tabs, ariaLabel }) {
  let active = tabs[0].id;
  const root = h("div", { class: "tabs-root" });
  const list = h("div", { role: "tablist", "aria-label": ariaLabel, class: "tabs-list gh-scroll" });
  const panelBox = h("div");
  const triggers = {};
  for (const t of tabs) {
    const trig = h("button", {
      type: "button",
      role: "tab",
      "aria-selected": "false",
      id: `tab-${t.id}`,
      class: "tabs-trigger gh-term",
      text: t.label,
      onclick: () => select(t.id),
    });
    triggers[t.id] = trig;
    list.append(trig);
  }
  function select(id) {
    active = id;
    for (const t of tabs) {
      triggers[t.id].setAttribute("aria-selected", String(t.id === active));
      triggers[t.id].classList.toggle("active", t.id === active);
      triggers[t.id].tabIndex = t.id === active ? 0 : -1;
    }
    panelBox.textContent = "";
    const t = tabs.find((x) => x.id === active);
    const panel = h("div", { role: "tabpanel", "aria-labelledby": `tab-${t.id}`, tabIndex: "0" }, t.panel());
    panelBox.append(panel);
  }
  list.addEventListener("keydown", (e) => {
    const ids = tabs.map((t) => t.id);
    const cur = ids.indexOf(active);
    if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); select(ids[(cur + 1) % ids.length]); triggers[active].focus(); }
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); select(ids[(cur - 1 + ids.length) % ids.length]); triggers[active].focus(); }
    else if (e.key === "Home") { e.preventDefault(); select(ids[0]); triggers[active].focus(); }
    else if (e.key === "End") { e.preventDefault(); select(ids[ids.length - 1]); triggers[active].focus(); }
  });
  root.append(list, panelBox);
  select(active);
  return root;
}

/* ---------- star row (completion grade) ---------- */
function StarRow(stars) {
  const pct = stars === null ? 0 : (stars / 5) * 100;
  const base = h("span", { class: "stars-base", "aria-hidden": "true" });
  const fill = h("span", { class: "stars-fill", "aria-hidden": "true" });
  for (let i = 0; i < 5; i++) base.append(icon("star", "ic star-hollow"));
  for (let i = 0; i < 5; i++) fill.append(icon("star", "ic star-full"));
  fill.style.width = `${pct}%`;
  const label = stars === null ? "no grade yet" : `${stars} of 5 stars`;
  return h("span", { class: "star-row", role: "img", "aria-label": label }, base, fill);
}
