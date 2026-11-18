/* ======================================================================
   GATEHOUSE lab — lab content + ANSWER KEYS
   Ported 1:1 from the framework lab's src/lib/lab/data.ts (content verbatim).
   NOTE: every answer key below is synthetic training data for the fictional
   Meridian Regional Medical Center scenario.
   ====================================================================== */

/* ---- Station meta ---- */
const STATIONS = [
  {
    id: "vault",
    no: "01",
    name: "The Vault",
    tag: "Encryption — transit vs rest",
    mission:
      "Patient data crosses WAN links, sits on backup shelves and rides in tablets. Sort each item into its data state, then pick the protection that fits each flow.",
  },
  {
    id: "badge",
    no: "02",
    name: "The Badge Office",
    tag: "PKI & digital certificates",
    mission:
      "Every badge in this hospital is a digital certificate. Learn who signs them, how they live, and inspect two real ones for defects.",
  },
  {
    id: "federation",
    no: "03",
    name: "The Federation Bridge",
    tag: "SSO & SAML",
    mission:
      "MeridianID issues one identity that opens many doors. Order the SAML handshake, label the actors, and weigh what SSO gives and takes.",
  },
  {
    id: "directory",
    no: "04",
    name: "The Directory Hall",
    tag: "LDAP & distinguished names",
    mission:
      "The LDAP directory is the hospital's phone book. Build a distinguished name by hand and choose the port that keeps binds confidential.",
  },
  {
    id: "radio",
    no: "05",
    name: "The Radio Room",
    tag: "AAA — RADIUS · TACACS+ · LDAP",
    mission:
      "Three radios, three jobs. Match each access scenario to its AAA protocol and nail the port and encryption facts cold.",
  },
  {
    id: "gate",
    no: "06",
    name: "The Gatehouse",
    tag: "MFA & authentication factors",
    mission:
      "Assemble a login chain strong enough for remote VPN access — then explain why the hospital's old 'two questions' trick never was MFA.",
  },
  {
    id: "roles",
    no: "07",
    name: "The Role Office",
    tag: "Authorization · RBAC · least privilege",
    mission:
      "Authentication says who you are; authorization says what you may touch. The registry import left the RBAC matrix blank except four over-grants — rebuild it to least privilege and work the joiner/mover/leaver desk.",
  },
  {
    id: "clock",
    no: "08",
    name: "Clock & Fence Post",
    tag: "Time-based auth & geofencing",
    mission:
      "Context is a control: shift windows, location fences and a clock that must not drift — or TOTP codes stop working.",
  },
  {
    id: "audit",
    no: "09",
    name: "The Audit Desk",
    tag: "Evidence review · TP/FP · detection",
    mission:
      "Tonight's evidence pile hides six real misconfigurations and two benign events. Raise the right flags, judge true from false, and (hard mode) build detections.",
  },
  {
    id: "harden",
    no: "10",
    name: "The Hardening Board",
    tag: "Mitigation planning & sequencing",
    mission:
      "Findings become fixes. Match controls to gaps, sequence the runbook so dependencies hold, and brief the CISO with a defense-in-depth map.",
  },
];

/* ---- Vault ---- */
const VAULT_ITEMS = [
  { id: "v1", label: "HTTPS session while a nurse charts in the EHR web app", b: "transit" },
  { id: "v2", label: "Nightly EHR database backup sitting on the archive NAS shelf", b: "rest" },
  { id: "v3", label: "Radiology images replicated over the WAN to the DR site", b: "transit" },
  { id: "v4", label: "Workstation full-disk volumes on 640 clinical laptops", b: "rest" },
  { id: "v5", label: "Payroll batch flowing through the site-to-site VPN to the bank", b: "transit" },
  { id: "v6", label: "HR personnel database files on the file server", b: "rest" },
  { id: "v7", label: "Physician's USB drive holding exported lab reports", b: "rest" },
  { id: "v8", label: "Real-time vitals telemetry from ICU monitors to the dashboard", b: "transit" },
];
const VAULT_FLOWS = [
  { id: "pf1", label: "Clinical tablets ↔ EHR over hospital Wi-Fi", correct: "tls" },
  { id: "pf2", label: "Site-to-site WAN link to the partner clinic", correct: "ipsec" },
  { id: "pf3", label: "Stolen-laptop risk — device storage", correct: "fde" },
  { id: "pf4", label: "Cardiac registry table with SSNs inside the database", correct: "dbcol" },
];
const PROT_OPTIONS = [
  { id: "tls", label: "TLS / HTTPS (session encryption)" },
  { id: "ipsec", label: "IPsec VPN (site-to-site tunnel)" },
  { id: "fde", label: "Full-disk encryption" },
  { id: "dbcol", label: "Database column encryption" },
];

