// ── views.js — HTML renderers for every lab view (1:1 with the original) ────
// Pure string builders reading from LabStore; event wiring lives in app.js.
"use strict";

var U = window.LabUI;
var D = window.LabData;
var OBJ = window.LabObjectives;
var Store = window.LabStore;
var V = U.viewState;

var SHEETS = [
  { name: "01 · SITE BRIEF", short: "BRIEF" },
  { name: "02 · STANDARDS REFERENCE", short: "REFERENCE" },
  { name: "03 · COMMISSIONING BENCH", short: "BENCH" },
  { name: "04 · INSPECTION CHECKLIST", short: "CHECKLIST" },
  { name: "05 · COMMISSIONING EXAM", short: "EXAM" },
  { name: "06 · AS-BUILT NOTES", short: "AS-BUILT" },
];

var BENCH_TABS = [
  { value: "plan", label: "RF PLAN", objs: ["OBJ-M1", "OBJ-M2", "OBJ-M8", "OBJ-M9", "OBJ-H2", "OBJ-H6", "OBJ-H9"] },
  { value: "rack", label: "CONFIG RACK", objs: ["OBJ-M4", "OBJ-M5", "OBJ-M6", "OBJ-M7", "OBJ-H3"] },
  { value: "air", label: "AIR ANALYZER", objs: ["OBJ-M10", "OBJ-M11", "OBJ-H1"] },
  { value: "desk", label: "RESPONSE DESK", objs: ["OBJ-H4", "OBJ-H5", "OBJ-H6", "OBJ-H7", "OBJ-H8"] },
];

// ── Header: progress ring, title block, sheet tabs ───────────────────────────
function progressRing(passed, total) {
  var r = 15, c = 2 * Math.PI * r;
  var frac = total ? passed / total : 0;
  return '<svg width="40" height="40" viewBox="0 0 40 40" role="img" aria-label="Objectives: ' + passed + " of " + total + ' stamped">' +
    '<circle cx="20" cy="20" r="' + r + '" fill="none" stroke="rgba(42,42,36,0.15)" stroke-width="4"></circle>' +
    '<circle cx="20" cy="20" r="' + r + '" fill="none" stroke="#C2410C" stroke-width="4" stroke-linecap="round" ' +
    'stroke-dasharray="' + (c * frac) + " " + c + '" transform="rotate(-90 20 20)"></circle>' +
    '<text x="20" y="24" text-anchor="middle" font-size="10.5" font-weight="700" fill="#2A2A24" class="lab-mono">' + passed + "/" + total + "</text></svg>";
}

function titleBlock() {
  var s = Store.state;
  var progress = Store.progress();
  var quizStats = Store.quizStats();
  var complete = progress.allPassed && s.quizSubmitted;
  var modeLine = s.mode === "hard" ? "MODE: COMMISSIONING TRIAL (HARD)" : "MODE: GUIDED INSTALL (MEDIUM)";
  var signoffAria = "Sign off project — " + progress.passed + " of " + progress.total + " objectives stamped" +
    (s.quizSubmitted ? ", exam " + quizStats.correct + "/" + quizStats.total : ", exam not submitted");
  var tabs = SHEETS.map(function (sh, i) {
    var active = s.sheet === i;
    return '<button type="button" data-act="goto-sheet" data-i="' + i + '" data-fkey="tab-' + i + '"' +
      (active ? ' aria-current="page"' : "") +
      ' class="lab-mono sheet-tab' + (active ? " active" : "") + '">' +
      '<span aria-hidden="true" class="tab-dot' + (active ? " on" : "") + '"></span>' + sh.short + "</button>";
  }).join("");
  return '<header class="tb">' +
    '<div class="tb-inner">' +
    '<div class="tb-title">' +
    '<p class="lab-kicker">Northwind County IT Office · Project 24-B</p>' +
    '<h1 class="lab-mono tb-h1">OVER THE AIR <span class="tb-sub">— wireless commissioning lab</span></h1>' +
    '<p class="lab-mono tb-mode">' + modeLine + "</p>" +
    "</div>" +
    '<div class="tb-meta lab-mono">' +
    "<span>SHEET " + String(s.sheet + 1).padStart(2, "0") + "/06 — " + SHEETS[s.sheet].name + "</span>" +
    "<span>REV A · SCALE NTS · DATA: SYNTHETIC</span>" +
    "</div>" +
    '<div class="tb-meta tb-approve lab-mono">' +
    "<span>APPROVED BY:</span>" +
    (complete ? '<span class="approve-yes">YOU ✓</span>' : '<span>______</span>') +
    "</div>" +
    '<div class="tb-actions">' +
    progressRing(progress.passed, progress.total) +
    '<div class="tb-btns">' +
    '<button type="button" class="btn btn-signal btn-sm" data-act="signoff-open" data-fkey="signoff" aria-label="' + esc(signoffAria) + '">' + U.icon("pen-line", 14) + " SIGN OFF</button>" +
    '<button type="button" class="btn btn-outline btn-sm" data-act="reset-open" data-fkey="reset">' + U.icon("rotate-ccw", 14) + " RESET</button>" +
    "</div></div>" +
    "</div>" +
    '<div class="sheet-tabstrip" aria-label="Drawing sheets">' +
    '<div class="sheet-tabs lab-scroll">' + tabs + "</div>" +
    "</div>" +
    (V.modalOpen ? completionModal() : "") +
    (V.resetOpen ? resetDialog() : "") +
    "</header>";
}

function clipboardChip() {
  var progress = Store.progress();
  var objectives = Store.objectives();
  var s = Store.state;
  var next = null;
  for (var i = 0; i < objectives.length; i++) {
    var p = s.objectives[objectives[i].id];
    if (!p || !p.passed) { next = objectives[i]; break; }
  }
  var aria = "Open inspection checklist — " + progress.passed + " of " + progress.total + " objectives stamped" +
    (next ? ". Next open: " + next.id : "");
  return '<button type="button" class="lab-sheet clipboard-chip" data-act="goto-sheet" data-i="3" data-fkey="clipboard-chip" aria-label="' + esc(aria) + '">' +
    U.icon("clipboard-list", 18, "text-signal") +
    '<span class="lab-mono chip-text">' + progress.passed + "/" + progress.total + " STAMPED" +
    (next
      ? '<span class="chip-sub">NEXT: ' + next.id + "</span>"
      : '<span class="chip-sub chip-done">ALL STAMPED — SIT THE EXAM</span>') +
    "</span></button>";
}

// ── Cover: mode selection (two honest cards) ─────────────────────────────────
function modeSelect() {
  var CARDS = [
    {
      mode: "medium", ic: "compass", title: "Guided Install", tag: "MEDIUM · understand & learn",
      lines: [
        "12 granular objectives, introduced in order with a 'where to look' pointer for each.",
        "Three-tier hints on every objective — free to use, they only cost stars, never progress.",
        "Tolerant checking: synonyms and case are accepted, wrong answers explain themselves.",
        "Finish with a 7-question concept check. Target: Understand / Apply (Bloom).",
      ],
      cta: "Start the guided install",
    },
    {
      mode: "hard", ic: "radio-tower", title: "Commissioning Trial", tag: "HARD · test & stretch",
      lines: [
        "9 broad, multi-step challenges scattered through noisy evidence — two red herrings included.",
        "No 'where to look'. One optional nudge exists, and it visibly costs score.",
        "Strict checking: exact BSSIDs, exact sequences, near-misses are rejected with a rationale.",
        "Finish with a 7-scenario commissioning exam. Target: Analyze / Evaluate / Create (Bloom).",
      ],
      cta: "Begin the commissioning trial",
    },
  ];
  var cards = CARDS.map(function (c, i) {
    return '<div class="anim-rise" style="animation-delay:' + (0.08 + i * 0.08) + 's">' +
      '<div class="lab-sheet mode-card">' +
      '<div class="mode-card-head">' + U.icon(c.ic, 20, "text-signal") + '<h2 class="lab-mono mode-card-title">' + c.title + "</h2></div>" +
      '<p class="lab-kicker mode-card-tag">' + c.tag + "</p>" +
      '<ul class="mode-card-lines">' +
      c.lines.map(function (l) { return '<li><span aria-hidden="true" class="li-dot"></span>' + l + "</li>"; }).join("") +
      "</ul>" +
      '<button type="button" class="btn ' + (c.mode === "medium" ? "btn-pine" : "btn-signal") + ' btn-block" data-act="start" data-mode="' + c.mode + '" data-fkey="start-' + c.mode + '">' +
      U.icon(c.mode === "medium" ? "graduation-cap" : "book-open-check", 16) + " " + c.cta + "</button>" +
      "</div></div>";
  }).join("");
  return '<div class="mode-wrap">' +
    '<div class="anim-rise"><div class="lab-titleblock ms-head">' +
    '<div class="ms-head-top">' +
    "<div><p class=\"lab-kicker\">Northwind County IT Office · Project 24-B</p>" +
    '<h1 class="lab-mono ms-h1">OVER THE AIR</h1>' +
    '<p class="ms-sub">Wireless Commissioning Lab — <span class="ms-strong">Northwind Regional Library</span></p></div>' +
    '<div class="lab-mono ms-meta"><p>SHEET 00 · COVER</p><p>REV A · SCALE NTS</p><p>APPROVED BY: ______</p></div>' +
    "</div>" +
    '<div class="ms-body">' +
    "<p>You are the technician who signs the drawing set. The library's new wireless rollout is on your bench: seven access points, three SSID drawers, one suspicious radio landscape — and an inspection checklist that will decide whether this network is fit to commission. Everything here is <strong>synthetic training data</strong> built for CompTIA Network+ (N10-009) objective 2.3: <em>install and configure wireless networks</em>.</p>" +
    '<p class="lab-mono ms-choose">' + U.icon("clipboard-list", 14) + " CHOOSE A MODE — BOTH SHARE THE SAME BENCH, THE EVIDENCE AND THE AIR</p>" +
    "</div></div></div>" +
    '<div class="ms-cards">' + cards + "</div>" +
    "</div>";
}

