/* ============================================================================
   DATA — all lab content, verbatim from the audited original (v4).
   Objectives, artifacts, pins, campaign options, gap board, sequences, match pairs,
   anomaly cases, quiz banks (rotated answers), hints, nudges, glossary, pillars.
   No logic here — pure structured constants. */
const TYPES = [
  "Phishing — credential harvest",
  "Smishing",
  "Vishing",
  "Whaling / BEC",
  "Legitimate — verified safe"
];

const ACTIONS = [
  "Report with the report button, then delete — do not click or reply",
  "Do not click any link and never share a code — report to security",
  "Do not reply — verify through a previously known channel, then report",
  "No action needed — this one is verified legitimate"
];

const ARTIFACTS = [
  {
    id:"a1", chan:"EMAIL", title:"Reported by: 2 staff · auto-logged by gateway",
    who:"Harborline HR Benefits &lt;hr-benefits@harbor1ine-freight.com&gt;",
    meta:["To: you (Finance)","Subject: ACTION TODAY — payroll portal password expires today","07:42"],
    body:`<p><b>Dear employee,</b></p><p>Your payroll portal password <b>expires TODAY</b>. To avoid losing access to your pay stubs, renew it now at the secure portal below:</p><p>Renew here: <span class="linkish">https://harborline-freight[.]securepay-portal[.]com/renew</span></p>
    <p class="attention">Unrenewed accounts are purged after 24 hours.</p><p>— Harborline People Operations</p>`,
    note:"Gateway note: sender domain is <b>harbor1ine</b>-freight.com (the letter <b>l</b> replaced by digit <b>1</b>). Landing page host is not harborline-freight.com.",
    t:0, a:0,
    why:"Credential-harvest phishing: a look-alike domain (homoglyph “1” for “l”), manufactured urgency (“expires TODAY”), a landing page outside the company’s real domain, and a generic greeting. The report button turns this into telemetry — deleting it alone teaches the program nothing."
  },
  {
    id:"a2", chan:"SMS", title:"Forwarded to security by: dispatcher",
    who:"Sender: “HARBORLINE-FRT” · short code 80466",
    meta:["To: dispatcher mobile","11:16"],
    body:`<div class="sms">HARBORLINE FREIGHT: Shipment HL-4471 is HELD at customs. Pay the $4.99 clearance fee now to release it: <span class="linkish">h1br-freight-pay.co/fee</span> — Freight Ops</div>`,
    note:"Harborline never requests fees by SMS. The link host <b>h1br-freight-pay.co</b> is a look-alike; real shipment notices come from the dispatch portal.",
    t:1, a:0,
    why:"Smishing: phishing over SMS, using a plausible operational pretext and a tiny “fee” to lower suspicion. Same rule as email — don’t click, report it — because the channel changed, not the technique (T1566 pattern)."
  },
  {
    id:"a3", chan:"VOICEMAIL TRANSCRIPT", title:"Transcribed by voicemail-to-text",
    who:"Caller ID: +1 (800) 555-0142 · “IT Help Desk”",
    meta:["To: help desk queue","Duration: 26s","06:03"],
    body:`<div class="vm">“Hi — Marcus Dunlap, IT help desk. We’re doing overnight account verification and your account is flagged. I’ve just sent a six-digit code to your phone. Read it back to me so I can finish, or I’ll have to lock your account at 8 AM.”</div>`,
    note:"Harborline IT never asks for MFA codes — ever. “Marcus Dunlap” is not on the help-desk roster, and codes are only sent when YOU request them.",
    t:2, a:1,
    why:"Vishing: voice-channel social engineering aimed at your MFA code — one shared code defeats MFA the same way a clicked link does. The rule is absolute: no code, no password, no confirmation to an inbound caller; hang up and report."
  },
  {
    id:"a4", chan:"EMAIL", title:"Flagged by: Finance Director",
    who:"Dana Whitfield — CEO &lt;d.whitfield@haborline-freight.com&gt;",
    meta:["To: R. Okafor — Finance Director","Subject: CONFIDENTIAL — board wire, today only","09:31"],
    body:`<p>Rhiannon —</p><p>I’m at the acquisition signing all day and can’t take calls. I need a <b>$228,400 wire</b> to a new supplier account before 4 PM. The board wants this kept between us for now — <b>please don’t loop in anyone else</b>.</p><p>Confirm you’re handling this personally and I’ll send the account details.</p><p>— Dana</p>`,
    note:"The real CEO domain is <b>d.whitfield@harborline-freight.com</b> — this sender is missing the “r” (haborline). Real Dana is reachable on the number in the company directory.",
    t:3, a:2,
    why:"Whaling / business email compromise: authority pressure, secrecy (“don’t loop in anyone”), urgency, and a near-miss domain. Money requests are verified through a previously known channel — never by replying."
  },
  {
    id:"a5", chan:"EMAIL", title:"Auto-logged by gateway (no reports)",
    who:"IT Operations &lt;it-operations@harborline-freight.com&gt;",
    meta:["To: all-staff","Subject: Scheduled maintenance Sat 02:00–04:00 — mail gateway","Change ticket CHG-2291"],
    body:`<p>All,</p><p>The mail gateway is updated <b>Saturday 02:00–04:00</b> (ticket CHG-2291, posted on the change calendar). Mail queues and retries automatically. <b>No action is required</b> — details on the intranet: <span class="linkish">intranet.harborline-freight.com/maintenance</span></p><p>— IT Operations</p>`,
    note:"Sender domain matches the real company domain; the link host is the real intranet; the change is ticketed and scheduled. Nothing asks for credentials or urgency.",
    t:4, a:3,
    why:"Legitimate: real domain, real intranet host, ticketed change, no urgency and no credential request. Recognizing safe mail matters too — report-everything noise buries the real signals."
  },
  {
    id:"a6", chan:"EMAIL", title:"In an established vendor thread",
    who:"AxleTek Supply — AP &lt;ap@axletek-supply.com&gt;",
    meta:["To: procurement","Subject: RE: PO-8812 — monthly freight straps order","Reply #7 in thread"],
    body:`<p>Hi team,</p><p>Re-sending the signed <b>PO-8812.pdf</b> you asked for on Monday — attachment below. Everything else from our call is unchanged; delivery Thursday as planned.</p><p>— Amara, AxleTek AP</p>`,
    note:"Known vendor domain, an established six-reply thread, content matching Monday’s call, and no urgency. The attachment was requested by procurement.",
    t:4, a:3,
    why:"Legitimate: established thread, known domain, content consistent with prior contact. In real programs, users learn the difference between “strange” and “suspicious” — this one is merely familiar-routine."
  }
];

