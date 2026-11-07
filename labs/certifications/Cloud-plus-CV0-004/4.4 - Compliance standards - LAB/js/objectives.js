'use strict';
/* objectives.js — the CHECK RESULTS validation bank: 12 Medium and 9 Hard
// objective configs with their per-objective validator closures (pure
// functions of the submitted answers — no DOM, no state access at load time).
 */
/* ================= MEDIUM objectives (12) ================= */
const OBJM=[
{id:'OBJ-M1',mode:'medium',pillar:'u',sec:'briefing',num:1,
 title:'File the standards under their issuers',
 prompt:'Click a standard, then click the organization that issues it. Two chips are distractors that match no folder — leave them unfiled.',
 win:'Knowing the issuer tells you the artifact family you will be asked for: PCI SSC\u2019s ecosystem produces AOC/ROC, AICPA produces SOC reports (via CPA firms), ISO/IEC certificates come from accredited certification bodies. Defender habit: when a request names a standard, answer with that issuer\u2019s artifact.',
 look:[{t:'Manual §2',a:'m-pci'},{t:'Manual §7',a:'m-adj'}],
 hints:['Manual sections 2, 3 and 4 each name the issuer in the first sentences.',
        'PCI DSS → PCI Security Standards Council (founded by the card brands). SOC 2 → AICPA (licensed CPA firms perform it). ISO 27001 → ISO/IEC, certificates issued by accredited certification bodies.',
        'GDPR and HIPAA are laws — they have no folder in this room. Leave both unfiled.'],
 widget:{kind:'assign',key:'m1',
  chips:[{id:'pci',t:'PCI DSS',s:'payment account data protection'},{id:'soc2',t:'SOC 2',s:'trust services attestation'},{id:'iso',t:'ISO/IEC 27001:2022',s:'ISMS certification'},{id:'gdpr',t:'GDPR',s:'EU privacy law'},{id:'hipaa',t:'HIPAA',s:'US health data law'}],
  slots:[{id:'ssc',t:'PCI Security Standards Council',s:'created by the major card brands'},{id:'aicpa',t:'AICPA',s:'reports issued by licensed CPA firms'},{id:'iso',t:'ISO/IEC + accredited certification bodies',s:'3-year certificate cycle'}]},
 validate:(e)=>{const v=e.m1||{};const need={pci:'ssc',soc2:'aicpa',iso:'iso'};const bad=Object.keys(need).filter(k=>v[k]!==need[k]);
  if(bad.length===0)return{ok:true};
  return{ok:false,msg:'Not yet. The issuers matter because each produces different artifacts: PCI DSS comes from the PCI Security Standards Council (card brands), SOC 2 is an AICPA attestation performed by CPA firms, and ISO 27001 certificates are issued by accredited certification bodies. GDPR and HIPAA are laws with no issuer folder here. Review Manual §2–4 and refile.'};}},

{id:'OBJ-M2',mode:'medium',pillar:'u',sec:'soc2',num:2,
 title:'Pick the right SOC 2 answer for the customer',
 prompt:'Two quick decisions on the SOC 2 desk: which criteria category is always included, and which report type Grandview\u2019s 12-month request calls for.',
 win:'Security (the CC-series common criteria) is mandatory; Availability, Processing Integrity, Confidentiality and Privacy are optional add-ons. \u201cOperated over the past 12 months\u201d means operating effectiveness over a period — that is exactly what a Type II adds over a Type I. Defender habit: confirm the type and period before promising a report to a customer.',
 look:[{t:'Manual §3',a:'m-soc2'},{t:'Grandview email',a:'emails'}],
 hints:['Manual §3 covers the TSC categories and the two report types.',
        'Security is the mandatory category. \u201cOperated over the past 12 months\u201d = effectiveness over a period of time.',
        'Type I = design at a point in time. Type II = design + operating effectiveness over the period. Grandview wants Type II.'],
 widget:{kind:'choice',key:'m2',rows:[
  {id:'r1',q:'Which Trust Services Criteria category must every SOC 2 include?',opts:[{id:'sec',t:'Security'},{id:'ava',t:'Availability'},{id:'prv',t:'Privacy'},{id:'pin',t:'Processing Integrity'}]},
  {id:'r2',q:'Grandview Retail wants assurance your controls operated over the past 12 months. Which report?',opts:[{id:'t1',t:'SOC 2 Type I'},{id:'t2',t:'SOC 2 Type II'},{id:'s3',t:'SOC 3'},{id:'isoc',t:'ISO 27001 Stage 1 summary'}]}]},
 validate:(e)=>{const r1=(e['m2.r1']),r2=(e['m2.r2']);
  if(r1!=='sec'||r2!=='t2'){let m='Not yet. ';
   if(r1!=='sec')m+='Security is the one mandatory TSC category — the other four ride along only as committed. ';
   if(r2!=='t2')m+='A request for effectiveness over 12 months is a Type II (Type I is a point-in-time design opinion). ';
   return{ok:false,msg:m+'Manual §3 has the full comparison.'};}
  return{ok:true};}},

{id:'OBJ-M3',mode:'medium',pillar:'u',sec:'iso',num:3,
 title:'Sequence the ISO 27001 certification journey',
 prompt:'Put the certification journey in the order it actually happens — from first self-measurement to a renewed certificate.',
 win:'The certification body visits twice (Stage 1 readiness, Stage 2 implementation), the certificate then runs 3 years with an annual surveillance audit, and recertification happens before expiry. Defender habit: work back from the Stage 1 date on the calendar — the gap assessment and internal audit must fit before it.',
 look:[{t:'Manual §4',a:'m-iso'},{t:'Audit programme record',a:'internal'}],
 hints:['Manual §4 lists the certification path in order.',
        'First measure yourself (gap assessment), then the accredited certification body visits twice: readiness, then implementation.',
        'After the certificate: surveillance audits each year, recertification before the 3 years expire.'],
 widget:{kind:'order',key:'m3',items:[
  {id:'gap',t:'Gap assessment',s:'measure the ISMS against the standard'},
  {id:'s1',t:'Stage 1 audit',s:'documentation & readiness — accredited CB'},
  {id:'s2',t:'Stage 2 audit',s:'implementation — evidence sampling'},
  {id:'cert',t:'Certificate issued',s:'valid 3 years'},
  {id:'sur',t:'Surveillance audits',s:'annually, by the CB'},
  {id:'rec',t:'Recertification',s:'before the 3 years expire'}]},
 validate:(e)=>{const o=e.m3;
  if(!o||o.length<6)return{ok:false,msg:'Use the arrows to order all six steps.'};
  const ok=o.join()===['gap','s1','s2','cert','sur','rec'].join();
  if(ok)return{ok:true};
  return{ok:false,msg:'Not the real order. The journey runs: gap assessment → Stage 1 (documents & readiness) → Stage 2 (implementation, sampled) → certificate → annual surveillance → recertification before the 3-year expiry. (Your internal audit and management review also run before Stage 2 — see the ISMS record — but they are not steps on this certificate timeline.)'};}},

{id:'OBJ-M4',mode:'medium',pillar:'u',sec:'pci',num:4,
 title:'Map all 12 PCI requirements to their six goals',
 prompt:'Click a requirement chip, then the goal folder it belongs to. Slots can hold more than one chip — the goals table in Manual §2 is your map.',
 win:'This structure is how PCI assessors think: networks (1–2), account data (3–4), vulnerabilities (5–6), access (7–8–9), monitoring & testing (10–11), policy (12). When an auditor asks for evidence \u201cagainst Req 10\u201d you will know instantly it is logging, not encryption.',
 look:[{t:'Manual §2 goals table',a:'m-pci'}],
 hints:['Manual §2 contains the goals table with every requirement.',
        'Networks take Reqs 1–2; account data 3–4; vulnerabilities 5–6.',
        'Access control is 7–8–9 (including physical); monitor & test is 10–11; policy stands alone as 12.'],
 widget:{kind:'assign',key:'m4',
  chips:[{id:'r1',t:'Req 1',s:'Network security controls'},{id:'r2',t:'Req 2',s:'Secure configurations'},{id:'r3',t:'Req 3',s:'Protect stored account data'},{id:'r4',t:'Req 4',s:'Encrypt transmission'},{id:'r5',t:'Req 5',s:'Malware protection'},{id:'r6',t:'Req 6',s:'Secure systems & software'},{id:'r7',t:'Req 7',s:'Business need-to-know'},{id:'r8',t:'Req 8',s:'Identify & authenticate (MFA)'},{id:'r9',t:'Req 9',s:'Physical access'},{id:'r10',t:'Req 10',s:'Log & monitor'},{id:'r11',t:'Req 11',s:'Test security regularly'},{id:'r12',t:'Req 12',s:'Security policy & program'}],
  slots:[{id:'net',t:'Build & maintain secure networks and systems'},{id:'data',t:'Protect account data'},{id:'vuln',t:'Vulnerability management'},{id:'access',t:'Strong access control'},{id:'mon',t:'Monitor and test networks'},{id:'pol',t:'Information security policy'}]},
 validate:(e)=>{const m=e.m4||{};const need={r1:'net',r2:'net',r3:'data',r4:'data',r5:'vuln',r6:'vuln',r7:'access',r8:'access',r9:'access',r10:'mon',r11:'mon',r12:'pol'};
  const bad=Object.keys(need).filter(k=>m[k]!==need[k]);
  if(bad.length===0)return{ok:true};
  if(bad.length<=2){const n=bad.map(k=>'Req '+k.slice(1)).join(' and ');return{ok:false,msg:'Close — check '+n+'. Remember: 7–8–9 all live under access control (physical access included), and 10–11 are the monitor-and-test pair.'};}
  return{ok:false,msg:'Several requirements landed in the wrong goal. The map: 1–2 networks · 3–4 account data · 5–6 vulnerabilities · 7–8–9 access control · 10–11 monitor & test · 12 policy. Compare with the goals table in Manual §2.'};}},

{id:'OBJ-M5',mode:'medium',pillar:'r',sec:'pci',num:5,
 title:'Scope the CDE: in or out?',
 prompt:'Stamp each asset IN CDE or OUT. Read every note — scope follows both cardholder data and network connectivity.',
 win:'You scoped the CDE like an assessor: data AND connectivity decide. The CI runner and the legacy test VM carry routes into the CDE, so they are in scope despite their labels; the log sink collects CDE logs so it is in scope too. Defender habit: keep the inventory, data-flow map and firewall rules in sync — scope decisions expire when any of them changes.',
 look:[{t:'Asset inventory',a:'assets'},{t:'Firewall rules',a:'rules'}],
 hints:['Scope follows cardholder data AND connectivity — read each row\u2019s note against the inventory and the rules extract.',
        'Anything with a route into the CDE is in scope: the CI runner (deploy route) and the legacy test VM (nightly sync, R6). The log sink receives CDE logs. The NAS, marketing systems and HR SaaS have neither data nor routes.',
        'IN: api-gw, token vault, paydb, jump host, logsink, bastion firewall, CI runner, legacy test VM. OUT: corporate NAS, marketing site, marketing DB, HR SaaS.'],
 widget:{kind:'stamp',key:'m5',okLabel:'IN CDE',gapLabel:'OUT',rows:[
  {id:'api',t:'sp-api-gw-01',s:'Public checkout; PAN decrypted in memory'},
  {id:'vault',t:'sp-token-vault-01',s:'Stores PAN→token mapping'},
  {id:'paydb',t:'sp-paydb-01',s:'Stores encrypted PAN (legacy table)'},
  {id:'jump',t:'sp-jump-01',s:'Approved administration path into the CDE'},
  {id:'logsink',t:'sp-logsink-01',s:'Receives syslog from all CDE components'},
  {id:'bastion',t:'sp-bastion-fw-01',s:'Enforces CDE segmentation'},
  {id:'ci',t:'sp-ci-runner-03',s:'Deploy route into the vault (R-deploy)'},
  {id:'legacy',t:'legacy-test-vm-07',s:'Nightly tcp/5432 sync into paydb (rule R6)'},
  {id:'nas',t:'corp-intra-nas',s:'HR files; no payment data; no routes'},
  {id:'wp',t:'mktg-wordpress-01',s:'Public site, no CHD (defaced last month — closed)'},
  {id:'mktgdb',t:'sp-mktg-db-01',s:'Web analytics only'},
  {id:'hr',t:'hr-payroll-saas',s:'Third-party SaaS, separate tenant'}]},
 validate:(e)=>{const v=e.m5||{};const need={api:'ok',vault:'ok',paydb:'ok',jump:'ok',logsink:'ok',bastion:'ok',ci:'ok',legacy:'ok',nas:'gap',wp:'gap',mktgdb:'gap',hr:'gap'};
  const bad=Object.keys(need).filter(k=>v[k]!==need[k]);
  if(bad.length===0)return{ok:true};
  let m='Not the assessor\u2019s answer. ';
  if(bad.includes('legacy'))m+='legacy-test-vm-07 has a live route into the payment DB (R6) — connectivity puts it in scope whatever the \u201ctest\u201d label says. ';
  if(bad.includes('logsink'))m+='The log sink ingests CDE logs, so it processes CDE material — in scope. ';
  if(bad.some(k=>['nas','wp','mktgdb','hr'].includes(k)))m+='The NAS, marketing site, marketing DB and HR SaaS hold no account data and have no route into the CDE — out of scope (the WordPress defacement was a security incident, not a scope fact). ';
  if(bad.some(k=>['api','vault','paydb','jump','bastion','ci'].includes(k)))m+='The gateway, vault, payment DB, jump host, CDE firewall and CI runner all touch account data or the CDE — in scope. ';
  return{ok:false,msg:m+'Scope = data + connectivity.'};}},

{id:'OBJ-M6',mode:'medium',pillar:'r',sec:'soc2',num:6,
 title:'Sort the inbox: which desk handles each request?',
 prompt:'Click an email, then the desk that owns it. The named artifact in each email is the giveaway.',
 win:'Requests map to frameworks by their artifact: an acquirer demanding an AOC is PCI DSS; \u201coperated over the past 12 months\u201d is SOC 2 Type II; ISMS-based due diligence is ISO 27001. Defender habit: answer each request with its own artifact — a certificate does not satisfy a scan request, and a report does not replace a certificate.',
 look:[{t:'Intake emails',a:'emails'},{t:'Manual §7 table',a:'m-adj'}],
 hints:['Manual §7 has the discriminator table: ask → framework → artifact.',
        'Bank + AOC = PCI DSS. \u201cOperated over the past 12 months\u201d + report = SOC 2. \u201cISMS-based due diligence\u201d + certificate = ISO 27001.',
        'Each email literally names its artifact: AOC (PCI), SOC 2 Type II, ISO/IEC 27001 certificate + SoA.'],
 widget:{kind:'assign',key:'m6',
  chips:[{id:'ebank',t:'First Meridian Bank',s:'\u201cAOC due Nov 15\u201d — acquirer program rules'},{id:'egv',t:'Grandview Retail',s:'\u201cSOC 2 report, we expect Type II\u201d'},{id:'ehel',t:'Helvetia Retail Group',s:'\u201cISO/IEC 27001 certificate + SoA scope\u201d'}],
  slots:[{id:'pci',t:'PCI DSS desk',s:'acquirer & card-brand validation'},{id:'soc2',t:'SOC 2 desk',s:'customer vendor reviews'},{id:'iso',t:'ISO 27001 desk',s:'certification & partner due diligence'}]},
 validate:(e)=>{const v=e.m6||{};
  if(v.ebank==='pci'&&v.egv==='soc2'&&v.ehel==='iso')return{ok:true};
  return{ok:false,msg:'Re-sort by artifact: the bank\u2019s program rules demand an AOC — that is PCI DSS. Grandview names the SOC 2 report (Type II). Helvetia names the ISO/IEC 27001 certificate and SoA. Each framework produces exactly the artifact its requester names.'};}},

{id:'OBJ-M7',mode:'medium',pillar:'r',sec:'soc2',num:7,
 title:'Read the CSP\u2019s report and bridge letter correctly',
 prompt:'Three answers from the CumuloCloud artifacts: what period the Type II covers, what the bridge letter covers, and who wrote it.',
 win:'The CSP\u2019s report covers Jan–Dec 2024; the bridge letter covers Jan–Sep 2025 and is written by CumuloCloud\u2019s management — it is not an auditor opinion. Defender habit: when you inherit a provider report, always check period end and request a bridge letter to your own contract date.',
 look:[{t:'CumuloCloud SOC 2',a:'cspsoc2'},{t:'Bridge letter',a:'bridge'}],
 hints:['Read the two CumuloCloud artifacts: the Type II excerpt shows its period; the bridge letter states what it covers and who prepared it.',
        'CSP report period: Jan 1 – Dec 31, 2024. Bridge letter: Jan 1 – Sep 30, 2025 — the gap between report end and the contract date.',
        'A bridge letter is management\u2019s statement about the period after the report — never an auditor opinion, never issued by the CPA firm.'],
 widget:{kind:'choice',key:'m7',rows:[
  {id:'r1',q:'The CumuloCloud SOC 2 Type II covers which period?',opts:[{id:'jd24',t:'Jan 1 – Dec 31, 2024'},{id:'os25',t:'Oct 1, 2024 – Sep 30, 2025'},{id:'l12',t:'The last 12 months from today'},{id:'pit',t:'A point in time on Dec 31, 2024'}]},
  {id:'r2',q:'What does the bridge letter cover?',opts:[{id:'full',t:'A restatement of the full 2024 reporting period'},{id:'next',t:'The next reporting period, issued in advance'},{id:'gap',t:'The gap since the report ended (2025)'},{id:'inc',t:'Only the two minor incidents, already disclosed'}]},
  {id:'r3',q:'Who writes a bridge letter?',opts:[{id:'cpa',t:'The CPA firm that issued the report'},{id:'mgmt',t:'The service organization\u2019s management, not the auditor'},{id:'ssc',t:'The PCI Security Standards Council'},{id:'cust',t:'The customer\u2019s internal auditors'}]}]},
 validate:(e)=>{const r1=e['m7.r1'],r2=e['m7.r2'],r3=e['m7.r3'];
  if(r1==='jd24'&&r2==='gap'&&r3==='mgmt')return{ok:true};
  let m='Not yet. ';
  if(r1!=='jd24')m+='The CumuloCloud Type II period is Jan 1 – Dec 31, 2024 (StratusPay\u2019s own report is the Oct 2024–Sep 2025 one). ';
  if(r2!=='gap')m+='The bridge letter explicitly covers Jan 1 – Sep 30, 2025 — the gap between the report period end and the contract date. ';
  if(r3!=='mgmt')m+='Bridge letters are written by the service organization\u2019s management — they are not auditor opinions. ';
  return{ok:false,msg:m+'Read both CumuloCloud artifacts again.'};}},

{id:'OBJ-M8',mode:'medium',pillar:'d',sec:'pci',num:8,
 title:'Gap analysis: stamp the six controls',
 prompt:'Each row cites its evidence on this desk. Stamp COMPLIANT where the evidence holds, GAP where it does not.',
 win:'Three controls held (encryption, ASV, access review) and three failed on evidence (vault logging off since Sep 14, R2 any-source into the payment DB, R4 marketing → vault). Defender habit: gap analysis compares each requirement against current, system-generated evidence — never against the policy document\u2019s good intentions.',
 look:[{t:'Vault log',a:'vaultlog'},{t:'Firewall rules',a:'rules'},{t:'Storage export',a:'storage'},{t:'ASV summary',a:'asv'}],
 hints:['Every row cites an artifact: storage export, vault log, firewall rules, ASV summary, access review.',
        'Compliant: encryption (SSE-AES256 ON), Q3 ASV PASS, signed access review. Gaps: the vault\u2019s syslog forwarding is OFF since Sep 14; R2 allows ANY source to tcp/1521 on the payment DB; R4 lets the marketing subnet reach the vault.',
        'Stamp GAP for k2, k3 and k6 — each control exists on paper but fails on the evidence in front of you.'],
 widget:{kind:'stamp',key:'m8',okLabel:'Compliant',gapLabel:'GAP',rows:[
  {id:'k1',t:'Stored account data encrypted at rest',s:'bucket cumulo-bkt-paydata shows SSE-AES256 (PCI Req 3)'},
  {id:'k2',t:'Vault audit logging active',s:'check the vault log extract (PCI Req 10)'},
  {id:'k3',t:'Payment DB reachability restricted',s:'rule R2: allow tcp/1521 ANY → sp-paydb-01 (PCI Req 1)'},
  {id:'k4',t:'Quarterly external scanning done',s:'Q3 ASV scan of CDE ranges — status PASS (PCI Req 11)'},
  {id:'k5',t:'Quarterly access review completed',s:'signed 2025-09-30, all CDE accounts listed (PCI Req 7/8)'},
  {id:'k6',t:'No unneeded routes into the vault',s:'rule R4: allow tcp/443 mktg-subnet → sp-token-vault-01 (PCI Req 1)'}]},
 validate:(e)=>{const v=e.m8||{};const need={k1:'ok',k2:'gap',k3:'gap',k4:'ok',k5:'ok',k6:'gap'};
  const bad=Object.keys(need).filter(k=>v[k]!==need[k]);
  if(bad.length===0)return{ok:true};
  let m='Not the assessor\u2019s stamps. ';
  if(bad.includes('k2'))m+='The vault log shows syslog.forward=false since 2025-09-14 — logging is a GAP. ';
  if(bad.includes('k3'))m+='R2 allows tcp/1521 from ANY into the payment DB — a GAP against least privilege. ';
  if(bad.includes('k6'))m+='R4 gives the marketing subnet a route into the tokenization vault — a GAP. ';
  if(bad.some(k=>['k1','k4','k5'].includes(k)))m+='Encryption (SSE-AES256 ON), the Q3 ASV PASS and the signed access review are genuinely COMPLIANT. ';
  return{ok:false,msg:m+'Judge each control on its evidence, not its label.'};}},

{id:'OBJ-M9',mode:'medium',pillar:'d',sec:'pci',num:9,
 title:'Log forensics: what broke, which requirement, when?',
 prompt:'Three answers from the vault audit-log extract: the failure, the PCI requirement it violates, and the exact moment it changed.',
 win:'Audit logging on the vault was switched off by k.osei at 2025-09-14 02:11:47Z — that violates PCI Req 10 (log and monitor all access), the requirement that makes investigations possible. Defender habit: alert on configuration changes to logging itself; a silent vault is an investigation blind spot, and \u201ctroubleshooting\u201d notes do not restore evidence.',
 look:[{t:'Vault audit log',a:'vaultlog'}],
 hints:['The vault log extract literally shows the configuration change.',
        'cfg.change: syslog.forward=false by k.osei at 2025-09-14 02:11:47Z. Logging maps to PCI Req 10.',
        'Req 10 exists so that access to stored account data can always be reconstructed — which is why the logging toggle itself must be monitored.'],
 widget:{kind:'choice',key:'m9',rows:[
  {id:'r1',q:'What actually failed on the vault?',opts:[{id:'enc',t:'Encryption was removed'},{id:'mfa',t:'An admin bypassed MFA'},{id:'log',t:'Audit logging was disabled'},{id:'fw',t:'A new firewall rule appeared'}]},
  {id:'r2',q:'Which PCI requirement does that violate?',opts:[{id:'q1',t:'Req 1 — network and security controls'},{id:'q3',t:'Req 3 — protect stored account data'},{id:'q8',t:'Req 8 — identify and authenticate'},{id:'q10',t:'Req 10 — log and monitor access'}]},
  {id:'r3',q:'When did the state change?',opts:[{id:'sep14',t:'2025-09-14 02:11:47Z'},{id:'sep30',t:'2025-09-30 (access review date)'},{id:'oct6',t:'2025-10-06 (gap discovery)'},{id:'unk',t:'The log does not say'}]}]},
 validate:(e)=>{const r1=e['m9.r1'],r2=e['m9.r2'],r3=e['m9.r3'];
  if(r1==='log'&&r2==='q10'&&r3==='sep14')return{ok:true};
  let m='Not yet. ';
  if(r1!=='log')m+='The log shows cfg.change syslog.forward=false — logging was disabled, nothing else changed. ';
  if(r2!=='q10')m+='Logging and monitoring all access is PCI Req 10. ';
  if(r3!=='sep14')m+='The change happened at 2025-09-14 02:11:47Z (the note about \u201cdisk pressure\u201d follows seconds later). ';
  return{ok:false,msg:m};}},

{id:'OBJ-M10',mode:'medium',pillar:'d',sec:'briefing',num:10,
 title:'Evidence quality: pick the artifact an auditor accepts',
 prompt:'Four typical auditor asks. For each, pick the artifact that actually proves it — weak evidence is how clean-looking programs fail audits.',
 win:'Auditors rank system-generated, current evidence above screenshots, statements and marketing: config exports, scan reports, log exports, and for operating effectiveness a Type II report. Defender habit: build the evidence locker before the request arrives, and re-date it continuously — a 2023 artifact proves 2023.',
 look:[{t:'Manual §6 playbook',a:'m-audit'}],
 hints:['Manual §6 ranks evidence: system-generated and current beats screenshots and statements.',
        'Config export, ASV report, vault log, Type II report — each directly records the control operating.',
        'A Type I is a point-in-time design opinion; it cannot show a year of operating effectiveness.'],
 widget:{kind:'choice',key:'m10',rows:[
  {id:'r1',q:'Prove stored account data is encrypted:',opts:[{id:'shot',t:'A dashboard screenshot from the storage console'},{id:'cfg',t:'A configuration export plus key-management records'},{id:'pol',t:'A policy sentence asserting all data is encrypted'},{id:'deck',t:'A slide from the latest sales deck'}]},
  {id:'r2',q:'Prove quarterly external scanning of the CDE:',opts:[{id:'pen',t:'The marketing site\u2019s most recent penetration test report'},{id:'inv',t:'The ASV vendor\u2019s quarterly invoice'},{id:'fwc',t:'The firewall configuration export'},{id:'asv',t:'The Q3 ASV scan report, status PASS'}]},
  {id:'r3',q:'Show who accessed the tokenization vault last week:',opts:[{id:'vlog',t:'Vault audit-log export from sp-logsink-01'},{id:'rev',t:'The signed quarterly access review'},{id:'idp',t:'Identity-provider license count'},{id:'slg',t:'A screenshot of the SIEM logo'}]},
  {id:'r4',q:'Show operating effectiveness of controls over the past 12 months:',opts:[{id:'t1',t:'SOC 2 Type I report'},{id:'cue',t:'The CUEC list from the CSP report'},{id:'t2',t:'SOC 2 Type II report'},{id:'isoc',t:'ISO 27001 certificate'}]}]},
 validate:(e)=>{const g=(k)=>e['m10.'+k];
  if(g('r1')==='cfg'&&g('r2')==='asv'&&g('r3')==='vlog'&&g('r4')==='t2')return{ok:true};
  let m='Not yet. ';
  if(g('r1')!=='cfg')m+='Encryption is proven by a configuration export plus key-management records — screenshots and policy sentences prove intent, not state. ';
  if(g('r2')!=='asv')m+='Quarterly scanning is proven by the ASV scan report (the invoice proves you paid, not scanned). ';
  if(g('r3')!=='vlog')m+='Who accessed the vault is an event question — only the audit log answers it; the access review lists accounts, not access events. ';
  if(g('r4')!=='t2')m+='Operating effectiveness over 12 months is exactly the Type II opinion. ';
  return{ok:false,msg:m};}},

{id:'OBJ-M11',mode:'medium',pillar:'m',sec:'pci',num:11,
 title:'File the fixes: one remediation per gap',
 prompt:'The four items your gap analysis flagged. Choose the defensible fix for each — the fix must close the control AND produce evidence that it works.',
 win:'Fix the control, then capture proof: logging re-enabled and verified, R2 narrowed to the app subnet, R4 removed (marketing has no business reaching the vault), and no CDE access for k.osei until MFA is real. Defender habit: every remediation ships with a verification artifact — the assessor will ask for exactly that.',
 look:[{t:'Firewall rules',a:'rules'},{t:'Access review',a:'access'}],
 hints:['Fix the control, then capture proof it works — Manual §6.',
        'Logging: re-enable + verify events arrive + alert on changes. R2: least privilege by subnet. R4: marketing → vault has no business need, remove it. k.osei: no CDE access without MFA.',
        'Two answers are acceptable for k.osei (re-enroll MFA, or suspend the account until it is done). The others have exactly one defensible fix.'],
 widget:{kind:'choice',key:'m11',rows:[
  {id:'r1',q:'Gap: vault syslog forwarding disabled since Sep 14',opts:[{id:'siem',t:'Buy a SIEM platform first, decide logging later'},{id:'purge',t:'Purge the affected log window and move on'},{id:'fixlog',t:'Re-enable forwarding, verify events arrive, alert on changes'},{id:'pol',t:'Add a logging paragraph to the policy document'}]},
  {id:'r2',q:'Gap: R2 allows tcp/1521 from ANY to sp-paydb-01',opts:[{id:'leave',t:'Leave it — 1521 is an unusual port nobody scans'},{id:'restrict',t:'Replace with: allow tcp/1521 app-subnet → paydb, documented need'},{id:'region',t:'Move the payment DB to another cloud region'},{id:'waf',t:'Put a WAF in front and keep the rule'}]},
  {id:'r3',q:'Gap: R4 allows tcp/443 from mktg-subnet to the tokenization vault',opts:[{id:'keep',t:'Keep the rule but annotate the change ticket'},{id:'logmore',t:'Keep it and add fuller traffic logging'},{id:'vlan',t:'Move marketing onto another VLAN instead'},{id:'remove',t:'Remove the rule; no business need justifies it'}]},
  {id:'r4',q:'Exception: k.osei\u2019s CDE account has MFA pending',opts:[{id:'mfa',t:'Complete MFA re-enrollment before any CDE access'},{id:'susp',t:'Suspend the account until MFA is re-enrolled'},{id:'key',t:'Swap MFA for a long SSH key'},{id:'wait',t:'Leave active — one account does not matter'}]}]},
 validate:(e)=>{const g=k=>e['m11.'+k];
  if(g('r1')==='fixlog'&&g('r2')==='restrict'&&g('r3')==='remove'&&(g('r4')==='mfa'||g('r4')==='susp'))return{ok:true};
  let m='Not the defensible fix. ';
  if(g('r1')!=='fixlog')m+='Logging is fixed by re-enabling forwarding, verifying events flow, and alerting on the logging toggle itself. ';
  if(g('r2')!=='restrict')m+='R2 closes by narrowing the source to the payment app subnet with a documented business need. ';
  if(g('r3')!=='remove')m+='R4 closes by removal — annotating or logging a rule that should not exist does not make it compliant. ';
  if(g('r4')!=='mfa'&&g('r4')!=='susp')m+='k.osei must not hold CDE access without MFA: re-enroll, or suspend until re-enrolled. ';
  return{ok:false,msg:m};}},

{id:'OBJ-M12',mode:'medium',pillar:'m',sec:'soc2',num:12,
 title:'Shared responsibility: who operates each control?',
 prompt:'Stamp each control CUMULOCLOUD (the CSP operates and attests it) or STRATUSPAY (you operate and evidence it).',
 win:'Facilities and hypervisors belong to CumuloCloud\u2019s attestations; identities, firewall rules, application keys and acting on CUECs are yours. Defender habit: for every requirement ask \u201cwho operates this, and where is their evidence?\u201d — inherited evidence never replaces owned operation.',
 look:[{t:'Manual §5',a:'m-share'},{t:'CumuloCloud SOC 2 (CUECs)',a:'cspsoc2'}],
 hints:['Ask: who configures and operates it day to day? Manual §5.',
        'Facilities and hypervisors are the provider\u2019s. Everything you configure — admin MFA, firewall rules, vault keys, reading CUECs — is yours.',
        'Inherited evidence ≠ owned operation: the CSP attests their side; you must still operate and evidence yours.'],
 widget:{kind:'stamp',key:'m12',okLabel:'CumuloCloud',gapLabel:'StratusPay',rows:[
  {id:'o1',t:'Physical datacenter security',s:'CumuloCloud facilities'},
  {id:'o2',t:'Hypervisor and host patching',s:'IaaS platform layer'},
  {id:'o3',t:'MFA on StratusPay administrator accounts',s:'identity configuration'},
  {id:'o4',t:'CDE firewall rules on sp-bastion-fw-01',s:'customer-managed network controls'},
  {id:'o5',t:'Application-level keys for the tokenization vault',s:'key custodianship'},
  {id:'o6',t:'Acting on the CUECs in CumuloCloud\u2019s SOC 2',s:'customer obligations'}]},
 validate:(e)=>{const v=e.m12||{};const need={o1:'ok',o2:'ok',o3:'gap',o4:'gap',o5:'gap',o6:'gap'};
  const bad=Object.keys(need).filter(k=>v[k]!==need[k]);
  if(bad.length===0)return{ok:true};
  let m='Re-check the split. ';
  if(bad.some(k=>['o1','o2'].includes(k)))m+='Physical security and hypervisor patching sit on the provider\u2019s side of the line. ';
  if(bad.some(k=>['o3','o4','o5','o6'].includes(k)))m+='Admin MFA, your firewall rules, vault keys and acting on CUECs are operated by you — the CSP\u2019s certificate does not cover them. ';
  return{ok:false,msg:m+'The provider secures the cloud; you secure what you build in it.'};}}
];
/* ================= HARD objectives (9) — strict, multi-part, noisy ================= */
const OBJH=[
{id:'OBJ-H1',mode:'hard',pillar:'r',sec:'pci',num:1,
 title:'Re-scope the CDE under noise, then rule on three proposed rules',
 prompt:'Select every asset that belongs in PCI scope, then stamp ALLOW or DENY on each proposed firewall change. The inventory has noise in it this time.',
 win:'Eight assets are in scope — including legacy-test-vm-07, whose R6 sync route pulls it in despite the label. The verdicts: allow the corp-net → jump-host admin path (documented need); deny marketing → payment DB and any-internet → DB outright. Defender habit: scope = data + connectivity, re-proven whenever the estate or rules change.',
 look:[{t:'Asset inventory',a:'assets'},{t:'Firewall rules',a:'rules'}],
 hints:['Connectivity counts: check R6 and the CI runner\u2019s deploy route before you finish the scope list.'],
 widget:{kind:'compound',
  parts:[
   {kind:'pick',key:'h1s',rows:[
    {id:'api',t:'sp-api-gw-01',s:'Public checkout; PAN decrypted in memory'},
    {id:'vault',t:'sp-token-vault-01',s:'Stores PAN→token mapping'},
    {id:'paydb',t:'sp-paydb-01',s:'Stores encrypted PAN (legacy table)'},
    {id:'jump',t:'sp-jump-01',s:'Approved admin path into the CDE'},
    {id:'logsink',t:'sp-logsink-01',s:'Receives syslog from all CDE components'},
    {id:'bastion',t:'sp-bastion-fw-01',s:'Enforces CDE segmentation'},
    {id:'ci',t:'sp-ci-runner-03',s:'Deploy route into the vault (R-deploy)'},
    {id:'legacy',t:'legacy-test-vm-07',s:'\u201cTest\u201d VM — nightly tcp/5432 sync into paydb (R6); DECOM-118 open since July'},
    {id:'nas',t:'corp-intra-nas',s:'HR files; no payment data; no routes'},
    {id:'wp',t:'mktg-wordpress-01',s:'Public site, no CHD (defaced last month — IR-2214 closed)'},
    {id:'mktgdb',t:'sp-mktg-db-01',s:'Web analytics only'},
    {id:'hr',t:'hr-payroll-saas',s:'Third-party SaaS, separate tenant'}],
    legend:'Select every asset that belongs IN PCI DSS scope:'},
   {kind:'stamp',key:'h1r',okLabel:'ALLOW',gapLabel:'DENY',rows:[
    {id:'hr1',t:'allow tcp/443 corp-net → sp-jump-01',s:'proposed: consolidated admin path via the jump host'},
    {id:'hr2',t:'allow tcp/5432 mktg-subnet → sp-paydb-01',s:'proposed: \u201canalytics needs payment funnel data\u201d'},
    {id:'hr3',t:'allow tcp/22 any (internet) → sp-paydb-01',s:'proposed: \u201cDBAs want to work from home\u201d'}],
    legend:'Stamp each proposed rule:'}]},
 validate:(e)=>{const sel=e.h1s||[];const need=['api','vault','paydb','jump','logsink','bastion','ci','legacy'].sort().join();
  const got=sel.slice().sort().join();const g=k=>e['h1r.'+k];
  const probs=[];
  if(got!==need){
    if(!sel.includes('legacy'))probs.push('legacy-test-vm-07 has a live route into sp-paydb-01 (R6) — connectivity puts it in scope whatever the label says.');
    ['nas','wp','mktgdb','hr'].forEach(k=>{if(sel.includes(k))probs.push('The '+({nas:'corporate NAS',wp:'marketing site',mktgdb:'marketing DB',hr:'HR SaaS'})[k]+' holds no account data and has no route into the CDE — out of scope (the WordPress defacement is a closed security incident, not a scope fact).');});
    ['api','vault','paydb','jump','logsink','bastion','ci'].forEach(k=>{if(!sel.includes(k))probs.push('You dropped an in-scope asset: '+({api:'sp-api-gw-01',vault:'sp-token-vault-01',paydb:'sp-paydb-01',jump:'sp-jump-01',logsink:'sp-logsink-01 (CDE logs flow through it)',bastion:'sp-bastion-fw-01',ci:'sp-ci-runner-03'})[k]+'.');});
  }
  if(g('hr1')!=='ok')probs.push('The corp-net → jump-host rule is the documented admin path — ALLOW (R3 exists for exactly this).');
  if(g('hr2')!=='gap')probs.push('Marketing → payment DB breaks segmentation and business need-to-know into the CDE — DENY.');
  if(g('hr3')!=='gap')probs.push('Internet → payment DB on tcp/22 exposes the CDE directly — DENY.');
  if(probs.length===0)return{ok:true};
  return{ok:false,msg:'Rejected — '+probs.slice(0,3).join(' ')};}},

{id:'OBJ-H2',mode:'hard',pillar:'u',sec:'pci',num:2,
 title:'Map five controls across all three frameworks',
 prompt:'For each control, choose the PCI requirement number, the ISO 27001:2022 Annex A theme, and the SOC 2 common criterion it expresses.',
 win:'One control, three vocabularies: MFA is PCI Req 8 / Technological / CC6; logging is Req 10 / Technological / CC7; cryptography is Req 3 / Technological / CC6; change management is Req 6 / Technological / CC8; assigned security roles are Req 12 / Organizational / CC1. Defender habit: cross-framework mapping is what lets one evidence artifact serve three audits.',
 look:[{t:'Manual §2',a:'m-pci'},{t:'Manual §4',a:'m-iso'},{t:'Manual §3',a:'m-soc2'}],
 hints:['PCI: pick the requirement number whose topic matches. ISO theme: Organizational / People / Physical / Technological. TSC: CC1 control environment, CC2 communication, CC3 risk assessment, CC4 monitoring activities, CC5 control activities, CC6 logical & physical access, CC7 system operations, CC8 change management, CC9 risk mitigation & procurement.'],
 widget:{kind:'matrix',key:'h2',rows:[
  {id:'c1',t:'MFA enforced for all CDE administrator access'},
  {id:'c2',t:'Centralized audit logging with daily review'},
  {id:'c3',t:'Stored account data encrypted; keys custodied and rotated'},
  {id:'c4',t:'Payment code changes require review and approval before deploy'},
  {id:'c5',t:'Security roles and responsibilities defined and assigned'}],
  fields:[
   {k:'pci',label:'PCI Req',opts:[1,2,3,4,5,6,7,8,9,10,11,12].map(n=>({id:'r'+n,t:'Req '+n}))},
   {k:'iso',label:'ISO Annex A theme',opts:[{id:'org',t:'Organizational'},{id:'ppl',t:'People'},{id:'phy',t:'Physical'},{id:'tec',t:'Technological'}]},
   {k:'tsc',label:'SOC 2 TSC',opts:[{id:'CC1',t:'CC1 — control environment'},{id:'CC2',t:'CC2 — communication'},{id:'CC3',t:'CC3 — risk assessment'},{id:'CC4',t:'CC4 — monitoring activities'},{id:'CC5',t:'CC5 — control activities'},{id:'CC6',t:'CC6 — logical & physical access'},{id:'CC7',t:'CC7 — system operations'},{id:'CC8',t:'CC8 — change management'},{id:'CC9',t:'CC9 — risk mitigation & procurement'}]}]},
 validate:(e)=>{const need={c1:{pci:'r8',iso:'tec',tsc:'CC6'},c2:{pci:'r10',iso:'tec',tsc:'CC7'},c3:{pci:'r3',iso:'tec',tsc:'CC6'},c4:{pci:'r6',iso:'tec',tsc:'CC8'},c5:{pci:'r12',iso:'org',tsc:'CC1'}};
  const probs=[];
  Object.keys(need).forEach(c=>{const nm={c1:'MFA',c2:'Logging',c3:'Cryptography',c4:'Change management',c5:'Roles & responsibilities'}[c];
   const n=need[c];const g=(e.h2&&e.h2[c])||{};
   if(g.pci!==n.pci)probs.push(nm+': PCI side is '+n.pci.replace('r','Req ')+' ('+({r8:'identify & authenticate',r10:'log & monitor',r3:'protect stored account data',r6:'secure systems & software',r12:'security policy & program'})[n.pci]+').');
   if(g.iso!==n.iso)probs.push(nm+': the ISO 27001 theme is '+({tec:'Technological',org:'Organizational'})[n.iso]+'.');
   if(g.tsc!==n.tsc)probs.push(nm+': the SOC 2 criterion is '+({CC6:'CC6 (logical & physical access)',CC7:'CC7 (system operations)',CC8:'CC8 (change management)',CC1:'CC1 (control environment)'})[n.tsc]+'.');});
  if(probs.length===0)return{ok:true};
  return{ok:false,msg:'Rejected — '+probs.slice(0,3).join(' ')+' Work one control at a time: topic → requirement number → theme → criterion.'};}},

{id:'OBJ-H3',mode:'hard',pillar:'r',sec:'soc2',num:3,
 title:'Triage three auditor requests — file the right artifact',
 prompt:'Three auditors, eight artifacts in the room, several of them stale or irrelevant. Click an artifact, then the request it satisfies. Two artifacts match nothing.',
 win:'The QSA gets the current ASV scan; the certification body gets the SoA; the CPA firm gets the Type II report covering exactly Oct 2024 – Sep 2025. The 2023 report is superseded, the CSP\u2019s report is not yours, and the BAA and marketing pen test answer requests nobody made. Defender habit: an evidence locker is only as good as its index — owner, period, and supersession tracked.',
 look:[{t:'Evidence index tab',a:null}],
 hints:['Match the requesting body, the framework and the period — every request names all three.'],
 widget:{kind:'assign',key:'h3',
  chips:[{id:'asv',t:'Q3 ASV scan report',s:'2025-10-02 · CDE ranges · PASS'},{id:'soa',t:'SoA v3.2',s:'all 93 Annex A rows, applicability + justification'},{id:'spsoc2',t:'StratusPay SOC 2 Type II',s:'period Oct 2024 – Sep 2025'},{id:'cc',t:'CumuloCloud SOC 2 Type II',s:'the CSP\u2019s report · period 2024'},{id:'old23',t:'StratusPay SOC 2 Type II — 2023',s:'superseded, retained for reference'},{id:'bridgel',t:'CumuloCloud bridge letter',s:'Jan–Sep 2025 · management statement'},{id:'hipaa',t:'HIPAA BAA',s:'corporate benefits platform only'},{id:'pent',t:'Marketing-site pen test',s:'Sep 2025 · public site only'}],
  slots:[{id:'qsa',t:'QSA (PCI DSS)',s:'\u201cshow your latest quarterly external scan evidence for the CDE\u201d'},{id:'cb',t:'Certification body (ISO 27001)',s:'\u201cshow the document listing applicable Annex A controls with justification\u201d'},{id:'cpa',t:'CPA firm (SOC 2)',s:'\u201cshow operating effectiveness for Oct 2024 – Sep 2025\u201d'}]},
 validate:(e)=>{const v=e.h3||{};
  if(v.asv==='qsa'&&v.soa==='cb'&&v.spsoc2==='cpa')return{ok:true};
  let m='Rejected — ';
  if(v.qsa!=='asv')m+='the QSA asked for the current quarterly external scan: the Q3 ASV report. ';
  if(v.cb!=='soa')m+='the certification body asked for the Annex A applicability document: the SoA. ';
  if(v.cpa!=='spsoc2')m+='the CPA firm asked for operating effectiveness Oct 2024 – Sep 2025: your own Type II report. ';
  if(v.cpa==='old23')m+='(The 2023 report is superseded — it proves a period nobody asked about.) ';
  else if(v.qsa==='cc'||v.cpa==='cc')m+='(CumuloCloud\u2019s report is the provider\u2019s, not StratusPay\u2019s.) ';
  return{ok:false,msg:m};}},

{id:'OBJ-H4',mode:'hard',pillar:'d',sec:'iso',num:4,
 title:'Find the four genuine findings — then classify them',
 prompt:'Ten evidence rows, four real findings. Select exactly the four that are genuine, in-scope nonconformities, then classify each MAJOR or MINOR.',
 win:'The four findings: E1 vault logging off (minor — isolated lapse), E2 R2 any-source into the payment DB (major — systemic access-control failure into the CDE), E3 k.osei active without MFA (minor), E4 no management review since Oct 2024 (major — a clause 9.3 required element is entirely absent). Defender habit: classification drives consequence — majors block certification until corrected; minors ride corrective action plans.',
 look:[{t:'Vault log',a:'vaultlog'},{t:'Rules extract',a:'rules'},{t:'Access review',a:'access'},{t:'ISMS record',a:'internal'}],
 hints:['A finding must be both real AND in scope. \u201cRequired element absent / systemic\u201d = major; \u201cisolated lapse\u201d = minor.'],
 widget:{kind:'compound',
  parts:[
   {kind:'pick',key:'h4e',legend:'Select the four genuine findings:',rows:[
    {id:'E1',t:'E1 — Vault audit logging',s:'syslog.forward=false since 2025-09-14, flagged in the pre-audit sweep'},
    {id:'E2',t:'E2 — Firewall rule R2',s:'allow tcp/1521 ANY → sp-paydb-01, ticket calls it \u201ctemporary\u201d since 2024'},
    {id:'E3',t:'E3 — k.osei CDE account',s:'MFA PENDING, account ACTIVE since re-enrollment was scheduled'},
    {id:'E4',t:'E4 — Management review',s:'last held 2024-10-11; no minutes since; clause 9.3 requires planned intervals'},
    {id:'E5',t:'E5 — mktg-wordpress-01 TLS certificate',s:'expired certificate — host is outside the CDE'},
    {id:'E6',t:'E6 — ASV critical on marketing host',s:'remediated 2025-10-03, rescan PASS 2025-10-05 — out of CDE scope'},
    {id:'E7',t:'E7 — legacy-test-vm-07 nightly sync',s:'documented route, working change ticket, patched — in scope, operating as designed'},
    {id:'E8',t:'E8 — Storage encryption',s:'SSE-AES256 enabled, public access blocked'},
    {id:'E9',t:'E9 — Quarterly access review',s:'signed 2025-09-30 with one flagged exception (E3)'},
    {id:'E10',t:'E10 — CI deploy route',s:'documented in IaC, reviewed, least-privilege service account'}]},
   {kind:'stamp',key:'h4c',okLabel:'MAJOR',gapLabel:'MINOR',legend:'Classify each finding:',rows:[
    {id:'E1',t:'E1 — Vault audit logging off',s:'one system, three weeks, discovered by your own sweep'},
    {id:'E2',t:'E2 — R2: ANY → payment DB tcp/1521',s:'CDE directly reachable from any source'},
    {id:'E3',t:'E3 — k.osei CDE access without MFA',s:'one account, caught in the quarterly review'},
    {id:'E4',t:'E4 — No management review for 12+ months',s:'a required ISMS activity simply did not happen'}]}]},
 validate:(e)=>{const sel=(e.h4e||[]).slice().sort();const need=['E1','E2','E3','E4'].join();const g=k=>e['h4c.'+k];const probs=[];
  if(sel.join()!==need){
    ['E5','E6'].forEach(k=>{if(sel.includes(k))probs.push(k+' is real but the host sits outside the CDE — a scope fact, not a PCI/ISMS finding here.');});
    if(sel.includes('E7'))probs.push('E7 is in scope but operating as designed — a documented route is not a nonconformity.');
    ['E8','E9','E10'].forEach(k=>{if(sel.includes(k))probs.push(k+' is compliant on its evidence — not a finding.');});
    ['E1','E2','E3','E4'].forEach(k=>{if(!sel.includes(k))probs.push(k+' is a genuine finding you missed — re-read its evidence row.');});
  }
  if(g('E1')!=='gap')probs.push('E1 is an isolated lapse with a corrective action plan — MINOR.');
  if(g('E2')!=='ok')probs.push('E2 exposes the CDE from any source — a systemic access-control failure — MAJOR.');
  if(g('E3')!=='gap')probs.push('E3 is a single account caught in review — MINOR.');
  if(g('E4')!=='ok')probs.push('E4 means a required ISMS element (management review, clause 9.3) is entirely absent — systemic — MAJOR.');
  if(probs.length===0)return{ok:true};
  return{ok:false,msg:'Rejected — '+probs.slice(0,3).join(' ')};}},

{id:'OBJ-H5',mode:'hard',pillar:'m',sec:'pci',num:5,
 title:'Plan the E1 remediation — fix, compensate, accept',
 prompt:'The vault logging gap (E1) may not close before Stage 2. Answer all four: the fix, the compensating control, who accepts residual risk, and the evidence the fix worked.',
 win:'Re-enable logging + verify events flow + alert on the toggle; if it must wait, an interim control meeting the intent AND rigor of Req 10 — documented and assessor-reviewed — stands in; only the named risk owner with management sign-off can accept residual risk; and the proof is the config toggle ON plus fresh vault events in sp-logsink-01 plus an alert test record. Defender habit: remediation is not done until the verification artifact exists.',
 look:[{t:'Vault log',a:'vaultlog'},{t:'Manual §6',a:'m-audit'}],
 hints:['Compensating controls must meet the intent AND rigor of the original requirement — and only a named risk owner can accept residual risk.'],
 widget:{kind:'choice',key:'h5',rows:[
  {id:'r1',q:'The real fix for E1 is:',opts:[{id:'siem',t:'Purchase a SIEM platform, implement next quarter'},{id:'fix',t:'Re-enable forwarding, verify events arrive, alert on changes'},{id:'purge',t:'Purge the affected log window entirely'},{id:'pol',t:'Add a logging clause to the ISMS policy'}]},
  {id:'r2',q:'If the fix cannot land before Stage 2, the defensible compensating control is:',opts:[{id:'hide',t:'Present the vault as out of scope for the Stage 2 audit'},{id:'post',t:'Promise the auditor the fix will land right after the audit'},{id:'none',t:'No control at all — accept the finding silently'},{id:'comp',t:'An interim control meeting Req 10\u2019s intent and rigor, documented and assessor-reviewed'}]},
  {id:'r3',q:'Residual risk for an unfixed gap is accepted by:',opts:[{id:'eng',t:'The platform engineer who disabled the logging'},{id:'csp',t:'CumuloCloud, as the operating platform provider'},{id:'owner',t:'The named risk owner with documented management sign-off'},{id:'aud',t:'The external auditor, by choosing not to raise it'}]},
  {id:'r4',q:'The artifact that proves the fix works is:',opts:[{id:'word',t:'A signed statement from the platform team'},{id:'ticket',t:'A closed Jira ticket with no verification attached'},{id:'proof',t:'Toggle ON, fresh vault events, alert-test record'},{id:'old',t:'Log samples from before September\u2019s incident'}]}]},
 validate:(e)=>{const g=k=>e['h5.'+k];
  if(g('r1')==='fix'&&g('r2')==='comp'&&g('r3')==='owner'&&g('r4')==='proof')return{ok:true};
  let m='Rejected — ';
  if(g('r1')!=='fix')m+='the fix is re-enable + verify + alert, not a purchase or a purge. ';
  if(g('r2')!=='comp')m+='a compensating control must meet the intent AND rigor of Req 10, be documented, and survive assessor review — hiding or promising is not control. ';
  if(g('r3')!=='owner')m+='residual risk is accepted by the named risk owner with documented management sign-off. ';
  if(g('r4')!=='proof')m+='proof means current, system-generated evidence: toggle state, fresh events, alert test. ';
  return{ok:false,msg:m};}},

{id:'OBJ-H6',mode:'hard',pillar:'r',sec:'soc2',num:6,
 title:'Reason through the Type II report\u2019s edge cases',
 prompt:'Four judgment calls from the SOC 2 desk — answer each with what the report and the profession actually do.',
 win:'Type II opinions are period-bound (a control is covered for the portion of the period it operated), exceptions are disclosed rather than hidden, reliance on subservice organizations is disclosed through their controls, and assurance after period-end comes from a management bridge letter. Defender habit: read the period, the exceptions and the CUECs before quoting any report to a customer.',
 look:[{t:'StratusPay SOC 2 excerpt',a:'spsoc2'},{t:'Manual §3',a:'m-soc2'}],
 hints:['Type II opinions are period-bound; exceptions are disclosed, never hidden; assurance after period-end comes from a bridge letter.'],
 widget:{kind:'choice',key:'h6',rows:[
  {id:'r1',q:'In a 12-month Type II period, the segmentation control was implemented 4 months in. The report will:',opts:[{id:'full',t:'Cover the control for the full 12 months'},{id:'drop',t:'Quietly omit the control from the report'},{id:'part',t:'Test and cover the portion it operated'},{id:'conv',t:'Convert the whole report to a Type I'}]},
  {id:'r2',q:'Change management shows 3 exceptions over the period (your own report has them). The report:',opts:[{id:'hide',t:'Hides exceptions fixed before period end'},{id:'disc',t:'Discloses the exceptions; customers evaluate their impact'},{id:'void',t:'Becomes void — any exception invalidates a report'},{id:'auto',t:'Automatically becomes an adverse opinion'}]},
  {id:'r3',q:'CumuloCloud (your subservice organization) had outages affecting the service. Your report:',opts:[{id:'omit',t:'Says nothing — subservice issues are not your problem'},{id:'shift',t:'Blames the CSP publicly and stops the review'},{id:'end',t:'Ends the engagement with that firm entirely'},{id:'csoc',t:'References the subservice controls and discloses the reliance'}]},
  {id:'r4',q:'Grandview wants assurance for October — two months after your period ended Sep 30. You send:',opts:[{id:'bridge',t:'A management bridge letter covering the gap'},{id:'new',t:'A brand-new Type II report by Friday'},{id:'old',t:'The report with the period edited to include October'},{id:'t1',t:'A Type I report performed for October'}]}]},
 validate:(e)=>{const g=k=>e['h6.'+k];
  if(g('r1')==='part'&&g('r2')==='disc'&&g('r3')==='csoc'&&g('r4')==='bridge')return{ok:true};
  let m='Rejected — ';
  if(g('r1')!=='part')m+='Type II coverage is period-bound: controls are tested for the time they actually operated. ';
  if(g('r2')!=='disc')m+='Exceptions are disclosed in the report; buyers read them and decide — hiding them is misrepresentation, and they do not automatically void or doom the opinion. ';
  if(g('r3')!=='csoc')m+='Subservice-organization reliance is disclosed (complementary subservice organization controls), not omitted. ';
  if(g('r4')!=='bridge')m+='The gap after period end is covered by a management bridge letter — editing report dates is fraud. ';
  return{ok:false,msg:m};}},

{id:'OBJ-H7',mode:'hard',pillar:'u',sec:'iso',num:7,
 title:'Build the ISO audit programme and cite the documents',
 prompt:'Sequence the six programme events, then answer the three document questions (the ISMS record on this desk holds the evidence).',
 win:'Internal audit → management review → Stage 1 → Stage 2 → annual surveillance → recertification. The applicability document is the SoA; management review is required by clause 9.3 at planned intervals; the certificate runs 3 years. Defender habit: the programme calendar is itself evidence — auditors ask for it first.',
 look:[{t:'ISMS audit programme record',a:'internal'},{t:'SoA extract',a:'soa'}],
 hints:['The SoA is the applicability document; management review is clause 9.3; the certificate runs 3 years.'],
 widget:{kind:'compound',
  parts:[
   {kind:'order',key:'h7',items:[
    {id:'ia',t:'Internal audit',s:'your own ISMS audit, before the CB arrives'},
    {id:'mr',t:'Management review',s:'clause 9.3 — leadership reviews the ISMS'},
    {id:'s1',t:'Stage 1 audit',s:'documentation & readiness'},
    {id:'s2',t:'Stage 2 audit',s:'implementation & sampling'},
    {id:'sur',t:'Surveillance audits',s:'annually by the CB'},
    {id:'rec',t:'Recertification',s:'before the 3-year expiry'}]},
   {kind:'choice',key:'h7q',rows:[
    {id:'r1',q:'The document listing all 93 Annex A controls with applicability and justification is:',opts:[{id:'soa',t:'The Statement of Applicability'},{id:'rr',t:'The ISMS risk register'},{id:'inv',t:'The cloud asset inventory'},{id:'pol',t:'The security policy document'}]},
    {id:'r2',q:'Management review at planned intervals is required by:',opts:[{id:'c42',t:'Clause 4.2'},{id:'c61',t:'Clause 6.1'},{id:'c81',t:'Clause 8.1'},{id:'c93',t:'Clause 9.3'},{id:'c102',t:'Clause 10.2'}]},
    {id:'r3',q:'An ISO 27001 certificate is valid for:',opts:[{id:'y1',t:'1 year'},{id:'y2',t:'2 years'},{id:'y3',t:'3 years'},{id:'y5',t:'5 years'}]}]}]},
 validate:(e)=>{const o=e.h7;const probs=[];
  if(!o||o.length<6){probs.push('Order all six events first.');}
  else if(o.join()!==['ia','mr','s1','s2','sur','rec'].join()){probs.push('The programme runs: internal audit → management review → Stage 1 → Stage 2 → annual surveillance → recertification (the internal audit and management review must precede the external audits).');}
  const g=k=>e['h7q.'+k];
  if(g('r1')!=='soa')probs.push('The applicability document is the Statement of Applicability.');
  if(g('r2')!=='c93')probs.push('Management review is clause 9.3.');
  if(g('r3')!=='y3')probs.push('The certificate is valid 3 years with annual surveillance.');
  if(probs.length===0)return{ok:true};
  return{ok:false,msg:'Rejected — '+probs.slice(0,3).join(' ')};}},

{id:'OBJ-H8',mode:'hard',pillar:'m',sec:'pci',num:8,
 title:'Decide the scope-reduction move — and how to prove it',
 prompt:'One architecture decision reduces PCI scope the most, and the new scope must be re-proven with three artifacts. Choose both.',
 win:'Moving PAN storage to third-party tokenization plus tested segmentation shrinks the CDE most — encryption alone keeps the data (and scope) inside. Re-proving the new scope takes a segmentation penetration test, an updated data-flow diagram and an updated ASV scan scope. Defender habit: scope decisions are architecture decisions; both need fresh evidence on file.',
 look:[{t:'Manual §2 scope reduction',a:'m-pci'}],
 hints:['Scope shrinks when account data leaves your systems and isolation is proven — both must be evidenced.'],
 widget:{kind:'compound',
  parts:[
   {kind:'choice',key:'h8r',rows:[
    {id:'r1',q:'Which change reduces PCI DSS scope the most?',opts:[{id:'enc',t:'Encrypt all stored PAN with AES-256 hardware'},{id:'tok',t:'Move PAN storage to tokenization and segment the CDE'},{id:'region',t:'Move all the workloads to another cloud region entirely'},{id:'waf',t:'Install a WAF in front of everything public'},{id:'ins',t:'Buy more cyber insurance coverage'}]}]},
   {kind:'pick',key:'h8a',legend:'Select the three artifacts that re-prove the new scope:',rows:[
    {id:'seg',t:'Segmentation penetration test results',s:'proves isolation of the remaining CDE'},
    {id:'dfd',t:'Updated data-flow diagram',s:'shows where account data now lives'},
    {id:'asvscope',t:'Updated ASV scan scope',s:'external scans re-targeted to the new perimeter'},
    {id:'floor',t:'New office floor plan',s:'…'},
    {id:'paypol',t:'Updated payroll policy',s:'…'},
    {id:'cal',t:'Marketing content calendar',s:'…'}]}]},
 validate:(e)=>{const probs=[];const r=e['h8r.r1'];const sel=(e.h8a||[]).slice().sort();
  if(r!=='tok')probs.push(r==='enc'?'Encryption keeps the PAN inside your systems — the scope stays; tokenization removes it and segmentation shrinks what remains.':'Region moves, WAFs and insurance change risk, not PCI scope. Tokenization + segmentation is the scope move.');
  if(sel.join()!==['asvscope','dfd','seg'].join()){['floor','paypol','cal'].forEach(k=>{if(sel.includes(k))probs.push('The floor plan, payroll policy and content calendar prove nothing about payment scope.');});['seg','dfd','asvscope'].forEach(k=>{if(!sel.includes(k))probs.push('You missed a required artifact: '+({seg:'the segmentation penetration test',dfd:'the updated data-flow diagram',asvscope:'the updated ASV scan scope'})[k]+'.');});}
  if(probs.length===0)return{ok:true};
  return{ok:false,msg:'Rejected — '+probs.slice(0,2).join(' ')};}},

{id:'OBJ-H9',mode:'hard',pillar:'m',sec:'briefing',num:9,
 title:'Executive brief: answer the room',
 prompt:'Close the season: one artifact per stakeholder, the finding that most endangers the PCI assessment, and the residual-risk statement you are willing to sign.',
 win:'The bank gets the ROC + AOC, Grandview the Type II + bridge letter, Helvetia the certificate + SoA summary; an open any-source rule into the payment DB is the finding most likely to fail the PCI assessment; and honest residual risk says the unlogged vault could miss misuse of stored PAN, temporarily reduced by a compensating review. Defender habit: executives fund fixes when risk is stated in one sentence with an owner and a date.',
 look:[{t:'Intake emails',a:'emails'},{t:'Evidence rows (H4)',a:null}],
 hints:['Each stakeholder receives the artifact their framework produces; the open firewall into the CDE is the assessment-killer; residual risk is stated with the real consequence and a compensating control.'],
 widget:{kind:'choice',key:'h9',rows:[
  {id:'r1',q:'First Meridian Bank (deadline Nov 15) receives:',opts:[{id:'aoc',t:'The QSA ROC + AOC'},{id:'s2',t:'The SOC 2 Type II report'},{id:'iso',t:'The ISO 27001 certificate'},{id:'br',t:'A bridge letter'}]},
  {id:'r2',q:'Grandview Retail receives:',opts:[{id:'aoc',t:'The current AOC, valid for another year'},{id:'s2',t:'Type II report plus a bridge letter'},{id:'iso',t:'The ISO 27001 certificate and SoA'},{id:'asv',t:'The most recent ASV scan summary'}]},
  {id:'r3',q:'Helvetia Retail Group receives:',opts:[{id:'aoc',t:'The AOC with the ROC'},{id:'s2',t:'The SOC 2 Type II report'},{id:'iso',t:'ISO 27001 certificate and SoA summary'},{id:'pen',t:'The marketing site pen test'}]},
  {id:'r4',q:'If only one finding can be fixed before the PCI assessment, fix:',opts:[{id:'e1',t:'E1 — the disabled vault audit logging trail'},{id:'e3',t:'E3 — the still-pending MFA re-enrollment for k.osei'},{id:'e4',t:'E4 — the long-missing ISMS management review meetings'},{id:'e2',t:'E2 — the open rule into payment DB'}]},
  {id:'r5',q:'The residual-risk statement you can defend is:',opts:[{id:'honest',t:'\u201cPAN misuse could go undetected; a daily compensating review reduces it.\u201d'},{id:'zero',t:'\u201cRisk is zero because the stored data is encrypted.\u201d'},{id:'trans',t:'\u201cRisk transfers to the acquiring bank once the AOC is signed.\u201d'},{id:'none',t:'\u201cNo risk statement is needed; auditors rarely check them.\u201d'}]}]},
 validate:(e)=>{const g=k=>e['h9.'+k];
  if(g('r1')==='aoc'&&g('r2')==='s2'&&g('r3')==='iso'&&g('r4')==='e2'&&g('r5')==='honest')return{ok:true};
  let m='Rejected — ';
  if(g('r1')!=='aoc')m+='the bank\u2019s program rules ask for the ROC + AOC. ';
  if(g('r2')!=='s2')m+='Grandview asked for the Type II plus coverage since period end (bridge letter). ';
  if(g('r3')!=='iso')m+='Helvetia asked for the certificate and SoA scope. ';
  if(g('r4')!=='e2')m+='an ANY-source rule directly into the payment DB is the finding most likely to fail the assessment outright. ';
  if(g('r5')!=='honest')m+='only the honest statement names a real consequence and a compensating control — encryption does not make risk zero, and risk does not transfer to the bank. ';
  return{ok:false,msg:m};}}
];
const OBJ=OBJM.concat(OBJH);
const OBJ_BY={};OBJ.forEach(function(o){OBJ_BY[o.id]=o;});
