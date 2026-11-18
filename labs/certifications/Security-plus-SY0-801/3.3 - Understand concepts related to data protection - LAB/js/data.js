// DATA — objectives, quiz bank, documents, glossary, media, events — MVHA Custody Bureau (Security+ SY0-801 · 3.3) — static port v4.
// Source: single-file lab, byte-identical content. All content is synthetic training material.

"use strict";
"use strict";
/* ================= GLOSSARY ================= */
const GLOSS = {
  pii:["PII","Personally identifiable information — any data that can identify a specific person: name, SSN, date of birth, address.",1],
  phi:["PHI","Protected health information — health data created or held by a covered entity; protected by HIPAA.",1],
  pci:["Cardholder data (PCI)","Card number (PAN) plus sensitive authentication data; governed by PCI DSS. CVV must never be stored after authorization.",1],
  trade:["Trade secret","Business information whose value depends on staying secret (formulas, processes). Protected by secrecy, not registration.",1],
  ip:["Intellectual property","Creations of the mind protected via patents, copyright, trademark — or trade-secret law.",1],
  legal:["Legal information","Attorney-client records, privileged correspondence and case material; handling varies by jurisdiction.",1],
  fin:["Financial information","Accounts, payroll, budgets, tax records — often with legal retention minimums.",1],
  hr:["Human vs non-human-readable","Human-readable data is directly readable by people (documents, printouts); non-human-readable needs a machine and often a key (encrypted blobs, binary).",1],
  restricted:["Restricted","An optional rung above Confidential used by some organizations: access limited to named individuals only.",1],
  classification:["Data classification","Labeling data by the harm its disclosure would cause; the label then dictates handling requirements.",1],
  owner:["Data owner","Senior executive accountable for a dataset: approves classification, access and accepted risk.",1],
  controller:["Data controller","Decides why and how personal data is processed — usually the organization as a legal entity.",1],
  processor:["Data processor","Processes data on the controller's behalf (a vendor); on breach it must notify the controller without undue delay.",1],
  steward:["Data steward","Owns day-to-day data quality, metadata and policy adherence for a domain.",1],
  custodian:["Data custodian","Provides technical safekeeping: storage, backups, and disposal — implementing what the owner decides.",1],
  dpo:["Data protection officer (DPO)","Independent oversight of protection strategy and the official contact for regulators and data subjects.",1],
  min:["Data minimization","Collect and keep only what the stated purpose requires — every extra field widens the breach blast radius.",1],
  enc:["Encryption","Reversible scrambling of data using keys; at rest (disk/volume/file), in transit (TLS/IPsec). Key custody: TPM on devices, HSM enterprise-wide.",1],
  hsm:["HSM","Hardware security module — tamper-resistant hardware for enterprise key storage and operations.",1],
  hash:["Hashing","One-way mathematical fingerprint; proves integrity (nothing changed) but is never 'unlocked'.",1],
  mask:["Masking","Permanently hiding part of a value for display or test use (SSN ***-**-1234). Irreversible by design.",1],
  tok:["Tokenization","Replacing a sensitive value with a surrogate token; only the vault can map tokens back to originals.",1],
  irm:["IRM","Information rights management — usage rights (view/print/forward/expire) travel inside the file itself.",1],
  dlp:["DLP","Data loss prevention — tooling and policy that inspects content and destination to detect or block sensitive data leaving.",1],
  retention:["Retention policy","How long each record class is kept before archive ends and destruction begins; driven by law, contracts and business need.",1],
  cshred:["Crypto-shredding","Destroying data by destroying the encryption keys that unlock it (certificate-based wipe). Ideal for cloud copies.",1],
  cod:["Certificate of destruction","Auditable proof — who, what, when, how — that regulated records were properly destroyed.",1],
  degauss:["Degaussing","Magnetic erasure with a powerful field. Works on magnetic HDDs and tapes; useless on SSDs (no platters).",1],
  clear:["Clearing (wipe)","Overwriting media so data resists ordinary recovery — not enough for high-sensitivity media.",1],
  purge:["Purge","Destruction-grade sanitization: degaussing or disassembly/shredding so recovery is infeasible even in a lab.",1],
  sov:["Data sovereignty","Data is subject to the laws of the jurisdiction where it is stored or processed — the reason EU records stay in EU regions.",1],
  geo:["Geo-blocking","Denying access by geographic location (e.g., admin portals only from countries of operation).",1],
  org:["Meridian Valley Health Alliance (MVHA)","The fictional regional healthcare alliance used in this training scenario — every person, record and event here is synthetic.",0],
  cert:["CompTIA Security+ (SY0-801)","The current Security+ exam (V8). Its objective 3.3 — summarize concepts and strategies used to protect data — is exactly what this lab practices.",0],
  breach:["Data breach","Unauthorized access to or disclosure of protected data triggering assessment and notification duties.",0],
  exfil:["Data exfiltration","Movement of data out of the boundary by an attacker or insider — over email, cloud services, USB, or print.",0],
  state:["Data state","The form data currently takes: at rest (media), in transit (network), in use (memory/screen). Each has its own controls.",0],
  lifecycle:["Data lifecycle","Create/capture → store → use/share → archive → destroy. Protection obligations attach at every stage.",0]
};

