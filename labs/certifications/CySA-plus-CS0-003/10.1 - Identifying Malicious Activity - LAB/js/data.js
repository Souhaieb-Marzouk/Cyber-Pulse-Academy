/* ═══════════════════════════════════════════════════════════════════════════
   CyberLab 101 — js/data.js
   ALL lab content lives here: case dossier, hosts, EDR/SIEM alerts, log
   streams, WHOIS records, blocklist entries, packet capture, phishing email,
   glossary, objectives (mastery blueprint), validators' answer data, quiz
   banks, primer/field-notes content and shell help text.
   Separated from logic on purpose — this file is the teaching material.
   Every artifact is SYNTHETIC and clearly labeled in the UI.
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

/* ------------------------------- Case ----------------------------------- */

const CASE = {
  id: 'CS-2024-0417',
  codename: 'HARBORWATCH',
  org: 'Alderwood Freight Systems',
  orgBlurb:
    'A mid-size freight and logistics company (~1,200 staff). You are the overnight analyst at Bench 3 of its small security operations center.',
  situation:
    'It is 02:00. The watch floor is quiet. Overnight, endpoint sensors flagged a suspicious process chain on an engineering workstation, DNS logs show a brand-lookalike domain was queried, and an authentication-correlation rule just fired. Your job: use the tools of the bench — endpoint protection, the command line, domain registries, blocklists and the SIEM — to identify what is real, decide what it means, and contain it.',
  disclaimer:
    'SYNTHETIC TRAINING SCENARIO — every artifact in this lab is fabricated for education. No real systems, people or data are involved.',
};

const INCIDENT_DATE = '2025-11-18';
const INCIDENT_NIGHT = 'Nov 17–18, 2025 · 02:00–03:30 UTC';
const INCIDENT_LABEL = 'Nov 17–18, 2025 · 02:00–03:30 UTC';

/* --------------------------------- Hosts --------------------------------- */

const HOSTS = {
  'WS-ENG-014': {
    os: 'Windows 11 Pro',
    user: 'j.rivera (Engineering)',
    ip: '10.4.12.14',
    role: 'Engineering workstation — the suspect host',
  },
  'WEB-LNX-02': {
    os: 'Ubuntu Server 22.04',
    user: 'service accounts',
    ip: '10.4.6.30',
    role: 'Public web server — baseline comparison',
  },
};

/* --------------------------------- EDR ----------------------------------- */

const EDR_ALERTS = [
  {
    id: 'E-701',
    time: '02:17:51',
    detection: 'behavioral',
    severity: 'critical',
    host: 'WS-ENG-014',
    title: 'Process spawned from user Temp directory impersonating a system binary',
    description:
      'A process named svch0st.exe (zero, not "o") was launched from a user-writable Temp path minutes after a browser session. Its name mimics the legitimate Windows service host svchost.exe, it is unsigned, and it opened an outbound TLS connection. No signature matched the file — the alert fired on the pattern itself: wrong location, wrong parent chain, mimic name. Classify which detection engine works this way before you act.',
    processTree: [
      'chrome.exe  (PID 5180 · user-initiated browser)',
      '  └─ cmd.exe  (PID 7410 · shell spawned by browser process)',
      '      └─ svch0st.exe  (PID 8212 · UNSIGNED · C:\\Users\\j.rivera\\AppData\\Local\\Temp\\svch0st.exe)',
    ],
    indicators: [
      { label: 'Binary path', value: 'C:\\Users\\j.rivera\\AppData\\Local\\Temp\\svch0st.exe' },
      { label: 'SHA-256', value: 'a3f9c2d17e5b048fae13c7d92b6f04e1d8a75c3b9f02e6d41c8b37a5f90d4e2c' },
      { label: 'Signed', value: 'NO — no Authenticode signature' },
      { label: 'Network', value: 'ESTABLISHED → 185.199.72.44:443 (from 02:17:48)' },
    ],
    canAct: true,
  },
  {
    id: 'E-702',
    time: '01:48:22',
    detection: 'heuristic',
    severity: 'medium',
    host: 'WS-FIN-002',
    title: 'Heuristic: generic downloader pattern in scheduled script',
    description:
      'The heuristic engine flagged C:\\IT\\tools\\wakeup.bat, a scheduled IT maintenance script that pings hosts and downloads a status page. The pattern (command-line downloader activity) resembles a generic downloader family. IT confirms this script has run nightly for two years. Heuristics trade sensitivity for precision — expect and manage false positives like this one.',
    processTree: ['schtasks.exe  (scheduled task, SYSTEM)', '  └─ cmd.exe → wakeup.bat  (C:\\IT\\tools\\wakeup.bat)'],
    indicators: [
      { label: 'Binary path', value: 'C:\\IT\\tools\\wakeup.bat' },
      { label: 'Owner', value: 'IT Operations (documented maintenance script)' },
      { label: 'Disposition', value: 'Candidate for allowlist review — not malicious' },
    ],
    canAct: false,
    autoNote: 'Heuristic detections need analyst review: allowlist with change record, or escalate.',
  },
  {
    id: 'E-703',
    time: '00:22:10',
    detection: 'signature',
    severity: 'low',
    host: 'WS-SHARED-PC',
    title: 'Signature match: Adware.Win32.PopDeals — auto-quarantined',
    description:
      'A user downloaded an adware bundle. The signature engine matched the file against a known pattern and automatically quarantined it — no analyst action was required. This is signature-based detection doing exactly what it is good at: instantly recognizing something the industry has seen before.',
    processTree: ['msedge.exe  (PID 2210)', '  └─ popdeals_setup.exe  (QUARANTINED by sensor)'],
    indicators: [
      { label: 'Verdict', value: 'Adware.Win32.PopDeals (known signature)' },
      { label: 'Action taken', value: 'File auto-quarantined at 00:22:11 ✓' },
    ],
    canAct: false,
    autoNote: 'Signature detections act automatically on known threats — fast, precise, blind to novel malware.',
  },
];

const DETECTION_INFO = {
  signature: 'Signature: matched a known-bad pattern. Precise, instant, blind to novelty.',
  heuristic: 'Heuristic: resembles known-bad characteristics. Sensitive — verify before acting.',
  behavioral: 'Behavioral: deviated from the normal model (who runs what, from where). Catches novel threats.',
};

/* --------------------------------- SIEM ---------------------------------- */

const SIEM_ALERTS = [
  {
    id: 'A-1042',
    time: '02:35:00',
    rule: 'Failed-login burst followed by success (same source)',
    ruleCode: 'AUTH-SPIRAL',
    severity: 'high',
    source: 'Authentication logs (domain controllers)',
    entity: 'src 10.4.7.21 · user svc_backup',
    summary: '47 failed logins between 02:20 and 02:34 from a single internal source, followed by 1 successful login.',
    why: 'The correlation rule fires when an authentication failure burst is followed by a success within 30 minutes — a classic password-spraying success pattern.',
    truth: 'fp',
    fpRationale:
      'WEB-BKUP-01 (10.4.7.21) is the internal backup server. Its nightly job retried the svc_backup account with an expired password until the 02:34 automated credential rotation succeeded. Single user, single internal source, on-host job logs confirm — a retry loop, not spraying.',
    correlation: [
      { id: 'auth_fail_burst', label: 'Failed logins ×47 (02:20–02:34)', detail: 'user svc_backup from 10.4.7.21, reason: expired password' },
      { id: 'auth_success_after', label: 'Successful login ×1 (02:34:52)', detail: 'user svc_backup from 10.4.7.21, immediately after credential rotation' },
    ],
    correlationDistractors: [
      { id: 'dns_query', label: 'DNS queries to lookalike domain', detail: 'unrelated to authentication' },
      { id: 'edr_detect', label: 'EDR behavioral detection', detail: 'endpoint telemetry, not auth events' },
      { id: 'fw_deny', label: 'Firewall deny rows', detail: 'not part of this auth rule' },
    ],
  },
  {
    id: 'A-1047',
    time: '02:18:10',
    rule: 'Suspicious process chain on endpoint (behavioral EDR relay)',
    ruleCode: 'EDR-CHAIN',
    severity: 'critical',
    source: 'EDR telemetry',
    entity: 'WS-ENG-014 · svch0st.exe (PID 8212)',
    summary: 'Unsigned process from user Temp directory, mimicking a system binary, opened outbound TLS to 185.199.72.44:443.',
    why: 'Behavioral EDR flagged the chain browser → shell → mimic process in a user-writable path, then relayed the alert into the SIEM.',
    truth: 'tp',
  },
  {
    id: 'A-1051',
    time: '02:19:40',
    rule: 'Periodic egress to a single external IP (~15 min cadence)',
    ruleCode: 'EGRESS-DRUM',
    severity: 'high',
    source: 'Firewall / NetFlow',
    entity: 'WS-ENG-014 → 185.199.72.44:443',
    summary: 'Connection attempts to the same external IP on 443 at 02:17, 02:33, 02:48, 03:03 — metronomic 15-minute spacing.',
    why: 'Regular-interval egress from a client operating system is a beaconing signature — consistent with command-and-control check-ins.',
    truth: 'tp',
  },
  {
    id: 'A-1055',
    time: '03:12:00',
    rule: 'Internal port scanning detected',
    ruleCode: 'RECON-ECHO',
    severity: 'medium',
    source: 'Network IDS',
    entity: 'src WS-SEC-ADMIN-01 (10.4.5.2) · user m.okafor',
    summary: 'Nmap-style scan of server VLAN from the security administration workstation.',
    why: 'Internal horizontal scanning is a discovery-stage attacker pattern — but so is an authorized vulnerability scan.',
    truth: 'fp',
    fpRationale:
      'm.okafor is the SOC vulnerability manager running the approved quarterly scan under change ticket CHG-2214 (window 03:00–05:00). Source, tool and timing all match the change record.',
  },
  {
    id: 'A-1058',
    time: '02:21:30',
    rule: 'Newly observed domain queried',
    ruleCode: 'NEWDOM',
    severity: 'low',
    source: 'DNS logs',
    entity: 'portal-freight-ops.com from WS-MKT-003',
    summary: 'A domain first seen on the network today was queried by a marketing workstation.',
    why: 'Fresh domains are risky, but newness alone is not malice — new business services create new domains.',
    truth: 'fp',
    fpRationale:
      "WHOIS shows registrant \"Alderwood Freight Systems Ltd\", corporate registrar, registered 30 days ago for the marketing team's new vendor portal launch. Legitimate.",
  },
  {
    id: 'A-1061',
    time: '02:14:25',
    rule: 'DNS query to brand-lookalike domain',
    ruleCode: 'LOOKALIKE',
    severity: 'high',
    source: 'DNS logs',
    entity: 'alderwoodportal-secure[.]com from WS-ENG-014',
    summary: 'Workstation queried a lookalike of the internal freight portal, registered 2 days ago, privacy-shielded.',
    why: 'Brand token + lookalike anatomy + fresh registration is the classic phishing-domain pattern — and it precedes the E-701 process chain on the same host.',
    truth: 'tp',
  },
];

