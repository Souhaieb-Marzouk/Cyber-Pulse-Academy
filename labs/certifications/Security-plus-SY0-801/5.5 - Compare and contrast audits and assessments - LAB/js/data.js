/* ============================================================
   The Assurance Bureau — js/data.js
   ALL lab content, 1:1 from the original framework lab.
   ALL DATA IS SYNTHETIC TRAINING DATA. Fictional organization,
   people, domains. Nothing here calls a server.
   ============================================================ */

var LAB_DATA = {};

// ---------- case constants ----------
LAB_DATA.CASE = {
  org: "Halcyon Credit Union",
  caseNo: "AUD-2026-114",
  domain: "halcyon-cu.example",
  auditor: "you, IT Audit Associate",
  mentor: "Dana Reyes, Senior Auditor",
  firm: "Firmstone & Hughes LLP",
  period: "Jan 1 – Sep 30, 2026",
  fieldwork: "Oct – Nov 2026",
  externalAssessment: "December 2026",
};

// ---------- binder phases ----------
LAB_DATA.PHASES = [
  { id: "briefing", num: "01", title: "Briefing", subtitle: "The engagement & the landscape" },
  { id: "charter", num: "02", title: "Charter", subtitle: "Authority, scope, sampling" },
  { id: "fieldwork", num: "03", title: "Fieldwork", subtitle: "Evidence, interviews, samples" },
  { id: "testing", num: "04", title: "Control Tests", subtitle: "Functional & behavioral" },
  { id: "closeout", num: "05", title: "Close-out", subtitle: "Findings, attestation, signature" },
  { id: "debrief", num: "06", title: "Debrief", subtitle: "Field notes & next steps" },
  { id: "quiz", num: "07", title: "Knowledge Check", subtitle: "Prove it before you sign" },
];

// ---------- glossary ----------
LAB_DATA.GLOSSARY = [
  { term: "Audit", def: "A point-in-time comparison of actual state against a documented standard (policy, regulation, ticket)." },
  { term: "Assessment", def: "A broader evaluation of controls, risks and posture — aimed at finding what is weak and what could fail next." },
  { term: "Review", def: "A competent person examines an artifact (code, design, configuration) for problems before or after it is used." },
  { term: "Testing", def: "Actually operating a control to observe its behavior — functional (as designed) and behavioral (under realistic stress)." },
  { term: "Attestation", def: "A signed statement by a qualified auditor asserting that controls were examined and judged effective for a defined scope and period." },
  { term: "Internal audit", def: "Assurance work done by the organization's own staff — cheap, frequent, but less independent." },
  { term: "External audit", def: "Assurance work done by an independent third party — credible, often mandated by regulators or contracts." },
  { term: "Compliance-driven", def: "Triggered by an external mandate: a law, a regulator, a contract (e.g., PCI DSS, GLBA)." },
  { term: "Best-practice-driven", def: "Voluntary adoption of a framework or benchmark (e.g., ISO 27001, NIST CSF, CIS Benchmarks)." },
  { term: "Sampling", def: "The documented method for choosing which items from a population get tested — fixed before fieldwork begins." },
  { term: "Audit charter", def: "The written mandate that authorizes the audit function and fixes scope, authority and method." },
  { term: "Rule-based audit", def: "Asks “did we follow the written rule?” — compares practice to the rule text." },
  { term: "Results-based audit", def: "Asks “did the control achieve the intended outcome?” — compares results to the goal, even if rules were followed." },
  { term: "Remediation", def: "The corrective action taken on a finding." },
  { term: "Validation", def: "Re-testing after remediation to prove the finding is actually closed — assurance never takes a fix on faith." },
];

// ---------- user population (shared by Medium M7 and Hard H2) ----------
(function () {
  var privileged = [
    { id: "adm-jharper", code: "P-01", name: "J. Harper", type: "privileged", note: "Domain admin" },
    { id: "adm-ltruong", code: "P-02", name: "L. Truong", type: "privileged", note: "Domain admin" },
    { id: "adm-oknight", code: "P-03", name: "O. Knight", type: "privileged", note: "DB admin" },
    { id: "adm-rvasquez", code: "P-04", name: "R. Vasquez", type: "privileged", note: "Network admin" },
  ];
  var names = [
    "A. Chen", "B. Osei", "C. Duval", "D. Iqbal", "E. Ferrari",
    "F. Novak", "G. Mbeki", "H. Larsen", "I. Petrov", "J. Yamada",
    "K. Silva", "L. Haddad", "M. Kowalski", "N. Adeyemi", "O. Brandt",
    "P. Nakamura", "Q. Diallo", "R. Fontaine", "S. Kaur", "T. Björk",
  ];
  var standard = names.map(function (name, i) {
    var n = 101 + i;
    return {
      id: "EMP-" + n,
      code: "EMP-" + n,
      name: name,
      type: "standard",
      note: i === 9 || i === 19 ? "10th & 20th by ID — sample per charter" : "Teller / ops staff",
    };
  });
  var tail = [
    { id: "EMP-084", code: "EMP-084", name: "R. Bell", type: "terminated", note: "Separated Sep 12 — access revoked" },
    { id: "svc-backup", code: "S-01", name: "svc-backup", type: "service", note: "System account" },
    { id: "svc-scan", code: "S-02", name: "svc-scan", type: "service", note: "Scanner account" },
  ];
  LAB_DATA.POPULATION = privileged.concat(standard, tail);
})();

// charter sampling rule (verbatim source of truth for M7 / H2)
LAB_DATA.SAMPLING_RULE = [
  "Privileged/admin accounts: test ALL of them.",
  "Standard staff accounts: systematic sample — every 10th account by employee ID (EMP-110, EMP-120, …).",
  "Terminated employees: excluded from the sample.",
  "Service / system accounts: excluded (covered by a separate control).",
];

