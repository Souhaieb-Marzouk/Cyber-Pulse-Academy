/* ============================================================
   Larkspur Logistics — INC-2026-0117 · Incident Response Lab
   CompTIA Security+ SY0-801 · Lesson 4.7 (training exercise)
   File: js/data-objectives.js
   Objective banks M1–M12 / H1–H9 with validation rules, hint ladders, feedback (data + embedded validators).
   Content extracted 1:1 from the audited lab (static port v4).
   ============================================================ */
/* ============ VALIDATION HELPERS ============ */
const NZ=s=>String(s==null?'':s).toLowerCase().replace(/[^\w\s:.\/-]/g,' ').replace(/\s+/g,' ').trim();
const re=(s,p)=>p.test(String(s==null?'':s).trim());
const FULL=(a,kind,n)=>{const c=Object.keys(a||{}).length;return kind==='seq'?Array.isArray(a)&&a.length===n:c>=n;};

/* ============ MEDIUM OBJECTIVES (M1–M6) ============ */
const OBJ_M={};
OBJ_M.M1={title:'Audit the readiness dossier: mark each claim Ready or Gap',
 pillar:'P1',phase:'prep',where:{doc:'backups',lbl:'Evidence tray → Backup status report'},
 brief:'Preparation is not documents — it is documents <b>proven to work</b>. Bin each claim of the readiness dossier. Untested controls are the ones that fail at 08:20 on a Monday.',
 widget:{parts:[{kind:'bins',bins:['Ready — proven','Gap — must fix before the shift'],
  items:[
   {id:'p1',txt:'IR playbooks written for ransomware and compromised-mailbox scenarios',ok:0},
   {id:'p2',txt:'Offline backups run nightly — but the last restore test was 14 months ago',ok:1},
   {id:'p3',txt:'EDR fleet-wide; isolation drill passed last quarter',ok:0},
   {id:'p4',txt:'Printed contact list in the on-call binder — printed 3 years ago',ok:1},
   {id:'p5',txt:'Annual security-awareness training: 96% staff completion',ok:0},
   {id:'p6',txt:'One tabletop last year — data-centre fire scenario; none for cyber',ok:1},
   {id:'p7',txt:'Incident lead named; deputy and scribe not appointed',ok:1},
   {id:'p8',txt:'Vulnerability scanning runs weekly on internet-facing systems',ok:0}]}]},
 hints:['Preparation = training, testing, tabletops, playbooks, simulation, roles. A control nobody ever exercised is a gap wearing a green badge.',
  'Two traps to avoid: nightly backups WITH a 14-month-old restore test = testing gap. A fire tabletop ≠ a cyber tabletop.',
  'Gaps: restore testing (p2), stale contact list (p4), no cyber tabletop (p6), no deputy/scribe (p7). Ready: playbooks, EDR drill, training, vuln scanning.'],
 fb:{pass:'This dossier is why the negotiation later hurts: playbooks exist, but <b>testing</b> (restore test, contact list), <b>tabletop</b> (no cyber scenario) and <b>roles</b> (no deputy/scribe) have holes. Preparation components — training, testing, tabletop exercises, playbooks, simulation, roles — only count when they are current and exercised. A defender files these gaps BEFORE the incident, not after.',
  fail:'Re-read each claim for the word that quietly cancels it: "but", "ago", "none for". Preparation means the control was exercised recently and covers THIS threat class.'}};

OBJ_M.M2={title:'Assign the six response roles to the right people',
 pillar:'P1',phase:'prep',where:{doc:'roster',lbl:'Evidence tray → Staff roster & role bios'},
 brief:'Roles are named people with authority, not job titles. Match each response role to the roster bio that carries its duties — and remember every role needs a deputy.',
 widget:{parts:[{kind:'match',perm:[3,0,5,1,4,2],rperm:[2,5,0,3,1,4],opts:['Priya Raman','Marcus Webb','Elena Cruz','Tom Okafor','Dana Kline','Alex Ferreira'],
  rows:[
   {id:'r1',txt:'Incident lead — declares the incident, commands the response',ok:0},
   {id:'r2',txt:'Executive sponsor — owns pay/no-pay and business-impact calls',ok:1},
   {id:'r3',txt:'Legal counsel — owns regulator notification and legal review',ok:2},
   {id:'r4',txt:'Communications lead — single spokesperson for customers & media',ok:3},
   {id:'r5',txt:'Scribe — keeps the timeline and the evidence log',ok:4},
   {id:'r6',txt:'Technical responder — memory/disk forensics on contained hosts',ok:5}]}]},
 hints:['Match duties, not seniority: the roster bios say who has authority for which call.',
  'Pay/no-pay and shutdowns are business calls → COO. Regulator letters and sanctions review → legal. Timeline + evidence log → the documentarian.',
  'Lead=Priya Raman · Sponsor=Marcus Webb · Legal=Elena Cruz · Comms=Tom Okafor · Scribe=Dana Kline · Forensics=Alex Ferreira (Jo Silva is a strong deputy for identity actions).'],
 fb:{pass:'Six named roles, each needing a named deputy (Jo Silva slots naturally as deputy for identity actions — and every other role needs one too). SY0-801 expects you to know the role set: incident lead, technical responders, communications lead/single spokesperson, legal counsel, scribe, executive sponsor. One name, one voice, one wallet.',
  fail:'Two roles get confused constantly: the incident lead COMMANDS the response but does not own the pay/no-pay business call (that is the executive sponsor), and legal counsel — not comms — owns regulator letters.'}};

OBJ_M.M3={title:'Order the first responder\'s six moves on the encrypted workstation',
 pillar:'P1',phase:'prep',where:{doc:'edr042',lbl:'Evidence tray → EDR console LK-WKS-042'},
 brief:'F. Delacroix did everything right so far — laptop on, nothing deleted, helpdesk called. Now sequence the responder moves. The memory in that RAM holds the attacker for forensics; one wrong move wipes it.',
 widget:{parts:[{kind:'seq',presented:[2,4,0,5,1,3],items:[
  {id:'s1',txt:'Leave the workstation powered ON — do not shut down, do not restart'},
  {id:'s2',txt:'Alert the incident lead: suspected compromise on LK-WKS-042'},
  {id:'s3',txt:'Isolate from the network — EDR isolate or pull the cable (host stays on)'},
  {id:'s4',txt:'Photograph the screen and write down the time'},
  {id:'s5',txt:'Hand over to the forensics responder — delete nothing'},
  {id:'s6',txt:'Record your own actions in the response log'}]}]},
 hints:['The first-responder rules: do not power off, do not log in, do not delete. Ordering follows from those.',
  'Contain the spread (isolate) before documenting, and never before telling the lead. Logging your own actions comes last.',
  'Exact order: keep on → alert lead → isolate → photograph → hand off → log.'],
 fb:{pass:'Preservation is a PREPARATION outcome rehearsed in advance: power on keeps RAM evidence alive, isolation stops the spread, nothing is touched until forensics owns it. (Simplified: some teams isolate first for fast-spreading worms — the trade-off is a Hard-mode discussion. What never changes: power on, nothing deleted, everything logged.)',
  fail:'The catastrophic error is powering off or restarting — RAM evidence dies with the power. Isolation without notification leaves the commander blind; photograph before anyone else touches the machine.'}};