// ── Sheet 01 · Site Brief ────────────────────────────────────────────────────
function sheetBrief() {
  return '<div class="container-lg stack">' +
    '<header class="lab-sheet pad-5"><p class="lab-kicker">Sheet 01 · Site Brief</p>' +
    '<h1 class="lab-mono sheet-h1">The Northwind Regional Library rollout</h1></header>' +
    '<section class="lab-sheet pad-5 prose">' +
    '<h2 class="lab-mono sec-h2">' + U.icon("building-2", 18, "text-signal") + " The situation</h2>" +
    "<p><strong>Northwind Regional Library</strong> (fictional) serves a reading hall, a stacks wing, a staff office, a community lab and a café with a terrace view of parking lot B. Last month the county office replaced its aging wireless gear. The installer left behind a fleet of seven access points, three SSID drawers configured \u201Cby the defaults\u201D, and one invoice.</p>" +
    "<p>Since then, three complaints landed on the front desk: the stacks keep dropping connections, a café regular has full bars <em>in the parking lot</em>, and three patrons report that a network called <span class=\"lab-mono text-brick\">\u201CNorthwind-Guest\u201D</span> — with no password — asked them to sign in with their library card number.</p>" +
    "<p>You are the IT technician handed the commissioning checklist. Your job: plan the bands and channels, configure the SSID drawers properly, verify the air, and close the tickets — then sign the drawing set.</p>" +
    "</section>" +
    '<section class="lab-sheet pad-5 prose">' +
    '<h2 class="lab-mono sec-h2">' + U.icon("triangle-alert", 18, "text-signal") + " Why this matters</h2>" +
    "<p>Open public Wi-Fi in libraries and cafés is a documented hunting ground. MITRE ATT&amp;CK's " +
    U.refLink("https://attack.mitre.org/techniques/T1557/004/", "Adversary-in-the-Middle: Evil Twin (T1557.004)") +
    " describes adversaries hosting \u201Cseemingly genuine Wi-Fi access points\u201D that clone legitimate SSIDs, answer stronger, and harvest credentials via fake portals — and it explicitly names <strong>libraries</strong> among the high-concentration public-Wi-Fi locations targeted. The configuration skills in this lab are the same ones a defender uses to make that attack boring.</p>" +
    "</section>" +
    '<section class="lab-sheet pad-5 prose">' +
    '<h2 class="lab-mono sec-h2">' + U.icon("file-text", 18, "text-signal") + " Certification relevance</h2>" +
    "<p>This lab is a hands-on workout for <strong>CompTIA Network+ N10-009, Domain 2.0 (Network Implementation), objective 2.3 — \u201CGiven a scenario, install and configure wireless networks\u201D</strong>. Every exam sub-topic of the lesson is exercised here: channels, frequency options, SSID, network types, encryption, guest networks, authentication, antennas, and access points. Completing the checklist is honest evidence you can do the objective, not just recite it.</p>" +
    "</section>" +
    '<section class="lab-sheet pad-5 prose">' +
    '<h2 class="lab-mono sec-h2">' + U.icon("shield-check", 18, "text-signal") + " How the lab works</h2>" +
    '<ol class="ordered-list">' +
    "<li><strong>Sheet 02 — Standards Reference:</strong> the theory core, with glossary tooltips everywhere.</li>" +
    "<li><strong>Sheet 03 — Commissioning Bench:</strong> three instrument bays (RF plan, config rack, air analyzer) where all evidence lives.</li>" +
    "<li><strong>Sheet 04 — Inspection Checklist:</strong> your objectives. Check each one; stamps explain themselves.</li>" +
    "<li><strong>Sheet 05 — Commissioning Exam:</strong> the knowledge check.</li>" +
    "<li><strong>Sheet 06 — As-Built Notes:</strong> the debrief you keep after the stamp.</li>" +
    "</ol>" +
    '<p class="note-soft">All MAC addresses, vendors, hostnames and networks are synthetic training data. Progress auto-saves to your browser — leave and return anytime.</p>' +
    '<button type="button" class="btn btn-outline-ink proceed-btn" data-act="goto-sheet" data-i="1" data-fkey="proceed-02">PROCEED TO SHEET 02 →</button>' +
    "</section></div>";
}

// ── Sheet 02 · Standards Reference ───────────────────────────────────────────
var NET_TYPE_OPTIONS = [
  { value: "wlan", label: "WLAN (infrastructure)" },
  { value: "wpan", label: "WPAN (personal area)" },
  { value: "mesh", label: "Mesh network" },
  { value: "adhoc", label: "Ad hoc (IBSS)" },
  { value: "hotspot", label: "Hotspot / tethering" },
];
var WIFI_GEN_OPTIONS = [
  { value: "wifi4", label: "Wi-Fi 4" },
  { value: "wifi5", label: "Wi-Fi 5" },
  { value: "wifi6", label: "Wi-Fi 6 / 6E" },
  { value: "wifi7", label: "Wi-Fi 7" },
];

function refTable(t) {
  return '<div class="table-scroll lab-scroll"><table class="lab-table">' +
    "<thead><tr>" + t.head.map(function (h) { return '<th class="lab-mono">' + esc(h) + "</th>"; }).join("") + "</tr></thead>" +
    "<tbody>" + t.rows.map(function (row) { return "<tr>" + row.map(function (c) { return "<td>" + esc(c) + "</td>"; }).join("") + "</tr>"; }).join("") +
    "</tbody></table></div>";
}

function sheetReference() {
  var secs = D.REFERENCE.map(function (sec) {
    var open = V.openSection === sec.id;
    var body = "";
    if (open) {
      body = '<div class="ref-body">' +
        sec.paragraphs.map(function (p) { return "<p>" + p + "</p>"; }).join("") +
        (sec.table ? refTable(sec.table) : "") +
        (sec.bullets ? '<ul class="dot-list">' + sec.bullets.map(function (b) { return '<li><span aria-hidden="true" class="li-dot li-dot-loose"></span><span>' + b + "</span></li>"; }).join("") + "</ul>" : "") +
        "</div>";
    }
    return '<section class="lab-sheet ref-sec">' +
      '<button type="button" class="ref-toggle" data-act="ref-toggle" data-id="' + sec.id + '" data-fkey="ref-' + sec.id + '" aria-expanded="' + (open ? "true" : "false") + '">' +
      "<span><span class=\"lab-kicker ref-kicker\">" + esc(sec.kicker) + "</span>" +
      '<span class="lab-mono ref-title">' + esc(sec.title) + "</span></span>" +
      '<span class="lab-mono ref-sign" aria-hidden="true">' + (open ? "−" : "+") + "</span></button>" +
      body + "</section>";
  }).join("");
  var glossary = D.GLOSSARY.map(function (g) {
    return '<div class="gloss-item"><dt class="lab-mono">' + esc(g.term) + '</dt><dd class="gloss-def">' + esc(g.def) + "</dd></div>";
  }).join("");
  return '<div class="container-lg stack">' +
    '<header class="lab-sheet pad-5"><p class="lab-kicker">Sheet 02 · Standards Reference</p>' +
    '<h1 class="lab-mono sheet-h1">Knowledge Core — wireless devices, end to end</h1>' +
    '<p class="sheet-sub">The theory behind every line of the checklist. Dotted-underlined words carry glossary tooltips. Two field exercises live here too — classification is a skill, not a reading task.</p></header>' +
    secs +
    '<section class="lab-sheet pad-5 stack-4">' +
    '<div><p class="lab-kicker">Field exercise 1 · network types</p>' +
    '<h2 class="lab-mono fe-h2">Classify the five site services</h2>' +
    '<p class="fe-p">Staff Wi-Fi (through our APs) · staff badge fobs (body-worn radios) · the courtyard–annex backhaul (APs relaying to each other) · two laptops sharing files directly, no AP · the patron phone-tethering kiosk at the front desk.</p></div>' +
    U.matchBoard("OBJ-M3", [
      { key: "staffwifi", label: "Staff Wi-Fi — clients through APs, building-wide" },
      { key: "fobs", label: "Badge fobs — body-worn, meter-scale radios" },
      { key: "backhaul", label: "Courtyard–annex backhaul — APs relay among themselves" },
      { key: "laptopshare", label: "Two laptops sharing files directly, no AP anywhere" },
      { key: "kiosk", label: "Front-desk kiosk sharing a phone's cellular link" },
    ], NET_TYPE_OPTIONS, "Assign each service its network type") +
    U.objectiveCheck("OBJ-M3") +
    "</section>" +
    '<section class="lab-sheet pad-5 stack-4">' +
    '<div><p class="lab-kicker">Field exercise 2 · standards literacy</p>' +
    '<h2 class="lab-mono fe-h2">Match the 802.11 standards to their generations</h2>' +
    '<p class="fe-p">A spec sheet says ' + U.term("MIMO", "802.11n") + " / ac / ax / be. Clients introduce themselves by standard — you need the instant translation to generation and bands. (Generation marketing names are teaching labels for the standards, not exam vocabulary to memorize beyond recognition.)</p></div>" +
    U.matchBoard("OBJ-M12", [
      { key: "n", label: "802.11n — 2.4 & 5 GHz radios" },
      { key: "ac", label: "802.11ac — 5 GHz only" },
      { key: "ax", label: "802.11ax — 2.4/5 GHz, and 6 GHz as '6E'" },
      { key: "be", label: "802.11be — 2.4/5/6 GHz, widest channels" },
    ], WIFI_GEN_OPTIONS, "Standard → generation (bands follow the generation)") +
    U.objectiveCheck("OBJ-M12") +
    "</section>" +
    '<section class="lab-sheet pad-5 stack-3">' +
    '<h2 class="lab-mono sec-h2">' + U.icon("book-marked", 18, "text-signal") + ' Glossary — 15 terms you will meet on the bench</h2>' +
    '<dl class="gloss-grid">' + glossary + "</dl>" +
    '<p class="note-soft">Deeper reading: the official pages for ' +
    U.refLink("https://attack.mitre.org/techniques/T1557/004/", "T1557.004 Evil Twin") + " and " +
    U.refLink("https://d3fend.mitre.org/technique/d3f:NetworkTrafficAnalysis", "D3-NTA Network Traffic Analysis") +
    " open in new tabs from the As-Built sheet.</p>" +
    "</section></div>";
}

