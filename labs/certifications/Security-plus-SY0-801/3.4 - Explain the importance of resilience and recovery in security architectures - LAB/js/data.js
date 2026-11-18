/* =========================================================================
 * Continuity Bay — Static Lab Data
 * CompTIA Security+ SY0-801 · Lesson 3.4 · Resilience & Recovery
 * All lab content: objectives, quiz bank, scenarios, glossary, validation rules.
 * This file is data-only — no logic, no DOM access.
 * ========================================================================= */

/* --- Pillar metadata --- */
const PILLAR_META = {
  P1: { label: 'Understand', color: '#2DD4BF', icon: 'brain' },
  P2: { label: 'Recognize / Analyze', color: '#F59E0B', icon: 'triangle-alert' },
  P3: { label: 'Detect / Verify', color: '#38BDF8', icon: 'activity' },
  P4: { label: 'Mitigate', color: '#10B981', icon: 'shield-check' },
};

/* --- Stations --- */
const STATIONS = [
  { id: 'briefing', label: 'Briefing', icon: 'compass' },
  { id: 'knowledge', label: 'Knowledge Core', icon: 'brain' },
  { id: 'backup', label: 'Backup Vault', icon: 'database' },
  { id: 'redundancy', label: 'Redundancy Rack', icon: 'server-cog' },
  { id: 'sites', label: 'Recovery Site Map', icon: 'map-pin' },
  { id: 'continuity', label: 'Continuity Library', icon: 'clipboard-list' },
  { id: 'tests', label: 'Test Director', icon: 'workflow' },
  { id: 'capacity', label: 'Capacity Desk', icon: 'gauge' },
  { id: 'quiz', label: 'Knowledge Check', icon: 'help-circle' },
  { id: 'debrief', label: 'Debrief', icon: 'clipboard-list' },
];

