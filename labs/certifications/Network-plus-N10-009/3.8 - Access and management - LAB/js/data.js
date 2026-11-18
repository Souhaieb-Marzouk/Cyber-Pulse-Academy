// ─────────────────────────────────────────────────────────────────────────────
// CyberLab: "CASCADE FREIGHTWORKS // NOC PATCHBAY" — lab content (1:1 static port)
// CompTIA Network+ N10-009 — Access & Management (VPNs, SSH, GUI, API, Console)
// ALL DATA IS SYNTHETIC TRAINING DATA — fictional org, RFC1918/RFC5737 addresses.
// Content maps to N10-009 Domain 3.5 "Network Access" + management interfaces.
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// CyberLab: "CASCADE FREIGHTWORKS // NOC PATCHBAY"
// CompTIA Network+ N10-009 — Access & Management (VPNs, SSH, GUI, API, Console)
// ALL DATA IS SYNTHETIC TRAINING DATA — fictional org, RFC1918/RFC5737 addresses.
// Content maps to N10-009 Domain 3.5 "Network Access" + management interfaces.
// ─────────────────────────────────────────────────────────────────────────────

const PILLAR_LABEL = {
  P1: "UNDERSTAND",
  P2: "RECOGNIZE",
  P3: "DETECT",
  P4: "MITIGATE",
};

const CHANNEL_META = {
  vpn: { name: "VPN TUNNEL", port: "P1", color: "#FFB224", dim: "#8a6b1f", hint: "Encrypted tunnels over public networks" },
  ssh: { name: "SSH TERMINAL", port: "P2", color: "#4ADE80", dim: "#1f6b41", hint: "Encrypted remote command line (TCP/22)" },
  gui: { name: "WEB GUI", port: "P3", color: "#C4A7FF", dim: "#5b4a86", hint: "HTTPS device dashboards & managers" },
  api: { name: "REST API", port: "P4", color: "#45D6C4", dim: "#1f6b63", hint: "Programmatic JSON management at scale" },
  console: { name: "CONSOLE / OOB", port: "P5", color: "#FF7A45", dim: "#8a4323", hint: "Serial console port — works when the network doesn't" },
  bench: { name: "RACK BENCH", port: "P6", color: "#D9E2DC", dim: "#5c665f", hint: "Workbench: harden the core switch config" },
};

const ORG = {
  name: "CASCADE FREIGHTWORKS",
  tagline: "Regional freight & cold-chain logistics",
  lab: "ACCESS & MANAGEMENT TRAINING BAY",
  cert: "CompTIA Network+ N10-009 · Access & management (VPNs · SSH · GUI · API · Console)",
};

// ── Topology ────────────────────────────────────────────────────────────────

const DEVICES = [
  { id: "HQ-CORE-SW01", name: "HQ-CORE-SW01", site: "HQ — Portland, OR", role: "Core switch (Catalyst-class)", ip: "10.20.0.2", oob: "—", reachableBy: { ssh: true, gui: false, api: true, console: true }, serialPort: "S1" },
  { id: "HQ-FW01", name: "HQ-FW01", site: "HQ — Portland, OR", role: "Perimeter firewall", ip: "10[.]20[.]0[.]5", oob: "—", reachableBy: { ssh: true, gui: true, api: true, console: true }, serialPort: "S1" },
  { id: "DC-GW01", name: "DC-GW01", site: "HQ — Portland, OR", role: "VPN concentrator / SDN controller", ip: "10.20.0.9 (pub 203.0.113.10)", oob: "—", reachableBy: { ssh: true, gui: true, api: true, console: false }, serialPort: undefined },
  { id: "BR1-RTR01", name: "BR1-RTR01", site: "Yard 7 — Tacoma, WA", role: "Branch router", ip: "10.30.0.1", oob: "172.31.255.2", reachableBy: { ssh: true, gui: false, api: true, console: true }, serialPort: "S2" },
  { id: "TERM-SRV01", name: "TERM-SRV01", site: "HQ — Portland, OR (OOB rack)", role: "Terminal server — console aggregation, LTE backhaul", ip: "10.20.255.9 (OOB 172.31.255.1)", oob: "172.31.255.1", reachableBy: { ssh: true, gui: false, api: false, console: false }, serialPort: undefined },
];

