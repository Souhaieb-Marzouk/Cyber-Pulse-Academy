/* ============================================================
   Larkspur Logistics — INC-2026-0117 · Incident Response Lab
   CompTIA Security+ SY0-801 · Lesson 4.7 (training exercise)
   File: js/data-core.js
   Lab content: lifecycle phases, backbone, glossary, all evidence artifacts.
   Content extracted 1:1 from the audited lab (static port v4).
   ============================================================ */
'use strict';
'use strict';
/* ============ CORE DATA — Larkspur Logistics INC-2026-0117 ============ */
const PHASES=[
 {id:'prep',  n:'Preparation',                    c:'var(--teal)',   t:45,  d:'Plan, people, tooling — proven to work before anything happens.'},
 {id:'ident', n:'Identification',                 c:'var(--cyan)',   t:25,  d:'Detection, advisories, threat hunting: notice and declare.'},
 {id:'invest',n:'Investigation',                  c:'var(--violet)', t:80,  d:'Forensics, custody, preservation: scope it without destroying it.'},
 {id:'contain',n:'Containment',                   c:'var(--amber)',  t:30,  d:'Quarantine & isolation — stop the spread, keep the evidence.'},
 {id:'negot', n:'Negotiation',                    c:'var(--rose)',   t:45,  d:'Extortion is a business decision: stance, sanctions, insurer, LE.'},
 {id:'erad',  n:'Eradication & recovery',         c:'var(--green)',  t:160, d:'Remove the cause, rebuild known-good, restore, verify.'},
 {id:'notif', n:'Notification & external reporting',c:'var(--sky)',  t:35,  d:'Stakeholders, customers, law enforcement, mandatory reporting.'},
 {id:'post',  n:'Post-incident',                  c:'var(--slate)',  t:120, d:'Lessons learned, root cause, PIR — and controls that change.'}
];
const BACKBONE=[['Preparation','prep'],['Detection','ident'],['Containment','contain'],['Recovery','erad'],['Lessons learned','post']];

const GLOSSARY=[
 ['EDR (endpoint detection & response)','Agent-based endpoint security that detects, records and can isolate suspicious process activity — the primary endpoint evidence source in this incident.'],
 ['SIEM','Security information and event management: central log collection, correlation and alerting — the alert queue you triage lives here.'],
 ['IOC (indicator of compromise)','An observable artifact tied to malicious activity — an IP, domain, hash or filename — published by CERTs and vendors for threat hunting.'],
 ['C2 (command & control)','The channel attacker-controlled malware uses to receive instructions and exfiltrate data; blocking it cuts the attacker\'s hands off.'],
 ['MFA (multi-factor authentication)','Requiring a second proof beyond the password. Its absence on the shared ap_admin account is what made one stolen password fatal.'],
 ['ASN (autonomous system number)','The network operator behind an IP address; a login from an ASN your organisation never uses is a classic identity-anomaly signal.'],
 ['Playbook','A step-by-step pre-written script for one incident type (e.g. ransomware, compromised mailbox) so responders execute instead of improvising.'],
 ['Tabletop exercise','A discussion-only walkthrough of a scenario around a table — no systems touched. Finds decision gaps: who declares, who can shut down payment, who calls regulators at 2am.'],
 ['Simulation','An injected, realistic event on real tooling (e.g. a simulated phishing wave). Tests execution, not just decisions — and costs more to run.'],
 ['Verification testing','Proving controls work: restoring a backup, triggering EDR isolation, checking the contact list. A control you have never tested is a hope, not a control.'],
 ['Incident lead','The single commander of the response — declares the incident, owns the plan and can commit resources. Needs a named deputy.'],
 ['Preservation','Keeping evidence unchanged: keep systems powered on, do not log in, do not delete. Destroyed memory or tampered files cannot testify.'],
 ['Chain of custody','The documented, continuous, verifiable record of who held evidence, when, and what changed — required for evidence to be usable legally.'],
 ['E-discovery','Identifying, collecting and producing electronically stored information for legal proceedings; drives legal hold and evidence scope.'],
 ['Advisory (internal / external)','A warning about a threat: internal (your own SOC/IT memo) or external (vendor bulletin, national CERT, intel sharing group). Cheap detection — if someone reads it.'],
 ['Threat hunting','Proactively searching your environment for signs of compromise using intel and hypotheses, instead of waiting for an alert.'],
 ['Quarantine & isolation','Containment moves: quarantine = restrict what a host may do; isolation = cut it off (EDR isolate, cable pull, VLAN detach) while keeping it powered on.'],
 ['Eradication','Removing the cause: malware, persistence mechanisms, attacker-created accounts, and the vulnerability used to get in. Must precede restoration.'],
 ['Known-good source','A verified-clean image or backup to rebuild/restore from. Restoring from a compromised or unverified source reintroduces the attacker.'],
 ['Out-of-band channel','A coordination channel the attacker is not reading (separate messaging, phone bridge) — corporate email may be watched during an incident.'],
 ['Mandatory reporting','Legal duty to notify authorities within a set clock. GDPR Art. 33: supervisory authority within 72 hours of becoming aware of a personal-data breach.'],
 ['PIR (post-incident report)','The structured written record: timeline, impact, root cause, and the control changes agreed from lessons learned.'],
 ['Root cause analysis','Finding the underlying failure the attacker exploited (not who clicked) — the only level at which lessons learned can change controls.']
];

