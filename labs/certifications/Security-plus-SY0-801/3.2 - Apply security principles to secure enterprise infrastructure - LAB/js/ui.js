/* ═══════════════════════════════════════════════════════════════════════════
   ui.js — DOM helpers, shared primitives (Mono / Paper / PillarBadge / Stamp /
   SheetHeading) and the chrome screens (TitleBlock, ModeSelect, Briefing).
   Templates mirror the JSX in the original lab's chrome.tsx + primitives.tsx.
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";

/** HTML-escape a string (all dynamic values pass through here) */
function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ── primitives ───────────────────────────────────────────────────────────────
function mono(children, cls) {
  return `<span class="mono-label${cls ? " " + cls : ""}">${children}</span>`;
}

function paper(inner, cls, tag) {
  return `<${tag || "div"} class="paper${cls ? " " + cls : ""}">${inner}</${tag || "div"}>`;
}

const PILLAR_CLASS = { P1: "pillar-p1", P2: "pillar-p2", P3: "pillar-p3", P4: "pillar-p4" };
function pillarBadge(pillar) {
  return `<span class="pillar-badge ${PILLAR_CLASS[pillar]}" title="Mastery pillar: ${esc(PILLAR_LABEL[pillar])}">${pillar} · ${esc(PILLAR_LABEL[pillar])}</span>`;
}

function stamp(verdict, withAnim) {
  if (verdict === "pending") return `<span class="mono-label">— awaiting review</span>`;
  const approved = verdict === "approved";
  return `<span role="img" aria-label="${approved ? "Approved" : "Revise"}" class="stamp ${approved ? "stamp-ok" : "stamp-no"}${withAnim ? " stamp-anim" : ""}">${approved ? "Approved" : "Revise"}</span>`;
}

function sheetHeading(code, title, right) {
  return `<div class="sheet-heading">
    <h2><span class="sh-code">${esc(code)}</span><span class="sh-title">${esc(title)}</span></h2>
    ${right || ""}
  </div>`;
}

// ── Title block (the lab's header) ───────────────────────────────────────────
function titleBlockHTML(mode, score, certReady) {
  return `<header class="titleblock" aria-label="Lab title block">
    <div class="tb-main">
      ${mono("compTIA security+ sy0-801 · domain 3 · objective 3.2 — training lab (synthetic)")}
      <h1>Design Review Board — securing the enterprise infrastructure</h1>
      <p class="tb-sub">Secure system design · access controls · segmentation · connectivity — the Northwind Freight re-architecture (fictional).</p>
    </div>
    <div class="tb-cells">
      <div class="tb-cell"><span>Sheet</span><b>1 / 1</b></div>
      <div class="tb-cell"><span>Revision</span><b>${mode === "medium" ? "A · guided" : "B · audit"}</b></div>
      <div class="tb-cell"><span>Scale</span><b>1 : 1</b></div>
      <div class="tb-cell"><span>Score</span><b>${score}%</b></div>
    </div>
    <div class="tb-actions">
      <span class="tb-drafted">drafted by: security architect (you)</span>
      <span class="tb-spacer"></span>
      ${certReady ? `<button type="button" class="btn btn-cert" data-action="open-cert">view certificate</button>` : ""}
      <button type="button" class="btn btn-outline" data-action="switch-revision">switch revision</button>
      <button type="button" class="btn btn-danger-outline" data-action="reset-lab">reset lab</button>
    </div>
  </header>`;
}

// ── Mode selection (Revision A / Revision B) ─────────────────────────────────
function modeSelectHTML() {
  const card = (rev, title, sub, points, tone, mode) => `
    <div class="rev-card" style="border-top-color:${tone}">
      <div class="rev-head">
        <span class="rev-tag" style="color:${tone}">REV ${rev}</span>
        <div>
          <h2>${esc(title)}</h2>
          ${mono(esc(sub))}
        </div>
      </div>
      <ul class="rev-points">
        ${points.map((p) => `<li><span aria-hidden="true" class="rev-dot" style="background-color:${tone}"></span>${esc(p)}</li>`).join("")}
      </ul>
      <button type="button" class="btn btn-solid w-full" style="background-color:${tone}" data-action="select-mode" data-mode="${mode}">Open revision ${rev}</button>
    </div>`;
  return `<div class="mode-wrap anim-rise">
    ${paper(`
      <div class="mode-head">
        ${mono("compTIA security+ sy0-801 · objective 3.2 · training lab — all data synthetic")}
        <h1>The Design Review Board needs a security architect.</h1>
        <p>Northwind Freight &amp; Terminal Co. (fictional) just lived through incident IR-2411: an internet-facing portal parked in
        the user LAN, flat east-west traffic, implicit trust everywhere. You inherit the as-built drawing, the evidence binder, and
        one instruction: <strong>manage the security architecture until it protects the infrastructure.</strong></p>
      </div>
      <div class="mode-cards">
        ${card("A", "Guided design review", "Medium · educational", [
          "12 guided objectives, in order, each a single clear bite",
          "3-tier hints (nudge → direction → demonstration) — free to use, costs stars",
          "Tolerant checks: teaching feedback on every attempt, no penalties",
          "6-question concept check with explanations",
        ], "#4D7C0F", "medium")}
        ${card("B", "Independent design audit", "Hard · test & stretch", [
          "9 broad, multi-step challenges spanning the whole sheet",
          "Noisy evidence with red herrings; no 'where to look'",
          "Strict validation: exact values, multi-part answers, near-misses rejected",
          "One optional nudge — visibly costs a star credit",
        ], "#B45309", "hard")}
      </div>
      <p class="mode-foot">Both revisions share the same drawing and evidence. Your work saves automatically; RESET returns everything to pristine.</p>
    `)}
  </div>`;
}

// ── Scenario briefing (memo) ─────────────────────────────────────────────────
function briefingHTML(mode) {
  const memo = `FROM:  CISO, Northwind Freight & Terminal Co.
TO:    You — Security Architect (new hire)
RE:    Post-incident architecture review (IR-2411)

Six hours of yard disruption taught us our architecture is the
incident. You will work the as-built drawing on the DESIGN tab:

 1. READ the evidence binder (Field Manual + E-01…E-07) — the
    standard NW-SEC-STD-7 in E-07 is the ground truth.
 2. DECIDE on the drawing: click zones, assets, link chips and
    the CONTROL REGISTER; every sheet opens decision controls.
 3. CHECK each finding in the review checklist (right rail).
    Wrong answers are never a penalty — they are the lesson.
 4. SIT the board exam tab, then read the as-built debrief and
    claim your commissioning certificate.`;
  return `<div class="brief-wrap anim-rise">
    ${paper(`
      <div class="brief-head">
        ${mono(`engagement memo · e-01 · revision ${mode === "medium" ? "A (guided)" : "B (audit)"}`)}
        <h1>Read this first — then pick up your pen.</h1>
      </div>
      <pre class="memo">${esc(memo)}</pre>
      <div class="brief-foot">
        <p>${mode === "medium"
          ? "Revision A guides you objective by objective with hints where you want them. Follow the checklist top to bottom."
          : "Revision B hands you the noisy evidence and walks away. The checklist is broader and stricter — distractors included."}</p>
        <div class="brief-actions">
          <button type="button" class="btn btn-solid" data-action="begin-lab">Proceed to the workbench →</button>
          <button type="button" class="btn btn-outline" data-action="back-to-modes">← back</button>
        </div>
      </div>
    `)}
  </div>`;
}
