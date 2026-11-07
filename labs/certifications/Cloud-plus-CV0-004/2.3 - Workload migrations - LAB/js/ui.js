// ─────────────────────────────────────────────────────────────────────────────
// js/ui.js — DOM builder + shared UI primitives.
// Vanilla ports of `src/components/lab/ui-bits.tsx` (Chip, PillarBadge,
// ModeBadge, SectionLabel, TowerButton, RadioRow, ProgressMeter, StatusDot)
// and the small form primitives (SelectField, OrderList) from ClearancePanel.
// ─────────────────────────────────────────────────────────────────────────────

/** Hyperscript-style element builder (attrs → properties/attributes/listeners). */
function h(tag, attrs, ...children) {
  const node = document.createElement(tag);
  const refs = [];
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v === undefined || v === null || v === false) continue;
      if (k === "class") node.className = v;
      else if (k === "ref" && typeof v === "function") refs.push(v);
      else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === "value") node.value = v;
      else if (k === "checked" || k === "disabled" || k === "selected" || k === "required") node[k] = Boolean(v);
      else node.setAttribute(k, v === true ? "" : String(v));
    }
  }
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  for (const cb of refs) cb(node);
  return node;
}

/** Render a Lucide icon (exact paths from js/icons.js) as an inline SVG. */
function icon(name, size = 16, cls = "") {
  const nodes = ICON_PATHS[name] ?? [];
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  if (cls) svg.setAttribute("class", cls);
  for (const [tag, attrs] of nodes) {
    const n = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    svg.append(n);
  }
  return svg;
}

// Original lucide-react component name → geometry key in ICON_PATHS
const I = {
  RadioTower: "radio-tower", BookOpen: "book-open", RotateCcw: "rotate-ccw", Trophy: "trophy",
  LayoutGrid: "layout-grid", MonitorPlay: "monitor-play", AlertTriangle: "triangle-alert",
  Gauge: "gauge", Flame: "flame", ArrowRight: "arrow-right", GraduationCap: "graduation-cap",
  PlaneTakeoff: "plane-takeoff", Building2: "building-2", Award: "award", ListChecks: "list-checks",
  Plane: "plane", ShieldCheck: "shield-check", Play: "play", CheckCircle2: "circle-check-big",
  XCircle: "circle-x", TowerControl: "tower-control", Layers: "layers", ListOrdered: "list-ordered",
  ArrowUp: "arrow-up", ArrowDown: "arrow-down", Calculator: "calculator", Network: "network",
  Scale: "scale", Euro: "euro", Stethoscope: "stethoscope", Lock: "lock", FolderOpen: "folder-open",
  FileText: "file-text", X: "x", SearchCheck: "search-check", Lightbulb: "lightbulb",
  Globe2: "globe-2", Workflow: "workflow", Layers3: "layers-3", ClipboardCheck: "clipboard-check",
  Skull: "skull", ExternalLink: "external-link", Compass: "compass", BookMarked: "book-marked",
  Search: "search", ChevronDown: "chevron-down", Crosshair: "crosshair", Eye: "eye",
  ClipboardList: "clipboard-list", Star: "star", Target: "target", BookOpenCheck: "book-open-check",
};

// ── PillarBadge / ModeBadge / Chip / SectionLabel ───────────────────────────

function PillarBadge(pillar) {
  const map = {
    P1: { label: "UNDERSTAND", cls: "pill--teal" },
    P2: { label: "ANALYZE", cls: "pill--amber" },
    P3: { label: "VALIDATE", cls: "pill--green" },
    P4: { label: "CONTROL", cls: "pill--rose" },
  };
  const m = map[pillar];
  return h("span", { class: `pill ${m.cls}`, title: `Mastery pillar ${pillar}` }, `${pillar} · ${m.label}`);
}

function ModeBadge(mode) {
  return h(
    "span",
    { class: `pill ${mode === "medium" ? "mode-badge--medium" : "mode-badge--hard"}` },
    mode === "medium" ? "MEDIUM · LINE CHECK" : "HARD · INCIDENT COMMAND",
  );
}

const CHIP_TONES = {
  dim: "chip--dim",
  amber: "chip--amber",
  green: "chip--green",
  red: "chip--red",
  teal: "chip--teal",
};

function Chip(children, tone = "dim", cls = "") {
  return h("span", { class: `chip ${CHIP_TONES[tone]} ${cls}`.trim() }, children);
}

