/* ══════════════════════════════════════════════════════════════════════
   js/data.js — ALL lab content (data only, no logic): findings, scan
   results, IPAM rows, code lines, work-order options, ranking keys,
   quiz banks, glossary, statements and the objective definitions with
   their success/next-step/hint texts. Carried over 1:1 from the lab.
   Load order: 1st (everything else reads these constants).
   ══════════════════════════════════════════════════════════════════════ */
"use strict";

/* ══════════════ DATA LAYER ══════════════ */
"use strict";

const PHASES = ["Remediate", "Identify", "Validate", "Prioritize"]; // shuffled start state for OBJ-M1 widget
const PHASES_OK = ["Identify", "Prioritize", "Remediate", "Validate"];

const FINDINGS = {
  F1:{id:"F1",asset:"MR-101 booking-web",title:"Unauthenticated RCE in template engine",vid:"MER-2025-014",score:9.8,sev:"crit",
    vector:"AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",via:["ext-nc","int-nc","int-c"],wo:"patch",
    chips:[["c-crit","ACTIVELY EXPLOITED"],["c-amber","INTERNET-FACING"],["c-high","REVENUE-CRITICAL"]],
    facts:"9.8 Critical · exploited in the wild · internet-facing"},
  F2:{id:"F2",asset:"MR-102 payments-gw",title:"Admin API authentication bypass",vid:"MER-2025-022",score:9.1,sev:"crit",
    vector:"AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",via:["int-nc","int-c"],wo:"patch",
    chips:[["c-crit","PCI-DSS SCOPE"],["c-high","PIVOT-REACHABLE"]],
    facts:"9.1 Critical · PCI crown jewels · one pivot away"},
  F3:{id:"F3",asset:"MR-103 crew-portal",title:"Missing authorization check on schedule export",vid:"MER-2025-031",score:7.4,sev:"high",
    vector:"AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N",via:["code"],wo:"codefix",
    chips:[["c-teal","SOURCE-REVIEW ONLY"],["c-low","INTERNAL"]],
    facts:"7.4 High · logic flaw — no scanner can see it"},
  F4:{id:"F4",asset:"MR-104 jump-gold",title:"Outdated VPN client baked into golden image",vid:"MER-2025-027",score:5.3,sev:"med",
    vector:"AV:N/AC:H/PR:L/UI:R/S:U/C:L/I:L/A:N",via:["int-c"],wo:"imagefix",
    chips:[["c-med","BASELINE / GOLDEN IMAGE"]],
    facts:"5.3 Medium · credentialed scan only · fix the image, rebuild the hosts"},
  F5:{id:"F5",asset:"MR-105 legacy-linx",title:"Unpatched file-service flaw — vendor EOL, no fix exists",vid:"MER-2024-008",score:8.1,sev:"high",
    vector:"AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:L",via:["int-nc","int-c"],wo:"exception",
    chips:[["c-high","VENDOR EOL — UNPATCHABLE"],["c-low","INTERNAL"]],
    facts:"8.1 High · no vendor fix · exception + isolation path"},
  F6:{id:"F6",asset:"MR-106 mail-relay",title:"OpenSSL banner reports vulnerable version string",vid:"MER-2025-019",score:7.5,sev:"high",
    vector:"AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N",via:["int-nc"],wo:"fp",
    chips:[["c-med","BACKPORT SUSPECT"]],
    facts:"7.5 High as reported · banner evidence only — verify before believing"},
  F7:{id:"F7",asset:"MR-107 dc-dns",title:"SMB flaw — vendor patch available",vid:"MER-2025-034",score:7.8,sev:"high",
    vector:"AV:N/AC:H/PR:L/UI:N/S:U/C:H/I:H/A:H",via:["int-nc","int-c"],wo:"patch",
    chips:[["c-amber","DOMAIN CONTROLLER"]],
    facts:"7.8 High · core infrastructure identity"},
  F8:{id:"F8",asset:"MR-108 guest-ap-04",title:"AP firmware RCE — management interface reachable from guest net",vid:"MER-2025-029",score:8.2,sev:"high",
    vector:"AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",via:["ext-nc","int-nc","int-c"],wo:"firmware",
    chips:[["c-amber","GUEST-REACHABLE"],["c-amber","INTERNET-FACING MGMT IFACE"]],
    facts:"8.2 High · internet-reachable via guest management interface"},
  F9:{id:"F9",asset:"MR-109 hr-fileserver",title:"Stale share permissions — broad read group on HR folder",vid:"MER-2025-011",score:3.5,sev:"low",
    vector:"AV:N/AC:L/PR:L/UI:N/S:U/C:L/I:N/A:N",via:["int-c"],wo:"schedule",
    chips:[["c-low","LOW — STANDING WORK"],["c-teal","CREDENTIALED ONLY"]],
    facts:"3.5 Low · permissions hygiene · scheduled, not urgent"},
  F11:{id:"F11",asset:"cloud · mr-passenger-docs",title:"Object storage bucket publicly readable",vid:"CSPM-003",score:7.5,sev:"high",
    vector:"AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N",via:["cspm"],wo:"config",
    chips:[["c-crit","CLOUD — INTERNET-EXPOSED"]],
    facts:"7.5 High · passenger documents, public ACL"},
  F12:{id:"F12",asset:"cloud · meridian-cloud-prod",title:"Cloud audit logging disabled",vid:"CSPM-004",score:5.0,sev:"med",
    vector:"AV:N/AC:H/PR:L/UI:N/S:U/C:L/I:N/A:N",via:["cspm"],wo:"config",
    chips:[["c-med","DETECTION GAP"]],
    facts:"5.0 Medium · no audit trail — a blindfold, not a hole"}
};
const ALL_FINDINGS = ["F1","F2","F3","F4","F5","F6","F7","F8","F9","F11","F12"];