/* ---- Yard sweep ---- */

const PIN_TAGS = ["Credential exposure","Physical access","Removable media & cables","Data handling & disposal","Visual privacy"];

const PIN_ACTIONS = [
  "Lock the screen, remove the written password, and report the near-miss",
  "Erase the exposed secrets from the board and report the near-miss",
  "Politely refuse, direct them to the badge desk, and report it",
  "Do not connect it — hand it to Security for inspection",
  "Retrieve it immediately and lock it away for secure destruction",
  "Nothing on it is readable — leave it for the cleaning crew",
  "Unplug the unknown cable and use your own power-only adapter",
  "Escort them back to reception and verify the visitor badge",
  "Reposition the screen away from sight / add a privacy filter",
  "Cross-cut shred it and log it as a disposal near-miss"
];

const PINS = [
  { id:"h1", x:560, y:70,  room:"Dispatch office", label:"Marker 1 · Dispatch desk",
    find:"Workstation unlocked and unattended. Sticky note under the keyboard: “VPN: ops\\H.Riley — Harbor2026!”.",
    risk:0, act:0,
    teach:"Unlocked screens plus written passwords are the classic credential-exposure pair (clean-desk + screen-lock). One photo from an aisle or window is all an attacker needs — and reuse means that password may open several doors." },
  { id:"h2", x:330, y:60,  room:"Meeting room", label:"Marker 2 · Whiteboard",
    find:"Whiteboard not erased after the vendor call: “Guest WiFi: HarborGuest2026! / Admin console pw: ask Dana”.",
    risk:0, act:1,
    teach:"Boards leak secrets long after meetings end. Erase-and-report is the habit; the near-miss also tells the program that meeting hygiene needs a module." },
  { id:"h3", x:150, y:180, room:"Freight door", label:"Marker 3 · Badge door",
    find:"Camera note: two people through the freight door — one badged, one carrying boxes right behind, no badge visible.",
    risk:1, act:2,
    teach:"Tailgating is entering behind someone without their consent; piggybacking is the same entry with misplaced consent. Either way the control is people, which is why badge-door awareness briefs exist." },
  { id:"h4", x:370, y:290, room:"Reception lobby", label:"Marker 4 · Lost & found bowl",
    find:"A USB stick in the lobby lost-and-found bowl, hand-labelled “Q4_Layoffs_Plan”.",
    risk:2, act:3,
    teach:"Curiosity bait. A dropped stick labeled with something juicy is a classic removable-media attack (T1091/T1200 pattern); the only safe handling is don’t-connect — hand it to Security." },
  { id:"h5", x:340, y:200, room:"Print corner", label:"Marker 5 · Printer tray",
    find:"Printed payroll exception report sitting in the output tray — names, bank fragments, amounts.",
    risk:3, act:4,
    teach:"A printout is data at rest sitting in public. Retrieve-and-secure immediately, then route it for destruction; the near-miss feeds the clean-desk module." },
  { id:"h6", x:200, y:290, room:"Yard side door", label:"Marker 6 · Recycling bin",
    find:"Open recycling bin by the side door: intact sheets of customer manifests with names, addresses and load values.",
    risk:3, act:9,
    teach:"Dumpster diving needs no technology. PII in any readable form must be cross-cut shredded — disposal is part of handling data at rest, and the bin placement is a program finding." },
  { id:"h7", x:590, y:200,  room:"Corridor kiosk", label:"Marker 7 · Charging kiosk",
    find:"Phone left unlocked on the shared corridor kiosk, charging from an unbranded cable someone taped in place.",
    risk:2, act:6,
    teach:"Unknown cables and public USB ports are a removable-media/cables risk (data-over-USB). Power-only adapters or your own charger; never leave an unlocked device unattended." },
  { id:"h8", x:400, y:110,  room:"Meeting room", label:"Marker 8 · Visitor at the table",
    find:"A visitor with no visible badge alone at the conference table, company laptop open in front of them.",
    risk:1, act:7,
    teach:"Unescorted, unbadged visitors next to corporate hardware is a physical-access finding. Escort to reception and verify — politely, without accusation." },
  { id:"h9", x:570, y:290,  room:"Finance office", label:"Marker 9 · Window desk",
    find:"Finance workstation faces the parking lot; the ledger screen is readable from outside, and the blinds are open.",
    risk:4, act:8,
    teach:"Shoulder surfing doesn’t need to be over your shoulder — a window and a telephoto work too. Reposition or filter the screen; visual privacy is a cheap, effective control." }
];

/* ---- Campaign studio ---- */

