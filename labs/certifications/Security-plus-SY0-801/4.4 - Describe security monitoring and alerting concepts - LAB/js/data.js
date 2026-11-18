// ============================================================================
// CyberLab Architect — Static Port — Lab Data
// Subject: CompTIA Security+ (SY0-801) — Lesson 4.4
// "Describe security monitoring and alerting concepts"
// Lesson detail: "Use logs, alerts, dashboards, and security tools to identify
// potential threats."
// ----------------------------------------------------------------------------
// This file is a 1:1 vanilla-JS port of src/lib/lab-data.ts.
// All content is IDENTICAL to the React source. Audit fixes (R3/R4/R5) are
// preserved verbatim in the QUIZ_QUESTIONS array.
// Exposed globally as `window.LAB_DATA`.
// ============================================================================

(function () {
  'use strict';

  // -------------------------------------------------------------------------
  // SCENARIO
  // -------------------------------------------------------------------------
  const SCENARIO = {
    org: 'Northwind Credit Union',
    sector: 'Regional Financial Services',
    network: 'Hybrid — on-prem data center + AWS + Azure',
    analystRole: 'Tier-1 SOC Analyst (Watch Floor, Shift B)',
    shift: 'Tuesday 14:00–22:00 UTC',
    situation:
      'You have just taken over the watch floor. The previous shift noted "elevated noise but no confirmed incidents." ' +
      'Five new alerts are waiting in the queue, three dashboards have spiked, and the log aggregator shows unusual ' +
      'authentication patterns against the VPN concentrator. Your job over the next 40 minutes: triage every alert, ' +
      'identify any real threat, and tune one noisy rule that is generating false positives — all without missing a true positive.',
    certRelevance:
      'Maps to CompTIA Security+ SY0-801 Domain 4 (Security Operations) Lesson 4.4 objectives: log sources, alert ' +
      'concepts, dashboards, security tools (SIEM/SOAR/EDR/NDR/IDS-IPS/XDR), IoC vs IoA, MITRE ATT&CK mapping, and SOAR automation.',
    realWorld:
      'SOC analysts worldwide perform this exact workflow daily. The median time-to-detect for incidents discovered by ' +
      'Tier-1 triage is still measured in hours; the skills practiced here are the single biggest driver of reducing that window.',
  };

  // -------------------------------------------------------------------------
  // GLOSSARY  (16 terms, each one-line)
  // (Header comment says "12" in source but the array has 16 entries — preserved verbatim.)
  // -------------------------------------------------------------------------
  const GLOSSARY = [
    { term: 'Log', category: 'logs', definition: 'A time-stamped record of an event that occurred on a system, network, or application.' },
    { term: 'Syslog', category: 'logs', definition: 'Standard protocol (RFC 5424) for sending log messages across IP networks to a central collector.' },
    { term: 'SIEM', category: 'tools', definition: 'Security Information and Event Management — aggregates, correlates, and alerts on logs from many sources.' },
    { term: 'SOAR', category: 'tools', definition: 'Security Orchestration, Automation, and Response — automates analyst playbooks and response actions.' },
    { term: 'EDR', category: 'tools', definition: 'Endpoint Detection and Response — agent-based monitoring of endpoints for process, file, and registry activity.' },
    { term: 'NDR', category: 'tools', definition: 'Network Detection and Response — analyzes network traffic (packets/flows) to detect malicious patterns.' },
    { term: 'IDS/IPS', category: 'tools', definition: 'Intrusion Detection / Prevention System — signature or anomaly based; IPS can actively block.' },
    { term: 'XDR', category: 'tools', definition: 'Extended Detection and Response — correlates telemetry across endpoint, network, cloud, and email.' },
    { term: 'IoC', category: 'threats', definition: 'Indicator of Compromise — a static artifact (IP, hash, domain, URL) that has been observed in attacks.' },
    { term: 'IoA', category: 'threats', definition: 'Indicator of Attack — a behavioral pattern (e.g., rapid failed logins then success) suggesting an active attack.' },
    { term: 'TTP', category: 'threats', definition: 'Tactics, Techniques, and Procedures — the behavioral signature of a threat actor; mapped in MITRE ATT&CK.' },
    { term: 'True Positive', category: 'alerts', definition: 'Alert fires AND a real attack occurred — the rule worked as intended.' },
    { term: 'False Positive', category: 'alerts', definition: 'Alert fires but no real attack occurred — noise that wastes analyst time.' },
    { term: 'False Negative', category: 'alerts', definition: 'No alert fires but a real attack occurred — the detection missed it (most dangerous failure mode).' },
    { term: 'Alert Fatigue', category: 'alerts', definition: 'Desensitization caused by excessive alert volume; drives tuning and SOAR automation.' },
    { term: 'Playbook', category: 'tools', definition: 'A documented, often automated, sequence of actions an analyst (or SOAR) takes for a given alert type.' },
  ];

  // -------------------------------------------------------------------------
  // LOG SOURCES
  // -------------------------------------------------------------------------
  const LOG_SOURCES = [
    { id: 'system', label: 'System', description: 'OS kernel/service events (boot, crashes, service state).', color: 'text-slate-300', borderColor: 'border-slate-600' },
    { id: 'application', label: 'Application', description: 'Application-level events (errors, business logic).', color: 'text-violet-300', borderColor: 'border-violet-600' },
    { id: 'security', label: 'Security', description: 'Privilege use, audit policy, object access on Windows/etc.', color: 'text-amber-300', borderColor: 'border-amber-600' },
    { id: 'firewall', label: 'Firewall', description: 'Allowed/blocked network flows at the perimeter.', color: 'text-rose-300', borderColor: 'border-rose-600' },
    { id: 'network', label: 'Network', description: 'Switch/router/flow data (NetFlow, sFlow).', color: 'text-cyan-300', borderColor: 'border-cyan-600' },
    { id: 'authentication', label: 'Authentication', description: 'Login success/failure, MFA, token issuance.', color: 'text-emerald-300', borderColor: 'border-emerald-600' },
    { id: 'dns', label: 'DNS', description: 'Domain name resolution queries and responses.', color: 'text-yellow-300', borderColor: 'border-yellow-600' },
    { id: 'proxy', label: 'Proxy', description: 'Outbound web access through forward proxy.', color: 'text-orange-300', borderColor: 'border-orange-600' },
    { id: 'web', label: 'Web Server', description: 'HTTP request logs (Apache/Nginx/IIS).', color: 'text-blue-300', borderColor: 'border-blue-600' },
  ];

  // -------------------------------------------------------------------------
  // LOG ENTRIES (synthetic — 28 entries; multiple sources; some support alerts)
  // -------------------------------------------------------------------------
  function T(n) {
    return '2026-11-12T14:' + String(n).padStart(2, '0') + ':00Z';
  }

  const LOG_ENTRIES = [
    // Authentication — supports brute-force alert (ALR-002)
    { id: 'L01', source: 'authentication', ts: T(7), host: 'vpn-prod-01', severity: 'warn', message: 'Failed login user=jsmith src=10.20.0.14', fields: { user: 'jsmith', src_ip: '10.20.0.14', method: 'radius' } },
    { id: 'L02', source: 'authentication', ts: T(7), host: 'vpn-prod-01', severity: 'warn', message: 'Failed login user=jsmith src=10.20.0.14', fields: { user: 'jsmith', src_ip: '10.20.0.14' } },
    { id: 'L03', source: 'authentication', ts: T(7), host: 'vpn-prod-01', severity: 'warn', message: 'Failed login user=jsmith src=10.20.0.14', fields: { user: 'jsmith', src_ip: '10.20.0.14' } },
    { id: 'L04', source: 'authentication', ts: T(7), host: 'vpn-prod-01', severity: 'warn', message: 'Failed login user=jsmith src=10.20.0.14', fields: { user: 'jsmith', src_ip: '10.20.0.14' } },
    { id: 'L05', source: 'authentication', ts: T(7), host: 'vpn-prod-01', severity: 'warn', message: 'Failed login user=jsmith src=10.20.0.14', fields: { user: 'jsmith', src_ip: '10.20.0.14' } },
    { id: 'L06', source: 'authentication', ts: T(8), host: 'vpn-prod-01', severity: 'info', message: 'Successful login user=jsmith src=10.20.0.14 method=radius', fields: { user: 'jsmith', src_ip: '10.20.0.14', result: 'success' } },

    // DNS — supports DGA alert (ALR-004) — high entropy subdomains
    { id: 'L07', source: 'dns', ts: T(11), host: 'dns-resolver-02', severity: 'info', message: 'Query src=10.20.0.14 name=xkq7z9tb.badbank-cdn.example.net type=A', fields: { src_ip: '10.20.0.14', query: 'xkq7z9tb.badbank-cdn.example.net' } },
    { id: 'L08', source: 'dns', ts: T(12), host: 'dns-resolver-02', severity: 'info', message: 'Query src=10.20.0.14 name=pl3mf8wq.badbank-cdn.example.net type=A', fields: { src_ip: '10.20.0.14', query: 'pl3mf8wq.badbank-cdn.example.net' } },
    { id: 'L09', source: 'dns', ts: T(13), host: 'dns-resolver-02', severity: 'info', message: 'Query src=10.20.0.14 name=rq1vd6ky.badbank-cdn.example.net type=A', fields: { src_ip: '10.20.0.14', query: 'rq1vd6ky.badbank-cdn.example.net' } },
    { id: 'L10', source: 'dns', ts: T(14), host: 'dns-resolver-02', severity: 'info', message: 'Query src=10.20.0.14 name=jm4wxlzr.badbank-cdn.example.net type=A', fields: { src_ip: '10.20.0.14', query: 'jm4wxlzr.badbank-cdn.example.net' } },

    // Web Server — supports SQLi probe (ALR-001)
    { id: 'L11', source: 'web', ts: T(15), host: 'web-portal-01', severity: 'warn', message: "GET /login.php?user=admin'-- HTTP/1.1 200 src=203.0.113.77", fields: { src_ip: '203.0.113.77', status: 200, path: "/login.php?user=admin'--" } },
    { id: 'L12', source: 'web', ts: T(15), host: 'web-portal-01', severity: 'warn', message: "GET /login.php?user=' OR 1=1-- HTTP/1.1 200 src=203.0.113.77", fields: { src_ip: '203.0.113.77', status: 200, path: "/login.php?user=' OR 1=1--" } },

    // Firewall — supports C2 callback
    { id: 'L13', source: 'firewall', ts: T(16), host: 'fw-edge-01', severity: 'warn', message: 'DENY out 10.20.0.14:54321 -> 198.51.100.42:443 rule=block-bad-actors', fields: { src_ip: '10.20.0.14', dst_ip: '198.51.100.42', action: 'deny', rule: 'block-bad-actors' } },
    { id: 'L14', source: 'firewall', ts: T(17), host: 'fw-edge-01', severity: 'info', message: 'ALLOW out 10.20.0.14:443 -> 13.107.42.14:443 rule=allow-msft', fields: { src_ip: '10.20.0.14', dst_ip: '13.107.42.14', action: 'allow', rule: 'allow-msft' } },

    // System — patch tuesday reboot (red herring)
    { id: 'L15', source: 'system', ts: T(18), host: 'srv-dc-01', severity: 'info', message: 'Service stopped: wuauserv (Windows Update)', fields: { service: 'wuauserv' } },
    { id: 'L16', source: 'system', ts: T(19), host: 'srv-dc-01', severity: 'info', message: 'System reboot initiated by user=SYSTEM reason=Planned', fields: { user: 'SYSTEM' } },

    // Security — administrative share access (red herring but real-looking)
    { id: 'L17', source: 'security', ts: T(20), host: 'srv-dc-01', severity: 'info', message: 'Audit Success: Logon user=adminsvc logon_type=3 (network)', fields: { user: 'adminsvc', logon_type: 3 } },

    // Application — benign error (red herring)
    { id: 'L18', source: 'application', ts: T(21), host: 'app-billing-01', severity: 'error', message: 'DB connection pool exhausted (max=100) — retry queued', fields: { pool_max: 100 } },

    // Authentication — failed MFA (low severity)
    { id: 'L19', source: 'authentication', ts: T(22), host: 'mfa-gw-01', severity: 'warn', message: 'MFA challenge failed user=mbrown reason=wrong_code', fields: { user: 'mbrown' } },
    { id: 'L20', source: 'authentication', ts: T(22), host: 'mfa-gw-01', severity: 'info', message: 'MFA challenge success user=mbrown', fields: { user: 'mbrown' } },

    // Network — port scan appearance (red herring — internal scanner)
    { id: 'L21', source: 'network', ts: T(23), host: 'sw-core-01', severity: 'info', message: 'Flow 10.20.0.250 -> 10.20.0.0/24 ports=1-1024 syn-only', fields: { src_ip: '10.20.0.250', dst_subnet: '10.20.0.0/24' } },

    // Proxy — supported ALR-005: data exfil attempt
    { id: 'L22', source: 'proxy', ts: T(24), host: 'proxy-out-01', severity: 'warn', message: 'POST https://file-drop[.]example[.]net/upload size=247MB user=jsmith', fields: { user: 'jsmith', dst: 'file-drop[.]example[.]net', bytes: 247000000 } },
    { id: 'L23', source: 'proxy', ts: T(25), host: 'proxy-out-01', severity: 'info', message: 'GET https://www.microsoft.com/ user=jsmith', fields: { user: 'jsmith', dst: 'www.microsoft.com' } },

    // DNS — legitimate looking (red herring)
    { id: 'L24', source: 'dns', ts: T(26), host: 'dns-resolver-02', severity: 'info', message: 'Query src=10.20.0.99 name=updates.microsoft.com type=A', fields: { src_ip: '10.20.0.99', query: 'updates.microsoft.com' } },

    // Authentication — service account lockout (ALR-003)
    { id: 'L25', source: 'authentication', ts: T(27), host: 'srv-dc-01', severity: 'error', message: 'Account locked: svc-backup reason=bad_password_count_exceeded', fields: { user: 'svc-backup', action: 'lockout' } },

    // Firewall — outbound to known-malicious
    { id: 'L26', source: 'firewall', ts: T(28), host: 'fw-edge-01', severity: 'critical', message: 'DENY out 10.20.0.14:49152 -> 198.51.100.42:443 rule=block-bad-actors (TI match)', fields: { src_ip: '10.20.0.14', dst_ip: '198.51.100.42', action: 'deny', ti_match: true } },

    // EDR-style (synthetic) — would feed into ALR-001 lateral movement
    { id: 'L27', source: 'security', ts: T(29), host: 'edr-agent-01', severity: 'critical', message: 'Suspicious child process: powershell.exe spawned by excel.exe on host=WS-0142', fields: { parent: 'excel.exe', child: 'powershell.exe', host: 'WS-0142' } },

    // Network — beaconing pattern (would be ALR-006)
    { id: 'L28', source: 'network', ts: T(30), host: 'sw-core-01', severity: 'info', message: 'Flow 10.20.0.14 -> 198.51.100.42 bytes=2048 every=60s (beacon)', fields: { src_ip: '10.20.0.14', dst_ip: '198.51.100.42', interval_sec: 60 } },
  ];

  // -------------------------------------------------------------------------
  // ALERTS  (6 active alerts + their ground-truth verdicts)
  // -------------------------------------------------------------------------
  const ALERTS = [
    {
      id: 'ALR-001',
      ts: T(15),
      severity: 'high',
      title: 'SQL injection probe — web portal login',
      source: 'SIEM rule: web-sqli-probe-v2',
      logRefs: ['L11', 'L12'],
      description:
        'Two requests to /login.php containing SQL metacharacters from 203.0.113.77 within 60 seconds. ' +
        'Both returned HTTP 200 — server may have processed the injection.',
      relatedTool: 'SIEM',
      mitre: { tactic: 'Initial Access', technique: 'Exploit Public-Facing Application', id: 'T1190' },
      correctVerdict: 'tp',
      verdictRationale:
        'The SQL metacharacters in the request, combined with a 200 response, indicate a real probe. Even if it did not succeed, ' +
        'the alert is a true positive because the behavior matches the rule exactly.',
      discriminatingEvidence:
        'A near-miss FP would have been a single request from an internal vulnerability scanner with a User-Agent of "nessus" and HTTP 403. ' +
        'Here we have 2 distinct payloads from an external IP with 200 responses — that is the discriminating evidence.',
    },
    {
      id: 'ALR-002',
      ts: T(8),
      severity: 'critical',
      title: 'VPN brute-force success — jsmith',
      source: 'SIEM rule: auth-brute-success',
      logRefs: ['L01', 'L02', 'L03', 'L04', 'L05', 'L06'],
      description:
        '5 failed logins followed by 1 success on vpn-prod-01 for user jsmith from 10.20.0.14 within 1 minute.',
      relatedTool: 'SIEM',
      mitre: { tactic: 'Credential Access', technique: 'Brute Force', id: 'T1110' },
      correctVerdict: 'tp',
      verdictRationale:
        'The "fail-then-success" pattern within a short window is the canonical brute-force-success IoA. The internal source IP is suspicious ' +
        'because 10.20.0.14 is the workstation VLAN, not a known jsmith asset — the credentials may have been used by an attacker who has ' +
        'already pivoted inside.',
    },
    {
      id: 'ALR-003',
      ts: T(27),
      severity: 'medium',
      title: 'Service account lockout: svc-backup',
      source: 'SIEM rule: ad-account-lockout',
      logRefs: ['L25'],
      description:
        'Service account svc-backup locked out on srv-dc-01 due to bad password count. Possible password-spray collateral.',
      relatedTool: 'SIEM',
      mitre: { tactic: 'Credential Access', technique: 'Password Spraying', id: 'T1110.003' },
      correctVerdict: 'tp',
      verdictRationale:
        'A service account lockout can be a leading indicator of a password-spray campaign — the attacker hits the account and trips ' +
        'the lockout threshold. Treat as TP until ruled out. Investigate other lockouts in the same window.',
    },
    {
      id: 'ALR-004',
      ts: T(14),
      severity: 'high',
      title: 'DNS DGA pattern — workstation 10.20.0.14',
      source: 'SIEM rule: dns-dga-ml-v3',
      logRefs: ['L07', 'L08', 'L09', 'L10'],
      description:
        '4 high-entropy subdomain queries under *.badbank-cdn.example.net from 10.20.0.14 in 3 minutes. ML model scored 0.94 (DGA).',
      relatedTool: 'NDR',
      mitre: { tactic: 'Command and Control', technique: 'DNS Application Layer Protocol', id: 'T1071.004' },
      correctVerdict: 'tp',
      verdictRationale:
        'High-entropy subdomains under a single parent domain in a short window is the textbook DGA beaconing pattern. Combined with the brute-force ' +
        'success from the same host minutes earlier, this is almost certainly post-compromise C2 over DNS.',
    },
    {
      id: 'ALR-005',
      ts: T(24),
      severity: 'critical',
      title: 'Large upload to file-sharing site',
      source: 'SIEM rule: proxy-large-upload',
      logRefs: ['L22'],
      description:
        'User jsmith uploaded 247 MB to file-drop[.]example[.]net — exceeds the 50 MB threshold for non-approved destinations.',
      relatedTool: 'SIEM',
      mitre: { tactic: 'Exfiltration', technique: 'Exfiltration Over Web Service', id: 'T1567' },
      correctVerdict: 'tp',
      verdictRationale:
        '247 MB POST to a non-approved file-sharing service, from a user whose VPN session was likely compromised (ALR-002), strongly suggests data exfiltration. ' +
        'Treat as TP and escalate to IR. The discriminating evidence vs. a benign upload: (1) the destination is not approved, (2) the size exceeds threshold, ' +
        '(3) the user is the same identity from the brute-force success.',
    },
    {
      id: 'ALR-006',
      ts: T(23),
      severity: 'low',
      title: 'Internal network scan from 10.20.0.250',
      source: 'SIEM rule: net-internal-scan',
      logRefs: ['L21'],
      description:
        'SYN-only flows to ports 1-1024 across 10.20.0.0/24 from 10.20.0.250.',
      relatedTool: 'NDR',
      correctVerdict: 'fp',
      verdictRationale:
        '10.20.0.250 is the registered internal vulnerability scanner. The SYN-only pattern, the source IP, and the scheduled maintenance window all match a ' +
        'scheduled scan. This is a false positive — the rule should be tuned to whitelist the scanner IP.',
      discriminatingEvidence:
        'If the same flows came from an unknown IP outside the scanner VLAN, this would be a TP. The scanner IP is the discriminating evidence.',
    },
  ];

  // -------------------------------------------------------------------------
  // DASHBOARD WIDGETS  (6 widgets, each tied to a question)
  // -------------------------------------------------------------------------
  const DASHBOARD_WIDGETS = [
    {
      id: 'w1', type: 'kpi', title: 'Alerts last 1h', subtitle: 'vs. previous hour',
      kpi: { value: 47, trend: 'up', trendNote: '+24% vs. previous hour' },
      questionId: 'OBJ-M5-a',
    },
    {
      id: 'w2', type: 'list', title: 'Top source IPs (failed auth, 1h)',
      list: [
        { label: '10.20.0.14', value: 18, flag: 'critical' },
        { label: '203.0.113.77', value: 6, flag: 'warn' },
        { label: '10.20.0.250', value: 4, flag: 'normal' },
        { label: '198.51.100.42', value: 0, flag: 'normal' },
      ],
      questionId: 'OBJ-M5-b',
    },
    {
      id: 'w3', type: 'bars', title: 'Alerts by severity (24h)',
      bars: [
        { label: 'Critical', value: 4, color: 'bg-rose-500' },
        { label: 'High', value: 11, color: 'bg-orange-500' },
        { label: 'Medium', value: 23, color: 'bg-amber-500' },
        { label: 'Low', value: 31, color: 'bg-sky-500' },
        { label: 'Info', value: 18, color: 'bg-slate-500' },
      ],
      questionId: 'OBJ-M5-c',
    },
    {
      id: 'w4', type: 'heatmap', title: 'Log volume by source / hour',
      heatmap: {
        rows: ['System', 'Auth', 'DNS', 'Firewall', 'Proxy', 'Web'],
        cols: ['14h', '15h', '16h', '17h'],
        values: [
          [3, 2, 4, 1],
          [22, 8, 3, 2],
          [9, 14, 8, 4],
          [12, 6, 5, 4],
          [4, 5, 8, 3],
          [2, 4, 2, 1],
        ],
      },
      questionId: 'OBJ-M5-d',
    },
    {
      id: 'w5', type: 'kpi', title: 'MTTR (mean time to resolve)',
      kpi: { value: '38m', trend: 'down', trendNote: '-12m vs. weekly average' },
      questionId: 'OBJ-M5-e',
    },
    {
      id: 'w6', type: 'list', title: 'MITRE tactics observed (1h)',
      list: [
        { label: 'Credential Access (T1110)', value: 5, flag: 'critical' },
        { label: 'Initial Access (T1190)', value: 2, flag: 'warn' },
        { label: 'Command and Control (T1071)', value: 4, flag: 'critical' },
        { label: 'Exfiltration (T1567)', value: 1, flag: 'critical' },
      ],
      questionId: 'OBJ-M5-f',
    },
  ];

  // -------------------------------------------------------------------------
  // TOOLS  (6 core tools — match acronym → function)
  // -------------------------------------------------------------------------
  const TOOLS = [
    {
      id: 'siem', name: 'Security Information & Event Management', acronym: 'SIEM',
      primaryFunction: 'Aggregate, correlate, alert on logs from many sources',
      description: 'Central log aggregation, correlation, alerting, and search. The hub of the SOC.',
      exampleVendors: ['Splunk', 'IBM QRadar', 'Microsoft Sentinel', 'Elastic SIEM'],
      useCases: ['Correlate failed logins across sources', 'Search historical logs', 'Generate rule-based alerts'],
    },
    {
      id: 'soar', name: 'Security Orchestration, Automation & Response', acronym: 'SOAR',
      primaryFunction: 'Automate playbooks and response actions',
      description: 'Connects tools together via playbooks — auto-enrich, auto-contain, auto-ticket.',
      exampleVendors: ['Splunk SOAR', 'Palo Alto XSOAR', 'Tines', 'Swimlane'],
      useCases: ['Auto-enrich alert with threat intel', 'Auto-block IP at firewall', 'Auto-isolate host via EDR'],
    },
    {
      id: 'edr', name: 'Endpoint Detection & Response', acronym: 'EDR',
      primaryFunction: 'Monitor endpoint process/file/registry activity',
      description: 'Agent on each endpoint records process trees, file writes, registry changes — deep visibility for lateral movement.',
      exampleVendors: ['CrowdStrike Falcon', 'Microsoft Defender for Endpoint', 'SentinelOne'],
      useCases: ['Detect PowerShell spawned by Excel', 'Quarantine endpoint', 'Pull process tree for forensic timeline'],
    },
    {
      id: 'ndr', name: 'Network Detection & Response', acronym: 'NDR',
      primaryFunction: 'Analyze network traffic to detect malicious patterns',
      description: 'ML + signature analysis of packets/flows; catches beaconing, DGA, lateral movement on the wire.',
      exampleVendors: ['ExtraHop', 'Darktrace', 'Vectra', 'Corelight'],
      useCases: ['Detect DNS beaconing', 'Identify unusual east-west traffic', 'Flag C2 callbacks'],
    },
    {
      id: 'ids_ips', name: 'Intrusion Detection / Prevention System', acronym: 'IDS/IPS',
      primaryFunction: 'Signature or anomaly based — IPS can actively block',
      description: 'Inline or passive; Snort/Suricata signatures match known attack patterns. IPS drops malicious packets.',
      exampleVendors: ['Snort', 'Suricata', 'Cisco Firepower', 'Zeek (IDS)'],
      useCases: ['Drop SQLi probes inline', 'Alert on exploit attempts', 'Match known CVE exploitation'],
    },
    {
      id: 'xdr', name: 'Extended Detection & Response', acronym: 'XDR',
      primaryFunction: 'Correlate telemetry across endpoint, network, cloud, email',
      description: 'Native integration across multiple telemetry streams — reduces silos and improves correlation.',
      exampleVendors: ['Palo Alto Cortex XDR', 'Microsoft Defender XDR', 'Trend Micro Vision One'],
      useCases: ['Correlate email-phish → endpoint-process → network-C2', 'Single incident view across stacks'],
    },
  ];

  // -------------------------------------------------------------------------
  // OBJECTIVES — MEDIUM MODE  (12 objectives; ≥2 per pillar; all interactive)
  // -------------------------------------------------------------------------
  const MEDIUM_OBJECTIVES = [
    // P1 UNDERSTAND — 3 objectives
    {
      id: 'OBJ-M1', pillar: 'understand', type: 'matching',
      title: 'Match the four monitoring pillars to their function',
      brief: 'Match each pillar — Logs, Alerts, Dashboards, Tools — to the function it serves in threat identification.',
      anchor: 'Lesson 4.4 intro: "Use logs, alerts, dashboards, and security tools to identify potential threats."',
      validation: {
        kind: 'matching',
        expected: { Logs: 'Time-stamped records of events to be analyzed', Alerts: 'Notifications fired when a rule matches observed behavior', Dashboards: 'Visualizations that surface trends, KPIs, and outliers', Tools: 'Systems that collect, correlate, and act on telemetry' },
      },
      feedback:
        'Logs are the raw material; alerts are the signal extracted from logs; dashboards are the at-a-glance view; tools ' +
        'are the engines that produce the first three. Without any one, monitoring is incomplete.',
      hints: [
        'Nudge: think of each as a stage in a pipeline — capture → signal → visualize → act.',
        'Direction: Logs = records; Alerts = notifications; Dashboards = visual summaries; Tools = engines.',
        'Demonstration: Logs ← records; Alerts ← fired-on-rule; Dashboards ← trends/KPIs; Tools ← collect/correlate/act.',
      ],
      covers: ['logs-def', 'alerts-def', 'dashboards-def', 'tools-def'],
    },
    {
      id: 'OBJ-M2', pillar: 'understand', type: 'categorize',
      title: 'Sort indicators: IoC vs IoA',
      brief: 'For each indicator, decide if it is an IoC (static artifact) or an IoA (behavioral pattern).',
      anchor: 'Lesson 4.4: distinguish Indicators of Compromise from Indicators of Attack.',
      validation: {
        kind: 'multi-correct',
        expected: {
          'Hash of a malware binary': 'IoC',
          '5 failed logins then 1 success in 60s': 'IoA',
          'Known-malicious IP 198.51.100.42': 'IoC',
          'Excel spawning PowerShell': 'IoA',
          'Domain xkq7z9tb.badbank-cdn.example.net': 'IoC',
          'Beaconing every 60s to fixed IP': 'IoA',
        },
      },
      feedback:
        'IoCs are static — they tell you that you HAVE been compromised. IoAs are behavioral — they tell you that you ARE being ' +
        'attacked RIGHT NOW. Modern detection favors IoAs because attackers rotate IoCs in minutes.',
      hints: [
        'Nudge: is the indicator a "thing" (artifact) or a "behavior" (sequence)?',
        'Direction: hashes, IPs, domains → IoC; multi-event patterns → IoA.',
        'Demonstration: anything you could put in a blocklist is an IoC; anything you would write a behavioral rule for is an IoA.',
      ],
      covers: ['ioc', 'ioa'],
    },
    {
      id: 'OBJ-M3', pillar: 'understand', type: 'matching',
      title: 'Match each tool to its primary function',
      brief: 'Match each acronym (SIEM, SOAR, EDR, NDR, IDS/IPS, XDR) to its primary function.',
      anchor: 'Lesson 4.4: roles of SIEM, SOAR, EDR, NDR, IDS/IPS, XDR.',
      validation: {
        kind: 'matching',
        expected: {
          SIEM: 'Aggregate, correlate, alert on logs from many sources',
          SOAR: 'Automate playbooks and response actions',
          EDR: 'Monitor endpoint process/file/registry activity',
          NDR: 'Analyze network traffic to detect malicious patterns',
          'IDS/IPS': 'Signature or anomaly based — IPS can actively block',
          XDR: 'Correlate telemetry across endpoint, network, cloud, email',
        },
      },
      feedback:
        'SIEM is the brain (correlate), SOAR is the hands (act), EDR sees the endpoint, NDR sees the wire, IDS/IPS ' +
        'catches known patterns, and XDR stitches them all into one incident view.',
      hints: [
        'Nudge: each tool sees a different slice — endpoint vs network vs many-sources.',
        'Direction: SIEM = aggregate; SOAR = automate; EDR = endpoint; NDR = network; IDS/IPS = signature/block; XDR = cross-stack.',
        'Demonstration: SIEM ← logs hub; SOAR ← playbooks; EDR ← processes; NDR ← packets/flows; IDS/IPS ← inline; XDR ← unified.',
      ],
      covers: ['siem', 'soar', 'edr', 'ndr', 'ids_ips', 'xdr'],
    },

    // P2 RECOGNIZE — 3 objectives
    {
      id: 'OBJ-M4', pillar: 'recognize', type: 'categorize',
      title: 'Classify each log entry by source',
      brief: 'For each of 6 log entries, pick the correct source type.',
      anchor: 'Lesson 4.4: log sources — system, application, security, firewall, network, authentication, DNS, proxy, web.',
      validation: {
        kind: 'multi-correct',
        expected: {
          'L11': 'web',
          'L13': 'firewall',
          'L01': 'authentication',
          'L07': 'dns',
          'L22': 'proxy',
          'L17': 'security',
        },
      },
      feedback:
        "Each log source answers a different question. Web tells you what was requested; firewall tells you what was allowed/blocked; " +
        "authentication tells you who logged in (or didn't). Recognizing the source is the first step in triage.",
      hints: [
        'Nudge: the host name and the message content reveal the source.',
        'Direction: web-portal-01 + HTTP path → web; fw-edge-01 + DENY → firewall; vpn-prod-01 + login → authentication; dns-resolver-02 + Query → DNS; proxy-out-01 + POST → proxy; srv-dc-01 + Audit Success → security.',
        'Demonstration: L11=web, L13=firewall, L01=auth, L07=dns, L22=proxy, L17=security.',
      ],
      covers: ['log-sources', 'log-classification'],
    },
    {
      id: 'OBJ-M5', pillar: 'recognize', type: 'identification',
      title: 'Read each dashboard widget and identify what it shows',
      brief: 'For each of the 6 dashboard widgets, choose the one-line interpretation that matches what the widget displays.',
      anchor: 'Lesson 4.4: dashboards — real-time monitoring, KPIs, metrics, SLAs, visualization.',
      validation: {
        kind: 'multi-correct',
        expected: {
          'w1': 'Alert volume in the last hour has risen 24% vs. the previous hour',
          'w2': '10.20.0.14 is the top source IP for failed auth in the last hour',
          'w3': 'Medium-severity alerts are the most common in the last 24 hours',
          'w4': 'Auth log volume spiked at 14h then declined; DNS volume rose through 15h',
          'w5': 'Mean time to resolve (MTTR) is 38 minutes, down 12m vs. weekly average',
          'w6': 'Four MITRE tactics were observed in the last hour; Credential Access dominates',
        },
      },
      feedback:
        'A dashboard is only as good as the analyst reading it. Each widget has a thesis — alert volume trend, top offenders, ' +
        'severity distribution, log-source health, SLA performance, MITRE coverage. Knowing what each shows is half the battle.',
      hints: [
        'Nudge: read the title, the units, and the trend arrow together.',
        'Direction: w1=alerts/hour trend; w2=top source IPs; w3=severity histogram; w4=log volume heatmap; w5=MTTR KPI; w6=MITRE tactics.',
        'Demonstration: w1 ↑24%; w2 top IP=10.20.0.14; w3 Medium=23 highest; w4 Auth spike at 14h; w5 38m ↓12m; w6 Credential Access dominates.',
      ],
      covers: ['dashboards-read', 'kpi', 'mttr', 'mitre-mapping'],
    },
    {
      id: 'OBJ-M6', pillar: 'recognize', type: 'identification',
      title: 'Identify the alert triage workflow order',
      brief: 'Place the 4 triage states in the correct workflow order.',
      anchor: 'Lesson 4.4: alert triage workflow — New → Acknowledged → Investigated → Resolved.',
      validation: {
        kind: 'sequence',
        expected: ['New', 'Acknowledged', 'Investigated', 'Resolved'],
      },
      feedback:
        'New means untouched; Acknowledged means an analyst owns it; Investigated means evidence has been gathered; Resolved means ' +
        'a verdict (TP/FP/benign) is recorded and the alert is closed. Skipping Acknowledged is the #1 cause of dropped alerts.',
      hints: [
        'Nudge: think of it as ownership → investigation → closure.',
        'Direction: New → Acknowledged (claim) → Investigated (gather evidence) → Resolved (close).',
        'Demonstration: New → Acknowledged → Investigated → Resolved.',
      ],
      covers: ['alert-workflow', 'triage-states'],
    },

    // P3 DETECT — 3 objectives
    {
      id: 'OBJ-M7', pillar: 'detect', type: 'search',
      title: 'Use the SIEM log search to find failed auth from 10.20.0.14',
      brief: 'Filter the log stream to show only authentication entries, then search for the source IP 10.20.0.14. How many failed entries appear in the 1-minute window?',
      anchor: 'Lesson 4.4: log search and filtering in the SIEM.',
      validation: {
        kind: 'numeric',
        expected: 5,
      },
      feedback:
        '5 failed logins from a single source IP within 60 seconds is the canonical brute-force pattern. A SIEM query ' +
        '(source=authentication AND src=10.20.0.14 AND severity=warn) surfaces this in seconds.',
      hints: [
        'Nudge: filter to authentication source first, then add the IP as a search term.',
        'Direction: set Sources=Authentication, then type 10.20.0.14 in the query box.',
        'Demonstration: Authentication + 10.20.0.14 = 5 warn-severity entries (L01–L05).',
      ],
      covers: ['siem-search', 'log-filter', 'brute-force-pattern'],
    },
    {
      id: 'OBJ-M8', pillar: 'detect', type: 'decision',
      title: 'Triage alert ALR-006 (internal scan) as TP/FP/TN/FN',
      brief: 'Read alert ALR-006, inspect its supporting log (L21), then choose the correct verdict.',
      anchor: 'Lesson 4.4: true positive vs false positive vs true negative vs false negative.',
      validation: {
        kind: 'exact',
        expected: 'fp',
        nearMisses: ['tp', 'tn', 'fn'],
      },
      feedback:
        'ALR-006 fired on a SYN-only scan — but the source IP 10.20.0.250 is the registered internal vulnerability scanner. ' +
        'A scheduled scan looks like an attack to a naive rule. This is the classic false positive; tune by whitelisting the scanner IP.',
      hints: [
        'Nudge: who is 10.20.0.250? Check whether the activity is expected.',
        'Direction: 10.20.0.250 is the vulnerability scanner. The pattern matches a scheduled scan.',
        'Demonstration: ALR-006 = False Positive — internal scanner triggered a scan-detection rule.',
      ],
      covers: ['tp-fp-tn-fn', 'false-positive', 'scanner-whitelist'],
    },
    {
      id: 'OBJ-M9', pillar: 'detect', type: 'decision',
      title: 'Sort alerts by severity (highest first)',
      brief: 'Order all 6 active alerts by severity from Critical → Low.',
      anchor: 'Lesson 4.4: alert severity levels — Critical / High / Medium / Low / Informational.',
      validation: {
        kind: 'sequence',
        expected: ['ALR-002', 'ALR-005', 'ALR-001', 'ALR-004', 'ALR-003', 'ALR-006'],
      },
      feedback:
        'Critical → High → Medium → Low → Informational. Two alerts are Critical (VPN brute-force success; 247 MB exfil), two are High (SQLi probe; DGA DNS), one is Medium (svc-backup lockout), one is Low (internal scan). ' +
        'Severity drives priority and SLA — getting this order right is the first triage decision an analyst makes.',
      hints: [
        'Nudge: how bad would the worst outcome be if this alert is a true positive?',
        'Direction: 2 Critical (ALR-002, ALR-005), 2 High (ALR-001, ALR-004), 1 Medium (ALR-003), 1 Low (ALR-006).',
        'Demonstration: ALR-002 → ALR-005 → ALR-001 → ALR-004 → ALR-003 → ALR-006.',
      ],
      covers: ['severity-levels', 'priority', 'sla'],
    },

    // P4 MITIGATE — 3 objectives
    {
      id: 'OBJ-M10', pillar: 'mitigate', type: 'tuning',
      title: 'Tune the noisy "internal-scan" rule to remove the false positive',
      brief: "Adjust the rule's threshold and add the scanner IP to the exception list so ALR-006 stops firing without losing real detections.",
      anchor: 'Lesson 4.4: alert tuning — thresholds, exceptions, and false-positive reduction.',
      validation: {
        kind: 'state',
        expected: { whitelistContains: '10.20.0.250', thresholdAtLeast: 1024, enabled: true },
      },
      feedback:
        'Tuning is iterative: keep the rule on, raise the port-count threshold so a single full-range scan does not fire 1024 separate alerts, ' +
        'and whitelist the scanner IP so scheduled scans are not noise. The detection remains effective for unknown scanners.',
      hints: [
        'Nudge: two changes — one for the source IP, one for the port threshold.',
        'Direction: add 10.20.0.250 to the whitelist; set threshold to 1024 (one alert per full scan, not per port).',
        'Demonstration: whitelist = ["10.20.0.250"], threshold ≥ 1024, rule still enabled.',
      ],
      covers: ['alert-tuning', 'whitelist', 'threshold-tuning', 'fp-reduction'],
    },
    {
      id: 'OBJ-M11', pillar: 'mitigate', type: 'matching',
      title: 'Pick the right tool combination for a hybrid-cloud incident',
      brief: 'For a hybrid-cloud incident (compromised workstation → C2 over DNS → exfil over HTTPS), select the minimum set of tools needed to detect, contain, and investigate.',
      anchor: 'Lesson 4.4: selecting security tools for the environment.',
      validation: {
        kind: 'set',
        expected: ['siem', 'edr', 'ndr', 'soar'],
      },
      feedback:
        'SIEM correlates across sources; EDR isolates the workstation and shows the process tree; NDR shows the DNS C2 and the HTTPS exfil; ' +
        'SOAR automates the containment playbook. IDS/IPS would help at the perimeter but is not strictly required for this investigation.',
      hints: [
        'Nudge: think "correlate + see endpoint + see network + automate response".',
        'Direction: SIEM (correlate) + EDR (endpoint) + NDR (network) + SOAR (automate).',
        'Demonstration: {SIEM, EDR, NDR, SOAR}.',
      ],
      covers: ['tool-selection', 'hybrid-cloud', 'correlation', 'automation'],
    },
    {
      id: 'OBJ-M12', pillar: 'mitigate', type: 'identification',
      title: 'Identify the MITRE ATT&CK tactic & technique for the correlated chain',
      brief: 'Linking ALR-002 (brute-force success) → ALR-004 (DGA DNS) → ALR-005 (exfil): what is the correct MITRE ATT&CK tactic + technique for the MIDDLE stage (ALR-004)?',
      anchor: 'Lesson 4.4: mapping detections to MITRE ATT&CK tactics and techniques.',
      validation: {
        kind: 'exact',
        expected: 'T1071.004',
        nearMisses: ['T1110', 'T1567', 'T1190'],
      },
      feedback:
        'ALR-004 is DNS Application Layer Protocol (T1071.004) under the Command and Control tactic. Mapping every alert to ATT&CK lets you ' +
        'see the full attack chain — Credential Access → Command and Control → Exfiltration — and prioritize gaps in detection coverage.',
      hints: [
        'Nudge: what is the attacker doing in the MIDDLE stage — DNS-based C2?',
        'Direction: DNS C2 → ATT&CK sub-technique T1071.004.',
        'Demonstration: T1071.004 = DNS Application Layer Protocol.',
      ],
      covers: ['mitre-attack', 'tactic-technique', 'attack-chain'],
    },
  ];

  // -------------------------------------------------------------------------
  // OBJECTIVES — HARD MODE  (9 objectives; ≥1 per pillar; multi-step challenges)
  // -------------------------------------------------------------------------
  const HARD_OBJECTIVES = [
    // P1 UNDERSTAND — 2 objectives
    {
      id: 'OBJ-H1', pillar: 'understand', type: 'analysis',
      title: 'Identify visibility gaps in the monitoring strategy',
      brief: 'Given the current monitoring stack (SIEM logs + EDR + perimeter firewall), name TWO log sources that are missing and would close the gap on detecting DNS-based C2 and lateral movement.',
      anchor: 'Lesson 4.4: completeness of log sources for monitoring; DNS, network flow, and east-west visibility.',
      validation: {
        kind: 'set',
        expected: ['dns', 'network'],
      },
      feedback:
        'Without DNS logs you cannot detect DGA / DNS tunneling (ALR-004 would never have fired). Without network flow logs you cannot see ' +
        'east-west lateral movement that bypasses the perimeter firewall. These are the two highest-impact gaps in a default monitoring stack.',
      hints: [
        'Nudge: what two log sources would have surfaced the DNS beaconing and the lateral movement?',
      ],
      covers: ['log-sources', 'dns', 'network-flow', 'visibility-gaps'],
    },
    {
      id: 'OBJ-H2', pillar: 'understand', type: 'identification',
      title: 'Justify when SOAR automation is appropriate vs human review',
      brief: 'For alert ALR-002 (VPN brute-force success), decide which ONE action is safe to fully automate via SOAR without human approval, and which ONE action must ALWAYS require human approval.',
      anchor: 'Lesson 4.4: SOAR automation boundaries; human-in-the-loop for high-impact containment.',
      validation: {
        kind: 'matching',
        expected: {
          'Auto-block the source IP at the firewall (safe to automate)': 'Automate',
          'Disable the user account in Active Directory': 'Human approval required',
          'Enrich alert with threat-intel feeds': 'Automate',
          "Isolate the user's workstation via EDR": 'Human approval required',
        },
      },
      feedback:
        'Rule of thumb: enrichment and reversible perimeter actions (block an IP) are safe to automate. Identity changes and endpoint isolation ' +
        'have business impact — a wrong call locks out a real user or breaks a workstation. Always require human approval for those.',
      hints: [
        'Nudge: which actions are reversible & low-impact vs irreversible & high-impact?',
      ],
      covers: ['soar', 'automation-boundaries', 'human-in-loop'],
    },

    // P2 RECOGNIZE — 2 objectives
    {
      id: 'OBJ-H3', pillar: 'recognize', type: 'analysis',
      title: 'Correlate 6 simultaneous alerts into ONE incident',
      brief: 'Identify the SET of alert IDs that belong to the SAME incident (single attacker, single host). Then identify the 3 alerts that are NOISE / unrelated.',
      anchor: 'Lesson 4.4: alert correlation, incident reconstruction, MITRE mapping across the attack chain.',
      validation: {
        kind: 'state',
        expected: { sameIncident: ['ALR-002', 'ALR-004', 'ALR-005'], noise: ['ALR-001', 'ALR-003', 'ALR-006'] },
      },
      feedback:
        'ALR-002 (brute-force success on jsmith from 10.20.0.14), ALR-004 (DGA DNS from 10.20.0.14 minutes later), and ALR-005 (large upload by ' +
        'jsmith minutes after that) form a single chain on the same host. ALR-001 is a separate SQLi probe from an external IP. ALR-003 is a different account lockout. ALR-006 is the scanner (FP).',
      hints: [
        'Nudge: which alerts share a host or user identity?',
      ],
      covers: ['correlation', 'incident-reconstruction', 'attack-chain'],
    },
    {
      id: 'OBJ-H4', pillar: 'recognize', type: 'identification',
      title: 'Distinguish a true positive from a near-miss false positive',
      brief: 'Compare alert ALR-001 (SQLi probe) with the "near-miss" variant described in its discriminating-evidence note. Identify the SINGLE piece of evidence that makes ALR-001 a true positive and the variant a false positive.',
      anchor: 'Lesson 4.4: triage discipline — discriminating evidence; near-miss analysis.',
      validation: {
        kind: 'exact',
        expected: '200',
        nearMisses: ['403', '404', '500', 'nessus', 'internal'],
      },
      feedback:
        "Both requests in ALR-001 returned HTTP 200 — the server processed the injection attempt. The near-miss variant returned 403 (the WAF " +
        'blocked it) and came from a vulnerability scanner User-Agent. The HTTP status code is the discriminating evidence.',
      hints: [
        'Nudge: what HTTP status would indicate the server actually processed the request, vs blocked it?',
      ],
      covers: ['near-miss', 'discriminating-evidence', 'triage-discipline'],
    },

    // P3 DETECT — 3 objectives
    {
      id: 'OBJ-H5', pillar: 'detect', type: 'design',
      title: 'Build a brute-force detection rule from scratch',
      brief: 'Configure a SIEM rule that fires on brute-force success: pick the log source, the threshold (failed-login count), the window (seconds), and the action that should follow.',
      anchor: 'Lesson 4.4: detection engineering — log source selection, thresholds, time windows, response.',
      validation: {
        kind: 'state',
        expected: { logSource: 'authentication', threshold: 5, windowSeconds: 60, responseAction: 'success' },
      },
      feedback:
        'Authentication logs are the only source that records both the failure and the success. Threshold = 5 fails within 60s is the CompTIA-canonical ' +
        "trigger; the rule MUST key on the success event that follows, not just the failures, or you will only catch failed brute-force.",
      hints: [
        'Nudge: which log source has BOTH failed and successful logins?',
      ],
      covers: ['detection-engineering', 'rule-design', 'thresholds', 'time-window'],
    },
    {
      id: 'OBJ-H6', pillar: 'detect', type: 'identification',
      title: 'Identify the MITRE ATT&CK tactic + technique for the WHOLE chain',
      brief: 'For the full incident chain (ALR-002 → ALR-004 → ALR-005), match each stage to its MITRE tactic.',
      anchor: 'Lesson 4.4: MITRE ATT&CK mapping across the attack chain.',
      validation: {
        kind: 'matching',
        expected: {
          'ALR-002 (brute-force success)': 'Credential Access',
          'ALR-004 (DGA DNS C2)': 'Command and Control',
          'ALR-005 (large upload)': 'Exfiltration',
        },
      },
      feedback:
        'The chain spans three tactics: Credential Access (gaining the credential), Command and Control (establishing the channel), and Exfiltration ' +
        '(moving the data out). Mapping each alert to its tactic is how you prove you have detection coverage across the entire attack lifecycle.',
      hints: [
        'Nudge: brute-force = credential; DGA C2 = command/control; upload = exfiltration.',
      ],
      covers: ['mitre-attack', 'tactic-mapping', 'attack-chain', 'kill-chain'],
    },
    {
      id: 'OBJ-H7', pillar: 'detect', type: 'tuning',
      title: 'Tune a noisy DGA rule without losing detections',
      brief: 'The DGA rule fires on 1 query with entropy > 0.8. Tune it: require at least N high-entropy queries within W seconds, AND keep the rule enabled. Pick N and W that reduce noise by ~75% while preserving detection of the real DGA pattern.',
      anchor: 'Lesson 4.4: alert tuning — thresholds, time windows, false-positive reduction.',
      validation: {
        kind: 'threshold-tune',
        expected: { minCount: 3, maxWindow: 180, stillEnabled: true },
      },
      feedback:
        'A single high-entropy DNS query is noise (CDNs, SaaS, ad-tech). Requiring 3+ such queries within 180 seconds preserves the ALR-004 detection ' +
        '(4 queries in 180s) while dropping the random false positives. Tuning is not "raise threshold until quiet" — it is "raise threshold until the ' +
        'signal-to-noise ratio is acceptable, then verify no known TP is lost."',
      hints: [
        'Nudge: how many high-entropy queries does the real DGA pattern produce within how many seconds?',
      ],
      covers: ['alert-tuning', 'dga-detection', 'fp-reduction', 'threshold-tuning'],
    },

    // P4 MITIGATE — 2 objectives
    {
      id: 'OBJ-H8', pillar: 'mitigate', type: 'design',
      title: 'Design the SOAR playbook for the SQLi-probe alert (ALR-001)',
      brief: 'Order the 5 SOAR playbook steps for ALR-001: enrich → score → block → notify → close. Two of the 5 steps are reversible and can run before any human review; identify them by ordering them first.',
      anchor: 'Lesson 4.4: SOAR playbook design; reversible vs irreversible actions.',
      validation: {
        kind: 'sequence',
        expected: ['Enrich (TI lookup on source IP)', 'Score (combine SIEM + TI signals)', 'Notify (open ticket, page Tier-2 if High+)', 'Block (add IP to firewall blocklist)', 'Close (record verdict in SIEM)'],
      },
      feedback:
        'Enrichment and scoring are reversible (no state change to defenses) and should always run first. Notification creates a record. Blocking is ' +
        'the highest-impact action — only run it after enrichment + scoring support it. Close is the last step. Wrong ordering causes either false ' +
        'blocks or missed escalations.',
      hints: [
        'Nudge: which two steps change nothing on the wire and can run before any human review?',
      ],
      covers: ['soar', 'playbook-design', 'reversible-actions', 'automation-sequencing'],
    },
    {
      id: 'OBJ-H9', pillar: 'mitigate', type: 'analysis',
      title: 'Propose a tuning + automation strategy that reduces noise ≥60% with 0 false negatives',
      brief: 'For a SOC receiving 1000 alerts/day where 990 are false positives, name TWO of the four tuning levers (whitelist trusted sources, raise threshold, add context (TI), or automate enrichment) that together will drop FP count ≥60% while preserving 100% of TPs.',
      anchor: 'Lesson 4.4: alert fatigue, tuning strategy, SOAR leverage.',
      validation: {
        kind: 'set',
        expected: ['whitelist trusted sources', 'automate enrichment'],
        nearMisses: [['raise threshold'], ['add context (TI)']],
      },
      feedback:
        'Whitelisting trusted sources removes the scanner/scheduled-task FPs wholesale (the biggest bucket). Automating enrichment means human time ' +
        'is spent only on the residual signal — analysts stop paging through 990 FPs and start working the 10 TPs directly. Raising thresholds risks ' +
        'false negatives; adding TI alone does not reduce volume.',
      hints: [
        'Nudge: which two levers reduce VOLUME without raising the chance of a missed TP?',
      ],
      covers: ['alert-fatigue', 'tuning-strategy', 'soar-leverage', 'fp-reduction'],
    },
  ];

  // -------------------------------------------------------------------------
  // QUIZ QUESTIONS
  // -------------------------------------------------------------------------
  // R4 compliance: correct answer position rotates across items (A/B/C/D spread).
  // R5 compliance: correct answer is never the longest option; all options similar length/structure.
  // R3 compliance: only the SELECTED answer is colored (green if correct, red if wrong);
  //                the correct answer is NOT revealed green on a wrong submission.
  //
  // AUDIT-FIXED correctIndex values:
  //   Q1=2, Q2=0, Q3=3, Q4=1, Q5=2, Q6=1, Q7=3, Q8=0, Q9=2
  // -------------------------------------------------------------------------
  const QUIZ_QUESTIONS = [
    // Q1 — correct at C (was B). Options rewritten to be similar length.
    {
      id: 'Q1', mode: 'both',
      question: "A SOC analyst receives 100 alerts overnight; 99 are scanner activity from the company's approved vulnerability scanner. What is the BEST first action?",
      options: [
        'Delete all 99 alerts as obvious false positives',
        'Disable the alerting rule entirely to stop the noise',
        'Whitelist the scanner IP, close the 99 as FP',
        'Escalate all 100 alerts to Tier-2 immediately',
      ],
      correctIndex: 2,
      explanation: 'Whitelisting the scanner IP eliminates the FP at the source without disabling the rule (which would blind you to real scans). Closing the existing 99 as FP keeps the metrics honest.',
    },
    // Q2 — correct at A (was B). Single-word options, all same length.
    {
      id: 'Q2', mode: 'both',
      question: 'Which log source is the ONLY one that records both failed AND successful login attempts?',
      options: [
        'Authentication logs',
        'Firewall logs',
        'DNS query logs',
        'Web server logs',
      ],
      correctIndex: 0,
      explanation: 'Authentication logs (RADIUS, AD security, IdP) record both failures and successes — this is what makes brute-force-success detections possible.',
    },
    // Q3 — correct at D (was B). Options rewritten to be similar length.
    {
      id: 'Q3', mode: 'both',
      question: '5 failed logins followed by 1 success in 60 seconds is best classified as which type of indicator?',
      options: [
        'A static IoC (Indicator of Compromise)',
        'A clear false positive from the SIEM',
        'A true negative in the alerting rule',
        'A behavioral IoA (Indicator of Attack)',
      ],
      correctIndex: 3,
      explanation: 'A behavioral pattern (fail-then-success within a window) is an IoA. A static artifact (a hash, IP, domain) would be an IoC. Modern detection favors IoAs because attackers rotate IoCs in minutes.',
    },
    // Q4 — correct at B (was C). Options rewritten so correct is not longest.
    {
      id: 'Q4', mode: 'both',
      question: 'A SIEM alerts when a host makes 4+ high-entropy DNS queries to a single parent domain within 3 minutes. Which MITRE ATT&CK technique is this detecting?',
      options: [
        'T1190 — Exploit Public-Facing Application',
        'T1071.004 — DNS Application Layer Protocol',
        'T1110 — Brute Force credential access',
        'T1567 — Exfiltration Over Web Service',
      ],
      correctIndex: 1,
      explanation: 'High-entropy subdomains under a single parent domain in a short window is the textbook DGA beaconing pattern, classified under T1071.004 (DNS Application Layer Protocol) in the Command and Control tactic.',
    },
    // Q5 — correct at C (was A). Options rewritten to be similar length.
    {
      id: 'Q5', mode: 'both',
      question: 'What is the core difference between IDS and IPS?',
      options: [
        'IDS uses signatures; IPS uses ML models',
        'IDS is for endpoints; IPS is for networks',
        'IDS only alerts; IPS can actively block',
        'There is no difference; they are synonyms',
      ],
      correctIndex: 2,
      explanation: 'IDS (Intrusion Detection System) only logs/alerts; IPS (Intrusion Prevention System) is inline and can actively drop malicious packets. Same detection logic, different deployment posture.',
    },
    // Q6 — correct at B (was A). Options rewritten so correct is not longest.
    {
      id: 'Q6', mode: 'hard',
      scenario: 'ALERT: A user uploaded 247 MB to file-drop[.]example[.]net. The user (jsmith) had a brute-force-success alert 16 minutes earlier from the same workstation.',
      question: 'What is the BEST immediate next action?',
      options: [
        'Email jsmith to ask if the upload was intentional',
        'Disable jsmith and isolate the workstation via EDR',
        'Block file-drop[.]example[.]net at the proxy only',
        "Wait for tomorrow's shift to investigate the alert",
      ],
      correctIndex: 1,
      explanation: 'The combination of brute-force success → large upload to a non-approved destination forms an exfiltration chain. Disabling the account + isolating the workstation stops further exfiltration; you can investigate intent afterward.',
    },
    // Q7 — correct at D (was B). Options rewritten so correct is not longest.
    {
      id: 'Q7', mode: 'hard',
      scenario: 'You receive 4 high-severity alerts in 5 minutes from 4 different tools (EDR, NDR, SIEM, IDS) — all flagging activity on host WS-0142.',
      question: 'What does this tell you about the alert-correlation problem in a multi-tool SOC?',
      options: [
        'The tools disagree, so all four alerts are false positives',
        'Only the SIEM alert matters; ignore the other three',
        'You should disable EDR and NDR to reduce the noise',
        'All 4 fired on facets of one incident — correlation needed',
      ],
      correctIndex: 3,
      explanation: 'When multiple tools fire on the same host in the same window, they are almost certainly observing different facets of the same incident. Correlation (manual or via XDR) is needed to assemble one incident view, not four.',
    },
    // Q8 — correct at A (was B). Options rewritten so correct is not longest.
    {
      id: 'Q8', mode: 'hard',
      scenario: 'Your DGA-detection rule fires 200 times/day. Investigation shows 195 are CDN/SaaS high-entropy subdomains (e.g., abc123.cloudfront.net). 5 are real DGA. The current rule is: fire on entropy > 0.8 from a single query.',
      question: 'Which tuning change reduces FP by ~95% with 0 false negatives?',
      options: [
        'Require 3+ queries within 180s to the same parent',
        'Raise the entropy threshold from 0.8 up to 0.95',
        'Disable the rule and rely on TI feeds instead',
        'Whitelist all .cloudfront.net and .akamaihd.net domains',
      ],
      correctIndex: 0,
      explanation: 'Requiring 3+ queries within 180 seconds to the same parent domain preserves the real DGA detection (4 queries in 180s) while dropping the single-shot CDN/SaaS false positives. Whitelisting domains is fragile; raising the threshold misses low-entropy DGAs.',
    },
    // Q9 — correct at C (was B). Options already similar length; keep rotation.
    {
      id: 'Q9', mode: 'hard',
      scenario: 'You are designing a SOAR playbook for the SQLi-probe alert. The four candidate actions are: (1) block source IP at firewall, (2) enrich alert with threat-intel, (3) isolate the web server, (4) open a ticket. Two of these are SAFE to fully automate (no human review). Which two?',
      question: 'Select the two actions that are SAFE to fully automate without human approval:',
      options: [
        'Block source IP + isolate the web server',
        'Block source IP + open a ticket for review',
        'Enrich with TI + open a ticket for review',
        'Enrich with TI + isolate the web server',
      ],
      correctIndex: 2,
      explanation: 'Enrichment and ticketing are reversible (no state change to defenses). Blocking an IP is reversible but high-impact (could break a partner); isolating a web server is high-impact and disruptive — both warrant human review before execution.',
    },
  ];

  // -------------------------------------------------------------------------
  // DATA SOURCES SUMMARY (for the Knowledge Core / debrief)
  // -------------------------------------------------------------------------
  const DATA_SOURCE_SUMMARY = [
    { source: 'Authentication', whatItTellsYou: 'Who logged in (or tried to), from where, with what result', keyFields: 'user, src_ip, result, method', tipForTriage: 'Fail-then-success within a short window = brute-force success IoA' },
    { source: 'DNS', whatItTellsYou: 'What domains were queried, by whom', keyFields: 'src_ip, query, type, response', tipForTriage: 'High-entropy subdomains under one parent in a short window = DGA / DNS C2' },
    { source: 'Firewall', whatItTellsYou: 'What network flows were allowed or blocked', keyFields: 'src_ip, dst_ip, port, action, rule', tipForTriage: 'Outbound DENY to a TI-flagged IP = potential C2 callback' },
    { source: 'Proxy', whatItTellsYou: 'What users accessed on the web (outbound)', keyFields: 'user, dst, method, bytes, status', tipForTriage: 'Large POST to non-approved destination = potential exfiltration' },
    { source: 'Web server', whatItTellsYou: 'What HTTP requests hit your apps', keyFields: 'src_ip, method, path, status, user-agent', tipForTriage: 'SQL/XSS metacharacters in path with HTTP 200 = injection probe' },
    { source: 'System', whatItTellsYou: 'OS-level events (boots, service state, crashes)', keyFields: 'host, service, event_id, user', tipForTriage: 'Unexpected reboots outside maintenance windows = investigate' },
    { source: 'Security', whatItTellsYou: 'Privilege use, audit policy, object access', keyFields: 'user, logon_type, object, access_mask', tipForTriage: 'Type 3 (network) logons from new accounts = lateral movement' },
    { source: 'Network', whatItTellsYou: 'Traffic flows (NetFlow, sFlow) between hosts', keyFields: 'src_ip, dst_ip, port, bytes, protocol', tipForTriage: 'East-west SYN-only flows to many ports = internal scan or lateral movement' },
    { source: 'Application', whatItTellsYou: 'Application-level errors and business events', keyFields: 'app, level, message, correlation_id', tipForTriage: 'Application errors that correlate with security alerts = potential impact' },
  ];

  // -------------------------------------------------------------------------
  // MITRE MAPPING (used in debrief)
  // -------------------------------------------------------------------------
  const MITRE_MAPPING_USED = [
    { id: 'T1190', tactic: 'Initial Access', technique: 'Exploit Public-Facing Application', usedIn: 'ALR-001 (SQLi probe)' },
    { id: 'T1110', tactic: 'Credential Access', technique: 'Brute Force', usedIn: 'ALR-002 (VPN brute-force success)' },
    { id: 'T1110.003', tactic: 'Credential Access', technique: 'Password Spraying', usedIn: 'ALR-003 (svc-backup lockout)' },
    { id: 'T1071.004', tactic: 'Command and Control', technique: 'DNS Application Layer Protocol', usedIn: 'ALR-004 (DGA DNS C2)' },
    { id: 'T1567', tactic: 'Exfiltration', technique: 'Exfiltration Over Web Service', usedIn: 'ALR-005 (large upload)' },
  ];

  // -------------------------------------------------------------------------
  // BLUE TEAM / RED TEAM TAKEAWAYS (for debrief)
  // -------------------------------------------------------------------------
  const TAKEAWAYS = {
    blue: [
      'Correlate before you triage — multiple alerts on the same host in the same window are usually one incident, not many.',
      'Tune with evidence, not with thresholds. Always verify no known TP is lost when you raise a threshold.',
      'Whitelist trusted sources FIRST (vulnerability scanners, scheduled jobs) — this is the single biggest FP reduction.',
      'Map every detection to MITRE ATT&CK. Coverage gaps appear as missing tactics in your dashboard.',
      'Automate enrichment + ticketing. Reserve human approval for irreversible or high-impact actions.',
    ],
    red: [
      'Slow brute-force (1 attempt per minute) defeats naive thresholds — design rules on rate AND count.',
      'Use legitimate-looking domains (CDN-style parents) for C2 to blend with high-entropy SaaS traffic.',
      'Exfiltrate over HTTPS to a file-sharing service — proxy logs only catch it if the destination is non-approved.',
      "Hunt the scanners. If you can identify the SOC's vulnerability scanner IP, you can time your attack around its schedule.",
      'Each alert you generate in the SOC is an analyst minute spent. Noise is a defensive weapon — for the attacker.',
    ],
  };

  // -------------------------------------------------------------------------
  // EXPORT
  // -------------------------------------------------------------------------
  window.LAB_DATA = {
    SCENARIO,
    GLOSSARY,
    LOG_SOURCES,
    LOG_ENTRIES,
    ALERTS,
    DASHBOARD_WIDGETS,
    TOOLS,
    MEDIUM_OBJECTIVES,
    HARD_OBJECTIVES,
    QUIZ_QUESTIONS,
    DATA_SOURCE_SUMMARY,
    MITRE_MAPPING_USED,
    TAKEAWAYS,
    T, // timestamp helper, exposed for any consumer that needs it
  };
})();