OBJ_M.M4={title:'Triage the 08:20–08:35 queue: indicator, advisory, or noise?',
 pillar:'P3',phase:'ident',where:{doc:'siem',lbl:'Evidence tray → SIEM alert queue'},
 brief:'Detection is only as good as the triage behind it. Classify all eight queue items. Indicators become the incident; advisories change your response; noise gets tuned — later.',
 widget:{parts:[{kind:'bins',bins:['Incident indicator','Advisory to review','Benign noise'],items:[
  {id:'a1',txt:'S-101 · EDR: vssadmin delete shadows /all on LK-WKS-042',ok:0},
  {id:'a2',txt:'S-103 · User report: files renamed .fennel, ransom note on desktop',ok:0},
  {id:'a3',txt:'S-105 · Nightly backup job completed with warnings',ok:2},
  {id:'a4',txt:'S-108 · Internal advisory 2026-101 (phishing vs finance), 10 days old, unread',ok:1},
  {id:'a5',txt:'CERT NC-2026-114: FENNELFOX campaign against logistics sector',ok:1},
  {id:'a6',txt:'S-106 · Firewall vendor newsletter: firmware release notes',ok:2},
  {id:'a7',txt:'S-104 · VPN login as ap_admin 02:40 from unfamiliar AS64999',ok:0},
  {id:'a8',txt:'S-107 · EDR: Chrome update prompt on LK-WKS-204',ok:2}]}]},
 hints:['Indicators show attacker actions happening NOW (encryption routines, anomalous privileged logins). Advisories warn about threats targeting others — or you next.',
  'User reports are a top detection source — the reporter describes what the attacker left behind. "Backup completed with warnings" is Tuesday.',
  'Indicators: S-101, S-103, S-104. Advisories: S-108 (internal), CERT (external). Noise: S-105, S-106, S-107.'],
 fb:{pass:'Four detection sources fed this queue — EDR analytics, SIEM/auth anomaly detection, a user report, and external intel (CERT) — and each needs an owner with a response time. The triage rule: attacker action NOW = indicator; warning about a threat class = advisory (verify exposure); routine ops = noise, tune later.',
  fail:'The subtle one: an advisory is not an indicator (nobody attacked you in the advisory), and a backup completion is not an incident. But a scared user describing .fennel files IS the incident talking to you.'}};

OBJ_M.M5={title:'Handle the three advisories: route each to its correct action',
 pillar:'P3',phase:'ident',where:{doc:'advint',lbl:'Evidence tray → Internal advisory 2026-101'},
 brief:'Advisories are cheap detection — if they are read and routed. Route each advisory to the action its type demands. Advisory 2026-101 sat unread for 10 days; you are looking at the consequence.',
 widget:{parts:[{kind:'match',perm:[1,2,0],rperm:[2,0,1],opts:['Internal advisory — verify own exposure (mail gateway, staff reports)','External vendor advisory — patch the vulnerable edge appliance now','External CERT advisory — hunt for the published IOCs in our logs'],
  rows:[
   {id:'v1',txt:'Internal memo 2026-101: phishing campaign targeting finance teams',ok:0},
   {id:'v2',txt:'Vendor bulletin: VPN appliance CVE-2026-31337 actively exploited (fw 8.4.3 available)',ok:1},
   {id:'v3',txt:'National CERT NC-2026-114: FENNELFOX IOCs published — 198.51.100.44 / .77',ok:2}]}]},
 hints:['Who published it tells you the type; what it demands tells you the action.',
  'Your own memo → check OUR exposure. A vendor CVE with a fix → patch. A CERT IOC list → threat-hunt those indicators in your logs.',
  'v1 = internal/verify · v2 = vendor/patch · v3 = CERT/hunt the IOCs.'],
 fb:{pass:'This is the failure chain in miniature: the internal advisory was auto-filed (17 views), the vendor bulletin became a P3 ticket, the CERT alert was never checked against the asset list — and CVE-2026-31337 is the door FENNELFOX walked through. Advisory triage duty in the daily checklist is the control change this chapter wants you to propose.',
  fail:'Internal advisory = verify our own exposure. External vendor advisory = patch what they named. External CERT with IOCs = threat-hunt for those exact indicators. Routing them to "file under F" is how the incident got its head start.'}};

OBJ_M.M6={title:'Complete the chain-of-custody form and find the break',
 pillar:'P2',phase:'invest',where:{doc:'custody',lbl:'Evidence tray → Chain-of-custody form'},
 brief:'The RAM capture of LK-WKS-042 has a messy paperwork trail. Fill the three missing form fields from the log — then name the ONE handling event that permanently destroys evidentiary value.',
 widget:{parts:[
  {kind:'form',fields:[
   {id:'c1',lbl:'Collected by (name as signed at 08:47)',ph:'who pulled the module?',ck:v=>NZ(v).includes('ferreira')},
   {id:'c2',lbl:'Time the sealed hash was recorded',ph:'HH:MM',ck:v=>re(v,/09[:.]10/)},
   {id:'c3',lbl:'Hash algorithm recorded',ph:'algorithm',ck:v=>re(v,/sha[-\s]?256/i)}]},
  {kind:'radio',perm:[2,0,1,3],opts:[
   'Module left unattended on the desk at 08:51, unsigned',
   'Second responder re-seated the module at 08:58 to test',
   'Witnesses cannot confirm the image verified before the return',
   'F. Delacroix logged into the live host at 08:52'],ok:2}]},
 hints:['All three fields come from the form\'s own lines: the 08:47 collector and the 09:10 sealing entry.',
  'Ask of each event: does it make it impossible to PROVE what this evidence is afterwards? Only one event touches the media itself in a destructive way.',
  'Form: Ferreira / 09:10 / SHA-256. The break: returning the original module to service before image verification.'],
 fb:{pass:'Chain of custody = documented, continuous, verifiable control of evidence. Unsigned gaps and re-seating are serious documentation failures — fixable by correction statements. But returning the original media to service before the image verified destroyed the ability to re-verify forever: that evidence can no longer prove itself. E-discovery and legal hold depend on exactly this discipline.',
  fail:'The 08:51 gap and the 08:52 login are terrible practice — but they are documentation and contamination problems that a correction statement can address. Only one event makes it PERMANENTLY impossible to prove the image matches the original media.'}};