const ART={
 edr042:{t:'EDR console — LK-WKS-042 (AP workstation)',b:
`TRAINING DATA — SYNTHETIC · Larkspur EDR · view: LK-WKS-042 (user: f.delacroix, Finance/AP)
────────────────────────────────────────────────────────────────────────
02:41  VPN session opened  account: ap_admin   src 198.51.100.44 (AS64999, unfamiliar)
08:03  process  C:\\Windows\\vssadmin.exe  "delete shadows /all /quiet"
08:04  4,112 file writes in 90s   pattern: *.fennel   dirs: D:\\ap-shared
08:05  outbound 198.51.100.77:443  POST /gate  8.1 MB   cert CN: cdn-static.example
08:06  NEW FILE  D:\\ap-shared\\READ_ME_NOW.txt   (matches ransom note sig FENNELFOX-A)
08:07  [AUTO] host quarantined?  NO — auto-contain policy: disabled
08:20  analyst alert raised (manual)  severity: CRITICAL
────────────────────────────────────────────────────────────────────────
NOTE  LK-WKS-051 shows the same .fennel pattern starting 07:58 (next desk).
Memory preserved?  NO capture taken yet. Host still ON and networked.`},
 siem:{t:'SIEM alert queue — this morning',b:
`TRAINING DATA — SYNTHETIC · Larkspur SIEM · queue Mon 08:20-08:35
────────────────────────────────────────────────────────────────────────
S-101 CRIT  EDR: vssadmin delete shadows /all on LK-WKS-042        08:03
S-102 CRIT  EDR: mass file rename *.fennel on LK-WKS-042          08:04
S-103 HIGH  user report: files renamed, ransom note (f.delacroix) 08:14
S-104 HIGH  VPN login ap_admin 02:40 from AS64999 (geo/ASN anomaly)
S-105 MED   nightly backup job completed with warnings            01:12
S-106 LOW   newsletter: firewall vendor firmware release notes    07:00
S-107 LOW   EDR: Chrome update prompt on LK-WKS-204               07:31
S-108 INFO  internal advisory 2026-101 (10 days old, unread=17 views)
────────────────────────────────────────────────────────────────────────
MSSP night shift note: S-104 auto-escalated 02:55, on-call paged, no ack.`},
 authlog:{t:'VPN & authentication logs',b:
`TRAINING DATA — SYNTHETIC · VPN gateway + domain controller extracts
────────────────────────────────────────────────────────────────────────
02:40:12  VPN auth OK   user ap_admin   src 198.51.100.44  AS64999
          device fingerprint: NEW (no prior session from this ASN/fingerprint)
02:41-03:55  21 SMB reads on \\\\LK-FS-07\\finance  account ap_admin
07:58        same source IP re-connect, moves to LK-WKS-051 (RDP)
08:03        vssadmin + .fennel pattern begins (see EDR)
────────────────────────────────────────────────────────────────────────
ap_admin = shared service account, Accounts-Payable admin, MFA: NOT enrolled.
Last legitimate ap_admin VPN use: 14 days ago, from office range 203.0.113.0/24.`},
 usermail:{t:'User report — email to helpdesk 08:14',b:
`TRAINING DATA — SYNTHETIC · From: f.delacroix@larkspur.example · 08:14 Mon
────────────────────────────────────────────────────────────────────────
My files are turning into ".fennel" things and there is a note on my
desktop that says to pay or they publish our customer database???
I did open an invoice attachment yesterday ("Unpaid freight invoice")
because it looked like the one we were warned about... sorry. Laptop
is still on, I did not turn it off, just called you like the training said.
────────────────────────────────────────────────────────────────────────
[KATIE - helpdesk] confirmed: user did NOT power off. No login attempted.`},
 advint:{t:'Internal advisory 2026-101 (10 days old)',b:
`TRAINING DATA — SYNTHETIC · INTERNAL MEMO · Security team → Finance + AP
────────────────────────────────────────────────────────────────────────
ADVISORY 2026-101 · INTERNAL · sent Mon (10 days ago) · opened by 17 staff
Subject: Phishing wave targeting finance teams
A campaign is sending invoices themed "Unpaid freight invoice" with a
macro-laced attachment to finance addresses across our sector. Do not
open attachments; report via the helpdesk button.
────────────────────────────────────────────────────────────────────────
Delivery tracking: auto-filed by 231 recipients. Forwarded to ap_admin
mailbox: YES (f.delacroix received the same theme last Tuesday).`},
 advvendor:{t:'Vendor bulletin — VPN appliance',b:
`TRAINING DATA — SYNTHETIC · Vendor security bulletin (9 days old)
────────────────────────────────────────────────────────────────────────
PRODUCT: Larkspur edge VPN appliance LK-VPN-01 (firmware 8.4.1)
CVE-2026-31337 (CVSS 9.8) — pre-auth remote code execution on mgmt
interface. ACTIVELY EXPLOITED in the wild per vendor + national CERT.
FIX: firmware 8.4.3 available immediately.
────────────────────────────────────────────────────────────────────────
[Larkspur patch log] Bulletin received → ticket opened (P3, "next
window") → NOT PATCHED. No patch SLA exists for internet-facing gear.`},
 advcert:{t:'National CERT alert — sector ransomware',b:
`TRAINING DATA — SYNTHETIC · National CERT advisory NC-2026-114 (3 days old)
────────────────────────────────────────────────────────────────────────
FENNELFOX extortion campaign targeting freight & logistics firms.
TTP summary: VPN appliance CVE-2026-31337 → service-account abuse
(accounts WITHOUT MFA) → shadow-copy deletion → mass encryption
(.fennel) → double extortion (leak site + negotiation chat).
INDICATORS: 198.51.100.44 / 198.51.100.77 · wallet cluster tagged
"FF-MAIN" — SANCTIONS-FLAGGED by the national sanctions authority.
ACTION: verify exposure this week; report incidents to CERT + police.
────────────────────────────────────────────────────────────────────────
[Larkspur] Advisory was NOT checked against our asset list.`},
 ransom:{t:'Ransom note — READ_ME_NOW.txt',b:
`TRAINING DATA — SYNTHETIC · recovered from D:\\ap-shared (simulated copy)
────────────────────────────────────────────────────────────────────────
!!! YOUR NETWORK IS DOWN !!!           [ FENNELFOX CREW ]
We encrypted your servers and downloaded 2.1 GB: contracts, customer
database, AP records. Pay 6 BTC (~ EUR 180,000) in 36 HOURS or your
data is published on our blog + sold. Chat: q7x-fennel-77@relay.example
You have our word the decryptor works. Trust us. 36 hours from 08:06.
────────────────────────────────────────────────────────────────────────
[forensics note] Note matches FENNELFOX-A template (see CERT NC-2026-114).`},
 chat:{t:'Extortion chat transcript',b:
`TRAINING DATA — SYNTHETIC · negotiation relay (simulated) · started 09:05
────────────────────────────────────────────────────────────────────────
FENNELFOX: 2.1 GB from LK-FS-07. 6 BTC. 36 hours. Then we publish.
US:        Who exactly are we speaking with? / relay drops
FENNELFOX: Doesn't matter. Wallet FF-MAIN. You have a reputation for
           paying invoices on time. Be on time for this one.
US:        We need time to assess the damage to decide anything.
FENNELFOX: 30 hours now. Price rises 10% every 12 hours after deadline.
────────────────────────────────────────────────────────────────────────
[facts appended by intel] Wallet cluster FF-MAIN: SANCTIONS-FLAGGED
(paying is potentially unlawful). Leak-site listing for Larkspur:
NOT YET PUBLISHED as of 09:30.`},
 backups:{t:'Backup status report',b:
`TRAINING DATA — SYNTHETIC · Backup infra status (from backup server)
────────────────────────────────────────────────────────────────────────
LK-FS-07  nightly, retained 30d, OFFLINE air-gapped copy: nightly YES
LK-DB-01  hourly + point-in-time restore capable
LK-WKS-*  D: drive sync only (workstations NOT fully backed up)
PAY-01    payment server: nightly, offline copy YES
────────────────────────────────────────────────────────────────────────
LAST RESTORE TEST: 14 months ago (passed then). EDR isolation drill:
passed last quarter. Contact list in on-call binder: printed 3 years ago.`},
 custody:{t:'Chain of custody — memory capture form',b:
`TRAINING DATA — SYNTHETIC · Evidence form E-2026-0117-A
────────────────────────────────────────────────────────────────────────
ITEM: RAM capture, LK-WKS-042 (8 GB module, sealed anti-static bag)
COLLECTED BY: ____________   DATE/TIME: ____________   TOOL: ____________
HASH ALGORITHM + VALUE: ____________
────────────────────────────────────────────────────────────────────────
HANDOFF LOG (as recovered):
08:47  A. Ferreira pulled module per incident lead instruction  [signed]
08:51  module left on desk while A.F. answered a call  [unsigned gap]
08:52  F. Delacroix "logged in quickly to check my mail rules" [signed]
08:58  second responder re-seated module "to test if host still boots"
09:10  module bagged, hashed SHA-256, hash recorded  [signed]
────
WITNESS STATEMENT (Katie, helpdesk): "Alex told me the image verified
clean before the module went back into service. I think. It was busy."`},
 roster:{t:'Staff roster & role bios',b:
`TRAINING DATA — SYNTHETIC · Larkspur personnel (fictional)
────────────────────────────────────────────────────────────────────────
Priya Raman    Senior security engineer. Ran the last two drills; has
               standing authority to declare incidents and take systems
               offline. Calm on a bridge call.
Marcus Webb    COO. Owns business-impact calls: shutdowns, pay/no-pay,
               and is the only one who can authorize that spend.
Elena Cruz     Legal counsel. Privacy + contracts; owns regulator
               notifications and the sanctions/legal review.
Tom Okafor     Communications manager. Writes customer notices; briefs
               media; trained spokesperson.
Dana Kline     Security analyst. Documentarian by habit; keeps the
               timeline and evidence log.
Alex Ferreira  Endpoint/forensics responder. Does memory + disk capture.
Jo Silva       Identity & access admin. Can disable accounts in seconds.`},
 pir:{t:'PIR draft — v0.1 (circulated for comment)',b:
`TRAINING DATA — SYNTHETIC · POST-INCIDENT REPORT (DRAFT) INC-2026-0117
────────────────────────────────────────────────────────────────────────
TIMELINE: entry via VPN appliance CVE-2026-31337 (unpatched 9 days,
no patch SLA) → shared account ap_admin (no MFA) → 02:40 staging →
07:58-08:07 encryption WKS-042/051 → FS-07 → contained 09:40.
IMPACT: 2 workstations + file server encrypted; no payment made.
ROOT CAUSE (draft): "An accountant (f.delacroix) opened a phishing
attachment and clicked too fast. Recommend more phishing training."
FINDINGS (draft): 1) user clicked  2) AV did not block encryption
3) attackers were skilled  4) phishing advisory existed 10 days prior
5) backups untested 14 months  6) no cyber tabletop last year
PROPOSED ACTIONS: "annual phishing awareness refresher (already budgeted)"
────────────────────────────────────────────────────────────────────────
[legal comment] Draft is blame-oriented; RCA must identify the failing
CONTROL, not the person, or lessons will not change anything.`},
 assets:{t:'Asset inventory (response-relevant extract)',b:
`TRAINING DATA — SYNTHETIC · CMDB extract
────────────────────────────────────────────────────────────────────────
LK-WKS-042  Finance/AP workstation  state: ENCRYPTED (partial)  ON, NET
LK-WKS-051  Finance workstation     state: .fennel pattern 07:58 ON, NET
LK-FS-07    File server (finance shares, 2.1 GB sensitive)  HEALTHY but
            attacker-accessed via SMB (02:41-03:55 reads)
LK-DB-01    Database server (customer DB)   state: CLEAN (no artifacts)
PAY-01      Payment server (PCI scope)      state: CLEAN, business-critical
LK-VPN-01   Edge VPN appliance fw 8.4.1     CVE-2026-31337 UNPATCHED
────────────────────────────────────────────────────────────────────────
Partner integrations: 203.0.113.0/24 = APL-CARTAGE (legit freight partner,
SLA: blocking them breaches contract) · DNS egress list clean otherwise.`},
 leek:{hard:true,t:'LEAK-SITE WATCH (hard mode)',b:
`TRAINING DATA — SYNTHETIC · intel feed 08:31 Mon
────────────────────────────────────────────────────────────────────────
FENNELFOX blog "pre-list": "LARKSPUR LOGISTICS — data incoming, 2.1 GB"
 Listed as PRE-ANNOUNCED, no files yet. Countdown aligns with chat.
→ This is a real indicator: double-extortion confirmed, not noise.`},
 mssp:{hard:true,t:'MSSP ticket #88121 (hard mode)',b:
`TRAINING DATA — SYNTHETIC · MSSP ticket (night shift)
────────────────────────────────────────────────────────────────────────
#88121 CLOSED: "External port scan from research scanner 192.0.2.99,
approved maintenance window, change ref CHG-4411." No action needed.
────────────────────────────────────────────────────────────────────────
This one is fine. Approved and documented. (Not every alert is a fire.)`},
 printer:{hard:true,t:'Helpdesk ticket #88140 (hard mode)',b:
`TRAINING DATA — SYNTHETIC · Helpdesk ticket
────────────────────────────────────────────────────────────────────────
#88140 OPEN: "Depot 2 printer offline since power strip moved."
────────────────────────────────────────────────────────────────────────
Noise. Printers are always noise. Do not contain the printer.`},
 dupinv:{hard:true,t:'Email thread "Invoice duplicate?" (hard mode)',b:
`TRAINING DATA — SYNTHETIC · email thread 08:12
────────────────────────────────────────────────────────────────────────
AP clerk: "This 'Unpaid freight invoice' duplicate bounced again?"
Mail gateway verdict: sender APL-CARTAGE accounts payable — VERIFIED
LEGITIMATE (SPF/DKIM pass, known sender, matched open PO #10431).
────────────────────────────────────────────────────────────────────────
Benign. A real vendor chasing a real invoice. Red herring on purpose.`}
};

