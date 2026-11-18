'use strict';
/* =====================================================================
   DATA — all lab content: intake artifacts, register rows, hard-mode feed,
glossary, quiz banks, chart labels, pillar names, objective content.
No logic lives here; wording is carried over 1:1 from the original lab.
   ===================================================================== */

var CATS=['External','Internal','Legacy','Multiparty','IP theft','Software compliance'];

var OWNERS=['Director of Operations','Security Manager','Warehouse Ops Manager','CTO','Head of Procurement','IT Manager','Facilities Director','General Counsel'];

var RISKS=[
 {id:'R-101',name:'Ransomware on fleet dispatch platform',cat:'External',owner:'Director of Operations',
  asset:'Fleet dispatch platform',threat:'Ransomware crew actively targeting logistics firms',vuln:'Dispatch software is two patch levels behind; backups are never restore-tested',
  evI:'A successful hit would halt dispatch for days — 380 trucks idle',evL:'Sector-wide scanning of exposed dispatch servers is rising',
  cur:'Endpoint antivirus only; daily backups, never restore-tested',
  L:4,I:5,treat:'Mitigate',resL:2,resI:4,
  controls:[{t:'Vendor patch cadence for the dispatch stack',ok:1},{t:'Restore-tested, immutable backups',ok:1},{t:'Public bug bounty program',ok:0},{t:'Floodlighting at the HQ gate',ok:0},{t:'Replace all dispatch hardware at once',ok:0,note:'Prohibitively disruptive — patch the stack you have'}],
  review:'Quarterly + triggered by any ransomware event in the sector'},
 {id:'R-102',name:'Credential phishing of dispatch staff',cat:'External',owner:'Security Manager',
  asset:'Staff single-sign-on accounts',threat:'Fraud campaigns harvesting staff credentials',vuln:'Legacy vendor portal has no multi-factor authentication',
  evI:'Account takeover of dispatch roles; fraudulent bookings',evL:'Two phishing waves hit logistics firms this quarter',
  cur:'Mail filtering + annual awareness training (already in place)',
  L:4,I:3,treat:'Mitigate',resL:2,resI:2,
  controls:[{t:'Roll out MFA to the legacy portal',ok:1},{t:'Phishing-specific micro-training',ok:1},{t:'Rename the CEO',ok:0},{t:'Buy a bigger mail server',ok:0}],
  review:'Quarterly + triggered by any real credential phish'},
 {id:'R-103',name:'Warehouse WMS-7 server on end-of-life OS',cat:'Legacy',owner:'Warehouse Ops Manager',
  asset:'WMS-7 warehouse management server',threat:'Opportunistic attackers scanning for EOL systems',vuln:'OS ended vendor support — no security patches exist; flat network to office VLAN',
  evI:'WMS outage drops 4 warehouses to paper picking (BIA: MTD 4h)',evL:'Commodity exploits for this OS are public',
  cur:'Vendor end-of-support notice only — nothing technical',
  L:3,I:4,treat:'Mitigate',resL:2,resI:3,
  controls:[{t:'Network segmentation between WMS-7 and the office VLAN',ok:1},{t:'Virtual patching / IPS rules in front of WMS-7',ok:1},{t:'Vendor security patches',ok:0,impossible:'WMS-7 runs an OS the vendor no longer supports — no patches exist. This near-miss is the trap: segment and replace instead.'},{t:'Immediate full replacement of WMS-7',ok:0,note:'Replacement is approved for next fiscal year — not fundable now'},{t:'Offsite tape backup of the warehouse database',ok:0,note:'Good continuity practice, but it does not reduce THIS risk'},{t:'Web application firewall on the marketing site',ok:0,note:'Wrong asset entirely'}],
  review:'Quarterly + triggered by scan findings or replacement milestones'},
 {id:'R-104',name:'Route-optimization algorithm theft by departing staff',cat:'IP theft',owner:'CTO',
  asset:'Route-optimization algorithm source code',threat:'Departing engineer taking intellectual property to a competitor',vuln:'No egress controls on code repositories; weak offboarding checklist',
  evI:'Loss of the crown-jewel algorithm to a competitor',evL:'Two senior departures announced this quarter',
  cur:'None for code egress',
  L:2,I:4,treat:'Mitigate',resL:1,resI:4,
  controls:[{t:'Data loss prevention on repository exports',ok:1},{t:'Offboarding account revocation checklist',ok:1},{t:'Team-building retreat',ok:0},{t:'Faster Wi-Fi in the office',ok:0}],
  review:'Semiannual + triggered by any senior departure'},
 {id:'R-105',name:'Carrier booking portal dependency',cat:'Multiparty',owner:'Head of Procurement',
  asset:'Vendor-run carrier booking portal (SaaS)',threat:'Vendor outage or breach cutting off booking',vuln:'Single-vendor dependency; current contract has no penalties, indemnity or breach-notification clause',
  evI:'Bookings fall back to manual runbook (BIA: MTD 8h)',evL:'Vendor had two multi-hour outages last year',
  cur:'Verbal uptime promises only',
  L:3,I:3,treat:'Transfer',resL:3,resI:2,
  controls:[{t:'Negotiate SLA credits + indemnification + breach notification',ok:1},{t:'Document a manual booking runbook',ok:1},{t:'Blame the vendor in advance',ok:0},{t:'Paint the portal a different color',ok:0}],
  review:'Quarterly + triggered by vendor incident or contract renewal'},
 {id:'R-106',name:'Fleet GPS / driver telemetry sent unencrypted',cat:'External',owner:'Security Manager',
  asset:'Fleet telemetry platform (driver location data)',threat:'Interception or exposure of driver personal data',vuln:'Telemetry transmitted in cleartext to the vendor',
  evI:'Regulator fine and driver-trust damage (regulatory exposure)',evL:'Cleartext capture is trivial on shared links',
  cur:'None',
  L:3,I:3,treat:'Mitigate',resL:1,resI:3,
  controls:[{t:'TLS encryption for the telemetry uplink',ok:1},{t:'Key-rotation schedule for device certificates',ok:1},{t:'Paint the trucks camouflage',ok:0},{t:'Ask drivers to drive faster',ok:0}],
  review:'Quarterly + triggered by regulator guidance updates'},
 {id:'R-107',name:'Unlicensed imaging software on 40 workstations',cat:'Software compliance',owner:'IT Manager',
  asset:'40 warehouse workstations',threat:'Software vendor audit and legal action',vuln:'Unlicensed installs discovered on warehouse workstations',
  evI:'Fines, back-licensing costs, legal exposure',evL:'Vendor audits are announced industry-wide',
  cur:'None',
  L:2,I:3,treat:'Avoid',resL:1,resI:1,
  controls:[{t:'Remove the unlicensed software (eliminates the source)',ok:1},{t:'License governance audit so it stays gone',ok:1},{t:'Buy the auditors lunch',ok:0},{t:'Delete the audit email',ok:0}],
  review:'Quarterly + triggered by vendor audit letters'},
 {id:'R-108',name:'HQ data-room flood exposure',cat:'External',owner:'Facilities Director',
  asset:'On-prem HQ data room',threat:'River flooding reaching the port-adjacent HQ',vuln:'Single site; no offsite replication; no flood insurance',
  evI:'Loss of on-prem services and archive until water recedes',evL:'Two flood warnings in five years',
  cur:'None offsite',
  L:2,I:5,treat:'Transfer',resL:2,resI:2,
  controls:[{t:'Flood insurance rider',ok:1},{t:'Offsite backup replication',ok:1},{t:'Sandbags as the whole strategy',ok:0},{t:'A stronger umbrella',ok:0}],
  review:'Semiannual + triggered by flood warnings'}
];

