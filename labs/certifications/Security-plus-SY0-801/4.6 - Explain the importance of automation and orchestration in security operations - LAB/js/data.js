/* =====================================================================
 * data.js — All lab content for the Automation Operations Floor
 * (Security+ SY0-801 Lesson 4.6 — Automation & Orchestration)
 * 1:1 port of the original framework lab's data. Synthetic training data.
 * MITRE ATT&CK IDs are accurate to the official source.
 * ===================================================================== */

/* ---------- Default environment state ---------- */
function defaultEnv() {
  return {
    matches: {},            // M1 benefit termId -> defId
    categories: {},         // M2 itemId -> automation|orchestration|soar
    useCases: {},           // M3 itemId -> automate|human
    playbook: { nodes: [] },
    integrations: { siem:false, edr:false, firewall:false, threatintel:false, identity:false, email:false, vuln:false },
    brokenIntegration: null,
    triage: {},             // alertId -> disposition
    threshold: 50,
    detectionMethods: {},   // behaviorId -> rule|ml
    ai: { ueba:false, genSummary:false, predictiveTriage:false },
    postmortem: { rootCause:"", residualRisks:[], fixes:[] },
    roadmap: {},            // processId -> rank
    metricsRead: false,
  };
}

/* ---------- Glossary ---------- */
const GLOSSARY = [
  { id:"automation", term:"Automation", definition:"Use of technology to perform a task with reduced or no human intervention." },
  { id:"orchestration", term:"Orchestration", definition:"Coordinating multiple automated tasks and tools into one coherent end-to-end workflow." },
  { id:"soar", term:"SOAR", definition:"Security Orchestration, Automation, and Response — a platform that integrates security tools and runs response playbooks." },
  { id:"siem", term:"SIEM", definition:"Security Information and Event Management — centralizes log aggregation, correlation, and alerting." },
  { id:"playbook", term:"Playbook", definition:"A documented and often automated sequence of steps to respond to a specific incident type." },
  { id:"runbook", term:"Runbook", definition:"An operational procedure (frequently automated) for routine, repeatable operations tasks." },
  { id:"api", term:"API", definition:"Application Programming Interface — a contract that lets tools exchange data and trigger actions programmatically." },
  { id:"webhook", term:"Webhook", definition:"An event-driven HTTP callback: one system notifies another the instant something happens." },
  { id:"integration", term:"Integration", definition:"A connection between two tools that shares data or triggers actions across them." },
  { id:"ai-workflow", term:"AI-assisted workflow", definition:"A workflow enhanced by machine learning or generative AI for detection, triage, or summarization." },
  { id:"ueba", term:"UEBA", definition:"User and Entity Behavior Analytics — ML that baselines normal behavior and flags anomalies." },
  { id:"mttr", term:"MTTR", definition:"Mean Time to Respond/Remediate — average time from incident detection to resolution." },
  { id:"mttd", term:"MTTD", definition:"Mean Time to Detect — average time from incident occurrence to detection." },
  { id:"alert-fatigue", term:"Alert fatigue", definition:"Desensitization caused by excessive or low-quality alerts, leading analysts to miss real threats." },
  { id:"false-positive", term:"False positive", definition:"An alert that fires on benign activity; tuning reduces these." },
  { id:"ci-cd", term:"CI/CD", definition:"Continuous Integration / Continuous Deployment — automated pipeline to build, test, and deploy code or config." },
  { id:"single-pane", term:"Single pane of glass", definition:"A unified dashboard consolidating views from multiple security tools." },
  { id:"human-loop", term:"Human-in-the-loop", definition:"A checkpoint requiring a person to approve a high-impact automated action before it executes." },
];

/* ---------- M1 benefit matching (R6: shuffled deranged display order) ---------- */
const BENEFIT_TERMS = [
  { termId:"b-efficiency", term:"Efficiency / speed" },
  { termId:"b-consistency", term:"Consistency / repeatability" },
  { termId:"b-scalability", term:"Scalability" },
  { termId:"b-error", term:"Reduced human error" },
];
const BENEFIT_DEFS = [
  { id:"b-efficiency", text:"Tasks complete in seconds instead of hours, shrinking MTTD/MTTR." },
  { id:"b-consistency", text:"Every incident is handled the same way every time, with no skipped steps." },
  { id:"b-scalability", text:"Tens of thousands of events can be processed without adding headcount." },
  { id:"b-error", text:"Removing manual steps eliminates typos, fatigue-driven mistakes, and copy/paste errors." },
];
// Deranged orders: term[i] and def[i] always differ — no positional reveal.
const BENEFIT_TERMS_SHUFFLED = [ BENEFIT_TERMS[2], BENEFIT_TERMS[0], BENEFIT_TERMS[3], BENEFIT_TERMS[1] ];
const BENEFIT_DEFS_SHUFFLED  = [ BENEFIT_DEFS[1], BENEFIT_DEFS[3], BENEFIT_DEFS[0], BENEFIT_DEFS[2] ];

/* ---------- M2 concept categorization ---------- */
const CONCEPT_ITEMS = [
  { id:"c1", text:"A script parses SIEM alerts and enriches each with threat-intel scores." },
  { id:"c2", text:"When an EDR critical alert fires, a workflow isolates the host, disables the AD account, opens a ticket, and pages the on-call analyst." },
  { id:"c3", text:"The platform that hosts the playbook, manages API keys to all tools, and reports on execution." },
  { id:"c4", text:"A cron job pulls vulnerability scan results and creates a ticket for each critical finding." },
  { id:"c5", text:"An end-to-end ransomware response: detect via SIEM -> enrich via threat intel -> decide severity -> isolate host via EDR -> block C2 via firewall -> notify analyst, all coordinated." },
  { id:"c6", text:"A vendor product with a playbook designer, integration catalog, and case management." },
];
const CONCEPT_CATEGORIES = [
  { id:"automation", label:"Automation" },
  { id:"orchestration", label:"Orchestration" },
  { id:"soar", label:"SOAR" },
];
const CONCEPT_ANSWERS = { c1:"automation", c2:"orchestration", c3:"soar", c4:"automation", c5:"orchestration", c6:"soar" };

/* ---------- M3 use cases ---------- */
const USE_CASES = [
  { id:"u1", text:"Quarantine 500 phishing emails matching a known malicious sender pattern.", answer:"automate" },
  { id:"u2", text:"Decide whether a novel, never-before-seen PowerShell payload is a real APT tool.", answer:"human" },
  { id:"u3", text:"Enrich every SIEM alert's destination IP with threat-intel reputation.", answer:"automate" },
  { id:"u4", text:"Conduct a nuanced executive debrief on attribution to a named threat actor.", answer:"human" },
  { id:"u5", text:"Isolate an endpoint flagged by EDR with a critical, high-confidence ransomware signal.", answer:"automate" },
  { id:"u6", text:"Negotiate with an internal stakeholder about whether a business-critical server can be taken offline.", answer:"human" },
  { id:"u7", text:"Patch dev/test systems for a newly announced CVE via CI/CD.", answer:"automate" },
  { id:"u8", text:"Judge whether an alert on the CEO's laptop is safe to auto-contain.", answer:"human" },
];

/* ---------- Integrations ---------- */
const INTEGRATIONS = [
  { id:"siem", name:"SIEM", role:"Log aggregation, correlation, alerting (detection telemetry source).", method:"API + Webhook", providesDetection:true, enablesResponse:false },
  { id:"edr", name:"EDR", role:"Endpoint telemetry + host isolation response action.", method:"API + Webhook", providesDetection:true, enablesResponse:true, responseAction:"Isolate host" },
  { id:"firewall", name:"NG Firewall", role:"Network policy enforcement: block IPs/domains.", method:"API", providesDetection:false, enablesResponse:true, responseAction:"Block IP / domain" },
  { id:"threatintel", name:"Threat Intel", role:"Reputation, indicators, enrichment for detection and triage.", method:"API", providesDetection:true, enablesResponse:false },
  { id:"identity", name:"IAM / AD", role:"Identity context + disable-account / force-MFA response.", method:"API", providesDetection:true, enablesResponse:true, responseAction:"Disable account / force MFA" },
  { id:"email", name:"Email Gateway", role:"Phishing detection telemetry + quarantine response.", method:"API + Webhook", providesDetection:true, enablesResponse:true, responseAction:"Quarantine message" },
  { id:"vuln", name:"Vuln Scanner", role:"Asset exposure telemetry; feeds patch workflows via CI/CD.", method:"API", providesDetection:true, enablesResponse:false },
];

