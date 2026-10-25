/* ═══════════════════════════════════════════════════════════════════════════
   THE CONTROL GRID — js/data.js
   All lab content, ported 1:1 from the original lab (same wording, same
   correct answers, same hint tiers, same feedback messages).
   Data only — no logic lives in this file.
   ═══════════════════════════════════════════════════════════════════════════ */

"use strict";

/** Global namespace for the lab (classic scripts share this). */
var CG = {};

/* ─── META ────────────────────────────────────────────────────────────────── */

CG.LAB_META = {
  title: "THE CONTROL GRID",
  subtitle: "Security Control Types & Method — Field Assessment",
  org: "Northgate Logistics Group",
  orgNote: "A fictional freight & warehousing company. Every artifact in this lab is synthetic training data.",
  cert: "CompTIA CySA+ CS0-003",
  lesson: "Lesson 1.2 — Exploring Control Types and Method",
  domain: "Domain 2 — Recommend controls to mitigate attacks and software vulnerabilities",
  storageKey: "cyberlab.control-grid.v1",
};

CG.MODE_CARDS = {
  medium: {
    id: "medium",
    name: "FIELD ORIENTATION",
    tag: "MEDIUM",
    desc: "12 guided objectives across six desks of the assessment war room. Every check teaches, every hint is one click away, and wrong answers cost nothing but stars. Walk in having read the lesson; walk out fluent in categories, types and control reasoning.",
    bullets: [
      "Tiered hints: nudge → direction → demonstration",
      "Teaching feedback on every check",
      "Quiz after practice — supportive tone",
    ],
  },
  hard: {
    id: "hard",
    name: "RED CELL AUDIT",
    tag: "HARD",
    desc: "Mid-audit, Northgate's file server starts encrypting itself. You get the full noisy case file — 12 binder items, 6 of them red herrings — plus 8 more broad challenges. Exact values, exact cells, exact sequences. Near-misses are rejected with a rationale, and you get ONE nudge that costs score.",
    bullets: [
      "No 'where to look' — discovery under noise",
      "Exact-match, multi-part & sequence checks",
      "One costly nudge, hints otherwise disabled",
    ],
  },
};

CG.STATIONS = [
  { id: "casefile", name: "CASE FILE", blurb: "The assessor's binder — red herrings included.", icon: "folder" },
  { id: "doctrine", name: "DOCTRINE DESK", blurb: "Foundations: definition, categories, types.", icon: "book" },
  { id: "matrix", name: "THE MATRIX", blurb: "The 3×6 Control Grid — pin findings to cells.", icon: "grid" },
  { id: "triage", name: "TRIAGE CARDS", blurb: "Quick classification reps on fresh findings.", icon: "layers" },
  { id: "threat", name: "THREAT DESK", blurb: "Map threats to the safeguards that blunt them.", icon: "crosshair" },
  { id: "verify", name: "VERIFICATION DESK", blurb: "Prove controls work — or expose theater.", icon: "scan" },
  { id: "gap", name: "GAP AUDIT", blurb: "Find the coverage holes before attackers do.", icon: "target" },
  { id: "budget", name: "BUDGET DESK", blurb: "Treatment decisions with real constraints.", icon: "wallet" },
  { id: "war", name: "WAR DESK", blurb: "Response sequencing and crown-jewel defense.", icon: "siren" },
  { id: "remediation", name: "REMEDIATION DESK", blurb: "Recommend, substitute and layer controls.", icon: "wrench" },
];

/* ─── KNOWLEDGE CORE (C2) ─────────────────────────────────────────────────── */

CG.CATEGORY_META = [
  {
    name: "Managerial",
    essence: "Governance. Decisions, documents and oversight that direct the whole program.",
    examples: "Policies & standards, risk assessments, audits, sign-offs, reviews",
    watchout: "A policy nobody enforces is a wish, not a control.",
  },
  {
    name: "Operational",
    essence: "People executing day-to-day security processes.",
    examples: "Awareness training, guard operations, SOC rota, incident handling",
    watchout: "Processes need measurement, or they quietly decay.",
  },
  {
    name: "Technical",
    essence: "Technology enforcing security — the logical layer.",
    examples: "Firewalls, encryption, MFA, EDR, SIEM, badge systems",
    watchout: "Tools misconfigured or unmonitored give false comfort.",
  },
];

CG.TYPE_META = [
  {
    name: "Preventive",
    method: "Stops the incident before it happens.",
    example: "Firewall deny rule · MFA · training",
    watchout: "Prevention alone is brittle — assume it will eventually fail.",
  },
  {
    name: "Detective",
    method: "Identifies and records an incident during or after it occurs.",
    example: "SIEM alert · CCTV recording · log review",
    watchout: "Detection without response is just a diary.",
  },
  {
    name: "Corrective",
    method: "Restores normal operations after an incident.",
    example: "Restore from backup · patching · failover",
    watchout: "Untested backups are hope, not controls.",
  },
  {
    name: "Compensating",
    method: "Substitutes when the ideal control cannot be implemented.",
    example: "VLAN isolation + monitoring for unpatchable legacy",
    watchout: "Must be documented, monitored and reviewed — it degrades silently.",
  },
  {
    name: "Deterrent",
    method: "Discourages the attempt before it is made.",
    example: "Login banner · sanctions · signage",
    watchout: "Only deters actors who notice it and care about consequences.",
  },
  {
    name: "Physical",
    method: "Protects facilities, equipment and people in the real world.",
    example: "Locks · badge readers · mantraps · guards",
    watchout: "Cyber defenders forget them; attackers don't.",
  },
];

CG.MITRE_ANCHORS = [
  {
    id: "M1017",
    name: "User Training",
    cell: "Operational × Preventive",
    text: "Awareness and training stop social engineering before the click — the nontechnical measure the lesson leads with.",
    url: "https://attack.mitre.org/mitigations/M1017/",
  },
  {
    id: "M1032",
    name: "Multi-Factor Authentication",
    cell: "Technical × Preventive",
    text: "Makes a stolen password insufficient on its own — direct counter to credential abuse.",
    url: "https://attack.mitre.org/mitigations/M1032/",
  },
  {
    id: "M1053",
    name: "Data Backup",
    cell: "Technical × Corrective",
    text: "Restorable copies are the corrective answer to ransomware and destructive attacks.",
    url: "https://attack.mitre.org/mitigations/M1053/",
  },
  {
    id: "M1030",
    name: "Network Segmentation",
    cell: "Technical × Preventive / Compensating",
    text: "Segmentation shrinks reach — and doubles as the classic compensating control for unpatchable legacy systems.",
    url: "https://attack.mitre.org/mitigations/M1030/",
  },
  {
    id: "M1028",
    name: "Operating System Configuration",
    cell: "Technical × Preventive",
    text: "Hardening baselines — removing services, closing ports — are the attack-surface reduction the lesson calls for.",
    url: "https://attack.mitre.org/mitigations/M1028/",
  },
];

CG.FIELD_REALITY = [
  {
    title: "Untested backups + ransomware",
    text: "Organizations hit by destructive attacks without restore-tested, offline backups have spent weeks rebuilding by hand. The corrective control you never rehearsed is not a control.",
    tag: "SIMPLIFIED CASE PATTERN",
  },
  {
    title: "MFA that actually worked",
    text: "Google's 2019 analysis found device-based MFA blocked the vast majority of automated account takeovers — prevention, measured at scale.",
    tag: "SIMPLIFIED REAL-WORLD DATA",
  },
  {
    title: "Training you can measure",
    text: "Phishing-simulation programs only move the needle when click rates are tracked and training is retargeted — nontechnical controls need metrics too.",
    tag: "SIMPLIFIED REAL-WORLD PATTERN",
  },
];

CG.GLOSSARY = [
  { term: "Asset", def: "Anything of value to the organization: data, systems, facilities, people." },
  { term: "Attack surface", def: "Every point where an unauthorized actor could try to enter or cause harm." },
  { term: "Security control", def: "A technical or nontechnical safeguard that reduces risk to assets and data." },
  { term: "Control category", def: "Which layer implements a control: managerial, operational, or technical." },
  { term: "Control type (method)", def: "How a control acts: preventive, detective, corrective, compensating, deterrent, physical." },
  { term: "Managerial control", def: "Governance measures: policies, standards, risk assessments, reviews, sign-offs." },
  { term: "Operational control", def: "People executing day-to-day processes: training, guard operations, incident handling." },
  { term: "Technical (logical) control", def: "Technology enforcing security: firewalls, encryption, MFA, EDR, SIEM." },
  { term: "Preventive control", def: "Stops an incident before it occurs." },
  { term: "Detective control", def: "Identifies and records an incident while or after it happens." },
  { term: "Corrective control", def: "Restores normal operations after an incident: backups, patches, failover." },
  { term: "Compensating control", def: "An alternative safeguard used when the ideal control cannot be implemented." },
  { term: "Deterrent control", def: "Discourages attempts: banners, signage, sanctions, visible guards." },
  { term: "Physical control", def: "Real-world protection of facilities, equipment, and people: locks, badges, mantraps." },
  { term: "Defense in depth", def: "Layering multiple control types so one failure is absorbed by the next layer." },
];