/* ------------------------------ Log streams ------------------------------ */

const AUTH_LOG = [
  { t: '02:05:11', cols: ['success', 'j.rivera', '10.4.12.14'], detail: 'interactive logon, type 2' },
  { t: '02:20:01', cols: ['FAILED', 'svc_backup', '10.4.7.21'], detail: 'reason: password expired (attempt 1 of 47)' },
  { t: '02:20:37', cols: ['FAILED', 'svc_backup', '10.4.7.21'], detail: 'reason: password expired' },
  { t: '02:21:12', cols: ['FAILED', 'svc_backup', '10.4.7.21'], detail: 'reason: password expired' },
  { t: '02:22:04', cols: ['FAILED', 'svc_backup', '10.4.7.21'], detail: 'reason: password expired' },
  { t: '02:23:41', cols: ['FAILED', 'svc_backup', '10.4.7.21'], detail: 'reason: password expired' },
  { t: '02:25:18', cols: ['FAILED', 'svc_backup', '10.4.7.21'], detail: 'reason: password expired' },
  { t: '02:27:02', cols: ['FAILED', 'svc_backup', '10.4.7.21'], detail: 'reason: password expired' },
  { t: '02:29:55', cols: ['FAILED', 'svc_backup', '10.4.7.21'], detail: 'reason: password expired' },
  { t: '02:31:33', cols: ['FAILED', 'svc_backup', '10.4.7.21'], detail: 'reason: password expired' },
  { t: '02:33:20', cols: ['FAILED', 'svc_backup', '10.4.7.21'], detail: 'reason: password expired' },
  { t: '—', cols: ['…+35 more FAILED', 'svc_backup', '10.4.7.21'], detail: 'identical pattern 02:20–02:34 (47 total)' },
  { t: '02:34:52', cols: ['success', 'svc_backup', '10.4.7.21'], detail: 'succeeded immediately after 02:34 automated credential rotation' },
  { t: '02:41:10', cols: ['FAILED', 'j.rivera', '10.4.12.14'], detail: 'reason: wrong password (user typo)' },
  { t: '02:44:03', cols: ['success', 'm.okafor', '10.4.5.2'], detail: 'interactive logon, type 2' },
];

const DNS_LOG = [
  { t: '02:14:19', cols: ['QUERY A', 'alderwoodportal-secure[.]com', 'WS-ENG-014 (10.4.12.14)'], detail: 'answer 45.62.198.140 · TTL 300 · first-seen domain' },
  { t: '02:14:20', cols: ['QUERY A', 'updates.alderwoodfreight.com', 'WS-ENG-014 (10.4.12.14)'], detail: 'answer 10.4.1.30 (internal)' },
  { t: '02:14:22', cols: ['QUERY A', 'mail.alderwoodfreight.com', 'WS-ENG-014 (10.4.12.14)'], detail: 'answer 10.4.1.11 (internal)' },
  { t: '02:15:47', cols: ['QUERY A', 'cdn.logistics-partner.net', 'WS-MKT-003'], detail: 'answer 104.21.6.77' },
  { t: '02:17:44', cols: ['QUERY A', 'sync.teamservices.net', 'WS-ENG-014'], detail: 'answer 52.114.7.12' },
  { t: '02:21:05', cols: ['QUERY A', 'portal-freight-ops.com', 'WS-MKT-003 (10.4.3.88)'], detail: 'answer 104.21.6.77 · first-seen domain' },
  { t: '02:23:10', cols: ['QUERY AAAA', 'intranet.alderwoodfreight.com', 'WS-FIN-002'], detail: 'answer 10.4.1.40' },
  { t: '02:29:02', cols: ['QUERY A', 'vendor-edi.gateways.net', 'WEB-LNX-02'], detail: 'answer 198.51.100.24' },
  { t: '02:35:47', cols: ['QUERY A', 'alderwoodportal-secure[.]com', 'WS-ENG-014 (10.4.12.14)'], detail: 'answer 45.62.198.140 · TTL 300 · second query' },
  { t: '02:41:55', cols: ['QUERY A', 'mail.alderwoodfreight.com', 'WS-FIN-002'], detail: 'answer 10.4.1.11' },
  { t: '02:52:31', cols: ['QUERY A', 'cdn.logistics-partner.net', 'WS-SHARED-PC'], detail: 'answer 104.21.6.77' },
  { t: '03:05:12', cols: ['QUERY A', 'updates.alderwoodfreight.com', 'WEB-LNX-02'], detail: 'answer 10.4.1.30' },
];

const FIREWALL_LOG = [
  { t: '02:14:22', cols: ['ALLOW', 'WS-ENG-014:52311 → 45.62.198.140:443', 'TLS'], detail: 'conn 412s · 8.1 KB out / 212 KB in' },
  { t: '02:17:48', cols: ['ALLOW', 'WS-ENG-014:52390 → 185.199.72.44:443', 'TLS'], detail: 'conn 26s · 1.2 KB out / 0.9 KB in' },
  { t: '02:18:02', cols: ['ALLOW', 'WS-ENG-014:49152 → 10.4.1.20:445', 'SMB'], detail: 'file share access (benign)' },
  { t: '02:33:11', cols: ['ALLOW', 'WS-ENG-014:52411 → 185.199.72.44:443', 'TLS'], detail: 'conn 21s · 1.1 KB out / 0.9 KB in' },
  { t: '02:48:03', cols: ['ALLOW', 'WS-ENG-014:52477 → 185.199.72.44:443', 'TLS'], detail: 'conn 24s · 1.2 KB out / 0.9 KB in' },
  { t: '02:55:40', cols: ['DENY', 'WS-DEV-002:51190 → 10.4.9.5:3389', 'RDP'], detail: 'policy: no RDP to server VLAN (benign user error)' },
  { t: '03:03:27', cols: ['ALLOW', 'WS-ENG-014:52502 → 185.199.72.44:443', 'TLS'], detail: 'conn 22s · 1.2 KB out / 0.9 KB in' },
  { t: '03:11:08', cols: ['ALLOW', 'WS-SEC-ADMIN-01 → 10.4.6.0/24', 'SCAN'], detail: 'nmap sweep (source: approved scan host)' },
];

const EDR_LOG = [
  { t: '00:22:10', cols: ['E-703', 'signature', 'WS-SHARED-PC'], detail: 'Adware.Win32.PopDeals — auto-quarantined' },
  { t: '01:48:22', cols: ['E-702', 'heuristic', 'WS-FIN-002'], detail: 'generic downloader pattern — wakeup.bat (review)' },
  { t: '02:17:51', cols: ['E-701', 'unclassified', 'WS-ENG-014'], detail: 'mimic process from Temp, unsigned — critical · engine classification pending analyst triage' },
];

const STREAMS = {
  auth: { label: 'Auth (domain controllers)', rows: AUTH_LOG, headers: ['Result', 'User', 'Source'] },
  dns: { label: 'DNS (resolvers)', rows: DNS_LOG, headers: ['Op', 'Query', 'Client'] },
  firewall: { label: 'Firewall / NetFlow', rows: FIREWALL_LOG, headers: ['Action', 'Flow', 'Proto'] },
  edr: { label: 'EDR telemetry', rows: EDR_LOG, headers: ['Alert', 'Type', 'Host'] },
};

/* --------------------------------- WHOIS --------------------------------- */

const WHOIS_RECORDS = {
  'alderwoodportal-secure[.]com': {
    domain: 'alderwoodportal-secure[.]com',
    registrar: 'DomainHive Ltd',
    created: '2025-11-16T03:12:07Z',
    ageDays: 2,
    expires: '2026-11-16',
    registrant: 'REDACTED FOR PRIVACY (Domains-By-Proxy Shield Ltd)',
    country: 'PA',
    nameServers: ['NS1.DNSPARK-MX.NET', 'NS2.DNSPARK-MX.NET'],
    privacy: true,
    dnssec: 'unsigned',
    status: 'clientTransferProhibited',
    verdictNote:
      'Risk pattern: brand token ("alderwood") + hyphen + "-secure" suffix, registered 2 days ago, registrant hidden behind a privacy shield, offshore registration country. Corroborate with blocklists and DNS before blocking.',
  },
  'portal-freight-ops.com': {
    domain: 'portal-freight-ops.com',
    registrar: 'Corporate Domains, Inc.',
    created: '2025-10-19T09:41:33Z',
    ageDays: 30,
    expires: '2027-10-19',
    registrant: 'Alderwood Freight Systems Ltd',
    country: 'GB',
    nameServers: ['NS1.CORPORATEDOMAINS.NET', 'NS2.CORPORATEDOMAINS.NET'],
    privacy: false,
    dnssec: 'unsigned',
    status: 'ok',
    verdictNote:
      'New but legitimate: registrant matches the company, corporate registrar, no privacy shield. "New domain" alerts need WHOIS context before triage — fresh ≠ malicious.',
  },
  'portal[.]alderwoodfreight.com': {
    domain: 'portal[.]alderwoodfreight.com',
    registrar: 'Corporate Domains, Inc.',
    created: '2016-04-02T11:05:00Z',
    ageDays: 3522,
    expires: '2027-04-02',
    registrant: 'Alderwood Freight Systems Ltd',
    country: 'GB',
    nameServers: ['NS1.CORPORATEDOMAINS.NET', 'NS2.CORPORATEDOMAINS.NET'],
    privacy: false,
    dnssec: 'signed',
    status: 'ok',
    verdictNote:
      'The real portal: 9+ years old, corporate registrant, DNSSEC signed. Compare any suspicious domain against the legitimate one — anatomy differences jump out.',
  },
};

