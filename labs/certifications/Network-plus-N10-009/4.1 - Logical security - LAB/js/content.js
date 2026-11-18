/* ======================================================================
   GATEHOUSE lab — Knowledge Core, Glossary, Quiz bank, Debrief content
   Ported 1:1 from src/lib/lab/content.ts (all wording verbatim).
   ====================================================================== */

const BRIEFING = {
  org: "Meridian Regional Medical Center",
  line: "A 640-bed teaching hospital running one identity fabric (MeridianID) across EHR, Wi-Fi, VPN, device administration and a SaaS HR portal.",
  hook: "This morning's audit handed you the evidence pile: cleartext directory binds, an expired portal certificate, a terminated contractor who still logs in, and three clinicians locked out at 14:05 because the clock drifted. Your shift: understand the logical-security chain, find what is broken, and harden it.",
  cert: "CompTIA Network+ (N10-009) — Objective 4.1 · Logical security: encryption in transit/at rest, PKI, IAM, MFA, SSO, RADIUS, LDAP, SAML, TACACS+, time-based authentication, authorization, least privilege, RBAC, geofencing.",
  safety:
    "Everything here is simulated training data. No real hospital, person, IP or credential exists; MITRE references link to the official public knowledge base.",
};

const GLOSSARY = [
  {
    term: "AAA",
    def: "Authentication (who are you?), Authorization (what may you do?), Accounting (what did you do?) — the framework most access protocols implement.",
  },
  {
    term: "Authentication & factors",
    def: "Proving identity with factors: something you know / have / are (plus somewhere you are). Two different categories = multi-factor.",
  },
  {
    term: "Authorization",
    def: "Deciding what an authenticated identity may access — rights, permissions, roles.",
  },
  {
    term: "Accounting",
    def: "Recording who did what, when — audit trails, session logs, command logs. Watch this lab's ledger strip: it is live accounting.",
  },
  {
    term: "Encryption in transit",
    def: "Protecting moving data: TLS/HTTPS, IPsec tunnels, LDAPS, SSH.",
  },
  {
    term: "Encryption at rest",
    def: "Protecting stored data: full-disk encryption, database/column encryption, file-level encryption.",
  },
  {
    term: "PKI & CA",
    def: "Public Key Infrastructure: CAs verify identities and sign certificates binding a public key to a hostname/subject. Renewal and revocation (CRL/OCSP) keep trust current.",
  },
  {
    term: "MFA",
    def: "Multi-factor authentication — at least two DIFFERENT factor categories. Password + security questions is NOT MFA (same category).",
  },
  {
    term: "TOTP & time-based auth",
    def: "Time-based One-Time Password: 6-digit codes rotating ~every 30 s. Requires synced clocks (NTP) — drift breaks it. Also covers time-of-day login windows.",
  },
  {
    term: "SSO & SAML",
    def: "Single sign-on via federation: the IdP authenticates the user and issues a signed XML assertion; the Service Provider consumes it and opens the session.",
  },
  {
    term: "LDAP & DN",
    def: "Lightweight Directory Access Protocol queries a directory tree. A Distinguished Name (CN=…,OU=…,DC=…) pins an object's place in that tree. 389 cleartext, 636 LDAPS.",
  },
  {
    term: "RADIUS",
    def: "AAA broker for network access (802.1X port/Wi-Fi authentication). UDP 1812/1813; encrypts only the password field.",
  },
  {
    term: "TACACS+",
    def: "AAA for device administration (Cisco heritage). TCP 49; encrypts the entire payload (simplified: shared-secret header excepted); separates AAA; can authorize every command.",
  },
  {
    term: "IAM, RBAC & least privilege",
    def: "Identity & Access Management governs the account lifecycle (joiner/mover/leaver). RBAC groups permissions into roles; least privilege grants only what the role truly needs.",
  },
  {
    term: "Geofencing",
    def: "Location-based access control — allow/deny by campus, metro, country or abroad. A context signal, not a wall: pair with MFA and review exceptions.",
  },
];