// During the storm drill, only the HQ↔Yard 7 fiber is cut.
function isReachable(deviceId, channel, storm) {
  const dev = DEVICES.find((d) => d.id === deviceId);
  if (!dev) return false;
  if (deviceId === "BR1-RTR01" && storm) return false; // in-band path to Yard 7 is down
  return dev.reachableBy[channel];
}

// ── Running config (synthetic, deliberately flawed) ────────────────────────
const INSECURE_LINES = ["transport-in", "weak-cred", "http-srv", "ssh-v1", "key-768"];

const RUNNING_CONFIG = [
  { id: "hdr", text: "! HQ-CORE-SW01 — running-config (excerpt) — SYNTHETIC TRAINING DEVICE" },
  { id: "host", text: "hostname HQ-CORE-SW01" },
  { id: "dom", text: "ip domain-name cascade.local" },
  { id: "key-768", text: "crypto key generate rsa modulus 768", insecure: true, why: "768-bit RSA keys are obsolete. Modern SSH device keys are 2048-bit or larger." },
  { id: "ssh-v1", text: "ip ssh version 1", insecure: true, why: "SSHv1 has known design flaws (integrity, MITM). Devices should run SSH version 2 only." },
  { id: "ssh-to", text: "ip ssh time-out 60" },
  { id: "http-srv", text: "ip http server", insecure: true, why: "A plain-HTTP management web server serves the GUI unencrypted — credentials can be sniffed. If a web GUI is needed, use secure HTTP (HTTPS) only." },
  { id: "weak-cred", text: "username admin password admin123", insecure: true, why: "Default/weak credentials on a privileged account. Change defaults and use strong, unique secrets." },
  { id: "acl-mgmt", text: "access-list 10 permit 10.20.1.0 0.0.0.255" },
  { id: "log", text: "logging host 10.20.0.40" },
  { id: "line-con", text: "line console 0" },
  { id: "con-to", text: " exec-timeout 5 30" },
  { id: "line-vty", text: "line vty 0 4" },
  { id: "transport-in", text: " transport input telnet", insecure: true, why: "The VTY lines accept only Telnet (TCP/23) — an unencrypted remote shell. Everything, including passwords, crosses the wire in plaintext. This line should read 'transport input ssh'." },
  { id: "acl-in", text: " access-class 10 in" },
  { id: "end", text: "end" },
];

// ── Management access log (synthetic) ───────────────────────────────────────

const ACCESS_LOG = [
  { id: "L1", time: "09:14:22", src: "10.20.1.44", dst: "10.20.0.2", port: "22", proto: "SSH", detail: "accepted  user=nwest (NOC operator, key auth)" },
  { id: "L2", time: "09:21:07", src: "10.20.1.44", dst: "10.20.0.2", port: "22", proto: "SSH", detail: "accepted  user=nwest" },
  { id: "L3", time: "10:02:55", src: "198.51.100.77", dst: "10.20.0.2", port: "23", proto: "TELNET", detail: "session opened  user=admin" },
  { id: "L4", time: "10:03:11", src: "198.51.100.77", dst: "10.20.0.2", port: "23", proto: "TELNET", detail: "command: show run" },
  { id: "L5", time: "10:04:40", src: "198.51.100.77", dst: "10.20.0.2", port: "22", proto: "SSH", detail: "FAILED ×9  user=root" },
  { id: "L6", time: "10:04:52", src: "198.51.100.77", dst: "10.20.0.2", port: "22", proto: "SSH", detail: "FAILED ×6  user=admin" },
  { id: "L7", time: "11:30:02", src: "10.20.1.99", dst: "10[.]20[.]0[.]5", port: "22", proto: "SSH", detail: "FAILED ×2  user=healthcheck (monitoring host, stale key)" },
  { id: "L8", time: "11:30:09", src: "10.20.1.99", dst: "10[.]20[.]0[.]5", port: "22", proto: "SSH", detail: "accepted  user=healthcheck (monitoring host)" },
  { id: "L9", time: "12:40:18", src: "10.20.3.12", dst: "10[.]20[.]0[.]5", port: "443", proto: "GUI", detail: "login accepted  user=ops1 (HTTPS)" },
  { id: "L10", time: "12:41–12:44", src: "10.20.3.12", dst: "10[.]20[.]0[.]5", port: "443", proto: "GUI", detail: "automated report pull ×14 (scheduled job)" },
];

