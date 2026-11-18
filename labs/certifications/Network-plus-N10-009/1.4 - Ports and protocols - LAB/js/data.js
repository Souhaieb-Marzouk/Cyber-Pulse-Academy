// ============================================================================
// The Grand Exchange — js/data.js
// ALL lab content, separated from all logic (SC-D7).
//
// This file is a faithful, machine-generated port of the original framework
// lab's data modules (src/lib/lab/{content,protocols,objectives,quiz,types}.ts).
// Every string — scenario, manual, glossary, debrief, links, the 13 protocols
// with their line taps, all 20 work orders with hints/feedback/near-miss
// messages, and all 13 quiz items — is byte-identical to the original.
//
// ALL DATA IS SIMULATED TRAINING DATA. Fictional org "Harborline Transit
// Authority". IPs use RFC 5737 / RFC 1918 test ranges. Credentials are fictional.
// ============================================================================

// Scenario, operator's manual (knowledge core), glossary, handover debrief, reference links.
const SCENARIO = {
  "org": "Harborline Transit Authority",
  "badge": "SIMULATED TRAINING ENVIRONMENT — FICTIONAL ORG, SYNTHETIC DATA",
  "title": "The Grand Exchange",
  "subtitle": "CompTIA Network+ N10-009 · Objective 1.4 — ports, protocols, services & traffic types",
  "brief": [
    "Harborline Transit Authority runs 412 fare gates, 96 ticket kiosks, a VoIP phone network and the ops center that watches all of it. Last month's internal audit read like a list of old habits: a Telnet line still patched to a core switch, an FTP export with passwords crossing the wire, an SNMP monitor asking for 'public', and a jump host's remote-desktop port reachable from the internet.",
    "You are the new network operator. The veteran dispatcher left you her shift docket: learn every jack on the board, hear the difference between a sealed line and a clear one, screen the exchange, and re-patch what needs re-patching. Day Shift walks you through it; Night Shift hands you the board alone.",
    "Every log, capture and credential in this lab is synthetic training data for a fictional organization. The skills are the real thing you will be tested on in N10-009 Domain 1.4 — and use on every network you ever defend."
  ]
};

const MANUAL = {
  "intro": "The operator's manual — the knowledge core for this shift. Ten minutes here makes every work order faster.",
  "sections": [
    {
      "title": "What a port actually is",
      "body": "A port is a 16-bit number that identifies which service on a host should receive a packet — a numbered doorway. The pair (IP address, port) is a socket. Clients connect FROM an ephemeral (temporary) port TO the service's well-known port: 10.20.7.42:51344 → 10.20.4.11:21 is a client on a random line dialing into the FTP jack. Knowing the number is knowing the service."
    },
    {
      "title": "The three ranges on the board",
      "body": "Well-known 0–1023: core services — 21, 22, 23, 25, 53, 67/68, 80, 443, 161/162, 389, 5060/5061. Registered 1024–49151: vendor-assigned — RDP's 3389 lives here (a favorite exam trap: it is NOT well-known). Dynamic/ephemeral 49152–65535: the client side, the scratch lines every connection starts from."
    },
    {
      "title": "TCP vs UDP: held cord vs dropped telegram",
      "body": "TCP is a held-open cord: 3-way handshake (SYN, SYN/ACK, ACK), ordered, reliable — file transfers, mail, web, remote access. UDP is a dropped-off telegram: no handshake, no delivery promise — DNS queries, DHCP, SNMP polling, RTP voice. Some protocols use both: DNS does UDP 53 for lookups and TCP 53 for zone transfers; RDP and SIP use TCP and UDP."
    },
    {
      "title": "Clear line vs sealed line (why attackers care)",
      "body": "Six of the thirteen lines cross the wire readable: FTP (21), Telnet (23), HTTP (80), SMTP relays (25), SNMPv1/v2c (161), LDAP simple binds (389), and SIP signaling on 5060. A tap captures credentials, community strings, session cookies, directory queries, extension numbers. The fix pattern is always the same: move the job to the encrypted line — SFTP(22), SSH(22), HTTPS(443), SNMPv3, LDAPS(636), SIP-TLS(5061). MITRE ATT&CK frames this defensively as Network Sniffing (T1040) and Network Service Scanning (T1046): every open, unencrypted jack is recon material — simplified technique-level context for this lab."
    },
    {
      "title": "Variants & pivots to keep straight",
      "body": "FTP: 21 control + 20 data (active); passive mode negotiates a data port. DNS: UDP for lookups, TCP for AXFR zone transfers — an AXFR to a non-secondary is a finding. DHCP: DORA, first offer accepted — rogue server risk, DHCP snooping is the counter. SNMP: 161 agent polls, 162 traps — direction matters. RDP: 3389 TCP + UDP, registered range. SIP: 5060 cleartext / 5061 TLS; media rides RTP on ephemeral UDP. SMTP: 25 server-to-server; 587/465 client submission (adjacent)."
    },
    {
      "title": "Quick reference — the 13 jacks",
      "table": [
        [
          "FTP",
          "20/21",
          "TCP",
          "file transfer (cleartext)",
          "→ SFTP 22"
        ],
        [
          "SFTP",
          "22",
          "TCP",
          "file transfer (SSH channel)",
          "—"
        ],
        [
          "SSH",
          "22",
          "TCP",
          "secure remote terminal",
          "—"
        ],
        [
          "Telnet",
          "23",
          "TCP",
          "remote terminal (cleartext)",
          "→ SSH 22"
        ],
        [
          "SMTP",
          "25",
          "TCP",
          "mail relay (cleartext)",
          "→ 587/465 TLS (adjacent)"
        ],
        [
          "DNS",
          "53",
          "UDP+TCP",
          "names (TCP for AXFR)",
          "—"
        ],
        [
          "DHCP",
          "67/68",
          "UDP",
          "address leasing (DORA)",
          "snooping"
        ],
        [
          "HTTP",
          "80",
          "TCP",
          "web (cleartext)",
          "→ HTTPS 443"
        ],
        [
          "HTTPS",
          "443",
          "TCP",
          "web over TLS",
          "—"
        ],
        [
          "SNMP",
          "161/162",
          "UDP",
          "monitoring + traps (v2c clear)",
          "→ v3"
        ],
        [
          "LDAP",
          "389",
          "TCP",
          "directory (clear binds)",
          "→ LDAPS 636"
        ],
        [
          "RDP",
          "3389",
          "TCP+UDP",
          "remote desktop (registered!)",
          "VPN/bastion"
        ],
        [
          "SIP",
          "5060/5061",
          "TCP+UDP",
          "VoIP signaling",
          "→ TLS 5061"
        ]
      ]
    }
  ]
};

const GLOSSARY = [
  {
    "term": "Port",
    "def": "A 16-bit number identifying a specific service on a host."
  },
  {
    "term": "Socket",
    "def": "IP address + port together; one endpoint of a connection."
  },
  {
    "term": "Well-known ports",
    "def": "0–1023 — reserved for core services (22, 25, 53, 80, 443…)."
  },
  {
    "term": "Registered ports",
    "def": "1024–49151 — vendor-assigned services; RDP's 3389 lives here."
  },
  {
    "term": "Ephemeral ports",
    "def": "49152–65535 — temporary client-side source ports."
  },
  {
    "term": "TCP",
    "def": "Connection-oriented transport: handshake, ordered, reliable."
  },
  {
    "term": "UDP",
    "def": "Connectionless transport: fast, no handshake, no delivery guarantee."
  },
  {
    "term": "Three-way handshake",
    "def": "SYN → SYN/ACK → ACK that opens every TCP connection."
  },
  {
    "term": "DORA",
    "def": "DHCP's lease dance: Discover, Offer, Request, Acknowledge."
  },
  {
    "term": "Cleartext",
    "def": "Data transmitted readable by anyone on the path."
  },
  {
    "term": "TLS",
    "def": "Transport Layer Security — encrypts HTTPS(443), LDAPS(636), SIP(5061)."
  },
  {
    "term": "Banner",
    "def": "A service's greeting string on connect; reveals protocol and version."
  },
  {
    "term": "Community string",
    "def": "SNMP v1/v2c password-equivalent, sent in cleartext; default 'public'."
  },
  {
    "term": "Zone transfer (AXFR)",
    "def": "DNS copying a whole zone over TCP 53; must be restricted to secondaries."
  },
  {
    "term": "RTP",
    "def": "Real-time Transport Protocol — carries VoIP media on ephemeral UDP ports."
  }
];

const DEBRIEF = {
  "detection": {
    "intro": "Where each line shows up in real defenses — the data sources and the logic you'd tune.",
    "rows": [
      [
        "Flow / NetFlow logs",
        "dst-port 23, 21 or 161 on ops VLANs; any any→3389 from external ranges",
        "Policy-violation alert to the service-owner list"
      ],
      [
        "Packet capture / DPI",
        "USER+PASS on 21/23; community=\"public\"; SMTP relays to odd destinations",
        "Cleartext-credential alert (T1040, simplified)"
      ],
      [
        "Windows Security log",
        "4625 failure burst then 4624 from one external source → 3389",
        "Brute-force + success correlation on the jump host"
      ],
      [
        "DHCP snooping log",
        "OFFER arriving on a switch port not marked trusted",
        "Rogue-DHCP alert; port shut / alert"
      ],
      [
        "DNS server logs",
        "AXFR request from a host outside the transfer allowlist; TXT/NULL volume spikes",
        "Zone-transfer + exfiltration-pattern alerts"
      ],
      [
        "Firewall logs",
        "Deny spikes; allows to unexpected ports (mail banner on 443)",
        "Exposure review ticket"
      ]
    ]
  },
  "mitigation": [
    "Replace every cleartext remote/file line: Telnet→SSH (22), FTP→SFTP (22) — retire the jack, don't just restrict it.",
    "Encrypt web traffic: HTTP→HTTPS (443) and redirect 80; SMTP relays stay on 25 server-to-server, clients on 587/465 with TLS (adjacent).",
    "SNMPv3 with non-default credentials for anything that still speaks v2c on 161; traps on 162 move with it.",
    "Directory access over LDAPS (636) instead of cleartext LDAP binds on 389.",
    "SIP over TLS (5061); restrict which hosts may REGISTER at the proxy — registration storms and toll fraud start on open 5060.",
    "RDP 3389: never any-any — VPN or bastion first, network-level authentication, account lockout; it is a registered-range port and the most brute-forced door in the building.",
    "DHCP snooping with only the real server's port trusted; DNS: no open recursion, AXFR allowlisted to secondaries; SMTP: relay only for your own ranges.",
    "Least-privilege firewall policy, most-specific allow rules first, explicit deny — and document every exception."
  ],
  "blue": [
    "Your port map IS your policy: know both numbers of dual-port services (20/21, 67/68, 161/162, 5060/5061) or your firewall rules will be wrong.",
    "Banner + port together identify a service; a mismatch (mail on 443) is either misconfig or concealment — both worth a ticket.",
    "Encrypted ≠ invisible: endpoints, timing and volume still tell a story over 443.",
    "First-come trust is a design flaw: DHCP clients take the first offer, so decide which ports MAY offer — that is snooping.",
    "Rule order matters: specific allow → general allow → deny all, evaluated top-down."
  ],
  "red": [
    "Recon starts as a port scan plus banner grabs (T1046, simplified): your inventory of listening jacks is the attacker's inventory too.",
    "Default credentials are tried first — 'public' on SNMP, vendor passwords on Telnet — changing them costs nothing.",
    "An internet-reachable 3389 is the shortest path into most Windows estates; close it before someone walks through.",
    "Cleartext lines are free credentials: FTP, Telnet, SNMPv2c, LDAP binds, SIP on 5060 all leak on a single tap.",
    "Hiding a service on a non-standard port reduces noise, not exposure — and a protocol/port mismatch stands out to anyone who looks."
  ]
};

const LINKS = [
  {
    "label": "CompTIA Network+ (N10-009) — official page & objectives",
    "url": "https://www.comptia.org/en-us/certifications/network",
    "note": "the certification this lab drills"
  },
  {
    "label": "IANA Service Name and Transport Protocol Port Number Registry",
    "url": "https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml",
    "note": "the authoritative port registry"
  },
  {
    "label": "MITRE ATT&CK T1046 — Network Service Scanning",
    "url": "https://attack.mitre.org/techniques/T1046/",
    "note": "how service/port discovery is used against you (defensive context)"
  },
  {
    "label": "MITRE ATT&CK T1021 — Remote Services (RDP T1021.001, SSH T1021.004)",
    "url": "https://attack.mitre.org/techniques/T1021/",
    "note": "remote-access lines in the attack chain"
  },
  {
    "label": "MITRE ATT&CK T1040 — Network Sniffing",
    "url": "https://attack.mitre.org/techniques/T1040/",
    "note": "why cleartext lines are harvested"
  }
];

