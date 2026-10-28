// ─── Threat Hunt Expedition — synthetic content (ALL DATA IS FICTIONAL) ──────
// Verbatim static port of src/lib/hunt-lab/content.ts — same wording, same
// ordering, same correct answers as the original lab. Nothing edited.
// Chapter: CompTIA CySA+ CS0-003 · Lesson 2.2 "Exploring Threat-Hunting Concepts"
// Everything below is simulated training data: fictional orgs, actors, IPs
// (documentation ranges 198.51.100.0/24 & 203.0.113.0/24) and domains.

window.HuntData = (function () {
  "use strict";

  // ── Scenario briefing ──────────────────────────────────────────────────────
  const scenario = {
    org: "Aldervale Water & Power",
    orgBlurb:
      "A regional water & electricity utility: treatment plants, a control-center network and ~4,000 staff. Not famous, not rich — but critical. Exactly the kind of target that quiet adversaries prefer.",
    sitrep: [
      "MON 06:40 — You are the threat hunter on Aldervale's small SOC team. The automated stack — SIEM rules, EDR policies, email gateway — is healthy. It is also, by definition, blind to anything no rule was ever written for.",
      "This morning's Energy-ISAC advisory lands in the satchel: a state-sponsored intrusion set is working the utility sector. Your director's standing direction (\"Direction\", in intelligence-cycle terms): find any sign of them before the next full moon audit.",
      "Nothing is on fire. No alert is screaming. That is precisely why you are here: a threat hunt actively searches for malicious events and activities that existing controls never flagged — whether the actor is an external organization or a single internal employee.",
      "Your kit: an Intel Satchel of bulletins, a Tracker's Slate for hypotheses, the Track Scanner with five telemetry datasets, navigation Instruments (ATT&CK, Kill Chain, Diamond Model), a Specimen Ledger of actor profiles, and the Dispatch Radio for sharing what you find.",
    ],
    mission: [
      "Sweep the estate for the intrusion the intel describes — and for anything else that doesn't fit.",
      "Classify every contact: known-good, known-bad, unknown.",
      "Map what you find, attribute it, share it safely, and close the loop so the SOC hunts better next week.",
    ],
    certNote:
      "Maps to CompTIA CySA+ (CS0-003): threat hunting, threat intelligence use, indicator analysis, attack methodology frameworks (ATT&CK, Kill Chain, Diamond Model) and threat-actor attributes.",
  };

  // ── Intel satchel ──────────────────────────────────────────────────────────
  const bulletins = [
    {
      id: "B1",
      from: "Energy-ISAC Advisory 2025-114",
      tag: "ISAC",
      date: "Mon 06:40",
      role: "key",
      title: "TTP advisory — utility-sector intrusion set (CINDER EMBER)",
      body: [
        "WHO: CINDER EMBER — state-sponsored espionage actor targeting water and energy utilities (profile in B2).",
        "HOW: finance-team spearphishing with macro-enabled .xlsm invoice attachments; the macro launches PowerShell; the loader persists via a scheduled task named to mimic browser updates (e.g. “ChromeUpdateTask”); beaconing over HTTPS to CDN-lookalike domains every 60–120 seconds.",
        "HUNT GUIDANCE: sweep email records for macro attachments to finance lists · sweep EDR process events for office apps spawning PowerShell · sweep scheduled-task creation for browser-lookalike names · sweep egress flows for periodic small TLS POSTs.",
      ],
    },
    {
      id: "B2",
      from: "NightOwl Threat Labs",
      tag: "VENDOR",
      date: "Mon 07:15",
      role: "key",
      title: "Actor profile — CINDER EMBER (updated)",
      body: [
        "TYPE: nation-state / APT. MOTIVATION: espionage — mapping and pre-positioning inside critical infrastructure. No ransom demands ever observed; noise is avoided.",
        "ATTRIBUTES: high sophistication, custom loaders, disciplined operational security, long dwell times, well resourced.",
        "SECTOR FOCUS: water, energy, logistics. Infrastructure observed in Eastern-European hosting ranges. Reuses TTPs between campaigns — browser-lookalike scheduled tasks are a signature.",
      ],
    },
    {
      id: "B3",
      from: "@bogbrush_re (researcher thread)",
      tag: "OSINT",
      date: "Mon 08:02",
      role: "support",
      title: "Fake supplier invoices hitting utilities' finance teams",
      body: [
        "Several EU utilities received invoice-themed .xlsm files from lookalike supplier domains this month. Gateway verdicts mostly “clean” — the macros slip past static scoring. IoCs attached: sender domain, document hash.",
      ],
    },
    {
      id: "B4",
      from: "VendorPatchDigest",
      tag: "ADMIN",
      date: "Mon 06:00",
      role: "distractor",
      title: "Quarterly patch digest — 214 CVEs summarized",
      body: [
        "Routine quarterly vulnerability summary for the estate. No new utility-sector TTPs, no campaign indicators.",
      ],
    },
    {
      id: "B5",
      from: "Regional CERT",
      tag: "ADMIN",
      date: "Mon 07:30",
      role: "distractor",
      title: "Ransomware wave hitting school districts (BASSLINE SYNDICATE)",
      body: [
        "Criminal crew, education sector, double extortion. Not observed in the utility sector this quarter.",
      ],
    },
    {
      id: "B6",
      from: "CISO Office",
      tag: "ADMIN",
      date: "Fri",
      role: "herring",
      title: "Authorized pen-test PT-2025-11 (DMZ) — vendor scanner active",
      body: [
        "Scope: DMZ only, Mon–Fri 09:00–17:00. Scanner process nessus_scan_worker.exe is expected. Do not escalate scanner findings without checking the authorization list.",
      ],
    },
    {
      id: "B7",
      from: "IT Ops",
      tag: "ADMIN",
      date: "Fri",
      role: "herring",
      title: "Contractor VPN maintenance + geo-block verification (CHG-2317)",
      body: [
        "Weekend maintenance. Geo-block rule GEO-BLOCK-07 verified — denied logins from unapproved regions are expected test noise and already ticketed (INC-8812).",
      ],
    },
  ];

  // ── Track Scanner: queries & telemetry ─────────────────────────────────────
  const telemetryQueries = [
    { id: "q-email", label: "MAIL-TRACE", source: "Email gateway records", blurb: "Inbound mail, attachments, verdicts" },
    { id: "q-proc", label: "PROC-SCOPE", source: "EDR process events", blurb: "Parent/child process executions" },
    { id: "q-sched", label: "TASK-LATHE", source: "Scheduled task creation", blurb: "schtasks / Task Scheduler events" },
    { id: "q-net", label: "FLOW-RADAR", source: "Netflow · egress + DNS", blurb: "Connections, SNI, periodicity" },
    { id: "q-auth", label: "AUTH-ECHO", source: "Authentication & VPN", blurb: "Logons, VPN sessions, MFA outcomes" },
  ];

  const telemetryEvents = [
    {
      id: "EV-AUTH-01",
      q: "q-auth",
      time: "07:52",
      host: "VPN-GW",
      summary: "VPN session: m.okafor (Manchester geo, device cert OK)",
      detail:
        "Routine morning VPN login for finance analyst M. Okafor. Same geo, same device certificate as the previous 90 days.",
      verdict: "good",
      truth:
        "Documented pattern — same user, geography and device as the previous 90 days.",
      mediumSet: true,
    },
    {
      id: "EV-EMAIL-01",
      q: "q-email",
      time: "08:14",
      host: "MX-01",
      summary: "Inbound .xlsm to finance@ from invoices@stellar-suppliers.example",
      detail:
        "Attachment INV-8842.xlsm (macro-enabled, 412 KB) addressed to the finance distribution list. Gateway static verdict: clean. Sender domain registered 9 days ago.",
      verdict: "bad",
      truth:
        "The exact delivery vector the ISAC advisory describes: macro-enabled invoice to finance from a 9-day-old lookalike domain. Gateway scored it clean — an evasion, which is what hunts are for.",
      intrusion: true,
      stage: "delivery",
      technique: "T1566.001",
      killChain: "Delivery",
    },
    {
      id: "EV-PROC-01",
      q: "q-proc",
      time: "08:19",
      host: "ALD-WKS-0142",
      summary: "WINWORD.EXE → powershell.exe  -nop -w hidden -enc JAB…",
      detail:
        "Five minutes after EV-EMAIL-01 arrived, Word spawned an encoded PowerShell command on the finance workstation. Loader staged to %APPDATA%\\update.ps1.",
      verdict: "bad",
      truth:
        "An office application spawning a hidden encoded script interpreter is never normal user behavior — this is execution of the attachment's payload.",
      intrusion: true,
      stage: "execution",
      technique: "T1059.001",
      killChain: "Exploitation",
      mediumSet: true,
    },
    {
      id: "EV-SCHED-01",
      q: "q-sched",
      time: "08:21",
      host: "ALD-WKS-0142",
      summary: "schtasks /create /tn ChromeUpdateTask /sc minute /mo 30 /tr %APPDATA%\\update.ps1",
      detail:
        "Scheduled task created by powershell.exe, disguised as a browser update, re-running the loader every 30 minutes under the logged-on user.",
      verdict: "bad",
      truth:
        "Browser-lookalike task name + script parent = the persistence signature from advisory B1. Automated controls had no rule for it.",
      intrusion: true,
      stage: "persistence",
      technique: "T1053.005",
      killChain: "Installation",
    },
    {
      id: "EV-NET-01",
      q: "q-net",
      time: "08:22",
      host: "ALD-WKS-0142",
      summary: "TLS POST ≈2 KB to 198.51.100.77:443 (SNI cdn-metrics.example), repeating ~90 s",
      detail:
        "Machine-regular small TLS POSTs to a domain first seen today. Beacon interval matches the 60–120 s pattern in the advisory.",
      verdict: "bad",
      truth:
        "Periodic small egress to brand-new CDN-lookalike infrastructure — classic command-and-control beaconing (T1071.001).",
      intrusion: true,
      stage: "c2",
      technique: "T1071.001",
      killChain: "Command and Control",
      mediumSet: true,
    },
    {
      id: "EV-AUTH-02",
      q: "q-auth",
      time: "13:02",
      host: "VPN-GW",
      summary: "VPN reconnect: m.okafor (Manchester)",
      detail: "Lunchtime reconnect from the same device. Unremarkable.",
      verdict: "good",
      truth: "Same user, same device, normal hours.",
    },
    {
      id: "EV-SCHED-02",
      q: "q-sched",
      time: "09:03",
      host: "ALD-SCCM-01",
      summary: "Task SCCM-Maintenance-Deployment created by SYSTEM",
      detail:
        "Standard SCCM software deployment job. Change record CHG-2291 approved 12 Jun.",
      verdict: "good",
      truth:
        "Documented change CHG-2291; created by the SCCM service, not by a script spawned from an office app.",
      mediumSet: true,
    },
    {
      id: "EV-NET-02",
      q: "q-net",
      time: "06:00",
      host: "ALD-WSUS-01",
      summary: "Patch agent pull from updates.aldervale-internal.example",
      detail: "Weekly internal WSUS synchronization. Expected.",
      verdict: "good",
      truth: "Internal patch infrastructure on its normal schedule.",
    },
    {
      id: "EV-AUTH-03",
      q: "q-auth",
      time: "23:47",
      host: "build-03",
      summary: "svc_jenkins service logon",
      detail: "Documented CI pipeline schedule on the build server.",
      verdict: "good",
      truth: "Documented service account used from its usual host at its usual time.",
    },
    {
      id: "EV-PROC-02",
      q: "q-proc",
      time: "01:00",
      host: "ALD-FS-02",
      summary: "VeeamBackup.exe backup window",
      detail: "Backup job per change record CHG-2201, 01:00–03:00 window.",
      verdict: "good",
      truth: "Documented backup job inside its approved window.",
    },
    {
      id: "EV-PROC-03",
      q: "q-proc",
      time: "14:33",
      host: "DMZ-APP-01",
      summary: "nessus_scan_worker.exe active on DMZ host",
      detail:
        "Vendor vulnerability scanner running against DMZ hosts. Authorization PT-2025-11 (bulletin B6), DMZ scope only.",
      verdict: "good",
      truth:
        "Authorized pen-test activity (bulletin B6) — noisy but documented and in scope.",
      redHerring: true,
      redHerringWhy:
        "Looks hostile (foreign scanner on servers) but is authorized PT-2025-11 per bulletin B6.",
    },
    {
      id: "EV-NET-03",
      q: "q-net",
      time: "03:11",
      host: "ALD-MKTG-07",
      summary: "2.1 GB upload to 203.0.113.50:443 (cloud-drive domain)",
      detail:
        "Large overnight upload from a design workstation to an undeclared cloud storage service. No ticket, no vendor record, no matching change.",
      verdict: "unknown",
      truth:
        "No context proves it good or bad yet — an undeclared bulk upload from a creative workstation is exactly what “unknown” means. Open a low-priority investigation, don't panic, don't ignore.",
      mediumSet: true,
    },
    {
      id: "EV-AUTH-04",
      q: "q-auth",
      time: "03:14",
      host: "VPN-GW",
      summary: "VPN attempt svc_reports from Rostov region — MFA DENIED",
      detail:
        "Blocked by geo policy GEO-BLOCK-07 during contractor maintenance testing (CHG-2317, bulletin B7). Ticket INC-8812 already open.",
      verdict: "good",
      truth:
        "Denied by a working control and pre-ticketed during a documented maintenance window (bulletin B7).",
      redHerring: true,
      redHerringWhy:
        "Foreign geo + service account looks alarming, but it was denied by GEO-BLOCK-07 and is pre-ticketed maintenance noise (B7 / INC-8812).",
    },
    {
      id: "EV-NET-04",
      q: "q-net",
      time: "11:40",
      host: "ALD-MKTG-07",
      summary: "New SaaS “Pixelboard” syncing; not in app inventory",
      detail:
        "Browser extension syncing bookmarks/data to pixelboard.example since this week. Design team says it's a trial.",
      verdict: "unknown",
      truth:
        "Plausibly benign (the team claims a trial) but undeclared — classify unknown until vetted through proper channels.",
      mediumSet: true,
    },
    {
      id: "EV-EMAIL-02",
      q: "q-email",
      time: "12:05",
      host: "MX-01",
      summary: "“Urgent wire” CEO-fraud attempt blocked by gateway rule",
      detail:
        "CFO impersonation attempt. Blocked by DMARC policy + mail rule; ticket INC-8771.",
      verdict: "bad",
      truth:
        "The email itself is known-bad (impersonation attempt) — but it was blocked and ticketed (INC-8771), so it is contained noise, not part of the active intrusion.",
      redHerring: true,
      redHerringWhy:
        "Known-bad but blocked and already ticketed (INC-8771) — contained noise, not the active chain.",
    },
  ];

  const intrusionEventIds = [
    "EV-EMAIL-01",
    "EV-PROC-01",
    "EV-SCHED-01",
    "EV-NET-01",
  ];
  const mediumTriageIds = telemetryEvents
    .filter(function (e) { return e.mediumSet; })
    .map(function (e) { return e.id; });

  // ── Slate options ──────────────────────────────────────────────────────────
  const huntOrNotStatements = [
    { id: "s1", label: "Sweeping endpoint telemetry for macro-laden attachments that bypassed the gateway", answer: "hunt" },
    { id: "s2", label: "Working SIEM alert tickets as they arrive", answer: "monitor" },
    { id: "s3", label: "Proactively searching for beacon traffic that no rule has ever alerted on", answer: "hunt" },
    { id: "s4", label: "Waiting for the IDS signature pack to catch the next exploit", answer: "monitor" },
    { id: "s5", label: "Chasing this week's ISAC bulletin backwards through historical logs", answer: "hunt" },
  ];

  const huntTypeScenarios = [
    { id: "sc1", label: "An intel bulletin names specific TTPs; you sweep all scheduled-task creations estate-wide for those patterns.", answer: "structured" },
    { id: "sc2", label: "A hunter notices an odd process tree and follows the hunch with broad, creative queries.", answer: "unstructured" },
    { id: "sc3", label: "You profile the crown-jewel database's normal access patterns and hunt anomalies around that entity.", answer: "entity" },
  ];

  const huntTypeOptions = [
    { id: "structured", label: "Structured hunt" },
    { id: "unstructured", label: "Unstructured hunt" },
    { id: "entity", label: "Entity-driven hunt" },
  ];

  const triggerOptions = [
    { id: "trg-isac", label: "Energy-ISAC 2025-114: a named TTP chain targeting utilities" },
    { id: "trg-alert", label: "A SIEM alert fired on a single endpoint" },
    { id: "trg-report", label: "The CISO asked for a monthly compliance report" },
    { id: "trg-spam", label: "A user complained about spam in their inbox" },
  ];

  const hypothesisStatements = [
    { id: "h-apt", label: "A CINDER EMBER phishing attachment has executed on an endpoint and persisted via a browser-lookalike scheduled task." },
    { id: "h-insider", label: "An insider is exfiltrating customer lists ahead of a resignation." },
    { id: "h-ransom", label: "A ransomware crew is staging encryption across the file servers." },
    { id: "h-vpn", label: "An unpatched VPN appliance is being exploited from the internet." },
  ];

  const sourceOptions = [
    { id: "q-email", label: "Email gateway records" },
    { id: "q-proc", label: "EDR process events" },
    { id: "q-sched", label: "Scheduled task creation" },
    { id: "q-net", label: "Netflow / egress + DNS" },
  ];

  // ── Satchel: cycle & products ──────────────────────────────────────────────
  const intelCyclePhases = [
    { id: "direction", label: "Direction", blurb: "Leadership & priorities set the questions intel must answer" },
    { id: "collection", label: "Collection", blurb: "Gather raw data: feeds, OSINT, telemetry" },
    { id: "processing", label: "Processing", blurb: "Normalize, deduplicate, convert (e.g. to STIX)" },
    { id: "analysis", label: "Analysis", blurb: "Judge relevance; correlate with your environment" },
    { id: "dissemination", label: "Dissemination", blurb: "Deliver the right product to the right consumer" },
    { id: "feedback", label: "Feedback", blurb: "Consumers comment; priorities & products get tuned" },
  ];
  // fixed shuffle for the pool (no Math.random at render — matches the original)
  const intelCyclePoolOrder = ["analysis", "direction", "feedback", "collection", "dissemination", "processing"];

  const intelProductItems = [
    { id: "ip-board", label: "“18-month trends in state-sponsored targeting of energy — board briefing”" },
    { id: "ip-campaign", label: "“CINDER EMBER campaign dossier: current TTPs, tools and infrastructure”" },
    { id: "ip-feed", label: "“Machine-readable list: IPs, hashes and sender domains for control deployment”" },
  ];
  const intelProductOptions = [
    { id: "strategic", label: "Strategic" },
    { id: "operational", label: "Operational" },
    { id: "tactical", label: "Tactical" },
  ];
  const intelProductAnswers = {
    "ip-board": "strategic",
    "ip-campaign": "operational",
    "ip-feed": "tactical",
  };

  const routeItems = [
    { id: "r1", label: "Exec sponsor sets the quarter's priority hunting questions" },
    { id: "r2", label: "Pull ISAC advisories, vendor reports and OSINT into the repository" },
    { id: "r3", label: "Deduplicate feeds and normalize them into STIX objects" },
    { id: "r4", label: "Analysts correlate intel with internal telemetry and judge relevance" },
    { id: "r5", label: "Publish the hunt report and push updated detections to the SOC" },
    { id: "r6", label: "SOC reports the detections are too noisy — priorities get tuned" },
  ];
  const routeItemAnswers = {
    r1: "direction",
    r2: "collection",
    r3: "processing",
    r4: "analysis",
    r5: "dissemination",
    r6: "feedback",
  };

  // ── Instruments ────────────────────────────────────────────────────────────
  const killChainPhases = [
    { id: "recon", label: "Reconnaissance" },
    { id: "weaponization", label: "Weaponization" },
    { id: "delivery", label: "Delivery" },
    { id: "exploitation", label: "Exploitation" },
    { id: "installation", label: "Installation" },
    { id: "c2", label: "Command and Control" },
    { id: "actions", label: "Actions on Objectives" },
  ];
  // fixed shuffle for the pool
  const killChainPoolOrder = ["delivery", "recon", "c2", "weaponization", "actions", "exploitation", "installation"];

  const diamondItems = [
    { id: "d-adv", label: "CINDER EMBER (the threat-actor group)" },
    { id: "d-cap", label: "Macro-laden INV-8842.xlsm + PowerShell loader" },
    { id: "d-infra", label: "198.51.100.77 / cdn-metrics.example beacon" },
    { id: "d-vic", label: "ALD-WKS-0142 — finance workstation" },
  ];
  const diamondVertices = [
    { id: "adversary", label: "Adversary", blurb: "Who is attacking" },
    { id: "capability", label: "Capability", blurb: "What they attack with — tools & techniques" },
    { id: "infrastructure", label: "Infrastructure", blurb: "What they attack over — IPs, domains, hosts" },
    { id: "victim", label: "Victim", blurb: "Who / what is targeted" },
  ];
  const diamondAnswers = {
    "d-adv": "adversary",
    "d-cap": "capability",
    "d-infra": "infrastructure",
    "d-vic": "victim",
  };

  const techniqueOptions = [
    { id: "T1566.001", label: "T1566.001 — Phishing: Spearphishing Attachment" },
    { id: "T1566", label: "T1566 — Phishing (parent technique)" },
    { id: "T1566.002", label: "T1566.002 — Phishing: Spearphishing Link" },
    { id: "T1059.001", label: "T1059.001 — Command and Scripting Interpreter: PowerShell" },
    { id: "T1059", label: "T1059 — Command and Scripting Interpreter (parent)" },
    { id: "T1204.002", label: "T1204.002 — User Execution: Malicious File" },
    { id: "T1053.005", label: "T1053.005 — Scheduled Task/Job: Scheduled Task" },
    { id: "T1053", label: "T1053 — Scheduled Task/Job (parent)" },
    { id: "T1547.001", label: "T1547.001 — Registry Run Keys / Startup Folder" },
    { id: "T1071.001", label: "T1071.001 — Application Layer Protocol: Web Protocols" },
    { id: "T1071", label: "T1071 — Application Layer Protocol (parent)" },
    { id: "T1105", label: "T1105 — Ingress Tool Transfer" },
    { id: "T1136.001", label: "T1136.001 — Create Account: Local Account" },
  ];
  const tacticOptions = [
    { id: "TA0001", label: "TA0001 — Initial Access" },
    { id: "TA0002", label: "TA0002 — Execution" },
    { id: "TA0003", label: "TA0003 — Persistence" },
    { id: "TA0011", label: "TA0011 — Command and Control" },
    { id: "TA0010", label: "TA0010 — Exfiltration" },
  ];

  // ── Specimen Ledger ────────────────────────────────────────────────────────
  const actors = [
    {
      id: "a-cinder",
      name: "CINDER EMBER",
      blurb:
        "State-sponsored set. Custom loaders, disciplined opsec, months-long dwell. Targets water/energy. Never monetizes.",
      type: "Nation-state / APT",
      sophistication: "High",
      funding: "State resources",
      intent: "Espionage & pre-positioning",
      origin: "external",
      motivation: "espionage",
    },
    {
      id: "a-glitter",
      name: "GLITTER MOTH",
      blurb:
        "Loose online collective. Loud website defacements, opportunistic scanning, sloppy tooling that crashes mid-run.",
      type: "Hacktivist",
      sophistication: "Low",
      funding: "Donations, spare time",
      intent: "Ideology & publicity",
      origin: "external",
      motivation: "ideology",
    },
    {
      id: "a-bassline",
      name: "BASSLINE SYNDICATE",
      blurb:
        "Criminal enterprise. Ransomware-and-extort as a business; affiliates, negotiators, a help desk for victims.",
      type: "Criminal syndicate",
      sophistication: "Medium-high",
      funding: "Criminal revenue",
      intent: "Financial gain",
      origin: "external",
      motivation: "financial",
    },
    {
      id: "a-insider",
      name: "“Jon R.” — data steward",
      blurb:
        "Nine-year employee, passed over twice. Started copying partner lists to personal storage before resigning.",
      type: "Insider threat",
      sophistication: "Low",
      funding: "Salary, legitimate access",
      intent: "Grudge / personal gain",
      origin: "internal",
      motivation: "grievance",
    },
  ];

  const motivationOptions = [
    { id: "ideology", label: "Ideology" },
    { id: "espionage", label: "Espionage" },
    { id: "financial", label: "Financial" },
    { id: "grievance", label: "Personal grievance" },
  ];

  const profilerCase = {
    title: "Overnight case — the portal vandal",
    clues: [
      "Three municipal water portals were defaced overnight with ideological slogans about drought policy.",
      "The defacement script was poorly written and crashed twice mid-page.",
      "Opportunistic scans preceded the defacements from a consumer VPN exit; no data was taken.",
      "A rival “city council” portal was hit the same night with different slogans.",
    ],
    ask: "Which actor type fits, and which dossier in your ledger matches?",
  };
  const profilerTypeOptions = [
    { id: "script-kiddie", label: "Script kiddie" },
    { id: "hacktivist", label: "Hacktivist" },
    { id: "insider", label: "Insider threat" },
    { id: "criminal", label: "Criminal syndicate" },
    { id: "nation-state", label: "Nation-state / APT" },
  ];
  const profilerAnswers = { type: "hacktivist", dossier: "a-glitter" };

  const attributionTraits = [
    { id: "nation-state", label: "Nation-state / APT" },
    { id: "hacktivist", label: "Hacktivist" },
    { id: "criminal", label: "Criminal syndicate" },
    { id: "insider", label: "Insider" },
    { id: "espionage", label: "Espionage motivation" },
    { id: "financial-motivation", label: "Financial motivation" },
    { id: "high-sophistication", label: "High sophistication" },
    { id: "low-sophistication", label: "Low sophistication" },
  ];
  const attributionAnswers = {
    actor: "a-cinder",
    traits: ["nation-state", "espionage", "high-sophistication"],
  };

  // ── Dispatch options ───────────────────────────────────────────────────────
  const formatOptions = [
    { id: "stix", label: "STIX 2.1 — structured, machine-readable objects" },
    { id: "openioc", label: "OpenIOC — legacy XML indicator format" },
    { id: "pdf", label: "PDF slide deck for the community call" },
  ];
  const transportOptions = [
    { id: "taxii", label: "TAXII 2.1 — automated feed transport" },
    { id: "email", label: "Email to a mailing list" },
    { id: "portal", label: "Portal upload, manual copy-paste" },
  ];

  const packageItems = [
    { id: "pi-ioc-ip", label: "IoC: C2 IP 198.51.100.77", good: true },
    { id: "pi-ioc-domain", label: "IoC: beacon domain cdn-metrics.example", good: true },
    { id: "pi-tech", label: "Technique references (T1566.001 / T1053.005 / T1071.001)", good: true },
    { id: "pi-timeline", label: "Sanitized campaign timeline (no internal details)", good: true },
    { id: "pi-hosts", label: "Internal hostnames & user accounts", good: false, why: "Internal detail — never leaves the building." },
    { id: "pi-mailbox", label: "Full mailbox dumps from the finance team", good: false, why: "Sensitive content — share indicators, not evidence." },
  ];
  const feedbackActionItems = [
    { id: "fa-detect", label: "Author a detection: office app spawning a script interpreter", good: true },
    { id: "fa-task", label: "Alert on scheduled-task creation by office/script parents", good: true },
    { id: "fa-runbook", label: "Update the IR runbook & brief the SOC on the TTP chain", good: true },
    { id: "fa-archive", label: "Archive the findings and move on", good: false, why: "Untaught lessons are hunts wasted." },
    { id: "fa-close", label: "Close the ticket — the C2 host is blocked", good: false, why: "Blocking one host ≠ closing the case; the actor persists." },
  ];
  const nextHypothesisOptions = [
    { id: "nh-lateral", label: "Hunt for lateral movement and additional beacons from ALD-WKS-0142 across the estate before declaring containment.", good: true },
    { id: "nh-close", label: "No further hunts needed — the endpoint is rebuilt.", good: false },
    { id: "nh-av", label: "Run a full AV scan on the same endpoint.", good: false },
    { id: "nh-wait", label: "Wait for the next ISAC bulletin to define new hunts.", good: false },
  ];
  const shareObjectItems = [
    { id: "so-ind-ip", label: "STIX Indicator — C2 IP", good: true },
    { id: "so-ind-domain", label: "STIX Indicator — beacon domain", good: true },
    { id: "so-ap", label: "STIX Attack Pattern — T1053.005", good: true },
    { id: "so-rel", label: "STIX Relationship — indicators ↔ attack pattern", good: true },
    { id: "so-victim", label: "Victim identity (Aldervale hostnames)", good: false, why: "Never share who was hit." },
    { id: "so-notes", label: "Analyst working notes", good: false, why: "Working notes are internal; share objects, not scratchpads." },
  ];
  const priorityHuntOptions = [
    { id: "ph-lateral", label: "Sweep the estate for lateral movement & new beacons (residual risk)", good: true },
    { id: "ph-reimage", label: "Reimage ALD-WKS-0142 and declare the case closed", good: false },
    { id: "ph-standdown", label: "Stand down until the next advisory", good: false },
    { id: "ph-ransom", label: "Hunt only for ransomware staging", good: false },
  ];
  const programMetricOptions = [
    { id: "pm-coverage", label: "ATT&CK coverage: % of techniques with a hunt or detection", good: true },
    { id: "pm-tickets", label: "Tickets closed per week", good: false },
    { id: "pm-alerts", label: "Raw alert volume", good: false },
    { id: "pm-headcount", label: "SOC headcount", good: false },
  ];

  // ── Field Manual (Knowledge Core) ──────────────────────────────────────────
  const manualSections = [
    {
      id: "m-what",
      kicker: "Field Manual · Ch. 1",
      title: "What threat hunting is (and isn't)",
      paragraphs: [
        "A threat hunt is a proactive, human-led search for malicious events and activities that are already inside an environment — hunting assumes the adversary may have slipped past every automated control. Cyber threat hunters identify threats carried out by internal actors (a single employee) or external actors (criminal organizations, state-sponsored sets).",
        "It is the complement of monitoring, not a synonym: monitoring reacts to what sensors were taught to catch; a hunt actively searches for what nobody taught them yet. Hunt teams lean on intelligence group communications — ISAC advisories, vendor reports, peer sharing — so they can react swiftly to threats described elsewhere before they fully unfold at home.",
      ],
      bullets: [
        "Hunting = hypothesis + telemetry + human judgment. Alerts = signatures + thresholds.",
        "A hunt that finds nothing is not a failure: it documents coverage and hardens assumptions.",
        "Hunts close the loop — every finding becomes a detection, an intel requirement, or a hunt-report lesson.",
      ],
    },
    {
      id: "m-class",
      kicker: "Field Manual · Ch. 2",
      title: "Threat classification: good, bad, unknown",
      paragraphs: [
        "Every observation gets one of three labels. Known-good: normal, documented activity (backups, patch agents, the scheduled SCCM task). Known-bad: confirmed malicious (an office app spawning an encoded script interpreter). Unknown: no context yet — and unknown is the raw material of hunting.",
        "The discipline is in the ledger: classifications must cite their justification (a change record, an authorization, a bulletin). “Unknown” is not a dumping ground; it is a work queue.",
      ],
    },
    {
      id: "m-approaches",
      kicker: "Field Manual · Ch. 3",
      title: "Hunt approaches & the hypothesis loop",
      paragraphs: [
        "Three named approaches cover most hunts. A structured hunt starts from intelligence: the advisory names TTPs, you sweep the estate for them. An unstructured hunt starts from intuition: a hunter notices something odd and follows it with broad, creative queries. An entity-driven hunt starts from your crown jewels: profile the entity's normal behavior, then hunt anomalies around it.",
        "In practice every hunt runs the same loop: a trigger (usually intel) forms a hypothesis (“if CINDER EMBER is here, a browser-lookalike task exists”), you investigate with tools, the result uncovers new TTPs or clears the hypothesis, and both outcomes feed detections, intel and the next hunt.",
      ],
    },
    {
      id: "m-intel",
      kicker: "Field Manual · Ch. 4",
      title: "The intelligence cycle, products, sources & sharing",
      paragraphs: [
        "Intelligence moves in a six-phase cycle: Direction → Collection → Processing → Analysis → Dissemination → Feedback. Direction sets the questions; collection gathers raw material; processing normalizes it (deduplicate, convert to STIX); analysis judges relevance to YOUR environment; dissemination delivers the right product to the right consumer; feedback tunes the next cycle.",
        "Products come in three altitudes: strategic (trends for leadership boards), operational (adversary campaigns, capabilities — for hunt planning) and tactical (machine-readable IoCs for controls, today).",
        "Sources: OSINT (public research), closed/cooperative groups, ISACs (sector-based sharing — Energy-ISAC here), government/CSIRT advisories, and commercial vendors. Sharing is two-way: you consume advisories and you publish sanitized indicators back.",
        "Formats matter: IoC = a concrete observable (hash, IP, domain). IoA = behavioral evidence an intrusion is underway. TTP = how the adversary operates end-to-end. STIX is the structured format for intel objects; TAXII is the transport that moves them between systems (OpenIOC is the older XML predecessor).",
      ],
    },
    {
      id: "m-frameworks",
      kicker: "Field Manual · Ch. 5",
      title: "Navigation instruments: ATT&CK, Kill Chain, Diamond",
      paragraphs: [
        "MITRE ATT&CK organizes adversary behavior into tactics (the WHY — e.g. Persistence) and techniques/sub-techniques (the HOW — e.g. T1053.005 Scheduled Task). Precise IDs let a hunt, a detection and an intel report speak the same language; “phishing” is vague, “T1566.001 Spearphishing Attachment” is a hunt instruction.",
        "The Cyber Kill Chain (Lockheed Martin) slices an intrusion into seven phases — Reconnaissance, Weaponization, Delivery, Exploitation, Installation, Command and Control, Actions on Objectives — a reminder that defenders get seven chances to break a chain, and the earliest practical one is cheapest.",
        "The Diamond Model pins every intrusion event on four vertices — Adversary, Capability, Infrastructure, Victim — and every vertex is a pivot point: from a C2 IP (infrastructure) you pivot to more victims; from a loader (capability) to other campaigns.",
      ],
    },
    {
      id: "m-actors",
      kicker: "Field Manual · Ch. 6",
      title: "Threat actors & why the hunt never stops",
      paragraphs: [
        "Actors are profiled by origin (internal/external), sophistication, resources and intent. The taxonomy: script kiddies (noise), hacktivists (ideology, publicity), criminal syndicates (money), nation-states/APTs (patience, custom tooling, espionage), and insiders (legitimate access, personal grievance or greed).",
        "Why hunt at all? Because sophisticated actors evade automated controls by design, dwell times are measured in weeks, and the intel cycle only pays off when a human turns a bulletin into a query, a query into a finding, and a finding into a detection. Continuous improvement is the whole game — coverage of ATT&CK techniques, time-to-detect, and lessons fed back into the loop.",
      ],
    },
  ];

  const glossary = [
    { id: "g-hunt", term: "Threat hunting", def: "A proactive, human-led search for attackers already inside an environment, driven by hypotheses and intelligence — not by waiting for alerts." },
    { id: "g-class", term: "Threat classification", def: "Sorting observations into known-good (normal, documented), known-bad (confirmed malicious) and unknown (no context yet — the raw material of hunts)." },
    { id: "g-struct", term: "Structured hunt", def: "A hunt triggered by intelligence: you sweep the estate for the specific TTPs a report describes." },
    { id: "g-unstruct", term: "Unstructured hunt", def: "An intuition-driven hunt: the hunter notices something odd and follows it with broad, creative queries." },
    { id: "g-entity", term: "Entity-driven hunt", def: "A hunt centered on your most valuable assets (crown jewels): profile the entity, then hunt anomalies around it." },
    { id: "g-cycle", term: "Intelligence cycle", def: "Six repeating phases: Direction → Collection → Processing → Analysis → Dissemination → Feedback." },
    { id: "g-products", term: "Intelligence products", def: "Strategic (trends for leadership), operational (adversary campaigns & capabilities) and tactical (deployable IoCs for controls)." },
    { id: "g-sources", term: "Intel sources", def: "OSINT (public), closed/cooperative groups, ISACs (sector sharing), government/CSIRT advisories and commercial feeds." },
    { id: "g-ioc", term: "IoC", def: "Indicator of Compromise — a concrete observable (hash, IP, domain) that evidence of an intrusion leaves behind." },
    { id: "g-ioa", term: "IoA", def: "Indicator of Attack — behavioral evidence an intrusion is underway (e.g. an office app spawning a script interpreter)." },
    { id: "g-ttp", term: "TTP", def: "Tactics, Techniques and Procedures — how an adversary operates, from the goal (tactic) to the specific implementation (procedure)." },
    { id: "g-stix", term: "STIX & TAXII", def: "STIX is the structured format for sharing threat intel objects; TAXII is the transport protocol that moves them between systems." },
    { id: "g-attack", term: "MITRE ATT&CK", def: "A knowledge base of adversary tactics and techniques observed in the wild — the shared language of hunts, detections and intel." },
    { id: "g-killchain", term: "Cyber Kill Chain", def: "Lockheed Martin's seven intrusion phases: Reconnaissance, Weaponization, Delivery, Exploitation, Installation, Command and Control, Actions on Objectives." },
    { id: "g-diamond", term: "Diamond Model", def: "Intrusion analysis on four vertices — Adversary, Capability, Infrastructure, Victim — where every vertex is a pivot point for the next hunt." },
  ];

  // ── Debrief ────────────────────────────────────────────────────────────────
  const debriefData = {
    detections: [
      {
        source: "Email gateway",
        look: "Macro-enabled attachments (.xlsm/.docm) to finance distribution lists; lookalike supplier domains",
        logic: "attachment_ext ∈ {.xlsm, .docm} AND recipient_group = “finance” → triage queue (simplified example logic)",
      },
      {
        source: "EDR process events",
        look: "Office application spawning a script interpreter; encoded command lines",
        logic: "parent ∈ {WINWORD.EXE, EXCEL.EXE} AND child ∈ {powershell.exe, cmd.exe, wscript.exe} → HIGH severity (simplified example logic)",
      },
      {
        source: "Scheduled-task creation",
        look: "Tasks named to mimic software updates, created by office/script parents",
        logic: "event = task_created AND parent ∈ {powershell.exe, WINWORD.EXE} OR name ~ “Chrome*Update*” → HIGH severity (simplified example logic)",
      },
      {
        source: "Netflow / egress",
        look: "Periodic (60–120 s) small TLS POSTs to never-before-seen CDN-lookalike domains",
        logic: "flow_interval ∈ [60,120] s AND bytes < 10 KB AND new_SNI = true → candidate beacon (simplified example logic)",
      },
    ],
    mitigations: [
      { label: "Antivirus / antimalware & attachment sandboxing on email — addresses T1566.001 delivery", id: "M1049" },
      { label: "User training: finance-team phishing drills and a report-it culture — addresses T1566", id: "M1017" },
      { label: "Privileged account management: restrict who may create scheduled tasks — addresses T1053.005", id: "M1026" },
      { label: "Audit scheduled tasks & script-interpreter policy via EDR — addresses T1053.005", id: "M1047" },
      { label: "Egress allowlisting + new-domain alerting — blunts T1071.001 C2 (control recommendation; no single ATT&CK mitigation ID)", id: null },
    ],
    blueTeam: [
      "Intel without a query is trivia — every advisory should produce at least one sweep the same day.",
      "Classify with citations: a “known-good” without a change record is just an opinion.",
      "The chain was visible in four datasets; no single dataset told the story. Hunts correlate.",
      "Blocked ≠ gone: EV-EMAIL-02 was contained noise, but the active chain hid beside it. Triage noise fast so the real signal has room.",
    ],
    redTeam: [
      "Browser-lookalike names (“ChromeUpdateTask”) exploit trust in routine — familiarity is camouflage.",
      "The macro→PowerShell→schtasks chain is old, but it still evaded a patched, alerting estate. Boring works.",
      "CDN-lookalike beaconing blends with SaaS noise; irregular-but-small beats large-and-loud.",
      "Every detection you force the blue team to write is intel they'll keep — anticipate the next hunt, not just this one.",
    ],
    links: [
      { label: "MITRE ATT&CK — Phishing: Spearphishing Attachment (T1566.001)", url: "https://attack.mitre.org/techniques/T1566/001/" },
      { label: "MITRE ATT&CK — PowerShell (T1059.001)", url: "https://attack.mitre.org/techniques/T1059/001/" },
      { label: "MITRE ATT&CK — Scheduled Task (T1053.005)", url: "https://attack.mitre.org/techniques/T1053/005/" },
      { label: "MITRE ATT&CK — Web Protocols (T1071.001)", url: "https://attack.mitre.org/techniques/T1071/001/" },
      { label: "Lockheed Martin — Cyber Kill Chain®", url: "https://www.lockheedmartin.com/en-us/capabilities/cyber/cyber-kill-chain.html" },
      { label: "The Diamond Model of Intrusion Analysis", url: "https://en.wikipedia.org/wiki/Diamond_Model_of_Intrusion_Analysis" },
      { label: "CompTIA CySA+ (CS0-003) — official exam page", url: "https://www.comptia.org/certifications/cybersecurity-analyst" },
    ],
    nextSteps: [
      "Next in the course: Lesson 2.3 — analyzing indicators of malicious activity (from spotting the chain to dissecting each artifact).",
      "Practice: browse MITRE ATT&CK's Persistence tactic (TA0003) and map two more techniques a scheduled task could have been replaced with.",
      "Habit: pick one real (or lab) telemetry source weekly and write one hypothesis-driven query — the hunt muscle only grows under load.",
    ],
  };

  // ── Quizzes ────────────────────────────────────────────────────────────────
  const quizMedium = [
    {
      id: "qm1",
      topic: "hunting vs monitoring (Manual Ch. 1)",
      prompt: "Which sentence best captures what makes threat hunting different from security monitoring?",
      options: [
        "It waits for automated alerts to fire before any analyst ever acts",
        "It proactively searches for threats no control has flagged, guided by hypotheses",
        "It only begins after a confirmed breach has been announced publicly",
        "It replaces automated detections, making SIEM rules and EDR policies unnecessary",
      ],
      correct: 1,
      explanation:
        "Hunting is defined by proactivity and hypothesis: it goes looking for what no rule was ever written to catch. The others describe monitoring (alerts first), incident response (post-breach), or a common misconception — hunting complements the automated stack, and hunts eventually become tomorrow's detections.",
    },
    {
      id: "qm2",
      topic: "hunt approaches (Manual Ch. 3)",
      prompt: "Energy-ISAC publishes TTPs for a campaign. You sweep every scheduled-task creation event in the estate for those patterns. What kind of hunt is this?",
      options: [
        "Structured",
        "Entity-driven",
        "Unstructured",
        "Post-incident review",
      ],
      correct: 0,
      explanation:
        "Structured hunts are triggered by intelligence: the report names TTPs, you sweep for them. Entity-driven would center on a crown-jewel asset; unstructured would start from a hunter's hunch.",
    },
    {
      id: "qm3",
      topic: "intelligence cycle (Manual Ch. 4)",
      prompt: "In the intelligence cycle, which phase immediately follows Collection?",
      options: [
        "Analysis",
        "Dissemination",
        "Direction",
        "Processing",
      ],
      correct: 3,
      explanation:
        "The cycle runs Direction → Collection → Processing → Analysis → Dissemination → Feedback. Raw collected data is processed (normalized, deduplicated, structured) before analysts judge it.",
    },
    {
      id: "qm4",
      topic: "intelligence products (Manual Ch. 4)",
      prompt: "“An 18-month report on state-sponsored targeting of energy, prepared for the executive board” is which kind of intelligence product?",
      options: [
        "Tactical",
        "Operational",
        "Strategic",
        "Technical",
      ],
      correct: 2,
      explanation:
        "Strategic intel informs long-term decisions at leadership level. Operational intel describes adversary campaigns for hunt planning; tactical intel is machine-readable IoCs for controls.",
    },
    {
      id: "qm5",
      topic: "threat classification (Manual Ch. 2)",
      prompt: "A 2.1 GB overnight upload from a design workstation to an undeclared cloud service. No ticket, no record. How should the hunt ledger classify it?",
      options: [
        "Known-good — creative teams upload files all the time",
        "Known-bad — large uploads are always exfiltration",
        "Unknown — log it, open a low-priority investigation",
        "Do not classify; delete the record",
      ],
      correct: 2,
      explanation:
        "Classification discipline: without context it is neither provably good nor bad — it is unknown, and unknown is a work queue, not a verdict. Panic-classifying as “bad” burns IR capacity; waving it as “good” is how exfiltration hides.",
    },
    {
      id: "qm6",
      topic: "STIX & TAXII sharing (Manual Ch. 4)",
      prompt: "Your team wants to machine-share indicators with the sector ISAC. Which pairing is correct?",
      options: [
        "STIX transports the intel; TAXII is the file format",
        "TAXII transports the intel; STIX is the structured format",
        "Both are file formats; use email to move them",
        "STIX is for strategic intel only; TAXII for tactical",
      ],
      correct: 1,
      explanation:
        "STIX = the structured language of intel objects (Indicator, Attack Pattern, Relationship…). TAXII = the transport protocol that carries STIX between systems. The pairing is the backbone of automated sharing.",
    },
    {
      id: "qm7",
      topic: "Diamond Model (Manual Ch. 5)",
      prompt: "Which of these is NOT one of the Diamond Model's four vertices?",
      options: [
        "Motivation",
        "Adversary",
        "Capability",
        "Infrastructure",
      ],
      correct: 0,
      explanation:
        "The Diamond's four vertices are Adversary, Capability, Infrastructure and Victim. Motivation describes the adversary (and matters for attribution) but is not a vertex; every event links the four vertices, and each is a pivot point.",
    },
  ];

  const quizHard = [
    {
      id: "qh1",
      topic: "ATT&CK precision (Manual Ch. 5)",
      scenario: "EDR shows WINWORD.EXE spawning powershell.exe with an encoded command line, 5 minutes after an invoice email arrived.",
      prompt: "Which ATT&CK sub-technique is the PRECISE tag for the process event?",
      options: [
        "T1566.001 (Spearphishing Attachment)",
        "T1059.001 (PowerShell)",
        "T1204.002 (Malicious File)",
        "T1059 (parent technique)",
      ],
      correct: 1,
      explanation:
        "Tag what the event IS: a PowerShell interpreter executing — T1059.001. T1566.001 belongs to the email event; T1204.002 is the user's double-click; the parent T1059 loses the precision that makes hunts and detections composable.",
    },
    {
      id: "qh2",
      topic: "Kill Chain interception (Manual Ch. 5)",
      scenario: "Intel says: attachment → PowerShell loader → browser-lookalike scheduled task. Your estate has no alert for any of it.",
      prompt: "For a structured hunt built from ONLY this intel, at which Kill Chain phase do you first have a realistic chance to intercept — and why?",
      options: [
        "Reconnaissance — you can detect the actor scanning your perimeter",
        "Weaponization — you can watch the attachment being built",
        "Actions on Objectives — the damage finally becomes visible there",
        "Delivery — the attachment lands on a sensor you own",
      ],
      correct: 3,
      explanation:
        "You cannot observe the adversary's own turf: recon and weaponization happen on their infrastructure, and waiting for Actions on Objectives means the mission already succeeded. Delivery is the first phase that touches a sensor you control — your mail records — and intercepting there avoids every later phase.",
    },
    {
      id: "qh3",
      topic: "threat classification (Manual Ch. 2)",
      scenario: "During the sweep you find the 03:11 2.1 GB upload from ALD-MKTG-07 to an undeclared cloud drive. The marketing director says “that's our designer, it's fine.”",
      prompt: "What is the correct hunter's move?",
      options: [
        "Reclassify the upload as known-good on the director's verbal assurance",
        "Declare a breach and pull the workstation offline immediately",
        "Keep it unknown, log the assurance, verify the service, investigate lightly",
        "Ignore it — it is not part of the CINDER EMBER chain anyway",
      ],
      correct: 2,
      explanation:
        "Verbal reassurance is context, not evidence: classification must rest on verifiable facts (what service, what data, whose approval). But proportion matters too — no evidence of breach justifies pulling the workstation. Unknown stays unknown, logged and queued for a low-priority investigation; ignoring it because it doesn't fit the current hypothesis is how secondary incidents hide.",
    },
    {
      id: "qh4",
      topic: "intel sources (Manual Ch. 4)",
      scenario: "You need fresh, sector-specific indicators for utilities within hours, with minimal legal friction.",
      prompt: "Which intelligence source fits best — and what fills the gap it can't?",
      options: [
        "Energy-ISAC — sector peers share live IoCs; government/CSIRT advisories add authority",
        "Commercial vendor feed — fastest coverage; it also supplies regulator-approved context",
        "OSINT researcher threads — public posts cover everything, so nothing needs filling",
        "Dark-web monitoring — the actor's channels announce campaigns; vendors fill any gaps",
      ],
      correct: 0,
      explanation:
        "ISACs exist precisely for sector peer-sharing: fast, trusted, two-way, low friction. Their gap — official, authoritative context — is what government/CSIRT advisories add. Vendors are strong but paid and aggregated (and no feed is “regulator-approved”); OSINT alone is incomplete; dark-web monitoring is a specialist discipline, not a general answer.",
    },
    {
      id: "qh5",
      topic: "attribution (Manual Ch. 6)",
      scenario: "Evidence: a water utility targeted; custom loader; browser-lookalike persistence; CDN-lookalike beaconing; no ransom note; infrastructure in Eastern-European hosting; dwell time ≥3 weeks.",
      prompt: "Which attribution reasoning is DEFENSIBLE?",
      options: [
        "Criminal syndicate — ransomware economics can explain any silent intrusion",
        "Nation-state espionage — sector targeting, custom tooling, quiet long dwell align",
        "Insider threat — the scheduled task ran under the logged-on user's context",
        "Hacktivist — utilities are political symbols and defacements draw attention",
      ],
      correct: 1,
      explanation:
        "Attribution stacks indicators and rules out what they contradict: criminals monetize (no ransom note), insiders use legitimate access (this chain arrived by external spearphishing), hacktivists perform for audiences (this actor stayed silent for weeks). Only the nation-state profile fits every observed attribute — sector fit, custom capability, patience, no monetization.",
    },
    {
      id: "qh6",
      topic: "responsible sharing (Manual Ch. 4)",
      scenario: "You are packaging the campaign for the Energy-ISAC. Draft items: C2 IP, beacon domain, technique references, sanitized timeline, victim hostnames, analyst working notes.",
      prompt: "Which items go into the shared package?",
      options: [
        "All six items — richer context helps every peer detect faster",
        "Only the C2 IP — infrastructure is the only truly shareable class",
        "C2 IP, beacon domain, techniques, sanitized timeline — never victims or notes",
        "Victim hostnames and the timeline — peers must know who was hit",
      ],
      correct: 2,
      explanation:
        "Share what helps others detect: indicators, technique mappings, sanitized timeline. Victim identity adds legal and reputational exposure while adding nothing to detection; working notes are internal scratch work, not structured intel. That is exactly why a STIX package carries Indicators, Attack Patterns and Relationships — and nothing about who was hit.",
    },
    {
      id: "qh7",
      topic: "hunt program metrics (Manual Ch. 6)",
      scenario: "Leadership asks how to measure whether the hunt program is maturing.",
      prompt: "Which metric best reflects hunting maturity?",
      options: [
        "Share of ATT&CK techniques covered by a hunt or detection",
        "Volume of alerts triaged per week across the whole SOC",
        "Tickets closed per analyst during the reporting period",
        "Number of hunts run, regardless of what they actually found",
      ],
      correct: 0,
      explanation:
        "Maturity = coverage shrinking the darkness: how much adversary behavior would now be caught that once wasn't. Alert volume, tickets closed and hunt counts all measure busyness — a program can be busy and blind. Coverage of relevant ATT&CK techniques, trending up, is the one metric that measures capability gained.",
    },
    {
      id: "qh8",
      topic: "entity-driven hunting (Manual Ch. 3)",
      scenario: "You must design an entity-driven hunt for the crown-jewel database that stores treatment-plant telemetry.",
      prompt: "What do you establish FIRST, before hunting?",
      options: [
        "A running list of CVEs affecting the deployed database product version",
        "A permanent full-packet-capture tap on every database session",
        "A copy of the vendor's public roadmap for the database product",
        "A baseline of normal access: who connects, when, and how much",
      ],
      correct: 3,
      explanation:
        "Entity-driven hunting is anchored in the entity's normalcy: access patterns, service accounts, data volumes. Without a baseline, “anomalous” is undefined and the hunt degenerates into generic alert-watching. CVE lists feed vulnerability management, not behavioral hunts; permanent full PCRs are a storage-proposal, not a starting point; the vendor roadmap says nothing about your adversary.",
    },
  ];

  return {
    scenario: scenario,
    bulletins: bulletins,
    telemetryQueries: telemetryQueries,
    telemetryEvents: telemetryEvents,
    intrusionEventIds: intrusionEventIds,
    mediumTriageIds: mediumTriageIds,
    huntOrNotStatements: huntOrNotStatements,
    huntTypeScenarios: huntTypeScenarios,
    huntTypeOptions: huntTypeOptions,
    triggerOptions: triggerOptions,
    hypothesisStatements: hypothesisStatements,
    sourceOptions: sourceOptions,
    intelCyclePhases: intelCyclePhases,
    intelCyclePoolOrder: intelCyclePoolOrder,
    intelProductItems: intelProductItems,
    intelProductOptions: intelProductOptions,
    intelProductAnswers: intelProductAnswers,
    routeItems: routeItems,
    routeItemAnswers: routeItemAnswers,
    killChainPhases: killChainPhases,
    killChainPoolOrder: killChainPoolOrder,
    diamondItems: diamondItems,
    diamondVertices: diamondVertices,
    diamondAnswers: diamondAnswers,
    techniqueOptions: techniqueOptions,
    tacticOptions: tacticOptions,
    actors: actors,
    motivationOptions: motivationOptions,
    profilerCase: profilerCase,
    profilerTypeOptions: profilerTypeOptions,
    profilerAnswers: profilerAnswers,
    attributionTraits: attributionTraits,
    attributionAnswers: attributionAnswers,
    formatOptions: formatOptions,
    transportOptions: transportOptions,
    packageItems: packageItems,
    feedbackActionItems: feedbackActionItems,
    nextHypothesisOptions: nextHypothesisOptions,
    shareObjectItems: shareObjectItems,
    priorityHuntOptions: priorityHuntOptions,
    programMetricOptions: programMetricOptions,
    manualSections: manualSections,
    glossary: glossary,
    debriefData: debriefData,
    quizMedium: quizMedium,
    quizHard: quizHard,
  };
})();
