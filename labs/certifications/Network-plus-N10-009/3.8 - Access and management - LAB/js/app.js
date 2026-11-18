// ─────────────────────────────────────────────────────────────────────────────
// app.js — NOC ACCESS PATCHBAY static lab: rendering + interactions.
// 1:1 port of the original React components (LabRoot, ModeSelect, PatchBay,
// VpnChannel, SshChannel, GuiApiChannel, ConsoleChannel, BenchChannel, Ledger,
// EvidenceDrawer/Logs/Docs, QuizModal, CompletionModal).
//
// Architecture (classic scripts, no framework, no build):
//   • Store (state.js) is the single source of truth, with pub/sub "regions":
//     each UI region subscribes to state keys and re-renders on change — the
//     static equivalent of React's useLab(selector) subscriptions.
//   • All HTML is built from template strings; event handling uses one global
//     delegated listener set (data-act / data-change / data-input), so rebuilt
//     DOM never needs re-binding.
//   • Local React useState equivalents live in module vars, reset when their
//     React component would unmount (bay switch / tab switch / dialog close).
//   • Focus is preserved across rebuilds via data-fid + Store.notify.
// ═══════════════════════════════════════════════════════════════════════════

/* global Store, esc, I, SectionLabel, Led, PillarChip, ConsolePanel, AnswerField,
   Toggle, HintBox, VerdictLine, Ring, Stars, bindAnswers,
   ORG, CHANNEL_META, DEVICES, RUNNING_CONFIG, API_ENDPOINTS, API_TOKEN,
   ACCESS_LOG, JUDGE_EVENTS, VPN_SESSIONS, API_AUDIT, SSH_NEGOTIATION,
   TOPOLOGY_DOC, API_README, INCIDENT_BRIEF, GLOSSARY, MANUAL, FIELD_NOTES,
   MATRIX_METHODS, MATRIX_TASKS, RECOVERY_STEPS, REACH_OPTIONS, DETECT_OPTIONS,
   H6_PERSONAS, H6_METHODS, H6_CONTROLS,
   QUIZ_MEDIUM, QUIZ_HARD, OBJECTIVES, objectivesFor, metricsFor, quizScore */

const BAY_ORDER = ["vpn", "ssh", "gui", "api", "console", "bench"];

// ── module-local UI state (React useState equivalents) ──────────────────────
let sshLines = [];        // SshChannel useState lines — lost on bay switch (React parity)
let sshUnreachable = false;
let guiHttp = false;      // GuiChannel http toggle — session-local experiment (not persisted, by design)
let vpnPulse = null;      // VpnChannel pulse animation state
let quizIdx = 0;          // QuizModal question index — resets on open (React unmount)
let prevQuizOpen = false;
let evidenceTab = "logs"; // EvidenceDrawer tab — resets when leaving the lab
let shufSeed = 0;         // RecoveryPanel shuffle seed — resets when the panel unmounts
let resetOpen = false;    // AlertDialog open state
let lastPhase = null;
let wsBay = null;
let armed = false;        // auto-debrief transition detector armed after hydration
let prevAllDone = null;

const $app = () => document.getElementById("app");
const slot = (id) => document.getElementById(id);

// ═════════════════════════════════════════════════════════════════════════════
// ROOT — phase router (LabRoot)
// ═════════════════════════════════════════════════════════════════════════════
function renderRoot() {
  const s = Store.s;
  if (lastPhase !== s.phase) {
    // React unmount equivalents: leaving the lab drops every local state.
    resetOpen = false;
    evidenceTab = "logs";
    shufSeed = 0;
    quizIdx = 0;
    wsBay = null;
    sshLines = [];
    sshUnreachable = false;
    guiHttp = false;
    vpnPulse = null;
    lastPhase = s.phase;
  }
  const app = $app();
  if (s.phase === "intro" || !s.mode) {
    app.innerHTML = modeSelectHTML();
  } else if (s.phase === "briefing") {
    app.innerHTML = briefingHTML();
  } else {
    app.innerHTML = labFrameHTML();
    renderStatusBar();
    renderBay();
    renderWs();
    renderLedger();
    renderEvidence();
  }
  renderQuiz();
  renderReport();
  renderReset();
  bindAnswers(app);
}

// ═════════════════════════════════════════════════════════════════════════════
// Mode select + briefing (ModeSelect.tsx)
// ═════════════════════════════════════════════════════════════════════════════
function modeSelectHTML() {
  return `<div class="cl-root cl-grid fullscreen">
  <div class="mode-wrap anim-rise-slow">
    <div class="mode-brand">
      <div class="brand-badge">${I("Radio", "ic-4", "color:#FFB224")}<span>${ORG.name}</span></div>
      <h1 class="cl-mono cl-flicker mode-title">NOC Access Patchbay</h1>
      <p class="mode-sub">${ORG.lab}</p>
      <p class="mode-desc">An interactive training lab for <span class="ink">${ORG.cert}</span>.
        Learn the five ways into a network — and how attackers use the same doors.</p>
      <p class="synthetic-tag">${I("ShieldCheck", "ic-3", "color:#8fa096")} synthetic training environment — all hosts, logs and credentials are fictional</p>
    </div>
    <div class="mode-cards" role="group" aria-label="Choose difficulty mode">
      <button type="button" class="cl-focus mode-card med" data-act="choose-mode" data-val="medium" data-fid="mode-medium">
        <div class="mode-card-top">
          ${SectionLabel("onboarding · guided", "#4ADE80")}
          ${I("CloudSun", "ic-5", "color:#4ADE80")}
        </div>
        <h2>Standard Shift</h2>
        <p class="mode-band med">medium · 12 objectives · bloom: understand / apply</p>
        <ul>
          <li>· Day shift at the NOC: learn each access channel by using it.</li>
          <li>· Objectives arrive in order with “where to look” pointers.</li>
          <li>· Three-tier hints, free — hints cost star rating, never progress.</li>
          <li>· Wrap-up concept quiz with explanations after every answer.</li>
        </ul>
        <span class="mode-cta med">clock in ${I("ArrowRight", "ic-4")}</span>
      </button>
      <button type="button" class="cl-focus mode-card hard" data-act="choose-mode" data-val="hard" data-fid="mode-hard">
        <div class="mode-card-top">
          ${SectionLabel("incident · discovery", "#FF7A45")}
          ${I("CloudLightning", "ic-5", "color:#FF7A45")}
        </div>
        <h2>Storm Watch</h2>
        <p class="mode-band hard">hard · 9 deep challenges · bloom: analyze / evaluate / create</p>
        <ul>
          <li>· 22:47, storm inbound: the WAN dies mid-shift — no guided order.</li>
          <li>· Noisy evidence with red herrings; exact values required.</li>
          <li>· One optional nudge only — and it visibly costs score.</li>
          <li>· Scenario quiz: triage, decide, justify.</li>
        </ul>
        <span class="mode-cta hard">take the night shift ${I("ArrowRight", "ic-4")}</span>
      </button>
    </div>
  </div>
</div>`;
}

function briefingHTML() {
  const hard = Store.s.mode === "hard";
  return `<div class="cl-root cl-grid fullscreen">
  <div class="brief-wrap anim-rise-slow">
    <div class="brief-top">
      ${SectionLabel(`scenario briefing · ${hard ? "storm watch 22:47" : "day shift 09:00"}`, hard ? "#FF7A45" : "#FFB224")}
      <span class="brief-mode-tag">${hard ? "HARD MODE" : "MEDIUM MODE"}</span>
    </div>
    <h1>Welcome to Cascade Freightworks</h1>
    <div class="brief-body">
      <p>Cascade Freightworks moves refrigerated freight across the Pacific Northwest: a
        headquarters and data closet in <span class="ink">Portland, OR</span>, a
        distribution yard in <span class="ink">Tacoma, WA (“Yard 7”)</span>, and
        field techs in trucks across three states. You are the new NOC engineer — the person
        who keeps the network manageable.</p>
      <p>Your predecessor managed devices five different ways and hardened none of them. The
        evidence on your desk shows exactly what that costs: management sessions that shouldn’t
        exist, credentials in plaintext, a contractor tunneling wherever they like.</p>
      ${hard
    ? `<p><span style="color:#FF7A45">Tonight is a storm watch.</span> A major cell is
            tracking the Portland–Tacoma fiber route. When it lands, the WAN goes down and only
            one channel into Yard 7 survives. Work the incident, restore reachability, and find
            out whether yesterday’s management plane was already abused. The evidence is noisy —
            some alerts are lies.</p>`
    : `<p><span style="color:#FFB224">Today is an onboarding shift.</span> You’ll work
            through every access channel — VPN, SSH, web GUI, API, and the console — harden the
            core switch, and then run a storm drill that takes the WAN down so you can feel why
            out-of-band management exists.</p>`}
      <div class="env-box">
        <div class="env-box-head">${I("Building2", "ic-4", "color:#45D6C4")}${SectionLabel("your environment", "#45D6C4")}</div>
        <p>The <span class="mono-ink">PATCH BAY</span> (left rail) is your console:
          five channel jacks plus a rack bench. Patch a channel, work its interface in the center
          panel, track objectives on the right, and pull evidence from the drawer below. Keys
          <kbd class="kbd">1</kbd>–<kbd class="kbd">6</kbd> switch bays. Everything is
          synthetic training data — fictional hosts, RFC 1918 / RFC 5737 addresses, simulated
          credentials.</p>
      </div>
    </div>
    <div class="brief-actions">
      <button type="button" class="cl-focus btn-solid ${hard ? "orange" : "amber"}" data-act="enter-lab" data-fid="enter-lab">start shift ${I("ArrowRight", "ic-4")}</button>
      <button type="button" class="cl-focus btn-ghost" data-act="back-intro" data-fid="back-intro">back</button>
    </div>
  </div>
</div>`;
}

// ═════════════════════════════════════════════════════════════════════════════
// Lab frame
// ═════════════════════════════════════════════════════════════════════════════
function labFrameHTML() {
  return `<div class="cl-root cl-grid" style="min-height:100vh">
  <div id="sb-slot"></div>
  <main class="lab-main">
    <span class="sr-only" aria-live="polite">Access and management training console ready.</span>
    <div class="lab-grid">
      <div class="lab-col-bay"><div class="sticky-bay" id="bay-slot"></div></div>
      <div class="lab-col-ws"><div id="ws-slot" style="display:flex;flex:1;flex-direction:column;min-width:0"></div></div>
      <div class="lab-col-ledger"><div class="sticky-ledger cl-scroll" id="ledger-slot"></div></div>
    </div>
    <div style="margin-top:12px" id="evidence-slot"></div>
    <p class="footer-note">synthetic training environment · ${ORG.tagline} · every host, log and credential is
      fictional · ${objectivesFor(Store.s.mode).length} objectives mapped to n10-009 access &amp; management</p>
  </main>
  <div id="quiz-slot"></div>
  <div id="report-slot"></div>
  <div id="reset-slot"></div>
  <span class="cl-mono sr-only" id="bay-live">current bay: ${Store.s.bay ?? "none"}</span>
</div>`;
}