// The 13 scoped protocols (N10-009 1.4) with synthetic line taps.
const PROTOCOLS = {
  "ftp": {
    "id": "ftp",
    "name": "FTP",
    "full": "File Transfer Protocol",
    "ports": "20 / 21",
    "portList": [
      20,
      21
    ],
    "transport": "TCP",
    "family": "File transfer",
    "purpose": "Moves files between hosts; 21 carries commands, 20 carries the data (active mode).",
    "secure": "insecure",
    "range": "well-known",
    "replacement": {
      "name": "SFTP",
      "port": "22",
      "note": "Same job, inside an encrypted SSH channel."
    },
    "detail": "FTP splits its work across two ports: 21 for commands and 20 for data in classic active mode (passive mode negotiates a data port dynamically). Everything — including USER and PASS — crosses the wire in cleartext, so anyone on the path can harvest credentials and files.",
    "payload": {
      "label": "Line tap · TCP 21 · archive host hln-fta01",
      "lines": [
        "220 hln-fta01.archive FTP server ready  [training.sim]",
        "USER jharper",
        "331 Password required for jharper",
        "PASS Br@ssboard48",
        "230 User jharper logged in",
        "CWD /export/fare-nightly",
        "TYPE I",
        "PASV",
        "227 Entering Passive Mode (10,20,4,11,198,77)",
        "STOR fare-nightly-2026-11-08.csv",
        "150 Ok to send data  ·  226 Transfer complete"
      ],
      "note": "Eavesdropper view: username AND password readable in the raw stream."
    }
  },
  "sftp": {
    "id": "sftp",
    "name": "SFTP",
    "full": "SSH File Transfer Protocol",
    "ports": "22",
    "portList": [
      22
    ],
    "transport": "TCP",
    "family": "File transfer",
    "purpose": "Runs file transfers inside an SSH channel — same port as SSH.",
    "secure": "secure",
    "range": "well-known",
    "detail": "SFTP is not 'FTP with a certificate': it is a subsystem of SSH, so it inherits SSH's encryption and authentication and rides the same TCP port 22. On the wire you only see the SSH banner and opaque encrypted blocks — no commands, no filenames, no credentials.",
    "payload": {
      "label": "Line tap · TCP 22 · hln-fta01 → partner relay",
      "lines": [
        "TCP 10.20.4.11:51088 → 10.20.9.20:22",
        "banner: SSH-2.0-OpenSSH_9.6",
        "KEX curve25519-sha256 · cipher aes256-gcm",
        "subsystem request: sftp",
        "···· binary application data (opaque) ····"
      ],
      "note": "A tap shows only noise after the handshake — the session is sealed."
    }
  },
  "ssh": {
    "id": "ssh",
    "name": "SSH",
    "full": "Secure Shell",
    "ports": "22",
    "portList": [
      22
    ],
    "transport": "TCP",
    "family": "Remote access",
    "purpose": "Encrypted remote terminal and administration; also tunnels SFTP/SCP.",
    "secure": "secure",
    "range": "well-known",
    "detail": "SSH is the secure replacement for Telnet: a TCP session on port 22 that negotiates keys, then encrypts everything. The banner (SSH-2.0-…) is the one readable piece and reveals the server software — attackers use banners to pick exploits, defenders use them for inventory.",
    "payload": {
      "label": "Line tap · TCP 22 · ops workstation → bos-core-1",
      "lines": [
        "TCP 10.20.7.42:51402 → 10.20.4.11:22",
        "banner: SSH-2.0-OpenSSH_9.6",
        "KEX curve25519-sha256 · host key ed25519",
        "···· encrypted channel (binary) ····"
      ],
      "note": "Commands and passwords travel inside the encrypted channel."
    }
  },
  "telnet": {
    "id": "telnet",
    "name": "Telnet",
    "full": "Telnet (remote terminal)",
    "ports": "23",
    "portList": [
      23
    ],
    "transport": "TCP",
    "family": "Remote access",
    "purpose": "Legacy cleartext remote terminal.",
    "secure": "insecure",
    "range": "well-known",
    "replacement": {
      "name": "SSH",
      "port": "22",
      "note": "Drop jack 23 entirely — do not just 'restrict' it."
    },
    "detail": "Telnet gives a remote terminal on TCP 23 but sends every keystroke — login, password, commands — as plain ASCII. Packet capture replaces the need to attack the host at all. Its presence on a modern network is a finding of its own.",
    "payload": {
      "label": "Line tap · TCP 23 · legacy switch bos-core-1",
      "lines": [
        "Connected to 10.20.4.11. Escape char '^]'.",
        "HLN terminal services — BOS-CORE-1  [training.sim]",
        "login: opsreader",
        "Password: Sw1tchb0ard!",
        "Last login: Fri Nov  6 22:14 from 10.20.7.42",
        "opsreader@bos-core-1:~$ show fare-gate --all"
      ],
      "note": "Every keystroke — including the password — is readable in the raw stream."
    }
  },
  "smtp": {
    "id": "smtp",
    "name": "SMTP",
    "full": "Simple Mail Transfer Protocol",
    "ports": "25",
    "portList": [
      25
    ],
    "transport": "TCP",
    "family": "Email",
    "purpose": "Transfers (relays) mail between mail servers.",
    "secure": "insecure",
    "range": "well-known",
    "replacement": {
      "name": "Submission + TLS",
      "port": "587 / 465",
      "note": "25 stays server-to-server; clients use 587 with STARTTLS (adjacent detail)."
    },
    "detail": "SMTP speaks a readable dialog on TCP 25: HELO, MAIL FROM, RCPT TO. An SMTP server that relays mail for anyone ('open relay') gets abused by spammers within hours, so modern servers restrict relay and wrap client traffic in TLS on submission ports (adjacent: 587/465).",
    "payload": {
      "label": "Line tap · TCP 25 · fares-gw → mail hub",
      "lines": [
        "220 mail.hln.example ESMTP Postfix  [training.sim]",
        "HELO fares-gw.hln.example",
        "MAIL FROM:<fares@hln.example>",
        "RCPT TO:<nightly@partner-shipping.example>",
        "250 Ok  ·  DATA 354 End with <CR><LF>.<CR><LF>"
      ],
      "note": "Sender, recipient and relay policy are all visible on the wire."
    }
  },
  "dns": {
    "id": "dns",
    "name": "DNS",
    "full": "Domain Name System",
    "ports": "53",
    "portList": [
      53
    ],
    "transport": "TCP/UDP",
    "family": "Name resolution",
    "purpose": "Resolves names to addresses; UDP 53 for queries, TCP 53 for zone transfers & large answers.",
    "secure": "conditional",
    "range": "well-known",
    "detail": "Normal lookups are a single UDP request/response on port 53. Zone transfers (AXFR) and oversized responses fall back to TCP 53 because they need reliable, ordered delivery. An AXFR answered to a host that is not your designated secondary hands over your whole namespace map.",
    "payload": {
      "label": "Line tap · UDP 53 query, then TCP 53 transfer",
      "lines": [
        "UDP 10.20.7.42:51344 → 10.20.1.53:53",
        "A? kiosk-2214.fares.hln.example  →  10.20.7.14  TTL 300",
        "――― later, same shift ―――",
        "TCP 10.20.9.40:51190 → 10.20.1.53:53",
        "AXFR? hln.example",
        "→ SOA, NS ×2, A ×27 … 1,142 bytes  [zone transfer]"
      ],
      "note": "Query = one small UDP datagram. Zone transfer = TCP, and it dumps the map."
    }
  },
  "dhcp": {
    "id": "dhcp",
    "name": "DHCP",
    "full": "Dynamic Host Configuration Protocol",
    "ports": "67 / 68",
    "portList": [
      67,
      68
    ],
    "transport": "UDP",
    "family": "Address assignment",
    "purpose": "Leases IPs and options: server 67, client 68; the DORA exchange; first offer wins.",
    "secure": "conditional",
    "range": "well-known",
    "detail": "A newcomer broadcasts a DISCOVER from UDP 68 to 67; every server answers with an OFFER; the client REQUESTs the first offer it received and the server ACKs — DORA. Because any host can speak first, a rogue DHCP server can hand out itself as the gateway. DHCP snooping only trusts the port where the real server sits.",
    "payload": {
      "label": "Line tap · UDP 67/68 · branch VLAN 7",
      "lines": [
        "1 DISCOVER  0.0.0.0:68 → 255.255.255.255:67  (broadcast)",
        "2 OFFER    10.20.1.1:67 → 255.255.255.255:68  yiaddr=10.20.7.42  gw=10.20.7.1  dns=10.20.1.53  lease=8h",
        "3 REQUEST  0.0.0.0:68 → 255.255.255.255:67  requested=10.20.7.42  server=10.20.1.1",
        "4 ACK      10.20.1.1:67 → 255.255.255.255:68  yiaddr=10.20.7.42  gw=10.20.7.1"
      ],
      "note": "Client has no IP yet, so DISCOVER/REQUEST come from 0.0.0.0 and are broadcast."
    }
  },
  "http": {
    "id": "http",
    "name": "HTTP",
    "full": "Hypertext Transfer Protocol",
    "ports": "80",
    "portList": [
      80
    ],
    "transport": "TCP",
    "family": "Web",
    "purpose": "Serves web content in the clear.",
    "secure": "insecure",
    "range": "well-known",
    "replacement": {
      "name": "HTTPS",
      "port": "443",
      "note": "Wrap in TLS; redirect 80 → 443."
    },
    "detail": "HTTP on TCP 80 is fully readable: paths, headers, cookies, form posts. A tap shows where users go and often carries session cookies that can be replayed. HTTPS (443) encrypts the same conversation.",
    "payload": {
      "label": "Line tap · TCP 80 · kiosk K-2214 heartbeat",
      "lines": [
        "GET /kiosk/heartbeat?kiosk=K-2214 HTTP/1.1",
        "Host: fares.harborline-transit.example",
        "User-Agent: FareKiosk/3.2",
        "Accept: text/plain",
        "HTTP/1.1 200 OK"
      ],
      "note": "Readable, but this particular request carries no credentials — headers often do (cookies)."
    }
  },
  "https": {
    "id": "https",
    "name": "HTTPS",
    "full": "HTTP over TLS",
    "ports": "443",
    "portList": [
      443
    ],
    "transport": "TCP",
    "family": "Web",
    "purpose": "Serves web content inside a TLS session.",
    "secure": "secure",
    "range": "well-known",
    "detail": "HTTPS runs HTTP inside TLS on TCP 443. A tap sees the ClientHello (with SNI — the site name), certificate details, then opaque ApplicationData. Content is hidden, but endpoints, timing and volume still leak — large night-time uploads to a new external host still stand out.",
    "payload": {
      "label": "Line tap · TCP 443 · kiosk → fares app",
      "lines": [
        "TCP 10.20.7.14:49221 → 10.20.5.10:443",
        "TLS 1.3  ClientHello  SNI=fares.harborline-transit.example",
        "certificate: CN=fares.harborline-transit.example",
        "···· ApplicationData (opaque) ····"
      ],
      "note": "Encrypted content — but SNI, endpoints and volume remain visible."
    }
  },
  "snmp": {
    "id": "snmp",
    "name": "SNMP",
    "full": "Simple Network Management Protocol",
    "ports": "161 / 162",
    "portList": [
      161,
      162
    ],
    "transport": "UDP",
    "family": "Monitoring",
    "purpose": "Polls device state on UDP 161; agents push trap notifications to UDP 162.",
    "secure": "insecure",
    "range": "well-known",
    "replacement": {
      "name": "SNMPv3",
      "port": "161",
      "note": "v3 adds authentication + encryption; change default community strings."
    },
    "detail": "Managers poll agents on UDP 161; agents fire unsolicited traps to the manager on UDP 162. SNMPv1/v2c authenticate with a community string sent in cleartext — the default 'public' is password-equivalent and famous. SNMPv3 encrypts and authenticates properly.",
    "payload": {
      "label": "Line tap · UDP 161 · monitor → gate controller",
      "lines": [
        "UDP 10.20.7.42:49155 → 10.20.4.30:161",
        "SNMPv2c  GET  community=\"public\"",
        "  1.3.6.1.2.1.1.1.0 (sysDescr)  → \"HLN gate-controller fw 4.2\"",
        "  1.3.6.1.2.1.1.3.0 (sysUpTime) → 41d 06:12:44"
      ],
      "note": "community=\"public\" is the default — reading it is like reading a password."
    }
  },
  "ldap": {
    "id": "ldap",
    "name": "LDAP",
    "full": "Lightweight Directory Access Protocol",
    "ports": "389",
    "portList": [
      389
    ],
    "transport": "TCP",
    "family": "Directory services",
    "purpose": "Queries the directory (users, groups, services) — e.g., Active Directory.",
    "secure": "insecure",
    "range": "well-known",
    "replacement": {
      "name": "LDAPS",
      "port": "636",
      "note": "TLS-wrapped directory access (adjacent port — worth memorising)."
    },
    "detail": "LDAP on TCP 389 answers directory queries — who is in this group, what is this account. Simple binds carry the bind DN and password in cleartext, so a tap captures service-account credentials; attackers abuse LDAP to enumerate users and groups. LDAPS wraps the same traffic in TLS on 636.",
    "payload": {
      "label": "Line tap · TCP 389 · fares app → directory",
      "lines": [
        "TCP 10.20.4.11:51220 → 10.20.1.60:389",
        "bindRequest: cn=svc-fares,ou=services,dc=hln,dc=example  [simple bind — cleartext]",
        "searchRequest: (memberOf=cn=gate-staff,ou=groups,dc=hln,dc=example)",
        "→ 3 entries returned"
      ],
      "note": "The bind DN + password cross the wire unencrypted on a simple bind."
    }
  },
  "rdp": {
    "id": "rdp",
    "name": "RDP",
    "full": "Remote Desktop Protocol",
    "ports": "3389",
    "portList": [
      3389
    ],
    "transport": "TCP/UDP",
    "family": "Remote access",
    "purpose": "Graphical remote desktop to Windows hosts; TCP 3389 plus UDP 3389 for graphics.",
    "secure": "conditional",
    "range": "registered",
    "detail": "RDP listens on 3389 — a registered port, not well-known — over TCP and UDP. The session itself is encrypted, so taps see no keystrokes; the danger is exposure: an RDP port reachable from the internet is one of the most brute-forced doors there is. Standard defense: never any-any — VPN or bastion, network-level auth, lockout policy.",
    "payload": {
      "label": "Line tap · TCP+UDP 3389 · jump host hln-jump01",
      "lines": [
        "TCP 198.51.100.9:51244 → 10.20.1.15:3389   ← from OUTSIDE the network",
        "TLS negotiated (hybrid) → binary session stream",
        "UDP 10.20.1.15:3389 ↔ same session (graphics channel)"
      ],
      "note": "Encrypted content; the finding is the source — an external address touching 3389."
    }
  },
  "sip": {
    "id": "sip",
    "name": "SIP",
    "full": "Session Initiation Protocol",
    "ports": "5060 / 5061",
    "portList": [
      5060,
      5061
    ],
    "transport": "TCP/UDP",
    "family": "VoIP signaling",
    "purpose": "Sets up and tears down VoIP calls (REGISTER, INVITE); 5061 is SIP over TLS.",
    "secure": "insecure",
    "range": "well-known",
    "replacement": {
      "name": "SIP over TLS",
      "port": "5061",
      "note": "Also restrict the proxy: who may REGISTER at all."
    },
    "detail": "SIP is the signaling side of VoIP: extensions REGISTER on 5060 and calls are INVITEd — the voice itself rides separately on RTP over negotiated ephemeral UDP ports. Cleartext SIP exposes extension numbers, user names and digest hints; open registration invites toll fraud. TLS on 5061 seals the signaling.",
    "payload": {
      "label": "Line tap · UDP/TCP 5060 · phone → SIP proxy",
      "lines": [
        "UDP 10.20.6.20:5060 → 10.20.1.70:5060",
        "REGISTER sip:sip.hln.example SIP/2.0  expires=3600",
        "From: <sip:2001@hln.example>",
        "Authorization: Digest username=\"2001\", realm=\"hln\", response=\"9f2e…\"",
        "TCP 10.20.6.20:5060 → 10.20.1.70:5060  INVITE sip:2005@hln.example",
        "SDP: audio RTP 10.20.6.20:16400 (ephemeral UDP)"
      ],
      "note": "Extensions and usernames are readable; media lives elsewhere on RTP."
    }
  }
};