CG.CATEGORIES = ["Managerial", "Operational", "Technical"];
CG.CONTROL_TYPES = ["Preventive", "Detective", "Corrective", "Compensating", "Deterrent", "Physical"];

/* ─── OBJECTIVES — MEDIUM (12) ────────────────────────────────────────────── */

CG.MEDIUM_OBJECTIVES = [
  {
    id: "M1",
    mode: "medium",
    station: "doctrine",
    order: 1,
    title: "Define the safeguard",
    prompt: "Start at the foundation. Pick the statement that best describes what a security control is.",
    pillar: "UNDERSTAND",
    anchor: "Lesson: controls are technical AND nontechnical measures that reduce risk",
    hints: [
      "The lesson text says controls can be technical OR nontechnical — look for the option covering both.",
      "Firewalls AND employee training must both fit under the correct definition.",
      "The answer is the option that mentions reducing risk to assets and data.",
    ],
    teachPass:
      "Locked in. Every control — from a firewall to a training program — exists to reduce risk to assets and data. Keep this definition as your north star for the rest of the audit.",
    teachFail:
      "Not yet. Look for the option that covers BOTH firewalls (technical) and training (nontechnical). Breadth plus risk reduction is the signature of a control.",
    payload: {
      kind: "choose",
      options: [
        {
          id: "a",
          label: "Any security device that blocks hackers from entering the network",
          why: "Too narrow — controls include nontechnical measures like training and policies, and many controls don't block anything: they detect, correct, or deter.",
        },
        {
          id: "b",
          label: "A technical or nontechnical safeguard that reduces risk to assets and data.",
          why: "Exactly. Controls span firewalls and encryption (technical) AND training and awareness (nontechnical). The goal is risk reduction — protecting assets from unauthorized access, theft, and destruction.",
          correct: true,
        },
        {
          id: "c",
          label: "An insurance policy that pays out after a breach has occurred",
          why: "Insurance transfers financial risk but changes nothing about the attack itself — it is not a security control.",
        },
        {
          id: "d",
          label: "A document listing every vulnerability found in the company",
          why: "That's a vulnerability assessment — an input to control selection, not a control itself.",
        },
      ],
      correct: ["b"],
    },
  },
  {
    id: "M2",
    mode: "medium",
    station: "doctrine",
    order: 2,
    title: "Sort the categories",
    prompt: "The assessor left six observations on your desk. File each into the category that implements it: Managerial (governance), Operational (people & process), or Technical (technology).",
    pillar: "UNDERSTAND",
    anchor: "CS0-003 control categories: managerial / operational / technical",
    hints: [
      "Ask: who makes it happen — a decision or paper (managerial), a person following a process (operational), or software and hardware (technical)?",
      "Policies and assessments are managerial. Training and SOC monitoring are operational.",
      "Encryption and firewalls are always technical.",
    ],
    teachPass:
      "Category = the layer that implements the control: governance decides, people operate, technology enforces. Most exam traps are just one layer wearing another's clothes.",
    teachFail:
      "Re-sort with this test: is it a decision or document (managerial), a recurring human process (operational), or a technology enforcing rules (technical)?",
    payload: {
      kind: "sort",
      bins: [
        { id: "Managerial", label: "Managerial", desc: "Governance: policies, assessments, sign-offs" },
        { id: "Operational", label: "Operational", desc: "People running day-to-day processes" },
        { id: "Technical", label: "Technical", desc: "Technology enforcing security" },
      ],
      tiles: [
        { id: "t1", label: "Annual risk assessment signed off by the CIO", bin: "Managerial", why: "A governance decision artifact — leadership evaluating risk is managerial." },
        { id: "t2", label: "Next-gen firewall filtering the perimeter", bin: "Technical", why: "Hardware and software enforcing rules — textbook technical control." },
        { id: "t3", label: "Security awareness training program for all staff", bin: "Operational", why: "People executing a recurring process — training is the classic operational control." },
        { id: "t4", label: "24/7 SOC analyst rota monitoring alerts", bin: "Operational", why: "Humans performing the monitoring process — operational, even though they use technical tools." },
        { id: "t5", label: "Company-wide acceptable use policy", bin: "Managerial", why: "A policy is governance: management setting the rules." },
        { id: "t6", label: "Full-disk encryption on every laptop", bin: "Technical", why: "A technology safeguard protecting data at rest — technical." },
      ],
    },
  },
  {
    id: "M3",
    mode: "medium",
    station: "doctrine",
    order: 3,
    title: "Pair the six types",
    prompt: "The six control types are the heart of this lesson. Pair each type with the definition that matches its method.",
    pillar: "UNDERSTAND",
    anchor: "CS0-003 control types: preventive, detective, corrective, compensating, deterrent, physical",
    hints: [
      "Pre-, di-, cor- — before, during, after.",
      "Compensating is about substitution; deterrent is about discouraging.",
      "Physical is about the real world — locks, guards, barriers.",
    ],
    teachPass:
      "Six methods, one grid column each. When a scenario describes what a control DOES — stops, records, restores, substitutes, discourages, guards — you have its type.",
    teachFail:
      "Anchor on the verbs: stops = preventive, records = detective, restores = corrective, substitutes = compensating, discourages = deterrent, guards the real world = physical.",
    payload: {
      kind: "match",
      lefts: [
        { id: "l1", label: "Preventive" },
        { id: "l2", label: "Detective" },
        { id: "l3", label: "Corrective" },
        { id: "l4", label: "Compensating" },
        { id: "l5", label: "Deterrent" },
        { id: "l6", label: "Physical" },
      ],
      rights: [
        { id: "r1", label: "Stops the incident before it happens" },
        { id: "r2", label: "Identifies and records an incident during or after it occurs" },
        { id: "r3", label: "Restores normal operations after an incident" },
        { id: "r4", label: "Substitutes when the ideal control can't be implemented" },
        { id: "r5", label: "Discourages the attempt before it's made" },
        { id: "r6", label: "Protects facilities, equipment, and people in the real world" },
      ],
      correct: { l1: "r1", l2: "r2", l3: "r3", l4: "r4", l5: "r5", l6: "r6" },
      whys: {
        l1: "Preventive controls act before: blocks, gates, requirements.",
        l2: "Detective controls record and reveal: alerts, logs, cameras.",
        l3: "Corrective controls repair and restore: backups, patches, failover.",
        l4: "Compensating controls substitute when the primary control is infeasible.",
        l5: "Deterrent controls act on the attacker's decision: banners, sanctions, signs.",
        l6: "Physical controls guard the real world: locks, readers, mantraps, guards.",
      },
    },
  },
  {
    id: "M4",
    mode: "medium",
    station: "triage",
    order: 4,
    title: "Triage: name the method",
    prompt: "Four fresh findings from the assessor's notebook. For each, name the control TYPE — the method it uses. (Categories come next.)",
    pillar: "RECOGNIZE",
    anchor: "Control types applied to realistic findings",
    hints: [
      "Ask: does it stop, record, restore, discourage, substitute, or guard the building?",
      "Signs deter; alerts detect; successful blocks prevent; rebuilds correct.",
      "None of these four are compensating or physical.",
    ],
    teachPass:
      "Clean triage. The verb in the finding almost always betrays the type: blocks → preventive, fires/recording → detective, rebuilt/restored → corrective, warning → deterrent.",
    teachFail:
      "Re-read each finding and find its verb: what does the control DO — stop it, record it, restore it, or talk the attacker out of it?",
    payload: {
      kind: "register",
      findings: [
        {
          id: "f1",
          text: "A warning sign at the loading dock: 'All vehicles subject to search.'",
          options: [
            { id: "Preventive", label: "Preventive", why: "Nothing is blocked by a sign — the attempt is discouraged, not stopped." },
            { id: "Detective", label: "Detective", why: "The sign records nothing." },
            { id: "Deterrent", label: "Deterrent", why: "Correct — the sign discourages the attempt. Nobody is stopped or recorded by it.", correct: true },
            { id: "Compensating", label: "Compensating", why: "It substitutes for nothing — it's pure discouragement." },
            { id: "Physical", label: "Physical", why: "A sign has no barrier value; a fence would be physical." },
          ],
        },
        {
          id: "f2",
          text: "The SIEM fires an alert when one account takes 100 failed login attempts in ten minutes.",
          options: [
            { id: "Preventive", label: "Preventive", why: "The attempts already happened — the alert doesn't stop them." },
            { id: "Detective", label: "Detective", why: "Correct — it identifies and records suspicious activity as it happens.", correct: true },
            { id: "Deterrent", label: "Deterrent", why: "Attackers don't see the alert in real time — no deterrent effect." },
            { id: "Corrective", label: "Corrective", why: "Nothing is being restored here." },
            { id: "Physical", label: "Physical", why: "Entirely digital." },
          ],
        },
        {
          id: "f3",
          text: "A multi-factor prompt blocks a stolen password from logging into email.",
          options: [
            { id: "Preventive", label: "Preventive", why: "Correct — the login never succeeds; the incident is stopped before it happens.", correct: true },
            { id: "Detective", label: "Detective", why: "It didn't just record the attempt — it stopped it." },
            { id: "Deterrent", label: "Deterrent", why: "Deterrence works on decisions, not on stolen credentials." },
            { id: "Compensating", label: "Compensating", why: "MFA is a primary control here, not a substitute." },
            { id: "Corrective", label: "Corrective", why: "Nothing to restore — the incident never occurred." },
          ],
        },
        {
          id: "f4",
          text: "After a worm crippled a file server, admins rebuilt it from Friday's backup and patched the flaw.",
          options: [
            { id: "Preventive", label: "Preventive", why: "The patch prevents a repeat, but the finding's method is the rebuild." },
            { id: "Detective", label: "Detective", why: "The damage was already done — nothing was being detected." },
            { id: "Corrective", label: "Corrective", why: "Correct — restoring normal operations after an incident. (The patch is preventive for next time.)", correct: true },
            { id: "Deterrent", label: "Deterrent", why: "No discouragement involved." },
            { id: "Compensating", label: "Compensating", why: "The primary control (a working server) failed; this isn't substitution, it's repair." },
          ],
        },
      ],
    },
  },
  {
    id: "M5",
    mode: "medium",
    station: "matrix",
    order: 5,
    title: "Plot the matrix cells",
    prompt: "Now both axes. For each finding, set the CATEGORY (row) and TYPE (column) — pin each card to its cell on the Control Grid.",
    pillar: "RECOGNIZE",
    anchor: "Full classification: category × type across all six methods",
    hints: [
      "Category = who implements: paper (managerial), people (operational), technology (technical).",
      "The guard is physical protection delivered by a person — operational category.",
      "Signed standards are managerial; restoring backups is corrective.",
    ],
    teachPass:
      "Every finding now lives in exactly one cell. Same type can ride on different categories — the guard and a badge reader are both Physical, delivered by people vs. technology.",
    teachFail:
      "Work the axes separately: first who implements it (category), then what it does (type). Debatable cases are classified by primary method — the reasoning is in each card's feedback.",
    payload: {
      kind: "classify",
      cards: [
        {
          id: "c1",
          text: "Perimeter NGFW denies all unsolicited inbound traffic by default.",
          control: true,
          cat: "Technical",
          type: "Preventive",
          why: "Technology (technical) enforcing a block before incidents happen (preventive).",
        },
        {
          id: "c2",
          text: "Loading-dock CCTV records 24/7; footage retained 90 days.",
          control: true,
          cat: "Technical",
          type: "Detective",
          why: "A camera system records activity for later review — CompTIA counts CCTV among detective controls. (Simplified: classified by primary method, even though the device is physical security gear.)",
        },
        {
          id: "c3",
          text: "After ransomware hit the file server, admins restored from offline immutable backups.",
          control: true,
          cat: "Technical",
          type: "Corrective",
          why: "The restore brings operations back — corrective, delivered by technology.",
        },
        {
          id: "c4",
          text: "A guard logs every visitor in and out at the warehouse office door.",
          control: true,
          cat: "Operational",
          type: "Physical",
          why: "Physical type covers real-world facility protection; the guard is a person running the process, so the category is operational. Compare with badge readers — same type, technical category.",
        },
        {
          id: "c5",
          text: "After an audit finding, the CIO signs a new data-handling standard with scheduled compliance reviews.",
          control: true,
          cat: "Managerial",
          type: "Preventive",
          why: "A governance artifact (managerial) whose purpose is to stop mishandling before it occurs (preventive).",
        },
      ],
    },
  },
  {
    id: "M6",
    mode: "medium",
    station: "threat",
    order: 6,
    title: "Match threats to safeguards",
    prompt: "The lesson names three ways assets get hurt: unauthorized access, theft, and destruction. Pair each threat with the control that primarily guards against it — two options are decoys.",
    pillar: "RECOGNIZE",
    anchor: "Lesson: protect assets and data from unauthorized access, theft, and destruction",
    hints: [
      "Think about what each threat actually costs you: a login, a device, the data itself.",
      "Encryption protects data even when hardware is gone; backups protect data even when it's destroyed.",
      "MFA makes a stolen password insufficient on its own.",
    ],
    teachPass:
      "The lesson's trio — unauthorized access, theft, destruction — each has a natural control counter. Matching threat to safeguard is the first skill of control recommendation.",
    teachFail:
      "Ask what each control protects: MFA protects the login, encryption protects the data on a gone device, backups protect the data itself. The decoys don't target any of the three outcomes.",
    payload: {
      kind: "match",
      lefts: [
        { id: "a1", label: "Unauthorized access to systems" },
        { id: "a2", label: "Theft of a laptop from a fleet vehicle" },
        { id: "a3", label: "Destruction of data by ransomware" },
      ],
      rights: [
        { id: "b1", label: "Full-disk encryption so a stolen drive reveals nothing" },
        { id: "b2", label: "Off-site immutable backups that can be restored" },
        { id: "b3", label: "MFA on remote access so stolen passwords alone fail" },
        { id: "b4", label: "Security awareness training newsletter" },
        { id: "b5", label: "Decorative hedge fencing around the campus" },
      ],
      correct: { a1: "b3", a2: "b1", a3: "b2" },
      whys: {
        a1: "MFA attacks the 'stolen credential' problem directly — access fails without the second factor.",
        a2: "Disk encryption makes the stolen hardware worthless to the thief — the data never leaves protected.",
        a3: "Only restorable, off-site copies defeat destruction — that's the corrective pairing.",
      },
    },
  },
  {
    id: "M7",
    mode: "medium",
    station: "threat",
    order: 7,
    title: "Minimize the attack surface",
    prompt: "The lesson says controls 'reduce risk by minimizing the attack surface.' Which action most directly minimizes Northgate's attack surface?",
    pillar: "UNDERSTAND",
    anchor: "Lesson: minimizing the attack surface and addressing vulnerabilities",
    hints: [
      "Surface = exposure: doors, ports, accounts, code paths an attacker could touch.",
      "One option literally removes exposure; the others watch or pay for doors left open.",
      "Hardening — removing services and closing ports — is the canonical attack-surface reducer.",
    ],
    teachPass:
      "Attack surface is the set of doors an attacker could knock on. Removing doors (hardening) shrinks it; watching doors (detection) and paying for doors (insurance) leave the surface unchanged.",
    teachFail:
      "Ask which option removes exposure versus observes or pays for it. Only hardening — disabling services, closing ports — removes it.",
    payload: {
      kind: "choose",
      options: [
        {
          id: "a",
          label: "Disabling unused services and closing unneeded ports on internet-facing servers",
          why: "Correct. Attack surface = the set of doors an attacker could knock on. Removing doors is the definition of shrinking it.",
          correct: true,
        },
        {
          id: "b",
          label: "Installing antivirus software on every endpoint in the organization",
          why: "A valuable preventive control — but it guards doors rather than removing them. The surface is unchanged.",
        },
        {
          id: "c",
          label: "Hiring more SOC analysts to watch alerts around the clock",
          why: "Better detection capacity, but the surface — the exposed doors themselves — is untouched.",
        },
        {
          id: "d",
          label: "Purchasing cyber insurance to cover incident response costs",
          why: "Insurance transfers cost, not exposure. The doors stay exactly where they are.",
        },
      ],
      correct: ["a"],
    },
  },
  {
    id: "M8",
    mode: "medium",
    station: "remediation",
    order: 8,
    title: "Spot the compensating control",
    prompt: "One of these three situations describes a compensating control. Which?",
    pillar: "UNDERSTAND",
    anchor: "Compensating type: documented substitute for an infeasible primary control",
    hints: [
      "Compensating = the ideal control CANNOT be used. Look for the constraint.",
      "One option contains a system that 'can't support' its control.",
      "Substitute + documented + monitored = compensating.",
    ],
    teachPass:
      "Compensating controls have a signature: an infeasible primary control, a substitute with comparable protection, and documentation. Say that sentence in the exam and scenarios dissolve.",
    teachFail:
      "Hunt for the constraint — one scenario contains a system that cannot support its ideal control, and answers with a documented substitute. That's the compensating pattern.",
    payload: {
      kind: "choose",
      options: [
        {
          id: "a",
          label: "A company rolls out MFA on every system that supports it, finishing the rollout in one quarter.",
          why: "That's a primary preventive control — MFA was feasible everywhere, so nothing is being compensated.",
        },
        {
          id: "b",
          label: "A legacy app can't support MFA, so it's placed behind an SSO gateway with IP allowlisting, session timeouts, and enhanced logging.",
          why: "Correct. The ideal control (native MFA) is infeasible; a documented, monitored substitute achieves comparable protection — the definition of compensating.",
          correct: true,
        },
        {
          id: "c",
          label: "Management emails a company-wide memo reminding staff to choose stronger passwords.",
          why: "Awareness messaging is an operational control at best — it substitutes for nothing in particular and isn't documented as an alternative to an infeasible control.",
        },
      ],
      correct: ["b"],
    },
  },
  {
    id: "M9",
    mode: "medium",
    station: "verify",
    order: 9,
    title: "Prove it works",
    prompt: "A control that exists on paper isn't necessarily working. For each deployed control, pick the ONE artifact that actually proves effectiveness.",
    pillar: "DETECT",
    anchor: "Detective pillar: observing control effectiveness from real evidence",
    hints: [
      "Ask: does this artifact show the control WORKING, or just EXISTING?",
      "Invoices, signatures, and attendance are paper. Effectiveness is observed behavior.",
      "For backups: only a restore test counts.",
    ],
    teachPass:
      "This is the CySA+ mindset: verify, don't assume. Effectiveness evidence shows the control intercepting real activity — blocked packets, changed behavior, successful restores.",
    teachFail:
      "Separate existence from effectiveness: invoices, signatures, attendance sheets and success emails prove the control EXISTS. Only observed outcomes — blocked traffic, falling click rates, successful restores — prove it WORKS.",
    payload: {
      kind: "evidence",
      items: [
        {
          id: "e1",
          control: "Perimeter firewall rule: deny inbound SMB (445)",
          question: "Which artifact proves this control is effective?",
          options: [
            { id: "o1", label: "The signed change ticket approving and testing the rule", why: "Approval proves intent, not effect." },
            { id: "o2", label: "Packet captures showing external SMB attempts being dropped", why: "Correct — you can SEE the control working: blocked attempts at the boundary. That's evidence.", correct: true },
            { id: "o3", label: "The firewall vendor's invoice for the hardware", why: "Ownership isn't effectiveness." },
          ],
        },
        {
          id: "e2",
          control: "Security awareness training program",
          question: "Which artifact proves this control is effective?",
          options: [
            { id: "o1", label: "Attendance sheets from every session last quarter", why: "Attendance proves delivery, not behavior change." },
            { id: "o2", label: "The LMS completion certificate count for the year", why: "Completion is not changed behavior." },
            { id: "o3", label: "Phishing-simulation click rate falling from 14% to 4%", why: "Correct — behavior changed and you measured it. That's effectiveness.", correct: true },
          ],
        },
        {
          id: "e3",
          control: "Nightly backups of the WMS database",
          question: "Which artifact proves this control is effective?",
          options: [
            { id: "o1", label: "Daily automated 'backup job completed' success emails", why: "Jobs can complete successfully and still restore garbage — the classic trap." },
            { id: "o2", label: "A quarterly restore-test report with recovery time", why: "Correct — only an actual restore proves the backup is corrective capacity.", correct: true },
            { id: "o3", label: "The storage array's capacity dashboard graphs", why: "Tells you nothing about recoverability." },
          ],
        },
      ],
    },
  },
  {
    id: "M10",
    mode: "medium",
    station: "verify",
    order: 10,
    title: "Diagnose the gap",
    prompt: "Three weeks later: ransomware encrypts the WMS database. Northgate had prevention and detection everywhere — firewall, MFA, training, CCTV, SIEM. Operations halt for three days. Which control TYPE was missing?",
    pillar: "DETECT",
    anchor: "Gap analysis: the corrective capacity that absorbs prevention failure",
    hints: [
      "The attack succeeded AND recovery didn't. Which type covers recovery?",
      "Re-read the scenario: what could have shortened those three days to hours?",
      "Backups and incident response are corrective controls.",
    ],
    teachPass:
      "The classic autopsy: prevention failed (it always eventually can) and nothing absorbed the failure. Corrective capacity — tested backups, IR runbooks — is what turns catastrophe into a bad Tuesday.",
    teachFail:
      "Prevention and detection were present and failed. Ask what was missing AFTER the hit: the ability to restore. That's the corrective type.",
    payload: {
      kind: "choose",
      options: [
        { id: "Preventive", label: "Preventive", why: "No — the firewall and MFA were in place. Prevention can't be 100%, which is exactly why other types exist." },
        { id: "Detective", label: "Detective", why: "No — the SIEM and cameras were watching. They saw it happen." },
        { id: "Corrective", label: "Corrective", why: "Correct. Without tested, offline backups and an IR runbook there was no way to restore. Prevention failed — and nothing could absorb the failure.", correct: true },
        { id: "Compensating", label: "Compensating", why: "Not the core issue — compensating controls substitute for something infeasible, which wasn't the story here." },
        { id: "Deterrent", label: "Deterrent", why: "Banners and sanctions didn't stop a criminal crew — deterrence has limits." },
        { id: "Physical", label: "Physical", why: "The server room was locked all weekend; the attack came over the network." },
      ],
      correct: ["Corrective"],
    },
  },
  {
    id: "M11",
    mode: "medium",
    station: "remediation",
    order: 11,
    title: "Recommend the fix",
    prompt: "Three findings from the risk register need treatment decisions. Pick the best control for each — one of them requires a compensating control.",
    pillar: "MITIGATE",
    anchor: "CS0-003: given a scenario, recommend controls (treatment decisions)",
    hints: [
      "Best doesn't mean most expensive. Ask what each control actually changes about the risk.",
      "When the ideal control is impossible, look for the option that substitutes and monitors.",
      "Fence gets a physical fix; stolen laptops get unreadable data; unpatchable systems get isolated.",
    ],
    teachPass:
      "Treatment = the control that changes the risk the most per the constraint you have. And when the direct fix is impossible — like patching EOL gear — you compensate: isolate, monitor, document.",
    teachFail:
      "For each finding ask: which option changes the actual exposure? Encryption changes stolen-laptop exposure; fence repair changes physical exposure; for the unpatchable server, isolation plus monitoring is the only live option.",
    payload: {
      kind: "register",
      findings: [
        {
          id: "r1",
          text: "Fleet laptops are stolen from vehicles every quarter; data exposure each time.",
          tag: "RISK-014",
          options: [
            { id: "o1", label: "Full-disk encryption on all fleet laptops", why: "Correct — even a stolen laptop yields nothing readable. Direct fix for the exposure.", correct: true },
            { id: "o2", label: "Monthly anti-theft awareness email", why: "A nudge, not a control — the exposure doesn't change." },
            { id: "o3", label: "Ban laptops from fleet vehicles", why: "Fixes one problem by creating a bigger operational one." },
            { id: "o4", label: "Guard escorts for field technicians", why: "Astronomically expensive for the risk — poor treatment choice." },
          ],
        },
        {
          id: "r2",
          text: "Trespassers have cut through gaps in the warehouse fence twice this month.",
          tag: "RISK-022",
          options: [
            { id: "o1", label: "Patch the fence and add monitored night patrols", why: "Correct — physical protection restored and verified: the direct fix.", correct: true },
            { id: "o2", label: "Add the parking lot to the SIEM dashboards", why: "A SIEM ingests digital logs; it won't see a fence." },
            { id: "o3", label: "Email staff to report suspicious activity", why: "Awareness helps but doesn't close a physical gap." },
            { id: "o4", label: "Accept the risk until next fiscal year", why: "Two incidents this month — acceptance here is negligence." },
          ],
        },
        {
          id: "r3",
          text: "A legacy OT server can't be patched (vendor end-of-life) and sits on the flat plant network.",
          tag: "RISK-031 · COMPENSATING REQUIRED",
          options: [
            { id: "o1", label: "Isolate it on a dedicated VLAN with default-deny allowlisting and enhanced monitoring", why: "Correct — you can't fix the vulnerability, so you shrink its reach and watch it: a compensating control.", correct: true },
            { id: "o2", label: "Patch it anyway during business hours", why: "Vendor EOL means no supported patch exists — 'patch anyway' is fiction." },
            { id: "o3", label: "Replace the server right now", why: "Correct long-term, but not a treatment you can implement today — and the register needs treatment now." },
            { id: "o4", label: "Delete the risk from the register", why: "Deleting the record doesn't delete the risk." },
          ],
        },
      ],
    },
  },
  {
    id: "M12",
    mode: "medium",
    station: "remediation",
    order: 12,
    title: "Layer the crown jewel",
    prompt: "Defense in depth: the WMS database is Northgate's crown jewel. Build a layered plan: include at least one PREVENTIVE, one DETECTIVE, and one CORRECTIVE control — and at least 4 controls total.",
    pillar: "MITIGATE",
    anchor: "Defense in depth: layered types so one failure is absorbed",
    hints: [
      "Assume any single control eventually fails — what catches the failure?",
      "Pick one from each of the three required methods first, then add what's missing.",
      "Deterrent and physical picks are valid extras — the checker wants variety, not volume.",
    ],
    teachPass:
      "That's defense in depth: preventive fails → detective catches → corrective restores. The layers don't duplicate each other; they cover each other's failure modes.",
    teachFail:
      "Depth means variety of METHODS, not quantity. Rebuild with one preventive, one detective, one corrective — then decide what else earns its place.",
    payload: {
      kind: "depth",
      asset: "WMS database — 40,000 shipment records, the operational heart of Northgate",
      intro: "Toggle every control that belongs in the layered plan for this asset.",
      pool: [
        { id: "p1", label: "MFA on the WMS admin gateway", type: "Preventive", why: "Stops credential misuse before it lands." },
        { id: "p2", label: "Perimeter firewall ACL restricted to WMS subnets", type: "Preventive", why: "Shrinks the reachable surface." },
        { id: "p3", label: "Database activity monitoring with alerting", type: "Detective", why: "Sees anomalous queries as they happen." },
        { id: "p4", label: "SIEM correlation for WMS auth anomalies", type: "Detective", why: "Detects credential-abuse patterns." },
        { id: "p5", label: "Nightly immutable off-site backups", type: "Corrective", why: "The ransomware answer — restorable copies." },
        { id: "p6", label: "Documented failover runbook + quarterly restore test", type: "Corrective", why: "Corrective capacity that is rehearsed, not hoped for." },
        { id: "p7", label: "Login warning banner on WMS access", type: "Deterrent", why: "Discourages insider misuse." },
        { id: "p8", label: "Badge access to the server room", type: "Physical", why: "Real-world barrier around the hardware." },
        { id: "p9", label: "VLAN isolation for the legacy reporting server", type: "Compensating", why: "Substitute protection for a system that can't be fixed." },
      ],
      requiredTypes: ["Preventive", "Detective", "Corrective"],
      minPicks: 4,
      minTypes: 3,
    },
  },
];

