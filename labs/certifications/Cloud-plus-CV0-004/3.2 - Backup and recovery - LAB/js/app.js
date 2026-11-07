// ── app.js — bootstrap: phase routing, mode select, briefing, duty bar,
// station keys, objectives rail, next pointer, debrief + completion modal ─────
// Ported from src/app/page.tsx, ModeSelect.tsx, DutyBar.tsx,
// ObjectivesRail.tsx, DebriefPhase.tsx.

const STATIONS = [
  { id: "planner", n: "01", label: "Planner", icon: "calendar-range" },
  { id: "vault", n: "02", label: "Vault", icon: "lock-keyhole" },
  { id: "drill", n: "03", label: "Drill Floor", icon: "alarm-clock" },
  { id: "evidence", n: "04", label: "Evidence", icon: "folder-search" },
  { id: "quiz", n: "05", label: "Check", icon: "clipboard-check" },
  { id: "debrief", n: "06", label: "Debrief", icon: "book-open-text" },
];

const STATION_LABEL = { planner: "Planner", vault: "Vault", drill: "Drill Floor", evidence: "Evidence" };

// Rail expansion survives re-renders within a desk session (original: per-card
// React state persists while the desk is mounted).
let railOpen = {};

// ── Timers (incident clock + RTO budget) — started/stopped with the desk ─────
let incidentTimer = null;
let incidentSeconds = 0;
let rtoTimer = null;
let rtoElapsed = 0;

function startStopStationTimers() {
  // Incident clock: only in Hard mode, only while the desk exists.
  const wantClock = state.mode === "hard";
  if (wantClock && incidentTimer == null) {
    incidentTimer = setInterval(() => {
      incidentSeconds++;
      const el = document.getElementById("incident-clock");
      if (el) el.textContent = `P1 · T+${fmtHMS(incidentSeconds)}`;
      const wrap = document.getElementById("incident-clock-wrap");
      if (wrap) wrap.setAttribute("aria-label", `Incident clock T plus ${fmtHMS(incidentSeconds)}`);
    }, 1000);
  } else if (!wantClock && incidentTimer != null) {
    clearInterval(incidentTimer); incidentTimer = null; incidentSeconds = 0;
  }
  // RTO budget countdown: only while the Drill Floor sequencer is on screen.
  const wantRto = state.activeStation === "drill" && state.mode === "hard";
  if (wantRto && rtoTimer == null) {
    rtoElapsed = 0;
    rtoTimer = setInterval(() => {
      rtoElapsed++;
      const el = document.getElementById("rto-budget");
      if (el) el.textContent = `RTO budget ${fmtHMS(Math.max(4 * 3600 - rtoElapsed, 0))}`;
    }, 1000);
    const el = document.getElementById("rto-budget");
    if (el) el.textContent = `RTO budget ${fmtHMS(4 * 3600)}`;
  } else if (!wantRto && rtoTimer != null) {
    clearInterval(rtoTimer); rtoTimer = null;
  }
}

