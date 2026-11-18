// ============================================================================
// Meridian Atelier — Static Lab Data
// CompTIA Security+ (SY0-801) — Lesson 5.4
// All data is synthetic, fictional and labeled as training material.
//
// This file is the single source of truth for all lab content: regulations,
// frameworks, scenarios, glossary, quiz bank (with all audit fixes applied),
// and debrief. Logic lives in the other js/*.js files.
// ============================================================================

(function (global) {
  'use strict';

  // ------------------------------------------------------------------
  // Glossary (15 terms)
  // ------------------------------------------------------------------
  const GLOSSARY = [
    { id: 'g-regcomp',  term: 'Regulatory compliance', short: 'Meeting standards mandated by law.',
      long: 'The process of meeting standards created by regulations, laws, or binding third-party agreements. Non-compliance can carry fines, incarceration, license loss, or contract breach.' },
    { id: 'g-framework', term: 'Compliance framework', short: 'Voluntary organized control set.',
      long: 'A voluntary, organized set of controls and best practices (e.g., NIST CSF, ISO/IEC 27001, CIS Controls, COBIT) used to structure a security program. Adopting one is not legally required but strongly supports regulatory compliance.' },
    { id: 'g-due-diligence', term: 'Due diligence', short: 'Proactive research before acting.',
      long: 'The proactive assessment and research done before committing to an action — for example, evaluating a vendor\'s security posture before signing a contract.' },
    { id: 'g-due-care', term: 'Due care', short: 'Reasonable ongoing steps.',
      long: 'The ongoing, reasonable steps an organization takes to protect assets and act responsibly — what a prudent peer would do in the same situation.' },
    { id: 'g-attestation', term: 'Attestation', short: 'Formal declaration of truth.',
      long: 'A formal declaration — usually signed by an executive or auditor — that something is true or has been done (e.g., a SOC 2 attestation, an executive attestation of internal controls).' },
    { id: 'g-ack', term: 'Acknowledgment', short: 'Signed confirmation of a policy.',
      long: 'A formal, usually signed, confirmation that a user has received and understood a policy (e.g., signing the AUP at onboarding).' },
    { id: 'g-cco', term: 'Chief Compliance Officer (CCO)', short: 'Executive accountable for compliance.',
      long: 'The executive responsible for the organization\'s overall compliance posture, regulatory monitoring, and the compliance program. Sometimes combined with the CISO role in smaller organizations.' },
    { id: 'g-pii', term: 'PII', short: 'Personally Identifiable Information.',
      long: 'Information that identifies a specific individual — name, SSN, address, email, biometric data, etc. Subject to many privacy laws.' },
    { id: 'g-phi', term: 'PHI', short: 'Protected Health Information.',
      long: 'Health-related personal data covered by HIPAA — diagnoses, treatments, insurance records, anything that ties an individual to health information.' },
    { id: 'g-controller', term: 'Data controller', short: 'Decides why/how data is processed.',
      long: 'The entity that decides the purposes and means of processing personal data. Under GDPR, the controller is accountable for compliance and for choosing compliant processors.' },
    { id: 'g-processor', term: 'Data processor', short: 'Processes data on behalf of controller.',
      long: 'An entity that processes personal data on behalf of a controller (e.g., a SaaS vendor). Processors have direct obligations under GDPR but are not the primary accountable party.' },
    { id: 'g-dsr', term: 'Data subject rights', short: 'GDPR rights over personal data.',
      long: 'Rights an individual holds over their personal data under GDPR: access, rectification, erasure, portability, restriction, objection, and rights related to automated decision-making.' },
    { id: 'g-forgotten', term: 'Right to be forgotten', short: 'Right to erasure (GDPR Art. 17).',
      long: 'The data subject\'s right under GDPR Article 17 to have their personal data erased, subject to exceptions (e.g., legal obligations, freedom of expression, public interest).' },
    { id: 'g-sovereignty', term: 'Data sovereignty', short: 'Data is subject to local laws.',
      long: 'The principle that data is subject to the laws of the country or jurisdiction in which it is stored. Drives data localization decisions and vendor selection.' },
    { id: 'g-inventory', term: 'Data inventory', short: 'Catalog of all data held.',
      long: 'A catalog of all data the organization collects, stores, processes, and shares — with owners, classifications, retention rules, and processing locations. Required for GDPR Article 30 records and most frameworks.' },
  ];

  // ------------------------------------------------------------------
  // Regulations (the regulatory map)
  // ------------------------------------------------------------------
  const REGULATIONS = [
    {
      id: 'r-hipaa', code: 'HIPAA', name: 'Health Insurance Portability and Accountability Act',
      domain: 'health',
      summary: 'US federal law protecting Protected Health Information (PHI). Covered entities and their business associates must safeguard PHI.',
      appliesIf: 'The organization handles health information tied to an individual — providers, health plans, clearinghouses, and their vendors.',
      penaltyBlurb: 'Civil: $100–$50K per violation (tiered, up to $1.5M/year per category). Criminal: up to $50K + 1yr (Tier A), $100K + 5yr (Tier B), $250K + 10yr (Tier C, for profit/sale).',
      referenceUrl: 'https://www.hhs.gov/hipaa/index.html',
    },
    {
      id: 'r-gdpr', code: 'GDPR', name: 'General Data Protection Regulation (EU)',
      domain: 'eu-privacy',
      summary: 'EU regulation governing personal data of EU/EEA residents. Grants data subject rights; binds any organization processing EU personal data.',
      appliesIf: 'The organization processes personal data of EU/EEA residents — regardless of where the organization is headquartered.',
      penaltyBlurb: 'Up to €20M or 4% of global annual turnover, whichever is higher.',
      referenceUrl: 'https://gdpr-info.eu/',
    },
    {
      id: 'r-gba', code: 'GLBA', name: 'Gramm-Leach-Bliley Act',
      domain: 'finance',
      summary: 'US law requiring financial institutions to protect customer data and disclose information-sharing practices (Safeguards Rule, Privacy Rule, Pretexting Rule).',
      appliesIf: 'The organization is a "financial institution" under GLBA — includes banks, lenders, broker-dealers, insurance companies, and many fintech firms.',
      penaltyBlurb: 'Civil penalties up to $100K per violation per day; criminal penalties up to 5 years imprisonment for pretexting offenses.',
      referenceUrl: 'https://www.ftc.gov/legal-library/browse/rules/gramm-leach-bliley-act',
    },
    {
      id: 'r-sox', code: 'SOX', name: 'Sarbanes-Oxley Act (2002)',
      domain: 'public-company',
      summary: 'US law setting auditing and financial reporting requirements for publicly traded companies. Section 404 requires internal controls over financial reporting.',
      appliesIf: 'The organization is publicly traded on a US exchange, or is preparing to file for an IPO.',
      penaltyBlurb: 'Corporate fines; officers face up to 20 years imprisonment for willful certification of false financial reports (Section 906).',
      referenceUrl: 'https://www.sec.gov/about/laws/soa2002.pdf',
    },
    {
      id: 'r-pci', code: 'PCI DSS', name: 'Payment Card Industry Data Security Standard',
      domain: 'card',
      summary: 'Industry-mandated standard for any organization that stores, processes, or transmits cardholder data. Administered by the PCI SSC.',
      appliesIf: 'The organization stores, processes, or transmits payment card data — even one transaction.',
      penaltyBlurb: 'Non-compliance: monthly fines ($5K–$100K), higher interchange fees, potential loss of card-processing privileges.',
      referenceUrl: 'https://www.pcisecuritystandards.org/',
    },
    {
      id: 'r-fisma', code: 'FISMA', name: 'Federal Information Security Modernization Act',
      domain: 'federal',
      summary: 'US law requiring federal agencies and their contractors to implement information security programs aligned with NIST SP 800-53.',
      appliesIf: 'The organization is a federal agency, or a contractor handling federal information/systems on behalf of an agency.',
      penaltyBlurb: 'Loss of federal contracts; agencies face Congressional oversight and OMB reporting requirements.',
      referenceUrl: 'https://csrc.nist.gov/Topics/laws-and-regulations/laws/fisma',
    },
    {
      id: 'r-fedramp', code: 'FedRAMP', name: 'Federal Risk and Authorization Management Program',
      domain: 'federal',
      summary: 'US government program that standardizes security assessment and authorization for cloud products used by federal agencies.',
      appliesIf: 'The organization provides cloud services that federal agencies will use (or that contractors handling federal data will use).',
      penaltyBlurb: 'No direct fines, but lack of authorization blocks federal sales; authorized providers face continuous monitoring obligations.',
      referenceUrl: 'https://www.fedramp.gov/',
    },
  ];

  // Business units of Meridian Health Finance — the regulatory-map matrix rows.
  const BUSINESS_UNITS = [
    {
      id: 'bu-clinic', name: 'Patient Financing (Health)',
      description: 'Stores patient diagnoses, insurance IDs, and treatment plans to underwrite medical loans.',
      applicableRegulations: ['r-hipaa', 'r-gdpr', 'r-sox', 'r-pci', 'r-fisma'],
    },
    {
      id: 'bu-card', name: 'Prepaid Health Card Issuance',
      description: 'Issues prepaid cards used for copays and HSA-eligible purchases; processes card transactions.',
      applicableRegulations: ['r-pci', 'r-gba', 'r-gdpr', 'r-sox'],
    },
    {
      id: 'bu-eu', name: 'EU Customer Portal',
      description: 'Onboarding portal for EU customers; collects identity documents and bank details.',
      applicableRegulations: ['r-gdpr', 'r-pci'],
    },
    {
      id: 'bu-fed', name: 'Federal Health Subsidy Platform',
      description: 'Cloud platform processing federal health-subsidy applications on behalf of HHS.',
      applicableRegulations: ['r-fisma', 'r-fedramp', 'r-hipaa', 'r-gdpr'],
    },
    {
      id: 'bu-ipo', name: 'Corporate Finance (Post-IPO)',
      description: 'Public-company financial reporting function following Meridian\'s recent IPO filing.',
      applicableRegulations: ['r-sox'],
    },
  ];

  // ------------------------------------------------------------------
  // Frameworks (the framework library shelf)
  // ------------------------------------------------------------------
  const FRAMEWORKS = [
    {
      id: 'f-nist', code: 'NIST CSF / SP 800-53', name: 'NIST Cybersecurity Framework & SP 800-53',
      origin: 'US government (NIST). Free, public.',
      bestFor: 'US-headquartered organizations, federal contractors, and any org wanting a free, well-mapped control catalog.',
      pros: ['Free and publicly available', 'Maps cleanly to FISMA/FedRAMP', 'Strong function-based structure (Identify, Protect, Detect, Respond, Recover, Govern)'],
      cons: ['US-centric; less internationally recognized than ISO', 'SP 800-53 is large and complex to scope', 'No formal certification'],
      referenceUrl: 'https://www.nist.gov/cyberframework',
    },
    {
      id: 'f-iso', code: 'ISO/IEC 27001', name: 'ISO/IEC 27001 Information Security Management',
      origin: 'International Standards Organization. Paid standard.',
      bestFor: 'Organizations needing internationally recognized certification, especially those operating across multiple jurisdictions.',
      pros: ['Globally recognized certification', 'Strong management-system focus (ISMS)', 'Customer-trust signal'],
      cons: ['Certification audit cost and time', 'Less prescriptive on individual controls than NIST', 'Standard itself is paid'],
      referenceUrl: 'https://www.iso.org/standard/27001',
    },
    {
      id: 'f-cis', code: 'CIS Controls v8', name: 'Center for Internet Security Controls',
      origin: 'CIS (non-profit, US). Free.',
      bestFor: 'Organizations wanting a prioritized, operational hardening checklist — especially SMBs or orgs without a mature ISMS.',
      pros: ['Highly prescriptive and prioritized', 'Free and easy to map to existing tooling', 'Great for IT/ops teams'],
      cons: ['No formal certification', 'Less governance/policy-oriented', 'IT-heavy; light on privacy program elements'],
      referenceUrl: 'https://www.cisecurity.org/controls',
    },
    {
      id: 'f-cobit', code: 'COBIT 2019', name: 'COBIT (Control Objectives for Information and Related Technologies)',
      origin: 'ISACA. Paid framework.',
      bestFor: 'Organizations needing IT governance alignment with business objectives — common in larger enterprises with strong audit functions.',
      pros: ['Strong IT governance focus', 'Aligns IT with business strategy', 'Excellent for board-level reporting'],
      cons: ['Heavy / complex', 'Less hands-on with operational security controls', 'Paid framework with steeper learning curve'],
      referenceUrl: 'https://www.isaca.org/resources/cobit',
    },
  ];

  // ------------------------------------------------------------------
  // Data classification workbench samples
  // ------------------------------------------------------------------
  const DATA_SAMPLES = [
    { id: 'ds-1', label: 'Patient diagnosis codes + SSN', detail: 'Export from the patient financing database.',
      correctClass: 'restricted', correctKind: 'PHI', rationale: 'PHI tied to identity — HIPAA-regulated; highest sensitivity.' },
    { id: 'ds-2', label: 'Marketing press release (draft)', detail: 'Public announcement of Meridian\'s new clinic partnership.',
      correctClass: 'public', correctKind: 'public-info', rationale: 'Approved for public release; no restriction on disclosure.' },
    { id: 'ds-3', label: 'Customer card numbers (PANs)', detail: 'Stored in the card-issuance system.',
      correctClass: 'restricted', correctKind: 'financial', rationale: 'PCI DSS scope — cardholder data; must be tokenized or encrypted at rest.' },
    { id: 'ds-4', label: 'Source code repository', detail: 'Internal application source for the patient portal.',
      correctClass: 'confidential', correctKind: 'operational', rationale: 'Not customer data but exposing it would aid attackers; limited to engineering.' },
    { id: 'ds-5', label: 'Employee home addresses', detail: 'HR system record for the payroll system.',
      correctClass: 'confidential', correctKind: 'PII', rationale: 'Employee PII; restricted to HR and payroll.' },
    { id: 'ds-6', label: 'Board meeting minutes (pre-IPO)', detail: 'Strategic discussion of the upcoming IPO.',
      correctClass: 'restricted', correctKind: 'secret', rationale: 'Material non-public information; SOX/SEC implications; restricted to board and counsel.' },
    { id: 'ds-7', label: 'EU customer cookie IDs', detail: 'Behavioral analytics on the EU portal.',
      correctClass: 'confidential', correctKind: 'PII', rationale: 'GDPR treats online identifiers as personal data; needs consent and access controls.' },
    { id: 'ds-8', label: 'Vendor contract (CloudVista)', detail: 'Master service agreement + SOC 2 report.',
      correctClass: 'internal', correctKind: 'operational', rationale: 'Internal business document; not customer data but commercially sensitive.' },
    { id: 'ds-9', label: 'Public website product page', detail: 'Public-facing marketing content.',
      correctClass: 'public', correctKind: 'public-info', rationale: 'Intended for public consumption.' },
    { id: 'ds-10', label: 'SOC 2 audit report', detail: 'Confidential third-party audit attestation.',
      correctClass: 'confidential', correctKind: 'operational', rationale: 'NDA-restricted; not for redistribution.' },
    { id: 'ds-11', label: 'Audit log of admin actions', detail: 'SIEM-forwarded privileged session logs.',
      correctClass: 'restricted', correctKind: 'operational', rationale: 'Tampering with audit logs destroys evidence; high integrity requirement.' },
    { id: 'ds-12', label: 'Biometric scan for MFA enrollment', detail: 'Fingerprint template stored for the VPN.',
      correctClass: 'restricted', correctKind: 'PII', rationale: 'Biometric data — irrevocable identifier; treated as the highest PII tier.' },
  ];

  // ------------------------------------------------------------------
  // Vendor risk wall
  // ------------------------------------------------------------------
  const VENDORS = [
    {
      id: 'v-cloudvista', name: 'CloudVista Analytics', role: 'processor',
      dataTouched: 'Aggregated customer analytics from the EU portal — pseudonymized customer IDs, click events.',
      certifications: ['SOC 2 Type II', 'CIS Controls v8 (self-attested)'],
      jurisdiction: 'United States (us-east-1)', adequacyIssue: false,
      breachHistory: 'None reported.',
      redFlags: ['No ISO 27001 certification', 'No formal sub-processor list published'],
      recommendation: 'approve-with-conditions',
      recommendationRationale: 'Approve if CloudVista signs a DPA (GDPR Article 28), publishes a sub-processor list, and supports EU data residency for Meridian\'s EU customers.',
    },
    {
      id: 'v-bielefeld', name: 'Bielefeld Billing Co.', role: 'processor',
      dataTouched: 'Card-payment processing — PANs, billing addresses, transaction amounts.',
      certifications: ['PCI DSS Level 1', 'ISO/IEC 27001', 'GDPR-compliant DPA on file'],
      jurisdiction: 'Germany (EU)', adequacyIssue: false,
      breachHistory: 'One minor incident in 2024 — single-user credential compromise, contained in under 4 hours, no card data exposed.',
      redFlags: [],
      recommendation: 'approve',
      recommendationRationale: 'Fully certified for PCI and ISO; EU-jurisdiction means no adequacy issue; breach history is appropriately managed. Approve.',
    },
    {
      id: 'v-paxroster', name: 'PaxRoster HR', role: 'processor',
      dataTouched: 'Employee PII — names, addresses, government IDs, payroll data.',
      certifications: ['CIS Controls v8 (aligned)'],
      jurisdiction: 'United States, with one sub-processor in a jurisdiction without EU adequacy',
      adequacyIssue: true,
      breachHistory: 'None reported.',
      redFlags: ['No SOC 2 report', 'No ISO 27001', 'Undisclosed offshore sub-processor in a non-adequate country', 'No published DPA template'],
      recommendation: 'reject',
      recommendationRationale: 'Reject until PaxRoster discloses the sub-processor, provides a SOC 2 report or ISO 27001 certification, signs a DPA, and either moves the sub-processor to an adequate jurisdiction or implements Standard Contractual Clauses plus a transfer impact assessment.',
    },
  ];

  // ------------------------------------------------------------------
  // Personnel lifecycle steps
  // ------------------------------------------------------------------
  const PERSONNEL_STEPS = [
    { id: 'ps-nda',        label: 'Sign NDA',                   description: 'Confidentiality agreement covering customer data, source code, and business information.', phase: 'onboarding',  requiredForCompliance: true },
    { id: 'ps-aup',        label: 'Acknowledge AUP',            description: 'Acceptable Use Policy acknowledgment, signed and dated.',                              phase: 'onboarding',  requiredForCompliance: true },
    { id: 'ps-train',      label: 'Complete security training', description: 'Initial security + privacy training (HIPAA, GDPR, PCI as applicable).',              phase: 'onboarding',  requiredForCompliance: true },
    { id: 'ps-access',     label: 'Provision role-based access', description: 'Least-privilege access provisioned by role; manager approval recorded.',            phase: 'onboarding',  requiredForCompliance: true },
    { id: 'ps-bg',         label: 'Background check',           description: 'Pre-employment background check completed for roles with access to PHI/PHI/financial data.', phase: 'onboarding', requiredForCompliance: true },
    { id: 'ps-review',     label: 'Annual access review',       description: 'Re-certify access on role change and at least annually.',                              phase: 'role-change', requiredForCompliance: true },
    { id: 'ps-train2',     label: 'Continuing education',       description: 'Annual refresher training; role-specific updates (e.g., new HIPAA guidance).',         phase: 'role-change', requiredForCompliance: true },
    { id: 'ps-revoke',     label: 'Revoke logical access',      description: 'Disable accounts within 1 hour of termination notification (PHI/PHI/financial roles).', phase: 'offboarding', requiredForCompliance: true },
    { id: 'ps-hw',         label: 'Recover hardware',           description: 'Laptop, MFA tokens, badges, mobile devices returned and audited.',                     phase: 'offboarding', requiredForCompliance: true },
    { id: 'ps-tokens',     label: 'Rotate API tokens / secrets', description: 'Rotate any API tokens, SSH keys, cloud credentials the employee touched.',            phase: 'offboarding', requiredForCompliance: true },
    { id: 'ps-exit',       label: 'Exit interview',             description: 'Conduct exit interview; remind of NDA and AUP post-employment obligations.',           phase: 'offboarding', requiredForCompliance: true },
    { id: 'ps-archive',    label: 'Archive mailbox per retention', description: 'Mailbox and files handled per data-retention schedule and legal holds.',           phase: 'offboarding', requiredForCompliance: true },
  ];

  const PERSONNEL_TICKETS = [
    {
      id: 'pt-1', employee: 'Jordan Wei', role: 'Junior GRC Analyst', phase: 'onboarding',
      completedSteps: ['ps-aup', 'ps-train', 'ps-access', 'ps-bg'], missingStep: 'ps-nda',
      scenarioNotes: 'Manager sped through onboarding to fill the seat. HR recorded the AUP acknowledgment but the NDA is unsigned after 14 days.',
    },
    {
      id: 'pt-2', employee: 'Priya Vasquez', role: 'Senior Database Administrator (Terminated)', phase: 'offboarding',
      completedSteps: ['ps-revoke', 'ps-hw', 'ps-exit', 'ps-archive'], missingStep: 'ps-tokens',
      scenarioNotes: 'Terminated for cause. SOP disabled AD and Okta within 30 minutes and recovered the laptop — but the database rotation ticket for her service-account credentials was never created.',
    },
    {
      id: 'pt-3', employee: 'Marcus Lin', role: 'Compliance Auditor (Role change)', phase: 'offboarding',
      completedSteps: ['ps-nda', 'ps-aup', 'ps-train', 'ps-access', 'ps-bg', 'ps-review', 'ps-train2', 'ps-revoke', 'ps-hw', 'ps-tokens', 'ps-exit', 'ps-archive'],
      missingStep: null,
      scenarioNotes: 'Marcus transferred from Engineering Audit to the new Cloud Audit team. Full lifecycle handoff completed cleanly.',
    },
  ];

  // ------------------------------------------------------------------
  // GDPR data subject rights requests
  // ------------------------------------------------------------------
  const DSR_REQUESTS = [
    {
      id: 'dsr-1', requestType: 'erasure', customerName: 'Tomas Holub', customerCountry: 'Czechia',
      receivedDate: '2026-11-04',
      detail: 'Customer requests deletion of all data Meridian holds about him, citing GDPR Article 17.',
      legalHold: true, processorsInvolved: ['v-cloudvista', 'v-bielefeld'],
      expectedAnswer: ['verify-identity', 'classify-as-controller', 'check-legal-hold', 'notify-processors', 'partial-erasure-with-hold', 'document-decision'],
      redHerrings: ['delete-immediately', 'ignore-because-eu-customer', 'forward-to-vendor-without-dpa'],
    },
    {
      id: 'dsr-2', requestType: 'portability', customerName: 'Aurelie Marchand', customerCountry: 'France',
      receivedDate: '2026-11-06',
      detail: 'Customer requests a machine-readable export of all data Meridian holds, in a structured format.',
      legalHold: false, processorsInvolved: ['v-cloudvista', 'v-bielefeld'],
      expectedAnswer: ['verify-identity', 'classify-as-controller', 'collect-from-processors', 'produce-structured-export', 'deliver-within-30-days', 'document-decision'],
      redHerrings: ['delete-immediately', 'charge-fee-without-basis', 'forward-to-vendor-without-dpa'],
    },
  ];

  // ------------------------------------------------------------------
  // Audit evidence — Hard mode triage
  // ------------------------------------------------------------------
  const AUDIT_EVIDENCE = [
    { id: 'ae-1', title: 'Current SOC 2 Type II report (CloudVista)',
      detail: 'Dated 2026-08-01, covers 12 months, signed by Big-4 auditor. Stored in the vendor risk register.',
      kind: 'real-evidence', explanation: 'Valid, in-date third-party attestation supporting vendor due diligence.' },
    { id: 'ae-2', title: 'Expired PCI DSS Attestation of Compliance',
      detail: 'Card-issuance system AOC dated 2024-09-01; expired 2025-09-01. Still listed as "current" in the policy doc.',
      kind: 'red-herring', explanation: 'Red herring: this is the wrong evidence — it has expired. The learner should reject it as evidence of CURRENT compliance, but flag it as a real gap to remediate.' },
    { id: 'ae-3', title: 'Unsigned NDA (Jordan Wei file)',
      detail: 'PDF in the onboarding folder, dated 14 days after start date. Signature field is blank.',
      kind: 'gap', explanation: 'Real compliance gap — onboarding without an executed NDA.' },
    { id: 'ae-4', title: 'Annual security training roster (2026)',
      detail: '95% completion; 3 employees overdue. CCO follow-up ticket open.',
      kind: 'real-evidence', explanation: 'Real evidence of training program operation. Overdue employees are tracked, not hidden.' },
    { id: 'ae-5', title: 'Data retention schedule (current)',
      detail: 'Documents retention periods per data class; references HIPAA, GLBA, GDPR, PCI. Signed by CCO 2026-06-01.',
      kind: 'real-evidence', explanation: 'Real evidence of a documented retention program.' },
    { id: 'ae-6', title: 'Offboarding SOP v3 (missing token rotation)',
      detail: 'SOP lists account disable, hardware recovery, exit interview. Does NOT include API token/secret rotation.',
      kind: 'gap', explanation: 'Real compliance gap — the Priya Vasquez incident traces directly to this missing step.' },
    { id: 'ae-7', title: 'Marketing blog post about a new product launch',
      detail: 'Press release describing a new card product; tagged "public".',
      kind: 'red-herring', explanation: 'Red herring: not audit evidence at all. A student who flags this as a gap misunderstands classification.' },
    { id: 'ae-8', title: 'DPA with Bielefeld Billing Co.',
      detail: 'Executed Data Processing Agreement dated 2025-04-15; references GDPR Article 28.',
      kind: 'real-evidence', explanation: 'Real evidence of GDPR-compliant processor agreement.' },
  ];

  // ------------------------------------------------------------------
  // Penalty triage scenarios
  // ------------------------------------------------------------------
  const PENALTY_SCENARIOS = [
    {
      id: 'ps-1',
      scenario: 'An analyst accidentally emails a spreadsheet of 500 patient records to an internal distribution list. The analyst did not know the list contained external recipients. The breach was self-detected and reported within 4 hours.',
      actorIntent: 'unknown', recordsAffected: 500,
      correctTier: 'civil-1',
      correctTierLabel: 'HIPAA Civil Penalty — Tier 1 (no knowledge, $100–$50K per violation)',
      rationale: 'Tier 1: the analyst did not know and, by exercising reasonable diligence, would not have known. Civil penalty only.',
    },
    {
      id: 'ps-2',
      scenario: 'A DBA sells 10,000 patient records to a marketing firm for $5,000.',
      actorIntent: 'sale-or-profit', recordsAffected: 10000,
      correctTier: 'criminal-c',
      correctTierLabel: 'HIPAA Criminal Penalty — Tier C ($250K + up to 10 years)',
      rationale: 'Tier C: committed for personal gain, profit, or commercial advantage. Highest criminal tier.',
    },
    {
      id: 'ps-3',
      scenario: 'A clinic knows its access controls are inadequate (after three audit findings) but does not remediate. 200 records are exposed in a breach.',
      actorIntent: 'willful-neglect-uncorrected', recordsAffected: 200,
      correctTier: 'civil-4',
      correctTierLabel: 'HIPAA Civil Penalty — Tier 4 (willful neglect, uncorrected, $50K–$1.5M per category per year)',
      rationale: 'Tier 4: willful neglect that was not corrected within the required time. Highest civil tier.',
    },
  ];

  // ------------------------------------------------------------------
  // Retention schedule puzzle
  // ------------------------------------------------------------------
  const RETENTION_RULES = [
    {
      id: 'rr-1', dataType: 'Adult patient medical records', regulation: 'HIPAA (state laws may extend)',
      correctRetention: '6 years from creation or last effective date',
      correctDestruction: 'Shred / pulverize paper; NIST SP 800-88 Clear/Purge on electronic media',
      options: ['1 year', '3 years', '6 years from creation or last effective date', 'Permanently retain'],
      destructionOptions: ['Discard in standard recycling', 'Shred / pulverize paper; NIST SP 800-88 Clear/Purge on electronic media', 'Delete the file but leave the media', 'Sell used drives on secondary market'],
    },
    {
      id: 'rr-2', dataType: 'Cardholder data (PANs)', regulation: 'PCI DSS',
      correctRetention: 'Do not retain unless there is a documented business need; if retained, truncate or tokenize',
      correctDestruction: 'Crypto-shred (destroy the encryption keys) or NIST SP 800-88 Purge',
      options: ['1 year', 'Retain in plaintext for 7 years for audits', 'Do not retain unless there is a documented business need; if retained, truncate or tokenize', 'Permanently retain for marketing'],
      destructionOptions: ['Delete the file but leave the keys', 'Crypto-shred (destroy the encryption keys) or NIST SP 800-88 Purge', 'Standard file delete', 'Format the disk only'],
    },
    {
      id: 'rr-3', dataType: 'EU customer personal data after the retention period expires', regulation: 'GDPR Article 5(1)(e) + Article 17',
      correctRetention: 'Erase when the purpose is fulfilled unless a longer retention is required by law',
      correctDestruction: 'NIST SP 800-88 Purge across all processors; notify sub-processors',
      options: ['Retain indefinitely for analytics', 'Erase when the purpose is fulfilled unless a longer retention is required by law', '7 years regardless of purpose', '10 years for "marketing purposes"'],
      destructionOptions: ['Move to a cheaper storage tier', 'NIST SP 800-88 Purge across all processors; notify sub-processors', 'Just delete the production copy', 'Mark as archived but keep the backup'],
    },
  ];

  // ------------------------------------------------------------------
  // Data inventory map
  // ------------------------------------------------------------------
  const INVENTORY_RECORDS = [
    { id: 'ir-1', dataType: 'Patient financing application (PHI + financial)', source: 'Collected via the patient portal',
      correctController: 'Meridian Health Finance', correctProcessor: 'v-cloudvista', correctSharing: ['v-cloudvista'], correctClass: 'restricted' },
    { id: 'ir-2', dataType: 'Card transactions (PANs)', source: 'Card-issuance system',
      correctController: 'Meridian Health Finance', correctProcessor: 'v-bielefeld', correctSharing: ['v-bielefeld'], correctClass: 'restricted' },
    { id: 'ir-3', dataType: 'Employee payroll data', source: 'HR system',
      correctController: 'Meridian Health Finance', correctProcessor: 'v-paxroster', correctSharing: ['v-paxroster'], correctClass: 'confidential' },
    { id: 'ir-4', dataType: 'Marketing analytics on public website', source: 'Public website (no login)',
      correctController: 'Meridian Health Finance', correctProcessor: 'none', correctSharing: [], correctClass: 'public' },
  ];

  // ------------------------------------------------------------------
  // Knowledge check quiz — WITH ALL AUDIT FIXES APPLIED
  //   * R3: only selected option highlighted (correct NOT revealed on wrong)
  //   * R4: correct-answer position rotates across all 4 indices in both modes
  //   * R5: correct answer is never the longest option (chars or words)
  //   * R6: not applicable (no pairing in quiz)
  // ------------------------------------------------------------------
  const QUIZ = [
    // Medium (7 items) — correctIndex rotation: 1, 0, 2, 3, 1, 2, 2
    {
      id: 'q-1', mode: 'medium', pillar: 'P1',
      question: 'Which of the following is a *regulatory* compliance obligation (mandated by law) rather than a voluntary framework?',
      options: ['CIS Controls v8', 'HIPAA', 'COBIT 2019', 'ISO/IEC 27001'],
      correctIndex: 1,
      explanation: 'HIPAA is a US federal law — non-compliance carries legal penalties. ISO 27001, CIS Controls, and COBIT are voluntary frameworks that *support* compliance but are not themselves mandated by law.',
    },
    {
      id: 'q-2', mode: 'medium', pillar: 'P1',
      question: 'Meridian is preparing to file for an IPO. Which law now applies to its financial reporting and internal controls?',
      options: ['SOX', 'HIPAA', 'GLBA', 'PCI DSS'],
      correctIndex: 0,
      explanation: 'Sarbanes-Oxley (SOX) applies to publicly traded companies — its Section 404 requires documented and tested internal controls over financial reporting.',
    },
    {
      id: 'q-3', mode: 'medium', pillar: 'P4',
      question: 'Under GDPR, who is primarily accountable for personal data processed on behalf of a customer?',
      options: ['The customer\'s own ISP', 'The data processor', 'The data controller', 'The cloud host'],
      correctIndex: 2,
      explanation: 'GDPR Article 24 makes the controller accountable for compliance and for choosing compliant processors. Processors have direct obligations (Art. 28) but the controller is the primary accountable party.',
    },
    {
      id: 'q-4', mode: 'medium', pillar: 'P4',
      question: 'A new employee has signed the AUP but the NDA is still blank after 14 days. What is the correct compliance action?',
      options: ['Wait for the next quarterly review', 'Quietly back-date the NDA', 'Accept the AUP as a substitute', 'Block data access until signed'],
      correctIndex: 3,
      explanation: 'The NDA protects customer data and trade secrets. Until it is signed, the employee should not have access to customer data. Back-dating is fraud; the AUP is not a substitute for an NDA.',
    },
    {
      id: 'q-5', mode: 'medium', pillar: 'P3',
      question: 'Which of the following is *attestation* rather than acknowledgment?',
      options: ['Clicking "I agree" on the AUP', 'A Big-4 auditor signing SOC 2', 'Clicking OK on a cookie banner', 'Signing for a laptop at onboarding'],
      correctIndex: 1,
      explanation: 'Attestation is a formal declaration that something is true or has been done — typically by an auditor or executive. Acknowledgment is a user\'s confirmation that they received a policy.',
    },
    {
      id: 'q-6', mode: 'medium', pillar: 'P4',
      question: 'A patient demands erasure under HIPAA. The US has no general "right to be forgotten". What is the correct response?',
      options: ['Refuse all erasure requests', 'Erase everything on request', 'Apply HIPAA amendment rights', 'Forward the request to IT dept'],
      correctIndex: 2,
      explanation: 'HIPAA does not grant a general right to erasure. It does grant the right to amend records and to an accounting of disclosures. State laws may add rights. Erasing records required to be retained would itself be a HIPAA violation.',
    },
    {
      id: 'q-7', mode: 'medium', pillar: 'P4',
      question: 'Meridian wants to retire encrypted drives that held PCI cardholder data. Which destruction method is sufficient?',
      options: ['Standard file deletion', 'Format the disk only', 'Crypto-shred and Purge', 'Move drives to a new tier'],
      correctIndex: 2,
      explanation: 'PCI DSS requires that media be rendered unrecoverable. Crypto-shredding alone is acceptable ONLY if the encryption was strong and keys are demonstrably destroyed; combining with NIST SP 800-88 Purge or physical destruction is the safer, audit-friendly choice.',
    },
    // Hard (7 items) — correctIndex rotation: 3, 1, 0, 0, 2, 2, 3
    {
      id: 'q-8', mode: 'hard', pillar: 'P2',
      question: 'Triage: you find an "expired PCI DSS AOC" inside the audit evidence vault, labeled as the "current" attestation. What is the correct characterization?',
      options: ['Real evidence — the AOC exists', 'Red herring — PCI requires no AOCs', 'Red herring — PCI never recertifies', 'Red herring AND a real gap'],
      correctIndex: 3,
      explanation: 'An expired AOC is not current evidence. It is a red herring *as proof of compliance*, but it is also a real compliance gap that must be remediated. Both characterizations are correct.',
    },
    {
      id: 'q-9', mode: 'hard', pillar: 'P4',
      question: 'Meridian needs a primary framework. It is US-headquartered, handles federal data, and wants international credibility. The BEST single primary framework is:',
      options: ['CIS Controls — short and prioritized', 'NIST CSF plus SP 800-53', 'COBIT — strong IT governance', 'ISO 27001 only — international'],
      correctIndex: 1,
      explanation: 'For a US-headquartered org handling federal data, NIST CSF + SP 800-53 gives federal alignment (FISMA/FedRAMP), is free, and is internationally understood. ISO 27001 can be added as a certification layer for international customer trust, but as the *primary* internal framework NIST is the best fit.',
    },
    {
      id: 'q-10', mode: 'hard', pillar: 'P4',
      question: 'PaxRoster HR uses an undisclosed offshore sub-processor in a non-adequate country. What is the correct risk treatment?',
      options: ['Reject until remediated', 'Accept — PaxRoster is US-based', 'Transfer via AUP to employees', 'Mitigate by inventorying only'],
      correctIndex: 0,
      explanation: 'Hidden sub-processors in non-adequate jurisdictions create GDPR transfer risk and breach the controller\'s Article 28 obligation to use compliant processors. The correct treatment is to suspend and require remediation (DPA + SOC 2/ISO 27001 + SCCs + TIA + sub-processor disclosure), not to accept, transfer, or mitigate by paperwork alone.',
    },
    {
      id: 'q-11', mode: 'hard', pillar: 'P4',
      question: 'Tomas Holub (Prague) invokes the GDPR right to be forgotten. A legal hold exists on his account. The correct sequence is:',
      options: ['Verify, check hold, partial erase', 'Delete everything — Art. 17 absolute', 'Forward to CloudVista to decide', 'Refuse — not a US customer'],
      correctIndex: 0,
      explanation: 'Article 17 is not absolute — it is subject to legal obligations (Art. 17(3)(b)). The controller must verify identity, confirm role, check legal holds, perform partial erasure where permissible, preserve data subject to the hold, notify processors, and document the decision.',
    },
    {
      id: 'q-12', mode: 'hard', pillar: 'P4',
      question: 'An offboarding SOP disables AD/Okta, recovers hardware, and conducts an exit interview — but omits API token rotation. What is the correct characterization?',
      options: ['Adequate — access revocation covers', 'A red herring — tokens out of scope', 'A real gap — credentials persist', 'Acceptable — friendly exits are fine'],
      correctIndex: 2,
      explanation: 'Service-account credentials, SSH keys, and API tokens are independent of AD/Okta identity. The Priya Vasquez incident in the dossier traces directly to this gap. The SOP must be updated to require token/secret rotation within the offboarding SLA.',
    },
    {
      id: 'q-13', mode: 'hard', pillar: 'P4',
      question: 'A DBA sells 10,000 patient records to a marketing firm for $5,000. Which HIPAA penalty tier applies to the DBA?',
      options: ['Civil Tier 1 — employee, not company', 'Civil Tier 4 — highest civil', 'Criminal Tier C, $250K, 10 years', 'No penalty — company pays only'],
      correctIndex: 2,
      explanation: 'Selling PHI for personal gain or commercial advantage is HIPAA Criminal Tier C — up to $250,000 and 10 years imprisonment. The company may *also* face civil penalties, but the DBA personally faces Tier C criminal exposure.',
    },
    {
      id: 'q-14', mode: 'hard', pillar: 'P3',
      question: 'Which combination of monitoring mechanisms gives Meridian the strongest evidence-based compliance posture?',
      options: ['Internal CCO audit alone is enough', 'External auditor alone is enough', 'Annual self-assessment is enough', 'Layered audit plus attestation'],
      correctIndex: 3,
      explanation: 'Layered monitoring (internal + external + executive attestation + user acknowledgment) provides triangulated evidence. Any single source alone is weaker than the combination.',
    },
  ];

  // ------------------------------------------------------------------
  // Debrief / field notes
  // ------------------------------------------------------------------
  const DEBRIEF = {
    detectionOpportunities: [
      { source: 'Data inventory', signal: 'A data class without a named owner or retention rule is a gap.', action: 'Inventory must name owner, controller, processor, retention, classification.' },
      { source: 'Audit evidence vault', signal: 'An "expired AOC labeled as current" is both a red herring and a real gap.', action: 'Triage every artifact: in-date? right scope? signed?' },
      { source: 'Personnel tickets', signal: 'An onboarding record without an executed NDA is a high-impact gap.', action: 'Block data access until NDA executed.' },
      { source: 'Vendor risk register', signal: 'Hidden sub-processor in non-adequate jurisdiction is a GDPR transfer violation.', action: 'Reject vendor until disclosed + SCCs + TIA in place.' },
      { source: 'Privacy request queue', signal: 'Right-to-be-forgotten request with a legal hold triggers partial erasure + preservation.', action: 'Document decision; do not auto-erase.' },
    ],
    mitigationRecommendations: [
      { id: 'm-1', text: 'Adopt NIST CSF + SP 800-53 as primary framework; layer ISO 27001 for international customer trust.', ref: 'NIST CSF 2.0 / SP 800-53' },
      { id: 'm-2', text: 'Maintain data inventory under GDPR Article 30 with owners, controllers, processors, retention.', ref: 'GDPR Art. 30' },
      { id: 'm-3', text: 'Update offboarding SOP to include API token / SSH key / service-account credential rotation within the 1-hour SLA.', ref: 'NIST AC-2(3)' },
      { id: 'm-4', text: 'Reject PaxRoster until sub-processor disclosed + DPA + SOC 2 / ISO 27001 + SCCs + TIA.', ref: 'GDPR Art. 28, Art. 46' },
      { id: 'm-5', text: 'Renew PCI DSS AOC before expiry; track in the vendor risk register.', ref: 'PCI DSS Req. 12' },
      { id: 'm-6', text: 'Layered compliance monitoring: CCO internal audit + independent external audit + executive attestation + signed user acknowledgments.', ref: 'SOX Sec. 404, ISO 27001 Cl. 9' },
    ],
    blueTeamTakeaways: [
      'Treat every "current" attestation as suspect until you confirm issue date, scope, and validity.',
      'A signed AUP is not a substitute for an executed NDA — they cover different obligations.',
      'Access revocation ≠ credential rotation. SOPs must list both.',
      'Hidden sub-processors are the #1 source of vendor risk; demand the chain.',
    ],
    redTeamMindsetTakeaways: [
      'Former-employee credentials (especially service-account tokens) are a prime persistence vector — exploit gaps in offboarding SOPs.',
      'An expired attestation is a soft spot — the company may still believe it is compliant.',
      'Hidden sub-processors are an attack surface you can pivot through.',
      'Privacy requests can be weaponized as reconnaissance — verify identity strictly.',
    ],
    officialLinks: [
      { label: 'HIPAA — HHS.gov', url: 'https://www.hhs.gov/hipaa/index.html' },
      { label: 'GDPR — full text', url: 'https://gdpr-info.eu/' },
      { label: 'GLBA — FTC', url: 'https://www.ftc.gov/legal-library/browse/rules/gramm-leach-bliley-act' },
      { label: 'SOX — SEC', url: 'https://www.sec.gov/about/laws/soa2002.pdf' },
      { label: 'PCI DSS — PCI SSC', url: 'https://www.pcisecuritystandards.org/' },
      { label: 'NIST Cybersecurity Framework', url: 'https://www.nist.gov/cyberframework' },
      { label: 'ISO/IEC 27001', url: 'https://www.iso.org/standard/27001' },
      { label: 'CIS Controls v8', url: 'https://www.cisecurity.org/controls' },
      { label: 'COBIT 2019 — ISACA', url: 'https://www.isaca.org/resources/cobit' },
      { label: 'FedRAMP', url: 'https://www.fedramp.gov/' },
      { label: 'FISMA — NIST', url: 'https://csrc.nist.gov/Topics/laws-and-regulations/laws/fisma' },
    ],
  };

  // ------------------------------------------------------------------
  // M2 governance term pairs + R6 stable shuffle permutation
  // ------------------------------------------------------------------
  const TERM_PAIRS = [
    { term: 'Regulatory compliance', def: 'Meeting standards mandated by law, regulation, or binding third-party agreement.' },
    { term: 'Due diligence', def: 'Proactive research and assessment done before committing to an action.' },
    { term: 'Due care', def: 'Ongoing, reasonable steps an organization takes to protect assets and act responsibly.' },
    { term: 'Attestation', def: 'A formal declaration — usually by an executive or auditor — that something is true or has been done.' },
    { term: 'Acknowledgment', def: 'A signed confirmation that a user received and understood a policy.' },
    { term: 'Chief Compliance Officer (CCO)', def: 'Executive accountable for the organization\'s compliance posture.' },
  ];

  // R6: stable shuffle permutation applied to the definitions list so that
  // the correct answer for term 1 is NOT systematically option 1, etc.
  // Permutation [3, 5, 1, 4, 0, 2] places the correct answers at dropdown
  // positions 5, 3, 6, 1, 4, 2 respectively — all distinct, no pattern.
  const DEFS_PERMUTATION = [3, 5, 1, 4, 0, 2];

  // Hard-mode H7 remediation conditions per vendor
  const REMEDIATION = {
    'v-cloudvista': [
      { id: 'r-cv-dpa',   text: 'Sign a Data Processing Agreement (GDPR Article 28).', correct: true },
      { id: 'r-cv-sub',   text: 'Publish / disclose the full sub-processor list.',     correct: true },
      { id: 'r-cv-eu',    text: 'Support EU data residency for Meridian\'s EU customers.', correct: true },
      { id: 'r-cv-iso',   text: 'Obtain ISO 27001 certification before any data flows.', correct: false },
      { id: 'r-cv-pci',   text: 'Obtain PCI DSS Level 1 certification (not in scope for this vendor).', correct: false },
    ],
    'v-bielefeld': [
      { id: 'r-bf-none', text: 'No remediation conditions required (already certified + EU-jurisdiction).', correct: true },
      { id: 'r-bf-scc',  text: 'Implement Standard Contractual Clauses.',   correct: false },
      { id: 'r-bf-iso',  text: 'Obtain ISO 27001 (already has it).',         correct: false },
    ],
    'v-paxroster': [
      { id: 'r-px-sub',  text: 'Disclose the offshore sub-processor and its jurisdiction.',  correct: true },
      { id: 'r-px-soc',  text: 'Provide a SOC 2 Type II report or ISO 27001 certification.', correct: true },
      { id: 'r-px-dpa',  text: 'Sign a Data Processing Agreement (GDPR Article 28).',         correct: true },
      { id: 'r-px-scc',  text: 'Implement Standard Contractual Clauses (SCCs).',              correct: true },
      { id: 'r-px-tia',  text: 'Conduct a Transfer Impact Assessment for the non-adequate jurisdiction.', correct: true },
      { id: 'r-px-feat', text: 'Move the sub-processor to an EU-adequate jurisdiction as an alternative to SCCs+TIA.', correct: true },
      { id: 'r-px-none', text: 'Accept the vendor as-is because no breach has occurred.',     correct: false },
      { id: 'r-px-nice', text: 'Add the vendor to the data inventory as a mitigation.',       correct: false },
    ],
  };

  // Hard-mode DSR step pool (id + label + description; includes red herrings)
  const ALL_DSR_STEPS = [
    { id: 'verify-identity',           label: 'Verify requester identity',         desc: 'Confirm the requester is the data subject (e.g., match government ID to the account).' },
    { id: 'classify-as-controller',    label: 'Confirm Meridian is the controller', desc: 'Document Meridian\'s role as the entity that decides why and how the data is processed.' },
    { id: 'check-legal-hold',          label: 'Check for legal holds',             desc: 'Search for active legal holds on the account; holds override erasure.' },
    { id: 'notify-processors',         label: 'Notify processors of the request',  desc: 'Forward the request to all processors that hold the data (CloudVista, Bielefeld, etc.).' },
    { id: 'partial-erasure-with-hold', label: 'Partial erasure (preserve hold)',   desc: 'Erase data not subject to the hold; preserve data that is.' },
    { id: 'collect-from-processors',   label: 'Collect data from processors',      desc: 'Pull the subject\'s data from each processor before producing the export.' },
    { id: 'produce-structured-export', label: 'Produce structured export',         desc: 'Compile the data into a machine-readable, commonly-used format.' },
    { id: 'deliver-within-30-days',    label: 'Deliver within 30 days',            desc: 'GDPR: respond within 1 month of receipt (extendable by 2 months for complex cases).' },
    { id: 'document-decision',         label: 'Document the decision',             desc: 'Record what was done, when, by whom, and what was preserved and why.' },
    { id: 'delete-immediately',        label: 'Delete everything immediately',     desc: 'RED HERRING — GDPR Article 17 is not absolute; legal obligations and other exemptions apply.' },
    { id: 'ignore-because-eu-customer', label: 'Ignore — non-US customer',        desc: 'RED HERRING — Meridian must honor DSRs from EU customers regardless of its US HQ.' },
    { id: 'forward-to-vendor-without-dpa', label: 'Forward to vendor without DPA', desc: 'RED HERRING — Meridian must have a DPA (Art. 28) with each processor before sharing.' },
    { id: 'charge-fee-without-basis',  label: 'Charge a fee without basis',       desc: 'RED HERRING — GDPR Art. 12(5) allows fees only for manifestly unfounded or excessive requests.' },
  ];

  // Hard-mode H4 expected fix phrases (loose match)
  const H4_EXPECTED_FIXES = {
    'pt-1': 'Block data access until NDA executed; add NDA gate to onboarding checklist.',
    'pt-2': 'Add API token / SSH key / service-account rotation to offboarding SOP within 1-hour SLA.',
  };

  // Hard-mode H9 expected non-financial consequences
  const H9_EXPECTED_NONFIN = {
    'ps-1': 'none',
    'ps-2': 'imprisonment',
    'ps-3': 'reputational damage',
  };

  // Expose everything
  global.AtelierData = {
    GLOSSARY, REGULATIONS, BUSINESS_UNITS, FRAMEWORKS, DATA_SAMPLES,
    VENDORS, PERSONNEL_STEPS, PERSONNEL_TICKETS, DSR_REQUESTS,
    AUDIT_EVIDENCE, PENALTY_SCENARIOS, RETENTION_RULES, INVENTORY_RECORDS,
    QUIZ, DEBRIEF, TERM_PAIRS, DEFS_PERMUTATION, REMEDIATION,
    ALL_DSR_STEPS, H4_EXPECTED_FIXES, H9_EXPECTED_NONFIN,
  };
})(window);