const STATIONS={
 prep:{arts:['roster'],sit:{m:'Before anyone touches a system: what does Larkspur actually have ready? The readiness dossier below is what you inherited when you took the duty phone. Six claims of readiness, mixed quality — and the shift cannot start on vibes.',h:'Same duty phone, but nobody pre-filtered the dossier for you. Twelve claims of readiness — several are wrong, and three are sneaky: they LOOK like gaps or look fine and are not.'}},
 ident:{arts:['siem','edr042','authlog','usermail','advint','advvendor','advcert','leek','mssp','printer','dupinv'],sit:{m:'The queue at 08:20-08:35 is burning. Eight signals compete for attention: EDR criticals, a scared user, advisories from three directions, and routine noise. Triage decides what becomes an incident.',h:'Twelve signals, same morning. Two are pure noise, two are deliberate red herrings, five are true indicators, three are advisories that change your response. The wrong triage sinks everything downstream.'}},
 invest:{arts:['edr042','authlog','custody','assets'],sit:{m:'You have a live incident: an abused shared account, three touched systems, and a memory module with a messy paperwork trail. Scope it and make the evidence survive legal scrutiny.',h:'The custody form is a crime scene of its own. Five handling events — some are textbook, one destroys evidentiary value, and you must also name the single event that cannot be fixed after the fact.'}},
 contain:{arts:['edr042','assets'],sit:{m:'Encryption is live on two workstations and the attacker touched the file server. Contain now — but every action has a cost, and two tempting buttons are traps.',h:'Same fire, more buttons — including two traps that would either destroy evidence or breach a partner contract. Sequence matters: which host first, and what must you NOT do.'}},
 negot:{arts:['chat','advcert','backups'],sit:{m:'FENNELFOX is in the relay chat with a 36-hour clock and a 10% escalation threat. Your stance was supposed to be decided BEFORE the incident. It was not. Decide now — with sanctions and insurance in view.',h:'Same chat, harder questions: the wallet is sanctions-flagged, the insurer wants notice within 24 hours of awareness, and the attacker mentions your backups. One justification field, exact facts required.'}},
 erad:{arts:['backups','assets','advvendor'],sit:{m:'Containment holds. Now remove FENNELFOX completely and bring systems back — in the order that avoids re-encryption and knows which sources are known-good.',h:'Three systems need three different recovery paths, the entry vector must close before anything returns to the network, and two shortcut options are waiting to re-infect you.'}},
 notif:{arts:['roster','chat'],sit:{m:'The clock you cannot negotiate is legal: GDPR-style 72 hours from awareness (started Mon 08:20). Who hears what, in what order, from whose mouth, over which channel?',h:'Six notifications, two named mouths, one out-of-band channel and one arithmetic question about the 72-hour deadline. Order matters and the clock is already at T+ hours.'}},
 post:{arts:['pir','advint','backups'],sit:{m:'Systems are back. The draft PIR blames the accountant. If lessons learned only change people and not controls, this happens again — you are the editor of this report.',h:'The capstone: fix the RCA, classify six findings by type, pick the three control changes that address the root cause, assemble the playbook skeleton, and choose the right exercise for each gap.'}}
};