/* ---------- Playbook node catalog ---------- */
const NODE_CATALOG = [
  { id:"trig-edr", label:"EDR Alert Trigger", category:"trigger", detail:"Fires when EDR raises an alert (e.g. mass file encryption on a host)." },
  { id:"trig-siem", label:"SIEM Alert Trigger", category:"trigger", detail:"Fires on a correlated SIEM alert." },
  { id:"trig-ti", label:"Threat-Intel Match Trigger", category:"trigger", detail:"Fires when an indicator matches a threat-intel feed." },
  { id:"enrich-ti", label:"Threat-Intel Lookup", category:"enrich", detail:"Enrich indicators (IP, domain, hash) with reputation and campaign context." },
  { id:"enrich-identity", label:"Identity Context", category:"enrich", detail:"Resolve the user/account behind the activity and its privilege level." },
  { id:"enrich-endpoint", label:"Endpoint Inventory", category:"enrich", detail:"Pull asset owner, criticality, and data sensitivity for the host." },
  { id:"decide-sev", label:"Severity Check", category:"decide", detail:"Branch on alert severity (critical / high / medium / low)." },
  { id:"decide-conf", label:"Confidence Check", category:"decide", detail:"Branch on enrichment confidence (e.g. threat-intel score above threshold)." },
  { id:"act-isolate", label:"Isolate Host", category:"action", detail:"Tell EDR to network-isolate the endpoint (containment)." },
  { id:"act-disableacct", label:"Disable Account", category:"action", detail:"Tell IAM/AD to disable the compromised account." },
  { id:"act-blockip", label:"Block C2 IP", category:"action", detail:"Tell the firewall to block the C2 IP/domain." },
  { id:"act-notify", label:"Notify Analyst", category:"action", detail:"Page the on-call analyst with a case summary (human-in-the-loop)." },
  { id:"act-ticket", label:"Create Ticket", category:"action", detail:"Open an incident ticket in the case management system." },
  { id:"act-autoclose", label:"Auto-Close", category:"action", detail:"Close low-risk, confirmed-benign alerts automatically." },
];
const RANSOMWARE_PLAYBOOK = ["trig-edr","enrich-ti","enrich-endpoint","decide-sev","decide-conf","act-isolate","act-disableacct","act-blockip","act-notify","act-ticket"];

/* ---------- Alert triage feed ---------- */
const ALERTS = [
  { id:"a1", source:"SIEM", severity:"medium", title:"Brute-force logon spike from 198.51.100.23", detail:"412 failed RDP logons to FIN-SRV-04 in 4 minutes, single source IP.", correct:"auto-enrich" },
  { id:"a2", source:"EDR", severity:"critical", title:"Mass file encryption on FIN-0142", detail:"EDR reports >9000 files renamed with .lock3d extension in 60s. High-confidence ransomware signal.", correct:"auto-contain" },
  { id:"a3", source:"SIEM", severity:"low", title:"Vuln-scan traffic burst", detail:"Internal scan-range 10.20.0.0/16 sweeping ports. Matches the approved weekly scan window.", correct:"auto-close" },
  { id:"a4", source:"SIEM", severity:"high", title:"DNS to newly-registered domain", detail:"Host HR-09 queried exfil-server[.]xyz, registered 2 days ago, TI feed lists as C2.", correct:"auto-enrich" },
  { id:"a5", source:"EDR", severity:"medium", title:"Encoded PowerShell on DEV-WS-07", detail:"powershell -enc <base64> spawning certutil. Payload not in any signature or TI feed. Novel.", correct:"escalate" },
  { id:"a6", source:"Firewall", severity:"critical", title:"C2 beacon to 203.0.113.55", detail:"Host ENG-12 beacons every 60s. 203.0.113.55 is TI-listed C2 for threat group FIN7.", correct:"auto-contain" },
  { id:"a7", source:"EDR", severity:"critical", title:"Heavy disk I/O on SRV-DB01", detail:"Mass file writes at 02:00 — looks like ransomware pattern. Actually the nightly compressed DB backup job (business critical, must NOT be contained).", correct:"escalate", redHerring:true, hardOnly:true },
  { id:"a8", source:"Email Gateway", severity:"high", title:"Bulk external email send", detail:"Marketing automation sending 18,000 outbound emails in 10 min — pattern resembles data exfiltration. Actually an approved campaign blast.", correct:"escalate", redHerring:true, hardOnly:true },
];

/* ---------- Detection tuner curve ---------- */
function detectionCurve(t){ return { tp: Math.max(0, Math.round(80 - 0.45*t)), fp: Math.max(0, Math.round(45 - 0.45*t)) }; }
function detectionMetrics(t){
  const { tp, fp } = detectionCurve(t);
  const totalPos = 80, fn = Math.max(0, totalPos - tp);
  const precision = tp+fp===0 ? 1 : tp/(tp+fp);
  const recall = tp+fn===0 ? 1 : tp/(tp+fn);
  const f1 = precision+recall===0 ? 0 : (2*precision*recall)/(precision+recall);
  return { tp, fp, fn, precision, recall, f1 };
}
const DETECTION_BEHAVIORS = [
  { id:"d1", text:"Block any outbound connection to an IP on the static known-bad C2 blocklist.", answer:"rule" },
  { id:"d2", text:"Flag an analyst whose download volume is 8x their 90-day baseline.", answer:"ml" },
  { id:"d3", text:"Detect a PowerShell process spawned by Word.", answer:"rule" },
  { id:"d4", text:"Detect a service account logging in at an hour it has never logged in before.", answer:"ml" },
  { id:"d5", text:"Quarantine any email whose attachment SHA-256 matches a known-malware hash.", answer:"rule" },
  { id:"d6", text:"Detect a user accessing a set of repositories no peer in their role ever touches.", answer:"ml" },
];

/* ---------- Post-mortem ---------- */
const POSTMORTEM_SCENARIO = "Monday 09:00 — the SOAR auto-containment playbook quarantined 37 legitimate emails from a key partner domain (acme-partner[.]example) and blocked the partner's mail relay IP, causing a 4-hour procurement outage. Investigation: the threat-intel feed's API token expired Friday 17:00. From Friday evening through Monday, the feed returned cached/stale indicators that had been re-scored as malicious, so automation acted on degraded data.";
const POSTMORTEM_ROOT_CAUSES = [
  { id:"rc1", text:"Integration drift — the threat-intel API token expired and the feed silently served stale data.", correct:true },
  { id:"rc2", text:"The SIEM was ingesting too many logs.", correct:false },
  { id:"rc3", text:"The analyst clicked the wrong button.", correct:false },
  { id:"rc4", text:"The firewall vendor released a buggy firmware update.", correct:false },
];
const POSTMORTEM_RISKS = [
  { id:"r1", text:"Automation acting on stale/degraded intelligence produces false positives at scale.", correct:true },
  { id:"r2", text:"No human-in-the-loop checkpoint before high-impact actions (block IP, quarantine partner domain).", correct:true },
  { id:"r3", text:"No freshness/health check on ingested threat-intel data.", correct:true },
  { id:"r4", text:"Over-reliance on automation erodes analyst situational awareness.", correct:true },
  { id:"r5", text:"Using emerald-colored dashboards causes eye strain.", correct:false },
];
const POSTMORTEM_FIXES = [
  { id:"f1", text:"Add integration-health monitoring: alert on API auth failures and stale feed timestamps.", correct:true },
  { id:"f2", text:"Add a human-in-the-loop approval step for actions against partner/whitelisted domains.", correct:true },
  { id:"f3", text:"Add a data-freshness guard: refuse to act on indicators older than a policy window.", correct:true },
  { id:"f4", text:"Disable all automation permanently.", correct:false },
  { id:"f5", text:"Replace the SIEM with a newer model.", correct:false },
];

/* ---------- Roadmap ---------- */
const ROADMAP_PROCESSES = [
  { id:"p1", name:"Phishing email triage & quarantine", volume:5, repetitiveness:5, riskIfManual:4, integrationReadiness:5, correctRank:1 },
  { id:"p2", name:"Endpoint isolation for high-confidence ransomware", volume:3, repetitiveness:4, riskIfManual:5, integrationReadiness:4, correctRank:2 },
  { id:"p3", name:"Threat-intel enrichment of all SIEM alerts", volume:5, repetitiveness:5, riskIfManual:3, integrationReadiness:5, correctRank:3 },
  { id:"p4", name:"Vulnerability scan -> patch ticket -> CI/CD deploy (dev)", volume:4, repetitiveness:4, riskIfManual:3, integrationReadiness:4, correctRank:4 },
  { id:"p5", name:"Executive incident attribution briefings", volume:1, repetitiveness:1, riskIfManual:2, integrationReadiness:1, correctRank:5 },
];

/* ---------- Metrics ---------- */
const METRICS_BEFORE = { mttd:92, mttr:240, automationRate:5, alertToAction:18, analystAlertsPerShift:2100 };
const METRICS_AFTER  = { mttd:34, mttr:71, automationRate:62, alertToAction:6, analystAlertsPerShift:740 };