const SCAN_RESULTS = {
  "ext-nc":{finds:["F1","F8"],lines:[
    "$ profile: external · non-credentialed · non-intrusive","[ok] 2 external targets swept from attacker perspective",
    "[!] MR-101 booking-web  — template engine banner matches MER-2025-014 (unauth RCE) — <b class='lg-err'>EXPLOIT SEEN IN THE WILD</b>",
    "[!] MR-108 guest-ap-04 — mgmt interface on guest VLAN, firmware matches MER-2025-029",
    "$ 2 findings appended to Defect Queue. What an outside attacker sees is exactly this."]},
  "ext-c":{finds:["F1","F8"],lines:[
    "$ profile: external · credentialed","[warn] credentialed checks against internet-facing production need change-control sign-off — results match non-credentialed view"]},
  "int-nc":{finds:["F1","F2","F5","F6","F7","F8"],lines:[
    "$ profile: internal · non-credentialed · non-intrusive","[ok] 10.20.x swept — banner and service fingerprints only",
    "[!] MR-102 payments-gw — admin API auth bypass signature (MER-2025-022)",
    "[!] MR-105 legacy-linx — file service matches MER-2024-008 (vendor EOL)",
    "[!] MR-106 mail-relay — OpenSSL banner reports vulnerable version string (MER-2025-019)",
    "[!] MR-107 dc-dns — SMB flaw MER-2025-034, patch available",
    "$ 6 findings appended. NOTE: banners are evidence, not proof."]},
    "int-c":{finds:["F1","F2","F4","F5","F7","F8","F9"],lines:[
    "$ profile: internal · credentialed · non-intrusive","[ok] patch levels read from each host — most accurate view",
    "[!] MR-104 jump-gold — VPN client package outdated in golden image (MER-2025-027)",
    "[!] MR-109 hr-fileserver — stale share permissions, broad read group (MER-2025-011, Low)",
    "[ok] MR-106 mail-relay — distro backported the OpenSSL fix; NO vulnerable build present",
    "$ credentialed evidence stored — MR-106 banner finding is now disprovable at the gate."]}
};

const IPAM_ROWS = [
  {ip:"10.20.4.11",name:"MR-101 booking-web",scope:true},
  {ip:"10.20.4.12",name:"MR-102 payments-gw",scope:true},
  {ip:"10.20.5.21",name:"MR-105 legacy-linx",scope:true},
  {ip:"10.20.6.30",name:"MR-106 mail-relay",scope:true},
  {ip:"10.20.6.31",name:"MR-107 dc-dns",scope:true},
  {ip:"10.20.7.44",name:"— unregistered —",scope:false,rogue:true}
];

