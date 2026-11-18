/* ===================================================================
   data.js — All lab content for the Change Authority Bureau
   CompTIA Security+ SY0-801 Lesson 1.2: Change Management
   ===================================================================
   This file contains ALL data: scenario, RFCs, quiz bank, objectives
   with CHECK RESULTS validation functions, glossary, debrief.
   Includes all audit fixes (v4): R3 coloring, R4 rotation, R5 length,
   R6 shuffle, R8 focus areas, fixed mixed-language text.
   All data is SYNTHETIC, FICTIONAL, labeled for training.
   =================================================================== */

/* ===== SVG Icons (inline, no icon fonts/CDNs) ===== */
const ICONS = {
  'stamp': '<path d="M5 22h14M3 18h18M12 2a4 4 0 0 0-4 4c0 1.5.5 2.5 1 3a3 3 0 0 1 .5 1.5V14h5V10.5A3 3 0 0 1 15 9c.5-.5 1-1.5 1-3a4 4 0 0 0-4-4z"/>',
  'shield-check': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.5 6.5-2.5C13.5 2.5 16 4 18 4a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  'alert-triangle': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/>',
  'clipboard-check': '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
  'activity': '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
  'file-text': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M16 13H8M16 17H8M10 9H8"/>',
  'gavel': '<path d="m14.5 12.5-8 8a2.12 2.12 0 1 1-3-3l8-8M16 16l6-6M8 8l6-6M9 7l8 8M21 11l-8-8"/>',
  'book-open': '<path d="M12 7v14M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  'search': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  'scroll-text': '<path d="M15 12h-5M15 8h-5M19 17V5a2 2 0 0 0-2-2H4M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/>',
  'wrench': '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  'users': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  'flask-conical': '<path d="M10 2v7.5M14 9.5V2M8.5 2h7M14 9.5a6.5 6.5 0 1 1-4 0M5.5 16h13"/>',
  'git-branch': '<line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
  'building-2': '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2M10 6h4M10 10h4M10 14h4M10 18h4"/>',
  'lock': '<rect width="16" height="10" x="4" y="11" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>',
  'x-circle': '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>',
  'lightbulb': '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6M10 22h4"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'star': '<path d="M11.5 2.75 9.5 8.5h-6l4.8 3.5-1.8 5.75 4.8-3.5 4.8 3.5-1.8-5.75 4.8-3.5h-6z" transform="translate(.5)"/>',
  'award': '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
  'rotate-ccw': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  'external-link': '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  'clipboard-list': '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4M12 16h4M8 11h.01M8 16h.01"/>',
  'plus': '<path d="M5 12h14M12 5v14"/>',
  'x': '<path d="M18 6 6 18M6 6l12 12"/>',
  'arrow-right': '<path d="M5 12h14M12 5l7 7-7 7"/>',
  'arrow-up': '<path d="m18 15-6-6-6 6"/>',
  'arrow-down': '<path d="m18 9-6 6-6-6"/>',
};

function icon(name, size) {
  const s = size || 16;
  const path = ICONS[name] || '';
  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + path + '</svg>';
}

/* ===== Scenario ===== */
const SCENARIO_ORG = {
  name: 'Meridian Health Networks',
  tagline: 'Fictional regional healthcare provider — training scenario',
  context: 'A 4-hospital regional network running 380+ servers, 12 edge firewalls, and 4,200 endpoints. Subject to HIPAA and PCI-DSS (cardiology billing). Recently suffered a 6-hour outage of the patient portal traced to an undocumented firewall change. The CISO stood up a Change Authority Bureau to restore discipline.',
};

/* ===== Glossary (15 terms) ===== */
const GLOSSARY = [
  { term: 'Change Management', def: 'A formal process for controlling modifications to systems, applications, and infrastructure to minimize risk to security and availability.' },
  { term: 'Request for Change (RFC)', def: 'A formal proposal documenting a proposed modification, its justification, impact, and plan.' },
  { term: 'Impact Analysis', def: 'Assessment of the risk, affected systems, business impact, and security implications of a proposed change.' },
  { term: 'Change Advisory Board (CAB)', def: 'A cross-functional body that reviews and approves normal changes based on risk and impact.' },
  { term: 'ECAB', def: 'Emergency Change Advisory Board — an expedited, smaller body authorized to approve urgent changes.' },
  { term: 'Standard Change', def: 'A pre-approved, low-risk, repeatable change governed by an existing procedure (e.g., quarterly password rotation).' },
  { term: 'Normal Change', def: 'A change that requires full review: impact analysis, peer review, testing, and CAB approval.' },
  { term: 'Emergency Change', def: 'An urgent change (e.g., zero-day patch, outage restoration) requiring ECAB approval and abbreviated process.' },
  { term: 'Maintenance Window', def: 'A scheduled period during which changes are implemented to minimize business disruption.' },
  { term: 'Rollback Plan', def: 'Predefined steps to revert a system to its prior state if a change fails or causes unexpected impact.' },
  { term: 'Configuration Drift', def: 'The divergence of a system\'s actual configuration from its documented baseline, often from undocumented changes.' },
  { term: 'Configuration Baseline', def: 'The documented standard state of a system used as a reference for comparison and restoration.' },
  { term: 'Peer Review', def: 'Technical evaluation of a proposed change by colleagues or subject-matter experts before approval.' },
  { term: 'Staging Environment', def: 'A non-production environment that mirrors production, used to test changes before deployment.' },
  { term: 'Segregation of Duties', def: 'A control requiring different individuals to request, approve, and implement a change, preventing unilateral action.' },
];

/* ===== Four Pillars (Knowledge Core) ===== */
const FOUR_PILLARS = [
  { id: 'planning', icon: 'clipboard-check', title: 'Planning', color: '#D97706',
    body: 'Every change starts with a Request for Change (RFC): what will change, why, what systems are affected, and what the impact will be. Impact analysis identifies risk, dependencies, business impact, and security implications. A rollback plan is prepared BEFORE implementation — not after something breaks.',
    points: ['RFC submission', 'Impact analysis', 'Risk assessment', 'Rollback plan prepared'] },
  { id: 'testing', icon: 'flask-conical', title: 'Testing', color: '#65A30D',
    body: 'Changes are validated in a staging environment that mirrors production. Standard changes may follow a pre-tested procedure; normal changes require fresh validation. Emergency changes get abbreviated testing — but never zero testing. The goal: catch defects before they reach live systems.',
    points: ['Staging environment', 'Pre-tested SOPs for standard changes', 'Abbreviated testing for emergencies', 'Validation before production'] },
  { id: 'approvals', icon: 'gavel', title: 'Approvals', color: '#B91C1C',
    body: 'No change ships without authorization. Standard changes are pre-approved by an existing SOP. Normal changes go to the Change Advisory Board (CAB) — a cross-functional review body. Emergency changes route to the ECAB for expedited approval. Segregation of duties requires different people to request, approve, and implement.',
    points: ['CAB for normal changes', 'ECAB for emergencies', 'Pre-approved for standard', 'Segregation of duties enforced'] },
  { id: 'documentation', icon: 'file-text', title: 'Documentation', color: '#D2B48C',
    body: 'After implementation, the recorded state of the environment is updated: network diagrams, configuration baselines, asset inventory, SOPs, and the change log. For emergency changes, documentation may be completed AFTER — but it must be completed. Stale documentation is a top cause of delayed incident response.',
    points: ['Network diagrams updated', 'Configuration baselines', 'Asset inventory', 'Change log entry'] },
];