/* --- Medium objectives (12) --- */
const MEDIUM_OBJECTIVES = [
  {
    id: 'OBJ-M1', pillar: 'P1', station: 'Backup Vault',
    text: 'Order the four backup types by what data each one captures in a restore chain, from foundation to most granular.',
    anchor: 'B1–B4: full / incremental / differential / snapshot',
    hint1: 'The chain always starts with the one that captures everything.',
    hint2: 'Differential and incremental both capture changes — but from different reference points.',
    hint3: 'Snapshots are point-in-time VM/cloud state captures, layered on top of the chain.',
    feedback: 'A correct restore chain always begins from a Full backup; Incrementals add the smallest daily deltas (but a long chain is slow to restore); Differentials grow each day but only need the latest differential + the full; Snapshots are a separate point-in-time mechanism layered on VMs/cloud for instant rollback.',
  },
  {
    id: 'OBJ-M2', pillar: 'P1', station: 'Recovery Objectives',
    text: 'Match RTO, RPO, MTTR, and MTBF to their correct one-line definitions.',
    anchor: 'O1–O4: RTO / RPO / MTTR / MTBF',
    hint1: 'Two are about recovery targets (one for time, one for data); two are operational reliability metrics.',
    hint2: '"Objective" means a goal set by the business; "Mean" means an average observed over time.',
    hint3: 'RPO answers "how much data can we lose?"; RTO answers "how long can we be down?"; MTTR and MTBF describe how often systems fail and how fast they come back.',
    feedback: 'RTO = max acceptable downtime. RPO = max acceptable data loss (time-based). MTTR = average time to repair a failed component. MTBF = average time between failures. The exam often tests these as a family — and pairs RPO with backup frequency (RPO ≤ backup interval) and RTO with recovery site readiness.',
  },
  {
    id: 'OBJ-M3', pillar: 'P1', station: 'Continuity Library',
    text: 'Sort BCP, DRP, and COOP from broadest business scope to narrowest mission-essential scope.',
    anchor: 'P1–P3: BCP / DRP / COOP',
    hint1: 'One keeps the *business* running; one restores *IT systems*; one keeps *mission-essential functions* alive during prolonged disruption (often with non-technical fallbacks).',
    hint2: 'BCP is enterprise-wide; DRP is the IT slice; COOP is the smallest, mission-only slice.',
    hint3: 'Order broadest → narrowest: BCP → DRP → COOP. (COOP often uses paper/manual fallbacks when no tech is available.)',
    feedback: 'BCP (Business Continuity Plan) is the broadest — it covers the entire organization keeping the business running during disruption. DRP (Disaster Recovery Plan) is the IT-focused subset of BCP — restoring systems and data. COOP (Continuity of Operations Plan) is the narrowest — mission-essential functions during prolonged disruption, often via non-technical means (manual receipts, paper logs).',
  },
  {
    id: 'OBJ-M4', pillar: 'P2', station: 'Backup Vault',
    text: 'Triage the failed-restore log and identify which backup type was missing from the chain.',
    anchor: 'B1–B4 + B5 (replication)',
    hint1: 'The restore tool needs a foundation anchor before applying deltas.',
    hint2: 'Look at the log: incremental after incremental — but no anchor was ever taken.',
    hint3: 'A chain of incrementals cannot be restored without the original Full.',
    feedback: 'The log shows 28 days of incremental backups with no Full ever taken — so when the file server was corrupted, the chain had no anchor to restore from. Lesson: schedule recurring Fulls (weekly or monthly) so the incremental chain always has a restorable anchor. Replication alone would not have helped because replication also replicated the corruption forward.',
  },
  {
    id: 'OBJ-M5', pillar: 'P2', station: 'Redundancy Rack',
    text: 'Identify every single point of failure (SPOF) visible in the data center floor diagram.',
    anchor: 'R1–R9: load balancing / clustering / NIC teaming / port aggregation / dual PSU / UPS / generators / redundant circuits / ISP',
    hint1: 'A SPOF is any component whose failure takes the whole service down.',
    hint2: 'Look for "only one of X" — single power supply, single UPS, single ISP, no NIC teaming.',
    hint3: 'There are four SPOFs in this diagram: single ISP, single UPS (no generator), single PSU per server, no NIC teaming on the uplink.',
    feedback: 'SPOFs found: (1) single ISP uplink — no ISP redundancy; (2) single UPS, no generator — power loss is fatal; (3) single PSU per server — PSU failure kills the host; (4) no NIC teaming on the uplink — NIC failure isolates the host. Each is a separate redundancy control (R9, R6+R7, R5, R3) the lab covers.',
  },
  {
    id: 'OBJ-M6', pillar: 'P2', station: 'Recovery Sites',
    text: 'Match each business function to its required recovery site: hot, warm, or cold.',
    anchor: 'S1–S3: hot / warm / cold',
    hint1: 'Match RTO to site: shortest RTO → hot; longest RTO → cold; in-between → warm.',
    hint2: 'Production e-commerce needs minutes-to-hours (hot); internal reporting needs a day or two (warm); archived HR docs can wait a week (cold).',
    hint3: 'Hot = synced and ready in minutes; Warm = some equipment/data, hours-to-days; Cold = power and connectivity only, days-to-weeks.',
    feedback: 'Hot site (S1): fully equipped, constantly synced, operational in minutes-to-hours — for mission-critical, low-RTO functions. Warm site (S2): partial equipment and data, hours-to-days to operational — for important-but-not-mission-critical functions. Cold site (S3): power and connectivity only, days-to-weeks to operational — for low-priority functions where RTO is measured in days or weeks.',
  },
  {
    id: 'OBJ-M7', pillar: 'P3', station: 'Backup Vault',
    text: 'Build a backup schedule that meets RPO ≤ 1 hour — including immutability, replication, AND offsite copies.',
    anchor: 'B1–B7 + O2: full / incremental / differential / snapshot / replication / immutability / offsite / RPO',
    hint1: 'RPO ≤ 1 hour means a backup must run at least once per hour.',
    hint2: 'Hourly snapshots or incrementals satisfy the RPO; weekly Fulls anchor the chain.',
    hint3: 'Then turn on immutability (ransomware protection), replication (DR copy), and offsite copies (geographic isolation).',
    feedback: 'To meet RPO ≤ 1h you need at least hourly backups (snapshots or incrementals). A weekly Full anchors the chain. Then enable immutability so ransomware cannot delete backups, replication so a near-real-time copy exists at the DR site, and offsite copies for geographic isolation. Missing any of the three toggles leaves a gap: no immutability = ransomware risk; no replication = no DR-ready copy; no offsite = site-wide disaster risk.',
  },
  {
    id: 'OBJ-M8', pillar: 'P3', station: 'Continuity Library',
    text: 'Identify which artifacts belong in a Business Continuity Plan (BCP). Select all that apply.',
    anchor: 'P1: BCP scope (enterprise-wide business continuity)',
    hint1: 'BCP owns enterprise-wide, business-level continuity artifacts — not IT runbooks.',
    hint2: 'Think "what does the business need to keep operating?" — call tree, key contacts, supplier list.',
    hint3: 'Executive call tree, vendor/supplier contact list, and a crisis communication template are BCP artifacts. Server runbooks and disk image inventories are DRP. Mission-essential manual procedure checklists are COOP.',
    feedback: 'BCP artifacts are enterprise-wide and business-facing: executive call tree, vendor/supplier contact list, crisis communication plan, business impact analysis. DRP owns the IT runbooks and asset inventory. COOP owns mission-essential manual procedure checklists. Mixing them up is a common exam trap and a real-world cause of "we couldn\'t find the contact list" failures.',
  },
  {
    id: 'OBJ-M9', pillar: 'P3', station: 'Redundancy Rack',
    text: 'Read the post-incident report and select the single resilience control that was missing.',
    anchor: 'R6–R7 + O1: UPS / generators / RTO',
    hint1: 'The UPS carried the load for ~10 minutes then the building lost power.',
    hint2: 'A UPS is a short-term bridge — not a long-term power source.',
    hint3: 'A generator was missing. The UPS bridges the gap until the generator spins up; without a generator, RTO cannot be met during a long outage.',
    feedback: 'The UPS only buys minutes — it is a bridge to a generator, not a replacement for one. Without a generator, the 9-hour outage exceeded RTO by 5 hours. CompTIA pairs UPS with generators (and dual power supplies) as a single resilience family: dual PSU inside the host, UPS as the short-term bridge, generator as the long-term power source, and redundant circuits for utility diversity.',
  },
  {
    id: 'OBJ-M10', pillar: 'P4', station: 'Redundancy Rack',
    text: 'Configure a power-redundant infrastructure and survive the simulated outage. Enable every component needed to keep the host running through a utility failure.',
    anchor: 'R5–R8: dual PSU / UPS / generator / redundant circuits',
    hint1: 'You need defense in depth: two power sources inside the host, two utility feeds, and a local power bridge.',
    hint2: 'Enable: dual PSU (R5), UPS (R6), generator (R7), and redundant circuits (R8).',
    hint3: 'All four must be ON. Then trigger the outage — the simulation should report "survived".',
    feedback: 'A power-resilient host needs: dual PSUs (one fails, the host stays up), redundant circuits (one utility feed fails, the other carries the load), a UPS (bridges the seconds-to-minutes gap when utility drops), and a generator (carries the load for the duration of the outage). Missing any one of these is a SPOF.',
  },
  {
    id: 'OBJ-M11', pillar: 'P4', station: 'Test Director',
    text: 'Match each scenario to the correct recovery test type.',
    anchor: 'T1–T5: tabletop / simulation / failover / parallel / cutover',
    hint1: 'Match depth-of-validation to risk/cost: cheapest = tabletop (paper walkthrough); most expensive = cutover (real switch).',
    hint2: 'Failover test = switch to redundant systems to verify they take over. Parallel test = run DR site alongside primary. Simulation = partial realistic test. Cutover = full switch with primary off.',
    hint3: 'A walkthrough of the plan with stakeholders = Tabletop. A DR-team test of recovery procedures without taking prod down = Simulation. Verifying redundant systems take over = Failover. Running DR site alongside production = Parallel. Actually switching production to DR = Cutover.',
    feedback: 'Tabletop (T1): paper walkthrough, cheapest, identifies plan gaps. Simulation (T2): partial test of recovery procedures, no production impact. Failover test (T3): verify redundant components actually take over. Parallel test (T4): DR site runs alongside primary — both process load. Cutover / Full interruption (T5): actually switch production to DR — most realistic but most disruptive.',
  },
  {
    id: 'OBJ-M12', pillar: 'P4', station: 'Redundancy Rack',
    text: 'Select the platform-diversity + multi-cloud configuration that survives a single-vendor outage simulation.',
    anchor: 'R10–R11: platform diversity / multi-cloud',
    hint1: 'A single cloud vendor outage takes down everything that runs only on that vendor.',
    hint2: 'Multi-cloud means deploying across two or more cloud providers.',
    hint3: 'Platform diversity means running workloads on different OSs (e.g., Linux + Windows) so one CVE doesn\'t compromise the whole estate. You need BOTH enabled to survive the simulation.',
    feedback: 'Multi-cloud (R11) protects against a single cloud vendor outage: if AWS-East goes down, workloads on Azure stay up. Platform diversity (R10) protects against a single OS/app vulnerability: a Windows-wide CVE doesn\'t take down Linux workloads. Together they cover both vendor outage and vulnerability blast radius — which is exactly why CompTIA pairs them.',
  },
];