const CAMPAIGN_FIELDS = {
  payload:{q:"Simulated payload", opts:[
    ["payload-link","Credential-harvest landing page — fake login that records only opens, never captures anything"],
    ["payload-attach","“Malicious” attachment simulator — inert file, measures opens"],
    ["payload-none","Plain link with no landing page"]]},
  audience:{q:"Audience", opts:[
    ["aud-all","All 412 staff, one blast"],
    ["aud-target","Finance + Dispatch first — the departments the threat data points at"],
    ["aud-exec","Executives only"]]},
  difficulty:{q:"Template difficulty", opts:[
    ["diff-obvious","Obviously fake, every time"],
    ["diff-escalate","Escalating: obvious → subtle → spear-quality as report rates rise"],
    ["diff-hard","Hardest templates from day one"]]},
  cadence:{q:"Cadence", opts:[
    ["cad-once","Once a year, during training week"],
    ["cad-monthly","Monthly, randomized day and template"],
    ["cad-quarter","Quarterly, fixed Mondays"]]},
  tone:{q:"What happens when someone clicks", opts:[
    ["tone-edu","Educational — a short coaching page and a thank-you note for reporters"],
    ["tone-pun","Punitive — clickers are named in a memo"]]}
};

const CAMPAIGN_GOOD = { payload:"payload-link", audience:"aud-target", difficulty:"diff-escalate", cadence:"cad-monthly", reportBtn:true, tone:"tone-edu",
  metrics:["m-report","m-ttr"] };

const CAMPAIGN_BAD = { payload:"payload-link", audience:"aud-all", difficulty:"diff-obvious", cadence:"cad-once", reportBtn:false, tone:"tone-pun",
  metrics:["m-click","m-names"] };

const METRIC_OPTS = [["m-click","Click rate"],["m-report","Report rate"],["m-ttr","Median time-to-report"],["m-repeat","Repeat clickers"],["m-names","Publish individual clicker names"]];

const REPORT_REASON = {
  q:"Why is the one-click report button non-negotiable?",
  opts:[
    ["r1","It turns every user into detection telemetry and drives the two KPIs that prove program value: report rate and time-to-report"],
    ["r2","It lets IT fix computers faster"],
    ["r3","It deletes malicious mail automatically"],
    ["r4","It satisfies the annual policy requirement"]
  ], correct:"r1"};

/* ---- Training yard planner ---- */

const POOL = [
  ["pMfa","Password-manager rollout + credential-scanner check + MFA enrollment clinic"],
  ["pData","Data handling & disposal micro-course + clean-desk policy acknowledgment"],
  ["pReport","Blame-free reporting campaign + one-click report-button training + exec reinforcement note"],
  ["pEngage","Gamified capture-the-flag day + tabletop exercise + monthly micro-refreshers"],
  ["pRemote","Remote-work micro-course + VPN-everywhere guidance + home-router hardening checklist"],
  ["dLecture","One annual 3-hour compliance lecture for everyone"],
  ["dNames","Publish a leaderboard naming every campaign clicker"],
  ["dFirewall","Buy another firewall appliance"]
];

const GAPS = [
  { id:"g1", title:"Password reuse", ev:"Baseline survey: 43% of staff reuse one password across work and personal accounts; 61 lost credentials on breach-checker lists.", correct:"pMfa" },
  { id:"g2", title:"Data mishandling", ev:"Yard sweep: payroll printouts in printer trays; client manifests in open recycling bins.", correct:"pData" },
  { id:"g3", title:"Underreporting", ev:"Finance reported 3% of phishing tests. Exit interviews: “I thought I’d get in trouble.”", correct:"pReport" },
  { id:"g4", title:"Skill decay", ev:"Metrics house: clicks improve after each campaign, drift back up within six weeks.", correct:"pEngage" },
  { id:"g5", title:"Remote/hybrid exposure", ev:"Dispatchers work from truck stops; two home routers found on default admin passwords.", correct:"pRemote" }
];
/* ---- Rollout sequencer (H4) ---- */

const SEQ_STEPS = [
  ["baseline","Baseline: staff survey + first campaign metrics — know the starting point"],
  ["sponsor","Executive sponsorship: board briefing, budget, visible leadership support"],
  ["policy","Policy acknowledgment: AUP and handbooks read and signed"],
  ["train","Phased micro-training by role — short, recurring, relevant"],
  ["sim","Simulated phishing campaigns — escalating difficulty, live telemetry"],
  ["measure","Measure & iterate: quarterly review, adjust topics and cadence"]
];

const SEQ_CORRECT = ["baseline","sponsor","policy","train","sim","measure"];

const SEQ_SHUFFLED = ["sponsor","train","measure","policy","sim","baseline"];
/* ---- Attack → countermeasure matcher (H7) ---- */

const MATCH_PAIRS = [
  ["Whaling email impersonating the CEO (T1566)","Executive-impersonation drills + callback verification for payment requests"],
  ["Vishing help-desk calls asking for MFA codes (T1566.004 / T1621)","Never-share-codes rule + callback procedure for every inbound “IT” call"],
  ["Credential stuffing against reused passwords (T1110.004)","Password manager + credential-scanner alerts + unique passwords"],
  ["USB sticks planted in the parking lot (T1091 / T1200)","Removable-media policy + device control that blocks unknown USB"],
  ["Tailgating at the freight door","Badge-discipline briefs + “no consensual tailgating” awareness"],
  ["Smishing customs-fee texts (T1566.002 via SMS)","Report-to-security short code + channel-variance training"]
];

const MATCH_DECOYS = ["Install a WAF on the payroll portal","Buy an air-gapped backup appliance"];
/* QA fix (R6): dropdown options are served in this fixed SHUFFLED order — no option index equals its pair index,
   so the display order never reveals the correct pairs. */

