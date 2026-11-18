"use strict";
/* =========================================================================
   js/data.js — ALL lab content (data only, no logic)
   CyberLab — The Vendor Risk Review Binder
   CompTIA Security+ SY0-801 · 5.3 Third-party risk management
   Synthetic training data only. Content is carried over 1:1 from the
   original lab (same wording, same correct answers, same hint tiers,
   same feedback messages), including the v4 audit rebuild of the quiz
   bank (R4 answer-position rotation, R5 length balance).
   ========================================================================= */

/* ---------------- Static texts (C1 briefing, C2 knowledge core, C6 field notes) ---------------- */
var TXT = {};

TXT.briefing = [
  { h: "Why this binder exists", p: [
    "Meridian Vale Health Network (MVHN) is a fictional regional healthcare network: three hospitals, 41 clinics, and a patient portal serving about 300,000 patients. Every day, outside organizations — EHR platforms, couriers, cloud hosts, testing firms — touch MVHN systems, data, or operations. When a vendor is breached, patients and regulators treat it as MVHN's breach; your contracts and your evidence decide how much of that risk you ever see coming.",
    "You are the third-party risk analyst in the Office of Security &amp; Risk. Your job this quarter is to run the <strong>Q3 Vendor Risk Review Cycle</strong>: select vendors with discipline, paper the relationship with the right agreements, evaluate assurance evidence, monitor what can be measured, and respect the limits of what third-party risk management can do.",
    "The five tabs of this binder are the five phases of the cycle — and they map one-to-one onto CompTIA Security+ SY0-801 objective 5.3: vendor selection, agreement types, vendor monitoring, limitations, and rules of engagement. Stamp every objective in the ledger to close the cycle."
  ]}
];

TXT.primer = { h: "Background readings — the five process groups", cards: [
  { t: "1 · Vendor selection", b: "Before any contract exists, procurement 'asks the market' in escalating form: an <b>RFI</b> (Request for Information) explores what exists while requirements are still being written; an <b>EOI</b> (Expression of Interest) builds a shortlist of qualified vendors; an <b>RFP</b> (Request for Proposal) scores full proposals against documented requirements; an <b>RFQ</b> (Request for Quote) prices a fully specified item. <b>Due diligence</b> is the investigation that happens before signature — security posture, incident response, certifications, financial stability, breach and legal history, and the vendor's own subcontractors (your <b>fourth parties</b>). <b>Conflict of interest</b>: when an evaluator has a stake in a bidder, disclose, document, and recuse the person — the vendor stays in the process." },
  { t: "2 · Agreement types", b: "An <b>MSA</b> (Master Services Agreement) is the umbrella: legal terms governing the whole relationship — liability, indemnity, term, dispute process. An <b>SOW</b> (Statement of Work) sits under it and pins down specific deliverables, milestones and price. An <b>SLA</b> (Service Level Agreement) makes service commitments enforceable — and each measurable target inside it is an <b>SLO</b> (Service Level Objective), like '99.95% monthly uptime'. An <b>NDA</b> protects confidential exchanges, often before anything else is signed. An <b>MOU</b> records a mutual understanding that is generally non-binding; an <b>MOA</b> (Memorandum of Agreement) is a formal, signed, binding commitment with definite obligations." },
  { t: "3 · Vendor monitoring", b: "Signing is the start of the relationship, not the end of the work. <b>Right-to-audit</b> clauses give you contractual permission to audit the vendor or review their independent audit reports. <b>Service-level monitoring</b> measures actual performance against the SLOs and triggers remedies. The <b>vendor registry</b> is the authoritative inventory — who has access to what, who owns the relationship, and what risk tier each vendor is. <b>Vendor assessment</b> (questionnaires, evidence requests, interviews, site visits) is repeated at a depth that follows the vendor's tier. <b>Compliance attestation</b> means relying on independent auditors: SOC 2 reports (Type I = design at a point in time; Type II = operating effectiveness over a period) and ISO/IEC 27001 certificates. <b>Penetration testing</b> of vendor-hosted systems is done under an agreed scope — the rules of engagement." },
  { t: "4 · Limitations", b: "Third-party risk management has hard limits, and the exam expects you to name them: <b>staffing limitations</b> (you cannot deeply assess 140 vendors with two analysts), <b>resource availability</b> (no SMEs, no lab, no window), <b>environment</b> (a multitenant cloud is not yours to test), <b>legal and regulatory factors</b> (PHI and privacy rules constrain what you may touch and demand), <b>geography/jurisdiction</b> (datacenters and fourth parties in other jurisdictions), <b>financial/return on investment</b> (a control must be proportionate to the loss it prevents), <b>vendor lock-in</b> (proprietary formats and servers make exit costly), and <b>assurance mechanisms</b> (you can only rely on the independent evidence the vendor can actually provide)." },
  { t: "5 · Rules of engagement", b: "When a vendor's systems are tested — by MVHN or by a testing firm — the <b>ROE</b> is the contract for the test itself: precise scope, permitted techniques, announced windows, escalation contacts, and how findings and data are handled. Out-of-scope findings are reported, not pursued. For shared platforms, other tenants are never in scope; isolation is verified through the provider's own attestations." }
], glossary: [
  ["Third party", "Any outside organization with access to your systems, data, or processes."],
  ["Fourth party", "A subcontractor engaged by your vendor — your vendor's vendor."],
  ["RFI", "Request for Information — open market exploration before requirements are final."],
  ["EOI", "Expression of Interest — vendor self-nomination used to build a shortlist."],
  ["RFP", "Request for Proposal — full proposals scored against documented requirements."],
  ["RFQ", "Request for Quote — price-only bids for a fully specified item."],
  ["Due diligence", "Pre-contract investigation of a vendor's security, finances, history, and subcontractors."],
  ["MSA", "Master Services Agreement — umbrella legal terms governing the whole relationship."],
  ["SOW", "Statement of Work — the specific deliverables, timeline, and price under the MSA."],
  ["SLA", "Service Level Agreement — the contract making service commitments enforceable, with remedies."],
  ["SLO", "Service Level Objective — one measurable target inside an SLA, e.g. 99.95% monthly uptime."],
  ["NDA", "Non-Disclosure Agreement — confidentiality obligations, often signed first."],
  ["MOU / MOA", "MOU: non-binding mutual understanding. MOA: formal, binding agreement with definite obligations."],
  ["Right to audit", "Contractual permission to audit the vendor's controls or review their audit reports."],
  ["Compliance attestation", "An independent auditor's report (SOC 2, ISO/IEC 27001) provided as assurance evidence."],
  ["Vendor registry", "Authoritative inventory of vendors: data access, owners, and risk tiers."],
  ["ROE", "Rules of Engagement — scope, techniques, windows, contacts and data handling for a test."],
  ["Vendor lock-in", "Dependence on proprietary systems that makes leaving the vendor costly."]
]};