/* ===== Change Types ===== */
const CHANGE_TYPES = [
  { id: 'standard', label: 'Standard', tone: '#65A30D', desc: 'Pre-approved, low-risk, repeatable. Governed by an existing SOP. Example: quarterly service-account password rotation.' },
  { id: 'normal', label: 'Normal', tone: '#D97706', desc: 'Requires full process: impact analysis, peer review, testing, CAB approval. Most changes fall here.' },
  { id: 'emergency', label: 'Emergency', tone: '#B91C1C', desc: 'Urgent (zero-day patch, outage). ECAB approval, abbreviated testing, documentation after. Never exempt from process.' },
];

const PROCESS_STEPS_LIFECYCLE = ['RFC', 'Impact', 'Review', 'Test', 'Approve', 'Schedule', 'Implement', 'Validate', 'Document'];

const REAL_WORLD_EXAMPLES = [
  { org: 'Regional hospital network (composite)', incident: 'EHR outage — 92 minutes', cause: 'Firewall swap with no staging test; no rollback plan. Asymmetric routing blackholed clinical traffic.' },
  { org: 'Online retailer (composite)', incident: '11-hour checkout outage', cause: 'Database migration with no rollback plan. Defective migration locked the orders table; recovery was improvised.' },
  { org: 'Financial services firm (composite)', incident: 'PCI-DSS audit failure', cause: 'Undocumented firewall changes drifted the live config from the approved baseline. Auditors could not verify controls.' },
];

/* ===== RFC Tickets ===== */
const RFC_TICKETS = [
  { id: 'RFC-2026-0142', title: 'Rotate service-account passwords per quarterly policy', requester: 'A. Patel (Identity Team)', system: 'AD service accounts', summary: 'Routine quarterly rotation of 47 service-account passwords using the approved rotation script.', risk: 'low', correctClass: 'standard', correctApproval: 'pre-approved', blastRadius: 'Low — governed by SOP-IDM-04, pre-approved' },
  { id: 'RFC-2026-0143', title: 'Replace failing edge firewall FW-04', requester: 'J. Martinez (Network Eng)', system: 'Perimeter firewall', summary: 'Replace FW-04 (hardware failure predicted by SMART) with a cold spare. Cutover planned for Saturday 02:00.', risk: 'high', correctClass: 'normal', correctApproval: 'cab', blastRadius: 'High — all inbound traffic to DMZ-A transits FW-04', missingField: 'rollback_plan' },
  { id: 'RFC-2026-0144', title: 'Emergency patch for CVE-2026-1187 (RCE in patient portal framework)', requester: 'Sec Ops (K. Liu)', system: 'Patient portal web tier', summary: 'Active exploitation in the wild. Vendor hotfix available. Must deploy within 4 hours.', risk: 'high', correctClass: 'emergency', correctApproval: 'ecab', blastRadius: 'High — patient portal; rapid deployment required' },
  { id: 'RFC-2026-0145', title: 'Add firewall rule permitting vendor telemetry to billing subnet', requester: 'M. Chen (AppOps)', system: 'Internal firewall IFW-02', summary: 'Open TCP 8443 from vendor IP 203.0.113.55 to 10.20.5.0/24 for billing telemetry feed.', risk: 'medium', correctClass: 'normal', correctApproval: 'cab', blastRadius: 'Medium — billing subnet; new inbound flow' },
  { id: 'RFC-2026-0146', title: 'Deploy monthly OS patch bundle to endpoints', requester: 'Endpoint Team', system: 'All managed Windows endpoints', summary: 'Standard monthly patch bundle KB-5032- bundle, pre-tested in pilot ring per SOP-EP-09.', risk: 'low', correctClass: 'standard', correctApproval: 'pre-approved', blastRadius: 'Low — governed by SOP-EP-09, pre-approved' },
  { id: 'RFC-2026-0147', title: 'Disable TLS 1.0 on customer portal — compliance remediation', requester: 'Compliance (R. Singh)', system: 'Customer portal load balancer', summary: 'Disable TLS 1.0 to satisfy PCI-DSS 4.0 requirement. Some legacy clients may break.', risk: 'medium', correctClass: 'normal', correctApproval: 'cab', blastRadius: 'Medium — legacy client compatibility unknown' },
  { id: 'RFC-2026-0148', title: 'Restore database from backup after corruption detected', requester: 'DBA on-call (T. Okafor)', system: 'EHR database cluster', summary: 'EHR DB-2 reports corruption. Active patient safety impact. Restore from 02:00 backup.', risk: 'high', correctClass: 'emergency', correctApproval: 'ecab', blastRadius: 'High — electronic health records; patient safety' },
];

const RFC_FIELDS = [
  { id: 'title', label: 'Change title' }, { id: 'requester', label: 'Requester / owner' },
  { id: 'system', label: 'Affected system(s)' }, { id: 'summary', label: 'Change summary' },
  { id: 'impact_analysis', label: 'Impact analysis' }, { id: 'test_plan', label: 'Test plan / staging results' },
  { id: 'rollback_plan', label: 'Rollback plan' }, { id: 'maintenance_window', label: 'Maintenance window' },
  { id: 'risk', label: 'Risk rating' },
];

/* ===== Process Steps (Sequencer) ===== */
const PROCESS_STEPS = [
  { id: 's1', label: 'Submit Request for Change (RFC)', desc: 'Requester documents the proposed change, justification, and plan.' },
  { id: 's2', label: 'Perform impact analysis', desc: 'Assess risk, affected systems, business impact, security implications, dependencies.' },
  { id: 's3', label: 'Conduct peer review', desc: 'Subject-matter experts review the technical approach and impact assessment.' },
  { id: 's4', label: 'Test in staging environment', desc: 'Validate the change in a non-production environment that mirrors production.' },
  { id: 's5', label: 'Obtain CAB approval', desc: 'Change Advisory Board reviews and approves (or rejects) the change.' },
  { id: 's6', label: 'Schedule and implement in maintenance window', desc: 'Execute the change during the approved maintenance window.' },
  { id: 's7', label: 'Validate change', desc: 'Confirm the change achieved its intended outcome without unintended impact.' },
  { id: 's8', label: 'Update documentation', desc: 'Update network diagrams, baselines, asset inventory, SOPs, and change log.' },
];
const CORRECT_PROCESS_ORDER = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'];

/* ===== Firewall Rules (Drift Inspector) ===== */
const BASELINE_RULES = [
  { id: 'b1', src: '10.0.0.0/24', dst: '192.168.1.10', port: '443', proto: 'TCP', action: 'ALLOW', note: 'Internal → web portal HTTPS' },
  { id: 'b2', src: '10.0.1.0/24', dst: '192.168.1.20', port: '3389', proto: 'TCP', action: 'ALLOW', note: 'Admin subnet → RDP jump host' },
  { id: 'b3', src: '0.0.0.0/0', dst: '192.168.1.0/24', port: '22', proto: 'TCP', action: 'DENY', note: 'SSH blocked from anywhere' },
  { id: 'b4', src: '10.0.0.0/24', dst: '192.168.1.30', port: '53', proto: 'UDP', action: 'ALLOW', note: 'Internal → DNS resolver' },
];
const CURRENT_RULES = [
  { id: 'c1', src: '10.0.0.0/24', dst: '192.168.1.10', port: '443', proto: 'TCP', action: 'ALLOW', note: 'Internal → web portal HTTPS' },
  { id: 'c2', src: '10.0.1.0/24', dst: '192.168.1.20', port: '3389', proto: 'TCP', action: 'ALLOW', note: 'Admin subnet → RDP jump host' },
  { id: 'c3', src: '0.0.0.0/0', dst: '192.168.1.0/24', port: '22', proto: 'TCP', action: 'ALLOW', note: 'SSH now OPEN from anywhere', unauthorized: true },
  { id: 'c4', src: '10.0.0.0/24', dst: '192.168.1.30', port: '53', proto: 'UDP', action: 'ALLOW', note: 'Internal → DNS resolver' },
  { id: 'c5', src: '0.0.0.0/0', dst: '192.168.1.50', port: '8080', proto: 'TCP', action: 'ALLOW', note: 'Unknown service exposed to internet', unauthorized: true },
];
const UNAUTHORIZED_DRIFT_IDS = ['c3', 'c5'];