/* ================= DOSSIERS (intake shelf) ================= */
const DOCS = [
 {id:"rivera", name:"Patient intake record — Rivera, C.", meta:"Form PC-12 · Clinic 4 · Scanned 2026-10-02", hard:0, body:
`MERIDIAN VALLEY HEALTH ALLIANCE — PATIENT INTAKE (SYNTHETIC)
Patient : Carmen Rivera            MRN : MV-88213
DOB     : 1988-03-14               SSN : 288-14-5521
Insurer : MeridianCare PPO (policy 4417-2210)
Presenting : Stage II carcinoma, left breast — oncology referral
Consent signed: 2026-10-02 (treatment + billing)
NOTES   : prefers Dublin program telehealth follow-ups in winter`},
 {id:"hughes", name:"Donor gift form — Hughes, J.", meta:"Form DG-3 · Development Office · Scanned PDF", hard:0, body:
`MVHA DEVELOPMENT OFFICE — GIFT PLEDGE FORM (SYNTHETIC)
Donor   : Jonathan Hughes          Date: 2026-10-30
Gift    : $500.00 (annual fund)
Card    : 4539 8821 4403 2288      Exp : 09/28   CVV: 481
Receipt : email (j.hughes@personal-mail.example)
Signature: /s/ J. Hughes
Filed as: scan_dg3_hughes.pdf  (unencrypted network share, Dev-Admin)`},
 {id:"mvx", name:"Research memo — MVX-217 assay v3", meta:"Research Dept · Pre-patent · INTERNAL watermark", hard:0, body:
`INTERNAL — RESEARCH (SYNTHETIC) — DO NOT DISTRIBUTE
Compound MVX-217, assay round 3
  IC50 : 41 nM (target ENTPD2)      selectivity x38 vs panel
Notes : patent filing window Q1 2027 — disclose NOTHING externally
       competitor patent WO-2026/04412 observed (Lakeshore Bio)
Distribution: E. Vasquez, P. Sharma, counsel (NDA signed)`},
 {id:"dublin", name:"Transfer request — Dublin program export", meta:"IT Service Desk · Ticket 8841 · Pending", hard:0, body:
`SERVICE DESK TICKET 8841 (SYNTHETIC)
Request : Move 412 Dublin-partner patient records to US-East bucket
Reason  : "reporting is faster from US-East" (requester, Analytics)
Data    : names, DOB, referral diagnosis, insurance IDs
Current : eu-west-1.mvha.example (Dublin region)
Constraint noted by DPO: GDPR — EU partner data residency`},
 {id:"press", name:"Press release — Mobile Mammography launch", meta:"Communications · Approved for publication 2026-11-20", hard:0, body:
`FOR IMMEDIATE RELEASE (SYNTHETIC, APPROVED)
MVHA launches mobile mammography unit serving six rural counties.
Free screenings every second Tuesday, starting 2026-12-09.
Quotes: Dr. A. Okafor (DPO) and Commissioner R. Ellison.
Contact: press@mvha.example  — photos available on request.`},
 {id:"budget", name:"FY2026 budget variance (unaudited)", meta:"Finance · Draft v2 · Draft watermark", hard:0, body:
`FY2026 BUDGET VARIANCE — DRAFT v2 (SYNTHETIC, UNAUDITED)
Grants revenue        +4.1% vs plan    (delayed federal award)
Donor gifts           +9.8% vs plan    (Q3 campaign)
Payroll               +2.2% over       (agency nursing premiums)
Cloud & storage       -6.0% under      (tiered archive migration)
Counsel reserves       raised to $1.9M (Rivera matter — see legal)`},
 {id:"legaldoc", name:"Settlement correspondence — Rivera v. MVHA", meta:"Office of General Counsel · PRIVILEGED", hard:0, body:
`PRIVILEGED & CONFIDENTIAL — ATTORNEY WORK PRODUCT (SYNTHETIC)
Re: Rivera v. MVHA mediation posture
Counsel advises: do not circulate beyond named recipients.
Draft term sheet exchanged 2026-11-03; counter expected 2026-11-18.
Any production of intake records must follow the protective order.`},
 {id:"roster", name:"Weekly staffing roster", meta:"Operations · Internal posting", hard:0, body:
`OPERATIONS ROSTER — WEEK 47 (SYNTHETIC, INTERNAL)
Mon 08:00 Front desk: T. Ruiz, S. Patel   Triage: N. Adeyemi
Tue 08:00 Front desk: T. Ruiz             Labs: J. Whitfield
Wed 08:00 Front desk: S. Patel            Volunteers: coffee club 9:30
Thu 08:00 Front desk: T. Ruiz, M. Dobbins Billing: Cardinal sync 16:00
Fri 08:00 All-hands audit briefing 09:00 (Auditor M. Corrigan)`},
 {id:"coffee", name:"Break-room memo — coffee club", meta:"Break room · Printed 2026-11-07", hard:1, body:
`COFFEE CLUB — WEEK 47 ROTA (SYNTHETIC)
Mon: P. Sharma (oat flat white)   Tue: J. Whitfield (espresso x2)
Wed: K. Novak (cortado)           Thu: T. Ruiz (drip, extra large)
Fri: N. Adeyemi (decaf, ironically)
Treasurer's note: petty cash balance $11.50 — all debts settled.`}
];

/* ================= DLP EVENTS ================= */
const EVENTS = [
 {id:"E101", time:"09:14", user:"t.ruiz@mvha.example", text:"Bulk download: member_export.csv (1,240 rows, names+SSNs) copied to unregistered USB device USBSTICK-04.", v:1, vec:"usb", vecLbl:"USB / physical medium"},
 {id:"E102", time:"09:41", user:"k.novak@mvha.example", text:"Upload 512 MB: MVX-217_assay_v3.xlsx to drive.personal-mail.example (unsanctioned personal cloud).", v:1, vec:"cloud", vecLbl:"Unsanctioned cloud upload"},
 {id:"E103", time:"10:05", user:"m.dobbins@mvha.example", text:"Outbound email to j.dobbins77@personal-mail.example with patients_Q3.xlsx — 2,318 records, SSN column unmasked.", v:1, vec:"email", vecLbl:"Email to personal account"},
 {id:"E104", time:"02:00", user:"svc-backup (service)", text:"4.1 GB encrypted full backup → eu-west-1.mvha.example per SOP BK-07 (scheduled job, approved destination).", v:0},
 {id:"E105", time:"11:30", user:"svc-marketing (service)", text:"Bulk newsletter to 3,000 opt-in donors; names masked to first name + last initial; no sensitive fields.", v:0},
 {id:"E106", time:"13:22", user:"s.patel@mvha.example", text:"Print job: patient_directory.pdf (212 pages, full records) → MFP-LOBBY-01 (public lobby).", v:1, vec:"print", vecLbl:"Printed to unsecured printer"},
 {id:"E107", time:"14:48", user:"d.okafor-dev@mvha.example", text:"Production donor DB copied to DEV-03 for 'testing'; PAN column unmasked, no masking policy applied.", v:1, vec:"copy", vecLbl:"Unmasked copy (masking failure)"},
 {id:"E108", time:"15:12", user:"hr.mgr@mvha.example", text:"payroll_2026.xlsx opened from finance share over VPN (role: HR manager, within duties).", v:0}
];

/* ================= DESTRUCTION BAY MEDIA ================= */
const MEDIA = [
 {id:"hdd", name:"6 × 3.5″ server HDDs", detail:"Retired file server that held patient records; drives still spin up.", opts:"deg"},
 {id:"ssd", name:"12 × laptop SSDs", detail:"Nurse laptops; flash memory with wear-leveling controllers.", opts:"shred"},
 {id:"paper", name:"4 boxes of paper charts", detail:"PHI charts; retention schedule expired.", opts:"paper"},
 {id:"tape", name:"LTO-8 backup tapes", detail:"Magnetic tape cartridges with patient backups.", opts:"deg"},
 {id:"cloud", name:"Cloud archive bucket", detail:"Object storage; MVHA holds the encryption keys.", opts:"crypto"},
 {id:"vm", name:"Marketing sandbox VMs", detail:"Contains only public campaign data.", opts:"wipe", hard:1}
];

/* ================= RETENTION DESK ================= */
const RETENTION = [
 {id:"r1", name:"Card authorization slips (2018)", note:"PCI: sensitive authentication data must never be retained after authorization.", ans:"destroy"},
 {id:"r2", name:"FY2025 tax & audit file", note:"MVHA policy: keep 7 years.", ans:"keep"},
 {id:"r3", name:"Rivera chart — treatment ended 2023", note:"HIPAA record-keeping: 6-year minimum; schedule runs to 2029.", ans:"keep"},
 {id:"r4", name:"Non-hired applicant files (2024)", note:"MVHA policy: 1 year for non-hires.", ans:"destroy"}
];

