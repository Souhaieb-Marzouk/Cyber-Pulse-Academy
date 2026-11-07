// ─── EventOps Control Tower · static content (all synthetic training data) ───
// js/data.js — lab content separated from logic (SC-D7). Ported 1:1 from the
// original framework lab (src/lib/lab/content.ts). Do not reword: validators,
// hints and feedback reference this wording verbatim.
'use strict';

const LAB_META = {
  title: 'EVENTOPS CONTROL TOWER',
  subtitle: 'Cloud+ CV0-004 · Lesson 5.6 — Event-driven architectures',
  org: 'Aerolink Cargo (fictional)',
  version: 2,
};

const NODES = [
  // producers
  { id: 'checkout-api', label: 'Checkout API', kind: 'producer', icon: 'cart', desc: 'REST API receiving Meridian Retail checkout requests. Emits order.placed events.' },
  { id: 'photo-uploader', label: 'Proof-of-Delivery Uploader', kind: 'producer', icon: 'imageup', desc: 'Courier app endpoint. Every delivery photo upload emits photo.uploaded.' },
  { id: 'fleet-telemetry', label: 'Fleet Telemetry Gateway', kind: 'producer', icon: 'radar', desc: 'Ingests ~1,900 drone telemetry messages/s (GPS, battery, temperature).' },
  { id: 'report-scheduler', label: 'Nightly Scheduler', kind: 'producer', icon: 'clock', desc: 'Fires the generate.report event at 02:00 local time, every night.' },
  // brokers
  { id: 'orders-queue', label: 'orders-queue', kind: 'broker', brokerType: 'queue', icon: 'queue', desc: 'Point-to-point FIFO queue: each message goes to exactly one consumer. Retry cap: 5.' },
  { id: 'media-topic', label: 'media-events', kind: 'broker', brokerType: 'topic', icon: 'topic', desc: 'Publish–subscribe topic: every subscriber gets its own copy of each event (fan-out).' },
  { id: 'telemetry-stream', label: 'telemetry-stream', kind: 'broker', brokerType: 'stream', icon: 'stream', desc: 'Partitioned event stream: very high throughput, replayable, ordering per partition.' },
  { id: 'notifications-topic', label: 'notifications-topic', kind: 'broker', brokerType: 'topic', icon: 'topic', desc: 'Fan-out topic for customer and partner notifications.' },
  { id: 'inventory-jobs', label: 'inventory-jobs', kind: 'broker', brokerType: 'queue', icon: 'queue', desc: 'Queue created to decouple Checkout API from Inventory Service.', hidden: true },
  // consumers
  { id: 'payment-service', label: 'Payment Service', kind: 'consumer', icon: 'card', desc: 'Charges the customer card. Business-critical. Failing on malformed payloads since 08:12.' },
  { id: 'inventory-service', label: 'Inventory Service', kind: 'consumer', icon: 'boxes', desc: 'Reserves stock for an order. Currently invoked synchronously over REST by Checkout API.' },
  { id: 'thumbnail-service', label: 'Thumbnail Generator', kind: 'consumer', icon: 'image', desc: 'Creates delivery-photo thumbnails. Subscribes to media-events.' },
  { id: 'face-tag-service', label: 'Auto-Tagging (AI)', kind: 'consumer', icon: 'tags', desc: 'Runs object detection on delivery photos. Subscribes to media-events.' },
  { id: 'notifier', label: 'Notifier', kind: 'consumer', icon: 'bell', desc: 'Sends customer notifications. Subscribes to media-events, publishes to notifications-topic.' },
  { id: 'fleet-dashboard', label: 'Fleet Dashboard', kind: 'consumer', icon: 'gauge', desc: 'Live map of airborne drones. Consumes telemetry-stream.' },
  { id: 'anomaly-detector', label: 'Anomaly Detector', kind: 'consumer', icon: 'brain', desc: 'Flags battery/temperature anomalies. Consumes telemetry-stream.' },
  { id: 'report-generator', label: 'Report Generator', kind: 'consumer', icon: 'chart', desc: 'Builds the nightly operations report. Triggered by the schedule.' },
  { id: 'analytics-ingest', label: 'Analytics Ingest', kind: 'consumer', icon: 'db', desc: 'Feeds the analytics warehouse. Subscribes to notifications-topic.' },
];

const nodeById = (id) => NODES.find((n) => n.id === id);

const INITIAL_WIRING = {
  'checkout-api': ['orders-queue'],
  'photo-uploader': ['media-topic'],
  'fleet-telemetry': ['telemetry-stream'],
  'report-scheduler': ['report-generator'],
  'orders-queue': ['payment-service'],
  'media-topic': ['thumbnail-service', 'face-tag-service', 'notifier'],
  'telemetry-stream': ['fleet-dashboard', 'anomaly-detector'],
  notifier: ['notifications-topic'],
  'notifications-topic': ['analytics-ingest'],
};