/* ===== Audit Trail ===== */
const AUDIT_TRAIL = [
  { id: 'e1', ts: '2026-03-14 09:00', actor: 'J. Martinez', action: 'RFC-2026-0143 submitted (replace FW-04)' },
  { id: 'e2', ts: '2026-03-14 09:20', actor: 'J. Martinez', action: 'Impact analysis completed — rated HIGH risk' },
  { id: 'e3', ts: '2026-03-14 10:00', actor: 'S. Chen', action: 'Peer review completed and signed off' },
  { id: 'e4', ts: '2026-03-14 10:30', actor: 'J. Martinez', action: 'CAB approval granted — recorded as approved by J. Martinez', violation: 'self-approval' },
  { id: 'e5', ts: '2026-03-14 11:00', actor: 'J. Martinez', action: 'Implementation started — cutover to spare firewall' },
  { id: 'e6', ts: '2026-03-14 11:08', actor: 'NOC', action: 'Outage alert — DMZ-A unreachable' },
  { id: 'e7', ts: '2026-03-14 11:12', actor: 'J. Martinez', action: 'Attempted rollback — no rollback plan documented', violation: 'missing-rollback' },
  { id: 'e8', ts: '2026-03-14 11:45', actor: 'Network Eng (on-call)', action: 'Manual recovery by re-installing original firewall' },
  { id: 'e9', ts: '2026-03-14 12:30', actor: 'NOC', action: 'Service restored — 92 min outage' },
  { id: 'e10', ts: '2026-03-14 13:00', actor: 'J. Martinez', action: 'Documentation update — network diagram still shows old firewall', violation: 'doc-gap' },
];
const AUDIT_VIOLATIONS = [
  { id: 'self-approval', label: 'Self-approval — requester approved own change (e4)' },
  { id: 'missing-testing', label: 'No testing/staging event before approval' },
  { id: 'missing-rollback', label: 'No rollback plan documented (e7)' },
  { id: 'doc-gap', label: 'Documentation not updated after change (e10)' },
];

/* ===== Rollback Steps ===== */
const ROLLBACK_STEPS = [
  { id: 'r1', label: 'Notify stakeholders and CAB that rollback is being initiated', desc: 'Open incident bridge; alert business owners.' },
  { id: 'r2', label: 'Log into firewall management console with break-glass credentials', desc: 'Use emergency access; logged.' },
  { id: 'r3', label: 'Disable the newly added rule (vendor telemetry rule)', desc: 'Set rule to disabled state; do not delete yet.' },
  { id: 'r4', label: 'Verify traffic flow has returned to baseline', desc: 'Confirm billing subnet no longer receives vendor flow; check downstream services.' },
  { id: 'r5', label: 'Document rollback in the change log', desc: 'Record timestamp, actor, reason, and outcome.' },
  { id: 'r6', label: 'Schedule a post-mortem / root-cause analysis', desc: 'Within 48 hours; produce corrective actions.' },
  { id: 'r7', label: 'Order a replacement firewall', desc: 'NOT a rollback step — this is forward remediation.' },
  { id: 'r8', label: 'Email the vendor to complain about their telemetry feed', desc: 'NOT a rollback step — not a system action.' },
];
const CORRECT_ROLLBACK_ORDER = ['r1', 'r2', 'r3', 'r4', 'r5', 'r6'];

/* ===== Documentation Vault ===== */
const DOC_CHECKLIST = [
  { id: 'd1', label: 'Network diagram', desc: 'Topology drawing showing subnets, devices, and links.' },
  { id: 'd2', label: 'Configuration baseline', desc: 'Documented standard state of affected systems.' },
  { id: 'd3', label: 'Asset inventory', desc: 'Authoritative list of assets and owners.' },
  { id: 'd4', label: 'Standard operating procedure (SOP)', desc: 'Step-by-step procedure documents updated.' },
  { id: 'd5', label: 'Change log entry', desc: 'Audit-trail record of what changed, when, by whom, why.' },
  { id: 'd6', label: 'Disaster recovery plan', desc: 'DR runbook — reviewed for impact (not always required).' },
  { id: 'd7', label: 'Marketing brochure', desc: 'NOT a change-management artifact — distractor.' },
];
const CORRECT_DOCS_FOR_TOPOLOGY = ['d1', 'd2', 'd3', 'd4', 'd5'];

/* ===== Impact Worksheet ===== */
const IMPACT_WORKSHEET_FIELDS = [
  { id: 'i1', label: 'Affected systems', placeholder: 'e.g., IFW-02, billing subnet 10.20.5.0/24, vendor telemetry collector' },
  { id: 'i2', label: 'Dependencies', placeholder: 'e.g., billing app depends on telemetry feed; downstream SIEM collects flow logs' },
  { id: 'i3', label: 'Business impact', placeholder: 'e.g., billing operations could be interrupted; revenue cycle visibility reduced' },
  { id: 'i4', label: 'Security impact', placeholder: 'e.g., new inbound flow expands attack surface; vendor IP must be allow-listed only' },
  { id: 'i5', label: 'Rollback trigger', placeholder: 'e.g., if billing app errors spike >5% within 30 min, disable rule and revert' },
  { id: 'i6', label: 'Validation method', placeholder: 'e.g., confirm TCP 8443 reachable from vendor IP only; verify billing app receives telemetry' },
];
const IMPACT_REQUIRED_KEYWORDS = {
  i1: ['IFW-02', 'billing', '10.20.5', 'vendor'],
  i2: ['billing', 'SIEM', 'telemetry'],
  i3: ['billing', 'revenue', 'interrupt'],
  i4: ['attack surface', 'allow-list', 'inbound', 'vendor'],
  i5: ['disable', 'revert', 'rollback', 'spike', 'error'],
  i6: ['TCP 8443', 'reachable', 'telemetry', 'verify'],
};

/* ===== Failure Matcher (R6: shuffled order to break positional matches) ===== */
const FAILURE_MODES = [
  { id: 'f2', label: 'No testing in staging', desc: 'Change deployed to production without staging validation.' },
  { id: 'f4', label: 'No peer review', desc: 'Single individual designs and approves their own change.' },
  { id: 'f1', label: 'Out-of-band (undocumented) change', desc: 'An admin makes a change without submitting an RFC.' },
  { id: 'f5', label: 'Documentation not updated', desc: 'Network diagrams and baselines left stale after change.' },
  { id: 'f3', label: 'Missing rollback plan', desc: 'No predefined steps to revert if the change fails.' },
];
const FAILURE_CONSEQUENCES = [
  { id: 'fc1', label: 'Configuration drift; security gaps hidden; incident response delayed', desc: 'State of the environment is unknown.' },
  { id: 'fc2', label: 'Outage from an unforeseen defect; no safe way to revert', desc: 'Extended downtime while recovery is improvised.' },
  { id: 'fc3', label: 'Vulnerability introduced into production; exploit window opens', desc: 'Defect that staging would have caught reaches live systems.' },
  { id: 'fc4', label: 'Missed design flaws; single point of failure in judgment', desc: 'No independent technical evaluation.' },
  { id: 'fc5', label: 'Audit failure; compliance violation; unknown authorized state', desc: 'Regulators cannot verify controls.' },
];
const CORRECT_FAILURE_MATCHES = { f1: 'fc1', f2: 'fc3', f3: 'fc2', f4: 'fc4', f5: 'fc5' };