// ── Sheet 03 · Commissioning Bench ───────────────────────────────────────────
function benchTabsHtml() {
  var s = Store.state;
  var hard = s.mode === "hard";
  var passedIds = {};
  var modeIds = {};
  Store.objectives().forEach(function (o) {
    modeIds[o.id] = true;
    if (s.objectives[o.id] && s.objectives[o.id].passed) passedIds[o.id] = true;
  });
  var visible = BENCH_TABS.filter(function (t) { return t.value !== "desk" || hard; });
  var triggers = visible.map(function (t) {
    var total = t.objs.filter(function (id) { return modeIds[id]; }).length;
    var passed = t.objs.filter(function (id) { return passedIds[id]; }).length;
    var active = s.benchTab === t.value;
    return '<button type="button" class="lab-mono bench-tab' + (active ? " active" : "") + '" data-act="bench-tab" data-v="' + t.value + '" data-fkey="btab-' + t.value + '" aria-selected="' + (active ? "true" : "false") + '" role="tab">' +
      t.label + '<span class="bench-count">(' + passed + "/" + total + ')</span></button>';
  }).join("");
  return '<div class="bench-tablist" role="tablist">' + triggers + "</div>";
}

function sheetBench() {
  var s = Store.state;
  var hard = s.mode === "hard";
  var visible = BENCH_TABS.filter(function (t) { return t.value !== "desk" || hard; });
  var body = "";
  if (s.benchTab === "plan") body = benchPlan();
  else if (s.benchTab === "rack") body = benchRack();
  else if (s.benchTab === "air") body = benchAir();
  else if (s.benchTab === "desk" && hard) body = benchDesk();
  return '<div class="container-xl stack">' +
    '<header class="lab-sheet bench-head">' +
    "<div><p class=\"lab-kicker\">Sheet 03 · Commissioning Bench</p>" +
    '<h1 class="lab-mono sheet-h1">The instrument bays — all evidence lives here</h1>' +
    '<p class="sheet-sub bench-sub">' +
    (hard
      ? "Free roam. The tickets, the ledger and the rack hold everything you need — and two things you don't. The Response Desk is where analysis becomes paperwork."
      : "Work the bays in order: plan the RF, configure the rack, then read the air. Every bay lists the objectives it serves — check them from the bay or from the Inspection Checklist.") +
    "</p></div>" +
    '<div class="lab-mono bench-meta"><p>BAY COUNT: ' + visible.length + "</p><p>EVIDENCE: SYNTHETIC</p></div>" +
    "</header>" +
    benchTabsHtml() +
    '<div class="bench-body' + (U.viewState.animBench ? " bench-anim" : "") + '">' + body + "</div>" +
    "</div>";
}

// ── Bench Bay 1 · RF Plan ────────────────────────────────────────────────────
var KIND_EDITABLE = { "R-1": true, "BR-1": true, "GW-1": true };
var KIND_OPTIONS = [
  { value: "dedicated", label: "Dedicated / autonomous AP" },
  { value: "integrated", label: "Integrated AP (SOHO router)" },
  { value: "repeater", label: "Repeater / extender" },
  { value: "bridge", label: "Point-to-point bridge" },
];
var ANTENNA_OPTIONS = [
  { value: "omni", label: "Omni" },
  { value: "panel", label: "Panel (directional)" },
  { value: "yagi", label: "Yagi (long beam)" },
];
var BAND_OPTIONS = [
  { value: "2.4", label: "2.4 GHz — long reach, 3 clean channels, legacy clients" },
  { value: "5", label: "5 GHz — capacity band, many channels" },
  { value: "6", label: "6 GHz — clean & wide, Wi-Fi 6E/7 clients only" },
];

function channelsFor(band) {
  return band === "2.4" ? D.CHANNELS_24 : band === "5" ? D.CHANNELS_5 : D.CHANNELS_6;
}

function apCard(ap) {
  var bandChips = ap.bands.map(function (b) { return D.BAND_LABEL[b]; }).join(" + ");
  var slotSel = selectHtml({
    id: "slot-" + ap.id, aria: "slot-" + ap.id, value: ap.slotId || "none",
    options: [{ v: "none", l: "— unassigned —" }].concat(D.PLAN_SLOTS.map(function (sl) { return { v: sl.id, l: sl.id + " — " + sl.zone }; })),
    dataChg: "ap:" + ap.id + ":slotId", cls: "w-full",
  });
  var kindCtl = KIND_EDITABLE[ap.id]
    ? selectHtml({
        id: "kind-" + ap.id, aria: "kind-" + ap.id, value: ap.kind,
        options: KIND_OPTIONS.map(function (k) { return { v: k.value, l: k.label }; }),
        dataChg: "ap:" + ap.id + ":kind", cls: "w-full",
      })
    : '<div class="lab-mono kind-fixed">Dedicated / autonomous</div>';
  var antSel = selectHtml({
    id: "ant-" + ap.id, aria: "ant-" + ap.id, value: ap.antenna,
    options: ANTENNA_OPTIONS.map(function (a) { return { v: a.value, l: a.label }; }),
    dataChg: "ap:" + ap.id + ":antenna", cls: "w-full",
  });
  var bandRows = ap.bands.map(function (b) {
    var radio = ap.radios[b];
    if (!radio) return "";
    var chans = channelsFor(b);
    var chOpts = [{ v: "none", l: "— off —" }].concat(chans.map(function (c) {
      return { v: String(c), l: c + (D.DFS_CHANNELS.indexOf(c) !== -1 ? " (DFS)" : "") };
    }));
    return '<div class="band-row">' +
      '<span class="lab-mono band-chip" style="background:' + D.BAND_COLOR[b] + '">' + D.BAND_LABEL[b] + "</span>" +
      '<label class="lab-kicker ch-label" for="ch-' + ap.id + "-" + b + '">CH</label>' +
      selectHtml({
        id: "ch-" + ap.id + "-" + b, aria: "ch-" + ap.id + "-" + b,
        value: radio.channel === null ? "none" : String(radio.channel),
        options: chOpts, dataChg: "radio:" + ap.id + ":" + b + ":channel", cls: "w-ch",
      }) +
      '<label class="lab-kicker ch-label" for="w-' + ap.id + "-" + b + '">WIDTH</label>' +
      selectHtml({
        id: "w-" + ap.id + "-" + b, aria: "w-" + ap.id + "-" + b, value: String(radio.widthMhz),
        options: D.WIDTHS[b].map(function (w) { return { v: String(w), l: w + " MHz" }; }),
        dataChg: "radio:" + ap.id + ":" + b + ":widthMhz", cls: "w-wid",
      }) +
      "</div>";
  }).join("");
  return '<div class="ap-card">' +
    '<div class="ap-card-head">' +
    '<span class="lab-mono ap-id-chip">' + ap.id + "</span>" +
    '<span class="ap-card-label">' + esc(ap.label.replace(ap.id + " · ", "")) + "</span>" +
    '<span class="grow"></span><span class="lab-mono ap-bands">' + bandChips + "</span></div>" +
    '<div class="ap-grid">' +
    '<div><label class="lab-kicker field-label" for="slot-' + ap.id + '">Placement</label>' + slotSel + "</div>" +
    '<div><label class="lab-kicker field-label" for="kind-' + ap.id + '">Device type</label>' + kindCtl + "</div>" +
    '<div><label class="lab-kicker field-label" for="ant-' + ap.id + '">Antenna</label>' + antSel + "</div>" +
    "</div>" +
    '<div class="pow-block">' +
    '<label class="lab-kicker field-label pow-label" for="pow-' + ap.id + '" id="pow-label-' + ap.id + '">' + U.icon("signal", 12) + " " + ap.id + " transmit power: " + ap.powerMw + " mW</label>" +
    '<input type="range" id="pow-' + ap.id + '" min="25" max="500" step="25" value="' + ap.powerMw + '" data-input="power:' + ap.id + '" class="pow-slider">' +
    "</div>" +
    '<div class="band-rows">' + bandRows + "</div>" +
    "</div>";
}

