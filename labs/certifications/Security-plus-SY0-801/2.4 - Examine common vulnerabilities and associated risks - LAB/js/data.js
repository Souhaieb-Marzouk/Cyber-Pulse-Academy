/**
 * Vulnerability Council — lab data core (static port).
 *
 * Source: src/lib/lab-data.ts (1134 lines). All evidence is SYNTHETIC and
 * labelled "Training data — fictional".
 * Reference: CompTIA Security+ SY0-801 Objective 2.4 —
 *   "Given a scenario, analyze common vulnerabilities and associated risks."
 *
 * Exposed on the global Lab namespace as Lab.Data.
 */
(function (global) {
  "use strict";

  var Lab = global.Lab || (global.Lab = {});
  var Data = (Lab.Data = {});

  // --- Vulnerability type + attack surface catalogues ------------------------

  Data.VULN_CATEGORIES = [
    { value: "unsupported_system", label: "Unsupported / EoL system", short: "Unsupported" },
    { value: "hardcoded_secret", label: "Hardcoded secret / credential", short: "Hardcoded secret" },
    { value: "default_credential", label: "Default credential", short: "Default cred" },
    { value: "misconfiguration", label: "Misconfiguration", short: "Misconfig" },
    { value: "cryptographic_weakness", label: "Cryptographic weakness", short: "Crypto" },
    { value: "race_condition", label: "Race condition (TOCTOU)", short: "TOCTOU" },
    { value: "unsafe_exception_handling", label: "Unsafe exception handling (fail-open)", short: "Fail-open" },
    { value: "application_flaw", label: "Application flaw", short: "App flaw" },
    { value: "rogue_device", label: "Rogue device", short: "Rogue" },
    { value: "shadow_it", label: "Shadow IT", short: "Shadow IT" },
    { value: "none", label: "No vulnerability — control verified", short: "None" },
  ];

  Data.ATTACK_SURFACES = [
    { value: "operating_system", label: "Operating system" },
    { value: "application", label: "Application / code" },
    { value: "public_object_storage", label: "Public object storage" },
    { value: "public_repository", label: "Public repository" },
    { value: "identity_provider", label: "Identity provider (IdP)" },
    { value: "llm", label: "LLM (connected data & tools)" },
    { value: "mobile", label: "Mobile / endpoint" },
    { value: "none", label: "N/A" },
  ];

  // Lookup maps (mirrors CATEGORY_LABEL / SURFACE_LABEL).
  Data.CATEGORY_LABEL = {};
  Data.VULN_CATEGORIES.forEach(function (c) { Data.CATEGORY_LABEL[c.value] = c.short; });
  Data.SURFACE_LABEL = {};
  Data.ATTACK_SURFACES.forEach(function (s) { Data.SURFACE_LABEL[s.value] = s.label; });

  // --- Evidence cards --------------------------------------------------------

  /**
   * Composite priority score for the council queue:
   * CVSS × EPSS × KEV × exposure × asset (with normalization multipliers).
   */
  function priorityScore(e) {
    var cvss = e.cvssExpected != null ? e.cvssExpected : 0;
    var epss = e.epss != null ? e.epss : 0;
    var kev = e.kev ? 1.5 : 1;
    var expMul = 0.7 + e.exposure * 0.2; // 0.9..1.7
    var assetMul = 0.7 + e.assetValue * 0.2; // 0.9..1.7
    return cvss * epss * kev * expMul * assetMul;
  }

  Data.EVIDENCE = [
    {
      id: "e1",
      code: "E1",
      title: "host-ldapsvc-04 scan",
      category: "unsupported_system",
      surface: "operating_system",
      cvssVector: "AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
      cvssExpected: 9.8,
      epss: 0.62,
      kev: true,
      assetValue: 4,
      exposure: 4,
      body:
        "Training data — fictional.\n\n# nmap excerpt — host-ldapsvc-04\nPORT     STATE SERVICE\n389/tcp  open  ldap\n636/tcp  open  ldapssl\n\n# banner\nOpenLDAP 2.4.41 (EoL since 2018)\n\n# note\nAsset supports a legacy HR application that cannot be upgraded\nin this fiscal year.",
      redHerring: false,
    },
    {
      id: "e2",
      code: "E2",
      title: "Java source: db password",
      category: "hardcoded_secret",
      surface: "application",
      cvssVector: "AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
      cvssExpected: 9.8,
      epss: 0.81,
      kev: true,
      assetValue: 5,
      exposure: 5,
      body:
        "Training data — fictional.\n\n// db/Connection.java  (private repo: meridian/billing-svc)\nString dbPass = \"P@ssw0rd123!\";\n\n// assumption for scoring\n// hardcoded DB credential -> assume RCE path via DB.",
      redHerring: false,
    },
    {
      id: "e3",
      code: "E3",
      title: "Tomcat server.xml",
      category: "default_credential",
      surface: "application",
      cvssVector: "AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
      cvssExpected: 9.8,
      epss: 0.71,
      kev: true,
      assetValue: 3,
      exposure: 4,
      body:
        "Training data — fictional.\n\n<!-- conf/server.xml -->\n<Connector port=\"8080\" auth=\"Basic\" />\n\n# operator note\ntomcat / tomcat  still authenticates successfully on the manager app.",
      redHerring: false,
    },
    {
      id: "e4",
      code: "E4",
      title: "Bucket policy: public-prod-uploads",
      category: "misconfiguration",
      surface: "public_object_storage",
      cvssVector: "AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N",
      cvssExpected: 9.1,
      epss: 0.45,
      kev: false,
      assetValue: 5,
      exposure: 5,
      body:
        'Training data — fictional.\n\n{\n  "Version": "2012-10-17",\n  "Statement": [{\n    "Effect": "Allow",\n    "Principal": "*",\n    "Action": ["s3:GetObject","s3:PutObject"],\n    "Resource": "arn:aws:s3:::public-prod-uploads/*"\n  }]\n}',
      redHerring: false,
    },
    {
      id: "e5",
      code: "E5",
      title: "Git commit by intern-jane",
      category: "hardcoded_secret",
      surface: "public_repository",
      altSurface: "public_repository",
      cvssVector: "AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N",
      cvssExpected: 9.1,
      epss: 0.55,
      kev: true,
      assetValue: 5,
      exposure: 5,
      body:
        "Training data — fictional.\n\ncommit 8f3a2c1  intern-jane  2026-10-12\n   add analytics config\n\ndiff --git a/config.yml b/config.yml\n+api_key: sk-abc123def456ghi789jkl012mno345pqr678\n+db_endpoint: prod-meridian.cluster.internal\n\n# repo: meridian/analytics-app  (PUBLIC visibility)",
      redHerring: false,
    },
    {
      id: "e6",
      code: "E6",
      title: "Hash dump: /etc/shadow",
      category: "cryptographic_weakness",
      surface: "operating_system",
      cvssVector: "AV:L/AC:L/PR:H/UI:N/S:U/C:H/I:H/A:H",
      cvssExpected: 6.7,
      epss: 0.32,
      kev: false,
      assetValue: 4,
      exposure: 3,
      body:
        "Training data — fictional.\n\n# /etc/shadow (excerpt)\nalice:5f4dcc3b5aa765d61d8327deb882cf99\nbob:$1$ab12$...(truncated)\n\n# analyst note\n5f4dcc3b... = MD5(\"password\") — unsalted, fast hash, deprecated algorithm.",
      redHerring: false,
    },
    {
      id: "e7",
      code: "E7",
      title: "Python TOCTOU: config loader",
      category: "race_condition",
      surface: "application",
      cvssVector: "AV:L/AC:H/PR:L/UI:N/S:U/C:H/I:H/A:H",
      cvssExpected: 7.0,
      epss: 0.18,
      kev: false,
      assetValue: 4,
      exposure: 2,
      body:
        "Training data — fictional.\n\n# config_loader.py\ndef load(path):\n    if os.path.exists(path):\n        # window between check and use\n        f = open(path)\n        data = f.read()\n        return data\n\n# analyst note\nsymlink swap is possible between check() and open().",
      redHerring: false,
    },
    {
      id: "e8",
      code: "E8",
      title: "Exception handler: auth",
      category: "unsafe_exception_handling",
      surface: "application",
      cvssVector: "AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N",
      cvssExpected: 9.1,
      epss: 0.41,
      kev: false,
      assetValue: 5,
      exposure: 4,
      body:
        "Training data — fictional.\n\n// AuthFilter.java\ntry {\n    return authenticate(token);\n} catch (Exception e) {\n    return true; // fail-open: keep users in during errors\n}",
      redHerring: false,
    },
    {
      id: "e9",
      code: "E9",
      title: "IdP config: signing key",
      category: "misconfiguration",
      surface: "identity_provider",
      cvssVector: "AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:N",
      cvssExpected: 10.0,
      epss: 0.28,
      kev: false,
      assetValue: 5,
      exposure: 3,
      body:
        "Training data — fictional.\n\n# IdP signing key provenance\nSAML signing key last rotated: 2019-03-04\nStored at: /etc/idp/keys.pem  on a shared host\nFile mode: 0644 (world-readable)",
      redHerring: false,
    },
    {
      id: "e10",
      code: "E10",
      title: "LLM assistant: tools & data",
      category: "application_flaw",
      surface: "llm",
      cvssVector: "AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:N",
      cvssExpected: 8.1,
      epss: 0.22,
      kev: false,
      assetValue: 5,
      exposure: 4,
      body:
        "Training data — fictional.\n\nMeridian Support Copilot (LLM assistant)\nConnected tools:\n  - read_customer_db\n  - send_email\n  - run_sql_query\nData scope: full CRM (PII + PHI)\nTool-call logging: NOT enabled.",
      redHerring: false,
    },
    {
      id: "e11",
      code: "E11",
      title: "Asset register: eng-laptop-77",
      category: "rogue_device",
      surface: "mobile",
      epss: null,
      kev: false,
      assetValue: 2,
      exposure: 3,
      body:
        "Training data — fictional.\n\nDevice: eng-laptop-77\nMDM enrollment: NOT enrolled\nFirst seen: 2026-10-30  network: CORP-WIFI\nAsset register: never approved.\nClassification-only case (no CVSS).",
      redHerring: false,
    },
    {
      id: "e12",
      code: "E12",
      title: "Marketing SaaS: cloud-analytics-prod.io",
      category: "shadow_it",
      surface: "public_object_storage",
      epss: null,
      kev: false,
      assetValue: 3,
      exposure: 4,
      body:
        "Training data — fictional.\n\ncloud-analytics-prod.io\nApproval: not on IT service catalogue.\nBilling: Jane D.'s personal credit card.\nInbound data: daily export of customer analytics (egress).\nClassification-only case (no CVSS).",
      redHerring: false,
    },
    {
      id: "rh1",
      code: "RH1",
      title: "Web app: Content-Security-Policy",
      category: "none",
      surface: "application",
      epss: null,
      kev: false,
      assetValue: 2,
      exposure: 1,
      body:
        "Training data — fictional.\n\n# response headers (excerpt)\nContent-Security-Policy: default-src 'self'; script-src 'self' 'nonce-{rnd}';\n                       object-src 'none'; base-uri 'self'; frame-ancestors 'none'\nStrict-Transport-Security: max-age=63072000; includeSubDomains\nX-Content-Type-Options: nosniff\n\n# analyst note\nCSP is properly configured and enforced. Reviewed — no action.",
      redHerring: true,
    },
    {
      id: "rh2",
      code: "RH2",
      title: "Scan result: host-ssh-01",
      category: "none",
      surface: "operating_system",
      epss: null,
      kev: false,
      assetValue: 2,
      exposure: 1,
      body:
        "Training data — fictional.\n\n# nmap + vuln scan — host-ssh-01\nPORT   STATE SERVICE\n22/tcp open  ssh     OpenSSH 9.6p1\n\n# sshd_config\nPermitRootLogin no\nPasswordAuthentication no\nPubkeyAuthentication yes\n\n# CVE scan\nfindings: 0\n\n# analyst note\nProperly patched, key-auth only. Reviewed — no action.",
      redHerring: true,
    },
  ];

  // Index by id (EVIDENCE_BY_ID).
  Data.EVIDENCE_BY_ID = {};
  Data.EVIDENCE.forEach(function (e) { Data.EVIDENCE_BY_ID[e.id] = e; });

  // Precomputed priority scores.
  Data.EVIDENCE_PRIORITY_SCORE = {};
  Data.EVIDENCE.forEach(function (e) { Data.EVIDENCE_PRIORITY_SCORE[e.id] = priorityScore(e); });

  // --- Glossary --------------------------------------------------------------

  Data.GLOSSARY = [
    { term: "Vulnerability", definition: "A weakness in an information system that could be exploited. Severity is a property of the vulnerability itself." },
    { term: "Risk", definition: "Likelihood × impact. A 9.8-severity flaw nobody exploits can be lower risk than a 7.5 being actively exploited." },
    { term: "Zero-day", definition: "No fix is available yet from the vendor. Mitigate with compensating controls until a patch ships." },
    { term: "Unpatched", definition: "A fix exists but has not been installed. Mitigation is to apply the patch." },
    { term: "Unsupported (EoL)", definition: "No fix will ever ship for this version — the vendor dropped support. Upgrade or isolate." },
    { term: "Obsolete", definition: "Even if patched/upgraded, the platform cannot meet current requirements (compliance, capability). Replace it." },
    { term: "Unmanaged system", definition: "A system that is approved but not actively managed (no patches, no monitoring)." },
    { term: "Rogue device", definition: "A device on the network that was never approved in the asset register." },
    { term: "Shadow IT", definition: "A service adopted by staff without IT/procurement approval. Route through procurement; assess data egress." },
    { term: "Stale credential", definition: "An account (often admin) that is no longer needed but still active. Remove via enforced offboarding." },
    { term: "Hardcoded secret", definition: "A credential embedded in source. Only a new build can change it — rotate and rebuild." },
    { term: "Default credential", definition: "A vendor-set credential still in use. Changeable, but often forgotten. Force a change on first use." },
    { term: "Misconfiguration", definition: "A config error that exposes a system (e.g. public bucket, world-readable key, permissive IdP)." },
    { term: "Cryptographic weakness", definition: "Weak randomness, unsalted fast hashes, or deprecated algorithms. Migrate to Argon2id/bcrypt + per-user salts." },
    { term: "TOCTOU race condition", definition: "Time-Of-Check to Time-Of-Use gap. Fix by making check and use one atomic operation." },
    { term: "Fail-open", definition: "A security check that grants access on error. Security checks must fail CLOSED (deny) on exception." },
    { term: "CVSS v3.1", definition: "Common Vulnerability Scoring System. Base/Temporal/Environmental/Supplemental metric groups. v3.1 and v4.0 are NOT interchangeable." },
    { term: "EPSS", definition: "Exploit Prediction Scoring System — probability (0..1) that a vuln is exploited in the near term. Drives likelihood." },
    { term: "KEV", definition: "CISA Known Exploited Vulnerabilities catalog — flaws being exploited in the wild right now." },
    { term: "CVE vs CWE", definition: "CVE names one specific flaw in one product; CWE names the type of weakness. Many CVEs map to one CWE." },
    { term: "Signed update", definition: "A signature proves WHO shipped an update (origin), not that it is SAFE. A breached vendor can ship a backdoored, validly-signed update." },
  ];

  // --- Knowledge core (collapse panel) ---------------------------------------

  Data.KNOWLEDGE_CORE = [
    {
      heading: "Vulnerability vs risk",
      body: "A vulnerability is the weakness. Risk = likelihood × impact. Severity (CVSS) is NOT risk — a high-severity flaw with no exploit signal can be lower risk than a medium one in the KEV catalog.",
    },
    {
      heading: "Fix-availability classes",
      body: "Zero-day = no fix yet. Unpatched = fix exists, not installed. Unsupported = no fix ever for this version (EoL). Obsolete = can't meet requirements even if patched.",
    },
    {
      heading: "Asset-management classes",
      body: "Unmanaged system (approved, not managed). Rogue device (never approved). Shadow IT (staff-adopted, unapproved service).",
    },
    {
      heading: "Credential classes",
      body: "Stale (unused but active). Unmanaged. Hardcoded (in source). Default (vendor-set, still in use).",
    },
    {
      heading: "Config & code classes",
      body: "Misconfiguration, application flaws, cryptographic weaknesses (weak randomness, unsalted fast hashes, deprecated algorithms), TOCTOU race conditions, unsafe exception handling (fail-open vs fail-closed), open service ports, unnecessary services.",
    },
    {
      heading: "Attack surfaces",
      body: "Public repositories, public object storage, identity providers, LLMs (connected data/tools), OS, virtualized/hypervisor, mobile, wireless, low-power (IoT/OT).",
    },
    {
      heading: "Signed-update caveat",
      body: "A signature proves origin (who shipped it), not safety. A breached vendor can ship a backdoored, correctly-signed update to fully up-to-date systems.",
    },
    {
      heading: "CVSS v3.1 bands & groups",
      body: "Low 0.1–3.9, Medium 4.0–6.9, High 7.0–8.9, Critical 9.0–10.0. Metric groups: Base, Temporal, Environmental, Supplemental. v3.1 and v4.0 are NOT interchangeable.",
    },
    {
      heading: "EPSS & KEV",
      body: "EPSS = probability of exploitation soon. KEV = CISA Known Exploited Vulnerabilities catalog (exploited now). Both drive likelihood, which drives risk.",
    },
    {
      heading: "Mitigation sequencing rules",
      body: "Public-repo secret = revoke/rotate FIRST then clean (it is burned). Public bucket = control BOTH read (leak) AND write (tampering). OT/IoT = segment + passive monitor (not patch/agent). TOCTOU = make check+use atomic. Security checks fail CLOSED on error. Disable unnecessary services. Replace unsupported/EoL or isolate. Centralize identity + enforce offboarding.",
    },
  ];

  // --- Objectives ------------------------------------------------------------

  Data.PILLAR_LABEL = { P1: "Understand", P2: "Recognize", P3: "Detect", P4: "Mitigate" };

  Data.OBJECTIVES = [
    // ---------- MEDIUM ----------
    {
      id: "OBJ-M1",
      mode: "medium",
      pillar: "P1",
      title: "Match each fix-availability class to its definition.",
      kind: "fix-availability-match",
      hints: [
        "Think about the vendor's timeline: has the fix shipped yet? Is it installed?",
        "Zero-day = vendor doesn't have a fix yet. Unsupported = vendor stopped supporting this version.",
        "Zero-day→'No fix available yet'; Unpatched→'Fix exists but not installed'; Unsupported→'No fix ever for this version (EoL)'; Obsolete→'Cannot meet current requirements even if patched'.",
      ],
      feedback:
        "These four classes are the spine of 2.4. The exam tests them with timeline scenarios — a flaw moves from zero-day to unpatched to unsupported as the vendor ships and then drops the fix.",
    },
    {
      id: "OBJ-M2",
      mode: "medium",
      pillar: "P1",
      title: "Sort these 8 items into 'Vulnerability type' vs 'Attack surface'.",
      kind: "type-surface-sort",
      hints: [
        "A vulnerability is the weakness itself; a surface is where you reach it.",
        "Repositories, IdPs, and LLMs are places an attacker can reach — surfaces.",
        "Vulnerability types: Zero-day, Shadow IT, Hardcoded secret, Rogue device. Attack surfaces: Public repository, Identity provider, LLM, Public object storage.",
      ],
      feedback:
        "A vulnerability is the weakness itself; an attack surface is the reachable point where it lives. The exam often gives you a surface (e.g. 'public S3 bucket') and asks which weakness is exposed.",
    },
    {
      id: "OBJ-M3",
      mode: "medium",
      pillar: "P2",
      title: "Open evidence cards E1, E11, E12. Classify each correctly.",
      kind: "classify-cards",
      hints: [
        "Read the provenance in each card before classifying.",
        "E1's vendor stopped shipping fixes for that version. E11 was never approved. E12 was adopted by staff.",
        "E1=unsupported_system; E11=rogue_device; E12=shadow_it.",
      ],
      feedback:
        "E1 is unsupported (the vendor stopped shipping fixes for that version). E11 is a rogue device (never approved). E12 is shadow IT (staff adopted an unapproved service). Approved-but-unmanaged would be a fourth category — read the provenance before classifying.",
    },
    {
      id: "OBJ-M4",
      mode: "medium",
      pillar: "P2",
      title: "Open E2, E3, E5, E9. Classify each correctly.",
      kind: "classify-cards",
      hints: [
        "Hardcoded = embedded in source. Default = vendor-set, still changeable.",
        "E9's key file is world-readable on a shared host.",
        "E2=hardcoded_secret; E3=default_credential; E5=hardcoded_secret (public repo); E9=misconfiguration.",
      ],
      feedback:
        "Hardcoded = only a new build can change it. Default = vendor-set, still changeable. A secret committed to a public repo is burned regardless of how it got there — rotate first, clean later.",
    },
    {
      id: "OBJ-M5",
      mode: "medium",
      pillar: "P2",
      title: "Open E6. Identify the cryptographic weakness precisely.",
      kind: "crypto-multiselect",
      hints: [
        "Look at the hash format and the analyst note.",
        "Three things are wrong with that hash.",
        "Select all three: Unsalted, MD5, Deprecated algorithm.",
      ],
      feedback:
        "A strong cipher is undone by weak randomness, unsalted fast hashes, or deprecated algorithms. Migrate to Argon2id/bcrypt with per-user salts. The exam gives you a hash format and asks what's wrong with it.",
    },
    {
      id: "OBJ-M6",
      mode: "medium",
      pillar: "P2",
      title: "Open E7 and E8. Pick the correct fix for each.",
      kind: "fix-match",
      hints: [
        "E7 is a TOCTOU race. E8 is an exception handler.",
        "TOCTOU is fixed by removing the gap between check and use. A failing security check must deny, not grant.",
        "E7 = 'Make check and use atomic'; E8 = 'Fail closed (return false on exception)'.",
      ],
      feedback:
        "TOCTOU is fixed by making the check and the use one atomic operation. A security check that errors must fail closed — denying on error — never fail open. The exam often shows the broken code and asks for the principle.",
    },
    {
      id: "OBJ-M7",
      mode: "medium",
      pillar: "P3",
      title: "CVE-2026-44217 is a SQL injection in a Meridian web form. Name its CWE class.",
      kind: "cwe-select",
      hints: [
        "SQL injection has a canonical CWE.",
        "It is the one about 'special elements used in an SQL command'.",
        "CWE-89.",
      ],
      feedback:
        "CWE-89 is the canonical 'Improper Neutralization of Special Elements used in an SQL Command'. CVE names one specific flaw; CWE names the type of weakness. Many CVEs map to one CWE.",
    },
    {
      id: "OBJ-M8",
      mode: "medium",
      pillar: "P3",
      title: "Use the CVSS calculator to compute E2's vector (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H). Place it in the correct band.",
      kind: "cvss-band",
      hints: [
        "All three of C/I/A are High, Scope Unchanged, Network, Low complexity, no privs.",
        "Compute the impact and exploitability then round up.",
        "9.8, band Critical.",
      ],
      feedback:
        "9.8 Critical. Note that v3.1 and v4.0 scores are NOT interchangeable — always confirm which version a CVE uses before comparing. Band thresholds: Low 0.1-3.9, Medium 4.0-6.9, High 7.0-8.9, Critical 9.0-10.0.",
    },
    {
      id: "OBJ-M9",
      mode: "medium",
      pillar: "P3",
      title: "CVE-A (CVSS 9.8, EPSS 0.05, not in KEV) vs CVE-B (CVSS 7.5, EPSS 0.62, in KEV). Which is more urgent?",
      kind: "radio-why",
      hints: [
        "Severity is not the same as risk.",
        "Risk = likelihood × impact. KEV and EPSS drive likelihood.",
        "CVE-B — it is being exploited now (KEV) with high EPSS.",
      ],
      feedback:
        "CVE-B. Severity ≠ risk. A 7.5 being actively exploited (KEV) with high EPSS is more urgent than a 9.8 nobody is touching yet. Risk = likelihood × impact; KEV and EPSS drive likelihood.",
    },
    {
      id: "OBJ-M10",
      mode: "medium",
      pillar: "P4",
      title: "Sequence the mitigation for E5 (public-repo leaked secret) and address E4 (public bucket) fully.",
      kind: "sequence-bucket",
      hints: [
        "A public-repo secret is burned — what must happen first?",
        "A public bucket with GetObject+PutObject has two exposure axes.",
        "E5 order: Revoke/rotate → Remove from history → Audit access logs → Monitor for misuse. E4: control BOTH read (leak) and write (tampering).",
      ],
      feedback:
        "A secret that was ever in a public repository is burned — revoke/rotate FIRST, then clean history. A public bucket with both GetObject and PutObject exposure risks both leaks (read) AND tampering (write) — control both.",
    },
    {
      id: "OBJ-M11",
      mode: "medium",
      pillar: "P4",
      title: "Pick the correct compensating control for each: (a) unsupported OT medical device, (b) host running ftpd/telnetd/rpcbind, (c) shadow IT SaaS, (d) stale admin account.",
      kind: "control-match",
      hints: [
        "OT puts availability first — don't patch or install agents.",
        "Disable what the role doesn't need; route SaaS through procurement; remove stale accounts.",
        "(a) Segment + passive monitor; (b) Disable unnecessary services; (c) Route through procurement + assess egress; (d) Remove from admin group + enforce offboarding.",
      ],
      feedback:
        "OT puts availability first — segment and passively monitor, don't patch or install agents. Disable services the role doesn't need. Shadow IT must be routed through procurement to assess data egress. Stale accounts must be removed via enforced offboarding.",
    },
    {
      id: "OBJ-M12",
      mode: "medium",
      pillar: "P4",
      title: "Build the weekly top-3 priority queue from E1–E10 (exclude E11/E12).",
      kind: "queue-rank",
      hints: [
        "Which card has the highest CVSS?",
        "Which secrets are burned / which have the highest EPSS+KEV?",
        "Top 3: E9 (IdP 10.0), E2 (hardcoded DB pass, KEV), E5 (burned public-repo secret). E9 must be in the top 2.",
      ],
      feedback:
        "E9 (IdP signing key, 10.0) is the highest-severity + a high-value surface (everything that trusts the IdP is exposed). E2 (hardcoded DB password, 9.8, KEV, EPSS 0.81) is the most actively exploited. E5 (public-repo secret) is burned and must be rotated immediately. The remaining items are lower priority because of lower asset value, lower exposure, or no exploit signal.",
    },

    // ---------- HARD ----------
    {
      id: "OBJ-H1",
      mode: "hard",
      pillar: "P2",
      title: "Triage the full vault (14 cards). Classify each, flag the 2 red herrings, select the 4 that go to the council this week.",
      kind: "full-triage",
      hints: [
        "Two cards are controls working as intended — flag them as 'No vulnerability'.",
        "Pick the four with the highest composite priority (CVSS × EPSS × KEV × exposure × asset).",
        "Top 4: E9, E2, E5, E10.",
      ],
      feedback:
        "Triage is classification + prioritization in one pass. The two red herrings (RH1 verified CSP, RH2 patched SSH) are controls working as intended — learn to recognize those too.",
    },
    {
      id: "OBJ-H2",
      mode: "hard",
      pillar: "P3",
      title: "Score CVE-2026-44217 from its raw vector AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:N, then apply Environmental CR:H/IR:H/AR:H. Produce the final score and band. Explain the v3.1 vs v4.0 caveat.",
      kind: "cvss-env-why",
      hints: [
        "Scope is Changed with C:H/I:H — what does that do to the base?",
        "Environmental metrics can only adjust DOWNWARD from base; if base is already 10.0, env cannot exceed it.",
        "Your 'Why?' must mention v4.0, 'not interchangeable', and 'Environmental' — all three, strict.",
      ],
      feedback:
        "Scope Changed with C:H/I:H pushes the Base to 10.0. Environmental metrics can only adjust downward from Base, never above. Always confirm v3.1 vs v4.0 — scores are not interchangeable across versions.",
    },
    {
      id: "OBJ-H3",
      mode: "hard",
      pillar: "P4",
      title: "Investigate E10 (the LLM assistant). Classify the surface, identify the connected tools/data exposure, and produce the mitigation sequence.",
      kind: "llm-plan",
      hints: [
        "What surface is an LLM with connected tools and data?",
        "Name all three tools and both data classes (PII + PHI).",
        "Sequence: scope tool permissions → sandbox → log every tool call → prompt-injection filtering → human-in-the-loop for destructive tools.",
      ],
      feedback:
        "An LLM's connected data and tools are a high-value surface — everything that trusts the assistant is exposed with it. PHI + PII in scope raises the blast radius. Sequence: scope → sandbox → log → filter → HITL.",
    },
    {
      id: "OBJ-H4",
      mode: "hard",
      pillar: "P4",
      title: "The 'signed-but-malicious update' case (CVE-2026-9991). Explain why signature is necessary but not sufficient. Pick the compensating control for an OT medical device AND for an ordinary Linux server.",
      kind: "signed-update",
      hints: [
        "What does a signature actually prove? What does it not prove?",
        "OT is availability-first; a server can stage a deployment.",
        "Signature proves origin, not safety. OT: passive behavioral monitoring + allow-listing + segmentation. Server: behavioral monitoring + staged deployment + rollback plan.",
      ],
      feedback:
        "A valid signature proves who shipped the update, not that it is safe — a breached vendor can ship a backdoored, correctly-signed update to fully up-to-date systems. For OT (availability-first), add passive monitoring + allow-listing + segmentation. For a server, stage the deployment so you can roll back.",
    },
    {
      id: "OBJ-H5",
      mode: "hard",
      pillar: "P4",
      title: "Build the full mitigation plan for E9 (IdP signing-key exposure) in order: revoke, rotate, audit, monitor. Justify each step.",
      kind: "idp-sequence",
      hints: [
        "The key is a crown jewel — every relying party trusts it.",
        "Order is revoke → rotate → audit → monitor.",
        "Audit must cover the entire window since the key was last rotated (2019), not just recent activity.",
      ],
      feedback:
        "The IdP signing key is a high-value surface — every relying party trusts it. Revoke → Rotate → Audit → Monitor. The audit must cover the entire window since the key was last rotated (2019), not just recent activity.",
    },
    {
      id: "OBJ-H6",
      mode: "hard",
      pillar: "P4",
      title: "E4 bucket policy review. Identify BOTH the read and write exposure, design layered controls for each, and explain why E4 is worse than a bucket with only public GetObject.",
      kind: "bucket-review",
      hints: [
        "GetObject = read; PutObject = write. Which CIA property does each break?",
        "Layered: auth + logging + encryption on read; block public write + signed URLs + object lock/versioning on write.",
        "E4 is worse because it also breaks integrity (tampering).",
      ],
      feedback:
        "A public GetObject bucket leaks data (confidentiality). Adding public PutObject also breaks integrity — an attacker can replace files, plant malware, or poison analytics. Control both axes. Object lock + versioning gives you recoverability.",
    },
    {
      id: "OBJ-H7",
      mode: "hard",
      pillar: "P4",
      title: "Trace CVE-2026-44217 through its lifecycle. At each stage name the vulnerability class AND the correct mitigation.",
      kind: "lifecycle-table",
      hints: [
        "The class changes as the vendor's posture changes, not the CVE itself.",
        "Day 0 = no fix yet. Day 30 = fix shipped. Day 365 = support dropped. Day 730 = can't meet compliance.",
        "zero-day → unpatched → unsupported → obsolete; mitigations: compensating controls → patch → upgrade/isolate → replace.",
      ],
      feedback:
        "One flaw moves through four classes as time passes and the vendor's posture changes. The exam tests this with timeline scenarios — the mitigation depends on the class, not on the original CVE.",
    },
    {
      id: "OBJ-H8",
      mode: "hard",
      pillar: "P4",
      title: "Build the weekly council queue: rank the top 5 from the 10 vulns. Justify each slot.",
      kind: "queue-rank5",
      hints: [
        "Highest CVSS first, then KEV/burned secrets, then blast radius.",
        "E10 has lower CVSS than E8 but touches PHI — blast radius matters.",
        "Top 5 (any order at the top): E9, E2, E5, E4, E10.",
      ],
      feedback:
        "E9 first (10.0 + high-value IdP surface). Then E2 and E5 (9.8/9.1 + KEV + burned secret). Then E4 (public bucket, both read+write, asset 5 exp 5). Then E10 (LLM surface, PHI scope). Note: E8 has higher CVSS than E10 but lower blast radius — LLM touches PHI.",
    },
    {
      id: "OBJ-H9",
      mode: "hard",
      pillar: "P4",
      title: "Peer-review this flawed mitigation plan. Find the 2 errors and rewrite both correctly.",
      kind: "peer-review",
      hints: [
        "Sleep does not fix a race. Returning true on exception is fail-open.",
        "Make check+use atomic; fail closed (return false).",
        "Errors 1 and 2 are required (3 and 4 are also weak but bonus).",
      ],
      feedback:
        "Error 1: a longer sleep does not fix TOCTOU — only making check+use atomic does. Error 2: returning true on exception is fail-open; a security check must fail closed (return false). The other two items are also weak (the bucket still leaks via GetObject; the stale account is still in the admin group), but the canonical 2.4 errors are the race and the fail-open.",
    },
  ];

  Data.MEDIUM_OBJECTIVES = Data.OBJECTIVES.filter(function (o) { return o.mode === "medium"; });
  Data.HARD_OBJECTIVES = Data.OBJECTIVES.filter(function (o) { return o.mode === "hard"; });

  // --- Objective-specific interaction data -----------------------------------

  Data.FIX_AVAILABILITY_MATCH = {
    items: [
      { value: "zero_day", label: "Zero-day", answer: "no_fix_yet" },
      { value: "unpatched", label: "Unpatched", answer: "fix_not_installed" },
      { value: "unsupported", label: "Unsupported (EoL)", answer: "no_fix_ever" },
      { value: "obsolete", label: "Obsolete", answer: "cannot_meet" },
    ],
    definitions: [
      { value: "no_fix_yet", label: "No fix available yet" },
      { value: "fix_not_installed", label: "Fix exists but not installed" },
      { value: "no_fix_ever", label: "No fix ever for this version (EoL)" },
      { value: "cannot_meet", label: "Cannot meet current requirements even if patched" },
    ],
  };

  Data.TYPE_SURFACE_SORT = {
    items: [
      "Zero-day",
      "Shadow IT",
      "Public repository",
      "Hardcoded secret",
      "Identity provider",
      "LLM",
      "Rogue device",
      "Public object storage",
    ],
    typeSet: ["Zero-day", "Shadow IT", "Hardcoded secret", "Rogue device"],
    surfaceSet: ["Public repository", "Identity provider", "LLM", "Public object storage"],
  };

  Data.CRYPTO_OPTIONS = [
    "Unsalted",
    "MD5",
    "Deprecated algorithm",
    "Short key length",
    "No key rotation",
  ];
  Data.CRYPTO_ANSWER = ["Unsalted", "MD5", "Deprecated algorithm"];

  Data.FIX_MATCH = {
    cards: ["e7", "e8"],
    options: [
      { value: "atomic", label: "Make check and use atomic (open with O_NOFOLLOW and check after)" },
      { value: "failclosed", label: "Fail closed (return false on exception)" },
      { value: "sleep", label: "Add a longer sleep between check and use" },
      { value: "retry", label: "Retry the authentication 3 times then allow" },
    ],
    answer: { e7: "atomic", e8: "failclosed" },
  };

  Data.CWE_OPTIONS = [
    { value: "CWE-79", label: "CWE-79 — Cross-site Scripting" },
    { value: "CWE-89", label: "CWE-89 — SQL Injection" },
    { value: "CWE-352", label: "CWE-352 — Cross-Site Request Forgery" },
    { value: "CWE-78", label: "CWE-78 — OS Command Injection" },
    { value: "CWE-416", label: "CWE-416 — Use After Free" },
  ];

  Data.CONTROL_MATCH = {
    scenarios: [
      { value: "a", label: "(a) Unsupported OT medical device", answer: "segment_passive" },
      { value: "b", label: "(b) Host running ftpd / telnetd / rpcbind", answer: "disable_services" },
      { value: "c", label: "(c) Shadow IT SaaS", answer: "procurement_egress" },
      { value: "d", label: "(d) Stale admin account", answer: "offboarding" },
    ],
    controls: [
      { value: "segment_passive", label: "Network segmentation + passive monitoring" },
      { value: "patch_agent", label: "Patch immediately + install EDR agent" },
      { value: "disable_services", label: "Disable unnecessary services" },
      { value: "procurement_egress", label: "Route through procurement + assess data egress" },
      { value: "offboarding", label: "Remove from admin group + enforce offboarding" },
      { value: "reset_email", label: "Send a password-reset email" },
    ],
  };

  Data.SIGNED_UPDATE_CONTROLS = {
    ot: [
      { value: "segment_passive", label: "Passive behavioral monitoring + allow-listing + segmentation" },
      { value: "patch_agent", label: "Push the vendor patch + install EDR agent" },
      { value: "airgap", label: "Air-gap the device permanently" },
    ],
    server: [
      { value: "staged_rollback", label: "Behavioral monitoring + staged deployment + rollback plan" },
      { value: "auto_patch", label: "Auto-apply all signed updates immediately in production" },
      { value: "block", label: "Block all updates until manual code review" },
    ],
  };

  Data.MITIGATION_CONTROLS = {
    read: [
      { value: "restrict_auth_log", label: "Restrict Principal + require auth + enable bucket logging + encryption at rest" },
      { value: "delete_bucket", label: "Delete the bucket entirely" },
      { value: "ignore", label: "Leave GetObject public — it is only analytics" },
    ],
    write: [
      { value: "block_signed_lock", label: "Block public PutObject + signed URLs for uploads + object lock / versioning" },
      { value: "rotate_keys", label: "Rotate the bucket access keys quarterly" },
      { value: "allow_write", label: "Allow public PutObject but require a comment" },
    ],
  };

  Data.IDP_SEQUENCE_STEPS = [
    "Revoke the old signing key",
    "Issue and distribute a new signing key",
    "Audit all relying-party trust + signed assertions since 2019",
    "Monitor for forged assertions / anomalous SSO events",
  ];

  Data.LLM_SEQUENCE_STEPS = [
    "Scope tool permissions (least privilege)",
    "Sandbox tool execution",
    "Log every tool call",
    "Add prompt-injection filtering",
    "Human-in-the-loop for destructive tools",
  ];

  Data.PEER_REVIEW_ITEMS = [
    {
      id: "pr1",
      text: "Race condition in config loader — added a longer sleep between check and use to reduce collisions.",
      error: "TOCTOU not made atomic",
      rewrite: "Make check and use atomic (open with O_NOFOLLOW and check after).",
      required: true,
    },
    {
      id: "pr2",
      text: "Exception handler in auth — wrapped authenticate() in a try/catch that returns true so users don't get locked out during errors.",
      error: "fail-open",
      rewrite: "Fail closed (return false on exception).",
      required: true,
    },
    {
      id: "pr3",
      text: "Public bucket — removed PutObject permission, kept GetObject public for analytics.",
      error: "still leaks via public GetObject (read exposure not addressed)",
      rewrite: "Also restrict GetObject — require auth + restrict Principal + enable logging + encryption at rest.",
      required: false,
    },
    {
      id: "pr4",
      text: "Stale admin account — sent a password reset email.",
      error: "account still in admin group (not removed)",
      rewrite: "Remove from admin group + enforce offboarding workflow.",
      required: false,
    },
  ];

  Data.LIFECYCLE_STAGES = [
    {
      id: "s1",
      label: "Stage 1 — Day 0 (vendor just notified, no fix yet)",
      classAnswer: "zero-day",
      mitigationOptions: [
        { value: "compensating", label: "Compensating controls (WAF rule + segmentation + monitoring)" },
        { value: "patch", label: "Apply the patch" },
        { value: "replace", label: "Replace the platform" },
      ],
      mitigationAnswer: "compensating",
    },
    {
      id: "s2",
      label: "Stage 2 — Day 30 (vendor shipped a patch, Meridian hasn't installed it)",
      classAnswer: "unpatched",
      mitigationOptions: [
        { value: "compensating", label: "Compensating controls (WAF rule + segmentation + monitoring)" },
        { value: "patch", label: "Apply the patch" },
        { value: "replace", label: "Replace the platform" },
      ],
      mitigationAnswer: "patch",
    },
    {
      id: "s3",
      label: "Stage 3 — Day 365 (vendor dropped support for that version)",
      classAnswer: "unsupported",
      mitigationOptions: [
        { value: "patch", label: "Apply the patch" },
        { value: "upgrade_isolate", label: "Upgrade to supported version or isolate" },
        { value: "replace", label: "Replace the platform" },
      ],
      mitigationAnswer: "upgrade_isolate",
    },
    {
      id: "s4",
      label: "Stage 4 — Day 730 (even upgraded, can't meet current compliance)",
      classAnswer: "obsolete",
      mitigationOptions: [
        { value: "upgrade_isolate", label: "Upgrade to supported version or isolate" },
        { value: "replace", label: "Replace the platform" },
        { value: "compensating", label: "Compensating controls" },
      ],
      mitigationAnswer: "replace",
    },
  ];

  Data.LIFECYCLE_CLASS_OPTIONS = [
    { value: "zero-day", label: "Zero-day" },
    { value: "unpatched", label: "Unpatched" },
    { value: "unsupported", label: "Unsupported" },
    { value: "obsolete", label: "Obsolete" },
  ];

  // --- Quiz ------------------------------------------------------------------

  // R4 / R5: quiz correct-answer positions and option lengths are taken as
  // authored in lab-data.ts — the original (post-fix) ordering is preserved
  // verbatim here.

  Data.QUIZ_MEDIUM = [
    {
      id: "qm1",
      prompt: "A vendor dropped support for OpenLDAP 2.4.41 in 2018. The system is still in production. What class is this?",
      options: [
        "Unsupported (EoL)",
        "Unpatched system",
        "Zero-day, no fix yet",
        "Obsolete platform",
      ],
      answer: 0,
      explanation: "The vendor stopped shipping fixes for that version — Unsupported (EoL). Unpatched would mean a fix exists but isn't installed; here no fix will ever ship for this version.",
    },
    {
      id: "qm2",
      prompt: "Which is NOT a CVSS v3.1 metric group?",
      options: ["Base", "Temporal", "Supplemental", "Environmental"],
      answer: 2,
      explanation: "Supplemental is a CVSS v4.0 group. v3.1 has Base, Temporal, and Environmental. v3.1 and v4.0 are not interchangeable.",
    },
    {
      id: "qm3",
      prompt: "A secret was committed to a public GitHub repo 3 months ago. What is the correct FIRST action?",
      options: [
        "Delete the commit",
        "Revoke or rotate it",
        "File a GitHub takedown",
        "Add to .gitignore",
      ],
      answer: 1,
      explanation: "A public-repo secret is burned — revoke/rotate FIRST, then clean history. Removing the commit does not undo the leak.",
    },
    {
      id: "qm4",
      prompt: "Which CWE covers SQL injection?",
      options: ["CWE-79", "CWE-78", "CWE-352", "CWE-89"],
      answer: 3,
      explanation: "CWE-89 is 'Improper Neutralization of Special Elements used in an SQL Command'. CWE-79 is XSS, CWE-78 is OS command injection.",
    },
    {
      id: "qm5",
      prompt: "An OT medical device cannot be patched. Best control?",
      options: [
        "Install an EDR agent",
        "Segment and monitor",
        "Push latest firmware",
        "Disable the device",
      ],
      answer: 1,
      explanation: "OT is availability-first — segment and passively monitor. Do not patch or install agents that could disrupt clinical function.",
    },
    {
      id: "qm6",
      prompt: "CVE-A: CVSS 9.8, EPSS 0.01, not in KEV. CVE-B: CVSS 7.5, in KEV. Which is more urgent?",
      options: ["CVE-A — higher CVSS", "Both are equal", "CVE-B — in KEV", "Cannot determine"],
      answer: 2,
      explanation: "Severity ≠ risk. Risk = likelihood × impact. CVE-B is being exploited now (KEV), so its likelihood is far higher despite the lower CVSS.",
    },
  ];

  Data.QUIZ_HARD = [
    {
      id: "qh1",
      prompt: "A bucket policy has Principal:* with GetObject + PutObject. Name BOTH exposures and the CIA property each breaks.",
      options: [
        "Read=integrity; Write=availability",
        "Read=confidentiality; Write=integrity",
        "Read=availability; Write=confidentiality",
        "Both break only confidentiality",
      ],
      answer: 1,
      explanation: "GetObject lets anyone download (confidentiality breach). PutObject lets anyone upload/overwrite (integrity breach). Control both axes.",
    },
    {
      id: "qh2",
      prompt: "A Python function checks os.path.exists then opens the file. What class of vulnerability and what is the fix?",
      options: [
        "Buffer overflow; bounds-check",
        "SQL injection; parameterize",
        "XSS; output-encode",
        "TOCTOU race; atomic open",
      ],
      answer: 3,
      explanation: "Time-Of-Check to Time-Of-Use gap (a symlink swap is possible). Fix by making check and use one atomic operation (e.g. open with O_NOFOLLOW and check after).",
    },
    {
      id: "qh3",
      prompt: "Your IdP signing key was last rotated in 2019; the file is world-readable. Walk the 4-step mitigation.",
      options: [
        "Revoke, rotate, audit, monitor",
        "Patch, reboot, scan, report",
        "Delete, recreate, email, close",
        "Isolate, backup, restore, verify",
      ],
      answer: 0,
      explanation: "Revoke the old key, issue and distribute a new one, audit all relying-party trust + assertions since 2019, then monitor for forged assertions.",
    },
    {
      id: "qh4",
      prompt: "You see `catch (Exception e) { return true; }` in an auth function. What's wrong and what's the fix?",
      options: [
        "Catches too broadly",
        "Returns a primitive type",
        "Fail-open; fail closed",
        "Missing logging; add it",
      ],
      answer: 2,
      explanation: "Returning true on exception is fail-open — a security check must fail CLOSED (deny) when it errors.",
    },
    {
      id: "qh5",
      prompt: "A scan shows ftpd and telnetd running on a web server. What is the mitigation?",
      options: [
        "Disable the services",
        "Firewall internal FTP",
        "Move telnetd to 8372",
        "Wrap ftpd in TLS proxy",
      ],
      answer: 0,
      explanation: "Disable services the role doesn't need. ftpd/telnetd/rpcbind on a web server are unnecessary and increase attack surface.",
    },
    {
      id: "qh6",
      prompt: "CVE-A: CVSS 9.8, EPSS 0.05, not KEV. CVE-B: CVSS 7.5, EPSS 0.62, KEV yes. Which to fix first and why?",
      options: [
        "CVE-A — higher CVSS",
        "Both at once",
        "Whichever is first alphabetically",
        "CVE-B — in KEV now",
      ],
      answer: 3,
      explanation: "Severity ≠ risk. CVE-B is being exploited now (KEV) with high EPSS, so its likelihood and therefore its risk are higher.",
    },
    {
      id: "qh7",
      prompt: "A vendor ships a signed update. Why is signature necessary but not sufficient?",
      options: [
        "Signatures expire in 30 days",
        "Proves origin, not safety",
        "Only RSA is trustworthy",
        "Only needed for OT devices",
      ],
      answer: 1,
      explanation: "A valid signature proves who shipped the update, not that it is safe. A breached vendor can ship a backdoored, correctly-signed update to fully up-to-date systems.",
    },
  ];

  // --- Debrief ----------------------------------------------------------------

  Data.DEBRIEF = {
    detection: [
      "Secrets in public repos: git-secrets / pre-commit + GitHub secret scanning.",
      "Bucket exposure: CloudTrail PutObject from anomalous Principal; bucket policy drift detection.",
      "IdP key: SAML assertion signing-cert fingerprint drift alert; world-readable key file scan.",
      "LLM: tool-call audit log gap detection; anomalous tool-call volume.",
      "TOCTOU / fail-open: static analysis (e.g. Semgrep rules for exists-then-open and catch-then-return-true).",
    ],
    mitigation: [
      { id: "CWE-89", label: "SQL Injection", url: "https://cwe.mitre.org/data/definitions/89.html" },
      { id: "CWE-798", label: "Use of Hard-coded Credentials", url: "https://cwe.mitre.org/data/definitions/798.html" },
      { id: "CWE-312", label: "Cleartext Storage of Sensitive Information", url: "https://cwe.mitre.org/data/definitions/312.html" },
      { id: "CWE-362", label: "Race Condition (TOCTOU)", url: "https://cwe.mitre.org/data/definitions/362.html" },
      { id: "CWE-754", label: "Improper Check for Unusual or Exceptional Conditions (fail-open)", url: "https://cwe.mitre.org/data/definitions/754.html" },
      { id: "CWE-732", label: "Incorrect Permission Assignment for Critical Resource", url: "https://cwe.mitre.org/data/definitions/732.html" },
    ],
    blueTeam: [
      "Severity ≠ risk — sequence by CVSS × EPSS × KEV × exposure × asset value.",
      "Sequence mitigations: rotate burned secrets first, then clean history.",
      "Security checks fail CLOSED on error — never fail open.",
      "OT is availability-first: segment + passive monitor, never patch/agent.",
      "Centralize identity + enforce offboarding to kill stale creds.",
    ],
    redTeam: [
      "Hunt hardcoded secrets in git history (every commit, every branch).",
      "Public buckets are R/W — both leak and tamper paths.",
      "IdP signing keys are crown jewels — one key compromises every relying party.",
      "LLM tool scopes are the new perimeter — PHI + PII raises blast radius.",
      "TOCTOU and fail-open hide in error-handling code — read the catch blocks.",
    ],
    links: [
      { label: "CompTIA Security+ (SY0-801 / V8)", url: "https://www.comptia.org/en-us/certifications/security/v8" },
      { label: "MITRE CWE", url: "https://cwe.mitre.org" },
      { label: "CISA Known Exploited Vulnerabilities catalog", url: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog" },
      { label: "NVD (National Vulnerability Database)", url: "https://nvd.nist.gov" },
    ],
  };

  // Convenience: returns the quiz list for a given mode.
  Data.quizForMode = function (mode) {
    return mode === "medium" ? Data.QUIZ_MEDIUM : Data.QUIZ_HARD;
  };
})(typeof window !== "undefined" ? window : globalThis);