function fmtHMS(s) {
  return `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

// ── Phase routing (identical fallback logic to the original Page component) ──
function resolvePhase() {
  const raw = state.phase;
  if (raw === "mode" || raw === "briefing") return raw;
  return state.mode != null ? "desk" : "mode";
}

function boot() {
  renderApp();
  bindGlobalEvents();
}

function renderApp() {
  const phase = resolvePhase();
  const root = document.getElementById("app");
  if (phase !== "desk") railOpen = {}; // fresh desk session → collapsed cards
  if (phase === "mode") root.innerHTML = `<div class="phase-wrap">${modeSelectView()}</div>`;
  else if (phase === "briefing") root.innerHTML = `<div class="phase-wrap">${briefingView()}</div>`;
  else root.innerHTML = deskView();
  bindTermTooltips(root);
  if (phase === "desk") {
    renderNextPointer();
    renderStation();
    renderRail();
    updateDutyBar();
    // The completion modal is part of the desk render in the original —
    // it reappears on reload while completionSeen is true.
    if (state.completionSeen) showCompletionModal();
  }
  startStopStationTimers();
  // Entry animation for mode/briefing (original: 0.4 s rise).
  const inner = root.querySelector(".rise-in");
  if (inner) inner.classList.add("go");
}

// ═══════════════════════════════ MODE SELECT (C1) ════════════════════════════
function modeSelectView() {
  const hasSave = state.mode != null;
  const resume = hasSave ? `
    <div class="resume-banner">
      <span>Saved session found (${state.mode === "hard" ? "Live incident" : "Training rotation"}).</span>
      <button type="button" class="btn btn-primary btn-sm mono-btn" data-action="goto" data-phase="desk">Resume shift</button>
    </div>` : "";
  return `
    <main class="phase-main">
      <div class="rise-in phase-inner">
        <div class="mode-head">
          <div class="micro-label teal-300-text spaced">${esc(ORG.name)} · night shift</div>
          <h1 class="mode-h1">The Continuity Desk</h1>
          <p class="mode-lede">An interactive practice lab for <span class="teal-200-text">CompTIA Cloud+ CV0-004 — Lesson 3.2: Backup and recovery</span> (official Domain 3.0 objective 3.3, "Use appropriate backup and recovery methods"), focused on implementing strategies that ensure data integrity.</p>
          <div class="center mt-12">${synthTag()}</div>
        </div>
        ${resume}
        <div class="mode-grid">
          <button type="button" data-action="mode" data-mode="medium" aria-label="Start Medium mode: guided training rotation" class="mode-card mode-medium">
            <span class="mode-tag teal-300-text">${icon("graduation-cap", 20)}<span class="micro-label spaced">Mode A</span></span>
            <span class="mode-h2">Training rotation</span>
            <span class="mode-body">Your manager wants the backup estate audit-ready. 12 guided objectives walk the full lesson: job types, RPO/RTO, the vault, GFS rotation, integrity sweeps and hardening. Three-tier hints, every check explains itself.</span>
            <span class="mode-badges">
              <span class="badge badge-xs badge-teal">12 objectives</span>
              <span class="badge badge-xs badge-slate">guided</span>
              <span class="badge badge-xs badge-slate">hints ×3</span>
            </span>
          </button>
          <button type="button" data-action="mode" data-mode="hard" aria-label="Start Hard mode: live incident" class="mode-card mode-hard">
            <span class="mode-tag rose-300-text">${icon("shield-alert", 20)}<span class="micro-label spaced">Mode B</span></span>
            <span class="mode-h2">Live incident</span>
            <span class="mode-body">06:10 — ransom note on the file share, backups untrusted. 8 deep challenges across noisy evidence with red herrings, a running incident clock, exact validation and near-miss rejections. One scored nudge, that is all.</span>
            <span class="mode-badges">
              <span class="badge badge-xs badge-rose">8 challenges</span>
              <span class="badge badge-xs badge-slate">strict validation</span>
              <span class="badge badge-xs badge-slate">1 nudge max</span>
            </span>
          </button>
        </div>
        <p class="mode-disclaimer">Defensive, educational simulation. Every log, email and hash on this desk is synthetic training data; MITRE ATT&amp;CK references are real and open in a new tab.</p>
      </div>
    </main>`;
}

// ═══════════════════════════════ BRIEFING (C1) ═══════════════════════════════
function briefingView() {
  const hard = state.mode === "hard";
  const inner = hard ? `
    <div class="brief-tag rose-300-text">${icon("alarm-clock", 14)} P1 declared · 06:10 · SOC escalation</div>
    <h1 class="brief-h1">Ransom note on the file share — backup estate untrusted.</h1>
    <div class="brief-card rose">
      <p>06:05 — endpoint EDR flagged <span class="mono rose-300-text">DARKMOSS_README.txt</span> on the HQ file share. The SOC has declared P1. Production is encrypted and the backup estate is <span class="amber-300-text">untrusted</span>: someone was inside the backup console at 04:07.</p>
      <p>You are the on-call continuity lead. The evidence inbox holds the console audit log, mail triage, the failed Saturday job bundle, replication reports and the runbook. Two incidents intertwine: the attack on the vault, and a quieter failure — Saturday's full backup never completed.</p>
      <p class="dim">Eight challenges. Exact answers, no where-to-look, one scored nudge. The incident clock is running — but accuracy outranks speed.</p>
    </div>
    <p class="cert-line">Certification anchor: CV0-004 Domain 3.0 · objective 3.3 (backup types, locations, replication, restore testing) + security controls from Domain 4.0.</p>` : `
    <div class="brief-tag teal-300-text">${icon("graduation-cap", 14)} Monday · 08:00 · continuity rotation, week 45</div>
    <h1 class="brief-h1">Audit in two weeks. Your rotation: the backup estate.</h1>
    <div class="brief-card teal">
      <p>${esc(ORG.name)} runs its cloud workloads on ${esc(ORG.provider)} plus one on-site NAS. Last month a supplier got hit by ransomware and, because the supplier's backups shared admin credentials with production, they paid to recover six weeks of data. The board asked your manager one question: <span class="teal-200-text">&ldquo;Could that be us?&rdquo;</span></p>
      <p>Your rotation covers the desk end to end: the planner grid (job types, RPO/RTO, DR sites), the vault (copies, tapes, integrity seals, hardening, paging), the drill floor (restore math, threat board) and the evidence inbox (job reports, storage events).</p>
      <p class="dim">Twelve guided objectives. Hints are free — they cost stars, not progress. Every check explains what a defender does next.</p>
    </div>
    <p class="cert-line">Certification anchor: CV0-004 Domain 3.0 · objective 3.3 (backup types, locations, replication, restore testing) — the lesson's data-integrity thread runs through every station.</p>`;
  return `
    <main class="phase-main">
      <div class="rise-in phase-inner-left">
        ${inner}
        <div class="brief-actions">
          <button type="button" class="btn btn-primary btn-lg mono-btn" data-action="goto" data-phase="desk">${hard ? "Take the P1" : "Begin rotation"}</button>
          <button type="button" class="btn btn-outline btn-lg" data-action="goto" data-phase="mode">Back to mode select</button>
        </div>
      </div>
    </main>`;
}

// ═══════════════════════════════ DESK SHELL ══════════════════════════════════
function deskView() {
  const stationKeys = STATIONS.map((s) => {
    const active = state.activeStation === s.id;
    return `
      <button type="button" aria-pressed="${active}" data-action="station" data-station="${s.id}" class="station-key ${active ? "on" : ""}" data-focus-key="station-${s.id}">
        ${icon(s.icon, 15, active ? "teal-300-icon" : "slate-500-icon")}
        <span class="station-n">${s.n}</span>
        <span class="station-name">${s.label}</span>
      </button>`;
  }).join("");

  return `
    <div class="desk-root">
      ${dutyBar()}
      <div class="desk-grid">
        <aside class="keys-aside">
          <nav aria-label="Continuity desk stations" class="station-keys-wrap">
            <div class="station-keys">${stationKeys}</div>
          </nav>
        </aside>
        <main class="desk-main">
          <div id="next-pointer-root"></div>
          <div id="station-root"></div>
          <p class="desk-caption">${state.mode === "hard" ? "P1 · DARKMOSS (fictional)" : "Week 45 rotation"} · synthetic training data · CompTIA Cloud+ CV0-004 Lesson 3.2 · MITRE references open in new tabs</p>
        </main>
        <aside class="rail-aside">
          <div class="rail-scroll"><div id="rail-root"></div></div>
        </aside>
      </div>
    </div>`;
}

// ── Duty bar (console chrome — not site navigation) ──────────────────────────
function dutyBar() {
  const p = progress();
  const hard = state.mode === "hard";
  const ring = masteryRing(p);
  return `
    <header class="duty-bar">
      <div class="duty-inner">
        <div class="duty-ident">
          <span class="duty-logo">${icon("shield-check", 18)}</span>
          <div class="duty-names">
            <div class="micro-label teal-dim spaced">${esc(ORG.name)}</div>
            <div class="duty-title">The Continuity Desk</div>
          </div>
        </div>
        ${hard
          ? `<span class="badge badge-clock-hard" id="incident-clock-wrap" aria-label="Incident clock T plus 00:00:00"><span class="pulse-dot" aria-hidden="true"></span><span id="incident-clock">P1 · T+00:00:00</span></span>`
          : `<span class="badge badge-clock-medium">TRAINING ROTATION</span>`}
        <div class="duty-actions">
          ${ring}
          <button type="button" class="btn btn-outline btn-sm mono-btn" data-action="glossary">${icon("book-open-text", 14)} Glossary</button>
          <button type="button" class="btn btn-outline btn-sm mono-btn checklist-btn" aria-label="Open objectives checklist" data-action="checklist">${icon("list-checks", 14)} Checklist ${p.passed}/${p.total}</button>
          <button type="button" class="btn btn-primary btn-sm mono-btn" id="close-shift-btn" data-action="close-shift">Close shift</button>
          <button type="button" class="btn btn-reset btn-sm" aria-label="Reset the lab" data-action="reset-ask">${icon("rotate-ccw", 14)}</button>
        </div>
      </div>
    </header>`;
}