function benchPlan() {
  var aps = Store.state.env.aps;
  var legend = ["2.4", "5", "6"].map(function (b) {
    return '<span class="legend-item"><span aria-hidden="true" class="legend-dot" style="background:' + D.BAND_COLOR[b] + '"></span>' + D.BAND_LABEL[b] + "</span>";
  }).join("");
  var apCards = aps.map(function (a) { return apCard(a); }).join("");
  return '<div class="plan-grid">' +
    '<div class="stack-4">' +
    '<div class="lab-sheet pad-4">' +
    '<div class="plan-head">' +
    '<h2 class="lab-mono sec-h2">' + U.icon("radio", 18, "text-signal") + ' Floor plan — placement &amp; coverage</h2>' +
    '<div class="lab-mono legend">' + legend + "</div></div>" +
    '<div id="floorplan-wrap">' + U.floorPlanSvg() + "</div>" +
    '<p class="plan-note">Rings show each AP\u2019s reach per band (simplified model: radius follows transmit power and band attenuation). Dashed ring = radio present but channel not set. Note which walls the rings ignore — and where the glass faces the parking lot.</p>' +
    "</div>" +
    '<div class="lab-sheet pad-4 stack-4">' +
    '<div><p class="lab-kicker">Antenna board</p>' +
    '<h3 class="lab-mono fe-h2">Pattern = policy: choose the hall-center antenna</h3>' +
    '<p class="fe-p">The open reading hall is served by AP-1 at slot A1. Which pattern should it wear? (The café and bridge antennas are set on their AP cards.)</p></div>' +
    U.radioCards("OBJ-M8", "hall", "AP-1 at Reading Hall center", [
      { value: "panel", label: "Directional panel", note: "One hemisphere — rooms with a dead side" },
      { value: "yagi", label: "Yagi", note: "Long narrow beam — point-to-point" },
      { value: "omni", label: "Omnidirectional", note: "Even donut, fills an open room" },
    ], true) +
    U.objectiveCheck("OBJ-M8") +
    "</div></div>" +
    '<div class="stack-4">' +
    '<div class="lab-sheet pad-4 stack-3">' +
    '<h2 class="lab-mono fe-h2">AP fleet — 7 devices</h2>' +
    '<p class="note-soft">Set placement, device type, antenna, power and per-band channel/width. Three devices are still unassigned — the checklist tells you where each belongs and why.</p>' +
    apCards +
    U.objectiveCheck("OBJ-M2") +
    U.objectiveCheck("OBJ-M9") +
    U.objectiveCheck("OBJ-H2") +
    "</div>" +
    '<div class="lab-sheet pad-4 stack-3">' +
    '<p class="lab-kicker">Band assignment board · client groups</p>' +
    '<h3 class="lab-mono fe-h2">Route each client group to its band</h3>' +
    U.matchBoard("OBJ-M1", [
      { key: "scanner", label: "Circulation-desk barcode scanners (2013, 2.4 GHz-only radios)" },
      { key: "tablets", label: "Patron tablets & phones (mixed Wi-Fi 5/6)" },
      { key: "laptops", label: "Staff laptops (new, Wi-Fi 6E/7 radios)" },
      { key: "cameras", label: "Security cameras (2.4 GHz-only, low data)" },
    ], BAND_OPTIONS, "Client group → frequency band") +
    U.objectiveCheck("OBJ-M1") +
    "</div></div></div>";
}

// ── Bench Bay 2 · Config Rack ────────────────────────────────────────────────
var AUTH_OPTIONS = [
  { value: "psk", label: "Pre-shared key (one passphrase for everyone)" },
  { value: "dot1x", label: "802.1X — per-user, via RADIUS" },
  { value: "portal", label: "Captive portal (web gate)" },
  { value: "open", label: "Open (no auth)" },
];
var RATE_OPTIONS = [0, 5, 10, 20, 50];

function drawer(ssid) {
  var secNote = "";
  D.SECURITY_OPTIONS.forEach(function (o) { if (o.value === ssid.security) secNote = o.note; });
  var isGuest = ssid.id === "guest";
  var vlanBadge = "VLAN: " + (isGuest ? (ssid.vlan || "untagged") : ssid.id === "staff" ? "10" : "30") + (isGuest ? " (editable below)" : "");
  var radiusBlock = "";
  if (ssid.authType === "dot1x") {
    radiusBlock = '<div class="radius-block" id="radius-' + ssid.id + '">' +
      '<div><label class="lab-kicker field-label" for="rh-' + ssid.id + '">RADIUS server host</label>' +
      '<input type="text" id="rh-' + ssid.id + '" class="lab-input" placeholder="radius.example.org" value="' + esc(ssid.radiusHost) + '" data-input="ssid:' + ssid.id + ':radiusHost"></div>' +
      '<div><label class="lab-kicker field-label" for="rp-' + ssid.id + '">RADIUS port</label>' +
      '<input type="text" id="rp-' + ssid.id + '" class="lab-input" placeholder="1812" inputmode="numeric" value="' + esc(ssid.radiusPort) + '" data-input="ssid:' + ssid.id + ':radiusPort"></div>' +
      "</div>";
  }
  var guestBlock = "";
  if (isGuest) {
    guestBlock = '<div class="guest-block">' +
      '<div><label class="lab-kicker field-label" for="vlan-' + ssid.id + '">Guest VLAN (own segment!)</label>' +
      '<input type="text" id="vlan-' + ssid.id + '" class="lab-input" inputmode="numeric" placeholder="e.g. 60" value="' + esc(ssid.vlan) + '" data-input="ssid:' + ssid.id + ':vlan"></div>' +
      '<div><label class="lab-kicker field-label" for="rate-' + ssid.id + '">Rate limit (Mbps, 0 = unlimited)</label>' +
      selectHtml({
        id: "rate-" + ssid.id, aria: "rate-" + ssid.id, value: String(ssid.rateLimitMbps),
        options: RATE_OPTIONS.map(function (r) { return { v: String(r), l: r === 0 ? "unlimited" : r + " Mbps" }; }),
        dataChg: "ssid:" + ssid.id + ":rateLimitMbps", cls: "w-full",
      }) + "</div>" +
      '<label class="switch-row"><input type="checkbox" class="lab-switch" data-chg="ssid:' + ssid.id + ':isolation"' + (ssid.isolation ? " checked" : "") + ' aria-label="Client isolation">' +
      "<span>" + U.term("Client isolation") + " — guests cannot reach each other or the LAN</span></label>" +
      '<label class="switch-row"><input type="checkbox" class="lab-switch" data-chg="ssid:' + ssid.id + ':portal"' + (ssid.portal ? " checked" : "") + ' aria-label="Captive portal">' +
      "<span>" + U.term("Captive portal") + " — terms &amp; sign-in before traffic</span></label>" +
      "</div>";
  }
  return '<div class="drawer">' +
    '<div class="drawer-head">' + U.icon("lock", 16) +
    '<span class="lab-mono drawer-title">' + ssid.id + ' drawer</span>' +
    '<span class="lab-mono drawer-sub">' + (isGuest ? "patrons · VLAN editable" : ssid.id === "staff" ? "employees · VLAN 10" : "cameras &amp; sensors · VLAN 30") + "</span>" +
    '<span class="grow"></span>' +
    '<label class="hidden-label"><input type="checkbox" class="lab-switch" data-chg="ssid:' + ssid.id + ':hidden"' + (ssid.hidden ? " checked" : "") + ' aria-label="Hide SSID ' + esc(ssid.name) + '"> Hidden</label>' +
    "</div>" +
    '<div class="drawer-body">' +
    '<div class="drawer-grid">' +
    '<div><label class="lab-kicker field-label" for="name-' + ssid.id + '">SSID name (what clients see)</label>' +
    '<input type="text" id="name-' + ssid.id + '" class="lab-input" value="' + esc(ssid.name) + '" data-input="ssid:' + ssid.id + ':name"></div>' +
    '<div><label class="lab-kicker field-label" for="sec-' + ssid.id + '">Security mode (encryption ladder)</label>' +
    selectHtml({
      id: "sec-" + ssid.id, aria: "security-" + ssid.id, value: ssid.security,
      options: D.SECURITY_OPTIONS.map(function (o) { return { v: o.value, l: o.label }; }),
      dataChg: "ssid:" + ssid.id + ":security", cls: "w-full", fkey: "sec-" + ssid.id,
    }) +
    '<p class="sec-note" id="secnote-' + ssid.id + '">' + esc(secNote) + "</p></div>" +
    "</div>" +
    '<div class="drawer-grid">' +
    '<div><label class="lab-kicker field-label" for="auth-' + ssid.id + '">Authentication path</label>' +
    selectHtml({
      id: "auth-" + ssid.id, aria: "auth-" + ssid.id, value: ssid.authType,
      options: AUTH_OPTIONS.map(function (a) { return { v: a.value, l: a.label }; }),
      dataChg: "ssid:" + ssid.id + ":authType", cls: "w-full", fkey: "auth-" + ssid.id,
    }) + "</div>" +
    '<div class="vlan-badge-wrap"><span class="lab-mono vlan-badge" id="vlan-badge-' + ssid.id + '">' + vlanBadge + "</span></div>" +
    "</div>" +
    radiusBlock + guestBlock +
    "</div></div>";
}