/* --- Hard objectives (9, including H9) --- */
const HARD_OBJECTIVES = [
  {
    id: 'OBJ-H1', pillar: 'P2', station: 'Continuity Bay — Incident Replay',
    text: 'Triage the incident timeline. Place the four failures in the exact order they cascaded.',
    anchor: 'O1–O2 + R6–R9 + S1–S3',
    hint1: 'Something happened first that triggered everything else. What did the team notice first?',
    hint2: 'The utility outage was the trigger; then the UPS ran out; then the single ISP couldn\'t reach the warm site; then the warm site itself wasn\'t ready.',
    feedback: 'Cascade order: (1) Regional utility outage strikes. (2) UPS exhausts its ~10 min of runtime (no generator). (3) Single ISP uplink goes down with the utility. (4) Warm recovery site is not yet synced — team has to wait 14h to bring it online, exceeding RTO by ~10h. Each stage is a separate resilience gap from the lesson: power (R6+R7), ISP (R9), recovery site readiness (S2 vs S1).',
  },
  {
    id: 'OBJ-H2', pillar: 'P4', station: 'Backup Vault',
    text: 'Design a complete backup architecture meeting RTO ≤ 4h and RPO ≤ 15min. Schedule + toggles + restore sequence.',
    anchor: 'B1–B7 + O1–O2',
    hint1: 'RPO ≤ 15min means a backup-type that runs at least every 15 minutes. Only one type is granular enough.',
    hint2: 'Snapshots at 15-min intervals meet RPO. A daily differential and weekly full anchor the chain. Then enable immutability, replication, and offsite.',
    hint3: 'For restore sequence: latest snapshot first (instant rollback), then differential, then full if a deeper rollback is needed.',
    feedback: 'Correct design: 15-min snapshots (meets RPO), daily differentials (faster restore than incrementals), weekly fulls (chain anchor), immutability ON (ransomware protection), replication ON (DR-ready copy), offsite ON (geographic isolation). Restore sequence: latest snapshot first → differential if snapshot doesn\'t reach the target point → full only for catastrophic rollback.',
  },
  {
    id: 'OBJ-H3', pillar: 'P4', station: 'Recovery Sites',
    text: 'Select a recovery site for each of the four business functions AND justify the cost/availability tradeoff.',
    anchor: 'S1–S3 + O1',
    hint1: 'Match RTO to site type. Hot = highest cost, lowest RTO. Cold = lowest cost, highest RTO.',
    hint2: 'Production payment gateway RTO minutes → hot. Warehouse ops RTO hours → hot/warm. Internal BI RTO day → warm. Archived HR RTO week → cold.',
    hint3: 'Justification must reference both the RTO requirement AND the cost/availability tradeoff.',
    feedback: 'Hot for payment gateway (RTO minutes; cost justified by revenue). Warm for warehouse ops (RTO hours; partial equipment saves cost). Warm or hot for inventory sync depending on revenue dependence. Cold for archived HR (RTO days-to-weeks; minimal equipment saves cost). The tradeoff: hot sites cost roughly 5–10× more than warm, and 50× more than cold — the question is whether the business survives the downtime.',
  },
  {
    id: 'OBJ-H4', pillar: 'P4', station: 'Test Director',
    text: 'Choose a recovery test for each of four scenarios, considering risk, cost, AND validation depth.',
    anchor: 'T1–T5',
    hint1: 'Pick the deepest test that the risk and budget allow. Cheap tests validate the plan; expensive tests validate the systems.',
    hint2: 'New plan first run → tabletop. Verify redundant systems work → failover. Validate DR site without prod impact → parallel. Confidence the full cutover works → cutover (with executive sign-off because it\'s risky).',
    hint3: 'Avoid cutover tests when the business cannot tolerate even a brief outage window. CompTIA tests this judgment, not just the definitions.',
    feedback: 'Tabletop validates the plan; simulation validates procedures; failover validates redundancy; parallel validates DR site without production impact; cutover is the highest-confidence, highest-risk test. The judgment the exam tests: pick the deepest test the business can tolerate. If the answer says "always do a cutover test," that\'s wrong — cutover is reserved for organizations that can absorb the risk.',
  },
  {
    id: 'OBJ-H5', pillar: 'P3', station: 'Continuity Library',
    text: 'Build the BCP / DRP / COOP document tree. Match each of the six artifacts to the plan that owns it.',
    anchor: 'P1–P3',
    hint1: 'BCP owns business-facing artifacts; DRP owns IT/system artifacts; COOP owns mission-essential manual-fallback artifacts.',
    hint2: 'Call tree, vendor contact list, crisis comms → BCP. Server runbook, disk image inventory, restore sequences → DRP. Manual transaction log procedure, offline paper receipts procedure → COOP.',
    feedback: 'BCP: executive call tree, vendor/supplier contact list, crisis communication plan, business impact analysis. DRP: server runbook, asset/disk-image inventory, restore sequences, network failover procedures. COOP: manual transaction procedures, offline receipt procedures, mission-essential function roster. The exam tests whether you can identify the owning plan, not just the definition.',
  },
  {
    id: 'OBJ-H6', pillar: 'P3', station: 'Capacity Desk',
    text: 'Match each of four demand scenarios to the correct capacity-planning strategy: people, technology, or infrastructure.',
    anchor: 'C1–C5',
    hint1: 'People strategy handles demand for skills/staff; technology handles demand for compute/services; infrastructure handles physical capacity.',
    hint2: 'Seasonal support-call spike → people (more staff). Holiday web traffic surge → technology (autoscale/cloud). Building new data center → infrastructure (physical).',
    feedback: 'People (C1): seasonal support spikes, training programs, hiring/training cycles. Technology (C2): web traffic surges (autoscale/cloud), database load (read replicas). Infrastructure (C3): building a new data center, racking additional hosts, supply-chain lead times. Asset management (C4) and supply chain (C5) are sub-considerations within each strategy — knowing what you have and how fast you can replace it.',
  },
  {
    id: 'OBJ-H7', pillar: 'P4', station: 'Redundancy Rack',
    text: 'Configure platform diversity + multi-cloud + redundancy to survive a vendor outage simulation. Enable the minimum set that survives.',
    anchor: 'R1–R11',
    hint1: 'A vendor outage means a single cloud provider goes down AND/OR a single OS-vendor vulnerability hits.',
    hint2: 'You need multi-cloud (one vendor down, others up) AND platform diversity (one OS compromised, others safe).',
    hint3: 'Clustering across clouds (R2 + R11) and load balancing across platforms (R1 + R10) is the full defensive set. Minimum to survive: multiCloud + platformDiversity + (loadBalancer OR clustering).',
    feedback: 'Survival requires multi-cloud (R11) so one vendor outage doesn\'t take down everything AND platform diversity (R10) so one OS vulnerability doesn\'t compromise every workload. Adding clustering (R2) and/or load balancing (R1) lets traffic fail over to the surviving platforms/clouds in real time. Without multi-cloud, a vendor outage is fatal. Without platform diversity, a vendor-wide CVE is fatal. Without load balancing or clustering, the failover is manual and slow.',
  },
  {
    id: 'OBJ-H8', pillar: 'P4', station: 'Continuity Bay — DR Execution',
    text: 'Execute a complete disaster recovery: choose backup type → restore sequence → failover site → run test. Place the four steps in correct order.',
    anchor: 'B1–B7 + S1–S3 + T1–T5 + O1',
    hint1: 'DR execution order: assess → restore data → fail over traffic → verify.',
    hint2: 'Pick the correct backup first (the most recent restorable point that meets RPO), then the sequence of restore steps, then fail over to the recovery site, then run the recovery test.',
    feedback: 'Correct sequence: (1) Choose the most recent restorable backup type meeting RPO (snapshot if available — fastest). (2) Restore in sequence (snapshot → differential → full if needed). (3) Fail over traffic to the chosen recovery site. (4) Run the recovery test (parallel or cutover) to verify the new environment serves production load. Skipping or reordering steps risks restoring to stale data, failing over before data is ready, or going live without verification.',
  },
  {
    id: 'OBJ-H9', pillar: 'P1', station: 'Knowledge Core',
    text: 'Match each of the four resilience domains to the failure mode it primarily prevents.',
    anchor: 'B1–B7 + R1–R11 + P1–P3 + T1–T5 (all four domains)',
    hint1: 'Each domain prevents a different class of failure: data loss, component failure, site-wide disaster, and undiscovered plan gaps.',
    hint2: 'Backups prevent data loss. Redundancy prevents component failures. Recovery sites prevent site-wide disasters. Testing prevents undiscovered gaps.',
    feedback: 'Backups prevent DATA LOSS (corruption, deletion, ransomware). Redundancy prevents COMPONENT FAILURES (hardware, power, network). Recovery Planning (BCP/DRP/COOP + sites) prevents SITE-WIDE DISASTERS from stopping the business. Testing prevents UNDISCOVERED GAPS — a plan that has never been exercised almost always fails on first contact with reality. All four are independently necessary: no single domain covers the others.',
  },
];