// ---------- documents ----------
LAB_DATA.DOCS = {
  charter: {
    id: "charter",
    kind: "charter",
    title: "Internal Audit Charter — IT General Controls Audit",
    meta: "Halcyon Credit Union · AUD-2026-114 · Approved by the Audit Committee, Oct 2 2026",
    sections: [
      {
        heading: "1. Authority",
        lines: [
          "The Audit Committee authorizes the internal audit team to examine IT general controls (ITGC) of Halcyon Credit Union, and to access any record, system and personnel needed for that purpose.",
        ],
      },
      {
        heading: "2. Scope",
        lines: [
          "IN SCOPE: privileged access management, MFA enrollment, change management (firewall), user access reviews, backup operations — systems on the cardholder-data boundary.",
          "OUT OF SCOPE: physical facilities, marketing applications, third-party vendor contracts (governed under objective 5.3 material), penetration testing (report review is handled under the vulnerability-management program, objective 4.3).",
        ],
      },
      {
        heading: "3. Sampling method (fixed before fieldwork)",
        lines: LAB_DATA.SAMPLING_RULE.concat([
          "The sampling method may only be changed by a charter amendment APPROVED by the Audit Committee before fieldwork. Draft or unapproved amendments have no effect.",
        ]),
      },
      {
        heading: "4. Thresholds & vocabulary",
        lines: [
          "MFA coverage pass threshold: ≥ 95% of ACTIVE, non-excluded accounts. Active = not terminated, not a service account, not disabled.",
          "Rule-based findings cite the rule (policy clause, ticket). Results-based findings cite the measured outcome.",
        ],
      },
      {
        heading: "5. Findings & close-out",
        lines: [
          "Each finding gets: remediation (or documented exception / escalation) → validation re-test → ledger update → closing report.",
          "Exception memo numbering: EXP-<year>-<case number suffix>. Case AUD-2026-114 → EXP-2026-114.",
          "The engagement closes with the external attestation review — an attestation is a scoped professional opinion, not a guarantee.",
        ],
      },
    ],
  },
  accessLogV1: {
    id: "accessLogV1",
    kind: "log",
    title: "User Access Review Log",
    meta: "Owner: IT Operations · Version 1 (as first produced)",
    sections: [
      {
        lines: [
          "Q1 — completed Mar 28, 2026 — reviewer: M. Okafor — signature: ✓ on file",
          "Q2 — completed Jun 27, 2026 — reviewer: M. Okafor — signature: ✓ on file",
          "Q4 — completed Dec 19, 2025 (prior cycle) — reviewer: P. Sato — signature: ✓ on file",
          "Q3 — (no row)",
        ],
      },
    ],
  },
  accessLogV2: {
    id: "accessLogV2",
    kind: "log",
    title: "User Access Review Log",
    meta: "Owner: IT Operations · Version 2 — “updated copy”, re-issued during fieldwork",
    sections: [
      {
        lines: [
          "Q1 — completed Mar 28, 2026 — reviewer: M. Okafor — signature: ✓ on file",
          "Q2 — completed Jun 27, 2026 — reviewer: M. Okafor — signature: ✓ on file",
          "Q3 — “completed Sep 30, 2026” — reviewer: M. Okafor — signature: — PENDING",
          "Q4 — completed Dec 19, 2025 (prior cycle) — reviewer: P. Sato — signature: ✓ on file",
        ],
      },
      {
        lines: [
          "Auditor note: a review row that was added mid-fieldwork without a signature is incomplete evidence. An unsigned record does not prove the control operated.",
        ],
      },
    ],
  },
  transcriptOkafor: {
    id: "transcriptOkafor",
    kind: "transcript",
    title: "Interview — M. Okafor, Systems Administrator",
    meta: "Recorded Oct – Nov 2026 · transcript excerpt · TRAINING DATA",
    sections: [
      {
        lines: [
          "Q (audit): How are the quarterly user access reviews handled?",
          "A: “Every quarter, without fail. Q3 was completed September 30 — I signed it myself. It's in the log.”",
          "Q (audit): Can you show me the signed copy?",
          "A: “The log was regenerated when we migrated to the new ticketing system. I can print you an updated copy.”",
        ],
      },
    ],
  },
  transcriptSato: {
    id: "transcriptSato",
    kind: "transcript",
    title: "Interview — P. Sato, Helpdesk Lead",
    meta: "Recorded Oct – Nov 2026 · transcript excerpt · TRAINING DATA",
    sections: [
      {
        lines: [
          "Q (audit): Did you take part in the Q3 access review?",
          "A: “We did one in the spring… summer got completely eaten by the CRM migration, honestly. I can't recall a September review.”",
        ],
      },
    ],
  },
  mfaReport: {
    id: "mfaReport",
    kind: "report",
    title: "MFA Enrollment Report — extract",
    meta: "Source: IAM platform · generated Nov 3, 2026 · TRAINING DATA",
    sections: [
      {
        heading: "Population",
        lines: [
          "Active user accounts: 250",
          "Enrolled in MFA: 234",
          "Policy-excluded service accounts (list below): 10 — svc-backup, svc-scan, svc-monitor, svc-deploy, svc-report, svc-mail, svc-patch, svc-vpn, svc-bkp2, svc-idx",
          "Disabled former-contractor accounts still in the directory: 5 (NOT active — do not count)",
        ],
      },
      {
        heading: "Unenrolled ACTIVE accounts (6)",
        lines: [
          "EMP-105 E. Ferrari — teller",
          "EMP-111 K. Silva — teller",
          "EMP-113 M. Kowalski — ops",
          "EMP-117 Q. Diallo — teller",
          "HD-02 T. Winters — helpdesk",
          "HD-03 U. Mbeki — helpdesk",
        ],
      },
    ],
  },
  changeTicket: {
    id: "changeTicket",
    kind: "ticket",
    title: "Approved Change Ticket CHG-8841",
    meta: "CAB-approved Oct 9, 2026 · Network team",
    sections: [
      {
        lines: [
          "Change: replace legacy any-any rule on the boundary firewall with three least-privilege rules for the cardholder VLAN.",
          "Approved rule set: 10.40.0.0/16 → cardholder VLAN 10.42.7.0/24 on ports 443, 8443 only; deny log all else.",
          "Expected config after change: NO 'permit ip any any' rule remains on the boundary interface.",
        ],
      },
    ],
  },
  firewallConfig: {
    id: "firewallConfig",
    kind: "config",
    title: "Boundary Firewall — running config (excerpt)",
    meta: "Pulled during fieldwork · Nov 6, 2026 · TRAINING DATA",
    sections: [
      {
        lines: [
          "interface ethernet0/0 (boundary)",
          "  rule 10: permit tcp 10.40.0.0/16 10.42.7.0/24 port 443",
          "  rule 11: permit tcp 10.40.0.0/16 10.42.7.0/24 port 8443",
          "  rule 12: permit ip any any        ← NOT in CHG-8841",
          "  rule 13: deny log ip any any",
        ],
      },
    ],
  },
  attestation: {
    id: "attestation",
    kind: "letter",
    title: "Independent Attestation Letter",
    meta: "Firmstone & Hughes LLP · re: Halcyon Credit Union · engagement period Jan 1 – Sep 30, 2026 · TRAINING DATA",
    sections: [
      {
        lines: [
          "To the Audit Committee of Halcyon Credit Union:",
          "We have examined the controls of Halcyon Credit Union's CARDHOLDER DATA ENVIRONMENT for the period January 1 – September 30, 2026. In our opinion, as a result of our examination, the controls within that scope operated effectively throughout the period.",
          "SCOPE LIMITATION: this attestation covers the cardholder data environment only. It does NOT cover the marketing cloud application, physical facilities, or any system outside the stated scope.",
          "NATURE LIMITATION: an attestation is a professional opinion on control effectiveness for a defined period. It is not a guarantee that no security incident will occur.",
          "Signed: R. Ellison, Engagement Partner — Firmstone & Hughes LLP",
        ],
      },
    ],
  },
  independenceDecl: {
    id: "independenceDecl",
    kind: "letter",
    title: "Assessor Independence Declaration",
    meta: "Firmstone & Hughes LLP · on file with the Audit Committee",
    sections: [
      {
        lines: [
          "Firmstone & Hughes LLP declares: no financial interest in Halcyon Credit Union; no consulting engagement with Halcyon in the last 24 months; assessment staff rotate annually. This is the document that evidences the assessor's independence.",
        ],
      },
    ],
  },
  noisePrinter: {
    id: "noisePrinter",
    kind: "ticket",
    title: "INC-2026-041 — Branch printer outage",
    meta: "IT service desk · Nov 1, 2026 · TRAINING DATA",
    sections: [
      {
        lines: [
          "Teller-branch printer failed for 6 hours; queue backed up. Availability incident for the service desk — nothing to do with access, change, MFA, or backup controls. ITGC audit scope: NO.",
        ],
      },
    ],
  },
  noiseVendor: {
    id: "noiseVendor",
    kind: "ticket",
    title: "Marketing — vendor contract review (Meridian Swag Co.)",
    meta: "Marketing ops · Oct 20, 2026 · TRAINING DATA",
    sections: [
      {
        lines: [
          "Merchandise vendor onboarding; procurement wants a security review of the vendor. Third-party risk management is a different exam objective (5.3) and outside this ITGC audit's charter scope. Ledger item: OUT OF SCOPE.",
        ],
      },
    ],
  },
  noisePentest: {
    id: "noisePentest",
    kind: "report",
    title: "Penetration Test Report — cover page only",
    meta: "External specialists · Sep 2026 · TRAINING DATA",
    sections: [
      {
        lines: [
          "“…full report delivered to the vulnerability-management program. Per SY0-801 (draft objectives), penetration test REPORT REVIEW is handled under objective 4.3 — not under 5.5 audits and assessments.”",
          "Why it is here: to teach the boundary. Recognizing what is NOT in scope of this lesson is exam-relevant.",
        ],
      },
    ],
  },
  noiseAmendment: {
    id: "noiseAmendment",
    kind: "memo",
    title: "Charter Amendment 3 (DRAFT — NOT APPROVED)",
    meta: "Circulated by email · Oct 30, 2026 · no Audit Committee sign-off",
    sections: [
      {
        lines: [
          "“Proposal: reduce standard-account sampling to every 25th account to save budget.”",
          "Status: DRAFT. The charter states an amendment only takes effect when APPROVED by the Audit Committee before fieldwork. This one was not → it has no effect on your sample.",
        ],
      },
    ],
  },
  noiseSkipEmail: {
    id: "noiseSkipEmail",
    kind: "memo",
    title: "Email — Ops lead to audit team",
    meta: "Nov 7, 2026 · TRAINING DATA",
    sections: [
      {
        lines: [
          "“Admins are slammed this month — could you skip the four privileged accounts and just do the regular staff?”",
          "Auditor note: the privileged accounts are tested IN FULL per the charter. Pressure to skip them is exactly what an audit must resist. Politely decline and document.",
        ],
      },
    ],
  },
  exceptionMemo: {
    id: "exceptionMemo",
    kind: "memo",
    title: "Exception Memo (stationery pad)",
    meta: "Blank template · numbering per charter §5",
    sections: [
      {
        lines: [
          "Template: “EXP-<year>-<case number suffix> — finding ref, compensating control, expiry date, approver.”",
          "For case AUD-2026-114 the memo ID is therefore EXP-2026-114.",
        ],
      },
    ],
  },
};

// documents shown in the evidence room, per mode
LAB_DATA.FIELDWORK_DOCS = {
  medium: ["transcriptOkafor", "transcriptSato", "accessLogV1", "mfaReport", "changeTicket", "firewallConfig"],
  hard: [
    "transcriptOkafor", "transcriptSato", "accessLogV1", "accessLogV2", "mfaReport",
    "changeTicket", "firewallConfig", "noisePrinter", "noiseVendor", "noisePentest",
    "noiseAmendment", "noiseSkipEmail", "exceptionMemo",
  ],
};

// ---------- findings ledger ----------
LAB_DATA.FINDINGS = [
  { id: "F-01", title: "Firewall rule 12 does not match approved ticket CHG-8841", rule: "Rule-based · Change Management Policy §4.2", mode: ["medium", "hard"] },
  { id: "F-02", title: "Q3 user access review missing / unsigned (evidence incomplete)", rule: "Rule-based · Access Control Policy §7.1", mode: ["medium", "hard"] },
  { id: "F-03", title: "6 active staff accounts (incl. 2 helpdesk) not enrolled in MFA", rule: "Results-based · coverage 97.5% meets 95% threshold but gap remains", mode: ["medium", "hard"] },
  { id: "F-04", title: "Backup restore succeeded but took 9.5 h against a 4 h RTO", rule: "Results-based · Recovery objective", mode: ["hard"] },
  { id: "F-05", title: "Fieldwork surfaced a possible unauthorized admin session", rule: "Escalation candidate · incident process", mode: ["hard"] },
  { id: "NOISE-1", title: "Branch printer outage INC-2026-041", rule: "Availability incident — ops, not ITGC", mode: ["hard"] },
  { id: "NOISE-2", title: "Marketing vendor contract review", rule: "Third-party risk — objective 5.3 territory", mode: ["hard"] },
];

