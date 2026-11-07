// ═══════════════════════════════════════════════════════════════════════════
// The Central Exchange — UI layer (static port)
// Template functions + targeted DOM updates recreating the React components:
//   Chrome.tsx (mode gate, briefing, masthead), RunSheet.tsx, Bay.tsx,
//   TapeRoom.tsx, Study.tsx, SignOff.tsx.
// Each dynamic region is built once and updated in place when the store
// changes (same re-render semantics as React without a virtual DOM).
// ═══════════════════════════════════════════════════════════════════════════

// ── tiny DOM helpers ──
function $(sel, root) { return (root || document).querySelector(sel); }
function $id(id) { return document.getElementById(id); }
function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function icon(name, cls) {
  return `<svg class="icon ${cls || ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`;
}
// Re-render helper: keeps keyboard focus on the same logical control.
function withFocusPreserved(fn) {
  const prev = document.activeElement;
  const key = prev && prev.id ? prev.id : null;
  fn();
  if (key) {
    const el = $id(key);
    if (el && typeof el.focus === "function") el.focus();
  }
}
const PILLAR_LABEL = { P1: "UNDERSTAND", P2: "ANALYZE", P3: "DETECT", P4: "MITIGATE" };
function currentObjectives() { return Lab.state.mode === "medium" ? OBJECTIVES_M : OBJECTIVES_H; }
function engineSnapshot() {
  const s = Lab.state;
  return { mode: s.mode, patched: s.patched, cord: s.cord, cfg: s.cfg, found: s.found, keyOrder: s.keyOrder, alertM: s.alertM, alertH: s.alertH, alertClass: s.alertClass, controls: s.controls, active: s.active, drills: s.drills };
}
function objDone(id) { return (Lab.state.obj[id] || {}).done === true; }

// ── R2 lock maps (discrete graded answers lock once graded; faceplates never lock) ──
const INC_LOCK = {
  inc1: ["OBJ-M4", "OBJ-H2"],
  inc2: ["OBJ-M6", "OBJ-H2"],
  inc3: ["OBJ-H2"],
  inc4: ["OBJ-M9", "OBJ-H6"],
  inc5: ["OBJ-M10", "OBJ-H7"],
};
function causeLocked(incId) { return (INC_LOCK[incId] || []).some(objDone); }
function drillLock(key) {
  if (key.startsWith("m1.")) return objDone("OBJ-M1");
  if (key.startsWith("m2.")) return objDone("OBJ-M2");
  if (key.startsWith("h1.")) return objDone("OBJ-H1");
  if (key.startsWith("h6.")) return objDone("OBJ-H6");
  return false;
}

// ═══════════════ Mode gate (Chrome.tsx ModeGate) ═══════════════
function renderModeGate() {
  const root = $id("mode-gate");
  const cards = ["medium", "hard"].map((m) => {
    const c = MODE_CARDS[m];
    return `
      <div class="rise-in-sm">
        <div class="${m === "hard" ? "plate-dark" : "plate"} mode-card">
          <p class="etch brass-text tag">${esc(c.tag)}</p>
          <h2>${esc(c.title)}</h2>
          <ul>
            ${c.points.map((p) => `<li>${icon("zap")}<span>${esc(p)}</span></li>`).join("")}
          </ul>
          <button class="btn lg minh11" data-mode="${m}">
            ${m === "medium" ? "PATCH IN — MEDIUM" : "PATCH IN — HARD"}
          </button>
        </div>
      </div>`;
  }).join("");
  root.innerHTML = `
    <div class="mode-gate">
      <div class="mode-gate-inner">
        <div class="rise-in">
          <div class="plate mode-gate-hero">
            <div class="title-row">
              ${icon("cable", "i-28")}
              <h1 class="etch">The Central Exchange</h1>
            </div>
            <p class="mode-gate-sub">Cobalt Courier (fictional) · hybrid integration shift</p>
            <p class="mode-gate-cert">
              CompTIA Cloud+ CV0-004 · Domain 5.0 DevOps Fundamentals · Objective 5.4
              <br />
              <span class="bold">System integration: APIs, webhooks and message queues</span>
            </p>
            <p class="stamp mode-gate-stamp">${esc(BRIEFING.stamp)}</p>
          </div>
        </div>
        <div class="mode-cards">${cards}</div>
        <p class="mode-gate-foot etch cream-dim">Both modes share one board — pick your shift. Progress saves in this browser.</p>
      </div>
    </div>`;
  root.querySelectorAll("[data-mode]").forEach((btn) => {
    btn.addEventListener("click", () => Actions.setMode(btn.getAttribute("data-mode")));
  });
}

// ═══════════════ Briefing (Chrome.tsx Briefing) ═══════════════
function renderBriefing() {
  const root = $id("briefing");
  if (Lab.state.briefingSeen) {
    root.innerHTML = `
      <details class="plate-dark briefing-collapsed">
        <summary class="etch">Shift brief — stamped as read (reopen)</summary>
        <div class="inner">
          ${BRIEFING.lines.map((l) => `<p>${esc(l)}</p>`).join("")}
          <p class="cert">${esc(BRIEFING.cert)}</p>
        </div>
      </details>`;
    return;
  }
  root.innerHTML = `
    <section aria-label="Scenario briefing" class="plate briefing">
      <div class="briefing-head">
        <h2 class="etch">${icon("clipboard-list")} ${esc(BRIEFING.title)}</h2>
        <span class="stamp">${esc(BRIEFING.stamp)}</span>
      </div>
      <div class="briefing-body">
        ${BRIEFING.lines.map((l) => `<p>${esc(l)}</p>`).join("")}
        <p class="cert">${esc(BRIEFING.cert)}</p>
      </div>
      <button id="briefing-stamp" class="btn lg minh11">${icon("stamp")} STAMP AS READ — OPEN THE BOARD</button>
    </section>`;
  const btn = $id("briefing-stamp");
  if (btn) btn.addEventListener("click", () => Actions.setBriefingSeen());
}

// ═══════════════ Masthead + lamp strip (Chrome.tsx Masthead / LampStrip) ═══════════════
function buildMasthead() {
  $id("masthead").innerHTML = `
    <div class="masthead-inner">
      <div class="masthead-brand">
        ${icon("cable", "i-20")}
        <div>
          <p class="etch brass-text masthead-title">The Central Exchange</p>
          <p class="masthead-sub">Cloud+ CV0-004 · 5.4 System integration</p>
        </div>
      </div>
      <div class="masthead-status">
        <span id="masthead-mode-badge" class="badge etch"></span>
        <span id="masthead-count" class="etch masthead-count"></span>
      </div>
      <div class="masthead-right">
        <div id="lamp-strip" class="lamp-strip" aria-label="Channel lamp strip"></div>
        <button id="reset-btn" class="btn outline etch" aria-label="Reset the lab">${icon("rotate-ccw", "i-14")} RESET</button>
      </div>
    </div>`;
  $id("reset-btn").addEventListener("click", () => openResetConfirm());
}

function updateMasthead() {
  const s = Lab.state;
  const badge = $id("masthead-mode-badge");
  if (!badge) return;
  if (s.mode === "hard") {
    badge.className = "badge destructive etch";
    badge.textContent = "HARD · UNATTENDED";
  } else {
    badge.className = "badge secondary etch";
    badge.textContent = "MEDIUM · SUPERVISED";
  }
  const defs = currentObjectives();
  const total = defs.length; // 11 in Medium, 9 in Hard — same as the original's hardcoded totals
  const done = defs.filter((d) => objDone(d.id)).length;
  $id("masthead-count").textContent = `RUN SHEET ${done}/${total}`;
  // lamp strip
  const snap = engineSnapshot();
  $id("lamp-strip").innerHTML = CHANNELS.map((c) => {
    const h = chHealth(snap, c.id);
    return `<div class="pair" aria-label="${esc(c.lamp)} ${esc(c.name)}: ${esc(h)}">
        <span class="lamp lamp-${h}" aria-hidden="true"></span>
        <span class="label etch">${esc(c.lamp)}</span>
      </div>`;
  }).join("");
}

// ═══════════════ Run sheet (RunSheet.tsx) ═══════════════
function buildRunsheet() {
  $id("runsheet").innerHTML = `
    <div class="plate-dark runsheet-head">
      <h2 class="etch sec-h2">${icon("list-checks")} Run sheet</h2>
      <p id="runsheet-lede"></p>
    </div>
    <div id="objective-list" class="runsheet"></div>`;
  updateRunsheet();
}