/* ================= PEOPLE CHART ================= */
const PERSONAS = [
 {id:"jonah", name:"Jonah Whitfield — Storage & backup lead", note:"Runs the servers, backups and media disposal.", ans:"custodian"},
 {id:"elena", name:"Elena Vasquez — VP Research", note:"Approves who may use research datasets, for what purpose; carries the risk.", ans:"owner"},
 {id:"amara", name:"Dr. Amara Okafor", note:"Independent oversight; official regulator contact.", ans:"dpo"},
 {id:"cardinal", name:"Cardinal Claims Processing", note:"External vendor that processes claims on MVHA's behalf.", ans:"processor"},
 {id:"priya", name:"Priya Sharma — Research analyst", note:"Maintains dataset quality, metadata and policy adherence every day.", ans:"steward"},
 {id:"marcus", name:"Marcus Chen — Practice Director", note:"Decides why and how patient data is processed across MVHA.", ans:"controller"}
];
/* Hard-only master dossier (Consolidated intake packet) */
DOCS.push({id:"master", name:"Consolidated intake packet — Q3", meta:"Audit exhibit A · 46 pages · Multiple desks", hard:1, body:
`AUDIT EXHIBIT A — CONSOLIDATED Q3 INTAKE (SYNTHETIC)
p.2   Patient log: 118 records — name, DOB, SSN, referral diagnosis
p.9   Donor batch file: 63 gifts — full card numbers (PAN) + expiry
p.14  Unaudited FY2026 revenue & payroll summary (Finance draft)
p.19  MVX-217 assay notebook pages — pre-patent compound results
p.31  Counsel letter excerpt: Rivera matter (privileged)
p.44  MRI imaging archive export: encrypted .mria blob (needs key)
p.46  Visitor badge log: lobby entries, no biometric or location data`});

/* ================= BENCHES ================= */
const BENCHES = [
 {id:"w1", no:"W1", name:"Lifecycle Ramp", blurb:"Orient every file that enters the bureau.", medium:1},
 {id:"w2", no:"W2", name:"Intake & Stamps", blurb:"Stamp and identify what actually arrived."},
 {id:"w3", no:"W3", name:"Protection Bench", blurb:"Fit safeguards to states and purposes."},
 {id:"w4", no:"W4", name:"Routing & Sovereignty Map", blurb:"Route records to lawful ground.", medium:1},
 {id:"w5", no:"W5", name:"People Chart", blurb:"Name the accountable hands."},
 {id:"w6", no:"W6", name:"DLP Triage Desk", blurb:"Separate the leaks from the noise."},
 {id:"w7", no:"W7", name:"Records Room & Destruction Bay", blurb:"Custody ends verifiably."},
 {id:"w8", no:"W8", name:"Incident Response Table", blurb:"When a leak is real, run the drill."},
 {id:"w9", no:"W9", name:"Custody Plan Builder", blurb:"Design custody before day one.", hard:1}
];

/* ================= OBJECTIVE DEFINITIONS =================
   pillar: U understand · R recognize · D detect · M mitigate       */