/* --- Medium quiz (7 items) --- */
const MEDIUM_QUIZ = [
  {
    id: 'MQ1',
    scenario: 'A ransomware attack encrypts the primary file server. The admin starts a restore and discovers the last Full backup was 30 days ago, with daily incrementals since.',
    question: 'Why is this restore going to be slow and risky?',
    options: [
      { key: 'a', label: 'The Full backup is too large to restore within the RTO window.' },
      { key: 'b', label: 'Incrementals do not capture changed data.' },
      { key: 'c', label: 'A 30-link incremental chain replays slowly and breaks if any link fails.' },
      { key: 'd', label: 'Ransomware cannot encrypt backup files.' },
    ],
    correct: 'c',
    explanation: 'Correct (c): a chain of 30 incrementals must be replayed in exact order on top of the Full — any missing or corrupted incremental breaks the chain. (a) is wrong because the Full size is not the bottleneck here. (b) is wrong because incrementals DO capture changed data — that is their purpose. (d) is wrong because ransomware actively hunts and encrypts or deletes backups. Differentials would have been safer: only the latest differential + the Full is needed.',
  },
  {
    id: 'MQ2',
    scenario: 'Your CFO says: "We cannot tolerate losing more than 1 hour of customer order data, and we must be back online within 4 hours."',
    question: 'Which combination of objectives is the CFO stating?',
    options: [
      { key: 'a', label: 'RPO = 1h, RTO = 4h' },
      { key: 'b', label: 'RPO = 4h, RTO = 1h' },
      { key: 'c', label: 'MTTR = 1h, MTBF = 4h' },
      { key: 'd', label: 'MTBF = 1h, MTTR = 4h' },
    ],
    correct: 'a',
    explanation: 'Correct (a): RPO = max acceptable data loss = 1h; RTO = max acceptable downtime = 4h. (b) swaps them — a common exam trap. (c) and (d) mix in MTTR/MTBF, which are operational reliability metrics (mean time to repair / mean time between failures), not business-pain targets. The exam pairs RPO with backup frequency (RPO ≤ backup interval) and RTO with recovery site + redundancy readiness.',
  },
  {
    id: 'MQ3',
    scenario: 'A regional power outage lasted 9 hours. The team had a UPS but no generator.',
    question: 'Why did the system go down despite having a UPS?',
    options: [
      { key: 'a', label: 'The UPS was misconfigured by the vendor.' },
      { key: 'b', label: 'A UPS only guards against voltage spikes.' },
      { key: 'c', label: 'A UPS requires a generator to function at all.' },
      { key: 'd', label: 'A UPS bridges only minutes, not a multi-hour outage.' },
    ],
    correct: 'd',
    explanation: 'Correct (d): a UPS bridges the seconds-to-minutes gap between utility failure and generator spin-up. Without a generator, the UPS exhausts its runtime (typically 5–30 minutes) and the system goes down. (a) is wrong — the UPS was working as designed; the gap was the missing generator. (b) is wrong — a UPS protects against outages, not just voltage spikes (that describes a surge protector). (c) is wrong — a UPS functions independently; the generator extends runtime. CompTIA pairs UPS, generators, dual PSUs, and redundant circuits as a single resilience family.',
  },
  {
    id: 'MQ4',
    scenario: 'You need to choose a recovery site for an internal HR document archive. The business can tolerate up to a week of downtime.',
    question: 'Which site type is the most cost-effective choice?',
    options: [
      { key: 'a', label: 'Hot site — synced, minutes to operational' },
      { key: 'b', label: 'Cold site — power and connectivity, days-to-weeks' },
      { key: 'c', label: 'Warm site — partial equipment, hours-to-days' },
      { key: 'd', label: 'No recovery site — accept the risk' },
    ],
    correct: 'b',
    explanation: 'Correct (b): a cold site provides power and connectivity only, taking days-to-weeks to become operational — which fits an RTO measured in a week. (a) hot site is 50× more expensive and overkill for low-priority archives. (c) warm site is still more than needed. (d) accepting the risk is a business decision, not a cost-effective recovery strategy. Match RTO to site type: shortest RTO → hot; longest RTO → cold.',
  },
  {
    id: 'MQ5',
    scenario: 'Your DR plan exists on paper but has never been tested.',
    question: 'What is the cheapest first test to validate the plan with stakeholders?',
    options: [
      { key: 'a', label: 'Cutover test — switch production to DR' },
      { key: 'b', label: 'Parallel test — run DR alongside production' },
      { key: 'c', label: 'No test needed — the plan is documented' },
      { key: 'd', label: 'Tabletop exercise — paper walkthrough' },
    ],
    correct: 'd',
    explanation: 'Correct (d): a tabletop exercise is a paper walkthrough that identifies plan gaps without touching production. It is the cheapest first test. (a) cutover is the most expensive and risky — it switches real production. (b) parallel is more realistic but still costly. (c) is wrong — a documented plan is NOT a validated plan; CompTIA emphasizes that untested plans almost always fail on first contact. Run tabletop → simulation → failover → parallel → cutover in increasing depth.',
  },
  {
    id: 'MQ6',
    scenario: 'Your organization runs all workloads on a single cloud provider (AWS only) on a single OS (Windows only).',
    question: 'What resilience risk does this configuration create?',
    options: [
      { key: 'a', label: 'A single cloud or OS vendor outage takes down everything.' },
      { key: 'b', label: 'Only AWS region outages are a concern for this setup.' },
      { key: 'c', label: 'Only Windows-wide CVEs are a concern.' },
      { key: 'd', label: 'Cloud providers are inherently resilient by design.' },
    ],
    correct: 'a',
    explanation: 'Correct (a): both vendor-outage and OS-vulnerability risks exist simultaneously. Multi-cloud (2+ providers) protects against a single-vendor outage. Platform diversity (multiple OSs) protects against a single-vendor CVE. (b) and (c) are each only half the risk. (d) is wrong — cloud providers do fail (us-east-1 has gone down multiple times). CompTIA pairs multi-cloud and platform diversity because together they cover both failure modes.',
  },
  {
    id: 'MQ7',
    scenario: 'You take a daily incremental backup at 02:00. A user deletes critical files at 14:00.',
    question: 'How much data is at risk of being unrecoverable if the system fails right now (before tonight\'s backup)?',
    options: [
      { key: 'a', label: '0 hours — incremental backups capture changes continuously in real time' },
      { key: 'b', label: 'Up to 24 hours — RPO equals the backup interval' },
      { key: 'c', label: '2 hours — only time since the deletion' },
      { key: 'd', label: 'Nothing — files are in the recycle bin' },
    ],
    correct: 'b',
    explanation: 'Correct (b): daily incrementals give an RPO of up to 24 hours — the maximum time between successful backups. If you need RPO ≤ 1h, you need hourly snapshots or incrementals. (a) is wrong — incrementals run on a schedule, not continuously. (c) is wrong — the risk started at the last successful backup (02:00), not at the deletion time (14:00). (d) is a non-technical answer that does not address the recovery question. RPO always equals the maximum acceptable interval between successful backups.',
  },
];