const PROTOCOL_ORDER = [
  "ftp",
  "sftp",
  "ssh",
  "telnet",
  "smtp",
  "dns",
  "dhcp",
  "http",
  "https",
  "snmp",
  "ldap",
  "rdp",
  "sip"
];

const TICKER = [
  "TCP 10.20.7.42:51344 → 10.20.4.11:21   FTP export in progress",
  "UDP 10.20.7.42:49155 → 10.20.4.30:161  SNMP poll (v2c)",
  "TCP 10.20.7.14:49221 → 10.20.5.10:443  HTTPS kiosk heartbeat",
  "UDP 0.0.0.0:68 → 255.255.255.255:67    DHCP DISCOVER (broadcast)",
  "UDP 10.20.7.42:51344 → 10.20.1.53:53   DNS A query",
  "TCP 10.20.7.42:51402 → 10.20.4.11:22   SSH admin session",
  "TCP 198.51.100.9:51244 → 10.20.1.15:3389   RDP from OUTSIDE — flag",
  "UDP 10.20.6.20:5060 → 10.20.1.70:5060  SIP REGISTER ext 2001",
  "TCP 10.20.4.11:51220 → 10.20.1.60:389  LDAP bind (cleartext)",
  "TCP 10.20.9.20:49010 → 10.20.4.11:2049 NFS (registered port)"
];

const FLOW_LOG = [
  {
    "id": "r1",
    "cells": [
      "1",
      "TCP",
      "10.20.7.42:51344",
      "10.20.4.11:21",
      "10.2 KB",
      "FTP export"
    ]
  },
  {
    "id": "r2",
    "cells": [
      "2",
      "TCP",
      "10.20.7.42:51345",
      "10.20.4.11:22",
      "86 KB",
      "admin session"
    ]
  },
  {
    "id": "r3",
    "cells": [
      "3",
      "UDP",
      "10.20.6.20:5060",
      "10.20.1.70:5060",
      "1.1 KB",
      "VoIP signaling"
    ]
  },
  {
    "id": "r4",
    "cells": [
      "4",
      "TCP",
      "10.20.9.20:49010",
      "10.20.4.11:2049",
      "412 KB",
      "file share (NFS)"
    ]
  },
  {
    "id": "r5",
    "cells": [
      "5",
      "UDP",
      "10.20.7.42:68",
      "10.20.1.1:67",
      "0.6 KB",
      "DHCP renewal"
    ]
  },
  {
    "id": "r6",
    "cells": [
      "6",
      "TCP",
      "10.20.5.10:49221",
      "10.20.9.30:8080",
      "9.8 KB",
      "internal app (alt port)"
    ]
  },
  {
    "id": "r7",
    "cells": [
      "7",
      "TCP",
      "10.20.7.9:51092",
      "10.20.1.15:3389",
      "22 KB",
      "remote desktop"
    ]
  },
  {
    "id": "r8",
    "cells": [
      "8",
      "UDP",
      "10.20.6.20:16400",
      "10.20.6.21:16402",
      "2.4 MB",
      "RTP call audio"
    ]
  }
];