/* ---- Badge Office (PKI) ---- */
const PKI_TERM_DEFS = {
  d1: "Trusted office that verifies identity and signs certificates with its own key",
  d2: "Signed request sent to the CA containing your public key and identity details",
  d3: "Matching pair — one kept private, one published inside the certificate",
  d4: "Signed list of revoked certificates the CA publishes on a schedule",
  d5: "Real-time protocol apps use to ask 'is THIS certificate still valid?'",
  d6: "Certificate field listing exactly which hostnames the certificate covers",
};
const PKI_TERMS = [
  { id: "t-ca", label: "Certificate Authority (CA)", correct: "d1" },
  { id: "t-csr", label: "CSR — Certificate Signing Request", correct: "d2" },
  { id: "t-kp", label: "Public / private key pair", correct: "d3" },
  { id: "t-crl", label: "CRL — Certificate Revocation List", correct: "d4" },
  { id: "t-ocsp", label: "OCSP — Online Certificate Status Protocol", correct: "d5" },
  { id: "t-san", label: "SAN — Subject Alternative Name", correct: "d6" },
];
const PKI_LIFECYCLE = [
  { id: "l1", label: "Generate key pair + build the CSR" },
  { id: "l2", label: "CA validates the requester's identity" },
  { id: "l3", label: "CA signs and issues the certificate" },
  { id: "l4", label: "Deploy and bind the certificate to the service" },
  { id: "l5", label: "Maintain: renew, or revoke via CRL / OCSP" },
];
const H4_DEFS = [
  { id: "d-exp", label: "notAfter = 2025-08-30 — already expired (today is 2025-11-04)", correct: true },
  { id: "d-san", label: "SAN covers only portal-old.meridianregional.org — hostname mismatch", correct: true },
  { id: "d-sha1", label: "sigAlg = sha1WithRSAEncryption — deprecated, collision-prone", correct: true },
  { id: "d-self", label: "The certificate is self-signed", correct: false },
  { id: "d-intca", label: "The issuer is an internal CA (Meridian-Issuing-CA-01)", correct: false },
  { id: "d-key", label: "Uses an RSA 2048-bit key", correct: false },
  { id: "d-valid", label: "Has a two-year validity window", correct: false },
];

/* ---- Federation Bridge (SSO/SAML) ---- */
const SAML_STEPS = [
  { id: "s1", label: "User opens the EHR app (Service Provider)" },
  { id: "s2", label: "SP redirects the user to the IdP to authenticate" },
  { id: "s3", label: "IdP authenticates the user (password + MFA)" },
  { id: "s4", label: "IdP returns a signed SAML assertion to the SP" },
  { id: "s5", label: "SP validates the assertion and opens the session" },
];
const SSO_POOL = [
  { id: "b1", text: "One credential set unlocks many applications", kind: "ben" },
  { id: "b2", text: "Fewer passwords to forget — less helpdesk reset load", kind: "ben" },
  { id: "b3", text: "Offboarding once at the IdP cuts access everywhere", kind: "ben" },
  { id: "r1", text: "IdP outage now blocks every federated app at once", kind: "risk" },
  { id: "r2", text: "One phished password unlocks many applications", kind: "risk" },
  { id: "o1", text: "Removes the need for TLS", kind: "other" },
  { id: "o2", text: "Eliminates authorization checks", kind: "other" },
  { id: "o3", text: "Makes MFA impossible", kind: "other" },
];
const SSO_BEN = ["b1", "b2"];
const SSO_RISK = ["r1", "r2"];

/* ---- Directory Hall (LDAP) ---- */
const DN_CHIPS = [
  { id: "cn", label: "CN=d.chen" },
  { id: "ou", label: "OU=Clinical" },
  { id: "dc1", label: "DC=meridianregional" },
  { id: "dc2", label: "DC=org" },
];
const DN_ORDER = ["cn", "ou", "dc1", "dc2"];
const LDAP_TREE = `DC=meridianregional,DC=org
├── OU=Clinical
│   ├── CN=d.chen        (physician, ward 3F)
│   ├── CN=anaya.k       (nurse, nights)
│   └── CN=r.okafor      (nurse, nights)
├── OU=Admin
│   └── CN=billing1      (billing clerk)
├── OU=Devices
│   └── CN=core-sw1      (switch)
└── OU=ServiceAccts
    ├── CN=billing-app
    └── CN=ehrweb`;
const LDAP_PORT_OPTIONS = [
  { id: "389", label: "389 — cleartext bind" },
  { id: "389st", label: "389 + StartTLS" },
  { id: "636", label: "636 — LDAPS (LDAP over TLS)" },
  { id: "1812", label: "1812 — that is RADIUS, not LDAP" },
];

