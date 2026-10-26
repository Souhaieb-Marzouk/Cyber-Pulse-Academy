// ── THE VULN BULLETIN ── all lab content (100% synthetic training data) ──────
// Static port of src/lib/lab/content.ts (Next.js lab) — data is carried over 1:1.
// Organization "Meridian Logistics" is FICTIONAL; CVE/CVSS values match public NVD records.
// Organization "Meridian Logistics" is FICTIONAL. CVE identifiers and CVSS
// base scores are real and match public NVD records; everything else is
// invented for training purposes.

const LAB_NAME = 'THE VULN BULLETIN'
const LAB_SUB = 'Program Office Desk · CySA+ CS0-003 · Lesson 7.1 — Effective Communication Concepts'

// ── Wire stories (scanner feed) ───────────────────────────────────────────────
const STORIES = [
  {
    id: 'W-01', headline: 'Remote code execution in Apache Log4j on the customer order portal',
    cve: 'CVE-2021-44228', cvss: 10.0, severity: 'Critical',
    system: 'CUST-PORTAL-01 (Apache / Log4j 2.14)', exposure: 'Internet-facing',
    status: 'Open — no fix deployed', lastScannedDays: 1, stale: false,
    detail: 'JNDI lookup feature enabled. Public exploits exist and CISA lists active exploitation. No compensating control at the portal tier.',
    likelihood: 'Very likely', impact: 'Severe',
  },
  {
    id: 'W-02', headline: 'Netlogon privilege elevation "Zerologon" on domain controller DC01',
    cve: 'CVE-2020-1472', cvss: 10.0, severity: 'Critical',
    system: 'DC01 (Windows Server 2019)', exposure: 'Internal',
    status: 'Patch available — not scheduled', lastScannedDays: 3, stale: false,
    detail: 'August 2020 cumulative update fixes it. DC01 is one of two domain controllers; compromise would yield full domain takeover.',
    likelihood: 'Likely', impact: 'Severe',
  },
  {
    id: 'W-03', headline: 'OpenSSL heartbeat read overflow "Heartbleed" on legacy mail gateway',
    cve: 'CVE-2014-0160', cvss: 7.5, severity: 'High',
    system: 'MAIL-GW-LEGACY (appliance)', exposure: 'Internal',
    status: 'Mitigated — never re-verified', lastScannedDays: 60, stale: false, unverified: true,
    detail: 'Ticket closed 30 days ago after a hotfix, but no verification scan was recorded since. The 60-day-old finding is the only evidence on file.',
    likelihood: 'Possible', impact: 'Major',
  },
  {
    id: 'W-04', headline: 'SMB signing not enforced on the 12-node file-server cluster',
    cvss: 5.5, severity: 'Medium',
    system: 'FILE-NODE-01..12', exposure: 'Internal',
    status: 'Open', lastScannedDays: 2, stale: false,
    detail: 'Allows NTLM relay attacks on the internal network. Fix is a group-policy change; needs a maintenance window.',
    likelihood: 'Possible', impact: 'Moderate',
  },
  {
    id: 'W-05', headline: 'Windows Print Spooler RCE "PrintNightmare" on 14 servers',
    cve: 'CVE-2021-34527', cvss: 8.8, severity: 'High',
    system: 'Spooler service on 14 application servers', exposure: 'Internal',
    status: 'Open — workaround debated', lastScannedDays: 2, stale: false,
    detail: 'Out-of-band July 2021 update available. Some servers run legacy printing middleware, so ops wants a staged rollout.',
    likelihood: 'Likely', impact: 'Major',
  },
  {
    id: 'W-06', headline: 'Self-signed TLS certificate on the HR self-service portal',
    cvss: 3.1, severity: 'Low',
    system: 'HR-PORTAL-02', exposure: 'Internal',
    status: 'Open', lastScannedDays: 5, stale: false,
    detail: 'Users see a browser warning; some have learned to click through warnings, which trains bad habits. Replace with a managed cert.',
    likelihood: 'Unlikely', impact: 'Minor',
  },
  {
    id: 'W-07', headline: 'RDP BlueKeep exposure on legacy terminal server FIN-TERM-02',
    cve: 'CVE-2019-0708', cvss: 8.1, severity: 'High',
    system: 'FIN-TERM-02 (Windows Server 2008 R2)', exposure: 'Unclear — inventory says decommissioned',
    status: 'Open — host status unconfirmed', lastScannedDays: 214, stale: true,
    detail: 'The scanner cannot confirm the host is live. The asset inventory marked FIN-TERM-02 decommissioned 7 months ago, but nobody verified. Do not report this as current fact.',
    likelihood: 'Possible', impact: 'Major',
  },
  {
    id: 'W-08', headline: 'TLS 1.0 still enabled on the legacy billing API endpoint',
    cvss: 5.3, severity: 'Medium',
    system: 'LB-EDGE-3 (billing API virtual host)', exposure: 'Internal',
    status: 'Open', lastScannedDays: 122, stale: true,
    detail: 'Fails current transport policy. Two internal billing clients are documented as TLS-1.0-only; a migration plan is missing. Note: the scan record is also 122 days old.',
    likelihood: 'Unlikely', impact: 'Moderate',
  },
  {
    id: 'W-09', headline: 'Missing Content-Security-Policy header on the marketing site',
    cvss: 3.7, severity: 'Low',
    system: 'MKT-CMS-01', exposure: 'Internet-facing',
    status: 'Open — informational', lastScannedDays: 1, stale: false,
    detail: 'Defense-in-depth gap only; no exploitable finding attached. Good hygiene item for the ops backlog, not an emergency.',
    likelihood: 'Unlikely', impact: 'Minor',
  },
]