const WHOIS_SUGGESTIONS = ['alderwoodportal-secure[.]com', 'portal-freight-ops.com', 'portal[.]alderwoodfreight.com'];

const WHOIS_ANATOMY = [
  { part: 'alderwood', label: 'BRAND TOKEN', cls: 'an-token' },
  { part: 'portal', label: 'MIMICED PATH', cls: 'an-path' },
  { part: '-secure', label: 'TRUST SUFFIX', cls: 'an-suffix' },
  { part: '.com', label: 'TLD', cls: 'an-tld' },
];

/* ------------------------------- Blocklist ------------------------------- */

const C2_HASH = 'a3f9c2d17e5b048fae13c7d92b6f04e1d8a75c3b9f02e6d41c8b37a5f90d4e2c';

const BLOCKLIST = {
  '185.199.72.44': {
    listed: true,
    feed: 'CobaltWatch C2 Feed',
    category: 'Command & control / beaconing',
    confidence: 'HIGH',
    firstSeen: '2025-11-09',
    lastSeen: '2025-11-18T02:51Z',
    note: 'Observed beaconing every ~15 minutes over TCP/443 across multiple victim networks.',
    recommendBlock: true,
  },
  '45.62.198.140': {
    listed: true,
    feed: 'PhishGuard Domain Feed',
    category: 'Phishing infrastructure (credential harvesting)',
    confidence: 'MEDIUM-HIGH',
    firstSeen: '2025-11-16',
    lastSeen: '2025-11-18T01:40Z',
    note: 'Hosting IP of a credential-harvesting page imitating a freight-portal login.',
    recommendBlock: true,
  },
  'alderwoodportal-secure[.]com': {
    listed: true,
    feed: 'PhishGuard Domain Feed',
    category: 'Credential phishing — SSO lookalike',
    confidence: 'HIGH',
    firstSeen: '2025-11-16',
    lastSeen: '2025-11-18T02:40Z',
    note: 'Lookalike of portal[.]alderwoodfreight.com. Recommend DNS-level block.',
    recommendBlock: true,
  },
};

BLOCKLIST[C2_HASH] = {
  listed: true,
  feed: 'HashVault Essentials',
  category: 'Malicious binary — FleetLoader (trojan loader)',
  confidence: 'HIGH',
  firstSeen: '2025-11-10',
  lastSeen: '2025-11-18T03:02Z',
  note: 'SHA-256 shared by three partner SOCs; drops follow-on payloads. Signature feeds do not yet carry a vendor name for this family.',
  recommendBlock: false,
};

const BLOCKLIST_MISS_NOTES = {
  'portal-freight-ops.com':
    'Not listed on any subscribed feed. Remember: a NO HIT is not an all-clear — feeds are reactive. Use WHOIS and business context.',
  '10.4.7.21':
    'Not listed (RFC1918 internal address — public feeds never list internal space). Internal IPs are assessed with internal context, not reputation feeds.',
};

const BLOCKLIST_SUGGESTIONS = ['185.199.72.44', '10.4.7.21', 'alderwoodportal-secure[.]com', 'portal-freight-ops.com'];

const BLOCKLIST_FEED_NOTE =
  'Feed model (simplified): curated community lists — the lab uses fictional feeds (CobaltWatch, PhishGuard, HashVault). In the real world you would subscribe to feeds such as abuse.ch or commercial reputation services.';

const VERDICT_OPTIONS = [
  { id: 'c2', label: 'C2 / beaconing infrastructure' },
  { id: 'phish', label: 'Phishing infrastructure' },
  { id: 'clean', label: 'Clean — allowlisted' },
  { id: 'unknown', label: 'Not listed / unknown' },
];

/* ------------------------------ Packet capture ---------------------------- */

const PCAP_LINES = [
  'reading from file harbor.pcap, link-type EN10MB (Ethernet), snapshot length 262144',
  '02:14:22.311762 IP 10.4.12.14.52311 > 45.62.198.140.443: Flags [S], seq 882341, win 64240, length 0',
  '02:14:23.104991 IP 10.4.12.14.52311 > 45.62.198.140.443: Flags [.], ack 883, win 64240, length 0',
  '02:14:58.407211 IP 10.4.12.14.52311 > 45.62.198.140.443: Flags [P.], seq 1:517, length 516',
  '02:17:48.902145 IP 10.4.12.14.52390 > 185.199.72.44.443: Flags [S], seq 410882, win 64240, length 0',
  '02:33:11.774382 IP 10.4.12.14.52411 > 185.199.72.44.443: Flags [P.], seq 1:341, ack 422, length 340',
  '02:48:03.211905 IP 10.4.12.14.52477 > 185.199.72.44.443: Flags [P.], seq 1:338, ack 419, length 337',
  '03:03:27.650118 IP 10.4.12.14.52502 > 185.199.72.44.443: Flags [P.], seq 1:340, ack 421, length 339',
];

const PHISHING_EML = [
  'Received: from mail-out.cheapvps-mailer.net (unknown [45.62.198.77])',
  '        by mx01.alderwoodfreight.com with ESMTPS id 8f2a11;',
  '        Tue, 18 Nov 2025 01:58:44 +0000',
  'From: "Alderwood Freight IT" <it-support@alderwoodfreight-portal.net>',
  'Reply-To: it-support@alderwoodfreight-portal.net',
  'To: <j.rivera@alderwoodfreight.com>',
  'Subject: URGENT: Freight Portal password expires in 24 hours',
  'MIME-Version: 1.0',
  'Content-Type: text/html; charset=utf-8',
  '',
  '<p>Your Freight Portal password expires in 24 hours.</p>',
  '<p>Verify your account now:</p>',
  '<a href="https://alderwoodportal-secure[.]com/verify?u=j.rivera">https://portal[.]alderwoodfreight.com/verify</a>',
  '',
  '[message body continues — SYNTHETIC training artifact]',
];

/* ------------------------------- Glossary -------------------------------- */

const GLOSSARY = [
  { term: 'IOC (Indicator of Compromise)', def: 'An observable artifact — IP, domain, file hash, process name — that suggests malicious activity.' },
  { term: 'SIEM', def: 'Security Information and Event Management: aggregates logs from many sources, correlates them into alerts, and presents dashboards.' },
  { term: 'EPP', def: 'Endpoint Protection Platform: prevents malware on a device, classically via signature-based and heuristic scanning.' },
  { term: 'EDR', def: 'Endpoint Detection and Response: watches endpoint behavior continuously (processes, connections, files), detects anomalies, and lets analysts quarantine files or isolate hosts.' },
  { term: 'Signature-based detection', def: 'Matches files or traffic against known-bad patterns. Fast and precise, but blind to anything never seen before.' },
  { term: 'Heuristic analysis', def: 'Flags code or behavior that resembles known-bad characteristics (rules of thumb). Catches some novel threats, but produces false positives.' },
  { term: 'Behavioral detection', def: 'Models what processes/users normally do and alerts on deviations — e.g., a process executing from Temp while impersonating a system binary.' },
  { term: 'False positive', def: 'Benign activity that a tool flagged as malicious. The cost of sensitivity; managed with context and rule tuning.' },
  { term: 'False negative', def: 'Malicious activity a tool failed to flag. The reason layered tools and human review exist.' },
  { term: 'WHOIS', def: 'The public registration record of a domain: registrar, creation date, registrant, name servers. A freshness and ownership lens on suspicious domains.' },
  { term: 'Blocklist / DNSBL', def: 'A curated feed of known-bad IPs, domains or file hashes used for quick lookups, DNS filtering and firewall blocks.' },
  { term: 'Allowlist', def: 'The inverse: an approved list of known-good software or senders. Requires governance, or it becomes an evasion gap.' },
  { term: 'Correlation rule', def: 'SIEM logic that combines multiple events (e.g., failed-login burst + eventual success) into a single prioritized alert.' },
  { term: 'Process tree', def: 'The parent→child chain of processes, as shown by EDR. Anomalous chains (browser spawning a system-mimic binary) are top-tier signals.' },
  { term: 'Beaconing', def: 'Regular check-in traffic from an implant to its operator, often on 443 at fixed intervals. Metronomic egress from a client OS is a classic tell.' },
  { term: 'C2 server', def: 'Command-and-control infrastructure an attacker uses to operate compromised hosts.' },
  { term: 'Masquerading', def: 'Naming or placing a malicious binary to look legitimate (e.g., svch0st.exe with a zero, living in Temp). ATT&CK T1036.' },
  { term: 'OSINT', def: 'Open-source intelligence: public sources (registries, feeds, search engines) used to enrich an investigation.' },
  { term: 'Sandbox detonation', def: 'Running a suspicious file in an isolated, instrumented environment to observe its behavior safely.' },
];

/* ============================ Mastery blueprint =========================== */

