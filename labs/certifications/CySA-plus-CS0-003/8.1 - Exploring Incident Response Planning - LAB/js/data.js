/**
 * CyberLab — CompTIA CySA+ CS0-003 · Lesson 8.1 "Exploring Incident Response Planning"
 * Content data layer — 1:1 port of the original lab's src/lib/lab/content.ts
 * (plus the Field Notes constants from src/components/lab/debrief.tsx).
 * All data is synthetic training data for a fictional organization
 * ("Atlas Freight & Logistics"). Defensive/educational use only.
 *
 * This file is data only — no logic. See state.js / objectives.js / app.js.
 */

/* ------------------------------------------------------------------ */
/* Sections (the Binder tabs)                                          */
/* ------------------------------------------------------------------ */

const SECTIONS = [
  {
    key: 'phases',
    label: 'Lifecycle Ledger',
    code: 'SEC-01',
    icon: 'GitCommitHorizontal',
    serves: [
      { mode: 'medium', objectiveIds: ['M1', 'M2', 'M12'] },
      { mode: 'hard', objectiveIds: ['H1'] },
    ],
    intro:
      'The spine of every incident response plan is the lifecycle. Atlas uses the six-phase model taught in CySA+ Lesson 8.1: Preparation, Identification, Containment, Eradication, Recovery, Lessons Learned.',
  },
  {
    key: 'team',
    label: 'CSIRT Roster',
    code: 'SEC-02',
    icon: 'Users',
    serves: [
      { mode: 'medium', objectiveIds: ['M3', 'M4'] },
      { mode: 'hard', objectiveIds: ['H2'] },
    ],
    intro:
      'A plan is only as good as the team it names. The Computer Security Incident Response Team (CSIRT) blends security skills with legal, communications and operations support.',
  },
  {
    key: 'triage',
    label: 'Triage Desk',
    code: 'SEC-03',
    icon: 'Siren',
    serves: [
      { mode: 'medium', objectiveIds: ['M5', 'M11'] },
      { mode: 'hard', objectiveIds: ['H3'] },
    ],
    intro:
      'The Identification phase includes classifying and prioritizing incidents. Atlas grades incidents SEV-1 (critical) to SEV-4 (low), and every grade carries a mandated escalation path.',
  },
  {
    key: 'plans',
    label: 'Plan Library',
    code: 'SEC-04',
    icon: 'LibraryBig',
    serves: [
      { mode: 'medium', objectiveIds: ['M6'] },
      { mode: 'hard', objectiveIds: ['H5'] },
    ],
    intro:
      'The IR plan does not stand alone. CySA+ expects you to tell apart the Incident Response Plan (IRP), Business Continuity Plan (BCP), Disaster Recovery Plan (DRP) and Continuity of Operations Plan (COOP).',
  },
  {
    key: 'comms',
    label: 'Comms Matrix',
    code: 'SEC-05',
    icon: 'RadioTower',
    serves: [
      { mode: 'medium', objectiveIds: ['M7'] },
      { mode: 'hard', objectiveIds: ['H6'] },
    ],
    intro:
      'The communication plan says who is told what, when, and through which channel — and what must wait for legal review. Getting this wrong leaks the incident or breaks disclosure duties.',
  },
  {
    key: 'exercises',
    label: 'Exercise Yard',
    code: 'SEC-06',
    icon: 'Dumbbell',
    serves: [
      { mode: 'medium', objectiveIds: ['M8'] },
      { mode: 'hard', objectiveIds: ['H4'] },
    ],
    intro:
      'CompTIA names five exercise types, from the discussion-based tabletop to the full-interruption test. Each proves something different — and each carries its own cost and risk.',
  },
  {
    key: 'vault',
    label: 'Evidence Vault',
    code: 'SEC-07',
    icon: 'Archive',
    serves: [
      { mode: 'medium', objectiveIds: ['M9'] },
      { mode: 'hard', objectiveIds: ['H7'] },
    ],
    intro:
      'Retention policies decide how long logs and evidence live — and a legal hold suspends destruction entirely. Evidence handling rules (chain of custody) keep it usable.',
  },
  {
    key: 'playbooks',
    label: 'Playbook Stand',
    code: 'SEC-08',
    icon: 'NotebookTabs',
    serves: [{ mode: 'medium', objectiveIds: ['M10'] }],
    intro:
      'Standardized processes are what make a response repeatable under stress. Playbooks are the step-by-step procedures for the incidents Atlas expects most.',
  },
  {
    key: 'audit',
    label: 'Plan Audit',
    code: 'SEC-09',
    icon: 'FileSearch',
    serves: [{ mode: 'hard', objectiveIds: ['H8'] }],
    intro:
      'A draft of the Atlas IR plan landed on your desk from the previous, disbanded program. The board asked for a red-team-grade review before sign-off. Some lines are defective; some only look that way.',
  },
  {
    key: 'warroom',
    label: 'War Room',
    code: 'SEC-10',
    icon: 'Tent',
    serves: [{ mode: 'hard', objectiveIds: ['H9'] }],
    intro:
      'Final gate before sign-off: a live-fire tabletop. Four injects will hit the room. Choose the correct action for each — the order is fixed, and the room is watching.',
  },
];

/* ------------------------------------------------------------------ */
/* Pillar metadata                                                     */
/* ------------------------------------------------------------------ */

/* chip classes are consumed by css/styles.css (pillar-chip--<pillar>) */
const PILLARS = {
  understand: { label: 'Understand', icon: 'Lightbulb', chip: 'pillar-chip--understand' },
  recognize: { label: 'Recognize', icon: 'Eye', chip: 'pillar-chip--recognize' },
  detect: { label: 'Detect', icon: 'Radar', chip: 'pillar-chip--detect' },
  mitigate: { label: 'Mitigate', icon: 'ShieldCheck', chip: 'pillar-chip--mitigate' },
};

/* ------------------------------------------------------------------ */
/* SEC-01 · Lifecycle Ledger — phases                                  */
/* ------------------------------------------------------------------ */

const PHASES = [
  {
    id: 'prep',
    name: 'Preparation',
    tagline: 'Build the capability before it is needed',
    detail:
      'Write and maintain the plan, playbooks and runbooks; train the team; run exercises; baseline systems; agree relationships with legal, HR, PR and vendors.',
  },
  {
    id: 'ident',
    name: 'Identification',
    tagline: 'Detect, analyze, classify, notify',
    detail:
      'Spot anomalies from telemetry, analyze and validate indicators, classify severity, declare the incident, and notify stakeholders per the communication plan.',
  },
  {
    id: 'contain',
    name: 'Containment',
    tagline: 'Stop the bleeding, keep the evidence',
    detail:
      'Isolate affected systems, block attacker access, and limit damage — short-term and long-term — while preserving evidence for later analysis.',
  },
  {
    id: 'eradic',
    name: 'Eradication',
    tagline: 'Remove the root cause',
    detail:
      'Remove malware, attacker persistence and unauthorized access; patch or fix the exploited weakness so the same door cannot be used again.',
  },
  {
    id: 'recover',
    name: 'Recovery',
    tagline: 'Return to business, carefully',
    detail:
      'Restore systems from clean backups or rebuilds, validate integrity, return to production in stages, and monitor closely for repeat indicators.',
  },
  {
    id: 'lessons',
    name: 'Lessons Learned',
    tagline: 'Turn the incident into improvement',
    detail:
      'Hold a post-incident review soon after closure; update the plan, playbooks and detections; report to stakeholders; feed the risk register. (Post-incident activities.)',
  },
];

const PHASE_IDS = PHASES.map(function (p) { return p.id; });

// OBJ-M2 — six activity cards matched to phases
const ACTIVITIES = [
  { id: 'act-playbook', label: 'Build playbooks and train the response team', phase: 'prep' },
  { id: 'act-siem', label: 'Correlate SIEM alerts and confirm a real incident', phase: 'ident' },
  { id: 'act-isolate', label: 'Isolate affected hosts from the network', phase: 'contain' },
  { id: 'act-patch', label: 'Remove malware and patch the exploited flaw', phase: 'eradic' },
  { id: 'act-restore', label: 'Restore systems from verified clean backups', phase: 'recover' },
  { id: 'act-review', label: 'Hold a post-incident review and update the plan', phase: 'lessons' },
];