// ---------- reference sources (M9 / H5) ----------
LAB_DATA.REFERENCE_SOURCES = [
  { id: "attck", name: "MITRE ATT&CK", blurb: "A curated catalog of real-world adversary tactics and techniques — used to ask “which behaviors do we actually cover?”" },
  { id: "killchain", name: "Cyber Kill Chain", blurb: "Stages an intrusion moves through (recon → … → actions on objective) — used to check detection points across the chain." },
  { id: "diamond", name: "Diamond Model", blurb: "Connects adversary, capability, infrastructure and victim — used to analyze a single incident's relationships." },
];

LAB_DATA.OFFICIAL_LINK = "https://www.comptia.org/en-us/certifications/security/v8";

// ---------- mode selection letters ----------
LAB_DATA.LETTERS = [
  {
    mode: "medium",
    stamp: "GUIDED FIELDWORK",
    accent: "#1E5B3F",
    title: "Guided Fieldwork",
    body1: "12 worksheets, introduced in engagement order. Each tells you where to look, tiered hints are always available (they only cost stars), and every check explains itself.",
    body2: "Best when this material is new: you will be walked through the charter, the sampling, the interviews, the rig, and the closing.",
    meta: "Understand / Apply · hints: 3-level · tolerant checking",
  },
  {
    mode: "hard",
    stamp: "SOLO ENGAGEMENT",
    accent: "#9C2F26",
    title: "Solo Engagement",
    body1: "The same case file — deliberately noisy. At least two items are red herrings, one log was re-issued unsigned, and a “helpful” email asks you to cut corners. 9 broad worksheets, strict validation, near-misses rejected with reasons.",
    body2: "No where-to-look, one nudge per worksheet at a score cost. Best when you believe you already know this lesson.",
    meta: "Analyze / Evaluate / Create · hints: 1 paid nudge · strict checking",
  },
];

// study pointers used by the field report's focus areas
LAB_DATA.STUDY_POINTER = {
  briefing: "re-open tab 01 (Briefing) — the Knowledge Core cards",
  charter: "re-read the Audit Charter and the reference-source cards in tab 02",
  fieldwork: "re-open the evidence-room documents in tab 03",
  testing: "re-run both control tests in the rig (tab 04)",
  closeout: "re-read the attestation letter and the findings ledger in tab 05",
};