const MATCH_OPTION_ORDER = [
  "Password manager + credential-scanner alerts + unique passwords",
  "Install a WAF on the payroll portal",
  "Report-to-security short code + channel-variance training",
  "Buy an air-gapped backup appliance",
  "Removable-media policy + device control that blocks unknown USB",
  "Executive-impersonation drills + callback verification for payment requests",
  "Badge-discipline briefs + “no consensual tailgating” awareness",
  "Never-share-codes rule + callback procedure for every inbound “IT” call"
];
/* QA fix (R6): planner dropdowns use this shuffled pool order (no diagonal mapping from gap index to correct option). */

const POOL_SELECT_ORDER = [
  ["dLecture","One annual 3-hour compliance lecture for everyone"],
  ["pReport","Blame-free reporting campaign + one-click report-button training + exec reinforcement note"],
  ["pMfa","Password-manager rollout + credential-scanner check + MFA enrollment clinic"],
  ["pRemote","Remote-work micro-course + VPN-everywhere guidance + home-router hardening checklist"],
  ["dFirewall","Buy another firewall appliance"],
  ["pEngage","Gamified capture-the-flag day + tabletop exercise + monthly micro-refreshers"],
  ["dNames","Publish a leaderboard naming every campaign clicker"],
  ["pData","Data handling & disposal micro-course + clean-desk policy acknowledgment"]
];
/* ---- Remote-work builder (H8) — QA fix (R6): options interleaved so the first five are NOT all correct ---- */

const REMOTE_OPTS = [
  ["c1","VPN required on any network outside company sites",true],
  ["w2","Turn WPS on for convenience",false],
  ["c2","Company data only in company-managed apps",true],
  ["w1","Use the family PC for client manifests — it’s at home, so it’s private",false],
  ["c3","Privacy filter for work done in public places",true],
  ["w3","Share your work login with your spouse for household mail",false],
  ["c4","Home router: default admin password changed, WPA2/WPA3, firmware updated",true],
  ["w4","Disable the VPN when video calls lag",false],
  ["c5","Devices enrolled in MDM — remote wipe ready",true]
];
/* ---- Anomaly triage — QA fix (R6/R4): correct response index rotated across events (was 0 for all six) ---- */

const ANOM_CLASSES = ["Risky","Unexpected","Unintentional"];

const ANOMALIES = [
  { id:"n1", who:"Warehouse", text:"Plugged a USB stick found in the parking lot into a workshop terminal “just to see who lost it”.", cls:0,
    respOpts:["Fine — curiosity is good security","Should have handed it to Security unopened","Only wrong if files opened themselves"], correct:1,
    teach:"Risky — a deliberate act with a dangerous payoff. The planted-stick pattern is a known initial-access move; the response is don’t-touch, hand-it-in." },
  { id:"n2", who:"Finance", text:"03:12 — an MFA approval request appeared on the night manager’s phone. They were asleep, and had not tried to log in.", cls:1,
    respOpts:["Approve it — the system is safer if it stays quiet","Ignore silently — it will stop eventually","Deny the push and report it — someone may be using their password"], correct:2,
    teach:"Unexpected — out of baseline for user, time and action. It matches MFA push-bombing (T1621): the attacker already has the password and is fishing for an approval. Deny and report, immediately." },
  { id:"n3", who:"Payroll", text:"Autofill picked the wrong “Alex Morgan” — a payroll file with bank details went to the wrong client contact.", cls:2,
    respOpts:["Report it now — misdirected data needs the incident process to contain and notify","Email the recipient asking them to delete it and say nothing more","It’s fine — autocorrect happens"], correct:0,
    teach:"Unintentional — a mistake, not malice. The correct reflex is still immediate reporting: containment and (if required) notification run on a clock. Blame-free reporting is what makes people tell you." },
  { id:"n4", who:"Analytics", text:"A departing analyst exported 4.6 GB to a personal cloud account nine days before their resignation date — and bypassed the normal approval workflow to do it.", cls:1,
    respOpts:["Confront them at their desk and ask to see the files","Report through the insider-threat procedure — do not confront them yourself","Wait until after they leave, then review quietly"], correct:1,
    teach:"Unexpected — a sharp break from this user’s baseline, with insider-threat pattern markers (volume, timing, control bypass). The channel matters: trained handlers preserve evidence and keep the process safe; do not investigate solo." },
  { id:"n5", who:"Dispatch", text:"Shared the team VPN password in the group chat “to help a colleague connect from home”.", cls:0,
    respOpts:["No issue — sharing inside the team is normal","Delete the message and move on","Rotate the credential and coach on why shared credentials defeat accountability"], correct:2,
    teach:"Risky — deliberate policy violation with real consequence: shared credentials defeat attribution, outlive their usefulness, and land in chat archives. Rotate, then coach." },
  { id:"n6", who:"Warehouse", text:"A yard tablet auto-joined “FreeCargoWiFi” at a truck stop and stayed signed in to the dispatch portal for the whole shift.", cls:0,
    respOpts:["Disconnect, report, and use the VPN-everywhere rule next time","It’s fine — the portal has a lock icon","Only a problem if files were downloaded"], correct:0,
    teach:"Risky — untrusted networks plus an authenticated session is exactly the exposure remote-work guidance exists for. The lock icon says nothing about who is listening." }
];

const INSIDER_Q = {
  q:"The n4 export is real. As Program Lead, what is your FIRST move — and why?",
  actionOpts:[
    ["i1","Report to the security team through the insider-threat procedure now"],
    ["i2","Confront the analyst at their desk and ask to see the files"],
    ["i3","Wait until after they resign, then review the logs quietly"]
  ], actionCorrect:"i1",
  whyOpts:[
    ["j1","The volume + timing + control-bypass combination is a documented insider-threat pattern; speed through the correct channel preserves evidence and safety"],
    ["j2","A desk confrontation gets the fastest answers"],
    ["j3","It’s only data — it can wait"]
  ], whyCorrect:"j1" };

/* ---- Dashboard (M11 / H5) ---- */