// ── Stakeholder directory ─────────────────────────────────────────────────────
const STAKEHOLDERS = [
  { id: 'ST-EXEC', name: 'Executive Leadership & Board', role: 'CISO, CEO, board risk committee', needs: ['Strategic risk in business terms', 'Trends over time', 'Decisions they must make'], avoids: 'Raw vectors, host lists, packet captures' },
  { id: 'ST-OPS', name: 'IT Operations', role: 'System & patch engineers', needs: ['Host lists & patch KB links', 'Change-window runbooks', 'Technical depth'], avoids: 'Business trend slides' },
  { id: 'ST-SOC', name: 'SOC Analysts', role: 'Detection & response team', needs: ['Detection signatures & IOCs', 'Scanner deltas', 'Exploit context'], avoids: 'Budget requests' },
  { id: 'ST-LEGAL', name: 'Legal & Compliance', role: 'Counsel, auditors', needs: ['Regulatory exposure', 'Evidence of due diligence', 'Records & retention'], avoids: 'Server nicknames' },
  { id: 'ST-MGR', name: 'Department Managers & Control Owners', role: 'Team leads, control owners', needs: ['Team downtime windows', 'Training completion tracking', 'Staff actions'], avoids: 'Unexplained scanner exports' },
  { id: 'ST-ALL', name: 'All Employees', role: 'Everyone at Meridian', needs: ['Plain-language actions', 'How to report anything suspicious', 'Awareness reminders'], avoids: 'Jargon of any kind' },
]

// ── Report content cards (routing exercise) ──────────────────────────────────
const CONTENT_CARDS = [
  { id: 'C-01', label: 'Summary: 3 critical/high findings, est. $48k/day downtime exposure', acceptable: ['ST-EXEC'] },
  { id: 'C-02', label: 'Six-month trend chart: open findings by severity', acceptable: ['ST-EXEC'] },
  { id: 'C-03', label: 'Decision request: approve emergency patch window Sat 02:00–06:00', acceptable: ['ST-EXEC'] },
  { id: 'C-04', label: 'Host list, patch KB links, change-window runbook', acceptable: ['ST-OPS'] },
  { id: 'C-05', label: 'Full scanner export with CVSS v3.1 vector strings', acceptable: ['ST-OPS'] },
  { id: 'C-06', label: 'Detection signatures & IOC watchlist for Log4j exploitation attempts', acceptable: ['ST-SOC'] },
  { id: 'C-07', label: 'Regulatory exposure memo: PCI DSS 6.3.2 / GDPR Art. 32 notes', acceptable: ['ST-LEGAL'] },
  { id: 'C-08', label: 'Due-diligence evidence pack: scan dates, approvals, sign-offs', acceptable: ['ST-LEGAL'] },
  { id: 'C-09', label: 'Team downtime schedule + training completion tracker', acceptable: ['ST-MGR'] },
  { id: 'C-10', label: 'Plain-language reminder: how to spot & report phishing', acceptable: ['ST-ALL'] },
]

// ── Executive brief candidates (M4; correct = C-01, C-02, C-03) ──────────────
const EXEC_POOL = ['C-01', 'C-02', 'C-03', 'C-04', 'C-05', 'C-06', 'C-08', 'C-10']
const EXEC_CORRECT = ['C-01', 'C-02', 'C-03']

// ── Metric chips (qual vs quant) ──────────────────────────────────────────────
const METRIC_CHIPS = [
  { id: 'Q1', label: 'CVSS base score: 10.0', kind: 'quant' },
  { id: 'Q2', label: 'Critical findings overdue > 30 days: 2', kind: 'quant' },
  { id: 'Q3', label: 'Mean time to remediate (90-day avg): 45 days', kind: 'quant' },
  { id: 'Q4', label: 'Patch coverage: 82% of endpoints', kind: 'quant' },
  { id: 'L1', label: 'Reputational damage risk: high', kind: 'qual' },
  { id: 'L2', label: 'Likelihood of exploitation: very likely', kind: 'qual' },
  { id: 'L3', label: 'Business impact: severe disruption to order fulfilment', kind: 'qual' },
  { id: 'L4', label: 'Expert judgment: aging firewall unlikely to fail this quarter', kind: 'qual' },
]

// ── Report types (M7 matching) ────────────────────────────────────────────────
const REPORT_TYPES = [
  { id: 'RT-SCAN', name: 'Vulnerability scan report', purpose: 'What this run found: hosts, CVEs, severities' },
  { id: 'RT-REM', name: 'Remediation report', purpose: 'What was fixed, how, and whether the re-scan verified clean' },
  { id: 'RT-REG', name: 'Risk record (register)', purpose: 'Living entry per risk: owner, likelihood, impact, treatment, review date' },
  { id: 'RT-MET', name: 'Metrics report', purpose: 'Program performance over time: MTTR, coverage, overdue counts' },
]
const REPORT_PURPOSES = [
  { id: 'P-SCAN', text: 'What this run found: hosts, CVEs, severities', answer: 'RT-SCAN' },
  { id: 'P-REM', text: 'What was fixed, how, and whether the re-scan verified clean', answer: 'RT-REM' },
  { id: 'P-REG', text: 'Living entry per risk: owner, likelihood, impact, treatment, review date', answer: 'RT-REG' },
  { id: 'P-MET', text: 'Program performance over time: MTTR, coverage, overdue counts', answer: 'RT-MET' },
]

// ── Communication plan items ──────────────────────────────────────────────────
const AUDIENCES = STAKEHOLDERS.map(s => ({ value: s.id, label: s.name }))
const CADENCES = [
  { value: 'Weekly', label: 'Weekly' }, { value: 'Monthly', label: 'Monthly' },
  { value: 'Quarterly', label: 'Quarterly' }, { value: 'Annual', label: 'Annual' },
  { value: 'On discovery', label: 'On discovery (ad hoc)' },
]
const METHODS = [
  { value: 'M-DASH', label: 'Executive dashboard + 1-page brief' },
  { value: 'M-STANDUP', label: 'Ticket-queue stand-up' },
  { value: 'M-REVIEW', label: 'Formal review meeting with minutes' },
  { value: 'M-ALERT', label: 'SMS alert + intranet banner + team channels' },
  { value: 'M-LMS', label: 'LMS course + phishing drill' },
]
const COMMS = [
  { id: 'COMM-EXEC', name: 'Executive brief', audience: 'ST-EXEC', cadence: 'Monthly', method: 'M-DASH' },
  { id: 'COMM-OPS', name: 'Ops triage huddle', audience: 'ST-OPS', cadence: 'Weekly', method: 'M-STANDUP' },
  { id: 'COMM-QR', name: 'Control review board', audience: 'ST-MGR', cadence: 'Quarterly', method: 'M-REVIEW' },
  { id: 'COMM-EMG', name: 'Emergency bulletin', audience: 'ST-ALL', cadence: 'On discovery', method: 'M-ALERT' },
  { id: 'COMM-ANN', name: 'Awareness refresher', audience: 'ST-ALL', cadence: 'Annual', method: 'M-LMS', hardOnly: true },
]

