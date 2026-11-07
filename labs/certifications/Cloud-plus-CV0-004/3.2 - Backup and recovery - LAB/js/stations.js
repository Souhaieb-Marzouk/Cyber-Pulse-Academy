// ── stations.js — the four working stations (Planner, Vault, Drill, Evidence) ─
// Ported 1:1 from src/components/lab/stations/*.tsx. Local UI state (selected
// artifact, open document) resets when the student leaves a station, exactly
// like React unmount behavior in the original.

// Local (non-persisted) view state — mirrors useState in the original.
const localView = {
  verificationSelected: null,
  verificationAnimated: false,
  evidenceDocId: null,
  seqLastPlaced: null,
};

/** Called when the active station changes: reset ephemeral view state. */
function resetLocalView() {
  localView.verificationSelected = null;
  localView.verificationAnimated = false;
  localView.evidenceDocId = null;
  localView.seqLastPlaced = null;
}

function renderStation() {
  const root = document.getElementById("station-root");
  if (!root) return;
  resetLocalViewIfStationChanged();
  const s = state.activeStation;
  let html = "";
  if (s === "planner") html = plannerStation();
  else if (s === "vault") html = vaultStation();
  else if (s === "drill") html = drillStation();
  else if (s === "evidence") html = evidenceStation();
  else if (s === "quiz") html = quizPhase();       // quiz.js
  else if (s === "debrief") html = debriefPhase(); // app.js
  root.innerHTML = `<div class="fade-rise">${html}</div>`;
  bindTermTooltips(root);
  startStopStationTimers();
}

let lastRenderedStation = null;
function resetLocalViewIfStationChanged() {
  if (lastRenderedStation !== state.activeStation) {
    resetLocalView();
    lastRenderedStation = state.activeStation;
  }
}

// ═══════════════════════════════ STATION 01 · PLANNER ═══════════════════════
function selectControl(opts) {
  // opts: { ariaLabel, map, key, cell, asset, copy, field, slot, options:[{id,label}], placeholder, cls, empty }
  const attrs = [
    `aria-label="${esc(opts.ariaLabel)}"`,
    `class="sel ${opts.cls || ""}"`,
    "data-select",
  ];
  let value = "";
  if (opts.map) { attrs.push(`data-map="${opts.map}"`, `data-key="${esc(opts.key)}"`); value = state.env[opts.map][opts.key] || ""; }
  else if (opts.cell) { attrs.push(`data-cell="${opts.cell}"`, `data-asset="${esc(opts.asset)}"`); const cur = state.env.planHard[opts.asset]; value = cur ? (cur[opts.cell] || "") : ""; }
  else if (opts.copy) { attrs.push(`data-copy="${esc(opts.copy)}"`); value = state.env.copyTargets[opts.copy] || ""; }
  else if (opts.field) { attrs.push(`data-field="${esc(opts.field)}"`); value = state.env[opts.field] || ""; }
  else if (opts.slot != null) { attrs.push(`data-slot="${opts.slot}"`, `data-field="h2Lines"`); value = (state.env.h2Lines[opts.slot]) || ""; }
  const ph = opts.placeholder || "Select…";
  return `
    <select ${attrs.join(" ")} data-empty="${value ? "false" : "true"}">
      <option value="" disabled ${value ? "" : "selected"}>${esc(ph)}</option>
      ${opts.options.map((o) => `<option value="${esc(o.id)}" ${value === o.id ? "selected" : ""}>${esc(o.label)}</option>`).join("")}
    </select>`;
}

function plannerStation() {
  const hard = state.mode === "hard";
  return `
    <div class="stack">
      ${stationHeader("01 · PLANNER", "Backup Planner", "Where frequency meets business impact — and where the recovery math is decided.")}
      ${hard ? plannerHard() : plannerMedium()}
    </div>`;
}