/** Sync the station-key highlight with the active station (React re-render
 *  equivalent for the aria-pressed/on classes). */
function updateStationKeys() {
  document.querySelectorAll(".station-key").forEach((key) => {
    const on = key.getAttribute("data-station") === state.activeStation;
    key.classList.toggle("on", on);
    key.setAttribute("aria-pressed", String(on));
  });
}

function masteryRing(p) {
  const pct = p.total ? p.passed / p.total : 0;
  const r = 9;
  const c = 2 * Math.PI * r;
  return `
    <span class="ring-wrap" title="Objectives ${p.passed}/${p.total}">
      <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true" class="ring-svg">
        <circle cx="12" cy="12" r="${r}" fill="none" stroke="#1D2A44" stroke-width="3" />
        <circle id="ring-fg" cx="12" cy="12" r="${r}" fill="none" stroke="#5EEAD4" stroke-width="3"
          stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct)}" stroke-linecap="round" class="ring-fg" />
      </svg>
      <span class="mono ring-count" id="ring-count">${p.passed}/${p.total}</span>
    </span>`;
}

/** Refresh ring, checklist count, and Close-shift gating (called on progress changes). */
function updateDutyBar() {
  const p = progress();
  const ringFg = document.getElementById("ring-fg");
  if (ringFg) {
    const r = 9; const c = 2 * Math.PI * r;
    ringFg.style.strokeDashoffset = `${c * (1 - (p.total ? p.passed / p.total : 0))}`;
  }
  const count = document.getElementById("ring-count");
  if (count) count.textContent = `${p.passed}/${p.total}`;
  const btn = document.getElementById("close-shift-btn");
  if (btn) {
    const allDone = p.total > 0 && p.passed === p.total;
    btn.disabled = !(allDone && state.quiz.done);
  }
  const checklist = document.querySelector(".checklist-btn");
  if (checklist) checklist.innerHTML = `${icon("list-checks", 14)} Checklist ${p.passed}/${p.total}`;
}

// ── Next pointer (Medium only, D5 affordance) ────────────────────────────────
function renderNextPointer() {
  const rootEl = document.getElementById("next-pointer-root");
  if (!rootEl) return;
  if (state.mode !== "medium") { rootEl.innerHTML = ""; return; }
  const defs = objectivesFor("medium");
  const next = defs.find((d) => !(state.objectives[d.id] && state.objectives[d.id].passed));
  if (!next) { rootEl.innerHTML = ""; return; }
  rootEl.innerHTML = `
    <div class="next-pointer">
      <span class="micro-label teal-300-text spaced">Next on checklist</span>
      <span class="next-title">${esc(next.id.replace("OBJ-", ""))} · ${esc(next.title)}</span>
      <button type="button" class="btn btn-primary btn-xs mono-btn next-btn" data-action="goto-station" data-station="${next.station}">Take me there</button>
    </div>`;
}

// ═══════════════════════════════ OBJECTIVES RAIL (C4) ════════════════════════
function renderRail() {
  const rootEl = document.getElementById("rail-root");
  if (!rootEl || state.mode == null) return;
  const defs = objectivesFor(state.mode);
  const p = progress();
  const pct = p.total ? Math.round((p.passed / p.total) * 100) : 0;
  const cards = defs.map((def) => objectiveCard(def)).join("");
  rootEl.innerHTML = `
    <div class="rail">
      <div class="rail-head">
        <h2 class="micro-label teal-300-text spaced">Field checklist</h2>
        <span class="mono rail-count">${p.passed}/${p.total}</span>
      </div>
      <div class="rail-progress" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Objectives completed ${pct}%">
        <div class="rail-progress-fill" style="width:${pct}%"></div>
      </div>
      <div class="rail-cards">${cards}</div>
    </div>`;
}

function objectiveCard(def) {
  const record = state.objectives[def.id];
  const result = state.results[def.id];
  const hintsShown = record ? record.hintsUsed : 0;
  const maxHints = def.mode === "hard" ? 1 : 3;
  const passed = record ? record.passed : false;
  const isHard = state.mode === "hard";
  const open = !!railOpen[def.id];
  const hintsHtml = hintsShown > 0
    ? `<ol class="hint-list">${def.hints.slice(0, hintsShown).map((h, i) =>
        `<li class="hint-item"><span class="mono hint-tag">HINT ${i + 1}</span> — ${esc(h)}</li>`).join("")}</ol>`
    : "";
  const hintBtn = !passed && hintsShown < maxHints
    ? `<button type="button" aria-label="Reveal hint ${hintsShown + 1} of ${maxHints}${isHard ? " (scored)" : ""}" class="btn btn-hint btn-xs" data-action="hint" data-obj="${def.id}" data-focus-key="hint-${def.id}">${icon("lightbulb", 12)} Hint ${hintsShown + 1}/${maxHints}${isHard ? " (−score)" : ""}</button>`
    : "";
  return `
    <div class="obj-card ${passed ? "passed" : ""}" data-obj-card="${def.id}">
      <button type="button" aria-expanded="${open}" class="obj-head" data-action="toggle-obj" data-obj="${def.id}" data-focus-key="objhead-${def.id}">
        ${passed ? icon("check-circle-2", 16, "emerald-icon") : icon("circle", 16, "slate-500-icon")}
        <span class="obj-head-main">
          <span class="obj-head-tags">
            <span class="mono obj-id">${esc(def.id.replace("OBJ-", ""))}</span>
            ${pillarBadge(def.pillar)}
          </span>
          <span class="obj-title ${passed ? "done" : ""}">${esc(def.title)}</span>
        </span>
        <span class="obj-chevron ${open ? "open" : ""}">${icon("chevron-down", 14)}</span>
      </button>
      ${open ? `
        <div class="obj-body">
          <p class="obj-prompt">${esc(def.prompt)}</p>
          <div class="obj-actions">
            <span class="badge badge-xs badge-neutral">${STATION_LABEL[def.station]}</span>
            <button type="button" class="btn btn-ghost btn-xs" data-action="goto-station" data-station="${def.station}">Go to station</button>
            <button type="button" class="btn btn-primary btn-xs" data-action="check" data-obj="${def.id}" data-focus-key="check-${def.id}">Check</button>
            ${hintBtn}
          </div>
          ${hintsHtml}
          <div data-feedback-for="${def.id}">${result ? feedbackBox(result) : ""}</div>
        </div>` : ""}
    </div>`;
}

