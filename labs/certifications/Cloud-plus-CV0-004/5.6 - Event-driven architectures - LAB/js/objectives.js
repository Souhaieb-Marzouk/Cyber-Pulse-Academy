// ─── Objectives + validators (F2 CHECK engine) ───────────────────────────────
// Ported 1:1 from the original framework lab (src/lib/lab/objectives.ts).
// Validator logic, feedback wording, hint tiers and task copy are identical.
'use strict';

const A = (s, obj, field) => ((s.env.answers[obj] ?? {})[field] ?? []);
const setEq = (got, want) =>
  got.length === want.length && want.every((w) => got.includes(w));
const seqIdx = (s, tag) => s.env.seq.indexOf(tag);
/** LAST occurrence — ordering checks must judge the most recent action, not the first. */
const seqLast = (s, tag) => s.env.seq.lastIndexOf(tag);

/* ══════════════ MEDIUM MODE — 12 objectives ══════════════ */

const MEDIUM_OBJECTIVES = [
  {
    id: 'OBJ-M1', pillar: 'P1', anchor: 'C-01/02 — anatomy: producer / broker / consumer',
    title: 'Tag the anatomy',
    task: 'Six nodes on the board are UNTAGGED (pulsing outline). Click each one, then use the Classify panel to tag it as producer, broker or consumer.',
    hints: [
      'Producers EMIT (APIs, gateways, schedulers). Brokers are the named channels between them. Consumers REACT.',
      'Look at the node names: "Checkout API" and "Fleet Telemetry Gateway" emit; "media-events" and "telemetry-stream" are channels; "Payment Service" and "Analytics Ingest" react.',
      'Correct tags — Checkout API: producer · Fleet Telemetry Gateway: producer · media-events: broker · telemetry-stream: broker · Payment Service: consumer · Analytics Ingest: consumer.',
    ],
    validate: (s) => {
      const wrong = FLAG_NODES.filter((n) => (s.env.roles[n] ?? '') !== nodeById(n).kind);
      return wrong.length === 0
        ? { pass: true, why: '' }
        : { pass: false, why: `Not yet: ${wrong.map((n) => nodeById(n).label).join(', ')} ${wrong.length > 1 ? 'are' : 'is'} still untagged or mistagged. Open each node on the board and use Classify.` };
    },
    feedback: 'You can now read any event-driven topology: APIs/gateways/schedulers EMIT, named channels (queues, topics, streams) ROUTE, and services REACT. Cloud+ loves this taxonomy — next, classify messages, not just nodes.',
  },
  {
    id: 'OBJ-M2', pillar: 'P2', anchor: 'C-01 — event vs command vs query',
    title: 'Event, command, or query?',
    task: 'Six messages from the Aerolink wire are shown below. Label each one: an EVENT states a fact that happened, a COMMAND instructs one receiver to do something, a QUERY asks for data.',
    hints: [
      'Arrow prefix "→" pushes an instruction (command); "?" requests data (query); a timestamped fact with a payload is an event.',
      'If it still works when nobody is listening, it is an event. Commands need a specific receiver; queries expect a response.',
      'Answers: 1 event · 2 query · 3 command · 4 command · 5 event · 6 query.',
    ],
    validate: (s) => {
      const bad = MESSAGE_CARDS.filter((c) => (A(s, 'OBJ-M2', c.id)[0] ?? '') !== c.correct);
      return bad.length === 0
        ? { pass: true, why: '' }
        : { pass: false, why: `Re-check card(s): ${bad.map((c) => '#' + c.id.slice(1)).join(', ')}. Events state facts ("...paid {amount}"), commands instruct ("→ resize"), queries ask ("? balance").` };
    },
    feedback: 'This distinction is the soul of EDA: producers publish EVENTS and stay ignorant; commands couple you to one receiver; queries need a round-trip. Mixing them up is how teams accidentally rebuild tightly-coupled systems on top of a "bus".',
  },
  {
    id: 'OBJ-M3', pillar: 'P2', anchor: 'C-03 — queue vs topic vs stream',
    title: 'Pick the right channel',
    task: 'Three new Aerolink requirements arrived. For each, choose the channel type that fits: queue (point-to-point), topic (publish–subscribe fan-out), or stream (ordered, replayable, high-throughput).',
    hints: [
      'Count receivers: one → queue; many → topic; many + replay/order at volume → stream.',
      '"Exactly one worker" screams queue. "Twelve services each need a copy" screams topic. "Millions/s, per-device order, replayable" screams stream.',
      'Answers: c1 queue · c2 topic · c3 stream.',
    ],
    validate: (s) => {
      const bad = CHANNEL_NEEDS.filter((c) => (A(s, 'OBJ-M3', c.id)[0] ?? '') !== c.correct);
      return bad.length === 0
        ? { pass: true, why: '' }
        : { pass: false, why: `Requirement(s) ${bad.map((c) => '#' + c.id.slice(1)).join(', ')} mismatched. Queue = one consumer per message; topic = copy to every subscriber; stream = partitioned, replayable, ordered per partition.` };
    },
    feedback: 'Channel choice is the #1 exam-relevant EDA decision: queues distribute work, topics fan out facts, streams carry telemetry at scale with replay. Getting this wrong shows up later as lost fan-out or unordered analytics.',
  },
  {
    id: 'OBJ-M4', pillar: 'P2', anchor: 'C-03/04 — event lifecycle & fan-out tracing',
    title: 'Trace the photo event',
    task: 'Inject a photo.uploaded event from the Launch Pad (source: Proof-of-Delivery Uploader), watch the routing pulse, then build the delivery path below — click chips in order from producer to the last consumer.',
    hints: [
      'The Uploader publishes to ONE channel; a topic copies the event to EVERY subscriber.',
      'media-events is a topic: which three consumers subscribe to it? Order among those three does not matter.',
      'Expected: photo-uploader → media-topic → thumbnail-service / face-tag-service / notifier (any order of those three).',
    ],
    validate: (s) => {
      const injected = s.env.injected.includes('photo-uploader');
      const path = A(s, 'OBJ-M4', 'path');
      if (!injected) return { pass: false, why: 'You have not launched the event yet — use the Launch Pad on the board (source: Proof-of-Delivery Uploader).' };
      const okLen = path.length === PHOTO_PATH_FIXED.length + PHOTO_PATH_SUBS.length;
      const okHead = path[0] === PHOTO_PATH_FIXED[0] && path[1] === PHOTO_PATH_FIXED[1];
      const tail = path.slice(2);
      const okTail = okLen && setEq(tail, PHOTO_PATH_SUBS);
      return okLen && okHead && okTail
        ? { pass: true, why: '' }
        : { pass: false, why: !okLen || !okHead
            ? 'Path shape wrong: it must start photo-uploader → media-topic, then include all three subscribers. Full path is 5 nodes.'
            : 'Missing or extra subscriber: media-events fans out to ALL three subscribers (thumbnail, face-tag, notifier).' };
    },
    feedback: 'You just traced a fan-out: one fact from the Uploader, three independent reactions, zero direct coupling. In production this is why one slow consumer (say, AI tagging) never delays thumbnails — each gets its own copy.',
  },
  {
    id: 'OBJ-M5', pillar: 'P1', anchor: 'C-05 — serverless/FaaS trigger taxonomy',
    title: 'Match the trigger',
    task: 'Four new serverless functions will join the platform. Match each workload to its trigger type — choose from object-storage, HTTP/API-gateway, queue, or schedule triggers.',
    hints: [
      'Ask: what wakes the function? A file appearing? A web request? A message arriving? A clock striking 02:00?',
      'Two distractors exist (stream-poll, outbound webhook) — neither matches these four workloads.',
      'Answers: t1 object-storage · t2 HTTP · t3 queue · t4 schedule.',
    ],
    validate: (s) => {
      const bad = TRIGGER_USECASES.filter((c) => (A(s, 'OBJ-M5', c.id)[0] ?? '') !== c.correct);
      return bad.length === 0
        ? { pass: true, why: '' }
        : { pass: false, why: `Workload(s) ${bad.map((c) => '#' + c.id.slice(1)).join(', ')} mismatched. Trigger = the event source that STARTS the function.` };
    },
    feedback: 'Trigger fluency is the bridge between EDA and serverless economics: functions scale to zero and pay per invocation because SOME event starts them. On the exam, expect vendor-neutral trigger matching exactly like this.',
  },
  {
    id: 'OBJ-M6', pillar: 'P1', anchor: 'C-06 — choreography vs orchestration',
    title: 'Choreography or orchestration?',
    task: 'Two new workflows are on the whiteboard below. Pick the coordination pattern for each, then select the one TRUE statement about the two patterns.',
    hints: [
      'Does the flow need central control — order, timeouts, undo steps? That is orchestration. Independent reactions to facts? Choreography.',
      'Compensation ("if shipping fails, refund") needs someone watching the WHOLE flow — a coordinator.',
      'Answers: s1 orchestration · s2 choreography · the TRUE statement is #2.',
    ],
    validate: (s) => {
      const s1 = A(s, 'OBJ-M6', 's1')[0] === COORD_SCENARIOS[0].correct;
      const s2 = A(s, 'OBJ-M6', 's2')[0] === COORD_SCENARIOS[1].correct;
      const s3 = A(s, 'OBJ-M6', 'truth')[0] === String(COORD_TRUTH.correct);
      return s1 && s2 && s3
        ? { pass: true, why: '' }
        : { pass: false, why: 'Re-check: multi-step flows needing timeouts + compensation = orchestration (central coordinator); independent dashboard reactions = choreography. And re-read the three statements.' };
    },
    feedback: 'Knowing WHEN to add a coordinator is senior-level design: choreography scales reactions; orchestration buys you enforceable invariants (order, timeout, compensation). Aerolink’s refund saga in Hard mode builds exactly on this choice.',
  },
  {
    id: 'OBJ-M7', pillar: 'P3', anchor: 'C-08 — poison message + DLQ; incident triage',
    title: 'Incident 4123: stuck orders',
    task: 'orders-queue is backing up (depth 1,240). Open the Evidence tab → Incident 4123: identify the failing consumer and the poison message, enable a dead-letter queue on orders-queue (Inspector), then route the poison message to it.',
    hints: [
      'Metrics show Payment Service erroring at 41% — what single message fails schema validation in the queue browser?',
      'Steps: Inspector → orders-queue → enable DLQ; then Evidence → queue browser → evt-8841 → Route to DLQ.',
      'Failing consumer: Payment Service. Poison: evt-8841 ("total":"NaN"). Enable DLQ first, then route.',
    ],
    validate: (s) => {
      const consumer = A(s, 'OBJ-M7', 'consumer')[0] === 'payment-service';
      const poison = A(s, 'OBJ-M7', 'poison')[0] === 'evt-8841';
      const dlq = !!s.env.dlqEnabled['orders-queue'];
      const routed = s.env.poisonRouted;
      if (consumer && poison && dlq && routed) return { pass: true, why: '' };
      const missing = [];
      if (!consumer) missing.push('failing consumer (check metrics: which consumer errors at 41%?)');
      if (!poison) missing.push('poison message id (queue browser: which payload can NEVER parse?)');
      if (!dlq) missing.push('DLQ enabled on orders-queue (Inspector)');
      if (!routed) missing.push('poison routed to the DLQ (Evidence tab)');
      return { pass: false, why: `Still open: ${missing.join('; ')}.` };
    },
    feedback: 'That is the canonical EDA failure loop: one unparseable message + capped retries + no DLQ = whole queue starved behind head-of-line blocking. Your fix matches the runbook every cloud team uses: alarm on DLQ depth > 0, inspect, fix, reprocess.',
  },
  {
    id: 'OBJ-M8', pillar: 'P4', anchor: 'C-07 — at-least-once duplicates → idempotency',
    title: 'Stop the double charges',
    task: 'evt-9012 was redelivered and Payment Service charged the customer twice. Enable idempotency on Payment Service (Inspector), then press "Replay duplicate delivery" in the incident card and watch the duplicate counter.',
    hints: [
      'At-least-once delivery GUARANTEES occasional redeliveries — the consumer must make reprocessing harmless.',
      'Order matters: idempotency ON first, THEN replay, so the duplicate is suppressed instead of charged.',
      'Inspector → payment-service → Idempotency ON → Evidence → Replay duplicate delivery.',
    ],
    validate: (s) => {
      const idem = !!s.env.idempotency['payment-service'];
      const replay = s.env.replayDone;
      // Compare against the LAST replay so a student who replays before enabling
      // idempotency (the teaching moment) can still recover by following the feedback.
      const lastReplay = seqLast(s, 'replay-dup');
      const lastIdem = seqLast(s, 'idem:payment-service');
      const ordered = lastIdem !== -1 && lastReplay !== -1 && lastIdem < lastReplay;
      if (idem && replay && ordered) return { pass: true, why: '' };
      if (!idem) return { pass: false, why: 'Idempotency is still OFF on Payment Service (Inspector → payment-service).' };
      if (!replay) return { pass: false, why: 'Now replay the duplicate: Evidence tab → Incident 4123 → "Replay duplicate delivery".' };
      return { pass: false, why: 'You replayed BEFORE enabling idempotency — that is exactly how a second charge happens. Enable idempotency, then replay.' };
    },
    feedback: 'Idempotency converts at-least-once’s duplicate deliveries into no-ops: same event ID → same effect, once. This is the single most important consumer-side pattern in EDA — and the exam checks it in the wording "duplicates are possible, so consumers must be…".',
  },
  {
    id: 'OBJ-M9', pillar: 'P4', anchor: 'C-09 — decoupling, failure isolation',
    title: 'Cut the sync cord',
    task: 'Checkout API still calls Inventory Service synchronously over REST — one inventory hiccup cascades into checkout. In the Inspector for checkout-api, rewrite that integration onto a queue (inventory-jobs). The rewrite re-triggers Inventory Service onto the queue automatically — verify its trigger in the Inspector.',
    hints: [
      'The red dashed line on the board is the synchronous coupling. Inspector → checkout-api → "Rewrite integration".',
      'After rewiring, the consumer side is re-triggered automatically: it no longer answers REST — it reacts to queue messages.',
      'Rewrite onto inventory-jobs (queue). Then inspect inventory-service and confirm its trigger now reads queue.',
    ],
    validate: (s) => {
      const w1 = (s.env.wiring['checkout-api'] ?? []).includes('inventory-jobs');
      const w2 = (s.env.wiring['inventory-jobs'] ?? []).includes('inventory-service');
      const trig = s.env.triggers['inventory-service'] === 'trigger-queue';
      const noDirect = !s.env.directRest;
      return w1 && w2 && trig && noDirect
        ? { pass: true, why: '' }
        : { pass: false, why: !noDirect ? 'The direct REST link is still active — complete the rewrite in Inspector → checkout-api.' : w1 && w2 && !trig ? 'Wiring is right, but Inventory Service still expects REST calls — set its trigger to queue trigger.' : 'Wiring incomplete: checkout-api → inventory-jobs → inventory-service.' };
    },
    feedback: 'You replaced the platform’s last synchronous hostage link: now inventory downtime degrades stock reservation, NOT checkout. Independent failure domains + independent scaling — that is the decoupling benefit examiners phrase as "reduced interdependency".',
  },
  {
    id: 'OBJ-M10', pillar: 'P3', anchor: 'C-10 — detection: metrics & alarms',
    title: 'Arm the right alarms',
    task: 'Open the Telemetry tab. From the six candidate alarms, arm EXACTLY the three that detect event-flow failures — leave the three vanity/unrelated metrics unarmed.',
    hints: [
      'Ask each metric: "does its change tell me the EVENT FLOW is failing?" Invocations count tells volume, not health.',
      'What caught Incident 4123? Rising queue age. What told you messages failed forever? A DLQ receiving. What flagged the consumer? Its error rate.',
      'Arm: oldest-message age > 15 min · DLQ count > 0 · consumer error rate > 5%.',
    ],
    validate: (s) => {
      return setEq(s.env.alarms, ALARMS_CORRECT)
        ? { pass: true, why: '' }
        : { pass: false, why: 'Exact set required: queue age, DLQ depth, consumer error rate. Total invocations, bucket object count and cert expiry do not detect flow failures.' };
    },
    feedback: 'These three alarms are the minimum viable EDA tripwire set — they would have caught Incident 4123 in minutes instead of hours. Exams phrase this as identifying relevant monitoring for event-driven systems.',
  },
  {
    id: 'OBJ-M11', pillar: 'P4', anchor: 'C-11 — least privilege IAM (M1018/M1026)',
    title: 'Least-privilege pass',
    task: 'The Notifier carries a bloated IAM policy (it can read every bucket and admin itself). In the Inspector for notifier, trim its permissions to EXACTLY what its role needs: subscribe to media-events + publish to notifications-topic.',
    hints: [
      'Role: the Notifier CONSUMES media events and PUBLISHES customer notifications. Nothing else.',
      'Reading every bucket is T1530 territory — one compromised function could exfiltrate all delivery photos.',
      'Keep only: "subscribe to media-events" + "publish to notifications-topic".',
    ],
    validate: (s) => {
      return setEq(s.env.iam['notifier'] ?? [], IAM_NOTIFIER_CORRECT)
        ? { pass: true, why: '' }
        : { pass: false, why: 'Exact set required: subscribe to media-events + publish to notifications-topic. Uncheck s3:*, admin and publish-to-all-topics.' };
    },
    feedback: 'Least privilege contains blast radius: a compromised Notifier can now only do its job — not read every bucket (T1530) or enumerate the estate (T1526/T1580). This is Cloud+ Domain 4 security thinking applied to Domain 5 architecture.',
  },
  {
    id: 'OBJ-M12', pillar: 'P1', anchor: 'C-14 — when EDA fits vs batch',
    title: 'EDA fitness check',
    task: 'Three Aerolink workloads are proposed for migration. Decide for each: event-driven or batch?',
    hints: [
      'Event-driven = reactive, continuous, latency-sensitive. Batch = scheduled, deterministic, latency-tolerant.',
      'Fraud scoring on swipes cannot wait for a nightly run. Payroll has no latency need at all.',
      'Answers: w1 event-driven · w2 batch · w3 event-driven.',
    ],
    validate: (s) => {
      const bad = FITNESS_WORKLOADS.filter((c) => (A(s, 'OBJ-M12', c.id)[0] ?? '') !== c.correct);
      return bad.length === 0
        ? { pass: true, why: '' }
        : { pass: false, why: `Re-consider workload(s) ${bad.map((c) => '#' + c.id.slice(1)).join(', ')}. Continuous + latency-sensitive → event-driven; scheduled + deterministic → batch.` };
    },
    feedback: 'Architecture maturity is knowing when NOT to use your favorite tool: EDA buys reactivity and decoupling, batch buys simplicity and determinism. The exam tests this judgment with exactly these kinds of workload descriptions.',
  },
];

