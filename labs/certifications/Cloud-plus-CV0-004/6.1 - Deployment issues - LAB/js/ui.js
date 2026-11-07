// ─── Launch Control lab — UI render layer (js/ui.js) ─────────────────────────
// Vanilla-DOM translation of the original React components:
//   HeaderStrip, ModeSelect, Briefing, PipelineRail(+Chips), Workbench,
//   TriageDesk(+SweepBoard), QuizPanel, Debrief  (see js/widgets.js for
//   FieldManual / ObjectivesTracker / CompletionModal).
// Every text node that originates from lab data is escaped; copy matches the
// original string-for-string.

(function () {
  "use strict";

  const { store } = window.LabStore;
  const engine = window.LAB_OBJECTIVES;
  const A = () => window.LabStore.actions;

  // ── tiny helpers ───────────────────────────────────────────────────────────
  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // Lucide icons — exact SVG path data copied from the installed
  // lucide-react@0.525.0 package (no icon fonts, no CDNs).
  const ICONS = {
    "book-open": '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    "list-checks": '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    "rotate-ccw": '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    unplug: '<path d="m19 5 3-3"/><path d="m2 22 3-3"/><path d="M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z"/><path d="M7.5 13.5 10 11"/><path d="M10.5 16.5 13 14"/><path d="m12 6 6 6 2.3-2.3a2.4 2.4 0 0 0 0-3.4l-2.6-2.6a2.4 2.4 0 0 0-3.4 0Z"/>',
    gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
    "shield-check": '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    "book-open-check": '<path d="M12 21V7"/><path d="m16 12 2 2 4-4"/><path d="M22 6V4a1 1 0 0 0-1-1h-5a4 4 0 0 0-4 4 4 4 0 0 0-4-4H3a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h6a3 3 0 0 1 3 3 3 3 0 0 1 3-3h6a1 1 0 0 0 1-1v-1.3"/>',
    "check-circle-2": '<path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/>',
    "chevron-up": '<path d="m18 15-6-6-6 6"/>',
    "chevron-down": '<path d="m6 9 6 6 6-6"/>',
    "clipboard-check": '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
    "file-warning": '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    "external-link": '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    lightbulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
    crosshair: '<circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    "arrow-right": '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    radar: '<path d="M19.07 4.93A10 10 0 0 0 6.99 3.34"/><path d="M4 6h.01"/><path d="M2.29 9.62A10 10 0 1 0 21.31 8.35"/><path d="M16.24 7.76A6 6 0 1 0 8.23 16.67"/><path d="M12 18h.01"/><path d="M17.99 11.66A6 6 0 0 1 15.77 16.67"/><circle cx="12" cy="12" r="2"/><path d="m13.41 10.59 5.66-5.66"/>',
    swords: '<polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" x2="19" y1="19" y2="13"/><line x1="16" x2="20" y1="16" y2="20"/><line x1="19" x2="21" y1="21" y2="19"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/><line x1="5" x2="9" y1="14" y2="18"/><line x1="7" x2="4" y1="17" y2="20"/><line x1="3" x2="5" y1="19" y2="21"/>',
    trophy: '<path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"/><path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"/><path d="M18 9h1.5a1 1 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"/><path d="M6 9H4.5a1 1 0 0 1 0-5H6"/>',
    "graduation-cap": '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
    "party-popper": '<path d="M5.8 11.3 2 22l10.7-3.79"/><path d="M4 3h.01"/><path d="M22 8h.01"/><path d="M15 2h.01"/><path d="M22 20h.01"/><path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"/><path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17"/><path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7"/><path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  };

  function icon(name, cls) {
    return `<svg class="ic ${cls || ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;
  }

  // ── small visual bits (port of bits.tsx) ───────────────────────────────────
  const STATUS_CHIP = {
    failed: { label: "FAILED", cls: "chip-failed" },
    degraded: { label: "DEGRADED", cls: "chip-degraded" },
    "success-risk": { label: "SUCCESS ?", cls: "chip-degraded" },
    healthy: { label: "HEALTHY", cls: "chip-healthy" },
    planned: { label: "PLANNED", cls: "chip-planned" },
  };
  const STATUS_DOT = {
    failed: "dot-failed",
    degraded: "dot-degraded",
    "success-risk": "dot-risk",
    healthy: "dot-healthy",
    planned: "dot-planned",
  };
  const PILLAR_BADGE = {
    P1: { label: "P1 · UNDERSTAND", cls: "pill-p1" },
    P2: { label: "P2 · RECOGNIZE", cls: "pill-p2" },
    P3: { label: "P3 · DETECT", cls: "pill-p3" },
    P4: { label: "P4 · MITIGATE", cls: "pill-p4" },
  };

  function statusChip(status) {
    const it = STATUS_CHIP[status];
    return `<span class="status-chip ${it.cls}">${it.label}</span>`;
  }
  function statusDot(status) {
    return `<span aria-hidden="true" class="status-dot ${STATUS_DOT[status]}"></span>`;
  }
  function stageBadge(stageId) {
    const st = window.LAB.STAGE_MAP[stageId];
    if (!st) return "";
    return `<span class="stage-badge">S${st.num} · ${esc(st.name)}</span>`;
  }
  function pillarBadge(pillar) {
    const it = PILLAR_BADGE[pillar];
    return `<span class="status-chip ${it.cls}">${it.label}</span>`;
  }

  function sparkline(points, bad) {
    const w = 132, h = 34;
    const max = Math.max(...points, 1);
    const step = points.length > 1 ? w / (points.length - 1) : w;
    const pts = points
      .map((p, i) => `${(i * step).toFixed(1)},${(h - (p / max) * (h - 4) - 2).toFixed(1)}`)
      .join(" ");
    const color = bad ? "#B3282D" : "#0B7285";
    return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="metric trend" class="sparkline">
      <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
      <line x1="0" y1="${h - 1}" x2="${w}" y2="${h - 1}" stroke="#E4E0D6" stroke-width="1"/>
    </svg>`;
  }

  function progressRing(done, total, size) {
    const r = (size - 6) / 2;
    const c = 2 * Math.PI * r;
    const frac = total > 0 ? done / total : 0;
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="Progress ${done} of ${total}" class="sparkline">
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="#E4E0D6" stroke-width="4"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="#C2410C" stroke-width="4" stroke-linecap="round"
        stroke-dasharray="${c * frac} ${c}" transform="rotate(-90 ${size / 2} ${size / 2})" class="ring-progress"/>
      <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" class="ring-text" font-size="${size * 0.3}">${done}/${total}</text>
    </svg>`;
  }

  function stars(n, size) {
    const s = size || 16;
    let out = `<span role="img" aria-label="${n} of 5 stars" class="stars-row">`;
    for (let i = 1; i <= 5; i++) {
      out += `<svg width="${s}" height="${s}" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.7l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 15l-5.2 2.7 1-5.8L1.6 7.8l5.8-.8L10 1.7z" fill="${i <= n ? "#E8590C" : "#E4E0D6"}"/></svg>`;
    }
    return out + "</span>";
  }

  function feedbackBox(kind, title, text) {
    return `<div role="status" aria-live="polite" class="feedback ${kind === "pass" ? "feedback-pass" : "feedback-fail"}">
      <p class="feedback-title ${kind === "pass" ? "t-green" : "t-red"}">${
        kind === "pass"
          ? `CHECK PASSED — ${esc(title)}`
          : `${icon("file-warning", "ic-14")} <span>CHECK FAILED — ${esc(title)}</span>`
      }</p>
      <p class="feedback-body">${esc(text)}</p>
    </div>`;
  }

  // ── header strip ───────────────────────────────────────────────────────────
  function renderHeader() {
    const s = store;
    if (!s.mode) return "";
    const done = engine.doneCount(s, s.mode);
    const total = engine.objectivesForMode(s, s.mode).length;
    const unlockAt = window.LAB.QUIZ_UNLOCK[s.mode];
    const quizLocked = done < unlockAt;
    const steps = [
      { id: "room", label: "Shift floor", locked: false },
      { id: "quiz", label: "Knowledge check", locked: quizLocked },
      { id: "debrief", label: "Debrief", locked: false },
    ];
    return `
    <header class="site-header">
      <div class="header-inner">
        <div class="header-brand">
          <span aria-hidden="true" class="brand-mark">LC</span>
          <div class="brand-text">
            <p class="brand-title">LAUNCH CONTROL</p>
            <p class="brand-sub">Cloud+ CV0-004 · 6.1 deployment issues · wave 3 · window 21:00–22:30Z</p>
          </div>
        </div>
        <nav aria-label="Lab phases" class="phase-nav">
          ${steps
            .map(
              (st) => `
            <button type="button" data-action="goto-phase" data-phase="${st.id}" ${
              st.locked ? "disabled" : ""
            } ${s.phase === st.id ? 'aria-current="page"' : ""} class="phase-btn ${
              s.phase === st.id ? "is-active" : ""
            } ${st.locked ? "is-locked" : ""}">
              ${st.locked ? icon("lock", "ic-12") : ""}${st.label}
            </button>`,
            )
            .join("")}
        </nav>
        <div class="header-tools">
          <div class="header-ring" aria-hidden="true">${progressRing(done, total, 36)}</div>
          <button type="button" data-action="open-tracker" class="btn btn-outline btn-sm">${icon("list-checks", "ic-14 t-signal")} Objectives</button>
          <button type="button" data-action="open-manual" class="btn btn-outline btn-sm">${icon("book-open", "ic-14 t-teal")} Field manual</button>
          <button type="button" data-action="confirm-reset" data-variant="header" aria-label="Reset lab" class="btn btn-outline btn-sm btn-reset">
            ${icon("rotate-ccw", "ic-14")}<span class="reset-label">Reset</span>
          </button>
        </div>
      </div>
    </header>`;
  }

  // ── mode select (Phase: mode) ──────────────────────────────────────────────
  function renderModeSelect() {
    const cards = window.LAB.MODE_CARDS;
    return `
    <div class="mode-wrap">
      <div class="mode-inner">
        <div class="fade-rise">
          <div class="mode-eyebrow">
            <span aria-hidden="true" class="brand-mark brand-mark-lg">LC</span>
            <span class="mono-eyebrow">Interactive practice lab</span>
          </div>
          <h1 class="mode-title">LAUNCH CONTROL <span class="t-signal">— Wave 3</span></h1>
          <p class="mode-lede">Thirteen cloud deployments are scheduled on launch night. Eleven will fail in eleven different ways — every one a <strong>CompTIA Cloud+ CV0-004</strong> objective&nbsp;6.1 pattern: incompatibility, misconfigurations, outdated definitions, deprecation, outages, resource limits, regional availability. Diagnose them, fix them, and prevent the next wave.</p>
        </div>
        <div class="mode-grid">
          ${["medium", "hard"]
            .map((m, i) => {
              const card = cards[m];
              const hard = m === "hard";
              return `
            <button type="button" data-action="set-mode" data-mode="${m}" aria-label="Select ${esc(card.role)} mode"
              class="mode-card fade-rise fade-delay-${i} ${hard ? "mode-card-hard" : "mode-card-medium"}">
              <div class="mode-card-top">
                <span class="mode-card-mark ${hard ? "mark-ink" : "mark-teal"}">${icon(hard ? "flame" : "gauge", "ic-20")}</span>
                <span class="badge-outline">${hard ? "challenge" : "educational"}</span>
              </div>
              <h2 class="mode-card-name">${esc(card.name)}</h2>
              <p class="mode-card-role ${hard ? "t-signal" : "t-teal"}">${esc(card.role)}</p>
              <ul class="mode-card-list">
                ${card.bullets.map((b) => `<li><span aria-hidden="true" class="${hard ? "t-signal" : "t-teal"}">▸</span><span>${esc(b)}</span></li>`).join("")}
              </ul>
              <span class="mode-card-cta ${hard ? "t-signal" : "t-teal"}">Take the ${hard ? "commander seat" : "technician shift"} ${icon("rocket", "ic-16 cta-rocket")}</span>
            </button>`;
            })
            .join("")}
        </div>
        <p class="mode-footnote">${icon("shield-check", "ic-14")} 100% synthetic training data — fictional provider, fictional operator. Progress auto-saves in your browser.</p>
      </div>
    </div>`;
  }

  // ── briefing (Phase: briefing) ─────────────────────────────────────────────
  function renderBriefing() {
    const B = window.LAB.BRIEFING;
    const mode = store.mode || "medium";
    const card = window.LAB.MODE_CARDS[mode];
    return `
    <div class="brief-wrap">
      <div class="brief-card fade-rise">
        <div class="brief-badges">
          <span class="badge-solid">Mission brief</span>
          <span class="badge-outline">mode · ${esc(card.name)}</span>
        </div>
        <h1 class="brief-title">Wave 3 launch night</h1>
        <dl class="brief-dl">
          <div><dt class="brief-dt">Organization</dt><dd>${esc(B.org)}</dd></div>
          <div><dt class="brief-dt">Event window</dt><dd>${esc(B.event)}</dd></div>
          <div><dt class="brief-dt">Situation</dt><dd>${esc(B.situation)}</dd></div>
          <div><dt class="brief-dt">What you will face</dt><dd>${esc(B.hook)}</dd></div>
        </dl>
        <div class="brief-rules">
          <h2 class="brief-rules-title">${icon("book-open-check", "ic-16 t-teal")} Shift rules</h2>
          <ul class="brief-rules-list">
            ${B.rules.map((r) => `<li><span aria-hidden="true" class="t-teal">✓</span><span>${esc(r)}</span></li>`).join("")}
          </ul>
        </div>
        <p class="brief-cert">${esc(B.cert)}</p>
        <div class="brief-actions">
          <button type="button" data-action="finish-briefing" class="btn btn-primary btn-lg">${icon("rocket", "ic-16")} Take the shift</button>
        </div>
      </div>
    </div>`;
  }

  // ── pipeline rail + mobile chips ───────────────────────────────────────────
  function railSolved(caseDef) {
    const s = store;
    if (s.mode === "medium") {
      const cs = s.cases[caseDef.id];
      return cs != null && cs.category != null && cs.category === caseDef.truthCategory;
    }
    return !!s.objectives["OBJ-H1"] && s.objectives["OBJ-H1"].done;
  }

  function renderRail() {
    const { CASES, STAGES } = window.LAB;
    return `
    <nav aria-label="Deployment pipeline" class="lab-scroll rail">
      <div class="rail-inner">
        <div aria-hidden="true" class="rail-line"></div>
        ${STAGES.map((stage) => {
          const stageCases = CASES.filter((c) => c.stageId === stage.id);
          return `
          <div class="rail-stage">
            <div class="rail-row">
              <div class="rail-num">${stage.num}</div>
              <div class="rail-stage-body">
                <h3 class="rail-stage-name">${esc(stage.name)}</h3>
                <p class="rail-stage-blurb">${esc(stage.blurb)}</p>
                <div class="rail-cases">
                  ${stageCases
                    .map((c) => {
                      const solved = railSolved(c);
                      const active = store.activeCase === c.id;
                      return `
                    <button type="button" data-action="select-case" data-case="${c.id}" ${
                      active ? 'aria-current="true"' : ""
                    } aria-label="${c.id} ${esc(c.service)} — ${esc(c.symptom)}" class="rail-chip ${active ? "is-active" : ""}">
                      ${statusDot(c.status)}
                      <span class="rail-chip-id">${c.id.replace("dep-", "")}</span>
                      <span class="rail-chip-name">${esc(c.service)}</span>
                      ${solved ? icon("check-circle-2", "ic-14 t-green rail-check") : ""}
                    </button>`;
                    })
                    .join("")}
                </div>
              </div>
            </div>
          </div>`;
        }).join("")}
        <p class="rail-foot">Chips sit where each failure <em>surfaced</em>. Root causes often live one or two stages earlier — the triage desk is where you prove which.</p>
      </div>
    </nav>`;
  }

  function renderChips() {
    const { CASES, STAGES, STAGE_MAP } = window.LAB;
    return `
    <div class="lab-scroll chips">
      ${STAGES.map((stage) => {
        const stageCases = CASES.filter((c) => c.stageId === stage.id);
        if (stageCases.length === 0) return "";
        return `
        <div class="chip-group">
          <span aria-hidden="true" class="chip-stage-num">${stage.num}</span>
          ${stageCases
            .map((c) => {
              const solved = railSolved(c);
              return `
            <button type="button" data-action="select-case" data-case="${c.id}" aria-label="${esc(STAGE_MAP[stage.id].name)}: ${c.id} ${esc(c.service)}" class="chip ${store.activeCase === c.id ? "is-active" : ""}">
              ${statusDot(c.status)}
              <span>${esc(c.service)}</span>
              ${solved ? icon("check-circle-2", "ic-12 t-green") : ""}
            </button>`;
            })
            .join("")}
        </div>`;
      }).join("")}
    </div>`;
  }

  // ── workbench ──────────────────────────────────────────────────────────────
  const SELECTABLE_LOG = ["dep-2201", "dep-2202", "dep-2203", "dep-2205", "dep-2207", "dep-2208", "dep-2209"];

  function logView(lines, caseId, selectable) {
    const selected = (store.cases[caseId] && store.cases[caseId].lines) || [];
    return `
    <div class="lab-scroll logview" aria-label="${selectable ? "selectable " : ""}deployment log" data-log-role="${caseId}">
      ${lines
        .map((l) => {
          const isSel = selected.includes(l.id);
          const isErr = l.text.includes("[ERROR]");
          const isWarn = l.text.includes("[WARN]");
          return `
        <button type="button" ${selectable ? `data-action="toggle-line" data-case="${caseId}" data-line="${l.id}"` : "disabled"}
          ${selectable ? `aria-pressed="${isSel}"` : ""} aria-label="${
            selectable ? `${isSel ? "unselect" : "select"} evidence line ${l.id}` : `log line ${l.id}`
          }" class="log-line ${selectable ? "is-selectable" : ""} ${isSel ? "is-tagged" : ""}">
          <span class="log-id">${l.id}</span>
          <span class="log-t">${esc(l.t)}</span>
          <span class="log-text ${isErr ? "t-red" : isWarn ? "t-amber" : ""}">${esc(l.text)}</span>
          ${isSel ? '<span class="log-tagged">TAGGED</span>' : ""}
        </button>`;
        })
        .join("")}
      ${selectable ? '<p class="log-hint">Click a line to tag it as evidence — some objectives require the exact failing line.</p>' : ""}
    </div>`;
  }

  function templateView(tpl) {
    return `
    <div class="lab-scroll templateview" aria-label="IaC template">
      ${tpl.lines
        .map(
          (ln) => `
        <div class="tpl-line"><span class="tpl-num">${ln.n}</span><span class="tpl-text">${esc(ln.text)}</span></div>`,
        )
        .join("")}
    </div>`;
  }

  function metricsView(metrics) {
    return `
    <div class="metrics">
      ${metrics
        .map(
          (m) => `
        <div class="metric-row">
          <div class="metric-info">
            <p class="metric-label">${esc(m.label)}</p>
            <p class="metric-now">now: ${m.points[m.points.length - 1]} ${esc(m.unit)} · 6-min window</p>
          </div>
          ${sparkline(m.points, m.bad)}
        </div>`,
        )
        .join("")}
    </div>`;
  }

  function configView(config) {
    return `
    <div class="config">
      ${config
        .map(
          (tbl) => `
        <div class="config-table">
          <p class="config-title">${esc(tbl.title)}</p>
          <table class="table">
            <thead><tr><th scope="col">Check</th><th scope="col">State</th></tr></thead>
            <tbody>
              ${tbl.rows
                .map((r) => {
                  const cls = r.state === "bad" ? "t-red-strong" : r.state === "warn" ? "t-amber" : r.state === "ok" ? "t-green" : "";
                  return `<tr><td class="cell-k">${esc(r.k)}</td><td class="cell-v mono ${cls}">${esc(r.v)}</td></tr>`;
                })
                .join("")}
            </tbody>
          </table>
        </div>`,
        )
        .join("")}
    </div>`;
  }

  function renderWorkbench() {
    const { CASE_MAP } = window.LAB;
    const c = store.activeCase ? CASE_MAP[store.activeCase] : null;
    const cs = store.activeCase ? store.cases[store.activeCase] : null;
    if (!store.mode) return "";
    if (!c || !cs) {
      return `<div class="wb-empty"><p>Select a deployment chip on the pipeline rail to open its evidence.</p></div>`;
    }
    const tabs = [];
    if (c.log) tabs.push({ id: "log", label: "Deployment log" });
    if (c.events) tabs.push({ id: "events", label: "Events" });
    if (c.template) tabs.push({ id: "template", label: "Template" });
    if (c.userdata) tabs.push({ id: "userdata", label: c.userdata[0].t === "build" ? "Image recipe" : "User data" });
    if (c.metrics) tabs.push({ id: "metrics", label: "Metrics" });
    if (c.config) tabs.push({ id: "config", label: "Config" });

    const selectableLog = SELECTABLE_LOG.includes(c.id);
    let body = "";
    if (store.activeTab === "log" && c.log) body = logView(c.log, c.id, selectableLog);
    else if (store.activeTab === "events" && c.events) body = `<div class="wb-pane">${logView(c.events, c.id, false)}</div>`;
    else if (store.activeTab === "userdata" && c.userdata) body = `<div class="wb-pane">${logView(c.userdata, c.id, selectableLog)}</div>`;
    else if (store.activeTab === "template" && c.template) body = templateView(c.template);
    else if (store.activeTab === "metrics" && c.metrics) body = metricsView(c.metrics);
    else if (store.activeTab === "config" && c.config) body = configView(c.config);

    return `
    <section aria-label="Evidence workbench — ${c.id}" class="wb">
      <header class="wb-header">
        <h2 class="wb-title">${c.id} <span class="wb-service">· ${esc(c.service)}</span></h2>
        ${statusChip(c.status)}
        ${stageBadge(c.stageId)}
        <p class="wb-symptom">${esc(c.symptom)}</p>
      </header>
      <div class="wb-body">
        <div role="tablist" aria-label="Evidence tabs" class="wb-tabs">
          ${tabs
            .map(
              (t) => `
            <button type="button" role="tab" aria-selected="${store.activeTab === t.id}" data-action="select-tab" data-tab="${t.id}" class="wb-tab ${store.activeTab === t.id ? "is-active" : ""}">${t.label}</button>`,
            )
            .join("")}
        </div>
        <div class="wb-content">${body}</div>
      </div>
    </section>`;
  }

  // ── triage desk (diagnosis + sweep) ────────────────────────────────────────
  function detailSelect(c, f) {
    const val = (store.cases[c.id] && store.cases[c.id].detail[f.id]) || "";
    const locked = isLocked(c);
    return `
    <div>
      <label class="field-label" for="fld-${c.id}-${f.id}">${esc(f.label)}</label>
      <select id="fld-${c.id}-${f.id}" aria-label="${esc(f.label)}" data-field-role="detail" data-case="${c.id}" data-field="${f.id}" class="select select-tall" ${locked ? "disabled" : ""}>
        <option value="" ${val === "" ? "selected" : ""} disabled>select…</option>
        ${(f.options || [])
          .map((o) => `<option value="${o.value}" ${val === o.value ? "selected" : ""}>${esc(o.label)}</option>`)
          .join("")}
      </select>
    </div>`;
  }

  function detailText(c, f) {
    const val = (store.cases[c.id] && store.cases[c.id].detail[f.id]) || "";
    const locked = isLocked(c);
    return `
    <div>
      <label class="field-label" for="fld-${c.id}-${f.id}">${esc(f.label)}</label>
      <input id="fld-${c.id}-${f.id}" aria-label="${esc(f.label)}" type="text" value="${esc(val)}" placeholder="${esc(f.placeholder || "")}"
        data-field-role="detail-text" data-case="${c.id}" data-field="${f.id}" autocomplete="off" spellcheck="false"
        class="input input-mono" ${locked ? "disabled" : ""}/>
    </div>`;
  }

  function detailOrder(c, f) {
    const cs = store.cases[c.id] || {};
    const orders = (cs.orders && cs.orders[f.id]) || [];
    const items = f.options || [];
    const remaining = items.filter((o) => !orders.includes(o.value));
    const locked = isLocked(c);
    return `
    <div>
      <span class="field-label">${esc(f.label)}</span>
      <ol class="order-list" aria-label="${esc(f.label)}">
        ${orders
          .map((val, i) => {
            const label = (items.find((o) => o.value === val) || {}).label || val;
            return `
          <li class="order-item">
            <span class="order-num">${i + 1}</span>
            <span class="order-label">${esc(label)}</span>
            <button type="button" data-action="order-move" data-case="${c.id}" data-field="${f.id}" data-idx="${i}" data-dir="-1"
              aria-label="Move up: ${esc(label)}" class="icon-btn" ${i === 0 || locked ? "disabled" : ""}>${icon("chevron-up", "ic-16")}</button>
            <button type="button" data-action="order-move" data-case="${c.id}" data-field="${f.id}" data-idx="${i}" data-dir="1"
              aria-label="Move down: ${esc(label)}" class="icon-btn" ${i === orders.length - 1 || locked ? "disabled" : ""}>${icon("chevron-down", "ic-16")}</button>
          </li>`;
          })
          .join("")}
      </ol>
      ${
        remaining.length > 0
          ? `
      <select aria-label="Add step to ${esc(f.label)}" data-field-role="order-add" data-case="${c.id}" data-field="${f.id}" class="select select-tall" ${locked ? "disabled" : ""}>
        <option value="" selected disabled>+ add a step in order…</option>
        ${remaining.map((o) => `<option value="${o.value}">${esc(o.label)}</option>`).join("")}
      </select>`
          : ""
      }
    </div>`;
  }

  function detailChecks(c, f) {
    const cs = store.cases[c.id] || {};
    const cur = (cs.checks && cs.checks[f.id]) || [];
    const locked = isLocked(c);
    return `
    <div>
      <span class="field-label">${esc(f.label)}</span>
      <div class="checks">
        ${(f.options || [])
          .map(
            (o) => `
          <label class="check-row">
            <input type="checkbox" data-action="toggle-check" data-case="${c.id}" data-field="${f.id}" data-value="${o.value}"
              aria-label="${esc(o.label)}" ${cur.includes(o.value) ? "checked" : ""} ${locked ? "disabled" : ""}/>
            <span>${esc(o.label)}</span>
          </label>`,
          )
          .join("")}
      </div>
    </div>`;
  }

  function runbookBlock(c, hard) {
    if (!c.runbook || c.runbook.length === 0) return "";
    const cs = store.cases[c.id] || {};
    const actions = cs.actions || [];
    const actionPos = cs.actionPos || {};
    const ordered = hard && c.runbookOrder;
    const locked = isLocked(c);
    const selectedCount = actions.length;
    return `
    <div>
      <span class="field-label">Remediation plan ${ordered ? "— select steps AND number them 1..n" : "— select every action that belongs"}</span>
      <div class="checks">
        ${c.runbook
          .map((a) => {
            const sel = actions.includes(a.id);
            return `
          <label class="check-row ${sel ? "is-selected" : ""}">
            <input type="checkbox" data-action="toggle-action" data-case="${c.id}" data-action-id="${a.id}" aria-label="${esc(a.label)}"
              ${sel ? "checked" : ""} ${locked ? "disabled" : ""}/>
            <span class="check-label">${esc(a.label)}</span>
            ${
              ordered && sel
                ? `
            <select aria-label="Position for: ${esc(a.label)}" data-field-role="action-pos" data-case="${c.id}" data-action-id="${a.id}" class="select select-pos" ${locked ? "disabled" : ""}>
              <option value="" ${!actionPos[a.id] ? "selected" : ""} disabled>…</option>
              ${Array.from({ length: selectedCount }, (_, i) => i + 1)
                .map((n) => `<option value="${n}" ${actionPos[a.id] === n ? "selected" : ""}>${n}</option>`)
                .join("")}
            </select>`
                : ""
            }
          </label>`;
          })
          .join("")}
      </div>
    </div>`;
  }

  function isLocked(c) {
    const mode = store.mode;
    const objectiveId = (window.LAB_OBJECTIVES.CASE_OBJECTIVE[mode] || {})[c.id] || null;
    return !!objectiveId && !!store.objectives[objectiveId] && store.objectives[objectiveId].done;
  }

  function caseObjective(c) {
    return (window.LAB_OBJECTIVES.CASE_OBJECTIVE[store.mode] || {})[c.id] || null;
  }

  function diagnosisPanel(c) {
    const hard = store.mode === "hard";
    const objectiveId = caseObjective(c);
    const locked = isLocked(c);
    const category = (store.cases[c.id] && store.cases[c.id].category) || null;
    const fields = c.detailFields.filter((f) => (hard ? true : !f.hardOnly));
    const objState = objectiveId ? store.objectives[objectiveId] : null;

    let feedback = "";
    if (objectiveId && objState && objState.lastResult) {
      const def = engine.OBJECTIVES.find((o) => o.id === objectiveId);
      const result = def.validate(store);
      feedback = feedbackBox(objState.lastResult === "pass" ? "pass" : "fail",
        objState.lastResult === "pass" ? result.title : `attempt #${objState.attempts}`, result.feedback);
    }

    return `
    <div class="diagnosis">
      <div>
        <label class="field-label" for="cat-${c.id}">Root-cause category (CV0-004 6.1 taxonomy)</label>
        <select id="cat-${c.id}" data-field-role="category" data-case="${c.id}" class="select select-tall" ${locked ? "disabled" : ""}>
          <option value="" ${category ? "" : "selected"} disabled>classify the failure…</option>
          ${window.LAB.CATEGORIES.map((k) => `<option value="${k.id}" ${category === k.id ? "selected" : ""}>${esc(k.label)}</option>`).join("")}
        </select>
      </div>
      ${fields
        .map((f) => {
          if (f.kind === "select") return detailSelect(c, f);
          if (f.kind === "text") return detailText(c, f);
          if (f.kind === "order") return detailOrder(c, f);
          if (f.kind === "checks") return detailChecks(c, f);
          return "";
        })
        .join("")}
      ${runbookBlock(c, hard)}
      <div class="diag-msg" data-role="local-msg" hidden></div>
      ${
        objectiveId
          ? `<button type="button" data-action="file-diagnosis" data-case="${c.id}" ${locked ? "disabled" : ""} class="btn btn-primary btn-block">
              ${icon("clipboard-check", "ic-16")} ${locked ? "Filed ✓ — locked" : `File diagnosis · CHECK ${objectiveId.replace("OBJ-", "")}`}
            </button>`
          : `<button type="button" data-action="record-classification" data-case="${c.id}" class="btn btn-outline btn-block">Record classification</button>
             ${hard ? '<button type="button" data-action="open-sweep" class="linklike">Open the Sweep board to run the full-board check →</button>' : ""}`
      }
      ${feedback}
    </div>`;
  }

  function sweepBoard() {
    const { SWEEP_ORDER, CASE_MAP, CATEGORIES, STAGE_MAP } = window.LAB;
    const objState = store.objectives["OBJ-H1"];
    const def = engine.OBJECTIVES.find((o) => o.id === "OBJ-H1");
    let result = "";
    if (objState && objState.lastResult) {
      const r = def.validate(store);
      result = `
      <div role="status" aria-live="polite" class="feedback ${r.pass ? "feedback-pass" : "feedback-fail"}">
        <p class="feedback-title ${r.pass ? "t-green" : "t-red"}">${r.pass ? "SWEEP CLEAN" : `SWEEP INCOMPLETE — attempt #${objState.attempts}`}</p>
        <p class="feedback-body">${esc(r.feedback)}</p>
      </div>`;
    }
    return `
    <div class="sweep" id="sweep-board">
      <p class="sweep-intro">Classify all 13 rows. Two of them need <strong>no fault</strong> — spotting what does <em>not</em> need action is half the discipline. One wrong row fails the sweep.</p>
      <div class="lab-scroll sweep-scroll">
        <table class="table sweep-table">
          <caption class="sr-only">Sweep board — classify each deployment</caption>
          <thead class="sweep-head">
            <tr>
              <th scope="col">Deployment</th><th scope="col">State</th><th scope="col">Category</th>
            </tr>
          </thead>
          <tbody>
            ${SWEEP_ORDER.map((id) => {
              const c = CASE_MAP[id];
              const cat = (store.cases[id] && store.cases[id].category) || "";
              return `
              <tr>
                <td>
                  <p class="sweep-id">${id}</p>
                  <p class="sweep-service">${esc(c.service)}</p>
                  <p class="sweep-symptom">${esc(c.symptom)}</p>
                </td>
                <td>${statusChip(c.status)}<p class="sweep-stage">S${STAGE_MAP[c.stageId].num}</p></td>
                <td>
                  <select aria-label="Category for ${id}" data-field-role="sweep-cat" data-case="${id}" class="select sweep-select">
                    <option value="" ${cat ? "" : "selected"} disabled>classify…</option>
                    ${CATEGORIES.map((k) => `<option value="${k.id}" ${cat === k.id ? "selected" : ""}>${esc(k.short)}</option>`).join("")}
                  </select>
                </td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>
      <p class="sweep-err" data-role="sweep-err" role="alert" hidden></p>
      <button type="button" data-action="run-sweep" class="btn btn-primary btn-block">${icon("clipboard-check", "ic-16")} Run sweep check · OBJ-H1</button>
      ${result}
    </div>`;
  }

  function renderTriage() {
    const { CASE_MAP, CATEGORY_MAP } = window.LAB;
    const c = store.activeCase ? CASE_MAP[store.activeCase] : null;
    const hard = store.mode === "hard";
    const tab = store.triageTab;
    let body;
    if (tab === "sweep" && hard) body = sweepBoard();
    else body = c ? diagnosisPanel(c) : '<p class="triage-empty">Pick a deployment chip to file a diagnosis.</p>';
    return `
    <aside aria-label="Triage desk" class="triage">
      <header class="triage-header">
        <h2 class="triage-title">Triage desk</h2>
        <p class="triage-sub">${c ? `${c.id} · ${esc(c.service)}` : "select a deployment"}</p>
      </header>
      ${
        hard
          ? `<div class="triage-tabs">
              <button type="button" data-action="triage-tab" data-tab="diagnosis" class="wb-tab ${tab === "diagnosis" ? "is-active" : ""}">Diagnosis</button>
              <button type="button" data-action="triage-tab" data-tab="sweep" class="wb-tab ${tab === "sweep" ? "is-active" : ""}">Sweep board</button>
            </div>`
          : ""
      }
      <div class="triage-body">${body}</div>
      <div class="triage-foot">
        <p>${CATEGORY_MAP["nofault"] ? CATEGORY_MAP["nofault"].short : "No fault"} rows still need a category — "No fault" is a valid, often correct, answer.</p>
      </div>
    </aside>`;
  }

  // ── quiz ───────────────────────────────────────────────────────────────────
  function quizItemCard(item, index, total, isLast) {
    const answer = store.quiz.answers[item.id];
    const checked = !!store.quiz.checked[item.id];
    const isCorrect = answer === item.answer;
    return `
    <article class="quiz-card" aria-label="Quiz item ${index + 1} of ${total}" id="quiz-card-${item.id}">
      <div class="quiz-card-top">
        <p class="quiz-qnum">Question ${index + 1} / ${total}</p>
        <span class="badge-soft">${esc(item.topic)}</span>
      </div>
      <p class="quiz-scenario">${esc(item.scenario)}</p>
      <div role="radiogroup" aria-label="Options for question ${index + 1}" class="quiz-options">
        ${item.options
          .map((o) => {
            const selected = answer === o.value;
            const selCorrect = checked && selected && o.value === item.answer;
            const selWrong = checked && selected && o.value !== item.answer;
            return `
          <label class="quiz-opt ${selCorrect ? "opt-correct" : ""} ${selWrong ? "opt-wrong" : ""} ${checked && !selected ? "opt-dim" : ""} ${!checked && selected ? "opt-picked" : ""}">
            <input type="radio" name="quiz-${item.id}" value="${o.value}" data-quiz-item="${item.id}" aria-label="${esc(o.label)}"
              ${selected ? "checked" : ""} ${checked ? "disabled" : ""}/>
            <span>${esc(o.label)}</span>
            ${selCorrect ? '<span class="quiz-verdict t-green">✓ your pick — correct</span>' : ""}
            ${selWrong ? '<span class="quiz-verdict t-red">✗ your pick — incorrect</span>' : ""}
          </label>`;
          })
          .join("")}
      </div>
      ${
        !checked
          ? `<button type="button" data-action="quiz-lock" data-item="${item.id}" data-index="${index}" class="btn btn-teal btn-sm quiz-lock" ${answer ? "" : "disabled"}>
              ${icon("clipboard-check", "ic-16")} Lock in answer
            </button>`
          : `
        <div role="status" aria-live="polite" class="feedback ${isCorrect ? "feedback-pass" : "feedback-fail"}">
          <p class="feedback-title ${isCorrect ? "t-green" : "t-red"}">${isCorrect ? "CORRECT" : "INCORRECT"} — here is why</p>
          <p class="feedback-body">${esc(item.explanation)}</p>
        </div>
        <div class="quiz-next">
          <button type="button" data-action="quiz-next" class="btn btn-primary">
            ${isLast ? "Open the shift debrief" : "Next question"} ${icon("arrow-right", "ic-16")}
          </button>
        </div>`
      }
    </article>`;
  }

  function renderQuiz(quizHold) {
    const { QUIZ_MEDIUM, QUIZ_HARD, QUIZ_UNLOCK } = window.LAB;
    const mode = store.mode;
    const items = mode === "medium" ? QUIZ_MEDIUM : QUIZ_HARD;
    const done = engine.doneCount(store, mode);
    const unlockAt = QUIZ_UNLOCK[mode];
    const totalObj = engine.objectivesForMode(store, mode).length;
    const locked = done < unlockAt;

    if (locked) {
      return `
      <div class="quiz-lockedwrap">
        <div class="quiz-locked">
          <h1 class="brief-title">Knowledge check locked</h1>
          <p class="quiz-locked-copy">Practice first: complete <strong>${unlockAt} objectives</strong> to unlock the quiz — you are at <strong>${done} of ${totalObj}</strong>. The quiz mirrors the &quot;given a scenario&quot; exam style, and the objectives build the instincts it tests.</p>
          <button type="button" data-action="goto-phase" data-phase="room" class="btn btn-primary mt">${icon("arrow-right", "ic-16")} Back to the shift floor</button>
        </div>
      </div>`;
    }

    const firstUnchecked = items.findIndex((i) => !store.quiz.checked[i.id]);
    const allChecked = window.LabStore.quizDone(mode, store.quiz);
    const checkedCount = items.filter((i) => store.quiz.checked[i.id]).length;
    const score = window.LabStore.quizScore(mode, store.quiz);

    const holdValid = quizHold !== null && quizHold >= 0 && quizHold < items.length && store.quiz.checked[items[quizHold].id];
    const viewIdx = holdValid ? quizHold : firstUnchecked;
    const current = holdValid
      ? items[quizHold]
      : allChecked
        ? null
        : firstUnchecked >= 0 && firstUnchecked < items.length
          ? items[firstUnchecked]
          : null;

    const progressDots = items
      .map((q, i) => {
        const isDone = !!store.quiz.checked[q.id];
        const isCurrent = current && current.id === q.id;
        return `<li aria-current="${isCurrent ? "step" : "false"}" class="qdot ${isCurrent ? "is-current" : isDone ? "is-done" : ""}">${isDone ? "✓" : i + 1}</li>`;
      })
      .join("");

    return `
    <div class="quiz-wrap">
      <header class="quiz-header">
        <p class="mono-eyebrow t-signal">Knowledge check</p>
        <h1 class="quiz-title">${mode === "medium" ? "Concept check" : "Scenario triage check"}</h1>
        <p class="quiz-meta">${items.length} items · explanations after every answer · ${checkedCount}/${items.length} locked in · score ${score}/${items.length}</p>
        <ol class="qdots" aria-label="Quiz progress">${progressDots}</ol>
      </header>
      ${
        current
          ? `
        <div class="quiz-hold">
          ${quizItemCard(current, viewIdx, items.length, viewIdx === items.length - 1)}
          <p class="quiz-note">Answers lock when checked — you move forward, just like the exam.</p>
        </div>`
          : `
        <div class="quiz-complete">
          <p>Knowledge check complete — <strong>${score}/${items.length}</strong>. Onward to the shift debrief.</p>
          <button type="button" data-action="goto-phase" data-phase="debrief" class="btn btn-primary">Open the shift debrief ${icon("arrow-right", "ic-16")}</button>
        </div>`
      }
    </div>`;
  }

  // ── debrief ────────────────────────────────────────────────────────────────
  const DETECTION_ROWS = [
    { source: "Deployment event stream", logic: "Alert when any CREATE_FAILED / validation error appears in a 5-minute window — catches quota, template and outage failures at birth." },
    { source: "Guest agent heartbeat", logic: "Alert when heartbeat is absent > 5 min after boot — catches stale images and agent-less instances (dep-2204)." },
    { source: "Health-check failure metrics", logic: "Alert on > 0 5xx sustained 5 minutes even when deploy status = SUCCESS — catches silent races (dep-2207)." },
    { source: "Clock-skew monitor", logic: "Alert when guest skew > 60 s — catches blocked NTP before TLS/Kerberos break (dep-2208)." },
    { source: "Activation / KMS logs", logic: "Alert on activation failures (0x8007232A) — catches missing KMS SRV records within the grace window, not at day 179 (dep-2206)." },
    { source: "Quota utilization", logic: "Alert at 80% of any service limit — catches dep-2201 before the wave is scheduled." },
    { source: "IaC lint gate (pre-deploy)", logic: "CI job fails on template schema/AllowedValues violations — dep-2203 never reaches apply." },
  ];
  const MITIGATION_ROWS = [
    { bullet: "Resource limits", control: "Quota alerts + cleanup runbook for orphaned capacity; pre-approved increase path", anchor: "dep-2201" },
    { bullet: "Regional availability", control: "Multi-AZ retry, flexible instance-family lists, capacity reservations", anchor: "dep-2210" },
    { bullet: "Misconfigurations (template)", control: "Offline template lint/validation in CI; scoped AllowedValues", anchor: "dep-2203" },
    { bullet: "Misconfigurations (dependency)", control: "Pre-flight DNS/NTP/KMS checks; scoped SG egress; wait conditions", anchor: "dep-2202/2206/2208" },
    { bullet: "Misconfigurations (orchestration)", control: "Explicit depends-on + idempotent scripts + health-check gate before traffic", anchor: "dep-2207" },
    { bullet: "Outdated definitions", control: "Golden-image pipeline with agent-heartbeat verification; image version SLA", anchor: "dep-2204" },
    { bullet: "Incompatibility / deprecation", control: "Compatibility matrix review, driver injection, deprecation watch for families & EOL OS", anchor: "dep-2209" },
    { bullet: "Outages", control: "Status-page integration, change freeze runbook (RB-07), post-recovery retries", anchor: "dep-2211" },
  ];
  const BLUE_TEAM = [
    "Triage by taxonomy, not by vibe: the 6.1 bullets are a decision tree — limit numbers, AZ names, incident IDs and driver names each point to exactly one branch.",
    "Where a failure surfaces is rarely where it roots; correlate at least two artifacts before filing a cause.",
    "SUCCESS is a resource-creation statement, not a health statement — gate traffic on checks, not on status.",
    "Least-privilege fixes only: scoped egress rules, scoped DNS changes. A 0.0.0.0/0 'quick fix' survives long after the incident is forgotten.",
    "Every fault you fix by hand should end with a preventive control — otherwise you are just renting the fix.",
  ];
  const RED_TEAM = [
    "Deployment pain creates attack surface: an engineer who 'fixes' reachability by opening 0.0.0.0/0 has just done reconnaissance work for you (→ T1190).",
    "Overprivileged deploy roles are a persistence gift — whoever holds the template holds the fleet (→ T1078.004 Cloud Accounts).",
    "Invisible fleets are quiet fleets: instances without agents/telemetry (dep-2204) are the ones an attacker hopes for (→ T1530-class exposure follows).",
    "Change freezes during provider incidents are also attacker convenience windows — monitor drift even when 'nothing is deploying'.",
  ];

  function renderDebrief() {
    return `
    <div class="debrief">
      <header class="debrief-header">
        <p class="mono-eyebrow t-signal">Shift report</p>
        <h1 class="quiz-title">Debrief — Wave 3 deployment issues</h1>
        <p class="debrief-lede">Everything the shift taught, condensed into field notes: what to monitor, what to build, what to remember — mapped to CV0-004 6.1 and the MITRE ATT&amp;CK context behind tonight's misconfigurations.</p>
      </header>

      <section aria-labelledby="det-h" class="debrief-section">
        <h2 id="det-h" class="debrief-h2">${icon("radar", "ic-20 t-teal")} Detection opportunities</h2>
        <div class="table-wrap">
          <table class="table">
            <thead class="sweep-head"><tr><th scope="col">Data source</th><th scope="col">Example detection logic</th></tr></thead>
            <tbody>
              ${DETECTION_ROWS.map((r) => `<tr><td class="cell-k">${esc(r.source)}</td><td class="cell-copy">${esc(r.logic)}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="mit-h" class="debrief-section">
        <h2 id="mit-h" class="debrief-h2">${icon("shield-check", "ic-20 t-green")} Mitigation recommendations</h2>
        <div class="table-wrap">
          <table class="table">
            <thead class="sweep-head"><tr><th scope="col">6.1 bullet</th><th scope="col">Preventive control</th><th scope="col">Case</th></tr></thead>
            <tbody>
              ${MITIGATION_ROWS.map((r) => `<tr><td class="cell-k">${esc(r.bullet)}</td><td class="cell-copy">${esc(r.control)}</td><td class="cell-anchor mono">${esc(r.anchor)}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>
      </section>

      <div class="debrief-grid">
        <section aria-labelledby="bt-h" class="debrief-card">
          <h2 id="bt-h" class="debrief-h2">${icon("shield-check", "ic-20 t-teal")} Blue-team takeaways</h2>
          <ul class="debrief-list">
            ${BLUE_TEAM.map((t) => `<li><span aria-hidden="true" class="t-teal">▸</span><span>${esc(t)}</span></li>`).join("")}
          </ul>
        </section>
        <section aria-labelledby="rt-h" class="debrief-card">
          <h2 id="rt-h" class="debrief-h2">${icon("swords", "ic-20 t-signal")} Red-team mindset</h2>
          <ul class="debrief-list">
            ${RED_TEAM.map((t) => `<li><span aria-hidden="true" class="t-signal">▸</span><span>${esc(t)}</span></li>`).join("")}
          </ul>
          <p class="mitre-links">
            <a href="https://attack.mitre.org/techniques/T1078/004/" target="_blank" rel="noopener noreferrer" class="linklike">T1078.004 Cloud Accounts ${icon("external-link", "ic-12")}</a>
            <a href="https://attack.mitre.org/techniques/T1190/" target="_blank" rel="noopener noreferrer" class="linklike">T1190 Exploit Public-Facing Application ${icon("external-link", "ic-12")}</a>
            <a href="https://attack.mitre.org/techniques/T1530/" target="_blank" rel="noopener noreferrer" class="linklike">T1530 Data from Cloud Storage ${icon("external-link", "ic-12")}</a>
          </p>
        </section>
      </div>

      <section class="close-shift">
        <h2 class="debrief-h2">${icon("trophy", "ic-20 t-signal")} Close the shift</h2>
        <p class="close-shift-copy" data-role="close-shift-copy">${
          window.LabStore.isComplete(store.mode, store)
            ? "All objectives and the knowledge check are complete. Open your completion record."
            : "The completion record opens once every objective and the knowledge check are done. Progress saves automatically — you can close this lab and resume anytime."
        }</p>
        <div class="close-shift-actions">
          <button type="button" data-action="open-completion" class="btn btn-primary">${icon("trophy", "ic-16")} Completion record</button>
          <a class="btn btn-outline" href="https://www.comptia.org/en-us/certifications/cloud" target="_blank" rel="noopener noreferrer">Official CV0-004 objectives ${icon("external-link", "ic-14")}</a>
        </div>
      </section>
    </div>`;
  }

  window.LabUI = {
    esc,
    icon,
    statusChip,
    statusDot,
    stageBadge,
    pillarBadge,
    sparkline,
    progressRing,
    stars,
    feedbackBox,
    renderHeader,
    renderModeSelect,
    renderBriefing,
    renderRail,
    renderChips,
    renderWorkbench,
    renderTriage,
    diagnosisPanel,
    sweepBoard,
    renderQuiz,
    renderDebrief,
    railSolved,
    isLocked,
    caseObjective,
  };
})();