// OBJ-H1 — ten-event timeline (a ransomware incident at Atlas, synthetic)
const TIMELINE_EVENTS = [
  { id: 'ev1', time: '06:12', text: 'SIEM correlation rule fires on anomalous PowerShell activity on FILE01', phase: 'ident' },
  { id: 'ev2', time: '06:24', text: 'Duty analyst confirms ransom note and newly encrypted files on FILE01', phase: 'ident' },
  { id: 'ev3', time: '06:30', text: 'IR manager classifies the event SEV-1, declares the incident and pages the CSIRT', phase: 'ident' },
  { id: 'ev4', time: '06:41', text: 'FILE01 is disconnected at the switch port; VLAN 20 is segmented', phase: 'contain' },
  { id: 'ev5', time: '06:48', text: 'Compromised VPN account is disabled and all active sessions are revoked', phase: 'contain' },
  { id: 'ev6', time: '07:05', text: 'Attacker persistence mechanism is removed from the backup server', phase: 'eradic' },
  { id: 'ev7', time: '07:20', text: 'VPN appliance is patched to close the exploited vulnerability', phase: 'eradic' },
  { id: 'ev8', time: '07:50', text: 'FILE01 is restored from a verified clean backup and brought back online', phase: 'recover' },
  { id: 'ev9', time: '08:15', text: 'Enhanced monitoring stays on the restored host watching for repeat indicators', phase: 'recover' },
  { id: 'ev10', time: '09:00', text: 'Post-incident review is scheduled; playbook and detections get updated', phase: 'lessons' },
];

// OBJ-M12 — program success factors (from the lesson text)
const CHARTER_OPTIONS = [
  { id: 'c-threats', label: 'Identify the potential threats the organization faces', correct: true },
  { id: 'c-standard', label: 'Standardize processes so every response follows proven steps', correct: true },
  { id: 'c-resources', label: 'Resource the response — people, tools, budget and authority', correct: true },
  { id: 'c-tools', label: 'Buy the most expensive tools available, regardless of need', correct: false },
  { id: 'c-improvise', label: 'Let each responder improvise their own procedure every time', correct: false },
  { id: 'c-silence', label: 'Keep leadership out of the loop until everything is resolved', correct: false },
];

/* ------------------------------------------------------------------ */
/* SEC-02 · CSIRT Roster                                               */
/* ------------------------------------------------------------------ */

// OBJ-M3 — role matching
const ROLE_CARDS = [
  { id: 'r-manager', role: 'Incident Response Manager', duty: 'Directs the response and coordinates all team activities' },
  { id: 'r-analyst', role: 'Security Analyst', duty: 'Investigates alerts and analyzes indicators on affected systems' },
  { id: 'r-forensic', role: 'Forensic Analyst', duty: 'Collects and examines evidence while maintaining chain of custody' },
  { id: 'r-legal', role: 'Legal Counsel', duty: 'Advises on regulatory duties, disclosure and law-enforcement contact' },
  { id: 'r-comms', role: 'Communications Lead', duty: 'Crafts approved messaging for staff, customers and media' },
  { id: 'r-itops', role: 'IT Operations', duty: 'Performs isolation, rebuilds and restores business systems' },
];

// OBJ-M4 — on-call crew pick (correct: analyst, forensic, legal, comms)
const CREW_MEDIUM = [
  { id: 'c-analyst', name: 'SOC duty analyst', blurb: 'Holding the SIEM console — took the first alert', correct: true },
  { id: 'c-forensic', name: 'Forensic analyst (on call)', blurb: 'Can image the affected mailbox server', correct: true },
  { id: 'c-legal', name: 'Legal counsel', blurb: 'Owns the regulatory-notification decision tree', correct: true },
  { id: 'c-comms', name: 'Communications lead', blurb: 'Holds the pre-approved notification templates', correct: true },
  { id: 'c-intern', name: 'Desktop support intern', blurb: 'Shadowing the SOC this week', correct: false },
  { id: 'c-marketing', name: 'Marketing manager', blurb: 'Runs the campaign calendar', correct: false },
  { id: 'c-payroll', name: 'Payroll clerk', blurb: 'Processing this month’s cycle', correct: false },
  { id: 'c-journalist', name: 'Trade-press contact', blurb: 'Friendly outlet, external to Atlas', correct: false },
];

// OBJ-H2 — hard roster (pick exactly six; correct set defined by `correct`)
const ROSTER_HARD = [
  {
    id: 'w-dana', name: 'Dana Whitfield', bio: 'IR Program Manager; ran last year’s parallel test.',
    correct: true, why: 'The IR manager is the spine of the team — always in.',
  },
  {
    id: 'w-marcus', name: 'Marcus Lee', bio: 'SOC analyst; triaged this morning’s VPN alert and knows the timeline.',
    correct: true, why: 'Primary analyst on the source alert — context lives with him.',
  },
  {
    id: 'w-priya', name: 'Priya Natarajan', bio: 'Forensic lead; certified in evidence handling.',
    correct: true, why: 'A data breach needs forensics from hour one — chain of custody.',
  },
  {
    id: 'w-tom', name: 'Tom Okafor', bio: 'Legal counsel; owns the regulator decision tree.',
    correct: true, why: 'Breach of customer data triggers legal-review gates.',
  },
  {
    id: 'w-jordan', name: 'Jordan Diaz', bio: 'Communications specialist; holds the approved templates.',
    correct: true, why: 'Standing in for Sara — messaging must be ready but gated.',
  },
  {
    id: 'w-elena', name: 'Elena Voss', bio: 'CFO and executive sponsor; signs off major decisions.',
    correct: true, why: 'Executive authority must be reachable from minute one.',
  },
  {
    id: 'w-sara', name: 'Sara Kim', bio: 'Communications lead — on leave until next quarter.',
    correct: false, why: 'Unavailable; her backup Jordan covers the seat.',
  },
  {
    id: 'w-rick', name: 'Rick Palmer', bio: 'Desktop support intern; eager, three weeks in.',
    correct: false, why: 'Not a CSIRT role; trainees do not staff a live breach.',
  },
  {
    id: 'w-janet', name: 'Janet Ruiz', bio: 'HR director; joins for insider incidents.',
    correct: false, why: 'No insider indicator — the access path was a compromised VPN account.',
  },
  {
    id: 'w-choi', name: 'Choi Min-seo', bio: 'External IR retainer consultant (contractor).',
    correct: false, why: 'Retainer support is engaged on request — not part of the standing team.',
  },
];

/* ------------------------------------------------------------------ */
/* SEC-03 · Triage Desk                                                */
/* ------------------------------------------------------------------ */

const SEV_LEVELS = [
  { id: 'sev1', label: 'SEV-1 · Critical', desc: 'Business-stopping; spreads or destroys; all hands' },
  { id: 'sev2', label: 'SEV-2 · High', desc: 'Major impact, contained scope; escalate fast' },
  { id: 'sev3', label: 'SEV-3 · Medium', desc: 'Limited impact, no spread; routine response' },
  { id: 'sev4', label: 'SEV-4 · Low', desc: 'Minimal or benign; monitor and record' },
];

const ESC_OPTIONS = [
  { id: 'esc-declare', label: 'Declare SEV-1 now — page the CSIRT' },
  { id: 'esc-1h', label: 'Escalate to IR manager within 1 hour' },
  { id: 'esc-itops', label: 'Route to IT operations as a ticket' },
  { id: 'esc-monitor', label: 'Keep in SOC daily review' },
];

// OBJ-M5 — four incoming reports
const INCIDENTS_MEDIUM = [
  {
    id: 'inc-101', code: 'INC-1041', sev: 'sev1', esc: 'esc-declare',
    text: 'Ransomware is actively encrypting the primary file shares. Multiple hosts affected and spreading.',
  },
  {
    id: 'inc-102', code: 'INC-1042', sev: 'sev3', esc: 'esc-itops',
    text: 'Adware popup detected on one laptop; EDR quarantined it automatically. No lateral movement seen.',
  },
  {
    id: 'inc-103', code: 'INC-1043', sev: 'sev2', esc: 'esc-1h',
    text: 'Suspected bulk download from the finance SharePoint by a departed employee’s account.',
  },
  {
    id: 'inc-104', code: 'INC-1044', sev: 'sev4', esc: 'esc-monitor',
    text: 'Burst of failed VPN logins from one country. No successful authentication observed.',
  },
];

// OBJ-M11 — duty log escalation calls
const DUTY_LOG = [
  {
    id: 'dl-1', code: 'DL-088', esc: 'esc-1h',
    text: 'Duty analyst confirms an active command-and-control beacon from a finance workstation (graded SEV-2).',
  },
  {
    id: 'dl-2', code: 'DL-089', esc: 'esc-monitor',
    text: 'EDR auto-quarantined adware on a lobby kiosk; artifact submitted for review (graded SEV-4).',
  },
];