TXT.notes = {};
TXT.notes.detection = { h: "Monitoring &amp; detection opportunities", items: [
  "<b>Service-level monitoring:</b> a monthly SLO report (uptime, response times, incident notification, patching) — compare each measured value against its target and act on every miss.",
  "<b>Registry signals:</b> vendors whose recorded data access no longer matches their risk tier are the ones that get breached quietly.",
  "<b>Attestation watch:</b> SOC 2 / ISO renewal dates, scope changes, and Type I vs Type II downgrades are early warnings of a decaying control environment.",
  "<b>Fourth-party changes:</b> subcontractor additions, acquisitions and 'proprietary arrangements' change your exposure without changing your contract.",
  "<b>Vendor assessment cadence:</b> questionnaires and interviews scheduled by tier — deepest for Critical vendors, and re-run after any material incident."
]};
TXT.notes.mitigation = { h: "Mitigation recommendations (with the concept each maps to)", items: [
  "<b>Before signature:</b> run the right RFx sequence, complete due diligence on all six dimensions, and resolve conflicts of interest by disclosure and recusal (vendor selection).",
  "<b>In the contract:</b> MSA + SOW + SLA with measurable SLOs, NDA — plus right-to-audit clauses, incident-notification SLOs, subcontractor flow-down and exit/transition terms (agreement types + monitoring rights).",
  "<b>Continuous:</b> maintain the vendor registry, tier it, and let assessment depth follow the tier (vendor monitoring, staffing limitations).",
  "<b>Assurance:</b> require current SOC 2 Type II / ISO 27001 from an independent auditor, scoped to the service you actually buy (compliance attestation, assurance mechanisms).",
  "<b>Testing:</b> pen-test vendor-hosted systems only under a written ROE with legal, environmental and data limits respected (rules of engagement)."
]};
TXT.notes.blue = { h: "Blue-team takeaways", items: [
  "The contract is a control. Missing clauses are missing controls — find them before the incident does.",
  "Tier the registry by data access and business dependency, then defend the tier with evidence; mis-tiering is how critical vendors end up unmonitored.",
  "Measure the vendor's promises: an SLA without measurable SLOs is marketing, not a control.",
  "Assurance evidence has a shelf life and a scope — check the type, the period, and what was actually audited.",
  "Document accepted residual risk where a control fails the ROI test — proportionality is part of the discipline."
]};
TXT.notes.red = { h: "Red-team mindset takeaways", items: [
  "Attackers pick the vendor with the weakest contract, not the weakest firewall: no right-to-audit, no notification SLO, no fourth-party flow-down means no visibility.",
  "Fourth parties are the soft underbelly — the subcontractor you have never heard of holds your data under your vendor's terms, or under nobody's.",
  "A stale or out-of-scope attestation is an attacker's favorite cover: it looks like diligence on a shelf.",
  "Vendors downplay breaches ('no customer data affected'); your own evidence collection is what makes their letter checkable.",
  "Lock-in is leverage: proprietary formats and data held hostage make your exit — and your negotiation — weaker."
]};

/* ---------------- Medium-mode widget content ---------------- */
var MED = {};

MED.railPhases = [
  { n: 1, name: "Intake &amp; Selection", blurb: "Ask the market, vet the vendors, clear the conflicts" },
  { n: 2, name: "Agreements", blurb: "Paper the relationship: MSA, SOW, SLA, SLO, NDA, MOU, MOA" },
  { n: 3, name: "Assurance &amp; Testing", blurb: "Verify attestations; test vendor systems under rules of engagement" },
  { n: 4, name: "Monitoring &amp; Registry", blurb: "Measure SLOs, maintain the registry, respect the limits" },
  { n: 5, name: "Debrief &amp; Sign-off", blurb: "Field notes, knowledge check, board resolution" }
];

MED.m1 = { kind: "Procurement documents — intake drawer",
  docs: [
    { id: "d1", title: "Document A — market outreach", text: "TO: clinical-analytics vendor community.\nMVHN is exploring clinical-data analytics capabilities. Tell us what platforms exist, what integrations they typically support, and what security attestations vendors in this space usually hold. No pricing yet — we are still writing our requirements." },
    { id: "d2", title: "Document B — call for registration", text: "CALL FOR EXPRESSIONS OF INTEREST.\nMVHN invites qualified vendors of clinical analytics platforms to register their interest and qualify for the shortlist. Statements of capability due in three weeks. Shortlisted vendors will receive the full requirements package." },
    { id: "d3", title: "Document C — requirements package", text: "REQUEST FOR PROPOSAL — Clinical Analytics Platform.\nFull requirements attached: security architecture, interoperability with the EHR, support model, and pricing. Proposals will be scored by the evaluation committee against published criteria. Security questionnaire and reference customers required." },
    { id: "d4", title: "Document D — item pricing", text: "REQUEST FOR QUOTE.\nItem: secure disposal consoles, model SD-400 or approved equal, quantity 120, per the attached security specification (lockable, chain-of-custody logging, UL rated). Provide unit price and delivery schedule." }
  ],
  options: [
    ["RFI", "Explore the market while requirements are still open (RFI)"],
    ["EOI", "Build a shortlist of qualified, interested vendors (EOI)"],
    ["RFP", "Score full proposals against documented requirements (RFP)"],
    ["RFQ", "Price a fully specified item (RFQ)"]
  ]};