/** M1 — nodes the student must classify */
const FLAG_NODES = ['checkout-api', 'fleet-telemetry', 'media-topic', 'telemetry-stream', 'payment-service', 'analytics-ingest'];

/** M4 — expected path for the photo event (subscribers may be in any order) */
const PHOTO_PATH_FIXED = ['photo-uploader', 'media-topic'];
const PHOTO_PATH_SUBS = ['thumbnail-service', 'face-tag-service', 'notifier'];
const PATH_CHIP_POOL = [
  // R6: pool shuffled so the correct chips are not simply the first ones offered.
  'telemetry-stream', 'photo-uploader', 'orders-queue', 'media-topic',
  'payment-service', 'thumbnail-service', 'fleet-dashboard', 'face-tag-service', 'notifier',
];

/** M2 — event / command / query cards */
const MESSAGE_CARDS = [
  // R6: row order shuffled so the correct type does not cycle e→c→q→e→c→q.
  { id: 'm1', text: 'invoice.paid { order_id: "M-55012", amount: 42.10, at: "09:14Z" }', correct: 'event' },
  { id: 'm6', text: '? drones_airborne(region: "north")', correct: 'query' },
  { id: 'm2', text: '→ Resize proof-photo #8812 to 256×256', correct: 'command' },
  { id: 'm5', text: '→ Deploy build #712 to production', correct: 'command' },
  { id: 'm4', text: 'order.cancelled { reason: "card-declined", at: "09:21Z" }', correct: 'event' },
  { id: 'm3', text: '? balance(order_id: "M-55014")', correct: 'query' },
];

/** M3 — channel selection needs */
const CHANNEL_NEEDS = [
  // R6: row order shuffled so answers do not follow the taught queue→topic→stream order.
  { id: 'c2', text: 'Twelve different services must each receive a copy of "a file landed".', correct: 'topic' },
  { id: 'c3', text: 'Millions of sensor readings per second, replayable, ordered per device for analytics.', correct: 'stream' },
  { id: 'c1', text: 'Each payment task must be handled by exactly one worker — no other service cares.', correct: 'queue' },
];

/** M5 — trigger matching */
const TRIGGER_USECASES = [
  { id: 't1', text: 'A new object lands in the proof-of-delivery inbox prefix of the bucket.', correct: 'trigger-object' },
  { id: 't2', text: 'A web client POSTs to /api/checkout over HTTPS.', correct: 'trigger-http' },
  { id: 't3', text: 'A job message becomes available in the inventory-jobs queue.', correct: 'trigger-queue' },
  { id: 't4', text: 'The monthly invoice summary must run at 02:00 on the 1st.', correct: 'trigger-schedule' },
];
const TRIGGER_OPTIONS = [
  // R6: option order shuffled so row t(n) answers do not sit at position n.
  { id: 'trigger-queue', label: 'Queue trigger' },
  { id: 'trigger-schedule', label: 'Schedule trigger (cron)' },
  { id: 'trigger-object', label: 'Object-storage trigger' },
  { id: 'trigger-webhook', label: 'Outbound webhook call' },
  { id: 'trigger-http', label: 'HTTP / API-gateway trigger' },
  { id: 'trigger-stream', label: 'Stream-poll trigger' },
];
/** M6 — choreography vs orchestration */
const COORD_SCENARIOS = [
  { id: 's1', text: 'A pizza-order workflow spans 4 services, needs timeouts and refund compensation if any step fails.', correct: 'orchestration' },
  { id: 's2', text: 'A service-status broadcast: every team\'s dashboard reacts independently, no central flow.', correct: 'choreography' },
];
const COORD_TRUTH = {
  options: [
    'In choreography, a central coordinator drives each step and enforces timeouts.',
    'In orchestration, a central coordinator drives each step and can enforce timeouts and compensation.',
    'Choreography and orchestration both require a central coordinator to route every event.',
  ],
  correct: 1,
};

/** M12 — EDA fitness check */
const FITNESS_WORKLOADS = [
  { id: 'w1', text: 'Real-time fraud scoring on every card swipe (millisecond latency need).', correct: 'event-driven' },
  { id: 'w2', text: 'Monthly payroll run: huge, deterministic dataset, no latency need.', correct: 'batch' },
  { id: 'w3', text: 'Live drone-fleet map fed by continuous sensor telemetry.', correct: 'event-driven' },
];

