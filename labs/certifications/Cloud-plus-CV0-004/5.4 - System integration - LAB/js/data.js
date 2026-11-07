// ═══════════════════════════════════════════════════════════════════════════
// The Central Exchange — lab content data (static port)
// 1:1 transcription of the original framework lab's data modules:
//   src/lib/lab/content.ts + src/lib/lab/labdata.ts + types
// All content is SYNTHETIC TRAINING DATA on a fictional organization.
// Data only — no logic here (see engine.js / state.js / ui.js).
// ═══════════════════════════════════════════════════════════════════════════

// ── Shift briefing ──
const BRIEFING = {
  org: "Cobalt Courier (fictional parcel logistics)",
  stamp: "SYNTHETIC TRAINING DATA — FICTIONAL ORGANIZATION",
  title: "Change window: Project Interchange",
  lines: [
    "Cobalt Courier runs a hybrid estate: an on-prem DepotERP, a cloud platform (FleetHub), a SaaS CRM (ParcelCRM) and a cloud BillingSvc. Tonight's change window must wire them together so operations run seamlessly — the Cloud+ CV0-004 Objective 5.4 skillset: APIs, webhooks and message queues.",
    "You are the integration engineer on shift. You will patch the right construct onto the right flow, harden it against the three classic integration failure modes — duplicated work from retries, dead dependencies freezing their callers, and messages that never get processed — make the estate observable, and respond to live faults on the tape.",
    "Everything you see is simulated training data on a fictional company. The board is yours, engineer.",
  ],
  cert: "Maps to CompTIA Cloud+ CV0-004 · Domain 5.0 DevOps Fundamentals · Objective 5.4 (System integration: APIs, webhooks and message queues). Domain 5.0 carries 10% of the exam.",
};

// ── Mode gate cards ──
const MODE_CARDS = {
  medium: {
    tag: "SUPERVISED COMMISSIONING",
    title: "Medium — guided build-up",
    points: [
      "11 objectives introduced in build order, each a single clear bite",
      "3-tier hints freely available (they cost stars, never progress)",
      "Tolerant checks with teaching feedback on every attempt",
      "Quiz after practice; supportive tone throughout",
    ],
  },
  hard: {
    tag: "UNATTENDED CHANGE WINDOW",
    title: "Hard — incident-first free roam",
    points: [
      "9 broad multi-step challenges; 5 faults are live from the first minute",
      "Noisy evidence with red herrings; no 'where to look' markers",
      "Exact values, exact sets and ordered sequences are enforced",
      "At most ONE optional nudge, and it visibly costs score",
    ],
  },
};

// ── Objectives — Medium (11) ──
const OBJECTIVES_M = [
  {
    id: "OBJ-M1",
    title: "Match the three flows to their integration construct (drill bench).",
    detail: "Open the DRILL BENCH tab in the workbench and complete Drills 1–3: pick API, webhook or queue for each described flow.",
    pillar: "P1",
    anchor: "Objective 5.4 constructs: APIs / webhooks / message queues",
    hints: [
      "Ask for each flow: does the caller wait for an answer?",
      "Waiting = synchronous API. Push-on-event = webhook. Work-later = queue.",
      "Answers: Drill 1 → API · Drill 2 → Webhook · Drill 3 → Queue.",
    ],
    feedback:
      "The construct is chosen by WHO WAITS: a synchronous API blocks the caller, a webhook pushes without being asked, a queue parks work for later. Every integration you will ever commission starts with this question.",
    failHint: "Re-read each drill sentence: look for 'before confirming' (needs an answer), 'the instant' (push), 'bursts / when it can' (buffer).",
  },
  {
    id: "OBJ-M2",
    title: "Classify the coupling of four interactions on the drill bench.",
    detail: "Drills 4–7 ask you to classify each interaction as synchronous, webhook push, or asynchronous.",
    pillar: "P1",
    anchor: "Synchronous vs asynchronous coupling; why attackers and outages love coupled paths",
    hints: [
      "Coupling is about time, not transport: can both sides run independently?",
      "A retry loop does NOT make a call asynchronous — the caller still blocks per attempt.",
      "Answers: 4 → Synchronous · 5 → Push · 6 → Asynchronous · 7 → Synchronous.",
    ],
    feedback:
      "Coupling decides blast radius. A synchronous call drags its caller down when it fails; push and queued work degrade independently. That is why 'seamless operations' prefers decoupling wherever business logic allows.",
    failHint: "Only ONE of the four lets both sides run independently in time. Retrying while waiting is still synchronous.",
  },
  {
    id: "OBJ-M3",
    title: "Patch the bay: connect FleetHub↔DepotERP and ParcelCRM→BillingSvc with the right cords.",
    detail: "On the crossbar, click the (FleetHub → DepotERP) and (DepotERP → FleetHub) cells for the API and webhook cords, and (ParcelCRM → BillingSvc) for the queue trunk. Then set each channel's cord type in its workbench faceplate.",
    pillar: "P1",
    anchor: "APIs / webhooks / queues as the three wiring options between systems",
    hints: [
      "Each planned flow is one cell on the crossbar: CH-1 FleetHub→DepotERP, CH-2 DepotERP→FleetHub, CH-3 ParcelCRM→BillingSvc.",
      "Click the marked cells to drop the cords, then confirm the cord type inside each channel's faceplate.",
      "Valid cells: (fleet,depot) API cord · (depot,fleet) webhook cord · (crm,bill) queue trunk.",
    ],
    feedback:
      "You just wired the same two systems twice with different constructs — that is normal. CH-1 and CH-2 are opposite directions with opposite semantics: callers wait on CH-1, DepotERP pushes on CH-2.",
    failHint: "A cell must be clicked to patch the cord AND the cord type must match the channel's construct in the faceplate.",
  },
  {
    id: "OBJ-M4",
    title: "Diagnose ROLL-A: why did order ORD-30188 ship twice?",
    detail: "The board just went live and ROLL-A fired on CH-1. Open its evidence roll in the tape room, read the gateway and ERP tapes, then select the root cause.",
    pillar: "P2",
    anchor: "Failure mode: retry duplication without idempotency (courseware lab: 'Make retries duplicate the work')",
    hints: [
      "Compare the two 201 responses against the request id.",
      "The same request id appears twice within one second — what distinguishes a retry from a new order?",
      "Cause: a retried call re-did the work — no idempotency key.",
    ],
    feedback:
      "A 504 plus an automatic retry is normal network life. Without an idempotency key, DepotERP cannot tell 'second attempt of sh-8841' from 'new order', so it ships twice. Observability caught it; the fix is a protocol change, not a restart.",
    failHint: "One request id, two creates, 400 ms apart — the gateway did not break, the protocol has no duplicate guard.",
  },
  {
    id: "OBJ-M5",
    title: "Make retries safe on CH-1 (faceplate: Orders Sync).",
    detail: "Set the call timeout to 3 seconds, enable the idempotency key header, switch the retry policy to exponential backoff + jitter, and cap retries at 3.",
    pillar: "P4",
    anchor: "Mitigation: idempotency keys + backoff/jitter + retry cap",
    hints: [
      "Four settings on the CH-1 faceplate: the timeout select, the header switch, the policy select, the cap select.",
      "Immediate retries herd like synchronized stampedes — jitter breaks the pattern.",
      "Set: Timeout = 3 seconds · Idempotency key ON · Retry = Exponential backoff + jitter · Max retries = 3.",
    ],
    feedback:
      "Now a replayed sh-8841 gets the same reservation back — safe. Cap + backoff bounds amplification during real outages. This is the official 5.4 lab pair 'retries duplicate the work → make them safe'.",
    failHint: "Timeout '3 seconds', idempotency ON, policy 'Exponential backoff + jitter', cap '3' — four separate controls.",
  },
  {
    id: "OBJ-M6",
    title: "Stop the dead dependency: diagnose ROLL-B and unfreeze checkout.",
    detail: "ROLL-B fired on CH-1. Read the telemetry snapshot and checkout config dump, pick the root cause, then set a 2 s dependency timeout and enable the circuit breaker with cached fallback.",
    pillar: "P2",
    anchor: "Failure mode: dead dependency freezing its caller (courseware lab: 'Stop a dead dependency from taking down its caller')",
    hints: [
      "61 threads parked in 'await recsvc' with timeout: 0 tells the story.",
      "The fix is not 'restart recsvc' — it is making the caller survive dependency death.",
      "Cause: dead dependency called inline without timeout. Set depTimeout 2s, breaker ON, fallback ON.",
    ],
    feedback:
      "This is a cascading failure: an inline call with no timeout converts one dead service into a frozen checkout. Timeout bounds the wait, the breaker stops calling entirely, the fallback keeps the business running — degraded but alive.",
    failHint: "Select the cause on ROLL-B, then move three controls on the CH-1 faceplate: depTimeout '2 seconds', breaker ON, fallback ON.",
  },
  {
    id: "OBJ-M7",
    title: "Make the estate observable: wire all four CH-4 probes with the guided thresholds.",
    detail: "On the CH-4 Telemetry faceplate enable the API, webhook, queue-lag and DLQ probes and set each threshold to the value the shift lead prescribed (2% / 98% / 300 s / 0).",
    pillar: "P3",
    anchor: "Detection: data sources (gateway logs, delivery logs, queue metrics, DLQ) and thresholds",
    hints: [
      "Four switch + threshold pairs, one per integration health signal.",
      "Queue depth lies during batch windows — that is why the probe watches the OLDEST message age.",
      "Set thresholds: 2% · 98% · 300 s · 0.",
    ],
    feedback:
      "You now have the standard integration detection surface: success rates for synchronous and push channels, oldest-message age for queues, DLQ depth for silent failures. Every later alert you triage rides on these signals.",
    failHint: "Enable all four probes and match each threshold exactly: 2 · 98 · 300 · 0.",
  },
  {
    id: "OBJ-M8",
    title: "Triage the four paged alerts, then harden the failing webhook channel.",
    detail: "Open the alert stack in the tape room and select the one real integration failure. Then fix the channel it points to on the CH-2 faceplate: current callback URL, HMAC signature verification, event-ID dedupe, and the delivery rate cap.",
    pillar: "P3",
    anchor: "True vs false positives; remediation follows detection (webhook signature, replay protection, rate caps)",
    hints: [
      "Cross-check each alert against a benign explanation: threshold, schedule, or marketing event.",
      "A scheduled batch window LEGITIMATELY raises queue depth; a marketing blast LEGITIMATELY raises latency.",
      "The true failure is the 91% webhook delivery — then on CH-2: endpoint '/hooks/shipment-status (current)', signature ON, dedupe ON, rate cap ON.",
    ],
    feedback:
      "Detection tuning is knowing the environment's rhythms — batch depth and marketing latency are patterns, 91% delivery is a failing push channel. And triage without remediation is only half the job: authenticate the callback, dedupe replays, cap the storm.",
    failHint: "Pick the 91% webhook delivery alert, then on CH-2 set: endpoint '(current)', Verify HMAC ON, Event-ID dedupe ON, Rate-cap ON.",
  },
  {
    id: "OBJ-M9",
    title: "Diagnose ROLL-D and cure the poisoned billing queue.",
    detail: "ROLL-D fired on CH-3. Read the queue tape, select the root cause, then configure the cure on the CH-3 faceplate: DLQ on, DLQ after 3 attempts, explicit acks, producer-fix schema handling, replay after fix.",
    pillar: "P2",
    anchor: "Failure mode: poison messages; mitigations: DLQ, explicit acks, schema contract + replay",
    hints: [
      "Consumers are healthy; the oldest message has receive_count 10,404 — it is not a flood, it is ONE message.",
      "currency: null from a producer deployed yesterday: producer bug, consumer too strict.",
      "Cause: poison message. Then: DLQ ON · after 3 · explicit acks · producer-fix handling · replay after fix.",
    ],
    feedback:
      "A poison message converts one producer bug into total queue outage: the queue head is stuck, so even healthy events age out. DLQ parks the bad one, explicit acks let the broker redeliver safely, and the producer fix plus replay restores the revenue flow.",
    failHint: "Cause on ROLL-D, then five CH-3 settings: DLQ ON, after 3, explicit acks, 'Producer fixed…' handling, replay after fix.",
  },
  {
    id: "OBJ-M10",
    title: "Respond to ROLL-E: the leaked integration key.",
    detail: "The scanner found an API key committed 8 months ago, and the usage tape shows replay from an unknown network. Select the root cause, order the five response steps on the security desk, and move CH-1's credential source to the secret store.",
    pillar: "P4",
    anchor: "Integration security: credential hygiene (ATT&CK T1552.001 lens, M1017/M1022)",
    hints: [
      "Containment before paperwork: which step stops the bleeding first?",
      "Order: revoke/rotate → audit what it did → secret store → restrict sources → prevent recurrence.",
      "Sequence: rotate, audit, vault, restrict, scan.",
    ],
    feedback:
      "Deleted commits do not delete git history — the key was live for 8 months. Containment (rotate) precedes investigation (audit), structural fix (vault) precedes hardening (restrict, scan). This is objective 5.2's lesson landing inside 5.4.",
    failHint: "Click the five steps in response order: rotate, audit, vault, restrict, scan — then flip CH-1 auth to 'Secret-store token'.",
  },
  {
    id: "OBJ-M11",
    title: "Run the sign-off sweep and bring every lamp to green.",
    detail: "Fire the end-to-end drills (test order via API, test webhook, test billing event) from the bay, and confirm all four channel lamps show green.",
    pillar: "P3",
    anchor: "Verification: end-to-end probes prove 'seamless cloud operations'",
    hints: [
      "Green lamps need correct faceplates on CH-1 through CH-4 (M5, M6, M9, M10, M7).",
      "Fire the drill from the bay panel, then check the lamp strip.",
      "All four lamps green + drills fired = objective passed.",
    ],
    feedback:
      "Verification closes the loop: you did not just configure — you proved traffic flows and failure modes are armed. 'Seamless operations' is a demonstrated property, not an assumed one.",
    failHint: "Any amber/red lamp means a faceplate setting is still missing — open that channel's tab.",
  },
];