/** Update the rail card for one objective (after check/hint) without
 *  collapsing the other cards. */
function refreshRailFor(objId) {
  const rootEl = document.getElementById("rail-root");
  if (!rootEl) return;
  const def = OBJECTIVES.find((o) => o.id === objId);
  if (!def) { renderRail(); return; }
  const oldCard = rootEl.querySelector(`[data-obj-card="${objId}"]`);
  const wrap = document.createElement("div");
  wrap.innerHTML = objectiveCard(def);
  const newCard = wrap.firstElementChild;
  if (oldCard) oldCard.replaceWith(newCard);
  else renderRail();
}

function refreshFeedbackFor(objId) {
  // Update the inline feedback boxes (station panel + rail card share the same
  // data-feedback-for attribute contract).
  const result = state.results[objId];
  document.querySelectorAll(`[data-feedback-for="${objId}"]`).forEach((slot) => {
    slot.innerHTML = result ? feedbackBox(result) : "";
  });
}

// ═══════════════════════════════ DEBRIEF (C6) ════════════════════════════════
const DETECTION_LOGIC = [
  "ALERT  any DELETE on backup-copy API outside approved change window        → T1490 fingerprint",
  "ALERT  verification_job.mismatches > 0                                     → '0 errors' broken",
  "ALERT  backup_success_rate(24h) < 95% OR same job failed twice             → silent gaps",
  "ALERT  replication_lag > asset.RPO / 2                                     → hidden RPO breach",
  "ALERT  backup_console: login from unapproved ASN OR (≥3 MFA denials then success) → T1078 path",
];

const MITIGATION_MAP = [
  { id: "M1053", label: "MITRE M1053 — Data Backup: the official countermeasure to T1490; this entire lesson operationalizes it." },
  { id: "CP-9 / CP-10", label: "NIST SP 800-53 CP-9 (System Backup) & CP-10 (System Recovery): policy + tested restoration." },
  { id: "SI-7", label: "NIST SI-7 (Software, Firmware & Information Integrity): checksums / verification jobs." },
  { id: "SC-28", label: "NIST SC-28 (Protection of Information at Rest): encryption of copy targets." },
  { id: "AC-6", label: "NIST AC-6 (Least Privilege): dedicated backup admin, no shared credentials with production." },
  { id: "CIS 11", label: "CIS Control 11 — Data Recovery: established, protected, verified recovery process." },
];

function debriefPhase() {
  const p = progress();
  const quizDone = state.quiz.done;
  const allDone = p.passed === p.total && p.total > 0;
  return `
    <div class="quiz-wrap">
      ${stationHeader("06 · DEBRIEF", "Field notes", "What the desk taught you — take it to your next shift.")}
      <section class="panel" aria-label="Detection opportunities">
        <h3 class="debrief-h teal-200-text">Detection opportunities</h3>
        <p class="panel-intro">Data sources: backup job logs · verification manifests · backup-console audit logs · storage inventory diffs · capacity metrics · replication lag metrics · mail triage.</p>
        <pre class="detect-pre" aria-label="Example detection logic">${esc(DETECTION_LOGIC.join("\n"))}</pre>
      </section>
      <section class="panel" aria-label="Mitigation recommendations">
        <h3 class="debrief-h teal-200-text">Mitigations — with official IDs</h3>
        <ul class="stack-sm mt-8">
          ${MITIGATION_MAP.map((m) => `<li class="row-card plain"><span class="badge badge-xs badge-mono-teal">${esc(m.id)}</span> ${esc(m.label)}</li>`).join("")}
        </ul>
      </section>
      <div class="debrief-grid">
        <section class="panel debrief-blue" aria-label="Blue team takeaways">
          <h3 class="debrief-h teal-200-text">Blue-team takeaways</h3>
          <ul class="disc-list mt-8">
            <li>Backups are production's twin estate: monitor, patch, and least-privilege them like it.</li>
            <li>3-2-1-1-0 is auditable — verify copies on a schedule and alert on deletion APIs.</li>
            <li>Restore drills are the only proof a backup works; drill the immutable path too.</li>
            <li>Alert doctrine: page on recovery-threatening events, ticket the rest — fatigue is an attacker's ally.</li>
            <li>RPO/RTO are business numbers; re-derive every schedule and site tier from them.</li>
          </ul>
        </section>
        <section class="panel debrief-red" aria-label="Red team mindset takeaways">
          <h3 class="debrief-h rose-200-text">Red-team mindset (defensive use)</h3>
          <ul class="disc-list mt-8">
            <li>First target: the console that can delete everything — one phishing mail away (T1078).</li>
            <li>Inhibit recovery before encrypting (T1490 → T1486): DELETE the copies, then negotiate.</li>
            <li>Exfiltrate before encrypting — the double leverage play (T1530).</li>
            <li>Same-account snapshots and same-region buckets share your blast radius — attacker math counts on it.</li>
          </ul>
        </section>
      </div>
      <section class="panel" aria-label="Attribution examples">
        <h3 class="debrief-h teal-200-text">Documented tradecraft (MITRE examples)</h3>
        <ul class="disc-list mt-8">${EXAMPLE_ACTORS.map((e) => `<li>${esc(e)}</li>`).join("")}</ul>
      </section>
      <section class="panel" aria-label="References">
        <h3 class="debrief-h teal-200-text">Reference (opens in new tab)</h3>
        <div class="ref-row mt-8">
          <a href="https://www.comptia.org/en-us/certifications/cloud" target="_blank" rel="noopener noreferrer" class="ref-link">CompTIA Cloud+ CV0-004 ${icon("external-link", 12)}</a>
          ${MITRE.map((m) => `<a href="${esc(m.url)}" target="_blank" rel="noopener noreferrer" class="ref-link">MITRE ${esc(m.id)} · ${esc(m.name)} ${icon("external-link", 12)}</a>`).join("")}
        </div>
      </section>
      <div class="close-strip">
        <span class="close-strip-text">
          ${allDone && quizDone
            ? "Everything is checked. Close the shift and collect your stars."
            : `${p.total - p.passed} objective(s) open${quizDone ? "" : " · knowledge check pending"}.`}
        </span>
        <button type="button" class="btn btn-primary mono-btn" ${!(allDone && quizDone) ? "disabled" : ""} data-action="close-shift" data-focus-key="debrief-close">Close shift</button>
      </div>
      <p class="debrief-foot">${esc(ORG.name)} · synthetic training environment · Cloud+ CV0-004 Lesson 3.2</p>
    </div>`;
}