function objectiveCardHTML(def, index, isNext) {
  const s = Lab.state;
  const o = s.obj[def.id] || { done: false, attempts: 0, hints: 0 };
  const nudged = s.nudged[def.id] === true;
  const mode = s.mode;
  const done = o.done === true;
  const hints = o.hints || 0;
  const attempts = o.attempts || 0;
  let body = "";
  if (!done) {
    if (mode === "medium") {
      body += `<div class="oc-hints">`;
      body += hints < 3
        ? `<button class="btn outline sm minh11 etch" data-hint="${def.id}">${icon("lightbulb", "i-14")} PULL HINT (${hints}/3) −★0.25</button>`
        : `<p class="etch all-hints">all hints pulled</p>`;
      if (hints > 0 && def.hints) {
        body += `<ul class="hint-list">` + def.hints.slice(0, hints).map((h, i) =>
          `<li><span class="lvl">LVL ${i + 1}</span>${esc(h)}</li>`).join("") + `</ul>`;
      }
      body += `</div>`;
    }
    if (mode === "hard") {
      body += `<div class="oc-hints">`;
      body += !nudged
        ? `<button class="btn outline sm minh11 etch" data-nudge="${def.id}">${icon("lightbulb", "i-14")} PULL THE ONE NUDGE (−★0.5)</button>`
        : `<p class="nudge-box">${esc(def.nudge || "")}</p>`;
      body += `</div>`;
    }
    body += `<button class="btn sm minh11 etch oc-check" data-check="${def.id}">CHECK RESULTS</button>`;
    if (attempts > 0) {
      body += `<div class="fail-box">${icon("triangle-alert", "i-14")}<span>${esc(def.failHint)}</span></div>`;
    }
  } else {
    body += `<div class="fb-box">${esc(def.feedback)}</div>`;
  }
  return `
    <article
      class="objective-card ${done ? "plate" : "plate-dark"} ${isNext && !done ? "next" : ""}"
      aria-label="${esc(def.id)}, pillar ${PILLAR_LABEL[def.pillar]}, ${done ? "signed off" : "open"}"
    >
      <div class="oc-head">
        <span class="etch oc-id">${esc(def.id)}</span>
        <span class="badge outline etch ${done ? "" : "brass-text"}">${PILLAR_LABEL[def.pillar]}</span>
        ${done ? `<span class="oc-done-mark">${icon("circle-check-big", "i-14")} SIGNED OFF</span>` : ""}
        ${isNext && !done ? `<span class="badge etch oc-next">NEXT UP</span>` : ""}
        <span class="etch oc-index">${index}</span>
      </div>
      <h3>${esc(def.title)}</h3>
      <p class="oc-detail">${esc(def.detail)}</p>
      ${body}
      <p class="etch oc-anchor">ANCHOR · ${esc(def.anchor)}</p>
    </article>`;
}

function updateRunsheet() {
  const s = Lab.state;
  const defs = currentObjectives();
  const next = defs.find((d) => !objDone(d.id));
  $id("runsheet-lede").textContent = s.mode === "medium"
    ? "Work top to bottom — each check explains WHY. Hints cost stars, never progress."
    : "Free roam: five faults are live. Broad challenges, exact answers, one optional nudge each.";
  withFocusPreserved(() => {
    $id("objective-list").innerHTML = defs.map((d, i) => objectiveCardHTML(d, i + 1, next && d.id === next.id)).join("");
  });
  // wire actions
  $id("objective-list").querySelectorAll("[data-check]").forEach((b) =>
    b.addEventListener("click", () => Actions.checkObjective(b.getAttribute("data-check"))));
  $id("objective-list").querySelectorAll("[data-hint]").forEach((b) =>
    b.addEventListener("click", () => Actions.useHint(b.getAttribute("data-hint"))));
  $id("objective-list").querySelectorAll("[data-nudge]").forEach((b) =>
    b.addEventListener("click", () => Actions.useNudge(b.getAttribute("data-nudge"))));
}

// ═══════════════ The Bay (Bay.tsx): crossbar + workbench + sweep ═══════════════
const ROWS = [
  { key: "fleet", label: "FleetHub", y: 165 },
  { key: "depot", label: "DepotERP", y: 260 },
  { key: "crm", label: "ParcelCRM", y: 355 },
];
const COLS = [
  { key: "depot", label: "DepotERP", x: 250 },
  { key: "fleet", label: "FleetHub", x: 415 },
  { key: "bill", label: "BillingSvc", x: 580 },
];
const JACK_X = 84;
const JACK_Y = 92;

function cordPathFor(chId) {
  const cell = CORD_CELL[chId];
  const row = ROWS.find((r) => r.key === cell.row);
  const col = COLS.find((c) => c.key === cell.col);
  const d = `M ${JACK_X} ${row.y} C ${JACK_X + (col.x - JACK_X) / 2} ${row.y}, ${col.x} ${JACK_Y + (row.y - JACK_Y) / 2}, ${col.x} ${JACK_Y}`;
  return d;
}

function buildBay() {
  const root = $id("bay");
  // ── crossbar SVG ──
  const colHeaders = COLS.map((c) => `
    <text x="${c.x}" y="38" text-anchor="middle" fill="#c9a227" font-size="13" font-family="var(--font-geist-mono), monospace" letter-spacing="2">${c.label.toUpperCase()}</text>
    <circle cx="${c.x}" cy="${JACK_Y}" r="9" fill="var(--panel-2)" stroke="#c9a227" stroke-width="2.5"></circle>`).join("");
  const rowLabels = ROWS.map((r) => `
    <text x="64" y="${r.y + 4}" text-anchor="end" fill="#b3a486" font-size="12" font-family="var(--font-geist-mono), monospace">${r.label}</text>
    <circle cx="${JACK_X}" cy="${r.y}" r="9" fill="var(--panel-2)" stroke="#c9a227" stroke-width="2.5"></circle>`).join("");
  const gridDots = ROWS.map((r) => COLS.map((c) =>
    `<circle cx="${c.x}" cy="${r.y}" r="2" fill="#3a2f22"></circle>`).join("")).join("");
  // patchable cells (built once; visuals updated in place)
  const cells = ROWS.map((r) => COLS.map((c) => {
    const chId = Object.keys(CORD_CELL).find((id) => CORD_CELL[id].row === r.key && CORD_CELL[id].col === c.key);
    if (!chId) {
      return `<circle cx="${c.x}" cy="${r.y}" r="4" fill="none" stroke="#3a2f22" stroke-width="1.5" aria-hidden="true"></circle>`;
    }
    const chan = CHANNELS.find((x) => x.id === chId);
    return `
      <g class="jack-cell" data-ch="${chId}" role="button" tabindex="0"
         aria-label="${esc(chan.lamp)} ${esc(chan.name)}: ${esc(chan.fromLabel)} to ${esc(chan.toLabel)}, not patched. Activate to toggle patch.">
        <rect class="cell-rect" x="${c.x - 55}" y="${r.y - 33}" width="110" height="66" rx="8" fill="transparent" stroke="#3a2f22" stroke-dasharray="3 4"></rect>
        <circle class="cell-jack" cx="${c.x}" cy="${r.y}" r="7" fill="var(--panel-2)" stroke="#6b6257" stroke-width="2.5"></circle>
        <text class="cell-label" x="${c.x}" y="${r.y + 26}" text-anchor="middle" fill="#6b6257" font-size="11" font-family="var(--font-geist-mono), monospace">${chan.lamp} PATCH</text>
      </g>`;
  }).join("")).join("");

  root.innerHTML = `
    <div class="bay">
      <section aria-label="Crossbar switchboard" class="plate-dark">
        <div class="bay-head">
          <h2 class="etch sec-h2">${icon("cable")} Crossbar — patch the integration cords</h2>
          <span class="stamp">synthetic board</span>
        </div>
        <svg viewBox="0 0 680 440" class="board" role="img" aria-label="Crossbar switchboard: rows are source systems, columns are destination systems; three planned cords">
          <rect x="0" y="0" width="680" height="440" rx="12" fill="var(--panel)" stroke="var(--line)"></rect>
          ${colHeaders}
          <text x="${JACK_X}" y="38" text-anchor="middle" fill="#b3a486" font-size="11" font-family="var(--font-geist-mono), monospace">CALLERS ▸</text>
          ${rowLabels}
          ${gridDots}
          <g id="cords-layer"></g>
          ${cells}
        </svg>
        <div id="mobile-patch" class="mobile-patch"></div>
        <div class="bay-legend">
          <span class="chip"><span class="legend-api"></span> API cord</span>
          <span class="chip"><span class="legend-webhook"></span> Webhook cord</span>
          <span class="chip"><span class="legend-queue"></span> Queue trunk</span>
        </div>
      </section>
      <section aria-label="Workbench faceplates" class="plate-dark">
        <h2 class="etch sec-h2" style="margin-bottom:12px">Workbench — faceplates &amp; drill bench</h2>
        <div id="workbench"></div>
      </section>
      <section aria-label="Sign-off drills" class="plate-dark">
        <div class="sweep">
          <div>
            <p class="etch title">Sign-off sweep</p>
            <p class="desc">Fires a test order through the API, a test webhook and a test billing event — the end-to-end proof.</p>
          </div>
          <button id="fire-drills" class="btn lg minh11 etch">${icon("plug-zap")} FIRE DRILLS</button>
        </div>
      </section>
    </div>`;

  // cord/cell updates
  updateCrossbar();
  // cell interactions (built once — focus is preserved across toggles, like React)
  root.querySelectorAll(".jack-cell").forEach((g) => {
    const chId = g.getAttribute("data-ch");
    const activate = () => { Actions.togglePatch(chId); };
    g.addEventListener("click", activate);
    g.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(); }
    });
  });
  // mobile patch buttons
  const mp = $id("mobile-patch");
  mp.innerHTML = CHANNELS.filter((c) => c.cordType).map((c) =>
    `<button class="btn outline lg etch" data-mpatch="${c.id}"></button>`).join("");
  mp.querySelectorAll("[data-mpatch]").forEach((b) =>
    b.addEventListener("click", () => Actions.togglePatch(b.getAttribute("data-mpatch"))));
  // workbench + sweep
  buildWorkbench();
  $id("fire-drills").addEventListener("click", () => Actions.fireDrills());
}