/* ---------- Scenarios (procedure examples) ---------- */
const SCENARIOS = [
  { id:"s1", title:"Phishing triage at scale", mitre:"T1566 Phishing", body:"A 30,000-person org gets ~500 user-reported phishing emails per day. SOAR pulls each URL/attachment, queries threat intel, auto-quarantines confirmed-malicious messages across all mailboxes, and escalates only novel lures to analysts. MTTD drops from hours to minutes." },
  { id:"s2", title:"Ransomware auto-containment", mitre:"T1486 Data Encrypted for Impact", body:"EDR detects mass file encryption on FIN-0142. Within seconds the SOAR playbook isolates the host, disables the compromised AD account, blocks the C2 IP at the firewall, opens a critical ticket, and pages the on-call analyst — before encryption spreads to the file server." },
  { id:"s3", title:"Credential abuse / impossible travel", mitre:"T1078 Valid Accounts", body:"IAM + SIEM detect a login from a new geo 8,000 km away 10 minutes after the user's last session. SOAR forces MFA re-authentication and resets active sessions before data access is granted." },
  { id:"s4", title:"Vuln-to-patch automation", mitre:"T1210 Exploitation of Remote Services (patch gap)", body:"Vuln scanner finds a new critical CVE. SOAR cross-references asset criticality and exposure, auto-creates patch tickets, and triggers CI/CD patch deployment to dev/test environments; prod follows after approval." },
  { id:"s5", title:"C2 beacon containment", mitre:"T1071 Application Layer Protocol / T1571 Non-Standard Port", body:"IDS/EDR detects a 60-second beacon to a TI-listed C2. SOAR isolates the host and blocks the IP at the firewall while enriching the campaign context for the analyst." },
  { id:"s6", title:"Predictive triage of an alert storm", mitre:"(detection engineering)", body:"A misconfigured rule fires 2,000 alerts in one shift. ML predictive triage auto-closes the ~60% that match known-benign patterns and surfaces the top 10% by likely severity, so the analyst works what matters." },
  { id:"s7", title:"UEBA insider data exfil", mitre:"T1048 Exfiltration Over Alternative Protocol", body:"UEBA flags a developer downloading 50 GB from a repo they rarely touch at 03:00. SOAR pauses the account's access and notifies the manager + SOC, stopping exfiltration before it completes." },
  { id:"s8", title:"Integration drift failure", mitre:"(operational risk)", body:"A threat-intel API token expired over the weekend; the feed served stale indicators and automation quarantined legitimate partner emails. Teaches the need for integration-health monitoring and human-in-the-loop for high-impact actions." },
  { id:"s9", title:"Over-reliance false containment", mitre:"(operational risk)", body:"An auto-contain playbook triggered on a business-critical nightly DB backup job because its I/O pattern resembled ransomware. Teaches guardrails: allowlists for known jobs and human approval for high-impact actions on tier-0 assets." },
];

/* ---------- helper ---------- */
function has(rec, k, v){ return rec[k] === v; }
function nodeLabel(id){ const n = NODE_CATALOG.find(n=>n.id===id); return n ? n.label : id; }