// ── Objectives — Hard (9) ──
const OBJECTIVES_H = [
  {
    id: "OBJ-H1",
    title: "Write the partner-launch integration brief (three patterns + resilience).",
    detail: "Three new integrations arrive Monday. On the drill bench, choose construct and resilience setting for each of the three scenarios.",
    pillar: "P1",
    anchor: "Objective 5.4: pattern selection per interaction semantics",
    nudge: "Bursts-buffer · push-authenticates · gate-calls-protect-itself.",
    feedback:
      "Pattern selection is a business-semantics decision: who waits, who pushes, who buffers. Resilience settings are not add-ons — a webhook without signature verification is an open endpoint; an inline payment call without a breaker is a scheduled outage.",
    failHint: "All six selections must be exact: queue+scale, webhook+verify, api+breaker.",
  },
  {
    id: "OBJ-H2",
    title: "Black-Friday meltdown triage: name all three root causes AND identify the noise.",
    detail: "Five faults are live. Diagnose the three root causes on ROLLS A, B and C, and identify which tape items are legitimate environment noise (one selection).",
    pillar: "P2",
    anchor: "Recognize failure modes in raw evidence; red-herring discrimination",
    nudge: "The scheduled batch import and the tagged load test are the environment breathing — the three remaining faults are real (CH-1 twice, CH-2 once).",
    feedback:
      "Triage discipline: the duplicate shipment is a protocol gap (no idempotency), the freeze is an unbounded inline call, the storm is endpoint drift amplified by retries — while batch imports and tagged load tests are the environment breathing. Name the cause precisely or the fix will be wrong.",
    failHint: "Causes: dup-retry (A), dead-dep (B), endpoint-drift (C) — plus the noise identification selection.",
  },
  {
    id: "OBJ-H3",
    title: "Wire the exchange and apply the full remediation set across CH-1, CH-2 and CH-3.",
    detail: "Patch the three planned cords on the crossbar (FleetHub→DepotERP as API, DepotERP→FleetHub as webhook, ParcelCRM→BillingSvc as queue trunk) and bring every faceplate setting to its hardened value: CH-1 (auth, timeout, idempotency, backoff, cap, dep-timeout, breaker, fallback), CH-2 (endpoint, signature, dedupe, rate cap), CH-3 (delivery, acks, DLQ, cap, schema, replay).",
    pillar: "P4",
    anchor: "Mitigation set: idempotency, breaker, DLQ, signature verification, rate caps",
    nudge: "Every switch ON, every select at the hardened option; CH-2's endpoint must leave the retired v1 URL.",
    feedback:
      "This is the 5.4 mitigation catalog in one move: make retries safe, isolate dead dependencies, park poison, authenticate pushes, cap amplification. Each control answers a concrete failure mode you diagnosed in H2.",
    failHint: "One mismatch keeps this red — walk the faceplates tab by tab and compare every control.",
  },
  {
    id: "OBJ-H4",
    title: "Tune the detection plane yourself: all four probes with exact thresholds.",
    detail: "No prescribed values this time. Enable all CH-4 probes and set the four thresholds to the values that catch real degradation without paging on scheduled batch windows or single blips.",
    pillar: "P3",
    anchor: "Detection engineering: threshold selection, false-positive elimination",
    nudge: "The batch window runs ~20 min and single blips recover in <1 min — think percentile-of-time, not single sample.",
    feedback:
      "2% / 98% / 300 s / 0 is a tuned baseline: tight enough to catch drift and jams, loose enough to ride out blips and scheduled batches. Detection quality is measured by pages-per-real-incident, not by alert count.",
    failHint: "Exact values: 2 · 98 · 300 · 0, all probes enabled.",
  },
  {
    id: "OBJ-H5",
    title: "Alert triage: exactly three of eight paged alerts are real — pick them and classify each.",
    detail: "Eight alerts. Select the three true integration failures and assign each the correct failure-mode class.",
    pillar: "P3",
    anchor: "True vs false positives; classification before remediation",
    nudge: "Batch windows, tagged load tests, self-recovered blips, sub-threshold lag and marketing spikes are all explainable.",
    feedback:
      "Classification drives the playbook: duplicate execution → idempotency; cascading failure → breaker; webhook storm → endpoint + rate cap. Misclassifying noise as signal burns change windows; misclassifying signal as noise burns customers.",
    failHint: "ha, hb, hc are the true positives — each needs its class: dup, cascade, storm.",
  },
  {
    id: "OBJ-H6",
    title: "Poison-message forensics: fix, replay, and prevent.",
    detail: "On ROLL-D evidence: pick the root cause, choose the schema fix, the replay strategy and the prevention control.",
    pillar: "P2",
    anchor: "Queue failure analysis: poison messages, DLQ policy, schema contracts",
    nudge: "The producer deployed yesterday; the consumer is strict. Both sides move, and CI owns prevention.",
    feedback:
      "Fixing only the consumer hides the producer bug; replaying before the fix re-poisons the queue; and without contract tests the next deploy repeats this. Root cause → full fix → verified replay → structural prevention is the complete loop.",
    failHint: "poison-msg + producerDefault + afterFix + contract.",
  },
  {
    id: "OBJ-H7",
    title: "Key-breach response, in order — and structurally fixed.",
    detail: "ROLL-E: order the five response steps exactly, and move CH-1's credential source to the secret store.",
    pillar: "P4",
    anchor: "Integration security incident handling: containment → audit → hardening (T1552.001, M1022/M1017)",
    nudge: "Stop the bleeding before you write the report.",
    feedback:
      "Sequence encodes priorities: rotate contains, audit scopes, vault removes the class of problem, restrict shrinks the surface, scanning prevents recurrence. Same steps out of order leak more data while you audit.",
    failHint: "Exact order: rotate, audit, vault, restrict, scan — plus CH-1 auth to secret-store token.",
  },
  {
    id: "OBJ-H8",
    title: "Residual-risk memo: pick the four controls that answer the named risks.",
    detail: "Four residual risks are named on the security desk. Select exactly the four controls that address them and nothing else.",
    pillar: "P4",
    anchor: "Mitigation selection and residual risk; control–risk fit",
    nudge: "One control per risk: duplicate work, frozen callers, plugged queues, committed keys.",
    feedback:
      "Control–risk fit is the skill: idempotency answers double-apply, breakers answer dead dependencies, DLQ runbooks answer poison, scanning answers committed secrets. Spare keys, raised caps and disabled retries answer nothing — they add risk.",
    failHint: "The four controls map one-to-one onto the four named risks.",
  },
  {
    id: "OBJ-H9",
    title: "Capstone: bring the whole exchange green and run the sign-off sweep.",
    detail: "With all five faults live, apply your remediations, fire the end-to-end drills and get all four lamps green. Efficiency counts: every change you make is logged.",
    pillar: "P3",
    anchor: "Verification under active faults; efficient, deliberate change control",
    nudge: "Fix causes, not symptoms: three faceplates plus the drills — that is all the board needs.",
    feedback:
      "Under an active injector you proved the estate survives its known failure modes and returns to green — the definition of seamless operations. Note your move count: deliberate change control is an exam skill and a career skill.",
    failHint: "All four lamps green and drills fired — H2–H7 fixes done precisely, nothing extra.",
  },
];