/* ══════════════ HARD MODE — 10 objectives ══════════════ */

const HARD_OBJECTIVES = [
  {
    id: 'OBJ-H1', pillar: 'P2', anchor: 'C-08/10 — multi-cause incident triage with red herrings',
    title: 'The Silent Checkout',
    task: 'Checkout revenue is dropping; the board only shows "queue depth rising". The evidence pack (Evidence tab → Silent Checkout) is noisy — two entries are red herrings. Select the THREE true root causes below, then execute the fixes in the tower: enable the DLQ, route the poison, and enable idempotency — in that runbook order.',
    hints: [
      'A root cause explains BOTH symptoms: stuck queue AND double charges. Cert expiry and replica lag explain neither.',
      'One payload can never parse (why?), one consumer reprocesses redeliveries harmfully (why?), and one missing channel feature lets the first problem loop forever.',
      'Causes: poison evt-8841 · no DLQ on orders-queue · no idempotency on payments. Fix order: DLQ → route → idempotency.',
    ],
    validate: (s) => {
      const causes = A(s, 'OBJ-H1', 'causes');
      const okCauses = setEq(causes, H1_CAUSES.filter((c) => c.good).map((c) => c.id));
      const dlq = !!s.env.dlqEnabled['orders-queue'];
      const routed = s.env.poisonRouted;
      const idem = !!s.env.idempotency['payment-service'];
      const ordered = seqIdx(s, 'dlq:orders-queue') !== -1 && seqIdx(s, 'dlq:orders-queue') < seqIdx(s, 'poison-route');
      const allFixed = dlq && routed && idem;
      if (okCauses && allFixed && ordered) return { pass: true, why: '' };
      if (!okCauses)
        return { pass: false, why: `Cause selection ${causes.length}/3: you need EXACTLY the three that explain stuck-queue + double-charges. Rejected near-misses: cert expiry and replica lag are real log lines but not causes of THIS incident.` };
      if (!dlq) return { pass: false, why: 'Fix 1: enable the DLQ on orders-queue (Inspector → orders-queue).' };
      if (!routed) return { pass: false, why: 'Fix 2: route evt-8841 to the DLQ (Evidence → queue browser). The DLQ must exist first — sequence matters: a poison cannot be routed to a nonexistent bay.' };
      if (!idem) return { pass: false, why: 'Fix 3: idempotency on Payment Service — otherwise the next redelivery double-charges again.' };
      return { pass: false, why: 'Fix order violated: the DLQ must be enabled BEFORE routing the poison (you cannot divert to a bay that does not exist).' };
    },
    feedback: 'You ran a real incident loop under noise: separate causes from red herrings, sequence fixes so each enables the next, and close both symptom classes (stuck pipeline + financial duplicates). This is Analyze/Evaluate-level Cloud+ work.',
  },
  {
    id: 'OBJ-H2', pillar: 'P4', anchor: 'C-09/03/05 — target-state topology design',
    title: 'Rebuild the blueprint',
    task: 'Aerolink’s platform team wants a written target state. Complete the six blueprint decisions below so every integration uses the right channel, trigger and batch sizing — then CHECK.',
    hints: [
      'Work distribution → queue; fan-out to 3 consumers → topic; a cron wake-up is a schedule… but Notifier reacts to a PUBLISHED event, not a clock.',
      'Sharing orders-queue between payments and inventory would make each message a coin-flip: queues deliver to ONE consumer.',
      'Cost target: batch window amortizes cold starts — batch 10. Answers: bp1 orders-queue · bp2 orders-queue · bp3 inventory-jobs · bp4 media-topic · bp5 topic subscription · bp6 batch 10.',
    ],
    validate: (s) => {
      const wrong = BLUEPRINT_SLOTS.filter((sl) => s.env.blueprint[sl.id] !== sl.correct);
      return wrong.length === 0
        ? { pass: true, why: '' }
        : { pass: false, why: `Rejected — ${wrong.length}/6 blueprint slots are wrong. Near-miss to note: routing inventory through the SHARED orders-queue would deliver each order to EITHER payments OR inventory, never both. Exact routing required.` };
    },
    feedback: 'Target-state design is the Create level: you chose channel per integration (queue for work, topic for fan-out), trigger per consumer, and batch sizing for cost. Write this on a whiteboard and you are doing a Cloud+ performance-based question by hand.',
  },
  {
    id: 'OBJ-H3', pillar: 'P1', anchor: 'C-07 — delivery semantics + compensating controls',
    title: 'Delivery semantics showdown',
    task: 'Four workloads, four guarantees. For each row choose BOTH the delivery model AND the compensating control that makes it safe. No two rows share the same answer.',
    hints: [
      'Money: duplicates are unacceptable → at-least-once + consumer-side idempotency key.',
      'A missed cache refresh self-heals (TTL) → cheapest guarantee (at-most-once) + no control. The audit ledger tolerates NEITHER loss NOR duplicates → exactly-once-equivalent via a dedupe store at the sink. Notifications must arrive → at-least-once + retry with DLQ.',
      'Answers — d1: at-least-once + idempotency key · d2: at-most-once + none · d3: exactly-once-equivalent + dedupe store · d4: at-least-once + retry/DLQ.',
    ],
    validate: (s) => {
      const bad = H3_ROWS.filter((r) => A(s, 'OBJ-H3', 'm-' + r.id)[0] !== r.model || A(s, 'OBJ-H3', 'c-' + r.id)[0] !== r.control);
      return bad.length === 0
        ? { pass: true, why: '' }
        : { pass: false, why: `Row(s) ${bad.map((r) => r.id.toUpperCase()).join(', ')} rejected — each workload needs its model AND control paired: charge=idempotent consumer, cache=acceptable loss, ledger=deduped sink, notifications=retry+DLQ.` };
    },
    feedback: 'You demonstrated theEvaluate-level truth: delivery semantics are chosen PER WORKLOAD, and the compensating control (idempotency key, dedupe store, DLQ) is what actually makes each pairing safe. Quote this table in any design review.',
  },
  {
    id: 'OBJ-H4', pillar: 'P3', anchor: 'C-11 — event injection + over-privileged consumer (T1190/T1530, M1018)',
    title: 'The over-fed function',
    task: 'A forged photo.uploaded event (812 MB "photo", an injected role_arn) entered via the public upload endpoint. In Evidence → Over-fed function: identify the attack vector and the dangerous over-privilege below; then harden — trim thumbnail-service IAM to exactly its role (Inspector) and enable schema validation on the Uploader.',
    hints: [
      'Where did the forged event ENTER the system? Not a console, not DNS — an endpoint that accepts payloads from the internet without validation.',
      'The IAM bomb: s3:* on * turns one compromised function into read-write on EVERY bucket (T1530 Data from Cloud Storage).',
      'Vector: v-inject · Over-privilege: o-s3all · IAM keep: GetObject inbox/* + publish media-events · Schema validation ON.',
    ],
    validate: (s) => {
      const v = A(s, 'OBJ-H4', 'vector')[0] === 'v-inject';
      const o = A(s, 'OBJ-H4', 'overpriv')[0] === 'o-s3all';
      const iam = setEq(s.env.iam['thumbnail-service'] ?? [], IAM_THUMB_CORRECT);
      const schema = !!s.env.schemaValidation['photo-uploader'];
      if (v && o && iam && schema) return { pass: true, why: '' };
      const missing = [];
      if (!v) missing.push('vector (what let the forged event in?)');
      if (!o) missing.push('over-privilege (which single policy line is the blast-radius bomb?)');
      if (!iam) missing.push('IAM trimmed to exactly: s3:GetObject on proof-bucket/inbox/* + publish to media-events');
      if (!schema) missing.push('schema validation enabled on the Uploader (Inspector)');
      return { pass: false, why: `Still open: ${missing.join('; ')}.` };
    },
    feedback: 'You closed an injection chain end-to-end: validate at the edge (kill forged events, cf. T1190), scope credentials so a bypassed edge still cannot roam (T1530 → contained; M1018/M1026 applied). Defense in depth, EDA edition.',
  },
  {
    id: 'OBJ-H5', pillar: 'P3', anchor: 'C-12 — cost & performance tuning',
    title: 'Cost & latency triage',
    task: 'Telemetry shows: thumbnails processed ONE at a time, media events hopping between regions, and checkout consumers cold-starting mid-rush. From the eight proposals below select EXACTLY the three correct optimizations.',
    hints: [
      'Batching amortizes invocation overhead; colocation kills cross-region hops; provisioned concurrency kills cold starts where latency matters.',
      'Beware plausible waste: max-memory-everything, extra topic hops, 90-day retention and cross-continent moves cost money or latency and fix nothing here.',
      'Correct: p-batch (1→10) · p-region (co-locate) · p-prov (provisioned concurrency for the checkout-critical consumer).',
    ],
    validate: (s) => {
      const got = A(s, 'OBJ-H5', 'opts');
      const ok = setEq(got, H5_OPTS.filter((o) => o.good).map((o) => o.id));
      return ok
        ? { pass: true, why: '' }
        : { pass: false, why: `Rejected (${got.length}/3 selected). Correct set: batching, region colocation, provisioned concurrency. Near-miss rationale: "max memory everywhere" burns cost without touching batch or cold-start patterns.` };
    },
    feedback: 'Cloud+ expects cost-aware architecture: batch windows amortize overhead, region colocation removes per-hop transfer cost/latency, and provisioned concurrency is the surgical answer to cold starts — not blanket over-provisioning.',
  },
  {
    id: 'OBJ-H6', pillar: 'P4', anchor: 'C-06 — orchestration + compensation (saga)',
    title: 'Design the refund saga',
    task: 'Refunds span three services: Payment, Inventory, Shipping. In the mission panel below: pick the coordination pattern, activate the coordinator, wire EXACTLY the three compensation events for a mid-flow failure, and enable the flow timeout.',
    hints: [
      'Multi-step + undo + timeout = orchestration. A coordinator watches the whole flow.',
      'Compensation must UNDO each completed step: reverse the charge, release the stock, cancel the dispatch. "Charge again" is not undo.',
      'Pattern orchestration · coordinator ON · comp: refund + release + cancel · timeout ON.',
    ],
    validate: (s) => {
      const g = s.env.saga;
      const ok = g.pattern === 'orchestration' && g.coordinator && g.timeout && setEq(g.comp, H6_COMP_OPTS.filter((c) => c.good).map((c) => c.id));
      return ok
        ? { pass: true, why: '' }
        : { pass: false, why: 'Rejected: needs pattern=orchestration, coordinator ON, timeout ON, and EXACTLY the three undo events (refund, release, cancel). Compensation UNDOES work — it never repeats or keeps it.' };
    },
    feedback: 'You built a saga: an orchestrated multi-service transaction where every forward step has a defined inverse. Without compensation, a failed shipping step silently leaves charged cards and reserved stock — the classic distributed-systems bug Cloud+ now tests.',
  },
  {
    id: 'OBJ-H7', pillar: 'P3', anchor: 'C-10 — observability plan: alarms + correlation + tracing',
    title: 'Build the observability plan',
    task: 'Design Aerolink’s EDA observability: map each of the five metrics below to its correct response action, then decide where a correlation ID is born and how it travels, and switch on distributed tracing.',
    hints: [
      'Volume ≠ failure: total invocations get context-only treatment. Age/DLQ/error page a human; throttles auto-scale.',
      'A correlation ID must be born at the very FIRST producer and travel ON the event itself, hop to hop.',
      'Mapping: queueage→page · dlq→page · error→page · throttle→scale · invocations→none. Origin: first producer. Propagation: event metadata headers. Tracing: ON.',
    ],
    validate: (s) => {
      const badPairs = H7_METRICS.filter((m) => (s.env.tracing.pairs[m] ?? '') !== H7_CORRECT[m]);
      const origin = s.env.tracing.origin === 'origin-producer';
      const prop = s.env.tracing.propagation === 'prop-headers';
      const tracing = s.env.tracing.enabled;
      if (badPairs.length === 0 && origin && prop && tracing) return { pass: true, why: '' };
      const parts = [];
      if (badPairs.length) parts.push(`metric→action mapping off for: ${badPairs.map((m) => H7_METRIC_LABELS[m]).join(', ')}`);
      if (!origin) parts.push('correlation ID must originate at the FIRST producer');
      if (!prop) parts.push('it must propagate in event metadata headers on every hop');
      if (!tracing) parts.push('distributed tracing still OFF');
      return { pass: false, why: parts.join('; ') + '.' };
    },
    feedback: 'This is the observability triad for any event platform: flow-health alarms (queue age, DLQ, errors), capacity alarms that auto-scale (throttles), and request-level storytelling via correlation IDs + tracing. With it, Incident 4123-class outages become minutes, not hours.',
  },
  {
    id: 'OBJ-H8', pillar: 'P2', anchor: 'C-13 — ordering guarantees & partition keys',
    title: 'Out-of-order forensics',
    task: 'Anomaly Detector received drone readings out of order (sample table in Evidence). Diagnose below: pick the correct partition key, enable stream ordering, and choose the consumer-side buffering strategy that restores per-drone order without killing parallelism.',
    hints: [
      'The evidence: readings from the SAME drone arrive interleaved. What key would scatter one drone across all partitions?',
      'Ordering exists WITHIN a partition; the key decides what lands together. A timestamp key puts everything in one hot partition.',
      'Key: device-id · ordering ON · buffer per partition before applying.',
    ],
    validate: (s) => {
      const g = s.env.stream;
      const ok = g.partitionKey === 'k-device' && g.ordering && g.buffer === 'b-partition';
      return ok
        ? { pass: true, why: '' }
        : { pass: false, why: 'Rejected: the fix is partition key = device-id (one drone → one partition → ordered), ordering enabled, and per-partition buffering on the consumer. Random keys scatter, timestamp keys hot-spot, global re-sorting defeats parallelism.' };
    },
    feedback: 'You fixed the classic stream trap: ordering is per-partition, so the PARTITION KEY is the ordering decision. Group by the entity whose order matters (the drone), and buffer small re-orderings at the consumer — parallelism preserved.',
  },
  {
    id: 'OBJ-H9', pillar: 'P1', anchor: 'C-14 — architecture judgment: go/no-go',
    title: 'Go / no-go review',
    task: 'Three migration proposals reached the architecture board. For each, give a verdict (go event-driven / no) AND the matching reason. One proposal is a textbook EDA win; two are better left alone.',
    hints: [
      'Judge by fit: fan-out to many independent consumers is EDA’s home turf; strict total ordering + relational joins is not; team readiness can veto anything.',
      'The livestream proposal fans to ~40 consumers — queue-per-consumer or REST would be a maintenance nightmare.',
      'r1: no + team readiness · r2: go + fan-out scale · r3: no + ordering/relational fit.',
    ],
    validate: (s) => {
      const bad = H9_PROPOSALS.filter((p) => A(s, 'OBJ-H9', 'v-' + p.id)[0] !== p.verdict || A(s, 'OBJ-H9', 'r-' + p.id)[0] !== p.reason);
      return bad.length === 0
        ? { pass: true, why: '' }
        : { pass: false, why: `Rejected — re-pair verdicts with reasons: low-throughput B2B + 2-person team + 3-week deadline = readiness risk; 40-consumer fan-out = EDA win; strict-order relational ledger = batch/relational territory.` };
    },
    feedback: 'Senior engineers justify architecture with fit factors: scale shape (fan-out), ordering/consistency needs, team readiness, and deadlines — not fashion. This exact judgment style appears in Cloud+ performance-based scenarios.',
  },
  {
    id: 'OBJ-H10', pillar: 'P4', anchor: 'C-15 — audit, event sourcing, archive/replay',
    title: 'Audit-grade event trail',
    task: 'Compliance wants Aerolink able to reconstruct any past decision. In the mission panel: enable the event archive, pick the retention that satisfies a financial audit record, choose the safe replay strategy, switch the ledger to event sourcing, and pick the justification that actually explains WHY.',
    hints: [
      'Financial audit records: think in years, not weeks. And replaying untested state into production consumers is how incidents #2 happen.',
      'Event sourcing stores the FACTS (events) and derives state from them — that is what makes "reconstruct any past state" possible.',
      'Archive ON · 7 years · replay to sandbox first · event sourcing ON · justification: compliance/forensics.',
    ],
    validate: (s) => {
      const g = s.env.archive;
      const ok = g.enabled && g.retention === 'ret-7y' && g.target === 'tgt-sandbox' && g.sourcing && g.justification === 'just-compliance';
      return ok
        ? { pass: true, why: '' }
        : { pass: false, why: 'Rejected: needs archive ON, 7-year retention (audit record), replay into a SANDBOX first, event sourcing ON, and the compliance/forensics justification. Cost and dashboard aesthetics are not compliance drivers.' };
    },
    feedback: 'You gave Aerolink a time machine: archived, sourced, replayable events let auditors and engineers reconstruct any past state — safely, because replay lands in a sandbox first. Retention length and replay discipline are the exam-checkable details.',
  },
];

const objectivesFor = (mode) => (mode === 'medium' ? MEDIUM_OBJECTIVES : HARD_OBJECTIVES);
