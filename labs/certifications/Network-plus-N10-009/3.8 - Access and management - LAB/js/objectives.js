// Mastery blueprint — objective definitions with machine-checkable validators (1:1 port).
// Medium: 12 granular guided objectives (OBJ-M1…M12) — Understand/Apply (Bloom)
// Hard: 9 broad multi-step challenges (OBJ-H1…H9) — Analyze/Evaluate/Create (Bloom)
// Validators are pure functions of the state object (same semantics as the original).

// Mastery blueprint — objective definitions with machine-checkable validators.
// Medium: 12 granular guided objectives (OBJ-M1…M12) — Understand/Apply (Bloom)
// Hard: 9 broad multi-step challenges (OBJ-H1…H9) — Analyze/Evaluate/Create (Bloom)

// Free-text answers are trimmed (device names case-insensitively) so a stray space or
// shift-lock can't fail an otherwise exact answer. Exact values are still required.
const txt = (s, k) => (s.answers[k] ?? "").trim();
const txtLC = (s, k) => txt(s, k).toLowerCase();

// ── Hard H6 persona options ─────────────────────────────────────────────────
const H6_PERSONAS = [
  { id: "P1", text: "Contractor needs repository access for a 2-week engagement." },
  { id: "P2", text: "NOC engineer does daily interactive admin across the LAN." },
  { id: "P3", text: "Building-management vendor needs read-only sensor metrics." },
  { id: "P4", text: "HQ loses power and WAN; a technician is dispatched to recover the site." },
];
const H6_METHODS = [
  { id: "vpn-client", label: "Client-to-site VPN" },
  { id: "ssh", label: "SSH (in-band)" },
  { id: "api", label: "API" },
  { id: "console", label: "Console / OOB" },
];
const H6_CONTROLS = [
  { id: "full-mfa-expiry", label: "Full tunnel + MFA + auto-expiring account" },
  { id: "jumpbox-acl", label: "Via jump box, key auth, management ACL" },
  { id: "ro-token-rotation", label: "Read-only scoped token, rotated, source-restricted" },
  { id: "escort-logged", label: "OOB console access, logged, with escort/change record" },
];
const H6_ANSWERS = {
  P1: { method: "vpn-client", control: "full-mfa-expiry" },
  P2: { method: "ssh", control: "jumpbox-acl" },
  P3: { method: "api", control: "ro-token-rotation" },
  P4: { method: "console", control: "escort-logged" },
};