const OBJECTIVES = [
  /* ================================ MEDIUM ================================ */
  {
    id: 'M1',
    mode: 'medium',
    pillar: 'P2',
    title: 'Run netstat -ano on WS-ENG-014 and enter the suspicious external connection (IP:port).',
    context:
      'netstat shows every socket a Windows host has open. One row here stands out from the internal traffic.',
    anchor: 'Command-line tools — netstat (CS0-003 obj 1.3 command-line list)',
    kind: 'answer',
    fields: [{ id: 'conn', label: 'Remote IP:port', placeholder: 'e.g. 203.0.113.5:443', size: 'full' }],
    hints: [
      'Open the SHELL instrument, switch to host WS-ENG-014, and run: netstat -ano',
      'Look for the row whose Foreign Address is NOT a 10.4.x.x internal address.',
      'The row is: TCP … 185.199.72.44:443 ESTABLISHED PID 8212. Enter "185.199.72.44:443".',
    ],
    nudge: 'netstat -ano on WS-ENG-014 — the one non-10.4.x.x foreign address, state ESTABLISHED.',
    jumpTo: 'shell',
  },
  {
    id: 'M2',
    mode: 'medium',
    pillar: 'P2',
    title: 'Use tasklist /v to identify the process behind PID 8212, and enter its name.',
    context: 'netstat gives you a PID. tasklist turns that number into a name and a path.',
    anchor: 'Command-line tools — tasklist; spotting masqueraded process names/paths',
    kind: 'answer',
    fields: [{ id: 'proc', label: 'Process name', placeholder: 'e.g. explorer.exe' }],
    hints: [
      'On WS-ENG-014 run: tasklist /v — then find PID 8212 in the list.',
      'Compare the image name character by character with the real Windows binary, and look at its path.',
      'It is svch0st.exe (with a zero) running from \\AppData\\Local\\Temp\\ — not the real svchost.exe.',
    ],
    nudge: 'tasklist /v → PID 8212. Read the name slowly: it mimics svchost.exe and lives in Temp.',
    jumpTo: 'shell',
  },
  {
    id: 'M3',
    mode: 'medium',
    pillar: 'P1',
    title: 'In SENTRY-EDR, open alert E-701 and classify which detection type caught this threat.',
    context:
      'Endpoint protection uses three detection engines: signature, heuristic, behavioral. Knowing which fired tells you what you are dealing with.',
    anchor: 'Endpoint protection software — signature vs heuristic vs behavioral detections',
    kind: 'state',
    hints: [
      'Open the EDR instrument and select alert E-701.',
      'The description says no signature matched the file — the alert came from pattern-of-behavior analysis.',
      'Select "Behavioral" in the Classify panel of alert E-701.',
    ],
    nudge: 'EDR → E-701 → Classify. No signature matched; the engine watched the behavior.',
    jumpTo: 'edr',
  },
  {
    id: 'M4',
    mode: 'medium',
    pillar: 'P2',
    title: 'Look up alderwoodportal-secure[.]com in the Domain Registry and enter its age in days.',
    context:
      'WHOIS tells you who registered a domain and when. Freshness is one of the strongest phishing signals.',
    anchor: 'Domain registries — WHOIS fields and the domain-age heuristic',
    kind: 'answer',
    fields: [{ id: 'age', label: 'Domain age (days)', placeholder: 'e.g. 30' }],
    hints: [
      'Open the WHOIS instrument and look up alderwoodportal-secure[.]com.',
      'The record card shows a Created date; the age badge computes it against the incident date (Nov 18).',
      'It was registered on Nov 16 — 2 days ago.',
    ],
    nudge: 'WHOIS instrument → alderwoodportal-secure[.]com → the age badge.',
    jumpTo: 'whois',
  },
  {
    id: 'M5',
    mode: 'medium',
    pillar: 'P2',
    title: 'Check the IP from M1 against Blocklist Intelligence and pick the correct verdict.',
    context:
      'Reputation feeds turn hours of research into one lookup. What does the feed say 185.199.72.44 is?',
    anchor: 'Blocklists — IP reputation lookup and interpreting feed verdicts',
    kind: 'state',
    hints: [
      'Open the BLOCKLIST instrument and enter the IP you found in M1.',
      'Read the feed, category and confidence fields on the verdict card.',
      'Select "C2 / beaconing infrastructure" as the verdict.',
    ],
    nudge: 'BLOCKLIST → 185.199.72.44. The feed names its category — pick it.',
    jumpTo: 'blocklist',
  },
  {
    id: 'M6',
    mode: 'medium',
    pillar: 'P3',
    title: 'In the SIEM, open alert A-1042 and select the two event types its correlation rule combined.',
    context:
      'A correlation alert is a sentence built from several events. Decomposing it is how you judge whether it is true.',
    anchor: 'SIEM — correlation rules (AUTH-SPIRAL) and how alerts are constructed',
    kind: 'state',
    hints: [
      'SIEM instrument → alert A-1042 → open the Correlation breakdown.',
      'The rule name gives it away: a burst of one thing followed by another.',
      'Pick "Failed logins ×47" and "Successful login ×1".',
    ],
    nudge: 'A-1042 → Correlation breakdown. Burst of failures, then a success.',
    jumpTo: 'siem',
  },
  {
    id: 'M7',
    mode: 'medium',
    pillar: 'P3',
    title: 'In the SIEM DNS stream, find which internal host queried the lookalike domain — enter the hostname.',
    context:
      'Data sources are the SIEM’s raw material. Filtering a stream for a keyword is the bread-and-butter analyst move.',
    anchor: 'SIEM — data sources (DNS logs) and stream filtering',
    kind: 'answer',
    fields: [{ id: 'host', label: 'Hostname that queried the domain', placeholder: 'e.g. WS-FIN-002' }],
    hints: [
      'SIEM instrument → Event streams tab → DNS.',
      'Type "alderwood" into the stream search box.',
      'Two rows reference alderwoodportal-secure[.]com — the client column names the workstation.',
    ],
    nudge: 'SIEM → Event streams → DNS → search "alderwood". Read the client column.',
    jumpTo: 'siem',
  },
  {
    id: 'M8',
    mode: 'medium',
    pillar: 'P1',
    title: 'Tool Match: pick the right tool family for each of the three mini-scenarios.',
    context: 'The lesson lists many tools — the skill is matching the question to the instrument.',
    anchor: 'Tool families overview (endpoint protection / CLI / registry / blocklist / SIEM)',
    kind: 'state',
    hints: [
      'The drill is at the bottom of the PRIMER panel.',
      'Scenario (b) asks who owns a domain — think registration records.',
      'a→Command line, b→Domain registry, c→SIEM.',
    ],
    nudge: 'PRIMER panel → Tool Match drill at the bottom.',
    jumpTo: 'primer',
  },
  {
    id: 'M9',
    mode: 'medium',
    pillar: 'P4',
    title: 'Contain it: quarantine the malicious file AND isolate WS-ENG-014 in SENTRY-EDR.',
    context:
      'EDR gives defenders real hands: quarantine kills the binary, isolation cuts the host off the network while keeping the sensor alive.',
    anchor: 'Endpoint protection — quarantine and network-isolation actions',
    kind: 'state',
    hints: [
      'EDR instrument → alert E-701 → Response actions.',
      'Two buttons: one for the file, one for the network.',
      'Both must be active: Quarantine file + Isolate host.',
    ],
    nudge: 'E-701 → Response actions → Quarantine + Isolate.',
    jumpTo: 'edr',
  },
  {
    id: 'M10',
    mode: 'medium',
    pillar: 'P4',
    title: 'Disposition: escalate A-1047 as a true positive and close A-1055 as a false positive.',
    context:
      'Every alert ends in a decision. Escalating the real threat and documenting the false positive are equally professional moves.',
    anchor: 'SIEM — alert triage workflow; true vs false positive handling',
    kind: 'state',
    hints: [
      'SIEM instrument → alert queue → open each alert.',
      'A-1047 is the EDR process-chain alert — read its summary.',
      'Escalate A-1047; close A-1055 (the scan) as false positive — the rationale is in its detail view.',
    ],
    nudge: 'SIEM → A-1047 → Escalate. Then A-1055 → Close as FP (check the change-ticket note).',
    jumpTo: 'siem',
  },
  {
    id: 'M11',
    mode: 'medium',
    pillar: 'P2',
    title: 'Compute the SHA-256 of /evidence/svch0st.exe in the shell, then confirm the hash against the blocklist.',
    context:
      'A hash is a file’s fingerprint. Hash feeds let you prove two things are the same file — and tell you who else has seen it.',
    anchor: 'Command line — sha256sum; blocklists — file-hash feeds',
    kind: 'state',
    hints: [
      'SHELL: run  sha256sum /evidence/svch0st.exe  and copy the digest.',
      'BLOCKLIST instrument: the input accepts 64-character hex as a hash lookup.',
      'Paste the hash, see the HIT, then press "Confirm IOC match".',
    ],
    nudge: 'sha256sum /evidence/svch0st.exe → paste digest into BLOCKLIST → Confirm IOC match.',
    jumpTo: 'shell',
  },
  {
    id: 'M12',
    mode: 'medium',
    pillar: 'P1',
    title: 'SIEM Capability drill: match each described feature to the SIEM capability it demonstrates.',
    context: 'The lesson names SIEM as a key tool — know what its three core capabilities actually do.',
    anchor: 'SIEM — aggregation, correlation, dashboarding capabilities',
    kind: 'state',
    hints: [
      'The drill is in the SIEM instrument, under Capability drill.',
      '"Combine many events into one alert" is the correlation one.',
      'a→Aggregation, b→Correlation, c→Dashboarding.',
    ],
    nudge: 'SIEM instrument → Capability drill (bottom of the panel).',
    jumpTo: 'siem',
  },

  /* ================================= HARD ================================= */
  {
    id: 'H1',
    mode: 'hard',
    pillar: 'P3',
    title: 'Triage the entire queue: dispose of all six alerts correctly (escalate TPs, close FPs).',
    context:
      'Three of tonight’s six alerts are wrong. Each disposition requires evidence from another instrument.',
    anchor: 'SIEM — full alert triage; false-positive discrimination under noise',
    kind: 'state',
    hints: ['One nudge only in Hard mode — spend it wisely.'],
    nudge: 'TPs: A-1047, A-1051, A-1061 (corroborated by EDR + blocklist). FPs: A-1042 (svc_backup retry loop), A-1055 (approved scan CHG-2214), A-1058 (corporate WHOIS).',
    jumpTo: 'siem',
  },
  {
    id: 'H2',
    mode: 'hard',
    pillar: 'P2',
    title: 'Build the full evidence tuple for the malicious connection: process, remote endpoint, PID and binary path.',
    context: 'A triage note a responder can act on has all four values, not just "something talked to something".',
    anchor: 'Command line — netstat + tasklist combined into a complete IOC set',
    kind: 'answer',
    fields: [
      { id: 'proc', label: 'Process name', placeholder: 'name.exe' },
      { id: 'remote', label: 'Remote IP:port', placeholder: 'IP:port', size: 'short' },
      { id: 'pid', label: 'PID', placeholder: '####', size: 'short' },
      { id: 'path', label: 'Full binary path', placeholder: 'C:\\…\\file.exe', size: 'full' },
    ],
    hints: ['One nudge only in Hard mode — spend it wisely.'],
    nudge: 'netstat -ano (remote + PID) → tasklist /v (name + path). PID 8212.',
    jumpTo: 'shell',
  },
  {
    id: 'H3',
    mode: 'hard',
    pillar: 'P2',
    title: 'Domain verdict — enter all three: age in days, the WHOIS privacy indicator, and your verdict.',
    context: 'A registrable conclusion cites the record: how old, what hides the registrant, what that pattern means.',
    anchor: 'Domain registries — multi-field WHOIS analysis and verdict formation',
    kind: 'answer',
    fields: [
      { id: 'age', label: 'Age (days)', placeholder: '##', size: 'short' },
      { id: 'privacy', label: 'Privacy indicator (as shown in the record)', placeholder: 'e.g. REDACTED…' },
      { id: 'verdict', label: 'Verdict', placeholder: 'one word' },
    ],
    hints: ['One nudge only in Hard mode — spend it wisely.'],
    nudge: 'WHOIS → alderwoodportal-secure[.]com. Age is tiny, registrant is "REDACTED FOR PRIVACY", and the pattern is phishing.',
    jumpTo: 'whois',
  },
  {
    id: 'H4',
    mode: 'hard',
    pillar: 'P3',
    title: 'Correlation audit: determine what actually caused A-1042, then dispose of it correctly.',
    context: 'The rule said "password spraying". The auth stream says something more mundane — if you read it carefully.',
    anchor: 'SIEM — correlation tuning and false-positive root-cause analysis',
    kind: 'state',
    hints: ['One nudge only in Hard mode — spend it wisely.'],
    nudge: 'A-1042 detail → "What actually happened?" One user, one internal source, success right after credential rotation.',
    jumpTo: 'siem',
  },
  {
    id: 'H5',
    mode: 'hard',
    pillar: 'P2',
    title: 'Hash enrichment: enter the feed name AND the malware family label recorded for the Temp binary.',
    context: 'Feeds carry context, not just verdicts — who published it and what the family does.',
    anchor: 'Blocklists — hash-feed enrichment; command line — sha256sum',
    kind: 'answer',
    fields: [
      { id: 'feed', label: 'Feed name', placeholder: 'one or two words' },
      { id: 'family', label: 'Malware family', placeholder: 'one word' },
    ],
    hints: ['One nudge only in Hard mode — spend it wisely.'],
    nudge: 'sha256sum /evidence/svch0st.exe → BLOCKLIST → read Feed and Category fields.',
    jumpTo: 'shell',
  },
  {
    id: 'H6',
    mode: 'hard',
    pillar: 'P4',
    title: 'Perform the containment sequence in the correct order: isolate → quarantine → block → escalate.',
    context: 'Order matters: stop the implant’s comms first, remove it second, cut the perimeter third, escalate fourth.',
    anchor: 'Mitigation — sequenced incident response using EDR, blocklist and SIEM',
    kind: 'state',
    hints: ['One nudge only in Hard mode — spend it wisely.'],
    nudge: 'Isolate host (EDR) → Quarantine file (EDR) → Block IP (Blocklist) → Escalate A-1047 (SIEM).',
    jumpTo: 'edr',
  },
  {
    id: 'H7',
    mode: 'hard',
    pillar: 'P3',
    title: 'Rule tuning: select the detection rule that catches lookalike domains with the fewest false positives.',
    context: 'Four candidate rules exist in the SIEM Tuning tab. Only one balances signal and noise.',
    anchor: 'Detection engineering — writing/tuning a detection (precision vs recall)',
    kind: 'state',
    hints: ['One nudge only in Hard mode — spend it wisely.'],
    nudge: 'Tuning tab: alert on new registrations (<30 days) that contain the brand token — not on all DNS, not on a single substring.',
    jumpTo: 'siem',
  },
  {
    id: 'H8',
    mode: 'hard',
    pillar: 'P1',
    title: 'Residual risk: pick the statement that correctly explains why signatures missed this threat, and the risk that remains.',
    context: 'Containment is not a happy ending. What does the tooling still not see?',
    anchor: 'Endpoint protection — limitations of signature engines; residual risk',
    kind: 'state',
    hints: ['One nudge only in Hard mode — spend it wisely.'],
    nudge: 'The binary was never seen before — no signature existed. Siblings of unknown families can still slip through: hunt, don’t assume.',
    jumpTo: 'notes',
  },
  {
    id: 'H9',
    mode: 'hard',
    pillar: 'P1',
    title: 'Tool-fit matrix: assign all five scenarios to the correct tool — including the “many others”.',
    context: 'The lesson says “and many others”. Two of these scenarios belong to tools this bench does not even own.',
    anchor: 'Full tool inventory — endpoint protection, CLI, registry, blocklist, SIEM, sandbox, OSINT',
    kind: 'state',
    hints: ['One nudge only in Hard mode — spend it wisely.'],
    nudge: '1→Command line, 2→Blocklist, 3→Domain registry, 4→SIEM, 5→Sandbox (“many others”).',
    jumpTo: 'primer',
  },
  {
    id: 'H10',
    mode: 'hard',
    pillar: 'P3',
    title: 'Reconstruct the attack timeline: order the four events of the compromise.',
    context: 'Use DNS logs, firewall rows and the pcap. First contact to first beacon.',
    anchor: 'Correlation — timeline reconstruction across data sources (incl. tcpdump)',
    kind: 'state',
    hints: ['One nudge only in Hard mode — spend it wisely.'],
    nudge:
      'Order by what the evidence shows: the DNS query (02:14:19), the phishing-site connection (02:14:22), the process spawn event (02:17:47), then the first beacon connection (02:17:48). The EDR alert stamp (02:17:51) is when detection FIRED — the process event itself is earlier.',
    jumpTo: 'siem',
  },
];