/* --- Hard quiz (8 items) --- */
const HARD_QUIZ = [
  {
    id: 'HQ1',
    scenario: 'A financial-services firm requires RTO = 4h and RPO = 15min for its trading platform. Current backups: weekly Fulls, daily Differentials. No replication. No immutability.',
    question: 'Which set of changes is the MINIMUM to meet BOTH objectives?',
    options: [
      { key: 'a', label: 'Switch Differentials to Incrementals only.' },
      { key: 'b', label: 'Add a generator and a cold site.' },
      { key: 'c', label: 'Add 15-min snapshots, replication, immutability, hot site.' },
      { key: 'd', label: 'Enable replication on existing Fulls only.' },
    ],
    correct: 'c',
    explanation: 'Correct (c): RPO ≤ 15min requires snapshots every ≤15 min; immutability protects them from ransomware; replication puts a DR-ready copy at the recovery site; the hot site meets the 4h RTO. (a) is wrong — switching to incrementals does not change the RPO (still daily) or add immutability/replication. (b) is wrong — a generator and cold site address power and recovery site, but not RPO or ransomware. (d) is wrong — replication alone does not meet RPO or add immutability.',
  },
  {
    id: 'HQ2',
    scenario: 'Your CISO wants a recovery test that proves the DR site can serve production load — but the business cannot tolerate any production downtime.',
    question: 'Which test type fits these constraints?',
    options: [
      { key: 'a', label: 'Cutover test — switch production to DR.' },
      { key: 'b', label: 'Parallel test — run DR alongside production.' },
      { key: 'c', label: 'Tabletop exercise — paper walkthrough.' },
      { key: 'd', label: 'Skip the test — too risky.' },
    ],
    correct: 'b',
    explanation: 'Correct (b): a parallel test runs the DR site alongside production, with both processing load. It validates that the DR site can serve production without taking production down. (a) cutover is the higher-confidence test but carries production downtime risk — wrong fit here. (c) tabletop is cheap but does not prove the DR site serves real load. (d) skipping the test leaves the gap unverified — exactly what the CISO wants to avoid.',
  },
  {
    id: 'HQ3',
    scenario: 'A vendor patch introduces a critical bug that crashes every server running that OS. You run Windows-only on AWS-only.',
    question: 'Which configuration change would have prevented total service loss?',
    options: [
      { key: 'a', label: 'Add another AWS region to the existing deployment.' },
      { key: 'b', label: 'Add a UPS to each host.' },
      { key: 'c', label: 'Add a generator to the site.' },
      { key: 'd', label: 'Add a Linux tier and a second cloud.' },
    ],
    correct: 'd',
    explanation: 'Correct (d): platform diversity (a Linux tier) keeps workloads running on the unaffected OS; multi-cloud (a second provider) keeps workloads running on the unaffected cloud. (a) another AWS region does not help — the bug is OS-wide, not region-specific. (b) a UPS addresses power failure, not OS bugs. (c) a generator addresses power, not OS bugs. The bug is Windows-wide; only a different OS would survive. The cloud concentration is AWS-wide; only a different cloud would survive.',
  },
  {
    id: 'HQ4',
    scenario: 'You review an organization\'s recovery plans. Artifacts found: (1) executive call tree, (2) server restore runbook, (3) manual credit-card slip procedure, (4) vendor contact list, (5) disk image inventory, (6) paper receipt procedure.',
    question: 'Which artifacts belong in the COOP?',
    options: [
      { key: 'a', label: '3 and 6 — manual fallback procedures.' },
      { key: 'b', label: '1 and 4 — contact artifacts.' },
      { key: 'c', label: '2 and 5 — IT restore artifacts.' },
      { key: 'd', label: 'All six — COOP contains everything.' },
    ],
    correct: 'a',
    explanation: 'Correct (a): COOP (Continuity of Operations Plan) owns mission-essential manual procedures used when technology is unavailable — manual credit-card slips (3) and paper receipts (6). (b) the call tree (1) and vendor list (4) are BCP artifacts — business-facing. (c) the server runbook (2) and disk inventory (5) are DRP artifacts — IT-focused. (d) is wrong — COOP is the narrowest of the three plans, not a superset. BCP is the broadest, DRP is the IT subset, COOP is mission-essential only.',
  },
  {
    id: 'HQ5',
    scenario: 'An e-commerce company has a holiday traffic surge predicted at 3× normal load for two weeks. They have ample budget but limited data center space.',
    question: 'Which capacity strategy is the best fit?',
    options: [
      { key: 'a', label: 'People — hire more support staff.' },
      { key: 'b', label: 'Technology — autoscale into the cloud.' },
      { key: 'c', label: 'Infrastructure — build a new data center.' },
      { key: 'd', label: 'Do nothing — current capacity is fine.' },
    ],
    correct: 'b',
    explanation: 'Correct (b): a predictable, time-bounded surge is the textbook case for technology capacity — cloud autoscale spins up extra capacity for the two-week window and rightsizes afterward. (a) hiring people does not address compute capacity (and takes weeks to onboard). (c) building a data center takes months and is wrong for a temporary surge. (d) is wrong — 3× load on current capacity would cause slowdowns or outages. Capacity planning matches the supply strategy to the demand pattern.',
  },
  {
    id: 'HQ6',
    scenario: 'You inherit a backup schedule: monthly Fulls, daily Incrementals, no snapshots, no replication, no immutability. RTO = 8h, RPO = 24h.',
    question: 'Which is the SINGLE most urgent change to reduce ransomware risk to backups?',
    options: [
      { key: 'a', label: 'Switch incrementals to differentials.' },
      { key: 'b', label: 'Add an hourly snapshot schedule.' },
      { key: 'c', label: 'Switch to a hot recovery site.' },
      { key: 'd', label: 'Enable immutability on the Fulls.' },
    ],
    correct: 'd',
    explanation: 'Correct (d): ransomware actively hunts and deletes backups. Without immutability, the monthly Full is the highest-value target — losing it destroys the entire chain. Enabling immutability on Fulls (and ideally all backups) is the single most urgent change. (a) switching to differentials improves restore speed but does not stop ransomware deletion. (b) adding snapshots improves RPO but snapshots are also deletable without immutability. (c) a hot site improves RTO but does not protect backups from ransomware. Immutability is the ransomware-specific defense.',
  },
  {
    id: 'HQ7',
    scenario: 'A disaster strikes. Rank the four steps in correct order: (1) restore data, (2) run recovery test, (3) choose restorable backup, (4) fail over traffic to recovery site.',
    question: 'What is the correct execution order?',
    options: [
      { key: 'a', label: '3 → 1 → 4 → 2 — choose, restore, failover, test.' },
      { key: 'b', label: '4 → 1 → 3 → 2 — failover before restore.' },
      { key: 'c', label: '2 → 3 → 1 → 4 — test before anything.' },
      { key: 'd', label: '1 → 3 → 4 → 2 — restore before choosing.' },
    ],
    correct: 'a',
    explanation: 'Correct (a): choose the restorable backup meeting RPO (3) → restore the data in sequence (1) → fail over traffic to the recovery site (4) → run a recovery test to verify the new environment serves production (2). (b) failing over before data is restored sends users to an empty site. (c) testing first is wrong — there is nothing to test yet. (d) restoring before choosing a backup is impossible — you must know which backup to restore from first.',
  },
  {
    id: 'HQ8',
    scenario: 'A small business has a 4-hour UPS, single ISP, single cloud, single OS, weekly backups, and no recovery plan.',
    question: 'In what order should you remediate to maximize resilience per dollar spent FIRST?',
    options: [
      { key: 'a', label: 'Add generator first, then the rest.' },
      { key: 'b', label: 'Enable multi-cloud first, then the rest.' },
      { key: 'c', label: 'Document the plan, then fix backups, ISP, cloud, power.' },
      { key: 'd', label: 'Add a hot recovery site first, then fix the rest.' },
    ],
    correct: 'c',
    explanation: 'Correct (c): highest resilience-per-dollar first. (1) Document a BCP/DRP — cheap, huge uplift. (2) Move from weekly to daily backups — cheap, cuts RPO from 7 days to 1 day. (3) Add ISP redundancy — moderate cost, eliminates a SPOF. (4) Multi-cloud — moderate cost, eliminates vendor SPOF. (5) Generator — expensive, addresses the rare long outage. (a) generator-first is wrong — the UPS already covers short outages, so the generator is the lowest-priority fix. (b) multi-cloud-first ignores cheaper, higher-impact fixes. (d) a hot site is the most expensive single fix and premature without a plan to operate it.',
  },
];