function updateCrossbar() {
  const s = Lab.state;
  const snap = engineSnapshot();
  // cords layer — rebuilt (paths + moving packets when green)
  const layer = $id("cords-layer");
  if (!layer) return;
  const cords = CHANNELS.filter((c) => c.cordType && s.patched[c.id]).map((c) => {
    const d = cordPathFor(c.id);
    const h = chHealth(snap, c.id);
    const opacity = h === "red" ? 0.45 : h === "idle" ? 0.8 : 1;
    let inner;
    if (c.cordType === "queue") {
      inner = `<path id="cord-${c.id}" d="${d}" fill="none" stroke="#b45309" stroke-width="9" stroke-linecap="round"></path>
               <path d="${d}" fill="none" stroke="var(--rack)" stroke-width="4" stroke-linecap="round"></path>`;
    } else {
      const stroke = c.cordType === "api" ? "#2fbf71" : "#f2a33c";
      const width = c.cordType === "api" ? 5 : 4;
      const dash = c.cordType === "webhook" ? ' stroke-dasharray="10 7"' : "";
      inner = `<path id="cord-${c.id}" d="${d}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round"${dash}></path>`;
    }
    if (h === "green") {
      const dur1 = c.cordType === "queue" ? "4.2s" : "2.8s";
      const dur2 = c.cordType === "queue" ? "5.6s" : "3.9s";
      inner += `<circle r="3.2" fill="#f3ead8"><animateMotion dur="${dur1}" repeatCount="indefinite"><mpath href="#cord-${c.id}"/></animateMotion></circle>
                <circle r="2.2" fill="#c9a227"><animateMotion dur="${dur2}" begin="0.9s" repeatCount="indefinite"><mpath href="#cord-${c.id}"/></animateMotion></circle>`;
    }
    return `<g opacity="${opacity}">${inner}</g>`;
  }).join("");
  layer.innerHTML = cords;
  // cells — updated in place (focus stays on the cell after toggling)
  {
    document.querySelectorAll("#bay .jack-cell").forEach((g) => {
      const chId = g.getAttribute("data-ch");
      const chan = CHANNELS.find((x) => x.id === chId);
      const isPatched = s.patched[chId] === true;
      const h = chHealth(snap, chId);
      const rect = g.querySelector(".cell-rect");
      const jack = g.querySelector(".cell-jack");
      const label = g.querySelector(".cell-label");
      rect.setAttribute("fill", isPatched ? "rgba(201,162,39,0.08)" : "transparent");
      rect.setAttribute("stroke", isPatched ? "#c9a227" : "#3a2f22");
      if (isPatched) rect.removeAttribute("stroke-dasharray"); else rect.setAttribute("stroke-dasharray", "3 4");
      jack.setAttribute("fill", isPatched ? "#c9a227" : "var(--panel-2)");
      jack.setAttribute("stroke", h === "red" ? "#e5484d" : isPatched ? "#c9a227" : "#6b6257");
      label.setAttribute("fill", isPatched ? "#c9a227" : "#6b6257");
      label.textContent = `${chan.lamp} ${isPatched ? "PATCHED" : "PATCH"}`;
      g.setAttribute("aria-label", `${chan.lamp} ${chan.name}: ${chan.fromLabel} to ${chan.toLabel}, ${isPatched ? "patched" : "not patched"}. Activate to toggle patch.`);
    });
  }
  // mobile patch buttons
  document.querySelectorAll("#mobile-patch [data-mpatch]").forEach((b) => {
    const chId = b.getAttribute("data-mpatch");
    const c = CHANNELS.find((x) => x.id === chId);
    b.textContent = `${s.patched[chId] ? "PULL" : "PATCH"} ${c.lamp} · ${c.name}`;
  });
}

// ═══════════════ Workbench (Bay.tsx Tabs + FieldRow) ═══════════════
let wbSel = "ch1"; // selected workbench tab (React useState("ch1"))

function lockedNoteHTML() {
  return `<p class="locked-note etch">${icon("lock", "i-12")} answer locked — objective signed off</p>`;
}

function fieldCardHTML(f, locked) {
  const value = Lab.state.cfg[f.key];
  const id = `f-${f.key}`;
  if (f.kind === "select") {
    return `
      <div class="field-card plate">
        <label for="${id}">${esc(f.label)}</label>
        <select id="${id}" class="select-trigger cream" data-cfg="${esc(f.key)}"
                aria-label="${esc(f.label)}" ${locked ? "disabled" : ""}>
          <option value="" ${value === undefined || typeof value !== "string" ? "selected" : ""}>— not set —</option>
          ${(f.options || []).map((o) => `<option value="${esc(o.value)}" ${value === o.value ? "selected" : ""}>${esc(o.label)}</option>`).join("")}
        </select>
        ${locked ? lockedNoteHTML() : `<p class="teach">${esc(f.teach)}</p>`}
      </div>`;
  }
  return `
    <div class="field-card plate">
      <div class="field-top">
        <label for="${id}">${esc(f.label)}</label>
        <button id="${id}" class="switch" role="switch" aria-checked="${value === true}"
                data-cfg="${esc(f.key)}" aria-label="${esc(f.label)}" ${locked ? "disabled" : ""}>
          <span class="thumb"></span>
        </button>
      </div>
      <p class="status">${value === true ? "armed" : "off"}</p>
      ${locked ? lockedNoteHTML() : `<p class="teach">${esc(f.teach)}</p>`}
    </div>`;
}

