// Operation THAWLINE — canonical scenario data (ALL FICTIONAL / TRAINING DATA)
// Static port: 1:1 mirror of src/lib/lab/data.ts (content equality is proven
// by scripts/port_check.js, which deep-compares every export against the
// TypeScript original).
//
// Classic script (no modules) so the lab also runs from file:// — everything
// hangs off the single global `LabData`.

var LabData = (function () {
  "use strict";

  const LAB_ID = "thawline-dr-lab-v1";

  const ORG = "Borealis Cold Chain Logistics";
  const EXERCISE = "EXERCISE THAWLINE";

  /* ------------------------------------------------------------------ */
  /* Services & objectives (SLA quick card — DOC-03)                     */
  /* ------------------------------------------------------------------ */

  const SERVICES = {
    frostline: {
      name: "FrostLine",
      kind: "Cold-chain telemetry & alarms",
      sla: {
        rpo: 5,
        rto: 60,
        rpoLabel: "5 min",
        rtoLabel: "60 min",
        criticality: "Reefer containers spoil if monitoring goes dark — $18k/hour exposure",
      },
    },
    shipgate: {
      name: "ShipGate",
      kind: "Customer booking & tracking portal",
      sla: {
        rpo: 60,
        rto: 240,
        rpoLabel: "1 hour",
        rtoLabel: "4 hours",
        criticality: "Bookings pause; phone intake runs degraded",
      },
    },
    ledgerroom: {
      name: "LedgerRoom",
      kind: "Back-office ERP (invoicing, HR)",
      sla: {
        rpo: 1440,
        rto: 7200,
        rpoLabel: "24 hours",
        rtoLabel: "5 days",
        criticality: "Back-office only; no weekend writes",
      },
    },
  };

  const SERVICE_ORDER = ["frostline", "shipgate", "ledgerroom"];

  /* ------------------------------------------------------------------ */
  /* Records room documents                                              */
  /* ------------------------------------------------------------------ */

  const DOCS = [
    {
      code: "DOC-01",
      title: "Incident Report IR-2043 — Winter Storm Vesper",
      tag: "PRIMARY EVIDENCE",
      lines: [
        "INCIDENT REPORT IR-2043   [TRAINING DATA — FICTIONAL]",
        ORG + "  ·  Incident commander: R. Okafor",
        "Event: Winter Storm Vesper — utility loss + generator cooling failure",
        "Scope: site-level outage, Primary DC (PDC), Dock 4",
        "",
        "TIMELINE (local time, Fri 2026-01-09 unless noted)",
        "21:47  Utility power lost. UPS carried the load (UPS functioned normally).",
        "21:49  Backup generator auto-started.",
        "22:03  Generator cooling loop failed -> thermal shutdown of the PDC hall.",
        "       ALL services offline: FrostLine, ShipGate, LedgerRoom.   [t0 = 22:03]",
        "22:00  LAST GOOD FrostLine replication sync to Beacon Ridge (5-min cycle).",
        "02:00  LAST nightly vault backup for ShipGate and LedgerRoom (taken Fri 02:00).",
        "22:47  On-call engineer acknowledges the page, starts remote checks.",
        "23:05  Incident commander DECLARES DISASTER, authorizes failover.",
        "23:27  FrostLine serving live traffic from Beacon Ridge hot site.",
        "Sat 07:15  ShipGate restored on Lakeshore Hall warm site (from Fri 02:00 backup).",
        "Mon 06:00  LedgerRoom restored on Lakeshore Hall warm site (from Fri 02:00 backup).",
        "           Friday's invoices re-keyed from source documents by Mon 18:00.",
        "",
        "NOTES",
        "- LedgerRoom had no weekend writes (batch paused): restored data was 20 h 03 min",
        "  old, inside its 24 h RPO. RPO is a worst-case window, not idle-time loss.",
        "- Early note blamed the on-call junior admin; CORRECTED: no written declaration",
        "  criteria existed, so nobody knew when declaring was authorized.",
        "- Ransomware ruled out (forensic sweep clean).",
      ],
    },
    {
      code: "DOC-02",
      title: "GT-4 edge gateway — Q4 service log",
      tag: "RELIABILITY DATA",
      lines: [
        "GT-4 EDGE GATEWAY — Q4 SERVICE LOG   [TRAINING DATA — FICTIONAL]",
        "Quarter in-service time: 2,200 h (excludes repair windows)",
        "Conventions: MTTR = total repair time / repairs; MTBF = in-service h / failures.",
        "",
        "TICKETS",
        "T-101  Oct 03  OUTAGE - firmware crash.        Repair time 2.5 h",
        "T-107  Oct 14  PERF - slow sync, NO outage.    (performance ticket)",
        "T-115  Oct 21  OUTAGE - PSU failure.           Repair time 1.0 h",
        "T-123  Oct 30  Office 2 printer offline.       (unrelated)",
        "T-131  Nov 12  OUTAGE - NIC failure.           Repair time 3.5 h",
        "T-140  Dec 18  OUTAGE - building power fault.  Repair time 1.0 h",
        "T-148  Dec 24  Alert dismissed as false alarm; NO downtime.",
      ],
    },
    {
      code: "DOC-03",
      title: "Service objectives & business impact (SLA card)",
      tag: "APPROVED",
      lines: [
        "SERVICE OBJECTIVES - approved by steering committee   [FICTIONAL]",
        "",
        "FrostLine   telemetry   RPO <= 5 min    RTO <= 60 min",
        "            Criticality: spoilage exposure $18k per dark hour.",
        "ShipGate    portal      RPO <= 60 min   RTO <= 240 min",
        "            Criticality: bookings pause; phone intake degraded.",
        "LedgerRoom  ERP         RPO <= 24 h     RTO <= 5 days",
        "            Criticality: back-office only.",
      ],
    },
    {
      code: "DOC-04",
      title: "Recovery-point schedule (backups & replication)",
      tag: "KEY EVIDENCE",
      lines: [
        "RECOVERY-POINT SCHEDULE   [FICTIONAL]",
        "",
        "FrostLine : continuous replication to Beacon Ridge, 5-minute sync cycle.",
        "ShipGate  : full backup to vault nightly at 02:00 (ONLY recovery point).",
        "LedgerRoom: full backup to vault nightly at 02:00.",
        "",
        "NOTE (2024 review): 'ShipGate nightly backup window assessed adequate.'",
        "   -> review predates the current 1-hour RPO. STALE, never re-baselined.",
      ],
    },
    {
      code: "DOC-05",
      title: "DR site capability sheets (vendors)",
      tag: "VENDOR FILE",
      lines: [
        "DR SITE CAPABILITY SHEETS   [FICTIONAL VENDORS]",
        "",
        "RIDGELINE VAULT  (cold site)",
        "  Powered shell + network connectivity. NO hardware, NO data.",
        "  Provisioning 4-5 business days after declaration. $4k/mo retainer.",
        "",
        "LAKESHORE HALL  (warm site)",
        "  Hardware racked, base configs installed. NO live data -",
        "  restore from vault backups on arrival (4-6 h). $12k/mo.",
        "",
        "BEACON RIDGE  (hot site)",
        "  Mirrored cluster, 5-minute replication cycle, cutover 20-30 min",
        "  after declaration. $38k/mo (premium).",
      ],
    },
    {
      code: "DOC-06",
      title: "Continuity program memo (constraints)",
      tag: "GOVERNING",
      lines: [
        "CONTINUITY PROGRAM MEMO   [FICTIONAL]",
        "From: Continuity steering committee",
        "",
        "1. Auditor (Rowe & Lindqvist) requires LIVE failover evidence for the",
        "   flagship recovery (FrostLine) by the Sep 30 audit.",
        "2. Peak season Nov 1 - Jan 15: NO production interruption permitted.",
        "3. Ops team has NEVER executed a failover drill - build competence",
        "   progressively, lowest-risk first.",
        "4. Walkthrough sessions run monthly inside ops meetings; they are NOT",
        "   quarterly milestones.",
        "5. CFO cap: exactly ONE premium (hot-site) subscription across the estate.",
      ],
    },
    {
      code: "DOC-07",
      title: "Competing proposals for ShipGate (steering pack)",
      tag: "DECISION ITEM",
      lines: [
        "SHIPGATE RECOVERY - PROPOSALS A / B   [FICTIONAL]",
        "",
        "PROPOSAL A (internal network team)",
        "  Replicate ShipGate hourly to Lakeshore Hall (warm site),",
        "  active-passive failover. Meets RPO <= 1 h and RTO <= 4 h.",
        "  Uses the existing mid-tier contract. No new premium spend.",
        "",
        "PROPOSAL B (vendor deck)",
        "  Move ShipGate to Beacon Ridge active-active, 5-minute replication,",
        "  ~30 min RTO. Technically superior SLAs. Requires a SECOND premium",
        "  subscription.",
      ],
    },
    {
      code: "DOC-08",
      title: "Noise folder ( emails & margin notes )",
      tag: "UNVERIFIED — TREAT WITH CARE",
      lines: [
        "NOISE FOLDER - unverified items circulating after IR-2043   [FICTIONAL]",
        "",
        "Vendor email: 'Cloud auto-failover makes DR sites obsolete! Zero",
        "  hardware, zero planning!'  (marketing blast, no contractual backing)",
        "",
        "Margin note on IR-2043: 'Generator + UPS cover our RTO.'",
        "  (FALSE - the cooling failure took the hall down WITH power available.)",
        "",
        "Corridor note: 'Outages are the junior admin's fault.'",
        "  (Corrected in IR-2043: the missing piece was written declaration",
        "   criteria, not a person.)",
      ],
    },
  ];

  /* ------------------------------------------------------------------ */
  /* Storm drill — per-lane response options (current capability)        */
  /* ------------------------------------------------------------------ */

  const DECLARATIONS = [
    {
      id: "immediate",
      label: "Declare disaster immediately on alarm criteria",
      note: "~10 min overhead before recovery work starts",
    },
    {
      id: "verify",
      label: "Verify first, then declare (as IR-2043 did)",
      note: "~62 min overhead: ack 22:47, declare 23:05",
    },
  ];

  const DRILL_ACTIONS = {
    frostline: [
      {
        id: "hot",
        label: "Fail over to Beacon Ridge (hot site)",
        cost: "premium subscription (already held)",
        rpo: 3,
        rto: null, // depends on declaration timing — resolved at runtime
      },
      {
        id: "wait",
        label: "Wait for PDC repair (cooling fix), no failover",
        cost: "low + emergency labor",
        rpo: 3,
        rto: 570,
      },
      {
        id: "cold",
        label: "Provision Ridgeline Vault (cold site)",
        cost: "retainer only",
        rpo: 1203,
        rto: 4320,
      },
    ],
    shipgate: [
      {
        id: "warm",
        label: "Restore Fri 02:00 backup to Lakeshore (warm site)",
        cost: "existing warm contract + labor",
        rpo: 1203,
        rto: 552, // Fri 22:03 → Sat 07:15 = 1 h 57 min + 7 h 15 min = 9 h 12 min
      },
      {
        id: "wait",
        label: "Wait for PDC repair (storage rebuild + restore)",
        cost: "medium (emergency hardware)",
        rpo: 1203,
        rto: 3600,
      },
      {
        id: "cold",
        label: "Provision Ridgeline Vault (cold site)",
        cost: "retainer only",
        rpo: 1203,
        rto: 7200,
      },
    ],
    ledgerroom: [
      {
        id: "cold",
        label: "Restore Fri 02:00 backup at Ridgeline Vault (cold site)",
        cost: "low (retainer + restore labor)",
        rpo: 1203,
        rto: 6600,
      },
      {
        id: "warm",
        label: "Restore Fri 02:00 backup to Lakeshore (warm site)",
        cost: "medium (warm contract + labor)",
        rpo: 1203,
        rto: 3357,
      },
      {
        id: "wait",
        label: "Wait for PDC repair, then restore",
        cost: "medium",
        rpo: 1203,
        rto: 3600,
      },
    ],
  };

  const DRILL_NONE = {
    id: "none",
    label: "No current response complies — flag for redesign",
    cost: "—",
    rpo: null,
    rto: null,
  };

  function drillOutcome(service, actionId, declaration) {
    const found = DRILL_ACTIONS[service].find((x) => x.id === actionId);
    if (found) {
      if (found.id === "hot") {
        return {
          ...found,
          rto: declaration === "immediate" ? 32 : 84,
          cost:
            declaration === "immediate"
              ? "premium subscription (already held) + fast declaration"
              : "premium subscription (already held) + 62-min decision lag",
        };
      }
      return found;
    }
    if (actionId === "none") return DRILL_NONE;
    return null;
  }

  /* ------------------------------------------------------------------ */
  /* Continuity planner data                                             */
  /* ------------------------------------------------------------------ */

  const SITE_OPTIONS = [
    { id: "cold", label: "Cold site (Ridgeline Vault)", blurb: "Shell + power only. 4–5 business days to provision. $4k/mo." },
    { id: "warm", label: "Warm site (Lakeshore Hall)", blurb: "Hardware racked, data restored from backups. 4–6 h. $12k/mo." },
    { id: "hot", label: "Hot site (Beacon Ridge)", blurb: "Mirrored cluster, 5-min replication, 20–30 min cutover. $38k/mo premium." },
  ];

  const MODEL_OPTIONS = [
    { id: "aa", label: "Active-active", blurb: "All nodes serve live traffic; seamless failover; premium capacity." },
    { id: "ap", label: "Active-passive", blurb: "Standby activates on failover; cheaper; slower recovery." },
  ];

  const GAP_OPTIONS = [
    {
      id: "sg-backups",
      text: "ShipGate's only recovery point is a nightly backup — ~24 h of exposure against a 1-hour RPO",
    },
    { id: "fl-cutover", text: "Beacon Ridge cutover takes 20–30 minutes" },
    { id: "lr-window", text: "LedgerRoom backups run at 02:00" },
    { id: "cost", text: "Beacon Ridge costs $38k/month" },
  ];

  const TEST_TYPES = [
    { id: "tabletop", label: "Tabletop exercise" },
    { id: "walkthrough", label: "Walkthrough" },
    { id: "simulation", label: "Simulation" },
    { id: "parallel", label: "Parallel test" },
    { id: "full", label: "Full interruption test" },
  ];

  const QUARTERS = [
    { id: "q1", label: "Q1 (Jan–Mar)" },
    { id: "q2", label: "Q2 (Apr–Jun)" },
    { id: "q3", label: "Q3 (Jul–Sep)" },
    { id: "q4", label: "Q4 (Oct–Dec)" },
  ];

  const TEST_TARGETS = [
    { id: "frostline", label: "FrostLine only" },
    { id: "shipgate", label: "ShipGate only" },
    { id: "all", label: "All services" },
  ];

  const REMEDIATION_ACTIONS = [
    {
      id: "a1",
      label: "Enable hourly ShipGate replication to Lakeshore — close the RPO gap",
    },
    {
      id: "a2",
      label: "Adopt written declaration criteria + rehearse them (tabletop, then parallel) — cut the decision lag",
    },
    {
      id: "a3",
      label: "Re-run the storm drill and re-audit — verify both gaps actually closed",
    },
  ];

  /* ------------------------------------------------------------------ */
  /* Field manual — matching pools                                       */
  /* ------------------------------------------------------------------ */

  const M1_DEFS = [
    {
      id: "d1",
      text: "Maximum tolerable DATA LOSS, measured as time since the last recovery point.",
    },
    {
      id: "d2",
      text: "Maximum tolerable DOWNTIME between the disaster and restored service.",
    },
    {
      id: "d3",
      text: "Average in-service time BETWEEN failures of a component — a reliability measure.",
    },
    {
      id: "d4",
      text: "Average time needed to REPAIR or restore a failed component — a maintainability measure.",
    },
  ];

  const M2_CARDS = [
    {
      id: "c1",
      text: "Powered shell space + connectivity. No hardware, no data. Provisioned after declaration. 4–5 business days. $4k/mo.",
    },
    {
      id: "c2",
      text: "Hardware racked, base configs installed, but no live data — restore from vault backups on arrival (4–6 h). $12k/mo.",
    },
    {
      id: "c3",
      text: "Mirrored cluster receiving near-real-time replication; cutover ~20–30 min. $38k/mo premium.",
    },
  ];

  const M3_STATEMENTS = [
    { id: "s1", text: "Every node serves live traffic at all times; failover is seamless." },
    { id: "s2", text: "A standby sits idle until failover activates it." },
    { id: "s3", text: "Capacity is typically paid for twice — both sides run full production." },
    { id: "s4", text: "Usually the cheaper model; the standby may be smaller or underused." },
    { id: "s5", text: "Needs load balancing (or equivalent) to spread traffic across sites." },
    { id: "s6", text: "Recovery time includes bringing the passive side up to speed." },
  ];

  const M4_CARDS = [
    { id: "t1", text: "Discussion around a table; the plan is walked through verbally; no systems touched." },
    { id: "t2", text: "Structured step-by-step pass through the plan; participants follow their roles on paper." },
    { id: "t3", text: "DR activities executed in an isolated environment — backups restored somewhere production cannot be harmed." },
    { id: "t4", text: "Recovery systems run alongside production without interrupting it, proving the standby actually works." },
    { id: "t5", text: "A real failover: production is taken down and recovered from the alternate site." },
  ];

  const CURVE_SLOT_DEFS = [
    { id: "slot1", label: "Last recovery point" },
    { id: "slot2", label: "Incident start (t0)" },
    { id: "slot3", label: "Service restored" },
    { id: "slot4", label: "Data-loss window (achieved RPO)" },
    { id: "slot5", label: "Downtime (achieved RTO)" },
  ];

  const CURVE_VALUE_OPTIONS = [
    "22:00",
    "22:03",
    "23:27",
    "Sat 07:15",
    "3 min",
    "84 min",
    "20 h 03 min",
  ];

  const CURVE_ANSWERS = {
    slot1: "22:00",
    slot2: "22:03",
    slot3: "23:27",
    slot4: "3 min",
    slot5: "84 min",
  };

  /* ------------------------------------------------------------------ */
  /* Glossary                                                            */
  /* ------------------------------------------------------------------ */

  const GLOSSARY = [
    { term: "RPO", def: "Recovery Point Objective — maximum age of data (in time) the business can afford to lose. Driven by backup/replication frequency." },
    { term: "RTO", def: "Recovery Time Objective — maximum time a service may stay down after a disaster. Driven by site tier, redundancy and decision speed." },
    { term: "MTBF", def: "Mean Time Between Failures — average in-service time between failures. Reliability: higher is better." },
    { term: "MTTR", def: "Mean Time To Repair — average time to restore a failed component. Maintainability: lower is better." },
    { term: "Recovery point", def: "The timestamp of the last restorable copy of the data." },
    { term: "Recovery curve", def: "Timeline of an incident: last recovery point, failure, data-loss window (RPO), downtime (RTO), restoration." },
    { term: "Failover", def: "Switching service from a failed system to a standby." },
    { term: "Failback", def: "Returning workloads to the primary site after repair." },
    { term: "Replication", def: "Copying live data to a second location continuously or on a schedule." },
    { term: "Cold site", def: "Powered, networked shell space — no equipment, no data. Cheapest, slowest (days)." },
    { term: "Warm site", def: "Equipped, configured facility awaiting data restoration. Mid cost (hours)." },
    { term: "Hot site", def: "Near-real-time replica ready for minutes-level cutover. Most expensive." },
    { term: "Active-active", def: "All nodes/sites serve traffic simultaneously; seamless failover; premium cost." },
    { term: "Active-passive", def: "One node serves; a standby waits for failover. Cheaper; recovery takes longer." },
    { term: "Tabletop exercise", def: "Discussion-based rehearsal of the DR plan; no systems touched." },
    { term: "Walkthrough", def: "Structured step-by-step pass through the plan; roles on paper." },
    { term: "Simulation", def: "DR activities executed in an isolated environment; production untouched." },
    { term: "Parallel test", def: "Recovery systems run alongside production; both process; production not interrupted." },
    { term: "Full interruption test", def: "Real failover; production taken down. Highest risk, strongest proof." },
    { term: "SLA", def: "Service Level Agreement — the committed availability/recovery terms for a service." },
    { term: "BIA", def: "Business Impact Analysis — study that produces RPO/RTO per service." },
    { term: "MTTD", def: "Mean Time To Detect — average time to notice a failure (adjacent metric, related but distinct)." },
    { term: "MTTF", def: "Mean Time To Failure — for non-repairable components (adjacent metric)." },
    { term: "DRP", def: "Disaster Recovery Plan — the documented procedures exercised in this lab." },
  ];

  /* ------------------------------------------------------------------ */
  /* Quiz banks                                                          */
  /* ------------------------------------------------------------------ */

  const QUIZ_MEDIUM = [
    {
      id: "q1",
      stem: "Which metric is the maximum tolerable DATA LOSS, measured in time?",
      topic: "metric definitions — RPO vs RTO vs MTBF vs MTTR",
      study: "Field Manual §1 “The four numbers”",
      options: [
        { id: "a", text: "RPO", why: "Correct — Recovery POINT Objective: how old the restored data may be. RTO measures downtime instead." },
        { id: "b", text: "RTO", why: "RTO is downtime (time to restore service), not data age." },
        { id: "c", text: "MTBF", why: "MTBF is observed reliability between failures — not a business tolerance." },
        { id: "d", text: "MTTR", why: "MTTR is observed repair speed — not a business tolerance." },
      ],
      correct: "a",
    },
    {
      id: "q2",
      stem: "Order the site tiers from FASTEST to SLOWEST recovery:",
      topic: "cold / warm / hot site tiers",
      study: "Field Manual §3 tier ladder + DOC-05 vendor sheets",
      options: [
        { id: "a", text: "Hot → Warm → Cold", why: "Correct — hot has live replication, warm needs restore, cold needs full provisioning." },
        { id: "b", text: "Cold → Warm → Hot", why: "That is slowest to fastest — backwards. Cold has no equipment; hot has everything live." },
        { id: "c", text: "Warm → Hot → Cold", why: "Warm is mid-tier: hot recovers in minutes, faster than warm's hours." },
        { id: "d", text: "Hot → Cold → Warm", why: "Cold is the slowest tier, not the middle." },
      ],
      correct: "a",
    },
    {
      id: "q3",
      stem: "A component with a HIGH MTBF is one that…",
      topic: "MTBF as a reliability measure",
      study: "Field Manual §1 + DOC-02 service log conventions",
      options: [
        { id: "a", text: "rarely fails in service", why: "Correct — MTBF = mean time BETWEEN failures; long quiet stretches mean high reliability." },
        { id: "b", text: "is repaired very quickly", why: "Repair speed is MTTR, a separate metric." },
        { id: "c", text: "loses very little data", why: "Data loss is governed by RPO / recovery-point frequency." },
        { id: "d", text: "is cheap to operate", why: "MTBF says nothing about cost." },
      ],
      correct: "a",
    },
    {
      id: "q4",
      stem: "In an ACTIVE-ACTIVE design, the second site…",
      topic: "active-active redundancy",
      study: "Field Manual §4 redundancy models",
      options: [
        { id: "a", text: "serves live traffic right now", why: "Correct — all nodes serve simultaneously; failover is seamless (and capacity is paid for twice)." },
        { id: "b", text: "sits powered off until disaster", why: "That is active-passive (and even then the standby is powered, just not serving)." },
        { id: "c", text: "receives only nightly backups", why: "Backups are recovery points, not an active serving role." },
        { id: "d", text: "must be a cold site", why: "Active-active presumes both sides are live — impossible with a cold site." },
      ],
      correct: "a",
    },
    {
      id: "q5",
      stem: "Which test type takes PRODUCTION DOWN to prove recovery?",
      topic: "DR test types and their risk ladder",
      study: "Field Manual §5 testing ladder",
      options: [
        { id: "a", text: "Full interruption", why: "Correct — a real failover: production goes offline and is recovered from the alternate site." },
        { id: "b", text: "Tabletop exercise", why: "Discussion only — nothing is touched." },
        { id: "c", text: "Parallel test", why: "Parallel runs recovery systems ALONGSIDE production — production stays up." },
        { id: "d", text: "Walkthrough", why: "Still a paper pass — no systems exercised." },
      ],
      correct: "a",
    },
    {
      id: "q6",
      stem: "The lever that most directly buys a better RPO is…",
      topic: "what drives RPO (recovery-point frequency)",
      study: "Field Manual §1 + DOC-04 recovery-point schedule",
      options: [
        { id: "a", text: "more frequent backups", why: "Correct — RPO is the age of the newest recovery point; frequency is exactly what sets it." },
        { id: "b", text: "a bigger generator", why: "Power hardening improves availability, not data-loss tolerance." },
        { id: "c", text: "faster failover cutover", why: "Cutover speed improves RTO, not RPO." },
        { id: "d", text: "more spare hardware", why: "Spares reduce repair time (MTTR), not data loss." },
      ],
      correct: "a",
    },
  ];

  const QUIZ_HARD = [
    {
      id: "q1",
      stem: "Telemetry replicates every 5 min. Last sync 12:00; the hall dies at 12:03. Worst-case data loss?",
      topic: "achieved-RPO windows",
      study: "Recovery Ledger crib box + DOC-01 timeline",
      options: [
        { id: "a", text: "3 minutes", why: "Correct — loss = writes AFTER the last recovery point (12:00) and before failure (12:03)." },
        { id: "b", text: "5 minutes", why: "5 min is the replication interval, not the achieved loss window." },
        { id: "c", text: "8 minutes", why: "No interval adds up to 8: the window is 12:00 → 12:03." },
        { id: "d", text: "63 minutes", why: "63 min would count to the failover — RPO stops at the failure moment, not at cutover." },
      ],
      correct: "a",
    },
    {
      id: "q2",
      stem: "A service's RPO is 1 h, but its only recovery point is a nightly backup. The correct fix is…",
      topic: "RPO remediation",
      study: "DOC-04 schedule + the planner's remediation order",
      options: [
        { id: "a", text: "back up far more often", why: "Correct — recovery-point frequency is the ONLY lever on RPO." },
        { id: "b", text: "move it to a cold site", why: "Site tier addresses downtime (RTO), not data age (RPO)." },
        { id: "c", text: "add a second UPS", why: "Power hardening does not create newer recovery points." },
        { id: "d", text: "raise the RPO to 24 h", why: "That edits the objective, not the capability — the business impact stays." },
      ],
      correct: "a",
    },
    {
      id: "q3",
      stem: "A component failed 6 times this year; each repair took 3 h. Its MTTR is…",
      topic: "MTTR math",
      study: "DOC-02 conventions + Records Room computation",
      options: [
        { id: "a", text: "3 hours", why: "Correct — MTTR = total repair time (18 h) ÷ repairs (6) = 3 h." },
        { id: "b", text: "18 hours", why: "18 h is total repair time, not the mean." },
        { id: "c", text: "1,461 hours", why: "That shape of number is MTBF territory (year ÷ failures), and this question asks MTTR." },
        { id: "d", text: "0.5 hours", why: "0.5 h would be 6 repairs ÷ 12 — no such relationship exists here." },
      ],
      correct: "a",
    },
    {
      id: "q4",
      stem: "You must prove the standby environment works WITHOUT touching production, before a later live test. Choose…",
      topic: "parallel vs full interruption testing",
      study: "Field Manual §5 testing ladder",
      options: [
        { id: "a", text: "Parallel test", why: "Correct — recovery systems run alongside production; both process; nothing is interrupted." },
        { id: "b", text: "Full interruption", why: "That takes production down — exactly what was forbidden." },
        { id: "c", text: "Tabletop", why: "Discussion proves understanding, not that the standby environment works." },
        { id: "d", text: "Walkthrough", why: "Still paper-based — no systems exercised." },
      ],
      correct: "a",
    },
    {
      id: "q5",
      stem: "A service needs RPO ≈ 0 and RTO ≤ 30 min. The best pair is…",
      topic: "SLA-driven site + model design",
      study: "Continuity Planner design task + DOC-05/06",
      options: [
        { id: "a", text: "Hot site, active-active", why: "Correct — near-zero RPO needs continuous replication; a 30-min RTO needs an already-live or instantly-cutable site (a continuously replicated standby also qualifies)." },
        { id: "b", text: "Warm site, active-passive", why: "Warm = restore-from-backup hours; that breaches both numbers." },
        { id: "c", text: "Cold site, active-passive", why: "Days of provisioning vs a 30-minute objective." },
        { id: "d", text: "Nightly backups, cold site", why: "Up to 24 h data loss and days of downtime — the worst option for these SLAs." },
      ],
      correct: "a",
    },
    {
      id: "q6",
      stem: "RTO was breached because DECLARING the disaster took 70 minutes. Best countermeasure?",
      topic: "declaration lag as an RTO lever",
      study: "DOC-01 timeline + DOC-06 memo, Storm Drill debrief",
      options: [
        { id: "a", text: "Written criteria, rehearsed often", why: "Correct — decision time is a human/process lever; drills (tabletop, then parallel) shorten it measurably." },
        { id: "b", text: "Buy a second backup generator", why: "Power was not the problem in IR-2043 — cooling was, and the lag was decision-making." },
        { id: "c", text: "Downgrade to a cold site", why: "That would lengthen recovery, worsening RTO." },
        { id: "d", text: "Increase backup frequency further", why: "Backups act on RPO; the breach was in time-to-act." },
      ],
      correct: "a",
    },
    {
      id: "q7",
      stem: "MTBF = 2,000 h and MTTR = 4 h. Inherent availability is closest to…",
      topic: "the availability formula",
      study: "Field Manual §1 note: A = MTBF / (MTBF + MTTR)",
      options: [
        { id: "a", text: "99.8%", why: "Correct — availability = MTBF / (MTBF + MTTR) = 2000/2004 ≈ 99.8%." },
        { id: "b", text: "95%", why: "That would need ~100 h of downtime per 2,000 h — far above 4 h." },
        { id: "c", text: "99.99%", why: "Four nines needs MTTR ≈ 0.2 h at this MTBF (or MTBF ≈ 40,000 h at this MTTR)." },
        { id: "d", text: "98%", why: "98% implies ~40 h down per 2,000 h — ten times the actual 4 h." },
      ],
      correct: "a",
    },
  ];

  /* ------------------------------------------------------------------ */
  /* Board meta                                                          */
  /* ------------------------------------------------------------------ */

  const BOARD_META = [
    { id: "briefing", no: "01", title: "Scenario Briefing", desc: "Who you are, what broke, and what the committee expects from you." },
    { id: "manual", no: "02", title: "Field Manual", desc: "The four numbers, the recovery curve, site tiers, redundancy models, the test ladder." },
    { id: "records", no: "03", title: "Records Room", desc: "IR-2043, service logs, SLA cards, schedules — plus a noise folder." },
    { id: "drill", no: "04", title: "Storm Drill", desc: "Run the failover decision table and watch RPO/RTO consequences land." },
    { id: "ledger", no: "05", title: "Recovery Ledger", desc: "Compute the achieved numbers and audit them against the objectives." },
    { id: "planner", no: "06", title: "Continuity Planner", desc: "Design the target architecture, the test program and the remediation order." },
    { id: "review", no: "07", title: "Board Review", desc: "Rapid concept check — every answer comes with an explanation." },
    { id: "afteraction", no: "08", title: "After-Action Notes", desc: "Detection opportunities, mitigations, and what to study next." },
  ];

  const BRIEFING_PARAS = [
    "You are the newly appointed Continuity Coordinator at " + ORG + " — a regional carrier of refrigerated freight. If cold-chain monitoring goes dark, cargo spoils by the hour, so the board funds recovery capability seriously: three services, three service-level agreements, and a rack of recovery options across three vendor sites.",
    "Last January, Winter Storm Vesper knocked out the primary data center for a full weekend. The company recovered — but an internal audit found the recovery missed two of its own objectives, and nobody can prove WHY on paper. The steering committee has requisitioned a tabletop exercise: you will reconstruct the incident, audit it against the objectives, run the failover decisions yourself, and design the fixes.",
    "Your instructor brief: this lab covers the disaster-recovery objectives of CompTIA Network+ (N10-009) — RPO, RTO, MTTR, MTBF, cold/warm/hot sites, active-active/passive redundancy, and DR testing. Finish every clipboard objective and you can defend all of them in an exam — or in a real incident review.",
  ];

  const LINKS = [
    { label: "CompTIA Network+ (N10-009) — official objectives", url: "https://www.comptia.org/certifications/network" },
    { label: "MITRE ATT&CK — Impact tactic (contextual)", url: "https://attack.mitre.org/tactics/TA0040/" },
    { label: "MITRE ATT&CK — T1486 Data Encrypted for Impact (contextual)", url: "https://attack.mitre.org/techniques/T1486/" },
    { label: "MITRE D3FEND — countermeasure knowledge base", url: "https://d3fend.mitre.org/" },
  ];

  function fmtMin(m) {
    if (m < 60) return m + " min";
    const h = Math.floor(m / 60);
    const mm = m % 60;
    if (h < 24) return mm === 0 ? h + " h" : h + " h " + mm + " min";
    const d = Math.floor(h / 24);
    const hh = h % 24;
    return mm === 0 ? d + " d " + hh + " h" : d + " d " + hh + " h " + mm + " min";
  }

  return {
    LAB_ID: LAB_ID,
    ORG: ORG,
    EXERCISE: EXERCISE,
    SERVICES: SERVICES,
    SERVICE_ORDER: SERVICE_ORDER,
    DOCS: DOCS,
    DECLARATIONS: DECLARATIONS,
    DRILL_ACTIONS: DRILL_ACTIONS,
    DRILL_NONE: DRILL_NONE,
    drillOutcome: drillOutcome,
    SITE_OPTIONS: SITE_OPTIONS,
    MODEL_OPTIONS: MODEL_OPTIONS,
    GAP_OPTIONS: GAP_OPTIONS,
    TEST_TYPES: TEST_TYPES,
    QUARTERS: QUARTERS,
    TEST_TARGETS: TEST_TARGETS,
    REMEDIATION_ACTIONS: REMEDIATION_ACTIONS,
    M1_DEFS: M1_DEFS,
    M2_CARDS: M2_CARDS,
    M3_STATEMENTS: M3_STATEMENTS,
    M4_CARDS: M4_CARDS,
    CURVE_SLOT_DEFS: CURVE_SLOT_DEFS,
    CURVE_VALUE_OPTIONS: CURVE_VALUE_OPTIONS,
    CURVE_ANSWERS: CURVE_ANSWERS,
    GLOSSARY: GLOSSARY,
    QUIZ_MEDIUM: QUIZ_MEDIUM,
    QUIZ_HARD: QUIZ_HARD,
    BOARD_META: BOARD_META,
    BRIEFING_PARAS: BRIEFING_PARAS,
    LINKS: LINKS,
    fmtMin: fmtMin,
  };
})();