const M8_EXPECTED_FLAGS = ["L3", "L4", "L5", "L6"];

const JUDGE_EVENTS = [
  { id: "A1", alert: "ALERT A1 — Telnet session from 198.51.100.77 to 10.20.0.2:23", context: "External source, privileged login, plaintext protocol.", verdict: "tp" },
  { id: "A2", alert: "ALERT A2 — SSH failures from 10.20.1.99 (user healthcheck)", context: "Internal monitoring host, 2 failures then success, known service account.", verdict: "fp" },
  { id: "A3", alert: "ALERT A3 — SSH accepted ×2 from 10.20.1.44 (user nwest)", context: "NOC operator workstation, key-based auth, business hours.", verdict: "fp" },
];

// ── VPN data ────────────────────────────────────────────────────────────────
const VPN_SESSIONS = [
  { sid: "V-2201", type: "client", user: "r.delgado", role: "field", tunnel: "split", acl: ["10.20.0.0/16", "10.30.0.0/16"], src: "198.51.100.201", since: "06:10" },
  { sid: "V-2202", type: "client", user: "t.jennings", role: "contractor", tunnel: "full", acl: [], src: "198.51.100.44", since: "07:02" },
  { sid: "V-2203", type: "client", user: "a.moreau", role: "contractor", tunnel: "split", acl: ["10.20.0.0/16"], src: "198.51.100.159", since: "07:15" },
  { sid: "V-2204", type: "site", user: "HQ↔Yard7", role: "—", tunnel: "always-on", acl: ["10.20.0.0/16", "10.30.0.0/16"], src: "203.0.113.10", since: "17d" },
  { sid: "V-2205", type: "client", user: "d.kim", role: "field", tunnel: "split", acl: ["10.20.0.0/16"], src: "198.51.100.88", since: "08:44" },
  { sid: "V-2206", type: "client", user: "x.valdez", role: "contractor", tunnel: "full", acl: [], src: "198.51.100.44", since: "02:13", note: "approved change window 02:00–04:00 (CHG-1042)" },
];

const SPLIT_ACL_OPTIONS = [
  { id: "hq", label: "10.20.0.0/16 — HQ file & ERP servers", through: true },
  { id: "yard", label: "10.30.0.0/16 — Yard 7 WMS", through: true },
  { id: "public", label: "0.0.0.0/0 — everything else (public internet)", through: false },
];

// ── API (synthetic REST service on DC-GW01) ────────────────────────────────
const API_TOKEN = "tkn_noc_7c41a9e2d5b8";
const API_ENDPOINTS = [
  { id: "/devices", label: "GET /devices — inventory", method: "GET" },
  { id: "/vpn/sessions", label: "GET /vpn/sessions — active tunnels", method: "GET" },
  { id: "/config/audit", label: "GET /config/audit — compliance findings", method: "GET" },
  { id: "/firmware", label: "GET /firmware — versions & advisories", method: "GET" },
];

