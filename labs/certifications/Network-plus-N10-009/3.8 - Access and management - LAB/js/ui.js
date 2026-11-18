// ─────────────────────────────────────────────────────────────────────────────
// ui.js — shared console primitives for the PATCHBAY lab (1:1 port of ui.tsx
// and the small helpers the original spread across components).
// All functions return HTML strings unless noted; event wiring happens in the
// module that owns the region (channels.js / evidence.js / app.js).
// ─────────────────────────────────────────────────────────────────────────────

function esc(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Inline Lucide SVG from exact path data (icons.js). */
function I(name, cls, style) {
  const nodes = ICONS[name];
  if (!nodes) return "";
  const inner = nodes
    .map((n) => {
      const [tag, attrs] = n;
      const a = Object.entries(attrs || {})
        .filter(([k]) => k !== "key")
        .map(([k, v]) => `${k}="${esc(v)}"`)
        .join(" ");
      return `<${tag} ${a}></${tag}>`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls || ""}" style="${style || ""}" aria-hidden="true">${inner}</svg>`;
}

function SectionLabel(text, color) {
  return `<div class="section-label" style="color:${color || "#8fa096"}">${text}</div>`;
}

function Led(on, color, label) {
  const dot = `<span class="led${on ? " cl-led-on" : ""}" style="background-color:${on ? color : "#2a332d"};color:${color}"></span>`;
  const sr = `<span class="sr-only">${on ? "online" : "offline"}</span>`;
  if (label) return `<span class="led-wrap">${dot}<span class="led-label">${label}</span>${sr}</span>`;
  return `<span class="led-wrap"${on ? "" : ' aria-hidden="true"'}>${dot}${sr}</span>`;
}

function PillarChip(pillar) {
  const colors = { P1: "#45D6C4", P2: "#C4A7FF", P3: "#FFB224", P4: "#4ADE80" };
  const c = colors[pillar];
  return `<span class="pillar-chip" style="color:${c};border-color:${c}55;background:${c}14">${pillar} ${PILLAR_LABEL[pillar]}</span>`;
}

/** Console panel shell (ConsolePanel in ui.tsx). body must be pre-built HTML.
 *  opts: { right, p0, cls } — right = header meta slot, p0 = zero body padding
 *  (bodyClassName="!p-0" in the original), cls = extra class on the <section>. */
function ConsolePanel(title, color, body, opts = {}) {
  const right = opts.right || "";
  const extra = opts.cls ? ` ${opts.cls}` : "";
  return `<section class="console-panel cl-panel-solid${extra}" aria-label="${esc(title)}">
    <header class="console-panel-header" style="background:${color}0d">
      ${SectionLabel(title, color)}
      ${right}
    </header>
    <div class="console-panel-body${opts.p0 ? " p0" : ""}">${body}</div>
  </section>`;
}

// Answer field bound to the validation store (F2). `k` is the answer key checked by objectives.
function AnswerField(k, label, opts = {}) {
  const value = esc(Store.s.answers[k] ?? "");
  const id = `ans-${k}`;
  // Original default width is w-40 (160px); "full" stretches to the container.
  const widthCls = opts.width === "full" ? " w-full" : " w-40";
  const fid = `ans-${k}`;
  if (opts.options && opts.options.length) {
    const optsHtml = opts.options
      .map((o) => `<option value="${esc(o.value)}"${value === esc(o.value) ? " selected" : ""}>${esc(o.label)}</option>`)
      .join("");
    return `<label class="fld" for="${id}">
      <span class="fld-label">${esc(label)}</span>
      <select id="${id}" data-answer="${esc(k)}" data-fid="${fid}" class="fld-select${widthCls}">
        <option value=""${value === "" ? " selected" : ""}>— select —</option>
        ${optsHtml}
      </select>
    </label>`;
  }
  return `<label class="fld" for="${id}">
    <span class="fld-label">${esc(label)}</span>
    <input id="${id}" data-answer="${esc(k)}" data-fid="${fid}" value="${value}" placeholder="${esc(opts.placeholder || "")}" autocomplete="off" class="fld-input${widthCls}" />
  </label>`;
}

// Toggle(label, on, color, fid, opts) — opts { act, id } wires the delegated click
// handler (data-act/data-val), mirroring the onChange the original passed in.
function Toggle(label, on, color, fid, opts = {}) {
  const actAttrs = opts.act ? ` data-act="${esc(opts.act)}" data-val="${esc(opts.id || "")}"` : "";
  return `<button type="button" role="switch" aria-checked="${on}"${actAttrs} data-fid="${esc(fid || "")}" class="toggle cl-focus">
    <span class="toggle-label">${esc(label)}</span>
    <span class="toggle-track" style="background:${on ? color : "#2a332d"}" aria-hidden="true">
      <span class="toggle-knob" style="left:${on ? "20px" : "3px"}"></span>
    </span>
  </button>`;
}

// Per-objective hint (F3/F4): Medium 3 tiers free · Hard 1 tier, costs score.
function HintBox(objId, mode) {
  const def = OBJECTIVES.find((o) => o.id === objId);
  if (!def) return "";
  const used = Store.s.hints[objId] ?? 0;
  const max = mode === "hard" ? Math.min(def.hints.length, 1) : def.hints.length;
  const exhausted = used >= max;
  const shown = def.hints.slice(0, used).map((h) =>
    `<li class="hint-item">${I("Lightbulb", "ic-3 hint-ic")}<span>${esc(h)}</span></li>`
  ).join("");
  const btn = exhausted
    ? `<button type="button" data-fid="hint-${esc(objId)}" class="hint-reveal" disabled>${I("LightbulbOff", "ic-3")} no more hints</button>`
    : `<button type="button" data-fid="hint-${esc(objId)}" class="hint-reveal" data-hint="${esc(objId)}">${I("Lightbulb", "ic-3")} reveal hint ${used + 1}/${max}${mode === "hard" ? " · costs score" : ""}</button>`;
  return `<div class="hintbox">
    ${used > 0 ? `<ul class="hint-list">${shown}</ul>` : ""}
    ${btn}
  </div>`;
}

function VerdictLine(objId) {
  const run = Store.s.objectives[objId];
  if (!run?.feedback) return "";
  const ok = run.done;
  return `<div role="status" class="verdict ${ok ? "verdict-ok" : "verdict-fail"}">
    ${ok ? I("CheckCircle2", "ic-3_5 verdict-ic") : I("XCircle", "ic-3_5 verdict-ic")}
    <span>${esc(run.feedback)}</span>
  </div>`;
}

/** Progress ring (Ledger). */
function Ring(pct) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const filled = (pct / 100) * c;
  return `<svg width="72" height="72" viewBox="0 0 72 72" role="img" aria-label="Objectives ${Math.round(pct)} percent complete" class="ring-svg">
    <circle cx="36" cy="36" r="${r}" fill="none" stroke="#2a332d" stroke-width="7"></circle>
    <circle cx="36" cy="36" r="${r}" fill="none" stroke="#FFB224" stroke-width="7" stroke-dasharray="${filled} ${c}" stroke-linecap="round" transform="rotate(-90 36 36)" style="transition:stroke-dasharray 0.4s ease"></circle>
    <text x="36" y="41" text-anchor="middle" class="cl-mono" fill="#d9e2dc" font-size="15" font-weight="bold">${Math.round(pct)}%</text>
  </svg>`;
}

function Stars(n) {
  let out = `<div class="stars" role="img" aria-label="${n} of 5 stars">`;
  for (let i = 1; i <= 5; i++) {
    out += I("Star", "ic-6", `color:${i <= n ? "#FFB224" : "#2a332d"};fill:${i <= n ? "#FFB224" : "none"}`);
  }
  return out + "</div>";
}

/** Wire all [data-answer] fields inside a root to the store (quiet writes). */
function bindAnswers(root) {
  root.querySelectorAll("[data-answer]").forEach((el) => {
    const k = el.getAttribute("data-answer");
    const ev = el.tagName === "SELECT" || el.tagName === "INPUT" ? (el.tagName === "SELECT" ? "change" : "input") : "change";
    el.addEventListener(ev, () => Store.setAnswer(k, el.value));
  });
}