const CODE_LINES = [
  {n:1,t:"@app.route('/api/schedule/export')"},
  {n:2,t:"def export_schedule():",pick:"wrong"},
  {n:3,t:"    \"\"\"Export crew schedule for the given crew member.\"\"\""},
  {n:4,t:"    crew_id = request.args.get('crew_id')"},
  {n:5,t:"    fmt = request.args.get('format', 'csv')"},
  {n:6,t:"    # scenario note(gate this once SSO lands)",pick:"right"},
  {n:7,t:"    if not crew_id:"},
  {n:8,t:"        abort(400, 'crew_id required')"},
  {n:9,t:"    rows = db.fetch_schedule(crew_id)"},
  {n:10,t:"    token = sign_payload(crew_id, ADMIN_KEY)"},
  {n:11,t:"    return respond(rows, fmt, token)"}
];

const WO_OPTIONS = [
  ["","— assign action —"],
  ["patch","Apply emergency patch"],
  ["schedule","Schedule in standard change window"],
  ["firmware","Firmware update"],
  ["config","Configuration change (fix now)"],
  ["codefix","Fix code & deploy update"],
  ["imagefix","Update golden image & rebuild hosts"],
  ["exception","Isolate & file risk exception"]
];

const RANK_M = ["F1","F2","F8"];
const RANK_M_OK = ["F1","F8","F2"];
const RANK_H = ["F1","F2","F8","F11","F7","F5","F3"];
const RANK_H_OK = ["F1","F8","F11","F2","F7","F5","F3"];

const QUIZ_M = [
  {q:"Put the vulnerability-management cycle in the correct order.",
   o:["Identify, remediate, validate, prioritize","Prioritize, identify, remediate, validate","Identify, prioritize, remediate, validate","Identify, prioritize, validate, remediate"],a:2,topic:"the cycle order",
   why:"Each phase feeds the next: identify weaknesses, prioritize them by context, remediate what matters, validate the ending — then repeat. Remediate can't precede Prioritize (you'd spend emergency capacity blindly), and Validate can't precede Remediate (there'd be nothing to prove)."},
  {q:"Which scan profile shows the most accurate patch state of your internal servers?",
   o:["A credentialed internal scan","A non-credentialed internal scan","An external banner check","An intrusive external sweep"],a:0,topic:"credentialed vs non-credentialed",
   why:"Credentialed scans log in and read installed patch levels — ground truth, and how MR-106's lying banner was disproved. The distractors only infer from banners and exposed services; intrusive adds crash risk, not accuracy."},
  {q:"Two findings: (A) Medium 5.4 on an internet-facing host, actively exploited in the wild. (B) Critical 9.3 on an isolated internal host, no known exploit. Which is prioritized first?",
   o:["The internal Critical — score rules","Both — they share one slot","The first one found — age rules","The exploited Medium — context wins"],a:3,topic:"context vs raw score",
   why:"Active exploitation plus internet exposure is the strongest prioritization multiplier — the attacked system is bleeding now. The internal Critical still gets fixed, but after; trusting raw CVSS alone (option 1's trap) is exactly the mistake the lesson warns against."},
  {q:"Your scanner found nothing on crew-portal, but users suspect anyone can export any colleague's schedule. Which identification method finds this?",
   o:["Non-credentialed external host scanning","Manual source code review","Automated IPAM scope reconciliation","Intrusive internal service testing"],a:1,topic:"logic-flaw discovery",
   why:"A missing authorization check is an absent gate — no scanner pattern detects code that doesn't exist, so review is the only finder that sees it. The scanning distractors see deployed services, and IPAM finds unknown hosts, not missing logic."},
  {q:"You place a WAF virtual patch in front of the vulnerable booking portal. Does the finding close?",
   o:["No — it reduces risk but never closes","Yes — blocked exploits mean fixed","Yes — when the WAF vendor certifies it","No — unless it runs inline IPS"],a:0,topic:"compensating controls",
   why:"The vulnerable code is still on the host, so the finding stays open — a compensating control buys safe time and lowers urgency. Option 2 is the classic trap: blocking an exploit is not remediating the flaw."},
  {q:"A scan flags mail-relay via an OpenSSL version banner, but the distro backported the fix and patch level is correct. What is this finding?",
   o:["A true positive — patch once more","A false positive — close, proof attached","An accepted risk — file the exception","A stale scan — rerun it tomorrow"],a:1,topic:"banner false positives",
   why:"Backported fixes keep the old version string, so the banner lies — credentialed patch-level evidence disproves it and the finding closes as a false positive with proof attached. Patching again (option 1) is an unnecessary change; an exception (option 3) is for real, unpatchable risks."}
];