/** Queue browser — orders-queue messages */
const QUEUE_MESSAGES = [
  { id: 'evt-9012', preview: 'order.placed { order_id:"M-55012", total: 42.10 }', malformed: false, note: 'Processed 3× (duplicate redeliveries) — see duplicates metric.' },
  { id: 'evt-9013', preview: 'order.placed { order_id:"M-55013", total: 129.99 }', malformed: false, note: 'Processed OK.' },
  { id: 'evt-8841', preview: 'order.placed { order_id:"A-7731", total: "NaN" }', malformed: true, note: 'SCHEMA VIOLATION — "total" must be a number. Rejected by Payment Service 5/5 retries.' },
  { id: 'evt-9014', preview: 'order.placed { order_id:"M-55015", total: 88.00 }', malformed: false, note: 'Waiting behind the poison message (FIFO head-of-line).' },
  { id: 'evt-9015', preview: 'order.placed { order_id:"M-55016", total: 12.49 }', malformed: false, note: 'Waiting.' },
  { id: 'evt-9016', preview: 'order.placed { order_id:"M-55017", total: 310.75 }', malformed: false, note: 'Waiting.' },
];

/** IAM permission catalog (checkbox lists in inspector) */
const PERM_NOTIFIER = [
  { id: 'perm-s3-all', label: 's3:* on * — read every bucket' },
  { id: 'perm-publish-notifications', label: 'publish to notifications-topic' },
  { id: 'perm-fn-admin', label: 'admin on this function (self-modify)' },
  { id: 'perm-sub-media', label: 'subscribe to media-events' },
  { id: 'perm-publish-all-topics', label: 'publish to ALL topics' },
];
const IAM_NOTIFIER_CORRECT = ['perm-publish-notifications', 'perm-sub-media'];

const PERM_THUMB = [
  // R6: required perms interleaved with over-privileges.
  { id: 'perm-fn-admin', label: 'admin on this function' },
  { id: 'perm-s3-getobject-inbox', label: 's3:GetObject on proof-bucket/inbox/*' },
  { id: 'perm-list-all-buckets', label: 'list every bucket in the account' },
  { id: 'perm-publish-media-events', label: 'publish to media-events' },
  { id: 'perm-s3-all', label: 's3:* on * — every bucket, every action' },
];
const IAM_THUMB_CORRECT = ['perm-s3-getobject-inbox', 'perm-publish-media-events'];

/** M10 / H7 — alarm catalog */
const ALARM_CATALOG = [
  // R6: good/bad interleaved so the correct set is not "the first three".
  { id: 'alarm-invocations', label: 'total function invocations', hint: 'Volume ≠ health. Vanity metric for failure detection.', good: false },
  { id: 'alarm-queue-age', label: 'orders-queue · oldest message age > 15 min', hint: 'Head-of-line blocking / stuck pipelines.', good: true },
  { id: 'alarm-bucket-objects', label: 'bucket object count', hint: 'Storage growth, not event-flow health.', good: false },
  { id: 'alarm-dlq-depth', label: 'any dead-letter queue · message count > 0', hint: 'Something failed repeatedly and was diverted.', good: true },
  { id: 'alarm-cert-expiry', label: 'TLS certificate expiry (days left)', hint: 'Real ops hygiene, unrelated to detecting flow failures.', good: false },
  { id: 'alarm-consumer-error', label: 'consumer error rate > 5%', hint: 'A consumer is rejecting its events.', good: true },
];
const ALARMS_CORRECT = ['alarm-queue-age', 'alarm-dlq-depth', 'alarm-consumer-error'];

/** Injector — event types per producer */
const INJECT_EVENTS = {
  'checkout-api': { type: 'order.placed', payload: '{ order_id:"M-55099", total: 64.20 }' },
  'photo-uploader': { type: 'photo.uploaded', payload: '{ object: "proof-bucket/inbox/dlv-7731.jpg", size: 1.8e6 }' },
  'fleet-telemetry': { type: 'telemetry.reading', payload: '{ drone:"AV-118", battery: 76, temp: 41 }' },
  'report-scheduler': { type: 'generate.report', payload: '{ day: "today", scope: "fleet" }' },
};

