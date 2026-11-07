// ── Exercise CLOUDBURST · ui.js — component templates ───────────────────────
// Faithful HTML re-creations of the original React components (src/components/
// lab/*): same structure, same copy, same classes-of-effect, same ARIA. All
// content comes verbatim from js/data.js; interactivity is wired in js/app.js.

// HTML-escape everything coming from data/state (defensive; data is ours).
function esc(v) {
  return String(v ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

const PHASES = [
  { id: "IDENTIFY", label: "Identify" },
  { id: "CONTAIN", label: "Contain" },
  { id: "ERADICATE", label: "Eradicate" },
  { id: "RECOVER", label: "Recover" },
  { id: "LEARN", label: "Learn" },
];

const PILLAR_CLASS = {
  UNDERSTAND: "pill pill-UNDERSTAND",
  RECOGNIZE: "pill pill-RECOGNIZE",
  DETECT: "pill pill-DETECT",
  MITIGATE: "pill pill-MITIGATE",
};

const SEV_CLASS = {
  HIGH: "sev sev-HIGH",
  MEDIUM: "sev sev-MEDIUM",
  LOW: "sev sev-LOW",
  INFO: "sev sev-INFO",
};

// ── stage: mode select (Phase E opening screen) ──────────────────────────────
function viewModeSelect(hasProgress) {
  const li = (icon, text) => `<li>${ic(icon, "ic-16")}<span>${text}</span></li>`;
  return `
  <main class="mode-hero stage-enter">
    <p class="eyebrow">${ic("flask-conical", "ic-16")} Interactive training lab · synthetic data only</p>
    <h1 class="hero-title">Exercise ${esc(INCIDENT.callSign)}</h1>
    <p class="hero-lede"><span class="bold">CompTIA Cloud+ CV0-004 · Lesson 6.3 — Security incidents:</span> a live cloud
      incident at ${esc(INCIDENT.org)} (${esc(INCIDENT.orgDesc)}). A leaked credential is only the opening move — you will
      triage the alerts, rebuild the attack from raw audit evidence, contain it in the right order, eradicate
      every artifact, and harden the platform so it cannot happen twice.</p>
    <p class="synthetic-note">${ic("triangle-alert", "ic-16")}
      All organizations, people, accounts, keys, IPs (RFC 5737 ranges) and events are fictional training data.
      MITRE ATT&amp;CK mappings are accurate to the official pages; cloud event names are AWS-style and simplified.</p>
    ${hasProgress ? `
    <p class="progress-warn" role="alert">${ic("triangle-alert", "ic-16")}
      Heads-up: picking a mode below starts that exercise fresh — in-run progress only lives inside the current
      run, and the lab's RESET wipes everything.</p>` : ""}
    <div class="mode-grid">
      <section class="card mode-card" aria-labelledby="mode-medium">
        <h2 id="mode-medium" class="mode-h">${ic("user-check", "ic-20 mode-ic-teal")} Responder</h2>
        <p class="mode-sub mode-sub-teal">Medium · learn &amp; understand</p>
        <ul class="mode-list">
          ${li("clipboard-list", "12 guided objectives, introduced in order with a visible “next up” cue")}
          ${li("gauge", "Tiered hints (nudge → direction → demonstration); hints cost stars, never progress")}
          ${li("shield-alert", "Tolerant checking: synonyms and casing accepted; wrong answers teach, not punish")}
          ${li("key-round", "Incident already played out — you investigate a complete evidence picture")}
        </ul>
        <button type="button" class="btn btn-lg btn-teal" data-action="pick-mode" data-mode="medium">
          Enter as Responder ${ic("arrow-right", "ic-16")}
        </button>
      </section>
      <section class="card mode-card" aria-labelledby="mode-hard">
        <h2 id="mode-hard" class="mode-h">${ic("command", "ic-20 mode-ic-red")} Commander</h2>
        <p class="mode-sub mode-sub-red">Hard · test &amp; stretch</p>
        <ul class="mode-list">
          ${li("radio", "The clock is live: until you contain, each advance can reveal new attacker moves")}
          ${li("timer", "9 broad challenges over noisier evidence with red herrings; near-misses are rejected with a rationale")}
          ${li("gauge", "Hints off — one optional nudge for the whole exercise, and it visibly costs score")}
          ${li("key-round", "Strict validation: exact IDs, exact strings, ordered actions")}
        </ul>
        <button type="button" class="btn btn-lg btn-red" data-action="pick-mode" data-mode="hard">
          Take command ${ic("arrow-right", "ic-16")}
        </button>
      </section>
    </div>
    <p class="select-foot">Both modes share the same evidence core · progress auto-saves in your browser</p>
  </main>`;
}

// ── stage: briefing (C1) ─────────────────────────────────────────────────────
function viewBriefing(mode) {
  const hard = mode === "hard";
  return `
  <main class="briefing stage-enter" aria-labelledby="brief-head">
    <p class="eyebrow">Scenario briefing · ${hard ? "Commander" : "Responder"} track</p>
    <h1 id="brief-head" class="hero-title hero-title-md">${esc(INCIDENT.record)} · ${esc(INCIDENT.callSign)}</h1>
    <div class="brief-body">
      <p>It is <span class="bold">16:05 UTC on 2026-11-03</span>. You are the on-call cloud security
        responder at <span class="bold">${esc(INCIDENT.org)}</span>, a fintech SaaS that reconciles payment
        flows for its customers. Three hours ago, SkySentry — the behavior-analytics service — raised an anomaly
        nobody has looked at yet, and an untriaged secret-scanning ticket from this morning is still sitting in a
        low-priority queue.</p>
      <p>The audit trail shows a brand-new identity, <span class="mono-bold">deploy-helper-2</span>,
        that did not exist at breakfast and has already read <span class="bold">412 objects (6.1 GB)</span>
        from the production financial-exports bucket. The activity traces back to credentials that should never
        have left the build pipeline. Attribution patterns resemble ${esc(INCIDENT.actor)}'s playbook: leak-to-key,
        key-to-account, account-to-power.</p>
      <p>${hard
        ? "You are commanding this response. The evidence is noisy, two alerts are bait, the clock is running, and the attacker adapts: contain too slowly and they plant more persistence for you to find. Nine broad objectives; exact answers; one nudge if you truly need it."
        : "You will work the incident end to end across twelve guided objectives — triage, evidence analysis, detection building, containment, eradication and hardening — with hints available at every step and explanations after every check."}</p>
      <p class="exam-callout"><span class="exam-tag">Why this matters for the exam: </span>
        CV0-004 Lesson 6.3 lands on the Domain 5.0 exam objective “Given a scenario, troubleshoot security
        issues,” which covers leaked credentials and privilege escalation. This lab is that scenario — the
        consoles below behave the way exam performance-based items expect you to think.</p>
    </div>
    <div class="brief-actions">
      <button type="button" class="btn btn-lg btn-dark" data-action="goto" data-stage="ops">
        Enter the ops wall ${ic("arrow-right", "ic-16")}
      </button>
      <button type="button" class="btn btn-lg btn-white" data-action="goto" data-stage="select" style="color:var(--stone-700)">
        ← Choose mode again
      </button>
    </div>
  </main>`;
}

// ── mission band (clock + phase rail + reset) ────────────────────────────────
function viewPhaseRail(state) {
  const objs = objectivesFor(state.mode ?? "medium");
  const phaseDone = {};
  for (const p of PHASES) {
    const inPhase = objs.filter((o) => o.phase === p.id);
    phaseDone[p.id] = inPhase.length > 0 && inPhase.every((o) => state.objectives[o.id]?.passed);
  }
  const current = progressOf(state, 0, 0).currentPhase;
  return `
  <nav aria-label="Incident-response phase rail" class="phase-rail">
    <ol>${PHASES.map((p, i) => {
      const done = phaseDone[p.id];
      const isCurrent = current === p.id && !done;
      return `<li style="display:flex;align-items:center">
        ${i > 0 ? `<span class="phase-connector${done ? " done" : ""}" aria-hidden="true"></span>` : ""}
        <span ${isCurrent ? 'aria-current="step"' : ""} class="phase-step${done ? " done" : ""}${isCurrent ? " current" : ""}">
          ${ic(done ? "circle-check" : "hourglass", "ic-14")}${p.label}
        </span></li>`;
    }).join("")}</ol>
  </nav>`;
}

function viewMissionBand(state) {
  const objs = objectivesFor(state.mode ?? "medium");
  const passed = objs.filter((o) => state.objectives[o.id]?.passed).length;
  const clockLabel = `T+${String(state.env.clock * 10).padStart(2, "0")}m`;
  const hard = state.mode === "hard";
  const advanceDisabled = state.env.clock >= 6 || state.env.contained;
  return `
  <header class="mission-band" id="mission-band">
    <div class="mission-band-in">
      <div style="display:flex;align-items:center;gap:8px">
        <span class="callsign">${esc(INCIDENT.callSign)}</span>
        <span class="record-label">${esc(INCIDENT.record)} · ${hard ? "COMMANDER" : "RESPONDER"} mode</span>
      </div>
      <div class="clock${hard && !state.env.contained ? " hot" : ""}" role="timer"
        aria-label="Mission clock at ${clockLabel} after incident declaration">
        ${ic("clock-3", "ic-16")}${clockLabel}
      </div>
      ${hard ? `
      <button type="button" class="btn ${state.env.contained ? "btn-muted" : "btn-red"}"
        data-action="advance-clock" data-fk="advance-clock" ${advanceDisabled ? "disabled" : ""}>
        ${ic("fast-forward", "ic-16")}${state.env.contained ? "Contained — clock held" : "Advance clock (+10 min)"}
      </button>` : ""}
      ${viewPhaseRail(state)}
      <div class="band-right">
        <span class="obj-counter" aria-label="Objectives passed: ${passed} of ${objs.length}">OBJ ${passed}/${objs.length}</span>
        <button type="button" class="kc-trigger" data-action="kc-open" data-fk="kc-open">${ic("book-open", "ic-16")} Knowledge Core</button>
        <button type="button" class="btn btn-white-red" data-action="reset" data-fk="reset">${ic("eraser", "ic-16")} Reset</button>
      </div>
    </div>
  </header>`;
}

// ── alert inbox ──────────────────────────────────────────────────────────────
function viewAlertInbox(state) {
  const alerts = ALERTS[state.mode === "hard" ? "hard" : "medium"];
  return `
  <section class="card" aria-labelledby="alerts-head">
    <h2 class="panel-head" id="alerts-head">${ic("bell-ring", "ic-16")} Alert Inbox
      <span class="head-aside">${alerts.length} untriaged</span></h2>
    <ul class="alert-list">
      ${alerts.map((a) => {
        const expanded = UI.alertOpen === a.id;
        return `<li><button type="button" class="alert-item${expanded ? " expanded" : " collapsed"}"
          data-action="alert-toggle" data-id="${esc(a.id)}" data-fk="alert-${esc(a.id)}" aria-expanded="${expanded}">
          <span class="alert-row-top">
            <span class="${SEV_CLASS[a.sev]}">${esc(a.sev)}</span>
            <span class="alert-id">${esc(a.id)}</span>
            <span class="chev">${ic("chevron-down", "ic-16")}</span>
          </span>
          <span class="alert-title">${esc(a.title)}</span>
          <span class="alert-body">${esc(a.body)}</span>
          <span class="alert-source">source: ${esc(a.source)}</span>
        </button></li>`;
      }).join("")}
    </ul>
  </section>`;
}

// ── audit trail console (shell + list; list re-renders on filter/live) ───────
function auditEvents(state) {
  const base = state.mode === "hard" ? [...EVENTS, ...EVENTS_HARD_EXTRA] : [...EVENTS];
  const live = EVENTS_LIVE.slice(0, state.env.liveRevealed);
  let all = [...base, ...live];
  all = all.sort((a, b) => a.t.localeCompare(b.t));
  if (UI.auditSuspiciousOnly) all = all.filter((e) => e.tag === "attack" || e.tag === "live");
  const q = UI.auditQuery.trim().toLowerCase();
  if (q) {
    all = all.filter((e) =>
      [e.t, e.event, e.principal, e.ip, e.resource, e.note ?? ""].join(" ").toLowerCase().includes(q));
  }
  return all;
}

function viewAuditConsole(state) {
  return `
  <section class="card audit-console" aria-labelledby="audit-head">
    <h2 id="audit-head" class="panel-head">${ic("file-clock", "ic-16")} Cloud Audit Trail
      <span class="head-aside">2026-11-03 · UTC</span></h2>
    <div class="audit-filter">
      <label class="sr-only" for="audit-search">Search audit events</label>
      <div class="search-wrap">
        ${ic("search", "ic-16")}
        <input id="audit-search" class="search-input" type="text" value="${esc(UI.auditQuery)}"
          placeholder="Search event, principal, IP, resource…" autocomplete="off" />
      </div>
      <button type="button" id="audit-suspicious" class="btn ${UI.auditSuspiciousOnly ? "btn-red" : "btn-white"}"
        data-action="audit-suspicious" data-fk="audit-suspicious" aria-pressed="${UI.auditSuspiciousOnly}">
        ${ic("filter", "ic-16")}${UI.auditSuspiciousOnly ? "Suspicious only: ON" : "Suspicious only"}
      </button>
    </div>
    <div class="event-list-wrap" role="log" aria-live="polite" aria-relevant="additions"
      aria-label="Audit trail event stream" id="audit-events-wrap">${auditListHTML(state)}</div>
    <p class="console-foot" id="audit-foot">${auditFootHTML(state)}</p>
  </section>`;
}

function auditListHTML(state) {
  const events = auditEvents(state);
  if (events.length === 0) return `<p class="no-events">No events match the current filter.</p>`;
  return `<ul class="event-list">${events.map((e) => {
    const expanded = UI.auditOpen === e.id;
    return `<li class="${e.tag === "live" ? "live-li" : ""}">
      <button type="button" class="event-row" data-action="audit-toggle" data-id="${esc(e.id)}"
        data-fk="audit-${esc(e.id)}" aria-expanded="${expanded}">
        <span class="event-t">${esc(e.t)}</span>
        <span class="event-tag tag-${esc(e.tag)}">${esc(e.tag)}</span>
        <span class="event-main"><span class="event-name">${esc(e.event)}</span>
          <span class="event-sub">${esc(e.principal)} · ${esc(e.ip)} · ${esc(e.resource)}</span></span>
      </button>
      ${expanded && e.note ? `<p class="event-note">⌖ ${esc(e.note)}</p>` : ""}
    </li>`;
  }).join("")}</ul>`;
}

function auditFootHTML(state) {
  const count = auditEvents(state).length;
  const liveNotice = state.mode === "hard" && !state.env.contained && state.env.clock > 0
    ? `<span class="foot-alert">LIVE INCIDENT — attacker may still be active</span>` : "";
  return `${ic("database", "ic-14")} Training data · synthetic events · ${count} shown${liveNotice}`;
}

// ── identity & access console ────────────────────────────────────────────────
function viewIdentityConsole(state) {
  // late-planted artifact (Hard mode): support-bot only exists if the clock outran containment
  const SUPPORT_BOT = {
    id: INCIDENT.supportBot, label: "support-bot", kind: "attacker-created",
    policies: [], mfa: false, createdByAttacker: true,
  };
  const botKeyEntry = state.env.keys[KEY_BOT_ID]
    ? { id: KEY_BOT_ID, of: INCIDENT.supportBot, created: "2026-11-03 16:24 (new)", lastUsed: "—", createdByAttacker: true }
    : null;
  const allUsers = state.env.users[INCIDENT.supportBot] ? [...USERS, SUPPORT_BOT] : USERS;
  const allKeys = botKeyEntry ? [...KEYS, botKeyEntry] : KEYS;
  const visibleUsers = allUsers.filter((u) => state.env.users[u.id]?.exists);
  const removedUsers = allUsers.filter((u) => u.createdByAttacker && !state.env.users[u.id]?.exists);

  const keyRow = (keyId) => {
    const meta = allKeys.find((k) => k.id === keyId);
    const st = state.env.keys[keyId];
    if (!meta || !st) return "";
    const status = st.deleted ? "DELETED" : st.active ? "ACTIVE" : "DEACTIVATED";
    const statusClass = st.deleted ? "chip chip-deleted"
      : st.active
        ? (meta.createdByAttacker || keyId === INCIDENT.leakedKey ? "chip chip-red" : "chip chip-teal")
        : "chip chip-deactivated";
    const isProtected = !meta.createdByAttacker;
    // QA-6 fix: eradication may only follow containment — delete unlocks after deactivation
    const deleteLocked = st.active || st.deleted;
    const title = isProtected
      ? "Legitimate credential — protected in this exercise (never delete what you didn't create)"
      : deleteLocked
        ? "Deactivate first — contain, then eradicate. Deleting a live credential is out of order."
        : "";
    return `<li class="${st.deleted ? "deleted" : ""}">
      <span class="key-id">${esc(keyId)}</span>
      <span class="key-meta">created ${esc(meta.created)} · last used ${esc(meta.lastUsed)}</span>
      <span class="${statusClass}">${status}</span>
      <span class="key-actions">
        <button type="button" class="btn btn-white" data-action="key-deactivate" data-id="${esc(keyId)}"
          ${!st.active || st.deleted ? "disabled" : ""}>${ic("circle-slash", "ic-14")} Deactivate</button>
        <button type="button" class="btn btn-white-red" data-action="key-delete" data-id="${esc(keyId)}"
          ${deleteLocked || isProtected ? "disabled" : ""} ${title ? `title="${esc(title)}"` : ""}>
          ${ic("trash-2", "ic-14")} Delete</button>
      </span></li>`;
  };

  const userCard = (u) => {
    const uState = state.env.users[u.id];
    const quarantined = !!uState?.quarantined;
    const policies = u.policies.map((p) => {
      const pol = POLICIES[p];
      const attachedHere = u.createdByAttacker && p === INCIDENT.policy && state.env.policyAttached;
      return `<span class="policy-chip${attachedHere ? " attached" : ""}">${esc(p)}${attachedHere ? `
        <button type="button" class="detach-btn" data-action="policy-detach"
          title="Detach BillingFullAccess from this user" aria-label="Detach policy ${esc(p)} from ${esc(u.id)}">
          ${ic("unplug", "ic-16")}</button>` : ""}</span>`;
    }).join("");
    const notes = u.policies.map((p) => POLICIES[p]?.note).filter(Boolean).join(" ");
    const delTitle = u.createdByAttacker
      ? (quarantined ? "" : "Quarantine first — contain, then eradicate.")
      : "Protected: production principal — removal is out of scope in this exercise";
    return `<article class="user-card ${quarantined ? "quarantined" : u.createdByAttacker ? "attacker" : "normal"}">
      <header class="user-head">
        <h3 class="user-name">${esc(u.label)}</h3>
        <span class="chip chip-stone">${esc(u.kind)}</span>
        ${u.mfa ? `<span class="chip chip-mfa">MFA</span>` : ""}
        ${u.createdByAttacker ? `<span class="chip chip-attacker">Created 15:11 · investigate</span>` : ""}
        ${quarantined ? `<span class="chip chip-quarantined">${ic("ban", "ic-14")} Quarantined (deny-all)</span>` : ""}
      </header>
      <div class="policy-row">${policies}</div>
      ${notes ? `<p class="policy-note">${esc(notes)}</p>` : ""}
      <ul class="key-list">${allKeys.filter((k) => k.of === u.id).map((k) => keyRow(k.id)).join("")}</ul>
      <div class="user-actions">
        <button type="button" class="btn ${quarantined ? "btn-muted" : "btn-teal"}"
          data-action="user-quarantine" data-id="${esc(u.id)}" ${quarantined ? "disabled" : ""}>
          ${ic(quarantined ? "shield-check" : "eye-off", "ic-14")} ${quarantined ? "Quarantined" : "Quarantine (deny-all)"}
        </button>
        <button type="button" class="btn btn-white-red" data-action="user-delete" data-id="${esc(u.id)}"
          ${!u.createdByAttacker || !quarantined ? "disabled" : ""}
          ${delTitle ? `title="${esc(delTitle)}"` : ""}>
          ${ic("user-x", "ic-14")} Delete user</button>
      </div>
    </article>`;
  };

  const last = state.env.actionLog.length === 0
    ? "No response actions taken yet"
    : `Last action: ${esc(state.env.actionLog[state.env.actionLog.length - 1])}`;

  return `
  <section class="card audit-console" aria-labelledby="iam-head">
    <h2 id="iam-head" class="panel-head">${ic("key-round", "ic-16")} Identity &amp; Access Console</h2>
    <div class="iam-list">
      ${visibleUsers.map(userCard).join("")}
      ${removedUsers.length > 0 ? `<p class="removed-note">Removed: ${removedUsers.map((u) => esc(u.id)).join(" · ")}</p>` : ""}
    </div>
    <footer class="console-foot iam-foot" aria-live="polite" id="iam-foot">
      ${ic("radio-tower", "ic-14")} ${last}
      ${state.env.contained ? `<span class="contained-mark">CONTAINED ✓</span>` : ""}
      <span class="foot-rule">Contain first (deactivate → quarantine), then eradicate (delete). Delete unlocks after containment.</span>
    </footer>
  </section>`;
}

// ── hardening board ──────────────────────────────────────────────────────────
function viewHardeningBoard(state) {
  return `
  <section class="card" aria-labelledby="harden-head">
    <h2 id="harden-head" class="panel-head">${ic("lock", "ic-16")} Hardening Board
      <span class="head-aside">prevent &amp; recover</span></h2>
    <ul class="harden-list">
      ${HARDENING.map((h) => {
        const on = !!state.env.hardening[h.id];
        const warn = on && h.stance === "trap";
        const liClass = warn ? "on-trap" : on ? "on-good" : "";
        return `<li class="${liClass}">
          <div class="harden-row">
            <button type="button" role="switch" aria-checked="${on}"
              aria-label="${esc(h.title)}: ${on ? "enabled" : "disabled"}"
              data-action="toggle-hardening" data-id="${esc(h.id)}" data-fk="harden-${esc(h.id)}"
              class="switch${warn ? " trap-on" : ""}">
              <span class="knob">${on ? "ON" : "OFF"}</span>
            </button>
            <div class="harden-main">
              <h3 class="harden-title">${warn ? ic("triangle-alert", "ic-16") : ""}${esc(h.title)}</h3>
              <p class="harden-body">${esc(h.body)}</p>
              <p class="harden-refs">${esc(h.refs)}</p>
            </div>
          </div>
        </li>`;
      }).join("")}
    </ul>
    <p class="console-foot">${ic("hard-drive-download", "ic-14")} Every toggle is a control decision — validators inspect this board</p>
  </section>`;
}

// ── repository evidence ──────────────────────────────────────────────────────
function viewRepoEvidence() {
  return `
  <section class="card" aria-labelledby="repo-head">
    <h2 id="repo-head" class="panel-head">${ic("git-branch", "ic-16")} Repository Evidence</h2>
    <div class="repo-body">
      <p class="repo-meta">${esc(REPO_DIFF.repo)} · commit <span class="bold">${esc(REPO_DIFF.commit)}</span> · ${esc(REPO_DIFF.author)} · ${esc(REPO_DIFF.time)}</p>
      <p class="repo-msg">“${esc(REPO_DIFF.message)}”</p>
      <pre class="repo-diff" style="margin:8px 0 0;font-family:var(--font-mono);white-space:pre">${REPO_DIFF.lines.map((l) =>
        `<div class="${l.k === "add" ? "diff-add" : "diff-ctx"}">${l.k === "add" ? "+ " : "  "}${esc(l.v)}</div>`
      ).join("")}</pre>
      <p class="repo-scan">${ic("scan-search", "ic-16")}${esc(REPO_DIFF.scan)}</p>
    </div>
  </section>`;
}

// ── objective controls (C4 field renderer) ───────────────────────────────────
function controlField(c, state) {
  const value = state.answers[c.key];
  const id = `ctl-${c.key}`;
  const header = (forId) =>
    `<label ${forId ? `for="${esc(forId)}"` : ""} class="ctl-label">${esc(c.label)}</label>`;
  const helper = c.helper ? `<p class="ctl-helper">${esc(c.helper)}</p>` : "";

  if (c.type === "text") {
    return `<div>${header(id)}
      <input id="${esc(id)}" class="ctl-input" type="text" data-action="set-answer" data-key="${esc(c.key)}"
        value="${esc(typeof value === "string" ? value : "")}" placeholder="${esc(c.placeholder ?? "")}"
        autocomplete="off" />${helper}</div>`;
  }
  if (c.type === "select") {
    const opts = (c.options ?? []).map((opt) =>
      `<option value="${esc(opt)}" ${value === opt ? "selected" : ""}>${esc(c.optionLabels?.[opt] ?? opt)}</option>`).join("");
    return `<div>${header(id)}
      <select id="${esc(id)}" class="ctl-select" data-action="set-answer" data-key="${esc(c.key)}">
        <option value="">— select —</option>${opts}</select>${helper}</div>`;
  }
  if (c.type === "multi") {
    const selected = Array.isArray(value) ? value : [];
    return `<fieldset>
      <legend class="ctl-label">${esc(c.label)}</legend>
      <div class="multi-list">${(c.options ?? []).map((opt) => `
        <label class="multi-item">
          <input type="checkbox" data-action="set-answer" data-key="${esc(c.key)}" data-opt="${esc(opt)}"
            ${selected.includes(opt) ? "checked" : ""} />
          <span>${esc(c.optionLabels?.[opt] ?? opt)}</span>
        </label>`).join("")}</div>${helper}</fieldset>`;
  }
  if (c.type === "order") {
    const chosen = Array.isArray(value) ? value : [];
    return `<div>${header()}
      ${helper}
      <div class="order-grid">${(c.options ?? []).map((_, pos) => `
        <div class="order-pos">
          <label for="${esc(id)}-${pos}">Position ${pos + 1}</label>
          <select id="${esc(id)}-${pos}" class="ctl-select ctl-select-sm" data-action="set-answer"
            data-key="${esc(c.key)}" data-pos="${pos}">
            <option value="">— choose step —</option>
            ${(c.options ?? []).map((opt) => `<option value="${esc(opt)}" ${chosen[pos] === opt ? "selected" : ""}>${esc(c.optionLabels?.[opt] ?? opt)}</option>`).join("")}
          </select>
        </div>`).join("")}</div></div>`;
  }
  // sequence: pick events from a pool into an ordered list
  const chosen = Array.isArray(value) ? value : [];
  return `<div>${header()}
    ${helper}
    <div class="seq-pool">${(c.options ?? [])
      .filter((opt) => !chosen.includes(opt))
      .map((opt) => `<button type="button" class="btn btn-plain btn-textleft" data-action="seq-add"
        data-key="${esc(c.key)}" data-opt="${esc(opt)}">${ic("plus", "ic-14")}${esc(c.optionLabels?.[opt] ?? opt)}</button>`)
      .join("")}</div>
    <ol class="seq-list" aria-label="Selected sequence for ${esc(c.label)}">${chosen.map((opt, i) => `
      <li class="seq-item"><span class="bold">${i + 1}.</span>
        <span class="seq-label">${esc(c.optionLabels?.[opt] ?? opt)}</span>
        <button type="button" class="seq-remove" aria-label="Remove step ${i + 1}" data-action="seq-remove"
          data-key="${esc(c.key)}" data-opt="${esc(opt)}">${ic("x", "ic-16")}</button></li>`).join("")}
      ${chosen.length === 0 ? `<li class="seq-empty">Sequence empty — add events from the pool above.</li>` : ""}
    </ol></div>`;
}

// ── objective card ───────────────────────────────────────────────────────────
function objectiveCard(obj, state, isNext) {
  const st = state.objectives[obj.id];
  const passed = !!st?.passed;
  const hintLevel = Math.min(st?.hints ?? 0, obj.hints.length); // QA-10: store is the source of truth
  const result = UI.cardResults[obj.id] ?? null;
  const nudgeAvailable = state.mode === "hard" && !state.nudgeUsed && !passed;

  const controls = obj.controls.length > 0
    ? `<div class="controls-box">${obj.controls.map((c) => controlField(c, state)).join("")}</div>` : "";

  const hints = !passed && state.mode === "medium" && hintLevel > 0
    ? `<div class="hint-list" aria-live="polite">${obj.hints.slice(0, hintLevel).map((h, i) =>
        `<p class="hint"><span class="hint-tag">Hint ${i + 1}: </span>${esc(h)}</p>`).join("")}</div>` : "";
  const nudge = !passed && state.mode === "hard" && state.nudgeUsed && hintLevel > 0
    ? `<p class="nudge" aria-live="polite"><span class="hint-tag">Nudge: </span>${esc(obj.hints[obj.hints.length - 1])}</p>` : "";

  const resultPanel = result ? `
    <div class="check-result anim-fade-slide ${result.pass ? "pass" : "fail"}" role="status" aria-live="polite">
      <p class="check-result-title">${ic(result.pass ? "check-circle-2" : "x-circle", "ic-16")}${result.pass ? esc(result.title) : "Check result — not there yet"}</p>
      <p class="check-result-body">${esc(result.pass ? result.body : obj.fail)}</p>
    </div>` : "";

  return `
  <article class="obj-card${passed ? " passed" : isNext ? " next" : ""}" id="card-${esc(obj.id)}"
    aria-labelledby="obj-${esc(obj.id)}-title">
    <header class="obj-head">
      <span class="obj-id">${esc(obj.id)}</span>
      <span class="${PILLAR_CLASS[obj.pillar]}">${esc(obj.pillar)}</span>
      <span class="chip chip-outline">${esc(obj.phase)}</span>
      ${isNext && !passed ? `<span class="chip-next">▶ next</span>` : ""}
      ${passed ? `<span class="passed-mark">${ic("check-circle-2", "ic-16")} passed${st?.attempts === 1 && st.firstTry ? " · first try" : ` · ${st?.attempts ?? 0} checks`}</span>` : ""}
    </header>
    <h3 id="obj-${esc(obj.id)}-title" class="obj-title">${esc(obj.title)}</h3>
    <p class="obj-context">${esc(obj.context)}</p>
    ${controls}
    <div class="obj-actions">
      ${!passed ? `<button type="button" class="btn btn-dark" data-action="check" data-obj="${esc(obj.id)}"
        data-fk="check-${esc(obj.id)}">${ic("list-checks", "ic-16")} Check results</button>` : ""}
      ${state.mode === "medium" && !passed && hintLevel < obj.hints.length
        ? `<button type="button" class="btn btn-white" data-action="hint" data-obj="${esc(obj.id)}"
            data-fk="hint-${esc(obj.id)}">${ic("lightbulb", "ic-16")} Hint (${hintLevel}/${obj.hints.length})</button>` : ""}
      ${state.mode === "hard" && nudgeAvailable
        ? `<button type="button" class="btn btn-white-red" data-action="nudge" data-obj="${esc(obj.id)}"
            data-fk="nudge-${esc(obj.id)}">${ic("lightbulb", "ic-16")} Reveal nudge (costs score — one only)</button>` : ""}
    </div>
    ${hints}${nudge}${resultPanel}
  </article>`;
}

function viewRecord(state) {
  const objs = objectivesFor(state.mode ?? "medium");
  const nextObj = objs.find((o) => !state.objectives[o.id]?.passed);
  return `
  <section class="record-wrap" aria-labelledby="record-head" id="record-region">
    <h2 id="record-head" class="record-head">${ic("scroll-text", "ic-16")} Incident Record IR-114 · objective ledger</h2>
    <div class="record-grid">
      ${objs.map((o) => objectiveCard(o, state, nextObj?.id === o.id)).join("")}
    </div>
  </section>`;
}

// ── C5 quiz ──────────────────────────────────────────────────────────────────
function viewQuiz(state) {
  const mode = state.mode === "hard" ? "hard" : "medium";
  const items = QUIZ[mode];
  const prog = progressOf(state, items.length, 0);
  const checkedCount = state.quizChecked.filter(Boolean).length;
  const current = items[state.quizIndex] ?? items[0];
  const chosen = state.quizAnswers[state.quizIndex] ?? null;
  const checked = !!state.quizChecked[state.quizIndex];
  const correctCount = items.reduce((n, it, i) => n + (state.quizAnswers[i] === it.correct ? 1 : 0), 0);
  const allChecked = checkedCount === items.length;

  const headRight = state.quizSubmitted
    ? `result: ${correctCount}/${items.length}`
    : `question ${state.quizIndex + 1}/${items.length} · ${checkedCount}/${items.length} checked`;

  let body;
  if (!prog.quizUnlocked && !state.quizSubmitted) {
    body = `<p class="quiz-locked">${ic("clipboard-check", "ic-16")}The knowledge check unlocks after you have passed at
      least 80% of the objectives — finish the response first, then prove the concepts stuck.</p>`;
  } else if (state.quizSubmitted) {
    body = `<div class="quiz-body">
      <p style="font-size:14px;color:var(--stone-700)">Score ${correctCount}/${items.length}. Each item's explanation remains below — revisit any option to see why.</p>
      <ol class="quiz-review-list">${items.map((it, i) => `
        <li class="review-item">
          <p class="review-stem">${i + 1}. ${esc(it.stem)}</p>
          <p class="review-verdict ${state.quizAnswers[i] === it.correct ? "verdict-teal" : "verdict-red"}">
            your answer: ${state.quizAnswers[i] === it.correct ? "correct" : `incorrect — correct: ${esc(it.options[it.correct])}`}</p>
          <p class="review-why">${esc(it.why)}</p>
        </li>`).join("")}</ol>
    </div>`;
  } else {
    const options = current.options.map((opt, i) => {
      const isChosen = chosen === i;
      const isRight = i === current.correct;
      const tone = checked && isChosen
        ? (isRight ? "picked-right" : "picked-wrong")
        : !checked && isChosen ? "picked-unchecked" : "";
      return `<button type="button" class="quiz-opt ${tone}" role="radio" aria-checked="${isChosen}"
        data-action="quiz-answer" data-index="${i}" data-fk="quiz-${state.quizIndex}-${i}" ${checked ? "disabled" : ""}>
        <span class="quiz-opt-letter">${String.fromCharCode(65 + i)}.</span>
        <span class="quiz-opt-text">${esc(opt)}</span>
        ${checked && isChosen && isRight ? ic("check-circle-2", "ic-16 opt-ic-right") : ""}
        ${checked && isChosen && !isRight ? ic("x-circle", "ic-16 opt-ic-wrong") : ""}
      </button>`;
    }).join("");

    const whyPanel = checked ? `
      <div class="quiz-why anim-fade-slide" aria-live="polite">
        <p class="quiz-why-verdict ${chosen === current.correct ? "verdict-right" : "verdict-wrong"}">
          ${chosen === current.correct ? "correct — locked" : "not quite — locked"}</p>
        <p class="quiz-why-text">${esc(current.why)}</p>
      </div>` : "";

    const checkRow = !checked ? `
      <div class="quiz-check-row">
        <button type="button" class="btn btn-dark" data-action="quiz-check" ${chosen === null ? "disabled" : ""}>
          ${ic("clipboard-check", "ic-16")} Check answer</button>
        ${chosen === null ? `<p class="quiz-helptext" aria-live="polite">Select an answer to enable the check — nothing is highlighted until you do.</p>` : ""}
      </div>` : "";

    const nav = `<div class="quiz-nav">
      <button type="button" class="btn btn-white" data-action="quiz-nav" data-delta="-1" ${state.quizIndex === 0 ? "disabled" : ""}>← Prev</button>
      ${state.quizIndex < items.length - 1
        ? `<button type="button" class="btn btn-white" data-action="quiz-nav" data-delta="1" ${!checked ? "disabled" : ""}>Next →</button>`
        : `<button type="button" class="btn btn-dark" data-action="quiz-submit" ${!allChecked ? "disabled" : ""}>
            ${ic("clipboard-check", "ic-16")} Submit quiz (${checkedCount}/${items.length} checked)</button>`}
    </div>
    <p class="quiz-locknote">Answers lock as soon as they are checked — review earlier questions with Prev, but they cannot be changed.</p>`;

    body = `<div class="quiz-body">
      <p class="quiz-stem">${esc(current.stem)}</p>
      <div class="quiz-opts" role="radiogroup" aria-label="Question ${state.quizIndex + 1} options${checked ? " (checked and locked)" : ""}">
        ${options}</div>
      ${checkRow}${whyPanel}${nav}
    </div>`;
  }

  return `
  <section class="card" aria-labelledby="quiz-head" id="quiz-region">
    <h2 id="quiz-head" class="panel-head" style="flex-wrap:wrap">${ic("brain-circuit", "ic-16")} Knowledge Check
      <span class="head-aside">${headRight}</span></h2>
    ${body}
  </section>`;
}

// ── C6 debrief ───────────────────────────────────────────────────────────────
function viewDebrief() {
  return `
  <section class="card" aria-labelledby="debrief-head">
    <h2 id="debrief-head" class="panel-head">${ic("graduation-cap", "ic-16")} Debrief · Field Notes</h2>
    <div class="debrief-grid">
      <div>
        <h3 class="debrief-h">${ic("target", "ic-16")} Detection opportunities</h3>
        <ul class="det-stack">${DEBRIEF.detections.map((d) => `
          <li class="det-item"><p class="det-name">${esc(d.name)}</p>
            <p class="det-logic">IF ${esc(d.logic)}</p>
            <p class="det-anchor">${esc(d.anchor)}</p></li>`).join("")}</ul>
      </div>
      <div>
        <h3 class="debrief-h">${ic("wrench", "ic-16")} Mitigation recommendations (official IDs)</h3>
        <ul class="mit-stack">${DEBRIEF.mitigations.map(([id, why]) => `
          <li class="mit-item"><span class="mit-id">${esc(id)}</span><span class="mit-why"> — ${esc(why)}</span></li>`).join("")}</ul>
        <h3 class="debrief-h" style="margin-top:16px">${ic("shield-check", "ic-16")} Recovery checklist</h3>
        <ul class="list-disc">${DEBRIEF.recovery.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>
      </div>
      <div>
        <h3 class="debrief-h">Blue-team takeaways</h3>
        <ul class="list-disc">${DEBRIEF.blue.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
      </div>
      <div>
        <h3 class="debrief-h">Think like the adversary</h3>
        <ul class="list-disc">${DEBRIEF.red.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>
      </div>
    </div>
    <div class="debrief-links">
      <h3 class="debrief-h">${ic("link-2", "ic-16")} Official references (new tab)</h3>
      <ul class="link-list">${MITRE_LINKS.map(([label, href]) => `
        <li><a class="ext-link" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a></li>`).join("")}</ul>
    </div>
  </section>`;
}

// ── C2 knowledge core dialog ─────────────────────────────────────────────────
function kcSection(iconName, title, bodyHTML) {
  return `<section class="kc-section">
    <h3 class="kc-head">${ic(iconName, "ic-16")}${title}</h3>
    <div class="kc-body">${bodyHTML}</div>
  </section>`;
}

function viewKnowledgeDialog() {
  const disc = (items) => `<ul class="list-disc" style="margin-top:0">${items.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>`;
  return `
  <div class="dialog-overlay" data-action="overlay-close"></div>
  <div class="dialog-panel wide" role="dialog" aria-modal="true" aria-labelledby="kc-title" aria-describedby="kc-desc" tabindex="-1" id="kc-panel">
    <button type="button" class="dialog-close" data-action="kc-close" aria-label="Close">${ic("x", "ic-16")}</button>
    <div>
      <h2 id="kc-title" class="dialog-title">Knowledge Core · leaked credentials &amp; privilege escalation</h2>
      <p id="kc-desc" class="dialog-desc" style="margin-top:8px">Everything this lesson tests, in one drawer. MITRE data from the official ATT&amp;CK pages (links at the bottom).</p>
    </div>
    <div class="kc-stack">
      ${kcSection("fingerprint", "What happened in IR-114", `<p>${esc(KNOWLEDGE.what)}</p>`)}
      ${kcSection("eye", "Why attackers prize valid cloud credentials", `<p>${esc(KNOWLEDGE.why)}</p>`)}
      ${kcSection("key-round", "Where credentials leak (T1552 family)", disc(KNOWLEDGE.leaks))}
      ${kcSection("user-cog", "How privilege escalation works in cloud IAM", disc(KNOWLEDGE.escalation))}
      ${kcSection("list-ordered", "Incident-response lifecycle (the phase rail above you)",
        `<ol style="display:flex;flex-direction:column;gap:4px">${KNOWLEDGE.lifecycle.map(([name, desc]) =>
          `<li><span class="life-name">${esc(name)}</span> — ${esc(desc)}</li>`).join("")}</ol>`)}
      ${kcSection("shield-alert", "Real-world attribution (official MITRE examples)",
        `<ul style="display:flex;flex-direction:column;gap:4px">${KNOWLEDGE.attribution.map(([name, desc]) =>
          `<li><span class="bold">${esc(name)}:</span> ${esc(desc)}</li>`).join("")}</ul>`)}
      ${kcSection("book-open", "Glossary",
        `<dl class="glossary">${GLOSSARY.map((g) =>
          `<div><dt>${esc(g.term)}: </dt><dd>${esc(g.def)}</dd></div>`).join("")}</dl>`)}
      ${kcSection("link-2", "Official references (open in new tab)",
        `<ul class="kc-links">${MITRE_LINKS.map(([label, href]) =>
          `<li><a class="ext-link" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a></li>`).join("")}</ul>`)}
      <p class="kc-note">${ic("life-buoy", "ic-16")}Simplified for training: event names are AWS-style because MITRE's own analytics for these techniques
        cite them; the behaviors map to any IaaS provider. All data on this page is synthetic.</p>
    </div>
  </div>`;
}

// ── C7 completion modal (After-Action Report) ────────────────────────────────
const PILLAR_ORDER = ["UNDERSTAND", "RECOGNIZE", "DETECT", "MITIGATE"];

// R8: focus areas derived from THIS student's evidence — ported verbatim.
function computeFocusAreas(state, items, objs) {
  const areas = [];
  const topic = (o) => {
    const t = o.title.replace(/\s+/g, " ").trim();
    return t.length > 72 ? `${t.slice(0, 72).replace(/\s+\S*$/, "")}…` : t;
  };
  const firstSentences = (why) => {
    const parts = why.split(/(?<=[.!?])\s+/);
    let acc = "";
    for (const p of parts) {
      acc = acc ? `${acc} ${p}` : p;
      if (acc.length >= 60) break;
    }
    return (acc || why).trim();
  };
  for (const p of PILLAR_ORDER) {
    const inPillar = objs.filter((o) => o.pillar === p);
    const missed = inPillar.filter((o) => !state.objectives[o.id]?.passed);
    const helped = inPillar.filter((o) => (state.objectives[o.id]?.hints ?? 0) > 0 && state.objectives[o.id]?.passed);
    const retried = inPillar.filter(
      (o) => (state.objectives[o.id]?.attempts ?? 0) > 1 && (state.objectives[o.id]?.hints ?? 0) === 0 && state.objectives[o.id]?.passed
    );
    if (missed.length > 0) {
      areas.push({
        area: `${p[0]}${p.slice(1).toLowerCase()} objectives`,
        detail: `Still open: ${missed.map((o) => `${o.id} (${topic(o)})`).join("; ")}. Re-run these steps in the Incident Record, then read the matching Knowledge Core section.`,
      });
    } else if (helped.length > 0) {
      areas.push({
        area: `${p[0]}${p.slice(1).toLowerCase()} objectives`,
        detail: `Passed with hint support on ${helped.map((o) => o.id).join(", ")}. Redo those without hints to confirm the skill has stuck.`,
      });
    } else if (retried.length > 0) {
      areas.push({
        area: `${p[0]}${p.slice(1).toLowerCase()} objectives`,
        detail: `Needed a retry on ${retried.map((o) => o.id).join(", ")}. Re-run those once from a clean RESET to make the recognition instant.`,
      });
    }
  }
  items.forEach((it, i) => {
    if (state.quizAnswers[i] !== it.correct) {
      const picked = state.quizAnswers[i];
      const reasoning = firstSentences(it.why);
      areas.push({
        area: `Knowledge check ${i + 1}`,
        detail: picked === null || picked === undefined
          ? `Left unanswered. Correct reasoning: ${reasoning} Review the Debrief below for this topic.`
          : `You picked "${it.options[picked]}". Correct reasoning: ${reasoning} Review the Debrief below for this topic.`,
      });
    }
  });
  if (areas.length === 0) {
    areas.push({
      area: "No weak areas detected",
      detail: "Every objective and quiz item passed without hints. Deepen the win: take the other difficulty mode — the same evidence core plays very differently against the clock.",
    });
  }
  return areas;
}

function viewCompletionDialog(state) {
  const mode = state.mode === "hard" ? "hard" : "medium";
  const items = QUIZ[mode];
  const objs = objectivesFor(mode);
  const correct = items.reduce((n, it, i) => n + (state.quizAnswers[i] === it.correct ? 1 : 0), 0);
  const prog = progressOf(state, items.length, correct);

  return `
  <div class="dialog-overlay" data-action="overlay-close"></div>
  <div class="dialog-panel medium" role="dialog" aria-modal="true" aria-labelledby="aar-title" aria-describedby="aar-desc" tabindex="-1" id="aar-panel">
    <button type="button" class="dialog-close" data-action="report-close" aria-label="Close">${ic("x", "ic-16")}</button>
    <div>
      <h2 id="aar-title" class="dialog-title">After-Action Report · IR-114</h2>
      <p id="aar-desc" class="dialog-desc" style="margin-top:8px">Exercise CLOUDBURST complete — this is what you walked in with, and what you walk out with.</p>
    </div>
    <div class="kc-stack">
      <div class="score-box">
        <div>
          <p class="score-label">final score</p>
          <p class="score-value">${prog.score}%</p>
          <p class="score-sub">${prog.passed}/${prog.total} objectives · quiz ${correct}/${items.length} · hints used ${prog.hintsUsed}</p>
        </div>
        <div class="stars" role="img" aria-label="${prog.stars} of 3 stars">
          ${[1, 2, 3].map((s) => ic("star", s <= prog.stars ? "ic-36 star-on" : "ic-36 star-off")).join("")}
        </div>
      </div>
      <div class="pillar-grid">
        ${PILLAR_ORDER.map((p) => {
          const stat = prog.byPillar[p] ?? { passed: 0, total: 0 };
          return `<div class="pillar-row"><span class="pillar-name">${p}</span>
            <span class="pillar-score">${stat.passed}/${stat.total}</span></div>`;
        }).join("")}
      </div>
      <div class="focus-box">
        <p class="focus-h">${ic("target", "ic-16")} Focus areas — where to spend your next study hour</p>
        <ul class="focus-list">${computeFocusAreas(state, items, objs).map((f) => `
          <li class="focus-item"><p class="focus-area">${esc(f.area)}</p>
            <p class="focus-detail">${esc(f.detail)}</p></li>`).join("")}</ul>
      </div>
      <div class="info-box">
        <p class="box-h">${ic("award", "ic-16")} What you can now do</p>
        <ul class="list-disc" style="margin-top:6px">
          <li>Explain how one leaked key becomes initial access, persistence, escalation and collection — with the MITRE IDs to match.</li>
          <li>Pull the full IOC set and attack spine out of a noisy cloud audit trail, and defend why unrelated alerts are unrelated.</li>
          <li>Build and tune the detection (chain + allowlist) that catches this at escalation, before collection.</li>
          <li>Run containment in the defensible order, eradicate completely, and harden with the right mitigation IDs — while naming the residual risk honestly.</li>
        </ul>
      </div>
      <div class="info-box info-box-amber">
        <p class="box-h box-h-amber">${ic("book-open-check", "ic-16")} What to learn next</p>
        <ul class="list-disc" style="margin-top:6px">
          <li>CV0-004 Domain 4.0 (Cloud Security) — IAM design depth: federation, PIM-style JIT elevation, service-control policies.</li>
          <li>MITRE ATT&amp;CK Cloud matrix — walk the neighboring techniques: T1528, T1550.001, T1580.</li>
          <li>Try the other difficulty mode: the same evidence core plays very differently against the clock.</li>
        </ul>
      </div>
      <div class="dialog-actions">
        <button type="button" class="btn btn-dark" data-action="report-close">${ic("sparkles", "ic-16")} Back to the lab</button>
        <button type="button" class="btn btn-white-red" data-action="report-reset">${ic("redo-2", "ic-16")} Reset &amp; replay</button>
      </div>
    </div>
  </div>`;
}