const QUIZ_H = [
  {q:"TRIAGE — Saturday, 23:00. Three findings: (A) 8.2 High on the guest Wi-Fi AP, mgmt interface internet-reachable. (B) 9.1 Critical on the PCI payment gateway, internal-only, no exploit in the wild. (C) 5.4 Medium on the booking portal, actively exploited. One emergency slot tonight — what goes in?",
   o:["B — the 9.1 PCI Critical","A — the exposed 8.2 High","C — the exploited 5.4 Medium","None — defer to Tuesday's window"],a:2,topic:"active-exploitation priority",
   why:"C is being attacked right now on an internet-facing system — exploitation plus exposure outranks score and band. B still enters the emergency plan, but 'highest score first' (option 1) ignores that nobody is exploiting it tonight."},
  {q:"IDENTIFY — IPAM shows a registered host at 10.20.7.44 that appears in no scan scope and no CMDB record. First move?",
   o:["Reconcile and scan it — scope first","Ignore it — no findings, no risk","File a risk exception for it","Run an intrusive scan to reveal it"],a:0,topic:"IPAM scope reconciliation",
   why:"You cannot triage what you never scan — unknown hosts enter scope before any other decision. Option 2 is the trap: 'no findings' only means nobody looked, and an intrusive scan (option 4) risks crashing it while proving nothing about scope."},
  {q:"IDENTIFY — 'passenger documents bucket is publicly readable; cloud audit logging is disabled on the prod account.' Which method surfaced this?",
   o:["Credentialed host scanning","CSPM posture checking","External banner scanning","Manual source code review"],a:1,topic:"CSPM cloud findings",
   why:"Public bucket ACLs and disabled audit logging live in the cloud control plane, which host scanners never read — CSPM reads the provider APIs. Every distractor here operates on hosts, code, or banners instead."},
  {q:"VALIDATE — You applied the domain-controller patch; re-inspection still flags the SMB flaw. Evidence shows the KB installed at 14:02 but the SMB service started six days ago. What now?",
   o:["Close it — the patch is installed","Escalate — the patch clearly failed","File it — rescan says vulnerable","Reboot, restart the service, re-inspect"],a:3,topic:"installed vs running",
   why:"The KB is on disk but the SMB process predates it — installed is not running until the vulnerable process is replaced. Closing on the install (option 1) is the verification failure; the vendor is irrelevant since the patch actually applied."},
  {q:"REMEDIATE — legacy-linx runs an EOL OS; the vendor will never ship a fix for an 8.1 High. Compliant handling?",
   o:["Isolate and file a risk exception","Build an unofficial patch in-house","Accept it silently — no paperwork","Decommission tonight, outages aside"],a:0,topic:"unpatchable exception process",
   why:"An unpatchable system is still managed: segment it, document an accountable owner and review date, re-review on schedule. Silent acceptance (option 3) skips exactly the accountability that makes acceptance defensible."},
  {q:"CHAIN — Pen test proved: internet → booking-web RCE → internal pivot → payments-gw auth bypass → payment DB. Which remediation set breaks the demonstrated chain?",
   o:["Patch booking-web only","Patch payments-gw only","Patch both chain endpoints","Re-score both below threshold"],a:2,topic:"attack chains vs scores",
   why:"A chain stays alive while either link works — kill the internet entry AND the lateral target, or segment the payments path. Re-scoring (option 4) edits the paperwork, not the attack path."},
  {q:"VALIDATE — A junior analyst says: 'Patch downloaded to the host — finding verified closed.' Your response?",
   o:["Correct — downloaded means remediated","Wrong — re-inspect and prove it gone","Correct — if the scan was credentialed","Wrong — only pen testers close findings"],a:1,topic:"verification matches discovery",
   why:"Verification must match the discovery method — a rescan proving the flaw absent (and the service restarted) is the evidence. Downloads and tickets are intentions; option 4 invents a rule that doesn't exist."}
];

