/* ==========================================================================
   js/objectives.js — objective definitions + CHECK RESULTS validation engine
   --------------------------------------------------------------------------
   1:1 port of the original src/lib/lab/objectives.ts. Each objective carries
   its machine-checkable validate(env) rule, tiered hints and pass/fail
   feedback. Reads TAG_AUDIT_TOTAL / money from js/data.js (global scope).
   ========================================================================== */

// Objective definitions + machine-checkable validation rules.
// Medium: 11 granular guided objectives (Bloom: Understand/Apply)
// Hard:   9 broad multi-step challenges (Bloom: Analyze/Evaluate/Create)

function norm(s) {
    return s.trim().replace(/[,\s]/g, '').toLowerCase();
}
function numEq(s, target, tol = 0) {
    const n = Number(norm(s).replace('$', ''));
    return Number.isFinite(n) && Math.abs(n - target) <= tol;
}
function setEq(a, b) {
    if (a.length !== b.length)
        return false;
    const bs = new Set(b);
    return a.every((x) => bs.has(x));
}
const MEDIUM_OBJECTIVES = [
    {
        id: 'OBJ-M1',
        station: 'meters',
        pillar: 'P1',
        title: 'Classify each SkyLoft purchase option by its billing model.',
        context: 'Open the Pricing Sheet in the Evidence Drawer. Assign each of the five options to the billing model it represents (on-demand, reserved, spot, BYOL, dedicated host).',
        anchor: 'CV0-004 1.8 — Billing models (PAYG / reserved / spot / license-based)',
        hints: [
            'The fine print tells you the model: look for commitment, interruption, and "bring your own" language.',
            'Option A has no commitment → pay-as-you-go. Option B commits 1 year → reserved. Option C can be reclaimed → spot.',
            'Option D is license-based: you keep existing licenses and pay only the infrastructure rate → BYOL. Option E rents a whole physical server, single-tenant → dedicated host.',
        ],
        validate: (env) => env.modelClassification['A'] === 'ondemand' &&
            env.modelClassification['B'] === 'reserved' &&
            env.modelClassification['C'] === 'spot' &&
            env.modelClassification['D'] === 'byol' &&
            env.modelClassification['E'] === 'dedicatedhost',
        passFeedback: 'Correct. The rate ladder exists because commitment trades flexibility for price: on-demand is fully flexible at the highest rate, reserved trades a term commitment for ~40% off, spot trades interruption for ~70% off, BYOL moves the license cost out of the meter entirely, and a dedicated host rents the whole physical server whether you fill it or not. A defender picks per workload, not per account.',
        failFeedback: 'Not quite. Read each option\u2019s fine print: commitment → reserved; reclaimable on short notice → spot; pay-per-use, cancel anytime → on-demand; existing licenses carried over → BYOL; a whole single-tenant physical server, billed whether filled or not → dedicated host. Adjust the assignments and check again.',
    },
    {
        id: 'OBJ-M2',
        station: 'meters',
        pillar: 'P1',
        title: 'Match each service to the metering unit the provider bills it in.',
        context: 'In the Pricing Sheet, each line of the invoice is metered in a different unit. Match all five services to their metering units.',
        anchor: 'CV0-004 1.8 — Resource metering (instance-hours, GB-month, per-GB egress, per-request, flat fee)',
        hints: [
            'Compute bills for time machines exist; storage bills for data kept; transfer bills for data leaving.',
            'Serverless bills per invocation; support is a subscription, not usage — a flat fee.',
            'Egress is per GB OUT (see the invoice\u2019s ingress line: metered at $0.00 — direction changes the price).',
        ],
        validate: (env) => env.meterMatches['svc-compute'] === 'instance-hours' &&
            env.meterMatches['svc-object'] === 'gb-month' &&
            env.meterMatches['svc-egress'] === 'per-gb-out' &&
            env.meterMatches['svc-serverless'] === 'per-request' &&
            env.meterMatches['svc-support'] === 'flat-monthly',
        passFeedback: 'Correct. The bill = metering × rate, so controlling cost starts with knowing WHAT is counted: time kept (instance-hours), data kept (GB-month), data leaving (per-GB out), invocations (per request) or a flat subscription. Every anomaly you chase later is one of these meters misbehaving.',
        failFeedback: 'Some meters are mismatched. Rules of thumb: machines → instance-hours; stored data → GB-month; data leaving → per-GB out; function runs → per request; support tiers → flat monthly fee. Fix and re-check.',
    },
    {
        id: 'OBJ-M3',
        station: 'invoice',
        pillar: 'P2',
        title: 'Flag every anomalous line on the October invoice.',
        context: 'Compare October vs September vs forecast on the ledger. FLAG the lines that are genuinely anomalous — leave the expected ones unflagged.',
        anchor: 'CV0-004 1.8 — managing billing considerations: invoice review',
        hints: [
            'An anomaly is a line that changed without a business reason. Two lines rose for planned reasons.',
            'The campaign fleet was approved with a $4,000 forecast allowance; the support upgrade was ordered by Finance.',
            'Exactly three lines lack any business justification: a GPU fleet nobody owns, a 15× snapshot jump, and a 21× egress jump.',
        ],
        validate: (env) => setEq(env.flagged, ['gpu', 'snapshots', 'egress']),
        passFeedback: 'Correct — exactly the three unjustified movers: GPU fleet (+$19,872, no owner), Snapshot Storage (+$1,732, deleted project) and Data Transfer OUT (+$4,221, surprise export). The campaign fleet and support upgrade also rose, but each had an approved reason — flagging expected movement is how alert fatigue starts.',
        failFeedback: 'Your flag set doesn\u2019t match the evidence. Exactly three lines moved without an approved reason. Check the Change Log before flagging "campaign" (approved, allowance existed) and "support" (ordered by Finance) — expected spikes must stay unflagged.',
    },
    {
        id: 'OBJ-M10',
        station: 'invoice',
        pillar: 'P2',
        title: 'Identify what caused the egress spike and state the metering rule it teaches.',
        context: 'Expand the Data Transfer OUT row and cross-reference the Usage Report and Change Log. Pick the true cause and the metering rule that explains the cost.',
        anchor: 'CV0-004 1.8 — Resource metering: egress vs ingress asymmetry',
        hints: [
            'The Usage Report has two huge transfer-out rows on Oct 5–6. What job ran those days?',
            'Change Log Oct 5: CHG-4107 deployed vault-sync — a 46.9 TB initial full backup.',
            'The rule: data OUT of the cloud is charged; data IN is free (the ingress line bills $0.00).',
        ],
        validate: (env) => env.egressCause === 'vaultsync' && env.egressRule === 'out-charged',
        passFeedback: 'Correct. The vault-sync initial full backup exported 46.9 TB cross-region. Metering 101: egress (out) is billed, ingress (in) is free — so the *direction* of data flow, not the volume alone, decided this bill. Defenders architect around it: same-region targets, incremental syncs, compression.',
        failFeedback: 'Not yet. The Usage Report shows 2 × 23,450 GB transfer-out on Oct 5–6, and the Change Log ties those nights to CHG-4107 (vault-sync full backup). The metering rule: egress is charged, ingress is free.',
    },
    {
        id: 'OBJ-M4',
        station: 'attribution',
        pillar: 'P2',
        title: 'Count the untagged resources and attribute them to the owning team.',
        context: 'Open the Tag Audit tab. Count every resource missing a dept tag, then use the Change Log to work out which team owns them.',
        anchor: 'CV0-004 1.8 — Tagging: cost-allocation tags and attribution',
        hints: [
            'The Tag Audit lists every resource with dept "—". How many rows is that?',
            'The resources are all named hack-*. Which Change Log entry created hack-* resources?',
            'Change Log Oct 10, CHG-4112: the Growth Platform Lab hackathon (J. Ibarra). Count: 14.',
        ],
        validate: (env) => numEq(env.untaggedCount, 14) && env.untaggedTeam === 'growth-lab',
        passFeedback: 'Correct: 14 untagged resources, created by the Growth Platform Lab hackathon (CHG-4112). Without tags this spend is invisible to chargeback — nobody can be shown, let alone billed. Attribution is what turns an anonymous line into an accountable owner.',
        failFeedback: 'Check the Tag Audit rows again (resources with dept "—") — the count is off, or the team is wrong. Every untagged resource is named hack-*, and the Change Log (CHG-4112, Oct 10) names the team that created them.',
    },
    {
        id: 'OBJ-M6',
        station: 'invoice',
        pillar: 'P2',
        title: 'Stamp each flagged spike TRUE ANOMALY or EXPECTED.',
        context: 'For the five spikes on the triage board, stamp each one using the evidence: a true anomaly is unjustified; an expected spike has an approved reason.',
        anchor: 'CV0-004 1.8 — billing anomaly triage; security signal (T1496)',
        hints: [
            'Three spikes have no approving ticket anywhere in the Change Log.',
            'MKTG-889 approved the campaign fleet; FIN-220 ordered the support upgrade — those two are EXPECTED.',
            'GPU fleet, snapshot backlog and the vault-sync export have no justification → TRUE ANOMALY.',
        ],
        validate: (env) => env.spikeVerdicts['gpu'] === 'anomaly' &&
            env.spikeVerdicts['snapshots'] === 'anomaly' &&
            env.spikeVerdicts['egress'] === 'anomaly' &&
            env.spikeVerdicts['campaign'] === 'expected' &&
            env.spikeVerdicts['support'] === 'expected',
        passFeedback: 'Correct triage: three true anomalies (GPU fleet, snapshots, egress) versus two expected spikes (approved campaign, ordered support upgrade). Separating signal from noise is the analyst\u2019s core skill — and remember the GPU anomaly is not just waste: an ownerless 24/7 fleet is a live security incident.',
        failFeedback: 'One or more stamps are wrong. Evidence rule: a spike is EXPECTED only if an approved ticket exists (MKTG-889 campaign, FIN-220 support). Everything else — GPU fleet, snapshot backlog, vault-sync export — is a TRUE ANOMALY.',
    },
    {
        id: 'OBJ-M5',
        station: 'controls',
        pillar: 'P3',
        title: 'Build the monthly budget and set the alert at the right threshold.',
        context: 'Finance directive: cap the month at $75,000, and alert early enough to act. Enter the cap, then compute the 85% alert threshold.',
        anchor: 'CV0-004 1.8 — budgets & billing alerts',
        hints: [
            'Directive 1 in the Finance Memo gives the cap in dollars.',
            '85% of the cap is the alert line. 75,000 × 0.85 = ?',
            'Cap = $75,000. Threshold = $63,750 — it fires before the ceiling, with runway to act.',
        ],
        validate: (env) => numEq(env.budgetCap, 75000) && numEq(env.budgetThreshold, 63750),
        passFeedback: 'Correct: cap $75,000 with the alert at $63,750 (85%). In October the $63,750 line would have been crossed on Oct 22 — nine days before month-end. An alert at 100% only announces a breach that already happened; the whole point of a threshold is runway.',
        failFeedback: 'The numbers must match the directive: cap $75,000; threshold = 85% of cap = $63,750. A threshold at or above the cap gives you zero reaction time — that is the mistake this rule exists to prevent.',
    },
    {
        id: 'OBJ-M7',
        station: 'remediation',
        pillar: 'P4',
        title: 'Right-size the oversized production database.',
        context: 'Inventory evidence: prod-postgres-01 runs db.r6.4xlarge at p95 CPU 9% / p95 memory 22%. Choose the target size from the Pricing Sheet.',
        anchor: 'CV0-004 1.8 — Rightsizing from utilization evidence',
        hints: [
            'p95 CPU 9% and p95 memory 22% mean peaks still fit a much smaller box.',
            'You need 4 vCPU / 32 GB at most — check the Size Table for the smallest size that still has headroom.',
            'db.r6.xlarge (4 vCPU / 32 GB, $1.68/hr) covers the peaks with room to spare → save $3,749.76/mo.',
        ],
        validate: (env) => env.dbSize === 'db.r6.xlarge',
        passFeedback: 'Correct: db.r6.xlarge keeps every p95 peak under 30% of the new capacity and saves $3,749.76/month (−75%). Rightsizing is evidence-driven: utilization percentiles — not gut feeling — pick the size, and p95 (not average) is what protects the peaks.',
        failFeedback: 'That size doesn\u2019t match the evidence. The workload peaks at 9% CPU / 22% memory of a 16-vCPU/128-GB box — a quarter of it (db.r6.xlarge, 4 vCPU/32 GB) still leaves headroom. Going smaller risks the peaks; staying leaves $3,750/mo on the table.',
    },
    {
        id: 'OBJ-M8',
        station: 'remediation',
        pillar: 'P4',
        title: 'Buy reserved capacity for the steady baseline — and only for it.',
        context: 'The prod web/app fleet (48 × c7.xlarge) has run 24/7 unchanged for 11 months. Enter the reserved count and the scope it applies to.',
        anchor: 'CV0-004 1.8 — Billing models: reserved for steady workloads',
        hints: [
            'Reserve exactly what runs 24/7 — no more.',
            'The steady baseline is the prod web/app fleet: 48 nodes.',
            'Count = 48, scope = prod web/app fleet only (never commit burst or dev fleets).',
        ],
        validate: (env) => numEq(env.reservedCount, 48) && env.reservedScope === 'webapp',
        passFeedback: 'Correct: 48 reserved covers the whole always-on baseline (−40% → saves $20,855.81/month), and committing ONLY the steady fleet avoids paying for idle burst/dev capacity. Over-committing is the classic reserved-instance trap: the discount is billed whether the instance runs or not.',
        failFeedback: 'Reserved units bill 24/7 whether used or not — so the count must match the always-on baseline exactly (48 × c7.xlarge), and the scope must be the prod web/app fleet only. Committing the campaign or dev fleets would buy idle time at a discount.',
    },
    {
        id: 'OBJ-M9',
        station: 'attribution',
        pillar: 'P4',
        title: 'Apply the tag policy to the untagged hackathon resources.',
        context: 'Finance directive 4: every resource carries dept + env. Apply the correct tags to the 14 hack-* resources.',
        anchor: 'CV0-004 1.8 — Tagging: tag policy enforcement (chargeback/showback)',
        hints: [
            'The Change Log names the owning team — its short name is the dept value.',
            'Hackathon scratch work is not production: env = sandbox.',
            'dept = growth-lab, env = sandbox — then apply to all 14.',
        ],
        validate: (env) => env.tagsApplied && env.tagDept === 'growth-lab' && env.tagEnv === 'sandbox',
        passFeedback: 'Correct: dept=growth-lab, env=sandbox on all 14. With tags in place, Finance can charge the spend back to the lab (directive 4) and future alerts attribute themselves automatically. Tags are the cheapest cost control in the cloud — but only if a policy makes them mandatory, not optional.',
        failFeedback: 'The tag values must come from the evidence: the Change Log (CHG-4112) names the Growth Platform Lab → dept "growth-lab"; hackathon scratch work is not production → env "sandbox". Set both, then apply.',
    },
    {
        id: 'OBJ-M11',
        station: 'remediation',
        pillar: 'P4',
        title: 'Stop the snapshot leak: clean up the backlog and prevent the next one.',
        context: 'The Meridian project died Aug 12 but its 2,100 snapshots (88,200 GB, $1,852.20/mo) are still billed. Delete the orphaned set and enable the lifecycle rule.',
        anchor: 'CV0-004 1.8 — Rightsizing/optimization: storage lifecycle, idle resources',
        hints: [
            'Two actions: remove what should not exist, and add the rule that keeps it from existing again.',
            'Delete the orphaned Meridian snapshot set (the project is gone — nothing restores to it).',
            'Enable the lifecycle policy: expire non-prod snapshots after 30 days, keep prod backups per retention policy.',
        ],
        validate: (env) => env.snapDeleted && env.snapLifecycle,
        passFeedback: 'Correct: the orphaned set is gone and the lifecycle rule now expires non-prod snapshots after 30 days — cost stops today AND stays stopped. Cleanup without a policy is temporary: the next deleted project would re-grow the same leak within a quarter.',
        failFeedback: 'Both halves are needed: delete the orphaned Meridian set (removes today\u2019s $1,852.20/mo) and enable the lifecycle policy (prevents tomorrow\u2019s). One without the other leaves the leak half-open.',
    },
    {
        id: 'OBJ-M12',
        station: 'invoice',
        pillar: 'P3',
        title: 'Prove the detection works: when would the new-line rule have fired on the GPU fleet?',
        context: 'Directive 2 (rule A): any service line with NO prior-month history accruing more than $500 month-to-date alerts same-day. Using the GPU row in the ledger above (created Oct 2, burn rate $662.40/day), stamp the first date the alert would have fired.',
        anchor: 'CV0-004 1.8 — billing alerts & cost-anomaly detection (the security signal)',
        hints: [
            'Rule A compares the NEW line\u2019s month-to-date spend against $500, evaluated same-day.',
            'The fleet was created Oct 2 and burns $662.40 every day — the first billing day already exceeds $500.',
            'First full day of billing = Oct 2: MTD $662.40 > $500 → the alert fires Oct 2.',
        ],
        validate: (env) => env.alertFireDate === 'oct2',
        passFeedback: 'Correct: Oct 2 — the fleet\u2019s first full day. MTD $662.40 crossed the $500 new-line trigger the same day the fleet appeared. That is the whole point of the absolute-dollar rule: the bill itself raised the alarm weeks before anyone opened the invoice — and routing it to Security (directive 3) turns that alarm into incident response.',
        failFeedback: 'Not yet. Rule A alerts same-day once a NEW line\u2019s month-to-date spend passes $500. The GPU fleet started Oct 2 and burns $662.40/day — so the very first billing day (Oct 2) is already over the trigger.',
    },
];
const HARD_OBJECTIVES = [
    {
        id: 'OBJ-H1',
        station: 'invoice',
        pillar: 'P2',
        title: 'Root-cause the +42% overrun: name the three biggest contributors and the total.',
        context: 'Finance demands the overrun decomposed. Using invoice vs forecast deltas, select the three biggest contributors and enter the total overrun.',
        anchor: 'CV0-004 1.8 — invoice reconciliation & forecasting',
        hints: [
            'Rank the lines by (October − forecast), not by size, and note which movers had approvals.',
            'GPU (+$19,872) dwarfs everything; then egress (+$4,220.60) and snapshots (+$1,732.20) — campaign and support were justified.',
            'Total overrun = $92,307.40 − $64,986.20 = $27,321.20.',
        ],
        validate: (env) => setEq(env.rootContribs, ['gpu', 'egress', 'snapshots']) && numEq(env.rootOverrun, 27321.2, 5),
        passFeedback: 'Correct decomposition: GPU fleet +$19,872.00, egress +$4,220.60, snapshots +$1,732.20 — total overrun $27,321.20 (+42.0%). Note the discipline: campaign (+$204.80) and support (+$1,280) also rose, but both trace to approved changes, so they are explained variance, not anomalies. Reconciliation = decomposing the delta, then evidencing each piece.',
        failFeedback: 'Rejected — near-miss. Contributors must be ranked by delta vs forecast AND lack an approving ticket: GPU +$19,872.00, egress +$4,220.60, snapshots +$1,732.20. Support (+$1,280) is 4th and justified (FIN-220); campaign (+$204.80) sits inside its $4,000 allowance. Total: $92,307.40 − $64,986.20 = $27,321.20.',
    },
    {
        id: 'OBJ-H2',
        station: 'attribution',
        pillar: 'P3',
        title: 'Identify the ATT&CK technique behind the GPU fleet and sequence the response.',
        context: 'Guardrail Metrics show an ownerless 24/7 fleet at 99.8% CPU talking to unknown compute endpoints, created by a key minted outside rotation. Enter the exact ATT&CK sub-technique ID, then order the four response actions.',
        anchor: 'MITRE T1496.001 Compute Hijacking; detection analytic AN0744',
        hints: [
            'This is resource hijacking for crypto mining — the compute sub-technique of T1496. ATT&CK IDs use the form T1496.001.',
            'Containment order: kill the capability (credential) first, preserve evidence second, remove the resources third, harden last.',
            'ID: T1496.001. Order: revoke key → quarantine runner → terminate fleet → guardrail review.',
        ],
        validate: (env) => norm(env.incidentId) === 't1496.001' &&
            setEq(env.responseOrder, ['revoke-key', 'quarantine-runner', 'terminate-fleet', 'guardrail-review']),
        passFeedback: 'Correct on both. T1496.001 (Compute Hijacking / cryptojacking): co-opted compute mines cryptocurrency — the attacker monetizes your metered surface, which is why the bill itself is the alarm (billing data is a documented detection source for T1496; analytic AN0744 pairs cost spikes with CPU + unknown endpoints). Response order matters: revoke the key first (stops NEW capability), quarantine the runner (preserve forensics), terminate the fleet (stop the bleed), then guardrails (prevent recurrence). MITRE\u2019s honest caveat: T1496 has no simple preventive control — detection plus response speed is the defense.',
        failFeedback: 'Rejected — near-miss. The ID must be the exact sub-technique T1496.001 (plain T1496 is the parent; the evidence pinpoints compute hijacking). Sequence must be: revoke key → quarantine runner → terminate fleet → guardrail review. Terminating first destroys evidence while the compromised key stays live.',
    },
    {
        id: 'OBJ-H3',
        station: 'remediation',
        pillar: 'P1',
        title: 'Design the purchase plan: assign a billing model to each fleet and justify the risky one.',
        context: 'Three fleets, three models, no waste allowed. Assign reserved / spot / on-demand+scheduling to the right fleet, then pick the justification that proves the campaign fleet choice.',
        anchor: 'CV0-004 1.8 — Billing models applied per workload shape',
        hints: [
            'Match model to workload shape: steady 24/7 → commitment; interruptible + checkpointable → spot; variable → flexible + scheduling.',
            'The campaign fleet renders/resize jobs that checkpoint — interruption is acceptable.',
            'webapp → reserved; campaign → spot; dev → on-demand + scheduling; justification = checkpoint-interruptible.',
        ],
        validate: (env) => env.fleetPlans['webapp'] === 'reserved' &&
            env.fleetPlans['campaign'] === 'spot' &&
            env.fleetPlans['dev'] === 'ondemand' &&
            env.fleetJust['campaign'] === 'checkpoint-interruptible',
        passFeedback: 'Correct plan: reserved for the 48-node steady baseline (−40%), spot for the checkpointable campaign jobs (−70%, ~$1,261 instead of $4,205 for the same hours), on-demand + scheduling for the dev fleet (no commitment possible). The justification is the part auditors care about: spot is only defensible where interruption cannot lose work — that is what "checkpointable" means.',
        failFeedback: 'Rejected — near-miss. Reserved on the campaign fleet bills 24/7 for a 12-day burst; spot on the dev fleet is wrong only if its jobs cannot resume — but the justification you picked must say WHY spot is safe for the campaign fleet: jobs checkpoint and resume, so 2-minute reclaims are acceptable. webapp → reserved, campaign → spot, dev → on-demand + scheduling.',
    },
    {
        id: 'OBJ-H4',
        station: 'remediation',
        pillar: 'P4',
        title: 'Rule on all three rightsizing candidates — including the one you must NOT shrink.',
        context: 'Three candidates, three different verdicts. For each: downsize, terminate, or keep — the trap is the cache.',
        anchor: 'CV0-004 1.8 — Rightsizing: utilization evidence, memory-bound workloads, idle resources',
        hints: [
            'Check WHICH resource is bound: the DB is CPU/memory-bloated, the cache is memory-full, the runner does nothing.',
            'A cache at 91% memory is sized by its working set — shrinking it evicts keys and slows every page.',
            'prod-postgres-01 → downsize to db.r6.xlarge; cache-memcached-01 → keep; build-runner-03 → terminate.',
        ],
        validate: (env) => env.rszActions['prod-postgres-01'] === 'downsize' &&
            env.rszActions['cache-memcached-01'] === 'keep' &&
            env.rszActions['build-runner-03'] === 'terminate',
        passFeedback: 'Correct on all three: the DB downsizes on CPU/memory evidence (−$3,749.76/mo), the cache STAYS because it is memory-bound (91% full — rightsizing means matching the binding resource, not shrinking whatever looks idle), and the zombie runner terminates (−$2,172.48/mo). Three verdicts from three different kinds of evidence — that is the skill.',
        failFeedback: 'Rejected — near-miss. The cache is the trap: p95 CPU 12% looks idle, but p95 memory 91% means the size is set by the working set; downsizing evicts keys site-wide. The DB (9%/22%) downsizes; the runner (0.2% CPU for 30 days, owner gone) terminates.',
    },
    {
        id: 'OBJ-H5',
        station: 'controls',
        pillar: 'P3',
        title: 'Engineer the anomaly detection: configure both rules, cadence and routing.',
        context: 'Build the detection that catches a repeat of October BEFORE the invoice: rule A for $0-baseline new lines, rule B for established lines, the evaluation cadence, and the routes.',
        anchor: 'CV0-004 1.8 — cost anomaly detection; MITRE T1496 billing signal',
        hints: [
            'Directive 2 in the Finance Memo specifies both thresholds; Directive 3 specifies routing.',
            'Why two rules? Percentage rules divide by a baseline — and the GPU fleet\u2019s baseline was $0.',
            'Rule A: new lines > $500 MTD. Rule B: >120% over trailing 30-day daily average. Daily. Routes: FinOps AND Security.',
        ],
        validate: (env) => env.alertRuleA &&
            numEq(env.alertAmtA, 500) &&
            env.alertRuleB &&
            numEq(env.alertPctB, 120) &&
            env.alertFreq === 'daily' &&
            env.alertRoutes.includes('finops') &&
            env.alertRoutes.includes('security'),
        passFeedback: 'Correct configuration. Rule A exists because percentage math breaks at a zero baseline — a brand-new GPU fleet shows ∞% growth on day one, so new lines need an absolute-dollar trigger ($500 MTD). Rule B catches established lines drifting (120% over the trailing 30-day daily average). Daily evaluation and dual routing (FinOps + Security) turn cost monitoring into a genuine detection control for resource hijacking (T1496) — the bill is often the first sensor that fires.',
        failFeedback: 'Rejected — near-miss. Required: rule A ON at >$500 MTD (new lines have a $0 baseline — percentage rules cannot fire on them), rule B ON at >120% vs trailing 30-day daily average, evaluation DAILY, and BOTH routes (FinOps + Security — directive 3, because cost anomalies are a security signal).',
    },
    {
        id: 'OBJ-H6',
        station: 'attribution',
        pillar: 'P2',
        title: 'Build the chargeback: total the hackathon spend and pick the billing model.',
        context: 'Sum the October cost of the 14 untagged hack-* resources from the Tag Audit, and apply Finance directive 4\u2019s financial model.',
        anchor: 'CV0-004 1.8 — Tagging: chargeback vs showback',
        hints: [
            'Add the three cost groups in the Tag Audit: instances, buckets, one GPU spot node.',
            '403.20 + 29.40 + 11.04 = ?',
            '$443.64 — and directive 4 says chargeback, not showback.',
        ],
        validate: (env) => numEq(env.chargebackAmount, 443.64, 2) && env.chargebackModel === 'chargeback',
        passFeedback: 'Correct: $443.64 charged back to the Growth Platform Lab. Chargeback (they are billed) changes behavior in a way showback (they are merely informed) usually does not — and that is exactly why directive 4 mandates it for experiments. Note the lever: none of this was visible until the tags existed.',
        failFeedback: 'Rejected — near-miss. Re-sum the Tag Audit rows: 10 instances $403.20 + 3 buckets $29.40 + 1 GPU spot node $11.04 = $443.64 (±2). And the model must be chargeback per directive 4 — showback only reports, it does not bill.',
    },
    {
        id: 'OBJ-H7',
        station: 'remediation',
        pillar: 'P4',
        title: 'Fix the egress leak: select only the controls that actually reduce billed GB.',
        context: 'The vault-sync job will keep exporting cross-region every night. From the five proposed controls, select exactly the ones that reduce billed egress — and only those.',
        anchor: 'CV0-004 1.8 — Resource metering: egress pricing mechanics; optimization',
        hints: [
            'Ask of each control: does it change HOW MANY GB are billed, or WHERE they bill at $0?',
            'Night scheduling does not change the per-GB price — egress has no "cheap hours".',
            'Correct set: same-region target, incremental-after-full, compression. Exactly three.',
        ],
        validate: (env) => setEq(env.egressControls, ['sameregion', 'incremental', 'compress']),
        passFeedback: 'Exactly the three that move billed GB: same-region target (cross-region egress → $0, copies stay in-region), incremental-after-full (only changed blocks ever leave again), compression (fewer billed GB for the same data). The two rejected controls fail the test: egress is priced per GB with no time-of-day discount, so 02:00 costs the same as 01:00; raising the budget line accepts the leak instead of fixing it.',
        failFeedback: 'Rejected — near-miss. The test is "does it reduce billed GB or move data to a $0 path?" Scheduling at 02:00 fails — egress price is per GB with no off-peak rate; raising the budget accepts the symptom. Correct set: same-region target + incremental backups + compression.',
    },
    {
        id: 'OBJ-H8',
        station: 'remediation',
        pillar: 'P4',
        title: 'Audit the CFO\u2019s cost policy: mark every flawed clause — and only those.',
        context: 'M. Okafor drafted four policy clauses. Some would cut cost; some would cause an outage or a blind spot. Mark all the flawed ones.',
        anchor: 'CV0-004 1.8 — optimization trade-offs: commitments, retention, tagging governance',
        hints: [
            'Test each clause against what you learned: commitments fit steady loads; retention protects RPO; tags enable chargeback.',
            'Clause 1 commits a 12-day burst fleet for a year. Clause 2 deletes PRODUCTION backups. Clause 3 re-opens the blind spot you just closed.',
            'Flawed: 1, 2, 3. Clause 4 is sound — exactly the budget pattern you built in M5.',
        ],
        validate: (env) => setEq(env.policyFlaws, ['c1', 'c2', 'c3']),
        passFeedback: 'Correct audit — three flaws, one sound clause. Clause 1 wastes money (a 12-day burst on a 1-year commitment bills idle capacity at a discount); Clause 2 breaks recovery objectives (prod database backups exist to meet the recovery point objective — RPO — retention is a DR decision, not a cost lever); Clause 3 re-opens the chargeback blind spot this whole audit just closed. Clause 4 is the sound one: alert at 85%, review monthly.',
        failFeedback: 'Rejected — near-miss. Flawed: Clause 1 (committing a short-lived burst fleet bills idle time), Clause 2 (deleting prod backups breaks restore/RPO — the orphaned Meridian snapshots were the problem, not retention itself), Clause 3 (optional tagging = no attribution). Clause 4 matches sound practice and must stay unmarked.',
    },
    {
        id: 'OBJ-H9',
        station: 'attribution',
        pillar: 'P2',
        title: 'Reconcile the support line: compute the disputed amount and name the basis.',
        context: 'The Business tier bills $60/day but was only active from Oct 22 (FIN-220). The invoice charged a full month. Enter the disputed amount and the reconciliation basis.',
        anchor: 'CV0-004 1.8 — invoice verification & reconciliation',
        hints: [
            'Days active: Oct 22–31 = 10 days. Expected charge = 10 × $60.',
            'Disputed = billed − expected.',
            '$1,860 − $600 = $1,260, disputed on the proration period.',
        ],
        validate: (env) => numEq(env.reconcileAmount, 1260, 2) && env.reconcileBasis === 'proration',
        passFeedback: 'Correct: $1,260 disputed on the proration period — $1,860 billed for 31 days vs $600 owed for the 10 days the tier was active (Oct 22–31, per FIN-220). This spike was legitimately *caused* by an upgrade (that is why triage stamped it EXPECTED) yet still *billed wrongly* — reconciliation is how you dispute the amount without disputing the change. Vendors do issue credits for exactly this.',
        failFeedback: 'Rejected — near-miss. Billed $1,860 (31 days × $60) but the tier went active Oct 22 (FIN-220) → expected $600 (10 days). Disputed amount = $1,260, basis = proration period. "Billing model error" would be wrong: the upgrade itself is legitimate, the charging period is not.',
    },
];
const OBJECTIVES = {
    medium: MEDIUM_OBJECTIVES,
    hard: HARD_OBJECTIVES,
};
const PILLAR_META = {
    P1: { name: 'Understand', short: 'P1' },
    P2: { name: 'Recognize / Analyze', short: 'P2' },
    P3: { name: 'Detect', short: 'P3' },
    P4: { name: 'Mitigate', short: 'P4' },
};
