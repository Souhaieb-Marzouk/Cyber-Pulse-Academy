// ── Cloud Ward · lab content (DATA ONLY — no logic) ──────────────────────────
// Faithful 1:1 port of src/lib/lab/data.ts (all FICTIONAL / TRAINING DATA).
// Organization: Nimbus Cart (fictional e-commerce SaaS). Domains: *.nimbuscart.example
// IPs: RFC 5737 ranges. No real PII, no real telemetry.
// Strings may contain tiny bits of inline markup consumed by js/ui.js:
//   [tip]Term[/tip]  → glossary tooltip   ·   <em>/<strong>/<code> → pass through
(function (global) {
  'use strict';

  // ── Deterministic PRNG (same as original) so every visit renders identical data ──
  function mulberry32(seed) {
    return function () {
      let t = (seed += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function wave(n, base, jitter, seed, shape, spike) {
    shape = shape || function () { return 0; };
    const rnd = mulberry32(seed);
    const out = [];
    for (let i = 0; i < n; i++) {
      let v = base + (rnd() - 0.5) * 2 * jitter + shape(i);
      if (spike && i >= spike.from && i <= spike.to) v += spike.height;
      out.push(Math.max(0, Math.round(v * 10) / 10));
    }
    return out;
  }

  // Incident window: indexes 38..46 of a 48-point 24h series (≈ 09:00–10:00 on the final day).
  const INC = { from: 38, to: 46 };

  // ── Metric series (24 h, 30-min resolution) ──────────────────────────────────
  function checkoutP95(poolFix, batchFix, scaleFix) {
    let spikeH = 1800; // 610 → ~2410
    if (batchFix) spikeH = 120; // root-cause fix: 610 → ~730 (under 800 SLO)
    else if (poolFix) spikeH = 880; // stopgap: 610 → ~1490 (still breaching)
    else if (scaleFix) spikeH = 560; // scale only: ~1170 (still breaching)
    return {
      id: 'checkout_p95',
      label: 'Checkout p95 latency (edge)',
      unit: 'ms',
      color: '#B45309',
      data: wave(48, 590, 40, 11, function (i) { return i > 30 ? (i - 30) * 6 : 0; }, { from: INC.from, to: INC.to, height: spikeH }),
      baseline: [520, 700],
      incidentFrom: INC.from,
    };
  }

  const paymentP95 = {
    id: 'payment_p95',
    label: 'payment-svc · p95 latency',
    unit: 'ms',
    color: '#B91C1C',
    data: wave(48, 205, 18, 22, undefined, { from: INC.from, to: INC.to, height: 1720 }),
    baseline: [160, 260],
    incidentFrom: INC.from,
  };

  const gatewayCpu = {
    id: 'gateway_cpu',
    label: 'api-gateway · CPU',
    unit: '%',
    color: '#0E7C6B',
    data: wave(48, 41, 9, 33, function (i) { return i > 36 ? (i - 36) * 1.4 : 0; }, { from: INC.from, to: INC.to, height: 18 }),
    baseline: [28, 55],
  };

  const checkoutErrRate = {
    id: 'checkout_err',
    label: 'Checkout error rate (5xx)',
    unit: '%',
    color: '#B91C1C',
    data: wave(48, 0.3, 0.15, 44, undefined, { from: INC.from, to: INC.to, height: 2.1 }),
    baseline: [0, 0.7],
    incidentFrom: INC.from,
  };

  // Orders-db disk I/O — nightly 02:00 spike (benign scheduled backup), index 4 of each day block.
  const ordersDiskIO = (function () {
    const d = wave(48, 9, 3.5, 55);
    [4, 28].forEach(function (idx) {
      d[idx] = 92.4;
      d[idx + 1] = 71.2;
      d[idx + 2] = 22.8;
    });
    return {
      id: 'orders_diskio',
      label: 'orders-db · disk I/O',
      unit: 'MB/s',
      color: '#0E7C6B',
      data: d,
      baseline: [4, 16],
    };
  })();

  // Capacity trend: orders-db data volume, monthly growth ≈8% (12 points = 12 months).
  const capacityTrend = {
    id: 'capacity',
    label: 'orders-db data volume (monthly)',
    unit: 'TB',
    color: '#5C6B72',
    data: [0.62, 0.68, 0.73, 0.8, 0.86, 0.93, 1.01, 1.08, 1.14, 1.24, 1.34, 1.44],
  };

  const saleReqRate = {
    id: 'req_rate',
    label: 'Checkout requests',
    unit: 'req/min',
    color: '#5C6B72',
    data: wave(48, 620, 60, 77, undefined, { from: INC.from, to: INC.to, height: 80 }),
  };

  // ── Ward map (patients) ──────────────────────────────────────────────────────
  function wardPatients(fixed) {
    const p95AfterFix = function (base) {
      if (!fixed) return base;
      return base.map(function (v, i) {
        return i >= INC.from ? Math.round((610 + (v - 610) * 0.12) * 10) / 10 : v;
      });
    };
    const checkout = checkoutP95(false, fixed, false);
    return [
      {
        id: 'storefront-web',
        label: 'storefront-web',
        role: 'Edge web tier',
        status: 'watch',
        vitals: { cpu: 64, mem: 51, p95: 640, err: 0.2 },
        spark: p95AfterFix(wave(24, 600, 45, 101)),
        baseline: [500, 720],
        note: 'Elevated load from flash sale. Stable.',
      },
      {
        id: 'api-gateway',
        label: 'api-gateway',
        role: 'Request routing',
        status: 'watch',
        vitals: { cpu: 71, mem: 44, p95: 88, err: 0.1 },
        spark: wave(24, 80, 12, 102),
        baseline: [60, 100],
        note: 'Own processing latency normal; routes downstream latency.',
      },
      {
        id: 'cart-svc',
        label: 'cart-svc',
        role: 'Cart domain',
        status: 'stable',
        vitals: { cpu: 38, mem: 40, p95: 180, err: 0.1 },
        spark: wave(24, 170, 22, 103),
        baseline: [130, 215],
        note: 'Healthy. Cache hit ratio recovered after sale warm-up.',
      },
      {
        id: 'inventory-svc',
        label: 'inventory-svc',
        role: 'Stock reservation',
        status: 'watch',
        vitals: { cpu: 57, mem: 49, p95: 240, err: 0.4 },
        spark: wave(24, 205, 25, 104),
        baseline: [150, 250],
        note: 'Slightly elevated under sale load. Within baseline.',
      },
      {
        id: 'payment-svc',
        label: 'payment-svc',
        role: 'Payments · loyalty',
        status: 'critical',
        vitals: { cpu: 88, mem: 74, p95: fixed ? 690 : 1930, err: fixed ? 0.3 : 2.4 },
        spark: p95AfterFix(wave(24, 205, 18, 105, undefined, { from: 16, to: 23, height: fixed ? 380 : 1720 })),
        baseline: [160, 260],
        note: fixed
          ? 'Post-treatment: spans collapsed, latency back in band.'
          : 'Severe deviation from baseline. Slowest span of every checkout trace.',
      },
      {
        id: 'orders-db',
        label: 'orders-db',
        role: 'Primary datastore',
        status: 'watch',
        vitals: { cpu: 46, mem: 63, p95: 11, err: 0.0 },
        spark: wave(24, 9, 2, 106, undefined, { from: 4, to: 6, height: 80 }),
        baseline: [6, 14],
        note: 'Query latency normal. Nightly 02:00 disk spike = scheduled snapshot job.',
      },
      {
        id: 'cache-redis',
        label: 'cache-redis',
        role: 'Session & object cache',
        status: 'stable',
        vitals: { cpu: 34, mem: 58, p95: 2, err: 0.0 },
        spark: wave(24, 2, 0.6, 107),
        baseline: [1, 4],
        note: 'Hit ratio 84%. Eviction rate up during sale (expected).',
      },
      {
        id: 'marketing-tracker',
        label: 'marketing-tracker',
        role: 'Analytics sidecar',
        status: 'stable',
        vitals: { cpu: 22, mem: 31, p95: 12, err: 0.9 },
        spark: wave(24, 11, 3, 108),
        baseline: [6, 18],
        note: 'DEBUG logging flood. No user impact. Alert-noise source.',
      },
    ];
  }

  // ── Aggregated log stream ────────────────────────────────────────────────────
  const LOGS = [
    { id: 'l01', ts: '09:02:11', service: 'storefront-web', level: 'INFO', msg: 'Flash-sale campaign active — traffic +38% vs baseline', tag: 'deploy' },
    { id: 'l02', ts: '09:04:56', service: 'api-gateway', level: 'INFO', msg: 'route /checkout → cart-svc,inventory-svc,payment-svc (upstream ok)' },
    { id: 'l03', ts: '09:05:02', service: 'payment-svc', level: 'WARN', msg: 'db pool utilisation 90% (9/10 connections in use)' },
    { id: 'l04', ts: '09:06:07', service: 'payment-svc', level: 'ERROR', msg: 'Connection pool exhausted (10/10 in use), wait timeout 5000ms', fields: 'err_code=PAY-5033 trace=9f2ca71d44e08b31', tag: 'incident' },
    { id: 'l05', ts: '09:06:09', service: 'payment-svc', level: 'ERROR', msg: 'Connection pool exhausted (10/10 in use), wait timeout 5000ms', fields: 'err_code=PAY-5033 trace=9f2ca71d44e08b32', tag: 'incident' },
    { id: 'l06', ts: '09:06:31', service: 'api-gateway', level: 'ERROR', msg: 'upstream 504 gateway timeout payment-svc /charge', fields: 'upstream_status=504' },
    { id: 'l07', ts: '09:07:03', service: 'payment-svc', level: 'ERROR', msg: 'Connection pool exhausted (10/10 in use), wait timeout 5000ms', fields: 'err_code=PAY-5033 trace=9f2ca71d44e08b33', tag: 'incident' },
    { id: 'l08', ts: '09:07:40', service: 'payment-svc', level: 'WARN', msg: 'loyalty-points path: 47 sequential insert(s) per checkout request', tag: 'incident' },
    { id: 'l09', ts: '09:08:15', service: 'cache-redis', level: 'INFO', msg: 'evictions +310% during sale window (expected, TTL churn)' },
    { id: 'l10', ts: '09:09:44', service: 'marketing-tracker', level: 'DEBUG', msg: 'imp beam=home_hero variant=B view=1 sess=8f2a…', tag: 'noise' },
    { id: 'l11', ts: '09:09:45', service: 'marketing-tracker', level: 'DEBUG', msg: 'imp beam=home_hero variant=B view=2 sess=8f2a…', tag: 'noise' },
    { id: 'l12', ts: '09:09:46', service: 'marketing-tracker', level: 'DEBUG', msg: 'clk beam=cta_pill x=214 y=88 sess=8f2a…', tag: 'noise' },
    { id: 'l13', ts: '09:09:47', service: 'marketing-tracker', level: 'DEBUG', msg: 'imp beam=home_hero variant=B view=3 sess=91bc…', tag: 'noise' },
    { id: 'l14', ts: '09:09:48', service: 'marketing-tracker', level: 'DEBUG', msg: 'imp beam=coupon_strip variant=A view=1 sess=91bc…', tag: 'noise' },
    { id: 'l15', ts: '09:10:20', service: 'inventory-svc', level: 'WARN', msg: 'stock reservation retry x2 sku=NC-4482 (sale contention)', tag: 'noise' },
    { id: 'l16', ts: '09:11:02', service: 'api-gateway', level: 'ERROR', msg: 'upstream 504 gateway timeout payment-svc /charge', fields: 'upstream_status=504' },
    { id: 'l17', ts: '09:12:33', service: 'storefront-web', level: 'WARN', msg: 'client timeout spikes region=eu-west (checkout widget)', tag: 'incident' },
    { id: 'l18', ts: '09:13:08', service: 'orders-db', level: 'INFO', msg: 'long-running tx report: none > 2s. query p95 = 11ms' },
    { id: 'l19', ts: '09:14:51', service: 'payment-svc', level: 'ERROR', msg: 'Connection pool exhausted (10/10 in use), wait timeout 5000ms', fields: 'err_code=PAY-5033 trace=9f2ca71d44e08b34', tag: 'incident' },
    { id: 'l20', ts: '09:16:12', service: 'api-gateway', level: 'INFO', msg: 'autoscaler: payment-svc replicas 4 → 6 (cpu target 70%)', tag: 'deploy' },
    { id: 'l21', ts: '09:18:40', service: 'payment-svc', level: 'WARN', msg: 'db pool utilisation 100% (10/10) after scale-out — pool is per-instance', tag: 'incident' },
    { id: 'l22', ts: '09:21:19', service: 'cache-redis', level: 'INFO', msg: 'hit ratio 84% (min 80%) — recovered' },
    { id: 'l23', ts: '02:00:04', service: 'orders-db', level: 'INFO', msg: 'scheduled snapshot job started (change CHG-1187, nightly 02:00)', tag: 'backup' },
    { id: 'l24', ts: '02:07:41', service: 'orders-db', level: 'INFO', msg: 'snapshot job completed dur=7m31s size=918GB io=92MB/s peak', tag: 'backup' },
    { id: 'l25', ts: '08:59:59', service: 'api-gateway', level: 'INFO', msg: 'daily deploys complete: loyalty-points v2.4.1 (Fri), tracker SDK v0.9' },
  ];

  // ── Distributed trace (imaging suite) ────────────────────────────────────────
  const MAIN_TRACE = {
    id: '9f2ca71d44e08b31',
    name: 'POST /checkout · cart #88231 (customer session 8f2a…)',
    rootMs: 2400,
    status: 'degraded',
    spans: [
      { id: 's1', service: 'api-gateway', op: 'http.post /checkout (edge)', startMs: 0, durMs: 2400, depth: 0, self: 'gateway own processing only 88ms' },
      { id: 's2', service: 'cart-svc', op: 'getCart', startMs: 12, durMs: 178, depth: 1 },
      { id: 's3', service: 'inventory-svc', op: 'reserveStock', startMs: 200, durMs: 242, depth: 1, self: '2 retries under sale contention' },
      { id: 's4', service: 'payment-svc', op: 'charge', startMs: 452, durMs: 1930, depth: 1, self: 'SLOWEST SPAN — dominates the trace' },
      { id: 's5', service: 'payment-svc', op: 'db.acquireConn (pool wait)', startMs: 470, durMs: 140, depth: 2, self: 'waiting for a free connection' },
      { id: 's6', service: 'payment-svc', op: 'db.query INSERT loyalty_points', startMs: 620, durMs: 31, depth: 2, repeated: 47, self: 'one per cart item — N+1 pattern' },
      { id: 's7', service: 'orders-db', op: 'INSERT batch (final total)', startMs: 2320, durMs: 44, depth: 2 },
    ],
  };

  const HEALTHY_TRACE = {
    id: '9f2ca71d44e08bff',
    name: 'POST /checkout · same route, pre-sale baseline sample',
    rootMs: 604,
    status: 'ok',
    spans: [
      { id: 'h1', service: 'api-gateway', op: 'http.post /checkout (edge)', startMs: 0, durMs: 604, depth: 0 },
      { id: 'h2', service: 'cart-svc', op: 'getCart', startMs: 10, durMs: 165, depth: 1 },
      { id: 'h3', service: 'inventory-svc', op: 'reserveStock', startMs: 185, durMs: 230, depth: 1 },
      { id: 'h4', service: 'payment-svc', op: 'charge', startMs: 425, durMs: 168, depth: 1 },
      { id: 'h5', service: 'payment-svc', op: 'db.acquireConn (pool wait)', startMs: 440, durMs: 6, depth: 2 },
      { id: 'h6', service: 'orders-db', op: 'INSERT batch (final total)', startMs: 552, durMs: 41, depth: 2 },
    ],
  };

  // ── Triage boards ────────────────────────────────────────────────────────────
  const MEDIUM_ALERTS = [
    { id: 'ALR-201', sev: 'P1', title: 'Checkout p95 latency 2410 ms (> 800 ms SLO) sustained 8 min', detail: 'Primary SLO breach. Flash sale in progress, customers abandoning carts.', correct: 'acknowledge', startedMin: 12 },
    { id: 'ALR-202', sev: 'P1', title: 'Checkout p95 latency breach (secondary region rule)', detail: 'Same breach fired independently by the eu-west replica rule. Same root cause as ALR-201.', correct: 'merge', startedMin: 11 },
    { id: 'ALR-203', sev: 'P3', title: 'marketing-tracker error-rate flapping (every ~90 s)', detail: 'DEBUG flood triggers spurious error-rate alerts. Zero user impact. Candidate for tuning.', correct: 'suppress', startedMin: 46 },
    { id: 'ALR-204', sev: 'P2', title: 'payment-svc DB connection pool 10/10 during incident', detail: 'Pool exhaustion is part of the active incident chain. Needs the database on-call to assess pool sizing.', correct: 'escalate', startedMin: 10 },
    { id: 'ALR-205', sev: 'P4', title: 'orders-db disk I/O 92 MB/s nightly at 02:00 (recurring 14 nights)', detail: 'Matches change CHG-1187 scheduled snapshot job documented in the runbook. No deviation.', correct: 'close', startedMin: 640 },
    { id: 'ALR-206', sev: 'P3', title: 'cache-redis hit ratio dipped 79% for 2 min, self-recovered', detail: 'Transient dip during cache warm-up, recovered above 80% target. No action needed.', correct: 'close', startedMin: 52 },
  ];

  const HARD_ALERTS = [
    { id: 'A-301', sev: 'P1', title: 'Checkout p95 2410 ms (> 800 ms SLO) sustained 8 min', detail: 'Primary SLO breach. Active incident.', correct: 'acknowledge', startedMin: 12 },
    { id: 'A-302', sev: 'P1', title: 'Checkout p95 breach (secondary region rule)', detail: 'Duplicate of A-301 fired by the eu-west replica rule.', correct: 'merge', startedMin: 11 },
    { id: 'A-303', sev: 'P2', title: 'payment-svc DB connection pool 10/10', detail: 'Downstream of the same incident. DBA input required on pool sizing and the new loyalty path.', correct: 'escalate', startedMin: 10 },
    { id: 'A-304', sev: 'P3', title: 'marketing-tracker spurious error-rate alerts (flapping)', detail: 'DEBUG flood trips a mis-tuned static rule. No user impact.', correct: 'suppress', startedMin: 46 },
    { id: 'A-305', sev: 'P2', title: 'orders-db disk I/O 92 MB/s at 02:00 (nightly)', detail: 'Recurring for 14 nights, exactly matching change CHG-1187 scheduled snapshot window.', correct: 'close', startedMin: 640 },
    { id: 'A-306', sev: 'P3', title: 'AI-cost-optimizer: projected billing +18% this month', detail: 'Finance-domain alert routed into the operations queue by mistake. Not a performance signal.', correct: 'close', startedMin: 120 },
    { id: 'A-307', sev: 'P2', title: 'cache-redis eviction rate +310% during sale', detail: 'Real, secondary symptom of sale traffic. Needs watching while the main incident runs.', correct: 'acknowledge', startedMin: 9 },
    { id: 'A-308', sev: 'P4', title: 'inventory-svc WARN spam: deprecated API contract', detail: 'Non-actionable repeated warns from old SDK. No impact. Log-hygiene cleanup candidate.', correct: 'suppress', startedMin: 300 },
    { id: 'A-309', sev: 'P1', title: 'payment-svc 5xx cluster err_code=PAY-5033', detail: 'Same underlying incident as A-301 (pool exhaustion → gateway timeouts). Combine with primary.', correct: 'merge', startedMin: 10 },
    { id: 'A-310', sev: 'P4', title: 'api-gateway CPU 71% for 4 min, auto-resolved', detail: 'Autoscaler added replicas and CPU returned to 58%. Self-resolved.', correct: 'close', startedMin: 26 },
  ];

  // ── M1: monitoring vs observability classification ──────────────────────────
  const M1_ITEMS = [
    { id: 'm1a', text: 'Page the on-call engineer when CPU crosses 90% for 5 minutes.' },
    { id: 'm1b', text: 'Ask a brand-new question: which exact DB query made checkout slow today?' },
    { id: 'm1c', text: 'Watch a fixed dashboard of known health checks, chosen in advance.' },
    { id: 'm1d', text: 'Correlate a trace with logs and metrics to explain a failure nobody predicted.' },
    { id: 'm1e', text: 'Binary up/down service checks on a fixed schedule.' },
    { id: 'm1f', text: 'Explore high-cardinality raw events after a novel incident.' },
  ];

  // ── M2: pillar matching samples ──────────────────────────────────────────────
  const M2_ITEMS = [
    { id: 'm2a', text: 'cpu_pct = 92.4  @ 09:06:02  host=payment-svc', kind: 'gauge sample' },
    { id: 'm2b', text: 'checkout_p99_ms = 2600  window=5m', kind: 'percentile series point' },
    { id: 'm2c', text: '09:06:07 ERROR payment-svc PAY-5033 pool exhausted', kind: 'timestamped event record' },
    { id: 'm2d', text: 'span = payment-svc/charge  dur = 1930ms  trace = 9f2c…b31', kind: 'timed operation' },
  ];

  // ── H6: remediation sequencing cards ────────────────────────────────────────
  const H6_CARDS = [
    { id: 'h6a', text: 'Increase payment-svc DB pool limit as a stopgap (blunt the bleeding).', correct: true, step: 1 },
    { id: 'h6b', text: 'Deploy the query-batching hotfix for the loyalty-points path.', correct: true, step: 2 },
    { id: 'h6c', text: 'Inspect a fresh checkout trace — confirm db.query spans collapsed from 47.', correct: true, step: 3 },
    { id: 'h6d', text: 'Watch checkout p95 on the ward board until it holds under the 800 ms SLO.', correct: true, step: 4 },
    { id: 'h6e', text: 'Update the runbook with the N+1 signature, then merge & close the linked alerts.', correct: true, step: 5 },
    { id: 'h6f', text: 'Move orders-db to an instance with 4× CPU (no trace evidence it is the bottleneck).', correct: false, step: 0 },
    { id: 'h6g', text: 'Disable the checkout latency alert so paging stops during the sale.', correct: false, step: 0 },
    { id: 'h6h', text: 'Permanently remove the loyalty-points feature for all customers.', correct: false, step: 0 },
  ];

  // Deterministic display shuffle for the response sequencer (R6 / fixes-ledger QA-7):
  // stored order above groups the five correct cards first, so the UI renders from this
  // pre-shuffled, seed-fixed order instead. Correct cards sit at positions 1,3,5,7,8
  // with distractors interleaved; relative order of correct cards is scrambled.
  const H6_DISPLAY_ORDER = ['h6d', 'h6g', 'h6a', 'h6f', 'h6c', 'h6h', 'h6e', 'h6b'];

  // ── H5: config design board options ─────────────────────────────────────────
  const H5_WIDGETS = [
    { id: 'latency_p99', label: 'p99 latency gauge' },
    { id: 'error_rate', label: '5xx error-rate panel' },
    { id: 'req_rate', label: 'request-rate line' },
    { id: 'cpu_heatmap', label: 'CPU heat map' },
    { id: 'cost_meter', label: 'ingest cost meter' },
  ];

  // ── Glossary (C2 access + tooltips) ─────────────────────────────────────────
  const GLOSSARY = [
    { term: 'Observability', def: 'Ability to infer a system’s internal state from the telemetry (metrics, logs, traces) it emits — so you can answer questions you never anticipated.' },
    { term: 'Monitoring', def: 'Watching known indicators against known thresholds to detect anticipated failures. A subset of observability.' },
    { term: 'Metric', def: 'A numeric time-series measurement (CPU %, p95 latency, request rate) aggregated for trending, dashboards and alerting.' },
    { term: 'Log', def: 'A discrete, timestamped record of an event emitted by an application, service or platform.' },
    { term: 'Trace', def: 'An end-to-end record of one request’s journey across services, built from spans.' },
    { term: 'Span', def: 'One timed operation inside a trace — an HTTP call, a DB query — with start, duration and parent context.' },
    { term: 'Telemetry', def: 'The collected signals — metrics, logs, traces, events — shipped from systems to a backend.' },
    { term: 'Agent', def: 'Software installed on a host or sidecar that collects and ships telemetry to an aggregation platform.' },
    { term: 'Aggregation', def: 'Centralizing logs/telemetry from many sources into one searchable, correlated platform.' },
    { term: 'Retention', def: 'How long telemetry is kept, in which storage tier (hot/archive/cold), before deletion — balancing cost, trends and compliance.' },
    { term: 'Baseline', def: 'The historical normal range of a metric; deviations from it are the heart of anomaly detection.' },
    { term: 'Threshold', def: 'The value a metric must cross (for a duration) before an alert triggers.' },
    { term: 'Triage', def: 'Sorting alerts by severity and urgency, dispositioning each: acknowledge, escalate, merge, suppress or close.' },
    { term: 'SLO / error budget', def: 'A measurable reliability target (e.g. 99.9% uptime); the budget is how much shortfall you may spend per window.' },
    { term: 'p95 / p99', def: 'Latency percentiles: the value below which 95% / 99% of requests complete. Captures tail pain averages hide.' },
    { term: 'MTTD / MTTR', def: 'Mean Time To Detect / Mean Time To Respond-Recover — operational health KPIs of the alerting pipeline.' },
    { term: 'N+1 query', def: 'Anti-pattern where one logical operation issues 1 + N tiny queries; classic trace signature: repeated identical spans.' },
    { term: 'Cardinality', def: 'The number of unique label combinations on metrics/logs; high cardinality explodes cost and slows queries.' },
  ];

  // ── Knowledge check quizzes ─────────────────────────────────────────────────
  const QUIZ_MEDIUM = [
    {
      id: 'q1', topic: 'Monitoring vs observability', ref: 'Monitoring vs observability',
      prompt: 'A teammate says: “We already have monitoring dashboards — why invest in observability?” Best answer?',
      options: [
        'Monitoring and observability are identical; pick whichever vendors promote',
        'Observability replaces the need for logs and traces entirely',
        'Monitoring answers pre-decided questions; observability explains failures nobody predicted',
        'Observability is useful only for security and compliance teams',
      ],
      answer: 2,
      why: 'Monitoring watches known indicators against known thresholds — the questions are written in advance. Observability is the broader ability: interrogate metrics, logs and traces together to explain a failure nobody predicted. “Identical terms” is false — monitoring is a subset of observability. Logs and traces are observability’s raw material, not replaced by it, and it is first an operations discipline, not a security-only one.',
    },
    {
      id: 'q2', topic: 'The three pillars', ref: 'The pillars and how they interlock',
      prompt: 'Which statement about the three pillars of observability is correct?',
      options: [
        'Metrics are numeric series; logs are event records; traces follow requests',
        'Traces are numeric time series; logs are charts of errors',
        'Each service must commit to exactly one pillar to control cost',
        'Alerts are a fourth pillar that replaces the other three',
      ],
      answer: 0,
      why: 'Metrics = numeric aggregates, logs = discrete event records, traces = request-scoped span chains — that is the canonical split. The second option inverts the definitions; “one pillar per service” is a cost myth that breaks correlation; and alerting is a capability built on top of the signals, never a fourth pillar that replaces them.',
    },
    {
      id: 'q3', topic: 'Log retention policy', ref: 'Configuring the resources (exam objective 3.1)',
      prompt: 'Your team must set a retention policy for checkout logs. What is the best-practice balance?',
      options: [
        'Keep everything at DEBUG level for 5 years, to be safe',
        'Keep only the last 24 hours — nobody reads older logs',
        'Retention is fixed by the cloud provider and cannot be tuned',
        'Tier by value: hot for triage, archive for compliance, drop noise',
      ],
      answer: 3,
      why: 'Retention is a dial you set deliberately: recent data hot for fast triage, archival tiers for compliance and forensics, chatty low-value DEBUG dropped at the source. Five years of DEBUG explodes cost; 24 hours destroys forensic capability; and the provider supplies the tiers while the policy — and the obligation — stays yours (3.1 lists retention explicitly).',
    },
    {
      id: 'q4', topic: 'Tracing & correlation', ref: 'The pillars and how they interlock',
      prompt: 'Checkout is slow but each service’s own dashboard looks fine. Which telemetry finds the culprit fastest?',
      options: [
        'More CPU on the largest instance behind the route',
        'A distributed trace waterfall of one slow request',
        'Restarting services one by one until it recovers',
        'A larger chart of the average checkout latency',
      ],
      answer: 1,
      why: 'If every per-service dashboard looks healthy, the failure lives in the interaction between services — only a distributed trace follows one request across all of them and exposes the slow span (and N+1 repeats). Extra CPU is a guess; restart roulette hides symptoms; and an average chart is exactly the aggregate that hid the problem.',
    },
    {
      id: 'q5', topic: 'Alert tuning', ref: 'Configuring the resources (exam objective 3.1)',
      prompt: 'An alert pages 30+ times per night for a metric that briefly wobbles. Best fix?',
      options: [
        'Raise the alert severity to P1 so nobody ignores it',
        'Delete the metric and the alert rule entirely',
        'Require the condition to hold 5 minutes before paging',
        'Add more engineers to the on-call rotation',
      ],
      answer: 2,
      why: 'Flapping is cured with a duration window plus an honest severity: a real breach holds for minutes, a wobble does not. P1 makes fatigue worse, not better; deleting the metric blinds the ward; and more engineers share the pain without reducing the pages. This is alert tuning, a core 3.1 skill.',
    },
    {
      id: 'q6', topic: 'Baselines & deviation', ref: 'Baselines, anomalies and SLOs',
      prompt: 'What is the purpose of a metric baseline?',
      options: [
        'It defines the normal range, making deviations detectable as anomalies',
        'It is the maximum value the metric may ever reach',
        'It is the monthly price of the monitoring tool',
        'It guarantees that the service SLO is always met',
      ],
      answer: 0,
      why: 'A baseline is the historical normal band (often with daily/weekly seasonality); deviation from it is the core anomaly signal — for performance incidents and, per 4.6, for suspicious activity like cryptojacking CPU drift. A ceiling is a threshold, not a baseline; the tool’s price is irrelevant; and a baseline observes the SLO, it cannot guarantee it.',
    },
  ];

  const QUIZ_HARD = [
    {
      id: 'hq1', topic: 'Percentiles & the tail', ref: 'Baselines, anomalies and SLOs',
      prompt: 'Checkout: average latency 380 ms, p99 = 2600 ms, traffic ≈ 42,000 requests/hour. What is the correct operational read?',
      options: [
        'The service is healthy because the average latency is low',
        'p99 is a typo for p95 and can be ignored',
        'Average latency is the best SLO metric for user experience',
        '≈420 requests/hour sit in the tail the average hides',
      ],
      answer: 3,
      why: '1% of 42,000 = ~420 requests/hour enduring ~2.6 s — a full cohort of patients the average never shows. “Healthy because the average is low” is the exact trap percentiles exist to catch; p99 is a real percentile, not a typo; and averages are a poor SLO grade for user-facing latency — write SLOs in p95/p99.',
    },
    {
      id: 'hq2', topic: 'Telemetry design under budget', ref: 'Configuring the resources (exam objective 3.1)',
      prompt: 'A new microservice goes live. Budget is capped and the SLO requires p99 visibility. Best telemetry configuration?',
      options: [
        'Agent collection, INFO with sampling, percentile metrics, tiered retention',
        'DEBUG everything, keep raw logs for years, skip the dashboard',
        'No agent — wait for users to report the problems',
        'Aggregate CPU graphs only — enough for any p99 SLO',
      ],
      answer: 0,
      why: '“Configure appropriate resources” (3.1) means deliberate trade-offs: an agent to reach app-internal spans, INFO plus sampling to respect the ingest budget, percentile metrics to see the SLO, tiered retention for cost. DEBUG-forever breaches the budget on day one; agentless cannot see the spans a p99 SLO needs; CPU graphs say nothing about request latency.',
    },
    {
      id: 'hq3', topic: 'N+1 & trace analysis', ref: 'Performance optimization — the lesson’s goal',
      prompt: 'A trace shows payment-svc/charge = 1930 ms containing 47 identical `INSERT loyalty_points` spans of ~31 ms each. What does this prove?',
      options: [
        'The database server is undersized and needs more hardware',
        'The trace agent is broken and duplicating span data',
        'An N+1 pattern: one loyalty insert per cart item',
        'Network latency between payment-svc and the database dominates',
      ],
      answer: 2,
      why: '47 × 31 ms ≈ 1.46 s of the 1.93 s span — repeated identical spans are the classic N+1 signature, fixed by batching. The database answers in 31 ms, so it is fast; hardware is not the disease. A broken agent duplicates spans randomly, not once per cart item, and per-call network delay would appear inside each span’s self time.',
    },
    {
      id: 'hq4', topic: 'SLOs & error budgets', ref: 'Baselines, anomalies and SLOs',
      prompt: 'SLO = 99.9% checkout availability over a 30-day month. How large is the error budget, and why does it matter?',
      options: [
        '3 minutes — it is the marketing slogan for uptime',
        '43.2 minutes — downtime you may spend before freezing releases',
        '43.2 seconds — breaches trigger automatic failover to the replica',
        'No budget exists: 99.9% means zero downtime is allowed',
      ],
      answer: 1,
      why: '30 days = 43,200 minutes; 0.1% = 43.2 minutes. That budget is the go/no-go currency: burn it and risky deploys freeze until the window resets. It is not 3 minutes of marketing, not seconds, and not zero-downtime — 99.9% explicitly prices in small, survivable failures.',
    },
    {
      id: 'hq5', topic: 'Scheduled-change triage', ref: 'Baselines, anomalies and SLOs',
      prompt: 'Disk I/O on orders-db spikes to 92 MB/s every night at exactly 02:00 for 8 minutes. Logs show “snapshot job started (CHG-1187, nightly 02:00)”. Correct disposition?',
      options: [
        'Escalate to P1 — disk I/O spikes are emergencies',
        'Suppress the disk metric permanently so it never pages',
        'Open an incident and page the database team nightly',
        'Close as expected: it matches the documented scheduled change',
      ],
      answer: 3,
      why: 'Deviation from baseline only signals when it is unexplained — reconcile with the change calendar first. This spike matches CHG-1187 to the minute, so close it and annotate the dashboard. Nightly P1 pages manufacture alert fatigue; permanent suppression blinds you to real disk failure; and paging the DBA every night erodes trust in the whole pipeline.',
    },
    {
      id: 'hq6', topic: 'Capacity forecasting & scaling', ref: 'Performance optimization — the lesson’s goal',
      prompt: 'Checkout demand grows steadily ~8% month-over-month; orders-db volume hits 1.24 TB of a 1.5 TB ceiling. Best forward-looking action?',
      options: [
        'Forecast ~10–11 weeks to breach; schedule a trending scale',
        'Wait for the disk-full alarm to fire, then react',
        'Buy the largest available instance immediately, to be safe',
        'Delete old orders regularly without any data-retention policy',
      ],
      answer: 0,
      why: 'Compound growth: ln(1.5/1.24)/ln(1.08) ≈ 2.5 months ≈ 10–11 weeks — trending-triggered scaling acts on the trajectory before the ceiling (CV0-004 3.2 lists trending/load/event). Waiting for the disk-full alarm converts planning into an outage; buying the largest instance wastes spend today; ad-hoc deletion without a retention policy is a compliance incident.',
    },
    {
      id: 'hq7', topic: 'Retention economics', ref: 'Configuring the resources (exam objective 3.1)',
      prompt: 'Log ingestion is 60% over budget. ERROR lines are forensically vital; DEBUG comes from one chatty sidecar; INFO is bulky but occasionally useful. Best policy?',
      options: [
        'Sample everything uniformly at 50% and keep tiers equal',
        'Delete all logs older than 24 hours, every class',
        'Drop DEBUG at source, archive INFO, keep ERROR hot',
        'Raise the ingest budget — logs cannot be tuned',
      ],
      answer: 2,
      why: 'Value-tiered retention: kill the highest-volume, lowest-value class at the source, demote medium-value data to cheap tiers, and protect the forensically vital class hot and longest. Uniform 50% sampling throws away ERROR evidence at the same rate as DEBUG noise; 24-hour deletion destroys incident forensics; and ingest is exactly the dial 3.1 expects you to configure.',
    },
  ];

  // ── Objectives (definitions; the CHECK RESULTS rules live in js/objectives.js) ──
  const MEDIUM_OBJECTIVES = [
    {
      id: 'OBJ-M1', pillar: 'P1',
      title: 'Separate monitoring from observability',
      brief: 'The ward uses both, for different jobs. Classify each round statement by the discipline it describes.',
      where: 'Examination bay → Rounds · Intake quiz',
      hints: [
        'Monitoring = watching known indicators against known thresholds. It answers questions you wrote down in advance.',
        'Observability = interrogating telemetry (metrics + logs + traces together) to answer questions nobody predicted.',
        'Statements about fixed checks/pages → Monitoring. Statements about new questions/exploration → Observability.',
      ],
      bay: 'ward',
      anchor: 'Lesson 3.3 scope — monitoring vs observability distinction',
    },
    {
      id: 'OBJ-M2', pillar: 'P1',
      title: 'Identify the three pillars in raw telemetry',
      brief: 'Four raw telemetry samples from Nimbus Cart. Sort each into its pillar.',
      where: 'Examination bay → Rounds · Pillar intake',
      hints: [
        'Metrics are numeric time-series values. Logs are discrete timestamped event records. Traces are timed spans carrying a trace id.',
        'Percentiles (p99) are still metrics — a numeric series point, even with a scary name.',
        'Anything with a trace id and a duration is a span → Traces. Anything with a timestamp + level + message → Logs.',
      ],
      bay: 'ward',
      anchor: 'Objective 3.1 — Logging / Tracing / Monitoring (Metrics)',
    },
    {
      id: 'OBJ-M3', pillar: 'P2',
      title: 'Find the patient deviating hardest from baseline',
      brief: 'The checkout SLO (p95 ≤ 800 ms) is breaching. One service’s vitals deviate most from its own baseline band. Name the patient.',
      where: 'Examination bay → Ward map · Vitals strips',
      hints: [
        'Compare each vitals strip against its grey baseline band, not against other services.',
        'api-gateway is elevated but within its band; inventory-svc is within its band too.',
        'payment-svc: p95 1930 ms against a 160–260 ms baseline — a ~9× deviation.',
      ],
      bay: 'ward',
      anchor: '3.1 Monitoring (Metrics) + baseline deviation (also 4.6)',
    },
    {
      id: 'OBJ-M4', pillar: 'P2',
      title: 'Correlate the failure in the aggregated logs',
      brief: 'Logs from 8 services already aggregate into one searchable stream. Filter it, find the payment failure signature, and report the error code and pool occupancy.',
      where: 'Examination bay → Chart review · filter chips',
      hints: [
        'Use the service and level filter chips: payment-svc + ERROR.',
        'Three identical failures fired 09:06–09:14; each carries a structured field err_code=…',
        'The error code is PAY-5033 and the pool shows 10/10 in use.',
      ],
      bay: 'charts',
      anchor: '3.1 Logging — Collection · Aggregation · Analysis',
    },
    {
      id: 'OBJ-M5', pillar: 'P2',
      title: 'Read the trace waterfall',
      brief: 'Open the imaging suite: one slow checkout request is rendered as a span waterfall. Identify the slowest span and its duration.',
      where: 'Examination bay → Imaging suite',
      hints: [
        'The longest bar wins — but click it to read the exact duration.',
        'payment-svc/charge dominates: the bar stretches across most of the 2400 ms trace.',
        'The slowest span is payment-svc/charge at 1930 ms.',
      ],
      bay: 'imaging',
      anchor: '3.1 Tracing — spans, waterfall, bottleneck localization',
    },
    {
      id: 'OBJ-M6', pillar: 'P2',
      title: 'Judge a deviation: incident or scheduled?',
      brief: 'orders-db shows a huge nightly disk I/O spike at 02:00. Decide which metric deviates and whether it is an incident or a scheduled change.',
      where: 'Examination bay → Ward map · orders-db vitals + chart review',
      hints: [
        'Look at the orders-db disk I/O series in Chart review — note when the spike happens.',
        'Chart review logs at 02:00 mention “scheduled snapshot job started (change CHG-1187, nightly 02:00)”.',
        'Metric = disk I/O. Classification = scheduled (benign, matches CHG-1187).',
      ],
      bay: 'charts',
      anchor: '3.1 baseline/anomaly + 4.6 deviation from baseline',
    },
    {
      id: 'OBJ-M7', pillar: 'P3',
      title: 'Triage the board',
      brief: 'Six alerts are waiting. Give each its correct disposition: acknowledge, escalate, merge, suppress or close.',
      where: 'Examination bay → Triage board',
      hints: [
        'acknowledge = you own it now; escalate = hand to a specialist; merge = duplicate of a primary; suppress = noisy/non-actionable; close = expected or self-recovered.',
        'ALR-202 duplicates ALR-201 → merge. ALR-205 matches documented change CHG-1187 → close.',
        '201 acknowledge · 202 merge · 203 suppress · 204 escalate · 205 close · 206 close.',
      ],
      bay: 'triage',
      anchor: '3.1 Alerting — Triage',
    },
    {
      id: 'OBJ-M8', pillar: 'P3',
      title: 'Build a well-tuned alert rule',
      brief: 'Rebuild the checkout latency alert so it pages once, for real breaches, at honest severity.',
      where: 'Examination bay → Alert workbench',
      hints: [
        'Threshold should sit above the SLO (800) to avoid paging on blips, but well under the 2400 ms incident level.',
        'Add a duration so brief wobbles don’t page: 5 minutes is the ward standard.',
        'metric checkout_p95 · > 1000–2000 ms · for 4–10 min · severity P2 (P1 is for full outages).',
      ],
      bay: 'alertlab',
      anchor: '3.1 Alerting — thresholds, types, honest severities',
    },
    {
      id: 'OBJ-M9', pillar: 'P4',
      title: 'Configure the logging pipeline correctly',
      brief: 'Records desk: fix collection, aggregation, log levels and retention so the ward can observe without drowning in cost.',
      where: 'Examination bay → Records desk',
      hints: [
        'payment-svc needs its agent ON and shipping to the central platform — aggregation, not scattered host files.',
        'INFO (not DEBUG) for payment-svc keeps context without noise; marketing-tracker must drop to WARN to stop the flood.',
        'Retention: 14–45 days hot, 60–180 archived (ward standard 30/90).',
      ],
      bay: 'records',
      anchor: '3.1 Logging — Collection · Aggregation · Retention',
    },
    {
      id: 'OBJ-M10', pillar: 'P4',
      title: 'Treat the root cause, then verify',
      brief: 'Choose the right treatment for the pool exhaustion, apply it, and verify recovery on the vitals.',
      where: 'Examination bay → Treatment board',
      hints: [
        'The trace shows 47 tiny identical INSERTs — the database is healthy; the access pattern is not.',
        'Bigger pool or more instances only buys time; batching the inserts removes the 1.46 s of repeated spans.',
        'Apply “Batch the loyalty-points inserts”, then press Verify recovery and confirm p95 falls under 800 ms.',
      ],
      bay: 'treatment',
      anchor: '3.1 Alerting — Response · lesson detail: performance optimization',
    },
    {
      id: 'OBJ-M11', pillar: 'P4',
      title: 'Forecast capacity and pick the scaling trigger',
      brief: 'orders-db grows ~8%/month toward a 1.5 TB ceiling (now 1.24 TB). Predict the breach window and configure the right scaling response.',
      where: 'Examination bay → Treatment board · capacity panel',
      hints: [
        'Growth compounds: headroom ratio 1.5/1.24 at 8% monthly compounding.',
        'That works out to ≈ 2.5 months ≈ 10–11 weeks (accept 9–12).',
        'A forecast from a trend is a trending trigger; growing the instance’s own storage is vertical scaling.',
      ],
      bay: 'treatment',
      anchor: '3.1 trending · 3.2 triggered (trending/load/event) + horizontal/vertical',
    },
  ];

  const HARD_OBJECTIVES = [
    {
      id: 'OBJ-H1', pillar: 'P3',
      title: 'The 02:00 mystery — prove it, don’t guess it',
      brief: 'Night-shift evidence: a 92 MB/s disk spike on orders-db at exactly 02:00. Classify it, but only after grounding the verdict in the evidence documents.',
      where: 'Ward map + Chart review + Records desk · evidence folder',
      hints: [
        'Three artefacts matter: the metric series, the 02:00 log lines, and the change record CHG-1187 in the runbook folder.',
        'A verdict without evidence is a guess. Open both evidence documents before filing.',
        'Verdict: benign/scheduled. Required evidence: runbook + change calendar. Disposition: close.',
      ],
      bay: 'ward',
      anchor: '3.1 anomaly vs scheduled change · 4.6 deviation from baseline',
    },
    {
      id: 'OBJ-H2', pillar: 'P2',
      title: 'Root-cause the SLO breach end-to-end',
      brief: 'From noisy evidence, deliver the full diagnosis: culprit service, the repeated-span count that proves the pattern, the trace id of your exhibit, and the root-cause class.',
      where: 'Imaging suite + Chart review + Ward map',
      hints: [
        'The edge p95 number is a symptom. The waterfall is the mechanism.',
        'Count the repeated db.query spans in the payment-svc/charge span and copy the exhibit trace id from its header or the PAY-5033 log fields.',
        'payment-svc · 47 spans · trace 9f2ca71d44e08b31 · root cause N+1 queries.',
      ],
      bay: 'imaging',
      anchor: '3.1 Tracing · Logging analysis · percentiles',
    },
    {
      id: 'OBJ-H3', pillar: 'P3',
      title: 'Triage a 10-alert storm with distractors',
      brief: 'Ten alerts, three of them red herrings. Disposition every one — near-misses are rejected.',
      where: 'Triage board (night shift set)',
      hints: [
        'Finance and scheduled-change alerts are not operations incidents. Self-resolved and duplicate alerts are not actionable either.',
        '“Billing projection +18%” is finance’s problem; the 02:00 disk spike matches CHG-1187.',
        '301 ack · 302 merge · 303 escalate · 304 suppress · 305 close · 306 close · 307 ack · 308 suppress · 309 merge · 310 close.',
      ],
      bay: 'triage',
      anchor: '3.1 Alerting — Triage under noise',
    },
    {
      id: 'OBJ-H4', pillar: 'P3',
      title: 'Silence the flapping rule without going blind',
      brief: 'Retune the marketing-tracker error-rate alert: scope the source, set a duration window and honest severity, and cut the noise at the source.',
      where: 'Alert workbench (night shift set)',
      hints: [
        'A rule scoped to ALL services inherits the tracker’s DEBUG flood. Scope it to the service that matters.',
        'Paging on sub-minute flaps means the duration window is missing.',
        'Source: checkout only · threshold ≥ 3% · duration ≥ 5 min · severity P3 · DEBUG collection off for the tracker.',
      ],
      bay: 'alertlab',
      anchor: '3.1 Alerting — tuning, alert fatigue, MTTD/MTTR',
    },
    {
      id: 'OBJ-H5', pillar: 'P4',
      title: 'Configure observability for the new service',
      brief: 'inventory-svc v2 ships Thursday under a hard budget cap and a p99 SLO. Choose the whole telemetry stack; wrong economics fail the check.',
      where: 'Records desk · design board',
      hints: [
        'The SLO says percentiles; the budget says no DEBUG firehose and no unbounded retention.',
        'Agentless can’t reach app-internal signals needed for span-level p99 attribution.',
        'agent · INFO · sampling 10–50% · tiered retention · widgets must include p99 latency AND error rate.',
      ],
      bay: 'records',
      anchor: '3.1 “configure appropriate resources” · cost management thread',
    },
    {
      id: 'OBJ-H6', pillar: 'P4',
      title: 'Sequence the response',
      brief: 'Eight action cards, five belong in the runbook. Order them correctly; distractors are rejected.',
      where: 'Treatment board · response sequencer',
      hints: [
        'Response order: stopgap → root-cause fix → verify the mechanism → verify the symptom → document.',
        'Hardware resizing contradicts the trace; disabling alerts or features is not a response.',
        'a (pool stopgap) → b (batch hotfix) → c (fresh trace) → d (p95 under SLO) → e (runbook + close).',
      ],
      bay: 'treatment',
      anchor: '3.1 Alerting — Response · 3.2 scaling judgement',
    },
    {
      id: 'OBJ-H7', pillar: 'P2',
      title: 'Price the tail',
      brief: 'Average 380 ms, p99 2600 ms, traffic ≈ 42,000 checkout requests/hour. Compute the human impact of the tail and pick the SLO-grade metric.',
      where: 'Ward map + Finances & SLO ledger',
      hints: [
        'p99 = the worst 1% of requests.',
        '1% of 42,000 requests/hour — do the math.',
        '420 requests/hour; the metric that guards users is p99 (percentile), not the average.',
      ],
      bay: 'ledger',
      anchor: '3.1 Monitoring — Metrics (percentiles) · applied analysis',
    },
    {
      id: 'OBJ-H8', pillar: 'P1',
      title: 'Spend the error budget wisely',
      brief: 'Checkout SLO 99.9% over a 30-day month; 38.2 minutes already burned this month. Compute the remaining budget and make the deploy call.',
      where: 'Finances & SLO ledger',
      hints: [
        '30 days = 43,200 minutes. The budget is 0.1% of that.',
        '43.2 − 38.2 leaves almost nothing before freeze territory.',
        'Budget 43.2 min (accept 42–44); decision: freeze risky deploys.',
      ],
      bay: 'ledger',
      anchor: 'Lesson scope: SLO / error budget practice',
    },
    {
      id: 'OBJ-H9', pillar: 'P4',
      title: 'Cut ingestion 60% without losing forensics',
      brief: 'The invoice is over budget. Re-tier the ward’s retention so ERROR evidence survives longest and the chatty sidecar stops burning money.',
      where: 'Records desk · retention tuner',
      hints: [
        'Rank the three classes by forensic value before touching sliders.',
        'DEBUG from one noisy sidecar at source = the single biggest saving.',
        'DEBUG drop at source · INFO to cold/archive · ERROR 90 days · sampling ON.',
      ],
      bay: 'records',
      anchor: '3.1 Logging — Retention · cost of observability',
    },
  ];

  const ALL_OBJECTIVES = { medium: MEDIUM_OBJECTIVES, hard: HARD_OBJECTIVES };

  const PILLAR_LABEL = {
    P1: 'Understand',
    P2: 'Recognize & Analyze',
    P3: 'Detect & Triage',
    P4: 'Configure & Respond',
  };

  // Canonical bay names (used by binder rail, focus areas and feedback copy)
  const BAY_LABELS = {
    ward: 'Ward map',
    charts: 'Chart review',
    imaging: 'Imaging suite',
    triage: 'Triage board',
    alertlab: 'Alert workbench',
    records: 'Records desk',
    treatment: 'Treatment board',
    ledger: 'SLO ledger',
  };

  const BAY_ORDER = ['ward', 'charts', 'imaging', 'triage', 'alertlab', 'records', 'treatment', 'ledger'];

  const BAY_TITLES = {
    ward: { name: 'Ward map', blurb: 'Every service is a patient — vitals, baselines, evidence folder' },
    charts: { name: 'Chart review', blurb: 'Metric series + the aggregated log stream' },
    imaging: { name: 'Imaging suite', blurb: 'Distributed trace waterfalls — the X-ray of a request' },
    triage: { name: 'Triage board', blurb: 'Alerts awaiting disposition' },
    alertlab: { name: 'Alert workbench', blurb: 'Build and tune alert rules' },
    records: { name: 'Records desk', blurb: 'Collection, aggregation, levels, retention, cost' },
    treatment: { name: 'Treatment board', blurb: 'Remedies, capacity planning, response sequencing' },
    ledger: { name: 'SLO ledger', blurb: 'Percentiles, error budget, deploy decisions' },
  };

  const DISPOSITIONS = [
    { value: 'acknowledge', label: 'Ack' },
    { value: 'escalate', label: 'Escalate' },
    { value: 'merge', label: 'Merge' },
    { value: 'suppress', label: 'Suppress' },
    { value: 'close', label: 'Close' },
  ];

  // ── Knowledge core copy (verbatim from shell.tsx; [tip]…[/tip] = glossary tooltip) ──
  const REFERENCE_SECTIONS = [
    {
      title: 'Monitoring vs observability',
      html: '[tip]Monitoring[/tip] answers questions you wrote down in advance: fixed dashboards, fixed thresholds, pages when a known indicator misbehaves. [tip]Observability[/tip] is the broader discipline: a system so well-instrumented — with [tip]Metric[/tip]s, [tip]Log[/tip]s and [tip]Trace[/tip]s — that you can interrogate it and explain failures nobody predicted. Monitoring is a subset. Cloud+ (CV0-004 3.1) expects you to <em>configure the resources</em> that make both possible.',
    },
    {
      title: 'The pillars and how they interlock',
      html: '<ul class="list-disc"><li><strong>Metrics</strong> — cheap numeric time series (CPU %, p95 latency, error rate) for trends, dashboards, alerts.</li><li><strong>Logs</strong> — discrete timestamped event records; rich detail, higher cost per byte.</li><li><strong>Traces</strong> — request-scoped chains of spans; expose cross-service latency and N+1 patterns.</li></ul><p class="mt2">Diagnosis is a relay: an alert (metric) narrows the when/where → logs give the detail → the trace gives the mechanism.</p>',
    },
    {
      title: 'Configuring the resources (exam objective 3.1)',
      html: '<ul class="list-disc"><li><strong>Logging — Collection:</strong> agents on hosts/sidecars (or agentless APIs for infra); structured (JSON) logs beat free-text.</li><li><strong>Logging — Aggregation:</strong> centralize every service’s stream into one searchable platform so correlation takes seconds, not SSH+grep across fleets.</li><li><strong>Logging — Retention:</strong> tier by value and obligation — hot/searchable for triage, cold/archive for compliance, drop chatty DEBUG. Retention is a cost/compliance dial you set deliberately.</li><li><strong>Tracing:</strong> instrument services (OpenTelemetry is the vendor-neutral standard), propagate context, sample wisely.</li><li><strong>Monitoring/Metrics:</strong> pick SLI-grade metrics (percentiles for user experience), record baselines.</li><li><strong>Alerting:</strong> threshold + duration + honest severity → trigger → [tip]Triage[/tip] → response (runbook, escalation) → verify → document. Watch [tip]MTTD / MTTR[/tip].</li></ul>',
    },
    {
      title: 'Baselines, anomalies and SLOs',
      html: 'A [tip]Baseline[/tip] is the historical normal band of a metric — deviation from it is the core anomaly signal (and, per CV0-004 4.6, how suspicious activity like cryptojacking shows up). [tip]SLO / error budget[/tip] turns reliability into a currency: 99.9% over 30 days = 43.2 minutes you may spend — and when it is nearly spent, risky deploys freeze.',
    },
    {
      title: 'Tool landscape (know one example of each)',
      html: 'Cloud-native: AWS CloudWatch, Azure Monitor, Google Cloud Operations Suite. Third-party: Datadog, Splunk, Elastic Stack, Prometheus + Grafana. Vendor-neutral instrumentation: OpenTelemetry. The exam is vendor-neutral — learn the concepts, map them to any platform.',
    },
    {
      title: 'Performance optimization — the lesson’s goal',
      html: 'Observability data exists to drive action: find the bottleneck span, fix the access pattern (batch N+1), size pools, scale <em>triggered</em> (trending / load / event) or scheduled, forecast capacity from trends, and re-verify on the dashboard. Diagnosis without a verified treatment is not operations.',
    },
  ];

  // ── Debrief copy (verbatim from assess.tsx) ─────────────────────────────────
  const DEBRIEF = {
    detectionRows: [
      ['SLO breach', 'p95_latency{route=checkout} > 800ms for 5m → P2 page', 'edge metrics'],
      ['N+1 query pattern', 'trace span `db.query` repeats ×N > 20 within one request', 'distributed traces'],
      ['Pool exhaustion', 'log `pool exhausted` OR pool_util ≥ 95% for 2m', 'app logs (aggregated)'],
      ['Baseline deviation', '|metric − baseline_band| sustained 10m AND not in change calendar', 'metrics + change feed'],
      ['Alert fatigue', 'alert flapping ≥ 5 triggers/hour on one rule → auto-ticket for tuning', 'alert history'],
    ],
    attackHtml: 'The same telemetry that runs this ward is what security detections consume — ATT&CK models these as data sources: <a class="link" href="https://attack.mitre.org/datasources/DS0015/" target="_blank" rel="noopener noreferrer">DS0015 · Application Log{{ext}}</a> and <a class="link" href="https://attack.mitre.org/datasources/DS0025/" target="_blank" rel="noopener noreferrer">DS0025 · Cloud Service{{ext}}</a>. No logs aggregated → no detections. (Mappings simplified; ATT&CK data-source pages are reference material.)',
    playbook: [
      'Triage honestly: severity × actionability; merge duplicates, suppress noise, close what matches the change calendar.',
      'Ground the verdict in evidence (trace + logs + baseline) before touching hardware.',
      'Stopgap → root-cause fix → <strong>verify on telemetry</strong> (spans collapse, p95 returns under SLO).',
      'Document: runbook, post-incident note, alert tuning ticket.',
    ],
    blueTeam: [
      'Baseline deviation discipline (3.1) is the same skill as suspicious-activity monitoring (4.6) — cryptojacking is a CPU baseline story.',
      'Retention policy (3.1) is also a forensic capability: you cannot investigate what you did not keep.',
      'Aggregated, structured logs are the precondition for every downstream security analytics tool.',
    ],
    redTeam: [
      'Attackers love telemetry gaps: an unagented, unlogged service is a blind spot — a free exfiltration lane.',
      'Verbose DEBUG logs can leak secrets into platforms with broad read access; log hygiene is security hygiene.',
      'Under impact, adversaries benefit when defenders are desensitized — alert fatigue is an attack surface. (Defensive awareness only.)',
    ],
    references: [
      { href: 'https://www.comptia.org/en-us/certifications/cloud', label: 'CompTIA Cloud+ (CV0-004) — official exam page' },
      { href: 'https://attack.mitre.org/datasources/DS0015/', label: 'MITRE ATT&CK · DS0015 Application Log' },
      { href: 'https://attack.mitre.org/datasources/DS0025/', label: 'MITRE ATT&CK · DS0025 Cloud Service' },
    ],
  };

  // ── Completion modal copy (verbatim) ────────────────────────────────────────
  const COMPLETION_COPY = {
    recap: 'You explained the telemetry, found the deviation, imaged the request, triaged {alerts} alerts, treated the root cause and tuned the ward. That is Lesson 3.3, end to end.',
    noWeakAreas: 'No weak areas detected — every objective passed first-try, no hint reliance, and the board quiz was clean. Push into Night Shift for unguided practice.',
    nextStudy: [
      'Lesson 3.2 — operations & optimization: right-sizing, tagging, runbooks, capacity planning.',
      'Lesson 3.4 — cost management & DR: budgets, anomaly detection, recovery objectives.',
      'Re-run Night Shift if you took Day Rounds — same ward, no guardrails.',
    ],
  };

  // ── Mode gate copy (verbatim) ───────────────────────────────────────────────
  const MODE_GATE = {
    kicker: 'CompTIA Cloud+ CV0-004 · Lesson 3.3 · Observability — training simulation',
    title: 'Cloud Ward',
    intro: 'Nimbus Cart’s checkout is breaching its SLO and the pager is loud. You are the on-call SRE physician: read the vitals, correlate the charts, image the slow request, triage the board — then treat the patient and tune the ward. All data is <strong class="amber">synthetic training data</strong>.',
    footnote: 'Both shifts share the same ward, telemetry and instruments. Progress auto-saves to this browser.',
    modes: [
      {
        tone: 'day', icon: 'sun', title: 'Day Rounds', subtitle: 'Guided · Medium',
        bullets: [
          '11 round objectives, introduced in order',
          '3-tier hints on every objective (costs stars, never blocks)',
          'Tolerant checking: near-forms accepted, every miss explained',
          '6-question board quiz with teaching explanations',
        ],
        mode: 'medium',
      },
      {
        tone: 'night', icon: 'moon', title: 'Night Shift', subtitle: 'Solo diagnosis · Hard',
        bullets: [
          '9 broad multi-step cases, discovery-based',
          'Noisy evidence: duplicates, red herrings, a finance alert',
          'Strict validation: exact values, exact IDs, sequencing',
          'At most one nudge — and it visibly costs score',
        ],
        mode: 'hard',
      },
    ],
  };

  // ── Treatment board fixes (verbatim) ────────────────────────────────────────
  const FIXES = [
    { id: 'pool', label: 'Raise DB pool 10 → 20', effect: 'Stopgap: waiters get connections; 47 redundant INSERTs remain.', envKey: 'poolFix' },
    { id: 'batch', label: 'Batch the loyalty-points inserts', effect: 'Root cause: collapses 47 spans into 1 batched INSERT.', envKey: 'batchFix' },
    { id: 'scale', label: 'Scale payment-svc 6 → 10 replicas', effect: 'More instances still run the same N+1 pattern per request.', envKey: 'scaleFix' },
    { id: 'cache', label: 'Enable response cache on /charge', effect: 'Payments are not cacheable — no effect on this pattern.', envKey: null },
  ];

  // Static capacity math (verified with code):
  // ln(1.5/1.24)/ln(1.08) = 2.473 months = 10.74 weeks; 0.1% of 43200 min = 43.2 min;
  // 1% of 42,000 = 420 requests/hour.

  global.CW_DATA = {
    mulberry32: mulberry32,
    wave: wave,
    INC: INC,
    checkoutP95: checkoutP95,
    paymentP95: paymentP95,
    gatewayCpu: gatewayCpu,
    checkoutErrRate: checkoutErrRate,
    ordersDiskIO: ordersDiskIO,
    capacityTrend: capacityTrend,
    saleReqRate: saleReqRate,
    wardPatients: wardPatients,
    LOGS: LOGS,
    MAIN_TRACE: MAIN_TRACE,
    HEALTHY_TRACE: HEALTHY_TRACE,
    MEDIUM_ALERTS: MEDIUM_ALERTS,
    HARD_ALERTS: HARD_ALERTS,
    M1_ITEMS: M1_ITEMS,
    M2_ITEMS: M2_ITEMS,
    H6_CARDS: H6_CARDS,
    H6_DISPLAY_ORDER: H6_DISPLAY_ORDER,
    H5_WIDGETS: H5_WIDGETS,
    GLOSSARY: GLOSSARY,
    QUIZ_MEDIUM: QUIZ_MEDIUM,
    QUIZ_HARD: QUIZ_HARD,
    MEDIUM_OBJECTIVES: MEDIUM_OBJECTIVES,
    HARD_OBJECTIVES: HARD_OBJECTIVES,
    ALL_OBJECTIVES: ALL_OBJECTIVES,
    PILLAR_LABEL: PILLAR_LABEL,
    BAY_LABELS: BAY_LABELS,
    BAY_ORDER: BAY_ORDER,
    BAY_TITLES: BAY_TITLES,
    DISPOSITIONS: DISPOSITIONS,
    REFERENCE_SECTIONS: REFERENCE_SECTIONS,
    DEBRIEF: DEBRIEF,
    COMPLETION_COPY: COMPLETION_COPY,
    MODE_GATE: MODE_GATE,
    FIXES: FIXES,
  };
})(this);