// OBJ-H3 — hard queue
const INCIDENTS_HARD = [
  {
    id: 'hinc-a', code: 'INC-2101', sev: 'sev1', esc: 'esc-declare',
    text: 'Production ERP unreachable; customer order flow has stopped; early recon shows destructive wiper behavior on two database hosts.',
  },
  {
    id: 'hinc-b', code: 'INC-2102', sev: 'sev4', esc: 'esc-monitor',
    text: 'Marketing laptop shows adware popups; no lateral movement; EDR contained the process.',
  },
  {
    id: 'hinc-c', code: 'INC-2103', sev: 'sev2', esc: 'esc-1h',
    text: 'Database admin account used at 03:00 from an unfamiliar network; ~2 GB pushed to a personal file-share site. Scope: one system so far.',
  },
];

/* ------------------------------------------------------------------ */
/* SEC-04 · Plan Library                                               */
/* ------------------------------------------------------------------ */

const PLAN_OPTIONS = [
  { id: 'irp', label: 'Incident Response Plan (IRP)', short: 'IRP' },
  { id: 'bcp', label: 'Business Continuity Plan (BCP)', short: 'BCP' },
  { id: 'drp', label: 'Disaster Recovery Plan (DRP)', short: 'DRP' },
  { id: 'coop', label: 'Continuity of Operations Plan (COOP)', short: 'COOP' },
];

const PLAN_BLURBS = [
  { id: 'irp', label: 'IRP — how Atlas detects, responds to and recovers from security incidents' },
  { id: 'bcp', label: 'BCP — how the business keeps critical functions running during a disruption' },
  { id: 'drp', label: 'DRP — how IT restores systems and infrastructure after a disaster' },
  { id: 'coop', label: 'COOP — how mission-essential operations continue (people, facilities, leadership succession)' },
];

// OBJ-M6 — four scenarios
const PLAN_SCENARIOS_M = [
  { id: 's-flood', text: 'A flood knocked out the primary data center — IT must restore systems at the recovery site.', plan: 'drp' },
  { id: 's-ransom', text: 'Ransomware is spreading across endpoints — the response team needs containment and eradication procedures.', plan: 'irp' },
  { id: 's-payroll', text: 'Systems are down for hours — payroll and order-taking must keep running for the business.', plan: 'bcp' },
  { id: 's-pandemic', text: 'A pandemic disrupts staffing — mission-essential functions continue under an alternate leadership chain.', plan: 'coop' },
];

// OBJ-H5 — five scenarios (stricter boundaries)
const PLAN_SCENARIOS_H = [
  { id: 'hs-flood', text: 'Flood takes the primary data center offline — failover to the secondary site and system restoration begin.', plan: 'drp' },
  { id: 'hs-ransom', text: 'Ransomware detonates on the file servers — CSIRT activation, isolation and eradication procedures are needed.', plan: 'irp' },
  { id: 'hs-payroll', text: 'The data center is down — payroll and customer order-taking must continue from the work-recovery site.', plan: 'bcp' },
  { id: 'hs-succession', text: 'A regional crisis incapacitates key leadership — authority devolves to the designated alternate chain.', plan: 'coop' },
  { id: 'hs-hqfire', text: 'A fire makes HQ unusable for a month — essential functions relocate and leadership operates from the alternate facility.', plan: 'coop' },
];

/* ------------------------------------------------------------------ */
/* SEC-05 · Comms Matrix                                               */
/* ------------------------------------------------------------------ */

// OBJ-M7 — five stakeholder rows × (channel, timing, audience)
const STAKEHOLDERS_M = [
  { id: 'st-csirt', name: 'CSIRT members', ch: 'bridge', tim: 'now', aud: 'internal' },
  { id: 'st-exec', name: 'Executive leadership', ch: 'briefing', tim: '1h', aud: 'internal' },
  { id: 'st-emp', name: 'All employees', ch: 'intranet', tim: 'daily', aud: 'internal' },
  { id: 'st-cust', name: 'Affected customers', ch: 'statuspage', tim: 'legal', aud: 'external' },
  { id: 'st-reg', name: 'Regulatory authority', ch: 'portal', tim: 'legal', aud: 'external' },
];

const CHANNEL_OPTIONS = [
  { id: 'bridge', label: 'War-room bridge (secure chat/call)' },
  { id: 'briefing', label: 'Executive briefing call' },
  { id: 'intranet', label: 'Intranet notice' },
  { id: 'statuspage', label: 'Status page / support email' },
  { id: 'portal', label: 'Regulatory portal filing' },
  { id: 'press', label: 'Press release' },
];

const TIMING_OPTIONS = [
  { id: 'now', label: 'Immediately on declaration' },
  { id: '1h', label: 'Within 1 hour' },
  { id: 'daily', label: 'Daily status report' },
  { id: 'legal', label: 'Only after legal review' },
];

// OBJ-H6 — seven parties × action (includes do-not-contact-yet)
const PARTIES_H = [
  { id: 'p-csirt', name: 'CSIRT members', action: 'now' },
  { id: 'p-legal', name: 'Legal counsel', action: 'now' },
  { id: 'p-exec', name: 'Executive leadership', action: '1h' },
  { id: 'p-regulator', name: 'Data-protection regulator', action: 'review' },
  { id: 'p-customers', name: 'Affected customers', action: 'review' },
  { id: 'p-lawenf', name: 'Law enforcement', action: 'review' },
  { id: 'p-media', name: 'Media / press', action: 'hold' },
];

const ACTION_OPTIONS_H = [
  { id: 'now', label: 'Notify immediately' },
  { id: '1h', label: 'Notify within 1 hour' },
  { id: 'review', label: 'Notify only after legal review & containment confirmed' },
  { id: 'hold', label: 'Do not contact yet' },
];

/* ------------------------------------------------------------------ */
/* SEC-06 · Exercise Yard                                              */
/* ------------------------------------------------------------------ */

const EX_TYPES = [
  { id: 'tabletop', label: 'Tabletop', disruption: 1 },
  { id: 'walkthrough', label: 'Walkthrough', disruption: 2 },
  { id: 'simulation', label: 'Simulation', disruption: 3 },
  { id: 'parallel', label: 'Parallel', disruption: 4 },
  { id: 'fullint', label: 'Full interruption', disruption: 5 },
];

// OBJ-M8 — five descriptions
const EXERCISES_M = [
  { id: 'x1', text: 'The team sits with a facilitator and discusses roles over a scenario; no systems are touched.', type: 'tabletop' },
  { id: 'x2', text: 'Members step through the plan’s procedures in order, acting them out at a basic level.', type: 'walkthrough' },
  { id: 'x3', text: 'Responders react to a simulated incident in real time — production is untouched.', type: 'simulation' },
  { id: 'x4', text: 'Recovery teams bring systems up at the alternate site while production keeps running.', type: 'parallel' },
  { id: 'x5', text: 'Production is deliberately interrupted and failover to the alternate site is actually executed.', type: 'fullint' },
];

// OBJ-H4 — three maturity stages
const STAGES_H = [
  {
    id: 'stage1', text: 'Stage 1 — “We have never exercised. Budget is near zero and the goal is awareness of roles.”',
    type: 'tabletop',
  },
  {
    id: 'stage2', text: 'Stage 2 — “Auditors want proof the alternate site actually works, but customer traffic must never be at risk.”',
    type: 'parallel',
  },
  {
    id: 'stage3', text: 'Stage 3 — “Peak maturity. The board has approved a planned outage window and wants real failover proof.”',
    type: 'fullint',
  },
];

/* ------------------------------------------------------------------ */
/* SEC-07 · Evidence Vault                                             */
/* ------------------------------------------------------------------ */

const DURATION_OPTIONS = [
  { id: 'd90', label: '90 days' },
  { id: 'd1y', label: '1 year' },
  { id: 'd3y', label: '3 years' },
  { id: 'd6y', label: '6 years' },
  { id: 'dhold', label: 'Until legal release (hold)' },
];

// OBJ-M9 — four artifact classes (answers per the Atlas policy memo, simplified)
const RETENTION_M = [
  { id: 'ret-fw', name: 'Firewall & VPN logs', dur: 'd1y' },
  { id: 'ret-edr', name: 'Endpoint (EDR) telemetry', dur: 'd90' },
  { id: 'ret-evd', name: 'Incident evidence (disk images)', dur: 'dhold' },
  { id: 'ret-mail', name: 'Email records', dur: 'd3y' },
];

// OBJ-H7 — hold decisions + custody violation
const RETENTION_H = [
  { id: 'hret-evd', name: 'Disk images from the phishing near-miss', action: 'hold' },
  { id: 'hret-vpnlogs', name: 'VPN session logs tied to the compromised account', action: 'hold' },
  { id: 'hret-backups', name: 'Backups of the affected mailbox server', action: 'hold' },
  { id: 'hret-analytics', name: 'Marketing campaign analytics', action: 'expire' },
];