/* ===== Incident Report ===== */
const INCIDENT_REPORT = {
  id: 'INC-2026-0314-001',
  title: 'DMZ-A outage — 92 minutes',
  summary: 'On 2026-03-14 at 11:08, the NOC received an outage alert: DMZ-A was unreachable from the internet. Root cause investigation found that RFC-2026-0143 (replace FW-04) had been implemented at 11:00. The change had been approved, but no testing had been performed in staging — the spare firewall\'s interface configuration differed from production. When the cutover occurred, asymmetric routing blackholed inbound traffic. Recovery took 92 minutes because no rollback plan existed; engineers had to physically re-install the original firewall. The network diagram was not updated afterward, so a follow-up incident the next week was harder to triage.',
};
const INCIDENT_FAILURE_OPTIONS = [
  { id: 'if1', label: 'No RFC submitted' }, { id: 'if2', label: 'No impact analysis' },
  { id: 'if3', label: 'No testing in staging' }, { id: 'if4', label: 'No CAB approval' },
  { id: 'if5', label: 'No rollback plan' }, { id: 'if6', label: 'Documentation not updated' },
  { id: 'if7', label: 'Wrong maintenance window' },
];
const M4_CORRECT = ['if3'];
const H1_CORRECT = ['if3', 'if5', 'if6'];

/* ===== Emergency Decision Options ===== */
const EMERGENCY_DECISION_OPTIONS = [
  { id: 'ec-ecab', label: 'Route to ECAB for expedited approval', correct: true },
  { id: 'ec-abbrev-test', label: 'Run abbreviated (smoke) testing — full staging not required', correct: true },
  { id: 'ec-doc-after', label: 'Complete documentation AFTER implementation, within 24h', correct: true },
  { id: 'ec-no-approval', label: 'Deploy immediately without any approval — it\'s an emergency', correct: false },
  { id: 'ec-no-doc', label: 'Skip documentation entirely — emergencies are exempt', correct: false },
  { id: 'ec-full-staging', label: 'Require full staging test before deployment', correct: false },
];

/* ===== Helper: get objectives for a mode ===== */
function getObjectives(mode) { return mode === 'medium' ? MEDIUM_OBJECTIVES : HARD_OBJECTIVES; }

/* ===================================================================
   OBJECTIVES — MEDIUM (12)
   Each objective has a check(state) function for CHECK RESULTS.
   =================================================================== */