function benchRack() {
  var s = Store.state;
  var hard = s.mode === "hard";
  var guest = null, staff = null, iot = null;
  s.env.ssids.forEach(function (x) {
    if (x.id === "guest") guest = x; else if (x.id === "staff") staff = x; else if (x.id === "iot") iot = x;
  });
  var rigDetails = "";
  if (s.env.guestTest !== "idle") {
    rigDetails = '<ul class="rig-list">' + s.env.guestTestDetails.map(function (d) {
      return '<li class="' + (d.ok ? "rig-ok" : "rig-fail") + '"><span aria-hidden="true" class="rig-mark">' + (d.ok ? "✓" : "✗") + "</span><span>" + esc(d.label) + (d.ok ? " — OK" : " — FAILED") + "</span></li>";
    }).join("") + "</ul>";
  }
  return '<div class="rack-grid">' +
    '<div class="stack-4">' +
    '<div class="lab-sheet pad-4"><h2 class="lab-mono fe-h2">SSID rack — three drawers</h2>' +
    '<p class="note-soft">The installer left these \u201Cby the defaults\u201D. Names, security rungs, authentication paths, guest fencing: everything on this rack is a checklist line.</p></div>' +
    drawer(staff) + drawer(guest) + drawer(iot) +
    '<div class="lab-sheet pad-4">' + U.objectiveCheck("OBJ-M4") + "</div>" +
    '<div class="lab-sheet pad-4">' + U.objectiveCheck("OBJ-M5") + "</div>" +
    "</div>" +
    '<div class="stack-4">' +
    '<div class="lab-sheet pad-4">' +
    '<div class="wps-head">' + U.icon("shield-alert", 18, "text-brick") + '<h2 class="lab-mono fe-h2">GW-1 · WPS master switch</h2></div>' +
    '<p class="fe-p">The SOHO router in the staff wing ships with ' + U.term("WPS") + " enabled. Its PIN verification accepts half-guesses, so an online brute force recovers it in a fraction of the keyspace. The switch below is the mitigation.</p>" +
    '<div class="wps-box"><input type="checkbox" class="lab-switch" data-chg="wps"' + (s.env.wpsEnabled ? " checked" : "") + ' aria-label="WPS enabled" data-fkey="wps-switch">' +
    '<span class="lab-mono wps-status" id="wps-status">WPS ' + (s.env.wpsEnabled ? '<span class="text-brick">ENABLED — vulnerable</span>' : '<span class="text-pine">DISABLED</span>') + "</span></div>" +
    "</div>" +
    '<div class="lab-sheet pad-4">' + U.objectiveCheck("OBJ-M7") + "</div>" +
    '<div class="lab-sheet pad-4">' + U.objectiveCheck("OBJ-M6") + "</div>" +
    '<div class="lab-sheet pad-4">' +
    '<div class="wps-head">' + U.icon("flask-conical", 18, "text-signal") + '<h2 class="lab-mono fe-h2">Guest isolation test rig</h2></div>' +
    '<p class="fe-p">Commissioning rule: <strong>test, don\u2019t trust</strong>. The rig simulates a patron device joining the guest drawer and reports four checks. (Hard mode requires a passing rig.)</p>' +
    '<button type="button" class="btn btn-ink btn-rig" data-act="run-guest-test" data-fkey="guest-test-run">RUN GUEST ISOLATION TEST</button>' +
    rigDetails +
    "</div>" +
    (hard
      ? '<div class="lab-sheet lab-dashed pad-4"><h3 class="lab-mono hard-tools-h">' + U.icon("rotate-ccw", 16, "text-signal") + ' Hard tools</h3>' +
        '<p class="note-soft">Objective OBJ-H3 checks the ORDER you applied the guest controls in. If the guest drawer is already dirty from earlier work, restore the factory guest config first — the bench records your sequence from that moment.</p>' +
        '<button type="button" class="btn btn-outline-ink btn-factory" data-act="factory-guest" data-fkey="factory-guest">RESTORE FACTORY GUEST CONFIG</button>' +
        '<div class="mt-3">' + U.objectiveCheck("OBJ-H3") + "</div></div>"
      : "") +
    "</div></div>";
}

// ── Bench Bay 3 · Air Analyzer ───────────────────────────────────────────────
var TAG_OPTIONS = [
  { value: "none", label: "— untagged —" },
  { value: "authorized", label: "Authorized (ours)" },
  { value: "unauthorized", label: "Unauthorized (rogue)" },
  { value: "neighbor", label: "Neighbor (not ours, not rogue)" },
];

function tagClass(t) {
  switch (t) {
    case "authorized": return "tag-authorized";
    case "unauthorized": return "tag-unauthorized";
    case "neighbor": return "tag-neighbor";
    default: return "";
  }
}

function ledger() {
  var tags = Store.state.env.tags;
  var rows = D.BEACONS.map(function (b) {
    var tag = tags[b.id];
    var flags = b.flags.map(function (f) {
      return '<span class="lab-mono flag-chip">' + esc(f) + "</span>";
    }).join("");
    return '<tr class="beacon-row ' + tagClass(tag) + '" id="beacon-row-' + b.id + '">' +
      '<td class="lab-mono beacon-ssid">' + esc(b.ssid) + "</td>" +
      '<td class="lab-mono">' + b.bssid + "</td>" +
      "<td>" + b.band + " GHz</td>" +
      "<td>" + b.channel + (b.flags.indexOf("DFS") !== -1 ? " (DFS)" : "") + "</td>" +
      '<td class="lab-mono">' + b.rssi + " dBm</td>" +
      "<td>" + esc(b.cipher) + "</td>" +
      "<td>" + esc(b.auth) + "</td>" +
      "<td>" + esc(b.vendor) + "</td>" +
      '<td><span class="flag-wrap">' + flags + "</span></td>" +
      '<td class="tag-cell ' + tagClass(tag) + '">' +
      selectHtml({
        id: "tag-" + b.id, aria: "Tag beacon " + b.ssid + " " + b.bssid, value: tag || "none",
        options: TAG_OPTIONS.map(function (t) { return { v: t.value, l: t.label }; }),
        dataChg: "tag:" + b.id, cls: "w-tag",
      }) +
      "</td></tr>";
  }).join("");
  return '<div class="table-scroll lab-scroll"><table class="lab-table ledger-table">' +
    '<caption class="sr-only">Wireless beacon capture — tag each transmitter as authorized, unauthorized or neighbor</caption>' +
    "<thead><tr>" +
    ["SSID", "BSSID", "BAND", "CH", "RSSI", "CIPHER", "AUTH", "VENDOR", "FLAGS", "YOUR TAG"].map(function (h) {
      return '<th class="lab-mono">' + h + "</th>";
    }).join("") +
    "</tr></thead><tbody>" + rows + "</tbody></table></div>";
}

function ticketCard(id, innerHtml) {
  var t = null;
  D.TICKETS.forEach(function (x) { if (x.id === id) t = x; });
  var open = !!V.openTickets[id];
  return '<div class="ticket-card">' +
    '<button type="button" class="ticket-toggle" data-act="ticket-toggle" data-id="' + id + '" data-fkey="ticket-' + id + '" aria-expanded="' + (open ? "true" : "false") + '">' +
    U.icon("ticket", 16, "text-signal") +
    '<span class="lab-mono ticket-id">' + t.id + "</span>" +
    '<span class="ticket-title">' + esc(t.title) + "</span>" +
    '<span class="lab-mono ticket-from">FROM: ' + esc(t.from.toUpperCase()) + "</span>" +
    '<span class="lab-mono ticket-sign" aria-hidden="true">' + (open ? "−" : "+") + "</span></button>" +
    (open ? '<div class="ticket-body">' + innerHtml + "</div>" : "") +
    "</div>";
}

function benchAir() {
  var s = Store.state;
  var hard = s.mode === "hard";
  var ap3 = null;
  s.env.aps.forEach(function (a) { if (a.id === "AP-3") ap3 = a; });
  var ap3State = "";
  if (ap3) {
    ap3State = '<p class="lab-mono ap3-state">AP-3 LIVE STATE → power: ' + ap3.powerMw + " mW · antenna: " + ap3.antenna + " · slot: " + (ap3.slotId || "unassigned") + " (set these on the AP-3 card, RF Plan bay)</p>";
  }
  var survey = D.SURVEY_LOG.map(function (l) { return "<li>" + esc(l) + "</li>"; }).join("");
  return '<div class="air-grid">' +
    '<div class="stack-4">' +
    '<div class="lab-sheet pad-4">' +
    '<div class="plan-head"><h2 class="lab-mono sec-h2">' + U.icon("waves", 18, "text-signal") + ' Beacon ledger — one sweep, 9 transmitters</h2>' +
    '<span class="lab-kicker">SAMPLE CAPTURE DATA · SYNTHETIC</span></div>' +
    ledger() +
    '<p class="plan-note">Tells that matter: BSSID vs the controller inventory, vendor OUI, cipher, auth path, RSSI. Signal bars are a lure, not a credential.</p>' +
    '<div class="stack-2">' + U.objectiveCheck("OBJ-M10") + (hard ? U.objectiveCheck("OBJ-H1") : "") + "</div>" +
    "</div>" +
    '<div class="lab-sheet pad-4">' +
    '<h3 class="lab-mono tickets-h">Help tickets — the human sensors</h3>' +
    '<p class="note-soft">Complaints are triggers, not evidence: correlate each one against the ledger, the inventory and the rack.</p>' +
    '<div class="stack-2">' +
    ticketCard("T-101",
      '<p class="ticket-p">' + esc(D.TICKETS[0].body) + "</p>" +
      U.checkGroup("OBJ-M11", "causes", "Select every TRUE cause (from the evidence — not the loudest theory)", [
        { value: "ch6", label: "Every AP and the old extender sit on channel 6" },
        { value: "wep", label: "A forgotten WEP extender (b9) still transmits there" },
        { value: "cafe", label: "CafeCorner_Guest on channel 3 interferes with aisle 4" },
        { value: "dhcp", label: "DHCP pool exhaustion on the staff VLAN" },
        { value: "virus", label: "Client malware flooding the network with traffic" },
      ]) +
      U.radioCards("OBJ-M11", "fix", "The single best fix", [
        { value: "boost", label: "Raise transmit power on channel 6 only" },
        { value: "deconflict-decommission", label: "Deconflict channels; decommission the WEP repeater" },
        { value: "ch3", label: "Move every radio to channel 3 instead" },
        { value: "hide", label: "Hide the staff SSID from clients" },
        { value: "guestoff", label: "Disable the guest network entirely" },
      ]) +
      U.objectiveCheck("OBJ-M11")) +
    ticketCard("T-102",
      '<p class="ticket-p">' + esc(D.TICKETS[1].body) + "</p>" + ap3State +
      U.radioCards("OBJ-H9", "followup", "Follow-up action after you re-shape AP-3 (power ≤ 50 mW, panel aimed inward)", [
        { value: "nothing", label: "Do nothing — the café copes with the shrunken cell" },
        { value: "add-fill-in-ap", label: "Add a fill-in AP for the café's far corner" },
        { value: "disable-ap3", label: "Disable AP-3 and its café coverage entirely" },
      ]) +
      U.objectiveCheck("OBJ-H9")) +
    ticketCard("T-103",
      '<p class="ticket-p">' + esc(D.TICKETS[2].body) + "</p>" +
      '<p class="ticket-p">Cross-reference: the clone described here is beacon <span class="lab-mono">b4</span> in the ledger. Tag it (and its look-alikes) above. In hard mode, write the formal incident card on the Response Desk bay.</p>' +
      '<button type="button" class="t103-link lab-mono" data-act="t103-goto" data-fkey="t103-goto">' +
      (hard ? "OPEN THE RESPONSE DESK →" : "REVIEW THE LEDGER ABOVE ↑") + "</button>") +
    "</div></div></div>" +
    '<div class="stack-4">' +
    '<div class="lab-sheet pad-4"><h3 class="lab-mono tickets-h">Controller inventory — ground truth</h3>' +
    '<p class="lab-mono inv-note">' + esc(D.CONTROLLER_INVENTORY_NOTE) + "</p></div>" +
    '<div class="lab-sheet pad-4"><h3 class="lab-mono tickets-h">Site survey log</h3>' +
    '<ul class="lab-mono survey-log">' + survey + "</ul>" +
    '<p class="note-soft">Not every spike is an attacker: separate devices from noise before you escalate.</p>' +
    "</div></div></div>";
}