const RET_ACTION_OPTIONS = [
  { id: 'hold', label: 'Preserve — covered by the legal hold' },
  { id: 'retain', label: 'Retain per normal schedule' },
  { id: 'expire', label: 'Safe to expire on schedule' },
];

const CUSTODY_STEPS = [
  { id: 'cs1', text: 'Evidence is imaged and hashed at collection; hashes are recorded on the custody form.', violation: false },
  { id: 'cs2', text: 'The image is stored in the evidence safe; only two custodians hold the key.', violation: false },
  { id: 'cs3', text: 'Every transfer of custody is signed and dated by both parties.', violation: false },
  { id: 'cs4', text: 'An analyst copies the image to a personal USB drive and emails it to a colleague “for a second opinion”.', violation: true },
  { id: 'cs5', text: 'Analysis is done on a verified working copy; the original stays sealed.', violation: false },
];

/* ------------------------------------------------------------------ */
/* SEC-08 · Playbook Stand                                             */
/* ------------------------------------------------------------------ */

// OBJ-M10 — pick the 3 scenarios that warrant playbooks
const PLAY_CANDIDATES = [
  { id: 'p-phish', label: 'Phishing email with a credential-harvesting link', correct: true },
  { id: 'p-ransom', label: 'Ransomware detonation on an endpoint', correct: true },
  { id: 'p-laptop', label: 'Lost or stolen company laptop', correct: true },
  { id: 'p-cms', label: 'Typo in the website CMS content', correct: false },
  { id: 'p-budget', label: 'Quarterly budget report running late', correct: false },
];

// OBJ-M10 — order the six steps of the phishing playbook
const PLAYBOOK_STEPS = [
  { id: 'ps1', text: 'User reports the suspicious email to the security mailbox' },
  { id: 'ps2', text: 'Analyst validates the message and extracts indicators (sender, URL, attachment)' },
  { id: 'ps3', text: 'Search all mailboxes for other recipients of the same message' },
  { id: 'ps4', text: 'Purge the message from mailboxes and block the sender/URL' },
  { id: 'ps5', text: 'Reset credentials for any user who clicked and submitted data' },
  { id: 'ps6', text: 'Update the playbook and detection rules with lessons from the case' },
];

/* ------------------------------------------------------------------ */
/* SEC-09 · Plan Audit (Hard)                                          */
/* ------------------------------------------------------------------ */

// OBJ-H8 — ten lines, four defective: l4, l5, l6, l9
const AUDIT_LINES = [
  { id: 'l1', text: '1. Purpose — This plan governs how Atlas detects, responds to, and recovers from security incidents.', defect: false },
  { id: 'l2', text: '2. Scope — Applies to all IT systems, including the warehouse OT network.', defect: false },
  { id: 'l3', text: '3. Process — The IR phases are Preparation, Identification, Containment, Eradication, Recovery, and Lessons Learned.', defect: false },
  { id: 'l4', text: '4. Evidence — Evidence may be wiped 48 hours after an incident closes to save storage costs.', defect: true },
  { id: 'l5', text: '5. Reporting — Only the SOC may declare an incident; business units must never report anomalies directly.', defect: true },
  { id: 'l6', text: '6. Notification — Customers will be notified of every incident within 15 minutes, before containment is confirmed.', defect: true },
  { id: 'l7', text: '7. Team — The CSIRT includes analysts, forensics, legal counsel, and a communications lead.', defect: false },
  { id: 'l8', text: '8. Exercises — The plan is exercised on a graduated schedule, from tabletop toward full interruption.', defect: false },
  { id: 'l9', text: '9. Playbooks — Playbooks are optional; responders should improvise without standard procedures.', defect: true },
  { id: 'l10', text: '10. Retention — Records follow the corporate retention schedule; legal holds override deletion.', defect: false },
];

/* ------------------------------------------------------------------ */
/* SEC-10 · War Room (Hard)                                            */
/* ------------------------------------------------------------------ */