var FEED=[
 {id:'HF-A',txt:'Regional carrier "Meridian Haulage" — our merger partner — confirmed a breach of their booking API last month. Our reseller accounts share the same portal.',cat:'Multiparty',L:3,I:4,kind:'file'},
 {id:'HF-B',txt:'A departing warehouse supervisor posted WMS-7 network diagrams to a personal cloud drive during notice period.',cat:'Internal',L:3,I:3,kind:'file'},
 {id:'HF-C',txt:'New-hire onboarding provisions every account with full admin rights by default; nobody revokes them.',cat:'Internal',L:4,I:3,kind:'file'},
 {id:'HF-D',txt:'Vulnerability scan re-flagged the WMS-7 end-of-life server (missing 214 patches).',kind:'dup',why:'Already in the register as R-103 — a scan re-flag is a triggered review of the existing row, never a duplicate entry.'},
 {id:'HF-E',txt:'Viral social post claims "HARBORLINE HACKED!!"; investigation closed: unfounded rumor.',kind:'herring',why:'Red herring — investigated and closed as unfounded. Filing rumors pollutes the register and destroys its credibility.'},
 {id:'HF-F',txt:'A field laptop was lost; full-disk encryption verified intact and remote wipe confirmed within the hour.',kind:'herring',why:'Red herring — controls already worked; residual is negligible. Not every event is a registerable risk.'},
 {id:'HF-G',txt:'Coffee machine in the HQ lobby is internet-connected. Nobody knows why.',kind:'noise'},
 {id:'HF-H',txt:'The quarterly patching window completed on schedule last Tuesday.',kind:'noise'},
 {id:'HF-I',txt:'Marketing wants a new hashtag for the fleet-refresh campaign.',kind:'noise'},
 {id:'HF-J',txt:'Canteen menu rotates to fish on Fridays. Crew morale: reported improved.',kind:'noise'}
];

