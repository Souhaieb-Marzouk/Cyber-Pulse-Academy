"use strict";
/* =============================================================================
   js/data.js — ALL lab content, separated from logic (SC-D7).
   Carried over 1:1 from the original single-file lab: same wording, same
   correct answers, same hint tiers, same feedback messages, same data orders
   (incl. the audit's interleaved displays and rotated quiz keys).
   Contents: Knowledge Core (KC), glossary, quiz banks, debrief, lifecycle
   constants, medium/hard environments, equality helpers, pillars, objectives,
   desk registry.
   ========================================================================== */

const KC = {
  intro: `Asset management is the discipline of knowing — at all times — what hardware, software and data you have, who is accountable for each item, where it is, and when it should leave. It is Objective 4.2 of CompTIA Security+ SY0-801 (<em>“Explain the security implications of proper hardware, software, and data asset management”</em>) and it is the control every other control silently depends on: you cannot patch, monitor, back up, or delete an asset you do not know exists.`,
  whyAttackers: `Attackers love inventory blind spots because those assets sit <strong>outside every control</strong>. MITRE ATT&CK documents <code>T1200 Hardware Additions</code> (Initial Access): adversaries may physically introduce networking hardware or computing devices into a target — the DarkVishnya group (G0105) physically connected Bash Bunny, Raspberry Pi and cheap laptops into victim networks. Unsanctioned cloud services give them an exfiltration lane: <code>T1567.002 Exfiltration to Cloud Storage</code> — Akira (G1024) has used Rclone, and APT41's DUST operation (C0040) uploaded stolen data to OneDrive. Every rogue device and unsanctioned app in this lab is that chain, seen from the defender's side.`,
  stages: [
    {n:"1", t:"Planning &amp; scoping", d:"Before anything is bought: what will it do, what data will it hold (sensitivity!), how long will the vendor support it, what is the patching cadence, who owns it, how will it be disposed of. The cheapest point to inject security — after signing, every requirement costs more."},
    {n:"2", t:"Acquisition &amp; procurement", d:"Vendor assessment before selection; buy through authorized channels (provenance — counterfeit or tampered equipment arrives exactly through “too good” offers); ownership assigned at purchase; assets tagged and logged the day they arrive."},
    {n:"3", t:"Assignment &amp; accounting", d:"Every asset gets an owner (accountable executive), a custodian (does the daily upkeep), and a classification that drives its handling rules. No record → no accountability → nobody answers for the incident."},
    {n:"4", t:"Monitoring &amp; asset tracking", d:"Keep records honest: location, condition, configuration, status. Enumeration via discovery scans, agents, DHCP/DNS, cloud APIs, switch MAC tables, egress and expense records. Monitoring is change detection: new devices, silent assets, unapproved installs."},
    {n:"5", t:"Disposal &amp; decommissioning", d:"Residual data, credentials, certificates, cloud resources, licenses and dependencies all survive the machine's death if you let them. Verified sanitization (wipe, crypto-erase, degauss, destroy), certificates of destruction, retention vs. legal hold."}
  ],
  families: `<p><strong>Hardware</strong> — servers, workstations, mobiles, network gear, IoT, removable media; managed with tags, check-out records and MDM location reporting. Frequently forgotten: printer/MFD internal drives, network appliances with configs and keys, backup tapes, phones.</p>
<p><strong>Software</strong> — inventory the apps, versions, licenses and dependencies. A software bill of materials (SBOM) answers “are we affected?” the day a library turns vulnerable. License position = entitlements vs. installs; shadow IT is the inventory that grew without you.</p>
<p><strong>Data</strong> — the weakest of the three and the breach-notification driver: know its location, owner, classification and retention. Keep it only as long as needed or the law requires — over-retention widens every breach, and legal hold overrides the schedule entirely.</p>`,
  cases: [
    {t:"Equifax (2017) — widely reported", d:"An unpatched Apache Struts flaw on a public-facing server led to a breach of ~147M people; post-incident investigations criticized gaps in asset visibility and inventory. One unknown, unmanaged system became the whole story."},
    {t:"Deep Root Analytics (2017) — widely reported", d:"1.1 TB of voter-related data sat in an unsecured cloud storage bucket owned by a contractor. A data asset nobody was tracking, retained past its usefulness, with no owner watching the configuration."},
    {t:"Marriott / Starwood (2018) — widely reported", d:"The breach lived in inherited Starwood systems that pre-dated the acquisition — proof that M&amp;A hands you a bag of undocumented assets, and due diligence is asset management."}
  ],
  disposalTable: [
    ["Secure wipe / overwrite", "Magnetic HDDs", "Repeated overwrites; sound for magnetic media, <strong>unreliable on SSDs</strong> (wear levelling leaves remnants)"],
    ["Cryptographic erase", "SSDs, flash, cloud volumes", "Destroy the encryption key → data is unrecoverable. The practical SSD/cloud answer"],
    ["Degaussing", "Magnetic media (HDDs, tapes)", "Magnetic erasure only — <strong>inert against SSDs</strong> (charge-based storage). Favorite exam distinction"],
    ["Physical destruction", "Highest-sensitivity media", "Shredding, crushing, incinerating, pulverizing; expected for the most sensitive data"],
    ["Quick format / file deletion", "Nothing — a trap", "Frees space, recovers data with tools. Never acceptable as sanitization"]
  ],
  ownership:`<p><strong>Data owner</strong> — the accountable executive for a data asset: decides classification, who gets access, approves destruction, answers for it in an incident. Ownership is a role, not a location.</p>
<p><strong>Custodian / steward</strong> — the role doing daily operation and upkeep: backups, retention configuration, storage maintenance. Implements what the owner decides.</p>`
};
const GLOSSARY = [
  ["Asset","Anything of value to the organization: hardware, software, or data."],
  ["Asset inventory / CMDB","The authoritative record of assets and their attributes (owner, location, status)."],
  ["Enumeration","Discovering what exists: discovery scans, agents, DHCP/DNS, cloud APIs, switch MAC tables, egress and expense records."],
  ["Configuration drift","An asset's real state diverging from its recorded or authorized state."],
  ["Shadow IT","Unsanctioned hardware, apps or cloud services used without approval."],
  ["Provenance","The traceable origin of an asset through authorized acquisition channels."],
  ["SBOM","Software bill of materials — the ingredient list of a product's components and dependencies."],
  ["Data owner","The accountable role for a data asset's classification, access decisions and retirement."],
  ["Custodian / steward","The role doing daily upkeep (backups, retention config) as the owner decides."],
  ["Data classification","The sensitivity label on an asset that drives its handling rules."],
  ["Sanitization","Rendering data on media unrecoverable: wipe, cryptographic erase, degauss, or destroy."],
  ["Cryptographic erase","Destroying the encryption key so data is unrecoverable — the practical SSD/cloud answer."],
  ["Degaussing","Magnetic erasure; inert against SSDs because they store charge, not magnetism."],
  ["Certificate of destruction","Records what was destroyed, how, when, and witnessed by whom."],
  ["Legal hold","A litigation requirement that overrides the retention schedule entirely."]
];
const QUIZ = {
  medium: [
    {q:"A team writes vendor-support windows and data-sensitivity requirements into a purchase request before anything is signed. Which lifecycle stage is this?",
     opts:["Acquisition & procurement","Monitoring & asset tracking","Planning & scoping","Disposal & decommissioning"], c:2, topic:"lifecycle stages",
     why:"Requirements written before the PO exists = planning & scoping, the cheapest point to inject security. Acquisition & procurement then executes those requirements (vendor assessment, authorized channels, logging on arrival) — monitoring and disposal come later."},
    {q:"A retired SSD must leave the building. Which method is essentially useless on it?",
     opts:["Degaussing the drive","Cryptographic erasure","Physical shredding","Overwrite, then reuse"], c:0, topic:"sanitization methods",
     why:"SSDs store data as charge, not magnetism, so a degausser's field is inert. Overwriting is unreliable too (wear levelling leaves remnants); cryptographic erase and physical shredding are the exam-correct answers for SSDs."},
    {q:"An auditor asks for proof that backup tapes were destroyed. A valid certificate of destruction shows…",
     opts:["Purchase price and vendor logo","A verbal assurance checkbox","The reseller's product brochure","What / how / when / witnessed"], c:3, topic:"certificate of destruction",
     why:"The certificate must let an auditor reconstruct the event: what was destroyed, how, when, and witnessed by whom. Price tags, brochures and verbal assurances are the classic insufficient-evidence distractors."},
    {q:"Who DECIDES who may access the claims archives — and who implements the backups and retention configuration?",
     opts:["Custodian decides; owner implements","Owner decides; custodian implements","Both decisions sit with IT operations","The security team decides both"], c:1, topic:"owner vs custodian",
     why:"The data owner (accountable executive) decides classification, access and retirement; the custodian/steward does the daily upkeep as the owner decides. Ownership is a role, not a department."},
    {q:"A record's 7-year retention schedule has expired, but the file is under active litigation hold. What happens?",
     opts:["Hold overrides the schedule","Destroy on schedule anyway","Destroy once legal is informed","Delete half the file"], c:0, topic:"retention & legal hold",
     why:"Legal hold overrides the retention schedule entirely — informing legal is not the same as the hold lifting. Early destruction risks spoliation sanctions and lost evidence."},
    {q:"Which evidence sources most reliably reveal shadow IT (unsanctioned cloud services)?",
     opts:["Badge and lobby access logs","Printer and scan queues","Egress and expense records","CPU utilization dashboards"], c:2, topic:"shadow IT detection",
     why:"Unsanctioned SaaS shows up where its money and traffic are: egress records expose uploads to unknown services, expense records expose card-bought subscriptions. Badges, printers and CPU graphs never see it."}
  ],
  hard: [
    {q:"ARTIFACT: A decommissioned multifunction printer is on the loading dock for the recycler. Its internal drive holds two years of cached scan jobs (claimant PII). Correct action?",
     opts:["Let it go — printers retain no data","Email the recycler: handle with care","Rename the printer's record in the CMDB","Stop the pickup; certify destruction"], c:3, topic:"disposal of forgotten assets",
     why:"MFDs are the classic forgotten asset — internal drives persist cached documents. Disposal requires verified sanitization plus a certificate recording what/how/when/witnessed; asking the recycler to be careful is not evidence, and renaming a record changes nothing."},
    {q:"ALERT: NAC reports an unknown MAC on lobby switch port 12. Which containment is correct?",
     opts:["Power off the entire lobby switch","Quarantine the port via NAC first","Ignore it — MACs often duplicate","Wipe every unknown laptop in the fleet"], c:1, topic:"rogue device containment",
     why:"Containment is surgical: quarantine that port (network access control, cf. M1035) so evidence and business both survive. Switch power-off harms the estate; ignoring duplicates is negligence; mass-wiping destroys evidence."},
    {q:"Underwriting needs an end-of-support server for one more quarter. Formal risk response?",
     opts:["Accept the risk formally, no controls","Transfer — buy more cyber insurance","Mitigate with compensating controls","Avoid — stop using it tonight"], c:2, topic:"formal risk response",
     why:"Acceptance requires tolerance and sign-off — weak for an unpatchable host; insurance transfers money, not likelihood; avoidance halts the business. Mitigate: segment, restrict inbound, monitor, and sign a dated exception."},
    {q:"A researcher registers a subdomain your org stopped using and starts receiving its mail. Which decommissioning leftover caused this?",
     opts:["The stale DNS record","The VM snapshot on the SAN","The orphaned cloud volume","The retired service account"], c:0, topic:"decommissioning leftovers",
     why:"Stale DNS pointing at a service you no longer control is the subdomain-takeover gift. Snapshots, volumes and accounts are leftovers too — but none of them ever answered for that hostname."},
    {q:"CVE published today for library 'libziplog 2.3'. What does the SBOM let you do that the inventory alone cannot?",
     opts:["Patch the library automatically","Prove the CVE does not apply","Renew the vendor contract early","Find every product embedding it"], c:3, topic:"SBOM purpose",
     why:"An SBOM is the ingredient list — products, versions, dependencies — so 'are we affected?' is answered in minutes. It informs patching but does not patch, and it is how you prove (or disprove) exposure first."},
    {q:"Which media pair makes cryptographic erase the right first choice?",
     opts:["Magnetic HDD + LTO tape","CD-ROM + paper archive","SSD + cloud data volume","Floppy + punch cards"], c:2, topic:"cryptographic erase applicability",
     why:"Crypto-erase shines where overwriting is unreliable or impossible: SSDs (wear levelling) and cloud volumes (destroy the key). Magnetic media answers to wipe or degauss; paper answers to shredders."},
    {q:"Ledger shows Chartwright CAD: 250 entitlements, 0 discovered installs. Correct action?",
     opts:["Buy more licenses immediately","Reclaim licenses and budget","Declare a license violation","Uninstall it from every host"], c:1, topic:"license position triage",
     why:"Zero installs with real entitlements is wasted spend, not a violation — reclaim at renewal. Over-deployment is the violation case (buy or reduce); uninstalling something that is not installed is nonsense."}
  ]
};
const DEBRIEF = {
  detect: [
    ["CMDB reconciliation","Diff the discovery scan (plus EDR and cloud API inventories) against the registry weekly: every device seen-but-unregistered, and every record seen-nowhere, is a finding. Example logic: <code>new_mac ON access_switch AND mac NOT IN cmdb WITHIN 24h → open rogue-asset ticket</code>."],
    ["Change detection on inventory feeds","Alert on assets absent from patch reports for ~90 days (a lapsed check-in is a high-value signal), on unapproved software installs, and on configuration drift between an asset and its record."],
    ["Shadow IT sweeps","Correlate egress traffic with expense records: subscriptions bought on corporate cards but absent from the SaaS catalog, and uploads to personal storage domains, are both findings."],
    ["Disposal evidence audit","Sample retired assets and demand the certificate trail: what / how / when / witnessed. Missing evidence is a finding even if the media is gone."]
  ],
  mitigate: [
    ["M1033","Limit Software Installation — allowlists, software restriction policies, endpoint management tools, least privilege. That is the allow-list desk, formalized."],
    ["M1034","Limit Hardware Installation — disable/restrict USB ports, driver installation control, device whitelisting. Directly counters attacker-introduced hardware."],
    ["M1035","Limit Access to Resource Over Network — NAC via 802.1x and device certificates: the unmanaged device never gets a LAN lease."],
    ["M1051","Update Software — patching OSes, applications, drivers, firmware; and its lifecycle twin, replacing EOL/EOS assets before they become unpatchable."],
    ["M1017","User Training — the procurement desk's rules only work if requesters know why the form asks those questions."]
  ],
  blue: [
    "Reconcile, don't collect: a scan you never diff against the registry is a spreadsheet, not a control.",
    "Treat a silent asset (no patch check-in ~90 days) as a screaming one.",
    "Disposal is not done when the truck leaves — it is done when the certificate, the CMDB update, the DNS removal and the key revocation all exist.",
    "Ownership is a role, not a department: every asset needs one accountable name."
  ],
  red: [
    "Your easiest entry is the asset that exists in no control: a Raspberry Pi in a conference room (T1200 — DarkVishnya did exactly this with Bash Bunnies and cheap laptops) or an EOL server nobody remembers.",
    "Unsanctioned storage is your exfiltration lane (T1567.002 — Akira used Rclone; APT41 DUST used OneDrive) because hosts already talk to cloud services.",
    "Leftovers are persistence: VM snapshots, orphaned volumes, stale DNS, live service accounts and API keys all survive the 'retirement' of a system.",
    "M&A is a delivery mechanism for someone else's unmanaged assets (Marriott/Starwood)."
  ],
  links: [
    ["https://attack.mitre.org/techniques/T1200/","ATT&CK T1200 — Hardware Additions"],
    ["https://attack.mitre.org/techniques/T1567/002/","ATT&CK T1567.002 — Exfiltration to Cloud Storage"],
    ["https://attack.mitre.org/mitigations/M1033/","ATT&CK M1033 — Limit Software Installation"],
    ["https://attack.mitre.org/mitigations/M1034/","ATT&CK M1034 — Limit Hardware Installation"],
    ["https://attack.mitre.org/mitigations/M1051/","ATT&CK M1051 — Update Software"],
    ["https://www.comptia.org/certifications/security","CompTIA Security+ certification (official objectives)"]
  ],
  next: ["Objective 4.3 — vulnerability management (your inventory feeds the scanner's scope)","Data-handling objectives — classification levels, retention and DLP in depth","Hands-on: NAC/802.1x enrollment and MDM/UEM onboarding walk-throughs"]
};