/* ============ MEDIUM OBJECTIVES (M7–M12) ============ */
OBJ_M.M7={title:'Execute containment: pick exactly the actions that stop spread and preserve evidence',
 pillar:'P4',phase:'contain',where:{doc:'assets',lbl:'Evidence tray → Asset inventory'},
 brief:'Containment = quarantine/isolation decisions under fire. Toggle every action Larkspur should take RIGHT NOW. Some buttons look heroic and are traps — power, deletion, and premature rebuilding all cost you.',
 widget:{parts:[{kind:'multi',items:[
  {id:'k1',txt:'EDR-isolate LK-WKS-042 (stays powered on)',ok:1},
  {id:'k2',txt:'EDR-isolate LK-WKS-051 (encryption starting 07:58)',ok:1},
  {id:'k3',txt:'Disconnect file server LK-FS-07 from the network (stays on)',ok:1},
  {id:'k4',txt:'Disable the abused shared account ap_admin',ok:1},
  {id:'k5',txt:'Block outbound traffic to 198.51.100.77 (attacker exfil node)',ok:1},
  {id:'k6',txt:'Power off LK-WKS-042 to stop the encryption immediately',ok:0},
  {id:'k7',txt:'Delete the .fennel ransom notes from the file shares',ok:0},
  {id:'k8',txt:'Reimage LK-WKS-042 right now to be safe',ok:0},
  {id:'k9',txt:'Email all staff a password-policy reminder',ok:0}]}]},
 hints:['Containment answers two questions: what is spreading, and what is talking home? Isolate hosts, cut the account, block the destination.',
  'Memory is evidence and the ransom note is evidence: powering off and deleting both destroy things the investigation needs. Reimaging is ERADICATION — a later phase.',
  'Correct five: isolate 042 + 051 + FS-07, disable ap_admin, block 198.51.100.77. Everything else is a trap.'],
 fb:{pass:'Five containment moves, zero evidence destroyed: isolation (quarantine at network level) halts the spread while hosts stay alive for forensics, disabling ap_admin cuts the attacker\'s keys, blocking 198.51.100.77 cuts the leak channel. Eradication and rebuilding are later phases — doing them now would torch evidence and skip the door-closing.',
  fail:'The traps were: powering off (kills RAM evidence and does not stop already-running encryption more safely than isolation), deleting notes (evidence destruction), reimaging now (premature eradication + destroys forensics), and a password-policy email (a memo, not a containment action).'}};

OBJ_M.M8={title:'Scope the incident: account, encrypted hosts, first attacker touch',
 pillar:'P2',phase:'invest',where:{doc:'authlog',lbl:'Evidence tray → VPN & authentication logs'},
 brief:'Investigation starts by answering three scoping questions from the artifacts. Precision matters: "touched" and "encrypted" are different facts.',
 widget:{parts:[{kind:'form',fields:[
  {id:'q1',lbl:'Which account did the attacker abuse?',ph:'account name',ck:v=>NZ(v).includes('ap_admin')||NZ(v)==='ap admin'},
  {id:'q2',lbl:'How many hosts show .fennel ENCRYPTION artifacts?',ph:'number',ck:v=>re(v,/^2$|^two$/i)},
  {id:'q3',lbl:'Time of the FIRST attacker activity in the logs?',ph:'HH:MM',ck:v=>re(v,/02[:.]4[05]/)}]}]},
 hints:['EDR + auth logs give all three. Read the EDR timeline top to bottom.',
  'Careful with the count: LK-FS-07 was READ via SMB (staged/exfiltrated) — .fennel encryption artifacts appear on the two workstations only. The chat\'s "2.1 GB" is exfiltration, not encryption.',
  'ap_admin · 2 hosts (LK-WKS-042, LK-WKS-051) · first touch 02:40 (VPN login from AS64999).'],
 fb:{pass:'Scope: shared service account ap_admin (no MFA), two encrypted workstations, first touch 02:40 — plus one subtlety you just defended: FS-07 was accessed and staged, not (yet) encrypted, which is why isolating it is containment and rebuilding it needs the offline-copy check. This scope is also the factual baseline the regulator notice will need.',
  fail:'Three classic misses: counting FS-07 as encrypted (it was accessed, not encrypted — read the EDR/SMB lines), taking the chat\'s "we encrypted your servers" as evidence (attackers lie), and using the encryption start (08:03) instead of the first attacker activity (02:40 staging) as the start of the incident.'}};

OBJ_M.M9={title:'Set the negotiation stance and run the mandatory checks',
 pillar:'P4',phase:'negot',where:{doc:'chat',lbl:'Evidence tray → Extortion chat transcript'},
 brief:'FENNELFOX wants 6 BTC in 36 hours. The stance should have been decided before the incident — decide it now, and select every check that MUST run before any payment decision could exist.',
 widget:{parts:[
  {kind:'radio',perm:[0,2,1],opts:[
   'Pay quickly anyway — operations first, and argue about legality afterwards',
   'Do not pay: verify backups, engage specialists, brief legal counsel',
   'Ignore the chat, hope the deadline passes without a leak'],ok:1},
  {kind:'multi',items:[
   {id:'m1',txt:'Sanctions screening of the wallet cluster (FF-MAIN is flagged)',ok:1},
   {id:'m2',txt:'Legal review — paying a sanctioned actor may itself be unlawful',ok:1},
   {id:'m3',txt:'Insurer notification per policy — notice within 24h of awareness',ok:1},
   {id:'m4',txt:'Ask FENNELFOX for client references to prove the decryptor works',ok:0}]}]},
 hints:['One of the stance options makes the sanctions problem worse, not better. Another relies on criminals keeping promises.',
  'The intel note on the CERT advisory says wallet FF-MAIN is sanctions-flagged, and the backup report says offline copies exist — leverage is removable.',
  'Stance: do not pay + verify + specialists + legal review. Checks: sanctions screening, legal review, insurer notice. "References" from criminals is a trap.'],
 fb:{pass:'Stance = business decision owned by the executive sponsor, informed by legal, insurer and law enforcement. Paying is unreliable (no guaranteed decryptor, data is not returned, access is not removed, you are marked as a payer) and FF-MAIN being sanctions-flagged means a payment could be unlawful. What removes the leverage? The tested offline backups you flagged as a gap in M1 — preparation decided this fight before it started.',
  fail:'"Pay quickly" fails on four counts: no guarantee, no data return, sanctions exposure, and payer-marking. "Ignore them" ignores a 36-hour clock and a leak threat. And asking criminals for references — no.'}};