function plannerMedium() {
  const jobRows = JOBS.map((j) => `
    <tr>
      <td class="td mono teal-200-text">${esc(j.id)}</td>
      <td class="td slate-400-text">${esc(j.day)} ${esc(j.time)}</td>
      <td class="td mono slate-300-text">${esc(j.size)}</td>
      <td class="td slate-400-text">${esc(j.note)}</td>
      <td class="td">${selectControl({ ariaLabel: `Backup type for ${j.id}`, map: "jobTypes", key: j.id, options: JOB_TYPES, placeholder: "Type…" })}</td>
    </tr>`).join("");

  const assetRows = ASSETS.map((a) => `
    <div class="row-card">
      <div class="row-card-main">
        <div class="row-name">${esc(a.name)}</div>
        <div class="row-sub">${esc(a.kind)}</div>
      </div>
      ${selectControl({ ariaLabel: `Recovery tier for ${a.name}`, map: "assetTiers", key: a.id, options: TIERS.map((t) => ({ id: t.id, label: `${t.id} · RPO ${t.rpo} / RTO ${t.rto}` })), placeholder: "Tier…", cls: "sel-wide" })}
    </div>`).join("");

  const tierLegend = TIERS.map((t) => `
    <div class="legend-box"><span class="mono teal-300-text">${t.id}</span> · RPO ${t.rpo} / RTO ${t.rto} — ${t.gloss}</div>`).join("");

  const drRows = DR_BUS.map((b) => `
    <div class="row-card">
      <div class="row-card-main">
        <div class="row-name">${esc(b.name)}</div>
        <div class="row-sub">${esc(b.note)}</div>
      </div>
      ${selectControl({ ariaLabel: `DR site type for ${b.name}`, map: "drSites", key: b.id, options: DR_SITES.map((s) => ({ id: s.id, label: s.label })), placeholder: "Site…" })}
    </div>`).join("");

  return `
    ${panelCard(`
      ${panelTitle("schedule grid", "This week's scheduled jobs", synthTag())}
      <div class="table-wrap">
        <table class="jobs-table">
          <thead>
            <tr>
              <th>Job</th><th>Window</th><th>Volume</th><th>What the agent reports</th><th>Type</th>
            </tr>
          </thead>
          <tbody>${jobRows}</tbody>
        </table>
      </div>
      <div class="legend-grid">
        ${JOB_TYPES.map((t) => `<div class="legend-box"><span class="mono legend-tag">${esc(t.label)}</span> — ${esc(t.def)}</div>`).join("")}
      </div>
      ${checkRow("OBJ-M1")}
    `)}
    ${panelCard(`
      ${panelTitle("impact table", "Business impact — recovery tiers")}
      <p class="panel-intro">Assign each asset the tier whose ${term("RPO")} / ${term("RTO")} pair a sensible retailer would buy. Tier definitions below.</p>
      <div class="stack-sm">${assetRows}</div>
      <div class="legend-grid">${tierLegend}</div>
      ${checkRow("OBJ-M2", "Check the tiers")}
    `)}
    ${panelCard(`
      ${panelTitle("continuity map", "DR site tiering")}
      <p class="panel-intro">One site tier per business unit. ${DR_SITES.map((s) => `${esc(s.label)}: ${esc(s.def)}`).join(" ")}</p>
      <div class="stack-sm">${drRows}</div>
      ${checkRow("OBJ-M11", "Check the map")}
    `)}`;
}

function plannerHard() {
  const cards = PLAN_ASSETS.map((a) => {
    const row = (list, cell, label) => `
      <div class="plan-row">
        <span class="plan-label">${esc(label)}</span>
        ${selectControl({ ariaLabel: `${label} for ${a.name}`, cell, asset: a.id, options: list, placeholder: "Select…", cls: "sel-grow" })}
      </div>`;
    return `
      <div class="plan-card">
        <div class="plan-card-head">
          <span class="row-name-strong">${esc(a.name)}</span>
          <span class="badge badge-xs badge-teal">RPO ${esc(a.rpo)} · RTO ${esc(a.rto)}</span>
        </div>
        <div class="stack-sm">
          ${row(PLAN_OPTIONS.freq, "freq", "frequency")}
          ${row(PLAN_OPTIONS.repl, "repl", "replication")}
          ${row(PLAN_OPTIONS.media, "media", "copy media")}
        </div>
      </div>`;
  }).join("");

  return panelCard(`
    ${panelTitle("rebuild plan", "Re-architect to the stated RPO/RTO", `<span class="badge badge-xs badge-rose">post-incident</span>`)}
    <div class="constraints-box">
      <span class="micro-label amber-300-text">Constraints</span>
      <ul class="disc-list">
        <li>Cross-region traffic capped at 500 GB / night.</li>
        <li>No budget for a second datacenter or hot site this year.</li>
        <li>Production media must not be the only copy (this week proved that).</li>
      </ul>
    </div>
    ${cards}
    ${checkRow("OBJ-H3", "Submit the plan")}
  `);
}