MED.m2 = { kind: "Nimbus Chart Systems — due diligence file",
  intro: "Nimbus Chart Systems is the leading finalist for the clinical analytics platform. Before MVHN signs anything, the diligence file must prove six dimensions. Match each artifact to the dimension it evidences (each artifact is used exactly once).",
  dims: [
    ["sec", "Security posture"],
    ["ir", "Incident response"],
    ["cert", "Certifications &amp; attestations"],
    ["fin", "Financial stability"],
    ["legal", "Breach &amp; legal history"],
    ["fourth", "Fourth parties / subcontractors"]
  ],
  arts: [
    ["c", "SOC 2 Type II report (Security · Availability · Confidentiality) and ISO/IEC 27001 certificate"],
    ["a", "Completed 120-question security questionnaire — access control, encryption, SDLC, logging, sub-processor handling"],
    ["f", "Current subcontractor list with systems touched and data accessed — a hosting partner and an after-hours support desk"],
    ["d", "Audited financial statements for the last two fiscal years, from an independent CPA firm"],
    ["e", "Litigation search results and disclosure of one 2023 breach notification (routing misconfiguration, 900 records)"],
    ["b", "Incident-response runbook summary plus two real incident post-mortems from the past year"]
  ]};

MED.m3 = { kind: "Evaluation committee — conflict of interest",
  text: "R. Okafor, MVHN's analytics lead and a scoring member of the Nimbus evaluation committee, worked at Nimbus for six years before joining MVHN and still holds vested stock options in Nimbus's parent company. Nimbus is one of four finalists. What does MVHN do?",
  options: [
    ["disqualify", "Disqualify Nimbus — the conflict taints the vendor."],
    ["promise", "Continue scoring; ask Okafor to promise neutrality."],
    ["recuse", "Disclose, document, and recuse Okafor; Nimbus stays."],
    ["cancel", "Cancel the procurement and start over."]
  ]};

MED.m4 = { kind: "The Nimbus engagement — agreement drawer",
  intro: "Seven role descriptions from the Nimbus engagement and related MVHN relationships. Assign the agreement type each role calls for (each type used exactly once).",
  types: [["MSA","MSA"],["SOW","SOW"],["SLA","SLA"],["SLO","SLO"],["NDA","NDA"],["MOU","MOU"],["MOA","MOA"]],
  roles: [
    ["r5", "Signed before diligence begins, so Nimbus can share architecture documents and configurations without confidentiality risk."],
    ["r2", "Phase-one deliverables: interface build-out, data migration, two training cycles, acceptance criteria, price and schedule."],
    ["r7", "MVHN and Corvus Billing Partners sign a formal, binding document setting out each party's definite obligations for the claims-interface project, with signatures."],
    ["r1", "Umbrella legal terms for the entire Nimbus relationship — liability caps, indemnification, dispute process, term."],
    ["r4", "One specific measurable target inside those commitments: 99.95% monthly availability of the Nimbus platform."],
    ["r6", "MVHN and County EMS record a non-binding understanding to coordinate annual incident-response exercises; no enforceable obligations."],
    ["r3", "The enforceable commitments section: availability, incident response and notification commitments — and the remedies when they are missed."]
  ]};

MED.m5 = { kind: "Boreal Cloud Hosting — drafting the SLOs",
  intro: "Boreal Cloud Hosting will serve MVHN's patient-portal infrastructure. The SLA is being drafted. Select every clause that states a measurable SLO target — the clauses a monthly report could be graded against.",
  clauses: [
    ["s4", "Boreal will provide excellent, highly available service at all times."],
    ["s1", "Monthly platform availability at or above 99.95%, measured per calendar month on the published dashboard."],
    ["s5", "MVHN data breaches will be reported without unnecessary delay."],
    ["s2", "Critical-severity incident response begins within 15 minutes, 24×7×365."],
    ["s3", "Service credits of 10% of the monthly fee per missed target, capped at 50% of the monthly fee."],
    ["s6", "Confirmed security incidents affecting MVHN data are reported to MVHN within 24 hours of confirmation."]
  ]};

MED.m6 = { kind: "Right-to-audit — which relationships need it, and what it buys",
  intro: "Right-to-audit clauses are not free — vendors resist them. Choose which of these MVHN relationships should carry a right-to-audit clause, then pick what the clause actually entitles MVHN to do.",
  vendors: [
    ["v3", "Office coffee supplier — no systems access, no data, monthly invoicing"],
    ["v1", "Nimbus Chart Systems — Critical tier, hosts the clinical analytics platform and PHI"],
    ["v2", "County EMS partnership — MOA partner for coordinated response, shares incident data"]
  ],
  enable: [
    ["unlimited", "Unlimited, unannounced access to any vendor facility"],
    ["audit", "Audit controls, or review audit reports, on notice"],
    ["terminate", "Termination without notice at any time"],
    ["pentest", "A free annual penetration test performed by MVHN"]
  ]};