/* ─── OBJECTIVES — HARD (9) ───────────────────────────────────────────────── */

CG.HARD_OBJECTIVES = [
  {
    id: "H1",
    mode: "hard",
    station: "casefile",
    order: 1,
    title: "Cut the noise, pin the controls",
    prompt: "Twelve items from the audit binder — six are genuine control evidence, six are noise. Pin each item to its matrix cell, or mark it NOT A CONTROL. All twelve verdicts must be exact.",
    pillar: "RECOGNIZE",
    anchor: "Classification across all categories & types, under noise",
    hints: [
      "Six items describe safeguards that implement, record, restore, substitute, discourage, or guard. The rest of the binder is office life.",
    ],
    teachPass:
      "Six real controls, six red herrings, every cell exact. This is the actual analyst skill: triage the binder first, classify second.",
    teachFail:
      "A control implements, records, restores, substitutes, discourages, or protects. Picnics, campaigns and job postings do none of those — re-sort and re-pin.",
    payload: {
      kind: "classify",
      allowNotControl: true,
      intro: "Category + Type for real controls; NOT A CONTROL for noise.",
      cards: [
        {
          id: "h1",
          text: "Firewall change ticket #4412: deny inbound 445/SMB at the perimeter — approved, deployed, verified.",
          control: true,
          cat: "Technical",
          type: "Preventive",
          why: "A technology enforcing a block before incidents happen.",
        },
        {
          id: "h2",
          text: "Runbook excerpt: monthly restore test for WMS backups; last result PASS (3 weeks ago).",
          control: true,
          cat: "Technical",
          type: "Corrective",
          why: "Restore capability — the corrective layer, here verified by testing.",
        },
        {
          id: "h3",
          text: "Security memo: legacy OT segment isolated on VLAN 47, default-deny allowlist, monitoring added.",
          control: true,
          cat: "Technical",
          type: "Compensating",
          why: "The classic compensation: isolation + monitoring for a system that can't be fixed.",
        },
        {
          id: "h4",
          text: "Visitor-control policy: all guests signed in and escorted by the guard at Gate C.",
          control: true,
          cat: "Operational",
          type: "Physical",
          why: "Facility protection (physical type) run by a person (operational category).",
        },
        {
          id: "h5",
          text: "Acceptable Use Policy §7: credential sharing is a sanctionable offense (suspension).",
          control: true,
          cat: "Managerial",
          type: "Deterrent",
          why: "A governance document whose sanction discourages misuse.",
        },
        {
          id: "h6",
          text: "CCTV retention schedule: dock cameras record continuously; footage kept 90 days.",
          control: true,
          cat: "Technical",
          type: "Detective",
          why: "Recording and retention — detective evidence capacity (CompTIA convention, simplified).",
        },
        { id: "h7", text: "All-staff email: Summer picnic menu and parking map.", control: false, why: "A picnic teaches nothing about safeguards — it's in the file because real cases are messy." },
        { id: "h8", text: "Q3 marketing campaign brief: 'Freight with a smile.'", control: false, why: "Marketing noise — no safeguard here." },
        { id: "h9", text: "Travel expense report — regional sales, May.", control: false, why: "An expense line, not a safeguard." },
        { id: "h10", text: "Conference invitation: 'The Future of Freight AI', Tucson.", control: false, why: "A conference invite changes nothing about Northgate's risk." },
        { id: "h11", text: "Job posting: warehouse forklift operator (night shift).", control: false, why: "A staffing ad — not a control." },
        { id: "h12", text: "Break-room notice: lost-and-found bin policy.", control: false, why: "Office life, not security." },
      ],
    },
  },
  {
    id: "H2",
    mode: "hard",
    station: "casefile",
    order: 2,
    title: "Analyze the chain",
    prompt: "The ransomware entered via a phished credential used on the VPN — which has no MFA (a budget deferral). Interview notes: the awareness program exists; last simulation click-rate was 14%. Two verdicts: which EXISTING control failed at the entry point (and as which type), and which ABSENT control would most likely have stopped the stolen credential from being used (and as which type)?",
    pillar: "RECOGNIZE",
    anchor: "Failed vs. absent controls along the attack chain",
    hints: [
      "One control existed and lost; one control never existed and would have won. Match each to its type.",
    ],
    teachPass:
      "Chain analysis in two sentences: the existing control that failed was the preventive one (training), and the absent control that would have blocked credential reuse was MFA — also preventive. Failures and gaps are classified with the same grid.",
    teachFail:
      "Separate FAILED (existed, didn't work) from ABSENT (didn't exist, would have worked). Training failed at the phish; MFA was missing at the login. Both are preventive — one human, one technical.",
    payload: {
      kind: "register",
      findings: [
        {
          id: "cf1",
          text: "Which EXISTING control failed at the entry point — and as which type?",
          tag: "PART 1",
          options: [
            { id: "o1", label: "Awareness training — Operational × Preventive", why: "Correct. The program exists (operational, people-driven) and its job is to stop the phish before the click (preventive). It failed — but it was the right control to have.", correct: true },
            { id: "o2", label: "CCTV — Technical × Detective", why: "Cameras record the parking lot, not the VPN." },
            { id: "o3", label: "Visitor policy — Operational × Physical", why: "Gate C logs don't see email." },
            { id: "o4", label: "Backup runbook — Technical × Corrective", why: "Backups restore; they don't stop entry." },
          ],
        },
        {
          id: "cf2",
          text: "Which ABSENT control would most likely have stopped the stolen credential from being used — and as which type?",
          tag: "PART 2",
          options: [
            { id: "o1", label: "MFA on VPN — Technical × Preventive", why: "Correct. MFA makes a stolen password insufficient — the phish lands, the login still fails.", correct: true },
            { id: "o2", label: "Login banner — Technical × Deterrent", why: "Banners deter humans mid-decision; they don't block stolen credentials." },
            { id: "o3", label: "SIEM alert on VPN logins — Technical × Detective", why: "It would see the login, not stop it." },
            { id: "o4", label: "Restore test — Technical × Corrective", why: "After-the-fact capacity, not entry prevention." },
          ],
        },
      ],
    },
  },
  {
    id: "H3",
    mode: "hard",
    station: "gap",
    order: 3,
    title: "Audit the coverage",
    prompt: "Northgate's deployed inventory: perimeter NGFW (block rules) · MFA on email · CCTV · SIEM alerts · badge readers · guard visitor log · AUP sanctions clause · awareness training · annual risk assessment. Select EVERY control type that is entirely MISSING from this inventory. Exact set required.",
    pillar: "DETECT",
    anchor: "Gap analysis across the six types",
    hints: [
      "Walk all six types one by one and try to name a deployed control for each. Two types will come up empty.",
    ],
    teachPass:
      "Corrective and compensating are absent — nothing restores, nothing substitutes. That's the same gap the ransomware exploited, found this time by walking the grid instead of by getting hit.",
    teachFail:
      "Walk the six types methodically: preventive (NGFW, MFA, training ✓), detective (CCTV, SIEM ✓), deterrent (sanctions ✓), physical (badges, guard ✓) — and then notice which two have no candidate at all.",
    payload: {
      kind: "choose",
      multi: true,
      intro: "Multi-select — the exact set of missing types.",
      options: [
        { id: "Preventive", label: "Preventive", why: "Covered — NGFW, MFA, and training all prevent." },
        { id: "Detective", label: "Detective", why: "Covered — CCTV and SIEM detect." },
        { id: "Corrective", label: "Corrective", why: "MISSING. Nothing in the list restores operations — no backups, no IR runbook. A single destructive hit could be existential.", correct: true },
        { id: "Compensating", label: "Compensating", why: "MISSING. No substitution mechanism exists for infeasible controls — and the flat legacy network needs one.", correct: true },
        { id: "Deterrent", label: "Deterrent", why: "Covered — the sanctions clause in the AUP deters." },
        { id: "Physical", label: "Physical", why: "Covered — the badge readers and the guard visitor log." },
      ],
      correct: ["Corrective", "Compensating"],
    },
  },
  {
    id: "H4",
    mode: "hard",
    station: "budget",
    order: 4,
    title: "Spend $18k, not a dollar more",
    prompt: "Budget: $18,000. Three findings, one option each — the correct trio must total exactly $18k AND be the technically sound choice. Near-misses fail.",
    pillar: "MITIGATE",
    anchor: "Control recommendation under cost constraints (treatment decisions)",
    hints: [
      "One option per finding is both technically right and budget-exact. Gold-plating and cheap theater are both traps.",
    ],
    teachPass:
      "Encryption 6k + fence 9k + training 3k = exactly 18k, and every dollar lands on the actual exposure. Control selection is optimization under constraints — not maximal spending.",
    teachFail:
      "Two failure modes to prune: over-budget gold-plating and cheap options that don't change the exposure. Find the option per finding that is BOTH sound and priced to sum to $18k.",
    payload: {
      kind: "register",
      findings: [
        {
          id: "b1",
          text: "Fleet laptop theft — quarterly data exposure.",
          tag: "BUDGET LINE 1",
          options: [
            { id: "o1", label: "Full-disk encryption", note: "$6,000", why: "Correct — removes the exposure at its root for a fraction of budget.", correct: true },
            { id: "o2", label: "Armed escort service for field techs", note: "$45,000", why: "Over budget and absurd for the risk." },
            { id: "o3", label: "Laptop tether cables", note: "$1,200", why: "Cheap, but cables stop opportunistic grabs, not data theft — the exposure remains." },
            { id: "o4", label: "Anti-theft email campaign", note: "$0", why: "Paper doesn't encrypt drives." },
          ],
        },
        {
          id: "b2",
          text: "Fence gaps — two break-ins this month.",
          tag: "BUDGET LINE 2",
          options: [
            { id: "o1", label: "Fence repair + monitored night patrols", note: "$9,000", why: "Correct — direct physical fix plus active deterrence and detection.", correct: true },
            { id: "o2", label: "New SIEM dashboards", note: "$12,000", why: "The SIEM correlates logs — it cannot see a fence." },
            { id: "o3", label: "Signage along the perimeter", note: "$300", why: "Deters the hesitant; the fence cutters are already undeterred." },
          ],
        },
        {
          id: "b3",
          text: "Phishing simulation click-rate at 14%.",
          tag: "BUDGET LINE 3",
          options: [
            { id: "o1", label: "Targeted micro-training + monthly simulations", note: "$3,000", why: "Correct — directly attacks the measured weakness.", correct: true },
            { id: "o2", label: "Third perimeter firewall", note: "$20,000", why: "Over budget, and the phish arrives inside accepted email traffic." },
            { id: "o3", label: "Disable email for everyone", note: "$0", why: "A logistics company without email is its own incident." },
          ],
        },
      ],
    },
  },
  {
    id: "H5",
    mode: "hard",
    station: "budget",
    order: 5,
    title: "Engineer the compensation",
    prompt: "Legacy OT server, vendor end-of-life, cannot be patched, sits where production depends on it. Select the THREE actions that together form a proper compensating control. Exactly three.",
    pillar: "MITIGATE",
    anchor: "Compensating control engineering: substitute + monitor + document",
    hints: [
      "A proper compensation shrinks reach, adds eyes, and leaves an audit trail. Exactly three options do that.",
    ],
    teachPass:
      "Isolation shrinks reach, monitoring adds the detective layer compensation needs, documentation makes it auditable and reviewed. Undocumented compensating controls degrade silently — that's why the paperwork is part of the control.",
    teachFail:
      "Reread the options: two are reckless (unsupported patches, guest Wi-Fi) and one is a decision, not a control (acceptance). Compensation = shrink reach + watch + document.",
    payload: {
      kind: "choose",
      multi: true,
      intro: "Multi-select — exactly three actions form the compensating control.",
      options: [
        { id: "o1", label: "Isolate on a dedicated VLAN with default-deny allowlisting", why: "Correct — shrinks the blast radius of the unfixable vulnerability.", correct: true },
        { id: "o2", label: "Enable enhanced monitoring and alerting on that segment", why: "Correct — compensation needs its own detective layer to catch exploitation attempts.", correct: true },
        { id: "o3", label: "Document the deviation, the compensating rationale, and a review date", why: "Correct — undocumented compensations decay silently; the record and review date keep them honest.", correct: true },
        { id: "o4", label: "Patch it anyway with an unsupported community build", why: "Unsupported patches in production OT are a new risk, not compensation." },
        { id: "o5", label: "Formally accept the risk and move on", why: "Acceptance is a treatment decision, not a compensating control — nothing substitutes for the missing patch." },
        { id: "o6", label: "Move it to the guest Wi-Fi network", why: "That's exposure relocation — it makes everything worse." },
      ],
      correct: ["o1", "o2", "o3"],
    },
  },
  {
    id: "H6",
    mode: "hard",
    station: "verify",
    order: 6,
    title: "Evidence or theater",
    prompt: "Five controls, three artifacts each. Pick the artifact that proves the control WORKS — the paper trail alone never does.",
    pillar: "DETECT",
    anchor: "Effectiveness verification across technical & nontechnical controls",
    hints: [
      "For every control, ask which artifact shows the control intercepting real activity.",
    ],
    teachPass:
      "Five for five: logs, counters, restore tests, behavior trends, anomaly reviews. Every control class — technical or nontechnical — has an observable. Finding it is the analyst's edge.",
    teachFail:
      "Datasheets, invoices, receipts, attendance and signed policies are theater. Re-pick the artifact in each triad that shows the control acting on real activity.",
    payload: {
      kind: "evidence",
      items: [
        {
          id: "v1",
          control: "MFA on email",
          question: "Which artifact proves effectiveness?",
          options: [
            { id: "o1", label: "Auth logs showing MFA challenges and blocked legacy-auth attempts", why: "Correct — the log shows the control intercepting real logins.", correct: true },
            { id: "o2", label: "The vendor's product datasheet with performance claims", why: "Marketing claims, not your reality." },
            { id: "o3", label: "The procurement invoice for this year's licenses", why: "Ownership isn't effectiveness." },
          ],
        },
        {
          id: "v2",
          control: "Perimeter firewall deny rules",
          question: "Which artifact proves effectiveness?",
          options: [
            { id: "o1", label: "Rule-hit counters and blocked-connection packet captures", why: "Correct — counters show rules firing on real traffic.", correct: true },
            { id: "o2", label: "Signed change tickets from every rule review", why: "Intent, not outcome." },
            { id: "o3", label: "The admin's config backup folder for rollback", why: "A config snapshot proves nothing about traffic." },
          ],
        },
        {
          id: "v3",
          control: "Backups",
          question: "Which artifact proves effectiveness?",
          options: [
            { id: "o1", label: "Restore-test report with recovery time achieved", why: "Correct — only restores prove recoverability.", correct: true },
            { id: "o2", label: "365 consecutive 'job success' emails from the scheduler", why: "The classic false comfort — jobs complete, restores fail." },
            { id: "o3", label: "Tape inventory spreadsheet with off-site counts", why: "Counts tapes, not recoverability." },
          ],
        },
        {
          id: "v4",
          control: "Awareness training",
          question: "Which artifact proves effectiveness?",
          options: [
            { id: "o1", label: "Sim click-rate trend + suspicious-email report-rate trend", why: "Correct — trends measure behavior change.", correct: true },
            { id: "o2", label: "Attendance sheets from all four quarterly sessions", why: "Delivery, not behavior." },
            { id: "o3", label: "The training budget line item for the year", why: "Spending isn't effect." },
          ],
        },
        {
          id: "v5",
          control: "Badge access to server room",
          question: "Which artifact proves effectiveness?",
          options: [
            { id: "o1", label: "Badge-log review surfacing off-hours anomalies", why: "Correct — reviews show the control producing actionable records.", correct: true },
            { id: "o2", label: "Badge reader brochure from the sales deck", why: "A brochure guards nothing." },
            { id: "o3", label: "Installation receipt with the contractor's sign-off", why: "Installation isn't operation." },
          ],
        },
      ],
    },
  },
  {
    id: "H7",
    mode: "hard",
    station: "war",
    order: 7,
    title: "Order of battle",
    prompt: "It's 11:47. Files are encrypting NOW. Order the five response actions correctly — each step enables the next. (Simplified sequence for training.)",
    pillar: "MITIGATE",
    anchor: "Corrective/preventive sequencing in live response",
    hints: [
      "Stop the bleeding before you rebuild; evict before you restore; harden last.",
    ],
    teachPass:
      "Contain → coordinate → evict → restore → harden. Each step enables the next: restore without eviction means re-encryption; no hardening means Tuesday looks identical to today.",
    teachFail:
      "Think dependency: containment stops spread, coordination structures everything after it, eviction must precede restoration, and hardening closes the story.",
    payload: {
      kind: "order",
      steps: [
        { id: "s1", label: "Isolate affected hosts", why: "Containment first — every minute of spread multiplies the corrective bill. (Detective tools told you where; this stops the bleeding.)" },
        { id: "s2", label: "Activate IR plan & engage stakeholders", why: "A coordinated response beats five heroes improvising — roles, legal, communications, evidence." },
        { id: "s3", label: "Reset credentials & rotate keys", why: "Eradication: stolen credentials and attacker persistence are evicted, or restored systems get re-encrypted." },
        { id: "s4", label: "Restore from immutable backups", why: "Recovery from known-good copies — the corrective control you verified in advance." },
        { id: "s5", label: "Patch the entry vector & enable MFA", why: "Prevention closes the door they used. Without this step, the incident repeats." },
      ],
      correct: ["s1", "s2", "s3", "s4", "s5"],
      presented: ["s4", "s1", "s5", "s2", "s3"],
    },
  },
  {
    id: "H8",
    mode: "hard",
    station: "war",
    order: 8,
    title: "Crown-jewel defense plan",
    prompt: "Build the WMS database defense: at least SIX controls covering at least FIVE of the six types — including preventive, detective, corrective AND the compensating pick for the legacy report server — with ZERO distractors.",
    pillar: "MITIGATE",
    anchor: "Defense in depth incl. compensation, attack-surface reduction",
    hints: [
      "Cover the required methods first, then fill types until five of six are lit — and leave the three off-asset decoys untouched.",
    ],
    teachPass:
      "Six layers across five types, compensation included, zero decoys. If the preventive layer fails tomorrow, the detective layer sees it and the corrective layer absorbs it — that is a defensible plan.",
    teachFail:
      "Check three things: the required methods are covered, five of six types are lit, and nothing off-asset (fleet, cafeteria, highway) slipped in. The compensating pick is mandatory — the legacy report server can't be patched.",
    payload: {
      kind: "depth",
      asset: "WMS database — 40,000 shipment records, the operational heart of Northgate",
      intro: "Toggle every control that belongs in the layered plan for this asset. Distractors cost you.",
      pool: [
        { id: "d1", label: "MFA gateway on WMS admin access", type: "Preventive", why: "Blocks credential misuse." },
        { id: "d2", label: "Firewall ACL limited to WMS subnets", type: "Preventive", why: "Shrinks the reachable surface." },
        { id: "d3", label: "Quarterly WMS patch cadence", type: "Preventive", why: "Addresses vulnerabilities — attack-surface reduction." },
        { id: "d4", label: "Database activity monitoring", type: "Detective", why: "Sees anomalous queries live." },
        { id: "d5", label: "SIEM correlation on WMS auth", type: "Detective", why: "Catches credential-abuse patterns." },
        { id: "d6", label: "Quarterly access review of WMS roles", type: "Detective", why: "Finds excess and dormant access before attackers do." },
        { id: "d7", label: "Immutable nightly off-site backups", type: "Corrective", why: "The restore path." },
        { id: "d8", label: "DR failover runbook + restore tests", type: "Corrective", why: "Rehearsed recovery, not hope." },
        { id: "d9", label: "Login warning banner", type: "Deterrent", why: "Discourages insider misuse." },
        { id: "d10", label: "Badge access to the server room", type: "Physical", why: "Hardware barrier." },
        { id: "d11", label: "Guard patrols at the data center", type: "Physical", why: "Human physical layer." },
        { id: "d12", label: "VLAN isolation for the legacy report server", type: "Compensating", why: "The unpatchable system's substitute protection." },
        { id: "d13", label: "Fleet GPS trackers", type: "Physical", why: "", distractor: true, distractorWhy: "A real control — for trucks, not the WMS database." },
        { id: "d14", label: "Cafeteria POS fraud alerts", type: "Detective", why: "", distractor: true, distractorWhy: "A real control — for the cafeteria, not this asset." },
        { id: "d15", label: "Speed radar on Route 9", type: "Deterrent", why: "", distractor: true, distractorWhy: "Highway safety equipment. No." },
      ],
      requiredTypes: ["Preventive", "Detective", "Corrective", "Compensating"],
      minPicks: 6,
      minTypes: 5,
    },
  },
  {
    id: "H9",
    mode: "hard",
    station: "doctrine",
    order: 9,
    title: "Arbitrate the disputes",
    prompt: "Two auditors, three disagreements. Choose the defensible classification for each — the 'why' is what CySA+ really examines.",
    pillar: "UNDERSTAND",
    anchor: "Nuanced boundaries: training, sanctions, badge readers",
    hints: [
      "Ask who delivers it (category) and what it primarily does (type). Secondary effects don't change the cell.",
    ],
    teachPass:
      "Three boundaries mastered: training is an operational process that prevents; sanctions are governance that deters; badge readers are technology implementing physical protection. Secondary effects (training deters, readers prevent) don't move the cell.",
    teachFail:
      "Anchor each on the primary method and the delivering layer — and remember CompTIA's convention that facility protection (locks, readers, guards) is the physical TYPE.",
    payload: {
      kind: "register",
      findings: [
        {
          id: "x1",
          text: "Security awareness training program — auditor A says 'Managerial × Deterrent', auditor B says 'Operational × Preventive'.",
          tag: "DISPUTE 1",
          options: [
            { id: "o1", label: "Auditor A — Managerial × Deterrent", why: "Training is delivered and repeated — a running process, not a governance artifact." },
            { id: "o2", label: "Auditor B — Operational × Preventive", why: "Correct. Executed by people/programs (operational) and designed to stop the phish before the click (preventive). Deterrent effects are secondary.", correct: true },
          ],
        },
        {
          id: "x2",
          text: "Sanctions clause in the AUP — auditor A says 'Operational × Preventive', auditor B says 'Managerial × Deterrent'.",
          tag: "DISPUTE 2",
          options: [
            { id: "o1", label: "Auditor A — Operational × Preventive", why: "Nothing operational runs the clause day-to-day; nothing is blocked by it either." },
            { id: "o2", label: "Auditor B — Managerial × Deterrent", why: "Correct. A governance document (managerial) whose sanction discourages misuse (deterrent).", correct: true },
          ],
        },
        {
          id: "x3",
          text: "Badge readers at the data-center doors — auditor A says 'Technical × Physical', auditor B says 'Technical × Corrective'.",
          tag: "DISPUTE 3",
          options: [
            { id: "o1", label: "Auditor A — Technical × Physical", why: "Correct. CompTIA's physical type covers real-world facility protection; the reader is the technology implementing that barrier. (Simplified convention.)", correct: true },
            { id: "o2", label: "Auditor B — Technical × Corrective", why: "Nothing is being restored — the reader guards the door." },
          ],
        },
      ],
    },
  },
];