// ── SLA / deadline board ──────────────────────────────────────────────────────
const SEVERITY_TIERS = [
  { id: 'critical', label: 'Critical (e.g. W-01, W-02)', min: 1, max: 7, example: 7 },
  { id: 'high', label: 'High (e.g. W-05)', min: 8, max: 30, example: 30 },
  { id: 'medium', label: 'Medium (e.g. W-04, W-08)', min: 31, max: 90, example: 90 },
  { id: 'low', label: 'Low (e.g. W-06, W-09)', min: 91, max: 180, example: 180 },
]
const SLA_CHIPS = [1, 3, 7, 14, 30, 45, 60, 90, 120, 180, 365]

// ── Controls (review console) ─────────────────────────────────────────────────
const CONTROLS = [
  { id: 'CTL-1', name: 'EDR on all endpoints', evidence: 'Blocked 12 Log4j callback attempts last week; alerts flowed to SOC.', verdict: 'effective' },
  {
    id: 'CTL-2', name: 'Perimeter egress firewall rules', evidence: 'Outbound rules are effectively allow-any: a Log4j callback/exfil path is open. Needs a targeted update.', verdict: 'update',
    updateOptions: [
      { id: 'U2-A', label: 'Add WAF virtual patch on the portal + restrict egress to an allow-list' },
      { id: 'U2-B', label: 'Buy a bigger firewall appliance and keep the rules' },
      { id: 'U2-C', label: 'Do nothing and wait for the patch to land' },
    ], correctUpdate: 'U2-A',
  },
  {
    id: 'CTL-3', name: 'Annual user awareness training', evidence: 'Phishing click-through rate is 19% — the annual course is not holding.', verdict: 'update',
    updateOptions: [
      { id: 'U3-A', label: 'Quarterly phishing simulations + 5-minute micro-training after each' },
      { id: 'U3-B', label: 'Make the annual course longer (6 hours)' },
      { id: 'U3-C', label: 'Send a memo reminding staff to be careful' },
    ], correctUpdate: 'U3-A',
  },
  { id: 'CTL-4', name: 'Monthly vulnerability scanning', evidence: 'Feed is current (W-01..W-06 scanned within 5 days). Note for next review: weekly cadence for internet-facing assets.', verdict: 'effective' },
  { id: 'CTL-5', name: 'Asset inventory process', evidence: 'Flagged the FIN-TERM-02 inventory/scan discrepancy promptly — but the doubt is still unresolved.', verdict: 'effective', hardOnly: true },
]

// ── Participation degrees (M11) ───────────────────────────────────────────────
const PARTICIPATION_OPTIONS = [
  { id: 'PT-1', label: 'Stay alert: report suspicious emails; complete annual training' },
  { id: 'PT-2', label: 'Patch within SLA; keep the asset inventory accurate' },
  { id: 'PT-3', label: 'Schedule team downtime windows; track training completion' },
  { id: 'PT-4', label: 'Run weekly scans; analyze and escalate findings' },
  { id: 'PT-5', label: 'Approve budgets and emergency patch windows' },
]
const PARTICIPATION_ROWS = [
  { id: 'ST-ALL', label: 'All Employees', answer: 'PT-1' },
  { id: 'ST-OPS', label: 'IT Operations', answer: 'PT-2' },
  { id: 'ST-MGR', label: 'Department Managers & Control Owners', answer: 'PT-3' },
]

// ── Buy-in drivers (M12 / H8) ─────────────────────────────────────────────────
const BUYIN_OPTIONS = [
  { id: 'B1', label: 'Tie findings to business impact — downtime cost per day ($48k)', correct: true },
  { id: 'B2', label: 'Show the 6-month trend against an industry benchmark', correct: true },
  { id: 'B3', label: 'Present a decision-ready plan with costed options', correct: true },
  { id: 'B4', label: 'Attach the raw 10,000-line scanner export', correct: false },
  { id: 'B5', label: 'Lean on doomsday fear scenarios to force a yes', correct: false },
  { id: 'B6', label: 'Wait for a real incident to prove the point', correct: false },
]
const FRAMING_LINES = [
  { id: 'F1', label: '“Patching in 7 days avoids an estimated $310k of expected downtime vs a 30-day window — the patch window costs one Saturday.”' },
  { id: 'F2', label: '“We will be legally liable if you say no to this!”' },
  { id: 'F3', label: '“Trust me — I have done security for 20 years.”' },
]

// ── Risk register (H5) ────────────────────────────────────────────────────────
const RISK_ITEMS = [
  { id: 'R-01', label: 'Log4j RCE on the internet-facing order portal, actively exploited', band: 'Critical' },
  { id: 'R-02', label: 'Rising phishing click-rate (19%) plus password reuse on key systems', band: 'High' },
  { id: 'R-03', label: 'Default credentials on an isolated test VM (no production data)', band: 'Medium' },
  { id: 'R-04', label: 'TLS 1.0 on a legacy internal billing API', band: 'Low' },
  { id: 'R-05', label: 'Unverified status of the possibly-decommissioned terminal server FIN-TERM-02', band: 'Medium' },
]
const RISK_BANDS = ['Critical', 'High', 'Medium', 'Low']

// ── Queue justification chips (H1; correct QR-1 + QR-2) ──────────────────────
const QUEUE_REASONS = [
  { id: 'QR-1', label: 'Internet-facing and actively exploited in the wild' },
  { id: 'QR-2', label: 'CVSS 10.0 — full system compromise, severe business impact' },
  { id: 'QR-3', label: 'It was scanned most recently, so it must be the worst' },
  { id: 'QR-4', label: 'The scanner alphabetically lists it first' },
  { id: 'QR-5', label: 'Legal asked us to prioritize it' },
]
const QUEUE_CORRECT_REASONS = ['QR-1', 'QR-2']