// ── MEDIUM ──────────────────────────────────────────────────────────────────
const MEDIUM = [
  {
    id: "M1",
    mode: "medium",
    pillar: "P1",
    tag: "VPN types",
    title: "Classify both live VPN deployments: the HQ↔Yard 7 link and the field-tech connection.",
    pointer: "Open the VPN bay — the two classifier cards sit at the top.",
    validate: (s) => s.vpn.clsA === "site" && s.vpn.clsB === "client",
    success:
      "Correct. HQ↔Yard 7 joins two NETWORKS permanently → site-to-site (typically IPsec). The truck tech's laptop connects as ONE device → client-to-site. Exams love this pairing: networks vs users.",
    fail: "Not quite. Ask: 'how many devices connect?' One laptop = client-to-site. Two networks joined always-on = site-to-site. Check the classifier cards in the VPN bay.",
    hints: [
      "Two deployments, two shapes: one joins networks, one joins a user.",
      "HQ↔Yard 7 is always-on between two offices → site-to-site. The truck tech dials in as a single device → client-to-site.",
      "Set card A to SITE-TO-SITE and card B to CLIENT-TO-SITE.",
    ],
  },
  {
    id: "M2",
    mode: "medium",
    pillar: "P1",
    tag: "Full vs split tunnel",
    title: "With split tunnel active for STAFF and only the HQ subnet in the ACL, identify which traffic bypasses the VPN.",
    pointer: "VPN bay → set persona STAFF, mode SPLIT, ACL = HQ only, then run the traffic simulator and answer below.",
    validate: (s) =>
      s.answers["m2_bypass"] === "public" &&
      s.vpn.mode === "split" &&
      s.vpn.acl.includes("hq") &&
      !s.vpn.acl.includes("public") &&
      s.vpn.persona === "staff",
    success:
      "Exactly. With the split ACL covering only 10.20.0.0/16, public internet traffic exits the laptop directly — outside the tunnel, outside your monitoring. That's the split-tunnel trade-off: bandwidth saved, visibility lost.",
    fail:
      "Check your setup: persona STAFF, mode SPLIT, ACL containing HQ but NOT the public internet — then simulate. With that ACL, only public internet traffic bypasses; the HQ subnet rides the tunnel.",
    hints: [
      "Only ACL-selected destinations ride the tunnel. Everything else… doesn't.",
      "Run the simulator with the staff split profile (HQ only). Watch which packet takes the internet path.",
      "Answer: PUBLIC VIDEO STREAMING bypasses the VPN.",
    ],
  },
  {
    id: "M3",
    mode: "medium",
    pillar: "P1",
    tag: "SSH basics",
    title: "Patch into the SSH channel, log into HQ-CORE-SW01, and record its SSH port and encryption state.",
    pointer: "SSH bay → connect, run 'show ip ssh', then fill the two answer fields under the terminal.",
    validate: (s) =>
      s.sshLoggedIn && txt(s, "ssh_port") === "22" && s.answers["ssh_encrypted"] === "encrypted",
    success:
      "SSH = TCP/22, fully encrypted (and host-key verified). Note the device also reports SSH version 1 enabled and a 768-bit key — we'll fix both at the bench later. Compare Telnet: TCP/23, zero encryption.",
    fail: "Connect in the SSH bay first (try 'show ip ssh'), then answer: which TCP port does SSH use, and is the session encrypted or plaintext?",
    hints: [
      "The terminal answers 'show ip ssh' — it lists the port and version.",
      "SSH always uses TCP port 22; Telnet is 23. The session itself is encrypted.",
      "Answers: port 22, ENCRYPTED.",
    ],
  },
  {
    id: "M4",
    mode: "medium",
    pillar: "P2",
    tag: "Config audit — insecure lines",
    title: "Audit the running-config excerpt: flag every insecure line (there are 5).",
    pointer: "Evidence drawer → CONFIG tab → click the lines that feel like 2010.",
    validate: (s) => sameSet(s.configFlags, [...INSECURE_LINES]),
    success:
      "Clean audit. Telnet-only VTY transport, default credentials, plain-HTTP server, SSHv1, 768-bit key — five open doors on one management plane. Each maps to a hardening control you'll apply at the bench.",
    fail: "Missing or extra flags. The five: 'transport input telnet', the admin/admin123 credential, 'ip http server', 'ip ssh version 1', and the 768-bit RSA key. Benign lines (ACLs, logging, exec-timeout) stay unflagged.",
    hints: [
      "Read the VTY section and the credential/crypto lines carefully.",
      "Anything UNencrypted (telnet, http) or OBSOLETE (ssh v1, 768-bit) or DEFAULT (admin123) is a finding.",
      "Flag: transport-in, weak-cred, http-srv, ssh-v1, key-768.",
    ],
  },
  {
    id: "M5",
    mode: "medium",
    pillar: "P1",
    tag: "GUI management + HTTPS",
    title: "Patch into the web GUI, find the fact only the dashboard shows, and confirm its transport is encrypted.",
    pointer: "GUI bay → open the firewall dashboard, check the subscription card.",
    validate: (s) => s.answers["gui_transport"] === "https" && s.answers["gui_fact"] === "expired",
    success:
      "GUIs shine at visuals — that expired threat-prevention subscription is the kind of state a dashboard surfaces instantly. And the padlock matters: HTTPS, not the plain-HTTP server you flagged in the config.",
    fail: "Open the GUI bay and read the dashboard cards: what's wrong with the threat-prevention subscription, and is the URL using HTTPS or HTTP?",
    hints: [
      "Check the subscription/license card on the firewall dashboard.",
      "The subscription shows a date in the past — that means EXPIRED. The address bar shows the padlock → HTTPS.",
      "Answers: transport HTTPS, subscription EXPIRED.",
    ],
  },
  {
    id: "M6",
    mode: "medium",
    pillar: "P1",
    tag: "API management (REST/JSON)",
    title: "Use the API workbench with the NOC token to count active client-to-site VPN sessions.",
    pointer: "API bay → endpoint /vpn/sessions, paste the Bearer token from the README, send, count the 'client' sessions.",
    validate: (s) =>
      txt(s, "vpn_client_sessions") === "5" && s.api.endpoint === "/vpn/sessions" && s.api.status === 200,
    success:
      "One GET, five client sessions — that's API management: read state programmatically with a token, no clicking. Count every row with type='client' (V-2201, V-2202, V-2203, V-2205, and V-2206 — the approved change-window contractor is still a client session); only the type='site' HQ↔Yard 7 tunnel is excluded. Same call works for 400 devices.",
    fail: "In the API bay: select /vpn/sessions, paste the token from the NOC API README (Evidence → DOCS), press SEND. Then count EVERY row with type='client' and answer below.",
    hints: [
      "The token lives in the NOC API README (Evidence drawer → DOCS).",
      "You need endpoint /vpn/sessions with a 200 response before counting.",
      "Client sessions: V-2201, V-2202, V-2203, V-2205, V-2206 → answer 5.",
    ],
  },
  {
    id: "M7",
    mode: "medium",
    pillar: "P1",
    tag: "Console / OOB vs in-band",
    title: "Storm drill: with the WAN dead, reach BR1-RTR01 through the out-of-band path and name the channel type.",
    pointer: "Press RUN STORM DRILL (status bar), then patch CONSOLE → TERM-SRV01 port S2.",
    validate: (s) =>
      s.storm &&
      s.consolePatched &&
      s.consolePort === "S2" &&
      s.consoleDevice === "BR1-RTR01" &&
      s.answers["m7_type"] === "oob",
    success:
      "That's out-of-band management working exactly as designed: every in-band jack to Yard 7 went dark, but console S2 — a physical serial line through TERM-SRV01's independent LTE backhaul — stayed lit. This is why DR plans say 'reach it via console'.",
    fail: "Trigger the storm, watch the in-band jacks fail to Yard 7, then patch CONSOLE → port S2 (BR1-RTR01) and answer the channel-type question (in-band or out-of-band?).",
    hints: [
      "In-band = rides the production network. The storm just proved that path fragile.",
      "Console → select S2 → PATCH CABLE. S2 is cabled to BR1-RTR01's console port.",
      "Answer: OUT-OF-BAND (OOB).",
    ],
  },
  {
    id: "M8",
    mode: "medium",
    pillar: "P3",
    tag: "Log detection — management access",
    title: "Triage the management-access log: flag every entry from yesterday that indicates unauthorized access or attack.",
    pointer: "Evidence drawer → LOGS tab → flag suspicious rows.",
    validate: (s) => sameSet(s.logFlags, M8_EXPECTED_FLAGS),
    success:
      "Good triage. A Telnet session from an external IP (plaintext protocol + privilege!) plus SSH failure bursts from the same source — that's reconnaissance and possible compromise. The monitoring host's two failures followed by success? Routine noise. This is exactly how detections get tuned.",
    fail: "Look again: the story is one external source, 198.51.100.77 — a Telnet session (port 23!) plus two SSH failure bursts. The internal monitoring host (10.20.1.99) is a known service account, and the NOC/GUI logins are normal business.",
    hints: [
      "Ask of every row: who is the source, what port, what result?",
      "External IP 198.51.100.77 appears on port 23 AND in failed SSH bursts. The monitoring host on 10.20.1.99 is expected noise.",
      "Flag L3, L4, L5 and L6.",
    ],
  },
  {
    id: "M9",
    mode: "medium",
    pillar: "P4",
    tag: "Harden the management plane",
    title: "At the rack bench, harden HQ-CORE-SW01: SSH-only VTY, SSHv2, strong key, kill the HTTP server, replace the default credential.",
    pointer: "RACK BENCH bay → set the five controls, then APPLY.",
    validate: (s) =>
      s.hardening.applied &&
      s.hardening.transport === "ssh" &&
      s.hardening.sshVersion === "2" &&
      s.hardening.keySize >= 2048 &&
      s.hardening.credsChanged &&
      !s.hardening.httpServer,
    success:
      "The management plane just shrank to one hardened, encrypted door: SSHv2 only, 2048-bit key, no plain HTTP, no default credential. In the live config preview, 'transport input telnet' became 'transport input ssh' — the exact line an attacker would have used yesterday.",
    fail: "Apply these at the bench: transport input = SSH, SSH version = 2, key modulus ≥ 2048, HTTP server OFF, credentials changed. Then press APPLY.",
    hints: [
      "Every control on the bench maps to one flagged line from your M4 audit.",
      "Telnet dies when transport input = SSH (only). Strong key = 2048 or 4096.",
      "Set: SSH / v2 / 2048+ / creds changed / HTTP off → APPLY.",
    ],
  },
  {
    id: "M10",
    mode: "medium",
    pillar: "P4",
    tag: "VPN policy — full tunnel + MFA",
    title: "Apply the contractor VPN policy on the gateway: full tunnel for the CONTRACTOR persona with MFA enforced.",
    pointer: "VPN bay → persona CONTRACTOR → mode FULL → MFA ON.",
    validate: (s) => s.vpn.persona === "contractor" && s.vpn.mode === "full" && s.vpn.mfa,
    success:
      "Policy enforced: contractors enter only through a fully-tunneled, MFA-checked pipe. Full tunnel for third parties means zero unmonitored browsing from a trusted network position — and MFA makes a stolen password alone useless.",
    fail: "In the VPN bay, switch persona to CONTRACTOR, set the tunnel mode to FULL, and turn MFA on. Third parties don't get split tunnels.",
    hints: [
      "Which role must never browse the public internet from inside your address space?",
      "Contractor → FULL tunnel. MFA is the gateway toggle next to the persona selector.",
      "Persona CONTRACTOR + mode FULL + MFA ON.",
    ],
  },
  {
    id: "M11",
    mode: "medium",
    pillar: "P2",
    tag: "Method selection matrix",
    title: "Decision matrix: assign the best access method to all six operational tasks.",
    pointer: "Evidence drawer → MATRIX tab.",
    validate: (s) => MATRIX_TASKS.every((t) => s.matrix[t.id] === MATRIX_ANSWERS[t.id]),
    success:
      "Six for six — that's the exam's core skill: symptom → method. Dead network → console/OOB; fleet automation → API; one remote user → client-to-site VPN; visual spot-check → GUI; interactive CLI → SSH; two networks forever → site-to-site.",
    fail: "Re-read each task's constraint: what's broken (network?), what's the scale (one user vs 40 devices vs two sites), and what's the interaction style (visual vs CLI vs programmatic)?",
    hints: [
      "Match the constraint: reachability, scale, interaction style.",
      "T1 network dead → console; T2 forty devices nightly → API; T3 one user remote → client VPN; T4 dashboards → GUI; T5 interactive CLI → SSH; T6 two networks → site-to-site.",
      "Answers: console / api / vpn-client / gui / ssh / vpn-site.",
    ],
  },
  {
    id: "M12",
    mode: "medium",
    pillar: "P3",
    tag: "True vs false positives",
    title: "Judge the three raised alerts: true positive or false positive — with the reasoning that survives an audit.",
    pointer: "Evidence drawer → LOGS tab → ALERTS panel.",
    validate: (s) =>
      s.judge["A1"] === "tp" && s.judge["A2"] === "fp" && s.judge["A3"] === "fp",
    success:
      "Tuned like an analyst: A1 true (external + Telnet + privileged), A2 false (known monitoring host, expected behavior — tune it out), A3 false (NOC operator, key auth, business hours). Detection quality = catching A1 while ignoring A2/A3.",
    fail: "Judge each alert on its context: source (internal vs external?), protocol (encrypted vs Telnet?), identity (known service account vs unknown admin?), and pattern (bursts vs routine).",
    hints: [
      "True positive = real hostile signal. False positive = benign activity that tripped the rule.",
      "A1: external IP on Telnet — real. A2: the monitoring host does this every hour. A3: that's you, the NOC operator.",
      "A1 = TP, A2 = FP, A3 = FP.",
    ],
  },
];