const MEDIUM_OBJECTIVES = [
  { id: 'OBJ-M1', mode: 'medium', pillar: 'P1', pillarLabel: 'Understand', title: 'Identify the four pillars of change management',
    prompt: 'The lesson centers on four process pillars: Planning, Testing, Approvals, Documentation. In the Knowledge Core, read each pillar. Then check the box in the Documentation Vault to confirm.',
    station: 'Knowledge Core',
    hints: ['The four keywords from the lesson detail are: planning, testing, approvals, documentation.', 'Each pillar maps to a stage of the change process — request/test/sign-off/records.'],
    check: function(s) { return s.env.docChecks['__m1_read'] === true; },
    feedback: 'These four pillars are the spine of every change: plan it, test it, get it approved, document it. Skipping any one opens a security or availability gap.',
    coverageAnchor: 'Lesson detail — planning, testing, approvals, documentation' },
  { id: 'OBJ-M2', mode: 'medium', pillar: 'P1', pillarLabel: 'Understand', title: 'Classify change requests as Standard / Normal / Emergency',
    prompt: 'In the Triage Board, classify each RFC ticket using the classification dropdown. Use the ticket summary and risk rating to decide.',
    station: 'Triage Board',
    hints: ['Standard = pre-approved, low-risk, repeatable (e.g., routine password rotation).', 'Emergency = urgent, often security or outage driven (e.g., zero-day patch).', 'Normal = everything else that needs CAB review.'],
    check: function(s) { return RFC_TICKETS.every(function(t) { return s.env.rfcClassifications[t.id] === t.correctClass; }); },
    feedback: 'Correct classification routes each change to the right approval body and process depth. Misrouting a Normal change as Standard bypasses review; misrouting an Emergency as Normal delays a critical fix.',
    coverageAnchor: 'Change types — Standard / Normal / Emergency' },
  { id: 'OBJ-M3', mode: 'medium', pillar: 'P2', pillarLabel: 'Recognize', title: 'Find the missing required field in an RFC',
    prompt: 'Open RFC-2026-0143 in the Triage Board. Inspect the ticket fields and identify which required field is missing. Select the missing field from the dropdown.',
    station: 'Triage Board',
    hints: ['A high-risk infrastructure change MUST have a documented way to revert if it fails.', 'Look for the field that describes what to do if the change breaks something.'],
    check: function(s) { return s.env.rfcMissingFields['RFC-2026-0143'] === 'rollback_plan'; },
    feedback: 'A high-risk change without a rollback plan is an uncontrolled risk — if it fails, recovery is improvised. The RFC must be returned to the requester for the missing field before approval.',
    coverageAnchor: 'Required RFC fields — rollback plan' },
  { id: 'OBJ-M4', mode: 'medium', pillar: 'P2', pillarLabel: 'Recognize', title: 'Identify the skipped step that caused the outage',
    prompt: 'In the Incident Triage panel, read the incident report for INC-2026-0314-001. Identify the single change-management step whose absence most directly caused the outage.',
    station: 'Incident Triage',
    hints: ['The outage was caused by a configuration defect that production would have caught earlier — somewhere else.', 'A separate, second issue made recovery slow — but the OUTAGE itself was caused by skipping a different step.'],
    check: function(s) { return s.env.incidentFailures.length === 1 && s.env.incidentFailures[0] === 'if3'; },
    feedback: 'Skipping staging testing let a configuration defect reach production. Had the cutover been rehearsed in staging, the asymmetric routing issue would have surfaced safely. (The missing rollback plan extended the outage, but didn\'t cause it.)',
    coverageAnchor: 'Common failures — insufficient testing' },
  { id: 'OBJ-M5', mode: 'medium', pillar: 'P1', pillarLabel: 'Understand', title: 'Sequence the change management process',
    prompt: 'In the Process Sequencer, arrange the 8 process steps in the correct order from RFC submission through documentation update.',
    station: 'Process Sequencer',
    hints: ['Everything starts with a request and ends with records.', 'You cannot test what hasn\'t been reviewed; you cannot implement what hasn\'t been approved.', 'Validation comes after implementation; documentation comes last.'],
    check: function(s) { return s.env.processOrder.length === CORRECT_PROCESS_ORDER.length && s.env.processOrder.every(function(id, i) { return id === CORRECT_PROCESS_ORDER[i]; }); },
    feedback: 'The sequence enforces discipline: request → analyze → review → test → approve → implement → validate → document. Reordering any step weakens the control.',
    coverageAnchor: 'Change management process — full lifecycle' },
  { id: 'OBJ-M6', mode: 'medium', pillar: 'P3', pillarLabel: 'Detect', title: 'Detect unauthorized configuration drift',
    prompt: 'In the Drift Inspector, compare the baseline firewall rules to the current rules. Click each rule that represents unauthorized drift to flag it.',
    station: 'Drift Inspector',
    hints: ['Look for rules in "current" that are NOT in "baseline" — especially anything opening a previously blocked port.', 'Watch for rules with source 0.0.0.0/0 — that means "from anywhere", a high-risk exposure.'],
    check: function(s) {
      var set = {}; s.env.identifiedDrifts.forEach(function(id) { set[id] = true; });
      return UNAUTHORIZED_DRIFT_IDS.every(function(id) { return set[id]; }) && !set['c1'] && !set['c2'] && !set['c4'];
    },
    feedback: 'You found both drifts: SSH opened from anywhere (was DENY) and a new 8080 service exposed to the internet. These are exactly the kind of unauthorized changes that change management is designed to prevent.',
    coverageAnchor: 'Configuration drift — detection' },
  { id: 'OBJ-M7', mode: 'medium', pillar: 'P3', pillarLabel: 'Detect', title: 'Identify the change implemented without proper CAB approval',
    prompt: 'In the Audit Trail panel, review the events for RFC-2026-0143. Identify which violation represents a change being approved improperly.',
    station: 'Audit Trail',
    hints: ['Look at who approved the change and compare it to who requested it.', 'A person should not approve their own change — that\'s a segregation-of-duties violation.'],
    check: function(s) { return s.env.identifiedViolations.indexOf('self-approval') !== -1; },
    feedback: 'The requester (J. Martinez) recorded themselves as the CAB approver — a segregation-of-duties violation. The CAB exists precisely so that no single individual can both propose and approve a change.',
    coverageAnchor: 'Audit trail — segregation of duties' },
  { id: 'OBJ-M8', mode: 'medium', pillar: 'P4', pillarLabel: 'Mitigate', title: 'Route each change to the correct approval body',
    prompt: 'In the Triage Board, for each RFC select the correct approval body: Pre-approved, CAB, or ECAB. Match the approval path to the change classification.',
    station: 'Triage Board',
    hints: ['Standard changes are pre-approved by an existing SOP — no new approval needed.', 'Emergency changes go to ECAB for expedited approval.', 'Normal changes go to the regular CAB.'],
    check: function(s) { return RFC_TICKETS.every(function(t) { return s.env.rfcApprovals[t.id] === t.correctApproval; }); },
    feedback: 'Approval routing enforces the right level of oversight: pre-approved for low-risk routine work, CAB for normal changes, ECAB for emergencies. Wrong routing either delays critical fixes or bypasses review.',
    coverageAnchor: 'Approval workflow — CAB / ECAB / pre-approved' },
  { id: 'OBJ-M9', mode: 'medium', pillar: 'P4', pillarLabel: 'Mitigate', title: 'Build a rollback plan in the correct order',
    prompt: 'In the Rollback Builder, add the steps in the correct order to roll back a failed firewall rule change. Exclude the two distractor steps that are NOT rollback actions.',
    station: 'Rollback Builder',
    hints: ['Start with notification, then technical actions, then verification, then records, then post-mortem.', 'Two of the eight steps are not rollback actions at all — exclude them.'],
    check: function(s) { return s.env.rollbackOrder.length === CORRECT_ROLLBACK_ORDER.length && s.env.rollbackOrder.every(function(id, i) { return id === CORRECT_ROLLBACK_ORDER[i]; }); },
    feedback: 'A rollback plan must be ready BEFORE implementation. The sequence — notify → disable → verify → document → post-mortem — ensures a controlled, evidence-rich revert rather than a panicked one.',
    coverageAnchor: 'Rollback plan — construction and sequencing' },
  { id: 'OBJ-M10', mode: 'medium', pillar: 'P2', pillarLabel: 'Recognize', title: 'Identify which documents to update after a network topology change',
    prompt: 'In the Documentation Vault, check off every artifact that must be updated after a new subnet is added to the network. Leave distractors unchecked.',
    station: 'Documentation Vault',
    hints: ['Think about what describes the network (topology, state, assets) and what records the change itself.', 'Marketing brochures are not change-management artifacts.', 'DR plans may be reviewed but are not always updated for every topology change.'],
    check: function(s) {
      var correct = {}; CORRECT_DOCS_FOR_TOPOLOGY.forEach(function(id) { correct[id] = true; });
      var checked = [];
      Object.keys(s.env.docChecks).forEach(function(k) { if (s.env.docChecks[k] && k.indexOf('__') !== 0) checked.push(k); });
      if (checked.length !== CORRECT_DOCS_FOR_TOPOLOGY.length) return false;
      return checked.every(function(id) { return correct[id]; });
    },
    feedback: 'A topology change ripples through the network diagram, configuration baseline, asset inventory, SOPs, and the change log. Stale documentation is a top cause of delayed incident response.',
    coverageAnchor: 'Documentation requirements — network change' },
  { id: 'OBJ-M11', mode: 'medium', pillar: 'P3', pillarLabel: 'Detect', title: 'Identify the segregation-of-duties violation',
    prompt: 'In the Audit Trail panel, the same person appears as requester, peer reviewer, approver, and implementer. Identify the specific violation type that this represents.',
    station: 'Audit Trail',
    hints: ['Segregation of duties requires different individuals for different steps.', 'The most serious violation is self-approval — one person both requesting and approving their own change.'],
    check: function(s) { return s.env.identifiedViolations.indexOf('self-approval') !== -1; },
    feedback: 'Segregation of duties is the control that prevents a single individual from requesting, approving, and implementing a change. When one person holds all those roles, the independent review that the CAB exists to provide is gone.',
    coverageAnchor: 'Segregation of duties — detection' },
  { id: 'OBJ-M12', mode: 'medium', pillar: 'P4', pillarLabel: 'Mitigate', title: 'Match each failure mode to its security consequence',
    prompt: 'In the Failure Matcher, match each failure mode (left) to its corresponding security consequence (right). Each consequence is used exactly once.',
    station: 'Failure Matcher',
    hints: ['Undocumented changes leave the environment in an unknown state — that\'s drift.', 'No testing lets defects reach production — exploit window opens.', 'No rollback means a failed change becomes an extended outage.'],
    check: function(s) { return FAILURE_MODES.every(function(f) { return s.env.failureMatches[f.id] === CORRECT_FAILURE_MATCHES[f.id]; }); },
    feedback: 'Each failure has a characteristic consequence. Recognizing the consequence in an incident points you back to the failed control — the basis of root-cause analysis.',
    coverageAnchor: 'Common failures — security impact mapping' },
];

/* ===================================================================
   OBJECTIVES — HARD (9)
   =================================================================== */