/* ---------------------------- Primer content ------------------------------ */

const FAMILIES = [
  {
    icon: 'shield-alert',
    name: 'Endpoint protection (EPP / EDR)',
    what: 'Prevents and watches what runs on a device. EPP scans known signatures; EDR models behavior (process trees, file writes, connections) and lets analysts quarantine files or isolate hosts.',
    gotcha: 'Signatures are blind to novel malware; heuristics/behavioral catch more but cry wolf — triage every alert.',
  },
  {
    icon: 'terminal',
    name: 'Command-line tools',
    what: 'Direct questions to a live system: netstat/ss (sockets), tasklist/ps (processes), nslookup/dig (DNS), curl (HTTP), grep/head/tail (logs), sha256sum (fingerprints), tcpdump (packets).',
    gotcha: 'Answers are point-in-time — capture quickly, and know the Windows vs Linux variants.',
  },
  {
    icon: 'globe',
    name: 'Domain registries (WHOIS)',
    what: 'Public registration records: registrar, creation date, registrant, name servers. Turns an unfamiliar domain into a freshness-and-ownership story.',
    gotcha: 'Privacy shields hide registrants — that alone is not proof; weigh it with age and anatomy.',
  },
  {
    icon: 'ban',
    name: 'Blocklists & reputation feeds',
    what: 'Curated lists of known-bad IPs, domains and file hashes (DNSBLs, C2 feeds, hash exchanges). One lookup can confirm hours of research.',
    gotcha: 'Reactive by design: a clean result never proves innocence.',
  },
  {
    icon: 'radar',
    name: 'SIEM',
    what: 'Aggregates logs from firewalls, DNS, EDR and auth systems; correlates them into alerts; dashboards them for humans. The fusion center of the bench.',
    gotcha: 'A SIEM is only as good as its data sources and its tuning — noisy rules burn analysts out.',
  },
];

const PIPELINE = [
  { step: '1 · ALERT', text: 'SIEM or EDR surfaces something (correlation rule, behavioral anomaly).' },
  { step: '2 · VERIFY', text: 'Command line confirms on-host: netstat → PID → tasklist → path → hash.' },
  { step: '3 · ENRICH', text: 'WHOIS + blocklists add outside context: fresh? listed? known family?' },
  { step: '4 · ACT', text: 'EDR quarantine/isolate; perimeter blocks from the feed verdict.' },
  { step: '5 · DISPOSE', text: 'Escalate true positives with an evidence tuple; document and close false positives.' },
];

const REAL_WORLD = [
  {
    ref: 'ATT&CK T1057 — Process Discovery',
    text: 'MITRE documents groups such as APT1 (G0006) and Andariel (G0138) running process-discovery commands like tasklist — the same command you will run tonight, from the other side of the keyboard.',
    url: 'https://attack.mitre.org/techniques/T1057/',
  },
  {
    ref: 'ATT&CK T1049 — System Network Connections Discovery',
    text: 'netstat-family commands are documented tradecraft (e.g., admin@338, G0018; Andariel, G0138). Defenders run them for triage — attackers run them to map what they landed on.',
    url: 'https://attack.mitre.org/techniques/T1049/',
  },
  {
    ref: 'ATT&CK T1071.001 — Web Protocols',
    text: 'SUNBURST blended its C2 into HTTPS — the reason "port 443" alone proves nothing, and why beacon cadence and destination reputation matter more.',
    url: 'https://attack.mitre.org/techniques/T1071/001/',
  },
  {
    ref: 'ATT&CK T1566.002 — Spearphishing Link',
    text: 'Tonight’s entry point: a link to a lookalike domain. Phishing-link campaigns remain the most common first contact.',
    url: 'https://attack.mitre.org/techniques/T1566/002/',
  },
];