OBJ_M.M11={title:'Build the notification plan: order, spokesperson, channel',
 pillar:'P4',phase:'notif',where:{doc:'roster',lbl:'Evidence tray → Staff roster (spokesperson)'},
 brief:'Notification is risk mitigation: two clocks are already running (insurer 24h contract clock; GDPR 72h statutory clock from awareness). Order the five notifications, name the single spokesperson, and pick the coordination channel the attacker cannot read.',
 widget:{parts:[
  {kind:'seq',presented:[3,0,4,1,2],items:[
   {id:'o1',txt:'Brief executive sponsor + legal counsel (internal, out-of-band)'},
   {id:'o2',txt:'Notify the cyber insurer — contract requires notice within 24h'},
   {id:'o3',txt:'Notify the data-protection authority — statutory clock: within 72h of awareness'},
   {id:'o4',txt:'Notify law enforcement — extortion is a crime'},
   {id:'o5',txt:'Publish the customer notice — plain language, via the single spokesperson'}]},
  {kind:'form',fields:[
   {id:'f1',lbl:'Single spokesperson (name)',ph:'who speaks?',ck:v=>NZ(v).includes('okafor')},
   {id:'f2',lbl:'Coordination channel the attacker cannot read',ph:'channel type',ck:v=>re(v,/out.of.band|out of band|separate|phone|bridge|signal|reserved|messaging platform|dedicated/i)}]}]},
 hints:['Internal leadership hears first — before any external word leaves the building. Then rank the clocks: contract (24h), statute (72h).',
  'The roster says who is trained to speak. Corporate email is compromised-adjacent — pick a channel FENNELFOX is not reading.',
  'Order: exec+legal → insurer → regulator → police → customers. Spokesperson: Tom Okafor. Channel: out-of-band (phone bridge / separate messaging platform).'],
 fb:{pass:'The order encodes the logic: internal brief first (no surprises internally), then the two clocks — insurer 24h (contract) and the regulator\'s 72h from awareness (GDPR Art. 33-style statutory duty; awareness = Mon 08:20, so the window closes Thu 08:20) — then law enforcement on the crime, and customers only once facts are verified and the single voice (Tom Okafor) speaks. Two rules to keep: out-of-band coordination, one spokesperson.',
  fail:'Common failures: customers before facts are verified (false comfort is worse than no comment), skipping the insurer (policy may void), regulator notification treated as optional, and coordinating over corporate email the attacker may be reading.'}};

OBJ_M.M10={title:'Sequence eradication & recovery: close the door before rebuilding the house',
 pillar:'P4',phase:'erad',where:{doc:'backups',lbl:'Evidence tray → Backup status report'},
 brief:'Containment holds. Eradication removes FENNELFOX; recovery brings systems back. Order the seven steps — the entry vector, the persistence, the known-good sources and the verification all have a place.',
 widget:{parts:[{kind:'seq',presented:[2,5,0,6,3,1,4],items:[
  {id:'r1',txt:'Close the entry vector — patch LK-VPN-01 to firmware 8.4.3'},
  {id:'r2',txt:'Remove persistence and attacker-created accounts across the estate'},
  {id:'r3',txt:'Rebuild LK-WKS-042, LK-WKS-051 and LK-FS-07 from known-good images'},
  {id:'r4',txt:'Verify backup integrity, then restore data from the OFFLINE copies'},
  {id:'r5',txt:'Scan and verify clean BEFORE reconnecting; watch for reinfection signs'},
  {id:'r6',txt:'Reconnect to the network with heightened monitoring for two weeks'},
  {id:'r7',txt:'Incident lead formally confirms recovery complete; monitor for return'}]}]},
 hints:['The door must close before the house is rebuilt — otherwise you are renovating with the attacker still inside.',
  'Restore BEFORE removing persistence = re-encryption (the S7 near-miss). Offline copies, because online backups may be tampered with.',
  'Order: patch VPN → remove persistence/accounts → rebuild the three systems → restore offline data → verify clean → reconnect + monitor → lead confirms recovery.'],
 fb:{pass:'Eradication = removing malware, persistence, attacker accounts AND the vulnerability used to get in (CVE-2026-31337 — patch before anything returns to the network). Recovery = rebuild from known-good images, restore from verified offline backups, prove cleanliness before reconnection, then heightened monitoring — because a patient attacker tests whether you really fixed the door.',
  fail:'Two shortcuts kill recoveries: restoring before persistence is removed (re-encryption on reconnect — the classic near-miss), and rebuilding before patching the entry vector (a same-week re-entry). Unverified backups are hope, not recovery.'}};

OBJ_M.M12={title:'Fix the PIR: pick the real root cause and pair findings to control changes',
 pillar:'P1',phase:'post',where:{doc:'pir',lbl:'Evidence tray → PIR draft v0.1'},
 brief:'The draft PIR blames the accountant. Root cause analysis must find the failing CONTROL, and lessons learned only count when they become changed controls. Pick the root cause, then pair three findings to the changes that fix them.',
 widget:{parts:[
  {kind:'radio',perm:[3,1,0,2],opts:[
   'The accountant clicked too fast — phishing training would close it',
   'The internet-facing VPN appliance ran a known, unpatched exploited CVE',
   'Antivirus failed to block the encryption routine as it ran',
   'The operators were unusually skilled, unusually well-resourced and persistent professionals'],ok:1},
  {kind:'match',perm:[2,0,1],rperm:[1,2,0],opts:['Advisory triage duty added to the daily ops checklist','Quarterly restore tests with sign-off','Annual cyber tabletop + a ransomware simulation'],
   rows:[
    {id:'f1',txt:'Finding 4: the phishing advisory sat unread for 10 days',ok:0},
    {id:'f2',txt:'Finding 5: backups untested for 14 months',ok:1},
    {id:'f3',txt:'Finding 6: no cyber tabletop in the last year',ok:2}]}]},
 hints:['Root cause = the underlying failing control the attacker exploited — not the human moment, not the tool that missed it, not the adversary\'s skill.',
  'Each ignored finding maps to the routine that would have caught it: advisories need a reader, backups need tests, plans need rehearsals.',
  'Root cause: the unpatched edge appliance with no patch SLA. Pairs: advisory→daily triage duty · backups→quarterly restore tests · tabletop→annual cyber exercise + simulation.'],
 fb:{pass:'This is the whole point of post-incident work: root cause analysis found the failing CONTROL (unpatched internet-facing appliance, no patch SLA), and lessons learned became three concrete, scheduled, ownable control changes — a blameless report that changes the system. "More phishing slides already budgeted" changes nothing; that is why the draft was rejected.',
  fail:'"The user clicked" is a symptom with a person attached — fixable controls are: advisory triage (the memo nobody read), tested backups (the leverage FENNELFOX counted on), and rehearsals (the decisions nobody had made). AV failure and attacker skill are contributing facts, not root cause.'}};