const DASH = {
  depts:[
    ["Finance",41,3,22,8,12,9],["Dispatch",34,9,21,17,9,24],
    ["Warehouse",23,14,15,22,8,31],["Office/Admin",18,21,12,29,7,34]
  ],
  worstOpts:["Finance","Dispatch","Warehouse","Office/Admin"], worstCorrect:"Finance",
  kpiOpts:[
    ["k1","Report rate and median time-to-report — how fast people turn sightings into telemetry"],
    ["k2","Total clicks — lower is always better, and it is the only number that matters"],
    ["k3","Number of trainings delivered — more sessions, better program"],
    ["k4","Staff satisfaction score — happy staff click less"]
  ], kpiCorrect:"k1",
  verdictOpts:[
    ["v1","Working: clicks fell 28.0% → 8.8%, reports rose 12.2% → 25.7%, time-to-report 6h02m → 48m. Keep iterating — Finance still lags"],
    ["v2","Failed: people still click, so nothing has improved"],
    ["v3","Done: targets met, so the program can stop"],
    ["v4","Unknown: the metrics do not say anything about the program"]
  ], verdictCorrect:"v1"
};

const SPIKE = {
  part1:{q:"Which cell is the anomaly?",opts:["Dispatch, week of Oct 20 — clicks 29% with zero reports","Finance, Q1 — 41% clicks","Office/Admin, Q3 — 34% reports","Warehouse — 141 staff"],correct:"Dispatch, week of Oct 20 — clicks 29% with zero reports"},
  part2:{q:"What does it most likely represent?",opts:[
    ["s1","An unexpected anomaly consistent with an active vishing wave against dispatchers — treat as a possible real compromise, not a training failure"],
    ["s2","Dispatchers simply got worse at the test"],
    ["s3","A metric error — ignore it"]
  ],correct:"s1"},
  part3:{q:"Correct next action?",opts:[
    ["a1","Escalate: check mail-gateway and voice logs for the wave, brief dispatchers same-day, targeted coaching — and let IR decide if accounts are hit"],
    ["a2","Just rerun the annual training for everyone"],
    ["a3","Ignore it — next quarter’s numbers will fix it"],
    ["a4","Publish the dispatcher clicker names to motivate them"]
  ],correct:"a1"}
};

/* ---- Quiz (rebuilt in QA pass: rotated correct positions [R4], length-disciplined options [R5], topic tags for focus areas [R8]) ---- */

const QUIZ_MED = [
  { topic:"Why humans are targeted",
    q:"What is the PRIMARY reason attackers target people instead of systems?",
    opts:["Firewalls cannot reliably inspect modern encrypted traffic anymore","Strong technical controls make people the cheapest entry path","Malware infects devices faster than EDR can respond to it","Unpatched systems are breached more often than staff are fooled"],
    c:1, why:"Strong technical layers raise the cost of every other path, so attackers buy the cheapest one: a person’s decision. The distractors are real weaknesses — encrypted-traffic blindness, EDR races, unpatched systems — but each has a technical patch; the human decision is why Lesson 5.6 exists." },
  { topic:"Phishing variants",
    q:"Phishing vs. spear phishing — which statement is correct?",
    opts:["Spear phishing is mass untargeted mail sent at low cost","Spear phishing runs only through voice and SMS channels","Spear phishing is a spelling variant with no real difference","Spear phishing tailors lures with details about the target"],
    c:3, why:"The spear is the research: personalization raises success rates, which is exactly why Harborline’s dispatcher wave worked. Mass untargeted mail is plain phishing; the channel does not define spear phishing; and exam items treat the personalization difference as fundamental, not cosmetic." },
  { topic:"Voice phishing & MFA codes",
    q:"A voicemail asks a user to read back the 6-digit code “just sent to them”. This is:",
    opts:["Vishing: voice phishing hunting for your MFA code","A legitimate overnight callback from the real help desk","Standard MFA operating exactly the way it was designed","Smishing — phishing that arrived through an SMS channel"],
    c:0, why:"Codes are only sent when the USER requests them, and no real IT desk asks for codes back — one shared code defeats MFA as completely as a clicked link. A genuine callback never asks for secrets; MFA working as designed never needs a code read aloud; and the channel here is voice, not SMS." },
  { topic:"Data handling states",
    q:"Which is the correct handling of data AT REST?",
    opts:["Manifests left in open recycling count as proper disposal","Shared-drive files stay safe while the building stays locked","Payroll printouts retrieved from printer trays, locked away pending destruction","Data at rest matters only once a laptop goes missing"],
    c:2, why:"Data at rest is stored data on any medium — disk, paper, or USB — and handling rules (secure storage, clean desk, cross-cut destruction) apply to all of it. Recycling is not controlled destruction; building locks never replace access control; and at-rest exposure does not require a lost laptop." },
  { topic:"Tailgating vs piggybacking",
    q:"Tailgating vs. piggybacking — which statement is right?",
    opts:["Tailgating needs the badge holder’s consent to happen","Both require a stolen or cloned access badge first","Both are simply synonyms for shoulder surfing attacks","Tailgating lacks consent; piggybacking has the holder’s consent"],
    c:3, why:"Consent is the exam distinction: entering behind someone unknowingly is tailgating; being waved through knowingly is piggybacking. Both defeat the badge control, so the fix is people — badge discipline and polite refusal. Neither needs a stolen badge, and shoulder surfing is a visual risk, not a door one." },
  { topic:"Program metrics",
    q:"Which pair of metrics BEST proves an awareness program is working?",
    opts:["Report rate rising while time-to-report keeps falling","Total training hours delivered across the whole year","Zero clicks recorded during one single campaign","Count of awareness posters displayed around the yard"],
    c:0, why:"The program turns humans into sensors, so the value pair is report rate plus time-to-report — how many sightings, how fast. Hours and posters measure activity, not behavior change; and zero clicks in one campaign is a sample of one that can hide a fast, silent organization." }
];

