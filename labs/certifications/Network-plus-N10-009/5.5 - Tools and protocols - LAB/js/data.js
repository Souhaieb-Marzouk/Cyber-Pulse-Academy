/* =====================================================================
   SIGNAL PATH · TOOL BENCH — Network+ N10-009 Lesson 5.5 (static port v4)
   js/data.js — ALL lab content (data only, no logic).
   Ported verbatim from the certified single-file build; no logic changes.
   ===================================================================== */
'use strict';
/* =====================================================================
   SIGNAL PATH · TOOL BENCH — Network+ N10-009 Lesson 5.5
   Static port (v4) of the certified single-file lab. All data simulated. No external dependencies.
   ===================================================================== */
'use strict';

/* ---------------- data: simulated terminal environment ---------------- */
const PING_OK = {'10.20.40.20':{ttl:128,tag:'FILESRV'},'10.20.40.10':{ttl:64,tag:'SVR-CORE'},'10.20.40.1':{ttl:64,tag:'GW-CLINIC'},'8.8.8.8':{ttl:115,tag:'dns.google'}};

/* ---------------- data: packets ---------------- */
const PACKETS_M = [
 {id:'p1', t:'0.000', src:'10.20.40.57', dst:'Broadcast', proto:'ARP', info:'Who has 10.20.40.1? Tell 10.20.40.57',
  det:['Ethernet II, Src: 54:e1:ad:3c:92:b7, Dst: ff:ff:ff:ff:ff:ff','Address Resolution Protocol (request)','  Sender IP: 10.20.40.57 · Target IP: 10.20.40.1']},
 {id:'p2', t:'0.001', src:'10.20.40.1', dst:'10.20.40.57', proto:'ARP', info:'10.20.40.1 is at 00:1b:21:7c:44:01',
  det:['Ethernet II, Src: 00:1b:21:7c:44:01','Address Resolution Protocol (reply)','  Sender MAC: 00:1b:21:7c:44:01 (gateway GW-CLINIC)']},
 {id:'p3', t:'0.412', src:'10.20.40.57', dst:'203.0.113.53', proto:'DNS', info:'Standard query 0x4d1a A filesrv.lakeshore.local',
  det:['Domain Name System (query)','  Transaction ID: 0x4d1a','  Queries: filesrv.lakeshore.local, type A','  Destination: 203.0.113.53  ← external resolver, not the internal server 10.20.40.10']},
 {id:'p4', t:'0.455', src:'203.0.113.53', dst:'10.20.40.57', proto:'DNS', info:'Response 0x4d1a Name error (NXDOMAIN)',
  det:['Domain Name System (response)','  Transaction ID: 0x4d1a','  Flags: 0x8183 Name error (NXDOMAIN)','  The external resolver has no record for the internal zone lakeshore.local']},
 {id:'p5', t:'0.618', src:'10.20.40.88', dst:'224.0.0.251', proto:'MDNS', info:'Query A desktop-lk492j.local',
  det:['Multicast Domain Name System (query)','  Queries: desktop-lk492j.local, type A']},
 {id:'p6', t:'0.640', src:'10.20.40.88', dst:'224.0.0.251', proto:'MDNS', info:'Response A desktop-lk492j.local 10.20.40.88',
  det:['Multicast Domain Name System (response)','  Answer: desktop-lk492j.local A 10.20.40.88']},
 {id:'p7', t:'0.702', src:'10.20.40.57', dst:'10.20.40.1', proto:'ICMP', info:'Echo (ping) request id=0x0001, seq=1/128',
  det:['Internet Control Message Protocol','  Type: 8 (Echo request)','  32 bytes payload']},
 {id:'p8', t:'0.705', src:'10.20.40.1', dst:'10.20.40.57', proto:'ICMP', info:'Echo (ping) reply id=0x0001, seq=1/128',
  det:['Internet Control Message Protocol','  Type: 0 (Echo reply)','  Round trip under 1 ms — gateway is healthy']},
 {id:'p9', t:'0.881', src:'10.20.40.57', dst:'10.20.40.20', proto:'TCP', info:'51820 → 445 [SYN] Seq=0 Win=64240',
  det:['Transmission Control Protocol','  Source Port: 51820 · Destination Port: 445 (SMB)','  Flags: 0x002 (SYN) — opening a session to the file server by IP']},
 {id:'p10', t:'0.884', src:'10.20.40.20', dst:'10.20.40.57', proto:'TCP', info:'445 → 51820 [SYN, ACK] Seq=0 Ack=1',
  det:['Transmission Control Protocol','  Flags: 0x012 (SYN, ACK) — the file server answers','  FILESRV is up and reachable at the IP layer']},
 {id:'p11', t:'0.885', src:'10.20.40.57', dst:'10.20.40.20', proto:'TCP', info:'51820 → 445 [ACK] Seq=1 Ack=1',
  det:['Transmission Control Protocol','  Flags: 0x010 (ACK)','  Three-way handshake complete: SYN → SYN,ACK → ACK']},
 {id:'p12', t:'0.902', src:'10.20.40.57', dst:'10.20.40.20', proto:'SMB', info:'Negotiate Protocol Request (SMB 2)',
  det:['SMB2 Protocol','  Command: Negotiate','  Client asks for dialect 3.1.1 — session continues over the good IP path']}
];
const PACKETS_H = [
 {id:'h1', t:'1.105', src:'10.20.40.57', dst:'10.20.40.30', proto:'TCP', info:'52100 → 5060 [SYN] Seq=0 Win=64240',
  det:['Transmission Control Protocol','  Source Port: 52100 · Destination Port: 5060 (SIP/VoIP PBX)','  Flags: 0x002 (SYN)']},
 {id:'h2', t:'1.311', src:'10.20.40.57', dst:'10.20.40.30', proto:'TCP', info:'[TCP Retransmission] 52100 → 5060 [SYN]',
  det:['Transmission Control Protocol','  Flags: 0x002 (SYN)','  [TCP Retransmission] — the original SYN was never acknowledged','  This frame is a re-send: packet loss on the path to the PBX']},
 {id:'h3', t:'1.723', src:'10.20.40.57', dst:'10.20.40.30', proto:'TCP', info:'[TCP Retransmission] 52100 → 5060 [SYN]',
  det:['Transmission Control Protocol','  Flags: 0x002 (SYN)','  [TCP Retransmission] — second re-send','  Repeated retransmissions = a reliability problem, not an attack']},
 {id:'h4', t:'1.801', src:'10.20.40.30', dst:'10.20.40.57', proto:'TCP', info:'5060 → 52100 [SYN, ACK]',
  det:['Transmission Control Protocol','  Flags: 0x012 (SYN, ACK) — the PBX finally answers the third SYN']},
 {id:'h5', t:'1.905', src:'10.20.40.57', dst:'10.20.40.30', proto:'UDP', info:'16384 → 10002 Len=172 (RTP voice payload)',
  det:['User Datagram Protocol','  Source Port: 16384 · Destination Port: 10002','  Real-time Transport Protocol — the actual voice stream to the PBX']}
];