/* ─── QUIZZES (C5) ────────────────────────────────────────────────────────── */

CG.QUIZ_MEDIUM = [
  {
    id: "mq1",
    prompt: "An annual risk assessment approved by leadership is which category of control?",
    options: [
      { id: "a", label: "Managerial" },
      { id: "b", label: "Operational" },
      { id: "c", label: "Technical" },
      { id: "d", label: "Physical" },
    ],
    correct: "a",
    explain: "Governance-level decision-making and sign-off = managerial. The assessment may use technical tools, but the control itself is the governance act.",
  },
  {
    id: "mq2",
    prompt: "A control that discourages an attacker from even trying is:",
    options: [
      { id: "a", label: "Preventive" },
      { id: "b", label: "Deterrent" },
      { id: "c", label: "Compensating" },
      { id: "d", label: "Corrective" },
    ],
    correct: "b",
    explain: "Deterrence works on the decision to attempt — banners, sanctions, signage. It neither blocks nor records.",
  },
  {
    id: "mq3",
    prompt: "Your legacy app can't support MFA. Putting it behind an SSO gateway with IP allowlisting is a:",
    options: [
      { id: "a", label: "Preventive control" },
      { id: "b", label: "Deterrent control" },
      { id: "c", label: "Compensating control" },
      { id: "d", label: "Corrective control" },
    ],
    correct: "c",
    explain: "The ideal control is infeasible; a documented substitute provides comparable protection — that's compensation.",
  },
  {
    id: "mq4",
    prompt: "Which of these is a NONTECHNICAL measure?",
    options: [
      { id: "a", label: "Security awareness training for all staff" },
      { id: "b", label: "Full-disk encryption on every laptop" },
      { id: "c", label: "Next-gen firewall at the perimeter" },
      { id: "d", label: "Biometric badge readers at every door" },
    ],
    correct: "a",
    explain: "Training and awareness change human behavior — nontechnical by definition. Encryption, firewalls and badge systems are technology enforcing security, however valuable.",
  },
  {
    id: "mq5",
    prompt: "A firewall blocking unsolicited inbound traffic is:",
    options: [
      { id: "a", label: "Technical × Preventive" },
      { id: "b", label: "Technical × Detective" },
      { id: "c", label: "Operational × Preventive" },
      { id: "d", label: "Managerial × Preventive" },
    ],
    correct: "a",
    explain: "Technology (technical) stopping the incident before it occurs (preventive) — the cleanest cell on the grid.",
  },
  {
    id: "mq6",
    prompt: "A guard logging visitors at the warehouse door is:",
    options: [
      { id: "a", label: "Technical × Physical" },
      { id: "b", label: "Operational × Physical" },
      { id: "c", label: "Operational × Detective" },
      { id: "d", label: "Managerial × Physical" },
    ],
    correct: "b",
    explain: "Physical type (facility protection) delivered by a person running a process (operational). Badge readers hit the same type via technology.",
  },
  {
    id: "mq7",
    prompt: "Defense in depth means:",
    options: [
      { id: "a", label: "One strong firewall guarding the whole perimeter" },
      { id: "b", label: "Layered control types covering each other's failures" },
      { id: "c", label: "Technical controls only, for speed of response" },
      { id: "d", label: "A single password policy reused everywhere" },
    ],
    correct: "b",
    explain: "Depth = variety across methods: preventive fails → detective catches → corrective restores. Any single strong control — even a great one — is a single point of failure.",
  },
];

