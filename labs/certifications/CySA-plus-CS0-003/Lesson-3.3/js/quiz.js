// ── Knowledge checks: Medium (7 concept) + Hard (7 scenario) ─────────────────
// Ported 1:1 from the original lab: same stems, same options and order, same
// correct answers, same explanations (including distractor rejections).
(function () {
  'use strict';

  var MEDIUM_QUIZ = [
    {
      id: 'M-Q1',
      stem: 'A custom CRM application writes its own error output. Which log type captures it?',
      options: [
        { value: 'a', label: 'System log' },
        { value: 'b', label: 'Application log' },
        { value: 'c', label: 'Security log' },
        { value: 'd', label: 'Packet capture' }
      ],
      answer: 'b',
      explanation: 'Application logs record events emitted by business software — batch jobs, exports, and errors. System logs belong to the OS; security logs to authentication/defense events.'
    },
    {
      id: 'M-Q2',
      stem: 'What is the primary value of the syslog relay and aggregator?',
      options: [
        { value: 'a', label: 'It encrypts log contents while they sit at rest' },
        { value: 'b', label: 'It collects many sources into one searchable, correlated stream' },
        { value: 'c', label: 'It compresses logs so the relay uses less disk space' },
        { value: 'd', label: 'It replaces the need for host logging on every server' }
      ],
      answer: 'b',
      explanation: 'Aggregation puts every source in one place so events from different hosts can be correlated — and it enforces the level threshold that separates signal from noise. Encryption, compression and replacing host logs are not the relay\'s job.'
    },
    {
      id: 'M-Q3',
      stem: 'A service recovered from a transient failure that operators should notice. Which log level fits?',
      options: [
        { value: 'a', label: 'DEBUG' },
        { value: 'b', label: 'INFO' },
        { value: 'c', label: 'WARNING' },
        { value: 'd', label: 'CRITICAL' }
      ],
      answer: 'c',
      explanation: 'WARNING = “needs attention but not broken”. INFO is routine operation; CRITICAL is an emergency. Choosing thresholds well is what keeps the stream usable.'
    },
    {
      id: 'M-Q4',
      stem: 'File Integrity Monitoring alerts when…',
      options: [
        { value: 'a', label: 'A user opens a sensitive file they do not own' },
        { value: 'b', label: 'Disk usage on the monitored host crosses a threshold' },
        { value: 'c', label: 'A file\'s current state no longer matches the known-good baseline' },
        { value: 'd', label: 'A scheduled backup job completes without any errors' }
      ],
      answer: 'c',
      explanation: 'FIM keeps hashes of critical files against a baseline configuration and reports drift — the earliest tripwire for tampering and persistence. File opens, disk usage and backup results are monitored by other instruments.'
    },
    {
      id: 'M-Q5',
      stem: 'What can packet capture show that host logs never will?',
      options: [
        { value: 'a', label: 'Which user last opened and edited a file' },
        { value: 'b', label: 'The actual volume and destination of network transfers' },
        { value: 'c', label: 'Application crash stack traces with line numbers' },
        { value: 'd', label: 'Password changes made on the host' }
      ],
      answer: 'b',
      explanation: 'Hosts can be configured not to log — or logs can be cleared. The bytes on the wire, their size and destination, remain visible to the edge tap regardless. Users, crashes and password changes are host-side events.'
    },
    {
      id: 'M-Q6',
      stem: 'An access review answers which four questions for every resource?',
      options: [
        { value: 'a', label: 'Who, when, where, how' },
        { value: 'b', label: 'What, why, how much, when' },
        { value: 'c', label: 'Who, how many, how often, how fast' },
        { value: 'd', label: 'Where, what, which, whom' }
      ],
      answer: 'a',
      explanation: 'Who accessed, when, from where, and by what method — the exact record auditors request and responders pivot on.'
    },
    {
      id: 'M-Q7',
      stem: 'Why must clocks be synchronized (NTP) before logs from different hosts are correlated?',
      options: [
        { value: 'a', label: 'To reduce how much storage the log stream consumes' },
        { value: 'b', label: 'So timestamps line up and the event order reflects reality' },
        { value: 'c', label: 'To encrypt log contents end to end' },
        { value: 'd', label: 'To speed up message forwarding at the relay' }
      ],
      answer: 'b',
      explanation: 'Skewed clocks interleave events wrongly — correlation produces confident nonsense. NTP is a visibility control, not an IT nicety; it does not exist to save storage, encrypt or accelerate anything.'
    }
  ];

  var HARD_QUIZ = [
    {
      id: 'H-Q1',
      stem: 'A VPN logon and a file-share read describe the same intrusion, but their timestamps are 7 minutes apart and the order is impossible. Most likely cause?',
      options: [
        { value: 'a', label: 'The attacker forged one of the logs' },
        { value: 'b', label: 'Clock skew between the two hosts' },
        { value: 'c', label: 'The relay dropped events' },
        { value: 'd', label: 'Daylight-saving change' }
      ],
      answer: 'b',
      explanation: 'Impossible orderings across hosts are the signature of clock skew. Fix time sync first, then re-correlate — never “explain away” impossible timelines.'
    },
    {
      id: 'H-Q2',
      stem: 'A FIM alert shows /etc/cron.d/report-sync changed at 03:04; security logs show failed logons on the same host at 02:47. Best first action?',
      options: [
        { value: 'a', label: 'Delete the cron file immediately and reboot the host' },
        { value: 'b', label: 'Ignore it — cron files change during normal operation' },
        { value: 'c', label: 'Correlate and scope: pull adjacent logs, confirm the account used, and treat as suspected persistence' },
        { value: 'd', label: 'Wait for the next scheduled vulnerability scan to confirm' }
      ],
      answer: 'c',
      explanation: 'A baseline change right after failed logons is a persistence pattern until proven otherwise. Scope first, contain deliberately — deleting evidence destroys your own case, and waiting or ignoring hands the attacker the window.'
    },
    {
      id: 'H-Q3',
      stem: '“Data at rest changed with no application activity.” Which data source answers this fastest?',
      options: [
        { value: 'a', label: 'FIM' },
        { value: 'b', label: 'VPN session log' },
        { value: 'c', label: 'Asset inventory' },
        { value: 'd', label: 'Marketing dashboard' }
      ],
      answer: 'a',
      explanation: 'FIM is purpose-built for at-rest drift vs a baseline — the direct instrument for changes nothing should have made.'
    },
    {
      id: 'H-Q4',
      stem: 'At 03:12, mid-incident, the host’s security log is cleared by the compromised user. Classify and respond.',
      options: [
        { value: 'a', label: 'False positive — host logs rotate automatically at night' },
        { value: 'b', label: 'True positive — treat as anti-forensic defense evasion and escalate' },
        { value: 'c', label: 'Debug noise — verbose application output, nothing more' },
        { value: 'd', label: 'Scheduled maintenance — the SIEM rotates logs nightly' }
      ],
      answer: 'b',
      explanation: 'An audit-clear event during an active incident is close to a confession: the actor is erasing the trail. Rotation is routine and logged as such; a manual clear by the compromised user is neither. Off-host aggregation keeps the rest of the story intact.'
    },
    {
      id: 'H-Q5',
      stem: 'A separated contractor’s account is still active and logged in last week. The best control fix is…',
      options: [
        { value: 'a', label: 'Automated deprovisioning (joiner-mover-leaver) plus least-privilege review' },
        { value: 'b', label: 'Lower the log level to DEBUG so activity is captured' },
        { value: 'c', label: 'Widen the share permissions so the audits pass again' },
        { value: 'd', label: 'Buy more storage for longer log retention' }
      ],
      answer: 'a',
      explanation: 'This is user-account management (ATT&CK M1018): accounts must die when their holder leaves, and standing access must be least-privilege. More logging, wider permissions or more storage would all record or ease the problem, not fix it.'
    },
    {
      id: 'H-Q6',
      stem: 'The SOC discovers company files synced to a personal cloud drive. Which tool provides this visibility?',
      options: [
        { value: 'a', label: 'A traditional firewall' },
        { value: 'b', label: 'A CASB (SaaS discovery)' },
        { value: 'c', label: 'A backup server' },
        { value: 'd', label: 'The asset inventory' }
      ],
      answer: 'b',
      explanation: 'To the firewall, SaaS sync is plain HTTPS to an ordinary domain. A CASB identifies the app, the user, and the data volume — the only lens on shadow IT.'
    },
    {
      id: 'H-Q7',
      stem: 'An auditor requests 12 months of access history, but the relay retains 30 days. The correct takeaway is…',
      options: [
        { value: 'a', label: 'The evidence is gone; retention must match policy (12 months) going forward' },
        { value: 'b', label: 'Ask the auditor to accept fewer months of history instead' },
        { value: 'c', label: 'Raise the relay level to DEBUG so more events are kept' },
        { value: 'd', label: 'Treat retention as a storage budget concern, not a security one' }
      ],
      answer: 'a',
      explanation: 'Retention is a compliance and investigation control: evidence must outlive the question. Level (DEBUG) controls noise, not retention time — and the auditor\'s request cannot be negotiated down.'
    }
  ];

  window.LAB_QUIZ = { QUIZ: { medium: MEDIUM_QUIZ, hard: HARD_QUIZ } };
})();