// ═══════════════════════════════ COMPLETION MODAL (C7) ═══════════════════════
function starSvg(fillState) {
  // fillState: "full" | "half" | "empty" — matches the original's star classes.
  const cls = fillState === "full" ? "star-full" : fillState === "half" ? "star-half" : "star-empty";
  return icon("star", 26, cls);
}

function showCompletionModal() {
  const mode = state.mode;
  const st = stars();
  const p = progress();
  const defs = objectivesFor(mode);
  const bank = mode === "hard" ? QUIZ_HARD : QUIZ_MEDIUM;
  const byPillar = { P1: [], P2: [], P3: [], P4: [] };
  for (const d of defs) byPillar[d.pillar].push({ title: d.title, passed: !!(state.objectives[d.id] && state.objectives[d.id].passed) });
  const score = p.total ? Math.round((p.passed / p.total) * 100) : 0;

  // R8: focus areas derived from THIS student's actual evidence.
  const retried = defs.filter((d) => state.objectives[d.id] && state.objectives[d.id].firstTry === false).map((d) => d.title);
  const hinted = defs.filter((d) => state.objectives[d.id] && (state.objectives[d.id].hintsUsed || 0) > 0).map((d) => d.title);
  const missedTopics = bank.filter((q) => state.quiz.checked[q.id] && state.quiz.answers[q.id] !== q.answer).map((q) => q.topic);
  const focusAreas = [];
  if (missedTopics.length) focusAreas.push(`Knowledge check: revisit ${[...new Set(missedTopics)].join("; ")} — re-read those explanations in the Check station before re-running.`);
  if (retried.length) focusAreas.push(`Objectives that cost a retry: ${retried.join(" · ")} — redo them first-try in the other mode to confirm the gap is closed.`);
  const hintOnly = hinted.filter((h) => !retried.includes(h));
  if (hintOnly.length) focusAreas.push(`You used a hint on: ${hintOnly.join(" · ")} — try the parallel task without hints next time.`);
  if (!focusAreas.length) focusAreas.push("Clean sweep — nothing to flag. Consolidate it: re-run the other mode and aim for first-try passes with zero hints.");

  const starRow = [1, 2, 3, 4, 5].map((i) =>
    starSvg(i <= st.stars ? "full" : i - 0.5 === st.stars ? "half" : "empty")).join("");

  const content = `
    <div class="modal-scale">
      <div class="star-row" role="img" aria-label="${st.stars} out of 5 stars. ${esc(st.breakdown)}">
        ${starRow}<span class="mono star-count">${st.stars.toFixed(1)}</span>
      </div>
      <p class="star-breakdown mono">${esc(st.breakdown)}</p>
      <div class="score-grid">
        <div class="score-box"><div class="score-num">${score}%</div><div class="score-label">objectives</div></div>
        <div class="score-box"><div class="score-num">${state.quiz.correct}/${state.quiz.done ? bank.length : "–"}</div><div class="score-label">knowledge check</div></div>
      </div>
      <div class="stack-sm mt-16">
        ${["P1", "P2", "P3", "P4"].map((pl) => `
          <div class="row-card plain">
            ${pillarBadge(pl)}
            <ul class="pillar-list">
              ${byPillar[pl].map((o) => `<li class="${o.passed ? "pl-passed" : "pl-open"}">${o.passed ? "✓" : "○"} ${esc(o.title)}</li>`).join("")}
            </ul>
          </div>`).join("")}
      </div>
      <div class="focus-box">
        <span class="micro-label amber-300-text">Focus areas for your next shift</span>
        <ul class="disc-list mt-8">${focusAreas.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
      </div>
      <div class="whatnext-box">
        <span class="micro-label">What next</span>
        <p class="whatnext-body">Re-run the other mode for the contrasting experience. Then continue CV0-004 Domain 3.0: observability (3.1), scaling (3.2) and life cycle (3.4) — and revisit the MITRE pages from the Debrief to see how M1053 Data Backup lives inside real incident response.</p>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-primary mono-btn" data-action="completion-review">Review debrief</button>
        <button type="button" class="btn btn-outline" data-action="completion-fresh">Start fresh</button>
      </div>
    </div>`;

  openDialog({
    id: "completion",
    title: "Shift closed — debrief",
    description: `${mode === "hard" ? "Live incident resolved." : "Training rotation complete."} You can now explain, recognize, detect and mitigate this lesson's scope.`,
    content,
    onclose: () => closeCompletion(),
  });
}

// ── Glossary dialog ───────────────────────────────────────────────────────────
function openGlossaryDialog() {
  openDialog({
    id: "glossary",
    title: "Glossary — backup & recovery",
    description: "Every term used on the desk, one line each.",
    content: `
      <input type="text" value="" placeholder="Filter terms…" aria-label="Filter glossary terms"
             class="text-input" data-input="glossary-filter" data-autofocus />
      <div id="glossary-list" class="glossary-list"></div>`,
    afterOpen: (panel) => renderGlossaryList(""),
  });
}