// ── HARD ────────────────────────────────────────────────────────────────────
const HARD = [
  {
    id: "H1",
    mode: "hard",
    pillar: "P2",
    tag: "Incident triage across evidence",
    title: "Overnight compromise: name the exact management channel abused, the source IP, and the affected device. Two items in the evidence are noise.",
    pointer: "Read auth_access, the config audit, and api_audit together. Noise exists — prove your case with exact values.",
    validate: (s) =>
      s.answers["h1_channel"] === "telnet" &&
      txt(s, "h1_ip") === "198.51.100.77" &&
      txtLC(s, "h1_device") === "hq-core-sw01",
    success:
      "Case closed: TELNET from 198.51.100.77 into HQ-CORE-SW01. Telnet is plaintext — the 'admin' session at 10:02 wasn't just suspicious, it was readable on the wire, and the config audit shows what changed after. The monitoring-host failures and the approved 02:00 contractor session are noise.",
    fail:
      "Exact values required. Which protocol in auth_access.log cannot be trusted on the wire? Who used it, from where, against which device? Cross-check the config audit timestamps.",
    hints: [
      "One protocol in the log sends credentials in cleartext.",
      "198.51.100.77 → TCP/23 → which device IP is dst? The config audit names the same box.",
      "Channel TELNET, IP 198.51.100.77, device HQ-CORE-SW01.",
    ],
  },
  {
    id: "H2",
    mode: "hard",
    pillar: "P2",
    tag: "VPN log forensics",
    title: "VPN forensics: identify the session ID that violates contractor policy, its tunnel mode, and the protocol carrying the site-to-site tunnel.",
    pointer: "VPN session log (LOGS tab). One contractor session breaks the full-tunnel policy. One entry is an approved exception — don't flag it.",
    validate: (s) =>
      s.answers["h2_sid"] === "V-2203" &&
      s.answers["h2_tunnel"] === "split" &&
      s.answers["h2_proto"] === "ipsec",
    success:
      "V-2203 (a.moreau, contractor, SPLIT) is the violation — V-2206 is the approved change-window exception, and V-2204's HQ↔Yard 7 always-on tunnel rides IPsec. That split session gave a third party an unmonitored foothold on 10.20.0.0/16.",
    fail: "Compare every contractor row against policy (full tunnel). Then check which protocol the permanent HQ↔Yard 7 tunnel uses — the topology doc tells you.",
    hints: [
      "Contractors: t.jennings, a.moreau, x.valdez. Which one isn't 'full'?",
      "a.moreau's session is split — that's the violation. The site-to-site row says 'always-on' via IPsec (topology doc).",
      "Answers: V-2203 / split / ipsec.",
    ],
  },
  {
    id: "H3",
    mode: "hard",
    pillar: "P1",
    tag: "OOB recovery + reachability under failure",
    title: "Storm recovery: order the five recovery steps correctly AND tick every management path that still works from the NOC while the WAN is down.",
    pointer: "LOGS tab → STORM RECOVERY panel. Think about what each path depends on.",
    validate: (s) =>
      s.h3Order.join("|") === RECOVERY_ORDER.join("|") &&
      s.h3Reach.length === REACHABLE_DURING_STORM.length &&
      REACHABLE_DURING_STORM.every((x) => s.h3Reach.includes(x)),
    success:
      "Perfect recovery discipline: OOB path → S2 → console login → repair → verify in-band before closing. And your reachability map is right — HQ-side SSH/GUI/API still work (the LAN is fine), both console ports work, but NOTHING in-band reaches Yard 7. In-band dies with the network; OOB doesn't.",
    fail: "Two parts: (1) order the recovery steps — OOB route first, verify LAST; (2) tick only paths that genuinely work during the HQ↔Yard 7 outage. Yard 7's IP addresses are unreachable — console S2 reaches it physically.",
    hints: [
      "The sequence ends with verification, not repair. The console ports depend on the terminal server, not the WAN.",
      "Order: TERM-SRV01 → S2 → login → repair → verify. Reachable: HQ SSH/GUI/API + both console ports.",
      "Steps R1→R2→R3→R4→R5; ticks: SSH HQ-CORE-SW01, GUI HQ-FW01, API DC-GW01, console S1, console S2.",
    ],
  },
  {
    id: "H4",
    mode: "hard",
    pillar: "P4",
    tag: "Strict VTY hardening",
    title: "Bench: produce the fully hardened VTY/management config for HQ-CORE-SW01 — all seven controls, in order of risk.",
    pointer: "RACK BENCH. The auditor wants: SSH-only, v2, strong key, no HTTP, no default creds, mgmt ACL, exec-timeout.",
    validate: (s) =>
      s.hardening.applied &&
      s.hardening.transport === "ssh" &&
      s.hardening.sshVersion === "2" &&
      s.hardening.keySize >= 2048 &&
      s.hardening.credsChanged &&
      !s.hardening.httpServer &&
      s.hardening.mgmtAcl &&
      s.hardening.execTimeout,
    success:
      "All seven controls — that's a defensible management plane: single encrypted transport, modern crypto, least-privilege sources (ACL), session timeouts, no defaults. This is the exact checklist an auditor would hand back as 'pass'.",
    fail: "Seven controls, not five: transport SSH-only, SSHv2, ≥2048-bit key, HTTP server OFF, credentials changed, management ACL ON, exec-timeout ON. Apply, don't just toggle.",
    hints: [
      "Your M4/M8 findings map 1:1 to bench controls — plus two session-discipline items.",
      "The last two: access-class style source restriction, and idle-session timeout.",
      "All seven ON/correct + APPLY.",
    ],
  },
  {
    id: "H5",
    mode: "hard",
    pillar: "P3",
    tag: "Detection engineering",
    title: "Build the management-plane detection: correct source, condition, and action — then classify the two live events it catches.",
    pointer: "LOGS tab → DETECTION BUILDER. Then judge events A1 and A2 in the ALERTS panel.",
    validate: (s) =>
      s.detection.source === "mgmt-auth" &&
      s.detection.condition === "telnet-ssh" &&
      s.detection.action === "alert-block" &&
      s.judge["A1"] === "tp" &&
      s.judge["A2"] === "fp",
    success:
      "You just wrote the rule that would have caught 198.51.100.77 in minutes: management-auth log source, TCP/23-anywhere + SSH-failure-burst condition, SOC-alert-and-block action. And you tuned it: A1 true, A2 false (known monitoring host) — precision beats volume.",
    fail: "A detection needs the right SOURCE (where do management sessions appear?), a CONDITION that matches Telnet or brute force (not ambient traffic), and an ACTION a human acts on. Then judge A1/A2 with context.",
    hints: [
      "Telnet to TCP/23 and SSH failure bursts live in the management/auth log.",
      "The action must stop the session AND tell a human — logging alone caught nothing here.",
      "mgmt-auth + telnet-ssh + alert-block; A1 TP, A2 FP.",
    ],
  },
  {
    id: "H6",
    mode: "hard",
    pillar: "P4",
    tag: "Access policy per persona",
    title: "Access policy review: for all four personas pick the method AND the control package that a security auditor would sign off.",
    pointer: "LOGS tab → POLICY REVIEW panel.",
    validate: (s) =>
      H6_PERSONAS.every((p) => {
        const row = s.matrixH[p.id];
        return row && row.method === H6_ANSWERS[p.id].method && row.control === H6_ANSWERS[p.id].control;
      }),
    success:
      "Auditor-grade: contractors get the full-tunnel + MFA + expiry pipe; admins funnel through a jump box with keys and an ACL; vendors get scoped read-only tokens; physical recovery gets logged, escorted OOB. Method AND control — both matter, always.",
    fail:
      "Match method to constraint (remote user / interactive admin / programmatic vendor / dead network) and control to RISK (third party = full tunnel+MFA+expiry; admin = chokepoint; vendor = least privilege; physical = logged+escorted).",
    hints: [
      "One persona per access principle: encrypt, chokepoint, least-privilege, survive-failure.",
      "P1 contractor → VPN + full/MFA/expiry; P2 admin → SSH via jump box; P3 vendor → API read-only token; P4 recovery → console, logged & escorted.",
      "Full mapping in the FIELD NOTES → mitigation table.",
    ],
  },
  {
    id: "H7",
    mode: "hard",
    pillar: "P3",
    tag: "API audit analysis",
    title: "API abuse: identify the exact compromised token, the offending source IP, and the correct immediate fix.",
    pointer: "api_audit.json (LOGS tab). One token talks from two IPs. The README knows which tokens are 'normal'.",
    validate: (s) =>
      txt(s, "h7_token") === "tkn_noc_7c41a9e2d5b8" &&
      txt(s, "h7_ip") === "198.51.100.77" &&
      s.answers["h7_fix"] === "rotate",
    success:
      "The NOC token worked from 10.20.1.44 at 01:58 and from 198.51.100.77 at 02:03 — same credential, two hosts: that's theft, and it called /config/deploy. Fix: rotate/revoke now, audit what it deployed, restrict sources, vault the secret. A token IS a shell account without a shell.",
    fail:
      "Find the token with TWO different source IPs. One of those IPs you've seen before in auth_access.log. What's the instant remedy for a stolen bearer token?",
    hints: [
      "Compare the ip field across rows for each token value.",
      "tkn_noc_7c41a9e2d5b8 appears from 10.20.1.44 AND 198.51.100.77 — and it deployed config.",
      "Token tkn_noc_7c41a9e2d5b8, IP 198.51.100.77, fix = rotate/revoke immediately.",
    ],
  },
  {
    id: "H8",
    mode: "hard",
    pillar: "P2",
    tag: "SSH handshake analysis",
    title: "Legacy switch handshake: report the exact three weak facts from ssh_negotiation.log that prove SSHv1 and weak crypto are still enabled.",
    pointer: "LOGS tab → SSH NEGOTIATION panel. Banner 1.99 is a clue, not an answer by itself.",
    validate: (s) =>
      s.answers["h8_banner"] === "1.99" &&
      s.answers["h8_cipher"] === "3des-cbc" &&
      s.answers["h8_key"] === "1024",
    success:
      "SSH-1.99 (v1 compatibility still offered), 3des-cbc cipher, 1024-bit host key — three concrete, citable findings from one handshake. 'SSH-1.99' is the giveaway: a server that ONLY spoke v2 would banner SSH-2.0.",
    fail: "Quote the log exactly: what version does the server banner advertise, which cipher was negotiated, and how big is the host key?",
    hints: [
      "Three lines matter: server banner, cipher negotiated, host key size.",
      "1.99 = v1 tolerated. 3des-cbc is deprecated. 1024 < 2048.",
      "Answers: 1.99 / 3des-cbc / 1024.",
    ],
  },
  {
    id: "H9",
    mode: "hard",
    pillar: "P4",
    tag: "Split-tunnel governance",
    title: "Split-tunnel governance: for violating session V-2203, identify exactly what leaks OUTSIDE the tunnel, and the correct policy action.",
    pointer: "VPN bay — reproduce the ACL, watch the simulator, then decide the action.",
    validate: (s) =>
      s.answers["h9_leak"] === "yard-and-public" && s.answers["h9_action"] === "force-full",
    success:
      "V-2203's ACL covered only 10.20.0.0/16 — so BOTH the public internet AND 10.30.0.0/16 (Yard 7) exit outside the tunnel: unmonitored traffic from a trusted position. Action: force the contractor role to FULL tunnel gateway-side; widening ACLs just rearranges the leak.",
    fail:
      "Set persona contractor + split + ACL 'HQ only' in the VPN bay and simulate. What's NOT in the ACL list? And once you've seen it — do you fix this per-user, or per-role at the gateway?",
    hints: [
      "Leak = any destination the ACL doesn't cover. The ACL lists HQ only.",
      "Public internet AND the 10.30.0.0/16 Yard 7 subnet both bypass.",
      "Answers: yard-and-public leaks; action = force FULL tunnel for the role.",
    ],
  },
];

const OBJECTIVES = [...MEDIUM, ...HARD];

function objectivesFor(mode) {
  return OBJECTIVES.filter((o) => o.mode === mode);
}
