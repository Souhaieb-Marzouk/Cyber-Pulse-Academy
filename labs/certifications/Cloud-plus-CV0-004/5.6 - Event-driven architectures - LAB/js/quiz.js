// ─── Quiz banks (C5) ─────────────────────────────────────────────────────────
// R4: correct-answer positions rotate across items (Medium: 3,0,2,1,3,1 · Hard: 1,3,0,2,3,1,0).
// R5: all options per item are length-balanced (±1 word) and structurally similar —
//     the correct answer is never the longest option and length never gives it away.
// Ported 1:1 from the original framework lab (src/lib/lab/quiz.ts). No rewording.
'use strict';

const QUIZ_MEDIUM = [
  {
    id: 'qm1', prompt: 'Which statement best defines an event in an event-driven architecture?',
    options: [
      'A request sent to one service that expects an immediate reply',
      'A scheduled job that copies rows from one database into another',
      'A command telling a named service exactly which action to take',
      'An immutable record stating that something just happened',
    ],
    correct: 3,
    explanation: 'Events are FACTS ("order.placed") broadcast with no knowledge of who reacts. Options A and C describe queries and commands — they name or address a receiver; option B is batch processing, not eventing.',
    topic: 'Event vs command vs query',
  },
  {
    id: 'qm2', prompt: 'What is the key difference between a message queue and a publish–subscribe topic?',
    options: [
      'Queue messages reach one consumer; topics reach every subscriber',
      'A queue stores data forever, while a topic deletes it after one read',
      'Topics are only for telemetry, while queues are only for payments',
      'A topic needs more compute than an equivalent queue would need',
    ],
    correct: 0,
    explanation: 'Queue = work distribution (one consumer per message). Topic = fan-out (copy to every subscriber). Storage, workload type and compute cost are properties of the implementation, not of the delivery model.',
    topic: 'Queue vs topic vs stream',
  },
  {
    id: 'qm3', prompt: 'Why do event-driven architectures pair so naturally with serverless functions?',
    options: [
      'Functions poll queues continuously, so no event is ever missed',
      'Functions cannot run on virtual machines, so events replace servers',
      'A trigger wakes a function on demand, so idle cost drops to zero',
      'Functions deploy faster than VM images, so releases ship sooner',
    ],
    correct: 2,
    explanation: 'Triggers (upload, HTTP, queue, schedule, stream) start functions on demand: scale-to-zero plus per-invocation billing fits bursty event traffic. Polling contradicts the model; deploy speed and VM comparisons miss the point.',
    topic: 'Serverless & triggers',
  },
  {
    id: 'qm4', prompt: 'A message fails schema validation on every retry and can never parse. What is the correct handling?',
    options: [
      'Keep retrying it forever in place until a new schema parses it',
      'Cap the retries, divert it to a dead-letter queue for review',
      'Delete it immediately because malformed data has no later value',
      'Restart the consumer service so the message is read fresh again',
    ],
    correct: 1,
    explanation: 'A poison message blocks head-of-line traffic if retried forever. The DLQ preserves it for inspection, fix and reprocessing while the queue flows again — and DLQ depth > 0 deserves an alarm. Silent deletes lose evidence; restarts fix nothing.',
    topic: 'Poison messages & DLQs',
  },
  {
    id: 'qm5', prompt: 'Under at-least-once delivery, what responsibility falls on the consumer?',
    options: [
      'It must forward exactly-once semantics to its downstream consumers',
      'It must acknowledge each message before processing completes',
      'None — the broker guarantees that no duplicates ever arrive',
      'Make processing idempotent so a replayed event has no extra effect',
    ],
    correct: 3,
    explanation: 'At-least-once GUARANTEES occasional redeliveries (timeouts, failures). Idempotency — keyed on the event ID — makes duplicates harmless. Exactly-once forwarding is not required; premature acks lose data; brokers do not dedupe for you.',
    topic: 'Delivery semantics & idempotency',
  },
  {
    id: 'qm6', prompt: 'What is the PRIMARY architectural benefit of decoupling services with events?',
    options: [
      'It removes all latency from every request path in the system',
      'Producers and consumers scale, deploy and fail independently',
      'It guarantees strict global ordering of all operations end-to-end',
      'It eliminates the need for monitoring and metric dashboards',
    ],
    correct: 1,
    explanation: 'The broker absorbs load and time: a slow or failing consumer never blocks the producer. Eventual consistency, duplicate handling and debugging complexity are the trade-offs — decoupling does not remove latency, order everything, or end monitoring.',
    topic: 'EDA benefits & trade-offs',
  },
];