/* ---- Radio Room (AAA) ---- */
const RADIO_SCENARIOS = [
  {
    id: "sc1",
    text: "Clinical tablets must authenticate to hospital Wi-Fi via 802.1X before any VLAN is assigned.",
    proto: "radius",
    reason: "rr1",
  },
  {
    id: "sc2",
    text: "Network engineers administer core switches; every configuration command must be authorized and logged individually.",
    proto: "tacacs",
    reason: "rr2",
  },
  {
    id: "sc3",
    text: "The HR portal looks up a user's department and manager from the identity store before granting app roles.",
    proto: "ldap",
    reason: "rr3",
  },
];
const RADIO_PROTO_OPTIONS = [
  { id: "radius", label: "RADIUS" },
  { id: "tacacs", label: "TACACS+" },
  { id: "ldap", label: "LDAP" },
  { id: "saml", label: "SAML" },
];
const RADIO_REASON_OPTIONS = [
  { id: "rr1", label: "802.1X network access — RADIUS is the standard AAA broker for ports/Wi-Fi joining" },
  { id: "rr2", label: "Device administration — TACACS+ separates AAA, encrypts the full payload, allows per-command authz" },
  { id: "rr3", label: "Directory lookups — LDAP binds and searches the directory tree for identity attributes" },
  { id: "rr4", label: "Federation — SAML assertions are issued between organizations for web SSO" },
  { id: "rr5", label: "Time sync — NTP keeps clocks aligned for certificate and TOTP validity" },
];
const RADIO_FACTS = [
  {
    id: "rf1",
    q: "RADIUS default authentication port & transport",
    options: [
      { id: "f-udp1812", label: "UDP 1812 (accounting 1813)" },
      { id: "f-tcp49", label: "TCP 49" },
      { id: "f-tcp389", label: "TCP 389" },
      { id: "f-udp636", label: "UDP 636" },
    ],
    correct: "f-udp1812",
  },
  {
    id: "rf2",
    q: "RADIUS encrypts…",
    options: [
      { id: "f-onlypw", label: "only the password field" },
      { id: "f-full", label: "the entire payload" },
      { id: "f-none", label: "nothing at all" },
    ],
    correct: "f-onlypw",
  },
  {
    id: "rf3",
    q: "TACACS+ port & transport",
    options: [
      { id: "f-tcp49b", label: "TCP 49" },
      { id: "f-udp1812b", label: "UDP 1812" },
      { id: "f-tcp636", label: "TCP 636" },
      { id: "f-udp389", label: "UDP 389" },
    ],
    correct: "f-tcp49b",
  },
  {
    id: "rf4",
    q: "TACACS+ encrypts… (simplified: header shared-secret excepted)",
    options: [
      { id: "f-fullb", label: "the entire payload" },
      { id: "f-onlypwb", label: "only the password field" },
      { id: "f-noneb", label: "nothing at all" },
    ],
    correct: "f-fullb",
  },
];
/* Hard H5 mapping rows */
const H5_ROWS = [
  { id: "h5r1", prompt: "Wi-Fi tablets joining via 802.1X", proto: "p-radius", fact: "f-udp1812pw" },
  { id: "h5r2", prompt: "Per-command authorization on core switches", proto: "p-tacacs", fact: "f-tcp49full" },
  { id: "h5r3", prompt: "Directory binds & attribute lookups", proto: "p-ldap", fact: "f-389or636" },
  { id: "h5r4", prompt: "Cross-organization web SSO", proto: "p-saml", fact: "f-assertion" },
  { id: "h5r5", prompt: "Rotating 6-digit login codes", proto: "p-totp", fact: "f-30s" },
  { id: "h5r6", prompt: "Badge reader fingerprint lane", proto: "p-bio", fact: "f-youare" },
];
const H5_PROTO_OPTIONS = [
  { id: "p-radius", label: "RADIUS" },
  { id: "p-tacacs", label: "TACACS+" },
  { id: "p-ldap", label: "LDAP / LDAPS" },
  { id: "p-saml", label: "SAML" },
  { id: "p-totp", label: "TOTP" },
  { id: "p-bio", label: "Biometric factor" },
];
const H5_FACT_OPTIONS = [
  { id: "f-udp1812pw", label: "UDP 1812/1813 · encrypts only the password field" },
  { id: "f-tcp49full", label: "TCP 49 · encrypts the entire payload (per-command authz)" },
  { id: "f-389or636", label: "389 cleartext / 636 LDAPS · bind + search operations" },
  { id: "f-assertion", label: "IdP issues a signed XML assertion consumed by the SP" },
  { id: "f-30s", label: "30-second code window · requires NTP-synced clocks" },
  { id: "f-youare", label: "'Something you are' — inherent authentication factor" },
  { id: "f-wrong1", label: "UDP 53 · encrypts the entire payload" },
  { id: "f-wrong2", label: "TCP 25 · issues signed assertions" },
];

/* ---- Gatehouse (MFA) ---- */
const MFA_FACTORS = [
  { id: "m-pw", label: "Password", cat: "know" },
  { id: "m-pin", label: "PIN", cat: "know" },
  { id: "m-sq", label: "Security questions", cat: "know" },
  { id: "m-totp", label: "TOTP authenticator code", cat: "have" },
  { id: "m-push", label: "Push approval on enrolled phone", cat: "have" },
  { id: "m-fido", label: "Hardware security key", cat: "have" },
  { id: "m-badge", label: "Smart badge", cat: "have" },
  { id: "m-finger", label: "Fingerprint", cat: "are" },
  { id: "m-face", label: "Face scan", cat: "are" },
];
const MFA_REFLECT = {
  q: "The legacy helpdesk login asks for a password plus two security questions. Is that MFA?",
  options: [
    { id: "no", label: "No — it is not MFA" },
    { id: "yes", label: "Yes — two extra answers count" },
  ],
  correct: "no",
  whyQ: "Why not?",
  whyOptions: [
    { id: "w1", label: "Both are 'something you know' — MFA needs different factor categories" },
    { id: "w2", label: "Two answers are always two factors" },
    { id: "w3", label: "Only biometrics can be a second factor" },
  ],
  whyCorrect: "w1",
};