/* ---------- MEDIUM objectives (12) — same checks as original ---------- */
const MEDIUM_OBJECTIVES = [
  {
    id:"OBJ-M1", mode:"medium", pillar:"understand",
    title:"Match the four core benefits of automation to their definitions",
    instruction:"In the Knowledge Core, drag each benefit term to the definition that describes it. Benefits map to SY0-801 4.6 objective: explain the importance of automation.",
    pillarAnchor:"Exam objective — benefits of automation: efficiency, consistency, repeatability, scalability, reduced human error.",
    tab:"knowledge",
    hints:[
      "Nudge: one benefit is about doing things faster; another about doing them the same way every time.",
      "Direction: 'seconds vs hours' = efficiency; 'same way every time' = consistency; 'tens of thousands without headcount' = scalability; 'no typos/fatigue mistakes' = reduced human error.",
      "Demonstration: match b-efficiency, b-consistency, b-scalability, b-error to the four definitions in order.",
    ],
    feedback:"These four benefits are why automation matters in security operations: faster response, repeatable processes, scale beyond headcount, and fewer human mistakes. Together they shrink MTTD/MTTR and reduce alert fatigue.",
    check(env){
      const need = BENEFIT_TERMS.map(t=>t.termId);
      const allMatched = need.every(id=>has(env.matches,id,id));
      if(allMatched) return { passed:true, message:"All four benefits correctly matched." };
      const matched = need.filter(id=>has(env.matches,id,id)).length;
      return { passed:false, nearMiss:matched>=2, message: matched+"/4 matched. Re-read each definition and align it to the benefit it describes." };
    },
  },
  {
    id:"OBJ-M2", mode:"medium", pillar:"understand",
    title:"Distinguish automation vs orchestration vs SOAR",
    instruction:"Categorize each statement as Automation, Orchestration, or SOAR in the Knowledge Core.",
    pillarAnchor:"Exam objective — automation, orchestration, and SOAR as distinct but related concepts.",
    tab:"knowledge",
    hints:[
      "Nudge: a single script = automation; many steps coordinated end-to-end = orchestration; the platform that hosts it all = SOAR.",
      "Direction: SOAR is a product/platform; orchestration is the coordination pattern; automation is the individual task.",
      "Demonstration: c1=automation, c2=orchestration, c3=SOAR, c4=automation, c5=orchestration, c6=SOAR.",
    ],
    feedback:"Automation is a single task done by a machine; orchestration coordinates many automated tasks across tools into one workflow; SOAR is the platform that hosts, schedules, integrates, and reports on those workflows. Conflating them is a common exam trap.",
    check(env){
      const correct = Object.entries(CONCEPT_ANSWERS).filter(([k,v])=>has(env.categories,k,v)).length;
      const total = Object.keys(CONCEPT_ANSWERS).length;
      if(correct===total) return { passed:true, message:"All concepts categorized correctly." };
      return { passed:false, nearMiss:correct>=total-1, message: correct+"/"+total+" correct. Re-examine the difference between a single task, an end-to-end coordinated workflow, and the hosting platform." };
    },
  },
  {
    id:"OBJ-M3", mode:"medium", pillar:"recognize",
    title:"Classify which security tasks are good automation candidates",
    instruction:"In the Triage console, mark each use case as 'Automate' or 'Human-only'. The rule: automate what is repetitive, high-volume, well-defined, and reversible; keep humans for novel judgment and business nuance.",
    pillarAnchor:"Exam objective — use cases for automation: repetitive, high-volume, well-defined tasks.",
    tab:"triage",
    hints:[
      "Nudge: quarantine 500 known-pattern phishing emails = automate; judge a never-before-seen payload = human.",
      "Direction: anything requiring business negotiation or executive judgment stays human.",
      "Demonstration: automate u1,u3,u5,u7; keep human u2,u4,u6,u8.",
    ],
    feedback:"Automation shines on repetitive, high-volume, deterministic, reversible work. Novel analysis, business judgment, and high-stakes executive-context decisions stay human. Misclassifying these causes either missed threats or costly outages.",
    check(env){
      const correct = USE_CASES.filter(u=>has(env.useCases,u.id,u.answer)).length;
      const total = USE_CASES.length;
      if(correct===total) return { passed:true, message:"All use cases classified correctly." };
      return { passed:false, nearMiss:correct>=total-2, message: correct+"/"+total+" correct. Ask: is this repetitive and well-defined (automate), or does it need judgment/business nuance (human)?" };
    },
  },
  {
    id:"OBJ-M4", mode:"medium", pillar:"recognize",
    title:"Route a SIEM/EDR alert storm to the correct disposition",
    instruction:"In the Triage console, assign each alert the right disposition: auto-close, auto-enrich, auto-contain, or escalate to a human.",
    pillarAnchor:"Exam objective — automated alert triage & routing; reducing alert fatigue.",
    tab:"triage",
    hints:[
      "Nudge: confirmed-benign matching a known pattern = auto-close; needs context before deciding = auto-enrich; high-confidence critical threat = auto-contain; novel/ambiguous/business-critical = escalate.",
      "Direction: the nightly scan and the approved pattern go to auto-close; novel PowerShell goes to a human.",
      "Demonstration: a1=auto-enrich, a2=auto-contain, a3=auto-close, a4=auto-enrich, a5=escalate, a6=auto-contain.",
    ],
    feedback:"Correct routing is the heart of automated triage: auto-close benign, auto-enrich the uncertain, auto-contain high-confidence critical threats, and escalate anything novel or business-sensitive. Good routing shrinks the analyst's queue to what truly needs a human.",
    check(env){
      const items = ALERTS.filter(a=>!a.hardOnly);
      const correct = items.filter(a=>env.triage[a.id]===a.correct).length;
      const total = items.length;
      if(correct===total) return { passed:true, message:"All alerts routed correctly." };
      return { passed:false, nearMiss:correct>=total-1, message: correct+"/"+total+" routed. Re-check severity, confidence, and whether business context demands a human." };
    },
  },
  {
    id:"OBJ-M5", mode:"medium", pillar:"detect",
    title:"Enable the integrations that feed automated DETECTION",
    instruction:"In the Integrations console, switch ON the integrations that provide detection telemetry/data sources (so the SOC can actually see threats). Leave response-only or irrelevant ones off.",
    pillarAnchor:"Exam objective — integrations & data sources for detection (SIEM, EDR, threat intel, email gateway).",
    tab:"integrations",
    hints:[
      "Nudge: which tools generate the alerts and indicators you detect on?",
      "Direction: detection data sources = SIEM, EDR, threat intel, email gateway, vuln scanner. A firewall enforces policy but is mainly a response tool.",
      "Demonstration: enable siem, edr, threatintel, email, vuln; firewall can stay off for this detection objective.",
    ],
    feedback:"Detection requires telemetry. SIEM correlates logs, EDR reports endpoint behavior, threat intel enriches indicators, the email gateway reports phishing, and the vuln scanner reports exposure. Without these integrations the SOC is blind.",
    check(env){
      const need = ["siem","edr","threatintel"];
      const on = need.filter(id=>env.integrations[id]).length;
      if(on===need.length) return { passed:true, message:"Core detection integrations enabled." };
      return { passed:false, nearMiss:on>=2, message: on+"/3 core detection sources enabled (SIEM, EDR, threat intel). Without them you cannot detect reliably." };
    },
  },
  {
    id:"OBJ-M6", mode:"medium", pillar:"detect",
    title:"Classify detection methods: rule-based vs ML/behavioral",
    instruction:"In the Detection console, label each behavior as 'rule' (static/deterministic) or 'ml' (behavioral/baselined).",
    pillarAnchor:"Exam objective — AI-assisted workflows: ML/UEBA vs rule-based detection.",
    tab:"detection",
    hints:[
      "Nudge: exact-match (hash, IP on a list, parent-child process) = rule; deviation-from-a-learned-baseline = ML.",
      "Direction: 'baseline', 'never before', 'compared to peers' all signal ML.",
      "Demonstration: d1=rule, d2=ml, d3=rule, d4=ml, d5=rule, d6=ml.",
    ],
    feedback:"Rule-based detection catches known patterns deterministically (fast, explainable, but blind to novelty). ML/UEBA catches deviations from learned baselines (catches novel behavior, but needs tuning and can false-positive). Mature SOCs use both, orchestrated together.",
    check(env){
      const correct = DETECTION_BEHAVIORS.filter(d=>has(env.detectionMethods,d.id,d.answer)).length;
      const total = DETECTION_BEHAVIORS.length;
      if(correct===total) return { passed:true, message:"All methods classified correctly." };
      return { passed:false, nearMiss:correct>=total-1, message: correct+"/"+total+" correct. Ask: is this an exact match (rule) or a deviation from a baseline (ML)?" };
    },
  },
  {
    id:"OBJ-M7", mode:"medium", pillar:"detect",
    title:"Tune the detection threshold to balance true vs false positives",
    instruction:"In the Detection console, move the threshold slider. Find a value that keeps false positives low (<=8) while catching as many true positives as possible.",
    pillarAnchor:"Exam objective — tuning, false-positive management, reducing alert fatigue.",
    tab:"detection",
    hints:[
      "Nudge: too low = noise (many FP); too high = you miss real threats (low TP).",
      "Direction: watch the FP and TP readouts as you drag — aim FP<=8 with TP still >=38.",
      "Demonstration: a threshold around 84–90 keeps FP at or below 8 while TP stays in the low 40s.",
    ],
    feedback:"Threshold tuning is the daily work of detection engineering. Too low floods analysts (alert fatigue); too high misses threats. The right balance maximizes F1 score while respecting the team's capacity to investigate.",
    check(env){
      const m = detectionMetrics(env.threshold);
      if(m.fp<=8 && m.tp>=38) return { passed:true, message:`Threshold ${env.threshold}: TP ${m.tp}, FP ${m.fp}. Well balanced.` };
      if(m.fp<=12 && m.tp>=34) return { passed:false, nearMiss:true, message:`Close — TP ${m.tp}, FP ${m.fp}. Push the threshold a touch higher to drop FP to <=8.` };
      return { passed:false, message: m.fp>8 ? `FP ${m.fp} is too high (alert fatigue). Raise the threshold.` : `TP ${m.tp} is too low (missing threats). Lower the threshold.` };
    },
  },
  {
    id:"OBJ-M8", mode:"medium", pillar:"mitigate",
    title:"Build a ransomware containment playbook in the correct order",
    instruction:"In the Playbook console, assemble the containment pipeline: trigger -> enrich -> decide -> respond. Sequence matters.",
    pillarAnchor:"Exam objective — SOAR playbooks & automated response; containment of T1486 ransomware.",
    tab:"playbook",
    hints:[
      "Nudge: start with the EDR trigger (mass file encryption), then enrich with threat intel + endpoint context, then decide on severity/confidence, then act.",
      "Direction: the response actions are isolate host, disable account, block C2 IP, then notify analyst and create a ticket.",
      "Demonstration: trig-edr, enrich-ti, enrich-endpoint, decide-sev, decide-conf, act-isolate, act-disableacct, act-blockip, act-notify, act-ticket.",
    ],
    feedback:"A containment playbook is automation as a defensive control: detect the ransomware, enrich for confidence, then act fast — isolate the host, disable the account, block the C2, and loop in a human. Order matters: enrich before you act, so you act on validated context.",
    check(env){
      const want = RANSOMWARE_PLAYBOOK, got = env.playbook.nodes;
      if(got.length===want.length && want.every((id,i)=>got[i]===id)) return { passed:true, message:"Playbook assembled in the correct order." };
      const gotSet = new Set(got);
      if(want.every(id=>gotSet.has(id))) return { passed:false, nearMiss:true, message:"All the right nodes are present but the order is wrong. Enrich before you decide; decide before you act." };
      return { passed:false, message:"Pipeline incomplete. You need a trigger, enrichment, decision, then response actions in order." };
    },
  },
  {
    id:"OBJ-M9", mode:"medium", pillar:"mitigate",
    title:"Enable the integrations that allow automated RESPONSE",
    instruction:"In the Integrations console, enable the integrations that can take response actions (so the playbook can actually isolate hosts, disable accounts, and block IPs).",
    pillarAnchor:"Exam objective — integrations enabling automated response; API-driven action across tools.",
    tab:"integrations",
    hints:[
      "Nudge: which tools can DO something — isolate a host, disable an account, block an IP, quarantine a message?",
      "Direction: response-capable = EDR (isolate), IAM/AD (disable account), firewall (block IP), email gateway (quarantine).",
      "Demonstration: enable edr, identity, firewall, email.",
    ],
    feedback:"Detection without response is just watching. To automate response you must integrate the tools that can act: EDR isolates hosts, IAM disables accounts, the firewall blocks IPs, and the email gateway quarantines messages. These API integrations turn detection into defense.",
    check(env){
      const need = ["edr","firewall","identity"];
      const on = need.filter(id=>env.integrations[id]).length;
      if(on===need.length) return { passed:true, message:"Core response integrations enabled." };
      return { passed:false, nearMiss:on>=2, message: on+"/3 response integrations enabled (EDR, firewall, IAM). Without them the playbook cannot act." };
    },
  },
  {
    id:"OBJ-M10", mode:"medium", pillar:"mitigate",
    title:"Diagnose an automation failure and name residual risks",
    instruction:"In the Post-Mortem console, read the Monday outage scenario, select the root cause, and tick the residual risks that apply.",
    pillarAnchor:"Exam objective — challenges/risks of automation: over-reliance, false positives at scale, integration health.",
    tab:"postmortem",
    hints:[
      "Nudge: what changed Friday at 17:00 that made Monday's decisions wrong?",
      "Direction: the feed token expired; stale data drove false positives. Risks include acting on degraded intel, no freshness check, no human checkpoint for high-impact actions.",
      "Demonstration: root cause = rc1; tick r1, r2, r3, r4.",
    ],
    feedback:"Automation failures are usually integration/health failures, not algorithm failures. Stale intel + no freshness guard + no human checkpoint for high-impact actions = a preventable outage. The residual risk is that automation scales mistakes as fast as it scales correct actions.",
    check(env){
      const rc = env.postmortem.rootCause==="rc1";
      const risks = ["r1","r2","r3","r4"].filter(id=>env.postmortem.residualRisks.includes(id)).length;
      if(rc && risks>=3) return { passed:true, message:"Root cause and key residual risks identified." };
      return { passed:false, nearMiss: rc||risks>=2, message: !rc ? "Root cause is wrong — look at what fed bad data to the automation." : risks+"/4 key risks selected. Include acting on stale intel, no freshness check, and no human-in-the-loop." };
    },
  },
  {
    id:"OBJ-M11", mode:"medium", pillar:"detect",
    title:"Configure an AI-assisted investigation workflow",
    instruction:"In the AI Workflows console, enable UEBA behavioral detection and the generative-AI investigation summary for the insider-exfil case, then read the produced summary.",
    pillarAnchor:"Exam objective — AI-assisted workflows: UEBA + generative AI summaries for investigations.",
    tab:"ai",
    hints:[
      "Nudge: which two toggles give you behavioral anomaly detection AND a written investigation summary?",
      "Direction: UEBA finds the anomaly; the generative-AI summary writes it up for the analyst.",
      "Demonstration: enable ueba and genSummary; predictive triage is optional here.",
    ],
    feedback:"AI-assisted workflows combine ML detection (UEBA spots behavior no rule would catch) with generative AI (summarizes the case so the analyst acts faster). Used together they cut investigation time and surface insider threats that signature rules miss.",
    check(env){
      if(env.ai.ueba && env.ai.genSummary) return { passed:true, message:"UEBA + generative summary enabled." };
      return { passed:false, nearMiss: env.ai.ueba||env.ai.genSummary, message:"Enable both UEBA (behavioral detection) and the generative-AI investigation summary." };
    },
  },
  {
    id:"OBJ-M12", mode:"medium", pillar:"understand",
    title:"Read the efficiency dashboard and confirm the automation gain",
    instruction:"In the Metrics console, review the before/after automation metrics (MTTD, MTTR, automation rate, alerts per shift) and acknowledge the readout.",
    pillarAnchor:"Exam objective — measuring efficiency gains: MTTD/MTTR, automation rate, alert-volume reduction.",
    tab:"metrics",
    hints:[
      "Nudge: compare the 'before automation' and 'after automation' columns.",
      "Direction: MTTD and MTTR both dropped sharply; automation rate rose from 5% to 62%; analyst alerts per shift fell from 2100 to 740.",
      "Demonstration: click 'Acknowledge readout' once you've compared the two columns.",
    ],
    feedback:"Metrics prove the value of automation: faster detection (MTTD), faster response (MTTR), more of the workload handled by machines (automation rate), and far fewer alerts reaching a human (alert fatigue down). What gets measured gets funded.",
    check(env){ return env.metricsRead ? { passed:true, message:"Metrics reviewed." } : { passed:false, message:"Open the Metrics console and click 'Acknowledge readout'." }; },
  },
];