const TOOL_OPTIONS = [
  { value: 'siem', label: 'SIEM' },
  { value: 'registry', label: 'Domain registry (WHOIS)' },
  { value: 'sandbox', label: 'Sandbox detonation ("many others")' },
  { value: 'cli', label: 'Command-line tools' },
  { value: 'blocklist', label: 'Blocklists / reputation feeds' },
  { value: 'edr', label: 'Endpoint protection (EPP/EDR)' },
];

const MATCH_SLOTS = [
  { id: 'a', text: '“Which process owns this connection — and from what path?”' },
  { id: 'b', text: '“Who registered this domain, and when?”' },
  { id: 'c', text: '“Fuse 40,000 overnight events into a handful of prioritized alerts.”' },
];

const FIT_SLOTS = [
  { id: 's1', text: 'Live question: which process opened this socket, right now?' },
  { id: 's2', text: 'Is this file hash known-bad anywhere in the community?' },
  { id: 's3', text: 'Who owns this domain and where are its name servers?' },
  { id: 's4', text: 'Correlate auth, DNS, firewall and EDR events across 40 log sources.' },
  { id: 's5', text: 'Safely detonate a suspicious attachment and record its behavior.' },
];

/* ---------------------------- SIEM tool content --------------------------- */

const CAUSE_OPTIONS = [
  { id: 'spray', label: 'External attacker password-spraying the account' },
  { id: 'svc_retry', label: 'Expired service credential — backup-server retry loop' },
  { id: 'mfa', label: 'Misconfigured MFA throttling on the account' },
  { id: 'dup', label: 'Duplicate account conflict after a migration' },
];

const TUNING_RULES = [
  {
    id: 'a',
    label: 'Rule A — alert on every external DNS query from any endpoint',
    note: 'Catches everything, including the 40,000 normal lookups per night. Signal-to-noise ≈ 0.',
  },
  {
    id: 'b',
    label: 'Rule B — alert on queries for domains registered <30 days that contain the brand token (“alderwood”)',
    note: 'Encodes the attacker pattern: brand impersonation on fresh infrastructure. Quiet during normal business.',
  },
  {
    id: 'c',
    label: 'Rule C — block every domain younger than 30 days at the resolver',
    note: 'Breaks marketing launches, new vendors, CI pipelines. Detection that stops the business is a detection nobody keeps.',
  },
  {
    id: 'd',
    label: 'Rule D — alert on any domain containing the substring “-secure”',
    note: 'Trivially evaded (“s3cure”, “verified”, subdomains) and matches plenty of benign sites.',
  },
];

const TIMELINE_EVENTS = [
  { id: 'dns', label: 'DNS query for alderwoodportal-secure[.]com from WS-ENG-014' },
  { id: 'phishconn', label: 'HTTPS connection to 45.62.198.140 — the phishing site' },
  { id: 'spawn', label: 'svch0st.exe spawned in Temp (EDR process event)' },
  { id: 'beacon', label: 'First C2 beacon to 185.199.72.44:443' },
];
const TIMELINE_OFFER_ORDER = ['beacon', 'dns', 'spawn', 'phishconn'];

const SIEM_DRILL = [
  { id: 'a', text: 'Pull firewall, DNS, EDR and auth logs from 40 sources into one searchable place.' },
  { id: 'b', text: 'Fire one alert when a failed-login burst is followed by a success within 30 minutes.' },
  { id: 'c', text: 'Give the shift lead a live wall view of alert volume by hour and severity.' },
];
const SIEM_DRILL_OPTIONS = [
  { value: 'dashboard', label: 'Dashboarding' },
  { value: 'av', label: 'Antivirus scanning' },
  { value: 'aggregation', label: 'Aggregation' },
  { value: 'correlation', label: 'Correlation' },
];

const SIEM_DASH_BARS = [4, 3, 5, 2, 6, 4, 3, 7, 5, 4, 6, 3, 5, 4, 7, 5, 6, 8, 6, 5, 22, 18, 9, 6];

const SIEM_DASH_CAPTION =
  'The 02:00–03:00 spike (red) is tonight’s incident cluster: auth burst + process chain + beaconing + lookalike DNS. Aggregation makes the cluster visible; correlation names it; you decide what it means.';
const SIEM_DASH_SOURCES = 'firewall/NetFlow · DNS resolvers · domain controllers (auth) · EDR telemetry · IDS sensors';

/* -------------------------- Field notes content --------------------------- */

const DETECTION_OPS = [
  {
    source: 'DNS query logs (resolver)',
    logic: 'Alert on queries for domains registered <30 days whose name contains brand tokens (e.g. “alderwood”). Tuned version of NEWDOM/LOOKALIKE — see Rule B in the SIEM.',
  },
  {
    source: 'Firewall / NetFlow',
    logic: 'Alert on periodic egress from client OSes to a single external IP:port (metronomic spacing ≈ beacon cadence). Tonight: 02:17 / 02:33 / 02:48 / 03:03.',
  },
  {
    source: 'EDR process telemetry',
    logic: 'Alert on processes executing from user-writable paths (Temp, AppData) — weight heavier when the name mimics a system binary or the parent chain is anomalous (browser → shell → binary).',
  },
  {
    source: 'Authentication logs',
    logic: 'Correlate failure bursts per source with any subsequent success; add allowlist context for known service accounts to kill the retry-loop false positive.',
  },
  {
    source: 'File reputation (hash feeds)',
    logic: 'Compute SHA-256 on flagged binaries and check community hash exchanges — a hit instantly ties your sample to other victims’ telemetry.',
  },
];

const MITIGATIONS = [
  {
    label: 'Managed EDR with behavioral policies + tuned allowlists on every endpoint',
    ref: 'M1049 — Antivirus/Antimalware (MITRE ATT&CK)',
    url: 'https://attack.mitre.org/mitigations/M1049/',
  },
  {
    label: 'Egress filtering and rapid perimeter blocks sourced from reputation feeds',
    ref: 'M1030 — Network Segmentation (MITRE ATT&CK)',
    url: 'https://attack.mitre.org/mitigations/M1030/',
  },
  {
    label: 'DNS filtering / resolver-level blocking of lookalike and newly-registered domains',
    ref: 'D3-DNSTA — DNS Traffic Analysis (MITRE D3FEND)',
    url: 'https://d3fend.mitre.org/technique/d3f:DNSTrafficAnalysis/',
  },
  {
    label: 'Continuous network monitoring for beacon cadence and C2 infrastructure',
    ref: 'D3-NTA — Network Traffic Analysis (MITRE D3FEND)',
    url: 'https://d3fend.mitre.org/technique/d3f:NetworkTrafficAnalysis/',
  },
  {
    label: 'Endpoint process analytics watching for masquerading and wrong-path execution',
    ref: 'D3-PA — Process Analysis (MITRE D3FEND)',
    url: 'https://d3fend.mitre.org/technique/d3f:ProcessAnalysis/',
  },
];

const BLUE_TEAM = [
  'Chain your tools — an alert is a question, not an answer: verify on-host (CLI), enrich outside (WHOIS/feeds), act (EDR), then decide.',
  'Beacon math is free detection: 02:17, 02:33, 02:48, 03:03 is a 15-minute drumbeat. Aggregate egress per destination and cadence pops out.',
  'Treat every false positive as a tuning request; document the rationale or the same alert will burn the next shift.',
  'Contain in order — isolate (cut C2) → quarantine (remove implant) → block (protect everyone else) → escalate (humans + hunt).',
];

const RED_TEAM = [
  'If I landed via a phishing link, I want my implant somewhere writable and anonymous: %TEMP%, a system-mimic name, unsigned — your EDR watches exactly that, so I rotate names and hosts.',
  'I beacon on 443 because it is invisible in port-based reviews — only cadence and destination reputation betray me.',
  'Fresh infrastructure is cheap: a two-day-old, privacy-shielded domain costs $10. Your DNS logs are the only place I consistently leave footprints.',
  'Your allowlist is my favorite document — anything marked “trusted by path or owner” is a free lane. Governance or it did not happen.',
];

const NOTES_LINKS = [
  { label: 'ATT&CK T1057 — Process Discovery', url: 'https://attack.mitre.org/techniques/T1057/' },
  { label: 'ATT&CK T1049 — System Network Connections Discovery', url: 'https://attack.mitre.org/techniques/T1049/' },
  { label: 'ATT&CK T1071.001 — Application Layer Protocol: Web Protocols', url: 'https://attack.mitre.org/techniques/T1071/001/' },
  { label: 'ATT&CK T1566.002 — Phishing: Spearphishing Link', url: 'https://attack.mitre.org/techniques/T1566/002/' },
  { label: 'ATT&CK M1049 — Antivirus/Antimalware', url: 'https://attack.mitre.org/mitigations/M1049/' },
  { label: 'ATT&CK M1030 — Network Segmentation', url: 'https://attack.mitre.org/mitigations/M1030/' },
  { label: 'D3FEND D3-DNSTA — DNS Traffic Analysis', url: 'https://d3fend.mitre.org/technique/d3f:DNSTrafficAnalysis/' },
  { label: 'D3FEND D3-NTA — Network Traffic Analysis', url: 'https://d3fend.mitre.org/technique/d3f:NetworkTrafficAnalysis/' },
  { label: 'D3FEND D3-PA — Process Analysis', url: 'https://d3fend.mitre.org/technique/d3f:ProcessAnalysis/' },
  { label: 'CompTIA CySA+ CS0-003 — exam objectives', url: 'https://www.comptia.org/training/by-certification/cysa' },
];