// ── Bench Bay 4 · Response Desk (Hard only) ──────────────────────────────────
function benchDesk() {
  var s = Store.state;
  var aps = s.env.aps;
  var w24 = aps.filter(function (a) { return a.radios["2.4"]; }).map(function (a) { return a.id + ":" + a.radios["2.4"].widthMhz + "MHz"; }).join(" · ");
  var w5hall = aps.filter(function (a) { return a.id === "AP-1" || a.id === "AP-2"; }).map(function (a) { return a.id + ":" + a.radios["5"].widthMhz + "MHz"; }).join(" · ");
  var bssid = (s.answers["OBJ-H5"] && s.answers["OBJ-H5"].bssid) || "";
  U.ensureOrderShuffled("OBJ-H7", "order", U.ORDERLIST_ITEMS_H7);
  return '<div class="desk-grid">' +
    '<div class="stack-4">' +
    '<div class="lab-sheet pad-4"><h2 class="lab-mono desk-h2">Legacy eviction desk <span class="lab-kicker desk-obj">OBJ-H4</span></h2>' +
    '<p class="fe-p">Three findings from the sweep and the rack. \u201CMonitor it\u201D is not a disposition — assign the correct one per item, and make the rack reflect the WPS decision (the switch lives on the GW-1 card, Config Rack bay).</p>' +
    '<div class="stack-4">' +
    U.radioCards("OBJ-H4", "wep", "b9 / NW-Ext-Old — our own 2016 WEP repeater, still on channel 6", [
      { value: "firmware-or-replace", label: "Firmware / replace if a WEP→CCMP update exists" },
      { value: "decommission", label: "Decommission — remove from service and dispose" },
      { value: "monitor", label: "Monitor it — it is inside our own building" },
    ]) +
    U.radioCards("OBJ-H4", "tkip", "Circulation scanner laptop — 2.4 GHz radio tops out at WPA (TKIP)", [
      { value: "decommission", label: "Decommission — nothing with TKIP may touch the network" },
      { value: "monitor", label: "Monitor it — nobody uses that laptop anyway" },
      { value: "firmware-or-replace", label: "Firmware/driver update to CCMP — else replace it" },
    ]) +
    U.radioCards("OBJ-H4", "wps", "WPS on GW-1 — currently " + (s.env.wpsEnabled ? "ENABLED" : "DISABLED"), [
      { value: "monitor", label: "Monitor it — the PIN is 8 digits, that is fine" },
      { value: "disable", label: "Disable WPS — and actually flip the switch on the rack" },
      { value: "document", label: "Document it — paperwork makes it safe" },
    ]) +
    "</div>" +
    '<div class="mt-3">' + U.objectiveCheck("OBJ-H4") + "</div></div>" +
    '<div class="lab-sheet pad-4"><h2 class="lab-mono desk-h2">Incident card — the clone <span class="lab-kicker desk-obj">OBJ-H5</span></h2>' +
    '<p class="fe-p">Write the clone up like an incident responder: exact BSSID, the ATT&amp;CK technique it maps to (see the ' +
    U.refLink("https://attack.mitre.org/techniques/T1557/004/", "official page") +
    '), and the data source that proves it among the options.</p>' +
    '<div class="stack-4">' +
    '<div><label class="lab-kicker field-label" for="it-bssid">Clone BSSID (exact)</label>' +
    '<input type="text" id="it-bssid" class="lab-input mono-input" placeholder="AA:BB:CC:DD:EE:FF" value="' + esc(bssid) + '" data-input="answer:OBJ-H5:bssid"></div>' +
    U.radioCards("OBJ-H5", "technique", "ATT&CK technique", [
      { value: "T1557", label: "T1557 (parent only)" },
      { value: "T1557.004", label: "T1557.004" },
      { value: "T1040", label: "T1040" },
      { value: "T1110", label: "T1110" },
    ], true) +
    U.radioCards("OBJ-H5", "source", "Data source that carries the proof", [
      { value: "spectrum-analyzer", label: "Spectrum analyzer trace" },
      { value: "patron-anecdotes", label: "Patron complaint tickets" },
      { value: "controller-logs", label: "Wireless controller logs — BSSID absent from inventory" },
      { value: "social-media", label: "Community social media posts" },
    ]) +
    "</div>" +
    '<div class="mt-3">' + U.objectiveCheck("OBJ-H5") + "</div></div>" +
    "</div>" +
    '<div class="stack-4">' +
    '<div class="lab-sheet pad-4"><h2 class="lab-mono desk-h2">Bonding ruling <span class="lab-kicker desk-obj">OBJ-H6</span></h2>' +
    '<p class="fe-p">A junior admin wants 40 MHz bonding on 2.4 GHz \u201Cfor speed\u201D. Set the radios on the RF Plan bay (all 2.4 GHz at 20 MHz; hall 5 GHz stays 80 MHz), then pick the TWO engineering reasons. Current state: <span class="lab-mono desk-live">2.4 GHz — ' + esc(w24) + " · hall 5 GHz — " + esc(w5hall) + "</span></p>" +
    '<div class="stack-4">' +
    U.checkGroup("OBJ-H6", "reasons", "Pick exactly the two reasons that justify the rule", [
      { value: "overlap", label: "40 MHz in 2.4 GHz overlaps the deconflicted neighbors" },
      { value: "utilization", label: "Hall 5 GHz utilization justifies the 80 MHz width" },
      { value: "power", label: "Raise transmit power instead — width is irrelevant there" },
      { value: "hide", label: "Hide all SSIDs — then channel width does not matter" },
      { value: "all40", label: "Bond every radio to 40 MHz for consistency" },
    ]) +
    "</div>" +
    '<div class="mt-3">' + U.objectiveCheck("OBJ-H6") + "</div></div>" +
    '<div class="lab-sheet pad-4"><h2 class="lab-mono desk-h2">Rogue-AP response planner <span class="lab-kicker desk-obj">OBJ-H7</span></h2>' +
    '<p class="fe-p">The clone is on the air now. Order the five response steps, then pick the TWO data sources the plan is built on.</p>' +
    '<div class="stack-4">' +
    U.orderListHtml("OBJ-H7", "order", "Response sequence (use ▲▼ — the sheet arrives genuinely shuffled)", U.ORDERLIST_ITEMS_H7) +
    U.checkGroup("OBJ-H7", "sources", "The two data sources the plan depends on", [
      { value: "controller", label: "Wireless controller logs / BSSID inventory" },
      { value: "spectrum", label: "Spectrum analyzer surveys" },
      { value: "anecdote", label: "Complaint anecdotes" },
      { value: "social", label: "Social media reports" },
    ]) +
    "</div>" +
    '<div class="mt-3">' + U.objectiveCheck("OBJ-H7") + "</div></div>" +
    '<div class="lab-sheet pad-4"><h2 class="lab-mono desk-h2">Trade-off rulings <span class="lab-kicker desk-obj">OBJ-H8</span></h2>' +
    '<p class="fe-p">Management wants \u201Cmaximum security everywhere\u201D and a \u201Cdiscreet\u201D network. Make the three defensible calls — the popular-but-wrong answers are offered.</p>' +
    '<div class="stack-4">' +
    U.radioCards("OBJ-H8", "staffsec", "Staff network security mode", [
      { value: "wpa2wpa3", label: "WPA2/WPA3 transition", note: "Safer for stragglers — but staff have none" },
      { value: "psk", label: "WPA3-Personal (shared SAE passphrase)", note: "One secret, thirty people" },
      { value: "wpa3-ent", label: "WPA3-Enterprise (802.1X)", note: "Modern fleet, PMF mandatory" },
    ], true) +
    U.radioCards("OBJ-H8", "broadcast", "SSID broadcast policy", [
      { value: "hidden", label: "Hide every SSID — attackers can't see what isn't advertised" },
      { value: "broadcast", label: "Broadcast all SSIDs — authentication is the control" },
    ]) +
    U.radioCards("OBJ-H8", "bleed", "Parking-lot bleed control", [
      { value: "power-only", label: "Cut power only — keep the omni" },
      { value: "max-power", label: "Raise power so the lot gets a better signal anyway" },
      { value: "panel-power", label: "Panel antenna aimed inward + reduced power" },
    ]) +
    "</div>" +
    '<div class="mt-3">' + U.objectiveCheck("OBJ-H8") + "</div></div>" +
    "</div></div>";
}