function apiRespond(endpoint, token, storm) {
  if (!token || token !== API_TOKEN) {
    return { status: 401, body: { error: "unauthorized", hint: "Supply the Bearer token from the NOC API README." } };
  }
  switch (endpoint) {
    case "/devices":
      return {
        status: 200,
        body: {
          count: 5,
          devices: DEVICES.map((d) => ({ id: d.id, site: d.site, role: d.role, mgmtIp: d.ip, oob: d.oob })),
        },
      };
    case "/vpn/sessions":
      return {
        status: 200,
        body: {
          updated: storm ? "during storm drill" : "live",
          sessions: storm ? VPN_SESSIONS.filter((s) => s.type === "client") : VPN_SESSIONS,
        },
      };
    case "/config/audit":
      return {
        status: 200,
        body: {
          scanOf: "HQ-CORE-SW01",
          findings: [
            { id: "F-01", severity: "critical", rule: "vty.transport", detail: "Telnet permitted on VTY lines" },
            { id: "F-02", severity: "high", rule: "ssh.version", detail: "SSH version 1 enabled" },
            { id: "F-03", severity: "high", rule: "rsa.modulus", detail: "Device RSA key below 2048 bits (768)" },
            { id: "F-04", severity: "medium", rule: "http.server", detail: "Plain HTTP management server enabled" },
            { id: "F-05", severity: "medium", rule: "local.credential", detail: "Default credential admin/admin123 in use" },
          ],
        },
      };
    case "/firmware":
      return {
        status: 200,
        body: {
          devices: [
            { id: "HQ-FW01", version: "9.2.4f", advisory: "none open" },
            { id: "HQ-CORE-SW01", version: "15.2(7)E3", advisory: "none open" },
            { id: "BR1-RTR01", version: "17.9.4a", advisory: "none open" },
          ],
        },
      };
    default:
      return { status: 404, body: { error: "unknown endpoint" } };
  }
}

const API_AUDIT = {
  note: "api_audit.json — DC-GW01 controller audit trail, exported for the night-shift review (SYNTHETIC)",
  rows: [
    { ts: "01:58:11", token: "tkn_noc_7c41a9e2d5b8", ip: "10.20.1.44", endpoint: "/vpn/sessions", result: "200" },
    { ts: "02:03:41", token: "tkn_noc_7c41a9e2d5b8", ip: "198.51.100.77", endpoint: "/config/deploy", result: "200" },
    { ts: "02:05:19", token: "tkn_noc_7c41a9e2d5b8", ip: "198.51.100.77", endpoint: "/config/deploy", result: "200" },
    { ts: "02:11:02", token: "tkn_ro_33f1c9", ip: "10.20.1.44", endpoint: "/devices", result: "200" },
    { ts: "02:12:44", token: "tkn_ro_33f1c9", ip: "10.20.1.44", endpoint: "/vpn/sessions", result: "200" },
    { ts: "02:20:07", token: "tkn_noc_7c41a9e2d5b8", ip: "198.51.100.77", endpoint: "/config/deploy", result: "200" },
  ],
};

const SSH_NEGOTIATION = {
  note: "ssh_negotiation.log — captured handshake to a legacy vendor switch (SYNTHETIC)",
  lines: [
    "client → server banner: SSH-2.0-OpenSSH_9.6",
    "server → client banner: SSH-1.99-OpenSSH_5.9",
    "kex algorithms offered: diffie-hellman-group1-sha1,diffie-hellman-group14-sha1",
    "kex negotiated: diffie-hellman-group1-sha1",
    "cipher negotiated: 3des-cbc",
    "server host key: ssh-rsa 1024",
  ],
  facts: [
    "Banner SSH-1.99 means the server still accepts SSH version 1 for compatibility.",
    "diffie-hellman-group1-sha1 and 3des-cbc are deprecated, weak choices.",
    "A 1024-bit RSA host key no longer meets modern guidance (2048+).",
  ],
};