// Medium mode: OBJ-M1..M11 (11 guided work orders).
const OBJECTIVES_MEDIUM = [
  {
    "id": "OBJ-M1",
    "mode": "medium",
    "pillar": "P1",
    "title": "Range check on the board",
    "prompt": [
      "Every jack number on the board belongs to one of three ranges. Sort the six tags into the right bucket.",
      "Watch out: the most-used admin jack on the board is NOT well-known."
    ],
    "whereToLook": "Board — any jack plate; the Manual's “three ranges” section",
    "hints": [
      "Ranges: 0–1023 well-known · 1024–49151 registered · 49152–65535 dynamic/ephemeral.",
      "8080 is a registered alternative web port; RDP's 3389 is registered, not well-known.",
      "21 and 53 are well-known. 3389 and 8080 are registered. 49152 and 63001 are ephemeral."
    ],
    "config": {
      "kind": "sort",
      "sort": {
        "trayLabel": "Tags from the exchange ledger",
        "items": [
          {
            "id": "t21",
            "label": "21",
            "sub": "FTP control"
          },
          {
            "id": "t53",
            "label": "53",
            "sub": "DNS"
          },
          {
            "id": "t3389",
            "label": "3389",
            "sub": "RDP"
          },
          {
            "id": "t8080",
            "label": "8080",
            "sub": "internal app"
          },
          {
            "id": "t49152",
            "label": "49152",
            "sub": "client line"
          },
          {
            "id": "t63001",
            "label": "63001",
            "sub": "RTP media"
          }
        ],
        "buckets": [
          {
            "id": "wk",
            "label": "Well-known",
            "hint": "0 – 1023"
          },
          {
            "id": "rg",
            "label": "Registered",
            "hint": "1024 – 49151"
          },
          {
            "id": "dy",
            "label": "Dynamic / ephemeral",
            "hint": "49152 – 65535"
          }
        ],
        "solution": {
          "t21": "wk",
          "t53": "wk",
          "t3389": "rg",
          "t8080": "rg",
          "t49152": "dy",
          "t63001": "dy"
        }
      }
    },
    "feedback": "Sorted. The classic trap is 3389: RDP is a REGISTERED port (1024–49151), while the core services live in 0–1023 and every client dial starts from an ephemeral 49152+. Defenders use the ranges to write policy: 'no external traffic to well-known ports except documented services' only works if you know which is which.",
    "anchor": "Coverage §6.2 — three ranges, incl. 3389-is-registered"
  },
  {
    "id": "OBJ-M2",
    "mode": "medium",
    "pillar": "P1",
    "title": "Held cord or dropped telegram",
    "prompt": [
      "Route all 13 protocols to their transport: TCP (held cord), UDP (telegram) or Both.",
      "Two of them famously switch mid-conversation."
    ],
    "whereToLook": "Manual — “TCP vs UDP” section; each jack's line in the Inspector",
    "hints": [
      "DNS is UDP 53 for lookups but TCP 53 for zone transfers. RDP and SIP use TCP and UDP.",
      "Everything with 'transfer' or 'session' in the job (FTP, SFTP, SSH, Telnet, SMTP, HTTP, HTTPS, LDAP) is TCP. DHCP and SNMP are UDP.",
      "TCP: ftp, sftp, ssh, telnet, smtp, http, https, ldap. UDP: dhcp, snmp. Both: dns, rdp, sip."
    ],
    "config": {
      "kind": "sort",
      "sort": {
        "trayLabel": "The 13 jacks",
        "noun": "transport line",
        "items": [
          {
            "id": "ftp",
            "label": "FTP",
            "sub": "20 / 21"
          },
          {
            "id": "sftp",
            "label": "SFTP",
            "sub": "22"
          },
          {
            "id": "ssh",
            "label": "SSH",
            "sub": "22"
          },
          {
            "id": "telnet",
            "label": "Telnet",
            "sub": "23"
          },
          {
            "id": "smtp",
            "label": "SMTP",
            "sub": "25"
          },
          {
            "id": "dns",
            "label": "DNS",
            "sub": "53"
          },
          {
            "id": "dhcp",
            "label": "DHCP",
            "sub": "67 / 68"
          },
          {
            "id": "http",
            "label": "HTTP",
            "sub": "80"
          },
          {
            "id": "https",
            "label": "HTTPS",
            "sub": "443"
          },
          {
            "id": "snmp",
            "label": "SNMP",
            "sub": "161 / 162"
          },
          {
            "id": "ldap",
            "label": "LDAP",
            "sub": "389"
          },
          {
            "id": "rdp",
            "label": "RDP",
            "sub": "3389"
          },
          {
            "id": "sip",
            "label": "SIP",
            "sub": "5060 / 5061"
          }
        ],
        "buckets": [
          {
            "id": "tcp",
            "label": "TCP",
            "hint": "handshake · ordered · reliable"
          },
          {
            "id": "udp",
            "label": "UDP",
            "hint": "no handshake · fast · lossy ok"
          },
          {
            "id": "both",
            "label": "Both",
            "hint": "depends on the operation"
          }
        ],
        "solution": {
          "ftp": "tcp",
          "sftp": "tcp",
          "ssh": "tcp",
          "telnet": "tcp",
          "smtp": "tcp",
          "dns": "both",
          "dhcp": "udp",
          "http": "tcp",
          "https": "tcp",
          "snmp": "udp",
          "ldap": "tcp",
          "rdp": "both",
          "sip": "both"
        }
      }
    },
    "feedback": "Routed. The rule of thumb holds: sessions and transfers need TCP's reliability; lightweight queries and polls (DHCP, SNMP) accept UDP's speed; and three lines switch — DNS (UDP lookups → TCP 53 for AXFR), RDP and SIP (TCP + UDP 3389/5060). Writing a firewall rule for 'DNS' that forgets TCP 53 is how zone transfers slip by.",
    "anchor": "Coverage §6.3 — TCP/UDP for all 13"
  },
  {
    "id": "OBJ-M3",
    "mode": "medium",
    "pillar": "P2",
    "title": "Read the directory plate",
    "prompt": [
      "Match each service to the one-line description from the manual.",
      "Two descriptions belong to no jack on this board — leave them unmatched."
    ],
    "whereToLook": "Board — tap jacks to read each line's detail",
    "hints": [
      "RTP 'carries the audio' is a trap: SIP only SIGNALS the call; media rides RTP separately.",
      "TLS-on-443 belongs to HTTPS — which is not in this matching; only 8 of the 10 descriptions connect.",
      "FTP = two ports (21 control / 20 data). DHCP = DORA. SNMP = polls + traps. LDAP = directory queries."
    ],
    "config": {
      "kind": "match",
      "match": {
        "leftTitle": "Service jack",
        "rightTitle": "What the line does",
        "left": [
          {
            "id": "ftp",
            "label": "FTP",
            "sub": "20/21"
          },
          {
            "id": "smtp",
            "label": "SMTP",
            "sub": "25"
          },
          {
            "id": "dns",
            "label": "DNS",
            "sub": "53"
          },
          {
            "id": "dhcp",
            "label": "DHCP",
            "sub": "67/68"
          },
          {
            "id": "snmp",
            "label": "SNMP",
            "sub": "161/162"
          },
          {
            "id": "ldap",
            "label": "LDAP",
            "sub": "389"
          },
          {
            "id": "rdp",
            "label": "RDP",
            "sub": "3389"
          },
          {
            "id": "sip",
            "label": "SIP",
            "sub": "5060/5061"
          }
        ],
        "right": [
          {
            "id": "r5",
            "label": "Polls device state on the agent port; traps push alerts to the manager"
          },
          {
            "id": "r9",
            "label": "Carries the VoIP call audio itself on negotiated UDP ports"
          },
          {
            "id": "r1",
            "label": "Transfers files between hosts — 21 carries commands, 20 carries data"
          },
          {
            "id": "r10",
            "label": "Encrypts web traffic inside TLS"
          },
          {
            "id": "r3",
            "label": "Resolves names to addresses; TCP for zone transfers"
          },
          {
            "id": "r7",
            "label": "Graphical remote desktop to Windows hosts (registered port)"
          },
          {
            "id": "r2",
            "label": "Relays mail between mail servers"
          },
          {
            "id": "r8",
            "label": "Signals VoIP call setup — REGISTER and INVITE"
          },
          {
            "id": "r6",
            "label": "Answers directory queries about users, groups and services"
          },
          {
            "id": "r4",
            "label": "Leases addresses with the DORA exchange — first offer wins"
          }
        ],
        "solution": {
          "ftp": "r1",
          "smtp": "r2",
          "dns": "r3",
          "dhcp": "r4",
          "snmp": "r5",
          "ldap": "r6",
          "rdp": "r7",
          "sip": "r8"
        }
      }
    },
    "feedback": "Patched correctly — and you left two descriptions unmatched on purpose: the one about RTP (the media itself — SIP only signals the call) and the one about TLS-on-443 (that's HTTPS, not on this board). Keeping 'signaling vs media' and 'protocol vs its wrapper' separate is exactly the discrimination the exam and real firewalls demand.",
    "anchor": "Coverage §6 items 4,6,7,9,10,13,14,15 — purpose per protocol"
  },
  {
    "id": "OBJ-M4",
    "mode": "medium",
    "pillar": "P2",
    "title": "Rebuild the DORA exchange",
    "prompt": [
      "A new fare gate just powered on. Tap the four DHCP messages in the order they cross the wire, then answer the two port questions.",
      "Remember which side LISTENS and which side dials."
    ],
    "whereToLook": "Board — jack 67/68 (DHCP) line tap",
    "hints": [
      "The client speaks first — it has no IP yet, so it broadcasts.",
      "Order: Discover → Offer → Request → Acknowledge.",
      "The server listens on 67, the client sends from 68."
    ],
    "config": {
      "kind": "sequence",
      "sequence": {
        "items": [
          {
            "id": "s2",
            "label": "OFFER",
            "sub": "server: proposes an address + options"
          },
          {
            "id": "s4",
            "label": "ACKNOWLEDGE",
            "sub": "server: seals the lease + options"
          },
          {
            "id": "s1",
            "label": "DISCOVER",
            "sub": "client: “any server out there?” (broadcast)"
          },
          {
            "id": "s3",
            "label": "REQUEST",
            "sub": "client: formally asks for the offer it accepted"
          }
        ],
        "solution": [
          "s1",
          "s2",
          "s3",
          "s4"
        ],
        "followUp": [
          {
            "id": "fu1",
            "prompt": "Which port does the DHCP SERVER listen on?",
            "accept": [
              "67"
            ],
            "solution": "67 (server)"
          },
          {
            "id": "fu2",
            "prompt": "Which port does the CLIENT use?",
            "accept": [
              "68"
            ],
            "solution": "68 (client)"
          }
        ]
      }
    },
    "feedback": "DORA rebuilt: Discover (broadcast from 0.0.0.0:68) → Offer → Request → Ack, server 67 / client 68, all UDP. That 'first offer accepted' trust is why rogue DHCP works at all — and why snooping trusts only the real server's switch port.",
    "anchor": "Coverage §6.10 — DORA + 67/68 + UDP"
  },
  {
    "id": "OBJ-M5",
    "mode": "medium",
    "pillar": "P2",
    "title": "Tap the three clear lines",
    "prompt": [
      "The tap recorder saved three sessions from the night shift. Identify each protocol and its port, then say which lines leak reusable secrets.",
      "Read the payloads like an eavesdropper would."
    ],
    "whereToLook": "Board — jacks 21, 23, 80 (and 161 for the fourth saved tap)",
    "hints": [
      "The FTP tap shows USER and PASS in the clear; the Telnet tap shows the password mid-stream.",
      "The HTTP heartbeat request carries no credentials in this capture — check its headers.",
      "Secrets: FTP password, Telnet password, and the SNMP community string (a password-equivalent)."
    ],
    "config": {
      "kind": "inspect",
      "inspect": {
        "blocks": [
          {
            "title": "Saved tap 1 — archive host",
            "payload": {
              "label": "Line tap · TCP 21 · archive host hln-fta01",
              "lines": [
                "220 hln-fta01.archive FTP server ready  [training.sim]",
                "USER jharper",
                "331 Password required for jharper",
                "PASS Br@ssboard48",
                "230 User jharper logged in",
                "CWD /export/fare-nightly",
                "TYPE I",
                "PASV",
                "227 Entering Passive Mode (10,20,4,11,198,77)",
                "STOR fare-nightly-2026-11-08.csv",
                "150 Ok to send data  ·  226 Transfer complete"
              ],
              "note": "Eavesdropper view: username AND password readable in the raw stream."
            }
          },
          {
            "title": "Saved tap 2 — core switch",
            "payload": {
              "label": "Line tap · TCP 23 · legacy switch bos-core-1",
              "lines": [
                "Connected to 10.20.4.11. Escape char '^]'.",
                "HLN terminal services — BOS-CORE-1  [training.sim]",
                "login: opsreader",
                "Password: Sw1tchb0ard!",
                "Last login: Fri Nov  6 22:14 from 10.20.7.42",
                "opsreader@bos-core-1:~$ show fare-gate --all"
              ],
              "note": "Every keystroke — including the password — is readable in the raw stream."
            }
          },
          {
            "title": "Saved tap 3 — kiosk heartbeat",
            "payload": {
              "label": "Line tap · TCP 80 · kiosk K-2214 heartbeat",
              "lines": [
                "GET /kiosk/heartbeat?kiosk=K-2214 HTTP/1.1",
                "Host: fares.harborline-transit.example",
                "User-Agent: FareKiosk/3.2",
                "Accept: text/plain",
                "HTTP/1.1 200 OK"
              ],
              "note": "Readable, but this particular request carries no credentials — headers often do (cookies)."
            }
          },
          {
            "title": "Saved tap 4 — monitoring poll",
            "payload": {
              "label": "Line tap · UDP 161 · monitor → gate controller",
              "lines": [
                "UDP 10.20.7.42:49155 → 10.20.4.30:161",
                "SNMPv2c  GET  community=\"public\"",
                "  1.3.6.1.2.1.1.1.0 (sysDescr)  → \"HLN gate-controller fw 4.2\"",
                "  1.3.6.1.2.1.1.3.0 (sysUpTime) → 41d 06:12:44"
              ],
              "note": "community=\"public\" is the default — reading it is like reading a password."
            }
          }
        ],
        "parts": [
          {
            "id": "q1",
            "prompt": "Tap 1: which protocol?",
            "kind": "text",
            "accept": [
              "ftp",
              "file transfer protocol"
            ],
            "solution": "FTP"
          },
          {
            "id": "q2",
            "prompt": "Tap 1: which port?",
            "kind": "text",
            "accept": [
              "21"
            ],
            "solution": "21"
          },
          {
            "id": "q3",
            "prompt": "Tap 2: which protocol?",
            "kind": "text",
            "accept": [
              "telnet"
            ],
            "solution": "Telnet"
          },
          {
            "id": "q4",
            "prompt": "Tap 2: which port?",
            "kind": "text",
            "accept": [
              "23"
            ],
            "solution": "23"
          },
          {
            "id": "q5",
            "prompt": "Tap 3: which protocol?",
            "kind": "text",
            "accept": [
              "http"
            ],
            "solution": "HTTP"
          },
          {
            "id": "q6",
            "prompt": "Tap 3: which port?",
            "kind": "text",
            "accept": [
              "80"
            ],
            "solution": "80"
          },
          {
            "id": "q7",
            "prompt": "Which taps expose REUSABLE secrets in cleartext? (select all)",
            "kind": "multi",
            "choices": [
              "Tap 1 — FTP",
              "Tap 2 — Telnet",
              "Tap 3 — HTTP heartbeat",
              "Tap 4 — SNMPv2c poll"
            ],
            "solution": [
              0,
              1,
              3
            ]
          }
        ]
      }
    },
    "feedback": "Tapped and identified. FTP and Telnet give up working passwords; the SNMP community string 'public' is a password-equivalent for the whole device. The HTTP heartbeat is readable but this capture carries no credentials — though headers often do (cookies). The defender's move: get every one of these onto sealed lines (SFTP/SSH, HTTPS, SNMPv3) and alert on cleartext patterns in DPI.",
    "anchor": "Coverage §6 items 4,7,11,13 — cleartext recognition"
  },
  {
    "id": "OBJ-M6",
    "mode": "medium",
    "pillar": "P3",
    "title": "Service side or client side?",
    "prompt": [
      "The flow recorder saved eight connections. Select every line whose DESTINATION port is a well-known service port (0–1023).",
      "Then read line 1 closely: which number is the client's ephemeral port?"
    ],
    "whereToLook": "Tools — Flow log (below); Manual — “three ranges”",
    "hints": [
      "Destination port is the RIGHT-hand port in each 5-tuple.",
      "2049 (NFS), 8080, 3389 (RDP) and the RTP pair are NOT well-known — 3389 is registered.",
      "Flag lines 1, 2, 3 and 5. Line 1's ephemeral port is 51344. Line 7 (3389) is a service door but a REGISTERED one — not well-known."
    ],
    "config": {
      "kind": "triage",
      "triage": {
        "columns": [
          "#",
          "Proto",
          "Source (client)",
          "Destination (service)",
          "Bytes",
          "Context"
        ],
        "rows": [
          {
            "id": "r1",
            "cells": [
              "1",
              "TCP",
              "10.20.7.42:51344",
              "10.20.4.11:21",
              "10.2 KB",
              "FTP export"
            ]
          },
          {
            "id": "r2",
            "cells": [
              "2",
              "TCP",
              "10.20.7.42:51345",
              "10.20.4.11:22",
              "86 KB",
              "admin session"
            ]
          },
          {
            "id": "r3",
            "cells": [
              "3",
              "UDP",
              "10.20.6.20:5060",
              "10.20.1.70:5060",
              "1.1 KB",
              "VoIP signaling"
            ]
          },
          {
            "id": "r4",
            "cells": [
              "4",
              "TCP",
              "10.20.9.20:49010",
              "10.20.4.11:2049",
              "412 KB",
              "file share (NFS)"
            ]
          },
          {
            "id": "r5",
            "cells": [
              "5",
              "UDP",
              "10.20.7.42:68",
              "10.20.1.1:67",
              "0.6 KB",
              "DHCP renewal"
            ]
          },
          {
            "id": "r6",
            "cells": [
              "6",
              "TCP",
              "10.20.5.10:49221",
              "10.20.9.30:8080",
              "9.8 KB",
              "internal app (alt port)"
            ]
          },
          {
            "id": "r7",
            "cells": [
              "7",
              "TCP",
              "10.20.7.9:51092",
              "10.20.1.15:3389",
              "22 KB",
              "remote desktop"
            ]
          },
          {
            "id": "r8",
            "cells": [
              "8",
              "UDP",
              "10.20.6.20:16400",
              "10.20.6.21:16402",
              "2.4 MB",
              "RTP call audio"
            ]
          }
        ],
        "criterion": "Select every line whose DESTINATION port is well-known (0–1023)",
        "selectLabel": "Flag",
        "solution": [
          "r1",
          "r2",
          "r3",
          "r5"
        ],
        "followUp": {
          "id": "fu",
          "prompt": "Line 1: which number is the client's EPHEMERAL source port?",
          "accept": [
            "51344"
          ],
          "solution": "51344"
        }
      }
    },
    "feedback": "You read the 5-tuple the way a sensor does: the service side is the low, documented port; the client side is a scratch number that vanishes. Lines 4, 6, 7 and 8 hit registered/ephemeral destinations (NFS 2049, alt-web 8080, RDP 3389, RTP media) — and note line 7: 3389 IS a service door, but a REGISTERED one, exactly the trap from OBJ-M1. Detection logic builds on this: 'external → dst-port 3389' is a policy alert precisely because it is a service door — and its registered range is the exam's favorite trick.",
    "anchor": "Coverage §6.1 + 15 — sockets, direction, ephemeral→well-known"
  },
  {
    "id": "OBJ-M7",
    "mode": "medium",
    "pillar": "P3",
    "title": "The line that switched transports",
    "prompt": [
      "One DNS tap, two behaviours. Explain why the resolver saw UDP and then TCP on the same port number.",
      "Then judge the zone transfer."
    ],
    "whereToLook": "Board — jack 53 (DNS) line tap",
    "hints": [
      "Lookups are small and fast; transfers are big and must not lose a byte.",
      "AXFR = a full zone copy, always TCP 53.",
      "An AXFR to anyone who is not a designated secondary is a finding."
    ],
    "config": {
      "kind": "inspect",
      "inspect": {
        "blocks": [
          {
            "title": "Saved tap — resolver 10.20.1.53",
            "payload": {
              "label": "Line tap · UDP 53 query, then TCP 53 transfer",
              "lines": [
                "UDP 10.20.7.42:51344 → 10.20.1.53:53",
                "A? kiosk-2214.fares.hln.example  →  10.20.7.14  TTL 300",
                "――― later, same shift ―――",
                "TCP 10.20.9.40:51190 → 10.20.1.53:53",
                "AXFR? hln.example",
                "→ SOA, NS ×2, A ×27 … 1,142 bytes  [zone transfer]"
              ],
              "note": "Query = one small UDP datagram. Zone transfer = TCP, and it dumps the map."
            }
          }
        ],
        "parts": [
          {
            "id": "c1",
            "prompt": "What normally carries a simple DNS lookup?",
            "kind": "choice",
            "choices": [
              "A UDP datagram on port 53",
              "A TCP connection on port 53",
              "A TCP connection on port 25",
              "A UDP datagram on port 67"
            ],
            "solution": 0
          },
          {
            "id": "c2",
            "prompt": "Why did the zone transfer switch to TCP?",
            "kind": "choice",
            "choices": [
              "TCP 53 is considered more secure overall",
              "TCP avoids broadcast storms",
              "AXFR answers are large and need reliability",
              "Zone transfers are illegal on UDP"
            ],
            "solution": 2
          },
          {
            "id": "c3",
            "prompt": "Which port carried the AXFR?",
            "kind": "text",
            "accept": [
              "53"
            ],
            "solution": "53 (TCP)"
          },
          {
            "id": "c4",
            "prompt": "The AXFR came from 10.20.9.40 — not a designated secondary. Verdict?",
            "kind": "choice",
            "choices": [
              "Normal — transfers are unrestricted",
              "Finding — the zone map left the estate",
              "Normal — TCP makes it legitimate",
              "Finding only if it came from outside"
            ],
            "solution": 1
          }
        ]
      }
    },
    "feedback": "DNS does UDP 53 for lookups and TCP 53 when size or reliability demands it — zone transfers included. Your firewall rule for 'DNS' must allow TCP 53 to the resolver only, and your DNS server must allowlist AXFR to secondaries. A zone map in the wrong hands is reconnaissance done for the attacker (T1046 territory).",
    "anchor": "Coverage §6.9 — DNS TCP/UDP nuance + AXFR"
  },
  {
    "id": "OBJ-M8",
    "mode": "medium",
    "pillar": "P4",
    "title": "Order the upgrades",
    "prompt": [
      "Six clear lines need re-patching onto sealed ones. Match each legacy service to its encrypted replacement.",
      "Two replacement cards are decoys — not every jack gets one."
    ],
    "whereToLook": "Board — the six clear jacks; Manual — “clear line vs sealed line”",
    "hints": [
      "The pattern: same job, encrypted channel — Telnet→SSH, FTP→SFTP, HTTP→HTTPS.",
      "SNMP keeps its port but changes version; LDAP and SIP move to TLS ports 636 / 5061.",
      "RDP 3389 and SMTP 25 are decoys here — they are not replacements for these six."
    ],
    "config": {
      "kind": "match",
      "match": {
        "leftTitle": "Clear line (retire)",
        "rightTitle": "Sealed replacement",
        "left": [
          {
            "id": "l1",
            "label": "Telnet",
            "sub": "23"
          },
          {
            "id": "l2",
            "label": "FTP",
            "sub": "21"
          },
          {
            "id": "l3",
            "label": "HTTP",
            "sub": "80"
          },
          {
            "id": "l4",
            "label": "SNMPv1/v2c",
            "sub": "161"
          },
          {
            "id": "l5",
            "label": "LDAP (simple bind)",
            "sub": "389"
          },
          {
            "id": "l6",
            "label": "SIP (cleartext)",
            "sub": "5060"
          }
        ],
        "right": [
          {
            "id": "s3",
            "label": "HTTPS — TLS on 443"
          },
          {
            "id": "s6",
            "label": "SIP over TLS — 5061"
          },
          {
            "id": "s1",
            "label": "SSH — TCP 22"
          },
          {
            "id": "s7",
            "label": "RDP — 3389"
          },
          {
            "id": "s4",
            "label": "SNMPv3 — auth + encryption, still UDP 161"
          },
          {
            "id": "s2",
            "label": "SFTP — inside SSH, TCP 22"
          },
          {
            "id": "s8",
            "label": "SMTP relay — 25"
          },
          {
            "id": "s5",
            "label": "LDAPS — TLS on 636"
          }
        ],
        "solution": {
          "l1": "s1",
          "l2": "s2",
          "l3": "s3",
          "l4": "s4",
          "l5": "s5",
          "l6": "s6"
        }
      }
    },
    "feedback": "Every clear line has a sealed twin: Telnet→SSH 22, FTP→SFTP 22, HTTP→HTTPS 443, SNMPv2c→v3 (same port, real authentication), LDAP→LDAPS 636, SIP→TLS 5061. Notice the two patterns: change the protocol (Telnet/FTP) or keep the protocol and wrap it (LDAP/SIP/SNMP). After re-patching, retire the old jack entirely — leaving 23 'just in case' reopens the hole.",
    "anchor": "Coverage §6.21 — secure replacements for all six legacy lines"
  },
  {
    "id": "OBJ-M9",
    "mode": "medium",
    "pillar": "P4",
    "title": "Screen the exchange",
    "prompt": [
      "Set the edge screening for hln-jump01: staff web app over HTTPS, administration ONLY over SSH. Everything else stays closed from the transit network.",
      "Then make the call on the RDP request from home."
    ],
    "whereToLook": "Tools — Exchange screening (the firewall panel below)",
    "hints": [
      "The policy names exactly two open jacks: 443 (web app) and 22 (admin).",
      "Telnet 23, FTP 21, HTTP 80 and RDP 3389 all contradict the policy — deny them.",
      "RDP from home goes through the VPN/bastion; the edge stays closed."
    ],
    "config": {
      "kind": "firewall",
      "firewall": {
        "title": "Edge screening — hln-jump01 (fare web app + admin)",
        "policy": "Allow HTTPS (443) from the transit network and SSH (22) for admins. Everything else: closed.",
        "ports": [
          {
            "port": 21,
            "service": "FTP export",
            "reason": "Cleartext protocol — moves to SFTP 22; 21 stays closed."
          },
          {
            "port": 22,
            "service": "SSH admin",
            "reason": "The only admin path — open, and restricted to the ops VLAN at the source."
          },
          {
            "port": 23,
            "service": "Telnet legacy",
            "reason": "Cleartext terminal — retire the jack entirely."
          },
          {
            "port": 80,
            "service": "HTTP legacy",
            "reason": "At most a redirect to 443; the app itself is served sealed."
          },
          {
            "port": 443,
            "service": "HTTPS staff app",
            "reason": "The public service this host exists for."
          },
          {
            "port": 3389,
            "service": "RDP",
            "reason": "Never any-any — remote admins come via VPN/bastion."
          }
        ],
        "solution": {
          "21": "deny",
          "22": "allow",
          "23": "deny",
          "80": "deny",
          "443": "allow",
          "3389": "deny"
        },
        "extras": [
          {
            "id": "e1",
            "prompt": "The team insists they need RDP to this box from home. Best call?",
            "choices": [
              "Route home RDP through the VPN/bastion",
              "Allow 3389 from any source, on a moved port",
              "Allow 3389 from any source, weekends only",
              "Move the RDP door to UDP 3389"
            ],
            "solution": 0
          }
        ]
      }
    },
    "feedback": "Screened to least privilege: exactly the two jacks the policy names are open. This is the muscle the exam calls 'secure vs insecure protocols + firewall rules': every open jack is attack surface, and the justification for each exception is written down. RDP's 3389 is the most brute-forced door in any estate — it lives behind a VPN/bastion, never on the edge.",
    "anchor": "Coverage §6.15 + 19 — least-privilege firewall + RDP exposure"
  },
  {
    "id": "OBJ-M10",
    "mode": "medium",
    "pillar": "P2",
    "title": "The 13 jacks from memory",
    "prompt": [
      "The exam will ask you cold. Enter the port number(s) for all thirteen lines — no peeking at the plates.",
      "Multi-port lines accept either number (both is better)."
    ],
    "whereToLook": "Close the Inspector and test yourself first",
    "hints": [
      "Anchors: SSH/SFTP share 22; the email relay is 25; directory is 389.",
      "The dual lines: FTP 20/21, DHCP 67/68, SNMP 161/162, SIP 5060/5061.",
      "DNS is 53 both transports; RDP is 3389 (registered); web is 80 → 443."
    ],
    "config": {
      "kind": "recall",
      "recall": {
        "fields": [
          {
            "id": "ftp",
            "label": "FTP",
            "accept": [
              [
                "20",
                "21"
              ],
              [
                "21"
              ],
              [
                "20"
              ]
            ],
            "solution": "20 (data) / 21 (control)"
          },
          {
            "id": "sftp",
            "label": "SFTP",
            "accept": [
              [
                "22"
              ]
            ],
            "solution": "22"
          },
          {
            "id": "ssh",
            "label": "SSH",
            "accept": [
              [
                "22"
              ]
            ],
            "solution": "22"
          },
          {
            "id": "telnet",
            "label": "Telnet",
            "accept": [
              [
                "23"
              ]
            ],
            "solution": "23"
          },
          {
            "id": "smtp",
            "label": "SMTP",
            "accept": [
              [
                "25"
              ]
            ],
            "solution": "25"
          },
          {
            "id": "dns",
            "label": "DNS",
            "accept": [
              [
                "53"
              ]
            ],
            "solution": "53 (UDP + TCP)"
          },
          {
            "id": "dhcp",
            "label": "DHCP",
            "accept": [
              [
                "67",
                "68"
              ],
              [
                "67"
              ],
              [
                "68"
              ]
            ],
            "solution": "67 server / 68 client"
          },
          {
            "id": "http",
            "label": "HTTP",
            "accept": [
              [
                "80"
              ]
            ],
            "solution": "80"
          },
          {
            "id": "https",
            "label": "HTTPS",
            "accept": [
              [
                "443"
              ]
            ],
            "solution": "443"
          },
          {
            "id": "snmp",
            "label": "SNMP",
            "accept": [
              [
                "161"
              ],
              [
                "161",
                "162"
              ],
              [
                "162"
              ]
            ],
            "solution": "161 agent / 162 traps"
          },
          {
            "id": "ldap",
            "label": "LDAP",
            "accept": [
              [
                "389"
              ]
            ],
            "solution": "389"
          },
          {
            "id": "rdp",
            "label": "RDP",
            "accept": [
              [
                "3389"
              ]
            ],
            "solution": "3389 (registered)"
          },
          {
            "id": "sip",
            "label": "SIP",
            "accept": [
              [
                "5060"
              ],
              [
                "5060",
                "5061"
              ],
              [
                "5061"
              ]
            ],
            "solution": "5060 / 5061 (TLS)"
          }
        ]
      }
    },
    "feedback": "All thirteen patched from memory — that is the exam's table. Mnemonics that stick: '22 does double duty' (SSH and SFTP), '67/68 is the only split pair with roles', '162 is one-six-TWO for traps', '3389 is the registered outsider', '5061 is 5060 wearing TLS'. Spaced repetition from here: re-run this work order tomorrow cold.",
    "anchor": "Coverage §6.4–16 — port recall for all 13"
  },
  {
    "id": "OBJ-M11",
    "mode": "medium",
    "pillar": "P2",
    "title": "A double offer on the wire",
    "prompt": [
      "A branch gate booted this morning and something is off: two servers answered its DISCOVER. Find the rogue and say why it worked.",
      "Then pick the countermeasure that would have stopped it."
    ],
    "whereToLook": "Board — jack 67/68 (DHCP); this tap is loaded in the work order",
    "hints": [
      "Compare the gw= and dns= options in the two OFFERs.",
      "The client REQUESTs the offer it accepted — look at server= in the REQUEST.",
      "The rogue pointed the gateway at itself; the countermeasure trusts only designated switch ports (snooping)."
    ],
    "config": {
      "kind": "inspect",
      "inspect": {
        "blocks": [
          {
            "title": "Saved tap — branch VLAN 7, gate boot",
            "payload": {
              "label": "UDP 67/68 · two OFFERs for the same client",
              "lines": [
                "1 DISCOVER  0.0.0.0:68 → 255.255.255.255:67",
                "2 OFFER    10.20.1.9:67 → 255.255.255.255:68  yiaddr=10.20.7.42  gw=10.20.1.9  dns=10.20.1.9",
                "3 OFFER    10.20.1.1:67 → 255.255.255.255:68  yiaddr=10.20.7.42  gw=10.20.7.1  dns=10.20.1.53",
                "4 REQUEST  0.0.0.0:68 → 255.255.255.255:67  requested=10.20.7.42  server=10.20.1.9",
                "5 ACK      10.20.1.9:67 → 255.255.255.255:68  yiaddr=10.20.7.42  gw=10.20.1.9"
              ],
              "note": "The client's traffic now exits via 10.20.1.9 — a box nobody owns."
            }
          }
        ],
        "parts": [
          {
            "id": "t1",
            "prompt": "IP of the server whose OFFER the client accepted?",
            "kind": "text",
            "accept": [
              "10.20.1.9"
            ],
            "solution": "10.20.1.9"
          },
          {
            "id": "t2",
            "prompt": "What gave the rogue away?",
            "kind": "choice",
            "choices": [
              "Its OFFER arrived first",
              "It used UDP instead of TCP",
              "Gateway option pointed at itself",
              "Its yiaddr was outside the subnet"
            ],
            "solution": 2
          },
          {
            "id": "t3",
            "prompt": "The client's acceptance rule is…",
            "kind": "choice",
            "choices": [
              "Best options win",
              "First offer received wins",
              "Lowest server IP wins",
              "The admin chooses"
            ],
            "solution": 1
          },
          {
            "id": "t4",
            "prompt": "Standard countermeasure?",
            "kind": "choice",
            "choices": [
              "Block all broadcasts on the VLAN",
              "Encrypt DHCP offers with TLS",
              "Move DHCP to TCP 67 for ordering",
              "DHCP snooping on the access switches"
            ],
            "solution": 3
          }
        ]
      }
    },
    "feedback": "Rogue DHCP in one tap: the client takes the FIRST offer, so being fast is the whole attack; the giveaway is the self-referencing gateway. DHCP snooping flips the trust model — switch ports must EARN the right to OFFER. The client couldn't verify anything because DHCP has no authentication — that is the residual risk even with snooping.",
    "anchor": "Coverage §6.10 — rogue DHCP, first-offer trust, snooping"
  }
];