const QUIZ_HARD = [
  { topic:"Report telemetry",
    q:"Report-button telemetry is most valuable because it lets the SOC:",
    opts:["Automatically firing any employee who submits a phish report","Correlating reports with gateway logs for campaign-wide quarantine","Replacing the mail gateway with user judgment completely","Proving compliance without using any other technical control"],
    c:1, why:"A “3+ user reports of the same sender/subject within 10 minutes → auto-quarantine + notify SOC” style rule (simplified example) is only possible because users report — the button makes every inbox a sensor. Firing reporters kills the sensor network; reports supplement the gateway rather than replace it; and no single control proves compliance." },
  { topic:"BEC verification",
    q:"The Finance Director gets the “CEO” wire request (artifact a4). Correct response sequence?",
    opts:["Reply asking for proof, then pay if it sounds right","Forward the email to the CEO’s visible address to check","Pay quickly because the board dislikes delayed payment requests","Verify via the directory number, then report and hold"],
    c:3, why:"Never reply into the attacker’s thread and never verify with a number the email provides — verification uses a previously known channel (directory, in person). The report preserves evidence for fraud and IR while finance freezes the payment. Forwarding tips the attacker off, and urgency is the tell, not a reason to pay." },
  { topic:"MFA fatigue",
    q:"03:12 MFA push, user asleep, no login attempt. Correct action and risk?",
    opts:["Deny the push and report it — password compromised","Approve it once and change the password afterwards","Ignore it silently until the pushes stop arriving","Uninstall the authenticator app to make the noise stop"],
    c:0, why:"MFA-fatigue attacks (T1621) flood approvals hoping for a tired tap — which means the attacker already HAS the password. Deny-and-report breaks the cycle and warns the SOC before the attacker pivots. Approving once hands over the session; silence invites more pushes; uninstalling removes your own protection." },
  { topic:"Removable-media bait",
    q:"A USB labeled “Q4_Layoffs_Plan” sits in the parking lot. Why hand it to Security unopened?",
    opts:["USB malware spreads through the air to nearby devices","Opening the stick is safe once autorun is disabled","Planted sticks are a documented delivery vector for attacks","The stick belongs to whoever lost it on site"],
    c:2, why:"The label is the lure and the plug-in is the attack — planted media is a documented initial-access delivery (T1091/T1200 patterns). Only Security can inspect it safely. Malware does not spread through the air from USB; autorun-off does not neutralize a crafted device; and lost property still goes through Security." },
  { topic:"Program metrics",
    q:"Your program shows: report rate 12.2% → 25.7%, time-to-report 6h02m → 48m, clicks 28.0% → 8.8%. Success statement?",
    opts:["Perfect — stop the program because every target is met","The human sensor network works; iterate toward Finance next","Failure — users still click, so nothing has improved here","Unknowable — these metrics say nothing about the program"],
    c:1, why:"All three KPIs moved the right way AND a specific gap remains (Finance: 38-point click-to-report gap). The correct reading is “working, next target named” — stopping loses the gains, click totals alone mislead, and these metrics say a great deal." },
  { topic:"Anomaly vs incident",
    q:"Dispatch: clicks spike to 29% with ZERO reports in one week, matching real vishing calls. Verdict?",
    opts:["Users got careless — rerun the annual training right away","A metric error — wait for next quarter’s clean numbers","Normal variance — awareness is working exactly as designed","Unexpected anomaly — check telemetry and escalate before retraining"],
    c:3, why:"A spike WITH silence during a real vishing wave looks like a live operation, not a simulation artifact — triage before training. Annual retraining is the slowest possible response; waiting out a possible incident is containment failure; and calling silence ‘working’ ignores exactly the reports that are missing." },
  { topic:"Program culture",
    q:"A manager proposes publishing the names of everyone who clicks simulated phishes. Best response?",
    opts:["Approve — public shame is the strongest motivator there is","Approve, but publish the names only once every month","Reject — punitive programs suppress the reporting you need","Reject — and cancel the simulations entirely as unfair"],
    c:2, why:"Fear teaches people to hide, not to report — Harborline’s own data (Finance 3% report rate, “I thought I’d get in trouble”) shows the cost of blame. Monthly shame is still shame. The evidence-backed design keeps the simulations and replaces punishment with coaching and a blame-free report path." }
];

/* ---- Hints ---- */