function renderGlossaryList(query) {
  const listEl = document.getElementById("glossary-list");
  if (!listEl) return;
  const q = query.toLowerCase();
  const items = GLOSSARY.filter((g) => (g.term + g.def).toLowerCase().includes(q));
  listEl.innerHTML = items.map((g) => `
    <div class="gloss-item">
      <div class="gloss-term">${esc(g.term)}</div>
      <div class="gloss-def">${esc(g.def)}</div>
    </div>`).join("");
}

// ── Reset confirm (AlertDialog equivalent) ────────────────────────────────────
function openResetDialog() {
  openDialog({
    id: "reset",
    title: "Reset the continuity desk?",
    description: "This wipes saved progress, every objective result, quiz answers and station state. The lab returns to the pristine mode-selection screen.",
    content: `
      <div class="dialog-footer">
        <button type="button" class="btn btn-outline" data-dialog-close data-autofocus>Keep working</button>
        <button type="button" class="btn btn-danger" data-action="reset-confirm">Reset everything</button>
      </div>`,
  });
}

// ── Mobile checklist sheet ────────────────────────────────────────────────────
function openChecklistSheet() {
  openDialog({
    id: "checklist",
    variant: "sheet",
    title: "Field checklist",
    srOnlyDescription: true,
    description: "Every objective for this mode, with checks, hints and feedback.",
    content: `<div class="sheet-rail"><div id="sheet-rail-root"></div></div>`,
    afterOpen: (panel) => {
      // Render the same rail into the sheet, kept in sync via the standard
      // renderRail target swap while open.
      const sheetRoot = document.getElementById("sheet-rail-root");
      if (sheetRoot) {
        sheetRoot.innerHTML = document.getElementById("rail-root").innerHTML;
      }
      bindTermTooltips(panel);
    },
  });
}

// (The sheet's rail copy is kept in sync by syncSheetRail() defined in the
// store-subscription section below.)

// ═══════════════════════════════ EVENT WIRING ════════════════════════════════
function bindGlobalEvents() {
  document.addEventListener("click", onGlobalClick);
  document.addEventListener("change", onGlobalChange);
  document.addEventListener("input", onGlobalInput);
}

function onGlobalClick(e) {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const action = el.getAttribute("data-action");

  switch (action) {
    // ── navigation ──
    case "mode": setMode(el.getAttribute("data-mode")); break;
    case "goto": gotoPhase(el.getAttribute("data-phase")); break;
    case "goto-station":
    case "station": setStation(el.getAttribute("data-station")); break;
    case "toggle-obj": {
      const id = el.getAttribute("data-obj");
      railOpen[id] = !railOpen[id];
      refreshRailFor(id);
      syncSheetRail();
      const card = document.querySelector(`[data-obj-card="${id}"] .obj-head`);
      if (card) card.focus();
      break;
    }
    case "doc": {
      localView.evidenceDocId = el.getAttribute("data-doc");
      rerenderPreservingFocus("station-root", () => renderStation());
      break;
    }
    // ── objectives ──
    case "check": checkObjective(el.getAttribute("data-obj")); break;
    case "hint": revealHint(el.getAttribute("data-obj")); break;
    // ── duty bar ──
    case "glossary": openGlossaryDialog(); break;
    case "checklist": openChecklistSheet(); break;
    case "close-shift": {
      const p = progress();
      const allDone = p.total > 0 && p.passed === p.total;
      const canClose = allDone && state.quiz.done;
      if (canClose) { finish(); setStation("debrief"); }
      else if (!allDone) announce(`Shift not complete: ${p.total - p.passed} objective(s) still open.`);
      else announce("Knowledge check not submitted yet — finish it, then close the shift.");
      break;
    }
    case "reset-ask": openResetDialog(); break;
    case "reset-confirm": {
      // Close every open dialog (the confirm itself), then reset.
      while (dialogStack.length) dialogStack[dialogStack.length - 1].close();
      resetAll();
      break;
    }
    // ── vault interactions ──
    case "verify-run":
      patchEnv({ verificationRan: true });
      announce("Verification sweep running… manifests compared against stored hashes.");
      localView.verificationAnimated = true;
      rerenderPreservingFocus("station-root", () => renderStation());
      break;
    case "verify-select": {
      localView.verificationSelected = el.getAttribute("data-artifact");
      refreshVerificationRows();
      break;
    }
    case "verify-quarantine": {
      const sel = localView.verificationSelected;
      if (!sel) return;
      if (state.env.quarantined.includes(sel)) {
        patchEnv((env) => ({ quarantined: env.quarantined.filter((q) => q !== sel) }));
        announce(`${sel} returned to rotation — quarantine review reversed.`);
      } else {
        patchEnv((env) => ({ quarantined: [...env.quarantined, sel] }));
        announce(`${sel} quarantined — excluded from restore chains.`);
      }
      refreshVerificationRows();
      break;
    }
    case "worm": {
      const copyId = el.getAttribute("data-copy");
      const current = state.env.copyLocks[copyId] != null ? state.env.copyLocks[copyId] : false;
      const nextVal = !current;
      patchEnv((env) => ({ copyLocks: { ...env.copyLocks, [copyId]: nextVal } }));
      const card = COPIES.find((c) => c.id === copyId);
      if (nextVal && card) announce(`${card.label} sealed — object lock enabled in compliance mode.`);
      updateWormVisual(copyId, nextVal);
      break;
    }
    case "hardening": {
      const id = el.getAttribute("data-id");
      const nextVal = !(state.env.hardening[id] || false);
      patchEnv((env) => ({ hardening: { ...env.hardening, [id]: nextVal } }));
      updateSwitchVisual(el, nextVal);
      break;
    }
    case "tape": {
      const tape = el.getAttribute("data-tape");
      const label = el.getAttribute("data-label");
      patchEnv((env) => ({ tapeLabels: { ...env.tapeLabels, [tape]: label } }));
      refreshTapeCard(tape);
      break;
    }
    case "triage": {
      const alert = el.getAttribute("data-alert");
      const bucket = el.getAttribute("data-bucket");
      patchEnv((env) => ({ alertTriage: { ...env.alertTriage, [alert]: bucket } }));
      refreshTriageRow(alert);
      break;
    }
    case "tag": {
      const eventId = el.getAttribute("data-event");
      const tag = el.getAttribute("data-tag");
      patchEnv((env) => ({ eventTags: { ...env.eventTags, [eventId]: tag } }));
      refreshTagRow(eventId);
      break;
    }
    case "breaker": {
      patchEnv({ immutableReason: el.getAttribute("data-id") });
      refreshBreakers();
      break;
    }
    case "chip": {
      const field = el.getAttribute("data-field");
      const id = el.getAttribute("data-id");
      const arr = state.env[field];
      const next = arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];
      patchEnv((env) => ({ [field]: next }));
      // Direct visual toggle — no re-render needed.
      const on = next.includes(id);
      el.setAttribute("aria-pressed", String(on));
      el.classList.toggle("on", on);
      el.classList.toggle("on-amber", false);
      const box = el.querySelector(".box");
      if (box) box.classList.toggle("on", on);
      if (field === "pager") {
        const dot = el.querySelector(".pager-dot");
        if (dot) dot.classList.toggle("on", on);
      }
      if (field === "h1Destroyed") el.classList.toggle("on", on);
      break;
    }
    // ── drill floor ──
    case "seq-place": {
      const id = el.getAttribute("data-step");
      if (state.env.drillSteps.includes(id)) break;
      localView.seqLastPlaced = id;
      patchEnv((env) => ({ drillSteps: [...env.drillSteps, id] }));
      rerenderPreservingFocus("station-root", () => renderStation());
      break;
    }
    case "seq-remove": {
      const i = Number(el.getAttribute("data-index"));
      localView.seqLastPlaced = null;
      patchEnv((env) => ({ drillSteps: env.drillSteps.filter((_, idx) => idx !== i) }));
      rerenderPreservingFocus("station-root", () => renderStation());
      break;
    }
    case "seq-clear":
      localView.seqLastPlaced = null;
      patchEnv({ drillSteps: [] });
      rerenderPreservingFocus("station-root", () => renderStation());
      break;
    // ── quiz ──
    case "quiz-option": answerQuiz(el.getAttribute("data-qid"), Number(el.getAttribute("data-idx"))); break;
    case "quiz-lock": revealQuizAnswer(el.getAttribute("data-qid")); break;
    case "quiz-prev": setQuizIdx(Math.max((state.quiz.quizIdx || 0) - 1, 0)); break;
    case "quiz-next": setQuizIdx((state.quiz.quizIdx || 0) + 1); break;
    case "quiz-finish": submitQuiz(); break;
    // ── completion modal ──
    case "completion-review": {
      while (dialogStack.length) dialogStack[dialogStack.length - 1].close();
      closeCompletion();
      setStation("debrief");
      break;
    }
    case "completion-fresh": {
      while (dialogStack.length) dialogStack[dialogStack.length - 1].close();
      resetAll();
      break;
    }
  }
}