/* ---------- HARD objectives (8) ---------- */
const HARD_OBJECTIVES = [
  {
    id:"OBJ-H1", mode:"hard", pillar:"mitigate",
    title:"Design the complete ransomware containment playbook end-to-end",
    instruction:"Assemble the full pipeline in the Playbook console: trigger -> enrichment -> decisions -> response, in the correct sequence. Justify to yourself why each node is where it is. A wrong order is a wrong playbook.",
    pillarAnchor:"Full lifecycle: preconditions (EDR deployed) -> execution (T1486) -> artifacts (mass rename) -> detection (EDR) -> response (contain).",
    tab:"playbook",
    hints:["Enrich before you decide; decide before you act. Notify the human last (after containment) so the ticket reflects what was already done."],
    feedback:"A defensible playbook validates context (enrichment + confidence) before taking high-impact containment, then documents everything for the human. Acting before enriching risks containing the wrong host; acting without a ticket loses the audit trail.",
    check(env){
      const want = RANSOMWARE_PLAYBOOK, got = env.playbook.nodes;
      if(got.length!==want.length) return { passed:false, message:"Pipeline node count is wrong." };
      for(let i=0;i<want.length;i++){ if(got[i]!==want[i]) return { passed:false, nearMiss:true, message:`Node ${i+1} is wrong. Expected ${nodeLabel(want[i])}; the order must be trigger -> enrich -> decide -> act -> notify.` }; }
      return { passed:true, message:"Complete ransomware containment playbook validated end-to-end." };
    },
  },
  {
    id:"OBJ-H2", mode:"hard", pillar:"recognize",
    title:"Triage a noisy multi-source alert feed with two red herrings",
    instruction:"Route all 8 alerts (including two that look auto-containable but are business-critical). A correct routing rejects the near-miss of containing a backup job or a marketing blast.",
    pillarAnchor:"Exam objective — automated triage at scale + the limits of automation (business context).",
    tab:"triage",
    hints:["Two 'critical' alerts are traps: a nightly DB backup and a marketing email blast. Containing either causes an outage. Escalate them."],
    feedback:"Triage at scale is where automation earns or loses trust. Auto-contain the high-confidence threats, auto-enrich the uncertain, auto-close the confirmed-benign, but escalate anything business-critical or novel. Containing a backup job is the classic automation own-goal.",
    check(env){
      const items = ALERTS;
      const correct = items.filter(a=>env.triage[a.id]===a.correct).length;
      const total = items.length;
      if(correct===total) return { passed:true, message:"All 8 alerts routed correctly, both red herrings avoided." };
      const herrings = items.filter(a=>a.redHerring);
      const herringWrong = herrings.filter(a=>env.triage[a.id]!==a.correct).length;
      return { passed:false, nearMiss:correct>=total-1, message: herringWrong>0 ? "You tripped a red herring — a business-critical job looks like ransomware/exfil but must be escalated, not contained." : correct+"/"+total+" correct. Re-examine severity vs confidence vs business context." };
    },
  },
  {
    id:"OBJ-H3", mode:"hard", pillar:"detect",
    title:"Wire the integration chain for containment and flag the drifted integration",
    instruction:"Enable the complete chain needed for ransomware containment (trigger + enrich + respond) AND flag which integration is unhealthy (token expired) in the Integrations console.",
    pillarAnchor:"Exam objective — integrations across the chain + integration health monitoring.",
    tab:"integrations",
    hints:["The chain needs EDR (trigger + isolate), threat intel (enrich), identity (disable account), firewall (block IP). One of them is silently returning stale data — flag it."],
    feedback:"A response chain is only as strong as its weakest integration. The chain needs detection (EDR), enrichment (threat intel), and response (EDR isolate, IAM disable, firewall block). And you must monitor integration health — an expired token turns enrichment into poisoning.",
    check(env){
      const need = ["edr","threatintel","identity","firewall"];
      const on = need.filter(id=>env.integrations[id]).length;
      const flagged = env.brokenIntegration==="threatintel";
      if(on===need.length && flagged) return { passed:true, message:"Chain wired and the drifted threat-intel integration flagged." };
      if(on===need.length && !flagged) return { passed:false, nearMiss:true, message:"Chain is wired but you did not flag the unhealthy integration. Which feed silently served stale data in the post-mortem?" };
      return { passed:false, message:`Chain incomplete (${on}/${need.length}). You need EDR, threat intel, identity, and firewall.` };
    },
  },
  {
    id:"OBJ-H4", mode:"hard", pillar:"detect",
    title:"Engineer a detection: choose the method, tune the threshold, judge TPs vs FPs",
    instruction:"In the Detection console: classify all six behaviors (rule vs ML), then set the threshold to a defensible balance — FP at or below 6 while still catching at least 40 true positives. A near-miss on the threshold is rejected.",
    pillarAnchor:"Exam objective — detection engineering: rule vs ML selection, tuning, true/false positive judgment.",
    tab:"detection",
    hints:["Aim for FP at or below 6 while still catching at least 40 TPs — a narrow band around 86–90. Classify all six methods first."],
    feedback:"Detection engineering is choosing the right method (rule for known, ML for novel), then tuning the threshold to a defensible balance — low enough FP to respect analyst capacity, high enough TP to catch the threats. A detection that floods the queue is still a bad detection.",
    check(env){
      const methodsOk = DETECTION_BEHAVIORS.every(d=>has(env.detectionMethods,d.id,d.answer));
      const m = detectionMetrics(env.threshold);
      if(methodsOk && m.fp<=6 && m.tp>=40) return { passed:true, message:`Methods correct; threshold ${env.threshold}: TP ${m.tp}, FP ${m.fp}, F1 ${m.f1.toFixed(2)}.` };
      if(methodsOk && m.fp<=8 && m.tp>=38) return { passed:false, nearMiss:true, message:`Close — TP ${m.tp}, FP ${m.fp}. Tighten to FP<=6 while keeping TP>=40 (raise the threshold slightly).` };
      return { passed:false, message: !methodsOk ? "Classify all six behaviors first (rule vs ML)." : (m.fp>6 ? `FP ${m.fp} exceeds 6 — raise the threshold.` : `TP ${m.tp} is below 40 — lower the threshold.`) };
    },
  },
  {
    id:"OBJ-H5", mode:"hard", pillar:"mitigate",
    title:"Run the automation post-mortem: root cause + fixes + residual risk",
    instruction:"In the Post-Mortem console: select the root cause, tick ALL applicable residual risks, AND select the correct set of fixes. Wrong fixes or missed risks are rejected.",
    pillarAnchor:"Exam objective — challenges of automation + verifying effectiveness; residual risk after controls.",
    tab:"postmortem",
    hints:["Root cause is integration drift. Correct fixes add health monitoring, a human checkpoint for high-impact actions, and a data-freshness guard — never 'disable all automation'."],
    feedback:"A rigorous post-mortem separates root cause (integration drift) from residual risk (acting on stale data, no checkpoint, no freshness guard, over-reliance) from fixes (monitor health, add human-in-the-loop, enforce freshness). Disabling automation is never the fix — guarding it is.",
    check(env){
      const rc = env.postmortem.rootCause==="rc1";
      const risksOk = ["r1","r2","r3","r4"].every(id=>env.postmortem.residualRisks.includes(id)) && !env.postmortem.residualRisks.includes("r5");
      const fixesOk = ["f1","f2","f3"].every(id=>env.postmortem.fixes.includes(id)) && !env.postmortem.fixes.some(id=>id==="f4"||id==="f5");
      if(rc && risksOk && fixesOk) return { passed:true, message:"Root cause, residual risks, and fixes all correct." };
      return { passed:false, nearMiss: rc&&(risksOk||fixesOk), message: !rc ? "Root cause wrong." : !risksOk ? "Risks incomplete or includes a distractor — select all four real risks only." : "Fixes incomplete or include a distractor — pick monitoring, human checkpoint, freshness guard; reject 'disable automation'." };
    },
  },
  {
    id:"OBJ-H6", mode:"hard", pillar:"detect",
    title:"Justify where AI adds value vs introduces risk in a SOC",
    instruction:"In the AI Workflows console: enable UEBA, generative summary, and predictive triage; then read each capability's value/risk note and confirm you've reviewed the trade-offs.",
    pillarAnchor:"Exam objective — AI-assisted workflows: value vs risk (hallucination, over-reliance, explainability).",
    tab:"ai",
    hints:["Enable all three, then review the value/risk notes. Generative AI can hallucinate; predictive triage can mis-rank; UEBA needs tuning."],
    feedback:"AI value: UEBA catches novel insider behavior, predictive triage cuts the queue, generative AI writes faster summaries. AI risk: hallucinated summaries, mis-ranked triage, opaque decisions, and analyst skill atrophy. The defensible posture is AI-assist with a human accountable for the decision.",
    check(env){ return (env.ai.ueba && env.ai.genSummary && env.ai.predictiveTriage) ? { passed:true, message:"All three AI capabilities enabled and trade-offs reviewed." } : { passed:false, nearMiss: (env.ai.ueba?1:0)+(env.ai.genSummary?1:0)+(env.ai.predictiveTriage?1:0)===2, message:"Enable all three AI capabilities, then review the value/risk notes." }; },
  },
  {
    id:"OBJ-H7", mode:"hard", pillar:"understand",
    title:"Interpret efficiency metrics and judge whether automation is delivering",
    instruction:"In the Metrics console: compute MTTR improvement (%) and automation rate gain, then answer whether the program is delivering ROI and where to expand next.",
    pillarAnchor:"Exam objective — measuring efficiency: MTTR/MTTD, automation rate, alert-to-action ratio, ROI.",
    tab:"metrics",
    hints:["MTTR fell from 240 to 71 min (~70% reduction); automation rate rose from 5% to 62%. That is a strong ROI — expand to the next-highest-volume manual process."],
    feedback:"Numbers drive decisions. A ~70% MTTR cut and a 57-point automation-rate gain is a clear ROI. The next investment goes to the highest-volume, most repetitive, integration-ready manual process — measured, not guessed.",
    check(env){
      const mttrImprovement = Math.round((1 - METRICS_AFTER.mttr/METRICS_BEFORE.mttr)*100);
      const automationGain = METRICS_AFTER.automationRate - METRICS_BEFORE.automationRate;
      if(env.metricsRead && mttrImprovement>=65 && automationGain>=50) return { passed:true, message:`MTTR down ~${mttrImprovement}%, automation rate +${automationGain} pts — strong ROI.` };
      return { passed:false, nearMiss:env.metricsRead, message:"Review the before/after columns and acknowledge the readout; MTTR improvement is large." };
    },
  },
  {
    id:"OBJ-H8", mode:"hard", pillar:"mitigate",
    title:"Build the automation roadmap and justify the sequencing",
    instruction:"In the Roadmap console, rank the five candidate processes 1–5 by what to automate first. Rank by volume x repetitiveness x risk-if-manual x integration-readiness, weighted toward fast, safe wins.",
    pillarAnchor:"Exam objective — prioritizing automation; continuous improvement; integration readiness.",
    tab:"roadmap",
    hints:["Rank highest what is high-volume, highly repetitive, risky if left manual, AND integration-ready. Executive attribution briefings rank last."],
    feedback:"A roadmap ranks by impact-over-effort: phishing triage (huge volume, fully ready) first; endpoint isolation (high risk if slow) second; threat-intel enrichment (huge volume, ready) third; dev patching (good but lower urgency) fourth; executive briefings (judgment work, low readiness) last.",
    check(env){
      const correct = ROADMAP_PROCESSES.filter(p=>env.roadmap[p.id]===p.correctRank).length;
      const total = ROADMAP_PROCESSES.length;
      if(correct===total) return { passed:true, message:"Roadmap sequenced correctly." };
      return { passed:false, nearMiss:correct>=total-1, message: correct+"/"+total+" in the right rank. Weigh volume, repetitiveness, risk-if-manual, and integration-readiness." };
    },
  },
];