/* --- Backup types (for OBJ-M1 ordering) --- */
const BACKUP_TYPES = [
  { id: 'full', label: 'Full Backup', desc: 'Every selected object; the chain anchor.' },
  { id: 'differential', label: 'Differential Backup', desc: 'All changes since the last Full.' },
  { id: 'incremental', label: 'Incremental Backup', desc: 'Only changes since the last backup of any type.' },
  { id: 'snapshot', label: 'Snapshot', desc: 'Point-in-time state capture for VMs/cloud.' },
];
const CORRECT_BACKUP_ORDER = ['full', 'differential', 'incremental', 'snapshot'];

/* --- Metrics (for OBJ-M2) --- */
const METRICS = [
  { id: 'rto', label: 'RTO (Recovery Time Objective)' },
  { id: 'rpo', label: 'RPO (Recovery Point Objective)' },
  { id: 'mttr', label: 'MTTR (Mean Time to Repair)' },
  { id: 'mtbf', label: 'MTBF (Mean Time Between Failures)' },
];
const METRIC_DEFS = [
  { key: 'max_downtime', label: 'Maximum acceptable downtime before a process must be restored.', correct: 'rto' },
  { key: 'max_dataloss', label: 'Maximum acceptable data loss, measured in time.', correct: 'rpo' },
  { key: 'avg_repair', label: 'Average time required to repair a failed component.', correct: 'mttr' },
  { key: 'avg_failure_interval', label: 'Average time a component runs before failing.', correct: 'mtbf' },
];

/* --- Business functions (for OBJ-M6 / OBJ-H3) --- */
const BUSINESS_FUNCTIONS_MEDIUM = [
  { id: 'ecom', name: 'Production e-commerce platform', rto: 'minutes-to-1h', correct: 'hot' },
  { id: 'reporting', name: 'Internal BI / reporting warehouse', rto: '1-2 days', correct: 'warm' },
  { id: 'hr', name: 'Archived HR document repository', rto: '1 week+', correct: 'cold' },
];
const BUSINESS_FUNCTIONS_HARD = [
  { id: 'payment', name: 'Payment gateway (revenue-critical)', rto: 'minutes', correct: 'hot', justification: 'revenue' },
  { id: 'warehouse', name: 'Warehouse ops & shipping dispatch', rto: 'hours', correct: 'warm', justification: 'operations' },
  { id: 'bi', name: 'Internal BI & reporting warehouse', rto: '1-2 days', correct: 'warm', justification: 'business_continuity' },
  { id: 'hr', name: 'Archived HR document repository', rto: '1 week+', correct: 'cold', justification: 'cost' },
];
const SITE_TYPES = [
  { id: 'hot', label: 'Hot Site', desc: 'Fully equipped & constantly synced. Operational in minutes-to-hours. Highest cost.', cost: '5–10× warm' },
  { id: 'warm', label: 'Warm Site', desc: 'Partial equipment + data. Hours-to-days to operational. Mid-range cost.', cost: '2–4× cold' },
  { id: 'cold', label: 'Cold Site', desc: 'Power & connectivity only. Days-to-weeks to operational. Lowest cost.', cost: 'baseline' },
];