// ---------- objective worksheets (Medium 12 / Hard 9) ----------
// Each objective anchors to a detail of SY0-801 objective 5.5 (see lab dossier).
LAB_DATA.OBJECTIVES = [
  // ================= MEDIUM =================
  {
    id: "M1",
    mode: "medium",
    pillar: "P1",
    phase: "briefing",
    title: "Define the two animals",
    prompt: "Six statements about assurance work are on the desk. Assign each one to the activity it defines: Audit or Assessment.",
    lookFor: "Knowledge Core card, section “Audit vs Assessment”.",
    hints: [
      "Audits are anchored to a documented standard; assessments judge effectiveness and risk more broadly.",
      "Look for the words “standard/policy/rule” (audit) versus “risk/gaps/what could fail” (assessment).",
      "s1→Audit, s3→Audit, s5→Audit; s2→Assessment, s4→Assessment, s6→Assessment.",
    ],
    parts: [
      {
        id: "sort",
        kind: "choices",
        label: "Assign each statement to its activity",
        items: [
          { id: "s1", label: "Point-in-time comparison of actual state against a documented standard." },
          { id: "s2", label: "Broad evaluation of controls and risks — what could fail next?" },
          { id: "s3", label: "Answers: did we do what the policy says?" },
          { id: "s4", label: "Answers: are our protections working, and where are the gaps?" },
          { id: "s5", label: "Produces findings tied to policy clauses and rules." },
          { id: "s6", label: "Produces a risk-focused picture that drives forward-looking improvements." },
        ],
        itemOptions: ["Audit", "Assessment"],
        itemSolution: { s1: "Audit", s2: "Assessment", s3: "Audit", s4: "Assessment", s5: "Audit", s6: "Assessment" },
        rejects: {
          "s1:Assessment": "“Against a documented standard” is the audit signature — assessments are broader.",
        },
      },
    ],
    feedback:
      "The exam's verb is compare and contrast: an audit checks state against a written standard at a point in time; an assessment evaluates controls and risk broadly to find what could fail next. Auditors cite clauses; assessors cite risk. You can now state both sides — that is exactly what SY0-801 5.5 tests.",
  },
  {
    id: "M2",
    mode: "medium",
    pillar: "P1",
    phase: "charter",
    title: "Order the engagement lifecycle",
    prompt: "Participating in an audit means knowing its arc. Arrange the eight steps of the engagement in the order they really happen.",
    lookFor: "Audit charter §1 and §5 (authority → close-out).",
    hints: [
      "Authority comes first (charter), and the engagement ends with a signature (closing report / attestation).",
      "Sampling is fixed in planning — before any evidence is gathered.",
      "Order: charter → sampling plan → evidence → testing → findings → remediation → validation → closing.",
    ],
    parts: [
      {
        id: "lifecycle",
        kind: "order",
        label: "Build the sequence (click steps in order)",
        items: [
          { id: "st-charter", label: "Audit charter approved — scope & authority set" },
          { id: "st-sampling", label: "Sampling method fixed in the plan" },
          { id: "st-evidence", label: "Evidence gathered (documents & interviews)" },
          { id: "st-testing", label: "Controls tested (functional & behavioral)" },
          { id: "st-findings", label: "Findings reported" },
          { id: "st-remediation", label: "Remediation performed" },
          { id: "st-validation", label: "Validation re-test" },
          { id: "st-closing", label: "Closing report & attestation" },
        ],
        solutionOrder: ["st-charter", "st-sampling", "st-evidence", "st-testing", "st-findings", "st-remediation", "st-validation", "st-closing"],
        rejects: { sequence: "Anchor on the two fixed points: the charter authorizes BEFORE anything happens; the signature closes AFTER validation." },
      },
    ],
    feedback:
      "This arc is the “participate” spine of objective 5.5: charter authorizes, the plan fixes sampling so it cannot be gamed, evidence goes in, tests run, findings come out, fixes are made — and validation proves the fixes. You just walked a real engagement's lifecycle.",
  },
  {
    id: "M3",
    mode: "medium",
    pillar: "P1",
    phase: "charter",
    title: "Internal or external?",
    prompt: "Four engagements are described. Tag each as Internal or External — the dividing line is independence.",
    lookFor: "Charter §1 (who authorizes Halcyon's own team) vs the attestation letter's law-firm letterhead.",
    hints: [
      "Ask: who performs it — the organization's own staff, or an outside firm?",
      "A regulator-mandated examination and a PCI DSS assessment are done by outside parties.",
      "e1→Internal, e2→External, e3→External, e4→Internal.",
    ],
    parts: [
      {
        id: "tag",
        kind: "choices",
        label: "Tag each engagement",
        items: [
          { id: "e1", label: "Halcyon's own two-person audit team reviews IT general controls each quarter." },
          { id: "e2", label: "Firmstone & Hughes LLP examines Halcyon on behalf of banking regulators (GLBA)." },
          { id: "e3", label: "An assessor certified for PCI DSS assesses the cardholder environment." },
          { id: "e4", label: "IT staff run a self-assessment of their own backup procedures." },
        ],
        itemOptions: ["Internal", "External"],
        itemSolution: { e1: "Internal", e2: "External", e3: "External", e4: "Internal" },
        rejects: { "e3:Internal": "A PCI DSS assessment is performed by an independent, certified assessor — external by definition." },
      },
    ],
    feedback:
      "Independence is the axis: internal teams are cheap, fast and know the house, but they cannot give outsiders credible assurance. External engagements carry the independence that regulators and partners trust — which is exactly why GLBA examinations and PCI DSS assessments use them.",
  },
  {
    id: "M4",
    mode: "medium",
    pillar: "P2",
    phase: "charter",
    title: "Why was it commissioned?",
    prompt: "Five engagements, five motivations. Classify each driver as Compliance-driven (an external mandate) or Best-practice-driven (voluntary).",
    lookFor: "Charter §2 and the Knowledge Core's “drivers” panel.",
    hints: [
      "Look for a named law, regulator or payment brand mandate → compliance.",
      "Frameworks adopted “because it is good practice” or because customers ask → best practice.",
      "c1→Compliance, c2→Compliance, c3→Best practice, c4→Best practice, c5→Compliance.",
    ],
    parts: [
      {
        id: "driver",
        kind: "choices",
        label: "Classify each driver",
        items: [
          { id: "c1", label: "Annual PCI DSS assessment of the cardholder environment." },
          { id: "c2", label: "GLBA regulatory examination by banking regulators." },
          { id: "c3", label: "ISO 27001 certification gap assessment — no law requires it; customers ask for it." },
          { id: "c4", label: "CIS Benchmark configuration review, adopted as good practice." },
          { id: "c5", label: "Readiness audit for the state data-breach notification law." },
        ],
        itemOptions: ["Compliance-driven", "Best-practice-driven"],
        itemSolution: { c1: "Compliance-driven", c2: "Compliance-driven", c3: "Best-practice-driven", c4: "Best-practice-driven", c5: "Compliance-driven" },
        rejects: {
          "c3:Compliance-driven": "ISO 27001 is a voluntary standard — market pressure, not a legal mandate. Best practice.",
        },
      },
    ],
    feedback:
      "Compliance-driven work is triggered by an external mandate — a law, a regulator, a card brand, a contract. Best-practice-driven work is the organization voluntarily adopting a framework (ISO 27001, NIST CSF, CIS). Same activity, different obligation — and on the exam, the trigger is the discriminator.",
  },
  {
    id: "M9",
    mode: "medium",
    pillar: "P3",
    phase: "charter",
    title: "Pick the reference source",
    prompt: "The assessment lead frames four coverage questions. Match each question to the reference source an auditor would reach for — including “none of the three” when none applies.",
    lookFor: "Charter §4 vocabulary + the Reference Sources cards beside the charter.",
    hints: [
      "ATT&CK catalogs adversary behaviors/techniques; the Kill Chain is about stages of an intrusion; the Diamond Model connects the actors of one incident.",
      "Hardening benchmarks are configuration baselines, not adversary models.",
      "q1→ATT&CK, q2→Kill Chain, q3→Diamond Model, q4→None of the three.",
    ],
    parts: [
      {
        id: "refs",
        kind: "choices",
        label: "Match question to reference source",
        items: [
          { id: "q1", label: "“Which adversary behaviors and techniques does our monitoring actually cover?”" },
          { id: "q2", label: "“Do we have detection points across every stage from recon to exfiltration?”" },
          { id: "q3", label: "“For this one incident, how do adversary, capability and infrastructure connect?”" },
          { id: "q4", label: "“Our routers should follow CIS hardening benchmarks — which reference source applies?”" },
        ],
        itemOptions: ["MITRE ATT&CK", "Cyber Kill Chain", "Diamond Model", "None of the three"],
        itemSolution: { q1: "MITRE ATT&CK", q2: "Cyber Kill Chain", q3: "Diamond Model", q4: "None of the three" },
        rejects: {
          "q4:Cyber Kill Chain": "CIS Benchmarks are configuration baselines — the SY0-801 draft names ATT&CK, Kill Chain and Diamond as the reference sources, and hardening guides are their own catalogue.",
        },
      },
    ],
    feedback:
      "Per the SY0-801 draft objectives, assessments lean on three reference sources: MITRE ATT&CK (adversary techniques), the Cyber Kill Chain (intrusion stages) and the Diamond Model (incident relationships). Knowing which question each answers — and recognizing that a hardening benchmark is NOT one of them — is exactly the discrimination the exam tests.",
  },
  {
    id: "M5",
    mode: "medium",
    pillar: "P2",
    phase: "fieldwork",
    title: "Which activity is which?",
    prompt: "The lesson detail says “participate in audits, reviews, testing, and assessments” — four different activities. Sort these six field notes.",
    lookFor: "Knowledge Core panel “The four activities”.",
    hints: [
      "Reviews examine artifacts by reading; testing operates the control.",
      "Audits compare evidence to a standard; assessments evaluate broadly.",
      "a1→Review, a2→Audit, a3→Testing, a4→Assessment, a5→Review, a6→Testing.",
    ],
    parts: [
      {
        id: "kind",
        kind: "choices",
        label: "Classify each field note",
        items: [
          { id: "a1", label: "Peer walkthrough of the new portal's source code before release." },
          { id: "a2", label: "Internal audit checks firewall rules line-by-line against the change ticket and policy." },
          { id: "a3", label: "A tester simulates an admin login without MFA to see if the control blocks it." },
          { id: "a4", label: "A two-day evaluation of overall security posture, risks and gaps." },
          { id: "a5", label: "A security architect examines the new architecture document for design flaws." },
          { id: "a6", label: "A backup restore drill is executed to measure real recovery time." },
        ],
        itemOptions: ["Review", "Testing", "Audit", "Assessment"],
        itemSolution: { a1: "Review", a2: "Audit", a3: "Testing", a4: "Assessment", a5: "Review", a6: "Testing" },
        rejects: {
          "a6:Audit": "Executing a restore drill operates the control and measures behavior — that is testing, not a comparison to a standard.",
        },
      },
    ],
    feedback:
      "Four verbs, four postures: reviews read artifacts (code, design, configuration); testing operates controls and observes behavior; audits compare evidence to a written standard; assessments evaluate the whole picture. The 5.5 lesson detail names all four — recognizing them in a scenario is a guaranteed exam pattern.",
  },
  {
    id: "M6",
    mode: "medium",
    pillar: "P3",
    phase: "fieldwork",
    title: "The interview contradiction",
    prompt: "Two transcripts and one log sit on the desk. Identify which claim the written evidence contradicts, and which quarter has no completed review.",
    lookFor: "Transcripts (Okafor, Sato) vs the User Access Review Log.",
    hints: [
      "Evidence beats testimony: compare each claim to the log rows.",
      "One transcript claims Q3 was completed; the log shows rows for Q1, Q2 and prior-cycle Q4 — nothing for Q3.",
      "Claim A (Okafor) is contradicted; the missing quarter is Q3.",
    ],
    parts: [
      {
        id: "claim",
        kind: "choice",
        label: "Which claim does the evidence contradict?",
        options: [
          "A — Okafor: “Q3 was completed September 30.”",
          "B — Sato: “summer got eaten by the migration.”",
          "Both claims are contradicted by the log",
          "Neither claim is contradicted by the log",
        ],
        solution: "A — Okafor: “Q3 was completed September 30.”",
        rejects: {
          "B — Sato: “summer got eaten by the migration.”": "Sato's vagueness is consistent with the log (no Q3 row) — it is not contradicted by evidence.",
        },
      },
      {
        id: "quarter",
        kind: "text",
        label: "Type the quarter with no completed review",
        placeholder: "e.g. Q3",
        accept: ["q3", "q 3", "quarter 3", "quarter three", "3rd quarter", "third quarter", "3"],
        rejects: { "*": "The log has rows for Q1, Q2 and the prior-cycle Q4 — the gap is the third quarter." },
      },
    ],
    feedback:
      "Interviews are evidence, but records win: Okafor's confident claim collapses against the log with no Q3 row. That is why the SY0-801 draft pairs “sampling” with “interviews” — testimony leads you to records, records decide findings. Next step for a defender: raise the gap as a finding and require a signed, retrospective review.",
  },
  {
    id: "M7",
    mode: "medium",
    pillar: "P3",
    phase: "fieldwork",
    title: "Select the sample",
    prompt: "Apply the charter's sampling rule to the user population and select exactly the accounts that will be tested.",
    lookFor: "Charter §3 “Sampling method” + the User Population table below.",
    hints: [
      "Privileged accounts: ALL of them, no exceptions.",
      "Standard accounts: every 10th by employee ID — from EMP-101…EMP-120 that means EMP-110 and EMP-120.",
      "Terminated and service accounts are excluded by the rule.",
    ],
    parts: [
      {
        id: "sample",
        kind: "set",
        label: "Select the accounts to test (exact set)",
        solutionSet: ["adm-jharper", "adm-ltruong", "adm-oknight", "adm-rvasquez", "EMP-110", "EMP-120"],
        rejects: {
          set: "Charter §3: privileged accounts are tested in full; standard accounts use every-10th-by-ID; terminated and service accounts are excluded.",
        },
      },
    ],
    feedback:
      "The charter fixed a systematic sample (every 10th by ID) BEFORE fieldwork — so the result cannot be gamed after the fact. Six accounts: four privileged tested in full plus EMP-110 and EMP-120. If the method had been decided mid-fieldwork, the audit itself would be a finding.",
  },
  {
    id: "M11",
    mode: "medium",
    pillar: "P2",
    phase: "fieldwork",
    title: "Rule-based or results-based?",
    prompt: "Four draft findings came out of fieldwork. Classify each as a rule-based finding (rule not followed) or a results-based finding (rule followed, outcome missed).",
    lookFor: "Charter §4 “Thresholds & vocabulary”.",
    hints: [
      "Cites a policy clause or a ticket mismatch → rule-based.",
      "“It worked, but the measured result missed the goal” → results-based.",
      "r1→Rule, r3→Rule, r2→Results, r4→Results.",
    ],
    parts: [
      {
        id: "basis",
        kind: "choices",
        label: "Classify each finding",
        items: [
          { id: "r1", label: "Firewall config contains a rule that does not match approved change ticket CHG-8841." },
          { id: "r2", label: "MFA coverage is 97.5% — above the 95% threshold — but 6 staff accounts remain unenrolled." },
          { id: "r3", label: "The Q3 user access review required by policy was not performed." },
          { id: "r4", label: "Backup restore succeeded, but restore took 9.5 hours against a 4-hour RTO." },
        ],
        itemOptions: ["Rule-based", "Results-based"],
        itemSolution: { r1: "Rule-based", r2: "Results-based", r3: "Rule-based", r4: "Results-based" },
        rejects: {
          "r2:Rule-based": "The rule was followed (coverage beats the threshold) — the finding is about the measured outcome gap. That is results-based.",
        },
      },
    ],
    feedback:
      "Rule-based asks “did we follow the written rule?”; results-based asks “did the control achieve the intended outcome?”. The MFA case is the classic trap: the threshold is met yet a real gap remains. Strong audits report both perspectives — and the exam loves asking you to tell them apart.",
  },
  {
    id: "M8",
    mode: "medium",
    pillar: "P3",
    phase: "testing",
    title: "Run the control tests",
    prompt: "Operate both controls yourself: run the MFA functional test and the backup behavioral drill in the test rig, observe the outputs, and record your verdicts.",
    lookFor: "The Control Test Rig on this page — two cards with RUN buttons.",
    hints: [
      "Functional test asks: does the control do what it was designed to do?",
      "Behavioral test asks: does it behave correctly under realistic stress?",
      "Run both rigs first — the state check refuses to grade until you have.",
    ],
    parts: [
      {
        id: "runs",
        kind: "state",
        label: "Both test-rig runs executed",
        flags: ["rig-mfa-run", "rig-backup-run"],
      },
      {
        id: "observed",
        kind: "choice",
        label: "MFA functional test — what did the control do?",
        options: ["Allowed the login with no challenge", "Blocked — OTP was demanded"],
        solution: "Blocked — OTP was demanded",
        rejects: {
          "Allowed the login with no challenge": "The rig output says AUTH DENIED — the MFA control enforced the second factor.",
        },
      },
      {
        id: "verdictFn",
        kind: "choice",
        label: "Functional verdict",
        options: ["Functions as designed", "Control failed outright"],
        solution: "Functions as designed",
      },
      {
        id: "behavior",
        kind: "choice",
        label: "Backup behavioral test — did the control behave as intended under stress?",
        options: ["Died silently without any alert to ops", "Resumed and alerted, with a three-minute delay"],
        solution: "Resumed and alerted, with a three-minute delay",
        rejects: {
          "Died silently without any alert to ops": "The rig log shows an alert at 02:22 and a successful resume at 02:31 — it did not die silently.",
        },
      },
      {
        id: "verdictBh",
        kind: "choice",
        label: "Behavioral verdict",
        options: ["Fail — no observation recorded", "Pass — one observation noted"],
        solution: "Pass — one observation noted",
      },
    ],
    feedback:
      "Functional testing asks “does it work as designed?” — the login without a second factor was denied, so MFA functions. Behavioral testing asks “does it behave correctly in realistic conditions?” — the backup survived the link failure but alerted three minutes late: a pass with an observation. Recording observations, not just pass/fail, is what makes a test auditable.",
  },
  {
    id: "M10",
    mode: "medium",
    pillar: "P4",
    phase: "closeout",
    title: "Route the findings",
    prompt: "Three findings need a response. Choose the correct remediation for each — then answer what must happen before ANY finding can be closed.",
    lookFor: "The Findings Ledger on the right; each finding cites its rule.",
    hints: [
      "A finding is closed by evidence, never by assurance.",
      "The firewall fix must bring the config back to the APPROVED ticket, not the other way around.",
      "Remediations: re-align config to CHG-8841 · retrospective signed review + calendar automation · enroll the six staff. And: validation re-test.",
    ],
    parts: [
      {
        id: "f1",
        kind: "choice",
        label: "F-01 · firewall mismatch — remediation?",
        options: [
          "Amend ticket CHG-8841 so it blesses the extra rule",
          "Bring the config back to the ticket-approved rule set",
          "Ignore it — the rule works fine in production today",
        ],
        solution: "Bring the config back to the ticket-approved rule set",
        rejects: {
          "Amend ticket CHG-8841 so it blesses the extra rule": "Re-writing an approved ticket after the config drifted defeats change control — the fix is to re-align the config to what was approved.",
        },
      },
      {
        id: "f2",
        kind: "choice",
        label: "F-02 · Q3 review missing — remediation?",
        options: [
          "Rewrite the policy so quarterly reviews become optional",
          "Mark the finding N/A — reviews are low value anyway",
          "Do the retrospective review and automate the reminders",
          "Log it as an observation without any remediation owner",
        ],
        solution: "Do the retrospective review and automate the reminders",
      },
      {
        id: "f3",
        kind: "choice",
        label: "F-03 · six staff unenrolled in MFA — remediation?",
        options: [
          "Enroll the six staff; route exceptions formally",
          "Lower the coverage threshold to ninety percent",
          "Do nothing — the coverage already beats ninety-five",
        ],
        solution: "Enroll the six staff; route exceptions formally",
        rejects: {
          "Do nothing — the coverage already beats ninety-five": "Beating a threshold is not closing a gap — results-based findings fix the outcome, not the metric.",
        },
      },
      {
        id: "close",
        kind: "choice",
        label: "Before any finding can be closed, what must happen?",
        options: ["A validation re-test with recorded evidence", "A signed verbal assurance from the owner", "Nothing — the remediation timestamp is proof enough"],
        solution: "A validation re-test with recorded evidence",
      },
    ],
    feedback:
      "Remediation restores the approved state (never re-write the rule to match the drift), and no finding is closed on a promise — validation re-tests and records. This remediate→validate loop is the mitigation pillar of objective 5.5 and the reason auditors re-run the check themselves.",
  },
  {
    id: "M12",
    mode: "medium",
    pillar: "P4",
    phase: "closeout",
    title: "Read the attestation, then sign off",
    prompt: "The external firm's attestation letter arrived. State what it asserts and what it explicitly does NOT cover — then close the engagement when the ledger allows it.",
    lookFor: "Attestation Letter doc; the Findings Ledger (all findings must be remediated & validated first).",
    hints: [
      "Scope limitation and nature limitation are the two paragraphs to read twice.",
      "The ledger blocks sign-off until every finding is remediated and validated.",
      "Asserts: cardholder-environment controls effective for the period. Not covered: the marketing cloud app — and it is no guarantee.",
    ],
    parts: [
      {
        id: "asserts",
        kind: "choice",
        label: "What does the attestation assert?",
        options: [
          "Halcyon cannot suffer any security incident that period",
          "Cardholder-environment controls were effective during the review period",
          "Every system in the credit union is secure",
        ],
        solution: "Cardholder-environment controls were effective during the review period",
        rejects: {
          "Halcyon cannot suffer any security incident that period": "The letter's nature limitation says exactly the opposite — an attestation is an opinion on controls, not a guarantee.",
        },
      },
      {
        id: "notcovered",
        kind: "choice",
        label: "Which is explicitly NOT covered?",
        options: ["The cardholder data environment", "The review period", "The marketing cloud application"],
        solution: "The marketing cloud application",
      },
      {
        id: "signoff",
        kind: "state",
        label: "Engagement signed off (ledger clear)",
        flags: ["signoff"],
      },
    ],
    feedback:
      "An attestation is a signed professional opinion — scoped to the cardholder environment, bounded to the review period, and explicitly not a guarantee of future security. Reading scope and nature limitations is a core auditor skill, and blocking sign-off until the ledger clears is what makes the closing report defensible.",
  },

  // ================= HARD =================
  {
    id: "H1",
    mode: "hard",
    pillar: "P2",
    phase: "briefing",
    title: "Triage the intake tray",
    prompt: "Six items landed in the assurance intake tray — some are noise. For each, choose the activity type AND the driver. Wrong cells will be rejected with a reason.",
    hints: [
      "One of the six is not an audit, assessment, review or test at all — and it is still a legitimate assurance activity, just a different objective's territory.",
      "Named mandates (PCI DSS, GLBA, a regulator) are compliance-driven; frameworks adopted voluntarily are best practice.",
    ],
    parts: [
      {
        id: "type",
        kind: "choices",
        label: "Activity type",
        items: [
          { id: "t1", label: "Annual PCI DSS assessment of the cardholder environment by a certified external assessor." },
          { id: "t2", label: "CIS Benchmark configuration review by Halcyon IT staff, adopted as good practice." },
          { id: "t3", label: "GLBA regulatory examination conducted by banking regulators." },
          { id: "t4", label: "Internal audit verifies user access lists against the access control policy, required by our regulator." },
          { id: "t5", label: "A consultant runs a two-week maturity assessment against NIST CSF; no law mandates it." },
          { id: "t6", label: "The CISO commissions a red-team vs blue-team cyber exercise." },
        ],
        itemOptions: ["Audit", "Assessment", "Review", "Testing", "Exercise (not 5.5)"],
        itemSolution: { t1: "Assessment", t2: "Assessment", t3: "Audit", t4: "Audit", t5: "Assessment", t6: "Exercise (not 5.5)" },
        rejects: {
          "t1:Audit": "PCI DSS validation is an evaluation of posture and controls — an assessment. The word is in the item itself.",
          "t3:Assessment": "A regulator's examination checks practice against binding rules — that is an audit.",
          "t6:Audit": "A red-vs-blue engagement is an exercise — adjacent to this lesson but governed elsewhere in SY0-801.",
        },
      },
      {
        id: "driver",
        kind: "choices",
        label: "Driver",
        items: [
          { id: "t1", label: "PCI DSS cardholder assessment" },
          { id: "t2", label: "CIS Benchmark review" },
          { id: "t3", label: "GLBA examination" },
          { id: "t4", label: "Regulator-required access audit" },
          { id: "t5", label: "NIST CSF maturity assessment" },
          { id: "t6", label: "Red vs blue exercise" },
        ],
        itemOptions: ["Compliance-driven", "Best-practice-driven", "N/A — not a 5.5 engagement"],
        itemSolution: {
          t1: "Compliance-driven",
          t2: "Best-practice-driven",
          t3: "Compliance-driven",
          t4: "Compliance-driven",
          t5: "Best-practice-driven",
          t6: "N/A — not a 5.5 engagement",
        },
        rejects: {
          "t5:Compliance-driven": "The item says no law mandates it — a voluntary framework adoption is best practice.",
        },
      },
    ],
    feedback:
      "Six items, one clean triage: PCI DSS and GLBA are compliance-driven; CIS and NIST CSF adoptions are best practice; and the red/blue exercise is a deliberate red herring — it is a legitimate assurance activity, but in SY0-801 it does not live under 5.5. Scope discipline is the skill being graded here.",
  },
  {
    id: "H2",
    mode: "hard",
    pillar: "P3",
    phase: "fieldwork",
    title: "The charter sampling, under pressure",
    prompt: "Build the exact test sample from the population — the charter governs, and this time the desk is full of pressure and noise (a draft amendment, a skip request). Also name the sampling method.",
    hints: [
      "Only documents APPROVED by the Audit Committee change the sample. Read the amendment's status line.",
    ],
    parts: [
      {
        id: "sample",
        kind: "set",
        label: "Select the exact sample (population table below)",
        solutionSet: ["adm-jharper", "adm-ltruong", "adm-oknight", "adm-rvasquez", "EMP-110", "EMP-120"],
        rejects: {
          set: "Charter §3 stands: privileged ALL, standard every-10th-by-ID (EMP-110, EMP-120), terminated and service excluded. The amendment is a DRAFT and the skip email is pressure, not authority.",
        },
      },
      {
        id: "method",
        kind: "text",
        label: "Name the sampling method (one term)",
        placeholder: "e.g. systematic",
        accept: ["systematic", "systematic sampling", "systematic sample"],
        rejects: {
          random: "The charter fixed a systematic rule (every 10th by ID) — not a random draw. Pre-declared method, no gaming.",
          "*": "One term: the charter picks accounts at a fixed interval by employee ID. That method has a standard name.",
        },
      },
    ],
    feedback:
      "You held the line: the charter's systematic sample survives a draft amendment (not approved → no effect) and a skip request (pressure ≠ authority). Sampling method fixed before fieldwork is what makes results defensible — this is the “sampling + charter” pair from the SY0-801 draft sub-bullets, exercised under realistic noise.",
  },
  {
    id: "H3",
    mode: "hard",
    pillar: "P3",
    phase: "testing",
    title: "Reconcile, then record the exception",
    prompt: "Run both control tests again (strict), reconcile the unsigned Q3 row in the re-issued log, and raise the exception memo with the correct ID from the charter's numbering rule.",
    hints: [
      "The charter's §5 gives the memo numbering: EXP-<year>-<case number suffix>. The case number is AUD-2026-114.",
    ],
    parts: [
      {
        id: "runs",
        kind: "state",
        label: "Both test-rig runs executed",
        flags: ["rig-mfa-run", "rig-backup-run"],
      },
      {
        id: "unsigned",
        kind: "choice",
        label: "Log v2 shows a Q3 row with signature “PENDING”. Is the Q3 review complete?",
        options: ["Yes — the row exists, so it happened", "No — an unsigned record proves nothing"],
        solution: "No — an unsigned record proves nothing",
        rejects: {
          "Yes — the row exists, so it happened": "A row added mid-fieldwork with no signature is incomplete evidence — an unsigned record does not prove the control operated.",
        },
      },
      {
        id: "memo",
        kind: "text",
        label: "Enter the exception memo ID you raise for the unsigned Q3 review",
        placeholder: "EXP-…",
        accept: ["exp-2026-114"],
        rejects: {
          "exp-114": "Right pattern, wrong case — the charter suffixes the full case number: AUD-2026-114 → EXP-2026-114.",
          "chg-8841": "CHG-8841 is the firewall change ticket, not an exception memo.",
          "*": "Apply charter §5 numbering to case AUD-2026-114.",
        },
      },
    ],
    feedback:
      "Evidence discipline: a re-issued log with an unsigned Q3 row does not cure the gap — it documents the attempt. You recorded the finding, raised EXP-2026-114 per the charter's own numbering, and kept the test runs as recorded evidence. That chain — observation → finding → numbered exception — is audit-grade documentation.",
  },
  {
    id: "H4",
    mode: "hard",
    pillar: "P3",
    phase: "fieldwork",
    title: "Results-based audit: the MFA report",
    prompt: "Compute the MFA coverage per the charter's definitions (mind the exclusions and the disabled contractors), give the verdict against the threshold, and count the human accounts still unenrolled.",
    hints: [
      "Charter §4: coverage = enrolled ÷ ACTIVE non-excluded accounts. Active excludes service accounts and disabled accounts.",
    ],
    parts: [
      {
        id: "coverage",
        kind: "text",
        label: "Coverage percentage (one decimal)",
        placeholder: "e.g. 90.0",
        accept: ["97.5", "97.5%", "0.975"],
        rejects: {
          "93.6": "You used all 250 accounts as the denominator — the charter excludes the 10 service accounts (and the 5 disabled contractors were never active).",
          "95.0": "That is the threshold, not the measured coverage. Compute enrolled ÷ (active − excluded).",
          "*": "Enrolled (234) ÷ active non-excluded (250 − 10 = 240) → one decimal.",
        },
      },
      {
        id: "verdict",
        kind: "choice",
        label: "Verdict against the ≥95% charter threshold",
        options: ["Pass — the threshold is met", "Fail — the threshold is missed"],
        solution: "Pass — the threshold is met",
        rejects: { "Fail — the threshold is missed": "97.5% ≥ 95% — the threshold is met. The residual gap is still a finding, but the threshold verdict is a pass." },
      },
      {
        id: "human",
        kind: "text",
        label: "How many ACTIVE human accounts remain unenrolled?",
        placeholder: "a number",
        accept: ["6", "six"],
        rejects: {
          "16": "You counted the 5 disabled contractors too — they are not active accounts per the charter.",
          "*": "Count the unenrolled list in the MFA report — only active accounts.",
        },
      },
    ],
    feedback:
      "Results-based auditing in one exercise: 234 enrolled ÷ 240 active non-excluded = 97.5% — the threshold passes, yet six humans (two of them helpdesk) remain outside the control. A result can be compliant and still leave real risk; saying both precisely is the point of the results-based lens.",
  },
  {
    id: "H5",
    mode: "hard",
    pillar: "P3",
    phase: "charter",
    title: "Reference sources, no scaffolding",
    prompt: "Five framing questions from assessment planning. Match each to its reference source — including “none of the three” when none applies.",
    hints: [
      "Ask what the question is ABOUT: behaviors → ATT&CK; stages → Kill Chain; relationships in one incident → Diamond; baselines → none of them.",
    ],
    parts: [
      {
        id: "refs",
        kind: "choices",
        label: "Match question to reference source",
        items: [
          { id: "q1", label: "“Which adversary behaviors and techniques does our monitoring actually cover?”" },
          { id: "q2", label: "“Do we have detection points across every stage from recon to exfiltration?”" },
          { id: "q3", label: "“For this one incident, how do adversary, capability and infrastructure connect?”" },
          { id: "q4", label: "“Our routers should follow CIS hardening benchmarks — which reference source applies?”" },
          { id: "q5", label: "“After a phishing case, which source helps us articulate the adversary's known techniques for future coverage?”" },
        ],
        itemOptions: ["MITRE ATT&CK", "Cyber Kill Chain", "Diamond Model", "None of the three"],
        itemSolution: { q1: "MITRE ATT&CK", q2: "Cyber Kill Chain", q3: "Diamond Model", q4: "None of the three", q5: "MITRE ATT&CK" },
        rejects: {
          "q5:Cyber Kill Chain": "Known adversary TECHNIQUES is ATT&CK's catalog; the Kill Chain stages an intrusion, it does not catalog techniques.",
        },
      },
    ],
    feedback:
      "Without scaffolding: behaviors and known techniques → MITRE ATT&CK; stage coverage → Cyber Kill Chain; single-incident relationships → Diamond Model; and hardening benchmarks belong to their own catalogue, not to the three reference sources named in the SY0-801 draft. That's the full discrimination set.",
  },
  {
    id: "H6",
    mode: "hard",
    pillar: "P4",
    phase: "closeout",
    title: "Adjudicate, then close in order",
    prompt: "Five findings. Adjudicate each (remediate / accept with documented exception / escalate), then put the four closing steps in the required order.",
    hints: [
      "Escalation is for the unexpected and potentially serious (a possible unauthorized admin session). Acceptance needs a compensating control and a memo. Everything else is remediated.",
    ],
    parts: [
      {
        id: "adj",
        kind: "choices",
        label: "Adjudicate each finding",
        items: [
          { id: "F-01", label: "F-01 · Firewall rule 12 does not match approved ticket CHG-8841." },
          { id: "F-02", label: "F-02 · Q3 access review unsigned — evidence incomplete." },
          { id: "F-03", label: "F-03 · Six active staff not enrolled in MFA (coverage passes, gap remains)." },
          { id: "F-04", label: "F-04 · Legacy teller terminal cannot run MFA; locked VLAN + CCTV compensate; no RTO impact." },
          { id: "F-05", label: "F-05 · Fieldwork surfaced a possible unauthorized admin session." },
        ],
        itemOptions: ["Remediate (fix it)", "Accept (documented exception)", "Escalate (raise it)"],
        itemSolution: {
          "F-01": "Remediate (fix it)",
          "F-02": "Remediate (fix it)",
          "F-03": "Remediate (fix it)",
          "F-04": "Accept (documented exception)",
          "F-05": "Escalate (raise it)",
        },
        rejects: {
          "F-05:Remediate (fix it)": "A possible unauthorized admin session is bigger than a config fix — it goes to the audit committee and the incident process. Escalate.",
          "F-04:Remediate (fix it)": "The terminal cannot take MFA; the compensating control is documented and the memo expires. That is acceptance with an exception, not remediation.",
        },
      },
      {
        id: "seq",
        kind: "order",
        label: "Order the closing steps",
        items: [
          { id: "c-rem", label: "Remediation performed (or exception memo filed)" },
          { id: "c-val", label: "Validation re-test with recorded evidence" },
          { id: "c-led", label: "Findings ledger updated" },
          { id: "c-att", label: "Attestation review & closing report signed" },
        ],
        solutionOrder: ["c-rem", "c-val", "c-led", "c-att"],
        rejects: { sequence: "Fix first, prove the fix second, write it down third, sign last. A signature before evidence is theater." },
      },
    ],
    feedback:
      "Adjudication is triage: fix what can be fixed, accept what is constrained (with a compensating control and a numbered memo), escalate what smells like an incident. Then the closing order is fixed — remediate, validate, ledger, sign — because a signature only means something when it comes after evidence.",
  },
  {
    id: "H7",
    mode: "hard",
    pillar: "P4",
    phase: "closeout",
    title: "Attestation boundaries, three parts",
    prompt: "Read the attestation letter and the committee's file. Answer all three parts exactly.",
    hints: [
      "The letter has two “limitation” paragraphs; the committee file has a separate one-page declaration.",
    ],
    parts: [
      {
        id: "asserts",
        kind: "choice",
        label: "What does the attestation assert?",
        options: [
          "Every system in the credit union is secure",
          "Halcyon cannot suffer any security incident that period",
          "Cardholder-environment controls were effective during the review period",
        ],
        solution: "Cardholder-environment controls were effective during the review period",
      },
      {
        id: "notcovered",
        kind: "choice",
        label: "Which is explicitly NOT covered?",
        options: ["The marketing cloud application", "The cardholder data environment", "The review period"],
        solution: "The marketing cloud application",
        rejects: {
          "The cardholder data environment": "That is the only thing it DOES cover — read the scope limitation paragraph again.",
        },
      },
      {
        id: "independence",
        kind: "choice",
        label: "Which document evidences the assessor's independence?",
        options: [
          "The attestation letter itself",
          "The assessor independence declaration",
          "Halcyon's internal audit charter",
        ],
        solution: "The assessor independence declaration",
        rejects: {
          "Halcyon's internal audit charter": "The charter authorizes YOUR internal team — it says nothing about the external firm's independence.",
        },
      },
    ],
    feedback:
      "Three boundaries, three answers: the attestation asserts effective controls in the cardholder environment for the period; the marketing cloud application is explicitly out of scope; and the firm's independence is evidenced by its own declaration — not by the opinion it produces. Those boundaries are exactly what an exam question hides in the wording.",
  },
  {
    id: "H8",
    mode: "hard",
    pillar: "P2",
    phase: "closeout",
    title: "Scope discipline",
    prompt: "The close-out ledger collected seven items this season. Exactly two of them do NOT belong in this ITGC audit's ledger per the charter. Select those two.",
    hints: [
      "Charter §2 lists what is out of scope — one item is an availability incident, one belongs to a different exam objective entirely.",
    ],
    parts: [
      {
        id: "out",
        kind: "set",
        label: "Select the two out-of-scope ledger items",
        items: [
          { id: "F-01", label: "F-01 · Firewall rule 12 does not match approved ticket CHG-8841" },
          { id: "F-02", label: "F-02 · Q3 access review unsigned — evidence incomplete" },
          { id: "F-03", label: "F-03 · Six active staff not enrolled in MFA" },
          { id: "F-04", label: "F-04 · Backup restore took 9.5 h against a 4 h RTO" },
          { id: "F-05", label: "F-05 · Possible unauthorized admin session surfaced in fieldwork" },
          { id: "NOISE-1", label: "NOISE-1 · Branch printer outage INC-2026-041" },
          { id: "NOISE-2", label: "NOISE-2 · Marketing vendor contract review (Meridian Swag Co.)" },
        ],
        solutionSet: ["NOISE-1", "NOISE-2"],
        rejects: {
          set: "Charter §2: penetration-test report review and third-party vendor matters are outside this ITGC audit; the printer outage is an ops availability incident, not an ITGC finding. The firewall, access-review, MFA, RTO and admin-session items are all in scope.",
        },
      },
    ],
    feedback:
      "Scope discipline is a defensive skill: the printer outage belongs to operations, and the vendor contract belongs to third-party risk management (SY0-801 objective 5.3 material). Everything else in the ledger maps to the charter's scope section. A finding in the wrong ledger is how audits lose credibility.",
  },
  {
    id: "H9",
    mode: "hard",
    pillar: "P1",
    phase: "closeout",
    title: "The closing contrast",
    prompt: "Your closing report opens with a compare-and-contrast paragraph. Exactly five of the eight statements are true and belong in it — select those five.",
    hints: [
      "Two statements promise too much (guarantees, “no re-test needed”) and one lets the method drift mid-fieldwork — those cannot be true.",
    ],
    parts: [
      {
        id: "closing",
        kind: "set",
        label: "Select exactly the five true statements",
        items: [
          { id: "st1", label: "An audit compares evidence against a documented standard." },
          { id: "st2", label: "An assessment evaluates control effectiveness and risk more broadly." },
          { id: "st3", label: "An attestation guarantees the organization will not suffer a breach." },
          { id: "st4", label: "External engagements carry more independence than self-assessments." },
          { id: "st5", label: "Compliance-driven work is triggered by laws, regulators or contracts; best-practice work is voluntary." },
          { id: "st6", label: "Sampling rules may be changed mid-fieldwork if the budget changes." },
          { id: "st7", label: "Remediation is complete when the fix is deployed — no re-test needed." },
          { id: "st8", label: "MITRE ATT&CK, the Cyber Kill Chain and the Diamond Model can frame adversary-focused coverage in assessments." },
        ],
        solutionSet: ["st1", "st2", "st4", "st5", "st8"],
        rejects: {
          set: "True: st1, st2, st4, st5, st8. False: attestation as guarantee (st3), mid-fieldwork sampling changes (st6), no re-test needed (st7).",
        },
      },
    ],
    feedback:
      "The closing paragraph you built IS objective 5.5: audit = evidence against a documented standard; assessment = broader effectiveness and risk; external beats self-assessment on independence; compliance is mandated while best practice is voluntary; and ATT&CK, Kill Chain and Diamond frame adversary coverage. The three false statements are the classic distractors — guarantees, drifting methods, skipped validation.",
  },
];

