// HARBOR-7 — rendering layer: components as template functions + ephemeral UI state.
// Static port note: 1:1 port of the React components in src/components/lab/* —
// same structure, same classes-of-effect (translated to semantic CSS classes),
// same ARIA, same wording. Local React useState becomes the `ui` memory object
// below (session-only, exactly like component state that resets on unmount).

/* ---------------------------------- helpers ---------------------------------- */

function esc(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Ephemeral UI state — the static equivalent of React component useState.
 *  Reset on "screen change" (zone/stage/mode), which matches component unmount. */
const ui = {
  completionOpen: false,
  resetOpen: false,
  manifestOpen: false,
  dockerSelected: null,
  xrayInspect: null,
  berthOpenId: "payments-svc",
  glossaryOpen: null,
  fbOpen: {},
  resetEphemeral() {
    this.dockerSelected = null;
    this.xrayInspect = null;
    this.berthOpenId = "payments-svc";
    this.glossaryOpen = null;
    this.fbOpen = {};
  },
};

/* ---------------------------------- icons (Lucide, exact paths) ---------------------------------- */

const LUCIDE = {
  anchor: "<path d='M12 22V8'/><path d='M5 12H2a10 10 0 0 0 20 0h-3'/><circle cx='12' cy='5' r='3'/>",
  'clipboard-check': "<rect width='8' height='4' x='8' y='2' rx='1' ry='1'/><path d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'/><path d='m9 14 2 2 4-4'/>",
  'file-text': "<path d='M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z'/><path d='M14 2v4a2 2 0 0 0 2 2h4'/><path d='M10 9H8'/><path d='M16 13H8'/><path d='M16 17H8'/>",
  list: "<path d='M3 12h.01'/><path d='M3 18h.01'/><path d='M3 6h.01'/><path d='M8 12h13'/><path d='M8 18h13'/><path d='M8 6h13'/>",
  repeat: "<path d='m17 2 4 4-4 4'/><path d='M3 11v-1a4 4 0 0 1 4-4h14'/><path d='m7 22-4-4 4-4'/><path d='M21 13v1a4 4 0 0 1-4 4H3'/>",
  'rotate-ccw': "<path d='M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8'/><path d='M3 3v5h5'/>",
  star: "<path d='M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z'/>",
  'circle-check': "<circle cx='12' cy='12' r='10'/><path d='m9 12 2 2 4-4'/>",
  circle: "<circle cx='12' cy='12' r='10'/>",
  lightbulb: "<path d='M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5'/><path d='M9 18h6'/><path d='M10 22h4'/>",
  'list-checks': "<path d='m3 17 2 2 4-4'/><path d='m3 7 2 2 4-4'/><path d='M13 6h8'/><path d='M13 12h8'/><path d='M13 18h8'/>",
  'circle-x': "<circle cx='12' cy='12' r='10'/><path d='m15 9-6 6'/><path d='m9 9 6 6'/>",
  'circle-play': "<circle cx='12' cy='12' r='10'/><polygon points='10 8 16 12 10 16 10 8'/>",
  radio: "<path d='M16.247 7.761a6 6 0 0 1 0 8.478'/><path d='M19.075 4.933a10 10 0 0 1 0 14.134'/><path d='M4.925 19.067a10 10 0 0 1 0-14.134'/><path d='M7.753 16.239a6 6 0 0 1 0-8.478'/><circle cx='12' cy='12' r='2'/>",
  'shield-check': "<path d='M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z'/><path d='m9 12 2 2 4-4'/>",
  'skip-forward': "<polygon points='5 4 15 12 5 20 5 4'/><line x1='19' x2='19' y1='5' y2='19'/>",
  'arrow-right': "<path d='M5 12h14'/><path d='m12 5 7 7-7 7'/>",
  'book-open': "<path d='M12 7v14'/><path d='M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z'/>",
  container: "<path d='M22 7.7c0-.6-.4-1.2-.8-1.5l-6.3-3.9a1.72 1.72 0 0 0-1.7 0l-10.3 6c-.5.2-.9.8-.9 1.4v6.6c0 .5.4 1.2.8 1.5l6.3 3.9a1.72 1.72 0 0 0 1.7 0l10.3-6c.5-.3.9-1 .9-1.5Z'/><path d='M10 21.9V14L2.1 9.1'/><path d='m10 14 11.9-6.9'/><path d='M14 19.8v-8.1'/><path d='M18 17.5V9.4'/>",
  gauge: "<path d='m12 14 4-4'/><path d='M3.34 19a10 10 0 1 1 17.32 0'/>",
  ship: "<path d='M12 10.189V14'/><path d='M12 2v3'/><path d='M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6'/><path d='M19.38 20A11.6 11.6 0 0 0 21 14l-8.188-3.639a2 2 0 0 0-1.624 0L3 14a11.6 11.6 0 0 0 2.81 7.76'/><path d='M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1'/>",
  waves: "<path d='M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1'/><path d='M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1'/><path d='M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1'/>",
  flag: "<path d='M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528'/>",
  'scan-search': "<path d='M3 7V5a2 2 0 0 1 2-2h2'/><path d='M17 3h2a2 2 0 0 1 2 2v2'/><path d='M21 17v2a2 2 0 0 1-2 2h-2'/><path d='M7 21H5a2 2 0 0 1-2-2v-2'/><circle cx='12' cy='12' r='3'/><path d='m16 16-1.9-1.9'/>",
  ban: "<circle cx='12' cy='12' r='10'/><path d='m4.9 4.9 14.2 14.2'/>",
  'check-check': "<path d='M18 6 7 17l-5-5'/><path d='m22 10-7.5 7.5L13 16'/>",
  'shield-x': "<path d='M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z'/><path d='m14.5 9.5-5 5'/><path d='m9.5 9.5 5 5'/>",
  award: "<path d='m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526'/><circle cx='12' cy='8' r='6'/>",
  crosshair: "<circle cx='12' cy='12' r='10'/><line x1='22' x2='18' y1='12' y2='12'/><line x1='6' x2='2' y1='12' y2='12'/><line x1='12' x2='12' y1='6' y2='2'/><line x1='12' x2='12' y1='22' y2='18'/>",
  eye: "<path d='M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0'/><circle cx='12' cy='12' r='3'/>",
  'book-marked': "<path d='M10 2v8l3-3 3 3V2'/><path d='M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20'/>",
  swords: "<polyline points='14.5 17.5 3 6 3 3 6 3 17.5 14.5'/><line x1='13' x2='19' y1='19' y2='13'/><line x1='16' x2='20' y1='16' y2='20'/><line x1='19' x2='21' y1='21' y2='19'/><polyline points='14.5 6.5 18 3 21 3 21 6 17.5 9.5'/><line x1='5' x2='9' y1='14' y2='18'/><line x1='7' x2='4' y1='17' y2='20'/><line x1='3' x2='5' y1='19' y2='21'/>",
  x: "<path d='M18 6 6 18'/><path d='m6 6 12 12'/>",
  'chevron-down': "<path d='m6 9 6 6 6-6'/>",
};

function icon(name, cls, extra) {
  const c = cls || "ic";
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${c}" aria-hidden="true"${extra ? " " + extra : ""}>${LUCIDE[name] || ""}</svg>`;
}

/* ---------------------------------- shared bits ---------------------------------- */

const PILLAR_META = {
  P1: { label: "UNDERSTAND", color: "c-teal", dim: "pill pillar-teal", icon: "◉" },
  P2: { label: "RECOGNIZE", color: "c-amber", dim: "pill pillar-amber", icon: "◈" },
  P3: { label: "DETECT", color: "c-mint", dim: "pill pillar-mint", icon: "◆" },
  P4: { label: "MITIGATE", color: "c-danger", dim: "pill pillar-danger", icon: "⬢" },
};

const PILLAR_LABEL = {
  P1: "UNDERSTAND — what it is & why attackers care",
  P2: "RECOGNIZE — found it in real evidence",
  P3: "DETECT — named sources, techniques, false positives",
  P4: "MITIGATE — chose controls & sequenced response",
};

const ZONE_LABEL = {
  manual: "HARBOR MANUAL",
  drydock: "DRY DOCK",
  gate: "CUSTOMS GATE",
  berths: "THE BERTHS",
};

const ZONE_HEAD = {
  manual: {
    code: "STATION 1 — REFERENCE",
    title: "Harbor Manual",
    blurb: "The knowledge core for Lesson 4.3: what containers are, why attackers prize them, and where they sit in the attack chain. The drills here are objectives OBJ-M1/M2 (medium) or OBJ-H1 (hard).",
  },
  drydock: {
    code: "ZONE A — BUILD STAGE",
    title: "The Dry Dock",
    blurb: "Every weakness the harbor will ever have starts here, in the Dockerfile and its layers. Audit the build that ships nightly, then X-ray what actually left the yard.",
  },
  gate: {
    code: "ZONE B — SHIP STAGE",
    title: "Customs Gate",
    blurb: "The registry is the port every image enters through. The admission controller is the customs officer: no verified seal, no immutable cargo ID, no clean scan — no entry.",
  },
  berths: {
    code: "ZONE C — RUN / DETECT / MITIGATE",
    title: "The Berths",
    blurb: "Where cargo becomes workloads — and where last night's incident actually happened. Audit the running configs, triage the live feed, pin the MITRE techniques, harden the pod spec, and set the control board.",
  },
};

function Stars(n, size) {
  const s = size || 14;
  let out = "";
  for (let i = 1; i <= 5; i++) {
    out += icon("star", i <= n ? "ic star-on" : "ic star-off", `style="width:${s}px;height:${s}px"`);
  }
  return `<span class="stars" role="img" aria-label="${n} of 5 stars">${out}</span>`;
}

function PillarBadge(pillar) {
  const m = PILLAR_META[pillar];
  return `<span class="${m.dim}"><span aria-hidden="true">${m.icon}</span>${m.label}</span>`;
}

function SimulatorNote(children) {
  return `<p class="simnote">TRAINING SIMULATION — SYNTHETIC DATA${children ? ` · ${children}` : ""}</p>`;
}

function ZoneHeader(zoneKey) {
  const z = ZONE_HEAD[zoneKey];
  return `
    <div class="zonehead">
      <button type="button" data-act="zone" data-zone="" class="backlink">← RETURN TO HARBOR MAP</button>
      <div>
        <p class="kick kick-amber">${z.code}</p>
        <h2 class="zone-title">${z.title}</h2>
        <p class="zone-blurb">${z.blurb}</p>
      </div>
    </div>`;
}

/* ---------------------------------- opening stages ---------------------------------- */

function Splash() {
  return `
    <main class="splash">
      ${icon("anchor", "ic ic-32 pulse c-amber")}
      <p class="splash-line">RAISING THE HARBOR…</p>
    </main>`;
}

function Intro() {
  const st = Lab.state;
  const hasProgress = st.startedAt !== null || Object.keys(st.objectives).length > 0;
  return `
    <main class="screen-center scanlines">
      <p class="kick kick-amber trk-40">TRAINING EXERCISE ${LAB_ID} — SYNTHETIC DATA ONLY</p>
      <div class="brand-row">
        ${icon("anchor", "ic ic-32 c-amber")}
        <h1 class="brand-title">HARBOR-7</h1>
      </div>
      <p class="brand-sub">Container Security Exercise — Build · Ship · Run · Monitor</p>
      <p class="brand-desc">An interactive practice lab for <span class="c-text">CompTIA Cloud+ (CV0-004), Lesson 4.3 — Container security</span>: safeguarding containerized applications and resources. Inspect the images you build, the cargo you ship, and the workloads you run — then harden the harbor.</p>
      <button type="button" data-act="stage" data-stage="briefing" class="btn-primary btn-begin">
        ${icon("circle-play", "ic ic-20")} ${hasProgress ? "RESUME EXERCISE" : "BEGIN EXERCISE"}
      </button>
      <p class="fiction-note">ALL ORGS · DOMAINS · CREDENTIALS · EVENTS ARE FICTIONAL</p>
    </main>`;
}

function Briefing() {
  const isResume = Lab.state.briefingSeen;
  return `
    <main class="screen-center">
      <div class="brief-card">
        <div class="brief-head">
          ${icon("radio", "ic ic-16 c-amber")}
          <p class="kick kick-amber trk-25">${BRIEFING.callsign}</p>
        </div>
        <div class="brief-body">
          ${BRIEFING.lines.map((l, i) => `<p class="${i === 0 ? "brief-line-first" : "brief-line"}">${l}</p>`).join("")}
          <p class="brief-sign">${BRIEFING.sign}</p>
        </div>
        <div class="brief-foot">
          <p class="microlbl">SHIFT: CLOUD SECURITY ENGINEER · HARBOR OPS</p>
          <button type="button" data-act="brief-ack" class="btn-primary">
            ${icon("shield-check", "ic ic-16")} ${isResume ? "BACK TO MODE SELECT" : "ACKNOWLEDGE — PICK YOUR SHIFT"}
          </button>
        </div>
      </div>
    </main>`;
}

function ModeSelect() {
  const st = Lab.state;
  return `
    <main class="screen-center">
      <p class="kick kick-amber trk-35">SELECT YOUR SHIFT</p>
      <h2 class="mode-h2">Two ways to run this exercise</h2>
      <p class="mode-p">Both modes share the same harbor and the same evidence. You can switch modes later from the status strip without losing the evidence you inspected — objectives and scoring are per mode.</p>
      <div class="mode-grid">
        ${["medium", "hard"].map((m) => {
          const c = MODE_CARDS[m];
          const cls = m === "medium" ? "mode-card mode-medium" : "mode-card mode-hard";
          return `
            <div class="${cls}">
              <p class="mode-tag">${c.tag.toUpperCase()}</p>
              <h3 class="mode-name">${c.name}</h3>
              <ul class="mode-bullets">
                ${c.bullets.map((b) => `<li class="mode-li"><span class="mode-dot" aria-hidden="true"></span>${b}</li>`).join("")}
              </ul>
              <button type="button" data-act="mode" data-mode="${m}" class="btn-shift ${m === "medium" ? "btn-shift-teal" : "btn-shift-danger"}" aria-label="Start ${c.name} mode">
                ${icon("skip-forward", "ic ic-16")} ${st.mode === m ? "RE-ENTER THIS SHIFT" : "SHIP OUT"}
              </button>
            </div>`;
        }).join("")}
      </div>
    </main>`;
}

/* ---------------------------------- chrome: status strip ---------------------------------- */

function StatusStrip() {
  const st = Lab.state;
  const p = Lab.progress();
  const mode = Lab.mode();
  const ready = Lab.completionReady();
  const shown = st.completedShown[mode];
  return `
    <header class="strip">
      <div class="strip-inner">
        <div class="strip-brand">
          ${icon("anchor", "ic ic-16 c-amber")}
          <span class="brand-name">HARBOR-7</span>
          <span class="brand-exercise">EXERCISE HB-043</span>
        </div>
        ${
          st.mode
            ? `<div class="strip-mode">
                <span class="pill ${st.mode === "medium" ? "badge-mode-teal" : "badge-mode-danger"}">${st.mode === "medium" ? "MEDIUM" : "HARD"} · ${st.mode === "medium" ? "CADET" : "INSPECTOR"}</span>
                <button type="button" data-act="stage" data-stage="mode" class="btn btn-outline btn-strip" aria-label="Switch difficulty mode — keeps inspected evidence, objectives and scoring are per mode">
                  ${icon("repeat", "ic ic-14")}<span class="hide-sm">SWITCH SHIFT</span>
                </button>
              </div>`
            : ""
        }
        <div class="strip-progress">
          <div class="strip-progress-l">
            <span class="microlbl2">${p.done}/${p.total} OBJ</span>
            <div class="progress" role="progressbar" aria-label="Objective progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p.score}"><div class="progress-fill" style="transform:translateX(-${100 - p.score}%)"></div></div>
          </div>
          <span class="hide-md microlbl2">QUIZ ${st.quiz[st.mode ?? "medium"]?.submitted ? `${p.quizPct}%` : "PENDING"}</span>
          ${Stars(p.stars, 12)}
        </div>
        <div class="strip-actions">
          ${ready && !shown ? `<button type="button" data-act="completion-open" class="btn btn-mint btn-strip">DEPARTURE CLEARANCE</button>` : ""}
          ${ready && shown ? `<button type="button" data-act="completion-open" class="btn btn-outline btn-strip">VIEW CLEARANCE</button>` : ""}
          <button type="button" data-act="manifest-open" class="btn btn-outline btn-strip show-lg-none">
            ${icon("list", "ic ic-14")} MANIFEST ${p.done}/${p.total}
          </button>
          <button type="button" data-act="reset-open" class="btn btn-outline btn-strip btn-strip-reset">
            ${icon("rotate-ccw", "ic ic-14")} RESET
          </button>
        </div>
      </div>
    </header>`;
}

/* ---------------------------------- chrome: duty manifest ---------------------------------- */

function ManifestRow(o, compact) {
  const passed = !!Lab.state.objectives[o.id]?.done;
  const title = !compact && o.title.length > 64 ? o.title.slice(0, 64) + "…" : o.title;
  return `
    <button type="button" data-act="zone" data-zone="${o.zone}" ${o.zone === "berths" ? `data-tab="${berthTabForObjective(o.id)}"` : ""} class="mrow ${passed ? "mrow-passed" : ""}" aria-label="${o.id} — ${o.title} — ${passed ? "passed" : "open"} — located in ${ZONE_LABEL[o.zone]}">
      <span class="mrow-pillar ${PILLAR_META[o.pillar].color}" aria-hidden="true">${PILLAR_META[o.pillar].icon}</span>
      <span class="mrow-main">
        <span class="mrow-id">${o.id} · ${ZONE_LABEL[o.zone]}</span>
        <span class="mrow-title ${passed ? "mrow-title-passed" : ""}">${title}</span>
      </span>
      <span class="mrow-dot ${passed ? "mrow-dot-on" : ""}" aria-hidden="true"></span>
    </button>`;
}

function ManifestRail() {
  const st = Lab.state;
  const p = Lab.progress();
  const objectives = Lab.objectives();
  const mode = Lab.mode();
  const quiz = st.quiz[mode];
  return `
    <aside class="rail" aria-label="Duty manifest — objective tracker">
      <div class="rail-head">
        <p class="rail-title">DUTY MANIFEST</p>
        <p class="rail-sub">${p.done}/${p.total} OBJECTIVES · ${p.hints} HINT${p.hints === 1 ? "" : "S"} USED</p>
      </div>
      <div class="rail-scroll">
        <div class="rail-list">
          ${objectives.map((o) => ManifestRow(o, false)).join("")}
        </div>
      </div>
      <div class="rail-foot">
        <button type="button" data-act="stage" data-stage="quiz" class="raillink ${st.stage === "quiz" ? "raillink-active" : ""}">
          ${icon("clipboard-check", "ic ic-14")}<span class="raillink-label">CUSTOMS INSPECTION (QUIZ)</span><span class="raillink-note">${quiz?.submitted ? `${p.quizPct}%` : `${mode === "hard" ? 7 : 6} QUESTIONS`}</span>
        </button>
        <button type="button" data-act="stage" data-stage="debrief" class="raillink ${st.stage === "debrief" ? "raillink-active" : ""}">
          ${icon("file-text", "ic ic-14")}<span class="raillink-label">HARBORMASTER'S REPORT</span><span class="raillink-note">DEBRIEF</span>
        </button>
        <button type="button" data-act="completion-open" class="raillink" ${Lab.completionReady() ? "" : "disabled"}>
          ${icon("anchor", "ic ic-14")}<span class="raillink-label">DEPARTURE CLEARANCE</span><span class="raillink-note">${Lab.completionReady() ? "READY" : "FINISH OBJECTIVES + QUIZ"}</span>
        </button>
      </div>
    </aside>`;
}

function ManifestSheet() {
  const st = Lab.state;
  const p = Lab.progress();
  const objectives = Lab.objectives();
  return `
    <div class="overlay" data-act="manifest-close-overlay">
      <div class="sheet" role="dialog" aria-modal="true" aria-label="Duty manifest">
        <div class="sheet-head">
          <p class="sheet-title">DUTY MANIFEST</p>
          <button type="button" data-act="manifest-close" class="overlay-close" aria-hidden="false">
            ${icon("x", "ic ic-20")}<span class="sr-only">Close</span>
          </button>
        </div>
        <div class="sheet-scroll">
          <div class="sheet-list">
            ${objectives.map((o) => ManifestRow(o, true)).join("")}
          </div>
        </div>
        <span class="sr-only">${st.mode} mode manifest</span>
      </div>
    </div>`;
}

function ResetDialog() {
  return `
    <div class="overlay" data-overlay-static>
      <div class="dialog dialog-sm" role="alertdialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-desc">
        <div class="dialog-head">
          <p id="reset-title" class="dialog-title">Reset the exercise?</p>
          <p id="reset-desc" class="dialog-desc">This clears every objective, stamp, quiz answer and saved progress for HARBOR-7, and returns the lab to its pristine state. This cannot be undone.</p>
        </div>
        <div class="dialog-foot">
          <button type="button" data-act="reset-cancel" class="btn btn-outline-plain">KEEP PROGRESS</button>
          <button type="button" data-act="reset-confirm" class="btn btn-danger">RESET LAB</button>
        </div>
      </div>
    </div>`;
}

/* ---------------------------------- harbor map ---------------------------------- */

const QUAY = [
  { id: "drydock", code: "ZONE A", name: "THE DRY DOCK", desc: "What we BUILD. Dockerfile audit, image layer X-ray, secret remediation.", ic: "gauge", accent: "c-amber" },
  { id: "gate", code: "ZONE B", name: "CUSTOMS GATE", desc: "What we SHIP. Registry adjudication — seals, digests, scan reports.", ic: "ship", accent: "c-teal" },
  { id: "berths", code: "ZONE C", name: "THE BERTHS", desc: "What we RUN. Workload configs, runtime feed, pod spec, control board.", ic: "container", accent: "c-mint" },
];

const SERVICES = [
  { id: "manual", code: "STATION 1", name: "HARBOR MANUAL", desc: "Knowledge core: how containers work, why attackers prize them, glossary.", ic: "book-open", accent: "c-teal" },
  { id: "quiz", code: "STATION 2", name: "CUSTOMS INSPECTION", desc: "The knowledge check. Explanations after every answer.", ic: "clipboard-check", accent: "c-amber" },
  { id: "debrief", code: "STATION 3", name: "HARBORMASTER'S REPORT", desc: "Debrief: detections, mitigations with MITRE IDs, field notes, references.", ic: "file-text", accent: "c-danger" },
];

function PlaceCard(def, progress, enterAct, enterData) {
  const allDone = progress ? progress.done === progress.total : false;
  const attrs = Object.entries(enterData || {}).map(([k, v]) => `data-${k}="${v}"`).join(" ");
  return `
    <button type="button" ${enterAct ? `data-act="${enterAct}" ${attrs}` : ""} class="place" aria-label="${def.name} — ${def.desc}${progress ? ` — ${progress.done} of ${progress.total} objectives complete` : ""}">
      <span class="tick tick-tl" aria-hidden="true"></span><span class="tick tick-tr" aria-hidden="true"></span><span class="tick tick-bl" aria-hidden="true"></span><span class="tick tick-br" aria-hidden="true"></span>
      <div class="place-top">
        <span class="kick ${def.accent}">${def.code}</span>
        ${progress ? `<span class="place-count ${allDone ? "place-count-done" : ""}">${progress.done}/${progress.total}</span>` : ""}
      </div>
      <div class="place-icon ${def.accent}">${icon(def.ic, "ic ic-20")}</div>
      <h3 class="place-name">${def.name}</h3>
      <p class="place-desc">${def.desc}</p>
      <span class="place-enter">ENTER ${icon("arrow-right", "ic ic-12")}</span>
    </button>`;
}

function HarborMap() {
  const st = Lab.state;
  const mode = Lab.mode();
  const objectives = Lab.objectives();
  const ready = Lab.completionReady();

  const zoneProgress = (z) => {
    const list = objectives.filter((o) => o.zone === z);
    return { done: list.filter((o) => st.objectives[o.id]?.done).length, total: list.length };
  };
  const quizDone = st.quiz[Lab.mode()]?.submitted ?? false;
  const debriefSeen = Object.values(st.completedShown).some(Boolean);

  return `
    <main class="zone-main water max-w-7xl">
      <div class="map-head">
        <div>
          <p class="kick kick-amber">BERTH PLAN · SHIFT ${mode === "medium" ? "CADET" : "INSPECTOR"}</p>
          <h2 class="zone-title">Harbor Map</h2>
          <p class="zone-blurb">Work the quays in any order — the manifest keeps score. Start at the Harbor Manual if this is your first shift with containers.</p>
        </div>
        ${ready ? `<button type="button" data-act="completion-open" class="btn btn-mint">${icon("anchor", "ic ic-16")} REQUEST DEPARTURE CLEARANCE</button>` : ""}
      </div>

      <section aria-label="Quays — evidence zones" class="grid-3">
        ${QUAY.map((p) => PlaceCard(p, zoneProgress(p.id), "zone", { zone: p.id })).join("")}
      </section>

      <div class="patrol" aria-hidden="true">
        ${icon("waves", "ic ic-16 waves-l")}
        <div class="patrol-line"></div>
        <span class="patrol-label">PATROL ROUTE — SERVICES BERTH</span>
        <div class="patrol-line"></div>
        ${icon("waves", "ic ic-16 waves-r")}
      </div>

      <section aria-label="Port services" class="grid-3">
        ${SERVICES.map((p) => {
          const progress = p.id === "quiz" ? { done: quizDone ? 1 : 0, total: 1 } : p.id === "debrief" ? { done: debriefSeen ? 1 : 0, total: 1 } : zoneProgress("manual");
          const act = p.id === "quiz" ? "stage" : p.id === "debrief" ? "stage" : "zone";
          const data = p.id === "manual" ? { zone: "manual" } : { stage: p.id };
          return PlaceCard(p, progress, act, data);
        }).join("")}
      </section>

      <p class="map-foot">TRAINING SIMULATION — SYNTHETIC DATA · MITRE ATT&amp;CK IDs USED IN THIS LAB: T1609 · T1610 · T1611 · T1612 · T1613 · T1053.007 · T1552.007 (VERIFIED AGAINST OFFICIAL MITRE DATA)</p>
    </main>`;
}

/* ---------------------------------- objective panel + feedback ---------------------------------- */

function FeedbackPanel(pass, title, body, detail, collapsible, oid) {
  const open = ui.fbOpen[oid] !== false;
  return `
    <div class="fb ${pass ? "fb-pass" : "fb-fail"}">
      <div class="fb-head">
        <p class="fb-title ${pass ? "c-mint" : "c-danger"}">${icon(pass ? "circle-check" : "circle-x", "ic ic-14")} ${pass ? "PASS — " : "NOT YET — "}${title}</p>
        ${collapsible ? `<button type="button" data-act="fb-toggle" data-oid="${oid}" class="fb-toggle" aria-expanded="${open}">${open ? "HIDE WHY" : "WHY IT MATTERS"}</button>` : ""}
      </div>
      ${
        open
          ? `<p class="fb-body">${body}</p>
             ${detail && detail.length > 0 ? `<ul class="fb-detail">${detail.map((d) => `<li>${d}</li>`).join("")}</ul>` : ""}
            `
          : ""
      }
    </div>`;
}

function ObjectivePanel(o, inner) {
  const st = Lab.state.objectives[o.id];
  const passed = !!st?.done;
  const check = App.lastCheck && App.lastCheck.objectiveId === o.id ? App.lastCheck.result : null;
  const isHard = o.mode === "hard";
  const revealed = Math.min(st?.hintsUsed ?? 0, o.hints.length);

  const hintLabel = isHard
    ? revealed >= 1
      ? "NUDGE USED"
      : "USE NUDGE (−COSTS STARS)"
    : revealed >= o.hints.length
      ? "ALL HINTS REVEALED"
      : `HINT ${revealed + 1}/${o.hints.length}`;
  const hintDisabled = passed || (isHard ? revealed >= 1 : revealed >= o.hints.length);

  return `
    <section class="opanel ${passed ? "opanel-passed" : ""}" aria-label="Objective ${o.id}: ${o.title}">
      <header class="opanel-head">
        <div class="opanel-head-main">
          <div class="opanel-badges">
            <span class="mono-id">${o.id}</span>
            ${PillarBadge(o.pillar)}
            ${
              passed
                ? `<span class="pill status-passed">${icon("circle-check", "ic ic-12")} PASSED</span>`
                : `<span class="pill status-open">${icon("circle", "ic ic-12")} OPEN</span>`
            }
          </div>
          <h3 class="opanel-title">${o.title}</h3>
          <p class="opanel-context">${o.context}</p>
          <p class="opanel-anchor">COVERS · ${o.anchor}</p>
        </div>
      </header>
      ${inner ? `<div class="opanel-body">${inner}</div>` : ""}
      <footer class="opanel-foot">
        <div class="opanel-actions">
          <button type="button" data-act="check" data-oid="${o.id}" ${passed ? "disabled" : ""} class="btn ${passed ? "btn-passed" : "btn-amber"}" aria-label="Check results for ${o.id}">
            ${icon("list-checks", "ic ic-16")} ${passed ? "PASSED" : "CHECK RESULTS"}
          </button>
          <button type="button" data-act="hint" data-oid="${o.id}" ${hintDisabled ? "disabled" : ""} class="btn btn-outline-plain" aria-label="Reveal hint for ${o.id}">
            ${icon("lightbulb", "ic ic-16")} ${hintLabel}
          </button>
          ${st && st.attempts > 0 && !passed ? `<span class="attempts">${st.attempts} check${st.attempts > 1 ? "s" : ""} so far — reread, adjust, re-check.</span>` : ""}
        </div>
        ${
          revealed > 0
            ? `<ul class="hints" aria-label="Revealed hints">
                ${o.hints.slice(0, revealed).map((h, i) => `<li class="hint-chip"><span class="hint-label">${isHard ? "NUDGE" : `${h.label.toUpperCase()} ${i + 1}`}</span>${h.text}</li>`).join("")}
              </ul>`
            : ""
        }
        ${check && !passed ? `<div role="status" aria-live="polite">${FeedbackPanel(false, check.title, check.body, check.detail, false, o.id)}</div>` : ""}
        ${passed ? `<div role="status">${FeedbackPanel(true, check?.title ?? "Passed.", check?.body ?? o.context, check?.detail, true, o.id)}</div>` : ""}
      </footer>
    </section>`;
}

/** Ordered-pool drill (lifecycle, chain, attack chain, rollout). */
function Sequencer(pool, value, path, emptyHint, seed) {
  const shuffledPool = seededShuffle(pool, seed);
  const remaining = shuffledPool.filter((p) => !value.includes(p.id));
  return `
    <div class="seq">
      <div class="seq-pool" aria-label="Unordered items">
        ${remaining.map((p) => `<button type="button" data-act="seq-add" data-path="${path}" data-id="${p.id}" class="seq-chip">${p.label}</button>`).join("")}
        ${remaining.length === 0 ? `<p class="seq-done">ALL PLACED — RUN CHECK RESULTS</p>` : ""}
      </div>
      <ol class="seq-list" aria-label="Your order">
        ${value.length === 0 ? `<li class="seq-empty">${emptyHint}</li>` : ""}
        ${value.map((id, i) => `<li class="seq-item"><span class="seq-num">${i + 1}.</span><span class="seq-label">${pool.find((p) => p.id === id)?.label}</span><button type="button" data-act="seq-remove" data-path="${path}" data-pos="${i}" aria-label="Remove position ${i + 1}" class="xbtn">×</button></li>`).join("")}
      </ol>
      ${value.length > 0 ? `<button type="button" data-act="seq-clear" data-path="${path}" class="btn btn-outline btn-sm">${icon("rotate-ccw", "ic ic-12")} CLEAR ORDER</button>` : ""}
    </div>`;
}

function RadioChoices(label, value, onChangeAct, options, extraData) {
  return `
    <div>
      <p class="fld-label">${label}</p>
      <div class="radio-col" role="radiogroup" aria-label="${label}">
        ${options
          .map((o) => {
            const extra = Object.entries(extraData || {}).map(([k, v]) => `data-${k}="${v}"`).join(" ");
            return `<button type="button" role="radio" aria-checked="${value === o.id}" data-act="${onChangeAct}" data-val="${o.id}" ${extra} class="radio-card ${value === o.id ? "radio-on" : ""}">
              <span class="radio-dot ${value === o.id ? "radio-dot-on" : ""}" aria-hidden="true"></span>${o.label}
            </button>`;
          })
          .join("")}
      </div>
    </div>`;
}

/* ---------------------------------- harbor manual (knowledge core) ---------------------------------- */

function KnowledgeCore() {
  const st = Lab.state;
  const env = st.env;
  const objectives = Lab.objectives();
  const m1 = objectives.find((o) => o.id === "OBJ-M1");
  const m2 = objectives.find((o) => o.id === "OBJ-M2");
  const h1 = objectives.find((o) => o.id === "OBJ-H1");

  const m1Panel = m1
    ? `<div class="stack-item">
        ${ObjectivePanel(
          m1,
          `${Sequencer(LIFECYCLE_STAGES.map((s) => ({ id: s.id, label: s.label })), env.lifecycle, "lifecycle", "ORDER THE FIVE STAGES — CLICK THEM IN SEQUENCE", "lifecycle")}
           <ol class="stages-legend">${LIFECYCLE_STAGES.map((s) => `<li class="legend-li"><span class="c-amber mono">${s.label}</span> — ${s.blurb}</li>`).join("")}</ol>`,
        )}
      </div>`
    : "";

  const m2Panel = m2
    ? `<div class="stack-item">
        ${ObjectivePanel(
          m2,
          `<div class="iso-col">
            ${ISOLATION_STATEMENTS.map((s) => {
              const cur = env.isolation[s.id];
              const sel = (v) => (cur === v ? (v ? "tf tf-true-on" : "tf tf-false-on") : "tf");
              return `<div class="iso-row">
                <p class="iso-text">${s.text}</p>
                <div class="tf-group" role="group" aria-label="Statement: ${s.text}">
                  <button type="button" data-act="iso" data-sid="${s.id}" data-val="true" aria-pressed="${cur === true}" class="${sel(true)}">TRUE</button>
                  <button type="button" data-act="iso" data-sid="${s.id}" data-val="false" aria-pressed="${cur === false}" class="${sel(false)}">FALSE</button>
                </div>
              </div>`;
            }).join("")}
          </div>`,
        )}
      </div>`
    : "";

  const h1Panel = h1
    ? `<div class="stack-item">
        ${ObjectivePanel(
          h1,
          `<div class="chain-brief">
            <div>
              <p class="part-label">PART A — ORDER THE CHAIN</p>
              ${Sequencer(MITRE_TECHNIQUES.filter((t) => CHAIN_ANSWER.includes(t.id)).map((t) => ({ id: t.id, label: t.label })), env.chainOrder, "chainOrder", "ORDER THE FOUR TECHNIQUES AS AN ATTACKER WOULD CHAIN THEM", "chain")}
            </div>
            <div>
              <p class="part-label">PART B — WHY IS ESCAPE THE CROWN-JEWEL RISK?</p>
              ${RadioChoices("Why is escape the crown-jewel risk", env.kernelWhy, "kernel-why", KERNEL_WHY_OPTIONS)}
            </div>
          </div>`,
        )}
      </div>`
    : "";

  return `
    <main class="zone-main water max-w-5xl">
      ${ZoneHeader("manual")}
      <div class="kc-core">
        <h3 class="kc-h">WHAT YOU ARE DEFENDING</h3>
        ${KNOWLEDGE.what.map((p) => `<p class="kc-p">${p}</p>`).join("")}
        <h3 class="kc-h kc-h-mt">WHY ATTACKERS WANT IN</h3>
        ${KNOWLEDGE.why.map((p) => `<p class="kc-p">${p}</p>`).join("")}
        <h3 class="kc-h kc-h-mt">COMMON VARIANTS &amp; PIVOTS</h3>
        <ul class="variants-grid">
          ${KNOWLEDGE.variants.map((v) => `<li class="variant"><span class="variant-dot" aria-hidden="true"></span>${v}</li>`).join("")}
        </ul>
        ${SimulatorNote()}
      </div>
      ${m1Panel}
      ${m2Panel}
      ${h1Panel}
      <div class="glossary">
        <h3 class="kc-h">GLOSSARY — ${GLOSSARY.length} TERMS</h3>
        <p class="glossary-sub">Every term the lesson assumes you know, one line each.</p>
        <div class="acc">
          ${GLOSSARY.map((g) => {
            const open = ui.glossaryOpen === g.term;
            return `<div class="acc-item">
              <button type="button" data-act="glossary" data-term="${esc(g.term)}" class="acc-trigger" aria-expanded="${open}">${g.term}${icon("chevron-down", `ic ic-16 acc-chev ${open ? "acc-chev-open" : ""}`)}</button>
              ${open ? `<div class="acc-content">${g.def}</div>` : ""}
            </div>`;
          }).join("")}
        </div>
      </div>
      <div class="h-6"></div>
    </main>`;
}

/* ---------------------------------- dry dock ---------------------------------- */

function DockerfileInspector(o) {
  const env = Lab.state.env;
  const selected = ui.dockerSelected;
  const flags = env.dockerFlags;
  const flaggedCount = Object.values(flags).filter(Boolean).length;
  const selLine = DOCKER_LINES.find((l) => l.id === selected);

  return `
    <div class="col-gap">
      <div class="tool-row">
        <span class="pill pill-outline mono-tiny">BUILD FARM · freight-portal/Dockerfile</span>
        <span class="microlbl">${flaggedCount} LINE${flaggedCount === 1 ? "" : "S"} FLAGGED</span>
        <button type="button" data-act="docker-clear-all" class="btn btn-outline btn-sm tool-row-end">CLEAR FLAGS</button>
      </div>

      <div class="code-box" aria-label="Dockerfile lines">
        ${DOCKER_LINES.map((l) => {
          const flagged = flags[l.id];
          const active = selected === l.id;
          return `<button type="button" data-act="docker-select" data-id="${l.id}" aria-expanded="${active}" class="code-line ${flagged ? "code-line-flagged" : active ? "code-line-active" : ""}">
            <span class="code-num">${l.n}</span>
            <span class="code-text ${flagged ? "c-danger" : "c-text"}">${icon("flag", `ic ic-12 code-flag ${flagged ? "" : "code-flag-off"}`)}${l.text}</span>
            ${flagged ? `<span class="code-cat">${FLAG_CATEGORIES.find((c) => c.id === flagged)?.label}</span>` : ""}
          </button>`;
        }).join("")}
      </div>

      ${
        selected
          ? `<div class="flag-panel">
              <p class="kick kick-amber">LINE ${selLine?.n} — FLAG AS:</p>
              <div class="chip-row" role="group" aria-label="Flag categories">
                ${FLAG_CATEGORIES.map((c) => {
                  const on = flags[selected] === c.id;
                  return `<button type="button" data-act="docker-flag" data-line="${selected}" data-cat="${c.id}" aria-pressed="${on}" class="chip ${on ? "chip-danger-on" : "chip-danger"}">${c.label}</button>`;
                }).join("")}
                <button type="button" data-act="docker-nofinding" data-line="${selected}" class="chip chip-plain">NO FINDING</button>
              </div>
              ${
                flags[selected]
                  ? `<p class="flag-why"><span class="c-amber">WHY IT MATTERS · </span>${FLAG_CATEGORIES.find((c) => c.id === flags[selected])?.lesson}<br/><span class="c-mint">DEFENSIVE FIX · </span>${FLAG_CATEGORIES.find((c) => c.id === flags[selected])?.fix}</p>`
                  : ""
              }
              ${selLine?.neutralNote ? `<p class="flag-neutral">No finding required here — ${selLine.neutralNote}</p>` : ""}
            </div>`
          : `<p class="microlbl">SELECT A LINE TO FLAG IT (OR CLEAR IT)</p>`
      }
    </div>`;
}

function LayerXray(o) {
  const env = Lab.state.env;
  const isHard = o.id === "OBJ-H3";
  const inspect = ui.xrayInspect;

  return `
    <div class="col-gap">
      <div class="tool-row">
        <span class="pill pill-outline mono-tiny">LAYER X-RAY · ${XRAY_IMAGE}</span>
        <span class="microlbl">${XRAY_LAYERS.length} LAYERS · PUBLISHED TO REGISTRY</span>
      </div>

      <div class="xray-col" aria-label="Image layers, first applied at the bottom">
        ${XRAY_LAYERS.map((l) => {
          const state = env.xrayLayer === l.idx ? "xray-sel" : inspect === l.idx ? "xray-inspect" : "xray-idle";
          return `<button type="button" data-act="xray-inspect" data-idx="${l.idx}" aria-expanded="${inspect === l.idx}" class="xray-row ${state}">
            <span class="code-num">L${l.idx}</span>
            <span class="xray-main"><span class="xray-title">${l.title}</span><span class="xray-size">${l.size}</span></span>
            ${icon("scan-search", "ic ic-14 xray-scan")}
          </button>`;
        }).join("")}
      </div>

      ${
        inspect !== null
          ? `<div class="flag-panel"><p class="kick kick-amber">LAYER ${inspect} CONTENTS</p><pre class="xray-pre">${esc(XRAY_LAYERS[inspect - 1].detail)}</pre></div>`
          : `<p class="microlbl">CLICK A LAYER TO INSPECT ITS CONTENTS</p>`
      }

      <div class="grid-2">
        <div>
          <p class="fld-label">WHICH LAYER STILL HOLDS A CREDENTIAL?</p>
          <div class="layer-pick" role="group" aria-label="Choose layer">
            ${XRAY_LAYERS.map((l) => {
              const on = env.xrayLayer === l.idx;
              return `<button type="button" data-act="xray-set" data-field="xrayLayer" data-val="${l.idx}" aria-pressed="${on}" class="layer-btn ${on ? "layer-btn-on" : ""}">L${l.idx}</button>`;
            }).join("")}
          </div>
        </div>
        ${RadioChoices("WHAT DOES IT HOLD?", env.xraySecret, "xray-set", XRAY_SECRET_OPTIONS, { field: "xraySecret" })}
        ${isHard ? RadioChoices("WHY DID THE rm NOT REMOVE IT?", env.xrayWhy, "xray-set", XRAY_WHY_OPTIONS, { field: "xrayWhy" }) : ""}
        ${isHard ? RadioChoices("WHICH RESPONSE ACTUALLY FIXES THE RISK?", env.xrayFix, "xray-set", XRAY_FIX_OPTIONS, { field: "xrayFix" }) : ""}
      </div>
    </div>`;
}

function TokenRemediation(o) {
  const st = Lab.state;
  const selected = st.env.tokenRemediation;
  const passed = !!st.objectives[o.id]?.done;
  const showWhy = !!passed;
  return `
    <div class="col-gap">
      <p class="widget-intro">The npm token you recovered from the X-ray is baked into <span class="mono c-danger">three published tags</span> of freight-portal. Select the <span class="c-text">three</span> response actions that actually close this incident.</p>
      <div class="grid-2">
        ${TOKEN_OPTIONS.map((opt) => {
          const on = selected.includes(opt.id);
          return `<button type="button" data-act="token-toggle" data-id="${opt.id}" aria-pressed="${on}" class="check-card ${on ? "check-on" : ""}">
            <span class="checkbox ${on ? "checkbox-on" : ""}" aria-hidden="true"></span>
            <span class="check-main">
              <span class="check-label ${on ? "c-text" : "c-dim"}">${opt.label}</span>
              ${showWhy ? `<span class="check-why">${opt.why}</span>` : ""}
            </span>
          </button>`;
        }).join("")}
      </div>
      ${
        !passed
          ? `<p class="microlbl">SELECT ${selected.length}/3 — THE WHY FOR EACH ACTION IS REVEALED AFTER A PASSING CHECK.</p>`
          : `<p class="microlbl">${selected.length}/3 SELECTED</p>`
      }
    </div>`;
}

function DryDock() {
  const objectives = Lab.objectives();
  const m3 = objectives.find((o) => o.id === "OBJ-M3");
  const m4 = objectives.find((o) => o.id === "OBJ-M4");
  const m11 = objectives.find((o) => o.id === "OBJ-M11");
  const h2 = objectives.find((o) => o.id === "OBJ-H2");
  const h3 = objectives.find((o) => o.id === "OBJ-H3");

  return `
    <main class="zone-main water max-w-5xl">
      ${ZoneHeader("drydock")}
      <div class="note-row">${SimulatorNote("DOCKERFILE &amp; LAYERS ARE FICTIONAL TRAINING ARTIFACTS")}</div>
      <div class="stack">
        ${m3 ? `<div class="stack-item">${ObjectivePanel(m3, DockerfileInspector(m3))}</div>` : ""}
        ${h2 ? `<div class="stack-item">${ObjectivePanel(h2, DockerfileInspector(h2))}</div>` : ""}
        ${m4 || h3 ? `<div class="stack-item">${ObjectivePanel(h3 ?? m4, LayerXray(h3 ?? m4))}</div>` : ""}
        ${m11 ? `<div class="stack-item">${ObjectivePanel(m11, TokenRemediation(m11))}</div>` : ""}
      </div>
      <div class="h-6"></div>
    </main>`;
}

/* ---------------------------------- customs gate ---------------------------------- */

const SEAL_META = {
  verified: { label: "SEAL VERIFIED", cls: "seal seal-verified" },
  official: { label: "OFFICIAL LIBRARY", cls: "seal seal-official" },
  none: { label: "NO SEAL", cls: "seal seal-none" },
};

function RegistryAdjudicator(o) {
  const env = Lab.state.env;
  const isHard = o.id === "OBJ-H4";
  return `
    <div class="col-gap">
      <p class="widget-intro">order-api must reach production tonight. Stamp every candidate <span class="c-mint">APPROVE</span> or <span class="c-danger">REJECT</span>. Check all four seals: publisher · signature · immutability · scan.</p>
      <div class="col-gap-sm" role="group" aria-label="Registry candidates">
        ${REGISTRY_IMAGES.map((img) => {
          const verdict = env.registryVerdicts[img.id] ?? null;
          const scanCls = img.scan.startsWith("0 ") ? "c-mint" : img.scan === "clean" ? "c-mint" : "c-danger";
          return `<div class="reg-card ${verdict === "approve" ? "reg-approve" : verdict === "reject" ? "reg-reject" : ""}">
            <div class="reg-head">
              <span class="code-num">${img.id}</span>
              <code class="reg-ref">${img.reference}</code>
              <span class="${SEAL_META[img.seal].cls}">${SEAL_META[img.seal].label}</span>
            </div>
            <dl class="reg-dl">
              <div class="reg-kv"><dt class="reg-k">PUBLISHER</dt><dd class="reg-v">${img.publisher}</dd></div>
              <div class="reg-kv"><dt class="reg-k">REF TYPE</dt><dd class="reg-v ${img.pinned === "digest" ? "c-mint" : "c-amber"}">${img.pinned === "digest" ? "DIGEST (IMMUTABLE)" : "TAG (MUTABLE)"}</dd></div>
              <div class="reg-kv"><dt class="reg-k">SCAN</dt><dd class="reg-v ${scanCls}">${img.scan}</dd></div>
              <div class="reg-kv"><dt class="reg-k">NOTES</dt><dd class="reg-v">${img.blurb}</dd></div>
            </dl>
            <div class="stamp-row">
              <button type="button" data-act="registry-stamp" data-id="${img.id}" data-verdict="approve" aria-pressed="${verdict === "approve"}" class="stamp ${verdict === "approve" ? "stamp-approve-on" : "stamp-approve"}">${icon("check-check", "ic ic-14")} APPROVE</button>
              <button type="button" data-act="registry-stamp" data-id="${img.id}" data-verdict="reject" aria-pressed="${verdict === "reject"}" class="stamp ${verdict === "reject" ? "stamp-reject-on" : "stamp-reject"}">${icon("ban", "ic ic-14")} REJECT</button>
            </div>
          </div>`;
        }).join("")}
      </div>

      ${
        isHard
          ? `<div class="hard-panel">
              <div>
                <p class="kick kick-amber sp-b">FILE THE APPROVAL — TAG ALL REASONS FOR APPROVING R1</p>
                <div class="chip-row">
                  ${REGISTRY_JUSTIFY_TAGS.map((t) => {
                    const on = env.registryTags.includes(t.id);
                    return `<button type="button" data-act="registry-tag" data-id="${t.id}" aria-pressed="${on}" class="chip ${on ? "chip-mint-on" : "chip-mint"}">${t.label}</button>`;
                  }).join("")}
                </div>
              </div>
              <div>
                <p class="kick kick-amber sp-b">WRITE THE R4 REJECTION — WHY DOES AN INTERNAL, SIGNED IMAGE STILL FAIL?</p>
                <div class="radio-col" role="radiogroup" aria-label="R4 rejection reason">
                  ${REGISTRY_REJECT_REASON_OPTIONS.map((opt) => {
                    const on = env.registryRejectReason === opt.id;
                    return `<button type="button" role="radio" aria-checked="${on}" data-act="reject-reason" data-val="${opt.id}" class="radio-card ${on ? "radio-on" : ""}"><span class="radio-dot ${on ? "radio-dot-on" : ""}" aria-hidden="true"></span>${opt.label}</button>`;
                  }).join("")}
                </div>
              </div>
            </div>`
          : ""
      }
    </div>`;
}

function CustomsGate() {
  const objectives = Lab.objectives();
  const m5 = objectives.find((o) => o.id === "OBJ-M5");
  const h4 = objectives.find((o) => o.id === "OBJ-H4");
  const obj = h4 ?? m5;
  return `
    <main class="zone-main water max-w-4xl">
      ${ZoneHeader("gate")}
      <div class="note-row flex-wrap">
        ${SimulatorNote("REGISTRY METADATA IS SYNTHETIC")}
        <span class="pill pill-outline mono-tiny">${icon("shield-check", "ic ic-12")} SEAL = SIGNATURE · ${icon("shield-x", "ic ic-12")} NO SEAL = UNSIGNED</span>
      </div>
      <div class="stack">
        ${
          obj
            ? `<div class="stack-item">${ObjectivePanel(obj, RegistryAdjudicator(obj))}</div>`
            : ""
        }
        <div class="refresher">
          <h3 class="kc-h">HOW CUSTOMS WORKS (60-SECOND REFRESHER)</h3>
          <ul class="refresh-list">
            <li>· <span class="c-text">Signature (seal)</span> — proves who built the image and that its bytes were not altered (Sigstore/Cosign class).</li>
            <li>· <span class="c-text">Digest pinning</span> — @sha256:… is an immutable cargo ID; tags can be re-pointed, digests cannot.</li>
            <li>· <span class="c-text">Scan report</span> — static CVE check against the SBOM. Signed ≠ safe: R4 is signed and still red.</li>
            <li>· <span class="c-text">Publisher trust</span> — official libraries and your own registry vs. lookalike accounts on public registries.</li>
          </ul>
          <a href="https://attack.mitre.org/techniques/T1612/" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm ext-link">SEE MITRE T1612 — BUILD IMAGE ON HOST (NEW TAB)</a>
        </div>
      </div>
      <div class="h-6"></div>
    </main>`;
}

/* ---------------------------------- the berths ---------------------------------- */

const BERTH_TABS = [
  { id: "berths", label: "BERTHS" },
  { id: "feed", label: "RUNTIME FEED" },
  { id: "mitre", label: "MITRE BOARD" },
  { id: "podspec", label: "POD SPEC" },
  { id: "board", label: "CONTROL BOARD" },
];

const STATUS_OPTS = [
  { id: "critical", label: "CRITICAL", cls: "statusbtn-critical" },
  { id: "atrisk", label: "AT-RISK", cls: "statusbtn-atrisk" },
  { id: "secure", label: "SECURE", cls: "statusbtn-secure" },
];

const BERTH_NUM = { "payments-svc": "01", "metrics-agent": "02", "report-runner": "03", "geo-worker": "04" };

function BerthAudit(o) {
  const env = Lab.state.env;
  const isHard = o.id === "OBJ-H5";
  const openId = ui.berthOpenId;
  return `
    <div class="col-gap">
      <p class="widget-intro">Four workloads at the berths. ${isHard ? "Classify every one and tag every escape path you can name." : "Find the two that could hand an attacker the node, class them CRITICAL, and tag what makes them dangerous."}</p>
      <div class="col-gap-sm" aria-label="Running containers">
        ${BERTH_CONTAINERS.map((c) => {
          const status = env.berthStatus[c.id] ?? null;
          const open = openId === c.id;
          const borderCls = status === "critical" ? "berth-critical" : status === "atrisk" ? "berth-atrisk" : status === "secure" ? "berth-secure" : "";
          const chipCls = status === "critical" ? "seal seal-none" : status === "atrisk" ? "seal seal-amber" : "seal seal-verified";
          return `<div class="berth ${borderCls}">
            <button type="button" data-act="berth-open" data-id="${c.id}" aria-expanded="${open}" class="berth-head">
              <span class="microlbl">BERTH ${BERTH_NUM[c.id]}</span>
              <span class="berth-name">${c.name}</span>
              <span class="pill pill-outline mono-tiny">${c.image}</span>
              <span class="berth-up">UP ${c.uptime}</span>
              ${status ? `<span class="${chipCls}">${STATUS_OPTS.find((s) => s.id === status)?.label}</span>` : ""}
            </button>
            ${
              open
                ? `<div class="berth-body">
                    <dl class="berth-dl" aria-label="${c.name} configuration">
                      ${c.config.map((row) => `<div class="berth-kv"><dt class="reg-k">${row.k.toUpperCase()}</dt><dd class="berth-v ${row.bad ? "c-danger" : "c-dim"}">${row.v}</dd></div>`).join("")}
                    </dl>
                    ${
                      status
                        ? `<p class="berth-verdict">${c.verdict}</p>`
                        : `<p class="berth-verdict berth-verdict-wait">CLASS THIS WORKLOAD TO SEE THE HARBORMASTER'S ANALYSIS.</p>`
                    }
                    <div class="chip-row" role="group" aria-label="Class ${c.name}">
                      ${STATUS_OPTS.map((s) => {
                        const on = status === s.id;
                        return `<button type="button" data-act="berth-class" data-id="${c.id}" data-status="${s.id}" aria-pressed="${on}" class="chip ${on ? `${s.cls}` : "chip-plain"}">${s.label}</button>`;
                      }).join("")}
                    </div>
                  </div>`
                : ""
            }
          </div>`;
        }).join("")}
      </div>
      <div>
        <p class="fld-label">TAG THE ESCAPE PATHS YOU FOUND (SELECT ALL THAT APPLY)</p>
        <div class="chip-row">
          ${BERTH_TAG_POOL.map((t) => {
            const on = env.berthTags.includes(t.id);
            return `<button type="button" data-act="berth-tag" data-id="${t.id}" aria-pressed="${on}" class="chip ${on ? "chip-danger-on" : "chip-danger"}">${t.label}</button>`;
          }).join("")}
        </div>
      </div>
    </div>`;
}

function EventFeed(o, showChain, showRationale) {
  const st = Lab.state;
  const env = st.env;
  const stamped = FEED_EVENTS.filter((e) => env.eventVerdicts[e.id]).length;
  const threats = FEED_EVENTS.filter((e) => e.verdict === "threat");
  const chainValue = env.attackChain;
  const remainingChain = threats.filter((e) => !chainValue.includes(e.id));

  return `
    <div class="col-gap">
      <div class="tool-row">
        <span class="pill pill-outline mono-tiny">NIGHT SHIFT 01:15–02:00 · SENSOR + AUDIT + EGRESS</span>
        <span class="microlbl">${stamped}/${FEED_EVENTS.length} STAMPED</span>
      </div>

      <div role="log" aria-live="polite" aria-label="Runtime security event feed" class="feed">
        ${FEED_EVENTS.map((e) => {
          const v = env.eventVerdicts[e.id] ?? null;
          return `<div class="feed-event ${v === "threat" ? "feed-threat" : v === "clear" ? "feed-clear" : ""}">
            <div class="feed-head">
              <span class="code-num">${e.time}</span>
              <span class="feed-source">${e.source}</span>
              ${v ? `<span class="seal ${v === "threat" ? "seal-none" : "seal-verified"} feed-chip">${v.toUpperCase()}</span>` : ""}
            </div>
            <p class="feed-text">${e.text}</p>
            <p class="feed-meta">${e.meta}</p>
            <div class="stamp-row">
              ${["threat", "clear"].map((opt) => {
                const on = v === opt;
                return `<button type="button" data-act="event-stamp" data-id="${e.id}" data-verdict="${opt}" aria-pressed="${on}" aria-label="Stamp event ${e.id} as ${opt}" class="stamp ${on ? (opt === "threat" ? "stamp-reject-on" : "stamp-approve-on") : "stamp-neutral"}">${opt === "threat" ? "⚑ THREAT" : "✓ CLEAR"}</button>`;
              }).join("")}
            </div>
          </div>`;
        }).join("")}
      </div>

      ${
        showChain
          ? `<div>
              <p class="part-label c-amber">RECONSTRUCT THE ATTACK — ORDER THE ${threats.length} HOSTILE MOVES AS THEY HAPPENED</p>
              <div class="chip-row" aria-label="Hostile events pool">
                ${remainingChain.map((e) => `<button type="button" data-act="seq-add" data-path="attackChain" data-id="${e.id}" class="seq-chip">${e.id} · ${e.source.split("· ")[1] ?? e.source}</button>`).join("")}
                ${remainingChain.length === 0 ? `<span class="seq-done-inline">ALL ORDERED — CHECK RESULTS</span>` : ""}
              </div>
              ${
                chainValue.length > 0
                  ? `<ol class="seq-list" aria-label="Attack chain order">
                      ${chainValue
                        .map((id, i) => {
                          const e = FEED_EVENTS.find((x) => x.id === id);
                          return `<li class="seq-item"><span class="seq-num">${i + 1}.</span><span class="seq-label-sm">${e.time} — ${e.text.slice(0, 72)}</span><button type="button" data-act="seq-remove" data-path="attackChain" data-pos="${i}" aria-label="Remove position ${i + 1}" class="xbtn">×</button></li>`;
                        })
                        .join("")}
                    </ol>`
                  : ""
              }
            </div>`
          : ""
      }

      ${showRationale ? BenignRationale() : ""}
    </div>`;
}

function BenignRationale() {
  const env = Lab.state.env;
  const benign = FEED_EVENTS.filter((e) => e.verdict === "clear");
  return `
    <div class="col-gap-sm">
      <p class="part-label c-amber">CLOSE THE FALSE POSITIVES — PICK EACH CLEAR'S ALIBI</p>
      ${benign.map((e) => {
        const val = env.benignReasons[e.id] ?? "";
        // R6: selectable options are shuffled (deterministically) so the
        // correct alibi never sits in the same position for every row.
        const shuffled = seededShuffle(BENIGN_REASON_OPTIONS, `alibi-${e.id}`);
        return `<div class="alibi-card">
          <p class="code-num-inline">${e.id} · ${e.text.slice(0, 60)}</p>
          <div class="radio-col" role="radiogroup" aria-label="Why is ${e.id} benign">
            ${shuffled
              .map((opt) => {
                const on = val === opt.id;
                return `<button type="button" role="radio" aria-checked="${on}" data-act="alibi" data-eid="${e.id}" data-val="${opt.id}" class="radio-card ${on ? "radio-card-mint" : ""}"><span class="radio-dot radio-dot-mint ${on ? "radio-dot-on" : ""}" aria-hidden="true"></span>${opt.label}</button>`;
              })
              .join("")}
          </div>
        </div>`;
      }).join("")}
    </div>`;
}

function MitreBoard(o, showMitre, showSources) {
  const env = Lab.state.env;
  const isHard = o.id === "OBJ-H7";
  const mapped = MITRE_SNIPPETS.filter((s) => env.mitreMap[s.id]).length;
  return `
    <div class="col-gap">
      ${
        showMitre
          ? `<div class="col-gap">
              <p class="widget-intro">Name the technique behind each snippet. These IDs match the official MITRE ATT&amp;CK container techniques — the same cards an analyst pins above their desk.</p>
              <div class="col-gap-sm">
                ${MITRE_SNIPPETS.map((s) => {
                  const val = env.mitreMap[s.id] ?? "";
                  const isRequired = isHard || ["T1613", "T1610", "T1053.007", "T1611"].includes(s.answer);
                  return `<div class="snip-card">
                    <div class="snip-head">
                      <span class="code-num">${s.id}</span>
                      <p class="snip-text">${s.text}</p>
                      ${!isRequired ? `<span class="bonus">BONUS</span>` : ""}
                    </div>
                    <div class="chip-row" role="radiogroup" aria-label="Technique for ${s.id}">
                      ${MITRE_TECHNIQUES.map((t) => {
                        const on = val === t.id;
                        return `<button type="button" data-act="mitre-map" data-sid="${s.id}" data-tid="${t.id}" aria-pressed="${on}" class="chip ${on ? "chip-mint-on" : "chip-mint"}">${t.id}</button>`;
                      }).join("")}
                    </div>
                  </div>`;
                }).join("")}
              </div>
              <p class="microlbl">${mapped}/${MITRE_SNIPPETS.length} MAPPED · ${MITRE_TECHNIQUES.length} CARDS ON THE WALL</p>
            </div>`
          : ""
      }
      ${
        showSources
          ? `<div class="hard-panel">
              <p class="kick kick-amber sp-b">DETECTION ENGINEERING — WHICH SOURCE ANSWERS EACH QUESTION?</p>
              <div class="col-gap-sm">
                ${DATASOURCE_ROWS.map((r, ri) => {
                  const val = env.datasourceMatch[r.id] ?? "";
                  // R4: per-row scattered rotation — correct source never in a predictable
                  // slot (offsets avoid any linear diagonal across the three rows).
                  const SOURCE_OFFSETS = [0, 2, 1];
                  const options = rotate(DATASOURCE_OPTIONS, SOURCE_OFFSETS[ri % SOURCE_OFFSETS.length]);
                  return `<div class="ds-row">
                    <p class="ds-q">${r.q}</p>
                    <div class="chip-row" role="radiogroup" aria-label="Data source for: ${r.q}">
                      ${options.map((opt) => {
                        const on = val === opt.id;
                        return `<button type="button" data-act="ds-match" data-rid="${r.id}" data-val="${opt.id}" aria-pressed="${on}" class="chip chip-sm ${on ? "chip-amber-on" : "chip-amber"}">${opt.label.toUpperCase()}</button>`;
                      }).join("")}
                    </div>
                  </div>`;
                }).join("")}
              </div>
            </div>`
          : ""
      }
    </div>`;
}

function PodSpec(o) {
  const env = Lab.state.env;
  const isHard = o.id === "OBJ-H8";
  const flagged = env.podFlags;
  const anyFlag = flagged.some((f) => POD_LINES.find((l) => l.id === f)?.flag);
  return `
    <div class="col-gap">
      <div class="tool-row">
        <span class="pill pill-outline mono-tiny">deployment.yaml · freight-prod · deploys tonight</span>
        <span class="microlbl">${flagged.length} FLAG${flagged.length === 1 ? "" : "S"}</span>
      </div>

      <div class="code-box code-box-pad" aria-label="Pod manifest lines">
        ${POD_LINES.map((l) => {
          const on = flagged.includes(l.id);
          return `<button type="button" data-act="pod-flag" data-id="${l.id}" ${l.flag ? "" : "disabled"} aria-pressed="${on}" class="pod-line ${l.flag ? "pod-flaggable" : "pod-static"} ${on ? "pod-on" : ""}">
            <span class="pod-check ${on ? "pod-check-on" : l.flag ? "pod-check-free" : "pod-check-none"}" aria-hidden="true"></span>
            <span class="pod-indent">${"  ".repeat(l.indent)}</span>
            <span class="pod-text ${on ? "c-danger" : "c-text"}">${l.text}</span>
            ${on && l.flag ? `<span class="code-cat">${l.flag.category}</span>` : ""}
          </button>`;
        }).join("")}
      </div>

      ${
        anyFlag
          ? `<div class="flag-panel">
              <p class="kick kick-amber">WHY YOUR FLAGS MATTER</p>
              <ul class="why-list">
                ${flagged
                  .map((f) => POD_LINES.find((l) => l.id === f)?.flag)
                  .filter((f) => !!f)
                  .map((f, i) => `<li class="why-li"><span class="mono c-danger">${f.category.toUpperCase()} · </span>${f.lesson} <span class="c-mint">FIX: ${f.fix}</span></li>`)
                  .join("")}
              </ul>
            </div>`
          : `<p class="microlbl">CLICK THE LINES THAT ASK FOR POWERS OR CARRY SECRETS</p>`
      }

      ${
        isHard
          ? `<div class="mint-panel">
              <p class="kick kick-mint sp-b">BUILD THE RESTRICTED-PSS PATCH — EVERY FIELD MUST BE EXACT</p>
              <div class="grid-2">
                ${POD_PATCH_FIELDS.map((f) => {
                  const val = env.podPatch[f.id] ?? "";
                  return `<div class="field-card">
                    <p class="fld-label">${f.label}</p>
                    <div class="chip-row" role="radiogroup" aria-label="${f.label}">
                      ${f.options.map((opt) => {
                        const on = val === opt;
                        return `<button type="button" data-act="pod-patch" data-field="${f.id}" data-val="${esc(opt)}" aria-pressed="${on}" class="chip ${on ? "chip-mint-on" : "chip-mint"}">${opt}</button>`;
                      }).join("")}
                    </div>
                  </div>`;
                }).join("")}
              </div>
            </div>`
          : ""
      }
    </div>`;
}

function ControlBoard(o) {
  const env = Lab.state.env;
  const isHard = o.id === "OBJ-H9";
  const onCount = BOARD_CONTROLS.filter((c) => env.boardState[c.id]).length;
  return `
    <div class="col-gap">
      <p class="widget-intro">${isHard ? "Set the board to the harbor's intended production state — nine on, two off — then sequence the rollout and map each risk to its primary control." : "Three risks are on the docket. Bring up the controls that answer each of them (preventive AND detective)."}</p>

      <div class="tool-row">
        <span class="pill pill-outline mono-tiny">CONTROL BOARD · ${onCount}/${BOARD_CONTROLS.length} ENGAGED</span>
        <button type="button" data-act="board-off" class="btn btn-outline btn-sm tool-row-end">ALL OFF</button>
      </div>

      <div class="grid-2" role="group" aria-label="Hardening controls">
        ${BOARD_CONTROLS.map((c) => {
          const on = !!env.boardState[c.id];
          return `<button type="button" data-act="board-toggle" data-id="${c.id}" aria-pressed="${on}" class="board-card ${on ? "board-on" : ""}">
            <span class="switch ${on ? "switch-on" : ""}" aria-hidden="true"><span class="switch-knob ${on ? "switch-knob-on" : ""}"></span></span>
            <span class="board-main">
              <span class="board-name ${on ? "c-text" : "c-dim"}">${c.name}</span>
              <span class="board-kind ${c.kind === "detect" ? "c-teal" : "c-amber"}">${c.kind === "detect" ? "DETECT" : "PREVENT"}</span>
              <span class="board-lesson">${c.lesson}</span>
            </span>
          </button>`;
        }).join("")}
      </div>

      ${
        isHard
          ? `<div class="hard-panel">
              <p class="kick kick-amber sp-b">MAP EACH RISK TO ITS PRIMARY CONTROL</p>
              <div class="col-gap-sm">
                ${BOARD_RISKS.map((r, ri) => {
                  const val = env.boardMapping[r.id] ?? "";
                  // R4/R6: per-row scattered rotation so the correct control never sits
                  // in a predictable slot (offsets chosen to avoid ANY linear diagonal).
                  const OPTION_OFFSETS = [4, 3, 2, 4, 2];
                  const options = rotate(
                    BOARD_CONTROLS.filter((c) => c.desiredOn !== false && c.id !== "readonly-rootfs" && c.id !== "registry-allowlist" && c.id !== "ci-scan" && c.id !== "runtime-sensor"),
                    OPTION_OFFSETS[ri % OPTION_OFFSETS.length],
                  );
                  return `<div class="ds-row">
                    <p class="ds-q">${r.label}</p>
                    <div class="chip-row" role="radiogroup" aria-label="Primary control for ${r.label}">
                      ${options.map((c) => {
                        const on = val === c.id;
                        return `<button type="button" data-act="risk-map" data-rid="${r.id}" data-cid="${c.id}" aria-pressed="${on}" class="chip chip-sm ${on ? "chip-amber-on" : "chip-amber"}">${c.name.split(" (")[0].toUpperCase()}</button>`;
                      }).join("")}
                    </div>
                  </div>`;
                }).join("")}
              </div>
            </div>

            <div>
              <p class="part-label c-amber">SEQUENCE THE ROLLOUT — INCIDENT RESPONSE TO STEADY STATE</p>
              <div class="chip-row" aria-label="Rollout steps pool">
                ${seededShuffle(ROLLOUT_STEPS.filter((s) => !env.rollout.includes(s.id)), "rollout-pool")
                  .map((s) => `<button type="button" data-act="seq-add" data-path="rollout" data-id="${s.id}" class="seq-chip seq-chip-wide">${s.label}</button>`)
                  .join("")}
              </div>
              ${
                env.rollout.length > 0
                  ? `<ol class="seq-list" aria-label="Rollout order">
                      ${env.rollout
                        .map((id, i) => {
                          const s = ROLLOUT_STEPS.find((x) => x.id === id);
                          return `<li class="seq-item seq-item-top"><span class="seq-num">${i + 1}.</span><span class="seq-main"><span class="seq-label">${s.label}</span><span class="seq-why">${s.why}</span></span><button type="button" data-act="seq-remove" data-path="rollout" data-pos="${i}" aria-label="Remove step ${i + 1}" class="xbtn">×</button></li>`;
                        })
                        .join("")}
                    </ol>`
                  : ""
              }
            </div>`
          : ""
      }
    </div>`;
}

function Berths() {
  const st = Lab.state;
  const objectives = Lab.objectives();
  const tab = st.berthTab ?? "berths";
  const find = (id) => objectives.find((o) => o.id === id);
  const m6 = find("OBJ-M6");
  const m7 = find("OBJ-M7");
  const m8 = find("OBJ-M8");
  const m9 = find("OBJ-M9");
  const m10 = find("OBJ-M10");
  const m12 = find("OBJ-M12");
  const h5 = find("OBJ-H5");
  const h6 = find("OBJ-H6");
  const h7 = find("OBJ-H7");
  const h8 = find("OBJ-H8");
  const h9 = find("OBJ-H9");
  const h10 = find("OBJ-H10");

  const tabPanel = (content) => `<div class="tabpanel" role="tabpanel">${content}</div>`;

  const panels = {
    berths: tabPanel(`${m6 ? ObjectivePanel(m6, BerthAudit(m6)) : ""}${h5 ? ObjectivePanel(h5, BerthAudit(h5)) : ""}`),
    feed: tabPanel(`${m7 ? ObjectivePanel(m7, EventFeed(m7, false, false)) : ""}${h6 ? ObjectivePanel(h6, EventFeed(h6, true, false)) : ""}${h10 ? ObjectivePanel(h10, EventFeed(h10, false, true)) : ""}`),
    mitre: tabPanel(`${m8 ? ObjectivePanel(m8, MitreBoard(m8, true, false)) : ""}${m12 ? ObjectivePanel(m12, MitreBoard(m12, false, true)) : ""}${h7 ? ObjectivePanel(h7, MitreBoard(h7, true, true)) : ""}`),
    podspec: tabPanel(`${m9 ? ObjectivePanel(m9, PodSpec(m9)) : ""}${h8 ? ObjectivePanel(h8, PodSpec(h8)) : ""}`),
    board: tabPanel(`${m10 ? ObjectivePanel(m10, ControlBoard(m10)) : ""}${h9 ? ObjectivePanel(h9, ControlBoard(h9)) : ""}`),
  };

  return `
    <main class="zone-main water max-w-5xl">
      ${ZoneHeader("berths")}
      <div class="note-row">${SimulatorNote("WORKLOADS · EVENTS · CREDS ARE FICTIONAL")}</div>

      <div class="tabs-wrap">
        <div class="tabs" role="tablist" aria-label="Berths console sections">
          ${BERTH_TABS.map((t) => `<button type="button" role="tab" aria-selected="${tab === t.id}" tabindex="${tab === t.id ? "0" : "-1"}" data-act="berth-tab" data-tab="${t.id}" class="tab ${tab === t.id ? "tab-active" : ""}">${t.label}</button>`).join("")}
        </div>
        ${panels[tab] || ""}
      </div>
      <div class="h-6"></div>
    </main>`;
}

/* ---------------------------------- quiz ---------------------------------- */

function QuizView() {
  const st = Lab.state;
  const mode = Lab.mode();
  const questions = quizFor(mode);
  const quiz = st.quiz[mode];
  const checkedCount = questions.filter((q) => quiz.checked[q.id]).length;
  const allChecked = checkedCount === questions.length;
  const score = quizScore();
  const firstUnchecked = firstUncheckedIndex(questions, quiz);

  return `
    <main class="zone-main water max-w-4xl">
      <button type="button" data-act="stage" data-stage="map" class="backlink">← RETURN TO HARBOR MAP</button>

      <div class="quiz-head">
        <div>
          <p class="kick kick-amber">STATION 2 — ASSESSMENT</p>
          <h2 class="zone-title">Customs Inspection</h2>
          <p class="zone-blurb">${mode === "hard" ? "Scenario triage: every item puts you back on the night shift. Check each answer to lock it in — explanations follow every check." : "Concept check for Lesson 4.3. Check each answer to lock it in — every item comes with an explanation, even when you are right."}</p>
        </div>
        <span class="pill pill-outline mono-tiny">${checkedCount}/${questions.length} CHECKED${allChecked ? ` · SCORE ${score}%` : ""}</span>
      </div>

      <ol class="quiz-list">
        ${questions
          .map((q, qi) => {
            const picked = quiz.answers[q.id];
            const isChecked = !!quiz.checked[q.id];
            const correct = isChecked && picked === q.answer;
            const unlocked = isQuestionUnlocked(qi, questions, quiz);
            const isNext = qi === firstUnchecked;
            const isLast = qi === questions.length - 1;
            return `<li class="qcard ${isChecked ? "" : isNext ? "qcard-next" : "qcard-locked"}" id="q-${q.id}">
              <p class="q-prompt"><span class="q-num">${qi + 1}.</span>${q.prompt}</p>
              ${!unlocked ? `<p class="microlbl">LOCKED — CHECK QUESTION ${qi} FIRST.</p>` : ""}
              <div class="radio-col" role="radiogroup" aria-label="${q.prompt}">
                ${q.options
                  .map((opt, oi) => {
                    const isPicked = picked === oi;
                    // R3: after validation, ONLY the picked option is colored — green if it
                    // was correct, red if it was wrong. The correct option is never
                    // highlighted green on a wrong submission.
                    let stateCls;
                    if (isChecked) {
                      if (isPicked) stateCls = correct ? "opt-correct-picked" : "opt-wrong-picked";
                      else stateCls = "opt-neutral";
                    } else {
                      stateCls = isPicked ? "opt-picked" : "opt-idle";
                    }
                    return `<button type="button" role="radio" aria-checked="${isPicked}" ${isChecked || !unlocked ? "disabled" : ""} data-act="quiz-answer" data-qid="${q.id}" data-idx="${oi}" class="opt ${stateCls} ${isChecked || !unlocked ? "opt-locked" : ""}">
                      ${
                        isChecked && isPicked
                          ? correct
                            ? icon("circle-check", "ic ic-16 c-mint")
                            : icon("circle-x", "ic ic-16 c-danger")
                          : `<span class="radio-dot ${isPicked && !isChecked ? "radio-dot-amber" : ""}" aria-hidden="true"></span>`
                      }
                      <span>${opt}${isChecked && isPicked ? `<span class="pick-tag ${correct ? "c-mint" : "c-danger"}">${correct ? "YOUR PICK — CORRECT" : "YOUR PICK — WRONG"}</span>` : ""}</span>
                    </button>`;
                  })
                  .join("")}
              </div>

              ${
                isChecked
                  ? `<div role="status" class="qfb ${correct ? "fb-pass" : "fb-fail"}">
                      <p class="qfb-title ${correct ? "c-mint" : "c-danger"}">${correct ? "CORRECT — WHY IT MATTERS" : "MISSED — WHY THE ANSWER WORKS"}</p>
                      <p class="fb-body">${q.explain}</p>
                      <p class="microlbl">STUDY AREA · ${q.topic.toUpperCase()}</p>
                    </div>`
                  : ""
              }

              ${
                !isChecked
                  ? `<div class="qcheck-row">
                      <button type="button" data-act="quiz-check" data-qid="${q.id}" ${picked === undefined || !unlocked ? "disabled" : ""} class="btn btn-amber" aria-label="Check answer for question ${qi + 1}">CHECK ANSWER</button>
                      ${picked === undefined ? `<span class="microlbl">SELECT AN OPTION TO ENABLE THE CHECK</span>` : ""}
                    </div>`
                  : `<div class="qcheck-row">
                      <button type="button" data-act="quiz-next" data-qi="${qi}" class="btn btn-outline-plain">${isLast ? "GO TO INSPECTION RESULT" : `NEXT QUESTION ${qi + 2} OF ${questions.length} →`}</button>
                    </div>`
              }
            </li>`;
          })
          .join("")}
      </ol>

      <div class="quiz-result" id="quiz-result">
        ${
          allChecked
            ? `<div role="status" class="result-chip ${score >= 80 ? "result-cleared" : "result-review"}">INSPECTION RESULT: ${score}% ${score >= 80 ? "— CLEARED" : "— REVIEW THE EXPLANATIONS ABOVE"}</div>
               <button type="button" data-act="quiz-retake" class="btn btn-outline btn-retake">${icon("rotate-ccw", "ic ic-16")} RETAKE INSPECTION</button>`
            : `<p class="microlbl">CHECK EACH ANSWER IN ORDER — THE INSPECTION RESULT APPEARS AFTER THE LAST ONE.</p>`
        }
      </div>
      <div class="h-6"></div>
    </main>`;
}

/* ---------------------------------- debrief ---------------------------------- */

function Debrief() {
  const mode = Lab.mode();
  return `
    <main class="zone-main water max-w-5xl">
      <button type="button" data-act="stage" data-stage="map" class="backlink">← RETURN TO HARBOR MAP</button>

      <div class="quiz-head">
        <p class="kick kick-amber">STATION 3 — SYNTHESIS</p>
        <h2 class="zone-title">Harbormaster's Report</h2>
        <p class="zone-blurb">Everything the ${mode === "hard" ? "night shift" : "cadet"} exercised, written into a field report: what to watch, what to enforce, and what to read next. Keep this open in a second monitor the first time you harden a real cluster.</p>
      </div>

      <section aria-label="Detection opportunities" class="debrief-sec">
        <h3 class="debrief-h c-mint">${icon("eye", "ic ic-16")} DETECTION OPPORTUNITIES — SOURCE → EXAMPLE LOGIC</h3>
        <div class="col-gap-sm">
          ${DEBRIEF.detections.map((d) => `<div class="det-row"><p class="det-source">${d.source.toUpperCase()}</p><code class="det-logic">${d.logic}</code></div>`).join("")}
        </div>
        <p class="det-note">Every one of last night's six hostile moves had a home in this table — the incident was detectable at 01:41, 33 minutes before the 02:14 shift-radio call asked questions.</p>
      </section>

      <section aria-label="Mitigation recommendations" class="debrief-sec">
        <h3 class="debrief-h c-danger">${icon("shield-check", "ic ic-16")} MITIGATION RECOMMENDATIONS — OFFICIAL MITRE IDS</h3>
        <div class="chip-row">
          ${DEBRIEF.mitigations.map((m) => `<span class="pill pill-outline mitigation"><span class="c-amber">${m.id}</span> ${m.name} — ${m.note}</span>`).join("")}
        </div>
      </section>

      <div class="debrief-grid">
        <section aria-label="Blue team takeaways" class="debrief-sec debrief-blue">
          <h3 class="debrief-h c-mint">${icon("book-marked", "ic ic-16")} BLUE-TEAM FIELD NOTES</h3>
          <ul class="takeaways">
            ${DEBRIEF.blue.map((t) => `<li class="takeaway"><span class="take-dot take-dot-mint" aria-hidden="true"></span>${t}</li>`).join("")}
          </ul>
        </section>
        <section aria-label="Red team mindset takeaways" class="debrief-sec debrief-red">
          <h3 class="debrief-h c-danger">${icon("swords", "ic ic-16")} RED-TEAM MINDSET (DEFENSIVE USE)</h3>
          <ul class="takeaways">
            ${DEBRIEF.red.map((t) => `<li class="takeaway"><span class="take-dot take-dot-danger" aria-hidden="true"></span>${t}</li>`).join("")}
          </ul>
          <p class="framing-note">Framing note: this lab explains tradecraft at the depth MITRE documents it so defenders can detect it. All artifacts are synthetic; nothing here is operational tooling.</p>
        </section>
      </div>

      <section aria-label="What to learn next" class="debrief-sec">
        <h3 class="debrief-h c-amber">WHAT TO LEARN NEXT</h3>
        <ul class="takeaways">
          ${DEBRIEF.next.map((t) => `<li class="takeaway"><span class="take-dot take-dot-amber" aria-hidden="true"></span>${t}</li>`).join("")}
        </ul>
      </section>

      <section aria-label="Official references" class="debrief-sec">
        <h3 class="debrief-h c-amber">${icon("anchor", "ic ic-16")} OFFICIAL REFERENCES (OPEN IN NEW TAB)</h3>
        <div class="chip-row">
          ${DEBRIEF.refs.map((r) => `<a href="${r.url}" target="_blank" rel="noopener noreferrer" class="btn btn-outline ref-link">${r.label} ↗</a>`).join("")}
        </div>
      </section>
      <div class="h-6"></div>
    </main>`;
}

/* ---------------------------------- completion modal ---------------------------------- */

function focusAreas() {
  const st = Lab.state;
  const objectives = Lab.objectives();
  const mode = Lab.mode();
  const quizState = st.quiz[mode];
  const bank = quizFor(mode);
  const areas = [];
  for (const o of objectives) {
    const s = st.objectives[o.id];
    if (s?.done && (s.attempts > 1 || s.hintsUsed > 0)) {
      const why = s.attempts > 1 ? `${s.attempts} checks` : "a hint";
      areas.push({
        headline: `${o.id} — ${o.title}`,
        action: `Needed ${why} before it passed. Re-run the drill in ${
          o.zone === "manual" ? "the Harbor Manual" : o.zone === "drydock" ? "the Dry Dock" : o.zone === "gate" ? "the Customs Gate" : "the Berths"
        } until the first check is the one that passes.`,
      });
    }
  }
  const pillarStats = ["P1", "P2", "P3", "P4"].map((p) => {
    const items = objectives.filter((o) => o.pillar === p && st.objectives[o.id]?.done);
    const firstTry = items.filter((o) => st.objectives[o.id]?.firstTry).length;
    return { pillar: p, total: items.length, firstTry };
  });
  const ranked = pillarStats.filter((p) => p.total > 0).sort((a, b) => a.firstTry / a.total - b.firstTry / b.total);
  const weakest = ranked[0];
  if (weakest && weakest.firstTry / weakest.total < 1) {
    areas.push({
      headline: `Pillar ${PILLAR_META[weakest.pillar].label} — lowest first-try rate (${weakest.firstTry}/${weakest.total} clean)`,
      action:
        weakest.pillar === "P1"
          ? "Re-read the Harbor Manual's what/why sections, then rebuild the lifecycle and isolation drills from memory."
          : weakest.pillar === "P2"
            ? "Walk the evidence again: Dockerfile flags, layer X-ray, registry seals and berth configs — name the flaw before opening any hint."
            : weakest.pillar === "P3"
              ? "Re-triage the runtime feed and data-source drill: identity, boundary-crossing and schedule separate noise from signal."
              : "Re-sequence the rollout drill and control board: contain → rotate → rebuild → enforce → harden → verify.",
    });
  }
  const missedTopics = [...new Set(quizState.missed)].map((qid) => bank.find((b) => b.id === qid)?.topic).filter((t) => !!t);
  for (const t of missedTopics) {
    areas.push({
      headline: `Quiz miss — ${t}`,
      action: "The inspection explanation for this item is worth a second read; the topic page listed above is the fastest refresher.",
    });
  }
  return areas;
}

function CompletionModal() {
  const st = Lab.state;
  const mode = Lab.mode();
  const objectives = Lab.objectives();
  const p = Lab.progress();
  const quiz = quizScore();

  const areas = focusAreas();
  const byPillar = ["P1", "P2", "P3", "P4"].map((pillar) => ({
    pillar,
    items: objectives
      .filter((o) => o.pillar === pillar)
      .map((o) => ({ id: o.id, title: o.title, done: !!st.objectives[o.id]?.done, firstTry: !!st.objectives[o.id]?.firstTry })),
  }));

  return `
    <div class="overlay" data-act="completion-close-overlay">
      <div class="dialog dialog-lg" role="dialog" aria-modal="true" aria-labelledby="completion-title" aria-describedby="completion-desc">
        <div class="dialog-head dialog-head-row">
          <div>
            <p id="completion-title" class="dialog-title dialog-title-row">${icon("anchor", "ic ic-20 c-mint")} DEPARTURE CLEARANCE — HARBOR-7</p>
            <p id="completion-desc" class="dialog-desc">Every objective checked, inspection submitted. The harbor is hardened, and the next incident would meet a different defense.</p>
          </div>
          <button type="button" data-act="completion-close" class="overlay-close">${icon("x", "ic ic-20")}<span class="sr-only">Close</span></button>
        </div>

        <div class="dialog-scroll">
          <div class="dialog-body">
            <div class="rating-box">
              <div class="rating-main">
                <span class="kick kick-amber">FINAL RATING — ${mode.toUpperCase()} SHIFT</span>
                <span class="rating-stars">${p.stars}/5 STARS</span>
                <span class="microlbl2">${p.done}/${p.total} OBJECTIVES · FIRST-TRY ${objectives.filter((o) => st.objectives[o.id]?.firstTry).length} · HINTS ${p.hints} · QUIZ ${quiz}%</span>
              </div>
              <div class="rating-side">${icon("award", "ic ic-40 c-amber")}${Stars(p.stars, 22)}</div>
            </div>

            <div>
              <p class="focus-h">${icon("crosshair", "ic ic-16 c-danger")} FOCUS AREAS FOR YOUR NEXT SHIFT</p>
              ${
                areas.length === 0
                  ? `<p class="clean-sweep">Clean sweep — every objective passed first try, no hints, no quiz misses recorded. The evidence says push into the other shift and the official references below.</p>`
                  : `<p class="focus-p">Derived from your own run: objectives that needed retries or hints, your weakest pillar, and the inspection items you missed.</p>
                     <ul class="focus-list">
                       ${areas.map((f) => `<li class="focus-item"><p class="focus-headline">${f.headline}</p><p class="focus-action">${f.action}</p></li>`).join("")}
                     </ul>`
              }
            </div>

            <div>
              <p class="focus-h">MASTERY RECAP — BY PILLAR</p>
              <div class="col-gap-sm">
                ${byPillar
                  .map(({ pillar, items }) => {
                    const m = PILLAR_META[pillar];
                    return `<div class="pillar-box">
                      <p class="pillar-label ${m.color}">${m.icon} ${PILLAR_LABEL[pillar]}</p>
                      <ul class="pillar-list">
                        ${items
                          .map(
                            (it) => `<li class="pillar-item"><span class="${it.done ? "c-mint" : "c-faint"}">${it.done ? "✔" : "—"}</span><span class="c-faint">${it.id}</span><span class="pillar-item-title ${it.done ? "c-dim" : "c-faint-line"}">${it.title}</span>${it.done && it.firstTry ? `<span class="c-amber" title="Passed on first attempt">★</span>` : ""}</li>`,
                          )
                          .join("")}
                      </ul>
                    </div>`;
                  })
                  .join("")}
              </div>
            </div>

            <div class="keepgoing">
              <p class="kick kick-amber sp-b">KEEP GOING</p>
              <ul class="keep-list">
                <li>· Re-run the <span class="c-text">other shift</span> — Hard mode re-tests the same harbor with stricter evidence and sequencing.</li>
                <li>· Read the <span class="c-text">Harbormaster's Report</span> again before your next cluster audit; the detection table is your starter kit.</li>
                <li>· Chase the official references (MITRE ATT&amp;CK container techniques, NIST SP 800-190, CIS benchmarks) from the report.</li>
                <li>· Next lesson: CV0-004 compliance standards &amp; security controls — map today's controls to CIS Docker/Kubernetes.</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="dialog-foot dialog-foot-between">
          <button type="button" data-act="completion-reset" class="btn btn-outline btn-completion-reset">RESET &amp; RUN AGAIN</button>
          <button type="button" data-act="completion-close" class="btn btn-mint">KEEP EXPLORING THE HARBOR</button>
        </div>
      </div>
    </div>`;
}

/* ---------------------------------- master render ---------------------------------- */

function renderApp() {
  const st = Lab.state;

  if (!Lab.hydrated) return Splash();
  if (st.stage === "intro") return Intro();
  if (st.stage === "briefing") return Briefing();
  if (st.stage === "mode") return ModeSelect();

  let screen;
  if (st.stage === "quiz") screen = QuizView();
  else if (st.stage === "debrief") screen = Debrief();
  else if (st.zone === "manual") screen = KnowledgeCore();
  else if (st.zone === "drydock") screen = DryDock();
  else if (st.zone === "gate") screen = CustomsGate();
  else if (st.zone === "berths") screen = Berths();
  else screen = HarborMap();

  let overlays = "";
  if (ui.manifestOpen) overlays += ManifestSheet();
  if (ui.resetOpen) overlays += ResetDialog();
  if (ui.completionOpen) overlays += CompletionModal();

  return `${StatusStrip()}<div class="lab-body"><div class="lab-content">${screen}</div>${ManifestRail()}</div>${overlays}`;
}