// ── Sheet 04 · Inspection Checklist ──────────────────────────────────────────
function hintBlock(obj) {
  var prog = Store.state.objectives[obj.id];
  var used = prog ? prog.hintsUsed : 0;
  var hard = obj.mode === "hard";
  if (hard) {
    if (used === 0 && !V.hintConfirming[obj.id]) {
      return '<div class="mt-2"><button type="button" class="hint-reveal lab-mono" data-act="hint-confirm" data-obj="' + obj.id + '" data-fkey="hint-confirm-' + obj.id + '">REVEAL THE ONE NUDGE (COSTS SCORE)</button></div>';
    }
    if (used === 0 && V.hintConfirming[obj.id]) {
      return '<div class="mt-2"><span class="hint-confirm-row">' +
        "<span>The single nudge — revealed, it is recorded against your star rating.</span>" +
        '<button type="button" class="btn btn-outline btn-h8" data-act="hint-confirm-cancel" data-obj="' + obj.id + '" data-fkey="hint-cancel-' + obj.id + '">CANCEL</button>' +
        '<button type="button" class="btn btn-signal btn-h8" data-act="hint" data-obj="' + obj.id + '" data-fkey="hint-' + obj.id + '">REVEAL</button>' +
        "</span></div>";
    }
    return '<div class="mt-2"><p class="hint-box">' + U.icon("lightbulb", 14, "amber") + " " + esc(obj.hints[0]) + "</p></div>";
  }
  return '<div class="mt-2 hint-stack">' + obj.hints.map(function (h, i) {
    var revealed = used > i;
    return revealed
      ? '<p class="hint-box"><span class="lab-mono hint-tier">HINT ' + (i + 1) + "/" + obj.hints.length + "</span> " + esc(h) + "</p>"
      : '<button type="button" class="hint-reveal lab-mono" data-act="hint" data-obj="' + obj.id + '" data-hint-i="' + i + '" data-fkey="hint-' + obj.id + "-" + i + '">REVEAL HINT ' + (i + 1) + " OF " + obj.hints.length + " (FREE — COSTS STARS ONLY)</button>";
  }).join("") + "</div>";
}

function objectiveCard(obj, index) {
  var prog = Store.state.objectives[obj.id];
  var target = U.widgetTarget(obj.id);
  var stamp;
  if (prog && prog.passed) {
    stamp = '<span class="lab-mono stamp stamp-pass-2">STAMPED PASS' + (prog.attempts > 1 ? " · " + prog.attempts + " ATTEMPTS" : " · 1ST TRY") + "</span>";
  } else {
    stamp = '<span class="lab-mono stamp stamp-open">OPEN' + (prog && prog.attempts ? " · " + prog.attempts + " ATTEMPTS" : "") + "</span>";
  }
  return '<li class="lab-sheet pad-4 obj-card">' +
    '<div class="obj-card-head">' +
    '<span class="lab-mono obj-num"><span aria-hidden="true" class="text-signal">' + String(index + 1).padStart(2, "0") + "</span> " + obj.id + "</span>" +
    U.pillarBadge(obj.pillar) +
    stamp +
    '<span class="grow"></span>' +
    (target
      ? '<button type="button" class="btn btn-ghost btn-xs text-signal" data-act="goto-widget" data-sheet="' + target.sheet + '" data-tab="' + esc(target.tab) + '" data-fkey="where-' + obj.id + '">→ ' + U.targetLabel(target) + "</button>"
      : "") +
    "</div>" +
    '<h3 class="obj-title">' + esc(obj.title) + "</h3>" +
    '<p class="obj-brief">' + esc(obj.brief) + "</p>" +
    '<p class="lab-mono obj-anchor">COVERS: ' + esc(obj.anchor) + "</p>" +
    hintBlock(obj) +
    '<div class="mt-3">' + U.objectiveCheck(obj.id) + "</div>" +
    "</li>";
}

function sheetChecklist() {
  var objectives = Store.objectives();
  var progress = Store.progress();
  var hard = Store.state.mode === "hard";
  var cards = objectives.map(function (o, i) { return objectiveCard(o, i); }).join("");
  return '<div class="container-lg stack">' +
    '<header class="lab-sheet pad-5">' +
    '<p class="lab-kicker">Sheet 04 · Inspection Checklist</p>' +
    '<h1 class="lab-mono sheet-h1 checklist-h1">' + U.icon("list-checks", 22, "text-signal") + " " + (hard ? "9 commissioning challenges" : "12 inspection lines") + "</h1>" +
    '<p class="sheet-sub">' +
    (hard
      ? "Broad, multi-step challenges. No where-to-look; the evidence is on the bench and two findings are red herrings. One scored nudge per challenge if you must."
      : "Work top to bottom. Each line has a 'where to look' pointer, free three-tier hints, and a check that explains itself. Wrong answers cost nothing but the attempt.") +
    "</p>" +
    '<div class="lab-mono checklist-progress">PROGRESS: <span class="text-signal">' + progress.passed + "/" + progress.total + " STAMPED</span></div>" +
    "</header>" +
    '<ol class="obj-list">' + cards + "</ol></div>";
}

// ── Sheet 05 · Commissioning Exam (js/quiz.js renders it) ────────────────────

// ── Sheet 06 · As-Built Notes ────────────────────────────────────────────────
function debriefBlock(b) {
  return '<section class="lab-sheet pad-5">' +
    '<p class="lab-kicker">' + esc(b.kicker) + "</p>" +
    '<h2 class="lab-mono ab-h2">' + esc(b.title) + "</h2>" +
    '<ul class="dot-list">' +
    b.bullets.map(function (x) { return '<li class="ab-li"><span aria-hidden="true" class="li-dot li-dot-loose"></span><span>' + x + "</span></li>"; }).join("") +
    "</ul></section>";
}

function sheetAsBuilt() {
  var env = Store.state.env;
  var ssidRows = env.ssids.map(function (s2) {
    return "<tr>" +
      '<td class="lab-mono ab-ssid">' + s2.id + "</td>" +
      '<td class="lab-mono">' + esc(s2.name) + (s2.hidden ? " (hidden)" : "") + "</td>" +
      "<td>" + s2.security + "</td>" +
      "<td>" + s2.authType + (s2.authType === "dot1x" && s2.radiusHost ? " → " + esc(s2.radiusHost) + ":" + (s2.radiusPort || "?") : "") + "</td>" +
      "<td>" + (s2.id === "guest"
        ? (s2.isolation ? "isolation" : "no isolation") + " · " + (s2.portal ? "portal" : "no portal") + " · VLAN " + (s2.vlan || "—") + " · cap " + (s2.rateLimitMbps || "none")
        : "—") +
      "</td></tr>";
  }).join("");
  var plan24 = env.aps.filter(function (a) { return a.radios["2.4"] && a.radios["2.4"].channel; }).map(function (a) { return a.id + "=CH" + a.radios["2.4"].channel; }).join(" · ") || "no channels set";
  var plan5 = env.aps.filter(function (a) { return a.radios["5"] && a.radios["5"].channel; }).map(function (a) { return a.id + "=CH" + a.radios["5"].channel; }).join(" · ") || "no channels set";
  var links = D.LINKS.map(function (l) {
    return '<li class="ab-li-link">' + U.refLink(l.href, esc(l.label)) + '<span class="link-note">' + esc(l.note) + "</span></li>";
  }).join("");
  return '<div class="container-lg stack">' +
    '<header class="lab-sheet pad-5"><p class="lab-kicker">Sheet 06 · As-Built Notes</p>' +
    '<h1 class="lab-mono sheet-h1 ab-h1">' + U.icon("file-check-2", 22, "text-signal") + ' What you know now — and what you leave behind</h1></header>' +
    '<section class="lab-sheet pad-5">' +
    '<p class="lab-kicker">Your commissioning record</p>' +
    '<h2 class="lab-mono ab-h2">The network as you left it</h2>' +
    '<div class="table-scroll lab-scroll"><table class="lab-table">' +
    "<thead><tr>" + ["SSID DRAWER", "NAME", "SECURITY", "AUTH", "GUEST FENCE"].map(function (h) { return '<th class="lab-mono">' + h + "</th>"; }).join("") + "</tr></thead>" +
    "<tbody>" + ssidRows + "</tbody></table></div>" +
    '<div class="ab-grid">' +
    '<p class="lab-mono ab-box">2.4 GHz PLAN: ' + esc(plan24) + "</p>" +
    '<p class="lab-mono ab-box">5 GHz PLAN: ' + esc(plan5) + "</p>" +
    '<p class="lab-mono ab-box">WPS: ' + (env.wpsEnabled ? '<span class="text-brick ab-strong">STILL ENABLED</span>' : '<span class="text-pine ab-strong">DISABLED</span>') + "</p>" +
    '<p class="lab-mono ab-box">BEACONS TAGGED: ' + Object.keys(env.tags).length + "/9 · GUEST RIG: " + (env.guestTest === "pass" ? "PASSING" : env.guestTest === "fail" ? "FAILING" : "NOT RUN") + "</p>" +
    "</div>" +
    '<p class="note-soft">This table is generated from your bench state — the same discipline a real as-built demands: what is on the air, where, with which crypto, and what still needs a signature.</p>' +
    "</section>" +
    debriefBlock(D.DEBRIEF_DETECTION) +
    debriefBlock(D.DEBRIEF_MITIGATION) +
    '<div class="ab-two-col">' + debriefBlock(D.DEBRIEF_BLUE) + debriefBlock(D.DEBRIEF_RED) + "</div>" +
    '<section class="lab-sheet pad-5">' +
    '<p class="lab-kicker">Primary sources</p>' +
    '<h2 class="lab-mono ab-h2">Official references (open in new tabs)</h2>' +
    '<ul class="link-list">' + links + "</ul>" +
    "</section></div>";
}

