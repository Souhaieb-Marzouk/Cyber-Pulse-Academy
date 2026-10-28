// ── Objectives: Medium (12) + Hard (9) with machine-checkable validators ──────
// Ported 1:1 from the original lab: same wording, same hints (3-tier medium /
// 1-nudge hard), same pass/fail teaching messages, same validation logic and
// accepted synonyms. Validators are pure functions of the lab state.
(function () {
  'use strict';

  var DATA = window.LAB_DATA;

  // ── Validation helpers (identical to the original) ──────────────────────────
  function norm(s) { return String(s == null ? '' : s).trim().toLowerCase().replace(/\s+/g, ' '); }
  function ok(v, list) { return !!v && list.indexOf(norm(v)) >= 0; }
  function has(v, needle) { return !!v && norm(v).indexOf(needle) >= 0; }
  function on(s, id) { return !!s.sensors[id]; }
  function ans(s, obj, field) { return (s.answers && s.answers[obj] && s.answers[obj][field]) || ''; }
  function seqEquals(a, b) { return a.length === b.length && a.every(function (x, i) { return x === b[i]; }); }
  function zoneHealthy(s, zoneSensors) { return zoneSensors.every(function (id) { return on(s, id); }); }

  // ═══════════════════════════════ MEDIUM (guided) ═════════════════════════════

  var MEDIUM_OBJECTIVES = [
    {
      id: 'OBJ-M1',
      title: 'Name the three actions of visibility',
      instruction: 'Open MISSION BRIEF → KNOWLEDGE CORE (Fundamentals tab). Match each of the three visibility actions to the description that fits it.',
      pillar: 'understand',
      anchor: 'Lesson detail: “identifying, containing, and protecting all data”',
      fields: [
        {
          id: 'identify', label: 'IDENTIFY →', type: 'select', options: [
            { value: 'b', label: 'Control who and what can reach the data, and limit its movement' },
            { value: 'a', label: 'Know what data and assets exist, and where data lives' },
            { value: 'c', label: 'Safeguard handling so data is used, stored and retained correctly' }
          ]
        },
        {
          id: 'contain', label: 'CONTAIN →', type: 'select', options: [
            { value: 'a', label: 'Know what data and assets exist, and where data lives' },
            { value: 'c', label: 'Safeguard handling so data is used, stored and retained correctly' },
            { value: 'b', label: 'Control who and what can reach the data, and limit its movement' }
          ]
        },
        {
          id: 'protect', label: 'PROTECT →', type: 'select', options: [
            { value: 'c', label: 'Safeguard handling so data is used, stored and retained correctly' },
            { value: 'a', label: 'Know what data and assets exist, and where data lives' },
            { value: 'b', label: 'Control who and what can reach the data, and limit its movement' }
          ]
        }
      ],
      hints: [
        'Re-read the three cards under “The three actions” — each verb has a one-line definition directly beneath it.',
        'Identify = knowing what exists. Contain = controlling the reach. Protect = keeping handling correct.',
        'IDENTIFY → “Know what data and assets exist…”, CONTAIN → “Control who and what can reach…”, PROTECT → “Safeguard handling…”.'
      ],
      passMsg: 'These three verbs are the foundation: visibility lets teams quickly identify and respond to unauthorized access events, evidences compliance, and gives control over who, when, where and how resources are accessed. Every sensor you enable on the Floor serves one of them.',
      failMsg: 'Each verb pairs with exactly one card in the Fundamentals tab — re-read them and try again.',
      validate: function (s) {
        return { pass: ans(s, 'OBJ-M1', 'identify') === 'a' && ans(s, 'OBJ-M1', 'contain') === 'b' && ans(s, 'OBJ-M1', 'protect') === 'c' };
      }
    },
    {
      id: 'OBJ-M2',
      title: 'Light up Cloud & SaaS',
      instruction: 'The Coverage Grid shows a dark zone. Enable the sensor that restores Cloud & SaaS visibility in the Sensor Bay, then use its feed to name the riskiest unsanctioned app.',
      pillar: 'recognize',
      anchor: 'Chapter: SaaS visibility / CASB — shadow IT',
      fields: [
        {
          id: 'app', label: 'Riskiest unsanctioned app', type: 'select', options: [
            { value: 'dropvaultsync', label: 'DropVaultSync' },
            { value: 'chartexpress', label: 'ChartExpress' },
            { value: 'northmail365', label: 'NorthMail 365' }
          ]
        }
      ],
      hints: [
        'Blind zones need an instrument — look in the SENSOR BAY for a Cloud & SaaS tool.',
        'CASB = Cloud Access Security Broker; it discovers SaaS apps in use, sanctioned or not.',
        'Enable CASB, open EVIDENCE → SaaS Discovery, and read the risk badges.'
      ],
      passMsg: 'Shadow IT is invisible to perimeter tools — to the firewall, file sync looks like ordinary HTTPS. The CASB discovered DropVaultSync pushing company files (2.1 GB, incl. Q3 shipments) to a personal cloud: block + DLP are the follow-ups. One sensor closed a whole zone.',
      failMsg: 'Enable the CASB sensor first, then read the SaaS Discovery feed for the HIGH-risk badge.',
      validate: function (s) {
        return { pass: on(s, 'casb') && ans(s, 'OBJ-M2', 'app') === 'dropvaultsync' };
      }
    },
    {
      id: 'OBJ-M3',
      title: 'Tune the relay',
      instruction: 'Enable the Syslog Relay & Aggregator in SENSOR BAY → Central Services and set its forwarded level so routine operational events are kept but DEBUG chatter is dropped.',
      pillar: 'recognize',
      anchor: 'Chapter: log levels (DEBUG→CRITICAL) & syslog relay',
      fields: [],
      hints: [
        'Level thresholds are cumulative: INFO keeps INFO and everything above it.',
        'DEBUG is developer chatter; INFO is the operational baseline for visibility.',
        'Central Services → Syslog Relay → switch ON → level INFO.'
      ],
      passMsg: 'Levels in one breath: DEBUG chatter → INFO operational → WARNING needs attention → ERROR fault → CRITICAL emergency. Threshold INFO keeps signal, drops noise, and cuts retention cost. Wrong thresholds hide exactly the events you will need later.',
      failMsg: 'The relay must be ON with forwarded level INFO. WARNING would hide the very logon events coming next.',
      validate: function (s) { return { pass: on(s, 'syslogRelay') && s.relayLevel === 'INFO' }; }
    },
    {
      id: 'OBJ-M4',
      title: 'Bring Servers & Data online',
      instruction: 'Enable all four sensors of the Servers & Data zone: System Logs, Application Logs, File Integrity Monitoring, and the Vulnerability Scanner.',
      pillar: 'recognize',
      anchor: 'Chapter: system logs, application logs, FIM, vulnerability scans',
      fields: [],
      hints: [
        'The zone tile on the Coverage Grid lists exactly which sensors it needs.',
        'Two log sources + one tripwire + one exposure probe.',
        'System Logs, Application Logs, FIM, Vulnerability Scanner — all four switches.'
      ],
      passMsg: 'Four lenses on one zone: system logs (OS events), application logs (software behavior), FIM (file drift vs baseline), vulnerability scans (exposure). Coverage is a stack, not a switch — each lens sees what the others cannot.',
      failMsg: 'All four switches in the Servers & Data section of the Sensor Bay must be ON.',
      validate: function (s) { return { pass: zoneHealthy(s, ['systemLogs', 'appLogs', 'fim', 'vulnScanner']) }; }
    },
    {
      id: 'OBJ-M5',
      title: 'Catch the bulk transfer',
      instruction: 'Enable both Network Edge sensors, then use the Packet Capture and Traffic Flow feeds to record the destination IP and start time (HH:MM) of the anomalous multi-gigabyte upload.',
      pillar: 'detect',
      anchor: 'Chapter: packet capture & network traffic analysis',
      fields: [
        { id: 'ip', label: 'Destination IP', type: 'text', placeholder: 'x.x.x.x' },
        { id: 'time', label: 'Start time (HH:MM)', type: 'text', placeholder: 'HH:MM' }
      ],
      hints: [
        'Two instruments watch the edge: one sees conversations, one sees volumes.',
        'Sort or scan for the largest outbound transfer — 1.9 GB TLS.',
        'Destination 203.0.113.9, starting 02:57.'
      ],
      passMsg: 'Packet capture shows the conversation; flow analytics show the volume. 1.9 GB to 203.0.113.9 — a destination with no business record — is textbook exfiltration. Host logs alone would never have shown the bytes: network visibility fills the gap.',
      failMsg: 'Enable Packet Capture and Network Traffic Analyzer, then look for the largest outbound TLS stream.',
      validate: function (s) {
        return {
          pass:
            on(s, 'packetCapture') &&
            on(s, 'flowMonitor') &&
            ok(ans(s, 'OBJ-M5', 'ip'), ['203.0.113.9']) &&
            ok(ans(s, 'OBJ-M5', 'time'), ['02:57', '2:57'])
        };
      }
    },
    {
      id: 'OBJ-M6',
      title: 'Interrogate the access report',
      instruction: 'Enable both Identity & Access sensors, then from the IAM Access Report record who performed the flagged off-hours access to Customer Manifests Q3, from where, and how.',
      pillar: 'detect',
      anchor: 'Lesson detail: control over who, when, where and how resources are accessed',
      fields: [
        { id: 'user', label: 'User', type: 'text', placeholder: 'username' },
        { id: 'ip', label: 'Source IP', type: 'text', placeholder: 'x.x.x.x' },
        {
          id: 'how', label: 'Method', type: 'select', options: [
            { value: 'https', label: 'HTTPS (VPN portal)' },
            { value: 'smb', label: 'SMB' },
            { value: 'rdp', label: 'RDP' },
            { value: 'api', label: 'API' },
            { value: 'ssh', label: 'SSH' }
          ]
        }
      ],
      hints: [
        'The access report is one row per access event — find the row flagged as an alert.',
        'One row answers all four questions: who, when, where, how.',
        'd.holt · 198.51.100.77 · HTTPS (VPN portal).'
      ],
      passMsg: 'One row gives the full four-question answer: who (d.holt), when (02:54), where (198.51.100.77), how (HTTPS over the VPN). That is precisely the record auditors and incident responders ask access reviews for.',
      failMsg: 'Enable Access Review Collector and PAM, then open EVIDENCE → IAM Access Report and read the flagged row.',
      validate: function (s) {
        return {
          pass:
            on(s, 'accessReview') &&
            on(s, 'pamVault') &&
            ok(ans(s, 'OBJ-M6', 'user'), ['d.holt', 'd holt', 'dholt']) &&
            ok(ans(s, 'OBJ-M6', 'ip'), ['198.51.100.77']) &&
            ans(s, 'OBJ-M6', 'how') === 'https'
        };
      }
    },
    {
      id: 'OBJ-M7',
      title: 'Inventory and classify',
      instruction: 'Enable the Discovery Agent, read the Asset Inventory count, then classify FS01 — the host holding Customer Manifests Q3 — with the correct data label.',
      pillar: 'recognize',
      anchor: 'Chapter: asset management & identifying data',
      fields: [
        { id: 'count', label: 'Assets identified', type: 'number', placeholder: 'e.g. 12' },
        {
          id: 'cls', label: 'FS01 classification', type: 'select', options: [
            { value: 'public', label: 'Public' },
            { value: 'internal', label: 'Internal' },
            { value: 'restricted', label: 'Restricted' },
            { value: 'unclassified', label: 'Leave unclassified' }
          ]
        }
      ],
      hints: [
        'You cannot protect what you have not identified — the agent enumerates the estate.',
        'The count is shown in the Asset Inventory header once the agent runs.',
        '27 assets; FS01 holds customer data → Restricted.'
      ],
      passMsg: 'Identification is the first act of protection: 27 assets are now known, and labeling FS01 as Restricted (customer data) drives everything downstream — share permissions, retention, monitoring priority. Unclassified crown jewels are unguarded crown jewels.',
      failMsg: 'Enable the Discovery Agent, read the total in the inventory, and set FS01’s classification there.',
      validate: function (s) {
        return {
          pass:
            on(s, 'discoveryAgent') &&
            ok(ans(s, 'OBJ-M7', 'count'), ['27']) &&
            ans(s, 'OBJ-M7', 'cls') === 'restricted'
        };
      }
    },
    {
      id: 'OBJ-M8',
      title: 'Filter the stream',
      instruction: 'If Security Logs are not yet live, enable them in the Sensor Bay. In the Log Stream, use the level and source filters to surface the failed-logon burst, then record the targeted account and the number of failures.',
      pillar: 'detect',
      anchor: 'Chapter: security logs & level filtering',
      fields: [
        { id: 'account', label: 'Targeted account', type: 'text', placeholder: 'username' },
        { id: 'count', label: 'Failed attempts', type: 'number', placeholder: 'e.g. 3' }
      ],
      hints: [
        'Filter level = WARNING and source = Security — failures are always WARNING or above.',
        'The burst sits between 02:47 and 02:52 on VPN01.',
        'Account d.holt, five failures… and then a success at 02:53. Pivot the level filter to INFO to see it.'
      ],
      passMsg: 'Security logs + a WARNING filter found the burst in seconds. The pivot matters just as much: dropping the filter to INFO reveals the success at 02:53. Filtering is a two-step investigation tool, not a one-shot trick.',
      failMsg: 'Enable the Security Logs source and relay, set level=WARNING + source=Security, then count the d.holt entries.',
      validate: function (s) {
        return {
          pass:
            on(s, 'syslogRelay') &&
            on(s, 'securityLogs') &&
            ok(ans(s, 'OBJ-M8', 'account'), ['d.holt', 'd holt', 'dholt']) &&
            ok(ans(s, 'OBJ-M8', 'count'), ['5', '05'])
        };
      }
    },
    {
      id: 'OBJ-M9',
      title: 'Spot the out-of-baseline change',
      instruction: 'Open EVIDENCE → File Integrity and record the full path of the change that was NOT part of the approved patch window.',
      pillar: 'detect',
      anchor: 'Chapter: baseline configurations & file integrity monitoring',
      fields: [{ id: 'path', label: 'Changed file path', type: 'text', placeholder: '/path/to/file' }],
      hints: [
        'Two files changed; one is the approved 22:05 vendor patch.',
        'The other change landed at 03:04 — far outside any window.',
        '/etc/cron.d/report-sync — a scheduled job file, a classic persistence home.'
      ],
      passMsg: 'FIM compares live files against a known-good baseline. /etc/cron.d/report-sync changed at 03:04, outside any window — and scheduled-job files are exactly where attackers install persistence. This one tripwire caught the whole second stage.',
      failMsg: 'Enable FIM (Servers & Data zone), open the File Integrity feed, and find the change outside the patch window.',
      validate: function (s) {
        return { pass: on(s, 'fim') && has(ans(s, 'OBJ-M9', 'path'), 'report-sync') };
      }
    },
    {
      id: 'OBJ-M10',
      title: 'Sync the clocks, build the timeline',
      instruction: 'Enable NTP Time Sync in Central Services, then pin exactly three events on the Incident Timeline in chronological order: the failed-logon burst, the manifests access, and the log clearing.',
      pillar: 'understand',
      anchor: 'Chapter: data aggregation & correlation; time synchronization',
      fields: [],
      hints: [
        'While NTP is off, VPN01 runs −7 minutes and FS01 +3 — pinning is guesswork.',
        'Central Services → NTP ON. Then pin three events from the chips below the timeline.',
        'Correct order: 02:47 failed logons → 02:54 manifests access → 03:12 log clearing.'
      ],
      passMsg: 'Without synchronized time, FS01 (+3 min) and VPN01 (−7 min) events interleave wrongly and correlation fails — this is why the SOC could not order the story before. NTP turns scattered timestamps into one truthful narrative; aggregation without time sync is confident nonsense.',
      failMsg: 'Enable NTP first, then pin exactly the three requested events in time order (use ↑/↓ to order).',
      validate: function (s) {
        return {
          pass: on(s, 'ntpSync') && seqEquals(s.timeline, DATA.MEDIUM_SEQ),
          detail: !on(s, 'ntpSync') ? 'NTP is still off.' : 'Pinned sequence does not match the three events in chronological order.'
        };
      }
    },
    {
      id: 'OBJ-M11',
      title: 'Assemble the dashboard',
      instruction: 'In WORKBENCHES → Dashboard Builder, pick the four widgets that together detect unauthorized access to sensitive data. Exactly four.',
      pillar: 'mitigate',
      anchor: 'Chapter: dashboards & reports; continuous monitoring',
      fields: [],
      hints: [
        'Think in the incident’s own steps: entry attempt, the act, tampering, the bytes leaving.',
        'Failed logons, off-hours sensitive access, FIM changes, outbound volume.',
        'The other four widgets belong to other dashboards — vulnerability, compliance, shadow-IT, PAM.'
      ],
      passMsg: 'Failed logons (entry attempts) + off-hours sensitive access (the act) + FIM changes (tampering) + egress volume (exfiltration) form a continuous-monitoring loop for exactly this incident class. A dashboard watched daily is what turns visibility into continuous monitoring.',
      failMsg: 'Choose exactly the four widgets that watch entry → access → tampering → exfiltration.',
      validate: function (s) {
        var chosen = Array.from(new Set(s.dashboard));
        var target = DATA.DASHBOARD_TARGET.slice().sort();
        return { pass: chosen.length === 4 && seqEquals(chosen.slice().sort(), target) };
      }
    },
    {
      id: 'OBJ-M12',
      title: 'Contain, protect, evidence',
      instruction: 'At WORKBENCHES → Response Desk, choose the correct action for each of the four findings — three containment/protection calls and one auditor-evidence call.',
      pillar: 'mitigate',
      anchor: 'Lesson detail: contain & protect data; access reviews as compliance evidence',
      fields: [],
      hints: [
        'What should not exist gets removed; what must exist gets vaulted.',
        'Stale account → revoke. Shared service password → PAM. Open share → need-to-know ACL.',
        'The auditor needs the access review report — the who/when/where/how record.'
      ],
      passMsg: 'Least privilege removes what should not exist; PAM stops credential reuse; need-to-know ACLs contain the data itself; and the access review report is the who/when/where/how proof auditors accept. Containment, protection, and evidence — visibility’s ends.',
      failMsg: 'Assign one action per finding at the Response Desk; DEBUG and “wait” are decoys.',
      validate: function (s) {
        return {
          pass:
            ans(s, 'OBJ-M12', 'F1') === 'revoke' &&
            ans(s, 'OBJ-M12', 'F2') === 'pam' &&
            ans(s, 'OBJ-M12', 'F3') === 'acl' &&
            ans(s, 'OBJ-M12', 'F4') === 'report'
        };
      }
    }
  ];

  // ═══════════════════════════════ HARD (challenge) ════════════════════════════

  var HARD_OBJECTIVES = [
    {
      id: 'OBJ-H1',
      title: 'Restore the console',
      instruction: 'You inherited a console with defects. Repair visibility until all five zones report healthy on the grid, then record the three central defects you fixed.',
      pillar: 'recognize',
      anchor: 'Detection engineering: coverage, levels & time — the visibility triad',
      fields: [
        { id: 'd1', label: 'Defect 1', type: 'select', options: [] },
        { id: 'd2', label: 'Defect 2', type: 'select', options: [] },
        { id: 'd3', label: 'Defect 3', type: 'select', options: [] }
      ],
      hints: [
        'One defect floods you with noise, one hides a whole zone, one corrupts every timeline.',
        'Check the relay level, the Central Services switches, and which zone is dark on the grid.',
        'Fix: relay level → INFO, enable CASB, enable NTP. Then record exactly those three.'
      ],
      passMsg: 'You triaged coverage like an engineer: noise (DEBUG flood), a blind zone (no CASB), and corrupted correlation (no NTP). Coverage, level and time are the three axes of operational visibility — any one broken and the whole console lies to you.',
      failMsg: 'All zones must be healthy AND the three real defects recorded (each defect exactly once).',
      validate: function (s) {
        var zonesOk =
          zoneHealthy(s, ['discoveryAgent', 'securityLogs']) &&
          zoneHealthy(s, ['systemLogs', 'appLogs', 'fim', 'vulnScanner']) &&
          zoneHealthy(s, ['packetCapture', 'flowMonitor']) &&
          zoneHealthy(s, ['accessReview', 'pamVault']) &&
          zoneHealthy(s, ['casb']);
        var fixed = [ans(s, 'OBJ-H1', 'd1'), ans(s, 'OBJ-H1', 'd2'), ans(s, 'OBJ-H1', 'd3')].sort();
        var expected = DATA.HARD_DEFECT_ANSWER.slice().sort();
        var reported = seqEquals(fixed, expected) && new Set(fixed).size === 3;
        return {
          pass: zonesOk && on(s, 'syslogRelay') && s.relayLevel === 'INFO' && on(s, 'ntpSync') && reported,
          detail: !zonesOk || s.relayLevel !== 'INFO' || !on(s, 'ntpSync') ? 'The console is not fully repaired yet.' : 'Defect report does not match the three real defects.'
        };
      }
    },
    {
      id: 'OBJ-H2',
      title: 'Attribute the intrusion',
      instruction: 'From the live feeds, identify the compromised account and record: username, first failed-logon time (HH:MM), source IP, access method, and the resource touched.',
      pillar: 'recognize',
      anchor: 'Evidence chaining: security logs + IAM report',
      fields: [
        { id: 'user', label: 'Username', type: 'text' },
        { id: 'time', label: 'First failure (HH:MM)', type: 'text' },
        { id: 'ip', label: 'Source IP', type: 'text' },
        {
          id: 'how', label: 'Access method', type: 'select', options: [
            { value: 'https', label: 'HTTPS (VPN portal)' },
            { value: 'smb', label: 'SMB' },
            { value: 'rdp', label: 'RDP' },
            { value: 'api', label: 'API' }
          ]
        },
        { id: 'resource', label: 'Resource touched', type: 'text', placeholder: 'share or file as shown' }
      ],
      hints: [
        'Five WARNINGs followed by an INFO on the same source IP — that is the intruder.',
        'The IAM Access Report row flagged “alert” carries method and resource.'
      ],
      passMsg: 'd.holt: five failures from 198.51.100.77 starting 02:47, then success via VPN with no MFA, then \\\\FS01\\Manifests-Q3. Chaining security logs, the IAM report and network evidence is how attribution stops being guesswork.',
      failMsg: 'All five parts must match the evidence exactly — strings as written in the feeds.',
      validate: function (s) {
        return {
          pass:
            ok(ans(s, 'OBJ-H2', 'user'), ['d.holt', 'd holt', 'dholt']) &&
            ok(ans(s, 'OBJ-H2', 'time'), ['02:47', '2:47']) &&
            ok(ans(s, 'OBJ-H2', 'ip'), ['198.51.100.77']) &&
            ans(s, 'OBJ-H2', 'how') === 'https' &&
            has(ans(s, 'OBJ-H2', 'resource'), 'manifests-q3')
        };
      }
    },
    {
      id: 'OBJ-H3',
      title: 'Reconstruct the chain',
      instruction: 'Pin all six incident events on the Incident Timeline in true chronological order.',
      pillar: 'recognize',
      anchor: 'Correlation: aggregation + synchronized time',
      fields: [],
      hints: [
        'NTP must be on before the order means anything; some chips stay hidden until their sensor runs.',
        'Initial access → collection → exfiltration → persistence → anti-forensics.',
        '02:47, 02:53, 02:54, 02:57, 03:04, 03:12 — six chips, clock order.'
      ],
      passMsg: 'Initial access (02:47–02:53) → collection (02:54) → exfiltration (02:57) → persistence (03:04) → anti-forensics (03:12). A defensible timeline is the backbone of every incident report — and it only exists when aggregation and time sync both work.',
      failMsg: 'All six events must be pinned, in clock order, with no extras.',
      validate: function (s) { return { pass: seqEquals(s.timeline, DATA.HARD_SEQ) }; }
    },
    {
      id: 'OBJ-H4',
      title: 'Separate signal from noise',
      instruction: 'At WORKBENCHES → Triage Desk, classify all six flagged anomalies as true or false positive.',
      pillar: 'detect',
      anchor: 'Detection work: true vs false positives, tuning',
      fields: [],
      hints: [
        'Three are false positives. Ask of each: is it documented, sanctioned, expected?',
        'Vendor export, intern sweep, patch-window change → false. Spray-then-stuff, unregistered bulk egress, log clearing → true.'
      ],
      passMsg: 'Three FPs (documented vendor export, intern sweep, patched app.conf) versus three TPs (spray-then-stuff, unregistered bulk egress, log clearing). Tuning is exactly this: FPs go to the allowlist with documentation, TPs go to the response process.',
      failMsg: 'All six rows must be classified correctly at the Triage Desk.',
      validate: function (s) {
        var need = { T1: 'fp', T2: 'fp', T3: 'fp', T4: 'tp', T5: 'tp', T6: 'tp' };
        var all = Object.keys(need).every(function (k) { return s.fpTriage && s.fpTriage[k] === need[k]; });
        return { pass: all };
      }
    },
    {
      id: 'OBJ-H5',
      title: 'Write the detection',
      instruction: 'At WORKBENCHES → Rule Builder, write a detection that fires on any access to the manifests share outside business hours. Set source, match field, condition, value, time filter and severity.',
      pillar: 'detect',
      anchor: 'Detection engineering: rule authoring from data sources',
      fields: [],
      hints: [
        'The IAM access log is where resource access is written; the field is the resource itself.',
        'Let the time filter do the hours — do not encode times in the value.',
        'Source IAM · field resource · condition contains · value “Manifests-Q3” · off-hours · High.'
      ],
      passMsg: 'Source IAM access log; field resource contains “Manifests-Q3”; off-hours filter; severity High. Every clause is a false-positive filter: precise rules beat noisy ones, and severity decides who gets woken up.',
      failMsg: 'Match the rule exactly to the brief: IAM source, resource contains “Manifests-Q3”, off-hours filter, High severity.',
      validate: function (s) {
        return {
          pass:
            s.rule.source === 'iam' &&
            s.rule.field === 'resource' &&
            s.rule.condition === 'contains' &&
            has(s.rule.value, 'manifests') &&
            s.rule.timeFilter === 'offhours' &&
            s.rule.severity === 'high'
        };
      }
    },
    {
      id: 'OBJ-H6',
      title: 'Sequence the countermeasures',
      instruction: 'At WORKBENCHES → Countermeasure Board, select the three controls that would have broken this attack chain and order them first / second / third.',
      pillar: 'mitigate',
      anchor: 'Mitigations: ATT&CK M1032, M1018, M1026',
      fields: [],
      hints: [
        'Order follows the chain: stop initial access first, then the authorization paths, then privilege abuse.',
        'Three controls are real mitigations; three are decoys.',
        '1st MFA on VPN · 2nd deprovisioning & least privilege · 3rd PAM vaulting.'
      ],
      passMsg: 'MFA on the VPN (M1032) kills the stolen-password replay → automated deprovisioning and least privilege (M1018) close the stale-account and share paths → PAM vaulting (M1026) removes the shared service credential. Order follows the chain: access, then authorization, then privilege.',
      failMsg: 'Assign exactly the three real controls, in chain-breaking order.',
      validate: function (s) { return { pass: seqEquals(s.counter, ['mfa', 'revoke', 'pam']) }; }
    },
    {
      id: 'OBJ-H7',
      title: 'Prove it to the auditor',
      instruction: 'At WORKBENCHES → Records Desk: set security-log retention to the policy value, then export both audit artifacts.',
      pillar: 'mitigate',
      anchor: 'Chapter: retention, reports & compliance evidence',
      fields: [],
      hints: [
        'The policy card on the desk states the required retention in months.',
        'Two artifacts answer “who touched what” and “what changed vs baseline”.',
        'Retention 12 months; export the access review report and the FIM baseline report.'
      ],
      passMsg: 'Policy demands 12 months — with 30-day retention the evidence of last quarter would already be gone. The access review report and FIM baseline report are the two artifacts that answer “who touched what, and was it authorized?” — visibility made auditable.',
      failMsg: 'Retention must match the policy card, and both exports must be produced.',
      validate: function (s) {
        return {
          pass: s.retention === 12 && s.exports.indexOf('accessReview') >= 0 && s.exports.indexOf('fim') >= 0
        };
      }
    },
    {
      id: 'OBJ-H8',
      title: 'Name the shadow leak',
      instruction: 'Using EVIDENCE → SaaS Discovery, identify the unsanctioned app leaking company files and select the correct action pair.',
      pillar: 'mitigate',
      anchor: 'Chapter: SaaS visibility / CASB',
      fields: [],
      hints: [
        'One app has a HIGH risk badge with observed file egress.',
        '“Allow with warning” leaves the leak running; “block every cloud tool” is overreach.'
      ],
      passMsg: 'CASB saw what the firewall treats as ordinary HTTPS: DropVaultSync pushing 2.1 GB (incl. Q3 shipments) to a personal cloud. Block + DLP stops the leak without banning every cloud tool — proportionate containment, driven by visibility.',
      failMsg: 'Set the app and the action pair at the SaaS Desk (Hard workbench).',
      validate: function (s) {
        return {
          pass: ans(s, 'OBJ-H8', 'app') === 'dropvaultsync' && ans(s, 'OBJ-H8', 'action') === 'blockdlp'
        };
      }
    },
    {
      id: 'OBJ-H9',
      title: 'Explain the correlation failure',
      instruction: 'Before you repaired the console, cross-host correlation failed. At WORKBENCHES → Post-mortem, choose the root cause and enter the largest clock skew observed (in minutes).',
      pillar: 'understand',
      anchor: 'Chapter: time synchronization & aggregation',
      fields: [],
      hints: [
        'The NTP sensor card keeps the drift table it recorded before sync.',
        'VPN01 was the worst offender.',
        'Root cause: clock skew; largest drift: 7 minutes.'
      ],
      passMsg: 'VPN01 ran −7 minutes against true time, so its logon events interleaved with events that actually followed them — correlation produced confident nonsense. NTP is a visibility control, not an IT nicety.',
      failMsg: 'Pick the root cause at the Post-mortem desk and enter the largest absolute drift from the skew table.',
      validate: function (s) {
        return { pass: ans(s, 'OBJ-H9', 'cause') === 'skew' && ok(ans(s, 'OBJ-H9', 'skew'), ['7']) };
      }
    }
  ];

  // Patch the defect-option lists into OBJ-H1 fields (keeps data DRY, as original).
  // Audit v2 (R6): the three rows show the same five options in three DIFFERENT
  // orders so the display order never reveals the correct defect trio.
  var defectOrders = [
    ['pcapOff', 'relayDebug', 'agentOff', 'ntpOff', 'casbOff'],
    ['casbOff', 'agentOff', 'ntpOff', 'relayDebug', 'pcapOff'],
    ['relayDebug', 'pcapOff', 'casbOff', 'agentOff', 'ntpOff']
  ];
  var byId = {};
  DATA.DEFECT_OPTIONS.forEach(function (o) { byId[o.value] = o; });
  var defectFields = [0, 1, 2].map(function (i) {
    return {
      id: 'd' + (i + 1),
      label: 'Defect ' + (i + 1),
      type: 'select',
      options: defectOrders[i].map(function (k) { return byId[k]; })
    };
  });
  HARD_OBJECTIVES[0].fields = defectFields;

  var OBJECTIVES = { medium: MEDIUM_OBJECTIVES, hard: HARD_OBJECTIVES };

  var PILLAR_LABEL = {
    understand: 'UNDERSTAND',
    recognize: 'RECOGNIZE',
    detect: 'DETECT',
    mitigate: 'MITIGATE'
  };

  // ── Star scoring (identical formula to the original score.ts) ────────────────
  function computeStars(progress, total) {
    var list = Object.values(progress || {});
    var done = list.filter(function (p) { return p && p.done; });
    var firstTry = done.filter(function (p) { return p.firstTry; }).length;
    var hints = done.reduce(function (n, p) { return n + p.hints; }, 0);
    var raw = (3 * firstTry + 1 * (done.length - firstTry) - 0.5 * hints) / (3 * Math.max(total, 1));
    var pct = Math.max(0, Math.min(1, raw));
    var stars = Math.max(1, Math.min(5, Math.round(pct * 5)));
    return { stars: stars, pct: Math.round(pct * 100), firstTry: firstTry, hints: hints, doneCount: done.length };
  }

  window.LAB_OBJECTIVES = {
    OBJECTIVES: OBJECTIVES,
    PILLAR_LABEL: PILLAR_LABEL,
    computeStars: computeStars
  };
})();