const RESIDUAL_OPTIONS = [
  {
    id: 'a',
    label:
      'No signature existed — the binary was never seen before; unknown siblings can still slip past, so keep hunting the phishing path.',
  },
  {
    id: 'b',
    label: 'Signatures are outdated technology and should be disabled in favor of behavioral engines only.',
  },
  {
    id: 'c',
    label: 'The file was signed with a stolen certificate, which always bypasses signature engines.',
  },
  {
    id: 'd',
    label: 'Signature engines only scan on schedule, so the file was simply not scanned yet.',
  },
];

/* ------------------------- Completion modal content ----------------------- */

const QUIZ_TOPICS = {
  MQ1: 'What a SIEM does — aggregation, correlation, dashboards',
  MQ2: 'Signature-based detection — strengths and blindness',
  MQ3: 'How behavioral detection catches novel malware',
  MQ4: 'Reading WHOIS — domain age, privacy shields, phishing anatomy',
  MQ5: 'Blocklists and reputation feeds — HIT vs NO-HIT limits',
  MQ6: 'The command-line triage chain — netstat → PID → tasklist',
  MQ7: 'False-positive handling and rule-tuning discipline',
  HQ1: 'From netstat to tasklist — the PID-to-binary bridge',
  HQ2: 'Forming defensible domain verdicts from WHOIS records',
  HQ3: 'Containment sequencing — isolate → quarantine → block → escalate',
  HQ4: 'Rule tuning — precision versus raw volume',
  HQ5: 'Handling heuristic false positives with governance',
  HQ6: 'Distinguishing password spraying from credential-retry loops',
  HQ7: 'Recognizing beaconing cadence in egress traffic',
  HQ8: 'Reading saved packet captures with tcpdump',
};

const NEXT_STEPS = [
  { label: 'Retake the other difficulty mode — same bench, deeper water', note: 'Mode selection on reload (or RESET).' },
  { label: 'CompTIA CySA+ CS0-003 objectives', url: 'https://www.comptia.org/training/by-certification/cysa' },
  { label: 'MITRE ATT&CK — Technique pages used tonight', url: 'https://attack.mitre.org/techniques/enterprise/' },
  { label: 'MITRE D3FEND — countermeasure catalog', url: 'https://d3fend.mitre.org/' },
];

const MASTERY_RUBRIC = [
  '✓ Explain how the five tool families catch malicious activity — and where each one is blind.',
  '✓ Identify masqueraded processes, lookalike domains, beaconing and auth anomalies in raw evidence.',
  '✓ Choose and justify the right detection approach — and tune a rule that keeps its signal.',
  '✓ Sequence containment (isolate → quarantine → block → escalate) and name the residual risk.',
];

/* ------------------------------ Shell content ----------------------------- */

const SHELL_HELP = [
  'TRIAGE CONSOLE v2.4 — SIMULATED SHELL · SYNTHETIC TRAINING DATA ONLY',
  'Jump console attached to two hosts. Switch context with:  use <HOSTNAME>',
  '',
  '  HOST: WS-ENG-014 (Windows)                 HOST: WEB-LNX-02 (Linux)',
  '    netstat -ano    sockets + owning PID       ps aux          processes',
  '    tasklist /v     processes + paths          ss -tunlp       sockets + owner',
  '    ipconfig /all   network configuration      ifconfig        network config',
  '',
  '  CONSOLE-SIDE (any host):',
  '    nslookup <domain> · dig <domain>          resolve DNS',
  '    whois <domain>                            registration record',
  '    curl -sI <domain|url>                     fetch HTTP response headers',
  '    traceroute <ip> · ping <host>             path / reachability',
  '    ls [dir] · head <file> · tail <file> · cat <file>',
  '    grep <pattern> <file>                     search a text file',
  '    sha256sum <file>                          file fingerprint',
  '    tcpdump -r /evidence/harbor.pcap          read a saved packet capture',
  '    clear',
  '',
  '  Files live in /logs (resolver, auth, firewall, EDR) and /evidence.',
];

const INITIAL_TERMINAL = [
  'TRIAGE CONSOLE v2.4 — SIMULATED SHELL · SYNTHETIC TRAINING DATA ONLY',
  'Current host context: WS-ENG-014. Type  help  to see the command set.',
];

const WAKEUP_HASH = '5d41402abc4b2a76b9719d911017c592fe9a1b3c8d40f2e7a6b5c4d3e2f10918';
const EML_HASH = 'c21f969b5f03d33d43e04f8f136e7682ad1a2b3c4d5e6f708192a3b4c5d6e7f8';

const TERM_QUICK_CMDS = [
  'help',
  'netstat -ano',
  'tasklist /v',
  'use WEB-LNX-02',
  'sha256sum /evidence/svch0st.exe',
  'tcpdump -r /evidence/harbor.pcap',
];

/* --------------------------------- Quiz ----------------------------------- */

const MEDIUM_QUIZ = [
  {
    id: 'MQ1',
    scenario: 'A colleague asks what a SIEM actually does. The most accurate answer:',
    options: [
      'It scans endpoint files for every known malware signature',
      'It filters perimeter traffic between the company’s network zones',
      'It correlates events from many sources into prioritized alerts',
      'It encrypts and archives every log the company produces',
    ],
    answer: 2,
    explanation:
      'A SIEM is a fusion engine: aggregation (many sources, one place), correlation (events combined into alerts) and dashboards (human-readable views). Option A describes endpoint protection — signature scanning lives on the endpoint, not in the SIEM. Option B describes a firewall, which filters traffic rather than fusing telemetry. Option D describes log storage hygiene, which says nothing about detecting attacks. The SIEM does not replace other tools — it makes their telemetry answerable.',
  },
  {
    id: 'MQ2',
    scenario: 'Signature-based detection is best described as:',
    options: [
      'Matching files or traffic against patterns of known threats',
      'Modeling normal activity and alerting when the pattern deviates',
      'Guessing malicious intent from a file’s internal structure alone',
      'Blocking any software that arrives without a vendor signature',
    ],
    answer: 0,
    explanation:
      'Signatures are the industry’s shared memory of known threats: fast and precise, but blind to anything never seen before — which is exactly why the adware (E-703) died instantly while svch0st.exe walked in. Option B is behavioral detection — the engine that actually caught E-701. Option C describes static heuristic analysis, which infers from properties, not known-bad matches. Option D is a crude signing policy, not detection: signed software goes bad, and legitimate tools ship unsigned.',
  },
  {
    id: 'MQ3',
    scenario: 'Why did the behavioral engine flag svch0st.exe when no signature matched it?',
    options: [
      'Because a vendor had published the file’s hash already',
      'Because the file was much larger than normal binaries',
      'Because its code-signing certificate had already expired weeks before',
      'Because its behavior pattern deviated: mimic name, Temp path',
    ],
    answer: 3,
    explanation:
      'Behavioral detection watches what software DOES: where it runs from, what launched it, what it touches. Novel malware has no signature, but the pattern "browser → shell → system-mimic binary in Temp" is a loud anomaly. Option A is backwards — a published hash would make this a signature case, and svch0st.exe was unseen. Option B: file size is not a detection signal. Option C: the binary was unsigned entirely, not expired-signed. The cost of behavioral engines is more false positives — see E-702 — which is why analyst judgment stays in the loop.',
  },
  {
    id: 'MQ4',
    scenario: 'WHOIS shows a lookalike domain was registered 2 days ago behind a privacy shield. In a phishing investigation this is:',
    options: [
      'Irrelevant — anyone can register a domain at any time',
      'A strong risk indicator: fresh, anonymized, brand-lookalike campaign infrastructure',
      'Proof by itself that the workstation is already compromised',
      'A detail that only registrars and law enforcement need',
    ],
    answer: 1,
    explanation:
      'Domain age is one of the highest-value phishing signals: legitimate brand properties are old and identify their owner. Fresh + privacy-shielded + brand-token anatomy is a campaign pattern — corroborate with blocklists and DNS, then act. Option A is the classic miss: registration facts are free context. Option C overstates the evidence — a WHOIS record implicates infrastructure, not a host, until you correlate (tonight’s DNS query from WS-ENG-014 is what tied them). Option D is wrong because the record is public and written for defenders too.',
  },
  {
    id: 'MQ5',
    scenario: 'A DNS blocklist / IP reputation feed is best described as:',
    options: [
      'A local cache that speeds up repeated DNS lookups',
      'A firewall policy language used for blocking unwanted traffic',
      'A public list of software licenses the company owns',
      'A curated, updated feed of known-bad IPs, domains, hashes',
    ],
    answer: 3,
    explanation:
      'Feeds turn community experience into instant verdicts. Option A describes a resolver cache — it answers faster, not better. Option B is a firewall’s rule language — enforcement, not intelligence. Option C is software asset management. Remember both directions: a HIT accelerates confirmation, but a NO HIT never proves innocence — feeds are reactive, and new infrastructure is always unseen at first.',
  },
  {
    id: 'MQ6',
    scenario: 'netstat -ano shows an ESTABLISHED connection from a workstation to an external IP on port 443 at 03:00. Your first move:',
    options: [
      'Map the connection’s PID to a process with tasklist',
      'Reboot the workstation and check whether the connection recurs',
      'Unplug the department switch to stop the suspicious traffic',
      'Email the user and wait for a written reply',
    ],
    answer: 0,
    explanation:
      'netstat answers "what and where"; the PID bridges to tasklist, which answers "who and from where". Endpoint → process → path → hash → reputation is the verification chain, one CLI step at a time. Option B destroys volatile evidence and answers nothing. Option C breaks connectivity for an entire department to isolate one socket. Option D waits hours while a live implant keeps beaconing — and the user may be the deceived party, not the informant.',
  },
  {
    id: 'MQ7',
    scenario: 'You confirm an SIEM alert was a false positive. The professional takeaway:',
    options: [
      'The SIEM is broken and should be replaced entirely',
      'False positives prove that the attacker successfully evaded detection',
      'Benign activity matched the logic; document it, then tune',
      'Disable the rule that fired to reduce the noise',
    ],
    answer: 2,
    explanation:
      'False positives are the cost of sensitivity, not a defect. Each one handled well — documented rationale, tuned rule, preserved trust — makes the queue sharper. Option A confuses tuning debt with a broken product. Option B confuses false positives with false negatives: evasion is when real malicious activity goes UNalerted. Option D deletes signal because it once cried wolf — that is precisely how false negatives are born.',
  },
];

