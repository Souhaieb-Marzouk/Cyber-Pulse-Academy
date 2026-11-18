// ─── The Registry — js/data.js ────────────────────────────────────────────
// All lab content: document registry, glossary, docket tickets, audit
// findings, quiz banks. DATA ONLY — no logic lives here.
// Carried over 1:1 from the framework lab (src/data/govlab/*).
//
// ALL DATA IS SYNTHETIC TRAINING DATA for the fictional org "Meridian
// Freight & Logistics (MFL)". No real organizations, laws quoted verbatim,
// or real PII. CompTIA SY0-801 objective 5.1: "Apply policies, standards,
// procedures, and security guidance."

window.LAB_DATA = {
  // ── Document class metadata (the "authority spectrum") ─────────────────
  DOC_TYPE_INFO: {
    policy: {
      label: 'Policy',
      says: 'WHAT & WHY',
      authority: 'Mandatory',
      verbs: '"shall", "must"',
      blurb:
        'High-level statement of management intent and scope. Sets direction, approved by senior management. Changes require management authorization.',
    },
    standard: {
      label: 'Standard',
      says: 'WHAT EXACTLY',
      authority: 'Mandatory',
      verbs: '"must be ≥", "SHA-256"',
      blurb:
        'Specific, measurable, technology-level requirements that operationalize a policy. Deviating requires a formal exception.',
    },
    procedure: {
      label: 'Procedure',
      says: 'HOW, step by step',
      authority: 'Mandatory',
      verbs: 'numbered steps',
      blurb:
        'Concrete, ordered, task-level instructions (change management, onboarding/offboarding, playbooks). Follow the steps as written.',
    },
    guideline: {
      label: 'Guideline',
      says: 'RECOMMENDED',
      authority: 'Advisory',
      verbs: '"should", "consider"',
      blurb:
        'Best-practice security guidance when no hard rule exists. Helpful defaults, not enforceable requirements.',
    },
  },

  // ── The 16 registry documents ───────────────────────────────────────────
  REGISTRY: [
    {
      code: 'GOV-POL-01',
      title: 'Acceptable Use Policy',
      type: 'policy',
      owner: 'Chief Information Security Officer',
      approvedBy: 'Executive Governance Board',
      lastReview: '2025-09-15',
      reviewCycle: 'Annual',
      excerpt: [
        'MFL information systems and media are provided for authorized business use only.',
        'Personal storage media shall not be connected to MFL systems.',
        'Credentials must never be shared between employees; each account is personally accountable.',
        'Violations shall be reported to the CISO and handled under the HR disciplinary framework.',
      ],
    },
    {
      code: 'GOV-POL-02',
      title: 'Information Security Policy',
      type: 'policy',
      owner: 'Chief Information Security Officer',
      approvedBy: 'Executive Governance Board',
      lastReview: '2025-10-02',
      reviewCycle: 'Annual',
      excerpt: [
        'INTENT: MFL shall protect the confidentiality, integrity and availability of shipment, customer and personnel data in all its operations.',
        'Data shall be classified and handled according to its sensitivity; data owners approve access.',
        'Information shall be encrypted at rest and in transit per the Encryption Standard.',
        'EXCEPTIONS: Any deviation from a security requirement must be approved by the CISO, recorded in the exception register, and accepted in writing with an expiry date.',
      ],
    },
    {
      code: 'GOV-POL-03',
      title: 'Incident Response Policy',
      type: 'policy',
      owner: 'Chief Information Security Officer',
      approvedBy: 'Executive Governance Board',
      lastReview: '2025-08-19',
      reviewCycle: 'Annual',
      excerpt: [
        'All suspected security incidents shall be reported to the CISO within 1 hour of detection.',
        'Incidents affecting cargo or dispatch systems shall be escalated to the Security Governance Committee.',
        'Personal-data breaches shall be reported to regulators within 72 hours of confirmation.',
        'Response actions shall follow the approved Incident Response Playbook.',
      ],
    },
    {
      code: 'GOV-POL-04',
      title: 'Business Continuity Policy',
      type: 'policy',
      owner: 'Director of Operations',
      approvedBy: 'Executive Governance Board',
      lastReview: '2025-07-11',
      reviewCycle: 'Annual',
      excerpt: [
        'Management shall maintain continuity plans enabling critical freight operations to resume within 4 hours of a disruption.',
        'Continuity plans shall be exercised at least annually with results reported to the Executive Governance Board.',
      ],
    },
    {
      code: 'GOV-POL-05',
      title: 'Disaster Recovery Policy',
      type: 'policy',
      owner: 'Head of IT Infrastructure',
      approvedBy: 'Executive Governance Board',
      lastReview: '2025-06-30',
      reviewCycle: 'Annual',
      excerpt: [
        'IT shall maintain recoverable backups and a documented recovery capability for all Tier-1 systems.',
        'Recovery time objectives and priorities shall be defined and approved by data owners.',
        'Recovery capability shall be validated by scheduled recovery tests.',
      ],
    },
    {
      code: 'GOV-POL-06',
      title: 'Change Management Policy',
      type: 'policy',
      owner: 'Head of IT Infrastructure',
      approvedBy: 'Executive Governance Board',
      lastReview: '2025-09-03',
      reviewCycle: 'Annual',
      excerpt: [
        'All changes to production systems shall be reviewed and approved before implementation.',
        'Emergency changes are permitted only under the Change Management Procedure and must receive post-implementation review by the Change Advisory Board.',
      ],
    },
    {
      code: 'GOV-POL-07',
      title: 'Secure Software Development Lifecycle Policy',
      type: 'policy',
      owner: 'Head of Software Engineering',
      approvedBy: 'Executive Governance Board',
      lastReview: '2025-05-22',
      reviewCycle: 'Annual',
      excerpt: [
        'Security requirements — threat modeling, peer code review and security testing — shall be satisfied in each development phase before release.',
        'No release shall proceed with an unmitigated high-severity finding.',
      ],
    },
    {
      code: 'GOV-STD-01',
      title: 'Password Standard',
      type: 'standard',
      owner: 'Identity & Access Management Team',
      approvedBy: 'CISO',
      lastReview: '2019-03-10',
      reviewCycle: 'Annual',
      excerpt: [
        'User account passphrases must be at least 14 characters; service account passphrases at least 20 characters.',
        'Passphrases must be changed immediately upon suspicion of compromise.',
        'Screened breach lists must be consulted before accepting new passphrases.',
      ],
    },
    {
      code: 'GOV-STD-02',
      title: 'Access Control Standard',
      type: 'standard',
      owner: 'Identity & Access Management Team',
      approvedBy: 'CISO',
      lastReview: '2025-08-01',
      reviewCycle: 'Annual',
      excerpt: [
        'Multi-factor authentication is required for all privileged and all remote access. No exemptions are granted for executives or VIPs.',
        'Access is granted on least-privilege basis and must be revoked within 24 hours of a role change or departure.',
        'Data owners approve and recertify access to their systems every 90 days.',
      ],
    },
    {
      code: 'GOV-STD-03',
      title: 'Encryption Standard',
      type: 'standard',
      owner: 'Security Architecture Team',
      approvedBy: 'CISO',
      lastReview: '2025-10-14',
      reviewCycle: 'Annual',
      excerpt: [
        'All laptops and removable media must use full-disk encryption with AES-256.',
        'Backup media must be encrypted with AES-256; unencrypted backups must never leave the vault.',
        'Keys must be generated, stored and rotated in the MFL key vault (HSM); keys must never be transmitted by email or chat.',
      ],
    },
    {
      code: 'GOV-STD-04',
      title: 'Physical Security Standard',
      type: 'standard',
      owner: 'Facilities Security Manager',
      approvedBy: 'CISO',
      lastReview: '2025-04-18',
      reviewCycle: 'Annual',
      excerpt: [
        'The data room shall be protected by badge access; all visitors must be logged and escorted.',
        'Visitor badges expire at close of business on the day of issue.',
        'Security doors must not be propped open; tailgating is prohibited.',
      ],
    },
    {
      code: 'GOV-STD-05',
      title: 'Server Hardening Standard',
      type: 'standard',
      owner: 'Security Architecture Team',
      approvedBy: 'CISO',
      lastReview: '2025-03-27',
      reviewCycle: 'Annual',
      excerpt: [
        'Administrators should consider enabling secure boot on depot servers.',
        'Where feasible, teams are encouraged to apply the vendor benchmark hardening baseline.',
        'It is generally a good idea to review default accounts from time to time.',
      ],
    },
    {
      code: 'GOV-PRC-01',
      title: 'Change Management Procedure',
      type: 'procedure',
      owner: 'IT Service Desk',
      approvedBy: 'Head of IT Infrastructure',
      lastReview: '2025-09-03',
      reviewCycle: 'Annual',
      excerpt: [
        'STEP 1 — Raise a change ticket describing scope, systems and rollback plan.',
        'STEP 2 — Obtain Change Advisory Board (CAB) approval; schedule the change window.',
        'EMERGENCY CHANGE PATH — Step A: obtain verbal approval from the on-call change manager. Step B: document the ticket within 24 hours. Step C: present the change to the CAB at the next business day for retrospective review.',
      ],
    },
    {
      code: 'GOV-PRC-02',
      title: 'Onboarding & Offboarding Procedure',
      type: 'procedure',
      owner: 'HR Operations',
      approvedBy: 'Director of People',
      lastReview: '2025-07-07',
      reviewCycle: 'Annual',
      excerpt: [
        'ONBOARDING — 1) Confirm identity and role with HR. 2) Create accounts strictly per the approved role-access matrix. 3) Issue a laptop imaged with disk encryption enabled BEFORE handover. 4) Obtain signed Acceptable Use Policy acknowledgment BEFORE any system access is granted.',
        'OFFBOARDING — 1) Manager notifies IT of the departure. 2) Disable all accounts and tokens. 3) Recover badges, keys and assets. 4) Revoke certificates and vault-held keys. 5) Data owners complete an access recertification within 30 days.',
      ],
    },
    {
      code: 'GOV-PRC-03',
      title: 'Incident Response Playbook — Ransomware',
      type: 'procedure',
      owner: 'Security Operations',
      approvedBy: 'CISO',
      lastReview: '2025-10-20',
      reviewCycle: 'Annual',
      excerpt: [
        'STEP 1 — Isolate the affected host(s) from the network immediately.',
        'STEP 2 — Report to the CISO (per GOV-POL-03, within 1 hour) and open the incident bridge.',
        'STEP 3 — Preserve volatile evidence before reimaging or rebooting.',
        'STEP 4 — Disable compromised accounts and reset credentials per the Access Control Standard.',
        'STEP 5 — Notify the Security Governance Committee for any incident touching dispatch or cargo systems.',
      ],
    },
    {
      code: 'GOV-GLD-01',
      title: 'Remote Work & Travel Security Guideline',
      type: 'guideline',
      owner: 'Security Awareness Team',
      approvedBy: 'CISO',
      lastReview: '2025-06-12',
      reviewCycle: 'Annual',
      excerpt: [
        'When traveling, staff are encouraged to connect through the MFL VPN whenever they use open Wi-Fi.',
        'Consider keeping the laptop firewall enabled and avoiding confidential work in public spaces.',
        'It is wise to assume hotel networks are monitored; treat them as untrusted.',
      ],
    },
    {
      code: 'GOV-GLD-02',
      title: 'Data Handling Guideline',
      type: 'guideline',
      owner: 'Data Governance Office',
      approvedBy: 'CISO',
      lastReview: '2025-05-05',
      reviewCycle: 'Annual',
      excerpt: [
        'Staff should classify shipment manifests before sharing them externally.',
        'Consider double-checking recipient lists before sending customer data.',
        'When in doubt about sensitivity, ask the data owner first — it is usually quicker than remediation.',
      ],
    },
  ],

  // ── Glossary ─────────────────────────────────────────────────────────────
  GLOSSARY: [
    { term: 'Policy', def: 'Management-approved statement of security intent; mandatory, says WHAT and WHY.' },
    { term: 'Standard', def: 'Specific measurable requirement that operationalizes a policy; mandatory, says WHAT EXACTLY.' },
    { term: 'Procedure', def: 'Ordered step-by-step instructions for a task; mandatory, says HOW.' },
    { term: 'Guideline', def: 'Recommended best practice; advisory ("should"), not enforceable.' },
    { term: 'AUP', def: 'Acceptable Use Policy — the rules for using company systems and data.' },
    { term: 'Playbook', def: 'A procedure giving ordered response steps for a specific incident type.' },
    { term: 'Exception (risk acceptance)', def: 'Formal, CISO-approved, written and time-boxed deviation from a requirement.' },
    { term: 'Delegation chain', def: 'Policy sets intent → Standard sets measurable rules → Procedure gives executable steps.' },
    { term: 'Data owner', def: 'Role accountable for a data set; approves access and classification.' },
    { term: 'Data controller', def: 'Entity deciding the purposes and means of processing personal data.' },
    { term: 'Data processor', def: 'Entity processing personal data on behalf of the controller, under its instructions.' },
    { term: 'Custodian / steward', def: 'Role implementing and maintaining the safeguards and data quality day-to-day.' },
    { term: 'CAB', def: 'Change Advisory Board — the body that reviews and approves production changes.' },
    { term: 'External governance', def: 'Regulatory, legal, industry and contractual obligations that shape internal documents.' },
  ],

  ORG: {
    name: 'Meridian Freight & Logistics (MFL)',
    note: 'Training simulation — all documents, people and events are fictional synthetic data.',
  },

  // ── Audit Desk findings (data of record; `truth` marks planted defects) ─
  AUDIT_FINDINGS: [
    {
      id: 'F1',
      claim: 'The registry contains no Acceptable Use Policy.',
      evidence: 'GOV-POL-01',
      truth: false,
      why: 'GOV-POL-01 is the AUP — it exists. Always search the registry before declaring a gap.',
    },
    {
      id: 'F2',
      claim: 'The Disaster Recovery Policy has no supporting recovery procedure in the registry.',
      evidence: 'GOV-POL-05',
      truth: true,
      why: 'GOV-POL-05 requires a "documented recovery capability" and recovery tests, yet no DR procedure exists. Intent without executable steps is a governance gap.',
    },
    {
      id: 'F3',
      claim: 'The registry contains no Encryption Standard.',
      evidence: 'GOV-STD-03',
      truth: false,
      why: 'GOV-STD-03 is the Encryption Standard. This finding is false.',
    },
    {
      id: 'F4',
      claim: 'The Incident Response Playbook is missing from the registry.',
      evidence: 'GOV-PRC-03',
      truth: false,
      why: 'GOV-PRC-03 is the ransomware playbook. This finding is false.',
    },
    {
      id: 'F5',
      claim: 'GOV-STD-05 is misclassified: its text is advisory, not a mandatory standard.',
      evidence: 'GOV-STD-05',
      truth: true,
      why: 'GOV-STD-05 uses "should consider" / "encouraged" — advisory language that belongs in a guideline. A standard filed as mandatory but written as advice confuses enforcement and audit.',
    },
    {
      id: 'F6',
      claim: 'The Change Management Procedure lacks an emergency path.',
      evidence: 'GOV-PRC-01',
      truth: false,
      why: 'GOV-PRC-01 contains the EMERGENCY CHANGE PATH (steps A–C). This finding is false.',
    },
    {
      id: 'F7',
      claim: 'The Password Standard is stale — it was last reviewed in 2019 despite an annual review cycle.',
      evidence: 'GOV-STD-01',
      truth: true,
      why: 'GOV-STD-01 shows lastReview 2019-03-10 with reviewCycle "Annual". Stale standards drift away from current threats and technology; auditors flag them immediately.',
    },
    {
      id: 'F8',
      claim: 'Guidelines in the registry exceed the annual review cycle.',
      evidence: 'GOV-GLD-01',
      truth: false,
      why: 'GOV-GLD-01 was last reviewed 2025-06-12 — current. This finding is false.',
    },
  ],
  HARD_DEFECT_IDS: ['F2', 'F5', 'F7'],
  MEDIUM_GAP_ID: 'F2',
  MEDIUM_MISFILE_ID: 'F5',

  // ── Docket disposition stamps ────────────────────────────────────────────
  STAMPS: {
    comply: { label: 'COMPLY — cite it', desc: 'The document governs this situation and the request can be answered by following it.' },
    exception: { label: 'REFER TO EXCEPTION', desc: 'The request conflicts with a mandatory requirement — route it to the formal exception process.' },
    advisory: { label: 'ADVISORY ONLY', desc: 'No hard rule applies; the governing document is guidance, not an enforceable requirement.' },
    none: { label: 'NO GOVERNING DOCUMENT', desc: 'This is not a governance matter at all — it is a red herring / out of scope.' },
  },

  // ── Request docket tickets ───────────────────────────────────────────────
  DOCKETS: [
    {
      id: 'R-101',
      from: 'K. Osei',
      role: 'Freight Coordinator',
      subject: 'USB stick for manifests?',
      body: [
        "My laptop is offline this morning. Can I copy tomorrow's shipment manifests onto my personal USB stick and move them via the depot kiosk?",
      ],
      modes: ['medium'],
      acceptedCites: ['GOV-POL-01'],
      acceptedStamp: 'comply',
      why: 'GOV-POL-01 (Acceptable Use Policy) prohibits personal storage media on MFL systems — the AUP governs everyday use of company systems and data.',
    },
    {
      id: 'R-102',
      from: 'T. Alvarez',
      role: 'System Administrator',
      subject: 'Minimum passphrase length for service accounts?',
      body: [
        'Provisioning a new integration account tonight. What is the minimum passphrase length MFL requires for service accounts?',
      ],
      modes: ['medium'],
      acceptedCites: ['GOV-STD-01'],
      acceptedStamp: 'comply',
      why: 'GOV-STD-01 (Password Standard) gives the measurable rule: 20 characters for service accounts. Policies say "protect credentials" — the standard says the exact number.',
    },
    {
      id: 'R-103',
      from: 'M. Duval',
      role: 'Network Engineer',
      subject: 'Emergency fix on the routing core at 02:00?',
      body: [
        'BGP is flapping and dispatch is degrading. I want to push a fix to the routing core right now, no ticket raised yet. What is the sanctioned way to do this?',
      ],
      modes: ['medium'],
      acceptedCites: ['GOV-PRC-01', 'GOV-POL-06'],
      acceptedStamp: 'comply',
      why: 'GOV-PRC-01 (Change Management Procedure) contains the EMERGENCY CHANGE PATH: verbal approval from the on-call change manager, ticket within 24 h, CAB retrospective review. The procedure holds the steps; GOV-POL-06 only states the intent.',
    },
    {
      id: 'R-104',
      from: 'S. Ivanova',
      role: 'Procurement Lead',
      subject: 'Encryption on the new laptop batch?',
      body: [
        'Ordering 120 dispatcher laptops. Is disk encryption mandatory on them, and if so, which algorithm must we specify in the purchase order?',
      ],
      modes: ['medium'],
      acceptedCites: ['GOV-STD-03'],
      acceptedStamp: 'comply',
      why: 'GOV-STD-03 (Encryption Standard) mandates full-disk encryption with AES-256. The standard carries the measurable technical requirement.',
    },
    {
      id: 'R-105',
      from: 'R. Ndiaye',
      role: 'HR Operations',
      subject: 'New dispatcher starting Monday',
      body: [
        'A new dispatcher starts Monday. Before her first shift, what exactly must HR and IT have completed so she can work lawfully and safely?',
      ],
      modes: ['medium'],
      acceptedCites: ['GOV-PRC-02'],
      acceptedStamp: 'comply',
      why: 'GOV-PRC-02 (Onboarding Procedure) lists the ordered steps: identity check, role-matrix accounts, encrypted laptop issued, signed AUP BEFORE access.',
    },
    {
      id: 'R-106',
      from: 'J. Barnes',
      role: 'Facilities Supervisor',
      subject: 'Visitor rules for the data room?',
      body: [
        "A vendor engineer arrives Thursday to service the UPS. What are MFL's rules for getting him into the data room?",
      ],
      modes: ['medium'],
      acceptedCites: ['GOV-STD-04'],
      acceptedStamp: 'comply',
      why: 'GOV-STD-04 (Physical Security Standard): badge access, logged and escorted visitors, badges expire at close of business.',
    },
    {
      id: 'R-107',
      from: 'L. Fontaine',
      role: 'Field Consultant',
      subject: 'Hotel Wi-Fi next week?',
      body: [
        "Travelling to the regional hub next week. Any official MFL advice for using the laptop on hotel Wi-Fi? Is there a rule I am breaking if I don't follow it?",
      ],
      modes: ['medium'],
      acceptedCites: ['GOV-GLD-01'],
      acceptedStamp: 'advisory',
      why: 'GOV-GLD-01 (Remote Work & Travel Guideline) applies — and its class matters: a guideline is advisory. Nothing is "broken" if advice is not followed, which is exactly the mandatory-vs-advisory distinction.',
    },
    {
      id: 'R-108',
      from: 'A. Weiss',
      role: 'Chief Information Security Officer',
      subject: 'Where is our overall intent stated?',
      body: [
        "For the board pack: which registry document states MFL's management-level intent for protecting shipment and customer data, including the formal exception rule?",
      ],
      modes: ['medium'],
      acceptedCites: ['GOV-POL-02'],
      acceptedStamp: 'comply',
      why: 'GOV-POL-02 (Information Security Policy) declares the intent and carries the exception rule: CISO approval, exception register, written acceptance with expiry.',
    },
    {
      id: 'R-109',
      from: 'P. Okafor',
      role: 'Depot Floor Manager',
      subject: 'Prop-open door during loading?',
      body: [
        'The badge reader at the shipping-office door keeps failing, so during loading windows we prop the door open with a crate. Can we get permission to keep doing it?',
      ],
      modes: ['medium'],
      acceptedCites: ['GOV-STD-04'],
      acceptedStamp: 'exception',
      why: 'GOV-STD-04 forbids propping security doors — a mandatory standard. This cannot be waved through: it must go through the formal exception process (CISO approval, exception register, written risk acceptance with expiry, per GOV-POL-02).',
    },
    {
      id: 'R-201',
      from: 'IT Service Desk',
      role: 'Tier-2 Support',
      subject: '[INTERNAL TICKET #4411] Contractor access request',
      body: [
        'Ticket notes: driver schedule dispute escalated to HR this morning (handled separately).',
        'Actual request: a haulage contractor needs ADMIN access to the finance system for a week.',
        'Does MFL governance permit this, and under what conditions?',
      ],
      modes: ['hard'],
      acceptedCites: ['GOV-STD-02'],
      acceptedStamp: 'comply',
      why: 'GOV-STD-02 (Access Control Standard) governs: least privilege, MFA on privileged access, data-owner approval and 90-day recertification. The HR noise line is a distractor.',
    },
    {
      id: 'R-202',
      from: 'Depot IT',
      role: 'Infrastructure Operator',
      subject: 'AES-128 backups at the depot?',
      body: [
        'Storage refresh quote lists AES-128 backup encryption — cheaper hardware. Is that acceptable under MFL governance for depot backup media?',
      ],
      modes: ['hard'],
      acceptedCites: ['GOV-STD-03'],
      acceptedStamp: 'comply',
      why: 'GOV-STD-03 requires AES-256 for backup media. The standard carries the exact measurable requirement — AES-128 fails it.',
    },
    {
      id: 'R-203',
      from: 'Front Desk',
      role: 'Reception',
      subject: 'Who won the parking spot lottery?',
      body: [
        "The monthly staff parking-spot lottery was drawn this morning. Which governance document covers publishing the winner's name on the intranet?",
      ],
      modes: ['hard'],
      acceptedCites: [],
      acceptedStamp: 'none',
      why: 'Red herring. No security governance document governs the parking lottery — forcing a citation here is how registers get polluted with nonsense. "No governing document" is the correct, defensible answer.',
    },
    {
      id: 'R-204',
      from: 'E. Romanov',
      role: 'Regional Manager',
      subject: 'Turn off MFA for our VIP executive?',
      body: [
        'Our regional VP says MFA slows down her sign-ins and wants it disabled on all her accounts. She is a VIP. Which document rules on this, and what is the sanctioned path if it cannot simply be granted?',
      ],
      modes: ['hard'],
      acceptedCites: ['GOV-STD-02'],
      acceptedStamp: 'exception',
      why: 'GOV-STD-02: "No exemptions are granted for executives or VIPs." MFA stays on. The only sanctioned route is the formal exception process (CISO, exception register, written risk acceptance with expiry).',
    },
    {
      id: 'R-205',
      from: 'SOC Shift Lead',
      role: 'Security Operations',
      subject: 'Ransomware note on dispatch server — first moves?',
      body: [
        'Encrypted file extensions spreading on a dispatch VM. What are the first sanctioned containment steps, in order?',
      ],
      modes: ['hard'],
      acceptedCites: ['GOV-PRC-03'],
      acceptedStamp: 'comply',
      why: 'GOV-PRC-03 (Ransomware Playbook) is the governing procedure: isolate, report to CISO within 1 h, preserve evidence, disable compromised accounts.',
    },
    {
      id: 'R-206',
      from: 'HR Operations',
      role: 'HR Operations',
      subject: 'Dispatcher resigning — Friday is his last day',
      body: [
        'A dispatcher confirmed resignation; last day Friday. What must be completed, and in what order, when he hands in badge and laptop?',
      ],
      modes: ['hard'],
      acceptedCites: ['GOV-PRC-02'],
      acceptedStamp: 'comply',
      why: "GOV-PRC-02 offboarding sequence: notify, disable accounts, recover assets, revoke certificates/keys, then data-owner recertification within 30 days — enforcing GOV-STD-02's 24-hour revocation rule.",
    },
  ],

  // ── Knowledge checks (quiz banks) ────────────────────────────────────────
  QUIZ_MEDIUM: [
    {
      id: 'QM1',
      q: 'Which governance element is advisory rather than mandatory?',
      options: ['Policy', 'Standard', 'Procedure', 'Guideline'],
      answer: 3,
      explain:
        'Guidelines recommend ("should", "consider") but do not bind. Policies, standards and procedures are mandatory layers of the same chain.',
      topic: 'document class authority',
      ref: 'Authority spectrum · GOV-GLD-01',
    },
    {
      id: 'QM2',
      q: 'What is the correct delegation chain from management intent to daily behavior?',
      options: [
        'Procedure → Policy → Standard',
        'Policy → Standard → Procedure',
        'Standard → Guideline → Policy',
        'Guideline → Procedure → Standard',
      ],
      answer: 1,
      explain:
        'Policy declares intent, a standard makes it measurable, a procedure makes it executable. The other orders invert cause and effect — intent cannot follow execution. Guidelines support alongside; they are not a chain layer.',
      topic: 'delegation chain',
      ref: 'Briefing hierarchy · OBJ-M12',
    },
    {
      id: 'QM3',
      q: 'A rule telling employees what they may do with company laptops and media is typically found in the…',
      options: [
        'Acceptable Use Policy',
        'Encryption Standard',
        'Onboarding Procedure',
        'Remote Work Guideline',
      ],
      answer: 0,
      explain:
        'The Acceptable Use Policy (a policy) governs everyday use of systems and data — e.g., no personal media, no credential sharing. The encryption standard names algorithms; onboarding sequences day-one steps; the travel guideline only advises.',
      topic: 'AUP scope',
      ref: 'GOV-POL-01',
    },
    {
      id: 'QM4',
      q: 'Minimum password length of 14 characters is an example of a…',
      options: ['Policy statement', 'Standard requirement', 'Guideline suggestion', 'Playbook step'],
      answer: 1,
      explain:
        'An exact, measurable, technology-level rule is a standard. The policy says "protect credentials"; the standard says 14 characters. A guideline would merely suggest; a playbook step would be one ordered action in a response.',
      topic: 'standards are measurable',
      ref: 'GOV-STD-01',
    },
    {
      id: 'QM5',
      q: 'Who authorizes changes to an approved security policy?',
      options: [
        'The helpdesk',
        'Any affected employee',
        'Any document owner',
        'Senior management only',
      ],
      answer: 3,
      explain:
        'Policies are management statements of intent, so amending one is a governance decision reserved to senior management / the board. Document owners maintain and draft, the helpdesk executes, and employees are subjects of the policy — none of them can re-authorize intent.',
      topic: 'policy authority',
      ref: 'Registry "Approved by" fields',
    },
    {
      id: 'QM6',
      q: 'A step-by-step containment guide for a ransomware outbreak is an example of a…',
      options: ['Policy', 'Standard', 'Playbook', 'Guideline'],
      answer: 2,
      explain:
        'Playbooks are procedures: ordered, executable steps for a specific incident type. The IR policy requires their use; the playbook performs it — a policy would state intent, a standard a measurable rule, a guideline a suggestion.',
      topic: 'playbooks',
      ref: 'GOV-PRC-03',
    },
  ],

  QUIZ_HARD: [
    {
      id: 'QH1',
      q: 'A team lead says: "It is only a guideline, so we can ignore it without any consequence." What is the BEST assessment?',
      options: [
        'Correct — guidelines carry no value worth defending in audits',
        'Incorrect — guidelines become binding once a manager invokes them',
        'Partly right — skipping guidance should stay a risk-aware choice',
        'Correct — but only while it stays outside the register',
      ],
      answer: 2,
      explain:
        'Guidelines are advisory — no discipline follows from ignoring them, so "correct without consequence" overstates the safety. But they encode recommended practice: casually dismissing them accumulates unassessed risk. Managers cannot make them binding by invoking them, and register placement does not change their weight.',
      topic: 'guideline weight',
      ref: 'GOV-GLD-01 · GOV-STD-05',
    },
    {
      id: 'QH2',
      q: 'An auditor finds a policy demanding "documented recovery capability" but no recovery procedure anywhere in the register. What is the correct classification of this observation?',
      options: [
        'A governance gap — intent without an execution layer',
        'Acceptable — a policy needs no supporting documents',
        'A custodian violation — the gap sits with operations',
        'A red herring — auditors do not check procedures',
      ],
      answer: 0,
      explain:
        'A policy whose delegation chain stops — no standard or procedure operationalizing it — is a governance gap: the intent can be neither executed nor verified. Policies do need supporting layers, the custodian merely implements what exists, and chain completeness is exactly what auditors check.',
      topic: 'governance gaps',
      ref: 'GOV-POL-05',
    },
    {
      id: 'QH3',
      q: "A manager asks to bypass MFA for a VIP. The access control standard explicitly forbids VIP exemptions. What is the ONLY governed path forward?",
      options: [
        'Grant it informally for a trial month',
        'Record the approval in a chat message',
        "Have the VIP's assistant sign it off",
        'File a time-boxed exception with the CISO',
      ],
      answer: 3,
      explain:
        "Conflicts with mandatory standards go through the exception process: named approver (CISO), exception register entry, written risk acceptance with an expiry date. An informal trial, a chat log and an assistant's sign-off are all unmanaged risk — none creates an auditable, expiring deviation.",
      topic: 'exception process',
      ref: 'GOV-POL-02 · GOV-STD-02',
    },
    {
      id: 'QH4',
      q: 'Which registry statement is MANDATORY (not advisory)?',
      options: [
        '"Administrators should consider enabling secure boot."',
        '"Visitor badges expire at close of business."',
        '"Staff are encouraged to use the VPN on open Wi-Fi."',
        '"Consider double-checking recipient lists."',
      ],
      answer: 1,
      explain:
        'Badges expiring at a fixed time is a measurable rule you could enforce and audit. The others lean on "should / encouraged / consider" — advisory verbs that recommend without binding.',
      topic: 'mandatory language',
      ref: 'GOV-STD-04 · GOV-GLD-01',
    },
    {
      id: 'QH5',
      q: 'During offboarding, which action sequence is correctly ordered?',
      options: [
        'Recover badge → disable accounts → recertify access → revoke vault keys → notify IT',
        'Recertify access → recover assets → disable accounts → revoke keys → notify IT',
        'Revoke vault keys → notify IT → recover badge → disable accounts → recertify',
        'Notify IT → disable accounts → recover assets → revoke certificates/keys → recertify access',
      ],
      answer: 3,
      explain:
        'Access dies first (disable accounts and tokens), then assets are recovered, then certificates and vault keys are revoked, and the data-owner recertification closes the loop within 30 days. Every other option leaves credentials, badges or keys alive after the departure — windows of exposure.',
      topic: 'offboarding order',
      ref: 'GOV-PRC-02 · GOV-STD-02',
    },
    {
      id: 'QH6',
      q: 'In a DECENTRALIZED governance structure, what is the main trade-off compared with a centralized one?',
      options: [
        'More consistent documents, slower local response',
        'No governance documents get produced locally',
        'Faster local response, but inconsistent requirements',
        'External regulations no longer apply locally',
      ],
      answer: 2,
      explain:
        'Decentralization pushes authority into business units: speed and domain fit rise, while consistency and single-source-of-truth suffer — duplicated or conflicting requirements appear. Centralized structures produce the more consistent documents, documents still get produced locally, and external regulations bind regardless of structure.',
      topic: 'governance structures',
      ref: 'Briefing · external governance',
    },
    {
      id: 'QH7',
      q: "A cloud vendor hosts MFL shipment data and processes it strictly under MFL's written instructions. Under governance roles, the vendor is the… and MFL remains the…",
      options: [
        'controller / processor',
        'processor / controller',
        'custodian / owner',
        'owner / custodian',
      ],
      answer: 1,
      explain:
        'Whoever decides the purposes and means of processing is the controller (MFL); the vendor processing on its behalf under instructions is the processor. Custodian and owner describe internal accountability roles, not contractual processing relationships.',
      topic: 'controllers vs processors',
      ref: 'Glossary roles · OBJ-M10',
    },
  ],
};

// Filter the docket tickets belonging to a mode (same rule as the original).
function docketForMode(mode) {
  return window.LAB_DATA.DOCKETS.filter(function (d) {
    return d.modes.indexOf(mode) !== -1;
  });
}