/* ============ HARD OBJECTIVES (H1–H9) ============ */
const OBJ_H={};
OBJ_H.H1={title:'Full readiness audit — 12 claims, 3 verdicts, no mercy',
 pillar:'P1',phase:'prep',where:{doc:'backups',lbl:'Evidence tray → Backup status report'},
 brief:'Nobody pre-filtered the dossier this time. Bin all twelve claims: genuine gap, fine as-is (red herring), or the worst kind — a <b>disguised gap</b> that looks ready and is not. Two of those are planted.',
 widget:{parts:[{kind:'bins',bins:['Genuine gap — fix before shift','Fine as-is (red herring)','Disguised gap — looks ready, is not'],items:[
  {id:'h1',txt:'No in-house SOC; MSSP contract with 15-minute critical-escalation SLA',ok:1},
  {id:'h2',txt:'EDR on laptops/desktops; AV-only on print servers (risk-accepted, low-value targets)',ok:1},
  {id:'h3',txt:'Ransomware playbook written by the MSSP — never exercised in any drill',ok:2},
  {id:'h4',txt:'Two-factor authentication on remote access for all human accounts',ok:1},
  {id:'h5',txt:'Offline backups nightly — last restore test 14 months ago',ok:0},
  {id:'h6',txt:'Contact list "always current" — it lives in the CISO\'s corporate mailbox',ok:2},
  {id:'h7',txt:'Annual staff security-awareness training at 96% completion',ok:1},
  {id:'h8',txt:'One tabletop last year — data-centre fire scenario only, none for cyber',ok:0},
  {id:'h9',txt:'Incident lead + deputy named; communications lead seat vacant',ok:0},
  {id:'h10',txt:'Vulnerability scanning weekly on internet-facing systems',ok:1},
  {id:'h11',txt:'Runbooks printed in the on-call binder — edition is 3 years old',ok:0},
  {id:'h12',txt:'EDR isolation drill passed last quarter',ok:1}]}]},
 hints:['Test every claim the same way: was it exercised recently, does it cover THIS threat class, does it survive the attacker reading our email?',
  'The two disguised gaps share a property: something "exists" but could never be relied on at 02:00 — one was never rehearsed, one lives where the attacker is listening.',
  'Genuine gaps: h5 (restore test), h8 (no cyber tabletop), h9 (no comms lead), h11 (stale runbooks). Disguised: h3 (unexercised playbook), h6 (contact list in email). Fine: h1, h2, h4, h7, h10, h12.'],
 fb:{pass:'Audited like an attacker would: an MSSP is a control (h1 is fine), AV-only on low-value print servers is a risk decision (h2 is fine) — but a playbook nobody ever drilled and a contact list living in the mailbox the attacker can read are preparation theatre. The exam calls this out: training, testing, tabletops, playbooks, simulation, roles — every one must be current, exercised, and reachable out-of-band.',
  fail:'Two claims fooled you. An unexercised playbook is a document, not a capability; a contact list in corporate email dies exactly when you need it. Re-sort with the test: "would this survive contact with a real attacker at 02:00?"'}};

OBJ_H.H2={title:'Triage 12 signals, name the incident, make the declaration',
 pillar:'P2',phase:'ident',where:{doc:'leek',lbl:'Evidence tray → Leak-site watch'},
 brief:'Three parts, all exact. (1) Bin all twelve signals. (2) Name the incident type. (3) Write the declaration line: who declares, and the action. Two signals in the tray are pure noise, two are bait.',
 widget:{parts:[
  {kind:'bins',bins:['True incident indicator','Advisory to review','Benign noise / red herring'],items:[
   {id:'b1',txt:'EDR: vssadmin delete shadows /all on LK-WKS-042',ok:0},
   {id:'b2',txt:'EDR: mass rename *.fennel on LK-WKS-042 (4,112 writes in 90s)',ok:0},
   {id:'b3',txt:'User report: .fennel files + ransom note (f.delacroix, host still on)',ok:0},
   {id:'b4',txt:'VPN: ap_admin 02:40 from AS64999 — new fingerprint, account has no MFA',ok:0},
   {id:'b5',txt:'Leak-site watch: FENNELFOX pre-list "LARKSPUR — 2.1 GB incoming"',ok:0},
   {id:'b6',txt:'RDP session from 198.51.100.44 into LK-WKS-051 at 07:58',ok:0},
   {id:'b7',txt:'Internal advisory 2026-101 (phishing vs finance), 10 days unread',ok:1},
   {id:'b8',txt:'Vendor bulletin: VPN appliance CVE-2026-31337 actively exploited',ok:1},
   {id:'b9',txt:'CERT NC-2026-114: FENNELFOX campaign + published IOCs',ok:1},
   {id:'b10',txt:'MSSP #88121: external research scan, approved change ref CHG-4411',ok:2},
   {id:'b11',txt:'Helpdesk #88140: depot 2 printer offline',ok:2},
   {id:'b12',txt:'Email "invoice duplicate?" — verified legitimate sender (APL-CARTAGE)',ok:2}]},
  {kind:'radio',perm:[2,3,1,0],opts:[
   'Ransomware only — encryption without any data exfiltration involved',
   'Double extortion: encryption + exfiltration + leak-site threat',
   'Business email compromise — credential theft and payment fraud',
   'Insider data theft — a disgruntled employee staging files'],ok:1},
  {kind:'form',fields:[
   {id:'dc1',lbl:'Declaration line — who declares, and the action',ph:'e.g. … declares …',ck:v=>re(v,/declar/i)&&(NZ(v).includes('priya')||NZ(v).includes('incident lead'))}]}]},
 hints:['The leak-site pre-list and the chat are independent sources confirming each other — that is what makes it double extortion, and what makes the pre-list an indicator, not a rumor.',
  'Approved scan + change reference = documented and fine. A verified-legitimate vendor email is bait dressed as phishing. Printers remain innocent.',
  'Indicators: b1–b6. Advisories: b7–b9. Noise: b10–b12. Type: double extortion. Declaration: Priya (incident lead) declares the incident.'],
 fb:{pass:'Five indicators, two sources each: endpoint forensics (EDR) and identity/analytics (VPN anomaly), plus external confirmation (leak-site pre-list + chat). The incident type is double extortion — encryption AND 2.1 GB exfiltrated AND a leak threat — which changes everything downstream: notification duty now assesses personal data, and the negotiation stance must weigh publication, not just decryption. Declaration authority sits with the named incident lead.',
  fail:'Misses that sink trainees: the leak-site pre-list is an indicator (publication is already decided — that is exfiltration evidence), the RDP pivot into WKS-051 is lateral movement, and the MSSP scan is approved work. And the declaration names the role — incident lead — before it names the plan.'}};

OBJ_H.H3={title:'Custody audit — 5 events, one permanent break, one cure',
 pillar:'P2',phase:'invest',where:{doc:'custody',lbl:'Evidence tray → Chain-of-custody form'},
 brief:'Three exact parts. (1) Bin the five handling events. (2) Name the ONE event that permanently destroys evidentiary value. (3) Name the instrument that cures paperwork gaps — but cannot cure destruction.',
 widget:{parts:[
  {kind:'bins',bins:['Handled correctly','Custody failure'],items:[
   {id:'e1',txt:'08:47 — memory pulled per incident lead instruction, signed, sealed anti-static bag',ok:0},
   {id:'e2',txt:'08:51 — module left on an open desk for 5 minutes, unsigned gap',ok:1},
   {id:'e3',txt:'09:10 — sealed, SHA-256 computed, hash recorded on the form',ok:0},
   {id:'e4',txt:'08:58 — second responder re-seated the module "to test if the host still boots" — BEFORE image verification',ok:1},
   {id:'e5',txt:'Transfer to the forensic lab signed by both parties with date and time',ok:0}]},
  {kind:'radio',perm:[2,1,0],opts:[
   'The unsigned 5-minute custody gap logged at 08:51',
   'The module returned to service before image verification',
   'Delacroix logging into the live host at 08:52'],ok:1},
  {kind:'form',fields:[
   {id:'cc1',lbl:'What document cures a custody GAP (but not destruction)?',ph:'instrument name',ck:v=>re(v,/correction|amendment|statement|annotation|note/i)}]}]},
 hints:['Custody has two failure classes: gaps in the RECORD (curable with a written instrument) and damage to the MEDIA (not curable). Sort by which class each event belongs to.',
  'Ask: can we still prove today what that RAM contains and that nothing altered it? The 08:58 event is the only one that makes proof impossible.',
  'e1, e3, e5 correct · e2, e4 failures. Permanent break: media back in service before verification. Cure for gaps: a correction statement.'],
 fb:{pass:'Sorted correctly: signed, sealed, hashed, witnessed transfers are custody working as designed; the unsigned gap is a record defect — curable with a correction statement attesting the interval. But the module going back into service before verification destroyed the possibility of proving the image matches the original media, forever. That is the difference between a documentation failure and evidence destruction — and it is why preservation discipline exists.',
  fail:'The 08:51 gap looks damning but is curable (correction statement). The login at 08:52 is contamination of the live host, not of the capture. Only one event touched the MEDIA in a way that makes proof impossible — permanent, not paperwork.'}};