const KC_SECTIONS = [
  {
    title: "The logical-access chain (and why attackers care)",
    body: "Logical security follows one chain: identify → authenticate (prove identity with factors) → authorize (grant least-privilege rights) → account (record what happened). Attackers aim straight at it: they tamper with authentication processes, steal or forge access material, and abuse over-privileged roles. Every control in this lab guards one link of that chain — which is why missing one (an unfenced VPN group, a stale certificate, a drifted clock) is enough to open the hospital.",
    mitre: [
      {
        id: "T1556",
        label: "Modify Authentication Process",
        url: "https://attack.mitre.org/techniques/T1556/",
        note: "Adversaries modify authentication mechanisms to bypass access controls or harvest credentials.",
      },
    ],
  },
  {
    title: "Encryption: two states of data",
    body: "Data in transit is moving — between tablet and EHR, site and site — protected by TLS/HTTPS and IPsec tunnels. Data at rest is stored — disk volumes, database backups, USB exports — protected by full-disk, file or database-column encryption. A link can be encrypted while the storage behind it is not, so defenders classify every data flow by state before choosing a control. Encrypted transit with cleartext storage (or vice versa) is a classic audit finding.",
  },
  {
    title: "PKI: the badge office of trust",
    body: "A certificate authority verifies an identity and signs a certificate that binds a public key to a hostname (the SAN field). The lifecycle is generate key pair + CSR → CA validates → CA signs & issues → deploy → renew or revoke (CRL lists revoked certs; OCSP answers in real time). Expired certificates, wrong SANs and deprecated signatures (SHA-1) are outage-and-incident generators — and if an attacker ever gets the IdP's signing certificate, they can forge SAML tokens with any claim they like.",
    mitre: [
      {
        id: "T1606.002",
        label: "Forge Web Credentials: SAML Tokens",
        url: "https://attack.mitre.org/techniques/T1606/002/",
        note: "With a valid SAML token-signing certificate, adversaries forge tokens with any permissions claims and lifetimes.",
      },
    ],
  },
  {
    title: "AAA protocols: pick the right radio",
    body: "RADIUS brokers network access (802.1X on Wi-Fi/ports): UDP 1812/1813, encrypts only the password field. TACACS+ administers devices: TCP 49, encrypts the entire payload (shared-secret header excepted — simplified), separates AAA and can authorize every command. LDAP queries the directory: bind + search, 389 cleartext vs 636 LDAPS. SAML federates web SSO between IdP and SP via signed assertions. Mismatched use — device admin on RADIUS, lookups via TACACS+ — is a real, common misconfiguration.",
    extra: {
      heads: ["Protocol", "Role", "Port/Transport", "Encryption scope", "Typical use"],
      rows: [
        ["RADIUS", "AAA broker", "UDP 1812 / 1813", "Password field only", "802.1X Wi-Fi / port access"],
        ["TACACS+", "Device AAA", "TCP 49", "Entire payload*", "Switch/router CLI admin"],
        ["LDAP(S)", "Directory access", "389 / 636 (LDAPS)", "LDAPS: TLS-wrapped", "Identity lookups & binds"],
        ["SAML", "Web federation", "Browser redirects (HTTPS)", "Signed XML assertion", "SSO across apps/orgs"],
        ["TOTP", "Time-based factor", "— (app + server clocks)", "Code valid ~30 s", "Second factor for MFA"],
      ],
    },
  },
  {
    title: "Authorization: least privilege & RBAC",
    body: "Authentication proves; authorization permits. Least privilege grants each role exactly what it needs — no more — and RBAC makes that scale: permissions attach to roles, users attach to roles, and audits recertify the mapping quarterly. The risk is drift: over-granted cells, role creep, and joiner/mover/leaver gaps that leave ghost accounts active after termination. In Incident 2211, a billing clerk's EHR-write privilege turned a phished session into a 2,874-row export.",
    mitre: [
      {
        id: "G1045 Salt Typhoon",
        label: "AAA tampering in the wild",
        url: "https://attack.mitre.org/techniques/T1556/",
        note: "Salt Typhoon modified AAA configurations on network devices, forcing less secure authentication and exfil to their infrastructure (documented as a T1556 procedure example).",
      },
    ],
  },
  {
    title: "Context & time: fences, windows, clocks",
    body: "Modern access adds context: geofencing allows or denies by location (campus/metro/country/abroad), time windows restrict logins to shift hours, and TOTP codes live inside a ~30-second time window. All of it rests on synchronized clocks — NTP drift silently breaks TOTP and makes logs lie about event order. Context is a signal, not a wall: exceptions (traveling staff) need governance, and IP-based fences can be spoofed, so pair them with step-up MFA.",
  },
  {
    title: "Attacker view: MFA is a wall, not magic",
    body: "Push-bombing (MFA request generation) floods a user with approval prompts until one is accepted; stolen web sessions and forged assertions bypass login entirely. Defenses: number matching, per-login push context, geo-velocity detection, short sessions, and revocation on anomaly. MITRE catalogs all of it — read T1621 and T1550 before your next shift.",
    mitre: [
      {
        id: "T1621",
        label: "Multi-Factor Authentication Request Generation",
        url: "https://attack.mitre.org/techniques/T1621/",
        note: "Adversaries generate MFA requests to coerce users into approving fraudulent logins (push fatigue).",
      },
      {
        id: "T1550",
        label: "Use Alternate Authentication Material",
        url: "https://attack.mitre.org/techniques/T1550/",
        note: "Pass-the-hash, pass-the-ticket, application access tokens, web session cookies — access without the password.",
      },
    ],
  },
];