MED.m9 = { kind: "Nimbus assurance drawer — accept or reject",
  intro: "The Nimbus engagement starts next month (Q3 2026). Verify each assurance artifact: accept it as evidence or reject it, and for every rejection pick the reason.",
  arts: [
    { id: "a1", text: "SOC 2 Type II — period 2025-04-01 → 2026-03-31 — Trust Services: Security, Availability, Confidentiality — auditor: Halstead &amp; Marsh LLP", verdict: "accept" },
    { id: "a2", text: "SOC 2 Type I — design of controls as of 2024-09-30 — auditor: Halstead &amp; Marsh LLP", verdict: "reject",
      reasons: [["r21", "The audit firm lacks accreditation"], ["r23", "Availability is never covered by SOC"], ["r22", "Design-only, and the date is stale"]] },
    { id: "a3", text: "ISO/IEC 27001 certificate — issued June 2025 — scope: Nimbus Chart cloud platform — accredited certification body", verdict: "accept" },
    { id: "a4", text: "Penetration test summary — written by Nimbus's own engineering team, dated last month", verdict: "reject",
      reasons: [["r43", "It is too recent to be useful"], ["r42", "Vendor-written — no independent auditor"], ["r41", "Pen test summaries are always rejected"]] }
  ]};

MED.m10 = { kind: "Kestrel Cyber Testing — assemble the ROE",
  intro: "Kestrel Cyber Testing will test MVHN's patient-portal staging environment and the Nimbus-hosted analytics application (MVHN tenant). Select every clause that belongs in the Rules of Engagement. Clauses left out must violate a scope, legal, or environment limit — the debrief explains each.",
  clauses: [
    ["c1", "Scope: MVHN patient-portal staging environment and the Nimbus-hosted analytics application (MVHN tenant only)", true],
    ["c8", "Social-engineering calls against MVHN clinic staff", false],
    ["c2", "Permitted techniques: web-application and API testing, authentication-bypass attempts against listed hosts", true],
    ["c9", "Use live PHI samples for realistic attack data", false],
    ["c3", "Test window: announced — two consecutive weekends, 02:00–06:00", true],
    ["c7", "Physical testing inside the Boreal datacenter", false],
    ["c4", "Contacts and escalation: Kestrel engagement lead ↔ MVHN SOC on-call, with a severity-based escalation path", true],
    ["c10", "Probe neighboring Nimbus tenants to verify isolation", false],
    ["c5", "Data handling: synthetic patient records only; no real PHI; findings encrypted at rest and destroyed after acceptance", true],
    ["c6", "Findings handling: written report within 10 business days; critical findings by phone immediately; demonstrate, do not exploit beyond proof of concept", true]
  ]};

MED.m7 = { kind: "Boreal Cloud Hosting — monthly SLA report (September)",
  intro: "Read the measured values against each target, mark every commitment Met or Missed, and choose the follow-up for each miss.",
  cols: ["SLO target", "Measured", "Your verdict", "Follow-up"],
  rows: [
    { id: "row1", slo: "Monthly availability ≥ 99.95%", val: "99.71%", verdict: "missed", action: "credit" },
    { id: "row2", slo: "Critical-incident response begins ≤ 15 min", val: "9 min (median)", verdict: "met", action: "none" },
    { id: "row3", slo: "Security-incident notification ≤ 24 h", val: "31 hours", verdict: "missed", action: "credit" },
    { id: "row4", slo: "Critical patches applied ≤ 30 days", val: "22 days (max)", verdict: "met", action: "none" },
    { id: "row5", slo: "Monthly SLA report delivered by 5th business day", val: "Delivered on the 9th", verdict: "missed", action: "log" }
  ],
  verdicts: [["met", "Met"], ["missed", "Missed"]],
  actions: [["credit", "Apply service credits and require a remediation plan"], ["log", "Log the miss and watch next month's report"], ["none", "No action needed"]]};

MED.m8 = { kind: "Vendor registry — Q3 filing",
  intro: "File each vendor into the registry: assign the risk tier and the data-access level. Then decide where this quarter's deepest assessment hours go — staffing note: two analysts, 140 vendors, 12 assessment hours per quarter.",
  tiers: [["critical", "Critical"], ["high", "High"], ["low", "Low"]],
  access: [["stores", "Stores PHI (system of record)"], ["processes", "Processes or transmits PHI"], ["none", "No PHI access"]],
  vendors: [
    ["Nimbus Chart Systems", "Clinical analytics platform; 24×7 clinical dependency; ~40% of patient records flow through it"],
    ["Corvus Analytics", "New analytics startup; requests aggregated patient datasets for research dashboards"],
    ["Boreal Cloud Hosting", "Hosts the patient-portal infrastructure — login, appointment flow, message center"],
    ["Talon Managed Print", "Office print fleet and managed supplies; no clinical workflows"]
  ],
  depthQ: "Twelve assessment hours are budgeted this quarter. Where does the deepest assessment go?",
  depthOpts: [
    ["corvus", "Corvus first — it is the newest vendor"],
    ["equal", "Equal depth across all 140 vendors"],
    ["nimbus-only", "Nimbus alone — largest PHI footprint"],
    ["critical-first", "Nimbus and Boreal — Critical tier first"]
  ]};