// ═══════════════════════════════ STATION 02 · VAULT ═════════════════════════
function vaultStation() {
  const medium = state.mode === "medium";
  return `
    <div class="stack">
      ${stationHeader("02 · VAULT", "The Vault", "Copies, seals and rotation — the room ransomware wants to burn first.")}
      ${medium ? `
        ${copyMatrix()}
        ${verificationRunner()}
        ${tapeRack()}
        ${hardeningPanel()}
        ${pagingConsole()}
      ` : `
        ${controlBundle()}
        ${alertTriage()}
      `}
    </div>`;
}

function copyMatrix() {
  const cards = COPIES.map((c) => {
    const target = state.env.copyTargets[c.id] != null ? state.env.copyTargets[c.id] : c.startTarget;
    const locked = state.env.copyLocks[c.id] != null ? state.env.copyLocks[c.id] : c.startLock;
    return `
      <div class="copy-card">
        <div class="mono copy-label">${esc(c.label)}</div>
        <div class="copy-meta">${esc(c.media)} · ${esc(c.site)}</div>
        <div class="mt-8">${seal(locked, c.label)}</div>
        <div class="stack-sm mt-12">
          ${selectControl({ ariaLabel: `Storage target for ${c.label}`, copy: c.id, options: COPY_TARGETS, cls: "sel-slim" })}
          <label class="worm-row">
            <span class="worm-text">Object lock (WORM)</span>
            <button type="button" role="switch" aria-checked="${locked}" aria-label="Object lock for ${esc(c.label)}" class="switch" data-action="worm" data-copy="${esc(c.id)}" data-focus-key="worm-${esc(c.id)}"><span class="switch-thumb"></span></button>
          </label>
        </div>
      </div>`;
  }).join("");
  return panelCard(`
    ${panelTitle("copy matrix", `3-2-1-1-0 audit`, synthTag())}
    <p class="panel-intro">The rule: ${term("3-2-1-1-0")} — 3 copies, 2 media types, 1 offsite, 1 immutable/offline, 0 verification errors. Re-point COPY-2 to the cross-region archive and seal COPY-3 with ${term("object lock")}; keep COPY-1 local for fast restores.</p>
    <div class="copy-grid">${cards}</div>
    ${checkRow("OBJ-M9", "Audit the vault")}
  `);
}

function verificationRunner() {
  const ran = state.env.verificationRan;
  const sel = localView.verificationSelected;
  let body;
  if (!ran) {
    body = `
      <button type="button" class="btn btn-amber" data-action="verify-run" data-focus-key="verify-run">Run verification</button>`;
  } else {
    const rows = VERIFICATION_ARTIFACTS.map((a, i) => {
      const isSel = sel === a.id;
      const quarantined = state.env.quarantined.includes(a.id);
      return `
        <button type="button" data-action="verify-select" data-artifact="${esc(a.id)}" aria-pressed="${isSel}"
          aria-label="Artifact ${esc(a.id)} ${esc(a.label)}, ${a.ok ? "hashes match" : "checksum mismatch"}"
          class="verify-row ${isSel ? "selected" : ""} ${quarantined ? "quarantined" : ""} ${localView.verificationAnimated ? "anim-stagger" : ""}"
          style="${localView.verificationAnimated ? `animation-delay:${i * 120}ms` : ""}" data-focus-key="verify-${esc(a.id)}">
          <span class="vid">${esc(a.id)}</span>
          <span class="vlabel">${esc(a.label)}</span>
          <span class="vhash ${a.ok ? "slate-500-text" : "rose-300-text"}">${esc(a.manifest)}</span>
          <span class="vvs">vs</span>
          <span class="vhash ${a.ok ? "slate-500-text" : "rose-300-text"}">${esc(a.stored)}</span>
          <span class="vpill ${a.ok ? "pill-ok" : "pill-bad"}">${a.ok ? "match" : "mismatch"}</span>
          ${quarantined ? `<span class="vpill pill-hold">quarantined</span>` : ""}
        </button>`;
    }).join("");
    body = `
      <div role="status" aria-live="polite" aria-label="Verification results">
        <div class="verify-list">${rows}</div>
        <div class="verify-actions">
          <button type="button" class="btn btn-outline-rose btn-sm" data-action="verify-quarantine" ${sel ? "" : "disabled"} data-focus-key="verify-quarantine">
            ${sel && state.env.quarantined.includes(sel) ? "Return to rotation" : "Quarantine selected"}
          </button>
          <span class="hint-line">${sel ? `Selected: ${esc(sel)}` : "Click an artifact row to select it."}</span>
        </div>
      </div>`;
  }
  return panelCard(`
    ${panelTitle("integrity seals", "Verification sweep")}
    <p class="panel-intro">The weekly sweep compares each stored copy against its SHA-256 manifest — the &ldquo;0 errors&rdquo; of 3-2-1-1-0. Run it, find the mismatch, quarantine the bad artifact.</p>
    ${body}
    ${checkRow("OBJ-M7")}
  `);
}