const STAGE_ORDER = ["plan","acquire","assign","monitor","dispose"];
const STAGE_NAMES = {plan:"Planning & scoping", acquire:"Acquisition & procurement", assign:"Assignment & accounting", monitor:"Monitoring & asset tracking", dispose:"Disposal & decommissioning"};

const ENV_M = {
  recon: {
    devices: [
      {id:"d1", host:"CRV-WS-0141", ip:"10.20.4.141", mac:"00:1A:2B:3C:4D:01", os:"Windows 11 workstation", note:"Matches registry record."},
      {id:"d2", host:"CRV-MFD-R2", ip:"10.20.4.60", mac:"00:1A:2B:3C:4D:60", os:"MFD printer (internal drive)", note:"Matches registry record."},
      {id:"d3", host:"CRV-SRV-FILE03", ip:"10.20.1.23", mac:"00:1A:2B:3C:4D:23", os:"Windows Server (file services)", note:"Matches registry record."},
      {id:"d4", host:"(blank)", ip:"10.20.99.37", mac:"DC:65:3F:11:07:AA", os:"Unknown Linux device", note:"No hostname; first seen yesterday, guest VLAN 99."},
      {id:"d5", host:"CRV-LT-0092", ip:"10.20.4.92", mac:"00:1A:2B:3C:4D:92", os:"Windows 11 laptop", note:"Matches registry record."},
      {id:"d6", host:"CRV-WS-0303", ip:"10.20.4.30", mac:"00:1A:2B:3C:4D:AA", os:"Windows 11 workstation", note:"Matches registry record."},
      {id:"d7", host:"(blank)", ip:"10.20.4.77", mac:"F2:1A:B4:07:55:10", os:"Chromecast-like media device", note:"Nobody claims it; it is on the OFFICE VLAN, not guest."},
      {id:"d8", host:"CRV-AP-LOBBY", ip:"10.20.1.8", mac:"00:1A:2B:3C:4D:08", os:"Wi-Fi access point", note:"Matches registry record."},
      {id:"d9", host:"CRV-PRT-F2", ip:"10.20.4.62", mac:"00:1A:2B:3C:4D:62", os:"Laser printer", note:"Matches registry record."}
    ],
    devAns: {d1:"known", d2:"known", d3:"known", d4:"rogue", d5:"known", d6:"known", d7:"rogue", d8:"known", d9:"known"},
    registry: [
      {id:"r1", tag:"CRV-WS-0141", type:"Workstation", owner:"Sales Ops"},
      {id:"r2", tag:"CRV-SRV-FILE01", type:"File server", owner:"IT Ops", note:"Decommissioned last year — still here?"},
      {id:"r3", tag:"CRV-SRV-FILE03", type:"File server", owner:"IT Ops"},
      {id:"r4", tag:"CRV-MFD-R2", type:"MFD printer", owner:"Facilities"},
      {id:"r5", tag:"CRV-LT-0092", type:"Laptop", owner:"Field Sales"},
      {id:"r6", tag:"CRV-NAS-ARCH", type:"Archive NAS", owner:"IT Ops", note:"No discovery-scan record matches this tag."},
      {id:"r7", tag:"CRV-WS-0303", type:"Workstation", owner:"Finance"},
      {id:"r8", tag:"CRV-AP-LOBBY", type:"Access point", owner:"IT Ops"},
      {id:"r9", tag:"CRV-PRT-F2", type:"Printer", owner:"Facilities"}
    ],
    regAns: {r1:"live", r2:"stale", r3:"live", r4:"live", r5:"live", r6:"stale", r7:"live", r8:"live", r9:"live"}
  },
  plan: {
    options: [
      {id:"o3", t:"Management & patching integration (MDM/UEM, update tooling)", good:true},
      {id:"o7", t:"Consistent chassis color across the whole fleet", good:false},
      {id:"o1", t:"Vendor support window & end-of-life commitment", good:true},
      {id:"o9", t:"Buying wherever is cheapest, provenance can wait", good:false},
      {id:"o5", t:"Disposal / sanitization plan defined before the PO", good:true},
      {id:"o2", t:"Classification of the data the devices will hold", good:true},
      {id:"o8", t:"Waiting to tag & register assets until next year's audit", good:false},
      {id:"o6", t:"Required security features (disk encryption, TPM)", good:true},
      {id:"o4", t:"Named owner & custodian assigned at purchase", good:true}
    ],
    required: ["o1","o2","o3","o4","o5","o6"],
    scenarios: [
      {id:"s1", t:"A reseller offers 50 current-model laptops at 40% off — but carries no vendor warranty and two serials don't match their boxes.", ans:"reject"},
      {id:"s2", t:"The preferred vendor's security assessment is still in progress; Legal wants the PO signed today.", ans:"hold"},
      {id:"s3", t:"The 40 laptops just arrived at receiving. Deployment is scheduled for Monday morning.", ans:"intake"}
    ],
    scenarioOpts: {
      reject:["Reject — provenance cannot be verified","Buy — excellent price, tag them later","Buy now, tag the assets next audit"],
      hold:["Sign today — the template is standard","Hold the PO until assessment completes","Ask the vendor to self-certify"],
      intake:["Deploy Monday; tagging can wait for the annual audit","Store unopened until users claim them","Tag, assign owner, log on arrival"]
    }
  },
  roles: {
    items: [
      {id:"r1", t:"Decide who may access the claims archives"},
      {id:"r2", t:"Implement retention configuration & run the backups for those archives"},
      {id:"r3", t:"Approve destruction of records whose schedule has expired"},
      {id:"r4", t:"Maintain the storage array and the backup jobs"}
    ],
    cls: [
      {id:"c1", t:"Claims database holding claimant PII", ans:"confidential"},
      {id:"c2", t:"Public product brochure PDF", ans:"public"}
    ]
  },
  alerts: [
    {id:"a4", t:"Planned maintenance window this Saturday 22:00–02:00", good:false},
    {id:"a1", t:"NAC: unknown MAC DC:65:3F:11:07:AA appeared on lobby switch port 12", good:true},
    {id:"a6", t:"Backup job completed successfully for CRV-SRV-FILE03", good:false},
    {id:"a3", t:"EDR discovery: device 'DESKTOP-J91QK2' responding, no CMDB record", good:true},
    {id:"a5", t:"License renewal reminder: M365 tenant, due next month", good:false},
    {id:"a2", t:"Patch report: CRV-APP-07 has not checked in for 90+ days", good:true},
    {id:"a7", t:"Wi-Fi roaming event: CRV-LT-0092 (known laptop)", good:false},
    {id:"a8", t:"Badge access: J. Alvarez, main lobby, 08:52 (active employee)", good:false}
  ],
  shadow: [
    {id:"s1", t:"FinSpark Analytics", ev:"Finance bought it on a corporate expense card; absent from the SaaS catalog; claimant data uploaded", good:true},
    {id:"s2", t:"Corvane M365 tenant", ev:"Approved, catalogued, SSO-enforced", good:false},
    {id:"s3", t:"Relate360 CRM", ev:"Approved vendor; data-processing agreement on file", good:false},
    {id:"s4", t:"Personal Dropbox account", ev:"Egress shows claims exports syncing to a personal account", good:true},
    {id:"s5", t:"Contractor's personal Google Drive", ev:"Policy documents stored outside the tenant by an external contractor", good:true},
    {id:"s6", t:"PayCycle payroll SaaS", ev:"Approved, HR-owned, in catalog", good:false}
  ],
  disposal: {
    methods: [
      {id:"wipe", t:"Secure wipe (overwrite) — reuse"},
      {id:"crypto", t:"Cryptographic erase (destroy the key)"},
      {id:"degauss", t:"Degaussing (magnetic erasure)"},
      {id:"destroy", t:"Physical destruction (shred / incinerate)"},
      {id:"quickformat", t:"Quick format + trash pickup"}
    ],
    assets: [
      {id:"m1", t:"3.5\" magnetic HDD array (claims server)", cls:"Restricted — claimant PII", ans:"destroy"},
      {id:"m2", t:"Laptop SSD (redeployable)", cls:"Internal documents", ans:"crypto"},
      {id:"m3", t:"LTO backup tapes (retired library)", cls:"Confidential", ans:"degauss"},
      {id:"m4", t:"Encrypted USB flash drives", cls:"Internal", ans:"crypto"},
      {id:"m5", t:"MFD internal drive (2 yrs of cached scans)", cls:"Confidential — claimant PII", ans:"destroy"},
      {id:"m6", t:"Workstation HDD (marketing archive)", cls:"Public", ans:"wipe"}
    ]
  },
  gaps: [
    {id:"g6", t:"Empty rack slot label in the DC layout doc", good:false},
    {id:"g1", t:"VM snapshot of FILE01 still resident on the SAN", good:true},
    {id:"g3", t:"Stale DNS record: filesrv.corvane.example still resolving", good:true},
    {id:"g7", t:"Cleaning crew rotation changed in the building", good:false},
    {id:"g2", t:"Orphaned cloud volume from the migration, still billed", good:true},
    {id:"g5", t:"Software licenses never cancelled with the vendor", good:true},
    {id:"g4", t:"svc_backup service account active with a live API key", good:true}
  ],
  seq: [
    {id:"q1", t:"Confirm data migration & owner sign-off"},
    {id:"q2", t:"Revoke credentials, keys, licenses & vendor services"},
    {id:"q3", t:"Sanitize media (wipe / cryptographic erase)"},
    {id:"q4", t:"Physically destroy components that require it"},
    {id:"q5", t:"Obtain certificate of destruction (what / how / when / witnessed)"},
    {id:"q6", t:"Update inventory, DNS & network documentation"}
  ],
  cert: {
    req: [
      {id:"w5", t:"Purchase price of the media", good:false},
      {id:"w1", t:"What was destroyed (asset tags & counts)", good:true},
      {id:"w7", t:"A “verbal assurance” checkbox", good:false},
      {id:"w2", t:"How — the method used", good:true},
      {id:"w6", t:"The reseller's product brochure", good:false},
      {id:"w3", t:"When — date and time", good:true},
      {id:"w8", t:"Next-quarter budget forecast", good:false},
      {id:"w4", t:"Witnessed by whom", good:true}
    ],
    ev: [
      {id:"e3", t:"Signed certificate listing method & witness", insuf:false},
      {id:"e1", t:"Quick-format screenshot taken before pickup", insuf:true},
      {id:"e4", t:"Destruction log entry referencing asset tags", insuf:false},
      {id:"e5", t:"Chain-of-custody handover record", insuf:false},
      {id:"e2", t:"Vendor's phone call: “trust us, it's clean”", insuf:true}
    ]
  },
  retention: [
    {id:"b1", t:"Claims records", meta:"8 yrs old · schedule 7 yrs · no hold", ans:"destroy"},
    {id:"b2", t:"Policyholder email archive", meta:"2 yrs old · schedule 7 yrs · no hold", ans:"retain"},
    {id:"b3", t:"Accounting records", meta:"8 yrs old · schedule 8 yrs · no hold", ans:"destroy"},
    {id:"b4", t:"HR disciplinary file", meta:"active litigation — legal hold", ans:"hold"},
    {id:"b5", t:"Meeting recordings", meta:"1 yr old · schedule 1 yr · no hold", ans:"destroy"}
  ],
  retOpts: [["destroy","Destroy now"],["retain","Retain — schedule not met"],["hold","Destroy when the hold lifts"]]
};

