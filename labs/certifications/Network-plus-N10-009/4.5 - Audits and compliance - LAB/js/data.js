/* ═══════════════════════════════════════════════════════════════════════════
   data.js — ALL lab content for "The Compliance Field Audit"
   Ported 1:1 from the original framework lab (src/lib/lab/content.ts +
   glossary.ts). Data only — no logic here. All organizations, people, hosts,
   IPs and card numbers are FICTIONAL training data. PANs use the
   industry-standard synthetic test numbers (4111 1111 1111 1111 /
   5500 0042 3498 2211).
   ═══════════════════════════════════════════════════════════════════════════ */

window.LAB_DATA = (function () {
  "use strict";

  const CASE_ID = "MRG-2025-114";
  const LESSON_LABEL = "Network+ N10-009 · Lesson 4.5 — Audits and compliance";
  const OFFICIAL_ANCHOR =
    "Official anchor: N10-009 Objective 4.1 — topic group “Audits and compliance: data locality, PCI DSS, and GDPR” (Domain 4, Network Security — 22 % of the exam).";

  const ZONES = [
    { id: "briefing", tab: "Briefing Room", title: "Briefing Room", blurb: "Your assignment memo and the audit correspondence file." },
    { id: "library", tab: "Compliance Library", title: "Compliance Library", blurb: "The framework wall: PCI DSS, GDPR and data locality." },
    { id: "datacenter", tab: "Card Data Center", title: "Card Data Center (MRG-DC1)", blurb: "Diagram, ruleset, logs and logging controls." },
    { id: "cloudops", tab: "Cloud Operations", title: "Cloud Operations", blurb: "StratusCloud regions, data maps and the launch review." },
    { id: "findings", tab: "Findings Desk", title: "Findings Desk", blurb: "Incident clock, remediation plan and the audit lifecycle." },
    { id: "interview", tab: "Exit Interview", title: "Exit Interview", blurb: "The Lead Auditor checks your understanding." },
    { id: "report", tab: "Audit Report", title: "Audit Report & Debrief", blurb: "Detection playbook, mitigations and takeaways." },
  ];

  // Defined in the original world file; kept for content parity (the original
  // framework also carries it without rendering it).
  const CAST = [
    { name: "Ingrid Hoffmann", role: "IT Director, Meridian Retail Group", note: "Assigned you the pre-assessment walk-through." },
    { name: "Dr. Amara Diallo", role: "Data Protection Officer (DPO)", note: "Owns GDPR questions — including the 72-hour breach clock." },
    { name: "Quentin Marsh", role: "QSA, Halloway & Brand", note: "Independent third-party assessor for the PCI DSS renewal." },
    { name: "Leo Tanaka", role: "SOC Analyst", note: "Hands you the logs and the incident ticket." },
    { name: "BalticSupply", role: "Wholesale customer", note: "Audits Meridian under its supply contract (second party)." },
    { name: "Ticketron", role: "Ticketing SaaS vendor", note: "Sent its SOC 2 Type II report (an attestation)." },
    { name: "PayBridge", role: "Payment processor", note: "Receives card data from the CDE over TLS." },
    { name: "StratusCloud", role: "Cloud provider", note: "Regions: Frankfurt · Dublin · Virginia · Singapore." },
  ];

  const MEMO = `FROM: Ingrid Hoffmann, IT Director
TO:    Network Compliance Analyst (you — day 12 on the job)
RE:    Case ${CASE_ID} — external assessment readiness

Two weeks from today, Quentin Marsh of Halloway & Brand begins our annual
PCI DSS assessment of the cardholder data environment. Dr. Diallo has also
flagged open GDPR questions about where our EU personal data lives, and
BalticSupply exercises its contractual audit right next quarter.

Your assignment: walk our five work areas, inspect the evidence, classify
what you find, and record every finding on your clipboard before the QSA
arrives. The certification stakes are real: this material maps to CompTIA
Network+ N10-009 Objective 4.1 — “Audits and compliance: data locality,
PCI DSS, and GDPR”.

All documents in this case file are synthetic training evidence.`;

  const LETTERS = [
    {
      id: "ltr-baltic",
      from: "BalticSupply — Vendor Risk Office",
      subject: "Notice of contractual audit (schedule 7, §4)",
      body: "Under schedule 7 of our supply agreement, BalticSupply will send two members of our own security staff to review the systems that handle our purchase orders. This is an audit performed by our customer — not by an independent firm, and not by you.",
      tag: "second-party",
      tone: "teal",
    },
    {
      id: "ltr-halloway",
      from: "Halloway & Brand — Assurance Services",
      subject: "PCI DSS assessment engagement (QSA: Q. Marsh)",
      body: "Halloway & Brand is an independent assessment firm. As your Qualified Security Assessor we have no ownership stake in Meridian Retail Group and no customer relationship beyond this engagement. We will test your controls against PCI DSS v4.0.1 and issue the Report on Compliance and Attestation of Compliance.",
      tag: "third-party",
      tone: "green",
    },
    {
      id: "ltr-vulnscan",
      from: "Leo Tanaka — SOC",
      subject: "Friday: internal vulnerability scan of the payment VLAN",
      body: "Reminder that I am running the internal vulnerability scan of the payment VLAN this Friday. Scans like this measure where we stand — they find and rank gaps but they are not a formal verification against a standard.",
      tag: "assessment",
      tone: "amber",
    },
    {
      id: "ltr-ticketron",
      from: "Ticketron — Trust Center",
      subject: "SOC 2 Type II report (FY2025)",
      body: "Independent Service Auditor's Report (excerpt): “…it is our opinion that Ticketron's controls were suitably designed and operated effectively throughout the period 1 Jan – 31 Dec to meet the applicable trust services criteria.” Issued by Pratt & Lin, CPA — an independent auditor with no stake in Ticketron.",
      tag: "attestation",
      tone: "green",
    },
  ];

  const LEGACY_MEMO = `INTEROFFICE — 14 Mar 2019 (ARCHIVED)
RE: Legacy remote-access policy (SUPERSEDED)
The 2019 policy permitted vendor modems on the corporate LAN. This memo
predates the current CDE segmentation program and is retained for records
only. It no longer reflects any current control. — I. Hoffmann`;

  const FRAMEWORK_PCI = {
    name: "PCI DSS",
    full: "Payment Card Industry Data Security Standard",
    kind: "CONTRACTUAL standard (card brands via PCI SSC) — not a law",
    version: "v4.0.1 current · v3.2.1 retired 31 Mar 2024",
    applies: "ANY organization that stores, processes or transmits cardholder data (CHD) — merchants, processors, service providers.",
    data: "Cardholder data = PAN (primary account number) + cardholder name/expiry. Sensitive authentication data must never be stored after authorization.",
    points: [
      "Req 1 — network security controls: firewalls; segment the CDE to shrink scope",
      "Req 3 — protect stored account data (encrypt; never log PANs)",
      "Req 4 — encrypt transmission of cardholder data (TLS)",
      "Req 7 / 8 — least privilege; unique IDs + MFA",
      "Req 10 — log all access; NTP time sync; 12-month retention (3 months immediately available); tamper protection",
      "Req 11 — test security: quarterly ASV vulnerability scans, internal scans, pen tests",
      "Req 12 — security policy for all personnel",
    ],
    validation: "Report on Compliance (QSA) or Self-Assessment Questionnaire (SAQ) — both closed by an Attestation of Compliance (AOC).",
    teeth: "Enforced by acquirers/card brands: fines, higher transaction fees, or loss of the ability to process cards.",
  };

  const FRAMEWORK_GDPR = {
    name: "GDPR",
    full: "General Data Protection Regulation — EU 2016/679",
    kind: "LAW — applicable in the EU/EEA since 25 May 2018",
    version: "Regulation (EU) 2016/679",
    applies: "Personal data of people in the EU/EEA — regardless of where the organization sits (extraterritorial).",
    data: "Personal data = any information relating to an identifiable person (name, e-mail, IP address…).",
    points: [
      "Controller decides why/how data is processed; processor acts on the controller's behalf",
      "Principles: lawfulness, purpose limitation, data minimisation, integrity & confidentiality, accountability",
      "Rights: access, rectification, erasure (“right to be forgotten”), portability",
      "Personal data breach → notify the supervisory authority within 72 hours (Art. 33); data subjects if high risk (Art. 34)",
      "DPIA before high-risk processing (Art. 35); DPO in certain cases (Art. 37)",
      "Transfers outside the EEA need an adequacy decision or safeguards such as SCCs (Chapter V) — simplified",
    ],
    validation: "Demonstrable accountability: records of processing, DPIAs, contracts with processors.",
    teeth: "Administrative fines up to €20 million or 4 % of worldwide annual turnover, whichever is higher (Art. 83). Real case: Meta — €1.2 B, Irish DPC, May 2023, unlawful EU→US transfers (Art. 46(1)).",
  };

  const FRAMEWORK_LOCALITY = {
    name: "Data locality",
    full: "Data locality, sovereignty & localization",
    kind: "CONCEPT — geography decides which rules reach your data",
    version: "Family of concepts (simplified below)",
    applies: "Every dataset — including replicas, analytics and backups.",
    data: "Where data physically lives determines whose law enforcement, privacy and disclosure rules can reach it.",
    points: [
      "Data locality — the geographic location where data is stored",
      "Data sovereignty — data is governed by the laws of the country where it resides",
      "Data localization — some jurisdictions legally require certain data to stay in-country",
      "Cloud region selection is a compliance decision, not just a latency/cost one",
      "Geo-blocking / geo-fencing restrict access by geography",
      "DR sites and backups count: a replica re-creates the same legal exposure",
    ],
    validation: "A data map: dataset → region → governing rule (law, contract, or none).",
    teeth: "Transfer restrictions (GDPR Chapter V), localization-law penalties, or breach of contract — depending on the rule that applies.",
  };

  // ─── Data Center artifacts ───
  const DIAGRAM_NODES = [
    { id: "internet", label: "Internet", sub: "untrusted", x: 8, y: 6, w: 15, cde: false, kind: "cloud" },
    { id: "fw1", label: "FW1 — edge firewall", sub: "network security control", x: 32, y: 6, w: 19, cde: false, kind: "fw" },
    { id: "webstore", label: "Marketing web store", sub: "no CHD stored", x: 61, y: 6, w: 19, cde: false, kind: "server" },
    { id: "corpsw", label: "Corporate LAN switch", sub: "office VLAN 10", x: 32, y: 30, w: 19, cde: false, kind: "switch" },
    { id: "laptops", label: "Corporate laptops", sub: "office users", x: 8, y: 30, w: 15, cde: false, kind: "laptop" },
    { id: "email", label: "E-mail server", sub: "staff mail", x: 8, y: 52, w: 15, cde: false, kind: "server" },
    { id: "hrserver", label: "HR file server", sub: "EU employee records", x: 8, y: 74, w: 15, cde: false, kind: "server" },
    { id: "guest", label: "Guest Wi-Fi AP", sub: "visitors, untrusted", x: 32, y: 74, w: 19, cde: false, kind: "wifi" },
    { id: "fw2", label: "FW2 — CDE firewall", sub: "segmentation boundary", x: 61, y: 30, w: 19, cde: true, kind: "fw" },
    { id: "posswitch", label: "Store POS switch", sub: "payment VLAN 40", x: 61, y: 52, w: 19, cde: true, kind: "switch" },
    { id: "payapp", label: "Payment app server", sub: "authorizes payments", x: 86, y: 52, w: 13, cde: true, kind: "server" },
    { id: "carddb", label: "Card database", sub: "CHD at rest", x: 61, y: 74, w: 19, cde: true, kind: "db" },
    { id: "posterm", label: "POS terminals ×214", sub: "stores DE/FR/NL", x: 86, y: 74, w: 13, cde: true, kind: "pos" },
    { id: "paygw", label: "PayBridge gateway", sub: "TLS → processor", x: 86, y: 30, w: 13, cde: true, kind: "server" },
  ];

  const DIAGRAM_EDGES = [
    ["internet", "fw1"],
    ["fw1", "webstore"],
    ["fw1", "corpsw"],
    ["corpsw", "laptops"],
    ["corpsw", "email"],
    ["corpsw", "hrserver"],
    ["corpsw", "guest"],
    ["corpsw", "fw2"],
    ["fw2", "paygw"],
    ["fw2", "posswitch"],
    ["posswitch", "payapp"],
    ["posswitch", "carddb"],
    ["posswitch", "posterm"],
    ["payapp", "paygw"],
  ];

  const FIREWALL_RULES = [
    { id: "R-101", src: "Internet", dst: "Marketing web store", port: "443/tcp", action: "allow", finding: false, why: "Public storefront; no card data lives here." },
    { id: "R-102", src: "Corporate LAN", dst: "Card database", port: "1433/tcp", action: "allow", finding: true, why: "Corporate LAN reaching straight into the CDE destroys segmentation and widens PCI scope." },
    { id: "R-103", src: "Payment VLAN (POS)", dst: "PayBridge gateway", port: "8443/tcp", action: "allow", finding: false, why: "Legitimate CDE-internal flow toward the processor." },
    { id: "R-104", src: "any", dst: "any", port: "443/tcp", action: "allow", finding: true, why: "An any→any rule is the classic segmentation killer — traffic no longer has to cross a defined control." },
    { id: "R-105", src: "Payment VLAN (POS)", dst: "PayBridge gateway", port: "443/tcp", action: "allow", finding: false, why: "CDE-internal, destination-only, expected." },
    { id: "R-106", src: "Card database", dst: "Syslog collector", port: "514/tcp", action: "allow", finding: false, why: "Logs leaving the CDE to the collector is correct — you cannot audit what you cannot see." },
    { id: "R-107", src: "Guest Wi-Fi", dst: "Payment app server", port: "8443/tcp", action: "allow", finding: true, why: "Untrusted guest traffic touching a CDE system — a hard finding in any audit." },
    { id: "R-108", src: "CDE systems", dst: "Internet", port: "any", action: "deny", finding: false, why: "Default-deny egress from the CDE is exactly what an assessor wants to see." },
  ];

  const LOG_LINES = [
    { id: "L1", text: "2025-11-03T02:14:02Z pay-app INFO  auth user=svc-billing src=10.40.1.10 result=ok", pan: false },
    { id: "L2", text: '2025-11-03T02:14:09Z pay-app INFO  order=88121 card="4111 1111 1111 1111" resp=approved', pan: true },
    { id: "L3", text: "2025-11-03T02:14:11Z pay-app INFO  ntp sync ok stratum=2 offset=0.4ms", pan: false },
    { id: "L4", text: "2025-11-03T02:15:44Z pay-app DEBUG full_req pan=5500 0042 3498 2211 exp=12/27 resp=ok", pan: true },
    { id: "L5", text: "2025-11-03T02:16:03Z pay-app INFO  order=88122 resp=declined reason=insufficient_funds", pan: false },
    { id: "L6", text: "2025-11-03T02:17:37Z sshd    WARN  failed password user=root src=10.20.7.4", pan: false },
    { id: "L7", text: "2025-11-03T02:18:19Z pay-app INFO  order=88123 resp=approved", pan: false },
    { id: "L8", text: "2025-11-03T02:19:55Z pay-app INFO  ntp sync ok stratum=2 offset=0.2ms", pan: false },
    { id: "L9", text: "2025-11-03T02:21:12Z pay-app INFO  config snapshot saved by svc-billing", pan: false },
    { id: "L10", text: "2025-11-03T02:22:48Z pay-app INFO  order=88124 resp=approved", pan: false },
  ];

  const LOG_CONFIG = {
    toggles: [
      { id: "ntp", label: "NTP time synchronization (ntp.mrg.internal)", initial: false },
      { id: "siem", label: "Forward logs to SIEM collector", initial: true },
      { id: "tamper", label: "Log tamper protection (append-only, hash-chained)", initial: false },
    ],
    selects: [
      {
        id: "retention",
        label: "Audit log retention",
        options: [
          { id: "30d", label: "30 days" },
          { id: "90d", label: "90 days" },
          { id: "180d", label: "180 days" },
          { id: "12mo", label: "12 months" },
        ],
        initial: "90d",
      },
    ],
    answer: { ntp: true, siem: true, tamper: true, retention: "12mo" },
  };

  // ─── Cloud Operations artifacts ───
  const CLOUD_STORES = [
    { id: "D1", name: "EU customer profiles (master)", region: "eu-central-1 · Frankfurt", flag: "eu", classification: "personal data", violates: false, why: "EU personal data in an EU region — correct placement." },
    { id: "D2", name: "EU customer profiles — analytics replica", region: "us-east-1 · Virginia", flag: "us", classification: "personal data", violates: true, why: "A replica of EU personal data outside the EU needs a transfer safeguard — none exists here." },
    { id: "D3", name: "Tokenized payment records (PAN removed)", region: "eu-central-1 · Frankfurt", flag: "eu", classification: "tokenized — not CHD", violates: false, why: "Tokenized records with the PAN removed are neither CHD nor personal data (simplified)." },
    { id: "D4", name: "Product catalog & imagery", region: "us-east-1 · Virginia", flag: "us", classification: "no personal data", violates: false, why: "No personal data, no card data — any region works. Not everything in a US region is a finding." },
    { id: "D5", name: "Web analytics — EU visitors (IP addresses)", region: "ap-south-1 · Singapore", flag: "ap", classification: "personal data (IPs)", violates: true, why: "IP addresses are personal data under GDPR; EU visitors' analytics stored in Singapore violates locality." },
    { id: "D6", name: "EU employee payroll records", region: "eu-central-1 · Frankfurt", flag: "eu", classification: "personal data", violates: false, why: "EU region, EU employees — fine." },
    { id: "D7", name: "Encrypted DR backup of EU customer DB", region: "ap-south-1 · Singapore", flag: "ap", classification: "personal data", violates: true, why: "Backups count — an encrypted copy still re-creates the same legal exposure abroad." },
  ];

  const LAUNCH_CONFIG = {
    toggles: [
      { id: "geoRestrict", label: "Geo-restrict admin access to Meridian EU office ranges", initial: false },
      { id: "usRepl", label: "Replicate the loyalty database to a US region (latency)", initial: true },
      { id: "backups", label: "Enable automatic backups (stored in the selected region)", initial: true },
      { id: "publicBucket", label: "Public object bucket for EU customer exports", initial: true },
    ],
    selects: [
      {
        id: "region",
        label: "Primary region for “Loyalty Plus” (EU customers)",
        options: [
          { id: "eu-central-1", label: "eu-central-1 · Frankfurt" },
          { id: "eu-west-1", label: "eu-west-1 · Dublin" },
          { id: "us-east-1", label: "us-east-1 · Virginia" },
          { id: "ap-south-1", label: "ap-south-1 · Singapore" },
        ],
        initial: "us-east-1",
      },
    ],
    answer: { region: "eu-central-1", geoRestrict: true, usRepl: false, backups: true, publicBucket: false },
  };

  // ─── Findings Desk artifacts ───
  const BREACH_TICKET = `INCIDENT TICKET INC-8841 — data exposure confirmation
Mon 09:12  Leo Tanaka confirms unauthorized access to 38,400 records
           of EU customers: names, e-mail addresses, hashed passwords.
Mon 09:31  System isolated; access revoked. Root cause under review.
           Dr. Diallo (DPO) paged for the regulatory assessment.`;

  const FINDINGS_M10 = {
    items: [
      { id: "F1", text: "Corporate LAN can reach the card database directly (rule R-102)" },
      { id: "F2", text: "Full PANs written to payment application logs" },
      { id: "F3", text: "EU customer analytics replica stored in Virginia" },
      { id: "F4", text: "Six engineers share one “admin” account on payment servers" },
      { id: "F5", text: "NTP sync disabled and logs kept 90 days" },
    ],
    options: [
      { id: "C1", label: "Segment the CDE (VLANs + firewall ACLs) and re-scope" },
      { id: "C2", label: "Stop logging CHD; redact and purge the affected logs" },
      { id: "C3", label: "Migrate the dataset to an EU cloud region" },
      { id: "C4", label: "Issue unique IDs, apply least privilege, enforce MFA" },
      { id: "C5", label: "Enable NTP; set 12-month tamper-protected retention" },
    ],
    answer: { F1: "C1", F2: "C2", F3: "C3", F4: "C4", F5: "C5" },
  };

  const LIFECYCLE_M12 = {
    steps: [
      { id: "s1", text: "Define scope and collect evidence (inventory, diagrams, logs)" },
      { id: "s2", text: "Internal (first-party) audit / pre-assessment" },
      { id: "s3", text: "Remediate the findings" },
      { id: "s4", text: "External (third-party) audit — QSA fieldwork" },
      { id: "s5", text: "Attestation issued (ROC/SAQ + AOC)" },
      { id: "s6", text: "Continuous monitoring and the re-audit cycle" },
    ],
    answer: ["s1", "s2", "s3", "s4", "s5", "s6"],
  };

  // ─── Hard-mode artifacts ───
  const INVENTORY_H1 = [
    { id: "I01", host: "pos-term-01…214 (stores)", data: "CHD captured at swipe", cde: true, why: "POS terminals handle cardholder data by definition." },
    { id: "I02", host: "pos-switch (payment VLAN 40)", data: "carries CHD in transit", cde: true, why: "The payment VLAN carries CHD between CDE systems." },
    { id: "I03", host: "pay-app-01", data: "authorizes payments, touches CHD", cde: true, why: "The payment application processes CHD." },
    { id: "I04", host: "card-db-01", data: "CHD at rest", cde: true, why: "The card database stores account data — core CDE." },
    { id: "I05", host: "paygw-01 (PayBridge)", data: "TLS link to processor", cde: true, why: "The gateway transmits CHD outward." },
    { id: "I06", host: "fw2 (CDE boundary)", data: "segmentation control", cde: true, why: "The CDE's own security control is inside the scope boundary." },
    { id: "I07", host: "pay-log-archive", data: "payment logs — full PANs, pending purge", cde: true, why: "These logs contain PANs, so they hold CHD — in scope until purged." },
    { id: "I08", host: "fw1 (edge)", data: "internet-facing only", cde: false, why: "Edge control sits outside the CDE boundary." },
    { id: "I09", host: "corp-laptops", data: "office work, no CHD", cde: false, why: "Office estate — outside the CDE." },
    { id: "I10", host: "hr-server", data: "EU employee records — personal data", cde: false, why: "Personal data (GDPR-relevant) but not cardholder data — not CDE." },
    { id: "I11", host: "mail-01", data: "staff mail", cde: false, why: "No CHD — outside the CDE." },
    { id: "I12", host: "guest-wifi", data: "visitor internet", cde: false, why: "Untrusted guest network — outside, and must stay out." },
    { id: "I13", host: "marketing-web-01", data: "public storefront, no stored CHD", cde: false, why: "No CHD stored or processed — out of CDE scope." },
    { id: "I14", host: "clinical-forms-01", data: "US health partner PHI (HIPAA)", cde: false, why: "RED HERRING — US patient data is a HIPAA matter; it never touches card data." },
    { id: "I15", host: "project-falcon-assets", data: "product catalog, no personal data", cde: false, why: "RED HERRING — no personal or card data at all." },
  ];

  const TRIAGE_H2 = {
    items: [
      { id: "T1", text: "Payment application logs contain full PANs" },
      { id: "T2", text: "Card DB export with PANs + cardholder names found on a contractor's US laptop" },
      { id: "T3", text: "Guest Wi-Fi can reach the payment app server" },
      { id: "T4", text: "Marketing analytics store EU visitors' IP addresses in Virginia" },
      { id: "T5", text: "Product catalog replicated to Singapore" },
      { id: "T6", text: "ClinicalForms server holds US patients' health records" },
      { id: "T7", text: "Corporate laptops run AV definitions from 2023" },
      { id: "T8", text: "No NTP synchronization on payment servers — timestamps drift" },
    ],
    categories: [
      { id: "pci", label: "PCI DSS finding" },
      { id: "gdpr", label: "GDPR finding" },
      { id: "both", label: "Both" },
      { id: "none", label: "Not a finding (this audit)" },
    ],
    answer: { T1: "pci", T2: "both", T3: "pci", T4: "gdpr", T5: "none", T6: "none", T7: "none", T8: "pci" },
  };

  const LOCALITY_H3 = {
    policy:
      "POLICY P-7 (composite for this exercise): EU personal data must remain in EU regions. Card data must remain in the Frankfurt region by contract with PayBridge. Non-EU personal data is unrestricted. Backups and replicas inherit the classification of their source.",
    rows: [
      { id: "V1", text: "EU customer profiles → Frankfurt (eu-central-1)", sub: "master dataset" },
      { id: "V2", text: "EU customer analytics replica → Virginia (us-east-1)", sub: "replica of EU personal data" },
      { id: "V3", text: "US customer records → Virginia (us-east-1)", sub: "non-EU personal data" },
      { id: "V4", text: "Encrypted EU DB backup → Singapore (ap-south-1)", sub: "DR backup" },
      { id: "V5", text: "Card transaction export → Dublin (eu-west-1)", sub: "CHD, EU region but not Frankfurt" },
    ],
    verdictLabels: ["BLOCK", "ALLOW"],
    reasons: [
      { id: "r1", label: "EU personal data must stay in EU regions" },
      { id: "r2", label: "Card data must stay in Frankfurt (contract)" },
      { id: "r3", label: "Non-EU personal data is unrestricted" },
      { id: "r4", label: "In-region — no rule triggered" },
    ],
    answer: {
      V1: { v: 1, r: "r4" },
      V2: { v: 0, r: "r1" },
      V3: { v: 1, r: "r3" },
      V4: { v: 0, r: "r1" },
      V5: { v: 0, r: "r2" },
    },
  };

  const FIREWALL_FIX_H4 = {
    removeAnswer: ["R-102", "R-104", "R-107"],
    replacements: [
      { id: "repl-a", label: "ALLOW corporate LAN → card database 1433/tcp (unchanged, documented)" },
      { id: "repl-b", label: "ALLOW pam-jump-01 (bastion) → card database 1433/tcp, logged" },
      { id: "repl-c", label: "ALLOW guest Wi-Fi → payment VLAN 8443/tcp for “testing”" },
      { id: "repl-d", label: "ALLOW any → payment VLAN 1433/tcp, weekends only" },
    ],
    replaceAnswer: "repl-b",
  };

  const EVIDENCE_H5 = {
    items: [
      { id: "E1", text: "Firewall ruleset export + CDE segmentation diagram" },
      { id: "E2", text: "Key-management record for card-DB encryption" },
      { id: "E3", text: "TLS 1.2+ configuration and certificate inventory (POS → PayBridge)" },
      { id: "E4", text: "MFA enrollment report for all admin accounts" },
      { id: "E5", text: "NTP configuration + 12-month log archive index" },
      { id: "E6", text: "Latest quarterly ASV scan — passing report" },
    ],
    options: [
      { id: "q1", label: "Req 1 — network security controls" },
      { id: "q3", label: "Req 3 — protect stored account data" },
      { id: "q4", label: "Req 4 — encrypt transmission" },
      { id: "q8", label: "Req 8 — identify users & authenticate" },
      { id: "q10", label: "Req 10 — log and monitor all access" },
      { id: "q11", label: "Req 11 — test security regularly" },
    ],
    answer: { E1: "q1", E2: "q3", E3: "q4", E4: "q8", E5: "q10", E6: "q11" },
  };

  const CONSEQUENCES_H6 = {
    items: [
      { id: "X1", text: "Persistent PCI DSS failure" },
      { id: "X2", text: "GDPR infringement at the upper tier (Art. 83)" },
      { id: "X3", text: "Personal data breach with high risk to individuals" },
      { id: "X4", text: "BalticSupply finds Meridian breached the contract's security schedule" },
    ],
    options: [
      { id: "y1", label: "Acquirer/card-brand fines, higher fees, or loss of card processing" },
      { id: "y2", label: "Fine up to €20 million or 4 % of worldwide annual turnover" },
      { id: "y3", label: "Notify the supervisory authority within 72 h; inform data subjects" },
      { id: "y4", label: "Contractual remedies: penalties, re-audit, or termination" },
    ],
    answer: { X1: "y1", X2: "y2", X3: "y3", X4: "y4" },
  };

  const LIFECYCLE_H7 = {
    steps: [
      { id: "k1", text: "Kick-off: scope definition and system inventory" },
      { id: "k2", text: "Collect pre-assessment evidence (diagrams, rulesets, logs)" },
      { id: "k3", text: "Internal (first-party) pre-audit" },
      { id: "k4", text: "Remediate gaps and re-test" },
      { id: "k5", text: "QSA fieldwork — external (third-party) assessment" },
      { id: "k6", text: "Gap reporting and management response" },
      { id: "k7", text: "Attestation issued (ROC/SAQ + AOC)" },
      { id: "k8", text: "Continuous monitoring: quarterly ASV scans, annual re-assessment" },
    ],
    answer: ["k1", "k2", "k3", "k4", "k5", "k6", "k7", "k8"],
  };

  const ATTESTATION_H8 = {
    questions: [
      {
        id: "issuer",
        prompt: "Who may issue the attestation that closes Meridian's PCI DSS assessment?",
        options: [
          { id: "ingrid", label: "Ingrid Hoffmann — Meridian's own IT Director" },
          { id: "leo", label: "Leo Tanaka — the internal SOC analyst" },
          { id: "qsa", label: "Halloway & Brand — the independent QSA" },
          { id: "paybridge", label: "PayBridge — the payment processor we use" },
        ],
        correct: "qsa",
      },
      {
        id: "doc",
        prompt: "Which document formally closes the assessment?",
        options: [
          { id: "soc2", label: "SOC 2 Type II report" },
          { id: "aoc", label: "Attestation of Compliance (AOC)" },
          { id: "nda", label: "Non-disclosure agreement" },
          { id: "po", label: "Purchase order" },
        ],
        correct: "aoc",
      },
      {
        id: "residual",
        prompt: "What must the report note as a residual item?",
        options: [
          { id: "purge", label: "PAN-bearing logs pending purge, with compensating controls" },
          { id: "nothing", label: "Nothing — attestations contain no statements about gaps" },
          { id: "wifi", label: "The guest Wi-Fi password" },
          { id: "holiday", label: "Next year's holiday schedule" },
        ],
        correct: "purge",
      },
    ],
    answer: { issuer: "qsa", doc: "aoc", residual: "purge" },
  };

  const SPOTLIGHT_H9 = {
    items: [
      { id: "S1", text: "A US hospital chain leaks patient records" },
      { id: "S2", text: "A French retailer stores card PANs unencrypted" },
      { id: "S3", text: "A Dutch webshop must erase a customer's data on request" },
      { id: "S4", text: "A German firm must keep telecom metadata in-country by law" },
      { id: "S5", text: "A public US company's financial-reporting controls fail" },
      { id: "S6", text: "An Irish SaaS needs SCCs for its EU→US data flows" },
    ],
    categories: [
      { id: "pci", label: "PCI DSS" },
      { id: "gdpr", label: "GDPR" },
      { id: "loc", label: "Data locality" },
      { id: "other", label: "Neither — different regime" },
    ],
    answer: { S1: "other", S2: "pci", S3: "gdpr", S4: "loc", S5: "other", S6: "gdpr" },
  };

  // ─── Debrief content ───
  const DEBRIEF = {
    detection: [
      { source: "Payment application logs (SIEM)", look: "PAN patterns; DEBUG payloads; unexpected access outside store hours", logic: 'alert when log_line matches /(?:^|[^0-9])(\\d{4} ){3}\\d{4}(?![0-9])/ → "possible PAN in logs"' },
      { source: "Cloud inventory / data map", look: "datasets whose region ≠ their residency rule; replicas and backups", logic: "flag dataset where region !startsWith 'eu-' AND classification = 'personal'" },
      { source: "Firewall ruleset diffs", look: "any→any rules, guest→CDE paths, rules added outside change windows", logic: "review rule where src='any' or (src='guest' AND dst in CDE)" },
      { source: "NTP / log pipeline health", look: "clock drift, retention < 12 months, tamper flags off", logic: "alert when ntp_offset_ms > 100 OR retention_days < 365" },
      { source: "ASV quarterly scans", look: "new external exposures on CDE-adjacent hosts; failed scans", logic: "open ticket for every ASV 'fail' and every new listening service" },
    ],
    mitigations: [
      { id: "PCI Req 1", text: "Segment the CDE; explicit deny-all between corporate and payment VLANs" },
      { id: "PCI Req 3/4", text: "Encrypt stored CHD; TLS everywhere; never log PANs or SAD" },
      { id: "PCI Req 7/8", text: "Least privilege; unique IDs; MFA for all CDE access" },
      { id: "PCI Req 10", text: "NTP sync, 12-month tamper-protected retention, SIEM review" },
      { id: "PCI Req 11", text: "Quarterly ASV scans + internal scans + pen tests" },
      { id: "GDPR Art. 25/32", text: "Privacy by design; security of processing (encryption, access control)" },
      { id: "GDPR Art. 33/34/35", text: "72-hour breach runbook; DPIAs for high-risk processing" },
      { id: "Locality", text: "Region strategy on the data map; geo-restrictions; place backups deliberately" },
    ],
    blue: [
      "Audits are evidence sports: an unlogged, unsynchronized, 90-day log trail is the same as no log trail.",
      "Segmentation is the cheapest scope-reduction control in PCI — draw the CDE boundary before the QSA does.",
      "Treat replicas, analytics copies and backups as first-class datasets in your data map.",
      "Attestations (SOC 2, AOC) only carry weight when the issuer is genuinely independent.",
      "Know each regime's teeth: PCI is contractual (processing at risk), GDPR is statutory (fines), locality can be either.",
    ],
    red: [
      "Flat networks are force multipliers: one foothold on the corporate LAN reached the card database through R-102.",
      "Attackers love missing NTP — unsynchronized timestamps shred your ability to reconstruct an incident.",
      "Scope creep is silent: every unmanaged replica of cardholder or personal data is another door to watch.",
    ],
    links: [
      { label: "PCI SSC — official document library (PCI DSS v4.0.1)", url: "https://www.pcisecuritystandards.org/document_library/" },
      { label: "EUR-Lex — GDPR full text (Regulation EU 2016/679)", url: "https://eur-lex.europa.eu/eli/reg/2016/679/oj" },
      { label: "gdpr.eu — practitioner-friendly GDPR reference", url: "https://gdpr.eu/" },
      { label: "CompTIA — Network+ N10-009 exam page", url: "https://www.comptia.org/en-us/certifications/network/" },
    ],
    next: [
      "CompTIA Security+ SY0-701, Domain 5 (Governance, Risk & Compliance) — the natural sequel to this chapter.",
      "N10-009 Objective 4.2 — the attack types your controls above are meant to catch.",
      "Read a real SAQ A-Merchant sample and an AOC to recognize the paperwork in the wild.",
      "Practice drawing a data map (dataset → region → rule) for your own environment — it is the deliverable every auditor asks for first.",
    ],
  };

  // ─── Widget data for Medium objectives ───
  const AUDIT_PARTIES = {
    items: [
      { id: "a", text: "Ingrid asks you to walk the data center next week and verify controls before the QSA arrives — Meridian staff auditing Meridian." },
      { id: "b", text: "BalticSupply, our wholesale customer, sends two of its security staff to audit us under schedule 7 of our supply contract." },
      { id: "c", text: "Halloway & Brand, an independent assessment firm with no stake in Meridian, conducts the PCI DSS assessment." },
      { id: "d", text: "Leo runs an internal vulnerability scan of the payment VLAN on Friday to find and rank gaps." },
      { id: "e", text: "Dr. Diallo performs a routine internal check of the records-of-processing register against GDPR Art. 30." },
    ],
    categories: [
      { id: "first", label: "First-party (internal)" },
      { id: "second", label: "Second-party (customer/partner)" },
      { id: "third", label: "Third-party (independent)" },
      { id: "assess", label: "Not an audit — assessment" },
    ],
    answer: { a: "first", b: "second", c: "third", d: "assess", e: "first" },
  };

  const FRAMEWORK_SORT = {
    items: [
      { id: "s1", text: "A contractual standard — losing card-brand acceptance is the real stick." },
      { id: "s2", text: "Applies to any organization that stores, processes or transmits cardholder data." },
      { id: "s3", text: "A personal data breach must reach the supervisory authority within 72 hours." },
      { id: "s4", text: "Fines can reach €20 million or 4 % of worldwide annual turnover." },
      { id: "s5", text: "The controller decides why data is processed; the processor acts on its behalf." },
      { id: "s6", text: "Which country's laws govern your data depends on where it physically lives." },
      { id: "s7", text: "Some countries legally require certain data to stay inside their borders." },
      { id: "s8", text: "Choosing a cloud region is a compliance decision, not just a latency one." },
      { id: "s9", text: "Segmenting the payment network shrinks the systems in assessment scope." },
    ],
    categories: [
      { id: "pci", label: "PCI DSS" },
      { id: "gdpr", label: "GDPR" },
      { id: "loc", label: "Data locality" },
    ],
    answer: { s1: "pci", s2: "pci", s3: "gdpr", s4: "gdpr", s5: "gdpr", s6: "loc", s7: "loc", s8: "loc", s9: "pci" },
  };

  // Audit R4/R5: correct positions rotate (q1 → 2nd, q2 → 3rd, q3 → 1st);
  // option lengths stay within one word of each other.
  const ATTESTATION_QS = [
    {
      id: "q1",
      prompt: "What exactly is Ticketron's SOC 2 Type II report?",
      options: [
        { id: "scan", label: "An automated vulnerability scan of Ticketron's network" },
        { id: "att", label: "An independent auditor's signed opinion on controls" },
        { id: "policy", label: "Their internal security policy document" },
        { id: "sla", label: "A service-level agreement about uptime" },
      ],
      correct: "att",
    },
    {
      id: "q2",
      prompt: "Why may Meridian rely on it?",
      options: [
        { id: "marketing", label: "Because Ticketron's marketing team approved the wording" },
        { id: "law", label: "Because a law requires vendors to carry one" },
        { id: "indep", label: "Because its issuer, Pratt & Lin, is independent" },
        { id: "trust", label: "Because we simply trust our vendor's word" },
      ],
      correct: "indep",
    },
    {
      id: "q3",
      prompt: "Which document will close Meridian's own PCI DSS assessment the same way?",
      options: [
        { id: "aoc", label: "An Attestation of Compliance issued by the QSA" },
        { id: "soc2", label: "A SOC 2 Type II report about Meridian" },
        { id: "nda", label: "A signed non-disclosure agreement with the assessor" },
        { id: "po", label: "A purchase order for the assessment" },
      ],
      correct: "aoc",
    },
  ];

  // Quiz design contract (audit R4/R5): correct-answer position rotates across
  // items; option word counts are balanced so the correct answer is never the
  // longest and stays within one word of the distractors.
  const QUIZ_MEDIUM = [
    {
      id: "QM1",
      prompt: "A coworker insists PCI DSS is a law passed by the EU parliament. What is the truth?",
      topic: "PCI DSS — contractual standard, not a law",
      options: [
        { id: "a", label: "It is an EU law, the twin of GDPR" },
        { id: "b", label: "It is a US federal banking law for merchants" },
        { id: "c", label: "It is contractual, enforced through the card brands" },
        { id: "d", label: "It binds a company only after a breach" },
      ],
      correct: "c",
      explain: "PCI DSS is issued by the PCI SSC (founded by the card brands) and binds you contractually — via merchant agreements — not by statute. The stick is financial: fines, higher fees, or losing the ability to process cards, and it binds before any breach. GDPR is the law; PCI is the contract — and no US federal law creates it.",
    },
    {
      id: "QM2",
      prompt: "At 09:12 Monday, unauthorized access to 38,400 EU customer records is confirmed. By when must the supervisory authority be notified?",
      topic: "GDPR Art. 33 — the 72-hour notification clock",
      options: [
        { id: "a", label: "Within 72 hours — by Thursday 09:12" },
        { id: "b", label: "Within 30 days of the incident report" },
        { id: "c", label: "By the next scheduled compliance audit" },
        { id: "d", label: "Never — hashed passwords are not personal data" },
      ],
      correct: "a",
      explain: "Art. 33: notify the supervisory authority without undue delay and, where feasible, within 72 hours of becoming aware. Hashed passwords are still personal data, so the clock runs — and waiting for the next audit or a 30-day window would both be violations. A delayed notification must be justified with written reasons.",
    },
    {
      id: "QM3",
      prompt: "What does data sovereignty mean?",
      topic: "Data sovereignty — governing law follows location",
      options: [
        { id: "a", label: "Data belongs to the cloud provider's home country" },
        { id: "b", label: "Backups are exempt from the local law" },
        { id: "c", label: "Strong encryption removes every legal jurisdiction" },
        { id: "d", label: "The storage location's laws govern the data" },
      ],
      correct: "d",
      explain: "Sovereignty follows the physical location: store in Frankfurt and German/EU rules reach it; store in Virginia and US rules can. That is why region selection, replicas and backups are compliance decisions — and why encryption does not grant immunity, while the provider's nationality changes nothing.",
    },
    {
      id: "QM4",
      prompt: "Which of these is an attestation?",
      topic: "Attestation — independent, signed opinion",
      options: [
        { id: "a", label: "The internal vulnerability scan report" },
        { id: "b", label: "An independent auditor's signed opinion on controls" },
        { id: "c", label: "A firewall change ticket from the SIEM" },
        { id: "d", label: "A vendor's marketing brochure about security" },
      ],
      correct: "b",
      explain: "An attestation is a formal, signed statement — by an independent, qualified party — that controls met criteria over a period. Ticketron's SOC 2 and Meridian's future AOC are both attestations. Scans, change tickets and brochures are evidence or noise, but no auditor signs an opinion over them.",
    },
    {
      id: "QM5",
      prompt: "Why does segmenting the CDE matter so much in PCI DSS?",
      topic: "Segmentation shrinks PCI assessment scope",
      options: [
        { id: "a", label: "It makes the payment network noticeably faster" },
        { id: "b", label: "It replaces the need for logging" },
        { id: "c", label: "It shrinks the systems inside assessment scope" },
        { id: "d", label: "It allows plaintext PAN storage under supervision" },
      ],
      correct: "c",
      explain: "Segmentation is not mandated by PCI DSS — but without it, every connected system joins the CDE and the assessment (and attack surface) balloons. Firewalls, ACLs and a drawn boundary keep scope and cost contained. Speed is a side effect, logging is still required, and plaintext PAN storage is never acceptable.",
    },
    {
      id: "QM6",
      prompt: "A US company sells online to EU customers. Does GDPR apply?",
      topic: "GDPR extraterritorial reach (Art. 3)",
      options: [
        { id: "a", label: "Yes — it protects people in the EU/EEA" },
        { id: "b", label: "No — only EU-headquartered companies fall under it" },
        { id: "c", label: "Only if the company exceeds 250 employees" },
        { id: "d", label: "Only when data is stored on EU soil" },
      ],
      correct: "a",
      explain: "GDPR is extraterritorial (Art. 3): offering goods/services to people in the EU is enough, whatever the company's headquarters or server locations. Storage location matters for transfers, but applicability follows the data subjects — a classic exam distinction.",
    },
  ];

  const QUIZ_HARD = [
    {
      id: "QH1",
      artifact: '2025-11-03T02:14:09Z pay-app INFO order=88121 card="4111 1111 1111 1111" resp=approved',
      prompt: "This line sits in your payment application's log archive. Correct response?",
      topic: "PANs in logs — Req 3 response and CDE scope",
      options: [
        { id: "a", label: "Rotate the database keys and leave the logs" },
        { id: "b", label: "Nothing — the line contains only test data" },
        { id: "c", label: "E-mail the archive to the acquirer as proof" },
        { id: "d", label: "Stop logging CHD, purge the archives, confirm scope" },
      ],
      correct: "d",
      explain: "Storing PANs unmasked in logs violates the protection requirements (Req 3) and makes those logs cardholder data — expanding the CDE. Fix the logging, purge/redact the archives, and account for the exposure window. Key rotation alone leaves the PANs in place; 'test data' and 'proof of compliance' misread what the archive now is.",
    },
    {
      id: "QH2",
      prompt: "Loyalty Plus, a new app for EU customers, must ship on StratusCloud this quarter. Which deployment passes review first?",
      topic: "Locality-safe cloud launch (region, replication, exposure)",
      options: [
        { id: "a", label: "Virginia region with EU replication for faster failover" },
        { id: "b", label: "Frankfurt region, EU-only replication, and geo-restricted admin access" },
        { id: "c", label: "Singapore region, cheapest, with a public export bucket" },
        { id: "d", label: "Frankfurt region with public EU customer exports" },
      ],
      correct: "b",
      explain: "EU personal data → EU region (locality/GDPR transfers), no cross-border replication without safeguards, admin access fenced to EU ranges, and no public exposure of customer exports. Option d fails on the public bucket even though the region is right — placement alone does not save a leaky design.",
    },
    {
      id: "QH3",
      prompt: "Ticketron sends its SOC 2 Type II report. What is it, and why is it useful to Meridian?",
      topic: "SOC 2 as attestation evidence for vendor due diligence",
      options: [
        { id: "a", label: "A law Ticketron obeys, transferring liability to Meridian" },
        { id: "b", label: "A vulnerability scan of Ticketron's network" },
        { id: "c", label: "An independent attestation of their controls over time" },
        { id: "d", label: "A guarantee no breach can ever reach Meridian" },
      ],
      correct: "c",
      explain: "SOC 2 Type II is an auditor's opinion that controls were designed AND operated effectively over a period. It is evidence — not liability transfer, not a scan, not a guarantee. It shows exactly what 'attestation' means: independence + opinion + period.",
    },
    {
      id: "QH4",
      prompt: "Alert fires Monday 06:40; investigation confirms personal-data exposure Wednesday 11:00. When does the 72-hour clock start?",
      topic: "Art. 33 awareness = reasonable certainty",
      options: [
        { id: "a", label: "Wednesday 11:00 — when the breach became certain" },
        { id: "b", label: "Monday 06:40 — every alert starts the clock" },
        { id: "c", label: "Friday 09:00 — the next business morning" },
        { id: "d", label: "Never — investigation time pauses the clock" },
      ],
      correct: "a",
      explain: "Art. 33 counts from when the controller 'becomes aware' — awareness means reasonable certainty that a personal data breach occurred, which arrives with Wednesday's confirmation. Alerts during triage do not start it; indefinite investigation does not pause it either.",
    },
    {
      id: "QH5",
      prompt: "The QSA asks: “Prove that administrative actions in the CDE are attributable to individuals.” Best evidence pack?",
      topic: "Attribution — unique IDs (Req 8) + trusted logs (Req 10)",
      options: [
        { id: "a", label: "The shared 'admin' password, stored in a spreadsheet" },
        { id: "b", label: "A screenshot of last week's favorite dashboard" },
        { id: "c", label: "A verbal assurance from the six engineers involved" },
        { id: "d", label: "Unique-ID inventory, MFA enrollment, synchronized tamper-proof logs" },
      ],
      correct: "d",
      explain: "Attribution = unique identities (Req 8) + authenticated access (MFA) + reliable, synchronized, unalterable logs (Req 10). Shared accounts make attribution impossible — an automatic finding — and screenshots or verbal assurances are not evidence a QSA can test.",
    },
    {
      id: "QH6",
      prompt: "Which single control most reduces PCI DSS assessment scope for Meridian?",
      topic: "Segmentation as the scope-reduction control",
      options: [
        { id: "a", label: "Buying a bigger SIEM for the security team" },
        { id: "b", label: "Segmenting the CDE from corporate and guest Wi-Fi" },
        { id: "c", label: "Renaming all the servers to include 'pci'" },
        { id: "d", label: "Doubling the password length on office laptops" },
      ],
      correct: "b",
      explain: "Scope follows connectivity to CHD. Cutting corporate/guest paths out of the payment VLAN (fixing R-102/R-104/R-107) removes whole systems from assessment. The others change nothing about what touches cardholder data — a SIEM watches scope, it does not shrink it.",
    },
    {
      id: "QH7",
      prompt: "Findings on your desk: flat CDE, full PANs in logs, EU replica in Virginia. Fix order and why?",
      topic: "Risk-based remediation order across regimes",
      options: [
        { id: "a", label: "Move the replica first; fix the network later" },
        { id: "b", label: "All three are equal — pick alphabetically" },
        { id: "c", label: "Segment and stop PAN logging first; replica next" },
        { id: "d", label: "None — the QSA will dictate the order" },
      ],
      correct: "c",
      explain: "Risk triage: an open attack path to CHD (segmentation failure + PANs in logs) is both a PCI violation and an active risk today; the Virginia replica is serious legal exposure but not an active intrusion path. Prioritize, but fix both — 'in parallel' is not 'never', and no assessor dictates your risk order.",
    },
  ];

  // ─── Glossary ───
  const GLOSSARY = [
    { id: "audit", term: "Audit", def: "A formal, systematic verification — against evidence — that controls meet a standard, performed by a defined party." },
    { id: "assessment", term: "Assessment", def: "An evaluation of security posture that finds and ranks gaps (e.g., a vulnerability assessment); less formal than an audit, which verifies against a standard." },
    { id: "attestation", term: "Attestation", def: "A formal, signed statement — typically by an independent auditor — that controls met requirements over a period (e.g., SOC 2 report, PCI Attestation of Compliance)." },
    { id: "compliance", term: "Compliance", def: "Operating in line with the laws, regulations and contractual standards that apply to the organization." },
    { id: "pci", term: "PCI DSS", def: "Payment Card Industry Data Security Standard — contractual rules for any organization that stores, processes or transmits cardholder data (v4.0.1 current)." },
    { id: "chd", term: "Cardholder data (CHD / PAN)", def: "The primary account number (PAN) plus cardholder name/expiry. Sensitive authentication data (e.g., CVV) must never be stored after authorization." },
    { id: "cde", term: "CDE — cardholder data environment", def: "The people, systems and networks that store, process or transmit cardholder data — the scope of a PCI DSS assessment." },
    { id: "segmentation", term: "Segmentation", def: "Isolating the CDE from other networks (VLANs, firewalls, ACLs) to shrink PCI scope and contain breaches." },
    { id: "qsa", term: "QSA", def: "Qualified Security Assessor — a professional/firm certified by the PCI SSC to assess PCI DSS compliance and issue a Report on Compliance (ROC)." },
    { id: "asv", term: "ASV scan", def: "Quarterly external vulnerability scan performed by an Approved Scanning Vendor (PCI DSS Req 11)." },
    { id: "gdpr", term: "GDPR", def: "EU Regulation 2016/679 protecting the personal data of people in the EU/EEA — applicable since 25 May 2018, extraterritorial reach." },
    { id: "controller", term: "Data controller", def: "The party that decides why and how personal data is processed." },
    { id: "processor", term: "Data processor", def: "The party that processes personal data on behalf of the controller." },
    { id: "locality", term: "Data locality", def: "The geographic location where data is stored — it determines which laws and contracts reach the dataset." },
    { id: "sovereignty", term: "Data sovereignty", def: "The principle that data is governed by the laws of the country where it physically resides." },
  ];

  const TOOLTIP_TERMS = {
    DPO: "Data Protection Officer — the required privacy lead under GDPR Art. 37; coordinates breach notification.",
    DPIA: "Data Protection Impact Assessment — required before high-risk processing (GDPR Art. 35).",
    "Geo-blocking": "Restricting access to systems or data based on the user's geography.",
    NTP: "Network Time Protocol — synchronizes system clocks so logs can be correlated (PCI DSS Req 10).",
    SCC: "Standard Contractual Clauses — pre-approved safeguards for cross-border personal-data transfers (GDPR Chapter V).",
    SAQ: "Self-Assessment Questionnaire — the PCI DSS validation route for smaller merchants (9 variants).",
    AOC: "Attestation of Compliance — the signed document that closes a PCI DSS assessment (ROC or SAQ).",
    ROC: "Report on Compliance — the detailed assessment report produced by a QSA.",
    PAN: "Primary Account Number — the 16-digit card number; storing it unprotected makes a system part of the CDE.",
    SAD: "Sensitive authentication data (CVV, PIN blocks, track data) — must never be stored after authorization.",
  };

  return {
    CASE_ID, LESSON_LABEL, OFFICIAL_ANCHOR, ZONES, CAST, MEMO, LETTERS, LEGACY_MEMO,
    FRAMEWORK_PCI, FRAMEWORK_GDPR, FRAMEWORK_LOCALITY,
    DIAGRAM_NODES, DIAGRAM_EDGES, FIREWALL_RULES, LOG_LINES, LOG_CONFIG,
    CLOUD_STORES, LAUNCH_CONFIG, BREACH_TICKET, FINDINGS_M10, LIFECYCLE_M12,
    INVENTORY_H1, TRIAGE_H2, LOCALITY_H3, FIREWALL_FIX_H4, EVIDENCE_H5,
    CONSEQUENCES_H6, LIFECYCLE_H7, ATTESTATION_H8, SPOTLIGHT_H9, DEBRIEF,
    AUDIT_PARTIES, FRAMEWORK_SORT, ATTESTATION_QS,
    QUIZ_MEDIUM, QUIZ_HARD, GLOSSARY, TOOLTIP_TERMS,
  };
})();