const MITRE_PROCEDURES = [
  {
    who: "Salt Typhoon (G1045)",
    what: "modified AAA configurations on network devices, forcing less secure authentication methods and sending data to attacker infrastructure",
    url: "https://attack.mitre.org/techniques/T1556/",
  },
  {
    who: "ArcaneDoor (C0046)",
    what: "modified the AAA process itself to bypass authentication mechanisms on perimeter devices",
    url: "https://attack.mitre.org/techniques/T1556/",
  },
  {
    who: "Ebury (S0377)",
    what: "intercepts private keys via a trojanized ssh-add — credential material stolen at the authentication layer",
    url: "https://attack.mitre.org/techniques/T1556/",
  },
];

/* ---- Quiz ---- */
const QUIZ_MEDIUM = [
  {
    id: "qm1",
    prompt: "Which of these is genuine multi-factor authentication?",
    options: [
      { id: "a", text: "Password plus a PIN typed each login" },
      { id: "b", text: "Password plus security questions" },
      { id: "c", text: "Password plus an authenticator code" },
      { id: "d", text: "A fingerprint plus a face scan" },
    ],
    correct: ["c"],
    multi: false,
    explain:
      "MFA needs two DIFFERENT factor categories. Password+PIN and password+security questions are both 'something you know'; fingerprint+face are both 'something you are'. Password (know) + an authenticator code from a token you hold (have) spans two categories.",
  },
  {
    id: "qm2",
    prompt: "You must give network engineers per-command authorization and accounting on core switches. Which protocol fits?",
    options: [
      { id: "a", text: "TACACS+ — AAA split on TCP 49" },
      { id: "b", text: "RADIUS — AAA broker on UDP 1812" },
      { id: "c", text: "LDAP — directory binds on 389/636" },
      { id: "d", text: "SAML — web assertions via the IdP" },
    ],
    correct: ["a"],
    multi: false,
    explain:
      "TACACS+ (TCP 49) encrypts the entire payload (simplified: shared-secret header excepted) and separates authentication, authorization and accounting — so each command can be authorized and logged. RADIUS encrypts only the password field and was built for network access (802.1X).",
  },
  {
    id: "qm3",
    prompt: "Which port/setting makes LDAP binds confidential?",
    options: [
      { id: "a", text: "389, StartTLS disabled" },
      { id: "b", text: "389 with tls=NONE" },
      { id: "c", text: "1812 over UDP" },
      { id: "d", text: "636 — LDAPS over TLS" },
    ],
    correct: ["d"],
    multi: false,
    explain:
      "Port 389 serves LDAP in cleartext; LDAPS wraps the directory session in TLS on port 636 (StartTLS on 389 is a related option — simplified here). 1812 is RADIUS, not LDAP.",
  },
  {
    id: "qm4",
    prompt: "In a SAML SSO flow, who issues the assertion?",
    options: [
      { id: "a", text: "The Service Provider (EHR portal app)" },
      { id: "b", text: "The Identity Provider (MeridianID)" },
      { id: "c", text: "The user's web browser session" },
      { id: "d", text: "The certificate authority (CA)" },
    ],
    correct: ["b"],
    multi: false,
    explain:
      "The IdP authenticates the user (password + MFA) and returns a signed SAML assertion to the SP, which validates it and opens the session. The CA is not part of the SAML flow — it anchors trust for the certificates behind the scenes.",
  },
  {
    id: "qm5",
    prompt: "Which of these is data at rest?",
    options: [
      { id: "a", text: "A database backup on the archive NAS" },
      { id: "b", text: "An HTTPS charting session in the EHR app" },
      { id: "c", text: "Traffic inside an IPsec site-to-site tunnel" },
      { id: "d", text: "ICU vitals streaming to a live dashboard" },
    ],
    correct: ["a"],
    multi: false,
    explain:
      "At rest = stored: backups, disks, exports. HTTPS sessions, tunnel traffic and telemetry streams are all data in transit — each state needs its own protection.",
  },
  {
    id: "qm6",
    prompt: "A certificate must be checked for revocation in real time. Which mechanism?",
    options: [
      { id: "a", text: "NTP — the time-sync protocol" },
      { id: "b", text: "DNS — the name-resolution service" },
      { id: "c", text: "OCSP — real-time status checks" },
      { id: "d", text: "RADIUS — network access AAA" },
    ],
    correct: ["c"],
    multi: false,
    explain:
      "OCSP answers 'is this certificate still valid?' in real time; CRLs are signed lists published on a schedule. NTP syncs clocks, RADIUS does AAA, DNS resolves names.",
  },
];