const HINTS = {
  M1:["Look at the four layers and ask: which one can be talked into approving the attacker’s request?","The gateway and EDR stop code, not decisions. Which layer makes decisions?","It’s the layer this whole lab is about — tap “The human layer”, then confirm."],
  M2:["Read the gateway note under the message: something is wrong with the sender domain.","harbor1ine ≠ harborline — a homoglyph, plus urgency and an off-domain landing page.","Type: “Phishing — credential harvest”. Action: report with the button, then delete — never click."],
  M3:["Which channel is this? It’s a text message, not email.","A company asking for a fee over SMS is the tell — Harborline never does that.","Type: “Smishing”. Action: report, then delete — don’t touch the link."],
  M4:["The caller wants something only you should ever use. What is it?","No real IT desk asks you to read back an MFA code — that code is the prize.","Type: “Vishing”. Action: never share a code, report it."],
  M5:["Check the sender’s domain character by character against the real one.","haborline is missing the “r”. Also note: secrecy, urgency, money.","Type: “Whaling / BEC”. Action: never reply — verify via the directory number, then report."],
  M6:["Two messages are actually fine. What makes mail trustworthy?","Real domain, real intranet host, ticketed change / an established vendor thread with no urgency.","Both are “Legitimate — verified safe” with “No action needed”. Learn what safe looks like."],
  M7:["Nine markers hide in the plan: creds, doors, media, paper, screens. Sweep every room.","Each pin needs THREE things: opened, correct risk tag, correct handling. The lobby stick is removable-media bait.","Open all markers, tag each (e.g. badge door = Physical access, USB = Removable media & cables) and choose matching handling."],
  M8:["Best practice: safe payload, data-driven audience, escalating difficulty, steady cadence, telemetry on, educational tone.","Which departments do the Q1 numbers say are most exposed? Finance and Dispatch.","Set: credential-harvest landing page · Finance+Dispatch · escalating · monthly randomized · report button ON · educational · metrics must include report rate AND time-to-report, never name-publishing."],
  M9:["Each gap maps to one intervention; three in the pool are traps.","The traps: annual lecture, naming clickers, another firewall — none fixes a behavior gap.","g1→password manager+scanner+MFA · g2→data handling module · g3→blame-free reporting campaign · g4→CTF/tabletop/refreshers · g5→remote-work module."],
  M10:["Three buckets: deliberately dangerous = risky; off-baseline = unexpected; accident = unintentional.","n1 USB = risky · n2 3 AM push = unexpected · n3 wrong recipient = unintentional.","n4 insider export = unexpected (+ insider procedure) · n5 shared password = risky · n6 truck-stop Wi-Fi = risky."],
  M11:["Which department has the biggest click-minus-report gap? Check the Q1 table.","A program’s value shows in reports coming in FASTER, not just fewer clicks.","Finance is worst; the KPI pair is report rate + time-to-report; the verdict is “working, keep iterating”."],
  M12:["Ask what a signature can and cannot do. It records expectations — it doesn’t create skill.","Two options are traps: “replaces training” and “guarantees compliance”.","Check the first three boxes, leave the two trap boxes empty; chain = report to security, preserve the original."],
  H1:["Six artifacts, two of them safe. Every near-miss or wrong tag fails this one.","Look-alike domains, channel mismatch, established threads — the evidence is in each gateway note.","Exact type AND exact action for all six; near-misses get rejected with a reason."],
  H2:["All nine markers, all three parts: opened + exact risk + exact handling.","Consent separates tailgating from piggybacking; bins and trays are data-handling failures.","Zero wrong tags — near-miss tags are rejected with the reason."],
  H3:["Four settings are sabotaged plus the metrics list. Fix all, then answer the “why” question.","Annual once-off, no report button, punitive tone, name-publishing — all four are anti-patterns.","Cadence monthly · report button ON · tone educational · metrics: add report rate + time-to-report, remove name-publishing · reason: telemetry drives report-rate and time-to-report."],
  H4:["Six steps from baseline to iterate. What must exist before training can mean anything?","You can’t measure improvement without a baseline, and you can’t sustain a program without sponsorship.","Order: baseline → sponsorship → policy acknowledgment → phased training → simulations → measure & iterate."],
  H5:["Three parts: find the cell, name the pattern, choose the action. The week matches real vishing calls.","A spike WITH silence (zero reports) is the dangerous combination — silence hides real clicks.","Dispatch / week of Oct 20 · unexpected anomaly, possible real compromise · escalate and check telemetry first."],
  H6:["Class all six, then answer the insider two-parter.","Deliberate-danger = risky; off-baseline = unexpected; accident = unintentional.","Classes: n1 risky · n2 unexpected · n3 unintentional · n4 unexpected · n5 risky · n6 risky. Insider: report through the procedure now; because volume+timing+bypass is the documented pattern."],
  H7:["Six attacks, one correct countermeasure each — and two decoys that fight the wrong war.","Match the ATTACK PATH: voice calls need callback rules; stuffing needs unique passwords; sticks need media policy.","CEO→drills+callback · vishing→never-share+callback · stuffing→manager+scanner · USB→media policy+device control · tailgating→badge briefs · smishing→short code+channel training."],
  H8:["Exactly five practices belong in the pack — three are obvious traps, two are subtle.","Subtle traps: WPS-on and “disable VPN when calls lag” — both trade security for convenience in exactly the wrong moment.","Pick: VPN everywhere · managed apps only · privacy filter · router hardening · MDM enrollment. Nothing else."],
  H9:["Five steps for the finance team, in order, after a whaling email lands.","The thread belongs to the attacker — nothing sent inside it is safe.","Do-not-reply → verify via directory number → report to security → alert finance to hold the payment → preserve the original email."]
};

const NUDGES = { H1:"One nudge: two artifacts are legitimate — real domain + ticketed change, and an established vendor thread. Everything else is an attack.", H2:"One nudge: consent separates tailgating from piggybacking — and every pin needs risk tag AND handling correct.", H3:"One nudge: the sabotage is annual-once, no report button, punitive tone, name-publishing. Fix those four plus the metrics list.", H4:"One nudge: baseline and sponsorship come first — you can’t train or simulate without either.", H5:"One nudge: a spike WITH zero reports is silence where there should be noise — that combination means escalate.", H6:"One nudge: n2, n4 are unexpected; n1, n5, n6 risky; n3 unintentional. Insider answer: procedure now, confront never.", H7:"One nudge: match the attack path, not the job title of the tool — a WAF fights web exploits, not wire fraud.", H8:"One nudge: WPS-on and VPN-off-under-lag are convenience traps. The five keepers all add a control, never remove one.", H9:"One nudge: verification uses the DIRECTORY number — never anything printed in the email." };

/* ---- Glossary ---- */