var GLOSS=[
 ['Asset','Anything of value to the organization — systems, data, people, reputation — that risk is measured against.'],
 ['Threat','The actor or event that could cause harm: ransomware crews, floods, departing staff.'],
 ['Vulnerability','The weakness a threat can exploit: missing patches, no MFA, no clauses in a contract.'],
 ['Likelihood','How probable the risk event is, on a defined scale (here 1 Rare → 5 Almost certain).'],
 ['Impact','How much harm the event would cause — operational, financial, legal, reputational (1 Negligible → 5 Severe).'],
 ['Risk owner','The accountable stakeholder who signs exceptions and answers for the risk. Owning is not operating.'],
 ['Risk register','The central record of risks: description, owner, category, current mitigations, scores, treatment, review status.'],
 ['Inherent risk','The score before extra treatment — what the risk looks like with only current mitigations.'],
 ['Residual risk','What remains after treatment. Compare it to appetite; if it still breaches, an exception is required.'],
 ['Risk appetite','The amount and type of risk leadership is willing to retain. Harborline\u2019s board: residual ≤ 9.'],
 ['Risk tolerance','The acceptable deviation from appetite for a specific risk or area, before action is forced.'],
 ['Qualitative analysis','Scoring with ordered scales and zones — fast, board-friendly, no dollar values required.'],
 ['Quantitative analysis','Money-based analysis: SLE = AV × EF; ALE = SLE × ARO. Enables cost-benefit testing of controls.'],
 ['SLE','Single loss expectancy — money lost in one incident: asset value × exposure factor.'],
 ['ALE','Annualized loss expectancy — expected yearly loss: SLE × annualized rate of occurrence.'],
 ['ARO','Annualized rate of occurrence — expected incidents per year (0.5 = once every two years).'],
 ['BIA','Business impact analysis — predicts the consequence of disruption over time; sets maximum tolerable downtime that justifies impact scores.'],
 ['Compensating control','An alternative safeguard that reduces exposure where the preferred control is impossible (e.g., segmentation for an unpatchable system).']
];