// Hard mode: OBJ-H1..H9 (9 broad challenges, red herrings included).
const OBJECTIVES_HARD = [
  {
    "id": "OBJ-H1",
    "mode": "hard",
    "pillar": "P2",
    "title": "Audit: five unlabeled lines",
    "prompt": [
      "Night audit. Five taps came in with the jack labels burned off — identify each protocol from the payload alone, give the STANDARD port where asked, and judge each line sealed or clear.",
      "Two of these lines are actually fine. Over-flagging them is as wrong as missing the real ones."
    ],
    "hints": [
      "Sealed means nothing readable crosses after the handshake. A visible 'login:' prompt with a readable password is never sealed."
    ],
    "config": {
      "kind": "inspect",
      "inspect": {
        "blocks": [
          {
            "title": "Tap A — unknown jack 8023",
            "payload": {
              "label": "TCP 198.51.100.9:51022 → 10.20.4.11:8023",
              "lines": [
                "HLN terminal services — BOS-CORE-1",
                "login: opsreader",
                "Password: Sw1tchb0ard!   ← visible in the raw stream"
              ],
              "note": "Banner greeting is a plain terminal prompt."
            }
          },
          {
            "title": "Tap B — unknown jack 22",
            "payload": {
              "label": "TCP 10.20.7.42:51402 → 10.20.4.11:22",
              "lines": [
                "banner: SSH-2.0-OpenSSH_9.6",
                "KEX curve25519-sha256",
                "···· encrypted channel (binary) ····"
              ],
              "note": "Nothing readable after the banner."
            }
          },
          {
            "title": "Tap C — unknown jack 161",
            "payload": {
              "label": "UDP 10.20.7.42:49155 → 10.20.4.30:161",
              "lines": [
                "SNMPv2c  GET  community=\"public\"",
                "  sysDescr → \"HLN gate-controller fw 4.2\""
              ],
              "note": "Poll answered with device inventory."
            }
          },
          {
            "title": "Tap D — unknown jack 5060",
            "payload": {
              "label": "UDP 10.20.6.20:5060 → 10.20.1.70:5060",
              "lines": [
                "REGISTER sip:sip.hln.example SIP/2.0",
                "From: <sip:2001@hln.example>",
                "Authorization: Digest username=\"2001\", realm=\"hln\""
              ],
              "note": "Signaling headers fully readable."
            }
          },
          {
            "title": "Tap E — unknown jack 3389",
            "payload": {
              "label": "TCP 198.51.100.9:51244 → 10.20.1.15:3389",
              "lines": [
                "TLS negotiated (hybrid) → binary session stream",
                "UDP 10.20.1.15:3389 ↔ same session (graphics)"
              ],
              "note": "No content visible; the source is external."
            }
          }
        ],
        "parts": [
          {
            "id": "h1a",
            "prompt": "Tap A: which protocol?",
            "kind": "text",
            "accept": [
              "telnet"
            ],
            "solution": "Telnet"
          },
          {
            "id": "h1b",
            "prompt": "Tap A: the STANDARD port for that protocol?",
            "kind": "text",
            "accept": [
              "23"
            ],
            "solution": "23"
          },
          {
            "id": "h1c",
            "prompt": "Tap A: verdict?",
            "kind": "choice",
            "choices": [
              "Sealed — an encrypted session",
              "Clear — keystrokes readable"
            ],
            "solution": 1
          },
          {
            "id": "h1d",
            "prompt": "Tap B: which protocol?",
            "kind": "text",
            "accept": [
              "ssh"
            ],
            "solution": "SSH"
          },
          {
            "id": "h1e",
            "prompt": "Tap B: verdict?",
            "kind": "choice",
            "choices": [
              "Sealed — an encrypted session",
              "Clear — keystrokes readable"
            ],
            "solution": 0
          },
          {
            "id": "h1f",
            "prompt": "Tap C: which protocol?",
            "kind": "text",
            "accept": [
              "snmp"
            ],
            "solution": "SNMP"
          },
          {
            "id": "h1g",
            "prompt": "Tap C: verdict?",
            "kind": "choice",
            "choices": [
              "Clear — community is a password",
              "Sealed — v2c encrypts strings"
            ],
            "solution": 0
          },
          {
            "id": "h1h",
            "prompt": "Tap D: which protocol?",
            "kind": "text",
            "accept": [
              "sip"
            ],
            "solution": "SIP"
          },
          {
            "id": "h1i",
            "prompt": "Tap D: verdict?",
            "kind": "choice",
            "choices": [
              "Sealed — headers are hidden",
              "Clear — extensions readable"
            ],
            "solution": 1
          },
          {
            "id": "h1j",
            "prompt": "Tap E: which protocol?",
            "kind": "text",
            "accept": [
              "rdp"
            ],
            "solution": "RDP"
          },
          {
            "id": "h1k",
            "prompt": "Tap E: verdict?",
            "kind": "choice",
            "choices": [
              "Sealed — risk is the source",
              "Clear — keystrokes readable"
            ],
            "solution": 0
          }
        ]
      }
    },
    "feedback": "Full audit filed. You identified Telnet-on-8023 (non-standard port — the finding is 'why is any Telnet alive here?'), sealed SSH, SNMPv2c with a default community, cleartext SIP, and encrypted RDP whose real problem is the external source. That last distinction — 'encrypted ≠ not a finding' — is the difference between reading packets and reading risk.",
    "anchor": "Coverage §6.7,13,15,16,17 — banner ID + sealed/clear judgment"
  },
  {
    "id": "OBJ-H2",
    "mode": "hard",
    "pillar": "P2",
    "title": "Harvest report (exact strings)",
    "prompt": [
      "You are writing the damage assessment: what EXACTLY could an eavesdropper reuse from each of the four saved taps? Enter the precise strings — case matters, this is evidence.",
      "One of the four taps yields nothing. Say so precisely rather than inventing a find."
    ],
    "hints": [
      "Case-sensitive means case-sensitive. If a line is encrypted, the honest answer is 'nothing usable' — endpoints and volume remain, content does not."
    ],
    "config": {
      "kind": "inspect",
      "inspect": {
        "blocks": [
          {
            "title": "Tap 1 — archive host",
            "payload": {
              "label": "Line tap · TCP 21 · archive host hln-fta01",
              "lines": [
                "220 hln-fta01.archive FTP server ready  [training.sim]",
                "USER jharper",
                "331 Password required for jharper",
                "PASS Br@ssboard48",
                "230 User jharper logged in",
                "CWD /export/fare-nightly",
                "TYPE I",
                "PASV",
                "227 Entering Passive Mode (10,20,4,11,198,77)",
                "STOR fare-nightly-2026-11-08.csv",
                "150 Ok to send data  ·  226 Transfer complete"
              ],
              "note": "Eavesdropper view: username AND password readable in the raw stream."
            }
          },
          {
            "title": "Tap 2 — monitoring poll",
            "payload": {
              "label": "Line tap · UDP 161 · monitor → gate controller",
              "lines": [
                "UDP 10.20.7.42:49155 → 10.20.4.30:161",
                "SNMPv2c  GET  community=\"public\"",
                "  1.3.6.1.2.1.1.1.0 (sysDescr)  → \"HLN gate-controller fw 4.2\"",
                "  1.3.6.1.2.1.1.3.0 (sysUpTime) → 41d 06:12:44"
              ],
              "note": "community=\"public\" is the default — reading it is like reading a password."
            }
          },
          {
            "title": "Tap 3 — VoIP proxy",
            "payload": {
              "label": "Line tap · UDP/TCP 5060 · phone → SIP proxy",
              "lines": [
                "UDP 10.20.6.20:5060 → 10.20.1.70:5060",
                "REGISTER sip:sip.hln.example SIP/2.0  expires=3600",
                "From: <sip:2001@hln.example>",
                "Authorization: Digest username=\"2001\", realm=\"hln\", response=\"9f2e…\"",
                "TCP 10.20.6.20:5060 → 10.20.1.70:5060  INVITE sip:2005@hln.example",
                "SDP: audio RTP 10.20.6.20:16400 (ephemeral UDP)"
              ],
              "note": "Extensions and usernames are readable; media lives elsewhere on RTP."
            }
          },
          {
            "title": "Tap 4 — fares app",
            "payload": {
              "label": "Line tap · TCP 443 · kiosk → fares app",
              "lines": [
                "TCP 10.20.7.14:49221 → 10.20.5.10:443",
                "TLS 1.3  ClientHello  SNI=fares.harborline-transit.example",
                "certificate: CN=fares.harborline-transit.example",
                "···· ApplicationData (opaque) ····"
              ],
              "note": "Encrypted content — but SNI, endpoints and volume remain visible."
            }
          }
        ],
        "parts": [
          {
            "id": "x1",
            "prompt": "Tap 1: the password an eavesdropper reads (exact)",
            "kind": "text",
            "accept": [
              "Br@ssboard48"
            ],
            "solution": "Br@ssboard48"
          },
          {
            "id": "x2",
            "prompt": "Tap 2: the community string (exact)",
            "kind": "text",
            "accept": [
              "public"
            ],
            "solution": "public"
          },
          {
            "id": "x3",
            "prompt": "Tap 3: the extension/username exposed",
            "kind": "text",
            "accept": [
              "2001"
            ],
            "solution": "2001"
          },
          {
            "id": "x4",
            "prompt": "Tap 4 (HTTPS): what is harvestable from this tap?",
            "kind": "choice",
            "choices": [
              "A replayable session cookie",
              "The usernames in the clear",
              "Nothing usable — content is sealed",
              "The TLS private key itself"
            ],
            "solution": 2
          }
        ]
      }
    },
    "feedback": "Damage assessment filed: one working password, one device-master key ('public'), one directory of extensions — and one honest 'nothing usable' on the TLS line. Precise extraction is a real skill: incident reports live or die on exact evidence, and case-sensitivity ('public' vs 'Public') is the difference between a replayable credential and a wrong finding.",
    "anchor": "Coverage §6.4,12,13,16,18 — exact-secret extraction"
  },
  {
    "id": "OBJ-H3",
    "mode": "hard",
    "pillar": "P3",
    "title": "Rogue DHCP and a curious resolver",
    "prompt": [
      "Branch VLAN 7, one messy minute on the wire: six messages, two different problems. Flag every message that belongs to an anomaly.",
      "Then name the rogue."
    ],
    "hints": [
      "One problem hands out a gateway; the other asks for a map. Legitimate DHCP has exactly one OFFER and it comes from .1.1."
    ],
    "config": {
      "kind": "triage",
      "triage": {
        "columns": [
          "#",
          "Proto",
          "Source",
          "Destination",
          "Detail"
        ],
        "rows": [
          {
            "id": "m1",
            "cells": [
              "1",
              "UDP",
              "0.0.0.0:68",
              "255.255.255.255:67",
              "DISCOVER — gate boot"
            ]
          },
          {
            "id": "m2",
            "cells": [
              "2",
              "UDP",
              "10.20.1.9:67",
              "255.255.255.255:68",
              "OFFER yiaddr=10.20.7.42 gw=10.20.1.9 dns=10.20.1.9"
            ]
          },
          {
            "id": "m3",
            "cells": [
              "3",
              "UDP",
              "10.20.1.1:67",
              "255.255.255.255:68",
              "OFFER yiaddr=10.20.7.42 gw=10.20.7.1 dns=10.20.1.53"
            ]
          },
          {
            "id": "m4",
            "cells": [
              "4",
              "UDP",
              "0.0.0.0:68",
              "255.255.255.255:67",
              "REQUEST server=10.20.1.9"
            ]
          },
          {
            "id": "m5",
            "cells": [
              "5",
              "UDP",
              "10.20.1.9:67",
              "255.255.255.255:68",
              "ACK yiaddr=10.20.7.42 gw=10.20.1.9"
            ]
          },
          {
            "id": "m6",
            "cells": [
              "6",
              "TCP",
              "10.20.9.40:51190",
              "10.20.1.53:53",
              "AXFR? hln.example — host NOT in transfer allowlist"
            ]
          }
        ],
        "criterion": "Select every message that belongs to an anomaly (rogue DHCP or DNS abuse)",
        "selectLabel": "Flag",
        "solution": [
          "m2",
          "m4",
          "m5",
          "m6"
        ],
        "followUp": {
          "id": "fu",
          "prompt": "Rogue DHCP server IP?",
          "accept": [
            "10.20.1.9"
          ],
          "solution": "10.20.1.9"
        }
      }
    },
    "feedback": "Both anomalies isolated: the rogue's OFFER/ACK pair (gateway pointing at itself, REQUEST naming .1.9) and the unauthorized AXFR — a zone map request from a host that should never ask. Detection pair that proves it: DHCP snooping logs (OFFER from an untrusted port) plus the DNS server's transfer log. Next defender moves: shut the rogue's port, allowlist AXFR, audit whatever 10.20.9.40 touched.",
    "anchor": "Coverage §6.9 + 10 — rogue DHCP + AXFR detection"
  },
  {
    "id": "OBJ-H4",
    "mode": "hard",
    "pillar": "P3",
    "title": "Rewrite the screening (and its order)",
    "prompt": [
      "A previous admin opened hln-jump01's edge 'to make it work'. Rewrite every rule to match the same policy as your Day Shift screen: HTTPS to the app, SSH for admins, nothing else.",
      "Then answer the two audit questions — rule order matters as much as rule content."
    ],
    "hints": [
      "Specific allows before general ones; the deny-all goes last because evaluation is top-down."
    ],
    "config": {
      "kind": "firewall",
      "firewall": {
        "title": "Edge screening — hln-jump01 (rewrite)",
        "policy": "Allow HTTPS (443) and SSH (22). Deny Telnet 23, HTTP 80, SMTP 25, RDP 3389 — the previous admin left all four open.",
        "ports": [
          {
            "port": 22,
            "service": "SSH admin",
            "reason": "Specific allow, source-restricted to the ops VLAN."
          },
          {
            "port": 23,
            "service": "Telnet legacy",
            "reason": "Cleartext terminal — the rewrite retires it."
          },
          {
            "port": 25,
            "service": "SMTP relay",
            "reason": "This host never relays mail; an open 25 becomes a spam engine."
          },
          {
            "port": 80,
            "service": "HTTP legacy",
            "reason": "Redirect at most; no cleartext app serving."
          },
          {
            "port": 443,
            "service": "HTTPS staff app",
            "reason": "The documented service."
          },
          {
            "port": 3389,
            "service": "RDP",
            "reason": "The weekend brute-force came through here — closed at the edge."
          }
        ],
        "solution": {
          "22": "allow",
          "23": "deny",
          "25": "deny",
          "80": "deny",
          "443": "allow",
          "3389": "deny"
        },
        "extras": [
          {
            "id": "e1",
            "prompt": "Rule-ORDER principle for this exchange?",
            "choices": [
              "Any order — the firewall sorts rules itself",
              "Most-specific allows first, deny-all last",
              "Deny-all first, then the allows",
              "Alphabetical, by service name"
            ],
            "solution": 1
          },
          {
            "id": "e2",
            "prompt": "What replaces direct RDP exposure for remote admins?",
            "choices": [
              "Port-knocking in front of 3389",
              "Allowing 3389 from the ISP's ranges",
              "VPN/bastion with NLA; 3389 stays closed",
              "Switching RDP over to UDP"
            ],
            "solution": 2
          }
        ]
      }
    },
    "feedback": "Rewrite filed: two specific allows, four denials, and the reasoning that the deny-all comes last because rules evaluate top-down — an early 'allow any' silently masks every specific rule behind it. This is why exposure reviews read rules in ORDER: the weekend's 4625/4624 burst was only possible because a general rule outranked common sense.",
    "anchor": "Coverage §6.15 + 19 — ACL content + ordering"
  },
  {
    "id": "OBJ-H5",
    "mode": "hard",
    "pillar": "P2",
    "title": "How the fare data walked out",
    "prompt": [
      "Incident reconstruction — four stages, four saved records. For each stage: name the port that carried it and the detection that would have caught it.",
      "Finish with the earliest point the whole chain could have been stopped."
    ],
    "hints": [
      "Stage 4 is encrypted — that is precisely why its detection is about metadata. Earliest stop is always the first domino."
    ],
    "config": {
      "kind": "inspect",
      "inspect": {
        "blocks": [
          {
            "title": "Stage 1 — ops jump host",
            "payload": {
              "label": "Windows Security log — hln-jump01",
              "lines": [
                "412 × Event 4625 (logon failure) from 198.51.100.9",
                "1 × Event 4624 (logon success) — ops account",
                "RDP session opened on 3389"
              ],
              "note": "Classic brute-force signature against an exposed remote door."
            }
          },
          {
            "title": "Stage 2 — the map",
            "payload": {
              "label": "PCAP — monitor → gate controllers",
              "lines": [
                "SNMPv2c GET community=\"public\" ×1,204 in 6 min",
                "OIDs: sysDescr, ifTable (interface inventory)"
              ],
              "note": "Topology walked with a default community string."
            }
          },
          {
            "title": "Stage 3 — the staging",
            "payload": {
              "label": "PCAP — archive host hln-fta01:21",
              "lines": [
                "USER jharper",
                "PASS Br@ssboard48",
                "RETR fare-nightly-2026-11-08.csv ×3"
              ],
              "note": "Credentials reused from an earlier harvest; files pulled."
            }
          },
          {
            "title": "Stage 4 — the exit",
            "payload": {
              "label": "NetFlow — 10.20.5.10 → outside",
              "lines": [
                "TCP 10.20.5.10:49221 → 198.51.100.77:443",
                "1.2 GB in 40 min · 02:14–02:54 · first-seen destination"
              ],
              "note": "Encrypted — but volume, hour and newness all stand out."
            }
          }
        ],
        "parts": [
          {
            "id": "s1p",
            "prompt": "Stage 1: which PORT was brute-forced?",
            "kind": "text",
            "accept": [
              "3389"
            ],
            "solution": "3389"
          },
          {
            "id": "s1q",
            "prompt": "Stage 1: earliest detection?",
            "kind": "choice",
            "choices": [
              "4625 burst from one external source",
              "SNMP trap storm from the monitor",
              "AXFR alert from the resolver",
              "STOR alert from the FTP door"
            ],
            "solution": 1
          },
          {
            "id": "s2p",
            "prompt": "Stage 2: which PORT?",
            "kind": "text",
            "accept": [
              "161"
            ],
            "solution": "161"
          },
          {
            "id": "s2q",
            "prompt": "Stage 2: earliest detection?",
            "kind": "choice",
            "choices": [
              "An AXFR alert on the resolver",
              "A 443 volume anomaly",
              "The 4625 burst on the jump host",
              "The cleartext community=\"public\" poll"
            ],
            "solution": 3
          },
          {
            "id": "s3p",
            "prompt": "Stage 3: which PORT?",
            "kind": "text",
            "accept": [
              "21"
            ],
            "solution": "21"
          },
          {
            "id": "s3q",
            "prompt": "Stage 3: earliest detection?",
            "kind": "choice",
            "choices": [
              "USER/PASS in the FTP stream",
              "A TLS SNI mismatch on 443",
              "A rogue DHCP OFFER on VLAN 7",
              "The 4625 burst on 3389"
            ],
            "solution": 0
          },
          {
            "id": "s4p",
            "prompt": "Stage 4: which PORT?",
            "kind": "text",
            "accept": [
              "443"
            ],
            "solution": "443"
          },
          {
            "id": "s4q",
            "prompt": "Stage 4: detection despite encryption?",
            "kind": "choice",
            "choices": [
              "Decrypting the payload in the capture",
              "Blocking all 443 at the edge",
              "A first-seen destination, 1.2 GB, at 02:14",
              "Polling the SNMP trap log"
            ],
            "solution": 2
          },
          {
            "id": "s5",
            "prompt": "Earliest chance to stop the whole chain?",
            "kind": "choice",
            "choices": [
              "Stage 1 — the brute force",
              "Stage 3 — the FTP pull",
              "Stage 4 — the exfil",
              "None — it was invisible"
            ],
            "solution": 0
          }
        ]
      }
    },
    "feedback": "Chain reconstructed: exposed 3389 → default-community SNMP map → cleartext FTP staging → encrypted exfil that only metadata could catch. Every stage had a real detection opportunity, and the earliest one — the 4625 burst — is also the cheapest control (never expose 3389). Chain thinking is the defender's edge: break any link, and the fare data stays home.",
    "anchor": "Coverage §6.4,12,13,15,20 — full lifecycle + detection per stage"
  },
  {
    "id": "OBJ-H6",
    "mode": "hard",
    "pillar": "P4",
    "title": "Night-shift re-patch (with justifications)",
    "prompt": [
      "Re-patch every clear line on the board to its sealed variant — and justify each choice the way you would in the audit report.",
      "The board state must be all-sealed AND all six justifications must hold."
    ],
    "hints": [
      "Two services keep their port and change version/protocol wrapping; the rest move ports. 'Less obvious port' is never the justification."
    ],
    "config": {
      "kind": "hardening",
      "hardening": {
        "services": [
          {
            "key": "telnet",
            "legacy": "Telnet · 23",
            "secure": "SSH · 22",
            "portNote": "retire 23"
          },
          {
            "key": "ftp",
            "legacy": "FTP · 21/20",
            "secure": "SFTP · 22",
            "portNote": "inside SSH"
          },
          {
            "key": "http",
            "legacy": "HTTP · 80",
            "secure": "HTTPS · 443",
            "portNote": "redirect 80"
          },
          {
            "key": "snmp",
            "legacy": "SNMPv2c · 161",
            "secure": "SNMPv3 · 161",
            "portNote": "same port, new version"
          },
          {
            "key": "ldap",
            "legacy": "LDAP · 389",
            "secure": "LDAPS · 636",
            "portNote": "TLS wrap"
          },
          {
            "key": "sip",
            "legacy": "SIP · 5060",
            "secure": "SIP/TLS · 5061",
            "portNote": "signaling sealed"
          }
        ],
        "reasons": [
          {
            "key": "telnet",
            "prompt": "Why SSH over a 'less obvious' Telnet port?",
            "choices": [
              "SSH encrypts; a moved Telnet still leaks",
              "Port 22 is faster than port 23",
              "SSH is simply easier to configure"
            ],
            "solution": 0
          },
          {
            "key": "ftp",
            "prompt": "Why SFTP rather than rotating the FTP password?",
            "choices": [
              "Password rotation is enough for FTP",
              "SFTP encrypts credentials and data",
              "SFTP needs fewer ports than FTP"
            ],
            "solution": 1
          },
          {
            "key": "http",
            "prompt": "Why HTTPS + redirect instead of blocking the site?",
            "choices": [
              "HTTPS is much cheaper to run than HTTP",
              "Blocking the site is faster anyway",
              "It must stay reachable; TLS seals transit"
            ],
            "solution": 2
          },
          {
            "key": "snmp",
            "prompt": "Why SNMPv3 over a bigger community string?",
            "choices": [
              "v3 runs over TCP instead of UDP",
              "v3 adds real auth and encryption",
              "Bigger community strings are unbreakable"
            ],
            "solution": 1
          },
          {
            "key": "ldap",
            "prompt": "Why LDAPS on 636?",
            "choices": [
              "LDAPS compresses better",
              "636 is a well-known port",
              "TLS wraps the cleartext bind"
            ],
            "solution": 2
          },
          {
            "key": "sip",
            "prompt": "Why TLS 5061 + proxy ACL over just moving to 5065?",
            "choices": [
              "TLS seals it and the ACL gates REGISTER",
              "Port 5065 is encrypted by default",
              "VoIP cannot really be abused anyway"
            ],
            "solution": 0
          }
        ]
      }
    },
    "feedback": "Board fully re-patched, every justification audit-grade. The two patterns to carry: change the protocol (Telnet→SSH, FTP→SFTP) or wrap it (LDAPS, SIP-TLS, HTTPS, SNMPv3) — and 'less obvious port' is never, ever the fix. Residual risk to note in the report: the board is sealed, but default credentials and unpatched firmware on those devices are the next findings.",
    "anchor": "Coverage §6.21 + 7,4,11,13,14,16 — hardening with reasons"
  },
  {
    "id": "OBJ-H7",
    "mode": "hard",
    "pillar": "P3",
    "title": "Misfit or malevolent?",
    "prompt": [
      "Three flows whose banners don't match their ports the way you'd expect. For each: give the STANDARD port for the protocol you see, then judge the flow.",
      "Only ONE of the three is a genuine hunt-worthy finding. Calling all three 'attacks' is as wrong as calling all three 'fine'."
    ],
    "hints": [
      "Ask: is this port a KNOWN ALTERNATIVE for the protocol, or is the PROTOCOL itself wrong for the port?"
    ],
    "config": {
      "kind": "inspect",
      "inspect": {
        "blocks": [
          {
            "title": "Flow A",
            "payload": {
              "label": "TCP 10.20.5.10:49221 → 10.20.9.30:8080",
              "lines": [
                "HTTP/1.1 200 OK",
                "Server: staff-app/2.1"
              ],
              "note": "Internal staff application."
            }
          },
          {
            "title": "Flow B",
            "payload": {
              "label": "TCP 198.51.100.9:51100 → 10.20.9.51:443",
              "lines": [
                "220 mail.hln.example ESMTP Postfix",
                "HELO …"
              ],
              "note": "A mail server greeting on the web port."
            }
          },
          {
            "title": "Flow C",
            "payload": {
              "label": "TCP 10.20.7.42:51402 → 10.20.4.11:2222",
              "lines": [
                "banner: SSH-2.0-OpenSSH_9.6",
                "···· encrypted ····"
              ],
              "note": "Deliberate-looking admin choice."
            }
          }
        ],
        "parts": [
          {
            "id": "a1",
            "prompt": "Flow A: verdict?",
            "kind": "choice",
            "choices": [
              "Suspicious — 8080 is a well-known attack port",
              "Benign — a registered alternative; inventory it",
              "Impossible — HTTP only ever runs on port 80"
            ],
            "solution": 1
          },
          {
            "id": "a2",
            "prompt": "Flow A: the STANDARD port for HTTP?",
            "kind": "text",
            "accept": [
              "80"
            ],
            "solution": "80"
          },
          {
            "id": "b1",
            "prompt": "Flow B: verdict?",
            "kind": "choice",
            "choices": [
              "Benign — mail often rides port 443",
              "Benign — TLS seals everything inside",
              "Suspicious — mismatched banner and port"
            ],
            "solution": 2
          },
          {
            "id": "b2",
            "prompt": "Flow B: the STANDARD relay port for SMTP?",
            "kind": "text",
            "accept": [
              "25"
            ],
            "solution": "25"
          },
          {
            "id": "c1",
            "prompt": "Flow C: verdict?",
            "kind": "choice",
            "choices": [
              "Benign but noted — deliberate admin choice",
              "Suspicious — always an attack signal",
              "Impossible — SSH only runs on port 22"
            ],
            "solution": 0
          },
          {
            "id": "c2",
            "prompt": "Flow C: the STANDARD port for SSH?",
            "kind": "text",
            "accept": [
              "22"
            ],
            "solution": "22"
          }
        ]
      }
    },
    "feedback": "Three misfits, three different verdicts: 8080-HTTP is a registered alternative (inventory), SSH-on-2222 is a deliberate deviation (document + keep key/ACL controls), but SMTP-on-443 is a genuine finding — mail has no business on the web port, and mismatched banner/port is either broken config or deliberate concealment (T1571 thinking, defensively). Banner-plus-port beats port alone, every time.",
    "anchor": "Coverage §6.17 — banner/port mismatch triage"
  },
  {
    "id": "OBJ-H8",
    "mode": "hard",
    "pillar": "P2",
    "title": "The phone system complains",
    "prompt": [
      "The VoIP proxy logged a registration storm overnight. Read the tap, then answer the five questions — signaling, exposure, transport, media, and the fix.",
      "Separate what SIP does from what RTP does. That split is the whole point."
    ],
    "hints": [
      "SIP sets calls UP; it never carries the audio. The fix seals signaling AND decides who may REGISTER at all."
    ],
    "config": {
      "kind": "inspect",
      "inspect": {
        "blocks": [
          {
            "title": "Saved tap — VoIP proxy 10.20.1.70",
            "payload": {
              "label": "Line tap · UDP/TCP 5060 · phone → SIP proxy",
              "lines": [
                "UDP 10.20.6.20:5060 → 10.20.1.70:5060",
                "REGISTER sip:sip.hln.example SIP/2.0  expires=3600",
                "From: <sip:2001@hln.example>",
                "Authorization: Digest username=\"2001\", realm=\"hln\", response=\"9f2e…\"",
                "TCP 10.20.6.20:5060 → 10.20.1.70:5060  INVITE sip:2005@hln.example",
                "SDP: audio RTP 10.20.6.20:16400 (ephemeral UDP)"
              ],
              "note": "Extensions and usernames are readable; media lives elsewhere on RTP."
            }
          }
        ],
        "parts": [
          {
            "id": "v1",
            "prompt": "Which port carried the REGISTER?",
            "kind": "text",
            "accept": [
              "5060"
            ],
            "solution": "5060"
          },
          {
            "id": "v2",
            "prompt": "Which transport did the capture show?",
            "kind": "choice",
            "choices": [
              "UDP only",
              "TCP only",
              "Both UDP and TCP",
              "ICMP"
            ],
            "solution": 2
          },
          {
            "id": "v3",
            "prompt": "What does the cleartext REGISTER expose?",
            "kind": "choice",
            "choices": [
              "Nothing — SIP encrypts its headers",
              "Extension numbers and digest hints",
              "The RTP audio stream itself",
              "The TLS session keys"
            ],
            "solution": 1
          },
          {
            "id": "v4",
            "prompt": "Primary mitigation set?",
            "kind": "choice",
            "choices": [
              "Switch the phones to FTP",
              "Move RTP onto port 5060",
              "NAT the whole estate",
              "TLS 5061 + REGISTER allowlist"
            ],
            "solution": 3
          },
          {
            "id": "v5",
            "prompt": "What carries the actual voice?",
            "kind": "choice",
            "choices": [
              "RTP on ephemeral UDP ports",
              "SIP signaling on 5061",
              "TCP port 25 relay",
              "ICMP echo traffic"
            ],
            "solution": 0
          }
        ]
      }
    },
    "feedback": "SIP triaged: signaling on 5060 (UDP and TCP both seen), cleartext extension/username exposure, mitigation = TLS 5061 plus registration control — and the audio never touches SIP at all; RTP rides negotiated ephemeral UDP ports. That signaling-vs-media split is why 'block port 5060 and calls stop but audio flows' confuses people who memorized one port per protocol.",
    "anchor": "Coverage §6.16 — SIP depth: 5060/5061, RTP adjacency, fraud controls"
  },
  {
    "id": "OBJ-H9",
    "mode": "hard",
    "pillar": "P1",
    "title": "Design the three new lines",
    "prompt": [
      "Three service requirements land on your desk. For each: pick the protocol and defend its transport choice.",
      "There is exactly one right answer per line — the requirements rule."
    ],
    "hints": [
      "Reliability and integrity for bulk transfer → TCP. Thousands of tiny frequent polls → UDP. Live audio → UDP for latency, with a signaling protocol to set it up."
    ],
    "config": {
      "kind": "inspect",
      "inspect": {
        "blocks": [],
        "parts": [
          {
            "id": "d1",
            "prompt": "Nightly 2 GB export to the partner: best protocol?",
            "kind": "choice",
            "choices": [
              "FTP on TCP 21",
              "SFTP on TCP 22",
              "TFTP on UDP 69",
              "HTTP on TCP 80"
            ],
            "solution": 1
          },
          {
            "id": "d2",
            "prompt": "…and its transport?",
            "kind": "choice",
            "choices": [
              "UDP — smaller headers",
              "ICMP",
              "TCP — ordered and reliable",
              "Both"
            ],
            "solution": 2
          },
          {
            "id": "d3",
            "prompt": "Polling 4,000 gate sensors every 30 s with tiny reads: protocol?",
            "kind": "choice",
            "choices": [
              "SNMP (UDP 161)",
              "SFTP (TCP 22)",
              "SMTP (TCP 25)",
              "RDP (3389)"
            ],
            "solution": 0
          },
          {
            "id": "d4",
            "prompt": "…transport, and why?",
            "kind": "choice",
            "choices": [
              "TCP — it is always the 'safer' pick",
              "UDP, because TCP cannot cross routers",
              "TCP, which adds encryption",
              "UDP — low overhead for many small polls"
            ],
            "solution": 3
          },
          {
            "id": "d5",
            "prompt": "Live platform announcement audio: signaling vs media?",
            "kind": "choice",
            "choices": [
              "Both halves ride SIP on 5060",
              "SIP signals; RTP carries media",
              "Both halves ride RTP 16400",
              "The media rides SMTP on 25"
            ],
            "solution": 1
          },
          {
            "id": "d6",
            "prompt": "…transport for the media?",
            "kind": "choice",
            "choices": [
              "UDP — latency beats retransmission",
              "TCP — reliability comes first",
              "TCP on 443 for the encryption",
              "UDP on 53 for the lookups"
            ],
            "solution": 0
          }
        ]
      }
    },
    "feedback": "Three lines designed like an architect: bulk integrity → SFTP/TCP 22; scale and lightness → SNMP/UDP 161; live audio → SIP signaling + RTP/UDP media. The transport choice is not 'TCP is the serious one' — it is matching reliability needs against overhead and latency, which is the actual exam skill behind 'common ports, protocols, services and traffic types'.",
    "anchor": "Coverage §6.3 + 5,13,16 — protocol/transport selection"
  }
];

