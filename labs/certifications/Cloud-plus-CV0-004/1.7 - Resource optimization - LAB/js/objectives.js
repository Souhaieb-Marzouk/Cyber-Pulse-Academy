/* ==========================================================================
   NIMBUS TOWER — js/objectives.js
   Clearance (objective) definitions + machine-checkable validation + the
   savings calculator. Ported 1:1 from src/lib/lab/objectives.ts: identical
   ids, pillars, coverage tags, hints, check predicates and pass/fail copy.
   ========================================================================== */
(function (root) {
  'use strict';

  var LAB = root.LAB;

  function f(env, id) {
    for (var i = 0; i < env.fleet.length; i++) if (env.fleet[i].id === id) return env.fleet[i];
    return null;
  }
  function s(env, id) {
    for (var i = 0; i < env.storage.length; i++) if (env.storage[i].id === id) return env.storage[i];
    return null;
  }
  function evIdx(env, e) { return env.events.indexOf(e); }

  function drillOk(env, list, kind) {
    return list.every(function (d) { return env.drills[kind][d.id] === d.answer; });
  }

  function schedOk(env, id) {
    var sc = f(env, id) && f(env, id).schedule;
    return !!sc && sc.enabled && sc.preset === 'weekdays' && sc.start === '08:00' && sc.end === '18:00';
  }

  /* ---------- MEDIUM (12 clearances — training shift) ---------- */
  LAB.MEDIUM_OBJECTIVES = [
    {
      id: 'OBJ-M1', mode: 'medium', pillar: 'P1', covers: ['C-6', 'C-7', 'C-8', 'C-10'],
      title: 'Calibrate the radio: core optimization vocabulary',
      task: 'In the BRIEFING channel, complete the Term Control drill: match right-sizing, metering, tagging and tiered storage to their definitions.',
      where: 'BRIEFING → Term Control drill',
      hints: [
        'All four definitions are echoed in the glossary panel below the drill.',
        'Metering is about measurement; tagging is about metadata; tiering is about data temperature.',
        'Correct mapping: Right-sizing=b, Metering=d, Tagging=a, Tiered storage=c.',
      ],
      check: function (env) { return drillOk(env, LAB.DRILL_TERMS, 'terms'); },
      pass: 'Vocabulary locked in. Every optimization decision starts from these four levers: measure (metering), attribute (tagging), resize (right-sizing), relocate (tiering).',
      fail: 'Not every term is matched to its correct definition yet — re-read the glossary and correct the highlighted selects.',
    },
    {
      id: 'OBJ-M2', mode: 'medium', pillar: 'P1', covers: ['C-9'],
      title: 'Flight classes: match billing models to workloads',
      task: 'Complete the Billing Board drill: assign pay-as-you-go, reserved, spot or dedicated host to each of the four workloads.',
      where: 'BRIEFING → Billing Board drill',
      hints: [
        'Ask two questions per card: how predictable is demand, and can it tolerate interruption?',
        'Per-socket licensing or hardware isolation is the dedicated-host tell.',
        'Correct: database=reserved, CI=spot, licensed app=dedicated host, variable frontend=pay-as-you-go.',
      ],
      check: function (env) { return drillOk(env, [{ id: 'w1', answer: 'reserved' }, { id: 'w2', answer: 'spot' }, { id: 'w3', answer: 'dedicated' }, { id: 'w4', answer: 'payg' }], 'billing'); },
      pass: 'Billing models assigned correctly. The rule of thumb: steady → reserve, interruptible → spot, license/compliance-bound → dedicated, unpredictable → on-demand.',
      fail: 'One or more workloads have the wrong billing class. Check the demand shape and interruption tolerance of each card again.',
    },
    {
      id: 'OBJ-M3', mode: 'medium', pillar: 'P1', covers: ['C-1', 'C-2', 'C-5'],
      title: 'Platform selection: VM, container, serverless or managed',
      task: 'Complete the Platform Board drill: choose the compute platform that optimizes each workload.',
      where: 'BRIEFING → Platform Board drill',
      hints: [
        'Event-driven millisecond jobs rarely justify a running host.',
        'A daily-deploying microservice fleet wants orchestration, not hand-built servers.',
        'Correct: thumbnails=serverless, microservices=containers+orchestration, GPU-driver monolith=VM, report DB=managed service.',
      ],
      check: function (env) { return drillOk(env, [{ id: 'p1', answer: 'serverless' }, { id: 'p2', answer: 'container' }, { id: 'p3', answer: 'vm' }, { id: 'p4', answer: 'managed' }], 'platform'); },
      pass: 'Platform mapping correct. Optimization starts before sizing: the wrong platform makes even perfect right-sizing expensive.',
      fail: 'Some workloads are on the wrong platform. Re-check which one needs kernel-level control, which needs orchestration, and which wants zero ops.',
    },
    {
      id: 'OBJ-M4', mode: 'medium', pillar: 'P2', covers: ['C-8', 'C-12', 'C-16'],
      title: 'Vector the oversized flight: flag and right-size WEB-02',
      task: 'On the strip rack, mark (classify) the clearest overprovisioned VM, then right-size it to the ladder size your evidence supports.',
      where: 'TOWER FLOOR → strip rack → WEB-02 → MANAGE',
      hints: [
        'Compare average vs peak utilization against provisioned vCPUs. WEB-02 peaks at 16% of 16 vCPU ≈ 2.6 vCPU of real demand.',
        'The headroom rule: after right-sizing, peak demand should land at 50–70% of the new size. 2.6 vCPU on a 4 vCPU host ≈ 64% — in band.',
        'Classify WEB-02 as "right-size" and change its size to sm-4 (4 vCPU). API-01 is memory pressure, not overprovisioning — do not pick it.',
      ],
      check: function (env) { return env.flags['web-02'] === 'rightsize' && !!(f(env, 'web-02') && f(env, 'web-02').sizeIdx === 1); },
      pass: 'WEB-02 re-vectored from 16 vCPU to 4 vCPU: projected −$444/mo with peak utilization landing at ~64%. That is right-sizing: evidence-driven, trend-aware, headroom-checked.',
      fail: 'WEB-02 must be classified "right-size" AND resized to sm-4 (4 vCPU). If you picked a different VM, re-read its note — API-01 is saturated on memory (scale-up case), NODE-01 is saturated outright (scale-out case).',
    },
    {
      id: 'OBJ-M5', mode: 'medium', pillar: 'P2', covers: ['C-14', 'C-7'],
      title: 'Ground the zombie: retire STAGING-01 safely',
      task: 'STAGING-01 has been idle for 45 days. Retire it in the safe order: tag it "decommission", take a snapshot, then decommission.',
      where: 'TOWER FLOOR → strip rack → STAGING-01 → MANAGE',
      hints: [
        'Decommissioning without a snapshot destroys the last restore point — sequence matters.',
        'Tagging first is what makes the action auditable and attributable later.',
        'Order: Tag=decommission → SNAPSHOT → DECOMMISSION.',
      ],
      check: function (env) {
        var t = evIdx(env, 'tag:staging-01:decommission');
        var sn = evIdx(env, 'snapshot:staging-01');
        var dc = evIdx(env, 'decommission:staging-01');
        return t > -1 && sn > t && dc > sn && !!(f(env, 'staging-01') && f(env, 'staging-01').status === 'decommissioned');
      },
      pass: 'Zombie grounded in safe order: tag → snapshot → decommission. That sequence preserves recovery evidence and leaves an audit trail — exactly the CV0-004 3.4 life-cycle discipline.',
      fail: 'The sequence is incomplete or out of order: tag "decommission" must come first, then snapshot, then decommission. PROD-CLONE-01 is NOT the zombie — its failover drill 6 days ago proves it is a live DR standby.',
    },
    {
      id: 'OBJ-M6', mode: 'medium', pillar: 'P2', covers: ['C-10', 'C-4', 'C-3'],
      title: 'Storage & network tuning: re-tier, re-IOPS, offload',
      task: 'In the Storage Bay: move backups-2022 to archive and enable its lifecycle policy; raise db-data-01 to 12,000 provisioned IOPS; enable CDN for static-assets.',
      where: 'TOWER FLOOR → Storage bay',
      hints: [
        'backups-2022 was last read 182 days ago — deep-cold class territory.',
        'db-data-01 shows 9.5k observed IOPS against 3k provisioned — that gap IS the latency alarm.',
        'Three edits: tier=archive + lifecycle on backups-2022; IOPS=12000 on db-data-01; CDN on static-assets.',
      ],
      check: function (env) {
        var b = s(env, 'backups-2022'); var d = s(env, 'db-data-01'); var st = s(env, 'static-assets');
        return !!b && b.tier === 'archive' && b.lifecycle && !!d && d.iopsProvisioned >= 12000 && !!st && st.cdn;
      },
      pass: 'Three optimization families in one pass: temperature-based re-tiering (cost), IOPS provisioning (performance), and CDN offload (latency + egress). Network spend should drop ~$180/mo.',
      fail: 'Required end-state: backups-2022 = archive + lifecycle ON; db-data-01 IOPS ≥ 12,000; static-assets CDN ON. Check each card in the Storage Bay again.',
    },
    {
      id: 'OBJ-M7', mode: 'medium', pillar: 'P2', covers: ['C-9'],
      title: 'Re-price the fleet: reserved for steady, spot for retryable',
      task: 'Change DB-01 to reserved resources and CI-RUNNER-01 to spot pricing on their strips.',
      where: 'TOWER FLOOR → strip rack → DB-01 / CI-RUNNER-01 → MANAGE',
      hints: [
        'DB-01: 24/7, <5% variance, no interruption tolerance → the commitment class.',
        'CI-RUNNER-01: retryable nightly builds → the interruptible class.',
        'Set billing=reserved on DB-01 and billing=spot on CI-RUNNER-01.',
      ],
      check: function (env) { return !!(f(env, 'db-01') && f(env, 'db-01').billing === 'reserved' && f(env, 'ci-runner-01') && f(env, 'ci-runner-01').billing === 'spot'); },
      pass: 'Re-pricing done: −$156/mo (reserved) and −$199/mo (spot) in simplified economics. Same workloads, same performance, materially lower bill — the cheapest optimization you will ever ship.',
      fail: 'DB-01 must be on reserved and CI-RUNNER-01 on spot. Never put an interruption-intolerant database on spot — check interruption tolerance before price.',
    },
    {
      id: 'OBJ-M8', mode: 'medium', pillar: 'P2', covers: ['C-13', 'C-15', 'C-16'],
      title: 'Advisor triage: confirm the real, dismiss the noise',
      task: 'In the Advisor queue, confirm or dismiss all six findings. Two involve reversed logic — read the evidence notes before judging.',
      where: 'TOWER FLOOR → Advisor queue',
      hints: [
        'A saturation signal (90% CPU) points the OPPOSITE way from a waste signal (6% CPU).',
        'Unexplained CPU burn on an unowned host is a security signal, not a cost item.',
        'Confirm F1, F2, F5 · dismiss F3, F4, F6.',
      ],
      check: function (env) {
        return env.triage['F1'] === 'confirm' && env.triage['F2'] === 'confirm' && env.triage['F5'] === 'confirm' &&
          env.triage['F3'] === 'dismiss' && env.triage['F4'] === 'dismiss' && env.triage['F6'] === 'dismiss';
      },
      pass: 'All six triaged correctly. You just practiced baseline reasoning: waste (low utilization), saturation (high), deviation (anomaly = security), and context (DR standby). That is CV0-004 4.6 thinking.',
      fail: 'Some verdicts are inverted. NODE-01 is saturated (scale out — not downsize), SRV-09 is a security anomaly (isolate — not re-price), PROD-CLONE-01 is a working DR standby.',
    },
    {
      id: 'OBJ-M9', mode: 'medium', pillar: 'P3', covers: ['C-6', 'C-7', 'C-13'],
      title: 'Spend scope: find the over-budget line',
      task: 'On the Spend Board, identify which service category is over budget and by roughly what percentage. Enter the service and the % over.',
      where: 'TOWER FLOOR → Spend board → answer fields',
      hints: [
        'Compare each category’s monthly spend to its budget line; the trend sparklines show which one is climbing.',
        'The untagged row in the cost-by-tag table hints at why snapshot churn is growing.',
        'Storage is over budget by (1180−850)/850 ≈ 38–39%.',
      ],
      check: function (env) { return env.spendAnswer.service === 'storage' && (env.spendAnswer.pct.trim() === '38' || env.spendAnswer.pct.trim() === '39'); },
      pass: 'Storage: $1,180 against an $850 budget (≈39% over). Metered spend plus tags is how that anomaly became visible — and why tagging every resource (including zombies) matters.',
      fail: 'Storage is the over-budget line, at roughly 38–39% over (1180 vs 850). Select "Storage" and enter 38 or 39.',
    },
    {
      id: 'OBJ-M10', mode: 'medium', pillar: 'P3', covers: ['C-13', 'C-8'],
      title: 'Set the tripwire: underutilization alert',
      task: 'In the Observability panel, configure the right-size tripwire: CPU threshold 10% over a 14-day window, then enable it.',
      where: 'TOWER FLOOR → Observability panel',
      hints: [
        'The threshold should sit just above "effectively idle" — 10% average CPU is the classic line.',
        'Two weeks of sustained data filters out batch jobs and month-end spikes.',
        'Threshold=10, window=14, enable the switch.',
      ],
      check: function (env) { return env.alerts.threshold === 10 && env.alerts.window === 14 && env.alerts.enabled; },
      pass: 'Tripwire armed: sustained ≤10% CPU for 14 days now raises a right-size candidate. This is detection engineering for cost — the same baseline logic as security alerting.',
      fail: 'Set threshold=10 (%), window=14 (days), and switch the alert ON. Shorter windows will fire on batch jobs; higher thresholds will hide real candidates.',
    },
    {
      id: 'OBJ-M11', mode: 'medium', pillar: 'P4', covers: ['C-11'],
      title: 'Departure board: schedule the sandboxes',
      task: 'Schedule DEV-01 and QA-01 to run weekdays 08:00–18:00 only (schedule preset "weekdays", start 08:00, end 18:00, enabled).',
      where: 'TOWER FLOOR → strip rack → DEV-01 / QA-01 → MANAGE → Schedule',
      hints: [
        'Nobody codes at 3am — 24/7 sandboxes are pure waste.',
        'Use the "weekdays" preset with start 08:00 / end 18:00.',
        'Apply to both DEV-01 and QA-01; do NOT schedule production hosts.',
      ],
      check: function (env) { return schedOk(env, 'dev-01') && schedOk(env, 'qa-01'); },
      pass: 'Scheduled scaling applied: −$235/mo in simplified economics for two sandboxes. Scheduled scale-down is the highest-certainty optimization in most estates — CV0-004 3.2 "Scheduled".',
      fail: 'Both DEV-01 and QA-01 need schedule: preset=weekdays, start=08:00, end=18:00, enabled. Leave production hosts unscheduled.',
    },
    {
      id: 'OBJ-M12', mode: 'medium', pillar: 'P4', covers: ['C-11', 'C-12'],
      title: 'Campaign config: elastic storefront for the spike',
      task: 'In the Scaling panel, configure the storefront group for the campaign: horizontal scaling, load-triggered policy, min 2 / max 8, CPU target 70%, pre-warm enabled.',
      where: 'TOWER FLOOR → Scaling panel',
      hints: [
        'A 5× burst cannot come from one bigger host — horizontal + triggered(load).',
        'Keep min at today’s steady state (2) so quiet hours stay cheap; max 8 covers the surge.',
        'Type=horizontal, policy=load, min=2, max=8, CPU target=70, pre-warm ON.',
      ],
      check: function (env) {
        var a = env.asg;
        return a.type === 'horizontal' && a.policy === 'load' && a.min === 2 && a.max === 8 && a.cpuTarget === 70 && a.preWarm;
      },
      pass: 'Elasticity configured: the storefront will breathe with demand instead of billing for a fixed 5× peak all year. Pre-warm gives the campaign a running start — burst without cold-start latency.',
      fail: 'The panel must read: horizontal · load-triggered · min 2 · max 8 · CPU target 70% · pre-warm ON. Vertical resizing cannot absorb a 5× burst, and manual scaling fails at 03:00.',
    },
  ];

  /* ---------- HARD (9 clearances — solo night shift) ---------- */
  var AUDIT_EXPECT = {
    'web-02': 'rightsize', 'node-01': 'scaleout', 'api-01': 'scaleup', 'staging-01': 'zombie', 'srv-09': 'security', 'prod-clone-01': 'keep',
  };

  LAB.HARD_OBJECTIVES = [
    {
      id: 'OBJ-H1', mode: 'hard', pillar: 'P2', covers: ['C-8', 'C-13', 'C-14', 'C-16'],
      title: 'Night audit: classify the fleet',
      task: 'Using strip evidence and the advisor queue, classify six contested flights: WEB-02, NODE-01, API-01, STAGING-01, SRV-09, PROD-CLONE-01 (right-size / scale-out / scale-up / zombie / security / keep).',
      hints: [
        'Waste points down (low utilization), saturation points out/up (high), deviation points sideways (anomaly).',
        'API-01 has healthy CPU but 91% memory — that is a scale-UP case, not right-sizing.',
        'WEB-02=rightsize · NODE-01=scaleout · API-01=scaleup · STAGING-01=zombie · SRV-09=security · PROD-CLONE-01=keep.',
      ],
      check: function (env) {
        return Object.keys(AUDIT_EXPECT).every(function (id) { return env.flags[id] === AUDIT_EXPECT[id]; });
      },
      pass: 'Clean audit. Six evidence patterns, six different dispositions — the core night-shift skill: reading utilization direction before touching anything.',
      fail: 'Some classifications are wrong. Remember: WEB-02 (6% avg) right-size · NODE-01 (90% avg, throttling) scale-out · API-01 (91% mem) scale-up · STAGING-01 (45d idle) zombie · SRV-09 (03:00 spike, unowned) security · PROD-CLONE-01 (DR drill 6d ago) keep.',
    },
    {
      id: 'OBJ-H2', mode: 'hard', pillar: 'P1', covers: ['C-8', 'C-12'],
      title: 'Right-sizing math: exact size + defensible rule',
      task: 'Right-size WEB-02 to the exact ladder size that satisfies the headroom rule (peak demand at 50–70% of new capacity), and record the justification "headroom rule".',
      hints: [
        'Peak demand = 16% × 16 vCPU = 2.56 vCPU. Test each rung of the ladder.',
        'ng-2 → 128% (too hot). md-8 → 32% (paying for headroom nobody uses). sm-4 → 64% (in band).',
        'Resize WEB-02 to sm-4 and set justification = headroom rule.',
      ],
      check: function (env) { return !!(f(env, 'web-02') && f(env, 'web-02').sizeIdx === 1) && env.sizeJustification['web-02'] === 'headroom'; },
      pass: 'sm-4 with the headroom rule on record. One size larger would double cost for utilization of ~32% — "room for growth" is not evidence; a flat 30-day trend is.',
      fail: 'Rejected. sm-4 is the only rung landing in the 50–70% band (64%). md-8 is the classic near-miss — safe-looking, but it doubles cost against a flat trend and no growth signal.',
    },
    {
      id: 'OBJ-H3', mode: 'hard', pillar: 'P2', covers: ['C-10', 'C-4', 'C-6', 'C-7'],
      title: 'Storage plan: four datasets, four correct calls',
      task: 'backups-2022 → archive + lifecycle + retention tag "backup"; scratch-01 → warm tier; db-data-01 → 12,000 IOPS; media-vault → leave in cold. All four must be true simultaneously.',
      hints: [
        'media-vault has a 6-hour retrieval SLA — check what archive restores cost in time.',
        'scratch-01 is rewritten nightly and deleted: premium hot block pricing is waste, but archive would be slower than the next build.',
        'backups-2022: tier=archive, lifecycle ON, tag=backup · scratch-01: tier=warm · db-data-01: IOPS 12000 · media-vault: unchanged (cold).',
      ],
      check: function (env) {
        var b = s(env, 'backups-2022'); var sc = s(env, 'scratch-01'); var d = s(env, 'db-data-01'); var m = s(env, 'media-vault');
        return !!b && b.tier === 'archive' && b.lifecycle && b.retentionTag === 'backup' && !!sc && sc.tier === 'warm' && !!d && d.iopsProvisioned >= 12000 && !!m && m.tier === 'cold';
      },
      pass: 'Four storage calls, four different rules: access temperature (backups), re-write cadence (scratch), device saturation (IOPS), and retrieval SLA (media). Optimizing storage is per-dataset reasoning, never a bulk action.',
      fail: 'One or more calls miss the evidence. The trap is media-vault: archive saves ~3× but restores in 12–48 h against a 6-hour SLA. Scratch wants warm (not archive — builds need speed), backups want archive + lifecycle + tag.',
    },
    {
      id: 'OBJ-H4', mode: 'hard', pillar: 'P1', covers: ['C-1', 'C-2', 'C-5', 'C-9'],
      title: 'Strategy board: platform AND billing per workload',
      task: 'In the Briefing strategy board, set platform and billing for all four workloads: storefront API = container + payg; image jobs = serverless + payg; licensed legacy app = VM + dedicated; report DB = managed + reserved.',
      hints: [
        'Platform first: who needs kernel access, who needs orchestration, who wants zero ops?',
        'Then billing: which of these demands is steady enough to commit?',
        'API=container/payg · images=serverless/payg · legacy=vm/dedicated · DB=managed/reserved.',
      ],
      check: function (env) {
        var st = env.strategy;
        var want = {
          s1: { platform: 'container', billing: 'payg' }, s2: { platform: 'serverless', billing: 'payg' },
          s3: { platform: 'vm', billing: 'dedicated' }, s4: { platform: 'managed', billing: 'reserved' },
        };
        return Object.keys(want).every(function (k) {
          return st[k] && st[k].platform === want[k].platform && st[k].billing === want[k].billing;
        });
      },
      pass: 'Eight cells, all defensible: orchestration for the release train, consumption pricing for event work, hardware isolation for per-socket licenses, provider-operated + committed pricing for the steady DB. Platform choice and billing model compound.',
      fail: 'Some cells contradict the workload constraints. The legacy app cannot leave dedicated (per-socket licensing); the report DB is steady and ops-heavy → managed + reserved; event jobs should not run on reserved hosts.',
    },
    {
      id: 'OBJ-H5', mode: 'hard', pillar: 'P3', covers: ['C-6', 'C-13', 'C-7'],
      title: 'Root-cause the Storage anomaly',
      task: 'On the Spend Board, identify the over-budget service, pick the true cost driver, and stop the bleeding by enabling lifecycle on backups-2022.',
      hints: [
        'The trend sparkline for Storage accelerates mid-month. What started landing in the bucket around day 4? Read backups-2022’s note.',
        'STAGING-01 has been taking daily snapshots for 45 days — where do they land?',
        'Answer: service=Storage, cause=snapshot-sprawl, then lifecycle ON for backups-2022.',
      ],
      check: function (env) { return env.spendAnswer.service === 'storage' && env.spendCause === 'snapshot-sprawl' && !!(s(env, 'backups-2022') && s(env, 'backups-2022').lifecycle === true); },
      pass: 'Root-caused and contained: zombie snapshot churn → lifecycle policy. Cost anomalies are symptoms; the fix is always upstream (a policy or a zombie), not a bigger budget.',
      fail: 'The driver is snapshot-sprawl: 45 days of daily STAGING-01 snapshots accumulating in hot storage. Select service=Storage, cause=snapshot-sprawl, and enable lifecycle on backups-2022.',
    },
    {
      id: 'OBJ-H6', mode: 'hard', pillar: 'P3', covers: ['C-15', 'C-14', 'C-13'],
      title: 'Security-first sequence: the 03:00 host',
      task: 'SRV-09 burns 97% CPU at 03:00 with no owner. Isolate it FIRST, then tag it "quarantine". No cost action (resize/billing/decommission) may touch it before isolation.',
      hints: [
        'You cannot right-size your way out of a compromise — utilization changes after containment tell you the truth.',
        'Order of operations: ISOLATE → TAG(quarantine). Nothing else on SRV-09, ever.',
        'Press ISOLATE on the SRV-09 strip, then apply tag quarantine.',
      ],
      check: function (env) {
        var iso = evIdx(env, 'isolate:srv-09');
        var tag = evIdx(env, 'tag:srv-09:quarantine');
        if (iso < 0) return false;
        if (tag < 0 || tag < iso) return false;
        var before = env.events.slice(0, iso);
        for (var i = 0; i < before.length; i++) {
          var e = before[i];
          if (e.indexOf('size:srv-09') === 0 || e.indexOf('billing:srv-09') === 0 || e.indexOf('decommission:srv-09') === 0) return false;
        }
        if (env.events.indexOf('decommission:srv-09') > -1) return false;
        return !!(f(env, 'srv-09') && f(env, 'srv-09').isolated === true && f(env, 'srv-09').tags.indexOf('quarantine') > -1);
      },
      pass: 'Containment before economics. If this were cryptojacking (ATT&CK T1496), the post-isolation CPU would drop to zero — your confirmation. Decommissioning a compromised host destroys evidence and re-spawns on the next unowned idle box anyway.',
      fail: 'Sequence violated. ISOLATE must be the first action on SRV-09, followed by the quarantine tag. Right-sizing, re-billing or decommissioning before containment fails this clearance — and in a real estate would destroy the evidence.',
    },
    {
      id: 'OBJ-H7', mode: 'hard', pillar: 'P4', covers: ['C-11', 'C-12', 'C-3', 'C-9'],
      title: 'Campaign engineering: full burst design',
      task: 'Configure the burst end-to-end: scaling panel = horizontal · load · min 2 · max 8 · CPU target 70 · pre-warm ON · window 05:00; CI spot handling = checkpoint+re-queue; static-assets CDN = ON.',
      hints: [
        'Pre-warm must complete BEFORE the 08:00 campaign start — pick the window that leaves margin.',
        'Spot and CI are made for each other only if interruption is handled; what happens when a node vanishes mid-build?',
        'ASG: horizontal/load/2/8/70/preWarm ON/05:00 · CI handling=checkpoint-queue · CDN ON.',
      ],
      check: function (env) {
        var a = env.asg;
        return a.type === 'horizontal' && a.policy === 'load' && a.min === 2 && a.max === 8 && a.cpuTarget === 70 && a.preWarm && a.preWarmWindow === '05:00' && env.campaign.ciSpotHandling === 'checkpoint-queue' && !!(s(env, 'static-assets') && s(env, 'static-assets').cdn === true);
      },
      pass: 'Full burst design: schedule-triggered pre-warm, load-triggered elasticity, retry-safe spot CI, and CDN taking static load off the origin. Four CV0-004 3.2 levers working as one system.',
      fail: 'Missing or wrong parts. The near-misses: pre-warm at 07:00 leaves no margin for boot+health checks before 08:00; CI on spot without checkpoint/re-queue will fail builds mid-flight; without CDN the origin carries the surge.',
    },
    {
      id: 'OBJ-H8', mode: 'hard', pillar: 'P4', covers: ['C-12', 'C-13'],
      title: 'Resilience trade-offs: cut redundancy where it is waste',
      task: 'In the Resilience posture panel: turn OFF the dev/test cross-AZ replica, keep storefront multi-AZ ON and database multi-AZ ON.',
      hints: [
        'Redundancy is insurance — price it against what the tier actually loses when an AZ fails.',
        'Which of the three tiers has an SLA that justifies cross-AZ spend?',
        'devTestReplica=OFF · storefrontAz=ON · dbAz=ON.',
      ],
      check: function (env) { return env.resilience.devTestReplica === false && env.resilience.storefrontAz === true && env.resilience.dbAz === true; },
      pass: 'Resilience right-sized: revenue-bearing and data-bearing tiers keep cross-AZ cover; the sandbox tier loses a replica nobody would miss. Optimization never touches the tiers whose SLA is real.',
      fail: 'The prod switches must stay ON — removing storefront or database redundancy to save money converts an outage into a revenue incident. Only the dev/test replica is priced beyond its value.',
    },
    {
      id: 'OBJ-H9', mode: 'hard', pillar: 'P4', covers: ['C-6', 'C-8', 'C-9', 'C-10'],
      title: 'Capstone: bank $1,300/mo without breaking the SLA',
      task: 'Apply optimizations until the LIVE SAVINGS gauge reads ≥ $1,300/mo, while keeping: WEB-01, WEB-02, PROD-CLONE-01 running; ASG max ≥ 8; prod multi-AZ switches ON; the underutilization alert enabled.',
      hints: [
        'The pool available: right-size (444) + zombie (168) + reserved (~156) + spot (~199) + schedules (~235) + re-tier (~80) + scratch (~172) + CDN (180) − IOPS upgrade (96) ≈ $1,438.',
        'You cannot decommission your way to the target — the storefront and DR standby must stay up.',
        'Do the work in clearances H2–H8 and check the gauge; the constraint checklist in this card tells you what must remain intact.',
      ],
      check: function (env) {
        var fleetOk = ['web-01', 'web-02', 'prod-clone-01'].every(function (id) { return !!(f(env, id) && f(env, id).status === 'running'); });
        return LAB.computeSavingsPublic(env) >= 1300 && fleetOk && env.asg.max >= 8 && env.resilience.storefrontAz && env.resilience.dbAz && env.alerts.enabled;
      },
      pass: 'Target banked with the SLA intact. You just ran a full optimization cycle: meter → analyze → act across compute, storage, pricing, scheduling and network — and kept resilience where it pays.',
      fail: 'The gauge is under $1,300 or a constraint is broken. Check: WEB-01/WEB-02/PROD-CLONE-01 still running, ASG max ≥ 8, prod multi-AZ ON, alert enabled. Then re-visit H2–H8 work — the savings pool is exactly the sum of those actions.',
    },
  ];

  /* ---------- savings calculator: current state vs pristine baseline
     (simplified training economics; formula parity with the original) ---------- */
  LAB.computeSavingsPublic = function (env) {
    var total = 0;
    env.fleet.forEach(function (item) {
      var base = null;
      for (var i = 0; i < LAB.FLEET.length; i++) if (LAB.FLEET[i].id === item.id) { base = LAB.FLEET[i]; break; }
      if (!base) return;
      if (item.status === 'decommissioned') { total += base.cost; return; }
      if (item.status !== 'running') return;
      if (item.billing !== base.billing) {
        if (item.billing === 'reserved') total += base.cost * 0.38;
        else if (item.billing === 'spot') total += base.cost * 0.65;
        else if (item.billing === 'dedicated') total -= base.cost * 0.15;
      }
      if (item.schedule.enabled && item.schedule.preset === 'weekdays') total += base.cost * 0.7;
      if (item.sizeIdx !== base.sizeIdx) total += LAB.SIZE_LADDER[base.sizeIdx].cost - LAB.SIZE_LADDER[item.sizeIdx].cost;
    });
    env.storage.forEach(function (item) {
      var base = null;
      for (var j = 0; j < LAB.STORAGE.length; j++) if (LAB.STORAGE[j].id === item.id) { base = LAB.STORAGE[j]; break; }
      if (!base) return;
      if (item.tier !== base.tier) total += base.cost - LAB.storageCost(base, item.tier);
      if (item.cdn && !base.cdn) total += 180;
      if (item.iopsProvisioned !== base.iopsProvisioned && item.iopsProvisioned >= 12000) total -= 96;
    });
    return Math.round(total);
  };

  LAB.ALL_OBJECTIVES = LAB.MEDIUM_OBJECTIVES.concat(LAB.HARD_OBJECTIVES);
})(typeof window !== 'undefined' ? window : globalThis);