/* ---- Role Office (RBAC) ---- */
const RBAC_ROLES = ["nurse", "physician", "labtech", "billing", "itadmin", "contractor"];
const RBAC_PERMS = [
  { id: "ehr_read", label: "EHR read" },
  { id: "ehr_write", label: "EHR write" },
  { id: "lab_view", label: "Lab results view" },
  { id: "billing_sys", label: "Billing system" },
  { id: "hr_portal", label: "HR portal" },
  { id: "device_ssh", label: "Device SSH admin" },
  { id: "badge_issue", label: "Badge issuing" },
  { id: "guest_wifi_mgmt", label: "Guest Wi-Fi mgmt" },
];
const RBAC_ROLE_LABELS = {
  nurse: "Nurse",
  physician: "Physician",
  labtech: "Lab tech",
  billing: "Billing clerk",
  itadmin: "IT admin",
  contractor: "Contractor",
};
const RBAC_TRUTH = {
  "nurse:ehr_read": true,
  "nurse:ehr_write": true,
  "nurse:lab_view": true,
  "physician:ehr_read": true,
  "physician:ehr_write": true,
  "physician:lab_view": true,
  "labtech:lab_view": true,
  "labtech:ehr_read": true,
  "billing:billing_sys": true,
  "billing:ehr_read": true,
  "itadmin:device_ssh": true,
  "itadmin:badge_issue": true,
  "itadmin:guest_wifi_mgmt": true,
};
const RBAC_PLANTED_OVERGRANTS = [
  "billing:ehr_write",
  "contractor:hr_portal",
  "nurse:device_ssh",
  "itadmin:ehr_read",
];
const LIFE_CASES = [
  { id: "j1", text: "JOINER — new lab tech starts Monday", correct: "a1" },
  { id: "j2", text: "MOVER — night nurse transfers to the IT helpdesk", correct: "a2" },
  { id: "j3", text: "LEAVER — contractor j.marek terminated 2025-10-18", correct: "a3" },
];
const LIFE_OPTIONS = [
  { id: "a1", label: "Provision the account with the Lab-tech role" },
  { id: "a2", label: "Re-assign role: remove clinical grants, grant IT role" },
  { id: "a3", label: "Disable account, revoke badge & certificates, return assets" },
  { id: "a4", label: "Copy permissions from a peer user (fast onboarding)" },
];

/* ---- Clock & Fence Post ---- */
const WINDOW_ROLES = [
  { id: "nights", label: "Nursing night shift", start: "19:00", end: "07:00", days: "everyday" },
  { id: "billing", label: "Billing office", start: "08:00", end: "18:00", days: "monfri" },
  { id: "contractor", label: "Contractor access", start: "08:00", end: "17:00", days: "monfri" },
];
const TIME_OPTIONS = [
  "00:00", "02:00", "04:00", "06:00", "07:00", "08:00", "09:00", "10:00",
  "12:00", "14:00", "17:00", "18:00", "19:00", "21:00", "23:00",
];
const FENCE_PERSONAS = [
  { id: "staff", label: "General staff" },
  { id: "travel_phys", label: "Traveling physician" },
  { id: "contractor", label: "Contractor" },
];
const FENCE_ZONES = [
  { id: "campus", label: "Campus" },
  { id: "metro", label: "Metro area" },
  { id: "country", label: "In-country" },
  { id: "abroad", label: "Abroad" },
];
const FENCE_TRUTH = {
  "staff:campus": true,
  "staff:metro": true,
  "staff:country": false,
  "staff:abroad": false,
  "travel_phys:campus": true,
  "travel_phys:metro": true,
  "travel_phys:country": true,
  "travel_phys:abroad": false,
  "contractor:campus": true,
  "contractor:metro": false,
  "contractor:country": false,
  "contractor:abroad": false,
};
const FENCE_EVENTS = [
  {
    id: "fe1",
    text: "Night nurse authenticates from a metro coffee shop at 03:00",
    ans: "allow",
    why: "Metro is an allowed zone for staff; the 03:00 login matches the night shift window.",
  },
  {
    id: "fe2",
    text: "Contractor opens the VPN from abroad",
    ans: "deny",
    why: "Contractor fence allows campus only — abroad is denied.",
  },
  {
    id: "fe3",
    text: "Traveling physician opens the EHR from an in-country conference",
    ans: "allow",
    why: "The traveling-physician exception allows in-country while on assignment (audit the exception list!).",
  },
  {
    id: "fe4",
    text: "General staff account signs in from a resort abroad",
    ans: "deny",
    why: "Staff fences allow campus + metro; abroad is outside policy.",
  },
];
const NTP_CAUSE_OPTIONS = [
  { id: "c1", label: "NTP source unreachable → local fallback → clock drift breaks TOTP time windows" },
  { id: "c2", label: "The RADIUS server is down" },
  { id: "c3", label: "The IdP certificate expired" },
  { id: "c4", label: "Password policy lockouts" },
];
const NTP_FIX_OPTIONS = [
  { id: "f1", label: "Re-sync to internal NTP + alert when |offset| > 100 ms" },
  { id: "f2", label: "Widen the TOTP window to 24 hours" },
  { id: "f3", label: "Disable TOTP for clinicians" },
  { id: "f4", label: "Restart the VPN gateway" },
];