// Supervisor's spot-check — Medium: 6 concept items.
const QUIZ_MEDIUM = [
  {
    "q": "A workstation boots and asks for an address. Which port/transport pair does the DHCP SERVER listen on?",
    "choices": [
      "UDP 68",
      "TCP 67",
      "UDP 67",
      "TCP 68"
    ],
    "solution": 2,
    "explain": "DHCP is UDP end to end: the server listens on 67, the client uses 68. UDP 68 is the client's own port and TCP 67/68 don't exist for DHCP — DORA starts with a broadcast DISCOVER from 0.0.0.0:68.",
    "topic": "DHCP ports & DORA",
    "review": "Re-read the Manual's “Variants & pivots” section and tap jack 67/68 on the board."
  },
  {
    "q": "Your packet capture shows plaintext credentials crossing port 23. Which replacement — protocol AND port — do you implement?",
    "choices": [
      "SSH on TCP 22",
      "Telnet on TCP 992",
      "RDP on TCP 3389",
      "SFTP on TCP 22"
    ],
    "solution": 0,
    "explain": "Port 23 is Telnet; its encrypted terminal replacement is SSH on TCP 22. Telnet on a moved port stays cleartext, RDP is a desktop — not a terminal — service, and SFTP rides 22 but only covers file transfer.",
    "topic": "Telnet → SSH replacement",
    "review": "Tap jack 23 on the board and re-read the “clear line vs sealed line” Manual section."
  },
  {
    "q": "Your DNS server suddenly shows a session on TCP 53. What is the most likely reason?",
    "choices": [
      "An AXFR or oversized answer needs reliable delivery",
      "Someone misconfigured the default gateway",
      "The server is under attack — TCP 53 means break-in",
      "DNS never uses TCP — it must be a typo"
    ],
    "solution": 0,
    "explain": "Queries normally ride UDP 53; zone transfers (AXFR) and oversized responses fall back to TCP 53 for ordered, reliable delivery. Gateway settings have nothing to do with it, TCP 53 is not an attack signal by itself — but an AXFR to a non-secondary is still worth investigating.",
    "topic": "DNS UDP vs TCP 53",
    "review": "Re-run the “line that switched transports” logic — tap jack 53 on the board."
  },
  {
    "q": "An agent device wants to notify your monitor immediately about an interface failure. Where does that trap arrive?",
    "choices": [
      "UDP 161 on the manager",
      "UDP 162 on the manager",
      "TCP 162 on the agent",
      "TCP 161 on the manager"
    ],
    "solution": 1,
    "explain": "Managers poll agents on UDP 161; agents push unsolicited traps to the manager on UDP 162. 161 on the manager is the poll direction, 162 on the agent does not exist, and traps are UDP — knowing the direction tells you which side to firewall.",
    "topic": "SNMP 161/162 direction",
    "review": "Tap jack 161/162 on the board; check the poll-vs-trap directions in the line tap."
  },
  {
    "q": "RDP's port 3389 belongs to which range?",
    "choices": [
      "Well-known (0–1023)",
      "Dynamic/ephemeral (49152+)",
      "Registered (1024–49151)",
      "None — 3389 is a protocol name"
    ],
    "solution": 2,
    "explain": "3389 is registered, not well-known — a classic exam trap. Well-known stops at 1023 and ephemeral starts at 49152; 3389 sits squarely in the vendor-assigned middle range.",
    "topic": "Port ranges (3389 is registered)",
    "review": "Re-run OBJ-M1's sort logic — the Manual's “three ranges” section."
  },
  {
    "q": "Which of these services is encrypted END-TO-END at the application layer by design?",
    "choices": [
      "SMTP on TCP 25",
      "Telnet on TCP 23",
      "FTP on TCP 21",
      "SFTP on TCP 22"
    ],
    "solution": 3,
    "explain": "SFTP runs inside the SSH channel, so commands, filenames and credentials are all encrypted. SMTP 25 relays readable dialogs, FTP 21 carries USER/PASS in the clear, and Telnet 23 leaks every keystroke.",
    "topic": "Cleartext vs sealed services",
    "review": "Re-run OBJ-M8's replacement mapping — the Manual's “clear line vs sealed line” section."
  }
];