// ── Status bar (LabRoot/StatusBar) ──────────────────────────────────────────
function elapsedText() {
  const start = Store.s.shiftStartedAt;
  if (!start) return "00:00";
  const s = Math.floor((Date.now() - start) / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function renderStatusBar() {
  const el = slot("sb-slot");
  if (!el) return;
  const s = Store.s;
  const hard = s.mode === "hard";
  const m7Pending = s.mode === "medium" && !s.objectives["M7"]?.done;
  const stormBtnStyle = m7Pending
    ? 'border-color:#FFB224;color:#FFB224;background:#FFB22414;box-shadow:0 0 14px rgba(255,178,36,0.15)'
    : 'border-color:#2a332d;color:#d9e2dc;background:transparent';
  el.innerHTML = `<header class="statusbar cl-panel-solid" aria-label="Console status">
  <div class="sb-brand">${I("Zap", "ic-4", "color:#FFB224")}<span>${ORG.name} · patchbay</span></div>
  <span class="sb-chip sb-mode" style="${hard
    ? "color:#FF7A45;border-color:#FF7A4555;background:#FF7A4514"
    : "color:#4ADE80;border-color:#4ADE8055;background:#4ADE8010"}">${hard ? "storm watch · hard" : "standard · medium"}</span>
  <span class="sb-chip">shift T+<span id="shift-elapsed">${elapsedText()}</span></span>
  ${hard
    ? `<span class="sb-chip live-storm">${I("CloudLightning", "ic-3", "color:#FF5C5C")} storm event live</span>`
    : s.storm
      ? `<span class="sb-chip drill">${I("CloudLightning", "ic-3", "color:#FF7A45")} drill active — wan down</span>`
      : `<button type="button" class="cl-focus sb-btn storm" style="${stormBtnStyle}" data-act="run-storm" data-fid="run-storm">${I("CloudLightning", "ic-3")} run storm drill${m7Pending ? " (needed for M7)" : ""}</button>`}
  <div class="sb-right">
    <button type="button" class="cl-focus sb-btn quiz" data-act="toggle-quiz" data-fid="toggle-quiz">${I("ClipboardCheck", "ic-3")} wrap-up quiz</button>
    <button type="button" class="cl-focus sb-btn endshift" data-act="end-shift" data-fid="end-shift">${I("LogOut", "ic-3")} end shift</button>
    <button type="button" class="cl-focus sb-btn resetbtn" data-act="open-reset" data-fid="open-reset">${I("RotateCcw", "ic-3")} reset</button>
  </div>
</header>`;
}

function renderReset() {
  const el = slot("reset-slot");
  if (!el) return;
  if (!resetOpen) { el.innerHTML = ""; return; }
  el.innerHTML = `<div class="overlay" role="presentation">
  <div class="reset-panel anim-pop" role="alertdialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-desc">
    <h2 id="reset-title">Reset the entire lab?</h2>
    <p class="desc" id="reset-desc">This wipes saved progress (mode, objectives, quiz, evidence flags) and returns the
      patch bay to its pristine state. You’ll be asked to pick a mode again.</p>
    <div class="reset-actions">
      <button type="button" class="cl-focus btn-cancel" data-act="reset-cancel" data-fid="reset-cancel">cancel</button>
      <button type="button" class="cl-focus btn-danger" data-act="reset-confirm" data-fid="reset-confirm" style="background:#FF5C5C;color:#0b0d0c">reset everything</button>
    </div>
  </div>
</div>`;
  const cancel = el.querySelector("[data-act='reset-cancel']");
  if (cancel) cancel.focus();
}

// ═════════════════════════════════════════════════════════════════════════════
// Patch bay (PatchBay.tsx)
// ═════════════════════════════════════════════════════════════════════════════
const JACK_ICONS = { vpn: "Globe", ssh: "Terminal", gui: "Monitor", api: "Braces", console: "Cable", bench: "Wrench" };

function jackHTML(c) {
  const meta = CHANNEL_META[c];
  const active = Store.s.bay === c;
  return `<button type="button" role="radio" aria-checked="${active}" class="cl-focus jack" data-act="jack" data-val="${c}" data-fid="jack-${c}"
    style="border-color:${active ? meta.color : "#2a332d"};background:${active ? meta.color + "14" : "rgba(26,32,28,0.4)"};${active ? `box-shadow:0 0 14px ${meta.color}22;` : ""}">
    <span class="jack-icon" style="border-color:${active ? meta.color : "#2a332d"};background:${active ? meta.color + "22" : "#121614"};${active ? `box-shadow:0 0 10px ${meta.color}44;` : ""}" aria-hidden="true">
      ${I(JACK_ICONS[c], "ic-4", `color:${active ? meta.color : "#8fa096"}`)}
    </span>
    <span class="jack-text">
      <span class="jack-name" style="color:${active ? meta.color : "#d9e2dc"}">${meta.name}</span>
      <span class="jack-hint">${meta.hint}</span>
    </span>
    <span class="jack-port" style="color:${active ? meta.color : "#8fa096"};border-color:${active ? meta.color + "66" : "#2a332d"}">${meta.port}</span>
  </button>`;
}

function deviceRowHTML(id) {
  const d = DEVICES.find((x) => x.id === id);
  const storm = Store.s.storm;
  const down = id === "BR1-RTR01" && storm;
  return `<div class="device-row" aria-label="${d.name} reachability">
    <div class="dev-top">
      <span class="dev-name">${d.name}</span>
      <span class="dev-ip">${d.ip.split(" ")[0]}</span>
    </div>
    <div class="dev-leds">
      ${Led(!down && d.reachableBy.ssh, "#4ADE80", "SSH")}
      ${Led(!down && d.reachableBy.gui, "#C4A7FF", "GUI")}
      ${Led(!down && d.reachableBy.api, "#45D6C4", "API")}
      ${Led(!!d.serialPort, "#FF7A45", d.serialPort ? `CON ${d.serialPort}` : "no port")}
    </div>
    ${down ? `<p class="dev-down">in-band path down — OOB console only</p>` : ""}
    ${id === "TERM-SRV01" ? `<p class="dev-oob">OOB net · LTE backhaul — survives WAN loss</p>` : ""}
  </div>`;
}

function renderBay() {
  const el = slot("bay-slot");
  if (!el) return;
  const storm = Store.s.storm;
  el.innerHTML = `<div class="bay-col">
  <div class="bay-panel">
    <div class="bay-head">${SectionLabel("patch bay · select channel", "#FFB224")}<span class="bay-count">P1–P6</span></div>
    <div role="radiogroup" aria-label="Access channel jacks" class="jack-group">
      ${BAY_ORDER.map(jackHTML).join("")}
    </div>
  </div>
  <div class="bay-panel">
    <div class="dev-head">${SectionLabel("device matrix")}
      ${storm
    ? `<span class="storm-chip">${I("CloudLightning", "ic-3", "color:#FF5C5C")} storm active</span>`
    : `<span class="wan-chip">wan up</span>`}
    </div>
    <p class="bay-note">LEDs = reachable from your seat right now. Watch what dies when the storm cuts the HQ↔Yard 7 fiber.</p>
    <div class="dev-list">${DEVICES.map((d) => deviceRowHTML(d.id)).join("")}</div>
  </div>
</div>`;
}

// ═════════════════════════════════════════════════════════════════════════════
// Workspace router (LabRoot/Workspace) — dispatches to the 6 channels
// ═════════════════════════════════════════════════════════════════════════════
function renderWs() {
  const el = slot("ws-slot");
  if (!el) return;
  const bay = Store.s.bay;
  // React unmount semantics: switching bays drops the channel's local state.
  if (bay !== wsBay) {
    wsBay = bay;
    sshLines = [];
    sshUnreachable = false;
    guiHttp = false;
    vpnPulse = null;
  }
  const live = slot("bay-live");
  if (live) live.textContent = `current bay: ${bay ?? "none"}`;

  if (!bay) {
    el.innerHTML = `<div class="empty-bay cl-panel-solid cl-grid">
      <p class="l1">no channel patched</p>
      <p class="l2">Pick a jack on the PATCH BAY — VPN, SSH, WEB GUI, API, CONSOLE or the
        RACK BENCH — and the workspace here becomes that channel’s live interface. Keys
        <kbd class="kbd">1</kbd>–<kbd class="kbd">6</kbd> patch channels; the EVIDENCE
        drawer below holds logs, configs, docs, the field manual and glossary.</p>
    </div>`;
    return;
  }
  const meta = CHANNEL_META[bay];
  const body = bay === "vpn" ? vpnChannelHTML()
    : bay === "ssh" ? sshChannelHTML()
      : bay === "gui" ? guiChannelHTML()
        : bay === "api" ? apiChannelHTML()
          : bay === "console" ? consoleChannelHTML()
            : benchChannelHTML();
  el.innerHTML = `<div class="channel-frame anim-rise" aria-label="${meta.name} workspace">
    <div class="channel-meta cl-mono" style="border-color:${meta.color}44;background:${meta.color}0d">
      <span class="cname" style="color:${meta.color}">${meta.port} · ${meta.name}</span>
      <span class="chint">${meta.hint}</span>
    </div>
    <div class="anim-fade" style="display:flex;flex-direction:column;gap:12px">${body}</div>
  </div>`;
  bindAnswers(el);
  if (bay === "ssh") scrollTerm("ssh-out");
  if (bay === "console") scrollTerm("con-out");
}

function scrollTerm(id) {
  const t = document.getElementById(id);
  if (t) t.scrollTop = t.scrollHeight;
}

// ═════════════════════════════════════════════════════════════════════════════
// VPN channel (VpnChannel.tsx)
// ═════════════════════════════════════════════════════════════════════════════
const VPN_PERSONAS = [
  { id: "field", label: "FIELD TECH", icon: "Truck", desc: "Company laptop, roams truck stops" },
  { id: "contractor", label: "CONTRACTOR", icon: "Building2", desc: "Third party, policy: FULL + MFA" },
  { id: "staff", label: "STAFF", icon: "Wifi", desc: "Office staff working from home" },
];

function vpnThrough(dest) {
  const vpn = Store.s.vpn;
  if (dest === "yard" && Store.s.storm) return "unreachable";
  if (vpn.mode === "full") return "tunnel";
  if (dest === "public") return "direct";
  return vpn.acl.includes(dest) ? "tunnel" : "direct";
}

function vpnSimBadge(res) {
  const conf = {
    tunnel: ["through tunnel", "#FFB224", "#FFB22414"],
    direct: ["direct · bypasses VPN", "#FF5C5C", "#FF5C5C14"],
    unreachable: ["unreachable (WAN down)", "#FF7A45", "#FF7A4514"],
  }[res];
  return `<span class="sim-badge" style="color:${conf[1]};background:${conf[2]}">${conf[0]}</span>`;
}

function mapNodeHTML(icon, label, sub, color) {
  return `<div class="map-node">${I(icon, "ic-4", `color:${color}`)}
    <span class="n1">${label}</span><span class="n2">${sub}</span></div>`;
}

function mapFlowHTML(color) {
  return `<span class="map-flow ${vpnPulse !== null ? "on cl-flow" : ""}" style="${vpnPulse !== null ? `color:${color}` : ""}" aria-hidden="true"></span>`;
}

function siteTunnelHTML(storm) {
  return `<div class="s2s">
    <span class="s2s-chip" style="color:${storm ? "#FF5C5C" : "#45D6C4"};border-color:${storm ? "#FF5C5C66" : "#45D6C466"};background:${storm ? "#FF5C5C14" : "#45D6C414"}">${storm ? "S2S DOWN" : "S2S IPSEC"}</span>
    <span class="s2s-sub">HQ ↔ Yard 7</span>
  </div>`;
}

function classifierCardHTML(title, desc, k, value) {
  return `<div class="cls-card">
    ${SectionLabel(title)}
    <p class="desc">${desc}</p>
    <div class="cls-btns">
      ${[["site", "SITE-TO-SITE"], ["client", "CLIENT-TO-SITE"]].map(([id, label]) =>
    `<button type="button" class="cl-focus cls-btn" data-act="cls" data-id="${k}" data-val="${id}" data-fid="cls-${k}-${id}" aria-pressed="${value === id}"
          style="border-color:${value === id ? "#FFB224" : "#2a332d"};background:${value === id ? "#FFB22414" : "transparent"};color:${value === id ? "#FFB224" : "#d9e2dc"}">${label}</button>`).join("")}
    </div>
  </div>`;
}

function vpnChannelHTML() {
  const vpn = Store.s.vpn;
  const storm = Store.s.storm;
  const simRows = [
    { id: "hq", icon: "Server", name: "HQ file & ERP servers", net: "10.20.0.0/16" },
    { id: "yard", icon: "Warehouse", name: "Yard 7 WMS", net: "10.30.0.0/16" },
    { id: "public", icon: "Globe", name: "Public internet / video", net: "0.0.0.0/0" },
  ];
  const aclOptions = [
    { id: "hq", label: "10.20.0.0/16 — HQ file & ERP" },
    { id: "yard", label: "10.30.0.0/16 — Yard 7 WMS" },
    { id: "public", label: "0.0.0.0/0 — public internet" },
  ];
  const techNote = vpn.tech === "clientless"
    ? "Clientless: the browser IS the client — no install, but limited reach. Good for kiosks/third parties."
    : vpn.tech === "ipsec"
      ? "IPsec client: strong suite-based encryption at the IP layer."
      : "TLS/SSL client: browser-grade encryption, traverses most firewalls.";
  return `<div style="display:flex;flex-direction:column;gap:12px">
  ${ConsolePanel("tunnel map · live", "#FFB224", `<div class="tunnel-map">
      ${mapNodeHTML("Truck", "FIELD TECHS", "client VPN", "#FFB224")}
      ${mapFlowHTML("#FFB224")}
      ${mapNodeHTML("Cloud", "INTERNET", "203.0.113.0/24", "#8fa096")}
      ${mapFlowHTML("#FFB224")}
      ${mapNodeHTML("ShieldCheck", "DC-GW01", "VPN concentrator", "#FFB224")}
      ${mapFlowHTML("#45D6C4")}
      ${mapNodeHTML("Server", "HQ LAN", "10.20.0.0/16", "#45D6C4")}
      <div style="display:none;width:16px" aria-hidden="true"></div>
      ${siteTunnelHTML(storm)}
    </div>
    ${storm ? `<div class="storm-banner"><p>storm event · site-to-site HQ↔Yard7 TUNNEL DOWN (fiber cut) · client VPN to HQ still works</p></div>` : ""}`, { p0: true })}

  ${ConsolePanel("objective M1 · classify the deployments", "#FFB224", `<div class="cls-grid">
      ${classifierCardHTML("DEPLOYMENT A", "HQ ↔ Yard 7: both offices joined permanently, always on, no user action.", "clsA", vpn.clsA)}
      ${classifierCardHTML("DEPLOYMENT B", "A single field-tech laptop dialing in from a truck stop over cellular.", "clsB", vpn.clsB)}
    </div>`)}

  <div class="two-col">
    ${ConsolePanel("gateway policy · persona & controls", "#FFB224", `
      <div class="persona-grid" role="group" aria-label="Persona selector">
        ${VPN_PERSONAS.map((p) => {
  const on = vpn.persona === p.id;
  return `<button type="button" class="cl-focus persona-btn" data-act="persona" data-val="${p.id}" data-fid="persona-${p.id}" aria-pressed="${on}"
              style="border-color:${on ? "#FFB224" : "#2a332d"};background:${on ? "#FFB22414" : "transparent"}">
              ${I(p.icon, "ic-4", `color:${on ? "#FFB224" : "#8fa096"}`)}
              <span class="p1" style="color:${on ? "#FFB224" : "#d9e2dc"}">${p.label}</span>
            </button>`;
}).join("")}
      </div>
      <div class="tunnel-mode-grid">
        ${["full", "split"].map((m) =>
    `<button type="button" class="cl-focus mode-btn" data-act="vpn-mode" data-val="${m}" data-fid="vmode-${m}" aria-pressed="${vpn.mode === m}"
            style="border-color:${vpn.mode === m ? "#FFB224" : "#2a332d"};background:${vpn.mode === m ? "#FFB22414" : "transparent"};color:${vpn.mode === m ? "#FFB224" : "#d9e2dc"}">${m} tunnel</button>`).join("")}
      </div>
      ${vpn.mode === "split"
    ? `<fieldset>
          <legend class="acl-legend">split ACL — destinations routed through the tunnel</legend>
          <div class="acl-list">
            ${aclOptions.map((o) => {
      const on = vpn.acl.includes(o.id);
      return `<button type="button" class="cl-focus acl-btn" data-act="vpn-acl" data-val="${o.id}" data-fid="acl-${o.id}" aria-pressed="${on}"
                style="border-color:${on ? "#FFB22466" : "#2a332d"};color:${on ? "#FFB224" : "#d9e2dc"}">
                <span class="acl-box" style="border-color:${on ? "#FFB224" : "#2a332d"};background:${on ? "#FFB224" : "transparent"}" aria-hidden="true">${on ? `<span>✓</span>` : ""}</span>
                ${o.label}
              </button>`;
    }).join("")}
          </div>
        </fieldset>`
    : ""}
      <div class="policy-grid">
        ${Toggle("MFA on gateway", vpn.mfa, "#FFB224", "vpn-mfa", { act: "vpn-mfa", id: "mfa" })}
        <label class="fld">
          <span class="fld-label">client tech</span>
          <select class="fld-select cl-focus" data-change="tech" data-fid="tech" aria-label="VPN client technology" style="width:100%">
            <option value="ipsec"${vpn.tech === "ipsec" ? " selected" : ""}>IPsec client</option>
            <option value="tls"${vpn.tech === "tls" ? " selected" : ""}>TLS/SSL client</option>
            <option value="clientless"${vpn.tech === "clientless" ? " selected" : ""}>Clientless (HTML5/TLS)</option>
          </select>
        </label>
      </div>
      <p class="tech-note">${techNote}</p>`)}
    ${ConsolePanel("traffic simulator · full vs split", "#FFB224", `<div style="display:flex;flex-direction:column;gap:8px">
      ${simRows.map((r) => {
    const res = vpnThrough(r.id);
    return `<div class="sim-row">
          <div class="sim-top">
            <span class="sim-name">${I(r.icon, "ic-3_5", "color:#8fa096")} ${r.name} <span class="net">${r.net}</span></span>
            <button type="button" class="cl-focus btn-send" data-act="vpn-sim" data-val="${r.id}" data-fid="sim-${r.id}">send</button>
          </div>
          <div class="sim-res">
            ${vpnSimBadge(res)}
            ${vpnPulse === r.id ? `<span class="sim-pulse cl-flow anim-fade" style="color:${res === "tunnel" ? "#FFB224" : "#FF5C5C"}"></span>` : ""}
          </div>
        </div>`;
  }).join("")}
      </div>
      <div class="m2-box">
        ${SectionLabel("objective M2 · simulator question")}
        <p>Set persona STAFF, mode SPLIT, ACL = HQ only. Run the simulator. Which traffic bypasses the VPN?</p>
        <div style="margin-top:8px">
          ${AnswerField("m2_bypass", "bypassing traffic", { width: "full", options: [
    { value: "hq", label: "HQ file & ERP server flows" },
    { value: "yard", label: "Yard 7 WMS subnet flows" },
    { value: "public", label: "Public video streaming" },
    { value: "none", label: "Nothing bypasses the VPN" },
  ] })}
        </div>
      </div>`)}
  </div>

  ${ConsolePanel("objective H9 · split-tunnel governance review", "#FFB224", `
    <p class="prose-mono" style="margin-bottom:8px">Session V-2203 (contractor a.moreau) came in with split tunnel and an ACL covering ONLY
      10.20.0.0/16. Reproduce it here (persona CONTRACTOR · SPLIT · HQ only) and decide.</p>
    <div class="cls-grid">
      ${AnswerField("h9_leak", "what leaks outside the tunnel?", { width: "full", options: [
    { value: "nothing", label: "Nothing leaks at all" },
    { value: "public-only", label: "Public internet traffic only" },
    { value: "yard-and-public", label: "Yard 7 + public internet" },
    { value: "hq-only", label: "HQ subnet traffic only" },
  ] })}
      ${AnswerField("h9_action", "correct policy action", { width: "full", options: [
    { value: "force-full", label: "Force FULL tunnel for the role" },
    { value: "widen-acl", label: "Widen the split-tunnel ACL scope" },
    { value: "allow", label: "Allow as-is and only log it" },
  ] })}
    </div>`)}
</div>`;
}

// ═════════════════════════════════════════════════════════════════════════════
// SSH channel (SshChannel.tsx) — incl. the running-config consistency fix
// ═════════════════════════════════════════════════════════════════════════════
function runningConfigLines(applied, h) {
  if (!applied) return RUNNING_CONFIG.map((l) => l.text);
  return [
    "! HQ-CORE-SW01 — running-config (excerpt) — SYNTHETIC TRAINING DEVICE",
    "hostname HQ-CORE-SW01",
    "ip domain-name cascade.local",
    `crypto key generate rsa modulus ${h.keySize}`,
    `ip ssh version ${h.sshVersion}`,
    "ip ssh time-out 60",
    h.httpServer ? "ip http server" : "no ip http server",
    h.credsChanged ? "username nocadmin secret ******** (changed — was admin/admin123)" : "username admin password admin123",
    "access-list 10 permit 10.20.1.0 0.0.0.255",
    "logging host 10.20.0.40",
    "line console 0",
    " exec-timeout 5 30",
    "line vty 0 4",
    ` transport input ${h.transport}`,
    h.mgmtAcl ? " access-class 10 in" : " ! no source restriction",
    h.execTimeout ? " exec-timeout 5 30" : " ! no idle timeout",
    "end",
  ];
}

function sshConnect(target) {
  const s = Store.s;
  sshUnreachable = false;
  sshLines = [];
  Store.set({ sshTarget: target, sshLoggedIn: false });
  if (target === "BR1-RTR01" && s.storm) {
    sshUnreachable = true;
    renderWs();
    return;
  }
  // Lines must exist BEFORE the Store.set below: the ws region re-render reads
  // sshLines synchronously (React batches state updates; classic JS does not).
  sshLines = [
    `ssh noc_operator@${target === "HQ-CORE-SW01" ? "10.20.0.2" : "10.30.0.1"} …`,
    "host key accepted: sha256 c4sc4d3-tr41n1ng (SYNTHETIC)",
    "authenticated with key auth — session encrypted",
    "",
    `*** ${target} *** SYNTHETIC TRAINING DEVICE — authorized access only`,
    "Type 'help' for available commands.",
  ];
  Store.set({ sshLoggedIn: true, bay: "ssh" });
}

function sshRunCommand(raw) {
  const h = Store.s.hardening;
  const cmd = raw.trim().toLowerCase();
  sshLines.push(`cascade-sw> ${raw.trim()}`);
  switch (cmd) {
    case "":
      // 1:1 with the original: an empty submit leaves the bare prompt line in the
      // transcript (React: push(...) then `case "": break;` — no removal).
      break;
    case "help":
      sshLines.push("available: help · show version · show ip ssh · show running-config · show users · whoami · logout · clear");
      break;
    case "show version":
      sshLines.push(
        "CascadeOS 15.2(7)E3, SYNTHETIC TRAINING IMAGE",
        `uptime: 71 days · management: ${h.applied ? "HARDENED (SSHv2, strong key)" : "baseline (see config audit)"}`
      );
      break;
    case "show ip ssh":
      sshLines.push(
        `SSH version: ${h.applied && h.sshVersion === "2" ? "2 only" : "1 enabled (v2 available)"}`,
        `RSA key modulus: ${h.applied && h.keySize >= 2048 ? h.keySize : 768} bits`,
        "listening port: 22 — transport encrypted (AES-256-CTR)"
      );
      break;
    case "show running-config":
    case "show run":
      sshLines.push(...runningConfigLines(h.applied, h));
      break;
    case "show users":
      sshLines.push("Line    User          Host              Conns", "vty 0   noc_operator  10.20.1.44        1");
      break;
    case "whoami":
      sshLines.push("noc_operator (NOC group — management subnet 10.20.1.0/24)");
      break;
    case "logout":
    case "exit":
      Store.set({ sshLoggedIn: false });
      sshLines.push("connection closed.");
      break;
    case "clear":
      sshLines = [];
      break;
    case "telnet 10.20.0.2":
      sshLines.push("% Telnet blocked by workstation policy — and for good reason (see TELNET ATTEMPT below).");
      break;
    default:
      sshLines.push(`% invalid input detected at '^' marker — type 'help'`);
  }
  sshPreUpdate();
  scrollTerm("ssh-out");
}

function sshTelnetAttempt() {
  Store.set({ telnetTried: true });
  sshLines.push(
    "",
    "$ telnet 10.20.0.2",
    "Trying 10.20.0.2:23 … connected (training sim)",
    "!! WARNING: this session would be PLAINTEXT — username, password and every command are",
    "!! readable by anyone on the path. Telnet offers no integrity and no authentication of the host.",
    "!! The management-access log shows an attacker did exactly this: 198.51.100.77 → tcp/23.",
    "(simulation ends — use SSH)"
  );
  sshPreUpdate();
  scrollTerm("ssh-out");
}

/** Surgical update of the SSH output pane — keeps the input's focus + caret. */
function sshPreUpdate() {
  const pre = document.getElementById("ssh-pre");
  if (!pre) return;
  const s = Store.s;
  const text = sshLines.length === 0 ? "no session — pick a target above and connect" : sshLines.join("\n");
  pre.innerHTML = `${esc(text)}${s.sshLoggedIn && s.sshTarget ? `<span class="cl-caret">▌</span>` : ""}`;
}

function sshChannelHTML() {
  const s = Store.s;
  const on = (t) => s.sshTarget === t && s.sshLoggedIn;
  return `<div style="display:flex;flex-direction:column;gap:12px">
  ${ConsolePanel("ssh channel · connect", "#4ADE80", `
    <div class="connect-row">
      <button type="button" class="cl-focus connect-btn" data-act="ssh-connect" data-val="HQ-CORE-SW01" data-fid="ssh-hq"
        style="border-color:${on("HQ-CORE-SW01") ? "#4ADE80" : "#2a332d"};background:${on("HQ-CORE-SW01") ? "#4ADE8014" : "transparent"};color:${on("HQ-CORE-SW01") ? "#4ADE80" : "#d9e2dc"}">
        ${I("PlugZap", "ic-3_5", "color:inherit")} HQ-CORE-SW01 · 10.20.0.2
      </button>
      <button type="button" class="cl-focus connect-btn" data-act="ssh-connect" data-val="BR1-RTR01" data-fid="ssh-br1"
        style="border-color:${on("BR1-RTR01") ? "#4ADE80" : "#2a332d"};background:${on("BR1-RTR01") ? "#4ADE8014" : "transparent"};color:${on("BR1-RTR01") ? "#4ADE80" : "#d9e2dc"}">
        ${I("PlugZap", "ic-3_5", "color:inherit")} BR1-RTR01 · 10.30.0.1
      </button>
    </div>
    ${sshUnreachable ? `<div class="alert-box" role="alert">
      <p class="l1">${I("AlertTriangle", "ic-3_5")} ssh: connect to host 10.30.0.1 port 22: No route to host</p>
      <p class="l2">SSH is an <b>in-band</b> method — it rides the production network, and the storm cut the
        HQ↔Yard 7 fiber. This is exactly why out-of-band console access exists: open the CONSOLE
        bay and patch to TERM-SRV01 port S2.</p>
    </div>` : ""}
    ${s.telnetTried && !sshUnreachable ? `<p class="telnet-note">telnet attempt logged — plaintext protocol, see output</p>` : ""}`,
    { right: `<span class="hd-meta upper">${I("Lock", "ic-3", "display:inline-block;vertical-align:-2px;color:#8fa096")} tcp/22 · encrypted</span>` })}

  ${ConsolePanel(`terminal ${s.sshLoggedIn && s.sshTarget ? `· session to ${s.sshTarget}` : "· no session"}`, "#4ADE80", `
    <div id="ssh-out" class="term tall cl-scroll" aria-live="polite" aria-label="SSH terminal output">
      <pre id="ssh-pre" class="cl-mono" style="color:#4ADE80">${esc(sshLines.length === 0 ? "no session — pick a target above and connect" : sshLines.join("\n"))}${s.sshLoggedIn && s.sshTarget ? `<span class="cl-caret">▌</span>` : ""}</pre>
    </div>
    ${s.sshLoggedIn ? `<form id="ssh-form" class="term-form">
      <label for="ssh-in" class="sr-only">SSH command</label>
      <span class="ps1" aria-hidden="true">$</span>
      <input id="ssh-in" class="term-input cl-focus" autocomplete="off" placeholder="show ip ssh" />
      <button type="submit" class="cl-focus term-enter">enter</button>
    </form>` : ""}`,
    { right: s.sshLoggedIn
      ? `<button type="button" class="cl-focus sb-btn" style="min-height:44px;border-radius:4px;font-size:9px;color:#8fa096" data-act="ssh-disconnect" data-fid="ssh-disc">disconnect</button>`
      : "", p0: true })}

  <div class="two-col">
    ${ConsolePanel("telnet experiment (safe, simulated)", "#FF5C5C", `
      <p class="prose">See the difference for yourself: attempt a Telnet session to the core switch. SSH encrypts
        everything; Telnet encrypts nothing. In the evidence log, an outsider used exactly this door.</p>
      <button type="button" class="cl-focus btn-telnet" data-act="telnet-attempt" data-fid="telnet-attempt" ${s.sshLoggedIn ? "" : "disabled"}>attempt telnet 10.20.0.2:23</button>`)}
    ${ConsolePanel("objective M3 · ssh facts", "#4ADE80", `<div style="display:grid;gap:8px">
      ${AnswerField("ssh_port", "ssh tcp port", { placeholder: "port number" })}
      ${AnswerField("ssh_encrypted", "session transport", { options: [
    { value: "encrypted", label: "Encrypted (safe)" },
    { value: "plaintext", label: "Plaintext (sniffable)" },
  ] })}
    </div>`)}
  </div>
</div>`;
}

// ═════════════════════════════════════════════════════════════════════════════
// GUI channel (GuiApiChannel.tsx — GuiChannel)
// ═════════════════════════════════════════════════════════════════════════════
function guiChannelHTML() {
  const storm = Store.s.storm;
  const secure = !guiHttp;
  return `<div style="display:flex;flex-direction:column;gap:12px">
  ${ConsolePanel("web gui · device manager", "#C4A7FF", `
    <div class="browser-chrome">
      <button type="button" class="cl-focus addr-btn" data-act="gui-http" data-fid="gui-http" aria-label="Toggle between HTTPS and HTTP management transport">
        ${secure
    ? `${I("Lock", "ic-3", "color:#4ADE80")} https://10[.]20[.]0[.]5`
    : `${I("LockOpen", "ic-3", "color:#FF5C5C")} http://10[.]20[.]0[.]5 — unencrypted!`}
      </button>
      <span class="addr-note">${secure ? "TLS session — credentials protected" : "plaintext GUI — who knows your password? everyone on the path"}</span>
    </div>
    <div class="cl-grid" style="padding:12px">
      <div class="gui-cards">
        <div class="gui-card">
          ${SectionLabel("device", "#C4A7FF")}
          <p class="gui-title">HQ-FW01 — perimeter firewall</p>
          <p class="gui-sub">CascadeOS 9.2.4f · uptime 41d</p>
          <div style="margin-top:8px">${Led(true, "#4ADE80", "all systems nominal")}</div>
        </div>
        <div class="gui-card">
          ${SectionLabel("interfaces", "#C4A7FF")}
          <ul class="iface-list">
            <li style="color:#4ADE80">WAN (203.0.113.10) — up</li>
            <li style="color:#4ADE80">LAN (10[.]20[.]0[.]5) — up</li>
            <li style="color:#FF5C5C">S2S Tunnel 01 — ${storm ? "down (storm)" : "up"}</li>
          </ul>
        </div>
        <div class="gui-card alert">
          ${SectionLabel("subscriptions", "#FF5C5C")}
          <p class="subs-note">${I("ShieldAlert", "ic-3_5")} Threat-Prevention: <b>EXPIRED</b> (lapsed 2026-09-30) — renew at vendor portal</p>
          <p class="subs-fact">GUI-only fact: not exposed over SSH/API.</p>
        </div>
      </div>
    </div>`, { p0: true })}

  ${ConsolePanel("objective M5 · gui facts", "#C4A7FF", `
    <p class="prose-mono" style="margin-bottom:8px">GUIs are visual: this subscription state jumps out on a dashboard and is hard to script.
      Confirm the two facts below.</p>
    <div class="cls-grid">
      ${AnswerField("gui_transport", "default GUI transport (padlock state)", { options: [
    { value: "https", label: "HTTPS — encrypted" },
    { value: "http", label: "HTTP — plaintext" },
  ] })}
      ${AnswerField("gui_fact", "threat-prevention subscription", { options: [
    { value: "expired", label: "Expired" },
    { value: "active", label: "Active" },
    { value: "missing", label: "Not shown in GUI" },
  ] })}
    </div>`)}
</div>`;
}

// ═════════════════════════════════════════════════════════════════════════════
// API channel (GuiApiChannel.tsx — ApiChannel)
// ═════════════════════════════════════════════════════════════════════════════
function apiChannelHTML() {
  const api = Store.s.api;
  const storm = Store.s.storm;
  return `<div style="display:flex;flex-direction:column;gap:12px">
  ${ConsolePanel("rest api workbench · dc-gw01 controller", "#45D6C4", `
    <div class="api-grid">
      <label class="fld">
        <span class="fld-label">endpoint</span>
        <select class="fld-select cl-focus" data-change="api-endpoint" data-fid="api-endpoint" aria-label="API endpoint">
          ${API_ENDPOINTS.map((e) => `<option value="${e.id}"${api.endpoint === e.id ? " selected" : ""}>${esc(e.label)}</option>`).join("")}
        </select>
      </label>
      <label class="fld">
        <span class="fld-label">authorization bearer token</span>
        <input class="fld-input cl-focus" data-input="api-token" data-fid="api-token" value="${esc(api.token)}" placeholder="tkn_…" autocomplete="off" aria-label="API bearer token" style="padding:0 12px" />
      </label>
    </div>
    <div class="api-actions">
      <button type="button" class="cl-focus btn-api-send" data-act="api-send" data-fid="api-send">${I("Send", "ic-3_5")} send request</button>
      ${api.status !== null ? `<span class="http-chip" role="status" style="color:${api.status === 200 ? "#4ADE80" : "#FF5C5C"};border-color:${api.status === 200 ? "#4ADE8055" : "#FF5C5C55"};background:${api.status === 200 ? "#4ADE8010" : "#FF5C5C10"}">HTTP ${api.status}${api.status === 401 ? " — token missing/wrong (read the NOC API README)" : ""}</span>` : ""}
      <button type="button" class="cl-focus btn-fill" data-act="api-fill" data-fid="api-fill">${I("RefreshCw", "ic-3")} fill from readme</button>
    </div>
    <p class="api-note">Tokens are credentials — this one lives in the NOC API README (Evidence → DOCS). Never embed
      it in scripts or repos: the audit trail in Hard mode shows what a leaked token can do.</p>`,
    { right: `<span class="hd-meta">https://api.cascade-noc.local/v1</span>` })}

  <div class="api-cols">
    ${ConsolePanel("response · json", "#45D6C4", `
      <div class="term tall cl-scroll" aria-live="polite" aria-label="API JSON response">
        <pre class="cl-mono" style="color:#45D6C4;font-size:10.5px">${esc(api.body ?? "// press SEND to call the controller — 401 means authenticate first")}</pre>
      </div>`, { right: I("FileJson", "ic-3_5", "color:#8fa096"), p0: true })}
    ${ConsolePanel("objective M6 · api fact", "#45D6C4", `
      <p class="prose-mono">Call <span style="color:#45D6C4">/vpn/sessions</span> with the NOC token. How many
        active <b>client-to-site</b> sessions are up? (type=client — site-to-site rows don’t count)</p>
      <div style="margin-top:8px">${AnswerField("vpn_client_sessions", "client sessions", { placeholder: "0" })}</div>
      ${storm ? `<p class="storm-note">storm note: site-to-site session is down — client sessions unaffected</p>` : ""}`)}
  </div>
</div>`;
}

// ═════════════════════════════════════════════════════════════════════════════
// Console channel (ConsoleChannel.tsx) — fully derived from patch state
// ═════════════════════════════════════════════════════════════════════════════
function consoleLines() {
  const s = Store.s;
  if (!s.consolePatched || !s.consoleDevice) return [];
  return [
    `[TERM-SRV01] patching ${s.consolePort ?? "S?"} → ${s.consoleDevice} console …`,
    "[TERM-SRV01] rollover cable OK · 9600 8N1",
    `[${s.consoleDevice}] console session established`,
    "",
    `*** ${s.consoleDevice} *** SYNTHETIC TRAINING DEVICE — console port`,
    s.consoleDevice === "BR1-RTR01"
      ? (s.storm ? "WAN GigabitEthernet0/0: DOWN — link lost (fiber cut, storm)" : "WAN GigabitEthernet0/0: up — 10.30.0.1")
      : "device reachable via console — in-band paths: SSH (10.20.0.2:22)",
    s.storm && s.consoleDevice === "BR1-RTR01"
      ? "NOTE: production network is unreachable, but THIS session works — out-of-band via TERM-SRV01 LTE."
      : "read-only console snapshot — config work happens at the RACK BENCH or over SSH.",
  ];
}

function consoleChannelHTML() {
  const s = Store.s;
  const lines = consoleLines();
  const ports = [
    { id: "S1", label: "S1 — HQ console ports (HQ-CORE-SW01, HQ-FW01)" },
    { id: "S2", label: "S2 — BR1-RTR01 console (Yard 7)" },
  ];
  return `<div style="display:flex;flex-direction:column;gap:12px">
  ${ConsolePanel("terminal server · term-srv01 (oob rack)", "#FF7A45", `
    <p class="prose">TERM-SRV01 lives on the <b>out-of-band</b> network: its own cables, its own LTE backhaul.
      Each serial port is physically patched to a device console port with a rollover cable. The
      production network can die completely — this path won’t.</p>
    <div class="port-grid">
      ${ports.map((p) => {
    const on = s.consolePort === p.id && s.consolePatched;
    return `<button type="button" class="cl-focus port-btn" data-act="console-patch" data-val="${p.id}" data-fid="con-${p.id}" aria-pressed="${on}"
            style="border-color:${on ? "#FF7A45" : "#2a332d"};background:${on ? "#FF7A4514" : "transparent"}">
            ${I("Cable", "ic-4", `color:${on ? "#FF7A45" : "#8fa096"}`)}
            <span class="plabel" style="color:${on ? "#FF7A45" : "#d9e2dc"}">${p.label}</span>
          </button>`;
  }).join("")}
    </div>
    <div class="patch-status">
      ${s.consolePatched
    ? `<span class="flow-line cl-flow" style="color:#FF7A45" aria-hidden="true"></span>
           <span class="patched-chip" role="status">${I("CircleCheck", "ic-3")} patched → ${s.consoleDevice}</span>
           <button type="button" class="cl-focus btn-unpatch" data-act="console-unpatch" data-fid="con-unpatch">${I("Unplug", "ic-3_5")} unpatch</button>`
    : `<p class="idle-note">select a serial port above to patch the cable</p>`}
    </div>`,
    { right: Led(true, "#FF7A45", "LTE backhaul — independent of WAN") })}

  ${ConsolePanel(`console ${s.consolePatched && s.consoleDevice ? `· ${s.consoleDevice}` : "· idle"}`, "#FF7A45", `
    <div id="con-out" class="term cl-scroll" aria-live="polite" aria-label="Console output">
      <pre class="cl-mono" style="color:#FF7A45">${esc(lines.length ? lines.join("\n") : "no cable patched — select a serial port above")}</pre>
    </div>
    <div class="term-foot">
      <p>${I("RadioTower", "ic-3_5", "color:#FF7A45")}${s.storm
    ? "storm active · in-band to yard 7 dead · console is the only path to BR1-RTR01"
    : "console works regardless of the production network — that's the point"}</p>
    </div>`, { p0: true })}

  ${ConsolePanel("objective M7 · channel type", "#FF7A45", `
    <p class="prose-mono">You just reached BR1-RTR01 while every network path to Yard 7 was dead. What kind of
      management channel is this?</p>
    <div style="margin-top:8px">
      ${AnswerField("m7_type", "channel type", { options: [
    { value: "oob", label: "Out-of-band (OOB) management" },
    { value: "in-band", label: "In-band, over production network" },
    { value: "remote", label: "Remote desktop software" },
  ] })}
    </div>`)}
</div>`;
}

// ═════════════════════════════════════════════════════════════════════════════
// Bench channel (BenchChannel.tsx)
// ═════════════════════════════════════════════════════════════════════════════
function benchChannelHTML() {
  const h = Store.s.hardening;
  const dirty = !h.applied;
  const configLines = [
    "! candidate config — HQ-CORE-SW01 (SYNTHETIC)",
    `crypto key generate rsa modulus ${h.keySize}`,
    `ip ssh version ${h.sshVersion}`,
    h.httpServer ? "ip http server" : "no ip http server",
    h.credsChanged ? "username nocadmin secret ******** (changed — was admin/admin123)" : "username admin password admin123",
    "line vty 0 4",
    ` transport input ${h.transport}`,
    h.mgmtAcl ? " access-class 10 in   ! mgmt subnet 10.20.1.0/24 only" : " ! no source restriction",
    h.execTimeout ? " exec-timeout 5 30" : " ! no idle timeout",
    "end",
  ];
  const sel = (label, aria, act, cur, opts) => `
    <label class="fld">
      <span class="fld-label">${label}</span>
      <select class="fld-select cl-focus" data-change="${act}" aria-label="${aria}">
        ${opts.map(([v, l]) => `<option value="${v}"${String(cur) === String(v) ? " selected" : ""}>${esc(l)}</option>`).join("")}
      </select>
    </label>`;
  return `<div style="display:flex;flex-direction:column;gap:12px">
  ${ConsolePanel("rack bench · hq-core-sw01 hardening", "#D9E2DC", `
    <p class="prose">Your M4 audit found five open doors. Close them here. Every control maps to a flagged line —
      and to a real exam objective: SSH-only VTY, SSHv2, strong keys, no default creds, no
      plain-HTTP management, least-privilege sources, session timeouts.</p>
    <div class="bench-grid">
      <div class="bench-controls">
        ${sel("vty transport input", "VTY transport input", "bench-transport", h.transport, [
    ["telnet", "telnet (plaintext — the open door)"],
    ["ssh", "ssh (encrypted — correct)"],
    ["both", "both (telnet stays open!)"],
    ["none", "none (management locked out)"],
  ])}
        <div class="bench-two">
          ${sel("ssh version", "SSH version", "bench-sshver", h.sshVersion, [["1", "1 (flawed)"], ["2", "2 (only)"]])}
          ${sel("rsa modulus", "RSA key modulus", "bench-keysize", h.keySize, [
    ["768", "768 (obsolete)"], ["1024", "1024 (weak)"], ["2048", "2048 (minimum)"], ["4096", "4096 (strong)"],
  ])}
        </div>
        ${Toggle("HTTPS-only management (disable plain HTTP server)", !h.httpServer, "#C4A7FF", "bt-https", { act: "bench-toggle", id: "httpServer" })}
        ${Toggle("replace default credential admin/admin123", h.credsChanged, "#4ADE80", "bt-creds", { act: "bench-toggle", id: "credsChanged" })}
        ${Toggle("management ACL — VTY sources limited to 10.20.1.0/24", h.mgmtAcl, "#45D6C4", "bt-acl", { act: "bench-toggle", id: "mgmtAcl" })}
        ${Toggle("exec-timeout on idle VTY sessions (5:30)", h.execTimeout, "#FFB224", "bt-timeout", { act: "bench-toggle", id: "execTimeout" })}
      </div>
      <div class="candidate">
        ${SectionLabel("candidate running-config", "#8fa096")}
        <pre aria-live="polite">${esc(configLines.join("\n"))}</pre>
      </div>
    </div>
    <div class="bench-apply-row">
      <button type="button" class="cl-focus btn-apply" data-act="bench-apply" data-fid="bench-apply">${I("Wrench", "ic-3_5")} apply config</button>
      ${h.applied ? `<span class="applied-note" role="status">${I("Check", "ic-3_5")} deployed to HQ-CORE-SW01 — SSH terminal now reports the new settings</span>` : ""}
    </div>`,
    { right: `<span class="dirty-chip" role="status" style="${dirty
    ? "color:#FFB224;border-color:#FFB22455;background:#FFB22414"
    : "color:#4ADE80;border-color:#4ADE8055;background:#4ADE8010"}">${dirty ? "unsaved changes" : "config applied"}</span>` })}

  ${ConsolePanel("bench notes · why each control", "#D9E2DC", `
    <ul>
      <li>· <span class="mono-ink">transport input ssh</span> — kills Telnet (plaintext) at the VTY door.</li>
      <li>· <span class="mono-ink">ip ssh version 2</span> — SSHv1 has known design flaws.</li>
      <li>· <span class="mono-ink">modulus 2048+</span> — obsolete keys fall to determined attackers.</li>
      <li>· <span class="mono-ink">no ip http server</span> — the GUI must serve over HTTPS only.</li>
      <li>· <span class="mono-ink">no default creds</span> — ‘admin/admin123’ is the first thing anyone tries.</li>
      <li>· <span class="mono-ink">access-class</span> — only the management subnet may even knock.</li>
      <li>· <span class="mono-ink">exec-timeout</span> — idle privileged sessions shouldn’t linger.</li>
    </ul>`, { cls: "bench-notes" })}
</div>`;
}

// ═════════════════════════════════════════════════════════════════════════════
// Objectives ledger (Ledger.tsx) — progress ring, CHECK RESULTS per objective,
// pillar chips, tiered hints, Medium "next up" pointer.
// ═════════════════════════════════════════════════════════════════════════════
function ledgerCardHTML(d, mode, nextUpId) {
  const s = Store.s;
  const run = s.objectives[d.id];
  const done = run?.done ?? false;
  const isNext = mode === "medium" && nextUpId === d.id;
  const tag = done
    ? `<span class="obj-done-tag">${I("Check", "ic-3")} done${run.firstAttempt ? " · first try" : ""}</span>`
    : isNext
      ? `<span class="obj-next-tag">next up ${I("ChevronRight", "ic-3")}</span>`
      : "";
  const pointer = !done && isNext && mode === "medium"
    ? `<p class="obj-pointer">where to look: ${esc(d.pointer)}</p>`
    : "";
  const sr = s.lastCheckedId === d.id
    ? `<p aria-live="polite" class="sr-only">Objective ${d.id} ${s.lastCheckedOk ? "passed" : "needs work"} — see feedback.</p>`
    : "";
  return `<article class="obj-card" aria-label="Objective ${d.id}"
    style="border-color:${done ? "#4ADE8055" : isNext ? "#FFB22466" : "#2a332d"};background:${done ? "#4ADE8008" : isNext ? "#FFB2240d" : "rgba(18,22,20,0.4)"}">
    <div class="obj-top">
      <span style="display:flex;align-items:center;gap:6px">
        <span class="obj-id" style="color:${done ? "#4ADE80" : "#FFB224"}">${d.id}</span>
        ${PillarChip(d.pillar)}
      </span>
      ${tag}
    </div>
    <p class="obj-title">${esc(d.title)}</p>
    <p class="obj-anchor">anchor: ${esc(d.tag)}</p>
    ${pointer}
    <div class="obj-actions">
      <button type="button" class="btn-check cl-focus" data-act="check" data-val="${d.id}" data-fid="check-${d.id}"
        style="background:${done ? "#4ADE80" : "#FFB224"};color:#0b0d0c">
        ${done ? `${I("RotateCcw", "ic-3")} re-check` : "check results"}
      </button>
      ${!done ? HintBox(d.id, mode) : ""}
    </div>
    ${sr}
    ${VerdictLine(d.id)}
  </article>`;
}

function renderLedger() {
  const el = slot("ledger-slot");
  if (!el) return;
  const mode = Store.s.mode ?? "medium";
  const defs = objectivesFor(mode);
  const metrics = metricsFor(mode, { objectives: Store.s.objectives, hints: Store.s.hints }, defs);
  const nextUp = defs.find((d) => !Store.s.objectives[d.id]?.done);
  el.innerHTML = `<div class="ledger" style="display:flex;flex-direction:column;gap:12px;height:100%">
    <div class="ledger-head">
      ${Ring(metrics.completion * 100)}
      <div class="ledger-meta">
        ${SectionLabel("objectives ledger", "#FFB224")}
        <p class="ledger-count">${metrics.done}/${metrics.total} complete · ${metrics.hintsUsed} hints</p>
        <p class="ledger-mode">${mode === "hard" ? "storm watch — strict validation" : "standard shift — guided"}</p>
      </div>
    </div>
    <div class="obj-list" aria-label="Objective list">
      ${defs.map((d) => ledgerCardHTML(d, mode, nextUp?.id)).join("")}
    </div>
  </div>`;
}

// ═════════════════════════════════════════════════════════════════════════════
// Evidence drawer (EvidenceDrawer.tsx + EvidenceLogs.tsx + EvidenceDocs.tsx)
// ═════════════════════════════════════════════════════════════════════════════
const EVIDENCE_TABS = [
  { id: "logs", label: "LOGS", icon: "ScrollText" },
  { id: "config", label: "CONFIG", icon: "Flag" },
  { id: "matrix", label: "MATRIX", icon: "Network" },
  { id: "docs", label: "DOCS", icon: "FileText" },
  { id: "manual", label: "MANUAL", icon: "BookOpen" },
  { id: "glossary", label: "GLOSSARY", icon: "Languages" },
  { id: "notes", label: "NOTES", icon: "NotebookPen" },
];

// ── LOGS tab panels ─────────────────────────────────────────────────────────
function accessLogPanelHTML() {
  const flags = Store.s.logFlags;
  const rows = ACCESS_LOG.map((r) => {
    const on = flags.includes(r.id);
    const protoColor = r.proto === "TELNET" ? "#FF5C5C" : r.proto === "SSH" ? "#4ADE80" : "#C4A7FF";
    return `<tr class="${on ? "flagged" : ""}">
      <td><input type="checkbox" class="row-flag cl-focus" data-flag="logFlags" data-val="${r.id}"${on ? " checked" : ""} aria-label="Flag log row ${r.id}" /></td>
      <td class="cl-dim">${r.time}</td>
      <td style="color:#d9e2dc">${r.src}</td>
      <td class="cl-dim">${r.dst}:${r.port}</td>
      <td><span style="color:${protoColor}">${r.proto}</span></td>
      <td class="cl-dim">${esc(r.detail)}</td>
    </tr>`;
  }).join("");
  return ConsolePanel("auth_access · management sessions (yesterday)", "#FFB224", `
    <div class="tbl-wrap"><table class="tbl" style="min-width:640px">
      <thead><tr>${["flag", "time", "source", "dst:port", "proto", "detail"].map((h) => `<th>${h}</th>`).join("")}</tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
    <p class="tbl-foot">198.51.100.0/24 = TEST-NET-2 (external/synthetic) · 10.20.x.x = internal</p>`,
    { right: `<span class="cl-mono" style="font-size:9px;color:#8fa096">flag every suspicious row</span>` });
}

function alertsPanelHTML() {
  const judge = Store.s.judge;
  const cards = JUDGE_EVENTS.map((e) => {
    const v = judge[e.id];
    // QA fix kept from the original: a selected TRUE POSITIVE is an attack alert
    // (amber) — red is reserved for wrong answers, not for "you found the attack".
    const btn = (opt) => {
      const sel = v === opt;
      const col = sel ? (opt === "tp" ? "#FFB224" : "#4ADE80") : "#2a332d";
      return `<button type="button" class="judge-btn cl-focus" data-act="judge" data-id="${e.id}" data-val="${opt}" aria-pressed="${sel}"
        style="border-color:${col};background:${sel ? (opt === "tp" ? "#FFB22414" : "#4ADE8014") : "transparent"};color:${sel ? col : "#d9e2dc"}">${opt === "tp" ? "true positive" : "false positive"}</button>`;
    };
    return `<div class="judge-card">
      <p class="judge-alert">${esc(e.alert)}</p>
      <p class="judge-ctx">${esc(e.context)}</p>
      <div class="judge-btns">${btn("tp")}${btn("fp")}</div>
    </div>`;
  }).join("");
  return ConsolePanel("alerts · judge true vs false positive", "#FFB224",
    `<div style="display:flex;flex-direction:column;gap:8px">${cards}</div>`,
    { right: `<span style="display:inline-flex;color:#8fa096">${I("Scale", "ic-3_5")}</span>` });
}

function vpnLogPanelHTML() {
  const rows = VPN_SESSIONS.map((s2) => `<tr>
      <td style="color:#d9e2dc">${s2.sid}</td>
      <td style="color:${s2.type === "client" ? "#FFB224" : "#45D6C4"}">${s2.type}</td>
      <td class="cl-dim">${s2.user}</td>
      <td class="cl-dim">${s2.role}</td>
      <td style="color:${s2.tunnel === "split" ? "#FF5C5C" : "#4ADE80"}">${s2.tunnel}</td>
      <td class="cl-dim">${s2.acl.length ? esc(s2.acl.join(", ")) : "—"}</td>
      <td class="cl-dim">${s2.src}</td>
      <td class="cl-dim">${s2.since}</td>
      <td class="cl-dim">${s2.note ? esc(s2.note) : "—"}</td>
    </tr>`).join("");
  return ConsolePanel("vpn_sessions · last night's tunnels", "#FFB224", `
    <div class="tbl-wrap"><table class="tbl" style="min-width:680px">
      <thead><tr>${["sid", "type", "user", "role", "tunnel", "split acl", "source", "up since", "note"].map((h) => `<th>${h}</th>`).join("")}</tr></thead>
      <tbody>${rows}</tbody>
    </table></div>`);
}

function apiAuditPanelHTML() {
  const rows = API_AUDIT.rows.map((r) => `<tr>
      <td class="cl-dim">${r.ts}</td>
      <td style="color:#d9e2dc">${esc(r.token)}</td>
      <td style="color:${r.ip.startsWith("198.51.100") ? "#FF5C5C" : "#d9e2dc"}">${r.ip}</td>
      <td class="cl-dim">${esc(r.endpoint)}</td>
      <td style="color:#4ADE80">${esc(r.result)}</td>
    </tr>`).join("");
  return ConsolePanel("api_audit.json · controller calls overnight", "#45D6C4", `
    <div class="tbl-wrap"><table class="tbl" style="min-width:620px">
      <thead><tr>${["ts", "token", "source ip", "endpoint", "result"].map((h) => `<th>${h}</th>`).join("")}</tr></thead>
      <tbody>${rows}</tbody>
    </table></div>`);
}

function sshNegotiationPanelHTML() {
  return ConsolePanel("ssh_negotiation.log · legacy vendor switch", "#4ADE80", `
    <div style="border:1px solid var(--line);border-radius:6px;background:#0d100e;padding:10px">
      <pre class="cl-mono" style="margin:0;white-space:pre-wrap;font-size:10.5px;line-height:1.625;color:#4ADE80">${esc(SSH_NEGOTIATION.lines.join("\n"))}</pre>
    </div>
    <ul style="margin-top:8px;list-style:none;display:flex;flex-direction:column;gap:4px">
      ${SSH_NEGOTIATION.facts.map((f) => `<li style="font-size:12px;line-height:1.625;color:#8fa096">· ${esc(f)}</li>`).join("")}
    </ul>
    <div class="grid-3" style="margin-top:12px">
      ${AnswerField("h8_banner", "server version banner", { options: [
        { value: "1.99", label: "SSH-1.99" },
        { value: "2.0", label: "SSH-2.0" },
        { value: "3.0", label: "SSH-3.0" },
      ] })}
      ${AnswerField("h8_cipher", "negotiated cipher", { options: [
        { value: "3des-cbc", label: "3des-cbc" },
        { value: "aes256-ctr", label: "aes256-ctr" },
        { value: "chacha20", label: "chacha20-poly1305" },
      ] })}
      ${AnswerField("h8_key", "host key bits", { options: [
        { value: "1024", label: "1024" },
        { value: "768", label: "768" },
        { value: "2048", label: "2048" },
      ] })}
    </div>`);
}

function triagePanelHTML() {
  return ConsolePanel("objective H1 · night-shift triage (exact values)", "#FF5C5C", `
    <p class="cl-mono" style="margin-bottom:8px;font-size:11px;line-height:1.625;color:#8fa096">
      Cross-reference auth_access, the config audit and the topology. Name the abused channel, the
      source IP, and the device. Two items in the evidence are noise — don't cite them.</p>
    <div class="grid-3">
      ${AnswerField("h1_channel", "channel abused", { options: [
        { value: "telnet", label: "Telnet" },
        { value: "ssh", label: "SSH" },
        { value: "gui", label: "Web GUI" },
        { value: "api", label: "API" },
        { value: "console", label: "Console" },
      ] })}
      ${AnswerField("h1_ip", "source ip", { placeholder: "0.0.0.0" })}
      ${AnswerField("h1_device", "device", { placeholder: "DEVICE-NAME" })}
    </div>`);
}

function vpnForensicsPanelHTML() {
  return ConsolePanel("objective H2 · vpn policy forensics", "#FF5C5C", `
    <p class="cl-mono" style="margin-bottom:8px;font-size:11px;line-height:1.625;color:#8fa096">
      Policy: contractors connect FULL tunnel. Find the violating session ID, its tunnel mode, and
      the protocol carrying the HQ↔Yard 7 site-to-site tunnel (topology doc has it).</p>
    <div class="grid-3">
      ${AnswerField("h2_sid", "violating session id", { placeholder: "V-____" })}
      ${AnswerField("h2_tunnel", "its tunnel mode", { options: [
        { value: "full", label: "full" },
        { value: "split", label: "split" },
        { value: "always-on", label: "always-on" },
      ] })}
      ${AnswerField("h2_proto", "site-to-site protocol", { options: [
        { value: "ipsec", label: "IPsec" },
        { value: "tls", label: "TLS" },
        { value: "gre", label: "GRE" },
      ] })}
    </div>`);
}

function apiForensicsPanelHTML() {
  return ConsolePanel("objective H7 · api token abuse", "#FF5C5C", `
    <p class="cl-mono" style="margin-bottom:8px;font-size:11px;line-height:1.625;color:#8fa096">
      One NOC token speaks from two source IPs — and the second host called /config/deploy. Name the
      token, the offending IP, and the immediate fix.</p>
    <div class="grid-3">
      ${AnswerField("h7_token", "compromised token", { placeholder: "tkn_…" })}
      ${AnswerField("h7_ip", "offending source ip", { placeholder: "0.0.0.0" })}
      ${AnswerField("h7_fix", "immediate fix", { options: [
        { value: "rotate", label: "Rotate/revoke it immediately" },
        { value: "leave", label: "Leave it for the quarterly review" },
        { value: "rename", label: "Rename the token in the repo" },
        { value: "disable-api", label: "Disable the API permanently" },
      ] })}
    </div>`);
}

// RecoveryPanel — seeded Fisher–Yates shuffle (R6): the display order is
// re-shuffled on "clear + reshuffle" so a fixed order can never hint.
function shuffledRecoverySteps() {
  const arr = [...RECOVERY_STEPS];
  let seed = 42 + shufSeed * 7919;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function recoveryPanelHTML() {
  const order = Store.s.h3Order;
  const reach = Store.s.h3Reach;
  const ordered = order.map((id, i) => {
    const step = RECOVERY_STEPS.find((s2) => s2.id === id);
    return `<li>${i + 1}. ${esc(step.text)}</li>`;
  }).join("");
  const steps = shuffledRecoverySteps().map((s2) => {
    const used = order.includes(s2.id);
    return `<button type="button" class="step-btn cl-focus" data-act="recovery-push" data-val="${s2.id}"${used ? " disabled" : ""}>${esc(s2.text)}</button>`;
  }).join("");
  const reachBtns = REACH_OPTIONS.map((o) => {
    const on = reach.includes(o.id);
    return `<button type="button" class="cl-focus" data-act="reach-toggle" data-val="${o.id}" aria-pressed="${on}"
      style="display:flex;min-height:44px;align-items:center;gap:8px;border:1px solid ${on ? "#FF7A4566" : "#2a332d"};border-radius:4px;padding:6px 8px;text-align:left;font-family:var(--font-mono);font-size:11px;color:${on ? "#FF7A45" : "#d9e2dc"};background:transparent">
      <span style="display:flex;width:14px;height:14px;align-items:center;justify-content:center;border:1px solid ${on ? "#FF7A45" : "#2a332d"};border-radius:2px;background:${on ? "#FF7A45" : "transparent"};font-size:8px;color:#0b0d0c" aria-hidden="true">${on ? "✓" : ""}</span>
      ${esc(o.label)}
    </button>`;
  }).join("");
  return ConsolePanel("objective H3 · storm recovery plan", "#FF5C5C", `
    <div class="recovery-grid">
      <div>
        <div style="margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;gap:8px">
          ${SectionLabel(`<span style="display:inline-flex;align-items:center;gap:4px">${I("ListOrdered", "ic-3")} click steps in the correct order</span>`, "#8fa096")}
          <button type="button" class="btn-clear cl-focus" data-act="recovery-clear" data-fid="recovery-clear">${I("Trash2", "ic-3")} clear + reshuffle</button>
        </div>
        <ol class="order-list">${ordered}</ol>
        <div class="step-list">${steps}</div>
      </div>
      <div>
        ${SectionLabel("during the HQ↔Yard7 outage — tick every path that STILL WORKS from the NOC", "#8fa096")}
        <div class="reach-list">${reachBtns}</div>
      </div>
    </div>`);
}

function detectionPanelHTML() {
  const det = Store.s.detection;
  const sel = (k, label, opts2) => `
    <label style="display:flex;flex-direction:column;gap:4px">
      <span class="fld-label">${esc(label)}</span>
      <select class="fld-select cl-focus" style="width:100%" data-change="detect-${k}" data-fid="det-${k}" aria-label="Detection ${esc(label)}">
        <option value="">— select —</option>
        ${opts2.map((o) => `<option value="${o.id}"${det[k] === o.id ? " selected" : ""}>${esc(o.label)}</option>`).join("")}
      </select>
    </label>`;
  const label = (list, cur) => esc(list.find((o) => o.id === cur)?.label ?? "?");
  return ConsolePanel("objective H5 · detection builder", "#FFB224", `
    <p class="cl-mono" style="margin-bottom:8px;font-size:11px;line-height:1.625;color:#8fa096">
      Assemble the rule that catches any future Telnet use or SSH brute force — source, condition,
      action — then judge alerts A1 and A2 with it.</p>
    <div class="det-grid">
      ${sel("source", "log source", DETECT_OPTIONS.source)}
      ${sel("condition", "match condition", DETECT_OPTIONS.condition)}
      ${sel("action", "action", DETECT_OPTIONS.action)}
    </div>
    <div class="det-rule"><p>rule: IF source = ${label(DETECT_OPTIONS.source, det.source)} AND
      condition = ${label(DETECT_OPTIONS.condition, det.condition)} THEN
      action = ${label(DETECT_OPTIONS.action, det.action)}</p></div>`);
}

// ── CONFIG tab ──────────────────────────────────────────────────────────────
function configAuditPanelHTML() {
  const flags = Store.s.configFlags;
  // QA fix (giveaway removal): "why" explanations are POST-check feedback — they
  // unlock only after CHECK RESULTS ran on M4 (or H4 in hard mode).
  const showWhy = Store.s.objectives["M4"] !== undefined || Store.s.objectives["H4"] !== undefined;
  const lines = RUNNING_CONFIG.map((l) => {
    const on = flags.includes(l.id);
    return `<button type="button" class="cfg-line cl-focus${on ? " flagged" : ""}" data-act="flag-toggle" data-key="configFlags" data-val="${l.id}" aria-pressed="${on}" aria-label="Flag config line: ${esc(l.text)}">
      ${I("Flag", "ic-3 flag-ic")}<span>${esc(l.text)}</span>
    </button>`;
  }).join("");
  const whys = showWhy
    ? RUNNING_CONFIG.filter((l) => l.insecure && flags.includes(l.id)).map((l) => `<p>↳ ${esc(l.why)}</p>`).join("")
    : flags.length > 0
      ? `<p class="flag-note">press CHECK RESULTS on objective M4 to unlock line-by-line explanations</p>`
      : "";
  return ConsolePanel("running-config excerpt · hq-core-sw01", "#C4A7FF", `
    <div class="cfg-block" role="group" aria-label="Config lines, flag insecure ones">${lines}</div>
    <div class="why-lines">${whys}</div>`,
    { right: `<span class="cl-mono" style="font-size:9px;color:#8fa096">click lines to flag — there are 5 findings</span>` });
}

// ── MATRIX tab ──────────────────────────────────────────────────────────────
function matrixPanelHTML() {
  const matrix = Store.s.matrix;
  const rows = MATRIX_TASKS.map((t) => `
    <div class="matrix-row">
      <p><span class="tid">${t.id}</span> · ${esc(t.text)}</p>
      <select class="cl-focus" data-change="matrix" data-id="${t.id}" data-fid="matrix-${t.id}" aria-label="Method for task ${t.id}">
        <option value="">— method —</option>
        ${MATRIX_METHODS.map((m) => `<option value="${m.id}"${matrix[t.id] === m.id ? " selected" : ""}>${esc(m.label)}</option>`).join("")}
      </select>
    </div>`).join("");
  const hint = Store.s.mode === "medium"
    ? `<p class="tbl-foot" style="margin-top:8px">hint: reachability · scale · interaction style</p>`
    : "";
  return ConsolePanel("objective M11 · access-method decision matrix", "#C4A7FF", `
    <p class="cl-mono" style="margin-bottom:8px;font-size:11px;line-height:1.625;color:#8fa096">
      Six operational tickets, six methods — one best fit each. The exam pairs symptoms with methods
      exactly like this.</p>
    <div style="display:flex;flex-direction:column;gap:8px">${rows}</div>${hint}`);
}

function policyReviewPanelHTML() {
  const matrixH = Store.s.matrixH;
  const cards = H6_PERSONAS.map((p) => {
    const row = matrixH[p.id] ?? { method: null, control: null };
    const sel = (key, label, opts2) => `
      <select class="cl-focus" data-change="matrix-h" data-id="${p.id}" data-key="${key}" data-fid="mh-${p.id}-${key}" aria-label="${esc(label)} for persona ${p.id}">
        <option value="">— ${label} —</option>
        ${opts2.map((o) => `<option value="${o.id}"${row[key] === o.id ? " selected" : ""}>${esc(o.label)}</option>`).join("")}
      </select>`;
    return `<div class="h6-card">
      <p><span class="pid">${p.id}</span> · ${esc(p.text)}</p>
      <div class="h6-selects">
        ${sel("method", "method", H6_METHODS)}
        ${sel("control", "control package", H6_CONTROLS)}
      </div>
    </div>`;
  }).join("");
  return ConsolePanel("objective H6 · access policy review (method + control)", "#C4A7FF", `
    <p class="cl-mono" style="margin-bottom:8px;font-size:11px;line-height:1.625;color:#8fa096">
      For each persona pick the access method AND the control package an auditor would sign off.</p>
    <div style="display:flex;flex-direction:column;gap:8px">${cards}</div>`);
}

// ── DOCS / MANUAL / GLOSSARY / NOTES tabs ───────────────────────────────────
function docsPanelHTML() {
  const docs = [
    { title: "doc · network topology", color: "#45D6C4", body: TOPOLOGY_DOC },
    { title: "doc · noc api readme", color: "#45D6C4", body: API_README },
    { title: "doc · night-shift incident brief", color: "#FF7A45", body: INCIDENT_BRIEF },
  ];
  return `<div class="stack">${docs.map((d) =>
    ConsolePanel(d.title, d.color, `<pre class="doc-pre cl-scroll">${esc(d.body)}</pre>`, { p0: true })
  ).join("")}</div>`;
}

function manualPanelHTML() {
  return `<div class="stack" aria-label="Field manual">
    <div class="manual-intro">
      ${SectionLabel("knowledge core · field manual", "#FFB224")}
      <p>The full lesson explainer. Read it any time — every workspace teaches the same concepts by
        doing.</p>
    </div>
    ${MANUAL.map((sec) => ConsolePanel(sec.title, "#FFB224",
      `<div class="manual-sec">${sec.body.map((p) => `<p>${esc(p)}</p>`).join("")}</div>`)).join("")}
  </div>`;
}

function glossaryPanelHTML() {
  return ConsolePanel("glossary · 17 terms", "#45D6C4", `
    <dl class="gloss-grid">
      ${GLOSSARY.map((g) => `<div class="gloss-item"><dt>${esc(g.term)}</dt><dd>${esc(g.def)}</dd></div>`).join("")}
    </dl>`);
}

function notesPanelHTML() {
  const det = FIELD_NOTES.detection.map((d) => `
    <div class="det-row">
      <p class="src">${I("FileText", "ic-3_5")} ${esc(d.src)}</p>
      <p class="logic">alert when ${esc(d.logic)}</p>
    </div>`).join("");
  const mit = FIELD_NOTES.mitigation.map((m) => `
    <li>${I("ShieldCheck", "ic-3_5", "color:#4ADE80")}<span><span class="mid">${m.id}</span> — ${esc(m.text)}</span></li>`).join("");
  const take = (items, icon, color) => items.map((b) => `<li>${I(icon, "ic-3_5", `color:${color}`)}<span>${esc(b)}</span></li>`).join("");
  const links = FIELD_NOTES.links.map((l) => `
    <a class="ext-link cl-focus" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${I("ExternalLink", "ic-3_5")} ${esc(l.label)}</a>`).join("");
  return `<div class="stack" aria-label="Field notes — debrief">
    <div class="notes-intro">
      ${SectionLabel("field notes · synthesis (C6)", "#FFB224")}
      <p>Detection opportunities, mitigation map, and the two mindsets — plus YOUR notes, saved
        automatically to this browser.</p>
    </div>
    ${ConsolePanel("your field notes · saved as you type", "#FFB224", `
      <label class="sr-only" for="student-field-notes">Your field notes (saved automatically)</label>
      <textarea id="student-field-notes" class="notes-area cl-focus" rows="5" data-input="notes" data-fid="notes"
        aria-label="Your field notes (saved automatically)"
        placeholder="e.g. M8 — flag the 198.51.100.77 Telnet session; OOB console = TERM-SRV01 S2; contractors = full tunnel + MFA…">${esc(Store.s.notes)}</textarea>
      <p class="tbl-foot">persisted with your shift — survives reload, cleared by RESET</p>`)}
    ${ConsolePanel("detection opportunities · data sources + logic", "#FFB224",
      `<div style="display:flex;flex-direction:column;gap:8px">${det}</div>`)}
    ${ConsolePanel("mitigation map · controls", "#4ADE80", `<ul class="mit-list">${mit}</ul>`)}
    <div class="grid-2-lg">
      ${ConsolePanel("blue-team takeaways", "#45D6C4", `<ul class="take-list">${take(FIELD_NOTES.blue, "ShieldCheck", "#45D6C4")}</ul>`)}
      ${ConsolePanel("red-team mindset (defensive)", "#FF5C5C", `<ul class="take-list">${take(FIELD_NOTES.red, "Bug", "#FF5C5C")}</ul>`)}
    </div>
    ${ConsolePanel("exam-day pointers · n10-009", "#C4A7FF", `<ul class="take-list">${take(FIELD_NOTES.examTips, "GraduationCap", "#C4A7FF")}</ul>`)}
    ${ConsolePanel("official references (opens in new tab)", "#8fa096", `<div class="link-list">${links}</div>`)}
    ${ConsolePanel("bench-to-manual bridge", "#8fa096", `
      <p class="bridge-note">${I("Wrench", "ic-3_5", "color:#8fa096")}<span>The rack bench controls mirror the FIELD MANUAL “SSH vs Telnet” section 1:1 — and the
        decision matrix mirrors “Console &amp; OOB”. If an objective feels opaque, the manual
        section named in its feedback is the shortest path back.</span></p>`)}
    <p class="lesson-tag">${I("BookOpen", "ic-3")} lesson label per curriculum: lesson 3.8 · maps to n10-009 objective 3.5 network access</p>
  </div>`;
}

function evidenceBodyHTML(tab) {
  const hard = Store.s.mode === "hard";
  if (tab === "logs") {
    return `<div class="stack">
      ${hard ? triagePanelHTML() : ""}
      ${accessLogPanelHTML()}
      ${alertsPanelHTML()}
      ${hard ? `${vpnForensicsPanelHTML()}${apiForensicsPanelHTML()}${recoveryPanelHTML()}${detectionPanelHTML()}` : ""}
      ${vpnLogPanelHTML()}
      ${apiAuditPanelHTML()}
      ${sshNegotiationPanelHTML()}
    </div>`;
  }
  if (tab === "config") return `<div class="stack">${configAuditPanelHTML()}</div>`;
  if (tab === "matrix") return `<div class="stack">${matrixPanelHTML()}${hard ? policyReviewPanelHTML() : ""}</div>`;
  if (tab === "docs") return docsPanelHTML();
  if (tab === "manual") return manualPanelHTML();
  if (tab === "glossary") return glossaryPanelHTML();
  return notesPanelHTML();
}

function renderEvidence() {
  const el = slot("evidence-slot");
  if (!el) return;
  const tabs = EVIDENCE_TABS.map((t) => {
    const on = evidenceTab === t.id;
    return `<button type="button" role="tab" id="evidence-tab-${t.id}" aria-selected="${on}" aria-controls="evidence-tabpanel"
      class="tab cl-focus" data-act="evidence-tab" data-val="${t.id}" data-fid="evtab-${t.id}"
      style="border-color:${on ? "#FFB224" : "transparent"};background:${on ? "#FFB22414" : "transparent"};color:${on ? "#FFB224" : "#8fa096"}">
      ${I(t.icon, "ic-3_5")} ${t.label}
    </button>`;
  }).join("");
  el.innerHTML = `<section class="evidence" aria-label="Evidence drawer">
    <div role="tablist" aria-label="Evidence sections" class="tabs cl-scroll">
      ${tabs}
      <span class="tabs-note cl-mono">synthetic evidence · lesson 3.8 access &amp; mgmt</span>
    </div>
    <div id="evidence-tabpanel" role="tabpanel" aria-labelledby="evidence-tab-${evidenceTab}" class="tabpanel cl-scroll anim-tab">
      ${evidenceBodyHTML(evidenceTab)}
    </div>
  </section>`;
  bindAnswers(el); // evidence panels contain [data-answer] fields (H1/H2/H7/H8)
}

// ═════════════════════════════════════════════════════════════════════════════
// Wrap-up quiz (QuizModal.tsx) — R2 answer locks, R3 color contract, R7 ESC.
// ═════════════════════════════════════════════════════════════════════════════
function quizBank() {
  return Store.s.mode === "hard" ? QUIZ_HARD : QUIZ_MEDIUM;
}
function currentQuizItem() {
  const bank = quizBank();
  return bank[Math.min(quizIdx, bank.length - 1)];
}

function renderQuiz() {
  const el = slot("quiz-slot");
  if (!el) return;
  const s = Store.s;
  // React parity: QuizModal stays mounted across close/reopen (it renders null),
  // so quizIdx PERSISTS — reopening resumes at the question you left off. Only a
  // phase switch (renderRoot lastPhase reset) starts the quiz back at question 1.
  prevQuizOpen = s.quizOpen;
  if (!s.quizOpen || !s.mode) { el.innerHTML = ""; return; }
  const bank = quizBank();
  const idx = Math.min(quizIdx, bank.length - 1);
  const item = bank[idx];
  const chosen = s.quizPicked[item.id];
  const answered = chosen !== undefined;
  const correct = chosen === item.correct;
  const score = bank.filter((q) => s.quizPicked[q.id] === q.correct).length;
  const answeredCount = bank.filter((q) => s.quizPicked[q.id] !== undefined).length;
  const finished = answeredCount === bank.length;
  const opts = item.options.map((o, i) => {
    const isPicked = chosen === i;
    // R3 color contract: green ONLY on a correctly-picked option, red ONLY on a
    // wrongly-picked option. Unpicked options stay neutral — no answer reveal.
    const col = answered && isPicked ? (correct ? "#4ADE80" : "#FF5C5C") : "#2a332d";
    const mark = answered && isPicked
      ? (correct ? I("CheckCircle2", "ic-4", "color:#4ADE80") : I("XCircle", "ic-4", "color:#FF5C5C"))
      : "";
    const aria = answered && isPicked
      ? (correct ? "Your answer — correct" : "Your answer — wrong")
      : `Option ${i + 1}`;
    return `<button type="button" class="quiz-opt cl-focus" data-act="quiz-pick" data-val="${i}" data-fid="qopt-${i}"${answered ? " disabled" : ""}
      aria-pressed="${isPicked}" aria-label="${aria}"
      style="border-color:${col};background:${col === "#2a332d" ? "transparent" : col + "14"};color:#d9e2dc">
      ${mark}${esc(o)}
    </button>`;
  }).join("");
  const feedback = answered
    ? `<div role="status" class="quiz-feedback" style="border-color:${correct ? "#4ADE8055" : "#FF5C5C55"};background:${correct ? "#4ADE8010" : "#FF5C5C10"};color:${correct ? "#c9e8d6" : "#f0c9c9"}">
        <b>${correct ? "correct" : "not quite"} — why:</b><br />${esc(item.why)}
      </div>`
    : "";
  const navMid = idx < bank.length - 1
    ? `<button type="button" class="quiz-next cl-focus" data-act="quiz-next" data-fid="quiz-next"${answered ? "" : " disabled"}
        title="${answered ? "Next question" : "Answer this question first"}">next ${I("ArrowRight", "ic-3_5")}</button>`
    : `<span class="quiz-final">${finished ? `final score ${score}/${bank.length}` : "answer this question to finish"}</span>`;
  el.innerHTML = `<div class="overlay" role="dialog" aria-modal="true" aria-label="Wrap-up quiz">
    <div class="quiz-panel anim-pop">
      <div class="quiz-top">
        ${SectionLabel(`<span style="display:inline-flex;align-items:center;gap:6px">${I("GraduationCap", "ic-3_5")} wrap-up quiz · ${s.mode === "hard" ? "scenario application" : "concept check"}</span>`, "#FFB224")}
        <span class="quiz-count">${answeredCount}/${bank.length} answered · ${score} correct</span>
      </div>
      <p class="quiz-qmeta">question ${idx + 1} / ${bank.length} · topic: ${esc(item.topic)}</p>
      <h2 class="quiz-q">${esc(item.q)}</h2>
      <div class="quiz-opts" role="group" aria-label="Answer options">${opts}</div>
      ${feedback}
      <div class="quiz-nav">
        <button type="button" class="quiz-nav-btn cl-focus" data-act="quiz-prev" data-fid="quiz-prev"${quizIdx === 0 ? " disabled" : ""}>${I("ArrowLeft", "ic-3_5")} prev</button>
        ${navMid}
        <button type="button" class="quiz-nav-btn quiz-close cl-focus" data-act="quiz-close" data-fid="quiz-close">close ${finished ? "· keep score" : "· resume later"}</button>
      </div>
    </div>
  </div>`;
}

// ═════════════════════════════════════════════════════════════════════════════
// Completion report (CompletionModal.tsx) — R8 focus areas from real evidence.
// ═════════════════════════════════════════════════════════════════════════════
function deriveFocusAreas(defs, objectives, hints, quizPicked, bank) {
  const areas = [];
  // 1. Objectives still open — name the exact anchor and where to work.
  const undone = defs.filter((d) => !objectives[d.id]?.done);
  for (const d of undone.slice(0, 4)) {
    areas.push({
      title: `${d.tag} (objective ${d.id} open)`,
      detail: `Work it in the lab: ${d.pointer} The field manual's "${d.tag}" section is the shortest path back.`,
    });
  }
  // 2. Objectives that needed retries — concepts confirmed but shaky.
  const retried = defs.filter((d) => {
    const o = objectives[d.id];
    return o?.done && !o.firstAttempt;
  });
  if (retried.length) {
    areas.push({
      title: `Needed a second attempt: ${retried.map((d) => d.tag).join(", ")}`,
      detail: "The concepts held after feedback — re-read the manual section for each anchor and re-run its objective once more until the first answer is reflexive.",
    });
  }
  // 3. Quiz topics missed or skipped.
  const missed = bank.filter((q) => quizPicked[q.id] !== undefined && quizPicked[q.id] !== q.correct);
  if (missed.length) {
    areas.push({
      title: `Quiz topics missed: ${missed.map((q) => q.topic).join(", ")}`,
      detail: "Re-read the manual card that matches each topic, then re-take the wrap-up quiz — the explanations under every option show why the tempting answers fail.",
    });
  }
  const skipped = bank.filter((q) => quizPicked[q.id] === undefined);
  if (skipped.length) {
    areas.push({
      title: `Quiz unfinished: ${skipped.length} of ${bank.length} scenario items unanswered`,
      detail: `Open the wrap-up quiz and answer the remaining items — topics: ${skipped.map((q) => q.topic).join(", ")}.`,
    });
  }
  // 4. Hint dependency.
  const hintIds = defs.filter((d) => (hints[d.id] ?? 0) > 0);
  if (hintIds.length) {
    areas.push({
      title: `Hints used on: ${hintIds.map((d) => d.tag).join(", ")}`,
      detail: "Each hint spent star rating. Re-do those objectives from scratch without hints — if one still stumbles, that anchor goes on your revision list.",
    });
  }
  // 5. Clean run — still actionable.
  if (!areas.length) {
    areas.push({
      title: "Clean sweep — keep it sharp",
      detail: "Every objective passed first try with no hints and every quiz topic correct. Drill for exam speed: run the decision matrix (symptom → method) against a timer, and re-test yourself on ports (SSH 22 / Telnet 23) and tunnel modes (full vs split) until they are reflexive.",
    });
  }
  return areas;
}

function renderReport() {
  const el = slot("report-slot");
  if (!el) return;
  const s = Store.s;
  if (!s.completedShown || !s.mode) { el.innerHTML = ""; return; }
  const defs = objectivesFor(s.mode);
  const m = metricsFor(s.mode, { objectives: s.objectives, hints: s.hints }, defs);
  const bank = s.mode === "hard" ? QUIZ_HARD : QUIZ_MEDIUM;
  const qScore = quizScore(s.quizPicked, bank);
  const focusAreas = deriveFocusAreas(defs, s.objectives, s.hints, s.quizPicked, bank);
  const grade = m.completion >= 1 ? "shift complete" : "shift in progress";
  const stat = (label, value, sub) => `
    <div class="stat"><p class="l1">${label}</p><p class="l2">${value}</p><p class="l3">${sub}</p></div>`;
  const recap = ["P1", "P2", "P3", "P4"].map((p) => {
    const items = defs.filter((d) => d.pillar === p);
    const done = items.filter((d) => s.objectives[d.id]?.done).length;
    const lis = items.map((d) => `
      <li><span style="color:${s.objectives[d.id]?.done ? "#4ADE80" : "#5c665f"}">${s.objectives[d.id]?.done ? "✓" : "○"}</span>
        <span class="cl-dim"><span class="oid">${d.id}</span> ${esc(d.tag)}</span></li>`).join("");
    return `<div class="recap-card"><p class="head">${PILLAR_LABEL[p]} · ${done}/${items.length}</p><ul>${lis}</ul></div>`;
  }).join("");
  const focus = focusAreas.map((a) => `<li><p class="t">${esc(a.title)}</p><p class="d">${esc(a.detail)}</p></li>`).join("");
  const links = FIELD_NOTES.links.map((l) => `
    <a class="ext-link cl-focus" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${I("ArrowRight", "ic-3")} ${esc(l.label)}</a>`).join("");
  el.innerHTML = `<div class="overlay report-bg" role="dialog" aria-modal="true" aria-label="Shift debrief and completion">
    <div class="report-panel anim-pop2">
      <div class="report-top">
        <div>
          ${SectionLabel(`${ORG.lab} · end-of-shift report`, "#FFB224")}
          <h2 class="report-grade">${I("Trophy", "ic-6", "color:#FFB224")} ${grade}</h2>
          <p class="report-sub">${s.mode === "hard" ? "storm watch · hard" : "standard shift · medium"} · ${esc(ORG.cert.split("·")[0])}</p>
        </div>
        ${Stars(m.stars)}
      </div>
      <div class="stat-grid">
        ${stat("objectives", `${m.done}/${m.total}`, `${Math.round(m.completion * 100)}% complete`)}
        ${stat("first-attempt rate", `${Math.round(m.firstAttemptRate * 100)}%`, "accuracy + hints")}
        ${stat("quiz", `${qScore}%`, `${bank.filter((q) => s.quizPicked[q.id] === q.correct).length}/${bank.length} correct`)}
      </div>
      <div class="focus-box">
        ${SectionLabel(`<span style="display:inline-flex;align-items:center;gap:6px">${I("Crosshair", "ic-3_5")} focus areas · from your shift evidence</span>`, "#FF7A45")}
        <ul class="focus-list">${focus}</ul>
      </div>
      <div class="recap">
        ${SectionLabel("objective recap · grouped by mastery pillar", "#45D6C4")}
        <div class="recap-grid">${recap}</div>
      </div>
      <div class="learn-box">
        ${SectionLabel(`<span style="display:inline-flex;align-items:center;gap:6px">${I("BookOpen", "ic-3_5")} what to learn next</span>`, "#C4A7FF")}
        <ul>
          <li>· Reinforce with the official objective list — this lab covered access &amp; management
            (official N10-009 objective 3.5). Next stops: SNMP/Syslog monitoring (3.2) and device
            security controls (4.3).</li>
          <li>· Drill the method-selection reflex until it's automatic: outage → console/OOB;
            fleet → API; one user → client VPN; interactive CLI → SSH; two networks → site-to-site.</li>
          <li>· For detection depth, extend today's rules: alert on any management session from a
            non-management subnet, and on config drift against a known-good baseline.</li>
        </ul>
        <div class="report-links">${links}</div>
      </div>
      <div class="report-actions">
        <button type="button" class="btn-keep cl-focus" data-act="report-continue" data-fid="report-continue">${m.completion >= 1 ? "keep polishing" : "back to work"}</button>
        <button type="button" class="btn-closereport cl-focus" data-act="report-close" data-fid="report-close">close report</button>
      </div>
    </div>
  </div>`;
}

// ═════════════════════════════════════════════════════════════════════════════
// Event delegation — one listener set per event type (classic-scripts equivalent
// of React's synthetic events). Rebuilt DOM never needs re-binding.
// ═════════════════════════════════════════════════════════════════════════════
function onClick(e) {
  const target = e.target instanceof Element ? e.target : null;
  const el = target ? target.closest("[data-act],[data-hint]") : null;
  if (!el) {
    // R7: clicking the report backdrop closes the report (re-openable via END SHIFT).
    if (target && target.classList.contains("overlay") && target.classList.contains("report-bg") && Store.s.completedShown) {
      Store.closeReport();
    }
    return;
  }
  const act = el.getAttribute("data-act");
  const val = el.getAttribute("data-val");
  if (act === null) {
    // [data-hint] — per-objective hint reveal (HintBox in ui.js).
    const id = el.getAttribute("data-hint");
    if (id) Store.revealHint(id);
    return;
  }
  switch (act) {
    // ── phase router ──
    case "choose-mode": Store.chooseMode(val); break;
    case "enter-lab": Store.enterLab(); break;
    case "back-intro": Store.setPhase("intro"); break;
    // ── status bar ──
    case "run-storm": Store.runStorm(); break;
    case "toggle-quiz": Store.patch({ quizOpen: !Store.s.quizOpen }); break;
    case "end-shift": Store.finishShift(); break;
    case "open-reset": resetOpen = true; renderReset(); break;
    case "reset-cancel": resetOpen = false; renderReset(); break;
    case "reset-confirm": resetOpen = false; Store.resetAll(); break;
    // ── patch bay ──
    case "jack": Store.setBay(val); break;
    // ── ledger ──
    case "check": Store.checkObjective(val); break;
    // ── VPN channel ──
    case "cls": Store.updateVpn({ [el.getAttribute("data-id")]: val }); break;
    case "persona": Store.updateVpn({ persona: val }); break;
    // Switching to FULL clears the split ACL (VpnChannel.tsx 1:1).
    case "vpn-mode": Store.updateVpn({ mode: val, acl: val === "full" ? [] : Store.s.vpn.acl }); break;
    case "vpn-acl": {
      const on = Store.s.vpn.acl.includes(val);
      Store.updateVpn({ acl: on ? Store.s.vpn.acl.filter((x) => x !== val) : [...Store.s.vpn.acl, val] });
      break;
    }
    case "vpn-mfa": Store.updateVpn({ mfa: !Store.s.vpn.mfa }); break;
    case "vpn-sim": vpnPulse = val; Store.updateVpn({ lastSim: val }); break;
    // ── SSH channel ──
    case "ssh-connect": sshConnect(val); break;
    case "ssh-disconnect":
      Store.set({ sshLoggedIn: false });
      sshLines.push("connection closed.");
      sshPreUpdate();
      scrollTerm("ssh-out");
      break;
    case "telnet-attempt": sshTelnetAttempt(); break;
    // ── GUI channel ──
    case "gui-http": guiHttp = !guiHttp; renderWs(); break;
    // ── API channel ──
    case "api-send": Store.sendApi(); break;
    case "api-fill": Store.set({ api: { ...Store.s.api, token: API_TOKEN } }); break;
    // ── Console channel ──
    case "console-patch": Store.consolePatch(val); break;
    case "console-unpatch": Store.consoleUnpatch(); break;
    // ── Bench channel ──
    case "bench-apply": Store.applyHardening(); break;
    case "bench-toggle": Store.updateHardening({ [val]: !Store.s.hardening[val] }); break;
    // ── Evidence drawer ──
    case "flag-toggle": Store.toggleArrayItem(el.getAttribute("data-key"), val); break;
    case "judge": Store.judgeEvent(el.getAttribute("data-id"), val); break;
    case "recovery-push": Store.pushH3Step(val); break;
    case "recovery-clear": Store.clearH3(); shufSeed += 1; renderEvidence(); break;
    case "reach-toggle": Store.toggleArrayItem("h3Reach", val); break;
    case "evidence-tab": evidenceTab = val; renderEvidence(); break;
    // ── Quiz modal ──
    case "quiz-pick": Store.quizPick(currentQuizItem().id, Number(val)); break;
    case "quiz-prev": quizIdx = Math.max(0, quizIdx - 1); renderQuiz(); break;
    case "quiz-next": quizIdx = quizIdx + 1; renderQuiz(); break;
    case "quiz-close": Store.quizClose(); break;
    // ── Completion report ──
    case "report-continue": Store.enterLab(); break;
    case "report-close": Store.closeReport(); break;
    default: break;
  }
}

function onChange(e) {
  const t = e.target;
  if (!(t instanceof Element)) return;
  // Evidence log row flags (checkboxes carry data-flag, not data-change).
  if (t.hasAttribute("data-flag")) {
    Store.toggleArrayItem(t.getAttribute("data-flag"), t.getAttribute("data-val"));
    return;
  }
  const k = t.getAttribute("data-change");
  if (!k) return;
  const v = t.value;
  switch (k) {
    // ── VPN ──
    case "tech": Store.updateVpn({ tech: v }); break;
    // ── API ──
    case "api-endpoint": Store.set({ api: { ...Store.s.api, endpoint: v } }); break;
    // ── Bench hardening controls ──
    case "bench-transport": Store.updateHardening({ transport: v }); break;
    case "bench-sshver": Store.updateHardening({ sshVersion: v }); break;
    case "bench-keysize": Store.updateHardening({ keySize: Number(v) }); break;
    // ── Detection builder (H5) ──
    case "detect-source": Store.patch({ detection: { ...Store.s.detection, source: v } }); break;
    case "detect-condition": Store.patch({ detection: { ...Store.s.detection, condition: v } }); break;
    case "detect-action": Store.patch({ detection: { ...Store.s.detection, action: v } }); break;
    // ── Decision matrix (M11) / policy review (H6) ──
    case "matrix": Store.patch({ matrix: { ...Store.s.matrix, [t.getAttribute("data-id")]: v } }); break;
    case "matrix-h": {
      const id = t.getAttribute("data-id");
      const key = t.getAttribute("data-key");
      const row = { ...(Store.s.matrixH[id] ?? { method: null, control: null }), [key]: v };
      Store.patch({ matrixH: { ...Store.s.matrixH, [id]: row } });
      break;
    }
    default: break;
  }
}

function onInput(e) {
  const t = e.target;
  if (!(t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement)) return;
  const k = t.getAttribute("data-input");
  if (!k) return;
  if (k === "api-token") {
    // Quiet write: re-rendering per keystroke would fight the caret; the value is
    // already live for SEND (the original re-rendered, with identical visuals).
    Store.set({ api: { ...Store.s.api, token: t.value } }, { silent: true });
  } else if (k === "notes") {
    Store.setNotes(t.value); // silent inside the store, like the original
  }
}

function onSubmit(e) {
  const form = e.target;
  if (!(form instanceof HTMLFormElement) || form.id !== "ssh-form") return;
  e.preventDefault();
  const input = document.getElementById("ssh-in");
  if (!input) return;
  sshRunCommand(input.value);
  input.value = "";
}

function onKeyDown(e) {
  // R7: ESC closes the topmost dialog (quiz → report → reset confirm).
  if (e.key === "Escape") {
    if (Store.s.quizOpen) { Store.quizClose(); return; }
    if (Store.s.completedShown) { Store.closeReport(); return; }
    if (resetOpen) { resetOpen = false; renderReset(); }
    return;
  }
  // F5: keys 1–6 patch channels (ignored while typing in a field).
  if (Store.s.phase !== "lab" || !Store.s.mode) return;
  const t = e.target;
  if (t instanceof HTMLElement && ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) return;
  const n = Number(e.key);
  if (n >= 1 && n <= 6) Store.setBay(BAY_ORDER[n - 1]);
}

// ═════════════════════════════════════════════════════════════════════════════
// Region wiring + boot (LabRoot hydration gate)
// ═════════════════════════════════════════════════════════════════════════════
// Each region mirrors a useLab(selector) subscription: it re-renders its DOM
// slot when one of its state keys changes. Object-valued keys also emit
// "key.subkey" events (Store.set), so "objectives" catches objectives.M1 etc.
function autoDebrief() {
  // LabRoot C7: open the debrief on the TRANSITION to all-complete — never on
  // resume, and only while actually in the lab.
  if (!armed) return;
  const first = prevAllDone === null;
  const prev = prevAllDone;
  prevAllDone = Store.allDone();
  if (!first && prev === false && prevAllDone && Store.s.phase === "lab") Store.finishShift();
}

function bootLab() {
  // zustand persist hydration equivalent (synchronous here).
  Store.hydrate();
  Store.hydrated = true;
  // landOnConsole: a resumed session lands on the console, not on the report.
  if (Store.s.completedShown) Store.patch({ completedShown: false });
  armed = true;
  prevAllDone = null;

  Store.region("root", ["phase", "mode"], renderRoot);
  Store.region("statusbar", ["mode", "storm", "objectives"], renderStatusBar);
  Store.region("bay", ["bay", "storm"], renderBay);
  Store.region("ws", ["bay", "storm", "sshTarget", "sshLoggedIn", "telnetTried",
    "consolePort", "consolePatched", "consoleDevice", "vpn", "hardening", "api"], renderWs);
  Store.region("ledger", ["objectives", "hints"], renderLedger);
  Store.region("evidence", ["configFlags", "logFlags", "judge", "h3Order", "h3Reach",
    "matrix", "matrixH", "detection", "objectives"], renderEvidence);
  Store.region("quiz", ["quizOpen", "quizPicked"], renderQuiz);
  Store.region("report", ["completedShown", "objectives", "hints", "quizPicked"], renderReport);
  Store.region("auto-debrief", ["objectives", "mode", "phase"], autoDebrief);

  document.addEventListener("click", onClick);
  document.addEventListener("change", onChange);
  document.addEventListener("input", onInput);
  document.addEventListener("submit", onSubmit);
  window.addEventListener("keydown", onKeyDown);

  // StatusBar shift clock (the React version re-rendered once per second).
  setInterval(() => {
    const el = document.getElementById("shift-elapsed");
    if (el) el.textContent = elapsedText();
  }, 1000);

  renderRoot();
}

bootLab();