function SectionLabel(children, right) {
  return h("div", { class: "section-label" },
    h("h3", { class: "section-label__text" }, children),
    right ?? null,
  );
}

// ── TowerButton ─────────────────────────────────────────────────────────────

function TowerButton({ children, onClick, variant = "default", disabled, className = "", ariaLabel, size = "md" }, ...restChildren) {
  const kids = restChildren.length > 0 ? restChildren : children;
  return h(
    "button",
    {
      type: "button",
      onClick,
      disabled,
      "aria-label": ariaLabel,
      class: `btn btn--${variant} ${size === "sm" ? "btn--sm" : ""} ${className}`.trim(),
    },
    kids,
  );
}

// ── RadioRow / StatusDot / ProgressMeter ────────────────────────────────────

function RadioRow({ name, value, current, onChange, label, hint }) {
  const active = current === value;
  return h(
    "label",
    { class: `radio-row ${active ? "radio-row--active" : ""}` },
    h("input", {
      type: "radio", name, value, checked: active,
      onChange: () => onChange(value),
    }),
    h("span", { class: "min-w-0" },
      h("span", { class: `radio-row__label ${active ? "radio-row__label--active" : ""}` }, label),
      hint ? h("span", { class: "radio-row__hint" }, hint) : null,
    ),
  );
}

function StatusDot(status) {
  return h("span", { class: `status-dot status-dot--${status}` });
}

const STATUS_LABEL = { hold: "HOLD", cleared: "CLEARED", enroute: "EN ROUTE", arrived: "ARRIVED" };

function ProgressMeter(solved, total, pillarCounts) {
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
  const pillars = pillarCounts
    ? Object.entries(pillarCounts).map(([p, c]) =>
        h("span", {
          class: `pm-pillar ${c.done === c.all ? "pm-pillar--done" : c.done > 0 ? "pm-pillar--started" : ""}`,
          title: `${p}: ${c.done}/${c.all}`,
        }, `${p} ${c.done}/${c.all}`),
      )
    : null;
  return h("div", { class: "progress-meter" },
    h("div", { class: "pm-pillars" }, pillars),
    h("div", { class: "pm-main", "aria-label": `Objectives ${solved} of ${total}` },
      h("div", { class: "pm-bar", role: "presentation" },
        h("div", { class: "pm-bar__fill", style: { width: `${pct}%` } }),
      ),
      h("span", { class: "pm-count" }, `${solved}/${total}`),
    ),
  );
}

// ── SelectField / OrderList (from ClearancePanel) ───────────────────────────

function SelectField({ label, value, onChange, options }) {
  return h("label", { class: "block" },
    h("span", { class: "field-label" }, label),
    h("select", { value: value ?? "", onChange: (e) => onChange(e.target.value), "aria-label": label, class: "input select-field" },
      h("option", { value: "", disabled: true }, "— select —"),
      options.map((o) => h("option", { value: o.value }, o.label)),
    ),
  );
}

function OrderList({ items, order, onMove, labelFn, subFn, ariaLabel }) {
  const byId = Object.fromEntries(items.map((i) => [i.id, i]));
  return h(
    "ol",
    { class: "order-list", "aria-label": ariaLabel },
    order.map((id, idx) => {
      const item = byId[id];
      return h(
        "li",
        { class: "order-list__item", key: id },
        h("span", { class: "order-list__num" }, String(idx + 1)),
        h("span", { class: "order-list__body" },
          h("span", { class: "order-list__label" }, labelFn(id)),
          subFn ? h("span", { class: "order-list__sub" }, subFn(id) ?? "") : null,
        ),
        h("span", { class: "order-list__moves" },
          h("button", {
            onClick: () => onMove(idx, -1),
            disabled: idx === 0,
            "aria-label": `Move "${labelFn(id)}" up`,
            class: "order-list__arrow",
          }, icon(I.ArrowUp, 14)),
          h("button", {
            onClick: () => onMove(idx, 1),
            disabled: idx === order.length - 1,
            "aria-label": `Move "${labelFn(id)}" down`,
            class: "order-list__arrow",
          }, icon(I.ArrowDown, 14)),
        ),
      );
    }),
  );
}

/** Checkbox row used by audits/triage/checklists (uniform styling — no answer leak). */
function CheckRow({ label, checked, onToggle, accent = "amber" }) {
  return h(
    "label",
    { class: `check-row ${checked ? `check-row--on check-row--${accent}` : ""}` },
    h("input", { type: "checkbox", checked, onChange: onToggle }),
    h("span", null, label),
  );
}