// ── Evidence documents ──────────────────────────────────────────────────────
const TOPOLOGY_DOC = `CASCADE FREIGHTWORKS — NETWORK TOPOLOGY (SYNTHETIC)

HQ — Portland, OR                       Yard 7 — Tacoma, WA
+---------------------------+            +------------------+
| HQ-FW01      10[.]20[.]0[.]5    |            | BR1-RTR01        |
| HQ-CORE-SW01 10.20.0.2    |===IPsec====| 10.30.0.1        |
| DC-GW01 (VPN) 10.20.0.9   | WAN fiber  | (site-to-site)   |
| TERM-SRV01   10.20.255.9  |            +------------------+
|   S1 -> HQ console ports  |                   ^
|   S2 -> BR1-RTR01 console |                   |
+---------------------------+    OOB: TERM-SRV01 <= LTE <= Yard 7
        |
   Internet (203.0.113.0/24)   Field techs -> client-to-site VPN -> DC-GW01
   Contractors -> client-to-site VPN -> DC-GW01 (policy: FULL tunnel + MFA)`;

const API_README = `NOC API README (SYNTHETIC) — DC-GW01 controller
Base URL: https://api.cascade-noc.local/v1
Auth:     Authorization: Bearer <token>
NOC token: ${API_TOKEN}   (least-privilege note: NOC token can read + deploy)

Endpoints
  GET  /devices        inventory of managed devices
  GET  /vpn/sessions   active VPN sessions (client + site-to-site)
  GET  /config/audit   config compliance findings
  GET  /firmware       firmware versions & open advisories

Rules: never embed tokens in scripts or repos; rotate quarterly;
read-only integrations get tkn_ro_* tokens.`;

const INCIDENT_BRIEF = `NIGHT-SHIFT INCIDENT BRIEF (SYNTHETIC) — 22:47 STORM WATCH
Weather service warns of a major storm cell on the Portland–Tacoma fiber route.
On your evidence desk:
  - auth_access log — management sessions from yesterday
  - vpn_sessions log — last night's tunnels
  - api_audit.json — controller API calls overnight
  - config audit findings — HQ-CORE-SW01 baseline drift
  - ssh_negotiation.log — handshake capture to a legacy vendor switch
Duty: keep the network manageable when the WAN dies, and find out whether
yesterday's management plane was already abused. Watch for noise: some
failures are benign.`;

// ── Glossary ────────────────────────────────────────────────────────────────
const GLOSSARY = [
  { term: "VPN (Virtual Private Network)", def: "An encrypted tunnel that carries private traffic across an untrusted network (usually the internet)." },
  { term: "Tunnel", def: "The encrypted path that encapsulates packets so they can safely cross a public network." },
  { term: "Client-to-site VPN", def: "One device (a laptop, a truck) connecting into the corporate network remotely. Aka remote-access VPN." },
  { term: "Site-to-site VPN", def: "A permanent tunnel linking two entire networks, e.g. HQ ↔ branch office or depot." },
  { term: "Full tunnel", def: "ALL client traffic is routed through the VPN — maximum control and security, more gateway bandwidth used." },
  { term: "Split tunnel", def: "Only chosen destinations (by ACL) go through the VPN; the rest goes straight out to the internet — efficient, but the endpoint browses unprotected." },
  { term: "Clientless VPN", def: "A TLS/HTML5 VPN reached from a plain web browser with no installed client — convenient for kiosks and third parties." },
  { term: "IPsec", def: "Protocol suite that encrypts and authenticates IP packets; the classic engine for site-to-site tunnels." },
  { term: "TLS VPN", def: "VPN built on the same encryption your browser uses (SSL/TLS) — easy to traverse firewalls, common for client access." },
  { term: "SSH (Secure Shell)", def: "Encrypted remote command-line administration, TCP port 22. The standard for device CLI management." },
  { term: "Telnet", def: "Remote CLI over TCP port 23 with NO encryption — passwords and configs cross the wire in plaintext. Legacy only." },
  { term: "GUI management", def: "Browser (HTTPS) or vendor application used to manage devices visually — friendly, but per-device and not scriptable." },
  { term: "API management", def: "Managing devices programmatically (REST + JSON) with tokens — the engine of automation and configuration at scale." },
  { term: "Console port", def: "A physical serial port on a device; reachable with a rollover/console cable even when the network is completely down." },
  { term: "In-band management", def: "Managing a device over the production network itself (SSH, HTTPS, API). Dies when the network dies." },
  { term: "Out-of-band (OOB) management", def: "A dedicated, independent path (terminal server + LTE/modem) so you can manage devices even during an outage." },
  { term: "Jump box / bastion host", def: "A hardened server that is the ONLY allowed stepping stone into the management plane — one door to watch and lock." },
];