function objectivesFor(mode){ return mode==="medium" ? MEDIUM_OBJECTIVES : mode==="hard" ? HARD_OBJECTIVES : []; }

/* ---------- Quiz (R4 rotated positions, R5 balanced lengths) ---------- */
const QUIZ = [
  // MEDIUM — correct positions A,C,B,D,A,C
  { id:"q-m1", mode:"medium", prompt:"What is the key difference between automation and orchestration?",
    options:[ {id:"a",text:"One machine task versus many tasks coordinated into a workflow."},{id:"b",text:"Tasks on networks versus tasks on endpoints in a SOC."},{id:"c",text:"The same capability sold by competing vendors under different names."},{id:"d",text:"A newer category that fully replaces the older one."}],
    correct:"a", topic:"automation vs orchestration vs SOAR concepts",
    explanation:"Automation performs one task without human intervention. Orchestration sequences and coordinates many automated tasks — and the tools they touch — into one end-to-end workflow. SOAR is the platform that hosts both. The 'networks vs endpoints' and 'same product' distractors are common confusions; orchestration does not replace automation, it coordinates it." },
  { id:"q-m2", mode:"medium", prompt:"Which platform integrates security tools and runs response playbooks?",
    options:[ {id:"a",text:"SIEM"},{id:"b",text:"DLP"},{id:"c",text:"SOAR"},{id:"d",text:"NAC"}],
    correct:"c", topic:"SOAR platform identification",
    explanation:"SOAR (Security Orchestration, Automation, and Response) is purpose-built to integrate tools via APIs/webhooks and execute response playbooks. A SIEM correlates logs and alerts but is not, by itself, an orchestration/response platform. DLP and NAC are single-domain controls." },
  { id:"q-m3", mode:"medium", prompt:"Which is NOT a primary benefit of automation in security operations?",
    options:[ {id:"a",text:"Faster response with lower mean time to remediate."},{id:"b",text:"Removing analysts from the operations team entirely."},{id:"c",text:"Consistent, repeatable handling of every incident."},{id:"d",text:"Scaling to thousands of events without new headcount."}],
    correct:"b", topic:"benefits & limits of automation",
    explanation:"Automation accelerates, standardizes, and scales — but it does not eliminate analysts. Novel analysis, business judgment, and high-stakes decisions still require humans. The other three (faster response, consistency, scalability) are the real core benefits." },
  { id:"q-m4", mode:"medium", prompt:"What does UEBA do?",
    options:[ {id:"a",text:"Blocks IPs that appear on a static blocklist."},{id:"b",text:"Encrypts endpoints to protect data at rest."},{id:"c",text:"Sends simulated phishing emails to users."},{id:"d",text:"Baselines behavior with ML and flags deviations."}],
    correct:"d", topic:"UEBA & ML detection",
    explanation:"User and Entity Behavior Analytics (UEBA) uses machine learning to learn each user/entity's normal behavior and then flags anomalous deviations — e.g. a developer pulling 50 GB at 03:00. Static IP blocking is rule-based, not UEBA; encryption and phishing simulation are unrelated." },
  { id:"q-m5", mode:"medium", prompt:"Why should high-impact automated actions include a human-in-the-loop checkpoint?",
    options:[ {id:"a",text:"To block bad data from causing outages."},{id:"b",text:"Because machines always fail under any heavy load."},{id:"c",text:"To make every single playbook slower on purpose."},{id:"d",text:"Because rules forbid any automation use."}],
    correct:"a", topic:"human-in-the-loop guardrails",
    explanation:"Automation scales mistakes as fast as correct actions. A human-in-the-loop checkpoint before high-impact actions (block IP, disable account, quarantine a partner domain) prevents a single bad input — like stale threat intel — from causing an outage. The other options are either absolutist or false." },
  { id:"q-m6", mode:"medium", prompt:"What is a webhook?",
    options:[ {id:"a",text:"A type of malware that targets APIs."},{id:"b",text:"A physical security device for doors."},{id:"c",text:"An event-driven HTTP callback between systems."},{id:"d",text:"A slower version of a standard API."}],
    correct:"c", topic:"integrations: API & webhook",
    explanation:"A webhook is an event-driven HTTP callback. Instead of one system polling another, the source pushes a notification when an event occurs — ideal for triggering a SOAR playbook the moment an EDR alert fires. It is not malware, not a physical device, and not a 'slow API'." },
  // HARD — correct positions A,B,C,D,A,B,C
  { id:"q-h1", mode:"hard", prompt:"Triage: EDR raises a CRITICAL alert — mass file writes on SRV-DB01 at 02:00, pattern resembling ransomware. It is the approved nightly compressed DB backup. Correct disposition?",
    scenario:"A 'critical' alert that is actually a scheduled business-critical job.",
    options:[ {id:"a",text:"Escalate — tier-0 asset, resembles a threat."},{id:"b",text:"Auto-contain — the critical signal looks like ransomware."},{id:"c",text:"Auto-close — it is clearly benign daily activity."},{id:"d",text:"Auto-enrich, then auto-contain the host."}],
    correct:"a", topic:"triage red herrings & business context",
    explanation:"This is the classic automation red herring. The signal resembles ransomware, but the asset is tier-0/business-critical and the pattern matches a known scheduled job. Auto-containment would take down a production database; auto-close ignores the resemblance. Escalate, then add the job to an allowlist." },
  { id:"q-h2", mode:"hard", prompt:"SOAR quarantined 37 legitimate partner emails after a weekend. Root cause?",
    scenario:"Automation acted on degraded data.",
    options:[ {id:"a",text:"The SIEM was ingesting far too many logs."},{id:"b",text:"The threat-intel API token expired, serving stale data."},{id:"c",text:"An analyst clicked the wrong button once."},{id:"d",text:"The firewall firmware had a known bug."}],
    correct:"b", topic:"integration drift & post-mortem root cause",
    explanation:"Integration drift. The token expired Friday; stale/cached indicators drove false positives at scale Monday. The fix is integration-health monitoring, a data-freshness guard, and a human-in-the-loop for high-impact actions against partner domains. Log volume, a misclick, or firmware would not re-score a partner domain as malicious." },
  { id:"q-h3", mode:"hard", prompt:"For 'a developer downloading 50 GB from a repo they rarely touch at 03:00', which detection method fits and why?",
    scenario:"A behavior no signature would catch.",
    options:[ {id:"a",text:"Rule-based — match the exact large download size."},{id:"b",text:"Static hash blocklist applied to the repository."},{id:"c",text:"ML/UEBA — deviation from the user's baseline."},{id:"d",text:"No reliable detection is possible for this."}],
    correct:"c", topic:"rule vs ML detection selection",
    explanation:"No static rule captures 'unusual for THIS user'. UEBA learns each entity's baseline and flags deviations across volume, repository, and time. A fixed size rule or hash blocklist is blind to novel insider behavior; 'no detection possible' understates UEBA's role." },
  { id:"q-h4", mode:"hard", prompt:"MTTR was 240 min before automation and 71 min after. Automation rate rose from 5% to 62%. What is the fair interpretation?",
    scenario:"Reading the efficiency dashboard.",
    options:[ {id:"a",text:"Automation made things worse overall this quarter."},{id:"b",text:"No clear conclusion can be drawn from this."},{id:"c",text:"Fire the analysts and go fully automated now."},{id:"d",text:"Strong ROI — expand to the next ready process."}],
    correct:"d", topic:"efficiency metrics & ROI",
    explanation:"A ~70% MTTR reduction and a 57-point automation-rate gain is a clear, measurable ROI. The next investment follows the data: the highest-volume, most repetitive, integration-ready manual process. 'Things got worse' and 'no conclusion' contradict the numbers; firing analysts is the wrong lesson." },
  { id:"q-h5", mode:"hard", prompt:"A ransomware containment chain needs to isolate a host, disable the account, and block the C2 IP. Which integrations MUST be enabled?",
    scenario:"Wiring the response chain.",
    options:[ {id:"a",text:"EDR, IAM/AD, firewall, plus threat intel."},{id:"b",text:"SIEM and the email gateway alone together."},{id:"c",text:"The vulnerability scanner by itself alone."},{id:"d",text:"None — containment is fully manual work."}],
    correct:"a", topic:"response integration chain",
    explanation:"Containment requires the tools that can ACT: EDR isolates the host, IAM/AD disables the account, the firewall blocks the C2 IP. Threat intel enriches so you act on validated context. SIEM/email detect but cannot contain; the vuln scanner reports exposure only." },
  { id:"q-h6", mode:"hard", prompt:"Where does generative AI add value AND where does it introduce risk in a SOC?",
    scenario:"Weighing AI-assisted workflows.",
    options:[ {id:"a",text:"Value: replaces all analysts. Risk: none."},{id:"b",text:"Value: fast summaries. Risk: hallucinated detail."},{id:"c",text:"Value: blocks IPs. Risk: it cannot block IPs."},{id:"d",text:"Value: none. Risk: it is illegal to use."}],
    correct:"b", topic:"AI-assisted workflows value vs risk",
    explanation:"Generative AI excels at summarizing multi-source evidence into a fast, readable case brief. The risk is hallucination — confident, false detail an analyst may not verify. The defensible posture is AI-assist with a human accountable for the final decision. It does not replace analysts, block IPs, or be illegal." },
  { id:"q-h7", mode:"hard", prompt:"Ranking automation candidates 1–5, which should be automated FIRST?",
    scenario:"Building the roadmap.",
    options:[ {id:"a",text:"Executive incident attribution briefings and write-ups."},{id:"b",text:"A one-off forensic investigation of a breach."},{id:"c",text:"Phishing email triage and quarantine."},{id:"d",text:"Negotiating a tier-0 server outage with stakeholders."}],
    correct:"c", topic:"automation roadmap prioritization",
    explanation:"Phishing triage is the textbook first automation target: enormous volume, fully repetitive, well-defined, and integration-ready (email gateway + threat intel). Executive briefings, one-off forensics, and stakeholder negotiations rank last — they need human judgment and are not repetitive." },
];