// ── Board report critique (H2) ────────────────────────────────────────────────
const CRITIQUE_SENTENCES = [
  { id: 'S1', text: 'Open critical findings: 2 (Log4j RCE on the customer portal, Zerologon on DC01); high: 2.', flaw: false, why: 'Accurate, audience-appropriate summary — keep it.' },
  { id: 'S2', text: 'The portal runs Apache Log4j 2.14 with JNDI lookup enabled (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H).', flaw: true, why: 'Raw CVSS vector strings are technical jargon — wrong for a board audience; route them to ops/SOC.' },
  { id: 'S3', text: 'As of the last full scan 214 days ago, the terminal server FIN-TERM-02 was still reachable.', flaw: true, why: 'Stale data presented as current fact — a reporting defect; verify before publishing.' },
  { id: 'S4', text: 'Unmitigated, the portal exposure could halt customer order intake — an estimated $48k revenue impact per day.', flaw: false, why: 'Business impact in money and operations — exactly what leadership needs.' },
  { id: 'S5', text: 'The board does not need remediation dates; that detail is for engineers.', flaw: true, why: 'Remediation timelines and milestone dates are core reporting content — leadership must see when risk closes.' },
  { id: 'S6', text: 'We request approval for an emergency patch window this Saturday, 02:00–06:00.', flaw: false, why: 'A concrete, decision-ready ask — keep it.' },
  { id: 'S7', text: 'Scan coverage this quarter: 97% of internet-facing assets; reports archived for audit evidence.', flaw: false, why: 'Coverage metric + due-diligence evidence — valuable for compliance readers.' },
  { id: 'S8', text: 'Our vulnerability management program remains generally adequate, probably fine for now.', flaw: true, why: 'Vague, unmeasurable conclusion — reports should state measurable status and next actions.' },
]
const CRITIQUE_CORRECT = ['S2', 'S3', 'S5', 'S8']

// ── Escalation drill (H4) ─────────────────────────────────────────────────────
const ESCALATION_STEPS = [
  { id: 'ES-1', label: 'Call the CISO immediately (phone — the plan’s immediate channel)', decoy: false },
  { id: 'ES-2', label: 'Alert the SOC: deploy detection watch for exploitation attempts', decoy: false },
  { id: 'ES-3', label: 'Publish the emergency bulletin to affected staff (SMS + banner)', decoy: false },
  { id: 'ES-4', label: 'Wait for the monthly executive brief to mention it', decoy: true },
  { id: 'ES-5', label: 'Draft a detailed CVSS analysis for legal before notifying anyone', decoy: true },
]
const ESCALATION_CORRECT = ['ES-1', 'ES-2', 'ES-3']

// ── Milestones (H7) ───────────────────────────────────────────────────────────
const MILESTONES = [
  { id: 'MS-CONTAIN', label: 'Contain — WAF virtual patch, restrict portal access', day: 1 },
  { id: 'MS-MITIGATE', label: 'Mitigate — vendor workaround applied & validated', day: 3 },
  { id: 'MS-PATCH', label: 'Patch — vendor fix deployed, change window closed', day: 7 },
  { id: 'MS-VERIFY', label: 'Verify — re-scan confirms the finding is closed', day: 14 },
]
const MILESTONE_DAYS = [1, 3, 7, 14, 30]

// ── Glossary ──────────────────────────────────────────────────────────────────
const GLOSSARY = [
  { term: 'Vulnerability management', def: 'The ongoing cycle of identifying, assessing, treating and reporting security weaknesses before attackers exploit them.' },
  { term: 'Communication plan', def: 'The documented map of who gets which security information, through which method, how often, and how emergencies escalate.' },
  { term: 'Stakeholder', def: 'Any person or group that affects or is affected by the security program — from the board to every employee.' },
  { term: 'Likelihood & impact', def: 'The two axes of risk assessment: how probable a bad event is, and how much it would hurt if it happened.' },
  { term: 'CVSS', def: 'Common Vulnerability Scoring System — a 0–10 severity score for a technical vulnerability.' },
  { term: 'Quantitative metric', def: 'A risk measure expressed in numbers: CVSS score, MTTR, patch coverage, overdue counts.' },
  { term: 'Qualitative metric', def: 'A risk measure expressed in judgment terms: high reputational risk, very likely, severe disruption.' },
  { term: 'Risk record (register)', def: 'A living entry per risk: owner, likelihood, impact, treatment, and next review date.' },
  { term: 'Remediation timeline', def: 'The committed schedule for fixing a finding — with milestones from containment to verified closure.' },
  { term: 'SLA', def: 'Service level agreement — the maximum accepted time to remediate a finding of a given severity.' },
  { term: 'Data freshness', def: 'How recently the evidence behind a report was collected; stale data must be re-verified, never republished as fact.' },
  { term: 'Executive summary', def: 'A one-page, business-language distillation of risk, trends and the decisions being requested.' },
  { term: 'Consensus & buy-in', def: 'Stakeholder agreement to fund and act — earned with business impact, benchmarks and decision-ready plans.' },
  { term: 'Escalation path', def: 'The pre-agreed immediate channel and order of notification when a risk cannot wait for the regular cycle.' },
]

// ── Quiz banks ────────────────────────────────────────────────────────────────
const QUIZ_MEDIUM = [
  {
    id: 'QM-1', prompt: 'The three core activities vulnerability management reporting ties together are:',
    options: ['Identify, assess, communicate', 'Scan, patch, reboot', 'Detect, respond, recover', 'Inventory, scan, procure'],
    correct: 0,
    explanation: 'Reporting sits at the junction: findings are identified (scans), assessed (likelihood × impact), and communicated (audience-tailored reports). “Detect/respond/recover” belongs to incident response, not vulnerability management; the cycle closes with regular reviews.',
  },
  {
    id: 'QM-2', prompt: 'Which item belongs in a one-page executive brief?',
    options: ['CVSS v3.1 vector strings for each finding in the queue', 'A trend chart, business impact in $, and a decision request', 'The full 10,000-line scanner export, unfiltered', 'Packet captures of exploit attempts against the portal'],
    correct: 1,
    explanation: 'Leadership needs business terms, trend context and a concrete ask. Technical artifacts go to ops/SOC, not the board pack.',
  },
  {
    id: 'QM-3', prompt: 'Which of these is a QUANTITATIVE metric?',
    options: ['“Reputational damage risk: high”', '“Exploitation likelihood: very likely”', '“Mean time to remediate: 45 days”', '“Expert judgment: the old firewall will hold”'],
    correct: 2,
    explanation: 'Quantitative metrics are numeric (45 days, 82%, 10.0). The others are qualitative judgments — useful, but a different bucket.',
  },
  {
    id: 'QM-4', prompt: 'A finding’s scan record is 200+ days old and the asset may be decommissioned. Before reporting it you should:',
    options: ['Report it as an open critical finding, flagged urgent', 'Re-verify with a fresh scan or inventory check, then report that state', 'Close it quietly so the overdue counter stays clean this quarter', 'Report it with the age noted and add that it is probably fine'],
    correct: 1,
    explanation: 'Data freshness: never republish stale evidence as current fact. Verify, then report the verified state — with the verification date.',
  },
  {
    id: 'QM-5', prompt: 'Under a typical severity-based SLA policy, which pairing is correct?',
    options: ['Critical → days (e.g. 7); Low → months (e.g. 180)', 'Critical → 180 days; Low → 7 days', 'All severities → 365 days', 'SLAs only apply to low findings'],
    correct: 0,
    explanation: 'Remediation timelines scale with risk: the higher the severity, the shorter the committed window. Example values are internal policy choices — the concept is what CySA+ tests. (Simplified.)',
  },
  {
    id: 'QM-6', prompt: 'What is the purpose of the quarterly control review?',
    options: ['To confirm existing measures still work and implement updated ones for new vulnerabilities', 'To re-run last year’s audit and file the minutes without acting on them', 'To rewrite the entire security policy from scratch at every meeting', 'To replace monthly scanning, which would make reviews unnecessary'],
    correct: 0,
    explanation: 'Regular reviews verify controls against fresh evidence and drive updated measures — that is how the management process stays effective. Filing minutes without action and policy rewrites both skip the “updated measures” half.',
  },
]