OBJ_H.H4={title:'Detection gap analysis — name what missed it, write what would catch it',
 pillar:'P3',phase:'invest',where:{doc:'advvendor',lbl:'Evidence tray → Vendor bulletin (CVE)'},
 brief:'Five failures let FENNELFOX run from 02:40 to 08:03 unnoticed. (1) Map each failure to the control that should have caught it. (2) Write one detection criterion that would have fired BEFORE 08:03.',
 widget:{parts:[
  {kind:'match',perm:[3,0,4,1,2],rperm:[2,4,0,3,1],opts:['EDR auto-contain policy','VPN/auth monitoring + MFA on service accounts','Mail-gateway & advisory triage duty','Patch SLA for internet-facing gear','Scheduled threat-intel IOC sweeps'],
   rows:[
    {id:'w1',txt:'Encryption ran for minutes with no automatic response (auto-contain disabled)',ok:0},
    {id:'w2',txt:'Service account ap_admin: VPN from a new ASN, no MFA — logged, unactioned',ok:1},
    {id:'w3',txt:'Phishing advisory sat unread for 10 days; the same theme hit our finance team',ok:2},
    {id:'w4',txt:'Edge appliance CVE-2026-31337 unpatched for 9 days with no fix deadline',ok:3},
    {id:'w5',txt:'CERT published the exact C2 IPs (198.51.100.44/.77) — never swept against our logs',ok:4}]},
  {kind:'form',fields:[
   {id:'dt1',lbl:'One detection criterion that fires BEFORE 08:03 — name the event to alert on',ph:'event / condition',ck:v=>re(v,/vssadmin|shadow|fennel|mass (file )?rename|ap_admin (vpn|login|session)|new asn|mfa/i)}]}]},
 hints:['Each failure has a home: an endpoint response setting, an identity/analytics control, a human routine, a patch SLA, and an intel loop.',
  'For the criterion: what did the EDR see at 08:03 that, as an ALERT, should have existed at 07:00? Shadow-copy deletion and mass rename both qualify — so does the 02:40 anomaly.',
  'w1 EDR auto-contain · w2 VPN/auth + MFA · w3 advisory triage · w4 patch SLA · w5 IOC sweeps. Criterion example: alert on "vssadmin delete shadows /all" or on mass file rename.'],
 fb:{pass:'This is detection engineering as the exam means it: every gap maps to a control with an owner — auto-contain ON, MFA enforced on service accounts, an advisory-triage duty, a 72h patch SLA for edge gear, and a scheduled IOC sweep. And the criterion you wrote is exactly the alert that turns 02:40 staging into a 02:45 page instead of an 08:20 disaster.',
  fail:'The mapping is one-to-one: a disabled auto-response is an EDR policy fix, not a training problem; an IOC list nobody sweeps is an intel-process gap. For the criterion: be specific — an event, a threshold, an action ("alert + page on-call"), not "monitor better".'}};

OBJ_H.H5={title:'Containment under pressure — sequence 5 moves, spot 4 traps',
 pillar:'P4',phase:'contain',where:{doc:'assets',lbl:'Evidence tray → Asset inventory (partner ranges)'},
 brief:'Two parts, both exact. (1) Order the five correct containment moves — first move matters most. (2) Select every TRAP among the six candidates: actions that would destroy evidence, break a partner contract, cut your own backups, or leak your response plan.',
 widget:{parts:[
  {kind:'seq',presented:[2,4,0,3,1],items:[
   {id:'c1',txt:'Isolate LK-FS-07 from the network first — the data extortion depends on'},
   {id:'c2',txt:'EDR-isolate LK-WKS-042 (encryption actively running)'},
   {id:'c3',txt:'EDR-isolate LK-WKS-051 (pivot target, 07:58)'},
   {id:'c4',txt:'Block outbound to 198.51.100.44 AND 198.51.100.77 (C2 + exfil)'},
   {id:'c5',txt:'Disable ap_admin — the attacker\'s only keys'}]},
  {kind:'multi',items:[
   {id:'t1',txt:'TRAP? Power off LK-FS-07 "to stop the exfiltration"',ok:1},
   {id:'t2',txt:'TRAP? Block 203.0.113.0/24 "to be thorough" (partner APL-CARTAGE range)',ok:1},
   {id:'t3',txt:'TRAP? Disable svc_backup too — "defense in depth"',ok:1},
   {id:'t4',txt:'TRAP? Announce containment to staff over corporate email',ok:1},
   {id:'t5',txt:'TRAP? EDR-isolate LK-WKS-042',ok:0},
   {id:'t6',txt:'TRAP? Block outbound to 198.51.100.77',ok:0}]}]},
 hints:['What does the extortion actually monetize? The staged data — cut that path first, then the encrypting hosts, then the keys and the phone-home.',
  'The traps share tells: destroying state, collateral damage (a contracted partner!), self-sabotage (your backup service account), and speaking over a channel the attacker may read.',
  'Order: FS-07 → WKS-042 → WKS-051 → block .44/.77 → disable ap_admin. Traps: power-off FS-07, block the partner range, kill svc_backup, staff email.'],
 fb:{pass:'FS-07 first — it holds the exfiltrated data that gives the attacker their only leverage; every minute it stays connected is a minute the 2.1 GB grows. Then the encrypting workstations, the C2/exfil egress, then the keys. The four traps each break something real: power-off destroys the evidentiary state of the data source, the partner range is under contract (APL-CARTAGE SLA), svc_backup is what your recovery depends on tonight, and corporate email may be attacker-observed — out-of-band only.',
  fail:'Traps you missed (or real moves you flagged): power-off kills evidence rather than exfiltration, 203.0.113.0/24 is a contracted partner range — blocking it breaches the SLA, svc_backup is your recovery lifeline, and containment chatter belongs on out-of-band channels. Isolating 042 and blocking .77 are correct moves, not traps.'}};

