/* ── Lab content (objectives meta, drill banks, quizzes, telemetry, yard, debrief) ──────────────────────────────────────────────────────────────
 * The Tripwire Room — Deception Technologies Lab (static edition)
 * Data only — zero logic. The same constants drive both lab modes.
 * All data is SYNTHETIC training content for CompTIA Network+ N10-009 4.1.
 * Ported 1:1 from the original framework lab (src/lib/lab/*). Do not edit
 * casually: objective validators in js/objectives.js key off these ids.
 */
window.LAB = {
  "allOffTraps": {
    "honeypot": {
      "deployed": false,
      "segment": "prod-core",
      "services": {
        "ssh": false,
        "http": false,
        "rdp": false
      },
      "monitoring": false
    },
    "honeyfile": {
      "host": "none",
      "file": "none",
      "canary": false
    },
    "honeytoken": {
      "enabled": false,
      "kind": "svc-acct"
    },
    "sinkhole": {
      "enabled": false,
      "logQueries": false,
      "domain": "cdn-metrics-sync.com"
    },
    "tarpit": {
      "enabled": false,
      "port": "22",
      "profile": "mild"
    },
    "fence": {
      "closed": false
    }
  },
  "attackBehaviors": [
    {
      "id": "b1",
      "label": "Password guessing against SSH and VPN until something stuck",
      "hint": "e.g. T1110"
    },
    {
      "id": "b2",
      "label": "Logging in with the harvested “svc_backup” account from an external host",
      "hint": "e.g. T1078"
    },
    {
      "id": "b3",
      "label": "Interactive SSH sessions hopping from the foothold toward DB-01",
      "hint": "e.g. T1021"
    }
  ],
  "attackCorrect": {
    "b1": "T1110",
    "b2": "T1078",
    "b3": "T1021"
  },
  "attackOptions": [
    {
      "id": "T1566",
      "label": "T1566 — Phishing"
    },
    {
      "id": "T1078",
      "label": "T1078 — Valid Accounts"
    },
    {
      "id": "T1497",
      "label": "T1497 — Virtualization/Sandbox Evasion"
    },
    {
      "id": "T1110",
      "label": "T1110 — Brute Force"
    },
    {
      "id": "T1486",
      "label": "T1486 — Data Encrypted for Impact"
    },
    {
      "id": "T1021",
      "label": "T1021 — Remote Services"
    }
  ],
  "bays": [
    {
      "id": "manual",
      "num": "01",
      "label": "FIELD MANUAL"
    },
    {
      "id": "rack",
      "num": "02",
      "label": "TRAP RACK"
    },
    {
      "id": "yard",
      "num": "03",
      "label": "THE YARD"
    },
    {
      "id": "wall",
      "num": "04",
      "label": "SENSOR WALL"
    },
    {
      "id": "deck",
      "num": "05",
      "label": "DRILL DECK"
    },
    {
      "id": "debrief",
      "num": "06",
      "label": "DEBRIEF BOARD"
    }
  ],
  "blueTakeaways": [
    "Deception alerts are the closest thing to free truth in a SOC: no baseline tuning, near-zero false positives.",
    "Every tripwire event answers two questions at once: “there IS an intruder” and “here is how they work”.",
    "Hunt backwards from a trip: a canary credential opened at 02:17 and used at 02:41 turns two alerts into one attack story.",
    "Blind spots are diagnostic: overnight activity nobody saw marks exactly where your sensor coverage has holes."
  ],
  "chainCorrect": [
    "c1",
    "c2",
    "c3",
    "c4",
    "c5",
    "c6"
  ],
  "chainDisplayOrder": [
    "c3",
    "c1",
    "c5",
    "c2",
    "c6",
    "c4"
  ],
  "chainItems": [
    {
      "id": "c1",
      "label": "Recon & entry from outside — VPN failures, then SSH on the decoy"
    },
    {
      "id": "c2",
      "label": "Enumeration of the “LAN” from the foothold (all decoys)"
    },
    {
      "id": "c3",
      "label": "Credential access — bait file opened on a production file server"
    },
    {
      "id": "c4",
      "label": "Lateral movement — canary account replayed on the VPN"
    },
    {
      "id": "c5",
      "label": "Internal reach-out — decoy VLAN touches the production database"
    },
    {
      "id": "c6",
      "label": "C2 attempt — beacon domain resolves through the sinkhole"
    }
  ],
  "ciaCorrect": "no-real-data",
  "ciaOptions": [
    {
      "id": "no-real-data",
      "label": "Decoys hold no real business data, so their compromise exposes nothing of value"
    },
    {
      "id": "encrypted",
      "label": "Because everything on a decoy is encrypted"
    },
    {
      "id": "airgap",
      "label": "Because decoys are always physically air-gapped from the internet"
    },
    {
      "id": "backup",
      "label": "Because decoy data is backed up every hour"
    }
  ],
  "detectionTable": [
    {
      "source": "File audit logs (EID 4663-style) + canary webhook",
      "logic": "Alert on ANY open of a honeyfile path — threshold 1, no baseline needed"
    },
    {
      "source": "Auth / VPN logs",
      "logic": "Alert on ANY authentication with a canary account, anywhere, always"
    },
    {
      "source": "DNS query logs",
      "logic": "Alert on any query resolved by the sinkhole — the asking host is beaconing"
    },
    {
      "source": "Firewall / fence logs",
      "logic": "Alert on ANY allow, and even on denies, crossing decoy-VLAN boundaries"
    },
    {
      "source": "Decoy telemetry (honeypot/honeynet)",
      "logic": "Everything is an alert: sessions, commands, scans — there is no benign traffic"
    }
  ],
  "fenceJustifyCorrect": "pivot",
  "fenceJustifyOptions": [
    {
      "id": "pivot",
      "label": "A decoy under attacker control must never reach production — it would become a pivot point, and event 03:26 proves the path is live"
    },
    {
      "id": "noise",
      "label": "Isolating decoys keeps the alert feed quiet and tidy"
    },
    {
      "id": "legal",
      "label": "The fence exists mainly so attackers cannot sue us"
    },
    {
      "id": "perf",
      "label": "Isolation improves decoy CPU performance"
    }
  ],
  "fieldProof": [
    {
      "name": "Thinkst Canary / Canarytokens.org",
      "text": "Widely deployed commercial honeypots and a free canary-token service — honeyfiles, decoy services and tokens that web-hook your team when touched."
    },
    {
      "name": "The Honeynet Project",
      "text": "Nonprofit (since 1999) publishing honeynet research, tools and attacker-behavior data — the academic home of this field."
    },
    {
      "name": "DNS sinkholing at scale",
      "text": "Takedown teams (e.g., Microsoft’s Digital Crimes Unit) redirect botnet C2 domains to controlled IPs — blunting infections while measuring how many hosts still beacon."
    },
    {
      "name": "endlessh",
      "text": "Popular open-source SSH tarpit: binds port 22 and keeps scanners stuck in a slow, endless banner exchange."
    }
  ],
  "funcCorrect": "detective",
  "funcOptions": [
    {
      "id": "preventive",
      "label": "Preventive — it stops the attack before it starts"
    },
    {
      "id": "detective",
      "label": "Detective — it notices and betrays the attack as it happens"
    },
    {
      "id": "corrective",
      "label": "Corrective — it restores systems after an attack"
    },
    {
      "id": "physical",
      "label": "Physical — it guards doors and cables"
    }
  ],
  "glossary": [
    {
      "term": "Honeypot",
      "def": "A single decoy system, made to look attractive, that betrays anyone who touches it."
    },
    {
      "term": "Honeynet",
      "def": "A whole decoy network segment (multiple fake hosts) that mirrors a real LAN, normally isolated."
    },
    {
      "term": "Honeyfile",
      "def": "A tempting file planted among real files that raises an alert the moment it is opened."
    },
    {
      "term": "Honeytoken",
      "def": "A fake credential, key or marker with no business purpose — any use of it is an incident."
    },
    {
      "term": "Canary token",
      "def": "A hidden tripwire (in a file, URL, or account) that silently notifies defenders when triggered."
    },
    {
      "term": "DNS sinkhole",
      "def": "A DNS service that answers malicious-domain lookups with a controlled IP and logs who asked."
    },
    {
      "term": "Tarpit",
      "def": "A service that accepts connections but deliberately slows them to a crawl, wasting attacker time."
    },
    {
      "term": "Interaction level",
      "def": "Low-interaction decoys emulate services cheaply; high-interaction decoys run real systems for deeper intel."
    },
    {
      "term": "Segmentation",
      "def": "Splitting a network into isolated zones (e.g., VLANs) so a compromise in one cannot freely reach another."
    },
    {
      "term": "Lateral movement",
      "def": "An attacker’s progression from a first foothold to other systems, often with reused credentials."
    },
    {
      "term": "IOC",
      "def": "Indicator of compromise — an observable artifact (IP, hash, domain, account) that evidences malicious activity."
    },
    {
      "term": "False positive",
      "def": "An alert raised on benign activity; deception alerts are prized precisely because they are rare."
    },
    {
      "term": "Dwell time",
      "def": "How long an attacker sits undetected in an environment — the number deception works to shrink."
    },
    {
      "term": "Risk",
      "def": "The likelihood × impact of a threat exploiting a vulnerability and harming an asset."
    },
    {
      "term": "CIA triad",
      "def": "Confidentiality, Integrity, Availability — the three properties security protects on every asset."
    }
  ],
  "hardFeed": [
    {
      "id": "E-0014",
      "time": "00:14",
      "sensor": "VPN-GW · auth",
      "severity": "warn",
      "title": "Credential-guessing burst: 38 failed logins across 6 accounts from one external IP",
      "source": "203.0.113.55",
      "dest": "VPN-GW :443",
      "category": "prod",
      "deception": false,
      "raw": "auth: 38 FAILURES user in {m.chen, r.okafor, svc_backup, j.moreau, admin, helpdesk} src=203.0.113.55\nnote: production gateway — real pressure on real accounts, not deception evidence"
    },
    {
      "id": "E-0052",
      "time": "00:52",
      "sensor": "HP-01 · honeypot",
      "severity": "alert",
      "title": "SSH session opened on decoy HP-01 — intruder profiled the “server” for 11 minutes",
      "source": "198.51.100.44",
      "dest": "HP-01 :22",
      "category": "decoy",
      "deception": true,
      "raw": "sshd[2411]: Accepted password for \"admin\" from 198.51.100.44\nadmin@hp-01:~$ whoami\nadmin@hp-01:~$ uname -a\nadmin@hp-01:~$ cat /etc/passwd\nadmin@hp-01:~$ ls /var/www\nnote: full session transcript captured; attacker never suspected the decoy"
    },
    {
      "id": "E-0130",
      "time": "01:30",
      "sensor": "HP-01 · honeynet view",
      "severity": "alert",
      "title": "Attacker enumerated the decoy yard from HP-01 — found HN-WEB, HN-APP, HN-DB",
      "source": "HP-01 (10.66.0.50)",
      "dest": "10.66.0.0/24",
      "category": "decoy",
      "deception": true,
      "raw": "decoy telemetry: nmap-style sweep of vlan66 from the foothold\nfindings: 3 “servers” with open services (all decoys)\nverdict: attacker is mapping what they believe is a real LAN segment"
    },
    {
      "id": "E-0200",
      "time": "02:00",
      "sensor": "FileSrv-01 · audit",
      "severity": "warn",
      "title": "1,204 file reads by svc_backup in a 9-minute window — honeyfile NOT accessed",
      "source": "svc_backup (backup job BKP-0417)",
      "dest": "FileSrv-01 shares",
      "category": "benign",
      "deception": false,
      "raw": "audit: 1204 opens by svc_backup between 02:00-02:09\njob manifest: scheduled nightly backup BKP-0417 (every night 02:00)\nhoneyfile \\Finance\\passwords.txt: NOT among opened paths\nnote: mass file access by a backup identity is the backup, not a breach"
    },
    {
      "id": "E-0217",
      "time": "02:17",
      "sensor": "FileSrv-01 · canary",
      "severity": "alert",
      "title": "HONEYFILE TRIPPED — \\Finance\\passwords.txt opened by WS-114; beacon fired",
      "source": "WS-114 (10.20.3.114)",
      "dest": "\\\\FileSrv-01\\Finance\\passwords.txt",
      "category": "decoy",
      "deception": true,
      "raw": "audit 4663: open \\FileSrv-01\\Finance\\passwords.txt by WS-114\\j.doe\ncanary: webhook POST received 0.8s later\nfile note: contains decoy credentials incl. canary account \"svc_backup\""
    },
    {
      "id": "E-0241",
      "time": "02:41",
      "sensor": "VPN-GW · auth",
      "severity": "alert",
      "title": "Canary account \"svc_backup\" successfully logged in to the VPN from an external IP",
      "source": "198.51.100.44",
      "dest": "VPN-GW :443",
      "category": "decoy",
      "deception": true,
      "raw": "auth: SUCCESS account=svc_backup src=198.51.100.44\nnote: svc_backup is a honeytoken — it has never been issued to any human or process\nverdict: whoever opened the bait file at 02:17 is now using its contents"
    },
    {
      "id": "E-0312",
      "time": "03:12",
      "sensor": "DEV-WS-07 · workstation",
      "severity": "warn",
      "title": "Port sweep from DEV-WS-07 against the 10.44.0.0/24 dev lab subnet",
      "source": "DEV-WS-07 (10.20.4.7)",
      "dest": "10.44.0.0/24",
      "category": "benign",
      "deception": false,
      "raw": "host sensor: nmap sweep 10.44.0.0/24 by user j.moreau\nticket: authorized lab test LAB-2231 (change calendar 03:00-05:00)\nnote: scanning activity with a paper trail — alarming, but not hostile and not deception"
    },
    {
      "id": "E-0326",
      "time": "03:26",
      "sensor": "FW-EDGE · fence",
      "severity": "alert",
      "title": "Connection from decoy VLAN 66 (HP-01) to production DB-01 :1433 was ALLOWED",
      "source": "HP-01 (10.66.0.50)",
      "dest": "DB-01 :1433",
      "category": "decoy",
      "deception": true,
      "raw": "firewall: ALLOW 10.66.0.50 → 10.20.0.30 :1433 (no deny rule vlan66 → vlan10)\nverdict: the isolation fence is NOT in place — a compromised decoy can pivot"
    },
    {
      "id": "E-0402",
      "time": "04:02",
      "sensor": "DNS-01 · sinkhole",
      "severity": "alert",
      "title": "SINKHOLE HIT — WS-114 resolved cdn-metrics-sync.com to the sinkhole IP",
      "source": "WS-114 (10.20.3.114)",
      "dest": "cdn-metrics-sync.com → 10.66.0.9",
      "category": "decoy",
      "deception": true,
      "raw": "dns: A? cdn-metrics-sync.com from 10.20.3.114 → answered 10.66.0.9\nverdict: beacon attempt to a known-fake C2 domain; source process captured"
    },
    {
      "id": "E-0444",
      "time": "04:44",
      "sensor": "AppSrv-01 · IDS",
      "severity": "alert",
      "title": "RDP brute-force pattern against production AppSrv-01 :3389 from WS-114",
      "source": "WS-114 (10.20.3.114)",
      "dest": "AppSrv-01 :3389",
      "category": "prod",
      "deception": false,
      "raw": "ids: 87 failed RDP attempts in 6 min src=10.20.3.114 dst=10.20.0.22\nnote: production-side alert — hostile, but it never touched a decoy"
    },
    {
      "id": "E-0515",
      "time": "05:15",
      "sensor": "FW-EDGE · tarpit",
      "severity": "info",
      "title": "Scanner 198.51.100.7 held in tarpit on :22 for 9m41s — zero payload delivered",
      "source": "198.51.100.7",
      "dest": "FW-EDGE :22",
      "category": "decoy",
      "deception": true,
      "raw": "tarpit[aggressive]: banner stream stalled connection\nverdict: attacker time wasted; fingerprint collected"
    },
    {
      "id": "E-0538",
      "time": "05:38",
      "sensor": "HP-01 · honeypot",
      "severity": "warn",
      "title": "Fingerprinting probe on HP-01: /wp-admin + /etc/passwd fetch, then instant disconnect",
      "source": "198.51.100.44",
      "dest": "HP-01 :80",
      "category": "decoy",
      "deception": true,
      "raw": "http: GET /wp-admin GET /etc/passwd from 198.51.100.44, disconnect <1s\nverdict: attacker is testing decoy realism — the classic pre-evasion move"
    },
    {
      "id": "E-0558",
      "time": "05:58",
      "sensor": "NTP-01",
      "severity": "info",
      "title": "Routine NTP synchronization burst from workstation pool",
      "source": "WS pool",
      "dest": "NTP-01 :123",
      "category": "benign",
      "deception": false,
      "raw": "ntp: 41 sync events in scheduled 05:58 window\nnote: every-night pattern, no anomaly"
    },
    {
      "id": "E-0602",
      "time": "06:02",
      "sensor": "PRN-02",
      "severity": "info",
      "title": "Printer PRN-02 checked in with vendor firmware-update host (policy-allowed)",
      "source": "PRN-02",
      "dest": "vendor-update.example",
      "category": "benign",
      "deception": false,
      "raw": "http: GET firmware manifest, signature valid, allowlisted destination"
    }
  ],
  "hardPrearmed": {
    "honeypot": {
      "deployed": true,
      "segment": "decoy-yard",
      "services": {
        "ssh": true,
        "http": true,
        "rdp": false
      },
      "monitoring": true
    },
    "honeyfile": {
      "host": "filesrv-01",
      "file": "passwords.txt",
      "canary": true
    },
    "honeytoken": {
      "enabled": true,
      "kind": "svc-acct"
    },
    "sinkhole": {
      "enabled": true,
      "logQueries": true,
      "domain": "cdn-metrics-sync.com"
    },
    "tarpit": {
      "enabled": true,
      "port": "22",
      "profile": "aggressive"
    },
    "fence": {
      "closed": false
    }
  },
  "herringCorrect": [
    "E-0200",
    "E-0312"
  ],
  "herringEventOptions": [
    {
      "id": "E-0052",
      "label": "00:52 — SSH session on decoy HP-01"
    },
    {
      "id": "E-0200",
      "label": "02:00 — 1,204 file reads by svc_backup on FileSrv-01"
    },
    {
      "id": "E-0241",
      "label": "02:41 — canary account used on the VPN"
    },
    {
      "id": "E-0312",
      "label": "03:12 — port sweep from DEV-WS-07 against the dev lab"
    },
    {
      "id": "E-0326",
      "label": "03:26 — decoy VLAN reached DB-01"
    }
  ],
  "herringWhyCorrect": "paper-trail",
  "herringWhyOptions": [
    {
      "id": "paper-trail",
      "label": "E-0200 is the scheduled backup job (BKP-0417, nightly 02:00, honeyfile untouched) and E-0312 is an authorized lab test with ticket LAB-2231 — neither touched deception assets"
    },
    {
      "id": "speed",
      "label": "Both events happened too fast to be human attackers"
    },
    {
      "id": "internal",
      "label": "Both came from internal IPs, and internal traffic is never hostile"
    },
    {
      "id": "volume",
      "label": "1,204 reads and an nmap sweep are below our alert thresholds"
    }
  ],
  "hiCorrect": "high",
  "hiLoContextA": "You want deep insight into attacker tooling and behavior, and you accept the extra effort of running and watching a real (isolated) fake server.",
  "hiLoContextB": "You want cheap, wide coverage across many services and hosts, and you accept shallower intel from emulated services.",
  "hiOptions": [
    {
      "id": "high",
      "label": "High-interaction — a real isolated system worth watching closely"
    },
    {
      "id": "low",
      "label": "Low-interaction — cheap emulated services on one box"
    }
  ],
  "htProofCorrect": "reuse",
  "htProofOptions": [
    {
      "id": "reuse",
      "label": "The attacker harvested the canary credential from the bait file and replayed it — movement with a valid account (T1078), not a new exploit"
    },
    {
      "id": "honeypot-pwned",
      "label": "It proves the honeypot itself was compromised and used as the login"
    },
    {
      "id": "exfil",
      "label": "It proves customer data was already exfiltrated"
    },
    {
      "id": "false-positive",
      "label": "It is a false positive — backups sometimes log in to VPNs"
    }
  ],
  "irCorrect": [
    "rotate",
    "scope",
    "contain",
    "report"
  ],
  "irItems": [
    {
      "id": "rotate",
      "label": "Disable and rotate the canary account everywhere it exists"
    },
    {
      "id": "scope",
      "label": "Scope: search auth, VPN and cloud logs for every prior use of that account"
    },
    {
      "id": "contain",
      "label": "Contain: isolate WS-114 and block the source IP at the edge"
    },
    {
      "id": "report",
      "label": "Report: brief the SOC lead and record the incident timeline"
    }
  ],
  "limitationCorrect": [
    "noprevent",
    "baitless",
    "fingerprint",
    "upkeep"
  ],
  "limitationOptions": [
    {
      "id": "noprevent",
      "label": "It detects but does not prevent exploitation"
    },
    {
      "id": "replaces",
      "label": "It replaces the need for firewalls, patching and MFA"
    },
    {
      "id": "fingerprint",
      "label": "A careful attacker can fingerprint decoys and route around them"
    },
    {
      "id": "total",
      "label": "It guarantees visibility of every attacker step"
    },
    {
      "id": "baitless",
      "label": "Attackers who never touch a decoy stay invisible to it"
    },
    {
      "id": "upkeep",
      "label": "Decoys need upkeep: realistic content, isolation and monitoring — neglected decoys teach attackers"
    }
  ],
  "loCorrect": "low",
  "manualQuizNote": {
    "medium": "Guided night shift — 12 granular objectives, tiered hints, tolerant checks. Finish all objectives + the quiz for your mastery readout.",
    "hard": "Silent alarm — the previous shift armed everything (except one thing they missed). 14 overnight events, two red herrings, 10 deep challenges, one costly nudge. Strict checks: exact values only."
  },
  "manualSections": [
    {
      "id": "why",
      "title": "Why bait? The deception value proposition",
      "body": [
        "Deception technologies plant believable decoys — fake systems, fake networks, fake files, fake credentials — with one job: betray whoever touches them. Because no legitimate user, backup or scanner has any business touching a decoy, every interaction is suspicious by definition. That is why deception alerts are the highest-fidelity alerts in a SOC: almost no false positives.",
        "Three payoffs: detect (an alert no attacker can trip by accident), divert (every minute spent exploring decoys is a minute not spent on production), and study (the decoy captures attacker commands, tooling and targets — free IOC/TTP intel).",
        "On the risk chain from your lesson: deception does not remove the vulnerability, and the threat remains real — it shrinks RISK by cutting dwell time, which cuts impact. Detect early, hurt less."
      ]
    },
    {
      "id": "family",
      "title": "The family, from honeypot to tarpit",
      "body": [
        "Honeypot: one decoy system (HP-01 here) with attractive fake services. Honeynet: a whole decoy segment (VLAN 66’s HN-WEB/HN-APP/HN-DB) that invites exploration of a fake LAN. Honeyfile: a tempting file planted on a REAL server, usually carrying a canary token that phones home the instant it is opened. Honeytoken: bait in identity form — an account, API key or beacon that no human should ever use.",
        "DNS sinkhole: answers lookups for known-malicious domains with a controlled IP, and logs who asked — block plus visibility, unlike a silent blackhole. Tarpit: accepts the connection and then stalls it in an endless slow banner, burning attacker minutes per target.",
        "Low-interaction decoys emulate services cheaply (broad coverage, shallow intel). High-interaction decoys run real isolated systems (rich intel, more upkeep). Choose per purpose — objective M4 makes you pick both ways."
      ]
    },
    {
      "id": "place",
      "title": "Placement, isolation and the one rule that outranks all",
      "body": [
        "Decoys belong where an intruder will wander: the decoy yard (its own VLAN), alongside production, never inside it. Honeyfiles are the exception — they live ON real servers, hiding among real files.",
        "The one rule: a decoy under attacker control must never reach production. The fence (decoy VLAN → production = DENY) is what makes it safe to let attackers “win” on the decoy. Hard mode’s overnight log shows exactly what happens without it.",
        "And remember the CIA triad: decoys hold no real confidential data — that is WHY tripping them is nearly risk-free for the business, and why any touch is so telling for the defender."
      ]
    }
  ],
  "matchDefs": [
    {
      "id": "tarpit",
      "text": "A service that accepts connections but deliberately slows them to a crawl, wasting attacker time."
    },
    {
      "id": "honeyfile",
      "text": "A tempting file planted among real ones that raises an alert the moment it is opened."
    },
    {
      "id": "honeypot",
      "text": "A single decoy system, made to look attractive, that betrays anyone who touches it."
    },
    {
      "id": "sinkhole",
      "text": "A DNS service that answers malicious-domain lookups with a controlled IP and logs who asked."
    },
    {
      "id": "honeynet",
      "text": "A whole decoy network segment — multiple fake hosts — mirroring a real LAN."
    },
    {
      "id": "honeytoken",
      "text": "A fake credential, key or marker with zero business purpose — any use of it is an incident."
    }
  ],
  "matchTechs": [
    {
      "id": "honeypot",
      "label": "Honeypot"
    },
    {
      "id": "honeynet",
      "label": "Honeynet"
    },
    {
      "id": "honeyfile",
      "label": "Honeyfile"
    },
    {
      "id": "honeytoken",
      "label": "Honeytoken"
    },
    {
      "id": "sinkhole",
      "label": "DNS sinkhole"
    },
    {
      "id": "tarpit",
      "label": "Tarpit"
    }
  ],
  "mitigationRecs": [
    "Segment first: decoy VLAN → production = DENY (the fence). A compromised decoy must never pivot (lesson of event 03:26).",
    "Wire every deception alert to a human: an unwatched tripwire teaches nobody anything.",
    "Keep bait realistic and current: believable filenames, plausible services, versioned fake data.",
    "Layer, don’t replace: deception complements patching, MFA and EDR — it is a detection layer, not a substitute.",
    "MITRE D3FEND anchors: D3-DO Decoy Object → D3-DF Decoy File, D3-DNR Decoy Network Resource, D3-DUC Decoy User Credential."
  ],
  "nextInvestCorrect": "identity",
  "nextInvestOptions": [
    {
      "id": "identity",
      "label": "Identity threat detection — alert on any anomalous or canary-account use, anywhere"
    },
    {
      "id": "morepots",
      "label": "Buy twice as many honeypots"
    },
    {
      "id": "firewall",
      "label": "A bigger perimeter firewall"
    },
    {
      "id": "removedecoy",
      "label": "Remove the decoys so attackers cannot fingerprint them"
    }
  ],
  "objectivesMeta": [
    {
      "id": "M1",
      "mode": "medium",
      "order": 1,
      "pillar": "understand",
      "bay": "deck",
      "title": "Match all six deception technologies to their definitions.",
      "context": "Start by learning the family. Six baits, six betrayals — pair them.",
      "anchor": "Deception-tech taxonomy: honeypot, honeynet, honeyfile, honeytoken, DNS sinkhole, tarpit",
      "hints": [
        "Six technologies, six bait types. The Field Manual and glossary carry every one-line definition.",
        "Pair each technology with the definition that mentions ITS bait: a system, a network, a file, an identity, a DNS answer, a slow connection.",
        "Honeypot→single decoy system · Honeynet→decoy segment · Honeyfile→planted file · Honeytoken→fake credential/marker · Sinkhole→DNS answers with controlled IP · Tarpit→deliberately slow service."
      ],
      "success": "Full taxonomy locked in. Every control in the rack is now a named tool with a known betrayal mechanism — that is the foundation the rest of the shift builds on.",
      "fail": "A taxonomy gap here makes every later decision guesswork. Re-read the definitions: the giveaway word in each is the bait type (system / network / file / credential / DNS answer / slow connection)."
    },
    {
      "id": "M2",
      "mode": "medium",
      "order": 2,
      "pillar": "understand",
      "bay": "deck",
      "title": "Assign each security term — vulnerability, threat, exploit, risk, CIA triad — to the sentence that defines it.",
      "context": "Your lesson’s vocabulary, tested against the freight company’s own situation.",
      "anchor": "Security terminology: risk, vulnerability, exploit, threat, CIA triad (N10-009 4.1)",
      "hints": [
        "Four sentences name WHERE the weakness, danger or tool appears; the fifth names the balance every asset needs.",
        "Vulnerability = the weakness · Threat = the actor/danger · Exploit = the tool abusing the weakness · Risk = likelihood × impact · CIA triad = confidentiality/integrity/availability.",
        "In sentence order: vulnerability, threat, exploit, risk, CIA triad."
      ],
      "success": "Vocabulary secure. Keep the chain straight: a THREAT uses an EXPLOIT against a VULNERABILITY, creating RISK to the CIA of an asset. Every incident report you will ever write leans on this.",
      "fail": "Watch the chain: the weakness is the vulnerability; the actor is the threat; the tool is the exploit; likelihood × impact is risk; and the secret/correct/available balance is the CIA triad."
    },
    {
      "id": "M3",
      "mode": "medium",
      "order": 3,
      "pillar": "understand",
      "bay": "deck",
      "title": "Classify deception: which control type is it — and why does tripping a decoy endanger no real CIA?",
      "context": "Two questions that separate people who use deception from people who understand it.",
      "anchor": "Deception as a detective control; decoys hold no real data (CIA triad, N10-009 4.1)",
      "hints": [
        "Ask of question one: does deception stop anything? And of question two: what data does a decoy actually hold?",
        "Deception only observes and betrays — it prevents nothing. Decoys are filled with fake data, so no real Confidentiality, Integrity or Availability is ever exposed.",
        "Q1: Detective. Q2: “Decoys hold no real business data…”."
      ],
      "success": "Exactly. Deception is a detective control, and the decoy’s empty value is what makes it safe for the business and lethal for the attacker. That asymmetry IS the technology.",
      "fail": "If deception “prevented” anything, attackers would never reach the bait. And if decoys held real data, tripping them would be a breach, not a gift. Detective control + fake data — re-check both answers."
    },
    {
      "id": "M4",
      "mode": "medium",
      "order": 4,
      "pillar": "understand",
      "bay": "deck",
      "title": "Choose the right interaction level for each mission: deep TTP intel vs. wide cheap coverage.",
      "context": "Same technology, two price tags. Match the payout to the price.",
      "anchor": "Low- vs high-interaction honeypot trade-offs",
      "hints": [
        "Deep intel costs effort; wide coverage costs depth.",
        "A real, isolated fake system watched closely = high-interaction. Emulated services on one box = low-interaction.",
        "Mission A: high-interaction. Mission B: low-interaction."
      ],
      "success": "Correct both ways. High-interaction buys rich attacker-behavior capture at the cost of real upkeep; low-interaction buys breadth cheaply. Real programs mix both.",
      "fail": "Match the words: “real isolated system, deep insight” is high-interaction; “cheap, broad, emulated” is low-interaction. Depth costs effort — coverage costs depth."
    },
    {
      "id": "M5",
      "mode": "medium",
      "order": 5,
      "pillar": "detect",
      "bay": "rack",
      "title": "Deploy the honeypot correctly: decoy yard, SSH open, monitoring on.",
      "context": "HP-01 is more than a switch. WHERE it sits, WHICH door is open and WHO gets told all matter.",
      "anchor": "Honeypot deployment: placement (decoy VLAN), exposed service, SOC integration",
      "hints": [
        "Three settings: segment, service, monitoring. An unwatched decoy is scenery.",
        "Segment: “Decoy yard (VLAN 66)”. Service: SSH. Monitoring: on.",
        "Deploy HP-01 in the decoy yard with SSH enabled and monitoring switched on."
      ],
      "success": "HP-01 armed: a fake system in the fake yard, one open door, and the SOC listening. Anything that touches it is now, by definition, an intruder.",
      "fail": "A honeypot in the production core is a liability; SSH closed is a door nobody trips; monitoring off means the trip nobody hears. Set all three: decoy yard + SSH + monitoring."
    },
    {
      "id": "M6",
      "mode": "medium",
      "order": 6,
      "pillar": "detect",
      "bay": "rack",
      "title": "Arm the bait layer: plant the honeyfile (with canary) on the REAL file server and seed the fake identity.",
      "context": "Bait lives where users’ files live — and bait identities need no owner.",
      "anchor": "Honeyfile + canary token on production FileSrv-01; honeytoken account",
      "hints": [
        "Host: the real file server. File: something a thief cannot resist. Canary: on. And a second bait in identity space.",
        "Honeyfile host “FileSrv-01”, file “passwords.txt” (the payroll decoy also counts), canary ON; honeytoken enabled.",
        "Plant passwords.txt (or payroll_2026_final.xlsx) on FileSrv-01 with the canary on, and enable the honeytoken."
      ],
      "success": "Two baits armed: a file on the real server that screams when opened, and an account that screams when used. One bait catches file-people, the other catches credential-people.",
      "fail": "Bait on the decoy itself covers nothing — plant it on FileSrv-01. Without the canary, an open is just a log line. And without a honeytoken, credential theft stays invisible."
    },
    {
      "id": "M7",
      "mode": "medium",
      "order": 7,
      "pillar": "detect",
      "bay": "rack",
      "title": "Arm the perimeter layer: sinkhole the fake C2 domain with logging, and tarpit the edge.",
      "context": "One control answers DNS with a trap; the other answers port scans with molasses.",
      "anchor": "DNS sinkhole (redirect + logging) and tarpit on the edge",
      "hints": [
        "Sinkhole needs three things; the tarpit needs one.",
        "Sinkhole: enabled + query logging ON + keep cdn-metrics-sync.com. Tarpit: enabled.",
        "Sinkhole ON with logging ON (cdn-metrics-sync.com), tarpit ON."
      ],
      "success": "Perimeter armed. The sinkhole converts every future beacon into a named suspect host, and the tarpit turns scanner minutes into wasted attacker time.",
      "fail": "A sinkhole without logging blocks but learns nothing — flip logQueries on. And the tarpit must actually be enabled to slow the 22:04 scan. Cover both."
    },
    {
      "id": "M8",
      "mode": "medium",
      "order": 8,
      "pillar": "recognize",
      "bay": "wall",
      "title": "Run the Recon Drill, then flag every event that was produced by a deception control.",
      "context": "Now watch your traps work. The question for each event: did BAIT produce this?",
      "anchor": "Recognizing deception-produced evidence (honeypot, honeyfile, honeytoken, sinkhole, tarpit)",
      "hints": [
        "Arm your M5–M7 traps first, run the drill in the Sensor Wall, then judge each event.",
        "Flag events made by the tarpit, honeypot, honeyfile, sinkhole or honeytoken. The fence event is isolation (hardening), not deception.",
        "With everything armed, exactly five events are deception-produced. You need at least four present to check."
      ],
      "success": "Clean triage. Every flagged line is bait talking — and notice the fence event: real security value, but segmentation, not deception. Knowing the difference is what makes your alerts trustworthy.",
      "fail": "Either the drill ran with too few armed traps (arm M5–M7 and re-run), or the flags are off. Deception-produced means tarpit / honeypot / honeyfile / sinkhole / honeytoken. The fence event is not deception."
    },
    {
      "id": "M9",
      "mode": "medium",
      "order": 9,
      "pillar": "recognize",
      "bay": "wall",
      "title": "Open the HP-01 session log and enter the two commands the intruder used to profile the machine.",
      "context": "The decoy’s gift: a verbatim attacker transcript. Find the system-profiling pair.",
      "anchor": "IOC/TTP capture from honeypot telemetry",
      "hints": [
        "One command prints kernel and architecture; the other dumps the account list.",
        "Scroll the 22:19 HP-01 event and expand its raw log before answering.",
        "“uname -a” and “cat /etc/passwd”."
      ],
      "success": "That pair is the attacker fingerprinting the box — kernel version for exploit matching, /etc/passwd for accounts. On a REAL server this would be recon for privilege escalation; here it is free intel. This transcript is your IOC/TTP harvest.",
      "fail": "You need the HP-01 session to exist first (honeypot armed, drill run), then expand its raw log. You are looking for the command that prints kernel info and the one that lists accounts."
    },
    {
      "id": "M10",
      "mode": "medium",
      "order": 10,
      "pillar": "mitigate",
      "bay": "rack",
      "title": "Close the isolation fence — and say in one line why a decoy must never reach production.",
      "context": "The rule that outranks every other deception rule.",
      "anchor": "Segmentation/isolation of decoys; pivot prevention (D3-DNR adjacency)",
      "hints": [
        "The fence is a rule, not a wall: what must VLAN 66 never be able to do?",
        "Close the fence, then explain the pivot danger — a compromised decoy reaching into production.",
        "Fence closed + a reason mentioning the decoy pivoting/reaching into production."
      ],
      "success": "Fence closed. From now on the decoy yard can be lost in total — attacker and all — and production never feels it. Isolation is what makes it safe to let attackers “win” on a decoy.",
      "fail": "Two parts: flip the fence closed, and give the WHY. The reason is pivot risk — a compromised decoy must never be able to reach, move into or attack production systems."
    },
    {
      "id": "M11",
      "mode": "medium",
      "order": 11,
      "pillar": "mitigate",
      "bay": "deck",
      "title": "Order the incident response after the honeytoken fires: rotate → scope → contain → report.",
      "context": "A tripwire is only as good as the playbook behind it.",
      "anchor": "Response playbook after a deception tripwire (risk reduction: cut impact & dwell time)",
      "hints": [
        "First cut the attacker’s active access path; then learn the blast radius; then lock the door; then tell the story.",
        "Disable/rotate the canary account → search every prior use of it → isolate the involved host and block the source → brief and document.",
        "rotate → scope → contain → report."
      ],
      "success": "Right order. The canary credential is the attacker’s live access path — kill it first, map its history second, contain the endpoint third, and turn the timeline into organizational memory last.",
      "fail": "Think in access paths: while the canary account is live, the attacker can re-enter at will — rotation comes first. Scoping before containing tells you HOW BIG the door you are closing really is."
    },
    {
      "id": "M12",
      "mode": "medium",
      "order": 12,
      "pillar": "mitigate",
      "bay": "deck",
      "title": "Select the four TRUE limitations of deception technologies.",
      "context": "Ending the shift honest: what deception cannot do.",
      "anchor": "Limitations: no prevention, bait-only coverage, fingerprinting, upkeep burden",
      "hints": [
        "Four of the six statements describe real limits; two oversell the technology.",
        "Eliminate the two superpowers: “replaces firewalls/patching” and “guarantees visibility of every step”.",
        "Correct: does not prevent · bait-only coverage · can be fingerprinted · needs upkeep."
      ],
      "success": "Honest inventory. Deception is a detection layer with real gaps — it prevents nothing, sees only bait-touchers, can be fingerprinted, and rots without upkeep. Layer it; never lean on it alone.",
      "fail": "Two options promise superpowers deception has never had: replacing preventive controls, and total visibility. The four true limits: no prevention, bait-only coverage, fingerprinting risk, upkeep burden."
    },
    {
      "id": "H1",
      "mode": "hard",
      "order": 1,
      "pillar": "recognize",
      "bay": "wall",
      "title": "Triage all 14 overnight events: decoy evidence / production alert / benign noise.",
      "context": "The previous shift left you a full sensor wall and zero notes. Classify everything before touching anything.",
      "anchor": "True/false-positive discrimination across noisy multi-source evidence",
      "hints": [
        "Deception evidence = touching bait: HP-01, the honeyfile, the canary account, the sinkhole, the tarpit, the fence crossing. Production alerts are hostile but never touched bait. Scheduled jobs and ticketed scans are benign.",
        "Eight events are decoy evidence, two are production alerts (00:14, 04:44), four are benign (02:00, 03:12, 05:58, 06:02)."
      ],
      "success": "Perfect triage across 14 events — you separated bait evidence, production pressure and paper-trailed noise. This is the discrimination skill deception exists to reward.",
      "fail": "Some classifications are off. Test each event: did something TOUCH bait (decoy)? Was it hostile on production (prod alert)? Or is there an alibi — a job manifest, a change ticket (benign)?"
    },
    {
      "id": "H2",
      "mode": "hard",
      "order": 2,
      "pillar": "recognize",
      "bay": "deck",
      "title": "Reconstruct the attack chain. Sensor clocks disagree — order the six phases by CAUSALITY.",
      "context": "Six phases, shuffled, from four different sensors with unsynchronized clocks.",
      "anchor": "Attack-chain reconstruction: entry → enumeration → credential access → lateral movement → internal reach → C2",
      "hints": [
        "Causality beats clocks: entry precedes enumeration; enumeration precedes credential theft; theft enables the VPN replay; the replay precedes the reach for DB-01; the beacon is ongoing cover.",
        "You need the six phases in true order: recon/entry, enumeration, bait file, canary on VPN, decoy→DB reach, sinkhole beacon."
      ],
      "success": "Chain reconstructed. Entry, enumeration, credential access, lateral movement, internal reach-out, C2 — you just told the attacker’s story better than their own notes could.",
      "fail": "Anchor on dependencies: you cannot enumerate before you have a foothold; you cannot replay the canary credential before opening the bait file that contains it; the DB reach-out follows the foothold; the beacon runs alongside everything."
    },
    {
      "id": "H3",
      "mode": "hard",
      "order": 3,
      "pillar": "understand",
      "bay": "deck",
      "title": "Name the initial access vector the evidence actually proves.",
      "context": "One line, no hedging: how did the intruder first get in?",
      "anchor": "Initial-access determination from decoy telemetry",
      "hints": [
        "The cleanest evidence is the decoy’s own transcript: which service did 198.51.100.44 attack first?",
        "The 00:52 event shows a successful SSH login after guessing — say what that is, specifically."
      ],
      "success": "SSH brute force it is — the honeypot transcript proves guessed credentials on :22, and the 00:14 VPN burst shows the same person pressuring production accounts. Vector named, evidence cited.",
      "fail": "Rejected. If you wrote “phishing”, there is zero mail evidence; if you wrote only “VPN failures”, that is pressure on accounts, not a proven entry; RDP appears at 04:44 — after entry. The proven vector: SSH brute force against HP-01."
    },
    {
      "id": "H4",
      "mode": "hard",
      "order": 4,
      "pillar": "recognize",
      "bay": "deck",
      "title": "Pin the honeytoken evidence: which event proves credential reuse, and what exactly does it prove?",
      "context": "Two-part answer: pick the event, then pick the conclusion it licenses.",
      "anchor": "Honeytoken misuse → Valid Accounts (T1078) / credential reuse across systems",
      "hints": [
        "Find the event where the never-issued account “svc_backup” authenticates — then ask where that credential came from.",
        "The bait file opened at 02:17 CONTAINS the canary credential used at 02:41. That chain is the proof."
      ],
      "success": "Chain proven: 02:17 bait opened → 02:41 canary replayed on the VPN. Harvest-and-reuse with a valid account (T1078) — no new exploit needed, which is precisely why identity bait is so lethal.",
      "fail": "Wrong pairing or wrong conclusion. The proving event is 02:41 (canary account used on VPN), and the licensed conclusion is harvest-and-reuse — the credential came from the 02:17 bait file, not from the honeypot, and nothing here proves exfiltration."
    },
    {
      "id": "H5",
      "mode": "hard",
      "order": 5,
      "pillar": "mitigate",
      "bay": "rack",
      "title": "Find the deployment flaw the previous shift left, fix it, and pick the justification.",
      "context": "Event 03:26 is the smoking gun. Audit the rack, then close the hole.",
      "anchor": "Isolation fence (decoy VLAN → production DENY); pivot prevention",
      "hints": [
        "Ask of event 03:26: what rule was missing, and what does an attacker do with a foothold on a decoy?",
        "On the Trap Rack, the isolation fence is open. Close it, then choose the pivot justification."
      ],
      "success": "Flaw found and fixed: the fence was open, and 03:26 showed HP-01 reaching DB-01 live. With the DENY in place, the decoy yard can burn entirely without production ever feeling it.",
      "fail": "The flaw is on the rack, not in the logs: the isolation fence (decoy VLAN → production) is still open — 03:26 proves the path works. Close it, and justify with pivot prevention, not alert hygiene."
    },
    {
      "id": "H6",
      "mode": "hard",
      "order": 6,
      "pillar": "recognize",
      "bay": "deck",
      "title": "Name both red herrings and choose the rationale that acquits them.",
      "context": "Two events look hostile. Both have paper trails.",
      "anchor": "False-positive discrimination: backup job + authorized scan vs. deception evidence",
      "hints": [
        "For each suspicious event, ask: is there an alibi with a paper trail?",
        "A nightly job manifest and a change ticket are alibis — check 02:00 and 03:12."
      ],
      "success": "Both acquitted with evidence: the 02:00 mass-reads are backup job BKP-0417 (honeyfile untouched — decisive!), and the 03:12 sweep is ticketed lab test LAB-2231. Alibi-based triage is how you stay fast AND fair.",
      "fail": "Not quite. The pair to acquit is 02:00 (scheduled backup manifest; the honeyfile NOT among opened paths) and 03:12 (authorized lab test, ticket LAB-2231). Volume and internal IPs are not alibis; paper trails are."
    },
    {
      "id": "H7",
      "mode": "hard",
      "order": 7,
      "pillar": "understand",
      "bay": "deck",
      "title": "Map the attacker’s three behaviors to MITRE ATT&CK techniques. Exact IDs.",
      "context": "From “something happened” to language every SOC and vendor shares.",
      "anchor": "ATT&CK mapping: T1110, T1078, T1021 (distractors: T1566, T1497, T1486)",
      "hints": [
        "Match verbs to names: guessing credentials; using a (stolen) account; moving over remote services.",
        "Guessing = Brute Force; harvested account = Valid Accounts; SSH hopping = Remote Services."
      ],
      "success": "Mapped exactly: T1110 Brute Force, T1078 Valid Accounts, T1021 Remote Services. This is the shared language that turns your overnight feed into hunt queries and intel reports.",
      "fail": "Near-misses rejected. Phishing (T1566) never happened; sandbox evasion (T1497) is what the 05:38 fingerprint PROBE resembles — not these behaviors; encryption (T1486) appears nowhere. Correct: T1110 / T1078 / T1021."
    },
    {
      "id": "H8",
      "mode": "hard",
      "order": 8,
      "pillar": "detect",
      "bay": "deck",
      "title": "Engineer the honeyfile detection: data source, trigger, threshold, response.",
      "context": "Turn last night’s 02:17 event into a rule that pages a human next time.",
      "anchor": "Detection engineering on file-audit telemetry; threshold logic; response design",
      "hints": [
        "Honeyfile detections live in file-audit logs. The trigger is the open of one specific path. The threshold is one. The response must reach a human.",
        "Pick: file audit logs · any open of \\FileSrv-01\\Finance\\passwords.txt · a single access · high-severity + page."
      ],
      "success": "Rule engineered. Source, trigger, threshold, response all correct — and note why threshold=1: nobody legitimately opens that file, so any single access is a page. That is the deception fidelity dividend.",
      "fail": "Rejected as written. Wrong source (this is file telemetry, not VPN/DNS/firewall), wrong trigger (it is one specific path), or a threshold that would let the first access slip past — the whole point is threshold=1 with a human response. Auto-block also fails: you want the session watched, not the intel burned."
    },
    {
      "id": "H9",
      "mode": "hard",
      "order": 9,
      "pillar": "mitigate",
      "bay": "deck",
      "title": "Write the residual-risk memo: select the true residual risks, then the next control investment.",
      "context": "The fence is closed, the traps are armed. What can still hurt you?",
      "anchor": "Residual risk: fingerprinting, baitless attackers, no prevention; next control = identity analytics",
      "hints": [
        "What deception cannot do: prevent; cover attackers who never touch bait; survive fingerprinting. What investment sees identity abuse everywhere?",
        "Three risks are true; the two promises (“forever fixing”, “completely unhackable”) are not. Next investment: identity threat detection."
      ],
      "success": "Memo accepted. Fingerprinting, baitless attackers and no prevention — named honestly — and the right next spend is identity threat detection, because last night proved the attacker’s real weapon was a valid account.",
      "fail": "The memo oversells somewhere. The sinkhole does not fix beacons “forever”, and a fence does not make decoys unhackable — those two are not residual risks, they are fantasies. The true three: fingerprinting, baitless attackers, no prevention. Investment: identity threat detection."
    },
    {
      "id": "H10",
      "mode": "hard",
      "order": 10,
      "pillar": "understand",
      "bay": "deck",
      "title": "Complete the risk statement for the exec report — five slots, exact terms.",
      "context": "The lesson’s vocabulary, deployed in one sentence an executive can act on.",
      "anchor": "Security terminology applied: vulnerability, threat, exploit, risk, confidentiality",
      "hints": [
        "Weakness = vulnerability; actor = threat; tool = exploit; likelihood × impact = risk; the property harmed here is secrecy = confidentiality.",
        "Read the sentence aloud with each candidate; only one chain is technically correct."
      ],
      "success": "Sentence shipped: single-factor VPN (vulnerability) + intruder (threat) + stuffing script (exploit) → risk to confidentiality. This is how N10-009 vocabulary sounds in a real report.",
      "fail": "The chain is miswired somewhere. Keep the canonical order: the WEAKNESS is the vulnerability; the ACTOR is the threat; the TOOL is the exploit; the exposure is risk; and what the manifests lose is confidentiality."
    }
  ],
  "officialLinks": [
    {
      "label": "MITRE D3FEND — Decoy Object (D3-DO)",
      "url": "https://d3fend.mitre.org/technique/d3f:DecoyObject"
    },
    {
      "label": "MITRE ATT&CK — Brute Force (T1110)",
      "url": "https://attack.mitre.org/techniques/T1110/"
    },
    {
      "label": "MITRE ATT&CK — Valid Accounts (T1078)",
      "url": "https://attack.mitre.org/techniques/T1078/"
    },
    {
      "label": "CompTIA Network+ N10-009 objectives (official)",
      "url": "https://www.comptia.org/certifications/network"
    }
  ],
  "quizHard": [
    {
      "id": "QH1",
      "prompt": "SCENARIO — 02:41: canary account “svc_backup” logs in to the VPN from an external IP. First move?",
      "options": [
        {
          "id": "a",
          "label": "Wait to see whether a real user complains first"
        },
        {
          "id": "b",
          "label": "Disable and rotate it, then scope every prior use"
        },
        {
          "id": "c",
          "label": "Delete the honeypot so the attacker learns nothing"
        },
        {
          "id": "d",
          "label": "Reply to the account asking if the login was meant"
        }
      ],
      "correct": "b",
      "explanation": "A canary account has no owner — its use is a confirmed incident. Kill the credential first (it is the attacker’s active access path), then scope backwards: every earlier use of that identity is attacker activity, not a false positive. Waiting or replying burns time; deleting the honeypot destroys your evidence source."
    },
    {
      "id": "QH2",
      "prompt": "SCENARIO — The 00:52 SSH session on HP-01 captured whoami, uname -a, cat /etc/passwd and directory listings. What did the organization gain?",
      "options": [
        {
          "id": "a",
          "label": "Proof that production customer data was stolen"
        },
        {
          "id": "b",
          "label": "Nothing at all, because it happened on a decoy"
        },
        {
          "id": "c",
          "label": "A signed confession admissible in a courtroom"
        },
        {
          "id": "d",
          "label": "Attacker tradecraft: commands, tools, IOCs"
        }
      ],
      "correct": "d",
      "explanation": "This is the “study” value of deception: on a decoy, every keystroke is attacker behavior with zero business noise. The captured commands become IOC/TTP material for hunting the same tooling on real hosts. No production data was involved, and decoys do not generate legal evidence — they generate intelligence."
    },
    {
      "id": "QH3",
      "prompt": "SCENARIO — Weeks later, an attacker fingerprints your decoys and carefully avoids them. Which statement is true?",
      "options": [
        {
          "id": "a",
          "label": "Fingerprinting is a real gap — layer other detections"
        },
        {
          "id": "b",
          "label": "Deception failed and should be removed entirely"
        },
        {
          "id": "c",
          "label": "The decoys were faulty; real hosts would have caught him"
        },
        {
          "id": "d",
          "label": "Fingerprinting proves the network was already breached"
        }
      ],
      "correct": "a",
      "explanation": "The 05:38 event showed the probing behavior in miniature. Deception’s coverage gap is bait-touchers only; mature programs layer it with production telemetry (EDR, identity analytics) instead of relying on it alone. Removing the layer re-opens the gap, and fingerprinting is not evidence of a full breach."
    },
    {
      "id": "QH4",
      "prompt": "SCENARIO — 02:00: 1,204 file reads by svc_backup on FileSrv-01 in 9 minutes. The honeyfile was not opened. Classify it.",
      "options": [
        {
          "id": "a",
          "label": "Hostile mass-staging of files — declare an incident"
        },
        {
          "id": "b",
          "label": "A honeytoken trip — rotate svc_backup immediately"
        },
        {
          "id": "c",
          "label": "Benign: scheduled backup job, honeyfile untouched"
        },
        {
          "id": "d",
          "label": "A sinkhole hit originating from the file server"
        }
      ],
      "correct": "c",
      "explanation": "Context decides: the job manifest (nightly 02:00), the identity (the backup account) and — crucially — the untouched honeyfile all say “business as usual”. Not everything loud is a tripwire; deception evidence means touching bait, and sinkholes live on DNS, not file shares."
    },
    {
      "id": "QH5",
      "prompt": "SCENARIO — Where is the WORST place to stand up a honeypot?",
      "options": [
        {
          "id": "a",
          "label": "In a dedicated decoy VLAN with a deny rule to prod"
        },
        {
          "id": "b",
          "label": "In the production VLAN with no isolation rule set"
        },
        {
          "id": "c",
          "label": "In a monitored DMZ segment beside public services"
        },
        {
          "id": "d",
          "label": "In an isolated and monitored cloud VNet segment"
        }
      ],
      "correct": "b",
      "explanation": "A decoy you cannot isolate is a liability: once compromised it becomes a pivot into production (exactly what event 03:26 demonstrated). Isolation-first is non-negotiable for any deception deployment — the decoy VLAN, DMZ and cloud VNet options all keep the blast radius fenced."
    },
    {
      "id": "QH6",
      "prompt": "SCENARIO — Write the risk sentence for this incident. Which version is correctly formed?",
      "options": [
        {
          "id": "a",
          "label": "The vulnerability exploited the threat, raising risk"
        },
        {
          "id": "b",
          "label": "The exploit was the vulnerability of the threat itself"
        },
        {
          "id": "c",
          "label": "Risk was the threat that exploited confidentiality"
        },
        {
          "id": "d",
          "label": "Threat uses exploit on vulnerability, risking CIA"
        }
      ],
      "correct": "d",
      "explanation": "Keep the chain straight: threat = the actor; vulnerability = the weakness; exploit = the technique/tool used against it; risk = likelihood × impact of harm; the harm lands on one of the CIA properties of an asset. Every other version swaps actor, tool or outcome."
    },
    {
      "id": "QH7",
      "prompt": "SCENARIO — Besides pivot prevention, what else does properly isolating the decoy yard buy you?",
      "options": [
        {
          "id": "a",
          "label": "Decoy CPU performance improves by 40 percent or so"
        },
        {
          "id": "b",
          "label": "It removes the need to monitor the decoys at all"
        },
        {
          "id": "c",
          "label": "Attackers “succeed” safely — richer intel flows"
        },
        {
          "id": "d",
          "label": "It makes the decoys invisible to fingerprinting"
        }
      ],
      "correct": "c",
      "explanation": "Isolation is what makes high-interaction decoys safe: an attacker can root the decoy, run their tools and reveal tradecraft, while the fence guarantees none of it reaches production. Monitoring stays mandatory, fingerprinting is unaffected, and CPU numbers were never the point — zero production risk is."
    }
  ],
  "quizMedium": [
    {
      "id": "QM1",
      "prompt": "A honeypot’s primary purpose is to…",
      "options": [
        {
          "id": "a",
          "label": "stop attacks before they reach production systems"
        },
        {
          "id": "b",
          "label": "replace the need for firewalls and MFA entirely"
        },
        {
          "id": "c",
          "label": "detect, divert and study whoever touches bait"
        },
        {
          "id": "d",
          "label": "restore systems faster after a confirmed breach"
        }
      ],
      "correct": "c",
      "explanation": "Deception is a detective control: its value is the high-fidelity alert, the diversion of attacker time, and the TTP/IOC intel it captures. It prevents nothing — that is what firewalls, patching and MFA are for — and it plays no role in recovery."
    },
    {
      "id": "QM2",
      "prompt": "Your team wants to study attacker lateral-movement behavior on a realistic, isolated fake LAN. What do you deploy?",
      "options": [
        {
          "id": "a",
          "label": "A honeynet: a decoy VLAN of fake hosts to explore"
        },
        {
          "id": "b",
          "label": "A single low-interaction honeypot on a lone box"
        },
        {
          "id": "c",
          "label": "A DNS sinkhole answering lookups of a fake C2 domain"
        },
        {
          "id": "d",
          "label": "A honeyfile placed on the production file server"
        }
      ],
      "correct": "a",
      "explanation": "A honeypot is one decoy system; a honeynet is a whole decoy segment built to be explored — ideal for watching lateral movement, as long as it is fenced off from production. A sinkhole answers DNS, and a honeyfile baits file opens — neither presents a fake LAN."
    },
    {
      "id": "QM3",
      "prompt": "Which of these is a honeytoken?",
      "options": [
        {
          "id": "a",
          "label": "An IDS signature rule for a known scanner tool"
        },
        {
          "id": "b",
          "label": "The service account the nightly backup runs under"
        },
        {
          "id": "c",
          "label": "A VLAN tag assigned to the decoy switch port"
        },
        {
          "id": "d",
          "label": "A fake API key in the wiki that alerts on use"
        }
      ],
      "correct": "d",
      "explanation": "A honeytoken is bait in identity/data form: a fake key, credential or marker with no business purpose. Its only possible “use” is by an attacker — which is why it fires with almost no false positives. An IDS signature detects real attacks; a real backup account and a VLAN tag are ordinary configuration."
    },
    {
      "id": "QM4",
      "prompt": "Why do deception alerts have unusually few false positives?",
      "options": [
        {
          "id": "a",
          "label": "Machine learning trained on years of baseline logs"
        },
        {
          "id": "b",
          "label": "No legitimate process should ever touch a decoy"
        },
        {
          "id": "c",
          "label": "Decoys reject and block all automated tooling"
        },
        {
          "id": "d",
          "label": "Decoy alerts only fire during business hours"
        }
      ],
      "correct": "b",
      "explanation": "There is no legitimate traffic to a well-built decoy: users, backups and scanners have no reason to open the honeyfile or log in to the honeypot. No baseline or ML is required, tooling is not blocked (touching is the point), and monitoring is 24/7 — contrast that with production logs, where benign noise is constant."
    },
    {
      "id": "QM5",
      "prompt": "Why is a DNS sinkhole usually preferred over silently blackholing a malicious domain?",
      "options": [
        {
          "id": "a",
          "label": "Sinkholing also encrypts every internal DNS query"
        },
        {
          "id": "b",
          "label": "Blackholing is illegal in most jurisdictions"
        },
        {
          "id": "c",
          "label": "Sinkhole protection only works for HTTP streams"
        },
        {
          "id": "d",
          "label": "A sinkhole redirects and logs the asking host"
        }
      ],
      "correct": "d",
      "explanation": "A silent block protects but teaches nothing. The sinkhole gives you the redirect (protection) plus the query log (detection) — you learn exactly which internal hosts tried to beacon. Sinkholes work at the DNS layer for any protocol, and blackholing is a normal, legal control."
    },
    {
      "id": "QM6",
      "prompt": "What does a tarpit actually do to an attacker?",
      "options": [
        {
          "id": "a",
          "label": "It stalls connections in a slow endless banner"
        },
        {
          "id": "b",
          "label": "It drops their packets silently at the firewall"
        },
        {
          "id": "c",
          "label": "It bounces them to the honeypot automatically"
        },
        {
          "id": "d",
          "label": "It injects malware back through their connection"
        }
      ],
      "correct": "a",
      "explanation": "A tarpit accepts the connection and then stalls it (e.g., a slow endless banner). Attackers burn minutes per target, scanners time out, and impatient tooling exposes itself. It blocks nothing outright, redirects nowhere, and defensive tooling never injects code — friction is the defense."
    },
    {
      "id": "QM7",
      "prompt": "Which sentence uses the security terms correctly?",
      "options": [
        {
          "id": "a",
          "label": "A vulnerability exploits a threat and creates risk"
        },
        {
          "id": "b",
          "label": "A threat exploits a vulnerability, creating risk"
        },
        {
          "id": "c",
          "label": "An exploit turns a risk into a new vulnerability"
        },
        {
          "id": "d",
          "label": "Risk exploits a vulnerability and threatens the threat"
        }
      ],
      "correct": "b",
      "explanation": "The chain is: a threat (who/what could harm you) uses an exploit (the technique/tool) against a vulnerability (the weakness), creating risk (likelihood × impact) to the Confidentiality, Integrity or Availability of an asset. Every swapped version inverts actor, tool or outcome."
    }
  ],
  "redTakeaways": [
    "Defenders plant bait; careful operators probe for it — the 05:38 fingerprint pattern (/wp-admin, instant disconnect) is the tell of decoy-hunting.",
    "Bait you did not plant is the defender’s bait: scanning outputs that look “too interesting” deserve suspicion.",
    "A stolen credential list may be a canary net: validate harvested credentials on a safe host first, not on the target’s VPN.",
    "This page teaches defensive tradecraft only — simulated environment, synthetic data."
  ],
  "residualCorrect": [
    "fingerprint",
    "baitless",
    "noprevent"
  ],
  "residualOptions": [
    {
      "id": "sinkholefail",
      "label": "The sinkhole will block every future beacon, forever fixing the problem"
    },
    {
      "id": "fingerprint",
      "label": "A careful attacker may fingerprint our decoys and route around them"
    },
    {
      "id": "fence-proof",
      "label": "A closed fence makes the decoy yard completely unhackable"
    },
    {
      "id": "baitless",
      "label": "Attackers who never touch bait stay invisible to deception"
    },
    {
      "id": "noprevent",
      "label": "Deception detects but does not prevent exploitation"
    }
  ],
  "riskBank": [
    {
      "id": "vulnerability",
      "label": "vulnerability"
    },
    {
      "id": "threat",
      "label": "threat"
    },
    {
      "id": "exploit",
      "label": "exploit"
    },
    {
      "id": "risk",
      "label": "risk"
    },
    {
      "id": "confidentiality",
      "label": "confidentiality"
    }
  ],
  "riskSlots": [
    {
      "id": "slot1",
      "prefix": "The VPN gateway accepting single-factor logins was the ",
      "correct": "vulnerability"
    },
    {
      "id": "slot2",
      "prefix": ", the intruder who wanted the customer manifests was the ",
      "correct": "threat"
    },
    {
      "id": "slot3",
      "prefix": ", and the credential-stuffing script they ran was the ",
      "correct": "exploit"
    },
    {
      "id": "slot4",
      "prefix": ". Together they created serious ",
      "correct": "risk"
    },
    {
      "id": "slot5",
      "prefix": " to the ",
      "correct": "confidentiality"
    },
    {
      "id": "slot6",
      "suffix": " of those manifests.",
      "correct": ""
    }
  ],
  "ruleConditionOptions": [
    {
      "id": "honeyfile-open",
      "label": "ANY open of \\FileSrv-01\\Finance\\passwords.txt"
    },
    {
      "id": "mass-read",
      "label": "More than 500 file opens in 10 minutes"
    },
    {
      "id": "rdp-fail",
      "label": "Repeated failed RDP logins"
    },
    {
      "id": "ntp-burst",
      "label": "NTP sync bursts"
    }
  ],
  "ruleCorrect": {
    "source": "file-audit",
    "condition": "honeyfile-open",
    "threshold": "any-1",
    "response": "page"
  },
  "ruleResponseOptions": [
    {
      "id": "page",
      "label": "High-severity alert + page the on-call analyst"
    },
    {
      "id": "log-only",
      "label": "Low-severity: write to log, no notification"
    },
    {
      "id": "autoblock",
      "label": "Auto-block the source IP immediately"
    }
  ],
  "ruleSourceOptions": [
    {
      "id": "file-audit",
      "label": "File audit logs (e.g., Windows EID 4663) from FileSrv-01"
    },
    {
      "id": "firewall-deny",
      "label": "Firewall deny logs from FW-EDGE"
    },
    {
      "id": "vpn-auth",
      "label": "VPN authentication logs"
    },
    {
      "id": "dns-log",
      "label": "DNS query logs"
    }
  ],
  "ruleThresholdOptions": [
    {
      "id": "any-1",
      "label": "A single access — nobody has a business reason to open it"
    },
    {
      "id": "many-50",
      "label": "At least 50 accesses in 5 minutes"
    },
    {
      "id": "daily",
      "label": "Only alert if it happens during business hours"
    }
  ],
  "termExtra": [
    {
      "term": "Vulnerability",
      "def": "A weakness in a system, process or configuration that a threat can abuse."
    },
    {
      "term": "Exploit",
      "def": "The tool, code or technique that abuses a vulnerability."
    },
    {
      "term": "Threat",
      "def": "Any person, group or event with the potential to harm an asset."
    }
  ],
  "vocabSentenceOrder": [
    "s4",
    "s1",
    "s5",
    "s2",
    "s3"
  ],
  "vocabSentences": [
    {
      "id": "s1",
      "text": "The VPN gateway accepts single-factor logins from the internet. That weakness is the ___.",
      "correct": "vulnerability"
    },
    {
      "id": "s2",
      "text": "The group actively targeting freight companies with ransomware is the ___.",
      "correct": "threat"
    },
    {
      "id": "s3",
      "text": "The credential-stuffing script they run against the VPN portal is the ___.",
      "correct": "exploit"
    },
    {
      "id": "s4",
      "text": "With likelihood high and impact high, the company is carrying serious ___.",
      "correct": "risk"
    },
    {
      "id": "s5",
      "text": "Manifests must stay secret, unaltered and reachable when dispatch needs them — that balance is the ___.",
      "correct": "cia"
    }
  ],
  "vocabTerms": [
    {
      "id": "vulnerability",
      "label": "Vulnerability"
    },
    {
      "id": "threat",
      "label": "Threat"
    },
    {
      "id": "exploit",
      "label": "Exploit"
    },
    {
      "id": "risk",
      "label": "Risk"
    },
    {
      "id": "cia",
      "label": "CIA triad"
    }
  ],
  "yardAssets": [
    {
      "id": "fw-edge",
      "name": "FW-EDGE",
      "ip": "10.20.0.1",
      "segment": "prod",
      "role": "Perimeter firewall — the tarpit binds here and the isolation fence is enforced here."
    },
    {
      "id": "vpn-gw",
      "name": "VPN-GW",
      "ip": "10[.]20[.]0[.]5",
      "segment": "prod",
      "role": "VPN concentrator — remote access. A canary account landing here is an instant incident."
    },
    {
      "id": "dns-01",
      "name": "DNS-01",
      "ip": "10.20.0.10",
      "segment": "prod",
      "role": "Internal resolver — the DNS sinkhole answers malicious lookups from here."
    },
    {
      "id": "filesrv-01",
      "name": "FileSrv-01",
      "ip": "10.20.0.21",
      "segment": "prod",
      "role": "Production file server — the legitimate home of a planted honeyfile."
    },
    {
      "id": "appsrv-01",
      "name": "AppSrv-01",
      "ip": "10.20.0.22",
      "segment": "prod",
      "role": "Application server — real production workload."
    },
    {
      "id": "db-01",
      "name": "DB-01",
      "ip": "10.20.0.30",
      "segment": "prod",
      "role": "Database server — the attacker’s suspected target. Nothing from the decoy yard should ever reach it."
    },
    {
      "id": "ws-114",
      "name": "WS-114",
      "ip": "10.20.3.114",
      "segment": "prod",
      "role": "Workstation — the first production host seen touching bait in this environment."
    },
    {
      "id": "hp-01",
      "name": "HP-01",
      "ip": "10.66.0.50",
      "segment": "decoy",
      "role": "Honeypot decoy with a full SSH + web facade. Nobody has a business reason to log in to it."
    },
    {
      "id": "hn-web",
      "name": "HN-WEB",
      "ip": "10.66.0.61",
      "segment": "decoy",
      "role": "Honeynet decoy — fake web host, part of the VLAN 66 decoy yard."
    },
    {
      "id": "hn-app",
      "name": "HN-APP",
      "ip": "10.66.0.62",
      "segment": "decoy",
      "role": "Honeynet decoy — fake application host."
    },
    {
      "id": "hn-db",
      "name": "HN-DB",
      "ip": "10.66.0.63",
      "segment": "decoy",
      "role": "Honeynet decoy — fake database host, loaded with fake schemas."
    },
    {
      "id": "skh-01",
      "name": "SKH-01",
      "ip": "10.66.0.9",
      "segment": "decoy",
      "role": "Sinkhole responder — the IP malicious domain lookups are redirected to."
    }
  ]
};