const HARD_QUIZ = [
  {
    id: 'HQ1',
    scenario: 'netstat -ano on a workstation shows: TCP 10.4.12.14:52390 185.199.72.44:443 ESTABLISHED PID 8212, at 02:17. The strongest next command:',
    options: [
      'ipconfig /all to capture fresh adapter and DNS settings',
      'tasklist /v to map PID 8212 to its binary',
      'sha256sum over the whole Temp directory to fingerprint files',
      'Reboot the workstation and check whether it happens again',
    ],
    answer: 1,
    explanation:
      'The PID is the thread that ties the network event to a binary on disk. tasklist /v gives name + path; that decides everything downstream (hash it, reputation-check it, quarantine it). Option A re-reads configuration you already hold — it cannot identify a process. Option C fingerprints everything in Temp because you do not yet know which file matters — wasteful when the PID narrows it to one. Option D destroys volatile evidence mid-incident.',
  },
  {
    id: 'HQ2',
    scenario: 'WHOIS for a lookalike domain: created 2 days ago, registrant REDACTED FOR PRIVACY, budget registrar. Most defensible verdict:',
    options: [
      'Safe — privacy protection is standard practice for real businesses',
      'Escalate to the registrar and wait for a takedown',
      'Ignore it until some user eventually reports a problem',
      'Malicious-leaning — corroborate with reputation feeds and DNS, then block',
    ],
    answer: 3,
    explanation:
      'Fresh + anonymized + brand-lookalike is the canonical phishing-infrastructure pattern. The professional move is corroboration (feeds, DNS, mail logs) then decisive action — not paralysis, and not hoping. Option A is the trap: privacy shields ARE common, but combined with a 2-day age and brand token they describe campaign infrastructure. Option B outsources your decision and surrenders the clock. Option C is the "wait for victim zero" school of incident response.',
  },
  {
    id: 'HQ3',
    scenario: 'The Temp binary’s hash hits a malware feed. The correct containment sequence:',
    options: [
      'Isolate the host, quarantine the file, block the IP, escalate',
      'Quarantine the file, delete it, reimage the host, move on',
      'Reimage the workstation immediately without preserving any evidence at all',
      'Block the user’s account and wait for the morning shift',
    ],
    answer: 0,
    explanation:
      'Sequence matters: cut the implant’s communications (isolate), remove it (quarantine), protect the rest of the estate (perimeter block), then escalate with a complete tuple so responders can hunt for siblings. Option B jumps to removal and destroys the evidence responders need. Option C destroys patient zero — and any chance of hunting sibling binaries. Option D punishes the user while the implant keeps beaconing all night.',
  },
  {
    id: 'HQ4',
    scenario: 'A rule that alerts on "any external DNS query" generates 4,000 alerts a day. The best fix:',
    options: [
      'Disable DNS logging entirely to cut the alert volume',
      'Raise the alert threshold slightly above the daily volume',
      'Keep full logging; alert only on brand-token new domains',
      'Hire additional analysts to triage the growing queue manually',
    ],
    answer: 2,
    explanation:
      'Tuning is precision engineering, not volume reduction: keep full logging for hunting, and alert only on patterns that encode attacker intent. Option A blinds hunting to satisfy the queue — logging is not alerting. Option B changes nothing about signal quality; tomorrow the noise is 4,001. Option D spends salary on what one well-aimed rule does for free. Signal density is what keeps a two-person SOC alive.',
  },
  {
    id: 'HQ5',
    scenario: 'The EDR heuristic engine flags a known IT maintenance script (wakeup.bat) that has run nightly for two years. Best handling:',
    options: [
      'Turn off heuristic detection to stop these noisy alerts',
      'Review with IT; allowlist with change record; watch drift',
      'Permanently trust every single script that lives under C:\\IT',
      'Escalate the same script as critical every single night',
    ],
    answer: 1,
    explanation:
      'Allowlisting is governance, not rubber-stamping: documented scope, reviewed owner, monitored exceptions. Option A removes your best novel-threat engine over one known script. Option C is blanket trust by directory path — exactly the free lane attackers hunt for. Option D burns analyst hours nightly and drowns real criticals in routine. And "watch drift" matters: an allowlisted script whose behavior changes should re-alert.',
  },
  {
    id: 'HQ6',
    scenario: '47 failed logins, then 1 success — all for user svc_backup, all from internal host 10.4.7.21, success at the exact minute of credential rotation. Best hypothesis:',
    options: [
      'External password spraying across many user accounts at once',
      'Kerberos ticket forgery by a highly privileged domain attacker',
      'An insider deliberately brute-forcing a single high-value service account',
      'A retry loop on one expired service-account password',
    ],
    answer: 3,
    explanation:
      'Spraying spreads few guesses across MANY users; this is MANY attempts on ONE service account from one internal host, resolving at rotation time. Pattern shape, source and timing all point to a benign retry loop — verify the host job logs, document, close. Option A requires many usernames, not one. Option B would show ticket anomalies, not password failures. Option C has no plausible motive at 02:20 against a backup account.',
  },
  {
    id: 'HQ7',
    scenario: 'Firewall logs show egress from one workstation to a single external IP on 443 every ~15 minutes, metronomically, all night. This is:',
    options: [
      'Beaconing; correlate the process and destination reputation now',
      'Normal CDN browsing behavior over an encrypted connection',
      'Routine NTP time synchronization keeping the clocks accurate',
      'A scheduled backup job replicating to cloud storage',
    ],
    answer: 0,
    explanation:
      'Client operating systems browse irregularly; implants check in on schedule. Fixed-interval egress to one destination is a top-tier C2 tell — pair it with netstat/tasklist on the host and a reputation lookup on the destination. Option B fails on cadence and fan-out: CDNs resolve to many destinations, not one metronomic IP. Option C uses NTP on port 123, not TLS on 443. Option D moves bulk data, not kilobyte check-ins — and backup targets are internal.',
  },
  {
    id: 'HQ8',
    scenario: 'You saved a packet capture to /evidence/harbor.pcap. Which command reads it?',
    options: [
      'netstat -ano /evidence/harbor.pcap',
      'sha256sum -r /evidence/harbor.pcap',
      'tcpdump -r /evidence/harbor.pcap',
      'grep -w /evidence/harbor.pcap',
    ],
    answer: 2,
    explanation:
      'tcpdump -r reads a saved capture ( -i captures live instead ). Option A lists live sockets — it cannot open a file. Option B fingerprints a file you want to read. Option D searches text files with a pattern; a pcap is binary. Reading raw packets is one of the lesson’s "many other" tools — and it is how the 15-minute beacon cadence becomes provable, not assumed.',
  },
];

/* ------------------------------ Mode copy --------------------------------- */

const MODE_COPY = {
  kicker: 'CyberLab · CompTIA CySA+ CS0-003 · Lesson 10.1',
  title: 'The Analyst’s Bench',
  lede:
    'Identifying Malicious Activity — master the five tool families of the watch floor: endpoint protection, command line, domain registries, blocklists and the SIEM. Then prove it on a live (simulated) incident.',
  medium: {
    aria: 'Choose Guided Watch (medium) mode',
    name: 'Guided Watch',
    micro: 'Medium · learn with a mentor',
    desc:
      '12 objectives taken in order, each with context and a “where to look” trail. Three hint levels per objective — free to use, they just cost star rating. Forgiving validation and a 7-question concept quiz. You leave able to explain every step.',
    bullets: [
      '12 guided objectives · 4 mastery pillars',
      'same live case — calmer watch floor',
      'hints open · checks tolerant',
    ],
  },
  hard: {
    aria: 'Choose Night Watch (hard) mode',
    name: 'Night Watch',
    micro: 'Hard · solo, noisy, unrelenting',
    desc:
      'It is 02:00 and you are alone. 10 deep challenges across the same case — but the evidence is noisier, three alerts are wrong, validation is strict, and you get at most one nudge per objective, each visibly costing score. The quiz is scenario triage, not recall.',
    bullets: [
      '10 multi-step challenges · strict checks',
      'red herrings live in the queue',
      'hints locked by default',
    ],
  },
  storageNote:
    'Progress autosaves in your browser (localStorage). A clearly-labeled RESET restores the pristine lab. Defensive/educational use only.',
  hardBrief:
    'NIGHT WATCH BRIEF: three of tonight’s six alerts are wrong. Trust nothing; verify everything.',
};

const RAIL_KEYS = [
  { id: 'primer', label: 'Primer', icon: 'book-open' },
  { id: 'edr', label: 'EDR', icon: 'shield-alert' },
  { id: 'shell', label: 'Shell', icon: 'terminal' },
  { id: 'whois', label: 'WHOIS', icon: 'globe' },
  { id: 'blocklist', label: 'Feeds', icon: 'ban' },
  { id: 'siem', label: 'SIEM', icon: 'radar' },
  { id: 'notes', label: 'Notes', icon: 'clipboard-list' },
  { id: 'quiz', label: 'Quiz', icon: 'graduation-cap' },
];

/* instruments that still hold open objectives per mode (LED dots on the rail) */
const INSTRUMENT_OPEN_WORK = {
  primer: ['M8', 'H9'],
  edr: ['M3', 'M9', 'H6'],
  shell: ['M1', 'M2', 'M11', 'H2', 'H5'],
  whois: ['M4', 'H3'],
  blocklist: ['M5', 'M11', 'H5', 'H6'],
  siem: ['M6', 'M7', 'M10', 'M12', 'H1', 'H4', 'H7', 'H10'],
  notes: ['H8'],
  quiz: [],
};
