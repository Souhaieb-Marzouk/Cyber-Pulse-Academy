/* ============================================================================
 * Indicator Bay 02 - lab content data (js/data.js)
 * ----------------------------------------------------------------------------
 * ALL lab content lives here: racks, the 44 evidence items, objectives for
 * both shifts, quiz banks, the beacon board, match panels, glossary, field
 * guide and MITRE references. Data is separated from logic on purpose.
 *
 * Carried over 1:1 from the original framework lab (src/lib/lab/data.ts and
 * content.ts) - same items, same wording, same correct answers, same hint
 * tiers, same feedback messages.
 * ========================================================================== */

'use strict';

/** @type {import('./types').LabData} - plain structured constants */
window.LAB_DATA = {
  "RACKS": [
    {
      "id": "malware",
      "name": "Malware rack",
      "types": [
        "Ransomware",
        "Trojan",
        "Worm",
        "Spyware",
        "Adware",
        "Virus",
        "Rootkit",
        "Keylogger",
        "Logic bomb",
        "Fileless malware"
      ]
    },
    {
      "id": "physical",
      "name": "Physical rack",
      "types": [
        "Tailgating",
        "Shoulder surfing",
        "Skimming",
        "Forced entry"
      ]
    },
    {
      "id": "network",
      "name": "Network rack",
      "types": [
        "Distributed denial of service (DDoS)",
        "Protocol downgrade",
        "Rogue access point",
        "Sniffing",
        "Spoofing",
        "On-path attack",
        "DNS hijacking",
        "Cache poisoning"
      ]
    },
    {
      "id": "social",
      "name": "Message rack",
      "types": [
        "Phishing",
        "Spear phishing",
        "Whaling",
        "Smishing",
        "Vishing",
        "Quishing",
        "Impersonation",
        "Deepfake"
      ]
    },
    {
      "id": "application",
      "name": "Application rack",
      "types": [
        "Injection",
        "Buffer overflow",
        "Replay",
        "Privilege escalation",
        "Forgery",
        "Directory traversal"
      ]
    },
    {
      "id": "credential",
      "name": "Credential rack",
      "types": [
        "Password spraying",
        "Brute force",
        "User enumeration",
        "Credential replay",
        "MFA bypass"
      ]
    },
    {
      "id": "noise",
      "name": "Noise bin",
      "types": [
        "Benign - scheduled backup",
        "Benign - approved campaign",
        "Benign - documented runbook"
      ]
    }
  ],
  "EVIDENCE": [
    {
      "id": "EV-101",
      "rack": "malware",
      "title": "File server: encrypted shares + ransom note",
      "source": "EDR + file integrity monitor",
      "evidence": [
        {
          "label": "FIM alert bundle (MFH-FILE01)",
          "lines": [
            "2026-11-09 02:14  847 files renamed *.mfh.locked on \\\\MFH-FILE01\\ops",
            "2026-11-09 02:15  README_RESTORE.txt dropped in every share:",
            "  \"Your files are encrypted. Pay 0.7 BTC to wallet bc1q... in 72h",
            "   or keys are destroyed. Do not contact police.\"",
            "2026-11-09 02:16  Process vssadmin.exe delete shadows /all /quiet",
            "2026-11-09 02:16  Avg file entropy jumped 4.1 -> 7.9 bits/byte",
            "2026-11-09 02:17  Windows Defender service set to DISABLED"
          ]
        }
      ],
      "family": "malware",
      "type": "Ransomware",
      "keyIndicator": "Mass rename to .mfh.locked + ransom note + shadow copies deleted",
      "mitre": {
        "id": "T1486",
        "name": "Data Encrypted for Impact"
      },
      "feedback": "Ransomware announces itself loudly: mass file renames, a ransom note, deleted shadow copies (which erase easy recovery), and entropy spikes from encryption. Real-world echo: DarkSide disrupted Colonial Pipeline in May 2021. Next defender move: isolate the host, preserve evidence, restore from offline backups."
    },
    {
      "id": "EV-102",
      "rack": "malware",
      "title": "Workstation beaconing after \"free\" freight app",
      "source": "EDR + proxy logs",
      "evidence": [
        {
          "label": "Proxy log (host WRK-0432)",
          "lines": [
            "2026-11-08 22:00  GET https://towlink-update.example/pack.bin  (443)",
            "2026-11-08 23:00  GET https://towlink-update.example/pack.bin  (443)",
            "2026-11-09 00:00  GET https://towlink-update.example/pack.bin  (443)",
            "  -> identical request every hour, exact same URL and size 12,440 B",
            "2026-11-08 21:40  User installed ParcelTrackPro_setup.exe (freeware)",
            "EDR: ParcelTrackPro.exe signed with expired cert, spawns cmd.exe"
          ]
        }
      ],
      "family": "malware",
      "type": "Trojan",
      "keyIndicator": "Useful-looking app that beacons hourly to a C2 domain",
      "mitre": {
        "id": "T1071",
        "name": "Application Layer Protocol (beaconing)",
        "simplified": true
      },
      "feedback": "A trojan is honest-looking software with a dishonest payload. The signature here is periodic beaconing: identical outbound requests on a metronome schedule. Real-world echo: many trojans ride free utilities and cracked tools. Next move: block the domain, reimage the host, hunt the same hash fleet-wide."
    },
    {
      "id": "EV-103",
      "rack": "malware",
      "title": "SMB sweep moving host to host",
      "source": "NetFlow + EDR fleet view",
      "evidence": [
        {
          "label": "NetFlow summary (VLAN 12)",
          "lines": [
            "02:31  WRK-0432 -> sequential SMB (445) probes 10.12.0.1-50",
            "02:38  10.12.0.17 -> sequential SMB probes 10.12.0.51-90",
            "02:44  10.12.0.51 -> sequential SMB probes 10.12.0.91-120",
            "  -> 40 hosts infected in 22 min, each starts the same sweep",
            "EDR on each new host: task \"svc-sync\" created, points to \\\\neighbor\\sync.dll"
          ]
        }
      ],
      "family": "malware",
      "type": "Worm",
      "keyIndicator": "Self-propagating sequential scans, each victim becomes the next scanner",
      "mitre": {
        "id": "T1210",
        "name": "Exploitation of Remote Services",
        "simplified": true
      },
      "feedback": "A worm needs no human to click - it copies itself across the network. The tell is a moving wave: sequential scans, then the victim repeats the pattern. Next move: segment VLANs and patch the remote service; worms die when lateral paths are cut."
    },
    {
      "id": "EV-104",
      "rack": "malware",
      "title": "Browser extension watching every form",
      "source": "EDR + extension audit",
      "evidence": [
        {
          "label": "Extension audit (host WRK-0198)",
          "lines": [
            "Extension \"ShipDealz Coupon Finder\" - 4 permissions requested:",
            "  Read and change all data on all sites; capture screen content",
            "Local storage dump: 612 entries of typed text incl. form fields",
            "  \"user=m.reyes pass=******** otp=448201\" (stored plaintext)",
            "Hourly upload of 40-80 KB to stats.shipdealz-cdn.example"
          ]
        }
      ],
      "family": "malware",
      "type": "Spyware",
      "keyIndicator": "Covert collection of user input and screen content, quietly uploaded",
      "mitre": {
        "id": "T1113",
        "name": "Screen Capture",
        "simplified": true
      },
      "feedback": "Spyware silently collects - keystrokes, screens, browsing - while the machine looks normal. Evidence is the harvested data itself, often sitting in plaintext before upload. Next move: remove the extension, rotate every credential typed on that host, and alert the affected user."
    },
    {
      "id": "EV-105",
      "rack": "malware",
      "title": "Barcode tool that hijacked the browser",
      "source": "Helpdesk ticket bundle",
      "evidence": [
        {
          "label": "Helpdesk ticket HD-3302",
          "lines": [
            "Reporter: dock clerk, terminals WRK-0771..0774",
            "\"Search engine switched to find-fast-cargo.example, 9 pop-up ads",
            " per page, toolbar \"QuickScan Deals\" appeared after installing",
            " the free barcode label maker from a forum link.\"",
            "No files encrypted, no data theft observed, ads on every search."
          ]
        }
      ],
      "family": "malware",
      "type": "Adware",
      "keyIndicator": "Annoyance-grade browser hijack and ad injection, no covert goal",
      "feedback": "Adware is the low-severity cousin: it hijacks search, injects ads, and resists removal, but does not steal data by design. It still matters - it often arrives through the same sloppy channels malware uses. Next move: uninstall via the browser reset path and patch the download habit."
    },
    {
      "id": "EV-106",
      "rack": "malware",
      "title": "Executables modified after USB transfer",
      "source": "File integrity monitor",
      "evidence": [
        {
          "label": "FIM diff (host WRK-0315)",
          "lines": [
            "2026-11-09 15:47  USB mass storage connected (personal drive)",
            "2026-11-09 15:52  14 .exe files modified, hashes changed:",
            "  sha256 5d41...9e0b -> 8f27...c4d1 (tools\\labelprint.exe)",
            "  sha256 a0c3...7712 -> 1b98...44af (tools\\manifest.exe)",
            "Hosts sharing the same USB stick show identical new hashes"
          ]
        }
      ],
      "family": "malware",
      "type": "Virus",
      "keyIndicator": "Existing host files infected and hash-changed, spreading via shared media",
      "mitre": {
        "id": "T1204.002",
        "name": "User Execution: Malicious File",
        "simplified": true
      },
      "feedback": "A classic virus attaches itself to legitimate host files and spreads when those files or the media carrying them travel. The fingerprint is hash changes on existing binaries plus a common source device. Next move: quarantine the affected files, restore clean versions, ban unknown USB media."
    },
    {
      "id": "EV-107",
      "rack": "malware",
      "title": "Processes invisible to the OS, driver from %TEMP%",
      "source": "EDR kernel view + live response",
      "evidence": [
        {
          "label": "Live response capture (SRV-DC01)",
          "lines": [
            "Task Manager / Process list: 128 processes",
            "EDR kernel telemetry: 131 processes - 3 are hidden (ssmart.exe x3)",
            "Driver fsantiv.sys loaded from C:\\Windows\\Temp\\ -> runs at ring 0",
            "Defender service + EDR sensor stopped 2026-11-09 03:02",
            "Event log: Security.evtx truncated at 03:11 (entries removed)",
            "Boot sector: unsigned module chained before winload.exe"
          ]
        }
      ],
      "family": "malware",
      "type": "Rootkit",
      "keyIndicator": "Kernel-mode hiding, sensor tampering, pre-OS boot module",
      "mitre": {
        "id": "T1014",
        "name": "Rootkit"
      },
      "feedback": "A rootkit hides below the OS and can hollow out your defenses - here it also disabled the sensor and trimmed the event log (log manipulation). The mismatch between what the OS reports and what kernel telemetry sees is the giveaway. Next move: capture memory, then rebuild the host from clean media; trust nothing on disk."
    },
    {
      "id": "EV-108",
      "rack": "malware",
      "title": "Keystroke capture on the dispatcher terminal",
      "source": "EDR + scheduled task audit",
      "evidence": [
        {
          "label": "EDR process tree (WRK-0209)",
          "lines": [
            "kbdhelper.exe (unsigned) loaded by accessibility hook, persists via task",
            "Buffer file C:\\ProgramData\\kb\\buf.dat grows with every keystroke",
            "  sample: \"ops4472  ############4482  cvc 114\"",
            "buf.dat uploaded 02:00 daily to towlink-update.example/in/"
          ]
        }
      ],
      "family": "malware",
      "type": "Keylogger",
      "keyIndicator": "Keystroke buffer with credentials/card data exfiltrated to C2",
      "mitre": {
        "id": "T1056.001",
        "name": "Input Capture: Keylogging"
      },
      "feedback": "Keyloggers harvest exactly what you type - the buffer file with card numbers and OTPs is the smoking gun. Note the overlap with credential attacks: the capture is malware, the use of the stolen OTP would show up in identity logs. Next move: kill the process, purge the task, rotate everything typed there."
    },
    {
      "id": "EV-109",
      "rack": "malware",
      "title": "Payroll records wiped by a \"sleeping\" task",
      "source": "DB audit + task scheduler log",
      "evidence": [
        {
          "label": "Task scheduler + DB audit (SRV-HR01)",
          "lines": [
            "2026-11-09 02:00  Task \"PayDataHousekeeping\" ran (created 2026-03-12)",
            "Script comment found in source: ",
            "  '# trigger: when record id TEMP-CONTRACTOR-88 is deleted, purge pay tables'",
            "2026-11-09 01:58  TEMP-CONTRACTOR-88 removed from HR system",
            "2026-11-09 02:00  11,204 payroll rows deleted - no manual session"
          ]
        }
      ],
      "family": "malware",
      "type": "Logic bomb",
      "keyIndicator": "Code that lay dormant until a precise data condition fired it",
      "mitre": {
        "id": "T1053.005",
        "name": "Scheduled Task/Job",
        "simplified": true
      },
      "feedback": "A logic bomb is sabotage on a timer: harmless code waiting for a trigger such as a date or a data condition. The classic documented pattern is the insider whose sabotage job fires the moment their own access is removed. Next move: review all scheduled jobs for trigger conditions, restore rows from backup, tighten change review on automation."
    },
    {
      "id": "EV-110",
      "rack": "malware",
      "title": "Word document summoning PowerShell",
      "source": "EDR process tree",
      "evidence": [
        {
          "label": "Process tree (host WRK-0560)",
          "lines": [
            "WINWORD.EXE -> cmd.exe -> powershell.exe -nop -w hidden -enc <base64>",
            "Decoded: downloads from 203.0.113.88, runs fully in memory",
            "No matching binary on disk; parent-child chain is the only artifact",
            "Persistence: WMI event subscription \"Filter: __EventFilter[WSB]\""
          ]
        }
      ],
      "family": "malware",
      "type": "Fileless malware",
      "keyIndicator": "Payload lives in memory via trusted tools, nothing lands on disk",
      "mitre": {
        "id": "T1059.001",
        "name": "Command and Scripting Interpreter: PowerShell"
      },
      "feedback": "Fileless malware never writes a file, so file-based scanners see nothing - the artifact is the suspicious parent-child chain (Word to PowerShell) and WMI persistence. Next move: alert on office apps spawning script interpreters, capture memory, block the payload URL."
    },
    {
      "id": "EV-201",
      "rack": "physical",
      "title": "Camera: two people in, one badge swipe",
      "source": "Dock door camera + badge log",
      "evidence": [
        {
          "label": "Dock 3 camera + access log",
          "lines": [
            "2026-11-10 18:42  Badge 2210 (T. Okafor) swipe, door open 9s",
            "Camera: T. Okafor enters; second person in high-vis follows",
            "  through the closing door carrying a technician toolbox",
            "Badge log: exactly ONE authentication for that 9s window",
            "Visitor log: no contractor scheduled at Dock 3 that evening"
          ]
        }
      ],
      "family": "physical",
      "type": "Tailgating",
      "keyIndicator": "One badge authentication, two people entering",
      "feedback": "Tailgating is riding an authorized person through a controlled door. The badge log and camera disagree - that mismatch is the indicator. Real-world echo: pentests routinely get in this way, toolbox included. Next move: security awareness (\"no badge, no entry\"), door etiquette training, and mantrap turnstiles at critical doors."
    },
    {
      "id": "EV-202",
      "rack": "physical",
      "title": "Visitor filming the dispatch console",
      "source": "Dispatch floor observation report",
      "evidence": [
        {
          "label": "Observation report (supervisor, 2026-11-10)",
          "lines": [
            "Visitor with vendor lanyard positioned behind dispatcher station",
            "Phone raised, recording over the shoulder of D. Marsh for ~4 min",
            "D. Marsh was entering MFA code + customer billing details",
            "Visitor left before escort arrived; badge check shows expired pass"
          ]
        }
      ],
      "family": "physical",
      "type": "Shoulder surfing",
      "keyIndicator": "Direct observation of secrets being typed, phone camera aimed at screen",
      "feedback": "Shoulder surfing needs no tooling - eyes or a phone camera over a victim's shoulder capture passwords, MFA codes and screens. The tell is the positioning and the reaction when noticed. Next move: rotate exposed credentials, privacy filters on displays, and an escort policy for visitors."
    },
    {
      "id": "EV-203",
      "rack": "physical",
      "title": "One badge, two cities, four minutes apart",
      "source": "Physical access control system",
      "evidence": [
        {
          "label": "PACS extract (badge 4491 - S. Byrne)",
          "lines": [
            "2026-11-10 07:58  Newhaven Gate A - granted (staff entrance)",
            "2026-11-10 08:02  Dover Annex turnstile - granted (38 km away)",
            "Both reads: same badge serial, different door controllers",
            "S. Byrne (interview): at Newhaven all morning, badge on lanyard",
            "2026-11-09 23:10  Badge 4491 briefly left unattended at desk (CCTV)"
          ]
        }
      ],
      "family": "physical",
      "type": "Skimming",
      "keyIndicator": "Clone badge read at an impossible distance from the original",
      "feedback": "Skimming copies the credential itself - the attacker (or a cheap reader) harvests the card and clones it, so the clone walks while the human stays put. This is \"impossible travel\" in badge form, and the unattended-badge window is the theft point. Next move: issue duplicate-read alerts, immediately deactivate and re-issue badge 4491."
    },
    {
      "id": "EV-204",
      "rack": "physical",
      "title": "Server room door: pry marks and a scratched lock",
      "source": "Facilities inspection",
      "evidence": [
        {
          "label": "Inspection report (2026-11-10 06:30)",
          "lines": [
            "Server room 2 door: lock cylinder shows fresh score marks",
            "Frame: pry tool marks, 4 mm separation, door contact sensor bypassed",
            "Alarm panel log: zone 12 \"bypassed\" 2026-11-10 01:12 (no ticket)",
            "Nothing obviously missing yet; tape residue near rack cable tray"
          ]
        }
      ],
      "family": "physical",
      "type": "Forced entry",
      "keyIndicator": "Physical damage to door/lock plus an unexplained alarm bypass",
      "feedback": "Forced entry is the blunt instrument of physical attacks: pry marks, damaged locks - and, in a smarter variant, an alarm bypass staged first. Check what the attacker was reaching for (cabling, consoles, media). Next move: review CCTV for the window, repair and re-key, remove the ability to bypass zones without dual approval."
    },
    {
      "id": "EV-301",
      "rack": "network",
      "title": "Portal unreachable under a UDP avalanche",
      "source": "NetFlow + ISP scrubbing report",
      "evidence": [
        {
          "label": "Edge flow summary",
          "lines": [
            "2026-11-09 04:10  Inbound 3.2 Gbps UDP to portal.mfhlogistics.example:123",
            "  12,400+ distinct source IPs across 60+ countries",
            "  payloads look like monlist NTP responses (amplification x 500)",
            "04:10-05:35  Booking portal times out for all customers",
            "05:35  ISP scrubbing activated, traffic drops to 180 Mbps baseline"
          ]
        }
      ],
      "family": "network",
      "type": "Distributed denial of service (DDoS)",
      "keyIndicator": "Volumetric flood from thousands of sources, service unavailable",
      "mitre": {
        "id": "T1498.002",
        "name": "Network DoS: Reflection Amplification"
      },
      "feedback": "DDoS drowns availability, and the amplified variant uses third-party servers to multiply the flood (here: NTP monlist). Thousands of sources, one victim, a clean cliff-edge of unavailability. Next move: ISP scrubbing / anycast filtering, rate limits, and an tested runbook - you buy protection before the flood, not during it."
    },
    {
      "id": "EV-302",
      "rack": "network",
      "title": "Handshakes silently retreating to SSLv3",
      "source": "TLS inspection proxy",
      "evidence": [
        {
          "label": "TLS handshake log (partner gateway)",
          "lines": [
            "Baseline: partners.mfhlogistics.example negotiates TLS 1.3 (100%)",
            "2026-11-09 22:40  412 sessions renegotiate to SSLv3 / TLS 1.0",
            "  all 412 from 203.0.113.71 after ServerHello flood pattern",
            "Cipher in downgraded sessions: RC4-SHA (weak, considered broken)",
            "22:41  Two sessions carry plaintext-auth POP3 pattern"
          ]
        }
      ],
      "family": "network",
      "type": "Protocol downgrade",
      "keyIndicator": "Negotiations forced down to broken protocols and ciphers",
      "feedback": "A downgrade attack pushes modern clients onto old, broken protocol versions so the attacker can exploit them (POODLE-style). The indicator is a fleet of sessions suddenly agreeing on SSLv3 with a cipher nobody should offer. Next move: disable SSLv3/TLS1.0 server-side, alert on negotiated-version anomalies, patch the gateway."
    },
    {
      "id": "EV-303",
      "rack": "network",
      "title": "\"Free crew Wi-Fi\" that the company never built",
      "source": "Wireless controller",
      "evidence": [
        {
          "label": "WLAN controller alert (Warehouse B)",
          "lines": [
            "2026-11-10 08:14  New SSID detected: \"MFH-Crew-Free\" (open)",
            "  BSSID 9e:31:f0:22:1a:07 - not in approved AP inventory",
            "Signal strength 2x stronger than the real corporate AP nearby",
            "14 phones auto-joined (same SSID as corporate guest network)",
            "Rogue DHCP leases default gw 10.9.4.66 (unregistered device)"
          ]
        }
      ],
      "family": "network",
      "type": "Rogue access point",
      "keyIndicator": "Stronger unmanaged twin of a known SSID, clients auto-joining",
      "mitre": {
        "id": "T1557",
        "name": "Adversary-in-the-Middle",
        "simplified": true
      },
      "feedback": "A rogue AP (evil twin) out-shouts the legitimate one and harvests whatever the joiners send. Devices that auto-join a familiar SSID are the victims, and the rogue DHCP gateway hands the attacker all their traffic. Next move: deauth and physically locate the device, 802.1X for corporate, certificate-pinned VPN for mobile crews."
    },
    {
      "id": "EV-304",
      "rack": "network",
      "title": "NIC in promiscuous mode with a capture file",
      "source": "Endpoint config audit",
      "evidence": [
        {
          "label": "Endpoint audit (host WRK-0880)",
          "lines": [
            "Dispatch VLAN NIC switched to promiscuous mode 2026-11-09 21:00",
            "C:\\Users\\svc-backup\\pcaps\\cap-night.pcap - 1.9 GB",
            "  contains FTP session: USER opsftp PASS Fr8gh0st2019 (cleartext)",
            "Port-mirror config on switch SW-12 added by unknown session 20:40"
          ]
        }
      ],
      "family": "network",
      "type": "Sniffing",
      "keyIndicator": "Promiscuous capture harvesting cleartext credentials in transit",
      "mitre": {
        "id": "T1040",
        "name": "Network Sniffing"
      },
      "feedback": "Sniffing is passive collection: the attacker watches traffic and, on networks that still speak cleartext protocols, passwords fall out for free. The captured FTP creds now count as compromised. Next move: rotate the FTP credential, kill cleartext protocols, lock switch port-mirroring down."
    },
    {
      "id": "EV-305",
      "rack": "network",
      "title": "Printer subnet suddenly talks SMB",
      "source": "Router ACL + firewall logs",
      "evidence": [
        {
          "label": "Firewall log extract",
          "lines": [
            "2026-11-09 23:55  src 10.4.30.12 (label-printer-2, camera subnet)",
            "  -> SMB 445 to 31 hosts; printers do not run SMB",
            "Router ARP: 10.4.30.12 answered from two different MAC addresses",
            "MAC 00:1b:44:11:3a:b7 (unregistered) claims the printer IP"
          ]
        }
      ],
      "family": "network",
      "type": "Spoofing",
      "keyIndicator": "Traffic wearing a trusted device's identity (IP/MAC impersonation)",
      "feedback": "Spoofing forges identity - here a device claims the printer's IP/MAC so its traffic inherits the printer's trust. Two MACs answering for one IP is the giveaway. Next move: hunt the unregistered MAC, dynamic ARP inspection + DHCP snooping, and drop \"trusted subnet\" assumptions at the firewall."
    },
    {
      "id": "EV-306",
      "rack": "network",
      "title": "Intranet cert warnings and a gateway that moved",
      "source": "Client reports + ARP audit",
      "evidence": [
        {
          "label": "Helpdesk cluster + host audit",
          "lines": [
            "9 users: \"intranet shows certificate warning - issued by",
            "  MFH-Int-CA v2\" (real CA is MFH-Root-CA v4, different fingerprint)",
            "ARP caches on 6 hosts: 10.4.0.1 (gateway) maps to one new MAC",
            "  aa:bb:cc:dd:ee:ff - matches nothing in the CMDB",
            "Traffic to intranet is being relayed through 10.4.0.250"
          ]
        }
      ],
      "family": "network",
      "type": "On-path attack",
      "keyIndicator": "Attacker relaying traffic between victim and gateway (ARP poison + fake cert)",
      "mitre": {
        "id": "T1557",
        "name": "Adversary-in-the-Middle"
      },
      "feedback": "An on-path (man-in-the-middle) attack inserts itself into a connection: ARP cache poisoning steers traffic to the attacker, whose fake certificate triggers the browser warning. Trust the warning - it is doing its job. Next move: flush ARP caches, isolate 10.4.0.250, dynamic ARP inspection, and never click through cert errors."
    },
    {
      "id": "EV-307",
      "rack": "network",
      "title": "Company domain now points at unknown nameservers",
      "source": "DNS registrar audit",
      "evidence": [
        {
          "label": "Registrar change history (mfhlogistics.example)",
          "lines": [
            "2026-11-09 03:40  NS records changed to ns1/ns2.cargodrop.example",
            "  registrar account accessed from 198.51.100.190 (new country)",
            "www + mail records resolve to 203.0.113.140 (unknown host)",
            "Customers report fake \"delivery fee\" page on the real domain"
          ]
        }
      ],
      "family": "network",
      "type": "DNS hijacking",
      "keyIndicator": "Authoritative records silently redirected at the registrar",
      "feedback": "DNS hijacking re-points where the whole world finds you - here at the registrar level, which outranks every local fix. Phishing on your own real domain follows. Next move: recover the registrar account, set registry lock, enforce DNSSEC, and audit admin e-mail for the reset trail."
    },
    {
      "id": "EV-308",
      "rack": "network",
      "title": "Branch resolver answers wrong IP for partner",
      "source": "DNS resolver monitoring",
      "evidence": [
        {
          "label": "Resolver diff (branch BR-07)",
          "lines": [
            "fleettrack.example -> 203.0.113.99 at BR-07 resolver",
            "fleettrack.example -> 198.51.100.20 at HQ resolver (correct)",
            "Only branch staff see the wrong page: \"driver portal - relogin\"",
            "203.0.113.99 serves a credential page cloned from fleettrack",
            "Resolver cache entry TTL renewed repeatedly from spoofed replies"
          ]
        }
      ],
      "family": "network",
      "type": "Cache poisoning",
      "keyIndicator": "One resolver serves a poisoned answer while others stay correct",
      "feedback": "Cache poisoning corrupts one resolver's memory: everyone asking THAT resolver gets the attacker's IP while the rest of the world resolves correctly - a perfect differential test. Next move: flush the poisoned records, patch/validate the resolver (DNSSEC, random source ports), and reset creds entered at the fake page."
    },
    {
      "id": "EV-401",
      "rack": "social",
      "title": "Delivery-fee blast to 900 staff",
      "source": "Mail gateway",
      "evidence": [
        {
          "label": "Mail gateway report",
          "lines": [
            "From: MFH Parcel Desk <no-reply@mfh-parcel-fee.example>",
            "Subject: \"Action required: your delivery fee 0.99 EUR unpaid\"",
            "Sent to 900+ recipients (every mailbox with an \"m.\" prefix)",
            "Link: hxxps://mfh-parcel-fee.example/pay  -> credential page clone",
            "Same blast text for all recipients; no personal details at all"
          ]
        }
      ],
      "family": "social",
      "type": "Phishing",
      "keyIndicator": "Mass, untargeted lure harvesting credentials on a cloned page",
      "mitre": {
        "id": "T1566",
        "name": "Phishing"
      },
      "feedback": "Phishing is the volume play: one generic lure to hundreds of mailboxes, fishing for whoever bites. The clues are scale, genericity and the cloned payment page. Next move: purge the message, block the domain, and use it as tomorrow's awareness example - it is a perfect specimen."
    },
    {
      "id": "EV-402",
      "rack": "social",
      "title": "Route-audit email that knows your week",
      "source": "Mail gateway + sandbox",
      "evidence": [
        {
          "label": "Mail analysis (target: fleet manager)",
          "lines": [
            "From: \"Logistics Auditing Group\" <audit@fleetreview-group.example>",
            "Subject: Re: the Williamsport route audit you flagged Friday",
            "Body references real internal project names and 2 colleague names",
            "Attachment: RouteAudit_Q3.pdf.exe (PDF icon, double extension)",
            "Sandbox: sha256 4e1f...b209, drops C2 beacon to 198.51.100.44:8443"
          ]
        }
      ],
      "family": "social",
      "type": "Spear phishing",
      "keyIndicator": "Targeted lure with researched personal context + weaponized attachment",
      "mitre": {
        "id": "T1566.001",
        "name": "Phishing: Spearphishing Attachment"
      },
      "feedback": "Spear phishing spends research before sending: your projects, your colleagues, your calendar. The context builds trust; the double-extension attachment cashes it in. Real-world echo: APT-style crews almost always start this way. Next move: never run it, detonate in sandbox, brief the named colleagues they researched."
    },
    {
      "id": "EV-403",
      "rack": "social",
      "title": "\"Urgent wire\" aimed at the CFO",
      "source": "Mail gateway + finance report",
      "evidence": [
        {
          "label": "Message analysis",
          "lines": [
            "From: \"M. Castellanos, Counsel\" <m.castellanos@mfhlegal.example>",
            "  (one letter off: real counsel domain is mfh-legal.example)",
            "To: CFO only. \"Board-sensitive acquisition wire, confirm by 17:00.\"",
            "Thread: reply-to differs from sender; header shows spoofed display name",
            "Finance note: request skips every approved payment procedure"
          ]
        }
      ],
      "family": "social",
      "type": "Whaling",
      "keyIndicator": "High-value executive target, lookalike domain, urgency + authority",
      "mitre": {
        "id": "T1566",
        "name": "Phishing (BEC variant)",
        "simplified": true
      },
      "feedback": "Whaling is spear phishing aimed at the biggest fish - executives with payment authority. The lookalike domain and the \"skip the procedure\" pressure are classic business-email-compromise tells. Real-world echo: the 2024 Arup case lost ~25M USD largely through authority pressure. Next move: out-of-band callback on a known number, hard dual-approval for wires."
    },
    {
      "id": "EV-404",
      "rack": "social",
      "title": "Route-app SMS to every driver",
      "source": "Mobile device management report",
      "evidence": [
        {
          "label": "SMS copy (driver phones)",
          "lines": [
            "MFH Dispatch: your route app cert expired today. Renew now:",
            "  mfh-dispatch.info/renew  (login with company credentials)",
            "Sent to 214 driver numbers between 06:30-06:34",
            "mfh-dispatch.info registered 4 days ago, privacy-protected owner"
          ]
        }
      ],
      "family": "social",
      "type": "Smishing",
      "keyIndicator": "Mass SMS lure to a freshly registered lookalike domain",
      "mitre": {
        "id": "T1566",
        "name": "Phishing (SMS channel)",
        "simplified": true
      },
      "feedback": "Smishing moves the lure to SMS, exploiting the tiny screen and the trust we grant text messages. Fresh registration + credential demand = fake. Next move: block the domain fleet-wide via MDM, warn drivers in the dispatch channel they actually use, and never authenticate from a text link."
    },
    {
      "id": "EV-405",
      "rack": "social",
      "title": "Helpdesk call asking to \"read back the code\"",
      "source": "Phone system recording",
      "evidence": [
        {
          "label": "Call transcript (14:22, dispatcher line)",
          "lines": [
            "Caller: \"Service desk here - we're re-syncing your route app.",
            "  I just sent a push. Read me the 6-digit code to finish.\"",
            "Caller ID displays internal IT extension 4-2200 (spoofed)",
            "Dispatcher reads code 448201; session flags: new device, new country",
            "IT confirms: no sync campaign running; 4-2200 was not in use"
          ]
        }
      ],
      "family": "social",
      "type": "Vishing",
      "keyIndicator": "Voice lure harvesting a live MFA code, caller ID spoofed",
      "feedback": "Vishing is phishing by phone - the strongest channel for urgency, because a human voice presses all our cooperation buttons. The harvested code plus a \"new device, new country\" session is full account takeover in motion. Next move: freeze the session, train the rule \"we never ask for codes\", make caller ID worthless by verifying via directory."
    },
    {
      "id": "EV-406",
      "rack": "social",
      "title": "Sticker pasted over the cafeteria menu QR",
      "source": "Facilities + QR audit",
      "evidence": [
        {
          "label": "QR scan analysis",
          "lines": [
            "Poster: \"Scan for this week's menu\" - QR was overlaid with sticker",
            "Sticker QR resolves to mfh-menu-secure.example/login (new domain)",
            "Page: pixel-perfect clone of the staff portal login",
            "2 employees entered credentials 11:40-11:52 before report at 11:58"
          ]
        }
      ],
      "family": "social",
      "type": "Quishing",
      "keyIndicator": "Swapped physical QR code steering scanners to a cloned login",
      "feedback": "Quishing weaponizes the QR code: a sticker swap turns a trusted physical object into a phishing lure, and phones hide the URL that a browser would show. Two victims before anyone looked closely. Next move: reset the two accounts, remove the sticker, print QRs with short unique URLs and verify-destination training."
    },
    {
      "id": "EV-407",
      "rack": "social",
      "title": "\"Alex from IT\" with a toolbox and no vendor record",
      "source": "Front desk + visitor system",
      "evidence": [
        {
          "label": "Visitor system extract",
          "lines": [
            "2026-11-10 09:15  Self-registered: \"Alex - IT contractor\"",
            "Wore generic hi-vis + IT-brand polo; carried laptop bag + badge reader",
            "Asked floor manager to \"swipe him through\" to the comms room",
            "No vendor ID, no work order, no escort assigned",
            "Left when front desk started verification calls"
          ]
        }
      ],
      "family": "social",
      "type": "Impersonation",
      "keyIndicator": "Invented role + borrowed props, collapses under verification",
      "mitre": {
        "id": "T1684.001",
        "name": "Social Engineering: Impersonation"
      },
      "feedback": "Impersonation is confidence in a costume: a plausible role, the right clothes, and a person too busy to check. It collapses the moment someone verifies against a registry - which is the lesson. Next move: escort + call-back policy for every \"contractor\", and thank the floor manager who paused."
    },
    {
      "id": "EV-408",
      "rack": "social",
      "title": "Ops director on video approves a data export",
      "source": "Collab platform + HR calendar",
      "evidence": [
        {
          "label": "Incident summary",
          "lines": [
            "17:40  Video-call request \"R. Vance (Ops Director)\" - voice+video",
            "  face/voice match public conference recordings of the director",
            "  slight lip-sync drift at sentence starts; background static",
            "Grants after-hours export of the customer manifest database",
            "HR calendar: R. Vance on leave all week, replied from official mail:",
            "  \"Not me. Not my voice. I never joined any call.\""
          ]
        }
      ],
      "family": "social",
      "type": "Deepfake",
      "keyIndicator": "Synthesized face/voice of a real leader authorizing access",
      "feedback": "Deepfakes clone identity itself - face and voice pulled from public footage, convincing enough to authorize a data export. Real-world echo: the 2024 Hong Kong Arup video-call fraud. The shield is process, not perception: out-of-band verification through known channels for every sensitive approval. Next move: revoke the export, verify via a second channel, add \"assume synthetic\" to executive approval policy."
    },
    {
      "id": "EV-501",
      "rack": "application",
      "title": "Tracking form returns a database error",
      "source": "WAF + app logs",
      "evidence": [
        {
          "label": "WAF log (tracking portal)",
          "lines": [
            "2026-11-09 13:07  GET /track?ref=AX1029' UNION SELECT cc_number,",
            "  card_exp FROM payments--   (419: SQL syntax error in response)",
            "13:09  Same payload with table names payments.cards, users.password",
            "13:11  Response dump includes: \"unknown column cc_number in users\"",
            "Client 203.0.113.62 probing schema, ~6 req/min (slow, deliberate)"
          ]
        }
      ],
      "family": "application",
      "type": "Injection",
      "keyIndicator": "Input turning into SQL - errors leak schema, payloads target payment data",
      "mitre": {
        "id": "T1190",
        "name": "Exploit Public-Facing Application",
        "simplified": true
      },
      "feedback": "Injection (SQLi here) sends data that the server executes as code; the error messages then hand the attacker the database schema. Untrusted input + verbose errors = free reconnaissance. Next move: parameterized queries, WAF rule, and stop leaking SQL errors to clients."
    },
    {
      "id": "EV-502",
      "rack": "application",
      "title": "Legacy parser crashes on oversized input",
      "source": "Application crash dumps",
      "evidence": [
        {
          "label": "Crash summary (manifest parser, port 9100)",
          "lines": [
            "2026-11-09 16:22  STATUS_ACCESS_VIOLATION 0xC0000005",
            "  input length 2,048 B (buffer declared 512 B) - stack smashed",
            "  return address overwritten with 0x41414141 (\"AAAA\")",
            "Parser restarted automatically each time; no alerts fired",
            "Same source IP sent 11 crashes in 20 minutes (fuzzing pattern)"
          ]
        }
      ],
      "family": "application",
      "type": "Buffer overflow",
      "keyIndicator": "Oversized input overwriting memory - crash pattern used to plant code",
      "feedback": "Buffer overflows write past a fixed boundary and can turn a crash into code execution. Even when it \"just\" crashes, the repeat pattern from one source is active exploitation rehearsal. Next move: patch or retire the legacy parser, bounds-check input, alert on repeated crash patterns."
    },
    {
      "id": "EV-503",
      "rack": "application",
      "title": "The same confirmed order, sixty-three times",
      "source": "API gateway log",
      "evidence": [
        {
          "label": "API gateway log",
          "lines": [
            "POST /api/shipments/confirm  (order 88113, token jwt=eyJ..c9)",
            "  -> 63 identical requests 14:02:11 - 14:02:19",
            "  same session token, same payload hash, all accepted 200 OK",
            "Merchant charged for 63 duplicate bookings; token never rotated"
          ]
        }
      ],
      "family": "application",
      "type": "Replay",
      "keyIndicator": "A captured valid request replayed until the API stops accepting it",
      "feedback": "Application replay resubmits a valid request - the server cannot tell the original from the copy, so it dutifully processes all of them. The defense is one-time tokens (nonces) and short token lifetimes. Next move: refund/void duplicates, invalidate the token, require idempotency keys on state-changing endpoints."
    },
    {
      "id": "EV-504",
      "rack": "application",
      "title": "Dispatcher suddenly an administrator",
      "source": "RBAC audit trail",
      "evidence": [
        {
          "label": "RBAC audit (m.reyes, dispatcher)",
          "lines": [
            "13:31  GET /admin/users (403)   13:34  GET /admin/users (200)",
            "13:36  POST /admin/users -> created account \"svc-report\" (admin)",
            "13:37  POST /admin/settings -> audit logging set to WARN-only",
            "Role check: m.reyes holds ONLY dispatcher role in HR system",
            "No approval ticket exists for the role change"
          ]
        }
      ],
      "family": "application",
      "type": "Privilege escalation",
      "keyIndicator": "Actions far above the assigned role, audit logging quietly lowered",
      "mitre": {
        "id": "T1078",
        "name": "Valid Accounts",
        "simplified": true
      },
      "feedback": "Privilege escalation means acting above your assigned level - here horizontal cheating becomes vertical takeover as a rogue admin account is born and the audit level is turned down to hide it. Next move: disable svc-report, restore audit logging, review how the admin path passed the 403 check."
    },
    {
      "id": "EV-505",
      "rack": "application",
      "title": "Session cookie signed by a dead key",
      "source": "Auth service audit",
      "evidence": [
        {
          "label": "Auth service log",
          "lines": [
            "JWT accepted with kid=dev-2019 (key retired 2024, never revoked)",
            "  claims: role=admin, exp=2030-01-01, aud=internal",
            "Client fingerprint: 203.0.113.133, no matching prior login",
            "Key vault: dev-2019 copied to a build artifact pushed publicly"
          ]
        }
      ],
      "family": "application",
      "type": "Forgery",
      "keyIndicator": "Token minted by the attacker with a leaked, never-revoked signing key",
      "mitre": {
        "id": "T1606",
        "name": "Forge Web Credentials",
        "simplified": true
      },
      "feedback": "Application forgery means the attacker mints their own credentials - here a self-signed admin JWT using a leaked dev key that was never revoked. If they can sign it, the server believes it. Next move: revoke the key, rotate signing keys, shorten claim lifetimes, purge build artifacts from public repos."
    },
    {
      "id": "EV-506",
      "rack": "application",
      "title": "Reports endpoint walking out of its webroot",
      "source": "WAF + file access logs",
      "evidence": [
        {
          "label": "WAF log (reports service)",
          "lines": [
            "GET /reports/show?file=../../../../../etc/passwd",
            "GET /reports/show?file=..%2f..%2f..%2fwindows\\repair\\sam  (encoded)",
            "Response 200 with non-report content (length 2,861 B)",
            "App log: resolved path outside webroot: /etc -> served raw"
          ]
        }
      ],
      "family": "application",
      "type": "Directory traversal",
      "keyIndicator": "Climbing out of the intended folder to read arbitrary server files",
      "feedback": "Directory traversal uses ../ (or its URL-encoded twins) to climb above the app's folder and read whatever the service account can - password files, configs, secrets. Encoded variants are built to slip naive filters. Next move: normalize + allow-list paths server-side, block traversal patterns at the WAF, rotate any exposed secrets."
    },
    {
      "id": "EV-601",
      "rack": "credential",
      "title": "One password tried everywhere at once",
      "source": "Identity provider logs",
      "evidence": [
        {
          "label": "IdP failed-auth summary (24 h)",
          "lines": [
            "2,410 failed logons across 380 distinct accounts",
            "  max 7 failures per account (stays under lockout threshold)",
            "Passwords tried: only 3 distinct values (\"Autumn2026!\", \"MFH2026\", \"welcome1\")",
            "Source: 41 rotating IPs in one hosting range 198.51.100.0/24",
            "Result: 30 accounts LOCKED OUT, 2 succeeded (weak shared passwords)"
          ]
        }
      ],
      "family": "credential",
      "type": "Password spraying",
      "keyIndicator": "Few passwords, many accounts - failures spread thin to dodge lockouts",
      "mitre": {
        "id": "T1110.003",
        "name": "Password Spraying"
      },
      "feedback": "Spraying flips brute force: one likely password against every account, so no single account trips its lockout. The statistical fingerprint is failures scattered across many accounts from one source range. Real-world echo: state-linked crews use exactly this (CISA AA20-301A). Next move: block the range, reset the 2 hit accounts, MFA + banned-password list."
    },
    {
      "id": "EV-602",
      "rack": "credential",
      "title": "Nineteen thousand guesses at one account",
      "source": "VPN gateway logs",
      "evidence": [
        {
          "label": "VPN gateway log",
          "lines": [
            "account svc_vpn: 19,437 failed attempts 01:00-04:40",
            "  password variation pattern: Autumn1, Autumn2 ... Autumn19437",
            "Single source 198.51.100.77; account NOT MFA-enrolled (exception)",
            "04:41  1 SUCCESS - VPN session opened, 340 MB pulled from fileshare"
          ]
        }
      ],
      "family": "credential",
      "type": "Brute force",
      "keyIndicator": "Systematic password variation against a single account until it cracks",
      "mitre": {
        "id": "T1110",
        "name": "Brute Force"
      },
      "feedback": "Brute force is the opposite shape of spraying: enormous volume against one account. It worked here only because the account had an MFA exception - a reminder that exceptions are attack surface. Next move: terminate the session, disable/reset svc_vpn, enforce MFA on every account with zero exceptions."
    },
    {
      "id": "EV-603",
      "rack": "credential",
      "title": "Login form answers faster for real usernames",
      "source": "Web server timing analysis",
      "evidence": [
        {
          "label": "Response timing (login endpoint)",
          "lines": [
            "POST /login x 500 probes, same password \"Test1234!\"",
            "  known-valid usernames: avg 182 ms, message \"invalid password\"",
            "  invented usernames:    avg 310 ms, message \"user not found\"",
            "Attacker harvested 118 confirmed usernames, then slowed to 1/min",
            "No lockouts, no failures on valid accounts - pure enumeration"
          ]
        }
      ],
      "family": "credential",
      "type": "User enumeration",
      "keyIndicator": "Timing / message differences that reveal which usernames exist",
      "mitre": {
        "id": "T1087",
        "name": "Account Discovery",
        "simplified": true
      },
      "feedback": "User enumeration is quiet reconnaissance: tiny response differences tell the attacker which usernames are real before any password guessing starts. It enables every credential attack that follows, so treat it as an early-warning sign. Next move: uniform responses and timing (constant-work pattern), alert on username-probing cadence."
    },
    {
      "id": "EV-604",
      "rack": "credential",
      "title": "One session, two continents, seven minutes",
      "source": "Identity provider + device telemetry",
      "evidence": [
        {
          "label": "Session telemetry (user d.laurent)",
          "lines": [
            "09:40  Session S-881 active from Rotterdam office (managed device)",
            "09:47  SAME session cookie presented from 203.0.113.44 (VPS)",
            "  device fingerprint completely different, no re-authentication",
            "09:52  Mailbox rule created: forward finance@ to hxxp inbox",
            "Rotterdam user confirms: no new device, never left the office"
          ]
        }
      ],
      "family": "credential",
      "type": "Credential replay",
      "keyIndicator": "Stolen session/cookie reused from a second location without re-auth",
      "mitre": {
        "id": "T1550",
        "name": "Use Alternate Authentication Material",
        "simplified": true
      },
      "feedback": "Replay attacks reuse captured credentials - here the session cookie, which is why there was no second login and no MFA prompt to stop it. \"Same session, two geographies\" is impossible travel and the strongest single signal you have. Next move: kill all sessions, reset credentials, require device binding and short session lifetimes."
    },
    {
      "id": "EV-605",
      "rack": "credential",
      "title": "Twenty-two pushes until somebody tapped Approve",
      "source": "MFA provider logs",
      "evidence": [
        {
          "label": "MFA provider log (user a.kovac, night manager)",
          "lines": [
            "01:58-02:20  22 push approvals sent (passwords already correct)",
            "02:21  1 approval accepted (device was asleep in employee's home)",
            "02:22  Login success from 203.0.113.201 - new country for user",
            "a.kovac: \"I kept declining, then I must have approved half-asleep.\""
          ]
        }
      ],
      "family": "credential",
      "type": "MFA bypass",
      "keyIndicator": "Push-notification flood (fatigue) until the victim approves themselves in",
      "mitre": {
        "id": "T1621",
        "name": "Multi-Factor Authentication Request Generation"
      },
      "feedback": "MFA fatigue attacks weaponize the human: correct passwords first, then push spam until a tired thumb approves. Note the anatomy - stolen password (credential attack) plus social pressure (social engineering) equals bypass. Next move: number-matching MFA, additional verification on repeated denies, investigate how the password was phished."
    },
    {
      "id": "EV-B01",
      "rack": "noise",
      "title": "\"96% CPU\" alert at 02:00 every night",
      "source": "Monitoring queue",
      "evidence": [
        {
          "label": "Monitoring alert + change record",
          "lines": [
            "Alert: SRV-HR01 96% CPU 02:00-02:40 nightly, flagged \"possible",
            "  cryptomining / excessive resource consumption\"",
            "Change record CHG-2201: nightly payroll backup job (approved)",
            "Job owner: infra team; runs on this exact schedule for 14 months",
            "No network egress during the window; no file renames; AV clean"
          ]
        }
      ],
      "family": "benign",
      "type": "Benign - scheduled backup",
      "keyIndicator": "Alert matches an approved change record and a long-stable schedule",
      "benign": {
        "rationale": "Matches approved change record CHG-2201 and a 14-month-stable schedule"
      },
      "feedback": "Not every loud alert is an attack - this is a scheduled backup that a naive rule mislabeled as cryptomining. The discipline that cleared it: match against change records, check egress and file activity, and then tune the alert rather than cry wolf every night."
    },
    {
      "id": "EV-B02",
      "rack": "noise",
      "title": "Break-room poster QR code flagged as quishing",
      "source": "Awareness report queue",
      "evidence": [
        {
          "label": "QR verification note",
          "lines": [
            "Report: \"QR poster in break room leads to login page - suspicious!\"",
            "QR resolves to mfh-benefits.example (corporate HR domain, managed cert)",
            "Comms ticket MKT-884: benefits enrollment campaign, poster approved",
            "Page is the real staff portal; no clone artifacts, cert valid"
          ]
        }
      ],
      "family": "benign",
      "type": "Benign - approved campaign",
      "keyIndicator": "Destination domain is corporate-managed and matches an approved campaign",
      "benign": {
        "rationale": "Destination is the managed HR domain and matches approved campaign MKT-884"
      },
      "feedback": "A vigilant employee reported this one - exactly what awareness training is for, so treat the report as a win even when it is a false positive. The verification habit: resolve the QR, check the domain against managed assets and campaign tickets. Praise the reporter, then tune the triage playbook."
    },
    {
      "id": "EV-B03",
      "rack": "noise",
      "title": "Encoded PowerShell from the ops admin",
      "source": "EDR queue",
      "evidence": [
        {
          "label": "EDR alert note",
          "lines": [
            "Alert: powershell.exe -nop -enc <base64> by account svc-opsadmin",
            "Flagged \"fileless malware - office spawning PowerShell\"",
            "Decoded script matches runbook KB-1129 cleanup steps verbatim",
            "Executed 23:40 inside approved maintenance window WIN-11-09",
            "Account signed in from the admin jump host, badge present"
          ]
        }
      ],
      "family": "benign",
      "type": "Benign - documented runbook",
      "keyIndicator": "Command matches a published runbook inside an approved maintenance window",
      "benign": {
        "rationale": "Matches runbook KB-1129 executed in approved maintenance window WIN-11-09"
      },
      "feedback": "The same artifact chain that signals fileless malware (encoded PowerShell) is also how admins work - context is everything. It cleared because three independent checks agreed: runbook match, maintenance window, jump-host provenance. Document those checks so the next analyst clears it in one minute, not thirty."
    }
  ],
  "EVIDENCE_BY_ID": {
    "EV-101": {
      "id": "EV-101",
      "rack": "malware",
      "title": "File server: encrypted shares + ransom note",
      "source": "EDR + file integrity monitor",
      "evidence": [
        {
          "label": "FIM alert bundle (MFH-FILE01)",
          "lines": [
            "2026-11-09 02:14  847 files renamed *.mfh.locked on \\\\MFH-FILE01\\ops",
            "2026-11-09 02:15  README_RESTORE.txt dropped in every share:",
            "  \"Your files are encrypted. Pay 0.7 BTC to wallet bc1q... in 72h",
            "   or keys are destroyed. Do not contact police.\"",
            "2026-11-09 02:16  Process vssadmin.exe delete shadows /all /quiet",
            "2026-11-09 02:16  Avg file entropy jumped 4.1 -> 7.9 bits/byte",
            "2026-11-09 02:17  Windows Defender service set to DISABLED"
          ]
        }
      ],
      "family": "malware",
      "type": "Ransomware",
      "keyIndicator": "Mass rename to .mfh.locked + ransom note + shadow copies deleted",
      "mitre": {
        "id": "T1486",
        "name": "Data Encrypted for Impact"
      },
      "feedback": "Ransomware announces itself loudly: mass file renames, a ransom note, deleted shadow copies (which erase easy recovery), and entropy spikes from encryption. Real-world echo: DarkSide disrupted Colonial Pipeline in May 2021. Next defender move: isolate the host, preserve evidence, restore from offline backups."
    },
    "EV-102": {
      "id": "EV-102",
      "rack": "malware",
      "title": "Workstation beaconing after \"free\" freight app",
      "source": "EDR + proxy logs",
      "evidence": [
        {
          "label": "Proxy log (host WRK-0432)",
          "lines": [
            "2026-11-08 22:00  GET https://towlink-update.example/pack.bin  (443)",
            "2026-11-08 23:00  GET https://towlink-update.example/pack.bin  (443)",
            "2026-11-09 00:00  GET https://towlink-update.example/pack.bin  (443)",
            "  -> identical request every hour, exact same URL and size 12,440 B",
            "2026-11-08 21:40  User installed ParcelTrackPro_setup.exe (freeware)",
            "EDR: ParcelTrackPro.exe signed with expired cert, spawns cmd.exe"
          ]
        }
      ],
      "family": "malware",
      "type": "Trojan",
      "keyIndicator": "Useful-looking app that beacons hourly to a C2 domain",
      "mitre": {
        "id": "T1071",
        "name": "Application Layer Protocol (beaconing)",
        "simplified": true
      },
      "feedback": "A trojan is honest-looking software with a dishonest payload. The signature here is periodic beaconing: identical outbound requests on a metronome schedule. Real-world echo: many trojans ride free utilities and cracked tools. Next move: block the domain, reimage the host, hunt the same hash fleet-wide."
    },
    "EV-103": {
      "id": "EV-103",
      "rack": "malware",
      "title": "SMB sweep moving host to host",
      "source": "NetFlow + EDR fleet view",
      "evidence": [
        {
          "label": "NetFlow summary (VLAN 12)",
          "lines": [
            "02:31  WRK-0432 -> sequential SMB (445) probes 10.12.0.1-50",
            "02:38  10.12.0.17 -> sequential SMB probes 10.12.0.51-90",
            "02:44  10.12.0.51 -> sequential SMB probes 10.12.0.91-120",
            "  -> 40 hosts infected in 22 min, each starts the same sweep",
            "EDR on each new host: task \"svc-sync\" created, points to \\\\neighbor\\sync.dll"
          ]
        }
      ],
      "family": "malware",
      "type": "Worm",
      "keyIndicator": "Self-propagating sequential scans, each victim becomes the next scanner",
      "mitre": {
        "id": "T1210",
        "name": "Exploitation of Remote Services",
        "simplified": true
      },
      "feedback": "A worm needs no human to click - it copies itself across the network. The tell is a moving wave: sequential scans, then the victim repeats the pattern. Next move: segment VLANs and patch the remote service; worms die when lateral paths are cut."
    },
    "EV-104": {
      "id": "EV-104",
      "rack": "malware",
      "title": "Browser extension watching every form",
      "source": "EDR + extension audit",
      "evidence": [
        {
          "label": "Extension audit (host WRK-0198)",
          "lines": [
            "Extension \"ShipDealz Coupon Finder\" - 4 permissions requested:",
            "  Read and change all data on all sites; capture screen content",
            "Local storage dump: 612 entries of typed text incl. form fields",
            "  \"user=m.reyes pass=******** otp=448201\" (stored plaintext)",
            "Hourly upload of 40-80 KB to stats.shipdealz-cdn.example"
          ]
        }
      ],
      "family": "malware",
      "type": "Spyware",
      "keyIndicator": "Covert collection of user input and screen content, quietly uploaded",
      "mitre": {
        "id": "T1113",
        "name": "Screen Capture",
        "simplified": true
      },
      "feedback": "Spyware silently collects - keystrokes, screens, browsing - while the machine looks normal. Evidence is the harvested data itself, often sitting in plaintext before upload. Next move: remove the extension, rotate every credential typed on that host, and alert the affected user."
    },
    "EV-105": {
      "id": "EV-105",
      "rack": "malware",
      "title": "Barcode tool that hijacked the browser",
      "source": "Helpdesk ticket bundle",
      "evidence": [
        {
          "label": "Helpdesk ticket HD-3302",
          "lines": [
            "Reporter: dock clerk, terminals WRK-0771..0774",
            "\"Search engine switched to find-fast-cargo.example, 9 pop-up ads",
            " per page, toolbar \"QuickScan Deals\" appeared after installing",
            " the free barcode label maker from a forum link.\"",
            "No files encrypted, no data theft observed, ads on every search."
          ]
        }
      ],
      "family": "malware",
      "type": "Adware",
      "keyIndicator": "Annoyance-grade browser hijack and ad injection, no covert goal",
      "feedback": "Adware is the low-severity cousin: it hijacks search, injects ads, and resists removal, but does not steal data by design. It still matters - it often arrives through the same sloppy channels malware uses. Next move: uninstall via the browser reset path and patch the download habit."
    },
    "EV-106": {
      "id": "EV-106",
      "rack": "malware",
      "title": "Executables modified after USB transfer",
      "source": "File integrity monitor",
      "evidence": [
        {
          "label": "FIM diff (host WRK-0315)",
          "lines": [
            "2026-11-09 15:47  USB mass storage connected (personal drive)",
            "2026-11-09 15:52  14 .exe files modified, hashes changed:",
            "  sha256 5d41...9e0b -> 8f27...c4d1 (tools\\labelprint.exe)",
            "  sha256 a0c3...7712 -> 1b98...44af (tools\\manifest.exe)",
            "Hosts sharing the same USB stick show identical new hashes"
          ]
        }
      ],
      "family": "malware",
      "type": "Virus",
      "keyIndicator": "Existing host files infected and hash-changed, spreading via shared media",
      "mitre": {
        "id": "T1204.002",
        "name": "User Execution: Malicious File",
        "simplified": true
      },
      "feedback": "A classic virus attaches itself to legitimate host files and spreads when those files or the media carrying them travel. The fingerprint is hash changes on existing binaries plus a common source device. Next move: quarantine the affected files, restore clean versions, ban unknown USB media."
    },
    "EV-107": {
      "id": "EV-107",
      "rack": "malware",
      "title": "Processes invisible to the OS, driver from %TEMP%",
      "source": "EDR kernel view + live response",
      "evidence": [
        {
          "label": "Live response capture (SRV-DC01)",
          "lines": [
            "Task Manager / Process list: 128 processes",
            "EDR kernel telemetry: 131 processes - 3 are hidden (ssmart.exe x3)",
            "Driver fsantiv.sys loaded from C:\\Windows\\Temp\\ -> runs at ring 0",
            "Defender service + EDR sensor stopped 2026-11-09 03:02",
            "Event log: Security.evtx truncated at 03:11 (entries removed)",
            "Boot sector: unsigned module chained before winload.exe"
          ]
        }
      ],
      "family": "malware",
      "type": "Rootkit",
      "keyIndicator": "Kernel-mode hiding, sensor tampering, pre-OS boot module",
      "mitre": {
        "id": "T1014",
        "name": "Rootkit"
      },
      "feedback": "A rootkit hides below the OS and can hollow out your defenses - here it also disabled the sensor and trimmed the event log (log manipulation). The mismatch between what the OS reports and what kernel telemetry sees is the giveaway. Next move: capture memory, then rebuild the host from clean media; trust nothing on disk."
    },
    "EV-108": {
      "id": "EV-108",
      "rack": "malware",
      "title": "Keystroke capture on the dispatcher terminal",
      "source": "EDR + scheduled task audit",
      "evidence": [
        {
          "label": "EDR process tree (WRK-0209)",
          "lines": [
            "kbdhelper.exe (unsigned) loaded by accessibility hook, persists via task",
            "Buffer file C:\\ProgramData\\kb\\buf.dat grows with every keystroke",
            "  sample: \"ops4472  ############4482  cvc 114\"",
            "buf.dat uploaded 02:00 daily to towlink-update.example/in/"
          ]
        }
      ],
      "family": "malware",
      "type": "Keylogger",
      "keyIndicator": "Keystroke buffer with credentials/card data exfiltrated to C2",
      "mitre": {
        "id": "T1056.001",
        "name": "Input Capture: Keylogging"
      },
      "feedback": "Keyloggers harvest exactly what you type - the buffer file with card numbers and OTPs is the smoking gun. Note the overlap with credential attacks: the capture is malware, the use of the stolen OTP would show up in identity logs. Next move: kill the process, purge the task, rotate everything typed there."
    },
    "EV-109": {
      "id": "EV-109",
      "rack": "malware",
      "title": "Payroll records wiped by a \"sleeping\" task",
      "source": "DB audit + task scheduler log",
      "evidence": [
        {
          "label": "Task scheduler + DB audit (SRV-HR01)",
          "lines": [
            "2026-11-09 02:00  Task \"PayDataHousekeeping\" ran (created 2026-03-12)",
            "Script comment found in source: ",
            "  '# trigger: when record id TEMP-CONTRACTOR-88 is deleted, purge pay tables'",
            "2026-11-09 01:58  TEMP-CONTRACTOR-88 removed from HR system",
            "2026-11-09 02:00  11,204 payroll rows deleted - no manual session"
          ]
        }
      ],
      "family": "malware",
      "type": "Logic bomb",
      "keyIndicator": "Code that lay dormant until a precise data condition fired it",
      "mitre": {
        "id": "T1053.005",
        "name": "Scheduled Task/Job",
        "simplified": true
      },
      "feedback": "A logic bomb is sabotage on a timer: harmless code waiting for a trigger such as a date or a data condition. The classic documented pattern is the insider whose sabotage job fires the moment their own access is removed. Next move: review all scheduled jobs for trigger conditions, restore rows from backup, tighten change review on automation."
    },
    "EV-110": {
      "id": "EV-110",
      "rack": "malware",
      "title": "Word document summoning PowerShell",
      "source": "EDR process tree",
      "evidence": [
        {
          "label": "Process tree (host WRK-0560)",
          "lines": [
            "WINWORD.EXE -> cmd.exe -> powershell.exe -nop -w hidden -enc <base64>",
            "Decoded: downloads from 203.0.113.88, runs fully in memory",
            "No matching binary on disk; parent-child chain is the only artifact",
            "Persistence: WMI event subscription \"Filter: __EventFilter[WSB]\""
          ]
        }
      ],
      "family": "malware",
      "type": "Fileless malware",
      "keyIndicator": "Payload lives in memory via trusted tools, nothing lands on disk",
      "mitre": {
        "id": "T1059.001",
        "name": "Command and Scripting Interpreter: PowerShell"
      },
      "feedback": "Fileless malware never writes a file, so file-based scanners see nothing - the artifact is the suspicious parent-child chain (Word to PowerShell) and WMI persistence. Next move: alert on office apps spawning script interpreters, capture memory, block the payload URL."
    },
    "EV-201": {
      "id": "EV-201",
      "rack": "physical",
      "title": "Camera: two people in, one badge swipe",
      "source": "Dock door camera + badge log",
      "evidence": [
        {
          "label": "Dock 3 camera + access log",
          "lines": [
            "2026-11-10 18:42  Badge 2210 (T. Okafor) swipe, door open 9s",
            "Camera: T. Okafor enters; second person in high-vis follows",
            "  through the closing door carrying a technician toolbox",
            "Badge log: exactly ONE authentication for that 9s window",
            "Visitor log: no contractor scheduled at Dock 3 that evening"
          ]
        }
      ],
      "family": "physical",
      "type": "Tailgating",
      "keyIndicator": "One badge authentication, two people entering",
      "feedback": "Tailgating is riding an authorized person through a controlled door. The badge log and camera disagree - that mismatch is the indicator. Real-world echo: pentests routinely get in this way, toolbox included. Next move: security awareness (\"no badge, no entry\"), door etiquette training, and mantrap turnstiles at critical doors."
    },
    "EV-202": {
      "id": "EV-202",
      "rack": "physical",
      "title": "Visitor filming the dispatch console",
      "source": "Dispatch floor observation report",
      "evidence": [
        {
          "label": "Observation report (supervisor, 2026-11-10)",
          "lines": [
            "Visitor with vendor lanyard positioned behind dispatcher station",
            "Phone raised, recording over the shoulder of D. Marsh for ~4 min",
            "D. Marsh was entering MFA code + customer billing details",
            "Visitor left before escort arrived; badge check shows expired pass"
          ]
        }
      ],
      "family": "physical",
      "type": "Shoulder surfing",
      "keyIndicator": "Direct observation of secrets being typed, phone camera aimed at screen",
      "feedback": "Shoulder surfing needs no tooling - eyes or a phone camera over a victim's shoulder capture passwords, MFA codes and screens. The tell is the positioning and the reaction when noticed. Next move: rotate exposed credentials, privacy filters on displays, and an escort policy for visitors."
    },
    "EV-203": {
      "id": "EV-203",
      "rack": "physical",
      "title": "One badge, two cities, four minutes apart",
      "source": "Physical access control system",
      "evidence": [
        {
          "label": "PACS extract (badge 4491 - S. Byrne)",
          "lines": [
            "2026-11-10 07:58  Newhaven Gate A - granted (staff entrance)",
            "2026-11-10 08:02  Dover Annex turnstile - granted (38 km away)",
            "Both reads: same badge serial, different door controllers",
            "S. Byrne (interview): at Newhaven all morning, badge on lanyard",
            "2026-11-09 23:10  Badge 4491 briefly left unattended at desk (CCTV)"
          ]
        }
      ],
      "family": "physical",
      "type": "Skimming",
      "keyIndicator": "Clone badge read at an impossible distance from the original",
      "feedback": "Skimming copies the credential itself - the attacker (or a cheap reader) harvests the card and clones it, so the clone walks while the human stays put. This is \"impossible travel\" in badge form, and the unattended-badge window is the theft point. Next move: issue duplicate-read alerts, immediately deactivate and re-issue badge 4491."
    },
    "EV-204": {
      "id": "EV-204",
      "rack": "physical",
      "title": "Server room door: pry marks and a scratched lock",
      "source": "Facilities inspection",
      "evidence": [
        {
          "label": "Inspection report (2026-11-10 06:30)",
          "lines": [
            "Server room 2 door: lock cylinder shows fresh score marks",
            "Frame: pry tool marks, 4 mm separation, door contact sensor bypassed",
            "Alarm panel log: zone 12 \"bypassed\" 2026-11-10 01:12 (no ticket)",
            "Nothing obviously missing yet; tape residue near rack cable tray"
          ]
        }
      ],
      "family": "physical",
      "type": "Forced entry",
      "keyIndicator": "Physical damage to door/lock plus an unexplained alarm bypass",
      "feedback": "Forced entry is the blunt instrument of physical attacks: pry marks, damaged locks - and, in a smarter variant, an alarm bypass staged first. Check what the attacker was reaching for (cabling, consoles, media). Next move: review CCTV for the window, repair and re-key, remove the ability to bypass zones without dual approval."
    },
    "EV-301": {
      "id": "EV-301",
      "rack": "network",
      "title": "Portal unreachable under a UDP avalanche",
      "source": "NetFlow + ISP scrubbing report",
      "evidence": [
        {
          "label": "Edge flow summary",
          "lines": [
            "2026-11-09 04:10  Inbound 3.2 Gbps UDP to portal.mfhlogistics.example:123",
            "  12,400+ distinct source IPs across 60+ countries",
            "  payloads look like monlist NTP responses (amplification x 500)",
            "04:10-05:35  Booking portal times out for all customers",
            "05:35  ISP scrubbing activated, traffic drops to 180 Mbps baseline"
          ]
        }
      ],
      "family": "network",
      "type": "Distributed denial of service (DDoS)",
      "keyIndicator": "Volumetric flood from thousands of sources, service unavailable",
      "mitre": {
        "id": "T1498.002",
        "name": "Network DoS: Reflection Amplification"
      },
      "feedback": "DDoS drowns availability, and the amplified variant uses third-party servers to multiply the flood (here: NTP monlist). Thousands of sources, one victim, a clean cliff-edge of unavailability. Next move: ISP scrubbing / anycast filtering, rate limits, and an tested runbook - you buy protection before the flood, not during it."
    },
    "EV-302": {
      "id": "EV-302",
      "rack": "network",
      "title": "Handshakes silently retreating to SSLv3",
      "source": "TLS inspection proxy",
      "evidence": [
        {
          "label": "TLS handshake log (partner gateway)",
          "lines": [
            "Baseline: partners.mfhlogistics.example negotiates TLS 1.3 (100%)",
            "2026-11-09 22:40  412 sessions renegotiate to SSLv3 / TLS 1.0",
            "  all 412 from 203.0.113.71 after ServerHello flood pattern",
            "Cipher in downgraded sessions: RC4-SHA (weak, considered broken)",
            "22:41  Two sessions carry plaintext-auth POP3 pattern"
          ]
        }
      ],
      "family": "network",
      "type": "Protocol downgrade",
      "keyIndicator": "Negotiations forced down to broken protocols and ciphers",
      "feedback": "A downgrade attack pushes modern clients onto old, broken protocol versions so the attacker can exploit them (POODLE-style). The indicator is a fleet of sessions suddenly agreeing on SSLv3 with a cipher nobody should offer. Next move: disable SSLv3/TLS1.0 server-side, alert on negotiated-version anomalies, patch the gateway."
    },
    "EV-303": {
      "id": "EV-303",
      "rack": "network",
      "title": "\"Free crew Wi-Fi\" that the company never built",
      "source": "Wireless controller",
      "evidence": [
        {
          "label": "WLAN controller alert (Warehouse B)",
          "lines": [
            "2026-11-10 08:14  New SSID detected: \"MFH-Crew-Free\" (open)",
            "  BSSID 9e:31:f0:22:1a:07 - not in approved AP inventory",
            "Signal strength 2x stronger than the real corporate AP nearby",
            "14 phones auto-joined (same SSID as corporate guest network)",
            "Rogue DHCP leases default gw 10.9.4.66 (unregistered device)"
          ]
        }
      ],
      "family": "network",
      "type": "Rogue access point",
      "keyIndicator": "Stronger unmanaged twin of a known SSID, clients auto-joining",
      "mitre": {
        "id": "T1557",
        "name": "Adversary-in-the-Middle",
        "simplified": true
      },
      "feedback": "A rogue AP (evil twin) out-shouts the legitimate one and harvests whatever the joiners send. Devices that auto-join a familiar SSID are the victims, and the rogue DHCP gateway hands the attacker all their traffic. Next move: deauth and physically locate the device, 802.1X for corporate, certificate-pinned VPN for mobile crews."
    },
    "EV-304": {
      "id": "EV-304",
      "rack": "network",
      "title": "NIC in promiscuous mode with a capture file",
      "source": "Endpoint config audit",
      "evidence": [
        {
          "label": "Endpoint audit (host WRK-0880)",
          "lines": [
            "Dispatch VLAN NIC switched to promiscuous mode 2026-11-09 21:00",
            "C:\\Users\\svc-backup\\pcaps\\cap-night.pcap - 1.9 GB",
            "  contains FTP session: USER opsftp PASS Fr8gh0st2019 (cleartext)",
            "Port-mirror config on switch SW-12 added by unknown session 20:40"
          ]
        }
      ],
      "family": "network",
      "type": "Sniffing",
      "keyIndicator": "Promiscuous capture harvesting cleartext credentials in transit",
      "mitre": {
        "id": "T1040",
        "name": "Network Sniffing"
      },
      "feedback": "Sniffing is passive collection: the attacker watches traffic and, on networks that still speak cleartext protocols, passwords fall out for free. The captured FTP creds now count as compromised. Next move: rotate the FTP credential, kill cleartext protocols, lock switch port-mirroring down."
    },
    "EV-305": {
      "id": "EV-305",
      "rack": "network",
      "title": "Printer subnet suddenly talks SMB",
      "source": "Router ACL + firewall logs",
      "evidence": [
        {
          "label": "Firewall log extract",
          "lines": [
            "2026-11-09 23:55  src 10.4.30.12 (label-printer-2, camera subnet)",
            "  -> SMB 445 to 31 hosts; printers do not run SMB",
            "Router ARP: 10.4.30.12 answered from two different MAC addresses",
            "MAC 00:1b:44:11:3a:b7 (unregistered) claims the printer IP"
          ]
        }
      ],
      "family": "network",
      "type": "Spoofing",
      "keyIndicator": "Traffic wearing a trusted device's identity (IP/MAC impersonation)",
      "feedback": "Spoofing forges identity - here a device claims the printer's IP/MAC so its traffic inherits the printer's trust. Two MACs answering for one IP is the giveaway. Next move: hunt the unregistered MAC, dynamic ARP inspection + DHCP snooping, and drop \"trusted subnet\" assumptions at the firewall."
    },
    "EV-306": {
      "id": "EV-306",
      "rack": "network",
      "title": "Intranet cert warnings and a gateway that moved",
      "source": "Client reports + ARP audit",
      "evidence": [
        {
          "label": "Helpdesk cluster + host audit",
          "lines": [
            "9 users: \"intranet shows certificate warning - issued by",
            "  MFH-Int-CA v2\" (real CA is MFH-Root-CA v4, different fingerprint)",
            "ARP caches on 6 hosts: 10.4.0.1 (gateway) maps to one new MAC",
            "  aa:bb:cc:dd:ee:ff - matches nothing in the CMDB",
            "Traffic to intranet is being relayed through 10.4.0.250"
          ]
        }
      ],
      "family": "network",
      "type": "On-path attack",
      "keyIndicator": "Attacker relaying traffic between victim and gateway (ARP poison + fake cert)",
      "mitre": {
        "id": "T1557",
        "name": "Adversary-in-the-Middle"
      },
      "feedback": "An on-path (man-in-the-middle) attack inserts itself into a connection: ARP cache poisoning steers traffic to the attacker, whose fake certificate triggers the browser warning. Trust the warning - it is doing its job. Next move: flush ARP caches, isolate 10.4.0.250, dynamic ARP inspection, and never click through cert errors."
    },
    "EV-307": {
      "id": "EV-307",
      "rack": "network",
      "title": "Company domain now points at unknown nameservers",
      "source": "DNS registrar audit",
      "evidence": [
        {
          "label": "Registrar change history (mfhlogistics.example)",
          "lines": [
            "2026-11-09 03:40  NS records changed to ns1/ns2.cargodrop.example",
            "  registrar account accessed from 198.51.100.190 (new country)",
            "www + mail records resolve to 203.0.113.140 (unknown host)",
            "Customers report fake \"delivery fee\" page on the real domain"
          ]
        }
      ],
      "family": "network",
      "type": "DNS hijacking",
      "keyIndicator": "Authoritative records silently redirected at the registrar",
      "feedback": "DNS hijacking re-points where the whole world finds you - here at the registrar level, which outranks every local fix. Phishing on your own real domain follows. Next move: recover the registrar account, set registry lock, enforce DNSSEC, and audit admin e-mail for the reset trail."
    },
    "EV-308": {
      "id": "EV-308",
      "rack": "network",
      "title": "Branch resolver answers wrong IP for partner",
      "source": "DNS resolver monitoring",
      "evidence": [
        {
          "label": "Resolver diff (branch BR-07)",
          "lines": [
            "fleettrack.example -> 203.0.113.99 at BR-07 resolver",
            "fleettrack.example -> 198.51.100.20 at HQ resolver (correct)",
            "Only branch staff see the wrong page: \"driver portal - relogin\"",
            "203.0.113.99 serves a credential page cloned from fleettrack",
            "Resolver cache entry TTL renewed repeatedly from spoofed replies"
          ]
        }
      ],
      "family": "network",
      "type": "Cache poisoning",
      "keyIndicator": "One resolver serves a poisoned answer while others stay correct",
      "feedback": "Cache poisoning corrupts one resolver's memory: everyone asking THAT resolver gets the attacker's IP while the rest of the world resolves correctly - a perfect differential test. Next move: flush the poisoned records, patch/validate the resolver (DNSSEC, random source ports), and reset creds entered at the fake page."
    },
    "EV-401": {
      "id": "EV-401",
      "rack": "social",
      "title": "Delivery-fee blast to 900 staff",
      "source": "Mail gateway",
      "evidence": [
        {
          "label": "Mail gateway report",
          "lines": [
            "From: MFH Parcel Desk <no-reply@mfh-parcel-fee.example>",
            "Subject: \"Action required: your delivery fee 0.99 EUR unpaid\"",
            "Sent to 900+ recipients (every mailbox with an \"m.\" prefix)",
            "Link: hxxps://mfh-parcel-fee.example/pay  -> credential page clone",
            "Same blast text for all recipients; no personal details at all"
          ]
        }
      ],
      "family": "social",
      "type": "Phishing",
      "keyIndicator": "Mass, untargeted lure harvesting credentials on a cloned page",
      "mitre": {
        "id": "T1566",
        "name": "Phishing"
      },
      "feedback": "Phishing is the volume play: one generic lure to hundreds of mailboxes, fishing for whoever bites. The clues are scale, genericity and the cloned payment page. Next move: purge the message, block the domain, and use it as tomorrow's awareness example - it is a perfect specimen."
    },
    "EV-402": {
      "id": "EV-402",
      "rack": "social",
      "title": "Route-audit email that knows your week",
      "source": "Mail gateway + sandbox",
      "evidence": [
        {
          "label": "Mail analysis (target: fleet manager)",
          "lines": [
            "From: \"Logistics Auditing Group\" <audit@fleetreview-group.example>",
            "Subject: Re: the Williamsport route audit you flagged Friday",
            "Body references real internal project names and 2 colleague names",
            "Attachment: RouteAudit_Q3.pdf.exe (PDF icon, double extension)",
            "Sandbox: sha256 4e1f...b209, drops C2 beacon to 198.51.100.44:8443"
          ]
        }
      ],
      "family": "social",
      "type": "Spear phishing",
      "keyIndicator": "Targeted lure with researched personal context + weaponized attachment",
      "mitre": {
        "id": "T1566.001",
        "name": "Phishing: Spearphishing Attachment"
      },
      "feedback": "Spear phishing spends research before sending: your projects, your colleagues, your calendar. The context builds trust; the double-extension attachment cashes it in. Real-world echo: APT-style crews almost always start this way. Next move: never run it, detonate in sandbox, brief the named colleagues they researched."
    },
    "EV-403": {
      "id": "EV-403",
      "rack": "social",
      "title": "\"Urgent wire\" aimed at the CFO",
      "source": "Mail gateway + finance report",
      "evidence": [
        {
          "label": "Message analysis",
          "lines": [
            "From: \"M. Castellanos, Counsel\" <m.castellanos@mfhlegal.example>",
            "  (one letter off: real counsel domain is mfh-legal.example)",
            "To: CFO only. \"Board-sensitive acquisition wire, confirm by 17:00.\"",
            "Thread: reply-to differs from sender; header shows spoofed display name",
            "Finance note: request skips every approved payment procedure"
          ]
        }
      ],
      "family": "social",
      "type": "Whaling",
      "keyIndicator": "High-value executive target, lookalike domain, urgency + authority",
      "mitre": {
        "id": "T1566",
        "name": "Phishing (BEC variant)",
        "simplified": true
      },
      "feedback": "Whaling is spear phishing aimed at the biggest fish - executives with payment authority. The lookalike domain and the \"skip the procedure\" pressure are classic business-email-compromise tells. Real-world echo: the 2024 Arup case lost ~25M USD largely through authority pressure. Next move: out-of-band callback on a known number, hard dual-approval for wires."
    },
    "EV-404": {
      "id": "EV-404",
      "rack": "social",
      "title": "Route-app SMS to every driver",
      "source": "Mobile device management report",
      "evidence": [
        {
          "label": "SMS copy (driver phones)",
          "lines": [
            "MFH Dispatch: your route app cert expired today. Renew now:",
            "  mfh-dispatch.info/renew  (login with company credentials)",
            "Sent to 214 driver numbers between 06:30-06:34",
            "mfh-dispatch.info registered 4 days ago, privacy-protected owner"
          ]
        }
      ],
      "family": "social",
      "type": "Smishing",
      "keyIndicator": "Mass SMS lure to a freshly registered lookalike domain",
      "mitre": {
        "id": "T1566",
        "name": "Phishing (SMS channel)",
        "simplified": true
      },
      "feedback": "Smishing moves the lure to SMS, exploiting the tiny screen and the trust we grant text messages. Fresh registration + credential demand = fake. Next move: block the domain fleet-wide via MDM, warn drivers in the dispatch channel they actually use, and never authenticate from a text link."
    },
    "EV-405": {
      "id": "EV-405",
      "rack": "social",
      "title": "Helpdesk call asking to \"read back the code\"",
      "source": "Phone system recording",
      "evidence": [
        {
          "label": "Call transcript (14:22, dispatcher line)",
          "lines": [
            "Caller: \"Service desk here - we're re-syncing your route app.",
            "  I just sent a push. Read me the 6-digit code to finish.\"",
            "Caller ID displays internal IT extension 4-2200 (spoofed)",
            "Dispatcher reads code 448201; session flags: new device, new country",
            "IT confirms: no sync campaign running; 4-2200 was not in use"
          ]
        }
      ],
      "family": "social",
      "type": "Vishing",
      "keyIndicator": "Voice lure harvesting a live MFA code, caller ID spoofed",
      "feedback": "Vishing is phishing by phone - the strongest channel for urgency, because a human voice presses all our cooperation buttons. The harvested code plus a \"new device, new country\" session is full account takeover in motion. Next move: freeze the session, train the rule \"we never ask for codes\", make caller ID worthless by verifying via directory."
    },
    "EV-406": {
      "id": "EV-406",
      "rack": "social",
      "title": "Sticker pasted over the cafeteria menu QR",
      "source": "Facilities + QR audit",
      "evidence": [
        {
          "label": "QR scan analysis",
          "lines": [
            "Poster: \"Scan for this week's menu\" - QR was overlaid with sticker",
            "Sticker QR resolves to mfh-menu-secure.example/login (new domain)",
            "Page: pixel-perfect clone of the staff portal login",
            "2 employees entered credentials 11:40-11:52 before report at 11:58"
          ]
        }
      ],
      "family": "social",
      "type": "Quishing",
      "keyIndicator": "Swapped physical QR code steering scanners to a cloned login",
      "feedback": "Quishing weaponizes the QR code: a sticker swap turns a trusted physical object into a phishing lure, and phones hide the URL that a browser would show. Two victims before anyone looked closely. Next move: reset the two accounts, remove the sticker, print QRs with short unique URLs and verify-destination training."
    },
    "EV-407": {
      "id": "EV-407",
      "rack": "social",
      "title": "\"Alex from IT\" with a toolbox and no vendor record",
      "source": "Front desk + visitor system",
      "evidence": [
        {
          "label": "Visitor system extract",
          "lines": [
            "2026-11-10 09:15  Self-registered: \"Alex - IT contractor\"",
            "Wore generic hi-vis + IT-brand polo; carried laptop bag + badge reader",
            "Asked floor manager to \"swipe him through\" to the comms room",
            "No vendor ID, no work order, no escort assigned",
            "Left when front desk started verification calls"
          ]
        }
      ],
      "family": "social",
      "type": "Impersonation",
      "keyIndicator": "Invented role + borrowed props, collapses under verification",
      "mitre": {
        "id": "T1684.001",
        "name": "Social Engineering: Impersonation"
      },
      "feedback": "Impersonation is confidence in a costume: a plausible role, the right clothes, and a person too busy to check. It collapses the moment someone verifies against a registry - which is the lesson. Next move: escort + call-back policy for every \"contractor\", and thank the floor manager who paused."
    },
    "EV-408": {
      "id": "EV-408",
      "rack": "social",
      "title": "Ops director on video approves a data export",
      "source": "Collab platform + HR calendar",
      "evidence": [
        {
          "label": "Incident summary",
          "lines": [
            "17:40  Video-call request \"R. Vance (Ops Director)\" - voice+video",
            "  face/voice match public conference recordings of the director",
            "  slight lip-sync drift at sentence starts; background static",
            "Grants after-hours export of the customer manifest database",
            "HR calendar: R. Vance on leave all week, replied from official mail:",
            "  \"Not me. Not my voice. I never joined any call.\""
          ]
        }
      ],
      "family": "social",
      "type": "Deepfake",
      "keyIndicator": "Synthesized face/voice of a real leader authorizing access",
      "feedback": "Deepfakes clone identity itself - face and voice pulled from public footage, convincing enough to authorize a data export. Real-world echo: the 2024 Hong Kong Arup video-call fraud. The shield is process, not perception: out-of-band verification through known channels for every sensitive approval. Next move: revoke the export, verify via a second channel, add \"assume synthetic\" to executive approval policy."
    },
    "EV-501": {
      "id": "EV-501",
      "rack": "application",
      "title": "Tracking form returns a database error",
      "source": "WAF + app logs",
      "evidence": [
        {
          "label": "WAF log (tracking portal)",
          "lines": [
            "2026-11-09 13:07  GET /track?ref=AX1029' UNION SELECT cc_number,",
            "  card_exp FROM payments--   (419: SQL syntax error in response)",
            "13:09  Same payload with table names payments.cards, users.password",
            "13:11  Response dump includes: \"unknown column cc_number in users\"",
            "Client 203.0.113.62 probing schema, ~6 req/min (slow, deliberate)"
          ]
        }
      ],
      "family": "application",
      "type": "Injection",
      "keyIndicator": "Input turning into SQL - errors leak schema, payloads target payment data",
      "mitre": {
        "id": "T1190",
        "name": "Exploit Public-Facing Application",
        "simplified": true
      },
      "feedback": "Injection (SQLi here) sends data that the server executes as code; the error messages then hand the attacker the database schema. Untrusted input + verbose errors = free reconnaissance. Next move: parameterized queries, WAF rule, and stop leaking SQL errors to clients."
    },
    "EV-502": {
      "id": "EV-502",
      "rack": "application",
      "title": "Legacy parser crashes on oversized input",
      "source": "Application crash dumps",
      "evidence": [
        {
          "label": "Crash summary (manifest parser, port 9100)",
          "lines": [
            "2026-11-09 16:22  STATUS_ACCESS_VIOLATION 0xC0000005",
            "  input length 2,048 B (buffer declared 512 B) - stack smashed",
            "  return address overwritten with 0x41414141 (\"AAAA\")",
            "Parser restarted automatically each time; no alerts fired",
            "Same source IP sent 11 crashes in 20 minutes (fuzzing pattern)"
          ]
        }
      ],
      "family": "application",
      "type": "Buffer overflow",
      "keyIndicator": "Oversized input overwriting memory - crash pattern used to plant code",
      "feedback": "Buffer overflows write past a fixed boundary and can turn a crash into code execution. Even when it \"just\" crashes, the repeat pattern from one source is active exploitation rehearsal. Next move: patch or retire the legacy parser, bounds-check input, alert on repeated crash patterns."
    },
    "EV-503": {
      "id": "EV-503",
      "rack": "application",
      "title": "The same confirmed order, sixty-three times",
      "source": "API gateway log",
      "evidence": [
        {
          "label": "API gateway log",
          "lines": [
            "POST /api/shipments/confirm  (order 88113, token jwt=eyJ..c9)",
            "  -> 63 identical requests 14:02:11 - 14:02:19",
            "  same session token, same payload hash, all accepted 200 OK",
            "Merchant charged for 63 duplicate bookings; token never rotated"
          ]
        }
      ],
      "family": "application",
      "type": "Replay",
      "keyIndicator": "A captured valid request replayed until the API stops accepting it",
      "feedback": "Application replay resubmits a valid request - the server cannot tell the original from the copy, so it dutifully processes all of them. The defense is one-time tokens (nonces) and short token lifetimes. Next move: refund/void duplicates, invalidate the token, require idempotency keys on state-changing endpoints."
    },
    "EV-504": {
      "id": "EV-504",
      "rack": "application",
      "title": "Dispatcher suddenly an administrator",
      "source": "RBAC audit trail",
      "evidence": [
        {
          "label": "RBAC audit (m.reyes, dispatcher)",
          "lines": [
            "13:31  GET /admin/users (403)   13:34  GET /admin/users (200)",
            "13:36  POST /admin/users -> created account \"svc-report\" (admin)",
            "13:37  POST /admin/settings -> audit logging set to WARN-only",
            "Role check: m.reyes holds ONLY dispatcher role in HR system",
            "No approval ticket exists for the role change"
          ]
        }
      ],
      "family": "application",
      "type": "Privilege escalation",
      "keyIndicator": "Actions far above the assigned role, audit logging quietly lowered",
      "mitre": {
        "id": "T1078",
        "name": "Valid Accounts",
        "simplified": true
      },
      "feedback": "Privilege escalation means acting above your assigned level - here horizontal cheating becomes vertical takeover as a rogue admin account is born and the audit level is turned down to hide it. Next move: disable svc-report, restore audit logging, review how the admin path passed the 403 check."
    },
    "EV-505": {
      "id": "EV-505",
      "rack": "application",
      "title": "Session cookie signed by a dead key",
      "source": "Auth service audit",
      "evidence": [
        {
          "label": "Auth service log",
          "lines": [
            "JWT accepted with kid=dev-2019 (key retired 2024, never revoked)",
            "  claims: role=admin, exp=2030-01-01, aud=internal",
            "Client fingerprint: 203.0.113.133, no matching prior login",
            "Key vault: dev-2019 copied to a build artifact pushed publicly"
          ]
        }
      ],
      "family": "application",
      "type": "Forgery",
      "keyIndicator": "Token minted by the attacker with a leaked, never-revoked signing key",
      "mitre": {
        "id": "T1606",
        "name": "Forge Web Credentials",
        "simplified": true
      },
      "feedback": "Application forgery means the attacker mints their own credentials - here a self-signed admin JWT using a leaked dev key that was never revoked. If they can sign it, the server believes it. Next move: revoke the key, rotate signing keys, shorten claim lifetimes, purge build artifacts from public repos."
    },
    "EV-506": {
      "id": "EV-506",
      "rack": "application",
      "title": "Reports endpoint walking out of its webroot",
      "source": "WAF + file access logs",
      "evidence": [
        {
          "label": "WAF log (reports service)",
          "lines": [
            "GET /reports/show?file=../../../../../etc/passwd",
            "GET /reports/show?file=..%2f..%2f..%2fwindows\\repair\\sam  (encoded)",
            "Response 200 with non-report content (length 2,861 B)",
            "App log: resolved path outside webroot: /etc -> served raw"
          ]
        }
      ],
      "family": "application",
      "type": "Directory traversal",
      "keyIndicator": "Climbing out of the intended folder to read arbitrary server files",
      "feedback": "Directory traversal uses ../ (or its URL-encoded twins) to climb above the app's folder and read whatever the service account can - password files, configs, secrets. Encoded variants are built to slip naive filters. Next move: normalize + allow-list paths server-side, block traversal patterns at the WAF, rotate any exposed secrets."
    },
    "EV-601": {
      "id": "EV-601",
      "rack": "credential",
      "title": "One password tried everywhere at once",
      "source": "Identity provider logs",
      "evidence": [
        {
          "label": "IdP failed-auth summary (24 h)",
          "lines": [
            "2,410 failed logons across 380 distinct accounts",
            "  max 7 failures per account (stays under lockout threshold)",
            "Passwords tried: only 3 distinct values (\"Autumn2026!\", \"MFH2026\", \"welcome1\")",
            "Source: 41 rotating IPs in one hosting range 198.51.100.0/24",
            "Result: 30 accounts LOCKED OUT, 2 succeeded (weak shared passwords)"
          ]
        }
      ],
      "family": "credential",
      "type": "Password spraying",
      "keyIndicator": "Few passwords, many accounts - failures spread thin to dodge lockouts",
      "mitre": {
        "id": "T1110.003",
        "name": "Password Spraying"
      },
      "feedback": "Spraying flips brute force: one likely password against every account, so no single account trips its lockout. The statistical fingerprint is failures scattered across many accounts from one source range. Real-world echo: state-linked crews use exactly this (CISA AA20-301A). Next move: block the range, reset the 2 hit accounts, MFA + banned-password list."
    },
    "EV-602": {
      "id": "EV-602",
      "rack": "credential",
      "title": "Nineteen thousand guesses at one account",
      "source": "VPN gateway logs",
      "evidence": [
        {
          "label": "VPN gateway log",
          "lines": [
            "account svc_vpn: 19,437 failed attempts 01:00-04:40",
            "  password variation pattern: Autumn1, Autumn2 ... Autumn19437",
            "Single source 198.51.100.77; account NOT MFA-enrolled (exception)",
            "04:41  1 SUCCESS - VPN session opened, 340 MB pulled from fileshare"
          ]
        }
      ],
      "family": "credential",
      "type": "Brute force",
      "keyIndicator": "Systematic password variation against a single account until it cracks",
      "mitre": {
        "id": "T1110",
        "name": "Brute Force"
      },
      "feedback": "Brute force is the opposite shape of spraying: enormous volume against one account. It worked here only because the account had an MFA exception - a reminder that exceptions are attack surface. Next move: terminate the session, disable/reset svc_vpn, enforce MFA on every account with zero exceptions."
    },
    "EV-603": {
      "id": "EV-603",
      "rack": "credential",
      "title": "Login form answers faster for real usernames",
      "source": "Web server timing analysis",
      "evidence": [
        {
          "label": "Response timing (login endpoint)",
          "lines": [
            "POST /login x 500 probes, same password \"Test1234!\"",
            "  known-valid usernames: avg 182 ms, message \"invalid password\"",
            "  invented usernames:    avg 310 ms, message \"user not found\"",
            "Attacker harvested 118 confirmed usernames, then slowed to 1/min",
            "No lockouts, no failures on valid accounts - pure enumeration"
          ]
        }
      ],
      "family": "credential",
      "type": "User enumeration",
      "keyIndicator": "Timing / message differences that reveal which usernames exist",
      "mitre": {
        "id": "T1087",
        "name": "Account Discovery",
        "simplified": true
      },
      "feedback": "User enumeration is quiet reconnaissance: tiny response differences tell the attacker which usernames are real before any password guessing starts. It enables every credential attack that follows, so treat it as an early-warning sign. Next move: uniform responses and timing (constant-work pattern), alert on username-probing cadence."
    },
    "EV-604": {
      "id": "EV-604",
      "rack": "credential",
      "title": "One session, two continents, seven minutes",
      "source": "Identity provider + device telemetry",
      "evidence": [
        {
          "label": "Session telemetry (user d.laurent)",
          "lines": [
            "09:40  Session S-881 active from Rotterdam office (managed device)",
            "09:47  SAME session cookie presented from 203.0.113.44 (VPS)",
            "  device fingerprint completely different, no re-authentication",
            "09:52  Mailbox rule created: forward finance@ to hxxp inbox",
            "Rotterdam user confirms: no new device, never left the office"
          ]
        }
      ],
      "family": "credential",
      "type": "Credential replay",
      "keyIndicator": "Stolen session/cookie reused from a second location without re-auth",
      "mitre": {
        "id": "T1550",
        "name": "Use Alternate Authentication Material",
        "simplified": true
      },
      "feedback": "Replay attacks reuse captured credentials - here the session cookie, which is why there was no second login and no MFA prompt to stop it. \"Same session, two geographies\" is impossible travel and the strongest single signal you have. Next move: kill all sessions, reset credentials, require device binding and short session lifetimes."
    },
    "EV-605": {
      "id": "EV-605",
      "rack": "credential",
      "title": "Twenty-two pushes until somebody tapped Approve",
      "source": "MFA provider logs",
      "evidence": [
        {
          "label": "MFA provider log (user a.kovac, night manager)",
          "lines": [
            "01:58-02:20  22 push approvals sent (passwords already correct)",
            "02:21  1 approval accepted (device was asleep in employee's home)",
            "02:22  Login success from 203.0.113.201 - new country for user",
            "a.kovac: \"I kept declining, then I must have approved half-asleep.\""
          ]
        }
      ],
      "family": "credential",
      "type": "MFA bypass",
      "keyIndicator": "Push-notification flood (fatigue) until the victim approves themselves in",
      "mitre": {
        "id": "T1621",
        "name": "Multi-Factor Authentication Request Generation"
      },
      "feedback": "MFA fatigue attacks weaponize the human: correct passwords first, then push spam until a tired thumb approves. Note the anatomy - stolen password (credential attack) plus social pressure (social engineering) equals bypass. Next move: number-matching MFA, additional verification on repeated denies, investigate how the password was phished."
    },
    "EV-B01": {
      "id": "EV-B01",
      "rack": "noise",
      "title": "\"96% CPU\" alert at 02:00 every night",
      "source": "Monitoring queue",
      "evidence": [
        {
          "label": "Monitoring alert + change record",
          "lines": [
            "Alert: SRV-HR01 96% CPU 02:00-02:40 nightly, flagged \"possible",
            "  cryptomining / excessive resource consumption\"",
            "Change record CHG-2201: nightly payroll backup job (approved)",
            "Job owner: infra team; runs on this exact schedule for 14 months",
            "No network egress during the window; no file renames; AV clean"
          ]
        }
      ],
      "family": "benign",
      "type": "Benign - scheduled backup",
      "keyIndicator": "Alert matches an approved change record and a long-stable schedule",
      "benign": {
        "rationale": "Matches approved change record CHG-2201 and a 14-month-stable schedule"
      },
      "feedback": "Not every loud alert is an attack - this is a scheduled backup that a naive rule mislabeled as cryptomining. The discipline that cleared it: match against change records, check egress and file activity, and then tune the alert rather than cry wolf every night."
    },
    "EV-B02": {
      "id": "EV-B02",
      "rack": "noise",
      "title": "Break-room poster QR code flagged as quishing",
      "source": "Awareness report queue",
      "evidence": [
        {
          "label": "QR verification note",
          "lines": [
            "Report: \"QR poster in break room leads to login page - suspicious!\"",
            "QR resolves to mfh-benefits.example (corporate HR domain, managed cert)",
            "Comms ticket MKT-884: benefits enrollment campaign, poster approved",
            "Page is the real staff portal; no clone artifacts, cert valid"
          ]
        }
      ],
      "family": "benign",
      "type": "Benign - approved campaign",
      "keyIndicator": "Destination domain is corporate-managed and matches an approved campaign",
      "benign": {
        "rationale": "Destination is the managed HR domain and matches approved campaign MKT-884"
      },
      "feedback": "A vigilant employee reported this one - exactly what awareness training is for, so treat the report as a win even when it is a false positive. The verification habit: resolve the QR, check the domain against managed assets and campaign tickets. Praise the reporter, then tune the triage playbook."
    },
    "EV-B03": {
      "id": "EV-B03",
      "rack": "noise",
      "title": "Encoded PowerShell from the ops admin",
      "source": "EDR queue",
      "evidence": [
        {
          "label": "EDR alert note",
          "lines": [
            "Alert: powershell.exe -nop -enc <base64> by account svc-opsadmin",
            "Flagged \"fileless malware - office spawning PowerShell\"",
            "Decoded script matches runbook KB-1129 cleanup steps verbatim",
            "Executed 23:40 inside approved maintenance window WIN-11-09",
            "Account signed in from the admin jump host, badge present"
          ]
        }
      ],
      "family": "benign",
      "type": "Benign - documented runbook",
      "keyIndicator": "Command matches a published runbook inside an approved maintenance window",
      "benign": {
        "rationale": "Matches runbook KB-1129 executed in approved maintenance window WIN-11-09"
      },
      "feedback": "The same artifact chain that signals fileless malware (encoded PowerShell) is also how admins work - context is everything. It cleared because three independent checks agreed: runbook match, maintenance window, jump-host provenance. Document those checks so the next analyst clears it in one minute, not thirty."
    }
  },
  "BEACON_SCENARIOS": [
    {
      "id": "B-01",
      "scenario": "Badge 4491 read at Newhaven Gate 07:58 and at Dover Annex 08:02 - 38 km apart.",
      "answer": "Impossible travel"
    },
    {
      "id": "B-02",
      "scenario": "Session cookie S-881 active from Rotterdam and, minutes later, from a VPS in another country.",
      "answer": "Concurrent sessions"
    },
    {
      "id": "B-03",
      "scenario": "Thirty accounts hit their lockout threshold within six minutes of each other.",
      "answer": "Account lockout"
    },
    {
      "id": "B-04",
      "scenario": "Security event log truncated at 03:11 while the EDR sensor was stopped at 03:02.",
      "answer": "Log manipulation"
    },
    {
      "id": "B-05",
      "scenario": "Nightly job pins one core at 96% CPU for forty minutes, then goes quiet.",
      "answer": "Excessive resource consumption"
    },
    {
      "id": "B-06",
      "scenario": "A housekeeping task executed at 02:00 sharp - a schedule its owner says it never had.",
      "answer": "Timestamp anomaly"
    },
    {
      "id": "B-07",
      "scenario": "Two threat feeds flag sha256 4e1f...b209; the same hash appears in one sandbox detonation.",
      "answer": "Hash"
    },
    {
      "id": "B-08",
      "scenario": "Every hour, on the hour, an outbound request leaves for towlink-update.example.",
      "answer": "Domain"
    },
    {
      "id": "B-09",
      "scenario": "Kernel telemetry sees three processes the OS process list cannot show.",
      "answer": "Malicious process"
    },
    {
      "id": "B-10",
      "scenario": "Files renamed *.mfh.locked and a README_RESTORE.txt note appear across every share.",
      "answer": "File system artifact"
    },
    {
      "id": "B-11",
      "scenario": "Firewall blocks 198.51.100.77 after 19,437 failed VPN attempts in under four hours.",
      "answer": "IP address"
    },
    {
      "id": "B-12",
      "scenario": "A captured pcap contains \"USER opsftp PASS Fr8gh0st2019\" in clear text.",
      "answer": "Plaintext strings"
    }
  ],
  "MATCH_PANELS": {
    "definitions": {
      "title": "Clipboard: vocabulary",
      "pairs": [
        {
          "leftId": "d1",
          "left": "Logic bomb",
          "options": [
            "Code that lies dormant until a trigger condition, such as a date or data change, fires it",
            "Malware that runs entirely in memory through trusted tools, leaving no file on disk",
            "Phishing delivered through a swapped or planted QR code",
            "An attacker secretly relaying traffic between two parties who believe they talk directly"
          ],
          "answer": "Code that lies dormant until a trigger condition, such as a date or data change, fires it"
        },
        {
          "leftId": "d2",
          "left": "Fileless malware",
          "options": [
            "Phishing delivered through a swapped or planted QR code",
            "Malware that runs entirely in memory through trusted tools, leaving no file on disk",
            "A hardware or software clone of a physical access badge",
            "Code that lies dormant until a trigger condition, such as a date or data change, fires it"
          ],
          "answer": "Malware that runs entirely in memory through trusted tools, leaving no file on disk"
        },
        {
          "leftId": "d3",
          "left": "Quishing",
          "options": [
            "Malware that runs entirely in memory through trusted tools, leaving no file on disk",
            "An attacker secretly relaying traffic between two parties who believe they talk directly",
            "Phishing delivered through a swapped or planted QR code",
            "One password tried against many accounts to dodge lockouts"
          ],
          "answer": "Phishing delivered through a swapped or planted QR code"
        },
        {
          "leftId": "d4",
          "left": "On-path attack",
          "options": [
            "One password tried against many accounts to dodge lockouts",
            "Phishing delivered through a swapped or planted QR code",
            "A hardware or software clone of a physical access badge",
            "An attacker secretly relaying traffic between two parties who believe they talk directly"
          ],
          "answer": "An attacker secretly relaying traffic between two parties who believe they talk directly"
        }
      ]
    },
    "goals": {
      "title": "Clipboard: attacker goals",
      "pairs": [
        {
          "leftId": "g1",
          "left": "Ransomware",
          "options": [
            "Extortion: make data or systems unavailable, then charge for their return",
            "Long-term surveillance and credential harvesting on a compromised host",
            "Cheap, scalable way into accounts - the door-opener for everything else",
            "Disrupt the business itself - availability, not data, is the target"
          ],
          "answer": "Extortion: make data or systems unavailable, then charge for their return"
        },
        {
          "leftId": "g2",
          "left": "Keylogger",
          "options": [
            "Disrupt the business itself - availability, not data, is the target",
            "Long-term surveillance and credential harvesting on a compromised host",
            "Extortion: make data or systems unavailable, then charge for their return",
            "Cheap, scalable way into accounts - the door-opener for everything else"
          ],
          "answer": "Long-term surveillance and credential harvesting on a compromised host"
        },
        {
          "leftId": "g3",
          "left": "Phishing",
          "options": [
            "Long-term surveillance and credential harvesting on a compromised host",
            "Cheap, scalable way into accounts - the door-opener for everything else",
            "Disrupt the business itself - availability, not data, is the target",
            "Extortion: make data or systems unavailable, then charge for their return"
          ],
          "answer": "Cheap, scalable way into accounts - the door-opener for everything else"
        },
        {
          "leftId": "g4",
          "left": "DDoS",
          "options": [
            "Cheap, scalable way into accounts - the door-opener for everything else",
            "Extortion: make data or systems unavailable, then charge for their return",
            "Long-term surveillance and credential harvesting on a compromised host",
            "Disrupt the business itself - availability, not data, is the target"
          ],
          "answer": "Disrupt the business itself - availability, not data, is the target"
        }
      ]
    },
    "controls": {
      "title": "Control shelf",
      "pairs": [
        {
          "leftId": "c1",
          "left": "Password spraying (EV-601)",
          "options": [
            "Phishing-resistant MFA (number matching) plus a banned-password list",
            "Security awareness training with QR-verification drills",
            "Disable SSLv3 and TLS 1.0; alert on negotiated protocol versions",
            "Badge system duplicate-read alerts plus immediate badge re-issue"
          ],
          "answer": "Phishing-resistant MFA (number matching) plus a banned-password list"
        },
        {
          "leftId": "c2",
          "left": "Quishing (EV-406)",
          "options": [
            "Badge system duplicate-read alerts plus immediate badge re-issue",
            "Security awareness training with QR-verification drills",
            "Phishing-resistant MFA (number matching) plus a banned-password list",
            "Disable SSLv3 and TLS 1.0; alert on negotiated protocol versions"
          ],
          "answer": "Security awareness training with QR-verification drills"
        },
        {
          "leftId": "c3",
          "left": "Protocol downgrade (EV-302)",
          "options": [
            "Security awareness training with QR-verification drills",
            "Badge system duplicate-read alerts plus immediate badge re-issue",
            "Disable SSLv3 and TLS 1.0; alert on negotiated protocol versions",
            "Phishing-resistant MFA (number matching) plus a banned-password list"
          ],
          "answer": "Disable SSLv3 and TLS 1.0; alert on negotiated protocol versions"
        },
        {
          "leftId": "c4",
          "left": "Badge skimming (EV-203)",
          "options": [
            "Disable SSLv3 and TLS 1.0; alert on negotiated protocol versions",
            "Phishing-resistant MFA (number matching) plus a banned-password list",
            "Security awareness training with QR-verification drills",
            "Badge system duplicate-read alerts plus immediate badge re-issue"
          ],
          "answer": "Badge system duplicate-read alerts plus immediate badge re-issue"
        }
      ]
    }
  },
  "MEDIUM_OBJECTIVES": [
    {
      "id": "OBJ-M1",
      "title": "Learn the field guide vocabulary",
      "brief": "Open the FIELD GUIDE below and match each term to its definition. These four come up again and again in the racks.",
      "pillar": "P1",
      "kind": "match",
      "items": [],
      "matchPanelId": "definitions",
      "hints": [
        "Logic bombs wait; fileless malware never touches the disk.",
        "Quishing is phishing through a QR code.",
        "The on-path attacker sits between two parties and relays the conversation."
      ]
    },
    {
      "id": "OBJ-M2",
      "title": "Match threats to attacker goals",
      "brief": "Why would an attacker bother? Match each threat to the goal that motivates it - this is what the exam calls understanding \"attacker value\".",
      "pillar": "P1",
      "kind": "match",
      "items": [],
      "matchPanelId": "goals",
      "hints": [
        "Ransomware converts unavailability into money directly.",
        "A keylogger is a long-term collection tool, not a one-shot thief.",
        "DDoS hurts the business, not the data."
      ]
    },
    {
      "id": "OBJ-M3",
      "title": "Screen the malware rack - set A",
      "brief": "Inspect EV-101, EV-102, EV-109 and EV-110 in the LOUPE and stamp each with the correct family and attack type.",
      "pillar": "P2",
      "kind": "stamps",
      "items": [
        "EV-101",
        "EV-102",
        "EV-109",
        "EV-110"
      ],
      "hints": [
        "EV-101: the files were renamed and a note demands payment.",
        "EV-102: the app is useful-looking but phones home every hour.",
        "EV-110: Word spawned PowerShell; nothing landed on disk."
      ]
    },
    {
      "id": "OBJ-M4",
      "title": "Screen the malware rack - set B",
      "brief": "Inspect EV-103, EV-104, EV-107 and EV-108 and stamp each with the correct family and attack type.",
      "pillar": "P2",
      "kind": "stamps",
      "items": [
        "EV-103",
        "EV-104",
        "EV-107",
        "EV-108"
      ],
      "hints": [
        "EV-103: each new victim starts the same scan - it spreads itself.",
        "EV-107: the OS cannot see three processes; something is hiding below it.",
        "EV-108: a keystroke buffer file grows as the dispatcher types."
      ]
    },
    {
      "id": "OBJ-M5",
      "title": "Screen the message rack",
      "brief": "Inspect EV-401, EV-403, EV-404, EV-406, EV-407 and EV-408. Each is a human-facing attack - stamp family and type. Mind the delivery channel: email, SMS, QR, lobby, voice, video.",
      "pillar": "P2",
      "kind": "stamps",
      "items": [
        "EV-401",
        "EV-403",
        "EV-404",
        "EV-406",
        "EV-407",
        "EV-408"
      ],
      "hints": [
        "EV-401 went to 900+ people with identical text - volume is a clue.",
        "EV-403 targets one executive with payment authority.",
        "EV-408: the director was on leave, yet \"approved\" the export on video."
      ]
    },
    {
      "id": "OBJ-M6",
      "title": "Screen the credential rack",
      "brief": "Inspect EV-601, EV-602 and EV-603. Watch the SHAPE of the failures: how many accounts, how many passwords?",
      "pillar": "P2",
      "kind": "stamps",
      "items": [
        "EV-601",
        "EV-602",
        "EV-603"
      ],
      "hints": [
        "EV-601: few passwords, many accounts.",
        "EV-602: one account, thousands of passwords.",
        "EV-603: no failures at all - just timing differences."
      ]
    },
    {
      "id": "OBJ-M7",
      "title": "Screen the application rack",
      "brief": "Inspect EV-501, EV-504 and EV-506 and stamp family and type.",
      "pillar": "P2",
      "kind": "stamps",
      "items": [
        "EV-501",
        "EV-504",
        "EV-506"
      ],
      "hints": [
        "EV-501: input became part of a SQL statement.",
        "EV-504: the dispatcher performs administrator actions.",
        "EV-506: the path climbs out of the web folder with ../ sequences."
      ]
    },
    {
      "id": "OBJ-M8",
      "title": "Screen the network rack",
      "brief": "Inspect EV-301, EV-302 and EV-303 and stamp family and type.",
      "pillar": "P2",
      "kind": "stamps",
      "items": [
        "EV-301",
        "EV-302",
        "EV-303"
      ],
      "hints": [
        "EV-301: thousands of sources, one victim, service down.",
        "EV-302: sessions agree on SSLv3 - a protocol nobody should offer.",
        "EV-303: a familiar SSID with an unmanaged BSSID shouting louder."
      ]
    },
    {
      "id": "OBJ-M9",
      "title": "Screen the physical rack",
      "brief": "Inspect EV-201, EV-203 and EV-204. Physical evidence talks through badge logs, cameras and door hardware.",
      "pillar": "P2",
      "kind": "stamps",
      "items": [
        "EV-201",
        "EV-203",
        "EV-204"
      ],
      "hints": [
        "EV-201: one badge swipe, two people on camera.",
        "EV-203: the same badge in two cities minutes apart.",
        "EV-204: pry marks and a bypassed alarm zone."
      ]
    },
    {
      "id": "OBJ-M10",
      "title": "Work the beacon board - first six",
      "brief": "The BEACON BOARD below holds six observations lifted from tonight's evidence. Tag each observation with the indicator-of-compromise (IoC) category it represents.",
      "pillar": "P3",
      "kind": "beacon",
      "items": [
        "B-01",
        "B-02",
        "B-03",
        "B-04",
        "B-05",
        "B-06"
      ],
      "hints": [
        "B-01: one credential, two geographically impossible locations.",
        "B-03: lockouts are an IoC in themselves - ask what caused 30 of them.",
        "B-05: a job consuming CPU on a clockwork schedule needs a owner-check first."
      ]
    },
    {
      "id": "OBJ-M11",
      "title": "Clear the noise bin",
      "brief": "Three alerts in the NOISE BIN are false positives. Open each in the LOUPE, set disposition to \"Cleared - benign\", and pick the rationale that justifies clearing it. Wrong rationale = wrong call.",
      "pillar": "P3",
      "kind": "benign",
      "items": [
        "EV-B01",
        "EV-B02",
        "EV-B03"
      ],
      "hints": [
        "Every clearance needs evidence: a change record, a campaign ticket, a runbook.",
        "EV-B03 cleared because three independent checks agreed - find the right trio.",
        "A reporter being vigilant is a win, not a nuisance."
      ]
    },
    {
      "id": "OBJ-M12",
      "title": "Load the control shelf",
      "brief": "Prevention beats triage. On the CONTROL SHELF below, pair each threat with the control that best stops it before it starts.",
      "pillar": "P4",
      "kind": "match",
      "items": [],
      "matchPanelId": "controls",
      "hints": [
        "For spraying, the password is already guessed - stop the second factor falling.",
        "QR lures die when people verify where codes actually point.",
        "Skimming needs the badge system itself to raise its hand."
      ]
    }
  ],
  "HARD_OBJECTIVES": [
    {
      "id": "OBJ-H1",
      "title": "Classify the full malware rack",
      "brief": "All ten malware items, no shortcuts: open each in the LOUPE and stamp family + exact type. One miss fails the rack.",
      "pillar": "P2",
      "kind": "stamps",
      "items": [
        "EV-101",
        "EV-102",
        "EV-103",
        "EV-104",
        "EV-105",
        "EV-106",
        "EV-107",
        "EV-108",
        "EV-109",
        "EV-110"
      ]
    },
    {
      "id": "OBJ-H2",
      "title": "Classify the full message rack",
      "brief": "All eight social-engineering items, family + exact type. The delivery channel is your fastest sorting key.",
      "pillar": "P2",
      "kind": "stamps",
      "items": [
        "EV-401",
        "EV-402",
        "EV-403",
        "EV-404",
        "EV-405",
        "EV-406",
        "EV-407",
        "EV-408"
      ]
    },
    {
      "id": "OBJ-H3",
      "title": "Classify the full network rack",
      "brief": "All eight network items, family + exact type. Keep \"spoofing\" and \"on-path\" straight - identity theft is not traffic relay.",
      "pillar": "P2",
      "kind": "stamps",
      "items": [
        "EV-301",
        "EV-302",
        "EV-303",
        "EV-304",
        "EV-305",
        "EV-306",
        "EV-307",
        "EV-308"
      ]
    },
    {
      "id": "OBJ-H4",
      "title": "Classify the full application rack",
      "brief": "All six application items, family + exact type. Read what the input DID, not where it came from.",
      "pillar": "P2",
      "kind": "stamps",
      "items": [
        "EV-501",
        "EV-502",
        "EV-503",
        "EV-504",
        "EV-505",
        "EV-506"
      ]
    },
    {
      "id": "OBJ-H5",
      "title": "Classify the full credential rack",
      "brief": "All five credential items, family + exact type. Spray, crack, enumerate, replay, fatigue - five different shapes.",
      "pillar": "P2",
      "kind": "stamps",
      "items": [
        "EV-601",
        "EV-602",
        "EV-603",
        "EV-604",
        "EV-605"
      ]
    },
    {
      "id": "OBJ-H6",
      "title": "Classify the full physical rack",
      "brief": "All four physical items, family + exact type. Badge logs, cameras and door hardware are your data sources here.",
      "pillar": "P2",
      "kind": "stamps",
      "items": [
        "EV-201",
        "EV-202",
        "EV-203",
        "EV-204"
      ]
    },
    {
      "id": "OBJ-H7",
      "title": "Complete the beacon board",
      "brief": "All twelve observations on the BEACON BOARD, each tagged with its IoC category. These twelve names are the exam's indicator vocabulary.",
      "pillar": "P3",
      "kind": "beacon",
      "items": [
        "B-01",
        "B-02",
        "B-03",
        "B-04",
        "B-05",
        "B-06",
        "B-07",
        "B-08",
        "B-09",
        "B-10",
        "B-11",
        "B-12"
      ]
    },
    {
      "id": "OBJ-H8",
      "title": "Root out every red herring",
      "brief": "Exactly three items in tonight's queue are FALSE POSITIVES. Find them without being told where they are, clear them with the correct rationale - and name the single decisive IoC that exposed the session hijack in EV-604.",
      "pillar": "P3",
      "kind": "benign",
      "items": [
        "EV-B01",
        "EV-B02",
        "EV-B03"
      ],
      "extraIocPick": {
        "itemId": "EV-604",
        "question": "Decisive IoC in EV-604 (one session, Rotterdam 09:40 / VPS 09:47):",
        "answer": "Impossible travel"
      }
    },
    {
      "id": "OBJ-H9",
      "title": "Run the response, then defend it",
      "brief": "Build the correct response sequence for tonight's composite incident, then assign the right disposition to EV-101, EV-605 and EV-301. Sequence order matters.",
      "pillar": "P1·P4",
      "kind": "plan",
      "items": [],
      "sequenceTitle": "Composite incident: the Word-spawned PowerShell host (EV-110) beaconed out all night, the sprayed password reached the night manager, and the portal took a flood this morning.",
      "routeItems": [
        {
          "itemId": "EV-101",
          "answer": "Escalate to incident response",
          "why": "Full ransomware detonation on a file server is an incident, not a helpdesk ticket - preserve evidence and restore from backups."
        },
        {
          "itemId": "EV-605",
          "answer": "Reset credentials and revoke sessions",
          "why": "The fatigue-approved session is live; kill every session and rotate the phished password immediately."
        },
        {
          "itemId": "EV-301",
          "answer": "Contain and block (network / identity)",
          "why": "A volumetric DDoS is contained at the edge - scrubbing, rate limits, ISP filters - not by touching the servers."
        }
      ]
    }
  ],
  "MEDIUM_QUIZ": [
    {
      "id": "Q-M1",
      "scenario": "A database script has run harmlessly for months. Tonight it deleted 11,204 payroll rows - exactly when a specific contractor record was removed from HR.",
      "options": [
        "Worm",
        "Ransomware",
        "Logic bomb",
        "Fileless malware"
      ],
      "correct": 2,
      "topic": "Logic bombs and trigger conditions",
      "explanation": "A logic bomb is defined by its trigger condition - here the removal of one record. The long dormancy plus the precise data condition is the signature; worms spread by self-replication, ransomware extorts, fileless malware hides in memory."
    },
    {
      "id": "Q-M2",
      "scenario": "EDR shows WINWORD.EXE spawning powershell.exe with an encoded command. The payload runs in memory; no file lands on disk.",
      "options": [
        "Remote access trojan",
        "Fileless malware",
        "Credential stealer",
        "Memory-resident virus"
      ],
      "correct": 1,
      "topic": "Fileless malware detection",
      "explanation": "No file on disk plus execution through trusted tools (office + PowerShell) is the definition of fileless malware. RATs and stealers leave binaries to scan; a memory-resident virus still infects files. Detect fileless work with parent-child process analytics, not file scanning."
    },
    {
      "id": "Q-M3",
      "scenario": "A sticker QR code pasted over the cafeteria menu QR leads staff to a pixel-perfect clone of the staff portal login.",
      "options": [
        "Quishing",
        "Phishing",
        "Smishing",
        "Impersonation"
      ],
      "correct": 0,
      "topic": "QR-code phishing (quishing)",
      "explanation": "QR-code phishing has its own name - quishing - because the phone hides the destination URL that a browser would reveal. The physical swap makes it feel trusted; the cloned login is the giveaway. Plain phishing arrives by email, smishing by SMS, and impersonation is a person, not a sticker."
    },
    {
      "id": "Q-M4",
      "scenario": "Over 24 hours: 2,410 failed logons spread across 380 accounts, at most 7 failures per account, only 3 distinct passwords tried.",
      "options": [
        "Brute force",
        "Credential replay",
        "User enumeration",
        "Password spraying"
      ],
      "correct": 3,
      "topic": "Password-spray failure shapes",
      "explanation": "The shape of the failures is the answer: few passwords x many accounts = spraying, designed to stay under per-account lockout thresholds. Brute force is the mirror image - thousands of passwords against ONE account. Replay reuses a valid session; enumeration probes which usernames exist."
    },
    {
      "id": "Q-M5",
      "scenario": "A session authenticates from the Rotterdam office at 09:40 and the same identity logs in from Sydney 20 minutes later. The user never left the Netherlands.",
      "options": [
        "Account lockout",
        "Impossible travel",
        "Log manipulation",
        "Concurrent sessions"
      ],
      "correct": 1,
      "topic": "Impossible travel",
      "explanation": "Geography plus timing makes the second login physically impossible - the classic impossible-travel indicator, one of the strongest signals of a hijacked (replayed) session. Concurrent sessions describe the mechanics; impossible travel is the detection you write. Lockouts and log truncation are different indicator families entirely."
    },
    {
      "id": "Q-M6",
      "scenario": "TLS proxy shows hundreds of sessions with a partner gateway suddenly negotiating SSLv3 and RC4 after a burst of ServerHello messages.",
      "options": [
        "Cache poisoning",
        "Rogue access point",
        "Protocol downgrade",
        "DNS hijacking"
      ],
      "correct": 2,
      "topic": "Protocol downgrade attacks",
      "explanation": "Forcing modern clients onto deliberately broken protocol versions is a downgrade attack (POODLE-style). The remediation is configuration, not patching: disable SSLv3/TLS1.0 so the downgrade has nowhere to land. Cache poisoning and DNS hijacking corrupt name resolution; a rogue access point captures traffic."
    }
  ],
  "HARD_QUIZ": [
    {
      "id": "Q-H1",
      "scenario": "VPN gateway: 3,200 failed logons in 3 minutes, ALL against the single account svc_backup, from one IP. As shift analyst, the BEST first action is:",
      "options": [
        "Wait for the lockout policy to stop the attempts",
        "Email all staff a password-hygiene reminder",
        "Block the source IP and disable the account",
        "Raise the lockout threshold to 10,000 attempts"
      ],
      "correct": 2,
      "topic": "Brute-force containment",
      "explanation": "Single-account volume = brute force in progress. You contain first (block source, disable the targeted account), because every minute the account stays enabled is another chance at a hit. Raising the lockout threshold does the opposite of defense; email does not stop an active attack."
    },
    {
      "id": "Q-H2",
      "scenario": "The CFO receives a video call from the CEO's face and voice approving an urgent wire. Lip-sync drifts at sentence starts. The correct verification is:",
      "options": [
        "Call the CEO back on the listed switchboard number",
        "Reply in the same video call with a personal question",
        "Approve it - face and voice match public recordings",
        "Ask finance to process a reduced amount as a compromise"
      ],
      "correct": 0,
      "topic": "Deepfake verification",
      "explanation": "Deepfakes defeat perception, so verification must leave the attacker's channel entirely: out-of-band callback on a known-published number. Asking the fake a personal question plays into the fraudster's script, and \"process a reduced amount\" still pays a criminal."
    },
    {
      "id": "Q-H3",
      "scenario": "On SRV-DC01: three processes visible only to kernel telemetry, a driver loaded from %TEMP%, EDR sensor stopped, and Security.evtx truncated. Priority action:",
      "options": [
        "Reboot the server to flush the rootkit hooks",
        "Run a full antivirus scan and email the log",
        "Restore last night's backup and continue operations",
        "Capture volatile memory, then isolate the host"
      ],
      "correct": 3,
      "topic": "Rootkit response order",
      "explanation": "Rootkit indicators mean the OS itself is lying to you. Volatile memory holds what the disk cannot prove - kernel hooks, injected code - and it evaporates on reboot. Memory first, then isolation. A scan run under a rootkit's driver would report nothing."
    },
    {
      "id": "Q-H4",
      "scenario": "The same POST /api/shipments/confirm request - identical token, identical payload - is replayed 63 times and accepted 63 times. The control that prevents this is:",
      "options": [
        "Rate limiting per source IP address",
        "One-time nonces and short token lifetimes",
        "Encrypted HTTPS transport on the endpoint",
        "Longer JWT (token) expiry windows"
      ],
      "correct": 1,
      "topic": "Replay-attack prevention",
      "explanation": "Replay works because the request stays valid forever. A nonce makes each request single-use and short token lifetimes shrink the replay window. HTTPS protects the capture in transit but does nothing once the token is stolen; rate limiting only slows the damage."
    },
    {
      "id": "Q-H5",
      "scenario": "Badge 4491 reads normally all morning at Newhaven, but the PACS also shows it at Dover Annex 4 minutes after the first read. The user is present at Newhaven.",
      "options": [
        "Reader clock drift - recalibrate the door and monitor closely",
        "The user took a fast train - ask their manager later",
        "Cloned badge (skimming) - deactivate 4491 and re-issue",
        "Reboot all door controllers at both depots"
      ],
      "correct": 2,
      "topic": "Badge cloning (skimming)",
      "explanation": "Duplicate badge reads at impossible distances mean the credential exists in two places at once - a clone. Clock drift would affect ALL badges, not one. Deactivate the credential first (it is actively in use by an attacker), then re-issue with duplicate-read alerting enabled."
    },
    {
      "id": "Q-H6",
      "scenario": "02:00: a night manager receives 22 MFA push approvals in 23 minutes, then approves one. Login follows from a new country. The durable fix is:",
      "options": [
        "Number-matching MFA and post-deny re-verification",
        "Reduce the push timeout from 30 seconds to 10 seconds",
        "Remove MFA from night-shift accounts entirely",
        "Require longer, more complex passwords"
      ],
      "correct": 0,
      "topic": "MFA fatigue (T1621)",
      "explanation": "T1621 (MFA request generation) floods the human, not the factor. Number matching forces the user to prove they saw the right number, and additional verification after repeated denies breaks the fatigue pattern. Removing MFA is surrender; better passwords do not stop an approved push."
    },
    {
      "id": "Q-H7",
      "scenario": "Only the BR-07 branch resolver returns 203.0.113.99 for fleettrack.example; HQ and all other branches return the correct 198.51.100.20. Diagnosis and first response:",
      "options": [
        "Registrar hijack - recover the account and set registry lock",
        "Rogue access point - deauth clients and find the device",
        "Protocol downgrade - disable SSLv3 at the edge",
        "Cache poisoning - flush the resolver and enable DNSSEC"
      ],
      "correct": 3,
      "topic": "DNS cache poisoning",
      "explanation": "One resolver wrong while all others answer correctly is the differential signature of cache poisoning - a local corrupted cache, not a global redirect (that would be registrar hijacking, EV-307's story). Flush the cache, patch the resolver, and require DNSSEC validation so spoofed replies fail."
    }
  ],
  "RESPONSE_STEPS": [
    {
      "id": "S1",
      "text": "Isolate the affected host (EV-110) from the network"
    },
    {
      "id": "S2",
      "text": "Capture volatile memory before any reboot"
    },
    {
      "id": "S3",
      "text": "Revoke all sessions and reset the compromised credentials"
    },
    {
      "id": "S4",
      "text": "Block the C2 domain and malicious IPs at the perimeter"
    },
    {
      "id": "S5",
      "text": "Open an incident record and brief management"
    },
    {
      "id": "S6",
      "text": "Tune detections and schedule an awareness refresher"
    }
  ],
  "GLOSSARY": [
    {
      "term": "Indicator of compromise (IoC)",
      "def": "An observable artifact - a hash, IP, domain, process, timestamp - suggesting a system has been attacked or compromised."
    },
    {
      "term": "Command and control (C2)",
      "def": "The channel attacker-controlled infrastructure uses to send commands to and receive data from compromised hosts."
    },
    {
      "term": "Beaconing",
      "def": "Regular, machine-like outbound contact from a compromised host to its C2 - often identical requests on a fixed schedule."
    },
    {
      "term": "Evil twin",
      "def": "A rogue wireless access point masquerading as a legitimate SSID to capture victim traffic."
    },
    {
      "term": "On-path attack",
      "def": "An attacker silently relaying traffic between two parties (formerly \"man-in-the-middle\")."
    },
    {
      "term": "Tailgating",
      "def": "Following an authorized person through an access-controlled door without credentials."
    },
    {
      "term": "Skimming",
      "def": "Copying a physical credential (badge/card) so a clone can be used while the owner is elsewhere."
    },
    {
      "term": "Password spraying",
      "def": "Trying a few likely passwords against many accounts, keeping failures low per account to avoid lockouts."
    },
    {
      "term": "Fileless malware",
      "def": "Malware executing in memory through legitimate tools (PowerShell, WMI), leaving no file on disk to scan."
    },
    {
      "term": "Logic bomb",
      "def": "Malicious code that stays dormant until a trigger condition - a date, a data change, an account removal - fires it."
    },
    {
      "term": "Rootkit",
      "def": "Malware that hides below the operating system (kernel or boot level) so process lists and logs lie."
    },
    {
      "term": "Quishing",
      "def": "Phishing delivered via QR codes, exploiting phones that hide the destination URL."
    },
    {
      "term": "MFA fatigue",
      "def": "Flooding a user with push approvals until one is accepted in error - an MFA bypass technique."
    },
    {
      "term": "Impossible travel",
      "def": "The same identity active in two locations too far apart for the elapsed time - a strong session-hijack signal."
    },
    {
      "term": "Living off the land (LOLBin)",
      "def": "Using built-in, trusted system binaries (PowerShell, certutil) for malicious purposes, blending into normal activity."
    }
  ],
  "GUIDE": [
    {
      "family": "malware",
      "name": "Malware attacks",
      "chainRole": "Execution → Persistence → Impact",
      "types": [
        {
          "type": "Ransomware",
          "sign": "Mass file renames, ransom note, shadow copies deleted, entropy spike"
        },
        {
          "type": "Trojan",
          "sign": "Useful-looking app beacons to a C2 domain on a schedule"
        },
        {
          "type": "Worm",
          "sign": "Sequential scans; each victim starts the same sweep - it spreads itself"
        },
        {
          "type": "Spyware",
          "sign": "Quiet collection: keystrokes, screens, browsing - uploaded in bulk"
        },
        {
          "type": "Adware",
          "sign": "Browser hijack, ad injection, redirected search - annoyance-grade"
        },
        {
          "type": "Virus",
          "sign": "Host files modified (hash changes); spreads via shared files/media"
        },
        {
          "type": "Rootkit",
          "sign": "OS hides processes; kernel driver; defenses disabled below the OS"
        },
        {
          "type": "Keylogger",
          "sign": "Keystroke buffer grows; credentials and card data exfiltrated"
        },
        {
          "type": "Logic bomb",
          "sign": "Dormant until a date or data condition fires the payload"
        },
        {
          "type": "Fileless malware",
          "sign": "Office/PowerShell parent-child chains; payload only in memory"
        }
      ]
    },
    {
      "family": "physical",
      "name": "Physical attacks",
      "chainRole": "Initial Access - the real world is an attack surface",
      "types": [
        {
          "type": "Tailgating",
          "sign": "One badge swipe, two people entering; no visitor record"
        },
        {
          "type": "Shoulder surfing",
          "sign": "Observer (or phone) behind a screen where secrets are typed"
        },
        {
          "type": "Skimming",
          "sign": "Badge clone: duplicate reads at impossible distance/time"
        },
        {
          "type": "Forced entry",
          "sign": "Pry marks, scratched lock cylinder, bypassed alarm zones"
        }
      ]
    },
    {
      "family": "network",
      "name": "Network attacks",
      "chainRole": "Initial Access → Credential Access → Impact",
      "types": [
        {
          "type": "Distributed denial of service (DDoS)",
          "sign": "Volumetric flood, thousands of sources, service unreachable"
        },
        {
          "type": "Protocol downgrade",
          "sign": "Sessions renegotiate to SSLv3 / TLS 1.0 and broken ciphers"
        },
        {
          "type": "Rogue access point",
          "sign": "Unmanaged SSID twin, stronger signal, clients auto-join"
        },
        {
          "type": "Sniffing",
          "sign": "Promiscuous NIC / capture files harvesting cleartext credentials"
        },
        {
          "type": "Spoofing",
          "sign": "Traffic wearing a trusted IP/MAC identity that is not theirs"
        },
        {
          "type": "On-path attack",
          "sign": "Relayed traffic: ARP anomalies + unexpected certificate warnings"
        },
        {
          "type": "DNS hijacking",
          "sign": "Registrar/NS records changed; the whole domain re-pointed"
        },
        {
          "type": "Cache poisoning",
          "sign": "One resolver answers wrong while others resolve correctly"
        }
      ]
    },
    {
      "family": "social",
      "name": "Social engineering attacks",
      "chainRole": "Initial Access - the human is the exploit",
      "types": [
        {
          "type": "Phishing",
          "sign": "Mass generic lure, cloned login page, \"urgent\" payment/notice"
        },
        {
          "type": "Spear phishing",
          "sign": "Researched personal context aimed at one target"
        },
        {
          "type": "Whaling",
          "sign": "Executive target, lookalike domain, wire/approval pressure"
        },
        {
          "type": "Smishing",
          "sign": "SMS lure to a freshly registered lookalike domain"
        },
        {
          "type": "Vishing",
          "sign": "Voice call harvesting codes/credentials; spoofed caller ID"
        },
        {
          "type": "Quishing",
          "sign": "Swapped/planted QR code; phone hides the destination"
        },
        {
          "type": "Impersonation",
          "sign": "Invented role + borrowed props; fails under verification"
        },
        {
          "type": "Deepfake",
          "sign": "Synthesized face/voice of a real leader authorizing access"
        }
      ]
    },
    {
      "family": "application",
      "name": "Application attacks",
      "chainRole": "Initial Access → Privilege Escalation → Collection",
      "types": [
        {
          "type": "Injection",
          "sign": "Input becomes SQL/code; errors leak the schema"
        },
        {
          "type": "Buffer overflow",
          "sign": "Oversized input crashes/corrupts memory (0x41414141...)"
        },
        {
          "type": "Replay",
          "sign": "Identical valid request resubmitted - and accepted - repeatedly"
        },
        {
          "type": "Privilege escalation",
          "sign": "Actions far above the assigned role; audit logging lowered"
        },
        {
          "type": "Forgery",
          "sign": "Attacker-minted tokens signed with a leaked/retired key"
        },
        {
          "type": "Directory traversal",
          "sign": "../ (or encoded) paths climbing out of the webroot"
        }
      ]
    },
    {
      "family": "credential",
      "name": "Credential attacks",
      "chainRole": "Credential Access → lateral movement with Valid Accounts",
      "types": [
        {
          "type": "Password spraying",
          "sign": "Few passwords x many accounts; failures spread under lockouts"
        },
        {
          "type": "Brute force",
          "sign": "Massive systematic guessing against one account"
        },
        {
          "type": "User enumeration",
          "sign": "Timing/message differences reveal which usernames exist"
        },
        {
          "type": "Credential replay",
          "sign": "Stolen session/cookie reused from a second location, no re-auth"
        },
        {
          "type": "MFA bypass",
          "sign": "Push-notification flood until the victim approves (fatigue)"
        }
      ]
    },
    {
      "family": "benign",
      "name": "Cross-family: indicators of compromise (IoC)",
      "chainRole": "The evidence layer every family leaves behind",
      "types": [
        {
          "type": "Hash / IP / Domain",
          "sign": "Network- and file-level anchors to block and hunt"
        },
        {
          "type": "Malicious process",
          "sign": "Hidden, unsigned, or absurd parent-child process trees"
        },
        {
          "type": "File system artifact",
          "sign": "Ransom notes, buffer files, dropped drivers"
        },
        {
          "type": "Timestamp anomaly",
          "sign": "Jobs and logins at hours no owner can explain"
        },
        {
          "type": "Log manipulation",
          "sign": "Truncated or cleared logs - the attacker hiding work"
        },
        {
          "type": "Resource consumption",
          "sign": "Unexplained CPU/bandwidth spikes"
        },
        {
          "type": "Plaintext strings",
          "sign": "Credentials visible in captures, buffers, storage"
        },
        {
          "type": "Account lockout",
          "sign": "Lockout clusters that betray spraying"
        },
        {
          "type": "Impossible travel / Concurrent sessions",
          "sign": "One identity in two places at once"
        }
      ]
    }
  ],
  "MITRE_LINKS": [
    {
      "id": "T1566",
      "name": "Phishing",
      "url": "https://attack.mitre.org/techniques/T1566/"
    },
    {
      "id": "T1110.003",
      "name": "Password Spraying",
      "url": "https://attack.mitre.org/techniques/T1110/003/"
    },
    {
      "id": "T1557",
      "name": "Adversary-in-the-Middle",
      "url": "https://attack.mitre.org/techniques/T1557/"
    },
    {
      "id": "T1498",
      "name": "Network Denial of Service",
      "url": "https://attack.mitre.org/techniques/T1498/"
    },
    {
      "id": "T1056.001",
      "name": "Keylogging",
      "url": "https://attack.mitre.org/techniques/T1056/001/"
    },
    {
      "id": "T1014",
      "name": "Rootkit",
      "url": "https://attack.mitre.org/techniques/T1014/"
    },
    {
      "id": "T1621",
      "name": "MFA Request Generation",
      "url": "https://attack.mitre.org/techniques/T1621/"
    },
    {
      "id": "T1684.001",
      "name": "Social Engineering: Impersonation",
      "url": "https://attack.mitre.org/techniques/T1684/001/"
    }
  ],
  "MITRE_MITIGATIONS": [
    {
      "id": "M1017",
      "name": "User Training",
      "covers": "Phishing, vishing, quishing, tailgating, MFA fatigue"
    },
    {
      "id": "M1032",
      "name": "Multi-factor Authentication",
      "covers": "Password spraying, brute force, credential replay"
    },
    {
      "id": "M1027",
      "name": "Password Policies",
      "covers": "Brute force, spraying - banned-password lists, length"
    },
    {
      "id": "M1030",
      "name": "Network Segmentation",
      "covers": "Worm propagation, DDoS blast radius, lateral movement"
    },
    {
      "id": "M1038",
      "name": "Execution Prevention",
      "covers": "Fileless malware, LOLBins, malicious Office macros"
    },
    {
      "id": "M1051",
      "name": "Update Software",
      "covers": "Buffer overflow, injection, worm-exploited services"
    },
    {
      "id": "M1053",
      "name": "Data Backup",
      "covers": "Ransomware recovery - offline, tested, immutable"
    },
    {
      "id": "M1026",
      "name": "Privileged Account Management",
      "covers": "Privilege escalation, forged tokens, admin abuse"
    },
    {
      "id": "M1031",
      "name": "Filter Network Traffic",
      "covers": "DDoS scrubbing, C2 blocking, downgrade protocols"
    },
    {
      "id": "M1028",
      "name": "Operating System Configuration",
      "covers": "TLS config, DNSSEC, promiscuous-mode policy"
    }
  ],
  "REAL_WORLD_EXAMPLES": [
    {
      "title": "Vishing at scale - Twitter, July 2020",
      "body": "Attackers phoned Twitter employees posing as IT and harvested credentials plus MFA codes, then accessed high-profile accounts. Voice channel + human trust beat technical controls."
    },
    {
      "title": "Password spraying - CISA advisory AA20-301A",
      "body": "CISA documented Russian state actors (GRU) running large-scale password spraying against US targets: few passwords, thousands of accounts, failures kept under lockout thresholds."
    },
    {
      "title": "Ransomware with impact - Colonial Pipeline, May 2021",
      "body": "DarkSide ransomware forced a 5,500-mile fuel pipeline offline. Indicator chain: credential compromise, lateral movement, mass encryption, extortion note - exactly the family set this chapter teaches."
    },
    {
      "title": "Deepfake finance fraud - Hong Kong, 2024",
      "body": "An employee wired ~25M USD after a video call where every \"colleague\" was a deepfake. The verification gap - no out-of-band callback - is the control lesson."
    }
  ]
};

/* ---- constants that lived in the original types.ts ---- */
window.LAB_CONST = {
  DISPOSITIONS: [
    'Escalate to incident response',
    'Contain and block (network / identity)',
    'Reset credentials and revoke sessions',
    'Monitor and tune detections',
    'Report to management (awareness follow-up)',
    'Cleared - benign, tune the alert',
  ],
  FAMILY_LABELS: {
    malware: 'Malware attack',
    physical: 'Physical attack',
    network: 'Network attack',
    social: 'Social engineering',
    application: 'Application attack',
    credential: 'Credential attack',
    benign: 'Benign / false positive',
  },
  IOC_NAMES: [
    'Hash', 'IP address', 'Domain', 'Malicious process', 'File system artifact',
    'Timestamp anomaly', 'Log manipulation', 'Excessive resource consumption',
    'Plaintext strings', 'Account lockout', 'Impossible travel', 'Concurrent sessions',
  ],
};