/* --- Continuity artifacts (for OBJ-M8 / OBJ-H5) --- */
const CONTINUITY_ARTIFACTS_MEDIUM = [
  { id: 'calltree', label: 'Executive call tree', correct: true },
  { id: 'vendorlist', label: 'Vendor / supplier contact list', correct: true },
  { id: 'crisiscomms', label: 'Crisis communication plan', correct: true },
  { id: 'runbook', label: 'Server restore runbook', correct: false },
  { id: 'diskimage', label: 'Disk image inventory', correct: false },
  { id: 'manualproc', label: 'Manual credit-card slip procedure', correct: false },
];
const CONTINUITY_ARTIFACTS_HARD = [
  { id: 'calltree', label: 'Executive call tree', correct: 'BCP' },
  { id: 'vendorlist', label: 'Vendor / supplier contact list', correct: 'BCP' },
  { id: 'crisiscomms', label: 'Crisis communication plan', correct: 'BCP' },
  { id: 'runbook', label: 'Server restore runbook', correct: 'DRP' },
  { id: 'diskimage', label: 'Disk image inventory', correct: 'DRP' },
  { id: 'manualproc', label: 'Manual credit-card slip procedure', correct: 'COOP' },
  { id: 'paperreceipt', label: 'Paper receipt procedure', correct: 'COOP' },
  { id: 'restoreseq', label: 'Restore sequence document', correct: 'DRP' },
  { id: 'bia', label: 'Business impact analysis', correct: 'BCP' },
];

/* --- Recovery test scenarios (for OBJ-M11 / OBJ-H4) --- */
const TEST_SCENARIOS_MEDIUM = [
  { id: 's1', scenario: 'Walk through the DR plan with stakeholders on paper, no production impact.', correct: 'tabletop' },
  { id: 's2', scenario: 'Verify redundant systems actually take over when primary fails.', correct: 'failover' },
  { id: 's3', scenario: 'Run the DR site alongside production so both process load.', correct: 'parallel' },
  { id: 's4', scenario: 'Actually switch production traffic to the DR site for a planned window.', correct: 'cutover' },
];
const TEST_TYPES = [
  { id: 'tabletop', label: 'Tabletop Exercise', desc: 'Paper walkthrough; cheapest; identifies plan gaps.' },
  { id: 'simulation', label: 'Simulation', desc: 'Partial test of recovery procedures; no production impact.' },
  { id: 'failover', label: 'Failover Test', desc: 'Verify redundant components actually take over.' },
  { id: 'parallel', label: 'Parallel Test', desc: 'DR site runs alongside production; both process load.' },
  { id: 'cutover', label: 'Cutover / Full Interruption', desc: 'Actually switch production to DR; highest risk, highest confidence.' },
];
const TEST_SCENARIOS_HARD = [
  { id: 'hs1', scenario: 'First-ever validation of a newly written DR plan. The team has never rehearsed it.', correct: 'tabletop' },
  { id: 'hs2', scenario: 'A redundant firewall pair must be verified to actually take over when the primary fails.', correct: 'failover' },
  { id: 'hs3', scenario: 'The business cannot tolerate any production downtime but needs high confidence the DR site serves real load.', correct: 'parallel' },
  { id: 'hs4', scenario: 'Regulator requires evidence that a full switchover works. Business can absorb a planned Sunday outage window.', correct: 'cutover' },
];

/* --- Capacity scenarios (for OBJ-H6) --- */
const CAPACITY_SCENARIOS_HARD = [
  { id: 'cs1', scenario: 'Holiday shopping surge: 3× normal web traffic for two weeks, then back to baseline.', correct: 'technology' },
  { id: 'cs2', scenario: 'Customer support team needs 2× staff during a product recall lasting 6 weeks.', correct: 'people' },
  { id: 'cs3', scenario: 'Organization is opening a new regional headquarters and needs to rack 30 new hosts.', correct: 'infrastructure' },
  { id: 'cs4', scenario: 'Sales team adopts a new CRM that doubles database load permanently.', correct: 'technology' },
];
const CAPACITY_TYPES = [
  { id: 'people', label: 'People', desc: 'Hiring, training, reassignment. Slow to scale up/down.' },
  { id: 'technology', label: 'Technology', desc: 'Autoscale, cloud burst, replicas. Fast to scale.' },
  { id: 'infrastructure', label: 'Infrastructure', desc: 'Physical data center, racking, supply-chain lead times.' },
];

/* --- Cascade steps (for OBJ-H1) --- */
const CASCADE_STEPS = [
  { id: 'c1', label: 'Regional utility power outage strikes the primary site.' },
  { id: 'c2', label: 'UPS exhausts its ~10 minutes of runtime — no generator available.' },
  { id: 'c3', label: 'Single ISP uplink drops with the utility — no redundant ISP.' },
  { id: 'c4', label: 'Warm recovery site is not synced — team waits 14h to bring it online.' },
];
const CORRECT_CASCADE = ['c1', 'c2', 'c3', 'c4'];

/* --- Restore steps (for OBJ-H2 / OBJ-H8) --- */
const RESTORE_STEPS = [
  { id: 'rs_choose', label: 'Choose most recent restorable backup meeting RPO (snapshot if available)' },
  { id: 'rs_snapshot', label: 'Restore latest snapshot (instant rollback point)' },
  { id: 'rs_diff', label: 'Apply latest differential if deeper rollback needed' },
  { id: 'rs_full', label: 'Fall back to weekly Full only for catastrophic rollback' },
  { id: 'rs_failover', label: 'Fail over traffic to the recovery site' },
  { id: 'rs_test', label: 'Run parallel test to verify the new environment serves load' },
];
const CORRECT_RESTORE_H2 = ['rs_choose', 'rs_snapshot', 'rs_diff', 'rs_full'];
const CORRECT_RESTORE_H8 = ['rs_choose', 'rs_snapshot', 'rs_failover', 'rs_test'];