/** Hard — H1 Silent Checkout root-cause candidates (3 correct of 8) */
const H1_CAUSES = [
  // R6: true causes interleaved with red herrings.
  { id: 'rc-ssl', label: 'TLS cert for api.aerolink.example expires in 30 days', good: false },
  { id: 'rc-poison', label: 'Malformed event evt-8841 (total:"NaN") loops in orders-queue', good: true },
  { id: 'rc-batch', label: 'Thumbnail batch size is 1', good: false },
  { id: 'rc-nodlq', label: 'orders-queue has NO dead-letter queue — the poison retries forever', good: true },
  { id: 'rc-replalag', label: 'Read-replica lag on the reporting database', good: false },
  { id: 'rc-idem', label: 'Payment Service is not idempotent — redeliveries double-charge customers', good: true },
  { id: 'rc-429', label: 'Notifier gets 429 throttles from a partner webhook', good: false },
  { id: 'rc-cold', label: 'Cold starts on Report Generator (runs monthly)', good: false },
];
/** H1 — noisy evidence excerpt (2+ red herrings included) */
const H1_LOG_EXCERPT = [
  { ts: '08:12:01', level: 'error', src: 'payment-service', msg: 'SchemaError evt-8841: "total" expected number, got string "NaN" (attempt 3/5)' },
  { ts: '08:12:04', level: 'warn', src: 'cert-monitor', msg: 'TLS certificate api.aerolink.example expires in 30 days — renewal scheduled' },
  { ts: '08:12:09', level: 'error', src: 'payment-service', msg: 'DUPLICATE-CHARGE evt-9012: customer M-55012 charged twice (redelivery without idempotency key)' },
  { ts: '08:12:31', level: 'warn', src: 'reporting-db', msg: 'read replica lag 2.4s (self-healed)' },
  { ts: '08:13:02', level: 'error', src: 'payment-service', msg: 'SchemaError evt-8841: attempt 5/5 — redelivering…' },
  { ts: '08:13:40', level: 'info', src: 'report-generator', msg: 'cold start 2.4s (monthly job, acceptable)' },
  { ts: '08:14:11', level: 'warn', src: 'notifier', msg: 'partner webhook 429 throttled, backing off' },
  { ts: '08:15:00', level: 'error', src: 'metrics', msg: 'orders-queue depth=1240 oldest=47min — consumers starving behind evt-8841' },
];

/** H4 — over-fed function evidence */
const H4_FORGED_EVENT = `{
  "type": "photo.uploaded",
  "source": "proof-bucket/inbox/dlv-7731.jpg",
  "size": 812000000,
  "metadata": { "role_arn": "arn:aws:iam::000:role/admin", "cmd_hint": "<injected>" }
}`;
const H4_VECTORS = [
  // R6: correct vector not first.
  { id: 'v-brute', label: 'Brute-force login on the admin console', good: false },
  { id: 'v-inject', label: 'Forged photo.uploaded event injected through the unvalidated public upload endpoint', good: true },
  { id: 'v-dns', label: 'DNS hijack of a partner domain', good: false },
  { id: 'v-sql', label: 'SQL injection in the reporting DB', good: false },
];
const H4_OVERPRIV = [
  // R6: correct over-privilege not first.
  { id: 'o-logwrite', label: 'It writes its own execution logs', good: false },
  { id: 'o-s3all', label: 'thumbnail-service IAM allows s3:* on * — every bucket, every action', good: true },
  { id: 'o-topicpub', label: 'It publishes to media-events', good: false },
  { id: 'o-inbox', label: 'It reads proof-bucket/inbox/*', good: false },
];
/** H5 — cost/latency optimizations (pick exactly 3 of 8) */
const H5_OPTS = [
  // R6: correct optimizations interleaved with waste options.
  { id: 'p-ret', label: 'Raise stream retention to 90 days', good: false },
  { id: 'p-batch', label: 'Raise Thumbnail Generator batch 1 → 10', good: true },
  { id: 'p-mem', label: 'Max memory on every function', good: false },
  { id: 'p-region', label: 'Co-locate Uploader, media-events and consumers in one region', good: true },
  { id: 'p-fan', label: 'Fan every event to every topic "just in case"', good: false },
  { id: 'p-prov', label: 'Provisioned concurrency for the latency-critical checkout consumer', good: true },
  { id: 'p-hop', label: 'Route telemetry through an extra topic hop "for tidiness"', good: false },
  { id: 'p-cross', label: 'Move the API endpoint to another continent "for resilience"', good: false },
];
/** H2 — blueprint slots */
const BLUEPRINT_SLOTS = [
  { id: 'bp1', prompt: 'Checkout API publishes order.placed to…', correct: 'orders-queue', options: [ { id: 'media-topic', label: 'media-events (topic)' }, { id: 'orders-queue', label: 'orders-queue (queue)' }, { id: 'telemetry-stream', label: 'telemetry-stream (stream)' } ] },
  { id: 'bp2', prompt: 'Payment Service consumes from…', correct: 'orders-queue', options: [ { id: 'notifications-topic', label: 'notifications-topic (topic)' }, { id: 'orders-queue', label: 'orders-queue (queue)' }, { id: 'none', label: 'nothing — keep REST polling' } ] },
  { id: 'bp3', prompt: 'Inventory Service consumes from…', correct: 'inventory-jobs', options: [ { id: 'orders-queue', label: 'orders-queue (shared with payments)' }, { id: 'inventory-jobs', label: 'inventory-jobs (queue)' }, { id: 'none', label: 'direct REST call' } ] },
  { id: 'bp4', prompt: 'Proof-of-Delivery Uploader publishes to…', correct: 'media-topic', options: [ { id: 'orders-queue', label: 'orders-queue (queue)' }, { id: 'media-topic', label: 'media-events (topic — 3 subscribers)' }, { id: 'telemetry-stream', label: 'telemetry-stream (stream)' } ] },
  { id: 'bp5', prompt: 'Notifier consumes media-events via…', correct: 'trigger-topic', options: [ { id: 'trigger-schedule', label: 'nightly cron' }, { id: 'trigger-topic', label: 'topic subscription (push on publish)' }, { id: 'trigger-http', label: 'HTTP polling endpoint' } ] },
  { id: 'bp6', prompt: 'Thumbnail Generator batch size (cost target: amortize cold starts):', correct: 'batch-10', options: [ { id: 'batch-1', label: '1 (one image per invocation)' }, { id: 'batch-10', label: '10 (batch window)' }, { id: 'batch-100', label: '100 (huge, slow batches)' } ] },
];