CG.QUIZ_HARD = [
  {
    id: "hq1",
    prompt: "A clinic's legacy app can't do MFA. Which response best treats the risk?",
    options: [
      { id: "a", label: "Accept the risk and revisit in five years" },
      { id: "b", label: "SSO gateway with allowlisting, logging, and a review date" },
      { id: "c", label: "Email all staff to be extra careful" },
      { id: "d", label: "Install a second firewall at the network edge" },
    ],
    correct: "b",
    explain: "A documented, monitored substitute for an infeasible control is compensation — and the review date keeps it honest. Acceptance treats nothing, and a second firewall never touches this app's credential risk.",
  },
  {
    id: "hq2",
    prompt: "Which artifact BEST proves backup effectiveness?",
    options: [
      { id: "a", label: "365 consecutive 'backup job success' emails" },
      { id: "b", label: "The backup vendor's SLA document" },
      { id: "c", label: "A restore test with recovery time achieved" },
      { id: "d", label: "The tape inventory spreadsheet, up to date" },
    ],
    correct: "c",
    explain: "Only an actual restore proves recoverability. Success emails, SLAs and inventories are existence evidence — the classic false comfort after a ransomware hit.",
  },
  {
    id: "hq3",
    prompt: "Ransomware hit; there were no offline backups and no IR plan. Operations halted five days. Which type was absent?",
    options: [
      { id: "a", label: "Preventive" },
      { id: "b", label: "Corrective" },
      { id: "c", label: "Deterrent" },
      { id: "d", label: "Physical" },
    ],
    correct: "b",
    explain: "Prevention and detection existed but failed; corrective capacity absorbs failure. Without it, every incident is a catastrophe.",
  },
  {
    id: "hq4",
    prompt: "Which statement about control evidence is TRUE?",
    options: [
      { id: "a", label: "A signed policy proves the control works" },
      { id: "b", label: "Signed policies show existence, never effectiveness" },
      { id: "c", label: "Human controls can't be measured at all" },
      { id: "d", label: "Deterrents affect every attacker equally" },
    ],
    correct: "b",
    explain: "Existence is not effectiveness — a signature proves intent. But human controls ARE measurable (simulation click rates), and deterrents only work on actors who notice and care.",
  },
  {
    id: "hq5",
    prompt: "Warehouse break-ins through fence gaps. Best first treatment?",
    options: [
      { id: "a", label: "Add fence-cutting awareness to the training deck" },
      { id: "b", label: "Buy a WAF for the public website" },
      { id: "c", label: "Repair the fence; add monitored patrols" },
      { id: "d", label: "Shift the budget to cloud security" },
    ],
    correct: "c",
    explain: "Treat the actual vector: physical gaps get physical fixes, verified by active monitoring. The other options are scope-mismatched or cosmetic — awareness and WAFs never stopped a fence cutter.",
  },
  {
    id: "hq6",
    prompt: "'Credential sharing is a sanctionable offense' in the AUP is:",
    options: [
      { id: "a", label: "Operational × Preventive" },
      { id: "b", label: "Technical × Preventive" },
      { id: "c", label: "Managerial × Corrective" },
      { id: "d", label: "Managerial × Deterrent" },
    ],
    correct: "d",
    explain: "Governance document; the sanction discourages. Nothing is blocked, recorded, or restored by the clause itself.",
  },
  {
    id: "hq7",
    prompt: "Which action most directly MINIMIZES the attack surface?",
    options: [
      { id: "a", label: "Deploying antivirus suites on every endpoint" },
      { id: "b", label: "Hiring additional SOC analysts for monitoring" },
      { id: "c", label: "Disabling unused services and closing ports" },
      { id: "d", label: "Purchasing additional cyber insurance coverage" },
    ],
    correct: "c",
    explain: "Hardening removes doors; antivirus guards them, analysts watch them, insurance pays for them. Only removal shrinks the surface an attacker can touch.",
  },
];