/* ---------------- data: cables ---------------- */
const CABLES = {
 c1:{name:'Patch cable C1', sub:'Reception VoIP phone · rated Cat 6', verdict:'FAULT — SPLIT PAIR', vb:'fail', length:'1.8 m',
  note:'Continuity passes on all eight pins, but pins 3 and 6 are terminated across different twisted pairs at one end (a 3-4 / 5-6 punch instead of 3-6). A basic continuity-only tester would call this cable good. Split pairs cause crosstalk and intermittent errors — which is exactly how choppy VoIP audio sounds.',
  map:[['1','ok'],['2','ok'],['3','split'],['4','ok'],['5','ok'],['6','split'],['7','ok'],['8','ok']]},
 c2:{name:'Wall run C2', sub:'IDF → reception floor port', verdict:'FAULT — OVER LENGTH', vb:'fail', length:'118.4 m',
  note:'Continuity is clean and the wire map is correct, but the run measures 118.4 m — beyond the 100 m channel limit for copper Ethernet (about 90 m permanent link plus 10 m of patches). Attenuation past the limit produces exactly the intermittent VoIP problems reported. Moving the switch closer (or adding an IDF) is the real fix; better cable is not.',
  map:[['1','ok'],['2','ok'],['3','ok'],['4','ok'],['5','ok'],['6','ok'],['7','ok'],['8','ok']]},
 c3:{name:'Patch cable C3', sub:'Front-desk workstation', verdict:'PASS', vb:'pass', length:'2.1 m',
  note:'Wire map correct, all pairs intact, length well within limits. This is what a healthy cable looks like on the tester.',
  map:[['1','ok'],['2','ok'],['3','ok'],['4','ok'],['5','ok'],['6','ok'],['7','ok'],['8','ok']]},
 c4:{name:'Patch cable C4', sub:'Storage-room AP', verdict:'PASS', vb:'pass', length:'3.0 m',
  note:'Wire map correct, all pairs intact, length within limits.',
  map:[['1','ok'],['2','ok'],['3','ok'],['4','ok'],['5','ok'],['6','ok'],['7','ok'],['8','ok']]}
};