// ── Knowledge check — Medium (QCM discipline: length-matched options,
//    correct index rotation M = 2,0,3,1,2,0) ──
const QUIZ_M = [
  {
    id: "q1",
    topic: "Pattern selection — the three wires",
    prompt: "Checkout must know the stock level BEFORE it can confirm an order. Which construct fits?",
    options: [
      "A webhook push event",
      "A scheduled batch export",
      "A synchronous API call",
      "A queued work item",
    ],
    answer: 2,
    explain:
      "The next step depends on the answer inside the same interaction, so the caller must block: a synchronous API. A webhook or queued item delivers information later — neither can gate the commit — and a scheduled export is far too slow.",
  },
  {
    id: "q2",
    topic: "Idempotency and safe retries",
    prompt: "Why do blind retries create duplicate shipments?",
    options: [
      "Because the receiver cannot tell retries apart",
      "Because the gateway re-routes the order",
      "Because the network drops the very first attempt",
      "Because the ERP reorders stock on its own",
    ],
    answer: 0,
    explain:
      "Retries are healthy client behavior; the failure is protocol-level. Without an idempotency key the receiver treats attempt #2 as a brand-new operation. The gateway merely passed the call through, the first attempt succeeded (201), and the ERP does not invent orders.",
  },
  {
    id: "q3",
    topic: "Pattern selection — the three wires",
    prompt: "A system calls YOUR registered URL the moment an event happens; you never poll. What is this?",
    options: ["A cron job", "A health probe", "A queue worker", "A webhook"],
    answer: 3,
    explain:
      "That inverted control flow — you register a callback URL and the source pushes to you — is the webhook model. A cron job polls on a timer, a probe checks health, a queue worker pulls from a buffer; none of them get pushed to.",
  },
  {
    id: "q4",
    topic: "Cascading failure isolation",
    prompt: "A dead recommendation service froze checkout. What is the correct hardening?",
    options: [
      "Restart the recsvc service often",
      "Timeouts, breakers, fallbacks",
      "Add more checkout replicas",
      "Retry checkout much faster",
    ],
    answer: 1,
    explain:
      "The cascade happened because the caller waited unbounded on a dead peer. Bound the wait (timeout), stop calling when it is dead (breaker), keep serving degraded (fallback). Restarts treat the symptom, and replicas or faster retries just amplify load onto a dead dependency.",
  },
  {
    id: "q5",
    topic: "Queue delivery guarantees",
    prompt: "A billing queue delivers at-least-once. What must its consumers be able to do?",
    options: [
      "Process each message exactly once",
      "Guarantee strict ordering",
      "Tolerate duplicate deliveries",
      "Never go offline at all",
    ],
    answer: 2,
    explain:
      "At-least-once means duplicates are possible by design, so consumers defend themselves with idempotent processing or event-ID dedupe. 'Exactly once' is not a guarantee you can buy from the broker, ordering is not promised by at-least-once, and consumers inevitably have downtime.",
  },
  {
    id: "q6",
    topic: "Credential hygiene",
    prompt: "Where do integration API keys belong?",
    options: [
      "In a secret store with rotation",
      "In a committed config file",
      "In the database connection string",
      "In a gitignored repo file",
    ],
    answer: 0,
    explain:
      "A secret store issues short-lived, rotatable credentials. Git history is effectively forever, gitignored files still land in builds and backups, and connection strings leak through logs and support tickets — the ROLL-E incident is what happens otherwise (ATT&CK T1552.001 lens).",
  },
];