OBJ_H.H6={title:'Negotiation stance — decide, check, and justify in writing',
 pillar:'P4',phase:'negot',where:{doc:'chat',lbl:'Evidence tray → Extortion chat + intel notes'},
 brief:'Four exact parts. (1) Stance. (2) All checks that MUST run before any payment decision could exist. (3) Two facts from the intel notes, verbatim concepts: the wallet\'s status and the insurer\'s clock. (4) A one-line justification that names why paying is unreliable AND where your leverage lives.',
 widget:{parts:[
  {kind:'radio',perm:[1,0,2],opts:[
   'Pay quickly anyway — operations first, and sort out legality afterwards',
   'Do not pay: verify backups, engage specialists, run the reviews',
   'Ignore the chat until the deadline passes, then reassess quietly'],ok:1},
  {kind:'multi',items:[
   {id:'g1',txt:'Sanctions screening of wallet cluster FF-MAIN',ok:1},
   {id:'g2',txt:'Legal review of payment legality',ok:1},
   {id:'g3',txt:'Insurer notification per policy clock',ok:1},
   {id:'g4',txt:'Law enforcement notification of the crime',ok:1},
   {id:'g5',txt:'Ask FENNELFOX for client references to vet the decryptor',ok:0}]},
  {kind:'form',fields:[
   {id:'nf1',lbl:'Intel fact: status of wallet cluster FF-MAIN',ph:'status',ck:v=>re(v,/sanction|flag/i)},
   {id:'nf2',lbl:'Intel fact: the insurer\'s notice clock',ph:'clock',ck:v=>re(v,/24\s*(h|hour)/i)},
   {id:'nf3',lbl:'One-line justification — unreliable payment + our leverage',ph:'because…',ck:v=>re(v,/backup/i)&&re(v,/no guarantee|not returned|may not|won'?t|decryptor|unreliable|sanction|unlawful|marked as|willing/i)}]}]},
 hints:['Two facts are sitting in the intel notes under the chat and the CERT advisory: the wallet\'s legal status and the insurer\'s notice requirement. Use them verbatim.',
  'The justification needs two halves: why paying fails on its own merits, and what actually removes their leverage.',
  'Stance: do not pay + verify + specialists. Checks: sanctions, legal, insurer, law enforcement. Facts: FF-MAIN sanctions-flagged; 24h insurer notice. Leverage: tested offline backups.'],
 fb:{pass:'The complete answer: stance is a pre-decided business position (executive sponsor owns it), informed by sanctions screening (FF-MAIN is flagged — payment risks being unlawful), legal review, the 24h insurer notice clock, and a law-enforcement report on the extortion. The justification ties it together: paying is unreliable — no guaranteed decryptor, data not returned, payer-marking — and the leverage lives in verified offline backups. That is preparation deciding a negotiation.',
  fail:'Near-misses we reject: "pay with a legal waiver" still exposes Larkspur to sanctions liability and funds the next campaign; "stall and hope" forfeits the insurer clock; omitting law enforcement ignores that extortion is a crime in progress; and a justification without the backups misses the entire strategic point.'}};

OBJ_H.H7={title:'Recovery architecture — three systems, three paths, two traps',
 pillar:'P4',phase:'erad',where:{doc:'backups',lbl:'Evidence tray → Backup status report'},
 brief:'Three exact parts. (1) Map each system to its correct recovery path. (2) Order the five eradication/recovery steps. (3) Select both shortcut traps that would re-infect or leave the door open.',
 widget:{parts:[
  {kind:'match',perm:[1,2,0],rperm:[2,0,1],opts:['Rebuild from known-good image (workstation data = sync-only); verify before reconnect','Rebuild from known-good image + restore from verified OFFLINE backup; verify before reconnect','Integrity-check, then point-in-time restore; no rebuild needed (clean)'],
   rows:[
    {id:'x1',txt:'LK-WKS-042 / LK-WKS-051 — encrypted workstations',ok:0},
    {id:'x2',txt:'LK-FS-07 — accessed + staged; offline air-gapped copies exist',ok:1},
    {id:'x3',txt:'LK-DB-01 — clean, point-in-time backups',ok:2}]},
  {kind:'seq',presented:[1,3,0,4,2],items:[
   {id:'y1',txt:'Patch LK-VPN-01 to 8.4.3 — close the door first'},
   {id:'y2',txt:'Remove persistence + attacker-created accounts estate-wide'},
   {id:'y3',txt:'Rebuild the three affected systems from known-good images'},
   {id:'y4',txt:'Verify integrity of offline backups, then restore data'},
   {id:'y5',txt:'Scan + verify clean BEFORE any reconnection'}]},
  {kind:'multi',items:[
   {id:'u1',txt:'TRAP? Restore FS-07 immediately from last night\'s copy — persistence removal can wait',ok:1},
   {id:'u2',txt:'TRAP? Keep LK-VPN-01 in service behind a WAF rule until a maintenance window',ok:1},
   {id:'u3',txt:'TRAP? Rebuild PAY-01 as well, for symmetry',ok:0},
   {id:'u4',txt:'TRAP? Wipe LK-DB-01 and restore a full backup',ok:0}]}]},
 hints:['The three paths differ by what happened to each system and what backup truth exists for it. Workstations, staged file server, clean database — three different answers.',
  'Restoring over a live attacker is re-encryption with a countdown. An actively exploited edge device behind a WAF is still an actively exploited edge device.',
  'Paths: workstations rebuild (sync data) · FS-07 rebuild + offline restore · DB-01 point-in-time after integrity check. Order: patch → persistence → rebuild → restore → verify. Traps: u1, u2.'],
 fb:{pass:'Three systems, three evidence-based paths: workstations rebuild from known-good images (their data was sync-only), the staged file server rebuilds and restores from the verified offline copy, the clean database takes a point-in-time restore after an integrity check — no gratuitous rebuild of PAY-01 (clean, PCI scope: touch nothing). The order encodes the discipline: door closed → persistence gone → rebuilt → restored → verified clean before reconnection. The traps are the two shortcuts that end careers: restoring into a live attacker, and "temporarily" keeping an actively exploited edge device in service.',
  fail:'Near-misses: rebuilding PAY-01 or wiping DB-01 is unnecessary blast radius on clean, critical systems; restoring FS-07 before persistence removal re-encrypts it on reconnect; a WAF rule on CVE-2026-31337 is a schedule slip dressed as a control — the fix exists (8.4.3) and the CVE is actively exploited.'}};

OBJ_H.H8={title:'Notification matrix — order, mouths, clock arithmetic, contents',
 pillar:'P4',phase:'notif',where:{doc:'chat',lbl:'Evidence tray → Chat (awareness time 08:20)'},
 brief:'Four exact parts. (1) Order all six notifications. (2) Name the spokesperson and the coordination channel type. (3) Compute the regulatory deadline from awareness (Mon 08:20). (4) Select the three contents the regulator notice must carry.',
 widget:{parts:[
  {kind:'seq',presented:[2,4,0,5,3,1],items:[
   {id:'n1',txt:'Internal brief: executive sponsor + legal (out-of-band)'},
   {id:'n2',txt:'Insurer notice — 24h contract clock'},
   {id:'n3',txt:'Regulator notice — statutory clock, preliminary facts acceptable'},
   {id:'n4',txt:'Law enforcement — extortion is a crime in progress'},
   {id:'n5',txt:'Staff notice — what changed, who to ask, what not to do'},
   {id:'n6',txt:'Customer notice — verified facts, single spokesperson'}]},
  {kind:'form',fields:[
   {id:'s1',lbl:'Single spokesperson (name)',ph:'name',ck:v=>NZ(v).includes('okafor')},
   {id:'s2',lbl:'Coordination channel type (attacker-proof)',ph:'type',ck:v=>re(v,/out.of.band|out of band|separate|dedicated|phone|bridge/i)},
   {id:'s3',lbl:'Regulatory deadline — day + time from awareness Mon 08:20',ph:'day + time',ck:v=>re(v,/thu(r(s(day)?)?)?\b[,\s]*0?8[:.]20/i)}]},
  {kind:'multi',items:[
   {id:'g1',txt:'Nature of the breach + categories of data affected',ok:1},
   {id:'g2',txt:'Approximate number of data subjects and records',ok:1},
   {id:'g3',txt:'Contact point for the authority (DPO) for follow-up',ok:1},
   {id:'g4',txt:'Names of employees who clicked the phishing attachment',ok:0},
   {id:'g5',txt:'The negotiated ransom amount and wallet address',ok:0}]}]},
 hints:['The insurer clock (24h) is shorter than the statutory clock (72h) — but internal leadership hears first, always. Customers come last, after facts are verified.',
  'Awareness = Mon 08:20. Add exactly 72 hours and write the day and the time. One spokesperson, trained; one channel, out-of-band.',
  'Order: internal → insurer → regulator → law enforcement → staff → customers. Deadline: Thursday 08:20 (Mon 08:20 + 72h). Regulator contents: nature + data categories, scale, contact point — never the phished employees\' names, never negotiation details.'],
 fb:{pass:'The matrix is complete: internal first (no internal surprises), then the two clocks — insurer 24h (contract) and the regulator\'s statutory 72h from awareness, which arithmetic lands on Thursday 08:20, preliminary facts acceptable and updateable in phases — then law enforcement, then staff, then customers through the single trained voice. The contents list is the data-protection discipline itself: what happened and how big, never who to blame and never negotiation intelligence.',
  fail:'Rejected near-misses: customer notice before verified facts (false comfort); regulator at hour 80 ("we wanted complete facts" — the clock does not wait); naming the employees who clicked (data minimization applies to YOU too); a coordination channel over corporate email.'}};

OBJ_H.H9={title:'Capstone — RCA, findings taxonomy, playbook, exercises',
 pillar:'P1',phase:'post',where:{doc:'pir',lbl:'Evidence tray → PIR draft v0.1'},
 brief:'Five exact parts — the whole chapter in one grid. (1) Root cause. (2) Classify six findings: root cause / contributing factor / symptom. (3) Select all control changes that address the root cause and findings. (4) Assemble the playbook skeleton in official phase order. (5) Match each gap to the right exercise type.',
 widget:{parts:[
  {kind:'radio',perm:[0,3,1,2],opts:[
   'The accountant clicked too fast — phishing training would close it',
   'The internet-facing VPN appliance ran a known, unpatched exploited CVE',
   'Antivirus failed to block the encryption routine as it ran',
   'The operators were unusually skilled, unusually well-resourced and persistent professionals'],ok:1},
  {kind:'bins',bins:['Root cause','Contributing factor','Symptom — do not treat as cause'],items:[
   {id:'d1',txt:'Unpatched internet-facing VPN appliance, no patch SLA',ok:0},
   {id:'d2',txt:'Shared service account ap_admin without MFA',ok:1},
   {id:'d3',txt:'AV did not block the encryption routine',ok:2},
   {id:'d4',txt:'A user opened the phishing attachment',ok:2},
   {id:'d5',txt:'Advisory triage had no owner; memos auto-filed unread',ok:1},
   {id:'d6',txt:'Backups untested for 14 months',ok:1}]},
  {kind:'multi',items:[
   {id:'z1',txt:'Patch SLA: 72h for internet-facing gear, named owner',ok:1},
   {id:'z2',txt:'MFA on all service and shared accounts',ok:1},
   {id:'z3',txt:'Advisory triage duty in the daily ops checklist',ok:1},
   {id:'z4',txt:'Annual cyber tabletop + a ransomware simulation',ok:1},
   {id:'z5',txt:'Annual phishing refresher (already budgeted)',ok:0},
   {id:'z6',txt:'Name-and-shame policy for clicked links',ok:0}]},
  {kind:'seq',presented:[3,6,0,7,1,5,2,4],items:[
   {id:'ph1',txt:'Preparation'},{id:'ph2',txt:'Identification'},{id:'ph3',txt:'Investigation'},
   {id:'ph4',txt:'Containment'},{id:'ph5',txt:'Negotiation'},{id:'ph6',txt:'Eradication & recovery'},
   {id:'ph7',txt:'Notification & external reporting'},{id:'ph8',txt:'Post-incident'}]},
  {kind:'match',perm:[2,1,0],rperm:[1,0,2],opts:['Tabletop exercise','Simulation','Verification testing'],
   rows:[
    {id:'x1',txt:'Is decision authority clear at 02:00 on a public holiday?',ok:0},
    {id:'x2',txt:'Do staff actually report an injected phishing wave?',ok:1},
    {id:'x3',txt:'Do the offline backups actually restore?',ok:2}]}]},
 hints:['The draft\'s root cause is a person; yours must be a control. The six findings split cleanly: one root, three contributors, two symptoms.',
  'Control changes must be scheduled, ownable, and aimed at root cause + contributors — two of the six options change nothing.',
  'RCA: unpatched edge appliance, no SLA. Root: d1 · contributing: d2, d5, d6 · symptoms: d3, d4. Changes: z1–z4. Playbook order = the eight official headings. Exercises: authority → tabletop; injected phish → simulation; backup restore → verification testing.'],
 fb:{pass:'The capstone closes the loop: blameless RCA found the failing control; six findings became taxonomy (root / contributing / symptom — symptoms get monitored, contributors get controls); four changes are scheduled and ownable; the playbook skeleton runs the eight official headings in order; and each gap gets the right instrument — tabletop for decisions, simulation for execution under fire, verification testing for the backups FENNELFOX counted on. That is lessons learned that actually learn.',
  fail:'The traps: "annual refresher already budgeted" is the control that already failed to matter, and a name-and-shame policy teaches staff to hide clicks — the exact behavior that delayed detection here. Symptom findings (user, AV) get monitoring, not ownership of the fix.'}};