const OPTS = {
 tiers:[["public","Public"],["private","Private"],["sensitive","Sensitive"],["confidential","Confidential"],["critical","Critical"]],
 types:[["pii","PII"],["phi","PHI"],["pci","Cardholder data (PCI)"],["trade","Trade secret"],["legal","Legal information"],["fin","Financial"],["hr","Non-human-readable"],["bio","Biometric"],["geo","Geolocation"]],
 states3:[["enc","Full-disk / volume encryption"],["tls","TLS 1.3 session"],["irm","IRM + session access controls"]],
 states5:[["rest","At rest"],["transit","In transit"],["use","In use"],["geob","Geo-blocking"],["hashm","Hashing"]],
 controls:[["mask","Masking"],["tok","Tokenization"],["fde","Full-disk encryption (at rest)"],["irm","IRM"],["hash","Hashing"],["dlp","DLP"],["geob","Geo-blocking"]],
 roles:[["owner","Data owner"],["controller","Data controller"],["processor","Data processor"],["steward","Data steward"],["custodian","Data custodian"],["dpo","Data protection officer"]],
 regions:[["us","US-East (Ohio)"],["eu","EU-West (Dublin)"]],
 methods:[["deg","Degauss + destroy (purge)"],["shred","Physical shred / disintegrate"],["paper","Cross-cut shred"],["crypto","Crypto-shred (destroy keys)"],["wipe","Wipe (clear)"]],
 yesno:[["yes","Yes — certificate required"],["no","No certificate"]],
 vectors:[["usb","USB / physical medium"],["cloud","Unsanctioned cloud upload"],["email","Email to personal account"],["print","Printed to unsecured printer"],["copy","Unmasked copy (masking failure)"]],
 controls8:[["mask","Masking"],["tok","Tokenization"],["fde","Full-disk encryption (at rest)"],["irm","IRM"],["hash","Hashing"],["dlp","DLP"],["geob","Geo-blocking"],["hsm","Hardware security module (HSM)"]]
};
const OBJ = {};
/* ---------- MEDIUM ---------- */
Object.assign(OBJ, {
 m1:{bench:"w1",pillar:"U",title:"Sequence the data lifecycle",
  prompt:"The audit opens with the bureau's spine: <b>protect sensitive information throughout its lifecycle</b>. Route the five stages in the order data moves through MVHA by clicking them in sequence.",
  anchor:"Lesson detail: lifecycle create→store→use/share→archive→destroy",
  parts:[{key:"a",type:"order",items:[["create","Create / capture"],["store","Store"],["use","Use / share"],["archive","Archive"],["destroy","Destroy"]],disp:["store","destroy","create","archive","use"],answer:["create","store","use","archive","destroy"]}],
  hints:["Follow one real artifact: a patient form arrives, is put somewhere, is read, is kept, and eventually dies.","The first tile is Create / capture; the last is Destroy — fill the three between.","Correct order: Create / capture → Store → Use / share → Archive → Destroy."],
  why:"Every protection you choose later attaches to a stage — minimization at create, encryption at store, IRM at use, retention at archive, destruction controls at the end. Missing one stage leaves one hole.",
  no:"A stage is out of custody order. Think again about what happens first to a new record and what must happen last — then re-route."},
 m2:{bench:"w2",pillar:"U",title:"Stamp the intake files",
  prompt:"Three dossiers wait at the intake desk (they are on the shelf — open them if needed). Stamp each with its MVHA classification per the Handbook ladder.",
  anchor:"Classification rungs: public, private, sensitive, confidential, critical",
  parts:[{key:"a",type:"sel",rows:[
    {id:"d2",label:"Patient intake record — Rivera, C.",small:"PHI: name, DOB, SSN, diagnosis.",opts:OPTS.tiers,ans:"confidential"},
    {id:"d3",label:"Research memo — MVX-217 assay v3",small:"Pre-patent; disclosure would be irreparable.",opts:OPTS.tiers,ans:"critical"},
    {id:"d1",label:"Press release — Mobile Mammography launch",small:"Approved for publication.",opts:OPTS.tiers,ans:"public"}]}],
  hints:["Classification is decided by the <em>harm</em> a disclosure would cause, not by how old or boring the file looks.","MVHA policy: regulated personal data lands at Confidential; crown-jewel pre-patent research lands at Critical; anything approved for anyone is Public.","Answers: press release = Public · Rivera intake = Confidential · MVX-217 = Critical."],
  why:"The stamp drives every later decision — handling, storage region, encryption, who may see it. Mislabel a crown jewel 'internal' and you will guard it like a pamphlet.",
  no:"One stamp contradicts the harm-based ladder in the Handbook. Re-read rung definitions, then re-stamp."},
 m3:{bench:"w2",pillar:"U",title:"Name the data types in evidence",
  prompt:"The auditor points at five registry entries. Identify the data type each one carries — the ledger in Handbook leaf 5 is the law here.",
  anchor:"Data types: regulated (PHI/PCI), trade secret, legal, human vs non-human-readable",
  parts:[{key:"a",type:"sel",rows:[
    {id:"t3",label:"MVX-217 pre-patent assay formulas",opts:OPTS.types.slice(0,7),ans:"trade"},
    {id:"t5",label:"Encrypted MRI archive blob — unreadable without the key",opts:OPTS.types.slice(0,7),ans:"hr"},
    {id:"t1",label:"Rivera chart — diagnosis & treatment history",opts:OPTS.types.slice(0,7),ans:"phi"},
    {id:"t4",label:"Settlement correspondence (attorney-client)",opts:OPTS.types.slice(0,7),ans:"legal"},
    {id:"t2",label:"Hughes form — card number + CVV",opts:OPTS.types.slice(0,7),ans:"pci"}]}],
  hints:["Two entries are <em>regulated</em> types — one is about health, one about payments.","A blob no human can read without a machine and a key is the odd one out — what does the Handbook call that?","Answers: PHI · Cardholder data (PCI) · Trade secret · Legal information · Non-human-readable."],
  why:"Type tells you which law and which rulebook applies: HIPAA duties for PHI, PCI DSS for card data, secrecy programs for trade secrets. Non-human-readable data is still data — its key becomes the crown jewel.",
  no:"One entry is mismatched. Ask: which <em>regime</em> governs this record, and can a human read it without a machine?"},
 m4:{bench:"w3",pillar:"U",title:"Match each state to its safeguard",
  prompt:"Same record, three different leak vectors. Assign the dominant safeguard to data <b>at rest</b>, <b>in transit</b> and <b>in use</b> — each control is used exactly once.",
  anchor:"Data states: at rest / in transit / in use and their control families",
  parts:[{key:"a",type:"sel",rows:[
    {id:"s2",label:"In transit — moving across networks",opts:OPTS.states3,ans:"tls"},
    {id:"s3",label:"In use — in RAM, on screens, being processed",opts:OPTS.states3,ans:"irm"},
    {id:"s1",label:"At rest — on disks, backups, paper",opts:OPTS.states3,ans:"enc"}]}],
  hints:["Which state ends the moment you pull the network cable? Which one begins the moment a laptop is stolen?","In use is the state controls <em>inside the application</em> govern — rights that travel with the file, least privilege, watermarks.","Answers: at rest → full-disk/volume encryption · in transit → TLS 1.3 · in use → IRM + session access controls."],
  why:"Attackers pick whichever state is cheapest to hit: stolen drives (rest), captured traffic (transit), photographed screens (use). A per-state control matrix closes all three doors.",
  no:"A safeguard landed on the wrong state. Re-read Handbook leaf 3 and match the vector to the control."},
 m5:{bench:"w5",pillar:"U",title:"Assign the six roles",
  prompt:"Accountability is a control. Assign each colleague on the people chart their data role — each role is used exactly once.",
  anchor:"Data roles: owner, controller, processor, steward, custodian, DPO",
  parts:[{key:"a",type:"sel",rows:PERSONAS.map(p=>({id:p.id,label:p.name,small:p.note,opts:OPTS.roles,ans:p.ans}))}],
  hints:["Two roles decide (one at dataset level, one at organization level); two roles execute (one for quality, one for machines).","The external vendor processes on our behalf; the independent overseer talks to regulators.","Answers: Elena = owner · Marcus = controller · Cardinal = processor · Priya = steward · Jonah = custodian · Amara = DPO."],
  why:"When a breach lands, the first question is 'who is accountable for this data?' — roles answer it before the fire starts. Processors especially carry contractual duties back to the controller.",
  no:"Two hands were given the same job. Separate deciding (owner/controller) from executing (steward/custodian) and supervising (DPO)."},
 m6:{bench:"w2",pillar:"D",title:"Inspect the Hughes gift form",
  prompt:"Open <b>Donor gift form — Hughes, J.</b> from the intake shelf and read it with the Inspector. Then answer both questions below.",
  anchor:"Evidence inspection: prohibited CVV storage; unencrypted PAN at rest",
  parts:[
   {key:"a",type:"sel",rows:[{id:"q1",label:"Which data type does this form expose?",opts:[["pii","PII only"],["pci","Cardholder data (PCI)"],["phi","PHI"],["trade","Trade secret"]],ans:"pci"}]},
   {key:"b",type:"sel",rows:[{id:"q2",label:"What is the violation?",opts:[["fullpan","Full PAN stored unencrypted — and the CVV was retained after authorization"],["tls","The form was transmitted without TLS"],["region","The scan is stored in the wrong jurisdiction"],["ret","The scan is kept past its retention clock"]],ans:"fullpan"}]}],
  hints:["PCI DSS says one of those three numbers must never be stored after authorization — at all.","The filing line in the Inspector says where the PDF sits and how it is protected. Combine that with the card line.","Answers: Cardholder data (PCI) · full PAN unencrypted at rest + CVV retained (prohibited)."],
  why:"A scanned gift form turned a donation into a PCI incident: unencrypted card data at rest, plus a CVV that must never be kept. Mask, tokenize or encrypt — and strip the CVV.",
  no:"Close, but not the finding. Read the card line and the storage line of the dossier again — what is stored, where, and how."},
 m7:{bench:"w3",pillar:"R",title:"Minimize the donor intake form",
  prompt:"Development wants a new donor form. Stated purpose: <b>issue email donation receipts only</b>. Tick <b>only</b> the fields that purpose genuinely needs — minimization is subtraction.",
  anchor:"Data minimization: collect only what the purpose requires",
  parts:[{key:"a",type:"checks",fields:[
    {v:"dob",label:"Date of birth"},{v:"name",label:"Full name"},{v:"ssn",label:"SSN"},{v:"email",label:"Email address"},
    {v:"employer",label:"Employer"},{v:"amount",label:"Gift amount"},{v:"phone",label:"Phone number"},
    {v:"address",label:"Mailing address"}],answer:["name","email","amount"]}],
  hints:["Receipts go out by email — what could a receipt not function without?","SSN and date of birth are never needed to say 'thank you, here is your receipt'.","Tick exactly: full name, email address, gift amount."],
  why:"Every retained field is a liability you must encrypt, monitor and one day destroy. The cheapest record to protect is the one you never collected.",
  no:"The form still carries fields the stated purpose cannot justify. Remove anything a receipt does not need."},
 m8:{bench:"w4",pillar:"R",title:"Route records to lawful ground",
  prompt:"Three storage requests hit your routing desk, plus one boundary decision. Pin each dataset to its compliant region, then set the admin portal's geo-blocking.",
  anchor:"Data sovereignty, residency, geographic access requirements, geo-blocking",
  parts:[
   {key:"a",type:"sel",rows:[
    {id:"g1",label:"412 Dublin-partner patient records",small:"GDPR residency applies.",opts:OPTS.regions,ans:"eu"},
    {id:"g2",label:"Ohio clinic patient records",opts:OPTS.regions,ans:"us"},
    {id:"g3",label:"Public site assets",opts:OPTS.regions,ans:"us"}]},
   {key:"b",type:"tog",label:"Geo-block the MVHA admin portal to MVHA's countries of operation?",answer:true}],
  hints:["Sovereignty: the strictest dataset decides the region. Which request crosses a legal wall?","Public assets have no residency constraint; the admin portal should not accept logins from everywhere on Earth.","Answers: Dublin records → EU-West (Dublin) · Ohio records → US-East · public assets → US-East · geo-blocking ON."],
  why:"Data stored in a country answers to that country's laws — moving EU records to a US bucket creates a GDPR transfer problem no encryption paper can fully paper over. Geo-blocking then shrinks the attack surface to the ground you actually operate.",
  no:"One route crosses a legal wall, or the portal is left world-open. Re-check which dataset the strictest law binds."},
 m9:{bench:"w3",pillar:"M",title:"Apply the right safeguard four times",
  prompt:"Four flagged items reach the protection bench. Choose the best-fit safeguard for each from the control library.",
  anchor:"Methods to secure data: masking, tokenization, encryption, IRM",
  parts:[{key:"a",type:"sel",rows:[
    {id:"c4",label:"Contract draft shared with outside counsel",small:"Must block forwarding and printing.",opts:OPTS.controls,ans:"irm"},
    {id:"c2",label:"Marketing tool needs donor records without real card numbers",small:"Processing must still work; vault can map back.",opts:OPTS.controls,ans:"tok"},
    {id:"c1",label:"Analyst copy of the member list shows full SSNs",small:"Display copy for a reporting job.",opts:OPTS.controls,ans:"mask"},
    {id:"c3",label:"Field laptop with patient records travels with nurses",small:"Worst case: the laptop is stolen.",opts:OPTS.controls,ans:"fde"}]}],
  hints:["One control permanently hides part of a value; another swaps the value for a surrogate the vault can reverse.","One control scrambles the whole disk against theft; another makes rights travel inside the file.","Answers: masking · tokenization · full-disk encryption · IRM."],
  why:"Fit beats force: masking kills display risk, tokenization takes card data out of scope, encryption guards a stolen device, IRM guards a file that leaves. Each controls the exact vector its item faces.",
  no:"One item got a control that does not match its vector. Ask: what exactly happens to this data, and which control answers that?"},
 m10:{bench:"w6",pillar:"D",title:"Triage the watch desk — then tune it",
  prompt:"The watch desk forwards three events. Mark each <b>Violation</b> or <b>Benign</b>, then choose the rule refinement that would keep catching the real leak while quieting the benign noise.",
  anchor:"DLP detection logic, true vs false positives, tuning",
  parts:[
   {key:"a",type:"tri",events:["E103","E105","E108"]},
   {key:"b",type:"sel",rows:[{id:"tune",label:"Rule refinement for the watch desk",opts:[
     ["a","Alert on any outbound file larger than 1 MB"],
     ["b","Inspect content for PHI/PCI patterns and alert only when the destination is not on the approved list"],
     ["c","Block all email attachments regardless of content"],
     ["d","Alert only on events that occur after 20:00"]],ans:"b"}]}],
  hints:["Check three things per event: what the content is, where it is going, and whether the actor is authorized for both.","The 02:00 flow looks scary until you see the service account, the SOP and the approved destination.","Answers: E-103 violation · E-105 benign · E-108 benign · refinement b."],
  why:"Volume and clock rules bury analysts in noise; content-plus-destination rules catch the leak and exempt the SOP backup. Tuning is how DLP stays believed.",
  no:"One verdict or the refinement misses. For each event ask: sensitive content? approved destination? authorized actor?"},
 m11:{bench:"w7",pillar:"M",title:"Run the ledger, then the destruction bay",
  prompt:"Part 1: mark each record on the retention ledger <b>Destroy</b> or <b>Keep</b>. Part 2: the bay receives four media types — choose the correct destruction method for each.",
  anchor:"Retention schedules; destruction: purge/degauss/shred/crypto-shred; certificates",
  parts:[
   {key:"a",type:"tri",events:RETENTION.map(r=>r.id),retMode:1},
   {key:"b",type:"sel",rows:["cloud","ssd","hdd","paper"].map(id=>MEDIA.find(x=>x.id===id)).map(m=>({id:m.id,label:m.name,small:m.detail,opts:OPTS.methods,ans:m.opts}))}],
  hints:["Magnetic media surrenders to magnetic erasure; flash memory does not — it must be physically destroyed.","The cloud bucket's weakness is not the disk, it is the key list.","Answers — ledger: 2018 slips destroy · FY2025 tax keep · Rivera chart keep · 2024 applicants destroy. Bay: HDD and LTO tape degauss+destroy · SSD physical shred · paper cross-cut shred · cloud crypto-shred."],
  why:"Retention keeps you lawful; destruction keeps you safe — data that no longer exists cannot leak. Each medium dies by the method that actually kills it, and regulated data demands a certificate of destruction.",
  no:"One record or one medium is misrouted. Flash memory ignores magnets; magnets love magnetic platters and tape."},
 m12:{bench:"w8",pillar:"M",title:"Run the exfiltration drill",
  prompt:"Event E-101 is confirmed: 1,240 member records copied to a personal USB. Order the five response steps the way MVHA must run them.",
  anchor:"Responding to data threats: containment, evidence, notification clocks",
  parts:[{key:"a",type:"order",items:[["s1","Contain: revoke sessions, quarantine the endpoint"],["s2","Preserve: image the USB, export logs as evidence"],["s3","Assess scope with legal & the DPO"],["s4","Notify regulators within the clock (GDPR 72 h; HIPAA ≤60 d)"],["s5","Remediate: rotate credentials, close the gap, retrain"]],disp:["s4","s2","s1","s5","s3"],answer:["s1","s2","s3","s4","s5"]}],
  hints:["The first step stops the bleeding; the second makes sure you can prove what happened before cleanup destroys proof.","Legal needs the scope before any external word leaves the building — and the clock only starts when you know.","Correct order: Contain → Preserve → Assess → Notify → Remediate."],
  why:"Containment first limits harm; evidence second preserves prosecution and forensics; notification third honors the 72-hour GDPR and 60-day HIPAA clocks; remediation last makes it never happen again.",
  no:"The drill is out of order. What must stop first, and what must exist before anyone is told anything?"}
});
/* Fixed display permutations (QA: row order must never mirror the answer key) */
const M6O=["tape","cloud","ssd","hdd","vm","paper"];
/* ---------- HARD ---------- */
Object.assign(OBJ, {
 h1:{bench:"w2",pillar:"U",title:"Inventory exhibit A",
  prompt:"Open <b>Consolidated intake packet — Q3</b> on the shelf and inventory it. Select <b>every</b> data type actually present — near-misses are rejected with a reason.",
  anchor:"Data types across a mixed exhibit, incl. human vs non-human-readable",
  parts:[{key:"a",type:"checks",fields:["geo","pii","bio","phi","fin","trade","hr","pci","legal"].map(id=>{const t=OPTS.types.find(x=>x[0]===id);return{v:t[0],label:t[1]};}),answer:["pii","phi","pci","fin","trade","legal","hr"]}],
  nudge:"Page 46 is the trap — read what it does NOT contain. Page 44 is a blob that needs a machine and a key.",
  why:"A complete type inventory is the foundation of the protection plan — the encrypted imaging blob is still data (its key now outclasses it), while the badge log carries no regulated type at all.",
  no:"Your inventory is missing or over-counting a type. Re-read the exhibit page by page — page 46's badge log is the deliberate near-miss."},
 h2:{bench:"w2",pillar:"R",title:"Classify and bind handling",
  prompt:"Four dossiers from the shelf. For each: assign the MVHA classification <b>and</b> the minimum handling it then demands. Both columns must be right.",
  anchor:"Classification drives handling (harm → tier → controls)",
  parts:[
   {key:"a",type:"sel",rows:[
    {id:"k3",label:"FY2026 budget variance (unaudited)",opts:OPTS.tiers,ans:"sensitive"},
    {id:"k1",label:"Volunteer newsletter (published)",opts:OPTS.tiers,ans:"public"},
    {id:"k4",label:"EU patient registry export",opts:OPTS.tiers,ans:"confidential"},
    {id:"k2",label:"Weekly staffing roster",opts:OPTS.tiers,ans:"private"}]},
   {key:"b",type:"sel",rows:[
    {id:"h3",label:"Handling for the budget variance",opts:[["n1","No restrictions"],["n2","Internal use only"],["n3","Encrypt at rest + need-to-know"],["n4","Encrypt both states + EU residency"]],ans:"n3"},
    {id:"h1",label:"Handling for the newsletter",opts:[["n1","No restrictions"],["n2","Internal use only"],["n3","Encrypt at rest + need-to-know"],["n4","Encrypt both states + EU residency"]],ans:"n1"},
    {id:"h4",label:"Handling for the EU registry export",opts:[["n1","No restrictions"],["n2","Internal use only"],["n3","Encrypt at rest + need-to-know"],["n4","Encrypt both states + EU residency"]],ans:"n4"},
    {id:"h2",label:"Handling for the roster",opts:[["n1","No restrictions"],["n2","Internal use only"],["n3","Encrypt at rest + need-to-know"],["n4","Encrypt both states + EU residency"]],ans:"n2"}]}],
  nudge:"The roster embarrasses; the budget costs; the registry prosecutes. Match harm to tier first, then let the tier pick the handling.",
  why:"Harm sets the tier, and the tier then dictates handling — the newsletter needs nothing, the registry export needs encryption in both states plus EU residency.",
  no:"A tier or a handling rule contradicts the harm ladder. Classify by harm first, then bind the handling — never invent handling for a wrong tier."},
 h3:{bench:"w3",pillar:"D",title:"Three incidents, three states",
  prompt:"Three losses, one dataset each. For every incident: name the data state that was violated and the control that would have prevented it.",
  anchor:"Per-state leak vectors and their preventive controls",
  parts:[
   {key:"a",type:"sel",rows:[
    {id:"i2",label:"Claims uploaded to the billing vendor over plain HTTP, captured on the wire",opts:OPTS.states5,ans:"transit"},
    {id:"i3",label:"A contractor photographs the patient portal on a personal phone",opts:OPTS.states5,ans:"use"},
    {id:"i1",label:"A backup drive is stolen from a courier trunk — unencrypted",opts:OPTS.states5,ans:"rest"}]},
   {key:"b",type:"sel",rows:[
    {id:"p2",label:"Preventive control for the captured upload",opts:OPTS.states3.concat([["geob","Geo-blocking"],["hashm","Hashing"]]),ans:"tls"},
    {id:"p3",label:"Preventive control for the photographed portal",opts:OPTS.states3.concat([["geob","Geo-blocking"],["hashm","Hashing"]]),ans:"irm"},
    {id:"p1",label:"Preventive control for the stolen drive",opts:OPTS.states3.concat([["geob","Geo-blocking"],["hashm","Hashing"]]),ans:"enc"}]}],
  nudge:"Ask of each incident: where did the data physically live when it escaped — disk, wire, or screen?",
  why:"Three incidents, three states, three control families — the drive needed encryption at rest, the wire needed TLS, the screen needed IRM and session controls.",
  no:"One incident is mis-mapped. Ask where the data physically was when it escaped: disk, wire, or screen."},
 h4:{bench:"w6",pillar:"D",title:"Triage the full watch-desk log",
  prompt:"All eight events from today's ticker. Mark each <b>Violation</b> or <b>Benign</b>; for every violation also name its exfiltration vector. Three events are noise — find them before you accuse anyone.",
  anchor:"DLP triage with red herrings: content, destination, authority",
  parts:[{key:"a",type:"tri",events:EVENTS.map(e=>e.id),vectors:1}],
  nudge:"Check the actor first: a service account following a signed SOP at 02:00 is a machine doing its job; a manager opening their own payroll file is a Tuesday.",
  why:"Authority, content, destination — checking all three separates the SOP backup and payroll Tuesday from the five real leaks across USB, cloud, email, print and an unmasked copy.",
  no:"One verdict or vector is off. Correlate each event with SOPs, service accounts and roles before judging volume or hour."},
 h5:{bench:"w8",pillar:"M",title:"Run the breach clock",
  prompt:"E-101 is confirmed and it involves EU-partner records. Order the six response steps, then answer the two accountability questions. Both the order and the owners must be exact.",
  anchor:"Incident response sequencing + GDPR 72 h / HIPAA 60 d + processor duty",
  parts:[
   {key:"a",type:"order",items:[["c1","Contain: revoke access, quarantine the endpoint"],["c2","Preserve evidence: image the USB, export logs"],["c3","Assess scope with legal & the DPO"],["c4","Notify the regulator within the clock (GDPR 72 h)"],["c5","Notify affected members"],["c6","Remediate: rotate credentials, close the gap, retrain"]],disp:["c3","c1","c6","c4","c2","c5"],answer:["c1","c2","c3","c4","c5","c6"]},
   {key:"b",type:"sel",rows:[{id:"who",label:"Who leads regulator notification?",opts:OPTS.roles,ans:"dpo"}]},
   {key:"c",type:"sel",rows:[{id:"proc",label:"Cardinal (processor) learns of a breach first. Its duty:",opts:[["a","Notify the regulator directly"],["b","Notify MVHA — the controller — without undue delay"],["c","Notify affected members itself"],["d","Stay silent until MVHA asks"]],ans:"b"}]}],
  nudge:"Nothing external leaves before scope is known — and nothing is remediated before evidence is preserved.",
  why:"Contain, preserve, assess, then the clocks: the DPO leads regulator notification (72 h under GDPR), and the processor's duty runs to the controller first.",
  no:"The sequence or the owners are off. Evidence must exist before remediation, and nothing external leaves before scope is known."},
 h6:{bench:"w7",pillar:"M",title:"Sign off the destruction bay",
  prompt:"Six media types wait on the bay floor. Choose the destruction method for each and decide whether a certificate of destruction is required. Both columns, every row.",
  anchor:"Destruction methods per medium + certificates for regulated data",
  parts:[
   {key:"a",type:"sel",rows:M6O.map(id=>MEDIA.find(m=>m.id===id)).map(m=>({id:m.id,label:m.name,small:m.detail,opts:OPTS.methods,ans:m.opts}))},
   {key:"b",type:"sel",rows:M6O.map(id=>MEDIA.find(m=>m.id===id)).map(m=>({id:m.id+"c",label:"Certificate for: "+m.name,opts:OPTS.yesno,ans:(m.id==="vm"?"no":"yes")}))}],
  nudge:"Regulated data (PHI/PCI/PII) always gets a certificate. Only the sandbox holds nothing regulated — and it still needs a wipe before reuse.",
  why:"Each medium dies by the method that actually kills it — magnets for platters and tape, physical destruction for flash, keys for cloud — and every regulated item earns a certificate of destruction.",
  no:"A method or certificate decision contradicts the media. Flash ignores magnets; regulated data always gets a certificate."},
 h7:{bench:"w5",pillar:"U",title:"The vendor breach: who owes whom?",
  prompt:"Cardinal Claims Processing is breached; MVHA member claims data is exposed. Assign the roles and the first duty. Near-misses are rejected.",
  anchor:"Controller vs processor duties in a third-party breach",
  parts:[{key:"a",type:"sel",rows:[
    {id:"v1",label:"MVHA's role in this processing relationship",opts:OPTS.roles,ans:"controller"},
    {id:"v2",label:"Cardinal's role",opts:OPTS.roles,ans:"processor"},
    {id:"v3",label:"Cardinal's first obligation on discovering the breach",opts:[["a","Notify the regulator directly"],["b","Notify MVHA — the controller — without undue delay"],["c","Notify affected members itself"],["d","Publish a press release"]],ans:"b"},
    {id:"v4",label:"Who notifies affected members?",opts:[["a","Cardinal, as the party breached"],["b","MVHA — the controller — coordinated by the DPO"],["c","Whichever party is faster"],["d","Nobody: claims data is not personal data"]],ans:"b"}]}],
  nudge:"Processors process; controllers decide. Members contracted with whom?",
  why:"Cardinal processes on MVHA's behalf: it owes the controller immediate notice, and MVHA (coordinated by its DPO) owns regulator and member notification.",
  no:"One duty landed on the wrong party. Processors process; controllers decide — and members contracted with MVHA, not with Cardinal."},
 h8:{bench:"w3",pillar:"M",title:"Best-fit controls under constraints",
  prompt:"Four constrained scenarios. Pick the best-fit control <b>and</b> the reason it fits — both must match.",
  anchor:"Trade-offs: masking vs tokenization vs hashing vs HSM key custody",
  parts:[
   {key:"a",type:"sel",rows:[
    {id:"x1",label:"Analytics needs realistic donor data with no identity exposure",opts:OPTS.controls8,ans:"mask"},
    {id:"x2",label:"Recurring card billing without storing PANs in MVHA systems",opts:OPTS.controls8,ans:"tok"},
    {id:"x3",label:"Prove 10-year-old archived research files were never altered",opts:OPTS.controls8,ans:"hash"},
    {id:"x4",label:"Enterprise key custody with tamper-resistant hardware",opts:OPTS.controls8,ans:"hsm"}]},
   {key:"b",type:"sel",rows:[
    {id:"y1",label:"Why it fits — analytics data",opts:[["r1","Preserves analytical shape while removing identifiability"],["r2","Recoverable only through the vault"],["r3","Mathematically reversible with the key"],["r4","Proves integrity without hiding content"]],ans:"r1"},
    {id:"y2",label:"Why it fits — recurring billing",opts:[["r1","Preserves analytical shape while removing identifiability"],["r2","Recoverable only through the vault"],["r3","Mathematically reversible with the key"],["r4","Proves integrity without hiding content"]],ans:"r2"},
    {id:"y3",label:"Why it fits — archive integrity",opts:[["r1","Preserves analytical shape while removing identifiability"],["r2","Recoverable only through the vault"],["r3","Mathematically reversible with the key"],["r4","Proves integrity without hiding content"]],ans:"r4"},
    {id:"y4",label:"Why it fits — key custody",opts:[["r1","Preserves analytical shape while removing identifiability"],["r2","Recoverable only through the vault"],["r3","Mathematically reversible with the key"],["r4","Tamper-resistant dedicated hardware for key operations"]],ans:"r4"}]}],
  nudge:"Display problem → mask; storage problem → tokenize; tamper question → hash; key question → hardware.",
  why:"Fit beats force: masking for display, tokenization to de-scope card storage, hashing to prove integrity, HSM hardware for key custody.",
  no:"A control or its reason mismatches the constraint. Re-read what each scenario actually needs — display, storage, integrity, or key custody."},
 h9:{bench:"w9",pillar:"M",title:"Design the Donor CRM protection plan",
  prompt:"The board funds a new donor CRM. Design its custody plan field by field — the audit will grade every line against this lesson.",
  anchor:"Synthesis: classification, residency, per-state controls, minimization, retention, destruction, ownership",
  parts:[{key:"a",type:"sel",rows:[
    {id:"f1",label:"Classification tier for donor profiles (names, emails, gift history)",opts:OPTS.tiers,ans:"confidential"},
    {id:"f2",label:"Storage region (US-only program)",opts:OPTS.regions,ans:"us"},
    {id:"f3",label:"At-rest control for the CRM database",opts:[["tls","TLS 1.3 session"],["irm","IRM + session access controls"],["enc","Full-disk / volume encryption"]],ans:"enc"},
    {id:"f4",label:"In-transit control for browser sessions",opts:[["enc","Full-disk / volume encryption"],["tls","TLS 1.3 session"],["irm","IRM + session access controls"]],ans:"tls"},
    {id:"f5",label:"PII display control for support staff",opts:[["mask","Masked columns (show last 4)"],["tok","Tokenization vault"],["irm","IRM on every export"],["none","None needed"]],ans:"mask"},
    {id:"f6",label:"Card data approach for recurring gifts",opts:[["pan","Store PANs encrypted in the CRM"],["tok","Tokenize via the payment gateway — no PAN stored"],["skip","Do not accept cards"],["csv","Keep a PAN spreadsheet offline"]],ans:"tok"},
    {id:"f7",label:"Donor record retention",opts:[["a","Forever — donors are precious"],["b","7 years after the last gift, then destroy"],["c","Delete 30 days after entry"],["d","Until a donor complains"]],ans:"b"},
    {id:"f8",label:"End-of-life for cloud copies of the CRM data",opts:OPTS.methods,ans:"crypto"},
    {id:"f9",label:"Who is accountable for this dataset's classification & access?",opts:OPTS.roles,ans:"owner"}]}],
  nudge:"One field per concept: tier, ground, rest, wire, display, cards, clock, death, and a named accountable human.",
  why:"A custody plan is the whole lesson assembled: confidential tier, US residency, encryption at rest, TLS on the wire, masked display, tokenized cards, a 7-year clock, crypto-shredded end-of-life, and a named owner.",
  no:"One line of the plan fails the audit. Each field maps to one concept of this lesson — check tier, ground, states, display, cards, clock, death, owner."}
});

