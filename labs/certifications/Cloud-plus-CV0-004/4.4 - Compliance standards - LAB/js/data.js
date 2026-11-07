'use strict';
/* data.js — ALL lab content, verbatim from the original lab: icon set,
// glossary, training manual, synthetic evidence artifacts, quiz bank, tabs,
// evidence index and pillar labels. No logic here beyond the icon template.
 */
'use strict';
/* =====================================================================
   StratusPay Evidence Room — data layer
   All organizations, people, hosts and findings are FICTIONAL.
   Every artifact is simulated training data for CompTIA Cloud+ CV0-004
   Lesson 4.4 (Compliance standards: PCI DSS · SOC 2 · ISO/IEC 27001).
   ===================================================================== */

/* ---------- tiny icon set (Lucide-style, MIT-licensed path geometry) ---------- */
const ICONS={
 'folder':'<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
 'file':'<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
 'mail':'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
 'globe':'<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
 'archive':'<rect x="2" y="3" width="20" height="5" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>',
 'clipboard':'<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
 'book':'<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
 'stamp':'<path d="M5 22h14"/><path d="M19.27 13.73A2.5 2.5 0 0 0 17.5 13h-11A2.5 2.5 0 0 0 4 15.5V17a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1.5c0-.66-.26-1.3-.73-1.77Z"/><path d="M14 13V8.5C14 7 15 7 15 5a3 3 0 0 0-6 0c0 2 1 2 1 3.5V13"/>',
 'shield':'<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
 'search':'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
 'wrench':'<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
 'scale':'<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
 'award':'<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
 'lock':'<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
 'key':'<path d="m15.5 7.5 3 3L22 7l-3-3"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/>',
 'server':'<rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><path d="M6 6h.01"/><path d="M6 18h.01"/>',
 'cloud':'<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
 'calendar':'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
 'rotate':'<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
 'check':'<path d="M20 6 9 17l-5-5"/>',
 'x':'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
 'warn':'<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
 'info':'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
 'ext':'<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
 'star':'<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
 'bulb':'<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
 'up':'<path d="m18 15-6-6-6 6"/>',
 'down':'<path d="m6 9 6 6 6-6"/>',
 'arrow':'<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
 'card':'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
 'db':'<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
 'eye':'<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
 'listchecks':'<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
 'building':'<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
 'badge':'<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>',
 'cap':'<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
 'users':'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'
};
function ic(n,cls){return '<svg class="icon '+(cls||'')+'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(ICONS[n]||ICONS['info'])+'</svg>';}

/* ---------- glossary (card file) ---------- */
const GLOSSARY=[
 {t:'CDE — Cardholder Data Environment',d:'The people, processes and systems that store, process or transmit payment account data — plus any connected systems that could affect its security. Scoping the CDE is the first act of PCI DSS.'},
 {t:'PAN — Primary Account Number',d:'The card number itself. If you store, process or transmit it, PCI DSS applies to you.'},
 {t:'Tokenization',d:'Replacing the PAN with a meaningless token. The vault that holds the mapping stays in scope; everything that only sees tokens can often leave it.'},
 {t:'Segmentation',d:'Isolating the CDE from other networks so that non-CDE systems can be removed from PCI scope. Must be proven with testing — assumed segmentation is a classic audit finding.'},
 {t:'QSA — Qualified Security Assessor',d:'A professional (or firm) certified by the PCI Security Standards Council to assess PCI DSS compliance.'},
 {t:'ROC — Report on Compliance',d:'The detailed assessment report a QSA produces; paired with the AOC. Typical for Level 1 merchants and service providers.'},
 {t:'SAQ — Self-Assessment Questionnaire',d:'A validation path for eligible smaller environments. Different SAQs (A, D, …) fit different payment configurations.'},
 {t:'AOC — Attestation of Compliance',d:'The signed summary document stating that a PCI DSS assessment was completed and, if applicable, the environment was found compliant.'},
 {t:'ASV — Approved Scanning Vendor',d:'A company approved by PCI SSC to run the required quarterly external vulnerability scans.'},
 {t:'TSC — Trust Services Criteria',d:'The AICPA criteria behind SOC 2. Security is mandatory; Availability, Processing Integrity, Confidentiality and Privacy are included as committed.'},
 {t:'Type I vs Type II',d:'Type I opines on control DESIGN at a point in time. Type II opines on design AND operating effectiveness over a period of time.'},
 {t:'Bridge letter',d:'Management’s letter covering the gap between a SOC 2 report’s period end and a later date. Not an auditor opinion.'},
 {t:'CUEC',d:'Complementary User Entity Controls — the controls YOUR customer must operate for the service to be secure. Read them in every SOC 2 report.'},
 {t:'ISMS',d:'Information Security Management System — the managed system of policies, processes and reviews that ISO/IEC 27001 certifies.'},
 {t:'SoA — Statement of Applicability',d:'The mandatory ISO 27001 document listing all 93 Annex A controls, whether each applies, why (justification), and its implementation status.'},
 {t:'Nonconformity (major / minor)',d:'Major: a required element is absent or a systemic failure. Minor: an isolated lapse. Minors get corrective action plans; majors can block certification until fixed.'}
];

/* ---------- training manual (knowledge core C2) ---------- */
const MANUAL=[
 {id:'m-why',t:'1 · Why compliance exists (and why the cloud made it harder)',h:`
  <p>Three forces make compliance non-optional for a company like StratusPay. <b>Contracts</b>: every card brand
  agreement and most enterprise sales now require specific attestations. <b>Regulation and industry rules</b>: PCI DSS
  is enforced contractually by the payment ecosystem, while laws such as GDPR impose their own duties. <b>Trust</b>:
  after years of large breaches, buyers simply refuse vendors who cannot show evidence.</p>
  <p>Cloud computing splits every control between a provider and a customer, so “who secures what” must be written
  down and proven by each side. That is why compliance work is mostly <b>evidence work</b>: configurations, logs,
  review records and third-party reports. Compliance is not the same as security — a checkbox program can still be
  breached — but a well-run compliance program forces the discipline (scoping, logging, reviews) that attackers
  exploit when it is missing. A classic example: the 2013 Target breach (~40 million card numbers) began through a
  third-party HVAC vendor’s credentials, which is why segmentation and third-party scope decisions became
  board-level PCI topics.</p>`},
 {id:'m-pci',t:'2 · PCI DSS v4.x — protecting payment account data',h:`
  <p><b>Issuer:</b> the PCI Security Standards Council (PCI SSC), founded by the major card brands. <b>Applies to:</b>
  any organization that stores, processes or transmits payment account data — or that could affect the security of
  it. StratusPay is a <b>service provider</b>, so its customers rely on its AOC too.</p>
  <p>The standard’s 12 requirements group into six goals:</p>
  <table><tr><th>Goal</th><th>Requirements</th></tr>
  <tr><td>Build and maintain secure networks and systems</td><td>1 network security controls · 2 secure configurations</td></tr>
  <tr><td>Protect account data</td><td>3 protect stored account data · 4 encrypt transmission over open networks</td></tr>
  <tr><td>Vulnerability management</td><td>5 malware protection · 6 secure systems and software</td></tr>
  <tr><td>Access control</td><td>7 restrict by business need-to-know · 8 identify and authenticate (MFA into the CDE) · 9 physical access</td></tr>
  <tr><td>Monitor and test</td><td>10 log and monitor all access · 11 test security regularly (incl. quarterly ASV scans)</td></tr>
  <tr><td>Organizational policy</td><td>12 information security policy and program</td></tr></table>
  <p><b>Validation paths:</b> an annual assessment — ROC by a QSA (Level 1 / service providers) or an SAQ for eligible
  smaller environments — plus <b>quarterly external ASV scans</b>. The output is an <b>AOC</b>. <b>Scope reduction</b>
  is the art: tokenization, truncation and tested segmentation shrink the CDE; anything still connected to it stays
  in scope until proven otherwise. Where a requirement cannot be met as written, a <b>compensating control</b> may be
  used — it must meet the intent <i>and</i> rigor of the original requirement and be documented.</p>`},
 {id:'m-soc2',t:'3 · SOC 2 — an attestation over trust services',h:`
  <p><b>Issuer:</b> the AICPA framework, performed by <b>licensed CPA firms</b>. Careful with vocabulary: SOC 2 is an
  <b>attestation</b>, not a certification — there is no such thing as being “SOC 2 certified”, only a report issued
  for a defined period.</p>
  <p>The <b>Trust Services Criteria</b> have five categories: <b>Security</b> (mandatory — the “common criteria”,
  CC-series), plus optional <b>Availability, Processing Integrity, Confidentiality and Privacy</b>, included as
  committed to customers.</p>
  <p><b>Type I</b> reports on whether controls are suitably <b>designed</b> at a <b>point in time</b>. <b>Type II</b>
  also tests <b>operating effectiveness over a period</b> (often 6–12 months) — what serious buyers demand. A report
  contains the system description, the auditor’s tests and results, any <b>exceptions</b>, and the <b>CUECs</b> your
  customers must operate. Family matters: <b>SOC 1</b> covers controls over financial reporting, <b>SOC 3</b> is a
  public general-use summary. When a customer needs assurance for dates <i>after</i> the report’s period end,
  management issues a <b>bridge letter</b> — not the auditor.</p>`},
 {id:'m-iso',t:'4 · ISO/IEC 27001:2022 — certifying the management system',h:`
  <p><b>Issuer:</b> ISO/IEC (joint technical committee); certification is performed by <b>accredited certification
  bodies</b> (CBs). What is certified is not a server or a product but your <b>ISMS</b> — the management system of
  policies, risk treatment, reviews and improvement (Plan-Do-Check-Act).</p>
  <p><b>Structure:</b> clauses 4–10 are mandatory (context; leadership; planning incl. risk assessment and treatment;
  support; operation — including <b>internal audit</b> and <b>management review at planned intervals</b>, clause 9.3;
  performance evaluation; improvement). <b>Annex A</b> provides 93 controls in four themes: Organizational (37),
  People (8), Physical (14) and Technological (34). The <b>Statement of Applicability (SoA)</b> lists every control,
  whether it applies, the justification, and its status.</p>
  <p><b>Certification path:</b> readiness/gap assessment → <b>Stage 1</b> audit (documentation and readiness) →
  <b>Stage 2</b> audit (implementation, evidence sampling) → certificate valid <b>3 years</b> with <b>annual
  surveillance audits</b> → recertification. Findings are <b>major</b> nonconformities (a required element missing or
  systemic failure — blocks certification until corrected) or <b>minor</b> (isolated lapses — corrective action plan,
  verified later, certificate can still issue). Cloud extensions live in ISO 27017; PII handling in the cloud in 27018.</p>`},
 {id:'m-share',t:'5 · Shared responsibility and inherited controls',h:`
  <p>In the cloud every requirement is owned by <i>someone</i>: the provider secures the platform (facilities,
  hypervisors, physical controls), the customer secures what they build (identity, configuration, data, application
  logic). Confusing the two sides is how “compliant” companies get breached — the unpatched guest OS or the disabled
  audit log is almost always on the customer side of the line.</p>
  <p><b>Inheritance</b> works only with evidence: read the provider’s SOC 2 and ISO 27001 materials, note the
  <b>CUECs</b> (controls the provider expects <i>you</i> to operate), and map which of your Annex A / PCI controls are
  satisfied by the provider’s attestations versus yours. In government-grade programs (e.g., FedRAMP) this
  inherit-responsibility model is formalized; the principle is identical everywhere: <b>inherited evidence, owned
  operation</b>.</p>`},
 {id:'m-audit',t:'6 · The audit playbook — evidence, gaps, and risk acceptance',h:`
  <p>Auditors sample evidence; they do not take your word for it. Strong evidence is <b>system-generated and
  current</b>: configuration exports, log excerpts, change tickets, review sign-offs, scan reports. Screenshots of
  dashboards, marketing decks and “we always do that” statements are weak. Evidence must match the <b>period</b>
  under review — a 2023 report proves nothing about 2025.</p>
  <p>The working rhythm before any audit: <b>gap analysis</b> (compare required controls against evidence) →
  <b>remediation</b> (fix, then capture proof the fix works) → <b>internal audit</b> and management review → external
  assessment. Where a gap cannot close in time: a documented <b>compensating control</b> plus formal <b>risk
  acceptance by the named risk owner</b> — never silence. Continuous-compliance tooling simply automates this loop by
  collecting the same evidence all year.</p>`},
 {id:'m-adj',t:'7 · Adjacent frameworks — know what each one answers',h:`
  <p>Compliance requests rarely name the artifact correctly; the professional skill is mapping the <i>ask</i> to the
  <i>evidence</i>. Quick discriminator table:</p>
  <table><tr><th>If the ask is…</th><th>The framework / artifact is…</th></tr>
  <tr><td>“We take cards — prove payment data protection”</td><td>PCI DSS — AOC (ROC/SAQ) + ASV scans</td></tr>
  <tr><td>“Show controls operated over the last year” (vendor review)</td><td>SOC 2 Type II (+ bridge letter)</td></tr>
  <tr><td>“Show your ISMS / security management system” (esp. EU partners)</td><td>ISO/IEC 27001 certificate + SoA</td></tr>
  <tr><td>“Our auditors need your financial-report controls”</td><td>SOC 1 (SSAE 18)</td></tr>
  <tr><td>EU personal-data handling</td><td>GDPR (privacy law — DPIAs, not a security cert)</td></tr>
  <tr><td>US federal agencies</td><td>FedRAMP authorization (the CSP’s, inherited partly by you)</td></tr>
  <tr><td>Voluntary security program structure / hardening guides</td><td>NIST CSF / CIS Benchmarks</td></tr></table>`}
];

/* ---------- evidence artifacts (all fictional training data) ---------- */
function art(id,icon,title,inner){
  return '<article class="artifact" id="art-'+id+'" data-art="'+id+'">'+
    '<div class="ahead">'+ic(icon)+'<h4>'+title+'</h4><span class="spacer"></span>'+
    '<span class="metastamp">training data · synthetic</span></div>'+inner+'</article>';
}
const ART={
assets:{icon:'server',title:'Asset inventory — StratusPay estate (extract)',pre:
`HOSTNAME           ROLE                      NOTES (read these!)
sp-api-gw-01       Payment API gateway       Terminates checkout; PAN decrypted in memory only. Public endpoint.
sp-token-vault-01  Tokenization vault        Stores PAN→token mapping (AES-256). Only payment services reach it.
sp-paydb-01        Payment database          Stores encrypted PAN (legacy table) + tokens.
sp-jump-01         Admin jump host           The only approved path for CDE administration.
sp-logsink-01      Log aggregator            Receives syslog from ALL CDE components; nothing else flows here.
sp-bastion-fw-01   CDE firewall              Enforces CDE segmentation.
sp-ci-runner-03    CI runner                 Deploy route into the vault (R-deploy). Builds payment services.
legacy-test-vm-07  Legacy test VM            Runs a NIGHTLY tcp/5432 sync into sp-paydb-01 (rule R6).
                                             Ticket DECOM-118 open since July — not yet decommissioned.
corp-intra-nas     Corporate intranet NAS    HR files and templates. No payment data. No routes anywhere.
mktg-wordpress-01  Marketing website         Public site, no CHD. (Defaced last month — incident IR-2214, closed.)
sp-mktg-db-01      Marketing analytics DB    Web analytics only.
hr-payroll-saas    HR payroll SaaS           Third-party SaaS, separate tenant.`},
rules:{icon:'shield',title:'Firewall rule extract — sp-bastion-fw-01',pre:
`R1  allow tcp/443   any               → sp-api-gw-01       (public checkout)
R2  allow tcp/1521  ANY               → sp-paydb-01        (added 2024, ticket says "temporary")   ← flag
R3  allow tcp/22    corp-net          → sp-jump-01         (admin path)
R4  allow tcp/443   mktg-subnet       → sp-token-vault-01  (legacy analytics job, nobody remembers it) ← flag
R5  deny   all      any               → CDE                (default)
R6  allow tcp/5432  legacy-test-vm-07 → sp-paydb-01        (nightly sync job)`},
storage:{icon:'db',title:'Configuration export — bucket cumulo-bkt-paydata',pre:
`CumuloCloud console export — object storage bucket "cumulo-bkt-paydata"
encryption:            SSE-AES256 (provider-managed); SSE-KMS available
default-encryption:    ON
public-access-block:   ALL ON
versioning:            ENABLED
lifecycle:             90d → cold storage
last config change:    2025-04-11 by j.moreau (via IaC pipeline)`},
vaultlog:{icon:'file',title:'Audit-log extract — sp-token-vault-01',pre:
`sp-token-vault-01 auditlog (forwarded via sp-logsink-01)
2025-09-13 23:58:02Z  cfg.audit   syslog.forward=true   dst=sp-logsink-01:6514   actor=scheduler
2025-09-14 02:11:47Z  cfg.change  syslog.forward=false  dst=none                 actor=k.osei (admin)
2025-09-14 02:11:52Z  cfg.change  note="troubleshooting disk pressure"           actor=k.osei
2025-10-06 09:00:11Z  gsoc.note   gap detected during pre-audit sweep:
                                  no vault audit events since 2025-09-14 02:11:47Z`},
access:{icon:'users',title:'CDE access review — Q3, signed 2025-09-30',pre:
`account       role             MFA       last-used   notes
j.moreau      platform-admin   YES       2025-09-30  ok
a.silva       dba              YES       2025-09-28  ok
k.osei        admin            PENDING   2025-09-14  MFA re-enrollment scheduled — account ACTIVE  ← exception
svc-backup    service-account  N/A       2025-09-30  key-based, scoped to backup jobs
p.novak       security         YES       2025-09-29  read-only in CDE
r.tanaka      dev-lead         YES       2025-09-26  via jump host only
l.haddad      dev              YES       2025-09-25  via jump host only
m.okafor      sre              YES       2025-09-30  via jump host only`},
asv:{icon:'search',title:'ASV quarterly external scan — Q3 2025',pre:
`ASV quarterly external scan — StratusPay ranges
scan date: 2025-10-02    vendor: NetScan ApprovCo (approved scanning vendor)    status: PASS
CDE external ranges: 0 critical / 0 high unresolved
note: 1 critical on mktg-wordpress-01 — host is OUT of CDE scope; remediated 2025-10-03, rescan PASS 2025-10-05
next quarterly scan due: 2026-01-02 (PCI Req 11)`},
emails:[
 {id:'ebank',from:'pcard-office@firstmeridianbank.example',subj:'Annual PCI DSS validation — AOC due Nov 15',
  body:'StratusPay is enrolled with First Meridian Bank as a payment service provider. Per program rules, submit your current Attestation of Compliance (AOC) with a Report on Compliance (ROC) performed by a QSA by November 15.'},
 {id:'egv',from:'procurement@grandviewretail.example',subj:'Vendor security review — SOC 2 report request',
  body:'Our auditors need assurance that your controls operated effectively over the past 12 months. Please share your most recent SOC 2 report — we expect Type II — plus any letter covering the period since it ended.'},
 {id:'ehel',from:'security@helvetiaretail.example',subj:'Partnership due diligence — ISO/IEC 27001',
  body:'As part of our ISMS-based due diligence, please provide your ISO/IEC 27001:2022 certificate (with accreditation mark) and a summary of your Statement of Applicability scope.'}],
cspsoc2:{icon:'file',title:'CumuloCloud — SOC 2 Type II (excerpt) — the CSP’s report',pre:
`CPA firm: Whitcombe & Lang LLP        Report period: Jan 1 – Dec 31, 2024
Criteria: Security (mandatory) + Availability      Opinion: unqualified
System: multi-tenant IaaS platform (compute, object storage, networking)
Subservice organizations: colocation provider (complementary subservice org controls referenced)
CUECs — selected: customers must configure tenant firewalls, manage their own accounts and keys,
and patch guest operating systems.`},
bridge:{icon:'mail',title:'CumuloCloud — management bridge letter (excerpt)',pre:
`This letter covers January 1, 2025 through September 30, 2025 — the gap between the Type II
report period end (Dec 31, 2024) and the date of this contract.
Management states: no material changes to the control environment; two minor incidents disclosed,
both remediated. Prepared by CumuloCloud management — it is NOT an auditor opinion.`},
spsoc2:{icon:'file',title:'StratusPay — SOC 2 Type II (excerpt) — your own report',pre:
`CPA firm: Whitcombe & Lang LLP        Report period: Oct 1, 2024 – Sep 30, 2025
Criteria: Security + Availability     Opinion: unqualified with noted exceptions
Tests: 47 controls tested over the period; sampled ~25 items per control.
Exceptions (3): two change tickets approved AFTER deploy (May, Jul); one rollback without documented approval (Sep).
CUECs: customers must enforce MFA on their StratusPay administrators and validate webhook endpoints.`},
soa:{icon:'listchecks',title:'StratusPay ISMS — Statement of Applicability (extract, v3.2)',pre:
`Annex A (ISO/IEC 27001:2022): 93 controls — Organizational 37 · People 8 · Physical 14 · Technological 34
A.5.1  Policies for information security     Applicable — implemented
A.5.9  Inventory of information assets       Applicable — implemented
A.7.1  Physical entry controls               Applicable — INHERITED from CumuloCloud (CSP certificate on file)
A.8.15 Logging                               Applicable — implemented
A.8.24 Use of cryptography                   Applicable — implemented
A.8.32 Change management                     Applicable — implemented
A.5.23 Information security for cloud services  Applicable — implemented
… (the full document lists all 93 rows with applicability, justification and status)`},
internal:{icon:'calendar',title:'ISMS audit programme record (extract)',pre:
`Internal audit:            scheduled 2025-10-20   (previous: 2024-10-18)
Management review:         LAST HELD 2024-10-11 — no minutes since. Clause 9.3 requires planned intervals.  ← gap
Stage 1 audit (readiness): 2025-11-04 — Helvetia Certification Body (accredited CB)
Stage 2 audit (on-site):   2025-11-25
Certificate cycle:         3 years, surveillance audits annually`},
hipaa:{icon:'file',title:'BAA — StratusPay × CumuloCloud',pre:
`Business Associate Agreement covering protected health information under HIPAA.
StratusPay processes payments, not health data; the agreement is maintained for the
corporate benefits platform only.`},
soc2023:{icon:'file',title:'StratusPay SOC 2 Type II — period Jan 1 – Dec 31, 2023',pre:
`SUPERSEDED — retained for reference only. Superseded by the Oct 2024 – Sep 2025 report.`},
pentest:{icon:'search',title:'Penetration test — mktg-wordpress-01 — Sep 2025',pre:
`Scope: public marketing site only (no payment systems).
Findings: 2 medium (outdated plugins), 1 low. Remediation tracked in ticket SEC-991.`}
};

/* ---------- knowledge checks (C5) ----------
   Item design contract (audit R3–R5): correct-answer position rotates across the set,
   options are length-matched so nothing gives the answer away, and feedback explains
   why the right answer is right AND why the tempting distractors are wrong. */
const QUIZ={
medium:[
 {id:'qm1',topic:'PCI issuers',q:'Who publishes and maintains PCI DSS?',
  opts:[{id:'a',t:'The American Institute of CPAs'},{id:'b',t:'The US Department of Commerce'},{id:'c',t:'The PCI Security Standards Council'},{id:'d',t:'The ISO/IEC joint committee'}],a:'c',
  why:'PCI SSC is the standards body created by the card brands; compliance is then enforced contractually through acquirers and processors — which is why your bank, not a government, demanded the AOC. The AICPA runs SOC 2, ISO/IEC publishes 27001, and the US Commerce Department charters NIST — none of them owns PCI DSS.'},
 {id:'qm2',topic:'report types',q:'A customer needs proof your controls operated over the past 12 months. Which artifact fits?',
  opts:[{id:'a',t:'SOC 2 Type II'},{id:'b',t:'SOC 2 Type I'},{id:'c',t:'An ISO Stage 1 summary'},{id:'d',t:'The PCI AOC'}],a:'a',
  why:'Type II opines on design AND operating effectiveness over a period of time — exactly “operated over 12 months”. Type I is a point-in-time design check only, a Stage 1 summary is a readiness review, and the AOC attests PCI DSS, not SOC 2 controls.'},
 {id:'qm3',topic:'ISO Annex A',q:'ISO/IEC 27001:2022 Annex A contains…',
  opts:[{id:'a',t:'12 requirements in six goals'},{id:'b',t:'114 controls in 14 domains'},{id:'c',t:'Five Trust Services Criteria'},{id:'d',t:'93 controls in four themes'}],a:'d',
  why:'The 2022 revision consolidated the old 114 controls into 93, grouped as Organizational (37), People (8), Physical (14) and Technological (34). “12 requirements in 6 goals” is PCI DSS, the five criteria are SOC 2’s TSC, and “114 in 14 domains” is the retired 27001:2013 set.'},
 {id:'qm4',topic:'CDE scope',q:'The PCI CDE is best described as…',
  opts:[{id:'a',t:'Only the servers that physically store card numbers'},{id:'b',t:'The systems handling account data, plus connected systems'},{id:'c',t:'Every single server in the same cloud region'},{id:'d',t:'Whatever the assessor happens to decide each year'}],a:'b',
  why:'Scope follows the data AND the connectivity: a test VM with an active route into the payment DB is in scope even if it never touches a card number. Co-location in a region neither adds nor removes scope, storage alone is not the whole boundary, and the assessor measures against the standard rather than redefining scope.'},
 {id:'qm5',topic:'SOC 2 attestation',q:'Who can issue a SOC 2 report?',
  opts:[{id:'a',t:'Any IT consulting firm'},{id:'b',t:'Your ISO certification body'},{id:'c',t:'A licensed CPA firm'},{id:'d',t:'Your acquiring bank'}],a:'c',
  why:'SOC 2 is an AICPA attestation performed by licensed CPA firms — which is also why “SOC 2 certified” is wrong phrasing. Consultants can prepare you, certification bodies issue ISO certificates, and banks consume these reports; none of them can issue one.'},
 {id:'qm6',topic:'bridge letters',q:'Grandview needs assurance for October, but your SOC 2 period ended Sep 30. You send…',
  opts:[{id:'a',t:'A management bridge letter'},{id:'b',t:'A brand-new Type I report'},{id:'c',t:'The same report with dates edited'},{id:'d',t:'Nothing until the next audit'}],a:'a',
  why:'A bridge letter is management’s statement covering the gap since the report period end — it is not an auditor opinion. A Type I would not show operating effectiveness, editing report dates is fraud, and going silent simply fails the vendor review.'},
 {id:'qm7',topic:'Statement of Applicability',q:'The Statement of Applicability (SoA) is…',
  opts:[{id:'a',t:'The risk register of the entire certified ISMS'},{id:'b',t:'All 93 Annex A controls, applicability and justification'},{id:'c',t:'The inventory of the cloud assets in scope'},{id:'d',t:'The final ISO 27001 certificate as issued'}],a:'b',
  why:'The SoA is mandatory and audit-central: all 93 Annex A controls listed with applicability, justification and implementation status — auditors use it to plan their sampling. The risk register and asset inventory feed it, and the certificate is the certification body’s output, not the SoA.'}
],
hard:[
 {id:'qh1',topic:'attestation vocabulary',q:'A prospect emails: “We need you SOC 2 certified by Friday.” Best professional response?',
  opts:[{id:'a',t:'“Quote our CSP’s SOC 2 report, since its coverage transfers to us fully.”'},{id:'b',t:'“SOC 2 requires a CPA engagement; our current report and bridge letter follow.”'},{id:'c',t:'“We hold ISO 27001, which is equivalent, so no further action is needed.”'},{id:'d',t:'“We can buy a SOC 2 certificate from an online marketplace by Friday.”'}],a:'b',
  why:'No instant certification exists: a CPA firm must examine the controls, and a Type II needs an observation period. The CSP’s report is not yours and ISO 27001 is a different framework’s mark — the honest answer sets the timeline and sends the real artifacts you already have.'},
 {id:'qh2',topic:'AOC & ASV',q:'The ASV scan shows a critical vulnerability on the payment API. Your bank deadline is in 3 weeks. Correct handling?',
  opts:[{id:'a',t:'Submit the AOC; note it for the next quarter'},{id:'b',t:'Exclude the API from this scan’s scope'},{id:'c',t:'Ask the ASV to downgrade the finding'},{id:'d',t:'Remediate, pass a re-scan, then submit the AOC'}],a:'d',
  why:'The AOC attests that the environment meets the requirements — an unresolved critical on the CDE contradicts it. Excluding the in-scope API or leaning on the ASV to reword the finding is misrepresentation; fix it, re-scan to a passing state, then attest.'},
 {id:'qh3',topic:'control inheritance',q:'Your CSP says: “We’re ISO 27001 certified, so your systems are compliant.” True?',
  opts:[{id:'a',t:'False — you inherit evidence, but never the operation of controls'},{id:'b',t:'True — an accredited certificate extends automatically to every single customer'},{id:'c',t:'True, but only for customers operating entirely inside the European Union'},{id:'d',t:'True, provided you copy the CSP’s full Statement of Applicability verbatim'}],a:'a',
  why:'Certification is organization-specific: map the CSP’s attestations to your controls, read the CUECs, and keep operating and evidencing the customer side — identity, configuration, logging, data. Geography transfers nothing, and copying their SoA would be a false claim.'},
 {id:'qh4',topic:'Type II periods',q:'In a 12-month Type II period, your segmentation control was implemented 4 months in. The report will…',
  opts:[{id:'a',t:'Cover the control for the full 12 months'},{id:'b',t:'Quietly omit the control from the final report'},{id:'c',t:'Test and cover the portion it operated'},{id:'d',t:'Convert the whole report to a Type I'}],a:'c',
  why:'Type II opinions are period-bound: controls are tested over the time they actually operated, and buyers read the coverage dates. Quiet omission is misrepresentation, and one control’s start date never flips the report’s type.'},
 {id:'qh5',topic:'CDE firewall discipline',q:'A colleague adds: “allow tcp/443 mktg-subnet → tokenization vault.” Your verdict as the compliance owner?',
  opts:[{id:'a',t:'Allow — port 443 is encrypted and generally trusted traffic'},{id:'b',t:'Allow, provided a ticket documents the marketing job first'},{id:'c',t:'Allow — the web application firewall will filter anything malicious'},{id:'d',t:'Deny — marketing has no business need reaching the vault'}],a:'d',
  why:'Every route into the CDE needs a documented business need or it expands scope and risk — “temporary” rules like R4 are exactly what auditors sample. Encryption, a ticket note and a WAF none of them create a need; deny and delete.'},
 {id:'qh6',topic:'nonconformity classes',q:'Stage 2 finds an isolated 3-week logging lapse on one system. Classification and consequence?',
  opts:[{id:'a',t:'Major — a systemic failure; the certificate is denied outright'},{id:'b',t:'Minor — corrective action plan; certificate can still issue'},{id:'c',t:'Nothing — fix it before the auditor leaves site'},{id:'d',t:'Observation — note it without any documentation'}],a:'b',
  why:'Isolated lapses with otherwise working controls are typically minor: document the corrective action, fix it, and expect verification at the next surveillance audit — the certificate can still issue. A required element wholly absent (like never holding a management review) is major. Fixing during the audit does not erase the finding, and findings are always documented.'},
 {id:'qh7',topic:'evidence quality',q:'Which artifact BEST proves stored account data is encrypted?',
  opts:[{id:'a',t:'A current configuration export plus key-management records'},{id:'b',t:'A policy sentence asserting all data is encrypted'},{id:'c',t:'A screenshot of the storage admin dashboard'},{id:'d',t:'A slide deck from the latest sales pitch'}],a:'a',
  why:'Auditors rank system-generated, current evidence above screenshots and statements: the export shows the control’s actual state and the key records show the keys are managed. Policy asserts intent, and dashboards or decks prove nothing about configuration.'}
]};
const PL={u:'Understand',r:'Recognize',d:'Detect',m:'Mitigate'};
const TABS=[
 {id:'briefing',tab:'Briefing',sub:'scenario & requests',icon:'mail'},
 {id:'pci',tab:'PCI DSS',sub:'payment assessment',icon:'card'},
 {id:'soc2',tab:'SOC 2',sub:'customer attestation',icon:'file'},
 {id:'iso',tab:'ISO 27001',sub:'certification audit',icon:'badge'},
 {id:'evidence',tab:'Evidence index',sub:'the whole room',icon:'archive'},
 {id:'quiz',tab:'Oral exam',sub:'knowledge check',icon:'cap'},
 {id:'notes',tab:'Field notes',sub:'debrief',icon:'book'}
];
const ARTSEC={assets:'pci',rules:'pci',storage:'pci',vaultlog:'pci',access:'pci',asv:'pci',
 emails:'soc2',spsoc2:'soc2',cspsoc2:'soc2',bridge:'soc2',soa:'iso',internal:'iso',
 hipaa:'evidence',soc2023:'evidence',pentest:'evidence'};
const EVLIST=[
 {id:'assets',t:'Asset inventory',s:'12 hosts with scope notes'},{id:'rules',t:'Firewall rule extract',s:'6 rules on the CDE firewall'},
 {id:'storage',t:'Storage config export',s:'bucket cumulo-bkt-paydata'},{id:'vaultlog',t:'Vault audit log',s:'the Sep 14 change'},
 {id:'access',t:'CDE access review',s:'Q3, signed Sep 30'},{id:'asv',t:'ASV scan summary',s:'Q3 external scan, PASS'},
 {id:'emails',t:'Intake inbox',s:'three stakeholder requests'},{id:'spsoc2',t:'StratusPay SOC 2 Type II',s:'Oct 2024 – Sep 2025'},
 {id:'cspsoc2',t:'CumuloCloud SOC 2',s:'the CSP\u2019s own report, 2024'},{id:'bridge',t:'Bridge letter',s:'management, Jan–Sep 2025'},
 {id:'soa',t:'Statement of Applicability',s:'93 Annex A rows (extract)'},
 {id:'internal',t:'ISMS audit programme',s:'internal audit & management review record'},
 {id:'hipaa',t:'HIPAA BAA',s:'red herring — benefits platform'},{id:'soc2023',t:'SOC 2 — 2023 report',s:'red herring — superseded'},
 {id:'pentest',t:'Marketing pen test',s:'red herring — out of scope'}
];