function tapeRack() {
  const cards = TAPES.map((t) => {
    const cur = state.env.tapeLabels[t.id] || "";
    const btn = (L) => {
      const on = cur === L;
      const tone = on ? (L === "HOLD" ? "tape-on-hold" : "tape-on") : "";
      const spoken = L === "D" ? "daily" : L === "W" ? "weekly" : L === "M" ? "monthly" : "legal hold";
      return `<button type="button" aria-pressed="${on}" aria-label="Mark ${esc(t.id)} as ${spoken}" class="tape-btn ${tone}" data-action="tape" data-tape="${esc(t.id)}" data-label="${L}" data-focus-key="tape-${esc(t.id)}-${L}">${L}</button>`;
    };
    return `
      <div class="tape-card ${t.id === "T-15" ? "sealed" : ""}">
        <div class="tape-top">
          <span class="mono teal-200-text tape-id">${esc(t.id)}</span>
          <span class="tape-slot">${esc(t.slot)}</span>
        </div>
        <div class="tape-used">${esc(t.used)}</div>
        <div class="tape-btns" role="group" aria-label="Label for tape ${esc(t.id)}">${TAPE_LABELS.map(btn).join("")}</div>
      </div>`;
  }).join("");
  return panelCard(`
    ${panelTitle("tape rack", `${term("GFS rotation")}`)}
    <p class="panel-intro">${esc(TAPE_PLAN.rule)} Label every slot.</p>
    <div class="tape-grid">${cards}</div>
    ${checkRow("OBJ-M10", "Check the rack")}
  `);
}

function hardeningPanel() {
  const rows = HARDENING_SWITCHES.map((sw) => {
    const on = state.env.hardening[sw.id] || false;
    return `
      <label class="hard-row ${on ? "on" : ""}">
        <button type="button" role="switch" aria-checked="${on}" aria-label="${esc(sw.label)}" class="switch mt-2" data-action="hardening" data-id="${esc(sw.id)}" data-focus-key="hard-${esc(sw.id)}"><span class="switch-thumb"></span></button>
        <span>
          <span class="hard-text">${esc(sw.label)}</span>
          <span class="hard-detail">${esc(sw.detail)}</span>
        </span>
      </label>`;
  }).join("");
  return panelCard(`
    ${panelTitle("hardening", "Backup estate controls")}
    <p class="panel-intro">Switch ON what the estate needs; leave the traps OFF. This is where the exam's security objectives meet the backup world.</p>
    <div class="stack-sm">${rows}</div>
    ${checkRow("OBJ-M12", "Check the panel")}
  `);
}