// ── Field manual (Knowledge Core, C2) ───────────────────────────────────────
const MANUAL = [
  {
    id: "why",
    title: "Why this lesson matters",
    body: [
      "Every device on the network — router, switch, firewall, VPN gateway — must be reachable by an administrator, or it can't be operated. Network+ N10-009 tests whether you know the five ways in (VPN, SSH, GUI, API, console), when each is the right tool, and how to keep those doors from becoming an attacker's doors.",
      "The same channels that make you fast make an attacker fast too. Telnet, default credentials, split tunnels for contractors, APIs with leaked tokens — every incident in this lab starts as a convenience feature left unhardened.",
    ],
  },
  {
    id: "vpn",
    title: "VPNs — encrypted tunnels over untrusted networks",
    body: [
      "A VPN builds an encrypted tunnel across the internet so private traffic stays confidential and authenticated. Two shapes matter for the exam: client-to-site (one user/device connects in — the field tech at a truck stop) and site-to-site (two networks are joined permanently — HQ ↔ Yard 7, usually with IPsec).",
      "Client VPNs come in two routing modes. FULL tunnel: everything goes through the gateway — total control, corporate filtering applies, but video calls and streaming burn gateway bandwidth. SPLIT tunnel: only selected destinations (defined by ACLs) use the tunnel; the rest exits locally — efficient, but the endpoint browses the public internet outside your protection, and that local traffic is unmonitored.",
      "Clientless (HTML5/TLS) VPNs need no installed client — the browser IS the client. Convenient for kiosks and third parties, but with weaker reach than a full client. Protocols to know: IPsec (suite for site-to-site and clients) and SSL/TLS VPN (browser-friendly client access). VPN gateways should demand strong authentication — MFA at minimum for anyone entering the network.",
    ],
  },
  {
    id: "ssh",
    title: "SSH vs Telnet — the command line door",
    body: [
      "SSH (TCP/22) is the encrypted remote shell: every byte, including the password, is protected, and host keys let the client verify it reached the right device. Telnet (TCP/23) is the same interactive experience with zero encryption — a sniffer on the path reads usernames, passwords and configs in the clear. On the exam: Telnet = legacy, insecure; SSH = the answer.",
      "Device-side SSH hygiene: run SSH version 2 only, generate a strong host key (2048-bit RSA or larger), restrict the VTY lines with 'transport input ssh' plus an access-class ACL so only the management subnet can even knock, and never leave default credentials.",
    ],
  },
  {
    id: "gui",
    title: "GUI management — the dashboard door",
    body: [
      "Web interfaces (ideally HTTPS) and vendor management apps give visual dashboards: interface health, license/subscription states, wizards. They're friendly for spot checks and training wheels — but they're per-device, click-driven, and don't scale to 40 switches, which is exactly why the API exists.",
      "Watch the transport: a GUI served over plain HTTP (the 'ip http server' habit) is a credential-sniffing risk. Padlock or it didn't happen.",
    ],
  },
  {
    id: "api",
    title: "API management — the automation door",
    body: [
      "Modern devices expose REST APIs that accept JSON: GET to read state, POST/PUT to change it, authenticated with bearer tokens. APIs are how you back up 40 switches nightly, push config at scale, and feed controllers — and they're the management face of SDN (software-defined networking), where a controller programs the network programmatically.",
      "API security is identity hygiene: scoped least-privilege tokens, rotation, never embedding tokens in scripts or repos, and restricting which sources may call the management API.",
    ],
  },
  {
    id: "console",
    title: "Console & OOB — the door that survives disaster",
    body: [
      "Every serious network device has a physical console (serial) port. Patch it to a terminal server, give the terminal server its own independent backhaul (modem, LTE), and you have OUT-OF-BAND (OOB) management: a channel that works precisely when the production network doesn't.",
      "IN-BAND management (SSH/GUI/API over the network) dies with the network — a cut fiber, a misconfigured ACL, a dead WAN. OOB survives it. That's why disaster-recovery plans always end with 'reach it via console'.",
      "A jump box (bastion host) is the opposite problem solved: instead of letting every admin workstation reach every device, force all in-band management through ONE hardened server — one chokepoint to audit, patch, and lock down.",
    ],
  },
];