const ENV_H = {
  recon: {
    devices: [
      {id:"d1", host:"CRV-WS-0141", ip:"10.20.4.141", mac:"00:1A:2B:3C:4D:01", src:"scan + EDR"},
      {id:"d2", host:"CRV-MFD-R2", ip:"10.20.4.60", mac:"00:1A:2B:3C:4D:60", src:"scan"},
      {id:"d3", host:"CRV-SRV-FILE03", ip:"10.20.1.23", mac:"00:1A:2B:3C:4D:23", src:"scan + EDR"},
      {id:"d4", host:"(blank)", ip:"10.20.99.37", mac:"DC:65:3F:11:07:AA", src:"scan; also answered an EDR discovery probe"},
      {id:"d5", host:"CRV-LT-0092", ip:"10.20.8.92", mac:"00:1A:2B:3C:4D:92", src:"scan — MAC matches registry; registry IP says 10.20.4.92 (DHCP scope changed in March)"},
      {id:"d6", host:"CRV-WS-0303", ip:"10.20.4.30", mac:"00:1A:2B:3C:4D:AA", src:"scan + EDR"},
      {id:"d7", host:"(blank)", ip:"10.20.4.77", mac:"F2:1A:B4:07:55:10", src:"scan"},
      {id:"d8", host:"CRV-AP-LOBBY", ip:"10.20.1.8", mac:"00:1A:2B:3C:4D:08", src:"scan"},
      {id:"d9", host:"DEV-LAB-VM44", ip:"10.20.66.44", mac:"02:FF:44:05:12:44", src:"scan + EDR; R&D lab VLAN, registered owner"},
      {id:"d10", host:"UNK-NEW-7712", ip:"10.20.4.171", mac:"00:1A:2B:3C:8B:71", src:"scan — not in CMDB; see receiving reports"},
      {id:"d11", host:"CRV-PRT-F2", ip:"10.20.4.62", mac:"00:1A:2B:3C:4D:62", src:"scan"},
      {id:"d12", host:"CRV-LT-0311", ip:"10.20.4.31", mac:"BB:22:9E:04:19:C3", src:"scan — hostname matches registry; MAC differs"}
    ],
    devOpts: [["known","Known — matches registry"],["rogue","Rogue — no record, no receipt"],["pending","Pending intake — on a signed receiving report"],["ipchange","Known — legitimate IP/MAC change"]],
    devAns: {d1:"known", d2:"known", d3:"known", d4:"rogue", d5:"ipchange", d6:"known", d7:"rogue", d8:"known", d9:"known", d10:"pending", d11:"known", d12:"known"},
    registry: [
      {id:"r1", tag:"CRV-WS-0141", detail:"Workstation · Sales Ops"},
      {id:"r2", tag:"CRV-SRV-FILE01", detail:"File server · retired last year"},
      {id:"r3", tag:"CRV-SRV-FILE03", detail:"File server · IT Ops"},
      {id:"r4", tag:"CRV-MFD-R2", detail:"MFD · Facilities"},
      {id:"r5", tag:"CRV-LT-0092", detail:"Laptop · Field Sales · registry IP 10.20.4.92"},
      {id:"r6", tag:"CRV-NAS-ARCH", detail:"Archive NAS · no scan or EDR hit"},
      {id:"r7", tag:"CRV-WS-0303", detail:"Workstation · Finance"},
      {id:"r8", tag:"CRV-AP-LOBBY", detail:"Access point · IT Ops"},
      {id:"r9", tag:"CRV-LT-0311", detail:"Laptop · registry MAC AA:11:7C:04:19:C3; discovery shows BB:22:9E"},
      {id:"r10", tag:"CRV-WS-0512", detail:"Workstation · imaged, never deployed, absent from scan"}
    ],
    regOpts: [["live","Live — seen in evidence"],["stale","Stale — record outlived the asset"],["mismatch","Mismatch — record contradicts evidence"]],
    regAns: {r1:"live", r2:"stale", r3:"live", r4:"live", r5:"live", r6:"stale", r7:"live", r8:"live", r9:"mismatch", r10:"stale"},
    receipts: [
      {t:"PO-8841 · 12 laptops · Corvane IT store", d:"Received & signed yesterday at the receiving dock. Serials include asset CRV-LT-1712 / UNK-NEW-7712. CMDB sync runs Friday."},
      {t:"PO-8812 · 2 MFD printers", d:"Received 3 weeks ago; both registered (CRV-MFD-R2, CRV-MFD-R3)."},
      {t:"PO-8801 · NAS head unit", d:"Ordered 2 months ago; vendor backlog; not received — explains why CRV-NAS-ARCH has no replacement yet."}
    ]
  },
  dataInv: {
    policy: "Policy card (Corvane Data Governance): (R1) any dataset containing claimant PII → Confidential. (R2) payment/credential stores → Restricted. (R3) retention schedules: claims 7 yrs, accounting/payment 8 yrs, marketing 3 yrs, contracts 10 yrs. (R4) an active legal hold overrides every schedule. (R5) the owner is the accountable executive of the department that produces the data — the custodian is always IT Operations.",
    owners: [["claimsdir","Claims Director"],["financedir","Finance Director (CFO)"],["counsel","General Counsel"],["marketingdir","Marketing Director"],["vendormgmt","Vendor Management Director"],["itops","IT Operations Manager"]],
    classes: [["public","Public"],["internal","Internal"],["confidential","Confidential"],["restricted","Restricted"]],
    rets: [["7y","7 years"],["8y","8 years"],["3y","3 years"],["10y","10 years"],["hold","Legal hold — do not destroy"]],
    assets: [
      {id:"dd1", t:"claims-export-2023.csv", d:"Nightly export; 412,000 claimant records (PII). Produced by Claims.", o:"claimsdir", c:"confidential", r:"7y"},
      {id:"dd2", t:"payment-records-vault", d:"Card payment records & reconciliation (PCI scope). Produced by Finance.", o:"financedir", c:"restricted", r:"8y"},
      {id:"dd3", t:"brand-kit-2026.zip", d:"Public logos & press boilerplate. Produced by Marketing.", o:"marketingdir", c:"public", r:"3y"},
      {id:"dd4", t:"litigation-corpus-2026", d:"Documents under active subpoena. Produced by Legal.", o:"counsel", c:"confidential", r:"hold"},
      {id:"dd5", t:"msp-contracts-signed.pdf", d:"Managed-service-provider contracts. Produced by Vendor Management.", o:"vendormgmt", c:"internal", r:"10y"}
    ]
  },
  lic: {
    titles: [
      {id:"t1", t:"Numera Analytics", model:"Per-seat", ent:500, inst:612, status:"over"},
      {id:"t2", t:"Chartwright CAD", model:"Per-seat", ent:250, inst:0, status:"unused"},
      {id:"t3", t:"CorvNote Suite", model:"Volume", ent:300, inst:299, status:"ok"}
    ],
    statusOpts: [["ok","Compliant"],["over","Over-deployed (installs > entitlements)"],["unused","Unused (entitlements, no installs)"]],
    actionOpts: [["buy","Buy licenses or reduce installs to entitlements"],["reclaim","Reclaim licenses & budget at renewal"],["monitor","Monitor only — within entitlements"]],
    actions: {t1:"buy", t2:"reclaim", t3:"monitor"},
    sbomQ: "CVE-2026-1187 published today for library <code>libziplog 2.3</code>. SBOM says: ActuaryDesk (our build — embeds libziplog directly); ClaimsPortal (our build — pulls it transitively via pdf-tools); Relate360 (vendor SaaS — vendor attests it does not use libziplog).",
    sbomOpts: [["p1","ActuaryDesk"],["p2","ClaimsPortal"],["p3","Relate360"]]
  },
  rogue: {
    feed: [
      {id:"f1", t:"NAC alert — unknown MAC DC:65:3F:11:07:AA associated on LOBBY-SW port 12 (port has no 802.1x enforcement)"},
      {id:"f2", t:"EDR — laptop TEMP-PENT-01 seen on lab VLAN (authorized red-team device, ticket EX-2026-114)"},
      {id:"f3", t:"EDR — CRV-LT-0410 checked in (new-hire laptop, registered yesterday)"},
      {id:"f4", t:"Patch report — CRV-APP-07 silent for 90+ days"},
      {id:"f5", t:"Switch telemetry — host on LOBBY-SW port 12 began ARP-probing internal ranges"},
      {id:"f6", t:"Badge access — J. Alvarez, lobby, 08:52 (active employee)"},
      {id:"f7", t:"Backup job succeeded for CRV-SRV-FILE03"},
      {id:"f8", t:"DHCP — CRV-LT-0092 renewed lease on the new 10.20.8.0/24 scope"},
      {id:"f9", t:"Notice — maintenance window Saturday 22:00–02:00"},
      {id:"f10", t:"EDR discovery — host with MAC DC:65:3F:11:07:AA responded to a discovery probe; no CMDB record"},
      {id:"f11", t:"License renewal reminder — M365 tenant"},
      {id:"f12", t:"Egress — new SaaS 'FinSpark' seen receiving uploads (shadow-IT case, already ticketed)"}
    ],
    q: [
      {id:"device", q:"Which entity is the unmanaged device?", opts:[["h1","Laptop TEMP-PENT-01 (pentest ticket)"],["rogue1","Unknown device DC:65:3F:11:07:AA"],["h2","Laptop CRV-LT-0410 (pre-registered)"],["n1","SaaS FinSpark"]], ans:"rogue1"},
      {id:"entry", q:"What was its entry point?", opts:[["wifi","The building guest Wi-Fi network"],["usb","A USB port on a workstation"],["lobby","Lobby switch port 12 (no 802.1x)"],["vpn","The remote-access VPN gateway"]], ans:"lobby"},
      {id:"contain", q:"Immediate containment?", opts:[["switch","Power off the whole lobby switch"],["nac","Quarantine the port via NAC (M1035)"],["wipe","Wipe every unknown laptop fleet-wide"],["dns","Block DNS for the subnet"]], ans:"nac"},
      {id:"follow", q:"Follow-up after containment?", opts:[["ignore","Ignore it; it will time out"],["reimage","Reimage the entire estate"],["wait","Wait for the next annual audit cycle"],["reg","Investigate, then register or remove"]], ans:"reg"}
    ]
  },
  risk: {
    brief: "Underwriting needs CRV-UW-07 — an end-of-support claims server — for one more quarter until its replacement ships. It holds Confidential claimant data. Fill the risk register so the exception is handled formally.",
    stmtOpts: [["x1","Aging server — replace it after the busy season and run it as-is in the meantime"],["ok","EOS server: no patches until quarter-end; vulnerabilities accrue on Confidential data"],["x2","Claims processing may slow down until the replacement arrives"]],
    respOpts: [["accept","Accept the risk formally, no controls"],["transfer","Transfer — buy more cyber insurance"],["mitigate","Mitigate with compensating controls"],["avoid","Avoid — stop using it tonight"]],
    ownerOpts: [["itops","IT Operations Manager (custodian)"],["claimsdir","Claims Director (data owner)"],["facilities","Facilities Lead"],["vendor","The server vendor"]],
    ctlOpts: [["x3","Rename the server so scanners miss it"],["seg","Network segmentation away from the estate"],["inbound","Restrict inbound to only the required service"],["x4","Install a second antivirus and move on"],["mon","Enhanced monitoring & logging on the host"],["exc","Formal exception approval with a review date"]],
    reviewOpts: [["x5","In five years at the next refresh"],["x6","Never — it is a one-time exception"],["qend","End of quarter — replacement date"]]
  },
  ctrl: {
    gaps: [
      {id:"cg1", t:"Unknown devices join the LAN without challenge"},
      {id:"cg2", t:"Users install unapproved software freely"},
      {id:"cg3", t:"Unapproved USB/hardware appears on desks"},
      {id:"cg4", t:"EOL/EOS servers keep serving because nothing forces replacement"},
      {id:"cg5", t:"The inventory is a spreadsheet updated annually"}
    ],
    controls: [
      {id:"m1035", t:"M1035 — NAC via 802.1x / device certificates (Limit Access to Resource Over Network)"},
      {id:"m1033", t:"M1033 — application allow-listing (Limit Software Installation)"},
      {id:"m1034", t:"M1034 — USB/port & device restrictions (Limit Hardware Installation)"},
      {id:"m1051", t:"M1051 — update/replacement program (Update Software)"},
      {id:"cmdb", t:"Automated enumeration + CMDB reconciliation"}
    ],
    mapAns: {cg1:"m1035", cg2:"m1033", cg3:"m1034", cg4:"m1051", cg5:"cmdb"},
    phases: [
      {id:"p1", t:"Enumerate & reconcile — make the records honest"},
      {id:"p2", t:"Enforce network access — NAC so unknown devices are contained"},
      {id:"p3", t:"Restrict software & hardware — allow-lists, port policy"},
      {id:"p4", t:"Monitor, review & audit — quarterly reconciliation and exception reviews"}
    ]
  },
  pm: {
    brief: "Postmortem — last month someone plugged a Raspberry Pi into a conference-room port; it scanned the estate and the claims export was found syncing to a personal cloud drive. Both map to real MITRE entities. Write the record.",
    techOpts: [["t1200","T1200 — Hardware Additions (Initial Access)"],["t1567","T1567.002 — Exfiltration to Cloud Storage"],["t1052","T1052 — Exfiltration Over Physical Medium"]],
    stageOpts: [["plan","Planning & scoping"],["acquire","Acquisition & procurement"],["assign","Assignment & accounting"],["monitor","Monitoring & asset tracking"],["dispose","Disposal & decommissioning"]],
    roleOpts: [["owner","Data owner — Claims Director"],["cust","Custodian — IT Operations"],["none","Nobody — that's the point of the finding"]],
    ctlOpts: [["allow","Application allow-listing (M1033)"],["nac","NAC/802.1x with device certificates"],["paper","A stricter paper and printing policy"],["cmdb","CMDB reconciliation & alerting"]],
    techAns:"t1200", stageAns:"monitor", roleAns:"owner", ctlAns:["nac","cmdb"]
  },
  bay4: {
    seq: [
      {id:"h1", t:"Confirm data migration & owner sign-off"},
      {id:"h2", t:"Delete the VM snapshots on the SAN"},
      {id:"h3", t:"Release the orphaned cloud volume"},
      {id:"h4", t:"Revoke service accounts, API keys & licenses"},
      {id:"h5", t:"Remove the stale DNS record"},
      {id:"h6", t:"Cryptographically erase the SSD cache"},
      {id:"h7", t:"Physically destroy the HDD array"},
      {id:"h8", t:"Obtain certificate of destruction & update the CMDB"}
    ],
    methods: [
      {id:"c1", t:"HDD array — Restricted claims PII", ans:"destroy"},
      {id:"c2", t:"SSD cache — Internal data", ans:"crypto"},
      {id:"c3", t:"LTO tapes — Confidential", ans:"degauss"}
    ],
    evOpts: [
      {id:"v4", t:"Quick-format screenshot", good:false},
      {id:"v1", t:"Signed certificate: what / how / when / witnessed", good:true},
      {id:"v3", t:"Updated CMDB disposal entry", good:true},
      {id:"v2", t:"Chain-of-custody handover record", good:true},
      {id:"v5", t:"Vendor email: “verbal assurance”", good:false}
    ],
    gapOpts: [
      {id:"gg5", t:"Rack slot label in the DC layout", good:false},
      {id:"gg1", t:"VM snapshots on the SAN", good:true},
      {id:"gg6", t:"Cleaning crew rotation", good:false},
      {id:"gg3", t:"Stale DNS record", good:true},
      {id:"gg2", t:"Orphaned cloud volume", good:true},
      {id:"gg4", t:"svc_backup account & API key", good:true}
    ]
  }
};

