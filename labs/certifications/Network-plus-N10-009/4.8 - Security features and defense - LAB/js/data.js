// ── Red-Line Room · content data (all synthetic, training-only) ────────
// Ported 1:1 from the original framework lab (src/lib/lab/data.ts).
// Same wording, same correct answers, same hint tiers, same feedback.
"use strict";

window.RL_DATA = {
  LAB_TITLE: "RED-LINE ROOM",
  LAB_SUB: "Northlake Community College — Network Defense Draft",

  DEVICES: [
    { id: "internet", name: "The Internet", short: "INTERNET", kind: "cloud", movable: false, zone: "untrusted", blurb: "Everything, trusted by no one." },
    { id: "guestwifi", name: "Student & Guest Wi-Fi", short: "GUEST WIFI", kind: "wifi", movable: true, zone: "trusted", blurb: "9,000 BYOD phones and laptops. Currently labeled TRUSTED — is that sound?" },
    { id: "webserver", name: "Public Website (www)", short: "WWW", kind: "server", movable: true, zone: "trusted", blurb: "Serves northlake.edu to the world. Currently sits beside the student records server." },
    { id: "mailrelay", name: "Mail Gateway", short: "MAIL", kind: "server", movable: true, zone: "trusted", blurb: "Terminates inbound SMTP for the whole college. Currently inside the staff LAN." },
    { id: "staffpc", name: "Staff Workstations", short: "STAFF", kind: "endpoint", movable: false, zone: "trusted", blurb: "Faculty and administration desktops, VLAN 10." },
    { id: "records", name: "Student Records Server", short: "RECORDS", kind: "server", movable: false, zone: "trusted", blurb: "Grades, health holds, SSNs. The crown jewels." },
    { id: "adminws", name: "IT Admin Workstation", short: "ADMIN WS", kind: "endpoint", movable: false, zone: "trusted", blurb: "The only host that should ever manage the switches." },
    { id: "gw1", name: "Border Router/Firewall NORTH-GW1", short: "GW1", kind: "network", movable: false, zone: "mgmt", blurb: "The college's single door to the Internet." },
    { id: "cs1", name: "Core Switch NORTH-CS1", short: "CS1", kind: "network", movable: false, zone: "mgmt", blurb: "Heart of the collapsed core, VLANs 10/99." },
    { id: "wlc1", name: "Wi-Fi Controller NORTH-WLC1", short: "WLC1", kind: "network", movable: false, zone: "mgmt", blurb: "Runs every access point on campus." },
  ],

  // which zone each device MUST be in for the design to be correct
  TARGET_ZONES: {
    internet: "untrusted",
    guestwifi: "untrusted",
    webserver: "dmz",
    mailrelay: "dmz",
    staffpc: "trusted",
    records: "trusted",
    adminws: "trusted",
    gw1: "mgmt",
    cs1: "mgmt",
    wlc1: "mgmt",
  },

  HARDENING: [
    { id: "gw1-creds", device: "gw1", label: "Replace factory admin credentials (admin/admin)", why: "Default credentials are published on the vendor's site and indexed by search engines. T1078.001 Default Accounts.", risk: "Anyone reaching the login banner owns the router in one guess." },
    { id: "gw1-telnet", device: "gw1", label: "Disable Telnet — management over SSH only", why: "Telnet is cleartext: every keystroke, including passwords, crosses the wire readable. SSH encrypts the session.", risk: "Remote Telnet sessions are readable and spoofable." },
    { id: "gw1-webadmin", device: "gw1", label: "Close the router's web admin GUI (port 80/8080)", why: "Every listening service is attack surface. Manage the border from the CLI over SSH.", risk: "The GUI is reachable from the Internet and unpatched." },
    { id: "gw1-snmp", device: "gw1", label: "Disable legacy SNMPv1 ('public'/'private' communities)", why: "SNMPv1 has no encryption and community strings are effectively passwords shared with the world.", risk: "Anyone can poll interface tables — and set them — with 'public'." },
    { id: "cs1-creds", device: "cs1", label: "Replace factory admin credentials on the core switch", why: "Same rule as the router: no device keeps its factory defaults. Factory defaults must never survive an audit.", risk: "Core switch is one default password away from takeover." },
    { id: "cs1-telnet", device: "cs1", label: "Disable Telnet on the core switch — SSH only", why: "A compromised management session on the core switch means every VLAN is in reach.", risk: "Cleartext management sessions can be captured campus-wide." },
    { id: "cs1-ports", device: "cs1", label: "Shut unused switch ports (offices, labs, lobby)", why: "An open wall port is an invitation: plugging in should never mean plugging on.", risk: "Lobby wall ports are live and unauthenticated." },
    { id: "cs1-backup", device: "cs1", label: "Schedule automatic config backups", why: "Hardening means change; change means you need a known-good rollback. Back up before you touch.", risk: "A failed change or a compromised device wipes the known-good config." },
    { id: "cs1-firmware", device: "cs1", label: "Apply pending firmware updates (2 years behind)", why: "Firmware ships security fixes; M1051 Update Software applies to network gear too.", risk: "Known CVEs in the running image go unpatched." },
    { id: "wlc1-creds", device: "wlc1", label: "Replace factory credentials on the Wi-Fi controller", why: "Whoever owns the controller owns every radio on campus.", risk: "Default creds on the controller expose the whole WLAN." },
    { id: "wlc1-firmware", device: "wlc1", label: "Update the Wi-Fi controller firmware", why: "Old controller images expose known wireless CVEs (KRACK-class).", risk: "Known wireless vulnerabilities stay exploitable." },
  ],

  KEY_ITEMS: [
    { id: "webcert", name: "TLS certificate — www[.]northlake[.]edu", detail: "EXPIRED 23 days ago. Every visitor's browser shows a warning; some stop trusting the site entirely.", badLabel: "EXPIRED — not valid since Oct 17", fixedLabel: "RENEWED & INSTALLED — valid for 1 year, expiry monitor scheduled", fixLabel: "Renew & install", mitre: "M1041" },
    { id: "vpnpsk", name: "VPN pre-shared key — shared by 40 contractors", detail: "One secret, 40 people, unchanged since 2023. Any one of them (or anyone they told) can still dial in — forever.", badLabel: "IN USE — shared since 2023 with 40 people", fixedLabel: "ROTATED — old key dead; per-user certificates issued", fixLabel: "Rotate & issue per-user certs", mitre: "M1032" },
    { id: "radiustablet", name: "RADIUS shared secret — ex-admin's tablet", detail: "The tablet of an administrator who left on Aug 14 still authenticates to the RADIUS server.", badLabel: "ACTIVE — offboarded admin still authenticates", fixedLabel: "REVOKED — device removed, server secret rotated", fixLabel: "Revoke device & rotate secret", mitre: "M1047" },
    { id: "webkey", name: "Web server private key — plaintext in the code repo", detail: "The TLS private key is committed to a source repository that every student worker can clone.", badLabel: "EXPOSED — plaintext in a shared repository", fixedLabel: "VAULTED — key in secure storage; repo copy purged", fixLabel: "Move to secure vault", mitre: "M1041" },
    { id: "wpaent", name: "Student Wi-Fi authentication — WPA2-PSK", detail: "One Wi-Fi passphrase shared by the entire student body. Anyone leaving takes the key with them.", badLabel: "PSK — one passphrase shared campus-wide", fixedLabel: "WPA3-ENTERPRISE — per-user auth via RADIUS (802.1X)", fixLabel: "Migrate to Enterprise", mitre: "M1032" },
  ],

  ACL_VOCAB: {
    action: ["permit", "deny"],
    proto: ["ip", "tcp"],
    src: ["any", "internet", "guest", "staff", "adminws"],
    dst: ["web", "mail", "mgmt", "trusted", "internet", "any"],
    port: ["any", "443", "25", "22", "23", "445"],
  },

  ACL_LEGEND: {
    any: "any",
    internet: "the Internet",
    guest: "guest/student nets",
    staff: "staff VLAN 10 (source)",
    adminws: "IT admin workstation",
    web: "www server",
    mail: "mail gateway",
    mgmt: "mgmt VLAN 99",
    trusted: "trusted LAN (VLAN 10, incl. records)",
  },

  ACL_INITIAL: [
    { id: "acl-0", action: "permit", proto: "ip", src: "any", dst: "any", port: "any", log: false },
  ],

  // The policy-correct ACL (used to explain feedback, not to auto-fill)
  ACL_TARGET: [
    { action: "permit", proto: "tcp", src: "any", dst: "web", port: "443" },
    { action: "permit", proto: "tcp", src: "any", dst: "mail", port: "25" },
    { action: "permit", proto: "tcp", src: "adminws", dst: "mgmt", port: "22" },
    { action: "deny", proto: "ip", src: "any", dst: "mgmt", port: "any" },
    { action: "deny", proto: "ip", src: "guest", dst: "trusted", port: "any" },
    { action: "permit", proto: "ip", src: "guest", dst: "internet", port: "any" },
    { action: "permit", proto: "ip", src: "staff", dst: "any", port: "any" },
  ],

  FILTER_CATEGORIES: [
    { id: "malware", label: "Malware", desc: "Known distribution and C2 domains." },
    { id: "phishing", label: "Phishing", desc: "Credential-harvest and look-alike pages." },
    { id: "gambling", label: "Gambling", desc: "Betting and casino sites." },
    { id: "streaming", label: "Streaming / Media", desc: "Video & music streaming — includes legitimate course media!" },
    { id: "social", label: "Social media", desc: "Social networks; productivity trade-off." },
  ],

  FILTER_SITES: [
    { id: "bioarchive", domain: "fieldstation.archive.example.edu", category: "streaming", desc: "Biology 210 field-station video archive — legitimate course material caught by the streaming category." },
    { id: "gradesportal", domain: "northlake-grades-portal.example.com", category: "phishing", desc: "Typo-squat of the real student portal harvesting logins." },
  ],

  TRAFFIC_SAMPLES: [
    { id: "S-VISIT", title: "Visitor opens https://www[.]northlake[.]edu", desc: "A prospective student loads the college website from home.", src: "internet", dst: "web", port: "443", proto: "tcp", attack: false, expected: "ALLOWED", teach: "Public services must be reachable — but from the screened subnet, not the staff LAN." },
    { id: "S-MAIL", title: "Inbound mail reaches the mail gateway", desc: "A letter arrives from the Internet for @northlake.edu.", src: "internet", dst: "mail", port: "25", proto: "tcp", attack: false, expected: "ALLOWED", teach: "SMTP 25 to the gateway is one of the few services the world may touch." },
    { id: "S-CERT", title: "Browser validates the www certificate", desc: "Same visitor's browser checks the TLS certificate chain.", src: "internet", dst: "web", port: "443", proto: "tcp", attack: false, special: "cert", expected: "ALLOWED", teach: "Expired certificates destroy trust in seconds — key management is a security control." },
    { id: "S-MALWARE", title: "Guest laptop fetches a malware payload", desc: "A BYOD phone on guest Wi-Fi resolves a known malware-distribution domain.", src: "guest", dst: "internet", port: "443", proto: "tcp", attack: true, expected: "BLOCKED", predict: true, teach: "DNS/URL filtering stops the fetch at the resolver, before any payload moves." },
    { id: "S-SNOOP", title: "Guest laptop scans the records server", desc: "The same phone now probes the student records server on 445.", src: "guest", dst: "records", port: "445", proto: "tcp", attack: true, expected: "BLOCKED", teach: "Untrusted → trusted must die at the border: by explicit rule or by the implicit deny." },
    { id: "S-KIOSK", title: "Unmanaged kiosk plugs into a lobby wall port", desc: "A vendor's kiosk with no 802.1X supplicant is plugged into the lobby switch port.", src: "staff", dst: "mgmt", port: "any", proto: "ip", attack: true, special: "kiosk", expected: "QUARANTINED", predict: true, teach: "NAC answers 'what are you?' before the port says 'come in'; quarantine holds the unknowns." },
    { id: "S-ADMIN", title: "IT admin SSHes to the core switch", desc: "The admin workstation opens an SSH session to NORTH-CS1.", src: "adminws", dst: "mgmt", port: "22", proto: "tcp", attack: false, expected: "ALLOWED", teach: "Management must work — for exactly the people, protocol and hosts the policy names." },
    { id: "S-TELNET-EXT", title: "Internet host probes Telnet on the border router", desc: "A scanner from 203.0.113.77 tries port 23 on NORTH-GW1.", src: "internet", dst: "mgmt", port: "23", proto: "tcp", attack: true, expected: "BLOCKED", predict: true, teach: "Two defenses stack here: the ACL denies the path, hardening closes the service itself." },
    { id: "S-STAFF-STREAM", title: "Staff PC loads a training video", desc: "HR watches a compliance video on the staff VLAN.", src: "staff", dst: "internet", port: "443", proto: "tcp", attack: false, expected: "ALLOWED", teach: "A control that over-blocks business needs gets switched off — policy must match users." },
    { id: "S-BIO", title: "Biology class loads the field-station archive", desc: "Biology 210 plays course videos from the archive site, via guest Wi-Fi.", src: "guest", dst: "internet", port: "443", proto: "tcp", attack: false, expected: "ALLOWED", predict: true, teach: "Category filters have false positives; allowlists are how you fix them without gutting the policy." },
    { id: "S-VPN", title: "Contractor dials in with the old shared VPN key", desc: "A contractor connects using the pre-shared key circulated since 2023.", src: "internet", dst: "mgmt", port: "any", proto: "ip", attack: true, special: "vpn", expected: "REJECTED", predict: true, teach: "A shared key keeps working for everyone who ever copied it — until you rotate it." },
    { id: "S-TELNET-INT", title: "Compromised staff PC Telnets toward management", desc: "Malware on a staff workstation tries Telnet into VLAN 99's switch.", src: "staff", dst: "mgmt", port: "23", proto: "tcp", attack: true, expected: "BLOCKED", teach: "Lateral movement toward the management plane must fail twice: at the ACL and at the disabled service." },
  ],

  // samples the audit expects to be stopped/allowed — order matters for display
  AUDIT_ORDER: null, // filled below (ids of TRAFFIC_SAMPLES in order)

  GLOSSARY: [
    { term: "802.1X", def: "Port-based access control: supplicant (device) asks, authenticator (switch/AP) relays, RADIUS server decides." },
    { term: "ACL", def: "Ordered permit/deny rules on a router/firewall, evaluated first-match from the top." },
    { term: "Allowlist / blocklist", def: "Explicit 'always allow' / 'always deny' entries that override the category rules around them." },
    { term: "Content filtering", def: "Controlling what can be downloaded or viewed (file types, keywords) — deeper than blocking destinations." },
    { term: "Defense in depth", def: "Layered controls so one missed layer doesn't expose the network." },
    { term: "Device hardening", def: "Removing defaults: changing passwords, closing services/ports, updating firmware, backing up configs." },
    { term: "Implicit deny", def: "The invisible last line of every ACL: traffic matching no rule is dropped. ('deny any any' lives at the end even when unwritten.)" },
    { term: "Key rotation", def: "Replacing keys/secrets on a schedule or after exposure, so a stolen key has a short life." },
    { term: "MAB", def: "MAC Authentication Bypass — fallback that admits legacy devices (printers) on 802.1X ports by MAC address." },
    { term: "NAC", def: "Network Access Control — decide which devices may join, assess them, and place them (or quarantine them)." },
    { term: "Posture assessment", def: "Checking a device's health (patches, AV) before granting access — via an installed agent or agentless web/scan checks." },
    { term: "RADIUS", def: "Central AAA server behind 802.1X and VPNs; every client (switch, AP, VPN gateway) holds its own shared secret." },
    { term: "Screened subnet (DMZ)", def: "A buffer zone holding public-facing services between the Internet and the trusted LAN." },
    { term: "Supplicant", def: "The 802.1X client role — the software on a laptop/phone that answers the network's 'who are you?'." },
    { term: "TLS certificate", def: "A server's signed identity document with an expiry date; expired = browser warnings and lost visitors." },
    { term: "Trusted vs. untrusted zone", def: "Policy labels for which segments may trust each other; guest/student networks are untrusted by definition." },
    { term: "VPN pre-shared key (PSK)", def: "One secret shared by many users — the weakest VPN authentication; rotate or replace with per-user certificates." },
  ],

  MATCH_PAIRS: [
    { id: "hard", control: "Device hardening", purpose: "Remove weak defaults so devices can't be logged into and abused" },
    { id: "nac", control: "NAC", purpose: "Decide which devices may join the network — quarantine the rest" },
    { id: "keys", control: "Key management", purpose: "Issue, store, rotate and revoke the secrets machines use to trust each other" },
    { id: "acl", control: "ACL", purpose: "Permit only the traffic a policy allows; deny the rest by default" },
    { id: "filter", control: "URL/content filtering", purpose: "Control which web destinations and downloads users may reach" },
    { id: "zones", control: "Trusted vs. untrusted zones", purpose: "Label which parts of the network may trust each other" },
    { id: "dmz", control: "Screened subnet", purpose: "Give public services a buffer zone so one breach can't spread inward" },
  ],

  FAMILY_IDS: ["hard", "nac", "keys", "acl", "filter", "zones", "dmz"],
  FAMILY_LABELS: {
    hard: "Device hardening",
    nac: "NAC",
    keys: "Key management",
    acl: "ACL",
    filter: "URL/content filtering",
    zones: "Trusted vs. untrusted zones",
    dmz: "Screened subnet",
  },

  TAG_SNIPPETS: [
    { id: "T1", text: "203.0.113.77 opened an interactive Telnet session on NORTH-GW1 (port 23 accepted).", family: "hard" },
    { id: "T2", text: "Guest client 10.9.9.23 fetched a payload from a malware distribution domain — no policy matched.", family: "filter" },
    { id: "T3", text: "www[.]northlake[.]edu presented a certificate that expired 23 days ago; browsers warned visitors.", family: "keys" },
    { id: "T4", text: "A lobby kiosk with no supplicant was placed in the quarantine VLAN by the port authenticator.", family: "nac" },
    { id: "T5", text: "A packet from the staff VLAN reached the records server on 445 — rule 1 was 'permit ip any any'.", family: "acl" },
    { id: "T6", text: "The public web server shares a VLAN with the student records server.", family: "dmz" },
    { id: "T7", text: "The student Wi-Fi is labeled 'trusted' and its clients may reach staff subnets freely.", family: "zones" },
  ],

  NAC_LOG_QUESTION: {
    log: [
      { t: "09:41:02", m: "kiosk MAC f0:9d:a2:**:**:01 joined lobby port Gi1/0/7" },
      { t: "09:41:32", m: "no EAPOL response within 30 s — no supplicant found" },
      { t: "09:41:32", m: "port Gi1/0/7 authenticated → QUARANTINE VLAN 666 (restricted)" },
      { t: "09:41:33", m: "quarantine posture portal: 'This device is unmanaged. Contact the service desk.'" },
    ],
    q: "Why exactly was the kiosk quarantined?",
    options: [
      "It failed a posture scan (out-of-date antivirus was detected).",
      "It never authenticated — no 802.1X supplicant answered, so the port fell to the quarantine VLAN.",
      "Its MAC address was on the college blocklist.",
      "The DHCP server refused to give it an address.",
    ],
    correct: 1,
    explain: "The kiosk never spoke 802.1X at all: with no supplicant answering within the timeout, the authenticator cannot verify it, so the port drops it into the quarantine VLAN. Posture scans only happen after authentication; blocklists and DHCP are downstream of that decision. (A legacy device that CAN'T do 802.1X would instead be admitted by MAB — that's the printers' path.)",
  },

  // ── Hard-mode evidence pack ────────────────────────────────────────────
  MEMO_ITEMS: [
    { id: "M1", text: "Border router NORTH-GW1 accepts interactive Telnet sessions from the Internet.", truth: "GAP", family: "hard", why: "Cleartext management reachable from the untrusted zone — hardening failure." },
    { id: "M2", text: "Core switch NORTH-CS1 still uses the factory admin credentials.", truth: "GAP", family: "hard", why: "Default accounts (T1078.001) — published and indexed; first thing tried." },
    { id: "M3", text: "The public website's TLS certificate expired 23 days ago and was never renewed.", truth: "GAP", family: "keys", why: "Key/certificate lifecycle failure — visitors see warnings, trust erodes." },
    { id: "M4", text: "The public web server shares a VLAN with the student records server.", truth: "GAP", family: "dmz", why: "Public-facing service belongs in the screened subnet; here one web bug = records breach." },
    { id: "M5", text: "Student Wi-Fi has no access control: any device can associate and reach staff subnets.", truth: "GAP", family: "nac", why: "No 802.1X/posture/quarantine — untrusted devices walk into trusted space." },
    { id: "M6", text: "The border ACL consists of a single rule: 'permit ip any any' (written 2016).", truth: "GAP", family: "acl", why: "No policy at all — first-match always permits, implicit deny never reached." },
    { id: "M7", text: "Guest clients can resolve and load known malware-distribution domains.", truth: "GAP", family: "filter", why: "No DNS/URL filtering on guest networks." },
    { id: "M8", text: "Guest Wi-Fi now uses WPA3 encryption for the wireless link itself.", truth: "NOGAP", family: "filter", why: "RED HERRING — link-layer encryption being modern is a good thing, not a finding. WPA3 protects the air; it does nothing about which devices join or what they fetch, but it is not a gap." },
    { id: "M9", text: "The library's public catalog terminals run a fully patched operating system image.", truth: "NOGAP", family: "hard", why: "RED HERRING — a patched OS is good hygiene. It earns no finding; the memo's author padded the list." },
    { id: "M10", text: "A departed administrator's tablet still authenticates to the RADIUS server.", truth: "GAP", family: "keys", why: "Offboarding must revoke credentials — the secret outlived the employee." },
  ],

  LOG_ENTRIES: [
    { id: "L1", src: "auth.log", line: "accepted telnet session to NORTH-GW1 from 203.0.113.77 (interactive)", failing: "hard" },
    { id: "L2", src: "radius.log", line: "802.1X EAP-Success staff-laptop-114 → VLAN 10, posture=PASS (agent)" },
    { id: "L3", src: "certmgr.log", line: "www[.]northlake[.]edu chain NOT VALID: notAfter=2026-10-17 (expired 23d)", failing: "keys" },
    { id: "L4", src: "fw.log", line: "rule 1 'permit ip any any' matched 41,204 times in 24h (0 denies)", failing: "acl" },
    { id: "L5", src: "dhcp.log", line: "guest pool 10.9.9.0/24: 38 leases granted, 0 rejected" },
    { id: "L6", src: "nac.log", line: "MAB grant lib-printer-02 → printer VLAN 40 (allowed legacy device)" },
    { id: "L7", src: "dnsfilter.log", line: "guest 10.9.9.23 queried update-cdn-metrics.example → ALLOWED (no policy loaded)", failing: "filter" },
    { id: "L8", src: "auth.log", line: "ssh session to NORTH-CS1 accepted (key-based, admin-jrosa)" },
    { id: "L9", src: "urlfilter.log", line: "category=streaming BLOCKED for guest 10.9.9.41 (mediastream.example)" },
    { id: "L10", src: "radius.log", line: "VPN tunnel up for contractor-v38 (per-user certificate auth — healthy)" },
    { id: "L11", src: "fw.log", line: "NAT: 1,182 outbound translations, no errors" },
  ],

  ROLLOUT_STEPS: [
    { id: "R1", text: "Back up the running configs of GW1, CS1 and WLC1 to the config archive." },
    { id: "R2", text: "Renew and install the www certificate — the campus-wide browser warnings stop first." },
    { id: "R3", text: "Rotate the VPN & RADIUS secrets; revoke the ex-admin's tablet." },
    { id: "R4", text: "Pilot 802.1X in monitor-only mode in the lab VLAN (5 volunteer laptops)." },
    { id: "R5", text: "Turn on NAC enforcement (quarantine) for the student & public networks." },
    { id: "R6", text: "In the maintenance window: apply device hardening, rewrite the ACLs, re-run the audit." },
  ],

  ROLLOUT_RULES: "Policy constraints from the change-control board: nothing touches the network before a config backup exists; user-facing outages are fixed before housekeeping; enforcement never precedes a monitor-mode pilot; the audit always closes the window.",

  DETECTION_RULES: [
    { id: "R-A", text: "Alert on ANY guest DNS query to a domain first seen < 24 h ago.", kind: "noisy" },
    { id: "R-B", text: "Alert when a guest session hits a blocked malware/phishing category 3+ times in 10 minutes.", kind: "good" },
    { id: "R-C", text: "Alert on every streaming-category block for guest clients.", kind: "noisy" },
  ],

  RESIDUAL_QUESTION: {
    prompt: "Remediation is complete and the audit is green. Which residual-risk statement is TRUE — and which control family would close it?",
    statements: [
      { id: "S1", text: "URL/category filtering cannot see inside encrypted HTTPS payloads — a C2 channel riding TLS to an innocent-looking domain may still pass.", ok: true },
      { id: "S2", text: "With every objective stamped, the network has no residual risk worth recording.", ok: false },
      { id: "S3", text: "Default credentials on the switches remain the biggest outstanding risk.", ok: false },
    ],
    families: [
      { id: "F1", text: "TLS/HTTPS inspection & DNS-layer security (look inside the tunnel / resolve-check)" },
      { id: "F2", text: "Longer passwords on the Wi-Fi" },
      { id: "F3", text: "More permissive ACLs so alerts stop firing" },
    ],
    correctStatement: "S1",
    correctFamily: "F1",
    explain: "Filtering by domain/category stops the lookup, but TLS encrypts the payload — without inspection or DNS-layer security, content inside the tunnel stays invisible. No control set reaches zero risk; saying defaults are 'still the biggest risk' contradicts the completed hardening.",
  },

  // ── Debrief (C6) ───────────────────────────────────────────────────────
  DETECTION_TABLE: [
    { source: "Firewall / ACL syslog", logic: "alert on 'permit ip any any' matches > 0 — and on any accepted tcp/23 to management zones", note: "a blanket permit reappearing is an incident, not a config choice" },
    { source: "Auth logs (Telnet/SSH)", logic: "alert on ANY accepted telnet session to network devices; baseline SSH key-auth sessions", note: "cleartext mgmt should never succeed — one hit is a finding" },
    { source: "RADIUS / NAC accounting", logic: "alert on MAB grants to non-printer MACs; spikes of posture=FAIL or quarantine placements", note: "MAB is the weak door — watch who walks through it" },
    { source: "Certificate monitoring", logic: "alert when any deployed cert has < 14 days validity; alert on browser-warning rates from the web tier", note: "expiry is a scheduled incident — detect it before visitors do" },
    { source: "DNS / URL filter logs", logic: "alert on guests hitting blocked malware/phishing categories repeatedly; new-domain bursts from one client", note: "retries against a block are beaconing behavior" },
  ],

  MITRE_LINKS: [
    { id: "M1030", label: "Network Segmentation", url: "https://attack.mitre.org/mitigations/M1030/" },
    { id: "M1037", label: "Filter Network Traffic", url: "https://attack.mitre.org/mitigations/M1037/" },
    { id: "M1021", label: "Restrict Web-Based Content", url: "https://attack.mitre.org/mitigations/M1021/" },
    { id: "M1051", label: "Update Software", url: "https://attack.mitre.org/mitigations/M1051/" },
    { id: "M1027", label: "Password Policies", url: "https://attack.mitre.org/mitigations/M1027/" },
    { id: "M1041", label: "Encrypt Sensitive Information", url: "https://attack.mitre.org/mitigations/M1041/" },
    { id: "T1078.001", label: "Default Accounts", url: "https://attack.mitre.org/techniques/T1078/001/" },
    { id: "T1552.004", label: "Private Keys", url: "https://attack.mitre.org/techniques/T1552/004/" },
    { id: "T1190", label: "Exploit Public-Facing Application", url: "https://attack.mitre.org/techniques/T1190/" },
  ],

  BLUE_TAKEAWAYS: [
    "Label zones before writing rules — every ACL line inherits the trust label of its source.",
    "Specific above general, permits above the implicit deny, explicit denies only where you want intent logged.",
    "Hardening is removal work: no Telnet, no SNMPv1, no factory creds, no unused port awake.",
    "Keys have lifecycles, not statuses: issue → store → rotate → revoke. Offboarding is a revocation event.",
    "Filter with categories, correct with allowlists — and say out loud what TLS hides from you.",
    "Always: backup → pilot → enforce → verify. Change control is part of the control.",
  ],

  RED_TAKEAWAYS: [
    "Default credentials and exposed management (Telnet/HTTP) are the cheapest way in — try them first, they usually work.",
    "A flat network is a gift: one web bug becomes a records-server breach when public services share VLANs with treasures.",
    "permit ip any any means your ACL is decoration — everything matches, nothing denies.",
    "Shared secrets never die of old age: a 2023 PSK or an offboarded admin's tablet is a standing invitation.",
    "Filtering blind spots are real: TLS hides payloads from category filters — C2 rides permitted HTTPS comfortably.",
    "Unmanaged device + open wall port = a workstation you don't monitor on a network you trusted.",
  ],

  ZONES: [
    { id: "untrusted", name: "UNTRUSTED ZONE", tag: "THE OUTSIDE", desc: "The Internet and guest/student wireless. No device here is assumed safe; nothing here may reach trusted resources directly." },
    { id: "dmz", name: "SCREENED SUBNET", tag: "THE BUFFER", desc: "Public-facing services live here so a compromise cannot spread inward. Inbound traffic is limited to the exact ports each service needs." },
    { id: "trusted", name: "TRUSTED ZONE", tag: "THE INSIDE", desc: "Staff, records and managed endpoints. Access from untrusted sources is denied at the border; lateral access is least-privilege." },
    { id: "mgmt", name: "MANAGEMENT ZONE", tag: "THE VAULT", desc: "Where the network's own devices are managed. Most restricted zone: SSH from admin workstations only, everything else denied." },
  ],

  // Display order for zone stamp menus: outside → buffer → inside → vault
  ZONE_ORDER: ["untrusted", "dmz", "trusted", "mgmt"],
};

// AUDIT_ORDER: ids of TRAFFIC_SAMPLES in display order
window.RL_DATA.AUDIT_ORDER = window.RL_DATA.TRAFFIC_SAMPLES.map(function (s) { return s.id; });
