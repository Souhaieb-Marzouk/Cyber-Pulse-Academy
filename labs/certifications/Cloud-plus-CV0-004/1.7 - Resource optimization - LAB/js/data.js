/* ==========================================================================
   NIMBUS TOWER — js/data.js
   ALL lab content, ported 1:1 from the original src/lib/lab/data.ts and the
   copy embedded in the original lab components. Fictional provider
   "NimbusGrid"; all hostnames, figures and events are invented for education;
   economics are SIMPLIFIED. No logic lives in this file.
   ========================================================================== */
(function (root) {
  'use strict';

  var LAB = (root.LAB = {});

  /* ---------- compute size ladder (CV0-004 1.10 rightsizing) ---------- */
  LAB.SIZE_LADDER = [
    { name: 'ng-2 (2 vCPU / 8 GB)', vcpu: 2, mem: 8, cost: 84 },
    { name: 'sm-4 (4 vCPU / 16 GB)', vcpu: 4, mem: 16, cost: 168 },
    { name: 'md-8 (8 vCPU / 32 GB)', vcpu: 8, mem: 32, cost: 306 },
    { name: 'lg-16 (16 vCPU / 64 GB)', vcpu: 16, mem: 64, cost: 612 },
    { name: 'xl-32 (32 vCPU / 128 GB)', vcpu: 32, mem: 128, cost: 1188 },
  ];

  var noSchedule = function () {
    return { enabled: false, preset: 'none', start: '08:00', end: '18:00' };
  };

  /* ---------- fleet manifest (12 strips) ---------- */
  LAB.FLEET = [
    { id: 'web-01', name: 'WEB-01', role: 'Storefront web A', cls: 'vm', sizeIdx: 2, billing: 'payg', cpuAvg: 62, cpuPeak: 84, memAvg: 71, cost: 306, tags: ['prod', 'storefront'], status: 'running', schedule: noSchedule(), note: 'Steady daytime traffic. Balanced at ~62% CPU — healthy.', snapshotted: false, isolated: false },
    { id: 'web-02', name: 'WEB-02', role: 'Storefront web B', cls: 'vm', sizeIdx: 3, billing: 'payg', cpuAvg: 6, cpuPeak: 16, memAvg: 15, cost: 612, tags: ['prod', 'storefront'], status: 'running', schedule: noSchedule(), note: 'Provisioned in 2019 for a migration that never grew into it. Flat 30-day trend. Peak demand = 2.6 vCPU.', snapshotted: false, isolated: false },
    { id: 'api-01', name: 'API-01', role: 'Order API', cls: 'vm', sizeIdx: 1, billing: 'payg', cpuAvg: 45, cpuPeak: 68, memAvg: 91, cost: 168, tags: ['prod', 'api'], status: 'running', schedule: noSchedule(), note: 'CPU healthy, memory 91% — pressure alerts during deploys.', snapshotted: false, isolated: false },
    { id: 'db-01', name: 'DB-01', role: 'Order database', cls: 'vm', sizeIdx: 2, billing: 'payg', cpuAvg: 45, cpuPeak: 60, memAvg: 68, cost: 410, tags: ['prod', 'database'], status: 'running', schedule: noSchedule(), note: '24/7 steady load; <5% variance month over month. Cannot tolerate interruption.', snapshotted: false, isolated: false },
    { id: 'ci-runner-01', name: 'CI-RUNNER-01', role: 'Build fleet', cls: 'vm', sizeIdx: 2, billing: 'payg', cpuAvg: 12, cpuPeak: 85, memAvg: 40, cost: 306, tags: ['ci'], status: 'running', schedule: noSchedule(), note: 'Nightly build window 02:00–04:00, then idle. Builds can be safely retried.', snapshotted: false, isolated: false },
    { id: 'dev-01', name: 'DEV-01', role: 'Dev sandbox', cls: 'vm', sizeIdx: 1, billing: 'payg', cpuAvg: 3, cpuPeak: 15, memAvg: 22, cost: 168, tags: ['dev'], status: 'running', schedule: noSchedule(), note: 'Developers work 08:00–18:00 weekdays. Currently runs 24/7.', snapshotted: false, isolated: false },
    { id: 'qa-01', name: 'QA-01', role: 'Test env', cls: 'vm', sizeIdx: 1, billing: 'payg', cpuAvg: 5, cpuPeak: 18, memAvg: 25, cost: 168, tags: ['qa'], status: 'running', schedule: noSchedule(), note: 'Test suites run on weekdays. Currently runs 24/7.', snapshotted: false, isolated: false },
    { id: 'staging-01', name: 'STAGING-01', role: 'Unknown staging', cls: 'vm', sizeIdx: 1, billing: 'payg', cpuAvg: 0.2, cpuPeak: 1, memAvg: 4, cost: 168, tags: [], status: 'running', schedule: noSchedule(), note: 'No login or deployment for 45 days. No tag, no owner on record.', snapshotted: false, isolated: false },
    { id: 'prod-clone-01', name: 'PROD-CLONE-01', role: 'Warm DR standby', cls: 'vm', sizeIdx: 2, billing: 'payg', cpuAvg: 2, cpuPeak: 30, memAvg: 12, cost: 306, tags: ['prod', 'dr'], status: 'running', schedule: noSchedule(), note: 'Hot standby clone of storefront. Failover drill ran 6 days ago (6h of activity).', snapshotted: false, isolated: false },
    { id: 'srv-09', name: 'SRV-09', role: 'legacy-cron (unowned)', cls: 'vm', sizeIdx: 0, billing: 'payg', cpuAvg: 92, cpuPeak: 97, memAvg: 55, cost: 58, tags: [], status: 'running', schedule: noSchedule(), note: 'No known owner. CPU pegs at 97% at 03:00 nightly; no business job is scheduled then. Deviates from every baseline.', snapshotted: false, isolated: false },
    { id: 'node-01', name: 'NODE-01', role: 'Container node (k8s)', cls: 'node', sizeIdx: 4, billing: 'payg', cpuAvg: 90, cpuPeak: 97, memAvg: 76, cost: 1188, tags: ['prod', 'k8s'], status: 'running', schedule: noSchedule(), note: 'Container node saturated; pods throttling. Sits in the storefront request path.', snapshotted: false, isolated: false },
    { id: 'cache-01', name: 'CACHE-01', role: 'Managed cache', cls: 'managed', sizeIdx: -1, billing: 'reserved', cpuAvg: 34, cpuPeak: 51, memAvg: 58, cost: 95, tags: ['prod'], status: 'running', schedule: noSchedule(), note: 'Provider-managed cache service. Hit rate 96% — doing its job.', snapshotted: false, isolated: false },
  ];

  /* ---------- storage registry (6 datasets) ---------- */
  var TIER_FACTORS = { hot: 1, warm: 0.6, cold: 0.35, archive: 0.17 };
  LAB.TIER_FACTORS = TIER_FACTORS;

  LAB.storageCost = function (item, tier) {
    return Math.round(((item.sizeGB / 1024) * (item.kind === 'block' ? 215 : 24) * (TIER_FACTORS[tier] != null ? TIER_FACTORS[tier] : 1)) * 10) / 10;
  };

  var mkStorage = function (a) {
    return Object.assign({}, a, { cost: LAB.storageCost(a, a.tier) });
  };

  LAB.STORAGE = [
    mkStorage({ id: 'backups-2022', kind: 'object', tier: 'hot', sizeGB: 4096, iopsProvisioned: 0, iopsObserved: 0, lastAccessDays: 182, lifecycle: false, retentionTag: null, note: 'Year-2022 backup archive. Untouched for 182 days, priced at hot-object rate. Daily snapshots from STAGING-01 land here too.', cdn: false }),
    mkStorage({ id: 'db-data-01', kind: 'block', tier: 'hot', sizeGB: 1024, iopsProvisioned: 3000, iopsObserved: 9500, lastAccessDays: 0, lifecycle: false, retentionTag: null, note: 'Database volume. Sustained 9.5k IOPS demand against 3k provisioned — latency alarms.', cdn: false }),
    mkStorage({ id: 'logs-app', kind: 'object', tier: 'warm', sizeGB: 800, iopsProvisioned: 0, iopsObserved: 0, lastAccessDays: 30, lifecycle: true, retentionTag: 'logs-90d', note: 'Application logs on a 90-day lifecycle policy. Correctly tiered.', cdn: false }),
    mkStorage({ id: 'static-assets', kind: 'object', tier: 'hot', sizeGB: 120, iopsProvisioned: 0, iopsObserved: 0, lastAccessDays: 0, lifecycle: false, retentionTag: null, note: 'Storefront images/JS served from origin only. Egress drives the Network line up.', cdn: false }),
    mkStorage({ id: 'scratch-01', kind: 'block', tier: 'hot', sizeGB: 2048, iopsProvisioned: 0, iopsObserved: 0, lastAccessDays: 0, lifecycle: false, retentionTag: null, note: 'CI scratch space: written at build time, deleted after. Priced at premium block rate.', cdn: false }),
    mkStorage({ id: 'media-vault', kind: 'object', tier: 'cold', sizeGB: 30720, iopsProvisioned: 0, iopsObserved: 0, lastAccessDays: 210, lifecycle: false, retentionTag: null, note: 'Product media master library. Retrieval SLA: any asset must be restorable within 6 hours.', cdn: false, retrievalHours: 6 }),
  ];

  /* ---------- spend board (6 categories, 14-day trends) ---------- */
  var spendTrend = function (base, drift, spike) {
    var out = [];
    for (var i = 0; i < 14; i++) {
      var v = base + drift * i + (spike && i >= spike.from ? spike.perDay * (i - spike.from + 1) : 0);
      out.push(Math.round(v * 10) / 10);
    }
    return out;
  };

  LAB.SPEND = [
    { id: 'compute', label: 'Compute', monthly: 3953, budget: 4100, trend: spendTrend(128, 1.2) },
    { id: 'storage', label: 'Storage', monthly: 1180, budget: 850, trend: spendTrend(52, 0.8, { from: 4, perDay: 6.5 }) },
    { id: 'database', label: 'Database', monthly: 410, budget: 450, trend: spendTrend(13.5, 0.05) },
    { id: 'network', label: 'Network / egress', monthly: 520, budget: 500, trend: spendTrend(16.5, 0.35) },
    { id: 'observability', label: 'Observability', monthly: 60, budget: 75, trend: spendTrend(2.0, 0.01) },
    { id: 'other', label: 'Other', monthly: 95, budget: 100, trend: spendTrend(3.3, 0.02) },
  ];

  /* ---------- advisor findings (queue copy — identical to the original
     component's inline list; 3 herrings: F3, F4, F6) ---------- */
  LAB.FINDINGS = [
    { id: 'F1', text: 'WEB-02: CPU averaging 6% (peak 16%) for 30 days on a 16 vCPU host.' },
    { id: 'F2', text: 'STAGING-01: no logins, deploys or traffic for 45 days.' },
    { id: 'F3', text: 'NODE-01: 90% CPU — recommendation: downsize node to save cost.' },
    { id: 'F4', text: 'SRV-09: untagged, unknown owner, 97% CPU nightly — recommendation: tag it and right-size it.' },
    { id: 'F5', text: 'backups-2022: 4 TB on hot-object pricing, last access 182 days ago.' },
    { id: 'F6', text: 'PROD-CLONE-01: 2% average CPU — recommendation: decommission.' },
  ];

  /* findings with verdicts/rationale (content parity with the original data.ts export) */
  LAB.FINDINGS_FULL = [
    { id: 'F1', text: 'WEB-02: CPU averaging 6% (peak 16%) for 30 days on a 16 vCPU host.', verdict: 'valid', why: 'Classic right-size candidate: sustained low utilization with flat trend.' },
    { id: 'F2', text: 'STAGING-01: no logins, deploys or traffic for 45 days.', verdict: 'valid', why: 'True zombie. Tag it, snapshot it, then decommission.' },
    { id: 'F3', text: 'NODE-01: 90% CPU — recommendation: downsize node to save cost.', verdict: 'herring', why: 'Reversed logic: the node is saturated, not idle. Downsizing worsens throttling; scale OUT or add capacity.' },
    { id: 'F4', text: 'SRV-09: untagged, unknown owner, 97% CPU nightly — recommendation: tag it and right-size it.', verdict: 'herring', why: 'Unexplained baseline deviation is a SECURITY signal (possible cryptojacking). Isolate and investigate first; never treat it as a cost item.' },
    { id: 'F5', text: 'backups-2022: 4 TB on hot-object pricing, last access 182 days ago.', verdict: 'valid', why: 'Re-tier to archive and attach a lifecycle policy.' },
    { id: 'F6', text: 'PROD-CLONE-01: 2% average CPU — recommendation: decommission.', verdict: 'herring', why: 'It is a warm DR standby: low average CPU is its job. A failover drill ran 6 days ago. Decommissioning breaks recovery capability.' },
  ];

  /* ---------- glossary (16 terms) ---------- */
  LAB.GLOSSARY = [
    { term: 'Right-sizing', def: 'Matching a resource’s provisioned capacity to its observed demand, so you neither overpay for idle headroom nor starve the workload.' },
    { term: 'Vertical scaling', def: 'Changing a single resource’s size (bigger or smaller). Also called scale up/down. Simple, but has a ceiling and usually needs a restart.' },
    { term: 'Horizontal scaling', def: 'Adding or removing whole instances behind a load balancer. Also called scale out/in. Enables elasticity and removes single-host ceilings.' },
    { term: 'Auto-scaling', def: 'Automated scaling driven by triggers (load, trend, event), schedules, or manual action.' },
    { term: 'Cloud bursting', def: 'Running a baseline load on steady capacity, then “bursting” overflow demand into extra (often on-demand or spot) capacity during peaks.' },
    { term: 'Pay-as-you-go', def: 'On-demand billing per hour/second used. Maximum flexibility, highest unit price.' },
    { term: 'Reserved resources', def: '1–3 year commitment on steady-state capacity in exchange for a large discount. Best for 24/7 predictable workloads.' },
    { term: 'Spot instance', def: 'Spare provider capacity auctioned at deep discounts, reclaimable at short notice. Only for interruptible, retryable work.' },
    { term: 'Dedicated host', def: 'A physical server reserved for one customer — for licensing that is per-socket/per-core or compliance isolation.' },
    { term: 'Resource metering', def: 'Continuous measurement of what each resource consumes (CPU, memory, IOPS, GB). The raw material of every optimization decision.' },
    { term: 'Tagging', def: 'Attaching key/value metadata (owner, env, cost-center) so spend can be allocated, governed and automated against.' },
    { term: 'Tiered storage', def: 'Matching data to storage classes by access temperature: hot (frequent), warm, cold, archive (rare; slow/costly retrieval).' },
    { term: 'IOPS', def: 'Input/output operations per second — the speed rating of block storage. Under-provisioning causes latency; over-provisioning wastes money.' },
    { term: 'Throughput vs latency', def: 'Throughput = data volume per second; latency = delay per request. CDN/caching cuts latency and egress; IOPS/bandwidth raise throughput.' },
    { term: 'Baseline', def: 'The normal utilization pattern of a system. Optimization and security both start by detecting deviation from it.' },
    { term: 'Zombie instance', def: 'A resource that serves no owner or purpose but keeps billing — the classic waste (and attack-surface) artifact.' },
  ];

  /* ---------- term control drill (clearance M1) ---------- */
  LAB.DRILL_TERMS = [
    {
      id: 'rs', term: 'Right-sizing',
      options: [
        { key: 'a', text: 'Attaching owner/cost-center metadata to resources' },
        { key: 'b', text: 'Matching provisioned capacity to observed demand' },
        { key: 'c', text: 'Moving data between hot/warm/cold/archive classes' },
        { key: 'd', text: 'Measuring CPU, memory and IOPS usage over time' },
      ],
      answer: 'b',
    },
    {
      id: 'metering', term: 'Resource metering',
      options: [
        { key: 'a', text: 'Bidding on spare provider capacity' },
        { key: 'b', text: 'Adding instances behind a load balancer' },
        { key: 'c', text: 'Committing to 1–3 years of capacity for a discount' },
        { key: 'd', text: 'Continuously measuring what each resource consumes' },
      ],
      answer: 'd',
    },
    {
      id: 'tagging', term: 'Tagging',
      options: [
        { key: 'a', text: 'Attaching key/value metadata for allocation and governance' },
        { key: 'b', text: 'Shrinking an instance to match low utilization' },
        { key: 'c', text: 'Serving content from edge locations' },
        { key: 'd', text: 'Stopping instances outside business hours' },
      ],
      answer: 'a',
    },
    {
      id: 'tiering', term: 'Tiered storage',
      options: [
        { key: 'a', text: 'Provisioning extra IOPS for a database volume' },
        { key: 'b', text: 'Reserving a physical server for licensing compliance' },
        { key: 'c', text: 'Placing data in hot/warm/cold/archive classes by access frequency' },
        { key: 'd', text: 'Running functions only when events occur' },
      ],
      answer: 'c',
    },
  ];

  /* ---------- billing board drill (clearance M2) ---------- */
  LAB.DRILL_BILLING = [
    { id: 'w1', workload: 'Order database', detail: 'Runs 24/7/365, load variance <5%, keeps running for the foreseeable future.' },
    { id: 'w2', workload: 'Nightly CI builds', detail: '2-hour burst at 02:00; jobs are retryable and interruption-tolerant.' },
    { id: 'w3', workload: 'Licensed legacy app', detail: 'Vendor licenses are billed per physical socket; compliance requires hardware isolation.' },
    { id: 'w4', workload: 'Startup web frontend', detail: 'Highly variable traffic, may be redesigned or killed next quarter.' },
  ];

  /* ---------- platform board drill (clearance M3) ---------- */
  LAB.DRILL_PLATFORM = [
    { id: 'p1', workload: 'Image thumbnail jobs', detail: 'Thousands of tiny event-driven jobs per hour, each <1s of work.' },
    { id: 'p2', workload: 'Microservice release train', detail: '20 small stateless services deploying daily, needing orchestration and autoscaling.' },
    { id: 'p3', workload: 'Legacy app with GPU driver', detail: 'Monolith requiring a specific kernel module and direct GPU pass-through.' },
    { id: 'p4', workload: 'Report database ops', detail: 'Team wants backups, patching and failover handled by the provider.' },
  ];

  /* ---------- hard strategy board workloads (clearance H4) ---------- */
  LAB.STRATEGY_WORKLOADS = [
    { id: 's1', workload: 'Storefront API', detail: 'Stateless microservices, spiky daily traffic, deploys daily via CI/CD. Latency-sensitive but horizontally elastic.' },
    { id: 's2', workload: 'Image-processing events', detail: 'Thousands of sub-second jobs triggered by uploads; queue-backed; retryable.' },
    { id: 's3', workload: 'Licensed legacy app', detail: 'Vendor licenses billed per physical socket; compliance requires hardware isolation; kernel module needed.' },
    { id: 's4', workload: 'Report database', detail: 'Steady 24/7 demand; the team wants backups, patching and failover handled by the provider.' },
  ];

  /* ---------- knowledge core levers (briefing channel) ---------- */
  LAB.LEVERS = [
    { title: 'Choose the platform', body: 'VM for full control, containers + orchestration for elastic microservices, serverless for event-driven spikes, managed services to delete ops burden.', lever: 'Drill: Platform Board' },
    { title: 'Right-size', body: 'Match provisioned capacity to metered demand. Headroom rule: after resize, peak demand should sit at ~50–70% of the new size.', lever: 'Strip rack → size' },
    { title: 'Pick the billing class', body: 'Pay-as-you-go for unpredictable demand, reserved for steady 24/7, spot for interruptible work, dedicated host for per-socket licensing/compliance.', lever: 'Strip rack → billing' },
    { title: 'Scale on purpose', body: 'Triggered (load/trend/event), scheduled or manual; horizontal adds hosts, vertical resizes them. Pre-warm scheduled peaks.', lever: 'Scaling panel' },
    { title: 'Tier the storage', body: 'Hot → warm → cold → archive by access temperature. Watch retrieval time SLAs; lifecycle policies move data automatically.', lever: 'Storage bay' },
    { title: 'Feed performance', body: 'Provision IOPS/throughput where devices saturate; offload static content to a CDN to cut latency and egress cost.', lever: 'Storage bay' },
    { title: 'Retire the dead', body: 'Zombies bill forever: tag → snapshot → decommission, in that order. Ephemeral data dies with the host; persistent data needs a restore point.', lever: 'Strip rack actions' },
    { title: 'Meter and tag', body: 'Metering shows WHAT changed; tagging shows WHOSE bill it lands on. Untagged spend is unoptimizable — and zombies hide in it.', lever: 'Spend board' },
  ];

  /* ---------- debrief field notes ---------- */
  LAB.DETECTION_TABLE = [
    ['Sustained low CPU (≤10% for 14d)', 'avg(cpu) < 10% over 14d AND trend flat', 'right-size candidate → ladder + headroom rule'],
    ['Memory pressure (>85% sustained)', 'avg(mem) > 85% over 7d, CPU healthy', 'vertical scale-up or containerize'],
    ['Device saturation (IOPS/throughput)', 'observed_iops > provisioned_iops for 1h', 'raise provisioning; then re-check price'],
    ['Storage budget anomaly', 'monthly spend > budget AND 14d trend rising', 'root-cause (snapshot churn?) → lifecycle policy'],
    ['Baseline deviation on unowned host', 'cpu > 90% outside business windows, no owner tag', 'SECURITY: isolate → tag quarantine → investigate'],
    ['High egress on static content', 'network line rising, origin cache-miss ratio high', 'CDN offload; then re-measure latency'],
  ];

  LAB.PLAYBOOK = [
    ['CV0-004 1.10 — optimize workloads', 'Right-size from metering; choose VM/container/serverless deliberately; orchestrate elastic tiers; CDN for latency; managed services to delete ops cost.'],
    ['CV0-004 1.8 — cost considerations', 'Match billing model to demand shape: reserved for steady, spot for interruptible, dedicated host only when licensing/compliance demands it.'],
    ['CV0-004 3.2 — scaling', 'Triggered (load/trend/event) for unpredictable bursts, scheduled for known cycles, manual for one-offs; horizontal by default, vertical when a single host is the constraint.'],
    ['CV0-004 3.4 — life cycle', 'Tag → snapshot → decommission, in that order. Ephemeral data dies with hosts; persistent data needs a restore point first.'],
    ['CV0-004 4.6 — monitor attacks', 'Zombie instances and cryptojacking show up as cost/perf anomalies: unexplained CPU outside baselines on unowned hosts = isolate, not optimize.'],
    ['CV0-004 1.4 — storage economics', 'Hot/warm/cold/archive by access temperature; archive only when retrieval time fits the SLA; lifecycle policies enforce it automatically.'],
  ];

  LAB.BLUE_TAKEAWAYS = [
    'Cost anomalies are security telemetry: treat unexplained utilization as an incident signal until proven otherwise.',
    'Hunt zombies on a schedule — they bill, drift out of patch scope, and become footholds.',
    'Tag everything; untagged resources are invisible to both FinOps <em>and</em> incident response.',
    'Keep the DR standby — but test it. A drill 6 days ago is the only proof idle capacity works.',
  ];

  LAB.RED_TAKEAWAYS = [
    'Idle, unowned, unmonitored compute is free infrastructure for an attacker — inventory is defense.',
    'Baselines protect you twice: waste shows as drift, compromise shows as deviation. Both are visible from the same console.',
    'Scheduled stop/start windows also cap the blast window of a hijacked sandbox host.',
  ];

  LAB.NEXT_STEPS = [
    'CV0-004 1.8 deep-dive: reserved vs savings plans and commitment ladders',
    'CV0-004 3.2 hands-on: build a real triggered + scheduled scaling policy',
    'FinOps Foundation: chargeback/showback, unit economics, anomaly alerts',
    'Provider advisor consoles: right-sizing and idle-detection reports',
  ];

  /* ---------- strip UI constants ---------- */
  LAB.AUDIT_LABELS = {
    rightsize: 'right-size candidate',
    scaleout: 'scale OUT (add capacity)',
    scaleup: 'scale UP (bigger size)',
    zombie: 'zombie — retire',
    security: 'security anomaly',
    keep: 'keep as-is',
  };

  LAB.BILLING_LABELS = { payg: 'pay-as-you-go', reserved: 'reserved', spot: 'spot', dedicated: 'dedicated host' };
  LAB.OPS_TAGS = ['decommission', 'quarantine'];
  LAB.JUSTIFY_OPTIONS = [
    { value: 'headroom', label: 'headroom rule (peak 50–70%)' },
    { value: 'growth-buffer', label: 'one size up — room to grow' },
    { value: 'status-quo', label: 'status quo — keep as-is' },
  ];
  LAB.SCHEDULE_STARTS = ['06:00', '07:00', '08:00', '09:00'];
  LAB.SCHEDULE_ENDS = ['16:00', '17:00', '18:00', '19:00'];

  /* ---------- quiz banks (R4/R5-audited: rotated answers, balanced lengths) ---------- */
  LAB.QUIZ = {
    medium: [
      {
        q: 'What is the primary goal of right-sizing?',
        topic: 'right-sizing',
        options: ['Keep every instance large to absorb demand spikes', 'Move workloads into a cheaper cloud region', 'Match provisioned capacity to the observed demand', 'Convert every virtual machine to serverless functions'],
        answer: 2,
        explain: 'Right-sizing uses metered utilization (CPU, memory, IOPS) to align capacity with real demand — cutting waste without starving the workload. Larger hosts, cheaper regions and platform swaps do not fix a size mismatch. CV0-004 1.10 lists Rightsizing as a core optimization method.',
      },
      {
        q: 'A steady 24/7 order database shows <5% load variance and will run indefinitely. Which billing model optimizes its cost?',
        topic: 'billing models',
        options: ['Reserved resources', 'Spot instances', 'Dedicated hosts', 'Pay-as-you-go'],
        answer: 0,
        explain: 'Steady, predictable, long-lived demand is exactly what 1–3 year reservations are priced for — the largest discount for the least risk. Spot would be reclaimed; dedicated hosts solve licensing/isolation, not price; on-demand is the premium default.',
      },
      {
        q: 'Nightly CI builds run 2 hours and tolerate interruption. Which billing model fits best?',
        topic: 'billing models',
        options: ['Reserved capacity', 'Dedicated hosts', 'On-demand billing', 'Spot instances'],
        answer: 3,
        explain: 'Spot capacity is deeply discounted and reclaimable — ideal for interruptible, retryable work like builds. Pair it with checkpoint/retry handling. Reserving 24/7 capacity for a 2-hour window wastes the other 22 hours.',
      },
      {
        q: 'What is the difference between horizontal and vertical scaling?',
        topic: 'scaling types',
        options: ['Vertical adds instances; horizontal resizes one host', 'Horizontal adds instances; vertical resizes one host', 'They are two names for the same process', 'Horizontal scaling only applies to database tiers'],
        answer: 1,
        explain: 'Scale OUT/IN = more/fewer instances behind a balancer (elastic, no host ceiling). Scale UP/DOWN = resize one host (simple, disruptive, capped). CV0-004 3.2.',
      },
      {
        q: 'A 4 TB backup dataset has not been read for 6 months and must be kept for compliance. Where does it belong?',
        topic: 'storage tiering',
        options: ['Hot block storage for instant restores', 'Warm file storage with weekly checks', 'Archive class with a lifecycle policy', 'Split evenly across hot and cold tiers'],
        answer: 2,
        explain: 'Rarely-accessed retention data belongs in archive: the cheapest class, with a lifecycle policy to move it automatically. The trade-off is retrieval time/cost — acceptable for compliance data.',
      },
      {
        q: 'An unowned, untagged host that idled for weeks suddenly pegs CPU at 97% every night at 03:00. What is the correct first read?',
        topic: 'security triage',
        options: ['A baseline deviation — triage security first', 'An overprovisioned host — queue a right-size', 'An idle host — schedule decommission now', 'A metering glitch — recalibrate and ignore'],
        answer: 0,
        explain: 'Baseline deviation on an unowned host is the signature of resource hijacking (cf. MITRE ATT&CK T1496, and CV0-004 4.6 “cryptojacking / zombie instances”). Right-sizing or retiring it would destroy the evidence; cost actions come only after security triage.',
      },
    ],
    hard: [
      {
        q: 'SCENARIO — In 2 weeks a campaign will drive 5× storefront demand for 10 days; checkout latency must stay <200 ms. The BEST optimization combo is:',
        topic: 'scaling & burst',
        options: ['Vertically resize both web hosts to maximum the day before', 'Schedule a pre-warm, scale horizontally on load, offload static assets', 'Move the storefront onto spot capacity and accept interruptions', 'Double the minimum capacity permanently for the entire year ahead'],
        answer: 1,
        explain: 'Burst = horizontal + triggered (load) scaling, pre-warmed on a schedule before the event, with static assets offloaded to a CDN to cut latency and egress. Permanent oversizing is waste; vertical resize has a ceiling and restarts; spot is not for latency-critical checkout.',
      },
      {
        q: 'SCENARIO — A spot CI node is reclaimed mid-build. Correctly engineered handling is:',
        topic: 'spot handling',
        options: ['Mark it failed and page the on-call', 'Move the CI fleet onto dedicated hosts', 'Disable auto-scaling to keep nodes alive', 'Checkpoint progress and re-queue the job elsewhere'],
        answer: 3,
        explain: 'Spot interruptions are expected events: the workload must checkpoint and re-queue. If it cannot tolerate interruption, that workload belongs on on-demand/reserved capacity — not the whole fleet, and paging humans for an expected event is alert fatigue.',
      },
      {
        q: 'SCENARIO — NODE-01 (container node, storefront path) runs at 90% CPU with throttled pods. An advisor suggests downsizing it to save cost. Why is that wrong?',
        topic: 'saturation vs waste',
        options: ['The node is saturated; scale out, not down', 'Containers cannot be resized on this cloud provider', 'Advisor findings about k8s are always wrong here', 'Downsizing is fine if the SLA is waived'],
        answer: 0,
        explain: 'High utilization is a saturation signal, not waste. Right-sizing cuts capacity on OVER-provisioned hosts; here you add capacity (scale out) so pods stop throttling. The container-resize claim and the waived-SLA idea both dodge the real issue: direction matters as much as the metric.',
      },
      {
        q: 'SCENARIO — An advisor flags PROD-CLONE-01 (2% avg CPU) for decommissioning. You know it failed over for a 6-hour drill 6 days ago. Correct action:',
        topic: 'DR & zombie judgment',
        options: ['Decommission it — 2% average is pure waste', 'Right-size it down to the smallest tier size', 'Keep it — warm standby is meant to idle', 'Stop it and restart when DR is needed'],
        answer: 2,
        explain: 'Warm standby capacity exists to idle cheaply until failover. Recent drill activity proves it works. The right optimization for DR is class of standby (hot/warm/cold), not deletion — and stopping it removes the warm-standby property entirely.',
      },
      {
        q: 'SCENARIO — media-vault (30 TB, cold) has not been read for 210 days. Archive class is 3× cheaper but restores take 12–48 h; the retrieval SLA is 6 h. Correct call:',
        topic: 'retrieval SLA',
        options: ['Archive it — the monthly savings outweigh slower restores', 'Move it to hot storage to be safe', 'Delete what was not accessed in six months', 'Keep it in cold; archive breaks the SLA'],
        answer: 3,
        explain: 'Optimization always negotiates with requirements: retrieval-time SLAs rule out archive regardless of savings. “Cheapest tier” is only correct when access-time requirements allow it — and deleting retention data is not optimization at all.',
      },
      {
        q: 'SCENARIO — db-data-01 shows sustained 9.5k IOPS demand against 3k provisioned IOPS and latency alarms. Correct optimization:',
        topic: 'IOPS & performance',
        options: ['Raise provisioned IOPS to cover observed demand', 'Downgrade the volume tier to save cost', 'Attach a lifecycle policy to the volume', 'Put a CDN in front of the database'],
        answer: 0,
        explain: 'Under-provisioned IOPS is a performance defect: raise provisioning to clear latency, then re-check utilization for cost. Lifecycle policies and CDNs solve data-placement problems, not block-device latency.',
      },
      {
        q: 'SCENARIO — SRV-09 (untagged, unowned) pegs CPU at 03:00 nightly. Rank the correct order of operations:',
        topic: 'security-first sequencing',
        options: ['Right-size first, then investigate to bank the savings', 'Just decommission it — unowned hosts are disposable anyway', 'Isolate first, tag quarantine, investigate; costs come last', 'Ignore it — nightly scheduled jobs are always legitimate'],
        answer: 2,
        explain: 'Security precedes cost. An unexplained baseline deviation on an unowned host is a potential resource-hijacking incident: isolate, tag (quarantine), investigate — only then decide economics. “Unowned” also means nobody can vouch for what decommissioning would break.',
      },
    ],
  };
})(typeof window !== 'undefined' ? window : globalThis);