function buildWorkbench() {
  const root = $id("workbench");
  const tabs = [
    ...CHANNELS.map((c) => ({ value: c.id, label: c.lamp })),
    { value: "drill", label: "DRILL BENCH", drill: true },
  ];
  root.innerHTML = `
    <div class="tabs-list" role="tablist" aria-label="Workbench channels">
      ${tabs.map((t) => `
        <button role="tab" id="wb-tab-${t.value}" data-tabvalue="${t.value}" aria-selected="${wbSel === t.value}"
                aria-controls="wb-panel-${t.value}" tabindex="${wbSel === t.value ? "0" : "-1"}" class="tab">
          ${t.drill ? icon("flask-conical", "i-14") + " " : ""}${esc(t.label)}
        </button>`).join("")}
    </div>
    ${CHANNELS.map((c) => `
      <div id="wb-panel-${c.id}" role="tabpanel" aria-labelledby="wb-tab-${c.id}" class="tab-panel" ${wbSel === c.id ? "" : "hidden"}>
        <div class="channel-blurb">
          <span class="badge outline etch brass-text">${esc(c.construct)}</span>
          <p>${esc(c.blurb)}</p>
        </div>
        <div class="fields-grid" data-channel-fields="${c.id}"></div>
      </div>`).join("")}
      <div id="wb-panel-drill" role="tabpanel" aria-labelledby="wb-tab-drill" class="tab-panel" ${wbSel === "drill" ? "" : "hidden"}>
        <div id="drill-content"></div>
      </div>`;
  wireTabKeyboard($("#workbench .tabs-list"), (v) => selectWorkbenchTab(v));
  root.querySelectorAll("#workbench [data-tabvalue]").forEach((t) =>
    t.addEventListener("click", () => selectWorkbenchTab(t.getAttribute("data-tabvalue"))));
  updateWorkbench();
}

function selectWorkbenchTab(value) {
  wbSel = value;
  document.querySelectorAll("#workbench [role=tab]").forEach((t) => {
    const on = t.getAttribute("data-tabvalue") === value;
    t.setAttribute("aria-selected", on ? "true" : "false");
    t.setAttribute("tabindex", on ? "0" : "-1");
  });
  document.querySelectorAll("#workbench [role=tabpanel]").forEach((p) => {
    if (p.id === `wb-panel-${value}`) p.removeAttribute("hidden"); else p.setAttribute("hidden", "");
  });
}

// Radix-style keyboard support: arrows move focus AND activate (automatic mode)
function wireTabKeyboard(listEl, onActivate) {
  if (!listEl) return;
  const tabs = [...listEl.querySelectorAll('[role="tab"]')];
  listEl.addEventListener("keydown", (e) => {
    const i = tabs.indexOf(document.activeElement);
    if (i === -1) return;
    let ni = null;
    if (e.key === "ArrowRight") ni = (i + 1) % tabs.length;
    else if (e.key === "ArrowLeft") ni = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") ni = 0;
    else if (e.key === "End") ni = tabs.length - 1;
    if (ni !== null) {
      e.preventDefault();
      tabs[ni].focus();
      onActivate(tabs[ni].getAttribute("data-tabvalue"));
    }
  });
}

function updateWorkbench() {
  const s = Lab.state;
  // channel faceplates (never lock)
  CHANNELS.forEach((c) => {
    const grid = document.querySelector(`[data-channel-fields="${c.id}"]`);
    if (!grid) return;
    withFocusPreserved(() => {
      grid.innerHTML = (FIELDS[c.id] || []).map((f) => fieldCardHTML(f, false)).join("");
    });
    wireFieldControls(grid);
  });
  // drill bench (locks once graded)
  const drill = $id("drill-content");
  if (drill) {
    const medium = s.mode === "medium";
    const grids = medium
      ? `<div class="fields-grid">${DRILL_FIELDS.map((f) => fieldCardHTML(f, drillLock(f.key))).join("")}</div>`
      : `
        <div class="drill-groups">
          <div>
            <p class="etch drill-group-title brass-text">Partner-launch brief (OBJ-H1)</p>
            <div class="fields-grid">${ARCH_FIELDS.map((f) => fieldCardHTML(f, drillLock(f.key))).join("")}</div>
          </div>
          <div>
            <p class="etch drill-group-title brass-text">Poison-message forensics (OBJ-H6)</p>
            <div class="fields-grid">${POISON_FIELDS.map((f) => fieldCardHTML(f, drillLock(f.key))).join("")}</div>
          </div>
        </div>`;
    withFocusPreserved(() => { drill.innerHTML = grids; });
    wireFieldControls(drill);
  }
}

function wireFieldControls(scope) {
  scope.querySelectorAll("select[data-cfg]").forEach((el) =>
    el.addEventListener("change", () => Actions.setCfg(el.getAttribute("data-cfg"), el.value)));
  scope.querySelectorAll("button[data-cfg]").forEach((el) =>
    el.addEventListener("click", () => {
      const key = el.getAttribute("data-cfg");
      Actions.setCfg(key, el.getAttribute("aria-checked") !== "true");
    }));
}

// ═══════════════ Tape Room (TapeRoom.tsx) ═══════════════
let keyStepOrder = []; // shuffled per "mount" (re-shuffled on lab build / RESET ORDER)

