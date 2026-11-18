'use strict';
/* CyberLab — N10-009 Lesson 4.4 Security Terminology (static port v4).
   Ported 1:1 from the original single-file lab. ALL data is synthetic. */

/* ============ js/objectives.js — objective definitions + CHECK RESULTS validators ============ */
/* Content (wording, answers, hint tiers, feedback) is carried over 1:1. */
/* ================= MEDIUM MODE: 11 guided objectives ================= */
const CIA_OPTS = ['Confidentiality','Integrity','Availability'];
const CIA_Q_OPTS = CIA_OPTS.map(x=>({v:x,t:x}));
const VETR_OPTS = ['Vulnerability','Exploit','Threat','Risk'];

const MED_OBJ = [
{ id:'M1', pillar:'understand', pts:10, title:'Term Match: Learn the Language',
  brief:'Every objective in this lab uses these five terms. Match each term to its correct definition, using the dropdowns below. The Knowledge Core above is open book.',
  hints:[
    'Threat = the who/what that could hurt you. Vulnerability = the where-you-are-weak. They are different things.',
    'An exploit is the "how" — code or a technique. It only exists in relation to a weakness it abuses.',
    'Risk is not an event: it is likelihood × impact. Mitigation is any action that lowers either side.']
  ,hintPenalty:0, maxHints:3,
  render(){ return '<div class="field"><span class="lbl">Threat</span>'+sel('m1-threat',[
      {v:'A',t:'A potential person, group or event that could cause harm to an asset'},
      {v:'B',t:'A weakness in a system, process or control that can be taken advantage of'},
      {v:'C',t:'The specific code, technique or action that takes advantage of a weakness'},
      {v:'D',t:'The combination of the likelihood of harm and the impact it would have'},
      {v:'E',t:'Any action or control that reduces the likelihood or impact of harm'},
      {v:'F',t:'The agreed playbook for notifying regulators after a breach'}],'Choose the definition of Threat…')+'</div>'+
    '<div class="field"><span class="lbl">Vulnerability</span>'+sel('m1-vuln',[
      {v:'A',t:'A potential person, group or event that could cause harm to an asset'},
      {v:'B',t:'A weakness in a system, process or control that can be taken advantage of'},
      {v:'C',t:'The specific code, technique or action that takes advantage of a weakness'},
      {v:'D',t:'The combination of the likelihood of harm and the impact it would have'},
      {v:'E',t:'Any action or control that reduces the likelihood or impact of harm'},
      {v:'F',t:'The agreed playbook for notifying regulators after a breach'}],'Choose the definition of Vulnerability…')+'</div>'+
    '<div class="field"><span class="lbl">Exploit</span>'+sel('m1-expl',[
      {v:'A',t:'A potential person, group or event that could cause harm to an asset'},
      {v:'B',t:'A weakness in a system, process or control that can be taken advantage of'},
      {v:'C',t:'The specific code, technique or action that takes advantage of a weakness'},
      {v:'D',t:'The combination of the likelihood of harm and the impact it would have'},
      {v:'E',t:'Any action or control that reduces the likelihood or impact of harm'},
      {v:'F',t:'The agreed playbook for notifying regulators after a breach'}],'Choose the definition of Exploit…')+'</div>'+
    '<div class="field"><span class="lbl">Risk</span>'+sel('m1-risk',[
      {v:'A',t:'A potential person, group or event that could cause harm to an asset'},
      {v:'B',t:'A weakness in a system, process or control that can be taken advantage of'},
      {v:'C',t:'The specific code, technique or action that takes advantage of a weakness'},
      {v:'D',t:'The combination of the likelihood of harm and the impact it would have'},
      {v:'E',t:'Any action or control that reduces the likelihood or impact of harm'},
      {v:'F',t:'The agreed playbook for notifying regulators after a breach'}],'Choose the definition of Risk…')+'</div>'+
    '<div class="field"><span class="lbl">Mitigation</span>'+sel('m1-mit',[
      {v:'A',t:'A potential person, group or event that could cause harm to an asset'},
      {v:'B',t:'A weakness in a system, process or control that can be taken advantage of'},
      {v:'C',t:'The specific code, technique or action that takes advantage of a weakness'},
      {v:'D',t:'The combination of the likelihood of harm and the impact it would have'},
      {v:'E',t:'Any action or control that reduces the likelihood or impact of harm'},
      {v:'F',t:'The agreed playbook for notifying regulators after a breach'}],'Choose the definition of Mitigation…')+'</div>'; },
  check(){ const g=id=>document.getElementById(id).value;
    if(g('m1-threat')==='A'&&g('m1-vuln')==='B'&&g('m1-expl')==='C'&&g('m1-risk')==='D'&&g('m1-mit')==='E')
      return {ok:true};
    const parts=[];
    if(g('m1-threat')!=='A')parts.push('Threat');
    if(g('m1-vuln')!=='B')parts.push('Vulnerability');
    if(g('m1-expl')!=='C')parts.push('Exploit');
    if(g('m1-risk')!=='D')parts.push('Risk');
    if(g('m1-mit')!=='E')parts.push('Mitigation');
    return {ok:false,msg:'Not quite. Re-check: '+parts.join(', ')+'. Hint wording: threat = who/what, vulnerability = weakness, exploit = how it is used, risk = likelihood × impact, mitigation = the control that lowers risk.'}; }
},
{ id:'M2', pillar:'understand', pts:10, title:'CIA Triage: Which Pillar Was Hit?',
  brief:'Three mini-incidents from the overnight shift. For each, decide which element of the CIA triad was primarily harmed.',
  hints:[
    'Ask: was data SEEN by the wrong eyes (confidentiality), CHANGED wrongly (integrity), or UNREACHABLE (availability)?',
    'Reading records without permission is disclosure → confidentiality. Wrong values in stored data → integrity.',
    'Ransomware and outages mostly break availability — nobody can reach the system, even authorized users.'],
  maxHints:3,
  render(){ return '<div class="field"><span class="lbl">A) A contractor opens the EHR and reads records of patients they are not treating.</span>'
      +sel('m2-a',CIA_Q_OPTS,'Which CIA pillar…')+'</div>'
    + '<div class="field"><span class="lbl">B) A lab integration bug writes results in the wrong units; stored reports now show inaccurate values.</span>'
      +sel('m2-b',CIA_Q_OPTS,'Which CIA pillar…')+'</div>'
    + '<div class="field"><span class="lbl">C) Ransomware encrypts the patient-portal servers; staff cannot access scheduling.</span>'
      +sel('m2-c',CIA_Q_OPTS,'Which CIA pillar…')+'</div>'; },
  check(){ const g=id=>document.getElementById(id).value;
    const wrong=[]; if(!eq(g('m2-a'),'Confidentiality'))wrong.push('A');
    if(!eq(g('m2-b'),'Integrity'))wrong.push('B'); if(!eq(g('m2-c'),'Availability'))wrong.push('C');
    return wrong.length?{ok:false,msg:'Re-check scenario(s) '+wrong.join(', ')+'. Seen by wrong eyes = Confidentiality, changed wrongly = Integrity, unreachable = Availability.'}:{ok:true}; }
},
{ id:'M3', pillar:'understand', pts:10, title:'Relate the Terms: One Correct Statement',
  brief:'Analysts who mix up these terms write wrong reports. Exactly one statement below correctly describes how threat, vulnerability, exploit and risk relate to each other.',
  hints:[
    'A vulnerability never "uses" anything — it is passive. A threat actor is the one acting.',
    'Risk is the potential for harm (likelihood × impact), not a synonym for vulnerability.',
    'You can reduce risk without removing threats: reduce likelihood or impact — that is mitigation.'],
  maxHints:3,
  render(){ return sel('m3-s',[
      {v:'x1',t:'A vulnerability uses an exploit to attack a threat.'},
      {v:'ok',t:'A threat actor uses an exploit against a vulnerability; the resulting potential for harm (likelihood × impact) is the risk.'},
      {v:'x2',t:'Risk and vulnerability are two names for the same measurement.'},
      {v:'x3',t:'The only way to reduce risk is to remove every threat actor from the world.'}],
      'Pick the one correct statement…'); },
  check(){ return eq(document.getElementById('m3-s').value,'ok')?{ok:true}:{ok:false,msg:'That statement inverts the relationship. Remember: actor → uses → exploit → targets → vulnerability. The potential for that harm is risk.'}; }
},
{ id:'M4', pillar:'identify', pts:10, title:'Ticket Triage: Label the Queue',
  brief:'Open the Ticket Queue in the SOC Desk. For tickets TKT-2041 to TKT-2044, choose the one term that best labels each item.',
  hints:[
    'Does the ticket describe a weakness, an attack action, a potential danger, or a likelihood × impact estimate?',
    'TKT-2041: no attack yet, just an old version = weakness. TKT-2043: a group that could act = danger.',
    'TKT-2042 shows the actual malicious payload being sent = the "how". TKT-2044 gives a likelihood and an impact figure.'],
  maxHints:3,
  render(){ return '<div class="field"><span class="lbl">TKT-2041 — scanner found Apache Struts 2.5.20 on WEB-01 (no attack observed)</span>'
      +sel('m4-a',VETR_OPTS,'Label…')+'</div>'
    + '<div class="field"><span class="lbl">TKT-2042 — WAF logged a malicious POST with a UNION SELECT payload</span>'
      +sel('m4-b',VETR_OPTS,'Label…')+'</div>'
    + '<div class="field"><span class="lbl">TKT-2043 — intel bulletin about group "COBALT SPARROW" targeting healthcare VPNs</span>'
      +sel('m4-c',VETR_OPTS,'Label…')+'</div>'
    + '<div class="field"><span class="lbl">TKT-2044 — risk register: 60% likelihood, $2.4M impact from phishing</span>'
      +sel('m4-d',VETR_OPTS,'Label…')+'</div>'; },
  check(){ const g=id=>document.getElementById(id).value;
    const wrong=[]; if(!eq(g('m4-a'),'Vulnerability'))wrong.push('TKT-2041');
    if(!eq(g('m4-b'),'Exploit'))wrong.push('TKT-2042'); if(!eq(g('m4-c'),'Threat'))wrong.push('TKT-2043');
    if(!eq(g('m4-d'),'Risk'))wrong.push('TKT-2044');
    return wrong.length?{ok:false,msg:'Re-check '+wrong.join(', ')+'. Weakness = Vulnerability · attack action/payload = Exploit · potential danger (person/group) = Threat · likelihood × impact estimate = Risk.'}:{ok:true}; }
},
{ id:'M5', pillar:'identify', pts:10, title:'Vulnerability Spotting: APP-02 Audit',
  brief:'The APP-02 config audit (TKT-2046) lists six findings. Tick the TWO that are genuine weaknesses (vulnerabilities). The other four are good security hygiene.',
  hints:[
    'A weakness is something an attacker could use. Ask each finding: does this make an attack easier?',
    'TLS 1.3, audit logging and nightly backups are controls working FOR you.',
    'Look at where RDP is reachable from, and whether repeated failed logins are ever blocked.'],
  maxHints:3,
  render(){ return chk('m5-a','RDP is reachable from the Internet') + chk('m5-b','TLS 1.3 is enabled') +
      chk('m5-c','Account lockout threshold is disabled') + chk('m5-d','Audit logging is enabled') +
      chk('m5-e','Backups are scheduled nightly') + chk('m5-f','Server runs on a supported OS version'); },
  check(){ const g=id=>document.getElementById(id).checked;
    if(g('m5-a')&&g('m5-c')&&!g('m5-b')&&!g('m5-d')&&!g('m5-e')&&!g('m5-f')) return {ok:true};
    return {ok:false,msg:'Exactly two findings are weaknesses: one is about network exposure (who can reach RDP?), one is about brute-force protection (is anything locking the account out?). Everything else is a control helping you.'}; }
},
{ id:'M6', pillar:'identify', pts:10, title:'Risk Matrix: Rate Two Assets',
  brief:'Use the 5×5 risk matrix below (Risk = Likelihood × Impact). Rate asset WEB-01 (likelihood 4, impact 5) and asset AS-03 Patient Portal (likelihood 2, impact 2).',
  hints:[
    'Multiply first, then read the band. 4 × 5 and 2 × 2.',
    '1–4 Low · 5–9 Medium · 10–14 High · 15–25 Critical.',
    '4×5=20 → the red band. 2×2=4 → the green band.'],
  maxHints:3,
  render(){ return '<div class="field"><span class="lbl">WEB-01 — likelihood 4 × impact 5 = 20 →</span>'
      +sel('m6-a',['Low','Medium','High','Critical'],'Risk band for WEB-01…')+'</div>'
    + '<div class="field"><span class="lbl">AS-03 Patient Portal — likelihood 2 × impact 2 = 4 →</span>'
      +sel('m6-b',['Low','Medium','High','Critical'],'Risk band for AS-03…')+'</div>'; },
  check(){ const g=id=>document.getElementById(id).value;
    if(eq(g('m6-a'),'Critical')&&eq(g('m6-b'),'Low'))return {ok:true};
    return {ok:false,msg:'Check the bands: 1–4 = Low, 5–9 = Medium, 10–14 = High, 15–25 = Critical. 20 is Critical, 4 is Low.'}; }
},
{ id:'M7', pillar:'detect', pts:10, title:'Log Hunt: Find the Exploit Attempts',
  brief:'Open the Log Viewer tab in the SOC Desk. WEB-01 was probed overnight. THREE lines contain actual exploit payloads against vulnerabilities (not scans, not benign traffic). Enter their line IDs, e.g. "L01, L02, L03".',
  hints:[
    'Look for request paths or payloads that try to break query or script syntax — quotes, keywords like UNION or SELECT, script tags.',
    'The two source IPs behave differently: 203.0.113.77 sends malformed requests; 198.51.100.23 browses normally.',
    'The exploit lines are L05, L06 and L09 — but try to find them yourself first! Enter them in any order.'],
  maxHints:3,
  render(){ return tinput('m7-lines','e.g. L01, L02, L03'); },
  check(){ const v=document.getElementById('m7-lines').value;
    const nums=[...new Set((String(v).match(/\d+/g)||[]).map(Number))].sort();
    const okSet = nums.length===3 && nums.join()=== '5,6,9';
    return okSet?{ok:true}:{ok:false,msg:'You listed '+nums.length+' line(s). Look for payloads with SQL syntax (UNION SELECT, OR 1=1) and script injection — all three come from 203.0.113.77.'}; }
},
{ id:'M8', pillar:'detect', pts:10, title:'Alert Language: Name What You See',
  brief:'Three IDS/SIEM alerts arrived. Choose which core term each alert is evidence of.',
  hints:[
    'Alert 1 shows attack tooling doing something to the app. Alert 2 shows a version banner. Alert 3 shows a pattern of activity from unknown infrastructure.',
    'Version disclosure without action = weakness. Beaconing = activity of a potential danger, not an exploit itself.',
    'SQLmap user-agent = automated exploitation in progress → Exploit.'],
  maxHints:3,
  render(){ return '<div class="field"><span class="lbl">1) Suricata alert: HTTP User-Agent "sqlmap/1.7" seen against /orders.php</span>'
      +sel('m8-a',VETR_OPTS,'Which term…')+'</div>'
    + '<div class="field"><span class="lbl">2) Banner grab: web CMS announces version 2.3.1 (end-of-life, known RCE)</span>'
      +sel('m8-b',VETR_OPTS,'Which term…')+'</div>'
    + '<div class="field"><span class="lbl">3) SIEM rule: host beacons to an unregistered domain every 60s for 3 hours</span>'
      +sel('m8-c',VETR_OPTS,'Which term…')+'</div>'; },
  check(){ const g=id=>document.getElementById(id).value;
    if(eq(g('m8-a'),'Exploit')&&eq(g('m8-b'),'Vulnerability')&&eq(g('m8-c'),'Threat'))return {ok:true};
    return {ok:false,msg:'Tooling actively abusing an app = Exploit. A published weak version = Vulnerability. Ongoing suspicious activity from unknown infrastructure = evidence of a Threat.'}; }
},
{ id:'M9', pillar:'mitigate', pts:10, title:'Control Match: Fix Each Weakness',
  brief:'Match each weakness to the control that best mitigates it.',
  hints:[
    'Match the control to the failure mode: old software → patching; shared credentials → identity controls.',
    'Data that must not be read → encryption; ransomware recovery → backups you can actually restore.',
    'Unpatched server → vendor patch. Shared admin password → MFA + unique accounts. Plaintext exports → encryption at rest. Untested backups → offline, tested backups.'],
  maxHints:3,
  render(){ return '<div class="field"><span class="lbl">WEB-01 runs an outdated web framework</span>'
      +sel('m9-a',[{v:'patch',t:'Apply the vendor patch under change control'},{v:'mfa',t:'Deploy MFA and unique accounts'},{v:'enc',t:'Encrypt exports at rest'},{v:'bak',t:'Keep offline, tested backups'}],'Select control…')+'</div>'
    + '<div class="field"><span class="lbl">All administrators share one password</span>'
      +sel('m9-b',[{v:'patch',t:'Apply the vendor patch under change control'},{v:'mfa',t:'Deploy MFA and unique accounts'},{v:'enc',t:'Encrypt exports at rest'},{v:'bak',t:'Keep offline, tested backups'}],'Select control…')+'</div>'
    + '<div class="field"><span class="lbl">Patient exports are written to disk unencrypted</span>'
      +sel('m9-c',[{v:'patch',t:'Apply the vendor patch under change control'},{v:'mfa',t:'Deploy MFA and unique accounts'},{v:'enc',t:'Encrypt exports at rest'},{v:'bak',t:'Keep offline, tested backups'}],'Select control…')+'</div>'
    + '<div class="field"><span class="lbl">Backups exist but have never been restore-tested</span>'
      +sel('m9-d',[{v:'patch',t:'Apply the vendor patch under change control'},{v:'mfa',t:'Deploy MFA and unique accounts'},{v:'enc',t:'Encrypt exports at rest'},{v:'bak',t:'Keep offline, tested backups'}],'Select control…')+'</div>'; },
  check(){ const g=id=>document.getElementById(id).value;
    if(eq(g('m9-a'),'patch')&&eq(g('m9-b'),'mfa')&&eq(g('m9-c'),'enc')&&eq(g('m9-d'),'bak'))return {ok:true};
    return {ok:false,msg:'Each control targets a different failure mode: outdated software needs patching, shared credentials need identity controls (MFA + unique accounts), readable data needs encryption, and untested backups need restore testing.'}; }
},
{ id:'M10', pillar:'mitigate', pts:10, title:'Incident Response: Pick the BEST Move',
  brief:'The patient-portal servers are encrypted by ransomware (AS-03 event). As SOC lead, which single action is the BEST immediate response?',
  hints:[
    'The question is about recovering service safely and not making the situation worse.',
    'Paying a ransom funds the threat actor and is not guaranteed to work. Doing nothing extends the outage.',
    'Use the offline backup vault (AS-04) — that is exactly why tested offline backups exist.'],
  maxHints:3,
  render(){ return sel('m10-s',[
      {v:'x1',t:'Pay the ransom to receive the decryption key'},
      {v:'ok',t:'Activate downtime procedures and restore the portal from the last verified offline backup'},
      {v:'x2',t:'Restart the servers and hope the malware disappears'},
      {v:'x3',t:'Wait for the attackers\u2019 deadline before doing anything'}],'Choose the best immediate action…'); },
  check(){ return eq(document.getElementById('m10-s').value,'ok')?{ok:true}:{ok:false,msg:'The best move restores availability without rewarding the attacker and without gambling: downtime procedures + restore from verified offline backups.'}; }
},
{ id:'M11', pillar:'mitigate', pts:10, title:'Compensating Control: When You Cannot Patch',
  brief:'A rural clinic runs a legacy imaging workstation. The vendor patch is not released yet and the workstation cannot be replaced this quarter. Choose the BEST compensating control.',
  hints:[
    'A compensating control reduces risk by another route — it does not "fix" the vulnerability itself.',
    'Ask which option reduces either the likelihood or the impact, instead of ignoring the problem.',
    'If you cannot fix the weakness, cut the exposure: isolate it, restrict what can talk to it, and watch it.'],
  maxHints:3,
  render(){ return sel('m11-s',[
      {v:'ok',t:'Isolate the workstation on a restricted VLAN with allow-listed traffic and enhanced logging'},
      {v:'x1',t:'Accept the risk and take no further action'},
      {v:'x2',t:'Disable all logging on it to improve performance'},
      {v:'x3',t:'Reboot it every morning and hope for the best'}],'Choose the compensating control…'); },
  check(){ return eq(document.getElementById('m11-s').value,'ok')?{ok:true}:{ok:false,msg:'A compensating control reduces exposure another way: isolation + allow-listing + logging lowers likelihood and improves detection until a patch exists.'}; }
}
];