// ---------- knowledge checks (Medium 6 / Hard 7) ----------
// R4: correct-answer positions rotate across items (Medium: C,A,D,B,C,A · Hard: B,D,A,C,D,A,C)
// R5: options are length-matched (correct never the longest, within one word of distractors)
LAB_DATA.QUIZ_MEDIUM = [
  {
    q: "What is the core difference between an audit and an assessment?",
    options: [
      "An audit is done only by outsiders; an assessment only by in-house teams",
      "The two terms are synonyms; the exam treats both words as one activity",
      "An audit compares state to a written standard; an assessment evaluates risk",
      "Audits produce signed attestations only, while assessments produce formal risk registers only",
    ],
    answer: 2,
    topic: "Audit vs assessment",
    explain:
      "The anchor for every 5.5 question: audits measure state against a written standard, assessments evaluate effectiveness and risk broadly. Option A is wrong because who performs the work is not the dividing line — internal assessments exist. Option B is wrong because the exam explicitly contrasts them. Option D swaps the outputs — attestations come from external assurance, not every audit.",
  },
  {
    q: "Why do regulators trust an external audit more than an internal one?",
    options: [
      "Independence — the external firm has no stake in the reported outcome",
      "External auditors are always more technical than the internal audit team",
      "External audits take far less time than the internal quarterly reviews",
      "Internal auditors cannot read the logs or configure the security tooling",
    ],
    answer: 0,
    topic: "Internal vs external",
    explain:
      "Independence is the dividing line. Option B is wrong — technical skill is not the axis (internal teams are often deeply technical). Option C is wrong — external engagements usually take longer. Option D is an insult to internal auditors, who read logs constantly; the point is that they report on their own employer.",
  },
  {
    q: "What is an attestation?",
    options: [
      "A checklist the IT team fills in about its own controls",
      "A training certificate that auditors earn after passing their board exam",
      "A guarantee that no security incident will occur during the period",
      "A signed auditor opinion that controls were effective for a period",
    ],
    answer: 3,
    topic: "Attestation",
    explain:
      "Three ingredients: a qualified, independent auditor; a signature; and a defined scope and period. Option A describes a self-assessment, not an attestation. Option B confuses assurance with certification. Option C is exactly what the letter's nature limitation disclaims — an opinion, never a guarantee.",
  },
  {
    q: "Why is the sampling method fixed before fieldwork begins?",
    options: [
      "To save the audit team's travel budget and fieldwork hours",
      "So results cannot be gamed — the pre-declared method stays reproducible",
      "So the sample can be quietly expanded if findings look bad",
      "Because regulators forbid auditors from ever changing a filed plan",
    ],
    answer: 1,
    topic: "Sampling & charter",
    explain:
      "Method before data: a sample chosen after seeing partial results can be steered. Option C describes the exact gaming the rule prevents. Option A is a non-sequitur. Option D overstates — amendments are allowed, but only when APPROVED by the Audit Committee before fieldwork, as you enforced in the sampling objective.",
  },
  {
    q: "What is the difference between functional and behavioral testing?",
    options: [
      "Functional is run by machines, while behavioral is always run by humans",
      "Functional happens monthly, and behavioral happens once a year at most",
      "Functional checks the design works; behavioral checks behavior under real stress",
      "There is no difference — the two names describe the same test",
    ],
    answer: 2,
    topic: "Functional & behavioral testing",
    explain:
      "You ran both in the rig: MFA denying a login without OTP is functional (as designed); the backup resuming after a link failure — but alerting three minutes late — is behavioral (as stressed). Option A is wrong (both are executed by people or tooling). Option C's cadence claim is invented. The delay is an observation worth recording even on a pass.",
  },
  {
    q: "Which reference source catalogs adversary techniques to frame coverage?",
    options: [
      "MITRE ATT&CK",
      "The audit charter",
      "CIS Benchmarks",
      "The general ledger",
    ],
    answer: 0,
    topic: "Reference sources",
    explain:
      "The SY0-801 draft names three reference sources: MITRE ATT&CK (adversary tactics & techniques), the Cyber Kill Chain (intrusion stages), and the Diamond Model (incident relationships). The audit charter authorizes your engagement, CIS Benchmarks are configuration baselines, and the general ledger is accounting — none catalogs adversary techniques.",
  },
];

