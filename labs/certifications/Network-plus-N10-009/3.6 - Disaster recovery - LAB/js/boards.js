// Operation THAWLINE — static port: the seven content boards (quiz board lives
// in quiz.js). Faithful re-renders of src/components/lab/boards/*.tsx.
// Depends on globals: LabUI, LabData, LabObjectives, LabStore, shuffledBySeed.

var LabBoards = (function () {
  "use strict";

  const D = () => LabData;
  const S = () => LabStore;
  const U = () => LabUI;
  const O = () => LabObjectives;

  /* module-local UI state: Records Room's selected document tab (the original
     kept this in a non-persisted useState that reset on board change) */
  let recordsDoc = "DOC-01";
  function resetRecordsDoc() {
    recordsDoc = "DOC-01";
  }
  function setDoc(doc) {
    recordsDoc = doc;
  }

  /* ---------------- board 01 — briefing ---------------- */

  function briefing(mode) {
    const u = U();
    const boxes = [
      {
        border: "var(--spruce)", color: "var(--spruce)", icon: "ShieldAlert", title: "The case",
        text: "IR-2043: the primary data center died on a Friday night. Recovery ran all weekend — and missed two of its own objectives.",
      },
      {
        border: "var(--primary)", color: "var(--primary)", icon: "ClipboardCheck", title: "Your desk",
        text: "Reconstruct the incident from the records, run the failover drill, audit achieved-vs-objective, then design the fixes and the test program.",
      },
      {
        border: "var(--olive)", color: "var(--olive)", icon: "GraduationCap", title: "The syllabus",
        text: "RPO · RTO · MTTR · MTBF · cold/warm/hot sites · active-active/passive · DR testing — the full disaster-recovery objective set of the chapter.",
      },
    ];
    let boxesHtml = "";
    for (const b of boxes) {
      boxesHtml +=
        '<div class="brief-box" style="border-color:' + b.border + '">' + u.icon(b.icon, "icon-" + b.title) +
        '<h3>' + b.title + "</h3><p>" + b.text + "</p></div>";
    }
    return (
      '<div class="board">' +
      u.sectionTitle("Scenario Briefing", "Board 01") +
      '<div class="stamp-row">' +
      u.stamp("Training data — fictional", "red") +
      u.stamp("CompTIA Network+ N10-009 · DR objectives", "spruce") +
      "</div>" +
      '<div class="brief-card anim-brief">' +
      '<div class="brief-memo-head">CONTINUITY STEERING COMMITTEE — BRIEFING MEMO · ' + u.esc(D().EXERCISE) + "</div>" +
      D().BRIEFING_PARAS.map((p) => '<p class="brief-para">' + u.esc(p) + "</p>").join("") +
      "</div>" +
      '<div class="brief-grid">' + boxesHtml + "</div>" +
      '<p class="brief-foot">' + u.esc(D().ORG) + " is a fictional company; every document, vendor, SLA and figure on this desk is synthetic training material. The recovery numbers are internally consistent so every metric can be derived from the evidence — that is the exercise. Mode in progress: <strong>" +
      (mode === "hard" ? "HARD — live audit" : "MEDIUM — guided drill") + "</strong>.</p>" +
      "</div>"
    );
  }

  /* ---------------- board 02 — field manual ---------------- */

  const METRICS = [
    { id: "rpo", name: "RPO", kind: "Planning objective", body: "Maximum tolerable data loss. Measured in time (age of the newest recovery point). Bought with backup / replication frequency." },
    { id: "rto", name: "RTO", kind: "Planning objective", body: "Maximum tolerable downtime. Measured from failure to restored service. Bought with site tier, redundancy — and fast declaration." },
    { id: "mtbf", name: "MTBF", kind: "Observed measure", body: "Mean time BETWEEN failures. Reliability: higher is better. Computed as in-service hours ÷ failure count." },
    { id: "mttr", name: "MTTR", kind: "Observed measure", body: "Mean time to repair. Maintainability: lower is better. Computed as total repair time ÷ repair count." },
  ];

  // Matching pools deterministically shuffled (R6) — same seeds as the original.
  const M1_DEF_OPTIONS = shuffledBySeed(D().M1_DEFS, "m1-defs").map((d) => ({ value: d.id, label: d.text }));
  const M2_TIER_OPTIONS = shuffledBySeed(
    [
      { value: "cold", label: "Cold site" },
      { value: "warm", label: "Warm site" },
      { value: "hot", label: "Hot site" },
    ],
    "m2-tiers"
  );
  const M3_MODEL_OPTIONS = shuffledBySeed(
    [
      { value: "aa", label: "Active-active" },
      { value: "ap", label: "Active-passive" },
    ],
    "m3-models"
  );
  const M3_ROWS = shuffledBySeed(D().M3_STATEMENTS, "m3-rows");
  const M4_TEST_OPTIONS = shuffledBySeed(
    [
      { value: "tabletop", label: "Tabletop exercise" },
      { value: "walkthrough", label: "Walkthrough" },
      { value: "simulation", label: "Simulation" },
      { value: "parallel", label: "Parallel test" },
      { value: "full", label: "Full interruption test" },
    ],
    "m4-tests"
  );

  function recoveryCurveFigure() {
    /* SVG copied 1:1 from field-manual.tsx (attribute style inlined) */
    return (
      '<figure class="curve-fig">' +
      '<figcaption class="curve-cap">FrostLine recovery curve — Winter Storm Vesper, IR-2043 (illustrative; not to scale)</figcaption>' +
      '<svg viewBox="0 0 640 168" class="curve-svg" role="img" aria-label="Recovery curve: last recovery point 22:00, incident start 22:03, service restored 23:27. Data-loss window 3 minutes, downtime 84 minutes.">' +
      '<text x="16" y="20" fontSize="12" fontWeight="700" fill="#29261B" style="font-family:var(--font-plex-mono)">service state</text>' +
      '<line x1="40" y1="58" x2="90" y2="58" stroke="#3F6B33" strokeWidth="3"></line>' +
      '<line x1="90" y1="58" x2="240" y2="58" stroke="#B45309" strokeWidth="3" strokeDasharray="6 4"></line>' +
      '<line x1="240" y1="58" x2="520" y2="58" stroke="#A3352B" strokeWidth="4"></line>' +
      '<line x1="520" y1="58" x2="600" y2="58" stroke="#3F6B33" strokeWidth="3"></line>' +
      '<text x="44" y="46" fontSize="10" fill="#3F6B33" style="font-family:var(--font-plex-mono)">serving</text>' +
      '<text x="96" y="46" fontSize="10" fill="#92400E" style="font-family:var(--font-plex-mono)">writes at risk</text>' +
      '<text x="300" y="46" fontSize="10" fill="#A3352B" style="font-family:var(--font-plex-mono)">service down</text>' +
      '<text x="526" y="46" fontSize="10" fill="#3F6B33" style="font-family:var(--font-plex-mono)">restored</text>' +
      '<line x1="90" y1="40" x2="90" y2="120" stroke="#B45309" strokeWidth="1.5" strokeDasharray="3 3"></line>' +
      '<line x1="240" y1="40" x2="240" y2="120" stroke="#A3352B" strokeWidth="1.5" strokeDasharray="3 3"></line>' +
      '<line x1="520" y1="40" x2="520" y2="120" stroke="#1E4D45" strokeWidth="1.5" strokeDasharray="3 3"></line>' +
      '<rect x="90" y="88" width="150" height="26" fill="#B45309" opacity="0.14" stroke="#B45309" rx="3"></rect>' +
      '<text x="165" y="105" fontSize="11" fontWeight="700" fill="#92400E" textAnchor="middle" style="font-family:var(--font-plex-mono)">RPO · 3 min</text>' +
      '<rect x="240" y="88" width="280" height="26" fill="#A3352B" opacity="0.12" stroke="#A3352B" rx="3"></rect>' +
      '<text x="380" y="105" fontSize="11" fontWeight="700" fill="#A3352B" textAnchor="middle" style="font-family:var(--font-plex-mono)">RTO · 84 min</text>' +
      '<text x="90" y="140" fontSize="11" fill="#29261B" textAnchor="middle" style="font-family:var(--font-plex-mono)">22:00</text>' +
      '<text x="90" y="153" fontSize="9" fill="#6E6754" textAnchor="middle" style="font-family:var(--font-plex-mono)">last sync (recovery point)</text>' +
      '<text x="240" y="140" fontSize="11" fill="#29261B" textAnchor="middle" style="font-family:var(--font-plex-mono)">22:03</text>' +
      '<text x="240" y="153" fontSize="9" fill="#6E6754" textAnchor="middle" style="font-family:var(--font-plex-mono)">t0 — hall down</text>' +
      '<text x="520" y="140" fontSize="11" fill="#29261B" textAnchor="middle" style="font-family:var(--font-plex-mono)">23:27</text>' +
      '<text x="520" y="153" fontSize="9" fill="#6E6754" textAnchor="middle" style="font-family:var(--font-plex-mono)">hot site serving</text>' +
      "</svg></figure>"
    );
  }

  function manual(mode) {
    const u = U();
    const answers = S().state.answers;
    const hosted = O().objectivesForBoard("manual", mode);
    const def = (id) => hosted.find((o) => o.id === id);

    let metricCards = "";
    for (const m of METRICS) {
      metricCards +=
        '<div class="metric-card" style="border-color:' + (m.kind === "Planning objective" ? "var(--spruce)" : "var(--primary)") + '">' +
        '<div class="metric-head"><span class="metric-name">' + m.name + "</span>" +
        '<span class="metric-kind" style="background:' + (m.kind === "Planning objective" ? "var(--spruce)" : "var(--primary)") + '">' + m.kind + "</span></div>" +
        '<p class="metric-body">' + m.body + "</p></div>";
    }

    let m1Cells = "";
    for (const m of METRICS) {
      m1Cells +=
        '<div class="m1-cell"><div class="m1-cell-name">' + m.name + "</div>" +
        u.matchSelect("m1." + m.id, answers["m1." + m.id] ?? "", M1_DEF_OPTIONS, "Pick the definition…", "Select the definition of " + m.name) +
        "</div>";
    }

    let m2Cards = "";
    for (const c of D().M2_CARDS) {
      m2Cards +=
        '<div class="m2-card"><p class="m2-card-text">' + u.esc(c.text) + "</p>" +
        u.matchSelect("m2." + c.id, answers["m2." + c.id] ?? "", M2_TIER_OPTIONS, "Which tier…?", "Select the site tier for profile " + c.id) +
        "</div>";
    }

    let m3Rows = "";
    for (const s of M3_ROWS) {
      m3Rows +=
        '<div class="m3-row"><p class="m3-text">' + u.esc(s.text) + "</p>" +
        u.matchSelect("m3." + s.id, answers["m3." + s.id] ?? "", M3_MODEL_OPTIONS, "Which model…?", "Classify statement " + s.id) +
        "</div>";
    }

    const ladder = [
      { n: 1, t: "Tabletop exercise", d: "Discussion around a table; no systems touched.", risk: 1 },
      { n: 2, t: "Walkthrough", d: "Structured step-by-step pass; roles followed on paper.", risk: 1 },
      { n: 3, t: "Simulation", d: "DR activities in an isolated environment; production safe.", risk: 2 },
      { n: 4, t: "Parallel test", d: "Recovery systems run alongside production — proven without interruption.", risk: 3 },
      { n: 5, t: "Full interruption", d: "Real failover; production goes down. Highest proof, highest risk.", risk: 5 },
    ];
    let ladderHtml = "";
    for (const row of ladder) {
      let bars = "";
      for (let i = 1; i <= 5; i++) bars += '<span class="risk-bar ' + (i <= row.risk ? "risk-on" : "risk-off") + '" aria-hidden="true"></span>';
      ladderHtml +=
        '<li class="ladder-row"><span class="ladder-n">' + row.n + '.</span>' +
        '<div class="ladder-body"><span class="ladder-t">' + row.t + '</span><span class="ladder-d"> — ' + row.d + "</span></div>" +
        '<span class="ladder-risk" aria-label="risk level ' + row.risk + ' of 5">' + bars + "</span></li>";
    }

    let m4Cards = "";
    for (const c of D().M4_CARDS) {
      m4Cards +=
        '<div class="m4-card"><p class="m4-card-text">' + u.esc(c.text) + "</p>" +
        u.matchSelect("m4." + c.id, answers["m4." + c.id] ?? "", M4_TEST_OPTIONS, "Which test type…?", "Select the test type for description " + c.id) +
        "</div>";
    }

    return (
      '<div class="board">' +
      u.sectionTitle("Field Manual — the four numbers &amp; the ladders", "Board 02") +
      '<section class="fm-section" aria-labelledby="m-four"><h3 class="fm-h3" id="m-four">1 · The four numbers</h3>' +
      '<p class="fm-lede">Two are <strong>chosen</strong> with the business (they end in &ldquo;Objective&rdquo;); two are <strong>measured</strong> from your equipment&apos;s history. Keep the pairs straight — exams and audits both do.</p>' +
      '<div class="metric-grid">' + metricCards + "</div>" +
      '<p class="fm-note">Availability ties the observed pair together: <span class="fm-mono">A = MTBF / (MTBF + MTTR)</span>. Example: MTBF 2,000 h and MTTR 4 h gives 2,000 / 2,004 ≈ 99.8%.</p>' +
      "</section>" +
      (def("M1") ? u.taskPanel(def("M1"), mode, '<div class="m1-grid">' + m1Cells + "</div>") : "") +
      '<section class="fm-section" aria-labelledby="m-curve"><h3 class="fm-h3" id="m-curve">2 · The recovery curve</h3>' +
      '<p class="fm-lede">Every incident has the same shape: the last recovery point, the failure (t0), and the restoration. Everything <em>left of t0</em> measures data loss (RPO); everything <em>right of t0</em> measures downtime (RTO).</p>' +
      recoveryCurveFigure() +
      "</section>" +
      '<section class="fm-section" aria-labelledby="m-sites"><h3 class="fm-h3" id="m-sites">3 · The site tier ladder</h3>' +
      '<div class="table-scroll"><table class="data-table six min-w"><caption class="visually-hidden">Site tiers: cold, warm, hot with contents, recovery band and cost</caption>' +
      '<thead class="spruce-head"><tr><th>Tier</th><th>What is in the room</th><th>Recovery band</th><th>Cost</th></tr></thead>' +
      '<tbody>' +
      '<tr><td class="td-bold">Cold</td><td>Shell space: power, cooling, connectivity — no hardware, no data</td><td class="td-doc">days (4–5 business days)</td><td>$ (retainer)</td></tr>' +
      '<tr><td class="td-bold">Warm</td><td>Hardware racked + base configs; restore data from backups on arrival</td><td class="td-doc">hours (4–6 h)</td><td>$$</td></tr>' +
      '<tr><td class="td-bold">Hot</td><td>Mirrored replica receiving near-real-time replication</td><td class="td-doc">minutes (20–30 min)</td><td>$$$ (premium)</td></tr>' +
      "</tbody></table></div>" +
      '<p class="fm-note mt-2">Rule of thumb: <strong>tier follows RTO</strong>. A 60-minute RTO cannot live on a tier that needs days. Adjacent variants (mobile sites, cloud/DRaaS) exist but are outside this lesson&apos;s scope.</p>' +
      "</section>" +
      (def("M2") ? u.taskPanel(def("M2"), mode, '<div class="flex-col-gap">' + m2Cards + "</div>", "The profiles come straight from the vendor sheets (DOC-05).") : "") +
      '<section class="fm-section" aria-labelledby="m-models"><h3 class="fm-h3" id="m-models">4 · Redundancy models</h3>' +
      '<div class="model-grid">' +
      '<div class="model-card" style="border-color:var(--spruce)"><div class="model-title" style="color:var(--spruce)">Active-active</div>' +
      '<ul><li>All nodes/sites serve live traffic simultaneously</li><li>Failover is seamless — users may never notice</li><li>Needs load balancing (or equivalent) to spread traffic</li><li>Premium: capacity is paid for on both sides</li><li>Survives planned maintenance without a failover event</li></ul></div>' +
      '<div class="model-card" style="border-color:var(--primary)"><div class="model-title" style="color:var(--amber-dark)">Active-passive</div>' +
      '<ul><li>One side serves; a standby waits for failover</li><li>Recovery time includes bringing the passive side up</li><li>Usually cheaper — the standby may be smaller or underused</li><li>The default model for portals, ERP and batch systems</li></ul></div>' +
      "</div></section>" +
      (def("M3") ? u.taskPanel(def("M3"), mode, '<div class="flex-col-gap">' + m3Rows + "</div>") : "") +
      '<section class="fm-section" aria-labelledby="m-tests"><h3 class="fm-h3" id="m-tests">5 · The testing ladder</h3>' +
      '<p class="fm-lede">Five rehearsals, rising in realism, cost and risk. Programs climb the ladder — nobody&apos;s first drill is a production takedown.</p>' +
      '<ol class="ladder">' + ladderHtml + "</ol></section>" +
      (def("M4") ? u.taskPanel(def("M4"), mode, '<div class="flex-col-gap">' + m4Cards + "</div>") : "") +
      "</div>"
    );
  }

  /* ---------------- board 03 — records room ---------------- */

  function records(mode) {
    const u = U();
    const answers = S().state.answers;
    const hosted = O().objectivesForBoard("records", mode);
    const def = (id) => hosted.find((o) => o.id === id);
    const doc = D().DOCS.find((d) => d.code === recordsDoc) || D().DOCS[0];

    let tabs = "";
    for (const d of D().DOCS) {
      tabs +=
        '<button type="button" class="doc-tab' + (d.code === doc.code ? " active" : "") + '" data-action="set-doc" ' +
        'data-doc="' + d.code + '" data-focus-id="doc-tab-' + d.code + '"' +
        (d.code === doc.code ? ' aria-current="true"' : "") + ">" +
        '<span class="doc-tab-code">' + u.icon("FileText") + d.code + "</span>" +
        '<span class="doc-tab-title">' + u.esc(d.title) + "</span>" +
        '<span class="doc-tab-tag">' + u.esc(d.tag) + "</span></button>";
    }

    const h5opts = [
      { id: "a", label: "Proposal A — hourly replication to Lakeshore warm site, active-passive" },
      { id: "b", label: "Proposal B — Beacon Ridge active-active, 5-minute replication" },
    ];
    let h5radios = "";
    for (const opt of h5opts) {
      h5radios +=
        '<label class="radio-row"><input type="radio" name="h5choice" data-answer-key="h5.choice" ' +
        'value="' + opt.id + '"' + ((answers["h5.choice"] ?? "") === opt.id ? " checked" : "") + "/>" +
        "<span>" + opt.label + "</span></label>";
    }

    function field(labelText, akey, placeholder, aria) {
      return (
        '<div class="max-w-md"><label class="field-label">' + labelText + "</label>" +
        u.answerInput(akey, answers[akey] ?? "", placeholder, aria) +
        "</div>"
      );
    }

    return (
      '<div class="board">' +
      u.sectionTitle("Records Room — the paper trail", "Board 03") +
      '<div class="records-grid">' +
      '<nav class="doc-nav" aria-label="Document list">' + tabs + "</nav>" +
      '<article class="doc-sheet" aria-label="Document ' + doc.code + '" id="records-doc">' +
      '<div class="doc-sheet-head">' + u.icon("FolderOpen") +
      '<span class="doc-sheet-code">' + doc.code + "</span>" +
      '<span class="doc-sheet-title">' + u.esc(doc.title) + "</span>" +
      (doc.code === "DOC-08" ? u.stamp("Unverified", "red") : "") +
      "</div>" +
      '<pre class="doc-pre">' + u.esc(doc.lines.join("\n")) + "</pre>" +
      "</article></div>" +
      '<div class="work-orders">' +
      (def("M5") ? u.taskPanel(def("M5"), mode, field("MTTR in hours (qualifying outage tickets only)", "m5", "e.g. 2.5", "MTTR in hours")) : "") +
      (def("M6") ? u.taskPanel(def("M6"), mode, field("MTBF in hours (in-service 2,200 h ÷ failures)", "m6", "e.g. 550", "MTBF in hours")) : "") +
      (def("M7") ? u.taskPanel(def("M7"), mode, field("FrostLine data lost, in minutes (achieved RPO)", "m7", "e.g. 5", "FrostLine achieved RPO in minutes")) : "") +
      (def("M8") ? u.taskPanel(def("M8"), mode, field("ShipGate downtime (achieved RTO) — accepts 9h12m, 9:12 or 552", "m8", "e.g. 9h 12m", "ShipGate achieved RTO")) : "") +
      (def("H6")
        ? u.taskPanel(def("H6"), mode,
            '<div class="h6-grid">' +
            '<div><label class="field-label">Genuine outages (#)</label>' + u.answerInput("h6.count", answers["h6.count"] ?? "", "#", "Number of genuine outage tickets") + "</div>" +
            '<div><label class="field-label">MTTR (h)</label>' + u.answerInput("h6.mttr", answers["h6.mttr"] ?? "", "h", "MTTR in hours") + "</div>" +
            '<div><label class="field-label">MTBF (h)</label>' + u.answerInput("h6.mtbf", answers["h6.mtbf"] ?? "", "h", "MTBF in hours") + "</div>" +
            "</div>",
            "The log contains noise: a perf ticket, an unrelated printer, a dismissed alert.")
        : "") +
      (def("H7") ? u.taskPanel(def("H7"), mode,
          '<div class="max-w-2xl"><label class="field-label">Quote the key phrase from DOC-04 (a fragment is fine — it must contain the recovery-point frequency)</label>' +
          u.answerInput("h7.quote", answers["h7.quote"] ?? "", "e.g. full backup to vault …", "Quoted line from the recovery-point schedule") + "</div>") : "") +
      (def("H5")
        ? u.taskPanel(def("H5"), mode,
            '<div class="flex-col-gap max-w-2xl">' +
            '<fieldset class="fieldset"><legend>Which proposal is compliant?</legend><div class="mt-2 flex-col-gap">' + h5radios + "</div></fieldset>" +
            "<div><label class=\"field-label\">The clause that disqualifies the OTHER proposal:</label>" +
            u.matchSelect("h5.flaw", answers["h5.flaw"] ?? "", [
              { value: "budget", label: "It adds a second premium (hot-site) subscription — the CFO cap allows exactly one" },
              { value: "rto", label: "Its RTO would miss the 4-hour objective" },
              { value: "rpo", label: "Its RPO would miss the 1-hour objective" },
              { value: "model", label: "Active-active cannot serve customer portals" },
            ], "Pick the clause…", "Select the disqualifying clause") + "</div></div>",
            "Read DOC-07 (proposals) and DOC-06 (memo constraints) before deciding.")
        : "") +
      "</div></div>"
    );
  }

  /* ---------------- board 04 — storm drill ---------------- */

  function verdictChip(ok, label) {
    return '<span class="verdict ' + (ok ? "met" : "breach") + '">' + label + "</span>";
  }

  function drillOutcomesHtml(mode) {
    const u = U();
    const answers = S().state.answers;
    const declare = answers["drill.declare"] ?? "";

    let rows = "";
    for (const sid of D().SERVICE_ORDER) {
      const s = D().SERVICES[sid];
      const aid = answers["drill." + sid];
      const out = aid ? D().drillOutcome(sid, aid, declare || "verify") : null;
      rows +=
        '<tr><td><div class="td-bold">' + s.name + '</div><div class="drill-lane-sla">obj: ' + s.sla.rpoLabel + " / " + s.sla.rtoLabel + "</div></td>" +
        '<td class="td-max">' + (out ? u.esc(out.label) : "—") + "</td>" +
        '<td class="td-nowrap">' +
        (out && out.rpo !== null
          ? '<span class="cell-doc">' + D().fmtMin(out.rpo) + "</span> " + verdictChip(out.rpo <= s.sla.rpo, out.rpo <= s.sla.rpo ? "MET" : "BREACH")
          : '<span class="td-muted">—</span>') +
        "</td>" +
        '<td class="td-nowrap">' +
        (out && out.rto !== null
          ? '<span class="cell-doc">' + D().fmtMin(out.rto) + "</span> " + verdictChip(out.rto <= s.sla.rto, out.rto <= s.sla.rto ? "MET" : "BREACH")
          : '<span class="td-muted">—</span>') +
        "</td>" +
        '<td class="td-cost">' + (out ? u.esc(out.cost) : "—") + "</td></tr>";
    }

    const debrief =
      mode === "medium"
        ? "Read the ledger like an auditor: FrostLine loses only 3 minutes of data (5-min replication earns its keep) yet misses its 60-minute RTO — the 62-minute declaration is downtime you can train away. ShipGate breaches both objectives on nightly backups. LedgerRoom looks dramatic (55 h 57 min) but passes both — objectives are comparisons, not vibes."
        : "Current capability verdict: FrostLine complies ONLY with an immediate declaration (32 min); LedgerRoom complies at retainer cost on the cold site; ShipGate has NO compliant response — its nightly-only recovery point cannot honor a 1-hour RPO. Flagging that gap is the correct move; the fix lands in the Continuity Planner.";

    return (
      '<div class="table-scroll"><table class="data-table seven min-w"><caption class="visually-hidden">Drill outcome ledger: achieved RPO and RTO versus objectives per service</caption>' +
      '<thead class="ink-head"><tr><th>Service</th><th>Response</th><th>Data loss (RPO)</th><th>Downtime (RTO)</th><th>Cost</th></tr></thead>' +
      '<tbody>' + rows + "</tbody></table></div>" +
      '<div class="drill-debrief">' + debrief + "</div>"
    );
  }

  function drill(mode) {
    const u = U();
    const answers = S().state.answers;
    const setAnswer = S().setAnswer;
    const hosted = O().objectivesForBoard("drill", mode);
    const obj = hosted[0];
    const executed = answers["drill.executed"] === "1";
    const declare = answers["drill.declare"] ?? "";
    const allSelected = D().SERVICE_ORDER.every((s) => answers["drill." + s]) && declare !== "";

    const hardOptions = (sid) => {
      const base = D().DRILL_ACTIONS[sid].map((a) => ({ value: a.id, label: a.label }));
      if (mode === "hard") base.push({ value: "none", label: "No current response complies — flag for redesign" });
      return base;
    };

    let declareBtns = "";
    for (const d of D().DECLARATIONS) {
      const on = declare === d.id;
      declareBtns +=
        '<button type="button" class="declare-btn' + (on ? " on" : "") + '" data-action="set-answer" ' +
        'data-key="drill.declare" data-value="' + d.id + '" data-focus-id="declare-' + d.id + '" aria-pressed="' + on + '">' +
        '<span class="db-label">' + u.esc(d.label) + '</span><span class="db-note">' + u.esc(d.note) + "</span></button>";
    }

    let lanes = "";
    for (const sid of D().SERVICE_ORDER) {
      const s = D().SERVICES[sid];
      lanes +=
        '<div class="drill-lane"><div class="drill-lane-head"><span class="drill-lane-name">' + s.name + "</span>" +
        '<span class="drill-lane-sla">RPO ≤ ' + s.sla.rpoLabel + " · RTO ≤ " + s.sla.rtoLabel + "</span></div>" +
        '<p class="drill-lane-kind">' + u.esc(s.kind) + "</p>" +
        u.matchSelect("drill." + sid, answers["drill." + sid] ?? "", hardOptions(sid), "Choose response…", "Select the response for " + s.name) +
        "</div>";
    }

    const body =
      '<div class="flex-col-gap">' +
      '<div class="drill-declare-box"><div class="drill-declare-label">Declaration timing</div>' +
      '<div class="drill-declare-grid">' + declareBtns + "</div></div>" +
      '<div class="drill-lanes">' + lanes + "</div>" +
      '<div class="drill-exec-row">' +
      '<button type="button" class="btn btn-spruce btn-h11" data-action="execute-drill" ' +
      (!allSelected ? "disabled " : "") +
      'data-focus-id="exec-drill" ' +
      'aria-label="Execute the storm drill with the selected responses">' + u.icon("Zap") + "EXECUTE DRILL</button>" +
      (!allSelected
        ? '<span class="drill-exec-note">Select a response for all three services and a declaration timing to enable execution.</span>'
        : "") +
      "</div>" +
      '<div id="drill-outcomes" aria-live="polite">' +
      (executed ? drillOutcomesHtml(mode) : "") +
      "</div></div>";

    return (
      '<div class="board">' +
      u.sectionTitle("Storm Drill — the failover decision table", "Board 04") +
      '<div class="drill-event"><div class="drill-event-head">' + u.stamp("Simulated event", "red") +
      '<span class="drill-event-title">Winter Storm Vesper — 21:47</span></div>' +
      '<p>21:47 utility power lost (UPS carries). 22:03 generator cooling loop fails — the PDC hall thermally shuts down. All three services go dark at <span class="drill-t0">t0 = 22:03</span>. You hold the decision table below: pick each service&apos;s response, set the declaration timing, then execute.</p></div>' +
      (obj
        ? u.taskPanel(
            obj,
            mode,
            body,
            mode === "medium"
              ? "Replay IR-2043 exactly — then watch what the 62-minute declaration cost."
              : "Lowest cost that meets BOTH objectives per lane; declare immediately; flag impossibility honestly."
          )
        : "") +
      "</div>"
    );
  }

  /* ---------------- board 05 — recovery ledger ---------------- */

  function cribBox() {
    return (
      '<div class="crib-box"><div class="crib-label">Auditor&apos;s crib</div>' +
      '<ul class="crib-list">' +
      "<li><strong>achieved RPO</strong> = last recovery point → failure moment (data age, not downtime).</li>" +
      "<li><strong>achieved RTO</strong> = failure moment → service restored (clock keeps running through decisions and restores).</li>" +
      "<li><strong>breach</strong> = achieved is WORSE than the objective; compare numbers, never impressions.</li>" +
      "<li>Timestamps live in IR-2043 (DOC-01); objectives live on the SLA card (DOC-03).</li>" +
      "</ul></div>"
    );
  }

  function ledger(mode) {
    const u = U();
    const answers = S().state.answers;
    const hosted = O().objectivesForBoard("ledger", mode);
    const def = (id) => hosted.find((o) => o.id === id);

    let m9rows = "";
    for (const sid of D().SERVICE_ORDER) {
      const s = D().SERVICES[sid];
      const metBreach = [
        { value: "met", label: "MET — inside the objective" },
        { value: "breach", label: "BREACHED — worse than the objective" },
      ];
      m9rows +=
        '<tr><td><div class="td-bold">' + s.name + '</div><div class="drill-lane-sla">RPO ≤ ' + s.sla.rpoLabel + " · RTO ≤ " + s.sla.rtoLabel + "</div></td>" +
        '<td style="padding-right:16px">' + u.matchSelect("m9." + sid + "-rpo", answers["m9." + sid + "-rpo"] ?? "", metBreach, "met / breached…", s.name + " RPO met or breached") + "</td>" +
        '<td style="padding-right:16px">' + u.matchSelect("m9." + sid + "-rto", answers["m9." + sid + "-rto"] ?? "", metBreach, "met / breached…", s.name + " RTO met or breached") + "</td></tr>";
    }

    let h8cells = "";
    for (const slot of D().CURVE_SLOT_DEFS) {
      h8cells +=
        '<div class="h8-cell"><div class="h8-cell-label">' + u.esc(slot.label) + "</div>" +
        u.matchSelect("h8." + slot.id, answers["h8." + slot.id] ?? "", D().CURVE_VALUE_OPTIONS.map((v) => ({ value: v, label: v })), "Pick a value…", "Select the value for slot: " + slot.label) +
        "</div>";
    }

    let h1fields = "";
    const h1defs = [
      ["h1.fl_rpo", "FrostLine achieved RPO", "FrostLine achieved RPO in minutes"],
      ["h1.fl_rto", "FrostLine achieved RTO", "FrostLine achieved RTO in minutes"],
      ["h1.sg_rpo", "ShipGate achieved RPO", "ShipGate achieved RPO in minutes"],
      ["h1.sg_rto", "ShipGate achieved RTO", "ShipGate achieved RTO in minutes"],
    ];
    for (const [k, label, aria] of h1defs) {
      h1fields +=
        "<div><label class=\"field-label\">" + label + "</label>" +
        u.answerInput(k, answers[k] ?? "", "min", aria) + "</div>";
    }

    return (
      '<div class="board-tight">' +
      u.sectionTitle("Recovery Ledger — compute &amp; audit", "Board 05") +
      (def("M9")
        ? u.taskPanel(def("M9"), mode,
            '<div class="table-scroll"><table class="data-table five min-w"><caption class="visually-hidden">Compliance grid: for each service and metric, mark met or breached</caption>' +
            '<thead class="ink-head"><tr><th>Service</th><th>Achieved RPO vs objective</th><th>Achieved RTO vs objective</th></tr></thead>' +
            "<tbody>" + m9rows + "</tbody></table></div>")
        : "") +
      (def("H1")
        ? u.taskPanel(def("H1"), mode, '<div class="h1-grid">' + h1fields + "</div>", "Minutes, please. Accepts e.g. 84 / 1h24m / 1:24.")
        : "") +
      cribBox() +
      (def("H8")
        ? u.taskPanel(def("H8"), mode, '<div class="h8-grid">' + h8cells + "</div>", "IR-2043 (DOC-01) holds every timestamp; the values must land in the right slots of the curve.")
        : "") +
      "</div>"
    );
  }

  /* ---------------- board 06 — continuity planner ---------------- */

  function constraintsBox() {
    return (
      '<div class="constraints-box"><div class="stamp-row" style="margin-bottom:6px">' + U().stamp("Standing constraints", "amber") + "</div>" +
      '<ul class="constraints-list">' +
      "<li>CFO cap: exactly <strong>ONE</strong> premium (hot-site) subscription across the estate.</li>" +
      "<li>Lakeshore Hall (warm) is already contracted; Ridgeline Vault (cold) is a retainer.</li>" +
      "<li>FrostLine must keep monitoring through PDC maintenance windows without failing over.</li>" +
      "<li>Auditor: live failover evidence for FrostLine by <strong>Sep 30</strong>; no production interruption Nov 1–Jan 15.</li>" +
      "<li>The ops team has never executed a failover drill.</li>" +
      "</ul></div>"
    );
  }

  function assignmentGrid(prefix, kinds) {
    const u = U();
    const answers = S().state.answers;
    let out = "";
    for (const sid of D().SERVICE_ORDER) {
      const s = D().SERVICES[sid];
      let selects = "";
      if (kinds.includes("site")) {
        selects += u.matchSelect(
          prefix + sid + "_site", answers[prefix + sid + "_site"] ?? "",
          D().SITE_OPTIONS.map((o) => ({ value: o.id, label: o.label + " — " + o.blurb })),
          "Site tier…", s.name + " site tier"
        );
      }
      if (kinds.includes("model")) {
        selects += u.matchSelect(
          prefix + sid + "_model", answers[prefix + sid + "_model"] ?? "",
          D().MODEL_OPTIONS.map((o) => ({ value: o.id, label: o.label + " — " + o.blurb })),
          "Redundancy model…", s.name + " redundancy model"
        );
      }
      out +=
        '<div class="assign-card"><div class="assign-head"><span class="assign-name">' + s.name + "</span>" +
        '<span class="assign-kind">' + u.esc(s.kind) + "</span>" +
        '<span class="assign-sla">RPO ≤ ' + s.sla.rpoLabel + " · RTO ≤ " + s.sla.rtoLabel + "</span></div>" +
        (kinds.length > 1 ? '<div class="assign-grid2">' + selects + "</div>" : selects) +
        "</div>";
    }
    return '<div class="flex-col-gap">' + out + "</div>";
  }

  function remediationWidget() {
    const u = U();
    const remediation = S().state.remediation;
    let btns = "";
    for (const r of D().REMEDIATION_ACTIONS) {
      const idx = remediation.indexOf(r.id);
      btns +=
        '<button type="button" class="remediation-btn' + (idx !== -1 ? " picked" : "") + '" data-action="remediate" ' +
        'data-id="' + r.id + '" data-focus-id="rem-' + r.id + '"' + (idx !== -1 ? " disabled" : "") +
        ' aria-label="Fix step ' + u.esc(r.label) + (idx !== -1 ? " (selected as step " + (idx + 1) + ")" : "") + '">' +
        (idx !== -1 ? '<span class="remediation-n">' + (idx + 1) + ".</span>" : "") +
        u.esc(r.label) + "</button>";
    }
    let bar = "";
    if (remediation.length > 0) {
      bar =
        '<div class="remediation-bar">' +
        '<div class="remediation-seq">' + remediation.map((id) => id.toUpperCase()).join(" → ") + "</div>" +
        '<button type="button" class="btn btn-outline-dune" data-action="clear-remediation" aria-label="Clear the remediation order">' +
        u.icon("RotateCcw") + "Clear order</button>" +
        (remediation.length === 3
          ? '<span class="remediation-hint">' + u.icon("ArrowRight") + " sequence set — check it on the clipboard</span>"
          : "") +
        "</div>";
    }
    return (
      '<div id="remediation-widget"><div class="remediation-row">' + btns + "</div>" +
      '<div class="mt-3">' + bar + "</div></div>"
    );
  }

  function planner(mode) {
    const u = U();
    const answers = S().state.answers;
    const hosted = O().objectivesForBoard("planner", mode);
    const def = (id) => hosted.find((o) => o.id === id);

    let h4cells = "";
    for (const q of D().QUARTERS) {
      h4cells +=
        '<div class="h4-cell"><div class="h4-cell-label">' + u.esc(q.label) + "</div>" +
        u.matchSelect("h4." + q.id, answers["h4." + q.id] ?? "", D().TEST_TYPES.map((t) => ({ value: t.id, label: t.label })), "Test type…", "Select the test type for quarter " + q.id) +
        "</div>";
    }

    return (
      '<div class="board-tight">' +
      u.sectionTitle("Continuity Planner — design the recovery", "Board 06") +
      constraintsBox() +
      (def("M11")
        ? u.taskPanel(def("M11"), mode, assignmentGrid("m11.", ["site"]), "Tier follows RTO; the cap follows the budget. Vendor profiles are in DOC-05.")
        : "") +
      (def("M12")
        ? u.taskPanel(def("M12"), mode, assignmentGrid("m12.", ["model"]), "Which service must survive planned downtime of the primary without a failover event?")
        : "") +
      (def("H3")
        ? u.taskPanel(def("H3"), mode,
            assignmentGrid("h3.", ["site", "model"]) +
            '<div class="mt-3 max-w-3xl"><label class="field-label">Biggest gap in the current state:</label>' +
            u.matchSelect("h3.gap", answers["h3.gap"] ?? "", D().GAP_OPTIONS.map((g) => ({ value: g.id, label: g.text })), "Pick the gap…", "Select the biggest current-state gap") +
            "</div>",
            "Site tier + redundancy model per service (one premium cap), then name the biggest CURRENT-state gap.")
        : "") +
      (def("H4")
        ? u.taskPanel(def("H4"), mode,
            '<div class="h4-grid">' + h4cells + "</div>" +
            '<div class="h4-scope"><label class="field-label">Scope of the LIVE failover (full interruption quarter):</label>' +
            u.matchSelect("h4.target", answers["h4.target"] ?? "", D().TEST_TARGETS.map((t) => ({ value: t.id, label: t.label })), "Scope…", "Select the scope of the live failover test") +
            "</div>",
            "Every constraint in DOC-06 binds: deadline, freeze window, progressive competence, monthly walkthroughs.")
        : "") +
      (def("H9")
        ? u.taskPanel(def("H9"), mode, remediationWidget(), "Click the fixes in execution order. You can clear and redo the sequence.")
        : "") +
      "</div>"
    );
  }

  /* ---------------- board 08 — after-action ---------------- */

  const WATCH_OPS = [
    { t: "Replication-lag alarms", d: "Alert when a replication cycle slips or a sync misses its interval — the earliest RPO warning you will ever get." },
    { t: "Backup-job failure alerts", d: "A failed nightly job silently ages every recovery point; treat a failed job like an outage in waiting." },
    { t: "Failover test reports", d: "Each drill should log declared-time, cutover time and data loss — the only honest source of achieved RPO/RTO." },
    { t: "MTBF / MTTR trend dashboards", d: "Rising MTTR or falling MTBF on a component is a redundancy request with numbers attached." },
    { t: "SLA compliance reports", d: "The grid you built on the Recovery Ledger, produced on a schedule: achieved vs objective per service." },
    { t: "Declaration-time measurement", d: "How long from alarm to 'declare'? IR-2043 lost an hour to hesitation — measure it in every drill." },
  ];

  const MITIGATIONS = [
    { id: "RPO", rec: "Size recovery-point frequency to the objective: 5-min replication for FrostLine-class services, hourly for ShipGate, nightly only where RPO ≥ 24 h." },
    { id: "RTO", rec: "Buy downtime with site tier: hot for minutes-scale RTOs, warm for hours, cold only where days are acceptable — and rehearse declaration to remove human lag." },
    { id: "Sites", rec: "One premium subscription max (this estate): hot site reserved for the minutes-scale service; warm carries portals; cold covers back office." },
    { id: "Redundancy", rec: "Active-active only where planned downtime must not fail over (FrostLine); active-passive is the default for portals and ERP." },
    { id: "Testing", rec: "Climb the ladder in order — tabletop → walkthrough → simulation → parallel → full interruption — with the live failover scoped to one service and scheduled away from peak windows." },
  ];

  function afteraction() {
    const u = U();
    let watch = "";
    for (const w of WATCH_OPS) {
      watch += '<li class="watch-item"><span class="watch-t">' + u.esc(w.t) + '</span><span class="watch-d">' + u.esc(w.d) + "</span></li>";
    }
    let mit = "";
    for (const m of MITIGATIONS) {
      mit += '<tr><td class="td-bold" style="white-space:nowrap">' + m.id + '</td><td style="font-size:13px;line-height:1.625">' + u.esc(m.rec) + "</td></tr>";
    }
    let links = "";
    for (const l of D().LINKS) {
      links +=
        '<li><a class="aa-link" href="' + u.esc(l.url) + '" target="_blank" rel="noopener noreferrer">' +
        u.icon("ExternalLink") + u.esc(l.label) + "</a></li>";
    }

    return (
      '<div class="board">' +
      u.sectionTitle("After-Action Notes — synthesis", "Board 08") +
      '<div class="aa-card"><div class="aa-head">' + u.icon("Eye") + '<h3 class="aa-h3">Verification opportunities (what DR &ldquo;detects&rdquo;)</h3></div>' +
      '<p class="aa-lede">DR has no intrusion to catch — its detection pillar is <strong>readiness verification</strong>: watch recovery machinery continuously and test it on a schedule.</p>' +
      '<ul class="watch-grid">' + watch + "</ul></div>" +
      '<div class="aa-card"><div class="aa-head">' + u.icon("Wrench") + '<h3 class="aa-h3">Mitigation recommendations (mapped to the lesson bullets)</h3></div>' +
      '<div class="table-scroll" style="border-width:1px"><table class="data-table six min-w mit-table"><caption class="visually-hidden">Mitigation recommendations mapped to lesson concepts</caption>' +
      '<thead class="ink-head"><tr><th style="width:7rem">Concept</th><th>Recommendation for this estate</th></tr></thead>' +
      "<tbody>" + mit + "</tbody></table></div>" +
      '<p class="aa-mitre-note mt-2">Residual risk after the approved design: ShipGate keeps ~1 h of data exposure until hourly replication ships; a regional disaster touching both Lakeshore and Beacon Ridge remains uninsurable without geographic diversity — noted, budgeted, accepted by the committee.</p></div>' +
      '<div class="aa-grid2">' +
      '<div class="aa-card" style="border-color:var(--spruce)"><div class="aa-head">' + u.icon("ShieldCheck") + '<h3 class="aa-h3" style="font-size:16px">Blue-team takeaways</h3></div>' +
      '<ul class="aa-list">' +
      "<li>RPO is bought with recovery-point frequency; RTO is bought with site tier — and with fast, rehearsed decisions.</li>" +
      "<li>A stale &ldquo;adequate&rdquo; review is a gap, not a control; re-baseline whenever objectives change.</li>" +
      "<li>Breach is a comparison — LedgerRoom&apos;s 56-hour weekend looked heroic and passed; ShipGate&apos;s 9.2 hours failed.</li>" +
      "<li>A control is not a control until a test says so: schedule the ladder, log the evidence.</li>" +
      "</ul></div>" +
      '<div class="aa-card" style="border-color:var(--red)"><div class="aa-head">' + u.icon("Swords") + '<h3 class="aa-h3" style="font-size:16px">Red-team-mindset takeaways</h3></div>' +
      '<ul class="aa-list">' +
      "<li>Ransomware (T1486, <em>contextual</em>) is the full-interruption test attackers run without asking — DR is the countermeasure layer.</li>" +
      "<li>Data destruction (T1485) and shutdown/reboot (T1529) behave like Storm Vesper: assume the primary is gone, not paused.</li>" +
      "<li>Attackers read your gaps: nightly-only recovery points are a 24-hour free-encryption window.</li>" +
      "<li>Offline / out-of-region copies defeat impact events that destroy everything reachable.</li>" +
      "</ul></div></div>" +
      '<div class="aa-card"><div class="aa-head">' + u.icon("BookMarked") + '<h3 class="aa-h3">Reference (opens in a new tab)</h3></div>' +
      '<ul class="aa-links">' + links + "</ul>" +
      '<p class="aa-mitre-note">MITRE references are contextual background only: this lesson&apos;s scope is the CompTIA Network+ (N10-009) disaster-recovery objective set.</p></div>' +
      '<div class="study-box"><div class="study-label">What to study next</div>' +
      '<ul class="study-list">' +
      "<li>Backup types &amp; strategies (full/incremental/differential, 3-2-1 rule) — the machinery behind every RPO.</li>" +
      "<li>Availability tech beyond the DR objective: load balancing, NIC teaming, clustering, HA pairs — the machinery under active-active/passive.</li>" +
      "<li>Cloud DR patterns (DRaaS, pilot light, warm standby) — the modern answer to cold/warm/hot economics.</li>" +
      "</ul></div>" +
      u.stamp("End of briefing pack — debrief logged", "spruce") +
      "</div>"
    );
  }

  return {
    briefing: briefing,
    manual: manual,
    records: records,
    drill: drill,
    ledger: ledger,
    planner: planner,
    afteraction: afteraction,
    drillOutcomesHtml: drillOutcomesHtml,
    remediationWidget: remediationWidget,
    resetRecordsDoc: resetRecordsDoc,
    setDoc: setDoc,
  };
})();