const QUIZ_HARD = [
  {
    id: 'QH-1', prompt: 'The CISO asks: “Why should I care about this Log4j finding?” Best answer:',
    options: ['“Because the scanner flagged it first on the wire this morning, ahead of the queue.”', '“It could halt order intake at ~$48k a day; approve Saturday’s window to close it.”', '“Because the CVSS vector AV:N/AC:L/PR:N makes it the top technical finding on paper.”', '“Because competitors likely share the flaw, and matching their patch pace protects us.”'],
    correct: 1,
    explanation: 'Buy-in = business impact + a decision-ready ask. Scanner flags, vector strings and competitor claims support the story, but only impact plus a concrete ask moves a budget.',
  },
  {
    id: 'QH-2', prompt: 'A risk record is 200 days old and its asset may be decommissioned. Professionally you:',
    options: ['Escalate it as an open critical so leadership sees the worst case on record', 'Mark it unverified, order a re-scan and inventory check, then report that state', 'Close it as a false positive so the overdue counter stops flagging it', 'Hold it out of every report until someone confirms the host is really gone'],
    correct: 1,
    explanation: 'Data freshness rule: verify, then report the verified state. Hiding or inflating both break the program’s credibility.',
  },
  {
    id: 'QH-3', prompt: 'Four documents exist: vector strings, host list + patch KB, due-diligence evidence pack, IOC watchlist. Correct routing?',
    options: ['All four to the board — more evidence in the pack looks more diligent', 'Vectors and host list → ops; evidence pack → legal/compliance; IOCs → SOC', 'Everything to everyone by default — transparency beats careful filtering', 'Host list to all employees so each person can patch their own machine'],
    correct: 1,
    explanation: 'Stakeholder mapping: ops gets actionable technical detail, legal gets evidence of due diligence, SOC gets detection material. “Everything to everyone” hides signal.',
  },
  {
    id: 'QH-4', prompt: 'A flash advisory: zero-day actively exploited on your internet-facing VPN. First action per the plan?',
    options: ['Add it to next month’s brief agenda so the board sees it with full context', 'Call the CISO via the immediate channel, then alert SOC, then publish the bulletin', 'Wait for the next monthly scan to confirm the finding before waking anyone up', 'Ask legal to review the wording of every notice before anyone is told anything'],
    correct: 1,
    explanation: 'The escalation path exists precisely for this: immediate channel → detection watch → emergency bulletin. Minutes matter during active exploitation.',
  },
  {
    id: 'QH-5', prompt: 'Which split is fully correct?',
    options: ['Quant: CVSS 10.0 and MTTR 45 days · Qual: “very likely” and “severe disruption”', 'Quant: “patch coverage 82%” and “very likely” · Qual: “MTTR 45 days” and “CVSS 10.0”', 'Quant: “high reputational risk” and “aging firewall” · Qual: CVSS scores and overdue counts', 'Neither bucket applies: likelihood and impact must always be reported as raw numbers'],
    correct: 0,
    explanation: 'Numbers = quantitative; judgment descriptors = qualitative. Inverting the buckets (the middle options) is the classic exam trap. Reports blend both: numbers for rigor, judgment for meaning.',
  },
  {
    id: 'QH-6', prompt: 'The review shows a 19% phishing click-rate after annual training. Best remediation update:',
    options: ['Make the annual course longer and repeat it twice a year instead of once', 'Run quarterly phishing simulations with a five-minute micro-training after each', 'Send a strongly-worded memo reminding staff that phishing is against policy', 'Block all external email at the perimeter so phishing becomes impossible'],
    correct: 1,
    explanation: 'Frequent, small, measured interventions beat longer marathons, memos and overblocking — and the simulation data feeds the next review. This is “implementation of updated measures” in practice.',
  },
  {
    id: 'QH-7', prompt: 'A draft board report contains no remediation deadline for a critical finding. Why is that a defect?',
    options: ['It is not a defect — dates are engineering trivia the board never needs', 'Timelines are core report content: leadership must see when risk closes and what it approves', 'Only low findings have flexible dates; criticals are governed by the scanner alone', 'Deadline tracking belongs to legal; the report itself can stay silent on timing'],
    correct: 1,
    explanation: 'Remediation timelines turn a risk statement into a governance commitment — and give the board a decision to approve. No dates, no accountability.',
  },
]