/* --- Domain matching (for OBJ-H9) --- */
const RESILIENCE_DOMAINS = [
  { id: 'backups', label: 'Backups' },
  { id: 'redundancy', label: 'Redundancy' },
  { id: 'recovery_planning', label: 'Recovery Planning' },
  { id: 'testing', label: 'Testing' },
];
const FAILURE_MODES = [
  { key: 'data_loss', label: 'Data loss (corruption, deletion, ransomware)' },
  { key: 'component_failure', label: 'Component failure (hardware, power, network)' },
  { key: 'site_wide_disaster', label: 'Site-wide disaster requiring failover' },
  { key: 'undiscovered_gaps', label: 'Undiscovered gaps in the recovery plan' },
];
const CORRECT_DOMAIN_MATCHES = {
  backups: 'data_loss',
  redundancy: 'component_failure',
  recovery_planning: 'site_wide_disaster',
  testing: 'undiscovered_gaps',
};

/* --- Backup schedule frequency options --- */
const FREQ_OPTIONS = [
  { value: 'none', label: 'Off' },
  { value: '15min', label: 'Every 15 min' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

/* --- Redundancy rack controls --- */
const REDUNDANCY_CONTROLS = [
  { id: 'dualPsu', label: 'Dual Power Supply', icon: 'power', desc: 'Host survives PSU failure' },
  { id: 'ups', label: 'UPS', icon: 'battery', desc: 'Short-term power bridge' },
  { id: 'generator', label: 'Generator', icon: 'zap', desc: 'Long-term power' },
  { id: 'redundantCircuits', label: 'Redundant Circuits', icon: 'power', desc: 'Multiple utility feeds' },
  { id: 'nicTeaming', label: 'NIC Teaming', icon: 'network', desc: 'Multi-NIC logical interface' },
  { id: 'portAggregation', label: 'Port Aggregation', icon: 'network', desc: 'Multi-port throughput' },
  { id: 'clustering', label: 'Clustering', icon: 'server-cog', desc: 'Multi-host logical server' },
  { id: 'loadBalancer', label: 'Load Balancer', icon: 'workflow', desc: 'Traffic distribution' },
  { id: 'redundantIsp', label: 'Redundant ISP', icon: 'network', desc: 'Multiple ISPs' },
  { id: 'platformDiversity', label: 'Platform Diversity', icon: 'layers', desc: 'Multiple OSs/vendors' },
  { id: 'multiCloud', label: 'Multi-Cloud', icon: 'cloud', desc: 'Multiple cloud providers' },
];

/* --- Data center SPOF items (for OBJ-M5) --- */
const SPOF_ITEMS = [
  { id: 'spof_isp', label: 'ISP Uplink', desc: 'Single ISP, no redundant ISP', isSpof: true },
  { id: 'spof_ups', label: 'UPS (no generator)', desc: '10-min runtime, no generator', isSpof: true },
  { id: 'spof_psu', label: 'Server PSU', desc: 'Single PSU per host', isSpof: true },
  { id: 'spof_nic', label: 'Server NIC', desc: 'No NIC teaming', isSpof: true },
  { id: 'spof_rack', label: 'Server Rack (physical)', desc: 'Standard 42U rack — not a SPOF', isSpof: false },
  { id: 'spof_cooling', label: 'Cooling system', desc: 'CRAC unit present', isSpof: false },
];

/* --- Site justification options (for OBJ-H3) --- */
const JUSTIFICATION_OPTIONS = [
  { value: 'revenue', label: 'Revenue-critical — downtime cost justifies the premium' },
  { value: 'operations', label: 'Operations continuity — partial equipment saves cost vs hot' },
  { value: 'business_continuity', label: 'Business continuity — important but tolerable delay' },
  { value: 'cost', label: 'Cost-optimal — RTO measured in days/weeks tolerates minimal equipment' },
];

/* --- Glossary --- */
const GLOSSARY = [
  ['RTO (Recovery Time Objective)', 'Maximum acceptable downtime before a process must be restored.'],
  ['RPO (Recovery Point Objective)', 'Maximum acceptable data loss measured in time. Sets backup frequency.'],
  ['MTTR (Mean Time to Repair)', 'Average time to restore a failed component.'],
  ['MTBF (Mean Time Between Failures)', 'Average time a component runs before failing.'],
  ['BCP (Business Continuity Plan)', 'Enterprise-wide plan to keep the business running during disruption.'],
  ['DRP (Disaster Recovery Plan)', 'IT-focused plan to restore systems and data; subset of BCP.'],
  ['COOP (Continuity of Operations Plan)', 'Mission-essential functions during prolonged disruption; often non-technical.'],
  ['Hot Site', 'Fully equipped, constantly synced recovery site; operational in minutes-to-hours.'],
  ['Warm Site', 'Partial equipment/data; hours-to-days to operational.'],
  ['Cold Site', 'Power & connectivity only; days-to-weeks to operational.'],
  ['Full Backup', 'Every selected object; the chain anchor.'],
  ['Incremental Backup', 'Only changes since the last backup of any type.'],
  ['Differential Backup', 'Only changes since the last Full backup.'],
  ['Snapshot', 'Point-in-time state capture (common for VMs/cloud).'],
  ['Immutability', 'Backups cannot be modified or deleted; ransomware protection.'],
  ['Replication', 'Near-real-time copy of data to another location.'],
  ['NIC Teaming', 'Multiple NICs acting as one logical interface for throughput + redundancy.'],
  ['Platform Diversity', 'Using different OSs/vendors to limit single-vulnerability blast radius.'],
  ['Multi-Cloud', 'Using more than one cloud provider for availability and vendor isolation.'],
  ['Tabletop Exercise', 'Paper walkthrough of the recovery plan; cheapest test.'],
  ['Cutover Test', 'Actually switch production to DR; highest risk, highest confidence.'],
];

/* --- Storage key (must match original) --- */
const STORAGE_KEY = 'continuity-bay-state-v1';

/* Expose globally */
window.LAB_DATA = {
  PILLAR_META, STATIONS,
  MEDIUM_OBJECTIVES, HARD_OBJECTIVES,
  MEDIUM_QUIZ, HARD_QUIZ,
  BACKUP_TYPES, CORRECT_BACKUP_ORDER,
  METRICS, METRIC_DEFS,
  BUSINESS_FUNCTIONS_MEDIUM, BUSINESS_FUNCTIONS_HARD, SITE_TYPES,
  CONTINUITY_ARTIFACTS_MEDIUM, CONTINUITY_ARTIFACTS_HARD,
  TEST_SCENARIOS_MEDIUM, TEST_TYPES, TEST_SCENARIOS_HARD,
  CAPACITY_SCENARIOS_HARD, CAPACITY_TYPES,
  CASCADE_STEPS, CORRECT_CASCADE,
  RESTORE_STEPS, CORRECT_RESTORE_H2, CORRECT_RESTORE_H8,
  RESILIENCE_DOMAINS, FAILURE_MODES, CORRECT_DOMAIN_MATCHES,
  FREQ_OPTIONS, REDUNDANCY_CONTROLS, SPOF_ITEMS,
  JUSTIFICATION_OPTIONS, GLOSSARY, STORAGE_KEY,
};