MED.m11 = { kind: "Limitations desk — four cases, four constraints",
  intro: "Four constraint cases landed on your desk this quarter. Name the limitation each case demonstrates (choose from the eight official limitation categories), then choose the proportionate response.",
  cases: [
    { id: "case1", text: "Two analysts cover 140 vendors. On-site deep-dives for every vendor are impossible.",
      limit: "staffing", resp: "resp1" },
    { id: "case2", text: "Boreal's failover datacenter sits in another jurisdiction, under different data-protection laws.",
      limit: "geography", resp: "resp1" },
    { id: "case3", text: "A $250,000 private single-tenant instance would prevent an estimated $90,000 per year in expected loss.",
      limit: "roi", resp: "resp1" },
    { id: "case4", text: "Vendor SMEs and MVHN's test lab are both booked out for the whole quarter.",
      limit: "resource", resp: "resp1" }
  ],
  limitOpts: [
    ["staffing", "Staffing limitations"], ["resource", "Resource availability"], ["environment", "Environment"],
    ["legal", "Legal and regulatory factors"], ["geography", "Geography / jurisdiction"],
    ["roi", "Financial / return on investment (ROI)"], ["lockin", "Vendor lock-in"], ["assurance", "Assurance mechanisms"]
  ],
  respOpts: {
    case1: [["resp2", "Assess only vendors that complain"], ["resp1", "Tier the registry; depth follows tier"], ["resp3", "Pause all assessing until hiring lands"]],
    case2: [["resp2", "Ignore it — failover happens rarely"], ["resp3", "Move all data to basement servers"], ["resp1", "Contract data-residency; verify first"]],
    case3: [["resp1", "Take the proportionate control; document risk"], ["resp2", "Buy it — security has no ceiling"], ["resp3", "Drop the vendor relationship entirely"]],
    case4: [["resp2", "Assess anyway, without SMEs or lab"], ["resp1", "Reschedule early; lean on attestations"], ["resp3", "Drop the vendor from the registry"]]
  }};

MED.m12 = { kind: "Talon Managed Print — the lock-in review",
  intro: "Three years in, MVHN's print queues, rules and accounting all live inside Talon's proprietary server and formats. Talon's renewal is due. Select every clause that should go into the renewal to reduce vendor lock-in, then name the core risk.",
  clauses: [
    ["x1", "Data export in open, documented formats — updated continuously, at no charge", true],
    ["x5", "Accept Talon's proprietary formats as-is — they are the industry standard", false],
    ["x2", "Contractual transition assistance of at least 90 days at pre-agreed rates", true],
    ["x6", "Five-year auto-renewal with penalties for early exit", false],
    ["x3", "Escrow for the proprietary print-management server configuration and source", true],
    ["x4", "Annual exit-cost review attached to the SOW", true]
  ],
  riskQ: "What is the core lock-in risk with Talon?",
  riskOpts: [
    ["risk2", "Unfriendly, slow vendor technicians"],
    ["risk1", "Everything lives in proprietary formats"],
    ["risk3", "Toner consumption is too high"]
  ]};

/* ---------------- Hard-mode widget content (War Room) ---------------- */
var HARD = {};

HARD.banner = {
  kicker: "War room · Incident desk · 2026-11-13 07:42",
  title: "Peregrine breach — the subcontractor MVHN never assessed",
  p: [
    "Peregrine Medical Logistics — MVHN's courier for lab specimens and pharmaceuticals — reports a ransomware event at <strong>SwiftFreight Line</strong>, the subcontractor that runs their regional overnight routes. Patient shipment manifests (names, pickup and drop-off addresses, specimen types) sat on SwiftFreight systems from November 1–8. The Q3 vendor registry lists Peregrine as <strong>Low risk</strong>.",
    "The board convenes the war room. Ten challenges are on the desk. Evidence is noisy — two items in the tray are red herrings. Exact sets, exact names, exact sequence: near-misses are rejected with a reason."
  ]
};

HARD.tray = [
  { id: "e3", title: "E3 · SwiftFreight press notice", summary: "'Isolated incident… no customer data affected.' Contradicted by E1." },
  { id: "e6", title: "E6 · Email — Nimbus NDA renewal reminder", summary: "Routine renewal notice for an unrelated vendor." },
  { id: "e1", title: "E1 · Breach notification letter — Peregrine CISO", summary: "Ransomware at SwiftFreight Line; manifests Nov 1–8 exposed; notified MVHN within ~17 hours of confirmation.", open: true },
  { id: "e7", title: "E7 · Boreal monthly SLA report", summary: "All targets met. Good news — for a different vendor." },
  { id: "e2", title: "E2 · Peregrine contract binder excerpt (2023)", summary: "MSA + SOW + SLA + NDA — read clause by clause; some protections are missing." },
  { id: "e4", title: "E4 · MVHN vendor registry entry — Peregrine", summary: "Tier: Low. Access: shipping manifests incl. patient addresses. Last assessment: none." },
  { id: "e5", title: "E5 · SwiftFreight SOC 2 report abstract", summary: "Type I, dated 2024-06-30, scope: 'corporate IT and shipping-software development'." }
];

HARD.evidence = {
  e1: [
    "FROM: Chief Information Security Officer, Peregrine Medical Logistics",
    "TO: MVHN Office of Security &amp; Risk",
    "RE: Security incident at our subcontractor — SwiftFreight Line",
    "On 2026-11-12 at 14:30 we confirmed a ransomware event on SwiftFreight Line systems. SwiftFreight operates our regional overnight routes under subcontract. Shipment manifests for 2026-11-01 through 2026-11-08 were on the affected systems; manifests include patient names, pickup/drop-off addresses, and specimen types for routes serving your facilities.",
    "SwiftFreight states the incident is contained. Our subcontractor arrangements are proprietary; we will share details as legally required. We discovered the event on 11-12 and are notifying you within hours of confirmation, as a courtesy. — P. CISO"
  ],
  e2: [
    "MASTER SERVICES AGREEMENT (2023) — Peregrine ↔ MVHN. Liability cap: 12 months of fees. No security schedule attached. No right-to-audit clause anywhere in the document.",
    "STATEMENT OF WORK (2023) — Courier services: overnight specimen and pharmaceutical routes, pickup windows, chain-of-custody paper logs.",
    "SERVICE LEVEL AGREEMENT (2023) — SLOs: pickup-window adherence ≥ 98%; tracking-portal availability ≥ 99.9%. Silent on security-incident notification; silent on data retention of manifests.",
    "NDA (2023) — mutual, covers shared operational data.",
    "CLAUSE 11 — SUBCONTRACTING: 'Peregrine may engage subcontractors at its discretion, with written notice to MVHN.'"
  ],
  e3: [
    "SWIFTFREIGHT LINE — PRESS NOTICE (2026-11-12): 'SwiftFreight experienced an isolated incident affecting a portion of our back office. Operations continue normally. No customer data was affected.' (Contradicted by E1's manifest disclosure.)"
  ],
  e4: [
    "MVHN VENDOR REGISTRY — PEREGRINE MEDICAL LOGISTICS",
    "Tier: LOW · Owner: Procurement · Onboarded: 2023-05 · Last assessment: none on record · Monitoring: none assigned.",
    "Data access (recorded at onboarding): shipping manifests, including patient names and addresses.",
    "Registry note (2025): 'courier services, non-clinical' — tier never revisited."
  ],
  e5: [
    "SOC 2 REPORT ABSTRACT — SWIFTFREIGHT LINE",
    "Report type: SOC 2 Type I — design of controls, as of 2024-06-30.",
    "Scope: corporate IT and shipping-software development.",
    "Auditor: Halstead &amp; Marsh LLP (independent).",
    "(Freight forwarding and logistics operations are not mentioned in the scope.)"
  ],
  e6: [ "Routine annual reminder: the Nimbus Chart Systems NDA renews in 30 days. No action needed unless terms change." ],
  e7: [ "Boreal Cloud Hosting — September SLA report: availability 99.97% (target 99.95%), response 11 min (target ≤15), notification 6 h (target ≤24). All commitments met. No action." ]
};