// ── Knowledge check — Hard (rotation H = 1,3,0,2,1,3,0) ──
const QUIZ_H = [
  {
    id: "h1",
    topic: "Retry duplication diagnosis",
    scenario: "Gateway tape: POST /v1/shipments req=sh-8841 → 504, then two 201 responses 400 ms apart, two shipments for ORD-30188.",
    prompt: "Root cause and first fix?",
    options: [
      "Gateway outage — fail over now",
      "Unsafe retries — add an idempotency key",
      "Queue reordering — go at-most-once",
      "Clock drift — resync NTP across the nodes",
    ],
    answer: 1,
    explain:
      "Same request id, two creates: the receiver had no duplicate guard. Failover treats a non-existent outage, at-most-once loses work, and NTP is irrelevant at one-second granularity; the protocol fix (idempotency key) makes retries safe by construction.",
  },
  {
    id: "h2",
    topic: "Cascading failure diagnosis",
    scenario: "Checkout p99 31 s; recsvc /health DOWN since a 10:57 deploy; 61 threads parked in 'await recsvc', timeout: 0 in config.",
    prompt: "Failure pattern and remedy?",
    options: [
      "Database overload — add read replicas",
      "Memory leak — restart the checkout",
      "Webhook storm — cap the deliveries",
      "Cascading call — timeout and breaker",
    ],
    answer: 3,
    explain:
      "A dead inline dependency with timeout:0 converts one outage into a caller outage (cascading failure). Bound the wait, trip the breaker, degrade gracefully. The evidence points at recsvc — not the database, not memory, and no webhook is involved.",
  },
  {
    id: "h3",
    topic: "Webhook storm diagnosis",
    scenario: "Delivery tape: 41,206 POSTs to /hooks/shipment-status-v1 in 15 min, every response 410 Gone; CHG-2291 migrated the endpoint yesterday.",
    prompt: "What happened, and which TWO controls answer it?",
    options: [
      "Endpoint drift — repoint URL and cap",
      "Attacker flood — block the source",
      "CRM outage — pause the CRM integration",
      "DNS flap — pin the record set",
    ],
    answer: 0,
    explain:
      "410 Gone on every attempt plus a migration ticket is endpoint drift, not attack: an attacker cannot produce a coherent 410 from a retired route, the CRM itself is clearly working, and DNS was never mentioned. The storm is the sender's retry policy amplifying the drift — fix the URL and cap/route repeated failures.",
  },
  {
    id: "h4",
    topic: "Poison message diagnosis",
    scenario: "Queue: depth 12,480, oldest 3 h 11 m, 4 healthy consumers, msg evt-77121 receive_count=10,404, error CurrencyRequired.",
    prompt: "Diagnosis and cure?",
    options: [
      "Consumer outage — redeploy consumers",
      "Burst flood — add more consumers",
      "Poison message — DLQ, fix, replay",
      "DLQ overflow — enlarge the DLQ",
    ],
    answer: 2,
    explain:
      "Healthy consumers + ONE message with 10k receive counts = a poison message plugging the queue head. Redeploying healthy consumers and adding more changes nothing, and the DLQ is empty by definition (the message never got there). The cure parks it (DLQ), removes the cause (producer fix) and restores data (verified replay).",
  },
  {
    id: "h5",
    topic: "True vs false positives",
    scenario: "Alert: API success 96.8% for 20 min. Context: the scheduled batch import window runs 22:00–23:30 and it is now 22:40; your alert threshold is a 2% drop.",
    prompt: "Decision?",
    options: [
      "True positive — page the on-call right now",
      "False positive — suppress for the window",
      "True positive — restart the ERP",
      "False positive — delete the rule",
    ],
    answer: 1,
    explain:
      "Scheduled, explainable degradation is a false positive — but you suppress it for the window and verify it ends on schedule rather than ignoring it. Paging restarts nothing real; deleting the rule throws away real coverage. Tuning (window-aware suppression) is the engineering answer.",
  },
  {
    id: "h6",
    topic: "Key-breach response order",
    scenario: "Scanner: api_key in src/billing/client.py, commit 8 months old, key still active. Usage tape: 212 calls from 198.51.100.77 at 03:14 UTC.",
    prompt: "First two response actions, in order?",
    options: [
      "Audit usage, then write the report",
      "Rewrite git history, then rotate",
      "Move to vault, then restrict sources",
      "Revoke/rotate the key, then audit",
    ],
    answer: 3,
    explain:
      "Containment precedes investigation: every minute the key stays live is more exposure. History rewrites, vaults and restrictions come after the bleeding stops — and never really delete a leaked secret.",
  },
  {
    id: "h7",
    topic: "Pattern selection under bursts",
    scenario: "New partner integration: 40k devices emit pings in bursts; your API rate-caps at 500 rps; analytics must not lose pings.",
    prompt: "Construct and why?",
    options: [
      "Message queue — buffer absorbs bursts",
      "Synchronous API — simplest to reason about",
      "Webhook — the devices push instantly",
      "Rate cap — raise it to 50,000 rps",
    ],
    answer: 0,
    explain:
      "Unpredictable bursts against a capped, rate-limited API is exactly the queue use case: decouple in time, absorb the peak in the buffer, scale consumers on depth. A synchronous API pushes the cliff into checkout, a webhook still lands on a capped endpoint, and a raised cap just moves the cliff.",
  },
];

// ── Glossary (card catalog) ──
const GLOSSARY = [
  { term: "API", def: "Contract that lets one program request work or data from another in a structured call." },
  { term: "Synchronous coupling", def: "Caller blocks until the callee answers — fast to reason about, fragile under load." },
  { term: "Webhook", def: "Registered callback URL that a server pushes an HTTP request to when an event fires." },
  { term: "Message queue", def: "Buffer holding messages between producer and consumer so they run independently in time." },
  { term: "Producer / Consumer", def: "Writer of messages to a queue / reader that processes them." },
  { term: "At-least-once delivery", def: "Broker guarantee that messages arrive at least once — duplicates are possible by design." },
  { term: "Idempotency key", def: "Unique token a client sends so the receiver can recognize a retried operation and not do it twice." },
  { term: "Exponential backoff + jitter", def: "Retries with growing, randomized waits so a struggling dependency can recover." },
  { term: "Circuit breaker", def: "Wrapper that stops calling a failing dependency for a window ('trips open') to shed load." },
  { term: "Fallback / graceful degradation", def: "Substitute answer (e.g., cached data) served while a dependency is unavailable." },
  { term: "Dead-letter queue (DLQ)", def: "Side queue where repeatedly-failing messages are parked for inspection instead of blocking." },
  { term: "Poison message", def: "Message that always fails processing; without a DLQ it can jam the whole queue." },
  { term: "Rate limiting / quota", def: "Cap on how many requests a caller may make per time window." },
  { term: "Secret store", def: "Vault service that issues and rotates credentials so keys never sit in source code." },
  { term: "Queue depth / lag", def: "Number of waiting messages / age of the oldest one — the primary queue health signals." },
];

// ── Debrief (handover notes) ──
const DETECTION_TABLE = [
  {
    construct: "API channel",
    sources: "Gateway access logs, app logs, latency percentiles, synthetic probes",
    logic: "alert when success drops >2% for 10 min; alert when the same request id is seen twice with side effects",
  },
  {
    construct: "Webhook channel",
    sources: "Delivery logs (attempts, status per endpoint), delivery success rate",
    logic: "alert when delivery success <98% over 15 min; alert when attempts-per-event > 20 or any endpoint 410s",
  },
  {
    construct: "Queue channel",
    sources: "Depth, oldest-message age, per-message receive counts, DLQ depth",
    logic: "alert when oldest >300 s; alert when receive-count >5 without ack; alert on ANY DLQ arrival",
  },
  {
    construct: "Credential plane",
    sources: "Secret-scanner reports, key usage logs (source, ASN, volume)",
    logic: "alert on keys used from unknown sources; alert on any committed credential pattern",
  },
];

const MITIGATION_LIST = [
  { name: "Idempotency keys on all write endpoints", ids: "CV0-004 5.4 pattern" },
  { name: "Retries: exponential backoff + jitter + small cap", ids: "CV0-004 5.4 pattern" },
  { name: "Timeouts + circuit breakers + fallback on inline dependencies", ids: "CV0-004 5.4 pattern" },
  { name: "DLQ routing after capped attempts + replay runbook", ids: "CV0-004 5.4 pattern" },
  { name: "Webhook HMAC signature verification + event-ID dedupe + rate caps", ids: "CV0-004 5.4 · ATT&CK M1037" },
  { name: "Least-exposure & segmentation for internal APIs", ids: "ATT&CK M1035 / M1030" },
  { name: "Secret-store issuance, rotation, pre-commit scanning, least-privilege key files", ids: "ATT&CK M1022 / M1017 / M1036 / M1041" },
  { name: "Audit trails on integration traffic and key usage", ids: "ATT&CK M1047" },
];

const BLUE_TAKEAWAYS = [
  "Choose constructs by who waits — then harden the chosen construct for its specific failure modes.",
  "Retries, timeouts and breakers are one system: caps bound amplification, breakers isolate death, fallbacks keep business running.",
  "The queue's truth lives in oldest-message age and receive counts, not depth alone.",
  "Any DLQ arrival is silent data loss in progress — zero-tolerance alerting is correct.",
  "Detection must know the environment's scheduled rhythms, or it will cry wolf every night.",
];