/* ---- Audit Desk ---- */
const AUDIT_FLAGS = [
  {
    id: "f1",
    short: "LDAP binds travel in cleartext on port 389",
    real: true,
    why: "ldap.log shows tls=NONE binds from billing-app — identity data unencrypted in transit. Enforce LDAPS 636.",
    tab: "ldap.log",
  },
  {
    id: "f2",
    short: "VPN: MFA OFF and no geofence for the contractor group",
    real: true,
    why: "vpn-policy.cfg: contractors bypass two controls at once — this is how j.marek logged in from abroad.",
    tab: "vpn-policy.cfg",
  },
  {
    id: "f3",
    short: "EHR portal certificate expired",
    real: true,
    why: "certs.txt CERT-1 expired 2025-08-30, wrong SAN, SHA-1 — renew from the CA and monitor expiry.",
    tab: "certs.txt",
  },
  {
    id: "f4",
    short: "Terminated contractor's account still authenticates",
    real: true,
    why: "hr-roster: terminated 10-18 but access-last-seen 11-01 — joiner/mover/leaver process gap (IAM lifecycle).",
    tab: "hr-roster.txt",
  },
  {
    id: "f5",
    short: "Auth-server clock drift +4.7 s breaks TOTP",
    real: true,
    why: "ntp.log: pool unreachable → local fallback → TOTP windows fail. Time sync is part of time-based authentication.",
    tab: "ntp.log",
  },
  {
    id: "f6",
    short: "03:00 logins from ward 3F look suspicious",
    real: false,
    why: "Benign — anaya.k and r.okafor are night nurses (19:00–07:00 roster). Context makes it a false positive.",
    tab: "radius.log",
  },
  {
    id: "f7",
    short: "svc_backup reject burst = brute-force attack",
    real: false,
    why: "Benign — stale service secret, rotation already ticketed (CHG-2041). Check the change log before escalating.",
    tab: "radius.log",
  },
  {
    id: "f8",
    short: "Device admin runs on RADIUS with no per-command accounting",
    real: true,
    why: "core-sw1.cfg: AAA points at RADIUS; no 'aaa accounting commands' line; TACACS+ server configured but unused — no per-command authorization/accounting.",
    tab: "core-sw1.cfg",
  },
];
const AUDIT_REAL = ["f1", "f2", "f3", "f4", "f5", "f8"];
const TPFP_EVENTS = [
  { id: "tp1", text: "AUTH-OK anaya.k 03:12 from ap-ward3f", ans: "fp", why: "Night shift 19:00–07:00 — matches roster; benign." },
  { id: "tp2", text: "AUTH-OK staff account from abroad resort 14:02", ans: "tp", why: "Outside every geofence zone for staff — policy violation worth paging." },
  { id: "tp3", text: "AUTH-REJ svc_backup ×3", ans: "fp", why: "Stale secret, change ticketed (CHG-2041) — known-maintenance noise." },
  { id: "tp4", text: "11 push requests in 4 min, one approved, unknown ASN", ans: "tp", why: "MFA request generation pattern (MITRE T1621) — escalate immediately." },
  { id: "tp5", text: "AUTH-OK d.chen 02:30 from ward 3F laptop", ans: "fp", why: "On-call rota covers nights — plausible and verified." },
  { id: "tp6", text: "BIND port=389 tls=NONE from billing-app", ans: "tp", why: "Cleartext directory bind violates encryption-in-transit policy — real misconfiguration." },
];
/* Hard: Incident 2211 */
const H2_SEQ = [
  { id: "e1", label: "Reused password matched a public credential dump" },
  { id: "e2", label: "11 MFA pushes flooded the clerk's phone (T1621)" },
  { id: "e3", label: "One push approved at 09:45:20" },
  { id: "e4", label: "SAML assertion issued for ehr-web (new device, abroad)" },
  { id: "e5", label: "2,874-row patient batch exported" },
];
const H2_CONTROLS = [
  { id: "k1", label: "No geofencing on IdP logins", correct: true },
  { id: "k2", label: "Push approvals without number matching", correct: true },
  { id: "k3", label: "Over-privileged role — billing had EHR write", correct: true },
  { id: "k4", label: "No session revocation / anomaly response", correct: true },
  { id: "k5", label: "No full-disk encryption on laptops", correct: false },
  { id: "k6", label: "No TACACS+ accounting", correct: false },
  { id: "k7", label: "Weak Wi-Fi passphrase", correct: false },
  { id: "k8", label: "No UPS on the core switch", correct: false },
];
const H2_MITRE = /^t-?1621$/i;
/* Hard: rule bench */
const H3_RULES = [
  { id: "rule1", name: "Impossible travel / geo-velocity", src: "src-idpauth", conds: ["cd-two-loc", "cd-two-country", "cd-10min"], thr: "th-one" },
  { id: "rule2", name: "MFA push flood (T1621)", src: "src-idppush", conds: ["cd-push5", "cd-zero", "cd-5min"], thr: "th-burst" },
  { id: "rule3", name: "Off-hours device config change", src: "src-tacacs", conds: ["cd-conf", "cd-offhours"], thr: "th-one" },
];
const H3_SOURCES = [
  { id: "src-idpauth", label: "IdP / VPN authentication logs" },
  { id: "src-idppush", label: "IdP push-notification logs" },
  { id: "src-tacacs", label: "TACACS+ command accounting" },
  { id: "src-ldap", label: "LDAP bind logs" },
  { id: "src-ntp", label: "NTP offset metrics" },
  { id: "src-cert", label: "Certificate expiry registry" },
];
const H3_CONDS = [
  { id: "cd-two-loc", label: "successive successful logins, same user" },
  { id: "cd-two-country", label: "two different countries / unknown ASNs" },
  { id: "cd-10min", label: "within 10 minutes" },
  { id: "cd-push5", label: "≥5 push requests" },
  { id: "cd-zero", label: "zero approvals" },
  { id: "cd-5min", label: "within a 5-minute window" },
  { id: "cd-conf", label: "config-mode command executed" },
  { id: "cd-offhours", label: "outside 08:00–18:00 or weekend" },
  { id: "cd-bind", label: "cleartext bind on 389" },
  { id: "cd-offset", label: "clock offset > 100 ms" },
];
const H3_THR = [
  { id: "th-one", label: "alert on first occurrence" },
  { id: "th-burst", label: "alert on one burst (≥5 in 5 min)" },
  { id: "th-week", label: "aggregate weekly report only" },
];