LAB_DATA.QUIZ_HARD = [
  {
    scenario: "Fieldwork excerpt — helpdesk lead: “I can't recall a September review.” Sysadmin: “Q3 was done, I signed it.” The re-issued log shows a Q3 row with signature: PENDING.",
    q: "What does disciplined fieldwork conclude?",
    options: [
      "The sysadmin's confidence outweighs the log; Q3 counts as complete",
      "The unsigned row is incomplete evidence, so the finding stands",
      "Discard both interviews as hearsay and close the review finding",
      "Ask the sysadmin to sign the row now and move on",
    ],
    answer: 1,
    topic: "Interviews & evidence",
    explain:
      "Records decide, and an unsigned record added mid-fieldwork documents the attempt, not the control. Option D destroys the evidence chain — a retroactive signature proves nothing. Option C throws away leads that records corroborate. The finding stays; remediation is a retrospective signed review.",
  },
  {
    scenario: "The CIO reads the attestation letter and tells the board: “We're certified secure for the year.”",
    q: "What is the correct reading of the attestation?",
    options: [
      "The CIO is right — attestation means certified secure for the year",
      "The attestation covers the whole union because it is signed externally",
      "Attestations expire only when the underlying controls change in some way",
      "A scoped opinion on one environment for a fixed review period",
    ],
    answer: 3,
    topic: "Attestation",
    explain:
      "Scope limitation + nature limitation: cardholder environment, Jan–Sep 2026, opinion not guarantee. Option A is the exact misreading an exam scenario dangles — and a real board-deck danger. Option B ignores the scope limitation; Option C invents an expiry rule that does not exist.",
  },
  {
    scenario: "A charter amendment (approved this time) sets a systematic sample of every 25th account over 200 standard accounts.",
    q: "How many standard accounts are in the sample?",
    options: ["8 accounts", "20 accounts", "4 accounts", "200 accounts"],
    answer: 0,
    topic: "Sampling & charter",
    explain:
      "200 ÷ 25 = 8. Systematic sampling picks at a fixed interval — deterministic, reproducible, and stated in the plan before fieldwork. With every-10th over the same 200 it would be 20; the interval is whatever the approved charter says.",
  },
  {
    scenario: "The backup job ran exactly per its documented schedule and procedure — and a restore drill still took 9.5 hours against a 4-hour RTO.",
    q: "Which lens produces the finding, and what kind is it?",
    options: [
      "Rule-based — the documented backup schedule itself was wrong somewhere in it",
      "No finding at all — the documented procedure was followed exactly as written",
      "Results-based — the rules were followed but the outcome missed the target",
      "An attestation finding — the letter must be re-signed for the period",
    ],
    answer: 2,
    topic: "Rule vs results",
    explain:
      "When practice matches the rule but the measured result misses the goal, that is the results-based lens — the RTO is the outcome metric. Option A looks for a rule that was never broken. Option B confuses procedural compliance with control effectiveness. Option D misuses 'attestation' entirely.",
  },
  {
    scenario: "A remediation team deploys the corrected firewall config at 14:00 and asks to close finding F-01 the same afternoon.",
    q: "What must happen before the finding is closed?",
    options: [
      "Nothing — the deployment timestamp is proof enough for the ledger",
      "The auditor signs the ledger now and re-tests later if convenient",
      "The change ticket is amended so it matches the deployed config",
      "A validation re-test with recorded evidence, then ledger update and closing",
    ],
    answer: 3,
    topic: "Remediation & validation",
    explain:
      "The closing order is fixed: remediate → validate (with evidence) → ledger → sign. Option B inverts the order — a signature only means something when it comes after evidence. Option C defeats change control by rewriting the approval to match drift.",
  },
  {
    scenario: "After a phishing incident, the assessment team must show how the adversary, their tooling and the staging server relate to each other.",
    q: "Which reference source fits this question?",
    options: [
      "The Diamond Model",
      "The Cyber Kill Chain",
      "MITRE ATT&CK",
      "The audit charter",
    ],
    answer: 0,
    topic: "Reference sources",
    explain:
      "One incident, four connected vertices (adversary, capability, infrastructure, victim) — that is the Diamond Model. Stage coverage would be the Kill Chain; known-technique coverage would be ATT&CK; the charter authorizes the engagement but models nothing.",
  },
  {
    scenario: "The close-out ledger contains: a firewall/ticket mismatch, an unsigned quarterly review, a marketing vendor contract review, a branch printer outage, and an MFA enrollment gap.",
    q: "Which items belong in THIS ITGC audit's ledger?",
    options: [
      "Only the vendor contract and the printer outage belong there",
      "All five items belong — a ledger collects everything found in fieldwork",
      "The firewall, review and MFA items — vendor and printer belong elsewhere",
      "Only the MFA gap — config findings belong to a different audit",
    ],
    answer: 2,
    topic: "Scope discipline",
    explain:
      "The charter's §2 draws the boundary: vendor matters belong to third-party risk management (objective 5.3 material) and availability incidents to operations. Option B is how audits lose credibility — findings in the wrong ledger. The same skill the intake-tray objective graded.",
  },
];

