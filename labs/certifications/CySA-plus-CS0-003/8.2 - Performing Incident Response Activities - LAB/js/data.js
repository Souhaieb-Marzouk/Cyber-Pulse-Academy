// ─── CyberLab · CySA+ CS0-003 Lesson 8.2 — Incident Command Deck ──────────
// js/data.js — ALL lab content, carried over 1:1 from the original framework
// lab sources (src/lib/lab/content.ts + src/lib/lab/objectives.ts).
// 100% synthetic training data: fictional org (Meridian Freight Systems),
// RFC 5737 documentation IPs. MITRE ATT&CK IDs verified against attack.mitre.org.
// Data is separated from logic (logic lives in state.js / objectives.js / quiz.js).
// Everything hangs off the single global namespace: window.LAB

window.LAB = window.LAB || {};
(function (LAB) {
  'use strict';

  // STORAGE_KEY
  LAB.STORAGE_KEY = "cyberlab-cysa-82-ir-v1";

  // STATE_VERSION
  LAB.STATE_VERSION = 1;

  // PHASES
  LAB.PHASES = [
    {
      "id": "identify",
      "num": "01",
      "name": "IDENTIFY",
      "tagline": "Detection & identification",
      "simTime": "Day 1 · 09:03",
      "color": "text-teal-300 border-teal-400/60 bg-teal-400/10",
      "what": "The moment raw signals become a declared incident. An event is anything observable; an alert is a rule firing; an incident is a confirmed event that harms or threatens the organization. Here you separate true positives from noise, classify severity, and formally declare.",
      "actions": [
        "Triage the alert stream: which events belong to one security incident?",
        "Classify severity against written impact criteria — not gut feeling.",
        "Declare the incident: clock, bridge call, incident commander named."
      ]
    },
    {
      "id": "analyze",
      "num": "02",
      "name": "ANALYZE",
      "tagline": "Triage, scope & attack chain",
      "simTime": "Day 1 · 09:41",
      "color": "text-violet-300 border-violet-400/60 bg-violet-400/10",
      "what": "Build the incident picture: reconstruct the attack chain from evidence, define scope (which assets, accounts, data), and form the root-cause hypothesis that later phases will confirm. Good analysis makes containment surgical instead of frantic.",
      "actions": [
        "Reconstruct the attack chain in order from the evidence.",
        "Determine scope: affected hosts, accounts, and shares.",
        "Ask the detection question: how early COULD this have been caught?"
      ]
    },
    {
      "id": "contain",
      "num": "03",
      "name": "CONTAIN",
      "tagline": "Stop the bleeding",
      "simTime": "Day 1 · 10:05",
      "color": "text-amber-300 border-amber-400/60 bg-amber-400/10",
      "what": "Limit damage before it spreads — with the smallest set of controls that stops the threat. Every control has business cost, so containment is a trade-off decision: isolate what is compromised, block what the attacker needs, but do not take down the whole organization to catch one attacker.",
      "actions": [
        "Pick the FIRST action: stop active attacker access, preserve evidence.",
        "Enable the containment control set; refuse over-containment.",
        "Preserve volatile evidence (memory) before any destructive action."
      ]
    },
    {
      "id": "eradicate",
      "num": "04",
      "name": "ERADICATE",
      "tagline": "Remove the attacker",
      "simTime": "Day 1 · 11:52",
      "color": "text-rose-300 border-rose-400/60 bg-rose-400/10",
      "what": "Find and remove attacker artifacts: malware, persistence, stolen credentials, and the vulnerabilities that were abused. Order matters — restore too early and you resurrect the incident; reset credentials too late and the attacker walks back in.",
      "actions": [
        "Remove malware and persistence from every affected host.",
        "Invalidate every credential the attacker touched.",
        "Patch the abused vulnerability and sweep the estate for the same IOCs."
      ]
    },
    {
      "id": "recover",
      "num": "05",
      "name": "RECOVER",
      "tagline": "Restore & verify",
      "simTime": "Day 1 · 14:20",
      "color": "text-emerald-300 border-emerald-400/60 bg-emerald-400/10",
      "what": "Return systems to production from known-good state — then prove it. Recovery is not \"restore and hope\": you validate the restored data is clean, confirm defenses are healthy, and keep enhanced monitoring on the recovered assets.",
      "actions": [
        "Restore from verified clean backups — never from unknown state.",
        "Run validation tests before declaring systems healthy.",
        "Keep enhanced monitoring on during the watch window."
      ]
    },
    {
      "id": "learn",
      "num": "06",
      "name": "LEARN",
      "tagline": "Lessons learned & reporting",
      "simTime": "Day 1 · 18:05",
      "color": "text-lime-300 border-lime-400/60 bg-lime-400/10",
      "what": "Convert the incident into improvements. Separate root cause (the systemic gap that must be fixed) from contributing factors and symptoms, choose corrective actions that address the cause, measure response performance, and decide how the IR plan gets tested.",
      "actions": [
        "Classify findings: root cause vs contributing factor vs symptom.",
        "Select corrective actions that fix the cause, not the symptom.",
        "Compute MTTD/MTTR and choose the exercise that closes the gap."
      ]
    }
  ];

  // SIM_CLOCKS
  LAB.SIM_CLOCKS = {
    "identify": "Day 1 · 09:03",
    "analyze": "Day 1 · 09:41",
    "contain": "Day 1 · 10:05",
    "eradicate": "Day 1 · 11:52",
    "recover": "Day 1 · 14:20",
    "learn": "Day 1 · 18:05"
  };

  // EVIDENCE
  LAB.EVIDENCE = [
    {
      "id": "E-01",
      "time": "Sun 23:40",
      "source": "EDR · HR-WS-11",
      "summary": "Heuristic flag: \"process behavior anomaly\" on backup agent (vsnap.exe)",
      "detail": "EDR heuristic flagged the vendor-signed backup agent spawning a helper process. Analyst review at 23:52 confirmed valid vendor signature and documented behavior. Validated false positive.",
      "kind": "herring",
      "herringWhy": "Red herring — heuristics frequently flag backup/agent software. The binary was signature-verified; no attacker behavior (no C2, no file changes) correlates with this host on Monday.",
      "modes": [
        "hard"
      ]
    },
    {
      "id": "E-02",
      "time": "Sun 23:47",
      "source": "Perimeter firewall",
      "summary": "HR-WS-11 → 203.0.113.47:443 — 14 outbound beacons logged since Sun 23:47",
      "detail": "Same external IP later used by FIN-WS-04. HR-WS-11 received the Sunday phishing wave (\"Payroll_Adjustment.docm\") and has been beaconing on and off since Sunday night — nobody correlated the weekend traffic with Monday morning.",
      "kind": "constituent",
      "attack": "T1071.001",
      "modes": [
        "hard"
      ]
    },
    {
      "id": "E-03",
      "time": "Mon 01:57",
      "source": "Mail gateway log",
      "summary": "Delivered \"Invoice_7731.docm\" to j.wells@meridianfreight.example — sandboxing disabled",
      "detail": "Attachment policy: detonation sandboxing = DISABLED (cost-cutting change, March). Macro-bearing .docm from first-time-seen domain \"billing-portal.example\" passed straight to the inbox.",
      "kind": "constituent",
      "attack": "T1566.001",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "E-04",
      "time": "Mon 01:58",
      "source": "EDR · FIN-WS-04",
      "summary": "WINWORD.EXE spawned cmd.exe → macro executed",
      "detail": "User j.wells opened Invoice_7731.docm. Word macro invoked cmd.exe to run a dropped loader from %APPDATA%. Classic user-execution pattern.",
      "kind": "constituent",
      "attack": "T1204.002",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "E-05",
      "time": "Mon 02:01",
      "source": "EDR · FIN-WS-04",
      "summary": "powershell.exe -enc downloaded second stage syncupd.exe",
      "detail": "Base64-encoded PowerShell fetched syncupd.exe from a bulletproof host. Encoding is used to defeat string-based inspection — not \"admin tooling\".",
      "kind": "constituent",
      "attack": "T1059.001",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "E-06",
      "time": "Mon 02:03",
      "source": "Perimeter firewall",
      "summary": "FIN-WS-04 → 203.0.113.47:443 — beacon every ~60s",
      "detail": "Regular outbound HTTPS beacons to an IP with no business relationship. Consistent interval = automated C2, not human browsing.",
      "kind": "constituent",
      "attack": "T1071.001",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "E-07",
      "time": "Mon 02:12",
      "source": "EDR · FIN-WS-04",
      "summary": "Registry Run key added: \"OneDriveSyncAgent\" → %APPDATA%\\syncupd.exe",
      "detail": "Autostart persistence so the loader survives reboot. Name mimics a legitimate OneDrive component.",
      "kind": "constituent",
      "attack": "T1547.001",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "E-08",
      "time": "Mon 02:40",
      "source": "DC-01 security log",
      "summary": "Account m.rivera (helpdesk) RDP FIN-WS-04 → FILESRV-01, off-hours",
      "detail": "m.rivera was phishing-harvested last month; password reused. Session ran from FIN-WS-04 (not her workstation) and touched the Finance share — lateral movement with valid credentials.",
      "kind": "constituent",
      "attack": "T1078 / T1021.001",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "E-09",
      "time": "Mon 03:15",
      "source": "EDR · FIN-WS-04",
      "summary": "Attempt to open lsass.exe memory by syncupd.exe — BLOCKED",
      "detail": "Credential-dumping attempt against LSASS. EDR blocked it, but the attempt confirms the attacker wanted domain-wide credentials.",
      "kind": "constituent",
      "attack": "T1003.001",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "E-10",
      "time": "Mon 03:26",
      "source": "FILESRV-01 audit log",
      "summary": "4,112 file renames in \\\\Finance\\ in 3 min + README_RESTORE.txt dropped",
      "detail": "Mass rename-to-encrypted-extension pattern plus ransom note. Partial encryption — the job was cut short.",
      "kind": "constituent",
      "attack": "T1486",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "E-11",
      "time": "Mon 03:28",
      "source": "EDR · FIN-WS-04",
      "summary": "vssadmin.exe delete shadows /all /quiet",
      "detail": "Shadow copies (local restore points) deleted — inhibit-recovery behavior that typically precedes full ransomware detonation.",
      "kind": "constituent",
      "attack": "T1490",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "E-12",
      "time": "Mon 03:31",
      "source": "EDR console",
      "summary": "HIGH alert raised: \"Ransomware behavior — mass modification on FILESRV-01\"",
      "detail": "The key detection event. Alert sat in the unassigned queue — no after-hours escalation policy for HIGH. First human opened it at 09:03.",
      "kind": "constituent",
      "attack": "—",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "E-13",
      "time": "Mon 07:42",
      "source": "Helpdesk ticket #4471",
      "summary": "\"Finance staff cannot open files on the shared drive\"",
      "detail": "Business-impact signal of the encryption job. Routed as routine \"share permissions\" ticket — not correlated with E-12.",
      "kind": "constituent",
      "attack": "—",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "E-14",
      "time": "Mon 02:05",
      "source": "WSUS",
      "summary": "WSUS catalog sync failed (PRINT-02)",
      "detail": "Routine patch-infrastructure noise. Recurs weekly; unrelated.",
      "kind": "noise",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "E-15",
      "time": "Mon 03:00",
      "source": "FS-BKP-01 backup catalog",
      "summary": "Nightly full backup of FILESRV-01 completed 02:00 — verified",
      "detail": "Backup is your lifeline. Job reports success; integrity check passed.",
      "kind": "noise",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "E-16",
      "time": "Mon 05:10",
      "source": "VPN gateway",
      "summary": "Self-service password reset by remote user k.osei",
      "detail": "Routine user-initiated reset, MFA-verified. Unrelated.",
      "kind": "noise",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "E-17",
      "time": "Mon 04:12",
      "source": "Patch management",
      "summary": "Patch deployment failed on HR-APP-02 (vendor installer bug)",
      "detail": "Vendor confirmed installer defect; no security relevance. Looks scary in a morning report, changes nothing here.",
      "kind": "herring",
      "herringWhy": "Red herring — a failed patch job is availability noise, not adversary behavior. No indicator in this item overlaps with the incident chain.",
      "modes": [
        "hard"
      ]
    }
  ];

  // MEDIUM_EVIDENCE
  LAB.MEDIUM_EVIDENCE = [
    {
      "id": "E-03",
      "time": "Mon 01:57",
      "source": "Mail gateway log",
      "summary": "Delivered \"Invoice_7731.docm\" to j.wells@meridianfreight.example — sandboxing disabled",
      "detail": "Attachment policy: detonation sandboxing = DISABLED (cost-cutting change, March). Macro-bearing .docm from first-time-seen domain \"billing-portal.example\" passed straight to the inbox.",
      "kind": "constituent",
      "attack": "T1566.001",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "E-04",
      "time": "Mon 01:58",
      "source": "EDR · FIN-WS-04",
      "summary": "WINWORD.EXE spawned cmd.exe → macro executed",
      "detail": "User j.wells opened Invoice_7731.docm. Word macro invoked cmd.exe to run a dropped loader from %APPDATA%. Classic user-execution pattern.",
      "kind": "constituent",
      "attack": "T1204.002",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "E-05",
      "time": "Mon 02:01",
      "source": "EDR · FIN-WS-04",
      "summary": "powershell.exe -enc downloaded second stage syncupd.exe",
      "detail": "Base64-encoded PowerShell fetched syncupd.exe from a bulletproof host. Encoding is used to defeat string-based inspection — not \"admin tooling\".",
      "kind": "constituent",
      "attack": "T1059.001",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "E-06",
      "time": "Mon 02:03",
      "source": "Perimeter firewall",
      "summary": "FIN-WS-04 → 203.0.113.47:443 — beacon every ~60s",
      "detail": "Regular outbound HTTPS beacons to an IP with no business relationship. Consistent interval = automated C2, not human browsing.",
      "kind": "constituent",
      "attack": "T1071.001",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "E-07",
      "time": "Mon 02:12",
      "source": "EDR · FIN-WS-04",
      "summary": "Registry Run key added: \"OneDriveSyncAgent\" → %APPDATA%\\syncupd.exe",
      "detail": "Autostart persistence so the loader survives reboot. Name mimics a legitimate OneDrive component.",
      "kind": "constituent",
      "attack": "T1547.001",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "E-08",
      "time": "Mon 02:40",
      "source": "DC-01 security log",
      "summary": "Account m.rivera (helpdesk) RDP FIN-WS-04 → FILESRV-01, off-hours",
      "detail": "m.rivera was phishing-harvested last month; password reused. Session ran from FIN-WS-04 (not her workstation) and touched the Finance share — lateral movement with valid credentials.",
      "kind": "constituent",
      "attack": "T1078 / T1021.001",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "E-09",
      "time": "Mon 03:15",
      "source": "EDR · FIN-WS-04",
      "summary": "Attempt to open lsass.exe memory by syncupd.exe — BLOCKED",
      "detail": "Credential-dumping attempt against LSASS. EDR blocked it, but the attempt confirms the attacker wanted domain-wide credentials.",
      "kind": "constituent",
      "attack": "T1003.001",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "E-10",
      "time": "Mon 03:26",
      "source": "FILESRV-01 audit log",
      "summary": "4,112 file renames in \\\\Finance\\ in 3 min + README_RESTORE.txt dropped",
      "detail": "Mass rename-to-encrypted-extension pattern plus ransom note. Partial encryption — the job was cut short.",
      "kind": "constituent",
      "attack": "T1486",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "E-11",
      "time": "Mon 03:28",
      "source": "EDR · FIN-WS-04",
      "summary": "vssadmin.exe delete shadows /all /quiet",
      "detail": "Shadow copies (local restore points) deleted — inhibit-recovery behavior that typically precedes full ransomware detonation.",
      "kind": "constituent",
      "attack": "T1490",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "E-12",
      "time": "Mon 03:31",
      "source": "EDR console",
      "summary": "HIGH alert raised: \"Ransomware behavior — mass modification on FILESRV-01\"",
      "detail": "The key detection event. Alert sat in the unassigned queue — no after-hours escalation policy for HIGH. First human opened it at 09:03.",
      "kind": "constituent",
      "attack": "—",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "E-13",
      "time": "Mon 07:42",
      "source": "Helpdesk ticket #4471",
      "summary": "\"Finance staff cannot open files on the shared drive\"",
      "detail": "Business-impact signal of the encryption job. Routed as routine \"share permissions\" ticket — not correlated with E-12.",
      "kind": "constituent",
      "attack": "—",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "E-14",
      "time": "Mon 02:05",
      "source": "WSUS",
      "summary": "WSUS catalog sync failed (PRINT-02)",
      "detail": "Routine patch-infrastructure noise. Recurs weekly; unrelated.",
      "kind": "noise",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "E-15",
      "time": "Mon 03:00",
      "source": "FS-BKP-01 backup catalog",
      "summary": "Nightly full backup of FILESRV-01 completed 02:00 — verified",
      "detail": "Backup is your lifeline. Job reports success; integrity check passed.",
      "kind": "noise",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "E-16",
      "time": "Mon 05:10",
      "source": "VPN gateway",
      "summary": "Self-service password reset by remote user k.osei",
      "detail": "Routine user-initiated reset, MFA-verified. Unrelated.",
      "kind": "noise",
      "modes": [
        "medium",
        "hard"
      ]
    }
  ];

  // CONSTITUENTS_M
  LAB.CONSTITUENTS_M = [
    "E-03",
    "E-04",
    "E-05",
    "E-06",
    "E-07",
    "E-08",
    "E-09",
    "E-10",
    "E-11",
    "E-12",
    "E-13"
  ];

  // HARD_EVIDENCE
  LAB.HARD_EVIDENCE = [
    {
      "id": "E-01",
      "time": "Sun 23:40",
      "source": "EDR · HR-WS-11",
      "summary": "Heuristic flag: \"process behavior anomaly\" on backup agent (vsnap.exe)",
      "detail": "EDR heuristic flagged the vendor-signed backup agent spawning a helper process. Analyst review at 23:52 confirmed valid vendor signature and documented behavior. Validated false positive.",
      "kind": "herring",
      "herringWhy": "Red herring — heuristics frequently flag backup/agent software. The binary was signature-verified; no attacker behavior (no C2, no file changes) correlates with this host on Monday.",
      "modes": [
        "hard"
      ]
    },
    {
      "id": "E-02",
      "time": "Sun 23:47",
      "source": "Perimeter firewall",
      "summary": "HR-WS-11 → 203.0.113.47:443 — 14 outbound beacons logged since Sun 23:47",
      "detail": "Same external IP later used by FIN-WS-04. HR-WS-11 received the Sunday phishing wave (\"Payroll_Adjustment.docm\") and has been beaconing on and off since Sunday night — nobody correlated the weekend traffic with Monday morning.",
      "kind": "constituent",
      "attack": "T1071.001",
      "modes": [
        "hard"
      ]
    },
    {
      "id": "E-03",
      "time": "Mon 01:57",
      "source": "Mail gateway log",
      "summary": "Delivered \"Invoice_7731.docm\" to j.wells@meridianfreight.example — sandboxing disabled",
      "detail": "Attachment policy: detonation sandboxing = DISABLED (cost-cutting change, March). Macro-bearing .docm from first-time-seen domain \"billing-portal.example\" passed straight to the inbox.",
      "kind": "constituent",
      "attack": "T1566.001",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "E-04",
      "time": "Mon 01:58",
      "source": "EDR · FIN-WS-04",
      "summary": "WINWORD.EXE spawned cmd.exe → macro executed",
      "detail": "User j.wells opened Invoice_7731.docm. Word macro invoked cmd.exe to run a dropped loader from %APPDATA%. Classic user-execution pattern.",
      "kind": "constituent",
      "attack": "T1204.002",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "E-05",
      "time": "Mon 02:01",
      "source": "EDR · FIN-WS-04",
      "summary": "powershell.exe -enc downloaded second stage syncupd.exe",
      "detail": "Base64-encoded PowerShell fetched syncupd.exe from a bulletproof host. Encoding is used to defeat string-based inspection — not \"admin tooling\".",
      "kind": "constituent",
      "attack": "T1059.001",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "E-06",
      "time": "Mon 02:03",
      "source": "Perimeter firewall",
      "summary": "FIN-WS-04 → 203.0.113.47:443 — beacon every ~60s",
      "detail": "Regular outbound HTTPS beacons to an IP with no business relationship. Consistent interval = automated C2, not human browsing.",
      "kind": "constituent",
      "attack": "T1071.001",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "E-07",
      "time": "Mon 02:12",
      "source": "EDR · FIN-WS-04",
      "summary": "Registry Run key added: \"OneDriveSyncAgent\" → %APPDATA%\\syncupd.exe",
      "detail": "Autostart persistence so the loader survives reboot. Name mimics a legitimate OneDrive component.",
      "kind": "constituent",
      "attack": "T1547.001",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "E-08",
      "time": "Mon 02:40",
      "source": "DC-01 security log",
      "summary": "Account m.rivera (helpdesk) RDP FIN-WS-04 → FILESRV-01, off-hours",
      "detail": "m.rivera was phishing-harvested last month; password reused. Session ran from FIN-WS-04 (not her workstation) and touched the Finance share — lateral movement with valid credentials.",
      "kind": "constituent",
      "attack": "T1078 / T1021.001",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "E-09",
      "time": "Mon 03:15",
      "source": "EDR · FIN-WS-04",
      "summary": "Attempt to open lsass.exe memory by syncupd.exe — BLOCKED",
      "detail": "Credential-dumping attempt against LSASS. EDR blocked it, but the attempt confirms the attacker wanted domain-wide credentials.",
      "kind": "constituent",
      "attack": "T1003.001",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "E-10",
      "time": "Mon 03:26",
      "source": "FILESRV-01 audit log",
      "summary": "4,112 file renames in \\\\Finance\\ in 3 min + README_RESTORE.txt dropped",
      "detail": "Mass rename-to-encrypted-extension pattern plus ransom note. Partial encryption — the job was cut short.",
      "kind": "constituent",
      "attack": "T1486",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "E-11",
      "time": "Mon 03:28",
      "source": "EDR · FIN-WS-04",
      "summary": "vssadmin.exe delete shadows /all /quiet",
      "detail": "Shadow copies (local restore points) deleted — inhibit-recovery behavior that typically precedes full ransomware detonation.",
      "kind": "constituent",
      "attack": "T1490",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "E-12",
      "time": "Mon 03:31",
      "source": "EDR console",
      "summary": "HIGH alert raised: \"Ransomware behavior — mass modification on FILESRV-01\"",
      "detail": "The key detection event. Alert sat in the unassigned queue — no after-hours escalation policy for HIGH. First human opened it at 09:03.",
      "kind": "constituent",
      "attack": "—",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "E-13",
      "time": "Mon 07:42",
      "source": "Helpdesk ticket #4471",
      "summary": "\"Finance staff cannot open files on the shared drive\"",
      "detail": "Business-impact signal of the encryption job. Routed as routine \"share permissions\" ticket — not correlated with E-12.",
      "kind": "constituent",
      "attack": "—",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "E-14",
      "time": "Mon 02:05",
      "source": "WSUS",
      "summary": "WSUS catalog sync failed (PRINT-02)",
      "detail": "Routine patch-infrastructure noise. Recurs weekly; unrelated.",
      "kind": "noise",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "E-15",
      "time": "Mon 03:00",
      "source": "FS-BKP-01 backup catalog",
      "summary": "Nightly full backup of FILESRV-01 completed 02:00 — verified",
      "detail": "Backup is your lifeline. Job reports success; integrity check passed.",
      "kind": "noise",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "E-16",
      "time": "Mon 05:10",
      "source": "VPN gateway",
      "summary": "Self-service password reset by remote user k.osei",
      "detail": "Routine user-initiated reset, MFA-verified. Unrelated.",
      "kind": "noise",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "E-17",
      "time": "Mon 04:12",
      "source": "Patch management",
      "summary": "Patch deployment failed on HR-APP-02 (vendor installer bug)",
      "detail": "Vendor confirmed installer defect; no security relevance. Looks scary in a morning report, changes nothing here.",
      "kind": "herring",
      "herringWhy": "Red herring — a failed patch job is availability noise, not adversary behavior. No indicator in this item overlaps with the incident chain.",
      "modes": [
        "hard"
      ]
    }
  ];

  // CONSTITUENTS_H
  LAB.CONSTITUENTS_H = [
    "E-02",
    "E-03",
    "E-04",
    "E-05",
    "E-06",
    "E-07",
    "E-08",
    "E-09",
    "E-10",
    "E-11",
    "E-12",
    "E-13"
  ];

  // ASSETS
  LAB.ASSETS = [
    {
      "id": "A-FINWS04",
      "name": "FIN-WS-04",
      "role": "Finance workstation",
      "desc": "User j.wells · loader + Run-key persistence · LSASS dump attempt blocked",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "A-FILESRV",
      "name": "FILESRV-01",
      "role": "File server",
      "desc": "Finance share partially encrypted (4,112 files) · missing Q1 patch",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "A-DC01",
      "name": "DC-01",
      "role": "Domain controller",
      "desc": "Source of the m.rivera logon events · no confirmed compromise",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "A-BKP",
      "name": "FS-BKP-01",
      "role": "Backup server",
      "desc": "Nightly full backup 02:00 · verified job · check the job log before you trust it",
      "modes": [
        "medium",
        "hard"
      ]
    },
    {
      "id": "A-HRWS11",
      "name": "HR-WS-11",
      "role": "HR workstation",
      "desc": "Sunday phishing wave · beaconing since Sun 23:47",
      "modes": [
        "hard"
      ]
    }
  ];

  // CONTROLS
  LAB.CONTROLS = [
    {
      "id": "C-ISO-FIN",
      "label": "Network-isolate FIN-WS-04",
      "desc": "Cut user traffic; keep the EDR management channel alive.",
      "impact": "Impact: one finance user offline."
    },
    {
      "id": "C-ISO-FS",
      "label": "Isolate FILESRV-01 from user shares",
      "desc": "SMB off for user subnets; retain admin + backup access.",
      "impact": "Impact: Finance shares unavailable during containment."
    },
    {
      "id": "C-BLK-C2",
      "label": "Block 203.0.113.47 at perimeter firewall",
      "desc": "Deny outbound/inbound to the C2 infrastructure.",
      "impact": "Impact: none known."
    },
    {
      "id": "C-DIS-ACC",
      "label": "Disable m.rivera + svc-helpdesk; force resets",
      "desc": "Kill every account the attacker demonstrated control over.",
      "impact": "Impact: helpdesk capacity dips for an hour."
    },
    {
      "id": "C-MAIL",
      "label": "Block sender domain; purge phishing email org-wide",
      "desc": "Remove the delivery vector so nobody re-executes.",
      "impact": "Impact: none."
    },
    {
      "id": "C-MEM-FIN",
      "label": "Capture memory image of FIN-WS-04 (live response)",
      "desc": "Preserve volatile evidence before any destructive step.",
      "impact": "Impact: none — 20 min of analyst time."
    },
    {
      "id": "C-ISO-DC",
      "label": "Full network isolation of DC-01",
      "desc": "Cut the domain controller off entirely.",
      "impact": "Impact: authentication, DNS, DFS fail for ALL 2,400 staff."
    },
    {
      "id": "C-VPN",
      "label": "Shut down company-wide remote-access VPN",
      "desc": "Kill remote access for everyone.",
      "impact": "Impact: ~300 remote staff locked out; no evidence VPN was used."
    },
    {
      "id": "C-WIPE",
      "label": "Immediate wipe & reimage of FIN-WS-04",
      "desc": "Disk-wipe the workstation right now.",
      "impact": "Impact: destroys volatile evidence + root-cause artifacts."
    }
  ];

  // CONTAIN_REQUIRED_ON_M
  LAB.CONTAIN_REQUIRED_ON_M = [
    "C-ISO-FIN",
    "C-ISO-FS",
    "C-BLK-C2",
    "C-DIS-ACC",
    "C-MAIL"
  ];

  // CONTAIN_REQUIRED_OFF
  LAB.CONTAIN_REQUIRED_OFF = [
    "C-ISO-DC",
    "C-VPN",
    "C-WIPE"
  ];

  // CONTAIN_REQUIRED_ON_H
  LAB.CONTAIN_REQUIRED_ON_H = [
    "C-ISO-FIN",
    "C-ISO-FS",
    "C-BLK-C2",
    "C-DIS-ACC",
    "C-MAIL",
    "C-MEM-FIN"
  ];

  // FIRST_ACTIONS
  LAB.FIRST_ACTIONS = [
    {
      "id": "F-ISO",
      "text": "Network-isolate FIN-WS-04 (keep the EDR channel alive)",
      "why": "Correct. Stops the active C2/lateral-movement source in seconds while preserving volatile evidence on disk and in memory. Containment first — always reversible, always informative.",
      "correct": true
    },
    {
      "id": "F-WIPE",
      "text": "Wipe and reimage FIN-WS-04 immediately",
      "why": "Destructive before investigative: you destroy the evidence needed for root cause, and it does nothing about the already-completed lateral movement to FILESRV-01.",
      "correct": false
    },
    {
      "id": "F-VPN",
      "text": "Shut down the company-wide VPN",
      "why": "Over-containment: no log shows the VPN path was used. You would lock out ~300 staff for no defensive gain.",
      "correct": false
    },
    {
      "id": "F-CALL",
      "text": "Call the customer account manager before touching anything",
      "why": "Communication runs in parallel — it is not containment. Every minute of delay lets the attacker advance.",
      "correct": false
    },
    {
      "id": "F-MAIL",
      "text": "Delete the phishing email from j.wells's mailbox",
      "why": "Necessary hygiene, but it does not stop the attacker who is already inside and beaconing. Purges come WITH the containment set, not instead of it.",
      "correct": false
    }
  ];

  // DC_DECISIONS
  LAB.DC_DECISIONS = [
    {
      "id": "DC-MON",
      "text": "Monitor + harden: enhanced auth-log review on DC-01, block C2 at perimeter, watch svc-helpdesk",
      "why": "Correct. No confirmed compromise of DC-01 — you watch the crown jewel closely instead of knocking out authentication for the whole organization.",
      "correct": true
    },
    {
      "id": "DC-ISO",
      "text": "Fully isolate DC-01 from the network",
      "why": "Over-containment. No evidence of DC compromise; isolation kills authentication, DNS and file access for all 2,400 staff — the incident becomes a self-inflicted outage.",
      "correct": false
    },
    {
      "id": "DC-NOTHING",
      "text": "Take no action — FIN-WS-04 was the only compromised host",
      "why": "Under-containment. Attackers used VALID ACCOUNTS (m.rivera) sourced from DC-01 logs; ignoring the identity plane because \"the malware is contained\" is how re-entry happens.",
      "correct": false
    }
  ];

  // CHAIN_CARDS
  LAB.CHAIN_CARDS = [
    {
      "id": "CH1",
      "label": "Macro attachment opened",
      "detail": "WINWORD spawned cmd from Invoice_7731.docm",
      "attack": "T1566.001 → T1204.002",
      "order": 1
    },
    {
      "id": "CH2",
      "label": "PowerShell stage-2 download",
      "detail": "Encoded command pulled syncupd.exe",
      "attack": "T1059.001",
      "order": 2
    },
    {
      "id": "CH3",
      "label": "HTTPS C2 beaconing",
      "detail": "Periodic beacons to 203.0.113.47:443",
      "attack": "T1071.001",
      "order": 3
    },
    {
      "id": "CH4",
      "label": "Run-key persistence installed",
      "detail": "\"OneDriveSyncAgent\" → syncupd.exe",
      "attack": "T1547.001",
      "order": 4
    },
    {
      "id": "CH5",
      "label": "Lateral movement via RDP",
      "detail": "Stolen m.rivera account reached FILESRV-01",
      "attack": "T1078 / T1021.001",
      "order": 5
    },
    {
      "id": "CH6",
      "label": "LSASS dump attempt (blocked)",
      "detail": "syncupd.exe touched lsass.exe memory",
      "attack": "T1003.001",
      "order": 6
    },
    {
      "id": "CH7",
      "label": "Share staging & mass encryption",
      "detail": "4,112 renames + ransom note on Finance share",
      "attack": "T1486",
      "order": 7
    },
    {
      "id": "CH8",
      "label": "Shadow copies deleted",
      "detail": "vssadmin delete shadows on FIN-WS-04",
      "attack": "T1490",
      "order": 8
    },
    {
      "id": "CHX1",
      "label": "VPN brute-force attempt",
      "detail": "Password spraying against the VPN gateway",
      "attack": "—",
      "order": 99,
      "distractor": true,
      "distractorWhy": "No VPN attack exists in any log — E-16 is a routine self-service reset. Inventing steps that lack evidence corrupts the analysis."
    },
    {
      "id": "CHX2",
      "label": "Exfiltration to cloud storage",
      "detail": "Bulk upload of Finance data to a file-sharing site",
      "attack": "—",
      "order": 99,
      "distractor": true,
      "distractorWhy": "No large outbound transfers were observed. Double-extortion is plausible for this actor class, but IR reports evidence — not speculation."
    }
  ];

  // ERADICATION_POOL
  LAB.ERADICATION_POOL = [
    {
      "id": "EA-REMOVE",
      "label": "Remove loader & Run-key persistence",
      "detail": "Delete syncupd.exe artifacts + \"OneDriveSyncAgent\" autostart entry.",
      "correct": true,
      "order": 1
    },
    {
      "id": "EA-SCAN",
      "label": "Full EDR/AV scan & quarantine (all affected hosts)",
      "detail": "Hunt residual loader components on FIN-WS-04 and any other host.",
      "correct": true,
      "order": 2
    },
    {
      "id": "EA-RESET",
      "label": "Reset credentials: m.rivera, svc-helpdesk, j.wells",
      "detail": "New passwords + revoke active sessions/tokens for touched accounts.",
      "correct": true,
      "order": 3
    },
    {
      "id": "EA-WIPE",
      "label": "Reimage FIN-WS-04 from clean corporate image",
      "detail": "Known-good state for a host that ran attacker code.",
      "correct": true,
      "order": 4
    },
    {
      "id": "EA-PATCH",
      "label": "Apply the missing Q1 security patch to FILESRV-01",
      "detail": "Close the vulnerability the attacker abused for share access.",
      "correct": true,
      "order": 5
    },
    {
      "id": "EA-SIG",
      "label": "Push new IOCs to EDR + mail gateway",
      "detail": "Loader hash, C2 IP/domain, Run-key name → every sensor.",
      "correct": true,
      "order": 6
    },
    {
      "id": "EA-SWEEP",
      "label": "Org-wide IOC sweep",
      "detail": "Search all endpoints for the indicators to confirm nothing else is infected.",
      "correct": true,
      "order": 7
    },
    {
      "id": "EA-RESETALL",
      "label": "Force password reset for ALL 2,400 accounts",
      "detail": "Blanket credential reset across the company.",
      "correct": false,
      "order": 99
    },
    {
      "id": "EA-RESTORE",
      "label": "Restore the Finance share from backup now",
      "detail": "Start the restore immediately, in parallel.",
      "correct": false,
      "order": 99
    }
  ];

  // RECOVERY_STRATEGIES
  LAB.RECOVERY_STRATEGIES = [
    {
      "id": "R-BKP",
      "text": "Restore the Finance share from the verified 02:00 backup",
      "why": "Correct. Known-good, integrity-checked, and only hours of data at risk (reconcilable). Recovery from a verified clean backup is the textbook path.",
      "correct": true
    },
    {
      "id": "R-DECRYPT",
      "text": "Try a third-party ransomware decryptor first",
      "why": "There is no reliable public decryptor for this family. Gambling on one wastes the recovery window and can corrupt the only copies you have.",
      "correct": false
    },
    {
      "id": "R-PAY",
      "text": "Pay the threat actors for the decryption key",
      "why": "Paying funds criminal infrastructure, offers no guarantee, and is discouraged by CISA/FBI. You have a verified backup — paying is indefensible here.",
      "correct": false
    },
    {
      "id": "R-ACCEPT",
      "text": "Accept the data loss and rebuild the share empty",
      "why": "Unnecessary: a verified backup exists hours before encryption. \"Accept loss\" only applies when no clean restore point exists.",
      "correct": false
    }
  ];

  // RECOVERY_CHECKS
  LAB.RECOVERY_CHECKS = [
    {
      "id": "RC-SCAN",
      "label": "Scan restored data with updated EDR signatures",
      "desc": "Backups can resurrect latent malware — scan before users return.",
      "correct": true
    },
    {
      "id": "RC-VERIFY",
      "label": "Open sample files + reconcile counts against last known good",
      "desc": "Proves the restore actually recovered working data.",
      "correct": true
    },
    {
      "id": "RC-EDR",
      "label": "Confirm EDR agent healthy + signatures current on FILESRV-01",
      "desc": "The host must be defended before it re-enters production.",
      "correct": true
    },
    {
      "id": "RC-BKP",
      "label": "Confirm tonight's backup job is queued and running",
      "desc": "The safety net must be re-armed immediately.",
      "correct": true
    },
    {
      "id": "RC-DIM",
      "label": "Disable EDR notifications during restore to reduce noise",
      "desc": "Blinding your sensors during the most fragile phase is how round two starts.",
      "correct": false
    }
  ];

  // BACKUP_RECONCILE
  LAB.BACKUP_RECONCILE = [
    {
      "id": "BR-DIFF",
      "text": "Restore the 02:00 backup, then reconcile the 2 skipped files against Friday's full backup + the file-server audit log",
      "why": "Correct. Footnote in the job log: \"2 files skipped (locked)\". A verified backup with a known, small, reconcilable delta beats an older complete backup.",
      "correct": true
    },
    {
      "id": "BR-WED",
      "text": "Use Wednesday's backup instead — it is older but complete",
      "why": "Throws away four days of Finance data to avoid reconciling two files. Disproportionate.",
      "correct": false
    },
    {
      "id": "BR-ACCEPT",
      "text": "Proceed — losing 2 files is acceptable",
      "why": "The files are recoverable from Friday's backup and the audit log tells you exactly which ones. \"Acceptable loss\" requires that loss be unavoidable.",
      "correct": false
    },
    {
      "id": "BR-WAIT",
      "text": "Wait for the attacker's decryptor to recover the 2 locked files",
      "why": "Never. The keys are untrusted, may never arrive, and normalization with criminals is a legal/policy violation here.",
      "correct": false
    }
  ];

  // ROOT_CAUSES
  LAB.ROOT_CAUSES = [
    {
      "id": "RCA-SAND",
      "text": "Attachment sandboxing was disabled on the mail gateway (cost-cutting change), so weaponized attachments reached users unchallenged — and no refresher training backstop existed",
      "why": "Correct. Root cause = the systemic condition that, fixed, prevents recurrence. Enable sandboxing + training and this exact chain dies at step one.",
      "correct": true
    },
    {
      "id": "RCA-CLICK",
      "text": "j.wells clicked a malicious attachment",
      "why": "That is the proximate human event, not the root cause. Fixating on the click leads to blame, not prevention — any user could have received the same email.",
      "correct": false
    },
    {
      "id": "RCA-ENCRYPT",
      "text": "Files on FILESRV-01 got encrypted",
      "why": "That is the impact/symptom. Root-cause analysis must go upstream of the encryption.",
      "correct": false
    },
    {
      "id": "RCA-ACCT",
      "text": "The attacker used the m.rivera account",
      "why": "That is a mechanism of lateral movement (T1078). Asking \"why did valid-account abuse work?\" gets you to the real causes: no MFA, excessive privilege, reused password.",
      "correct": false
    }
  ];

  // CORRECTIVES
  LAB.CORRECTIVES = [
    {
      "id": "CA-SAND",
      "label": "Enable attachment detonation sandboxing on the mail gateway",
      "correct": true
    },
    {
      "id": "CA-MFA",
      "label": "Enforce MFA on helpdesk/admin accounts (m.rivera, svc-helpdesk)",
      "correct": true
    },
    {
      "id": "CA-TRAIN",
      "label": "Phishing refresher training + simulated-phishing campaign",
      "correct": true
    },
    {
      "id": "CA-EDR",
      "label": "EDR policy: auto-isolate on ransomware-behavior detections + 24/7 HIGH-alert escalation",
      "correct": true
    },
    {
      "id": "CA-SVC",
      "label": "Block interactive/RDP logon for service accounts; least-privilege review",
      "correct": true
    },
    {
      "id": "CA-MEMO",
      "label": "Email all staff a memo asking them to be careful",
      "correct": false
    },
    {
      "id": "CA-FW",
      "label": "Buy two additional perimeter firewalls",
      "correct": false
    },
    {
      "id": "CA-PUNISH",
      "label": "Publicly discipline j.wells as a deterrent",
      "correct": false
    },
    {
      "id": "CA-INS",
      "label": "Increase cyber-insurance coverage",
      "correct": false
    }
  ];

  // FINDINGS
  LAB.FINDINGS = [
    {
      "id": "FD1",
      "text": "Attachment sandboxing disabled on the mail gateway",
      "answer": "root",
      "why": "Root cause — the systemic control gap that let the chain start. Fix it and the incident cannot recur in this form."
    },
    {
      "id": "FD2",
      "text": "m.rivera had local-admin rights on many endpoints, no MFA, reused password",
      "answer": "contributing",
      "why": "Contributing factor — it amplified the blast radius (T1078 lateral movement) but did not start the chain."
    },
    {
      "id": "FD3",
      "text": "FILESRV-01 missing the Q1 security patch",
      "answer": "contributing",
      "why": "Contributing factor — eased staging on the file server, but the incident succeeds without it."
    },
    {
      "id": "FD4",
      "text": "4,112 Finance files encrypted; ransom note dropped",
      "answer": "symptom",
      "why": "Symptom — observable impact of the intrusion, not a cause of anything."
    },
    {
      "id": "FD5",
      "text": "j.wells opened the invoice attachment",
      "answer": "contributing",
      "why": "Contributing factor — the proximate human event (T1204.002). The root cause is the system that let the attachment through."
    },
    {
      "id": "FD6",
      "text": "PRINT-02 printer certificate expiring next week",
      "answer": "unrelated",
      "why": "Unrelated — routine infrastructure hygiene with zero overlap with the incident chain."
    }
  ];

  // FINDING_CLASSES
  LAB.FINDING_CLASSES = [
    {
      "id": "root",
      "label": "Root cause"
    },
    {
      "id": "contributing",
      "label": "Contributing factor"
    },
    {
      "id": "symptom",
      "label": "Symptom"
    },
    {
      "id": "unrelated",
      "label": "Unrelated"
    }
  ];

  // EARLIEST_POINTS
  LAB.EARLIEST_POINTS = [
    {
      "id": "ED-GW",
      "text": "01:57 — mail gateway: attachment detonation sandboxing would have flagged the macro document before delivery",
      "why": "Correct — IF the control were configured correctly (it was disabled). \"Earliest detectable point\" asks when the attack was catchable with telemetry the org already owned, properly configured.",
      "correct": true
    },
    {
      "id": "ED-EDRPROC",
      "text": "01:58 — endpoint EDR process event: WINWORD spawning cmd",
      "why": "Detectable with today's config, but a full 1 minute — and one execution — later than the gateway point. Good depth question: process telemetry is your SECOND line, not the first.",
      "correct": false
    },
    {
      "id": "ED-RANSOM",
      "text": "03:31 — EDR HIGH ransomware-behavior alert on FILESRV-01",
      "why": "This is when the org DID effectively see it (and sat on it). It is the actual detection, not the earliest possible one.",
      "correct": false
    },
    {
      "id": "ED-TICKET",
      "text": "07:42 — helpdesk ticket #4471",
      "why": "Users are a real sensor, but this is nearly 6 hours after execution. Treating users as the primary detector is a finding, not an answer.",
      "correct": false
    }
  ];

  // EARLIEST_SOURCES
  LAB.EARLIEST_SOURCES = [
    {
      "id": "SRC-GW",
      "label": "Email gateway / detonation sandbox",
      "correct": true
    },
    {
      "id": "SRC-EDR",
      "label": "Endpoint EDR process telemetry",
      "correct": false
    },
    {
      "id": "SRC-FW",
      "label": "Perimeter firewall flow logs",
      "correct": false
    },
    {
      "id": "SRC-FS",
      "label": "File-server audit logs",
      "correct": false
    },
    {
      "id": "SRC-HD",
      "label": "Helpdesk tickets",
      "correct": false
    }
  ];

  // STAKEHOLDERS
  LAB.STAKEHOLDERS = [
    {
      "id": "S-CISO",
      "label": "CISO (incident owner)",
      "answer": "declaration",
      "why": "Incident ownership and resourcing decisions happen in the first hour."
    },
    {
      "id": "S-LEGAL",
      "label": "Legal counsel",
      "answer": "declaration",
      "why": "Privilege, contractual and regulatory assessment must start at declaration, not at the end."
    },
    {
      "id": "S-INS",
      "label": "Cyber insurer",
      "answer": "declaration",
      "why": "The policy requires prompt notice; late notice can void coverage."
    },
    {
      "id": "S-CUST",
      "label": "Granite Retail Group (customer — 72h contractual notice)",
      "answer": "72h",
      "why": "Contract says notify within 72 hours of a CONFIRMED incident — after containment confirms the facts."
    },
    {
      "id": "S-STAFF",
      "label": "All staff",
      "answer": "closure",
      "why": "A company-wide memo mid-response breeds rumors and tips off the attacker if mail is monitored; brief everyone at closure with facts."
    },
    {
      "id": "S-MEDIA",
      "label": "Local media",
      "answer": "none",
      "why": "No notification duty. Media contact is a legal/PR decision — never an IR-team action."
    }
  ];

  // NOTIF_TIMINGS
  LAB.NOTIF_TIMINGS = [
    {
      "id": "declaration",
      "label": "At declaration"
    },
    {
      "id": "72h",
      "label": "Within 72-hour window"
    },
    {
      "id": "closure",
      "label": "At closure"
    },
    {
      "id": "none",
      "label": "Not required"
    }
  ];

  // METRICS_MATURITY
  LAB.METRICS_MATURITY = [
    {
      "id": "MM-MTTD",
      "text": "MTTD — 7h05m from first malicious event to analyst eyes",
      "why": "Correct. The 03:31 HIGH alert sat untriaged until 09:03: the detection pipeline worked, the escalation did not. MTTD is where this org bleeds.",
      "correct": true
    },
    {
      "id": "MM-MTTC",
      "text": "MTTC — 2h11m from declaration (09:41) to containment complete (11:52)",
      "why": "Solid performance — containment decisions were fast once humans engaged. Not the gap.",
      "correct": false
    },
    {
      "id": "MM-MTTR",
      "text": "MTTR — 8h17m from detection to service restored",
      "why": "Driven mostly by the restore window, which is bounded by backup design — an engineering problem, not the detection gap.",
      "correct": false
    }
  ];

  // EXERCISES
  LAB.EXERCISES = [
    {
      "id": "EX-SIM",
      "text": "Simulation / functional exercise — hands-on, realistic conditions (live EDR policy, real restore drill)",
      "why": "Correct. The failures were technical execution gaps (untriaged alert, untested restore). Only a simulation exercises tooling and runbooks under realistic pressure.",
      "correct": true
    },
    {
      "id": "EX-TT",
      "text": "Tabletop exercise — discussion-based, around a table",
      "why": "Good for testing decision logic and comms, but nobody touches the EDR console or a restore runbook. It would not have caught this gap.",
      "correct": false
    },
    {
      "id": "EX-WALK",
      "text": "Walkthrough — team steps through the plan page by page",
      "why": "Useful for new plans and onboarding, but it rehearses reading, not responding.",
      "correct": false
    },
    {
      "id": "EX-CHECK",
      "text": "Checklist review — confirm documents exist and are current",
      "why": "A paperwork audit validates existence, not effectiveness. LESSON_DETAIL is explicit: IR \"must be regularly tested and practiced\".",
      "correct": false
    }
  ];

  // PLAN_UPDATES
  LAB.PLAN_UPDATES = [
    {
      "id": "PU-CONT",
      "label": "Containment playbook: add auto-isolation trigger for ransomware-class detections",
      "correct": true
    },
    {
      "id": "PU-RECOV",
      "label": "Recovery runbook: add backup-reconciliation step (skipped-file handling)",
      "correct": true
    },
    {
      "id": "PU-COMMS",
      "label": "Communications plan: add the 72-hour customer-notice decision matrix",
      "correct": true
    },
    {
      "id": "PU-REWRITE",
      "label": "Delete and rewrite the entire IR plan from scratch",
      "correct": false
    },
    {
      "id": "PU-PRAISE",
      "label": "Add an appendix praising the response team",
      "correct": false
    }
  ];

  // METRIC_ANCHORS
  LAB.METRIC_ANCHORS = {
    "firstMalicious": "01:58",
    "gatewayDetectable": "01:57",
    "analystDetects": "09:03",
    "declared": "09:41",
    "contained": "11:52",
    "restored": "17:20"
  };

  // GLOSSARY
  LAB.GLOSSARY = [
    {
      "term": "Event",
      "def": "Any observable occurrence in a system or network. Most events are harmless."
    },
    {
      "term": "Alert",
      "def": "A signal raised when a rule or heuristic matches events. Alerts need triage — many are false positives."
    },
    {
      "term": "Incident",
      "def": "A confirmed event (or series) that actually harms or imminently threatens the organization."
    },
    {
      "term": "Severity",
      "def": "The impact-based ranking of an incident that drives priority and escalation."
    },
    {
      "term": "Playbook / runbook",
      "def": "A pre-written, step-by-step procedure for a specific incident type. The deck you are standing on."
    },
    {
      "term": "Containment",
      "def": "Limiting the damage and spread of an incident before deeper cleanup — stop the bleeding."
    },
    {
      "term": "Eradication",
      "def": "Removing the attacker's artifacts and access: malware, persistence, stolen credentials, abused vulnerabilities."
    },
    {
      "term": "Recovery",
      "def": "Returning systems to production from known-good state, with validation and monitoring."
    },
    {
      "term": "Validation",
      "def": "Proving eradication and recovery actually worked — scans, tests, and verified data before closing."
    },
    {
      "term": "Root cause",
      "def": "The systemic condition that, if fixed, prevents recurrence. Deeper than the click, the malware, or the symptom."
    },
    {
      "term": "Corrective action",
      "def": "A concrete change that addresses a root cause or contributing factor — owned, dated, and verifiable."
    },
    {
      "term": "Lessons learned",
      "def": "The post-incident review that converts experience into plan changes, metrics, and training."
    },
    {
      "term": "IOC (indicator of compromise)",
      "def": "An observable artifact tied to attacker activity: hash, IP, domain, registry key, filename."
    },
    {
      "term": "MTTD",
      "def": "Mean time to detect — from first malicious activity to detection. In this lab: 01:58 → 09:03."
    },
    {
      "term": "MTTR",
      "def": "Mean time to recover/restore — detection to full service restoration. In this lab: 09:03 → 17:20."
    }
  ];

  // IR_GOALS
  LAB.IR_GOALS = [
    {
      "icon": "TrendingDown",
      "text": "Minimize the impact of the incident"
    },
    {
      "icon": "Crosshair",
      "text": "Identify what happened and where it reached"
    },
    {
      "icon": "ShieldHalf",
      "text": "Contain it before it spreads"
    },
    {
      "icon": "SearchCode",
      "text": "Identify the root cause"
    },
    {
      "icon": "HeartPulse",
      "text": "Restore impacted systems and services"
    }
  ];

  // REAL_CASES
  LAB.REAL_CASES = [
    {
      "name": "Colonial Pipeline ransomware (2021)",
      "lesson": "The operator shut down the pipeline themselves as a containment/safety decision — a drastic, costly containment trade-off — then recovered from backups. Shows containment can be a business-continuity decision, and why restore capability is rehearsed, not assumed."
    },
    {
      "name": "NotPetya at Maersk (2017)",
      "lesson": "Massive eradication & recovery at scale: 45,000 workstations and 4,000 servers rebuilt, one domain controller in Ghana survived and saved the domain. Shows why eradication ordering, offline backups, and domain hygiene decide survival."
    },
    {
      "name": "Equifax breach (2017)",
      "lesson": "Root cause: an unpatched, known vulnerability — a contributing-factor failure, not a zero-day. The post-incident review drives patch management and detection changes; the corrective actions matter more than the apology."
    }
  ];

  // DEBRIEF
  LAB.DEBRIEF = {
    "detections": [
      {
        "source": "EDR process telemetry",
        "look": "Office apps spawning cmd/PowerShell; encoded commands; lsass memory access; vssadmin shadow deletion",
        "logic": "process where parent=\"WINWORD.EXE\" and child in (\"cmd.exe\",\"powershell.exe\")"
      },
      {
        "source": "Perimeter firewall / proxy",
        "look": "Periodic (~60s ± jitter) HTTPS beacons to first-time-seen destinations",
        "logic": "netflow dst=203.0.113.47 interval≈60s steady small byte counts"
      },
      {
        "source": "Mail gateway",
        "look": "Macro-bearing attachments from first-time-seen sender domains; sandbox verdicts",
        "logic": "attachment ext in (.docm,.xlsm) AND sender_domain_age < 30d"
      },
      {
        "source": "DC security log (Windows Event 4624)",
        "look": "Helpdesk/service accounts RDP-ing (LogonType 10) to servers off-hours",
        "logic": "event=4624 logon_type=10 account=\"m.rivera\" hour not in 07..19"
      },
      {
        "source": "File-server audit",
        "look": "Mass file rename/write bursts; ransom-note filenames",
        "logic": "count(file_rename) by host > 1000 per 5 min → page on-call"
      }
    ],
    "mitigations": [
      {
        "id": "M1054",
        "name": "Software Configuration",
        "use": "Enable attachment sandboxing; block macros in files from the internet"
      },
      {
        "id": "M1032",
        "name": "Multi-factor Authentication",
        "use": "MFA on helpdesk/admin and service accounts (T1078 mitigation)"
      },
      {
        "id": "M1018",
        "name": "User Account Management",
        "use": "No interactive/RDP logon for service accounts; least privilege; fast account disablement"
      },
      {
        "id": "M1030",
        "name": "Network Segmentation",
        "use": "Limit workstation→server SMB reach; segment server tiers"
      },
      {
        "id": "M1037",
        "name": "Filter Network Traffic",
        "use": "Block known C2 infrastructure at egress (T1071.001 mitigation)"
      },
      {
        "id": "M1049",
        "name": "Antivirus/Antimalware",
        "use": "EDR ransomware policy: auto-isolate + 24/7 escalation of HIGH alerts"
      },
      {
        "id": "M1053",
        "name": "Data Backup",
        "use": "Offline/immutable backups with tested, reconciled restores (T1486/T1490 mitigation)"
      },
      {
        "id": "M1017",
        "name": "User Training",
        "use": "Phishing recognition refreshers + simulated campaigns (T1566 mitigation)"
      },
      {
        "id": "M1047",
        "name": "Audit",
        "use": "Review auth logs for service-account anomalies; retain the logs that made this analysis possible"
      }
    ],
    "blueTakeaways": [
      "Alerts without escalation SLAs are just noise with a logo — the 03:31 HIGH alert was correct and still sat for 5.5 hours.",
      "Contain before eradicate, eradicate before restore: skipping order resurrects incidents.",
      "Capture memory BEFORE reimaging — evidence destroyed at 09:10 cannot be un-destroyed.",
      "A backup is not \"done\" until a restore has been reconciled — including the skipped-file footnote.",
      "Measure MTTD/MTTC/MTTR every incident; drill the weakest one (here: MTTD)."
    ],
    "redTakeaways": [
      "Attackers strike the quiet hours: 01:58 on a Monday night beat a SOC with no after-hours escalation.",
      "Valid credentials (T1078) outperform exploits — one phished helpdesk password did all the lateral movement.",
      "The chain assumed no attachment sandboxing and no MFA on privileged accounts; IR reveals which defender assumptions failed.",
      "Mass encryption is deliberately loud pressure — the quiet stages before it (beacon, persistence, RDP) were the real opportunities."
    ],
    "links": [
      {
        "label": "NIST SP 800-61r2 — Computer Security Incident Handling Guide",
        "url": "https://csrc.nist.gov/pubs/sp/800/61/r2/final"
      },
      {
        "label": "CompTIA CySA+ CS0-003 exam objectives",
        "url": "https://www.comptia.org/certifications/cybersecurity-analyst"
      },
      {
        "label": "MITRE ATT&CK — framework home",
        "url": "https://attack.mitre.org/"
      },
      {
        "label": "MITRE ATT&CK — T1566.001 Spearphishing Attachment",
        "url": "https://attack.mitre.org/techniques/T1566/001/"
      },
      {
        "label": "MITRE ATT&CK — T1486 Data Encrypted for Impact",
        "url": "https://attack.mitre.org/techniques/T1486/"
      },
      {
        "label": "CISA — Incident Response resources",
        "url": "https://www.cisa.gov/topics/cyber-threats-and-advisories/incident-response"
      }
    ]
  };

  // BRIEFING
  LAB.BRIEFING = {
    "org": "MERIDIAN FREIGHT SYSTEMS",
    "tagline": "Regional freight & logistics cooperative · 2,400 staff · 3 distribution hubs",
    "situation": "Monday, 09:03. You are the on-call Incident Commander. The SOC analyst just opened an EDR alert that has been sitting since 03:31: ransomware behavior on FILESRV-01. Finance staff already cannot open shared files. The night shift is gone; the trail is warm but fading.",
    "stakes": "Meridian's largest customer, Granite Retail Group, has a 72-hour incident-notification clause. Payroll runs on the Finance share Thursday. Everything you do in the next hours is watched by the CISO, the insurer — and the attacker, if you are slow.",
    "relevance": "This deck rehearses CompTIA CySA+ CS0-003 Domain 4.3 — \"apply the appropriate incident response procedure\": identification → analysis → containment → eradication → recovery → lessons learned. Every CHECK maps to an exam-relevant skill.",
    "how": [
      "Work the deck left to right: each station is one IR phase. In Medium, stations unlock in lifecycle order — you cannot eradicate before containing. In Hard, the whole deck is open from minute one.",
      "Every objective has a CHECK button. Correct checks advance the incident clock; wrong checks give teaching feedback, not punishment.",
      "The Asset Bay (right rail) shows what your decisions are doing to the estate in real time."
    ]
  };

  // OBJECTIVES_M
  LAB.OBJECTIVES_M = [
    {
      "id": "OBJ-M1",
      "phase": "identify",
      "pillar": "P1",
      "title": "Order the six IR lifecycle phases correctly in the Knowledge Core warm-up.",
      "context": "Before touching evidence, lock in the lifecycle. CompTIA expects you to know the sequence cold — it is the skeleton of every IR answer on the exam.",
      "anchor": "Scope (1)/(2): IR lifecycle & goals",
      "hints": [
        "You cannot clean out (eradicate) an attacker you have not stopped (contained).",
        "Containment follows identification & analysis; recovery and lessons learned come after.",
        "IDENTIFY → ANALYZE → CONTAIN → ERADICATE → RECOVER → LEARN."
      ]
    },
    {
      "id": "OBJ-M2",
      "phase": "identify",
      "pillar": "P2",
      "title": "Triage the alert stream: flag every event that belongs to this incident, then declare it.",
      "context": "Separate true positives from routine noise. The events you flag must tell ONE coherent story — the Meridian incident — not the whole morning's chatter.",
      "anchor": "Scope (2): detection & identification; data-source triage",
      "hints": [
        "Look for events that share the same hosts, accounts, and the external IP 203.0.113.47.",
        "WSUS failures, completed backups and self-service password resets are routine operations, not incidents.",
        "Flag E-03 through E-13 (mail gateway → EDR alert → helpdesk ticket). Leave E-14, E-15, E-16 unflagged."
      ]
    },
    {
      "id": "OBJ-M3",
      "phase": "identify",
      "pillar": "P1",
      "title": "Assign the correct severity classification using the impact criteria.",
      "context": "Severity drives resourcing and escalation. Use the written criteria, not adrenaline: confirmed compromise, active threat, but business impact still scoped to one department.",
      "anchor": "Scope (2): incident classification",
      "hints": [
        "SEV-1 is reserved for organization-wide disruption or safety/regulatory-critical outage.",
        "One department's shares are encrypted and two+ hosts are compromised — that is \"major\", not \"critical\".",
        "SEV-2: confirmed multi-asset compromise with active threat, department-level impact."
      ]
    },
    {
      "id": "OBJ-M4",
      "phase": "analyze",
      "pillar": "P2",
      "title": "Reconstruct the attack chain: place the eight stages in the correct order.",
      "context": "The chain is the narrative you will defend in the report — and the map that tells containment what to cut. Drag the stages into attacker order.",
      "anchor": "Scope (3)/(11): attack-chain analysis; MITRE mapping",
      "hints": [
        "It starts with delivery/execution (phishing → macro) and ends with impact (encryption, recovery-inhibition).",
        "Persistence comes right after the loader lands; lateral movement with stolen credentials comes after C2.",
        "CH1 macro → CH2 PowerShell → CH3 C2 → CH4 Run key → CH5 RDP lateral → CH6 LSASS → CH7 encryption → CH8 shadows."
      ]
    },
    {
      "id": "OBJ-M11",
      "phase": "analyze",
      "pillar": "P3",
      "title": "Determine the earliest point the attack was detectable, and with which data source.",
      "context": "This is the detection-engineering heart of the review: with telemetry the org already owned, properly configured, when could this have died at step one?",
      "anchor": "Scope (3)/(10): earliest-detection reasoning & data sources",
      "hints": [
        "The mail gateway HAD the message at 01:57 — read E-03 again and check what was disabled.",
        "\"Earliest possible\" assumes controls are configured correctly, not merely earliest with today's (broken) config.",
        "01:57 at the mail gateway — attachment detonation sandboxing is the source."
      ]
    },
    {
      "id": "OBJ-M5",
      "phase": "contain",
      "pillar": "P4",
      "title": "Choose the FIRST containment action for the active compromise.",
      "context": "First actions set the tone of the whole response: stop active attacker access, do not destroy evidence, do not punish the whole company.",
      "anchor": "Scope (4): containment selection & trade-offs",
      "hints": [
        "The attacker is actively beaconing FROM FIN-WS-04. What single reversible action cuts that in seconds?",
        "Wiping destroys evidence; VPN shutdown punishes 300 uninvolved staff.",
        "Network-isolate FIN-WS-04, keeping the EDR management channel alive."
      ]
    },
    {
      "id": "OBJ-M6",
      "phase": "contain",
      "pillar": "P4",
      "title": "Enable the containment control set — nothing more, nothing less.",
      "context": "Containment is a trade-off: every control costs the business something. Enable what stops THIS attacker; refuse what takes down the organization.",
      "anchor": "Scope (4): containment set vs over-containment",
      "hints": [
        "Isolate both compromised/staging assets, block the C2 IP, kill the abused accounts, remove the email vector.",
        "DC-01 shows NO confirmed compromise — full isolation there fails 2,400 people. VPN was never used by the attacker.",
        "ON: C-ISO-FIN, C-ISO-FS, C-BLK-C2, C-DIS-ACC, C-MAIL. OFF: C-ISO-DC, C-VPN, C-WIPE."
      ]
    },
    {
      "id": "OBJ-M7",
      "phase": "eradicate",
      "pillar": "P4",
      "title": "Select the correct eradication actions for this incident.",
      "context": "Eradication removes every foothold: artifacts, persistence, stolen credentials, the abused vulnerability — then proves nothing else is infected.",
      "anchor": "Scope (5)/(7): eradication actions incl. credential resets, patching, sweep",
      "hints": [
        "Blanket-resetting all 2,400 accounts is disruption without evidence; restoring the share belongs to RECOVERY.",
        "Persistence, scans, the three touched accounts, the reimage, the patch, the signatures, the sweep.",
        "Select EA-REMOVE, EA-SCAN, EA-RESET, EA-WIPE, EA-PATCH, EA-SIG, EA-SWEEP."
      ]
    },
    {
      "id": "OBJ-M8",
      "phase": "recover",
      "pillar": "P4",
      "title": "Run the recovery bench: choose the restore strategy, the validation tests, and the watch posture.",
      "context": "Recovery is \"restore, verify, watch\". A restored system is not recovered until you have proven it clean and kept an eye on it.",
      "anchor": "Scope (6)/(7): recovery, validation, enhanced monitoring",
      "hints": [
        "The 02:00 backup verified clean at 03:00 — that is your known-good state.",
        "\"Disable EDR notifications to reduce noise\" is how round two stays invisible.",
        "Restore from backup; run all four validation tests; switch enhanced monitoring ON."
      ]
    },
    {
      "id": "OBJ-M9",
      "phase": "learn",
      "pillar": "P2",
      "title": "Identify the ROOT CAUSE of the incident (not the symptom, not the click).",
      "context": "Root cause is the systemic condition that, fixed, prevents recurrence. Everything shallower produces blame and repeat incidents.",
      "anchor": "Scope (8): root cause vs symptom",
      "hints": [
        "Ask: what let a weaponized attachment reach a user's inbox unchallenged?",
        "The user click, the encryption and the stolen account are events, not causes.",
        "Attachment sandboxing disabled on the mail gateway (+ no training backstop) — option RCA-SAND."
      ]
    },
    {
      "id": "OBJ-M10",
      "phase": "learn",
      "pillar": "P4",
      "title": "Select the corrective actions that actually address the root cause and its enablers.",
      "context": "A corrective action is a concrete, owned, verifiable change. Memos, hardware shopping and punishment are theater.",
      "anchor": "Scope (8): corrective action planning",
      "hints": [
        "Two technical controls (gateway + identity), one human control, two tooling/policy controls.",
        "More firewalls do not filter email; insurance transfers risk but fixes nothing.",
        "CA-SAND, CA-MFA, CA-TRAIN, CA-EDR, CA-SVC."
      ]
    },
    {
      "id": "OBJ-M12",
      "phase": "learn",
      "pillar": "P3",
      "title": "Compute MTTD and MTTR from the timeline, then choose the exercise type that closes the gap.",
      "context": "Metrics make response improvement measurable; exercises keep the plan alive. LESSON_DETAIL is explicit: IR \"must be regularly tested and practiced\".",
      "anchor": "Scope (10): metrics + exercise types",
      "hints": [
        "MTTD = first malicious event (01:58) → analyst detection (09:03). MTTR = detection → service restored (17:20).",
        "The failure was hands-on: an untriaged alert and an untested restore. Discussions do not fix that.",
        "MTTD 7h05m, MTTR 8h17m; choose the Simulation / functional exercise."
      ]
    }
  ];

  // OBJECTIVES_H
  LAB.OBJECTIVES_H = [
    {
      "id": "OBJ-H1",
      "phase": "identify",
      "pillar": "P2",
      "title": "Full triage under noise: classify every stream event as INCIDENT or NOT — including the red herrings.",
      "context": "Seventeen events, two red herrings, one Sunday wave nobody correlated. Your triage defines the incident record — miscalled items corrupt everything downstream.",
      "anchor": "Scope (2): true/false-positive triage incl. herrings",
      "hints": [
        "Herrings look scary but correlate with nothing: check host, IP, and time overlap with the incident chain.",
        "The Sunday HR-WS-11 beacons DO belong: same C2 IP, same delivery wave.",
        "INCIDENT: E-02, E-03…E-13. NOT: E-01 and E-17 (herrings), plus the routine noise E-14…E-16."
      ]
    },
    {
      "id": "OBJ-H2",
      "phase": "analyze",
      "pillar": "P2",
      "title": "Reconstruct the complete attack chain — exact order, no phantom steps.",
      "context": "Ten cards, two of which are speculation, not evidence. The report you are building will be read by legal and the insurer: every step must trace to an exhibit.",
      "anchor": "Scope (3)/(11): chain reconstruction + evidence discipline",
      "hints": [
        "If a card has no supporting exhibit, it does not enter the chain — however plausible it seems.",
        "No VPN attack and no exfiltration appears in any log.",
        "Use CH1→CH8 in numeric order; leave CHX1 and CHX2 out."
      ]
    },
    {
      "id": "OBJ-H3",
      "phase": "contain",
      "pillar": "P4",
      "title": "Execute the containment plan: full control set, evidence preservation, and the DC-01 call.",
      "context": "Multi-asset containment with judgment: stop the spread, preserve volatile evidence, protect the crown jewel — without staging a self-inflicted outage.",
      "anchor": "Scope (4): containment set, trade-offs, evidence preservation",
      "hints": [
        "Destructive actions (wipe) have no place in containment; volatile evidence dies first.",
        "DC-01: monitor, don't isolate. FIN-WS-04: memory capture goes ON.",
        "ON: all five Medium controls + C-MEM-FIN. OFF: C-ISO-DC, C-VPN, C-WIPE. DC decision: monitor."
      ]
    },
    {
      "id": "OBJ-H4",
      "phase": "eradicate",
      "pillar": "P4",
      "title": "Sequence the eradication in the exact runbook order — and justify why the naive order fails.",
      "context": "Order is doctrine: evidence before destruction, credentials after malware removal, sweep last as the proof of cleanliness.",
      "anchor": "Scope (5)/(7): eradication sequencing",
      "hints": [
        "Reimaging before removing persistence just reinstalls it from... wait, reimage replaces everything — but persistence evidence dies unread. Evidence first.",
        "The org-wide sweep is your verification step — it cannot precede the signature push it depends on.",
        "REMOVE → SCAN → RESET → WIPE → PATCH → SIG → SWEEP. Also: if you reimage FIN-WS-04 without the memory capture from containment, evidence is gone."
      ]
    },
    {
      "id": "OBJ-H5",
      "phase": "recover",
      "pillar": "P4",
      "title": "Recovery under ambiguity: the backup has a footnote. Choose strategy, reconciliation, and validation.",
      "context": "The 02:00 backup completed — but the job log skipped 2 locked files. Real recovery decisions live in footnotes.",
      "anchor": "Scope (6)/(7): recovery decision under ambiguity + validation",
      "hints": [
        "An old complete backup vs a fresh backup with a known 2-file delta — which loses more data?",
        "The audit log tells you exactly which files were touched after 02:00.",
        "R-BKP + BR-DIFF + all four validation checks + monitoring ON."
      ]
    },
    {
      "id": "OBJ-H6",
      "phase": "learn",
      "pillar": "P3",
      "title": "Reporting & notification: map all six stakeholders to their correct notification window.",
      "context": "Granite Retail's contract clock started when the incident was CONFIRMED. Notify too broadly and you create risk; too late and you breach.",
      "anchor": "Scope (9): stakeholder notification & escalation windows",
      "hints": [
        "Two stakeholders at declaration are about ownership and privilege; one has a contractual clock.",
        "Company-wide memos mid-incident breed rumors — and tip off a mail-monitoring attacker.",
        "CISO+Legal+Insurer: declaration. Customer: 72h window. Staff: closure. Media: not required."
      ]
    },
    {
      "id": "OBJ-H7",
      "phase": "learn",
      "pillar": "P2",
      "title": "Classify all six post-incident findings: root cause, contributing factor, symptom, or unrelated.",
      "context": "The after-action report lives or dies on this taxonomy. Misclassify and the corrective actions land on symptoms.",
      "anchor": "Scope (8): root cause vs contributing factor vs symptom vs noise",
      "hints": [
        "Root cause = the systemic gap; contributing = enabled/amplified; symptom = observable impact.",
        "The user's click is NOT the root cause — the system that delivered it is.",
        "FD1 root · FD2 contributing · FD3 contributing · FD4 symptom · FD5 contributing · FD6 unrelated."
      ]
    },
    {
      "id": "OBJ-H8",
      "phase": "learn",
      "pillar": "P3",
      "title": "Compute MTTD, MTTC and MTTR exactly; name the metric that exposes the maturity gap.",
      "context": "Precision matters: these numbers go to the CISO and drive next quarter's budget. Use the lab definitions shown on the timeline.",
      "anchor": "Scope (10): response metrics + maturity reasoning",
      "hints": [
        "MTTD: 01:58 → 09:03 · MTTC: 09:41 → 11:52 · MTTR: 09:03 → 17:20.",
        "The alert pipeline WORKED at 03:31 — humans saw it at 09:03. Which metric measures exactly that failure?",
        "MTTD 7h05m · MTTC 2h11m · MTTR 8h17m · the gap is MTTD."
      ]
    },
    {
      "id": "OBJ-H9",
      "phase": "learn",
      "pillar": "P1",
      "title": "Close the loop: choose the exercise type that would have caught this failure, and the plan sections to update.",
      "context": "LESSON_DETAIL: IR \"must be regularly tested and practiced\". Pick the exercise that stresses the actual failure mode — then update the actual artifacts.",
      "anchor": "Scope (10): IR plan testing + plan maintenance",
      "hints": [
        "Discussion formats rehearse talking; the failures here were tooling and runbook execution.",
        "Update the playbooks the incident actually stressed: containment trigger, recovery reconciliation, comms clock.",
        "Simulation/functional exercise; PU-CONT, PU-RECOV, PU-COMMS."
      ]
    }
  ];

  // QUIZ_M
  LAB.QUIZ_M = [
    {
      "id": "QM1",
      "scenario": "Why does containment always precede eradication in the IR lifecycle?",
      "options": [
        {
          "text": "Because regulations require a documented containment log before any system may be cleaned",
          "why": "No regulation sets the ordering — the operational logic does: cleanup on a live system gets undone.",
          "correct": false
        },
        {
          "text": "Because change control requires a containment sign-off window before eradication may start",
          "why": "Change control is real, but it is scheduling overhead, not the reason for the ordering.",
          "correct": false
        },
        {
          "text": "Because cleanup only sticks once attacker access is cut; live systems get re-infected",
          "why": "Correct. Containment freezes attacker access; eradication only holds on a frozen battlefield — clean a live system and it gets re-infected.",
          "correct": true
        },
        {
          "text": "Because containment is always cheaper and faster than running full eradication across the estate",
          "why": "Cost is not the ordering principle — a cheap-but-live system re-compromises in minutes.",
          "correct": false
        }
      ]
    },
    {
      "id": "QM2",
      "scenario": "A system was restored from backup, sample files open fine, and scans are clean. Which phase are you in, and what is still required?",
      "options": [
        {
          "text": "Recovery — re-arm defenses and confirm backups resumed before the incident may close",
          "why": "Correct. Recovery = restore + validate + watch; closing without re-arming defenses invites round two.",
          "correct": true
        },
        {
          "text": "Eradication — one more deep persistence scan is required before anything else may proceed",
          "why": "Scanning here is validation work inside recovery; eradication ended before the restore began.",
          "correct": false
        },
        {
          "text": "Identification — the ticket should be re-opened so the detection can be re-verified from scratch",
          "why": "No new incident exists; re-opening would corrupt the record of a continuing recovery.",
          "correct": false
        },
        {
          "text": "Containment — the restored host must be isolated again until a second opinion confirms it clean",
          "why": "Over-containment of a validated-clean system wastes the recovery window you just bought.",
          "correct": false
        }
      ]
    },
    {
      "id": "QM3",
      "scenario": "What does VALIDATION mean in an IR procedure?",
      "options": [
        {
          "text": "Confirming the incident genuinely happened by correlating the alerts that started the response",
          "why": "That is confirmation during identification — validation proves the FIX, not the event.",
          "correct": false
        },
        {
          "text": "Collecting management sign-off on the final incident report before the review meeting formally closes",
          "why": "Sign-off is governance; validation is the technical proof that remediation worked.",
          "correct": false
        },
        {
          "text": "Testing that the nightly backup jobs completed on schedule throughout the whole response window",
          "why": "Backup jobs are one input; validation spans scans, data checks and defense health.",
          "correct": false
        },
        {
          "text": "Proving that eradication and recovery actually worked — systems clean, data intact, defenses healthy",
          "why": "Correct. Validation converts \"we think it is fixed\" into \"we verified it is fixed\".",
          "correct": true
        }
      ]
    },
    {
      "id": "QM4",
      "scenario": "Your MTTD is 7 hours while industry peers sit near 30 minutes. What does this most directly indicate?",
      "options": [
        {
          "text": "A staffing-quality gap — the analysts on rotation lack the certifications their industry peers hold",
          "why": "Skill was not the gap: nobody LOOKED at a correct alert. Process was the failure.",
          "correct": false
        },
        {
          "text": "A backup-capacity gap — the storage schedule cannot keep pace with the organization data growth rate",
          "why": "Backups affect recovery time (MTTR), not the time it takes to detect an incident.",
          "correct": false
        },
        {
          "text": "A detection-to-response gap — alerts fire but are not escalated, triaged or watched after hours",
          "why": "Correct. MTTD measures time-to-detection; a working detector with no escalation SLA shows up exactly here.",
          "correct": true
        },
        {
          "text": "A tuning gap — the EDR fires too many false positives, burying the real alerts in noise",
          "why": "False-positive rate is a separate tuning metric — and this alert was true and simply untriaged.",
          "correct": false
        }
      ]
    },
    {
      "id": "QM5",
      "scenario": "In the after-action review, a teammate proposes: \"Root cause: the user clicked the bad attachment.\" Why is this a weak root-cause statement?",
      "options": [
        {
          "text": "It is incomplete, because a proper root cause must also name the malware family and the C2 channel",
          "why": "More artifacts do not make it deeper — attribution detail is analysis, not root cause.",
          "correct": false
        },
        {
          "text": "It blames an individual, and individual blame always creates legal exposure for the response team",
          "why": "The legal risk is real but secondary; the objection here is analytical, not legal.",
          "correct": false
        },
        {
          "text": "It is unfalsifiable, because you can never prove which specific user touched a malicious file",
          "why": "Endpoint and gateway logs routinely prove user execution — the problem is depth, not proof.",
          "correct": false
        },
        {
          "text": "It names a proximate human event, not the systemic condition that made the click consequential",
          "why": "Correct. Root cause = the condition that, fixed, prevents recurrence — gateway sandboxing + training, not the click.",
          "correct": true
        }
      ]
    },
    {
      "id": "QM6",
      "scenario": "Per the lesson: why must incident response be \"regularly tested and practiced\"?",
      "options": [
        {
          "text": "Because attackers change techniques daily, and a plan written last quarter is always obsolete now",
          "why": "Plans decay mostly through disuse, not attacker novelty — rehearsal is the lesson point.",
          "correct": false
        },
        {
          "text": "Because unexercised plans and untested runbooks fail under pressure — practice exposes gaps while cheap",
          "why": "Correct. Meridian untriaged a HIGH alert for 5.5 hours — exactly the failure a simulation rehearses.",
          "correct": true
        },
        {
          "text": "Because auditors require exercise paperwork, and missing documentation fails the annual certification review",
          "why": "Auditors may ask, but the operational reason — muscle memory and tooling checks — is the point.",
          "correct": false
        },
        {
          "text": "Because exercising the plan justifies the IR team budget when leadership reviews headcount each year",
          "why": "Budget theater is not the rationale; the lesson says testing keeps the plan real.",
          "correct": false
        }
      ]
    }
  ];

  // QUIZ_H
  LAB.QUIZ_H = [
    {
      "id": "QH1",
      "scenario": "09:03. EDR shows a loader quarantined on FIN-WS-04 and the ticket says \"files won't open\". The analyst wants to close it as \"malware removed, no impact\". What is wrong?",
      "options": [
        {
          "text": "He should email all users first, because early symptom surveys establish scope faster than log correlation",
          "why": "Mass queries waste the golden hour; correlated logs scope the incident in minutes.",
          "correct": false
        },
        {
          "text": "He should restore the share immediately, because recovering business data takes priority over investigating",
          "why": "Restoring before scoping can destroy the evidence of the intrusion path you still need.",
          "correct": false
        },
        {
          "text": "Complaints plus mass-modification patterns reveal a multi-asset incident — declare and investigate",
          "why": "Correct. Correlating signals into one declared incident IS the identification phase.",
          "correct": true
        },
        {
          "text": "Nothing is wrong — quarantine equals resolution, and the complaints are a routine permissions matter",
          "why": "Quarantine contains one process on one host; mass file-access failures say otherwise.",
          "correct": false
        }
      ]
    },
    {
      "id": "QH2",
      "scenario": "During containment, DC-01 security logs show the m.rivera account RDP-ing from FIN-WS-04 to FILESRV-01. No compromise of DC-01 itself is confirmed. What is the correct containment posture for DC-01?",
      "options": [
        {
          "text": "Enhanced monitoring — block C2 at egress, reset the abused accounts, and watch DC-01 authentication logs",
          "why": "Correct. Contain the accounts and path, watch the crown jewel — proportionate containment.",
          "correct": true
        },
        {
          "text": "Full isolation — an unconfirmed compromise still justifies taking the domain controller offline until cleared",
          "why": "Self-inflicted outage: authentication, DNS and DFS die for 2,400 staff over an unconfirmed compromise.",
          "correct": false
        },
        {
          "text": "No action — the malware is contained on FIN-WS-04, and DC-01 shows no indicator of compromise itself",
          "why": "The identity plane is already being abused — waiting for malware on a DC is negligence.",
          "correct": false
        },
        {
          "text": "Demotion — remove DC-01 from the domain so a stolen account cannot authenticate against it again",
          "why": "Destructive and unnecessary; it does not remove the stolen-credential risk at all.",
          "correct": false
        }
      ]
    },
    {
      "id": "QH3",
      "scenario": "Why must the memory image of FIN-WS-04 be captured BEFORE the reimage, even though the host will be rebuilt anyway?",
      "options": [
        {
          "text": "The insurer policy requires a memory image of every endpoint before any destructive action is authorized",
          "why": "Policies may ask for evidence, but the operational reason stands on its own.",
          "correct": false
        },
        {
          "text": "The EDR scan engine cannot finish its sweep while the loader holds memory, so the dump clears it first",
          "why": "Not how EDR scanning works — the reason is evidentiary, not mechanical.",
          "correct": false
        },
        {
          "text": "Volatile evidence exists only in memory — injected code, keys and live connections die at reboot or wipe",
          "why": "Correct. Order of volatility: capture before you destroy, even when the host fate is decided.",
          "correct": true
        },
        {
          "text": "The reimage vendor checklist requires a memory dump step, so capturing satisfies the change-control ticket",
          "why": "Checklist compliance is not the reason; volatile evidence is destroyed by the rebuild itself.",
          "correct": false
        }
      ]
    },
    {
      "id": "QH4",
      "scenario": "The 02:00 backup restored cleanly, but two Finance files created Monday at 08:55 are missing. Users are unhappy. What is the correct interpretation and action?",
      "options": [
        {
          "text": "Restore failure — rerun the full restore from the same backup until the two missing files reappear",
          "why": "The backup did its job for its point-in-time; rerunning cannot recover later writes.",
          "correct": false
        },
        {
          "text": "Expected behavior — point-in-time restores skip later writes; reconcile the delta via the audit log",
          "why": "Correct. Reconciliation is part of validation; \"missing data\" after restore is a scoping question, not a restore failure.",
          "correct": true
        },
        {
          "text": "Vendor defect — escalate to the backup vendor, because a complete backup must hold every current file",
          "why": "Not a vendor defect: point-in-time restores exclude later writes by design.",
          "correct": false
        },
        {
          "text": "Attacker theft — treat the two missing files as exfiltrated and open a separate data-theft incident",
          "why": "No exfil indicator exists; the files postdate the backup and are recoverable from Friday.",
          "correct": false
        }
      ]
    },
    {
      "id": "QH5",
      "scenario": "Hour 40 of the 72-hour customer-notice window. Legal says attribution is still ambiguous. What do you advise?",
      "options": [
        {
          "text": "Notify inside the window with confirmed facts — scope, containment, impact — and commit to updates",
          "why": "Correct. Regulators and contracts expect facts-as-known and updates, not a finished novel.",
          "correct": true
        },
        {
          "text": "Wait for complete attribution, because the contract only permits notice once the actor is named",
          "why": "Waiting past the clock is the breach. Notice needs facts, not attribution.",
          "correct": false
        },
        {
          "text": "Skip the notice — attribution uncertainty suspends the clock until the threat actor is named",
          "why": "Confirmation of the INCIDENT triggered the clock, not attribution of the actor.",
          "correct": false
        },
        {
          "text": "Say nothing, because the customer will learn more from press coverage than a partial internal memo",
          "why": "Silence converts a contractual duty into a reputational crisis you do not control.",
          "correct": false
        }
      ]
    },
    {
      "id": "QH6",
      "scenario": "\"We scanned, the malware is gone, users are working — can we close?\" What is still missing before closure?",
      "options": [
        {
          "text": "A longer observation window, because thirty clean days must pass before any ransomware incident closes",
          "why": "Watch windows matter, but closure is blocked by missing validation evidence AND the learning loop.",
          "correct": false
        },
        {
          "text": "A signed attestation from every affected user confirming their files open correctly on the restored share",
          "why": "User confirmations support validation but do not replace it — and nothing here covers lessons learned.",
          "correct": false
        },
        {
          "text": "Validation evidence — clean scans, reconciled data, re-armed defenses — plus the lessons-learned review",
          "why": "Correct. Closure without the learning loop guarantees a repeat performance.",
          "correct": true
        },
        {
          "text": "A press statement, because public closure of a ransomware incident is part of the IR team official duties",
          "why": "Media contact is never an IR-team closure step — it is a legal/PR decision.",
          "correct": false
        }
      ]
    },
    {
      "id": "QH7",
      "scenario": "Next quarter's exercise budget fits ONE format. The gaps: HIGH EDR alerts sat 5.5h untriaged overnight; the restore runbook was executed by one admin for the first time. Which format do you buy, and why?",
      "options": [
        {
          "text": "Checklist review — cheapest format, and it covers both gaps by confirming the runbook is current",
          "why": "Paperwork audits validate existence, not execution — neither gap would have surfaced.",
          "correct": false
        },
        {
          "text": "Tabletop — executives discuss escalation and restore decisions around a table, facilitator taking notes",
          "why": "Good for decision logic, but nobody touches the console or the runbook under pressure.",
          "correct": false
        },
        {
          "text": "Walkthrough — the team reads the runbook aloud page by page and annotates gaps for a later revision",
          "why": "Rehearses reading, not responding — the 03:00 triage muscle stays untrained.",
          "correct": false
        },
        {
          "text": "Simulation / functional — the team executes a realistic alert-triage and restore drill under pressure",
          "why": "Correct. Test the muscle that failed, under realistic conditions — both gaps are execution failures.",
          "correct": true
        }
      ]
    }
  ];
})(window.LAB);