const QUIZ_HARD = [
  {
    id: "qh1",
    prompt: "An attacker with the IdP's token-signing certificate mints a SAML token claiming any identity. Which MITRE technique covers this?",
    options: [
      { id: "a", text: "T1621 — MFA Request Generation" },
      { id: "b", text: "T1606.002 — SAML credential forging" },
      { id: "c", text: "T1556.006 — Modify Authentication (MFA)" },
      { id: "d", text: "T1111 — MFA Authentication Interception" },
    ],
    correct: ["b"],
    multi: false,
    explain:
      "T1606.002 is forging credential material — with the signing certificate, adversaries forge SAML tokens with any claims and lifetimes, bypassing MFA entirely. Detection: sign-ins at the SP with no matching authentication event at the IdP.",
  },
  {
    id: "qh2",
    prompt: "Users keep approving MFA pushes they did not start. Which fix most directly defuses push fatigue?",
    options: [
      { id: "a", text: "Number matching on every push" },
      { id: "b", text: "Disable MFA for the affected group" },
      { id: "c", text: "Longer sessions with more idle time" },
      { id: "d", text: "More SSO applications per user" },
    ],
    correct: ["a"],
    multi: false,
    explain:
      "MITRE's guidance for T1621: train users to accept only requests they initiated and verify the source location; number matching makes blind approvals impossible. Disabling MFA removes the control entirely.",
  },
  {
    id: "qh3",
    prompt: "Three clinicians' TOTP codes are rejected everywhere; ntp.log shows the IdP drifting +4.7 s against a dead pool source. Root cause?",
    options: [
      { id: "a", text: "Password policy lockout thresholds" },
      { id: "b", text: "Expired RADIUS server certificate" },
      { id: "c", text: "LDAP bind failures on 389" },
      { id: "d", text: "Clock drift breaking TOTP windows" },
    ],
    correct: ["d"],
    multi: false,
    explain:
      "Time-based authentication depends on synchronized clocks. When the NTP source dies and the server drifts seconds away, every code is 'expired' or 'not yet valid'. Fix the time source first — never widen the window to 24 h.",
  },
  {
    id: "qh4",
    prompt: "Device administration currently runs on RADIUS with no per-command accounting. What is the concrete operational risk?",
    options: [
      { id: "a", text: "RADIUS cannot encrypt anything" },
      { id: "b", text: "TACACS+ cannot authenticate admins" },
      { id: "c", text: "No per-command authz / accounting" },
      { id: "d", text: "RADIUS uses TCP port 49" },
    ],
    correct: ["c"],
    multi: false,
    explain:
      "RADIUS was built for network access: it can authenticate a session but does not provide TACACS+-style per-command authorization and command accounting. Device changes become unattributable — exactly the gap Salt Typhoon exploited when tampering with AAA configs (T1556).",
  },
  {
    id: "qh5",
    prompt: "A geofence keeps locking out conference-traveling physicians. Best balanced fix?",
    options: [
      { id: "a", text: "Exception group with step-up MFA" },
      { id: "b", text: "Disable geofencing for everyone" },
      { id: "c", text: "Allow-list every country they visit" },
      { id: "d", text: "Shared travel account without MFA" },
    ],
    correct: ["a"],
    multi: false,
    explain:
      "Context controls fail without governance: an audited exception group keeps the fence for everyone else while verified travelers get access — with step-up MFA because the fence is weaker there. Shared accounts destroy attribution.",
  },
  {
    id: "qh6",
    prompt: "Billing clerks only verify demographics and post payments. Which RBAC row is least-privilege correct?",
    options: [
      { id: "a", text: "EHR read + EHR write" },
      { id: "b", text: "HR portal + device SSH admin" },
      { id: "c", text: "Full EHR read/write + billing + HR" },
      { id: "d", text: "EHR read + billing system" },
    ],
    correct: ["d"],
    multi: false,
    explain:
      "Least privilege: exactly what the role needs. In Incident 2211 the extra 'EHR write' cell is what turned a phished session into a 2,874-row export — every unnecessary grant is attacker storage.",
  },
  {
    id: "qh7",
    prompt: "Which control best reduces the 'IdP outage blocks every app' residual risk of SSO?",
    options: [
      { id: "a", text: "Disabling MFA at the IdP" },
      { id: "b", text: "Resilient IdP + break-glass logins" },
      { id: "c", text: "Longer sessions so outages matter less" },
      { id: "d", text: "Adding more federated apps" },
    ],
    correct: ["b"],
    multi: false,
    explain:
      "SSO concentrates risk at the IdP. You pay it down with IdP resilience and tested break-glass procedures — never by removing factors or extending sessions, which widen other attack paths (T1550.004 web session abuse).",
  },
];