const OBJ_TOPIC = {
  M1:"the cycle order",M2:"scan profile selection",M3:"exploitation-driven prioritization",M4:"IPAM scope gaps",
  M5:"CSPM cloud posture",M6:"logic-flaw discovery",M7:"context vs raw score",M8:"remediation selection",
  M9:"risk exceptions",M10:"installed ≠ running validation",M11:"banner false positives",M12:"report audiences",
  H1:"full discovery coverage",H2:"triage rule ordering",H3:"change-window discipline",H4:"exception compliance",
  H5:"validation traps",H6:"attack-chain breaking",H7:"compensating controls",H8:"CVSS metric reading",H9:"program truths"
};

const GLOSSARY = [
  ["Vulnerability","A weakness in a system, application, or process that a threat can exploit."],
  ["CVE","Public identifier for a specific known vulnerability (this lab uses synthetic IDs, MER-xxxx)."],
  ["CVSS v3.1","Scoring system producing 0.0–10.0 from eight base metrics (AV, AC, PR, UI, S, C, I, A)."],
  ["Severity bands","None 0.0 · Low 0.1–3.9 · Medium 4.0–6.9 · High 7.0–8.9 · Critical 9.0–10.0."],
  ["Credentialed scan","Scan with account access on targets — reads patch levels and config; the most accurate view."],
  ["Non-credentialed scan","Scan without login — sees only exposed services and banners; approximates the attacker's outside view."],
  ["Intrusive scan","Aggressive checks that can crash fragile services — swap in safe checks, don't exclude the asset."],
  ["IPAM","IP address management registry; reconciling it against scan coverage finds unknown/never-scanned hosts."],
  ["CSPM","Cloud Security Posture Management — audits cloud account config (public buckets, disabled logging)."],
  ["Exposure","Whether a vulnerable asset is reachable from the internet/guest networks versus internal only."],
  ["Asset criticality","Business importance of the asset — PCI scope, domain controllers, revenue systems."],
  ["Active exploitation","A working exploit is publicly used (CISA KEV catalog in the real world) — strongest priority multiplier."],
  ["Compensating control","Interim protection (e.g., WAF virtual patch) that reduces risk but never closes the finding."],
  ["Segmentation","Network isolation that limits who can reach a vulnerable system."],
  ["Risk exception","Documented, time-limited acceptance of a risk with an accountable owner and a review date."]
];

const CHAIN_OPTS = ["F1","F2","F7","F8","F11"];
const CHAIN_OK = ["F1","F2"];
const STMTS = [
  "MTTR (mean time to remediate) is a management-level metric for the fix pipeline.",
  "A risk exception requires an accountable owner and a review date.",
  "A compensating control reduces urgency but never closes a finding.",
  "The highest-CVSS finding is always remediated first.",
  "One well-tuned scan type can find every weakness in the estate.",
  "A finding is verified closed once the patch file is downloaded to the host."
];
const STMTS_OK = [0,1,2];