const fill = (t) => t.replace(/#+/g, () => String(Math.floor(1000 + Math.random() * 9000)));
const gColor = (v, good, ok) => (v >= good ? "green" : v >= ok ? "amber" : "red");

function buildTapeRoom() {
  keyStepOrder = fisherYates(KEY_STEPS.map((k) => k.id)); // per-mount shuffle (R6/QA-11 fix)
  $id("taperoom").innerHTML = `
    <div class="tape-room">
      <section aria-label="Integration health gauges" class="plate-dark">
        <h3 class="etch sec-h3" style="margin-bottom:12px">${icon("activity")} Gauges</h3>
        <div id="gauges-grid" class="gauges"></div>
      </section>
      <section aria-label="Teleprinter tape" class="plate-dark">
        <h3 class="etch sec-h3" style="margin-bottom:8px">${icon("scroll-text")} Teleprinter</h3>
        <p id="tape-live" class="tape-live" aria-live="polite">tape idle</p>
        <div id="tape-lines" class="teleprinter-box exchange-scroll" aria-live="off"></div>
        <p class="teleprinter-stamp etch">${esc(BRIEFING.stamp)}</p>
      </section>
      <section aria-label="Evidence rolls" class="plate-dark">
        <h3 class="etch sec-h3" style="margin-bottom:12px">Evidence rolls</h3>
        <div id="rolls-list" class="rolls"></div>
        <div id="noise-card"></div>
      </section>
      <section aria-label="Alert stack" class="plate-dark">
        <h3 class="etch sec-h3" style="margin-bottom:12px">Alert stack</h3>
        <div id="alert-stack"></div>
      </section>
      <section aria-label="Security desk" class="plate-dark">
        <h3 class="etch sec-h3" style="margin-bottom:12px">${icon("shield-alert")} Security desk</h3>
        <p class="security-intro">Key-breach response — click the five steps in the correct order (OBJ-M10 / OBJ-H7).</p>
        <div id="key-steps" class="key-steps"></div>
        <div id="key-order" class="key-order"></div>
        <div id="security-hard"></div>
      </section>
    </div>`;
  updateTapeRoom();
}

function updateGauges() {
  const snap = engineSnapshot();
  const g = gauges(snap);
  $id("gauges-grid").innerHTML = `
    <div class="plate gauge-tile"><span class="lamp lamp-${gColor(g.api, 99, 97)}" aria-hidden="true"></span>
      <p class="value">${g.api.toFixed(1)}%</p><p class="etch label">API success</p></div>
    <div class="plate gauge-tile"><span class="lamp lamp-${gColor(g.hook, 99.5, 95)}" aria-hidden="true"></span>
      <p class="value">${g.hook.toFixed(1)}%</p><p class="etch label">Webhook delivery</p></div>
    <div class="plate gauge-tile"><span class="lamp lamp-${gColor(1000 - Math.min(g.depth, 1000), 900, 500)}" aria-hidden="true"></span>
      <p class="value">${g.depth.toLocaleString("en-US")}</p><p class="etch label">Queue depth</p></div>`;
}

// tape: appended incrementally (only new lines are inserted; scroll confined
// to the teleprinter's own overflow container — QA-14/L-11 fix)
function updateTape() {
  const s = Lab.state;
  const box = $id("tape-lines");
  const total = s.tape.length;
  const rendered = box.querySelectorAll("p[data-eid]").length;
  if (total < rendered) {
    box.innerHTML = s.tape.map(tapeLineHTML).join("");
  } else if (total > rendered) {
    const frag = document.createElement("template");
    frag.innerHTML = s.tape.slice(rendered).map(tapeLineHTML).join("");
    box.appendChild(frag.content);
  }
  const last = s.tape[s.tape.length - 1];
  $id("tape-live").textContent = last ? last.text : "tape idle";
  box.scrollTop = box.scrollHeight;
}

function updateTapeRoom() {
  const s = Lab.state;
  // evidence rolls
  const rolls = INCIDENTS.filter((i) => (s.mode === "medium" ? i.medium : i.hard));
  withFocusPreserved(() => {
    $id("rolls-list").innerHTML = rolls.map((inc) => {
      const isLive = s.active[inc.id] === true;
      return `
        <div class="plate roll-card ${isLive ? "" : "standby"}">
          <div class="roll-head">
            <span class="lamp ${isLive ? "lamp-red" : "lamp-idle"}" aria-hidden="true"></span>
            <p class="title">${esc(inc.title)}</p>
            <span class="etch roll-id">${esc(inc.roll)}</span>
          </div>
          <p class="short">${isLive ? esc(inc.short) : "on standby — opens when the board faults"}</p>
          ${isLive ? `<button class="btn sm minh11 etch" data-roll="${inc.id}">OPEN ${esc(inc.roll)}</button>` : ""}
        </div>`;
    }).join("");
    // noise identification (hard only)
    const noiseLocked = objDone("OBJ-H2");
    $id("noise-card").innerHTML = s.mode === "hard"
      ? `<div class="plate noise-card">
          <p class="title">Noise identification (OBJ-H2)</p>
          <div class="select-wrap">
            <select id="noise-select" class="select-trigger cream" aria-label="Identify the tape noise" ${noiseLocked ? "disabled" : ""}>
              <option value="" ${s.found.noise ? "" : "selected"}>— which tape items are legitimate noise? —</option>
              <option value="batch-loadtest" ${s.found.noise === "batch-loadtest" ? "selected" : ""}>Scheduled batch import + tagged load test are noise</option>
              <option value="marketing-batch" ${s.found.noise === "marketing-batch" ? "selected" : ""}>Marketing blast + 502 blip are noise</option>
              <option value="none" ${s.found.noise === "none" ? "selected" : ""}>Everything on the tape is a real fault</option>
              <option value="all" ${s.found.noise === "all" ? "selected" : ""}>Everything on the tape is noise</option>
            </select>
          </div>
          ${noiseLocked ? lockedNoteHTML() : ""}
        </div>`
      : "";
    // alert stack
    $id("alert-stack").innerHTML = alertStackHTML();
    // security desk
    const keyDeskLocked = s.mode === "medium" ? objDone("OBJ-M10") : objDone("OBJ-H7");
    $id("key-steps").innerHTML = keyStepOrder.map((sid) => {
      const step = KEY_STEPS.find((k) => k.id === sid);
      const used = s.keyOrder.includes(sid);
      return `<button class="btn outline sm" data-keystep="${sid}" ${used || keyDeskLocked ? "disabled" : ""}>${esc(step.label)}</button>`;
    }).join("");
    $id("key-order").innerHTML =
      s.keyOrder.map((sid, i) => `<span class="badge secondary etch">${i + 1}·${esc(sid)}</span>`).join("") +
      (s.keyOrder.length > 0 && !keyDeskLocked
        ? `<button class="btn ghost sm minh11 etch" id="reset-key-order">${icon("undo-2", "i-14")} RESET ORDER</button>` : "");
    const controlsLocked = objDone("OBJ-H8");
    $id("security-hard").innerHTML = s.mode === "hard"
      ? `<div class="security-hard">
          <p class="intro">Residual-risk memo (OBJ-H8): match exactly one control to each named risk.</p>
          <ul class="risk-list">
            <li>· Retries can still double-apply effects</li>
            <li>· A dead dependency can still freeze callers</li>
            <li>· Malformed events can still plug the queue</li>
            <li>· Keys can still be committed to source control</li>
          </ul>
          <div class="controls-list">
            ${CONTROL_OPTIONS.map((c) => `
              <div class="checkbox-row plate">
                <input type="checkbox" id="ctl-${c.id}" ${s.controls.includes(c.id) ? "checked" : ""} ${controlsLocked ? "disabled" : ""} aria-label="${esc(c.label)}" data-control="${c.id}" />
                <label for="ctl-${c.id}">${esc(c.label)}</label>
              </div>`).join("")}
            ${controlsLocked ? lockedNoteHTML() : ""}
          </div>
        </div>`
      : "";
  });
  // wiring (fresh nodes each update)
  document.querySelectorAll("#taperoom [data-roll]").forEach((b) =>
    b.addEventListener("click", () => {
      const inc = INCIDENTS.find((i) => i.id === b.getAttribute("data-roll"));
      openRollDialog(inc);
    }));
  const noiseSel = $id("noise-select");
  if (noiseSel) noiseSel.addEventListener("change", () => Actions.setFound("noise", noiseSel.value));
  document.querySelectorAll("#taperoom [data-keystep]").forEach((b) =>
    b.addEventListener("click", () => Actions.pushKeyStep(b.getAttribute("data-keystep"))));
  const rko = $id("reset-key-order");
  if (rko) rko.addEventListener("click", () => { Actions.resetKeyOrder(); keyStepOrder = fisherYates(KEY_STEPS.map((k) => k.id)); updateTapeRoom(); });
  document.querySelectorAll("#taperoom [data-alertm]").forEach((el) =>
    el.addEventListener("change", () => Actions.setAlertM(el.value)));
  document.querySelectorAll("#taperoom [data-alert]").forEach((el) =>
    el.addEventListener("change", () => Actions.toggleAlertH(el.getAttribute("data-alert"))));
  document.querySelectorAll("#taperoom [data-alertclass]").forEach((el) =>
    el.addEventListener("change", () => Actions.setAlertClass(el.getAttribute("data-alertclass"), el.value)));
  document.querySelectorAll("#taperoom [data-control]").forEach((el) =>
    el.addEventListener("change", () => Actions.toggleControl(el.getAttribute("data-control"))));
}

function tapeLineHTML(e) {
  return `<p class="tape-line tape-${e.level}" data-eid="${e.id}"><span class="cream-dim">${esc(e.t)}</span> · ${esc(e.text)}</p>`;
}

function alertStackHTML() {
  const s = Lab.state;
  if (s.mode === "medium") {
    const locked = objDone("OBJ-M8");
    return `<div role="radiogroup" aria-label="Paged alerts">
      ${ALERTS_MEDIUM.map((a) => `
        <div class="radio-row plate on-cream">
          <input type="radio" name="alert-m" id="am-${a.id}" value="${a.id}" ${s.alertM === a.id ? "checked" : ""} ${locked ? "disabled" : ""} data-alertm aria-label="${esc(a.text)}" />
          <label for="am-${a.id}">${esc(a.text)}</label>
        </div>`).join("")}
      ${locked ? lockedNoteHTML() : ""}
    </div>`;
  }
  const locked = objDone("OBJ-H5");
  return `
    <p class="alert-intro">Select EXACTLY the three true integration failures, then classify each.</p>
    <div class="alert-stack">
      ${ALERTS_HARD.map((a) => {
        const checked = s.alertH.includes(a.id);
        return `
          <div class="plate alert-row">
            <div class="row">
              <input type="checkbox" id="ah-${a.id}" ${checked ? "checked" : ""} ${locked ? "disabled" : ""} data-alert="${a.id}" aria-label="${esc(a.text)}" />
              <label for="ah-${a.id}">${esc(a.text)}</label>
            </div>
            ${checked ? `
              <select class="select-trigger cream cream-sm" aria-label="Classify alert ${a.id}" ${locked ? "disabled" : ""} data-alertclass="${a.id}">
                <option value="" ${s.alertClass[a.id] ? "" : "selected"}>— classify —</option>
                ${HARD_ALERT_CLASSES.map((c) => `<option value="${c.value}" ${s.alertClass[a.id] === c.value ? "selected" : ""}>${esc(c.label)}</option>`).join("")}
              </select>` : ""}
          </div>`;
      }).join("")}
      ${locked ? lockedNoteHTML() : ""}
    </div>`;
}

// ═══════════════ Knowledge core (Study.tsx KnowledgeCore) ═══════════════
function buildKnowledge() {
  const items = [
    { id: "kc-1", title: "The three wires (API · webhook · queue)", open: true, body: `
      <p><strong>APIs (synchronous):</strong> the caller sends a request and blocks until the answer returns — stock checks, payment authorizations, anything whose next step depends on the reply. The price of that simplicity is coupling: a slow or dead callee drags its caller down unless the caller defends itself with timeouts, circuit breakers and fallbacks.</p>
      <p><strong>Webhooks (push):</strong> you register a callback URL and the source system POSTs to you the moment an event fires — shipment status changes, billing alerts. No polling, near-real-time. Your callback URL is public attack surface, so it needs signature verification, event-ID dedupe (replay protection) and rate caps.</p>
      <p><strong>Message queues (asynchronous):</strong> a buffer between producer and consumer lets them fail, scale and deploy independently. Brokers practically guarantee <em>at-least-once</em> delivery, so consumers must tolerate duplicates, acknowledge only after successful processing, and route never-succeeding messages (poison messages) to a dead-letter queue instead of letting one bad event plug the whole queue.</p>
      <p><strong>Where this sits in the toolchain:</strong> source control (5.2) and CI/CD pipelines (5.3) produce and ship the systems; Objective 5.4 is the wiring that makes those systems act as one platform; the toolchain (5.5) runs it and event-driven/serverless patterns (5.6) extend it. On the exam, "system integration" means choosing the right wire per interaction — then hardening it.</p>` },
    { id: "kc-2", title: "Reliability patterns: the four guards", open: false, body: `
      <p><strong>Idempotency keys</strong> — a unique token per operation lets the receiver recognize a retried request and return the original result instead of doing the work twice. This turns retries from dangerous to safe.</p>
      <p><strong>Exponential backoff + jitter + caps</strong> — retries with growing randomized waits prevent synchronized stampedes; a small cap bounds how hard a client pounds a struggling dependency.</p>
      <p><strong>Circuit breaker + fallback</strong> — after repeated failures, stop calling the dependency entirely for a window and serve a degraded answer (cached data). One dead service no longer freezes everything that calls it.</p>
      <p><strong>DLQ + replay</strong> — park messages that keep failing, fix the producer, verify, then replay. Explicit consumer acknowledgments let the broker redeliver anything lost mid-crash.</p>` },
    { id: "kc-3", title: "Security lens — how attackers see your integrations (ATT&CK, verified)", open: false, body: `
      <p>Integration plumbing is attack surface. The MITRE ATT&amp;CK entities that embody this lesson's vocabulary:</p>
      <ul>
        <li><strong>T1552.001 — Unsecured Credentials: Credentials In Files.</strong> Keys committed to repos or config files are attacker gold. Documented procedure examples include <em>AADInternals (S0677)</em> and <em>Agent Tesla (S0331)</em>, which harvest credentials from files. Mitigations: M1022 (restrict file permissions), M1017 (user training).</li>
        <li><strong>T1550.001 — Application Access Token.</strong> Stolen integration tokens are replayed as valid credentials. Mitigations: M1036 (account use policies), M1041 (encrypt sensitive information).</li>
        <li><strong>T1499.002 — Service Exhaustion Flood.</strong> Floods of plausible-looking traffic exhaust threads and queues — the offensive twin of a webhook storm. Mitigation: M1037 (filter network traffic, rate caps).</li>
        <li><strong>T1190 — Exploit Public-Facing Application.</strong> Exposed callback URLs and unauthenticated endpoints are classic entry points. Mitigations: M1035 (limit access over network), M1030 (network segmentation).</li>
        <li><strong>M1047 — Audit.</strong> Audit trails on key usage and integration traffic are what make all of the above detectable.</li>
      </ul>
      <p class="note">Simplified: this lab maps integration failure modes to ATT&amp;CK entities for vocabulary reinforcement; the ATT&amp;CK techniques themselves describe adversarial behavior, not integration engineering.</p>` },
    { id: "kc-4", title: "Glossary (15 terms)", open: false, body: `
      <dl class="glossary">
        ${GLOSSARY.map((g) => `<div class="plate-dark term-card"><dt>${esc(g.term)}</dt><dd>${esc(g.def)}</dd></div>`).join("")}
      </dl>` },
  ];
  $id("knowledge-core").innerHTML = `
    <section class="plate knowledge" aria-label="Knowledge core">
      <h2 class="etch sec-h2">${icon("book-open")} Knowledge core — card catalog</h2>
      <div class="acc">
        ${items.map((it, i) => `
          <div class="acc-item">
            <h3 style="margin:0">
              <button class="acc-trigger" aria-expanded="${it.open}" aria-controls="${it.id}-panel" data-acc="${i}">
                <span style="text-align:left">${esc(it.title)}</span>
                <svg class="icon i-14 chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS["chevron-down"]}</svg>
              </button>
            </h3>
            <div class="acc-panel ${it.open ? "open" : ""}" id="${it.id}-panel" role="region" aria-labelledby="">
              <div class="inner-clip"><div class="inner">${it.body}</div></div>
            </div>
          </div>`).join("")}
      </div>
    </section>`;
  document.querySelectorAll("#knowledge-core [data-acc]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = $id(btn.getAttribute("aria-controls"));
      const open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", open ? "false" : "true");
      panel.classList.toggle("open", !open);
    });
  });
}