HARD.h3 = { kind: "Challenge 3 · Contract gap analysis (E2)",
  intro: "Read the binder excerpt again. Select exactly the three protections whose absence made this incident worse.",
  opts: [
    ["gap-mou", "Sign an MOU directly between MVHN and SwiftFreight — a gesture document"],
    ["gap-notify", "A security-incident-notification SLO in the SLA (e.g., notify within 24 h of confirmation)"],
    ["gap-rfq", "Issue an RFQ to reprice replacement courier services"],
    ["gap-audit", "A right-to-audit clause in the MSA"],
    ["gap-msa", "Layer a second MSA on top of the 2023 MSA"],
    ["gap-fourth", "Fourth-party flow-down: prior written approval plus security obligations for any subcontractor"],
    ["gap-escrow", "Escrow Peregrine's dispatch source code for safekeeping"],
    ["gap-uptime", "Add an uptime SLO for the tracking portal (one already exists)"]
  ]};

HARD.h4 = { kind: "Challenge 4 · The diligence check that was skipped (E1, E2, E4)",
  intro: "Peregrine onboarded in 2023, before MVHN's current diligence standard. Answer both parts.",
  q1: "Which due-diligence dimension would most directly have surfaced the SwiftFreight exposure?",
  q1opts: [
    ["fin", "Audited financial statements for two fiscal years"],
    ["fourth", "Fourth-party / subcontractor disclosure during due diligence"],
    ["ref", "Reference calls with existing customers"],
    ["legal", "Litigation search and breach-disclosure history"]
  ],
  q2: "Going forward, what evidence should MVHN demand about subcontractors?",
  q2opts: [
    ["ev2", "A verbal assurance from the Peregrine account manager"],
    ["ev1", "Current Type II on freight ops, plus flow-down"],
    ["ev3", "SwiftFreight's marketing website and press notices"],
    ["ev4", "Nothing — subcontractors are the vendor's problem"]
  ]};

HARD.h5 = { kind: "Challenge 5 · Containment sequence",
  intro: "Build the response sequence. Click actions from the bank to add them to the plan in order; reorder inside the plan with the arrows. The order must be exact.",
  actions: [
    ["a1", "Suspend Peregrine integrations and API access"],
    ["a2", "Notify the privacy office; start the PHI-exposure assessment"],
    ["a3", "Request Peregrine's incident report; preserve shared evidence under legal hold"],
    ["a4", "Invoke contractual remedies under the MSA (breach notice, cure period)"],
    ["a5", "Re-tier Peregrine in the vendor registry and brief leadership"]
  ]};

HARD.h6 = { kind: "Challenge 6 · Assurance verification (E5)",
  intro: "SwiftFreight's SOC 2 abstract (E5) is on the desk. Select exactly the three defects that make it inadequate assurance for freight operations.",
  opts: [
    ["d5", "The abstract is shorter than the full report would be"],
    ["d1", "Type I — design only, at a single point in time; no operating effectiveness over a period"],
    ["d6", "The report does not include page numbers or appendices"],
    ["d2", "Stale — the report date (2024-06-30) is over two years old"],
    ["d4", "The auditor being named in the report (all reports name theirs)"],
    ["d3", "Scope mismatch — 'corporate IT and shipping-software development' excludes freight and logistics operations"]
  ]};

HARD.h7 = { kind: "Challenge 7 · Why MVHN cannot audit SwiftFreight directly (E1, E2)",
  intro: "The board asks: 'Why not just audit SwiftFreight ourselves tomorrow?' Select exactly the three limitation categories that make direct audit infeasible.",
  opts: [
    ["l-lockin", "Vendor lock-in — proprietary systems make exit costly"],
    ["l-legal", "Legal and regulatory factors — MVHN has no contract with SwiftFreight (no privity), so no authority to audit; rights flow only through Peregrine"],
    ["l-roi", "Financial / return on investment — the control budget is limited this year"],
    ["l-geo", "Geography / jurisdiction — SwiftFreight operates routes and systems from outside MVHN's jurisdiction"],
    ["l-staffing", "Staffing limitations — two analysts cannot travel out to audit"],
    ["l-assurance", "Assurance mechanisms — the only independent evidence on offer is a weak attestation, so MVHN must rely on what Peregrine can compel"],
    ["l-resource", "Resource availability — no SMEs are free for the engagement"],
    ["l-env", "Environment — MVHN's own systems run on a multitenant cloud"]
  ]};

