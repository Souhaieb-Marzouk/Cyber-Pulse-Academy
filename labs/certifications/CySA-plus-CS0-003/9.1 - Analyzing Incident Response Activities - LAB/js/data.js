/* ═══════════════════════════════════════════════════════════════════════════
   CyberLab — CompTIA CySA+ CS0-003 · Lesson 9.1 "Analyzing Incident Response
   Activities" — CONTENT DOSSIER (static port).

   This file is a 1:1 transplant of src/lib/irlab/content.ts (+ types.ts
   pillar metadata). All objectives, artifacts, quiz banks, hints, feedback
   strings, glossary and field notes are byte-identical to the original lab.
   Data only — logic lives in objectives.js / quiz.js, rendering in ui.js /
   app.js.

   COVERAGE INVENTORY → OBJECTIVE MAP (100% of the single input covered):
     IR lifecycle phase order ........ M1 / H9        Phase activities ................ M2 / H9
     Order of volatility ............. M3 / H2        Live vs offline + write blocker . M4 / H2
     Chain of custody + hashing ...... M4 / H2        Legal hold ...................... M4 / H2
     Data-source gaps (detection) .... M5 / H8        True vs false positives ......... M5 / H8
     Detection rule + over-tuning .... M6 / H8        Artifact correlation ............ M7 / H3
     Time offsets / NTP .............. M7 / H3        Attack chain / TTP mapping ...... M8 / H3
     Containment + trade-offs ........ M9 / H4        Eradication completeness ........ M10 / H5
     Restore source + validation ..... M11 / H6       Lessons learned ................. M12 / H7
     Preventive controls (M-IDs) ..... M12 / H7       Residual risk + reporting ....... H9

   ACCURACY: every ATT&CK ID below was verified against attack.mitre.org at
   build time of the ORIGINAL lab (see Field Notes in the Debrief station).
   ═══════════════════════════════════════════════════════════════════════════ */