const RED_TAKEAWAYS = [
  "Integration surfaces are attack surface: a public callback URL without signature verification accepts anyone's POST.",
  "A leaked integration key is a valid-credential foothold — attackers replay keys from new networks (T1550.001 lens).",
  "Keys committed to source control are durable finds for attackers scanning repos (T1552.001; real tooling like AADInternals and Agent Tesla harvests such files).",
  "Retry and webhook mechanics can be weaponized for service exhaustion — floods of legit-looking traffic that exhaust threads (T1499.002 lens).",
  "Exposed, unpatched integration endpoints are classic entry points (T1190 lens) — rate caps and segmentation limit blast radius.",
];

const LINKS = [
  { label: "CompTIA Cloud+ (CV0-004) certification page", href: "https://www.comptia.org/en-us/certifications/cloud" },
  { label: "MITRE ATT&CK T1552.001 — Unsecured Credentials: Credentials In Files", href: "https://attack.mitre.org/techniques/T1552/001/" },
  { label: "MITRE ATT&CK T1550.001 — Application Access Token", href: "https://attack.mitre.org/techniques/T1550/001/" },
  { label: "MITRE ATT&CK T1499.002 — Service Exhaustion Flood", href: "https://attack.mitre.org/techniques/T1499/002/" },
  { label: "MITRE ATT&CK T1190 — Exploit Public-Facing Application", href: "https://attack.mitre.org/techniques/T1190/" },
];