/* ---- R8: performance-derived focus-area mapping (quiz item → study pointer) ---- */
const QUIZ_FOCUS = {
  qm1: "MFA factor categories — revisit the Gatehouse station and Knowledge Core §6 (attacker view of MFA).",
  qm2: "RADIUS vs TACACS+ roles — revisit the Radio Room and Knowledge Core §4 (AAA protocols table).",
  qm3: "LDAP 389 vs 636 (LDAPS) — revisit the Directory Hall and Knowledge Core §4.",
  qm4: "SAML IdP/SP roles — revisit the Federation Bridge sequencer and Knowledge Core §3.",
  qm5: "Data states: transit vs rest — revisit the Vault classification board and Knowledge Core §2.",
  qm6: "PKI revocation: CRL vs OCSP — revisit the Badge Office lifecycle and Knowledge Core §3.",
  qh1: "Golden-SAML risk (T1606.002) — revisit the Federation Bridge trade-off card and Knowledge Core §3.",
  qh2: "Push fatigue defense (T1621) — revisit the Gatehouse note and Knowledge Core §7.",
  qh3: "TOTP windows & NTP drift — revisit the Clock & Fence Post diagnosis and Knowledge Core §6.",
  qh4: "Device-admin AAA gaps — revisit the Radio Room mapping table and Knowledge Core §4.",
  qh5: "Geofence exception governance — revisit the Clock & Fence Post trade-off card and Knowledge Core §6.",
  qh6: "Least-privilege RBAC rows — revisit the Role Office matrix and Knowledge Core §5.",
  qh7: "SSO concentration risk — revisit the Federation Bridge trade-off card and Knowledge Core §3.",
};