function onGlobalChange(e) {
  const el = e.target.closest("[data-select]");
  if (!el) return;
  const value = el.value;
  el.dataset.empty = value ? "false" : "true";
  if (el.getAttribute("data-map")) {
    const map = el.getAttribute("data-map");
    const key = el.getAttribute("data-key");
    patchEnv((env) => ({ [map]: { ...env[map], [key]: value } }));
  } else if (el.getAttribute("data-cell")) {
    const cell = el.getAttribute("data-cell");
    const asset = el.getAttribute("data-asset");
    patchEnv((env) => ({
      planHard: { ...env.planHard, [asset]: { ...(env.planHard[asset] || { freq: "", repl: "", media: "" }), [cell]: value } },
    }));
  } else if (el.getAttribute("data-copy")) {
    const copyId = el.getAttribute("data-copy");
    patchEnv((env) => ({ copyTargets: { ...env.copyTargets, [copyId]: value } }));
  } else if (el.getAttribute("data-slot") != null) {
    const slot = Number(el.getAttribute("data-slot"));
    const lines = [...state.env.h2Lines];
    lines[slot] = value;
    patchEnv({ h2Lines: lines });
  } else if (el.getAttribute("data-field")) {
    const field = el.getAttribute("data-field");
    patchEnv({ [field]: value });
  }
}

function onGlobalInput(e) {
  const el = e.target;
  if (el.getAttribute && el.getAttribute("data-input") === "glossary-filter") {
    renderGlossaryList(el.value);
    return;
  }
  if (el.getAttribute && el.getAttribute("data-input") != null && el.getAttribute("data-field")) {
    // Text inputs patch state WITHOUT re-rendering (keeps the caret in place).
    patchEnv({ [el.getAttribute("data-field")]: el.value });
  }
}

// ── Direct visual updates (no re-render) ──────────────────────────────────────
function updateSwitchVisual(btn, on) {
  btn.setAttribute("aria-checked", String(on));
  const row = btn.closest(".hard-row");
  if (row) row.classList.toggle("on", on);
  const wormRow = btn.closest(".worm-row");
  if (wormRow) wormRow.classList.toggle("on", on);
}

function updateWormVisual(copyId, locked) {
  const btn = document.querySelector(`[data-action="worm"][data-copy="${copyId}"]`);
  if (btn) {
    btn.setAttribute("aria-checked", String(locked));
  }
  // Refresh the seal inside the same copy card.
  const card = btn ? btn.closest(".copy-card") : null;
  if (card) {
    const c = COPIES.find((x) => x.id === copyId);
    const oldSeal = card.querySelector(".seal");
    if (c && oldSeal) {
      const wrap = document.createElement("div");
      wrap.innerHTML = seal(locked, c.label);
      oldSeal.replaceWith(wrap.firstElementChild);
    }
  }
}

function refreshVerificationRows() {
  const sel = localView.verificationSelected;
  const rootEl = document.getElementById("station-root");
  if (!rootEl) return;
  // Update row selection/quarantine classes + the action button, in place.
  rootEl.querySelectorAll(".verify-row").forEach((row) => {
    const id = row.getAttribute("data-artifact");
    row.classList.toggle("selected", sel === id);
    row.setAttribute("aria-pressed", String(sel === id));
    const q = state.env.quarantined.includes(id);
    row.classList.toggle("quarantined", q);
    const hasBadge = row.querySelector(".pill-hold");
    if (q && !hasBadge) row.insertAdjacentHTML("beforeend", `<span class="vpill pill-hold">quarantined</span>`);
    if (!q && hasBadge) hasBadge.remove();
  });
  const qBtn = rootEl.querySelector('[data-action="verify-quarantine"]');
  if (qBtn) {
    qBtn.disabled = !sel;
    qBtn.textContent = sel && state.env.quarantined.includes(sel) ? "Return to rotation" : "Quarantine selected";
  }
  const hintLine = rootEl.querySelector(".verify-actions .hint-line");
  if (hintLine) hintLine.textContent = sel ? `Selected: ${sel}` : "Click an artifact row to select it.";
}