/* ─── DEBRIEF (C6) ────────────────────────────────────────────────────────── */

CG.DEBRIEF = {
  verification: [
    { source: "Auth / VPN logs", shows: "MFA challenges firing, legacy-auth blocked — preventive control observed working" },
    { source: "NGFW logs & rule counters", shows: "Deny rules firing on real traffic — preventive rules alive, not just configured" },
    { source: "Restore-test reports", shows: "Corrective capacity proven: RTO achieved, data usable" },
    { source: "Badge & visitor logs", shows: "Physical layer producing reviewable records — off-hours anomalies surface" },
    { source: "Phishing-sim metrics", shows: "Nontechnical control effectiveness: click-rate trend, report-rate trend" },
    { source: "SIEM alert metrics", shows: "Detective tuning: true-positive ratio, coverage of mapped scenarios" },
  ],
  mitigationRecs: [
    { id: "M1017", name: "User Training", cell: "Operational × Preventive", note: "Retarget training from sim data; measure click/report rates quarterly." },
    { id: "M1032", name: "Multi-Factor Authentication", cell: "Technical × Preventive", note: "Close the VPN gap first — it was the chain's door." },
    { id: "M1053", name: "Data Backup", cell: "Technical × Corrective", note: "Immutable, off-site, restore-tested. The three-word ransomware answer." },
    { id: "M1030", name: "Network Segmentation", cell: "Technical × Prev/Comp", note: "Isolate legacy OT; default-deny allowlists between zones." },
    { id: "M1028", name: "Operating System Configuration", cell: "Technical × Preventive", note: "Hardening baselines: remove services, close ports — surface reduction." },
  ],
  blue: [
    "Classify before you buy: every control request should land in a cell — if you can't place it, you can't measure it.",
    "Verify effectiveness, not existence: invoices and signatures are paper; observed behavior is proof.",
    "Every control needs a type-mate: prevention needs detection, detection needs correction.",
    "Compensating controls are contracts: substitute + documented + monitored + review date.",
    "Walk the grid quarterly — the H3 exercise is a 10-minute audit that finds what ransomware would find.",
  ],
  red: [
    "Attackers probe the seams between layers — prevention that lacks detection means free dwell time.",
    "Paper controls are the cheapest wins: a sanctions clause nobody enforces deters nobody.",
    "Deterrents only work on observers — banner fatigue is a real attack surface.",
    "Unmonitored compensating controls decay silently; legacy VLAN allowlists drift until someone checks.",
  ],
  links: [
    { label: "CompTIA CySA+ CS0-003 exam objectives", url: "https://www.comptia.org/certifications/cybersecurity-analyst" },
    { label: "MITRE ATT&CK — Mitigations index", url: "https://attack.mitre.org/mitigations/" },
    { label: "MITRE D3FEND — countermeasure taxonomy", url: "https://d3fend.mitre.org/" },
  ],
  nextSteps: [
    "CySA+ Domain 2 next: vulnerability scanning, output analysis, and remediation sequencing.",
    "Practice the grid on your own org: place every real control you own in a cell this week.",
    "Read the MITRE mitigation pages linked above and map each to a category × type cell.",
  ],
};