/** H6 — saga / compensation */
const H6_COMP_OPTS = [
  // R6: compensation events interleaved with non-undo decoys.
  { id: 'comp-recharge', label: 'payment.charge-again — charge the customer a second time', good: false },
  { id: 'comp-refund', label: 'payment.refund — reverse the charge', good: true },
  { id: 'comp-keep', label: 'inventory.keep — silently keep the reservation', good: false },
  { id: 'comp-release', label: 'inventory.release — free the reserved stock', good: true },
  { id: 'comp-reship', label: 'shipping.duplicate — dispatch a second parcel', good: false },
  { id: 'comp-cancel', label: 'shipping.cancel — cancel the dispatch', good: true },
];
/** H7 — observability plan */
const H7_METRICS = ['m-queueage', 'm-dlq', 'm-error', 'm-throttle', 'm-invocations'];
const H7_METRIC_LABELS = {
  'm-queueage': 'oldest message age', 'm-dlq': 'DLQ message count', 'm-error': 'consumer error rate', 'm-throttle': 'consumer throttle rate', 'm-invocations': 'total invocations',
};
const H7_ACTIONS = [
  // R6: response options re-ordered; no positional pattern across the five rows.
  { id: 'a-scale', label: 'auto-scale consumers' },
  { id: 'a-none', label: 'no alarm (context only)' },
  { id: 'a-weekly', label: 'weekly review only' },
  { id: 'a-page', label: 'page on-call' },
];
const H7_CORRECT = { 'm-queueage': 'a-page', 'm-dlq': 'a-page', 'm-error': 'a-page', 'm-throttle': 'a-scale', 'm-invocations': 'a-none' };