// pillars (labels used across masthead, rubric, field report)
LAB_DATA.PILLAR_LABEL = {
  P1: "Understand",
  P2: "Recognize / Analyze",
  P3: "Detect · Auditor's craft",
  P4: "Respond · Close the loop",
};
LAB_DATA.PILLAR_SHORT = {
  P1: "Understand",
  P2: "Recognize",
  P3: "Evidence & Test",
  P4: "Respond",
};
LAB_DATA.PILLAR_STYLE = {
  P1: { bg: "#E7EFE9", fg: "#1E5B3F" },
  P2: { bg: "#F3E9DA", fg: "#B4690E" },
  P3: { bg: "#EDE7D8", fg: "#6B5D2E" },
  P4: { bg: "#F0E3E0", fg: "#9C2F26" },
};

// control-test rigs (staged terminal output)
LAB_DATA.RIGS = [
  {
    flag: "rig-mfa-run",
    title: "Rig A — MFA functional test",
    kind: "functional · as designed",
    intro: "Attempt a privileged admin login with the correct password but no second factor. A working MFA control must DENY the attempt.",
    lines: [
      "[SIM] login attempt: adm-jharper · password accepted (factor 1)",
      "[SIM] second factor challenge: none presented",
      "[SIM] policy check: privileged account → MFA mandatory",
      "[SIM] RESULT: AUTH DENIED — OTP required (MFA enforced)",
    ],
  },
  {
    flag: "rig-backup-run",
    title: "Rig B — Backup behavioral drill",
    kind: "behavioral · under stress",
    intro: "Cut the WAN link to the vault mid-job. A resilient control should alert and resume — measure how it actually behaves.",
    lines: [
      "[SIM] 02:14 nightly backup job starts → vault path primary",
      "[SIM] 02:19 simulated WAN link failure to vault",
      "[SIM] 02:22 alert raised to ops channel (3-minute delay)",
      "[SIM] 02:31 job resumes on backup path · checksum verified",
    ],
  },
];