(function (global) {
  'use strict';

  const STORAGE_KEY = 'cyberlab-cysa-cs0-003-l9-1-v1';
  const STATE_VERSION = 2;

  /* ───────────────────────── Pillars (types.ts) ─────────────────────────── */

  const PILLAR_META = {
    P1: { label: 'Understand', cls: 'badge-amber' },
    P2: { label: 'Recognize', cls: 'badge-teal' },
    P3: { label: 'Detect', cls: 'badge-rose' },
    P4: { label: 'Mitigate', cls: 'badge-emerald' },
  };

  /* ───────────────────────── Case & stations ────────────────────────────── */

  const CASE = {
    id: 'IR-2317',
    codename: 'BLACKROUTE',
    org: 'Meridian Freight Logistics',
    orgBlurb: 'Regional freight operator, ~800 staff, two data halls, payment processing runs on the core file server FSV-01.',
    classification: 'TRAINING SIMULATION — ALL DATA SYNTHETIC',
    brief: 'At 02:13 on night two, the backup agent on file server FSV-01 logged 5,400 files being rewritten with a ".blkrtn" extension in six minutes. Ransomware is encrypting Meridian\'s payment records. You are the on-call Incident Response Coordinator. The SOC declared the incident minutes ago; evidence is still warm and the clock is running.',
    stakes: [
      'Payment records on FSV-01',
      'One phished credential (dana.w)',
      'Attacker active ~16h before detonation',
      'Backups reachable from production',
    ],
    roster: [
      { id: 'you', name: 'You — IR Coordinator (badge IR-77)' },
      { id: 'okafor', name: 'R. Okafor — Forensics' },
      { id: 'chen', name: 'L. Chen — SOC Analyst' },
    ],
  };

  const STATIONS = [
    { id: 'case', n: '00', label: 'Case File', icon: 'file-text', tagline: 'The situation on arrival' },
    { id: 'prepare', n: '01', label: 'Prepare', icon: 'shield', tagline: 'Know the process before the storm' },
    { id: 'detect', n: '02', label: 'Detect', icon: 'bell-ring', tagline: 'Why did it stay quiet for 16 hours?' },
    { id: 'analyze', n: '03', label: 'Analyze', icon: 'microscope', tagline: 'Evidence bench · custody ledger · timeline wall' },
    { id: 'contain', n: '04', label: 'Contain', icon: 'flame', tagline: 'Stop the bleeding without burning evidence' },
    { id: 'eradicate', n: '05', label: 'Eradicate', icon: 'eraser', tagline: 'Close every foothold' },
    { id: 'recover', n: '06', label: 'Recover', icon: 'heart-pulse', tagline: 'Restore carefully, monitor constantly' },
    { id: 'debrief', n: '07', label: 'Debrief', icon: 'graduation-cap', tagline: 'Lessons learned & prevention' },
    { id: 'quiz', n: '08', label: 'Knowledge Check', icon: 'list-checks', tagline: 'Prove the mastery' },
  ];

  /* ───────────────────────── IR lifecycle phases ────────────────────────── */

  const PHASES = [
    {
      id: 'prepare',
      name: 'Preparation',
      blurb: 'Build the capability before anything happens: plans, playbooks and runbooks, tooling, logging baselines, contact lists, training.',
      activity: 'Establish playbooks, tooling and training before anything happens',
    },
    {
      id: 'detect',
      name: 'Detection',
      blurb: 'Spot the signal: alerts, user reports, threat hunting. Validate the event and escalate it into a declared incident.',
      activity: 'Validate the alert and declare an incident',
    },
    {
      id: 'analyze',
      name: 'Analysis',
      blurb: 'Establish what happened: scope, impact, attack chain, root cause. Collect the most volatile evidence first.',
      activity: 'Reconstruct the attack chain and determine scope and root cause',
    },
    {
      id: 'contain',
      name: 'Containment',
      blurb: 'Stop the spread: isolate hosts, disable accounts, block attacker infrastructure — balancing evidence preservation against business disruption.',
      activity: 'Isolate affected systems to stop the spread',
    },
    {
      id: 'eradicate',
      name: 'Eradication',
      blurb: 'Remove the attacker and every foothold: delete persistence, close the entry vector, rotate credentials, rebuild compromised systems.',
      activity: 'Remove persistence and attacker access',
    },
    {
      id: 'recover',
      name: 'Recovery',
      blurb: 'Return to business carefully: restore from verified clean backups, validate integrity, and monitor hard for re-infection.',
      activity: 'Restore from verified clean backups and monitor',
    },
    {
      id: 'rehearse',
      name: 'Rehearsal',
      blurb: 'CompTIA closes the loop here: tabletop exercises, simulations, and the lessons-learned review that feeds updated playbooks and controls.',
      activity: 'Run tabletop exercises and update the playbook',
    },
  ];

  const PHASE_ORDER_CANONICAL = PHASES.map(function (p) { return p.id; });

  /* Order of the tap-to-place pool on the Prepare station (stations-a). */
  const PHASE_POOL_ORDER = ['recover', 'analyze', 'prepare', 'rehearse', 'contain', 'detect', 'eradicate'];

  const NIST_COMPARE = [
    { model: 'CompTIA CS0-003', phases: 'Preparation · Detection · Analysis · Containment · Eradication · Recovery · Rehearsal' },
    { model: 'NIST SP 800-61', phases: 'Preparation · Detection & Analysis · Containment, Eradication & Recovery · Post-Incident Activity' },
    { model: 'SANS PICERL', phases: 'Preparation · Identification · Containment · Eradication · Recovery · Lessons Learned' },
  ];

  /* ───────────────────────── Artifacts (evidence) ───────────────────────── */

  const ARTIFACTS = [
    {
      id: 'A-PHISH', label: 'Mail gateway record', source: 'Mail gateway', time: '09:47', clock: 'UTC',
      detail: 'Message to finance clerk dana.w@meridianfreight.example, spoofed "IT Service Desk" sender, link to hxxps://portal-meridian-secure[.]com/sso (lookalike domain).',
      core: true, why: 'This is the entry vector — Initial Access (T1566.002).',
    },
    {
      id: 'A-VPN', label: 'VPN auth log', source: 'VPN gateway', time: '10:04', clock: 'UTC',
      detail: 'Successful vpn_login_success for dana.w from ASN AS-Hostivity — an origin never seen for this user; geo does not match her badge-ins.',
      core: true, why: 'Valid Accounts (T1078) — the phished credential reused over VPN.',
    },
    {
      id: 'A-DUMP', label: 'EDR process alert', source: 'EDR (JH-01)', time: '09:22', clock: 'agent clock: UTC\u22121',
      detail: 'rundll32.exe invoking comsvcs.dll MiniDump against lsass.exe on jump host JH-01.',
      core: true, why: 'OS Credential Dumping: LSASS Memory (T1003.001).',
    },
    {
      id: 'A-TASK', label: 'Windows Security 4698', source: 'SIEM (JH-01)', time: '10:26', clock: 'UTC',
      detail: 'Scheduled task "SysHealthSync" created on JH-01 under the svc_backup service account.',
      core: true, why: 'Scheduled Task (T1053.005) — persistence.',
    },
    {
      id: 'A-SMB', label: 'Share access log', source: 'EDR (FSV-01)', time: '10:38', clock: 'agent clock: UTC\u22121',
      detail: 'Bulk SMB writes from JH-01 to FSV-01 payment shares using svc_backup credentials.',
      core: true, why: 'SMB/Windows Admin Shares (T1021.002) — lateral movement.',
    },
    {
      id: 'A-ACCT', label: 'Windows Security 4720', source: 'SIEM (FSV-01)', time: '11:41', clock: 'UTC',
      detail: 'Local account "svc_patch" created and added to Administrators on FSV-01.',
      core: true, why: 'Create Account: Local Account (T1136.001) — persistence + privilege.',
    },
    {
      id: 'A-ENC', label: 'Backup agent log', source: 'Backup agent (FSV-01)', time: '02:13', clock: 'UTC',
      detail: '5,400 file-encryption events in 6 minutes across payment shares; ".blkrtn" extension; ransom note dropped.',
      core: true, why: 'Data Encrypted for Impact (T1486) — the detonation.',
    },
    {
      id: 'A-CLR', label: 'Windows Security 1102', source: 'SIEM (FSV-01)', time: '02:05', clock: 'UTC',
      detail: '"The audit log was cleared" on FSV-01, eight minutes before the encryption burst.',
      core: true, why: 'Log clearing right before impact — classic anti-forensics. (ATT&CK recently re-homed Clear Windows Event Logs — see Field Notes.)',
    },
    {
      id: 'A-MKTG', label: 'Ticket #8812', source: 'Helpdesk', time: '09:12', clock: 'UTC',
      detail: 'Marketing reports "email images not loading" on WS-MKT-03. AV flagged generic.PUP-licensing there the same morning.',
      core: false, why: 'Benign licensing tool + broken images on an untouched host — unrelated to the chain.',
    },
    {
      id: 'A-SCAN', label: 'NDR note', source: 'NDR sensor', time: '01:00', clock: 'UTC',
      detail: 'Nightly authenticated vulnerability scan from 10.20.4.9 (the scanning appliance) touched 340 hosts — by design.',
      core: false, why: 'Scheduled, authenticated scanning from a known appliance — noise, not intrusion.',
    },
    {
      id: 'A-PIP', label: 'Ticket #8790', source: 'Helpdesk', time: 'day 1', clock: 'UTC',
      detail: 'Contractor complains a pip install is slow on a build VM.',
      core: false, why: 'Build-VM grievance. No overlap with any compromised host.',
    },
    {
      id: 'A-PRT', label: 'Print queue error', source: 'LPT-03', time: '11:02', clock: 'UTC',
      detail: 'Print spooler stalled on the lobby printer; restarted by facilities.',
      core: false, why: 'A printer being a printer.',
    },
  ];

  /* Chain-mapping exercise (M8): 6 artifacts → techniques */
  const CHAIN_ARTIFACTS = [
    { id: 'A-PHISH', label: 'Lookalike-domain link in a spoofed IT email', hint: 'Delivery mechanism' },
    { id: 'A-VPN', label: 'Successful VPN login with phished credentials', hint: 'Abuse of a real account' },
    { id: 'A-DUMP', label: 'comsvcs.dll MiniDump against lsass.exe', hint: 'Memory scraped for secrets' },
    { id: 'A-TASK', label: 'Scheduled task "SysHealthSync" created', hint: 'Survives reboots' },
    { id: 'A-SMB', label: 'Bulk SMB writes from JH-01 to FSV-01', hint: 'Moving between hosts' },
    { id: 'A-ENC', label: '5,400 files rewritten with .blkrtn', hint: 'Business impact' },
  ];

  const CHAIN_TECHNIQUES = [
    { id: 'T1566.002', name: 'Phishing: Spearphishing Link', tactic: 'Initial Access' },
    { id: 'T1078', name: 'Valid Accounts', tactic: 'Defense Evasion, Persistence, Privilege Escalation, Initial Access' },
    { id: 'T1003.001', name: 'OS Credential Dumping: LSASS Memory', tactic: 'Credential Access' },
    { id: 'T1053.005', name: 'Scheduled Task/Job: Scheduled Task', tactic: 'Execution, Persistence, Privilege Escalation' },
    { id: 'T1021.002', name: 'Remote Services: SMB/Windows Admin Shares', tactic: 'Lateral Movement' },
    { id: 'T1486', name: 'Data Encrypted for Impact', tactic: 'Impact' },
    { id: 'T1190', name: 'Exploit Public-Facing Application', tactic: 'Initial Access' },
    { id: 'T1110', name: 'Brute Force', tactic: 'Credential Access' },
  ];

  const CHAIN_CORRECT = {
    'A-PHISH': 'T1566.002',
    'A-VPN': 'T1078',
    'A-DUMP': 'T1003.001',
    'A-TASK': 'T1053.005',
    'A-SMB': 'T1021.002',
    'A-ENC': 'T1486',
  };

  /* ───────────────────────── Volatility bench ───────────────────────────── */

  const VOLATILITY_ITEMS = [
    { id: 'V-RAM', label: 'RAM capture — JH-01 / FSV-01', sub: 'Running memory; gone seconds after power loss' },
    { id: 'V-PAGE', label: 'Swap / pagefile dump', sub: 'Paged-out secrets; dies with the machine' },
    { id: 'V-TEMP', label: 'Temp & cache files on the live system', sub: 'Malware droppings, short-lived' },
    { id: 'V-DISK', label: 'Full bit-level disk image', sub: 'Static; survives shutdown' },
    { id: 'V-LOGS', label: 'Export of central VPN & firewall logs', sub: 'Already off-box; stable' },
    { id: 'V-TAPE', label: 'Offsite tape backup from last night', sub: 'Archival media; lives for months' },
  ];
  const VOL_CANONICAL = VOLATILITY_ITEMS.map(function (v) { return v.id; });

  /* ───────────────────────── Detect station data ────────────────────────── */

  const ALERT_QUEUE = [
    {
      id: 'AL1', time: '10:26', src: 'EDR', sev: 'high',
      text: 'Suspicious scheduled task "SysHealthSync" created on JH-01 (process lineage: rundll32 → schtasks).',
    },
    {
      id: 'AL2', time: '09:12', src: 'Antivirus', sev: 'low',
      text: 'PUP: generic.licensing-tool quarantined on WS-MKT-03 (marketing workstation, CAD license manager).',
    },
    {
      id: 'AL3', time: '10:04', src: 'VPN gateway', sev: 'info',
      text: 'vpn_login_success — dana.w — source ASN AS-Hostivity (first use). Written to local VPN log only.',
    },
    {
      id: 'AL4', time: '02:13', src: 'Backup agent', sev: 'critical',
      text: 'Encryption burst on FSV-01 payment shares — .blkrtn extension — this is what finally woke the SOC.',
    },
  ];

  const GAP_OPTIONS = [
    { id: 'G1', text: 'VPN authentication logs are not ingested into the SIEM — no rule could ever fire on the 10:04 new-ASN login.' },
    { id: 'G2', text: 'Windows event 4720 (local account created) from member servers is not forwarded — "svc_patch" never tripped anything.' },
    { id: 'G3', text: 'The SOC has no network detection at all (no NDR/NetFlow collection).' },
    { id: 'G4', text: 'EDR is not deployed on any server.' },
  ];
  const GAP_CORRECT = ['G1', 'G2'];
  const FP_CORRECT = 'AL2';

  const RULE_FIELDS = ['—', 'event.type', 'source.asn', 'user.department', 'source.geo'];
  const RULE_OPS = ['—', 'is', 'is_not'];
  const RULE_VALUES = ['—', 'vpn_login_success', 'corporate_asn_64500', 'finance', 'outside_eu'];

  const RETRO_OPTIONS = [
    { id: 'D1', text: 'Ingest VPN auth logs into the SIEM and alert on logins from first-seen ASNs.' },
    { id: 'D2', text: 'Alert on Windows 4720/4726 (local accounts created/deleted) on all member servers.' },
    { id: 'D3', text: 'Correlate mail gateway + VPN + EDR events into one investigation timeline view.' },
    { id: 'D4', text: 'Alert on Windows 1102 (audit log cleared) on servers — it fired at 02:05, eight minutes before impact.' },
    { id: 'D5', text: 'Buy more antivirus licenses for every workstation.' },
    { id: 'D6', text: 'Disable remote VPN access permanently.' },
    { id: 'D7', text: 'Extend log retention from 90 to 365 days, nothing else.' },
  ];
  const RETRO_CORRECT = ['D1', 'D2', 'D3', 'D4'];

  /* ───────────────────────── Timeline wall ──────────────────────────────── */

  const TIMELINE_MEDIUM = [
    { id: 'E-PHISH', label: 'Phishing email delivered to dana.w', source: 'Mail gateway (UTC)', raw: '09:47', trueUtc: '09:47' },
    { id: 'E-VPN', label: 'VPN login success — dana.w — AS-Hostivity', source: 'VPN gateway (UTC)', raw: '10:04', trueUtc: '10:04' },
    { id: 'E-LSASS', label: 'LSASS dump via comsvcs.dll on JH-01', source: 'EDR agent (UTC\u22121)', raw: '09:22', trueUtc: '10:22' },
    { id: 'E-TASK', label: 'Scheduled task "SysHealthSync" on JH-01', source: 'SIEM forwarder (UTC)', raw: '10:26', trueUtc: '10:26' },
    { id: 'E-SMB', label: 'Bulk SMB writes JH-01 → FSV-01', source: 'EDR agent (UTC\u22121)', raw: '10:38', trueUtc: '11:38' },
    { id: 'E-ENC', label: 'Encryption burst on FSV-01 shares', source: 'Backup agent (UTC)', raw: '02:13', trueUtc: '02:13 (+1d)' },
  ];
  const TIMELINE_MEDIUM_CANONICAL = TIMELINE_MEDIUM.map(function (e) { return e.id; });

  const TIMELINE_HARD = TIMELINE_MEDIUM.slice(0, 5).concat([
    { id: 'E-C2', label: 'First C2 beacon JH-01 → panel', source: 'NDR sensor (clock skew +3 min)', raw: '13:12', trueUtc: '13:09' },
    { id: 'E-CLR', label: 'Security audit log cleared on FSV-01', source: 'SIEM forwarder (UTC)', raw: '02:05', trueUtc: '02:05 (+1d)' },
    { id: 'E-ENC', label: 'Encryption burst on FSV-01 shares', source: 'Backup agent (UTC)', raw: '02:13', trueUtc: '02:13 (+1d)' },
  ]);
  const TIMELINE_HARD_CANONICAL = ['E-PHISH', 'E-VPN', 'E-LSASS', 'E-TASK', 'E-SMB', 'E-C2', 'E-CLR', 'E-ENC'];

  const H3_PATIENTS = [
    { id: 'WS-FIN-14', label: 'WS-FIN-14 — Dana\'s finance workstation' },
    { id: 'JH-01', label: 'JH-01 — the jump host' },
    { id: 'FSV-01', label: 'FSV-01 — the file server' },
    { id: 'VPN-GW', label: 'The VPN gateway itself' },
  ];
  const H3_VECTORS = [
    { id: 'phish', label: 'Spearphishing link (T1566.002)' },
    { id: 'exploit', label: 'Exploited VPN appliance (T1190)' },
    { id: 'brute', label: 'Brute-forced RDP (T1110)' },
    { id: 'insider', label: 'Malicious insider' },
  ];
  const H3_DWELLS = [
    { id: 'd1', label: '14h 03m' },
    { id: 'd2', label: '16h 26m' },
    { id: 'd3', label: '17h 12m' },
    { id: 'd4', label: '22h 40m' },
  ];
  const H3_CLEARED = [
    { id: 'c1', label: 'FSV-01 Security audit log (event 1102, 02:05 UTC)' },
    { id: 'c2', label: 'JH-01 application log' },
    { id: 'c3', label: 'The VPN gateway auth log' },
    { id: 'c4', label: 'Nothing was cleared' },
  ];

  /* ───────────────────────── Containment console ────────────────────────── */

  const CONTAIN_ACTIONS = [
    { id: 'C-ISO', label: 'EDR network-isolate JH-01 and FSV-01', impact: 'Stops C2 + lateral movement; host stays powered (memory preserved)', good: true },
    { id: 'C-ACCT', label: 'Disable dana.w and the svc_backup service account', impact: 'Cuts re-authentication paths immediately', good: true },
    { id: 'C-C2', label: 'Block the attacker C2 domain and IPs at the firewall', impact: 'No user impact; blinds the operator', good: true },
    { id: 'C-SMB', label: 'Block east–west SMB between VLANs (segmentation)', impact: 'Slows spread to other servers', good: true },
    { id: 'C-POW', label: 'Pull the power on all servers right now', impact: 'Destroys RAM evidence; encryption already happened', good: false },
    { id: 'C-PAY', label: 'Pay the ransom to make it stop', impact: 'Not a control; funds crime; no guarantee', good: false },
    { id: 'C-REIM', label: 'Reimage everything immediately', impact: 'Destroys the evidence you still need to analyze', good: false },
    { id: 'C-WAIT', label: 'Wait until after business hours to act', impact: 'Gives the attacker hours of free movement', good: false },
  ];
  const CONTAIN_CORRECT = ['C-ISO', 'C-ACCT', 'C-C2', 'C-SMB'];

  const TRADEOFFS = [
    { id: 'T-PAY', label: 'Payment processing runs on FSV-01 and will go offline during isolation', good: true },
    { id: 'T-PRN', label: 'The lobby printers will pause', good: false },
    { id: 'T-NONE', label: 'None — containment has no business impact', good: false },
  ];

  /* Hard containment (H4) */
  const CONTAIN_SEQ_ITEMS = [
    { id: 'S1', label: 'Block the C2 domain/IPs at the firewall (zero user impact)' },
    { id: 'S2', label: 'Disable the compromised accounts (dana.w, svc_backup)' },
    { id: 'S3', label: 'Network-isolate JH-01 now (not payment-critical)' },
    { id: 'S4', label: 'At 17:30, after batch close — network-isolate FSV-01' },
    { id: 'S5', label: 'Capture RAM + bit-level disk image from the isolated FSV-01' },
  ];
  const CONTAIN_SEQ_CANONICAL = ['S1', 'S2', 'S3', 'S4', 'S5'];
  const CONTAIN_REJECTS = [
    { id: 'R-NOW', label: 'Isolate FSV-01 immediately, before the batch closes', why: 'No active encryption on FSV-01 yet — the agreed business window (17:30) exists exactly for this; breaching it without cause damages trust in IR decisions.' },
    { id: 'R-POW', label: 'Power off FSV-01 at 17:29 instead of network isolation', why: 'Powering off destroys volatile evidence; network isolation stops the attacker while keeping memory intact.' },
  ];

  /* ───────────────────────── Eradication board ──────────────────────────── */

  const ERAD_ACTIONS = [
    { id: 'E-TASK', label: 'Remove scheduled task "SysHealthSync" from JH-01 (and hunt for copies)', good: true },
    { id: 'E-ACCT', label: 'Delete the rogue local admin "svc_patch" on FSV-01', good: true },
    { id: 'E-CRED', label: 'Reset dana.w, svc_backup, and every credential used on or visible to JH-01', good: true },
    { id: 'E-MAIL', label: 'Purge the phishing message and block the lookalike domain at the mail gateway', good: true },
    { id: 'E-REBLD', label: 'Rebuild JH-01 and FSV-01 from known-good media', good: true },
    { id: 'E-AV', label: 'Run one quick AV scan on the file server and call it clean', good: false },
    { id: 'E-DEL', label: 'Delete the ransom note files to tidy up', good: false },
    { id: 'E-STOP', label: 'Close the case — the malware is gone', good: false },
    { id: 'E-FW', label: 'Disable the host firewall on all endpoints to "see traffic better"', good: false },
  ];
  const ERAD_CORRECT = ['E-TASK', 'E-ACCT', 'E-CRED', 'E-MAIL', 'E-REBLD'];

  /* Hard reinfection puzzle (H5) */
  const H5_ARTIFACTS = [
    { id: 'H5-A', text: 'Windows 4698 — scheduled task "SysHealthSync2" created on FSV-02 under svc_backup — 36h after JH-01/FSV-01 were rebuilt.' },
    { id: 'H5-B', text: 'Windows 4720/4728 — local account "svc_patch" re-created on FSV-02 and added to Administrators.' },
    { id: 'H5-C', text: 'VPN gateway — svc_backup used successfully from AS-Hostivity 30 minutes before the task creation.' },
  ];
  const H5_MISSED = [
    { id: 'H5-M1', label: 'The svc_backup service account — never reset, still valid everywhere' },
    { id: 'H5-M2', label: 'Rogue local admin "svc_patch" — still active in the domain' },
    { id: 'H5-M3', label: 'The rebuilt JH-01 — clean and patched' },
    { id: 'H5-M4', label: 'Dana\'s workstation — reimaged on day one' },
  ];
  const H5_STEPS = [
    { id: 'H5-S1', label: 'Credential rotation scope was too narrow — svc_backup was never reset' },
    { id: 'H5-S2', label: 'Not enough antivirus scans were run' },
    { id: 'H5-S3', label: 'The rebuild used the wrong Windows version' },
    { id: 'H5-S4', label: 'The ransom note was deleted too early' },
  ];

  /* ───────────────────────── Recovery console ───────────────────────────── */

  const RESTORE_SOURCES = [
    {
      id: 'R-SAN', label: 'Newest snapshot on the shared NAS', detail: 'Timestamp: 01:50 last night — attached to production during the incident.',
      good: false, why: 'The NAS was reachable while the attacker held credentials; treat as poisoned.',
    },
    {
      id: 'R-OFF', label: 'Offline vault backup — 2 days ago', detail: 'Immutable copy, air-gapped, SHA-256 hash logged at vault time.',
      good: true, why: 'Offline + verified integrity + predates compromise. The defensible choice.',
    },
    {
      id: 'R-LOC', label: 'Local backup folder on FSV-01', detail: 'Handy — it is right there on the encrypted host.',
      good: false, why: 'On the compromised host; attacker-controlled territory.',
    },
  ];

  const RECOVERY_STEPS = [
    { id: 'RS1', label: 'Verify the backup\'s SHA-256 hash against the vault record' },
    { id: 'RS2', label: 'Restore data onto rebuilt, patched systems' },
    { id: 'RS3', label: 'EDR/AV scan + open sample files to validate integrity' },
    { id: 'RS4', label: 'Return services to production with enhanced monitoring' },
    { id: 'RS5', label: 'Watch for re-infection indicators for 14 days' },
  ];
  const RECOVERY_STEPS_CANONICAL = ['RS1', 'RS2', 'RS3', 'RS4', 'RS5'];

  /* Hard recovery (H6) */
  const H6_SOURCES = RESTORE_SOURCES.concat([
    {
      id: 'R-VEN', label: 'Vendor "overnight restore"', detail: 'Vendor restored to staging overnight; "looks fine"; no hashes available.',
      good: false, why: 'No integrity proof; timestamps are trivially forged; "looks fine" is not verification.',
    },
  ]);
  const H6_STEPS = [
    { id: 'HS1', label: 'Verify hash of the vault backup' },
    { id: 'HS2', label: 'Compare backup index/catalog against the restore manifest' },
    { id: 'HS3', label: 'Restore onto rebuilt, fully patched hosts' },
    { id: 'HS4', label: 'Full EDR/AV scan + open sample payment files' },
    { id: 'HS5', label: 'Functional test — dry-run the payment batch' },
    { id: 'HS6', label: 'Enable enhanced monitoring, then return to production' },
  ];
  const H6_STEPS_CANONICAL = ['HS1', 'HS2', 'HS3', 'HS4', 'HS5', 'HS6'];
  const H6_REJECTS = [
    { id: 'HR-SKIP', label: 'Skip the hash — the vendor vouched for the copy', why: 'Vouching is not verification. Unprovable integrity undermines the whole restoration — and any legal use.' },
    { id: 'HR-FAST', label: 'Restore straight to production to save a day', why: 'Restoring to unrebuilt, unmonitored systems is how day-36 re-infections happen.' },
  ];

  /* ───────────────────────── Debrief / prevention ───────────────────────── */

  const ROOT_CAUSES = [
    { id: 'RC1', text: 'A clerk entered corporate credentials on a lookalike site.' },
    { id: 'RC2', text: 'The VPN accepted a password as the only factor.' },
    { id: 'RC3', text: 'One flat network let a jump host reach payment shares directly.' },
    { id: 'RC4', text: 'Backups were reachable from production accounts.' },
  ];

  const CONTROL_OPTIONS = [
    { id: 'M1017', label: 'M1017 — User Training', good: true },
    { id: 'M1032', label: 'M1032 — Multi-factor Authentication', good: true },
    { id: 'M1030', label: 'M1030 — Network Segmentation', good: true },
    { id: 'M1053', label: 'M1053 — Data Backup', good: true },
    { id: 'M1021', label: 'M1021 — Restrict Web-Based Content', good: true },
    { id: 'M1049', label: 'M1049 — Antivirus/Antimalware', good: false },
    { id: 'M1041', label: 'M1041 — Encrypt Sensitive Information', good: false },
    { id: 'M1027', label: 'M1027 — Password Policies', good: false },
  ];

  const LESSON_CORRECT = { RC1: 'M1017', RC2: 'M1032', RC3: 'M1030', RC4: 'M1053' };

  /* Hard prevention roadmap (H7) */
  const H7_ROOT_CAUSES = [
    { id: 'HC1', text: 'Credential phish succeeded (no user readiness).', ctrl: 'M1017' },
    { id: 'HC2', text: 'VPN had a single factor.', ctrl: 'M1032' },
    { id: 'HC3', text: 'Flat network — lateral movement was trivial.', ctrl: 'M1030' },
    { id: 'HC4', text: 'Lookalike domains reachable from the corporate network.', ctrl: 'M1021' },
    { id: 'HC5', text: 'Backups reachable from production.', ctrl: 'M1053' },
  ];
  const H7_RANK_CANONICAL = ['M1021', 'M1032', 'M1053', 'M1030', 'M1017'];
  const H7_RANK_RATIONALE = {
    M1021: 'Minutes: block the lookalike domain (and similar registrations) at the proxy/DNS today.',
    M1032: 'Days: roll MFA to remote access first — kills credential reuse as a technique.',
    M1053: 'Days–weeks: stand up an offline/immutable backup copy out of production\'s reach.',
    M1030: 'Weeks: segmentation project — move payment shares behind controlled access.',
    M1017: 'Continuous: training matures over months; run a phishing simulation this quarter.',
  };

  /* Hard final report (H9) */
  const H9_ACTIONS = [
    { id: 'H9-A1', label: 'Validated the 02:13 backup-agent alert and declared a P1 incident' },
    { id: 'H9-A2', label: 'Captured RAM from JH-01 before any reboot' },
    { id: 'H9-A3', label: 'Network-isolated FSV-01 after batch close' },
    { id: 'H9-A4', label: 'Deleted "SysHealthSync" and the rogue "svc_patch" account' },
    { id: 'H9-A5', label: 'Restored the hash-verified vault backup onto rebuilt hosts and watched for 14 days' },
    { id: 'H9-A6', label: 'Scheduled a tabletop exercise for the payment-team compromise scenario' },
  ];
  const H9_PHASE_OPTIONS = [
    { id: 'detect', label: 'Detection' },
    { id: 'analyze', label: 'Analysis' },
    { id: 'contain', label: 'Containment' },
    { id: 'eradicate', label: 'Eradication' },
    { id: 'recover', label: 'Recovery' },
    { id: 'rehearse', label: 'Rehearsal' },
  ];
  const H9_PHASE_CORRECT = {
    'H9-A1': 'detect',
    'H9-A2': 'analyze',
    'H9-A3': 'contain',
    'H9-A4': 'eradicate',
    'H9-A5': 'recover',
    'H9-A6': 'rehearse',
  };
  const H9_ROOTS = [
    { id: 'H9-R1', label: 'A zero-day exploit in the VPN appliance' },
    { id: 'H9-R2', label: 'One phished credential + no MFA + a flat network + production-reachable backups' },
    { id: 'H9-R3', label: 'Deliberate insider sabotage by a finance employee' },
    { id: 'H9-R4', label: 'An unpatched file server exploited remotely' },
  ];
  const H9_RISKS = [
    {
      id: 'H9-K1',
      label: 'Risk reduced, not eliminated: MFA + segmentation verified, offline backups in place, residual risk documented, tabletop scheduled, lookalike registrations monitored',
      good: true,
    },
    { id: 'H9-K2', label: 'Risk fully eliminated — the case is closed forever', good: false },
    { id: 'H9-K3', label: 'No further action needed — we were just unlucky this time', good: false },
  ];

  /* ───────────────────────── Quiz ───────────────────────────────────────── */

  const QUIZ_MEDIUM = [
    {
      id: 'MQ1',
      prompt: 'You get 10 minutes alone with a live, infected server. Per the order of volatility, what do you collect FIRST?',
      options: ['The firewall log export', 'The disk image', 'The offsite tape backup', 'A RAM capture'],
      correct: 3,
      explanation: 'Order of volatility (RFC 3227): collect the most fleeting evidence first. RAM dies seconds after power loss; tapes and even disk survive shutdown. Memory first, then pagefile/temp, then disk, then remotely logged data, then archival media.',
    },
    {
      id: 'MQ2',
      prompt: 'What is the chain of custody for?',
      options: [
        'Tracking disk space used by evidence copies',
        'Listing which analyst works which shift',
        'Documenting every person and transfer of an evidence item so integrity is provable',
        'Encrypting evidence at rest',
      ],
      correct: 2,
      explanation: 'Chain of custody records who collected, handled, transferred, and stored each item, when, and why. Break the chain and the defense can challenge the evidence\'s integrity — in court or in an HR hearing.',
    },
    {
      id: 'MQ3',
      prompt: '"Restore from the verified vault backup onto rebuilt hosts and monitor for 14 days." Which phase is this?',
      options: ['Recovery', 'Eradication', 'Containment', 'Analysis'],
      correct: 0,
      explanation: 'That is Recovery/Restoration: returning systems to production from trusted sources, validating, and watching for re-infection. Eradication removes the footholds; recovery brings the business back safely.',
    },
    {
      id: 'MQ4',
      prompt: 'Why is "pull the plug" usually the WRONG first response to a live compromise?',
      options: [
        'It voids the hardware warranty',
        'It destroys volatile memory evidence and any chance to capture keys or malware state',
        'It triggers the ransomware faster',
        'It is slower than reimaging',
      ],
      correct: 1,
      explanation: 'Power loss wipes RAM — often the richest evidence source and sometimes the only place attacker tooling is recoverable. Containment is network isolation or account disablement, not a power switch.',
    },
    {
      id: 'MQ5',
      prompt: 'Which item belongs in a lessons-learned (post-incident) report?',
      options: [
        'The name of the employee who clicked, for blame',
        'The attacker\'s full tooling for reuse',
        'Nothing — the case is closed',
        'Updated playbooks and controls mapped to root causes',
      ],
      correct: 3,
      explanation: 'Lessons learned turn the incident into prevention: root-cause findings, control gaps, updated playbooks/runbooks, training, and detection improvements — blame-free and specific.',
    },
    {
      id: 'MQ6',
      prompt: 'Your EDR agent\'s clock is one hour behind the VPN gateway\'s. What must you do before correlating?',
      options: [
        'Trust the EDR clock — endpoints are more accurate',
        'Average the two clocks',
        'Normalize all timestamps to one reference (e.g., UTC/NTP) before sequencing',
        'Ignore timestamps entirely',
      ],
      correct: 2,
      explanation: 'Uncorrected clock offsets corrupt timelines and can invert cause and effect. Sync sources to NTP, note each source\'s offset, normalize to UTC, then correlate. Time integrity is evidence integrity.',
    },
  ];

  const QUIZ_HARD = [
    {
      id: 'HQ1',
      prompt: '02:10 — encryption is running on FSV-01 and the NAS backup job is still writing to it. Your first TWO actions?',
      options: [
        'Power off FSV-01, then call the backup vendor',
        'Pay the ransom, then reimage everything',
        'Wait for a full forensics report before touching anything',
        'Network-isolate the affected hosts, then block the C2 infrastructure at the firewall',
      ],
      correct: 3,
      explanation: 'Stop the spread (network isolation keeps the machine up — memory intact) and cut the operator (C2 block). Powering off destroys evidence; paying is not a control; waiting lets it finish the job.',
    },
    {
      id: 'HQ2',
      prompt: 'An analyst imaged the disk without a write blocker. The defense challenges the evidence. Consequence?',
      options: [
        'Nothing — images are images',
        'Only the analyst is fined',
        'Integrity cannot be proven; the evidence\'s weight and admissibility are seriously damaged',
        'The image gets a new hash and becomes valid again',
      ],
      correct: 2,
      explanation: 'A write blocker guarantees the source is never mutated. Without one, you cannot prove the copy equals the original — and a broken chain of custody or integrity proof can sink the case.',
    },
    {
      id: 'HQ3',
      prompt: 'The EDR log shows the LSASS dump at 09:22; the VPN gateway shows the login at 10:04. The EDR clock is UTC\u22121. True sequence?',
      options: [
        'Normalize to UTC: the dump is 10:22 — AFTER the 10:04 login',
        'Dump first, then VPN login',
        'Average the times and call it 09:43',
        'Sequence is unknowable',
      ],
      correct: 0,
      explanation: 'Normalize every source to one reference clock first. 09:22 agent-local = 10:22 UTC — the dump followed the VPN login by 18 minutes, which matches the kill chain. Unnormalized, you would have inverted cause and effect.',
    },
    {
      id: 'HQ4',
      prompt: 'A vendor restored your backup overnight: "it looks fine" — but no hashes are available. Accept it for production restore?',
      options: [
        'Yes — vendors are trustworthy',
        'No — verify integrity independently; timestamps can be forged and "looks fine" is not verification',
        'Yes, but only on the weekend',
        'Only if the file sizes match',
      ],
      correct: 1,
      explanation: 'Restoration integrity is provable or it is not. Hash against the vault record, compare catalogs, scan and test — a poisoned backup that "looks fine" is how day-36 re-infections happen.',
    },
    {
      id: 'HQ5',
      prompt: 'Eradication was "signed off". 36 hours later the same service account creates a scheduled task on FSV-02. The most likely miss?',
      options: [
        'Not enough antivirus scans',
        'The wrong Windows build was deployed',
        'The ransom notes were deleted',
        'Credential rotation scope was too narrow — a compromised account was never reset, and a foothold survived',
      ],
      correct: 3,
      explanation: 'Re-infection with the same identity means a foothold survived: an unreset credential or missed persistence. Eradication must cover EVERY credential the attacker saw and EVERY persistence mechanism — then verify.',
    },
    {
      id: 'HQ6',
      prompt: 'FSV-01 (payment host) starts ACTIVELY encrypting at 16:45 — the agreed isolation window was 17:30. What wins?',
      options: [
        'Active encryption overrides the window — isolate now, then notify the business owner',
        'The 17:30 window — business agreements are absolute',
        'Power off the host instead — it is faster',
        'Wait for the ransom note before acting',
      ],
      correct: 0,
      explanation: 'The window governed precautionary isolation. With active encryption in progress, the calculus changes: contain immediately (network isolation, not power-off), and inform the business in parallel. Judgment plus communication is the IR skill.',
    },
    {
      id: 'HQ7',
      prompt: 'Post-incident, leadership asks: "Are we safe now?" Best answer?',
      options: [
        '"Yes — we removed the malware."',
        '"No one can ever be safe."',
        '"Risk is reduced, not eliminated: here are the verified controls, the residual risks, and the rehearsed plan for next time."',
        '"We will know in a year."',
      ],
      correct: 2,
      explanation: 'Honest IR communication: state what was verified (MFA, segmentation, offline backups), name residual risk, and show the continuous-improvement loop (lessons learned → playbook updates → rehearsal).',
    },
  ];

  /* ───────────────────────── Glossary ───────────────────────────────────── */

  const GLOSSARY = [
    { term: 'Incident', def: 'An event that actually or potentially harms (or implicates) the confidentiality, integrity, or availability of systems or data — declared after validation.' },
    { term: 'IOC (Indicator of Compromise)', def: 'An observable artifact tied to malicious activity: a lookalike domain, a hash, a first-seen ASN, a scheduled-task name.' },
    { term: 'Order of volatility', def: 'Evidence collection sequence: capture the most fleeting data first (RAM) and the most durable last (archival media). From RFC 3227.' },
    { term: 'Chain of custody', def: 'The documented, unbroken record of who handled an evidence item, when, where, and why — the backbone of evidence integrity.' },
    { term: 'Forensic image', def: 'A bit-for-bit copy of a disk or volume, taken so analysis happens on the copy and the original is untouched.' },
    { term: 'Write blocker', def: 'Hardware or software that lets you read a source while guaranteeing nothing is written to it.' },
    { term: 'Live acquisition', def: 'Collecting evidence (RAM, running process state) from a powered-on system, before any shutdown.' },
    { term: 'Legal hold', def: 'A directive to preserve records and evidence that may be relevant to legal or insurance proceedings.' },
    { term: 'Time offset / clock skew', def: 'The difference between a log source\'s clock and true time; must be normalized (ideally via NTP/UTC) before correlation.' },
    { term: 'Containment', def: 'Limiting the damage of an active incident — isolation, account disablement, C2 blocking — while preserving evidence.' },
    { term: 'Eradication', def: 'Removing the attacker and their footholds: persistence, rogue accounts, entry vectors, compromised credentials.' },
    { term: 'Recovery / restoration', def: 'Returning systems to production from verified clean sources, with validation and monitoring for re-infection.' },
    { term: 'Lessons learned', def: 'The blame-free post-incident review that converts findings into updated playbooks, controls, and detection rules.' },
    { term: 'Tabletop exercise (rehearsal)', def: 'A facilitated walk-through of an incident scenario to practice roles and decisions before the real thing.' },
    { term: 'Playbook & runbook', def: 'Pre-approved response procedures: the playbook is the strategy per scenario; the runbook is the step-by-step execution.' },
  ];

  /* ───────────────────────── Field notes (C6) ───────────────────────────── */

  const FIELD_NOTES = {
    detections: [
      { source: 'VPN / IdP auth logs', logic: 'alert when vpn_login_success AND source.asn not in (corporate ASNs, user\'s known ASNs)' },
      { source: 'Windows Security 4698/4699', logic: 'alert on scheduled-task creation on servers, outside change windows' },
      { source: 'Windows Security 4720/4728', logic: 'alert on local account creation or group membership change on member servers' },
      { source: 'Windows Security 1102', logic: 'alert when the audit log is cleared on any server — hours before impact here' },
      { source: 'EDR process events', logic: 'alert on lsass handle access from non-system binaries (e.g., comsvcs.dll MiniDump)' },
      { source: 'Backup agent / file telemetry', logic: 'alert on bulk file-rename rate spikes (ransomware canary)' },
    ],
    mitigations: [
      { id: 'M1017', name: 'User Training', note: 'Phishing recognition + reporting reflex.' },
      { id: 'M1032', name: 'Multi-factor Authentication', note: 'Kills the stolen-password path into the network.' },
      { id: 'M1030', name: 'Network Segmentation', note: 'A jump host must never talk straight to payment shares.' },
      { id: 'M1053', name: 'Data Backup', note: 'Offline/immutable copies, outside production reach.' },
      { id: 'M1021', name: 'Restrict Web-Based Content', note: 'Block known lookalike domains at proxy/DNS.' },
      { id: 'M1026', name: 'Privileged Account Management', note: 'Service accounts least-privilege, no interactive logins.' },
    ],
    blue: [
      'Detection is a data-coverage problem first: two log sources missing = 16 blind hours.',
      'Containment ≠ shutdown. Network isolation preserves the evidence you will need.',
      'Eradication is only complete when every credential the attacker could see is rotated.',
      'Recovery trust is earned by hashes and tests, never by "it looks fine".',
    ],
    red: [
      'One phished password beat the perimeter — because it was the only factor on the VPN.',
      'Living off valid accounts (T1078) blends in; only baseline anomalies gave it away.',
      'Flat networks turn one host into the whole estate.',
      'Reaching the backups from production turns recovery into a second incident.',
    ],
    links: [
      { label: 'ATT&CK — Phishing: Spearphishing Link (T1566.002)', href: 'https://attack.mitre.org/techniques/T1566/002/' },
      { label: 'ATT&CK — Valid Accounts (T1078)', href: 'https://attack.mitre.org/techniques/T1078/' },
      { label: 'ATT&CK — OS Credential Dumping: LSASS Memory (T1003.001)', href: 'https://attack.mitre.org/techniques/T1003/001/' },
      { label: 'ATT&CK — Scheduled Task/Job (T1053.005)', href: 'https://attack.mitre.org/techniques/T1053/005/' },
      { label: 'ATT&CK — SMB/Windows Admin Shares (T1021.002)', href: 'https://attack.mitre.org/techniques/T1021/002/' },
      { label: 'ATT&CK — Data Encrypted for Impact (T1486)', href: 'https://attack.mitre.org/techniques/T1486/' },
      { label: 'ATT&CK — Enterprise Mitigations index', href: 'https://attack.mitre.org/mitigations/enterprise/' },
      { label: 'NIST SP 800-61 — Computer Security Incident Handling Guide', href: 'https://csrc.nist.gov/pubs/sp/800/61/r2/final' },
    ],
    accuracyNote: 'Accuracy note: this lab\'s ATT&CK IDs were verified against attack.mitre.org at build time. ATT&CK keeps evolving — "Clear Windows Event Logs" moved from T1070.001 (Indicator Removal) to T1685.005 (Disable or Modify Tools) in a 2025 release. Re-verify IDs when you cite them.',
  };

  /* ───────────────────────── Knowledge core ─────────────────────────────── */

  const KNOWLEDGE_CORE = {
    what: 'Incident response activities are the actions taken once an incident is detected to limit damage and prevent recurrence: evidence collection, incident analysis, restoration, and preventive measures. Done well, they shrink an attacker\'s dwell time from months to hours — the difference between one encrypted server and a company-wide outage.',
    whyFast: 'Attackers fear fast IR because it breaks their economics: automation-heavy intrusions (like the Blackroute chain) need hours of undisturbed access to move laterally and stage encryption. Every minute of containment delay raises the attacker\'s odds and the responder\'s restore cost.',
    chainIntro: 'The chain you will investigate — every ID below verified against attack.mitre.org:',
    parallels: [
      'Wizard Spider (G0102) — big-game ransomware intrusions built on credential theft and SMB lateral movement, exactly the Blackroute shape.',
      'FIN7 (G0046) — phishing-led intrusions that abuse valid accounts and living-off-the-land tooling.',
    ],
    evidencePrimer: 'Defensible collection in one breath: capture in volatility order, document every hand-off (chain of custody), hash everything, image bit-for-bit through a write blocker, apply a legal hold when lawyers may care, and normalize clocks before you correlate.',
    restorePrimer: 'Restoration is a trust problem: restore only from sources you can prove are clean (offline, hash-verified, pre-incident), onto systems you can prove are rebuilt, with monitoring that would catch a re-run.',
    preventPrimer: 'Prevention is the lessons-learned loop: map each root cause to a control with an official mitigation ID, fix by time-to-protect, then rehearse — CompTIA\'s seventh step exists so the next incident finds you ready.',
  };

  /* ───────────────────────── Objectives ─────────────────────────────────── */

  const OBJECTIVES = [
    /* ── MEDIUM (12) ── */
    {
      id: 'M1', mode: 'medium', station: 'prepare', pillar: 'P1',
      title: 'Sequence the seven incident-response steps in the correct order.',
      anchor: 'CS0-003 process model (Preparation → Rehearsal)',
      hints: [
        'The first step happens before any incident exists — it builds the capability.',
        'After Detection comes understanding, then damage control, then removal.',
        'Canonical order: Preparation → Detection → Analysis → Containment → Eradication → Recovery → Rehearsal.',
      ],
    },
    {
      id: 'M2', mode: 'medium', station: 'prepare', pillar: 'P1',
      title: 'Match each step to its primary activity.',
      anchor: 'Phase activities (CS0-003 4.1)',
      hints: [
        'Two steps happen before anyone "does" anything to systems — the build-up and the noticing.',
        'Containment limits; Eradication removes; Recovery returns.',
        'Match on the verb: build / validate / reconstruct / isolate / remove / restore / rehearse.',
      ],
    },
    {
      id: 'M5', mode: 'medium', station: 'detect', pillar: 'P3',
      title: 'Explain the 16-hour silence: pick the two data-source gaps and flag the false positive.',
      anchor: 'CS0-003 detection data sources; TP vs FP',
      hints: [
        'The VPN login and the rogue account never triggered anything — what data would a rule have needed?',
        'Gaps are about data that never reached the SIEM — not about tools the org lacks.',
        'Gaps: VPN logs not ingested (G1) and 4720 events not forwarded (G2). The false positive is the AV licensing alert (AL2).',
      ],
    },
    {
      id: 'M6', mode: 'medium', station: 'detect', pillar: 'P3',
      title: 'Build the detection rule that would have flagged the 10:04 VPN login.',
      anchor: 'Detection engineering: specific but not over-tuned',
      hints: [
        'The signal is: a VPN success from an origin that is not the corporate ASN.',
        'Leave the third slot empty — a rule pinned to one department misses every other user hit by the same campaign.',
        'Slot 1: event.type is vpn_login_success. Slot 2: source.asn is_not corporate_asn_64500. Slot 3: empty.',
      ],
    },
    {
      id: 'M3', mode: 'medium', station: 'analyze', pillar: 'P2',
      title: 'Order the evidence queue by volatility — most volatile first.',
      anchor: 'Order of volatility (RFC 3227)',
      hints: [
        'Ask of each item: how quickly does it disappear if I do nothing?',
        'Memory dies in seconds; off-box logs and tapes last far longer.',
        'RAM → pagefile → temp/cache → disk image → central logs → offsite tape.',
      ],
    },
    {
      id: 'M4', mode: 'medium', station: 'analyze', pillar: 'P2',
      title: 'Make the acquisition defensible: choose the approach, apply the hold, complete the custody ledger.',
      anchor: 'Chain of custody; live vs offline acquisition; legal hold; hashing',
      hints: [
        'The server is still running — what exists ONLY in memory right now?',
        'A defensible copy is bit-level, write-blocked, and hash-verified — and its handling is documented.',
        'Approach: capture RAM first, then a write-blocked bit-level image. Legal hold: ON. Collector: you. Tag: IR-2317-RAM-01. Integrity: SHA-256 + verify after transfer. Why: proves the copy is bit-identical.',
      ],
    },
    {
      id: 'M7', mode: 'medium', station: 'analyze', pillar: 'P2',
      title: 'Rebuild the true timeline by correcting the clock offsets.',
      anchor: 'Time normalization / NTP; artifact correlation',
      hints: [
        'Two sources lie by one hour. Convert everything to true UTC first, then order.',
        'EDR agent stamps 09:22 → that is really 10:22 UTC. The raw times are bait.',
        'True order: 09:47 phish → 10:04 VPN → 10:22 LSASS → 10:26 task → 11:38 SMB → 02:13 encryption.',
      ],
    },
    {
      id: 'M8', mode: 'medium', station: 'analyze', pillar: 'P1',
      title: 'Map each artifact to the ATT&CK technique it evidences.',
      anchor: 'Attack chain (verified ATT&CK IDs)',
      hints: [
        'Match the behavior, not the tool name: what did the attacker achieve with this artifact?',
        'Two distractors (T1190, T1110) describe ways in that were NOT used here.',
        'Phish→T1566.002, VPN→T1078, dump→T1003.001, task→T1053.005, SMB→T1021.002, encryption→T1486.',
      ],
    },
    {
      id: 'M9', mode: 'medium', station: 'contain', pillar: 'P4',
      title: 'Select the containment actions — and the trade-off you must flag to the business.',
      anchor: 'Containment strategies and business trade-offs',
      hints: [
        'Good containment stops attacker movement while keeping evidence intact — four actions qualify.',
        'Reject anything that destroys evidence, rewards the attacker, or surrenders time.',
        'Pick C-ISO, C-ACCT, C-C2, C-SMB; flag the payment-processing outage (T-PAY).',
      ],
    },
    {
      id: 'M10', mode: 'medium', station: 'eradicate', pillar: 'P4',
      title: 'Build the eradication checklist that closes every foothold.',
      anchor: 'Eradication: persistence, credentials, entry vector, rebuild',
      hints: [
        'Five actions. Cover: the persistence, the rogue account, the credentials, the entry vector, the systems.',
        'A "quick scan" or "closing the case" is not eradication — completeness is.',
        'E-TASK, E-ACCT, E-CRED, E-MAIL, E-REBLD.',
      ],
    },
    {
      id: 'M11', mode: 'medium', station: 'recover', pillar: 'P4',
      title: 'Choose the restore source you can defend, then order the recovery validation.',
      anchor: 'Restoration: trusted sources + validation before production',
      hints: [
        'Which source was BOTH out of the attacker\'s reach AND provably intact?',
        'Verification happens before restore, restore happens on rebuilt systems, monitoring continues after.',
        'Source: offline vault (R-OFF). Order: hash → restore → scan/validate → production + monitoring → 14-day watch.',
      ],
    },
    {
      id: 'M12', mode: 'medium', station: 'debrief', pillar: 'P4',
      title: 'Turn each root cause into its preventive control.',
      anchor: 'Lessons learned → official mitigation IDs',
      hints: [
        'One control per root cause, matched by mechanism — two options are decoys that would not have stopped this chain.',
        'Training fixes people; MFA fixes stolen passwords; segmentation fixes reach; backup design fixes recovery.',
        'RC1→M1017, RC2→M1032, RC3→M1030, RC4→M1053.',
      ],
    },
    /* ── HARD (9) ── */
    {
      id: 'H1', mode: 'hard', station: 'detect', pillar: 'P2',
      title: 'Triage the intake queue: keep what belongs to Case IR-2317, discard the rest.',
      anchor: 'Evidence relevance; IOC recognition among noise and red herrings',
      hints: [
        'Keep artifacts that connect to the kill chain: the phish, the VPN abuse, the dumping, the persistence, the movement, the detonation, the log clearing.',
        'Four intake artifacts are noise: the marketing ticket (licensing PUP + broken email images), the nightly scanner, the slow pip install, and the printer.',
        'Keep the 8 core artifacts (A-PHISH … A-CLR); discard A-MKTG, A-SCAN, A-PIP, A-PRT.',
      ],
    },
    {
      id: 'H8', mode: 'hard', station: 'detect', pillar: 'P3',
      title: 'Choose the detection improvements that would have cut the 16-hour dwell.',
      anchor: 'Detection engineering retro: data sources + rule tuning',
      hints: [
        'Four improvements are real coverage gains; three are noise, overreaction, or retention theater.',
        'You need the two missing data sources, the correlation view, and the 1102 alert.',
        'D1, D2, D3, D4.',
      ],
    },
    {
      id: 'H2', mode: 'hard', station: 'analyze', pillar: 'P2',
      title: 'Run a defensible acquisition under vendor pressure: order, first capture, shortcut rejection, custody.',
      anchor: 'Volatility order; live acquisition; write blockers; custody + hashing',
      hints: [
        'Four parts. Part 1 reuses the volatility order; part 2 asks what exists only in memory.',
        'A LUN clone without a write blocker mutates the source — indefensible no matter who does it.',
        'First capture: RAM (keys + malware state). Rejected shortcut: the un-write-blocked LUN clone. Custody: you / IR-2317-RAM-01 / SHA-256 + verify.',
      ],
    },
    {
      id: 'H3', mode: 'hard', station: 'analyze', pillar: 'P2',
      title: 'Reconstruct the full timeline from five misaligned sources and answer the four case questions.',
      anchor: 'Correlation + clock offsets (UTC−1, +3 min skew); chain reconstruction',
      hints: [
        'Normalize first: EDR stamps are UTC−1; the NDR sensor runs 3 minutes fast. Then order 8 events.',
        'Dwell time runs from the phish (09:47 UTC) to the encryption burst (02:13 UTC next day).',
        'Order: phish, VPN, LSASS(10:22), task, SMB(11:38), C2(13:09), log-clear(02:05), encryption(02:13). Patient zero: WS-FIN-14. Vector: spearphishing link. Dwell: 16h 26m. Cleared: FSV-01 Security log (1102, 02:05 UTC).',
      ],
    },
    {
      id: 'H4', mode: 'hard', station: 'contain', pillar: 'P4',
      title: 'Sequence containment around the payment window — and reject the two near-misses.',
      anchor: 'Containment sequencing; business trade-offs under constraint',
      hints: [
        'Sequence by impact: actions with zero user impact first; the payment host waits for the agreed 17:30 window.',
        'Evidence capture happens safely AFTER isolation, not before it.',
        'Order: C2 block → disable accounts → isolate JH-01 → isolate FSV-01 at 17:30 → capture RAM/disk. Reject: immediate FSV-01 isolation (window agreed, no active encryption) and power-off (destroys memory).',
      ],
    },
    {
      id: 'H5', mode: 'hard', station: 'eradicate', pillar: 'P4',
      title: 'Explain the re-infection: find the two missed footholds and the skipped step.',
      anchor: 'Eradication completeness: credential rotation scope + persistence sweep',
      hints: [
        'What identity created the new task on FSV-02 — and was it ever rotated?',
        'One missed foothold is an account; one is a rogue privilege. The step that was skipped is about scope.',
        'Missed: svc_backup never reset (H5-M1) and "svc_patch" still active (H5-M2). Skipped step: credential rotation scope too narrow (H5-S1).',
      ],
    },
    {
      id: 'H6', mode: 'hard', station: 'recover', pillar: 'P4',
      title: 'Pick the restore source you can defend and order the full validation chain.',
      anchor: 'Restoration trust: provenance, integrity proof, staged validation',
      hints: [
        'Only ONE source is offline, pre-incident, and hash-verified.',
        'Vendor vouching is not verification; production-restores skip nothing.',
        'Source: offline vault (R-OFF). Order: hash → catalog compare → rebuilt hosts → scan/samples → payment dry-run → monitoring then production. Reject: skipping the hash.',
      ],
    },
    {
      id: 'H7', mode: 'hard', station: 'debrief', pillar: 'P4',
      title: 'Build the prevention roadmap: map root causes to controls with MITRE IDs, then rank by time-to-protect.',
      anchor: 'Preventive measures with official mitigation IDs; prioritization',
      hints: [
        'Five root causes, five controls — each maps by mechanism, not by whatever sounds strongest.',
        'Rank by how fast each control starts protecting: a DNS block beats a training program.',
        'Map: HC1→M1017, HC2→M1032, HC3→M1030, HC4→M1021, HC5→M1053. Rank: M1021 (minutes), M1032 (days), M1053 (days–weeks), M1030 (weeks), M1017 (continuous).',
      ],
    },
    {
      id: 'H9', mode: 'hard', station: 'debrief', pillar: 'P1',
      title: 'File the final incident report: classify six actions to phases, state the root cause, decide the residual-risk stance.',
      anchor: 'Lifecycle fluency; honest reporting; residual risk',
      hints: [
        'Classify each action by its verb: validate/declare, capture, isolate, remove, restore, rehearse.',
        'Root cause is the chain of weaknesses — not a single exotic exploit.',
        'Phases: detect, analyze, contain, eradicate, recover, rehearse. Root: H9-R2. Risk: reduced-not-eliminated (H9-K1).',
      ],
    },
  ];

  /* ───────────────────────── Mode-select copy ───────────────────────────── */

  const MODE_CARDS = {
    medium: {
      title: 'Guided Response',
      sub: 'Understand & learn — walk the lifecycle with support',
      bullets: [
        '12 guided objectives, introduced in lifecycle order',
        '3 hint levels on every objective (nudge → direction → demonstration)',
        'Tolerant checking with teaching feedback on every attempt',
        'Concept quiz (6) with an explanation after each answer',
      ],
      icon: 'compass',
      accent: 'amber',
    },
    hard: {
      title: 'Live Fire',
      sub: 'Test & stretch — a noisy case file, no training wheels',
      bullets: [
        '9 broad multi-step challenges across the whole case',
        '12 intake artifacts — at least 4 red herrings hide in the noise',
        'Strict validation: exact sequences, near-misses rejected with rationale',
        'Hints locked except ONE scored nudge per objective',
      ],
      icon: 'flame',
      accent: 'rose',
    },
  };

  /* ─────────────── Sequencer initial (pre-shuffled) boards ────────────────
     Identical to the original engine's emptyEnv() and the station reset
     buttons — fixed, non-canonical orders. */

  const INITIAL_ORDERS = {
    volOrder: ['V-DISK', 'V-TAPE', 'V-RAM', 'V-LOGS', 'V-TEMP', 'V-PAGE'],
    timeOrder: ['E-ENC', 'E-TASK', 'E-PHISH', 'E-SMB', 'E-VPN', 'E-LSASS'],
    h3Order: ['E-CLR', 'E-PHISH', 'E-C2', 'E-VPN', 'E-ENC', 'E-TASK', 'E-SMB', 'E-LSASS'],
    recSteps: ['RS3', 'RS1', 'RS5', 'RS2', 'RS4'],
    h6Steps: ['HS3', 'HS1', 'HS6', 'HS2', 'HS5', 'HS4'],
    h7Rank: ['M1030', 'M1017', 'M1053', 'M1021', 'M1032'],
  };

  /* "Shuffle back" targets from the original station reset buttons. */
  const RESET_ORDERS = {
    volOrder: ['V-DISK', 'V-TAPE', 'V-RAM', 'V-LOGS', 'V-TEMP', 'V-PAGE'],
    timeOrder: ['E-ENC', 'E-TASK', 'E-PHISH', 'E-SMB', 'E-VPN', 'E-LSASS'],
    h3Order: ['E-CLR', 'E-PHISH', 'E-C2', 'E-VPN', 'E-ENC', 'E-TASK', 'E-SMB', 'E-LSASS'],
    containSeq: ['S3', 'S5', 'S1', 'S4', 'S2'],
    recSteps: ['RS3', 'RS1', 'RS5', 'RS2', 'RS4'],
    h6Steps: ['HS3', 'HS1', 'HS6', 'HS2', 'HS5', 'HS4'],
    h7Rank: ['M1030', 'M1017', 'M1053', 'M1021', 'M1032'],
  };

  /* Pillar takeaways shown in the completion modal (lab-root.tsx). */
  const PILLAR_TAKEAWAYS = {
    P1: {
      medium: 'You can narrate the lifecycle and read artifacts as ATT&CK techniques.',
      hard: 'The final report proves lifecycle fluency and honest root-cause language.',
    },
    P2: {
      medium: 'You triaged volatility, custody, and clock-skewed timelines like a bench regular.',
      hard: 'You ran a defensible acquisition and reconstructed a five-source timeline.',
    },
    P3: {
      medium: 'You found the data-source blind spots and wrote the rule that closes them.',
      hard: 'You picked the four real detection improvements and rejected the theater.',
    },
    P4: {
      medium: 'You contained, eradicated, restored — and mapped prevention to official controls.',
      hard: 'You sequenced responses under constraints and closed the reinfection gap.',
    },
  };

  /* Star labels for the completion modal (shell.tsx). */
  const STAR_LABELS = {
    3: 'Battle-Ready Analyst',
    2: 'Solid Handler',
    1: 'First Response Complete — review & replay',
  };

  /* Custody ledger options (stations-b.tsx, CustodyLedger). */
  const CUSTODY_COLLECTORS = [
    { id: 'you', label: 'You — IR Coordinator (IR-77)' },
    { id: 'okafor', label: 'R. Okafor — Forensics (was off-site)' },
    { id: 'facilities', label: 'Facilities keyholder (no IR training)' },
  ];
  const CUSTODY_TAGS = [
    { id: 'IR-2317-RAM-01', label: 'IR-2317-RAM-01' },
    { id: 'IR-2317-RAM1', label: 'IR-2317-RAM1' },
    { id: 'RAM-2317', label: 'RAM-2317' },
  ];
  const CUSTODY_INTEGRITY = [
    { id: 'HASH', label: 'Record SHA-256 of the image; verify again after every transfer' },
    { id: 'RENAME', label: 'Rename the file with a .verified extension' },
    { id: 'TRUST', label: 'Trust the copying tool — it has never failed before' },
  ];
  const CUSTODY_WHY = [
    { id: 'WHY-IDENTICAL', label: 'It proves the copy is bit-identical to the original — integrity is challengeable in any hearing' },
    { id: 'WHY-SIZE', label: 'It compresses the image so it fits on the evidence drive' },
    { id: 'WHY-SECRET', label: 'It encrypts the evidence so attackers cannot read it' },
  ];

  /* M4 acquisition approaches (stations-b.tsx). */
  const ACQ_APPROACHES = [
    { id: 'ACQ-OFF', label: 'Power it off immediately, then image the disk at leisure' },
    { id: 'ACQ-LIVE', label: 'Live: capture RAM first, then a bit-level disk image through a write blocker' },
    { id: 'ACQ-COPY', label: 'Log in over RDP and copy the visible files to a share' },
  ];

  /* H2 parts 2 & 3 options (stations-b.tsx). */
  const H2_FIRST = [
    { id: 'H2F-RAM', label: 'RAM — ransomware state and any keys exist only in memory on a running host' },
    { id: 'H2F-DISK', label: 'Disk — start with the biggest artifact first' },
    { id: 'H2F-LOGS', label: 'Central logs — they are the easiest to pull' },
  ];
  const H2_SHORTCUT = [
    { id: 'H2S-LUN', label: 'Cloning the live-mounted SAN LUN without a write blocker' },
    { id: 'H2S-EDR', label: 'Capturing memory with the approved EDR \u201ccapture memory\u201d action' },
    { id: 'H2S-FW', label: 'Exporting the firewall logs for the incident window' },
  ];

  /* Export */
  global.LAB = {
    STORAGE_KEY: STORAGE_KEY,
    STATE_VERSION: STATE_VERSION,
    PILLAR_META: PILLAR_META,
    CASE: CASE,
    STATIONS: STATIONS,
    PHASES: PHASES,
    PHASE_ORDER_CANONICAL: PHASE_ORDER_CANONICAL,
    PHASE_POOL_ORDER: PHASE_POOL_ORDER,
    NIST_COMPARE: NIST_COMPARE,
    ARTIFACTS: ARTIFACTS,
    CHAIN_ARTIFACTS: CHAIN_ARTIFACTS,
    CHAIN_TECHNIQUES: CHAIN_TECHNIQUES,
    CHAIN_CORRECT: CHAIN_CORRECT,
    VOLATILITY_ITEMS: VOLATILITY_ITEMS,
    VOL_CANONICAL: VOL_CANONICAL,
    ALERT_QUEUE: ALERT_QUEUE,
    GAP_OPTIONS: GAP_OPTIONS,
    GAP_CORRECT: GAP_CORRECT,
    FP_CORRECT: FP_CORRECT,
    RULE_FIELDS: RULE_FIELDS,
    RULE_OPS: RULE_OPS,
    RULE_VALUES: RULE_VALUES,
    RETRO_OPTIONS: RETRO_OPTIONS,
    RETRO_CORRECT: RETRO_CORRECT,
    TIMELINE_MEDIUM: TIMELINE_MEDIUM,
    TIMELINE_MEDIUM_CANONICAL: TIMELINE_MEDIUM_CANONICAL,
    TIMELINE_HARD: TIMELINE_HARD,
    TIMELINE_HARD_CANONICAL: TIMELINE_HARD_CANONICAL,
    H3_PATIENTS: H3_PATIENTS,
    H3_VECTORS: H3_VECTORS,
    H3_DWELLS: H3_DWELLS,
    H3_CLEARED: H3_CLEARED,
    CONTAIN_ACTIONS: CONTAIN_ACTIONS,
    CONTAIN_CORRECT: CONTAIN_CORRECT,
    TRADEOFFS: TRADEOFFS,
    CONTAIN_SEQ_ITEMS: CONTAIN_SEQ_ITEMS,
    CONTAIN_SEQ_CANONICAL: CONTAIN_SEQ_CANONICAL,
    CONTAIN_REJECTS: CONTAIN_REJECTS,
    ERAD_ACTIONS: ERAD_ACTIONS,
    ERAD_CORRECT: ERAD_CORRECT,
    H5_ARTIFACTS: H5_ARTIFACTS,
    H5_MISSED: H5_MISSED,
    H5_STEPS: H5_STEPS,
    RESTORE_SOURCES: RESTORE_SOURCES,
    RECOVERY_STEPS: RECOVERY_STEPS,
    RECOVERY_STEPS_CANONICAL: RECOVERY_STEPS_CANONICAL,
    H6_SOURCES: H6_SOURCES,
    H6_STEPS: H6_STEPS,
    H6_STEPS_CANONICAL: H6_STEPS_CANONICAL,
    H6_REJECTS: H6_REJECTS,
    ROOT_CAUSES: ROOT_CAUSES,
    CONTROL_OPTIONS: CONTROL_OPTIONS,
    LESSON_CORRECT: LESSON_CORRECT,
    H7_ROOT_CAUSES: H7_ROOT_CAUSES,
    H7_RANK_CANONICAL: H7_RANK_CANONICAL,
    H7_RANK_RATIONALE: H7_RANK_RATIONALE,
    H9_ACTIONS: H9_ACTIONS,
    H9_PHASE_OPTIONS: H9_PHASE_OPTIONS,
    H9_PHASE_CORRECT: H9_PHASE_CORRECT,
    H9_ROOTS: H9_ROOTS,
    H9_RISKS: H9_RISKS,
    QUIZ_MEDIUM: QUIZ_MEDIUM,
    QUIZ_HARD: QUIZ_HARD,
    GLOSSARY: GLOSSARY,
    FIELD_NOTES: FIELD_NOTES,
    KNOWLEDGE_CORE: KNOWLEDGE_CORE,
    OBJECTIVES: OBJECTIVES,
    MODE_CARDS: MODE_CARDS,
    INITIAL_ORDERS: INITIAL_ORDERS,
    RESET_ORDERS: RESET_ORDERS,
    PILLAR_TAKEAWAYS: PILLAR_TAKEAWAYS,
    STAR_LABELS: STAR_LABELS,
    CUSTODY_COLLECTORS: CUSTODY_COLLECTORS,
    CUSTODY_TAGS: CUSTODY_TAGS,
    CUSTODY_INTEGRITY: CUSTODY_INTEGRITY,
    CUSTODY_WHY: CUSTODY_WHY,
    ACQ_APPROACHES: ACQ_APPROACHES,
    H2_FIRST: H2_FIRST,
    H2_SHORTCUT: H2_SHORTCUT,
  };
})(window);