// OBJ-H9 — correct chain: iso → disable → patch → staged
const INJECTS = [
  {
    id: 'inj1', clock: 'T+0:04',
    scenario: 'Ransomware is confirmed, spreading laterally over SMB inside VLAN 20.',
    options: [
      { id: 'iso-vlan', label: 'Isolate VLAN 20 at the switches; preserve volatile evidence first where possible', correct: true, why: 'Containment stops spread while keeping evidence — textbook containment.' },
      { id: 'power-off', label: 'Cut power to every server in the building immediately', correct: false, why: 'Overkill destroys volatile evidence and takes every service down at once.' },
      { id: 'email-staff', label: 'Email all staff and ask them to unplug their PCs', correct: false, why: 'Slow, unverifiable and chaotic; containment is a technical action.' },
    ],
  },
  {
    id: 'inj2', clock: 'T+0:22',
    scenario: 'Telemetry shows the attacker still holds an active admin session through the VPN.',
    options: [
      { id: 'disable-acct', label: 'Disable the compromised account and kill all active sessions', correct: true, why: 'Cutting attacker access is containment; sessions must be revoked, not just watched.' },
      { id: 'wait-backup', label: 'Wait for tonight’s backup window before acting', correct: false, why: 'The attacker keeps expanding for hours — containment cannot wait.' },
      { id: 'wifi-pass', label: 'Change the corporate Wi-Fi password', correct: false, why: 'The access path is the VPN, not Wi-Fi; measures must target the actual vector.' },
    ],
  },
  {
    id: 'inj3', clock: 'T+2:10',
    scenario: 'Initial access is traced to an unpatched CVE on the internet-facing VPN appliance.',
    options: [
      { id: 'patch-appliance', label: 'Patch the appliance before it is reconnected to the internet', correct: true, why: 'Eradication removes the root cause — patching closes the reused door.' },
      { id: 'reconnect', label: 'Reconnect as-is; attackers rarely return to the same door', correct: false, why: 'Untrue and unsafe — the same CVE gets re-exploited within hours.' },
      { id: 'next-year', label: 'Schedule a replacement appliance for next fiscal year', correct: false, why: 'The incident cannot close with the vulnerability open; fiscal calendars are not containment.' },
    ],
  },
  {
    id: 'inj4', clock: 'T+5:45',
    scenario: 'Systems are rebuilt and clean backups are verified. Leadership asks how to resume operations.',
    options: [
      { id: 'staged-return', label: 'Return in stages with enhanced monitoring on every restored system', correct: true, why: 'Recovery is staged and watched — repeat indicators are caught early.' },
      { id: 'all-at-once', label: 'Flip everything back on at once and move on', correct: false, why: 'Unmonitored mass return hides residual compromise.' },
      { id: 'stay-off', label: 'Keep everything offline until next week to be safe', correct: false, why: 'Unnecessary business damage; recovery is validating and staged, not indefinite.' },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Objectives                                                          */
/* ------------------------------------------------------------------ */

const OBJECTIVES = [
  /* ---------------- MEDIUM ---------------- */
  {
    id: 'M1', fullId: 'OBJ-M1', mode: 'medium', section: 'phases', pillar: 'understand',
    title: 'Sequence the six phases of the incident response lifecycle.',
    anchor: 'IR process phases (CS0-003 4.1)',
    steps: [
      'The ledger page lists the six phases in scrambled order.',
      'Arrange them the way a real incident flows, from readiness to retrospective.',
    ],
    hints: [
      'Ask: what must exist before an alert ever fires? That phase is first.',
      'Order the middle by what an attacker is doing: detected → stopped → removed → healed.',
      'Demonstration: Preparation → Identification → Containment → Eradication → Recovery → Lessons Learned.',
    ],
    feedbackPass:
      'Correct — the lifecycle is a loop, not a line: Lessons Learned feeds straight back into Preparation. CompTIA expects this order cold.',
    feedbackFail:
      'Not yet. Think chronologically: build capability, notice the incident, stop it, remove it, restore, then improve. Check which card sits where.',
  },
  {
    id: 'M2', fullId: 'OBJ-M2', mode: 'medium', section: 'phases', pillar: 'understand',
    title: 'Assign each response activity to the phase where it belongs.',
    anchor: 'Phase activities (CS0-003 4.1)',
    steps: [
      'Six everyday response activities are floating without a home.',
      'Use the phase definitions on the ledger cards to place each one.',
    ],
    hints: [
      'Verbs are the tell: build/train = first phase; isolate = stop the bleeding.',
      'Remove-and-fix belongs to the phase before restoring; reviewing happens only at the end.',
      'Demonstration: playbooks→Preparation, SIEM correlation→Identification, isolation→Containment, patching→Eradication, restore→Recovery, review→Lessons Learned.',
    ],
    feedbackPass:
      'Exactly. Phase membership is a favorite exam question because each phase has a distinct verb signature.',
    feedbackFail:
      'Some cards landed in the wrong phase. Match the verb: build→Preparation, detect→Identification, stop→Containment, remove→Eradication, restore→Recovery, improve→Lessons Learned.',
  },
  {
    id: 'M3', fullId: 'OBJ-M3', mode: 'medium', section: 'team', pillar: 'understand',
    title: 'Match each core CSIRT role to its responsibility.',
    anchor: 'Incident response team (CS0-003 4.2)',
    steps: [
      'Six responsibilities are pinned to the roster wall with no names.',
      'Assign the role that owns each one.',
    ],
    hints: [
      'Two roles look similar: one investigates alerts, one preserves and examines evidence.',
      'Only one role speaks for the company to the outside world.',
      'Demonstration: Manager→coordinates, Analyst→investigates alerts, Forensics→evidence/custody, Legal→regulatory, Comms→messaging, IT Ops→isolate/rebuild.',
    ],
    feedbackPass:
      'Right. A CSIRT is deliberately cross-functional — the exam tests whether you know why each seat exists.',
    feedbackFail:
      'Re-read the duties: coordinating vs investigating vs examining evidence are three different seats, and only Legal advises on regulators.',
  },
  {
    id: 'M4', fullId: 'OBJ-M4', mode: 'medium', section: 'team', pillar: 'recognize',
    title: 'Select the right responders for the phishing flash report.',
    anchor: 'CSIRT composition in practice (CS0-003 4.2)',
    steps: [
      'A SEV-2 phishing flash just arrived: credential link, three clickers, one mailbox server implicated.',
      'Check exactly the four roster entries the phishing runbook requires for this case.',
    ],
    hints: [
      'The runbook line says: “analyst, forensics, legal, communications”.',
      'Anyone not on that line is either unavailable or not a CSIRT seat.',
      'Demonstration: check SOC duty analyst, Forensic analyst, Legal counsel, Communications lead — nothing else.',
    ],
    feedbackPass:
      'Good crew. Notice who is NOT there: no executives yet (no SEV-1), no HR (no insider angle) — composition follows the incident.',
    feedbackFail:
      'That crew has extra or missing seats. The runbook requires analyst + forensics + legal + comms for a SEV-2 phishing case; everyone else waits.',
  },
  {
    id: 'M5', fullId: 'OBJ-M5', mode: 'medium', section: 'triage', pillar: 'detect',
    title: 'Classify four incoming reports by severity and choose the escalation.',
    anchor: 'Incident classification & prioritization (CS0-003 4.1)',
    steps: [
      'Four reports are queuing on the triage desk. Grade each SEV-1 to SEV-4.',
      'Then pick the escalation path each grade mandates — use the matrix card for impact and urgency.',
    ],
    hints: [
      'Actively spreading + business-stopping = top grade; failed logins with no success = bottom grade.',
      'Contained-but-serious (possible data exposure) sits in the middle-upper band; auto-quarantined malware sits lower.',
      'Demonstration: INC-1041→SEV-1/declare now, INC-1042→SEV-3/IT ticket, INC-1043→SEV-2/1-hour escalation, INC-1044→SEV-4/daily review.',
    ],
    feedbackPass:
      'Clean triage. Severity weighs functional impact and urgency — recoverability matters but never outranks active spread.',
    feedbackFail:
      'One or more grades are off. Spread and business impact push grades up; automatic containment and absent impact push them down.',
  },
  {
    id: 'M6', fullId: 'OBJ-M6', mode: 'medium', section: 'plans', pillar: 'understand',
    title: 'Route each disruption scenario to the plan that governs it.',
    anchor: 'BCP / DRP / COOP vs IRP (CS0-003 4.2)',
    steps: [
      'Four disruption scenarios sit on the library desk.',
      'File each under IRP, BCP, DRP or COOP — the blurbs on the shelf cards are your key.',
    ],
    hints: [
      'Restore IT systems = DRP; keep the business running = BCP.',
      'Security incident response = IRP; people/facilities/leadership succession = COOP.',
      'Demonstration: flood→DRP, ransomware→IRP, payroll continuity→BCP, pandemic staffing→COOP.',
    ],
    feedbackPass:
      'Filed correctly. The exam loves the BCP/DRP boundary: BCP is what the business does, DRP is how IT comes back.',
    feedbackFail:
      'Two shelves were swapped. Ask: is this about responding to an attack (IRP), keeping business functions alive (BCP), restoring IT (DRP), or continuing essential operations with alternate people/places (COOP)?',
  },
  {
    id: 'M7', fullId: 'OBJ-M7', mode: 'medium', section: 'comms', pillar: 'mitigate',
    title: 'Build the notification matrix for the five stakeholder groups.',
    anchor: 'Communication plan & stakeholder management (CS0-003 4.2)',
    steps: [
      'Five stakeholder groups are waiting. For each: choose the channel, the timing, and internal vs external.',
      'The rule of thumb: insiders move first, outsiders wait for verified facts and legal review.',
    ],
    hints: [
      'The CSIRT gets the war-room bridge immediately; executives get a briefing within the hour.',
      'Customers and the regulator only hear from Atlas after legal review — and both are external audiences.',
      'Demonstration: CSIRT→bridge/now/internal, Execs→briefing/1h/internal, Employees→intranet/daily/internal, Customers→status page/legal/external, Regulator→portal/legal/external.',
    ],
    feedbackPass:
      'Matrix approved. A communication plan pre-decides all of this so nobody improvises at 3 a.m.',
    feedbackFail:
      'Some rows would leak or stall the response. Insiders first (bridge, briefing, intranet); external audiences only after legal review.',
  },
  {
    id: 'M8', fullId: 'OBJ-M8', mode: 'medium', section: 'exercises', pillar: 'understand',
    title: 'Match each drill description to its exercise type, then rank the types by disruption.',
    anchor: 'Exercise types: tabletop→full interruption (CS0-003 4.2)',
    steps: [
      'Five drill descriptions from the exercise catalog need their type labels back.',
      'Then rank all five types from least to most disruptive to production.',
    ],
    hints: [
      'Discussion only = tabletop; real failover with production down = the most disruptive type.',
      'The ranking IS the teach: every step up adds realism and risk.',
      'Demonstration: x1→tabletop, x2→walkthrough, x3→simulation, x4→parallel, x5→full interruption; ladder tabletop→walkthrough→simulation→parallel→full interruption.',
    ],
    feedbackPass:
      'Ladder complete. Programs climb it deliberately: each rung proves something the previous one could not.',
    feedbackFail:
      'Two labels are crossed. Remember: parallel keeps production running; full interruption does not. Discussion-only is always the tabletop.',
  },
  {
    id: 'M9', fullId: 'OBJ-M9', mode: 'medium', section: 'vault', pillar: 'mitigate',
    title: 'Set retention rules for the vault and apply the legal hold.',
    anchor: 'Retention policies & legal hold (CS0-003 4.2)',
    steps: [
      'Set each artifact class to its Atlas policy-memo duration (the memo is pinned on the shelf).',
      'A preservation notice just arrived for last quarter’s phishing near-miss — set which artifact class it overrides, and give that class its hold duration.',
    ],
    hints: [
      'Memo: firewall/VPN logs 1 year, EDR telemetry 90 days, email 3 years.',
      'A legal hold suspends destruction for everything in scope — evidence lives until the case releases it.',
      'Demonstration: logs→1y, EDR→90d, email→3y; the preservation notice overrides the incident evidence class (until legal release).',
    ],
    feedbackPass:
      'Vault compliant. The rule to remember: retention schedules delete on time — legal holds delete nothing until released.',
    feedbackFail:
      'The schedule or the hold is misplaced. Follow the memo for the routine classes, and give the litigation-scoped evidence the hold duration.',
  },
  {
    id: 'M10', fullId: 'OBJ-M10', mode: 'medium', section: 'playbooks', pillar: 'recognize',
    title: 'Decide which scenarios need playbooks, then order the phishing playbook.',
    anchor: 'Playbooks / standardized processes (CS0-003 4.2)',
    steps: [
      'Five candidate scenarios are on the stand. Keep the three that are security incidents worth standardizing.',
      'Then arrange the six phishing playbook steps in execution order.',
    ],
    hints: [
      'Playbooks exist for repeatable security incidents — a CMS typo and a late budget report are not incidents.',
      'The playbook starts with a human report and ends with improvement.',
      'Demonstration: keep phish, ransomware, lost laptop. Order: report → validate → search mailboxes → purge/block → reset credentials → update playbook.',
    ],
    feedbackPass:
      'That is a real playbook: detect → scope → contain → eradicate → recover → improve, in phishing clothing.',
    feedbackFail:
      'Rethink the order: you cannot purge what you have not found, and credentials are reset after the message is gone, before the playbook is updated.',
  },
  {
    id: 'M11', fullId: 'OBJ-M11', mode: 'medium', section: 'triage', pillar: 'detect',
    title: 'Make the two escalation calls on the duty log.',
    anchor: 'Escalation paths (CS0-003 4.1/4.2)',
    steps: [
      'Two graded entries from the night shift need their escalation decision confirmed.',
      'Match each entry’s grade to its mandated path.',
    ],
    hints: [
      'SEV-2 does not page everyone — but it cannot wait for the morning report either.',
      'SEV-4 with the artifact already quarantined stays inside the SOC rhythm.',
      'Demonstration: DL-088 (SEV-2) → escalate to IR manager within 1 hour; DL-089 (SEV-4) → daily review.',
    ],
    feedbackPass:
      'Both calls correct. Escalation paths are pre-agreed so the 3 a.m. analyst never has to guess who to wake.',
    feedbackFail:
      'Escalation must match the grade: SEV-2 gets a 1-hour human escalation; SEV-4 stays in the routine loop. Paging the full team for SEV-4 burns the team.',
  },
  {
    id: 'M12', fullId: 'OBJ-M12', mode: 'medium', section: 'phases', pillar: 'understand',
    title: 'Confirm the three success factors of the Atlas IR program charter.',
    anchor: 'Lesson 8.1 framing: identify threats, standardized processes, resources needed',
    steps: [
      'The charter wall lists six candidate commitments; exactly three come from the lesson text.',
      'Check the three that genuinely make incident response activities succeed.',
    ],
    hints: [
      'The lesson names three: knowing your threats, standardized processes, and the resources to respond.',
      'Cost, improvisation and secrecy are anti-patterns, not commitments.',
      'Demonstration: check “identify potential threats”, “standardize processes”, “resource the response”.',
    ],
    feedbackPass:
      'That is the lesson in one line: identify the threats, standardize the process, resource the response. Everything in this binder serves one of those three.',
    feedbackFail:
      'Not those. Spending alone is not readiness; improvisation is the enemy; hiding incidents from leadership is worse. The three true factors mirror the lesson text.',
  },
  /* ---------------- HARD ---------------- */
  {
    id: 'H1', fullId: 'OBJ-H1', mode: 'hard', section: 'phases', pillar: 'understand',
    title: 'Reconstruct the ransomware timeline: place all ten events in their phases and lock the phase order.',
    anchor: 'IR process phases applied to a live incident (CS0-003 4.1)',
    steps: [
      'Ten timestamped events from the synthetic FILE01 ransomware case are unordered across phases.',
      'Assign every event to its phase and verify the phase sequence — strict checking, no partial credit.',
    ],
    hints: [
      'One nudge (costs score): the 06:30 declaration is still Identification — analysis and notification live there; Containment starts with the first technical block.',
    ],
    feedbackPass:
      'Timeline reconstructed. Notice how Containment (06:41–06:48) and Eradication (07:05–07:20) are separate, deliberate acts — that separation is why the model has six phases.',
    feedbackFail:
      'Rejected. Near-misses like “declaration = Containment” or “reimage = Eradication” are wrong: declaration happens in Identification, and restoring from clean backups is Recovery.',
  },
  {
    id: 'H2', fullId: 'OBJ-H2', mode: 'hard', section: 'team', pillar: 'recognize',
    title: 'Stand up the breach CSIRT: pick exactly six people and respect every constraint.',
    anchor: 'Incident response team composition & conflicts (CS0-003 4.2)',
    steps: [
      'A SEV-2 data breach is confirmed: customer PII exposed via a compromised VPN account.',
      'Read every bio card. Exactly six people make the team; conflicts, availability and scope disqualify the rest.',
    ],
    hints: [
      'One nudge (costs score): availability and incident scope both matter — check the leave calendar and whether any insider angle exists.',
    ],
    feedbackPass:
      'Six for six: Dana (lead), Marcus (analyst), Priya (forensics), Tom (legal), Jordan (comms cover), Elena (executive). Sara is out on leave, Janet has no insider case, and the intern/retainer are not standing members.',
    feedbackFail:
      'Rejected — the set is not the six. Check availability (Sara), incident scope (no insider angle → no HR), and standing membership (interns and external retainers wait outside).',
  },
  {
    id: 'H3', fullId: 'OBJ-H3', mode: 'hard', section: 'triage', pillar: 'detect',
    title: 'Triage the three-incident queue: grade, escalate, and set the response order.',
    anchor: 'Classification, prioritization & resourcing under pressure (CS0-003 4.1)',
    steps: [
      'Three live incidents compete for one IR manager. Grade each and set its escalation.',
      'Then drag the queue into the order the manager should work them.',
    ],
    hints: [
      'One nudge (costs score): possible exfiltration with contained scope is SEV-2, not SEV-1 — SEV-1 needs business-stopping impact.',
    ],
    feedbackPass:
      'Queue set: ERP wiper (SEV-1) first, admin-account exfiltration (SEV-2) second, adware (SEV-4) last. Prioritization is impact × urgency, not arrival order.',
    feedbackFail:
      'Rejected. The wiper stopped revenue — SEV-1. The 03:00 admin account is serious but scoped to one system — SEV-2. Contained adware — SEV-4.',
  },
  {
    id: 'H4', fullId: 'OBJ-H4', mode: 'hard', section: 'exercises', pillar: 'understand',
    title: 'Design the exercise program: one type per maturity stage, near-misses will be rejected.',
    anchor: 'Exercise type selection & sequencing (CS0-003 4.2)',
    steps: [
      'Three stages of Atlas’s exercise program need a type each, chosen under real constraints.',
      'Budget, risk tolerance and what must be proven all constrain the choice.',
    ],
    hints: [
      'One nudge (costs score): the middle stage must prove the alternate site works — without touching customer traffic. Only one type does both.',
    ],
    feedbackPass:
      'Program designed: tabletop first (cheap, discussion), parallel to prove the alternate site with production safe, full interruption only with board-approved downtime.',
    feedbackFail:
      'Rejected. A first-ever exercise is never a full interruption; proving failover without risk is exactly the parallel test; simulation proves people, not the alternate site.',
  },
  {
    id: 'H5', fullId: 'OBJ-H5', mode: 'hard', section: 'plans', pillar: 'understand',
    title: 'Route five disaster actions to their governing plan — the COOP/BCP boundary is deliberately tricky.',
    anchor: 'IRP/BCP/DRP/COOP boundaries (CS0-003 4.2)',
    steps: [
      'Five actions from a regional disaster drill need to be filed under the correct plan.',
      'Two of them flirt with the same shelf — read the distinguishing words carefully.',
    ],
    hints: [
      'One nudge (costs score): leadership succession and alternate-facility operations for essential functions are COOP territory, even when a fire caused it.',
    ],
    feedbackPass:
      'All five filed correctly. Distinguisher locked in: COOP keeps essential operations and leadership going (people/places); BCP keeps business functions running; DRP restores IT.',
    feedbackFail:
      'Rejected. “Restore IT systems” = DRP, “respond to the attack” = IRP, “keep business functions running” = BCP, “essential functions + alternate leadership/facilities” = COOP.',
  },
  {
    id: 'H6', fullId: 'OBJ-H6', mode: 'hard', section: 'comms', pillar: 'mitigate',
    title: 'Engineer the breach notification decision for seven parties — including who must NOT be contacted yet.',
    anchor: 'Communication plan under legal exposure (CS0-003 4.2)',
    steps: [
      'Seven parties, one decision each — and exactly one of them must be explicitly held back.',
    ],
    hints: [
      'One nudge (costs score): media gets “do not contact” — all external statements flow through the communications lead after legal sign-off.',
    ],
    feedbackPass:
      'Decision matrix correct: team and legal now, executives within the hour; regulator, customers and law enforcement wait for verified facts and legal review; media is on hold.',
    feedbackFail:
      'Rejected. The team and legal are immediate; executives within the hour. Customers, regulator and law enforcement wait for legal review; media is an explicit hold, not a review case.',
  },
  {
    id: 'H7', fullId: 'OBJ-H7', mode: 'hard', section: 'vault', pillar: 'mitigate',
    title: 'Apply the legal hold to the right artifacts and find the chain-of-custody violation.',
    anchor: 'Retention policy, legal hold & evidence handling (CS0-003 4.2)',
    steps: [
      'Four artifact classes, one preservation notice in force. Decide each class’s fate.',
      'Then mark the single handling step that breaks chain of custody.',
    ],
    hints: [
      'One nudge (costs score): the hold covers materials related to the incident — marketing analytics is not related and expires on schedule.',
    ],
    feedbackPass:
      'Hold applied correctly and the violation found: evidence, related logs and affected-system backups stay until release; analytics expire; the personal-USB-and-email step breaks custody.',
    feedbackFail:
      'Rejected. The hold follows the incident, not the org chart — incident evidence, its related logs and affected backups stay; analytics do not. Custody breaks the moment evidence leaves controlled storage.',
  },
  {
    id: 'H8', fullId: 'OBJ-H8', mode: 'hard', section: 'audit', pillar: 'recognize',
    title: 'Audit the draft IR plan: mark every defective line. Red herrings included.',
    anchor: 'IR plan document components (CS0-003 4.2)',
    steps: [
      'Ten numbered lines from the disbanded program’s draft. Four are defective.',
      'Mark exactly the defective lines — marking sound lines fails the audit.',
    ],
    hints: [
      'One nudge (costs score): two lines describe unusual but sound practice — unusual is not defective. Focus on what would break the response or the law.',
    ],
    feedbackPass:
      'Audit complete: evidence-wiping, reporting bottlenecks, premature customer notification and “improvise, no playbooks” are the four defects. The OT scope, phase list and team composition were sound.',
    feedbackFail:
      'Rejected. The four defects attack retention/legal hold, reporting paths, notification timing and standardization. Unusual-but-sound lines (OT scope, cross-functional team, graduated exercises) are traps.',
  },
  {
    id: 'H9', fullId: 'OBJ-H9', mode: 'hard', section: 'warroom', pillar: 'mitigate',
    title: 'Command the tabletop: choose the correct action for each of the four injects, in sequence.',
    anchor: 'Phase-correct decisions under pressure (CS0-003 4.1/4.2)',
    steps: [
      'Four injects, one correct action each, fixed order.',
      'The wrong-but-tempting option is always in the room. Sign the decision log.',
    ],
    hints: [
      'One nudge (costs score): each inject maps to exactly one phase — contain, contain, eradicate, recover. Choose the option whose verb matches.',
    ],
    feedbackPass:
      'Decision log signed: isolate the VLAN, kill the session, patch before reconnecting, staged return with monitoring. That is a phase-correct command chain.',
    feedbackFail:
      'The room pushes back. Contain technically (VLAN isolation, session kill), eradicate at the root (patch before reconnect), and recover in stages with eyes on — never the dramatic or lazy option.',
  },
];

function objectivesByMode(mode) {
  return OBJECTIVES.filter(function (o) { return o.mode === mode; });
}

/* ------------------------------------------------------------------ */
/* Knowledge Check (quiz)                                              */
/* ------------------------------------------------------------------ */

const QUIZ_MEDIUM = [
  { // tests OBJ-M1 (phase roles)
    id: 'qm1',
    prompt: 'Which phase focuses on building the team, playbooks and tools before anything happens?',
    options: ['Preparation', 'Identification', 'Recovery', 'Lessons Learned'],
    answer: 0,
    explain: 'Preparation is where capability is built in peacetime: plans, playbooks, training, exercises and baselines. Identification only watches, Recovery only restores, and Lessons Learned only happens after — none of them can build what does not exist yet.',
  },
  { // tests OBJ-M2 (phase order)
    id: 'qm2',
    prompt: 'Which phase immediately follows Containment?',
    options: ['Identification', 'Eradication', 'Lessons Learned', 'Preparation'],
    answer: 1,
    explain: 'The chain is Containment → Eradication → Recovery: stop the damage, then remove the root cause, then restore. Eradication is the only option that removes the attacker’s door; jumping straight to recovery or closing the book early leaves it open.',
  },
  { // tests OBJ-M8 (exercise types)
    id: 'qm3',
    prompt: 'Which exercise type is discussion-based, cheapest, and usually an organization’s first?',
    options: ['Full interruption', 'Parallel', 'Tabletop', 'Simulation'],
    answer: 2,
    explain: 'A tabletop walks the team through a scenario in discussion, with no systems touched. It is low-cost, low-risk, and the standard first rung — the other three types all activate systems or recovery sites, which costs money and carries risk.',
  },
  { // tests OBJ-M6 (plan ecosystem)
    id: 'qm4',
    prompt: 'A flood knocks out the data center. Which plan governs restoring IT systems at the recovery site?',
    options: ['BCP', 'DRP', 'COOP', 'IRP'],
    answer: 1,
    explain: 'The Disaster Recovery Plan restores IT systems and infrastructure. The BCP keeps business functions running in the meantime, COOP covers essential operations and leadership succession, and the IRP governs the security-incident response — different scopes, different owners.',
  },
  { // tests OBJ-M9 (retention & legal hold)
    id: 'qm5',
    prompt: 'A regulator sends a preservation notice for an active case. What must the retention program do?',
    options: [
      'Re-file the preservation notice and keep the schedule running unchanged',
      'Accelerate deletion of records older than 90 days to reduce exposure',
      'Suspend destruction of in-scope records until release (a legal hold)',
      'Move the in-scope records into longer-term backup storage',
    ],
    answer: 2,
    explain: 'A legal hold overrides the retention schedule: nothing in scope may be destroyed until the hold is released. Re-filing changes nothing, faster deletion is spoliation (destroying evidence the case needs), and backup copies do not satisfy preservation — the schedule itself must be suspended.',
  },
  { // tests OBJ-M10/M12 (standardized processes, lesson success factors)
    id: 'qm6',
    prompt: 'Why do organizations standardize response procedures into playbooks?',
    options: [
      'To give auditors a paper trail after incidents close',
      'To shift response duties from the CSIRT to IT operations',
      'To let each responder choose whichever procedure fits the moment',
      'So responders execute proven, consistent steps under stress',
    ],
    answer: 3,
    explain: 'Under stress people fall back on what is written — playbooks turn individual skill into repeatable organizational capability. They are not audit paperwork, they do not move response duties off the CSIRT, and per-responder improvisation is exactly what standardization exists to remove.',
  },
];

const QUIZ_HARD = [
  { // tests OBJ-H9/H3 (containment first)
    id: 'qh1',
    prompt: '02:00 — Ransomware is actively encrypting file shares. What is the FIRST priority?',
    options: [
      'Restore affected systems from last night’s backups',
      'Open a negotiation channel with the attacker',
      'Issue a holding statement to affected customers',
      'Isolate affected systems to stop the spread',
    ],
    answer: 3,
    explain: 'Active spread must be stopped first: restoring while encryption continues loses more systems, negotiating does not halt the payload, and customer messaging waits for verified facts and legal review. Containment precedes eradication and recovery.',
  },
  { // tests OBJ-H2 (CSIRT composition flexes with the incident)
    id: 'qh2',
    prompt: 'An insider is suspected of exfiltrating employee HR data. Which two seats MUST join the CSIRT for this case?',
    options: [
      'PR lead and payroll clerk',
      'HR director and legal counsel',
      'Desktop support and facilities',
      'External auditor and PR lead',
    ],
    answer: 1,
    explain: 'Employee-related incidents pull in HR (personnel process) and Legal (employment law, evidence, disclosure duties). PR handles only approved messaging later, payroll and facilities are not CSIRT seats, and external auditors arrive in the after-action phase — composition flexes with the incident, that is stakeholder management.',
  },
  { // tests OBJ-H6 (comms gate under legal exposure)
    id: 'qh3',
    prompt: 'When may the customer notification for a confirmed data breach go out?',
    options: [
      'Within 15 minutes of declaration — speed above all',
      'Only after facts are verified and legal review is completed',
      'Never — silence avoids lawsuits and regulator attention',
      'Whenever the marketing calendar allows a coordinated announcement',
    ],
    answer: 1,
    explain: 'External notifications are gated by the communication plan: verified facts first, legal review for regulatory duties. A 15-minute notice goes out before containment is confirmed and can itself breach disclosure rules, silence violates those duties too, and marketing convenience is not a legal gate.',
  },
  { // tests OBJ-H4 (exercise program maturity)
    id: 'qh4',
    prompt: 'Atlas has never run an exercise and has almost no budget. Which type do you schedule first?',
    options: ['Full interruption', 'Parallel', 'Tabletop', 'Simulation'],
    answer: 2,
    explain: 'First-ever exercises start at the discussion rung: a tabletop builds shared awareness at near-zero cost and zero production risk. The other types activate systems, sites or simulated incidents the team is not ready to run — ladder up only as maturity grows.',
  },
  { // tests OBJ-H7 (chain of custody)
    id: 'qh5',
    prompt: 'Which evidence-handling step breaks chain of custody?',
    options: [
      'Hashing the image at collection and recording the value',
      'Signing and dating every transfer between custodians',
      'Emailing a copy to a colleague from a personal USB drive',
      'Analyzing a verified copy while the original stays sealed',
    ],
    answer: 2,
    explain: 'Custody means continuous, documented control: hashing, signed transfers and sealed-original analysis all preserve it. A copy traveling on a personal device through uncontrolled channels breaks that control — integrity and legal value are gone the moment it leaves custody.',
  },
  { // tests OBJ-H5 (COOP boundary)
    id: 'qh6',
    prompt: 'Leadership succession and devolution of authority during a regional crisis belong to which plan?',
    options: ['COOP', 'DRP', 'IRP', 'Playbook'],
    answer: 0,
    explain: 'The Continuity of Operations Plan covers how mission-essential functions continue — including alternate leadership chains, facilities and personnel. DRP only restores IT, the IRP governs security incidents, and a playbook is a step-by-step procedure for one incident type.',
  },
  { // tests OBJ-H3 (severity = impact × urgency, not recoverability)
    id: 'qh7',
    prompt: 'The ERP is down and order flow has stopped, but clean backups can restore it within hours. How should this be graded?',
    options: [
      'SEV-4 — it is recoverable, so it cannot be serious',
      'SEV-1 — total functional impact on a business-critical service',
      'SEV-3 — good backups make the outage routine',
      'No grade — the post-incident review will confirm the scope',
    ],
    answer: 1,
    explain: 'Severity weighs functional impact and urgency — not recoverability: a business-stopping outage on a revenue system is SEV-1 even with good backups. Recoverability shapes the Recovery phase, and triage happens now, not after the review.',
  },
];

/* ------------------------------------------------------------------ */
/* Glossary                                                            */
/* ------------------------------------------------------------------ */

const GLOSSARY = [
  { term: 'Incident Response Plan (IRP)', def: 'The document that defines how the organization detects, responds to and recovers from security incidents.' },
  { term: 'Playbook / Runbook', def: 'A standardized, step-by-step procedure for handling a specific, repeatable incident type.' },
  { term: 'CSIRT', def: 'Computer Security Incident Response Team — the cross-functional team that executes the IR plan.' },
  { term: 'Stakeholder', def: 'Any party with a stake in the incident’s handling: executives, employees, customers, regulators, law enforcement.' },
  { term: 'Escalation path', def: 'The pre-agreed route for raising an incident’s visibility as severity grows.' },
  { term: 'Severity', def: 'A grade (SEV-1…SEV-4) combining functional impact and urgency, driving prioritization and escalation.' },
  { term: 'Tabletop', def: 'Discussion-based exercise: the team talks through a scenario; no systems touched; lowest cost.' },
  { term: 'Walkthrough', def: 'Exercise where team members step through plan procedures in order at a basic level.' },
  { term: 'Simulation', def: 'Functional exercise: responders act as if a real incident is occurring; production is untouched.' },
  { term: 'Parallel test', def: 'Recovery systems are activated at the alternate site while production keeps running.' },
  { term: 'Full-interruption test', def: 'Production is deliberately shut down and failover is executed — highest realism, highest risk.' },
  { term: 'Business Continuity Plan (BCP)', def: 'How critical business functions keep running during and after a disruption.' },
  { term: 'Disaster Recovery Plan (DRP)', def: 'How IT systems and infrastructure are restored after a disaster.' },
  { term: 'COOP', def: 'Continuity of Operations Plan — how mission-essential operations continue (people, facilities, leadership succession).' },
  { term: 'Legal hold', def: 'A directive suspending destruction of records in scope of litigation or investigation, overriding retention schedules.' },
];

/* ------------------------------------------------------------------ */
/* Real-world case files (Knowledge Core) — simplified, public sources */
/* ------------------------------------------------------------------ */

const CASE_FILES = [
  {
    title: 'Maersk · NotPetya',
    year: '2017',
    fact: 'Wiper-propagating malware forced the shipping giant to rebuild tens of thousands of endpoints; reported costs reached ~$300M.',
    lesson: 'Recovery planning and clean-backup strategy decided how fast the business came back.',
  },
  {
    title: 'Colonial Pipeline',
    year: '2021',
    fact: 'A ransomware intrusion halted fuel pipeline operations for days; the response drew national coordination and a partial forensic ransom recovery.',
    lesson: 'Containment decisions (shutting operations) and communication plans run at executive level — plan them in advance.',
  },
  {
    title: 'Change Healthcare',
    year: '2024',
    fact: 'A ransomware attack disrupted pharmacy and medical claims processing nationwide for weeks.',
    lesson: 'Continuity planning (BCP/COOP) for mission-essential functions is as important as the technical IRP.',
  },
];

/* ------------------------------------------------------------------ */
/* MITRE mapping (Knowledge Core / Debrief) — verified IDs only        */
/* ------------------------------------------------------------------ */

const MITRE_MAP = [
  { tid: 'T1566', name: 'Phishing', tactic: 'Initial Access', planAnswer: 'Phishing playbook + user-report channel; M1017 User Training, M1049 Antivirus/Antimalware' },
  { tid: 'T1078', name: 'Valid Accounts', tactic: 'Initial Access / Persistence / Privilege Escalation / Defense Evasion', planAnswer: 'Account triage & session revocation steps; M1026 Privileged Account Management, M1032 Multi-Factor Authentication' },
  { tid: 'T1486', name: 'Data Encrypted for Impact', tactic: 'Impact', planAnswer: 'Ransomware playbook + isolation runbook; M1053 Remote Data Storage (protected backups), M1040 Disable or Modify Tools (tamper-resistant security tooling)' },
  { tid: 'T1048', name: 'Exfiltration Over Alternative Protocol', tactic: 'Exfiltration', planAnswer: 'Egress monitoring & DLP in Identification; M1057 Data Loss Prevention, M1037 Filter Network Traffic, M1030 Network Segmentation' },
];

const REFERENCE_LINKS = [
  { label: 'MITRE ATT&CK', href: 'https://attack.mitre.org', note: 'Adversary tactics & techniques catalog' },
  { label: 'MITRE D3FEND', href: 'https://d3fend.mitre.org', note: 'Countermeasure knowledge base' },
  { label: 'NIST SP 800-61', href: 'https://csrc.nist.gov/pubs/sp/800/61/r3/final', note: 'Computer Security Incident Handling Guide' },
  { label: 'CompTIA CySA+ CS0-003', href: 'https://www.comptia.org/certifications/cybersecurity-analyst', note: 'Official certification page' },
];

/* ------------------------------------------------------------------ */
/* Field Notes (debrief annex) — from the original debrief.tsx         */
/* ------------------------------------------------------------------ */

const DETECTION_SOURCES = [
  { src: 'SIEM / auth logs', use: 'Failed-login bursts, odd-hour admin activity, geo anomalies — feeds Identification-phase classification (the INC failed-login pattern).' },
  { src: 'EDR telemetry', use: 'Process ancestry (e.g. anomalous PowerShell), auto-quarantine events — drives SEV grading evidence.' },
  { src: 'Email gateway logs', use: 'Campaign scope searches (“who else got this message?”) — the phishing playbook’s step 3.' },
  { src: 'Netflow / DNS / egress', use: 'Bulk-upload patterns (~2 GB to personal file-share sites) — early exfiltration signal.' },
  { src: 'Backup integrity checks', use: 'Verified-clean restore points — the Recovery phase precondition and the ransomware counter.' },
];

const BLUE_TAKEAWAYS = [
  'The lifecycle is a loop — Lessons Learned feeds Preparation; a plan that never changes after an incident is already stale.',
  'Severity = impact × urgency. Recoverability shapes the Recovery phase, never the grade.',
  'External communication waits for verified facts and legal review; internal notification moves immediately.',
  'Retention schedules delete on time; legal holds delete nothing until released — both live in the same policy.',
  'Exercises climb a ladder: each rung (tabletop → walkthrough → simulation → parallel → full interruption) proves what the previous could not.',
];

const RED_TAKEAWAYS = [
  'Attackers count on unpracticed plans. A team that has only ever read the plan behaves like a team seeing it for the first time.',
  'Phase-confusion is an attacker multiplier: responders who “eradicate before containing” or “notify before verifying” burn hours you can exploit.',
  'The comms gate is an attack surface: premature customer or media notification is pressure you can apply by simply being discovered.',
  'Improvised response skips evidence preservation — by the time the plan is improvised, the volatile evidence is gone.',
];