const FIELD_NOTES = {
  detection: [
    { src: "Management/auth logs (device + AAA)", logic: "alert on any session to TCP/23 (Telnet) OR ≥5 SSH failures/min from one source OR any management session sourced from a non-management subnet" },
    { src: "VPN gateway logs", logic: "alert when role=contractor connects with tunnel=split, or when MFA is bypassed, or session count from one user spikes" },
    { src: "API audit trail", logic: "alert when one token is used from two source IPs within an hour, or /config/deploy is called off-change-window" },
    { src: "Config compliance scan (API /config/audit)", logic: "alert on drift: transport input telnet present, SSHv1 enabled, default credentials, http server enabled" },
  ],
  mitigation: [
    { id: "VTY", text: "Disable Telnet on VTY lines: transport input ssh + access-class ACL limited to the management subnet" },
    { id: "SSH", text: "SSH version 2 only, RSA key modulus 2048+ (or ECDSA/Ed25519), exec-timeout on idle sessions" },
    { id: "CREDS", text: "Eliminate default credentials; unique strong secrets per device; key-based SSH where possible" },
    { id: "GUI", text: "HTTPS-only management (disable plain HTTP server); restrict which sources may reach the GUI" },
    { id: "VPN", text: "MFA on the gateway; full tunnel + endpoint checks for contractors and high-risk roles; review split-tunnel ACLs quarterly" },
    { id: "API", text: "Scoped tokens, rotation, no secrets in repos, management VLAN/ACL restrictions on the API port" },
    { id: "OOB", text: "Console ports patched to a terminal server on an isolated OOB network with independent backhaul; jump box for all in-band admin" },
  ],
  blue: [
    "Assume every legacy convenience (Telnet, HTTP GUI, default creds) is discovered and used within days of exposure — yesterday's log proves it.",
    "The management plane is a network of its own: inventory every channel into every device, then watch each one with its own detection.",
    "OOB is insurance you buy before the storm — if console/terminal-server access isn't drilled, it won't work during the incident.",
  ],
  red: [
    "Attackers don't break the front door when Telnet is still open — plaintext creds from 198.51.100.77 were all it took here.",
    "Split tunnels give an outsider a live foothold INSIDE your address space; their traffic also bypasses your monitoring.",
    "A leaked API token is a shell account without a shell — /config/deploy over REST changes the network just as surely as a CLI session.",
  ],
  links: [
    { label: "CompTIA Network+ N10-009 (official page)", url: "https://www.comptia.org/certifications/network" },
    { label: "Professor Messer N10-009 course — objective 3.5 Network Access", url: "https://www.professormesser.com/network-plus/n10-009/n10-009-video/n10-009-training-course" },
  ],
  examTips: [
    "Exam questions pair a SYMPTOM with a METHOD: 'network is down + you must configure the router' → console/OOB; '40 devices nightly' → API; 'secure interactive CLI' → SSH.",
    "Tunnel questions: full = everything through the gateway; split = ACL-selected only. Clientless = browser, no client.",
    "Ports: SSH 22, Telnet 23. If both appear in one question, the encrypted choice is the answer unless a legacy constraint is stated.",
  ],
};