const HARD_OBJECTIVES = [
  { id: 'OBJ-H1', mode: 'hard', pillar: 'P2', pillarLabel: 'Recognize', title: 'Triage the outage: identify all three process failures',
    prompt: 'A 92-minute DMZ-A outage followed RFC-2026-0143. Read the incident report and identify ALL THREE change-management failures that contributed. Select exactly three options.',
    station: 'Incident Triage',
    hints: ['One failure CAUSED the outage (a step whose absence let a defect through).', 'One failure EXTENDED the outage (recovery was improvised).', 'One failure COMPLICATED the next incident (state of the environment was not updated).'],
    check: function(s) {
      if (s.env.incidentFailures.length !== 3) return false;
      var set = {}; s.env.incidentFailures.forEach(function(id) { set[id] = true; });
      return H1_CORRECT.every(function(id) { return set[id]; });
    },
    feedback: 'Three failures: (1) no staging testing — let the routing defect reach production; (2) no rollback plan — turned a 5-minute revert into a 92-minute outage; (3) documentation not updated — left the network diagram stale, complicating later incidents. Each failure maps to a different lesson pillar.',
    coverageAnchor: 'Common failures — multi-step root cause' },
  { id: 'OBJ-H2', mode: 'hard', pillar: 'P2', pillarLabel: 'Recognize', title: 'Classify, route, and find the misrouted ticket',
    prompt: 'In the Triage Board, classify all 7 RFCs AND assign each its correct approval body. One ticket in the queue is currently misrouted — your correct routing will reveal it.',
    station: 'Triage Board',
    hints: ['Misrouting usually means a Standard change being sent to CAB (wasted time) or an Emergency change being sent to full CAB (delayed fix).', 'Pre-approved = Standard; CAB = Normal; ECAB = Emergency. Apply this strictly.'],
    check: function(s) {
      var classOk = RFC_TICKETS.every(function(t) { return s.env.rfcClassifications[t.id] === t.correctClass; });
      var apprOk = RFC_TICKETS.every(function(t) { return s.env.rfcApprovals[t.id] === t.correctApproval; });
      return classOk && apprOk;
    },
    feedback: 'Misrouting is a real-world failure: a Normal change treated as Standard bypasses oversight; an Emergency change sent to full CAB can delay a critical fix by hours. Correct classification is the gate that prevents both.',
    coverageAnchor: 'Change types + approval routing — combined' },
  { id: 'OBJ-H3', mode: 'hard', pillar: 'P3', pillarLabel: 'Detect', title: 'Investigate drift: identify, time, and name the missing control',
    prompt: 'In the Drift Inspector, identify both unauthorized rules. Then answer: which control would have caught these changes? Type your answer (one phrase, e.g., "configuration drift monitoring" or "baseline comparison").',
    station: 'Drift Inspector',
    hints: ['Two rules are unauthorized — one opens a previously-blocked port; one exposes a new service.', 'The control is a periodic comparison of current state against a documented standard.'],
    check: function(s) {
      var set = {}; s.env.identifiedDrifts.forEach(function(id) { set[id] = true; });
      var driftsOk = UNAUTHORIZED_DRIFT_IDS.every(function(id) { return set[id]; }) && !set['c1'] && !set['c2'] && !set['c4'];
      var ctrl = (s.env.impactAnswers['h3_control'] || '').toLowerCase();
      var ctrlOk = ctrl.indexOf('drift') !== -1 || ctrl.indexOf('baseline') !== -1 || ctrl.indexOf('comparison') !== -1 || ctrl.indexOf('integrity') !== -1 || ctrl.indexOf('monitoring') !== -1;
      return driftsOk && ctrlOk;
    },
    feedback: 'Configuration drift monitoring — periodic comparison of the live config against the documented baseline — is the control that catches unauthorized changes even when the change process itself fails. It is the safety net beneath change management.',
    coverageAnchor: 'Drift detection + control selection' },
  { id: 'OBJ-H4', mode: 'hard', pillar: 'P4', pillarLabel: 'Mitigate', title: 'Design a complete change workflow for a critical security patch',
    prompt: 'In the Impact Worksheet + Rollback Builder, design the workflow for CVE-2026-1187 (RCE, active exploitation). Complete all 6 impact fields AND build the rollback plan. The patch must deploy within 4 hours.',
    station: 'Impact Worksheet + Rollback Builder',
    hints: ['A 4-hour deployment window with active exploitation means Emergency change / ECAB.', 'Abbreviated testing is acceptable for emergency changes — but a rollback plan is still mandatory.', 'Documentation can be completed AFTER implementation for emergency changes — but must be completed.'],
    check: function(s) {
      var rollbackOk = s.env.rollbackOrder.length === CORRECT_ROLLBACK_ORDER.length && s.env.rollbackOrder.every(function(id, i) { return id === CORRECT_ROLLBACK_ORDER[i]; });
      var fields = ['i1', 'i2', 'i3', 'i4', 'i5', 'i6'];
      var fieldsOk = fields.every(function(f) { return (s.env.impactAnswers[f] || '').trim().length >= 15; });
      return rollbackOk && fieldsOk;
    },
    feedback: 'For an emergency security patch: classify as Emergency, route to ECAB, run abbreviated testing, deploy in the emergency window, validate, and document after. Rollback planning is never optional — even emergencies need a way back.',
    coverageAnchor: 'Emergency change workflow — full design' },
  { id: 'OBJ-H5', mode: 'hard', pillar: 'P3', pillarLabel: 'Detect', title: 'Audit the CAB record: find all four violations',
    prompt: 'In the Audit Trail, identify ALL FOUR violations in the RFC-2026-0143 record: segregation-of-duties, missing rollback, implementation before proper approval, and missing documentation update. Select exactly four.',
    station: 'Audit Trail',
    hints: ['Self-approval = segregation-of-duties violation.', 'The "attempted rollback" event reveals a missing artifact.', 'The implementation event happened after a self-approval, not a real CAB — so the change was implemented without proper approval.', 'The final event shows the network diagram was never updated.'],
    check: function(s) {
      var required = ['self-approval', 'missing-rollback', 'missing-testing', 'doc-gap'];
      var set = {}; s.env.identifiedViolations.forEach(function(id) { set[id] = true; });
      var count = s.env.identifiedViolations.length;
      return required.every(function(v) { return set[v]; }) && count === 4;
    },
    feedback: 'Four violations: self-approval (segregation of duties), missing rollback plan, implementation without proper CAB approval (and missing testing), and the documentation gap. A single change generated all four — a textbook case of process collapse.',
    coverageAnchor: 'Audit trail — multi-violation detection' },
  { id: 'OBJ-H6', mode: 'hard', pillar: 'P3', pillarLabel: 'Detect', title: 'Reconstruct the audit trail and pinpoint the break',
    prompt: 'In the Audit Trail, add the events in the correct chronological order. Then identify the exact event ID where the change management process broke down.',
    station: 'Audit Trail',
    hints: ['Events are timestamped — order them by timestamp.', 'The break is the first event that violates the process — where approval was granted improperly.'],
    check: function(s) {
      var correctOrder = ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'e9', 'e10'];
      var orderOk = s.env.reconstructedOrder.length === correctOrder.length && s.env.reconstructedOrder.every(function(id, i) { return id === correctOrder[i]; });
      var breakAnswer = (s.env.impactAnswers['h6_break'] || '').trim().toLowerCase();
      return orderOk && breakAnswer === 'e4';
    },
    feedback: 'The events are already in timestamp order — the real task was spotting where the PROCESS broke. Event e4 (self-approval) is the break: it is the first event that should not have happened in a compliant process. From that point forward, every subsequent step was tainted.',
    coverageAnchor: 'Audit trail — sequence reconstruction + break-point identification' },
  { id: 'OBJ-H7', mode: 'hard', pillar: 'P4', pillarLabel: 'Mitigate', title: 'Choose the correct emergency change process — and reject two shortcuts',
    prompt: 'A zero-day RCE is being actively exploited. The patch must deploy within 4 hours. In the Decision Panel, choose the THREE correct steps AND identify the TWO forbidden shortcuts. (5 selections total: 3 correct + 2 forbidden.)',
    station: 'Decision Panel',
    hints: ['ECAB can approve within minutes — use it.', 'Abbreviated testing is acceptable for emergency changes; full staging is not required.', 'Documentation can be completed AFTER, but MUST be completed.', 'Forbidden: deploying without ANY approval, and skipping documentation permanently.'],
    check: function(s) {
      var required = ['ec-ecab', 'ec-abbrev-test', 'ec-doc-after'];
      var forbidden = ['ec-no-approval', 'ec-no-doc'];
      var set = {}; s.env.incidentFailures.forEach(function(id) { set[id] = true; });
      var reqOk = required.every(function(r) { return set[r]; });
      var forbOk = forbidden.every(function(f) { return set[f]; });
      return reqOk && forbOk && s.env.incidentFailures.length === 5;
    },
    feedback: 'Emergency changes get abbreviated process — but never zero process. ECAB approval, abbreviated testing, and documentation after the fact are all required. "No approval" and "no documentation ever" are policy violations that turn an emergency into an uncontrolled change.',
    coverageAnchor: 'Emergency change — correct process vs forbidden shortcuts' },
  { id: 'OBJ-H8', mode: 'hard', pillar: 'P2', pillarLabel: 'Recognize', title: 'Complete a full impact analysis for a high-blast-radius firewall change',
    prompt: 'In the Impact Worksheet, complete all 6 fields for RFC-2026-0145 (vendor telemetry rule to billing subnet). Each field must contain the relevant concept keywords to pass.',
    station: 'Impact Worksheet',
    hints: ['Affected systems: which firewall and which subnet? Who is the new flow from?', 'Dependencies: what depends on the billing subnet? What logs the flow?', 'Security impact: this is a new INBOUND flow — what does that mean for attack surface?', 'Rollback trigger: what observable metric would tell you to revert?'],
    check: function(s) {
      return Object.keys(IMPACT_REQUIRED_KEYWORDS).every(function(field) {
        var ans = (s.env.impactAnswers[field] || '').toLowerCase();
        var keywords = IMPACT_REQUIRED_KEYWORDS[field];
        var hits = keywords.filter(function(k) { return ans.indexOf(k.toLowerCase()) !== -1; }).length;
        return hits >= 2;
      });
    },
    feedback: 'A complete impact analysis forces you to think about blast radius, dependencies, business and security impact, rollback triggers, and validation — before the change touches production. For a high-blast-radius change, skipping any field is gambling with availability.',
    coverageAnchor: 'Impact analysis — full worksheet' },
  { id: 'OBJ-H9', mode: 'hard', pillar: 'P1', pillarLabel: 'Understand', title: 'Justify change management — cite 4 specific risks it mitigates',
    prompt: 'In the Justification Composer, write a 3-5 sentence justification for why Meridian Health Networks should adopt formal change management. Your answer must cite AT LEAST FOUR specific security risks that change management mitigates.',
    station: 'Justification Composer',
    hints: ['Think about what goes wrong WITHOUT change management: drift, outages, audit failures, hidden vulnerabilities, slow incident response.', 'Use lesson vocabulary: planning, testing, approvals, documentation, rollback, segregation of duties.'],
    check: function(s) {
      var t = (s.env.justificationText || '').toLowerCase();
      var concepts = ['drift', 'outage', 'compliance', 'audit', 'unauthorized', 'vulnerability', 'rollback', 'segregation', 'documentation', 'testing', 'approval', 'incident response'];
      var hits = concepts.filter(function(c) { return t.indexOf(c) !== -1; }).length;
      var words = t.split(/\s+/).filter(Boolean).length;
      return hits >= 4 && words >= 40;
    },
    feedback: 'A strong justification ties change management to specific, named risks: configuration drift, unauthorized changes, extended outages from missing rollback, compliance failures, and delayed incident response. Naming the risks makes the case far stronger than "it is best practice".',
    coverageAnchor: 'Why change management matters — security rationale' },
];