// ── Objectives ────────────────────────────────────────────────────────────────
const OBJECTIVES = [
  // MEDIUM
  { id: 'OBJ-M1', mode: 'medium', pillar: 'P1', section: 'front',
    title: 'On the Front Page, arrange the four activities of the vulnerability management cycle in the correct order.',
    anchor: 'LESSON_DETAIL: “identifying, assessing, and communicating potential risks”',
    passMsg: 'The cycle is Identify → Assess → Communicate → Review. Every report you will ever write is one rotation of this wheel.',
    failMsg: 'Think like the LESSON_DETAIL: first you identify findings, then assess their risk, then communicate — and the cycle closes with review.',
    hints: ['The lesson text names three activities in a row — and one more closes the loop.', 'Start with the scanner: what does it do first?', 'Order: Identify → Assess → Communicate → Review & improve.'] },
  { id: 'OBJ-M2', mode: 'medium', pillar: 'P2', section: 'newsroom',
    title: 'In the Newsroom, open story W-01 and classify its severity, likelihood and impact.',
    anchor: 'CS0-003 5.1: attack likelihood and impact',
    passMsg: 'CVSS 10.0 + internet-facing + actively exploited = Critical severity, very likely, severe impact. This is the story that leads every brief.',
    failMsg: 'Re-read W-01: CVSS 10.0, internet-facing, actively exploited in the wild. Severity follows the score; likelihood follows exploitation evidence; impact follows the business dependency.',
    hints: ['CVSS 10.0 is the maximum possible score.', 'CISA reports active exploitation — how probable is an attempt?', 'Critical · Very likely · Severe.'] },
  { id: 'OBJ-M3', mode: 'medium', pillar: 'P2', section: 'compose',
    title: 'In the Compose Room, route all 10 report content cards to the stakeholder desk that needs them.',
    anchor: 'CS0-003 5.1: stakeholder identification; LESSON_DETAIL: audiences',
    passMsg: 'Stakeholder mapping is the heart of the communication plan: right content → right desk → signal instead of noise.',
    failMsg: 'Check each desk’s “needs / avoids” note. Business summaries go up, technical detail down, evidence to legal, IOCs to SOC, plain words to everyone.',
    hints: ['Each stakeholder card lists what they need — and what they avoid.', 'Who acts on patch windows? Who watches for exploitation? Who needs due-diligence evidence?', 'C-01/02/03 → Exec; C-04/05 → Ops; C-06 → SOC; C-07/08 → Legal; C-09 → Managers; C-10 → All employees.'] },
  { id: 'OBJ-M4', mode: 'medium', pillar: 'P2', section: 'compose',
    title: 'Select exactly the three items that belong on the one-page executive brief.',
    anchor: 'LESSON_DETAIL: “methods used to communicate security risks to leadership”',
    passMsg: 'Summary + trend + decision request: the leadership formula. Everything else lives in the appendices where it belongs.',
    failMsg: 'The brief has room for exactly three: a business summary, a trend, and the decision you need. Vectors, exports and legal packs are appendices.',
    hints: ['What three things does leadership always need: status, trend, and…?', 'They cannot patch — what can only THEY do for you?', 'C-01 (summary), C-02 (trend), C-03 (decision request).'] },
  { id: 'OBJ-M5', mode: 'medium', pillar: 'P1', section: 'compose',
    title: 'Sort all eight metric chips into the qualitative and quantitative bins.',
    anchor: 'CS0-003 5.1: qualitative/quantitative risk metrics',
    passMsg: 'Numbers = quantitative (CVSS, MTTR, coverage, counts). Judgments = qualitative (risk ratings, likelihoods, impact language). Strong reports blend both.',
    failMsg: 'Ask: does the metric carry a number? Scores, days and percentages are quantitative. “High”, “very likely”, “severe disruption” and expert judgment are qualitative.',
    hints: ['Two chips mention days or percentages — start there.', 'Words like “high” and “unlikely” are judgment, not measurement.', 'Quant: CVSS 10.0, overdue 2, MTTR 45 days, coverage 82%. Qual: the rest.'] },
  { id: 'OBJ-M6', mode: 'medium', pillar: 'P4', section: 'press',
    title: 'At the deadline board, set a remediation window (SLA) for each severity tier.',
    anchor: 'CS0-003 5.1: remediation timelines/milestones',
    passMsg: 'Timelines turn findings into commitments: Critical ≤ 7 days, High ≤ 30, Medium ≤ 90, Low ≤ 180 (example policy — the concept is what matters).',
    failMsg: 'Windows must shrink as severity rises. Use the example policy: Critical 7, High 30, Medium 90, Low 180 — pick a chip inside each tier’s band.',
    hints: ['Higher severity → shorter window. Never zero.', 'Critical findings get days, not months; low findings get months, not days.', '7 / 30 / 90 / 180 fits all four bands.'] },
  { id: 'OBJ-M7', mode: 'medium', pillar: 'P1', section: 'compose',
    title: 'Match each report type to the purpose it serves.',
    anchor: 'CS0-003 5.1: producing reports',
    passMsg: 'Four report types, four jobs: what was found, what was fixed, what risks exist, how the program performs. Naming them precisely is CySA+ vocabulary.',
    failMsg: 'Scan report = this run’s findings. Remediation report = fixes + verification. Risk record = the living per-risk entry. Metrics report = program performance over time.',
    hints: ['Which report would you attach to a ticket marked “fixed”?', 'Which one has an owner and a review date per risk?', 'Scan→findings, Remediation→fixed+verified, Risk record→living entry, Metrics→MTTR/coverage.'] },
  { id: 'OBJ-M8', mode: 'medium', pillar: 'P4', section: 'press',
    title: 'Configure the four recurring communications: audience, cadence and method for each.',
    anchor: 'LESSON_DETAIL: communication plan — methods + management processes',
    passMsg: 'That is a communication plan: named audience × cadence × method, including an ad-hoc emergency channel that bypasses the calendar.',
    failMsg: 'Think rhythm: leadership monthly with a dashboard, ops weekly at the ticket queue, control owners quarterly in a review meeting, everyone immediately when it is urgent.',
    hints: ['The emergency channel must NOT wait for a scheduled slot.', 'Executives get the dashboard; ops get a stand-up; reviewers get minutes.', 'Brief→Exec/Monthly/Dashboard · Huddle→Ops/Weekly/Stand-up · Review→Managers/Quarterly/Meeting · Bulletin→All/On discovery/Alert.'] },
  { id: 'OBJ-M9', mode: 'medium', pillar: 'P3', section: 'newsroom',
    title: 'Flag the one wire story whose data is too stale to report on as current fact.',
    anchor: 'CS0-003 5.1: data freshness',
    passMsg: 'W-07’s scan is 214 days old and the host may not even exist. Stale data is re-verified — never republished. That is data freshness.',
    failMsg: 'Look at the “last scanned” stamp on each story. Anything beyond ~90 days with unresolved asset doubt is stale. Only one story crosses that line.',
    hints: ['Sort the wire by age — which story is ancient?', 'One story’s host may have been decommissioned months ago.', 'W-07 — 214 days old with unconfirmed asset status.'] },
  { id: 'OBJ-M10', mode: 'medium', pillar: 'P3', section: 'board',
    title: 'Run the quarterly control review: classify all four controls, then choose the right update for each that needs one.',
    anchor: 'LESSON_DETAIL: “regular reviews … and the implementation of updated ones”',
    passMsg: 'This is the management process working: evidence → verdict → updated measures. Egress rules and annual-only training both failed the review.',
    failMsg: 'Judge by the evidence: which control demonstrably worked (EDR, scanning) and which failed (permissive egress, 19% click-rate)? Then pick updates that actually close the gap.',
    hints: ['Two controls have hard numbers proving they work.', 'A click-rate of 19% is a failing grade for annual training.', 'CTL-1/CTL-4 effective; CTL-2 → WAF + egress allow-list; CTL-3 → quarterly simulations + micro-training.'] },
  { id: 'OBJ-M11', mode: 'medium', pillar: 'P4', section: 'board',
    title: 'Assign the right participation degree to each of the three roles.',
    anchor: 'LESSON_DETAIL: “all employees … participate in the process to varying degrees”',
    passMsg: 'Varying degrees: everyone stays alert, ops patches and keeps inventory true, managers schedule and track. Participation is designed, not assumed.',
    failMsg: 'Match duties to capability: all staff report and train; ops patches and maintains inventory; managers schedule downtime and track completion. Scanning belongs to SOC — a decoy.',
    hints: ['One option belongs to the SOC, not to any of these three roles.', 'What can every employee do that engineers cannot?', 'All→report+train · Ops→patch+inventory · Managers→windows+tracking.'] },
  { id: 'OBJ-M12', mode: 'medium', pillar: 'P4', section: 'board',
    title: 'Select the three drivers that genuinely build leadership buy-in.',
    anchor: 'CS0-003 5.1: increase consensus and buy-in (drivers, methods)',
    passMsg: 'Impact in money, benchmarked trend, decision-ready plan — the triple that turns a briefing into a budget.',
    failMsg: 'Buy-in drivers inform the decision; they do not bully or bury it. Raw dumps, fear theater and “wait for disaster” all destroy credibility.',
    hints: ['CFOs respond to numbers they can compare against peers.', 'What does a decision-maker need in hand to say yes today?', 'B1 (business impact), B2 (trend vs benchmark), B3 (costed plan).'] },
  // HARD
  { id: 'OBJ-H1', mode: 'hard', pillar: 'P2', section: 'newsroom',
    title: 'Build the remediation queue: sequence the three stories that must be actioned first, then attach the two valid justification chips to the queue.',
    anchor: '5.1: goal setting, prioritization, likelihood/impact',
    passMsg: 'W-01 → W-02 → W-05: exposure and exploitability first, then domain-critical, then lateral-movement risk. Prioritization is defensible only with reasons.',
    failMsg: 'Your order or reasons are off. Internet-facing + actively exploited outranks everything; mitigated and informational items are noise, not queue entries.',
    hints: ['One story was mitigated and one is informational hygiene — neither queues.', 'Face vs. domain: which critical touches the internet?', 'W-01, W-02, W-05 in that order; reasons QR-1 + QR-2.'] },
  { id: 'OBJ-H2', mode: 'hard', pillar: 'P3', section: 'compose',
    title: 'Critique the draft board report: mark all four defective sentences — and leave the sound copy unmarked.',
    anchor: '5.1: producing reports (quality); LESSON_DETAIL: leadership methods',
    passMsg: 'You caught stale data-as-fact, jargon for executives, missing timelines, and a vague verdict. That is a full reporting-quality audit.',
    failMsg: 'Four sentences are defective: one presents stale data as current, one drowns the board in vectors, one deletes the timeline, one concludes nothing. The other four are sound.',
    hints: ['Two defects corrupt evidence and language; two corrupt commitments and conclusions.', 'Boards need dates and money — not vector strings.', 'S2, S3, S5, S8 are the defects.'] },
  { id: 'OBJ-H3', mode: 'hard', pillar: 'P4', section: 'press',
    title: 'Complete the FULL communication plan: configure all five communications — audience, cadence, method each.',
    anchor: 'LESSON_DETAIL: communication plan (complete)',
    passMsg: 'Five comms, five rhythms, zero gaps — including the annual awareness refresher. This document would survive an audit.',
    failMsg: 'All five rows must be exact. Remember the fifth row (annual refresher → all employees → LMS + drill) and keep the emergency channel ad-hoc.',
    hints: ['One row runs on the training calendar, not the reporting calendar.', 'Emergency never sits in a monthly slot.', 'Brief→Exec/Monthly/Dash · Huddle→Ops/Weekly/Standup · Review→MGR/Quarterly/Meeting · Bulletin→All/On-discovery/Alert · Refresher→All/Annual/LMS.'] },
  { id: 'OBJ-H4', mode: 'hard', pillar: 'P4', section: 'press',
    title: 'Run the flash drill: execute the three response steps in the correct order — and skip the decoys.',
    anchor: '5.1: escalation path; LESSON_DETAIL: management processes',
    passMsg: 'Immediate channel → detection watch → emergency bulletin. When a zero-day burns, the escalation path outruns every calendar.',
    failMsg: 'Sequence wrong. First notify the accountable executive (phone), then arm the SOC, then warn the staff. Waiting for a monthly slot or drafting legal prose first both lose minutes.',
    hints: ['Which two steps protect detection and people — and which executive owns the risk?', 'Legal prose can wait; a burning VPN cannot.', 'ES-1 (call CISO) → ES-2 (SOC watch) → ES-3 (bulletin).'] },
  { id: 'OBJ-H5', mode: 'hard', pillar: 'P1', section: 'newsroom',
    title: 'Band the five risks into the register matrix (Critical / High / Medium / Low).',
    anchor: '5.1: likelihood/impact, risk records',
    passMsg: 'Exposure × exploitability × unknowns: portal RCE = Critical; human-factor risk = High; contained unknowns and legacy crypto = Medium/Low.',
    failMsg: 'Reread each item’s exposure. Internet-facing + exploited = Critical. “Isolated, no prod data” caps a risk at Medium. Internal-only legacy crypto is Low.',
    hints: ['Only one item touches the internet with active exploitation.', 'R-03 says “isolated, no production data” — that caps its band.', 'R-01 Critical · R-02 High · R-03 Medium · R-04 Low · R-05 Medium.'] },
  { id: 'OBJ-H6', mode: 'hard', pillar: 'P3', section: 'board',
    title: 'Full control review with verification: classify all five controls, apply the correct updates, then run verification.',
    anchor: 'LESSON_DETAIL: regular reviews + updated measures',
    passMsg: 'Classify → update → verify: the complete review loop. Two controls failed on evidence and both got working updates; verification closes the cycle.',
    failMsg: 'Five rows, two failures, two updates, one verification run. CTL-2 and CTL-3 fail on evidence; CTL-1, CTL-4, CTL-5 pass.',
    hints: ['The inventory control spotted the FIN-TERM-02 doubt — that is it working.', 'Pick updates that remove the failure cause, not costlier versions of it.', 'CTL-1/4/5 effective; CTL-2→U2-A; CTL-3→U3-A; then verify.'] },
  { id: 'OBJ-H7', mode: 'hard', pillar: 'P4', section: 'press',
    title: 'Plan the W-01 milestone chain: order the four milestones and set each deadline.',
    anchor: '5.1: remediation timelines/milestones',
    passMsg: 'Contain (day 1) → Mitigate (3) → Patch (7) → Verify (14). Risk drops fast when containment comes first — and closure only counts after verification.',
    failMsg: 'Order and days must match a defensible critical-finding response: containment immediately, workaround fast, patch within the SLA, verification last.',
    hints: ['You cannot verify what you have not patched — and you cannot patch safely before containing.', 'Verification is always the last milestone.', 'Contain=1, Mitigate=3, Patch=7, Verify=14.'] },
  { id: 'OBJ-H8', mode: 'hard', pillar: 'P4', section: 'board',
    title: 'Face the CFO: assemble the three-item response package and choose the framing line.',
    anchor: '5.1: consensus and buy-in',
    passMsg: 'Impact + benchmark + costed plan, delivered in one quantified sentence — that is buy-in under pressure.',
    failMsg: 'The CFO compares numbers and plans, not fear or credentials. Keep B1/B2/B3 and frame with the quantified trade-off (F1).',
    hints: ['Which framing line puts two numbers side by side?', 'Liability threats and seniority claims both fail with finance.', 'Pick B1, B2, B3 — and framing line F1.'] },
  { id: 'OBJ-H9', mode: 'hard', pillar: 'P3', section: 'newsroom',
    title: 'Audit the wire for stale data: flag every affected story, then order their re-scans by risk priority.',
    anchor: '5.1: data freshness',
    passMsg: 'Three freshness defects found, re-scan order justified by risk. Your reports will never launder old data as fact.',
    failMsg: 'Look harder: two stories have ancient scan stamps (214 and 122 days) and one mitigation was never verified by a re-scan. Flag all three, order by risk.',
    hints: ['“Mitigated” without a verification scan is still an open question.', 'Age + exposure + severity decide priority.', 'Flags: W-07, W-03, W-08 · Order: W-07 → W-03 → W-08.'] },
  { id: 'OBJ-H10', mode: 'hard', pillar: 'P2', section: 'compose',
    title: 'Capstone: assemble the monthly report package — executive brief, remediation timeline, review outcome — and publish the edition.',
    anchor: '5.1: producing reports (synthesis)',
    passMsg: 'You produced a complete, audience-correct, evidence-fresh report package. That is the whole lesson, delivered as an artifact.',
    failMsg: 'The package needs all three parts correct before publishing: the 3-card executive brief, severity SLAs set at the deadline board, and the two control updates from the review.',
    hints: ['The status dots tell you exactly which part is still missing.', 'The timeline part reads the deadline board — go set it there.', 'Exec cards C-01/02/03 · SLAs 7/30/90/180 · updates U2-A & U3-A → Publish.'] },
]