/* ---------------- data: wifi ---------------- */
const WIFI = [
 {id:'w1', ssid:'LAKESHORE-STAFF', ap:'AP-EAST · 04:bd:88:11:04:a1', band:'2.4 GHz', ch:1, dbm:-50, sec:'WPA3'},
 {id:'w2', ssid:'LAKESHORE-STAFF', ap:'AP-WING-B · 04:bd:88:11:05:9c', band:'2.4 GHz', ch:3, dbm:-58, sec:'WPA3'},
 {id:'w3', ssid:'LAKESHORE-GUEST', ap:'AP-GST · 04:bd:88:11:02:77', band:'2.4 GHz', ch:11, dbm:-63, sec:'WPA2'},
 {id:'w4', ssid:'EastsideFlats-Free', ap:'neighbor · 9c:3d:cf:2a:11:b0', band:'2.4 GHz', ch:6, dbm:-72, sec:'Open'},
 {id:'w5', ssid:'LAKESHORE-STAFF', ap:'AP-EAST · 04:bd:88:11:04:a2', band:'5 GHz', ch:36, dbm:-55, sec:'WPA3'},
 {id:'w6', ssid:'LAKESHORE-IOT', ap:'UNKNOWN · d8:07:b6:43:e9:12', band:'2.4 GHz', ch:8, dbm:-66, sec:'Open'}
];

/* ---------------- data: pairing (hard) ---------------- */
const PAIRS = [
 {sid:'s1', symptom:'Internal name lookups leaving to an unknown DNS server', tool:'Protocol analyzer'},
 {sid:'s2', symptom:'One drop fails intermittently; continuity passes on all pins', tool:'Wire-map tester with split-pair detection'},
 {sid:'s3', symptom:'Two APs broadcasting on overlapping 2.4 GHz channels', tool:'Wi-Fi analyzer'},
 {sid:'s4', symptom:'Trace one cable to its port in a full patch panel', tool:'Tone generator and probe'},
 {sid:'s5', symptom:'Measure the distance to a break inside a wall run', tool:'TDR (time-domain reflectometer)'}
];

/* ---------------- data: method steps (hard) ---------------- */
const STEPS = [
 {id:'st1', txt:'Identify the problem — gather information, question users, duplicate it, note changes'},
 {id:'st2', txt:'Establish a theory of probable cause — question the obvious first'},
 {id:'st3', txt:'Test the theory to determine the actual cause'},
 {id:'st4', txt:'Establish a plan of action to resolve the problem'},
 {id:'st5', txt:'Implement the solution — or escalate if it is not yours to fix'},
 {id:'st6', txt:'Verify full system functionality and apply preventive measures'},
 {id:'st7', txt:'Document findings, actions, outcomes and lessons learned'}
];