/* ================= HARD MODE: 9 deep challenges ================= */
/* 15 pts each · max 1 hint (−5 pts) · 2+ red herrings across the set */
const HARD_CH = [
{ id:'H1', pillar:'detect', pts:15, title:'Alert Triage: Separate Signal From Noise',
  brief:'Six alerts fired overnight (see Alert Queue below). Exactly TWO are genuine exploit attempts against a known vulnerability — an attempt to abuse a weakness. The rest are noise, authorized activity, or attacks that never became exploit attempts. Tick the TWO genuine exploit attempts.',
  hints:['An authorized internal scanner is not an attacker, and a quarantined email never touched the endpoint. Look for payloads actively abusing application weaknesses.'],
  render(){ return chk('h1-a','AL-101 · SQLi payload <code>1\' UNION SELECT credit_card, ssn FROM patients--</code> POSTed to /orders.php on WEB-01 from 203.0.113.77')
    + chk('h1-b','AL-102 · Java deserialization hit on APP-02 <code>/api/export</code> — serialized object executes system command')
    + chk('h1-c','AL-103 · Mass port sweep from internal host 10.0.5.20 — matches the weekly authorized vulnerability-scanner schedule')
    + chk('h1-d','AL-104 · Credential-phishing email quarantined at the mail gateway; zero user clicks recorded')
    + chk('h1-e','AL-105 · Hourly NTP clock-skew warnings from SRV-07')
    + chk('h1-f','AL-106 · Nightly backup job completed successfully'); },
  check(){ const g=id=>document.getElementById(id).checked;
    return (g('h1-a')&&g('h1-b')&&!g('h1-c')&&!g('h1-d')&&!g('h1-e')&&!g('h1-f'))?{ok:true}
      :{ok:false,msg:'Two red herrings are the scanner (authorized activity, not an attacker) and the phishing mail (never executed on a host). NTP/backup alerts are noise. The two real ones send payloads that abuse application weaknesses.'}; }
},
{ id:'H2', pillar:'identify', pts:15, title:'Chain the Incident: Vulnerability → Exploit → Threat → Risk',
  brief:'Incident INC-88 — WEB-01 was compromised. The web framework was 2.5.20 (unpatched); actor "COBALT SPARROW" sent a crafted Content-Type header that executed OGNL expressions; the risk register scores this asset at likelihood 4, impact 5. Answer all four parts.',
  hints:['Four parts: (1) the WEAKNESS with the product+version, (2) the HOW (the technique used), (3) WHO (the actor name), (4) risk = 4 × 5.'],
  render(){ return '<div class="field"><span class="lbl">1) The vulnerability (name the weakness, include the product and version)</span>'+tinput('h2-vuln','e.g. outdated product X.Y.Z')+'</div>'
    + '<div class="field"><span class="lbl">2) The exploit (the technique used to abuse it)</span>'+tinput('h2-expl','e.g. what did the crafted request do?')+'</div>'
    + '<div class="field"><span class="lbl">3) The threat actor (from the intel bulletin)</span>'+tinput('h2-actor','Name the group…')+'</div>'
    + '<div class="field"><span class="lbl">4) The risk score (likelihood × impact)</span>'+tinput('h2-score','e.g. 25')+'</div>'; },
  check(){ const v=id=>document.getElementById(id).value;
    const p=[];
    if(!hasAll(v('h2-vuln'),['struts'])||!hasAny(v('h2-vuln'),['2.5.20','unpatch','outdated']))p.push('1');
    if(!hasAny(v('h2-expl'),['ognl','content-type','header']))p.push('2');
    if(!hasAny(v('h2-actor'),['cobalt']))p.push('3');
    if(norm(v('h2-score'))!=='20')p.push('4');
    if(p.length===0)return {ok:true};
    return {ok:false,msg:'Parts not yet correct: '+p.join(', ')+'. 1) the weakness = unpatched Apache Struts 2.5.20 · 2) the how = crafted Content-Type / OGNL injection · 3) the who = COBALT SPARROW · 4) 4 × 5.'}; }
},
{ id:'H3', pillar:'understand', pts:15, title:'CIA Violation Triage: Four Micro-Incidents',
  brief:'Classify each micro-incident by the CIA pillar it primarily harms, then label the final item with its correct term.',
  hints:['Seen / stolen / posted publicly = Confidentiality. Altered or fails verification = Integrity. Down / unreachable = Availability.'],
  render(){ return '<div class="field"><span class="lbl">1) Radiology images were altered before anyone noticed</span>'+sel('h3-a',CIA_Q_OPTS,'Pillar…')+'</div>'
    + '<div class="field"><span class="lbl">2) Patient portal unreachable for 4 hours</span>'+sel('h3-b',CIA_Q_OPTS,'Pillar…')+'</div>'
    + '<div class="field"><span class="lbl">3) 5,000 patient records posted to a public paste site</span>'+sel('h3-c',CIA_Q_OPTS,'Pillar…')+'</div>'
    + '<div class="field"><span class="lbl">4) Archive file fails its checksum verification on restore</span>'+sel('h3-d',CIA_Q_OPTS,'Pillar…')+'</div>'
    + '<div class="field"><span class="lbl">5) "Our VPN gateway is missing the latest security patch." This statement describes a…</span>'+sel('h3-e',VETR_OPTS,'Term…')+'</div>'; },
  check(){ const g=id=>document.getElementById(id).value;
    const p=[]; if(!eq(g('h3-a'),'Integrity'))p.push('1'); if(!eq(g('h3-b'),'Availability'))p.push('2');
    if(!eq(g('h3-c'),'Confidentiality'))p.push('3'); if(!eq(g('h3-d'),'Integrity'))p.push('4');
    if(!eq(g('h3-e'),'Vulnerability'))p.push('5');
    return p.length?{ok:false,msg:'Re-check part(s) '+p.join(', ')+'. Altered or fails verification = Integrity · unreachable = Availability · publicly exposed = Confidentiality · missing patch = a weakness.'}:{ok:true}; }
},
{ id:'H4', pillar:'identify', pts:15, title:'Risk Ranking: Put the Assets in Order',
  brief:'Score each asset with the matrix (Risk = Likelihood × Impact; 1–4 Low · 5–9 Medium · 10–14 High · 15–25 Critical), then rank all three from highest risk (1) to lowest (3).',
  hints:['AS-01: 4×5 · AS-02: 3×3 · AS-05: 5×2. Compute all three, then order. Note that a bigger likelihood does not always beat a bigger impact.'],
  render(){ return '<div class="field"><span class="lbl">AS-01 EHR Database — likelihood 4, impact 5 → rank</span>'+sel('h4-a',['1 (highest risk)','2','3 (lowest risk)'],'Rank…')+'</div>'
    + '<div class="field"><span class="lbl">AS-02 Lab Results Engine — likelihood 3, impact 3 → rank</span>'+sel('h4-b',['1 (highest risk)','2','3 (lowest risk)'],'Rank…')+'</div>'
    + '<div class="field"><span class="lbl">AS-05 Payment Gateway — likelihood 5, impact 2 → rank</span>'+sel('h4-c',['1 (highest risk)','2','3 (lowest risk)'],'Rank…')+'</div>'; },
  check(){ const g=id=>document.getElementById(id).value;
    const p=[]; if(!eq(g('h4-a'),'1 (highest risk)'))p.push('AS-01'); if(!eq(g('h4-b'),'3 (lowest risk)'))p.push('AS-02');
    if(!eq(g('h4-c'),'2'))p.push('AS-05');
    return p.length?{ok:false,msg:'Scores: AS-01 = 20, AS-02 = 9, AS-05 = 10. Order: AS-01 (1st) → AS-05 (2nd) → AS-02 (3rd). Impact can outrank frequency.'}:{ok:true}; }
},
{ id:'H5', pillar:'detect', pts:15, title:'Exfiltration Hunt: Read the DNS Evidence',
  brief:'DNS query log for the last hour (see the DNS Log tab in the SOC Desk). One workstation is silently exfiltrating data. Red herrings included: NTP sync, AV updates, printer chatter. Name the host and the CIA pillar being harmed.',
  hints:['Base64-looking subdomains carrying payload chunks, repeated at a fixed interval, are a classic DNS exfiltration channel. Data leaving = one specific pillar.'],
  render(){ return '<div class="field"><span class="lbl">1) Which workstation is exfiltrating data? (hostname)</span>'+tinput('h5-host','e.g. WS-000')+'</div>'
    + '<div class="field"><span class="lbl">2) Which CIA pillar does this harm?</span>'+sel('h5-pillar',CIA_Q_OPTS,'Pillar…')+'</div>'; },
  check(){ const v=id=>document.getElementById(id).value;
    const hostOk = hasAll(v('h5-host'),['ws','114']);
    const pillOk = eq(document.getElementById('h5-pillar').value,'Confidentiality');
    if(hostOk&&pillOk)return {ok:true};
    return {ok:false,msg:(hostOk?'':'Check the log for long, random-looking subdomains repeating every 60s — that host is WS-114. ')+(pillOk?'':'Data leaving the organization without authorization is a loss of confidentiality.')}; }
},
{ id:'H6', pillar:'mitigate', pts:15, title:'Patch Triage: Which CVEs Actually Apply?',
  brief:'Bulletin P-2611 lists four CVEs; the inventory snapshot gives installed versions (both in the Intel Feed). Tick the TWO CVEs that genuinely apply to the current estate and must be patched. Two are red herrings.',
  hints:['A CVE only applies if the installed product AND the installed version fall inside the affected range. Check the inventory snapshot first.'],
  render(){ return chk('h6-a','CVE-2026-1001 · affects Patient Portal 4.1.0–4.1.7')
    + chk('h6-b','CVE-2026-1002 · affects VPN Gateway 2.x only')
    + chk('h6-c','CVE-2026-1003 · affects DB Client 11.x only')
    + chk('h6-d','CVE-2026-1004 · affects Payment Gateway 5.0–5.2'); },
  check(){ const g=id=>document.getElementById(id).checked;
    return (g('h6-a')&&g('h6-d')&&!g('h6-b')&&!g('h6-c'))?{ok:true}
      :{ok:false,msg:'Compare versions: installed Patient Portal v4.1.5 is inside 4.1.0–4.1.7 and Payment Gateway v5.1 is inside 5.0–5.2. But VPN Gateway runs v3.2 (not 2.x) and DB Client runs v12.4 (not 11.x) — those two are red herrings.'}; }
},
{ id:'H7', pillar:'mitigate', pts:15, title:'Containment Plan: Order the Response',
  brief:'INC-88 is confirmed: WEB-01 compromised via the web framework flaw, attacker holds a web shell. Order the five response steps from first (1) to last (5).',
  hints:['Ask after every step: does acting later put evidence or the network at greater risk? You stop the bleeding, cut the attacker\u2019s access, understand the blast radius, then fix and watch.'],
  render(){ const opts=['1 (first)','2','3','4','5 (last)'];
    return '<div class="field"><span class="lbl">Isolate WEB-01 from the network</span>'+sel('h7-a',opts,'Order…')+'</div>'
    + '<div class="field"><span class="lbl">Disable the compromised service account and rotate credentials</span>'+sel('h7-b',opts,'Order…')+'</div>'
    + '<div class="field"><span class="lbl">Assess scope: search logs for indicators, list affected systems</span>'+sel('h7-c',opts,'Order…')+'</div>'
    + '<div class="field"><span class="lbl">Patch the web framework on WEB-01 and peers</span>'+sel('h7-d',opts,'Order…')+'</div>'
    + '<div class="field"><span class="lbl">Review monitoring rules and report the incident</span>'+sel('h7-e',opts,'Order…')+'</div>'; },
  check(){ const g=id=>document.getElementById(id).value;
    const want=['1 (first)','2','3','4','5 (last)'];
    const ids=['h7-a','h7-b','h7-c','h7-d','h7-e'];
    const p=ids.filter((id,i)=>!eq(g(id),want[i]));
    return p.length?{ok:false,msg:'Correct order: 1 isolate the host → 2 revoke compromised credentials → 3 assess scope → 4 patch → 5 review monitoring and report.'}:{ok:true}; }
},
{ id:'H8', pillar:'identify', pts:15, title:'Insider Incident: Read Past the Red Herring',
  brief:'A controlled-substance ledger was edited 11 times after hours under technician account "J. Alvarez". An antivirus alert fired on the same host the same night, but analysis shows the alert was a false positive from a research tool. Answer the three questions.',
  hints:['The AV alert is the red herring — it was a false positive and does not explain the ledger edits. The actor had legitimate access and abused it.'],
  render(){ return '<div class="field"><span class="lbl">1) How is this threat best classified?</span>'+sel('h8-a',[
      {v:'insider',t:'Insider threat'},{v:'malware',t:'Malware infection'},{v:'apt',t:'External nation-state actor'},{v:'hardware',t:'Hardware failure'}],'Classification…')+'</div>'
    + '<div class="field"><span class="lbl">2) Which CIA pillar was primarily violated?</span>'+sel('h8-b',CIA_Q_OPTS,'Pillar…')+'</div>'
    + '<div class="field"><span class="lbl">3) Which mitigation best addresses this class of threat?</span>'+sel('h8-c',[
      {v:'ok',t:'Least-privilege access reviews plus tamper-evident audit logging on the ledger'},
      {v:'x1',t:'Install a second antivirus product on the host'},
      {v:'x2',t:'Disable every technician account permanently'},
      {v:'x3',t:'Move the ledger to the same host for faster access'}],'Mitigation…')+'</div>'; },
  check(){ const g=id=>document.getElementById(id).value;
    const p=[]; if(!eq(g('h8-a'),'insider'))p.push('1'); if(!eq(g('h8-b'),'Integrity'))p.push('2'); if(!eq(g('h8-c'),'ok'))p.push('3');
    return p.length?{ok:false,msg:'Re-check part(s) '+p.join(', ')+'. A trusted user abusing legitimate access = insider threat · unauthorized changes = Integrity · least privilege + audit logging targets that class of threat (more antivirus does not).'}:{ok:true}; }
},
{ id:'H9', pillar:'understand', pts:15, title:'CISO Brief: True or False',
  brief:'You have been asked to brief the CISO. Mark each statement True or False — each one uses this lesson\u2019s terminology.',
  hints:['Watch for absolutes ("never", "proves", "only"). An alert shows something happened, not that it succeeded. Controls can shift likelihood AND impact.'],
  render(){ const opts=[{v:'true',t:'True'},{v:'false',t:'False'}];
    return '<div class="field"><span class="lbl">1) "A vulnerability is a weakness; an exploit is the way that weakness is used."</span>'+sel('h9-a',opts,'True/False…')+'</div>'
    + '<div class="field"><span class="lbl">2) "Confidentiality, Integrity and Availability are fully independent — protecting one never affects the others."</span>'+sel('h9-b',opts,'True/False…')+'</div>'
    + '<div class="field"><span class="lbl">3) "Risk can be reduced by lowering either the likelihood or the impact."</span>'+sel('h9-c',opts,'True/False…')+'</div>'
    + '<div class="field"><span class="lbl">4) "An IDS alert alone proves that an exploit succeeded."</span>'+sel('h9-d',opts,'True/False…')+'</div>'
    + '<div class="field"><span class="lbl">5) "Encrypting patient data primarily supports confidentiality."</span>'+sel('h9-e',opts,'True/False…')+'</div>'; },
  check(){ const g=id=>document.getElementById(id).value;
    const want=['true','false','true','false','true'];
    const ids=['h9-a','h9-b','h9-c','h9-d','h9-e'];
    const p=ids.map((id,i)=>!eq(g(id),want[i])?String(i+1):null).filter(Boolean);
    return p.length?{ok:false,msg:'Re-check statement(s) '+p.join(', ')+'. The pillars interact (backups serve integrity AND availability; encryption can cost availability). Alerts fire on attempts, not only on successes. Risk drops when likelihood OR impact drops.'}:{ok:true}; }
}
];