/** H8 — out-of-order telemetry */
const H8_READINGS = [
  { t: '10:00:01.204', drone: 'AV-118', seq: 991 },
  { t: '10:00:01.201', drone: 'AV-119', seq: 512 },
  { t: '10:00:01.199', drone: 'AV-118', seq: 990 },
  { t: '10:00:01.208', drone: 'AV-119', seq: 514 },
  { t: '10:00:01.205', drone: 'AV-118', seq: 992 },
];
const H8_KEYS = [
  { id: 'k-random', label: 'random UUID per reading (current — scatters one drone across all partitions)' },
  { id: 'k-device', label: 'device-id (drone tail number) — one drone = one partition = ordered', good: true },
  { id: 'k-time', label: 'wall-clock timestamp — no ordering benefit, hot partition risk' },
];
const H8_BUFFERS = [
  // R6: correct buffering strategy not first.
  { id: 'b-immediate', label: 'apply immediately on arrival (still out of order)', },
  { id: 'b-partition', label: 'buffer and sort within each partition before applying', good: true },
  { id: 'b-global', label: 'globally re-sort all partitions (defeats stream parallelism)' },
];
/** H9 — go/no-go proposals */
const H9_PROPOSALS = [
  { id: 'r1', text: 'Team of 2, new to EDA, hard 3-week deadline, low-throughput B2B feeds.', verdict: 'reject', reason: 'rs-team' },
  { id: 'r2', text: 'Global fan-out of livestream events to up to 40 consumer apps.', verdict: 'accept', reason: 'rs-fanout' },
  { id: 'r3', text: 'Financial ledger needing strict total order + relational joins at 20 writes/s.', verdict: 'reject', reason: 'rs-ordering' },
];
const H9_VERDICTS = [ { id: 'accept', label: 'Go event-driven' }, { id: 'reject', label: 'No — keep simpler design' } ];
const H9_REASONS = [
  // R6: reason options shuffled so r(n) answers do not sit at position n.
  { id: 'rs-fanout', label: 'massive fan-out to independent consumers is EDA\'s core strength' },
  { id: 'rs-ordering', label: 'strict total ordering + relational queries fit batch/relational better' },
  { id: 'rs-cost', label: 'event infrastructure costs more per message at every scale' },
  { id: 'rs-team', label: 'team readiness / deadline risk outweighs benefit at this scale' },
];
/** H3 — delivery semantics showdown */
const H3_ROWS = [
  { id: 'd1', text: 'Card charge processing (money movement)', model: 'at-least-once', control: 'ctl-idem' },
  { id: 'd2', text: 'Cache invalidation fan-out (a missed refresh self-heals in TTL)', model: 'at-most-once', control: 'ctl-none' },
  { id: 'd3', text: 'Audit-ledger ingestion (no duplicate or lost entries acceptable)', model: 'exactly-once-equiv', control: 'ctl-dedupe' },
  { id: 'd4', text: 'Customer notification fan-out (must arrive; occasional late retry fine)', model: 'at-least-once', control: 'ctl-dlq' },
];
const H3_MODELS = [
  // R6: model options re-ordered; no positional pattern across the four rows.
  { id: 'exactly-once-equiv', label: 'Exactly-once-equivalent (at-least-once + deduped sink)' },
  { id: 'at-least-once', label: 'At-least-once (retry until ack; duplicates possible)' },
  { id: 'at-most-once', label: 'At-most-once (fire-and-forget; drops possible)' },
];
const H3_CONTROLS = [
  // R6: control options re-ordered; no positional pattern across the four rows.
  { id: 'ctl-dlq', label: 'retry with DLQ for failed sends' },
  { id: 'ctl-none', label: 'none — occasional loss is tolerable' },
  { id: 'ctl-idem', label: 'idempotency key on the consumer' },
  { id: 'ctl-dedupe', label: 'dedupe store keyed on event id at the sink' },
];
/** H10 — archive panel */
const H10_RETENTIONS = [
  { id: 'ret-90d', label: '90 days' }, { id: 'ret-1y', label: '1 year' }, { id: 'ret-7y', label: '7 years (audit/financial record)' },
];
const H10_TARGETS = [
  // R6: correct replay strategy not first.
  { id: 'tgt-prod', label: 'replay straight into production consumers' },
  { id: 'tgt-sandbox', label: 'replay into a sandbox consumer first' },
  { id: 'tgt-discard', label: 'replay nothing — storage only' },
];
const H10_JUST = [
  // R6: correct justification not first.
  { id: 'just-cost', label: 'it saves storage cost' },
  { id: 'just-compliance', label: 'compliance/forensics: reconstruct any past state and re-derive decisions' },
  { id: 'just-dash', label: 'it makes dashboards prettier' },
];
/** Glossary (15 terms) */
const GLOSSARY = [
  { term: 'Event', def: 'An immutable record that something happened (e.g., photo.uploaded). Events state facts; they do not instruct.' },
  { term: 'Event producer', def: 'The component that emits an event to a broker when its state changes.' },
  { term: 'Event consumer', def: 'The component that subscribes to a channel and reacts to events.' },
  { term: 'Event broker', def: 'A managed intermediary (queue, topic, or stream) that receives, stores briefly, and routes events.' },
  { term: 'Message queue', def: 'Point-to-point channel: each message is delivered to exactly one consumer — ideal for work distribution.' },
  { term: 'Topic (publish–subscribe)', def: 'Channel that delivers a copy of each event to every subscriber — ideal for fan-out notifications.' },
  { term: 'Event stream', def: 'Partitioned, replayable, append-only log of events; very high throughput with ordering inside each partition.' },
  { term: 'Serverless / FaaS', def: 'Compute model where functions run on demand, scale to zero when idle, and are billed per invocation.' },
  { term: 'Trigger', def: 'The event source that starts a function: object upload, HTTP request, queue message, schedule, or stream record.' },
  { term: 'Fan-out', def: 'One event delivered to many independent consumers at once (topics do this; queues do not).' },
  { term: 'Delivery semantics', def: 'The guarantee level of a channel: at-least-once (duplicates possible), at-most-once (drops possible), or exactly-once-equivalent.' },
  { term: 'Idempotency', def: 'Processing the same event twice produces no additional effect — the consumer\'s duty under at-least-once delivery.' },
  { term: 'Dead-letter queue (DLQ)', def: 'A holding queue where messages are diverted after repeated processing failures, instead of blocking the pipeline.' },
  { term: 'Choreography', def: 'Decentralized coordination: each service reacts to events on its own; no central controller.' },
  { term: 'Orchestration', def: 'A central coordinator drives the workflow, enforcing order, timeouts and compensation steps.' },
];