const QUIZ_HARD = [
  {
    id: 'qh1', scenario: 'Metrics: orders-queue depth 4,812 · oldest message 3h · Payment Service error rate 41%. Consumer logs healthy for all other services.', prompt: 'What is the FIRST investigative move?',
    options: [
      'Scale Payment Service instances up to process the backlog',
      'Inspect the oldest messages for a deterministic rejection',
      'Raise the queue retention so no message expires unprocessed',
      'Restart the whole checkout flow to clear the stuck state',
    ],
    correct: 1,
    explanation: 'Depth + age + one failing consumer = head-of-line suspicion. Find the message that fails deterministically (poison) before scaling — scaling just processes the poison faster, five retries at a time. Retention hides the symptom; restarting resets nothing.',
    topic: 'Incident triage',
  },
  {
    id: 'qh2', scenario: 'A message has failed 5/5 retries with the same JSON schema error.', prompt: 'What is the correct disposition?',
    options: [
      'Requeue it at the front so it cannot be lost by the broker',
      'Keep it in the queue — future code may parse it eventually',
      'Drop it and move on — the producer will resend a new copy',
      'Divert to a DLQ, alarm on its depth, inspect and reprocess',
    ],
    correct: 3,
    explanation: 'DLQ + alarm + inspect/reprocess is the runbook. Keeping it blocks the queue; dropping it loses evidence; front-requeueing recreates the same loop.',
    topic: 'Poison messages & DLQs',
  },
  {
    id: 'qh3', scenario: 'Customers report occasional double charges. The channel delivers at-least-once; Payment Service has no deduplication.', prompt: 'The correct remediation is…',
    options: [
      'Add an idempotency check keyed on the event ID at charge time',
      'Increase the retry cap so failures escalate less frequently',
      'Switch the channel to at-most-once so retries stop entirely',
      'Disable redeliveries inside the broker configuration settings',
    ],
    correct: 0,
    explanation: 'You cannot (and should not) make the channel never redeliver — you make the CONSUMER idempotent. At-most-once would drop valid payments instead of duplicating them; caps and disables just relocate the failure.',
    topic: 'Delivery semantics & idempotency',
  },
  {
    id: 'qh4', scenario: 'An event consumer\'s execution role allows s3:* on * and admin on itself.', prompt: 'Which remediation matches least-privilege best practice?',
    options: [
      'Grant read-only access on every bucket so debugging gets easier',
      'Rotate the function credentials nightly but keep the policies',
      'Scope to its inbox prefix and one topic; remove self-admin',
      'Leave it unchanged because the function runs internally only',
    ],
    correct: 2,
    explanation: 's3:* on * means one compromised function exfiltrates or destroys every bucket (cf. T1530, and discovery via T1526/T1580). Scope per role: one prefix, one topic, no self-admin (M1018/M1026). Rotating credentials does not shrink the blast radius.',
    topic: 'Least privilege (IAM)',
  },
  {
    id: 'qh5', scenario: 'Telemetry analytics see per-drone readings arriving out of order across partitions.', prompt: 'The correct fix set is…',
    options: [
      'Re-sort all partitions globally before processing the batch',
      'Partition by a random UUID so every partition stays balanced',
      'Increase consumer memory so ordering improves automatically',
      'Partition by device-id; buffer-and-sort per partition',
    ],
    correct: 3,
    explanation: 'Stream ordering is per-partition: the key decides what lands together. Device-id groups each drone\'s readings (ordered); random scatters them; global re-sort throws away parallelism; memory changes nothing about arrival order.',
    topic: 'Stream ordering & partition keys',
  },
  {
    id: 'qh6', scenario: 'Seven independent services must each react to every order.placed event.', prompt: 'Which wiring is architecturally correct?',
    options: [
      'One queue with all seven services attached as its consumers',
      'A topic that the seven services each subscribe to individually',
      'Checkout API calling each service over REST in strict sequence',
      'A shared database table that all seven services poll for rows',
    ],
    correct: 1,
    explanation: 'A queue would deliver each order to ONE random consumer of the seven. Fan-out to many consumers is exactly what pub/sub topics are for; REST couples and a polling table re-creates tight coupling.',
    topic: 'Fan-out wiring',
  },
  {
    id: 'qh7', scenario: 'A latency-critical checkout consumer suffers multi-second cold starts during traffic spikes.', prompt: 'The surgical remedy is…',
    options: [
      'Provisioned concurrency reserved for that specific consumer',
      'Maximum memory allocated to every function in the estate',
      'Two extra topics inserted between producer and this consumer',
      'Move the API endpoint to another region with idle capacity',
    ],
    correct: 0,
    explanation: 'Provisioned concurrency keeps instances warm precisely where latency matters — surgical cost for surgical benefit. Blanket max-memory or extra hops cost money and add latency without removing cold starts; regions do not fix warm-up.',
    topic: 'Cost & cold starts',
  },
];