// ── Decision matrix tasks ───────────────────────────────────────────────────
const MATRIX_METHODS = [
  { id: "vpn-client", label: "Client-to-site VPN" },
  { id: "vpn-site", label: "Site-to-site VPN" },
  { id: "ssh", label: "SSH" },
  { id: "gui", label: "Web GUI" },
  { id: "api", label: "API" },
  { id: "console", label: "Console (OOB)" },
];

const MATRIX_TASKS = [
  { id: "T1", text: "Yard 7's router must be reconfigured NOW, but the WAN fiber is cut and the site is unreachable from HQ." },
  { id: "T2", text: "Push a nightly config backup to all 40 switches, automatically, without touching each one." },
  { id: "T3", text: "A field tech at a truck stop needs the HQ file share securely over hotel Wi-Fi." },
  { id: "T4", text: "Spot-check firewall interface health using vendor dashboards, just this once." },
  { id: "T5", text: "NOC engineer interactively edits the core switch config over the LAN." },
  { id: "T6", text: "Permanently link the new Denver depot's network to HQ." },
];
const MATRIX_ANSWERS = { T1: "console", T2: "api", T3: "vpn-client", T4: "gui", T5: "ssh", T6: "vpn-site" };

// ── Hard-mode: OOB recovery sequence ────────────────────────────────────────
const RECOVERY_STEPS = [
  { id: "R1", text: "Route to the out-of-band path: open a session to TERM-SRV01 (it lives on the isolated OOB network with LTE backhaul)." },
  { id: "R2", text: "Patch to serial port S2 — the port cabled to BR1-RTR01's CONSOLE port." },
  { id: "R3", text: "Log in on the console session (local device authentication still works)." },
  { id: "R4", text: "Restore the startup config and repair the WAN interface on BR1-RTR01." },
  { id: "R5", text: "Verify in-band SSH to BR1-RTR01 works again, then close the console session." },
];
const RECOVERY_ORDER = ["R1", "R2", "R3", "R4", "R5"];
const REACHABLE_DURING_STORM = ["ssh:HQ-CORE-SW01", "gui:HQ-FW01", "api:DC-GW01", "console:S1", "console:S2"];
const REACH_OPTIONS = [
  { id: "ssh:HQ-CORE-SW01", label: "SSH → HQ-CORE-SW01" },
  { id: "gui:HQ-FW01", label: "Web GUI → HQ-FW01" },
  { id: "api:DC-GW01", label: "API → DC-GW01" },
  { id: "ssh:BR1-RTR01", label: "SSH → BR1-RTR01" },
  { id: "gui:BR1-RTR01", label: "Web GUI → BR1-RTR01" },
  { id: "console:S1", label: "Console → S1 (HQ devices)" },
  { id: "console:S2", label: "Console → S2 (BR1-RTR01)" },
];

// ── Detection builder options (Hard) ────────────────────────────────────────
const DETECT_OPTIONS = {
  source: [
    { id: "mgmt-auth", label: "Management/auth access log (device & AAA)" },
    { id: "dhcp", label: "DHCP lease log" },
    { id: "snmp", label: "SNMP trap log" },
    { id: "cdn", label: "CDN edge log" },
  ],
  condition: [
    { id: "telnet-ssh", label: "Any session to TCP/23, or ≥5 SSH failures/min from one source" },
    { id: "443", label: "Any traffic to TCP/443" },
    { id: "dhcpnak", label: "DHCPNAK count above 3/day" },
    { id: "cpu", label: "Device CPU above 90% for 5 minutes" },
  ],
  action: [
    { id: "alert-block", label: "Alert the SOC and block the source at the firewall" },
    { id: "log-only", label: "Write to a log file nobody reads" },
    { id: "reboot", label: "Automatically reboot the device" },
    { id: "bandwidth", label: "Buy more bandwidth" },
  ],
};