// ── Completion modal (C7) ────────────────────────────────────────────────────
function focusAreas() {
  var s = Store.state;
  var objectives = Store.objectives();
  var items = [];
  objectives.forEach(function (o) {
    var p = s.objectives[o.id];
    if (!p) return;
    if (p.attempts > 1 && p.hintsUsed > 0) items.push(o.id + " took " + p.attempts + " attempts and a hint — re-read: " + o.anchor + ".");
    else if (p.attempts > 1) items.push(o.id + " took " + p.attempts + " attempts — re-read: " + o.anchor + ".");
    else if (p.hintsUsed > 0) items.push(o.id + " was stamped with a hint — re-read: " + o.anchor + ".");
  });
  var list = s.mode === "hard" ? D.QUIZ_HARD : D.QUIZ_MEDIUM;
  list.forEach(function (q) {
    if (s.quiz[q.id] !== undefined && s.quiz[q.id] !== q.answer) {
      items.push("Exam miss (" + q.id + ") — review the " + q.topic + " area on Sheet 02.");
    }
  });
  return items;
}

function completionModal() {
  var s = Store.state;
  var progress = Store.progress();
  var quizStats = Store.quizStats();
  var stars = Store.stars();
  var complete = progress.allPassed && s.quizSubmitted;
  var focus = complete ? focusAreas() : [];
  var pillarRecap = ["P1", "P2", "P3", "P4"].map(function (p) {
    var list = Store.objectives().filter(function (o) { return o.pillar === p; });
    var passed = list.filter(function (o) { return s.objectives[o.id] && s.objectives[o.id].passed; }).length;
    var marks = list.map(function (_, i) {
      return i < passed ? U.icon("circle-check-big", 16, "text-pine") : U.icon("circle", 16, "icon-line");
    }).join("");
    return '<li class="pillar-row">' +
      '<span class="lab-mono pillar-badge ' + D.PILLAR_META[p].cls + '">' + p + " · " + D.PILLAR_META[p].label + "</span>" +
      '<span class="pillar-marks" aria-hidden="true">' + marks + "</span>" +
      '<span class="lab-mono pillar-count">' + passed + "/" + list.length + "</span></li>";
  }).join("");
  var starsHtml = "";
  if (complete) {
    var starIcons = [1, 2, 3, 4, 5].map(function (i) {
      return i <= stars ? U.icon("star", 32, "", { fill: "#C2410C" }) : U.icon("star", 32, "star-off");
    }).join("");
    starsHtml = '<div class="anim-pop">' +
      '<div class="stars-row" role="img" aria-label="' + stars + ' of 5 stars">' + starIcons + "</div>" +
      '<p class="lab-kicker stars-caption">' + stars + "/5 STARS — FIRST-ATTEMPT ACCURACY, HINT USE &amp; EXAM</p></div>";
  }
  var focusHtml = "";
  if (complete) {
    focusHtml = '<div class="focus-box">' +
      '<p class="lab-mono focus-title">' + U.icon("crosshair", 16, "text-brick") + ' FOCUS AREAS — WHERE TO DRILL NEXT</p>' +
      (focus.length > 0
        ? '<ul class="disc-list">' + focus.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + "</ul>"
        : '<p class="focus-none">No weak signals in this run — every line stamped first-try, no hints, exam fully correct. For spaced review, re-read the As-Built detection &amp; mitigation blocks (Sheet 06) and trace each mitigation back to the control you configured.</p>') +
      "</div>";
  }
  var doneOrTodo;
  if (complete) {
    doneOrTodo = '<div class="next-box">' +
      '<p class="lab-mono next-title">' + U.icon("award", 16, "text-signal") + ' WHAT YOU CAN NOW DO</p>' +
      '<ul class="disc-list">' +
      "<li>Explain every N10-009 2.3 sub-topic — bands, channels, SSIDs, types, encryption, guest fencing, authentication, antennas, AP types — and the attacker value of each.</li>" +
      "<li>Recognize rogues, clones and policy violations in raw beacon evidence (and leave the red herrings alone).</li>" +
      "<li>Choose and defend detection approaches: inventory diffs, spectrum surveys, isolation test rigs.</li>" +
      "<li>Select mitigations and name the residual risks — including the official ones (M1031, M1017, T1557.004).</li>" +
      "</ul>" +
      '<p class="lab-mono next-bench">NEXT ON THE BENCH:</p>' +
      '<ul class="next-list">' +
      "<li>• Swap modes — the other difficulty reshapes the same bench into a different exam.</li>" +
      "<li>• Continue Domain 2.0 of " + U.refLink("https://www.comptia.org/en-us/certifications/network/", "CompTIA Network+ N10-009") + ", then the practice exams.</li>" +
      "<li>• Re-read the " + U.refLink("https://attack.mitre.org/techniques/T1557/004/", "Evil Twin (T1557.004)") + " page and trace every mitigation back to a control you configured.</li>" +
      "</ul></div>";
  } else {
    var remaining = progress.total - progress.passed;
    doneOrTodo = '<div class="next-box"><p class="lab-mono next-title">TO REACH SIGN-OFF:</p>' +
      '<ul class="next-list">' +
      "<li>• Stamp " + remaining + " more objective" + (remaining === 1 ? "" : "s") + " on the Inspection Checklist.</li>" +
      (!s.quizSubmitted ? "<li>• Sit the Commissioning Exam (Sheet 05) and submit it.</li>" : "") +
      "</ul></div>";
  }
  return '<div class="modal-overlay" data-act="modal-overlay"><div class="modal-card lab-sheet" role="dialog" aria-modal="true" aria-labelledby="modal-title">' +
    '<button type="button" class="modal-close" data-act="modal-close" aria-label="Close">' + U.icon("x", 16) + '<span class="sr-only">Close</span></button>' +
    '<div class="modal-head"><h2 class="lab-mono modal-title" id="modal-title">' + (complete ? "PROJECT SIGNED OFF" : "PROJECT STATUS") + "</h2>" +
    '<p class="modal-desc">' + (complete
      ? "The drawing set is stamped and the library's network is commissioned. Here is what the record says you can now do."
      : "The commissioning is not finished yet — here is exactly what remains.") + "</p></div>" +
    starsHtml +
    '<div class="stat-grid">' +
    '<div class="stat-box"><p class="lab-mono stat-num">' + progress.passed + "/" + progress.total + '</p><p class="lab-kicker">OBJECTIVES STAMPED</p></div>' +
    '<div class="stat-box"><p class="lab-mono stat-num">' + (s.quizSubmitted ? quizStats.correct + "/" + quizStats.total : "—") + '</p><p class="lab-kicker">EXAM SCORE</p></div>' +
    "</div>" +
    focusHtml +
    '<div><p class="lab-kicker recap-caption">Mastery recap by pillar</p><ul class="pillar-list">' + pillarRecap + "</ul></div>" +
    doneOrTodo +
    '<div class="modal-btns">' +
    '<button type="button" class="btn btn-outline-ink flex-1" data-act="modal-close" data-fkey="modal-close">KEEP WORKING THE BENCH</button>' +
    '<button type="button" class="btn btn-ink flex-1" data-act="modal-asbuilt" data-fkey="modal-asbuilt">AS-BUILT NOTES ' + U.icon("arrow-right", 14) + "</button>" +
    "</div></div></div>";
}

// ── Reset AlertDialog ────────────────────────────────────────────────────────
function resetDialog() {
  return '<div class="modal-overlay" data-overlay-alert><div class="modal-card lab-sheet" role="alertdialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-desc">' +
    '<div class="modal-head"><h2 class="lab-mono modal-title" id="reset-title">RESET THE DRAWING SET?</h2>' +
    '<p class="modal-desc" id="reset-desc">This shreds every stamp, answer, configuration and exam result and returns the bench to its pristine (deliberately flawed) state. There is no undo — commissioning is forever.</p></div>' +
    '<div class="modal-btns">' +
    '<button type="button" class="btn btn-outline-ink h-10 flex-1" data-act="reset-cancel" data-fkey="reset-cancel">KEEP MY PROGRESS</button>' +
    '<button type="button" class="btn btn-brick h-10 flex-1" data-act="reset-confirm" data-fkey="reset-confirm">RESET EVERYTHING</button>' +
    "</div></div></div>";
}

window.LabViews = {
  SHEETS: SHEETS, BENCH_TABS: BENCH_TABS,
  titleBlock: titleBlock, clipboardChip: clipboardChip, modeSelect: modeSelect,
  sheetBrief: sheetBrief, sheetReference: sheetReference, sheetBench: sheetBench,
  benchPlan: benchPlan, benchRack: benchRack, benchAir: benchAir, benchDesk: benchDesk,
  sheetChecklist: sheetChecklist, sheetExam: null, sheetAsBuilt: sheetAsBuilt,
  completionModal: completionModal, resetDialog: resetDialog,
};