/* ---------- Debrief ---------- */
const DEBRIEF = {
  detectionOpportunities:[
    "Correlate EDR mass-file-rename signals (T1486) with threat-intel C2 lookups for fast, confident ransomware detection.",
    "Pair rule-based detection (known hashes/IPs/parent-child) with UEBA (baseline deviations) so novel behavior is not missed.",
    "Use webhooks from EDR/email gateway to trigger SOAR the instant an event fires — no polling lag.",
    "Tune thresholds to the F1 peak while keeping FP volume under analyst capacity; re-tune as adversaries shift.",
  ],
  mitigationRecommendations:[
    "SOAR containment playbook for T1486 ransomware (isolate host, disable account, block C2) — validate before acting.",
    "Integration-health monitoring: alert on API auth failures and stale feed timestamps (prevents integration drift).",
    "Human-in-the-loop checkpoints for high-impact actions on partner/whitelisted domains and tier-0 assets.",
    "Data-freshness guard: refuse to act on indicators older than a policy window.",
    "CI/CD for patch/policy deployment so controls ship consistently and repeatably.",
  ],
  blueTeam:[
    "Measure MTTD/MTTR/automation-rate/alert-volume — what gets measured gets funded.",
    "Route before you respond: auto-close benign, auto-enrich uncertain, auto-contain high-confidence critical, escalate novel/business-critical.",
    "Keep an allowlist of known business-critical jobs (backups, campaign blasts) so they don't trip auto-contain.",
  ],
  redTeam:[
    "Adversaries probe for integration drift — a SOC blind to a stale feed is a SOC acting on poisoned data.",
    "Novel behavior defeats rule-based detection; assume UEBA is watching and blend into legitimate baselines.",
    "High-impact auto-response is itself an attack surface — trigger it on a tier-0 asset to cause a self-inflicted outage.",
  ],
  references:[
    { label:"MITRE ATT&CK — T1486 Data Encrypted for Impact", url:"https://attack.mitre.org/techniques/T1486/" },
    { label:"MITRE ATT&CK — T1566 Phishing", url:"https://attack.mitre.org/techniques/T1566/" },
    { label:"MITRE ATT&CK — T1078 Valid Accounts", url:"https://attack.mitre.org/techniques/T1078/" },
    { label:"MITRE ATT&CK — T1048 Exfiltration Over Alternative Protocol", url:"https://attack.mitre.org/techniques/T1048/" },
    { label:"MITRE ATT&CK — T1071 Application Layer Protocol", url:"https://attack.mitre.org/techniques/T1071/" },
  ],
};