function pagingConsole() {
  const cards = PAGER_EVENTS.map((e) => {
    const on = state.env.pager.includes(e.id);
    return `
      <button type="button" aria-pressed="${on}" data-action="chip" data-field="pager" data-id="${esc(e.id)}" class="pager-btn ${on ? "on" : ""}" data-focus-key="pager-${esc(e.id)}">
        <span class="pager-head"><span class="pager-dot ${on ? "on" : ""}" aria-hidden="true"></span><span class="pager-label">${esc(e.label)}</span></span>
        <span class="pager-detail">${esc(e.detail)}</span>
      </button>`;
  }).join("");
  return panelCard(`
    ${panelTitle("paging console", "What wakes the on-call engineer?")}
    <p class="panel-intro">Select every event that should <span class="rose-300-text">page a human at 03:00</span>. Routine receipts belong to reports, not pagers — but miss a destructive event and the incident runs unattended.</p>
    <div class="pager-grid">${cards}</div>
    ${checkRow("OBJ-M8", "Check the policy")}
  `);
}

function controlBundle() {
  const rows = BUNDLE_OPTIONS.map((o) => {
    const on = state.env.bundleHard.includes(o.id);
    return `
      <button type="button" aria-pressed="${on}" data-action="chip" data-field="bundleHard" data-id="${esc(o.id)}" class="option-btn ${on ? "on" : ""}" data-focus-key="bundle-${esc(o.id)}">
        <span class="box ${on ? "on" : ""}" aria-hidden="true"></span>
        <span class="option-text"><span class="mono option-id">${esc(o.id)}</span> — ${esc(o.label)}</span>
      </button>`;
  }).join("");
  return panelCard(`
    ${panelTitle("control selection", "The compliance bundle", `<span class="badge badge-xs badge-amber">constraints active</span>`)}
    <div class="constraints-box"><ul class="disc-list">${BUNDLE_CONSTRAINTS.map((c) => `<li>${esc(c)}</li>`).join("")}</ul></div>
    <p class="panel-intro tight">Select the exact set of controls that satisfies all three constraints at once.</p>
    <div class="stack-sm">${rows}</div>
    ${checkRow("OBJ-H6", "Submit the bundle")}
  `);
}

function alertTriage() {
  const buckets = ["PAGE", "TICKET", "SUPPRESS"];
  const cards = ALERT_SCENARIOS.map((a) => {
    const cur = state.env.alertTriage[a.id] || "";
    const btns = buckets.map((b) => {
      const on = cur === b;
      return `<button type="button" aria-pressed="${on}" data-action="triage" data-alert="${esc(a.id)}" data-bucket="${b}" class="triage-btn ${on ? (b === "PAGE" ? "on-page" : b === "TICKET" ? "on-ticket" : "on-suppress") : ""}" data-focus-key="triage-${esc(a.id)}-${b}">${b}</button>`;
    }).join("");
    return `
      <div class="row-card plain">
        <div class="triage-text"><span class="mono option-id">${esc(a.id)}</span> — ${esc(a.text)}</div>
        <div class="triage-btns" role="group" aria-label="Triage for ${esc(a.id)}">${btns}</div>
      </div>`;
  }).join("");
  return panelCard(`
    ${panelTitle("alert triage", "Duty lead's pager tuning")}
    <p class="panel-intro">Three buckets: <span class="rose-300-text">PAGE</span> = wake a human now · <span class="amber-300-text">TICKET</span> = handle tomorrow · <span class="slate-400-text">SUPPRESS</span> = tune out entirely.</p>
    <div class="stack-sm">${cards}</div>
    ${checkRow("OBJ-H7", "Check the triage")}
  `);
}

// ═══════════════════════════════ STATION 03 · DRILL FLOOR ═══════════════════
function drillStation() {
  const hard = state.mode === "hard";
  return `
    <div class="stack">
      ${stationHeader("03 · DRILL FLOOR", "Recovery Drill Floor", hard ? "The clock is fictional. The order is not." : "Where restore math and attacker thinking meet.")}
      ${hard ? `${restoreSequencer()}${breachCalculator()}` : `${threatBoard()}${restoreWorkbench()}`}
    </div>`;
}