HARD.h8 = { kind: "Challenge 8 · Remediation — rebuild the contract",
  intro: "Legal is redlining Peregrine's binder in 30 days (renewal window). Select exactly the five amendments that close the gaps this incident exposed.",
  opts: [
    ["m-notify", "Add a security-incident-notification SLO (≤ 24 h) to the SLA"],
    ["m-rfq", "Issue an RFQ to reprice replacement courier services"],
    ["m-audit", "Add a right-to-audit clause to the MSA (audit or review audit reports)"],
    ["m-mou", "Sign an MOU directly with SwiftFreight to show goodwill"],
    ["m-fourth", "Require prior written approval plus security flow-down for any subcontractor"],
    ["m-term", "Terminate all courier vendors immediately and rebid"],
    ["m-nda", "Extend NDA confidentiality to bind subcontractors (flow-down)"],
    ["m-escrow", "Escrow Peregrine's dispatch source code for safekeeping"],
    ["m-ret", "Add data-retention and certified return/destruction terms for shipment manifests"]
  ]};

HARD.h9 = { kind: "Challenge 9 · Re-tier Peregrine (E4 + everything on the desk)",
  intro: "Fix the registry. Choose Peregrine's new tier, then select every evidence item that justifies it (and nothing that does not).",
  tiers: [["low", "Low"], ["high", "High"], ["critical", "Critical"]],
  justOpts: [
    ["j1", "Manifests expose patient names and addresses (PHI)"],
    ["j5", "Deliveries have been on time for three years"],
    ["j2", "A fourth-party ransomware incident has already occurred"],
    ["j6", "The NDA was signed in 2023"],
    ["j3", "Overnight specimen/pharmaceutical routes are a logistics dependency for all three hospitals"],
    ["j4", "Assurance posture is weak: stale, out-of-scope Type I only"]
  ]};

HARD.h10 = { kind: "Challenge 10 · The monitoring plan for logistics vendors",
  intro: "The board funds a permanent logistics-vendor monitoring plan. Select exactly the five signals it must include.",
  opts: [
    ["s1", "Service-level monitoring — including the new incident-notification SLO"],
    ["s6", "Nimbus uptime dashboard (already in its own Critical-tier plan)"],
    ["s2", "Attestation renewal dates — annual SOC 2 / ISO review per vendor"],
    ["s7", "Talon toner-consumption and supplies reports"],
    ["s3", "Fourth-party and subcontractor change notifications"],
    ["s8", "Kestrel ROE updates for the annual test cycle"],
    ["s4", "Sector threat-intel and breach news for logistics vendors"],
    ["s9", "Office-supplier insurance certificate renewals"],
    ["s5", "Registry review cadence with re-tiering triggers"]
  ]};

HARD.h1 = { intro: "Select every tray item that is material to deciding MVHN's response. Two items are red herrings — they are real documents about the wrong vendors." };

/* ---------------- Knowledge checks (C5) ----------------
   AUDIT REBUILD (QA-2/QA-3): correct-answer positions rotate
   (medium: 2,0,3,1,2,0,3 · hard: 1,2,0,3,1,0,2) and option lengths
   are balanced so length/position never reveal the answer. */
var QUIZ = {};

QUIZ.medium = [
  { id: "mq1", q: "MVHN wants to understand what secure messaging gateways exist and what they typically cost before writing requirements. Which document goes to the market?",
    opts: [["rfp", "An RFP — Request for Proposal"], ["rfq", "An RFQ — Request for Quote"], ["rfi", "An RFI — Request for Information"], ["sow", "An SOW — Statement of Work"]],
    ans: "rfi",
    ex: "An RFI explores the market while requirements are still open — no pricing, no scoring. An RFP scores full proposals against fixed requirements; an RFQ prices a fully specified item; an SOW is a contract document, not a market question." },
  { id: "mq2", q: "Which pair correctly separates the umbrella contract from the specific work?",
    opts: [["a", "MSA holds umbrella terms; the SOW pins deliverables"], ["b", "The SOW holds umbrella terms; the MSA pins deliverables"], ["c", "Both documents carry identical weight and scope"], ["d", "The MSA replaces the SOW once work begins"]],
    ans: "a",
    ex: "The MSA governs the whole relationship — liability, indemnity, term; SOWs are issued under it per project with deliverables, acceptance criteria and price. Swapping the roles (b), or collapsing them (c, d), breaks the contract stack." },
  { id: "mq3", q: "What is the relationship between an SLA and an SLO?",
    opts: [["a", "They are two spellings of the same commitment"], ["b", "The SLO overrides the SLA when uptime is measured"], ["c", "An SLO is a contract; an SLA is a target inside it"], ["d", "The SLA is the contract; an SLO is one target in it"]],
    ans: "d",
    ex: "'99.95% monthly availability' is an SLO — one measurable target. The SLA is the contract that makes hitting or missing it consequential: credits, cure periods, termination rights. Option c inverts the pair." },
  { id: "mq4", q: "Which statement about MOU and MOA is correct?",
    opts: [["a", "Both are binding contracts for purchasing services"], ["b", "An MOU is non-binding understanding; an MOA binds"], ["c", "An MOU binds; an MOA is a non-binding understanding"], ["d", "Both are mandatory attachments to every RFP"]],
    ans: "b",
    ex: "An MOU records 'we understand each other and intend to cooperate' — generally non-binding. An MOA is signed, with definite obligations for each party — enforceable. Neither belongs in the RFx sequence (d)." },
  { id: "mq5", q: "A vendor offers a SOC 2 Type I dated last month instead of a Type II. Why does the type matter?",
    opts: [["a", "Type I runs for a full year; Type II covers one day"], ["b", "Type II is for cloud vendors; Type I is for auditors"], ["c", "Type II tests controls over time; Type I, design only"], ["d", "The two types differ only in the auditor's signature"]],
    ans: "c",
    ex: "Design on paper (Type I, at one point in time) does not prove controls operated over months of real usage. For a Critical vendor, MVHN wants a recent Type II — scoped to the service actually being bought." },
  { id: "mq6", q: "Talon's print rules live only in proprietary formats. Which limitation is this — and what fixes it?",
    opts: [["a", "Vendor lock-in — cure it with exit clauses"], ["b", "Staffing limits — cure it with more analysts"], ["c", "Environment limits — cure it with cloud moves"], ["d", "Assurance limits — cure it with a SOC 2"]],
    ans: "a",
    ex: "Lock-in is dependence on proprietary formats and servers that makes leaving costly. The cure is contractual: open documented exports, transition assistance, escrow, annual exit-cost reviews. Analysts, cloud moves and attestations address different limitations entirely." },
  { id: "mq7", q: "A selection-committee member's spouse works at a bidding vendor. Correct handling?",
    opts: [["a", "Disqualify the vendor from the current procurement"], ["b", "Accept a verbal promise of neutrality and proceed"], ["c", "Cancel the procurement and restart it from scratch"], ["d", "Disclose, document, recuse the member — vendor stays"]],
    ans: "d",
    ex: "The conflict belongs to the evaluator, not the vendor: disclosure plus recusal protects scoring integrity while the bidder stays in the process. Disqualification punishes the wrong party (a); promises are not controls (b); cancellation is disproportionate (c)." }
];