/* ---------- R8 focus areas (performance-derived) ---------- */
const OBJECTIVE_FOCUS = {
  "OBJ-M1":{topic:"Benefits of automation",guidance:"Re-match efficiency / consistency / scalability / reduced-error to their definitions in the Knowledge Core."},
  "OBJ-M2":{topic:"Automation vs orchestration vs SOAR",guidance:"Re-categorize the six statements — a single script vs an end-to-end coordinated workflow vs the hosting platform."},
  "OBJ-M3":{topic:"Automation candidacy",guidance:"Re-classify use cases: automate repetitive, well-defined, reversible work; keep humans for judgment and business nuance."},
  "OBJ-M4":{topic:"Alert triage routing",guidance:"Re-route the feed: auto-close benign, auto-enrich uncertain, auto-contain high-confidence critical, escalate novel."},
  "OBJ-M5":{topic:"Detection data sources",guidance:"Re-enable the integrations that FEED detection telemetry (SIEM, EDR, threat intel, email, vuln)."},
  "OBJ-M6":{topic:"Rule vs ML detection",guidance:"Re-classify the six behaviors: exact match = rule; deviation from a learned baseline = ML/UEBA."},
  "OBJ-M7":{topic:"Threshold tuning & false positives",guidance:"Re-tune the slider to FP<=8 while keeping TP>=38 — the alert-fatigue vs missed-threat balance."},
  "OBJ-M8":{topic:"SOAR playbook sequencing",guidance:"Re-build the ransomware playbook in order: trigger → enrich → decide → act → notify."},
  "OBJ-M9":{topic:"Response integrations",guidance:"Re-enable the integrations that ACT: EDR isolate, IAM disable, firewall block, email quarantine."},
  "OBJ-M10":{topic:"Automation failure post-mortem",guidance:"Re-diagnose the Monday outage: integration drift root cause + residual risks (stale data, no checkpoint)."},
  "OBJ-M11":{topic:"AI-assisted workflows",guidance:"Re-enable UEBA + generative-AI summary for the insider-exfil case."},
  "OBJ-M12":{topic:"Efficiency metrics",guidance:"Re-read the before/after dashboard: MTTD, MTTR, automation rate, alerts per shift."},
  "OBJ-H1":{topic:"End-to-end containment playbook",guidance:"Re-assemble the full ransomware pipeline with strict ordering (enrich before decide, decide before act)."},
  "OBJ-H2":{topic:"Triage at scale + red herrings",guidance:"Re-route all 8 alerts — watch the two business-critical jobs that look containable but must be escalated."},
  "OBJ-H3":{topic:"Integration chain + health",guidance:"Re-wire EDR+threatintel+identity+firewall AND flag the drifted (token-expired) feed."},
  "OBJ-H4":{topic:"Detection engineering",guidance:"Re-tune to FP<=6 with TP>=40 after classifying all six methods."},
  "OBJ-H5":{topic:"Post-mortem root cause + fixes",guidance:"Re-select root cause, all four residual risks, and the three correct fixes (monitor, checkpoint, freshness)."},
  "OBJ-H6":{topic:"AI value vs risk trade-offs",guidance:"Re-enable all three AI capabilities and review each value/risk note."},
  "OBJ-H7":{topic:"Metrics & ROI interpretation",guidance:"Re-interpret MTTR ~70% reduction and +57pt automation rate as ROI; pick the next expansion target."},
  "OBJ-H8":{topic:"Automation roadmap",guidance:"Re-rank the five candidates by volume × repetitiveness × risk × readiness."},
};
const QUIZ_FOCUS_GUIDANCE = {
  "automation vs orchestration vs SOAR concepts":"Review the Knowledge Core: one task = automation; coordinated workflow = orchestration; hosting platform = SOAR.",
  "SOAR platform identification":"Review the Knowledge Core: one task = automation; coordinated workflow = orchestration; hosting platform = SOAR.",
  "benefits & limits of automation":"Re-read the four benefits — automation accelerates, standardizes, scales; it does NOT replace analysts.",
  "UEBA & ML detection":"Re-classify rule vs ML: exact match = rule; deviation from a learned baseline = ML/UEBA.",
  "human-in-the-loop guardrails":"Re-study why high-impact actions need a checkpoint: to stop bad/stale data causing outages.",
  "integrations: API & webhook":"Review API vs webhook: API = request/response on demand; webhook = event-driven push callback.",
  "triage red herrings & business context":"Re-practice the red herrings: tier-0 jobs and campaign blasts look containable but must be escalated.",
  "integration drift & post-mortem root cause":"Re-study the Monday outage: expired token → stale intel → false positives at scale.",
  "rule vs ML detection selection":"Pick ML/UEBA when the behavior deviates from a user baseline — no static rule catches it.",
  "efficiency metrics & ROI":"Re-read the dashboard: ~70% MTTR cut + 57pt automation gain = strong ROI; expand to the next ready process.",
  "response integration chain":"Re-wire the chain: EDR isolate, IAM disable, firewall block, plus threat intel for enrichment.",
  "AI-assisted workflows value vs risk":"Generative AI = fast summaries, risk = hallucination; keep a human accountable for the decision.",
  "automation roadmap prioritization":"Rank by volume × repetitiveness × risk-if-manual × integration-readiness; phishing triage first.",
};
function focusAreasFor(objectiveStates, quizAnswers, mode){
  const byTopic = new Map();
  for(const [id, st] of Object.entries(objectiveStates)){
    const f = OBJECTIVE_FOCUS[id]; if(!f) continue;
    const struggled = !st.firstAttemptPassed || !st.completed;
    if(!struggled) continue;
    const ex = byTopic.get(f.topic);
    if(ex) ex.source.push(id); else byTopic.set(f.topic, {topic:f.topic, guidance:f.guidance, source:[id]});
  }
  for(const q of QUIZ){
    if(q.mode!==mode) continue;
    const chosen = quizAnswers[q.id];
    if(chosen && chosen===q.correct) continue;
    const ex = byTopic.get(q.topic);
    if(ex) ex.source.push(q.id); else byTopic.set(q.topic, {topic:q.topic, guidance:QUIZ_FOCUS_GUIDANCE[q.topic]||"Revisit the relevant console and the Debrief field notes.", source:[q.id]});
  }
  return [...byTopic.values()].sort((a,b)=>b.source.length-a.source.length);
}

const PILLAR_LABEL = { understand:"Understand", recognize:"Recognize", detect:"Detect", mitigate:"Mitigate" };
const PILLAR_ORDER = ["understand","recognize","detect","mitigate"];

// Expose on window for classic-script load order
window.LAB_DATA = {
  defaultEnv, GLOSSARY, BENEFIT_TERMS, BENEFIT_DEFS, BENEFIT_TERMS_SHUFFLED, BENEFIT_DEFS_SHUFFLED,
  CONCEPT_ITEMS, CONCEPT_CATEGORIES, CONCEPT_ANSWERS, USE_CASES, INTEGRATIONS, NODE_CATALOG,
  RANSOMWARE_PLAYBOOK, ALERTS, detectionCurve, detectionMetrics, DETECTION_BEHAVIORS,
  POSTMORTEM_SCENARIO, POSTMORTEM_ROOT_CAUSES, POSTMORTEM_RISKS, POSTMORTEM_FIXES,
  ROADMAP_PROCESSES, METRICS_BEFORE, METRICS_AFTER, SCENARIOS,
  MEDIUM_OBJECTIVES, HARD_OBJECTIVES, objectivesFor, QUIZ, DEBRIEF, focusAreasFor, PILLAR_LABEL, PILLAR_ORDER,
};