/* ── Objective definitions ── */
const OBJ = {
  M1:{p:"P1",bay:"brief",txt:"Order the four phases of the vulnerability-management cycle in the Knowledge Core.",
    ok:"Cycle internalized: Identify → Prioritize → Remediate → Validate, and it repeats forever. Everything else you did today hangs on this skeleton.",
    nx:"The cycle is Identify (find) → Prioritize (decide) → Remediate (fix/accept) → Validate (prove). Re-order the cards.",
    hints:["Four phases — the memo lists them in order in the Knowledge Core.","Think about what must exist before you can rank it, and what must happen before you trust a fix.","Identify, Prioritize, Remediate, Validate."]},
  M2:{p:"P1",bay:"bay1",txt:"Match the right scan profile to the three missions in the Bay 01 profile drill.",
    ok:"Profiles matched: credentialed reads patch truth, external gives the attacker's view, fragile assets get safe checks — never exclusion.",
    nx:"Re-check the drill: A wants patch-level truth, B wants the attacker's outside view, C must not crash a fragile service.",
    hints:["Credentialed scans log in and read patch levels.","What does an attacker on the internet reach? That's the external view.","'Fragile devices get safe checks, not exclusion' — run non-intrusive."]},
  M3:{p:"P2",bay:"bay1",txt:"Run the external non-credentialed scan and open the actively exploited internet-facing finding.",
    ok:"That is the one: unauthenticated RCE, 9.8 Critical, internet-facing, exploit in the wild. M1016's fastest-patching guidance exists precisely for this shape.",
    nx:"Run the external · non-credentialed profile in Bay 01, then click into the finding it surfaces on booking-web.",
    hints:["The scan console defaults: switch scope to External, keep non-credentialed, run.","It will be the highest-severity card on the Defect Queue, beacon red.","F1 — booking-web, ACTIVELY EXPLOITED chip."]},
  M4:{p:"P2",bay:"bay1",txt:"Reconcile the IPAM ledger against scan coverage and bring the unknown host into scope.",
    ok:"10.20.7.44 registered as 'shadow-backup' — clean, but it was invisible. Unknown hosts enter scan scope before any other decision, because you can't triage what you never scan.",
    nx:"In Bay 01 → IPAM ledger: reconcile coverage, then add the unregistered host to scope and scan it.",
    hints:["Switch to the IPAM ledger tab.","Reconcile first — the table will flag one host that no scan reaches.","10.20.7.44, 'unregistered' — add it to scope."]},
  M5:{p:"P2",bay:"bay1",txt:"Run the CSPM posture check and report both cloud misconfigurations it finds.",
    ok:"Public passenger-docs bucket + disabled audit logging — both invisible to every host scanner. CSPM sees the cloud control plane that the rest of your finders cannot.",
    nx:"Bay 01 → CSPM posture tab: run the posture check on meridian-cloud-prod and open both findings.",
    hints:["The cloud account is a separate tool tab in Bay 01.","One finding exposes data; the other blinds your detection.","F11 (public bucket) and F12 (logging disabled)."]},
  M6:{p:"P2",bay:"bay1",txt:"In the source-review pane, flag the line that lets any caller export any crew member's schedule.",
    ok:"Line 6 — the scenario note where the authorization check should be. That's a logic flaw: no scanner pattern finds a missing gate; only review does.",
    nx:"Look for what is MISSING, not what is broken — the endpoint never checks who is allowed to export.",
    hints:["Read it as an attacker: can I pass any crew_id?","Input validation (line 7) is not authorization.","The scenario note comment admits the gate never shipped — line 6."]},
  M7:{p:"P2",bay:"bay2",txt:"Rank the three contested findings on the Triage Board (F1, F2, F8) using the context chips.",
    ok:"F1 → F8 → F2: active exploitation first, then internet reachability, then the internal PCI asset. Exposure and exploitation beat the raw 9.1 score — the lesson's core prioritization rule.",
    nx:"Not quite — check the chips: which one is being exploited right now? Which is internet-reachable? Which is 'only' internal?",
    hints:["Chips on each card: F1 is ACTIVELY EXPLOITED and internet-facing.","F8 is internet-reachable; F2 is internal (PCI though).","An internal 9.1 still ranks behind an internet-reachable 8.2 here."]},
  M8:{p:"P4",bay:"bay3",txt:"Assign the correct work-order action to F1 (booking-web), F3 (crew-portal), F8 (guest AP) and F11 (bucket).",
    ok:"Emergency patch for the exploited RCE, code fix for the logic flaw, firmware for the AP, configuration change for the bucket. Right tool per defect — that's the remediation muscle.",
    nx:"One action per defect: F1 patch, F3 code fix, F8 firmware, F11 configuration. Re-check Bay 03.",
    hints:["A web-app RCE with a vendor fix available → patch.","A missing authorization check can't be patched with an OS update.","An AP = firmware; a public bucket = configuration change."]},
  M9:{p:"P4",bay:"bay3",txt:"File a compliant risk exception for MR-105 legacy-linx: isolate it, name an accountable owner, set a review date.",
    ok:"Exception filed: isolated, owned, time-boxed. 'An unpatchable system is still managed, not ignored' — the owner and review date are what make acceptance accountable.",
    nx:"Select 'Isolate & file risk exception' for F5, then complete all three exception fields below the work-order list.",
    hints:["F5's correct action is in the dropdown — it's not patching.","Isolation is segmentation: management VLAN only.","Owner: the person accountable — R. Alvarez owns MR-105. Pick a real review date."]},
  M10:{p:"P3",bay:"bay4",txt:"Re-inspect the patched domain controller and get MR-107 genuinely clean — watch for installed ≠ running.",
    ok:"Patch installed, service restarted, re-inspection clean. Installed ≠ running — a patch defends nothing until the vulnerable process is replaced.",
    nx:"Run the re-inspection sweep in Bay 04, read MR-107's evidence, make the right call, then re-inspect.",
    hints:["After assigning F7's patch, run the re-inspection sweep.","The evidence shows when the SMB service last started versus when the patch landed.","Reboot & restart the service, then re-inspect — and only then close it."]},
  M11:{p:"P3",bay:"bay4",txt:"Prove the MR-106 banner finding is a false positive using credentialed evidence, and close it as FP.",
    ok:"Closed as false positive with proof: the distro backported the fix; the banner string lies. Banner evidence ≠ patch truth — this is why verification matches the discovery method.",
    nx:"You need credentialed evidence first: run an internal credentialed scan in Bay 01, then decide at the Bay 04 gate.",
    hints:["MR-106's finding came from a banner — which scan reads real patch levels?","Internal · credentialed · non-intrusive in Bay 01.","Then record 'False positive' at the gate with the evidence attached."]},
  M12:{p:"P4",bay:"bay4",txt:"Match the three report fragments to their audiences (engineers, management, auditors).",
    ok:"Fragment A→engineers (hostnames, steps, evidence), B→management (MTTR trend, exposure), C→auditors (verification records, exception register). Reporting is part of validation.",
    nx:"Re-match: who needs steps and hostnames? Who needs metrics? Who needs evidence and the exception register?",
    hints:["Fragment A is full of hostnames and actions.","Management consumes metrics: MTTR, exposure trends, accepted risk.","Auditors consume proof: verification records and registers."]},
  H1:{p:"P2",bay:"bay1",txt:"Complete discovery: run every finder and surface every finding report, plus the unregistered host.",
    ok:"Full sweep: external + credentialed + non-credentialed views, CSPM, source review, IPAM reconciliation. Every report and one forgotten host — that is the whole estate. Every finder has a blind spot; you covered all four.",
    nx:"Incomplete sweep — compare the Defect Queue against every tool in Bay 01: external scan, internal non-credentialed, internal credentialed, CSPM, code review, IPAM.",
    hints:["Each scan profile sees different things — run internal BOTH ways.","The golden-image and permissions findings only appear credentialed; the banner suspect only non-credentialed.","Count: 10 real findings + 1 banner suspect (F6) + the rogue host in IPAM."]},
  H2:{p:"P2",bay:"bay2",txt:"Rank all seven urgent findings by the published triage rules — strict order.",
    ok:"F1 → F8 → F11 → F2 → F7 → F5 → F3. Exploited first, internet-exposed next, then PCI/DC criticality, then score. Every chip justified the position.",
    nx:"Order rejected — re-apply the four rules in sequence: exploited, internet-reachable, PCI/DC, then higher CVSS.",
    hints:["Rule 1: only F1 is actively exploited.","Rule 2: F8 (AP) and F11 (public bucket) are internet-exposed — 8.2 before 7.5.","Rule 3 puts F2 (PCI) then F7 (DC); rule 4: F5's 8.1 beats F3's 7.4."]},
  H3:{p:"P4",bay:"bay3",txt:"Fill the emergency change window (4 slots) with the right urgent actions; schedule the rest; defer what cannot be fixed.",
    ok:"Window used on F1, F2, F8, F11 — the exposed, the exploited and the PCI path. F3/F4/F7/F12 scheduled; MR-105 deferred under a real exception. That is a defensible change board.",
    nx:"The CAB will reject this — exactly four emergency actions (F1 patch, F2 patch, F8 firmware, F11 config), everything fixable scheduled, MR-105 excepted.",
    hints:["Emergency capacity is for exploited, exposed or PCI-reachable defects — not a 5.3 image refresh.","F7's patch is available Tuesday; schedule it.","F12 (enable logging) is a config fix that can ride the standard window."]},
  H4:{p:"P4",bay:"bay3",txt:"Make the MR-105 exception audit-proof: isolation, owner R. Alvarez, earliest review date.",
    ok:"Audit-proof: isolated to the management VLAN, accountable owner R. Alvarez (Infrastructure Lead), review 2025-06-01. Exceptions expire — that's what separates acceptance from neglect.",
    nx:"Near-miss rejected — the register demands: isolation ON, owner R. Alvarez (who owns MR-105), review date 2025-06-01 (earliest).",
    hints:["Which owner actually owns the legacy server? Their title says so.","Auditors want the tightest acceptable expiry, not the comfortable one.","Isolate + Alvarez + 2025-06-01 — the full triple."]},
  H5:{p:"P3",bay:"bay4",txt:"Clear all three validation traps: the reboot-required DC, the banner false positive, and the silent-host sanity check.",
    ok:"All three traps cleared: service restarted before closing F7, FP closed on credentialed evidence, and the findings-drop exposed as a dead host instead of a win. That's the return-to-service discipline in full.",
    nx:"One or more traps remain. The gate keeps three: MR-107 (patched?), MR-106 (banner?), and the asset-count sanity check.",
    hints:["Trap 1: evidence compares install time vs service start time.","Trap 2: credentialed evidence disproves the banner — FP.","Trap 3: 9 of 11 assets responding — findings didn't drop because of fixes."]},
  H6:{p:"P2",bay:"bay2",txt:"Break the pen-test chain: select exactly the two findings whose remediation kills entry AND lateral movement.",
    ok:"F1 + F2: no entry, no pivot target. The chain is broken at both links — proof beats inference, chains outrank isolated scores.",
    nx:"Rejected — the chain needs BOTH links broken: the internet entry (F1) and the pivot target (F2). Exactly two.",
    hints:["Read the pen-test tab: the chain has an entry point and a lateral target.","Patching one endpoint leaves the other link alive.","F1 and F2 — nothing else is in the demonstrated chain."]},
  H7:{p:"P4",bay:"bay3",txt:"Apply the WAF virtual patch as an interim control for F1 — and get F1 closed only by the real patch + re-inspection.",
    ok:"WAF bought safe time; the finding stayed open; the emergency patch plus re-inspection closed it. Compensating controls mitigate urgency — remediation plus validation closes findings.",
    nx:"Sequence incomplete — apply the interim WAF control AND take F1 through patch → re-inspection. The WAF alone must never close it.",
    hints:["The interim control panel is under the work orders.","If you re-inspect with only the WAF applied, the gate will tell you what a virtual patch cannot do.","End state: WAF applied, patch assigned, F1 validated closed."]},
  H8:{p:"P1",bay:"bay2",txt:"CVSS evaluation: for both pairs, pick the higher score and name the driving metric.",
    ok:"AV:N beats AV:L (network-vector reach), and S:C beats S:U (changed scope propagates impact). Two levers, both from the same 8-metric vector — that's how you read scores like an analyst.",
    nx:"Re-read the vectors — one metric differs per pair. Which one moves the score?",
    hints:["Pair A differs only in the first metric — network adjacent vs local.","Pair B's X propagates beyond the vulnerable component — that's the Scope metric.","X then X; Attack Vector, then Scope."]},
  H9:{p:"P4",bay:"bay4",txt:"Assemble the Review Board packet: select exactly the three true statements.",
    ok:"MTTR for management, owner + review date for exceptions, compensating controls never close. The other three are the classic failure myths — score worship, one-tool hubris, downloaded ≠ verified.",
    nx:"Exactly three are true. The false ones worship raw score, single tools, and downloads as verification.",
    hints:["What did the priority board do to the 'always highest score first' idea?","Did any single finder see everything today?","Where did 'downloaded' actually land you with MR-107?"]}
};