const MICRO_TERMS = {
  'poison message': 'A message that can never be processed (e.g., schema-invalid) and fails on every retry.',
  'partition key': 'The field a stream uses to group records; all records with the same key land in one partition, in order.',
  'cold start': 'The extra latency of the first invocation of an idle serverless function while its runtime boots.',
  'retention': 'How long a broker/stream keeps events before deleting them.',
  'provisioned concurrency': 'Pre-warmed function instances that eliminate cold starts for latency-critical consumers.',
  'correlation ID': 'An identifier added at the first producer and carried on every hop so all logs of one business flow can be stitched together.',
};

/** Scenario briefing (C1) */
const BRIEFING = {
  org: 'Aerolink Cargo',
  lines: [
    'Aerolink Cargo is a fictional drone-logistics operator: 340 delivery drones, one partner retailer (Meridian Retail), and a cloud platform that has just stopped scaling cleanly. This morning, checkout orders began piling up in a queue nobody was watching, payment consumers rejected a malformed event, and proof-of-delivery photos fan out to three services that each scale on their own schedule.',
    'You have just joined the Tower Team as Platform Resilience Engineer. Your mission: prove you can READ an event-driven platform (anatomy, channels, triggers), OPERATE it (route, trace, decouple, configure delivery semantics), and DEFEND it (dead-letter queues, idempotency, least privilege, alarms) — the exact skills CompTIA Cloud+ CV0-004 tests under Domain 5.0 DevOps Fundamentals, “Event-driven architectures”.',
    'Everything you see — the topology, events, logs, metrics and IAM policies — is synthetic training data for the fictional aerolink.example environment. Nothing here connects to a real cloud account.',
  ],
};

/** Knowledge core (C2) sections */
const KNOWLEDGE_SECTIONS = [
  {
    title: 'What is an event?',
    body: 'An event is an immutable fact: “photo.uploaded”, “order.placed”, “battery.low”. It states that something happened — it does not tell any service what to do. That is the difference between an EVENT (“invoice paid”), a COMMAND (“resize this photo” — an instruction to one receiver) and a QUERY (“what is this balance?” — a request for data). Events let producers stay ignorant of consumers: the producer announces a fact and moves on, which is why event-driven systems decouple so cleanly.',
  },
  {
    title: 'The anatomy: producer → broker → consumer',
    body: 'Every flow has three roles. The PRODUCER emits events when its state changes. The BROKER (a managed queue, topic or stream) receives, briefly stores and routes them. CONSUMERS subscribe and react — each at its own speed, scaled independently. Because the broker sits in the middle, a slow or failing consumer never blocks the producer: the event waits in the channel instead.',
  },
  {
    title: 'Choosing a channel: queue vs topic vs stream',
    body: 'QUEUE (point-to-point): each message goes to exactly one consumer — use for work distribution (payments, inventory jobs). TOPIC (publish–subscribe): every subscriber gets a copy — use for fan-out (media events to thumbnail + tagging + notifier). STREAM: partitioned, replayable, ordered per partition — use for very high-throughput telemetry and analytics that need to re-read history. Cloud+ expects you to match channel to need.',
  },
  {
    title: 'Serverless + triggers',
    body: 'FaaS functions are the natural consumers of events: they scale to zero when idle and start when a TRIGGER fires — an object upload (storage trigger), an HTTPS request (API-gateway trigger), a queue message, a cron schedule, or a stream record. Cloud services illustrate: object-storage events invoke functions; API gateways front them; queues buffer between; schedules wake them. Vendor names change (Lambda, Azure Functions, Cloud Functions); the trigger taxonomy does not.',
  },
  {
    title: 'Delivery semantics & idempotency',
    body: 'Most managed channels deliver AT-LEAST-ONCE: after a failure or timeout the broker redelivers, so consumers MUST tolerate duplicates — ideally by being IDEMPOTENT (keying on the event ID so reprocessing is a no-op). AT-MOST-ONCE trades drops for lowest latency. EXACTLY-ONCE-EQUIVALENT is achieved by pairing at-least-once delivery with a deduplicated sink. Choose per workload: money → at-least-once + idempotency; disposable cache refreshes → at-most-once.',
  },
  {
    title: 'Failure handling: retries, poison messages, DLQs',
    body: 'Consumers fail — transiently (throttles) or permanently (a malformed payload that can NEVER parse, a “poison message”). Without a policy, poison blocks the queue head-of-line. The remedy: cap retries, then divert to a DEAD-LETTER QUEUE. The DLQ is not a graveyard: operators inspect, fix, and reprocess from it — and alarm on any depth > 0.',
  },
  {
    title: 'Coordination: choreography vs orchestration',
    body: 'CHOREOGRAPHY: services react to each other’s events with no central brain — simple, resilient, but the end-to-end flow lives only in the code of many teams. ORCHESTRATION: a coordinator drives the workflow, enforcing order, timeouts and COMPENSATION (refund the charge, release the stock) when a step fails. Multi-step business transactions with undo logic usually want orchestration (a “saga”); independent reactions want choreography.',
  },
  {
    title: 'Benefits & trade-offs',
    body: 'Benefits: decoupling (producer/consumer evolve and scale independently), failure isolation, elastic scaling to load spikes, natural audit trail of facts, and a perfect fit for serverless economics. Trade-offs: eventual consistency, harder end-to-end debugging (fix with correlation IDs + distributed tracing), ordering discipline (partition keys), duplicate handling, and real design complexity. EDA is a tool, not a religion: a monthly payroll batch is happier as a batch job.',
  },
  {
    title: 'Security lens (MITRE cross-map, defensive)',
    body: 'Event-driven platforms add security surface: public endpoints that accept event payloads (injection/forgery — cf. MITRE ATT&CK T1190 Exploit Public-Facing Application), consumers with over-broad credentials that can enumerate infrastructure (T1526, T1580) or read every bucket (T1530 Data from Cloud Storage). Counter-measures: strict least-privilege IAM per function (M1018 User Account Management, M1026 Privileged Account Management), payload schema validation at the edge, and isolating event flows per business domain (M1030 Network Segmentation). IDs verified against attack.mitre.org, 2026-11-07.',
  },
];