/* ================= QUIZZES (C5) — rebuilt for QA-1/QA-2:
   correct-answer position rotates across items (R4), the correct option is never
   the longest (R5), and every explanation also says why the distractors tempt (B3). */
const QUIZ = {
 medium:[
  {topic:"Data states & safeguards",
   q:"A claims file is being uploaded to the billing vendor over the WAN. Which state is it in, and what is the dominant safeguard?",
   o:[["a","Archive — crypto-shredding"],["b","In use — IRM"],["c","In transit — TLS / IPsec"],["d","At rest — full-disk encryption"]],a:2,
   w:"Data moving across a network is in transit; TLS/IPsec protect the pipe. The distractors each name a real control for the wrong state: crypto-shredding is for archive end-of-life, IRM guards screens and memory, disk encryption guards stored media."},
  {topic:"Tokenization vs masking vs encryption",
   q:"Which method replaces a card number with a surrogate that only a vault can map back?",
   o:[["a","Tokenization"],["b","Masking"],["c","Encryption"],["d","Hashing"]],a:0,
   w:"Tokenization swaps the value for a surrogate; the mapping lives in a vault. Masking hides irreversibly (display only), encryption reverses with a key so the real value stays in the system, and hashing is one-way — no recovery and no processing."},
  {topic:"Controller role",
   q:"At MVHA, who decides WHY and HOW patient data is processed?",
   o:[["a","The data owner"],["b","The data processor"],["c","The data steward"],["d","The data controller"]],a:3,
   w:"The controller determines purposes and means — the organization, through its practice director. The owner is accountable for the dataset, the steward keeps quality day-to-day, and the processor only works on the controller's behalf."},
  {topic:"Data sovereignty",
   q:"MVHA's Dublin-partner patient records should be stored…",
   o:[["a","Wherever storage is cheapest"],["b","In the EU-West (Dublin) region"],["c","Anywhere, provided they are encrypted"],["d","On tape in a US vault"]],a:1,
   w:"Sovereignty binds data to the law of where it lives; EU-partner records carry GDPR residency expectations. The distractors all dodge that legal wall: cheaper storage, encryption alone, or a US tape vault never cure a cross-border transfer problem."},
  {topic:"Retention & lifecycle",
   q:"A retention policy primarily governs which part of the lifecycle?",
   o:[["a","Create / capture"],["b","Store"],["c","Archive → destroy"],["d","Use / share"]],a:2,
   w:"Retention defines how long records rest in archive before destruction becomes mandatory — the clock between archive and destroy. Create, store and use are governed by handling rules, not by the retention clock."},
  {topic:"Destruction methods (SSDs)",
   q:"Degaussing is INEFFECTIVE against which media?",
   o:[["a","Solid-state drives"],["b","Magnetic hard disks"],["c","LTO backup tapes"],["d","Legacy floppy disks"]],a:0,
   w:"SSDs have no magnetic platters to scramble, so a degausser does nothing — they need physical destruction. The other three are magnetic media, which is exactly what a degausser erases."},
  {topic:"Data minimization",
   q:"Data minimization means…",
   o:[["a","Hiding part of every value collected"],["b","Classifying everything as public data"],["c","Compressing data to save storage space"],["d","Collecting only what the purpose needs"]],a:3,
   w:"Minimization is subtraction at the point of collection: never gather what the stated purpose does not require. The distractors manage data you should never have collected — masking hides values, mislabeling as public lowers protection, and compression only saves space."}],
 hard:[
  {topic:"Test data protection",
   q:"The dev team asks for a copy of the production patient database for testing. The best answer is:",
   o:[["a","Give them the copy encrypted with a shared password"],["b","Email a 5,000-row CSV sample"],["c","Let them copy it, signed NDA only"],["d","Provide a masked or synthetic dataset"]],a:3,
   w:"Masked or synthetic data keeps the analytical shape without the identity. An encrypted copy still concentrates regulated data in a weaker zone, an NDA does not sanitize anything, and email multiplies uncontrolled copies."},
  {topic:"DLP triage",
   q:"Watch-desk log — which event is the true exfiltration?",
   o:[["a","02:00 — 4.1 GB encrypted backup to eu-west-1.mvha.example by svc-backup, per SOP BK-07"],["b","21:40 — analyst uploads member_export.csv with unmasked SSNs to a personal cloud drive"],["c","15:12 — HR manager opens payroll_2026.xlsx over the VPN"],["d","11:30 — masked newsletter sent to 3,000 opt-in donors"]],a:1,
   w:"Unmasked SSNs to a personal, unapproved destination with no business need is exfiltration. The others match a signed SOP and service account, an authorized role, and a masked consented list — authority, content and destination all check out."},
  {topic:"Processor breach duties",
   q:"Cardinal Claims (a processor) discovers a breach affecting MVHA member claims. Its first duty is:",
   o:[["a","Notify the supervisory authority itself"],["b","Notify the affected members itself"],["c","Notify the controller without delay"],["d","Stay silent until MVHA asks"]],a:2,
   w:"A processor works on the controller's behalf, so its duty is to alert MVHA fast. The processor has no direct duty to the regulator or the members — those notifications belong to the controller, coordinated by its DPO."},
  {topic:"Crypto-shredding",
   q:"You are retiring a cloud archive of patient scans and need the data unrecoverable without waiting on the provider's physical destruction process. You use:",
   o:[["a","One quick wipe of the bucket"],["b","Crypto-shredding — destroy the keys"],["c","Move the bucket to cold storage"],["d","Degauss the provider's disks yourself"]],a:1,
   w:"Destroying the keys makes every replica unreadable immediately, wherever it lives. A single wipe misses replicas, cold storage keeps the data alive, and you cannot reach another provider's disks with a degausser."},
  {topic:"Removable media at rest",
   q:"A stolen unencrypted USB stick held 500 member records. Which state was violated, and which pair prevents a repeat?",
   o:[["a","In transit — enforce TLS on the link"],["b","In use — add IRM watermarks"],["c","In archive — shorten the retention"],["d","At rest — encrypt media and block USB"]],a:3,
   w:"The data sat on media, so the violated state is at rest. TLS answers a wire problem, IRM a screen problem, and retention an archive problem — none of them stops the next unencrypted stick from mounting."},
  {topic:"Masking for display",
   q:"The helpdesk must view donor records to resolve calls but must not see full card numbers. The cheapest adequate control:",
   o:[["a","Masking the displayed card column"],["b","Tokenization at the gateway"],["c","An HSM for every agent"],["d","Full-disk encryption on laptops"]],a:0,
   w:"A display problem is solved by masking: agents see the last four digits and nothing more. Tokenization answers storage scope, an HSM guards keys, and disk encryption does nothing once the record is on screen."},
  {topic:"Per-state control matrix",
   q:"Which bundle best protects the pre-patent MVX-217 research in ALL three states?",
   o:[["a","Volume encryption of every disk"],["b","TLS on every connection"],["c","Encryption in all three states"],["d","Hashing of every record"]],a:2,
   w:"Crown jewels need the full matrix — encrypted disks, encrypted links, and in-use rights such as IRM and DLP. Disk-only or TLS-only leaves two states open, and hashing proves integrity without hiding anything."}]
};