function refreshTapeCard(tapeId) {
  const rootEl = document.getElementById("station-root");
  const card = rootEl && rootEl.querySelector(`[data-action="tape"][data-tape="${tapeId}"]`);
  if (!card) { rerenderPreservingFocus("station-root", () => renderStation()); return; }
  // Re-render just this tape card's button group.
  const grid = card.closest(".tape-grid");
  const idx = TAPES.findIndex((t) => t.id === tapeId);
  const wrap = document.createElement("div");
  wrap.innerHTML = tapeRack();
  const newGrid = wrap.querySelector(".tape-grid");
  const newCard = newGrid.children[idx];
  const oldCard = grid.children[idx];
  oldCard.replaceWith(newCard);
}

function refreshTriageRow(alertId) {
  const rootEl = document.getElementById("station-root");
  const btns = rootEl ? rootEl.querySelectorAll(`[data-action="triage"][data-alert="${alertId}"]`) : [];
  const cur = state.env.alertTriage[alertId] || "";
  btns.forEach((b) => {
    const bucket = b.getAttribute("data-bucket");
    const on = cur === bucket;
    b.setAttribute("aria-pressed", String(on));
    b.classList.remove("on-page", "on-ticket", "on-suppress");
    if (on) b.classList.add(bucket === "PAGE" ? "on-page" : bucket === "TICKET" ? "on-ticket" : "on-suppress");
  });
}

function refreshTagRow(eventId) {
  const rootEl = document.getElementById("station-root");
  const btns = rootEl ? rootEl.querySelectorAll(`[data-action="tag"][data-event="${eventId}"]`) : [];
  const cur = state.env.eventTags[eventId] || "";
  btns.forEach((b) => {
    const on = cur === b.getAttribute("data-tag");
    b.setAttribute("aria-pressed", String(on));
    b.classList.toggle("on", on);
  });
}

function refreshBreakers() {
  const rootEl = document.getElementById("station-root");
  const btns = rootEl ? rootEl.querySelectorAll('[data-action="breaker"]') : [];
  btns.forEach((b) => {
    const on = state.env.immutableReason === b.getAttribute("data-id");
    b.setAttribute("role", "radio");
    b.setAttribute("aria-checked", String(on));
    b.classList.toggle("on-amber", on);
    const dot = b.querySelector(".dot");
    if (dot) dot.classList.toggle("on", on);
  });
}

// ═══════════════════════════════ STORE SUBSCRIPTION ══════════════════════════
// Fine-grained re-render strategy (the original re-renders via zustand
// selectors — we mirror what each change actually affects):
//   • phase / station change → full render of that region,
//   • objectives/results change → rail + inline feedback refresh,
//   • quiz change → quiz panel refresh,
//   • everything else (env tweaks) → already applied in place by the handlers.
let prevPhase = resolvePhase();
let prevStation = state.activeStation;
let prevSlice = sliceSnapshot();
let prevCompletionSeen = state.completionSeen;

function sliceSnapshot() {
  return JSON.stringify({ o: state.objectives, r: state.results, q: state.quiz });
}

function refreshRailFull() {
  // Re-render the rail, preserving card expansion (railOpen) and keyboard focus.
  const railEl = document.getElementById("rail-root");
  const active = document.activeElement;
  const key = railEl && active && railEl.contains(active) ? active.getAttribute("data-focus-key") : null;
  renderRail();
  if (key) {
    const el = document.querySelector(`#rail-root [data-focus-key="${CSS.escape(key)}"]`);
    if (el) el.focus();
  }
  syncSheetRail();
}

function syncSheetRail() {
  // While the mobile checklist sheet is open, keep its rail copy in sync
  // (preserving focus inside the sheet).
  const sheetRoot = document.getElementById("sheet-rail-root");
  const railRoot = document.getElementById("rail-root");
  if (sheetRoot && railRoot) {
    const active = document.activeElement;
    const key = sheetRoot.contains(active) ? active.getAttribute("data-focus-key") : null;
    sheetRoot.innerHTML = railRoot.innerHTML;
    if (key) {
      const el = sheetRoot.querySelector(`[data-focus-key="${CSS.escape(key)}"]`);
      if (el) el.focus();
    }
  }
}

subscribe(() => {
  // Screen-reader announcements (live region outside the re-rendered root).
  const live = document.getElementById("live-region");
  if (live && state.announcement) live.textContent = state.announcement;

  const phase = resolvePhase();
  if (phase !== prevPhase) {
    prevPhase = phase;
    prevStation = state.activeStation;
    prevSlice = sliceSnapshot();
    renderApp();
    return;
  }
  if (phase !== "desk") return;

  if (state.activeStation !== prevStation) {
    prevStation = state.activeStation;
    prevSlice = sliceSnapshot();
    renderStation();
    updateStationKeys();
    renderNextPointer();
    return;
  }

  const snap = sliceSnapshot();
  if (snap !== prevSlice) {
    const prev = JSON.parse(prevSlice);
    prevSlice = snap;
    if (JSON.stringify(state.objectives) !== JSON.stringify(prev.o) || JSON.stringify(state.results) !== JSON.stringify(prev.r)) {
      // Rail + every visible feedback slot for the touched objectives.
      const touched = new Set([...Object.keys(state.objectives), ...Object.keys(state.results)]);
      touched.forEach((id) => refreshFeedbackFor(id));
      refreshRailFull();
    }
    if (JSON.stringify(state.quiz) !== JSON.stringify(prev.q)) {
      refreshQuiz();
    }
  }

  updateDutyBar();
  renderNextPointer();

  if (state.completionSeen !== prevCompletionSeen) {
    prevCompletionSeen = state.completionSeen;
    if (state.completionSeen) showCompletionModal();
  }
  startStopStationTimers();
});

window.Lab = { boot };