const GLOSSARY = [
  ["Phishing","Mass fraudulent messages that trick users into exposing credentials or running malicious content."],
  ["Spear phishing","Phishing tailored to a specific person or role using researched details."],
  ["Whaling / BEC","Phishing aimed at executives — or impersonating them — usually to move money."],
  ["Vishing","Voice phishing: a live call or voicemail performing the social engineering."],
  ["Smishing","Phishing over SMS or messaging apps."],
  ["Quishing","Phishing delivered via QR codes."],
  ["Pretexting","Inventing a believable scenario (“IT help desk”, “carrier update”) to extract information or actions."],
  ["Tailgating","Entering a secured door behind someone without their knowledge or consent."],
  ["Piggybacking","The same entry, but with the badge holder’s knowing (misplaced) consent."],
  ["Shoulder surfing","Observing a screen, keypad or document from a vantage point — including through a window."],
  ["Credential stuffing","Replaying breached username/password pairs against other services; enabled by password reuse."],
  ["MFA fatigue (push bombing)","Flooding a user with MFA approvals until one is accepted (T1621)."],
  ["Data states","In use (on screen / being processed), in transit (moving), at rest (stored) — each has handling rules."],
  ["UBA","User behavior analytics — flagging activity that deviates from a user’s baseline."],
  ["Malpractice liability","Legal exposure when required security practices are ignored; signed acknowledgments establish expectations."]
];

/* ---- Pillar metadata ---- */

const PILLARS = { P1:"Understand", P2:"Recognize", P3:"Detect", P4:"Mitigate" };

const OBJ_MED = [
  { id:"M1",  pillar:"P1", dock:"binder", text:"Tap the defense-stack layers in the Binder to find which one social engineering bypasses — then confirm it." },
  { id:"M2",  pillar:"P2", dock:"dock1",  text:"Classify WO-1 (payroll portal email): attack type + correct action." },
  { id:"M3",  pillar:"P2", dock:"dock1",  text:"Classify WO-2 (customs-fee text message): attack type + correct action." },
  { id:"M4",  pillar:"P2", dock:"dock1",  text:"Classify WO-3 (help-desk voicemail): attack type + correct action." },
  { id:"M5",  pillar:"P2", dock:"dock1",  text:"Classify WO-4 (CEO wire request): attack type + correct action." },
  { id:"M6",  pillar:"P2", dock:"dock1",  text:"WO-5 & WO-6 look suspicious — but both are legitimate. Mark them safe and say why." },
  { id:"M7",  pillar:"P2", dock:"dock2",  text:"Yard sweep: inspect the plan and correctly tag at least 6 of the 9 findings (risk + handling)." },
  { id:"M8",  pillar:"P4", dock:"dock3",  text:"Campaign Studio: configure the phishing simulation to best-practice settings and launch it." },
  { id:"M9",  pillar:"P4", dock:"dock4",  text:"Training Yard: match each of the 5 program gaps to the right intervention — leave the 3 traps unused." },
  { id:"M10", pillar:"P3", dock:"dock5",  text:"Metrics House: triage all 6 anomalous-behavior events as risky / unexpected / unintentional with the right response." },
  { id:"M11", pillar:"P3", dock:"dock5",  text:"Dashboard: name the worst department, the KPI pair that matters, and the verdict on the program." },
  { id:"M12", pillar:"P4", dock:"dock4",  text:"Policy Desk: pick what a signed acknowledgment does (and doesn’t) do, and choose the correct reporting chain." }
];

const OBJ_HARD = [
  { id:"H1", pillar:"P2", dock:"dock1", text:"Intake sweep: classify ALL six artifacts exactly — type AND action. Two are legitimate; near-misses are rejected with a reason." },
  { id:"H2", pillar:"P2", dock:"dock2", text:"Yard sweep: all 9 findings inspected, every risk tag and handling exact. Zero wrong tags." },
  { id:"H3", pillar:"P4", dock:"dock3", text:"Campaign critique: the pre-filled campaign carries 4 sabotaged settings and a poisoned metric list. Fix everything, then answer the “why”." },
  { id:"H4", pillar:"P4", dock:"dock4", text:"Rollout sequencer: put the 6 program-development steps in the correct order — exactly." },
  { id:"H5", pillar:"P3", dock:"dock5", text:"Spike analysis: locate the anomaly cell, name what it likely represents, and choose the correct escalation." },
  { id:"H6", pillar:"P3", dock:"dock5", text:"Anomaly triage + insider threat: class all 6 events exactly, then solve the insider two-parter." },
  { id:"H7", pillar:"P4", dock:"dock4", text:"Countermeasure matcher: pair all 6 attack patterns with the one correct countermeasure — decoys included." },
  { id:"H8", pillar:"P4", dock:"dock4", text:"Remote-work builder: select exactly the 5 practices that belong in the hybrid-work guidance pack." },
  { id:"H9", pillar:"P2", dock:"dock1", text:"BEC response protocol: order all 5 response steps for the whaling email — exactly." }
];

const BEC_STEPS=[["dont-reply","Do not reply to the message or use anything from the email thread"],["verify-dir","Verify the request with the CEO via the number in the company directory"],["report-sec","Report the message to security"],["alert-fin","Alert finance to hold any pending payment"],["preserve","Preserve the original email and headers for the fraud/IR teams"]];

const BEC_CORRECT=["dont-reply","verify-dir","report-sec","alert-fin","preserve"];

const SEQ_WHY={baseline:"Measurement is first: without a baseline, every later claim is an opinion.",sponsor:"Executive sponsorship funds the program and makes leadership visible — before asking staff to change.",policy:"The AUP/handbook acknowledgment sets the expectations the training will teach to.",train:"Training is phased by role so a dispatcher and an accountant each get what their evidence says they need.",sim:"Simulations come after the frame exists — testing people before teaching them only measures fear.",measure:"Measure & iterate is never “done”: quarterly review adjusts topics, cadence and difficulty."};