var QUIZ_M=[
 {q:'The tower\u2019s whole scoring model rests on one relationship. Which is the Security+ way to express risk?',topic:'Risk expression (likelihood × impact)',
  o:['Impact minus likelihood','Likelihood times impact','Threat plus vulnerability','Asset value over exposure'],c:1,
  e:'Risk is scored as likelihood × impact — the only combination that ranks “probable and devastating” above “rare and trivial”. Subtraction and addition are not risk models (A, C), and asset value ÷ exposure factor inverts the SLE formula, which multiplies (D).'},
 {q:'The board asks: "What do we expect to LOSE in dollars per year on the dispatch platform?" Which analysis answers that?',topic:'Qualitative vs quantitative analysis',
  o:['Qualitative heat-map scoring','Categorizing risks into groups','Quantitative ALE analysis','A triggered register review'],c:2,
  e:'Only quantitative analysis answers dollar questions: SLE = AV × EF, then ALE = SLE × ARO. Heat-map scoring (A) and grouping (B) order risks without money values, and a triggered review (D) is a governance event, not an analysis type.'},
 {q:'Which sentence describes risk TOLERANCE (as opposed to appetite)?',topic:'Risk appetite vs tolerance',
  o:['The wiggle room around appetite for one risk or area','The total risk load the whole organization may carry','The premium an insurer quotes for the coming year','The count of rows the register may legally hold'],c:0,
  e:'Tolerance is the narrow, per-risk or per-area deviation from appetite before action is forced. Appetite (B) is organization-wide, an insurance premium (C) is a transfer cost, and nothing caps how many rows a register may hold (D).'},
 {q:'Harborline buys a flood insurance rider for the HQ data room. Which treatment signal is that?',topic:'Risk treatment: transfer',
  o:['Mitigate','Transfer','Avoid','Accept'],c:1,
  e:'Insurance shifts the financial consequence to another party — the definition of transfer. Mitigate would reduce the risk with controls, avoid would end the exposed activity, and accept would keep the loss on Harborline\u2019s books.'},
 {q:'R-105\u2019s row shows an inherent score of 9 and a residual of 6. What does 9 represent?',topic:'Inherent vs residual risk',
  o:['The score before any extra treatment is applied','The score the vendor publishes after their audit','The score remaining once treatment has landed','The appetite ceiling the board has approved'],c:0,
  e:'Inherent risk is the starting score with only the mitigations already in place. The score remaining after treatment is residual (C), a vendor\u2019s own score is an external claim (B), and the appetite ceiling is policy, not a score (D).'},
 {q:'Which statement about register reviews is correct?',topic:'Register reviews (scheduled & triggered)',
  o:['They run only after a major incident has forced one','They re-file every single risk as a new register row','They stop once every treatment has been chosen','They run on cadence and on triggers, re-scoring rows'],c:3,
  e:'Reviews are scheduled on a cadence AND triggered by events; they refresh scores, re-confirm owners and escalate appetite breaches. Waiting for incidents (A) misses the world changing, re-filing (B) creates duplicates, and stopping (C) lets the register rot.'}
];