/* ---- Debrief ---- */
const DETECTION_ROWS = [
  {
    source: "RADIUS / VPN auth logs",
    look: "geo anomalies, retry bursts, group policy bypasses",
    logic: "band → AUTH-OK where loc ∉ allowed-zones(group) → page",
  },
  {
    source: "IdP push logs",
    look: "push floods without approvals (T1621), approvals from new ASNs",
    logic: "count(PUSH-REQ user, 5 min) ≥ 5 AND approvals = 0 → alert",
  },
  {
    source: "IdP ↔ SP correlation",
    look: "assertions consumed with no matching IdP authentication (forged SAML, T1606.002)",
    logic: "SP session events LEFT-JOIN IdP auth events → unmatched → alert",
  },
  {
    source: "TACACS+ accounting",
    look: "config-mode commands off-hours or by new users",
    logic: "cmd ∈ conf-t AND (hour < 08 OR hour > 18) → alert",
  },
  {
    source: "LDAP bind logs",
    look: "tls=NONE binds on 389 from service accounts",
    logic: "bind where port=389 AND tls=NONE → alert + ticket",
  },
  {
    source: "NTP offset metrics",
    look: "drift beyond ±100 ms on auth servers",
    logic: "offset > 100 ms for 10 min → alert (TOTP at risk)",
  },
  {
    source: "Cert registry + IAM lifecycle",
    look: "expiring/expired certificates; active accounts for leavers",
    logic: "notAfter - now < 30 d → ticket; HR status=terminated AND account active → page",
  },
];

const MITIGATION_RECS = [
  {
    id: "M1032",
    name: "Multi-factor Authentication",
    url: "https://attack.mitre.org/mitigations/M1032/",
    rec: "Require 2 distinct factor categories on VPN + step-up MFA for exports; number matching on pushes.",
  },
  {
    id: "M1018",
    name: "User Account Management",
    url: "https://attack.mitre.org/mitigations/M1018/",
    rec: "Joiner/mover/leaver process: disable accounts at termination, recertify roles quarterly.",
  },
  {
    id: "M1026",
    name: "Privileged Account Management",
    url: "https://attack.mitre.org/mitigations/M1026/",
    rec: "TACACS+ with per-command authorization/accounting for device admin; named accounts + break-glass.",
  },
  {
    id: "M1041",
    name: "Encrypt Sensitive Information",
    url: "https://attack.mitre.org/mitigations/M1041/",
    rec: "LDAPS 636 everywhere, TLS/IPsec in transit, full-disk + column encryption at rest.",
  },
  {
    id: "D3-MFA",
    name: "D3FEND: Multi-factor Authentication",
    url: "https://d3fend.mitre.org/technique/d3f:Multi-factorAuthentication/",
    rec: "Countermeasure cross-reference from MITRE D3FEND.",
  },
];

const BLUE_TAKEAWAYS = [
  "Classify data by state first — transit and rest need different controls, and a gap in one state undoes the other.",
  "Time is a control: monitor NTP offset on every server that validates TOTP or certificates.",
  "Correlate IdP↔SP events: a session with no matching authentication is the fingerprint of forged/stolen access material.",
  "RBAC drift is silent — recertify quarterly and treat joiner/mover/leaver as security events, not HR paperwork.",
  "Context rules (geofence, shift windows) need governance: exception lists are privileged groups.",
];

const RED_TAKEAWAYS = [
  "The identity layer is the target: tamper with AAA configs (T1556) and you own every device behind it.",
  "One approved push beats a thousand password guesses (T1621) — human attention is the exploit surface.",
  "Federations concentrate power: whoever controls the IdP signing key mints any identity (T1606.002).",
  "Over-privileged roles are pre-staged exfiltration — attacker work done in advance by the org itself.",
];

const LINKS = [
  { label: "CompTIA Network+ N10-009", url: "https://www.comptia.org/certifications/network" },
  { label: "MITRE ATT&CK T1556 — Modify Authentication Process", url: "https://attack.mitre.org/techniques/T1556/" },
  { label: "MITRE ATT&CK T1621 — MFA Request Generation", url: "https://attack.mitre.org/techniques/T1621/" },
  { label: "MITRE ATT&CK T1606.002 — Forge Web Credentials: SAML Tokens", url: "https://attack.mitre.org/techniques/T1606/002/" },
  { label: "MITRE D3FEND D3-MFA", url: "https://d3fend.mitre.org/technique/d3f:Multi-factorAuthentication/" },
];

const NEXT_STEPS = [
  "N10-009 Objective 4.2 — common networking attacks (DoS/DDoS, on-path, spoofing) and their indicators.",
  "N10-009 Objective 4.3 — applying security features: hardening techniques, segmentation, deception tech.",
  "Deeper identity work lives in CompTIA Security+ (SY0-701) — IAM, cryptography and PKI in far more depth.",
  "MITRE ATT&CK: read T1556 (and its 9 sub-techniques), T1621 and T1606.002 in full; browse D3FEND for countermeasures.",
];