/* ---------------- data: objectives ---------------- */
const OBJ = {
 'm-div':    {mode:'medium', pillar:'P2', topic:'Methodology', title:'Run the divergence check',
   goto:'#briefing', form:'divForm',
   fbOk:'Divergence done right: you kept three live hypotheses (DNS, RF, cabling) that each match one symptom, and killed the ones the evidence does not support — an ISP outage would not be this isolated, a portal certificate matches nothing here, and DHCP exhaustion contradicts stations that hold working addresses.',
   fbBad:'Not the supported set. Supported: DNS misconfiguration (billing), RF channel overlap (east wing), faulty copper termination (reception). An ISP outage would hit everyone at once, a portal certificate has no link to any symptom, and DHCP exhaustion contradicts PCs that clearly hold working leases.'},
 'm-met':    {mode:'medium', pillar:'P1', topic:'Analyzer', title:'Match the analyzer metaphor',
   goto:'#metCard', form:'metForm',
   fbOk:'Exactly — a protocol analyzer watches what flows inside without stopping the patient. Receptionists decide entry (that is firewalls/routing), janitors clean (maintenance), billing charges (accounting).',
   fbBad:'The imaging scanner is the metaphor: an analyzer observes traffic passively, without interrupting it. Receptionists decide who enters (routing/firewall), janitors clean (maintenance), billing charges (accounting) — none of those watch flow.'},
 'm-ipconfig':{mode:'medium', pillar:'P3', topic:'DNS & CLI', title:'Inspect local IP configuration', auto:true, goto:'#panelTerm',
   fbOk:'You read the config like a tech: DHCP is off on this station and the DNS server is 203.0.113.53 — an external, ISP-era address. Internal resolution was never going to work through it.'},
 'm-pingpair':{mode:'medium', pillar:'P1', topic:'DNS & CLI', title:'Split reachability from name resolution', auto:true, goto:'#panelTerm',
   fbOk:'The classic divide: ping to 10.20.40.20 succeeds (the path and the file server are fine) while ping to the name fails. Connectivity works; name resolution does not. That is understanding, not button-pressing.'},
 'm-nslookup':{mode:'medium', pillar:'P3', topic:'DNS & CLI', title:'Query DNS the way the workstation does', auto:true, goto:'#panelTerm',
   fbOk:'nslookup named the culprit: every query goes to 203.0.113.53, which answers NXDOMAIN for the internal zone. The server the workstation uses is the server that answers.'},
 'm-dnsfix': {mode:'medium', pillar:'P4', topic:'DNS & CLI', title:'Identify the name-resolution root cause', goto:'#dnsForm', form:'dnsForm',
   fbOk:'Root cause confirmed: a stale, external, statically-set DNS server. Nothing is wrong with the file server, the gateway, or the cable.',
   fbBad:'Re-read the ipconfig /all output: DNS Servers reads 203.0.113.53 — an external, retired-ISP address set statically. The file server answers pings by IP (so it is online), the gateway answers (so routing is fine), and a split pair would not selectively break names.'},
 'm-capture':{mode:'medium', pillar:'P3', topic:'Analyzer', title:'Capture and expose the rogue DNS exchange', auto:true, goto:'#panelAnalyzer',
   fbOk:'Capture, filter, inspect: frame p3 shows the A query for filesrv.lakeshore.local leaving for 203.0.113.53 and p4 shows NXDOMAIN coming back. That is packet-level proof of the wrong resolver.'},
 'm-c1':     {mode:'medium', pillar:'P2', topic:'Cabling', title:'Diagnose patch cable C1', goto:'#c1Form', form:'c1Form',
   fbOk:'Right: continuity passed but the tester flagged a split pair on pins 3–6. Crosstalk from the split pair is why the reception phone sounds robotic.',
   fbBad:'Look again at the verdict line: all pins show continuity (so not an open), no pins are shorted, and 1.8 m is nowhere near the length limit. The tester explicitly says SPLIT PAIR on 3–6.'},
 'm-c2':     {mode:'medium', pillar:'P2', topic:'Cabling', title:'Diagnose wall run C2', goto:'#c2Form', form:'c2Form',
   fbOk:'Right: the map is clean but the run measures 118.4 m — past the 100 m copper channel limit. Length, not termination, is the fault.',
   fbBad:'Check the tester readout again: the wire map is correct and nothing is open or shorted. The defect is the length line — 118.4 m exceeds the 100 m channel limit.'},
 'm-overlap':{mode:'medium', pillar:'P2', topic:'Wireless', title:'Spot the overlapping APs', goto:'#overlapForm', form:'overlapForm',
   fbOk:'AP-EAST on channel 1 and AP-WING-B on channel 3 overlap — 20 MHz-wide channels are five numbers apart, so 1 and 3 collide. The guest AP (11), the neighbor (6, and weak) and the 5 GHz radio are not part of the collision.',
   fbBad:'Not that pair. The collision is AP-EAST (ch 1) with AP-WING-B (ch 3): channels 1–5 overlap. Ch 11 is separated from both; the neighbor on ch 6 is weak (−72 dBm); and the 5 GHz radio is a different band entirely.'},
 'm-ch6':    {mode:'medium', pillar:'P4', topic:'Wireless', title:'Re-plan the east wing channel', goto:'#chanForm', form:'chanForm',
   fbOk:'Channel 6 is the clean lane: 1 is taken by AP-EAST, 3 is the problem itself, and 11 is taken by the guest AP — while the only ch-6 neighbor is weak at −72 dBm.',
   fbBad:'Rethink it: channel 1 is occupied by AP-EAST, channel 3 is the interference you are escaping, channel 11 is occupied by the guest AP. Channel 6 has only a weak neighbor (−72 dBm) — the cleanest available lane.'},
 'm-remediate':{mode:'medium', pillar:'P4', topic:'DNS & CLI', title:'Choose the correct remediation', goto:'#remForm', form:'remForm',
   fbOk:'Correct remediation: restore the internal resolver 10.20.40.10 and hand settings back to DHCP. Swapping cables, rebooting the ISP modem and adding routes do not touch a stale resolver.',
   fbBad:'The defect is a resolver setting, not hardware: the cable is fine (the PC reaches the server by IP), the ISP modem is irrelevant, and a static route cannot fix name lookup. Restore DNS 10.20.40.10 and prefer DHCP.'},
 'h-pair':   {mode:'hard', pillar:'P2', topic:'Tools', title:'Match five symptoms to five instruments', goto:'#panelPair',
   fbOk:'All five matched: capture to watch conversations, wire-map with split-pair detection for that sneaky drop, Wi-Fi analyzer for RF overlap, tone and probe to trace, TDR to measure distance to a fault.',
   fbBad:'Not every pair landed. Watch the verbs: watch = analyzer; test one suspicious drop = wire-map tester; survey channels = Wi-Fi analyzer; trace in a bundle = tone generator and probe; measure distance to a break = TDR.'},
 'h-steps':  {mode:'hard', pillar:'P1', topic:'Methodology', title:'Rebuild the 7-step method in order', goto:'#panelSteps',
   fbOk:'Full method, in order — from divergence in step 1 to documentation in step 7. This is the sequence the exam expects.',
   fbBad:'The official order is: identify → establish theory → test the theory → plan of action → implement (or escalate) → verify and prevent → document. Rebuild the board and try again.'},
 'h-dig':    {mode:'hard', pillar:'P3', topic:'DNS & CLI', title:'Interrogate the internal DNS server directly', auto:true, goto:'#panelTerm',
   fbOk:'Querying 10.20.40.10 directly returns the answer in milliseconds — proving the internal service was never the problem. The workstation was simply never asking it.'},
 'h-ttl':    {mode:'hard', pillar:'P3', topic:'DNS & CLI', title:'Fingerprint the DNS server OS', goto:'#ttlForm', form:'ttlForm',
   fbOk:'TTL 64 on the reply means the stack started with an initial TTL of 64 — the Unix-like default. Windows hosts ship with 128.',
   fbBad:'Reply TTL 64 with no hops in between means the host SENT 64 — the Unix-like initial default. Windows starts at 128; hop counts and ICMP policy are red herrings here.'},
 'h-retrans':{mode:'hard', pillar:'P3', topic:'Analyzer', title:'Classify the VoIP transport anomaly', goto:'#retransForm', form:'retransForm',
   fbOk:'Retransmissions mean the original SYNs were lost and TCP re-sent them — a reliability problem on the path to the PBX, consistent with the split-pair crosstalk found in reception.',
   fbBad:'Those repeated frames are TCP doing its job: the original SYN was lost, so it re-sends. That is packet loss (a reliability problem), not ARP behavior, not a scan, and DNS is nowhere in those frames.'},
 'h-pins':   {mode:'hard', pillar:'P2', topic:'Cabling', title:'Recall the T568B pair boundaries', goto:'#pinsForm', form:'pinsForm',
   fbOk:'Pins 3 and 6 form the green pair in T568B — the pair boundaries are 1-2, 3-6, 4-5, 7-8, which is exactly where a split pair hides.',
   fbBad:'T568B pairs are 1-2 (orange), 3-6 (green), 4-5 (blue), 7-8 (brown). Pin 3 pairs with 6, not with its neighbor — that misconception is what creates split pairs in the field.'},
 'h-voice':  {mode:'hard', pillar:'P2', topic:'Wireless', title:'Apply the −67 dBm voice threshold', goto:'#voiceForm', form:'voiceForm',
   fbOk:'Reception at −71 dBm is below the −67 dBm floor for voice/video — handsets there will degrade first, even where browsing still works.',
   fbBad:'The −67 dBm rule marks the floor for real-time apps. −54, −63 and −58 dBm are all above it; −71 dBm in reception is the only reading below the floor.'},
 'h-plan':   {mode:'hard', pillar:'P4', topic:'Wireless', title:'Design a non-overlapping channel plan', goto:'#planForm', form:'planForm',
   fbOk:'One AP per clean lane: 1, 6 and 11. With 20 MHz-wide channels five apart, that is the only non-overlapping trio in 2.4 GHz.',
   fbBad:'The only non-overlapping 2.4 GHz trio is 1, 6 and 11 (channels are 5 apart, 20 wide). Any other mix keeps the APs talking over each other.'},
 'h-rogue':  {mode:'hard', pillar:'P3', topic:'Wireless', title:'Flag the unauthorized SSID', goto:'#rogueForm', form:'rogueForm',
   fbOk:'LAKESHORE-IOT: an open network with a BSSID that matches nothing in the asset log — a textbook rogue candidate to hand to security.',
   fbBad:'Only LAKESHORE-IOT qualifies: open authentication plus a BSSID absent from the asset log. The neighbor network is external (not yours to flag), and the LAKESHORE networks are accounted for.'}
};
const OBJ_ORDER = {medium:['m-div','m-met','m-ipconfig','m-pingpair','m-nslookup','m-dnsfix','m-capture','m-c1','m-c2','m-overlap','m-ch6','m-remediate'],
                   hard:['h-steps','h-pair','h-dig','h-ttl','h-retrans','h-pins','h-voice','h-plan','h-rogue']};