QUIZ.hard = [
  { id: "hq1", q: "A vendor answers 'not applicable' to every encryption question but holds a current ISO/IEC 27001 certificate. Best next step?",
    opts: [["a", "Accept the certificate — it covers all services fully"], ["b", "Keep them in, but demand service-scoped evidence"], ["c", "Disqualify them for hiding encryption answers"], ["d", "Drop the questionnaire and rely on references"]],
    ans: "b",
    ex: "The certificate proves an ISMS exists; it does not answer how THIS service encrypts data. Attestations and questionnaires complement each other — neither replaces the other, and neither fact alone justifies disqualification." },
  { id: "hq2", q: "Procurement must price 200 already-specified secure shredding consoles (model fixed, spec attached). Which RFx?",
    opts: [["a", "RFI"], ["b", "EOI"], ["c", "RFQ"], ["d", "RFP"]],
    ans: "c",
    ex: "When the item is fully specified and only price and schedule matter, it is an RFQ. RFI = explore, EOI = shortlist, RFP = score full proposals against requirements." },
  { id: "hq3", q: "A draft SLO reads: 'Fast response to incidents.' Fix it.",
    opts: [["a", "Rewrite it with a real threshold: 15 minutes"], ["b", "Delete it — incident speed cannot be measured"], ["c", "Promote it into the MSA for more weight"], ["d", "Add 'and we mean it' for enforceability"]],
    ans: "a",
    ex: "An SLO must be gradeable from a monthly report: a metric, a threshold and a measurement window. 'Fast' cannot be graded; 15 minutes can. The MSA is the wrong home for service targets, and emphasis words add nothing enforceable." },
  { id: "hq4", q: "A Critical-tier vendor refuses right-to-audit but offers an annual SOC 2 Type II plus bridge letters. Is that workable?",
    opts: [["a", "No — every Critical vendor owes an on-site audit"], ["b", "No — bridge letters are not recognized evidence"], ["c", "Yes — SOC 2 reports are public records anyway"], ["d", "Yes — independent attestations can satisfy the audit need"]],
    ans: "d",
    ex: "Assurance mechanisms are a named limitation: you rely on the independent evidence the vendor can actually provide. A current Type II plus bridge letters is a legitimate substitute when direct audit is refused or impossible — document the residual risk either way. SOC 2 reports are private, not public (c)." },
  { id: "hq5", q: "During an authorized pen test under your ROE, the tester finds a vulnerable neighboring tenant on the shared platform. Correct action?",
    opts: [["a", "Exploit it quickly while the window stays open"], ["b", "Report it under the ROE; do not pursue"], ["c", "Email the neighboring tenant a warning yourself"], ["d", "Note it quietly and keep testing your tenant"]],
    ans: "b",
    ex: "ROE discipline: other tenants are out of scope, and out-of-scope findings are reported, not pursued — to the vendor, through the agreed escalation path. Chasing them is unauthorized testing of someone else's systems; contacting the tenant directly breaches the engagement's communication rules." },
  { id: "hq6", q: "Your Critical vendor uses a fourth party for 24×7 support with follow-the-sun desks on three continents. Top concern?",
    opts: [["a", "Fourth-party jurisdiction and whether flow-down reaches it"], ["b", "The vendor's logo standards and brand alignment"], ["c", "Office locations of the fourth party's headquarters"], ["d", "Nothing — top-level contracts always cover fourth parties"]],
    ans: "a",
    ex: "Follow-the-sun support moves data across jurisdictions nightly: geography/jurisdiction is a named limitation, and flow-down decides whether the NDA and security schedule actually bind the subcontractor. Top-level contracts do not automatically reach fourth parties (d)." },
  { id: "hq7", q: "A proposed control costs $180,000 and would prevent an estimated $60,000 per year in expected loss. Decision?",
    opts: [["a", "Buy it — security spending has no ceiling"], ["b", "Double the budget to be safely covered"], ["c", "Pick a proportionate control and document residual risk"], ["d", "Fire the vendor and avoid the decision entirely"]],
    ans: "c",
    ex: "Financial/return-on-investment limits what is justified: $180k against a $60k-per-year expected loss fails the proportionality test. Choose a control sized to the loss and formally document the residual risk you accept — unbounded spending (a, b) and avoidance (d) are both program failures." }
];
