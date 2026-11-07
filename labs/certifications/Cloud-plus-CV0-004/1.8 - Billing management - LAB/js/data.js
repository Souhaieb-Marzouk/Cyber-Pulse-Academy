/* ==========================================================================
   js/data.js — ALL lab content for "The Billing Audit Desk" (static port)
   --------------------------------------------------------------------------
   1:1 port of the original src/lib/lab/data.ts (content, wording, numbers and
   comments unchanged). Loaded first as a classic script: every constant below
   becomes available to the scripts that follow (objectives.js, quiz.js, ...).
   Everything here is FICTIONAL training data.
   ========================================================================== */

// Synthetic evidence data for the Billing Audit Desk lab.
// EVERYTHING HERE IS FICTIONAL TRAINING DATA: TrailGear Outfitters (fictional),
// SkyLoft Cloud (fictional provider), synthetic IPs/domains, marked sample records.
const DAYS = 31;
/** Scale a deterministic daily shape so it sums exactly to `total`. */
function scale(shape, total) {
    const sum = shape.reduce((a, b) => a + b, 0);
    if (sum === 0)
        return shape.map(() => 0);
    const k = total / sum;
    return shape.map((v) => Math.round(v * k * 100) / 100);
}
function flatDaily(total) {
    return scale(new Array(DAYS).fill(1), total);
}
const BILLING_PERIOD = 'October 1–31, 2026';
const ORG = 'TrailGear Outfitters, Inc.';
const PROVIDER = 'SkyLoft Cloud';
/* ------------------------------------------------------------------ */
/* Invoice                                                             */
/* ------------------------------------------------------------------ */
// GPU fleet: 12 nodes × $2.30/hr × 24 h × 30 days (up Oct 2 → Oct 31) = 19,872.00
const gpuDaily = scale(new Array(DAYS).fill(0).map((_, i) => (i < 1 ? 0 : 12 * 2.3 * 24)), 19872.0);
// Campaign fleet: 10 nodes × $1.46/hr × 24 h × 12 days (Oct 20–31) = 4,204.80
const campaignDaily = scale(new Array(DAYS).fill(0).map((_, i) => (i < 19 ? 0 : 10 * 1.46 * 24)), 4204.8);
// Egress: baseline 2,340 GB/mo + vault-sync export 46,900 GB on Oct 5–6
const egressBaselineDaily = (2340 * 0.09) / DAYS;
const egressDaily = scale(new Array(DAYS).fill(0).map((_, i) => i === 4 || i === 5 ? 46900 / 2 * 0.09 : egressBaselineDaily), 4431.6);
// Snapshots: orphaned since Aug 12 — flat daily billing (the Sep/Oct jump is the
// October billing-identity consolidation, see the invoice line note)
const snapDaily = flatDaily(1852.2);
const INVOICE = [
    {
        id: 'webapp',
        service: 'Compute — Prod Web/App Fleet',
        detail: '48 × c7.xlarge · always-on',
        metering: 'Instance-hours (per-second billing, 1 min minimum)',
        sep: 52139.52,
        oct: 52139.52,
        forecast: 52139.52,
        daily: flatDaily(52139.52),
        note: 'Steady production baseline, unchanged month over month. This is the fleet that defines "steady state" for commitment decisions.',
    },
    {
        id: 'campaign',
        service: 'Compute — Campaign Burst Fleet',
        detail: '10 × c7.xlarge · launched Oct 20',
        metering: 'Instance-hours',
        sep: 0,
        oct: 4204.8,
        forecast: 4000.0,
        daily: campaignDaily,
        note: 'Planned Q4 campaign infrastructure. The finance forecast included a $4,000 allowance for exactly this (Change Log, Oct 20). Actual came in $204.80 over the allowance.',
    },
    {
        id: 'gpu',
        service: 'Compute — GPU Fleet',
        detail: '12 × g7.4gpu · API-created Oct 2',
        metering: 'GPU instance-hours',
        sep: 0,
        oct: 19872.0,
        forecast: 0,
        daily: gpuDaily,
        note: 'No TrailGear project owns a GPU fleet. Created via API on Oct 2 with the CI runner key, no change ticket. Burn rate $662.40/day, 24/7. See Guardrail Metrics.',
    },
    {
        id: 'db',
        service: 'Managed Database — PostgreSQL (prod)',
        detail: 'db.r6.4xlarge · always-on',
        metering: 'Instance-hours + storage',
        sep: 4999.68,
        oct: 4999.68,
        forecast: 4999.68,
        daily: flatDaily(4999.68),
        note: 'Utilization (Inventory): p95 CPU 9%, p95 memory 22%. Four-times oversized for its workload.',
    },
    {
        id: 'object',
        service: 'Object Storage',
        detail: 'avg 37,200 GB-month',
        metering: 'GB-month stored',
        sep: 768.6,
        oct: 781.2,
        forecast: 781.0,
        daily: flatDaily(781.2),
        note: 'Catalog images and documents. Normal growth: +1.6% MoM.',
    },
    {
        id: 'snapshots',
        service: 'Snapshot Storage',
        detail: '88,200 GB-month (2,100 snapshots)',
        metering: 'GB-month stored',
        sep: 117.73,
        oct: 1852.2,
        forecast: 120.0,
        daily: snapDaily,
        note: 'September showed only the 134 snapshots (5,606 GB) already on this account; the remaining 1,966 orphaned snapshots (82,594 GB) consolidated onto this invoice in October. The "Meridian" project was deleted Aug 12 (CHG-4021) — the whole 2,100-snapshot set is orphaned, with no lifecycle rule.',
    },
    {
        id: 'egress',
        service: 'Data Transfer OUT (Egress)',
        detail: '49,240 GB out',
        metering: 'Per GB transferred out (tiered)',
        sep: 210.6,
        oct: 4431.6,
        forecast: 211.0,
        daily: egressDaily,
        note: 'Data OUT of the cloud is charged; data IN is free. The vault-sync backup job exported a 46.9 TB full backup cross-region on Oct 5–6 (Usage Report).',
    },
    {
        id: 'ingress',
        service: 'Data Transfer IN (Ingress)',
        detail: '3,900 GB in',
        metering: 'Not billed — $0.00',
        sep: 0,
        oct: 0,
        forecast: 0,
        daily: flatDaily(0),
        note: 'Metered but not billed. Compare with the egress line: same wire, opposite direction, opposite price. This asymmetry is a classic exam trap.',
    },
    {
        id: 'serverless',
        service: 'Serverless & API Requests',
        detail: '8.4 M invocations',
        metering: 'Per request + compute duration',
        sep: 301.8,
        oct: 318.4,
        forecast: 305.0,
        daily: flatDaily(318.4),
        note: 'Request-based metering. Normal variance.',
    },
    {
        id: 'devfleet',
        service: 'Compute — Dev/Test Fleet',
        detail: '20 × c7.large · weekday schedule',
        metering: 'Instance-hours',
        sep: 1764.0,
        oct: 1848.0,
        forecast: 1850.0,
        daily: flatDaily(1848.0),
        note: 'On-demand, scheduled off nights/weekends. No commitment possible yet — usage pattern too variable (Inventory). Includes the untagged hackathon resources (Tag Audit).',
    },
    {
        id: 'support',
        service: 'Support Plan — Business Tier',
        detail: '$60/day flat · upgraded Oct 22',
        metering: 'Flat monthly fee (not usage-metered)',
        sep: 580,
        oct: 1860.0,
        forecast: 580.0,
        daily: flatDaily(1860.0),
        note: 'Upgrade is legitimate (Change Log, Oct 22). BUT the invoice bills the Business tier for the full 31 days ($1,860) instead of the 10 days it was active ($600). Reconciliation catches this.',
    },
];
const INVOICE_TOTALS = {
    oct: INVOICE.reduce((a, l) => a + l.oct, 0),
    sep: INVOICE.reduce((a, l) => a + l.sep, 0),
    forecast: INVOICE.reduce((a, l) => a + l.forecast, 0),
};
/* ------------------------------------------------------------------ */
/* Pricing sheet (SkyLoft Cloud — synthetic, simplified)               */
/* ------------------------------------------------------------------ */
const PURCHASE_OPTIONS = [
    {
        id: 'A',
        name: 'Flex Rate',
        rate: 'c7.xlarge $1.460/hr',
        blurb: 'Pay per hour used, cancel any second. No commitment, highest rate.',
        finePrint: 'Billed per second with a 60-second minimum. Capacity always available.',
    },
    {
        id: 'B',
        name: 'Steady Commit (1-yr)',
        rate: 'c7.xlarge $0.876/hr (−40%)',
        blurb: 'Commit to one or three years for a specific instance family/size in a region.',
        finePrint: 'Billed whether the instance runs or not. Best for 24/7 steady workloads.',
    },
    {
        id: 'C',
        name: 'Reclaimable Pool',
        rate: 'c7.xlarge $0.438/hr (−70%)',
        blurb: 'Bid on spare capacity; SkyLoft may reclaim it with a 2-minute notice.',
        finePrint: 'Deep discount in exchange for interruption. For fault-tolerant, checkpointable jobs only.',
    },
    {
        id: 'D',
        name: 'Own-License Plan',
        rate: 'db engine $1.61/hr (license-included rate excluded)',
        blurb: 'Bring your own database licenses; pay infrastructure charges only.',
        finePrint: 'License-based billing — you keep existing vendor licenses and rent only the hardware.',
    },
    {
        id: 'E',
        name: 'Dedicated Host',
        rate: '$9.20/host-hour (whole physical server)',
        blurb: 'Rent an entire physical host for yourself and place your instances on it.',
        finePrint: 'Single-tenant. Billed for the whole host whether you fill it or not — used for licensing and compliance isolation.',
    },
];
const SIZE_TABLE = [
    { id: 'db.r6.4xlarge', family: 'db.r6', size: '4xlarge', spec: '16 vCPU · 128 GB RAM', hourly: 6.72 },
    { id: 'db.r6.2xlarge', family: 'db.r6', size: '2xlarge', spec: '8 vCPU · 64 GB RAM', hourly: 3.36 },
    { id: 'db.r6.xlarge', family: 'db.r6', size: 'xlarge', spec: '4 vCPU · 32 GB RAM', hourly: 1.68 },
    { id: 'c7.large', family: 'c7', size: 'large', spec: '2 vCPU · 4 GB RAM', hourly: 0.42 },
    { id: 'c7.xlarge', family: 'c7', size: 'xlarge', spec: '4 vCPU · 8 GB RAM', hourly: 1.46 },
    { id: 'c7.2xlarge', family: 'c7', size: '2xlarge', spec: '8 vCPU · 16 GB RAM', hourly: 2.92 },
    { id: 'g7.4gpu', family: 'g7', size: '4gpu', spec: '48 vCPU · 4 GPU · 256 GB RAM', hourly: 2.3 },
];
const RATE_NOTES = {
    objectStorage: 'Object storage: $0.021 per GB-month',
    egress: 'Data transfer OUT: $0.09 per GB (first 100 GB/mo free)',
    ingress: 'Data transfer IN: $0.00 — always free',
    snapshots: 'Snapshot storage: $0.021 per GB-month',
};
/* ------------------------------------------------------------------ */
/* Metering matcher                                                    */
/* ------------------------------------------------------------------ */
const METER_SERVICES = [
    { id: 'svc-compute', name: 'Virtual compute instances', hint: 'Billed for every hour a machine exists' },
    { id: 'svc-object', name: 'Object storage', hint: 'Billed by how much data you keep' },
    { id: 'svc-egress', name: 'Data transfer OUT', hint: 'Billed per unit leaving the cloud' },
    { id: 'svc-serverless', name: 'Serverless functions', hint: 'Billed per invocation' },
    { id: 'svc-support', name: 'Support plan', hint: 'A fixed subscription, not usage' },
];
const METER_UNITS = [
    { id: 'instance-hours', name: 'Instance-hours' },
    { id: 'gb-month', name: 'GB-month stored' },
    { id: 'per-gb-out', name: 'Per GB out' },
    { id: 'per-request', name: 'Per request' },
    { id: 'flat-monthly', name: 'Flat monthly fee' },
];
const METER_CORRECT = {
    'svc-compute': 'instance-hours',
    'svc-object': 'gb-month',
    'svc-egress': 'per-gb-out',
    'svc-serverless': 'per-request',
    'svc-support': 'flat-monthly',
};
/* ------------------------------------------------------------------ */
/* Usage report (detailed metering records)                            */
/* ------------------------------------------------------------------ */
const USAGE_ROWS = [
    { ts: 'Oct 05 01:02', resource: 'vault-sync job', meter: 'Data transfer OUT', qty: '23,450 GB', cost: '$2,110.50' },
    { ts: 'Oct 06 01:02', resource: 'vault-sync job', meter: 'Data transfer OUT', qty: '23,450 GB', cost: '$2,110.50' },
    { ts: 'Oct 01–31', resource: 'prod web/app fleet', meter: 'Instance-hours', qty: '35,712 hrs', cost: '$52,139.52' },
    { ts: 'Oct 20–31', resource: 'campaign burst fleet', meter: 'Instance-hours', qty: '2,880 hrs', cost: '$4,204.80' },
    { ts: 'Oct 02–31', resource: 'gpu fleet (API-created)', meter: 'GPU instance-hours', qty: '8,640 hrs', cost: '$19,872.00' },
    { ts: 'Oct 01–31', resource: 'prod-postgres-01', meter: 'Instance-hours', qty: '744 hrs', cost: '$4,999.68' },
    { ts: 'Oct 31', resource: 'snapshots (Meridian)', meter: 'GB-month stored', qty: '88,200 GB', cost: '$1,852.20' },
    { ts: 'Oct 10–13', resource: 'hack-01 … hack-10', meter: 'Instance-hours', qty: '960 hrs', cost: '$403.20' },
    { ts: 'Oct 31', resource: 'hack-bucket-01…03', meter: 'GB-month stored', qty: '1,400 GB', cost: '$29.40' },
    { ts: 'Oct 11', resource: 'hack-gpu-spot-01', meter: 'GPU instance-hours', qty: '16 hrs', cost: '$11.04' },
    { ts: 'Oct 01–31', resource: 'ingress (all services)', meter: 'Data transfer IN', qty: '3,900 GB', cost: '$0.00' },
];
/* ------------------------------------------------------------------ */
/* Tag audit                                                           */
/* ------------------------------------------------------------------ */
const TAG_AUDIT = [
    { id: 't1', resource: 'hack-01', type: 'c7.large instance', created: 'Oct 10', dept: '—', env: '—', octCost: 40.32 },
    { id: 't2', resource: 'hack-02', type: 'c7.large instance', created: 'Oct 10', dept: '—', env: '—', octCost: 40.32 },
    { id: 't3', resource: 'hack-03', type: 'c7.large instance', created: 'Oct 10', dept: '—', env: '—', octCost: 40.32 },
    { id: 't4', resource: 'hack-04', type: 'c7.large instance', created: 'Oct 10', dept: '—', env: '—', octCost: 40.32 },
    { id: 't5', resource: 'hack-05', type: 'c7.large instance', created: 'Oct 10', dept: '—', env: '—', octCost: 40.32 },
    { id: 't6', resource: 'hack-06', type: 'c7.large instance', created: 'Oct 10', dept: '—', env: '—', octCost: 40.32 },
    { id: 't7', resource: 'hack-07', type: 'c7.large instance', created: 'Oct 10', dept: '—', env: '—', octCost: 40.32 },
    { id: 't8', resource: 'hack-08', type: 'c7.large instance', created: 'Oct 11', dept: '—', env: '—', octCost: 40.32 },
    { id: 't9', resource: 'hack-09', type: 'c7.large instance', created: 'Oct 11', dept: '—', env: '—', octCost: 40.32 },
    { id: 't10', resource: 'hack-10', type: 'c7.large instance', created: 'Oct 11', dept: '—', env: '—', octCost: 40.32 },
    { id: 't11', resource: 'hack-bucket-01', type: 'object storage', created: 'Oct 11', dept: '—', env: '—', octCost: 9.8 },
    { id: 't12', resource: 'hack-bucket-02', type: 'object storage', created: 'Oct 11', dept: '—', env: '—', octCost: 9.8 },
    { id: 't13', resource: 'hack-bucket-03', type: 'object storage', created: 'Oct 12', dept: '—', env: '—', octCost: 9.8 },
    { id: 't14', resource: 'hack-gpu-spot-01', type: 'GPU (Reclaimable Pool)', created: 'Oct 11', dept: '—', env: '—', octCost: 11.04 },
];
const TAG_AUDIT_TOTAL = TAG_AUDIT.reduce((a, r) => a + r.octCost, 0); // 443.64 (403.20 + 29.40 + 11.04)
const UNTAGGED_TEAMS = [
    { id: '', name: '— select a team —' },
    { id: 'platform', name: 'Platform Engineering (R. Vance)' },
    { id: 'growth-lab', name: 'Growth Platform Lab (J. Ibarra)' },
    { id: 'finance', name: 'Finance Systems (M. Okafor)' },
    { id: 'security', name: 'Security Engineering (S. Chen)' },
];
/* ------------------------------------------------------------------ */
/* Change log                                                          */
/* ------------------------------------------------------------------ */
const CHANGE_LOG = [
    {
        date: 'Aug 12',
        ticket: 'CHG-4021',
        actor: 'Platform Engineering',
        text: 'Project "Meridian" decommissioned. Compute and databases deleted. NOTE: snapshot cleanup deferred — never scheduled.',
        tag: 'ops',
    },
    {
        date: 'Sep 30 21:14',
        ticket: 'no ticket',
        actor: 'unknown (API)',
        text: 'New API access key SKY-9F2… created for CI runner "skybuild-runner-02". Created outside the key-rotation process. Flagged by Security (S. Chen).',
        tag: 'security',
    },
    {
        date: 'Oct 02 02:11',
        ticket: 'no ticket',
        actor: 'CI runner key (API)',
        text: '12 × g7.4gpu instances created via API from a new source IP. No change ticket, no project code, no owner. Fleet running 24/7 since.',
        tag: 'security',
    },
    {
        date: 'Oct 05',
        ticket: 'CHG-4107',
        actor: 'Platform Engineering',
        text: 'vault-sync initial backup job deployed: full 46.9 TB export to cross-region "cold vault" per DR request. Incremental schedule to follow "later".',
        tag: 'ops',
    },
    {
        date: 'Oct 10 09:00',
        ticket: 'CHG-4112',
        actor: 'Growth Platform Lab',
        text: 'Hackathon begins. Team provisions scratch instances/buckets in the production account (no sandbox available). Resource naming: hack-*.',
        tag: 'experiment',
    },
    {
        date: 'Oct 13 18:00',
        ticket: 'CHG-4112',
        actor: 'Growth Platform Lab',
        text: 'Hackathon ends. Team told to clean up; resources left running "to judge the demos later". Nobody tagged anything.',
        tag: 'experiment',
    },
    {
        date: 'Oct 20',
        ticket: 'MKTG-889',
        actor: 'Marketing (approved)',
        text: 'Q4 campaign launch — burst fleet 10 × c7.xlarge goes live. Approved Oct 3; forecast allowance $4,000 recorded by Finance.',
        tag: 'marketing',
    },
    {
        date: 'Oct 22',
        ticket: 'FIN-220',
        actor: 'Finance (M. Okafor)',
        text: 'Support plan upgraded Developer → Business, effective immediately. Old Developer plan auto-cancels at transition (confirmed inactive Oct 22).',
        tag: 'finance',
    },
    {
        date: 'Nov 01',
        ticket: 'FIN-228',
        actor: 'CFO office (M. Okafor)',
        text: 'October invoice $92,307.40 vs forecast $64,986.20 (+42.0%). Cost Council convened. Finance directives issued: cap $75,000/mo, alert at 85%, anomaly rules, chargeback for experiments.',
        tag: 'finance',
    },
];
/* ------------------------------------------------------------------ */
/* Guardrail metrics (GPU fleet incident evidence)                     */
/* ------------------------------------------------------------------ */
const GUARDRAIL = [
    {
        label: 'GPU fleet CPU utilization',
        value: '99.8% sustained · 24/7 · no diurnal pattern',
        note: 'Legit workloads breathe with user traffic (a day/night cycle — the "diurnal" pattern). Flat, constant saturation is the signature of a workload nobody owns.',
        severity: 'high',
    },
    {
        label: 'Fleet creation method',
        value: 'API-only · CI runner key · new source IP',
        note: 'Created outside the change process. No ticket, no owner, no project code.',
        severity: 'high',
    },
    {
        label: 'Outbound connections',
        value: '3 unknown external compute endpoints (TLS, persistent)',
        note: 'Consistent with mining-pool endpoints (stratum is the mining-pool network protocol; matches analytic AN0744). No business reason for a "fleet with no owner" to talk to them.',
        severity: 'high',
    },
    {
        label: 'Access key SKY-9F2…',
        value: 'Minted Sep 30 21:14 outside rotation process',
        note: 'The credential that created the fleet. Compromised runner + standing key = unauthorized provision capability.',
        severity: 'high',
    },
    {
        label: 'TrailGear GPU usage history',
        value: 'Zero GPU instances in the previous 12 months',
        note: 'A brand-new service line with $0 baseline is exactly what a "new-line" anomaly rule exists to catch.',
        severity: 'med',
    },
];
/* ------------------------------------------------------------------ */
/* Finance directive memo (CFO)                                        */
/* ------------------------------------------------------------------ */
const CFO_MEMO = [
    'DIRECTIVE 1 — Budget: cap October-type months at $75,000. Alert must fire at 85% of cap — early enough to act before the ceiling, not after.',
    'DIRECTIVE 2 — Anomaly rules: (A) any service line with NO prior-month history that accrues more than $500 month-to-date alerts same-day — new lines start with a $0 baseline, so percentage rules cannot catch them; (B) any established line whose single-day cost exceeds its trailing 30-day daily average by more than 120% alerts same-day; evaluation runs daily.',
    'DIRECTIVE 3 — Routing: cost anomaly alerts must go to BOTH the FinOps channel and the Security channel — cost anomalies are a documented detection signal for resource hijacking (ATT&CK T1496).',
    'DIRECTIVE 4 — Chargeback: experiment work is charged back to the owning team (not just shown — billed). Tag policy: dept + env required on every resource, no exceptions.',
];
/* ------------------------------------------------------------------ */
/* Inventory (rightsizing evidence)                                    */
/* ------------------------------------------------------------------ */
const RSZ_CANDIDATES = [
    {
        id: 'prod-postgres-01',
        name: 'prod-postgres-01',
        current: 'db.r6.4xlarge — 16 vCPU / 128 GB',
        cpu: 'p95 CPU 9%',
        mem: 'p95 memory 22%',
        note: 'Peak traffic still fits in a quarter of the current footprint. Monthly $4,999.68 → $1,249.92 after downsize.',
    },
    {
        id: 'cache-memcached-01',
        name: 'cache-memcached-01',
        current: 'cache.r6.2xlarge — 8 vCPU / 64 GB',
        cpu: 'p95 CPU 12%',
        mem: 'p95 memory 91%',
        note: 'CPU is idle but memory is nearly full — this cache is MEMORY-bound. Downsizing would evict keys and slow every page. Keep the size.',
    },
    {
        id: 'build-runner-03',
        name: 'build-runner-03',
        current: 'c7.2xlarge — 8 vCPU / 16 GB',
        cpu: 'p95 CPU 0.2% for 30 days',
        mem: 'p95 memory 1.1%',
        note: 'Owner left in June; pipeline re-pointed to the new runners in September. Zero useful work for a month. Terminate.',
    },
];
/* ------------------------------------------------------------------ */
/* Fleets for the purchase plan (H3)                                   */
/* ------------------------------------------------------------------ */
const FLEETS = [
    {
        id: 'webapp',
        name: 'Prod Web/App fleet',
        shape: '48 × c7.xlarge · 24/7 · stable for 11 months',
        hint: 'Predictable round-the-clock load',
    },
    {
        id: 'campaign',
        name: 'Campaign burst fleet',
        shape: '10 × c7.xlarge · Oct 20–31 · jobs checkpointable',
        hint: 'Short-lived, interruption-tolerant render/resize jobs',
    },
    {
        id: 'dev',
        name: 'Dev/Test fleet',
        shape: '20 × c7.large · weekday schedule · no commitment possible',
        hint: 'Variable, schedulable, low priority',
    },
];
const FLEET_MODELS = [
    { id: 'reserved', name: 'Steady Commit (reserved)' },
    { id: 'spot', name: 'Reclaimable Pool (spot)' },
    { id: 'ondemand', name: 'Flex Rate (on-demand) + scheduling' },
];
const CAMPAIGN_JUSTIFICATIONS = [
    { id: 'steady', name: 'Load is flat and predictable — a commitment pays for itself' },
    { id: 'checkpoint-interruptible', name: 'Jobs checkpoint and resume, so 2-minute reclaims are acceptable for a −70% rate' },
    { id: 'no-commitment', name: 'Usage is too variable to commit; keep flexibility and schedule it off-hours' },
];
/* ------------------------------------------------------------------ */
/* Egress fix controls (H7) / CFO policy clauses (H8)                  */
/* ------------------------------------------------------------------ */
const EGRESS_CONTROLS = [
    { id: 'sameregion', label: 'Relocate the vault-sync target to same-region storage — cross-region egress drops to $0; copies stay inside SkyLoft' },
    { id: 'incremental', label: 'Switch to incremental backups after the one-time full — only changed blocks ever leave again' },
    { id: 'compress', label: 'Compress and deduplicate the export before transfer — fewer billed GB' },
    { id: 'nightschedule', label: 'Schedule the job for 02:00 instead of 01:00 — cheaper overnight rates' },
    { id: 'raisefilter', label: 'Accept the cost and raise the egress budget line to $5,000' },
];
const POLICY_CLAUSES = [
    { id: 'c1', label: 'Clause 1 — "Put the campaign burst fleet on a 1-year Steady Commit to save 40%."' },
    { id: 'c2', label: 'Clause 2 — "Delete all snapshots older than 7 days, including production database backups."' },
    { id: 'c3', label: 'Clause 3 — "Keep tagging optional for experiment work so teams can move fast."' },
    { id: 'c4', label: 'Clause 4 — "Set the budget alert at 85% of cap and review the ledger monthly."' },
];
/* ------------------------------------------------------------------ */
/* Incident response steps (H2)                                        */
/* ------------------------------------------------------------------ */
const RESPONSE_STEPS = [
    { id: 'revoke-key', label: 'Revoke and rotate the compromised CI runner API key (SKY-9F2…)' },
    { id: 'quarantine-runner', label: 'Quarantine the skybuild-runner-02 host for forensics' },
    { id: 'terminate-fleet', label: 'Terminate the unauthorized 12-node GPU fleet' },
    { id: 'guardrail-review', label: 'Enable spend guardrails and review IAM key standing for all runners' },
];
/* ------------------------------------------------------------------ */
/* Glossary                                                            */
/* ------------------------------------------------------------------ */
const GLOSSARY = [
    { term: 'Pay-as-you-go (on-demand)', def: 'Pay per metered unit (hour, GB, request) with zero commitment; most flexible, highest unit price.' },
    { term: 'Reserved capacity', def: 'Commit to 1–3 years for a specific size/family in exchange for a large discount; billed whether used or not.' },
    { term: 'Spot / reclaimable instance', def: 'Unused provider capacity sold at a deep discount that can be reclaimed on short notice — for interruptible work only.' },
    { term: 'Savings plan', def: 'Commit to a dollar amount of spend per hour instead of a specific instance; discount follows the money, not the machine.' },
    { term: 'BYOL (bring your own license)', def: 'License-based billing: reuse existing software licenses and pay only the infrastructure rate.' },
    { term: 'Resource metering', def: 'The provider counts every consumed unit (instance-hours, GB-month, GB out, requests) — the bill is metering × rate.' },
    { term: 'Measured service', def: 'NIST cloud characteristic: usage is automatically measured and billed transparently, so both sides can verify it.' },
    { term: 'Egress / ingress', def: 'Data leaving the cloud (egress) is billed; data entering (ingress) is free. Direction matters more than distance.' },
    { term: 'GB-month', def: 'Storage metering unit: roughly the average gigabytes kept during the month, billed at a per-GB-month rate.' },
    { term: 'Cost-allocation tag', def: 'A key:value label (dept, env, project…) attached to a resource so its costs can be attributed.' },
    { term: 'Chargeback', def: 'Financial model where costs are actually billed back to the owning team/department.' },
    { term: 'Showback', def: 'Financial model where costs are reported to owners for awareness without actually billing them.' },
    { term: 'Rightsizing', def: 'Matching instance size to observed utilization evidence — neither paying for idle headroom nor starving the workload.' },
    { term: 'Budget alert', def: 'A notification that fires when spend crosses a threshold set BELOW the hard cap, leaving time to act.' },
    { term: 'Cost anomaly', def: 'A statistically abnormal spend pattern. In the cloud it can be waste — or a security event such as cryptojacking (ATT&CK T1496.001).' },
];
/* ------------------------------------------------------------------ */
/* Mini-bars helpers                                                   */
/* ------------------------------------------------------------------ */
function lineById(id) {
    return INVOICE.find((l) => l.id === id);
}
function money(n) {
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