function threatBoard() {
  const motives = ATTACK_REASONS.map((r) => {
    const on = state.env.attackReasons.includes(r.id);
    return `
      <button type="button" aria-pressed="${on}" data-action="chip" data-field="attackReasons" data-id="${esc(r.id)}" class="option-btn ${on ? "on" : ""}" data-focus-key="motive-${esc(r.id)}">
        <span class="box ${on ? "on" : ""}" aria-hidden="true"></span>
        <span class="option-text"><span class="mono option-id">${esc(r.id)}</span> — ${esc(r.text)}</span>
      </button>`;
  }).join("");
  const breakers = IMMUTABLE_REASONS.map((r) => {
    const on = state.env.immutableReason === r.id;
    return `
      <button type="button" role="radio" aria-checked="${on}" data-action="breaker" data-id="${esc(r.id)}" class="option-btn breaker ${on ? "on-amber" : ""}" data-focus-key="breaker-${esc(r.id)}">
        <span class="dot ${on ? "on" : ""}" aria-hidden="true"></span>
        <span class="option-text"><span class="mono option-id amber-id">${esc(r.id)}</span> — ${esc(r.text)}</span>
      </button>`;
  }).join("");
  return panelCard(`
    ${panelTitle("threat board", "Why attackers hit the backup estate first", synthTag())}
    <p class="panel-intro">Select the <span class="teal-300-text">TWO motives</span> (checkboxes) and the <span class="amber-300-text">ONE defense</span> that breaks the play (radio). MITRE ATT&amp;CK references below open in a new tab.</p>
    <div class="stack-sm">${motives}</div>
    <div class="stack-sm mt-12" role="radiogroup" aria-label="The defense that breaks the play">
      <div class="micro-label slate-dim">The breaker — pick one</div>
      ${breakers}
    </div>
    ${checkRow("OBJ-M3", "Check the board")}
  `);
}

function restoreWorkbench() {
  const chips = JOBS.map((j) => {
    const on = state.env.restoreSet.includes(j.id);
    return `
      <button type="button" aria-pressed="${on}" data-action="chip" data-field="restoreSet" data-id="${esc(j.id)}" class="chip-btn ${on ? "on" : ""}" data-focus-key="jobchip-${esc(j.id)}">${esc(j.id)} · ${esc(j.day)} ${esc(j.time)}</button>`;
  }).join("");
  return panelCard(`
    ${panelTitle("restore workbench", "Assemble the minimal restore set")}
    <div class="incident-box"><span class="micro-label rose-300-text">Incident</span> — ${esc(RESTORE_INCIDENT.when)}: ${esc(RESTORE_INCIDENT.what)}</div>
    <p class="panel-intro tight">Select every job required to restore to Thursday 09:45 — and nothing more.</p>
    <div class="chip-wrap">${chips}</div>
    ${checkRow("OBJ-M6", "Check the set")}
  `);
}

function restoreSequencer() {
  const placed = state.env.drillSteps.map((id, i) => {
    const step = DRILL_STEPS.find((s) => s.id === id);
    return `
      <li class="${id === localView.seqLastPlaced ? "anim-drop" : ""}">
        <button type="button" data-action="seq-remove" data-index="${i}" aria-label="Remove step ${i + 1}: ${esc(step ? step.text : "")}" class="seq-item" data-focus-key="seq-${i}">
          <span class="seq-num">${i + 1}</span>
          ${esc(step ? step.text : "")}
          <span class="seq-remove">remove</span>
        </button>
      </li>`;
  }).join("");
  const pool = DRILL_STEPS.filter((s) => !state.env.drillSteps.includes(s.id)).map((s) =>
    `<button type="button" data-action="seq-place" data-step="${esc(s.id)}" class="step-pool-btn" data-focus-key="pool-${esc(s.id)}">+ ${esc(s.text)}</button>`
  ).join("");
  return panelCard(`
    ${panelTitle("restore sequencer", "Execute the file-share restore",
      `<span class="mono rose-300-text" id="rto-budget" aria-label="RTO budget remaining (cosmetic pressure, not scored)"></span>`)}
    <p class="panel-intro">Click runbook steps in execution order. A wrong order is rejected with the defender's reason. Click a placed step to remove it.</p>
    <ol class="seq-list" aria-label="Execution order so far">
      ${placed || `<li class="seq-empty">Sequence empty — add steps from the pool below.</li>`}
    </ol>
    <div class="chip-wrap">${pool}</div>
    ${state.env.drillSteps.length > 0 ? `<button type="button" class="btn btn-ghost btn-xs mt-12" data-action="seq-clear">Clear sequence</button>` : ""}
    ${checkRow("OBJ-H4", "Submit the sequence")}
  `);
}