CG.PILLAR_ORDER = ["UNDERSTAND", "RECOGNIZE", "DETECT", "MITIGATE"];

CG.TYPE_ABBR = { Preventive: "PREV", Detective: "DETC", Corrective: "CORR", Compensating: "COMP", Deterrent: "DETR", Physical: "PHYS" };
CG.CAT_ABBR = { Managerial: "MGR", Operational: "OPS", Technical: "TEC" };

/* Briefing tooltip definitions (GlossaryTooltip term texts) */
CG.TOOLTIPS = {
  northgate: "Northgate Logistics Group — a fictional mid-sized freight and warehousing company: one HQ tower, a regional warehouse campus, a 220-truck fleet, and a data center moving 40,000 shipment records a day.",
  grid: "The lab's centerpiece: every safeguard gets pinned to one cell — its category (who implements it) × its type (how it acts).",
  exam: "CompTIA CySA+ CS0-003, Domain 2 — 'Given a scenario, recommend controls to mitigate attacks and software vulnerabilities.' The exam hands you exactly this kind of scenario and asks you to classify and recommend controls.",
  technical: "Technical measures: firewalls, encryption, MFA, EDR, SIEM — technology enforcing security.",
  nontechnical: "Nontechnical measures: employee training, awareness, policy — people and governance reducing risk.",
  surface: "Attack surface: every point where an unauthorized actor could try to enter or cause harm. Minimizing it means removing doors, not watching them.",
};