// Supervisor's spot-check — Hard: 7 scenario items.
const QUIZ_HARD = [
  {
    "q": "SCENARIO — Firewall logs show 198.51.100.9 hitting 10.20.1.15:3389 all weekend: hundreds of 4625 events, then one 4624. What is the RIGHT first move?",
    "choices": [
      "Move RDP to 13389, hide it from scanners, and keep the any-any rule as it is",
      "Close any-any to 3389: VPN/bastion + NLA + lockout; treat the 4624 as compromised",
      "Rename the Administrator account, add a banner, and keep 3389 open to the internet",
      "Block TCP 3389, allow UDP 3389, and ask users to switch the RDP client to UDP"
    ],
    "solution": 1,
    "explain": "The exposure is the door, not the number on it: remove any-any access (VPN/bastion + NLA + lockout) and treat the single success as compromised. Port-shuffling is obscurity (T1571 thinking), a renamed account still faces the open door, and UDP 3389 is still RDP.",
    "topic": "RDP exposure & response",
    "review": "Re-run OBJ-M9's screening call — the Handover notes' mitigation list, RDP entry."
  },
  {
    "q": "SCENARIO — A capture on VLAN 6 shows community=\"public\" SNMPv2c polls from the monitoring server. What is the risk and the fix?",
    "choices": [
      "'public' is read-only by definition, so these polls expose nothing useful",
      "Move the polls to UDP 162 so the community string is no longer visible",
      "Disable SNMP across the estate — monitoring is optional and droppable",
      "The string is a cleartext password-equivalent; move the estate to SNMPv3"
    ],
    "solution": 3,
    "explain": "v1/v2c communities cross the wire in cleartext and 'public' is the first string anyone tries — it can be replayed for reads and, on some devices, writes. 162 is the traps port, not a security feature; dropping monitoring blind is not a fix; v3 gives real authentication and encryption.",
    "topic": "SNMP community-string risk",
    "review": "Re-run OBJ-H2's harvest logic — tap jack 161/162 and read the v2c tap again."
  },
  {
    "q": "SCENARIO — Branch users get gateways that vanish overnight. Which TWO data sources prove a rogue DHCP server?",
    "choices": [
      "Snooping logs (OFFER from an untrusted port) + a capture naming the rogue",
      "The DHCP server's CPU graph + the DNS query log from the same morning",
      "NetFlow volume spikes + firewall deny counts for the branch VLAN",
      "The client's ARP cache alone — no other evidence exists in this case"
    ],
    "solution": 0,
    "explain": "Snooping marks exactly which switch ports may OFFER — an OFFER from an untrusted port is the smoking gun — and the capture names the rogue's MAC/IP directly. CPU graphs, DNS logs and NetFlow volume don't tie an OFFER to a physical port; the ARP cache is client-side and uncorroborated.",
    "topic": "Rogue DHCP evidence",
    "review": "Re-run OBJ-H3's triage — the Handover notes' DHCP snooping row."
  },
  {
    "q": "SCENARIO — A teammate suggests 'just move SSH to 2222, that's security'. Best evaluation?",
    "choices": [
      "Correct — non-standard ports are invisible to scanners and to auditors",
      "Wrong — non-standard ports are always a policy violation",
      "Partly right — noise reduction only; the real controls are keys and ACLs",
      "Correct — moving the port also encrypts the traffic in transit"
    ],
    "solution": 2,
    "explain": "A moved port hides you from casual scans only; dedicated discovery still banners every port. Keys, ACLs and rate limiting are the actual controls — and if the deviation stays, it must be documented. (ATT&CK's Non-Standard Port technique, T1571, exists precisely because port moves are a known pattern — for attackers too.)",
    "topic": "Port-move obscurity (SSH 2222)",
    "review": "Re-run OBJ-H7's Flow C judgment — the Manual's banner discussion."
  },
  {
    "q": "SCENARIO — DNS logs show an AXFR request for hln.example from 10.20.9.40, a host that is NOT a designated secondary. Immediate actions?",
    "choices": [
      "Ignore it — AXFR is a normal query type any resolver may ask",
      "Deny the transfer, allowlist AXFR to secondaries, audit the requester",
      "Switch the resolver to UDP 53 only and close TCP 53 at the edge",
      "Block all TCP 53 permanently so no transfer can ever happen again"
    ],
    "solution": 1,
    "explain": "AXFR hands over your entire namespace — deny it and audit who asked. TCP 53 itself is legitimate (large responses, transfers between real secondaries), so closing it everywhere breaks DNS; and 'ignore' is exactly how a recon goldmine walks out the door.",
    "topic": "DNS AXFR handling",
    "review": "Re-run OBJ-H3's DNS message — the Handover notes' DNS server-logs row."
  },
  {
    "q": "SCENARIO — A partner must push nightly files to you. Today that means FTP 21 open from their IP. Best redesign?",
    "choices": [
      "Keep FTP 21 but rotate the partner's password every single week",
      "Keep FTP 21 and hide the export URL behind an unguessable token",
      "Open FTP 20 as well, since the data connection flows there anyway",
      "Replace with SFTP on 22, close 21, allowlist the partner's source"
    ],
    "solution": 3,
    "explain": "Any FTP variant — rotated password or hidden URL — still ships credentials and data in cleartext. SFTP on 22 encrypts the whole session inside SSH; 20 is the old active-mode DATA port and adds nothing secure. Allowlisting the partner's source keeps the new door narrow.",
    "topic": "FTP → SFTP redesign",
    "review": "Re-run OBJ-H9's export design — the Manual's “quick reference” table row for FTP/SFTP."
  },
  {
    "q": "SCENARIO — Your VoIP proxy on 5060 is internet-reachable; overnight, registrations from unknown extensions and calls to premium numbers appear. Best combined response?",
    "choices": [
      "TLS on 5061, restrict who may REGISTER, rate-limit, review the CDRs",
      "Nothing — SIP is UDP, and UDP cannot be abused for toll fraud",
      "Move RTP media to port 5060 so signaling and audio share one port",
      "Disable the VoIP estate overnight so registration storms cannot recur"
    ],
    "solution": 0,
    "explain": "Open, cleartext registration invites toll fraud: seal signaling with TLS (5061), gate who may REGISTER (proxy ACL/SBC), rate-limit attempts and review call-detail records. SIP being UDP is irrelevant to abuse; RTP on 5060 confuses signaling with media; night shutdowns break the business, not the attack.",
    "topic": "SIP registration abuse",
    "review": "Re-run OBJ-H8's triage — the Handover notes' SIP mitigation entry."
  }
];

const SERVICE_KEYS = [
  "telnet",
  "ftp",
  "http",
  "snmp",
  "ldap",
  "sip"
];

// All objectives in board order (medium then hard) — matches the original's OBJECTIVES export.
const OBJECTIVES = [...OBJECTIVES_MEDIUM, ...OBJECTIVES_HARD];