function breachCalculator() {
  return panelCard(`
    ${panelTitle("breach calculator", "Quantify the payment-DB data loss")}
    <div class="calc-box"><ul class="disc-list">${BREACH_FACTS.map((f) => `<li>${esc(f)}</li>`).join("")}</ul></div>
    <div class="stack">
      <div>
        <label for="breach-hours" class="field-label">Hours of data loss (decimal)</label>
        <input id="breach-hours" type="text" inputmode="decimal" placeholder="e.g. 0.75" value="${esc(state.env.breachHours)}"
               class="text-input mono" data-input data-field="breachHours" data-focus-key="breach-hours" />
      </div>
      <div>
        <span class="field-label">Recovery method</span>
        ${selectControl({ ariaLabel: "Recovery method", field: "breachMethod", options: BREACH_METHODS, placeholder: "Select method…", cls: "sel-tall" })}
      </div>
    </div>
    ${checkRow("OBJ-H5", "Grade the math")}
  `);
}

// ═══════════════════════════════ STATION 04 · EVIDENCE ══════════════════════
const TONE_CLS = { ok: "tone-ok", warn: "tone-warn", bad: "tone-bad", info: "tone-info" };

function evidenceStation() {
  const mode = state.mode;
  const docs = EVIDENCE_DOCS.filter((d) => mode && d.modes.includes(mode));
  const doc = docs.find((d) => d.id === localView.evidenceDocId) || docs[0];
  const docButtons = docs.map((d) => `
    <button type="button" aria-pressed="${doc.id === d.id}" data-action="doc" data-doc="${esc(d.id)}" class="doc-btn ${doc.id === d.id ? "on" : ""}" data-focus-key="doc-${esc(d.id)}">
      <div class="doc-kind">${esc(d.kind)}</div>
      <div class="doc-name">${esc(d.title)}</div>
    </button>`).join("");
  return `
    <div class="stack">
      ${stationHeader("04 · EVIDENCE", "Evidence Inbox", "Raw artifacts with line IDs — triage them like the night shift does.")}
      <div class="evidence-grid">
        ${panelCard(`
          ${panelTitle("inbox", "Documents")}
          <div class="stack-sm">${docButtons}</div>
        `, "h-fit")}
        ${panelCard(docViewer(doc.id))}
      </div>
    </div>`;
}