// ── Ambient tape templates ──
const TAPE_OK = [
  "POST /v1/shipments 201 (11ms) req=sh-####",
  "hook shipment-status delivered 200 (210ms) evt=st-####",
  "billing evt ack (evt-####) depth 12",
  "probe /healthz fleet-a7 200 (3ms)",
  "POST /v1/shipments 201 (14ms) req=sh-####",
  "hook delivery signed+deduped ok evt=st-####",
  "consumer batch processed 24 events (evt-####…)",
];
const TAPE_NOISE = [
  "batch price import started (scheduled, 22:00 window)",
  "loadtest-42 burst from 10.30.9.9 (tagged, dev)",
  "marketing blast 14:00 — read-replica CPU spike (expected)",
  "502 blip on edge-2 — self-recovered in 40s",
];
const TAPE_FAULT = {
  inc1: [
    { text: "504 upstream_timeout POST /v1/shipments req=sh-8841", level: "bad" },
    { text: "RETRY POST /v1/shipments req=sh-8841 → 201 (DUPLICATE WORK)", level: "bad" },
    { text: "support TCK-5567: customer reports two boxes for ORD-30188", level: "bad" },
  ],
  inc2: [
    { text: "checkout p99 24.1s — threads parked 'await recsvc'", level: "bad" },
    { text: "recsvc /health DOWN since 10:58 deploy", level: "bad" },
    { text: "thread pool 100% — new checkouts queueing", level: "bad" },
  ],
  inc3: [
    { text: "POST /hooks/shipment-status-v1 → 410 Gone (attempt ####)", level: "bad" },
    { text: "delivery attempts 41,206 in 15 min — storm in progress", level: "bad" },
  ],
  inc4: [
    { text: "error CurrencyRequired invoice=INV-4411 (retry 10,404)", level: "bad" },
    { text: "queue billing.ledger depth 12,480 oldest 3h11m", level: "warn" },
  ],
  inc5: [
    { text: "scanner: api_key pattern in src/billing/client.py (still active)", level: "bad" },
    { text: "ck_live_9f27 used from 198.51.100.77 ×212 (unknown ASN)", level: "bad" },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// Environment data (1:1 from labdata.ts — all SYNTHETIC)
// ═══════════════════════════════════════════════════════════════════════════

const SYSTEMS = [
  { key: "depot", label: "DepotERP", tag: "on-prem ERP", side: "both" },
  { key: "fleet", label: "FleetHub", tag: "cloud platform", side: "both" },
  { key: "crm", label: "ParcelCRM", tag: "SaaS CRM", side: "row" },
  { key: "bill", label: "BillingSvc", tag: "cloud service", side: "col" },
];

const CHANNELS = [
  {
    id: "ch1", lamp: "CH-1", name: "Orders Sync", construct: "API", cordType: "api",
    from: "fleet", to: "depot", fromLabel: "FleetHub", toLabel: "DepotERP",
    blurb: "Checkout calls the ERP synchronously to reserve stock before committing an order.",
  },
  {
    id: "ch2", lamp: "CH-2", name: "Status Push", construct: "Webhook", cordType: "webhook",
    from: "depot", to: "fleet", fromLabel: "DepotERP", toLabel: "FleetHub",
    blurb: "DepotERP pushes a shipment-status event to FleetHub the moment a status changes.",
  },
  {
    id: "ch3", lamp: "CH-3", name: "Billing Ledger", construct: "Queue", cordType: "queue",
    from: "crm", to: "bill", fromLabel: "ParcelCRM", toLabel: "BillingSvc",
    blurb: "Billing events queue up and are consumed at the consumer's own pace.",
  },
  {
    id: "ch4", lamp: "CH-4", name: "Telemetry Feed", construct: "Observability", cordType: null,
    from: "all", to: "telemetry", fromLabel: "All channels", toLabel: "Telemetry",
    blurb: "Health probes and gauges that make the integrations observable — your detection surface.",
  },
];

const CORD_CELL = {
  ch1: { row: "fleet", col: "depot" },
  ch2: { row: "depot", col: "fleet" },
  ch3: { row: "crm", col: "bill" },
};

// Workbench faceplates — every switch and jack a student can move.
const FIELDS = {
  ch1: [
    {
      key: "ch1.cord", label: "Cord type", kind: "select",
      options: [
        { value: "api", label: "API cord (synchronous call)" },
        { value: "webhook", label: "Webhook cord (event push)" },
        { value: "queue", label: "Queue trunk (buffered)" },
      ],
      correct: "api",
      teach: "Checkout needs the reservation answer BEFORE it commits — that is a synchronous API call.",
    },
    {
      key: "ch1.auth", label: "Credential source", kind: "select",
      options: [
        { value: "static", label: "Key hard-coded in the client" },
        { value: "vault", label: "Secret-store token (auto-rotates)" },
        { value: "none", label: "No auth — internal trust" },
      ],
      correct: "vault",
      teach: "Integration keys in code end up in git history. A secret store issues and rotates tokens.",
    },
    {
      key: "ch1.timeout", label: "Call timeout", kind: "select",
      options: [
        { value: "none", label: "None — wait indefinitely" },
        { value: "3s", label: "3 seconds" },
        { value: "30s", label: "30 seconds" },
      ],
      correct: "3s",
      teach: "A caller without a timeout will hold threads while a dependency hangs — the seed of a cascade.",
    },
    {
      key: "ch1.idem", label: "Idempotency key header", kind: "switch", correct: true,
      teach: "A unique key per operation lets DepotERP recognize a retried call and answer without doing the work twice.",
    },
    {
      key: "ch1.retry", label: "Retry policy", kind: "select",
      options: [
        { value: "immediate", label: "Re-send immediately" },
        { value: "fixed", label: "Fixed every 30 s" },
        { value: "exp", label: "Exponential backoff + jitter" },
      ],
      correct: "exp",
      teach: "Growing randomized waits let a struggling dependency breathe instead of facing a synchronized herd.",
    },
    {
      key: "ch1.maxRetries", label: "Max retries", kind: "select",
      options: [
        { value: "0", label: "0" },
        { value: "1", label: "1" },
        { value: "3", label: "3" },
        { value: "10", label: "10" },
      ],
      correct: "3",
      teach: "Unbounded retries amplify an outage; a small cap bounds the amplification.",
    },
    {
      key: "ch1.depTimeout", label: "Dependency timeout (recommendation call)", kind: "select",
      options: [
        { value: "none", label: "None (inline, waits forever)" },
        { value: "2s", label: "2 seconds" },
        { value: "8s", label: "8 seconds" },
      ],
      correct: "2s",
      teach: "The recommendation call is inline in checkout: it must have its own short timeout.",
    },
    {
      key: "ch1.cb", label: "Circuit breaker", kind: "switch", correct: true,
      teach: "After repeated failures the breaker trips open and stops calling the dead dependency at all.",
    },
    {
      key: "ch1.fallback", label: "Cached fallback when breaker is open", kind: "switch", correct: true,
      teach: "Graceful degradation: serve cached recommendations instead of freezing checkout.",
    },
  ],
  ch2: [
    {
      key: "ch2.cord", label: "Cord type", kind: "select",
      options: [
        { value: "api", label: "API cord (synchronous call)" },
        { value: "webhook", label: "Webhook cord (event push)" },
        { value: "queue", label: "Queue trunk (buffered)" },
      ],
      correct: "webhook",
      teach: "DepotERP pushes to a FleetHub URL the moment a status changes — a webhook, not a poll.",
    },
    {
      key: "ch2.endpoint", label: "Callback URL registered with DepotERP", kind: "select",
      options: [
        { value: "v1", label: "/hooks/shipment-status-v1  (retired)" },
        { value: "current", label: "/hooks/shipment-status  (current)" },
        { value: "ext", label: "hooks.partner.example/status" },
      ],
      correct: "current",
      teach: "Endpoint drift after a migration is the classic webhook failure — verify the registered URL.",
    },
    {
      key: "ch2.sig", label: "Verify HMAC signature", kind: "switch", correct: true,
      teach: "Anyone can POST to a public callback URL; the shared-secret signature proves the request is really DepotERP.",
    },
    {
      key: "ch2.replay", label: "Event-ID dedupe (replay protection)", kind: "switch", correct: true,
      teach: "At-least-once delivery means the same webhook can arrive twice — dedupe by event ID.",
    },
    {
      key: "ch2.rateCap", label: "Rate-cap webhook deliveries", kind: "switch", correct: true,
      teach: "A cap stops a retry storm (or an abuser) from exhausting your endpoint.",
    },
  ],
  ch3: [
    {
      key: "ch3.cord", label: "Cord type", kind: "select",
      options: [
        { value: "api", label: "API cord (synchronous call)" },
        { value: "webhook", label: "Webhook cord (event push)" },
        { value: "queue", label: "Queue trunk (buffered)" },
      ],
      correct: "queue",
      teach: "Bursty billing events must wait safely when the consumer is busy — that is a message queue.",
    },
    {
      key: "ch3.delivery", label: "Delivery guarantee", kind: "select",
      options: [
        { value: "atMost", label: "At-most-once (may drop)" },
        { value: "atLeast", label: "At-least-once (may duplicate)" },
      ],
      correct: "atLeast",
      teach: "Brokers practically guarantee at-least-once; billing events must not be dropped, so duplicates must be tolerated.",
    },
    {
      key: "ch3.acks", label: "Acknowledgment mode", kind: "select",
      options: [
        { value: "auto", label: "Auto-ack on receive" },
        { value: "explicit", label: "Ack only after successful processing" },
      ],
      correct: "explicit",
      teach: "Ack-after-processing lets the broker redeliver a message whose consumer crashed mid-work.",
    },
    {
      key: "ch3.dlq", label: "Dead-letter queue", kind: "switch", correct: true,
      teach: "Messages that keep failing must be parked in a DLQ instead of plugging the queue head forever.",
    },
    {
      key: "ch3.dlqAfter", label: "Max attempts before DLQ", kind: "select",
      options: [
        { value: "1", label: "1 attempt" },
        { value: "3", label: "3 attempts" },
        { value: "5", label: "5 attempts" },
      ],
      correct: "3",
      teach: "A few retries ride out blips; a small cap stops a poison message from retrying 10,000 times.",
    },
    {
      key: "ch3.schemaFix", label: "Malformed-field handling", kind: "select",
      options: [
        { value: "drop", label: "Silently drop the event" },
        { value: "strict", label: "Strict reject — fail on missing field" },
        { value: "producerDefault", label: "Producer fixed to send currency; consumer tolerates a default" },
      ],
      correct: "producerDefault",
      teach: "Fix the producer schema AND make the consumer tolerant — 'drop' loses revenue events silently.",
    },
    {
      key: "ch3.replay", label: "DLQ replay strategy", kind: "select",
      options: [
        { value: "discard", label: "Discard parked messages" },
        { value: "afterFix", label: "Replay after the producer fix ships" },
        { value: "now", label: "Replay immediately, unchanged" },
      ],
      correct: "afterFix",
      teach: "Replaying into the same bug just re-poisons the queue; replay after the fix is verified.",
    },
  ],
  ch4: [
    {
      key: "ch4.probeApi", label: "Probe: API success rate", kind: "switch", correct: true,
      teach: "Synthetic probe + gateway logs give you the API's success rate over time.",
    },
    {
      key: "ch4.thrApi", label: "Threshold: alert when success drops below", kind: "select",
      options: [
        { value: "1", label: "1% (too loose)" },
        { value: "2", label: "2% for 10 min" },
        { value: "5", label: "5% (noisy)" },
      ],
      correct: "2",
      teach: "2% for 10 minutes catches real degradation while riding out single blips.",
    },
    {
      key: "ch4.probeHook", label: "Probe: webhook delivery success", kind: "switch", correct: true,
      teach: "Delivery logs per endpoint reveal drift and storms early.",
    },
    {
      key: "ch4.thrHook", label: "Threshold: alert when delivery drops below", kind: "select",
      options: [
        { value: "95", label: "95% over 15 min" },
        { value: "98", label: "98% over 15 min" },
        { value: "999", label: "99.9% (constant noise)" },
      ],
      correct: "98",
      teach: "98% over 15 min separates storms from ordinary single failures.",
    },
    {
      key: "ch4.probeLag", label: "Probe: queue oldest-message age", kind: "switch", correct: true,
      teach: "Queue depth alone lies during batch windows; age of the OLDEST message reveals a plugged queue.",
    },
    {
      key: "ch4.thrLag", label: "Threshold: alert when oldest message exceeds", kind: "select",
      options: [
        { value: "300", label: "300 s" },
        { value: "900", label: "900 s (misses slow jams)" },
        { value: "3600", label: "3600 s (way too late)" },
      ],
      correct: "300",
      teach: "300 s catches a poison message jamming the queue head within minutes.",
    },
    {
      key: "ch4.probeDlq", label: "Probe: DLQ depth", kind: "switch", correct: true,
      teach: "Any message in the DLQ is work that silently stopped — zero-tolerance alert.",
    },
    {
      key: "ch4.thrDlq", label: "Threshold: alert when DLQ depth exceeds", kind: "select",
      options: [
        { value: "0", label: "0 (alert on any)" },
        { value: "5", label: "5 messages" },
        { value: "50", label: "50 messages" },
      ],
      correct: "0",
      teach: "A DLQ is not a trash can — any parked message means someone's data is stuck.",
    },
  ],
};

// Drill-bench exercises (pattern drills) — objective-scoped selects.
const DRILL_FIELDS = [
  {
    key: "m1.a", label: "Drill 1 · Checkout must know stock level before confirming an order", kind: "select",
    options: [
      { value: "api", label: "API — synchronous call" },
      { value: "webhook", label: "Webhook — event push" },
      { value: "queue", label: "Queue — buffered" },
    ],
    correct: "api",
    teach: "The caller blocks on the answer before it can continue: synchronous API.",
  },
  {
    key: "m1.b", label: "Drill 2 · Partner system must be told the instant a status changes", kind: "select",
    options: [
      { value: "api", label: "API — synchronous call" },
      { value: "webhook", label: "Webhook — event push" },
      { value: "queue", label: "Queue — buffered" },
    ],
    correct: "webhook",
    teach: "You register a callback URL and the source pushes: webhook.",
  },
  {
    key: "m1.c", label: "Drill 3 · Billing events arrive in bursts; the consumer works when it can", kind: "select",
    options: [
      { value: "api", label: "API — synchronous call" },
      { value: "webhook", label: "Webhook — event push" },
      { value: "queue", label: "Queue — buffered" },
    ],
    correct: "queue",
    teach: "Producer and consumer run independently in time: queue.",
  },
  {
    key: "m2.a", label: "Classify · FleetHub calls DepotERP and WAITS for the reservation answer", kind: "select",
    options: [
      { value: "sync", label: "Synchronous" },
      { value: "push", label: "Push (webhook)" },
      { value: "async", label: "Asynchronous" },
    ],
    correct: "sync",
    teach: "Waiting on the response inside the request path is synchronous — with all its coupling.",
  },
  {
    key: "m2.b", label: "Classify · DepotERP fires a status event and moves on without waiting", kind: "select",
    options: [
      { value: "sync", label: "Synchronous" },
      { value: "push", label: "Push (webhook)" },
      { value: "async", label: "Asynchronous" },
    ],
    correct: "push",
    teach: "The source pushes to a registered callback URL and continues: webhook push.",
  },
  {
    key: "m2.c", label: "Classify · Billing events wait in a tray until the consumer picks them up", kind: "select",
    options: [
      { value: "sync", label: "Synchronous" },
      { value: "push", label: "Push (webhook)" },
      { value: "async", label: "Asynchronous" },
    ],
    correct: "async",
    teach: "A queue decouples producer from consumer in time: asynchronous.",
  },
  {
    key: "m2.d", label: "Classify · A caller re-sends its request every 30 s until it gets an answer", kind: "select",
    options: [
      { value: "sync", label: "Synchronous" },
      { value: "push", label: "Push (webhook)" },
      { value: "async", label: "Asynchronous" },
    ],
    correct: "sync",
    teach: "Retrying a request is still synchronous semantics — the caller still blocks per attempt.",
  },
];

// Partner architecture brief (Hard, OBJ-H1).
const ARCH_FIELDS = [
  {
    key: "h1.sc1", label: "Scenario 1 · 40k fleet devices emit tracking pings in unpredictable bursts; analytics consumes at its own pace", kind: "select",
    options: [
      { value: "api", label: "Synchronous API" },
      { value: "webhook", label: "Webhook" },
      { value: "queue", label: "Message queue" },
    ],
    correct: "queue",
    teach: "Bursty producers + flexible consumer = queue buffering.",
  },
  {
    key: "h1.sc1r", label: "Scenario 1 · resilience setting", kind: "select",
    options: [
      { value: "scale", label: "Consumer group scales with queue depth" },
      { value: "cap", label: "Reject pings above a hard cap" },
      { value: "sync", label: "Process every ping inline" },
    ],
    correct: "scale",
    teach: "Let the buffer absorb bursts and scale consumers on lag.",
  },
  {
    key: "h1.sc2", label: "Scenario 2 · the partner must be told instantly when an order status changes", kind: "select",
    options: [
      { value: "api", label: "Synchronous API" },
      { value: "webhook", label: "Webhook" },
      { value: "queue", label: "Message queue" },
    ],
    correct: "webhook",
    teach: "Instant push to a registered callback URL: webhook.",
  },
  {
    key: "h1.sc2r", label: "Scenario 2 · resilience setting", kind: "select",
    options: [
      { value: "verify", label: "HMAC signature + event-ID dedupe" },
      { value: "open", label: "Accept any POST to the callback" },
      { value: "manual", label: "Email the partner manually" },
    ],
    correct: "verify",
    teach: "Public callback URLs need authentication (signature) and replay protection (dedupe).",
  },
  {
    key: "h1.sc3", label: "Scenario 3 · checkout must confirm payment authorization BEFORE committing", kind: "select",
    options: [
      { value: "api", label: "Synchronous API" },
      { value: "webhook", label: "Webhook" },
      { value: "queue", label: "Message queue" },
    ],
    correct: "api",
    teach: "The answer gates the next step: synchronous API.",
  },
  {
    key: "h1.sc3r", label: "Scenario 3 · resilience setting", kind: "select",
    options: [
      { value: "breaker", label: "Timeout + circuit breaker + fallback" },
      { value: "wait", label: "Wait as long as it takes" },
      { value: "queue", label: "Queue the authorization" },
    ],
    correct: "breaker",
    teach: "A payment dependency in the request path must never hang a caller unbounded.",
  },
];

// Poison-message forensics (Hard, OBJ-H6).
const POISON_FIELDS = [
  {
    key: "h6.fix", label: "Schema fix", kind: "select",
    options: [
      { value: "producerDefault", label: "Producer sends currency; consumer tolerates a default" },
      { value: "consumerOnly", label: "Consumer silently invents a currency, producer unchanged" },
      { value: "ignore", label: "Ignore the field entirely" },
    ],
    correct: "producerDefault",
    teach: "Fix the root cause at the producer and make the consumer defensive — both, always.",
  },
  {
    key: "h6.replay", label: "Replay strategy", kind: "select",
    options: [
      { value: "afterFix", label: "Replay after the producer fix is verified" },
      { value: "now", label: "Replay immediately, unchanged" },
      { value: "discard", label: "Discard parked messages" },
    ],
    correct: "afterFix",
    teach: "Replay into an unfixed consumer just re-poisons the queue.",
  },
  {
    key: "h6.prev", label: "Prevention for next time", kind: "select",
    options: [
      { value: "contract", label: "Schema contract tests in the CI pipeline" },
      { value: "review", label: "Ask producers to be more careful" },
      { value: "bigger", label: "Order a bigger queue" },
    ],
    correct: "contract",
    teach: "CV0-004 5.3 connects here: automated pipeline gates catch contract drift before deploy.",
  },
];

// Residual-risk control selection (Hard, OBJ-H8).
const CONTROL_OPTIONS = [
  { id: "idem", label: "Enforce idempotency keys on every write endpoint", risk: "Retries can still double-apply effects" },
  { id: "cb", label: "SLO-gated circuit breakers on all inline dependency calls", risk: "A dead dependency can still freeze callers" },
  { id: "dlq", label: "DLQ routing + replay runbook owned by an on-call rotation", risk: "Malformed events can still plug the queue" },
  { id: "scan", label: "Pre-commit secret scanning + secret store issuance", risk: "Keys can still be committed to source control" },
  { id: "key2", label: "Issue a second static API key as a spare" },
  { id: "cap", label: "Raise the API rate cap so retries never fail" },
  { id: "noretry", label: "Disable all retries permanently" },
  { id: "manual", label: "Have an operator clear the queue by hand each morning" },
];
const CONTROLS_CORRECT = ["idem", "cb", "dlq", "scan"];

// Key-breach response order (OBJ-M10 / OBJ-H7).
const KEY_STEPS = [
  { id: "rotate", label: "Revoke and rotate the exposed key" },
  { id: "audit", label: "Audit usage logs for what the key did" },
  { id: "vault", label: "Move the integration to secret-store issuance" },
  { id: "restrict", label: "Restrict the new key to known source ranges" },
  { id: "scan", label: "Add pre-commit secret scanning to the repo" },
];
const KEY_ORDER_CORRECT = ["rotate", "audit", "vault", "restrict", "scan"];

// Alert triage (Medium, OBJ-M8): pick the ONE true integration failure.
// Alert 'a' is defensibly benign: 3% drop for only 8 min — the 2%-for-10-min rule has not been met,
// so it reads as a sub-threshold/duration blip (teaches duration-vs-severity, kills ambiguity).
const ALERTS_MEDIUM = [
  { id: "a", text: "API success 97.0% for 8 min — the 2% alert needs 10 min", kind: "noise" },
  { id: "b", text: "Webhook delivery success 91% over 15 min on /hooks/shipment-status", kind: "true" },
  { id: "c", text: "Queue depth 40 during the 22:00 scheduled batch window", kind: "noise" },
  { id: "d", text: "API p99 latency 8 s during the 14:00 marketing blast", kind: "noise" },
];

// Alert triage (Hard, OBJ-H5): exactly 3 true of 8, plus classification.
const ALERTS_HARD = [
  { id: "ha", text: "Two createShipment calls 400 ms apart, same order id, both returned 201", class: "dup" },
  { id: "hb", text: "Checkout p99 31 s, recommendation service DOWN, FleetHub threads 100%", class: "cascade" },
  { id: "hc", text: "41,206 webhook delivery attempts in 15 min, every response 410 Gone", class: "storm" },
  { id: "hd", text: "Queue depth 2,400 at 22:03 — scheduled price-file import window", class: "noise" },
  { id: "he", text: "Burst of 400s from 10.30.9.9 tagged loadtest-42 (dev environment)", class: "noise" },
  { id: "hf", text: "Single 502 on edge-2, self-recovered in 40 s", class: "noise" },
  { id: "hg", text: "Queue oldest-message age 120 s (threshold 300 s)", class: "noise" },
  { id: "hh", text: "Read-replica CPU spike at 14:00 during marketing blast", class: "noise" },
];
const ALERT_HARD_CORRECT = ["ha", "hb", "hc"];

const HARD_ALERT_CLASSES = [
  { value: "dup", label: "Duplicate execution (unsafe retry)" },
  { value: "cascade", label: "Cascading failure (dead dependency)" },
  { value: "storm", label: "Webhook storm (endpoint drift + retries)" },
  { value: "na", label: "Not an integration failure" },
];

// ── Incidents & evidence (all synthetic) ──
const INCIDENTS = [
  {
    id: "inc1",
    title: "Double shipment",
    short: "One order, two courier boxes, one 504 in the middle.",
    channel: "ch1",
    roll: "ROLL-A · GATEWAY TAPE",
    evidence: [
      {
        id: "ev1", title: "Gateway access log", kind: "log",
        body: `# gateway-access.log — SYNTHETIC TRAINING DATA
2026-03-09T10:41:07Z POST /v1/shipments req=sh-8841 cli=fleet-a7 → 504 upstream_timeout (depot 5.0s)
2026-03-09T10:41:07Z POST /v1/shipments req=sh-8841 cli=fleet-a7 → RETRY (attempt 2)
2026-03-09T10:41:08Z POST /v1/shipments req=sh-8841 cli=fleet-a7 → 201 created id=SH-77214 (12ms)
NOTE: request id sh-8841 appears TWICE in one second.`,
      },
      {
        id: "ev2", title: "DepotERP + support desk", kind: "log",
        body: `# depot-erp app.log — SYNTHETIC TRAINING DATA
10:41:08 reservation created order=ORD-30188 shipment=SH-77214
10:41:08 reservation created order=ORD-30188 shipment=SH-77215
# support desk
TCK-5567: customer reports two courier boxes for one online order.`,
      },
    ],
    causeOptions: [
      { id: "gateway-outage", label: "The API gateway had a prolonged outage" },
      { id: "dup-retry", label: "A retried call re-did the work — no idempotency key" },
      { id: "queue-reorder", label: "The queue delivered events out of order" },
      { id: "clock-drift", label: "Clock drift between the two systems" },
    ],
    cause: "dup-retry",
    medium: true,
    hard: true,
  },
  {
    id: "inc2",
    title: "Checkout freeze",
    short: "Checkout stops responding; one dependency is dead and everyone waits.",
    channel: "ch1",
    roll: "ROLL-B · LATENCY & CONFIG",
    evidence: [
      {
        id: "ev3", title: "Telemetry snapshot", kind: "metric",
        body: `# fleet-hub telemetry — SYNTHETIC TRAINING DATA
checkout p99 latency: 0.4s → 24.1s (10:59) → 31.2s (11:04)
thread pool: 100% busy for 14 min, 61 threads parked in "await recsvc"
recsvc.cobaltcourier.example /health → DOWN since 10:58 (deploy 10:57)`,
      },
      {
        id: "ev4", title: "Checkout config dump", kind: "code",
        body: `# fleet-hub checkout config dump — SYNTHETIC TRAINING DATA
recommendations: fetch("http://recsvc:8080/suggest", { timeout: 0 })
placement: INLINE in checkout request path
fallback: NONE  ·  breaker: NONE  ·  caller timeout: NONE`,
      },
    ],
    causeOptions: [
      { id: "db-overload", label: "The order database is overloaded" },
      { id: "cdn-misroute", label: "The CDN is routing checkout traffic wrongly" },
      { id: "dead-dep", label: "A dead dependency is called inline without timeout" },
      { id: "hook-storm", label: "A webhook storm is flooding checkout" },
    ],
    cause: "dead-dep",
    medium: true,
    hard: true,
  },
  {
    id: "inc3",
    title: "Webhook storm",
    short: "41,206 delivery attempts in 15 minutes, every one answered 410 Gone.",
    channel: "ch2",
    roll: "ROLL-C · DELIVERY LOG",
    evidence: [
      {
        id: "ev5", title: "Webhook delivery log + change ticket", kind: "log",
        body: `# webhook-delivery.log (ParcelCRM → FleetHub) — SYNTHETIC TRAINING DATA
10:00:01 POST /hooks/shipment-status-v1 → 410 Gone (attempt 1)
10:00:03 POST /hooks/shipment-status-v1 → 410 Gone (attempt 2, backoff 2s)
... 41,206 attempts in the last 15 minutes, 100% → 410 Gone
# change ticket
CHG-2291 (yesterday): FleetHub endpoint migration v1 → /hooks/shipment-status`,
      },
    ],
    causeOptions: [
      { id: "endpoint-drift", label: "Registered webhook URL drifted after a migration; retries amplify" },
      { id: "dns-flap", label: "DNS flapping between two FleetHub IPs" },
      { id: "crm-outage", label: "ParcelCRM is down and failing webhooks" },
      { id: "attacker-flood", label: "An attacker is flooding the callback endpoint" },
    ],
    cause: "endpoint-drift",
    medium: false,
    hard: true,
  },
  {
    id: "inc4",
    title: "Poison message",
    short: "One malformed billing event retried 10,404 times is plugging the queue head.",
    channel: "ch3",
    roll: "ROLL-D · QUEUE TAPE",
    evidence: [
      {
        id: "ev6", title: "Queue metrics + consumer log", kind: "metric",
        body: `# billing queue metrics — SYNTHETIC TRAINING DATA
queue: billing.ledger   depth: 12,480   oldest: 3h 11m   consumers: 4 (healthy)
msg evt-77121: receive_count=10,404  state=inflight→requeued
# consumer log
10:14:22 error CurrencyRequired invoice=INV-4411 (retry 10404)`,
      },
      {
        id: "ev7", title: "Parked message sample", kind: "log",
        body: `# DLQ message sample (parked) — SYNTHETIC TRAINING DATA
{ "event": "billing.updated", "invoice": "INV-4411",
  "amount": "49.99", "currency": null }
producer: parcelcrm-billing v3.2.0 (deployed yesterday)`,
      },
    ],
    causeOptions: [
      { id: "poison-msg", label: "A malformed event is retried forever and plugs the queue" },
      { id: "consumer-crash", label: "All four consumers crashed" },
      { id: "burst-flood", label: "A marketing blast flooded billing events" },
      { id: "dlq-overflow", label: "The DLQ is full" },
    ],
    cause: "poison-msg",
    medium: true,
    hard: true,
  },
  {
    id: "inc5",
    title: "Leaked integration key",
    short: "An API key committed to source control is being replayed from an unknown network.",
    channel: null,
    roll: "ROLL-E · SECURITY TAPE",
    evidence: [
      {
        id: "ev8", title: "Secret scanner + key usage", kind: "security",
        body: `# secret scanner — SYNTHETIC TRAINING DATA
pattern api_key in src/billing/client.py (commit 4f2a91c, 8 months ago)
key ck_live_9f27•••••••• STILL ACTIVE
# key usage log — SYNTHETIC TRAINING DATA
03:14 UTC ck_live_9f27 from 198.51.100.77 (unknown ASN) × 212 calls
normal sources: 10.20.x.x (fleet) only`,
      },
    ],
    causeOptions: [
      { id: "committed-key", label: "The key was committed to source control and reused" },
      { id: "brute-force", label: "Someone brute-forced the key" },
      { id: "insider", label: "A staff member is misusing the key" },
      { id: "vendor-leak", label: "The SaaS vendor leaked the key" },
    ],
    cause: "committed-key",
    medium: true,
    hard: true,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// Inline SVG icons — exact Lucide path data (stroke=currentColor, width=2,
// round caps/joins, 24×24 viewBox). Copied from the lucide icon set so the
// static port needs no icon font or CDN.
// ═══════════════════════════════════════════════════════════════════════════
const ICONS = {
  cable: '<path d="M17 21v-2a1 1 0 0 1-1-1v-1a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1"/><path d="M19 15V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V9"/><path d="M21 21v-2h-4"/><path d="M3 5h4V3"/><path d="M7 5a1 1 0 0 1 1 1v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1V3"/>',
  "rotate-ccw": '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  stamp: '<path d="M14 13V8.5C14 7 15 7 15 5a3 3 0 0 0-6 0c0 2 1 2 1 3.5V13"/><path d="M20 15.5a2.5 2.5 0 0 0-2.5-2.5h-11A2.5 2.5 0 0 0 4 15.5V17a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1z"/><path d="M5 22h14"/>',
  "clipboard-list": '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  "plug-zap": '<path d="M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z"/><path d="m2 22 3-3"/><path d="M7.5 13.5 10 11"/><path d="M10.5 16.5 13 14"/><path d="m18 3-4 4h6l-4 4"/>',
  "flask-conical": '<path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2"/><path d="M6.453 15h11.094"/><path d="M8.5 2h7"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  "scroll-text": '<path d="M15 12h-5"/><path d="M15 8h-5"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/>',
  activity: '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
  "shield-alert": '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  "undo-2": '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/>',
  "circle-check-big": '<path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/>',
  lightbulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  "list-checks": '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
  "triangle-alert": '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  "book-open": '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  "graduation-cap": '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
  "clipboard-check": '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
  "external-link": '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  "circle-check": '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  "circle-x": '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
  crosshair: '<circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  "chevron-down": '<path d="m6 9 6 6 6-6"/>',
  circle: '<circle cx="12" cy="12" r="10"/>',
};