/* ---- Hardening Board ---- */
const M12_GAPS = [
  { id: "g-ldap", label: "Cleartext LDAP binds (389)", correct: "x-ldaps" },
  { id: "g-vpn", label: "VPN MFA off for contractors", correct: "x-mfa" },
  { id: "g-cert", label: "Expired portal certificate", correct: "x-cert" },
  { id: "g-leaver", label: "Leaver account still active", correct: "x-jml" },
  { id: "g-ntp", label: "Clock drift breaks TOTP", correct: "x-ntp" },
];
const M12_CONTROLS = [
  { id: "x-ldaps", label: "Enforce LDAPS 636; refuse cleartext 389 binds" },
  { id: "x-mfa", label: "Require 2-factor MFA for every remote group" },
  { id: "x-cert", label: "Renew from CA + automate expiry monitoring" },
  { id: "x-jml", label: "Disable accounts + joiner/mover/leaver process" },
  { id: "x-ntp", label: "Sync to internal NTP + drift alerting" },
  { id: "x-decoy1", label: "Buy a next-gen firewall appliance" },
  { id: "x-decoy2", label: "Add more administrator accounts" },
  { id: "x-decoy3", label: "Disable logging to reduce noise" },
];
const M12_SEQ = [
  { id: "ms1", label: "Disable the leaver account (contain first)" },
  { id: "ms2", label: "Renew the expired portal certificate" },
  { id: "ms3", label: "Enforce LDAPS 636 (needs the new certificate)" },
  { id: "ms4", label: "Re-sync NTP for the auth servers" },
  { id: "ms5", label: "Roll out VPN MFA to all groups" },
  { id: "ms6", label: "Schedule quarterly access recertification" },
];
/* Hard H1 blueprint */
const H1_LAYERS = [
  { id: "ly-ctx", label: "Access Context (perimeter)", hint: "controls that gate where/when a connection may even ask" },
  { id: "ly-idn", label: "Identity & Authentication", hint: "proving who is asking" },
  { id: "ly-authz", label: "Authorization & Least Privilege", hint: "deciding what the proven identity may do" },
  { id: "ly-data", label: "Data Protection", hint: "protecting the payload itself" },
  { id: "ly-acct", label: "Audit & Accounting", hint: "recording what happened" },
];
const H1_CONTROLS = [
  { id: "c-8021x", label: "802.1X + RADIUS", layer: "ly-ctx" },
  { id: "c-geo", label: "Geofencing", layer: "ly-ctx" },
  { id: "c-mfa", label: "MFA (TOTP)", layer: "ly-idn" },
  { id: "c-sso", label: "SSO / SAML federation", layer: "ly-idn" },
  { id: "c-ldaps", label: "LDAPS (636)", layer: "ly-idn" },
  { id: "c-rbac", label: "RBAC + least privilege", layer: "ly-authz" },
  { id: "c-jml", label: "Joiner/mover/leaver lifecycle", layer: "ly-authz" },
  { id: "c-tls", label: "TLS / IPsec in transit", layer: "ly-data" },
  { id: "c-fde", label: "Full-disk & DB encryption (rest)", layer: "ly-data" },
  { id: "c-tacacct", label: "TACACS+ command accounting", layer: "ly-acct" },
];
/* Hard H7 access plan */
const H7_PATHS = [
  {
    id: "p-vpn",
    label: "Remote VPN",
    slots: [
      {
        id: "s1",
        label: "Authentication",
        options: [
          { id: "a1", label: "Password + TOTP (2 factor categories)" },
          { id: "a2", label: "Password only" },
          { id: "a3", label: "Password + security questions" },
          { id: "a4", label: "Fingerprint alone" },
        ],
        correct: "a1",
      },
      {
        id: "s2",
        label: "Transport",
        options: [
          { id: "b1", label: "IPsec / TLS tunnel" },
          { id: "b2", label: "Plain IPv4" },
          { id: "b3", label: "Legacy PPTP" },
          { id: "b4", label: "HTTP" },
        ],
        correct: "b1",
      },
      {
        id: "s3",
        label: "Context rule",
        options: [
          { id: "c1", label: "Geofence campus+metro with exception list" },
          { id: "c2", label: "No context rule" },
          { id: "c3", label: "Allow abroad only" },
          { id: "c4", label: "Weekend-only access" },
        ],
        correct: "c1",
      },
    ],
  },
  {
    id: "p-ehr",
    label: "EHR web app",
    slots: [
      {
        id: "s1",
        label: "SSO design",
        options: [
          { id: "a1", label: "SAML via MeridianID + step-up MFA for exports" },
          { id: "a2", label: "Local app passwords for everyone" },
          { id: "a3", label: "SSO without any MFA" },
          { id: "a4", label: "Anonymous session link" },
        ],
        correct: "a1",
      },
      {
        id: "s2",
        label: "Transport",
        options: [
          { id: "b1", label: "HTTPS / TLS 1.3" },
          { id: "b2", label: "HTTP" },
          { id: "b3", label: "FTP" },
          { id: "b4", label: "SMTP" },
        ],
        correct: "b1",
      },
      {
        id: "s3",
        label: "Session policy",
        options: [
          { id: "c1", label: "15-min idle timeout + revoke on anomaly" },
          { id: "c2", label: "No timeout" },
          { id: "c3", label: "30-day session" },
          { id: "c4", label: "Shared sessions allowed" },
        ],
        correct: "c1",
      },
    ],
  },
  {
    id: "p-cli",
    label: "Switch / router CLI",
    slots: [
      {
        id: "s1",
        label: "AAA protocol",
        options: [
          { id: "a1", label: "TACACS+ with per-command authorization" },
          { id: "a2", label: "RADIUS (password-only encryption)" },
          { id: "a3", label: "Shared local admin login" },
          { id: "a4", label: "Telnet + banner" },
        ],
        correct: "a1",
      },
      {
        id: "s2",
        label: "Transport",
        options: [
          { id: "b1", label: "SSH via management VLAN" },
          { id: "b2", label: "HTTPS web UI" },
          { id: "b3", label: "Telnet" },
          { id: "b4", label: "SNMPv1" },
        ],
        correct: "b1",
      },
      {
        id: "s3",
        label: "Accounts",
        options: [
          { id: "c1", label: "Named accounts + break-glass local account" },
          { id: "c2", label: "Shared admin password" },
          { id: "c3", label: "No accounts" },
          { id: "c4", label: "4-digit PIN per device" },
        ],
        correct: "c1",
      },
    ],
  },
  {
    id: "p-wifi",
    label: "Clinical Wi-Fi (tablets)",
    slots: [
      {
        id: "s1",
        label: "Network access",
        options: [
          { id: "a1", label: "802.1X EAP-TLS via RADIUS" },
          { id: "a2", label: "WPA2 pre-shared key" },
          { id: "a3", label: "Open + captive portal" },
          { id: "a4", label: "MAC filter list" },
        ],
        correct: "a1",
      },
      {
        id: "s2",
        label: "Device identity",
        options: [
          { id: "b1", label: "Per-device certificate" },
          { id: "b2", label: "Shared passphrase" },
          { id: "b3", label: "MAC address (spoofable)" },
          { id: "b4", label: "None" },
        ],
        correct: "b1",
      },
      {
        id: "s3",
        label: "Segmentation",
        options: [
          { id: "c1", label: "Dynamic VLAN: clinical vs guest" },
          { id: "c2", label: "Flat guest VLAN for everything" },
          { id: "c3", label: "No segmentation" },
          { id: "c4", label: "DHCP-based separation" },
        ],
        correct: "c1",
      },
    ],
  },
  {
    id: "p-saas",
    label: "SaaS HR portal",
    slots: [
      {
        id: "s1",
        label: "SSO design",
        options: [
          { id: "a1", label: "SAML SSO from MeridianID" },
          { id: "a2", label: "Local passwords per user" },
          { id: "a3", label: "Shared department login" },
          { id: "a4", label: "Magic email links only" },
        ],
        correct: "a1",
      },
      {
        id: "s2",
        label: "Factor",
        options: [
          { id: "b1", label: "MFA required" },
          { id: "b2", label: "None" },
          { id: "b3", label: "Security questions only" },
          { id: "b4", label: "IP allowlist as the only control" },
        ],
        correct: "b1",
      },
      {
        id: "s3",
        label: "Monitoring",
        options: [
          { id: "c1", label: "Geo-velocity alert on logins" },
          { id: "c2", label: "No monitoring" },
          { id: "c3", label: "Allow any ASN silently" },
          { id: "c4", label: "365-day sessions" },
        ],
        correct: "c1",
      },
    ],
  },
];
/* Hard H9 runbook */
const H9_STEPS = [
  { id: "rb1", label: "Disable leaver + compromised accounts (contain first)" },
  { id: "rb2", label: "Re-sync auth servers to internal NTP (offset < 100 ms)" },
  { id: "rb3", label: "Verify TOTP logins succeed after sync" },
  { id: "rb4", label: "Reissue the expired portal certificate from the CA + deploy" },
  { id: "rb5", label: "Enforce LDAPS 636; refuse cleartext 389 binds" },
  { id: "rb6", label: "Require 2-factor MFA on VPN for every group" },
  { id: "rb7", label: "Migrate device admin to TACACS+ with command accounting" },
  { id: "rb8", label: "Schedule quarterly RBAC recertification + geofence review" },
];
/* Hard H8 trade-off cards */
const H8_CARDS = [
  {
    id: "federation",
    title: "SSO: convenience vs concentration",
    context:
      "MeridianID federates 14 apps. CISO asks: keep SSO or give every app its own passwords?",
    stances: [
      { id: "st-a", label: "Keep SSO + step-up MFA on sensitive apps" },
      { id: "st-b", label: "Break SSO — separate passwords everywhere" },
    ],
    stanceCorrect: "st-a",
    riskPool: [
      { id: "rs1", label: "A stolen web session still works (MITRE T1550.004)", correct: true },
      { id: "rs2", label: "IdP outage blocks all federated apps at once", correct: true },
      { id: "rs3", label: "Fingerprint templates could be cloned", correct: false },
      { id: "rs4", label: "NTP drift locks out users", correct: false },
      { id: "rs5", label: "RADIUS shared secret exposure", correct: false },
    ],
    teach:
      "Sensible SSO keeps the convenience and pays down risk with step-up MFA + IdP resilience. SSO never removes session-theft risk — detection for assertion anomalies stays on.",
  },
  {
    id: "gate",
    title: "TOTP vs hardware keys",
    context:
      "Remote clinicians use TOTP codes. Proposal: issue hardware security keys to all 1,200 clinicians.",
    stances: [
      { id: "st-a", label: "Keep TOTP + add number-matching & drift monitoring" },
      { id: "st-b", label: "Issue hardware keys to all 1,200 clinicians" },
    ],
    stanceCorrect: "st-a",
    riskPool: [
      { id: "rt1", label: "TOTP codes remain phishable", correct: true },
      { id: "rt2", label: "Clock drift can still lock users out", correct: true },
      { id: "rt3", label: "Keys cost nothing", correct: false },
      { id: "rt4", label: "Keys never get lost", correct: false },
      { id: "rt5", label: "SMS is safer than both", correct: false },
    ],
    teach:
      "Real rollouts phase strong factors by risk tier. TOTP + number matching is a pragmatic middle; hardware keys are best for the most-targeted accounts.",
  },
  {
    id: "roles",
    title: "RBAC granularity vs admin overhead",
    context:
      "Department heads want per-user custom permissions; IAM wants role-based control.",
    stances: [
      { id: "st-a", label: "RBAC roles + quarterly recertification" },
      { id: "st-b", label: "Per-user custom permissions for everyone" },
    ],
    stanceCorrect: "st-a",
    riskPool: [
      { id: "rr1", label: "Role creep accumulates over time", correct: true },
      { id: "rr2", label: "Mis-classified new hires get the wrong role", correct: true },
      { id: "rr3", label: "RBAC removes all risk", correct: false },
      { id: "rr4", label: "RBAC deletes the audit trail", correct: false },
      { id: "rr5", label: "Protocols break under RBAC", correct: false },
    ],
    teach:
      "RBAC massively simplifies authorization but needs periodic recertification — otherwise roles quietly accumulate privileges (role creep).",
  },
  {
    id: "clock",
    title: "Geofencing vs traveling staff",
    context:
      "Physicians attend conferences. Hard fences keep locking them out abroad.",
    stances: [
      { id: "st-a", label: "Geofence + exception group with step-up MFA" },
      { id: "st-b", label: "Drop geofencing — trust passwords alone" },
    ],
    stanceCorrect: "st-a",
    riskPool: [
      { id: "rg1", label: "VPN / geo-spoofing can defeat IP-based fences", correct: true },
      { id: "rg2", label: "The exception list itself needs periodic review", correct: true },
      { id: "rg3", label: "Geofencing stops every attack", correct: false },
      { id: "rg4", label: "SHA-1 certificates are the real problem", correct: false },
      { id: "rg5", label: "TOTP windows get wider abroad", correct: false },
    ],
    teach:
      "Geofencing is a context signal, not a wall — pair it with step-up MFA on exceptions and review the exception list like any privileged group.",
  },
];
