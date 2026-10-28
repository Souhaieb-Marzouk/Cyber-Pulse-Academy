/* ======================================================================
   js/data.js — ALL LAB CONTENT (data only, no logic)
   Every objective, quiz item, log line, glossary term and answer key of the original lab.
   Ported 1:1 from the original CyberLab "SOC Modernization Sprint" (Next.js) —
   content, wording, answers, hints and feedback are byte-identical (SC-D4).
   ====================================================================== */

(function () {
"use strict";
const GLOSSARY = [
  { term: "SOAR", def: "Security Orchestration, Automation and Response — a platform that connects security tools, automates workflows and manages response actions." },
  { term: "Orchestration", def: "Coordinating separate tools (SIEM, sandbox, ticketing, mail gateway) so they act as one ordered flow." },
  { term: "Automation", def: "Executing tasks without human intervention — at machine speed, 24/7, the same way every time." },
  { term: "Playbook", def: "In SOAR: the encoded decision-tree the platform executes automatically (trigger → steps → actions)." },
  { term: "Runbook", def: "A manual, step-by-step procedure a trained human follows to complete a process." },
  { term: "Workflow", def: "The ordered sequence of steps inside an automation, including decisions and branches." },
  { term: "Use case", def: "A specific, repeatable scenario chosen for automation, e.g. “phishing-report triage”." },
  { term: "Connector", def: "The integration link between the SOAR platform and an external tool or system." },
  { term: "Triage", def: "Sorting and making a first assessment of incoming alerts by priority and type." },
  { term: "MTTD", def: "Mean Time To Detect — average time from first malicious evidence to detection." },
  { term: "MTTR", def: "Mean Time To Respond — average time from detection to containment/resolution." },
  { term: "False-positive rate", def: "Share of alerts that turn out benign; a high rate wastes analyst hours and erodes trust in automation." },
  { term: "SLA", def: "Service Level Agreement — a time target for handling tickets or incidents (e.g. respond to P1 within 4 h)." },
  { term: "KPI / KRI", def: "Key Performance Indicator measures how well a process runs; a Key Risk Indicator measures rising risk (e.g. over-alerting)." },
  { term: "Continuous monitoring", def: "Always-on, real-time observation of systems and controls rather than periodic spot-checks." }
];
const BENEFITS = [
  { id: "b1", label: "Automating mundane processes frees analysts for strategic tasks", short: "Frees analyst time" },
  { id: "b2", label: "Shifts the SOC from reactive to proactive operations", short: "Reactive → proactive" },
  { id: "b3", label: "Detects potential threats in real time and alerts analysts quickly", short: "Real-time detection & alerting" },
  { id: "b4", label: "Helps provide faster customer service", short: "Faster customer service" },
  { id: "b5", label: "Improves compliance", short: "Compliance strength" },
  { id: "b6", label: "Gives leadership insights and data for informed decisions", short: "Leadership insights" }
];
const TERM_OPTIONS = [
  { id: "orchestration", text: "Orchestration" },
  { id: "consolidation", text: "Consolidation" },
  { id: "segmentation", text: "Segmentation" },
  { id: "baseline", text: "Baseline validation" }
];
const PAINS = [
  { id: "p1", text: "Analysts spend ~3 h/day manually closing duplicate newsletter-phish reports.", correct: "b1" },
  { id: "p2", text: "Breaches are discovered days later — nothing watches overnight.", correct: "b3" },
  { id: "p3", text: "Customers wait days for ticket updates; SLA breaches are common.", correct: "b4" },
  { id: "p4", text: "Every audit turns into a two-week scramble to assemble evidence.", correct: "b5" },
  { id: "p5", text: "Threat hunting only happens ad-hoc, after an incident forces it.", correct: "b2" }
];
const CLASSIFY = [
  { id: "c1", text: "“If sandbox verdict = malicious → isolate host, open ticket, page on-call.” Executed by the SOAR engine.", correct: "playbook" },
  { id: "c2", text: "A 12-step PDF the on-call analyst follows to contain a ransomware host.", correct: "runbook" },
  { id: "c3", text: "Runs at 03:00 and makes thousands of identical decisions with no human clicking.", correct: "playbook" },
  { id: "c4", text: "Requires a trained human to read each step and perform it.", correct: "runbook" },
  { id: "c5", text: "Best fit for repeatable, high-volume, low-judgment decisions at machine speed.", correct: "playbook" }
];
const HANDOVER = [
  { id: "i4", text: "Coffee machine was flagged as C2 by the scanner — false alarm from a scan-window misconfig, resolved.", systemic: false },
  { id: "i1", text: "14 analyst-hours/week are burned on duplicate newsletter-phish reports.", systemic: true, benefit: "b1" },
  { id: "i5", text: "CEO laptop fan is noisy — ticket handed to desktop support.", systemic: false },
  { id: "i2", text: "Nothing monitored Saturday–Sunday nights; last month a breach sat unnoticed for 3 days.", systemic: true, benefit: "b3" },
  { id: "i6", text: "Floor-2 printer jammed; paper replaced by facilities.", systemic: false },
  { id: "i3", text: "Q3 audit prep needs two weeks of manual evidence collection, again.", systemic: true, benefit: "b5" },
  { id: "i7", text: "Loading-dock badge reader offline — facilities notified, physical access log reviewed.", systemic: false },
  { id: "i8", text: "Inbound freight delayed by weather — logistics informed.", systemic: false }
];
const HANDOVER_CORRECT = ["i1", "i2", "i3"];
const PHISH_STEPS = [
  { id: "S1", text: "TRIGGER — new phishing report (gateway tag or user “Report Phish” click)" },
  { id: "S2", text: "ENRICH — extract sender, URLs and attachments from the reported mail" },
  { id: "S3", text: "DETONATE — run attachments/URLs in the sandbox" },
  { id: "S4", text: "SCORE — combine reputation feeds + sandbox verdict into a classification" },
  { id: "S5", text: "DECIDE — benign → auto-close & notify reporter · malicious/unknown → escalate" },
  { id: "S6", text: "RECORD — open ticket, attach evidence, write the audit log" }
];
const PHISH_CORRECT = ["S1", "S2", "S3", "S4", "S5", "S6"];
const PHISH_INIT = ["S3", "S1", "S5", "S2", "S6", "S4"];
const TRIGGERS = [
  { id: "t1", text: "Any email arriving in the CEO’s mailbox" },
  { id: "t2", text: "Gateway tags suspected-phishing OR a user clicks “Report Phish”" },
  { id: "t3", text: "Once per day at 09:00, batch mode" }
];
const TRIGGER_CORRECT = "t2";
const CONNECTORS = [
  { id: "c-gateway", text: "Email security gateway", why: "Receives reports and enforces quarantine.", need: true },
  { id: "c-sandbox", text: "Detonation sandbox", why: "Produces attachment/URL verdicts.", need: true },
  { id: "c-ticket", text: "ITSM ticketing system", why: "Creates cases and stores audit evidence.", need: true },
  { id: "c-hr", text: "HR payroll system", why: "No step of this workflow touches HR data.", need: false },
  { id: "c-facil", text: "Building access control", why: "Physical security — outside this workflow.", need: false }
];
const CRED_STEPS = [
  { id: "s1", text: "TRIGGER — auth-failure rate > 5× baseline for 10 minutes" },
  { id: "s2", text: "CORRELATE — group failed logins by source IP + user-agent" },
  { id: "s3", text: "ENRICH — check each source IP against threat-intel feeds" },
  { id: "s4", text: "BRANCH A — if intel hits ≥ 2 → rate-limit / block at the edge" },
  { id: "s5", text: "BRANCH B — for affected accounts → force MFA re-challenge + notify user" },
  { id: "s6", text: "TICKET — open a case and attach the correlation evidence" },
  { id: "s7", text: "RECORD — log the run for the weekly workflow review" }
];
const CRED_CORRECT = ["s1", "s2", "s3", "s4", "s5", "s6", "s7"];
const CRED_INIT = ["s5", "s2", "s7", "s1", "s4", "s3", "s6"];
const CRED_BRANCHES = [
  {
    id: "branchIntel",
    q: "BRANCH A — threat intel returns ≥ 2 hits on the source IP. The playbook should…",
    options: ["Only add a note and keep monitoring", "Rate-limit / block the source at the edge", "Auto-close it as a routine failed-login blip"],
    correct: 1
  },
  {
    id: "branchAccounts",
    q: "BRANCH B — accounts appear in the correlated failures. The playbook should…",
    options: ["Delete the affected accounts and revoke their sessions", "Queue a daily digest email for those accounts", "Force an MFA re-challenge and notify the users"],
    correct: 2
  }
];
const DISPOSITIONS = [
  { id: "d-close", text: "Close as benign (document reason)" },
  { id: "d-esc", text: "Escalate to analyst for investigation" },
  { id: "d-contain", text: "Isolate host / block source, then escalate" },
  { id: "d-digest", text: "Route to daily digest queue" }
];
const ALERTS = [
  { id: "A1", title: "Phish report: “Invoice_2024.pdf” attachment from unknown external sender", src: "Email gateway", mitre: "T1566", pri: "P3", correct: "d-esc" },
  { id: "A2", title: "Known credential-dumping tool hash detected on FIN-LT-04", src: "EDR", mitre: "T1003", pri: "P1", correct: "d-contain" },
  { id: "A3", title: "VPN brute-force burst from 203.0.113.77 (unseen IP, 412 failures/5 min)", src: "Firewall", mitre: "T1110", pri: "P2", correct: "d-contain" },
  { id: "A4", title: "One user flagged a bulk marketing newsletter (300 recipients, same send)", src: "Email gateway", mitre: "—", pri: "P4", correct: "d-close" },
  { id: "A5", title: "Impossible-travel sign-in for CTO — MFA passed, travel pre-registered via corporate VPN", src: "Identity provider", mitre: "T1078", pri: "P3", correct: "d-close" }
];
const RUN_SCRIPT = [
  { t: "09:41:02", msg: "▶ PLAYBOOK phish-triage START — trigger: gateway tag / user report (12 reports queued)", tone: "info" },
  { t: "09:41:03", msg: "ENRICH R-101…R-112 — senders, URLs and attachments extracted", tone: "info" },
  { t: "09:41:05", msg: "DETONATE R-101 sandbox verdict: clean (marketing newsletter)", tone: "ok" },
  { t: "09:41:06", msg: "✓ AUTO-CLOSE R-101 — mass-mail · reporter notified", tone: "ok" },
  { t: "09:41:09", msg: "✓ AUTO-CLOSE R-102 — mass-mail · reporter notified", tone: "ok" },
  { t: "09:41:12", msg: "✓ AUTO-CLOSE R-103 — known-good sender · reporter notified", tone: "ok" },
  { t: "09:41:15", msg: "✓ AUTO-CLOSE R-104 — mass-mail · reporter notified", tone: "ok" },
  { t: "09:41:17", msg: "✓ AUTO-CLOSE R-105 — clean verdict · reporter notified", tone: "ok" },
  { t: "09:41:19", msg: "✓ AUTO-CLOSE R-106 — mass-mail · reporter notified", tone: "ok" },
  { t: "09:41:21", msg: "✓ AUTO-CLOSE R-107 — clean verdict · reporter notified", tone: "ok" },
  { t: "09:41:23", msg: "✓ AUTO-CLOSE R-108 — mass-mail · reporter notified", tone: "ok" },
  { t: "09:41:25", msg: "✓ AUTO-CLOSE R-109 — known-good sender · reporter notified", tone: "ok" },
  { t: "09:41:27", msg: "✓ AUTO-CLOSE R-110 — clean verdict · reporter notified", tone: "ok" },
  { t: "09:41:28", msg: "⚑ R-111 — sandbox 5/10, reputation unknown → ESCALATED to analyst tray", tone: "warn" },
  { t: "09:41:29", msg: "⚠ R-112 — verdict: credential phishing 9/10 → ESCALATED + password resets queued", tone: "bad" },
  { t: "09:41:30", msg: "■ RUN COMPLETE — 12 processed · 10 auto-closed · 2 escalated · 28 s wall time", tone: "info" }
];
const RUN_CORRECT_COUNT = 10;
const RUN_FIRST_CLOSE = "09:41:06";
const ESCALATIONS = [
  {
    id: "E1",
    title: "R-111 — “Invoice_2024.pdf”: sandbox score 5/10, reputation unknown",
    options: [
      { id: "e1a", text: "Auto-close as benign — 5/10 is probably fine" },
      { id: "e1b", text: "Send to deep detonation + senior analyst review" },
      { id: "e1c", text: "Quarantine the entire corporate mail server immediately" },
      { id: "e1d", text: "Just mark it as spam and move on" }
    ],
    correct: "e1b"
  },
  {
    id: "E2",
    title: "R-112 — vendor-portal “password expiring” page: verdict credential phishing (9/10), 2 users clicked",
    options: [
      { id: "e2a", text: "Close as benign — looks like a routine IT notice" },
      { id: "e2b", text: "Mark the whole report as spam and close the incident" },
      { id: "e2c", text: "Escalate to IR + force password reset for the 2 clickers" },
      { id: "e2d", text: "Reply to the sender to ask if it is legitimate" }
    ],
    correct: "e2c"
  }
];
const TIMELINE = [
  { t: "02:01", msg: "TRIGGER bulk wave — 40 user-reported mails in 3 min. Naive playbook v0 starts (no score gate).", tone: "info" },
  { t: "02:01", msg: "ACTION quarantines ALL reported mail immediately — before any verdict.", tone: "bad" },
  { t: "02:02", msg: "AUTO-CLOSE 38 reports as “spam”. AL-3301 duplicate storm noted (same mail reported 30×).", tone: "warn" },
  { t: "02:03", msg: "⚑ AL-3312 escalated — the finance team reported the same “invoice” thread repeatedly.", tone: "warn" },
  { t: "02:06", msg: "Analyst finds AL-3312 was a LEGIT vendor-invoice batch — now quarantined; accounts-payable is blocked.", tone: "bad" },
  { t: "03:12", msg: "FIN-DB-01 pushes 4.2 GB to unknown ASN — routed to morning digest only (no one sees it overnight).", tone: "bad" },
  { t: "07:30", msg: "SLA breach: last night’s brute-force ticket left unassigned — AL-3298 had been mislabeled P4.", tone: "warn" }
];
const TIMELINE_QS = [
  {
    id: "timelineA",
    q: "Which alert did the naive playbook mishandle?",
    options: ["AL-3301 — the duplicate report storm", "AL-3312 — the legit vendor-invoice batch", "AL-3298 — the mislabeled severity"],
    correct: 1
  },
  {
    id: "timelineB",
    q: "What design flaw caused it?",
    options: ["It auto-opened tickets with the wrong severity labels", "It did not notify the reporters of its decisions", "It quarantined before any reputation/sandbox verdict — no score gate"],
    correct: 2
  },
  {
    id: "timelineC",
    q: "Which SINGLE step addition fixes the design?",
    options: ["Disable all user phishing reports at the gateway", "Insert a SCORE gate before any quarantine or auto-close", "Hire three more analysts to review every report manually"],
    correct: 1
  }
];
const FP_ALERTS = [
  { id: "F1", text: "Known credential-dumping tool hash on OPS-LT-03", correct: "TP" },
  { id: "F2", text: "Bulk newsletter flagged by 1 of 300 recipients", correct: "FP" },
  { id: "F3", text: "Brute-force burst from a known scanner IP against the VPN", correct: "TP" },
  { id: "F4", text: "Impossible-travel sign-in — MFA passed, user on verified travel", correct: "FP" },
  { id: "F5", text: "Reported phish — sandbox verdict 9/10 malicious", correct: "TP" },
  { id: "F6", text: "03:12 — FIN-DB-01 pushes 4.2 GB to a first-seen foreign ASN", correct: "TP" }
];
const FP_ESC_CORRECT = "F6";
const CONTROLS = ["EDR agent", "OS patch ≤ 30 d", "MFA enrolled", "Disk encrypted"];
const HOSTS = [
  { host: "WH-LT-01", checks: [true, true, true, true] },
  { host: "FIN-LT-04", checks: [true, true, true, true] },
  { host: "WH-KS-07", checks: [false, true, true, true] },
  { host: "DC-02", checks: [true, true, true, true] },
  { host: "OPS-LT-03", checks: [true, true, true, true] },
  { host: "BDR-SRV-01", checks: [true, true, true, true] }
];
const FAIL_HOST = "WH-KS-07";
const FAIL_CONTROL = "EDR agent";
const PRIORITIES = [
  { id: "P1", text: "P1 — respond within 4 h" },
  { id: "P2", text: "P2 — respond within 24 h" },
  { id: "P3", text: "P3 — respond within 72 h" },
  { id: "P4", text: "P4 — respond within 7 days" }
];
const TICKET_PRIORITY_CORRECT = "P2";
const WATCH_LINES = [
  { t: "22:00", msg: "Continuous monitoring ON — EDR, mail, identity and flow feeds streaming…", tone: "info" },
  { t: "00:47", msg: "…heartbeat OK — 0 critical events", tone: "info" },
  { t: "02:15", msg: "…heartbeat OK — 0 critical events", tone: "info" },
  { t: "03:12", msg: "⚡ ANOMALY — FIN-DB-01 pushed 4.2 GB to a first-seen foreign ASN", tone: "bad" }
];
const ANOMALY_ROUTE_CORRECT = "r-page";
const ANOMALY_ROUTES = [
  { id: "r-digest", text: "Add it to the morning email digest for review" },
  { id: "r-page", text: "Page the on-call analyst now + open a P1 ticket" },
  { id: "r-wait", text: "Wait for business hours and re-check the transfer manually" }
];
const TUNE_FIX_OPTIONS = [
  { id: "fix-gate", text: "Add a verdict gate: require sandbox + majority reputation before any auto-close" },
  { id: "fix-off", text: "Disable auto-close entirely — a human analyst reads every phish report" },
  { id: "fix-thresh", text: "Raise the global SIEM thresholds so that low-severity alerts are dropped" }
];
const TUNE_FIX_CORRECT = "fix-gate";
const TUNE_PREDICT_OPTIONS = [
  { id: "pred-a", text: "FP rate falls sharply, close time rises slightly, SLA stays met" },
  { id: "pred-b", text: "FP rate unchanged, speed drops hard, SLA breaches pile up" },
  { id: "pred-c", text: "FP falls but real phishing reports get missed in bulk" }
];
const TUNE_PREDICT_CORRECT = "pred-a";
const EVIDENCE = [
  { id: "v-shot", text: "A screenshot of yesterday’s dashboard", valid: false },
  { id: "v-logs", text: "Continuous control-check logs covering the full 90 days", valid: true },
  { id: "v-verbal", text: "Verbal attestation from the platform owner", valid: false },
  { id: "v-snap", text: "Signed nightly compliance snapshots", valid: true },
  { id: "v-scan", text: "One manual scan from last week", valid: false },
  { id: "v-ticket", text: "Auto-remediation ticket history with timestamps", valid: true }
];
const SLA_TICKETS = [
  { id: "T1", text: "T1 · P3 (72 h SLA) — patch batch · opened 70 h ago", manual: true },
  { id: "T2", text: "T2 · P1 (4 h SLA) — active intrusion indicators · opened 30 min ago", manual: true },
  { id: "T3", text: "T3 · P2 (24 h SLA) — phish report, sandbox verdict pending · opened 6 h ago", manual: false },
  { id: "T4", text: "T4 · P2 (24 h SLA) — routine phish report · opened 2 h ago", manual: false }
];
const SLA_CORRECT_ORDER = ["T2", "T1", "T3", "T4"];
const METRICS = [
  { id: "mttd", label: "MTTD (mean time to detect)", before: "4 h 12 m", after: "58 m", good: "down" },
  { id: "mttr", label: "MTTR (mean time to respond)", before: "31 h 05 m", after: "9 h 40 m", good: "down" },
  { id: "sla", label: "SLA met", before: "74 %", after: "96 %", good: "up" },
  { id: "vol", label: "Alerts triaged per week", before: "340", after: "2,150", good: "up" },
  { id: "fp", label: "False-positive rate", before: "27 %", after: "19 %", good: "down" },
  { id: "hours", label: "Analyst hours on mundane work / week", before: "96", after: "38", good: "down" },
  { id: "coffee", label: "Coffee consumption", before: "flat", after: "flat", good: "up" }
];
const KPI_CORRECT = ["mttd", "mttr", "sla"];
const BUDGET_OPTIONS = [
  { id: "budget-a", text: "Hire four more analysts and keep everything manual" },
  { id: "budget-b", text: "Expand SOAR use cases + tune the false positives" },
  { id: "budget-c", text: "Replace analysts with full automation, no human gates" },
  { id: "budget-d", text: "Keep the status quo for two more quarters" }
];
const BUDGET_CORRECT = "budget-b";
const BUDGET_CITES = [
  { id: "cite-vol", text: "Alert volume handled grew ×6.3 with the same 8-person team", ok: true },
  { id: "cite-office", text: "The office relocation is scheduled for Q3", ok: false },
  { id: "cite-coverage", text: "Only 40 % of candidate use cases are automated — clear headroom", ok: true },
  { id: "cite-coffee", text: "Coffee consumption has stayed flat", ok: false },
  { id: "cite-fp", text: "FP rate is still 19 % — tuning will return even more analyst hours", ok: true }
];
const STRATEGY_OPTIONS = [
  { id: "str-a", text: "A — Expand SOAR use cases with human-in-the-loop gates and FP tuning" },
  { id: "str-b", text: "B — Full automation: remove all human gates for maximum speed" },
  { id: "str-c", text: "C — Freeze all automation and solve capacity by hiring analysts" },
  { id: "str-d", text: "D — Keep the status quo unchanged for two more quarters" }
];
const STRATEGY_CORRECT = "str-a";
const STRATEGY_CITES = [
  { id: "k-coverage", text: "Automation coverage is 40 % — proven headroom exists", ok: true },
  { id: "k-move", text: "The office relocation is planned for Q3", ok: false },
  { id: "k-kri", text: "Over-alerting KRI up 31 % — expansion must include tuning", ok: true },
  { id: "k-mttd", text: "MTTD is fine — so no action is needed anywhere", ok: false },
  { id: "k-roi", text: "MTTR down 69 % — the program’s ROI is demonstrated", ok: true }
];
const ADVERSARY_NOTES = [
  "Probes with <10 failed logins/min/IP — far below the 50/min auto-block threshold.",
  "Mimics newsletter timing (09:00) so phish blends into the auto-close wave.",
  "Knows auto-review runs on the hour and times actions at :05 past."
];
const COUNTERS = [
  { id: "x-none", text: "Remove thresholds so every event alerts a human", ok: false },
  { id: "x-baseline", text: "Tune volume baselines + add human review sampling for low-and-slow patterns", ok: true },
  { id: "x-blockall", text: "Auto-block anything that trips twice", ok: false },
  { id: "x-hunt", text: "Randomize review sampling and keep scheduled threat hunts on the calendar", ok: true },
  { id: "x-window", text: "Extend alert windows to 24 h to smooth the noise", ok: false }
];
const OBJECTIVES = [
  {
    id: "OBJ-M1",
    mode: "medium",
    day: 1,
    pillar: "P1",
    title: "Name the coordinating capability",
    prompt: "The SOC needs the SIEM, the sandbox and the ticketing system to act as one coordinated flow. Which term names that capability? Pick it below.",
    anchor: "Lesson vocabulary — SOAR: “orchestration” as the coordinating layer of automation",
    look: "Re-read “The terms on the board” in the Knowledge Core above.",
    hints: [
      "It is not automation itself — automation executes tasks; this capability connects the tools.",
      "Think “conductor of an orchestra”: separate instruments (tools) playing one sequence.",
      "The word is one of the three words in SOAR and starts with O."
    ],
    feedbackPass: "Orchestration is the connective tissue of SOAR: it chains mail gateway, sandbox, SIEM and ticketing into one repeatable flow. Defenders win with the flow, not with any single tool.",
    feedbackFail: "Not quite — orchestration coordinates multiple tools into one flow; automation is the execution of tasks without a human. Re-read the Knowledge Core and pick again."
  },
  {
    id: "OBJ-M2",
    mode: "medium",
    day: 1,
    pillar: "P1",
    title: "Map pains to automation benefits",
    prompt: "Match each current pain of the SOC to the automation benefit (B1–B6) that fixes it. Use the benefit legend as your key.",
    anchor: "Lesson detail facets: mundane work freed, proactive shift, real-time alerting, faster customer service, compliance",
    look: "The dropdowns carry the benefit shorthand — the full B1–B6 legend is in the Knowledge Core above.",
    hints: [
      "Ask for each pain: what would change if a machine did the boring, always-on, or evidence-keeping part?",
      "p1 is about volume of repetitive work; p4 is about auditors wanting proof.",
      "p2 = nothing watches at night (real-time); p3 = users waiting (service); p5 = hunting only after incidents (proactive)."
    ],
    feedbackPass: "You just read a SOC like a leader: every operational pain maps to a specific, nameable automation benefit — and each benefit becomes a use case with measurable value.",
    feedbackFail: "Some pairs are off. Anchor on the lesson’s exact wording: mundane→time, overnight→real-time, waiting→service, evidence→compliance, after-the-fact→proactive."
  },
  {
    id: "OBJ-M3",
    mode: "medium",
    day: 1,
    pillar: "P2",
    title: "Playbook or runbook?",
    prompt: "Five statements from the SOC floor. Classify each as a PLAYBOOK (the SOAR executes it) or a RUNBOOK (a human follows it).",
    anchor: "Lesson vocabulary — playbook (automated) vs runbook (manual) distinction",
    look: "The decisive cue is WHO executes: engine or human.",
    hints: [
      "“The SOAR engine executes it” = playbook. “A trained human follows it” = runbook.",
      "Machine speed + thousands of identical decisions → playbook.",
      "A PDF procedure document is the classic runbook artifact."
    ],
    feedbackPass: "Playbook = automated decision-tree the platform executes; runbook = the human procedure. Mature SOCs keep both: playbooks for scale, runbooks for judgment calls and knowledge retention.",
    feedbackFail: "Re-check the executor: if a machine can repeat it identically, it is playbook material; if it needs a human reading steps, it is a runbook."
  },
  {
    id: "OBJ-M4",
    mode: "medium",
    day: 2,
    pillar: "P1",
    title: "Encode the phishing-triage workflow",
    prompt: "Arrange the six steps of the phishing-triage playbook in the order the SOAR engine must execute them.",
    anchor: "Lesson: automation detects threats and alerts analysts — workflow/use-case construction (SOAR playbook development)",
    look: "A playbook always starts with its TRIGGER.",
    hints: [
      "First the trigger, then gather facts (enrich) before deciding anything.",
      "Sandbox detonation produces the verdict; scoring combines verdicts; deciding comes before recording.",
      "Correct order: TRIGGER → ENRICH → DETONATE → SCORE → DECIDE → RECORD."
    ],
    feedbackPass: "That is a sound detection-to-decision pipeline: trigger, enrich, detonate, score, decide, record. Note how every step is auditable — that is what makes the automation trustworthy.",
    feedbackFail: "Not the order the engine needs. Remember: facts first (enrich/detonate), verdict second (score), decision third (decide), evidence last (record)."
  },
  {
    id: "OBJ-M5",
    mode: "medium",
    day: 2,
    pillar: "P1",
    title: "Wire the trigger and connectors",
    prompt: "Choose the trigger that fires this playbook, and enable exactly the connectors this workflow touches.",
    anchor: "Lesson: automation tools detect in real time — SOAR connectors/integrations to SIEM, sandbox, ticketing, gateway",
    look: "Walk your six steps: every tool a step touches needs a connector.",
    hints: [
      "The trigger must fire when a phishing report appears — not on a schedule or one mailbox.",
      "Count the tools: something must receive reports, produce verdicts, and open tickets.",
      "Required: Email gateway + Sandbox + Ticketing. HR payroll and building access touch no step."
    ],
    feedbackPass: "Trigger on the event, connectors for exactly the tools your steps touch. Every extra integration is extra attack surface and noise — leaders keep the wiring clean.",
    feedbackFail: "Check two things: the trigger must react to phishing reports the moment they appear, and connectors must match the tools your workflow actually uses — no more, no less."
  },
  {
    id: "OBJ-M6",
    mode: "medium",
    day: 3,
    pillar: "P2",
    title: "Run the manual shift",
    prompt: "You are on the queue with no automation. Choose the correct triage disposition for each of the five alerts.",
    anchor: "Lesson: before automation teams are reactive — recognizing threats and benign noise in raw alerts (MITRE T1566/T1003/T1110/T1078 context)",
    look: "The MITRE chip and the alert details hint at intent — compare attachment/verdict facts.",
    hints: [
      "Containment is for active hostile actions on hosts or authentication paths.",
      "Benign closings need documented reasons: verified travel + MFA, or mass-mail to 300 recipients.",
      "A1 (unknown attachment, no verdict yet) → escalate; A2/A3 → contain & escalate; A4/A5 → close benign."
    ],
    feedbackPass: "Clean shift. Notice what dominated: repetitive closing and re-checking — exactly the mundane work the lesson says automation should absorb, so humans keep the judgment calls.",
    feedbackFail: "Some calls would create risk or waste. Contain active hostile actions (tool hash, brute force), escalate unknowns (unverified attachment), close documented benign (verified travel, mass newsletter)."
  },
  {
    id: "OBJ-M7",
    mode: "medium",
    day: 3,
    pillar: "P3",
    title: "Read the automation receipt",
    prompt: "Enable the phish-triage automation, watch the run, then report: how many alerts did it auto-close with no human touch, and at what time did the first auto-close land?",
    anchor: "Lesson: automation detects potential threats in real time and quickly alerts analysts — measuring machine throughput",
    look: "The run log’s ✓ AUTO-CLOSE lines carry the numbers.",
    hints: [
      "Count the lines starting with ✓ AUTO-CLOSE.",
      "The first ✓ line shows the timestamp you need.",
      "10 auto-closes; the first at 09:41:06."
    ],
    feedbackPass: "Twelve reports handled in 28 seconds, ten with zero human touch, two saved for judgment. That is the “real-time detection and quick alerting” promise of the lesson, measured.",
    feedbackFail: "Re-run or re-read the log: count ✓ AUTO-CLOSE lines and take the timestamp of the first one."
  },
  {
    id: "OBJ-M8",
    mode: "medium",
    day: 3,
    pillar: "P3",
    title: "Apply human-in-the-loop judgment",
    prompt: "The automation escalated two cases to your tray. Make the correct human call for each.",
    anchor: "Lesson nuance: automation accelerates detection but analysts keep ambiguous, high-stakes decisions",
    look: "Weigh the verdict confidence and the blast radius of each option.",
    hints: [
      "E1: a 5/10 score with unknown reputation is genuinely ambiguous — what is the safest informative next step?",
      "E2: a 9/10 malicious verdict with victims means containment of credentials, not of the mail server.",
      "E1 → deep detonation + analyst review; E2 → IR escalation + force password resets."
    ],
    feedbackPass: "Textbook human-in-the-loop: ambiguous → investigate deeper; confirmed malicious with impact → contain the affected identities. Automation does the sorting; people own the gray zone.",
    feedbackFail: "Avoid both extremes: do not close on uncertainty (E1) and do not overreact beyond the blast radius (E2). Investigate the gray, contain the confirmed."
  },
  {
    id: "OBJ-M9",
    mode: "medium",
    day: 4,
    pillar: "P4",
    title: "Close the compliance gap",
    prompt: "Run the automated control checks across the fleet. Find the failing host and control, then open the remediation ticket with the right SLA priority.",
    anchor: "Lesson: automation improves compliance — continuous checks replace audit scrambles",
    look: "Run the check, then scan the grid for a red cell.",
    hints: [
      "Exactly one host/control cell fails.",
      "The endpoint lost its detection agent — elevated, but there is no active incident.",
      "Host WH-KS-07, control EDR agent, priority P2 (24 h)."
    ],
    feedbackPass: "One click produced fleet-wide evidence — the audit scramble from Day 1 is gone. P2 was right: an endpoint without EDR loses detection coverage, but with no active incident P1 would be overkill.",
    feedbackFail: "Run the check and look for the red cell; then pick a priority that matches impact: unprotected detection coverage is urgent (24 h) but not a live-incident emergency (4 h)."
  },
  {
    id: "OBJ-M10",
    mode: "medium",
    day: 4,
    pillar: "P3",
    title: "Watch the night shift",
    prompt: "Start the simulated 22:00 watch. When the anomaly arrives, acknowledge it and route it correctly.",
    anchor: "Lesson: automation detects potential threats in real time and quickly alerts security analysts — 24/7 continuous monitoring",
    look: "Keep an eye on the watch feed after you start it.",
    hints: [
      "A 4.2 GB overnight transfer to a first-seen country is not a morning-digest item.",
      "Real-time alerting only counts if a human is alerted now.",
      "Acknowledge the banner, then route: page on-call + open P1."
    ],
    feedbackPass: "This is the reactive→proactive flip from the lesson: the machine watched at 03:12 so nobody had to. Detection at machine speed, human paged in seconds — that is continuous monitoring.",
    feedbackFail: "Re-watch: an overnight exfiltration-sized transfer needs immediate human paging, not a digest. Acknowledge the alert and route it to the on-call analyst."
  },
  {
    id: "OBJ-M11",
    mode: "medium",
    day: 5,
    pillar: "P4",
    title: "Brief the VP with the numbers",
    prompt: "From the dashboard, enter the current MTTD and MTTR into the exec brief, then select the three KPI cards that answer “are we responding faster?”.",
    anchor: "Lesson: automation provides leadership insights and data for informed decisions — MTTD/MTTR/SLA as the speed story",
    look: "The dashboard cards show before → after values.",
    hints: [
      "MTTD is the 58-minute number; MTTR is under ten hours now.",
      "The question is about RESPONSE SPEED — volume and coffee do not answer it.",
      "MTTD 58 m, MTTR 9 h 40 m; KPIs = MTTD + MTTR + SLA met."
    ],
    feedbackPass: "You picked the three metrics that tell the speed story: detection time, response time, and promise-keeping (SLA). That is exactly the data-driven leadership view the lesson calls for.",
    feedbackFail: "Enter the two dashboard values, then choose only the cards that measure speed of detect/respond/keep-promises — throughput and coffee are a different story."
  },
  {
    id: "OBJ-M12",
    mode: "medium",
    day: 5,
    pillar: "P4",
    title: "Make the budget call",
    prompt: "Leadership will fund one path. Choose the recommendation the data supports, then tick every data point that justifies it.",
    anchor: "Lesson: leadership uses automation insights/data to make informed decisions — investment reasoning",
    look: "Compare each option against the dashboard trend.",
    hints: [
      "The team absorbed 6× the volume without new hires — what does that imply about scaling?",
      "Only 40 % of use cases are automated, and the FP rate still has tuning room — both are budget arguments.",
      "Choose B (expand + tune); cite the ×6.3 volume, the 40 % coverage headroom, and the 19 % FP tuning room."
    ],
    feedbackPass: "The data argues for scaling what works: volume absorbed ×6.3 with the same team, 40 % of use cases still unautomated, and FP tuning room left. That is an informed decision, not a gut feeling — the lesson’s leadership payoff.",
    feedbackFail: "Match the recommendation to the trend lines: expansion + tuning is supported by throughput growth, remaining coverage, and FP headroom — not by headcount or coffee."
  },
  {
    id: "OBJ-H1",
    mode: "hard",
    day: 1,
    pillar: "P1",
    title: "Triage the weekend handover",
    prompt: "The Friday 18:00 handover lists eight items. Select ONLY the three systemic operational problems, and assign each the automation benefit (B1–B6) that addresses it. The memo contains noise.",
    anchor: "Lesson detail synthesis: mundane work, real-time alerting, compliance — separating signal from operational noise",
    hints: [
      "Systemic = recurring, process-level pain that automation can structurally fix. Hardware blips and weather are not systemic.",
      "Hours burned on duplicates → B1; nights unwatched → B3; audit scramble → B5.",
      "i1, i2, i3."
    ],
    feedbackPass: "You found the three structural pains under the noise — the same three the sprint will fix with automation. A leader separates incidents from patterns before spending budget.",
    feedbackFail: "Noise items (coffee machine, printer, badge reader, freight, CEO laptop) are one-offs with owners. The systemic three are the recurring hours-lost, the overnight blind spot, and the audit scramble."
  },
  {
    id: "OBJ-H2",
    mode: "hard",
    day: 2,
    pillar: "P1",
    title: "Engineer the credential-stuffing playbook",
    prompt: "Build the credential-stuffing response playbook from scratch: order all seven steps correctly, then set both conditional branches.",
    anchor: "Lesson: SOAR workflow/branch engineering — automation acting in real time on detection (T1110-style activity)",
    hints: [
      "Detect → correlate → enrich → branch → ticket → record. Branches sit between enrichment and ticketing.",
      "Threat-intel corroboration (≥2 hits) justifies blocking; affected accounts need identity containment.",
      "Order: s1→s7 as listed; Branch A = block, Branch B = MFA re-challenge."
    ],
    feedbackPass: "A production-grade playbook: measured trigger, correlation before verdicts, intel-gated blocking, identity containment, and a paper trail. Branches make it proportional — the essence of safe automation.",
    feedbackFail: "Re-check the pipeline: the trigger measures (5× baseline), correlation groups, enrichment verifies, branches act proportionally, then ticketing and recording close the loop."
  },
  {
    id: "OBJ-H3",
    mode: "hard",
    day: 3,
    pillar: "P2",
    title: "Autopsy the naive run",
    prompt: "Read the overnight transcript of a playbook built without a score gate. Answer the three post-mortem questions.",
    anchor: "Lesson nuance: automation must be engineered — false confidence, missed real-time events, and mislabeled evidence in raw logs",
    hints: [
      "Find the action that hurt the business: legitimate mail that got quarantined.",
      "The root cause is a missing verification step before a destructive action.",
      "AL-3312 · no verdict gate before quarantine · insert a SCORE gate."
    ],
    feedbackPass: "Post-mortems are how playbooks mature: the missing verdict gate caused a business-blocking false positive, and the digest-only routing hid a 03:12 exfil. Engineering discipline is what makes automation safe.",
    feedbackFail: "The mishandled alert is AL-3312 (legit invoices quarantined), caused by quarantining before any verdict — the fix is one SCORE gate, not more people."
  },
  {
    id: "OBJ-H5",
    mode: "hard",
    day: 3,
    pillar: "P2",
    title: "Call every shot",
    prompt: "Six live alerts, no hints. Label each TRUE POSITIVE or FALSE POSITIVE, then pick the ONE alert that must go to human review instead of automated handling.",
    anchor: "Lesson: real-time detection quality — analysts validate what automation flags (TP/FP discrimination)",
    hints: [
      "Verified context (MFA passed + registered travel; mass mail to 300) flips alerts benign.",
      "Tool hash, scanner-IP brute force, 9/10 sandbox verdict, and 4.2 GB overnight exfil are real.",
      "The exfil-sized transfer (F6) is the one that always needs a human."
    ],
    feedbackPass: "Perfect discrimination. This is the analyst skill automation amplifies: machines sort at scale, humans confirm the costly calls — the over-alerting KRI stays down only if this stays sharp.",
    feedbackFail: "Re-label with context: F2 and F4 have benign explanations (mass mail; verified travel). F1/F3/F5/F6 are genuine. The human-review pick is F6 — an exfil-sized transfer is never auto-handled."
  },
  {
    id: "OBJ-H4",
    mode: "hard",
    day: 4,
    pillar: "P3",
    title: "Tune out the false positives",
    prompt: "The phishing auto-close has a 34 % false-positive rate. Choose the correct tuning change and the outcome it will produce.",
    anchor: "Lesson: detection quality and trust — tuning automation so analysts trust its real-time alerts",
    hints: [
      "You want to fix precision without losing the speed benefit.",
      "A verdict gate adds verification only where auto-close happens.",
      "fix-gate + “FP falls sharply, close time rises slightly, SLA stays met”."
    ],
    feedbackPass: "Verdict-gating is the surgical fix: verification added exactly before the consequential action, speed mostly preserved, SLA intact. Global threshold-raising would have blinded the SIEM instead.",
    feedbackFail: "The gate goes before the auto-close decision (precision where it matters), and its cost is a slight close-time increase — not an SLA breach and not missed detections."
  },
  {
    id: "OBJ-H6",
    mode: "hard",
    day: 4,
    pillar: "P4",
    title: "Evidence that survives an audit",
    prompt: "An auditor demands continuous proof for two controls last quarter. Select every artifact that constitutes valid evidence — and nothing else.",
    anchor: "Lesson: automation improves compliance — machine-generated, timestamped evidence replaces manual attestation",
    hints: [
      "Valid evidence must be continuous, machine-generated, and timestamped.",
      "Ask of each item: does it prove the WHOLE period, produced automatically?",
      "v-logs + v-snap + v-ticket."
    ],
    feedbackPass: "Continuous logs, signed snapshots, and remediation ticket history — all machine-generated with timestamps. That is the compliance payoff of automation: evidence as a by-product, not a project.",
    feedbackFail: "Screenshots, verbal attestations, and a single scan cannot prove a quarter. Only continuous, machine-generated, timestamped artifacts do."
  },
  {
    id: "OBJ-H7",
    mode: "hard",
    day: 4,
    pillar: "P4",
    title: "Beat the SLA clocks",
    prompt: "Four open tickets, four clocks. Order the handling sequence so nothing breaches, then assign each ticket to automation (playbook-covered phish triage) or manual escalation.",
    anchor: "Lesson: faster service & SLA adherence through automation — orchestration of human vs machine work",
    hints: [
      "Severity first, then the clock closest to breach — T1 is 2 h from breaching despite being P3.",
      "Playbooks cover routine phishing; active intrusion and overdue patch batches do not run themselves.",
      "T2 → T1 → T3 → T4; manual: T2, T1; auto: T3, T4."
    ],
    feedbackPass: "You balanced severity against clock risk and split work correctly: machines take the routine phish queue, humans keep the P1 and the near-breach patch case. That is orchestration leadership.",
    feedbackFail: "Common trap: T1 looks unimportant (P3) but breaches in 2 h — it slots right after the active P1. Playbook-covered phishing (T3, T4) goes to automation."
  },
  {
    id: "OBJ-H8",
    mode: "hard",
    day: 5,
    pillar: "P4",
    title: "Recommend the strategy",
    prompt: "The board wants one recommendation. Choose the strategy the metric set supports, then tick every data point that justifies it.",
    anchor: "Lesson: leadership insights and data — balanced decision-making with performance AND risk indicators",
    hints: [
      "One KRI is rising — the right strategy acknowledges it instead of doubling down blindly.",
      "ROI is proven, headroom exists, but over-alerting is up 31 %.",
      "A, with k-coverage + k-kri + k-roi."
    ],
    feedbackPass: "You justified expansion WITH tuning: ROI proven (MTTR −69 %), headroom real (40 %), risk acknowledged (KRI +31 %). Balanced-scorecard thinking is exactly what the lesson’s leadership brief demands.",
    feedbackFail: "B ignores the rising over-alerting KRI; C wastes a proven ROI. Option A with all three positive citations is the defensible line."
  },
  {
    id: "OBJ-H9",
    mode: "hard",
    day: 5,
    pillar: "P4",
    title: "Think like the adversary",
    prompt: "Red-team review (defensive exercise): an adversary studies your automation. Read the notes, then select the TWO hardening moves that counter them — and nothing that over-automates.",
    anchor: "Lesson depth: automation has limits — predictability and thresholds create blind spots that humans must cover",
    hints: [
      "The adversary exploits uniform thresholds, timing and sampling — counters must restore variability and human cadence.",
      "Removing thresholds or blocking aggressively hurts you; smoothing windows hides the low-and-slow.",
      "x-baseline + x-hunt."
    ],
    feedbackPass: "Baseline tuning with human sampling and randomized hunts break the adversary’s predictability assumptions — while keeping automation’s speed. Knowing automation’s limits IS leadership of it.",
    feedbackFail: "Over-automation (block-everything, no thresholds) or wider windows would amplify the exact weaknesses the adversary is exploiting. Variability + human review is the counter."
  }
];
const QUIZ_MEDIUM = [
  {
    id: "qm1",
    q: "SOAR stands for…",
    options: [
      "System Operations Analysis and Reporting",
      "Security Orchestration, Automation and Response",
      "Secure Orchestration of Active Response",
      "Security Operations and Automation Resources"
    ],
    correct: 1,
    expl: "SOAR = Security Orchestration, Automation and Response — orchestrate the tools, automate the playbooks, manage the response. The distractors swap in real-sounding words, but the platform’s defining middle word is Automation."
  },
  {
    id: "qm2",
    q: "What is the difference between a playbook and a runbook?",
    options: [
      "They are the same artifact under different vendor names",
      "A runbook is encoded for the platform; a playbook is written for people",
      "A playbook is encoded for the platform; a runbook is written for people",
      "A playbook is manual, while a runbook only runs on a schedule"
    ],
    correct: 2,
    expl: "The executor is the whole difference: a playbook is the machine-executed decision-tree; a runbook is the human procedure. The first option is the classic exam trap — it reverses the two words while sounding authoritative, and “vendor names” or “schedule” describe neither term."
  },
  {
    id: "qm3",
    q: "Leadership wants proof that DETECTION got faster this quarter. Which metric shows it?",
    options: [
      "MTTD — mean time to detect",
      "MTTR — mean time to respond",
      "SLA adherence — promises kept",
      "FP rate — signal quality"
    ],
    correct: 0,
    expl: "MTTD measures first-evidence → detection, so faster detection shows up here first. MTTR starts only after detection; SLA measures promise-keeping; FP rate measures precision — each answers a different board question, which is what makes them tempting."
  },
  {
    id: "qm4",
    q: "Which use case should a SOC automate FIRST?",
    options: [
      "Whatever annoyed the CISO the most during the last weekly ops review",
      "High-volume, repetitive, low-judgment work such as verified-benign mail",
      "Any scenario that has never actually occurred in this environment",
      "Full ransomware containment with no human review gate at all"
    ],
    correct: 1,
    expl: "First use cases are high-volume and low-risk so the team learns safely: the machine absorbs repetitive closings while humans keep ambiguous, high-stakes calls. Annoyance is not a criterion, and novel or no-gate scenarios are exactly where automation must not start."
  },
  {
    id: "qm5",
    q: "How does automation improve compliance?",
    options: [
      "It lets the team skip evidence collection during audit season",
      "It writes the security policies that management approves",
      "Controls run identically every time and leave timestamped evidence",
      "It replaces the compliance team’s judgment with machine decisions"
    ],
    correct: 2,
    expl: "Compliance improves as a by-product: automated controls execute consistently and generate logs, snapshots and ticket history automatically. The tempting shortcuts — skipping evidence or delegating judgment to machines — are what auditors would flag, not accept."
  },
  {
    id: "qm6",
    q: "Which activity shows a PROACTIVE security operation?",
    options: [
      "Resetting passwords only after users report account lockouts",
      "Answering phishing complaints in the order they arrive",
      "Patching only the systems the last external audit flagged",
      "Scheduled anomaly sweeps and hunts that run before incidents"
    ],
    correct: 3,
    expl: "Proactive means acting before the incident: sweeps, hunts and continuous monitoring. The other three are reactive patterns — each waits for a user, a complaint or an auditor to force action, which is exactly the posture automation removes."
  }
];
const QUIZ_HARD = [
  {
    id: "qh1",
    q: "Artifact: “Gateway tagged 220 near-identical ‘invoice’ mails at 09:00; playbook auto-closed 214, escalated 6.” Best interpretation?",
    options: [
      "Automation failed — all 220 mails should have escalated to humans",
      "Automation triaged the bulk and kept human review for edge cases",
      "The gateway should have blocked all 220 at the edge instead",
      "A machine should never close a report that a human submitted"
    ],
    correct: 1,
    expl: "Bulk handling with edge-case escalation is the healthy pattern: machines absorb the identical volume, humans own the ambiguous remainder. Escalating everything destroys the capacity gain, blocking at the gateway bypasses verdict context, and “never auto-close” is the same over-correction in softer words."
  },
  {
    id: "qh2",
    q: "FP rate is 34 % on phishing auto-close; analysts re-open one in three. Best fix?",
    options: [
      "Raise global SIEM thresholds to drop the low-severity noise",
      "Disable auto-close so a human analyst reads every single report",
      "Add a verdict gate (sandbox + reputation majority) before auto-close",
      "Ask users to stop reporting the mail they believe is suspicious"
    ],
    correct: 2,
    expl: "Gate the consequential action: verification goes exactly where the mistake happens (auto-close), keeping speed mostly intact. Global thresholds blind the SIEM, disabling auto-close cancels the automation’s value, and suppressing reports removes your best free telemetry."
  },
  {
    id: "qh3",
    q: "The board asks: “Did automation pay off?” Which evidence pair is strongest?",
    options: [
      "Ticket count last quarter plus the tool license cost",
      "MTTD/MTTR trend plus analyst-hours moved into hunting",
      "Number of dashboards shipped plus total alerts received",
      "Analyst satisfaction survey plus on-call overtime hours"
    ],
    correct: 1,
    expl: "Outcome plus capacity is the leadership story: faster detect/respond (MTTD/MTTR) and hours reallocated to higher-value work. The others are activity or cost metrics — they can rise while security outcomes stay flat, which is precisely the trap in vanity reporting."
  },
  {
    id: "qh4",
    q: "An adversary learns your auto-block fires at 50 failed logins/min and shifts to 10/min from 200 IPs. Which change helps most?",
    options: [
      "Correlate across sources and add human review of low-and-slow patterns",
      "Lower the auto-block threshold to 5 per minute to catch them again",
      "Whitelist the internal ranges so legitimate users never get blocked",
      "Treat everything below the threshold as safe by definition"
    ],
    correct: 0,
    expl: "Distributed low-and-slow defeats per-source thresholds, so detection must aggregate across sources and borrow human judgment for slow patterns. Dropping thresholds blocks your own users, whitelisting opens a tunnel, and “below threshold = safe” is exactly the assumption the adversary is exploiting."
  },
  {
    id: "qh5",
    q: "An auditor wants continuous proof that EDR coverage and privileged MFA held all quarter. Which artifact set is valid?",
    options: [
      "One thorough manual scan from last week plus a dashboard screenshot",
      "Continuous check logs, signed nightly snapshots, remediation ticket history",
      "The platform owner’s written attestation plus a verbal briefing",
      "Marketing’s summary deck plus the vendor’s latest feature list"
    ],
    correct: 1,
    expl: "Continuous, machine-generated, timestamped artifacts prove a whole period; everything else proves a moment or an opinion. Screenshots and attestations are the classic audit failures — they cannot demonstrate the control held on the days nobody was looking."
  },
  {
    id: "qh6",
    q: "T1 (P3, 72 h SLA) opened 70 h ago; T2 (P1, 4 h SLA) opened 30 min ago. Handle how?",
    options: [
      "T2 first, and escalate T1 immediately — it breaches within two hours",
      "T1 first no matter what — the oldest ticket always wins here",
      "T2 only — a P3 breach is an acceptable cost of doing business here",
      "Both wait until the morning stand-up to set the priorities"
    ],
    correct: 0,
    expl: "Severity leads, but clocks are the second axis: T2 takes the human now while T1 — two hours from breaching despite being P3 — gets automated triage or escalation immediately. “Oldest first” and “stand-up will decide” both ignore that a breach is near-certain without action."
  },
  {
    id: "qh7",
    q: "A stakeholder demands “full automation, no human gates” for speed. Best counter-argument?",
    options: [
      "The vendors do not support removing human gates on their platforms",
      "Automated systems cannot be audited by regulators in any form",
      "Human analysts are always faster and more accurate than any machine",
      "Ambiguous, high-stakes steps need human judgment to avoid machine-scale errors"
    ],
    correct: 3,
    expl: "A wrong auto-action replicates at machine speed and scale, so judgment stays where stakes or ambiguity are high — that preserves speed where it is safe. “Always faster/more accurate” is false and unhelpful, auditability is a design property rather than a casualty, and vendor support is irrelevant to the risk argument."
  }
];
/* Short study-area label per quiz item — used by the completion report to derive
   the student's focus areas from actual wrong answers (R8). */
const QUIZ_TOPIC = {
  qm1: "SOAR fundamentals",
  qm2: "Playbook vs runbook",
  qm3: "Detection metrics (MTTD / MTTR / SLA)",
  qm4: "First use-case selection",
  qm5: "Compliance automation",
  qm6: "Proactive vs reactive operations",
  qh1: "Bulk triage judgment",
  qh2: "False-positive tuning strategy",
  qh3: "Leadership evidence and ROI",
  qh4: "Low-and-slow adversary adaptation",
  qh5: "Continuous compliance evidence",
  qh6: "SLA and severity triage",
  qh7: "Human-in-the-loop boundaries",
};
function objectivesFor(mode) {
  return OBJECTIVES.filter((o) => o.mode === mode);
}
function quizFor(mode) {
  return mode === "medium" ? QUIZ_MEDIUM : QUIZ_HARD;
}

// Classic-script export surface (no modules — file:// friendly).
window.LAB_DATA = {
  GLOSSARY,
  BENEFITS,
  TERM_OPTIONS,
  PAINS,
  CLASSIFY,
  HANDOVER,
  HANDOVER_CORRECT,
  PHISH_STEPS,
  PHISH_CORRECT,
  PHISH_INIT,
  TRIGGERS,
  TRIGGER_CORRECT,
  CONNECTORS,
  CRED_STEPS,
  CRED_CORRECT,
  CRED_INIT,
  CRED_BRANCHES,
  DISPOSITIONS,
  ALERTS,
  RUN_SCRIPT,
  RUN_CORRECT_COUNT,
  RUN_FIRST_CLOSE,
  ESCALATIONS,
  TIMELINE,
  TIMELINE_QS,
  FP_ALERTS,
  FP_ESC_CORRECT,
  CONTROLS,
  HOSTS,
  FAIL_HOST,
  FAIL_CONTROL,
  PRIORITIES,
  TICKET_PRIORITY_CORRECT,
  WATCH_LINES,
  ANOMALY_ROUTE_CORRECT,
  ANOMALY_ROUTES,
  TUNE_FIX_OPTIONS,
  TUNE_FIX_CORRECT,
  TUNE_PREDICT_OPTIONS,
  TUNE_PREDICT_CORRECT,
  EVIDENCE,
  SLA_TICKETS,
  SLA_CORRECT_ORDER,
  METRICS,
  KPI_CORRECT,
  BUDGET_OPTIONS,
  BUDGET_CORRECT,
  BUDGET_CITES,
  STRATEGY_OPTIONS,
  STRATEGY_CORRECT,
  STRATEGY_CITES,
  ADVERSARY_NOTES,
  COUNTERS,
  OBJECTIVES,
  QUIZ_MEDIUM,
  QUIZ_HARD,
  QUIZ_TOPIC,
  objectivesFor,
  quizFor,
};
})();