// ═══════════════ Quiz gate (Study.tsx QuizGate) ═══════════════
function buildQuiz() {
  $id("quiz-gate").innerHTML = `
    <section class="plate quiz" aria-label="Knowledge check">
      <h2 class="etch sec-h2">${icon("graduation-cap")} QA gate — knowledge check <span id="quiz-mode-note"></span></h2>
      <div id="quiz-list" class="quiz-list"></div>
      <div id="quiz-foot"></div>
    </section>`;
  updateQuiz();
}

function updateQuiz() {
  const s = Lab.state;
  const qs = s.mode === "medium" ? QUIZ_M : QUIZ_H;
  $id("quiz-mode-note").textContent = `(${s.mode === "medium" ? "concept" : "scenario"})`;
  withFocusPreserved(() => {
    $id("quiz-list").innerHTML = qs.map((q, i) => {
      const picked = s.quiz[q.id];
      const isDone = s.quizDone;
      const pickedNum = picked !== undefined && picked !== null ? Number(picked) : null;
      return `
        <div class="plate-dark quiz-q">
          <p class="etch qnum">Q${i + 1}</p>
          ${q.scenario ? `<p class="tape-line scenario">${esc(q.scenario)}</p>` : ""}
          <p class="prompt">${esc(q.prompt)}</p>
          <div class="quiz-opts" role="radiogroup" aria-label="Question ${i + 1}">
            ${q.options.map((o, oi) => {
              const pickedThis = pickedNum === oi;
              // R3 color contract: after submit ONLY the picked option is highlighted —
              // green if correct, red if wrong; the correct answer is never revealed
              // unless actually picked (QA-1/L-1 fix).
              const pickedCorrect = isDone && pickedThis && oi === q.answer;
              const pickedWrong = isDone && pickedThis && oi !== q.answer;
              return `
                <div class="quiz-opt ${pickedCorrect ? "picked-correct" : ""} ${pickedWrong ? "picked-wrong" : ""}"
                     ${isDone && pickedThis ? `aria-label="${pickedCorrect ? "Your answer — correct" : "Your answer — wrong"}"` : ""}>
                  <input type="radio" name="quiz-${q.id}" id="${q.id}-${oi}" value="${oi}"
                         ${pickedNum === oi ? "checked" : ""} ${isDone ? "disabled" : ""} aria-label="${esc(o)}" />
                  <label for="${q.id}-${oi}">${esc(o)}</label>
                  ${pickedCorrect ? `<span class="mark">${icon("circle-check", "i-14")} CORRECT</span>` : ""}
                  ${pickedWrong ? `<span class="mark">${icon("circle-x", "i-14")} WRONG</span>` : ""}
                </div>`;
            }).join("")}
          </div>
          ${isDone ? `<p class="explain">${esc(q.explain)}</p>` : ""}
        </div>`;
    }).join("");
  });
  const answered = qs.every((q) => s.quiz[q.id] !== undefined && s.quiz[q.id] !== null);
  const correct = qs.filter((q) => s.quiz[q.id] === q.answer).length;
  $id("quiz-foot").innerHTML = !s.quizDone
    ? `<button id="submit-quiz" class="btn lg minh11 etch" ${answered ? "" : "disabled"}>${icon("clipboard-check")} SUBMIT KNOWLEDGE CHECK</button>`
    : `<p class="quiz-score">SCORE ${correct}/${qs.length} — explanations unlocked above.</p>`;
  const submit = $id("submit-quiz");
  if (submit) submit.addEventListener("click", () => Actions.submitQuiz());
  document.querySelectorAll("#quiz-list input[type=radio]").forEach((el) =>
    el.addEventListener("change", () => {
      Actions.setQuiz(el.name.replace("quiz-", ""), Number(el.value));
    }));
}