const eqArr = (a,b)=>Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.every((v,i)=>a[i]===b[i]);
const eqMap = (a,b)=>{const A=Object.keys(a),B=Object.keys(b);return A.length===B.length&&A.every(k=>a[k]===b[k]);};
const P={P1:"Understand",P2:"Recognize / Analyze",P3:"Detect",P4:"Mitigate"};

const OBJS = [
  {id:"M1",mode:"M",pillar:"P1",desk:"knowledge",title:"Order the five lifecycle stages",
   desc:"In the Knowledge Core, click the shuffled stage chips into the official order (top = first stage).",
   hints:["The first stage happens before anything is bought — and the last is where certificates of destruction live.",
          "Think chronologically: requirements → buying → records & roles → watching → retiring.",
          "Order: Planning & scoping → Acquisition & procurement → Assignment & accounting → Monitoring & asset tracking → Disposal & decommissioning."],
   pass:"Exactly the official five-stage lifecycle from SY0-801 4.2. Everything else in this lab sits on one of these stages — when an incident happens, asking 'which stage failed?' is the diagnostic.",
   validate:s=>{const ok=eqArr(s.env.lifecycle,STAGE_ORDER);return{ok,msg:ok?"":"That's not the official order — stages where security is cheapest come first, destruction comes last."};}},
  {id:"M2",mode:"M",pillar:"P3",desk:"registry",title:"Reconcile the scan against the registry",
   desc:"On the Registry Desk: mark every discovered device Known or Rogue, and every registry record Live or Stale. The scan found 9 devices; the registry holds 9 records — they don't agree.",
   hints:["Compare the MAC addresses and hostnames both ways: what the scan sees that the registry doesn't, and what the registry claims that the scan never saw.",
          "Two devices have no matching record (blank hostnames), and two records have no matching device in the scan.",
          "Rogue: DC:65:3F:11:07:AA and F2:1A:B4:07:55:10. Stale: CRV-NAS-ARCH and CRV-SRV-FILE01."],
   pass:"This is change detection — the heart of monitoring & tracking. A scan you never diff against the registry is just a spreadsheet. Each rogue device is an unmanaged entry point; each stale record is an asset that left without proper decommissioning.",
   validate:s=>{const e=s.env.reconM,d=eqMap(e.dev,ENV_M.recon.devAns),r=eqMap(e.reg,ENV_M.recon.regAns);
     if(d&&r)return{ok:true,msg:""};let n=0;for(const k in ENV_M.recon.devAns)if(e.dev[k]!==ENV_M.recon.devAns[k])n++;for(const k in ENV_M.recon.regAns)if(e.reg[k]!==ENV_M.recon.regAns[k])n++;
     return{ok:false,msg:`${n} of 18 decisions are incorrect. Check both directions: scan→registry (rogues) and registry→scan (stales).`};}},
  {id:"M3",mode:"M",pillar:"P2",desk:"planning",title:"Pick the planning & scoping inputs",
   desc:"On the Planning Desk: the 40-laptop request is being drafted. Select every input that belongs in it (6 of 9).",
   hints:["Security requirements are cheapest BEFORE the PO exists: think data, support lifetime, patching, ownership, disposal, features.",
          "Anything that only matters after arrival — or never matters — is a distractor.",
          "Required: support/EOL window, data classification, management & patching, owner & custodian, disposal plan, security features."],
   pass:"Planning & scoping is where asset management earns its money: support windows prevent future EOL surprises, the disposal plan prevents the 'quick format' tragedy, and the named owner prevents orphaned assets.",
   validate:s=>{const ok=eqArr([...s.env.planSel].sort(),[...ENV_M.plan.required].sort());return{ok,msg:ok?"":"Some selections don't belong (or required ones are missing): every correct item is something security must decide before purchase."};}},
  {id:"M4",mode:"M",pillar:"P2",desk:"planning",title:"Make the three procurement calls",
   desc:"Three acquisition scenarios on the Planning Desk — choose the compliant decision for each.",
   hints:["Provenance: can the origin of the hardware be traced through authorized channels?",
          "A vendor security assessment must complete before commitment — 'self-certify' is not an assessment.",
          "Assets are tagged, owned and logged the DAY they arrive, before deployment."],
   pass:"Acquisition & procurement is where supply-chain risk is filtered: authorized channels + completed vendor assessment + logging on arrival. The too-good reseller deal is how counterfeit and tampered hardware (and backdoors) walk in.",
   validate:s=>{const e=s.env.proc,ans={s1:"opt0",s2:"opt1",s3:"opt2"};let bad=[];for(const k in ans)if(e[k]!==ans[k])bad.push(k.toUpperCase());
     return{ok:bad.length===0,msg:bad.length?`Incorrect: ${bad.join(", ")}. Re-read each scenario for provenance, assessment status, and arrival procedure.`:""};}},
  {id:"M5",mode:"M",pillar:"P1",desk:"registry",title:"Assign owners & custodians",
   desc:"On the Registry Desk (Assignment & accounting): assign Owner or Custodian for the four actions, then classify the two assets.",
   hints:["Who DECIDES vs. who IMPLEMENTS. Approvals and access decisions belong to the accountable executive.",
          "Backups, retention configuration and array maintenance are daily upkeep — custodian work.",
          "Decisions = Owner; upkeep = Custodian. Claimant PII is Confidential; a public brochure is Public."],
   pass:"Assignment & accounting in one move: ownership is a role (accountable executive), custodianship is implementation. When an incident hits a data asset, the owner answers for it — and the classification drives every handling rule.",
   validate:s=>{const e=s.env,ans={r1:"owner",r2:"custodian",r3:"owner",r4:"custodian"};let bad=[];
     for(const k in ans)if(e.roles[k]!==ans[k])bad.push(k.toUpperCase());
     if(e.clsM.c1!=="confidential")bad.push("C1");if(e.clsM.c2!=="public")bad.push("C2");
     return{ok:bad.length===0,msg:bad.length?`Incorrect: ${bad.join(", ")}. Decision vs. implementation — and check the sensitivity of the content.`:""};}},
  {id:"M6",mode:"M",pillar:"P3",desk:"monitoring",title:"Spot the unmanaged-asset alerts",
   desc:"On the Monitoring Feed: select the 3 alerts that indicate an unmanaged asset; leave the routine noise.",
   hints:["Unmanaged = something exists that no record accounts for, or an asset that stopped being managed.",
          "One alert is a brand-new unknown MAC; one is a device with no CMDB record; one is a silent system.",
          "Select a1, a2 and a3 — everything else is normal operations."],
   pass:"Change detection done right: new devices, silent assets, unapproved installs. A 90-day patch silence is treated as a high-value signal precisely because it usually means the asset left management — attacker or neglect, the risk is identical.",
   validate:s=>{const ok=eqArr([...s.env.alertsSel].sort(),["a1","a2","a3"].sort());return{ok,msg:ok?"":"Noise distracts: maintenance windows, renewals and successful jobs are healthy. Hunt the unaccounted and the silent."};}},
  {id:"M7",mode:"M",pillar:"P2",desk:"monitoring",title:"Flag the shadow IT",
   desc:"Six discovered services on the Monitoring Feed — flag every unsanctioned one (evidence: egress + expense records).",
   hints:["Sanctioned services sit in the SaaS catalog with owners and data-processing agreements.",
          "Follow the evidence: bought on an expense card? data leaving to a personal account? an external contractor's private storage?",
          "Unsanctioned: FinSpark, personal Dropbox, contractor's personal Google Drive."],
   pass:"Shadow IT is inventory that grew without approval — and it maps to real attacker infrastructure: T1567.002 Exfiltration to Cloud Storage (Akira used Rclone; APT41 DUST used OneDrive). Egress + expense records are how defenders see it.",
   validate:s=>{const ok=eqArr([...s.env.shadowSel].sort(),["s1","s4","s5"].sort());return{ok,msg:ok?"":"Approved services have catalog entries and agreements. The rest — however convenient — are unsanctioned."};}},
  {id:"M8",mode:"M",pillar:"P4",desk:"bay",title:"Choose sanitization methods",
   desc:"Decommission Bay: six retiring assets. Assign each the correct disposal method — the media type and classification decide.",
   hints:["Magnetic media answers to wipe or degauss; SSDs and flash laugh at magnets.",
          "Highest-sensitivity media leaves as fragments — shred or incinerate. The MFD's internal drive counts as high-sensitivity: it holds claimant PII.",
          "HDD-Restricted → destroy. SSD → crypto-erase. Tapes → degauss. Encrypted USB → crypto-erase. MFD drive → destroy. Public-data HDD → wipe & reuse. Quick format is never the answer."],
   pass:"Disposal is where data outlives hardware. Wear levelling makes overwriting unreliable on SSDs; degaussing is inert on them; quick format recovers with tools. Sensitivity decides the level: Restricted/PII media is destroyed, public media can be wiped and reused.",
   validate:s=>{const e=s.env.methodsM,ans={m1:"destroy",m2:"crypto",m3:"degauss",m4:"crypto",m5:"destroy",m6:"wipe"};let bad=[];
     for(const k in ans)if(e[k]!==ans[k])bad.push(k.toUpperCase());
     return{ok:bad.length===0,msg:bad.length?`Incorrect: ${bad.join(", ")}. Match method to media physics AND data sensitivity.`:""};}},
  {id:"M9",mode:"M",pillar:"P4",desk:"bay",title:"Find the decommissioning leftovers",
   desc:"FILE01 was powered off and rack-removed last quarter. On the Decommission Bay, select every unresolved exposure its 'retirement' left behind (5 of 7).",
   hints:["Retirement is not the machine alone: think copies (snapshots, volumes), identity (accounts, keys), names (DNS), and commercial ties (licenses).",
          "If it still exists, still resolves, still authenticates, or still costs money — it's a leftover.",
          "Select: VM snapshot, orphaned cloud volume, stale DNS, service account & API key, uncalled licenses."],
   pass:"The exam's favorite decommissioning scenario: powered-off servers with live accounts, VM snapshots, orphaned cloud volumes, stale DNS (subdomain takeover!) and live service accounts with API keys. The machine died; its privileges didn't.",
   validate:s=>{const ok=eqArr([...s.env.gapsSel].sort(),["g1","g2","g3","g4","g5"].sort());return{ok,msg:ok?"":"Leftovers are the quiet half of decommissioning. A rack label and a cleaning schedule never held credentials."};}},
  {id:"M10",mode:"M",pillar:"P4",desk:"bay",title:"Sequence the decommissioning",
   desc:"Order the six steps of a clean decommissioning (click into the right-hand column, top = first).",
   hints:["First make sure nothing is lost (migration + owner sign-off); last make the records tell the truth.",
          "Revoke access and licenses BEFORE destroying media, so nothing authenticates mid-destruction.",
          "Order: migration & sign-off → revoke credentials/licenses → sanitize → destroy → certificate → update inventory, DNS & docs."],
   pass:"A sequence that a real incident responder would bless: protect the data, cut the access, erase, destroy, certify, and only then rewrite the records. Skipping the certificate or the inventory update is how FILE01-style ghosts are born.",
   validate:s=>{const ok=eqArr(s.env.seqM,["q1","q2","q3","q4","q5","q6"]);return{ok,msg:ok?"":"Think: data safety first, credentials cut before media dies, certificate before the paperwork closes."};}},
  {id:"M11",mode:"M",pillar:"P1",desk:"bay",title:"Judge the destruction evidence",
   desc:"Two selections on the Decommission Bay: (1) the four required elements of a valid certificate of destruction; (2) which of the five evidence specimens are insufficient.",
   hints:["A certificate must let an auditor reconstruct the event without asking anyone.",
          "What / how / when / witnessed. A phone call and a screenshot of a format dialog are not evidence.",
          "Required: what, how, when, witnessed. Insufficient: quick-format screenshot, vendor's verbal assurance."],
   pass:"'Insufficient: file deletion, quick format, or vendor verbal assurance.' The certificate's four fields — what, how, when, witnessed by whom — are the difference between an auditable disposal and a lawsuit-shaped gap.",
   validate:s=>{const e=s.env,a=eqArr([...e.certReq].sort(),["w1","w2","w3","w4"].sort()),b=eqArr([...e.certIns].sort(),["e1","e2"].sort());
     return{ok:a&&b,msg:a?"":"(1) pick exactly what/how/when/witnessed — and (2) mark the screenshot and the phone call as insufficient evidence."};}},
  {id:"M12",mode:"M",pillar:"P4",desk:"bay",title:"Apply retention vs. legal hold",
   desc:"Five archived batches on the Decommission Bay: decide Destroy now / Retain (schedule not met) / Destroy when the hold lifts.",
   hints:["Compare age against schedule. An expired schedule with no hold means destroy.",
          "One batch is under active litigation — law beats schedule, always.",
          "b1 destroy, b2 retain, b3 destroy, b4 hold, b5 destroy."],
   pass:"Retention is asset management for data: keep only as long as needed or the law requires. Over-retention widens every breach; early destruction invites regulators; and legal hold overrides the schedule entirely.",
   validate:s=>{const e=s.env.retM,ans={b1:"destroy",b2:"retain",b3:"destroy",b4:"hold",b5:"destroy"};let bad=[];
     for(const k in ans)if(e[k]!==ans[k])bad.push(k.toUpperCase());
     return{ok:bad.length===0,msg:bad.length?`Incorrect: ${bad.join(", ")}. Age vs. schedule decides; the litigation batch answers to the hold, not the schedule.`:""};}},
  /* ---------- HARD ---------- */
  {id:"H1",mode:"H",pillar:"P2",desk:"registry",title:"Produce the full reconciliation report",
   desc:"Classify all 12 discovered devices (Known / Rogue / Pending intake / Legitimate IP-MAC change) and all 10 registry rows (Live / Stale / Mismatch). Use the scan, EDR and the receiving reports. Two devices will tempt you into false findings.",
   hints:["Read the receiving reports before calling anything rogue: a signed delivery explains an unregistered device.",
          "MAC addresses are identity; IPs are leases. A changed IP on a matching MAC is a DHCP story, not a finding.",
          "Answers — devices: d1,k d2,k d3,k d4,R d5,IP-change d6,k d7,R d8,k d9,k d10,P d11,k d12,k. Registry: r1,r3,r4,r5,r7,r8,r11 live; r2,r6,r10 stale; r9 mismatch."],
   pass:"A full reconciliation across three evidence sources — this is the daily work of inventory honesty. The traps: a DHCP scope change (identity = MAC, not IP) and a device that is legitimate because procurement holds a signed receipt. Every remaining rogue and stale is a real finding.",
   validate:s=>{const e=s.env.reconH,d=eqMap(e.dev,ENV_H.recon.devAns),r=eqMap(e.reg,ENV_H.recon.regAns);
     if(d&&r)return{ok:true,msg:""};let n=0;for(const k in ENV_H.recon.devAns)if(e.dev[k]!==ENV_H.recon.devAns[k])n++;for(const k in ENV_H.recon.regAns)if(e.reg[k]!==ENV_H.recon.regAns[k])n++;
     return{ok:false,msg:`${n} of 22 classifications are incorrect. Check the receiving reports and ask 'identity or lease?' for every IP/MAC oddity.`};}},
  {id:"H2",mode:"H",pillar:"P2",desk:"registry",title:"Complete the data inventory",
   desc:"Five data assets: assign owner, classification and retention for each, applying the policy card's five rules — two items are genuinely ambiguous until you apply them.",
   hints:["R1 and R2 set classification; R3 sets schedules; R4 beats R3; R5 points ownership at the producing department's executive.",
          "The subpoenaed corpus answers to the hold, not to any schedule. Payment records are PCI → Restricted, on the accounting/payment schedule.",
          "Claims export: Claims Director / Confidential / 7y. Payments: Finance Director / Restricted / 8y. Brand kit: Marketing / Public / 3y. Litigation corpus: General Counsel / Confidential / hold. MSP contracts: Vendor Mgmt / Internal / 10y."],
   pass:"Assignment & accounting for data: owner (accountable executive), classification (drives handling), retention (drives destruction). The policy card is the tiebreaker the exam expects you to apply, not memorize.",
   validate:s=>{const e=s.env.dataInvH,ans={};ENV_H.dataInv.assets.forEach(a=>ans[a.id]=[a.o,a.c,a.r]);let bad=[];
     for(const k in ans){const v=e[k]||{};if(v.o!==ans[k][0]||v.c!==ans[k][1]||v.r!==ans[k][2])bad.push(k.toUpperCase());}
     return{ok:bad.length===0,msg:bad.length?`Incorrect: ${bad.join(", ")}. Re-read rules R1–R5 and apply them, don't guess.`:""};}},
  {id:"H3",mode:"H",pillar:"P2",desk:"registry",title:"Compute license positions & the SBOM call",
   desc:"Software Ledger: for each of the three titles set the compliance status AND the required action (compare entitlements vs. discovered installs). Then use the SBOM to select which internal products are affected by the libziplog CVE.",
   hints:["Position = entitlements minus installs. Positive with installs missing = waste; negative = violation.",
          "A vendor SaaS with a written attestation answers the SBOM question differently than your own builds.",
          "Numera: over-deployed → buy/reduce. Chartwright: unused → reclaim. CorvNote: compliant → monitor. Affected: ActuaryDesk + ClaimsPortal."],
   pass:"License compliance is software asset management's audit face, and the SBOM is why software inventory tracks dependencies: 'are we affected?' answered in minutes, with a vendor attestation separating SaaS from your own builds.",
   validate:s=>{const e=s.env.licH,A=s.env.licAct,okS=eqMap(e,{t1:"over",t2:"unused",t3:"ok"}),okA=eqMap(A,ENV_H.lic.actions);
     return{ok:okS&&okA&&eqArr([...s.env.sbomH].sort(),["p1","p2"].sort()),msg:(okS&&okA)?"":"Status compares entitlements to installs; actions follow status (over→buy/reduce installs, unused→reclaim, ok→monitor). Affected products: follow the SBOM, not the vendor's marketing."};}},
  {id:"H4",mode:"H",pillar:"P4",desk:"bay",title:"Build FILE01's decommissioning plan",
   desc:"Four sub-parts, all must be exact: (a) order the 8 steps; (b) disposal method per component; (c) select the 3 valid evidence artifacts; (d) select the 4 leftover exposures the plan must close.",
   hints:["(a) Kill accessible copies and access first, then network remnants, then media, then certify.",
          "(b) Physics: magnets work on magnetic media only; SSDs take crypto-erase; Restricted data ends as fragments.",
          "(b): HDD→destroy, SSD→crypto-erase, tapes→degauss. (c): certificate + custody + CMDB entry. (d): snapshots, volume, DNS, service account & key."],
   pass:"A decommissioning plan that closes every gap from the dossier: data, copies, identity, names, media, evidence, records. If you ordered revocation before destruction and demanded the certificate before closing the ticket, you planned like an auditor.",
   validate:s=>{const e=s.env.h4,parts={
     a:eqArr(e.seq,["h1","h2","h3","h4","h5","h6","h7","h8"]),
     b:eqMap(e.methods,{c1:"destroy",c2:"crypto",c3:"degauss"}),
     c:eqArr([...e.ev].sort(),["v1","v2","v3"].sort()),
     d:eqArr([...e.gaps].sort(),["gg1","gg2","gg3","gg4"].sort())};
     const ok=parts.a&&parts.b&&parts.c&&parts.d;
     const which=Object.entries(parts).filter(([k,v])=>!v).map(([k])=>({a:"ordering",b:"methods",c:"evidence",d:"leftovers"}[k]));
     return{ok,msg:ok?"":`Incorrect parts: ${which.join(", ")||"none"}. Sub-check each part on the desk.`};}},
  {id:"H5",mode:"H",pillar:"P3",desk:"monitoring",title:"Hunt the unmanaged device",
   desc:"The Monitoring Feed holds 12 events with red herrings. Identify: the unmanaged device, its entry point, the immediate containment, and the correct follow-up.",
   hints:["Two 'unknown-looking' devices are actually authorized: one has a pentest ticket, one a registration. Cross-reference MACs across events.",
          "The entry point is where the MAC first associated — and where enforcement was missing.",
          "Device: DC:65:3F:11:07:AA. Entry: LOBBY-SW port 12 (no 802.1x). Containment: quarantine that port via NAC. Follow-up: investigate → register or remove + hardware sweep (T1200)."],
   pass:"A T1200 Hardware Additions scenario in the wild — DarkVishnya (G0105) physically connected Bash Bunnies and Raspberry Pis exactly like this. Surgical containment (quarantine the port, cf. M1035) preserves business and evidence; the sweep finds whether it was a Pi or a printer.",
   validate:s=>{const e=s.env.rogueH,ok=e.device==="rogue1"&&e.entry==="lobby"&&e.contain==="nac"&&e.follow==="reg";
     return{ok,msg:ok?"":"Cross-reference the MAC across events; containment should be surgical (one port, not the switch); and follow-up ends with an inventory decision, not a shrug."};}},
  {id:"H6",mode:"H",pillar:"P4",desk:"bay",title:"Fill the risk register",
   desc:"CRV-UW-07 (EOS, Confidential data, one more quarter): choose the risk statement, the formal response, the accountable owner, ALL the correct compensating controls (none of the fake ones), and the review point.",
   hints:["The response must reduce likelihood/impact while the server keeps running — acceptance is for tolerated, not unpatchable-and-reachable.",
          "The data owner — the Claims Director — owns this risk; the custodian implements controls.",
          "Statement: the EOS/no-patch one. Response: mitigate. Owner: Claims Director. Controls: segmentation, inbound restriction, monitoring, signed exception. Review: quarter-end."],
   pass:"Formal risk handling: a specific statement, a defensible response (mitigate with compensating controls), the accountable owner, controls that actually bind the exposure, and a dated review. Anything less is an undocumented acceptance — the exam and the auditor both reject it.",
   validate:s=>{const e=s.env.riskH,ok=e.stmt==="ok"&&e.resp==="mitigate"&&e.owner==="claimsdir"&&e.review==="qend"&&eqArr([...(e.ctl||[])].sort(),["seg","inbound","mon","exc"].sort());
     return{ok,msg:ok?"":"Statement must be specific; mitigation with all four compensating controls; owner = data owner; review = replacement date. Renaming servers and doubling antivirus are not controls."};}},
  {id:"H7",mode:"H",pillar:"P4",desk:"planning",title:"Map gaps to controls & sequence the rollout",
   desc:"Five audit gaps from the report: assign each the correct control (with its official MITRE ID where one exists), then order the four rollout phases.",
   hints:["One gap is 'the inventory itself is broken' — that one takes the automation control, not an ATT&CK mitigation.",
          "Match by mechanism: network access, software installation, hardware installation, software currency, records.",
          "cg1→M1035, cg2→M1033, cg3→M1034, cg4→M1051, cg5→CMDB automation. Phases: enumerate → NAC → restrict SW/HW → monitor & review."],
   pass:"Control selection with official IDs: M1035 for network access, M1033 for software, M1034 for hardware, M1051 for currency — plus the foundation control, automated enumeration with reconciliation. Rollout matters: you enforce against what you can first SEE, then keep it honest.",
   validate:s=>{const e=s.env.ctrlH,ok=eqMap(e.map,ENV_H.ctrl.mapAns)&&eqArr(e.phases,["p1","p2","p3","p4"]);
     return{ok,msg:ok?"":"Match the mechanism of each gap to the control — and enumerate before enforcing: NAC against an honest inventory, not against a spreadsheet."};}},
  {id:"H8",mode:"H",pillar:"P1",desk:"monitoring",title:"Write the postmortem record",
   desc:"The Raspberry-Pi incident: name the entry TECHNIQUE, the lifecycle STAGE that failed, the accountable ROLE for the claims data, and the TWO controls that would have caught it.",
   hints:["The Pi was physically introduced — there is an ATT&CK technique for exactly that.",
          "Which stage should have produced a record and an alert for that device?",
          "T1200; Monitoring & asset tracking failed; the data owner (Claims Director) answers; NAC/802.1x + CMDB reconciliation would have caught it."],
   pass:"The full loop: attacker technique (T1200 — as DarkVishnya did), failed lifecycle stage (monitoring & tracking), accountability (the data owner), and the two controls that close the gap. If you can write this record, you can explain 4.2 to an auditor.",
   validate:s=>{const e=s.env.pmH,ok=e.tech==="t1200"&&e.stage==="monitor"&&e.role==="owner"&&eqArr([...(e.ctl||[])].sort(),["nac","cmdb"].sort());
     return{ok,msg:ok?"":"Physical introduction has its own technique (T1200); records and alerts for devices are the monitoring stage's job; accountability for claims data sits with its owner; and NAC + reconciliation are the catch."};}}
];

/* Desk registry shown in the left rail (id, label) */
const DESKS=[["briefing","Briefing"],["knowledge","Knowledge Core"],["planning","Planning Desk"],["registry","Registry Desk"],["monitoring","Monitoring Feed"],["bay","Decommission Bay"],["quiz","Knowledge Check"],["debrief","Debrief"]];

/* Human-readable desk names used by the completion report's focus areas */
const DESK_NAMES={knowledge:"Knowledge Core",planning:"Planning Desk",registry:"Registry Desk",monitoring:"Monitoring Feed",bay:"Decommission Bay"};