/** Debrief (C6) content */
const DEBRIEF = {
  detection: [
    { sig: 'orders-queue depth / oldest-message age climbing', why: 'Stuck pipelines: poison messages, dead consumers, throttles.' },
    { sig: 'DLQ message count > 0', why: 'Something failed repeatedly and was diverted — page a human, inspect, fix, reprocess.' },
    { sig: 'consumer error & throttle rates', why: 'Distinguish consumer bugs (errors) from capacity problems (throttles).' },
    { sig: 'duplicate-delivery / idempotency-hit counter', why: 'At-least-once redeliveries happening; a spike plus missing idempotency = double-effect risk.' },
    { sig: 'schema-validation failure counter at the producer edge', why: 'Forged or malformed events entering the flow (injection attempt signal).' },
    { sig: 'correlation-ID trace stitching all hops', why: 'One business flow across producer → broker → every consumer; gaps expose silent drops.' },
  ],
  mitigations: [
    { id: 'M1018', name: 'User Account Management', how: 'Strict IAM: each producer/consumer gets only the permissions its role needs (verified MITRE mitigation).' },
    { id: 'M1026', name: 'Privileged Account Management', how: 'No admin permissions on event functions; separate deploy-time from run-time credentials (verified).' },
    { id: 'M1030', name: 'Network Segmentation', how: 'Isolate event flows per business domain; private broker endpoints (verified).' },
    { id: 'CV0-004 · 5.0', name: 'EDA best practices', how: 'DLQs + capped retries, idempotency, schema validation, batching, partition keys, archive/replay.' },
  ],
  blueTeam: [
    'Alarm on the three flow-health signals (queue age, DLQ depth, consumer error rate) — they catch the incident class you just triaged.',
    'Make every consumer idempotent by default; at-least-once delivery makes duplicates a certainty, not an exception.',
    'Validate event payloads against a schema at the producer edge — poison messages and forged events die there.',
    'Scope IAM per function: one bucket prefix, one topic. Over-broad credentials turn one compromised function into fleet-wide access.',
    'Propagate a correlation ID from the first producer through every hop; it converts mystery outages into one grep.',
  ],
  redTeam: [
    'Think like an attacker: a public, unvalidated producer endpoint is an event-injection point (T1190) — forged payloads ride the same broker as real ones.',
    'An over-privileged consumer is a lateral-movement prize: list infra (T1526/T1580), read every bucket (T1530). Least privilege is the counter.',
    'Missing idempotency is not just a bug — repeated redelivery is an availability and financial-integrity hazard.',
    'A DLQ with no alarm and no owner is attacker-friendly storage: failed forged events sit there unread.',
  ],
  links: [
    { label: 'CompTIA Cloud+ (CV0-004) — official page', url: 'https://www.comptia.org/en-us/certifications/cloud' },
    { label: 'MITRE ATT&CK T1190 — Exploit Public-Facing Application', url: 'https://attack.mitre.org/techniques/T1190/' },
    { label: 'MITRE ATT&CK T1526 — Cloud Service Discovery', url: 'https://attack.mitre.org/techniques/T1526/' },
    { label: 'MITRE ATT&CK T1580 — Cloud Infrastructure Discovery', url: 'https://attack.mitre.org/techniques/T1580/' },
    { label: 'MITRE ATT&CK T1530 — Data from Cloud Storage', url: 'https://attack.mitre.org/techniques/T1530/' },
    { label: 'MITRE ATT&CK M1018 — User Account Management', url: 'https://attack.mitre.org/mitigations/M1018/' },
  ],
};