/* ===================================================================
   QUIZ — MEDIUM (7 questions)
   R4: Correct-answer positions rotated: A, B, D, C, A, D, B
   R5: Option lengths equalized (correct answer never longest)
   =================================================================== */
const MEDIUM_QUIZ = [
  { id: 'MQ1', mode: 'medium', type: 'mc', scenario: 'Concept check', question: 'Which type of change requires full CAB approval before implementation?',
    options: ['Normal change', 'Standard change', 'Emergency change', 'Pre-approved change'], correct: [0],
    explanation: 'Normal changes require the full process: impact analysis, peer review, testing, and CAB approval. Standard changes are pre-approved by an SOP; emergency changes go to the ECAB instead.' },
  { id: 'MQ2', mode: 'medium', type: 'mc', scenario: 'Concept check', question: 'What is "configuration drift"?',
    options: ['A rollback that fails to restore service', 'Divergence of live config from the baseline', 'A firmware update on network devices', 'A staging-environment testing method'], correct: [1],
    explanation: 'Configuration drift is the slow divergence of a system\'s actual configuration from its documented baseline, usually from undocumented or out-of-band changes. It hides security gaps and complicates incident response.' },
  { id: 'MQ3', mode: 'medium', type: 'mc', scenario: 'Concept check', question: 'Who typically approves an EMERGENCY change?',
    options: ['The full CAB at its weekly meeting', 'The requester\'s direct manager only', 'No one — emergencies are exempt', 'ECAB, an expedited subset of the CAB'], correct: [3],
    explanation: 'The Emergency Change Advisory Board (ECAB) is a smaller, on-call subset of the CAB authorized to approve urgent changes within minutes. Emergencies are never exempt from approval.' },
  { id: 'MQ4', mode: 'medium', type: 'mc', scenario: 'Concept check', question: 'What MUST be prepared BEFORE a change is implemented?',
    options: ['A press release for stakeholders', 'A new vendor contract', 'A rollback plan for reversion', 'A user training video'], correct: [2],
    explanation: 'A rollback plan documents the steps to revert the change if it fails. It must be prepared and approved BEFORE implementation so recovery is controlled, not improvised.' },
  { id: 'MQ5', mode: 'medium', type: 'mc', scenario: 'A new subnet was added to the network overnight.', question: 'Which document MUST be updated as part of change management?',
    options: ['The network diagram', 'The marketing brochure', 'The employee handbook', 'The brand guidelines'], correct: [0],
    explanation: 'The network diagram must be updated whenever topology changes. Stale diagrams are a leading cause of delayed incident response — responders cannot trust the environment\'s recorded state.' },
  { id: 'MQ6', mode: 'medium', type: 'mc', scenario: 'Concept check', question: 'What is the purpose of a maintenance window?',
    options: ['To give engineers a lunch break', 'To prevent any changes from being made', 'To test changes directly on users', 'To schedule changes during low-impact hours'], correct: [3],
    explanation: 'A maintenance window is a scheduled, low-impact period (often nights or weekends) during which changes are implemented. It minimizes business disruption if something goes wrong.' },
  { id: 'MQ7', mode: 'medium', type: 'mc', scenario: 'An admin both submits a change request AND approves it themselves.', question: 'What control is violated?',
    options: ['Maintenance window', 'Segregation of duties', 'Configuration baseline', 'Asset inventory'], correct: [1],
    explanation: 'Segregation of duties requires different individuals to request, approve, and implement a change. Self-approval defeats the independent review that the CAB exists to provide.' },
];

/* ===================================================================
   QUIZ — HARD (8 scenario-based questions)
   R4: Correct-answer positions rotated: D, C, A, B, D, A, C, B
   R5: Option lengths equalized (correct answer never longest)
   =================================================================== */
