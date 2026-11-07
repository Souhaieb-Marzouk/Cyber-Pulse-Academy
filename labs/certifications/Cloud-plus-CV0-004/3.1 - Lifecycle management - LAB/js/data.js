// CyberLab "ORBIT" — SYNTHETIC TRAINING DATA. Fictional org, hosts, CVE, people.
// CompTIA Cloud+ CV0-004 · Lesson 3.1 Lifecycle management (scaling & updates).
// 1:1 content port of the original src/lib/lab/data.ts (wording, answers, hints
// and feedback identical). All data lives here; logic lives in the other files.
//
// Shared namespace for the classic-script bundle:
var ORBIT = window.ORBIT || {};
window.ORBIT = ORBIT;

ORBIT.DATA = (function () {
  "use strict";

  var HALCYON_ORPHANS = [
    "hlcy-encoder",
    "hlcy-bucket",
    "hlcy-lb",
    "hlcy-deploy-key",
    "hlcy-snap",
  ];

  var FLEET = [
    {
      id: "web-prod-01", label: "web-prod-01", kind: "compute", state: "ACTIVE",
      provMethod: "iac", patch: "GI-2026.09", env: "prod", project: "aurora",
      costPerDay: 1.1, asg: "asg-web-prod", az: "a", launched: "2026-08-14",
      note: "Healthy. Launched by IaC stack web-core v3.2 from golden image GI-2026.09. Tags auto-attached at birth.",
    },
    {
      id: "web-prod-02", label: "web-prod-02", kind: "compute", state: "ACTIVE",
      provMethod: "iac", patch: "GI-2026.09", env: "prod", project: "aurora",
      costPerDay: 1.1, asg: "asg-web-prod", az: "b", launched: "2026-08-14",
      note: "Healthy. Member of asg-web-prod behind edge-lb.",
    },
    {
      id: "web-prod-03", label: "web-prod-03", kind: "compute", state: "ACTIVE",
      provMethod: "iac", patch: "GI-2026.09", env: "prod", project: "aurora",
      costPerDay: 1.1, asg: "asg-web-prod", az: "c", launched: "2026-08-14",
      note: "Healthy. Member of asg-web-prod behind edge-lb.",
    },
    {
      id: "web-prod-04", label: "web-prod-04", kind: "compute", state: "ACTIVE",
      provMethod: "manual", patch: "GI-2026.05", env: "—", project: "—",
      costPerDay: 1.1, asg: "asg-web-prod (manually attached)", az: "a", launched: "2026-06-02",
      note: "Launched via web console 2026-06-02 under break-glass during the June incident (user: j.alvarez). Never enrolled in the IaC pipeline. No tags. Patch baseline GI-2026.05 — predates the CVE-2026-4472 fix.",
      deps: "Serves production traffic via edge-lb. NOT in IaC state files.",
    },
    {
      id: "db-orders", label: "db-orders", kind: "database", state: "ACTIVE",
      provMethod: "iac", patch: "GI-2026.09", env: "prod", project: "aurora",
      costPerDay: 4.2, az: "a", launched: "2026-08-14",
      note: "Stateful orders database. Business constraint: patching must be zero-downtime.",
      deps: "Single writer for the orders service. DNS: orders.lumenstream.internal.",
    },
    {
      id: "db-orders-replica", label: "db-orders-replica", kind: "database", state: "ACTIVE",
      provMethod: "iac", patch: "GI-2026.09", env: "prod", project: "aurora",
      costPerDay: 4.0, az: "b", launched: "2026-08-14",
      note: "Warm standby replica. CMDB note: REQUIRED by DR policy DR-07. CPU typically <1% — that is normal for a standby.",
      deps: "DR failover target for db-orders. Protected by DR-07.",
    },
    {
      id: "staging-01", label: "staging-01", kind: "compute", state: "ACTIVE",
      provMethod: "iac", patch: "GI-2026.09", env: "staging", project: "aurora",
      costPerDay: 0.9, launched: "2026-09-01",
      note: "Staging web node. Patch current.",
    },
    {
      id: "staging-02", label: "staging-02", kind: "compute", state: "ACTIVE",
      provMethod: "iac", patch: "GI-2026.01", env: "staging", project: "aurora",
      costPerDay: 0.9, launched: "2026-01-20",
      note: "Patch overdue (GI-2026.01) but the staging VPC is network-isolated: no internet ingress, no production path.",
    },
    {
      id: "dev-sandbox", label: "dev-sandbox", kind: "compute", state: "ACTIVE",
      provMethod: "manual", patch: "GI-2026.09", env: "dev", project: "—",
      costPerDay: 1.3, launched: "2026-07-11",
      note: "Launched manually by a developer. Runs 24/7 though actually used ~09:00–17:00 weekdays. No auto-stop policy.",
    },
    {
      id: "edge-lb", label: "edge-lb", kind: "loadbalancer", state: "ACTIVE",
      provMethod: "iac", patch: "—", env: "prod", project: "aurora",
      costPerDay: 1.0, launched: "2026-08-14",
      note: "Edge load balancer distributing to asg-web-prod members.",
    },
    {
      id: "aurora-bucket", label: "aurora-bucket", kind: "storage", state: "ACTIVE",
      provMethod: "iac", patch: "—", env: "prod", project: "aurora",
      costPerDay: 12.0, launched: "2026-08-14",
      note: "Aurora media assets, 3.4 TB. No lifecycle/tiering policy configured — every object sits in the hot tier forever.",
    },
    {
      id: "fn-transcode", label: "fn-transcode", kind: "function", state: "ACTIVE",
      provMethod: "provider", patch: "provider-managed", env: "prod", project: "aurora",
      costPerDay: 0.8, launched: "2026-08-14",
      note: "Serverless transcoder. Shared responsibility: the provider patches the runtime; we patch our code and dependencies.",
    },
    {
      id: "green-test-01", label: "green-test-01", kind: "compute", state: "PROVISIONING",
      provMethod: "iac", patch: "GI-2026.09", env: "staging", project: "aurora",
      costPerDay: 0.2, launched: "pending",
      note: "Provisioning from IaC template web-core v4 (46% complete). Will run staging smoke tests.",
    },
    {
      id: "hlcy-web-01", label: "hlcy-web-01", kind: "compute", state: "RETIRED",
      provMethod: "manual", patch: "GI-2024.03", env: "—", project: "halcyon",
      costPerDay: 0.0, launched: "2023-11-02",
      note: "Retired 2024-03 during the Halcyon shutdown. Kept in the CMDB for audit. Costs nothing.",
    },
    {
      id: "hlcy-encoder", label: "hlcy-encoder", kind: "compute", state: "ACTIVE",
      provMethod: "manual", patch: "GI-2024.06", env: "—", project: "halcyon",
      costPerDay: 3.2, launched: "2023-12-05",
      note: "Halcyon batch encoder. The project closed in 2024 — this was never retired. Patch level 2024.06, far outside support.",
    },
    {
      id: "hlcy-bucket", label: "hlcy-bucket", kind: "storage", state: "ACTIVE",
      provMethod: "iac", patch: "—", env: "—", project: "halcyon",
      costPerDay: 30.0, launched: "2023-12-05",
      note: "1.2 TB of Halcyon raw footage. Private, but forgotten. Still billed $30/day.",
      deps: "READER WARNING: a monthly archive-pull job still reads from this bucket (see telemetry TL-05).",
    },
    {
      id: "hlcy-lb", label: "hlcy-lb", kind: "loadbalancer", state: "ORPHANED",
      provMethod: "iac", patch: "—", env: "—", project: "halcyon",
      costPerDay: 0.6, launched: "2023-12-05",
      note: "No registered targets since 2024. Pure cost.",
    },
    {
      id: "hlcy-deploy-key", label: "hlcy-deploy-key", kind: "key", state: "ACTIVE",
      provMethod: "manual", patch: "—", env: "—", project: "halcyon",
      costPerDay: 0.0, launched: "2023-12-05",
      note: "Halcyon deploy credential. Last used 2 days ago — by what? (See telemetry TL-10.) Stale credentials on closed projects are a classic foothold.",
    },
    {
      id: "hlcy-snap", label: "hlcy-snap", kind: "storage", state: "ACTIVE",
      provMethod: "iac", patch: "—", env: "—", project: "halcyon",
      costPerDay: 0.2, launched: "2024-03-18",
      note: "Halcyon DB snapshot from 2024-03, kept \"just in case\". Cheap, but it is not a backup strategy.",
    },
  ];

  var TELEMETRY = [
    { id: "TL-01", day: "D-6", time: "09:12", tag: "CHANGE", text: "Change request CR-118 approved: prepare asg-web-prod for the season finale (Friday 20:00, expect ~6x baseline)." },
    { id: "TL-02", day: "D-6", time: "09:15", tag: "SCALE", text: "ASG asg-web-prod deployed policy: min=1 desired=1 max=2 · trigger CPU>90% for 15 min · cooldown 30 min. (Last reviewed 2025.)" },
    { id: "TL-03", day: "D-5", time: "11:40", tag: "PROVISION", text: "IaC stack web-core v3.2 applied: web-prod-01..03 launched from golden image GI-2026.09. Tags auto-attached." },
    { id: "TL-04", day: "D-5", time: "14:02", tag: "PATCH", text: "Golden image GI-2026.09 released: kernel patched for CVE-2026-4472 (fictional training CVE, CVSS 9.1)." },
    { id: "TL-05", day: "D-4", time: "08:55", tag: "JOB", text: "Monthly archive-pull job read 41 GB from hlcy-bucket (project: halcyon). Media team owns the job; it is still scheduled." },
    { id: "TL-06", day: "D-4", time: "10:10", tag: "COST", text: "Storage review: aurora-bucket holds 3.4 TB in hot tier, 0 lifecycle rules. Est. $360/month." },
    { id: "TL-07", day: "D-3", time: "09:00", tag: "COST", text: "Cost review: fleet burn $63.70/day. Halcyon remnants alone = $34.00/day (53% of fleet spend)." },
    { id: "TL-08", day: "D-3", time: "13:22", tag: "SCALE", text: "Load test: 6x premiere surge simulated against asg-web-prod (max=2). Saturated at 3.1x; p95 latency 9.4 s." },
    { id: "TL-09", day: "D-3", time: "17:45", tag: "PROVISION", text: "Audit note: web-prod-04 launched via console 2026-06-02 (break-glass, j.alvarez). Never enrolled in IaC; no tags." },
    { id: "TL-10", day: "D-2", time: "21:03", tag: "ALERT", text: "Credential watch: hlcy-deploy-key last used 2 days ago (source: unknown-internal-2). Project halcyon closed in 2024." },
    { id: "TL-11", day: "D-2", time: "22:15", tag: "DECOMMISSION", text: "Halcyon shutdown plan (2024) marked \"partially complete\": 1 of 6 resources actually retired." },
    { id: "TL-12", day: "D-1", time: "06:30", tag: "PATCH", text: "Bulletin: CVE-2026-4472 affects kernels older than GI-2026.09. Fleet scan: web-prod-04 and staging-02 affected." },
    { id: "TL-13", day: "D-1", time: "09:20", tag: "SCALE", text: "Predictive model: premiere ramp 19:30→20:00 Friday, 6.2x baseline for ~3 h." },
    { id: "TL-14", day: "D-1", time: "11:05", tag: "CHANGE", text: "CTO memo: target -40% ops spend this month. Constraint: \"no impact to the finale SLA or the DR posture.\"" },
    { id: "TL-15", day: "D-1", time: "19:40", tag: "PROVISION", text: "green-test-01 provisioning from web-core v4 (staging smoke test for the new tier)." },
    { id: "TL-16", day: "D-1", time: "20:00", tag: "SCALE", text: "edge-lb: 2 of 4 web nodes at 78% CPU at baseline load — load imbalance flagged under CR-118." },
    { id: "TL-17", day: "D-1", time: "21:12", tag: "ALERT", text: "Night-shift watchdog: \"stale ASG policy\" on asg-web-prod (last reviewed 2025). Owner: platform-oncall (you)." },
    { id: "TL-18", day: "D-1", time: "22:40", tag: "CHANGE", text: "Shift log: night ops signed onto the ORBIT console." },
  ];

  // H9 incident replay excerpt — three lines prove resource hijacking (TA-1..TA-3).
  var ANOMALY_LINES = [
    { id: "TA-1", text: "D-2 03:08 · ALERT · web-prod-02: CPU sustained 97% — request rate to the node FLAT (no matching traffic increase)." },
    { id: "TA-2", text: "D-2 03:09 · NET · web-prod-02 opened an outbound connection to an undisclosed coin-pool endpoint; egress filter blocked it, retries continue." },
    { id: "TA-3", text: "D-2 03:11 · EXEC · web-prod-02: new cron entry created by the deploy account; process \"kdevtmpfs_backup\" consuming 8 cores." },
    { id: "TA-4", text: "D-2 03:12 · SCALE · asg-web-prod scaled out +2 (reaction to CPU). No traffic increase observed." },
    { id: "TA-5", text: "D-2 03:40 · COST · Billing alert: projected daily spend +180%." },
    { id: "TA-6", text: "D-2 03:55 · PATCH · GI-2026.09 confirmed present on web-prod-02 — anomaly is NOT CVE-related." },
  ];

  var VULN_BULLETIN = {
    cve: "CVE-2026-4472 \"PolarWind\" — FICTIONAL TRAINING CVE",
    cvss: "9.1 (synthetic)",
    detail:
      "Kernel privilege escalation affecting golden images older than GI-2026.09. Patch: redeploy from GI-2026.09. Synthetic data created for this exercise — it does not exist outside this lab.",
  };

  // ---------------- Objectives ----------------

  var OBJECTIVES = {
    MEDIUM: [
      {
        id: "M1", pillar: "P1", bay: "launch",
        title: "Sequence the four lifecycle phases in the correct order.",
        context: "Every cloud resource lives the same four-phase life. Get the order right and everything else in this lesson hangs off it.",
        where: "LAUNCH bay — \"Lifecycle board\".",
        hints: [
          "The Lifecycle board at the top of the LAUNCH bay has the four phase cards.",
          "Think of it as a sentence: create the thing → run and grow it → care for it → retire it.",
          "Order: Provision → Operate & scale → Maintain & update → Deprovision.",
        ],
        passMsg: "That ordering is the skeleton of this entire lesson: provisioning decides how everything later scales, patches and retires. Cloud+ leans on this constantly.",
      },
      {
        id: "M2", pillar: "P1", bay: "fleet",
        title: "Classify the lifecycle state of the four highlighted resources.",
        context: "State awareness is step one of fleet hygiene: you cannot scale, patch or retire what you have not noticed.",
        where: "FLEET DECK — the four resources with a \"?\" badge; open each dossier.",
        hints: [
          "Click a resource card to open its dossier — the state evidence is in the notes.",
          "One is mid-build (46%), one is a healthy prod node, one was retired in 2024, one bills with no purpose.",
          "web-prod-01 = ACTIVE · green-test-01 = PROVISIONING · hlcy-web-01 = RETIRED · hlcy-lb = ORPHANED.",
        ],
        passMsg: "Six states cover the whole model. Notice hlcy-lb: it is technically \"running\" but functionally dead — that state has a name (orphaned) and a cost.",
      },
      {
        id: "M3", pillar: "P1", bay: "launch",
        title: "Choose the provisioning method for the new finale tier and justify it.",
        context: "The finale tier must be rebuilt identically in three regions next month. Console clicks or code?",
        where: "LAUNCH bay — \"Provisioning decision\" card.",
        hints: [
          "Ask: can a console session be replayed, reviewed, or re-run in another region?",
          "IaC templates are versioned, reviewable, and repeatable; manual work is none of those.",
          "Pick IaC template and tick at least three of the four reason boxes.",
        ],
        passMsg: "IaC (Terraform/CloudFormation/ARM-style templates) is the Cloud+ answer for repeatability: consistent builds, drift you can actually fix, and a version history you can audit.",
      },
      {
        id: "M4", pillar: "P2", bay: "fleet",
        title: "Find the instance that was provisioned OUTSIDE the pipeline and flag its drift.",
        context: "One compute instance bypassed IaC entirely. Its config can silently diverge from the golden standard — that is drift.",
        where: "FLEET DECK — check dossiers; telemetry TL-09 remembers something.",
        hints: [
          "Look for: provisioning method ≠ IaC, missing tags, and a suspicious launch date.",
          "TL-09 (D-3) names the instance and the reason it exists.",
          "It is web-prod-04 — open its dossier and press \"Flag drift\".",
        ],
        passMsg: "Flagged. Untagged, out-of-pipeline instances escape patch baselines, cost allocation and audits — and attackers love resources nobody remembers owning. Next step for a real operator: re-enroll it in IaC or rebuild it from the golden image.",
      },
      {
        id: "M5", pillar: "P3", bay: "scale",
        title: "Repair the auto-scaler for finale traffic.",
        context: "The deployed policy (min 1 / max 2 / CPU>90% / 15 min / cooldown 30) saturated at 3.1x in testing. The finale is 6x.",
        where: "SCALE bay — auto-scaler console.",
        hints: [
          "Headroom: 3 nodes for high availability at min; trigger well below saturation; cooldown short enough to react mid-event.",
          "A trigger at 90% fires when users are already hurting; 15-minute windows and 30-minute cooldowns are glacial during a 3-hour spike.",
          "Target: min 3 · desired 3 · max 12 · CPU 65% · 5 min · cooldown 5 min (nearby values pass).",
        ],
        passMsg: "A defensible policy: HA baseline (min 3), ceiling sized for the surge (max 12), a trigger that fires before pain (65%), fast windows and cooldowns. Tune vs. cost is a real trade-off — your max is the guardrail that bounds it.",
      },
      {
        id: "M6", pillar: "P3", bay: "scale",
        title: "Run the finale simulation and name the scaling approach the console performs.",
        context: "Watch what the repaired autoscaler actually does when load climbs: does it grow one node, or the family?",
        where: "SCALE bay — run the simulation, then answer below it.",
        hints: [
          "The check needs a green simulation first — fix the policy if the run saturates.",
          "Watch the capacity bar: identical copies appear behind edge-lb.",
          "Adding interchangeable instances behind a load balancer = horizontal scale-out.",
        ],
        passMsg: "Horizontal scale-out is the cloud default for stateless tiers: no restart window, no hardware ceiling, and the LB spreads load. Vertical scaling would have meant resize + reboot — and a 6x ceiling you cannot buy your way past.",
      },
      {
        id: "M7", pillar: "P2", bay: "scale",
        title: "Match the four traffic patterns to their auto-scaling trigger types.",
        context: "Same autoscaler, four very different cues. Matching cue to trigger type is what makes scaling feel calm instead of lucky.",
        where: "SCALE bay — trigger matching board.",
        hints: [
          "Ask for each pattern: is the cue a calendar, a live metric, a forecast, or a human?",
          "Two are opposites: reacting to what IS happening vs. anticipating what WILL happen.",
          "Premiere every Friday = scheduled · CPU rule = dynamic · model ramp = predictive · engineer during incident = manual.",
        ],
        passMsg: "Mature fleets combine them: scheduled for the predictable, dynamic for the noise, predictive for ramps, manual for judgment calls. Exam questions love asking you to tell scheduled from dynamic.",
      },
      {
        id: "M8", pillar: "P4", bay: "patch",
        title: "Pick the OS update to deploy before Friday — and schedule it properly.",
        context: "The fleet runs app-OS 3.2. The vendor offers 3.7 (same major, security & stability fixes) and 4.1 (new major, breaking changes). Finale is Friday.",
        where: "PATCH BAY — \"Update decision\" card.",
        hints: [
          "Same major version = minor update: low risk, routine. New major = breaking-change risk that needs a full test cycle.",
          "A window one hour before the premiere is not a window; neither is \"no window\".",
          "Choose 3.7, window Sunday 02:00.",
        ],
        passMsg: "Minor update in a quiet maintenance window is textbook change management: low-risk fix, announced window, easy rollback story. The 4.1 major goes through full staging tests on its own schedule — not 48 hours before your biggest night of the season.",
      },
      {
        id: "M9", pillar: "P4", bay: "patch",
        title: "Plan the CVE patch campaign for the stateless web tier.",
        context: "GI-2026.09 must reach the web tier with zero downtime. The web nodes are interchangeable and sit behind edge-lb.",
        where: "PATCH BAY — \"Patch campaign planner\".",
        hints: [
          "Interchangeable nodes behind an LB should never all reboot together.",
          "Safety rails: health checks decide who rejoins; auto-rollback decides who gets pulled; a window decides when.",
          "Rolling (or canary) · batch below \"all at once\" · health checks ON · auto-rollback ON · window Sun 02:00.",
        ],
        passMsg: "Rolling replacement one node at a time behind health-checked LB edges is the workhorse for stateless fleets: capacity never drops below baseline and a bad batch stops with the fleet intact. Blue-green would also work here — at double the transient cost.",
      },
      {
        id: "M10", pillar: "P2", bay: "deorbit",
        title: "Select every Project Halcyon resource still burning budget.",
        context: "Halcyon closed in 2024. Its shutdown plan says \"partially complete\". Orphans bill quietly forever.",
        where: "DEORBIT bay — orphan selection board.",
        hints: [
          "Filter the fleet by project tag halcyon; cross-check with TL-07 and TL-11.",
          "One Halcyon resource is already retired — retired things cost $0.",
          "Five: hlcy-encoder, hlcy-bucket, hlcy-lb, hlcy-deploy-key, hlcy-snap. NOT hlcy-web-01.",
        ],
        passMsg: "Five orphans = $34/day = 53% of fleet spend, exactly what TL-07 measured. This is why decommissioning is a lifecycle phase and not an afterthought: money, patch surface, and credential risk all linger until you close it out.",
      },
      {
        id: "M11", pillar: "P4", bay: "deorbit",
        title: "Order the five steps of a safe decommission of the Halcyon encoder.",
        context: "Termination is irreversible. The order of operations is the whole difference between clean retirement and an outage or data loss.",
        where: "DEORBIT bay — decommission sequencer.",
        hints: [
          "What must be true before deletion becomes irreversible? Dependencies, data, access.",
          "Credentials should never outlive the resource they protect.",
          "Check dependencies → snapshot → revoke → deprovision → update CMDB.",
        ],
        passMsg: "Correct. The two most-skipped steps are also the two that bite: revoking credentials before the resource disappears, and updating the CMDB so the next audit does not resurrect a ghost.",
      },
      {
        id: "M12", pillar: "P4", bay: "deorbit",
        title: "Give aurora-bucket a lifecycle policy and turn on tag enforcement.",
        context: "3.4 TB of media, all in hot tier, no rules. Media ages: hot for weeks, archive for the retention year, then gone.",
        where: "DEORBIT bay — storage lifecycle policy card.",
        hints: [
          "The card takes two age thresholds and a governance toggle.",
          "Archive tier after ~3 months; deletion only after the full retention year.",
          "Archive after 90 days · delete after 365 days · tag enforcement ON.",
        ],
        passMsg: "Lifecycle policies automate the boring half of data governance: cost drops with zero heroics, and tag enforcement keeps future resources attributable from birth — the anti-drift habit this lesson keeps circling.",
      },
    ],
    HARD: [
      {
        id: "H1", pillar: "P2", bay: "fleet",
        title: "Night audit: build the triage board (production-path vulns / non-IaC / orphans).",
        context: "Three boards, three exact sets. Read dossiers and telemetry before trusting anything that merely looks idle or old. Traps are planted.",
        where: "FLEET DECK (dossiers) + TELEMETRY (TL-05, TL-09, TL-12).",
        hints: [
          "TL-12 names two unpatched machines; only one has a production path — read the network notes. TL-09 names the manual launch; the halcyon tag marks the rest.",
        ],
        passMsg: "Clean triage: web-prod-04 was the only CVE-exposed prod path (staging-02 is isolated, db nodes are patched); two machines escaped the pipeline; five Halcyon orphans. Interrogate evidence before prioritizing — \"old\" and \"idle\" are not vulnerabilities by themselves.",
      },
      {
        id: "H2", pillar: "P1", bay: "launch",
        title: "Order the eight-step rollout of the new finale tier, template to clean-up.",
        context: "From \"we need a tier\" to \"the fleet is clean again\". Every governance bookend is in here.",
        where: "LAUNCH bay — rollout sequencer.",
        hints: [
          "Nothing ships before it exists in source control; nothing closes until the CMDB does.",
        ],
        passMsg: "This is the lifecycle as one governed arc: versioned template → approved change → tested staging → canary → scaled rollout → monitored event → drained leftovers → revoked access and honest paperwork. Exam PBQs love this ordering.",
      },
      {
        id: "H3", pillar: "P3", bay: "scale",
        title: "Rebuild the autoscaler for finale night, then survive the full simulation.",
        context: "Two hazards are scripted: the 20:00 premiere ramp and a 22:40 anomaly on one node. Your config must absorb both without a cost blowout.",
        where: "SCALE bay — finale-night console (scheduled + dynamic + cap).",
        hints: [
          "Pre-scale on the calendar before the ramp, react on the metric during it, and keep a ceiling the anomaly cannot weaponize: scheduled 19:30 to 8 · dynamic CPU 65% · max 14 · cooldown 5.",
        ],
        passMsg: "Scheduled pre-scale handled the predictable ramp; the dynamic trigger handled the noise; the cap turned the 22:40 anomaly from a billing incident into a blip. An uncapped autoscaler facing fabricated load will happily buy the attacker a very expensive night.",
      },
      {
        id: "H4", pillar: "P4", bay: "patch",
        title: "Choose and justify the update strategy per tier: stateless web vs. stateful orders DB.",
        context: "Constraints: zero downtime, rollback mandatory. The tiers are nothing alike — the strategies should not be either.",
        where: "PATCH BAY — strategy cards (web + db), with justification chips.",
        hints: [
          "Stateless machines can be replaced one-by-one behind the LB; stateful state needs a parallel world and a switch.",
        ],
        passMsg: "Rolling for the stateless web tier (cheap, safe, no extra fleet), blue-green for the stateful DB (identical parallel environment, instant switch-back via replica). Strategy follows the workload, not the fashion.",
      },
      {
        id: "H5", pillar: "P4", bay: "patch",
        title: "Execute the DB blue-green cutover: order the six steps.",
        context: "Blue = the live, patched-before orders DB. Green = the new GI-2026.09 world. Traffic moves exactly once.",
        where: "PATCH BAY — blue-green sequencer.",
        hints: [
          "Green exists before traffic moves; blue stays warm until green has soaked.",
        ],
        passMsg: "Textbook blue-green: build and prove green, cut over in one LB move, keep blue warm as the instant rollback, then close out credentials and records. The soak window is what separates this from hope.",
      },
      {
        id: "H6", pillar: "P4", bay: "deorbit",
        title: "Decommission hlcy-bucket without breaking the monthly archive job.",
        context: "TL-05: a job still reads this bucket monthly. TL-10: its deploy key was used 2 days ago. Delete in the wrong order and something breaks loudly.",
        where: "DEORBIT bay — bucket sequencer + dependency notes.",
        hints: [
          "The archive job and the deploy key are both alive — pause the pipeline with its owner, and revoke the key, before the bucket exists no more.",
        ],
        passMsg: "You quiesced the consumer, proved quietness, preserved data, killed the credential, then deleted — the only order in which nothing surprises you at 2 a.m. Dependency discovery BEFORE deletion is the entire skill.",
      },
      {
        id: "H7", pillar: "P4", bay: "deorbit",
        title: "Author the lifecycle policy pack for three resource classes.",
        context: "Prod VM, staging VM, media bucket — each gets a patch cadence, off-hours behavior, a TTL where sensible, and an end-of-life action.",
        where: "DEORBIT bay — policy pack builder.",
        hints: [
          "Prod = stability cadence, no auto-stop, no TTL. Staging = cheap, off at night, expires. Bucket = age-based tiers ending in deletion.",
        ],
        passMsg: "Policies beat heroics: a staging fleet that patches weekly, sleeps at night and expires at 90 days manages itself, while the prod class stays conservative. This is lifecycle management scaled to hundreds of resources.",
      },
      {
        id: "H8", pillar: "P4", bay: "deorbit",
        title: "CTO memo: cut 40% of ops spend without touching the finale SLA or DR.",
        context: "TL-14 sets the constraint. TL-07 measured the burn. Choose what goes and what is explicitly protected.",
        where: "DEORBIT bay — cost triage board.",
        hints: [
          "Orphans are pure margin; DR capacity and the premiere fleet are protected — the memo says so, and DR-07 means it.",
        ],
        passMsg: "The five Halcyon orphans were 53% of spend — the whole target, no heroics. The idle-looking replica stays: DR standbys are supposed to be idle, and DR-07 would have made deleting it a career event.",
      },
      {
        id: "H9", pillar: "P3", bay: "telemetry",
        title: "Incident replay: prove the 03:11 hijack from telemetry, then order containment.",
        context: "Last night one web node went to 97% CPU with no matching traffic and the autoscaler cheered it on. Pick the three lines that prove compromise, then order containment.",
        where: "TELEMETRY bay — incident replay block.",
        hints: [
          "Three lines prove the compromise (CPU without traffic, the pool endpoint, the cron implant); then contain the amplifier, the node, the key, and rebuild clean.",
        ],
        passMsg: "You separated evidence from consequence: TA-1/2/3 prove hijacking (MITRE T1496-style resource hijacking), while TA-4/5 were the autoscaler amplifying it — why capping came first. Revoking the key before re-imaging killed the persistence. MITRE M1051 (Update Software) closes the loop.",
      },
    ],
  };

  // ---------------- Quizzes ----------------

  var QUIZ = {
    MEDIUM: [
      {
        id: "QM1", q: "Which sequence is the correct cloud resource lifecycle?",
        options: [
          "Provision → Maintain & update → Deprovision → Operate & scale",
          "Provision → Operate & scale → Deprovision → Maintain & update",
          "Provision → Operate & scale → Maintain & update → Deprovision",
          "Operate & scale → Provision → Maintain & update → Deprovision",
        ],
        answer: 2,
        explain: "The arc runs create → run and size → care for → retire. A and D are impossible: nothing is maintained or operated before it is provisioned, and nothing operates after retirement. B is the tempting near-miss: maintenance must conclude the cycle BEFORE deprovisioning, because you patch and update a resource right up until the day you retire it.",
      },
      {
        id: "QM2", q: "Adding three more identical web instances behind the load balancer is…",
        options: [
          "Horizontal scaling (scale-out)",
          "Vertical scaling (scale-up)",
          "Horizontal scaling (scale-in)",
          "Vertical scaling (scale-down)",
        ],
        answer: 0,
        explain: "More interchangeable copies of the same instance behind one LB is horizontal scale-out. C is the same axis in the opposite direction (removing instances), while B and D resize a single instance — up means more CPU/RAM with a restart, down means less. The give-away detail is \"identical instances behind the load balancer\".",
      },
      {
        id: "QM3", q: "A rule says: \"when CPU stays above 65% for 5 minutes, add an instance.\" What trigger type is that?",
        options: [
          "Scheduled — it follows the calendar",
          "Predictive — it reads a forecast",
          "Manual — a human operator decides",
          "Dynamic — it reacts to metrics",
        ],
        answer: 3,
        explain: "A live metric (CPU) crossing a threshold for a sustained window is the definition of dynamic (reactive) scaling. A fires on dates, B acts before the load arrives based on a forecast, and C is an operator clicking the button — none of those is watching a live metric.",
      },
      {
        id: "QM4", q: "Why is an OS move from 3.2 to 3.7 lower-risk than 3.2 to 4.1?",
        options: [
          "4.1 skips the staging cycle, while 3.7 always goes through it",
          "3.7 stays inside the same major version: routine fixes, low risk",
          "3.7 ran on other fleets first, so its regressions are known",
          "4.1 cannot roll back once it is deployed to any node",
        ],
        answer: 1,
        explain: "Same-major = minor update: security and stability fixes with few breaking changes — that is the whole reason it is the safe pick 48 hours before the finale. A is false: every update deserves staging; majors simply need a full test cycle, not a skipped one. C invents a soak history nobody verified. D is false too — with a sound strategy any major can roll back; the risk is breakage, not irreversibility.",
      },
      {
        id: "QM5", q: "You stand up a complete second environment and shift the load balancer 100% to it in one move. That is…",
        options: [
          "Rolling update, batch of one",
          "Canary release, small slice first",
          "Blue-green deployment with cutover",
          "In-place update with reboot",
        ],
        answer: 2,
        explain: "Two complete environments plus a single traffic switch is textbook blue-green; the old environment stays warm as instant rollback. A replaces instances a few at a time, B sends only a small slice to the new version first, and D never builds a second environment at all.",
      },
      {
        id: "QM6", q: "Before deleting a 1.2 TB bucket that belongs to a project closed last year, the FIRST step is…",
        options: [
          "Verify dependencies and archive anything worth keeping",
          "Retag it so the billing report improves",
          "Delete it — closed projects owe nothing",
          "Reboot the instances attached to it",
        ],
        answer: 0,
        explain: "Deletion is irreversible, so dependency discovery (jobs, DNS, integrations — maybe a monthly archive job) plus a final snapshot come first; credentials are revoked and records updated after. B changes labels but not risk, C is exactly how orphans lose data, and D reboots compute that may not even be attached to the bucket.",
      },
      {
        id: "QM7", q: "The primary benefit of provisioning with IaC templates instead of the console is…",
        options: [
          "Console clicks are faster than code",
          "Templates remove the need for testing",
          "IaC permanently prevents all drift",
          "Repeatable, version-controlled builds you can review",
        ],
        answer: 3,
        explain: "IaC turns a build into a versioned, reviewable, repeatable artifact — identical environments and a diff-able history you can audit. A describes manual provisioning, not a benefit of templates. B is false: template-built fleets still get tested. C overclaims — drift still happens when people click in the console; IaC gives you drift DETECTION and a fix path, not prevention.",
      },
    ],
    HARD: [
      {
        id: "QH1", q: "Friday 18:00. A pre-finale promo has all web nodes at 94% CPU. The premiere starts at 20:00. Best immediate move?",
        options: [
          "Wait until 20:00 — the autoscaler handles it all",
          "Scale out now and verify the ASG has headroom",
          "Vertically resize the orders database for headroom",
          "Disable the health checks so no node drops out",
        ],
        answer: 1,
        explain: "You already hold evidence that demand exceeds capacity — scale out now (dynamic) and confirm min/max can absorb the 6x premiere. A burns your reaction margin hoping the policy fixes itself. C resizes a stateful database that is not the bottleneck. D removes the safety net that pulls dead nodes out of rotation.",
      },
      {
        id: "QH2", q: "The stateful orders DB needs the kernel patch with zero downtime and instant rollback. Strategy?",
        options: [
          "In-place: patch and restart at lunch",
          "Rolling: patch writers one by one",
          "Skip it — databases cannot be patched",
          "Blue-green: build parallel DB, switch traffic",
        ],
        answer: 3,
        explain: "Stateful + zero-downtime + instant rollback = blue-green: build the patched parallel DB, replicate data, switch once, keep blue warm as the rollback. A restarts the single writer (downtime). B still interrupts writes on a single-writer DB no matter how slowly you roll. C abandons a critical patch — databases get patched, just carefully.",
      },
      {
        id: "QH3", q: "Which resource can be deleted with the LEAST investigation right now?",
        options: [
          "An LB with no targets since 2024",
          "The production orders database, single writer",
          "The warm standby DR replica protected by DR-07",
          "The edge-lb fronting the live web tier",
        ],
        answer: 0,
        explain: "A load balancer with an empty registered-target list for two years is the purest orphan in the fleet — a quick DNS/CNAME glance is still polite, but that is the whole investigation. B holds production state, C is the DR failover target under DR-07, and D carries live production traffic this minute.",
      },
      {
        id: "QH4", q: "staging-02 (unpatched, network-isolated) and web-prod-04 (unpatched, production path) both miss the CVE fix. Which first?",
        options: [
          "staging-02 — it carries the oldest image baseline",
          "Neither — the orders database takes priority first",
          "web-prod-04 — it sits on the internet-facing path",
          "Both at once — they share the same CVE",
        ],
        answer: 2,
        explain: "Exposure beats age: web-prod-04 is reachable on the production path serving real traffic, so it is patched first. A rank-orders by image age, which says nothing about exploitability. B invents a priority the evidence does not support — the DB is already patched. D treats an isolated staging box and an exposed prod node as equal risks; they are not.",
      },
      {
        id: "QH5", q: "During the finale, one node hits 97% CPU with NO matching request increase and egress retries to a coin-pool endpoint. First lifecycle-aware containment?",
        options: [
          "Raise the ASG ceiling so the fleet can breathe",
          "Cap the ASG, isolate the node, revoke, re-image",
          "Reboot the entire fleet in a single window",
          "Clear the node tags so auditors cannot see it",
        ],
        answer: 1,
        explain: "Fabricated load (resource hijacking, MITRE T1496-style) weaponizes your autoscaler: cap the amplifier, isolate the node out of the LB, revoke the credential that gave access (persistence), then rebuild from the trusted golden image. A is exactly backwards — a higher ceiling buys the attacker more instances. B\u2019s order matters: containment before rebuild. C destroys evidence and availability together. D hides the incident instead of containing it.",
      },
      {
        id: "QH6", q: "Compliance wants audit logs queryable for a year, but they are rarely read after month one. Best lifecycle answer?",
        options: [
          "Keep everything in the hot tier forever",
          "Delete after 30 days — nobody reads logs",
          "Copy them to a compute instance for safekeeping",
          "Archive after 90 days, delete at 365",
        ],
        answer: 3,
        explain: "A tiering policy matches cost to access: hot while actively queried, archive for the retention year, automatic deletion when retention ends. A pays hot-tier prices for eleven wasted months. B breaks the one-year compliance requirement. C turns compute into a fake archive — no tiering, no lifecycle rules, and an EBS bill nobody asked for.",
      },
      {
        id: "QH7", q: "For the serverless transcoder (FaaS), who patches what?",
        options: [
          "We patch the provider runtime each month",
          "Provider patches runtime; we patch our code",
          "Nobody — serverless patches itself end to end",
          "Patching happens only during a DR event",
        ],
        answer: 0,
        explain: "Shared responsibility splits down the middle: the provider owns and patches the platform runtime, while the customer keeps function code and its dependencies current — that vulnerable old library in your function is still yours. A inverts the split. C assumes magic: serverless does not review your dependencies. D ties patching to disaster recovery, which has nothing to do with it.",
      },
    ],
  };

  // ---------------- Knowledge core ----------------

  var MANUAL_SECTIONS = [
    {
      id: "lifecycle",
      title: "The lifecycle — four phases, one arc",
      body: [
        "PROVISION — the resource is created: from an IaC template or by hand in a console. Everything downstream (tagging, patching, cost ownership) is decided here. Golden images give every new instance a known, patched starting point.",
        "OPERATE & SCALE — the resource serves traffic and its fleet grows or shrinks. Horizontal scaling adds/removes interchangeable instances behind a load balancer; vertical resizing grows one instance (restart, hard ceiling). Auto-scaling automates the decision with min/desired/max bounds, a trigger, and a cooldown.",
        "MAINTAIN & UPDATE — patches and version updates keep the resource supportable. Minor updates (same major version) are routine; major updates change behavior and need a full test cycle. Strategies: in-place, rolling, canary, blue-green — always with a maintenance window, health checks and a rollback story.",
        "DEPROVISION — retirement at end-of-life/end-of-support: verify dependencies, preserve data, revoke credentials, delete the resource, update the CMDB. Skipped deprovisioning produces orphans — resources that bill, hold data and carry credentials long after their mission ends.",
      ],
    },
    {
      id: "provision",
      title: "Provisioning & IaC",
      body: [
        "Manual console provisioning is fast for one-off experiments and terrible for anything you will ever need twice: unrepeatable, unauditable, drift-prone. Infrastructure as Code (Terraform/CloudFormation/ARM-style templates) turns a build into a versioned, reviewable, repeatable artifact.",
        "Drift is the gap between what the template declares and what actually runs — usually caused by manual console changes. Drift detection compares live state to declared state; the cure is pipeline discipline plus tagging at birth (team, environment, cost center, lifecycle owner).",
        "Shared responsibility reminder: with IaaS you patch the guest OS; with PaaS/FaaS the provider patches the runtime while you keep your code and dependencies current.",
      ],
    },
    {
      id: "scale",
      title: "Scaling & auto-scaling",
      body: [
        "Horizontal (out/in): add or remove interchangeable instances behind a load balancer. The cloud-preferred pattern for stateless workloads — no restart, no ceiling. Vertical (up/down): resize the single instance. Simpler, but it needs a restart and caps out at the biggest instance you can buy.",
        "An auto-scaling policy has four moving parts: bounds (min / desired / max), a trigger (metric + threshold + evaluation window), a cooldown (quiet period after an action so it does not thrash), and the scaling action itself.",
        "Trigger types: DYNAMIC reacts to a live metric crossing a threshold; SCHEDULED fires on the calendar for known events; PREDICTIVE acts on a forecast before the ramp; MANUAL is an operator judgment call. Mature policies combine them — scheduled for the predictable, dynamic for the noise.",
      ],
    },
    {
      id: "update",
      title: "Updates & patch strategies",
      body: [
        "Minor update: within the same major version (3.2 → 3.7) — mostly security and stability fixes, routine risk. Major update (3.2 → 4.1): breaking-change territory, deserves a full staging cycle. Both go through an announced maintenance window with a rollback plan.",
        "In-place: patch the instance where it stands (brief downtime). Rolling: replace instances in small batches behind health-checked LB edges — the stateless workhorse. Canary: send a small traffic slice to the new version first. Blue-green: run two complete environments and switch traffic in one move — instant rollback, double the transient cost.",
        "For security patching, urgency follows exposure: an internet-facing production path outranks an isolated staging box running the same vulnerable version. Mass campaigns (think Log4Shell, CVE-2021-44228) are exactly why pipeline-driven fleets win: one golden image rebuild, then rolling re-deployment.",
      ],
    },
    {
      id: "deprov",
      title: "Deprovisioning, orphans & governance",
      body: [
        "End-of-life (EOL) / end-of-support (EOS) means the vendor stops shipping fixes — running past it is unpatched risk by definition. Decommissioning sequence: discover dependencies → snapshot/archive data → revoke credentials → deprovision → update records.",
        "Orphans (\"zombie resources\") are the residue of skipped step five: unattached volumes, empty load balancers, forgotten buckets, stale deploy keys. They cost money daily, hold data you forgot you had, and extend attack surface nobody watches.",
        "Governance scales lifecycle management: storage lifecycle policies tier data hot → archive → delete; TTLs expire staging toys; auto-stop turns non-prod off at night; tag enforcement at provisioning keeps every resource attributable from birth. Cost optimization is not a separate project — it is the lifecycle done right.",
      ],
    },
    {
      id: "realworld",
      title: "Real-world context & MITRE view",
      body: [
        "Log4Shell (CVE-2021-44228, 2021): a single vulnerable library forced patch campaigns across millions of cloud hosts — the operational argument for image-based, pipeline-driven updates.",
        "Tesla (2018): attackers cryptojacked a cloud Kubernetes cluster via an exposed console; the miners\u2019 CPU load is exactly the \"traffic-free CPU\" signature this lab trains you to catch (MITRE T1496 Resource Hijacking).",
        "Uber (2016): credentials for a cloud storage bucket were left lying around and worked years later — stale credentials on forgotten resources in one sentence (MITRE T1078.004 Valid Accounts: Cloud Accounts).",
        "MITRE anchors used in this lab: M1051 Update Software · T1496 Resource Hijacking · T1530 Data from Cloud Storage Object · T1078.004 · T1580 Cloud Infrastructure Discovery. Lifecycle management is attack-surface management.",
      ],
    },
  ];

  var GLOSSARY = [
    { term: "Provisioning", def: "Creating and configuring a cloud resource — from template (IaC) or by hand (console/CLI)." },
    { term: "Golden image", def: "A pre-built, patched, hardened machine image used as the trusted source for new instances." },
    { term: "IaC", def: "Infrastructure as Code — machine-readable templates that build resources repeatably and version-controlled." },
    { term: "Drift", def: "Divergence between the declared (template) configuration and what actually runs, usually from manual changes." },
    { term: "Horizontal scaling", def: "Adding/removing interchangeable instances (scale-out/in) behind a load balancer; best for stateless tiers." },
    { term: "Vertical scaling", def: "Resizing one instance bigger/smaller (scale-up/down); needs a restart and has a hard hardware ceiling." },
    { term: "Auto-scaling", def: "Automated capacity changes governed by min/desired/max bounds, a metric trigger, and a cooldown." },
    { term: "Cooldown", def: "A quiet period after a scaling action before another can fire, preventing thrash." },
    { term: "Maintenance window", def: "An announced, low-traffic time slot approved for applying changes." },
    { term: "Minor vs major update", def: "Minor = same major version (security/stability, low risk); major = new version family with breaking-change risk." },
    { term: "Rolling update", def: "Replacing instances in small batches behind health checks so capacity never drops below baseline." },
    { term: "Canary release", def: "Exposing the new version to a small traffic slice first, watching telemetry before full rollout." },
    { term: "Blue-green deployment", def: "Two identical full environments; traffic switches from blue to green in one move; blue stays warm for instant rollback." },
    { term: "Deprovisioning (EOL/EOS)", def: "The controlled retirement of a resource at end-of-life/support: dependencies, data, credentials, deletion, records." },
    { term: "Orphaned resource", def: "A live resource nobody remembers owning — billing, holding data, carrying credentials after its project closed." },
    { term: "Storage lifecycle policy", def: "Rules that age data across tiers (hot → archive → delete) to match cost to access." },
    { term: "Right-sizing", def: "Adjusting instance size (or schedule) to match actual utilization — the polite way to \"cut\" cost." },
    { term: "CMDB", def: "Configuration management database — the record of what exists, who owns it, and why." },
  ];

  var PILLAR_LABELS = {
    P1: "Understand",
    P2: "Recognize",
    P3: "Detect",
    P4: "Mitigate",
  };

  // ---------------- Board / widget content (from the original components) ----------------

  var M2_TARGETS = ["web-prod-01", "green-test-01", "hlcy-web-01", "hlcy-lb"];
  var STATE_OPTIONS = ["PROVISIONING", "ACTIVE", "MAINTENANCE", "DRAINING", "RETIRED", "ORPHANED"];

  var KIND_ICON = {
    compute: "server",
    storage: "hard-drive",
    database: "database",
    loadbalancer: "network",
    key: "key-round",
    function: "zap",
  };

  var LIFECYCLE_STEPS = [
    { id: "provision", label: "Provision — create from template or console" },
    { id: "operate", label: "Operate & scale — serve traffic, size the fleet" },
    { id: "maintain", label: "Maintain & update — patch, upgrade, stay supportable" },
    { id: "deprov", label: "Deprovision — retire cleanly at EOL/EOS" },
  ];

  var LAUNCH_STEPS = [
    { id: "template", label: "Author the IaC template for the new tier; commit & version it" },
    { id: "change", label: "Route the change through review & approval (change management)" },
    { id: "staging", label: "Provision the tier in staging from the template; run load & smoke tests" },
    { id: "canary", label: "Canary: release to ~5% of production traffic; watch telemetry" },
    { id: "rollout", label: "Full rollout; set the auto-scaler (min/desired/max) for the premiere" },
    { id: "monitor", label: "Monitor telemetry & error budget through the event" },
    { id: "drain", label: "Drain & retire any superseded instances" },
    { id: "closeout", label: "Revoke temporary credentials; update the CMDB" },
  ];

  var IAC_REASONS = [
    { id: "consistent", label: "Identical, repeatable builds every time" },
    { id: "drift", label: "Drift becomes detectable & correctable" },
    { id: "audit", label: "Versioned history — reviewable and auditable" },
    { id: "scale", label: "Rebuild the same tier in any region in minutes" },
  ];

  var TEMPLATE_SNIPPET = [
    'template "web-core" {',
    '  version  = "v4.0"            # committed 2026-09-28, reviewed',
    '  image    = "golden/GI-2026.09"  # CVE-2026-4472 patched',
    '  tags     = { team = "platform", env = "prod",',
    '               cost-center = "cc-ops-2", lifecycle = "owner:finale-cr118" }',
    "  scaling  = { min = 3, desired = 3, max = 12 }",
    "}",
  ];

  var TRIGGER_TYPES = [
    { id: "scheduled", label: "Scheduled", desc: "fires on the calendar" },
    { id: "dynamic", label: "Dynamic", desc: "reacts to a live metric" },
    { id: "predictive", label: "Predictive", desc: "acts on a forecast" },
    { id: "manual", label: "Manual", desc: "a human decides" },
  ];

  var TRIGGER_PATTERNS = [
    { id: "p-premiere", text: "The season finale airs every Friday at 20:00 and doubles traffic." },
    { id: "p-cpu", text: "CPU above 65% for 5 minutes → add an instance." },
    { id: "p-forecast", text: "The model forecasts a viewership ramp starting 19:30." },
    { id: "p-incident", text: "During an incident, the on-call engineer adds capacity by hand." },
  ];

  var M11_STEPS = [
    { id: "deps", label: "Confirm no active dependencies (jobs, DNS, integrations)" },
    { id: "snap", label: "Take the final snapshot / archive data worth keeping" },
    { id: "revoke", label: "Revoke the encoder's credentials & deploy keys" },
    { id: "del", label: "Deprovision (terminate) hlcy-encoder" },
    { id: "cmdb", label: "Update the CMDB; mark the record retired" },
  ];

  var M11_WARNINGS = {
    del: "Telemetry shows Halcyon jobs and keys still alive — deleting before dependencies are cleared and credentials revoked is how outages and ghost access happen.",
    revoke: "Revoke BEFORE deletion — credentials must never outlive the resource they open.",
    cmdb: "Records update last, but they do get updated — that is what stops the next audit resurrecting a ghost.",
  };

  var H5_STEPS = [
    { id: "build", label: "Provision green DB tier from patched golden image (side-by-side)" },
    { id: "prove", label: "Replicate/restore data; run smoke tests on green" },
    { id: "switch", label: "Shift edge load balancer 100% to green (single cutover)" },
    { id: "soak", label: "Keep blue warm; monitor the soak window" },
    { id: "retire", label: "Drain & retire blue after soak" },
    { id: "closeout", label: "Revoke blue-era credentials; update the CMDB" },
  ];

  var H5_WARNINGS = {
    retire: "Blue never retires before green has soaked — blue IS the instant rollback until the soak closes.",
    closeout: "Credentials and records close out only after blue is gone.",
  };

  var H6_STEPS = [
    { id: "quiesce", label: "Get media-team sign-off to pause the monthly archive-pull job" },
    { id: "verify", label: "Re-verify no other readers/writers on hlcy-bucket" },
    { id: "snap", label: "Final snapshot of the 1.2 TB (30-day retention)" },
    { id: "revoke", label: "Revoke hlcy-deploy-key (last used 2 days ago)" },
    { id: "delete", label: "Delete hlcy-bucket" },
    { id: "cmdb", label: "Update CMDB; close the Halcyon decommission ticket" },
  ];

  var H6_WARNINGS = {
    delete: "The archive-pull job (TL-05) and the deploy key (TL-10) are still alive — pausing the consumer and revoking the credential MUST come before deletion.",
    revoke: "The key can reach the bucket until revoked — revoke before the bucket disappears.",
    cmdb: "Close the ticket only after the bucket is actually gone.",
  };

  var CONTAIN_STEPS = [
    { id: "cap", label: "Cap the auto-scaler max — stop the cost amplification" },
    { id: "isolate", label: "Isolate web-prod-02 (out of edge-lb, quarantine security group)" },
    { id: "revoke", label: "Revoke the leaked deploy credential — kill persistence" },
    { id: "reimage", label: "Re-image the node from trusted golden image GI-2026.09" },
  ];

  var TRIAGE_COLS = [
    { key: "vuln", title: "BOARD A · CVE-2026-4472 on a PRODUCTION path", hint: "exposed, not merely old" },
    { key: "manual", title: "BOARD B · provisioned OUTSIDE IaC", hint: "console-born" },
    { key: "orphan", title: "BOARD C · Project Halcyon orphans (still billing)", hint: "project closed 2024" },
  ];

  var COST_CUT_IDS = ["hlcy-encoder", "hlcy-bucket", "hlcy-lb", "hlcy-deploy-key", "hlcy-snap", "dev-sandbox", "staging-01", "db-orders-replica"];
  var COST_PROTECT_IDS = ["asg-web-prod", "db-orders", "db-orders-replica", "aurora-bucket", "staging-fleet"];

  // Debrief content (C6)
  var DETECTION_OPS = [
    { src: "Autoscaler decision logs", logic: "scale-out events whose observed request-rate delta is ~0 → fabricated load (T1496-style hijack). Alert when fleet grows while traffic does not." },
    { src: "Fleet inventory vs IaC state (drift scan)", logic: "resources present in live inventory but absent from state files, or missing required tags → out-of-pipeline drift. Nightly diff." },
    { src: "Cost anomaly monitor", logic: "daily burn jumps >20% without a change record → check for orphan scale-outs or forgotten resources first." },
    { src: "Credential last-used telemetry", logic: "keys/roles attached to closed projects with recent usage → stale-credential risk (T1078.004-style). Revoke on decommission, alert on use." },
    { src: "Patch-level compliance report", logic: "instances whose image predates the current security baseline, intersected with internet-reachable network paths → prioritized patch queue." },
  ];

  var REFS = [
    { href: "https://www.comptia.org/en-us/certifications/cloud", label: "CompTIA Cloud+ (CV0-004) — official page" },
    { href: "https://attack.mitre.org/mitigations/M1051/", label: "MITRE M1051 — Update Software" },
    { href: "https://attack.mitre.org/techniques/T1496/", label: "MITRE T1496 — Resource Hijacking" },
    { href: "https://attack.mitre.org/techniques/T1530/", label: "MITRE T1530 — Data from Cloud Storage Object" },
    { href: "https://attack.mitre.org/techniques/T1078/004/", label: "MITRE T1078.004 — Cloud Accounts" },
    { href: "https://attack.mitre.org/techniques/T1580/", label: "MITRE T1580 — Cloud Infrastructure Discovery" },
  ];

  // Quiz topic → review pointer (R8)
  var QUIZ_FOCUS = {
    QM1: { area: "Lifecycle phase order", review: "Flight manual → The lifecycle" },
    QM2: { area: "Horizontal vs vertical scaling", review: "Flight manual → Scaling & auto-scaling" },
    QM3: { area: "Auto-scaling trigger types", review: "Flight manual → Scaling & auto-scaling" },
    QM4: { area: "Minor vs major updates", review: "Flight manual → Updates & patch strategies" },
    QM5: { area: "Blue-green deployments", review: "Flight manual → Updates & patch strategies" },
    QM6: { area: "Safe decommissioning first step", review: "Flight manual → Deprovisioning & governance" },
    QM7: { area: "IaC value & drift", review: "Flight manual → Provisioning & IaC" },
    QH1: { area: "Scaling timing & ASG headroom", review: "Flight manual → Scaling & auto-scaling" },
    QH2: { area: "Stateful update strategy", review: "Flight manual → Updates & patch strategies" },
    QH3: { area: "Orphan identification", review: "Flight manual → Deprovisioning & governance" },
    QH4: { area: "Exposure-based patch priority", review: "Flight manual → Updates & patch strategies" },
    QH5: { area: "Hijack containment order", review: "Flight manual → Real-world context & MITRE view" },
    QH6: { area: "Storage lifecycle tiering", review: "Flight manual → Deprovisioning & governance" },
    QH7: { area: "Shared responsibility (FaaS)", review: "Flight manual → Provisioning & IaC" },
  };

  var BAY_REVIEW = {
    fleet: "FLEET DECK dossiers + Flight manual → The lifecycle",
    launch: "LAUNCH bay + Flight manual → Provisioning & IaC",
    scale: "SCALE bay + Flight manual → Scaling & auto-scaling",
    patch: "PATCH BAY + Flight manual → Updates & patch strategies",
    deorbit: "DEORBIT bay + Flight manual → Deprovisioning & governance",
    telemetry: "TELEMETRY bay + Flight manual → Real-world context & MITRE view",
  };

  var BAYS = [
    { id: "fleet", label: "Fleet Deck", icon: "satellite" },
    { id: "launch", label: "Launch", icon: "rocket" },
    { id: "scale", label: "Scale", icon: "gauge" },
    { id: "patch", label: "Patch Bay", icon: "wrench" },
    { id: "deorbit", label: "Deorbit", icon: "recycle" },
    { id: "telemetry", label: "Telemetry", icon: "radio" },
    { id: "quiz", label: "Cert Check", icon: "clipboard-check" },
    { id: "debrief", label: "Debrief", icon: "book-open" },
  ];

  var PILLAR_COLOR = {
    P1: "p1", P2: "p2", P3: "p3", P4: "p4",
  };

  return {
    HALCYON_ORPHANS: HALCYON_ORPHANS,
    FLEET: FLEET,
    TELEMETRY: TELEMETRY,
    ANOMALY_LINES: ANOMALY_LINES,
    VULN_BULLETIN: VULN_BULLETIN,
    OBJECTIVES: OBJECTIVES,
    QUIZ: QUIZ,
    MANUAL_SECTIONS: MANUAL_SECTIONS,
    GLOSSARY: GLOSSARY,
    PILLAR_LABELS: PILLAR_LABELS,
    M2_TARGETS: M2_TARGETS,
    STATE_OPTIONS: STATE_OPTIONS,
    KIND_ICON: KIND_ICON,
    LIFECYCLE_STEPS: LIFECYCLE_STEPS,
    LAUNCH_STEPS: LAUNCH_STEPS,
    IAC_REASONS: IAC_REASONS,
    TEMPLATE_SNIPPET: TEMPLATE_SNIPPET,
    TRIGGER_TYPES: TRIGGER_TYPES,
    TRIGGER_PATTERNS: TRIGGER_PATTERNS,
    M11_STEPS: M11_STEPS,
    M11_WARNINGS: M11_WARNINGS,
    H5_STEPS: H5_STEPS,
    H5_WARNINGS: H5_WARNINGS,
    H6_STEPS: H6_STEPS,
    H6_WARNINGS: H6_WARNINGS,
    CONTAIN_STEPS: CONTAIN_STEPS,
    TRIAGE_COLS: TRIAGE_COLS,
    COST_CUT_IDS: COST_CUT_IDS,
    COST_PROTECT_IDS: COST_PROTECT_IDS,
    DETECTION_OPS: DETECTION_OPS,
    REFS: REFS,
    QUIZ_FOCUS: QUIZ_FOCUS,
    BAY_REVIEW: BAY_REVIEW,
    BAYS: BAYS,
    PILLAR_COLOR: PILLAR_COLOR,
  };
})();