var QUIZ_H=[
 {q:'Scenario: WMS-7 runs an OS the vendor stopped supporting. A teammate proposes "install vendor security patches" as the mitigation. You:',topic:'Treatment feasibility on EOL systems',
  o:['Approve — patching is always the first move','Transfer — make the vendor own the debt','Reject — no patch exists; compensate instead','Accept — EOL risk always sits within appetite'],c:2,
  e:'The vendor ships nothing for an end-of-life OS, so the proposed control is physically impossible. Transfer (B) cannot move a debt nobody can retire, and accept (D) is false here: the residual of 12 breaches the appetite of 9. Compensate now, replace on schedule.'},
 {q:'Scenario: a control costs $90,000/yr and reduces the records-DB ALE from $40,000 to $30,000. Decide:',topic:'Cost-benefit analysis (CBA)',
  o:['Reject it — it costs far more than it saves','Buy it — any ALE reduction justifies the spend','Buy it — and file an exception for the gap','Split it — fund half now, half next year'],c:0,
  e:'The control removes $10,000 of annual loss but costs $90,000 — a net of −$80,000 per year. “Any reduction justifies spend” (B) ignores the comparison, an exception (C) covers appetite breaches rather than bad economics, and splitting the cost (D) still loses money every year.'},
 {q:'Scenario: an exception request shows residual 12 (above appetite 9), no compensating control, no expiry date. Rule:',topic:'Exception completeness',
  o:['Approve — the owner is senior enough','Approve — but drop the residual score to 9','Approve — and send it straight to the vendor','Reject — incomplete: no control, no expiry'],c:3,
  e:'An exception is a formal, temporary acceptance of above-appetite risk; without compensating controls and a time-bound expiry it is an unmanaged hole. Seniority (A) is irrelevant, re-writing the score (B) is falsification, and the vendor (C) is not the approver.'},
 {q:'Scenario: the board agenda has room for one risk. R-A: inherent 20, no treatment yet, no owner assigned. R-B: residual 4, owned, treated. Which goes to the board, and why?',topic:'Escalation & oversight',
  o:['R-B — a treated, owned risk always boards first','R-A — the largest untreated, unowned exposure','Neither — both of them can wait until next quarter','Both — send the board a twelve-page appendix'],c:1,
  e:'Escalation follows exposure: R-A is inherent 20 with no owner and no treatment — the largest unmanaged position on the chart. R-B is within appetite and already governed (A), waiting (C) compounds the exposure, and a twelve-page appendix (D) hides the decision instead of making it.'},
 {q:'Scenario: a vulnerability scan flags a risk that is already in the register as R-103. The tower\u2019s correct move:',topic:'Register duplicates & scans',
  o:['File it again as R-109 for extra visibility','Delete R-103 and refile the scan output','Update R-103 and log a triggered review','Rename R-103 to R-103b for the auditors'],c:2,
  e:'One risk, one row: the scan is a trigger to review the existing entry. Re-filing (A) splits ownership and inflates the chart, deleting (B) loses history, and renaming (D) corrupts the stable identifiers auditors rely on.'},
 {q:'Scenario: the carrier portal vendor offers a contract with uptime promises but no credits, no indemnification, no breach-notification clause. You asked to transfer this risk. You:',topic:'Transfer clauses',
  o:['Sign it at once — a signature makes any transfer real','Sign it anyway — reputation beats paperwork here','Mitigate instead — and leave Procurement in the dark','Refuse it — until credits, indemnity and notice land'],c:3,
  e:'Without SLA credits, indemnification and breach notification, nothing has been transferred — promises alone move no dollars. Signing anyway (A, B) transfers optimism, and quietly mitigating (C) breaks the stakeholder involvement the objective demands.'},
 {q:'Scenario: news breaks of a phishing campaign specifically targeting logistics firms. The R-102 row\u2019s review is "quarterly". You:',topic:'Triggered reviews',
  o:['Wait — the quarterly review will catch it soon','Trigger a review of R-102 and related rows now','Raise the appetite to 15 and move on','Delete R-102 so the board will not worry'],c:1,
  e:'Threat intel re-rates likelihood immediately — that is exactly what triggered reviews are for. Waiting (A) steers by yesterday\u2019s register, raising appetite (C) falsifies the board\u2019s decision, and deleting R-102 (D) erases a live risk to make the chart look calm.'}
];

var LBL_L=['','Rare','Unlikely','Possible','Likely','Almost certain'];

var LBL_I=['','Negligible','Minor','Moderate','Major','Severe'];

var PILLARS=['','Understand','Recognize &amp; Analyze','Monitor &amp; Communicate','Treat &amp; Mitigate'];
