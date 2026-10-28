// ── Lab content (all data) — carried over 1:1 from the original Aurelia OVC lab ──
// Zones, sensors, widgets, response/triage/countermeasure content, glossary,
// knowledge core, debrief, MITRE alignment, and the full synthetic evidence corpus.
// Every organization, host, account, IP and log line is fictional (TEST-NET ranges).
(function () {
  'use strict';

  // ── Zones (the Coverage Grid) ───────────────────────────────────────────────
  var ZONES = [
    { id: 'endpoints', name: 'Endpoints & Users', blurb: 'Workstations, laptops and the people behind them — the widest attack surface in the estate.', sensors: ['discoveryAgent', 'securityLogs'] },
    { id: 'servers', name: 'Servers & Data', blurb: 'File and application servers holding customer data — the crown-jewel zone.', sensors: ['systemLogs', 'appLogs', 'fim', 'vulnScanner'] },
    { id: 'network', name: 'Network Edge', blurb: 'VPN gateway and every packet crossing the perimeter — where bytes leave the estate.', sensors: ['packetCapture', 'flowMonitor'] },
    { id: 'identity', name: 'Identity & Access', blurb: 'Accounts, credentials and sessions — the who / when / where / how of every resource.', sensors: ['accessReview', 'pamVault'] },
    { id: 'saas', name: 'Cloud & SaaS', blurb: 'Company data flowing through third-party cloud services the firewall cannot inspect.', sensors: ['casb'] }
  ];

  // ── Sensors (the Sensor Bay) ────────────────────────────────────────────────
  var SENSORS = [
    { id: 'syslogRelay', name: 'Syslog Relay & Aggregator', zone: 'central', feed: 'logs', short: 'Forwards every enabled log source into one searchable stream', detail: 'The aggregation point of the whole console: a single relay that collects system, application and security logs and forwards them at a chosen minimum level. Its threshold decides whether you drown in DEBUG chatter or keep clean signal.' },
    { id: 'ntpSync', name: 'NTP Time Sync', zone: 'central', feed: null, short: 'Keeps every host clock aligned so events can be correlated', detail: 'Aggregation without synchronized time produces confident nonsense: events from different hosts interleave in the wrong order and correlation fails. NTP (Network Time Protocol) is a visibility control, not an IT nicety.' },
    { id: 'systemLogs', name: 'System Logs', zone: 'servers', feed: 'logs', short: 'OS-level events: services, cron, packages, drivers', detail: 'System logs record what the operating system and its services did — scheduled jobs, service starts, package changes. They are the baseline lens on any server.' },
    { id: 'appLogs', name: 'Application Logs', zone: 'servers', feed: 'logs', short: 'Events emitted by the software your business runs', detail: 'Application logs show software behavior: batch jobs, exports, errors. They are often the noisiest source — which is exactly why log levels and filtering matter.' },
    { id: 'securityLogs', name: 'Security Logs', zone: 'endpoints', feed: 'logs', short: 'Authentication, authorization and endpoint-security events', detail: 'Security logs capture logon successes and failures, authorization changes and endpoint-defense events. Almost every intrusion story starts here.' },
    { id: 'fim', name: 'File Integrity Monitoring (FIM)', zone: 'servers', feed: 'fim', short: 'Alerts when files drift from a known-good baseline', detail: 'FIM keeps a hash baseline of critical files — configs, scheduled jobs, startup scripts — and reports every out-of-baseline change. It is the earliest tripwire for tampering and persistence.' },
    { id: 'vulnScanner', name: 'Vulnerability Scanner', zone: 'servers', feed: 'vuln', short: 'Periodically probes hosts for exposed weaknesses', detail: 'Scanning is visibility too: it reveals the exposure an attacker would find — weak share permissions, legacy TLS, single-factor paths — before or while they do.' },
    { id: 'discoveryAgent', name: 'Asset Discovery Agent', zone: 'endpoints', feed: 'assets', short: 'Enumerates every device on the estate into one inventory', detail: 'You cannot protect what you have not identified. The discovery agent keeps the inventory honest: 27 assets, each needing an owner and a data classification.' },
    { id: 'packetCapture', name: 'Packet Capture (Edge Tap)', zone: 'network', feed: 'pcap', short: 'Records per-connection traffic crossing the perimeter', detail: 'Packet capture sees the bytes, not the story: conversations, sizes, destinations. Bulk exfiltration that no host will ever log is plainly visible here.' },
    { id: 'flowMonitor', name: 'Network Traffic Analyzer', zone: 'network', feed: 'flow', short: 'Summarizes traffic into volumes and top talkers', detail: 'Flow analytics turn millions of packets into a ranked list: who talked to whom, and how much. Anomalous volume to an unregistered destination stands out immediately.' },
    { id: 'accessReview', name: 'Access Review Collector', zone: 'identity', feed: 'iam', short: 'Records who accessed what, when, from where, and how', detail: 'The access review answers the four questions of access visibility — who, when, where, how — and doubles as compliance evidence for auditors.' },
    { id: 'pamVault', name: 'Privileged Access Management (PAM)', zone: 'identity', feed: 'iam', short: 'Vaults privileged credentials and records privileged sessions', detail: 'PAM removes shared static passwords from circulation and records what privileged accounts actually do. Without it, service accounts are skeleton keys.' },
    { id: 'casb', name: 'CASB — SaaS Discovery', zone: 'saas', feed: 'casb', short: 'Discovers which cloud apps touch company data, sanctioned or not', detail: 'A Cloud Access Security Broker sees SaaS traffic the way a firewall cannot: which apps, which users, how much data. It is the only lens on shadow IT.' }
  ];

  var SENSOR_BY_ID = {};
  SENSORS.forEach(function (s) { SENSOR_BY_ID[s.id] = s; });
  var ZONE_BY_ID = {};
  ZONES.forEach(function (z) { ZONE_BY_ID[z.id] = z; });

  // ── Dashboard builder ───────────────────────────────────────────────────────
  var WIDGETS = [
    { id: 'failedLogons', name: 'Failed logon attempts by host', desc: 'Password guessing and spraying land here first.', fit: true },
    { id: 'offhours', name: 'Off-hours access to sensitive shares', desc: 'The single best lens on unauthorized data access.', fit: true },
    { id: 'fim', name: 'Out-of-baseline file changes (FIM)', desc: 'Tampering with configs and scheduled jobs trips it.', fit: true },
    { id: 'egress', name: 'Outbound traffic volume by destination', desc: 'Bulk data leaving the estate shows instantly.', fit: true },
    { id: 'privLogons', name: 'Privileged & service-account logons', desc: 'Better suited to the PAM-abuse dashboard — a secondary signal here.', fit: false },
    { id: 'vulnCount', name: 'Vulnerability count by severity', desc: 'Belongs on the vulnerability-management dashboard.', fit: false },
    { id: 'assetCov', name: 'Asset inventory coverage %', desc: 'Belongs on the compliance & asset dashboard.', fit: false },
    { id: 'saasNew', name: 'New & unsanctioned SaaS apps', desc: 'Belongs on the shadow-IT dashboard.', fit: false }
  ];
  var DASHBOARD_TARGET = WIDGETS.filter(function (w) { return w.fit; }).map(function (w) { return w.id; });

  // ── Response Desk (Medium OBJ-M12) ──────────────────────────────────────────
  var FINDINGS = [
    { id: 'F1', kind: 'contain', text: 'Account m.reyes belongs to a contractor separated on 31 Jan. It is still active and logged in last week.', correct: 'revoke' },
    { id: 'F2', kind: 'contain', text: 'svc_backup uses one shared static password and shows interactive logons from an external IP.', correct: 'pam' },
    { id: 'F3', kind: 'protect', text: '\\\\FS01\\Manifests-Q3 is writable by the "Everyone" group.', correct: 'acl' },
    { id: 'F4', kind: 'evidence', text: 'The external auditor asks: "Prove who accessed the manifests share over the last quarter."', correct: 'report' }
  ];

  var RESPONSE_ACTIONS = [
    { value: 'revoke', label: 'Disable the account & revoke access (least privilege)' },
    { value: 'pam', label: 'Vault the credential under PAM & restrict to service logons' },
    { value: 'acl', label: 'Re-cut the share ACL to need-to-know' },
    { value: 'report', label: 'Access review report — who / when / where / how' },
    { value: 'debug', label: 'Lower the relay level to DEBUG so nothing is missed' },
    { value: 'wait', label: 'Add it to next quarter’s review backlog' }
  ];

  // ── Triage Desk (Hard OBJ-H4) ───────────────────────────────────────────────
  var TRIAGE_ITEMS = [
    { id: 'T1', text: '800 MB transfer APP01 → 198.51.100.23 at 02:16 — marketing-export job window', answer: 'fp', note: 'Sanctioned, documented export to the analytics vendor. It goes on the allowlist, not in a report.' },
    { id: 'T2', text: 'SYN sweep of the server range from 10.20.8.77 (WK-077) at 03:20', answer: 'fp', note: 'The intern’s authorized scanning lab. Noisy, not malicious — tune it out with documentation.' },
    { id: 'T3', text: 'FIM change on /opt/payments/app.conf at 22:05', answer: 'fp', note: 'Approved patch window; the hash delta matches the vendor release notes.' },
    { id: 'T4', text: 'Five failed logons for d.holt in five minutes, then a success', answer: 'tp', note: 'Classic spray-then-stuff: guess the password, then use it. Always a true positive worth a look.' },
    { id: 'T5', text: '1.9 GB TLS upload FS01 → 203.0.113.9 at 02:57', answer: 'tp', note: 'Bulk egress to a destination with no business registration — assume exfiltration until proven otherwise.' },
    { id: 'T6', text: 'Security log cleared by d.holt at 03:12', answer: 'tp', note: 'Anti-forensic defense evasion; in the middle of an incident it is close to a confession.' }
  ];

  // ── Hard-mode defect options (OBJ-H1) ───────────────────────────────────────
  var DEFECT_OPTIONS = [
    { value: 'relayDebug', label: 'Relay forwarded level was DEBUG — noise flood' },
    { value: 'ntpOff', label: 'NTP time sync was disabled' },
    { value: 'casbOff', label: 'CASB SaaS discovery was disabled' },
    { value: 'pcapOff', label: 'Packet capture was disabled' },
    { value: 'agentOff', label: 'Asset discovery agent was disabled' }
  ];
  var HARD_DEFECT_ANSWER = ['relayDebug', 'ntpOff', 'casbOff'];

  // ── Countermeasure Board (Hard OBJ-H6) ──────────────────────────────────────
  var COUNTERMEASURES = [
    { id: 'mfa', label: 'Enforce MFA on the VPN portal', good: true, why: 'ATT&CK M1032 — breaks the stolen-password replay that started the chain.' },
    { id: 'revoke', label: 'Automate deprovisioning & least-privilege reviews', good: true, why: 'ATT&CK M1018 — closes the stale-account and over-broad share paths.' },
    { id: 'pam', label: 'Vault service accounts under PAM', good: true, why: 'ATT&CK M1026 — removes the shared static svc_backup credential.' },
    { id: 'backup', label: 'Expand the backup window', good: false, why: 'Availability control — does not break this access chain.' },
    { id: 'debug', label: 'Lower the relay level to DEBUG', good: false, why: 'Adds noise, not signal — the opposite of visibility.' },
    { id: 'fimoff', label: 'Disable FIM to reduce alert volume', good: false, why: 'Blinds you to persistence — never trade away a tripwire for quiet.' }
  ];

  // ── Post-mortem (Hard OBJ-H9) ───────────────────────────────────────────────
  var POSTMORTEM_CAUSES = [
    { value: 'skew', label: 'Clock skew between sources prevented accurate correlation' },
    { value: 'debug', label: 'DEBUG noise buried the real events' },
    { value: 'nocasb', label: 'The SaaS zone had no sensor' },
    { value: 'volume', label: 'Too many events for the analysts to read' }
  ];

  // ── Rule Builder (Hard OBJ-H5) ──────────────────────────────────────────────
  var RULE_SOURCES = [
    { value: 'iam', label: 'IAM access log' },
    { value: 'vpn', label: 'VPN session log' },
    { value: 'fim', label: 'FIM events' },
    { value: 'pcap', label: 'Packet capture' }
  ];
  var RULE_FIELDS = [
    { value: 'user', label: 'user' },
    { value: 'resource', label: 'resource' },
    { value: 'source_ip', label: 'source_ip' },
    { value: 'hour_of_day', label: 'hour_of_day' }
  ];
  var RULE_CONDITIONS = [
    { value: 'equals', label: 'equals' },
    { value: 'contains', label: 'contains' },
    { value: 'greater', label: 'greater than' },
    { value: 'less', label: 'less than' }
  ];
  var RULE_TIMEFILTERS = [
    { value: 'none', label: 'None (any time)' },
    { value: 'offhours', label: 'Off-hours only (before 06:00 / after 22:00)' },
    { value: 'business', label: 'Business hours only' }
  ];
  var RULE_SEVERITIES = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  // ── Glossary (19 terms — audit v3 added ACL/DLP/EDR/SIEM for first-use coverage) ─────────────────────────────────────────────────────
  var GLOSSARY = [
    { term: 'Operational Visibility', def: 'Identifying, containing and protecting all data so teams can quickly spot and respond to unauthorized access — the foundation of security operations.' },
    { term: 'Data Source', def: 'Any instrument that records activity — logs, packet capture, FIM, scanners — from which security truth is collected.' },
    { term: 'System Log', def: 'Operating-system events: services, scheduled jobs, packages, drivers.' },
    { term: 'Application Log', def: 'Events emitted by business software — batch jobs, exports, errors — often the noisiest source.' },
    { term: 'Security Log', def: 'Authentication, authorization and endpoint-defense events; where intrusion stories begin.' },
    { term: 'Log Level', def: 'Severity tag per entry: DEBUG, INFO, WARNING, ERROR, CRITICAL. The relay threshold decides what is kept.' },
    { term: 'Syslog Relay', def: 'The aggregation point that forwards enabled sources into one searchable stream at a chosen minimum level.' },
    { term: 'Data Aggregation', def: 'Collecting many sources into one place so events can be correlated across hosts.' },
    { term: 'Packet Capture', def: 'Per-connection recording of network traffic — sees bytes, sizes and destinations that hosts never log.' },
    { term: 'Network Traffic Analysis', def: 'Summarizing traffic into volumes and top talkers to make anomalous transfers stand out.' },
    { term: 'Baseline Configuration', def: 'A known-good snapshot of settings and files that current state is compared against.' },
    { term: 'File Integrity Monitoring', def: 'FIM — hashes critical files against the baseline and reports every out-of-baseline change.' },
    { term: 'Asset Inventory', def: 'The enumerated list of every device and data set on the estate — you cannot protect the unknown.' },
    { term: 'CASB', def: 'Cloud Access Security Broker — discovers which SaaS apps touch company data, sanctioned or not.' },
    { term: 'Access Review', def: 'The record answering who accessed what, when, from where and how — also the auditor’s evidence.' },
    { term: 'ACL', def: 'Access Control List — the permission table on a file share or object that decides who can read, write or change it.' },
    { term: 'DLP', def: 'Data Loss Prevention — controls that watch and block sensitive data leaving through exports, uploads or cloud sync.' },
    { term: 'EDR', def: 'Endpoint Detection and Response — the agent-level sensor on workstations and servers that watches process and file activity.' },
    { term: 'SIEM', def: 'Security Information and Event Management — the platform that aggregates, correlates and retains security logs for detection and audit.' }
  ];

  // ── Knowledge Core content ──────────────────────────────────────────────────
  var CORE_FUNDAMENTALS = [
    { action: 'IDENTIFY', icon: 'scan', text: 'Know what exists: enumerate every asset, every data set, every SaaS app — and classify the data by sensitivity.' },
    { action: 'CONTAIN', icon: 'fence', text: 'Control the reach: least-privilege access, need-to-know shares, vaulted credentials, so data cannot move where it should not.' },
    { action: 'PROTECT', icon: 'shield', text: 'Keep handling correct: retention by policy, monitoring in place, evidence kept for auditors and responders.' }
  ];

  var CORE_SOURCE_TAXONOMY = [
    { name: 'Log data', detail: 'System, application and security logs — tagged by level (DEBUG → CRITICAL) and forwarded through the syslog relay.' },
    { name: 'Data aggregation', detail: 'Relays and aggregators collect every source into one stream so events can be correlated across hosts.' },
    { name: 'Dashboards & reports', detail: 'Dashboards make signals continuously watchable; reports turn them into evidence and communication.' },
    { name: 'Packet capture & traffic analysis', detail: 'Per-connection records and flow summaries — visibility into the bytes hosts never log.' },
    { name: 'Configurations', detail: 'Baseline configurations plus File Integrity Monitoring: every out-of-baseline change is a tripwire.' },
    { name: 'Asset management', detail: 'The inventory with owners and data classifications — the "identify" backbone.' },
    { name: 'Vulnerability scans', detail: 'Scheduled probes that expose the weaknesses an attacker would find.' },
    { name: 'SaaS visibility (CASB)', detail: 'Discovery of sanctioned and shadow cloud apps touching company data.' },
    { name: 'Access reviews', detail: 'Who, when, where, how — for every resource, plus the evidence trail for compliance.' },
    { name: 'Continuous monitoring', detail: 'All of the above watched on a loop — visibility is a practice, not a snapshot.' },
    { name: 'Time synchronization', detail: 'NTP keeps host clocks aligned; without it, correlation across sources falls apart.' }
  ];

  var CORE_ATTACKER_VIEW = [
    { title: 'They hunt your blind spots', body: 'Zones with no sensor — the dark tiles on a coverage grid — are free operating room. Shadow SaaS, forgotten shares and unmanaged laptops are the classic gaps.' },
    { title: 'They clean up behind themselves', body: 'Clearing the security log (audit-clear events) is standard anti-forensics. Without aggregation, deletion on one host silences that host only — with it, the gap itself becomes the alert.' },
    { title: 'They exploit untuned telemetry', body: 'A DEBUG-flooded stream hides them in noise; unsynchronized clocks scramble the timeline. Bad visibility often protects the attacker more than no visibility.' }
  ];

  var CORE_EXAMPLES = [
    { title: 'Log clearing before encryption', body: 'In composite scenarios drawn from public ransomware reporting (dramatized), intruders disable or clear host security logging minutes before detonating encryption — the audit-clear event is often the only warning.' },
    { title: 'Shadow-IT exfiltration', body: 'Employees syncing customer files to personal cloud drives is invisible to perimeter firewalls — plain HTTPS to a sanctioned-looking domain. CASB discovery exists because of exactly this gap.' },
    { title: 'The unsynchronized timeline', body: 'Incident reports have repeatedly mis-ordered attack chains because firewalls, servers and VPN gateways disagreed about the time by minutes — turning a five-step intrusion into an unreadable jumble.' }
  ];

  var MITRE_ALIGNMENT = [
    { label: 'ATT&CK Data Sources', href: 'https://attack.mitre.org/datasources/', note: 'Logon Session, Network Traffic, File, Command Execution, Scheduled Job… (simplified family names used in-lab)' },
    { label: 'M1047 — Audit', href: 'https://attack.mitre.org/mitigations/M1047/', note: 'Comprehensive logging, correct levels, retention' },
    { label: 'M1018 — User Account Management', href: 'https://attack.mitre.org/mitigations/M1018/', note: 'Joiner-mover-leaver, least privilege' },
    { label: 'M1026 — Privileged Account Management', href: 'https://attack.mitre.org/mitigations/M1026/', note: 'Vaulting, no interactive service logons' },
    { label: 'M1032 — Multi-Factor Authentication', href: 'https://attack.mitre.org/mitigations/M1032/', note: 'Remote access without MFA is a door propped open' },
    { label: 'M1022 — Restrict File and Directory Permissions', href: 'https://attack.mitre.org/mitigations/M1022/', note: 'Need-to-know share ACLs' }
  ];

  // ── Debrief content ─────────────────────────────────────────────────────────
  var DEBRIEF_DETECTIONS = [
    { source: 'Security logs (aggregated)', logic: 'Alert when ≥3 failed logons for one user within 5 minutes are followed by a success — and when any audit-clear (log cleared) event fires.' },
    { source: 'IAM access report', logic: 'Alert on any access to sensitive shares outside 06:00–22:00, or from unlisted external geographies.' },
    { source: 'FIM', logic: 'Alert on baseline changes to /etc/cron.d, scheduled-task and startup folders — wherever persistence hides.' },
    { source: 'Traffic flow', logic: 'Alert on >500 MB egress per destination per hour to destinations with no business registration.' },
    { source: 'PAM records', logic: 'Alert on any interactive logon for a service-only account, and on vault-unavailable usage attempts.' }
  ];

  var DEBRIEF_BLUE = [
    'Instrument by zone, then verify with a coverage map — a zone without a sensor is a zone without a story.',
    'Tune levels deliberately: INFO is the operational baseline; DEBUG is for debugging, not for the relay.',
    'Synchronize clocks before you trust any timeline; retention must outlast your auditors’ memory (policy: 12 months).',
    'Review access on a cadence and automate deprovisioning — stale accounts are free keys.',
    'Every allowlisted exception needs documentation, or it becomes tomorrow’s unexplained anomaly.'
  ];

  var DEBRIEF_RED = [
    'Attackers start with your blind spots: unlogged zones, unmanaged assets, shadow SaaS.',
    'A noisy stream is better cover than a silent one — DEBUG floods and alert fatigue are the defender’s self-inflicted wounds.',
    'cron jobs, startup folders and config files are quiet persistence homes; FIM baselines are the tripwire they fear.',
    'They will reuse whatever credentials they find — shared service-account passwords and stale contractor accounts are gifts.',
    'Clearing logs buys hours; aggregation and off-host forwarding take that weapon away.'
  ];

  var NEXT_STEPS = [
    'CySA+ CS0-003 architecture-gap analysis — coverage maps are your first tool for spotting where visibility ends.',
    'Deep-dive SIEM correlation: how aggregators chain events across hosts, users and time.',
    'Walk the ATT&CK Data Sources catalog and map each of your zones to the sources that watch it.'
  ];

  // ── Evidence corpus ─────────────────────────────────────────────────────────
  // Host clock skew (minutes vs true time) — recorded before NTP sync (OBJ-H9 reads this)
  var HOST_SKEW = [
    { host: 'FS01', skew: 3 },
    { host: 'WEB01', skew: -2 },
    { host: 'VPN01', skew: -7 },
    { host: 'APP01', skew: 0 },
    { host: 'WK-042', skew: 1 },
    { host: 'DB01', skew: -1 }
  ];

  var LOG_LEVEL_ORDER = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'];

  var LOGS = [
    // ── DEBUG flood (visible only at DEBUG threshold) ──
    { id: 'L001', time: '23:05', host: 'APP01', source: 'application', level: 'DEBUG', msg: 'payments-api: cache hit ratio 0.93 (window 60s)' },
    { id: 'L002', time: '23:07', host: 'APP01', source: 'application', level: 'DEBUG', msg: 'payments-api: GC pause 12ms' },
    { id: 'L003', time: '23:31', host: 'APP01', source: 'application', level: 'DEBUG', msg: 'crm-sync: fetched 412 records' },
    { id: 'L004', time: '00:12', host: 'APP01', source: 'application', level: 'DEBUG', msg: 'payments-api: token bucket refill' },
    { id: 'L005', time: '00:40', host: 'WEB01', source: 'system', level: 'DEBUG', msg: 'httpd: keepalive timeout recycled (14 conns)' },
    { id: 'L006', time: '01:02', host: 'APP01', source: 'application', level: 'DEBUG', msg: 'crm-sync: delta 0' },
    { id: 'L007', time: '01:15', host: 'FS01', source: 'system', level: 'DEBUG', msg: 'smbd: oplock break on /srv/share/public' },
    { id: 'L008', time: '01:44', host: 'APP01', source: 'application', level: 'DEBUG', msg: 'payments-api: retry queue depth 2' },
    { id: 'L009', time: '02:03', host: 'WEB01', source: 'system', level: 'DEBUG', msg: 'httpd: gzip ratio 4.1 avg' },
    { id: 'L010', time: '02:22', host: 'FS01', source: 'system', level: 'DEBUG', msg: 'smbd: dir cache warm (Manifests-Q3)' },
    { id: 'L011', time: '02:30', host: 'DB01', source: 'system', level: 'DEBUG', msg: 'wal checkpoint complete' },
    { id: 'L012', time: '03:02', host: 'APP01', source: 'application', level: 'DEBUG', msg: 'crm-sync: heartbeat ok' },
    // ── system baseline ──
    { id: 'L013', time: '22:05', host: 'WEB01', source: 'system', level: 'INFO', msg: 'package manager: vendor patch applied (app.conf updated)' },
    { id: 'L014', time: '01:00', host: 'FS01', source: 'system', level: 'INFO', msg: 'cron: report-sync completed (nightly manifest rollup)' },
    { id: 'L015', time: '02:10', host: 'FS01', source: 'system', level: 'INFO', msg: 'snapshot job: nightly backup index written' },
    { id: 'L016', time: '22:41', host: 'DB01', source: 'system', level: 'INFO', msg: 'backup heartbeat: BAK-01 reachable' },
    // ── application: red herrings + known issue ──
    { id: 'L017', time: '02:15', host: 'APP01', source: 'application', level: 'INFO', msg: 'marketing-export job started (campaign-metrics.csv)' },
    { id: 'L018', time: '02:16', host: 'APP01', source: 'application', level: 'INFO', msg: 'marketing-export job finished (campaign-metrics.csv, 412 rows)' },
    { id: 'L019', time: '23:00', host: 'APP01', source: 'application', level: 'ERROR', msg: 'payments-api: upstream timeout (504) — 3 retries' },
    { id: 'L020', time: '23:30', host: 'APP01', source: 'application', level: 'ERROR', msg: 'payments-api: upstream timeout (504) — 3 retries' },
    { id: 'L021', time: '00:30', host: 'APP01', source: 'application', level: 'ERROR', msg: 'payments-api: upstream timeout (504) — 3 retries' },
    { id: 'L022', time: '01:30', host: 'APP01', source: 'application', level: 'ERROR', msg: 'payments-api: upstream timeout (504) — 3 retries' },
    { id: 'L023', time: '02:00', host: 'APP01', source: 'application', level: 'ERROR', msg: 'payments-api: upstream timeout (504) — 3 retries' },
    { id: 'L024', time: '02:30', host: 'APP01', source: 'application', level: 'ERROR', msg: 'payments-api: upstream timeout (504) — 3 retries' },
    { id: 'L025', time: '03:00', host: 'APP01', source: 'application', level: 'ERROR', msg: 'payments-api: upstream timeout (504) — 3 retries' },
    // ── security: the incident chain ──
    { id: 'L026', time: '02:47', host: 'VPN01', source: 'security', level: 'WARNING', msg: 'Logon failure: bad password — user d.holt, src 198.51.100.77 (attempt 1 of 5)' },
    { id: 'L027', time: '02:48', host: 'VPN01', source: 'security', level: 'WARNING', msg: 'Logon failure: bad password — user d.holt, src 198.51.100.77 (attempt 2 of 5)' },
    { id: 'L028', time: '02:49', host: 'VPN01', source: 'security', level: 'WARNING', msg: 'Logon failure: bad password — user d.holt, src 198.51.100.77 (attempt 3 of 5)' },
    { id: 'L029', time: '02:51', host: 'VPN01', source: 'security', level: 'WARNING', msg: 'Logon failure: bad password — user d.holt, src 198.51.100.77 (attempt 4 of 5)' },
    { id: 'L030', time: '02:52', host: 'VPN01', source: 'security', level: 'WARNING', msg: 'Logon failure: bad password — user d.holt, src 198.51.100.77 (attempt 5 of 5)' },
    { id: 'L031', time: '02:53', host: 'VPN01', source: 'security', level: 'INFO', msg: 'Logon success — user d.holt via VPN portal, src 198.51.100.77 (MFA: none — legacy client)' },
    { id: 'L032', time: '02:55', host: 'VPN01', source: 'security', level: 'WARNING', msg: 'Logon success — svc_backup (interactive) via VPN portal, src 198.51.100.77' },
    { id: 'L033', time: '02:54', host: 'FS01', source: 'security', level: 'INFO', msg: 'Share access: user d.holt read+list on \\\\FS01\\Manifests-Q3' },
    { id: 'L034', time: '03:01', host: 'FS01', source: 'security', level: 'INFO', msg: 'File read: d.holt — Q3_manifests_master.xlsx (12 MB)' },
    { id: 'L035', time: '03:12', host: 'FS01', source: 'security', level: 'CRITICAL', msg: 'Security log cleared by user d.holt (audit-clear event)' },
    // ── security: daytime baseline ──
    { id: 'L036', time: '09:12', host: 'WK-042', source: 'security', level: 'INFO', msg: 'Logon success — user j.ferreira (console)' },
    { id: 'L037', time: '22:14', host: 'WK-042', source: 'security', level: 'INFO', msg: 'EDR: daily scan clean' },
    { id: 'L038', time: '22:40', host: 'FS01', source: 'security', level: 'INFO', msg: 'Admin logon — a.admin (RDP from 10.20.8.4)' },
    { id: 'L039', time: '23:15', host: 'WK-042', source: 'security', level: 'INFO', msg: 'Screen lock engaged — user j.ferreira' }
  ];

  var PCAP = [
    { id: 'P001', time: '22:04', src: 'WEB01', dst: 'cdn-partner.example:443', proto: 'TLS', bytes: '34 MB', flag: 'ok' },
    { id: 'P002', time: '22:10', src: 'FS01', dst: '10.20.6.9 (BAK-01):445', proto: 'SMB', bytes: '96 MB', flag: 'ok', note: 'nightly backup' },
    { id: 'P003', time: '22:31', src: 'VPN01', dst: 'vendor-telecom.example:500', proto: 'IKE', bytes: '0.1 MB', flag: 'ok' },
    { id: 'P004', time: '23:00', src: 'APP01', dst: 'payments-gw.example:8443', proto: 'TLS', bytes: '2 MB', flag: 'ok' },
    { id: 'P005', time: '23:45', src: 'DB01', dst: '10.20.6.9 (BAK-01):445', proto: 'SMB', bytes: '140 MB', flag: 'ok', note: 'nightly backup' },
    { id: 'P006', time: '02:16', src: 'APP01', dst: '198.51.100.23:443', proto: 'TLS', bytes: '800 MB', flag: 'sanctioned', note: 'marketing-export vendor — documented window' },
    { id: 'P007', time: '02:57', src: 'FS01', dst: '203.0.113.9:443', proto: 'TLS', bytes: '1.9 GB', flag: 'alert', note: 'no business record for this destination' },
    { id: 'P008', time: '03:20', src: '10.20.8.77 (WK-077)', dst: '10.20.6.0/24', proto: 'TCP SYN sweep', bytes: '12,288 SYNs', flag: 'noise', note: 'intern scanning lab — authorized' },
    { id: 'P009', time: '03:41', src: 'VPN01', dst: 'clients (144 sessions)', proto: 'keepalive', bytes: '1 MB', flag: 'ok' }
  ];

  var FLOWS = [
    { id: 'F001', pair: 'FS01 → 203.0.113.9', volumeMB: 1945, flag: 'alert', note: 'unregistered destination — exfil pattern' },
    { id: 'F002', pair: 'APP01 → 198.51.100.23', volumeMB: 800, flag: 'sanctioned', note: 'documented vendor export' },
    { id: 'F003', pair: 'FS01 → 10.20.6.9 (BAK-01)', volumeMB: 640, flag: 'ok', note: 'backup window' },
    { id: 'F004', pair: 'WEB01 → cdn-partner', volumeMB: 210, flag: 'ok', note: 'content delivery' },
    { id: 'F005', pair: 'WK-077 → server range', volumeMB: 2, flag: 'noise', note: 'intern SYN sweep' }
  ];

  var IAM = [
    { id: 'I001', user: 'd.holt', action: 'read + export', resource: '\\\\FS01\\Manifests-Q3 — Customer Manifests Q3', when: '02:54–03:10', where: '198.51.100.77 (external, unlisted)', how: 'HTTPS (VPN portal)', flag: 'alert', note: 'off-hours bulk read of customer data' },
    { id: 'I002', user: 'svc_backup', action: 'interactive logon', resource: 'VPN portal', when: '02:55', where: '198.51.100.77 (external)', how: 'HTTPS (VPN portal)', flag: 'alert', note: 'service account used interactively from outside' },
    { id: 'I003', user: 'm.reyes', action: 'read', resource: '\\\\FS01\\Manifests-Q3', when: 'Mar 08 · 14:22', where: '10.20.8.51 (LAN)', how: 'SMB', flag: 'watch', note: 'account holder separated 31 Jan — account still active' },
    { id: 'I004', user: 'svc_backup', action: 'read (backup job)', resource: '\\\\FS01\\* nightly', when: '02:00 nightly', where: '10.20.6.9 (BAK-01)', how: 'SMB', flag: 'routine' },
    { id: 'I005', user: 'j.ferreira', action: 'read', resource: 'CRM — customer records', when: '09:12', where: '10.20.8.20', how: 'API', flag: 'routine' },
    { id: 'I006', user: 'a.admin', action: 'admin logon', resource: 'FS01 console', when: '22:40', where: '10.20.8.4', how: 'RDP', flag: 'routine' },
    { id: 'I007', user: 'k.osei', action: 'write', resource: 'DropVaultSync (unsanctioned SaaS)', when: '21:47', where: '10.20.8.33', how: 'HTTPS (SaaS client)', flag: 'watch', note: 'files synced to personal cloud' },
    { id: 'I008', user: 'svc_scan', action: 'auth probe', resource: 'VPN — health check', when: 'hourly', where: '10.20.6.2', how: 'API', flag: 'routine' }
  ];

  var PAM_RECORDS = [
    { id: 'PM001', session: 'svc_backup · 02:55 · 198.51.100.77 (external, interactive)', finding: 'Credential NOT vaulted — static password shared across 3 systems; no session recording available.' },
    { id: 'PM002', session: 'svc_backup · 02:00 nightly · BAK-01', finding: 'Routine backup job usage — same shared static credential.' }
  ];

  var ASSETS = [
    { id: 'AS-01', name: 'FS01', kind: 'File server', data: 'Customer Manifests Q3', classification: 'unclassified' },
    { id: 'AS-02', name: 'VPN01', kind: 'VPN gateway', data: 'Session records', classification: 'preclassified', pre: 'Internal' },
    { id: 'AS-03', name: 'APP01', kind: 'App server', data: 'Payments + CRM', classification: 'preclassified', pre: 'Restricted' },
    { id: 'AS-04', name: 'WEB01', kind: 'Web server', data: 'Public site', classification: 'preclassified', pre: 'Public' },
    { id: 'AS-05', name: 'DB01', kind: 'Database', data: 'Order data', classification: 'preclassified', pre: 'Restricted' },
    { id: 'AS-06', name: 'BAK-01', kind: 'Backup target', data: 'Full backups', classification: 'preclassified', pre: 'Restricted' },
    { id: 'AS-07', name: 'WK-042', kind: 'Workstation', data: 'Analyst files', classification: 'preclassified', pre: 'Internal' },
    { id: 'AS-08', name: 'WK-077', kind: 'Workstation', data: 'Intern lab', classification: 'preclassified', pre: 'Internal' },
    { id: 'AS-17', name: 'NAS-3', kind: 'NAS', data: 'Dept. shares', classification: 'unclassified' },
    { id: 'AS-23', name: 'LT-118', kind: 'Laptop', data: 'Traveling exec', classification: 'unclassified' }
  ];

  var ASSET_TOTAL = 27;

  // Filler rows that round the inventory out to 27 assets. Audit v2: filler ids
  // skip AS-17 and AS-23 (real NAS-3 / LT-118 rows) so no id renders twice.
  var FILLER_KINDS = ['Workstation', 'Laptop', 'Printer', 'IP phone', 'Tablet'];
  var FILLER_NUMBERS = [9, 10, 11, 12, 13, 14, 15, 16, 18, 19, 20, 21, 22, 24, 25, 26, 27];
  var FILLER_ASSETS = [];
  for (var fi = 0; fi < 17; fi++) {
    FILLER_ASSETS.push({
      id: 'AS-' + String(FILLER_NUMBERS[fi]).padStart(2, '0'),
      kind: FILLER_KINDS[fi % 5],
      cls: 'Internal'
    });
  }

  var FIM = [
    { id: 'FM001', path: '/etc/cron.d/report-sync', host: 'FS01', baseline: 'a91f44c2…', current: '77c2e0d1…', when: '03:04', state: 'MODIFIED', flag: 'alert', note: 'New line added: nightly rsync of /srv/share/Manifests-Q3 to an external host' },
    { id: 'FM002', path: '/opt/payments/app.conf', host: 'APP01', baseline: '4b2e9a10…', current: '4b2eff31…', when: '22:05', state: 'MODIFIED', flag: 'benign', note: 'Vendor patch — approved change window' },
    { id: 'FM003', path: '/var/www/web01/index.html', host: 'WEB01', baseline: '0d31aa5b…', current: '0d31aa5b…', when: '—', state: 'IN BASELINE', flag: 'ok' }
  ];

  var VULNS = [
    { id: 'V001', asset: 'FS01', vid: 'FS-VR-0091 (simulated)', sev: 'CRITICAL', title: '"Everyone"-writable share holding customer PII; anonymous enumeration allowed' },
    { id: 'V002', asset: 'VPN01', vid: 'FS-VR-0077 (simulated)', sev: 'HIGH', title: 'Legacy clients can authenticate without MFA (single factor)' },
    { id: 'V003', asset: 'WEB01', vid: 'FS-VR-0044 (simulated)', sev: 'MEDIUM', title: 'TLS 1.0/1.1 still enabled on listener' },
    { id: 'V004', asset: 'APP01', vid: 'FS-VR-0102 (simulated)', sev: 'LOW', title: 'Verbose debug logging enabled — sensitive values written to app log' }
  ];

  var SAAS_APPS = [
    { id: 'S001', name: 'DropVaultSync', status: 'unsanctioned', risk: 'HIGH', detail: 'Personal-cloud file sync — uploaded 2.1 GB incl. Q3_shipments.xlsx', users: 'mkt-k.osei' },
    { id: 'S002', name: 'ChartExpress', status: 'unsanctioned', risk: 'LOW', detail: 'Chart rendering; no file egress observed', users: 'j.ferreira' },
    { id: 'S003', name: 'NorthMail 365', status: 'sanctioned', risk: '—', detail: 'Approved mail & collaboration suite', users: 'all staff' }
  ];

  // ── Incident timeline events ────────────────────────────────────────────────
  var TIMELINE_EVENTS = [
    { id: 'E1', time: '02:47', label: 'Failed logon burst — d.holt ×5 from 198.51.100.77', needs: ['securityLogs'], scene: 'Initial access: password spray-then-stuff begins.' },
    { id: 'E2', time: '02:53', label: 'VPN logon success — d.holt (no MFA, legacy client)', needs: ['securityLogs'], scene: 'The stolen password works — single-factor VPN.' },
    { id: 'E3', time: '02:54', label: 'Read + export on \\\\FS01\\Manifests-Q3 by d.holt', needs: ['accessReview'], scene: 'Collection: customer manifests touched off-hours.' },
    { id: 'E4', time: '02:57', label: '1.9 GB TLS upload — FS01 → 203.0.113.9', needs: ['packetCapture', 'flowMonitor'], scene: 'Exfiltration: bulk egress to an unregistered destination.' },
    { id: 'E5', time: '03:04', label: 'Scheduled job modified — /etc/cron.d/report-sync (FS01)', needs: ['fim'], scene: 'Persistence: nightly rsync of the manifests share installed.' },
    { id: 'E6', time: '03:12', label: 'Security log cleared by d.holt (FS01)', needs: ['securityLogs'], scene: 'Anti-forensics: the trail is being erased.' }
  ];

  var MEDIUM_SEQ = ['E1', 'E3', 'E6'];
  var HARD_SEQ = ['E1', 'E2', 'E3', 'E4', 'E5', 'E6'];

  // Primary host per timeline event, for displaying uncorrected (skewed) times when NTP is off
  var EVENT_HOST = { E1: 'VPN01', E2: 'VPN01', E3: 'FS01', E4: 'APP01', E5: 'FS01', E6: 'FS01' };

  // ── Feed gating helpers ─────────────────────────────────────────────────────
  function levelAtLeast(level, threshold) {
    return LOG_LEVEL_ORDER.indexOf(level) >= LOG_LEVEL_ORDER.indexOf(threshold);
  }

  function applySkew(time, skewMin) {
    var parts = time.split(':');
    var total = Number(parts[0]) * 60 + Number(parts[1]) + skewMin;
    var hh = Math.floor((((total + 1440) % 1440) / 60));
    var mm = (total + 1440) % 60;
    var p2 = function (n) { return String(n).padStart(2, '0'); };
    return p2(hh) + ':' + p2(mm);
  }

  // Export into a single global namespace
  window.LAB_DATA = {
    ZONES: ZONES,
    SENSORS: SENSORS,
    SENSOR_BY_ID: SENSOR_BY_ID,
    ZONE_BY_ID: ZONE_BY_ID,
    WIDGETS: WIDGETS,
    DASHBOARD_TARGET: DASHBOARD_TARGET,
    FINDINGS: FINDINGS,
    RESPONSE_ACTIONS: RESPONSE_ACTIONS,
    TRIAGE_ITEMS: TRIAGE_ITEMS,
    DEFECT_OPTIONS: DEFECT_OPTIONS,
    HARD_DEFECT_ANSWER: HARD_DEFECT_ANSWER,
    COUNTERMEASURES: COUNTERMEASURES,
    POSTMORTEM_CAUSES: POSTMORTEM_CAUSES,
    RULE_SOURCES: RULE_SOURCES,
    RULE_FIELDS: RULE_FIELDS,
    RULE_CONDITIONS: RULE_CONDITIONS,
    RULE_TIMEFILTERS: RULE_TIMEFILTERS,
    RULE_SEVERITIES: RULE_SEVERITIES,
    GLOSSARY: GLOSSARY,
    CORE_FUNDAMENTALS: CORE_FUNDAMENTALS,
    CORE_SOURCE_TAXONOMY: CORE_SOURCE_TAXONOMY,
    CORE_ATTACKER_VIEW: CORE_ATTACKER_VIEW,
    CORE_EXAMPLES: CORE_EXAMPLES,
    MITRE_ALIGNMENT: MITRE_ALIGNMENT,
    DEBRIEF_DETECTIONS: DEBRIEF_DETECTIONS,
    DEBRIEF_BLUE: DEBRIEF_BLUE,
    DEBRIEF_RED: DEBRIEF_RED,
    NEXT_STEPS: NEXT_STEPS,
    HOST_SKEW: HOST_SKEW,
    LOG_LEVEL_ORDER: LOG_LEVEL_ORDER,
    LOGS: LOGS,
    PCAP: PCAP,
    FLOWS: FLOWS,
    IAM: IAM,
    PAM_RECORDS: PAM_RECORDS,
    ASSETS: ASSETS,
    ASSET_TOTAL: ASSET_TOTAL,
    FILLER_ASSETS: FILLER_ASSETS,
    FIM: FIM,
    VULNS: VULNS,
    SAAS_APPS: SAAS_APPS,
    TIMELINE_EVENTS: TIMELINE_EVENTS,
    MEDIUM_SEQ: MEDIUM_SEQ,
    HARD_SEQ: HARD_SEQ,
    EVENT_HOST: EVENT_HOST,
    levelAtLeast: levelAtLeast,
    applySkew: applySkew
  };
})();