function docViewer(docId) {
  const doc = EVIDENCE_DOCS.find((d) => d.id === docId);
  const mode = state.mode;
  const lines = doc.lines.map((l) => `
    <div class="log-line ${TONE_CLS[l.tone || "info"]}">
      <span class="log-id">${esc(l.id)}</span>
      <span class="log-text">${esc(l.text)}</span>
    </div>`).join("");

  let form = "";
  // ── M4 controls ──
  if (docId === "doc-jobreport" && mode === "medium") {
    form = `
      <div class="form-box">
        <div class="form-title">Triage form — M4</div>
        <div class="form-row">
          <input type="text" aria-label="Failed job ID" placeholder="Job ID (e.g. JOB-0000)" value="${esc(state.env.failedJobId)}"
                 class="text-input mono w-44" data-input data-field="failedJobId" data-focus-key="failed-job" />
          ${selectControl({ ariaLabel: "Failure class", field: "failedCause", options: ["missed window", "quota", "verification", "credential"].map((c) => ({ id: c, label: c })), placeholder: "Failure class…" })}
        </div>
        ${checkRow("OBJ-M4", "Submit triage")}
      </div>`;
  }
  // ── M5 controls ──
  if (docId === "doc-storage-events" && mode === "medium") {
    const rows = ["SE-1", "SE-2", "SE-3", "SE-4"].map((id) => {
      const tag = state.env.eventTags[id] || "";
      const line = doc.lines.find((l) => l.id === id);
      return `
        <div class="tag-row">
          <span class="tag-preview">${esc(line.text.slice(0, 80))}…</span>
          <div class="tag-btns" role="group" aria-label="Tag for ${esc(id)}">
            ${["snapshot", "backup"].map((t) => `<button type="button" aria-pressed="${tag === t}" data-action="tag" data-event="${esc(id)}" data-tag="${t}" class="tag-btn ${tag === t ? "on" : ""}" data-focus-key="tag-${esc(id)}-${t}">${t}</button>`).join("")}
          </div>
        </div>`;
    }).join("");
    form = `
      <div class="form-box">
        <div class="form-title">Tag each event — M5</div>
        <div class="stack-sm">${rows}</div>
        ${checkRow("OBJ-M5", "Check the tags")}
      </div>`;
  }
  // ── H1 controls ──
  if (["doc-audit", "doc-phish"].includes(docId) && mode === "hard") {
    const destroyed = H1_COPIES.map((c) => {
      const on = state.env.h1Destroyed.includes(c.id);
      return `<button type="button" aria-pressed="${on}" data-action="chip" data-field="h1Destroyed" data-id="${esc(c.id)}" class="dest-chip ${on ? "on" : ""}" data-focus-key="h1d-${esc(c.id)}">${esc(c.label)}</button>`;
    }).join("");
    form = `
      <div class="form-box">
        <div class="form-title rose">Attack-path report — H1 (exact values)</div>
        <div class="form-grid">
          ${selectControl({ ariaLabel: "Initial access vector", field: "h1Vector", options: H1_VECTORS, placeholder: "(a) Initial access…" })}
          ${selectControl({ ariaLabel: "Compromised account", field: "h1Account", options: H1_ACCOUNTS.map((a) => ({ id: a, label: a })), placeholder: "(b) Compromised account…" })}
        </div>
        <div class="mt-8">
          <div class="field-label">(c) Copies destroyed — select all that returned 200</div>
          <div class="chip-wrap tight">${destroyed}</div>
        </div>
        <div class="form-grid mt-8">
          ${selectControl({ ariaLabel: "Surviving copy", field: "h1Survivor", options: H1_COPIES, placeholder: "(d) Surviving copy…" })}
          ${selectControl({ ariaLabel: "Why it survived", field: "h1SurvivorWhy", options: H1_WHY, placeholder: "Why it survived…" })}
        </div>
        ${checkRow("OBJ-H1", "Grade the report")}
      </div>`;
  }
  // ── H2 controls ──
  if (docId === "doc-sat-fail" && mode === "hard") {
    form = `
      <div class="form-box">
        <div class="form-title rose">Root-cause report — H2 (code + 2 citations)</div>
        <div class="form-grid-3">
          ${selectControl({ ariaLabel: "Root-cause code", field: "h2Cause", options: H2_CAUSES, placeholder: "Cause code…" })}
          ${selectControl({ ariaLabel: "Evidence line 1", slot: 0, options: doc.lines.map((l) => ({ id: l.id, label: `${l.id} — ${l.text.slice(0, 46)}…` })), placeholder: "Evidence line 1…" })}
          ${selectControl({ ariaLabel: "Evidence line 2", slot: 1, options: doc.lines.map((l) => ({ id: l.id, label: `${l.id} — ${l.text.slice(0, 46)}…` })), placeholder: "Evidence line 2…" })}
        </div>
        ${checkRow("OBJ-H2", "Grade the root cause")}
      </div>`;
  }
  // ── H8 controls ──
  if (docId === "doc-memo" && mode === "hard") {
    const rows = H8_STATEMENTS.map((s) => {
      const on = state.env.h8.includes(s.id);
      return `
        <button type="button" aria-pressed="${on}" data-action="chip" data-field="h8" data-id="${esc(s.id)}" class="option-btn slim ${on ? "on" : ""}" data-focus-key="h8-${esc(s.id)}">
          <span class="box ${on ? "on" : ""}" aria-hidden="true"></span>
          <span class="option-text-sm"><span class="mono option-id">${esc(s.id)}</span> — ${esc(s.text)}</span>
        </button>`;
    }).join("");
    form = `
      <div class="form-box">
        <div class="form-title rose">Memo review — H8 (keep exactly five)</div>
        <div class="stack-sm">${rows}</div>
        ${checkRow("OBJ-H8", "Send the memo")}
      </div>`;
  }

  return `
    <div>
      <div class="doc-head">
        <span class="badge badge-xs badge-doc">${esc(doc.kind)}</span>
        <h3 class="doc-title">${esc(doc.title)}</h3>
        ${synthTag("ml-auto")}
      </div>
      <div class="log-view">${lines}</div>
      ${form}
    </div>`;
}