/* ---------------- data: quiz ---------------- */
/* opts are the authored options; correct is the index into opts (authored rotation) */
const QUIZ = {
 medium: [
  {q:'A workstation reaches servers by IP address but not by hostname. Which command reveals the DNS server it is actually querying?',
   opts:['arp -a','ipconfig /all','netstat -n','route print'], correct:1, topic:'DNS & CLI', align:'Objective m-ipconfig · pillar P3 · N10-009 5.5',
   why:'ipconfig /all lists the configured DNS servers the host actually uses — the fastest way to see which resolver answers.',
   whyNot:['arp -a shows IP-to-MAC bindings only — nothing about resolvers.','netstat -n shows sessions and ports, not DNS configuration.','route print shows the routing table and gateway, not the resolver.']},
  {q:'Ping to 10.20.40.20 succeeds, but ping to filesrv.lakeshore.local fails right away. What does this pair of results narrow the problem to?',
   opts:['the file server itself','the default gateway','a patch cable','name resolution'], correct:3, topic:'DNS & CLI', align:'Objective m-pingpair · pillar P1 · N10-009 5.1',
   why:'Reachability by IP proves the path, gateway and server are fine — only the lookup of the name fails, so the fault is in name resolution.',
   whyNot:['A dead file server would drop the ping by IP too.','The gateway forwarded the successful ICMP — it is working.','A cable fault would break the ping by IP as well.']},
  {q:'A wire-map tester reports continuity on all eight pins but flags a split pair. What symptom fits best?',
   opts:['extra crosstalk and intermittent errors','the run exceeds 100 m','an unlabeled patch panel','PoE failure on all ports'], correct:0, topic:'Cabling', align:'Objective m-c1 · pillar P2 · N10-009 5.2',
   why:'A split pair puts signals on the wrong twisted pairs, so crosstalk rises and errors come and go — while every pin still shows continuity.',
   whyNot:['Length is a separate measurement; a split pair has nothing to do with distance.','Labeling is a documentation problem, not an electrical one.','PoE delivery depends on powered pairs; a split pair degrades data quality, it does not shut down PoE everywhere.']},
  {q:'Which set of 2.4 GHz channels is non-overlapping?',
   opts:['1, 3, 11','2, 6, 10','1, 6, 11','3, 7, 13'], correct:2, topic:'Wireless', align:'Objective m-overlap · pillar P2 · N10-009 5.4',
   why:'20 MHz-wide channels sit 5 numbers apart, so 1, 6 and 11 are the only trio that does not overlap.',
   whyNot:['1 and 3 overlap (channels 1–5 collide).','2 and 6 are fine, but 2 and 10 collide with neighbors — and 2 is inside 1–6 anyway.','3, 7 and 13 are evenly spaced but 13 is not allowed in many regions, and the set still overlaps the others listed.']},
  {q:'A wall run passes continuity but measures 118 m. What is the appropriate fix?',
   opts:['Upgrade to Cat 6a','Relocate the switch closer','Re-punch both connectors','Configure a static route'], correct:1, topic:'Cabling', align:'Objective m-c2 · pillar P2 · N10-009 5.2',
   why:'The 100 m channel limit is physics, not a cable grade. Shortening the run — closer switch or an added IDF — is the real fix.',
   whyNot:['Better cable still attenuates past the limit; Cat 6a does not repeal 100 m.','The connectors already pass continuity — re-punching changes nothing.','Routing is a layer-3 concept and cannot shorten a copper run.']},
  {q:'A capture shows DNS queries for internal names going to 203.0.113.53 and coming back NXDOMAIN. What should you conclude?',
   opts:['The ISP DNS is authoritative for the local zone','The workstation kept a stale external DNS setting','The file server is powered off','DHCP is handing out duplicate IPs'], correct:1, topic:'DNS & CLI', align:'Objective m-capture · pillar P3 · N10-009 5.5',
   why:'Queries for internal names leaving to an external resolver that answers NXDOMAIN is the signature of a stale, external DNS configuration on the client.',
   whyNot:['An external ISP resolver has no authority over your internal zone — that is exactly why it says NXDOMAIN.','The file server is fine: the SMB traffic and the ping-by-IP in the same capture prove it is up.','Nothing in the capture shows duplicate addresses or DHCP activity.']}
 ],
 hard: [
  {q:'A ping reply from 10.20.40.10 arrives with TTL 64. What does that most likely tell you?',
   opts:['It is 64 hops away','It runs Windows by default','It runs a Unix-like OS','It blocks ICMP redirects'], correct:2, topic:'DNS & CLI', align:'Objective h-ttl · pillar P3 · N10-009 5.5',
   why:'There were no intervening hops, so the reply reached you with its initial TTL: 64, the Unix-like default (Windows ships 128).',
   whyNot:['If it were 64 hops away, the sender would have started at a higher initial TTL and the reply would still decrement — 64 hops inside one clinic subnet is not plausible.','Windows hosts start at TTL 128, not 64.','ICMP filtering blocks replies entirely; this reply arrived with a TTL.']},
  {q:'In a T568B termination, which pins must land on one twisted pair?',
   opts:['Pins 3 and 6','Pins 3 and 4','Pins 5 and 6','Pins 1 and 3'], correct:0, topic:'Cabling', align:'Objective h-pins · pillar P2 · N10-009 5.2',
   why:'Pair 3 is pins 3–6 (the green pair). The boundaries 1-2, 3-6, 4-5, 7-8 are exactly where split pairs hide.',
   whyNot:['Punching 3 with 4 is the classic field error that CREATES a split pair.','5 pairs with 4 (the blue pair), not with 6.','1 pairs with 2 (orange); pairing 1 with 3 splits the orange and green pairs.']},
  {q:'A site survey reads −71 dBm in reception. What does that mean for VoIP handsets there?',
   opts:['Signal is stronger than −50 dBm','Calls get studio-grade quality','Below the −67 dBm voice threshold','The AP must be on channel 11'], correct:2, topic:'Wireless', align:'Objective h-voice · pillar P2 · N10-009 5.4',
   why:'−67 dBm is the commonly cited floor for voice and video. −71 dBm is below it, so calls there degrade first.',
   whyNot:['−71 is weaker than −50 (closer to zero is stronger).','Below the voice threshold, calls stutter and drop — not studio grade.','Channel choice is independent of this reading; the survey says nothing about channels.']},
  {q:'The capture shows several [TCP Retransmission] frames toward the PBX. What do they indicate?',
   opts:['An ARP flooding storm','Lost packets being re-sent','A closed PBX port','Slow DNS relay lookups'], correct:1, topic:'Analyzer', align:'Objective h-retrans · pillar P3 · N10-009 5.4/5.5',
   why:'TCP retransmits when the original frame is never acknowledged — repeated retransmissions mean packet loss on that path.',
   whyNot:['ARP storms are built from ARP frames; these are TCP frames toward port 5060.','A closed PBX port answers with RST — a reset does not produce retransmissions.','DNS rides port 53; these frames target 5060 and retransmissions say nothing about lookups.']},
  {q:'Which tool pairs a tone with a wand to locate one cable in a bundle?',
   opts:['Tone generator and probe','A digital multimeter kit','A punch-down impact tool','An OTDR test unit'], correct:0, topic:'Tools', align:'Objective h-pair · pillar P2 · N10-009 5.5',
   why:'The tone generator injects a signal; the inductive probe (wand) finds the cable carrying it — the standard way to trace one cable in a bundle.',
   whyNot:['A digital multimeter kit measures voltage, resistance and continuity — it cannot find one cable in a bundle.','A punch-down impact tool terminates wires to a block; it does not trace them.','An OTDR test unit characterizes fiber, not copper bundles in a closet.']},
  {q:'Which hardware tool measures the distance to a cable fault in copper?',
   opts:['OTDR','Spectrum analyzer','TDR','Cable crimper'], correct:2, topic:'Tools', align:'Objective h-pair · pillar P2 · N10-009 5.5',
   why:'A time-domain reflectometer bounces a pulse down copper and reads the reflection — giving the distance to opens, shorts and splits.',
   whyNot:['OTDR is the fiber equivalent, not copper.','A spectrum analyzer surveys RF airtime, not cable distance.','A crimper attaches connectors; it measures nothing.']},
  {q:'802.3af PoE Mode B delivers power over which pins?',
   opts:['1, 2, 3, 6','4, 5, 7, 8','Only the shield','7 and 8 only'], correct:1, topic:'Cabling', align:'Objective h-pins · pillar P2 · N10-009 5.2',
   why:'Mode B applies power to the spare pairs — 4, 5, 7 and 8 — while data rides 1, 2, 3 and 6.',
   whyNot:['1, 2, 3, 6 carry data (and power in Mode A, not Mode B).','The shield is for grounding, never PoE.','Two pins cannot carry the pair-based power feed — Mode B uses both spare pairs.']}
 ]
};

/* ---------------- data: wire-map pin colors (cable tester presentation) ---------------- */
const PINCOL = {1:'#F09A5A',2:'#F09A5A',3:'#7FD69A',4:'#7FB2E5',5:'#7FB2E5',6:'#7FD69A',7:'#B49BE0',8:'#B49BE0'};