const OBJECTIVES_BY_MODE = (mode) => OBJECTIVES.filter(o => o.mode === mode)

// ── Real-world cases (public reporting; used in Knowledge Core) ──────────────
const REAL_CASES = [
  { name: 'Equifax breach (2017)', text: 'Apache Struts CVE-2017-5638 was patched by the vendor in March; the unpatched server was exploited in May. 147M records. The post-incident report criticized missing inventory, scanning and escalation — a communication failure as much as a technical one.' },
  { name: 'WannaCry (2017)', text: 'MS17-010 shipped 59 days before the outbreak. Organizations without patch reporting and escalation watched one unpatched Windows host take down hospitals and railways worldwide.' },
  { name: 'Log4Shell (2021)', text: 'CVE-2021-44228 (CVSS 10.0): patch available December 10; mass exploitation within days. Programs with fresh scans, tight SLAs and clear escalation patched in hours — others found out from attackers.' },
]

const DEBRIEF = {
  detection: [
    'Report-quality alert: any internet-facing finding older than 30 days with no remediation ticket → escalate to owners.',
    'Freshness check: scan record age > 90 days → auto-flag “unverified” and schedule re-scan (risk-ordered).',
    'KPI watch: overdue criticals = 0; MTTR trend ≤ SLA; coverage ≥ 95% of internet-facing assets.',
    'Delta scan diff: new highs/criticals since last run → SOC notification within 24h.',
  ],
  mitigations: [
    { id: 'M1051', name: 'Update Software', text: 'Patch within severity-based SLAs; the W-01/W-02/W-05 queue maps directly here.' },
    { id: 'M1016', name: 'Vulnerability Scanning', text: 'Keep the wire fresh: monthly cadence, weekly for internet-facing; feeds every report.' },
    { id: 'M1017', name: 'User Training', text: 'The awareness refresher + quarterly simulations — participation degrees in practice.' },
    { id: 'M1030', name: 'Network Segmentation', text: 'Compensating control when patching is slow: contain first (milestone day 1).' },
  ],
  blue: [
    'Write for the audience: executives get impact + decision ask; ops get hosts + KBs; SOC get IOCs.',
    'Dates are governance: no timeline in the report means no accountability for the risk.',
    'Verify closures with a re-scan — a closed ticket is a claim, a clean re-scan is evidence.',
    'Blend metrics: numbers for rigor (MTTR, coverage), judgment for meaning (likelihood, impact).',
  ],
  red: [
    'Attackers love stale inventories: “decommissioned” hosts that still boot are free footholds (see W-07).',
    'Noisy reports hide the one critical that matters — burying signal in vector strings helps the intruder.',
    'Every day between finding and patched-and-verified is attacker dwell time; SLAs are your enemy, not paperwork.',
    'Unverified “mitigated” items are doors attackers will test for you (see W-03).',
  ],
}