// ═══════════════ Debrief notes (Study.tsx DebriefNotes) ═══════════════
function buildDebrief() {
  $id("debrief").innerHTML = `
    <section class="plate debrief" aria-label="Handover notes">
      <h2 class="etch sec-h2">Handover notes — debrief</h2>
      <div class="debrief-body">
        <div>
          <h3 class="etch sec-h3 brass-text">Detection opportunities</h3>
          <div class="table-scroll">
            <table class="dtable">
              <thead><tr><th>Construct</th><th>Data sources</th><th>Example detection logic</th></tr></thead>
              <tbody>
                ${DETECTION_TABLE.map((r) => `
                  <tr>
                    <td style="font-weight:500">${esc(r.construct)}</td>
                    <td>${esc(r.sources)}</td>
                    <td class="tape-line mono">${esc(r.logic)}</td>
                  </tr>`).join("")}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h3 class="etch sec-h3 brass-text">Mitigation recommendations</h3>
          <ul class="mitigations">
            ${MITIGATION_LIST.map((m) => `<li><span>${esc(m.name)}</span><span class="badge outline etch">${esc(m.ids)}</span></li>`).join("")}
          </ul>
        </div>
        <div class="takeaways">
          <div class="plate-dark takeaway-box blue">
            <h3 class="etch">Blue-team takeaways</h3>
            <ul>${BLUE_TAKEAWAYS.map((t) => `<li>· ${esc(t)}</li>`).join("")}</ul>
          </div>
          <div class="plate-dark takeaway-box red">
            <h3 class="etch">Red-team mindset</h3>
            <ul>${RED_TAKEAWAYS.map((t) => `<li>· ${esc(t)}</li>`).join("")}</ul>
          </div>
        </div>
        <div>
          <h3 class="etch sec-h3 brass-text">Official references (open in new tab)</h3>
          <ul class="refs">
            ${LINKS.map((l) => `<li><a href="${esc(l.href)}" target="_blank" rel="noopener noreferrer">${icon("external-link", "i-12")} ${esc(l.label)}</a></li>`).join("")}
          </ul>
        </div>
        <p class="etch debrief-stamp">${esc(BRIEFING.stamp)}</p>
      </div>
    </section>`;
}

// ═══════════════ Modal system (Radix Dialog / AlertDialog equivalents) ═══════════════
// Minimal focus-trapping modal: overlay + centered box, ESC handling, outside
// click handling (optionally blocked), focus restore on close. Replaces the
// Radix portals used by RollDialog / reset AlertDialog / SignOff.
const Modal = {
  openEl: null,
  prevFocus: null,
  onClose: null,

  open(opts) {
    this.close(true); // safety: never stack two modals
    this.prevFocus = document.activeElement;
    const root = $id("modal-root");
    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <div class="dialog-overlay"></div>
      <div class="dialog-box ${opts.dialogClass || "narrow"}" role="${opts.role || "dialog"}" aria-modal="true"
           aria-labelledby="${opts.labelId || ""}">
        ${opts.contentHTML}
        ${opts.showClose === false ? "" : `<button class="dialog-close" aria-label="Close">${icon("x")}<span class="sr-only">Close</span></button>`}
      </div>`;
    root.appendChild(wrap);
    this.openEl = wrap;
    this.onClose = opts.onClose || null;
    this.blockOutside = opts.blockOutside === true; // completion modal: blocked until first seen

    const box = wrap.querySelector(".dialog-box");
    const overlay = wrap.querySelector(".dialog-overlay");

    const doClose = () => { this.close(); };
    const closeBtn = wrap.querySelector(".dialog-close");
    if (closeBtn) closeBtn.addEventListener("click", doClose);
    overlay.addEventListener("pointerdown", () => {
      if (!this.blockOutside) doClose();
      // while blocked (completion modal not yet seen): stay open — same as
      // Radix onPointerDownOutside preventDefault in SignOff.tsx
    });
    this._keyHandler = (e) => {
      if (e.key === "Escape") { e.preventDefault(); doClose(); }
      if (e.key === "Tab") this._trapTab(e, box);
    };
    document.addEventListener("keydown", this._keyHandler, true);
    // initial focus
    const focusables = this._focusables(box);
    (focusables[0] || box).focus();
    return box;
  },

  close(silent) {
    if (!this.openEl) return;
    document.removeEventListener("keydown", this._keyHandler, true);
    this.openEl.remove();
    this.openEl = null;
    const cb = this.onClose;
    this.onClose = null;
    if (!silent && cb) cb();
    if (this.prevFocus && typeof this.prevFocus.focus === "function") this.prevFocus.focus();
  },

  _focusables(box) {
    return [...box.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
      .filter((el) => !el.disabled && el.offsetParent !== null);
  },

  _trapTab(e, box) {
    const els = this._focusables(box);
    if (els.length === 0) return;
    const first = els[0];
    const last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  },
};

// ── Reset confirmation (Chrome.tsx AlertDialog) ──
function openResetConfirm() {
  const box = Modal.open({
    role: "alertdialog",
    dialogClass: "narrow reset-dialog",
    labelId: "reset-title",
    showClose: false, // shadcn AlertDialog has no X button
    contentHTML: `
      <div class="dialog-head">
        <h2 id="reset-title" class="dialog-title etch" style="font-size:14px">Pull every cord and wipe the run sheet?</h2>
        <p class="dialog-desc" style="color:var(--ink-soft)">This restores the pristine board: mode, objectives, quiz, tape — everything resets. This cannot be undone.</p>
      </div>
      <div class="dialog-actions">
        <button id="reset-cancel" class="btn outline minh11">KEEP MY SHIFT</button>
        <button id="reset-confirm" class="btn minh11">RESET THE EXCHANGE</button>
      </div>`,
  });
  box.querySelector("#reset-cancel").addEventListener("click", () => Modal.close());
  box.querySelector("#reset-confirm").addEventListener("click", () => {
    Actions.resetAll();
    Modal.close(true); // resetAll triggers full re-render; close without re-notify side effects
  });
}

// ── Evidence roll dialog (TapeRoom.tsx RollDialog) ──
function openRollDialog(inc) {
  const s = Lab.state;
  const locked = causeLocked(inc.id);
  let activeEv = inc.evidence[0].id;
  const renderTabs = () => `
    <div class="tabs-list ev-tabs" role="tablist" aria-label="Evidence tapes">
      ${inc.evidence.map((e) => `
        <button role="tab" data-evtab="${e.id}" aria-selected="${activeEv === e.id}" tabindex="${activeEv === e.id ? "0" : "-1"}" class="tab">
          ${esc(e.title)}
        </button>`).join("")}
    </div>
    ${inc.evidence.map((e) => `
      <div role="tabpanel" data-evpanel="${e.id}" ${activeEv === e.id ? "" : "hidden"}>
        <pre class="ev-pre exchange-scroll">${esc(e.body)}</pre>
      </div>`).join("")}`;
  const box = Modal.open({
    dialogClass: "wide roll-dialog",
    labelId: "roll-title",
    contentHTML: `
      <div class="dialog-head">
        <h2 id="roll-title" class="dialog-title etch" style="font-size:14px">EVIDENCE · ${esc(inc.title)}</h2>
        <p class="dialog-desc xs">${esc(BRIEFING.stamp)} — read every tape, then pick the root cause.</p>
      </div>
      <div class="ev-tabs-wrap">${renderTabs()}</div>
      <div>
        <p class="etch cause-title brass-text">Root cause</p>
        <div class="cause-list" role="radiogroup" aria-label="Root cause">
          ${inc.causeOptions.map((o) => `
            <div class="radio-row plate-dark on-dark">
              <input type="radio" name="cause-${inc.id}" id="cause-${inc.id}-${o.id}" value="${o.id}"
                     ${s.found[inc.id] === o.id ? "checked" : ""} ${locked ? "disabled" : ""} data-cause="${o.id}" />
              <label for="cause-${inc.id}-${o.id}">${esc(o.label)}</label>
            </div>`).join("")}
          ${locked ? lockedNoteHTML() : ""}
        </div>
      </div>`,
  });
  const rerenderTabs = () => { box.querySelector(".ev-tabs-wrap").innerHTML = renderTabs(); wireEvTabs(); };
  const wireEvTabs = () => {
    wireTabKeyboard(box.querySelector(".ev-tabs"), (v) => { activeEv = v; rerenderTabs(); });
    box.querySelectorAll("[data-evtab]").forEach((t) =>
      t.addEventListener("click", () => { activeEv = t.getAttribute("data-evtab"); rerenderTabs(); }));
  };
  wireEvTabs();
  box.querySelectorAll("[data-cause]").forEach((el) =>
    el.addEventListener("change", () => Actions.setFound(inc.id, el.value)));
}

// ═══════════════ Sign-off report (SignOff.tsx) ═══════════════
const PILLARS = [
  { key: "P1", label: "UNDERSTAND" },
  { key: "P2", label: "ANALYZE" },
  { key: "P3", label: "DETECT" },
  { key: "P4", label: "MITIGATE" },
];
const PILLAR_TOPIC = {
  P1: "pattern selection and coupling",
  P2: "root-cause analysis from raw evidence",
  P3: "detection engineering and alert triage",
  P4: "mitigation selection and residual risk",
};

function signOffData() {
  const s = Lab.state;
  const defs = currentObjectives();
  const quizQs = s.mode === "medium" ? QUIZ_M : QUIZ_H;
  const done = defs.filter((d) => objDone(d.id)).length;
  const total = defs.length;
  const allDone = total > 0 && done === total;
  const hints = Object.values(s.obj).reduce((a, o) => a + (o?.hints ?? 0), 0);
  const attempts = Object.values(s.obj).reduce((a, o) => a + (o?.attempts ?? 0), 0);
  const nudges = Object.values(s.nudged).filter(Boolean).length;
  const quizCorrect = quizQs.filter((q) => s.quiz[q.id] === q.answer).length;
  const star = stars(done, total, hints, attempts, nudges);
  const score = Math.round((done / total) * 60 + (s.quizDone ? (quizCorrect / quizQs.length) * 40 : 0));

  // R8: focus areas derived from THIS student's actual evidence, not generic filler
  const focus = [];
  if (s.quizDone) {
    quizQs.forEach((q, i) => {
      if (s.quiz[q.id] !== q.answer) {
        focus.push({
          area: q.topic,
          why: `Knowledge check Q${i + 1} on \u201C${q.topic}\u201D was missed.`,
          action: "Re-read the matching card in the Knowledge core, then explain the answer out loud before moving on.",
        });
      }
    });
  }
  const retried = defs
    .filter((d) => (s.obj[d.id]?.attempts ?? 0) > 1)
    .sort((a, b) => (s.obj[b.id]?.attempts ?? 0) - (s.obj[a.id]?.attempts ?? 0))
    .slice(0, 3);
  retried.forEach((d) => {
    focus.push({
      area: `${d.id} — ${PILLAR_TOPIC[d.pillar]}`,
      why: `${d.id} took ${s.obj[d.id]?.attempts} attempts before sign-off.`,
      action: `Re-run ${d.id}'s step in the other difficulty mode without re-reading the hints; the check must pass first try.`,
    });
  });
  const hinted = defs.filter((d) => (s.obj[d.id]?.hints ?? 0) > 0 || s.nudged[d.id]);
  if (hinted.length > 0) {
    focus.push({
      area: hinted.map((d) => d.id).join(", "),
      why: hints + nudges > 0 ? `${hints + nudges} hint${hints + nudges === 1 ? "" : "s"}/nudge${hints + nudges === 1 ? "" : "s"} were pulled before signing off these objectives.` : "",
      action: "These objectives leaned on hints — test recall by re-running this mode with a clean RESET and zero hint pulls.",
    });
  }
  if (!s.quizDone) {
    focus.push({
      area: "Knowledge check",
      why: "The QA gate has not been submitted yet — the score above only reflects the run sheet.",
      action: "Submit the knowledge check below to complete the shift record.",
    });
  }
  if (focus.length === 0) {
    focus.push({
      area: "No weak areas detected",
      why: "Every objective passed first try, no hints were pulled, and the knowledge check is clean.",
      action: "Consolidate: run the other difficulty mode — the board is the same, the fight is not.",
    });
  }
  return { done, total, allDone, hints, attempts, nudges, quizCorrect, star, score, focus, quizQs };
}