const HARD_QUIZ = [
  { id: 'HQ1', mode: 'hard', type: 'mc', scenario: 'A zero-day RCE in your web framework is being actively exploited. The vendor releases a hotfix.', question: 'What is the correct change management process?',
    options: ['Submit a Normal change; wait for the weekly CAB', 'Deploy immediately; submit paperwork if asked', 'Disable the framework; do not patch until next month', 'Classify as Emergency; route to ECAB; deploy; document after'], correct: [3],
    explanation: 'Emergency changes get abbreviated process, not zero process. ECAB approval can happen in minutes; abbreviated (smoke) testing is acceptable; documentation is completed after but must be completed.' },
  { id: 'HQ2', mode: 'hard', type: 'mc', scenario: 'An administrator made an "urgent fix" to a firewall at 2am without submitting an RFC. The fix caused a 4-hour outage.', question: 'What was the primary control failure, and what would have prevented it?',
    options: ['The fix was wrong; better training was needed', 'The outage was congestion; more bandwidth was needed', 'No RFC was submitted; the process was bypassed', 'The admin should have waited until morning'], correct: [2],
    explanation: 'The control failure was the absence of the change management process itself. A mandatory RFC requirement, audit logging on the firewall, and configuration drift monitoring would each have caught the unauthorized change — defense in depth.' },
  { id: 'HQ3', mode: 'hard', type: 'mc', scenario: 'A change caused an outage. Engineers could not revert; they spent 3 hours improvising a fix.', question: 'What was missing from the change management process?',
    options: ['A rollback plan', 'A maintenance window', 'A network diagram', 'A peer review'], correct: [0],
    explanation: 'A rollback plan — predefined steps to revert the change — must be prepared and approved BEFORE implementation. Its absence turned a 5-minute revert into a 3-hour improvised recovery.' },
  { id: 'HQ4', mode: 'hard', type: 'mc', scenario: 'You audit 6 months of changes. Three tickets show the same person as requester, approver, AND implementer.', question: 'What violation does this represent, and why is it dangerous?',
    options: ['No violation; small teams wear multiple hats', 'Segregation of duties; no independent check exists', 'Maintenance window violation; changes were off-hours', 'Configuration drift; systems are in unknown state'], correct: [1],
    explanation: 'Segregation of duties exists so that no single individual can both propose and approve (and implement) a change. Concentrating all three roles in one person removes the independent review that catches errors and deters malice.' },
  { id: 'HQ5', mode: 'hard', type: 'mc', scenario: 'A firewall change introduced an "ALLOW 0.0.0.0/0 → :22" rule. It was discovered 3 weeks later during an audit.', question: 'What detection would have caught this change immediately?',
    options: ['Antivirus scanning on all endpoints', 'User security awareness training', 'Faster internet bandwidth upgrades', 'Drift monitoring against the baseline'], correct: [3],
    explanation: 'Configuration drift monitoring — periodic comparison of the live firewall config against the documented baseline — would have flagged the new open-SSH rule within the next monitoring cycle (typically hours, not weeks). It is the safety net beneath the change process.' },
  { id: 'HQ6', mode: 'hard', type: 'mc', scenario: 'A routine password rotation (governed by an SOP) was submitted as a Normal change and waited 5 days for CAB review.', question: 'What went wrong?',
    options: ['Misclassification; Standard treated as Normal', 'Nothing; all changes should go through CAB', 'The CAB should meet more frequently', 'The rotation should not have occurred'], correct: [0],
    explanation: 'Standard changes (pre-approved, low-risk, repeatable, governed by an SOP) do not need CAB review. Misclassifying a Standard change as Normal wastes lead time and distracts the CAB from higher-risk work. Correct classification is the gate that prevents this.' },
  { id: 'HQ7', mode: 'hard', type: 'mc', scenario: 'A vendor needs emergency network access to a billing system for 2 hours to resolve a critical incident.', question: 'What is the BEST change management approach?',
    options: ['Open the firewall permanently; revoke access later', 'Deny the request; vendors never get emergency access', 'Emergency change via ECAB; time-bound expiring rule', 'Issue permanent VPN credentials to the vendor'], correct: [2],
    explanation: 'Emergency vendor access can be granted safely: route through ECAB, create a TIME-BOUND rule that auto-expires after 2 hours, and complete documentation after. This balances the business need with the security principle of least privilege and time-limited access.' },
  { id: 'HQ8', mode: 'hard', type: 'mc', scenario: 'After a network change, the network diagram was not updated. Three months later, an incident response is delayed because responders trust the stale diagram.', question: 'Which step of the change management process failed?',
    options: ['Impact analysis', 'Documentation update', 'Staging testing', 'CAB approval'], correct: [1],
    explanation: 'The final step — updating documentation — was skipped. The cost was paid three months later in delayed incident response. Documentation is not bureaucratic overhead; it is the recorded state of the environment that future responders depend on.' },
];

/* ===== Quiz topic mapping for R8 focus areas ===== */
const QUIZ_TOPICS = {
  MQ1: 'change types and CAB approval', MQ2: 'configuration drift',
  MQ3: 'ECAB and emergency approval', MQ4: 'rollback plan requirement',
  MQ5: 'documentation after network changes', MQ6: 'maintenance window purpose',
  MQ7: 'segregation of duties',
  HQ1: 'emergency change process', HQ2: 'unauthorized / out-of-band changes',
  HQ3: 'rollback plan requirement', HQ4: 'segregation of duties',
  HQ5: 'drift detection controls', HQ6: 'change misclassification',
  HQ7: 'emergency vendor access', HQ8: 'documentation step',
};

/* ===== Debrief Content ===== */
const DEBRIEF = {
  detectionOpportunities: [
    'Configuration drift monitoring — periodic comparison of live configs against baselines catches unauthorized changes.',
    'Audit log review — every change should leave a timestamped, attributable trail.',
    'Network scanning — open ports/services that should not be exposed surface as anomalies.',
    'Change log vs. actual state reconciliation — regularly compare what was approved to what exists.',
  ],
  mitigationRecommendations: [
    { id: 'CM-1', label: 'Mandatory RFC for all changes', desc: 'No change is implemented without an approved RFC — including emergencies.' },
    { id: 'CM-2', label: 'CAB / ECAB governance', desc: 'Cross-functional review body with expedited emergency path.' },
    { id: 'CM-3', label: 'Staging environment mandate', desc: 'All non-emergency changes validated in a mirror environment first.' },
    { id: 'CM-4', label: 'Rollback plan requirement', desc: 'No change approved without a documented, tested rollback procedure.' },
    { id: 'CM-5', label: 'Segregation of duties', desc: 'Different individuals request, approve, and implement.' },
    { id: 'CM-6', label: 'Configuration baseline + drift monitoring', desc: 'Documented standard state with automated drift detection.' },
    { id: 'CM-7', label: 'Maintenance window enforcement', desc: 'Changes implemented only during scheduled, low-impact windows.' },
    { id: 'CM-8', label: 'Documentation update gate', desc: 'Change not "closed" until diagrams, baselines, inventory, SOPs, and log are updated.' },
  ],
  blueTeamTakeaways: [
    'Treat every change as a potential security event — review the change log FIRST when investigating incidents.',
    'Build drift monitoring; it is the safety net beneath the change process.',
    'Demand rollback plans; they are the difference between a 5-minute revert and a 90-minute outage.',
    'Verify segregation of duties in audit sampling — it is the most commonly violated control.',
  ],
  redTeamTakeaways: [
    'Out-of-band changes are an attacker\'s friend — an unauthorized rule looks like "just another admin fix" if drift monitoring is weak.',
    'Stale documentation is cover: if the diagram does not show your backdoor, responders will not find it quickly.',
    'Self-approval is the softest target — a compromised admin account can both request and approve a malicious change.',
    'Emergency changes bypass full review — a forged or rushed ECAB can be an entry point.',
  ],
  officialReferences: [
    { label: 'CompTIA Security+ SY0-801 Exam Objectives', url: 'https://www.comptia.org/certifications/security' },
    { label: 'NIST SP 800-128 — Configuration Management', url: 'https://csrc.nist.gov/publications/detail/sp/800-128/final' },
    { label: 'MITRE ATT&CK Mitigation M1047 — Audit', url: 'https://attack.mitre.org/mitigations/M1047/' },
    { label: 'MITRE ATT&CK Mitigation M1042 — Disable or Remove Device or Program', url: 'https://attack.mitre.org/mitigations/M1042/' },
  ],
};

/* ===== Pillar metadata ===== */
const PILLAR_META = {
  P1: { label: 'Understand', color: '#A3E635', bg: 'rgba(101,163,13,0.15)', border: 'rgba(101,163,13,0.4)' },
  P2: { label: 'Recognize', color: '#FBBF24', bg: 'rgba(217,119,6,0.15)', border: 'rgba(217,119,6,0.4)' },
  P3: { label: 'Detect', color: '#FCA5A5', bg: 'rgba(185,28,28,0.15)', border: 'rgba(185,28,28,0.4)' },
  P4: { label: 'Mitigate', color: '#D2B48C', bg: 'rgba(124,92,46,0.15)', border: 'rgba(124,92,46,0.4)' },
};