function openSignOff() {
  const d = signOffData();
  const s = Lab.state;
  const starStr = "★".repeat(Math.floor(d.star)) + (d.star % 1 !== 0 ? "½" : "") + "☆".repeat(5 - Math.ceil(d.star));
  const box = Modal.open({
    dialogClass: "report",
    labelId: "signoff-title",
    blockOutside: !s.completedSeen,
    onClose: () => Actions.markCompletedSeen(),
    contentHTML: `
      <div class="dialog-head">
        <h2 id="signoff-title" class="dialog-title etch" style="font-size:16px">Exchange sign-off</h2>
        <p class="dialog-desc xs" style="color:var(--ink-soft)">
          ${d.allDone
            ? "Every objective signed off. Here is your shift record."
            : `Progress report — ${d.done}/${d.total} objectives signed off. Keep going, engineer.`}
        </p>
      </div>
      <div class="report-score">
        <p class="pct">${d.score}%</p>
        <p class="stars" aria-label="${d.star} of 5 stars">${starStr}</p>
        <p class="meta">run sheet ${d.done}/${d.total} · knowledge check ${s.quizDone ? `${d.quizCorrect}/${d.quizQs.length}` : "not submitted"} · hints ${d.hints} · nudges ${d.nudges}</p>
      </div>
      <div class="pillar-grid">
        ${PILLARS.map((p) => {
          const pd = currentObjectives().filter((x) => x.pillar === p.key && objDone(x.id)).length;
          const pt = currentObjectives().filter((x) => x.pillar === p.key).length;
          return `<div class="plate-dark pillar-cell"><p class="etch name">${p.label}</p><p class="count">${pd}/${pt} objectives</p></div>`;
        }).join("")}
      </div>
      <div class="plate-dark report-block">
        <p class="etch head">${icon("crosshair", "i-14")} Focus areas — from your own evidence</p>
        <ul class="focus-list">
          ${d.focus.map((f) => `
            <li><span class="area">${esc(f.area)}</span>${f.why ? `<span class="why"> — ${esc(f.why)}</span>` : ""}
              <span class="action">→ ${esc(f.action)}</span></li>`).join("")}
        </ul>
      </div>
      <div class="plate-dark report-block">
        <p class="etch head">What to learn next</p>
        <ul class="next-list">
          <li>· CV0-004 Objective 5.2 — source control: where the leaked key in ROLL-E came from.</li>
          <li>· CV0-004 Objective 5.3 — CI/CD pipelines: your runbook automation feeds from them.</li>
          <li>· CV0-004 Objective 5.5 — DevOps tools (Kubernetes, Ansible, Jenkins): where each tool plugs into this board.</li>
          <li>· CV0-004 Objective 5.6 — event-driven architecture &amp; serverless: queues at production scale.</li>
          <li>· Security+ SY0-701 identity concepts — federation and secret management deepen the security lens.</li>
        </ul>
      </div>
      <div class="report-foot">
        <span class="badge outline etch">synthetic training data — fictional org</span>
        <button id="signoff-close" class="btn minh11">CLOSE SHIFT RECORD</button>
      </div>`,
  });
  box.querySelector("#signoff-close").addEventListener("click", () => Modal.close());
}

// ═══════════════ Floating sign-off button (SignOff.tsx DialogTrigger) ═══════════════
function buildFab() {
  $id("signoff-fab").innerHTML = `<button class="signoff-fab" id="signoff-open" aria-label="Open sign-off report"></button>`;
  $id("signoff-open").addEventListener("click", () => openSignOff());
  updateFab();
}

function updateFab() {
  const d = signOffData();
  const fab = $id("signoff-open");
  fab.classList.toggle("all-done", d.allDone);
  fab.innerHTML = `${icon("stamp", "i-14")} SIGN-OFF ${d.done}/${d.total}`;
}
